# Week 10 Lecture Outline: Logical / Behavioral Modeling

**Status.** Draft for faculty approval (COURSE_PRODUCTION_PLAN M2, outlines for Weeks 2–14). Written 2026-10-19. Nothing in `src/` was changed; no `.sysml` file was created; the checker was not run for this outline.
**Governing documents.** DECISION_LOG A19 and A20; COURSE_SCHEDULE.md (Week 10 subject, exact; instructional rule 6: Week 10 ↔ Weeks 2 and 4); COURSE_PRODUCTION_PLAN.md; the Week 1 template (`../week01/WEEK1_LECTURE_OUTLINE.md`) and its review lessons (`../week01/REVIEW_DISPOSITIONS.md`).
**Format.** Two sessions of 75 minutes each.
- Session 1 is all lecture: 23 slides, 69 min, plus a 6-min buffer and a generated "References and credits" slide (0 min).
- Session 2 is 47 min of lecture (18 slides) and 22 min of laboratory launch (4 slides), plus the 6-min buffer and the references slide.
- Total: 45 content slides + 2 generated references slides.

## 0. Conventions used in this outline

- **Citations.** `R72 sl.38` = verified register entry R72, slide 38 of the SysML v2 textual-notation training deck (Release 2026-08). `R82 p.146` = PDF page 146 of the SysML v2.1 Beta 2 (Release 2026-07) specification text, Part 1 (convention W4: never "the standard"). `R20b p.594` = SEBoK PDF page (W1). `PX2`, `PX5` = shared proposed register additions; `P10.n` = proposed additions specific to this week (§10). Every citation was opened in `_source_cache/*.txt` for this outline with the page helper; a citation supports only what is written beside it.
- **Reuse.** The reviewed earlier behavior module (old numbering Week 11: `git show HEAD:learning-studio/src/content/weeks/week11.ts`, `docs/authoring/week11_notes.md`) and the earlier architecture outline (old Week 8 in `src/content/draftWeeks.ts`) are the base. The uncommitted edits to the old Week 11 activity files were ignored. Course probes of checker behavior recorded in that module (release 2026-08, 2026-10-11) are quoted as recorded results, not re-run.
- **Course convention** marks content the sources do not supply, taught as the course's choice.
- **AeroLink** values and IDs are FICTIONAL and come from `sysml/reference/aerolink_v02_req_structure.sysml`, `aerolink_v03_behavior.sysml` and `src/model/reference/week03.ts` (scenarios) and `week08.ts` (FN, LOG, INFO; old numbering). Anything not yet in those files is marked **(proposed, instructor to confirm)**.
- **Faculty notes** (written later in the lecture source) are spoken at ≤ 130 words per minute; every slide's minutes below are the budget the notes must fit.
- **Student-facing text** (slide faces, lesson, lab brief) contains no internal IDs: no decision-log or faculty-register numbers, no "old Week N", no source-inventory codes, no objective codes and no P-numbers. Those appear only in the Sources lines and the faculty sections of this outline.
- **Two rules that hold all week.** (1) A checker PASS means the file parses, resolves and passes the pilot's validation rules; it does not mean the behavior is consistent with the ConOps. (2) A `satisfy` usage asserts satisfaction (R83 p.168); this week adds no `satisfy`, but the behavior–structure links (`perform`, `exhibit`, `do`) are likewise assertions about the design, not evidence.

## 1. Learning objectives (graduate level)

| ID | Objective | Bloom | Taught in |
|---|---|---|---|
| B10.1 | Explain the logical architecture as functional, behavioral and temporal views of the system of interest, and model functions as action usages with input and output items performed by logical elements | Understand / Apply | S1.5–S1.11 |
| B10.2 | Model a ConOps scenario as an action flow: successions, at least one decision with guarded branches and `else`, merges, a fork/join where the ConOps has concurrency, and an item flow | Apply | S1.12–S1.20 |
| B10.3 | Model an operating-state definition with an initial state in the current form, transitions with triggers and guards, and entry/do actions; distinguish a function from an operational mode | Apply | S2.2–S2.9 |
| B10.4 | Model the scenarios as use cases with subject, actors and objective, and use `include` correctly | Apply | S2.10–S2.12 |
| B10.5 | Evaluate behavior against the ConOps and against structure (`perform`, `exhibit`, `do`, subsetting), separating what the checker confirms from what a reviewer must confirm | Evaluate | S1.21, S2.13–S2.17 |
| Graduate | Build an interaction view of one scenario step that crosses an organizational boundary, and state what it asserts about ordering that the action flow does not | Analyze / Create | S2.14; lab extension |

## 2. Session 1: From functions to action flows (75 min, all lecture)

**Design rationale.** Session 1 rebuilds the Week 4 functional decomposition as a logical architecture, then teaches the action-flow notation on the scenario the class already knows (SCN-002). The SEBoK pitfalls (S1.8) are the frame for every modeling choice that follows: scenarios before a static tree, inputs and outputs with every function.

### Section A: Framing (9 min)

#### S1.1 Week 10 at a glance (2 min)
- **Purpose.** Orient: subject, two sessions, outputs.
- **Content.**
  - Subject exactly as scheduled: *Logical / Behavioral Modeling*.
  - Session 1: logical architecture and action flows. Session 2: states, use cases, consistency checks, lab launch.
  - The week adds to the team model: functions with their inputs and outputs, one scenario as an action flow, one operating-state definition, the scenarios as use cases, and the links from behavior to structure.
- **Figure.** The course model strip (Context · Stakeholders · Needs · Requirements · **Logical** · Physical · **Behavior** · Verification), Logical and Behavior highlighted; a dashed arrow from "Weeks 2 and 4 package" into them.
- **Sources.** COURSE_SCHEDULE.md (subject and team output). Course convention (package names, from `sysml/reference/README.md` §2).

#### S1.2 The driving question: the checker says PASS. Does the flight happen? (3 min)
- **Purpose.** Create the need to know: a well-formed flow can still be wrong.
- **Content.**
  - Show a seven-line dispatch decision (unseen, non-AeroLink: a hospital patient-transfer dispatch) whose three guards leave a band of values uncovered and has no `else`.
  - Vote: (A) the flow always continues; (B) for some inputs no successor is possible; (C) the checker would reject it; (D) cannot tell.
  - The answer is withheld until S1.15.
- **Figure.** The listing beside a number line with the three guarded ranges shaded and one gap unshaded (gap not labeled until the reveal).
- **Example (to be checker-validated, new fragment `teaching_guard_gap.sysml`, §4.2).** `then decide triage; if score >= 8 then dispatchCritical; if score >= 4 and score < 8 then dispatchUrgent; if score < 3 then scheduleRoutine;`
- **Sources.** R72 sl.35 (a conditional succession whose guard is false is not possible), sl.38 (a decision chooses exactly one successor). Recorded course probe: a `decide` whose guards do not cover every case passes the checker with no message (old Week 11 module, probe table).

#### S1.3 What Week 10 models from your Phase I package (2 min)
- **Purpose.** State the continuity rule explicitly.
- **Content.**
  - From the Week 2 ConOps: the operational scenarios (steps, actors, alternates, end states) become use cases and action flows.
  - From the Week 4 architecture description: the functional decomposition becomes function action usages; the logical elements become logical parts; the information view's items become the inputs and outputs of functions.
  - Week 11 then places these on physical parts, ports and interfaces.
- **Figure.** Two Phase I documents on the left (ConOps scenario table; functional decomposition and information table), arrows to the Behavior and Logical packages on the right, labels "SCN → use case + action flow", "FN → action usage", "LOG → part", "INFO → item def / action parameter".
- **Sources.** COURSE_SCHEDULE.md rule 6. Course convention (element realizations: `sysml/reference/README.md` §3.2).

#### S1.4 Where AeroLink stands: the model after Week 9 (2 min)
- **Purpose.** Re-enter the worked example at its current state.
- **Content.**
  - The model already holds stakeholders and concerns (Week 8) and needs and requirements (Week 9).
  - Present from the Week 4 architecture: 14 functions FN-001..014, 7 logical elements LOG-001..007, 2 AI-enabled capabilities AI-001..002, 5 information items INFO-001..005; 5 scenarios SCN-001..005 from the Week 2 ConOps.
  - Today: SCN-002 Passenger Transport Mission becomes a flow; the aircraft's operating states become a state definition.
- **Figure.** A model-browser tree (Logical: FN list, `logicalArchitecture` with LOG and AI parts; Behavior: five use cases), with counts. FICTIONAL.
- **Sources.** `sysml/reference/aerolink_v02_req_structure.sysml` (Logical package) and `aerolink_v03_behavior.sysml` (Behavior package); `src/model/reference/week03.ts`, `week08.ts`.

**Transition A → B.** "Before we draw a single flow, we need to agree what a logical architecture is and what goes into it."

### Section B: The logical architecture (19 min)

#### S1.5 Logical architecture: three views of how the system should operate (3 min)
- **Purpose.** Give the SEBoK frame at graduate depth.
- **Content.**
  - Purpose of logical architecture model development: elaborate models and views of the functionality and behavior of the future system as it should operate in service (R20b p.587).
  - It may include a **functional**, a **behavioral** and a **temporal** architecture view (R20b p.587).
  - "Logical architecture" is a contraction of "logical view of the system architecture" (R20b p.587).
  - Outputs include the views and a traceability matrix between logical elements and system requirements (R20b p.591).
- **Figure.** Three overlapping panels: functional (function tree with I/O), behavioral (scenario of functions with control flows), temporal (functions grouped by execution frequency). Original drawing.
- **Sources.** R20b pp.587, 591.

#### S1.6 Functions and input–output flows (3 min)
- **Purpose.** Make "function" precise before modeling it.
- **Content.**
  - A function is an action that transforms inputs and generates outputs (data, materials or energy); inputs and outputs are the flow items exchanged between functions (R20b p.587).
  - Two kinds: functions deduced directly from functional and interface requirements, and functions derived from physical-architecture alternatives that depend on the design (R20b p.587).
  - A static functional hierarchy alone does not show how flows are exchanged (R20b p.587).
- **Figure.** AeroLink FN-001 Accept ride request → FN-002 Match request to aircraft → FN-011 Dispatch aircraft, each box with labeled input and output items (ride request, confirmed booking, assignment). FICTIONAL.
- **Sources.** R20b p.587. AeroLink FN names: `aerolink_v02_req_structure.sysml` (Logical).

#### S1.7 The behavioral view: scenarios of functions and control flows (3 min)
- **Purpose.** Connect logical architecture to the Week 2 ConOps.
- **Content.**
  - A behavioral architecture arranges functions and interfaces to define execution sequencing, conditions for control or data flow, and performance (R20b p.588).
  - A control flow (trigger) activates a function as a condition of its execution (R20b p.588).
  - A scenario of functions is a chain of functions performed in sequence and synchronized by control flows (R20b p.588).
  - SEBoK: the logical architecture should relate back to the operational scenarios produced by mission analysis (R20b p.594, pitfalls table).
- **Figure.** SCN-002's seven ConOps steps above a chain of FN boxes, with control-flow arrows between them and the ANSP acceptance as a trigger.
- **Sources.** R20b pp.588, 594.

#### S1.8 Pitfalls and proven practices (3 min)
- **Purpose.** Give the review criteria students will be graded against before they model.
- **Content.** From SEBoK's two tables (R20b p.594):
  - Pitfalls: decomposition too deep; functions without their inputs and outputs; a static decomposition only (it should be established once scenarios exist); mixing governance, management and operation.
  - Practices: constitute scenarios of functions before a decomposition tree; small cycles of analysis and synthesis; alternate functional and behavioral views (a function "to move" and its mode "moving"); build a scenario in the order control flow → input/output flows → triggers.
- **Figure.** Two-column checklist card; the "alternate views" practice is drawn as "FN-005 Fly passenger trip ↔ state inFlight", foreshadowing Session 2.
- **Sources.** R20b p.594.

#### S1.9 Capabilities and functions in the model (3 min)
- **Purpose.** Show where the Phase I capabilities sit relative to functions.
- **Content.**
  - **Course convention.** A capability (CAP) is modeled as an `action def` (an ability to perform); functions (FN) are `action` usages in the Logical package; each FN records its derivation from a CAP with a `#derivesFrom` dependency.
  - Why a usage for FN: `perform` and `allocate` must reference a feature, so functions are usages that logical parts perform and (Week 11) are allocated to physical parts.
  - Alternative the team may justify: typing an FN by a CAP definition. The course does not, because a capability is broader than one function.
- **Figure.** CAP-003 Fleet charging management (action def) with a dotted `#derivesFrom` from FN-006 Charge aircraft and FN-007 Control vertiport charging power. FICTIONAL.
- **Example (excerpt of existing reference, PASS).** `action def <'CAP-003'> 'Fleet charging management' { doc /* … */ }` and `action <'FN-006'> 'Charge aircraft' { doc /* … */ }`.
- **Sources.** `sysml/reference/README.md` §3.2 (CAP and FN rows); R72 sl.30 (action definition vs action usage). Course convention.

#### S1.10 Logical elements perform functions (4 min)
- **Purpose.** Introduce `perform` and the logical architecture part.
- **Content.**
  - `perform` identifies the owner as the performer of an action defined elsewhere; the shorthand names the performed action without renaming it (R72 sl.41).
  - AeroLink: LOG-001 Flight Operations performs FN-003, FN-005, FN-012; LOG-005 Scheduling performs FN-002 and FN-011; AI-001 Predictive maintenance also performs FN-008 (two performers of one function).
  - Logical elements carry no physical names: "Scheduling", not "dispatch server" (rubric RB-7.2 wording, carried from Week 4).
  - Reading check: what does a function performed by two parts assert? (Both are performers; the model does not say who does which part of it until it is decomposed.) Instructor reasoning from sl.41.
- **Example (excerpt of existing reference, PASS).**
  ```
  part <'LOG-001'> flightOperations : FlightOperations {
      perform Logical::'FN-003';
      perform Logical::'FN-005';
      perform Logical::'FN-012';
  }
  ```
- **Figure.** LOG parts as swim-lane headers with performed FN boxes under each; AI-001 and LOG-003 both pointing to FN-008.
- **Sources.** R72 sl.41; `aerolink_v02_req_structure.sysml` lines in `Logical::logicalArchitecture`. RB-7.2 (ASSESSMENT_RUBRICS.md).

**Transition B → C.** "We know which functions exist and who performs them. Now we say in what order they happen, and on what conditions."

### Section C: Action flows (31 min)

#### S1.11 Action definitions, usages and parameters (3 min)
- **Purpose.** The core notation.
- **Content.**
  - An action definition defines an action to be performed; its directed features (`in`, `out`) are parameters; an action is a usage of an action definition in a context; a flow transfers items from one action's output to another's input (R72 sl.30).
  - Week 4's information items become the item types of those parameters: an `item def` per information item (course convention; Week 11 puts the same items on ports).
- **Example (to be checker-validated; new fragment `aerolink_logical_functions.sysml`, §4.2).**
  ```
  item def RideRequest;  item def ConfirmedBooking;
  action def AcceptRideRequest { in request : RideRequest; out booking : ConfirmedBooking; }
  action def MatchRequestToAircraft { in booking : ConfirmedBooking; out assignment : AircraftAssignment; }
  ```
- **Figure.** The S10 action-definition pattern redrawn with AeroLink names (original drawing).
- **Sources.** R72 sl.30. Course convention (INFO as item defs: `sysml/reference/README.md` §3.2, INFO row).

#### S1.12 Successions and succession flows (3 min)
- **Purpose.** Separate ordering from transfer.
- **Content.**
  - A succession asserts that the first action must complete before the second can begin (R72 sl.31).
  - A succession flow: the first action must finish producing its output before the second can begin consuming it (R72 sl.32).
  - A plain flow transfers items but, on its own, the flow is not a succession (contrast sl.30 with sl.31–32; instructor reading).
- **Figure.** Three small diagrams: flow only; succession only; succession flow (solid arrow with item). AeroLink labels.
- **Sources.** R72 sl.30–32.

#### S1.13 Shorthands: `then` and decomposition (2 min)
- **Purpose.** Read real listings fluently.
- **Content.**
  - `then` after an action is shorthand for a succession from the lexically previous action (R72 sl.33).
  - An action usage can be decomposed directly into other actions (R72 sl.34).
  - Lexical order alone asserts nothing; only successions (including `then`) order actions (instructor reading of sl.31, sl.33; tested in the old Week 11 quiz, item 3).
- **Sources.** R72 sl.33–34.

#### S1.14 Choices: conditional successions, decisions and merges (4 min)
- **Purpose.** The constructs every ConOps alternate needs.
- **Content.**
  - A conditional succession: the second action follows only if the guard is true; if false, the succession is not possible (R72 sl.35). Shorthand form after the lexically previous action (sl.36).
  - A decision node (`decide`) chooses exactly one successor and is typically followed by conditional successions; a merge node waits for exactly one predecessor; `start` and `done` refer to the start and end of the containing action (R72 sl.37–38).
  - `else` may replace a guard: the succession taken if all the immediately preceding guards are false (R82 p.136).
  - The target of a conditional succession must be specified by a qualified name or feature chain, not declared in place (R82 p.136; R72 sl.35).
- **Figure.** SCN-002 step 3: `decide intentCheck` with two branches (accepted → boarding; else → hold and re-file).
- **Sources.** R72 sl.35–38; R82 p.136.

#### S1.15 The semantics of choice: gaps and overlaps (4 min)
- **Purpose.** Answer the driving question; teach the reviewer's reasoning.
- **Content.**
  - Reveal S1.2: for scores in [3, 4) no guard holds and there is no `else`, so no succession out of the decision is possible (R72 sl.35).
  - Overlap: if two guards can both be true, the model says only that one possible successor is chosen (R72 sl.38); S06 adds that unguarded successions out of a decision are chosen non-deterministically (R82 p.134). The consequences are instructor reasoning from these statements.
  - The checker evaluates no guard: both gap and overlap pass (recorded course probes).
- **Figure.** The S1.2 number line, now with the gap marked and a second example where two ranges overlap.
- **Sources.** R72 sl.35, sl.38; R82 p.134. Recorded probe results (old Week 11 module).

#### S1.16 Concurrency: fork and join (2 min)
- **Purpose.** Model "at the same time" honestly.
- **Content.**
  - A fork enables all its successors; a join waits for all its predecessors (R72 sl.40).
  - Use a fork only where the ConOps says activities run concurrently (SCN-003: charging overlaps boarding, per the course's turnaround convention); a fork where the ConOps has a choice is a semantic error (contrast with `decide`).
- **Figure.** SCN-003 fragment: after `connectCharger`, fork into `chargeToThreshold` and `boardNextParty`, join before `dispatchRelease`. **(proposed, instructor to confirm)** — the reference has no SCN-003 flow.
- **Sources.** R72 sl.40. AeroLink: DECISION_LOG W8 (turnaround convention: boarding overlaps the charge); `src/model/reference/week03.ts` (SCN-003).

#### S1.17 Performed actions as calls, and actions across parts (3 min)
- **Purpose.** Link flows to performers.
- **Content.**
  - A `perform` inside another action acts like a call of the performed action (R82 p.136).
  - In the camera example, the camera performs the whole action and its subparts perform the steps (`perform takePhoto.focus`) (R72 sl.41): the same pattern lets LOG parts perform the steps of a scenario.
  - Course convention: scenario steps **subset** the functions they are occurrences of (`action cruise :> Logical::'FN-005'`), so the thread scenario → function → logical element is explicit.
- **Example (excerpt of existing fragment, PASS).** `then action cruise :> Logical::'FN-005';` from `sysml/week11/aerolink_scn002_action_flow.sysml`.
- **Sources.** R72 sl.41; R82 p.136. Course convention (old Week 11 module, worked example (c)).

#### S1.18 Asynchronous transfers: send and accept (2 min)
- **Purpose.** Prepare the ANSP exchange and Week 11 ports.
- **Content.**
  - An accept action receives a transfer; a send action sends one to a target or via a port; a transfer sent via a port goes to whatever the port is connected to (R72 sl.45–46).
  - Week 10 uses send/accept only at organizational boundaries (the flight intent to the air navigation service); Week 11 supplies the ports and interfaces.
- **Sources.** R72 sl.45–46.

#### S1.19 Worked example I: SCN-002 from ConOps table to action flow (5 min)
- **Purpose.** The whole method once, end to end.
- **Content.** Walk the mapping table (ConOps item → flow node → construct) from the reviewed old Week 11 module, with students predicting each construct before the reveal:
  - Step 1 Plan the flight → `planFlight :> FN-003` (out intent); step 2 → `fileFlightIntent :> FN-012` with an item flow of the intent; step 3 (an external actor accepts) → `decide intentCheck`, not an AeroLink action; A3 → else branch, hold and re-file, then `done`; step 4 → `boardPassengers :> FN-014` and `decide partyCheck`; A2 → rejoin at the merge `departureReady`; step 6 → `decide padCheck` with three branches (land / hold / divert); A1 → loops through a merge or rejoins at step 7.
  - What the listing leaves open: no guard is computed; steps 6–7 subset no function. Modeling choices to state, not errors.
- **Figure.** The SCN-002 flow drawn as an activity-style diagram (original), with ConOps step numbers in the margin.
- **Example.** Existing `sysml/week11/aerolink_scn002_action_flow.sysml` (PASS in the 2026-10-11 checker run), shown in two excerpts of ≤ 15 lines.
- **Sources.** R72 sl.30–38; R76 sl.101. AeroLink: `aerolink_v03_behavior.sysml` (SCN-002); `src/model/reference/week03.ts` (SCN-002 steps and alternates).

#### S1.20 Worked example II: predict, then fix, a rejected branch (3 min)
- **Purpose.** Practice the most common syntax error and its reason.
- **Content.**
  - Show `if flightIntentAccepted then action boardPassengers;` (target declared in the branch).
  - Students predict: accepted or rejected, and why. Reveal: rejected (syntax error at `if`), because the target must be named, not declared (R72 sl.35; R82 p.136).
  - Fix: declare `action boardPassengers;` on its own line and name it in the branch.
- **Example.** Existing `sysml/week11/invalid_decide_target_declared.sysml` (FAIL by design in the 2026-10-11 run; intentionally invalid).
- **Sources.** R72 sl.35; R82 p.136.

### Section D: Close (10 min)

#### S1.21 What the checker confirms, and what a reviewer must confirm (4 min)
- **Purpose.** Draw the line before the lab.
- **Content.** Recorded course probes (release 2026-08):
  - Checker rejects: an accept of an undeclared signal; `then` to an action that does not exist; `exhibit` naming an action; two entry actions in one state; a decision branch that declares its target.
  - Checker accepts silently: a state no transition enters; a state definition with no initial state; a decision whose guards do not cover every case or can both be true; a dead-end action; a merge with one incoming succession.
  - Consequence: the behavior review checklist (S2.17) is the reviewer's job.
- **Figure.** Two-column table, "Checker" / "Reviewer".
- **Sources.** Recorded probe table (old Week 11 module, block "What the checker confirms"); `learning-studio/docs/SYSML_TOOLCHAIN.md` (the checker evaluates no guard or constraint).

#### S1.22 Exit: retrieval and preparation (3 min)
- **Purpose.** Retrieval and handoff to Session 2.
- **Content.**
  - Three questions (individual, 90 s): which construct for "exactly one of these happens"; what `then` attaches to; what is wrong with a fork for a choice.
  - Preparation for Session 2: each team member brings the Week 2 ConOps table of the scenario the team will model and the list of operating modes in the team's Week 4 description.
- **Sources.** Course convention.

#### S1.23 Session 1 summary and bridge (3 min)
- **Purpose.** Consolidate.
- **Content.** One slide: function (what) → logical element (who performs) → scenario flow (in what order, on what condition). Next: the condition the aircraft is in (states), the use cases that frame the flows, and how to check that all of it agrees.
- **Sources.** R20b p.594 (alternate functional and behavioral views).

**Session 1 timing.** 2+3+2+2 · 3+3+3+3+3+4 · 3+3+2+4+4+2+3+2+5+3 · 4+3+3 = **69 min + 6 min buffer = 75**. References slide 0 min.

## 3. Session 2: States, use cases, consistency, and the lab launch (75 min)

**Split.** About 47 min of lecture (S2.1–S2.18) and 22 min of laboratory launch (S2.19–S2.22), the Week 1 pattern.

### Section E: Operating states (24 min)

#### S2.1 Retrieval warm-up: three flows, one correct (3 min)
- **Purpose.** Retrieval of Session 1.
- **Content.** Three short SCN-003 branch fragments (target declared in place; fork for a choice; correct `decide`/`else`/merge). Pairs pick the correct one and name the defect in the other two. Reveal on the following slide's first 30 s.
- **Sources.** R72 sl.35–40. Reuses the logic of old Week 11 quiz item 1, with new wording (the quiz keeps its own items, §6).

#### S2.2 Function or operational mode? (2 min)
- **Purpose.** Motivate states from the logical-architecture literature.
- **Content.**
  - SEBoK's scenario of modes: a chain of modes performed as a sequence of transitions; a transition is triggered by the arrival of a control flow (event); an action can be generated within a transition (R20b p.589).
  - A function ("to fly") and its operational mode ("in flight") are complementary views (R20b p.594).
- **Figure.** FN-005 Fly passenger trip beside state `inFlight` with a two-way arrow.
- **Sources.** R20b pp.589, 594.

#### S2.3 State definitions and the initial state (3 min)
- **Purpose.** The notation.
- **Content.**
  - A state definition is like a state machine in UML and SysML v1: it defines a behavioral state that can be exhibited by a system; it can specify a set of discrete nested states connected by transitions that fire on acceptance of item transfers (R73 sl.48).
  - Initial state: `first start then off;` (R73 sl.48; slide notes the change from the `entry` form in 2026-03).
  - The 2.1 Beta 2 specification text still prints the earlier form `entry; then off;` (R82 pp.150–151). **Course convention:** write the current form; recognize the earlier one when reading the specification. (Recorded probe: the 2026-08 checker accepts both.)
- **Sources.** R73 sl.48; R82 pp.150–151.

#### S2.4 Transitions: trigger, guard, effect (3 min)
- **Purpose.** Transition anatomy.
- **Content.**
  - Full form: `transition name first source accept Trigger if guard do effect then target;` with a shorthand that takes the lexically previous state as source (R73 sl.48–49, sl.53).
  - The guard must be true for the transition to fire; the effect action is performed when the transition fires (R73 sl.53).
  - Order matters: trigger, then guard (recorded probe: guard-before-trigger is a syntax error in release 2026-08).
- **Figure.** One transition annotated part by part.
- **Sources.** R73 sl.48–49, 53.

#### S2.5 Change and time triggers (2 min)
- **Purpose.** Triggers beyond signals.
- **Content.** A change trigger fires when a Boolean expression becomes true; absolute and relative time triggers (`accept at`, `accept after`) (R73 sl.54). Time-instant quantities come from the Time package, not ISQ (R73 sl.54).
- **AeroLink use.** A relative time trigger for a weather hold longer than the hold limit **(proposed, instructor to confirm)**: the hold limit is not in the reference data.
- **Sources.** R73 sl.54.

#### S2.6 Entry, do and exit actions; a state is an action (2 min)
- **Purpose.** Connect states to functions.
- **Content.**
  - An entry action is performed on entry, a do action while in the state, an exit action on exit; each may reference an action defined elsewhere or define it in place (R73 sl.52).
  - A state definition is a kind of action definition (R82 p.145), which is why a state can perform functions and a part can exhibit it.
- **Example (existing reference, PASS).** `state charging { do Logical::'FN-006'; }`; `state outOfService { entry Logical::'FN-008'; }`.
- **Sources.** R73 sl.52; R82 p.145.

#### S2.7 Parallel states and the one-active-substate rule (2 min)
- **Purpose.** The two structural rules reviewers apply.
- **Content.**
  - A parallel state's substates are performed concurrently; no transitions are allowed between them (R73 sl.51; R82 p.146).
  - In a non-parallel state with substates, exactly one substate is active after entry (R82 p.146).
- **Figure.** Aircraft with two regions (operational / health), a forbidden arrow crossing between them struck through.
- **Sources.** R73 sl.51; R82 p.146.

#### S2.8 `exhibit`, and the four links from behavior to structure (3 min)
- **Purpose.** Make each link's assertion explicit.
- **Content.**
  - `exhibit` identifies the part that exhibits states defined elsewhere; parameters bound as for actions (R73 sl.56).
  - Four links, four meanings: a step **subsets** a function (this step is an occurrence of it); **perform** (this element is the performer, R72 sl.41); **do** (performed while in this state, R73 sl.52); **exhibit** (this part exhibits these states, R73 sl.56).
  - In the reference, the aircraft part PHY-001 exhibits the operating states; the physical part already exists in the model skeleton, and Week 11 completes it.
- **Figure.** FN-005 traced through all four links: SCN-002 step `cruise` → FN-005 → performed by LOG-001 → `do` of `inFlight` → exhibited by PHY-001.
- **Sources.** R72 sl.41; R73 sl.52, 56. `aerolink_v03_behavior.sysml` (PHY-001 `exhibit`).

#### S2.9 Worked example III: AircraftOperatingStates (4 min)
- **Purpose.** Read a complete state definition against the ConOps.
- **Content.**
  - Five states (onPad, charging, dispatchReady, inFlight, outOfService), eight transitions, one guard.
  - Guard on `dispatch`: `accept DispatchRelease if not noGoFaultOpen then inFlight` expresses the no-dispatch-with-open-no-go-fault requirement (REQ-STK-006) as behavior.
  - Transition table with ConOps sources (SCN-002 steps 5–6, SCN-003 steps 1–6 and A3, SCN-004 steps 2 and 6).
  - Question for pairs: one ConOps trace does not behave as the ConOps implies. Which, and is it a defect? (Instructor key in the old Week 11 module, worked example (b).)
- **Example.** Existing `sysml/week11/aerolink_operating_states.sysml` (PASS in the 2026-10-11 run), excerpt ≤ 15 lines.
- **Sources.** R73 sl.48, 52–53; R82 pp.151–152. AeroLink: `aerolink_v03_behavior.sysml` (`AircraftOperatingStates`).

**Transition E → F.** "Flows and states describe behavior from inside. A use case frames it from outside: who interacts with the system, and for what result."

### Section F: Use cases (8 min)

#### S2.10 Use cases: subject, actors, objective (3 min)
- **Purpose.** The notation and its meaning.
- **Content.**
  - A use case definition specifies the required behavior of its subject relative to one or more external actors; its objective is an observable result of value to one or more actors (PX2 p.177).
  - Actors are parameters representing roles played by external entities; they are referential part usages and so need part definitions (R76 sl.100).
  - The subject must be declared first, before any actors (R76 sl.101).
- **Sources.** R76 sl.100–101; PX2 p.177.

#### S2.11 `include`, nested use cases, and what is not supported (2 min)
- **Purpose.** Use `include` correctly.
- **Content.**
  - An include use case usage is a kind of perform action usage; the included use case has the same subject as the containing one; actor parameters are bound as necessary (PX2 p.177 ff.; R76 sl.101: actors must be bound explicitly).
  - The traditional `extend` relationship is not supported yet (R76 sl.101). Model an optional extension as a guarded branch or a separate use case.
- **Example (to be checker-validated; new fragment `aerolink_turnaround_include.sysml`, §4.2).** A use case 'Operate turnaround cycle' that `include`s SCN-003 Aircraft Charging and then SCN-002 **(proposed, instructor to confirm)**.
- **Sources.** R76 sl.101; PX2 pp.177–179.

#### S2.12 AeroLink's five scenarios as use cases (3 min)
- **Purpose.** Show the reference choices and their reasons.
- **Content.**
  - SCN-001..005 are use cases with the subject `enterprise : AeroLinkEnterprise`, actors typed by stakeholder or external-system definitions, and the success and failure end states in the objective; trigger, preconditions and flows in `doc`.
  - The `actor` usages realize the "performs" links only; they are not the full actor list (reference README).
  - Discussion: the subject is the enterprise, not the narrower system of interest. Defensible (passengers interact with the service), but a team must state its choice.
- **Example (existing reference, PASS).** The SCN-001 use case header (5 lines).
- **Sources.** R76 sl.100. `sysml/reference/README.md` §3.2 (SCN row); `aerolink_v03_behavior.sysml`.

### Section G: Consistency and review (15 min)

#### S2.13 Cross-checking the flow and the states (3 min)
- **Purpose.** Use one view to check the other.
- **Content.** Instructor method: for every flow step that changes the aircraft's condition there should be an event accepted in the state the aircraft is in at that step; for every transition there should be a step, in some scenario, that causes its trigger. Apply to SCN-002 and `AircraftOperatingStates` (landing ↔ `LandedOnPad`).
- **Figure.** A two-column correspondence table, flow steps vs transitions, with one unmatched row highlighted.
- **Sources.** Instructor method (old Week 11 module, advanced block). R73 sl.48 (transitions fire on accepted transfers).

#### S2.14 Ordering across participants: the interaction view (extension) (2 min)
- **Purpose.** Introduce the graduate task.
- **Content.**
  - An occurrence definition plus messages can specify an interaction between parts without committing to how it happens; succession is implicit between events on one lifeline and must be explicit across lifelines (PX5 sl.60, 62).
  - The flight-intent exchange with the air navigation service is the AeroLink case.
- **Example.** Existing instructor key `sysml/instructor/week11/aerolink_grad_key_intent_interaction.sysml` (PASS in the 2026-10-11 run); instructor only.
- **Sources.** PX5 sl.60, 62; R72 sl.45–46.

#### S2.15 Worked example IV: the weather-disruption branch (3 min)
- **Purpose.** A second scenario, with a hold and an end-of-scenario alternate.
- **Content.** Sketch SCN-005: forecast crosses the limit → hold dispatches at the vertiport and notify affected passengers (fork, both happen) → join → decide (limit cleared / hold beyond limit → divert or cancel). Point out that the weather limits are TBD in the requirements, so the guard is a named Boolean, not a computed comparison.
- **Example (to be checker-validated; new fragment `aerolink_scn005_weather_flow.sysml`, §4.2)** **(proposed, instructor to confirm)**: the reference holds SCN-005 as a use case with its flows in `doc` only.
- **Sources.** R72 sl.38, 40. AeroLink: `src/model/reference/week03.ts` (SCN-005); `week04.ts` (TBD-01 weather limits; old numbering).

#### S2.16 Common errors in behavior models (2 min)
- **Purpose.** A short error catalog.
- **Content.** Alternates that rejoin when the ConOps says they end; fork used for a choice; guards on a Real attribute instead of a condition (recorded probe: passes silently); transitions between concurrent regions; two initial states in a non-parallel state; a function with no performer; a state machine exhibited by no part.
- **Sources.** R73 sl.51, 53; R82 p.146; recorded probes (old Week 11 module).

#### S2.17 The behavior review checklist (3 min)
- **Purpose.** Give the self-check the lab uses.
- **Content.** Every node reachable from `start` and with a path to `done`; every decision guarded, with `else` advised; a node for every ConOps step and alternate; main steps in ConOps order; each alternate entered from its ConOps step and either ending or rejoining where the ConOps says; every state reachable; every transition with a trigger; every function performed; every state machine exhibited.
- **Figure.** The checklist as a one-page card (downloadable in the lab).
- **Sources.** Course convention (from the old Week 11 flow-coverage activity rules). R72 sl.35–38; R82 p.146.

#### S2.18 Where this goes: Week 11 (2 min)
- **Purpose.** Bridge.
- **Content.** Week 11 gives the logical elements physical homes (allocation), the information items ports and interfaces, and the send/accept actions real connections. Keep every function and item ID stable.
- **Sources.** COURSE_SCHEDULE.md (Week 11 output).

### Section H: Laboratory launch (22 min)

#### S2.19 Lab brief: what you deliver, and by when (3 min)
- **Purpose.** Make the deliverable unambiguous (§5).
- **Content.** Model v-next of the team's own enterprise: functions with I/O and performers; one scenario as an action flow (≥ 1 decision, ≥ 1 alternate handled as the ConOps says, ≥ 1 item flow); one operating-state definition (≥ 4 states, ≥ 5 transitions, ≥ 1 guard); all scenarios as use cases; the behavior–structure links; the checker log; the self-check; the AI usage statement.
- **Sources.** §5. Course convention (minimums carried from the old Week 11 lab).

#### S2.20 Team work: choose the scenario and map it (10 min)
- **Purpose.** Spend class time on decisions, not typing.
- **Content.** Each team selects the scenario with the most alternates from its Week 2 ConOps and fills the mapping table (ConOps item → flow node → construct) for every step and alternate. The instructor circulates; the most common correction is expected at external-actor steps (decision, not action).
- **Sources.** Course convention.

#### S2.21 Instructor checkpoint: two mapping tables (6 min)
- **Purpose.** Calibrate the class.
- **Content.** Two teams show their mapping table (3 min each); class names one construct choice to change.
- **Sources.** Course convention.

#### S2.22 Close: the next 7 days (3 min)
- **Purpose.** Plan.
- **Content.** Day-by-day plan (§5.4); starter listing available; submission deadline; reminder that a PASS is necessary, not sufficient.
- **Sources.** §5.4.

**Session 2 timing.** 3+2+3+3+2+2+2+3+4 · 3+2+3 · 3+2+3+2+3+2 (lecture 47) · 3+10+6+3 (lab 22) = **69 min + 6 min buffer = 75**. References slide 0 min.

## 4. AeroLink worked model example (continues from Phase I Weeks 2 and 4)

### 4.1 What continues, and from where
- **Week 2 ConOps → use cases and flows.** SCN-001..005 (steps, alternates, end states) in `src/model/reference/week03.ts` (old numbering) are already use cases in `aerolink_v01_skeleton.sysml`; Week 10 turns SCN-002 into a flow (v0.3) and adds SCN-005 (proposed).
- **Week 4 architecture → logical architecture.** FN-001..014, LOG-001..007, AI-001..002, INFO-001..005 and the LOG/AI → FN "performs" links in `src/model/reference/week08.ts` (old numbering) become the Logical package of `aerolink_v02_req_structure.sysml`.
- **The worked sequence in class.** (1) FN with inputs/outputs (S1.11); (2) `perform` by LOG (S1.10); (3) SCN-002 flow (S1.19–S1.20); (4) operating states with `do`/`entry` and `exhibit` (S2.6–S2.9); (5) use cases (S2.12); (6) cross-check (S2.13); (7) SCN-005 (S2.15).

### 4.2 Fragments

**Existing (reuse; checker status from `sysml/validation-report.json`, run of 2026-10-11).**

| File | Shows | Status | Used on |
|---|---|---|---|
| `sysml/reference/aerolink_v02_req_structure.sysml` | Logical package: FN action usages, LOG/AI parts with `perform`; CAP action defs | PASS in the 2026-10-11 checker run | S1.9, S1.10 |
| `sysml/reference/aerolink_v03_behavior.sysml` | SCN-002 flow, `AircraftOperatingStates`, `exhibit` by PHY-001, five use cases | PASS in the 2026-10-11 checker run | S1.19, S2.9, S2.12 |
| `sysml/week11/aerolink_scn002_action_flow.sysml` | SCN-002 standalone flow: 3 decisions, 3 merges, an item flow, FN subsetting | PASS in the 2026-10-11 checker run | S1.17, S1.19 |
| `sysml/week11/invalid_decide_target_declared.sysml` | Target declared in a branch (teaching error) | FAIL (intentionally invalid) in the 2026-10-11 checker run | S1.20 |
| `sysml/week11/aerolink_operating_states.sysml` | 5 states, 8 transitions, guard, `do`/`entry`, `exhibit`, `perform` | PASS in the 2026-10-11 checker run | S2.6, S2.9 |
| `sysml/week11/aerolink_l11_starter_scn001.sysml` | SCN-001 main steps in succession inside the use case (lab starter, AeroLink demonstration) | PASS in the 2026-10-11 checker run | Lab demo |
| `sysml/week11/aerolink_review_fragment_team_k.sysml` | Seeded behavior draft for review practice (passes, not correct) | PASS in the 2026-10-11 checker run | Optional review exercise |
| `sysml/instructor/week11/aerolink_grad_key_intent_interaction.sysml` | Interaction view of the flight-intent exchange (instructor key) | PASS in the 2026-10-11 checker run | S2.14; graduate key |

Note: these `sysml/week11/` files are in the earlier (old) numbering; their headers say "Week 11". Their header comments must be re-labeled, or the files copied to `sysml/lectures/week10/`, before students see them (no internal history in student text).

**Needed (new; proposed path `learning-studio/sysml/lectures/week10/`; each must pass the course-designated checker with 0 errors, and the PASS is then reviewed for meaning).**

| Proposed file | Must show | Used on |
|---|---|---|
| `teaching_guard_gap.sysml` | Non-AeroLink dispatch decision with a guard gap and no `else` (passes; semantically defective), plus a corrected version | S1.2, S1.15 |
| `aerolink_logical_functions.sysml` | INFO items as `item def`; FN-001 → FN-002 → FN-011 as action defs/usages with `in`/`out` parameters and flows; LOG-004 and LOG-005 performing them; `#derivesFrom` from FN to CAP-002 | S1.6, S1.11 |
| `aerolink_scn003_fork_join.sysml` | SCN-003 with fork/join (charge ∥ board next party) consistent with the turnaround convention **(proposed, instructor to confirm)** | S1.16 |
| `aerolink_scn005_weather_flow.sysml` | SCN-005 flow with a fork/join (hold ∥ notify), a decide with an end-of-scenario alternate, a named Boolean guard for the TBD weather limit **(proposed, instructor to confirm)** | S2.15 |
| `aerolink_turnaround_include.sysml` | A containing use case that `include`s SCN-003 and SCN-002, subject shared, actors bound explicitly **(proposed, instructor to confirm)** | S2.11 |
| `invalid_guard_before_trigger.sysml` | Guard written before the trigger (teaching error, intentionally invalid) | S2.4 |

## 5. Laboratory outline: modeling the team's own logical architecture and behavior

### 5.1 Inputs
- The team's Phase I Systems Thinking Engineering Package: Week 2 ConOps (scenarios with steps, actors, alternates, end states) and Week 4 architecture description (functional decomposition, logical elements, information view), as revised for the Week 7 package.
- The team's model after Week 9 (stakeholders, concerns, needs, requirements; physical skeleton).
- The Session 1–2 slides, the lesson, the AeroLink worked example (S1.19, S2.9), the starter listing, the behavior review checklist (S2.17).
- Readings (essential): R20b pp.587–589 and 594; R72 sl.30–41; R73 sl.48–56; R76 sl.100–101. Extension: R82 pp.133–136 and 145–154; PX5 sl.57–64.

### 5.2 Objectives
B10.1–B10.5 applied to the team's own enterprise; the graduate interaction view for graduate students.

### 5.3 Method
1. **Functions with I/O.** Each Week 4 function as an action usage with typed `in`/`out` items; information items as item defs; each function performed by ≥ 1 logical element; each function records its parent capability (S1.6–S1.11).
2. **One scenario as a flow.** The scenario with the most alternates: mapping table first, then the flow; steps subset functions where a function exists (S1.12–S1.20).
3. **One operating-state definition** for the team's principal operational element, with `do`/`entry` functions and `exhibit` by the physical part from the skeleton (S2.3–S2.9).
4. **All scenarios as use cases** with subject, actors and objective (S2.10–S2.12).
5. **Cross-check and self-review** with the checklist (S2.13, S2.17); every finding fixed or recorded with a reason.

### 5.4 Procedure

| Step | When | Lead role | Output |
|---|---|---|---|
| 1. Mapping table for the chosen scenario | In class (S2.20) | Whole team | Mapping table |
| 2. Functions with I/O, item defs, `perform` | Day 1–2 | Architecture | Logical package |
| 3. Scenario flow (decisions, merges, item flow, alternates) | Day 2–3 | Requirements & Compliance drafts; Architecture reviews | Behavior package: flow |
| 4. Operating-state definition, `do`/`entry`, `exhibit` | Day 3–4 | V&V lead | Behavior package: states |
| 5. Use cases for all scenarios | Day 4 | Requirements & Compliance | Behavior package: use cases |
| 6. Checker run; fix errors; record warnings | Day 5 | AI & Data lead | Checker log |
| 7. Cross-check and checklist self-review; findings dispositioned | Day 6 | V&V lead | Self-review table |
| 8. AI usage statement; integration and upload | Day 7 | AI & Data lead; V&V lead | Submission |

### 5.5 Outputs
`team-NN-week10-model.sysml` (or the model folder), `team-NN-week10-checker-log.txt`, `team-NN-week10-review.md` (mapping table, cross-check table, checklist results with dispositions, AI usage statement).

### 5.6 Rubric rows (from ASSESSMENT_RUBRICS.md)

| Row | Criterion | Applied this week |
|---|---|---|
| RB-7.2 | Decomposition | Functions derived from capabilities and scenarios; no physical names in the logical view |
| RB-8.1 | Validity | Yes (the >2-parse-error gate applies, §0 safeguard 5) |
| RB-8.2 | Organization and conventions | Logical and Behavior packages; stable IDs as short names |
| RB-8.3 | Structure semantics | Definitions vs usages for functions and items; logical parts typed |
| RB-8.5 | Behavior semantics | Main row this week: flow and states consistent with the ConOps; `perform`/`exhibit` links |
| RB-8.6 | Completeness vs minimums | Against the §5.3 minimums |
| RB-12.1–12.3 | AI usage statement | Yes; AI-generated SysML must be explained by its owner |

**Grading mode (faculty decision, §11).** The earlier course graded behavior formatively at the model-baseline checkpoint and summatively at the final model; the proposed default here is formative feedback this week, summative in the Week 14 model.

### 5.7 Workload (budget 8.0 h per student per week)

| Activity | Hours | Basis |
|---|---|---|
| Class sessions (2 × 75 min) | 2.5 | Timetable |
| Readings: R20b pp.587–589, 594 (4 pp, dense); R72 sl.30–41, R73 sl.48–56, R76 sl.100–101 (23 slides) | 1.0 | About 12 pp/h for the SEBoK pages; 2 min per slide |
| Lesson and worked examples review | 0.5 | Lesson of about 4,000 words |
| Lab out of class (student's share of steps 2–8) | 2.6 | About 10.5 person-hours per team of 4 (functions 2.0; flow 3.0; states 2.0; use cases 1.0; checker and fixes 1.0; self-review 1.0; statement and integration 0.5) |
| Quiz (§6.1) | 0.3 | 12 items |
| Applied exercise (§6.2) | 0.8 | 50 min plus upload |
| Time log | 0.1 | |
| **Total** | **7.8** | Within 8.0 h. Superseded by the review fixes: the computed figures are in `labBrief.ts` and WEEK10_MILESTONE_REPORT.md (team of four 7.8 h; team of three reduced scope, 7.5 person-hours of lab, 7.9 h per student) |

## 6. Assessment outline (separate from the lecture)

Unseen, non-AeroLink contexts; no reuse of in-class retrieval items or worked-example wording; keys spread evenly across positions; distractors from the S1.21/S2.16 error lists; no option longer or more qualified than the key.

### 6.1 Quiz Q10 (individual, 15 min, closed book, 12 items: 9 single best answer + 3 short answer)

| # | Objective | Bloom | Item focus (unseen context) | Key rests on |
|---|---|---|---|---|
| 1 | B10.1 | Understand | Which three views may a logical architecture include? | R20b p.587 |
| 2 | B10.1 | Analyze | A library-loan system's function list has no inputs or outputs: which SEBoK pitfall? | R20b p.594 |
| 3 | B10.2 | Apply | Which fragment models "exactly one of approve / reject" in a permit-approval flow? | R72 sl.37–38 |
| 4 | B10.2 | Analyze | Ordering asserted by a fragment with a succession flow, a `then` and an unordered action (warehouse picking) | R72 sl.31–33 |
| 5 | B10.2 | Evaluate | A decision's guards on a sensor reading leave a gap; what does a reviewer report? | R72 sl.35; R82 p.136 |
| 6 | B10.2 | Apply | Fork or decide for "notify customer and print label at the same time" | R72 sl.38, 40 |
| 7 | B10.3 | Apply | Correct transition order (trigger, guard, effect, target) for an elevator door | R73 sl.53 |
| 8 | B10.3 | Analyze | A two-region parallel state with a transition between regions: what rule is broken and what fixes it? | R73 sl.51, 54 |
| 9 | B10.4 | Understand | In a bike-share use case, which statement about actors and `include` is true? | R76 sl.100–101 |
| 10 (SA) | B10.5 | Evaluate | A clean checker log for a state definition with two initial states: write the finding and its severity | R82 p.146; R73 sl.48 |
| 11 (SA) | B10.5 | Apply | Write the lines that make part X the performer of function F and the exhibitor of state machine S | R72 sl.41; R73 sl.56 |
| 12 (SA) | B10.3 | Analyze | Give one function and the operational mode that corresponds to it in a water-pumping station, and one transition between modes with its trigger | R20b pp.589, 594 |

Scoring: 1 point each for 1–9, 2 points each for 10–12 (two-criterion key); total 15.

### 6.2 Applied exercise (individual, about 50 min, open book, unseen case)
- **Case brief** (about 300 words, FICTIONAL): a city bike-share service with a rental scenario (unlock, ride, return; alternates: no bike available, dock full at return) and a dock-station with modes (available, charging, out of service).
- **Tasks.** (1) Mapping table for the rental scenario (B10.2). (2) The action flow in SysML v2 text with one decision, one merge and both alternates (B10.2). (3) A state definition for the dock with ≥ 4 states, ≥ 5 transitions and one guard (B10.3). (4) The use case header with subject, actors and objective (B10.4). (5) Three findings on a provided, checker-accepted but defective fragment, each with location, criterion and fix (B10.5).
- **Rubric** (4 levels each, 20 points): mapping completeness; flow semantics (choice, alternates, ending vs rejoining); state semantics (initial state, triggers, guard, one-active-substate); use case correctness; review findings (real defect, criterion, actionable fix). Syntax slips that do not change meaning cost at most one level in total; the exercise is graded on meaning, not on a checker run.

## 7. Continuity link to the Phase I artifacts

| Phase I artifact (team package) | Week 10 model element | Rule |
|---|---|---|
| Week 2 ConOps: operational scenarios (SCN), steps, actors, alternates, end states | `use case` per scenario (subject, actors, objective); one scenario as an action flow | COURSE_SCHEDULE rule 6 (Week 10 ↔ Week 2) |
| Week 4 functional decomposition (FN) and capabilities (CAP, from Week 2) | `action` usages (FN) in Logical; `action def` (CAP); `#derivesFrom` FN → CAP | Rule 6 (Week 10 ↔ Week 4) |
| Week 4 logical elements (LOG) and AI-enabled capabilities | Parts of the logical architecture with `perform` | Rule 6 |
| Week 4 information view (INFO, producer, consumer) | `item def` per information item; action parameters and flows (ports in Week 11) | Rule 6; coordinated with Week 11 |
| Operating modes in the Week 2 ConOps or Week 4 description | `state def` with transitions; `exhibit` by the physical part | Rule 6 |

The earlier weekly laboratory notes for the course (faculty source) list a logical-architecture lab (flight operations, fleet management, maintenance management, customer services, scheduling, decision support) and a behavioral and operational models lab (the five AeroLink scenarios). This week combines them for the team's own enterprise. Faculty source: S04, Week 5 Lab and Week 7 Lab.

## 8. Section transitions (summary)

| From → to | Transition line |
|---|---|
| S1 A → B | Before drawing a flow, agree what a logical architecture is |
| B → C | We know the functions and their performers; now the order and the conditions |
| C → D | A flow that passes the checker can still be wrong; who catches what |
| S2 E → F | Flows and states describe behavior from inside; use cases frame it from outside |
| F → G | Three views of one behavior must agree; check them against each other |
| G → H | Now your team models its own scenario and modes |

## 9. Source gaps

1. **Temporal architecture in SysML v2.** SEBoK names a temporal view (R20b p.590), but no course source shows how to model execution frequency in SysML v2 beyond time triggers (R73 sl.54) and local clocks (R73 sl.55). The lecture mentions the temporal view only conceptually.
2. **Functional hierarchy notation.** SEBoK describes a function hierarchy (R20b p.587); the reference model has no FN decomposition. Decomposition notation is sourced (R72 sl.34), but no AeroLink decomposition exists; the course takes no position on decomposition depth beyond SEBoK's pitfall.
3. **Use case subject choice.** No course source says whether an enterprise or a narrower system of interest should be the subject of operational use cases; the reference's choice (the enterprise) is a course convention.
4. **Concurrency semantics across regions.** No course source says that one transfer triggers accepters in two concurrent regions (recorded in the old Week 11 quiz, item 6); the lecture avoids relying on it.
5. **`extend`.** Not supported yet (R76 sl.101); teams with extension-style scenarios need the course workaround (guarded branch).
6. **Checker behavior.** All "checker accepts/rejects" statements rest on the course's recorded probes of 2026-10-11 (release 2026-08). They must be re-run if the pilot release changes.
7. **SCN-003/SCN-005 flows and the include example** are not in the reference; they are proposed teaching content, not reference data.
8. **Graphical notation.** Only S09 pp.5–22 (R90) is registered; no registered graphical slides for actions, states or use cases. Figures are original drawings in the course notation, not normative SysML v2 diagrams.

## 10. Register additions needed

| Placeholder | Source, pages | First-page title (checked) | Supports |
|---|---|---|---|
| PX2 | S06 pp.177–181 | "7.25 Use Cases" (p.177) | S2.10–S2.11; quiz 9 |
| PX5 | S10 sl.57–71 | "Occurrences, Time Slices and Snapshots (1)" (sl.57) | S2.14; graduate task. Note: an earlier faculty decision accepted S10 sl.59–64 as an extension reading for the behavior week, but it was never entered in `readings.py`; PX5 covers it |

No week-specific (P10.n) additions are needed: R20b, R72, R73, R76 and R82 cover the remaining citations. **Essential readings proposed:** R20b pp.587–589, 594; R72 sl.30–41; R73 sl.48–56; R76 sl.100–101. **Extension:** R82 pp.133–136, 145–154; PX2; PX5 sl.57–64.

## 11. Open items for faculty

1. Grading mode for behavior this week (formative now, summative in Week 14) and whether a peer review of models (review item discrepancies) is kept in Phase II and, if so, in which week.
2. Approve the proposed AeroLink teaching content: SCN-003 fork/join, SCN-005 flow, the turnaround `include` example, and the weather-hold time limit (none is in the reference data).
3. Use case subject: keep the enterprise (reference choice) or require the narrower system of interest.
4. Where the INFO items first appear in the model: as action parameters this week (proposed) and on ports in Week 11.
5. The graduate interaction view: required for graduate students or optional (workload +0.5 h).
6. Re-label or copy the earlier-numbered `sysml/week11/` files before student release; re-run the checker on any new fragment, and re-run the recorded probes if the pilot release changes.
7. The pending Week 1 case changes (renamed external systems, STK-015, NEED-012..017) are not in the reference model; actor types in the use cases (e.g., the air navigation service) follow the reference names until the faculty decision.
8. Approve PX2 and PX5.
