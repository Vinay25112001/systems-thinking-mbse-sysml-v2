# Source Traceability

Maps each **official requirement** to its **teaching source** (with pages) and to the **studio component** that
delivers it, and names the gaps. It is a living matrix. Lesson content cites these rows, and every row must keep
a source or an explicit `GAP`/`RECOMMENDATION` tag.

Conventions: source IDs from `SOURCE_INVENTORY.md`; "p." = PDF page; S10 "sl." = slide (= PDF page);
SEBoK (S11) rows give PDF page plus article. **OFFICIAL** = S01–S04. **REC** = my recommendation, not yet approved.
Studio weeks are defined in `CURRICULUM_RECONCILIATION.md` §3.

---

> **Correction 2026-10-09 (Phase 0b):** several S10 slide references in Section C were corrected against the deck's slide-title outline (`_source_cache/Intro_to_the_SysML_v2_Language_Textual_Notation.toc.json`).

## A. Official outcomes → studio weeks → evidence

| Official outcome | Studio weeks | Evidence of attainment in the studio |
|---|---|---|
| S01 O1 stakeholders and interactions (systems thinking) | ST-1, ST-2 | Stakeholder Mapper, systems-thinking explorer, knowledge checks |
| S01 O2 needs, capabilities, requirements | ST-2, ST-3 | ConOps Builder, Requirements Quality Lab |
| S01 O3 trade studies, measures, evidence | ST-5, ST-6 | Trade-study simulator, Measures framework |
| S01 O4 information flows, decision support, AI | ST-6 (+ AI statements in every week) | Information view, AI Usage Statement template |
| S01 O5 risk, assumptions, opportunities, future trends | ST-4, ST-7 (AROU from ST-1) | Risk matrix, AROU register, roadmap |
| S02 O1 construct and navigate SysML v2 models | M-1 … M-4 | SysML v2 workspace (checked subset) |
| S02 O2 digital traceability | M-2, M-5 | Digital thread explorer (11-link chain) |
| S02 O3 impact analysis, trade studies, risk from the model | M-6, M-7 | Model-query and impact tools |
| S02 O4 AI-assisted workflows with human validation | all M-weeks | AI critique checklists; no embedded LLM unless approved (D8) |
| S02 O5 communicate model insights | M-7 | Stakeholder-specific views (S04 Lab 15 audiences) |

## B. Systems Thinking block: topic → sources

| Studio wk | Topic (official, S01) | Primary source | Secondary | Gap / REC |
|---|---|---|---|---|
| ST-1 | Systems thinking foundations | S11 p.261–266 *Systems Thinking*; p.273–276 *Principles* (20 principles); p.283–284 archetypes | S13 p.45–49 (analysis vs synthesis, UAV example), p.51 (watchmaker/gardener) | Systems Science articles p.149–255 are ChatGPT-assisted, so cite their primary authors |
| ST-1 | Systems, enterprises, socio-technical, SoS | S11 p.814–835 *Enterprise Systems*; p.866–869 *SoS* (types; ATM as persistent SoS) | S13 p.17–23; S12 p.10–11, 19–22 | — |
| ST-1 | Stakeholders, Stakeholder Ecosystem Map | S11 p.545 (BMA stakeholder register), p.552–553 (stakeholders by life-cycle stage), p.787 (four value perspectives) | S13 p.63, 234–238 (support-gap chart); S12 p.51–52 (certification authorities as stakeholders) | **GAP:** no power/interest or influence-mapping method in any source. **REC:** add one and label it as an external convention |
| ST-1 | Technology literacy (intro) | S11 p.55, 70–71 (trends) | S13 p.523–526 (hype cycle, adoption curve) | Thin |
| ST-2 | Mission analysis | S11 p.543–548 *Business or Mission Analysis* | S11 p.897–898 (mission engineering); S12 p.32–34 | DoD framing needs a civil rewrite |
| ST-2 | Needs analysis | S11 p.549–556 *Stakeholder Needs Definition* | S13 p.293–297 (six attributes of a needs statement) | — |
| ST-2 | Capability analysis | S11 p.854–863 (capability gaps over near, mid and far horizons; "Transport 150,000 passengers per hour among 27 nodes" example, p.861–862) | S13 p.293–295 | — |
| ST-2 | ConOps and scenarios | S13 p.298–303 (IEEE 1362 contents) | S11 p.546 (operational concepts incl. misuse and loss scenarios); S12 p.67; S11 p.1209–1210 (resilience scenarios) | — |
| ST-3 | Requirements development | S11 p.557–568 *System Requirements Definition* | S13 p.365–374; S12 p.142–146 | — |
| ST-3 | Requirement quality | S12 p.144 (13 attributes) | S13 p.329–330, 368–370; S11 p.566, 635 | INCOSE GtWR not in the collection (D5) |
| ST-3 | Traceability | S12 p.118 (orphans, childless parents) | S13 p.384–391 (RTM); S11 p.441 | — |
| ST-4 | Emerging technology, TRL | S11 p.767 (TRL Table 1), p.766–768 (MRL/IRL/SRL) | S13 p.523–531 | — |
| ST-4 | Technology risk and uncertainty | S11 p.471–472 (Monte Carlo), p.610; S13 p.50–57 (strategy by uncertainty type) | S12 p.112–113 (TRA) | — |
| ST-4 | Risk process and matrix; AROU | S11 p.481–486 *Risk Management*; S12 p.120–130 (5×5, issue and opportunity matrices) | S13 p.613–652 (Condition-If-Then p.630–631; grid p.642) | AROU register is a course construct (S01/S03) |
| ST-5 | Trade studies | S11 p.463–474 *Decision Management* (value functions, swing weights p.467, additive model p.469, tornado, UAV incl. electric Li-ion) | S12 p.109–110 (12 steps); S11 p.339–341 (sensitivity: "robust if order unchanged") | No worked numeric matrix in any source, so the studio supplies a worked example labelled as such |
| ST-5 | Architecture concepts and viewpoints | S11 p.569–604 (functional, logical, physical; views Figs 4a/4b p.573–574) | S13 p.338–360; S12 p.144–147 | SEBoK figures are SysML v1 |
| ST-6 | Measures (MOE/MOP/TPM) | S13 p.330–331 (definitions) | S11 p.533 (hierarchy), p.1562 Glossary; S12 p.113–118 (TPM margins) | — |
| ST-6 | Information view, data vs information, AI | S11 p.510–521 (definitions p.511–512) | S12 p.133–138; S11 p.1368–1373 (AI); S13 p.111–121 | — |
| ST-6 | Interfaces and integration | S11 p.624–633 (N² p.631) | S13 p.392–415; S12 p.138–140 | — |
| ST-6 | Verification strategy, V&V | S11 p.634–656 (methods table p.639; V&V table p.648) | S12 p.149–151; S13 p.433–438 | Avoid S13 p.286 (reversed) |
| ST-7 | Known unknowns | S11 p.266 (known knowns / unknown unknowns); p.1205 | S13 p.50–57 | — |
| ST-7 | Security and resilience | S11 p.1203–1212 (resilience taxonomy; requirement pattern p.1210), p.1229–1235 (security), p.1165–1170 (loss-driven SE) | S12 p.203–205, 215–217 | — |
| ST-7 | Roadmaps and enterprise evolution | S13 p.528–531 (technology plan, back-casting) | S11 p.854, 669–687 | — |
| ST-7 | Digital engineering, digital thread, MBSE | S11 p.576 (digital thread/twin definitions), p.1383–1395 | S12 p.27–32 (DE goals) | SE sources are v1-era (SOURCE_ANALYSIS §1.5) |
| all | Life cycle and reviews | S12 p.60–96 (SRR/PDR/CDR criteria) | S11 p.377–432 | "FDR" not in any source |

## C. MBSE block: SysML v2 construct → sources

| Construct | S10 textual deck (primary) | S06 spec (normative) | S09 graphical | Studio week |
|---|---|---|---|---|
| Language architecture, KerML basis | sl.3–4 | p.43–44, 48 | p.8 | M-1 |
| Type / feature / specialization / subsetting / redefinition | sl.9–12 | p.63–77 | p.24–27 | M-1 (S05 p.51–66 for definitions) |
| Packages, visibility, imports | sl.5–6 | p.55–63 (imports p.60–61) | p.15–22 | M-1 |
| Part def/usage, attributes, enums, items | sl.9–17 | p.63–90 | p.24–38 | M-1 |
| Ports, interfaces, connections, flows, binding | sl.18–29 | p.90–110 | p.40–44 | M-4 |
| Actions, successions, decisions, loops | sl.30–47 (ChargeBattery sl.38–39) | p.116–145 (charging loop p.144) | p.50–69 | M-4 |
| States (`first start` form) | sl.48–56 | p.145–154 | p.56–62 | M-4 |
| Individuals, snapshots, time slices | sl.68–71 | p.81–88, 106 | p.71–75 | M-7 |
| Requirements, subject, assume/require, satisfy | sl.86–91 | p.161–169 (MaximumMass p.165–166; satisfy p.168) | p.77–94 | M-2 |
| Requirement derivation | sl.160–162 | p.581 | — | M-2, M-5 |
| Use cases, actors, stakeholders, concerns | sl.100–101 (use cases), sl.115 (stakeholders and concerns) | p.162, 166–168, 177–180 ("Provide Transportation", p.179–180) | p.96 | M-2 |
| Allocation (logical → physical) | sl.106–107 | p.110–112; matrix p.188 | p.103–105 | M-3 |
| Analysis cases, calculations, constraints | sl.72–78, 84, 92–94 | p.170–172 | p.84–94 | M-6 |
| Trade studies | sl.95, 152 | p.172–173; library p.570–574 | p.99 | M-6 |
| Verification cases, verdicts, methods | sl.96–99 | p.173–176; library p.537–540 | p.98–101 | M-5 |
| Views, viewpoints, rendering | sl.116–119; standard views sl.145 | p.181–188; standard views p.548 | p.107–117 (p.114 outdated) | M-7 |
| Metadata, Risk, MOE/MOP, cause/effect | sl.108–114 (metadata, filtering, language extension), sl.147 (Risk), sl.149 (parameters of interest: MOE/MOP), sl.157–159 (cause and effect) | p.188–194; Risk p.558–560; MOE/MOP p.561 | p.108–110 | M-5, M-6 |
| Variability | sl.102–104 | p.65–66, 75–76 | p.46–47 | M-7 (evolution/autonomy) |
| Quantities and units | sl.163–177 (kernel data types and functions: sl.120–143) | p.610–666 | p.80–82 | M-1 onward |
| v1 → v2 changes | sl.3–4 (language architecture only) | p.43 | p.119 | M-1 (S07 PDF 31–59, 469, 613, 634) |
| Repository, commits, query, diff | — | — | p.9–10 | M-5, M-7 (S08 PDF 31–36) |

## D. Official deliverables → sources → studio tool

| Official deliverable (S01, with S03 contents) | Studio tool | Primary sources |
|---|---|---|
| Stakeholder Ecosystem Map (+ initial AROU) | Stakeholder Mapper | S11 p.545, 552–553, 787; S13 p.234–238 |
| Needs & Capability Analysis | ConOps/Needs builder | S11 p.543–556, 854–863 |
| ConOps | ConOps Builder | S13 p.298–303; S11 p.546 |
| Requirements Package | Requirements Quality Lab | S12 p.144; S13 p.365–391; S11 p.557–568 |
| Technology Assessment, Technology Risk Assessment | Technology/TRL explorer | S11 p.766–768; S13 p.523–531 |
| AROU Register (living) | AROU register (global) | S12 p.110, 120–130; S11 p.481–486 |
| Trade Study Report | Trade simulator | S11 p.463–474 |
| Architecture Concept Description | Architecture editor | S11 p.569–604 |
| Measures Framework | Measures panel | S13 p.330–331; S11 p.533; S12 p.113–118 |
| Information View | Information-flow view | S11 p.510–521 |
| Interface Inventory | Interface table / N² | S11 p.624–633; S13 p.392–415 |
| Verification Strategy | Verification planner | S11 p.634–656; S12 p.149–151; S06 p.537–540 |
| Known Unknowns; Risk, Security & Resilience | Risk matrix + resilience panel | S11 p.1203–1235 |
| Enterprise Evolution Roadmap | Roadmap view | S13 p.528–531 |
| Final package and presentation | Capstone | S12 p.60–96 (review criteria) |
| S04 Labs 1–16 | MBSE workspace + digital thread | Section C |

## E. Air Taxi case data provenance

| Item | Provenance | Status |
|---|---|---|
| Enterprise name "AeroLink Urban Mobility" | S04 Lab 2A | OFFICIAL (treated as fictional) |
| 7 stakeholder classes | S04 Lab 2A | OFFICIAL |
| 6 logical functions | S04 Lab 5 | OFFICIAL |
| 6 physical elements | S04 Lab 6 | OFFICIAL |
| 5 operational scenarios | S04 Lab 7 | OFFICIAL |
| 5 information classes | S04 Lab 8 | OFFICIAL |
| Trade question (aircraft vs vertiports) | S04 Lab 11 | OFFICIAL |
| Impact questions (battery range, demand ×2, regulation) | S04 Lab 13 | OFFICIAL |
| Autonomy evolution | S04 Lab 14 | OFFICIAL |
| Additional stakeholders, capabilities, requirements, risks to meet S02 minimums | Author | REC: labelled "teaching content" |
| **All numeric performance values** (range, payload, charge time, cruise speed, fleet size, demand) | none in the collection | **ASSUMPTION** until FAA/NASA/industry sources are approved (D5) |
| Regulatory statements (certification basis, vertiport design) | none in the collection | **GAP**: do not assert as fact |
