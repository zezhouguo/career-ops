# Mode: latex — LaTeX/Overleaf CV Export

Export a tailored, ATS-optimized CV as a `.tex` file and compile it to PDF via `tectonic` or `pdflatex`.

## Pipeline

1. Read `cv.md` as source of truth
2. Read `config/profile.yml` for candidate identity and contact info
3. Ask the user for the JD if not already in context (text or URL)
4. Extract 15-20 keywords from the JD
5. Detect JD language → CV language (EN default)
6. Detect role archetype → adapt framing
7. Rewrite Professional Summary injecting JD keywords (same rules as `pdf` mode — NEVER invent skills)
8. Select top 3-4 most relevant projects for the offer
9. Reorder experience bullets by JD relevance
10. Inject keywords naturally into existing achievements
11. Build a JSON payload (see schema below) and write to `/tmp/cv-{candidate}-{company}.json`
12. Run: `node build-cv-latex.mjs /tmp/cv-{candidate}-{company}.json output/cv-{candidate}-{company}-{YYYY-MM-DD}.tex`
13. Run: `node generate-latex.mjs output/cv-{candidate}-{company}-{YYYY-MM-DD}.tex output/cv-{candidate}-{company}-{YYYY-MM-DD}.pdf --max-pages={cv.max_pages from profile.yml, default 2} --verify-text --jd-keywords={the keywords from Step 4, comma-joined}`
    *(Replace `{candidate}`, `{company}`, `{YYYY-MM-DD}` with actual values. `--max-pages` defaults to 2 when `config/profile.yml` has no `cv.max_pages` key.)*
14. **Verify layout and ATS text-layer, respond to overflow** (skip silently if the JSON report's `textVerification.available` is `false` — `pdftotext`/poppler isn't installed; proceed with whatever page count you have):
    a. Read `report.pages` (this script's first-ever page count) against `--max-pages`, `report.textVerification.keywordCoverage.percent`, and `report.textVerification.contact`.
    b. If `report.rasterizedPages` lists image paths, read each one (the `Read` tool renders images natively) and check for orphaned section/entry titles at a page break, overlap, or font issues — same script-measures/agent-judges split as `modes/pdf.md`'s visual-check step.
    c. **On overflow or an overflow-driven visual defect**, work through this ladder, re-running Step 13 and re-checking after each change, capped at 3-4 rounds before stopping to ask the user:
       1. **Density nudge (try first):** in `cv-template.tex`, the `\resumeItem`/`\resumeSubheading`/`\resumeProjectHeading` macros end each entry with `\vspace{-3pt}` or `\vspace{-7pt}` — nudge one of these by 1-2pt more negative (e.g. `-3pt` → `-4pt`) directly in the generated `.tex` before recompiling. LaTeX has much less density headroom than the HTML path (this template is already tightly tuned), so don't push further than 1-2pt per round.
       2. **Content trim:** cut the single least-relevant bullet from `experience[].bullets`/`projects[].bullets` in the JSON payload (weakest tie to the JD keywords, not redundant with the cover letter), rebuild via Step 12, recompile, re-check. One bullet at a time. **Never cut anything from `education[]`/`skills[]`/`publications[]`** — only `experience[]`/`projects[]` bullets are fair game (same rule as the HTML path; the `.tex` template now has a real Publications section, so a publication-heavy CV compiles here too).
       3. **Escape hatch:** if fully trimmed and still overflowing, stop and tell the user — raise `cv.max_pages` or accept the page count, rather than silently violating a "never truncate" content rule.
    d. If `report.textVerification.contact.emailFound`/`phoneFound` is `false`, or coverage looks unexpectedly low, that's a rendering issue (e.g. a LaTeX escaping/font problem), not overflow — flag it rather than running the ladder above.
15. Report: .tex path, .pdf path, file sizes, section count, page count (vs. cap), JD-keyword coverage % (script-computed), contact-info-parseable (yes/no), and any bullet(s) cut in Step 14c.

**Requires:** `tectonic` (preferred — `brew install tectonic`, auto-downloads packages) or `pdflatex` (MiKTeX / TeX Live) on PATH.

## Language support

- **Localized section titles are fine.** The validator counts `\section{}` blocks instead of matching English titles, so a Spanish/French/German CV (e.g. `\section{Educación}`) validates normally.
- **CJK (Japanese / Chinese / Korean) is NOT supported on this path yet.** The template is a pdfLaTeX / Computer-Modern setup with no CJK font, so kana/kanji/hangul cannot render. `generate-latex.mjs` detects CJK characters and stops with guidance. For a Japanese CV, use `pdf` mode (HTML → PDF), which renders CJK via a `lang="ja"` font fallback.

## JSON Input Schema

Write a JSON file with this structure. `build-cv-latex.mjs` handles template merge and LaTeX escaping — no need to escape special characters yourself.

```json
{
  "name": "Jane Smith",
  "contact_line": "San Francisco, CA | +1 415 555 0100",
  "email": { "url": "jane@example.com", "display": "jane@example.com" },
  "linkedin": { "url": "https://linkedin.com/in/janesmith", "display": "linkedin.com/in/janesmith" },
  "github": { "url": "https://github.com/janesmith", "display": "github.com/janesmith" },
  "education": [
    {
      "institution": "University Name",
      "location": "City, State",
      "degree": "Bachelor of Science in Computer Science",
      "dates": "2018 - 2022",
      "coursework": ["Data Structures", "Algorithms", "Machine Learning"]
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "location": "Remote",
      "dates": "June 2022 - Present",
      "bullets": [
        "Achievement bullet with JD keywords injected",
        "Another bullet with quantified impact"
      ]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "context": "Tech stack summary for the project line",
      "dates": "",
      "bullets": [
        "What you built and what it does"
      ]
    }
  ],
  "skills": [
    { "category": "Languages", "items": "Python, JavaScript, C++" },
    { "category": "Frameworks", "items": "FastAPI, React, PyTorch" }
  ],
  "publications": [
    {
      "text": "Smith, J.; Doe, A. A Study of Something Important.",
      "emphasis": "Smith, J.",
      "venue": "Journal Name",
      "detail": "2024, 12 (3), 45-67."
    }
  ]
}
```

`publications[]` is optional; when present it renders a Publications section (full list, never truncated — mirrors `build-cv-html.mjs`). Omit the key entirely and no section is emitted.

### Field reference

| Field | Type | Source |
|-------|------|--------|
| `name` | string | `profile.yml → candidate.full_name` |
| `contact_line` | string | Phone / City, State / Visa — built from profile.yml |
| `email.url` | string | Email for `\href{mailto:...}` (sanitized via sanitizeUrl, not LaTeX-escaped) |
| `email.display` | string | Display text for the email link |
| `linkedin.url` | string | Full URL with scheme for `\href{}` (sanitized via sanitizeUrl, not LaTeX-escaped) |
| `linkedin.display` | string | Display text only (no scheme) |
| `github.url` | string | Full URL with scheme for `\href{}` (sanitized via sanitizeUrl, not LaTeX-escaped) |
| `github.display` | string | Display text only (no scheme) |
| `education[].institution` | string | From cv.md Education |
| `education[].location` | string | Institution location |
| `education[].degree` | string | Degree name |
| `education[].dates` | string | Date range |
| `education[].coursework` | string[] | Optional — generates a coursework line if present |
| `experience[].company` | string | From cv.md Experience |
| `experience[].role` | string | Job title |
| `experience[].location` | string | Work location |
| `experience[].dates` | string | Date range |
| `experience[].bullets` | string[] | Reordered and keyword-injected achievement bullets |
| `projects[].name` | string | From cv.md Projects |
| `projects[].context` | string | Tech stack — appears next to project name |
| `projects[].dates` | string | Date range (or empty) |
| `projects[].bullets` | string[] | Selected project achievements |
| `skills[].category` | string | Skill category name (e.g. "Languages", "Frameworks") |
| `skills[].items` | string | Comma-separated skills in that category |
| `publications[]` | object\|string | Optional — full list from cv.md; renders a Publications section (never truncated). Each entry `{text, emphasis, venue, detail}` (emphasis bolded, venue italic) or a plain citation string. |

## LaTeX Escaping (handled by the script)

`build-cv-latex.mjs` automatically escapes all user-supplied text before insertion:

| Character | Escape |
|-----------|--------|
| `&` | `\&` |
| `%` | `\%` |
| `$` | `\$` |
| `#` | `\#` |
| `_` | `\_` |
| `{` | `\{` |
| `}` | `\}` |
| `~` | `\textasciitilde{}` |
| `^` | `\textasciicircum{}` |
| `\` | `\textbackslash{}` |
| `±` | `$\pm$` |
| `→` | `$\rightarrow$` |

**Exception:** URLs inside `\href{}` are NOT escaped by the LaTeX escaper, but `sanitizeUrl()` still validates the scheme (mailto/http/https) and removes dangerous characters to prevent injection.

## ATS Rules (same as pdf mode)

- Single-column layout (enforced by template)
- Standard section headers: Education, Work Experience, Personal Projects, Technical Skills
- UTF-8, machine-readable via `\pdfgentounicode=1`
- Keywords distributed: first bullet of each role, skills section
- No images, no graphics, no color in body text

## Keyword Injection Strategy

Same ethical rules as `modes/pdf.md`:
- NEVER add skills the candidate doesn't have
- Only reformulate existing experience using JD vocabulary
- Examples:
  - JD says "RAG pipelines" → reword "LLM workflows with retrieval" to "RAG pipeline design"
  - JD says "MLOps" → reword "observability, evals" to "MLOps and observability"

## Overleaf Compatibility

The generated `.tex` file uses only standard CTAN packages (no custom or bundled dependencies):

- `latexsym`, `fullpage`, `titlesec`, `marvosym`, `color`, `verbatim`, `enumitem`
- `hyperref`, `fancyhdr`, `babel`, `tabularx`, `fontawesome5`, `multicol`, `glyphtounicode`

Upload the `.tex` file directly to Overleaf — compiles with no extra configuration.
