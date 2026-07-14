#!/usr/bin/env node

/**
 * cv-trim.mjs — relevance-weighted CV trimming (Milestone 3).
 *
 * Owns the content-trim rung of the overflow ladder: when a built CV renders
 * over the page cap, cut the single least-valuable Experience/Project bullet,
 * rebuild, re-render, re-measure — one bullet at a time, because page count
 * responds non-linearly to cuts. Terminal states are reported honestly:
 * `converged`, `exhausted` (nothing left that is allowed to be cut), or
 * `max-iterations`.
 *
 * What can NEVER be cut (structural, not a filter):
 *   - publications / education / skills / certifications / competencies /
 *     summary — collectCandidates() only ever iterates experience[].bullets
 *     and projects[].bullets, so no code path can shorten the rest.
 *   - the last remaining bullet of any entry (an empty role reads broken).
 *
 * Scoring (per bullet, recomputed every iteration over the remaining pool):
 *   R (relevance)  = 3·|tokens ∩ JD-keyword tokens| + 1·|tokens ∩ JD-body tokens|
 *                    (tokenize/STOPWORDS reused from match-star.mjs — no third
 *                    tokenizer; keywords come from the payload/CLI, never
 *                    re-derived here)
 *   U (uniqueness) = 1 − max Jaccard(bullet tokens, any other remaining bullet)
 *                    (redundant evidence is safe to cut; unique evidence is not)
 *   D (dependency) = true when an approved cover letter's achievements[] leans
 *                    on this bullet (substring either way, or Jaccard ≥ 0.5)
 *   composite      = 0.7·normalize(R) + 0.3·U — cut the lowest, exhausting
 *                    D=false bullets first; a D=true cut is flagged loudly so
 *                    the letter can be revised.
 *
 * Usage:
 *   node cv-trim.mjs <payload.json> --format=html|latex --max-pages=N --out=<pdf>
 *       [--paper=letter|a4] [--src=<path.html|.tex>] [--jd-keywords=k1,k2,...]
 *       [--jd-text=<file>] [--achievements=<cover-payload.json>]
 *       [--write-payload=<path>] [--max-iterations=N] [--rasterize]
 *   node cv-trim.mjs --test | --self-test
 *
 * Output contract: stdout carries exactly one JSON report (machine-readable);
 * all progress goes to stderr. Exit 0 for every honest terminal state
 * (converged or not — overflow is a signal, not a failure, mirroring
 * generate-pdf.mjs), 1 for operational errors, 2 for usage errors.
 *
 * Format notes: --format=html renders via generate-pdf.mjs's exported
 * renderHtmlToPdf (dynamic import — Playwright loads only on this path) with
 * updateManifest:false so iterations never pollute data/pdf-index.tsv.
 * --format=latex shells out to generate-latex.mjs and needs tectonic/pdflatex
 * on PATH plus poppler for page counting.
 */

import { readFileSync, writeFileSync, mkdtempSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname, join, basename } from 'path';
import { tmpdir } from 'os';
import { execFileSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import { tokenize, STOPWORDS } from './match-star.mjs';
import {
  detectPdftotext,
  extractPdfText,
  countPagesFromExtractedText,
  checkKeywordCoverage,
  rasterizePages,
} from './pdf-text.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Pure scoring pieces (exported for --self-test and reuse) ────────────────

/** Lowercase, strip non-alphanumerics, collapse whitespace. */
export function normalizeForMatch(text) {
  if (typeof text !== 'string') return '';
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/** match-star tokenize + stopword filter → content-bearing tokens. */
export function contentTokens(text) {
  if (typeof text !== 'string') return [];
  return tokenize(text).filter((t) => !STOPWORDS.has(t));
}

/** Set-based Jaccard ratio; empty union → 0. */
export function jaccard(aSet, bSet) {
  if (!(aSet instanceof Set)) aSet = new Set(aSet);
  if (!(bSet instanceof Set)) bSet = new Set(bSet);
  if (aSet.size === 0 && bSet.size === 0) return 0;
  let inter = 0;
  for (const t of aSet) if (bSet.has(t)) inter++;
  return inter / (aSet.size + bSet.size - inter);
}

/**
 * Cuttable bullets of the CURRENT working payload.
 * Only experience[].bullets and projects[].bullets are ever iterated —
 * publications/education/skills/certifications/competencies/summary are
 * structurally invisible here. Entries down to their final bullet are
 * protected (skipped entirely).
 */
export function collectCandidates(payload) {
  const out = [];
  for (const section of ['experience', 'projects']) {
    const entries = payload?.[section];
    if (!Array.isArray(entries)) continue;
    entries.forEach((e, entryIndex) => {
      if (!e || !Array.isArray(e.bullets)) return;
      if (e.bullets.length <= 1) return; // last-bullet protection
      e.bullets.forEach((text, bulletIndex) => {
        if (typeof text !== 'string' || !text.trim()) return;
        out.push({ section, entryIndex, bulletIndex, text });
      });
    });
  }
  return out;
}

/**
 * Score every candidate. kwTokens/bodyTokens are Sets of content tokens;
 * achievementTexts is an array of raw cover-letter achievement strings.
 * Returns candidates decorated with {relevance, uniqueness, coverDependent,
 * composite}.
 */
export function scoreCandidates(candidates, { kwTokens, bodyTokens, achievementTexts = [] } = {}) {
  const kw = kwTokens instanceof Set ? kwTokens : new Set(kwTokens || []);
  const body = bodyTokens instanceof Set ? bodyTokens : new Set(bodyTokens || []);
  const achNorm = achievementTexts.map((a) => normalizeForMatch(a)).filter(Boolean);
  const achTokenSets = achievementTexts.map((a) => new Set(contentTokens(a)));

  const withTokens = candidates.map((c) => ({ ...c, _tokens: new Set(contentTokens(c.text)) }));

  let maxR = 0;
  for (const c of withTokens) {
    let kwHits = 0;
    let bodyHits = 0;
    for (const t of c._tokens) {
      if (kw.has(t)) kwHits++;
      if (body.has(t)) bodyHits++;
    }
    c.relevance = 3 * kwHits + 1 * bodyHits;
    if (c.relevance > maxR) maxR = c.relevance;
  }

  for (const c of withTokens) {
    // Uniqueness vs every OTHER remaining bullet (cross-entry included).
    let maxSim = 0;
    for (const other of withTokens) {
      if (other === c) continue;
      const sim = jaccard(c._tokens, other._tokens);
      if (sim > maxSim) maxSim = sim;
    }
    c.uniqueness = withTokens.length > 1 ? 1 - maxSim : 1;

    // Cover-letter dependency.
    const nb = normalizeForMatch(c.text);
    c.coverDependent = achNorm.some((na, i) => {
      if (!na) return false;
      if (nb.includes(na) || na.includes(nb)) return true;
      return jaccard(c._tokens, achTokenSets[i]) >= 0.5;
    });

    const rNorm = maxR > 0 ? c.relevance / maxR : 0;
    c.composite = 0.7 * rNorm + 0.3 * c.uniqueness;
  }

  return withTokens.map(({ _tokens, ...rest }) => rest);
}

/**
 * Pick the bullet to cut: lowest composite among D=false first; only when no
 * free bullet remains fall into D=true (tier reported so the caller can warn).
 * Tie-break: longer text first (reclaims more space).
 */
export function pickCut(scored) {
  if (!Array.isArray(scored) || scored.length === 0) return null;
  const free = scored.filter((c) => !c.coverDependent);
  const pool = free.length > 0 ? free : scored;
  const tier = free.length > 0 ? 'free' : 'cover-dependent';
  const sorted = [...pool].sort(
    (a, b) => a.composite - b.composite || b.text.length - a.text.length
  );
  return { candidate: sorted[0], tier };
}

// ── Build / render / measure ────────────────────────────────────────────────

function runNodeScript(scriptPath, args) {
  return execFileSync(process.execPath, [scriptPath, ...args], {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function buildSource(format, payloadPath, srcPath) {
  const builder = resolve(__dirname, format === 'latex' ? 'build-cv-latex.mjs' : 'build-cv-html.mjs');
  runNodeScript(builder, [payloadPath, srcPath]); // throws on non-zero exit
}

async function renderAndCount(format, srcPath, outPath, paper) {
  if (format === 'latex') {
    let stdout;
    try {
      stdout = runNodeScript(resolve(__dirname, 'generate-latex.mjs'), [srcPath, outPath]);
    } catch (err) {
      const detail = (err.stdout || err.stderr || err.message || '').toString().trim();
      throw new Error(
        `LaTeX compile failed (generate-latex.mjs). The latex trim loop needs tectonic or pdflatex on PATH. Detail: ${detail.slice(0, 400)}`
      );
    }
    let report = {};
    try {
      report = JSON.parse(stdout);
    } catch {
      /* fall through to the pages check below */
    }
    if (!Number.isInteger(report.pages)) {
      throw new Error(
        'generate-latex.mjs compiled but reported no page count — install poppler (pdftotext) so the trim loop can measure pages.'
      );
    }
    return report.pages;
  }

  // html: dynamic import keeps Playwright out of --self-test and latex runs.
  const { renderHtmlToPdf, normalizeTextForATS } = await import('./generate-pdf.mjs');
  let html = readFileSync(srcPath, 'utf-8');
  html = normalizeTextForATS(html).html; // pipeline-equivalent output
  // renderHtmlToPdf logs its progress via console.log; reroute that to stderr
  // for the duration of the call so this script's stdout stays pure JSON
  // (the machine contract documented in the header).
  const origLog = console.log;
  console.log = (...a) => console.error(...a);
  let result;
  try {
    result = await renderHtmlToPdf(html, outPath, {
      format: paper,
      baseDir: dirname(srcPath),
      inputPath: srcPath,
      updateManifest: false, // NEVER let trim iterations touch data/pdf-index.tsv
    });
  } finally {
    console.log = origLog;
  }
  if (detectPdftotext()) {
    const extracted = extractPdfText(outPath);
    if (extracted.available) return countPagesFromExtractedText(extracted.text);
  }
  return result.pageCount; // approximate fallback (PDF-structure regex)
}

// ── CLI ─────────────────────────────────────────────────────────────────────

function usage(msg) {
  if (msg) console.error(`cv-trim: ${msg}`);
  console.error(
    'Usage: node cv-trim.mjs <payload.json> --format=html|latex --max-pages=N --out=<pdf> [--paper=letter|a4] [--src=<path>] [--jd-keywords=k1,k2,...] [--jd-text=<file>] [--achievements=<cover-payload.json>] [--write-payload=<path>] [--max-iterations=N] [--rasterize]'
  );
  process.exit(2);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--test') || args.includes('--self-test')) {
    runSelfTest();
    return;
  }

  let payloadPath = null;
  let format = null;
  let paper = 'a4';
  let maxPages = null;
  let outPath = null;
  let srcPath = null;
  let kwArg = null;
  let jdTextFile = null;
  let achievementsPath = null;
  let writePayloadPath = null;
  let maxIterations = 25;
  let doRasterize = false;

  for (const arg of args) {
    if (arg.startsWith('--format=')) format = arg.split('=')[1];
    else if (arg.startsWith('--paper=')) paper = arg.split('=')[1].toLowerCase();
    else if (arg.startsWith('--max-pages=')) maxPages = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--out=')) outPath = arg.slice('--out='.length);
    else if (arg.startsWith('--src=')) srcPath = arg.slice('--src='.length);
    else if (arg.startsWith('--jd-keywords=')) kwArg = arg.slice('--jd-keywords='.length);
    else if (arg.startsWith('--jd-text=')) jdTextFile = arg.slice('--jd-text='.length);
    else if (arg.startsWith('--achievements=')) achievementsPath = arg.slice('--achievements='.length);
    else if (arg.startsWith('--write-payload=')) writePayloadPath = arg.slice('--write-payload='.length);
    else if (arg.startsWith('--max-iterations=')) maxIterations = parseInt(arg.split('=')[1], 10);
    else if (arg === '--rasterize') doRasterize = true;
    else if (arg === '--help') usage();
    else if (!arg.startsWith('--') && !payloadPath) payloadPath = arg;
    else usage(`unknown argument "${arg}"`);
  }

  if (!payloadPath) usage('missing <payload.json>');
  if (format !== 'html' && format !== 'latex') usage('--format must be html or latex');
  if (!Number.isInteger(maxPages) || maxPages < 1) usage('--max-pages must be a positive integer');
  if (!outPath) usage('missing --out=<pdf>');
  if (!/\.pdf$/i.test(outPath)) usage('--out must end in .pdf');
  if (!['a4', 'letter'].includes(paper)) usage('--paper must be letter or a4');
  if (!Number.isInteger(maxIterations) || maxIterations < 1) usage('--max-iterations must be a positive integer');

  payloadPath = resolve(payloadPath);
  outPath = resolve(outPath);
  if (!existsSync(payloadPath)) usage(`payload not found: ${payloadPath}`);

  let payload;
  try {
    payload = JSON.parse(readFileSync(payloadPath, 'utf-8'));
  } catch (err) {
    console.error(`cv-trim: failed to parse payload JSON: ${err.message}`);
    process.exit(1);
  }

  // Keywords: CLI wins, else payload.jd.keywords. Refuse to trim blind —
  // without a relevance signal, "least relevant bullet" is meaningless.
  const kwList = kwArg
    ? kwArg.split(',').map((k) => k.trim()).filter(Boolean)
    : Array.isArray(payload?.jd?.keywords)
      ? payload.jd.keywords.filter((k) => typeof k === 'string' && k.trim())
      : [];
  if (kwList.length === 0) {
    usage('no JD keywords — pass --jd-keywords=... or set payload.jd.keywords (trimming without a relevance signal is refused)');
  }
  const kwTokens = new Set(kwList.flatMap((k) => contentTokens(k)));

  let jdText = typeof payload?.jd?.text === 'string' ? payload.jd.text : '';
  if (jdTextFile) {
    try {
      jdText = readFileSync(resolve(jdTextFile), 'utf-8');
    } catch (err) {
      console.error(`cv-trim: cannot read --jd-text file: ${err.message}`);
      process.exit(1);
    }
  }
  const bodyTokens = new Set(contentTokens(jdText));

  let achievementTexts = [];
  if (achievementsPath) {
    try {
      const cover = JSON.parse(readFileSync(resolve(achievementsPath), 'utf-8'));
      const list = Array.isArray(cover?.letter?.achievements)
        ? cover.letter.achievements
        : Array.isArray(cover)
          ? cover
          : [];
      achievementTexts = list
        .map((a) => (typeof a === 'string' ? a : [a?.lead, a?.impact].filter(Boolean).join(' ')))
        .filter(Boolean);
    } catch (err) {
      console.error(`cv-trim: cannot read --achievements file: ${err.message}`);
      process.exit(1);
    }
  }

  if (!srcPath) srcPath = outPath.replace(/\.pdf$/i, '') + (format === 'latex' ? '.tex' : '.html');
  srcPath = resolve(srcPath);
  if (!writePayloadPath) writePayloadPath = outPath.replace(/\.pdf$/i, '') + '-trimmed-payload.json';
  writePayloadPath = resolve(writePayloadPath);
  mkdirSync(dirname(outPath), { recursive: true });
  mkdirSync(dirname(srcPath), { recursive: true });

  const working = JSON.parse(JSON.stringify(payload));
  const pubsBefore = Array.isArray(payload.publications) ? payload.publications.length : 0;
  const tmpDir = mkdtempSync(join(tmpdir(), 'career-ops-cv-trim-'));
  const tmpPayload = join(tmpDir, 'payload.json');

  const cuts = [];
  let iterations = 0;
  let initialPages = null;
  let pages = null;
  let reason = null;
  let coverDependentCut = false;

  while (true) {
    writeFileSync(tmpPayload, JSON.stringify(working, null, 2), 'utf-8');
    try {
      buildSource(format, tmpPayload, srcPath);
    } catch (err) {
      const detail = (err.stdout || err.stderr || err.message || '').toString().trim();
      console.error(`cv-trim: build failed: ${detail.slice(0, 400)}`);
      process.exit(1);
    }
    try {
      pages = await renderAndCount(format, srcPath, outPath, paper);
    } catch (err) {
      console.error(`cv-trim: ${err.message}`);
      process.exit(1);
    }
    iterations++;
    if (initialPages === null) initialPages = pages;
    console.error(`[cv-trim] render ${iterations}: ${pages} page(s) vs cap ${maxPages}`);

    if (pages <= maxPages) {
      reason = 'converged';
      break;
    }
    if (iterations >= maxIterations) {
      reason = 'max-iterations';
      break;
    }

    const candidates = collectCandidates(working);
    if (candidates.length === 0) {
      reason = 'exhausted';
      break;
    }

    const scored = scoreCandidates(candidates, { kwTokens, bodyTokens, achievementTexts });
    const pick = pickCut(scored);
    const c = pick.candidate;
    if (pick.tier === 'cover-dependent') {
      coverDependentCut = true;
      console.error(
        '[cv-trim] ⚠️  no cover-letter-independent bullets left — cutting a bullet the approved letter leans on; revise the letter afterwards.'
      );
    }
    working[c.section][c.entryIndex].bullets.splice(c.bulletIndex, 1);
    cuts.push({
      iteration: iterations,
      section: c.section,
      entryIndex: c.entryIndex,
      bulletIndex: c.bulletIndex,
      relevance: c.relevance,
      uniqueness: Number(c.uniqueness.toFixed(3)),
      composite: Number(c.composite.toFixed(3)),
      coverDependent: c.coverDependent,
      text: c.text,
    });
    console.error(
      `[cv-trim] cut ${c.section}[${c.entryIndex}].bullets[${c.bulletIndex}] (R=${c.relevance}, U=${c.uniqueness.toFixed(2)}, ${c.coverDependent ? 'COVER-DEPENDENT' : 'free'}): "${c.text.slice(0, 80)}${c.text.length > 80 ? '…' : ''}"`
    );
  }

  const report = {
    converged: reason === 'converged',
    reason,
    iterations,
    pagesInitial: initialPages,
    pagesFinal: pages,
    maxPages,
    format,
    paper: format === 'html' ? paper : undefined,
    cuts,
    coverDependentCut,
    publicationsCount: {
      before: pubsBefore,
      after: Array.isArray(working.publications) ? working.publications.length : 0,
    },
    pdf: outPath,
    source: srcPath,
    trimmedPayload: null,
  };

  if (cuts.length > 0) {
    writeFileSync(writePayloadPath, JSON.stringify(working, null, 2), 'utf-8');
    report.trimmedPayload = writePayloadPath;
  }

  if (reason === 'exhausted') {
    console.error(
      '[cv-trim] exhausted: every cuttable Experience/Project bullet is gone (each entry keeps its last bullet; Publications/Education/Skills are never touched). Escape hatch: raise cv.max_pages in config/profile.yml or accept the page count.'
    );
  }

  if (detectPdftotext()) {
    const extracted = extractPdfText(outPath);
    if (extracted.available) {
      report.textVerification = {
        available: true,
        keywordCoverage: checkKeywordCoverage(extracted.text, kwList),
      };
    }
  }
  if (doRasterize) {
    const raster = rasterizePages(outPath);
    if (raster.available) report.rasterizedPages = raster.files;
  }

  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

// ── Self-test (pure functions only — no poppler, no Playwright) ─────────────

function runSelfTest() {
  let failures = 0;
  const check = (label, cond) => {
    if (!cond) {
      console.error(`FAIL ${label}`);
      failures++;
    }
  };

  const fixture = {
    summary: 'A summary that must never be cut.',
    competencies: ['XPS', 'TEM'],
    experience: [
      {
        company: 'A Corp',
        bullets: [
          'Ran depth-profiled XPS and TEM analysis of cathode surfaces',
          'Ran depth-profiled XPS and TEM analysis of cathode layers',
          'Managed procurement and inventory for the lab',
        ],
      },
      { company: 'Solo Inc', bullets: ['The only bullet of this role'] },
    ],
    projects: [{ name: 'P1', bullets: ['Built a data platform in SQL', 'Automated reporting pipelines'] }],
    education: [{ degree: 'PhD', bullets: ['should never appear'] }],
    skills: [{ category: 'Char', items: ['XPS'] }],
    publications: ['Guo, Z. Paper One.', 'Guo, Z. Paper Two.'],
  };

  // (1) Structural exclusions + last-bullet protection.
  const cands = collectCandidates(fixture);
  check('(1) pool size 5 (3 exp + 2 proj)', cands.length === 5);
  check('(1) no education/publications/skills leak', cands.every((c) => c.section === 'experience' || c.section === 'projects'));
  check('(1) solo entry protected', !cands.some((c) => c.text.includes('only bullet')));
  check('(1) publication text never a candidate', !cands.some((c) => c.text.includes('Paper One')));

  // (2) Relevance ordering: keyword hits (×3) dominate body hits (×1).
  const scored = scoreCandidates(cands, {
    kwTokens: new Set(['xps', 'tem', 'sql']),
    bodyTokens: new Set(['procurement', 'inventory', 'reporting']),
  });
  const byText = (s) => scored.find((c) => c.text.startsWith(s));
  check('(2) XPS/TEM bullet outranks procurement bullet', byText('Ran depth-profiled').relevance > byText('Managed procurement').relevance);
  check('(2) body-only hits score 1× (procurement+inventory=2)', byText('Managed procurement').relevance === 2);
  check('(2) SQL bullet gets 3 (one keyword)', byText('Built a data platform').relevance === 3);

  // (3) Uniqueness: near-duplicate bullets score low U; distinct ones high.
  check('(3) near-duplicates have low uniqueness', byText('Ran depth-profiled XPS and TEM analysis of cathode surfaces').uniqueness < 0.5);
  check('(3) distinct bullet has high uniqueness', byText('Managed procurement').uniqueness > 0.7);

  // (4) Cover dependency: matching achievement flags D=true; free tier wins.
  const scoredDep = scoreCandidates(cands, {
    kwTokens: new Set(['nothing']),
    bodyTokens: new Set(),
    achievementTexts: ['Built a data platform in SQL'],
  });
  const dep = scoredDep.find((c) => c.text.startsWith('Built a data platform'));
  check('(4) achievement-backed bullet flagged coverDependent', dep.coverDependent === true);
  const pick1 = pickCut(scoredDep);
  check('(4) pickCut avoids cover-dependent bullet (free tier)', pick1.tier === 'free' && pick1.candidate.coverDependent === false);

  // (5) All-dependent pool falls through with the tier flagged.
  const allDep = scoredDep.map((c) => ({ ...c, coverDependent: true }));
  const pick2 = pickCut(allDep);
  check('(5) all-dependent pool → cover-dependent tier', pick2.tier === 'cover-dependent');

  // (6) Zero keyword overlap → no NaN, composite driven by uniqueness.
  const zero = scoreCandidates(cands, { kwTokens: new Set(['zzz']), bodyTokens: new Set() });
  check('(6) no NaN composites when maxR=0', zero.every((c) => Number.isFinite(c.composite)));

  // (7) jaccard + normalizeForMatch basics.
  check('(7) jaccard identical sets = 1', jaccard(new Set(['a', 'b']), new Set(['a', 'b'])) === 1);
  check('(7) jaccard disjoint = 0', jaccard(new Set(['a']), new Set(['b'])) === 0);
  check('(7) jaccard empty/empty = 0', jaccard(new Set(), new Set()) === 0);
  check('(7) normalizeForMatch strips punctuation/case', normalizeForMatch('  Led, a $75M-Program! ') === 'led a 75m program');

  // (8) pickCut tie-break prefers the longer text at equal composite.
  const tie = [
    { text: 'short', composite: 0.1, coverDependent: false },
    { text: 'a much longer bullet text here', composite: 0.1, coverDependent: false },
  ];
  check('(8) tie-break cuts longer text first', pickCut(tie).candidate.text.startsWith('a much longer'));

  if (failures > 0) {
    console.error(`\n${failures} self-test(s) FAILED`);
    process.exit(1);
  }
  console.log(JSON.stringify({ status: 'self-test-passed', checks: 17 }, null, 2));
  process.exit(0);
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] || '').href;
if (isMain) {
  main().catch((err) => {
    console.error(`cv-trim: ${err.message}`);
    process.exit(1);
  });
}
