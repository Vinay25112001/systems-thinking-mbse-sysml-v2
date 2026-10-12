# Curriculum Reconciliation and Proposal

**Status:** DRAFT for approval (checkpoint 1). Nothing here changes an official requirement; every
change is a *proposal* marked **[DECISION]** and listed in `OPEN_QUESTIONS.md`.
**Date:** 2026-10-09. **Basis:** the four syllabus documents, read in full (see `SOURCE_INVENTORY.md`
S01–S04). Source IDs used below: S01 Systems Thinking syllabus v2.0, S02 MBSI syllabus v2.0,
S03 "Syllabus Notes Phase 2 Air Taxi Deliverables", S04 "Weekly Lab Deliverables".

Labels used throughout: **OFFICIAL** = stated in S01–S04. **RECOMMENDATION** = mine, needs approval.

---

## 1. What the official documents actually define

| | S01 Foundations of Systems Thinking & Technology Literacy | S02 Model-Based Systems Integration (with SysML v2) |
|---|---|---|
| Credits / term | 3 cr, Fall | 3 cr, Spring; **prerequisite = S01** |
| Length | 14 teaching weeks + finals week (15) | 14 teaching weeks + finals week (15) |
| Delivery | Hybrid active learning; pre/in/post-class | same |
| Outcomes | 5 objectives, 5 outcomes | 5 objectives, 5 outcomes |
| Assessment | Quizzes 10, Exam 1 15, Exam 2 15, Project 50, Peer 10 = **100** ✔ | Labs 25, Ex1 5, Ex2 5, Ex3 practical 10, SRR-style review 10, PDR-style review 10, Final model 20, Exec presentation 5, Peer 10 = **100** ✔ |
| Project | Team (4 preferred, 3 min) "Business/Engineering Enterprise Package", 17 graded deliverables = **50 %** ✔ | Same team carries the package into a SysML v2 model; 4 roles (Requirements & Compliance, Architecture, AI & Data, V&V) |
| Textbook | **TBD** | **TBD** |
| Tools | Copilot (preferred AI), MS Office/Teams/OneDrive | same + "Internet connection for modeling software" (tool **not named**) |
| AI | Required; AI Usage Statement on every major deliverable | Required; same statement |

Totals were recomputed: S01 deliverables 2+3+4+7+3+2+2+5+3+1+2+1+1+1+2+1+10 = 50; S01 overall = 100; S02 overall = 100.

The **Air Taxi enterprise** is named only in S03/S04 ("Air Taxi Enterprise"; S04 Lab 2A names the
enterprise **"AeroLink Urban Mobility"**). S01/S02 speak generically of "an Enterprise case study".

## 2. Contradictions and inconsistencies found (OFFICIAL vs OFFICIAL)

| # | Finding | Evidence | Proposed resolution |
|---|---|---|---|
| C1 | **S03 deliverable weights sum to 60 %**, but the table is labelled "Total Project Weight 50 %". | S03 "Project Grading Summary": 4+5+4+8+2+3+5+4+2+2+2+2+1+3+3+10 = 60 | RECOMMENDATION: treat S01 v2.0 weights (sum 50) as authoritative. S01 was modified 2026-09-04; S03 was created 2026-07-15 and never revised (docx metadata). **[DECISION D1]** |
| C2 | S03 and S01 disagree on the weight of 13 of the 16 shared deliverables (e.g. Stakeholder Map 4 % vs 2 %, Requirements 8 % vs 7 %, Roadmap 3 % vs 1 %). | S01 "Enterprise Project Deliverables" vs S03 summary | Same as C1. |
| C3 | S01 has **Technology Risk Assessment (2 %)**; S03 has no such deliverable. | S01 table; S03 Deliverables 1–16 | Keep it (S01 newer). S03's per-deliverable "Required Contents" are still the best content spec for the other 16 and should be reused. |
| C4 | S03 maps deliverables to **CLO 1–8**; S01 defines only **5 outcomes**. | S03 "CLO Alignment" lines; S01 "Course Learning Outcomes" | RECOMMENDATION: re-map S03 contents to S01 Outcomes 1–5 (draft map in §6). The original 8-CLO list is not in the collection. **[DECISION D2]** |
| C5 | S04 defines **16 weekly labs**; S02 has 14 teaching weeks + finals (15 slots). | S04 Weeks 1–16; S02 schedule | Labs 1–12 match S02 weeks 1–12 one-to-one. S02 Week 13 "Impact Analysis, Enterprise Evolution & Autonomy" = S04 Labs 13 **and** 14. S02 Week 14 = Lab 15, finals = Lab 16. RECOMMENDATION: merge Labs 13+14 as S02 already implies. **[DECISION D3]** |
| C6 | Course title variants: "Model-Based Systems Integration (with SysML v2)" (S02) vs "MBSE with SysML v2 and AI" (S03, S04). | headers | Use S02's title; note the alias. |
| C7 | **Required digital thread** (S02) is an 11-link chain (Stakeholder→Need→Capability→Requirement→Behavior→Logical→Physical→Information Flow→Verification Method→MOE/MOP→Risk). Lab 9 (S04) builds only Need→Capability→Requirement→Logical→Physical→Information. | S02 "Required Digital Thread"; S04 Week 9 | Not a conflict but a gap: the stakeholder, behavior, verification, measures and risk links arrive in Labs 2, 7, 10 and 12. RECOMMENDATION: the studio shows the full 11-link thread from Week 1 and fills it in progressively. |
| C8 | S02 expects the prerequisite package to contain an **"Operational Scenarios Package"**, and separate Stakeholder, Needs and Capability analyses, plus a "Risk Assessment". S01 produces a combined Needs & Capability Report, a ConOps (which contains scenarios per S03 D3) and a "Risk, Security & Resilience Assessment". S01's **Measures Framework, Technology Risk Assessment and Known Unknowns** are not on S02's input list, yet S02 Week 10 needs MOEs/MOPs. | S02 "Course Project"; S01 package list | Naming drift, not substantive. RECOMMENDATION: the studio's artifact-to-model mapping (Lab 1B) lists every S01 artifact explicitly. |
| C9 | **Minimum model content** (S02) exceeds what the lab sheet seeds: Lab 2A names 7 stakeholders (20+ required), Lab 5 names 6 logical functions (10+ required), Lab 6 names 6 physical elements (10+ required). | S02 "Minimum Model Content"; S04 Labs 2, 5, 6 | Not a conflict (the lab lists are starting points). The studio's Air Taxi reference dataset should meet or exceed every minimum. |
| C10 | Exam weeks are not stated in S02 (Exam 1 covers through physical architecture, i.e. after Week 6; Exam 2 through risk, i.e. after Week 12). S01 places Exam 1 in Week 7 and Exam 2 in Week 14. | S02 "Examinations"; S01 schedule | **[DECISION D4]** confirm S02 exam weeks. |
| C11 | "Final Design Review (FDR)" (S02 Week 15). Standard DoD/NASA review names are SRR, SFR, PDR, CDR, TRR, etc.; "FDR" is uncommon. | S02 "Model Review Milestones" | **Verified:** S12 defines ASR/SRR/SFR/PDR/CDR/SVR-FCA/PRR/PCA with criteria tables (S12 p.68–96), and no source in the collection has an "FDR". Keep the official name and build its criteria from S12's CDR (p.85) and PCA tables. |
| C12 | Syllabi list potential readings (SEBoK, INCOSE, **FAA Advanced Air Mobility, NASA SE**, industry cases). The collection holds **no INCOSE, FAA or NASA documents**. | S01/S02 "Supplemental Readings" vs inventory | Gap. Any eVTOL performance figure, regulation or certification statement in the course has no in-collection source and must be labelled a **teaching assumption** until a source is added. **[DECISION D5]** |
| C13 | The modelling tool is not named, yet S02 requires students to "construct and navigate SysML v2 models". | S02 Software | **[DECISION D6]** tool choice (e.g. SysML v2 Pilot Implementation/Jupyter, SysIDE, SysON, a commercial tool). The studio can teach and check a *subset* of textual notation but is not a conformant SysML v2 tool. |

> **SUPERSEDED (2026-10-09, Phase 0b):** the 2:1 compression proposed in this section was withdrawn after the academic review; see `CURRICULUM_COMPARISON.md` §1 and FD-25. The current proposals are `PROPOSED_TWO_COURSE_SEQUENCE.md` (Pathway A) and `PROPOSED_COURSE_SYLLABUS_14_WEEK.md` (Pathway B). §1–§2 (contradictions C1–C13) remain valid.

## 3. The proposed 7 + 7 schedule vs the official 14 + 14

The master prompt asks for a **seven-week Systems Thinking block plus a seven-week MBSE block (14 weeks)**.
The official design is **two 15-week, 3-credit courses (≈ 30 teaching weeks)**. The compression is
2:1, so **contact time per topic halves**. I will not silently replace the official structure.

**RECOMMENDATION (D0, the main approval question):** the studio's 14 "studio weeks" each map onto
exactly **two** consecutive official weeks. Nothing is dropped, every official deliverable, exam and lab
keeps its official name and weight, and the studio can serve either mode:

- *Mode A, companion*: an instructor running the official 15 + 15 courses uses studio week *n* across official weeks 2n−1 and 2n.
- *Mode B, intensive*: a 14-week combined offering, which **needs academic approval** because it changes credit hours and assessment.

### 3a. Systems Thinking block

| Studio wk | Official S01 weeks | Topics | Official deliverables due | Assessment |
|---|---|---|---|---|
| ST-1 | 1, 2 | Foundations of systems thinking & tech literacy; systems, enterprises, stakeholders | Team formation; **Stakeholder Ecosystem Map**; initial AROU | Quizzes 1–2 |
| ST-2 | 3, 4 | Stakeholder & mission analysis; operational analysis, ConOps, capability analysis | **Needs & Capability Report; ConOps** | Quizzes 3–4 |
| ST-3 | 5, 6 | Requirements fundamentals; requirements quality & traceability | Requirements Draft → **Requirements Package** | Quizzes 5–6 |
| ST-4 | 7, 8 | Technology literacy & emerging tech; technology risk & uncertainty | **Technology Assessment; Technology Risk Assessment** | **Exam 1**; Quiz 7 |
| ST-5 | 9, 10 | Trade studies & decision making; architecture concepts | **Trade Study Report; Architecture Concept Description** | Quizzes 8–9 |
| ST-6 | 11, 12 | Information views & decision support; integration, interfaces, V&V | **Measures Framework, Information View, Interface Inventory, Verification Strategy** | Quizzes 10–11 |
| ST-7 | 13, 14 (+15) | Enterprise risk, security, resilience, roadmaps; documents to models (DE, MBSE, AI) | **Known Unknowns, Risk/Security/Resilience, Roadmap**; Draft & Final Package; Executive Presentation | Quiz 12, **Exam 2**, Peer evaluation |

### 3b. MBSE block

| Studio wk | Official S02 weeks / S04 labs | Topics | Official deliverables | Milestones |
|---|---|---|---|---|
| M-1 | 1–2 / Labs 1–2 | Package to model; repository, naming; SysML v2 + minimal KerML basics; context & stakeholder model | Repository & model structure; artifact mapping matrix; context + stakeholder packages | |
| M-2 | 3–4 / Labs 3–4 | Needs, capabilities, requirements; requirements architecture; AI quality check | Needs/Capability/Requirements v1 → Requirements Model v2; AI assessment | |
| M-3 | 5–6 / Labs 5–6 | Logical & physical architecture; alternatives | Logical & Physical Architecture packages | **SRR-style review (S02 W5)**; Exam 1 (proposed, D4) |
| M-4 | 7–8 / Labs 7–8 | Behaviour & operational scenarios; information, interfaces, AI | Behaviour, Scenario, Information & Interface packages | |
| M-5 | 9–10 / Labs 9–10 | Digital thread; verification & measures | Traceability package/matrix; Verification & Measures packages | **PDR-style review (S02 W10)** |
| M-6 | 11–12 / Labs 11–12 | Model-based trade studies; risk & AROU modelling | Trade study + recommendation; Risk/AROU package, impact chains | Exam 2 (proposed, D4) |
| M-7 | 13–14 (+15) / Labs 13–16 | Model query & impact analysis; evolution & autonomy; executive storytelling; final model | Impact report; Evolution/Autonomy; Executive Review Package; final model | **FDR-style final review**, Exam 3 (practical), Executive presentation, Peer evaluation |

### 3c. Learning gaps and risks created by compression (RECOMMENDATION-level analysis)

1. **Overloaded weeks.** ST-7 carries 3 deliverables, the final package, the presentation and an exam. M-7 carries 4 labs and 3 assessments. Mitigation: the studio stages work earlier (for example, the AROU register lives from ST-1) and M-7 is mostly integration.
2. **The SysML v2 language has no dedicated weeks** in S02: the syntax is learned "in passing" while modelling. The compressed form makes this worse. Mitigation: a short "language primer" track per M-week (parts, then requirements, then actions/states, then ports/flows, then verification/analysis, then views), sequenced against the labs.
3. **Exam 1 lands after only 3 studio weeks** of ST content in Mode B (it covers official weeks 1–7). Acceptable, since it maps 1:1, but students see half the practice time.
4. **Technology literacy / AI (S01 Obj. 4)** is the least source-supported area in the collection (no FAA/NASA/AI-literacy documents). Pending reader results.
5. **Peer review cycle** (S02: every major lab is peer-reviewed before submission) is hard to fit in a 2-labs-per-week cadence. Mitigation: peer review on milestone labs only in Mode B. **[DECISION D7]**

## 4. Proposed continuous Air Taxi case design (RECOMMENDATION)

- Enterprise: **AeroLink Urban Mobility** (name from S04; treated as fictional, with a disclaimer).
- One reference model with stable IDs (`STK-xxx`, `NEED-xxx`, `CAP-xxx`, `REQ-xxx`, `FN-xxx` logical, `PHY-xxx`, `SCN-xxx`, `IF-xxx`, `INFO-xxx`, `VER-xxx`, `MOE/MOP-xxx`, `AROU-A/R/O/U-xxx`), typed relationships (derives, refines, satisfies, allocates, verifies, mitigates, affects) and one JSON source of truth used by every studio tool.
- Seeded at or above S02 minimums: ≥ 20 stakeholders (S04 Lab 2A's 7 plus others), ≥ 10 capabilities, ≥ 30 requirements, ≥ 10 logical (S04 Lab 5's 6 plus others), ≥ 10 physical (Lab 6's 6 plus others), the 5 scenarios of Lab 7, ≥ 10 risks, ≥ 5 verification activities, ≥ 4 AI capabilities.
- The S04 trade question ("additional aircraft vs additional vertiports") and impact questions ("battery range decreases", "demand doubles", "regulations change") become the studio's trade simulator and impact-analysis exercises.
- Every numeric eVTOL parameter is tagged `assumption` with rationale until a cited source is supplied (C12).
- **Two layers of student work**: a reference model the instructor owns, and the student team's own model.

## 5. Week 1 prototype scope (after approval)

Studio week **ST-1** = official S01 weeks 1–2: systems thinking foundations, systems/enterprises/stakeholders,
Stakeholder Ecosystem Map (+ initial AROU). Interactive tools: **Stakeholder Mapper** (categories,
relationships, interests and influence) and an introductory **systems-thinking explorer** (boundary,
emergence, feedback loops on the Air Taxi example), with knowledge checks and an AI Usage Statement template.
App shell: dashboard, roadmap (all 14 studio weeks shown, only ST-1 active), the shared Air Taxi data store,
and a digital-thread explorer showing the stakeholder layer only.

## 6. Draft re-map of S03 CLO references to S01 Outcomes 1–5 (for D2)

| S03 CLO cited | Probable intent (from deliverable content) | S01 outcome |
|---|---|---|
| CLO 1, 3 (stakeholder map, ConOps) | systems thinking / stakeholders | O1, O2 |
| CLO 2, 3 (ConOps, requirements, verification) | needs → requirements | O2 |
| CLO 4 (tech assessment, trade study, measures) | alternatives & measures | O3 |
| CLO 5 (measures, architecture, information, interfaces, verification) | information & architecture | O4 (information), O2 (architecture) |
| CLO 6, 7 (AROU, risk, known unknowns, roadmap) | risk & evolution | O5 |
| CLO 8 (AI-generated insight, stakeholder map, requirements) | AI-assisted work | O4 |

This is an inference from content, not an official mapping.

## 7. Source support per studio week (summary; detail in `SOURCE_TRACEABILITY.md`)

| Studio wk | Source support | Weakest point |
|---|---|---|
| ST-1 | Strong (S11 Systems Thinking and Enterprise/SoS KAs; S13) | No stakeholder-mapping *method* in the collection |
| ST-2 | Strong (S11 Part 3c BMA/SND; S13 ConOps) | DoD capability vocabulary needs a civil rewrite |
| ST-3 | Strong but inconsistent quality lists (S12 p.144 vs S13 vs S11) | INCOSE GtWR absent |
| ST-4 | Adequate (S11 TRL table p.767; S12/S13 risk matrices) | Air-taxi technology facts absent (C12) |
| ST-5 | Strong method (S11 DAWG p.463–474), no worked numbers | — |
| ST-6 | Strong (S11 information, integration, V&V) | MOE/MOP verbal definitions only in S13 and S11 Glossary |
| ST-7 | Strong on resilience and security (S11 Part 6); DE thin and dated | SE sources describe MBSE in SysML v1 terms |
| M-1 … M-7 | Strong syntax coverage (S10 release 2026-08; S06 v2.1 Beta 2) | Beta status, and errors in printed examples (SOURCE_ANALYSIS §5) |

Additional decisions raised by the source audit: **D8** (embedded AI in the studio), **D9** (version control
for the project folder) and **D10** (app technology stack). See `OPEN_QUESTIONS.md`.
