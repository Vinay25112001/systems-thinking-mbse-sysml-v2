# Course Learning Outcome Assessment Matrix

**Status:** PROPOSAL, **revision 1** (2026-10-09), after external review round 1. Not approved.
Attainment targets are recommendations (FD-22). No university assessment policy is assumed or claimed.

> **Revision note (review findings C2, C3, M7).** Draft 1 kept four hand-made maps that contradicted each other, and it counted
> "reinforced" cells as evidence. In this revision **one machine-checked source** decides what counts as attainment evidence:
> `_source_cache/verification/clo_evidence.py`, whose output appears verbatim in §4. The syllabus evidence columns,
> lab plan B.5 and the rubric CLO tags are all derived from it. Every component weight and part share is checked to sum
> correctly; the script stops with an error if it does not.

## 0. Method

**Attainment evidence**
- **Only the rubric parts listed in §4 are attainment evidence.**
- Readiness quizzes are graded but formative. Peer evaluation measures professional conduct. Neither certifies a CLO.
- Criteria graded elsewhere but not listed in §4 are *reinforcement*. They give feedback, but they are not outcome evidence.

**Validity rules**
- **V1:** every CLO is evidenced by at least two graded components.
- **V2:** every CLO has at least one **individual** measure.
- **V3:** every graded component is either decomposed into evidence parts or declared formative/conduct.

**Attainment rule (conjunctive; replaces the draft-1 pooled mean, review C3).** A student attains a CLO when **both** of these hold:
- **(a) Individual measures:** the weighted mean level on that CLO's individual parts is **≥ 3**.
- **(b) Team measures:** the weighted mean level on that CLO's team parts is **≥ 3**.

Team work therefore cannot certify an individual outcome, and an individual cannot attain a CLO that their team's artifact did not demonstrate.

**This is a deliberate programme-assessment choice (review N10a).** The rule reports whether the *course* produced the outcome in both individual and team practice. It does **not** decide grades, which follow the component weights. For transparency, the attainment report gives **individual-only and team-only rates separately** alongside the conjunctive rate. Faculty may instead adopt individual-only attainment (FD-17).

**Short decisive items (review N10b).** For some CLOs the individual measure is small. To make those items reliable:
- **A2-CLO4** (≈ 1 % of the grade): the Exam 2 AI-critique part must contain **two independent items** on different fragments.
- **A2-CLO5** (≈ 2.2 %): the per-student portion is scored in **each** of the SRR review, the PDR review and the presentation, and attainment uses the mean of the three.
- **B-CLO6:** the live Q&A (RB-11.5, ≈ 90 s per student) is combined with the notebook's ownership evidence (RB-16.2). Neither alone decides attainment.

These are recommendations within FD-17.

**Level conversion for percentage-scored items** (exams, practical):

| Score | Level |
|---|---|
| ≥ 85 % | 4 |
| 70–84 % | 3 |
| 55–69 % | 2 |
| < 55 % | 1 |

**Course-level target (proposal, FD-22):** ≥ 70 % of students attain each CLO.

**Closing the loop:** after each offering, record per CLO the attainment rate, the weakest part and one change for the next offering.

## 1. Pathway B: component × CLO (derived from §4)

**Key**
- **A-i** = individual attainment evidence
- **A-t** = team attainment evidence
- **F** = formative
- **C** = conduct
- blank = not evidence

| CLO | Quiz 10 | Exam 1 12 | Exam 2 13 | Notebook 5 | CP1 7 | CP2 10 | CP3 9 | CP4 10 | CP5 14 | Peer 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| B-CLO1 Systems-thinking analysis | F | A-i (Part A) | | | A-t (RB-1) | | | | | C |
| B-CLO2 Needs, scenarios, requirements, measures | F | A-i (Part B) | | | A-t (RB-2) | A-t (RB-3.1–3.5, RB-4) | | | | C |
| B-CLO3 Alternatives under uncertainty | F | A-i (Part C) | | | | A-t (RB-5) | A-t (RB-6.1–6.5) | | | C |
| B-CLO4 Architecture and SysML v2 model | F | | A-i (T1, T2, T5, T6) | | | | A-t (RB-7 excl. 7.4) | A-t (RB-8) | A-t (RB-8) | C |
| B-CLO5 Traceability, coverage, impact | F | | A-i (T3, T4) | | | | | | A-t (RB-9, RB-10, RB-11.3) | C |
| B-CLO6 Justify decisions; responsible AI | | | | A-i (RB-16, RB-12) | A-t (RB-12) | A-t (RB-3.6, RB-12) | A-t (RB-6.6, RB-7.4, RB-12) | A-t (RB-17, RB-12) | A-t (RB-11 team) + **A-i (RB-11.5)** | C |

B-CLO4 now explicitly covers the **architecture** (CP3) as well as its SysML representation, so the CP3 architecture rubric counts as evidence for it. This is reflected in the revised CLO wording in the syllabus.

## 2. Pathway A1: component × CLO

The official components and weights are from S01. The exam split assumes **equal weight per topic in S01's coverage list**:
- Exam 1 has 7 topics: systems thinking, stakeholders, needs, capability, ConOps, requirements, technology assessment.
- Exam 2 has 10 topics: trade studies, architecture, information perspectives, integration, V&V, risk, security & resilience, technology roadmaps, digital engineering, MBSE foundations.

The real split depends on the papers set.
- **A1-all** = the Final Package and Executive Presentation, which evidences all five outcomes jointly.
- **Unflagged official gap (review m16):** S01 weights the AROU Register at 2 % but gives it no due week (FD-26).

## 3. Pathway A2: component × CLO

The official components and weights are from S02.
- **Labs:** 14 graded submissions with Labs 13 and 14 merged (FD-06), equal weight assumed.
- **Required addition [REC], review C3:** 20 % of Exam 2 is an individual critique of an AI-generated model fragment. Without it, A2-CLO4 has **no** individual evidence.
- **Per-student RB-11.5 shares** inside the SRR and PDR reviews and the presentation make A2-CLO5 individually evidenced. S02 requires each student to present a portion of the model.

**Findings for faculty**
- A2-CLO1 (model construction) carries ≈ 42 % of the grade.
- Traceability and analysis (A2-CLO2 + A2-CLO3) carry ≈ 29 %, although "connect, trace, analyse" is the course's stated purpose [S02]. This follows from the official weights; faculty may rebalance lab weights (FD-17).
- A2-CLO4's individual evidence is only ≈ 1 %. It satisfies V2, but it is thin.

## 4. Generated evidence tables (verbatim output of `clo_evidence.py`)

### Pathway B: attainment evidence by CLO (% of final grade)

| CLO | Individual | Team | Total | Measures (V1) | V2 individual? |
|---|---|---|---|---|---|
| B-CLO1 | 3.0 | 3.1 | 6.2 | 2 components | yes |
| B-CLO2 | 4.8 | 8.8 | 13.6 | 3 components | yes |
| B-CLO3 | 4.2 | 6.4 | 10.6 | 3 components | yes |
| B-CLO4 | 7.8 | 14.6 | 22.4 | 4 components | yes |
| B-CLO5 | 5.2 | 6.9 | 12.1 | 2 components | yes |
| B-CLO6 | 5.8 | 9.2 | 15.1 | 6 components | yes |
| formative / conduct | | | 20.0 | | |
| **Total** | | | **100.0** | | |

**Components and parts (Pathway B)**

| Component | Weight | Part | Share | CLO | I/T |
|---|---|---|---|---|---|
| Readiness quizzes | 10 | formative | 1.000 | — | I |
| Exam 1 | 12 | Part A | 0.250 | B-CLO1 | I |
| Exam 1 | 12 | Part B | 0.400 | B-CLO2 | I |
| Exam 1 | 12 | Part C | 0.350 | B-CLO3 | I |
| Exam 2 practical (RB-14) | 13 | T1,T2,T5,T6 | 0.600 | B-CLO4 | I |
| Exam 2 practical (RB-14) | 13 | T3,T4 | 0.400 | B-CLO5 | I |
| Review notebook (RB-16) + AI statements (RB-12) | 5 | RB-16/RB-12 | 1.000 | B-CLO6 | I |
| CP1 | 7 | RB-1 | 0.450 | B-CLO1 | T |
| CP1 | 7 | RB-2 | 0.450 | B-CLO2 | T |
| CP1 | 7 | RB-12 | 0.100 | B-CLO6 | T |
| CP2 | 10 | RB-3.1-3.5 | 0.360 | B-CLO2 | T |
| CP2 | 10 | RB-3.6 | 0.040 | B-CLO6 | T |
| CP2 | 10 | RB-4 | 0.200 | B-CLO2 | T |
| CP2 | 10 | RB-5 | 0.300 | B-CLO3 | T |
| CP2 | 10 | RB-12 | 0.100 | B-CLO6 | T |
| CP3 | 9 | RB-6.1-6.5 | 0.383 | B-CLO3 | T |
| CP3 | 9 | RB-6.6 | 0.068 | B-CLO6 | T |
| CP3 | 9 | RB-7 excl. 7.4 | 0.405 | B-CLO4 | T |
| CP3 | 9 | RB-7.4 | 0.045 | B-CLO6 | T |
| CP3 | 9 | RB-12 | 0.100 | B-CLO6 | T |
| CP4 | 10 | RB-8 | 0.750 | B-CLO4 | T |
| CP4 | 10 | RB-17 review RIDs given | 0.150 | B-CLO6 | T |
| CP4 | 10 | RB-12 | 0.100 | B-CLO6 | T |
| CP5 | 14 | RB-8 | 0.250 | B-CLO4 | T |
| CP5 | 14 | RB-9 | 0.300 | B-CLO5 | T |
| CP5 | 14 | RB-10 | 0.150 | B-CLO5 | T |
| CP5 | 14 | RB-11.3 live thread | 0.045 | B-CLO5 | T |
| CP5 | 14 | RB-11.1,.2,.4,.6 | 0.195 | B-CLO6 | T |
| CP5 | 14 | RB-11.5 individual Q&A | 0.060 | B-CLO6 | I |
| Peer evaluation (RB-13) | 10 | conduct | 1.000 | — | I |

### Pathway A1: attainment evidence by CLO (% of final grade)

| CLO | Individual | Team | Total | Measures (V1) | V2 individual? |
|---|---|---|---|---|---|
| A1-1 | 4.3 | 2.0 | 6.3 | 2 components | yes |
| A1-2 | 13.1 | 18.0 | 31.1 | 7 components | yes |
| A1-3 | 3.6 | 9.0 | 12.6 | 5 components | yes |
| A1-4 | 4.5 | 3.0 | 7.5 | 3 components | yes |
| A1-5 | 4.5 | 8.0 | 12.5 | 6 components | yes |
| A1-all | 2.0 | 8.0 | 10.0 | 1 components | yes |
| formative / conduct | | | 20.0 | | |
| **Total** | | | **100.0** | | |

**Components and parts (Pathway A1)**

| Component | Weight | Part | Share | CLO | I/T |
|---|---|---|---|---|---|
| Quizzes | 10 | formative | 1.000 | — | I |
| Exam 1 (7 topics) | 15 | ST, stakeholders | 0.286 | A1-1 | I |
| Exam 1 (7 topics) | 15 | needs, capability, ConOps, requirements | 0.571 | A1-2 | I |
| Exam 1 (7 topics) | 15 | technology assessment | 0.143 | A1-3 | I |
| Exam 2 (10 topics) | 15 | architecture, integration, V&V | 0.300 | A1-2 | I |
| Exam 2 (10 topics) | 15 | trade studies | 0.100 | A1-3 | I |
| Exam 2 (10 topics) | 15 | information, DE, MBSE | 0.300 | A1-4 | I |
| Exam 2 (10 topics) | 15 | risk, security & resilience, roadmaps | 0.300 | A1-5 | I |
| Stakeholder Ecosystem Map | 2 | RB-1 | 1.000 | A1-1 | T |
| Needs & Capability Report | 3 | RB-2 | 1.000 | A1-2 | T |
| ConOps | 4 | RB-2 | 1.000 | A1-2 | T |
| Requirements Package | 7 | RB-3 | 1.000 | A1-2 | T |
| Technology Assessment | 3 | RB-5.1-5.2 | 1.000 | A1-3 | T |
| Technology Risk Assessment | 2 | RB-5.3-5.5 | 1.000 | A1-5 | T |
| AROU Register | 2 | RB-5.4-5.5 | 1.000 | A1-5 | T |
| Trade Study Report | 5 | RB-6 | 1.000 | A1-3 | T |
| Architecture Concept Description | 3 | RB-7.1-7.4 | 1.000 | A1-2 | T |
| Measures Framework | 1 | RB-4 | 1.000 | A1-3 | T |
| Information View | 2 | RB-7.5-7.6 | 1.000 | A1-4 | T |
| Interface Inventory | 1 | RB-7.3 | 1.000 | A1-4 | T |
| Verification Strategy | 1 | RB-10 | 1.000 | A1-2 | T |
| Known Unknowns Analysis | 1 | RB-15.3 | 1.000 | A1-5 | T |
| Risk, Security & Resilience | 2 | RB-15.1-15.2 | 1.000 | A1-5 | T |
| Enterprise Evolution Roadmap | 1 | RB-15.4 | 1.000 | A1-5 | T |
| Final Package & Executive Presentation | 10 | RB-11 team criteria (all CLOs) | 0.800 | A1-all | T |
| Final Package & Executive Presentation | 10 | RB-11.5 individual Q&A | 0.200 | A1-all | I |
| Peer evaluation | 10 | conduct | 1.000 | — | I |

### Pathway A2: attainment evidence by CLO (% of final grade)

| CLO | Individual | Team | Total | Measures (V1) | V2 individual? |
|---|---|---|---|---|---|
| A2-1 | 12.5 | 29.9 | 42.4 | 7 components | yes |
| A2-2 | 3.5 | 12.8 | 16.3 | 5 components | yes |
| A2-3 | 3.0 | 9.7 | 12.7 | 4 components | yes |
| A2-4 | 1.0 | 5.2 | 6.2 | 3 components | yes |
| A2-5 | 2.2 | 10.1 | 12.3 | 4 components | yes |
| formative / conduct | | | 10.0 | | |
| **Total** | | | **100.0** | | |

**Components and parts (Pathway A2)**

| Component | Weight | Part | Share | CLO | I/T |
|---|---|---|---|---|---|
| Weekly team labs | 25 | Labs 1,2,3,5,7,8 (RB-8) | 0.429 | A2-1 | T |
| Weekly team labs | 25 | Lab 4A (RB-3) | 0.036 | A2-1 | T |
| Weekly team labs | 25 | Lab 4B AI assessment (RB-12, RB-3.6) | 0.036 | A2-4 | T |
| Weekly team labs | 25 | Lab 6 (RB-8) | 0.054 | A2-1 | T |
| Weekly team labs | 25 | Lab 6 AI alternatives (RB-12) | 0.018 | A2-4 | T |
| Weekly team labs | 25 | Labs 9,10 (RB-9, RB-10) | 0.143 | A2-2 | T |
| Weekly team labs | 25 | Lab 11 (RB-6) | 0.054 | A2-3 | T |
| Weekly team labs | 25 | Lab 11 AI alternatives (RB-12) | 0.018 | A2-4 | T |
| Weekly team labs | 25 | Labs 12, 13+14 (RB-5.5, RB-9.5) | 0.143 | A2-3 | T |
| Weekly team labs | 25 | Lab 15 views (RB-11.4) | 0.054 | A2-5 | T |
| Weekly team labs | 25 | Lab 15 AI narratives (RB-12) | 0.018 | A2-4 | T |
| Exam 1 | 5 | model foundations, architecture | 1.000 | A2-1 | I |
| Exam 2 | 5 | behaviour, interfaces | 0.300 | A2-1 | I |
| Exam 2 | 5 | digital thread, traceability, verification | 0.300 | A2-2 | I |
| Exam 2 | 5 | trade studies, risk | 0.200 | A2-3 | I |
| Exam 2 | 5 | critique of AI-generated model fragment [REC, required] | 0.200 | A2-4 | I |
| Exam 3 practical (RB-14) | 10 | T1,T2,T5,T6 | 0.600 | A2-1 | I |
| Exam 3 practical (RB-14) | 10 | T3 | 0.200 | A2-2 | I |
| Exam 3 practical (RB-14) | 10 | T4 | 0.200 | A2-3 | I |
| Requirements & Capability Review (SRR) | 10 | RB-8 | 0.700 | A2-1 | T |
| Requirements & Capability Review (SRR) | 10 | RB-11 team criteria | 0.240 | A2-5 | T |
| Requirements & Capability Review (SRR) | 10 | RB-11.5 individual | 0.060 | A2-5 | I |
| Architecture & Traceability Review (PDR) | 10 | RB-8 | 0.300 | A2-1 | T |
| Architecture & Traceability Review (PDR) | 10 | RB-9 | 0.400 | A2-2 | T |
| Architecture & Traceability Review (PDR) | 10 | RB-11 team criteria | 0.240 | A2-5 | T |
| Architecture & Traceability Review (PDR) | 10 | RB-11.5 individual | 0.060 | A2-5 | I |
| Final enterprise team model | 20 | RB-8 | 0.350 | A2-1 | T |
| Final enterprise team model | 20 | RB-9.1-9.4 | 0.263 | A2-2 | T |
| Final enterprise team model | 20 | RB-9.5 | 0.087 | A2-3 | T |
| Final enterprise team model | 20 | RB-6/RB-5.5 | 0.150 | A2-3 | T |
| Final enterprise team model | 20 | RB-12 | 0.150 | A2-4 | T |
| Executive presentation | 5 | RB-11 team criteria | 0.800 | A2-5 | T |
| Executive presentation | 5 | RB-11.5 + own portion, per student | 0.200 | A2-5 | I |
| Peer evaluation | 10 | conduct | 1.000 | — | I |

## 5. Mapping between pathways and official outcomes

| Official outcome | Pathway B CLO | Coverage in B |
|---|---|---|
| S01 O1 | B-CLO1 | Full |
| S01 O2 | B-CLO2 | Full (reduced scope) |
| S01 O3 | B-CLO3 | Full (one trade study, three technologies) |
| S01 O4 | B-CLO4 (information flows, AI capabilities in CP3), B-CLO6 | **Partial**: enterprise information management at awareness depth |
| S01 O5 | B-CLO3 | **Partial**: resilience and long-term evolution at awareness depth |
| S02 O1 | B-CLO4 | Full (reduced scope) |
| S02 O2 | B-CLO5 | Full (3 complete threads) |
| S02 O3 | B-CLO5, B-CLO3 | Impact analysis full. The trade study is in a spreadsheet, not modelled in SysML |
| S02 O4 | B-CLO6 | Full |
| S02 O5 | B-CLO6 | Partial (one review; no five-audience portfolio) |

## Source traceability
- Official components and weights: S01 and S02 assessment tables. Exam coverage: S01/S02 "Examinations".
- Rubric parts: `ASSESSMENT_RUBRICS.md` (revision 1).
- Computation: `_source_cache/verification/clo_evidence.py`.

## Assumptions
- Within an exam, the part shares follow the blueprint (B) or equal topic weighting (A).
- A2 labs are equally weighted.

## Decisions requiring approval
FD-17, FD-22, FD-04, FD-26.

## Known limitations
- The evidence shares are planning values. Real exam papers set the actual split.
- The 70 % / level-3 target is a proposal, not a Wright State standard.
