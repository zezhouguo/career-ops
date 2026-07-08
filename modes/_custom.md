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

## Custom Workflows

<!-- Multi-step routines you run often, given a short name. Examples:
     - "weekly review": scan my saved portals, evaluate the new roles,
       then give me a one-paragraph summary of the top 3.
     - "prep <company>": pull the JD, generate STAR stories from
       article-digest.md, and draft 5 likely interview questions. -->

(none yet -- add yours above)

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

## Off-Limits

<!-- Things the agent must never do for you. Examples:
     - Never auto-fill or submit an application without showing me first.
     - Never edit a system file to customize my setup -- put it here. -->

(none yet -- add yours above)
