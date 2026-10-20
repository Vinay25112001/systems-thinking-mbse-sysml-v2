# Week 14 Lecture Outline: Final Presentation

**Status.** Draft for faculty approval (COURSE_PRODUCTION_PLAN M2, outlines for Weeks 2–14). Written 2026-10-19. Nothing here is committed; no `.sysml` file has been created or run for this outline.
**Governing documents.** DECISION_LOG A19 and A20 (Week 14 is a review and presentation week; Week 14 output = coherent SysML v2 enterprise model built from the team's own Systems Thinking package); COURSE_SCHEDULE.md (subject, exact; rules 4–6: Week 14 ↔ Week 6 and Week 7; open decisions on exams and presentation-week quizzes); COURSE_PRODUCTION_PLAN.md (risk rule: if Phase I slips, Week 14 drops to minimum review-week content first); the Week 1 template and `REVIEW_DISPOSITIONS.md` (69 min + 6 min buffer; notes ≤ 130 wpm; labeled course conventions; no internal IDs in student text).
**Format.** Two sessions of 75 minutes each. **Light on new theory**: the only new language content is views and viewpoints (and, optionally, variations for the evolution increment).
- Session 1: 19 lecture slides (48 min) and 3 slides of readiness work and exit (21 min), plus a generated "References and credits" slide (69 min + 6 min buffer).
- Session 2: the final presentations: 4 framing slides around five team slots (69 min + 6 min buffer).
- Total: 26 slides + 2 references slides.

## 0. Conventions used in this outline

- **Citations.** `R85 p.184` = register entry R85, PDF page 184 of the SysML v2.1 Beta 2 (Release 2026-07) specification, Part 1 (W4: cited as that text, never as "the standard"). `R77 sl.117` = slide 117 of the OMG textual-notation training deck, Release 2026-08. SEBoK, DoD and MITRE pages are PDF indices. `P14.1` is a proposed register addition (§10). Every citation was checked against `_source_cache/*.txt`; a citation supports only what is written beside it.
- **Course convention** marks content the sources do not supply (the definition of a "coherent" model, the readiness checklist, the presentation format, the evolution-increment pattern).
- **Checker.** The course-designated checker (OMG SysML v2 Pilot Implementation, release 2026-08). A checker PASS shows only that the text is accepted; it never shows that the model is consistent or correct. A `satisfy` usage asserts satisfaction (R83 p.168). No checker run was made for this outline.
- **AeroLink values are FICTIONAL**, from `sysml/reference/aerolink_v04_full.sysml` and `src/model/reference/*.ts` (OLD numbering: `week06.ts` TECH/AROU, `week07.ts` DEC-001, `week08.ts` TECH → PHY links). The reference holds **no evolution roadmap** (the earlier Week 14 content exists only as an outline in `draftWeeks.ts`), so every roadmap value below is **(proposed, instructor to confirm)**.
- **Folders.** New fragments are proposed under `learning-studio/sysml/lectures/week14/` (the existing `sysml/weekNN` folders use the OLD numbering).
- Student-facing slide text carries no internal IDs; they appear here only in Sources and faculty sections.

## 1. Learning objectives (graduate level)

Codes map to `course.ts` W14.1–W14.3; the earlier draft's B14.1–B14.3 (evolution increment, view for a non-technical reviewer, defense) are kept in substance.

| ID | Objective | Bloom | course.ts | Taught on |
|---|---|---|---|---|
| B14.1 | Deliver a coherent SysML v2 enterprise model developed from the team's own Systems Thinking package, and audit it for validity, consistency and traceability | Create / Evaluate | W14.1 | S1.3–S1.6; lab |
| B14.2 | Represent the Week 6 evolution roadmap in the model (at least one increment) and identify, by traversal, the elements the increment affects | Evaluate | W14.2 | S1.13–S1.14 |
| B14.3 | Define viewpoints that frame named stakeholder concerns and views that satisfy them, for at least one non-technical reviewer | Create | W14.3 | S1.7–S1.12 |
| B14.4 | Defend the model and its key decision in a technical review, including a live navigation of a complete thread and individual answers on owned elements | Evaluate | W14.3 | S1.15–S1.19; Session 2 |
| B14.5 | Review another team's model and write actionable review findings | Evaluate | — | S1.21; lab |
| Graduate | Write a one-page model-based adoption memo for the team's enterprise | Evaluate | graduate task | Lab (§5) |

## 2. Session 1: The coherent model, views for stakeholders, the evolution increment and the review (75 min)

**Design rationale.** The session first reviews what Phase II built and what "coherent" means, then teaches the one new construct the final deliverable needs (views and viewpoints), shows the evolution increment lightly, and finishes with the review format and a team readiness check. A20: teach first, then apply.

### Section A: From package to model (14 min)

#### S1.1 Week 14 at a glance (2 min)
- **Purpose.** Orient.
- **Content.** Subject, exactly as scheduled: *Final Presentation*. Session 1: what the final model must be, views for stakeholders, the evolution increment, the review. Session 2: the presentations. Deliverables and dates.
- **Figure.** Timeline: Session 1 → review copy exchanged → peer findings due → Session 2 presentations → final model due.
- **Sources.** COURSE_SCHEDULE.md.

#### S1.2 Driving question: can a board member get an answer from your model in a minute? (2 min)
- **Purpose.** Frame the week around use, not volume.
- **Content.** An investor asks: "Why are we buying four aircraft and not a vertiport, and what would change your mind?" Students vote where the answer lives: (A) the requirements package; (B) the trade-study analysis and its links; (C) a slide; (D) nowhere yet. Answer withheld until S1.11.
- **Figure.** A board-room question bubble over a dimmed model browser.
- **Sources.** Instructor-authored; AeroLink DEC-001 (`week07.ts`).

#### S1.3 What Phase II built, week by week (3 min)
- **Purpose.** Make the document-to-model continuity explicit one last time.
- **Content.** Week 8 stakeholders and concerns (from Week 1); Week 9 needs and requirements (from Week 2); Week 10 logical architecture and behavior (from Weeks 2 and 4); Week 11 physical structure, interfaces and allocation (from Week 5); Week 12 verification, measures, risks and the digital-thread audit (from Weeks 2 and 3); Week 13 analysis and the trade study (from Week 3); Week 14 the evolution roadmap and the integrated model (from Weeks 6 and 7).
- **Figure.** The two-lane course diagram from Week 1 (documents | model) with every vertical link now solid.
- **Sources.** COURSE_SCHEDULE.md rule 6.

#### S1.4 What "coherent" means for the final model (3 min)
- **Purpose.** Give the final deliverable an operational definition.
- **Content.**
  - SEBoK: in MBSE the model constitutes a primary artifact of the SE process; the document-based approach suffers from a lack of precision and inconsistencies from one artifact to another (R29 p.1383).
  - SEBoK describes a centralized repository that can serve as a "single source of truth" (R28 p.370).
  - **Course convention: coherent = (1) accepted by the checker with zero errors and explained warnings; (2) consistent: one value per fact, no asserted constraint or satisfy contradicted by the model's own values, statements agree with values; (3) traced: the course links complete, with gaps dispositioned; (4) every element traceable to the team's Phase I package by ID.**
- **Figure.** Four stacked layers: accepted, consistent, traced, faithful to the package; "correct" shown above them as what only verification and validation can support.
- **Sources.** R29 p.1383; R28 p.370. Course convention.

#### S1.5 The final model audit (2 min)
- **Purpose.** Show the evidence the graders will look at.
- **Content.**
  - Validity: checker log with zero errors; warnings explained (RB-8.1, gate rule).
  - Coverage: 100 % of requirements traced to needs, 100 % of needs to stakeholders, 100 % of system requirements with `satisfy` and a verification method (RB-9.1–9.2).
  - Threads: at least three complete threads demonstrated live (RB-9.3).
  - Consistency review of every element changed since Week 13 (Week 13 method).
  - A PASS is the first line of the audit, not its conclusion.
- **Figure.** Audit checklist card with four boxes.
- **Sources.** ASSESSMENT_RUBRICS.md RB-8.1, RB-9.1–9.3; R83 p.168.

#### S1.6 A complete thread, hop by hop (2 min)
- **Purpose.** Model the live demonstration.
- **Content.** AeroLink thread (FICTIONAL): STK-005 → NEED-004 → CAP-003 → REQ-SYS-001 → FN-006 → LOG-002 → PHY-003 → INFO-003 → VER-001 → MOP-002 → R-001; each hop names the SysML relationship followed (stakeholder declaration, `#derivesFrom`, derivation, allocation, perform, allocation, item flow, verify, `#measures`, risk metadata).
- **Figure.** Horizontal chain of eleven nodes, each arrow labeled with its relationship.
- **Sources.** `sysml/reference/README.md` §4 (five demonstration threads; asserted in `sysmlMapping.test.ts`).

**Transition A → B.** "The model holds the answers; reviewers need them in the form their concerns ask for. That is what views are for."

### Section B: Views and viewpoints for stakeholders (16 min)

#### S1.7 Model versus view, made precise (3 min)
- **Purpose.** Return to the Week 8 distinction with the language constructs.
- **Content.**
  - A viewpoint definition is a kind of requirement definition that frames the concerns of one or more stakeholders; the subject of a viewpoint is a view required to address them (R85 p.181).
  - A view definition is a kind of part definition that specifies how to create a view artifact satisfying one or more viewpoints, using view conditions and a rendering (p.181).
  - A view usage exposes a portion of the model; the rendering is applied to the exposed elements that meet the view conditions (p.181).
- **Figure.** Stakeholder → concern → viewpoint (frames) → view (satisfies) → rendered artifact; the model underneath, unchanged.
- **Sources.** R85 p.181.

#### S1.8 Stakeholders, concerns and viewpoints (3 min)
- **Purpose.** Connect to the concerns modeled in Week 8.
- **Content.**
  - A stakeholder is a person, organization or other entity with concerns; a concern is a specific topic one or more stakeholders want addressed (R77 sl.115).
  - A viewpoint is a requirement to present model information in a view that addresses certain concerns; it frames those concerns (sl.116). Any requirement may frame concerns (sl.116).
  - The concerns the team modeled in Week 8 are the input; no new stakeholder analysis is needed.
- **SysML v2 example** (needed fragment `aerolink_stakeholder_views.sysml`; to be checker-validated):
  ```
  viewpoint 'Investor decision perspective' {
      frame Stakeholders::'CON-005';   // Return on capital and path to scale (STK-003)
      require constraint {
          doc /* The view shall show the Year-2 capacity decision, the alternatives' scores and the risks the decision mitigates. */
      }
  }
  ```
- **Sources.** R77 sl.115–116; `aerolink_v04_full.sysml` line 147 (CON-005).

#### S1.9 View definitions and view usages: filter, expose, render (3 min)
- **Purpose.** The three mechanisms.
- **Content.**
  - A view definition states view conditions with `filter` and a rendering with `render` (R85 p.184; R77 sl.117).
  - A view usage inherits the conditions, may add its own, and states which elements are exposed with `expose`, a kind of import with no visibility keyword; exposed elements are protected (R85 p.184).
  - Recursive exposure (`::**`) and filtered exposure (`[ … ]`) use the import notation (p.184; R77 sl.118).
- **SysML v2 example** (needed fragment; to be checker-validated):
  ```
  view def InvestorDecisionView {
      satisfy 'Investor decision perspective';
      filter @SysML::AnalysisCaseUsage;
      render asElementTable;
  }
  view investorView : InvestorDecisionView {
      expose Analysis::**;
  }
  ```
- **Sources.** R85 p.184; R77 sl.117–118.

#### S1.10 Standard views and renderings (2 min)
- **Purpose.** Show what tools are expected to render.
- **Content.**
  - The Views library has four basic renderings: `asTreeDiagram`, `asInterconnectionDiagram`, `asTextualNotation`, `asElementTable` (R77 sl.118; P14.1 pp.541–543).
  - Standard view definitions include General, Interconnection, Action Flow, State Transition, Sequence, Geometry, Grid and Browser views (R78 sl.145; P14.1 pp.547–552).
  - A diagram is itself a view usage, and so is a compartment (R85 p.186).
  - Rendering support depends on the tool; the course checker validates text only.
- **Figure.** Grid of the eight standard views with a one-line purpose each.
- **Sources.** R77 sl.118; R78 sl.145; R85 p.186; P14.1. Source caution: the deck's slide 145 gives GridView the short name `gv` (the same as GeneralView); the specification lists it as `grv` (P14.1 p.547). Teach `grv`.

#### S1.11 Worked example I: the investor view of the capacity decision (3 min)
- **Purpose.** Answer the driving question.
- **Content.**
  - **Answer (B).** The trade-study analysis DEC-001, with its alternatives, value functions, weights, rationale and its links (affects REQ-STK-004; mitigates R-001), holds the answer; the investor view exposes it in a table.
  - What the investor sees (FICTIONAL): recommendation ALT-004; scores 0.670 / 0.489 / 0.458 / 0.452; it changes if the capital weight exceeds 0.478, demand falls to 192 trips/day or less, or the grid limit prevents a fourth hub.
  - The view adds no fact; it selects and renders existing ones. If the view needs a fact the model lacks, the model is incomplete.
- **Figure.** Mock table rendering of `investorView` beside the model browser path it was exposed from.
- **Sources.** `aerolink_v04_full.sysml` lines 1338–1352, 1657, 1672–1673; `week07.ts` DEC-001.

#### S1.12 Worked example II: a regulator view (2 min)
- **Purpose.** A second concern, a second rendering.
- **Content.** Viewpoint framing CON-004 (airworthiness and operational safety, STK-002); view exposing requirements and verification cases filtered to requirement and verification usages; rendered as a table: each safety-related requirement, its `satisfy`, its verification case and current verdict. Note: a `satisfy` row is an assertion; the verdict column is the evidence.
- **Figure.** Two-column mock: requirement | satisfied by | verified by | verdict.
- **Sources.** `aerolink_v04_full.sysml` line 142 (CON-004), `Verification` package; R83 p.168.

**Transition B → C.** "Views show today's enterprise. The roadmap from Week 6 says how it changes; the model should show that too."

### Section C: The evolution increment in the model (6 min)

#### S1.13 Two light ways to model an increment (3 min)
- **Purpose.** Give a minimal, correct pattern without new theory.
- **Content.**
  - **Pattern 1 (course convention, recommended):** an `Evolution` package with one element per increment, its trigger and its technology insertion, and one `#affectedBy` dependency per element it changes, written from the changed (dependent) element to the increment or technology: `#affectedBy dependency … from <changed element> to <increment>` (direction rule: `from` is the client, the dependent element; R80 pp.50–51; as in `aerolink_v04_full.sysml`). The affected set is derived by the Week 13 traversal.
  - **Pattern 2 (optional):** a variation. Any definition or usage can be marked `variation`, with `variant` usages as the allowed choices; a variant can reference a separately declared usage (S06 p.75–76; R76 sl.102–103). A configuration selects a variant by binding it (sl.104), and an asserted constraint can restrict combinations (sl.103).
  - SEBoK on upgrades: document the existing configuration before changing it; after a change, regression-test the unmodified portions (R26 p.682).
- **SysML v2 example** (needed fragment `aerolink_evolution_increment.sysml`; to be checker-validated; values proposed):
  ```
  part def FlightOperationsConcept;
  part piloted : FlightOperationsConcept;
  part remotelySupervised : FlightOperationsConcept {
      doc /* Long-term increment (proposed): enabled by TECH-003 at TRL 6 or higher (A-005, R-006). */
  }
  part def AeroLinkOperationsFamily {
      variation part operationsConcept : FlightOperationsConcept {
          variant piloted;
          variant remotelySupervised;
      }
  }
  ```
- **Sources.** S06 pp.75–76 (within R80); R76 sl.102–104 (within R76's range, whose title is "Use Case Definition"; see §10); R26 p.682.

#### S1.14 Worked example III: the AeroLink autonomy increment (3 min)
- **Purpose.** Show the increment with its impact.
- **Content.** (reference elements FICTIONAL; increment dates and triggers **proposed, instructor to confirm**)
  - Near term: today's baseline (12 aircraft, piloted). Mid term: DEC-001 (16 aircraft, a fourth hub). Long term: remotely supervised operations, inserting TECH-003 (detect-and-avoid and autonomy enablers, TRL 4, assumption A-005; risk R-006, accepted until the evolution decision).
  - Traversal from TECH-003 on the reference: it affects PHY-001 (aircraft) and CAP-004; A-005 and R-006 point at it (upstream, reviewed). Second order opens only from elements that must change.
  - Consequences to show: requirements and verification cases reached; operator-workload concern (CON-009) for the operator view.
- **Figure.** Three-band roadmap (near / mid / long) with TECH-003 insertion and the first-order set fanned out below.
- **Sources.** `src/model/reference/week06.ts` lines 29–79 (TECH-003, A-005, R-006, links); `week08.ts` line 163 (TECH-003 affects PHY-001); v0.4 line 1184 (R-006 treatment). Course convention (traversal).

**Transition C → D.** "Everything is in the model. The review tests whether you can use it."

### Section D: The final review (12 min)

#### S1.15 What a technical review is for (3 min)
- **Purpose.** Ground the presentation in review practice.
- **Content.**
  - Technical reviews are a mechanism by which sufficiently independent, knowledgeable stakeholders analyze the current state of a system or work products against pre-established criteria; the results support decisions (R06c p.386).
  - They support project assessment, configuration baselines and early validation through stakeholder involvement (p.386).
  - Entry and exit criteria should be defined and the entry criteria confirmed before the review (p.387).
  - Course entry criteria: model frozen and tagged; checker log; audit checklist; peer findings received.
- **Figure.** Entry criteria → review → exit criteria → decision.
- **Sources.** R06c pp.386–387. Course convention (entry criteria).

#### S1.16 The final review format and what the panel asks (3 min)
- **Purpose.** Remove uncertainty about Session 2.
- **Content.** (course convention)
  - Per team: 9 minutes, of which at least 3 minutes are live model navigation, then 3 minutes of individual questions.
  - The official final-lab expectations: navigate the model live, demonstrate traceability, explain architecture decisions, show AI-assisted analyses, answer executive questions using the model.
  - Content order: enterprise and system of interest (1 min); one complete thread live (3); the key decision and its sensitivity (2); one what-if answer (1); stakeholder views and the evolution increment (1); dispositions of peer findings (1).
- **Figure.** 12-minute bar split into segments.
- **Sources.** Official weekly lab note, final lab (model package list and presentation expectations); ASSESSMENT_RUBRICS RB-11.

#### S1.17 Live demonstration: navigating a thread and answering a trace question (2 min)
- **Content.** Rehearse the route; start from the reviewer's concern, not the package tree; answer "which verification case covers this requirement, and what is its verdict?" from the model, not from memory. Practice recovery if the tool stalls (the checker log and a static rendering as backup).
- **Sources.** RB-11.3; `sysml/reference/README.md` §4 (hop table).

#### S1.18 Individual questions: owning your elements (2 min)
- **Content.** Each student answers on elements they own (ownership tags since Week 8); typical questions: what does this `satisfy` assert; what evidence verifies it; what changes if this value changes. Answers must distinguish assertion from evidence (R83 p.168).
- **Sources.** RB-11.5; R83 p.168.

#### S1.19 The AI usage and validation report (2 min)
- **Content.** Tool, purpose, example prompts, outputs, evaluation and human contribution; every AI-generated fragment accepted by the checker and explained by its owner; AI-suggested elements tagged; AI output is never evidence of a trace, a margin or a verdict.
- **Sources.** RB-12.1–12.3; official final-lab submission list ("AI Usage and Validation Report").

**Session 1 lecture total:** 14 + 16 + 6 + 12 = 48 min.

### Section E: Readiness work (21 min)

#### S1.20 Team readiness check against the audit checklist (12 min)
- **Content.** Teams run the S1.5 checklist on their own model: checker log present, coverage metrics, three threads chosen, one view per non-technical reviewer, evolution increment present. Each team records gaps and an owner per gap. Instructor visits each team for 2 minutes.
- **Figure.** The checklist as a fill-in card (lab template).

#### S1.21 Peer review pairing and presentation order (5 min)
- **Content.** Each team is paired with a reviewing team. The review copy (tagged model + checker log) is exchanged at the end of the day; each reviewer submits at least three findings within 48 hours; the owning team shows its dispositions in Session 2. Presentation order is drawn.
- **Sources.** RB-17 (findings correctness, significance, actionability); RB-11.6 (peer findings dispositioned).

#### S1.22 Exit (4 min)
- **Content.** Exit ticket: "The one question a reviewer could ask that your model cannot yet answer, and who fixes it." Due dates restated.

#### S1.23 References and credits (0 min, generated)

**Session 1 timing.** A: 2 + 2 + 3 + 3 + 2 + 2 = 14; B: 3 + 3 + 3 + 2 + 3 + 2 = 16; C: 3 + 3 = 6; D: 3 + 3 + 2 + 2 + 2 = 12; E: 12 + 5 + 4 = 21. **14 + 16 + 6 + 12 + 21 = 69 min + 6 min buffer = 75.** (19 lecture slides, 48 min; 3 readiness and exit slides, 21 min.)

## 3. Session 2: Final presentations (75 min)

**Rationale.** Week 14 ends the course; there is no lab to launch. The session is the final technical review (A20: Week 14 is a review and presentation week). The plan assumes five teams, as in Week 1.

#### S2.1 Opening: order, timing and criteria (3 min)
- **Content.** Order; 9 + 3 minutes per team; what the panel scores (RB-11 rows, live navigation, individual questions); audience task: each student not presenting notes one strength and one finding per team (feeds the peer evaluation).

#### S2.2 Team presentations (60 min)
- **Content.** Five slots of 12 minutes (9 presentation including ≥ 3 live model; 3 individual questions), transitions inside the slot. Team slides are the teams' own; the course supplies only a title-and-timer frame slide per slot.
- **If more than five teams:** a second presentation slot in the final-examination period or reduced slots (faculty decision, §11).

#### S2.3 Course synthesis: from document to model (4 min)
- **Content.** What changed from the Phase I package to the Phase II model: precision, consistency checks, traceability by relationship, re-runnable analysis; what did not change: judgment, stakeholder engagement, evidence from verification and validation. Close on the difference between assertion and evidence.
- **Sources.** R29 p.1383; R83 p.168.

#### S2.4 Next steps (2 min)
- **Content.** Final model and reports due date; peer evaluation window; final notebook reflection; where the practical model examination sits (if held in the examination period).

#### S2.5 References and credits (0 min, generated)

**Session 2 timing.** 3 + 60 + 4 + 2 = **69 min + 6 min buffer = 75.**

## 4. AeroLink worked model example (continues the Phase I Weeks 6 and 7 work)

**Phase I starting point.** The Week 7 Systems Thinking Engineering Package (integrated Weeks 1–6) and the Week 6 evolution roadmap. For AeroLink, the reference holds the integrated baseline (204 IDs) but **no roadmap elements**; the roadmap below is assembled from DEC-001 (mid term) and TECH-003/A-005/R-006 (long term) and is proposed.
**Model starting point.** `aerolink_v04_full.sysml` (complete through verification, measures, AROU and analysis; 381 baseline links realised).

**Worked sequence.** (1) Audit and a complete thread (S1.5–S1.6); (2) investor viewpoint and view (S1.8–S1.11); (3) regulator view (S1.12); (4) autonomy increment as a variation with an impact set (S1.13–S1.14).

### 4.1 Existing fragments (reuse)

| Path (under `learning-studio/`) | What it shows | Checker status |
|---|---|---|
| `sysml/reference/aerolink_v04_full.sysml` | The integrated AeroLink model: all packages, five demonstration threads, DEC-001, TECH-003, R-006 | PASS in the 2026-10-11 checker run (0 errors, 0 warnings) |
| `sysml/reference/aerolink_v01…v03*.sysml` | Earlier levels, for the "what Phase II built" slide | PASS in the 2026-10-11 checker run |
| `sysml/week13/aerolink_consistency_seeded.sysml` | Consistency review practice (audit slide) | PASS in the 2026-10-11 checker run (2 warnings, intended) |

### 4.2 Needed fragments (proposed path `learning-studio/sysml/lectures/week14/`)

| Proposed file | Must show | Slide |
|---|---|---|
| `aerolink_stakeholder_views.sysml` | Self-contained extract (STK-002, STK-003, CON-004, CON-005, DEC-001 extract, two requirements with verification cases) plus two viewpoints that `frame` the concerns, two view definitions with `satisfy`, `filter` and `render` (`asElementTable`, `asTreeDiagram`), and two view usages with `expose … ::**`. Check during validation that the `SysML::AnalysisCaseUsage` filter metaclass name resolves | S1.8–S1.12 |
| `aerolink_evolution_increment.sysml` | `FlightOperationsConcept`, the two operations usages, a variation part with two variants, a configuration selecting `piloted` (baseline), and `#affectedBy` dependencies from PHY-001 and from CAP-004 to TECH-003 (the changed elements are the clients; extracts, as in `aerolink_v04_full.sysml` lines 1673 and 1680); doc comments with the proposed increments | S1.13–S1.14 |
| `invalid_expose_with_visibility.sysml` | Teaching listing: `private expose Analysis::**;` — expected to FAIL because expose takes no visibility (R85 p.184); to be confirmed by one checker run | S1.9 (optional) |

Run each once through the checker before use (one JVM at a time; `tasklist` check first). Values in the evolution fragment are **proposed, instructor to confirm**.

## 5. Laboratory outline: the final integration (team's own model)

### 5.1 Inputs
- The team's model through Week 13 with its checker log and baseline tag.
- The team's Phase I Week 6 evolution roadmap and Week 7 Systems Thinking Engineering Package.
- The team's Week 8 stakeholder and concern model (for viewpoints).
- This week's slides and lesson; AeroLink fragments (§4); readings R85 pp.181–184; R77 sl.115–118; R06c pp.386–387.

### 5.2 Objectives
B14.1–B14.5 applied to the team's own enterprise.

### 5.3 Method
1. **Audit** the model with the checklist (validity, coverage, threads, consistency of every change since Week 13); disposition each gap.
2. **Views:** at least two viewpoints framing concerns of different non-technical stakeholders (for example investors, a regulator, operations leadership), each with a view definition and usage; each view must answer one stated question.
3. **Evolution increment:** at least one Week 6 increment in the model (pattern 1 or 2), with its trigger, technology insertion and the first-order affected set by traversal.
4. **Package completeness** against the official final-lab list (enterprise context, stakeholders, needs, capabilities, requirements, logical, physical, behavior, information, interfaces, verification, risk, evolution, digital thread), each traced to the Phase I artifact by ID.
5. **Peer review:** review the paired team's frozen copy; at least three findings, each with location, violated criterion and proposed fix; disposition the findings received.
6. **Presentation and rehearsal** to the 12-minute format; the AI usage and validation report.

### 5.4 Procedure

| Step | When | Lead role | Output |
|---|---|---|---|
| 1. Readiness check | In class, S1.20 | V&V | Gap list with owners |
| 2. Fix gaps; consistency review; checker run | Day 1–2 | Each owner; V&V integrates | Clean checker log; audit sheet |
| 3. Views | Day 1–2 | Requirements & Compliance | Two viewpoints and views |
| 4. Evolution increment and traversal | Day 2 | Architecture | Increment and affected set |
| 5. Freeze and exchange review copy | End of Day 2 | V&V | Tagged copy to the peer team |
| 6. Peer findings written | Within 48 h | Whole team | ≥ 3 findings |
| 7. Dispositions of received findings | Before Session 2 | V&V | Disposition table |
| 8. Presentation and rehearsal | Before Session 2 | Whole team | Slides; demo route |
| 9. AI usage and validation report | Before Session 2 | AI & Data | Report |
| 10. Final submission | Date set by faculty (after Session 2) | V&V | Model, reports |

### 5.5 Outputs
- Final SysML v2 enterprise model (tagged), checker log, audit sheet with coverage metrics and gap dispositions.
- View set (≥ 2 viewpoints and views) and the evolution increment.
- Presentation slides; peer findings given and the disposition table for findings received.
- AI usage and validation report.
- Individual: peer evaluation; final notebook reflection.

### 5.6 Rubric rows (from ASSESSMENT_RUBRICS.md)

| Row | Criterion | Applied |
|---|---|---|
| RB-8.1–8.6 | SysML v2 model quality | Summative on the final model (validity gate per §0 safeguard 5) |
| RB-9.1–9.4 | Upward/downward trace, complete threads, trace audit | Summative; ≥ 3 threads live (RB-9.3) |
| RB-9.5 | Impact analysis | The Week 13 what-if and the increment's affected set |
| RB-11.1–11.6 | Technical review and presentation | Session 2; RB-11.5 individual |
| RB-12.1–12.3 | AI usage and validation report | Report |
| RB-13 | Peer evaluation | Final peer evaluation (counts once, its own component) |
| RB-16 | Review notebook | Final reflection (always read) |
| RB-17.1–17.3 | Review findings | Findings given to the paired team |

### 5.7 Workload (budget 8.0 h per student)

| Activity | Hours | Basis |
|---|---|---|
| Class sessions (2 × 75 min) | 2.5 | Timetable |
| Readings: R85 pp.181–184 (4 pp), R06c pp.386–387 (2 pp), R77 sl.115–118 (4 slides) | 0.5 | Register page counts |
| Gap fixing, consistency review, checker run (team share) | 1.6 | About 6.5 team-hours for a team of 4 |
| Views (team share) | 0.6 | Two viewpoints and views |
| Evolution increment (team share) | 0.5 | One increment and traversal |
| Peer findings and dispositions (team share) | 0.6 | ≥ 3 findings given; dispositions |
| Presentation preparation and rehearsal | 0.9 | 12-minute format |
| AI usage and validation report (team share) | 0.2 | |
| Peer evaluation and final reflection | 0.5 | RB-13, RB-16 |
| **Total** | **7.9** | Within budget |

Graduate students: the model-based adoption memo (one page; R29 pp.1383–1384) replaces the final reflection's free-form part (+0.3 h, total 8.2 h — faculty to accept or make the memo optional).

## 6. Assessment outline (separate from the lecture)

- **No readiness quiz this week** (the default for presentation weeks; COURSE_SCHEDULE open decision).
- **Team:** final model (RB-8, RB-9), presentation and review (RB-11.1–11.4, 11.6), AI usage and validation report (RB-12), peer findings (RB-17).
- **Individual:** RB-11.5 individual questions (scored per student), peer evaluation (RB-13), notebook final reflection (RB-16).
- **Calibration:** both graders score two archived anchor presentations before Session 2 (rubric safeguard 1).
- **Practical model examination (RB-14).** Not in Week 14 under this outline. Recommendation: hold it in the final-examination period (75 min, supervised, closed-AI, two model variants), because both Week 14 sessions are needed for the review. Alternatives: Week 13 Session 2 (the earlier placement), or Week 14 Session 1 (displacing the review lecture and readiness work). See Week 13 outline §6.3.

## 7. Continuity link to the Phase I artifacts

- **Phase I artifacts modeled.** Week 6 Enterprise Evolution Roadmap (increments, technology insertion, transition) → the evolution increment in the model; Week 7 Systems Thinking Engineering Package → the coherent enterprise model, every element traced to it by ID. COURSE_SCHEDULE.md rule 6: Week 14 ↔ Weeks 6 and 7; rule 5: the Week 14 output is a coherent SysML v2 model developed from the team's own package.
- **Official lab mapping.** The official weekly lab note's Lab 14 "Enterprise Evolution and Autonomy" (add autonomous flight operations; update requirements, architecture, operations, interfaces, risks), Lab 15 "Executive Communication and Model Storytelling" (views for engineering leadership, operations leadership, investors, regulators, board), and Lab 16 "Final Integrated Enterprise Model" (package list; live navigation, traceability, decisions, AI-assisted analyses, executive questions; submissions: integrated model, executive presentation, AI usage and validation report). The 14-week course compresses these three labs into one week; Lab 14's full update is reduced to one increment with its affected set (§9).

## 8. Section transitions (summary)

| From → to | Transition line |
|---|---|
| S1 A → B | The model holds the answers; reviewers need them shaped by their concerns |
| B → C | Views show today's enterprise; the roadmap shows how it changes |
| C → D | Everything is in the model; the review tests whether you can use it |
| D → E | Check your own model against the review's entry criteria now |
| S2 | Review, then synthesis: assertion versus evidence |

## 9. Source gaps and risks

1. **No AeroLink roadmap in the reference.** The earlier Week 14 module was never written (`draftWeeks.ts` only); the increment content is proposed and needs instructor confirmation and a checker run.
2. **Rendering is tool-dependent.** The specification defines views and four basic renderings, but the course checker validates text only; rendered view artifacts must come from the workbench, SysON (optional) or hand-made tables labeled as such.
3. **Deck typo.** R78 sl.145 gives GridView the short name `gv`; S06 p.547 gives `grv` (§2 S1.10).
4. **Open specification issues** near views: S06 p.183 carries "SYSML21-211: Filter condition or view condition?" and p.186 "SYSML21-456" (typo in 7.26.4); wording may change.
5. **Timing.** Five teams fill Session 2 exactly; more teams need a faculty decision. The production-plan risk rule (Week 14 drops to minimum review content if Phase I slips) would remove S1.13–S1.14 first.
6. **Compressed official labs.** Lab 14's full autonomy update and Lab 15's five executive views are reduced to one increment and two views to stay within 8 h.
7. **Week 1 case changes** (STK-015 and others), if adopted, change the stakeholder set the views draw on.
8. **Peer-review timing** (48 h between sessions) requires the sessions to be at least two days apart.

## 10. Register additions needed

| Placeholder | Source, PDF pages | First-page title (verified) | Supports |
|---|---|---|---|
| **P14.1** | S06 pp.541–553 | "9.2.19 Views" (incl. 9.2.20 Standard View Definitions: short names, GridView `grv`) | S1.10 |

Notes. (a) Variations (sl.102–104) already sit inside R76's range (sl.100–107), titled "Use Case Definition"; either retitle/split R76 or cite the slides under R76 as here. S06 pp.75–76 (7.6.7 Variations and Variants) is inside R80. (b) Existing entries used: R85 (pp.181, 184, 186), R77 (sl.115–118), R78 (sl.145), R76 (sl.102–104), R80 (pp.75–76), R06c (pp.386–387), R26 (p.682), R28 (p.370), R29 (p.1383), R83 (p.168). (c) R41 (DoD PDR, pp.75–82) listed in `course.ts` is not needed by this outline (R06c covers review purpose and criteria); keep as extension.
**Week 14 readings (proposed):** essential R85 pp.181–184; R77 sl.115–118; R06c pp.386–387. Extension: R29 pp.1383–1384 (graduate memo); R26 pp.681–682; P14.1.

## 11. Open items for faculty

1. Practical model examination placement (§6); recommendation: final-examination period.
2. More than five teams: second presentation slot or shorter slots.
3. Confirm no readiness quiz in Week 14.
4. Approve the course definition of a "coherent" model (S1.4) and the readiness checklist as the review entry criteria.
5. Confirm the proposed AeroLink roadmap increments (near/mid/long) and the autonomy increment values.
6. Approve the reduction of the official Labs 14–16 to one increment and two views.
7. Approve P14.1 and the R76 title note.
8. Graduate memo: required (8.2 h) or optional.
