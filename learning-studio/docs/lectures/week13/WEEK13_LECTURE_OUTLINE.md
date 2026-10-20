# Week 13 Lecture Outline: Trade Study / Analysis

**Status.** Draft for faculty approval (COURSE_PRODUCTION_PLAN M2, outlines for Weeks 2–14). Written 2026-10-19. Nothing here is committed; no `.sysml` file has been created or run for this outline.
**Governing documents.** DECISION_LOG A19 and A20 (schedule; lecture-first course), A10–A12 (Parametric Analysis panel, reserve convention, "analysis-computed (teaching)" label); COURSE_SCHEDULE.md (Week 13 subject, exact; rule 6: Week 13 ↔ Week 3); the Week 1 template (`docs/lectures/week01/WEEK1_LECTURE_OUTLINE.md`) and its review lessons (`REVIEW_DISPOSITIONS.md`: 69 min + 6 min buffer per session, spoken notes ≤ 130 wpm, verified definitions, labeled course conventions, no internal IDs in student text).
**Format.** Two sessions of 75 minutes each.
- Session 1 is all lecture: 24 slides plus a generated "References and credits" slide (69 min + 6 min buffer).
- Session 2 is 47 minutes of lecture (17 slides) and 22 minutes of laboratory launch (4 slides), plus the references slide (69 min + 6 min buffer).
- Total: 45 content slides + 2 references slides.

## 0. Conventions used in this outline

- **Citations.** `R75 sl.94` = register entry R75, slide 94 of the OMG textual-notation training deck (Release 2026-08; slide number = PDF page). `R84 p.172` = register entry R84, PDF page 172 of the SysML v2.1 Beta 2 (Release 2026-07) language specification, Part 1 (cited as that text, never as "the standard"; DECISION_LOG W4). SEBoK, DoD and MITRE pages are PDF indices (W1). `PX1`, `PX4`, `PX6` and `P13.1` are **proposed register additions** (§10); their text was opened for this outline but they are not yet in `readings.py`. Every citation was checked against `_source_cache/*.txt`; a citation supports only what is written beside it.
- **Course convention** marks content the sources do not supply (for example the impact-analysis dependency table, the TPM status rules, the 5 × 5 → probability mapping). It is taught as the course's choice.
- **Checker statements.** "The checker" is the course-designated checker (OMG SysML v2 Pilot Implementation, release 2026-08, kernel 0.62.0). Every statement about what it does or does not report is taken from the recorded probe runs of 2026-10-11 (`docs/authoring/week13_notes.md`, probes a01–a14, c01–c13) and describes that release only. **A checker PASS never shows that a model is consistent or correct.** A `satisfy` usage *asserts* that the requirement is satisfied by the satisfying feature (R83 p.168); the checker does not test that assertion.
- **AeroLink values are FICTIONAL.** They come from `src/model/reference/week05.ts` (TPMs; OLD numbering), `week06.ts` (TECH, AROU), `week07.ts` (ALT, CRIT, DEC-001; the Phase I Week 3 trade study), `sysml/reference/aerolink_v04_full.sysml` (packages `Measures`, `Analysis`) and `sysml/week13/aerolink_tpm003_landing_reserve_analysis.sysml` (energy inputs). Sizer outputs, when the panel exists, are labeled **"analysis-computed (teaching)"** beside the FICTIONAL baseline (A12). Anything not yet in `src/` is marked **(proposed, instructor to confirm)**.
- **Folders.** `sysml/week08`…`sysml/week13` are in the OLD week numbering. New lecture fragments are proposed under `learning-studio/sysml/lectures/week13/`.
- **Spoken notes** (written later, with the slides) stay at or below 130 words per minute on every slide; student-facing slide text carries no internal IDs (decision-log IDs, FD numbers, source codes such as S04, P-numbers, objective codes or "old Week" references). Those appear here only in Sources and faculty sections.

## 1. Learning objectives (graduate level)

Objective codes map to `course.ts` W13.1–W13.3 as shown. They replace the earlier draft's B13.1–B13.4 (whose impact and consistency content is kept in B13.4–B13.5).

| ID | Objective | Bloom | course.ts | Taught on |
|---|---|---|---|---|
| B13.1 | Model calculations and constraints in SysML v2, and distinguish a constraint that may be violated from an asserted constraint whose violation makes the model inconsistent | Apply / Analyze | W13.1 | S1.7–S1.14 |
| B13.2 | Model an analysis case with subject, objective and result for a key measure, bind its objective to the requirement it tests, and state what the case does and does not compute | Apply | W13.1 | S1.15–S1.23 |
| B13.3 | Redo the team's Phase I trade study as a `TradeStudy` analysis (alternatives, value functions, weights, objective), add a sensitivity case, and compare the model-based result with the document-based one | Evaluate | W13.2 | S2.3–S2.8 |
| B13.4 | Use an external analysis result (the Parametric Analysis panel) with recorded provenance and an argument for its credibility for the stated use | Evaluate | W13.1 | S2.9–S2.12 |
| B13.5 | Answer a what-if question from the model by traversal, with the method shown, and distinguish "the checker accepts it", "the model is consistent" and "the model is correct" | Analyze / Evaluate | W13.3 | S2.13–S2.16 |
| Graduate | Argue the credibility of one analysis used in the decision (intended use, verification, validation, accreditation authority) | Evaluate | — | Applied exercise part 6 (§6.2) |

## 2. Session 1: Calculations, constraints and analysis cases (75 min, all lecture)

**Design rationale.** Session 1 gives the language machinery (expressions, calculations, constraints, analysis cases) on the one analysis students already know numerically: the landing-energy reserve. The trade study, the panel and impact questions come in Session 2, when the machinery is in place. Teach first (A20).

### Section A: Framing and the decision-analysis recap (17 min)

#### S1.1 Week 13 at a glance (2 min)
- **Purpose.** Orient: subject, sessions, outputs.
- **Content.**
  - Subject, exactly as scheduled: *Trade Study / Analysis*.
  - This week's model adds: calculations and constraints; one analysis case for a key measure; your Phase I trade study as a model element; one what-if answer.
  - Session 1: the language for computing and constraining. Session 2: the trade study in the model, external analysis, what-if questions, lab launch.
- **Figure.** Strip of four boxes "calc → constraint → analysis case → trade study" with a dimmed fifth "what-if question" and a bracket "Week 13 model increment".
- **Sources.** COURSE_SCHEDULE.md (subject, team output).

#### S1.2 Driving question: did the model choose ALT-004? (3 min)
- **Purpose.** Create a need to know: a model can *specify* a decision without *computing* it.
- **Content.**
  - Show the AeroLink trade-study element (four alternatives, four criteria, weights 0.40 / 0.30 / 0.16 / 0.14) and the claim "the model selected ALT-004, score 0.670".
  - Vote: (A) the checker computed the scores; (B) the model states how scores are computed and someone computed them; (C) the scores were typed in; (D) cannot tell.
  - Answer withheld until S2.6.
- **Figure.** The trade-study element as a card with a question mark over the result line.
- **Sources.** `week07.ts` header (scores, weights; FICTIONAL). Instructor-authored question.

#### S1.3 From the Phase I document to the model: what carries over (2 min)
- **Purpose.** State the continuity explicitly (Week 13 models the Week 3 trade study).
- **Content.**
  - Week 3 gave a decision statement, alternatives, criteria traced to measures of effectiveness, value functions, swing weights, scores, sensitivity and a recommendation.
  - In the model: alternatives become parts, criteria become calculations, the decision becomes an analysis whose objective selects the best alternative; links to measures and risks already exist from Weeks 11–12.
  - What changes: the method becomes inspectable and re-runnable; the numbers still come from a computation.
- **Figure.** Two lanes: Week 3 trade-study table → Week 13 model elements, arrows per row (ALT → part, CRIT → calc def, DEC → analysis : TradeStudy).
- **Sources.** COURSE_SCHEDULE.md rule 6; `aerolink_v04_full.sysml` package `Analysis` doc comment (line 1272).

#### S1.4 What "analysis" means in systems engineering (3 min)
- **Purpose.** Place the week in SE practice before the syntax.
- **Content.**
  - System analysis gives a rigorous basis for technical decisions: trade-off studies, modeling and simulation, cost analysis, technical risk analysis and effectiveness analysis (R34 p.608).
  - A trade study compares alternative solutions against assessment criteria and must handle objective and subjective criteria and the sensitivity of the result to particular criteria (R34 p.609).
  - DoD: decision analysis turns a broadly stated decision opportunity into a traceable, defendable and actionable plan, integrated with requirements and architecture work (R43 p.109).
- **Figure.** Three columns: cost, risk, effectiveness, feeding one "decision" box.
- **Sources.** R34 pp.608–609; R43 p.109.

#### S1.5 Recap of the Week 3 method: value functions, swing weights, additive value (4 min)
- **Purpose.** Re-activate the decision-analysis method the model will encode.
- **Content.**
  - A value function maps a measure's score to value between a walk-away point and a stretch goal; its shape should be documented (R18 p.465–466).
  - Swing weights depend on the measure's importance **and** its range; they are normalized to sum to one for the additive model (R18 p.466).
  - Additive value: each alternative's value is the weighted sum of its single-measure values (R18 p.469).
  - AeroLink (FICTIONAL): four criteria from MOE-001, -005, -006, -003; swing points 100 / 75 / 40 / 35 → weights 0.40 / 0.30 / 0.16 / 0.14; ALT-004 0.670, ALT-002 0.489, ALT-003 0.458, ALT-001 0.452.
- **Figure.** One linear value function (CRIT-001: v = 1 at 5 min, v = 0 at 60 min) beside the weight bar.
- **Sources.** R18 pp.465–466, 469; `week07.ts` (CRIT-001..004, ALT-001..004).

#### S1.6 Sensitivity and what a recommendation must state (3 min)
- **Purpose.** Recall that a ranking without sensitivity is not a recommendation.
- **Content.**
  - Decision analysis uses line diagrams, tornado and waterfall diagrams; a line diagram shows sensitivity to the swing-weight judgment (R18 p.472).
  - System-analysis checks include the sensitivity of the scores to the criteria weights (R34 p.612).
  - AeroLink (FICTIONAL): capital weight above 0.478 (base 0.30) makes ALT-001 rank first; wait weight below 0.226 (base 0.40) makes ALT-003 first. The recommendation states conditions, residual risk and what would change it (DEC-001).
- **Figure.** Line diagram: alternative values against the capital weight, crossover marked at 0.478.
- **Sources.** R18 p.472; R34 p.612; `week07.ts` DEC-001 attributes.

**Transition A → B.** "To put this in the model we need two kinds of element: one that computes a number and one that states a condition. SysML v2 keeps them apart."

### Section B: Expressions, calculations and constraints (21 min)

#### S1.7 Expressions and feature values: binding, not assignment (3 min)
- **Purpose.** Ground everything in the expression sublanguage.
- **Content.**
  - A feature value is a shorthand for binding a feature to the result of an expression (PX4 sl.72).
  - A default value applies unless overridden; once bound, the value is fixed as the result of the expression (sl.74).
  - `==` is the Boolean equality operator; `=` denotes binding (sl.83). Students confuse them.
- **SysML v2 example** (from the reference; checker PASS):
  ```
  attribute <'TPM-003'> landingReserveMargin : Real =
      designTripAnalysis.landingFraction - Requirements::'REQ-SYS-003'.minLandingEnergyFraction;
  ```
- **Sources.** PX4 sl.72, 74, 83; `sysml/week13/aerolink_tpm003_landing_reserve_analysis.sysml` line 81.

#### S1.8 Quantities and units inside expressions (2 min)
- **Purpose.** Prevent the most common analysis defect (wrong unit).
- **Content.**
  - Units are identified on the quantity value, not on the type: `1000[kg]` (PX4 sl.73).
  - A compound unit is written as an expression of library units, e.g. `120 [kW * h]`; the course probe shows `130 [kWh]` fails to resolve (probe a07).
  - The probes also show what passes in silence: `6 [kW]` passed as a duration, a power added to an energy (probes a02, a03). Dimensional checking is the reviewer's job with this release.
- **Figure.** Two cards: "resolves / does not resolve" and "resolves but wrong kind".
- **Sources.** PX4 sl.73; R79 sl.163–168 (Quantities and Units, look-up); week13 notes probes a02, a03, a07.

#### S1.9 Calculation definitions and usages (3 min)
- **Purpose.** Define the computing element.
- **Content.**
  - A calculation definition is a kind of action definition with a distinguished `out` result parameter; it specifies a reusable computation that returns a result (PX1 p.155).
  - Declared with `calc`; the result is declared with `return` (p.156). The result expression is written last, without a final semicolon, or bound on the return declaration (p.157).
  - A calculation can be used in a usage with bound parameters, or invoked as an expression with arguments (PX4 sl.77).
- **SysML v2 example** (existing listing; checker PASS):
  ```
  calc def TripEnergy {
      in terminalPower : PowerValue;  in terminalTime : DurationValue;
      in cruisePower : PowerValue;    in cruiseTime : DurationValue;
      return energy : EnergyValue = terminalPower * terminalTime + cruisePower * cruiseTime;
  }
  ```
- **Sources.** PX1 pp.155–157; PX4 sl.76–77; `aerolink_tpm003_landing_reserve_analysis.sysml` lines 30–36.

#### S1.10 Pure calculations; a calculation is a function (2 min)
- **Purpose.** Explain why value functions are modeled as calculations.
- **Content.**
  - A calculation definition is also a KerML function and a calculation usage is a KerML expression, so it can be invoked like a function (PX1 p.155).
  - A pure calculation always gives the same result for the same inputs and has no side effects (p.155). Value functions and evaluation functions should be pure.
- **Figure.** CRIT-001 as a function box: x (min) → v.
- **Sources.** PX1 p.155.

#### S1.11 Constraint definitions: a predicate that may be false (3 min)
- **Purpose.** Define the stating element.
- **Content.**
  - A constraint definition defines a logical predicate: `in` parameters and an implicit Boolean result (PX1 p.157).
  - A constraint usage is satisfied if its expression evaluates to true and violated otherwise (p.158).
  - A constraint may be violated without making the model inconsistent (PX4 sl.79).
- **SysML v2 example** (needed fragment `aerolink_constraint_vs_assert.sysml`; to be checker-validated):
  ```
  constraint def CapacityMeetsTarget {
      in capacity : Real;
      in target : Real;
      capacity >= target
  }
  part baseline : CapacityAlternative {
      constraint meetsYear2 : CapacityMeetsTarget {
          in capacity = capacityTripsPerDay;  // 240 trips/day (FICTIONAL)
          in target = 300.0;                  // REQ-STK-004 (FICTIONAL)
      }
  }
  ```
- **Teaching point.** The baseline violates this constraint (240 < 300), and the model is still consistent: it records that ALT-001 fails the target.
- **Sources.** PX1 pp.157–158; PX4 sl.79; `week07.ts` ALT-001.

#### S1.12 Asserted constraints: a violation is an inconsistency (3 min)
- **Purpose.** The single most important semantic distinction of the week.
- **Content.**
  - An assert constraint usage asserts that the constraint is always true; if it can be determined to be false, that is a logical inconsistency in the model (PX1 p.158).
  - Laws of physics should be asserted; a constraint may also be asserted when its satisfaction is expected, so that a violation is flagged for resolution (p.158).
  - Writing `assert constraint meetsYear2 …` on the baseline would make the model inconsistent (PX4 sl.81).
  - The checker evaluates no constraint: a contradictory constraint passed with no message (probe c10).
- **Figure.** Two-row table: "constraint (may be false)" / "assert constraint (must be true)" with the AeroLink baseline in each row.
- **Sources.** PX1 p.158; PX4 sl.81; week13 notes probe c10.

#### S1.13 Causal and acausal: calculations versus constraints (2 min)
- **Purpose.** Show when to use each.
- **Content.**
  - An action (and a calculation) is causal: outputs are determined from inputs. A constraint is acausal: simply true or false for given values (PX4 sl.84).
  - A constraint definition can specify a system of coupled equations that a solver must satisfy (sl.84; R84 p.170, third bullet).
  - Derived values are usually written as bindings in SysML v2; constraints allow general equalities and inequalities (sl.83).
- **Figure.** Left: calc box with arrows in → out. Right: constraint box with undirected parameter lines.
- **Sources.** PX4 sl.83–84; R84 p.170.

#### S1.14 Requirements are constraints; satisfy asserts (3 min)
- **Purpose.** Connect to Weeks 9 and 12.
- **Content.**
  - A requirement definition is a special kind of constraint definition, formalized by required constraints and optional assumptions (R74 sl.86–87).
  - A requirement is satisfied for a subject if, when all its assumed constraints are true, all its required constraints are true (R74 sl.91).
  - A `satisfy` usage is a kind of assert constraint usage: it asserts that the requirement is satisfied when its subject is bound to the satisfying feature (R83 p.168).
  - Consequence: a `satisfy` on a design whose own values violate the requirement makes the model inconsistent; the checker passed exactly that case (probe a11). Evidence that the real system meets the requirement comes from verification (Week 12), not from the assertion.
- **Figure.** REQ-SYS-003 (≥ 0.20) with `satisfy … by flightOperations` and two values, 0.23 (consistent) and 0.18 (inconsistent; checker silent).
- **Sources.** R74 sl.86–87, 91; R83 p.168; week13 notes probe a11.

**Transition B → C.** "We can compute and we can constrain. An analysis case packages both around a subject and an objective."

### Section C: Analysis cases (29 min)

#### S1.15 The case family (2 min)
- **Purpose.** Locate analysis cases among cases.
- **Content.**
  - A case definition is a kind of calculation definition that produces a result intended to achieve an objective regarding a subject; analysis cases, verification cases and use cases are kinds of case (S06 p.169, inside R83’s range; see §10 note a).
  - The subject is a distinguished first parameter; the objective is a requirement usage to be satisfied by performing the case (p.169–170).
- **Figure.** Tree: calculation → case → {analysis case (this week), verification case (Week 12), use case (Week 10)}.
- **Sources.** S06 pp.169–170 (R83 covers p.169; R84 covers p.170).

#### S1.16 Analysis case definition: subject, objective on the result, return (3 min)
- **Purpose.** Define the element exactly.
- **Content.**
  - An analysis case definition is a case whose objective is to carry out an analysis on the subject; performing it returns a result about the subject, which can be evaluated against the objective (R84 p.170).
  - For an analysis case, the subject of the objective is always bound to the result: the objective is about the result (p.172).
  - The objective may hold assumed and required constraints (R75 sl.92).
- **SysML v2 example** (existing listing lines 42–64, abridged; checker PASS):
  ```
  analysis def LandingReserveAnalysis {
      subject flightPlanning : Logical::FlightOperations;
      objective landingReserveObjective {
          assume constraint { capacityRetainedEOL > 0.0 and capacityRetainedEOL <= 1.0 }
          require constraint { landingFraction >= minimumFraction }
      }
      in attribute minimumFraction : Real;
      // ... energy inputs ...
      return landingFraction : Real = LandingEnergyFraction(usableEnergyEOL, tripEnergy.energy);
  }
  ```
- **Sources.** R84 pp.170, 172; R75 sl.92.

#### S1.17 How an analysis case is performed (3 min)
- **Purpose.** Show the three ways the specification allows.
- **Content.** (R84 p.170)
  - Analysis actions, each with calculations returning results (the fuel-economy example: a dynamics analysis then a consumption analysis; R75 sl.93).
  - Specified in SysML and solved by an external solver: the case states *what* is computed, not the algorithm.
  - A set of simultaneous equations as asserted constraints for a solver.
  - The AeroLink listing uses the first way; the Parametric Analysis panel (Session 2) is the second.
- **Figure.** Three lanes labeled with the three ways; AeroLink markers on lanes 1 and 2.
- **Sources.** R84 p.170; R75 sl.93.

#### S1.18 Analysis case usage: a configuration, and satisfy on the result (3 min)
- **Purpose.** Show how a usage carries out the analysis for one design.
- **Content.**
  - A usage carries out the analysis for a specific configuration; subject and parameters are redefined automatically (R75 sl.94).
  - If the configuration's attribute is set to the analysis result, the configuration is asserted to satisfy the requirement (sl.94). That assertion is still an assertion (R83 p.168).
- **SysML v2 example** (existing listing lines 66–83, abridged):
  ```
  part landingReserveContext {
      part flightOperations : Logical::FlightOperations {
          attribute :>> plannedLandingEnergyFraction = designTripAnalysis.landingFraction;
      }
      analysis designTripAnalysis : Analysis::LandingReserveAnalysis {
          subject flightPlanning = flightOperations;
          in minimumFraction = Requirements::'REQ-SYS-003'.minLandingEnergyFraction;
          in usableEnergyBOL = 120 [kW * h];  in capacityRetainedEOL = 0.92;
          // terminal and cruise power and time
      }
      satisfy Requirements::'REQ-SYS-003' by flightOperations;
  }
  ```
- **Sources.** R75 sl.94; R83 p.168.

#### S1.19 Worked example I: the TPM-003 analysis, element by element (5 min)
- **Purpose.** Walk the full listing with students naming each element's role.
- **Content.**
  - Two calculation definitions hold the physics (trip energy; landing fraction).
  - The analysis definition: subject flight planning; objective with an assumption and a requirement on the result; seven inputs; one return.
  - The usage binds the design-trip configuration; its minimum is bound to REQ-SYS-003's own attribute.
  - The TPM-003 margin is an expression, not a stored number.
  - Students call out at each step: "what does this element contribute to the decision?"
- **Figure.** The listing with callouts numbered 1–6 and a side panel tracing each callout to TPM-003, MOP-005 and REQ-SYS-003.
- **Sources.** `sysml/week13/aerolink_tpm003_landing_reserve_analysis.sysml` (PASS in the 2026-10-11 checker run); R75 sl.92–94.

#### S1.20 Worked example II: the numbers by hand, with margin and contingency (3 min)
- **Purpose.** Show that someone must compute the result, and how a margin is read.
- **Content.** (all FICTIONAL; inputs chosen to reproduce the reference estimate)
  - Trip energy: 400 kW × 6 min + 270 kW × 10 min = 40 + 45 = 85 kWh.
  - Usable energy at end of life: 120 kWh × 0.92 = 110.4 kWh.
  - Landing fraction: (110.4 − 85) / 110.4 = 0.230 (TPM-003 estimate 23 %).
  - Margin on the estimate: 23.0 − 20 = 3.0 points; with the Week 2 contingency of 1.5 points the worst case is 21.5 %, margin 1.5 points.
  - DoD: contingency adjusts the current best estimate to a worst-case estimate; margin is threshold minus the worst-case estimate, and is trade space (R44 p.117).
- **Figure.** Bar: threshold 20 %, worst case 21.5 %, estimate 23 %, objective 25 %, contingency and margin labeled.
- **Sources.** R44 p.117; listing and `src/activities/week13/margins.ts` (TPM_SPECS: contingency 1.5, alert floor 1); `week05.ts` TPM-003.

#### S1.21 Worked example III: write each limit once (2 min)
- **Purpose.** A design habit that prevents drift.
- **Content.**
  - The objective's minimum is bound to `Requirements::'REQ-SYS-003'.minLandingEnergyFraction`, not retyped as 0.20.
  - The checker passed a literal 0.18 in place of the bound value with no message (probe a14): a copied limit can drift silently.
  - Course convention: limits, thresholds and margins are bindings or expressions to their single source.
- **Figure.** Before/after pair: literal 0.20 in two places vs one binding arrow.
- **Sources.** Listing line 73; week13 notes probe a14. Course convention.

#### S1.22 What the checker checks in an analysis, and what it does not (4 min)
- **Purpose.** Make the checker's scope explicit before students rely on it.
- **Content.** Recorded results, release 2026-08, 2026-10-11:
  - **FAIL:** a misspelt result name; a result used but never declared; an undefined unit such as `kWh` (probes a06, a07, a09).
  - **PASS with warning:** a unitless number bound to a quantity; a result declared with the wrong type; a subject of the wrong definition (a08, a10, c04).
  - **PASS, no message:** a dimensionally wrong sum; a unit of the wrong kind; a violated assumption; a reversed objective; a missing calculation argument; a literal limit that differs from the requirement; a satisfy whose bound value violates the requirement (a02–a05, a11, a12, a14).
  - No expression is evaluated, so no result is computed by the checker.
- **Figure.** Three-column table (FAIL / WARNING / silent) with one AeroLink line per cell.
- **Sources.** `docs/authoring/week13_notes.md` probe table. Course record, not a property of the language.

#### S1.23 Analysis results as evidence over time (3 min)
- **Purpose.** Place analysis in technical assessment and separate it from verification.
- **Content.**
  - TPMs are measures collected over time to see trends and forecast progress; early in the life cycle they may be estimated from assumptions and modeling and simulation, later replaced by demonstrated data (R44 p.113).
  - With enough margin, TPMs help identify trade space (R44 p.113).
  - An analysis estimate updates a TPM; it is verification evidence only when a verification case with method "analysis" uses it (Week 12, VER-003).
- **Figure.** TPM-003 trend sketch: estimates from analysis (hollow), later measured points (solid), threshold line.
- **Sources.** R44 p.113; `aerolink_v04_full.sysml` VER-003 (line 939).

#### S1.24 Exit: retrieval and preparation (3 min)
- **Purpose.** Retrieval and preparation for Session 2.
- **Content.**
  - Exit ticket (two lines): "Name one constraint in your enterprise that may be violated and one you would assert, and say why."
  - Before Session 2: bring your Phase I trade-study table (alternatives, criteria, value functions, weights, scores) and one TPM with its threshold and estimate.
- **Figure.** Two-box hand-off card "Session 2 needs: trade-study table; one TPM".
- **Sources.** Instructor-authored.

#### S1.25 References and credits (0 min, generated)

**Session 1 timing.** 2 + 3 + 2 + 3 + 4 + 3 = 17 (A); 3 + 2 + 3 + 2 + 3 + 3 + 2 + 3 = 21 (B); 2 + 3 + 3 + 3 + 5 + 3 + 2 + 4 + 3 + 3 = 31 (C). **69 min + 6 min buffer = 75.**

## 3. Session 2: The trade study in the model, external analysis, what-if questions, lab launch (75 min)

**Split.** About 47 minutes of lecture (S2.1–S2.17) and 22 minutes of laboratory launch (S2.18–S2.21), the Week 1 pattern.

### Section D: Warm-up (3 min)

#### S2.1 Warm-up question (2 min)
- **Purpose.** Retrieval of Session 1.
- **Content.** Three statements about one fragment; students mark each true/false: (1) "The checker computed `landingFraction`." (2) "If `capacityRetainedEOL` were 8.5 the model would be rejected." (3) "Asserting the capacity constraint on the baseline makes the model inconsistent."
- **Figure.** The three statements beside a five-line fragment. Deliberately sparse (precedes the reveal).
- **Sources.** Instructor-authored.

#### S2.2 Reveal (1 min)
- **Content.** False (no expression is evaluated, probe record); false (a violated assumption passed, probe a04); true (PX1 p.158).
- **Sources.** Week13 notes probes a04; PX1 p.158.

### Section E: The trade study in the model (19 min)

#### S2.3 Trade-off analyses in SysML v2 (3 min)
- **Purpose.** Introduce the construct.
- **Content.**
  - A trade-off analysis evaluates and compares alternatives; it can be modeled as a usage of the `TradeStudy` analysis case definition from the TradeStudies library (R84 p.172).
  - The subject is the collection of alternatives; an evaluation function evaluates each; common objectives maximize or minimize that value (p.172).
  - The specification's example weights criteria by importance to the stakeholder and sums normalized values (p.172) — the additive model of S1.5.
- **Figure.** Subject (alternatives) → evaluation function → objective (maximize) → selected alternative.
- **Sources.** R84 p.172.

#### S2.4 The TradeStudies library (3 min)
- **Purpose.** Show exactly what the library provides.
- **Content.**
  - `EvaluationFunction`: a calculation that evaluates an alternative, producing a scalar value (PX6 p.571).
  - `TradeStudyObjective`: a requirement that the selected alternative has the best evaluation; "best" is computed in concrete specializations (p.573). `MaximizeObjective` and `MinimizeObjective` take the maximum or minimum (pp.571–572).
  - `TradeStudy`: an analysis case whose subject is a set of alternatives (at least one) and whose result selects one of them (p.572); bind `studyAlternatives`, redefine `evaluationFunction` (p.572–573).
  - Library text: `require constraint { eval(selectedAlternative) == best }` (R78 sl.152).
- **Figure.** Library class sketch: TradeStudy (analysis) — evaluationFunction, tradeStudyObjective, selectedAlternative.
- **Sources.** PX6 pp.571–573; R78 sl.152. Source caution: the specification carries an open issue marker "SYSML21-318: Diamond inheritance problem with TradeStudy" on p.571 (§9).

#### S2.5 Worked example IV: AeroLink alternatives and criteria as model elements (5 min)
- **Purpose.** Show the Phase I trade study as model elements.
- **Content.**
  - `part def CapacityAlternative` with aircraft, turnaround chargers, sites, capacity and the four raw criterion scores.
  - ALT-001..004 as parts with FICTIONAL values (e.g. ALT-004: 16 aircraft, 8 turnaround chargers, 320 trips/day, wait 8 min, USD 12.8 M, 90 % retained, 8 movements/h).
  - CRIT-001..004 as `calc def` value functions, e.g. CRIT-001: `if x >= 60.0 ? 0.0 else if x <= 5.0 ? 1.0 else (60.0 - x) / 55.0`.
  - Each CRIT derives from its MOE (`#derivesFrom` dependencies), so the criteria stay traced.
  - Students predict: which element would change if the community weight were raised?
- **SysML v2 example** (from `aerolink_v04_full.sysml` lines 1313–1322; PASS):
  ```
  part <'ALT-004'> balanced : CapacityAlternative {
      attribute :>> aircraft = 16; attribute :>> turnaroundChargers = 8;
      attribute :>> waitAtYear2Demand = 8; attribute :>> capitalCost = 12.8;
      attribute :>> capacityRetained = 90; attribute :>> peakMovements = 8;
  }
  calc def <'CRIT-001'> 'Wait at Year-2 demand' {
      in x : Real;
      return value : Real = if x >= 60.0 ? 0.0 else if x <= 5.0 ? 1.0 else (60.0 - x) / 55.0;
  }
  ```
- **Sources.** `aerolink_v04_full.sysml` lines 1284–1337, 1506–1509; `week07.ts`; PX1 p.157 (result expression).

#### S2.6 Worked example V: the evaluation function and the answer to the driving question (3 min)
- **Purpose.** Close the driving question.
- **Content.**
  - DEC-001 is `analysis … : TradeStudy` with subject = the four alternatives, four weight attributes, `objective : MaximizeObjective`, a redefined `evaluationFunction` returning the weighted sum, and `return part :>> selectedAlternative`.
  - **Answer (B).** The model states how the scores are computed; the checker computes nothing (probe record). The scores 0.670 / 0.489 / 0.458 / 0.452 were computed outside the checker (the course's reference test recomputes them) and recorded in the rationale.
  - A trade study in the model is therefore inspectable and re-runnable by a tool that evaluates expressions; it is not self-executing.
- **SysML v2 example** (v0.4 lines 1338–1352, abridged; PASS):
  ```
  analysis <'DEC-001'> 'Year-2 capacity: add aircraft with hub charging' : TradeStudy {
      subject : CapacityAlternative = ('ALT-001', 'ALT-002', 'ALT-003', 'ALT-004');
      attribute waitWeight : Real = 0.40;  attribute capitalWeight : Real = 0.30;
      attribute resilienceWeight : Real = 0.16;  attribute noiseWeight : Real = 0.14;
      objective : MaximizeObjective;
      calc :>> evaluationFunction {
          in part alt :>> alternative : CapacityAlternative;
          return :>> result : Real = waitWeight * 'CRIT-001'(alt.waitAtYear2Demand) + /* … */;
      }
      return part :>> selectedAlternative : CapacityAlternative;
  }
  ```
- **Sources.** v0.4 lines 1338–1352; R75 sl.95; `src/model/reference/reference.detail.test.ts` (recomputation); week13 notes (no evaluation).

#### S2.7 Worked example VI: sensitivity as a second analysis usage (3 min)
- **Purpose.** Model the sensitivity case instead of only describing it.
- **Content.**
  - A sensitivity case is a usage that specializes DEC-001 and redefines one weight (rescaling the others proportionally so they sum to 1, the Week 3 rule).
  - Capital weight 0.50 (above the 0.478 reversal point): ALT-001 should rank first; the expected selection is stated in the doc and checked by hand or tool.
  - The sensitivity usage must **not** carry its own `satisfy` of REQ-STK-004: it explores a judgment, it does not assert a design.
- **SysML v2 example** (needed fragment `aerolink_dec001_sensitivity.sysml`; to be checker-validated):
  ```
  analysis capitalWeightAt050 :> Analysis::'DEC-001' {
      doc /* Sensitivity: capital weight 0.50, others rescaled by 0.50/0.70. Expected selection ALT-001 (computed outside the checker). */
      attribute :>> capitalWeight = 0.50;
      attribute :>> waitWeight = 0.40 * 0.50 / 0.70;
      attribute :>> resilienceWeight = 0.16 * 0.50 / 0.70;
      attribute :>> noiseWeight = 0.14 * 0.50 / 0.70;
  }
  ```
- **Sources.** R18 p.472 (sensitivity to swing weights); `week07.ts` header (rescaling rule, reversal 0.478). Course convention: sensitivity as a specializing usage.

#### S2.8 Document-based versus model-based trade study (2 min)
- **Purpose.** State what the model adds and what it does not.
- **Content.**
  - Adds: criteria traced to MOEs; alternatives tied to the parts and risks they affect; weights and value functions inspectable; re-runnable sensitivity; the decision linked to requirements (DEC-001 affects REQ-STK-004; mitigates R-001).
  - Does not add: better judgment about weights, or computed numbers without a tool that evaluates expressions.
  - Lab requirement: compare your model result with your Phase I result and explain any difference.
- **Figure.** Two-column comparison table.
- **Sources.** v0.4 lines 1657, 1672–1673; R28 p.370 ("single source of truth" as SEBoK's description of a centralized repository).

### Section F: External analysis: the Parametric Analysis panel (10 min)

#### S2.9 The Parametric Analysis panel: what it does (3 min)
- **Purpose.** Introduce the course's external analysis tool.
- **Content.** (faculty decision; course tool description)
  - The panel runs the eVTOL Sizer's own engine, pinned to one commit for the term, inside the course workspace, read-only: no change to the sizer.
  - Course model values (seats, cruise speed, design-trip range, battery assumptions) go in; sizing and mission results come out with the engine's warnings, validation-domain flag and version stamp.
  - Results write TPM current estimates and a VER-003 evidence record with provenance; inputs and thresholds are never overwritten.
  - The exchange uses one JSON contract (`aerolink-sizing@1`).
- **Figure.** Course model → contract parameters → sizer engine (pinned commit) → contract results → TPM-003 estimate + VER-003 evidence; a "provenance" tag on the return arrow.
- **Sources.** DECISION_LOG A10 (faculty); `_source_cache/research/tool_integration_feasibility.md` §3–§4 (rank 1; contract; write-back rule). **Dependency: the panel is not yet built in `learning-studio/src` (grep finds only references in `course.ts` and `week13.ts`); see §9 and §11.**

#### S2.10 Reserve convention and labels (2 min)
- **Purpose.** Prevent two errors: the wrong reserve and the wrong status of a number.
- **Content.**
  - Size with the sizer's 20-minute reserve rule; then **check** AeroLink's 20 % landing-energy reserve (REQ-SYS-003, TPM-003) on the result. The requirement is unchanged. The difference between a time reserve and an energy reserve is itself a teaching point.
  - Every sizer output is labeled "analysis-computed (teaching)" and shown beside the instructor's FICTIONAL baseline; it is never presented as real aircraft data.
  - The panel's TPM-003 estimate may differ from the 23 % baseline; the method does not depend on the number.
- **Figure.** Two-column card: "analysis-computed (teaching)" value | "FICTIONAL baseline" value, with the 20 % threshold line.
- **Sources.** DECISION_LOG A11, A12 (faculty); feasibility study §4.1 (reserve mismatch), §4.2 (TPM-003 transform).

#### S2.11 Recording which tool computed a result (2 min)
- **Purpose.** Show the library support for external analysis tools.
- **Content.**
  - `ToolExecution` metadata identifies an external analysis tool used to implement the annotated action (tool name, URI); `ToolVariable` maps a parameter to the tool's variable name (P13.1 pp.564–565; R78 sl.153).
  - Course convention: the TPM-003 analysis case carries `@ToolExecution` naming the sizer and its pinned commit; the result attribute records "analysis-computed (teaching)".
- **SysML v2 example** (needed fragment `aerolink_tpm003_tool_annotated.sysml`; to be checker-validated):
  ```
  analysis designTripAnalysisSized : Analysis::LandingReserveAnalysis {
      @AnalysisTooling::ToolExecution {
          toolName = "eVTOL Sizer (pinned commit, analysis-computed teaching values)";
          uri = "urn:wsu:sysml-course:aerolink-sizing@1";
      }
      // inputs from the contract request; result written back by the panel
  }
  ```
- **Sources.** P13.1 pp.564–565; R78 sl.153; feasibility study §4 (contract URN).

#### S2.12 Is the analysis credible for this use? (3 min)
- **Purpose.** Graduate-level judgment about external results.
- **Content.**
  - Model verification: does the implementation accurately represent the developer's conceptual description and specification? Validation: to what degree does the model represent the real world for the intended use? Accreditation: official certification that a model is acceptable for a specific purpose (R64 p.477).
  - "Have we built the model right?" versus "have we built the right model?" (R64 p.477).
  - Applied: the sizer's warnings and validation-domain flag are part of the result; VER-003 is inconclusive if the energy model is outside its validated domain (feasibility study §4.2; VER-003's own inconclusive rule).
- **Figure.** Three stacked questions (verified? valid for this use? accepted by whom?) beside the panel's result card.
- **Sources.** R64 p.477; feasibility study §4.2.

### Section G: What-if questions and consistency (13 min)

#### S2.13 Answering a what-if question by traversal (5 min)
- **Purpose.** Teach the impact method the lab uses.
- **Content.**
  - Questions: what if battery range decreases, demand doubles, or a regulation changes?
  - Course convention (no reading prescribes it): start from the changed element; for each link ask whether the element at the other end depends on it (child requirement on parent; both ends of satisfy, allocate, verify, measure, perform; the target of an affects link). Dependents form the first-order set, each with the question the link implies. Upstream elements are reviewed, not traversed.
  - Second order is a decision: only elements whose re-check fails open another hop.
  - The naive "everything within N hops" reach on the reference: 9 / 28 / 63 elements at 1 / 2 / 3 hops from REQ-SYS-001 — large and without actions.
  - After a change, every verification case that reaches the changed requirement goes on the re-run list (R49 p.150, a Week 12 reading).
- **Figure.** Small graph from TPM-003: R-002, REQ-SYS-003 (dependent); MOP-005 (upstream, grey).
- **Sources.** `src/activities/week13/impact.ts` header (course convention; counts asserted in `logic.test.ts`); R49 p.150.

#### S2.14 Worked example VII: battery usable energy 15 % lower (3 min)
- **Purpose.** One what-if answered end to end.
- **Content.** (FICTIONAL; "range decreases" read as 15 % less usable energy, course convention)
  - Re-run the analysis usage with capacity retained 0.92 × 0.85: usable energy 93.84 kWh; landing fraction (93.84 − 85) / 93.84 = 9.4 %; margin −10.6 points (−12.1 worst case): breach; R-002's trigger fires.
  - First order from TPM-003: R-002, REQ-SYS-003; from TECH-002: PHY-001, R-002, REQ-SYS-003, REQ-SYS-007 (upstream A-004).
  - The what-if usage carries no `satisfy`: asserting REQ-SYS-003 on a configuration known to violate it would make the model inconsistent.
- **SysML v2 example** (needed fragment `aerolink_whatif_battery_fade.sysml`; to be checker-validated):
  ```
  analysis batteryFade15 : Analysis::LandingReserveAnalysis {
      doc /* What-if, not a design: usable energy 15 % lower. Expected landing fraction 0.094 (computed outside the checker). No satisfy is asserted. */
      in capacityRetainedEOL = 0.92 * 0.85;
      // other inputs as designTripAnalysis
  }
  ```
- **Sources.** Week 13 earlier draft answer key (what-if values; `margins.ts`); `impact.ts`; R83 p.168.

#### S2.15 Parses, consistent, correct: three claims (3 min)
- **Purpose.** The week's epistemic point.
- **Content.**
  - "The checker accepts it": the text conforms to the language as the tool implements it.
  - "The model is consistent": its facts do not contradict one another (one value per quantity, units of the right kind, statements agree with values, no asserted constraint violated).
  - "The model is correct": it matches the system and stakeholder intent; only verification and validation support that.
  - Seeded fragment: REQ-SYS-001 changed to 18 min and nothing else; six defects; the checker reports two warnings for the duplicated ID only.
  - A renumbered requirement breaks loudly (a dangling reference fails), which is why IDs are never reused.
- **Figure.** Three nested rings: accepted ⊃ consistent ⊃ correct, with the six defects placed.
- **Sources.** `sysml/week13/aerolink_consistency_seeded.sysml` (PASS with 2 warnings, intended); `invalid_dangling_requirement_id.sysml` (FAIL, intended); week13 notes probes c05, c13; R83 p.168.

#### S2.16 Common errors this week (2 min)
- **Content.**
  - Asserting a constraint that is meant to be checked (the model becomes inconsistent).
  - A `satisfy` on a what-if or sensitivity configuration.
  - A literal limit copied into an objective.
  - `kWh` instead of `kW * h`; a power where an energy belongs.
  - Reporting a trade-study score as "computed by the model".
  - A sizer number presented without its "analysis-computed (teaching)" label, warnings or domain flag.
- **Sources.** Instructor-authored from the probe record and A12.

#### S2.17 Bridge to Week 14 (2 min)
- **Content.**
  - Week 14 assembles the coherent enterprise model, adds views for stakeholders and the evolution increment, and is the final review.
  - Your trade study, analysis case and what-if answer are the decision evidence the review panel will ask to see live.
- **Figure.** Week 13 outputs feeding three Week 14 boxes (model, views, review).
- **Sources.** COURSE_SCHEDULE.md.

### Section H: Laboratory launch (22 min)

#### S2.18 Lab 13 brief: what you deliver, and by when (3 min)
- **Content.** Deliverables (§5.5); due before Week 14 Session 1; AeroLink files as the pattern; checker gate (zero errors, warnings explained).
- **Figure.** Deliverable card with four boxes: trade study in the model; sensitivity usage; one analysis case; what-if answer.

#### S2.19 Team work: map your Phase I trade study to model elements (12 min)
- **Content.** Each team fills a mapping table (alternative → part; criterion → calc def with its MOE; weights → attributes; decision → `analysis : TradeStudy`), names the TPM for the analysis case, and assigns owners. Instructor circulates.
- **Figure.** Blank mapping table (the lab template).

#### S2.20 Checkpoint: one-line change statement (5 min)
- **Content.** Each team states its what-if question as "element, value from → to" and the first element it expects to fail its re-check. Instructor approves or redirects (two-sentence feedback per team).

#### S2.21 Close: the next 7 days (2 min)
- **Content.** Day plan (§5.4); quiz and applied exercise windows; where help is.

#### S2.22 References and credits (0 min, generated)

**Session 2 timing.** 2 + 1 (D) + 3 + 3 + 5 + 3 + 3 + 2 (E = 19) + 3 + 2 + 2 + 3 (F = 10) + 5 + 3 + 3 + 2 + 2 (G = 15) = 47 lecture; 3 + 12 + 5 + 2 = 22 lab. **69 min + 6 min buffer = 75.**

## 4. AeroLink worked model example (continues the Phase I Week 3 trade study)

**Phase I starting point.** The Week 3 reference trade study (S04 Lab 11 decision "additional aircraft vs additional vertiports"): A-006, CRIT-001..004, ALT-001..004, DEC-001, with sensitivity and conditions (`src/model/reference/week07.ts`, OLD numbering), the TPMs from the Week 2 measures layer (`week05.ts`), and TECH/AROU from Week 3 (`week06.ts`). **Model starting point.** `sysml/reference/aerolink_v04_full.sysml` packages `Measures` (TPM-001..003) and `Analysis` (TECH, ALT, CRIT, DEC-001, DEC-002).

**Worked sequence.** (1) TPM-003 analysis case (S1.19–S1.21); (2) constraint versus assert on the baseline (S1.11–S1.12); (3) DEC-001 as a TradeStudy (S2.5–S2.6); (4) sensitivity usage (S2.7); (5) panel-annotated analysis (S2.11); (6) battery what-if (S2.14); (7) consistency review of the seeded change (S2.15).

### 4.1 Existing fragments (reuse)

| Path (under `learning-studio/`) | What it shows | Checker status |
|---|---|---|
| `sysml/reference/aerolink_v04_full.sysml` (packages `Measures`, `Analysis`, `Traceability`) | TPM-001..003 with threshold, objective, estimate, margin; ALT parts; CRIT calc defs; DEC-001 `TradeStudy`; DEC-002; CRIT → MOE, DEC affects/mitigates | PASS in the 2026-10-11 checker run (0 errors, 0 warnings) |
| `sysml/week13/aerolink_tpm003_landing_reserve_analysis.sysml` | Calc defs, analysis def with assume/require objective, usage bound to REQ-SYS-003, TPM-003 margin as an expression, satisfy | PASS in the 2026-10-11 checker run |
| `sysml/week13/aerolink_consistency_seeded.sysml` | REQ-SYS-001 changed to 18 min only; six seeded defects | PASS in the 2026-10-11 checker run (2 warnings, intended) |
| `sysml/week13/invalid_dangling_requirement_id.sysml` | Satisfy names a renumbered requirement | FAIL in the 2026-10-11 checker run (intended) |
| `sysml/week13/aerolink_r002_risk_causation.sysml` | Risk metadata and causation (Week 12 content; used here only as an impact target) | PASS in the 2026-10-11 checker run |
| `sysml/week05/aerolink_tpm.sysml` | TPM as typed attributes with margin expression | PASS in the 2026-10-11 checker run |

### 4.2 Needed fragments (proposed path `learning-studio/sysml/lectures/week13/`)

| Proposed file | Must show | Slide |
|---|---|---|
| `aerolink_dec001_trade_study.sysml` | Self-contained extract of v0.4 `Analysis` (CapacityAlternative, ALT-001..004, CRIT-001..004, DEC-001) short enough for a slide; the checker validates each file in isolation, so it cannot import v0.4 | S2.5–S2.6 |
| `aerolink_dec001_sensitivity.sysml` | DEC-001 extract plus a specializing analysis usage that redefines the four weights (capital 0.50, others rescaled); doc states the expected selection ALT-001 computed outside the checker; no satisfy | S2.7 |
| `aerolink_constraint_vs_assert.sysml` | `constraint def CapacityMeetsTarget`; a constraint usage on ALT-001 (violated, model consistent); a commented `assert constraint` variant with the explanation that it would make the model inconsistent | S1.11–S1.12 |
| `aerolink_tpm003_tool_annotated.sysml` | The TPM-003 analysis usage annotated with `AnalysisTooling::ToolExecution` and `ToolVariable` on two inputs; result labeled "analysis-computed (teaching)"; depends on the panel's pinned commit and contract (values **proposed, instructor to confirm** once the panel runs) | S2.11 |
| `aerolink_whatif_battery_fade.sysml` | A second usage of `LandingReserveAnalysis` with capacity retained 0.92 × 0.85; doc states the expected 9.4 %; no satisfy | S2.14 |
| `invalid_maximise_objective.sysml` | Teaching listing: `objective : MaximiseObjective;` (British spelling); expected to FAIL because the name does not resolve (to be confirmed by one checker run) | S2.16 (optional) |

All six must be run once through the checker before use (one JVM at a time; `tasklist` check first), and `sysmlDrift.test.ts`-style checks should confirm the extracts match v0.4.

## 5. Laboratory outline: Lab 13, the team's trade study and analysis in the model

### 5.1 Inputs
- The team's Phase I Week 3 trade study (decision statement, alternatives, criteria with their measures of effectiveness, value functions, swing weights, scores, sensitivity, recommendation) from the Systems Thinking Engineering Package (Week 7).
- The team's SysML v2 model through Week 12 (requirements, structure, behavior, verification cases, measures, AROU metadata), its last checker log and its baseline tag.
- One TPM from the team's Week 2 measures with threshold, objective, current estimate and contingency.
- This week's slides and lesson; the AeroLink fragments in §4; the margin what-if analyser and impact explorer activities; the Parametric Analysis panel if it is available (AeroLink-only tool; teams whose enterprise is not an air-taxi service use their own calculation).
- Readings: R75 sl.92–95; R84 pp.170–173; PX4 sl.76–84 (selected); R18 pp.465–466, 469, 472 (recap).

### 5.2 Objectives
B13.1–B13.5 applied to the team's own enterprise.

### 5.3 Method
1. **Map** the Phase I trade study to model elements (alternatives → parts of one alternative definition; criteria → `calc def` value functions with `#derivesFrom` to their MOE; weights → attributes; decision → `analysis : TradeStudy` with `MaximizeObjective` or `MinimizeObjective`).
2. **Compute** the scores outside the checker (spreadsheet, script, or the panel for AeroLink-type sizing), record them in `@Rationale`, and compare with the Phase I result.
3. **Sensitivity**: one specializing usage that moves the most influential weight past its reversal point; state the expected selection.
4. **Analysis case** for the chosen TPM: subject, objective with assumptions and a requirement bound to the requirement's own attribute, inputs with units, return; the TPM margin as an expression.
5. **Constraint discipline**: at least one constraint usage that may be violated and at least one asserted constraint (a physical or definitional law), each with a one-line reason.
6. **What-if**: one question (battery/performance degradation, demand change, regulation change, or an approved alternative), stated as "element, value from → to"; first-order set with a re-check result per element; second order only from must-change elements; verification re-run list.
7. **Consistency review** of every fragment changed this week; checker run (zero errors, warnings explained).
8. **AI activity** (optional, from the official lab note): an AI tool proposes additional alternatives; the team keeps or rejects each with a reason and tags kept ones AI-suggested-reviewed.

### 5.4 Procedure

| Step | When | Lead role | Output |
|---|---|---|---|
| 1. Mapping table | In class, S2.19 (12 min) | Architecture | Mapping table |
| 2. Change statement approved | In class, S2.20 | V&V | One-line what-if |
| 3. Trade study in the model; scores computed and compared | Day 1–2 | Requirements & Compliance | `Analysis` package, comparison note |
| 4. Sensitivity usage | Day 2 | R&C | Sensitivity usage and expected selection |
| 5. TPM analysis case | Day 2–3 | Architecture | Analysis def and usage; margin expression |
| 6. Constraint and assert examples | Day 3 | Architecture | Two annotated constraints |
| 7. What-if: impact table, re-run list, risk re-check | Day 4–5 | V&V | Impact table |
| 8. Optional AI alternatives | Day 5 | AI & Data | Kept/rejected list |
| 9. Consistency review and checker run | Day 6 | V&V | Review findings; checker log |
| 10. Integration, export, upload | Day 7 | V&V | Submission |

### 5.5 Outputs
- `team-NN-week13-model.sysml` (or the team's package files) with the `Analysis` package, sensitivity usage, TPM analysis case and constraints.
- `team-NN-week13-analysis.md`: mapping table; score comparison (Phase I vs model, with an explanation of any difference); sensitivity result; analysis-case explanation (what is computed where); what-if impact table with method; consistency findings; checker log summary; AI usage statement.

### 5.6 Rubric rows (from ASSESSMENT_RUBRICS.md)

| Row | Criterion | Applied this week |
|---|---|---|
| RB-6.2 | Criteria | Criteria traced to MOEs in the model (`#derivesFrom`) |
| RB-6.4 | Computation | Scores reproducible from the model's value functions and weights; units normalized |
| RB-6.5 | Sensitivity | Sensitivity usage with the rank-reversal point |
| RB-6.6 | Recommendation | Model result compared with Phase I; conditions and what would change it |
| RB-8.1 | Validity | Checker: zero errors; warnings explained (gate per §0 safeguard 5) |
| RB-8.3 | Structure semantics | Quantities with units; definitions vs usages in the analysis package |
| RB-8.4 | Requirements semantics | Objective bound to the requirement's attribute; no `satisfy` on what-if or sensitivity configurations |
| RB-9.5 | Impact analysis | What-if impact set by traversal, method shown, second-order effects, verification consequences, recommendation |
| RB-12.1–12.3 | AI usage statement | Including any AI-proposed alternatives, individually reviewed |

**Grading mode.** Formative now; RB-8 and RB-9.5 rows are scored summatively on the final model in Week 14 (faculty to confirm).

### 5.7 Workload (budget 8.0 h per student)

| Activity | Hours | Basis |
|---|---|---|
| Class sessions (2 × 75 min) | 2.5 | Timetable |
| Readings: R75 sl.92–95, PX4 sl.76–84 (13 slides at about 30 slides/h); R84 pp.170–173, R18 pp.465–466, 469, 472 (8 pp at about 15 pp/h) | 1.0 | Register page counts |
| Lesson review and worked examples | 0.5 | Long-form lesson of about 3,500 words |
| Lab 13 out of class (team share; team of 4, about 10.5 team-hours: trade study and comparison 3; sensitivity 1; analysis case 2.5; constraints 0.5; what-if 2; review, checker and integration 1.5) | 2.6 | Procedure §5.4 |
| Quiz Q13 (§6.1) | 0.3 | 12 items |
| Applied exercise (§6.2) | 0.7 | 40 min plus upload |
| Time log and notebook entry | 0.1 | |
| **Total** | **7.7** | Within budget. Graduate part 6 of the exercise adds 0.3 h (8.0 h) |

Notes: (a) the earlier draft's commit-based change analysis (R88) becomes optional extension reading; (b) teams of 3 drop step 6 to one asserted constraint and omit step 8 (about 8.3 h otherwise); (c) the estimate must be checked against logged hours.

## 6. Assessment outline (separate from the lecture)

No item reuses slide wording, the warm-up or AeroLink values; contexts are unseen.

### 6.1 Quiz Q13 (individual, 15 min, closed book, 12 items)
Format: 9 single-best-answer items (keys balanced across positions; distractors from S2.16; no key longer than its distractors) and 3 short answers (≤ 40 words).

| # | Objective | Bloom | Item focus (unseen context) | Key source |
|---|---|---|---|---|
| 1 | B13.1 | Understand | Which element has an implicit Boolean result: calc, constraint, action, attribute? (bridge-load example) | PX1 p.157 |
| 2 | B13.1 | Analyze | A pump model: a constraint "flow ≥ 40 L/min" is false for one configuration. Is the model inconsistent? Then the same with `assert` | PX1 p.158; PX4 sl.79, 81 |
| 3 | B13.1 | Apply | Spot the binding versus equality error in a two-line fragment | PX4 sl.83 |
| 4 | B13.2 | Understand | For an analysis case, what is the subject of the objective bound to? | R84 p.172 |
| 5 | B13.2 | Apply | Which declaration makes a configuration asserted to satisfy a requirement in an analysis context? | R75 sl.94; R83 p.168 |
| 6 | B13.2 | Analyze | Three ways an analysis case can be performed: match each to a described tool chain | R84 p.170 |
| 7 | B13.3 | Understand | What must a `TradeStudy` usage bind and redefine? | PX6 pp.572–573 |
| 8 | B13.3 | Analyze | Weights 0.5/0.3/0.2 and given values: which alternative a `MaximizeObjective` selects, computed by hand | R18 p.469; PX6 p.571 |
| 9 | B13.5 | Evaluate | A file passes the checker with a unitless value bound to a duration and a reversed objective. Which claim is justified? | Probe record (a05, c04); R83 p.168 |
| 10 (SA) | B13.4 | Evaluate | Distinguish model verification from model validation for a supplied traffic simulation | R64 p.477 |
| 11 (SA) | B13.5 | Apply | Given a 6-element link list, give the first-order set for a changed requirement and one element that is only reviewed | Course convention (stated in the item) |
| 12 (SA) | B13.2 | Apply | Compute a margin from threshold, estimate and contingency and say what the margin is for | R44 p.117 |

Scoring: items 1–9 one point; 10–12 two points; total 15.

### 6.2 Applied exercise (individual, about 40 min, open book, unseen case)
- **Case** (about 300 words, FICTIONAL, instructor-authored): a university district-heating upgrade choosing among three alternatives (boiler replacement, heat-pump plant, hybrid) on three criteria (lifecycle cost, carbon, supply resilience) with given scores, linear value functions, swing points and one requirement (peak supply ≥ a stated MW).
- **Tasks.**
  1. Write the alternative definition and one alternative as a part (B13.3).
  2. Write two criteria as `calc def` value functions and the `TradeStudy` usage with its objective (B13.3).
  3. Compute the three scores and the selection by hand; find the cost weight at which the ranking reverses (B13.3).
  4. Write one constraint that may be violated and one assertion, and state why each is one or the other (B13.1).
  5. State in three sentences what the checker would and would not confirm about your fragment (B13.5).
  6. *(Graduate)* A vendor offers a plant-simulation result for the carbon criterion: give the verification, validation and accreditation questions you would ask before using it (B13.4; R64 p.477).
- **Rubric** (4 levels; 20 points; 24 for graduate students).

| Criterion | 4 | 3 | 2 | 1 |
|---|---|---|---|---|
| Model elements (tasks 1–2) | Correct definition/usage, value functions as calcs, objective and subject bound | One construct slip | Trade study as plain attributes | Missing |
| Computation and sensitivity (task 3) | Correct scores, selection and reversal point | Minor arithmetic slip not changing rank | Rank wrong or no reversal | Missing |
| Constraint vs assertion (task 4) | Correct, with consequence for consistency | Correct, reason thin | Confused | Missing |
| Checker scope (task 5) | Accepted / consistent / correct distinguished | Two of three | PASS treated as correctness | Missing |
| *(Graduate)* Credibility (task 6) | V, V and A questions specific to the intended use | Generic | V/V confused | Missing |

- The instructor computes and checks the key when the case is written. Submission through the LMS before Week 14 Session 1.

### 6.3 Practical model examination (placement decision for faculty)
The earlier plan held the practical model examination (RB-14, 75 min, supervised, closed-AI, two model variants) in Week 13 Session 2. Under the new schedule Week 13 carries new content and the lab launch. **Recommendation:** hold RB-14 in the final-examination period after Week 14, so that Weeks 13–14 keep their teaching and review roles. Alternatives: (a) Week 13 Session 2, as before, with Session 2 content compressed into Session 1 and the lab launched asynchronously; (b) Week 14 Session 1, displacing the review lecture. RB-14 T4 (impact) and T2 (semantics, including "satisfy asserts") use this week's method directly.

## 7. Continuity link to the Phase I artifact

- **Phase I artifact modeled.** Week 3's trade study with a justified decision (and the TPMs of Week 2 that the analysis case updates). COURSE_SCHEDULE.md rule 6: Week 13 ↔ Week 3.
- **Official lab mapping.** The official weekly lab note's Lab 11 "Trade Studies and Decision Support" (evaluate additional aircraft vs additional vertiports, or another approved decision; AI generates additional alternatives; submission: model-based trade study and decision recommendation) and Lab 13 "Model Query and Impact Analysis" (battery range, demand doubling, regulation change; submission: impact analysis report and model query results).
- **Element map.** Phase I trade-study row → model element: alternative → part; criterion → calc def + `#derivesFrom` MOE; weight → attribute; recommendation → `analysis : TradeStudy` + `@Rationale` + `#affectedBy` (written from each affected element to the decision: `from <affected element> to <DEC>`) / `#mitigates` (from the mitigation to the risk); sensitivity → specializing usage; TPM estimate → analysis-case result.
- **Forward link.** Week 14's final review asks for the decision and one what-if answer live (RB-11.2, RB-11.3).

## 8. Section transitions (summary)

| From → to | Transition line |
|---|---|
| S1 A → B | To put the decision in the model we need an element that computes and one that states a condition |
| B → C | An analysis case packages computing and constraining around a subject and an objective |
| C → exit | Retrieval; bring the trade-study table and one TPM |
| S2 D → E | The trade study is an analysis case whose result is a selected alternative |
| E → F | Somebody must compute the numbers: an external tool, and how far to trust it |
| F → G | With computed results in the model, ask what-if questions and check consistency |
| G → H | Now your team does the same with its own trade study |

## 9. Source gaps and risks

1. **Parametric Analysis panel not built.** No panel code exists in `learning-studio/src`; only references in `course.ts` and the earlier Week 13 module. The feasibility study estimates 4–7 days and depends on choosing a sizer commit to pin. S2.9–S2.11 and `aerolink_tpm003_tool_annotated.sysml` depend on it. **Fallback:** teach S2.9–S2.12 from the design (feasibility §3–§4) and use the existing margin what-if analyser (`src/activities/week13/margins.ts`, labeled "analysis-computed (teaching)") for numbers.
2. **The checker evaluates no expression.** No source in the collection gives a tool that computes `TradeStudy` results; the reference scores come from a TypeScript test. The course must say who computed every number.
3. **Open specification issue.** S06 p.571 carries "SYSML21-318: Diamond inheritance problem with TradeStudy" inline; the library is Beta 2 material and may change.
4. **Checker facts are one release.** All checker behavior cited is from the 2026-10-11 probe runs of release 2026-08; nothing new was run for this outline (no concurrent validator runs).
5. **Impact method and TPM status rules are course conventions**, not from the readings; they must stay labeled.
6. **SEBoK figures restricted.** R18 Figures 3–4 are third-party with permission notes; draw originals only.
7. **No source for model-credibility in SysML terms.** R64 (MITRE, 2014) gives VV&A definitions only; no SysML v2 construct records accreditation.
8. **Week 1 case changes** (STK-015, NEED-012..017) do not touch this week's elements, but if adopted, Week 3's objective for the evening noise cap (CRIT-004 basis) may change the trade study.

## 10. Register additions needed

Verified in the extracted text for this outline; none is in `readings.py` yet.

| Placeholder | Source, PDF pages | First-page title (verified) | Supports |
|---|---|---|---|
| **PX1** | S06 pp.154–161 | "7.19 Calculations" (heading on p.154; runs through 7.20 Constraints) | S1.9–S1.12; quiz 1–2 |
| **PX4** | S10 sl.72–85 | "Expressions and Feature Values" (to "Time Constraints") | S1.7–S1.13; quiz 2–3 |
| **PX6** | S06 pp.570–573 | "9.4.5 Trade Studies" (heading on p.570) | S2.4; quiz 7–8 |
| **P13.1** | S06 pp.564–565 | "9.4 Analysis Domain Library" (9.4.1 overview and 9.4.2 Analysis Tooling: ToolExecution, ToolVariable) | S2.11 |

Notes. (a) S06 p.169 (7.22 Cases) lies inside R83's range (161–169) although R83 is titled "7.21 Requirements"; R84 starts at p.170. Either extend R84 to 169–177 or cite p.169 under R83 (faculty/author choice). (b) R86's range (558–574) already contains 9.4.2 and 9.4.5 under the title "9.3.3 Risk Metadata"; PX6 and P13.1 give accurate titles. (c) Existing entries used: R18, R34, R43, R44, R49 (p.150), R64, R74, R75, R78 (sl.152–153), R79, R83, R84, R28.
**Week 13 essential readings (proposed):** R75 sl.92–95; R84 pp.170–173; PX4 sl.76–84; PX6 pp.571–573. **Extension:** PX1 pp.154–161; P13.1; R64 pp.475–478; R88 pp.33–36 (optional).

## 11. Open items for faculty

1. Practical model examination placement (§6.3); recommendation: final-examination period.
2. Whether the Parametric Analysis panel is built before Week 13 (dependency, §9.1), and which sizer commit is pinned.
3. Whether teams with non-air-taxi enterprises may use their own calculation tool in place of the panel (proposed: yes, with provenance recorded the same way).
4. Approve PX1, PX4, PX6, P13.1, and the R83/R84 boundary note.
5. Approve the RB-6 rows for a model-based trade study and the summative scoring of RB-8/RB-9.5 at the Week 14 final model.
6. Approve objective codes B13.1–B13.5 and the graduate credibility task.
