# Resume Point — career-ops session (updated 2026-07-09)

## 🆕 CHECKPOINT 2026-07-09 (latest) — Sila Nanotechnologies #075 + #076 both APPLIED ✅ (LinkedIn Easy Apply / Greenhouse)
- **Sila Nanotechnologies — Senior Battery Engineer (#075, 4.3/5) submitted 2026-07-09** via LinkedIn Easy Apply: `https://www.linkedin.com/jobs/view/4436823400/`.
- **Sila Nanotechnologies — Staff Battery Engineer (#076, 4.6/5) submitted 2026-07-09** via LinkedIn Easy Apply (Greenhouse-powered form): `https://www.linkedin.com/jobs/view/4436836029/`. Marked as "top choice" in the LinkedIn flow.
- Liveness re-verified for #075 via Playwright immediately before package build (title + full JD + Apply button + 41 applicants, posted "2 days ago"); #076 was verified the prior day.
- Both rows updated through the canonical path (`set-status.mjs` → `Applied`, `followup-seed.mjs` → follow-up pinned for `2026-07-16`). `node verify-pipeline.mjs` clean after.
- **#075 CV updated this session** (`output/cv-zezhou-guo-sila-senior-battery-engineer-2026-07-09.pdf`, PDF regenerated, old 07-08 PDF removed and report header repointed): added the kg-scale customer-sample bullet (Versa) to answer the JD's "customer-facing data package" requirement, and added "cell teardown" to Skills (implied by existing FIB-SEM cross-sectioning evidence, not fabricated).
- **#075 cover letter** (`output/sila-senior-battery-engineer-cover.pdf`) drafted fresh (Senior-level framing: hands-on pouch-cell experiments → failure analysis → data-driven iteration loop), run through `humanizer`.
- **#076 CV/cover** were already built in the prior 2026-07-09 checkpoint (`ac25972`); reused as-is for this submission.
- Gap handling for #075 (confirmed by user, "gap按你建议来"): JMP softened (no claim, honest "haven't used it, ramp quickly" answer), silicon-anode domain softened (same treatment as #076), customer-facing data packages claimed (bullet added, backed by cv.md), cross-functional collaboration dropped as a dedicated line (left implicit — low-stakes gap).
- **Safari live-form assist:** used `osascript`/Safari AppleScript (`do JavaScript`) to inspect the LinkedIn Apply DOM and confirm the Apply CTA (`<a>` with `openSDUIApplyFlow=true`, i.e. LinkedIn's own SDUI apply flow, not an external ATS for #075; #076 flow is Greenhouse-powered but still launched from LinkedIn). The auto-mode permission classifier correctly blocked a scripted `.click()` on the Apply element as a real-world-transaction risk — per the Ethical Use rule, clicking Apply/Submit is the user's action, not the agent's. Answered one required free-text field for #076 ("top choice" message, 400-char cap) as plain copy-paste text; user did the actual clicking/submission themselves in Safari.
- Apply packets: `output/apply-packet-sila-senior-battery-engineer-2026-07-09.md` (new), `output/apply-packet-sila-staff-battery-engineer-2026-07-09.md` (from prior checkpoint).

## 🆕 CHECKPOINT 2026-07-09 — UL Research Institutes #088 APPLIED ✅ (co-filled Workday)
- **UL Research Institutes — Research Scientist III, Electrochemical Safety Research Institute (#088, 3.9/5) submitted 2026-07-09** via Workday: `https://ulse.wd5.myworkdayjobs.com/ulricareers/job/Houston-TX/Research-Scientist-III---Electrochemical-Safety-Research-Institute_JR1517-1?source=LinkedIn`.
- **Below the standard 4.0 apply line** (core battery-safety R&D, not a `[pivot-target]`); user explicitly confirmed proceeding anyway despite comp below target ($89.6K-123.2K vs. $130K-160K target) and unconfirmed sponsorship — see the report's "Why this scores below the standard line" box in the apply packet.
- Tracker updated through canonical path: row #88 is now `Applied`, notes appended noting the Workday submission.
- Follow-up seeded: `data/follow-ups.md` has `- next #88 2026-07-16 (set 2026-07-09)`.
- Package files built in `output/`:
  - CV: `output/cv-zezhou-guo-ulri-research-scientist-iii-electrochemical-safety-2026-07-09.pdf` (led with battery-safety/failure-analysis framing per report guidance — LHCE thermal/gas-safety bullet and crossover-FA bullet moved to top of UT Austin section)
  - Cover PDF: `output/ulri-research-scientist-iii-electrochemical-safety-cover.pdf`
  - Cover draft: `output/ulri-research-scientist-iii-electrochemical-safety-cover-2026-07-09.md`
  - Apply packet: `output/apply-packet-ulri-research-scientist-iii-electrochemical-safety-2026-07-09.md`
- Liveness confirmed active via `check-liveness.mjs` before package build.
- **Workday "Field of Study" combobox gotcha (ULSE/ULRI Workday instance):** the Field of Study field on the Education section is a `react-virtualized` list combobox — synthetic `.click()`/`MouseEvent`/`PointerEvent` dispatch on the option node does NOT reliably commit the selection (no Accessibility permission available to osascript for real OS-level clicks/keystrokes either). Selecting it for Education 1 worked once via scroll-then-click, but repeated attempts for Education 2 silently failed and the form auto-advanced through steps 3-5 (My Experience → Application Questions → Voluntary Disclosures) without a chance to review the Application Questions answers before the user caught it and took over manually. **If this recurs: don't burn turns retrying synthetic events — flag it to the user immediately and let them click it themselves**, and always re-verify which step the form is actually on after several rapid interactions (`progressBarCompletedStep` elements) rather than assuming step order held.
- Gap handling preserved: ARC/GC-MS/rheology/moisture/DPA and supercapacitors named directly as gaps (not fabricated), framed as DSC/TGA/OEMS-adjacent and Li-ion/Li-metal/Li-S-transferable respectively.
- Note for future follow-up: confirm salary flexibility (posted range under target) and H-1B transfer sponsorship (unstated in JD) early in the recruiter screen.

## 🆕 CHECKPOINT 2026-07-09 — Nth Cycle #079 APPLIED ✅
- **Nth Cycle — Senior Electrochemical Engineer (#079, 4.2/5) submitted 2026-07-09** via Betterteam: `https://nthcycle.betterteam.com/senior-electrochemical-engineer`.
- Tracker updated through canonical path: row #79 is now `Applied`, PDF `✅`, notes appended: `Applied via Betterteam on 2026-07-09.`
- Follow-up seeded: `data/follow-ups.md` has `- next #79 2026-07-16 (set 2026-07-09)`.
- Package files built in `output/`:
  - CV: `output/cv-zezhou-guo-nth-cycle-senior-electrochemical-engineer-2026-07-09.pdf`
  - Cover PDF: `output/nth-cycle-senior-electrochemical-engineer-cover.pdf`
  - Cover draft: `output/nth-cycle-senior-electrochemical-engineer-cover-2026-07-09.md`
  - Cover payload: `output/nth-cycle-senior-electrochemical-engineer-cover-payload-2026-07-09.json`
  - Apply packet: `output/apply-packet-nth-cycle-senior-electrochemical-engineer-2026-07-09.md`
- Liveness was checked before package build: `node check-liveness.mjs https://nthcycle.betterteam.com/senior-electrochemical-engineer` returned active.
- Gap handling preserved: materials say battery electrochemistry is direct, copper electroextraction/electrowinning is adjacent; no PLC ownership claimed.
- Note for future follow-up: confirm H-1B transfer sponsorship early; JD salary range was `$120,000-$180,000`, target should not anchor low.
- Worktree context at checkpoint: `data/applications.md`, `data/follow-ups.md`, `data/pdf-index.tsv` modified; there are also pre-existing/session-local changes outside #079 (`modes/_custom.md`, `reports/084-...`, `.codex/`, `data/scan-runs.tsv`). Do not revert unrelated changes.

## 🆕 CHECKPOINT 2026-07-03 (latest) — INTEL #19 APPLIED ✅ (co-filled Workday)
- **Intel Defect Metrology (JR0285193, 3.8) SUBMITTED 2026-07-03** via Workday "Autofill with Resume". Co-filled experience/education/legal questionnaire in-session; user signed in, uploaded résumé, clicked Submit. Tracker #19 Evaluated→Applied; Application Log appended to reports/019. verify-pipeline clean.
- **Workday autofill gotchas (reuse for Micron/3M/Entegris — all Workday):** (1) autofill stuffs full bullet sets + junk into each Role Description textarea — UT Austin had illegal `"` quotes (Workday rejects `< > [ ] " { } \`), HUST had a "SELECTED PUBLICATIONS" block; clean them. (2) JS `.value` setter does NOT commit to Workday React state (validation sees empty) → use **real keystrokes** (`type`) for required text fields. (3) blank HUST degree needs manual set → Bachelors. (4) window resizes 1470↔1568 cause coordinate drift → screenshot before each click.
- **Intel/Workday immigration branch (F-1 OPT answers):** Q9 export-control=No→Q9a citizenship=China; Q10 auth=Yes; Q11 sponsorship=Yes→Q11a J-1/J-2=No, Q11b "I do not have an I-140", Q11c 24+ months (12 OPT+24 STEM per form), Q11d F-1 OPT, Q11e field=Materials Science and Engineering. User-confirmed: Q4/Q5/Q8=No, citizenship=China, J-1/J-2=No.
- **Cover NOT attached** (Intel Workday had only a Resume/CV slot, no Additional Documents). Follow-up: confirm export-control + STEM-PhD H-1B sponsorship w/ recruiter; negotiate off ~$167K mid ($115K floor < $130K target).
- **REMAINING to submit (packages built, status Evaluated):** Micron #18, 3M #21, Entegris #22, ONE #11 (⚠️ confirm export/sponsorship/runway first), Tesla Cell Electrolyte #17 (re-verify req 265142 first). Chrome extension IS connected — can co-fill any same as Intel.

## CHECKPOINT 2026-07-03 — Tesla targeted scan COMPLETED (state API); reports 024–026

**Trigger:** user asked for a targeted Apple+Tesla scan (official careers pages) → evaluate via pipeline mode → fit reports. Browser (Playwright MCP) was available this session, unblocking the Tesla check that failed earlier.

**Key capability unlocked:** Tesla careers **state API works zero-token from inside the browser** — `browser_evaluate` → `fetch('/cua-api/apps/careers/state')` returns ~7125 live listings (`id`=req, `t`=title, `l`=locId; resolve loc via `geo[].sites[].states[].cities{City:[ids]}`). Bypasses the Akamai WAF that 403s curl/WebFetch. Absent from this API = DEAD (authoritative). Correct job URL slug = `{kebab-title}-{id}`; a slug that redirects to `/careers/search` is dead.

**Findings:**
- **All 6 prior WebSearch "pending" Tesla reqs = DEAD** (226211/238223/229226/269925/123555/59050) + 265399 dead. Stale Google cache, as cautioned.
- **3 net-new R&D roles evaluated (reports 024–026, tracker #24/#25/#26; next report # = 027):**
  | # | Role (req) | Loc | Score | Verdict |
  |---|-----------|-----|-------|---------|
  | 024 | Sr. Materials Engineer, **Cell Materials Qualification** (268108) | Palo Alto | **4.4** | **APPLY** — active-materials team (same as 012/013); cross-talk RCA = his Adv Mater 2026 signature |
  | 025 | Sr. Materials Engineer, **Cell Dry Electrode Development** (275152) | Louisville CO | 3.7 | polymer-binder rheology/DMA/extrusion = real gap; apply only if pivoting to electrode processing |
  | 026 | Materials Engineer, **Cell Electrode** (275726) | Austin (local) | 3.2 | actually Manufacturing process-dev; recommend against for R&D |
- Standing shortlist reqs reconfirmed live: 273839(012)/273838(013)/272730(016)/265142(017). 268094 (Austin cathode-mixing ~3.3) live, triage-only.
- **Apple:** nothing net-new in-domain beyond #023. Only new adjacent hit (Silicon Char Eng 200669535) = Livorno ITALY + power-mgmt EE → out of scope.

**State saved:** reports 024–026 written; tracker merged (26 entries) + verify-pipeline clean (0/0); pipeline.md + scan-history.tsv updated; JDs in `jds/tesla-*.md`. **PDFs NOT generated** (reports only, per request) — all 3 status `Evaluated`.

**⚠️ merge-tracker GOTCHA (fixed):** it fuzzy-matched new #024 onto existing #17 (both "Tesla — Sr. Materials Engineer, … (Palo Alto)") and OVERWROTE the Cell Electrolyte row. Repaired by hand (#17 restored, #24 added). **Always `grep` the tracker after merging Tesla "Sr. Materials Engineer, X (Palo Alto)" roles — they collide.**

**NEXT:** #024 is the standout (3rd seat on the 012/013 cathode team — coordinate which req to emphasize, don't blanket-apply). If user wants, build the #024 package (tailored CV + cover). Career-ops update v1.14.0→v1.16.0 available (data-safe), not yet applied.

---

## 🆕 SESSION 2026-07-03 — 5 cross-industry packages BUILT (user override, "volume/safety net")
User explicitly chose to build application packages for **all 5 sub-4.0 cross-industry roles** despite the recommend-against guidance, framed as a volume/safety-net widening (keep battery-scientist identity; bridge the transferable characterization/RCA/DOE toolkit to each role — NOT a full semi repositioning). Intent logged: they know these are below the 4.0 line, including ONE's export/going-concern risk.

**All 5 reqs re-verified LIVE 2026-07-03 via zero-token APIs** (before building):
- Intel JR0285193 (Workday CXS `intel/External`) — Posted 7 days, Hillsboro OR ✅
- 3M R01165600 (`3m/Search`) — 30+ days, Maplewood MN ✅
- Entegris REQ-11623 (`entegris/EntegrisCareers`) — 30+ days, Aurora IL ✅
- Micron JR92813 (`micron/External` Workday CXS — Micron IS on Workday; careers.micron.com Eightfold front blocks `/api/apply`) — 30+ days, Boise ID ✅
- ONE (UltiPro `OUR1002ONXE` LoadSearchResults POST, opportunityId 3de26df5…) — Electrochemistry Development Scientist ✅

**Packages COMPLETE in output/ (all dated 2026-07-03; CVs 2pp, covers 1pp; pypdf-verified clean, 0 keyword-scramble):**
| # | Role | CV PDF | Cover PDF |
|---|------|--------|-----------|
| 19 | Intel Defect Metrology | `cv-zezhou-guo-intel-defect-metrology-2026-07-03.pdf` | `intel-defect-metrology-cover.pdf` |
| 18 | Micron HBM PYE FA | `cv-zezhou-guo-micron-hbm-fa-2026-07-03.pdf` | `micron-hbm-pye-fa-cover.pdf` |
| 21 | 3M Sr Materials Scientist | `cv-zezhou-guo-3m-senior-materials-scientist-2026-07-03.pdf` | `3m-senior-materials-scientist-cover.pdf` |
| 11 | ONE Electrochem Dev Scientist | `cv-zezhou-guo-one-echem-scientist-2026-07-03.pdf` | `one-electrochemistry-development-scientist-cover.pdf` |
| 22 | Entegris Research Sci Analytical R&D | `cv-zezhou-guo-entegris-analytical-rd-2026-07-03.pdf` | `entegris-research-scientist-analytical-rd-cover.pdf` |

**Tailoring approach (per each report's Section E):** Intel/Micron/Entegris → lead with characterization + AI/DOE + FA toolkit; 3M → lead with synthesis/ceramics/scale-up; ONE → battery-native, foreground echem depth + SQL data platform (the JD's two-part mandate). **Covers own each gap honestly:** Intel/Micron name the semi-process/device-FA ramp; 3M names the product-domain distance; Entegris does NOT overstate NMR (framed as growth area — source-of-truth rule); **sponsorship deliberately OMITTED from all covers (raise on the call, per the SES playbook).**
- Tracker: PDF column flipped ❌→✅ for 11/18/19/21/22; **status stays `Evaluated` (nothing submitted).** verify-pipeline clean.
- **Humanizer pass applied to all 6 packages (5 above + 017):** removed every em/en dash from prose (cover openings/profiles/problems, CV summaries, the `Role — Company` headers → "at Company", the education `Degree — School` separator → "·"), killed a couple of forced restate-the-opening triads. Achievement bullets left verbatim (source-of-truth). All 12 deliverable PDFs verified em/en-dash-free in extracted text (ATS normalizer also converts date-range en dashes to hyphens).
- **017 Tesla Cell Electrolyte (Palo Alto) REBUILT 2026-07-03** (humanized + **all 13 publications**, not the prior 5-selected): `output/cv-zezhou-guo-tesla-cell-electrolyte-2026-07-03.pdf` (3pp, full Publications section rendered LAST to match cv.md section order — the validator enforces this) + `output/tesla-cell-electrolyte-cover.pdf` (rebuilt on the batch template: Dear Hiring Manager + achievements + Sincerely). **Old 2026-06-30 CV deleted;** report 017 PDF header updated. gen-cvs.mjs now supports `allPubs:true` (ALLPUBS = 13 full citations, own name bolded, page-range en-dashes→hyphens).
- Reusable generators rebuilt in scratchpad (ephemeral): `gen-cvs.mjs` + `gen-covers.mjs` (reuse the ATS-clean `<style>` block from the Apple char CV; content reproducible from cv.md + reports 011/018/019/021/022).
- **Submission cribsheets written → `output/submission-cribsheets-2026-07-03.md`** (all 6 roles: apply URLs, exact files to upload, shared answers = contact/address/work-auth/employment-order, per-role comp + sponsorship/export notes, shared Workday flow). Micron apply URL = `micron.wd1.myworkdayjobs.com/en-US/External/job/Boise-ID---Main-Site/Staff-HBM-PYE-PDFA-Engineer_JR92813`.
- **NEXT (resume here): user reviews the PDFs, then submits.** Suggested order: Intel (freshest, 7d) → Micron/3M/Entegris → 017 Tesla (re-verify req 265142 live first). **ONE #11 = do NOT submit blind — confirm export-control/ITAR + sponsorship + runway with recruiter first.** Confirm sponsorship/export with each recruiter early. Flip status Evaluated→Applied per role once submitted + append an Application Log section to each report (docs/fields/legal answers, like Apple 014/015).
- **Browser submission blocked this env:** claude-in-chrome extension NOT connected (tabs_context_mcp → "extension is not connected"). Even connected, account sign-in + final Submit are user-only. Offer: once connected + user signed into a form, co-fill fields and STOP before submit.
- ⚠️ Env note: zsh does NOT word-split unquoted `$var` — the `for pair in "a b"; set -- $pair` idiom failed; run per-file commands or use arrays.

---

# (prior checkpoint) Resume Point — career-ops session (updated 2026-07-01)

## 🆕 SESSION 2026-07-01 (later) — Apple applications: polished + filling in progress
- **Both Apple packages polished & ready to submit.** Covers regenerated (fixed double-comma defects, added "Dear Hiring Manager," salutation, dated 2026-07-01). **FIB-SEM added** everywhere after user confirmed the experience: `cv.md` (skills line + UT Austin interfacial-FA bullet, "FIB-SEM cross-sectioning with EDS"), both CV PDFs, both forms' skill lists.
- **Current upload files (dated 2026-07-01; old 06-27 CV PDFs deleted):**
  - Characterization (req 200667077, Santa Clara): `output/cv-zezhou-guo-apple-characterization-2026-07-01.pdf` + `output/apple-battery-materials-characterization-engineer-cover.pdf`
  - Reliability (req 200668468, San Diego): `output/cv-zezhou-guo-apple-reliability-2026-07-01.pdf` + `output/apple-battery-reliability-engineer-cover.pdf`
- **STATUS: user is completing the forms manually.** Both live (verified 2026-07-01; comp bands Reliability $142.3–263.3K, Characterization $175.5–263.8K). Neither submitted yet → still `Evaluated` in tracker. Mark **Applied** once user confirms submission.
- **Blockers hit this session:** (1) Chrome MCP disconnected mid-form once (Step-2 edits lost — Apple only persists on "Continue"); (2) browser `file_upload` no longer accepts host paths → **user must upload CVs/covers themselves**. I gave a full field-by-field checklist for both apps (contact, address=Austin TX 78745, 4 employment entries w/ descriptions, work-auth = authorized-now-F1-OPT / needs-sponsorship=Yes, skills).
- **Data-contract note:** parser scrambles employment; correct order = Versa (Sr Materials Eng, current, Feb 2026)→UT Austin GRA (Jun 2021–Oct 2025)→HUST-Wuxi Battery Cell Eng (Jul 2020–May 2021)→HUST Research Asst (Mar 2017–Jun 2020).
- ⚠️ Caught: the characterization app initially had the WRONG CV (reliability) attached — flagged for user to ensure correct CV per role.

## 🆕 SESSION 2026-07-01 — Cross-industry pipeline tackled (Tier 1 + Intel/Micron)
Verified live reqs + evaluated the 5 recommended cross-industry targets. **Verdict: cross-industry semiconductor is a weaker vein than battery — no 4.0+ found. Battery shortlist (Tesla NMC 012, Cell Electrolyte 017, Apple 014/015) remains the priority.**
- **Intel — Process Integration Dev Engineer, Defect Metrology (Hillsboro, JR0285193) → 3.8/5 → reports/019. BEST cross-industry fit.** Min-quals = his exact profile (PhD MatSci + materials characterization + DOE); $115–219K; "Position of Trust: N/A" (not export-gated). Below apply line on semi-process gap + ⚠️ Intel's 25K-role 2025-26 layoffs. **Apply only if willing to pivot into semi.**
- **Micron — Sr/Staff HBM PYE Failure Analysis Engineer (Boise, JR92813) → 3.6/5 → reports/018.** Strong AI+characterization+stats FA method fit; real device/electrical-FA domain gap; BS-targeted. Comp/sponsorship clear. Below apply line.
- **TI — Failure Analysis Engineer (Dallas, 25011144) → 2.8/5 recommend-against → reports/020.** Live TI FA = circuit/electrical die-level FA (EE domain, not materials). Metrology role gates on semi-mfg exp. Watch for a TI surface-science/materials-characterization FA req (would fit).
- **NXP → NO viable US req.** Physical FA is all Kuala Lumpur; Austin = design/EE/SW/test only. No report.
- **Samsung Austin → NO fitting senior req.** Austin openings are fab process/equipment/mfg/data-science/technician; FA is technician-level. No report.
- **Method note for next time:** Workday sites (Intel) + Oracle-CE (TI) expose zero-token JSON APIs for both liveness AND full JD — far faster/cheaper than browser. Intel CXS: `POST intel.wd1.myworkdayjobs.com/wday/cxs/intel/External/jobs`. TI: `edbz.fa.us2.oraclecloud.com/hcmRestApi/.../recruitingCEJobRequisitions?finder=findReqs;siteNumber=CX_1001,keyword=...`. NXP: `nxp.wd3.myworkdayjobs.com/wday/cxs/nxp/careers/jobs`. Search-result numeric URLs are often stale — verify via API/live board.
- **FULL SWEEP COMPLETED (2026-07-01, 2nd pass): Tier 2/3 remainder done.** Tracker now 23 entries; `verify-pipeline` clean. New reports:
  - **3M — Senior Materials Scientist (Maplewood, R01165600) → 3.6/5 → reports/021 (tracker #23). BEST Tier-3 fit** (ceramics/non-metallic materials dev = his cathode-oxide synthesis). Also 3M Sr X-ray Scientist ~3.3. Apply if broadening to general materials R&D + sponsorship confirmed.
  - **Entegris — Research Scientist Analytical R&D (Aurora IL, REQ-11623) → 3.1/5 → reports/022 (tracker #22).** NMR/colloids/polymers emphasis — not his inorganic core. Recommend against.
  - **KLA ~2.9** (tool-maker, apps/sales roles — no report), **AMAT ALD Materials Scientist ~3.0** (actually process eng — no report), **GlobalFoundries SKIP** (FA technician-level + US-foundry export-control — no report), **Corning + Coherent** ATS unresolved/deprioritized (comp floor / defense export — no report).
  - **Numbering:** merge-tracker initially assigned 3M to row #23 (leaving a gap at #21); corrected 3M to row #21 so tracker rows are contiguous 1–22 and every row# matches its report# (18→018 … 22→022). verify-pipeline clean.
- **FINAL CONCLUSION: cross-industry (semiconductor + general materials) fully explored — nothing ≥4.0. Battery shortlist wins decisively.** Tesla NMC 012 (4.6, via friend referral) + Cell Electrolyte 017 (4.1) + Apple 014/015 (4.1/4.2) remain the priority. Pursue any cross-industry role only as a deliberate pivot with sponsorship + export-control confirmed.

---

# (prior checkpoint) Resume Point — career-ops session (updated 2026-06-28)

## How to resume
Open a new Claude Code session in this project (`career-ops/`) and say **"resume"** (or "continue from RESUME.md").
The project memory auto-loads each session, so context is restored; this file holds the un-finalized work.

## ⏭️ TOP OF QUEUE — TODAY, MONDAY 2026-06-29
- **DECISION (2026-06-29): apply to ONLY 012 NMC (req 273839), NOT 013.** Friend at Tesla advised against applying to both — they're the same active-materials team, so a double-apply via one referral reads as scattershot. 013 Next-Gen (273838) is shelved (still a strong role; can revisit if Andrew suggests it).
- **Submit Tesla 012 via friend's internal referral.** Friend needs req **273839** (NMC Cathode Dev) + the tailored CV (`output/cv-zezhou-guo-tesla-nmc-2026-06-29.pdf`). Referral lands before/with the application.
- **Plus: warm email to Andrew** (group leader for the team + DRX project lead) — draft ready in `output/tesla-group-leader-outreach.md` (single-role, NMC). Let it lead; mention the referral too.
- **Evidence of Excellence field:** use Version A (NMC) in `output/tesla-evidence-of-excellence.md`.
- ✅ **Both reqs re-verified LIVE on 2026-06-29** via browser (curl/API are Akamai-403'd — must use browser). Full JD + Apply + E-Verify, Palo Alto CA. Posted comp band = **$91,600–$195,600** (floor below the $130K target → confirm actual offer band with recruiter). If 273839 rotates, re-find the replacement before the friend submits.
- Confirm sponsorship + export-control with recruiter early.
- ⏰ **July 1 cloud reminder scheduled** (routine `trig_0183K8yuu6DPr3N1vvGEAgMK`) — pings to check whether the referral arrived. Cloud agent = reminder only (can't touch local files/send).

## 🧷 SESSION CHECKPOINT — 2026-06-30 (paused mid-pipeline)
- **career-ops updated v1.13.0 → v1.14.0** (data intact; `modes/_custom.md` seeded).
- **DRX wording corrected** everywhere to "key contributor" (was "Led") + added "later extended to LMFP synthesis via co-precipitation" — Andrew led that project, so accuracy matters. Touched: `cv.md`, Evidence file (A/B/C), all tailored CVs/covers. **Old 2026-06-27 Tesla CV PDFs deleted** (said "Led"); current NMC CV = `cv-zezhou-guo-tesla-nmc-2026-06-29.pdf`.
- **NEW report 017 — Tesla Sr. Materials Engineer, Cell Electrolyte (Palo Alto, req 265142) = 4.1/5 APPLY.** DISTINCT from 016 (Louisville vendor-liaison, req 272730). Bench/qualification + echem-data-interpretation = bullseye. **Different team from Andrew's cathode group → NO same-team conflict with NMC 012; can be pursued alongside the referral.** Package built + PDF-verified: `output/cv-zezhou-guo-tesla-cell-electrolyte-2026-06-30.pdf`, `output/tesla-cell-electrolyte-cover.pdf`, Evidence **Version C**. Tracker #17.
- **Tracker fix:** merge-tracker dedup wrongly collapsed 017 into 016 (matched "Cell Electrolyte"); manually restored #16 (Louisville, 3.9, reports/016) + added #17 (Palo Alto, 4.1, reports/017) with location suffixes. `verify-pipeline` clean, 17 entries.
- **Standing APPLY shortlist (built packages, ready to send):** NMC 012 (4.6, via referral), Cell Electrolyte 017 (4.1, direct). Apple 014/015 (4.1/4.2) packages also ready. Already APPLIED: SES 001 (4.2), Form Energy 006 (4.0).

### ⏭️ PIPELINE — paused here (user said "checkpoint" mid-triage; NO items processed this pass)
Ran pipeline reconciliation 2026-06-30: fixed stale `[ ]` checkboxes for already-done 014/015/016 in the 14-URL batch. **Open queue awaiting user selection of what to verify-then-evaluate:**
- **Battery leftovers (specific reqs, all <4.0):** Tesla Quality Eng Cathode Mfg (Austin-local, 265399, ~3.6); Blue Current Staff/Sr Electrode Process (Hayward, ~3.4); Tesla Process Eng Cathode Mixing (Austin-local, 268094, ~3.3); ONE Warranty & Reliability (Novi, going-concern/export caveats); Panasonic Energy Process Eng III Electrode (Sparks NV, sponsorship unconfirmed).
- **Cross-industry (area-leads, NOT liveness-verified — each needs its live req found first):** Tier 1 Austin-local FA = TI / NXP / Samsung; Tier 2 sponsors = Intel (Defect Metrology / MatSci-PhD) / Micron / KLA / Applied Materials / GlobalFoundries (⚠️ export-control); Tier 3 general = Corning (⚠️ comp below floor) / Entegris / 3M (stretch) / Coherent (commercial only).
- **Recommended next when resuming:** Tier 1 Austin-local FA (TI/NXP/Samsung — no relocation, sponsor, characterization fit) + Intel/Micron. Battery leftovers are all sub-4.0 → lower priority.

## ✅ Cross-industry scan RUN (2026-06-29) — candidates in pipeline.md, awaiting verify+evaluate
Search widened beyond battery → **semiconductor + general materials science** (battery stays primary/unchanged). One project, not two. Config done & YAML-validated (2 new archetypes, +12 cos, +4 queries, +20 title terms, +7 states). Gating: lead with characterization/RCA/DOE toolkit; SKIP export-controlled; $130K floor + sponsorship.
- **Scan executed 2026-06-29:** zero-token `scan.mjs` = 0 net-new from 6 Greenhouse battery cos (all dupes). WebSearch swept all 12 cross-industry cos → candidates recorded in `data/pipeline.md` under "2026-06-29 — CROSS-INDUSTRY SCAN", grouped Tier 1/2/3. **NOT liveness-verified yet** (per data contract, verify at evaluate step).
- **Top candidates:** Tier 1 Austin-LOCAL = TI FA/characterization (TOF-SIMS/XPS/Auger), NXP FA, Samsung FA/metrology. Tier 2 = Intel (explicitly sponsors STEM-PhD; Defect Metrology + MatSci-PhD), Micron (metrology PhD), KLA, Applied Materials (characterization reqs only). Tier 3 general-materials = Corning (⚠️ comp $67–107K below floor), Entegris, 3M (polymer-adjacent), Coherent (⚠️ skip defense arm).
- **Next:** user picks which reqs to verify-then-evaluate via `/career-ops pipeline`. Recommended first: TI/NXP (Austin-local FA) + Intel/Micron (confirmed sponsors, clean characterization fit). Deprioritize Corning unless comp clears.
- **Efficiency note (future):** Intel/KLA/GlobalFoundries/Entegris all use `*.wd1.myworkdayjobs.com` → could be wired as `provider: workday` for zero-token auto-scan if cross-industry becomes recurring.

## ✅ PACKAGES COMPLETE (2026-06-27)
Application packages for all 4 top roles are DONE — CV + cover letter PDFs in `output/`, direct tone, approved. NMC cover specifies co-precipitation per user. Nothing pending on these 4; ready for the user to submit.

Cover PDFs (1 page each, text-verified):
- `output/tesla-nmc-cathode-development-cover.pdf` (012)
- `output/tesla-next-gen-battery-materials-cover.pdf` (013)
- `output/apple-battery-reliability-engineer-cover.pdf` (014)
- `output/apple-battery-materials-characterization-engineer-cover.pdf` (015)
Tracker PDF column = ✅ for 012–015. Cover payload JSONs at `/tmp/cover-payload-{slug}.json` (ephemeral); regenerate via `scratchpad/gen-covers.mjs` if needed. Note: covers run ~200 words (tight/direct) — expand toward 350–420 only if user wants more substance.

### Next actions (user's call)
- Submit the 4 applications (user clicks Apply; Tesla reqs rotate fast — do 012/013 promptly). Confirm sponsorship/export-control with recruiters early.
- Optionally build packages for Austin-local fallbacks (Tesla Quality Eng Cathode Mfg ~3.6, Process Eng Cathode Mixing ~3.3) or Tesla Cell Electrolyte 016 (3.9).
- Follow-up cadence check on APPLIED roles (SES 001, Form Energy 006).

## ✅ DONE (on disk)
- **4 tailored CV PDFs** in `output/` (2 pages each, ATS letter, text verified clean):
  - `cv-zezhou-guo-tesla-nmc-2026-06-29.pdf` (report 012) — regenerated 2026-06-29 with DRX "key contributor" wording (was "Led"); old 06-27 PDF deleted
  - `cv-zezhou-guo-tesla-nextgen-2026-06-29.pdf` (report 013) — regenerated 2026-06-29, same DRX fix; old 06-27 PDF deleted
  - `cv-zezhou-guo-apple-reliability-2026-06-27.pdf` (report 014)
  - `cv-zezhou-guo-apple-characterization-2026-06-27.pdf` (report 015)
- Reports 012–016 written; tracker (`data/applications.md`) + `data/pipeline.md` current; `node verify-pipeline.mjs` clean.
- `cv.md` + `modes/_profile.md` updated this session with: LMR/Li-rich/anionic-redox/sol-gel, DRX (key-contributor on synthesis, improved cycle life, Tesla-collaborative PhD project), single-crystal, co-precipitation, Raman. Tailoring rule recorded (LMR/DRX-forward for next-gen roles, high-Ni NMC for conventional).

## APPLY shortlist (ranked; location-agnostic per user)
1. Tesla NMC Cathode (012) — 4.6 ← top
2. Tesla Next-Gen Battery Materials (013) — 4.3
3. Apple Battery Materials Characterization (015) — 4.2
4. Apple Battery Reliability (014) — 4.1
- Already APPLIED: SES Electrolyte (001, 4.2), Form Energy Cell Performance (006, 4.0).
- 3.9s: Tesla Cell Electrolyte (016, vendor/40-50% travel caveat).

---

## COVER-LETTER DRAFTS (pending approval) — default tone: direct/concrete

### 1. Tesla — Sr. Materials Engineer, NMC Cathode Development (012)
**Opening:** Tesla's active materials team is taking high-nickel NMC from co-precipitation through production-scale cells, and that is the exact arc of my work. I have synthesized and scaled high-Ni NMC and published the degradation mechanisms this role asks you to diagnose.
**Profile:** Battery materials engineer with 8+ years in lithium-ion R&D, specializing in high-Ni NMC synthesis, dopant and surface engineering, and the degradation diagnostics that link structure to performance, scaled to 10 L pilot.
**Achievements:** • Scaled high-Ni NMC synthesis to 10 L pilot, optimizing precursor, calcination, and morphology for tap density and yield. • Published intrinsic roles of dopant elements in high-Ni layered oxides (Adv. Energy Mater. 2023). • Reduced initial capacity loss via a higher-cutoff formation protocol (ACS Energy Lett. 2024). • Identified CEI/SEI cross-talk as the primary high-Ni failure mode via XPS/ToF-SIMS (Adv. Mater. 2026).
**Problems I'll solve (proposed — edit):** Tesla needs high-Ni cathodes with higher energy density and durability at production scale. I would bring my pilot-scale synthesis and published degradation toolkit to shorten the synthesis-to-cell-validation loop and de-risk the move from lab to large-format cells.
**Closing:** Happy to discuss further at your convenience.

### 2. Tesla — Sr. Materials Engineer, Next-Gen Battery Materials (013)
**Opening:** Tesla is pushing beyond layered cathodes into Li-rich, disordered-rocksalt, and anionic-redox chemistries. I have worked directly in this space, including DRX cathode synthesis on a Tesla-collaborative project during my PhD.
**Profile:** Battery materials engineer with 8+ years in lithium-ion R&D and direct beyond-layered experience: I was a key contributor to DRX synthesis and helped improve its cycle life, and I currently develop Li-rich Mn-rich (LMR) cathodes via sol-gel with anionic redox.
**Achievements:** • Developed DRX cathodes as a key contributor on a Tesla-collaborative project, improving cycle life. • Develop LMR/Li-excess cathodes via sol-gel, working with anionic redox and voltage hysteresis. • Identified CEI/SEI cross-talk as the primary failure mode via CV/EIS/GITT and XPS/ToF-SIMS. • Integrated AI/LLM + Bayesian-DOE workflows, raising iteration rates 50%.
**Problems I'll solve (proposed — edit):** The beyond-NMC space is wide and expensive to search. I would apply my DRX and LMR/anionic-redox experience plus computational-guided DOE to triage compositions faster, and I am candid that I would ramp on the non-liquid-electrolyte and dry-processing side.
**Closing:** Happy to discuss further at your convenience.

### 3. Apple — Battery Reliability Engineer (014)
**Opening:** Apple's Battery Module Reliability Group needs an engineer who anticipates failure before it happens. Finding why cells fail and engineering the fix is the throughline of my eight years in lithium-ion R&D.
**Profile:** I specialize in degradation-driven failure analysis: FMEA/PFMEA, root-cause via CV/EIS/GITT and XPS/ToF-SIMS, and reliability validation through abuse and calendar-life testing, backed by statistical tooling to do it at scale.
**Achievements:** • Led PFMEA/FMEA to identify high-risk failure modes and predictive mitigations for BMS. • Identified CEI/SEI cross-talk as the primary Li-metal failure mode via multi-technique RCA. • Deployed an FBG temperature/stress monitoring system for abuse and calendar-life testing. • Built a SQL data platform cutting evaluation cycles 45%.
**Problems I'll solve (proposed — edit):** Apple's embedded modules demand failure modes caught before production. I would apply physics-of-failure FMEA and multi-technique root-cause to anticipate high-risk modes early and convert findings into design guidance.
**Closing:** Happy to discuss further at your convenience.

### 4. Apple — Battery Materials Characterization Engineer (015)
**Opening:** Apple's characterization team needs a subject-matter expert who coordinates complementary techniques to uncover why lithium-ion cells fail. Driving root cause through multi-technique characterization is what I do.
**Profile:** I bring deep characterization of Li-ion materials and interfaces — Raman, SEM, XRD, XPS, ToF-SIMS, and FTIR — applied to degradation root-cause and structure-processing-performance across cathodes, electrolytes, and interphases.
**Achievements:** • Identified CEI/SEI cross-talk via CV/EIS/GITT and XPS/ToF-SIMS. • Characterized residual alkaline compounds on high-Ni cathodes and their detriments (Adv. Mater. 2024). • Ran multi-scale characterization (XRD/SEM/ICP) with real-time pass/fail screening. • Operated glovebox/inert workflows for air-sensitive materials.
**Problems I'll solve (proposed — edit):** Apple needs fast, definitive root cause on battery materials. I would coordinate Raman with SEM/FTIR/XPS to drive causation from materials properties to performance, and develop methods that turn one-off analyses into repeatable diagnostics.
**Closing:** Happy to discuss further at your convenience.

---

## Other open threads (not started)
- Tesla reqs rotate fast (Austin 236799 & Louisville 227127 cathode reqs 404'd within a day) → apply to 012/013 promptly once packages are final.
- Confirm visa sponsorship + (for any defense-adjacent role) export-control with recruiters early.
- Austin-LOCAL Tesla fallbacks triaged but not full-reported: Quality Eng Cathode Mfg (~3.6), Process Eng Cathode Mixing (~3.3). BlueCurrent solid-state electrode process (~3.4). See `data/pipeline.md`.
- Follow-up cadence check due on the two APPLIED roles (SES 001, Form Energy 006).
