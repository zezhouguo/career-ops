#!/usr/bin/env node

/**
 * pdf-text.mjs — Shared, Playwright-free helpers for verifying a compiled
 * PDF against its source: poppler-backed text extraction, exact page
 * counting, contact-info/keyword checks, page rasterization for visual QA,
 * and section-order comparison (used by both the rendered-HTML check in
 * generate-pdf.mjs and the new extracted-PDF-text check).
 *
 * Deliberately has zero dependency on Playwright (unlike generate-pdf.mjs)
 * so generate-latex.mjs can import it without pulling Chromium into a
 * LaTeX-only workflow — a user who only ever compiles LaTeX CVs shouldn't
 * need Chromium installed for this to work.
 *
 * Every poppler-backed function degrades gracefully when the corresponding
 * binary is missing (returns an `available: false` / null result, never
 * throws) — these are optional verification aids, never a hard requirement
 * to generate a PDF. Install poppler for the full checks: `brew install
 * poppler` (macOS) or `apt install poppler-utils` (Debian/Ubuntu).
 *
 * Run standalone: node pdf-text.mjs --self-test
 */

import { execFileSync } from 'child_process';
import { mkdtempSync, rmSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

/**
 * Detect the first available binary from a list of candidates, following
 * the exact try/catch-over-candidates shape generate-latex.mjs already uses
 * to detect tectonic/pdflatex. Poppler CLI tools use `-v` for their version
 * flag (not `--version`, which tectonic/pdflatex use) — passing the wrong
 * flag would silently make detection always fail even when poppler is
 * installed.
 */
function detectBinary(candidates, versionFlag = '-v') {
  for (const candidate of candidates) {
    try {
      execFileSync(candidate, [versionFlag], { stdio: 'pipe' });
      return candidate;
    } catch { /* not found */ }
  }
  return null;
}

export function detectPdftotext() {
  return detectBinary(['pdftotext']);
}

export function detectPdftoppm() {
  return detectBinary(['pdftoppm']);
}

export function detectPdftocairo() {
  return detectBinary(['pdftocairo']);
}

/**
 * Extract a compiled PDF's actual text layer via `pdftotext -layout`.
 * `-layout` preserves reading order for the single-column templates this
 * project already enforces (no sidebars/tables — see modes/pdf.md's ATS
 * Rules), so reading-order risk is structurally low; this is mostly a
 * standing regression guard.
 *
 * @param {string} pdfPath
 * @returns {{available: boolean, text: string, error?: string}}
 */
export function extractPdfText(pdfPath) {
  if (!detectPdftotext()) return { available: false, text: '' };
  try {
    const text = execFileSync('pdftotext', ['-layout', pdfPath, '-'], {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
    });
    return { available: true, text };
  } catch (err) {
    return { available: false, text: '', error: err.message };
  }
}

/**
 * Poppler's `pdftotext` inserts a form-feed (`\f`) between pages by
 * default — splitting on it gives an exact page count for free from the
 * same extraction call, with no separate `pdfinfo` invocation needed.
 *
 * @param {string} text
 * @returns {number}
 */
export function countPagesFromExtractedText(text) {
  if (!text) return 0;
  const segments = text.split('\f');
  // A trailing form-feed (common) leaves one empty segment after the split —
  // that's not a real extra page, drop it.
  if (segments.length > 1 && segments[segments.length - 1] === '') segments.pop();
  return segments.length;
}

/**
 * Check whether the candidate's contact info survives PDF text extraction
 * as clean, literal text. Both sides are digit-normalized for phone so
 * formatting differences (dashes, parens, spaces, country-code prefixes
 * rendered differently) don't produce a false negative.
 *
 * @param {string} text
 * @param {{email?: string, phone?: string}} contact
 * @returns {{emailFound?: boolean, phoneFound?: boolean}}
 */
export function checkContactInfoParseable(text, { email, phone } = {}) {
  const normalizedText = (text || '').toLowerCase();
  const digitsOnly = (s) => (s || '').replace(/\D/g, '');
  const result = {};
  if (email) result.emailFound = normalizedText.includes(email.toLowerCase());
  if (phone) {
    const phoneDigits = digitsOnly(phone);
    const textDigits = digitsOnly(text);
    // Bidirectional: either side may carry a leading country code the other
    // lacks (config might store "+1-555-123-4567" while the rendered PDF shows
    // just "(555) 123-4567"). The reverse direction requires a minimum
    // length so a short, unrelated digit run in body text can't trivially
    // satisfy `phoneDigits.includes(textDigits)`.
    result.phoneFound =
      phoneDigits.length > 0 &&
      textDigits.length > 0 &&
      (textDigits.includes(phoneDigits) || (textDigits.length >= 7 && phoneDigits.includes(textDigits)));
  }
  return result;
}

/**
 * Score JD-keyword coverage against the PDF's actual extracted text,
 * rather than against source markup — this is what gives "keyword coverage
 * %" (currently promised but never defined in modes/pdf.md / modes/latex.md)
 * a real, computed meaning.
 *
 * @param {string} text
 * @param {string[]} keywords
 * @returns {{matched: string[], missing: string[], percent: number|null}}
 */
export function checkKeywordCoverage(text, keywords = []) {
  const t = (text || '').toLowerCase();
  const matched = [];
  const missing = [];
  for (const kw of keywords) {
    if (!kw) continue;
    if (t.includes(kw.toLowerCase())) matched.push(kw);
    else missing.push(kw);
  }
  const total = matched.length + missing.length;
  const percent = total === 0 ? null : Math.round((matched.length / total) * 100);
  return { matched, missing, percent };
}

/**
 * Rasterize each PDF page to a PNG for the agent's visual-inspection step
 * (orphaned headings, overlap, font-fallback artifacts) — mirrors the
 * existing Canva sub-flow's "screenshot -> agent looks at it" pattern in
 * modes/pdf.md Step 4d, extended to the default path. Tries `pdftoppm`
 * first, `pdftocairo` as a fallback (poppler ships both). Writes to a
 * fresh OS-tmp directory per call — these are QA aids with no downstream
 * consumer, not a User Layer artifact, so they are never written to output/.
 *
 * @param {string} pdfPath
 * @param {{dpi?: number}} [opts]
 * @returns {{available: boolean, outDir: string|null, tool?: string, files: string[]}}
 */
export function rasterizePages(pdfPath, { dpi = 100 } = {}) {
  const outDir = mkdtempSync(join(tmpdir(), 'career-ops-pdf-preview-'));
  const prefix = join(outDir, 'page');

  const candidates = [
    detectPdftoppm() && { bin: 'pdftoppm', tool: 'pdftoppm' },
    detectPdftocairo() && { bin: 'pdftocairo', tool: 'pdftocairo' },
  ].filter(Boolean);

  for (const { bin, tool } of candidates) {
    try {
      execFileSync(bin, ['-png', '-r', String(dpi), pdfPath, prefix], { stdio: 'pipe' });
      const files = readdirSync(outDir)
        .filter((f) => f.endsWith('.png'))
        .sort()
        .map((f) => join(outDir, f));
      if (files.length > 0) return { available: true, outDir, tool, files };
    } catch { /* try next tool */ }
  }

  rmSync(outDir, { recursive: true, force: true });
  return { available: false, outDir: null, files: [] };
}

// ── Section-order comparison ─────────────────────────────────────────────
// Relocated from generate-pdf.mjs (not duplicated): generate-pdf.mjs's
// validateCvSectionOrder() becomes a thin wrapper around compareSectionOrder()
// below, so this one algorithm serves two extraction strategies — rendered
// HTML (existing) and extracted PDF text (new). This file cannot import
// anything from generate-pdf.mjs (that would transitively pull in Playwright
// via its `import { chromium } from 'playwright'`), so the shared logic must
// live here, with generate-pdf.mjs importing it back.

export const SECTION_ALIASES = new Map([
  ['summary', 'summary'],
  ['professional summary', 'summary'],
  ['competencies', 'competencies'],
  ['core competencies', 'competencies'],
  ['experience', 'experience'],
  ['work experience', 'experience'],
  ['professional experience', 'experience'],
  ['projects', 'projects'],
  ['selected projects', 'projects'],
  ['personal projects', 'projects'],
  ['education', 'education'],
  ['education & certifications', 'education'],
  ['certifications', 'certifications'],
  ['skills', 'skills'],
  ['technical skills', 'skills'],
]);

export function normalizeSectionTitle(text) {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{\{[^}]+\}\}/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function sectionKey(text) {
  const normalized = normalizeSectionTitle(text);
  return SECTION_ALIASES.get(normalized) ?? normalized;
}

export function extractSourceSectionOrder(markdown) {
  const sections = [];
  for (const line of (markdown || '').split(/\r?\n/)) {
    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!heading) continue;
    const text = normalizeSectionTitle(heading[2]);
    if (!text) continue;
    sections.push({ key: sectionKey(text), title: text });
  }
  return sections;
}

/**
 * Extracted PDF text has no markup to key on — a section heading is
 * (conservatively) a short standalone line that resolves to a *known*
 * SECTION_ALIASES key. Only known aliases count as a boundary, so ordinary
 * body text near a heading is never misread as one.
 *
 * @param {string} pdftotextOutput
 * @returns {{key: string, title: string}[]}
 */
export function extractSectionOrderFromText(pdftotextOutput) {
  const sections = [];
  for (const line of (pdftotextOutput || '').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length > 60) continue;
    const normalized = normalizeSectionTitle(trimmed);
    if (!SECTION_ALIASES.has(normalized)) continue;
    sections.push({ key: sectionKey(trimmed), title: normalized });
  }
  return sections;
}

/**
 * Compare a rendered section order against the source order. Returns a
 * result object rather than throwing, so the same function can back both
 * generate-pdf.mjs's existing throw-by-default/warn-with-allowReorder
 * behavior and any future non-throwing caller.
 *
 * @param {{key: string, title: string}[]} renderedSections
 * @param {{key: string, title: string}[]} sourceSections
 * @param {{allowReorder?: boolean}} [opts]
 * @returns {{ok: boolean, warning?: string, error?: string}}
 */
export function compareSectionOrder(renderedSections, sourceSections, { allowReorder = false } = {}) {
  if (renderedSections.length < 2 || sourceSections.length < 2) return { ok: true };

  const sourcePositions = new Map(sourceSections.map((section, index) => [section.key, index]));
  const renderedComparable = renderedSections.filter((section) => sourcePositions.has(section.key));
  if (renderedComparable.length < 2) return { ok: true };

  for (let i = 1; i < renderedComparable.length; i++) {
    const previous = renderedComparable[i - 1];
    const current = renderedComparable[i];
    if (sourcePositions.get(current.key) < sourcePositions.get(previous.key)) {
      const renderedOrder = renderedComparable.map((section) => section.title).join(' -> ');
      const sourceOrder = sourceSections
        .filter((section) => renderedComparable.some((r) => r.key === section.key))
        .map((section) => section.title)
        .join(' -> ');
      const message = `CV section order diverges from cv.md: rendered ${renderedOrder}; cv.md ${sourceOrder}`;
      if (allowReorder) return { ok: true, warning: message };
      return { ok: false, error: message };
    }
  }
  return { ok: true };
}

// ── Self-test ─────────────────────────────────────────────────────────────
// Exercises every pure function against fixed strings — none of this needs
// poppler installed. Binary-dependent functions (extractPdfText,
// rasterizePages against a real PDF) are covered by generate-pdf.mjs's own
// integration tests in test-all.mjs, which skip gracefully when poppler is
// absent, matching the existing precedent for tectonic/pdflatex-dependent
// LaTeX tests.
function selfTest() {
  const assert = (condition, message) => {
    if (!condition) {
      console.error(`FAIL: ${message}`);
      process.exitCode = 1;
    }
  };

  assert(countPagesFromExtractedText('page one\fpage two\fpage three') === 3, 'counts 3 pages from 2 form-feeds');
  assert(countPagesFromExtractedText('page one\fpage two\f') === 2, 'trailing form-feed does not add a phantom page');
  assert(countPagesFromExtractedText('single page, no form-feed') === 1, 'single page with no form-feed counts as 1');
  assert(countPagesFromExtractedText('') === 0, 'empty text counts as 0 pages');

  const contact = checkContactInfoParseable(
    'Jane Doe\nAustin, TX\njane.doe@example.com\n(555) 123-4567',
    { email: 'jane.doe@example.com', phone: '+1-555-123-4567' }
  );
  assert(contact.emailFound === true, 'email found as literal text');
  assert(contact.phoneFound === true, 'phone found despite differing punctuation/format');
  const missingContact = checkContactInfoParseable('no contact info here', { email: 'x@y.com', phone: '555-0100' });
  assert(missingContact.emailFound === false, 'missing email correctly not found');
  assert(missingContact.phoneFound === false, 'missing phone correctly not found');

  const coverage = checkKeywordCoverage('electrolyte formulation and cathode synthesis', ['electrolyte', 'cathode', 'anode']);
  assert(coverage.matched.length === 2 && coverage.missing.length === 1, 'keyword coverage splits matched/missing correctly');
  assert(coverage.percent === 67, 'keyword coverage percent rounds correctly');
  assert(checkKeywordCoverage('anything', []).percent === null, 'coverage percent is null with no keywords given');

  assert(sectionKey('Work Experience') === 'experience', 'section alias resolves "Work Experience" to experience');
  assert(sectionKey('Some Unknown Heading') === 'some unknown heading', 'unknown section falls back to its normalized text as the key');

  const inOrder = compareSectionOrder(
    [{ key: 'experience', title: 'experience' }, { key: 'education', title: 'education' }],
    [{ key: 'experience', title: 'experience' }, { key: 'education', title: 'education' }],
  );
  assert(inOrder.ok === true && !inOrder.warning && !inOrder.error, 'matching order reports ok with no warning/error');

  const reordered = compareSectionOrder(
    [{ key: 'education', title: 'education' }, { key: 'experience', title: 'experience' }],
    [{ key: 'experience', title: 'experience' }, { key: 'education', title: 'education' }],
  );
  assert(reordered.ok === false && typeof reordered.error === 'string', 'divergent order reports ok:false with an error by default');

  const reorderedAllowed = compareSectionOrder(
    [{ key: 'education', title: 'education' }, { key: 'experience', title: 'experience' }],
    [{ key: 'experience', title: 'experience' }, { key: 'education', title: 'education' }],
    { allowReorder: true },
  );
  assert(reorderedAllowed.ok === true && typeof reorderedAllowed.warning === 'string', 'divergent order with allowReorder reports ok:true with a warning');

  const fromText = extractSectionOrderFromText('Zezhou Guo\n\nWork Experience\n\nSome company, some role\n\nEducation\n\nUT Austin');
  assert(fromText.length === 2 && fromText[0].key === 'experience' && fromText[1].key === 'education', 'extractSectionOrderFromText finds known section headings in order, ignoring body text');

  // Binary detection must never throw, regardless of whether poppler happens
  // to be installed in this environment.
  const ppText = detectPdftotext();
  assert(ppText === null || typeof ppText === 'string', 'detectPdftotext returns null or a binary name without throwing');
  const ppToppm = detectPdftoppm();
  assert(ppToppm === null || typeof ppToppm === 'string', 'detectPdftoppm returns null or a binary name without throwing');

  if (process.exitCode !== 1) {
    console.log('ALL SELF-TESTS PASSED');
  }
}

const isMain = process.argv[1] && process.argv[1].endsWith('pdf-text.mjs');
if (isMain && process.argv.includes('--self-test')) {
  selfTest();
}
