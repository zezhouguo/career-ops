# Mode: pdf — ATS-Optimized PDF Generation

## Full pipeline

1. Read `cv.md` as the source of truth
2. Ask the user for the JD if it is not in context (text or URL)
3. Extract 15-20 keywords from the JD
4. Detect JD language → CV language (EN default)
5. Detect company location → paper format:
   - US/Canada → `letter`
   - Rest of the world → `a4`
6. Detect role archetype → adapt framing
7. Build an internal recruiter-side risk map from the JD using `modes/heuristics/recruiter-side.md`: likely doubts, matching evidence, and which document section should address each doubt
8. Rewrite Professional Summary by injecting JD keywords + exit narrative bridge ("Built and sold a business. Now applying systems thinking to [JD domain].")
9. Select top 3-4 most relevant projects for the job
10. Reorder experience bullets by JD relevance and by the risk map: strongest matching evidence first
11. Build competency grid from JD requirements (6-8 keyword phrases)
12. Inject keywords naturally into existing achievements (NEVER invent)
13. Apply the six-second clarity gate from `modes/heuristics/recruiter-side.md`: top third must make target role, strongest fit, and proof obvious
14. Read `name` from `config/profile.yml` → normalize to kebab-case lowercase (e.g. "John Doe" → "john-doe") → `{candidate}`
15. Assemble the CV JSON payload (see "JSON payload" below) from the tailored content of Steps 8-13: `summary`, `competencies[]` (Step 11's grid), `experience[]` with the reordered `bullets[]`, the selected `projects[]`, `education[]`, `skills[]`, and — when cv.md has them — the FULL `publications[]` list (never sliced). Write it to `output/cv-{candidate}-{company}-payload.json`.
16. Run `node build-cv-html.mjs output/cv-{candidate}-{company}-payload.json output/cv-{candidate}-{company}.html` to render the ATS-safe HTML. Write to `output/`, NOT a temp dir — the recorded HTML is what the dashboard's `D` hotkey regenerates from, so it must survive temp cleanup. The builder omits any section whose array is empty, so an absent Projects/Certifications section leaves no orphaned heading.
    - **Fallback (rare):** if a role genuinely needs a section-*level* reorder or bespoke markup the builder doesn't model, hand-author the HTML directly from `templates/cv-template.html` and skip the builder. This legacy path exists for the exception, not the default.
17. Execute: `node generate-pdf.mjs output/cv-{candidate}-{company}.html output/cv-{candidate}-{company}-{YYYY-MM-DD}.pdf --format={letter|a4} --report={report number} --max-pages={cv.max_pages from profile.yml, default 2} --verify-text --jd-keywords={the keywords from Step 3, comma-joined}` — `{report number}` is the NNN from the report filename/link (e.g. `008` for `reports/008-acme-….md`), not the tracker `#` column. Pass it whenever the application has (or will have) a report; it records the PDF↔report linkage in `data/pdf-index.tsv` so the dashboard can open and regenerate the exact PDF. Omit it only for one-off CVs with no tracker entry. `--max-pages` defaults to 2 when `config/profile.yml` has no `cv.max_pages` key — set that key (sibling to `cv.output_format`) to override, e.g. for a long publication list that genuinely needs more room.
18. **Verify layout and ATS text-layer, respond to overflow (skip silently if the console says `pdftotext (poppler) is not on PATH` — proceed with whatever the page-count-only check already gave you):**
    a. Read the script's console output: page count vs. `--max-pages`, JD-keyword coverage % (now computed from the compiled PDF's real text layer, not eyeballed), and whether contact info parsed cleanly.
    b. If rasterized page images were reported (`🖼️ Rasterized N page(s)...`), read each one (the `Read` tool renders images natively) and check for: orphaned section/entry titles stranded alone at a page break, text overlap or cutoff, and inconsistent/fallback fonts. This is the same script-measures/agent-judges split already used by the optional Canva sub-flow's thumbnail-inspection step below, just applied to the default path.
    c. **If the page count exceeds the cap or the visual check finds an overflow-driven defect**, work through this ladder, re-running Step 17's command and re-checking after each change, capped at 3-4 rounds before stopping to ask the user rather than looping indefinitely:
       1. **Density nudge (content-preserving, try first):** in `cv-template.html`, `body { line-height: 1.5; }` may be nudged down to as low as `1.35`, and `.section { margin-bottom: 18px; }` down to as low as `12px`. Change one, re-render, re-check — don't drop both at once. Revert to the template defaults (`1.5` / `18px`) once the CV is regenerated for a different role; these are per-run adjustments, not a permanent template edit.
       2. **Content trim (once the density floor is reached and it still overflows):** cut the single least-relevant bullet (weakest tie to the JD keywords from Step 3, and not redundant with anything the cover letter already leans on), re-render, re-check. Repeat one bullet at a time — never cut several speculatively. **Never cut anything from Publications/Certifications/Education** — only Experience/Project bullets are fair game.
       3. **Escape hatch:** if every non-Publications bullet is already cut and it still overflows (a real scenario for a long publication list), stop and tell the user directly — raise `cv.max_pages` in `config/profile.yml`, or accept the current page count. Never silently violate the "complete publication list" rule from `modes/_custom.md` to force a page-count match.
    d. If contact info didn't parse cleanly (`contact.emailFound`/`contact.phoneFound` false) or keyword coverage looks unexpectedly low, that's a rendering issue (e.g. font substitution garbling text) rather than an overflow issue — flag it to the user rather than trying the overflow ladder above, which won't fix it.
19. Report: PDF path, number of pages (vs. cap), JD-keyword coverage % (script-computed), contact-info-parseable (yes/no), and — if Step 18c ran — which bullet(s) were cut and why.

## JSON payload (build-cv-html.mjs)

`build-cv-html.mjs` merges this payload into `templates/cv-template.html` and handles ALL HTML escaping — never pre-escape. Inside a bullet, `**bold**` marks a bold lead phrase; that is the only inline markup (not a markdown parser). Any section whose array is empty or absent is omitted entirely, so no orphaned heading is left behind. Section order is fixed by the template (see "Section order" below); the Step 16 Fallback covers the rare section-reorder case.

```json
{
  "lang": "en",
  "name": "Jane Smith, Ph.D.",
  "phone": "+1 415 555 0100",
  "email": "jane@example.com",
  "linkedin": { "url": "https://linkedin.com/in/janesmith", "display": "linkedin.com/in/janesmith" },
  "portfolio": { "url": "https://scholar.google.com/citations?user=...", "display": "Google Scholar" },
  "location": "Austin, TX (open to relocation)",
  "section_titles": { "publications": "Publications" },
  "summary": "Professional summary text (may use **bold**).",
  "competencies": ["Depth-Profiled XPS", "3D ToF-SIMS", "DFT"],
  "experience": [
    { "company": "Company", "role": "Title", "location": "City, ST", "dates": "2024 - Present", "bullets": ["**Led** a program that…", "Cut cost 30% via…"] }
  ],
  "projects": [
    { "name": "Project", "badge": "OSS", "context": "Python, SQL", "bullets": ["What you built"] }
  ],
  "education": [
    { "degree": "Ph.D., Materials Science", "institution": "UT Austin", "dates": "Dec 2025", "desc": "GPA 3.86/4.00", "coursework": ["Solid State"] }
  ],
  "certifications": [ { "title": "Six Sigma Green Belt", "org": "ASQ", "year": "2024" } ],
  "skills": [ { "category": "Microanalysis", "items": ["XPS", "ToF-SIMS", "FIB-SEM"] } ],
  "publications": [
    { "text": "Guo, Z.; Co-author, A. Paper Title.", "emphasis": "Guo, Z.", "venue": "Adv. Mater.", "detail": "2026, e18490." }
  ]
}
```

- **`publications[]` is the full list from cv.md.** `build-cv-html.mjs` has no truncation code path, so it can never shorten it. Overflow is resolved by the Step 18 ladder (density nudge, then Experience/Project bullet trim), never by cutting publications.
- `emphasis` bolds the candidate's own name at its first occurrence; `venue` renders italic. A publication entry may instead be a plain string when you don't need those.
- `linkedin`/`portfolio`/`github` each take `{ url, display }`; a missing one is skipped (no dangling separator). `photo` is an opt-in field (empty by default — see the profile-photo note).
- `section_titles` is optional and English by default; set it for localized CVs (e.g. German `"experience": "Berufserfahrung"`).

## ATS Rules (clean parsing)

- Single-column layout (no sidebars, no parallel columns)
- Standard headers: "Professional Summary", "Work Experience", "Education", "Skills", "Certifications", "Projects"
- No text in images/SVGs
- No critical info in PDF headers/footers (ATS ignores them)
- UTF-8, selectable text (not rasterized)
- No nested tables
- Distributed JD keywords: Summary (top 5), first bullet of each role, Skills section
- No hidden text, keyword stuffing, or white-font tricks. Optimize for parseability plus human review.

## Recruiter Review Gates

- The summary should answer: "What role is this person targeting, and why this one?"
- The first screen should show 1-2 proof points that map to the JD's highest-risk requirements.
- Bullets should emphasize outcomes, systems, users, or business effects rather than task history.
- Logistics such as location, work authorization, salary, and availability belong in the CV only when appropriate for the market and profile; otherwise handle them in form answers or recruiter scripts.

## PDF Design

- **Fonts**: Space Grotesk (headings, 600-700) + DM Sans (body, 400-500)
- **Fonts self-hosted**: `fonts/`
- **Header**: name in Space Grotesk 24px bold + gradient line `linear-gradient(to right, hsl(187,74%,32%), hsl(270,70%,45%))` 2px + contact row
- **Section headers**: Space Grotesk 13px, uppercase, letter-spacing 0.05em, color cyan primary
- **Body**: DM Sans 11px, line-height 1.5
- **Company names**: accent purple color `hsl(270,70%,45%)`
- **Margins**: 0.6in
- **Background**: pure white

## Section order (optimized "6-second recruiter scan")

1. Header (large name, gradient, contact, portfolio link)
2. Professional Summary (3-4 lines, keyword-dense)
3. Core Competencies (6-8 keyword phrases in flex-grid)
4. Work Experience (reverse chronological)
5. Projects (top 3-4 most relevant)
6. Education & Certifications
7. Skills (languages + technical)
8. Publications (only when cv.md has them — full list, never truncated; renders last)

## Keyword injection strategy (ethical, truth-based)

Examples of legitimate reformulation:
- JD says "RAG pipelines" and CV says "LLM workflows with retrieval" → change to "RAG pipeline design and LLM orchestration workflows"
- JD says "MLOps" and CV says "observability, evals, error handling" → change to "MLOps and observability: evals, error handling, cost monitoring"
- JD says "stakeholder management" and CV says "collaborated with team" → change to "stakeholder management across engineering, operations, and business"

**NEVER add skills that the candidate does not have. Only reword real experience using the exact JD vocabulary.**

## Template HTML

**Before generating: read `modes/_custom.md` (if it exists) and apply its formatting/content house rules to every CV in this session — including every item of a batch.** Rules recorded there (date formats, section-order preferences, content to always/never include) are persistent user instructions, not suggestions; if the user corrects the same thing twice in conversation, write it into `modes/_custom.md` so it stops drifting.

Use the template in `cv-template.html`. Replace the `{{...}}` placeholders with personalized content:

| Placeholder | Content |
|-------------|-----------|
| `{{LANG}}` | CV language code (e.g. `en`, `es`, `ja`, `ar`). Drives language-specific CSS in the template: `ja` enables a CJK font fallback so Japanese renders instead of tofu (□); `ar` enables RTL + Arabic fonts. Use the BCP-47/ISO-639 code that matches the CV language. |
| `{{PAGE_WIDTH}}` | `8.5in` (letter) or `210mm` (A4) |
| `{{PHOTO}}` | Opt-in profile photo (#264). When `profile.yml` has a non-empty `candidate.photo`, replace with `<img class="cv-photo" src="<path-or-data-URL>" alt="{{NAME}}">`; otherwise **remove the whole `{{PHOTO}}` line** so no markup (and no `<img>`) is emitted. Opt-in for DACH/European markets — an absent photo renders identically (pixel-for-pixel) to the photoless layout (US/UK and many-market ATS penalize photos). |
| `{{NAME}}` | (from profile.yml) |
| `{{PHONE}}` | (from profile.yml — include with its separator only when `profile.yml` has a non-empty `phone` value; omit both the `<a href="tel:…">` element and the following `<span class="separator">` otherwise) |
| `{{EMAIL}}` | (from profile.yml) |
| `{{LINKEDIN_URL}}` | [from profile.yml] |
| `{{LINKEDIN_DISPLAY}}` | [from profile.yml] |
| `{{PORTFOLIO_URL}}` | [from profile.yml] (or /es depending on language) |
| `{{PORTFOLIO_DISPLAY}}` | [from profile.yml] (or /es depending on language) |
| `{{LOCATION}}` | [from profile.yml] |
| `{{SECTION_SUMMARY}}` | Professional Summary |
| `{{SUMMARY_TEXT}}` | Personalized summary with keywords |
| `{{SECTION_COMPETENCIES}}` | Core Competencies |
| `{{COMPETENCIES}}` | `<span class="competency-tag">keyword</span>` × 6-8 |
| `{{SECTION_EXPERIENCE}}` | Work Experience |
| `{{EXPERIENCE}}` | HTML for each job with reordered bullets |
| `{{SECTION_PROJECTS}}` | Projects |
| `{{PROJECTS}}` | HTML for top 3-4 projects |
| `{{SECTION_EDUCATION}}` | Education |
| `{{EDUCATION}}` | Education HTML |
| `{{SECTION_CERTIFICATIONS}}` | Certifications |
| `{{CERTIFICATIONS}}` | Certifications HTML |
| `{{SECTION_SKILLS}}` | Skills |
| `{{SKILLS}}` | Skills HTML |

### Profile photo (opt-in, market-specific)

The `{{PHOTO}}` slot is **off by default** and intentionally market-specific:

- **DACH / much of continental Europe** (Germany, Austria, Switzerland): a professional photo is standard and often expected. Opt in by setting `candidate.photo` in `config/profile.yml` (a local file path or a `data:` URL).
- **US / UK / Canada / Australia and many ATS-first markets**: photos are discouraged and can trip bias-avoidance filters. Leave `candidate.photo` empty — the `{{PHOTO}}` line is dropped entirely, no `<img>` is emitted, and the CV renders **pixel-for-pixel identical** to today's photoless layout.

When set, the photo floats into the top corner (mirrored for RTL/Arabic) and the header/summary text wraps beside it; `.cv-photo` in `cv-template.html` controls its size and framing.

## Canva CV Generation (optional)

If `config/profile.yml` has `cv.canva_resume_design_id` set, offer the user a choice before generating:
- **"HTML/PDF (fast, ATS-optimized)"** — existing flow above
- **"Canva CV (visual, design-preserving)"** — new flow below

If the user has no `cv.canva_resume_design_id`, skip this prompt and use the HTML/PDF flow.

### Canva workflow

#### Step 1 — Duplicate the base design

a. `export-design` the base design (using `cv.canva_resume_design_id`) as PDF → get download URL
b. `import-design-from-url` using that download URL → creates a new editable design (the duplicate)
c. Note the new `design_id` for the duplicate

#### Step 2 — Read the design structure

a. `get-design-content` on the new design → returns all text elements (richtexts) with their content
b. Map text elements to CV sections by content matching:
   - Look for the candidate's name → header section
   - Look for "Summary" or "Professional Summary" → summary section
   - Look for company names from cv.md → experience sections
   - Look for degree/school names → education section
   - Look for skill keywords → skills section
c. If mapping fails, show the user what was found and ask for guidance

#### Step 3 — Generate tailored content

Same content generation as the HTML flow (Steps 1-11 above):
- Rewrite Professional Summary with JD keywords + exit narrative
- Reorder experience bullets by JD relevance
- Select top competencies from JD requirements
- Inject keywords naturally (NEVER invent)

**IMPORTANT — Character budget rule:** Each replacement text MUST be approximately the same length as the original text it replaces (within ±15% character count). If tailored content is longer, condense it. The Canva design has fixed-size text boxes — longer text causes overlapping with adjacent elements. Count the characters in each original element from Step 2 and enforce this budget when generating replacements.

#### Step 4 — Apply edits

a. `start-editing-transaction` on the duplicate design
b. `perform-editing-operations` with `find_and_replace_text` for each section:
   - Replace summary text with tailored summary
   - Replace each experience bullet with reordered/rewritten bullets
   - Replace competency/skills text with JD-matched terms
   - Replace project descriptions with top relevant projects
c. **Reflow layout after text replacement:**
   After applying all text replacements, the text boxes auto-resize but neighboring elements stay in place. This causes uneven spacing between work experience sections. Fix this:
   1. Read the updated element positions and dimensions from the `perform-editing-operations` response
   2. For each work experience section (top to bottom), calculate where the bullets text box ends: `end_y = top + height`
   3. The next section's header should start at `end_y + consistent_gap` (use the original gap from the template, typically ~30px)
   4. Use `position_element` to move the next section's date, company name, role title, and bullets elements to maintain even spacing
   5. Repeat for all work experience sections
d. **Verify layout before commit:**
   - `get-design-thumbnail` with the transaction_id and page_index=1
   - Visually inspect the thumbnail for: text overlapping, uneven spacing, text cut off, text too small
   - If issues remain, adjust with `position_element`, `resize_element`, or `format_text`
   - Repeat until layout is clean
e. Show the user the final preview and ask for approval
f. `commit-editing-transaction` to save (ONLY after user approval)

#### Step 5 — Export and download PDF

a. `export-design` the duplicate as PDF (format: a4 or letter based on JD location)
b. **IMMEDIATELY** download the PDF using Bash:
   ```bash
   curl -sL -o "output/cv-{candidate}-{company}-canva-{YYYY-MM-DD}.pdf" "{download_url}"
   ```
   The export URL is a pre-signed S3 link that expires in ~2 hours. Download it right away.
c. Verify the download:
   ```bash
   file output/cv-{candidate}-{company}-canva-{YYYY-MM-DD}.pdf
   ```
   Must show "PDF document". If it shows XML or HTML, the URL expired — re-export and retry.
d. Report: PDF path, file size, Canva design URL (for manual tweaking)

#### Error handling

- If `import-design-from-url` fails → fall back to HTML/PDF pipeline with message
- If text elements can't be mapped → warn user, show what was found, ask for manual mapping
- If `find_and_replace_text` finds no matches → try broader substring matching
- Always provide the Canva design URL so the user can edit manually if auto-edit fails

## Cover Letter Sub-flow

After generating the CV PDF, offer to generate a cover letter:

```text
CV PDF generated: output/{path}

Want a cover letter for this role too?
- Say "yes" or "cover letter" to generate one now
- Or run `/career-ops cover {slug}` later
```

Apply `voice-dna.md` (if present) to the cover letter — full guardrail, conversational voice included (Tier 1 + Tier 2). The CV PDF itself stays Tier 1 only (formal ATS register). See `_shared.md` → Voice DNA.

If the user says yes, run the full cover letter flow from `modes/cover.md` in slug mode:
1. Load the existing `## Cover Letter Draft` from the evaluation report as a starting point
2. Run company research (Step 3 of cover.md)
3. Present keyword list for confirmation (Step 4)
4. Surface any gaps (Step 5)
5. Ask the four prompts: why / problems / approach / tone (Step 6)
6. Draft in chat, wait for approval (Steps 7-8)
7. Generate cover letter PDF via `node generate-cover-letter.mjs` (Step 9)
8. Report both PDF paths

Do not auto-generate the cover letter PDF without going through the interactive steps above.

## Post-generation

Update tracker if the job is already registered: change PDF from ❌ to ✅.
