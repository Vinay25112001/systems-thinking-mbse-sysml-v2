# Week 3 independent review: Mission analysis, needs, capabilities and ConOps

Reviewer: independent adversarial review (not the author). Date: 2026-10-11.

Scope:
- `learning-studio/src/content/weeks/week03.ts`
- `src/activities/week03.activity.tsx` and `src/activities/week03/*` (logic and tests)
- `docs/authoring/week03_notes.md`

Checked against:
- `course.ts`
- `AUTHORING_GUIDE.md` and `schema.ts`
- `ASSESSMENT_RUBRICS.md` (RB-1, RB-2, RB-12, RB-16)
- `LABORATORY_AND_CAPSTONE_PLAN.md` (L3, §C.2, B.4, B.5)
- Syllabus §11–12 and §14
- `WEEKLY_INSTRUCTIONAL_PLAN.md` Week 3
- `src/model/reference/week01–04.ts`

Sources: every register page of R10 (p.543–547), R11 (p.549–556), R12 (p.860–863), R52 (p.298–303), R53 (p.293–297) and R59 (p.452–458) was read in full via `python -I scripts/source_pages.py`.

The probes below were run with `node_modules/.bin/jiti` on scratch scripts kept outside the repo. No course or app file was edited.

## Verdict: **PASS WITH FIXES**

There are no critical defects. Most citations are faithful and every page lands. The worked-example arithmetic is right as stated. Accessibility is good.

The module still repeats three defect classes from the Week 2 review:
- an instructor reference that fails the module's own rules;
- tests that pass for the wrong reason;
- recorders that cannot apply the AI-suggested-reviewed tag.

It also misstates SEBoK's MGO structure, which is the core of B3.1. In addition:
- the need-studio checks pass trivial or wrong inputs;
- the CP1 ConOps does not ask for three of MITRE's four "critical components", although the lesson teaches them as mandatory;
- the graduate gap analysis has no scoring rule and an implausible time budget.

Counts: **critical 0 · major 8 · minor 17**.

## Tool runs (from `learning-studio/`)

| Command | Result |
|---|---|
| `npx vitest run src/activities/week03 src/activities/week04 src/content` | **6 files, 131 tests passed** (exit 0, 22 s) |
| `npx tsc -b` | **exit 2**: 2 errors, both in `src/sim/zz_tmp.test.ts` (TS2591, `process`). That file was created at 17:30 during this review, so it is another author's concurrent temporary file. No error is in a Week 3 file. |
| `npx oxlint src/activities/week03 src/activities/week04 src/content/weeks/week03.ts src/content/weeks/week04.ts` | no output (clean) |

## Findings

| ID | Sev. | Location | Finding | Evidence | Recommended fix |
|---|---|---|---|---|---|
| W3-F01 | major | w3-mission ¶5 and table; q3-1 (stem, key and explanations a, d); q3-2 option c; `mgo.ts` | **SEBoK's four-level MGO structure is collapsed into three.** SEBoK keeps objectives and measures as separate levels. Its own example objectives are qualitative: "Receive finished home brew coffee within minutes upon request", "Increase market share of Company X sales regions". The quantity sits in a separate **Measure**: "within 2 minutes", "by 20%". The module makes every objective carry measure, target, unit and horizon, and the recorder enforces this. It then presents the result as SEBoK's. q3-1 asks which revision "best meets SEBoK's description of an objective". The keyed answer is a SEBoK *measure*. Distractor d ("minimise waiting") is closer in form to a SEBoK objective. Its explanation even concedes the point: "SEBoK asks for measures used to validate the system against objectives". q3-2c calls a 0-exceedances target "an objective (MGO-006)", but in SEBoK it is a measure. "Horizon" and "trace to a concern" are attributed to R10 p.543–544, but neither appears there. | R10 p.546: "Consumer Objective: Options of brew or expresso. Receive finished home brew coffee within minutes upon request. • Consumer-focused Measure: Finished home brew provided within 2 minutes…"; R10 p.544: "Measures are quantitative metrics used to validate the SoI against the objectives". | State that SEBoK separates objective and measure (MOE). Say that the **course** requires each objective to carry its measure and target, and label this as a course convention. Reword q3-1 to "best meets the course's objective rule (RB-2.1)", or key it to an objective + measure pair. Rewrite the d and q3-2c explanations to match. Remove the R10 attribution for horizon and concern trace. |
| W3-F02 | major | `reference/week03.ts` MGO-005…008; w3-mission table; answerKey[1]; `logic.test.ts` "the reference objective MGO-005 passes" | **The reference objectives fail the MGO recorder and RB-2.1 level 4.** Feeding the reference objectives into `checkMgo` gives: MGO-005 fails `traced`; MGO-006 fails `horizon`, `traced`; MGO-007 fails `measure` (no unit), `traced`; MGO-008 fails `parent` (it derives from the *mission* MGO-001, skipping a goal), `measure`, `horizon`. The lesson table shows the same thing: MGO-005/006/007 trace only to a parent MGO, not to a concern, and MGO-008 → MGO-001. Even so, the answer key presents them as the model answer. The test "the reference objective MGO-005 passes" passes for the wrong reason. It builds a hand-made draft with `concerns: ['CON-001']` and a different horizon, neither of which the reference has. The only test on the actual reference objectives checks `typeof target === 'number'`. MGO-006 also records `unit: 'dBA'` for a count of exceedances. | Probe output: `MGO-005 ["traced"]`, `MGO-006 ["horizon","traced"]`, `MGO-007 ["measure","traced"]`, `MGO-008 ["parent","measure","horizon"]`. `reference/week03.ts:122–125`: `ln('MGO-005','derives-from','MGO-002')` only; `ln('MGO-008','derives-from','MGO-001')`. | Add CON traces, horizons and units to the reference objectives. Insert a goal for MGO-008, for example under a new "safe operation" goal, or re-parent it. Replace the test with one that runs `checkMgo` on every reference MGO, rebuilt from the model, and expects no failures. |
| W3-F03 | major | answerKey[5] "reference SCN-002, SCN-003/004 and SCN-005 … Each must pass the builder's ten checks"; `reference/week03.ts` SCN-001..005 | **The reference scenarios cannot pass the builder's checks the key says they pass.** The reference scenarios have no trigger and no primary actor. Their alternate flows give no rejoin/end outcome (for example SCN-002 A1 "hold, or divert…"). Several have no failure end state: SCN-002's `endState` is success only. The only test on the reference (`scenarioCoverage`) checks that five string fields are non-empty. The worked example (c) SCN-005 (7 steps, 3 alternates, A2 at step 3) also differs from the reference SCN-005 (5 steps, 2 alternates, A2 at step 2). Both are labelled the official SCN-005, and the key points to both. | `reference/week03.ts:80–86` SCN-002 endState "Passengers delivered; flight data logged; …"; no `trigger` attribute in any SCN; `scenarios.ts:265` `FIELDS` omits trigger and failure end state. | Bring the reference scenarios to the builder's shape: trigger, primary actor, a rejoin or end for each alternate, and separate success and failure ends. Make the reference SCN-005 the worked example. Add a test that parses each reference SCN through `checkScenario`, or that stores reference scenarios as drafts. |
| W3-F04 | major | `needs.ts` `attributedSubject`, `CONDITION_CUES`, `checkNeed` condition rule; L3 step 2 "each passing all six criteria" | **The need-studio checks pass trivial or wrong inputs, yet passing them is the L3 acceptance rule.** (a) "Stakeholder-attributed" accepts any subject before "need(s)". "The system needs to dispatch aircraft quickly at peak hours." passes every criterion. That is the reverse of SEBoK's form ("The stakeholders need the system to…"). (b) The condition check passes **any three words** in the conditions field: "not really applicable" passes. (c) Generic temporal words count as conditions: "Passengers need to board after confirming a ride." passes on "after". (d) The solution lexicon misses common solutions. "Passengers need helipads on every rooftop at all hours", "AeroLink needs a curfew on night flights…" (the lesson itself calls curfews a mitigation), "Passengers need autonomous aircraft…" and "Investors need a bigger fleet of 30 aircraft…" all pass. The UI says the screen is lexical, but L3 and CP1 use "passing all six criteria" as the acceptance rule. | Probe output: `"The system needs to dispatch aircraft quickly at peak hours." []`; `cond-field 3 words: []`; `"Passengers need to board after confirming a ride." []`; `"Passengers need helipads on every rooftop at all hours." []`. R11 p.555: "The stakeholders need the system to". | Reject subjects that name the SoI or its parts ("system", "AeroLink", "app", "aircraft") as the needing party. Require the subject to match a traced STK name, or ask for confirmation. Require the conditions field to contain a condition cue, not just three words. Drop bare "before/after/if" as cues. Add the probes above as regression tests. Reword L3 to "passing the studio's screen **and** a team review". |
| W3-F05 | major | `MgoRecorder.tsx:26`, `NeedStudio.tsx:84`, `CapabilityBuilder.tsx:107`, `ScenarioBuilder.tsx:56` | **This repeats W2-F08.** All four recorders hard-code `provenance: 'team-derived'` and record no `owner`. The assignment's `aiUse` says "Every AI-suggested item is tagged AI-suggested-reviewed (RB-12.3)". CP1 template §8 requires that tagging. LAB §C.2 rule 5 requires an owner and a provenance tag on every element. The Week 2 recorder was fixed with a provenance selector; Week 3 was not. | `grep provenance src/activities/week03/*.tsx` → four `'team-derived'` literals; `week02/ConcernArouRecorder.tsx:73` has the selector. | Add the Week 2 provenance selector (team-derived / team-assumption / AI-suggested-reviewed + reviewed tick) and an owner field to all four recorders. Show both in the recorded tables. |
| W3-F06 | major | Assignment instruction 5, template §5, rubricScope; answerKey[4] "Full credit requires …" | **The graduate gap analysis has no scoring rule.** `rubricScope` scores CP1 only with RB-1, RB-2 and RB-12, and RB-2.3 is the same for every student: "gaps identified". Nothing says how the graduate table, its arithmetic or the "one assumption tested" are scored, or what is lost if they are missing. The key's "full credit" refers to no criterion. The graduate expectation stated in the outcomes block therefore cannot affect any grade. | ASSESSMENT_RUBRICS RB-2.3 level 4: "Capabilities derived from needs, decomposed, with gaps identified". No graduate criterion exists in RB-2. | Add a graduate rule to rubricScope. For example: for graduate students, RB-2.3 level 4 additionally requires the near/mid/far table with arithmetic and one tested assumption, and its absence caps RB-2.3 at 3. Or ask the lead for a graduate sub-criterion. |
| W3-F07 | major | `workload` row "CP1 integration and AI statement; graduate gap analysis with extension readings R12, R53 — 0.7 h" | **42 minutes cannot cover this work.** The row includes: integrating three weeks of artefacts into an 8-section CP1, writing the AI statement, building the gap table with an assumption test, and reading R12 (4 pp) plus R53 (5 pp). The reading alone is about 0.6 h at the module's own 15 pp/h. The total equals the 10 h syllabus figure only because this line is compressed. This is the same pattern as W2-F07. | Syllabus §14: Week 3 = 10 h; R12 p.860–863, R53 p.293–297. | Re-estimate honestly (CP1 integration ≈ 1.5 h team share; graduate gap analysis + reading ≈ 1.5 h). Rebalance, or flag the overrun under FD-22, and tell the lead the 10 h peak is understated. |
| W3-F08 | major | CP1 template §6; w3-conops ¶2; q3-13 key; misconception 2 | **The CP1 ConOps does not ask for three of MITRE's four critical components.** The module teaches that "any CONOPS should always include" these four: the existing system, the justification, a description of the proposed system, and scenarios. q3-13's key relies on this. Template §6 asks only for "operational environment and constraints" plus the three scenarios. The as-is / to-be framing (R10 p.545) appears nowhere in CP1. Students are taught a rule that their own ConOps is never asked to follow, and RB-2.4 cannot reward it. | R52 p.301: "any CONOPS should always include critical components … The existing system … Justification … A description of the proposed system … Scenarios". | Add to §6 (or §3) a short "existing situation (as-is) → justification → proposed AeroLink service" subsection. For a new service, the existing system is today's ground transport (EXT-005). |
| W3-F09 | minor | w3-worked-caps ¶3–4, gap table, answerKey[4]; `capabilities.ts` WORKED_GAP | **Charger occupancy is assumed to be 20 min per charge (48 per charger per day), and this is not stated.** Week 4 (REQ-STK-005 rationale) puts "connection and disconnection" inside the 5 min handling, so a pad charger is held for up to 25 min. That gives 960/25 = 38.4 charges per charger per day, or 230/day for 6 chargers. Under that reading: charging is already below the 240-trip fleet baseline; year 2 is a clear gap (−70, −23 %), not "balanced"; and year 3 needs 5 more chargers, not 3. The lesson calls 288 an "upper bound" only because of back-to-back use. It never mentions that handling time may hold the charger. | `reference/week04.ts:44` "25 min is the 20 min Data Sheet charge plus 5 min for rotor stop, safety check, connection and disconnection". | State the occupancy assumption explicitly. Show the 25 min sensitivity as the "assumption tested" example. Accept both readings in the key. |
| W3-F10 | minor | w3-capabilities ¶4; q3-9 option c explanation; misconception 5 | **The definition of a capability gap is narrowed.** The module calls it "a shortfall in the level of a capability the enterprise already has". R12 compares desired levels with a baseline that includes **planned** capability. A capability with a zero baseline is also a gap. So q3-9c is wrong for the stated reason; it is wrong because of the named solution ("buying fire engines"). | R12 p.862: "There is a baseline capability due to capability development up to that point in time, plus any additional capability planned for the future. The desired levels … are compared to the baseline". | Reword it as "a shortfall of the baseline (existing plus planned) against the desired level, including capabilities absent altogether". Fix the q3-9c explanation. |
| W3-F11 | minor | w3-capabilities ¶2; w3-advanced ¶1; w3-mission ¶3 | **Three small overclaims.** (a) "Projected gaps and excesses are **often** mapped" — R12 says "sometimes". (b) SEBoK "gives no test for any of the four" — R11 p.554 names models and diagrams as key to correctness, completeness and consistency, and p.556 names stakeholder confirmation via traceability. (c) "The user does not care about … profit" drops SEBoK's "necessarily". | R12 p.862 "are sometimes mapped"; R11 p.554 "Models and diagrams … are key to help ensure correctness, completeness, and consistency"; R10 p.546 "The user does not necessarily care". | Correct the wording as quoted. |
| W3-F12 | minor | q3-4 option b explanation | **Wrong source.** "the 10-minute figure has no evidence yet (R11 p.555)". R11 p.555 says nothing about evidence for values. R53 p.296 does: "stated with no corroborating analysis or evidence basis". | R11 p.555 text (no-shall rule and need table only). | Cite R53 p.296. |
| W3-F13 | minor | misconception 4; q3-6 option d explanation; w3-needs ¶5 | **The "needs need not be quantified" teaching uses one side of the sources.** It cites only R52 p.302. R53, cited elsewhere in the module, says operational needs "must be described and quantified" and must be "defined and quantified" for alternatives to be assessed. A student who reads R53 will see a contradiction the module never addresses. | R53 p.294: "Operational needs must be described and quantified …"; p.295: "the operational needs must be defined and quantified in a manner that allows for assessment". | Present both views: users may state needs qualitatively in a ConOps (R52), but in a needs assessment they are quantified where possible (R53). Keep B3.1 versus B3.2 distinct without claiming the sources agree. |
| W3-F14 | minor | q3-4, q3-7, q3-8, q3-10, q3-11, q3-14 | **Several quiz answers are revealed earlier in the module, and Bloom levels are inflated.** q3-4's key is the lesson's NEED-004 row plus the "at peak hours" rewrite, which Need Studio Part A displays verbatim (c4). q3-7 ("Analyse") restates the worked example's conclusion and gives the numbers in the stem. q3-8 ("Analyse") repeats w3-worked-caps ¶2 word for word ("allocating turnaround chargers … managing the queue"). q3-14 ("Analyse") restates w3-worked-scn ¶3. q3-10 and q3-11 ("Evaluate") have implausible distractors ("If something goes wrong, handle it"; "name the programming language"), so they test recognition. | `needs.ts` c4 `after`; w3-worked-caps ¶2; w3-worked-scn ¶3. | Use new AeroLink situations in the quiz, for example a different stakeholder or capability. Re-tag Bloom levels honestly, and replace the throw-away distractors with plausible near-misses. |
| W3-F15 | minor | q3-7, q3-8, q3-9 cite R12; cautions[2] | **All three B3.3 quiz items cite R12, which is an extension reading.** The capability concept itself is sourced only from R12 and R53, both extension readings. Undergraduates are assessed on readings they were not assigned. | `course.ts:83` extension: R12, R53. | Either move R12 p.860–862 (3 pp) into the required readings, or give the quiz items lesson-only support and say so. |
| W3-F16 | minor | w3-worked-scn ¶1; facilitation[2] "its staff appear as roles (R59 p.453)" | **The primary actor of SCN-005 is placed inside the system of interest.** The duty manager works in the operations centre, which the module puts inside the SoI ("aircraft, operations centre, booking and dispatch"). R59 defines actors as parties **outside** the system. Its "roles users can play" refers to external users. Citing R59 to justify staff inside the SoI as actors overclaims the source and muddies the "boundary first" lesson. | R59 p.453: "Actors are parties outside the system that interact with the system. An actor may be a class of users, roles users can play, or other systems." | Define the scenario SoI as the technical operational system (dispatch, booking, aircraft), with operations-centre staff as external users. Or keep staff inside and make passengers or the ANSP the actors. Drop the R59 attribution for the inside-SoI choice. |
| W3-F17 | minor | `reference/week03.ts` NEED-004/006/008; notes open issue 1; `review.openIssues: []` | **The reference model answer for needs does not meet RB-2.2 level 4, and the module reports no open issues.** Three reference needs state no condition, and the test fixes that as expected. The notes raise it as open issue 1, but `review.openIssues` is empty, so the module shows "self-checked" with no open issues. | `logic.test.ts:69` expects `['NEED-004','NEED-006','NEED-008']`; RB-2.2 level 4 "conditions stated". | Fix the reference conditions as suggested in the notes, or list the open issues in `review.openIssues`. |
| W3-F18 | minor | w3-worked-scn ¶3; L3 step 6 and artefact "AROU v1 … ≥ 1 exposed by a scenario"; answerKey | **The reference never runs its own discovery loop.** The lesson says writing SCN-005 exposes a new passenger-notification need and a public-transport fallback assumption. Neither exists in the reference: there is no NEED-011 and no A-003. The answer key gives no AROU v1 model answer. The reference therefore fails the L3 AROU v1 rule ("≥ 1 exposed by a scenario"). | Reference AROU after Week 3: A-001, A-002, R-001, O-001, U-001 (Week 2 only). | Add the discovered NEED and the A-item to the reference, and give the key an AROU v1 model answer. |
| W3-F19 | minor | w3-mission ¶5 and table | **The prose does not match the table.** The prose says the table shows "the mission, two of its goals and the objectives". It shows one goal (MGO-002). MGO-006 traces to MGO-003 and MGO-007 to MGO-004, and neither is shown. "Each objective names a measure, a target and a horizon": MGO-006 and MGO-008 have no horizon in the reference. | Table rows: MGO-001, 002, 005, 006, 007, 008. | Add MGO-003 and MGO-004 rows, or say "one goal". Fix the horizons (see F02). |
| W3-F20 | minor | L3 step 1 "get the team's concurrence (R10 p.545)" | **The source step is changed.** SEBoK's fourth step is **stakeholder** concurrence. Team concurrence is a different and weaker check. CP1 template §3 does ask "how stakeholders concurred", so the lab and the template disagree. | R10 p.545: "4. Stakeholder concurrence with the problem, threat, or opportunity statement." | Say "stakeholder concurrence (role-played by …)", or label team concurrence as a course simplification. |
| W3-F21 | minor | instructorNotes Session 1 "Active practice"; WEEKLY_INSTRUCTIONAL_PLAN "rewrite five solution-laden needs" | **The session plan describes a different activity from the one built.** It says pairs "rewrite the five solution-laden needs in the need studio Part A". Part A has six items, has no rewrite input (tick-box diagnosis only), and reveals the reference rewrite after checking. The storyboard brief says "two alternates", but the worked example has three. | `NeedStudio.tsx` Critique: checkboxes only; `CRITIQUE_ITEMS` has 6 items. | Add a rewrite text box to Part A that is saved before the key is shown, or change the session note to "diagnose six, rewrite on paper". |
| W3-F22 | minor | lab `continuity` "in Week 9 needs map to SysML v2 requirements and scenarios to use cases" | **Wrong week.** `course.ts` puts SysML requirements in Week 10 and use cases in Week 11. Week 4's own continuity says Week 10. | `course.ts:174–188`. | Change to "Week 10 (requirements) and Week 11 (use cases)". |
| W3-F23 | minor | `CapabilityBuilder.tsx` gap table / summary | **The gap tool contradicts the module's conclusion.** For the worked example it reports CAP-003 year 2 as "Balanced" and "first gap in the far term". The lesson and key say to treat year 2 as a gap. There is no way to mark a baseline as an upper bound, so a student who copies the tool's verdict is marked down. | Component test asserts `'w03-gap-1-mid'` "Balanced" and the summary "first gap in the far term". | Add an "upper bound / lower bound" flag per baseline that turns a within-band shortfall into a "probable gap", or print a note under the summary. |
| W3-F24 | minor | `ScenarioBuilder.tsx` record links; notes design decision | **Every model actor gets a `performs` link, including EXT-003 Weather.** The reference uses `affects` for weather. Weather does not perform a scenario, so a team's model will carry semantically wrong links that later trace audits inherit. | `reference/week03.ts:141` `ln('EXT-003','affects','SCN-005')`. | Default environmental EXT items (for example with kind or attribute "natural") to `affects`, or let the student choose per actor. |
| W3-F25 | minor | repo state | **`tsc -b` exits 2** because of another author's temporary file (`src/sim/zz_tmp.test.ts`). The definition of done ("all must pass") is not met for the tree as it stands. | tsc output above. | The lead re-runs `tsc -b` after the concurrent file is removed. |

## Citation table

Verdict key: OK = the claim is on the cited page and not overstated.

| Location | Citation | Verdict | Evidence (page, ≤ 25 words) |
|---|---|---|---|
| w3-mission ¶1 | R10 p.543 | OK | "establish the goals, objectives and measures of success of a potential solution class"; "often performed iteratively with the Stakeholder Needs Definition" |
| w3-mission ¶2 | R10 p.543–545 | OK | four steps p.545; mission/goals/objectives p.543; "Measures are quantitative metrics … expressed as Measures of Effectiveness" p.544 |
| w3-mission ¶3 | R10 p.545–546 | OK; "does not care" drops "necessarily" (F11) | p.546 "The user does not necessarily care about the developing organization's profits" |
| w3-mission ¶4 | R10 p.544, 546–547 | OK | outputs list p.544; "Operational concepts include high level operational modes or states, operational scenarios…" p.546 |
| w3-mission ¶5 / table | R10 | OVERCLAIM (F01): objective = SEBoK objective + measure | p.546 example objective vs separate "Consumer-focused Measure" |
| w3-needs ¶1 | R11 p.549–551 | OK | p.551 "correct, consistent, complete, and feasible"; nomenclature discussion |
| w3-needs ¶2 | R11 p.553 | OK | "Providing rationale often reveals the real need, especially when the stakeholder expresses a need as an implementation." |
| w3-needs ¶3 | R11 p.554–555 | OK | p.555 "needs statements do not include the word 'shall'"; "The stakeholders need the system to" |
| w3-needs ¶4 | R53 p.296 | OK | attributes list; "needs should be articulated in terms that describe a successful operation or mission instead of a proposed solution" |
| w3-needs ¶5 | R52 p.302; R11 p.555 | OK, but one-sided (F13) | "users could express their need for a 'highly reliable' system … without having to produce a testable reliability requirement" |
| w3-needs quote | R53 p.296 | OK (exact) | "Beware solutions masquerading as needs." |
| w3-capabilities ¶1 | R12 p.860–861 | OK | three kinds of capability p.860; London transport example p.861 |
| w3-capabilities ¶2 | R12 p.862 | OK; "often" OVERCLAIM (F11) | "sometimes mapped into several future timeframes"; 5/10/20 and 1/2/3 years |
| w3-capabilities ¶3 | R53 p.293–295 | OK | definition p.293; DOTLPF "new materiel solutions may not be necessary" p.294–295 |
| w3-capabilities ¶4 | R12 p.862 | Narrowed (F10) | baseline includes "any additional capability planned for the future" |
| w3-conops ¶1 | R52 p.298–299 | OK | definition p.298; DOTMLPF factors, update after testing, conceptual view p.299 |
| w3-conops ¶2 | R52 p.301–302 | OK | critical components and additional objectives p.301; best practices p.302 |
| w3-conops ¶3 | R59 p.452–454 | OK | "A mission scenario/thread … represents one path through the use case" p.452; actors p.453; failure scenarios p.454 |
| w3-conops ¶4 | R59 p.455–456 | OK (the pitfalls are Gottesdiener's as MITRE reports them) | stopping rule; pitfalls list; parameterisation list p.456 |
| w3-worked-needs | R11 p.553–555; R53 p.296 | OK | p.553 "It cannot be assumed that the only stakeholder that has this authority is the 'customer'." |
| w3-worked-caps | R12 p.862; R53 p.294–295 | OK (arithmetic is the instructor's; F09) | — |
| w3-worked-scn | R59 p.453–455; R52 p.301 | Partial OVERCLAIM (F16, actor inside the SoI) | R59 p.453 "Actors are parties outside the system" |
| w3-advanced ¶1 | R11 p.551; R10 p.546 | OK; "no test" OVERCLAIM (F11) | R11 p.554 models "key to help ensure correctness, completeness, and consistency" |
| w3-advanced ¶2 | R53 p.297; R11 p.553–554; R59 p.456 | OK | R53 p.297 "Operational needs can be driven by a subset of the key stakeholders"; R11 p.554 hacked aircraft |
| w3-advanced ¶3 | R53 p.294–295, 297; R10 p.547 | OK | R10 p.547 "generating operational changes"; R53 p.297 "One size may (or may not) fit all" |
| w3-advanced ¶4 | R10 p.543 | OK | "often performed iteratively" |
| w3-application ¶1 | R53 p.294–295; R12 p.863 | OK | R53 p.294 "required to do so by Department of Defense (DoD), Federal Aviation Administration"; R12 p.863 "commercial and civil government" |
| w3-application ¶2 | R52 p.299–300; R59 p.453, 457 | OK | R59 p.457 "Simulate the input and output from the particular use case" |
| Lab step 1 | R10 p.545 | OVERCLAIM, team in place of stakeholder concurrence (F20) | "Stakeholder concurrence with the problem … statement" |
| q3-1 | R10 p.543–544 | OVERCLAIM (F01): horizon and concern trace are not in R10 | — |
| q3-2 | R10 p.543 | OK on goals; option c explanation per F01 | "Goals allow the organization to divide the mission statement into manageable pieces" |
| q3-3 | R10 p.546 | OK | "conflicts, e.g., product price vs. profitability vs. market share, which need to be prioritized based on the organizational enterprise strategy" |
| q3-4 | R53 p.296 | OK; option b explanation WRONG SOURCE R11 p.555 (F12) | — |
| q3-5 | R11 p.553 | OK; option c cites R52 p.302 OK | "range of acceptable solution strategies" |
| q3-6 | R11 p.555 | OK | "To help distinguish needs from the requirements, the needs statements do not include the word 'shall'" |
| q3-7 / q3-8 / q3-9 | R12 p.862 | OK as citations (q3-9c reasoning per F10; extension-only per F15) | — |
| q3-10 | R59 p.453–454 | OK | "fall short of the goal (failure scenarios)" |
| q3-11 | R59 p.454–455 | OK | "Too much detail appears too early"; "Use case text includes … user interface details" |
| q3-12 | R59 p.453–454; R52 p.301 | OK | "Scenarios highlighting use of the system in the user's environment, including internal and external factors" |
| q3-13 | R52 p.299–302 | OK | "any CONOPS should always include critical components" p.301 |
| q3-14 | R52 p.301; R10 p.543 | OK | "Validate and discover implicit requirements." |
| Misconceptions 1–5 | R53 p.296; R52 p.299–301; R59 p.453–456; R52 p.302; R12 p.862 | OK (4 one-sided, F13) | — |
| Session 1 formal-concepts list | R10 p.543–544; R11 p.551, 555; R53 p.296; R12 p.862; R52 p.301; R59 p.453–454 | OK | — |
| Code `needs.ts` CRITERIA | R11 p.555, 553; R53 p.296 | OK (attribution check weaker than R11's form, F04) | — |
| Code `scenarios.ts` checks | R59 p.453–455 | OK | — |
| Code `mgo.ts` | R10 p.543–544 | OVERCLAIM as per F01 for the "measure" check | — |

No NOT FOUND or fabricated quotation. One WRONG SOURCE (q3-4b). Overclaims: F01, F10, F11, F16, F20.

## Verified as correct

- **Gap arithmetic**, using the stated assumptions:
  - Desired capacity = demand ÷ 0.8: 160/240/320 → 200/300/400.
  - Fleet: 12 × 20 = 240.
  - Chargers: 6 × (16 × 60 ÷ 20) = 6 × 48 = 288.
  - Deltas: +40/−60/−160 and +88/−12/−112.
  - −12/300 = −4 %, inside ±5 %.
  - 60 ÷ 20 = 3 aircraft; 160 ÷ 20 = 8 aircraft; 112 ÷ 48 = 2.33 → 3 chargers.
  - `gapAnalysis` reproduces these, and the zero-tolerance mutation flips year 2 to a gap.
- **Reference cycle:** 16 + 25 + 2 = 43 min; 960 / 43 × 0.9 = 20.1 trips per aircraft per day. MGO-007: 240 / 0.8 = 300.
- **Capability coverage of the reference:**
  - 10 NEED and 10 CAP;
  - every CAP is traced and every NEED is covered;
  - decomposed parents are CAP-001, 003 and 004, each with a single child;
  - NEED-002 is served by CAP-004/005/006, and CAP-001 serves NEED-001/008, as the lesson says;
  - deleting CAP-009's links leaves NEED-006 uncovered (q3-9).
- **Need Studio Part A:** the key is asserted against an **independent** expected list, so it is not true by construction. The flawless discrimination item (c6) works.
- **Answer-key consistency:** the Part A key in the answer key matches the computed diagnoses. The worked-example (a) "What is wrong" column matches them, except that row 3 also lists "regulator's real need", which is commentary.
- **Session plans** add up to 75 + 75 min.
- **Quiz structure:**
  - 14 items, each with one correct option and an explanation for every option;
  - every objective is assessed (B3.1 ×3, B3.2 ×3, B3.3 ×3, B3.4 ×5);
  - the Bloom counts in the notes (5 Apply, 5 Analyse, 2 Evaluate, 2 Understand) are accurate as tagged.
- **Workload** sums to 10.0 h, which is the syllabus figure (but see F07).
- **Accessibility:**
  - every check result is given as text ("✓ Pass" / "✗ Fix" / "✗ Not yet", "Agrees with the key", "GAP (shortfall)", "Balanced");
  - all controls are native, labelled inputs and selects;
  - the capability tree is a nested list;
  - the gap table has text in every cell.
- **FICTIONAL labelling** is present in the table captions, the worked examples, the cautions and the reference header.
- **IDs** used in the lesson (A-002, R-001, O-001, U-001, EXT-005, CON-001…013, STK-001…014) match the Week 1–2 reference with no collisions. A-002's 6 turnaround chargers and the hub/spoke split are consistent with the gap analysis.
