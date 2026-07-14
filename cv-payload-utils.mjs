#!/usr/bin/env node

/**
 * cv-payload-utils.mjs — format-independent helpers shared by the CV builders.
 *
 * Deliberately dependency-light: this module must be safe to import from both
 * build-cv-html.mjs and build-cv-latex.mjs without dragging in Playwright (the
 * same Playwright-independence rule pdf-text.mjs follows). It imports nothing
 * from generate-pdf.mjs.
 *
 * Exports:
 *   - sanitizeUrl(url)      — normalize + defang a URL for an href/\href target.
 *   - splitBoldSpans(text)  — parse the one inline-markup convention this repo
 *                             uses (**bold**) into [{text, bold}] segments so
 *                             each builder can render bold its own way
 *                             (HTML → <strong>, LaTeX → \textbf{}). This is the
 *                             ONLY inline markup supported — not a markdown
 *                             parser (matches the single convention documented
 *                             in modes/cover.md and cv-template.html's
 *                             `.job li strong` rule).
 *
 * Run `node cv-payload-utils.mjs --test` (or --self-test) to self-check.
 */

/**
 * Normalize a URL for use as an href / \href target.
 * - Bare emails become mailto:, bare hosts become https://.
 * - Strips characters that would break an HTML attribute or a LaTeX \href arg.
 * Returns '' for empty/non-string input.
 */
export function sanitizeUrl(url) {
  if (typeof url !== 'string') return '';
  url = url.trim();
  if (!url) return '';
  const allowedSchemes = ['mailto:', 'http:', 'https:'];
  const hasScheme = allowedSchemes.some((s) => url.toLowerCase().startsWith(s));
  if (!hasScheme) {
    if (url.includes('@') && !url.includes('/')) {
      url = 'mailto:' + url;
    } else {
      url = 'https://' + url;
    }
  }
  url = url.replace(/[{}%$#\\~^]/g, '');
  return url;
}

/**
 * Split text on the **bold** convention into ordered segments.
 * Returns [{text, bold}] with empty segments dropped. An unmatched `**`
 * (no closing pair) is left literal in a plain segment — never half-bolded.
 *
 * Example: splitBoldSpans('Led **X,** shipped Y')
 *   → [{text:'Led ',bold:false},{text:'X,',bold:true},{text:' shipped Y',bold:false}]
 */
export function splitBoldSpans(text) {
  if (typeof text !== 'string' || text === '') return [];
  // Capturing split: even indices are the plain runs between markers, odd
  // indices are the bold runs. `.+?` requires ≥1 char, so **** stays literal.
  const parts = text.split(/\*\*(.+?)\*\*/);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i];
    if (!seg) continue; // drop empty runs (e.g. leading/trailing markers)
    out.push({ text: seg, bold: i % 2 === 1 });
  }
  return out;
}

// ── Self-test ──────────────────────────────────────────────────────────────

function runSelfTest() {
  let failures = 0;
  const eq = (label, got, want) => {
    const g = JSON.stringify(got);
    const w = JSON.stringify(want);
    if (g !== w) {
      console.error(`FAIL ${label}\n  got:  ${g}\n  want: ${w}`);
      failures++;
    }
  };

  // sanitizeUrl
  eq('sanitizeUrl bare email', sanitizeUrl('test@example.com'), 'mailto:test@example.com');
  eq('sanitizeUrl bare host', sanitizeUrl('example.com/in/x'), 'https://example.com/in/x');
  eq('sanitizeUrl keeps https', sanitizeUrl('https://a.com/x'), 'https://a.com/x');
  eq('sanitizeUrl keeps mailto', sanitizeUrl('mailto:a@b.com'), 'mailto:a@b.com');
  eq('sanitizeUrl empty', sanitizeUrl(''), '');
  eq('sanitizeUrl non-string', sanitizeUrl(null), '');
  eq('sanitizeUrl defangs braces', sanitizeUrl('https://a.com/{x}'), 'https://a.com/x');
  eq('sanitizeUrl keeps query amp', sanitizeUrl('https://a.com/c?u=1&hl=en'), 'https://a.com/c?u=1&hl=en');

  // splitBoldSpans
  eq('split plain', splitBoldSpans('plain text'), [{ text: 'plain text', bold: false }]);
  eq('split mid', splitBoldSpans('a **b** c'), [
    { text: 'a ', bold: false },
    { text: 'b', bold: true },
    { text: ' c', bold: false },
  ]);
  eq('split lead', splitBoldSpans('**lead** rest'), [
    { text: 'lead', bold: true },
    { text: ' rest', bold: false },
  ]);
  eq('split two bold', splitBoldSpans('**a** and **b**'), [
    { text: 'a', bold: true },
    { text: ' and ', bold: false },
    { text: 'b', bold: true },
  ]);
  eq('split unmatched', splitBoldSpans('no close **here'), [{ text: 'no close **here', bold: false }]);
  eq('split empty', splitBoldSpans(''), []);
  eq('split non-string', splitBoldSpans(undefined), []);

  if (failures > 0) {
    console.error(`\n${failures} self-test(s) FAILED`);
    process.exit(1);
  }
  console.log('ALL SELF-TESTS PASSED');
  process.exit(0);
}

// Only self-test when run directly (`node cv-payload-utils.mjs --test`), never
// as an import side-effect. Without this guard, importing this module from a
// process whose argv contains --self-test (e.g. `node build-cv-html.mjs
// --self-test`) would fire THIS self-test and its process.exit(0), hijacking
// the caller's run. This is the ESM equivalent of `if __name__ == '__main__'`.
import { pathToFileURL } from 'url';
const isMain = import.meta.url === pathToFileURL(process.argv[1] || '').href;
if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes('--test') || args.includes('--self-test')) {
    runSelfTest();
  }
}
