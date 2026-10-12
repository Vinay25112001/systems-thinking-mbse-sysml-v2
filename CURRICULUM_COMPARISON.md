# Curriculum Comparison

**Status:** PROPOSAL, **revision 1**, 2026-10-09, after external review round 1. This document compares the Phase-0 proposal (now withdrawn), Pathway A and Pathway B.

## 1. The Phase-0 proposal is withdrawn

`CURRICULUM_RECONCILIATION.md` §3 proposed that each of 14 "studio weeks" carry two official weeks, keeping **every**
S01/S02 deliverable, exam and lab. On review it is not pedagogically acceptable.

| Quantity | S01 + S02 (official) | Phase-0 2:1 proposal | Problem |
|---|---|---|---|
| Student hours (at the federal credit-hour baseline) | ≈ 135 + 135 = **270 h** | ≈ 126–135 h | The same work in half the hours means ≈ **19 h/week**, more than double a 3-credit load |
| Graded team deliverables | 17 (S01) + 16 labs (S04) + 3 reviews/final (S02) | All of them in 14 weeks | About 2.4 team submissions per week, plus peer reviews |
| Exams | 2 + 3 | All 5 | One exam every 2.8 weeks, and Exam 1 after only 3 weeks of instruction |
| Model minimums | 20 STK, 30 REQ, 10 LOG, 10 PHY, 5 SCN … | Unchanged | No time to learn SysML before the modelling labs start |
| Learning sequence | 15 weeks of SE, then 15 weeks of modelling | 7 + 7 | Students would model artifacts they had no time to make well |

It also conflated *coverage* with *learning*. Mapping every official topic onto a week does not mean students can
reach proficiency in it. Phase-0 decision D0 is therefore **superseded** by FD-01 (`FACULTY_DECISION_REGISTER.md`).

## 2. Pathway A vs Pathway B at a glance

| Dimension | Pathway A (A1 → A2) | Pathway B (integrated) |
|---|---|---|
| Status | Elaborates two existing drafts; official content unchanged | New course; entirely a proposal |
| Credits / weeks | 3 + 3; 15 + 15 weeks | 3 (or 4, FD-02); 14 weeks |
| Student hours | ≈ 270 | ≈ 126–135 (estimated mean 9.6 h/week) |
| Outcomes | 5 + 5 official, plus measurable performance indicators | 6 new CLOs; S01 O4 and O5 only partly covered |
| Team artifacts | 17 documents + 16 labs + reviews | 5 checkpoints (CP1–CP5) |
| Individual assessment | A1: 40 % (quizzes, 2 exams) + peer 10 %; A2: 20 % exams + peer 10 % | 40 % (quizzes, 2 exams, notebook) + peer 10 % |
| Model scope | Official S02 minimums (phased in A2) | ≈ 40–67 % of S02 minimums, like for like (modelled behaviour 20 %; lab plan C.5); thin-thread rule (3 full threads) |
| SysML exposure | 15 weeks, with a primer strand in Weeks 1–8 [REC] | Read-only micro-labs in Weeks 5, 6 and 8; tool-based modelling in Weeks 9–14 |
| Reviews | A1 executive review; A2 SRR, PDR and "FDR" style | SRR-style (Week 6, live); PDR-style (Weeks 11–12, asynchronous written RIDs); final review (Week 14, live) |
| Best fit | Degree sequence (Integration major) | Elective / graduate / professional cohort; programmes without room for two courses |
| Main risk | No language instruction in official A2 (fixed by FD-15); 17 small deliverables (FD-14) | Breadth vs depth; tool learning compressed into 6 weeks |

## 3. Topic depth by pathway

Depth levels:
- **Aw**areness: recognises and explains.
- **Wk** (working): applies on the case with guidance.
- **Pr**oficient: applies independently and judges quality.

**E** = essential for an undergraduate/introductory course. **X** = graduate or optional extension.

| # | Competence (requested in the review brief) | A1 | A2 | B | Essential content (E) | Graduate extension (X) |
|---|---|---|---|---|---|---|
| 1 | Systems thinking and life-cycle reasoning | **Pr** | Wk | Wk | Boundary, SoI, emergence, feedback; life-cycle stages and gates; the Vee as a relationship view | Systems archetypes (S11 p.280–287); life-cycle model selection (S11 p.419–425) |
| 2 | Stakeholder identification and needs analysis | **Pr** | Wk | **Pr** | Stakeholder classes, concerns, influence; mission/goals/objectives; solution-free needs | Capability-gap analysis over time horizons (S11 p.860–863) |
| 3 | ConOps and operational scenarios | **Pr** | **Pr** (as behaviour) | Wk | ConOps content; nominal and off-nominal scenarios; use cases and mission threads | Resilience scenarios (S11 p.1209–1210) |
| 4 | Requirements engineering | **Pr** | **Pr** (in model) | **Pr** | Well-formed, verifiable requirements; rationale; types; trace; quality audit | Requirement attributes for change management; formal assume/require semantics (S06 §7.21) |
| 5 | Technology readiness and uncertainty | **Pr** | Aw | Wk | TRL with evidence; maturity risk; uncertainty types | Technology planning by back-casting (S13 p.528–531) |
| 6 | Trade-study methodology | **Pr** | **Pr** (model-based) | **Pr** (spreadsheet) | Alternatives, criteria traced to MOEs, swing weights, additive value, sensitivity | Value-function elicitation, Monte Carlo, set-based design (S11 p.463–474, 1396–1399) |
| 7 | Risk, assumptions, opportunities, unknowns | **Pr** | **Pr** (linked in model) | Wk | Condition–if–then; 5×5; handling; AROU distinctions | Quantitative risk aggregation; risk metadata semantics (S06 p.558–560) |
| 8 | Architecture viewpoints and decomposition | Wk (concept only [S03 D8 note]) | **Pr** | Wk | Viewpoints/views; functional, logical and physical decomposition | Architecture frameworks (DoDAF/TOGAF, S13 p.341–347) |
| 9 | Components, interfaces, allocations | Wk | **Pr** | Wk | N² matrix; interface types; allocation matrix | Interface semantics (conjugated ports, flows) |
| 10 | Enterprise evolution | Wk | Wk | Aw | Near/mid/long-term states; technology insertion; impact of an evolution increment | Variability modelling (S10 sl.102–104) |
| 11 | MBSE fundamentals | Aw | **Pr** | Wk | Model vs view; digital thread; why model | MBSE adoption evidence (S11 p.1386–1394) |
| 12 | SysML v2 notation and semantics | — | **Pr** (course subset) | Wk (course subset) | See §4 | KerML type/feature semantics (S05 §7.3) |
| 13 | Logical, physical and behavioural modelling | — | **Pr** | Wk | Parts, ports, interfaces; actions; states | Interactions/messages; individuals and snapshots |
| 14 | Digital thread and traceability | Wk (document-based ID register) | **Pr** | Wk–Pr (3 threads) | Upward/downward trace; coverage audit; 11-link chain | Repository versioning and queries (S08 PDF 31–36) |
| 15 | Verification and validation | Wk | **Pr** | Wk | V vs V; methods; verification cases and verdicts | V&V of simulation models and AI (S13 p.475–483; S11 p.1374–1378) |
| 16 | MOEs and MOPs | Wk–Pr | **Pr** | Wk | MOE → MOP → TPM; thresholds and margins | Leading indicators (S11 p.532) |
| 17 | Model consistency and change impact | — | **Pr** | Wk | Impact by traversal; consistency checks; "parses ≠ correct" | Automated queries via the API |
| 18 | Engineering communication and review practice | **Pr** (executive) | **Pr** | Wk | Review entry/exit; evidence-based presentation; individual Q&A | Running a review board |

## 4. SysML v2 course subset (applies to A2 and B)

| Tier | Constructs | Where taught |
|---|---|---|
| **Essential** (assessed) | Packages, visibility, imports; `part def` / `part`; attributes with quantities/units; specialization, subsetting, redefinition (conceptual); `port def`, `interface def`, connections, flows; `requirement def` / requirement with subject and short-name ID; `satisfy`; `allocate`; `action def`, successions, decisions; `state def`, transitions; `use case`; `verification def` with method and verdict; `dependency`; metadata (Risk, MOE/MOP) | B Weeks 9–13; A2 primer P1–P8 and Labs 1–12 |
| **Extension** | `analysis def` and the TradeStudy library; calculations and constraint expressions; `variation` / `variant`; individuals, snapshots, time slices; interactions and messages; `view def` / `viewpoint def` and rendering; user-defined keywords; KerML foundations; the Systems Modeling API | B graduate extensions; A2 Labs 11, 13, 14 (selected) |
| **Excluded** | Abstract syntax, formal semantics, model interchange, v1→v2 transformation rules (instructor reference only) | — |

## 5. What Pathway B omits or reduces, compared with S01 + S02

1. The full Business/Engineering Enterprise Package (17 documents) is reduced to three document checkpoints (CP1–CP3).
2. The separate Technology Assessment, Technology Risk, Known Unknowns, Information View, Interface Inventory and Verification Strategy documents are folded into checkpoints or the model.
3. Enterprise information management, security, resilience and technology roadmapping drop to awareness depth.
4. The five-scenario behaviour package becomes one modelled scenario.
5. The model-based trade study (S04 Lab 11) is replaced by a spreadsheet trade study in Week 7. It is *not* modelled in SysML.
6. Executive views for five audiences (S04 Lab 15) become one non-technical slide in the final review.
7. Weekly peer review of every lab is reduced to one cross-team model review (Week 11).
8. Model minimums are about 40–67 % of S02's. The exception is modelled behaviour: 1 scenario against S02's 5, i.e. 20 %.

## 6. Technical baseline and content classification (both pathways)

| Item | Baseline |
|---|---|
| SysML version taught | **The course teaches the grammar accepted by the course-designated checker (FD-08).** The collection contains only the **OMG SysML v2.1 Beta 2** text (Release 2026-07; S06; "OMG Document Number: None") and the **Pilot Implementation Release 2026-08** tutorial (S10). The external reviewer reports that OMG formally adopted SysML v2.0 in 2025. This **cannot be verified from the collection**. The formal 2.0 specification should be obtained, if approved (FD-27), and used as the citable baseline, with 2.1 Beta 2 as a forward-looking reference. S06 is **not** described to students as the normative standard (review M8). |
| KerML / API | KerML 1.1 Beta 2 (S05); Systems Modeling API and Services 1.1 Beta 2 (S08), as instructor references and graduate extensions |
| Modelling tool | **Not decided** (FD-08). **Requirement:** it must parse the 2026-07/08 grammar, run on lab machines, be accessible (or have an accessible textual route), and be free or university-licensed. Candidates to evaluate include the OMG SMC Pilot Implementation (Jupyter/Eclipse) and other SysML v2 tools; their current versions were **not checked** (no internet research was approved) |
| Syntax validation policy | **No SysML text is presented to students as correct until the course-designated checker accepts it (FD-08).** Until then the interim fallback applies: instructor review against the S06 grammar and the errata sheet, labelled "instructor-checked, not yet parser-validated". Examples from S06/S09/S10 are adapted, not copied, and are checked against the errata in `SOURCE_ANALYSIS.md` §5 |

**Content classification used in all course materials**

| Label | Meaning | Example |
|---|---|---|
| `REFERENCE` | Normative or authoritative statement from a cited source | TRL definitions (S11 p.767); `VerificationMethodKind` (S06 p.540) |
| `ILLUSTRATIVE` | Adapted example from a source, re-validated | Requirement and satisfy pattern adapted from S10 sl.86–91 |
| `FICTIONAL` | AeroLink parameter set by the instructor; no real-world claim | Charge time to dispatch threshold |
| `ASSUMPTION` | Team-stated assumption in the AROU register | "Assume pad turnaround ≤ X min" |
| `INSTRUCTOR-AUTHORED` | Activity, exercise or rubric written for the course | All labs, rubrics and checkpoints |

## 7. Recommendation

**Recommended: Pathway A as the degree pathway, with the [REC] improvements below. Pathway B as an optional separate course only.**

Rationale:
1. **Pathway A matches the official design and has the hours the outcomes need.** It meets S02's model minimums, and it gives students time to produce a good A1 baseline before they model it.
2. **Pathway A's main weakness is easily fixed.** A2 schedules no SysML language instruction; a primer strand fixes this without changing any official weight (FD-15).
3. **Pathway B is coherent, but it is a different, smaller course.** It suits audiences who cannot take two courses (e.g. graduate students from other programmes, or professional cohorts). It must not be presented as equivalent to S01 + S02 (§5).
4. **Risks are lower in A.** Tool learning is spread over 15 weeks rather than 6, and there is a recovery path: the instructor reference package for students without a usable A1 baseline.

**Pathway A improvements, in priority order (all FDs):**
0. Designate and evaluate the SysML checker/tool before any SysML-graded instrument is used (FD-08, review C1).
1. Language primer in A2 Weeks 1–8 (FD-15).
2. Stable-ID discipline and ID register in A1 (FD-14 / lab plan §C).
3. Tool decision with accessibility evaluation (FD-08, FD-20).
4. The **required** individual AI-critique part of A2 Exam 2 and per-student review Q&A, with conjunctive attainment (FD-17; review C3).
5. Optional packaging of A1's 17 deliverables into 5 milestones (FD-14).
6. Exam weeks and Exam 1 retitle (FD-07).
7. Merge Labs 13 + 14 (FD-06).
8. Thread-completeness definition (FD-13).

## Source traceability
Official structures: S01–S04. Hours basis: 34 CFR 600.2 (external). Topic depth judgements: author, using `SOURCE_TRACEABILITY.md` and the reader notes. SysML version facts: S06 p.1, S10 sl.1–2, S05 p.1, S08 p.1 (verified, `SOURCE_ANALYSIS.md` §6).

## Assumptions
The faculty goal is graduates who can do this work, not exposure to it. Both pathways run at about 30 students.

## Decisions requiring approval
FD-01, FD-02, FD-08, FD-13, FD-14, FD-15, FD-17, FD-19, FD-27.

## Known limitations
The depth ratings are expert judgement and have not been validated against student performance. Tool candidates were not evaluated.
