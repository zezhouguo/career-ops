# Article Digest — Zezhou Guo, Ph.D. (Battery Materials)

> **Purpose.** Compact, verifiable proof-point library distilled from Zezhou Guo's peer-reviewed
> papers and PhD dissertation (the source PDFs live in `writing-samples/publications/`). The agent
> pulls from this file to ground CV bullets, cover letters, interview STAR stories, and application
> answers in **published facts** — exact chemistries, methods, and metrics — never fabricated claims.
> Every number here is quoted from the source text. When a claim isn't backed here or in `cv.md`, ask.

---

## ⚠️ Authorship ladder — respect this in ALL generated content

| Tier | Papers | How to phrase |
|------|--------|---------------|
| **First author** (work Guo led) | *Adv. Mater.* 2026 (crossover); *Adv. Funct. Mater.* 2025 (TM-ion crossover); *ACS Energy Lett.* 2024 (formation protocol); *Small* 2023 (low-cost LHCE) | "I led / I developed / I discovered" — defensible |
| **Co-first author** (shared lead) | *J. Energy Chem.* 2020 (SPAN nanofiber cathode) — explicit "contributed equally" | "co-led / co-first-authored" — shared credit, not sole |
| **Contributing co-author** | Cui ×3 (*Adv. Energy Mater.* 2023, *Adv. Mater.* 2024, *Angew.* 2023); Park *Small* 2023; Xiang *Adv. Energy Mater.* 2018, *Adv. Sci.* 2019, *Angew.* 2021; Zhang *eScience* 2024 (**review**) | "contributed to / co-authored a study that…" — never sole authorship |

- **Only two papers itemize Guo's specific tasks**: *Small* 2023 (Z.G. did material prep, electrochemistry, structural/spectroscopic characterization; R.S. ran OEMS) and *Adv. Mater.* 2024 (Z.C. + Z.G. did synthesis, residual-Li titration, electrochemistry, physicochemical experiments; co-wrote paper). Elsewhere, contribution is not itemized — stay general.
- **eScience 2024 is a review article**, not original research — label as such; Guo's stated role was "results interpretation and discussion."
- **Never** attribute software authorship to Guo (the OEMS deconvolution tool in *Small* 2023 was the group's).
- Collaborator name is **Zehao Cui** (Z. Cui), not "Zhaohang."

---

## The one-line PhD thesis

Dissertation: **"Enabling High-Energy Lithium-Metal Batteries with High-Nickel Cathodes and Advanced Electrolytes"** (UT Austin, 2025; advisor Prof. Arumugam Manthiram; DOE **Battery500 Consortium**).

**Overarching contribution:** established a **bidirectional cross-interface ("crosstalk"/crossover) degradation framework** for Li-metal batteries with high-Ni cathodes. Guo resolved the known cathode→anode transition-metal crossover to *ion-specific* effects (Mn²⁺/Co²⁺ severely destabilize the Li SEI; Ni²⁺ is comparatively benign) **and** provided the **first direct, electrode-resolved evidence of the reverse anode→cathode crossover** — reframing high-Ni/Li-metal full-cell failure as a coupled two-way interfacial problem rather than a sum of independent single-electrode degradations. Methodological signature: a **delithiated-LFP counter-electrode GEIS + DRT protocol** to isolate single-electrode impedance inside full cells.

---

## Skills & methods actually demonstrated in the work (grounded inventory)

**Synthesis / materials:** continuous **hydroxide co-precipitation** in a **10 L stirred-tank reactor** (pH 11.0–11.6, 50 °C, 650 rpm, 10–12 µm secondary particles) for Ni(OH)₂ and doped precursors → two-step O₂ calcination (500 °C/5 h then 655–810 °C/12 h, Li/TM = 1.02) to layered oxides (LNO, NC-95, NM-95, NA-95, NMg-95, NMC622/811/90); sol-gel; **electrolyte formulation** (LP57 carbonate, HCE, LHCE design); glovebox handling (<0.01 ppm O₂/H₂O); slurry casting (90:5:5 active:C65:PVDF in NMP), calendering to ~3.0 g/cm³, ~2.0 mAh/cm² loading.

**Electrolyte-additive screening:** performed additive screening with a formulation workflow transferable across electrode systems, owning the experimental path from formulation design through electrolyte preparation and cell evaluation. This supports additive-engineering claims, but does not by itself establish pilot- or production-scale electrolyte manufacturing ownership.

**Cell formats:** CR2032 coin half-cells; Li|Cu & Li|Li symmetric; anode-free Cu|LNO; single-layer **pouch full cells** (graphite and Li-metal, N/P ≈ 1.1); LFP-counter GEIS cells.

**Interphase / materials characterization:** XRD (ex-situ + **in-situ XRD**, Rietveld), **XPS** with Ar⁺ depth profiling, **ToF-SIMS** (depth profiles, 3D reconstruction, 2D maps, **FIB cross-sections**, NSD colocalization), **SEM** (ion-milled cross-section + top-view), **TEM** (cathode-surface structural reconstruction to rock-salt/spinel phases, compared across cathode compositions and states of charge/cycling), **AFM** (Li-metal deposition surface morphology as a function of electrolyte), **OEMS**, **DSC/TGA**, **FT-IR**, **⁷Li / ¹⁹F NMR**, ICP/BET, potentiometric H-cell solvation energy.

**Electrochemistry:** galvanostatic cycling, rate, **dQ/dV**, **EIS**, **GEIS**, **DRT** deconvolution, **GITT** (Weppner–Huggins), **PITT**, **LSV**, CV/potentiostatic holds, Aurbach CE.

**Computational:** **DFT (VASP)** for electrolyte HOMO/LUMO.

---

## First-author papers — detailed proof points

### 1. *Adv. Mater.* 2026, e18490 — Anode-to-cathode crossover (Guo, Dolocan, Manthiram)
- **System:** NMC622 / NMC811 / NMC90 (lab co-precipitated) vs. **Li-metal vs. graphite** anodes; LHCE (LiFSI:DME:TTE = 1:1.2:3); cycled 45 °C, C/3.
- **What's new:** first direct experimental evidence of **anode→cathode ("back-way") crossover** in Li-metal batteries; introduced **GEIS with an 80%-delithiated-LFP counter electrode** to isolate cathode-only impedance.
- **Findings:** Li cells show higher initial capacity but faster fade; NMC811 is the best Li-paired composition (balances capacity vs. interfacial stability). Li-paired cathodes develop measurably **thicker organic-rich CEI and higher charge-transfer resistance** than graphite-paired, worst on high-Ni NMC90 — quantified by DRT-EIS, depth-profiled XPS, and 3D ToF-SIMS/FIB. (CEI: 80th-percentile SO₂⁻ signal ~8 nm Li-paired vs. ~6 nm graphite-paired NMC90 per the published reading; the dissertation, using a different count threshold, reported larger absolute CEI values — the *qualitative* Li>Gr, high-Ni-worst trend is the robust, citable claim.)
- **Proof points:**
  - Delivered the first direct experimental evidence of anode-to-cathode crossover in Li-metal batteries.
  - Engineered a delithiated-LFP GEIS + DRT protocol to isolate cathode-only impedance inside full pouch cells.
  - Designed temperature- and rate-accelerated aging test plans for the crossover study, then owned the data analysis, Arrhenius performance-prediction model, and result validation.
  - Combined DRT, depth-XPS, and 3D ToF-SIMS/FIB to show Li-metal pairing thickens the cathode CEI and raises charge-transfer resistance — most on high-Ni NMC90.
  - Used TEM to resolve cathode-surface structural degradation into rock-salt and spinel phases, comparing the reconstruction across cathode compositions and states of charge/cycling.
  - Reframed durable-LMB design around cross-interface (not single-electrode) stability.

### 2. *Adv. Funct. Mater.* 2025, 35(40), 2501743 — TM-ion crossover onto Li-metal (Guo, Cui, Manthiram)
- **System:** LHCE baseline + 0.01 M Ni²⁺/Mn²⁺/Co²⁺(TFSI)₂; Li|Cu, Li|Li, Li|NMC811.
- **Findings (verbatim):** Li|Cu CE **99.34% (BA) > 97.36% (Ni) > 96.53% (Mn) > 96.38% (Co)**; plated-Li thickness **21 µm (BA) < 25 (Ni) < 30 (Co) < 31 µm (Mn)**; **Li|NMC811 fails at 160 cycles (Co²⁺), 240 cycles (Mn²⁺); Ni²⁺ stays stable**. Mechanism: Mn²⁺/Co²⁺ form high-spin TM–DME complexes that catalytically cleave C–O bonds → thicker, organic-rich SEI; Ni²⁺ forms stable symmetric complexes.
- **Proof points:**
  - Showed dissolved TM ions poison the Li-metal SEI, dropping CE from 99.34% to as low as 96.38%, and cutting Li|NMC811 life to 160 (Co²⁺) / 240 (Mn²⁺) cycles while Ni²⁺ preserved stability — a direct electrochemical case for high-Ni, low-Mn/Co chemistries with Li-metal anodes.
  - Resolved the molecular mechanism via depth-XPS + 3D ToF-SIMS + DRT-EIS (TM–DME complexation).
  - Used AFM to map how different electrolytes shape Li-metal deposition surface morphology, linking plating uniformity to SEI chemistry.

### 3. *ACS Energy Lett.* 2024, 9(7), 3316–3323 — High-cutoff formation protocol (Guo, Cui, Manthiram)
- **System:** LNO + 95%-Ni single-doped (NM/NC/NA/NMg-95); Li|LNO half cells & Gr|LNO pouch full cells; 1C = 180 mAh/g.
- **Findings (verbatim):** ICL is **inverse to upper cutoff voltage — 21 mAh/g @4.4 V → 44 @4.1 V → 50 @3.8 V**; root cause = incomplete M–H1 phase transition, permanently unlocked by the H2–H3 transition (in-situ XRD: c-lattice restored to ~8% Li-vacancy at 4.4 V vs. ~23% at 4.1 V; GITT: D(Li⁺)→0 below 3.6 V unless 4.4 V used). Stepwise protocol cut **effective ICL 50 → 18 mAh/g**. Half-cell: 4.4 V formation → **166 mAh/g @C/3, 92.4% retention/100 cyc** (fig. label reads 92.1%) vs. 129 mAh/g. Pouch: 4.25 V formation → **203 mAh/g initial, 143 @C/3, 95% retention/500 cyc** vs. 113 / 104 mAh/g. Co lowers ICL; Mg raises it most (Li/Mg site mixing).
- **Proof points:**
  - Pinpointed the origin of first-cycle capacity loss in LiNiO₂ (incomplete M–H1 transition) via in-situ XRD + GITT.
  - Designed a drop-in high-cutoff formation protocol cutting effective ICL from 50 to 18 mAh/g.
  - Validated in Gr|LiNiO₂ pouch full cells: 143 mAh/g @C/3 with 95% retention over 500 cycles — a manufacturing-relevant process change.

### 4. *Small* 2023, 19, 2305055 — Low-cost LHCE diluents for Co-free LNO ‖ Li-metal (Guo, Cui, Sim, Manthiram)
- **System:** five fluorinated-ether diluents (TTE, OTE, TTEE, HFP, ETE) for LHCE; Co-free LiNiO₂ cathode + Li-metal / anode-free Cu.
- **Findings (verbatim):** Li|Cu CE up to **99.81% (OTE); all LHCEs >99.38% vs. 91.37% for LP57**; Li|Li stable **>800 h** (LP57 ~450 h); Li|LNO **85–88% retention/250 cyc vs. LP57 64.6%/200 cyc**; **OEMS gas 204 (LP57) → 71 µmol/g (OTE)**; **DSC heat 4,836 (LP57) → 540 J/g (ETE)**, exotherm delayed 125 → ~225 °C; **TTEE cheapest at $75/100 g vs. $275 for TTE**. Cross-SEM+XPS: electrolyte surface reactivity (not particle cracking) dominates LNO fade.
- **Proof points:**
  - Introduced four novel low-cost fluorinated-ether LHCE diluents, hitting >99.38% (up to 99.81%) Li CE vs. 91.37% for commercial carbonate.
  - Cut off-gassing ~65% (204→71 µmol/g, OEMS) and Li-metal reaction heat by an order of magnitude (4,836→540 J/g, DSC) — a quantified safety gain.
  - Ran the full electrolyte-design workflow end-to-end (FT-IR, ⁷Li NMR, DFT, LSV, EIS, XPS, OEMS, DSC).

---

## Co-first-author paper

### *J. Energy Chem.* 2020, 49, 161–165 — 1D nanofiber SPAN cathode (Xiang & **Guo**, equal contribution)
- **System:** electrospun-nanofiber sulfurized polyacrylonitrile (SFPAN) Li-S cathode (~45.6 wt% S, C-bonded S, carbonate electrolyte).
- **Findings (verbatim):** initial ~1690 mAh/g @0.3 A/g; **~1200 mAh/g after 400 cycles** (SPAN control 500); rate **~850 mAh/g @12.5 A/g**; 0–60 °C window (~800 @0 °C, ~1550 @60 °C).
- **Proof point:** Co-first-authored a *J. Energy Chem.* study engineering a 1D electrospun SPAN cathode delivering ~850 mAh/g at 12.5 A/g and ~1200 mAh/g after 400 cycles across a 0–60 °C window (shared lead credit, not sole).

---

## Contributing co-author papers (frame as contributions to team efforts)

**Cui, *Adv. Mater.* 2024, 36(33), e2402420 — residual alkaline on high-Ni** *(explicit contribution: Guo co-did synthesis, residual-Li titration, electrochemistry, physicochemical characterization; co-wrote)*. UT Austin–PNNL collaboration; quantified surface residual-Li evolution and cathode–water activation energies (22–36 kJ/mol across LNO/NC/NM/NA); demonstrated a single-step re-calcination that restores aged cathodes. Guo confirmed that titration was used extensively in this residual-lithium study.

**Analytical-method confirmation for application materials (user-confirmed 2026-07-18):** During his Ph.D. research, Guo used UV-Vis to measure the extent of transition-metal and polysulfide dissolution in electrolyte samples. He used acid-base titration to quantify residual alkaline compounds in the published residual-lithium study above and has hands-on skill in redox titration for determining transition-metal oxidation states. Keep these claims method-specific; do not imply broader spectroscopy or titration-platform ownership without further evidence.

**Cui, *Adv. Energy Mater.* 2023, 13(12), 2203853 — intrinsic dopant roles in high-Ni** (contribution not itemized). Isolated Co/Mn/Al roles at identical Ni content under both cutoff-voltage and cutoff-energy-density protocols; ≥97.9% retention over 300 cycles in LNO/NC/NA LHCE pouch cells; reframed the case for Co in Co-free design.

**Cui, *Angew. Chem. Int. Ed.* 2023, 62(50), e202313437 — temperature-pulse interphase degradation** (contribution not itemized). Gr|NMC811 pouch cells; a temperature pulse irreversibly thickens the CEI (50→75 nm) and later the anode SEI, dropping retention from 91% to 80%; proposed TM-catalyzed dead-Li crossover mechanism (TOF-SIMS/XPS/Raman).

**Park, *Small* 2023/2024, 2303526 — single-crystal spinel LiMn₂₋ₓMₓO₄** (contribution not itemized; UT Austin, Tesla-funded). One-pot two-step air calcination (1000→600 °C) yields stoichiometric single crystals, lifting full-cell 200-cycle retention to 76% and cutting anode Mn deposition ~4×; Li₃BO₃ coating raised retention 80→88%.

**Xiang, *Angew. Chem. Int. Ed.* 2021, 60(26), 14313–14318 — C₆₀–S cocrystal Li-S cathode** (HUST). 0.14%/cycle fade over 350 cycles; 809 mAh/g under lean-electrolyte, 4 mg/cm² loading; DFT-confirmed high-density LiPS-active sites.

**Xiang, *Adv. Sci.* 2019, 6(22), 1901120 — piezoelectric β-PVDF "Li-ion pump"** (HUST). Raised Li⁺ transference number to 0.53; ~99% CE over 200 cycles; Li-S full cell ~1000 mAh/g after 100 cycles.

**Xiang, *Adv. Energy Mater.* 2018, 8(36), 1802352 — backside Li plating via Li-ion flux control** (HUST). Au-modified carbon-fiber host; 99.2% CE over 400 cycles; lean-Li (1:1.2) Li-S full cell holding 672 mAh/g after 100 cycles.

**Zhang, *eScience* 2024, 4(1), 100174 — optical-fiber battery health-monitoring (REVIEW)** (HUST; Guo's role: results interpretation/discussion). Survey of FBG / TFBG / SPR-TFBG / Rayleigh / IR-FEWS / hollow-core-Raman sensing for temperature, stress/strain, electrolyte RI, and spectral monitoring toward SOC/SOH/SOS diagnostics. **Not original research — label as a review.**

---

## "Greatest-hits" metrics for quick reuse

| Metric | Value | Source |
|--------|-------|--------|
| Effective ICL reduction (LiNiO₂ formation protocol) | **50 → 18 mAh/g** | ACS Energy Lett. 2024 |
| Gr\|LiNiO₂ pouch retention (4.25 V formation) | **95% over 500 cycles** (143 mAh/g @C/3) | ACS Energy Lett. 2024 |
| Li-metal Coulombic efficiency (LHCE) | **up to 99.81%** (vs. 91.37% carbonate) | Small 2023 |
| Li-metal reaction heat (DSC) | **4,836 → 540 J/g** | Small 2023 |
| Cell off-gassing (OEMS) | **204 → 71 µmol/g** | Small 2023 |
| Diluent cost (TTEE vs. TTE) | **$75 vs. $275 / 100 g** | Small 2023 |
| TM-ion damage to Li\|NMC811 life | Co²⁺ 160 cyc / Mn²⁺ 240 cyc; Ni²⁺ stable | Adv. Funct. Mater. 2025 |
| SPAN cathode high-rate | **~850 mAh/g @12.5 A/g**, ~1200 @400 cyc | J. Energy Chem. 2020 (co-first) |
| Publication record | **4 first-author + 1 co-first + 8 co-author** battery papers | — |

---

## Recurring narrative hooks (for cover letters / interviews)
- **"Crossover/crosstalk" is the through-line** of the PhD — a single, ownable scientific idea that connects five papers and the dissertation.
- **Full R&D-stack ownership**: cathode synthesis (10 L reactor) → electrode/pouch fabrication → electrolyte design → advanced-characterization diagnosis → manufacturing-relevant protocols. Rare to have all of it in one person.
- **Manufacturability bent**: formation protocol and low-cost diluents are framed as *process/cost* levers, not just science — useful for industry roles.
- **Deep diagnostics identity**: XPS + ToF-SIMS/FIB + in-situ XRD + GITT + DRT-EIS + GEIS + OEMS + DSC, applied repeatedly to root-cause failure — a failure-analysis specialist profile.
