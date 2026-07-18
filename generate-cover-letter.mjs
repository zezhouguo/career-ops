#!/usr/bin/env node
/**
 * generate-cover-letter.mjs — Renders a cover letter payload to PDF.
 *
 * Usage:
 *   node generate-cover-letter.mjs --payload payload.json
 *   node generate-cover-letter.mjs --payload payload.json --out output/slug-cover.pdf
 *
 * Fills templates/cover-letter-template.html with the payload, then renders
 * it to PDF via the same Playwright pipeline used for CVs (generate-pdf.mjs).
 *
 * `buildHtml` is exported as a pure function so the template can be tested
 * without loading Playwright (renderHtmlToPdf is imported lazily inside main).
 */

import { readFileSync, existsSync, mkdirSync } from "fs";
import { dirname, resolve, basename, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { parseArgs } from "util";
import { resolveTemplate } from "./cv-templates.mjs";

const OUTPUT_ROOT = resolve("output");

function safeOutputPath(raw) {
  // Derive a sanitized filename from raw string (strip path separators and dots)
  const filename = basename(raw).replace(/[^a-zA-Z0-9._-]/g, "-").replace(/\.{2,}/g, "-");
  return join(OUTPUT_ROOT, filename);
}

function _require(obj, keys, context) {
  for (const key of keys) {
    if (!obj || typeof obj !== "object" || !(key in obj)) {
      throw new Error(`Missing required field: ${context}.${key}`);
    }
  }
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function asUrl(value) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function buildContactLine(candidate) {
  const parts = [];
  if (candidate.location) parts.push(escapeHtml(candidate.location));
  if (candidate.email) {
    const email = escapeHtml(candidate.email);
    parts.push(`<a href="mailto:${email}">${email}</a>`);
  }
  if (candidate.phone) parts.push(escapeHtml(candidate.phone));
  if (candidate.linkedin) {
    parts.push(`<a href="${escapeHtml(asUrl(candidate.linkedin))}">LinkedIn</a>`);
  }
  if (candidate.github) {
    const display = candidate.github.replace(/^https?:\/\//, "");
    parts.push(`<a href="${escapeHtml(asUrl(candidate.github))}">${escapeHtml(display)}</a>`);
  }
  return parts.join(" &nbsp;|&nbsp; ");
}

function buildCredentialsBlock(candidate) {
  const credentials = candidate.credentials || [];
  if (!credentials.length) return "";
  return `<div class="credentials">${credentials.map(escapeHtml).join(" &nbsp;|&nbsp; ")}</div>`;
}

function buildDateline(letter) {
  const parts = [letter.company, letter.city, letter.date].filter(Boolean).map(escapeHtml);
  return parts.join(" &nbsp;&nbsp; ");
}

function buildAchievementsBlock(achievements) {
  if (!achievements || !achievements.length) return "";
  const items = achievements.map(ach => {
    const lead = escapeHtml(ach.lead || "");
    const impact = escapeHtml(ach.impact || "");
    return `    <li><b>${lead},</b> ${impact}</li>`;
  }).join("\n");
  return `<ul class="achievements">\n${items}\n  </ul>`;
}

/**
 * Plain-text, ATS-safe sign-off ("Sincerely,\n{Name}") — no image, no script
 * font, since a scanned-signature graphic would defeat the whole point of
 * text-layer ATS verification (pdf-text.mjs's checkContactInfoParseable/
 * checkKeywordCoverage). Defaults to "Sincerely," rather than omitting the
 * block when letter.sign_off is absent — matching the user's own prior
 * correction on this exact class of bug (modes/_custom.md: "Always include
 * a salutation line... do not rely on the 'omit if no name' default").
 *
 * Calls escapeHtml(candidate.name) directly rather than emitting the literal
 * token string "{{NAME}}" — buildHtml()'s substitution is a single,
 * non-recursive pass (see its own comment above), so a nested token here
 * would render as literal text, not the candidate's name.
 */
function buildSignatureBlock(letter, candidate) {
  const signOff = escapeHtml(letter.sign_off || "Sincerely,");
  return `<p class="signature">${signOff}<br>${escapeHtml(candidate.name)}</p>`;
}

function buildFootnotesBlock(footnotes) {
  if (!footnotes || !footnotes.length) return "";
  const lines = footnotes.map(fn => {
    if (typeof fn === "object" && fn !== null) {
      const marker = escapeHtml(fn.marker || "");
      const text = escapeHtml(fn.text || "");
      const url = fn.url
        ? ` <a href="${escapeHtml(fn.url)}">${escapeHtml(fn.url)}</a>`
        : "";
      return `    <p>${marker} ${text}${url}</p>`;
    }
    return `    <p>${escapeHtml(fn)}</p>`;
  }).join("\n");
  return `<div class="footnotes">\n${lines}\n  </div>`;
}

// Resolve the cover-letter template through the shared resolver so a
// `cover_letter.template` profile default, an explicit `payload.template`, and
// installed template packs are all honored. Any resolver failure (no profile,
// no templates dir, bad config) falls back to the base template, preserving the
// original hardcoded behavior.
export function resolveCoverTemplatePath(payload = {}, opts = {}) {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const base = resolve(scriptDir, "templates", "cover-letter-template.html");
  try {
    return resolveTemplate("cover", payload.template, { format: "html", fallback: true, ...opts });
  } catch {
    return base;
  }
}

export function buildHtml(payload, templatePath) {
  _require(payload, ["candidate", "letter"], "payload");
  const candidate = payload.candidate;
  const letter = payload.letter;
  _require(candidate, ["name"], "candidate");
  _require(letter, ["role_title", "opening", "profile_intro"], "letter");

  const resolvedPath = templatePath || resolveCoverTemplatePath(payload);
  let html = readFileSync(resolvedPath, "utf-8");

  // Optional salutation (e.g. "Dear Jane Smith,"). Omitted -> no salutation,
  // preserving the original behavior for payloads that don't set it.
  const greetingBlock = letter.greeting ? `<p class="greeting">${escapeHtml(letter.greeting)}</p>` : "";
  const closingBlock = letter.closing ? `<p>${escapeHtml(letter.closing)}</p>` : "";
  const languageClosingBlock = letter.language_closing
    ? `<p class="language-closing">${escapeHtml(letter.language_closing)}</p>`
    : "";
  const problemsBlock = letter.problems_section ? `<p>${escapeHtml(letter.problems_section)}</p>` : "";

  const replacements = {
    "{{NAME}}": escapeHtml(candidate.name),
    "{{CONTACT_LINE}}": buildContactLine(candidate),
    "{{CREDENTIALS_BLOCK}}": buildCredentialsBlock(candidate),
    "{{ROLE_TITLE}}": escapeHtml(letter.role_title),
    "{{DATELINE}}": buildDateline(letter),
    "{{GREETING_BLOCK}}": greetingBlock,
    "{{OPENING}}": escapeHtml(letter.opening),
    "{{PROFILE_INTRO}}": escapeHtml(letter.profile_intro),
    "{{ACHIEVEMENTS_BLOCK}}": buildAchievementsBlock(letter.achievements),
    "{{PROBLEMS_BLOCK}}": problemsBlock,
    "{{CLOSING_BLOCK}}": closingBlock,
    "{{LANGUAGE_CLOSING_BLOCK}}": languageClosingBlock,
    "{{SIGNATURE_BLOCK}}": buildSignatureBlock(letter, candidate),
    "{{FOOTNOTES_BLOCK}}": buildFootnotesBlock(letter.footnotes),
  };

  // Single-pass substitution: each {{TOKEN}} is replaced exactly once against
  // the original template. A single regex pass (rather than iterative
  // split/join) ensures a substituted value that itself contains a {{TOKEN}}
  // sequence is left literal instead of being re-interpreted as a placeholder.
  // Tokens with no entry in the map are left untouched.
  return html.replace(/\{\{[A-Z_]+\}\}/g, (token) => replacements[token] ?? token);
}

async function main() {
  const { values: args } = parseArgs({
    options: {
      payload:     { type: "string" },
      out:         { type: "string" },
      format:      { type: "string" },
      report:      { type: "string" },
      help:        { type: "boolean", short: "h" },
      "max-pages": { type: "string" },
      "verify-text": { type: "boolean" },
      "jd-keywords": { type: "string" },
    },
    strict: false,
  });

  if (args.help || !args.payload) {
    console.log(`
Usage:
  node generate-cover-letter.mjs --payload payload.json [--out output/path.pdf] [--format letter|a4] [--report NNN] [--max-pages N] [--verify-text] [--jd-keywords k1,k2,...]

  --payload      Path to the JSON payload file (required)
  --out          Override output path from payload (optional)
  --format       Override output PDF page format (letter|a4, default: a4)
  --report       Link the PDF to a tracker report number in data/pdf-index.tsv
  --max-pages    Flag (does not fail generation on) a PDF over N pages (default 1)
  --verify-text  Run ATS text-layer checks (contact info, keyword coverage) via pdf-text.mjs; requires pdftotext (poppler)
  --jd-keywords  Comma-separated keywords for --verify-text's coverage check
`);
    process.exit(args.help ? 0 : 1);
  }

  const payloadPath = resolve(args.payload);
  if (!existsSync(payloadPath)) {
    console.error(`ERROR: payload file not found: ${payloadPath}`);
    process.exit(1);
  }

  const payload = JSON.parse(readFileSync(payloadPath, "utf-8"));

  if (args.out) {
    payload.output_path = args.out;
  }

  if (!payload.output_path) {
    const company = (payload.letter?.company || "company").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const role    = (payload.letter?.role_title || "role").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
    payload.output_path = join(OUTPUT_ROOT, `${company}-${role}-cover.pdf`);
  } else {
    payload.output_path = safeOutputPath(payload.output_path);
  }

  if (!existsSync(OUTPUT_ROOT)) mkdirSync(OUTPUT_ROOT, { recursive: true });

  // Imported lazily so buildHtml can be used (and tested) without Playwright.
  const { renderHtmlToPdf } = await import("./generate-pdf.mjs");

  try {
    const html = buildHtml(payload);
    const outputPath = resolve(payload.output_path);
    const maxPages = args["max-pages"] ? parseInt(args["max-pages"], 10) : 1;
    const jdKeywords = args["jd-keywords"]
      ? args["jd-keywords"].split(",").map((k) => k.trim()).filter(Boolean)
      : [];
    // Contact info for the ATS check comes straight from the payload's own
    // candidate block (the same values already rendered into the letter's
    // contact line) rather than re-reading config/profile.yml separately.
    const contact = { email: payload.candidate?.email, phone: payload.candidate?.phone };
    await renderHtmlToPdf(html, outputPath, {
      format: args.format || "a4",
      maxPages,
      verifyText: !!args["verify-text"],
      jdKeywords,
      contact,
      reportNum: args.report,
      inputPath: payloadPath,
    });
    console.log(`\nCover letter PDF: ${payload.output_path}`);
  } catch (err) {
    console.error("ERROR generating cover letter PDF:");
    console.error(err.message);
    process.exit(1);
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) main();
