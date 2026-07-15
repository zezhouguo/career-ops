#!/usr/bin/env node

/**
 * generate-latex.mjs — Validate and compile a generated .tex CV file to PDF
 *
 * Usage:
 *   node generate-latex.mjs <input.tex> [output.pdf] [--max-pages=N] [--verify-text] [--jd-keywords=k1,k2,...]
 *   node generate-latex.mjs <input.tex> [output.pdf] --compile-only
 *
 * Default: validates career-ops template structure (from templates/cv-template.tex).
 * --compile-only: skip template validation; compile any user-owned .tex (latex-tex mode).
 *
 * --max-pages=N flags (does not fail compilation on) a PDF that renders to
 * more than N pages — report.overflow is set to true so the caller can
 * decide whether to trim/adjust and recompile.
 *
 * --verify-text runs the ATS text-layer checks from pdf-text.mjs against the
 * compiled PDF (page count, contact info parseable, JD-keyword coverage if
 * --jd-keywords is also given) AND rasterizes each page to PNG (via
 * pdftoppm/pdftocairo) for the calling agent's own visual inspection.
 * Requires `pdftotext`/`pdftoppm` (poppler) on PATH; degrades gracefully
 * (reports unavailable) if missing — never fails compilation over a missing
 * optional tool.
 *
 * Requires: tectonic (preferred) or pdflatex on PATH.
 */

import { readFile, writeFile, stat, copyFile, rm } from 'fs/promises';
import { resolve, basename, dirname, join } from 'path';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import {
  detectPdftotext,
  extractPdfText,
  countPagesFromExtractedText,
  checkContactInfoParseable,
  checkKeywordCoverage,
  rasterizePages,
} from './pdf-text.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Read email/phone from config/profile.yml for the ATS contact-info check —
 * same lightweight line-regex pick as generate-pdf.mjs's readContactFromProfile(),
 * duplicated rather than shared since it's a two-line helper and pulling in
 * a cross-file import for it isn't worth the coupling.
 */
function readContactFromProfile() {
  const profilePath = resolve(__dirname, 'config', 'profile.yml');
  if (!existsSync(profilePath)) return {};
  const raw = readFileSync(profilePath, 'utf-8');
  const pick = (key) => {
    const m = raw.match(new RegExp(`^\\s*${key}:\\s*["']?([^"'\\n]+?)["']?\\s*$`, 'm'));
    return m ? m[1].trim() : '';
  };
  return { email: pick('email'), phone: pick('phone') };
}

const MIN_SECTIONS = 4;

const REQUIRED_COMMANDS = [
  '\\\\resumeSubheading',
  '\\\\resumeItem',
  '\\\\resumeProjectHeading',
];

const CJK_RE = /[぀-ヿ㐀-鿿豈-﫿ｦ-ﾟ가-힯ᄀ-ᇿ]/;

/**
 * @param {string} content
 * @param {boolean} compileOnly
 * @returns {{ issues: string[], counts: object }}
 */
export function validateLatexContent(content, compileOnly) {
  const issues = [];
  let resumeItemCount = 0;
  let subheadingCount = 0;
  let projectHeadingCount = 0;

  if (!content.includes('\\begin{document}')) {
    issues.push('Missing \\begin{document}');
  }
  if (!content.includes('\\end{document}')) {
    issues.push('Missing \\end{document}');
  }

  if (compileOnly) {
    return {
      issues,
      counts: { resumeItems: 0, subheadings: 0, projectHeadings: 0 },
    };
  }

  const sectionCount = (content.match(/\\section\{/g) || []).length;
  if (sectionCount < MIN_SECTIONS) {
    issues.push(`Expected at least ${MIN_SECTIONS} \\section{} blocks (Education, Work Experience, Projects, Skills — or localized equivalents), found ${sectionCount}`);
  }

  if (CJK_RE.test(content)) {
    issues.push('CJK characters detected. The LaTeX template does not support Japanese/Chinese/Korean yet (pdfLaTeX setup with no CJK font). Use `pdf` mode (HTML to PDF, which renders CJK) for these CVs.');
  }

  for (const cmd of REQUIRED_COMMANDS) {
    if (!new RegExp(cmd).test(content)) {
      issues.push(`Missing command: ${cmd}`);
    }
  }

  const unresolvedMatch = content.match(/\{\{[A-Z_]+\}\}/g);
  if (unresolvedMatch) {
    issues.push(`Unresolved placeholders: ${[...new Set(unresolvedMatch)].join(', ')}`);
  }

  const lines = content.split('\n');
  for (const line of lines) {
    if (/\\resumeItem\{/.test(line)) resumeItemCount++;
    if (/\\resumeSubheading(?!Continue)/.test(line)) subheadingCount++;
    if (/\\resumeProjectHeading/.test(line)) projectHeadingCount++;
  }

  if (!content.includes('\\pdfgentounicode=1')) {
    issues.push('Missing \\pdfgentounicode=1 (ATS compatibility)');
  }

  return {
    issues,
    counts: {
      resumeItems: resumeItemCount,
      subheadings: subheadingCount,
      projectHeadings: projectHeadingCount,
    },
  };
}

/**
 * @param {string} absPath
 * @param {string} content
 * @param {string|null} outputPath
 * @param {boolean} compileOnly
 * @param {{maxPages?: number|null, verifyText?: boolean, jdKeywords?: string[]}} [opts]
 *   Optional post-compile verification (M1): page count vs cap, ATS text-layer
 *   checks, rasterization. Additive — omitting opts keeps upstream behavior.
 * @returns {Promise<object>}
 */
export async function compileLatexFile(absPath, content, outputPath, compileOnly, opts = {}) {
  const { maxPages = null, verifyText = false, jdKeywords = [] } = opts;
  const { issues, counts } = validateLatexContent(content, compileOnly);
  const fileInfo = await stat(absPath);
  const sizeKB = (fileInfo.size / 1024).toFixed(1);

  const report = {
    file: basename(absPath),
    path: absPath,
    sizeKB: parseFloat(sizeKB),
    counts,
    issues,
    valid: issues.length === 0,
    compileOnly,
  };

  if (issues.length > 0) {
    return report;
  }

  const texDir = dirname(absPath);
  const texBase = basename(absPath, '.tex');
  const defaultPdf = join(texDir, `${texBase}.pdf`);
  const targetPdf = outputPath ? resolve(outputPath) : defaultPdf;

  const targetDir = dirname(targetPdf);
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  let engine = null;
  for (const candidate of ['tectonic', 'pdflatex']) {
    try {
      execFileSync(candidate, ['--version'], { stdio: 'pipe' });
      engine = candidate;
      break;
    } catch { /* not found */ }
  }

  if (!engine) {
    report.compiled = false;
    report.compileError = 'No LaTeX engine found. Install tectonic (brew install tectonic) or pdflatex.';
    return report;
  }

  report.engine = engine;

  let compilePath = absPath;
  if (engine === 'tectonic') {
    const patched = content
      .replace(/\\pdfgentounicode\s*=\s*\d+[^\n]*\n?/g, '')
      .replace(/\\input\{glyphtounicode\}[^\n]*\n?/g, '');
    compilePath = join(texDir, `${texBase}._tectonic.tex`);
    await writeFile(compilePath, patched, 'utf-8');
  }

  try {
    if (engine === 'tectonic') {
      execFileSync('tectonic', ['--outdir', texDir, compilePath], {
        cwd: texDir,
        stdio: 'pipe',
        timeout: 120_000,
      });
    } else {
      const pdflatexArgs = [
        '-no-shell-escape',
        '-interaction=nonstopmode',
        '-halt-on-error',
        `-output-directory=${texDir}`,
        absPath,
      ];
      execFileSync('pdflatex', pdflatexArgs, { cwd: texDir, stdio: 'pipe', timeout: 120_000 });
      execFileSync('pdflatex', pdflatexArgs, { cwd: texDir, stdio: 'pipe', timeout: 120_000 });
    }

    report.compiled = true;
  } catch (err) {
    const logPath = join(texDir, `${texBase}.log`);
    let latexError = err.message;
    try {
      const log = await readFile(logPath, 'utf-8');
      const errorLines = log.split('\n').filter(l => l.startsWith('!'));
      if (errorLines.length > 0) {
        latexError = errorLines.join('\n');
      }
    } catch { /* no log */ }

    report.compiled = false;
    report.compileError = latexError;
  }

  if (report.compiled) {
    const compileBase = basename(compilePath, '.tex');
    const compiledPdf = join(texDir, `${compileBase}.pdf`);

    try {
      await copyFile(compiledPdf, targetPdf);
      if (resolve(compiledPdf) !== resolve(targetPdf)) {
        await rm(compiledPdf).catch(() => {});
      }

      const pdfStat = await stat(targetPdf);
      report.pdf = {
        path: targetPdf,
        sizeKB: parseFloat((pdfStat.size / 1024).toFixed(1)),
      };

      // First-ever page count for this script (previously computed none at
      // all) — additive-only report fields, so test-all.mjs's existing
      // .issues/.valid reads on this JSON are unaffected. cv-trim.mjs's
      // latex trim loop depends on report.pages.
      if (!detectPdftotext()) {
        if (verifyText) {
          console.error('pdftotext (poppler) not on PATH — skipping page count and ATS text-layer checks. Install with `brew install poppler` (macOS) or `apt install poppler-utils` (Debian/Ubuntu).');
        }
        report.textVerification = { available: false };
      } else {
        const extracted = extractPdfText(targetPdf);
        if (extracted.available) {
          report.pages = countPagesFromExtractedText(extracted.text);
          if (maxPages !== null) {
            report.overflow = report.pages > maxPages;
          }
          if (verifyText) {
            const textVerification = { available: true };
            textVerification.contact = checkContactInfoParseable(extracted.text, readContactFromProfile());
            if (jdKeywords.length > 0) {
              textVerification.keywordCoverage = checkKeywordCoverage(extracted.text, jdKeywords);
            }
            report.textVerification = textVerification;

            const raster = rasterizePages(targetPdf);
            report.rasterizedPages = raster.available ? raster.files : [];
          }
        } else {
          report.textVerification = { available: false, error: extracted.error };
        }
      }
    } catch (err) {
      report.postCompileError = `Failed to finalize PDF: ${err.message}`;
    }

    const auxExts = ['.aux', '.log', '.out', '.fls', '.fdb_latexmk', '.synctex.gz'];
    for (const ext of auxExts) {
      await rm(join(texDir, `${compileBase}${ext}`)).catch(() => {});
    }
    if (engine === 'tectonic') {
      await rm(compilePath).catch(() => {});
    }
  }

  return report;
}

async function main() {
  const rawArgs = process.argv.slice(2);
  const compileOnly = rawArgs.includes('--compile-only');
  let maxPages = null, verifyText = false, jdKeywords = [];
  const positional = [];
  for (const arg of rawArgs) {
    if (arg === '--compile-only') continue;
    if (arg.startsWith('--max-pages=')) {
      maxPages = parseInt(arg.slice('--max-pages='.length), 10);
    } else if (arg === '--verify-text') {
      verifyText = true;
    } else if (arg.startsWith('--jd-keywords=')) {
      jdKeywords = arg.slice('--jd-keywords='.length).split(',').map((k) => k.trim()).filter(Boolean);
    } else {
      positional.push(arg);
    }
  }
  const inputPath = positional[0];
  const outputPath = positional[1];

  if (!inputPath) {
    console.error('Usage: node generate-latex.mjs <input.tex> [output.pdf] [--compile-only] [--max-pages=N] [--verify-text] [--jd-keywords=k1,k2,...]');
    process.exit(1);
  }

  if (maxPages !== null && (!Number.isInteger(maxPages) || maxPages < 1)) {
    console.error(`Invalid --max-pages "${maxPages}". Use a positive integer, e.g. --max-pages=2`);
    process.exit(1);
  }

  const absPath = resolve(inputPath);
  let content;
  try {
    content = await readFile(absPath, 'utf-8');
  } catch (err) {
    console.error(`Error reading ${absPath}: ${err.message}`);
    process.exit(1);
  }

  const report = await compileLatexFile(absPath, content, outputPath || null, compileOnly, { maxPages, verifyText, jdKeywords });
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.compiled ? 0 : (report.valid ? 1 : 1));
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main();
}
