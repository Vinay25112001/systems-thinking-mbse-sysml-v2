# Week 1 re-review (after fixes to W1-F01 to W1-F25)

- **Reviewer:** independent adversarial reviewer (Claude agent; did not author the material or the fixes)
- **Date:** 2026-10-11
- **Scope:** `src/content/weeks/week01.ts`, `src/content/week1.ts`, `src/content/quizWeek1.ts`, `src/content/causalLoops.ts`, `src/sim/aerolink.ts` + `aerolink.test.ts`, `src/components/DynamicsExplorer.tsx`, `CausalLoopDiagram.tsx`, `components.test.tsx`. Checked against the first review (`week01_review.md`), `docs/AUTHORING_GUIDE.md`, `ASSESSMENT_RUBRICS.md`, `LABORATORY_AND_CAPSTONE_PLAN.md`, and the cited source pages (`python -I scripts/source_pages.py`).
- **Method:**
  - I re-ran the model through a temporary `src/sim/zz_rereview.test.ts`, since deleted. It covered all three scenarios, the month-by-month trace for months 0–29, and 30 single-parameter variants of "Fleet grows, charging does not".
  - I applied 6 mutations of my own and reverted each one exactly.
  - I re-read every new or changed citation against the source pages.
  - I checked all ten quiz items in full.

## Verdict: **PASS WITH FIXES**

All 25 original findings are closed or substantially closed. The model claims are now true, and the tests check them against counterfactual runs. The explorer has a data table, a three-state binding-constraint indicator, a supply-line option and surplus indicators. The quiz meets the Bloom target, and the citations are faithful.

The fixes introduced **two new major defects**. Both need small content edits, not model changes:

- **W1-R01:** the explorer marks "Limits to Growth" as wrong for the market-limited scenario, but the course's own quiz (q1-5) and R05 classify it as Limits to Growth.
- **W1-R02:** on the very measure the activity and memo require (surplus aircraft-months), the headline leverage answer (a), "scale chargers with the fleet", comes out *better on both measures* (1,135 → 1,079). The answer key presents it as a trade-off.

Seven minor findings follow. **No critical issue is open. Two major issues are open (W1-R01, W1-R02).**

## Tool runs

| Command | Result |
|---|---|
| `npx vitest run src/sim src/content src/components` | 4 files, **66 tests passed**, 0 failed |
| `npx tsc -b` | **exit 2.** All 11 errors are in `src/activities/week02/ConcernArouRecorder.tsx` and `week02/logic.test.ts` (`stakeholder` not in `Entry`). They come from an in-flight, uncommitted edit by another session to `src/activities/week02/register.ts` (modified 17:25 today, during this review). No Week 1 file is implicated. Re-run once that edit lands. |
| `git diff --stat -- src` after every mutation revert | empty (the only working-tree change in `src/` is the other session's `week02/register.ts`) |

## Model evidence (re-run, unmodified model)

| Run | Riders m60 | Served m60 | Wait m60 | Fleet m60 (on order) | Regime m60 | Surplus aircraft m60 / incl. on order | Surplus aircraft-months (60 m) |
|---|---|---|---|---|---|---|---|
| Fleet grows, charging does not | 2,596 (8.7 %) | **7,788 (90.1 % of 8,640)** | **20.3** | **40** (0) | charging | 25.6 / 25.6 | **1,135** |
| … + chargers scale (leverage a) | 28,776 | – | 4.2 | 276 | demand | 70.5 / 70.5 | **1,079** |
| … chargers 12 / 18 / 24 (slider) | 5,163 / 7,695 / 10,184 | – | 19.3 / 18.3 / 17.2 | 45 / 118 / 128 | charging | – | 679 / 2,286 / 2,068 |
| … supply line on | 2,596 | – | 20.3 | 19 | charging | 4.6 | 235 |
| Long procurement delay | 27,261 | – | 3.9 | 278 (78) | demand | 83.3 / **161.3** | 362 |
| Chargers scale, 3-month delivery | 27,759 (92.5 %) | – | 5.8 | 212 | demand | 13.7 / 13.7 | 449 |

Regime sequence in "Fleet grows, charging does not": `d×9 f×6 d c×45` (demand to m8, fleet m9–14, demand at m15, charging from m16). This matches the answer key exactly. In the market-limited scenario, waits exceed 15 min only at months 9–11, 17–19 and 26–27. The analytic plateau checks out: 0.3 × 0.913 × A = 0.15 × (1 − A) gives A = 0.354, a wait of 20.3 min and a utilisation of 0.901.

All of the author's headline numbers are reproduced: 7,788 served, 90.1 %, 20.3 min, fleet 40, 161 → 0, 27,261 → 5,033, 9,060 → 49 aircraft-months, 356 aircraft at m120 (1.7 × need), 92.5 %, 14 surplus, and 28,776 / 4.2 / 70.

## Mutation spot-checks (mine, not the author's M1–M10)

| # | Mutation | Tests failing | Detected |
|---|---|---|---|
| MA | `bottleneck = limitingResource` (old binary indicator) | 3 (binding constraint moves; market-limited; pinned numbers) | yes |
| MB | `inPipeline = 0` (supply-line switch disconnected) | 3 (delay over-build; supply-line trade-off; pinned numbers) | yes |
| MC | `usefulFleet = neededAtTarget` (surplus ignores charging) | 1 (aircraft beyond the 15th) | yes |
| MD | pipeline length `delay` instead of `delay + 1` | 2 | yes |
| ME | churn ∝ (1 − A)² | 6 | yes |
| MF | `attract → churn` polarity flipped to + in `causalLoops.ts` | 1 (loop classification only; see W1-R06) | yes |

Each mutation was applied by `sed` to a copy-backed file and then restored from the backup. `git diff --stat -- src` was empty afterwards.

The author's claimed runs M1–M10 ("M10 undetectable by design") are **not recorded anywhere in the repository**, so I could not verify them (W1-R07).

## Disposition of the original findings

| ID | Sev. | Disposition | Evidence |
|---|---|---|---|
| F01 | major | **RESOLVED** | Scenario text, worked example ¶4, misconceptions 3–4 and the answer key all state a plateau at about 7,788 (90 % of 8,640) set by churn balancing word of mouth, with no unmet demand. Re-run confirms 7,788 / 20.3 min; demand < capacity in every month of all three scenarios. |
| F02 | major | **RESOLVED** | The tests now assert a tail ratio in (0.85, 0.95), an analytic plateau within 0.005, frozen-15 ≡ 40 aircraft, and 2× chargers → ≥ 1.9× plateau. Each comes with counterfactuals the check must reject. My 6 mutations were all killed. The answer-key wording now matches what is asserted. |
| F03 | major | **RESOLVED** (caveat W1-R05) | `Regime = 'demand' \| 'fleet' \| 'charging'`. Delay and market-limited scenarios report demand at m60. Worked example ¶2 now runs demand → fleet → charging. The table shows the regime for every month. |
| F04 | major | **RESOLVED in Week 1** (residue in later weeks: W1-R04) | Relabelled "Limits to Growth: the charging limit". `w1-feedback` ¶4 and the answer key state that the model does *not* contain G&U, and present G&U and the Attractiveness Principle as arguable interpretations. |
| F05 | major | **RESOLVED** (minor residue W1-R06) | B4 market saturation (riders → potential (−) → adoption (+)), conditional fleet → chargers, B5–B7 and condition labels were added. The header now says polarities are local. Polarities are verified by hand (R1 0 negatives; B1, B3, B4, B5, B6, B7 one each; B2 three). |
| F06 | major | **PARTLY** | Supply-line toggle, surplus and surplus-aircraft-month indicators, a two-sided step 3 and the scenario rename are all present. However, on the required cumulative measure, leverage (a) beats the baseline on both riders and surplus, contradicting the key's trade-off framing (W1-R02). |
| F07 | major | **RESOLVED** | Instructor assumption A-002 (3 hubs × 2 = 6 turnaround chargers) is stated in worked example ¶1 and in the cautions, and recorded in `model/reference/week02.ts`. `reference.detail.test.ts` pins `turnaroundChargers === DEFAULT_PARAMS.chargers`. |
| F08 | major | **RESOLVED** | A `<details>` data table with an every-1/3/6/12-month selector, caption, `scope` headers and a scrollable region with an aria-label. Series differ by dash pattern. The facilitation note is now true. |
| F09 | major | **RESOLVED** | Bloom spread is 2 U / 4 Ap / 3 An / 1 Ev (q1-1 U, q1-2 Ap, q1-3 U, q1-4 Ap, q1-5 An, q1-6 Ap, q1-7 An, q1-8 Ev, q1-9 Ap, q1-10 An). |
| F10 | major | **RESOLVED** | Polarity item q1-4 (B1.2), saturation/net-polarity item q1-5 (B1.2), enterprise item q1-3 (B1.1) and emergence/reducing-variety item q1-10 (B1.1). Enterprise is now defined (R07 p.815). Residual nit: "environment" (B1.1) still has no item. |
| F11 | major | **RESOLVED** (minor residue W1-R08) | The memo is "always read and scored on the RB-1.4 causal-argument clause (B-CLO1)" and is also filed as RB-16 entry 1. Not recorded as a faculty decision. |
| F12 | minor | RESOLVED | Exact quotation "documenting requirements, then proceeding with design synthesis …" (INCOSE 2012, as quoted in SEBoK) verified on R01 p.53. The list is now written as activities. |
| F13 | minor | RESOLVED | `w1-emergence`, `w1-lifecycle`, `w1-soi` are now `mixed`, with application sentences introduced by "Applying this to AeroLink…". |
| F14 | minor | RESOLVED | Now reads "state variables are generally continuous …" (R03 p.269 verbatim sense). |
| F15 | minor | RESOLVED | Now reads "the 15th aircraft still adds 240 trips; from the 16th … nothing"; cost is marked as outside the model. |
| F16 | minor | RESOLVED | The equifinality item was replaced by a reducing-variety item (q1-10). No defensible distractor remains. |
| F17 | minor | RESOLVED | Distractors are now Balancing with Delay, Drift to Low Performance and Fixes that Fail (all on R05 p.283, explanations faithful). The stem says "+20 % then stop rising" (6,500 → 7,788 verified). |
| F18 | minor | RESOLVED | Instruction 4 and template §5 now say "influenced by it without controlling or influencing it" (R50 p.48). |
| F19 | minor | **PARTLY** | Week 1 is internally consistent (RB-1.1 + RB-1.4 causal clause; RB-12.1–12.2 + 12.3 for AI-suggested EXT; mixed mode documented; `w1-deliverable` removed). `LABORATORY_AND_CAPSTONE_PLAN.md` lines 116 and 184 still say "RB-1.4 (formative)" only (W1-R08). |
| F20 | minor | RESOLVED | The `w1-lab` block lists the same 5 steps as the LabSpec. The four roles and the 3-person merge rule (FD-24) are named. EXT-001 is the ANSP, matching C.2 and the instructor reference. |
| F21 | minor | RESOLVED (but see W1-R01) | The archetype is hidden behind a committed select (component-tested). Step 3 is restated on wait-below-tolerance plus riders plus surplus. |
| F22 | minor | RESOLVED | The memo line includes R03 pp.268–271 + R05 pp.283–284 (6 pp ≈ 0.4 h). The total is still 2.5+0.3+1+0.2+2.5+1.2+0.3 = 8.0 h. |
| F23 | minor | RESOLVED | Now described as "over-build". Measured at 120 months after the pipeline empties (fleet 356, onOrder 0, 1.7 × need), and test-pinned. |
| F24 | minor | RESOLVED | The boundary key and answer key name the endogenous-variable vs control criterion as a discussion point. |
| F25 | minor | RESOLVED | Fleet- and charging-capacity series are on the trips chart; both are also in the data table. |

## New findings

| ID | Sev. | Location | Finding | Evidence | Fix |
|---|---|---|---|---|---|
| W1-R01 | **major** | `DynamicsExplorer.tsx` `MATCHING_CHOICE.balanced`; `aerolink.ts` SCENARIOS[2].archetype; `week01.ts` answerKey[3] | For "Chargers scale, 3-month delivery" the only "matching" choice is "Reinforcing growth limited by the market". A student who commits "Limits to Growth" is told "does not match the model structure". Yet R1 meeting B4 *is* Limits to Growth by R05 p.283 ("a reinforcing process of accelerating growth … will encounter a balancing process as the limit of that system is approached"), and the course's own q1-5 explanation says so: "This is the Limits to Growth pattern: a reinforcing process meets a balancing process as the limit is approached." So the student-facing feedback contradicts the quiz key and the source. "Reinforcing growth limited by the market" is also not an R05 archetype, and its descriptive wording makes it a giveaway among the six choices. | `DynamicsExplorer.tsx:38–42`; `quizWeek1.ts` q1-5 option b explanation; R05 p.283. | Accept "Limits to Growth" for the market-limited scenario. Either label it "Limits to Growth: the market limit (R1 meets B4)" and drop the invented choice, or allow a set of matching choices per scenario. Align answerKey[3] and the scenario archetype string. |
| W1-R02 | **major** | `week01.ts` `w1-act-dynamics` step 3, answerKey[4] (a), facilitation[3], assignment instruction 3 and template §4; `aerolink.ts` SCENARIOS[2].description | Step 3 and the memo require "surplus aircraft-months" (cumulative, `excessAircraftMonths`) as the second measure. For leverage (a), "scale chargers with the fleet", that measure **falls** from 1,135 to 1,079 over 60 months, while riders rise from 2,596 to 28,776. On the required measures, (a) dominates the baseline. The key instead frames (a) through the month-60 *snapshot* ("about 70 aircraft are surplus at month 60") as not free, and asks "Is the change with the most riders also the best use of capital?" expecting "no". A student who reports exactly what is asked will reach the opposite conclusion and be marked down against the key. The surplus measure also ignores the 132 chargers added (6 → 138), which is where the real capital goes, and the measure itself counts fixed-charger aircraft beyond 14.4 as surplus. Separately, step 3's "single change … with the most riders" has only one feasible answer: no other policy control brings the month-60 wait below 15 min (chargers slider 24 → 17.2 min; delay, target and supply line → 20.3 min). | Re-run: base 1,135 vs chargers-scale 1,079 surplus aircraft-months; snapshot 25.6 vs 70.5. | Put both measures for (a) in the key (1,135 → 1,079 aircraft-months; 25.6 → 70.5 at m60). State that the cumulative measure favours (a) and that the capital question is about chargers, which the model does not price. Either add a charger-count or charger-months readout, or make the step-3 question "which measure would you show the capital committee, and why do the snapshot and cumulative measures disagree?". Drop "with the most riders" or allow two-change combinations. |
| W1-R03 | minor | `quizWeek1.ts` q1-5 (option b and c explanations); `week01.ts` activity step 1 | The stem asks for "the net effect of one more rider on adoption". In the model, riders also act on adoption through B1 (riders → demand → utilisation → wait → attractiveness). Including that path, the net effect is **negative well below half the market**: −1.06 per rider at the fixed-charger plateau (R = 2,596, 8.7 % of the market), and −0.51 already at R = 2,000 with a 12-min wait. So option b ("positive below half the market") is true only with attractiveness held constant. The c explanation ("the sign change … depends on market penetration") is false of the full model. Activity step 1 ("the range of ridership in which the net effect … is positive") has the same flaw. The lesson's "positive *only* while R < M/2" (a necessary condition) is correct. | Numeric derivative of `adoptionRate` with A(R) from `waitAt`/`attractivenessAt` at capacity 8,640 / 7,200. | Add "holding attractiveness (waiting time) constant" to the q1-5 stem and to step 1. Optionally make the B1 interaction a graduate discussion point. |
| W1-R04 | minor | `src/content/weeks/week03.ts:135` (student-facing); `src/model/reference/week02.ts:56` (R-001); `src/model/reference/week08.ts:108`; `docs/authoring/reference_model_notes.md:65` | The F04 fix was not propagated. Later material still calls the fixed-charger behaviour "the Week 1 growth-and-underinvestment archetype", which the corrected Week 1 explicitly says the model does not contain. (`week07.ts:87` correctly says "limits-to-growth structure".) R-001 also says "90th-percentile passenger wait", but the model and the 15-min tolerance (A-001) concern the average wait. | grep results quoted at the locations listed. | Replace with "the Week 1 Limits to Growth (charging limit) structure". In R-001 say "average wait" or justify the percentile. |
| W1-R05 | minor | `aerolink.ts` Regime doc and `bottleneck` rule; `DynamicsExplorer.tsx` `REGIME_TEXT.demand`; worked example ¶2 | "Demand" is reported whenever wait ≤ 15 min, i.e. utilisation up to ≈ 0.867. At that threshold attractiveness is 0.5, so churn still removes 7.5 % of riders a month because of capacity pressure. The label "demand (waits within tolerance; **spare capacity**)" and the worked example's "**Only now** does buying aircraft genuinely help" (at the fleet regime) overstate this. At m8 (utilisation 0.835, wait 12.1 min, A = 0.61), more capacity would still raise ridership. The m60 claims for the delay and market-limited scenarios (utilisation 0.49 and 0.65) are unaffected. | Trace m7–m8: utilisation 0.686 / 0.835, waits 6.4 / 12.1, regime `demand`. | Rephrase as "demand (waits within tolerance)" and "buying aircraft now helps most". Optionally note that the boundary is a convention set at riders' tolerance. |
| W1-R06 | minor | `causalLoops.ts` ordering links; `aerolink.test.ts` polarity test | (a) The header claims each sign is a partial effect read from the equations, but `util → orderRate (+)` is a threshold gate. The order *size* is `demand/(600·target) − fleet − supply line`, so a `demand → orderRate (+)` link is missing, and with chargers fixed, raising capacity does not reduce the order size. (b) The "polarities agree with the model's partial effects" test checks only 3 computed links (util → wait, wait → attract, attract → adoption) plus 2 hard-coded ones. `attract → churn`, `churn → riders`, `fleet → orderRate` and `orders → orderRate` are guarded only by the loop-kind table, so a double flip on one loop would pass (MF was caught only by loop kind). | `aerolink.ts` ordering block; `aerolink.test.ts` "link polarities agree…". | Add `demand → orderRate (+)` and mark `util → orderRate` as the gate (condition already present). Extend the partial-effect test to every link that has a closed form (churn, ordering). |
| W1-R07 | minor | review trail | The author's disposition cites mutation runs M1–M10, including "M10 undetectable by design", but no record exists in the repository (`grep` for M1–M10 / mutation finds only other weeks' tests and notes). A claim that cannot be checked is not evidence, and the "undetectable by design" mutation in particular should be named and justified. | `grep -rln -E "\bM10\b\|mutation"` returned no Week 1 file. | Record M1–M10 (diff, expected failing test, observed result) in `docs/authoring/week01_notes.md` or in the test header, including what M10 is and why it is accepted as undetectable. |
| W1-R08 | minor | `LABORATORY_AND_CAPSTONE_PLAN.md` lines 116 and 184; `FACULTY_DECISION_REGISTER.md`; `ASSESSMENT_RUBRICS.md` RB-1.4 | (a) The lab plan still lists only "RB-1.4 (formative)" for L1 / W1, while Week 1 now scopes RB-1.1 + the RB-1.4 causal clause. (b) Scoring the memo on "the RB-1.4 causal-argument clause" has no level descriptors of its own: RB-1.4 levels 2–1 are about stakeholder relationships. (c) The first review asked for the memo-grading choice to be recorded as a faculty decision, and none exists. | The files and lines listed. | Align the lab plan rows. Add one-line clause-level descriptors for Week 1 (e.g. 4: dominant loop and delay or limit argued with explorer values; 1: none). Log the memo-grading choice as an FD or OPEN_QUESTION. |

## What I verified

- **Citations (new or changed):**
  - R01 p.53 quotation: exact.
  - R01 p.54: change example, three phases and agents, "product, a service, and/or an enterprise".
  - R03 pp.268–271: Hitchins "key" concept, open system, state and event, "state variables are generally continuous …", synergy and reducing variety, Simon hierarchy, encapsulation, control hierarchies.
  - R05 pp.283–284: Limits to Growth, Balancing with Delay, G&U, Attractiveness Principle, Drift to Low Performance, Fixes that Fail (in "Long-Term vs Short-Term Trade-offs"), High Leverage / Wrong Direction.
  - R07 pp.815–816: Rebovich and White definition, "not equivalent to an organization … frequent misuse", multiple owners (MOD definition), "collection of functions connected solely by information systems" (Rouse).
  - R50 p.48: "What is my enterprise? … control … influence … do not control or influence but which influence me".
  - All are faithful. Quoted fragments are exact, and paraphrases do not overclaim.
- **Quiz (all 10):** one keyed answer each, and the arithmetic is correct (q1-9: 18 × 600 = 10,800 > 8,640; 10,800 + 8,640 = 19,440). Model numbers in stems match the re-run (q1-7: 7,800, +20 %, onOrder 0 from m22; q1-8: 161, 27,261 → 5,033; q1-10: 7,788 / 40 / 30 = 6.49 trips per aircraft per day). Objective tags are sensible. The only defects are W1-R03 (q1-5 scope) and the q1-5 vs explorer conflict in W1-R01.
- **Text against model:** every number in the scenario descriptions, worked example, misconceptions, answer key, quiz and facilitation notes matches the re-run and is pinned in `aerolink.test.ts`'s "pins every number" test. The causal-loop polarities and loop kinds match my hand check.
- **Structure:** sessions 75 + 75 min, workload 8.0 h. The lab block and LabSpec agree. Assignment, rubric scope and mixed mode are documented. Provenance is `mixed` where applications appear. FICTIONAL labelling is intact, and the A-002 reconciliation with the Data Sheet is in place.
- **Accessibility:** the data table and dash patterns are present. The causal-loop text equivalent lists conditions, and conditional and delayed links use line patterns as well as colour. The archetype select is labelled, and `components.test.tsx` asserts hide-until-commit, the table row count and the regime text.
- **Hygiene:** the temporary `src/sim/zz_rereview.test.ts` was deleted. All mutations were reverted (`git diff --stat -- src` empty for Week 1 files). No course or app file was edited.
