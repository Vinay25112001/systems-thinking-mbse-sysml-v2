# Source Analysis

**Scope:** what each source is good for, where the sources disagree, what is missing, and which
errors in them the course must not reproduce. Coverage and identities are in `SOURCE_INVENTORY.md`.
Page-level evidence is in `_source_cache/notes/*.md`. Citations use **PDF page** (SEBoK: PDF page plus
article title). "S06 p.165" means SysML v2.1 Beta 2 Part 1, PDF page 165.

---

## 1. Headline findings

1. **The SysML v2 documents are beta revisions, not the 2.0 formal standard.** S05 (KerML 1.1 Beta 2), S06/S07 (SysML 2.1 Beta 2) and S08 (API 1.1 Beta 2) all say "Release 2026-07, OMG Document Number: None" (S06 p.1). S06 alone carries 78 inline `SYSML21-nnn` issue markers in pp.1–345 and 44 in pp.346–691. The course must say "SysML v2 (as specified in the 2.1 Beta 2 revision)" and never "the final standard".
2. **No source in the collection is about air taxis.** No eVTOL, vertiport, UAM or FAA powered-lift material exists in any of the 13 files. The closest analogues are listed in §4. **Every Air Taxi performance number and regulatory statement in the course is a teaching assumption** until an FAA or NASA source is added (reconciliation C12).
3. **The SE sources have complementary gaps, and none is complete on its own.** Each core Systems Thinking topic has one best source (§3). The four most-needed teaching assets are each found in only one or two places: a likelihood × consequence risk matrix (S12, S13), a TRL 1–9 table (S11 only), requirement-quality characteristics (S12, S13; S11 only partially), and MOE/MOP definitions (S13, S11 Glossary).
4. **Printed examples contain errors in every SysML source.** This includes examples that break the spec's own grammar (S06), typos in tutorial slides (S09, S10) and non-parsing Annex A code (S06). The course must provide **corrected, parser-checked** examples rather than copied ones (§5).
5. **The SE guidance is SysML v1-era.** SEBoK's MBSE figures are SysML v1/Cameo style (S11 pp.564, 573–574). It describes SysML as a UML profile with "nine diagram types" (S11 p.372) and calls SysML 2.0 "promising" (p.1394). MITRE has no MBSE content at all, and DoD has no SysML. The bridge from SE process to SysML v2 must therefore be **designed by the course**; no source supplies it.

## 2. Per-source assessment

| ID | Best used for | Weak or unsuitable for | Notable caveats |
|---|---|---|---|
| S01/S02 | The binding course requirements: outcomes, assessments, deliverables, model minimums, the required digital thread | — | Textbook TBD; modelling tool unnamed; see reconciliation |
| S03 | Per-deliverable **content specification** (required contents, lengths) | Weights (sum to 60 %) and CLO numbers (1–8) | Older than S01 |
| S04 | Lab-by-lab model content, Air Taxi entity lists, trade and impact questions | Week numbering (16 labs) | Older than S02 |
| S05 KerML | Precise definitions: type, classifier, feature, specialization, subsetting, redefinition (Cl. 7.3, pp.51–66; 8.3.3 pp.167–204); the subsetting-vs-redefinition wheels example (pp.61–63) | Student reading: too formal, no SysML keywords | Code typos (`ntries` p.60; `redefine` vs `redefines` pp.95, 104); "no modifications" licence (p.5) |
| S06 SysML spec | **Normative keywords** (reserved-word list p.197); Clause 7 notation tables, graphical next to textual, for every construct (pp.51–191); libraries for Risk (pp.558–560), MOE/MOP (p.561), TradeStudies (pp.570–574), VerdictKind/VerificationMethodKind (pp.537–540), Derivation (p.581), ISQ/SI (pp.610–666); Annex A vehicle model (pp.667–691) | Unit browsing (SI/US unit lists empty in the PDF, pp.639–650) | Examples that contradict its own grammar (§5); semantics examples use `analysis case def` (pp.487–489) where the grammar has `analysis def` (p.223) |
| S07 v1→v2 | A "what changed from v1" teaching table: Block→`part def`, v1 Requirement→requirement *usage*, FullPort→`part` plus metadata, Class→`occurrence def` (PDF 469, 613, 634) | Anything exhaustive; ≈ 487 pages not opened | Its own overview tables are flagged for revision ("SYSML21-542"); Table 19 is corrupt |
| S08 API | Repository concepts for digital-thread lessons: immutable commits, branches, tags, DataIdentity vs DataVersion, query trees, `diffCommits`, relationship navigation (PDF 31–36) | Transitive impact analysis (none is provided) | Annex B JSON inconsistencies |
| S09 Graphical deck | Visual teaching of every construct; a 7-week slide sequence (notes §10) | Current notation: pre-beta (2023-03); "Case View" (p.114) and «requirementGroup» (p.103) are not in the formal spec; non-standard send syntax (p.62) | Typos (`perfrom` p.69, `mass ::>> mass` p.77) |
| S10 Textual deck | **Primary teaching syntax source**: Release 2026-08, CC BY 4.0; a snippet for every construct (slides 5–119) and libraries (120–185); change notes (`first start` 2026-03; `flow` 2025-02; `new` 2025-02; explicit import visibility 2024-07) | Slide 85 still shows the old `entry; then` form | Slide errata: 40, 74, 75, 82, 115, 145, 147 (notes §9) |
| S11 SEBoK | Systems thinking (20 principles, pp.273–276; archetypes pp.283–284); life cycles (pp.377–432); **Part 3c processes, all read**: decision analysis (pp.463–474), risk (481–486), measures (532–533), mission analysis (543–548), needs vs requirements (549–566), architecture (569–604), integration (624–633), V&V (634–656); enterprise and SoS (pp.814–899); TRL table (p.767); resilience (1203–1212); security (1229–1235); AI and V&V of AI (1368–1379); digital thread/twin definitions (p.576, 1394–1395) | Risk matrix, requirement-quality list (partial), SysML v2 | 20 Systems-Science articles acknowledge ChatGPT drafting (pp.149–255), so cite their primary authors; Agile Manifesto misquoted (p.404); "weak emergence" defined two ways (pp.232, 271); Glossary placeholders "Insert definition here" for Metadata (p.1564) and Ontology (p.1577) |
| S12 DoD Guidebook | **Technical reviews** (ASR/SRR/SFR/PDR/CDR/SVR-FCA/PRR/PCA criteria tables, pp.68–96); 13 good-requirement attributes (p.144); traceability "orphans" and "childless parents" (p.118); TPM threshold/margin/contingency (pp.116–118); 5×5 risk matrix plus issue and opportunity matrices (pp.121–130); 4 verification methods (pp.149–150); DE goals (p.28) | Civil context (≈ 40 % DoD-specific: JCIDS, ACAT, DFARS); TRL table; MOE/MOP definitions; worked trade study | Internal inconsistencies: stale DAG cross-references, 15 vs 16 TPM categories, risk "closed" (p.125) vs "never closed" (p.212) |
| S13 MITRE SEG | Plain-language practice: systems thinking (pp.45–57), SoS types (pp.17–20), ConOps (pp.298–303), requirements checklist (pp.368–370), good-requirement lists (pp.326, 329–330), MOE/MOP/KPP (pp.330–331), RTM (pp.387–388), integration and interfaces (392–415), 5×5 risk handling grid (p.642), risk statements (pp.630–631), V&V of simulation models (pp.475–483), technology planning (pp.528–531) | MBSE (zero SysML/MBSE content in pp.1–363); currency (2014; DoDI 5000.02 of 2008, ISO 15288:2002) | **Verification and validation reversed on p.286**; do not teach that sentence |

## 3. Best source per core topic (cross-source synthesis)

| Topic | Primary | Secondary | Gap / note |
|---|---|---|---|
| Systems thinking principles | S11 pp.261–285 | S13 pp.45–57 | Use primary authors for the Systems Science material |
| Systems, enterprise, SoS | S11 pp.814–899 | S13 pp.17–23 | An enterprise is not necessarily an SoS (S11 pp.832–835); ATM is a persistent SoS (S11 pp.866–869) |
| Stakeholders | S11 pp.545, 552–553 | S12 pp.51–52; S13 pp.234–238 | No stakeholder-mapping method (power/interest grid) in any source. A **recommended addition**, labelled as such |
| Mission and needs analysis | S11 pp.543–556 | S13 pp.293–297; S12 pp.32–34 | — |
| Capability analysis | S11 pp.854–863 | S13 pp.293–295 | DoD DOTMLPF needs a civil restatement |
| ConOps and scenarios | S13 pp.298–303 | S11 p.546; S12 p.67 | No dedicated ConOps article in S11 |
| Requirements development | S11 pp.557–568 | S13 pp.365–374; S12 pp.142–146 | — |
| Requirement quality | S12 p.144 (13 attributes) | S13 pp.329–330, 368–370; S11 pp.566, 635 | The lists disagree. INCOSE GtWR is not in the collection |
| Traceability | S12 p.118 | S13 pp.384–391; S06 p.188 (satisfaction matrix) | — |
| TRL / technology maturity | S11 p.767 (Table 1, NASA 9-level) | S13 pp.523–527 (hype cycle, adoption) | S12 has no TRL table |
| Technology roadmaps | S13 pp.528–531 | S11 pp.854, 669–687 | — |
| Risk management | S11 pp.481–486 (process) | S12 pp.120–130 (5×5); S13 pp.613–652 | SysML Risk library fixes low/medium/high at 25/50/75 % (S06 p.559) |
| AROU | S12 pp.110, 129–130 | S11 pp.482–485, 565 | "AROU" as a combined register is a **course construct**; no source defines it |
| Trade studies | S11 pp.463–474 (DAWG: value functions, swing weights p.467, additive model p.469, tornado, Monte Carlo; UAV example incl. electric Li-ion) | S12 pp.109–110 (12 steps); S11 pp.339–341 (sensitivity rule) | S06 TradeStudy library takes the best single score, with no weighting or sensitivity (pp.570–574) |
| Architecture and viewpoints | S11 pp.569–604 | S13 pp.338–360; S12 pp.144–147 | — |
| MOE / MOP / TPM | S13 pp.330–331 (definitions) | S11 p.533 (hierarchy figure); S12 pp.113–118 (TPM) | S11 gives no verbal definitions in Part 3c; the Glossary has them (p.1562) |
| Information, data, decision support, AI | S11 pp.510–521; S12 pp.133–138 | S11 pp.1368–1379 (AI4SE/SE4AI); S13 pp.111–121 | Data-vs-information definitions: S11 pp.511–512 |
| Interfaces and integration | S11 pp.624–633; S13 pp.392–415 | S12 pp.138–140 | — |
| Verification and validation | S11 pp.634–656 | S12 pp.149–151; S06 pp.173–176 | Method lists differ (§4.2) |
| Security and resilience | S11 pp.1203–1212, 1229–1235 | S12 pp.203–205, 215–217 | — |
| Life cycle and reviews | S12 pp.60–96 | S11 pp.377–432 | No "FDR" in any source |
| Digital engineering, digital thread | S11 p.576 and pp.1394–1395 | S12 pp.27–32 | S12 never uses the term "digital thread" |
| MBSE / SysML v2 language | S10 (slides 5–119) | S06 Cl. 7; S09 for visuals; S05 7.3 | — |
| Model repositories, query, impact | S08 PDF 31–36 | S06 Annex A views | No transitive impact operation (S08) |

## 4. Conflicts between sources (the course must take a stated position)

| # | Conflict | Evidence | Proposed course position |
|---|---|---|---|
| 4.1 | **Verification vs validation** | S13 p.286 reverses the terms; S12 p.149 ("built the system correctly" vs "right solution"); S11 p.648 ("done right" vs "does right") | Follow S11/S12 (ISO 15288 usage). Show S13 p.286 as a "spot the error" exercise |
| 4.2 | **Verification methods** | S12 pp.149–150: demonstration, examination, analysis, test. S06 p.540 (`VerificationMethodKind`): analyze, demo, inspect, test. S11 p.639: inspection, analysis, analogy/similarity, demonstration, test, sampling. S11 p.769 adds certification. S13 orders them differently (pp.370, 418) | Teach the 4 core methods (IADT) with the SysML enum names, and list the S11 extensions as advanced |
| 4.3 | **Risk scales** | S12 5×5 (pp.124–126); S13 5×5 grid with handling options (p.642); S06 Risk metadata = probability and impact on 0–1, with low/medium/high at 25/50/75 % (pp.558–560) | Studio matrix: 5×5 ordinal scales (S12) **mapped** to S06's 0–1 values. The mapping is a stated course convention |
| 4.4 | **Can a risk be closed?** | S12 p.125 closes risks; S12 p.212 (system safety): never closed, never called "residual" | Teach both in context: programme risk vs safety risk |
| 4.5 | **Risk handling options** | S11 pp.481–486: assume/accept, avoid, control/mitigate, transfer. S13 p.642 adds "Watch" | Use the four, with Watch as a monitoring state |
| 4.6 | **Requirement-quality characteristics** | S12 p.144 (13 attributes); S13 pp.329–330 (10) and pp.368–370 (14-item checklist); S11 pp.566/635/655 (inconsistent partial lists) | The Requirements Quality Lab uses S12's 13 as the base and cross-references S13. INCOSE GtWR rules are named as the industry reference but not reproduced (not in the collection) |
| 4.7 | **Standard views** | S09 p.114: 9 views incl. "Case View"; S06 p.548 Table 34: 8 views, no Case View | Follow S06 |
| 4.8 | **Initial-state syntax** | S10 slides 48–54 `first start then off;` (2026-03) vs S10 slide 85 and S09 `entry; then …` | Teach the 2026-03 form |
| 4.9 | **Trade-study method** | S11 DAWG: swing weights, value functions, sensitivity. S06 TradeStudy library: best single evaluation, with weighting left to the user (pp.570–574) | The simulator uses the DAWG method. Its SysML export shows how the weighted sum becomes the `eval` function |
| 4.10 | **Review names** | S02 uses "FDR"; S12 has SRR/SFR/PDR/CDR/SVR/FCA/PCA, no FDR | Keep S02's label; explain it as CDR/PCA-like |
| 4.11 | **Vee status** | S11 p.395: "not a life cycle model"; S12 p.13 draws it as the technical-process frame; S13 p.436 V with plans | Teach the Vee as a process-relationship view, not a schedule |
| 4.12 | **Functional decomposition** | S13 p.352: "generally not used in modern development"; S11 pp.569–604 and S06 actions use it | Treat S13's claim as dated |

## 5. Errors in sources that the course must not reproduce (selected; full lists in the notes)

- **S06:**
  - Imports missing visibility (pp.176, 184).
  - Transition guard placed before `accept` (p.153).
  - Stray `feature`/`readonly` (pp.78, 105).
  - Missing comma (p.175).
  - Over-strict printed `satisfy` production (p.222).
  - Non-grammar `analysis case def` / `verification case` (pp.487–489).
  - Annex A: code that will not parse (p.672); cargo mass `<=500` in the figure vs `>=500` in the code (p.683); `enegineMassRequirement` (p.684); `velocity=0 [m]` (p.690); a state missing from the figure (p.680).
- **S10:**
  - `breakPressure` (slide 40).
  - Syntax slips on slides 74–75, including `private alarValues::*;`.
  - Obsolete `value mass` (slide 82).
  - Case mismatch on slide 115.
  - Duplicated `<gv>` (slide 145).
  - `LevelEnum::L/M/H` vs `low/medium/high` (slide 147).
  - Curly quotes in names.
- **S09:** `perfrom` (p.69); `indvidual`/`timelice` (p.75); `mass ::>> mass` (p.77); inconsistent interface name (pp.42–43).
- **S05:** `ntries` (p.60); `redefine` (pp.95, 104).
- **S13:** V&V reversed (p.286).
- **S12:** risk-closure inconsistency (pp.125 vs 212); 15 vs 16 TPM categories; stale cross-references; unfilled [DATE]/[NAME] reference placeholders.
- **S11:** Agile Manifesto misquote (p.404); inconsistent emergence definitions (pp.232/271); "validation only occurs at the top level" (p.343); "PLACE FIGURE HERE" (p.447); Glossary placeholders (pp.1564, 1577).

Teaching use: these become **"find the defect" exercises**, which is legitimate engineering-review practice.
Every SysML example shown to students as correct must pass the studio's checker and, when a conformant tool
is chosen (D6), that tool's parser.

## 6. Verification of reader claims (done by the lead author against the source text)

| Claim | Source text checked | Result |
|---|---|---|
| S06 is "Version 2.1 Beta 2 (Release 2026-07)" | S06 p.1 | ✔ |
| S05 is "Version 1.1 Beta 2 (Release 2026-07)", "OMG Document Number: None" | S05 p.1 | ✔ |
| MITRE reverses V&V | S13 p.286: "fulfills the users' needs (verification) and all of the defined requirements (validation)" | ✔ |
| DoD good-requirement attributes | S12 p.144 list begins "Necessary, Unique, Unambiguous, Clear and concise, Complete, Consistent, Technically feasible…, Traceable…" | ✔ |
| Swing Weight Matrix | S11 p.467 "Figure 4. Swing Weight Matrix (INCOSE DAWG 2013)" | ✔ |
| Reserved keyword list | S06 p.197 | ✔ |
| 5×5 handling grid | S13 p.642 | ✔ (match found; console encoding error on print) |
| VerificationMethodKind = analyze, demo, inspect, test; VerdictKind | S06 pp.537–540 | ✔ |
| Risk LevelEnum low/medium/high = 25/50/75 % | S06 p.559 | ✔ |
| TRL table | S11 p.767 "Table 1. Technology Readiness Levels… (Mankins 1995)" | ✔ |
| Digital thread / twin definitions | S11 p.576 | ✔ |
| Four verification methods | S12 p.149 | ✔ |

Not independently re-checked: page-level ledgers for every reader, and the exact wording of every snippet in the
notes. Each snippet is re-verified against the PDF when it is used in a lesson; this will be logged in `TEST_REPORT.md` once lesson material is built (the file does not exist yet; no code or lessons have been produced).

## 7. Implications for the app design

1. **One canonical Air Taxi model** with stable IDs and typed relationships whose names follow S06 (`satisfy`, `verify`, `allocate`, `derive` via the Derivation library, `#cause`/`#effect`). Teaching abstractions such as "need → capability" links are labelled **teaching relation, not SysML keyword** (`derive`, `refine`, `trace` and `block` are not reserved words, S06 p.197, verified). The conformant ways to express such links are `dependency` (a reserved keyword), the Derivation library's `#derivation` metadata, or `satisfy`/`verify`/`allocate`. Note that `derived` *is* reserved, but it is a feature modifier, not a relationship.
2. **SysML v2 workspace:** a textual-notation subset with a teaching checker. It must be presented as "checks a course subset", **not** as a conformant SysML v2 parser. Snippets are adapted from S10 (CC BY 4.0, with attribution).
3. **Risk matrix:** 5×5, citing S12 and S13, with S06 Risk metadata export.
4. **Trade simulator:** DAWG swing weights and additive value (S11 pp.463–474), a sensitivity tornado, and rank-reversal detection (the "robust if order unchanged" rule, S11 pp.340–341).
5. **Requirements quality lab:** heuristic checks based on S12 p.144 and S13 pp.368–370, honestly labelled as heuristics. Every flagged rule shows its citation.
6. **Digital thread explorer:** the S02 11-link chain. Repository and versioning concepts follow S08 (commits, diff); impact analysis is assembled from relationship traversal, as S08 itself requires.
