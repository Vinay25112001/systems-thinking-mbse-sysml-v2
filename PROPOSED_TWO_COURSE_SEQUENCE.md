# Proposed Two-Course Sequence: Pathway A (Full University Sequence)

| | |
|---|---|
| **Status** | **PROPOSAL** that elaborates two **existing draft syllabi**. Not institutionally approved. **Revision 1**, 2026-10-09, after external review round 1. |
| **Courses** | **A1** Foundations of Systems Thinking and Technology Literacy (3 cr, Fall) [S01 Draft v2.0] → **A2** Model-Based Systems Integration with SysML v2 (3 cr, Spring; prerequisite A1) [S02 Draft v2.0] |
| **Principle** | Pathway A **preserves the official design intent**. Every outcome, assessment weight, deliverable, exam, milestone and lab in S01/S02 is kept as written. Where this document adds or suggests something, it is labelled **[REC]** and is listed in `FACULTY_DECISION_REGISTER.md`. Official text is labelled **[S01]/[S02]/[S03]/[S04]**. |
| **Companions** | Weekly detail: `WEEKLY_INSTRUCTIONAL_PLAN.md` Parts A1, A2 · Labs: `LABORATORY_AND_CAPSTONE_PLAN.md` Part A · Rubrics: `ASSESSMENT_RUBRICS.md` · Outcome matrix: `COURSE_OUTCOME_ASSESSMENT_MATRIX.md` Part A |

---

# Course A1: Foundations of Systems Thinking and Technology Literacy

## A1.1 Course description and academic purpose
**[S01, paraphrased]** This course introduces systems thinking, SE technical processes and technical-management principles.
Students learn how stakeholder needs become capabilities, requirements, technologies, architectures, integrated solutions
and operational capability across a life cycle. Case studies, practical exercises, AI-assisted analyses and a semester
project build skill in analysing needs, evaluating technologies, assessing risk, understanding information flows and
applying systems thinking. A1 is the foundational systems course in the Integration degree and the conceptual basis for
A2.

**[REC] Academic purpose, sharpened.**
- Students leave A1 able to *produce and defend* a coherent, document-based engineering baseline for an enterprise. Their identifiers and relationships must be clean enough to be transformed into a model in A2 without rework.
- The Air Taxi enterprise (AeroLink Urban Mobility) [S03, S04] is the recommended project case for all teams (FD-21).

## A1.2 Student population and prerequisites
- **[S01]** Not stated, beyond the Integration-degree context.
- **[REC]** Sophomore or junior standing. College algebra. No programming and no prior SE (FD-03).
- **[REC]** Because "Technology Literacy" suggests a mixed audience (not only engineering majors), quantitative work stays at the level of weighted sums, ordinal scales and simple expected values.

## A1.3 Course learning outcomes: official outcomes with measurable performance indicators

The five official outcomes [S01] are kept **verbatim**. **[REC]** Each gets performance indicators (PIs) that make it measurable.

| A1-CLO | Official outcome [S01] | [REC] Performance indicators: evidence that the student achieved it | Bloom |
|---|---|---|---|
| 1 | Apply systems thinking methods to identify stakeholders, analyze relationships, and explain interactions within a complex enterprise environment. | PI-1.1 Stakeholder map with categories, interests, influence and relationships (RB-1 ≥ 3). PI-1.2 Explains a feedback or emergent behaviour in the enterprise (Exam 1 item; RB-1.4) | Apply / Analyse |
| 2 | Develop stakeholder needs, operational capabilities, and requirements that support enterprise objectives and operational success. | PI-2.1 Need statements and capability decomposition traceable to stakeholders (RB-2). PI-2.2 ConOps scenarios incl. off-nominal (RB-2.4). PI-2.3 ≥ 75 % of a 10-requirement audit sample meets the quality characteristics (RB-3 level 3, aligned with the RB-3 band; review m15) | Create |
| 3 | Assess technologies and alternatives using trade studies, performance measures, and evidence-based decision-making techniques. | PI-3.1 Technology assessment with maturity evidence (RB-5.1–5.2). PI-3.2 Trade study with traced criteria, weights and sensitivity (RB-6). PI-3.3 MOE/MOP framework (RB-4) | Evaluate |
| 4 | Analyze information flows, decision-support needs, and AI-enabled capabilities to explain how information contributes to enterprise operations and management. | PI-4.1 Information view (producers, consumers, flows, data vs information, decisions supported, AI interactions) (RB-7.5–7.6). PI-4.2 AI Usage Statements that evaluate output quality critically (RB-12). This is *corroborating* evidence: S01 gives the statements no separate weight | Analyse |
| 5 | Evaluate risks, assumptions, opportunities, and future trends to recommend strategies that improve enterprise resilience and support long-term evolution. | PI-5.1 AROU register and risk assessment with ratings and treatments (RB-5.3–5.5). PI-5.2 Resilience/security assessment and evolution roadmap (RB-15). PI-5.3 Exam 2 risk item | Evaluate |

## A1.4–A1.7 Weekly objectives, Bloom alignment, concept map, topic coverage
Weekly topics and deliverables are **official [S01]**. Week-level objectives (with Bloom levels), readings and activities are
**[REC]** and appear in `WEEKLY_INSTRUCTIONAL_PLAN.md` Part A1. The concept dependency map is the systems-thinking half
(nodes ST → … → TRADE → ARCH → IF) of the map in `PROPOSED_COURSE_SYLLABUS_14_WEEK.md` §6, plus:
- information management → decision support;
- resilience and security;
- technology roadmaps;
- digital engineering, which bridges to A2.

| Wk | Official topic [S01] | Official deliverable(s) [S01] | Official assessment [S01] | Readings [REC] (verified R-IDs) |
|---|---|---|---|---|
| 1 | Foundations of Systems Thinking and Technology Literacy | Team Formation | Quiz 1 | R01, R02, R04, R50 |
| 2 | Systems, Enterprises, and Stakeholders | Stakeholder Ecosystem Map | Quiz 2 | R07, R09, R63, R03 |
| 3 | Stakeholder Analysis and Mission Analysis | Needs & Capability Analysis Report | Quiz 3 | R10, R11, R53, R06a–c |
| 4 | Operational Analysis, ConOps, and Capability Analysis | ConOps | Quiz 4 | R52, R59, R12 |
| 5 | Requirements Development Fundamentals | Requirements Draft | Quiz 5 | R13, R48, R54 |
| 6 | Requirements Quality and Traceability | Requirements Package | Quiz 6 | R45, R56, R14 (X: R55) |
| 7 | Technology Literacy and Emerging Technologies | Technology Assessment | **Exam 1** | R16, R60, R27 |
| 8 | Technology Risk, Uncertainty, and Risk Analysis | Technology Risk Assessment | Quiz 7 | R17, R46, R61 (X: R51) |
| 9 | Trade Studies and Structured Decision Making | Trade Study Report | Quiz 8 | R18, R43 (X: R34) |
| 10 | Architecture Concepts | Architecture Concept Description | Quiz 9 | R19, R20b, R62 |
| 11 | Information Views, Information Flows, and Decision Support | Measures Framework, Information View | Quiz 10 | R21, R15, R31 (X: R44) |
| 12 | Integration, Interface Management, Verification, and Validation | Interface Inventory, Verification Strategy | Quiz 11 | R22, R47, R49, R23a (X: R57, R58, R23b) |
| 13 | Enterprise Risk, Security, Resilience, Technology Roadmaps, and Strategic Evolution | Known Unknowns Analysis, Risk/Security & Resilience Assessment, Enterprise Evolution Roadmap | Quiz 12 | R24, R26 (X: R25, R37) |
| 14 | From Documents to Models: Digital Engineering, MBSE, and AI | Draft Enterprise Package | **Exam 2** | R28, R30, R33a–c (X: R29) |
| 15 | Enterprise Project Executive Review | Final Enterprise Package, Executive Presentation | Presentation, Peer Evaluation | — |

All R-IDs are verified (`_source_cache/verification/readings_verified.txt`); page ranges are in the weekly plan.
The essential reading load is **13–26 pages per week**, computed from the article body pages in the weekly plan (review M5).

## A1.8 Readings
See the table above and `WEEKLY_INSTRUCTIONAL_PLAN.md` Part A1.
- **[S01]** Textbook TBD. **[REC]** No purchased textbook: the SEBoK (open access), the DoD SE Guidebook and the MITRE SEG are already in the course folder (FD-09).
- **[S01]** INCOSE publications, FAA Advanced Air Mobility resources and NASA systems engineering resources are listed among the potential readings. **None of them is in the collection** (FD-10).

## A1.9 Lecture and interactive-learning plan
**[S01]** Hybrid: pre-class (readings, video lectures, AI-assisted learning, preparation exercises); in-class (discussions,
workshops, team exercises, case studies, systems engineering activities); post-class (project work, quizzes, assignment revisions).
**[REC]** Same two-session weekly pattern as Pathway B §9: a concept studio, then a project workshop W1–W14 (see the lab plan).

## A1.10 Engineering workshops (laboratory equivalent)
**[REC]** A1 has no "labs" in S01. Fourteen in-class **project workshops** (W1–W14) each produce the first draft of
that week's official deliverable under instructor coaching. Specifications are in `LABORATORY_AND_CAPSTONE_PLAN.md` Part A1.

## A1.11 Deliverables
Official: the 17 project deliverables of S01, with **contents** taken from S03 (C3 in `CURRICULUM_RECONCILIATION.md`).
Lengths follow S03's recommended lengths. Technology Risk Assessment has no S03 length; **[REC]** 2–3 pages.

**[REC] Identifier discipline from Week 2.** Every stakeholder, need, capability, scenario, requirement, measure, risk,
interface and verification activity gets a stable ID (`LABORATORY_AND_CAPSTONE_PLAN.md` §C). This turns the
"authoritative source of enterprise data" that S01 promises A2 into something actually machine-transformable.

## A1.12 Assessments (official, unchanged)

| Assessment [S01] | Weight |
|---|---|
| Weekly Quizzes | 10 % |
| Exam 1: Foundations, Requirements, Trade Studies (Week 7) | 15 % |
| Exam 2: Architecture, Validation, Risk, Roadmaps (Week 14) | 15 % |
| Enterprise Project (17 deliverables) | 50 % |
| Peer Evaluation | 10 % |

**Official gap (review m16).** S01 weights the **AROU Register at 2 %** but gives it no due week. **[REC] (FD-26):** start it with the Stakeholder Map (Week 2), update it with each deliverable, and grade it in Week 8 with the Technology Risk Assessment.

Project deliverable weights follow S01 v2.0 (sum 50 %). They do **not** follow S03, whose weights sum to 60 % (FD-04).

**Observation (not a change).** Exam 1's *title* is "Foundations, Requirements, and Trade Studies", but its *coverage
list* does not include trade studies [S01]. Trade studies are taught in Week 9 and listed under Exam 2. **[REC]** Retitle
Exam 1 to match its coverage list, e.g. "Foundations, Requirements, and Technology Assessment" (FD-07).

**[REC] Optional packaging (FD-14).** Seventeen separately graded team deliverables, five of them worth ≤ 1 %, create
heavy grading load (17 × number of teams) and fragmented feedback. The alternative below keeps **every artifact and its
weight**, but submits and grades them in five milestone packages:

| Package | Week | Artifacts (S01 weights) | Total |
|---|---|---|---|
| P1 Enterprise & Stakeholders | 4 | Stakeholder Map 2, Needs & Capability 3, ConOps 4 | 9 % |
| P2 Requirements Baseline | 6 | Requirements Package 7 (draft in Week 5 is formative) | 7 % |
| P3 Technology & Decisions | 9 | Technology Assessment 3, Technology Risk 2, AROU 2, Trade Study 5 | 12 % |
| P4 Architecture & Information | 12 | Architecture Concept 3, Measures 1, Information View 2, Interface Inventory 1, Verification Strategy 1 | 8 % |
| P5 Strategy & Final Package | 13 + 15 | Known Unknowns 1, Risk/Security/Resilience 2, Roadmap 1, Final Package & Presentation 10 | 14 % |
| | | **Total** | **50 %** |

## A1.13 Rubrics
RB-1 to RB-7, RB-11, RB-12, RB-13 and RB-15 (`ASSESSMENT_RUBRICS.md`).

## A1.14 Workload and contact hours
**Baseline.** 3 credits is about 9 h/week (3 h contact + 6 h out of class; same basis and caveats as Pathway B §14), or **≈ 135 h**.

**Estimate.** The weekly plan estimates **142.5 h (mean 9.5 h/week), ≈ 5.6 % above the baseline** (review M5). The pilot and the FD-14 timing change are the mitigations.

**Project writing load.** S03's recommended lengths sum to **52–78 pages of team documents** (D1–D15, excluding the D12 table). With the recommended 2–3 pages for the Technology Risk Assessment the total is 54–81 pages (review m13). The 25–40-page final package comes on top of this
(largely a revision of earlier work). For a team of 4 that is about 15–21 pages per student across 15 weeks. That is feasible at ≈ 3–4 h/week.

**Peak weeks:**
- **Week 13** has three deliverables (≈ 11–16 pages). **[REC]** Assign them in Week 11 (FD-14).
- **Week 14** has the draft package plus Exam 2.

## A1.15 CLO assessment matrix
See `COURSE_OUTCOME_ASSESSMENT_MATRIX.md` Part A1.

## A1.16–A1.17 Capstone and final review
**[S01]** The Business/Engineering Enterprise Package is the semester project and "the authoritative source of enterprise
data" for A2. Final review: the Week 15 Executive Presentation [S01], 15–20 minutes [S03 D16]. Criteria are in RB-11.
**[REC]** The package must include an **ID register** (spreadsheet of all IDs and relationships) as an appendix. It is the
direct input to A2 Lab 1B (artifact-to-model mapping).

## A1.18–A1.19 Quality, accessibility, AI and integrity
Same requirements as Pathway B §18–§19. Official AI, data-protection, integrity, collaboration, late-work and
attendance policies are **[S01]** and unchanged. The accessibility statement is "TBD (University Standard Statement)" [S01]. **[REC]** Insert the university standard text (FD-20).

## A1.20 Risks and decisions
- Mixed-audience quantitative level (FD-03).
- Deliverable fragmentation (FD-14).
- Week 13 overload (FD-14).
- Exam 1 trade-study scope (FD-07).
- Missing external sources (FD-10).

---

# Course A2: Model-Based Systems Integration with SysML v2

## A2.1 Course description and academic purpose
**[S02, intent]** Students turn the A1 package into an integrated SysML v2 model of the enterprise. The model covers stakeholder needs,
operational concepts, requirements, architectures, interfaces, information flows, verification, risks and evolution.
Students then use the model and AI-assisted workflows for traceability, impact assessment, decision support and
communication.

**[REC] Purpose, sharpened.**
- "Model" is not "draw diagrams". Students must show that their model is **consistent, traceable and usable for answering questions**.
- They must explain the SysML v2 **semantics** behind each construct they use, including definition vs usage, specialization, satisfy, verify and allocate.

## A2.2 Population and prerequisites
**[S02]** Prerequisite: A1. **[REC]** Students arrive with an A1 package and ID register. Transfer students without
A1 receive the instructor reference package (FD-03).

## A2.3 Course learning outcomes: official outcomes with measurable performance indicators

| A2-CLO | Official outcome [S02] | [REC] Performance indicators | Bloom |
|---|---|---|---|
| 1 | Construct and navigate SysML v2 models that represent stakeholder needs, capabilities, requirements, architectures, behaviors, interfaces, and information flows within a complex enterprise. | PI-1.1 Model accepted without errors by the course-designated checker; packages follow conventions (RB-8.1–8.2). PI-1.2 Constructs are semantically correct (RB-8.3–8.5). PI-1.3 Navigation tasks in Exam 3 (RB-14 Task 1) | Create / Apply |
| 2 | Establish and analyze digital traceability relationships among stakeholders, needs, capabilities, requirements, behaviors, architecture elements, verification activities, and risks. | PI-2.1 The S02 11-link chain is demonstrated end to end for ≥ 5 threads, and every requirement traces up and down (RB-9.1–9.3). PI-2.2 Trace audit identifies orphans and childless parents (RB-9.4) | Analyse |
| 3 | Use a SysML v2 model to perform impact analysis, trade studies, risk assessments, and other model-based evaluations that support engineering decisions. | PI-3.1 Model-based trade study (Lab 11; RB-6). PI-3.2 Impact analysis for the S04 Lab 13 questions with a model-derived impact set (RB-9.5). PI-3.3 Risk linked to elements (RB-5.5) | Evaluate |
| 4 | Apply AI-assisted engineering workflows to develop, review, analyze, and communicate model information while exercising appropriate human judgment and validation of results. | PI-4.1 AI quality assessment of requirements with accept/reject reasons (Lab 4B). PI-4.2 AI-generated model content is accepted by the course checker and explained by its owner (RB-12.3). PI-4.3 **Individual:** critique of an AI-generated model fragment, which is 20 % of Exam 2 [REC, required; review C3] | Apply / Evaluate |
| 5 | Communicate model-derived insights and recommendations to technical and non-technical stakeholders through model reviews, executive briefings, and structured engineering presentations. | PI-5.1 Stakeholder-specific views for the S04 Lab 15 audiences (RB-11.4). PI-5.2 Executive presentation with live model navigation (RB-11) | Evaluate |

## A2.4–A2.7 Weekly topics (official) with the [REC] language-primer strand

**Main finding of the review (A2).** S02 assumes students can *construct* SysML v2 models from Week 1, but it schedules no
language instruction. **[REC] (FD-15):** a 30–40-minute **language primer** opens each of Weeks 1–8. It teaches exactly
the constructs that week's lab needs, in the order of the dependency map. Primer content comes from S10 (CC BY 4.0) and
**must be accepted by the course-designated checker** before use (FD-08). Until then, the interim fallback applies: instructor review against the S06 grammar and the errata sheet, labelled as such.

| Wk | Official topic [S02] | Official lab [S04] | Official deliverable / milestone [S02] | [REC] Language primer | Readings [REC] |
|---|---|---|---|---|---|
| 1 | Engineering Package to Model Foundation | Lab 1A repository; 1B artifact mapping matrix | Repository & Model Structure | P1 Language architecture; packages, visibility, imports; naming and IDs (short names) | R28, R33a–c, R70 (sl.1–8), R90 |
| 2 | Enterprise Context & Stakeholder Models | Lab 2A context; 2B stakeholders | Context Model | P2 Definition vs usage; part def/part; attributes; specialization, subsetting, redefinition; stakeholders and concerns | R70 (sl.9–17), R77 (sl.115) |
| 3 | Needs, Capabilities & Requirements | Lab 3A needs; 3B capabilities; 3C requirements v1 | Needs-Capabilities-Requirements Model | P3 Requirement def/usage, subject, assume/require constraints, IDs. What a `satisfy` usage asserts (S06 p.168) | R74, R11 |
| 4 | Requirements Architecture | Lab 4A organisation; 4B AI quality assessment | Requirements Model | P4 Requirement groups as subrequirements sharing a subject (S06 p.167; S10 sl.90). This is **not** the graphical «requirementGroup» stereotype. Also: derivation; dependencies | R74, R56, R76 (sl.105) |
| 5 | Logical Architecture | Lab 5 | **Requirements & Capability Model Review (SRR-style)** | P5 Ports, interfaces, connections | R20b (p.587–594), R71 (sl.18–25), R40 |
| 6 | Physical Architecture | Lab 6 (+ AI alternatives) | Physical Architecture Model | P6 Flows; allocation; satisfy | R20c (p.596–603), R71 (sl.26–29), R76 (sl.106–107) |
| 7 | Behavioral Modeling | Lab 7 (3 scenarios; scenarios 4–5 in Week 8) | Behavior Package | P7 Actions, successions, decisions; states; use cases | R72, R73, R76 (sl.100–101), R59 |
| 8 | Information, Interfaces & AI | Lab 8 | Information & Interface Package | P8 Items and flows; metadata for AI capabilities | R21, R57, R31, R77 (sl.108–109) |
| 9 | Digital Thread Construction | Lab 9 | Traceability Package | (none: integration week) | R30, R45, R56 (X: R88) |
| 10 | Verification & Measures | Lab 10 | **Architecture & Traceability Model Review (PDR-style)** | — | R75 (sl.96–99), R23a, R15, R41 |
| 11 | Trade Studies & Decision Support | Lab 11 | Model-Based Trade Study | — | R18, R75 (sl.92–95), R78 (sl.152) |
| 12 | Risk, AROU & Impact Analysis | Lab 12 | Risk Package | — | R17, R78 (sl.147, 157–159) |
| 13 | Impact Analysis, Enterprise Evolution & Autonomy | **Labs 13 + 14 merged** (FD-06) | Evolution Package & Impact Analysis Report | — | R26, R76 (sl.102–104) (X: R32) |
| 14 | Executive Communication & Model Storytelling | Lab 15 | Executive Review Package | — | R77 (sl.116–119), R78 (sl.145) |
| 15 | Final Enterprise Model Demonstration | Lab 16 | Final model, practical demonstration, executive presentation (**FDR-style**) | — | R42 (CDR criteria, adapted) |

## A2.8 Readings
- **[S02]** Textbook TBD. **[REC]** The primary language reference is S10 (Release 2026-08), with S09 as the graphical companion. S06 (SysML **v2.1 Beta 2**, a beta revision with "OMG Document Number: None") is the instructor's reference text. It is **not** the formal standard (review M8). The formal SysML 2.0 specification is not in the collection; obtaining it is FD-27. SEBoK (S11) and DoD (S12) supply process context.
- **Students must not be told the beta texts are the final standard** (`SOURCE_ANALYSIS.md` §1.1).

## A2.9 Lecture and interactive-learning plan
**[S02]** Hybrid, with peer review of each major lab: develop, hand to another team, review, return, incorporate,
submit. **[REC]** The weekly pattern is a primer (30–40 min), then studio modelling with instructor checkpoints, then a
peer-review exchange in the second session (Weeks 3–14).

## A2.10 Labs
Official: the 16 S04 labs, with Labs 13 and 14 merged into Week 13 (FD-06). **[REC]** Each lab gets acceptance criteria and a checker
check (`LABORATORY_AND_CAPSTONE_PLAN.md` Part A2).

## A2.11 Deliverables and model minimums (official)
**[S02]** Final model packages: Enterprise Context, Stakeholders, Needs, Capabilities, Requirements, Logical Architecture,
Physical Architecture, Behavior, Information, Interfaces, Verification, AROU Register, Enterprise Evolution, Digital Thread.

**[S02] Minimum content:** 20+ stakeholders, 10+ capabilities, 30+ requirements, 10+ logical elements, 10+ physical
elements, 5+ operational scenarios, 10+ risks, 5+ verification activities, 4+ AI capabilities.

**Feasibility assessment [REC].** All minimums are feasible for a team of 4 over 15 weeks at about 3–4 h/student/week of
project time. For example, 30 requirements are **re-used from A1**; the modelling cost is roughly 10–15 minutes per requirement,
including satisfy and verify links. The hardest item is **5+ scenarios as behaviour models**, at roughly 3–5 h each for a
first-time modeller.

**[REC] Phasing (review M9).** Interim lab targets are phased; the official minimums apply at Week 15:
- Stakeholders: ≥ 12 in Week 2, 20 by the Week-5 review.
- Requirements: ≥ 15 in Week 3, 30 by the Week-5 review.
- Scenarios: 3 in Week 7, all 5 by Week 8.

**[REC] Clarification (FD-13).** The official text does not say how much of the thread must be complete. The proposed reading:
- *every* requirement traces up to a need and down to at least one verification method;
- **≥ 5 complete end-to-end threads** follow the full 11-link chain.

## A2.12 Assessments (official, unchanged)

| Assessment [S02] | Weight |
|---|---|
| Weekly Team Labs | 25 % |
| Exam 1 (Model Foundations and Architecture) | 5 % |
| Exam 2 (Behavior, Interfaces, Traceability and Analysis) | 5 % |
| Exam 3 (Practical) | 10 % |
| Requirements & Capability Model Review (Week 5) | 10 % |
| Architecture & Traceability Model Review (Week 10) | 10 % |
| Final Enterprise Team Model | 20 % |
| Executive Presentation | 5 % |
| Peer Evaluation | 10 % |

**Observation.** Individual assessment (Exams 1–3 plus peer evaluation) totals **30 %**; team work is 70 %. Before revision 1, A2-CLO4 (AI-assisted workflows) had **no individual evidence at all** (review C3).

**[REC] (FD-17)**, all within the official weights:
- **Required:** 20 % of Exam 2 is an individual critique of an AI-generated model fragment.
- **Required:** individual Q&A (RB-11.5) at the SRR- and PDR-style reviews and in the presentation. S02 already requires each student to present a portion.
- **Required:** individual element ownership.
- **Optional:** a student must pass Exam 3 to pass the course.
- Attainment is conjunctive (`COURSE_OUTCOME_ASSESSMENT_MATRIX.md` §0).

S02 does not specify exam weeks. **[REC] (FD-07):**
- Exam 1: 40 minutes at the start of session 2 in Week 6.
- Exam 2: 40 minutes at the start of session 2 in Week 12.
- In those two weeks, that week's lab is completed out of class.
- Exam 3 (practical): finals week.

## A2.13–A2.15 Rubrics, workload, matrix
Rubrics: RB-3, RB-5, RB-6, RB-8, RB-9, RB-10, RB-11, RB-12, RB-13, RB-14, RB-17. The baseline is ≈ 135 h. The weekly plan estimates **147 h (mean 9.8 h/week), ≈ 8.9 % above it** (review M5); the mitigations are phasing and FD-22. Lab work is
about 3.5–4.5 h/student/week; the week-by-week figures are in the weekly plan. Matrix: `COURSE_OUTCOME_ASSESSMENT_MATRIX.md` Part A2.

## A2.16–A2.17 Capstone and final review
The capstone continues the A1 package [S02]. The Week-15 final review is a demonstration plus executive presentation [S02, S04 Lab 16]:
- navigate the model live;
- demonstrate traceability;
- explain architecture decisions;
- show AI-assisted analyses;
- answer executive questions from the model.

**"FDR"** is S02's own term. No SE guidance source in the collection (S11–S13) defines it. S12 defines ASR, SRR, SFR, PDR, CDR, TRR, SVR/FCA, PRR and PCA (review m7). **[REC]** Keep
the official name and base its entry criteria on S12 CDR (p.83–87) and PCA, adapted to a model (FD-16).

## A2.18–A2.19 Quality, accessibility, AI and integrity
As in Pathway B §18–§19. Official policies [S02] are unchanged. **Accessibility risk specific to A2:** graphical SysML tools
may not work with screen readers, so the tool decision must include an accessibility evaluation (FD-08, FD-20).

## A2.20 Risks and decisions
- No language instruction in the official schedule (FD-15).
- Tool undecided (FD-08).
- Beta-status language (FD-08).
- 70 % team weighting (FD-17).
- 16 labs vs 15 weeks (FD-06).
- Exam weeks (FD-07).
- Thread completeness (FD-13).
- "FDR" naming (FD-16).

---

## Source traceability
- Official text: S01 (A1 description, outcomes, schedule, assessment, policies), S02 (A2 description, outcomes, schedule, roles, reviews, minimums, digital-thread chain, assessment), S03 (deliverable contents and lengths), S04 (labs).
- Readings: verified R-IDs (`_source_cache/verification/readings.py`, `readings_verified.txt`).
- Review criteria: S12 §3.2 (SRR), §3.4 (PDR), §3.5 (CDR).
- External frameworks: revised Bloom (Anderson & Krathwohl 2001); 34 CFR 600.2.

## Assumptions
- The official weeks are kept exactly. Deliverables are due at the end of the listed week.
- Team size is 4 and class size about 32.
- The A2 tool is available from Week 1 (FD-08).

## Decisions requiring approval
FD-03, FD-04, FD-05, FD-06, FD-07, FD-08, FD-09, FD-10, FD-13, FD-14, FD-15, FD-16, FD-17, FD-20, FD-21, FD-22, FD-26, FD-27.

## Known limitations
- The performance indicators and recommendations are the author's. No faculty review has taken place.
- A1/A2 lab time estimates are not validated.
- The S03 CLO 1–8 list is unavailable, so the A1 PIs map to the five S01 outcomes only (FD-05).
