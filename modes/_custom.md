# Custom Instructions -- career-ops

<!-- ============================================================
     THIS FILE IS YOURS. It will NEVER be auto-updated.

     Put your own house rules, custom workflows, and automations
     here -- anything you want the agent to ALWAYS do (or never do).

     This is for PROCEDURAL rules ("HOW I want things done").
     For WHO you are (archetypes, narrative, comp, negotiation),
     use modes/_profile.md instead. Keeping the two separate keeps
     each one readable.

     The agent reads this file alongside the system instructions;
     your rules here take precedence over the defaults, as long as
     they don't break the Data Contract (your files are never
     touched, and we never auto-submit an application for you).

     Because this is a user-layer file, anything you write here
     survives `node update-system.mjs`. Put customizations HERE,
     not in CLAUDE.md / modes/_shared.md / other system files --
     those get overwritten on update.
     ============================================================ -->

## House Rules

<!-- Rules the agent should always follow. Examples:
     - Always write evaluation summaries in British English.
     - Never include a photo in my CV (US / ATS-first market).
     - Cap each batch run at 20 listings unless I say otherwise.
     - If a report scores below 6, skip the cover letter. -->

- **Language: converse in Chinese, produce documents in English.** All chat replies, explanations, and questions to me should be in Chinese (中文). But every created work-product stays in English regardless of chat language: CVs, cover letters, application-form answers, recruiter/outreach emails, reports, the tracker (`data/applications.md`), and any file content. (Rationale: US-based, English-language job search — documents must be in English to be usable.)

## Career-Pivot Intent — Apply-Line Override (set 2026-07-08)

The user has **explicitly accepted a career pivot from battery R&D into semiconductor metrology / failure analysis (FA) / materials characterization, and into cross-industry general-materials-science R&D.** This is the "specific reason" the scoring bands reserve for the 3.5–3.9 range — and the user has chosen to extend it down to 3.0 for this role-class.

**The rule — a `[pivot-target]` tag with a lowered apply line:**

1. **Role-class in scope (pivot-target).** A role is `[pivot-target]` when its core function is any of:
   - Semiconductor **metrology**, **failure analysis (FA)**, **materials characterization**, or closely adjacent **defect / yield / reliability** engineering whose day-to-day centers on characterization/FA method.
   - Cross-industry **general-materials-science R&D** (e.g. general materials scientist / analytical R&D roles at non-battery companies such as 3M, Arcturus, Entegris).
   - Core **battery** R&D roles are NOT pivot-targets — they keep the standard 4.0 apply line.

2. **Effective apply line for pivot-targets = 3.0** (instead of the default 4.0). A `[pivot-target]` role scoring **≥ 3.0** is treated as **"worth applying / passes the line"** in recommendations and list-sorting, not "recommend against." Below 3.0 → still recommend against. Non-pivot roles are unaffected (4.0 line stands).

3. **This changes the *recommendation*, never the *number*.** The 1–5 global score stays exactly as scored (report Machine Summary, tracker Score column). Only the apply/recommend-against verdict shifts. When a role passes via this override, say so explicitly: e.g. "3.3/5 — below the standard 4.0 line, but passes as a **[pivot-target]** (accepted battery→semiconductor pivot)." Never silently present a 3.x as a clean pass.

4. **Hard blockers still disqualify, regardless of the pivot tag** — these are structural, not fit gaps, and a pivot does not fix them:
   - An **explicit no-sponsorship clause** ("must be authorized to work without sponsorship / without restriction"). The user needs sponsorship; such a role is excluded no matter the score.
   - A **confirmed ITAR / export-control US-person requirement** (a stated gate, not a mere "confirm with recruiter" note).
   - A **duplicate application to an org/team where the user has already Applied** (e.g. don't re-apply to a Micron PYE org already covered by an Applied req).
   Merely *unconfirmed* sponsorship / export-control (the normal "confirm on the recruiter call" state) is NOT a hard blocker — pass it but flag it.

5. **Always surface the fit caveats too.** Passing the line ≠ hiding the gaps. Keep naming the domain gaps (EUV-litho, hands-on TEM, 300mm-fab min-quals, level reset, relocation, comp-floor risk) so the user still applies with eyes open. Down-level and comp-floor risk are flags, not auto-blocks.

## Reference & Operational Rules (cross-CLI — mirrored from Claude auto-memory)

<!-- These lived only in Claude Code's auto-memory, which other CLIs (Codex, etc.)
     cannot read. Mirrored here so any CLI that loads _custom.md honors them.
     These are procedural/reference rules and liveness handling — NOT content
     sources for CV/cover claims. -->

- **Undergrad transcript (metallurgy/materials coursework) — pointer + framing rule.** A verified HUST B.Eng. transcript (Materials Science & Engineering, 2016–2020) is at `~/Downloads/Degree/11199020_en.pdf`. When a `[pivot-target]` role asks for fundamentals the CV does not surface (metallurgy, composites/MMC, powder/additive feedstock, mechanical/physical-properties testing), you MAY cite the relevant courses — but **only as undergraduate coursework, never as professional experience** (that conflation is forbidden). Read the transcript to pull exact course names; place them in a "Relevant coursework" line under the HUST degree and state plainly in any cover that they are coursework, not industry. **Laser / metal-additive (LPBF/DED) is NOT on the transcript** — do not claim it; nearest backing is "Powder Materials Forming" (soften as a ramp base). The course list itself is content: if it should become permanent CV material, it belongs in `cv.md`/`article-digest.md`, not here.

- **Tesla postings — verify liveness with Playwright, not `check-liveness.mjs`.** Tesla careers pages sit behind an Akamai WAF that blocks the API/curl rung, so `check-liveness.mjs` returns false "expired" signals. Always verify Tesla postings with a real browser (title + JD + Apply = active; footer/nav-only or redirect to generic search = closed). NOTE on tooling: Playwright is a project npm dependency (not a Claude-only MCP), so the library is available under any CLI including Codex. The real constraint is that beating Tesla's Akamai wall needs a **headed** browser, which requires a graphical display — fine in interactive `codex`/Claude on the Mac, but not in a truly headless `codex exec` (no display to open a window). When no headed browser can run, mark the report `**Verification:** unconfirmed` and have the user verify manually rather than trusting a false expired.

## Custom Workflows

<!-- Multi-step routines you run often, given a short name. Examples:
     - "weekly review": scan my saved portals, evaluate the new roles,
       then give me a one-paragraph summary of the top 3.
     - "prep <company>": pull the JD, generate STAR stories from
       article-digest.md, and draft 5 likely interview questions. -->

### "package <company | report#>" — full application package

When I say **"package <company/report#>"** (or "生成 package"), run this end-to-end. It composes the `pdf`, `cover`, and `apply`/`email` modes under the Application-Package Generation Workflow below (all of that workflow's rules still apply — this is a named shortcut, not an exception to them).

1. **Restate the request and confirm scope** before generating (which role, any relocation/framing questions). Read the matching `reports/{NNN}-*.md`, plus `cv.md`, `config/profile.yml`, `modes/_profile.md`, and `article-digest.md` if present.
2. **Re-verify liveness** with the cheapest reliable rung (`check-liveness.mjs` for ATS; Playwright/manual for Tesla and non-ATS — see the Tesla rule above). Abort and tell me if the posting is dead.
3. **Generate the tailored CV** via the `pdf` path: a role-tailored HTML → PDF, keeping the **complete publication list** (never truncated) and covering every JD-named skill I can back, per Output Preferences.
4. **Generate the cover letter** (HTML → PDF), running the `humanizer` skill on all narrative prose.
5. **Generate the apply-packet** (`output/apply-packet-{slug}-{date}.md`): honest answers to the **real** form fields (fetch them from the ATS API when possible — e.g. Greenhouse `?questions=true`, Ashby posting API), a form-logistics block (work auth / sponsorship using the H-1B-transfer framing in `profile.yml`, location, on-site confirm), any knockout/screening questions flagged with the honest answer, plus a draft application email (never invent a recipient address).
6. **Output the mandatory JD-requirement comparison table** (evidence → placement, with gap rows) in the exact format defined in the Application-Package Generation Workflow.
7. **Flag every gap** (missing/partial/adjacent) and ask me **claim / soften / drop** for each; wait for my decision before finalizing.
8. **Do NOT touch tracker status yet** — leave the row `Evaluated`. Record a note that the package is built and awaiting my review. **Never submit, send, or click Apply** — I review and submit myself; only after I confirm submission do you set the row to `Applied` (via `set-status.mjs`) and seed a follow-up (`followup-seed.mjs`).

Deliverables land in `output/`: `cv-zezhou-guo-{slug}-{date}.pdf`, `{slug}-cover.pdf`, `apply-packet-{slug}-{date}.md`.

## Output Preferences

<!-- How you like results formatted. Examples:
     - Reports: lead with the score and the one-line verdict.
     - Show the per-step token breakdown after a batch run.
     - Save PDFs date-first: YYYY-MM-DD-company.pdf -->

- **CVs: always show the COMPLETE publication list.** Never truncate to "Selected Publications" or a top-N subset. Every generated CV (for any role) must include my full publication list from `cv.md`, in the same order. Applies to all packages, not just one role.
- **Skills: cover every skill the JD names, and flag my gaps explicitly.** When tailoring the Skills section for any role, include every skill/technique/tool the JD mentions that I can legitimately back from `cv.md` / `article-digest.md` / my direct statements. For any JD-named skill I may NOT have (or where my evidence is partial/adjacent — e.g. related material but not the exact one), do NOT silently insert or omit it: surface it to me as an explicit gap ("JD asks X; your evidence is Y — claim it, soften it, or drop it?") and let me decide before finalizing. Applies to all packages.

## Application-Package Generation Workflow (ALWAYS follow for every package)

<!-- Standing rule set by the user on 2026-07-07. Applies to EVERY application
     package I generate from here on (CV, cover letter, application email, form
     answers) for any role — not just one company. -->

Whenever I generate any application material (tailored CV, cover letter, application email, or form answers) for any role, ALWAYS do all of the following:

1. **Run the `humanizer` skill on all generated prose.** Every piece of human-facing written content (cover letter body, email body, summary rewrites, free-text form answers) must be passed through the `humanizer` skill so it does not read as AI-generated. Do NOT skip this. (The CV bullet points are drawn verbatim from `cv.md` and are exempt, but any new connective/narrative prose I write is not.)
2. **Show me the JD-to-material mapping.** Before finalizing, present an explicit mapping of how the CV and cover letter address the JD: which JD requirement each tailored bullet / paragraph / skill answers. A short table (JD requirement → material evidence → match strength) is the expected format.
3. **Flag every potential gap and ask how to handle it.** Surface each gap where the JD asks for something my evidence does not fully cover (missing, partial, or adjacent). For each gap, ask me explicitly whether to **claim it, soften it, or drop it** — and wait for my decision before finalizing the material. Never silently paper over a gap or fabricate coverage.
4. **Before starting a new package, organize the request and clarify.** Restate what I'm asking for, and ask about anything unclear or ambiguous (scope, format, relocation/logistics, framing choices) before generating.
5. **Always output a JD-requirement comparison table (evidence → placement).** For every package, produce one table per role mapping each JD requirement to the backing evidence and where that evidence lands in each document. Use this exact column layout and legend:

   | JD requirement | Evidence (cv.md source) | In CV (where) | In Cover (where) | Match |
   |---|---|---|---|---|

   - **Match legend:** ✅ strong · ⚠️ partial/adjacent · ➖ not present in that document.
   - **"In CV (where)"** names the concrete slot(s): Summary, a specific competency tag, which role's bullet (and note if elevated/placed on top), and which Skills group.
   - **"In Cover (where)"** names the slot: opening, profile paragraph, which selected bullet (bullet 1-4), or the "problems I'll solve" paragraph. Use ➖ when the evidence lives only in the CV.
   - **Gap rows are mandatory.** Every gap the JD exposes gets its own row showing how it is handled: in the CV it is normally ➖ (not surfaced, just closest evidence elevated); in the Cover state whether it is surfaced directly (claim/soften) or dropped, quoting the phrase used.
   - Principle: the CV carries the full searchable record (reordered, never flags gaps); the Cover carries selected evidence plus the wording that faces gaps head-on.

## Off-Limits

<!-- Things the agent must never do for you. Examples:
     - Never auto-fill or submit an application without showing me first.
     - Never edit a system file to customize my setup -- put it here. -->

(none yet -- add yours above)
