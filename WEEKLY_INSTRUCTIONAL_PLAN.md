# Weekly Instructional Plan

**Status:** PROPOSAL, **revision 1**, 2026-10-09, after external review round 1. Not approved.

**Structure:**
- **Part B:** the integrated 14-week course, at lesson-level detail.
- **Parts A1 and A2:** the two-course sequence, at week level. Official topics and deliverables are marked **[S0x]**; objectives, activities and timings are **[REC]**.

**Readings.** R-IDs come from the verified register (`_source_cache/verification/readings.py`; 89/90 pass, and the single exception is explained in the syllabus §8). SEBoK ranges are article body pages. "p." means PDF page; "sl." means a slide of S10 (pilot release 2026-08).

**Objective notation.** `[Bloom level → CLO]`. The Bloom distribution in syllabus §5 is computed from the Part B objective lines by `_source_cache/verification/bloom_count.py`.

**Revision-1 changes:**
- `satisfy` corrected (M2).
- Session plans match the syllabus §7 calendar (M3).
- SysML micro-labs added in Weeks 5, 6 and 8 (M6).
- CP4 no longer contains behaviour (M6).
- Reading pages updated (M1).
- Citation slips fixed: N², Vee, 42010, risk-handling terms, API (m10, m19).
- A2 minimums phased; requirement-group clarification; exam minutes (M9).
- R-ID and level fixes (m8, m9).

---

# Part B: Integrated 14-Week Course

> **Schedule superseded (2026-10-18).** The week sequence of Part B is superseded by `COURSE_SCHEDULE.md`, the
> authoritative faculty schedule (DECISION_LOG A19). The text below is kept unchanged as reviewed source material; the
> schedule's reuse table says which earlier week feeds which new week.

Default session plan (exceptions are stated per week):

| Session | Segments (minutes) |
|---|---|
| **Session 1: concept studio (75)** | analogy (10) · formal concept with citation (20) · worked AeroLink example (15) · active practice (25) · exit ticket (5) |
| **Session 2: lab (75)** | brief (5) · team work (35) · instructor checkpoint (10) · team work (20) · lab record (5) |

## Week 1: Systems, systems thinking and the engineered enterprise

**Objectives**
- B1.1 Define system, system of interest, boundary, environment, emergence and enterprise [Understand → CLO1]
- B1.2 Construct a context diagram and two causal loops for AeroLink [Apply → CLO1]
- B1.3 Explain one emergent behaviour of AeroLink causally [Analyse → CLO1]
- B1.4 Describe what systems engineering contributes across a life cycle [Understand → CLO1]

**Readings (16 pp)**

| ID | Source | Article | Pages |
|---|---|---|---|
| R01 | SEBoK | *SE Overview* | p.51–54 |
| R02 | SEBoK | *What is Systems Thinking?* | p.264–266 |
| R04 | SEBoK | *Principles of Systems Thinking* | p.273–276 |
| R50 | MITRE | *Systems Thinking* (analysis vs synthesis, UAV example) | p.45–49 |

**Session 1**
- Analogy: a traffic jam is not "in" any single car.
- Formal concept: the SEBoK principles table.
- Worked example: demand ↔ wait time ↔ fleet utilisation.
- Practice: find a feedback loop in vertiport charging.

**Misconceptions targeted**
- "The system is the aircraft."
- "Emergence is the sum of the parts."

**Session 2:** L1 and team charter.

**Assessment:** Q1.

**Workload:** ≈ 8 h.

**Extension:** R05; a one-page archetype critique.

## Week 2: Enterprises, systems of systems, life cycles and stakeholders

**Objectives**
- B2.1 Classify AeroLink as system, enterprise and/or SoS, and justify the classification against the stated criteria [Analyse → CLO1]
- B2.2 Identify and categorise stakeholders with interests, influence and relationships [Apply → CLO1]
- B2.3 Analyse conflicts between stakeholder concerns [Analyse → CLO1]
- B2.4 Explain life-cycle stages, decision gates and the purpose of technical reviews [Understand → CLO1]

**Readings (25 pp)**

| ID | Source | Article | Pages |
|---|---|---|---|
| R07 | SEBoK | *Enterprise SE* | p.814–818 |
| R09 | SEBoK | *Systems of Systems* | p.866–872 |
| R06a–c | SEBoK | *Life Cycle Models / Stages / Technical Reviews and Audits* | p.380–382, 384–385, 386–388 |
| R63 | MITRE | *Stakeholder Assessment and Management* | p.234–238 |

**Session 1**
- Analogy: an airport, where no single organisation owns the passenger journey.
- Example: air traffic management as a persistent SoS (S11 p.869).
- Practice: debate whether AeroLink is an SoS.

**Life-cycle segment (course position)**
- The Vee is presented as a view of how process steps relate. It is not a calendar.
- The source supports this only in part:
  - SEBoK says the Vee "is not a life cycle model" but "retains a sequential flow" (S11 p.395).
  - SEBoK also says time "conceptually proceed[s] from left to right" (S11 p.396).
- Students discuss what each claim implies for iteration.

**Misconceptions targeted**
- "Stakeholders = customers."
- "Every big system is an SoS."

**Session 2:** L2.

**Assessment:** Q2.

**Workload:** ≈ 8.5 h.

**Extension:** R08 (Maier criteria, p.832–834).

## Week 3: Mission analysis, needs, capabilities and ConOps

**Objectives**
- B3.1 State AeroLink's mission, goals and objectives in measurable form [Apply → CLO2]
- B3.2 Transform stakeholder concerns into solution-free need statements [Apply → CLO2]
- B3.3 Derive and decompose capabilities from needs [Analyse → CLO2]
- B3.4 Construct three ConOps scenarios (nominal, weather disruption, charging/maintenance) [Create → CLO2]

**Readings (26 pp)**

| ID | Source | Article | Pages |
|---|---|---|---|
| R10 | SEBoK | *Business or Mission Analysis* | p.543–547 |
| R11 | SEBoK | *Stakeholder Needs Definition* | p.549–556 |
| R52 | MITRE | *Concept of Operations* | p.298–303 |
| R59 | MITRE | *Use Cases and Mission Threads* | p.452–458 |

**Session 1**
- Analogy: a recipe vs a diner's wish.
- Practice: rewrite five solution-laden "needs".
- Scenario segment: storyboard the weather-disruption scenario.

**Misconceptions targeted**
- Needs written as solutions.
- "ConOps = brochure."
- "Only the nominal scenario matters."

**Session 2:** L3.

**Due:** CP1.

**Assessment:** Q3.

**Workload:** ≈ 10 h.

**Extension:** R12 (capability gaps).

## Week 4: Requirements engineering I

**Objectives**
- B4.1 Distinguish needs, stakeholder requirements and system requirements [Understand → CLO2]
- B4.2 Write well-formed requirements with rationale, parent and verification method [Create → CLO2]
- B4.3 Classify requirements by type [Analyse → CLO2]

**Readings (23 pp)**

| ID | Source | Article | Pages |
|---|---|---|---|
| R13 | SEBoK | *System Requirements Definition* (TBD/TBR on p.565) | p.557–567 |
| R48 | DoD | §4.2.1–4.2.3 | p.141–147 |
| R54 | MITRE | *Analyzing and Defining Requirements* | p.328–332 |

**Session 1**
- Analogy: a contract clause that can or cannot be disputed.
- Worked example: NEED → REQ-SYS-001, with a **FICTIONAL** data-sheet threshold.
- Practice: a "requirement smells" sort.

**Misconceptions targeted**
- "A requirement is a design decision."
- "'Safe' is a requirement."
- "Every requirement needs a test."

**Session 2:** L4.

**Assessment:** Q4.

**Workload:** ≈ 9 h.

**Extension:** R55 (checklist, p.368–370).

## Week 5: Requirements quality, traceability and measures

**Objectives**
- B5.1 Evaluate a peer team's requirements against quality characteristics (S12 p.144) [Evaluate → CLO2]
- B5.2 Build a bidirectional trace and identify orphans and childless parents (S12 p.118) [Analyse → CLO2]
- B5.3 Define an MOE → MOP → TPM hierarchy with thresholds and margins (S12 p.116–118) [Create → CLO2]
- B5.4 Read a SysML v2 package and part fragment and identify its elements (micro-lab 1) [Understand → CLO4]

**Readings (27 pp)**

| ID | Source | Article | Pages |
|---|---|---|---|
| R45 | DoD | §4.1.4 | p.118–119 |
| R56 | MITRE | RTM | p.384–391 |
| R15 | SEBoK | *Measurement* (hierarchy figure p.533) | p.528–536 |
| R44 | DoD | §4.1.3 | p.110–117 |

**Session 1**
- Analogy: "feel healthier" (MOE) vs resting heart rate (MOP) vs the weekly trend (TPM).
- Practice: classify 12 measures.

**Misconceptions targeted**
- "Traceability is end-of-project paperwork."
- Confusing MOE with MOP.

**Session 2:** L5 (55 min) + SysML reading **micro-lab 1** (20 min; read-only fragment, no tool).

**Assessment:** Q5.

**Workload:** ≈ 9 h.

**Extension:** R14.

## Week 6: Technology readiness, uncertainty, risk and AROU

**Objectives**
- B6.1 Assess the readiness of three enabling technologies on the TRL scale, citing evidence or labelling assumptions [Evaluate → CLO3]
- B6.2 Write condition–if–then risk statements, rate them on a 5×5 matrix and select handling [Evaluate → CLO3]
- B6.3 Maintain an AROU register that distinguishes the four item types [Apply → CLO3]
- B6.4 Review another team's baseline against adapted SRR criteria [Evaluate → CLO6]
- B6.5 Explain definition vs usage and attributes with units in a SysML fragment (micro-lab 2, online) [Understand → CLO4]

**Key concepts**
- TRL 1–9 (S11 Table 1, p.767).
- 5×5 matrix (S12 p.124–126; S13 p.642).
- Handling terms:
  - assume/accept, avoid, control, transfer, and watch/monitor (S13 p.642);
  - S12 p.126 words them as "accepted (and monitored), avoided, transferred or controlled".
- Risk vs issue vs opportunity.

**Readings (31 pp, peak)**

| ID | Source | Article | Pages |
|---|---|---|---|
| R16 | SEBoK | TRL | p.766–770 |
| R60 | MITRE | Technical maturity / technology planning | p.523–531 |
| R17 | SEBoK | *Risk Management* | p.481–486 |
| R46 | DoD | §4.1.5 | p.120–126 |
| R40 | DoD | §3.2 SRR | p.69–72 |

**Session 1**
- Analogy: a forecast (risk) vs a sprained ankle (issue).
- Example: battery energy density as a technology risk.
- Practice: cross-team rating of five risks. Comparing the results exposes inter-rater variance.
- Security and resilience preview (10 min).

**Session 2**

| Block | Minutes | Content |
|---|---|---|
| SRR-style review | 56 | 8 teams × 7 min |
| L6 debrief | 19 | — |

- L6 TRL and AROU work is completed before class.
- Micro-lab 2 is online (20 min).

**Misconceptions targeted**
- "TRL is an opinion."
- "Risk = issue."
- "A 5×5 score is precise."
- "AROU = a risk list."

**Due:** CP2.

**Assessment:** Q6.

**Workload:** ≈ 11 h.

**Extension:** R61, R51.

## Week 7: Trade studies and decision analysis (Exam 1)

**Objectives**
- B7.1 Structure a trade study: decision statement, alternatives including a baseline, criteria traced to MOEs, value scales [Apply → CLO3]
- B7.2 Elicit swing weights and compute additive value [Apply → CLO3]
- B7.3 Test the sensitivity of the ranking to the top two weights and interpret rank reversal [Analyse → CLO3]
- B7.4 Recommend and justify a decision, including residual uncertainty [Evaluate → CLO3, CLO6]

**Key concepts**
- Value function.
- Swing weight (S11 p.467).
- Additive value v(x) = Σ wᵢ vᵢ(xᵢ) (S11 p.469).
- Sensitivity: "robust if the variations do not change the order of scores" (S11 p.341).

**Readings (14 pp)**

| ID | Source | Article | Pages |
|---|---|---|---|
| R18 | SEBoK | *Decision Management* | p.463–474 |
| R43 | DoD | §4.1.2 | p.109–110 |

**Session 1**

| Block | Minutes | Content |
|---|---|---|
| Concept studio | 45 | Analogy (choosing an apartment), then a worked example of S04 Lab 11 with a fictional dataset |
| L7 kick-off | 30 | — |

**Session 2:** Exam 1 (75 min, individual, closed-AI). L7 is completed out of class, with an office-hour checkpoint.

**Misconceptions targeted**
- Gut-feel weights.
- Summing incomparable scales.
- "The trade study decides."

**Workload:** ≈ 9 h.

**Extension:** Monte Carlo (S11 p.471–472); R35.

## Week 8: Architecture viewpoints, decomposition, interfaces and information

**Objectives**
- B8.1 Describe the system through operational, functional and physical viewpoints, and state each view's purpose [Apply → CLO4]
- B8.2 Decompose functions and allocate them to physical elements with justification [Analyse → CLO4]
- B8.3 Identify physical, information and organisational interfaces with an N² matrix [Analyse → CLO4]
- B8.4 Trace information from producer to consumer to the decision it supports, distinguishing data from information [Analyse → CLO4]
- B8.5 Read a SysML requirement and `satisfy` fragment and state what it asserts (micro-lab 3) [Understand → CLO4]

**Key concepts**
- View vs viewpoint: ISO 42010 is cited in S13's references (p.339), and the view and viewpoint definitions are on p.341.
- N² / coupling matrix (S11 p.630–631).
- Data vs information (S11 p.511–512).

**Readings (27 pp)**

| ID | Source | Article | Pages |
|---|---|---|---|
| R19 | SEBoK | *System Architecture Design Definition* | p.569–577 |
| R62 | MITRE | Architecture frameworks, models and views | p.341–347 |
| R57 | MITRE | *Interface Management* | p.410–415 |
| R21 | SEBoK | *Information Management* | p.510–514 |

**Session 1**
- Analogy: a restaurant (functions vs staff vs ticket rail).
- Example: "Manage flight operations" decomposed and allocated.

**Session 2:** L8 (55 min) + micro-lab 3 (20 min).

**Misconceptions targeted**
- "Architecture = a picture."
- Mixing functions and physical elements.
- "Interfaces are only connectors."

**Due:** CP3.

**Assessment:** Q7.

**Workload:** ≈ 10.5 h.

**Extension:** R20a–c, R22.

## Week 9: MBSE foundations and the SysML v2 language

**Objectives**
- B9.1 Explain what MBSE changes relative to document-based SE, and the distinction between model and view [Understand → CLO4]
- B9.2 Explain definition vs usage, specialization, subsetting and redefinition [Understand → CLO4]
- B9.3 Create a package structure and part definitions/usages with typed attributes and units in the course tool [Apply → CLO4]
- B9.4 Map CP1–CP3 artifacts (by ID) to model packages [Apply → CLO5]
- B9.5 Defend the CP3 trade and architecture decisions [Evaluate → CLO6]

**Key concepts**
- Language architecture.
- Explicit import visibility (S10 sl.6).
- `part def` / `part`.
- Quantities and units.
- Short names as IDs (S06 p.49, 165).
- There is no `block` keyword in v2 (S06 p.197).

**Readings (16 pp + 35 slides)**

| ID | Source | Article / slides | Pages |
|---|---|---|---|
| R28 | SEBoK | *MBSE* | p.370–374 |
| R33a–c | SEBoK | Models KA | p.290–292, 295–297, 298–302 |
| R70 | S10 | — | sl.1–17 |
| R90 | S09 | Pre-beta deck; use with errata | sl.5–22 |

**Session 1**

| Block | Minutes | Content |
|---|---|---|
| CP3 defences | 40 | 8 × 5 min |
| Concept studio | 35 | Analogy: a recipe card (definition) vs tonight's use of it (usage). **Usage ≠ instance.** |

**Session 2:** L9.

**Misconceptions targeted**
- "Model = diagrams."
- "Usage = instance."
- Carrying over v1 vocabulary (block, value property).

**Assessment:** Q8.

**Workload:** ≈ 9 h.

**Extension:** R87 (KerML §7.3).

## Week 10: SysML v2 requirements and structure

**Objectives**
- B10.1 Model requirements with subject, constraint and short-name ID [Apply → CLO4]
- B10.2 Model logical and physical structure with ports, interface definitions and connections [Apply → CLO4]
- B10.3 Relate design to requirements with `satisfy` and logical to physical elements with `allocate`, and explain what each asserts [Analyse → CLO4, CLO5]

**Key concepts**
- A requirement is a kind of constraint; its short name is its requirement ID (S06 p.165).
- **A `satisfy` usage asserts that the requirement *is* satisfied by the given feature (S06 p.168).** A model whose values violate a satisfy assertion is therefore inconsistent. Verification supplies the evidence that the real system makes the assertion true. A negated form, `not satisfy`, also exists (p.168).
- Ports vs interface definitions.
- Allocation.

**Readings (21 slides)**

| ID | Source | Slides |
|---|---|---|
| R74 | S10 | sl.86–91 |
| R71 | S10 | sl.18–29 |
| R76 | S10 | sl.105–107 |

**Session 1**
- Analogy: a plug (port) vs the cable standard (interface definition).
- Practice: spot the error in three snippets drawn from the source errata. The corrected forms are released only after they are parser-checked.

**Misconceptions targeted**
- "`satisfy` is evidence of compliance." It is an assertion in the model; the evidence comes from verification.
- "Allocate = decompose."
- "Ports are parts."

**Session 2:** L10.

**Assessment:** Q9.

**Workload:** ≈ 9.5 h.

**Extension:** S06 §7.21 (p.161–169).

## Week 11: SysML v2 behaviour

**Objectives**
- B11.1 Model one ConOps scenario as an action flow with successions, a decision and item flows [Apply → CLO4]
- B11.2 Model aircraft operating states with transitions, using the current initial-state form (S10 sl.48–54, changed 2026-03) [Apply → CLO4]
- B11.3 Check the behaviour against the ConOps and link it to structure (perform/exhibit) [Evaluate → CLO4, CLO5]
- B11.4 Write actionable review findings (RIDs) on another team's model [Evaluate → CLO6]

**Readings (29 slides)**

| ID | Source | Slides |
|---|---|---|
| R72 | S10 | sl.30–47 |
| R73 | S10 | sl.48–56 |
| R76 | S10 | sl.100–101 |

**Session 1**
- Worked example: "Passenger Transport Mission" (S04 Lab 7) as an action flow.
- Practice: the weather-disruption branch.

**Session 2**

| Block | Minutes | Content |
|---|---|---|
| L11 behaviour | 45 | Formative; graded in CP5 |
| RID-review kick-off | 30 | Checklist, RB-17 |

**Due:** CP4 (requirements, structure, allocation). The asynchronous RID review follows in days 1–3 of Week 12.

**Misconceptions targeted**
- "An action flow and a state machine are interchangeable."
- Behaviour unlinked to structure.

**Assessment:** Q10.

**Workload:** ≈ 10.5 h (behaviour is formative here; it is finalised in CP5).

**Extension:** R82.

## Week 12: Verification, measures and the digital thread

**Objectives**
- B12.1 Distinguish verification from validation and select methods [Understand → CLO5]
- B12.2 Define verification cases for ≥ 3 requirements (objective, subject, method, verdict) [Apply → CLO5]
- B12.3 Represent MOE/MOP in the model and link them to requirements [Apply → CLO2, CLO5]
- B12.4 Audit trace coverage (orphans, childless parents, unverified requirements) and complete ≥ 3 threads [Evaluate → CLO5]
- B12.5 Disposition the RIDs received on the CP4 model [Evaluate → CLO6]

**Key concepts**
- V vs V (S12 p.149–150; S11 p.648).
- `VerificationMethodKind`: inspect, analyze, demo, test. `VerdictKind`: pass, fail, inconclusive, error (S06 p.537–540).
- The S02 11-link chain.

**Readings (18 pp + 4 slides)**

| ID | Source | Article / slides | Pages |
|---|---|---|---|
| R75 | S10 | — | sl.96–99 |
| R49 | DoD | — | p.149–151 |
| R58 | MITRE | *V&V* | p.433–438 |
| R23a | SEBoK | *System Verification* | p.634–640 |
| R30 | SEBoK | *Digital Engineering* | p.1394–1395 |

**Session 1:** Spot the error. MITRE p.286 reverses verification and validation; students find it and correct it.

**Session 2:** L12.

**Misconceptions targeted**
- V&V reversed.
- "Complete trace = correct design."

**Assessment:** Q11.

**Workload:** ≈ 10 h (includes RID dispositions and behaviour finalisation).

**Extension:** R23b, R64.

## Week 13: Analysis, change impact and consistency (Exam 2, practical)

**Objectives**
- B13.1 Determine the impact set of a proposed change by traversing model relationships, and explain how the change propagates [Analyse → CLO5]
- B13.2 Check model consistency, distinguishing "parses" from "correct" [Evaluate → CLO4, CLO5]
- B13.3 Represent risk and cause–effect with model metadata [Apply → CLO3, CLO4]
- B13.4 Explain resilience considerations and the V&V challenges of AI-enabled functions (awareness) [Understand → CLO1]

**Key concepts**
- Impact by relationship traversal. The API reader found **no transitive-closure operation** in S08 (reader notes); traversal is assembled step by step.
- Risk metadata levels: low/medium/high = 25/50/75 % (S06 p.559).
- Resilience objectives, means and techniques (S11 p.1204–1210).

**Readings (14 pp + 10 slides)**

| ID | Source | Article / slides | Pages |
|---|---|---|---|
| R75 | S10 | — | sl.92–95 |
| R77 | S10 | — | sl.108–109 |
| R78 | S10 | — | sl.147, 157–159 |
| R24 | SEBoK | *System Resilience* | p.1203–1210 |
| R31 | SEBoK | *Artificial Intelligence* | p.1368–1373 |

**Session 1**

| Block | Minutes | Content |
|---|---|---|
| Worked impact example | 45 | "Battery usable range decreases 15 %" (fictional) |
| L13 kick-off | 30 | — |

**Session 2:** Exam 2, practical (75 min, RB-14). L13 is completed out of class.

**Workload:** ≈ 9 h.

**Extension:** R32, R88.

## Week 14: Enterprise evolution, stakeholder views and the final technical review

**Objectives**
- B14.1 Plan an evolution increment (autonomous flight operations) and identify the affected elements from the model [Evaluate → CLO5]
- B14.2 Create one view for a non-technical reviewer from model content [Create → CLO6]
- B14.3 Defend design and model decisions in a technical review, and answer individual questions on owned elements [Evaluate → CLO6]

**Readings (12 pp + 4 slides)**

| ID | Source | Article / slides | Pages |
|---|---|---|---|
| R77 | S10 | — | sl.116–119 |
| R41 | DoD | §3.4 PDR | p.75–82 |
| R26 | SEBoK | *Capability Updates* | p.681–684 |

The concept content is delivered online: a 30-minute micro-lecture on evolution and views.

**Session 1 and Session 2:** CP5 reviews, using the syllabus §7 minute plan.

**Assessment:** Q12, peer evaluation, CP5.

**Workload:** ≈ 11 h.

**Extension:** R29.

**Pathway B workload (h/week), re-derived in round 2 (review N4):** 8, 8.5, 10, 9, 9, 11, 9, 10.5, 9, 9.5, 10.5, 10, 9, 11.
- **Sum 134 h; mean 9.6 h/week.**
- Baselines: 126 h for 14 weeks; 135 h including finals week.
- **Revision trigger:** if the pilot mean exceeds 10 h/week, apply the CP5 reductions in syllabus §14.

---

# Part A1: Foundations of Systems Thinking and Technology Literacy (15 weeks)

Official topics, deliverables and assessments are **[S01]**. Each workshop W*n* drafts the deliverable due that week (lab plan Part A1).

**Readings in this table are essential only.** Extensions: R05, R08, R12, R25, R44, R55, R51, R34, R37, R29, and R57, R58 and R23b for Week 12.

| Wk | Topic [S01] | Objectives [REC] (Bloom → A1-CLO) | Essential readings | pp | Workshop | Due [S01] / assessment | Misconception |
|---|---|---|---|---|---|---|---|
| 1 | Foundations of ST & technology literacy | Define system, boundary, emergence (U→1); build a causal loop (Ap→1); treat technology literacy as evaluating claims with evidence (U→3) | R01 p.51–54; R02 p.264–266; R04 p.273–276; R50 p.45–49 | 16 | W1 context, loops, charter | Team formation; Q1 | "System = product" |
| 2 | Systems, enterprises, stakeholders | Classify enterprise/SoS (An→1); map stakeholders with IDs (Ap→1) | R07 p.814–818; R09 p.866–872; R63 p.234–238; R03 p.268–272 | 22 | W2 stakeholder map | **Stakeholder Ecosystem Map**; AROU v0 (see FD-26); Q2 | "Stakeholder = customer" |
| 3 | Stakeholder & mission analysis | Mission/goals/objectives (Ap→2); needs (Ap→2); capability decomposition (An→2) | R10 p.543–547; R11 p.549–556; R53 p.293–297; R06a–c p.380–388 (8 pp) | 26 | W3 needs and capabilities | **Needs & Capability Analysis Report**; Q3 | Needs as solutions |
| 4 | Operational analysis, ConOps, capability analysis | ConOps with ≥ 5 scenarios incl. off-nominal, as a named **Operational Scenarios Package** for A2 (C→2) | R52 p.298–303; R59 p.452–458 | 13 | W4 ConOps | **ConOps**; Q4 | ConOps = brochure |
| 5 | Requirements development fundamentals | Well-formed requirements with rationale and method (C→2); types (An→2) | R13 p.557–567; R48 p.141–147; R54 p.328–332 | 23 | W5 writing (≥ 30 REQ, within S03's 25–40) | **Requirements Draft**; Q5 | Requirement = design |
| 6 | Requirements quality & traceability | Audit against characteristics (E→2); bidirectional trace (Ap→2) | R45 p.118–119; R56 p.384–391; R14 p.476–480 | 15 | W6 audit and RTM | **Requirements Package**; Q6 | Trace as afterthought |
| 7 | Technology literacy & emerging technologies | TRL with evidence (E→3); explain DE/AI trends critically (U→4) | R16 p.766–770; R60 p.523–531; R27 p.55–59 | 19 | W7 technology assessment | **Technology Assessment**; **Exam 1** | Hype = maturity |
| 8 | Technology risk, uncertainty, risk analysis | Rate risks 5×5 (E→5); maintain AROU (Ap→5) | R17 p.481–486; R46 p.120–129; R61 p.626–633 | 24 | W8 risk | **Technology Risk Assessment**; AROU graded here (FD-26); Q7 | Risk = issue |
| 9 | Trade studies & structured decision making | Swing weights and sensitivity (An→3); recommend (E→3) | R18 p.463–474; R43 p.109–110 | 14 | W9 trade study | **Trade Study Report**; Q8 | Gut-feel weights |
| 10 | Architecture concepts | Viewpoints (Ap→2); decompose and allocate (An→2) | R19 p.569–577; R62 p.341–347; R20b p.587–594 | 24 | W10 architecture | **Architecture Concept Description**; Q9 | Architecture = picture |
| 11 | Information views, flows & decision support | MOE/MOP/TPM (C→3); information producers, consumers and decisions; AI interactions (An→4) | R21 p.510–520; R15 p.528–536; R31 p.1368–1373 | 26 | W11 measures and information | **Measures Framework, Information View**; Q10 | Data = information |
| 12 | Integration, interfaces, V&V | Interface inventory / N² (An→4); verification and validation strategy (Ap→2) | R22 p.624–632; R47 p.138–140; R49 p.149–151; R23a p.634–640 | 22 | W12 interfaces and verification | **Interface Inventory, Verification Strategy**; Q11 | V&V reversed (S13 p.286 exercise) |
| 13 | Enterprise risk, security, resilience, roadmaps | Resilience and security (E→5); roadmap (C→5); known unknowns (An→5) | R24 p.1203–1212; R26 p.681–684 | 14 | W13 resilience and roadmap | **Known Unknowns, Risk/Security & Resilience, Roadmap** (assigned Week 11, FD-14); Q12 | Resilience = redundancy |
| 14 | From documents to models | Model vs document, digital thread, MBSE benefits and limits (U/An→4); ID register for A2 (Ap→2) | R28 p.370–374; R30 p.1394–1395; R33a–c p.290–302 (11 pp) | 18 | W14 integration | **Draft Enterprise Package**; **Exam 2** | "MBSE = drawing tool" |
| 15 | Executive review | Defend the package (E→all) | — | — | Rehearsal | **Final Package, Executive Presentation, peer evaluation** | — |

**Reading load:** 13–26 pp/week (Weeks 1–14).

**A1 workload (h/week):** 8, 9, 10, 10, 9, 9, 10, 9, 9.5, 9.5, 10, 10, 11.5, 10, 8.
- **Sum 142.5 h; mean 9.5 h/week.**
- That is ≈ 5.6 % above the 135 h baseline. The excess comes mostly from Weeks 3–4 and 11–14. Mitigations: FD-14 (assign the Week 13 deliverables in Week 11) and the FD-22 pilot.

---

# Part A2: Model-Based Systems Integration with SysML v2 (15 weeks)

Official topics, labs, milestones and assessments are **[S02]/[S04]**. The language primer (P1–P8) is **[REC]** (FD-15).

**Phased model minimums [REC] (review M9).** The official final minimums [S02] still apply at Week 15. Interim lab acceptance is phased:

| Element | Interim target | Full by |
|---|---|---|
| Stakeholders | ≥ 12 in Week 2 | 20 by the Week 5 review |
| Requirements | ≥ 15 in Week 3 | 30 by the Week 5 review |
| Behaviour scenarios | 3 in Week 7 | 5 by Week 8 |

**Exam minutes [REC]:** Exams 1 and 2 are 40 minutes at the start of session 2 in Weeks 6 and 12, and that week's lab is completed out of class. Exam 3 (practical) is in finals week.

| Wk | Topic [S02] | Objectives [REC] (Bloom → A2-CLO) | Primer [REC] | Readings | Lab [S04] | Due / milestone [S02] | Misconception |
|---|---|---|---|---|---|---|---|
| 1 | Engineering package to model foundation | MBSE, model vs view (U→1); packages and conventions (Ap→1); artifact mapping (Ap→2) | P1 packages, imports, names, short-name IDs | R28 p.370–374; R33a–c; R70 sl.1–8; R90 | 1A, 1B | Repository & model structure | "Model = diagrams" |
| 2 | Enterprise context & stakeholder models | Context and stakeholders with concerns (Ap→1); definition/usage (U→1) | P2 definition/usage, parts, attributes, specialization; stakeholders and concerns | R70 sl.9–17; **R77 sl.115** | 2A, 2B (≥ 12 STK) | Context model | "Usage = instance" |
| 3 | Needs, capabilities & requirements | Needs, capability hierarchy, requirements v1 (Ap→1) | P3 requirements, subject, IDs; what `satisfy` asserts (S06 p.168) | R74 sl.86–91; R11 p.549–556 | 3A–3C (≥ 15 REQ) | NCR model | "`satisfy` is evidence of compliance" |
| 4 | Requirements architecture | Organise requirements; evaluate AI critique with reasons (E→4) | P4 **requirement groups**: subrequirements sharing a subject (S06 p.167; S10 sl.90; **not** the graphical «requirementGroup» stereotype); derivation; dependencies | R74; R56 p.384–391; R76 sl.105 | 4A, 4B | Requirements model; AI assessment | "AI critique is authoritative" |
| 5 | Logical architecture | Logical functions and interfaces (Ap→1); SRR-style review (E→5) | P5 ports, interfaces, connections | R20b p.587–594; R71 sl.18–25; R40 p.69–72 | 5 | **SRR-style review (10 %)**; full STK and REQ minimums | Logical = physical |
| 6 | Physical architecture | Physical elements; allocate logical → physical (An→1); evaluate AI-generated alternatives (E→4) | P6 flows, allocation | R20c p.596–603; R71 sl.26–29; R76 sl.106–107 | 6 | Physical model; **Exam 1** (40 min, session 2) | "Allocate = decompose" |
| 7 | Behavioural modelling | Scenarios as actions/states (Ap→1); check against ConOps (E→2) | P7 actions, states, use cases | R72 sl.30–47; R73 sl.48–56; R76 sl.100–101; R59 p.452–458 | 7 (3 scenarios) | Behaviour package | Action flow ≡ state machine |
| 8 | Information, interfaces & AI | Information items, producers/consumers, AI capabilities (Ap→1) | P8 items, flows, metadata | R21 p.510–520; R57 p.410–415; R31 p.1368–1373; R77 sl.108–109 | 8 (+ scenarios 4–5) | Information & interface package | Interfaces only physical |
| 9 | Digital thread construction | Construct and audit trace (An→2) | — | R30 p.1394–1395; R45 p.118–119; R56 (X: R88) | 9 | Traceability package | Complete = correct |
| 10 | Verification & measures | MOE/MOP, verification cases (Ap→2); PDR-style review (E→5) | — | R75 sl.96–99; R23a p.634–640; R15 p.528–536; R41 p.75–82 | 10 | **PDR-style review (10 %)** | V&V reversed |
| 11 | Trade studies & decision support | Model-based trade study (E→3) | — | R18 p.463–474; R75 sl.92–95; R78 sl.152 | 11 | Model-based trade study | Trade = decision |
| 12 | Risk, AROU & impact analysis | Link AROU to elements; impact chains (An→3) | — | R17 p.481–486; R78 sl.147, 157–159 | 12 | Risk & AROU package; **Exam 2** (40 min, session 2, including the required AI-critique part) | Risk list ≠ model |
| 13 | Impact analysis, evolution & autonomy | Answer S04 Lab 13 questions from the model; autonomy increment (E→3) | — | R26 p.681–684; R76 sl.102–104 (X: R32) | 13 + 14 merged | Evolution package; impact report | Impact = text search |
| 14 | Executive communication & storytelling | Views for 5 audiences (C→5) | — | R77 sl.116–119; R78 sl.145 | 15 | Executive review package | Views = new content |
| 15 | Final model demonstration | Live navigation, trace, executive Q&A (E→all) | — | R42 p.83–87 (criteria) | 16 | **Final model (20 %), presentation (5 %), Exam 3 practical (10 %, finals week), peer evaluation (10 %)** | — |

**A2 workload (h/week), re-derived in round 2 (review N4):** 9, 9, 9.5, 9.5, 10.5, 10, 10, 10.5, 9.5, 10.5, 9.5, 10, 11, 9.5, 9.

The change: phasing moves scenarios 4–5 from Week 7 to Week 8, i.e. −1 h in Week 7 and +1 h in Week 8. The exam weeks (6 and 12) move 40 min of lab work out of class and add about 0.7 h of exam preparation, so they are net unchanged within the rounding.
- **Sum 147 h; mean 9.8 h/week.**
- That is ≈ 8.9 % above the 135 h baseline. Phasing the scenarios moves load from Week 7 into Week 8.
- FD-22 pilot. Faculty may also reduce lab scope (FD-13).

---

## Source traceability

- **Official topics:** S01 and S02 schedules; S04 labs; S03 contents.
- **Methods:** verified R-IDs.
- **Facts in "Key concepts":**
  - verified in `SOURCE_ANALYSIS.md` §6: S06 p.197, 537–540, 559; S11 p.767, 576; S12 p.149;
  - verified in review round 1: S06 p.165, 168; S10 sl.6, 48–54; S11 p.341, 395–396, 467, 469, 630–631; S13 p.339, 341, 642; S12 p.126.
- **Misconceptions:** the author's instructional judgement [REC].

## Assumptions

- Two 75-minute meetings plus about 30 minutes online per week.
- The AeroLink Data Sheet is issued in Week 1.
- About 8 teams.

## Decisions requiring approval

FD-01, FD-06, FD-07, FD-08, FD-13, FD-14, FD-15, FD-22, FD-26.

## Known limitations

- Workload figures are estimates.
- No SysML snippet appears in this plan. Snippets are released only after they pass the course-designated checker (FD-08).
