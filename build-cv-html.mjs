#!/usr/bin/env node

/**
 * build-cv-html.mjs — assemble a structured JSON payload into an ATS-safe CV
 * HTML using templates/cv-template.html, mirroring build-cv-latex.mjs's shape
 * (fixed TEMPLATE_PATH, build*(entries) renderers, {{TOKEN}} substitution,
 * unresolved-placeholder check, --test self-test).
 *
 * Why this exists: the LaTeX path already had a structured builder; the HTML
 * path did not, so the agent hand-authored final HTML for every CV. That is why
 * Publications had no real data field and got faked with .project or .skill-item
 * markup, inconsistently, per CV. Here Publications is a first-class typed array
 * with NO truncation code path — the "never trim Publications" rule holds by the
 * absence of any slice(), not by a comment.
 *
 * Playwright-independent: imports only ./cv-payload-utils.mjs (and stdlib),
 * never ./generate-pdf.mjs — a user who only needs the HTML string should not
 * pull in Chromium. (generate-pdf.mjs renders the HTML → PDF as a separate step.)
 *
 * Usage:
 *   node build-cv-html.mjs <input.json> <output.html>
 *   node build-cv-html.mjs --test        (alias: --self-test)
 */

import { readFile, writeFile, stat, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, dirname, basename, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { tmpdir } from 'os';
import { sanitizeUrl, splitBoldSpans } from './cv-payload-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = resolve(__dirname, 'templates', 'cv-template.html');
const PLACEHOLDER_RE = /\{\{[A-Z_]+\}\}/g;

const DEFAULT_TITLES = {
  summary: 'Professional Summary',
  competencies: 'Core Competencies',
  experience: 'Work Experience',
  projects: 'Projects',
  education: 'Education',
  certifications: 'Certifications',
  skills: 'Skills',
  publications: 'Publications',
};

function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Render text honoring the **bold** convention → escaped HTML with <strong>. */
function renderRich(text) {
  const spans = splitBoldSpans(typeof text === 'string' ? text : '');
  return spans
    .map((s) => (s.bold ? `<strong>${escapeHtml(s.text)}</strong>` : escapeHtml(s.text)))
    .join('');
}

/** Wrap section inner HTML in the standard section block, or '' when empty. */
function sectionWrap(title, inner) {
  if (!inner || !inner.trim()) return '';
  return `  <div class="section">
    <div class="section-title">${escapeHtml(title)}</div>
    ${inner}
  </div>`;
}

function buildContactRow(payload) {
  const items = [];
  if (payload.phone) {
    items.push(`<a href="tel:${escapeHtml(payload.phone)}">${escapeHtml(payload.phone)}</a>`);
  }
  if (payload.email) {
    items.push(`<a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a>`);
  }
  for (const key of ['linkedin', 'portfolio', 'github']) {
    const link = payload[key];
    if (link && (link.url || link.display)) {
      const href = escapeHtml(sanitizeUrl(link.url || link.display));
      const display = escapeHtml(link.display || link.url);
      items.push(`<a href="${href}">${display}</a>`);
    }
  }
  if (payload.location) {
    items.push(`<span>${escapeHtml(payload.location)}</span>`);
  }
  return items.join('\n      <span class="separator">|</span>\n      ');
}

function buildSummary(text) {
  if (!text) return '';
  return `<div class="summary-text">${renderRich(text)}</div>`;
}

function buildCompetencies(list) {
  if (!Array.isArray(list) || list.length === 0) return '';
  const tags = list
    .filter(Boolean)
    .map((c) => `<span class="competency-tag">${escapeHtml(c)}</span>`)
    .join('\n      ');
  if (!tags) return '';
  return `<div class="competencies-grid">\n      ${tags}\n    </div>`;
}

function buildExperience(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return '';
  const blocks = [];
  for (const e of entries) {
    if (!e) continue;
    const roleLine = e.location
      ? `${escapeHtml(e.role)} · ${escapeHtml(e.location)}`
      : escapeHtml(e.role || '');
    const bullets = Array.isArray(e.bullets)
      ? e.bullets.map((b) => `<li>${renderRich(b)}</li>`).join('')
      : '';
    blocks.push(`  <div class="job">
    <div class="job-header"><span class="job-company">${escapeHtml(e.company)}</span><span class="job-period">${escapeHtml(e.dates)}</span></div>
    <div class="job-role">${roleLine}</div>
    <ul>${bullets}</ul>
  </div>`);
  }
  return blocks.join('\n');
}

function buildProjects(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return '';
  const blocks = [];
  for (const e of entries) {
    if (!e) continue;
    const badge = e.badge ? `<span class="project-badge">${escapeHtml(e.badge)}</span>` : '';
    const desc = e.desc || e.context;
    const descHtml = desc ? `\n    <div class="project-desc">${renderRich(desc)}</div>` : '';
    const bullets = Array.isArray(e.bullets)
      ? `\n    <ul>${e.bullets.map((b) => `<li>${renderRich(b)}</li>`).join('')}</ul>`
      : '';
    const tech = e.tech ? `\n    <div class="project-tech">${escapeHtml(e.tech)}</div>` : '';
    blocks.push(`  <div class="project">
    <div class="project-title">${escapeHtml(e.name)}${badge}</div>${descHtml}${bullets}${tech}
  </div>`);
  }
  return blocks.join('\n');
}

function buildEducation(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return '';
  const blocks = [];
  for (const e of entries) {
    if (!e) continue;
    const title = e.institution
      ? `${escapeHtml(e.degree)} · ${escapeHtml(e.institution)}`
      : escapeHtml(e.degree || '');
    const descParts = [];
    if (e.desc) descParts.push(renderRich(e.desc));
    if (Array.isArray(e.coursework) && e.coursework.length > 0) {
      descParts.push(`Coursework: ${e.coursework.map((c) => escapeHtml(c)).join(', ')}`);
    }
    const desc = descParts.length ? `\n    <div class="edu-desc">${descParts.join(' · ')}</div>` : '';
    blocks.push(`  <div class="edu-item">
    <div class="edu-header"><span class="edu-title">${title}</span><span class="edu-year">${escapeHtml(e.dates)}</span></div>${desc}
  </div>`);
  }
  return blocks.join('\n');
}

function buildCertifications(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return '';
  const rows = entries
    .filter(Boolean)
    .map(
      (c) =>
        `    <div class="cert-item"><span class="cert-title">${escapeHtml(c.title)}</span><span class="cert-org">${escapeHtml(c.org)}</span><span class="cert-year">${escapeHtml(c.year)}</span></div>`
    )
    .join('\n');
  if (!rows) return '';
  return `<div class="cert-table">\n${rows}\n    </div>`;
}

function buildSkills(categories) {
  if (!Array.isArray(categories) || categories.length === 0) return '';
  return categories
    .filter(Boolean)
    .map((c) => {
      const items = Array.isArray(c.items) ? c.items.map((i) => escapeHtml(i)).join(' · ') : escapeHtml(c.items || '');
      return `    <div class="skill-item"><span class="skill-category">${escapeHtml(c.category)}:</span> ${items}</div>`;
    })
    .join('\n');
}

/**
 * Publications renderer. Each entry may be:
 *   - a plain string (the whole citation), or
 *   - { text|citation, emphasis, venue, detail } where `emphasis` (e.g. the
 *     candidate's own name) is bolded at its first occurrence and `venue` is
 *     italicized.
 * There is deliberately NO slice()/top-N here: the full list always renders,
 * so downstream trimming (cv-trim.mjs, Milestone 3) can never shorten it.
 */
function buildPublications(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return '';
  const lines = [];
  for (const p of entries) {
    if (!p) continue;
    if (typeof p === 'string') {
      lines.push(`  <div class="pub-item">${escapeHtml(p)}</div>`);
      continue;
    }
    const text = p.text || p.citation || '';
    let body = escapeHtml(text);
    if (p.emphasis) {
      const emph = escapeHtml(p.emphasis);
      const idx = body.indexOf(emph);
      if (idx >= 0) {
        body = `${body.slice(0, idx)}<strong>${emph}</strong>${body.slice(idx + emph.length)}`;
      }
    }
    const venue = p.venue ? ` <em>${escapeHtml(p.venue)}</em>` : '';
    const detail = p.detail ? ` ${escapeHtml(p.detail)}` : '';
    lines.push(`  <div class="pub-item">${body}${venue}${detail}</div>`);
  }
  return lines.join('\n');
}

/**
 * Pure render: payload + template string → { html, unresolved, counts }.
 * Shared by main() and the self-test so both exercise the identical path.
 */
function renderCv(payload, template) {
  const titles = { ...DEFAULT_TITLES, ...(payload.section_titles || {}) };

  const photo = payload.photo
    ? `<img class="cv-photo" src="${escapeHtml(payload.photo)}" alt="">`
    : '';

  const substitutions = {
    LANG: escapeHtml(payload.lang || 'en'),
    NAME: escapeHtml(payload.name || ''),
    PAGE_WIDTH: escapeHtml(payload.page_width || '100%'),
    PHOTO: photo,
    CONTACT_ROW: buildContactRow(payload),
    SUMMARY_SECTION: sectionWrap(titles.summary, buildSummary(payload.summary)),
    COMPETENCIES_SECTION: sectionWrap(titles.competencies, buildCompetencies(payload.competencies)),
    EXPERIENCE_SECTION: sectionWrap(titles.experience, buildExperience(payload.experience)),
    PROJECTS_SECTION: sectionWrap(titles.projects, buildProjects(payload.projects)),
    EDUCATION_SECTION: sectionWrap(titles.education, buildEducation(payload.education)),
    CERTIFICATIONS_SECTION: sectionWrap(titles.certifications, buildCertifications(payload.certifications)),
    SKILLS_SECTION: sectionWrap(titles.skills, buildSkills(payload.skills)),
    PUBLICATIONS_SECTION: sectionWrap(titles.publications, buildPublications(payload.publications)),
  };

  let html = template;
  for (const [key, value] of Object.entries(substitutions)) {
    // Function replacement so a payload value containing $&, $`, $' or $$ is
    // inserted literally rather than interpreted as a replacement pattern.
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), () => value);
  }

  const unresolved = html.match(PLACEHOLDER_RE);

  const expEntries = Array.isArray(payload.experience) ? payload.experience : [];
  const projEntries = Array.isArray(payload.projects) ? payload.projects : [];
  const counts = {
    experienceEntries: expEntries.length,
    projectEntries: projEntries.length,
    publicationEntries: (payload.publications || []).length,
    educationEntries: (payload.education || []).length,
    certificationEntries: (payload.certifications || []).length,
    skillCategories: (payload.skills || []).length,
    competencies: (payload.competencies || []).length,
    totalBullets:
      expEntries.flatMap((e) => (Array.isArray(e?.bullets) ? e.bullets : [])).length +
      projEntries.flatMap((p) => (Array.isArray(p?.bullets) ? p.bullets : [])).length,
  };

  return { html, unresolved: unresolved ? [...new Set(unresolved)] : null, counts };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--test') || args.includes('--self-test')) {
    await runSelfTest();
    return;
  }

  if (args.length === 0 || args.includes('--help')) {
    console.error('Usage:');
    console.error('  node build-cv-html.mjs <input.json> <output.html>');
    console.error('  node build-cv-html.mjs --test');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  if (!inputPath || !outputPath) {
    console.error('Usage: node build-cv-html.mjs <input.json> <output.html>');
    process.exit(1);
  }

  const absInput = resolve(inputPath);
  const absOutput = resolve(outputPath);
  const outDir = dirname(absOutput);

  if (!existsSync(absInput)) {
    console.error(`Input file not found: ${absInput}`);
    process.exit(1);
  }
  if (!existsSync(TEMPLATE_PATH)) {
    console.error(`Template not found: ${TEMPLATE_PATH}`);
    process.exit(1);
  }

  let payload;
  try {
    payload = JSON.parse(await readFile(absInput, 'utf-8'));
  } catch (err) {
    console.error(`Failed to parse input JSON: ${err.message}`);
    process.exit(1);
  }

  const template = await readFile(TEMPLATE_PATH, 'utf-8');
  const { html, unresolved, counts } = renderCv(payload, template);

  if (unresolved) {
    console.error(`Unresolved placeholders: ${unresolved.join(', ')}`);
    process.exit(1);
  }

  if (!existsSync(outDir)) await mkdir(outDir, { recursive: true });
  await writeFile(absOutput, html, 'utf-8');

  const fileInfo = await stat(absOutput);
  const report = {
    file: basename(absOutput),
    path: absOutput,
    sizeKB: parseFloat((fileInfo.size / 1024).toFixed(1)),
    counts,
    valid: true,
  };
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

async function runSelfTest() {
  if (!existsSync(TEMPLATE_PATH)) {
    console.error(`Self-test failed: template not found at ${TEMPLATE_PATH}`);
    process.exit(1);
  }
  const template = await readFile(TEMPLATE_PATH, 'utf-8');
  let failures = 0;
  const check = (label, cond) => {
    if (!cond) {
      console.error(`FAIL ${label}`);
      failures++;
    }
  };

  // (1) Full payload — every section present, incl. publications.
  const full = {
    lang: 'en',
    name: 'Test Candidate, Ph.D.',
    phone: '+1-555-123-4567',
    email: 'test@example.com',
    linkedin: { url: 'https://linkedin.com/in/test', display: 'linkedin.com/in/test' },
    portfolio: { url: 'https://scholar.example.com', display: 'Google Scholar' },
    location: 'Austin, TX',
    summary: 'Materials scientist with **surface-science** depth & AI/ML tooling.',
    competencies: ['XPS & Surface Chemistry', 'ToF-SIMS', 'DFT'],
    experience: [
      {
        company: 'Test Corp & Co',
        role: 'Sr. Engineer',
        location: 'Austin, TX',
        dates: 'Feb 2026 – Present',
        bullets: ['**Led** a $75M program', 'Cut cost by 30% via <DOE> tuning'],
      },
    ],
    projects: [
      { name: 'Test Project', badge: 'OSS', context: 'Python, SQL', bullets: ['Built a REST API'] },
    ],
    education: [
      {
        degree: 'Ph.D., Materials Science',
        institution: 'The University of Texas at Austin',
        dates: 'Dec 2025',
        desc: 'GPA 3.86/4.00',
        coursework: ['Solid State', 'Electrochemistry'],
      },
    ],
    certifications: [{ title: 'Six Sigma', org: 'ASQ', year: '2024' }],
    skills: [{ category: 'Microanalysis', items: ['XPS', 'ToF-SIMS', 'FIB-SEM'] }],
    publications: [
      {
        text: 'Guo, Z.; Dolocan, A.; Manthiram, A. Impact of Anode to Cathode Crossover.',
        emphasis: 'Guo, Z.',
        venue: 'Adv. Mater.',
        detail: '2026, e18490.',
      },
      'Xiang, J.; Guo, Z. (co-first); Huang, Y. Facile Synthesis. J. Energy Chem. 2020, 49, 161-165.',
    ],
  };
  const r1 = renderCv(full, template);
  check('(1) no unresolved placeholders', r1.unresolved === null);
  check('(1) renders Publications section title', r1.html.includes('>Publications<'));
  check('(1) publication emphasis bolded', r1.html.includes('<strong>Guo, Z.</strong>'));
  check('(1) publication venue italicized', r1.html.includes('<em>Adv. Mater.</em>'));
  check('(1) all 2 publications present (no truncation)', (r1.html.match(/class="pub-item"/g) || []).length === 2);
  check('(1) bullet bold span rendered', r1.html.includes('<strong>Led</strong>'));
  check('(1) ampersand escaped in company', r1.html.includes('Test Corp &amp; Co'));
  check('(1) angle brackets escaped in bullet', r1.html.includes('&lt;DOE&gt;'));
  check('(1) $75M inserted literally (no $-pattern corruption)', r1.html.includes('$75M'));
  check('(1) contact row has separators', r1.html.includes('class="separator"'));
  check('(1) counts.publicationEntries=2', r1.counts.publicationEntries === 2);
  check('(1) counts.totalBullets=3', r1.counts.totalBullets === 3);

  // (2) Minimal payload — no projects, certs, competencies, or publications.
  // Those sections must vanish entirely (no orphaned heading), still no unresolved.
  const minimal = {
    name: 'Min Payload',
    email: 'min@example.com',
    summary: 'Short summary.',
    experience: [{ company: 'X', role: 'Y', dates: '2025', bullets: ['Did a thing'] }],
    education: [{ degree: 'B.S.', institution: 'Uni', dates: '2020' }],
    skills: [{ category: 'Lang', items: ['Python'] }],
  };
  const r2 = renderCv(minimal, template);
  check('(2) no unresolved placeholders', r2.unresolved === null);
  check('(2) Publications section omitted', !r2.html.includes('>Publications<'));
  check('(2) Projects section omitted', !r2.html.includes('>Projects<'));
  check('(2) Certifications section omitted', !r2.html.includes('>Certifications<'));
  check('(2) Core Competencies section omitted', !r2.html.includes('>Core Competencies<'));
  check('(2) no empty section block left behind', !/<div class="section">\s*<div class="section-title"><\/div>/.test(r2.html));
  check('(2) Experience still present', r2.html.includes('>Work Experience<'));

  if (failures > 0) {
    console.error(`\n${failures} self-test(s) FAILED`);
    process.exit(1);
  }

  // Round-trip through the file path too, then clean up.
  const tmpIn = join(tmpdir(), 'build-cv-html-test-input.json');
  const tmpOut = join(tmpdir(), 'build-cv-html-test.html');
  await writeFile(tmpIn, JSON.stringify(full), 'utf-8');
  await writeFile(tmpOut, r1.html, 'utf-8');
  const info = await stat(tmpOut);
  console.log(
    JSON.stringify(
      {
        status: 'self-test-passed',
        file: basename(tmpOut),
        sizeKB: parseFloat((info.size / 1024).toFixed(1)),
        counts: r1.counts,
      },
      null,
      2
    )
  );
  await import('fs/promises').then((fs) =>
    Promise.all([fs.rm(tmpIn).catch(() => {}), fs.rm(tmpOut).catch(() => {})])
  );
  process.exit(0);
}

// Run the CLI only when executed directly, so Milestone 3's cv-trim.mjs can
// `import { renderCv }` without kicking off argument parsing / process.exit.
const isMain = import.meta.url === pathToFileURL(process.argv[1] || '').href;
if (isMain) main();
