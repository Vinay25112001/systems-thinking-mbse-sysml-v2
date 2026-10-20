# Week 12 Lecture Outline: Digital Thread / Verification and Validation

**Status.** Draft for faculty approval (COURSE_PRODUCTION_PLAN M2, outlines for Weeks 2–14). Written 2026-10-19. Nothing in `src/` was changed; no `.sysml` file was created; the checker was not run for this outline.
**Governing documents.** DECISION_LOG A19 and A20 (and A14: the verification-case pages of the specification are a reading for this week); COURSE_SCHEDULE.md (Week 12 subject, exact; instructional rule 6: Week 12 ↔ Weeks 2 and 3); COURSE_PRODUCTION_PLAN.md; the Week 1 template (`../week01/WEEK1_LECTURE_OUTLINE.md`) and its review lessons (`../week01/REVIEW_DISPOSITIONS.md`).
**Format.** Two sessions of 75 minutes each.
- Session 1 is all lecture: 22 slides, 69 min, plus a 6-min buffer and a generated "References and credits" slide (0 min).
- Session 2 is 47 min of lecture (16 slides) and 22 min of laboratory launch (4 slides), plus the 6-min buffer and the references slide.
- Total: 42 content slides + 2 generated references slides.

## 0. Conventions used in this outline

- **Citations.** `R84 p.176` = verified register entry R84, PDF page 176 of the SysML v2.1 Beta 2 (Release 2026-07) specification text, Part 1 (convention W4: never "the standard"). `R75 sl.96` = slide 96 of the SysML v2 textual-notation training deck (Release 2026-08). `R23a p.634` = SEBoK PDF page (W1). `R49 p.149` = DoD SE Guidebook PDF page. `R58 p.433` = MITRE SEG PDF page. `PX8`, `PX9` = shared proposed register additions; `P12.n` = additions specific to this week (§10). Every citation was opened in `_source_cache/*.txt` for this outline; a citation supports only what is written beside it.
- **Reuse.** The reviewed earlier verification module (old numbering Week 12: `git show HEAD:learning-studio/src/content/weeks/week12.ts`, `docs/authoring/week12_notes.md`, committed versions; the uncommitted edits were ignored) is the base; the risk-metadata material comes from the earlier analysis module (old Week 13). Checker results quoted below are the course's recorded probes (release 2026-08, 2026-10-11), not re-run.
- **Course convention** marks content the sources do not supply, taught as the course's choice. This week has two important ones: the V&V line (S1.7) and the 11-step thread with its link types (S2.8).
- **AeroLink** values and IDs are FICTIONAL and come from `sysml/reference/aerolink_v04_full.sysml`, `src/model/reference/week04.ts` (requirements), `week05.ts` (measures), `week06.ts` (TECH, AROU), `week12.ts` (VER) (old numbering). Anything not in those files is marked **(proposed, instructor to confirm)**. A MITRE page that reverses verification and validation (p.286) is not cited or assigned (DECISION_LOG A14).
- **Faculty notes** are spoken at ≤ 130 words per minute; minutes below are the budget the notes must fit.
- **Student-facing text** contains no internal IDs (decision-log or faculty-register numbers, "old Week N", source-inventory codes, objective codes, P-numbers).
- **Three rules that hold all week.** (1) A `satisfy` usage asserts that the requirement is satisfied by the given feature (R83 p.168); it is a claim in the design model, not evidence. (2) A verdict recorded in a model is evidence about the real system only if its inputs come from real verification activities; a verdict computed from placeholder or estimated values is not. (3) A checker PASS establishes parsing, name resolution and the pilot's validation rules, not that a verification case verifies what it claims.

## 1. Learning objectives (graduate level)

| ID | Objective | Bloom | Taught in |
|---|---|---|---|
| B12.1 | Distinguish verification from validation using the definitions of three sources, state the course convention, and select a verification method for each requirement with a reason | Understand / Evaluate | S1.4–S1.9, S1.16 |
| B12.2 | Model verification cases with subject, objective and `verify`, a method annotation, and verdict logic covering pass, fail, inconclusive and error; explain how `verify` differs from `satisfy` | Apply / Analyze | S1.10–S1.20 |
| B12.3 | Represent MOE and MOP in the model with the library metadata, link them to the requirements they measure, and map each to the verification or validation activity that assesses it | Apply | S2.2–S2.3 |
| B12.4 | Link risks and other uncertainty items from the Phase I register to the requirements, functions and parts they affect, using the library risk metadata | Apply | S2.4–S2.6 |
| B12.5 | Audit the digital thread with reproducible metrics (upward trace, satisfy, verify, orphans, childless parents), walk complete threads, and disposition every gap | Evaluate | S2.7–S2.14 |
| Graduate | Write a model-credibility argument for one analysis that a verification case relies on | Evaluate | Lab extension (R64) |

## 2. Session 1: Verification, validation and the verification case (75 min, all lecture)

**Design rationale.** Session 1 settles the conceptual line (built right vs right system) with the sources side by side, then teaches the verification case on the requirement the class has used since Week 9 (REQ-SYS-001, charge time). It ends with the difference between an assertion (`satisfy`), an intent (`verify`) and evidence (a verdict from real results).

### Section A: Framing (8 min)

#### S1.1 Week 12 at a glance (2 min)
- **Purpose.** Orient.
- **Content.** Subject exactly as scheduled: *Digital Thread / Verification and Validation*. Session 1: V&V and verification cases. Session 2: measures, risks and the digital-thread audit; lab launch. The week adds verification cases, MOE/MOP attributes, risk links and an audit report to the team model.
- **Figure.** The course model strip with Verification, Measures and AROU highlighted, and a thread line running through all packages.
- **Sources.** COURSE_SCHEDULE.md. Course convention (package names, `sysml/reference/README.md` §2).

#### S1.2 The driving question: every system requirement passes. Is the service good? (3 min)
- **Purpose.** Create the need to know.
- **Content.** A city electric-bus fleet (unseen case): every bus passes its factory acceptance test; in the first winter the longest route runs out of charge before the evening service ends. Vote: (A) a verification failure; (B) a validation failure; (C) both; (D) neither. Answer withheld until S1.6.
- **Figure.** Two panels: test-cycle certificate (all ticks) and a winter route map with a stranded bus.
- **Sources.** Instructor-authored scenario (reused from the reviewed old Week 12 intuition block).

#### S1.3 What Week 12 models from your Phase I package (3 min)
- **Purpose.** Continuity rule.
- **Content.**
  - From Week 2: the verification method recorded on every requirement, the measures (MOE, MOP, TPM) and their thresholds.
  - From Week 3: the risk register and the other uncertainty items (assumptions, opportunities, unknowns), with what each affects; technology readiness feeds Week 13.
  - From Weeks 8–11: the model elements those items attach to.
- **Figure.** Phase I tables (requirements with method column; measures table; risk register) mapped to `verification` cases, `#moe`/`#mop` attributes and risk metadata.
- **Sources.** COURSE_SCHEDULE.md rule 6. Course convention (`sysml/reference/README.md` §3.2, VER, MOE/MOP, A/R/O/U rows).

**Transition A → B.** "Two different questions hide in the word 'tested'. The sources answer them differently, so we read them side by side."

### Section B: Verification and validation (20 min)

#### S1.4 Verification (3 min)
- **Purpose.** Sourced definitions.
- **Content.**
  - SEBoK: verification is "the confirmation, through the provision of objective evidence, that specified requirements have been fulfilled" (R23a p.634).
  - A verification action has a definition (the element to verify and the reference for the expected result) and a performance (obtain a result, compare, deduce correctness) (R23a p.635).
  - DoD: verification answers "Did you build the system correctly?" (R49 p.149).
- **Sources.** R23a pp.634–635; R49 p.149.

#### S1.5 Validation (3 min)
- **Purpose.** Sourced definitions.
- **Content.**
  - SEBoK: validation is the confirmation, through objective evidence, that the requirements for a specific intended use or application have been fulfilled; its purpose for a system is confidence in its ability to achieve its intended mission or use under specific operational conditions (R23b p.646).
  - DoD: evidence that the capability complies with stakeholder performance requirements in its intended operational environment; it answers "Is it the right solution to the problem?" (R49 p.150).
  - MITRE: evaluation of the capability of the delivered system to meet the customer's operational need (R58 p.433).
- **Sources.** R23b p.646; R49 p.150; R58 p.433.

#### S1.6 Main differences (3 min)
- **Purpose.** Answer the driving question.
- **Content.**
  - Within verification the comparison is generally binary; within validation it may require a judgment of value against a threshold (R23a p.636).
  - Reveal S1.2: (B), with an argument for (C) if the heater load was in the specification. The point: passing verification does not imply validation.
- **Sources.** R23a p.636. Instructor reasoning.

#### S1.7 The sources draw the line differently; the course convention (3 min)
- **Purpose.** Prevent merged definitions.
- **Content.**
  - MITRE: verification against the requirements of the previous phase; validation against the customer's operational need (R58 p.433).
  - DoD: verification against the specification and baselines; validation against stakeholder performance requirements in the operational environment (R49 pp.149–150).
  - **Course convention (graded by RB-10.1):** verification compares a system or element with its specified requirements (stakeholder and system requirements alike); validation compares the service with the stakeholders' needs through the MOEs and scenarios, in the intended environment. Name the convention you use.
- **Figure.** A three-row table (source, verified against, validated against) with the course row highlighted.
- **Sources.** R58 p.433; R49 pp.149–150. Course convention.

#### S1.8 Verification methods (4 min)
- **Purpose.** Method vocabulary across sources.
- **Content.**
  - DoD's four: demonstration (visual observation, when quantitative assurance is not required); examination (visual inspection of equipment and design data); analysis (recognized analytic techniques, including computer models); test (fully controlled, traceable conditions) (R49 pp.149–150).
  - SEBoK's table adds further techniques (including analogy, sampling and simulation) (R23a pp.637, 639).
  - SysML v2's library: the VerificationMethod metadata annotates a verification case with inspect, analyze, demo or test (R84 p.176; PX9).
  - Mismatch to state: DoD "examination" ≈ SysML "inspect"; SEBoK's simulation has no SysML value (record it as `analyze` and describe the simulation in `doc`).
- **Figure.** Crosswalk table, DoD / SEBoK / SysML.
- **Sources.** R49 pp.149–150; R23a pp.637, 639; R84 p.176.

#### S1.9 Choosing a method, and two pitfalls (4 min)
- **Purpose.** A method is a decision with reasons.
- **Content.**
  - SEBoK pitfalls: "use only testing" (testing needs the implemented product; analysis and inspection find errors earlier and more cheaply) and "no verification strategy" (a justified selection of verification actions against risks must be established) (R23a p.640).
  - The verification matrix becomes part of the functional and allocated baselines (R49 p.149); in a model it is a view of the verification cases.
  - Four questions (instructor heuristic): what evidence the criterion needs; whether real conditions can be produced; the level; the cost of a wrong answer.
- **Sources.** R23a p.640; R49 p.149. Instructor heuristic.

**Transition B → C.** "Now the same ideas in the model: a verification case says what is checked, about what, how, and what the possible outcomes are."

### Section C: Verification cases in SysML v2 (30 min)

#### S1.10 Verification case definitions and usages; the subject (3 min)
- **Purpose.** Core notation.
- **Content.**
  - A verification case definition is a kind of case definition whose result is a verdict on whether the subject satisfies certain requirements; a verification case usage is a usage of one (R84 p.173).
  - The subject is the entity evaluated (the "unit under test"); it may be general in the definition and made specific in usages (R84 p.173).
  - A usage can restrict the subject to a test configuration; individuals can model actual tests (R75 sl.98–99).
- **Sources.** R84 p.173; R75 sl.96, 98–99.

#### S1.11 The objective and `verify` (3 min)
- **Purpose.** What the case sets out to show.
- **Content.**
  - The requirements to be verified are declared in the objective (R75 sl.96; R84 p.173).
  - A requirement verification usage (`verify`) is a subrequirement of the objective, hence a required constraint of it; its subject is bound by default to the objective's subject, which is bound to the case's subject (R84 p.176).
- **Example (spec pattern, R84 p.174).** `verification def VerificationDef1 { subject s1 : Subject1; objective { doc /* ... */ verify requirement1; } }`
- **Sources.** R75 sl.96; R84 pp.173–174, 176.

#### S1.12 Verdicts: four values and `PassIf` (3 min)
- **Purpose.** Verdict semantics.
- **Content.**
  - Pass: the subject has been determined to satisfy the requirements; fail: determined not to; inconclusive: a determination could not be made; error: an error occurred during the performance of the verification (R84 p.173).
  - `VerdictKind` is the library enumeration of these values; `PassIf` returns pass or fail depending on whether its argument is true (PX9 p.537; R84 p.176).
- **Figure.** A four-cell grid, each cell with an AeroLink example (VER-001 pass / fail; VER-004 inconclusive while the weather limit is TBD; error when the procedure was not followed).
- **Sources.** R84 pp.173, 176; PX9 p.537.

#### S1.13 Typical steps and resources (3 min)
- **Purpose.** Inside the case.
- **Content.**
  - Typical verification actions: collect data (by analysis, inspection, demonstration or test); analyze it (e.g., distribution, mean, standard deviation); evaluate against the objective to produce a verdict (R84 pp.173–174).
  - Resources (personnel, equipment, facilities) may be modeled as parts that perform actions, or as actor parameters of the case (R84 p.174).
  - The specification's example passes the processed measurement into the requirement inside `PassIf` (R84 p.176; R75 sl.96–97).
- **Sources.** R84 pp.173–174, 176; R75 sl.96–97.

#### S1.14 The method annotation (2 min)
- **Purpose.** Record the method in the model.
- **Content.** `metadata VerificationMethod { kind = VerificationMethodKind::test; }` (R84 p.176); the short form `@VerificationMethod { … }` used in the reference model. The method on the case must equal the method recorded on the requirement (course convention, checked in the audit).
- **Sources.** R84 pp.175–176. Course convention (`sysml/reference/README.md` §3.2, VER row).

#### S1.15 `satisfy` and `verify`: assertion, intent, evidence (4 min)
- **Purpose.** The week's central semantic distinction.
- **Content.**
  - A satisfy requirement usage is a kind of assert constraint usage: it asserts that the requirement is satisfied (always evaluates to true) when its subject is bound to the satisfying feature (R83 p.168).
  - A `verify` declares, in a verification case's objective, which requirements the case checks (R84 p.176); the case's result is a verdict (R84 p.173).
  - Course reading: `satisfy` is the design's claim; `verify` names the check; the verdict, computed from real results, is the evidence. A `satisfy` beside a fail verdict is a contradiction the team must resolve (remove the claim or fix the design).
  - A model whose values violate a satisfied requirement is inconsistent (RB-14 T2 wording).
- **Figure.** Three-lane diagram: Design (`satisfy … by PHY-003`), Verification (`VER-001 verify REQ-SYS-001`), Results (30 timed charges → verdict).
- **Sources.** R83 p.168; R84 pp.173, 176. ASSESSMENT_RUBRICS.md RB-14 T2.

#### S1.16 Worked example I: verification or validation, and which method (4 min)
- **Purpose.** Apply S1.4–S1.9 to AeroLink.
- **Content.** Seven items from the reference, students deciding before each reveal:
  - REQ-SYS-001 charge to dispatch threshold ≤ 20 min → verification, test (VER-001, 30 timed charges).
  - REQ-SYS-003 landing energy ≥ 20 % on every plan → verification, analysis (VER-003): every pair and wind case cannot be flown.
  - REQ-SYS-004 weather dispatch hold → verification, demonstration (VER-004); inconclusive until the weather limit (TBD) is set.
  - REQ-STK-007 step-free boarding → verification, inspection (VER-011).
  - REQ-SYS-006 availability ≥ 90 % per month → verification, analysis of maintenance records (VER-006).
  - REQ-SYS-002 pad-edge noise ≤ 65 dBA → verification, test (VER-002); the TPM-002 prediction (63.5 dBA) is tracking evidence only.
  - MOE-001 passenger wait (90th percentile) → validation, analysis of operational data.
- **Figure.** The table from the reviewed old Week 12 lesson (item, V or V, method, reason).
- **Sources.** R49 pp.149–150; R23a p.639. AeroLink: `src/model/reference/week04.ts`, `week05.ts`, `week12.ts`; `aerolink_v04_full.sysml` (Verification).

#### S1.17 Worked example II: VER-001 for REQ-SYS-001 (5 min)
- **Purpose.** Read a complete verification case.
- **Content.**
  - REQ-SYS-001 takes the measured value as an `in` parameter and asserts it equals the subject's charge time (MOP-002) and is at most the 20-min limit.
  - `ChargeTimeTest`: method `test`; subject a charging system; objective with `doc` and `verify Requirements::'REQ-SYS-001'`.
  - Verdict logic: procedure not followed → error; fewer valid charges than planned → inconclusive; otherwise `PassIf` calls the requirement with the subject and the largest measured charge time, so the limit is written once.
  - The usage binds the sample size (30) and narrows the subject to the test configuration.
- **Example.** Existing `sysml/week12/aerolink_ver001_charge_time.sysml` (PASS in the 2026-10-11 checker run), two excerpts ≤ 15 lines each.
- **Sources.** R75 sl.96–98; R84 p.176. AeroLink: `aerolink_v04_full.sysml` VER-001 (the reference writes the comparison inside `PassIf` directly; contrast discussed in S1.18).

#### S1.18 What the checker accepts silently (3 min)
- **Purpose.** Draw the line before the lab.
- **Content.** Recorded course probes (release 2026-08):
  - Rejected: `verify` naming a part usage or a requirement definition; `verify` outside the objective; a method kind `simulation`; a verdict literal not in `VerdictKind`.
  - Accepted silently: a case subject that cannot be the requirement's subject; a verdict declared Boolean; a comparison rewritten inside `PassIf` and reversed; the measured value omitted from the requirement call; a case with no objective or no verdict; an objective with `satisfy … by …` instead of `verify`.
  - Consequence: these go on the self-review list.
- **Example.** Existing `sysml/week12/invalid_method_kind_simulation.sysml` (FAIL by design in the 2026-10-11 run): the fix is `analyze` with the simulation described in `doc`.
- **Sources.** Recorded probe table (old Week 12 module, worked example (b)); R84 p.176; R75 sl.96.

### Section D: Close (11 min)

#### S1.19 Inconclusive is a result; verdicts belong to a configuration (3 min)
- **Purpose.** Honest outcomes.
- **Content.**
  - Inconclusive means no determination could be made; error means the performance went wrong (R84 p.173). VER-004 cannot reach pass or fail while the weather limit is TBD.
  - Each design change must be assessed against the qualified baseline and may require parts of verification to be repeated (R49 p.150): a verdict is tied to a configuration (used in Week 13's impact analysis).
- **Sources.** R84 p.173; R49 p.150.

#### S1.20 A verdict in a model is not evidence by itself (3 min)
- **Purpose.** Prevent the most dangerous misreading.
- **Content.** In the course model, recorded-result attributes are placeholders until a real activity fills them; a "pass" computed from an estimate (for example TPM-001's 18-min estimate) shows the logic works, not that the charger meets the requirement. Evidence = real results + the configuration they came from + the case that evaluated them. (Course rule, from R23a p.634's "objective evidence" and R49 p.150.)
- **Sources.** R23a p.634; R49 p.150. Course convention.

#### S1.21 Exit: retrieval (3 min)
- **Purpose.** Retrieval.
- **Content.** Three prompts: classify "charge time measured on 30 charges" (V or V, method); what `verify` adds that `satisfy` does not; which verdict when the test rig failed mid-run.
- **Sources.** Course convention.

#### S1.22 Bridge to Session 2 (2 min)
- **Purpose.** Bridge.
- **Content.** Verification connects requirements to evidence. Session 2 connects measures and risks too, then asks whether the whole chain, stakeholder to risk, holds together: the digital thread.
- **Sources.** R30 p.1394 (named only).

**Session 1 timing.** 2+3+3 · 3+3+3+3+4+4 · 3+3+3+3+2+4+4+5+3 · 3+3+3+2 = **69 min + 6 min buffer = 75**. References slide 0 min.

## 3. Session 2: Measures, risks and the digital-thread audit, and the lab launch (75 min)

**Split.** About 47 min of lecture (S2.1–S2.16) and 22 min of laboratory launch (S2.17–S2.20).

### Section E: Measures in the model (10 min)

#### S2.1 Retrieval warm-up (3 min)
- **Purpose.** Retrieval of Session 1.
- **Content.** Pairs read a five-line verification case (unseen: a water-meter accuracy check) and find the line that would pass the checker but break the meaning (objective with `satisfy` instead of `verify`). Reveal.
- **Sources.** R84 p.176; R83 p.168.

#### S2.2 MOE and MOP with the library metadata (3 min)
- **Purpose.** Notation for the Phase I measures.
- **Content.**
  - The Parameters of Interest Metadata package identifies key parameters of interest, including MOEs and MOPs (PX8 p.561).
  - `MeasureOfEffectiveness` (short name `moe`) and `MeasureOfPerformance` (`mop`) are semantic metadata identifying an attribute as a measure of effectiveness or performance; they annotate a usage (PX8 pp.561–562; R78 sl.149).
  - The library records nothing about what a measure measures and has no TPM metadata. **Course conventions:** a `#measures` dependency, and a TPM attribute with threshold, objective, current estimate and margin.
- **Example (existing reference, PASS).** `#moe attribute <'MOE-001'> passengerWaitP90 : DurationValue;` (owned by the enterprise).
- **Sources.** PX8 pp.561–562; R78 sl.149. `sysml/reference/README.md` §3.2 (MOE/MOP and TPM rows).

#### S2.3 Worked example III: one measure, one requirement, one case (4 min)
- **Purpose.** Single-source the measure.
- **Content.**
  - MOE-001 on the enterprise; MOP-001 (assignment latency, 99th percentile) on Scheduling; REQ-STK-001 reads the enterprise's MOE-001; REQ-SYS-005 asserts its measured value equals MOP-001; VER-005 passes its measured value to REQ-SYS-005 in `PassIf`; `#measures` from MOP-001 to REQ-SYS-005 and to MOE-001.
  - Mapping rule (RB-10.4): an MOP with a requirement threshold is verified by that requirement's case; an MOE is validated in operation; a TPM is tracked by analysis until a verification replaces its estimate with a measurement.
- **Example.** Existing `sysml/week12/aerolink_moe_mop.sysml` (PASS in the 2026-10-11 checker run).
- **Figure.** Table: measure, owner, constraining requirement, assessed by.
- **Sources.** PX8 p.561; R75 sl.96–97. AeroLink: `src/model/reference/week05.ts`; `aerolink_v04_full.sysml`.

### Section F: Risks and uncertainty linked to the model (8 min)

#### S2.4 The library risk metadata (3 min)
- **Purpose.** Notation for the Phase I risk register.
- **Content.**
  - `Risk` annotates a model element with an assessment of risk in typical areas: `totalRisk`, `technicalRisk`, `scheduleRisk`, `costRisk`, each a `RiskLevel` (R86 p.559; R78 sl.147).
  - `RiskLevel` gives the probability of occurrence and, optionally, the impact, each a `Level` between 0.0 and 1.0 (R86 pp.558, 560).
- **Sources.** R86 pp.558–560; R78 sl.147.

#### S2.5 AeroLink: R-001 about the elements it threatens (3 min)
- **Purpose.** From register row to model links.
- **Content.**
  - R-001 Charging capacity lags fleet growth: metadata `about` CON-001, CON-006, CAP-003, REQ-STK-005, REQ-STK-001, REQ-STK-004 and PHY-003; `totalRisk = RiskLevel(probability = 0.6, impact = 0.8)`; likelihood 3, consequence 4, handling mitigate, owner, treatment, trigger.
  - **Course convention:** the course risk metadata specializes the library `Risk` and adds the 5 × 5 rating; probability = likelihood / 5 and impact = consequence / 5 is a course mapping, not a library rule.
- **Example.** Excerpt of `aerolink_v04_full.sysml` (`CourseRisk`, `R-001`), ≤ 15 lines.
- **Sources.** R86 p.559; `sysml/reference/README.md` §3.2 (A, R, O, U row). AeroLink: `src/model/reference/week06.ts` (old numbering).

#### S2.6 Assumptions, opportunities, unknowns; TBD and inconclusive (2 min)
- **Purpose.** The rest of the register.
- **Content.** Assumptions, opportunities and unknowns are local metadata definitions in the reference (course convention); an unknown with a TBD value (U-001, weather limits) links to the requirement (REQ-SYS-004) and explains its verification's inconclusive verdict. The library `StatusInfo` metadata can mark a requirement `tbd` (PX8 pp.556–558; reference README).
- **Sources.** PX8 pp.556–558 (status kinds); `sysml/reference/README.md` §3.2. Course convention. (Cause-and-effect chains for risks are Week 13 material.)

### Section G: The digital thread and its audit (21 min)

#### S2.7 What a digital thread is: two characterizations (3 min)
- **Purpose.** Sourced concept, with its two senses.
- **Content.**
  - SEBoK (Digital Engineering): computer-readable models of all aspects of the system on shared data schemata; MBSE is a subset of digital engineering; an ontology defining the entities and their relationships is necessary to create the digital thread linking all the models together; the digital thread "would be the authoritative source of truth concerning the system data" (R30 p.1394).
  - SEBoK (System Architecture Design Definition): digital threads as analytical frameworks providing end-to-end system simulation representations across the life cycle (R19 p.576).
  - The course uses the first sense: a linked, queryable chain of model elements.
- **Sources.** R30 p.1394; R19 p.576.

#### S2.8 The course ontology: element kinds, link types and the 11-step thread (3 min)
- **Purpose.** Make the course's thread definition explicit.
- **Content.**
  - **Course convention.** The course's element kinds and link types are its ontology; a complete thread has 11 steps: stakeholder → need → capability → requirement → behavior (function) → logical element → physical element → information flow → verification → MOE/MOP → associated risk.
  - How each link is realized in SysML v2 in the reference: `stakeholder` usages, `#derivesFrom` dependencies, `#derivation` connections, `allocate`, `perform`, item flows, `verify`, `#measures`, risk metadata `about`.
- **Figure.** The 11 steps as a horizontal chain with the SysML construct under each arrow.
- **Sources.** Course convention (`sysml/reference/README.md` §§2–4; ASSESSMENT_RUBRICS.md RB-9.3). R30 p.1394 (ontology idea).

#### S2.9 Bidirectional traceability: orphans and childless parents (3 min)
- **Purpose.** The audit's definitions.
- **Content.** DoD: bidirectional traceability ensures approved changes create no "orphaned" lower-level requirements and leave no "childless parent" higher-level requirements (each high-level requirement ultimately addressed by lower-level requirements and system element designs) (R45 p.118). Course extension: the same tests applied to needs and capabilities.
- **Sources.** R45 p.118.

#### S2.10 Audit metrics and targets (3 min)
- **Purpose.** Turn the thread into reproducible numbers.
- **Content.** Upward trace (requirements to a need or capability; needs to stakeholders); downward trace (every system requirement has a `satisfy` and a verification method); verify coverage; orphans; childless parents; complete threads; a disposition for every gap (RB-9.1–9.4). Each number states the query that produced it.
- **Sources.** ASSESSMENT_RUBRICS.md RB-9.1–9.4. Course convention.

#### S2.11 Worked example IV: auditing the reference (4 min)
- **Purpose.** Read numbers before grading them.
- **Content.** Students predict, then see (values from the reviewed earlier lesson; to be recomputed from the model before release):
  - 20 of 20 requirements have a parent; 11 of 11 needs derive from a stakeholder; no orphans.
  - Satisfied: 12 of 20 (all 10 system requirements; 2 of 10 stakeholder requirements). Verified (has a case): 11 of 20 (all 10 system; 1 stakeholder).
  - NEED-011 (disruption notice) is the deliberate childless need: a capability meets it, but no requirement derives from it.
  - Reading the 55 %: eight of the other nine stakeholder requirements have a verified child, which is evidence toward the parent, not proof (REQ-STK-005's 25-min turnaround vs VER-001's 20-min charge); REQ-STK-009 has none.
- **Sources.** R45 p.118. AeroLink: old Week 12 module (worked example (d)); DECISION_LOG W9 (NEED-011).

#### S2.12 Worked example V: thread 1 hop by hop (3 min)
- **Purpose.** Walk a complete thread live.
- **Content.** STK-005 → NEED-004 → CAP-003 → REQ-SYS-001 (through REQ-STK-005: two links for one step) → FN-006 → LOG-002 → PHY-003 → INFO-003 → VER-001 → MOP-002 → R-001. Steps 9–11 attach to the requirement and capability, not to step 8.
- **Figure.** The hop table (step, element, link, SysML construct).
- **Example (to be checker-validated; new fragment `aerolink_thread1_extract.sysml`, §4.2):** the eleven elements and ten links of thread 1 in one standalone file for the live walk.
- **Sources.** Old Week 12 module (thread table); `aerolink_v04_full.sysml` (Traceability package).

#### S2.13 Complete is not correct (2 min)
- **Purpose.** Graduate-level caution.
- **Content.** A thread can be complete by rule and wrong in meaning (a charge-time requirement reaching a passenger-information item through an operations-center allocation). All system requirements can pass while an MOE fails in service. The thread is the source of truth only as far as its links are true (instructor reasoning from R30 p.1394).
- **Sources.** R30 p.1394; instructor reasoning.

#### S2.14 Common errors (3 min)
- **Purpose.** Error catalog.
- **Content.** Method on the case differs from the method on the requirement; `satisfy` asserted although the design value violates the requirement; verdict computed from an estimate and reported as evidence; risks linked to nothing; MOEs placed on a part instead of the enterprise; coverage reported without the query; gaps without dispositions.
- **Sources.** R83 p.168; R84 p.176; RB-9.4; RB-10.2.

#### S2.15 The verification matrix as a view (3 min)
- **Purpose.** Industry practice.
- **Content.** In DoD programs the verification matrix is produced in requirements analysis and becomes part of the functional and allocated baselines (R49 p.149). In a model-based program it is a view of the verification cases, not a separate spreadsheet (instructor application). Week 14 builds stakeholder views; this matrix is the first.
- **Sources.** R49 p.149. Instructor application.

#### S2.16 Where this goes: Weeks 13 and 14 (2 min)
- **Purpose.** Bridge.
- **Content.** Week 13 uses the thread for analysis and impact ("what changes if battery capacity fades?"); Week 14 presents the coherent model, with the audit as evidence.
- **Sources.** COURSE_SCHEDULE.md.

### Section H: Laboratory launch (22 min)

#### S2.17 Lab brief (3 min)
- **Purpose.** The deliverable (§5).
- **Content.** Verification cases for ≥ 3 requirements (one with an inconclusive path); MOE/MOP attributes with `#measures`; ≥ 3 risks from the team's Week 3 register linked with `about`; the audit report with queries, numbers and dispositions; ≥ 3 complete threads; checker log; AI usage statement.
- **Sources.** §5. Course convention (minimums from RB-9.3 and the earlier verification lab).

#### S2.18 Team work: method table and thread selection (10 min)
- **Purpose.** Decisions first.
- **Content.** Teams fill the method table (requirement, V or V, method, reason) for their requirements and pick three candidate threads, naming the weakest link in each.
- **Sources.** Course convention.

#### S2.19 Instructor checkpoint (6 min)
- **Purpose.** Calibrate.
- **Content.** Two teams show their method table; the class challenges one "test" that should be analysis or inspection, or the reverse.
- **Sources.** R23a p.640 (use only testing).

#### S2.20 Close: the next 7 days (3 min)
- **Purpose.** Plan (§5.4).
- **Sources.** §5.4.

**Session 2 timing.** 3+3+4 · 3+3+2 · 3+3+3+3+4+3+2 · 3+3+2 (lecture 47) · 3+10+6+3 (lab 22) = **69 min + 6 min buffer = 75**. References slide 0 min.

## 4. AeroLink worked model example (continues from Phase I Weeks 2 and 3)

### 4.1 What continues, and from where
- **Week 2 requirements and measures → verification and measures.** REQ-STK/REQ-SYS with their method and criterion (`src/model/reference/week04.ts`), MOE-001..006, MOP-001..009, TPM-001..003 (`week05.ts`), VER-001..011 (`week12.ts`; old numbering) are realized in `aerolink_v04_full.sysml` (Verification, Measures, `#moe`/`#mop` attributes, `#measures` dependencies).
- **Week 3 risk register → risk metadata.** A, R, O, U items with `affects` links (`week06.ts`) become named metadata `about` the affected elements; R-001..R-008 specialize the library `Risk`.
- **The worked sequence in class.** (1) V or V and method table (S1.16); (2) VER-001 (S1.17); (3) MOE/MOP/VER-005 (S2.3); (4) R-001 (S2.5); (5) audit (S2.11); (6) thread 1 (S2.12).

### 4.2 Fragments

**Existing (checker status from `sysml/validation-report.json`, run of 2026-10-11).**

| File | Shows | Status | Used on |
|---|---|---|---|
| `sysml/reference/aerolink_v04_full.sysml` | 11 VER, MOE/MOP, TPM, 20 AROU items, all 381 baseline links | PASS in the 2026-10-11 checker run | S2.5, S2.11–S2.12 |
| `sysml/week12/aerolink_ver001_charge_time.sysml` | VER-001 definition and usage, requirement called in `PassIf`, four verdicts | PASS in the 2026-10-11 checker run | S1.17 |
| `sysml/week12/aerolink_moe_mop.sysml` | MOE-001, MOP-001, REQ-STK-001, REQ-SYS-005, VER-005, `#measures` | PASS in the 2026-10-11 checker run | S2.3 |
| `sysml/week12/invalid_method_kind_simulation.sysml` | Method kind not in the library (teaching error) | FAIL (intentionally invalid) in the 2026-10-11 checker run | S1.18 |
| `sysml/week13/aerolink_r002_risk_causation.sysml` | R-002 as library risk metadata (and a causation chain, Week 13) | PASS in the 2026-10-11 checker run | S2.4 (risk part only) |

These earlier-numbered files carry "Week 12"/"Week 13" headers from the old sequence; re-label or copy them to `sysml/lectures/week12/` before student release.

**Needed (proposed path `learning-studio/sysml/lectures/week12/`; must pass the checker with 0 errors, then be reviewed for meaning).**

| Proposed file | Must show | Used on |
|---|---|---|
| `aerolink_ver004_inconclusive.sysml` | VER-004 demonstration with verdict logic that returns inconclusive while U-001 (weather limit TBD) is open; REQ-SYS-004 marked `tbd` with `StatusInfo` | S1.12, S1.19, S2.6 |
| `aerolink_satisfy_vs_verify.sysml` | `satisfy REQ-SYS-001 by PHY-003` beside `VER-001 verify REQ-SYS-001`, with the design estimate (TPM-001) and recorded results kept separate; a commented variant where the verdict is fail and the `satisfy` must be withdrawn | S1.15, S1.20 |
| `aerolink_risk_links.sysml` | The course risk metadata specializing `Risk`; R-001 `about` its seven elements; one unknown linked to a requirement | S2.5–S2.6 |
| `aerolink_thread1_extract.sysml` | The eleven elements and ten links of thread 1, standalone, for the live walk | S2.12 |
| `invalid_verify_outside_objective.sysml` | `verify` written outside the objective (teaching error, intentionally invalid) | S1.18 |
| `teaching_watermeter_case.sysml` | Non-AeroLink verification case for the warm-up, with `satisfy` wrongly used in the objective (passes; semantically wrong) | S2.1 |

## 5. Laboratory outline: verification, measures, risks and the thread audit for the team's own model

### 5.1 Inputs
- The team's Phase I package: Week 2 requirements (with method and criterion) and measures; Week 3 risk register and other uncertainty items; as integrated in the Week 7 package.
- The team's model after Week 11 (requirements, logical and physical architecture, behavior, allocations, `satisfy`).
- Slides, lesson, worked examples, the self-review list (S1.18, S2.14).
- Readings (essential): R23a pp.634–640; R49 pp.149–150; R84 pp.173–177; R75 sl.96–99; R30 p.1394; R45 p.118. Extension: R23b pp.646–655; R58 pp.433–438; R64 (graduate credibility argument); PX8 pp.561–562.

### 5.2 Objectives
B12.1–B12.5 applied to the team's own enterprise.

### 5.3 Method
1. **Method table** for every requirement: V or V (course convention), method, reason (S1.7–S1.9).
2. **Verification cases** for ≥ 3 requirements, at least one non-test method and one inconclusive path; subject, objective with `verify`, method annotation, recorded-result attributes, verdict logic covering all four outcomes (S1.10–S1.17).
3. **Measures**: each MOE and MOP as an annotated attribute on its owner; `#measures` links; each mapped to the activity that assesses it (S2.2–S2.3).
4. **Risks**: ≥ 3 register risks as risk metadata `about` the affected elements; one unknown linked to its requirement (S2.4–S2.6).
5. **Audit**: queries and numbers (RB-9.1–9.4); orphans, childless parents, each with a disposition; ≥ 3 complete threads walked (S2.8–S2.13).

### 5.4 Procedure

| Step | When | Lead role | Output |
|---|---|---|---|
| 1. Method table; thread candidates | In class (S2.18) | Whole team | Method table |
| 2. Verification cases | Day 1–3 | V&V lead; each member writes ≥ 1 case | Verification package |
| 3. MOE/MOP attributes and `#measures` | Day 2–3 | Requirements & Compliance | Measures in model |
| 4. Risk and uncertainty metadata | Day 3–4 | Architecture | AROU package |
| 5. Checker run; fix errors; record warnings | Day 4 | AI & Data lead | Checker log |
| 6. Audit: queries, numbers, dispositions; three threads | Day 5–6 | V&V lead | Audit report |
| 7. Self-review against the silent-pass list | Day 6 | Whole team | Self-review table |
| 8. AI usage statement; integration and upload | Day 7 | AI & Data lead | Submission |

### 5.5 Outputs
`team-NN-week12-model.sysml`, `team-NN-week12-checker-log.txt`, `team-NN-week12-audit.md` (method table, measures mapping, coverage numbers with queries, gap dispositions, three thread tables, self-review, AI usage statement).

### 5.6 Rubric rows (from ASSESSMENT_RUBRICS.md)

| Row | Criterion | Applied this week |
|---|---|---|
| RB-10.1 | V vs V | Yes, against the stated course convention |
| RB-10.2 | Method selection | Yes ("test everywhere" is level 2) |
| RB-10.3 | Verification cases | Yes: objective, subject, method, four-outcome verdict logic, linked to requirements |
| RB-10.4 | Measures alignment | Yes |
| RB-9.1 | Upward trace | Yes |
| RB-9.2 | Downward trace | Yes |
| RB-9.3 | Complete threads | Yes (≥ 3; shown live in Week 14) |
| RB-9.4 | Trace audit | Yes: reproducible metrics and dispositions |
| RB-5.5 | Linkage (risk) | Yes: each risk linked to affected elements in the model |
| RB-8.1 / RB-8.4 | Validity; requirements semantics (`satisfy` used correctly) | Yes |
| RB-12.1–12.3 | AI usage statement | Yes |

**Grading mode.** Proposed: summative for RB-10 and RB-9.1–9.4 this week; RB-9.3 live demonstration in Week 14 (faculty decision, §11).

### 5.7 Workload (budget 8.0 h per student per week)

| Activity | Hours | Basis |
|---|---|---|
| Class sessions (2 × 75 min) | 2.5 | Timetable |
| Readings: R23a pp.634–640 (7 pp), R49 pp.149–150 (2), R84 pp.173–177 (5, dense), R75 sl.96–99 (4 slides), R30 p.1394, R45 p.118 | 1.2 | About 12 pp/h |
| Lesson and worked examples review | 0.4 | Lesson of about 3,500 words |
| Lab out of class (student's share of steps 2–8) | 2.7 | About 11 person-hours per team of 4 (cases 3.5; measures 1.5; risks 1.5; checker and fixes 1.0; audit and threads 2.5; self-review and statement 1.0) |
| Quiz (§6.1) | 0.3 | 12 items |
| Applied exercise (§6.2) | 0.7 | 40 min plus upload |
| Time log | 0.1 | |
| **Total** | **7.9** | Within 8.0 h. 3-person teams: about 3.7 h lab each (8.9 h) unless the case minimum drops to 2. The graduate credibility argument (+0.5 h) is optional this week unless faculty decide otherwise |

## 6. Assessment outline (separate from the lecture)

Unseen, non-AeroLink contexts; keys spread evenly; distractors from S1.18 and S2.14; no option longer or more qualified than the key. MITRE p.286 is not used as a key source.

### 6.1 Quiz Q12 (individual, 15 min, closed book, 12 items: 9 single best answer + 3 short answer)

| # | Objective | Bloom | Item focus (unseen context) | Key rests on |
|---|---|---|---|---|
| 1 | B12.1 | Understand | Which statement is SEBoK's definition of verification? | R23a p.634 |
| 2 | B12.1 | Analyze | A rail ticketing system: classify three activities as verification or validation under the stated convention | R49 pp.149–150; R58 p.433 |
| 3 | B12.1 | Apply | Choose the method for "the enclosure is marked with the voltage rating" | R49 p.150 (examination); R84 p.176 (inspect) |
| 4 | B12.1 | Evaluate | Which SEBoK pitfall does a plan with only tests show, and why is it costly? | R23a p.640 |
| 5 | B12.2 | Understand | What a `verify` in an objective is, and what its subject is bound to | R84 p.176 |
| 6 | B12.2 | Apply | Which verdict when the data logger failed during a pump test? | R84 p.173 |
| 7 | B12.2 | Analyze | `satisfy` vs `verify`: which statement is true? | R83 p.168; R84 pp.173, 176 |
| 8 | B12.3 | Apply | Where an MOE attribute belongs, and which metadata marks it | PX8 pp.561–562 |
| 9 | B12.5 | Analyze | Identify the orphan and the childless parent in a small trace table | R45 p.118 |
| 10 (SA) | B12.2 | Evaluate | A clean checker log for a case whose objective uses `satisfy … by`: write the finding and the fix | R84 p.176; R83 p.168 |
| 11 (SA) | B12.4 | Apply | Write the risk metadata line that links a given risk to a requirement and a part, with probability and impact | R86 pp.559–560 |
| 12 (SA) | B12.5 | Evaluate | Coverage is 100 % but an MOE fails in service: give two reasons a complete thread can still mislead | R30 p.1394; R23a p.636 |

Scoring: 1 point each for 1–9, 2 points each for 10–12; total 15.

### 6.2 Applied exercise (individual, about 40 min, open book, unseen case)
- **Case brief** (about 300 words, FICTIONAL): a municipal water-meter replacement program with five requirements (accuracy, read interval, battery life, tamper alarm, enclosure marking), two measures and two risks.
- **Tasks.** (1) Method table with reasons (B12.1). (2) One verification case in SysML v2 text for the accuracy requirement with four-outcome verdict logic (B12.2). (3) The MOE/MOP attributes and their assessment mapping (B12.3). (4) Risk metadata for one risk linked to the affected elements (B12.4). (5) Audit a provided trace table: compute coverage, list the orphan and the childless parent, and disposition each (B12.5).
- **Rubric** (4 levels each, 20 points): method choice and reasons; verification case semantics (subject, objective, `verify`, verdicts); measures placement and mapping; risk linkage; audit correctness and dispositions. Graded on meaning; syntax slips that do not change meaning cost at most one level in total.

**Exam placement.** The earlier plan had a model-reading exam covering behavior, the digital thread and verification at about this point; the new schedule leaves exam placement open (§11).

## 7. Continuity link to the Phase I artifacts

| Phase I artifact (team package) | Week 12 model element | Rule |
|---|---|---|
| Week 2 requirements with verification method and criterion | `verification` cases with `@VerificationMethod`, objective `verify`, verdict logic | COURSE_SCHEDULE rule 6 (Week 12 ↔ Week 2) |
| Week 2 measures framework (MOE, MOP, TPM) | `#moe`/`#mop` attributes; TPM attributes; `#measures` dependencies | Rule 6 (the measures enter Phase I in Week 2 per the reuse map) |
| Week 3 risk register and AROU items | Risk metadata (`Risk` specialization) and A/O/U metadata `about` affected elements | Rule 6 (Week 12 ↔ Week 3) |
| Week 3 technology readiness | Referenced only; modeled in Week 13 | Rule 6 / coordination |
| Phase I trace tables | The audit computed from the model | Rule 6 |

Faculty source for the lab mapping: S04 Week 9 Lab (digital thread construction, traceability matrix), Week 10 Lab (verification and measures) and Week 12 Lab (risk and AROU modeling with impact chains). This week covers the first two and the linkage part of the third; impact chains are Week 13.

## 8. Section transitions (summary)

| From → to | Transition line |
|---|---|
| S1 A → B | Two different questions hide in the word "tested" |
| B → C | The same ideas in the model: what is checked, about what, how, with which outcomes |
| C → D | Honest outcomes: inconclusive, error, and why a modeled verdict is not evidence |
| S2 E → F | Measures say how well; risks say what could stop it; both attach to the same elements |
| F → G | Does the whole chain, stakeholder to risk, hold together? |
| G → H | Now your team builds and audits its own thread |

## 9. Source gaps

1. **Digital thread definition.** SEBoK gives two characterizations (R30 p.1394; R19 p.576) and no single definition; no course source defines a "complete thread". The 11-step thread is a course convention (RB-9.3).
2. **Traceability semantics in SysML v2.** The course link types (`#derivesFrom`, `#measures`, `#mitigates`, `#affectedBy`, `#receivesFrom`) are user-defined keywords (metadata definitions) in the reference, each written from the dependent element (`from` = client, R80 pp.50–51; `#affectedBy` from the affected element, `#receivesFrom` from the consumer), not library relationships; only `satisfy`, `verify`, `allocate`, derivation connections (PX7) and risk metadata are sourced.
3. **TPM.** No library TPM metadata exists (PX8 pp.561–562 covers MOE and MOP only); the TPM attribute pattern is a course convention.
4. **5 × 5 risk mapping.** The library uses probability and impact in [0, 1] (R86 pp.558–560); the likelihood/5 and consequence/5 mapping is a course convention.
5. **Validation in the model.** No course source shows a SysML v2 construct for validation activities against MOEs; the course treats validation as an analysis or operational activity recorded in `doc` (gap; possibly an analysis case in Week 13).
6. **Verification-method crosswalk.** DoD, SEBoK and SysML vocabularies differ (S1.8); no source gives an authoritative mapping.
7. **Audit numbers** are from the reviewed earlier lesson and the reference at that time; they must be recomputed from the current model before release, and will change if the pending Week 1 case changes add NEED-012..017 without child requirements (six new childless needs).
8. **Checker behavior** rests on the recorded probes of 2026-10-11 (release 2026-08); re-run if the release changes.
9. **SEBoK p.648** (validation traceability) and **R64** (simulation-model V&V) were not re-read for this outline; cited only as readings, not for claims.

## 10. Register additions needed

| Placeholder | Source, pages | First-page title (checked) | Supports |
|---|---|---|---|
| PX8 | S06 pp.555–562 | "9.3.2 Modeling Metadata" (p.555; includes 9.3.4 Parameters of Interest Metadata pp.561–562 and `StatusInfo` pp.556–558) | S2.2–S2.3, S2.6; quiz 8 |
| PX9 | S06 pp.536–540 | "9.2.17 Verification Cases" (heading on p.536) | S1.8, S1.12; `PassIf`, `VerdictKind` |
| P12.1 | SEBoK p.576 | inside R19 (pp.569–577, "System Architecture Design Definition"); no new entry, but the lesson must cite R19 p.576 for the second digital-thread characterization | S2.7 |

**Essential readings proposed:** R23a pp.634–640; R49 pp.149–150; R84 pp.173–177; R75 sl.96–99; R30 p.1394; R45 p.118. **Extension:** R23b pp.646–655; R58 pp.433–438; R64; PX8 pp.561–562; R86 pp.558–560; R78 sl.147–149.

## 11. Open items for faculty

1. Confirm the V&V course convention (stakeholder and system requirements are verified; needs and MOEs are validated).
2. Exam placement: a model-reading exam (behavior, thread, verification) near Week 12 or 13, or none (open schedule decision).
3. Grading mode: summative RB-10 and RB-9.1–9.4 this week; RB-9.3 live in Week 14.
4. Whether a stakeholder requirement may count as verified through verified children (currently "evidence toward, not proof").
5. Approve the new teaching fragments (VER-004 inconclusive, satisfy-vs-verify, risk links, thread extract, water-meter warm-up).
6. Pending Week 1 case changes: if NEED-012..017 are adopted without requirements, the reference audit gains six childless needs; decide whether to add requirements or teach them as audit findings (NEED-011 is currently the one deliberate childless need).
7. Graduate credibility argument (R64): required or optional this week.
8. Approve PX8 and PX9; confirm that R19 p.576 may be cited for the digital-thread characterization.
9. Re-label or copy the earlier-numbered `sysml/week12/` and `sysml/week13/` files before student release.
