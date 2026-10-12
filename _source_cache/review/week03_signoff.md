# Week 3 sign-off pass: Mission analysis, needs, capabilities and ConOps (CP1)

Reviewer: Independent AI reviewer (Claude), sign-off pass. Date: 2026-10-11.

## Inputs

- First review: `_source_cache/review/week03_review.md` (W3-F01..F25).
- Authors' dispositions: `learning-studio/docs/authoring/week03_notes.md`. These were checked against the code, not taken on trust.
- Shared changes since the first review:
  - `reference_model_notes.md` change log: MGO-009 added and MGO-008 re-parented; NEED-011 and A-008 added; charger convention A-007.
  - `DECISION_LOG.md` W7 and W8.
  - `course.ts`: R12 p.860–862 is now an essential Week 3 reading.

The reference was checked at HEAD `1067a4e`.

## Material re-read

- `src/content/weeks/week03.ts`, in full.
- `src/activities/week03/*`:
  - `needs.ts`, `mgo.ts`, `capabilities.ts`;
  - the four recorders;
  - `logic.test.ts`.
- `src/model/reference/week03.ts` (MGO, NEED, CAP, SCN and A-008, with their links) and `reference/week02.ts` (A-007).
- `src/content/course.ts` (Week 3).

No course or app file was left modified. One mutation was applied and then reverted with `git checkout`; afterwards `git diff --stat` was empty for that file.

## Verdict: **SIGN-OFF**

All 25 original findings are resolved. Several were closed by the reference batch, not by the authors' notes, and the notes have not caught up (W3-S04).

The gap analysis has been rebased correctly on A-007:

- The primary case is 288 charges/day.
- The 25 min reading is kept as the sensitivity case.
- Both the content and the activity data are pinned to the reference by a test.

There are no new critical or major defects. Five minor findings are listed below. The most worthwhile to fix is W3-S01, an ID collision with the new reference NEED-011.

## Tool runs (from `learning-studio/`)

| Command | Result |
|---|---|
| `npx tsc -b` | exit 0 |
| `npx vitest run src/activities/week02 src/activities/week03 src/activities/week04 src/content src/model` | **13 files, 275 tests passed** |
| Heuristic probes (`node_modules/.bin/jiti`, scratch script outside the repo, new inputs that differ from the first reviewer's) | See W3-S05 |
| Mutation: `WORKED_GAP` CAP-003 primary baseline 288 → 230 (the pre-A-007 reading) | **4 tests fail.** One of them is "the convention matches the reference assumption A-007 …" (`expected 230 to be 288`); the component test also fails. Reverted; `git diff --stat` empty. |

## Disposition of the original findings

| ID | Sev. | Status | Evidence |
|---|---|---|---|
| F01 MGO levels collapsed | major | **RESOLVED** | w3-mission ¶2 gives SEBoK's four levels with the p.546 objective/measure pair (verified: "within 2 minutes"; "by 20%"). ¶5 labels the measure/target/unit/horizon record as a course convention, and states "R10 states neither" for horizon and trace. q3-1 is re-keyed to an objective + measure pair. The q3-1d and q3-2c explanations treat the item as a SEBoK measure. |
| F02 reference MGOs fail recorder | major | **RESOLVED** | The reference batch added MGO-009 (goal, derived from MGO-001 and CON-004) and re-parented MGO-008 under it (`reference/week03.ts` l.172–173). `logic.test.ts` l.399 rebuilds every reference MGO from the model and runs `checkMgo`, including MGO-008 (parentLevel goal, inherited CON-004). The table, ¶5 and answerKey[1] match the reference. `review.openIssues` is now correctly empty. |
| F03 reference scenarios fail builder | major | **RESOLVED** | All five reference SCNs go through `draftFromScenario` → `checkScenario` with no failures (test l.290). The worked example (c) is the reference SCN-005: 7 steps, A1/A2/A3. |
| F04 need checks pass trivial input | major | **RESOLVED** | The SoI subject is rejected. A condition now needs a cue; bare before/after/if are dropped. The lexicon has curfew, autonomy, asset expansion and vertiport infrastructure. The reviewer's probes are regression tests. L3 acceptance is "screen **and** team review". Residual gaps: W3-S05. |
| F05 recorders lack owner/AI tag | major | **RESOLVED** | `MgoRecorder`, `NeedStudio`, `CapabilityBuilder` and `ScenarioBuilder` each import `ProvenanceOwnerFields`/`ownerProblem`. No hard-coded `'team-derived'` literal remains in `week03/*.tsx`. |
| F06 graduate task unscored | major | **RESOLVED** | Notebook entry 3, always read (W7). `rubricScope` gives RB-2.3 level descriptors 1–4. The team CP1 grade is independent of it. |
| F07 0.7 h for CP1 + graduate | major | **RESOLVED (with caution)** | CP1 integration is 1.0 h and the graduate task 1.2 h, with reading narrowed. The total is 10.0 h. Caution 4 says the CP1 peak is probably understated. (See W3-S02: the new essential R12 pages are not counted.) |
| F08 ConOps components | major | **RESOLVED** | Template §6 (a)–(d) gives as-is (EXT-005), justification, proposed service and scenarios. RB-2.4 level 4 is tied to these in rubricScope and in answerKey[7]. |
| F09 charger occupancy unstated | minor | **RESOLVED** (superseded by A-007) | ¶3 states the assumption and cites A-007 as the course convention (20 min on the charger; two pads per charger). The 25 min whole-turnaround case is a sensitivity row, and both readings are accepted in the key. |
| F10 capability gap narrowed | minor | **RESOLVED** | "Baseline — what exists plus what is already planned … including a capability that is absent altogether" (R12 p.862, verified). The q3-9c explanation is fixed. |
| F11 three overclaims | minor | **RESOLVED** | "sometimes mapped" (R12 p.862); models and traceability named as aids (R11 p.554, 556); "does not necessarily care" (R10 p.546). All verified. |
| F12 wrong source q3-4b | minor | **RESOLVED** | q3-4 is a new insurer case. Option b cites R53 p.296 ("no corroborating analysis or evidence basis", verified). |
| F13 one-sided quantification | minor | **RESOLVED** | Both views are given (R52 p.302; R53 p.294 "described and quantified", verified) in the needs block, misconception 4 and q3-6d. |
| F14 quiz revealed / Bloom | minor | **RESOLVED** | q3-4, 7, 8 and 14 are new cases. q3-10 and q3-11 have plausible near-miss distractors. Bloom counts: Apply 7, Analyse 5, Understand 2. |
| F15 B3.3 cites extension reading | minor | **RESOLVED** | `course.ts` Week 3 readings now include R12 p.860–862. (Stale text remains: W3-S02.) |
| F16 actor inside SoI | minor | **RESOLVED** | The scenario SoI is the operational system and staff are external users (a course choice, labelled). R59 is used only for "actors are parties outside the system" (p.453, verified). Weather is environmental (`affects`). |
| F17 reference needs lack conditions | minor | **RESOLVED** | Reference needs carry `conditions`/`rationale`. All 11 pass the six criteria (test l.93–102). |
| F18 discovery loop not run | minor | **RESOLVED** | NEED-011 (STK-001, CON-001; met by CAP-005) and A-008 (affects SCN-005) are in the reference. Lesson ¶(c)3 and answerKey[6] cite them correctly. |
| F19 prose vs table | minor | **RESOLVED** | The table shows the mission, all four goals (incl. MGO-009) and four objectives with horizons. Rows match the reference links l.165–173. |
| F20 team vs stakeholder concurrence | minor | **RESOLVED** | "stakeholder concurrence … role-played (a course simplification)" (R10 p.545, verified). |
| F21 session vs activity | minor | **RESOLVED** | Part A has a persisted rewrite box per item. The session note says "diagnose the six … rewrite at least three". The storyboard uses SCN-003/004 with ≥ 2 alternates. |
| F22 wrong week | minor | **RESOLVED** | "Week 10 (requirements) and Week 11 (use cases)". |
| F23 tool contradicts lesson | minor | **RESOLVED** | The per-row `upperBound` flag gives a probable gap. The mutation test shows the flag is what turns the year-2 shortfall into a probable gap. |
| F24 weather `performs` | minor | **RESOLVED** | The per-actor environmental flag produces `affects`. Environmental actors cannot perform steps. |
| F25 tsc | minor | **RESOLVED** | exit 0 |

## New findings (none blocking)

| ID | Sev. | Location | Finding | Fix |
|---|---|---|---|---|
| W3-S01 | minor | q3-5 option a (`week03.ts` l.277) | **ID collision with the new reference (AUTHORING_GUIDE §7 rule 8).** The distractor reads "Record it as **NEED-011** exactly as stated" (a live-map app). Since the reference batch, NEED-011 is the reference need "Prompt notice and a way onward when a trip is disrupted". The same module teaches that need in worked example (c) and answerKey[2]/[6]. | Use a neutral wording ("Record it as a new NEED exactly as stated") or the next free ID, NEED-012. |
| W3-S02 | minor | caution 3 (l.568); workload readings line (l.579); graduate line (l.583) | **Stale after R12 p.860–862 became an essential reading.** Caution 3 still calls R12 an extension reading and "recommends to the lead" a move that `course.ts` l.82 has already made. The workload readings line counts only R10, R11, R52 and R59 (≈ 26 pp). The newly required 3 pp (≈ 0.2 h) are not counted. The graduate line still budgets reading R12 p.862, which is now inside the required pages. The net understatement is ≈ 0.1–0.2 h in a week the caution already calls tight. | Rewrite caution 3 (R12 p.860–862 required; R53 extension). Add R12 p.860–862 to the readings line (≈ 29 pp, ≈ 1.9 h). Narrow the graduate reading to R53 p.294–295. Adjust the total, or report it under FD-22. |
| W3-S03 | minor | w3-worked-caps ¶3, sensitivity sentence | "if the charger were held for the whole 25 min turnaround **(boarding on the charger)**". Under A-007 boarding overlaps the charge in both readings. What distinguishes the sensitivity case is that the charger is held through the 5 min of pad work (one charger per pad). The table row and answerKey[4] say this correctly. | Replace the parenthesis with "(one charger per pad, held through the 5 min of pad work)". |
| W3-S04 | minor | `docs/authoring/week03_notes.md` | **The disposition record contradicts the module and the reference.** F02 says "MGO-008 still skips a goal … listed in `review.openIssues`". F09 says the 25 min reading is primary and 20 min the sensitivity. F18 says "Partly". Lead request 2 still asks for MGO-009, NEED-011 and A-008, and request 3 for the occupancy decision. All of these were closed by the reference batch and W8, and `review.openIssues` is empty. The "What was built" section still says 14 quiz items with "2 Evaluate". | Update the dispositions (F02, F09 and F18 closed by the 2026-10-11 reference batch; A-007 primary), and close requests 2, 3 and 4. |
| W3-S05 | minor | `needs.ts` `SOLUTION_TERMS`/`CONDITION_CUES`/`SOI_SUBJECT`; `mgo.ts` measure/horizon (AUTHORING_GUIDE §7 rule 5) | **Residual heuristic gaps on realistic input.** The first reviewer's probes now fail correctly. These new probes were accepted with no failing criterion: "Passengers need a reservation system that confirms rides at all hours."; "Passengers need a booking function with live tracking at peak hours."; "Dispatchers need a weather feed during operations."; "Residents need noise insulation in their homes at night."; "The duty manager needs a map view throughout operations."; "Communities need AeroLink to fly fewer flights at night." (a curfew in plain words). A conditions field reading "when it is not applicable" satisfies the condition criterion. In the other direction, "AeroLink management needs more revenue at all times." is rejected as an SoI subject (a false positive). In the MGO recorder, an objective with measure "reduce waiting where feasible", target 0, unit "n/a" and horizon "eventually" passes every check, and "Provide a really great experience" passes the puffery check. The tools declare themselves lexical, and L3 requires a team review, so this is minor. | Add object-position "(reservation\|booking\|tracking\|management) system/function", "tracking", "feed", "map view" and "insulation" to the lexicon. Reject "n/a"/"none" units and non-temporal horizons ("eventually", "soon"). Add reduce/increase/improve-only measures to `VAGUE_MEASURE` when no quantity is named. Add "great" to `PUFFERY`. Allow "AeroLink <role>" subjects (management, investors). Add these as regression probes. |

## What I verified independently

### Gap analysis under A-007

- Desired capacity: 160 / 240 / 320 ÷ 0.8 = 200 / 300 / 400.
- Fleet: 12 × 20 = 240, giving +40 / −60 / −160. That means 3 aircraft (60 ÷ 20) and then 8 (160 ÷ 20).
- Convention: 6 chargers × 960 ÷ 20 = 6 × 48 = **288**, giving +88 / −12 / −112.
  - −12 is −4 %, inside ±5 %, so a probable gap against an upper bound. 12 ÷ 48 = 0.25, rounded up to 1 charger.
  - 112 ÷ 48 = 2.33, rounded up to **3**.
- Sensitivity: 960 ÷ 25 = 38.4 per charger; × 6 = 230.4, shown as **230**. This gives +30 / −70 (−23 %) / −170.
  - 70 ÷ 38.4 = 1.8, rounded up to **2**; 170 ÷ 38.4 = 4.4, rounded up to **5**. Using 230.4 gives the same roundings.
- Year 1: the fleet binds first under the convention (288 > 240); charging binds first in the sensitivity case (230 < 240).
- These figures agree with `reference_model_notes.md` §3. The lesson text, table and answerKey[4] state them correctly, and the `WORKED_GAP` data is tied to A-007 by a test (the mutation proves it).

### Reference consistency

- The MGO table rows match the reference links: MGO-002/003/004/009 → MGO-001 plus CON-001/012/005/004; objectives → their goals.
- Eleven needs and ten capabilities; CAP-005 serves NEED-002 and NEED-011.
- The answerKey[1] claim that every reference MGO passes is test-asserted. The answerKey[2] claim that "NEED-004, 006, 008 and 009 state their condition only in the field" is test-asserted (l.107).
- AROU v1 is listed as A-001, A-002, A-007, R-001, O-001, U-001 + A-008, with A-008 `affects` SCN-005.
- L3 inputs list AROU v0 including A-007.
- Caution 5 is true that NEED-011 has no REQ yet (reference notes §5).

### Citations

Each of these was read on the page:

- R10 p.544 ("Measures are quantitative metrics"), p.545 ("Stakeholder concurrence"), p.546 (coffee objective and measure; "by 20%"; "does not necessarily care").
- R11 p.554 ("key to help ensure correctness, completeness, and consistency"), p.556 (stakeholder confirmation, traceability).
- R12 p.861 (London), p.862 ("sometimes mapped"; "plus any additional capability planned for the future"), p.863 ("commercial and civil government").
- R52 p.301 (critical components; "Validate and discover implicit requirements").
- R53 p.294 ("described and quantified"), p.296 ("no corroborating analysis or evidence basis"), p.297 ("driven by a subset").
- R59 p.453 ("Actors are parties outside the system").

All land and none is overstated.

### Quiz

- 14 items, each with one correct option and an explanation per option.
- B3.1 ×3, B3.2 ×3, B3.3 ×3, B3.4 ×5.
- No stem repeats a worked example verbatim.

### AUTHORING_GUIDE §7

- Rule 1: all four recorders comply.
- Rule 2: the graduate task is always read, with descriptors.
- Rule 3: workload has a caution, but the new essential pages are uncounted (W3-S02).
- Rule 4: reference MGOs, NEEDs and SCNs pass their tools (tests).
- Rule 5: the reviewer's probes are regression tests, but residual gaps remain (W3-S05).
- Rule 6: rewritten quiz cases.
- Rule 7: SEBoK objective vs measure kept apart and the course convention labelled.
- Rule 8: one collision (W3-S01).
