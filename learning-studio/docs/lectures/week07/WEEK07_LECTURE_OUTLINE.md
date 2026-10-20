# Week 7 Lecture Outline: Final Presentation

**Status.** Draft outline for faculty review (COURSE_PRODUCTION_PLAN M2), written 2026-10-19. Nothing here is in the app source yet.
**Governing documents.** DECISION_LOG A19 and A20 (Week 7 is a review and presentation week); COURSE_SCHEDULE.md (Week 7 subject, exact: *Final Presentation*; output: the **Systems Thinking Engineering Package** (Weeks 1–6 integrated) and the Phase I presentation; rule 4: the Week 7 output is the source material for Phase II); the Week 1 template.
**Reuse.** The old checkpoints CP1 (Problem Definition & ConOps), CP2 (Requirements Baseline, with the SRR-style review in old Week 6, block `w6-srr`) and CP3 (Trade Study & Architecture Concept); old Week 7 worked example (d) (a recommendation with conditions, residual risk and what would change it); the course document's Deliverable 16 (final package and executive presentation).
**Light on theory by design.** Session 1 has a short integration lecture (39 min) and an in-class integration studio (30 min). Session 2 is the team presentations.
**Format.** Two sessions of 75 minutes, each 69 min of planned content plus a 6-min buffer.
- Session 1: 13 lecture slides and 3 studio slides, plus References and credits.
- Session 2: 4 framing slides plus the team presentations (no lecture slides beyond framing), plus References and credits.

## 0. Conventions used in this outline

- **Citations.** `R45 p.118` = verified register entry, PDF page. `P7-1 p.73` = a **proposed register addition** (§9), checked in `_source_cache` but not yet in `readings.py`. Week 6's proposal P6-1 (MITRE Technology Planning) is reused for one claim.
- **Course convention** marks content the collection does not supply (the package structure, the consistency checklist, presentation timing, the thread layers).
- **AeroLink is FICTIONAL**; values only from `src/model/reference/week02–08.ts`, `airtaxi.ts` and `aerolinkCase.ts`.
- **Slide faces** carry short citations and no internal identifiers (no rubric, decision-log, course-document or P-numbers, no objective IDs). Faculty notes ≤ 130 wpm.
- The course documents that define the final package (Deliverable 16 and the draft syllabus package list) are internal: their contents are paraphrased on slides as the course's requirements, never cited by document code.

## 1. Learning objectives (graduate level)

| ID | Objective | Bloom | Taught in |
|---|---|---|---|
| W7.1 | Integrate the Weeks 1–6 work into a consistent Systems Thinking Engineering Package, resolving or recording every inconsistency and trace gap | Create | S1.3–S1.8; studio S1.14 |
| W7.2 | Present and defend the team's decisions, with evidence, conditions and residual risk, to a mixed technical and non-technical audience | Evaluate | S1.12–S1.13; Session 2 |
| W7.3 | Review another team's package against stated criteria and write actionable findings | Evaluate | S1.9–S1.11; peer review |
| **W7.4 (new)** | Explain the purpose, preparation, entry and exit criteria of a technical review, and relate the Phase I review to the SRR and SFR | Understand / Analyze | S1.9–S1.11 |
| Graduate | Write a package-level trace audit with coverage metrics and a disposition for every gap | Evaluate | Graduate task (§6.3) |

## 2. Session 1: Integrating and reviewing the package (75 min)

### Section A: What the package is for (8 min)

#### S1.1 Week 7 at a glance (2 min)
- **Purpose.** Orient: no new method; integrate, review, present.
- **Content.** Session 1: how to integrate and check the package, how a technical review works, how to brief decision makers; then a studio. Session 2: presentations. The package is due before Session 1 (proposed: 48 h before, so peer reviewers can read it).
- **Figure.** The six-week band collapsing into one bound "package" icon, with an arrow to "Week 8: import into the model".
- **Sources.** Course schedule (course convention).

#### S1.2 One enterprise, one story, one source for Phase II (3 min)
- **Purpose.** Motivate consistency.
- **Content.** In Week 8 the package is imported into a SysML v2 model; every inconsistency in the documents becomes a modeling defect or a decision someone must make again. The package is the authoritative source of the team's enterprise data.
- **Figure.** Documents (Weeks 1–6) feeding a funnel into a model outline; a red "conflicting IDs" marker caught at the funnel.
- **Sources.** Course schedule, rule 4 (course convention).

#### S1.3 What the package contains (3 min)
- **Purpose.** Fix the structure.
- **Content.** Course requirement: updated versions of every Weeks 1–6 deliverable; an executive summary; the team's recommendations; lessons learned; an AI usage summary; and the presentation (15–20 min as the course document sets it; see §3 on timing). Suggested order: executive summary; enterprise and context; stakeholders and needs; ConOps and requirements; technology, risk and trade study; architecture and information view; components and interfaces; evolution roadmap; AROU register; trace tables; lessons learned; AI summary.
- **Figure.** A table of contents drawn as stacked tabs, each tab colored by its source week.
- **Sources.** Course convention (from the course's final-deliverable definition).

### Section B: Consistency and traceability across the package (17 min)

#### S1.4 Consistency: one ID, one meaning (3 min)
- **Purpose.** The first integration check.
- **Content.** Course checklist (course convention): every ID defined once and used with the same meaning everywhere; counts reconciled (for example the number of needs in the needs table, the trace table and the executive summary); every value (capacity, limits) identical across sections; names of external systems and of the organizations behind them kept distinct; every TBD tied to an unknown.
- **Figure.** Two excerpts of the same table from different sections with three mismatches circled.
- **Sources.** Course convention; R13 p.565 (TBX tracking).

#### S1.5 Bidirectional traceability: orphans and childless parents (4 min)
- **Purpose.** The second integration check, sourced.
- **Content.** DoD: bidirectional traceability is the key to managing requirements; it lets the engineer understand system-wide effects of change, ensures no "orphaned" lower-level requirements and no "childless parent" higher-level requirements (R45 p.118). The requirements traceability matrix records decomposition, allocation history and rationale (R45 p.119).
- **Applied to the package (course convention):** the thread layers STK → CON → NEED → CAP → REQ-STK → REQ-SYS → function → component → interface → information → verification method → measure → risk (after `THREAD_LAYERS` in `airtaxi.ts`). Count orphans and childless parents per layer.
- **Figure.** A layered trace ladder with one orphan (a requirement with no parent) and one childless need marked.
- **Sources.** R45 pp.118–119; course convention (layers).

#### S1.6 Have we built the right set? Requirement verification and validation (3 min)
- **Purpose.** Separate "well formed" from "right".
- **Content.** SEBoK: requirement verification asks whether requirements are well formed; requirement validation asks whether they are the right requirements, faithful to the needs and sources they came from (R13 p.566). In the package: re-read each need against its requirements; re-read each MGO against its measures.
- **Figure.** Two magnifying glasses: one over a requirement's wording ("well formed?"), one over the arrow from need to requirement ("right?").
- **Sources.** R13 p.566.

#### S1.7 Worked example: one AeroLink thread, end to end (4 min)
- **Purpose.** Model the walk students will do.
- **Content.** STK-010 electric utility → CON-011 peak grid load → NEED-010 charging load within the connection → CAP-010 charging power control → REQ-STK-010 → REQ-SYS-010 (charging system limits combined power to TBD-02 kW) → FN-007 control vertiport charging power → PHY-003 charging systems → IF-006 charger–grid → verification method "test" (the case itself is modeled in Week 12) → MOP-009 peak vertiport charging power → U-002 connection limit not agreed / R-005 → DEC-001 condition (fourth hub needs a confirmed connection) → Week 6 Increment 1 trigger.
- **Figure.** The thread drawn as a chain of 14 linked chips, colored by week.
- **Sources.** `aerolinkCase.ts`; `reference/week02–08.ts` (FICTIONAL). Course convention (thread).

#### S1.8 Worked example: AeroLink's open findings, dispositioned honestly (3 min)
- **Purpose.** Show that a good package records its gaps.
- **Content.**
  - NEED-011 has no requirement on purpose; it is the reference's audit case (record: "childless by decision").
  - NEED-012..017 were added in the Week 1 revision and have no capability or requirement yet (record: six childless needs; faculty decision pending).
  - NEED-003 now bounds noise exposure (loudness *and* number of evening and early-morning events), but REQ-STK-002, MGO-006 and CAP-007 cover only the per-event 65 dBA limit (record: missing requirement and objective for the event cap).
  - STK-011 has no need, with a recorded reason (the deliberate gap from Week 1).
- **Figure.** A findings table: finding, location (ID), disposition (fix / record / defer), owner.
- **Sources.** `aerolinkCase.ts` (DELIBERATE_GAP); `reference/week03–05.ts`; `docs/lectures/week01/AEROLINK_CASE_CHANGES.md` §5 (faculty-facing).

### Section C: The technical review (9 min)

#### S1.9 What a technical review is for (3 min)
- **Purpose.** Frame Session 2 as a review, not a show.
- **Content.** SEBoK: technical reviews and audits are a mechanism by which sufficiently independent and knowledgeable stakeholders analyze the current state of a system or work products using pre-established criteria, and the results support programmatic and technical decisions (R06c p.386). They support project assessment, configuration baselines and early validation through stakeholder involvement (R06c p.386).
- **Figure.** A gate between "Phase I package" and "Phase II model", with three checks above it: criteria, independent reviewers, decision.
- **Sources.** R06c p.386.

#### S1.10 Prepare, conduct, complete (3 min)
- **Purpose.** The procedure Session 2 follows.
- **Content.** Prepare: purpose, scope, entry and exit criteria defined beforehand, entry criteria confirmed before the review; the information items to be assessed made available to participants in advance (R06c p.387). Conduct: participants analyze from different perspectives; the best review team mixes people close to the project with people far enough removed to be independent (R06c p.388). Complete: once exit criteria are met, results are communicated and actions implemented (R06c p.388).
- **Course mapping (course convention):** entry criterion = package submitted 48 h before (proposed); reviewers = instructor plus one peer team; exit = findings recorded and dispositioned in Week 8.
- **Figure.** Three-stage flow with the course's entry and exit criteria under each stage.
- **Sources.** R06c pp.387–388; course convention.

#### S1.11 The closest professional analogies: SRR and SFR (3 min)
- **Purpose.** Calibrate expectations with real review criteria.
- **Content.** The SRR checks that requirements are consistent with the preferred solution and technology maturation, clearly stated, measurable and testable; the systems engineer ensures bidirectional traceability, verification methods for all requirements, analyzed risks with mitigation plans, and documented interfaces (R40 pp.69–70). The SFR evaluates whether the functional baseline satisfies end-user requirements and capability needs and whether it is achievable (P7-1 pp.73–74). **Course analogy (labeled):** the Phase I review borrows these questions; it does not establish a contractual baseline.
- **Figure.** Two columns (SRR questions, SFR questions) with ticks against the package sections that answer them.
- **Sources.** R40 pp.69–70; **P7-1 pp.73–74 (register addition needed).**

### Section D: Briefing decision makers (5 min)

#### S1.12 The executive message: recommendation, conditions, what would change it (3 min)
- **Purpose.** Communicate for decisions.
- **Content.** Present recommendations as a clear, actionable task list and keep a full report for traceability (R18 p.473); the decision maker owns the decision (R43 p.110). Communicate with stakeholders in their operational terms and non-technical language: users won't support what they can't understand and link to their mission (P6-1 p.531). AeroLink model: DEC-001 stated with its conditions (capital weight below 0.478, demand near 240 trips/day, connection confirmed), residual risks (R-001, R-005, R-002) and what would change it.
- **Figure.** A one-slide executive summary skeleton: recommendation / why / conditions / residual risk / decisions needed from you.
- **Sources.** R18 p.473; R43 p.110; P6-1 p.531 (Week 6 proposal). DEC-001 from `reference/week07.ts` (FICTIONAL).

#### S1.13 Presentation and Q&A rules (2 min)
- **Purpose.** Unambiguous logistics.
- **Content.** Course convention: time limit enforced; every member presents part and answers questions on the elements they own; claims cite package sections or IDs; one key decision shown with alternatives, criteria and sensitivity; one thread walked live from the package.
- **Figure.** A timing bar and an owner grid (member × section).
- **Sources.** Course convention.

### Section E: Integration studio (30 min)

#### S1.14 Studio: run the integration checklist on your own package (20 min)
- **Purpose.** Apply S1.4–S1.8 with the instructor in the room.
- **Content.** Teams run the consistency and trace checks, log findings with dispositions, and fix what can be fixed in the room. **In parallel**, the instructor holds a 4-min owner interview with each team (five teams = 20 min): each member answers one question on an element they own (individual Q&A, scored; §5.6).
- **Figure.** Timer; the checklist as a worksheet.
- **Sources.** Course convention.

#### S1.15 Dry run: timing and the one thread (8 min)
- **Purpose.** Rehearsal.
- **Content.** Each team times its opening and its live thread walk; the instructor circulates.
- **Figure.** Timer.
- **Sources.** Course convention.

#### S1.16 Close (2 min)
- **Purpose.** Hand-off.
- **Content.** Final package upload deadline (if fixes were made); presentation order for Session 2; peer-review pairings announced.
- **Figure.** Order and pairing table.
- **Sources.** Course convention.

#### S1.17 References and credits (0 min, generated)

**Session 1 running total**

| Section | Slides | Minutes | Cumulative |
|---|---|---|---|
| A Package purpose | S1.1–S1.3 | 8 | 8 |
| B Consistency and traceability | S1.4–S1.8 | 17 | 25 |
| C Technical review | S1.9–S1.11 | 9 | 34 |
| D Briefing decision makers | S1.12–S1.13 | 5 | 39 |
| E Studio | S1.14–S1.16 | 30 | **69** |
| Buffer | | 6 | **75** |

## 3. Session 2: Phase I presentations and review (75 min)

### Timing plan

- **Plan A (default, five teams):** S2.1 opening 2 min; five slots of 13 min each (10 min presentation, 3 min questions) = 65 min; S2.3 close 2 min. Total 69 min + 6 buffer. Individual Q&A is scored in the Session 1 owner interviews, so the 3-min question period can focus on the team's decision.
- **Scaling.** Six teams: 11-min slots (8 + 3). Seven or more teams, or the course document's 15–20 min presentation length: move part of the lecture to the Week 7 handout and run presentations across both sessions (Session 1 keeps S1.1–S1.3 and S1.12–S1.13, 13 min; about 115 min of presentation time = five 20-min slots or seven 15-min slots plus transitions). **Faculty decision.**

#### S2.1 Opening: the review's criteria and roles (2 min)
- **Content.** The criteria (what reviewers score), the time-keeper, the peer reviewers' role.
- **Sources.** R06c p.387.

#### S2.2 Team presentations (65 min; 5 × 13 min)
- **Content.** Per team: enterprise and problem; stakeholders and needs; the ConOps in one scenario; requirements highlights; the key decision (alternatives, criteria, sensitivity, recommendation with conditions); architecture and interfaces in one picture; roadmap; top risks and unknowns; one thread walked; questions.
- **Figure.** The team's own slides (template provided, course convention).

#### S2.3 Close: what happens next (2 min)
- **Content.** Peer findings due within 3 days (asynchronous); the owning team dispositions them in its Week 8 import; peer evaluation opens; Week 8 imports the package.

#### S2.4 References and credits (0 min, generated)

## 4. AeroLink worked example (summary)

- **Executive summary skeleton** (S1.12), filled for AeroLink: mission MGO-001; problem statement (proposed, from `aerolinkCase.ts`); recommendation DEC-001 with conditions and residual risk; roadmap Increments 1–3 (Week 6, proposed horizons); decisions needed from the board (approve the charger order after the TRL report; approve the connection study).
- **Thread walk** (S1.7) and **findings table** (S1.8). The findings are real gaps in the reference data, used as teaching material, not hidden.

## 5. Laboratory outline: the Systems Thinking Engineering Package and the Phase I review

### 5.1 Inputs
The team's Weeks 1–6 deliverables with all returned feedback; the integration checklist (S1.4–S1.8); the presentation template; the peer-review RID form.

### 5.2 Objectives
W7.1, W7.2, W7.3 applied to the team's own enterprise.

### 5.3 Method
1. Apply returned feedback to each earlier deliverable; record what changed.
2. Run the consistency checklist and the layered trace audit; disposition every finding (fix, record with reason, defer to Week 8).
3. Write the executive summary, recommendations and lessons learned.
4. Build the presentation around one decision and one thread.
5. Review the assigned peer package and write findings.

### 5.4 Procedure

| Step | When | Lead role | Output |
|---|---|---|---|
| 1 Apply Weeks 1–6 feedback | Week 6 days 1–4 (alongside Lab L6) | Each section owner | Updated sections, change log |
| 2 Consistency and trace audit | Before Session 1 | V&V lead | Findings table |
| 3 Executive summary, recommendations, lessons learned | Before Session 1 | Requirements & Compliance (summary); whole team (lessons) | Front matter |
| 4 Package assembled and submitted (48 h before Session 1, proposed) | Before Session 1 | V&V lead | `team-NN-st-package.md` / .pdf |
| 5 Studio fixes and owner interviews | Session 1 | Whole team | Revised findings table |
| 6 Presentation rehearsal | Between sessions | Architecture lead coordinates | Slide deck |
| 7 Presentation | Session 2 | All members | — |
| 8 Peer findings on the assigned package | Within 3 days of Session 2 | Each member writes ≥ 2 findings | `team-NN-rids-for-team-MM.md` |
| 9 Peer evaluation | Within 3 days | Each student | LMS form |

### 5.5 Outputs
`team-NN-st-package` (Markdown or PDF; suggested 25–40 pages excluding appendices), the slide deck, the findings table, the AI usage summary, the peer-review findings, and `team-NN-model-inputs.json` (all IDs, for the Week 8 import).

### 5.6 Rubric rows (from ASSESSMENT_RUBRICS.md)

| Row | Criterion | How it applies |
|---|---|---|
| RB-11.1 | Technical content and evidence | Claims backed by package analysis; assumptions explicit |
| RB-11.2 | Decision justification | The key decision with alternatives, criteria and sensitivity |
| RB-11.3 | Live model demonstration | **Adapted for Phase I:** the live walk of one thread through the package, answering a trace question (no model yet; faculty to confirm) |
| RB-11.4 | Audience adaptation | Executive summary and slides for a non-technical reviewer |
| RB-11.5 | Individual Q&A (per student) | Scored in the Session 1 owner interviews and in Session 2 questions |
| RB-11.6 | Review conduct | On time; findings recorded; peer findings dispositioned (in Week 8) |
| RB-17.1–17.3 | Peer findings | Correctness, significance, actionability of the findings each team writes |
| RB-13 | Peer evaluation | Phase I peer evaluation (counts once, as its own component) |
| RB-12.1–12.3 | AI usage summary | Package-level summary |
| RB-9.4 | Trace audit | Optional, for the findings table (coverage metrics with dispositions) |

### 5.7 Per-student workload (budget about 8 h)

| Activity | Hours | Basis |
|---|---|---|
| Class (2 × 75 min) | 2.5 | Timetable |
| Applying feedback and integration (student's share) | 2.0 | About 8 person-hours per team of 4 |
| Executive summary, recommendations, lessons learned (share) | 0.8 | |
| Presentation preparation and rehearsal | 1.2 | |
| Peer review (reading about 30 pp and writing findings) | 1.0 | |
| Peer evaluation and AI summary | 0.3 | |
| Readings (R06c pp.386–388; R40 pp.69–70; R45 p.118) | 0.3 | 6 pp |
| **Total** | **8.1** | Slightly over: faculty may drop the peer review to one finding per student (−0.4 h) or count Step 1 against Week 6 (where the roadmap lab already budgets 7.8 h) |

## 6. Assessment outline

### 6.1 Presentation and package
Scored with RB-11 (team criteria) and RB-11.5 (individual); the package itself is scored as the course's final engineering package (weight per the course's assessment table; faculty to confirm the rubric, since no RB row scores a whole package).

### 6.2 No readiness quiz (default)
No readiness quiz in Week 7 (schedule default, pending faculty decision). **Exam placement is an open faculty decision**; the old Exam 1 sat in Week 7, which is now a presentation week.

### 6.3 Graduate task (required notebook entry)
Package-level trace audit: coverage per thread layer (percentage of elements with a parent and with a child), every orphan and childless parent listed with a disposition, and one paragraph on which gap most threatens the Week 8 import.

## 7. Continuity to Phase II

- **Week 8 (Import Systems Thinking Artifacts / Stakeholders):** the package and its `model-inputs` file are imported; the earlier lab sequence's first lab maps package artifacts to model packages (an artifact-to-model mapping matrix). The findings marked "defer to Week 8" become the first modeling tasks.
- **Week 14 (Final Presentation; rule 6: Week 14 ↔ Weeks 6 and 7):** the Phase II review mirrors this one, with the model in place of the documents; RB-11.3 is then scored as a live model demonstration.
- Phase II readings named only: R77 pp.116–119; R78; R41 (PDR, for the Week 14 review analogy).

## 8. Source gaps

- No source in the collection covers executive presentation design or briefing technique beyond R18 p.473 and P6-1 p.531.
- No source defines a "Systems Thinking Engineering Package"; its structure comes from the course documents.
- IEEE 15288.2 (technical reviews on defense programs, cited by R40 p.70) and ISO/IEC/IEEE 24748-8 (cited by R06c p.386) are not held.
- No rubric row scores the integrated package as a whole.

## 9. Register additions needed

| Proposed ID | Source, PDF pages | Title | Used on slides | Verification note |
|---|---|---|---|---|
| P7-1 | DoD SE Guidebook pp.73–74 | 3.3 System Functional Review | S1.11 | Heading "3.3 System Functional Review" on p.73 (p.73 opens with the end of the SRR section); functional baseline and SFR purposes pp.73–74 |
| (reuse) P6-1 | MITRE SEG pp.528–531 | Technology Planning | S1.12 (p.531) | Proposed in Week 6 |

**Week 7 readings, proposed:** R06c pp.386–388; R40 pp.69–70; R45 pp.118–119. **Extension:** P7-1; R18 p.473.

## 10. Open items for faculty

1. Presentation timing (§3): Plan A (10 + 3 min, five teams) versus the course document's 15–20 min across both sessions.
2. Owner interviews in the Session 1 studio as the RB-11.5 evidence.
3. RB-11.3 adapted to a package thread walk in Phase I.
4. A rubric for the package as a whole.
5. Exam placement; no readiness quiz in Week 7.
6. Workload (§5.7) slightly above 8 h.
7. The AeroLink findings (S1.8): fix in the reference data before Week 8, or keep as teaching findings.
