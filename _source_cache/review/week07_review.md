# Week 7 independent review: Trade studies and decision analysis, and the Exam 1 bank

Reviewer: independent adversarial review (not the author). Date: 2026-10-11.

**Scope**
- `learning-studio/src/content/weeks/week07.ts`
- `src/activities/week07.activity.tsx`, `src/activities/week07/*`
- `docs/authoring/week07_notes.md`
- `src/instructor/exams/exam1.ts`: the item bank and key, plus the student-build exclusion

**Checked against**
- `course.ts`; `AUTHORING_GUIDE.md` §7; `schema.ts`
- `ASSESSMENT_RUBRICS.md` RB-6, RB-12, RB-16 and the Exam 1 (Pathway B) blueprint
- Lab plan L7; syllabus §11–12
- `WEEKLY_INSTRUCTIONAL_PLAN.md` Week 7
- Reference `src/model/reference/week05–07.ts`
- What Weeks 1–6 now teach, from the week05/06 modules and the prior reviews

**Sources read**
- Week 7 sources: R18 p.463–474; R43 p.109–110; R34 p.608–614; R35 p.1396–1399
- For the exam key: R16 p.766–770; R46 p.125–126; R40 p.69–72; R13 p.559, 565–566; R09 p.868–869; R63 p.235–237

No course or app file was edited. Recomputations and the Monte Carlo cross-check ran in a scratch directory.

## Verdict: **PASS WITH FIXES**

There are no critical defects.

**What holds up**
- The deterministic decision analysis is correct: totals, closed-form reversal points, tornado margins and the set-based tradespace all reproduce exactly.
- Citation fidelity is high, and the Keeney quotation is exact.
- The student build is verified free of exam text.

**What must be fixed**
1. **Monte Carlo shared driver.** The graduate example claims to model "one demand forecast drives every wait", but the implementation does not do that. A coherent demand model moves the headline by about 10 standard errors.
2. **Exam 1 key.** The key is inconsistent with Week 6 in two items (the SRR criteria; the TRL environment). Its own caution says it was never re-checked.
3. **Recurring defects:**
   - the simulator records no owner or provenance (rule 1);
   - quiz items are answered verbatim by the lesson (rule 6);
   - the graduate and exam-preparation time budgets are implausible (rule 3).

Counts: **critical 0 · major 5 · minor 7**.

## Tool runs (from `learning-studio/`)

| Command | Result |
|---|---|
| `npx vitest run src/activities/week05 src/activities/week06 src/activities/week07 src/content` | **8 files, 147 tests passed**. |
| `npx tsc -b` | **clean** (exit 0). |
| `node scripts/check-student-build.mjs`, run on the existing `dist-student/`, which was built at 17:22:55, after the last edits to `exam1.ts` (17:22:12) and `week07.ts` (17:22:35) | "student build: none of 13 exam markers present; instructor build (dist/): 13 of 13 markers present". A grep for the scenario name "AeroLink Cargo" in `dist-student/assets` finds nothing. I did not rebuild, to avoid writing to the app tree. |
| Independent Python recomputation of totals, reversals, tornado, ALT-005, SBD points | All lesson numbers reproduce (see Verified correct). |
| Monte Carlo cross-check, 200,000 trials (own implementation, same distributions) | Course method: ALT-004 first 95.7 %, consistent with the pinned 96.05 % at n = 10,000. Demand pushed through the wait model: **94.1 %**. See F02. |

## Findings

| ID | Sev. | Location | Finding | Evidence | Recommended fix |
|---|---|---|---|---|---|
| W7-F01 | major | `TradeStudySimulator.tsx` `saveWorkspace` / DEC record; `save.ts` `planSave` | **Recorders do not record owner or provenance (§7 rule 1, recurring).** CRIT, ALT and DEC are created with hard-coded `provenance: 'team-derived'`. There is no `ProvenanceOwnerFields`, no `ownerProblem` check and no owner. `assignment.aiUse` requires every AI-suggested alternative, criterion or score to be tagged `AI-suggested-reviewed`; the tool makes that impossible. | `save.ts` l.25, 35; `TradeStudySimulator.tsx` l.73, 88. | Add `ProvenanceOwnerFields` to the save and DEC panel, block on `ownerProblem`, and pass `{owner, provenance}` on each created element. |
| W7-F02 | major | `reference.ts` `REFERENCE_UNCERTAINTY`; `trade.ts` `monteCarlo` (shared option); `w7-advanced` para 1–2; q7-11; activity `w7-act-mc` | **The "shared driver" does not implement "one demand forecast drives every wait".** The lesson says demand 216–240–264 is "pushed through the wait approximation". The code instead fits a *triangular distribution to the transformed endpoints* of each alternative's wait, then draws the same quantile for all alternatives. A triangular is not preserved under the non-linear wait function, and equal quantiles of different triangles imply different demands for different alternatives. **Consequences:** (1) For the baseline, P(wait < 60 min) is 58.4 % under the fitted triangle but 22.2 % under the stated demand model (demand < 232/day). That probability is the exact mechanism the lesson's "second finding" relies on. (2) My 200,000-trial cross-check gives P(ALT-004 first) = 95.7 % with the course method but **94.1 %** when one demand draw is pushed through each alternative's wait. That is a model difference of ≈ 2 pp, about 10× the quoted "±0.2 pp" standard error. **Why it matters:** the instructor caution mentions "a triangular approximation … not its exact image", but the student-facing text and q7-11 ("one demand draw drives every alternative's wait") state the opposite. Graduate students are told to copy this method for their own trade. | Course-method and demand-model results above; F_tri(60) = 40² / (58.7 × 46.7) = 0.584; P(demand < 232) = 16² / (48 × 24) = 0.222. | Add a "derived score" uncertainty: sample the driver (demand) once per trial and compute each alternative's score through the model. Re-pin the numbers. Otherwise, relabel the method in the student text and q7-11 as "rank-correlated triangular approximation", and say the precision applies to the approximation, not to the demand model. |
| W7-F03 | major | quiz q7-2, q7-3, q7-8, q7-9, q7-10, q7-11, q7-13 | **Quiz items are answered verbatim by the lesson (§7 rule 6).** | q7-3: "a 30 min wait is worth (60 − 30)/(60 − 5) = 0.545" is printed in `w7-value` para 2. q7-2: "Capacity itself is not a criterion — it would double-count wait — … screened against REQ-STK-004" is worked (a) para 3. q7-8: the 0.478 / 0.226 reversals and the "choosing not to meet MGO-007" sentence are worked (c). q7-9: the 0.182 → 0.090 tornado is worked (c). q7-10 (b): the worked (d) recommendation, nearly word for word. q7-11: the 0.961 / 0.904 Monte Carlo results. q7-13: hub count is the set driver and fleet size the set modifier, from `w7-advanced`. | Re-case each item on new numbers: a different value function and level, a different line pair, a different decision (e.g. charger supplier choice), a different SBD factor pair. |
| W7-F04 | major | `src/instructor/exams/exam1.ts` items B1(iv), C1(b), C2, C4; `week07.ts` cautions (last bullet) | **The Exam 1 key is inconsistent with what Weeks 4–6 now teach.** Its own caution says it "was written before the Week 4–6 modules … re-check", and the re-check was not done. **(a) C4** asks for "the adapted SRR criterion each fails". The key names "requirements verifiable with verification methods identified; bidirectional traceability; TBDs with closure plans". Week 6 teaches S1–S8, and "TBDs with closure plans" is not one of them (a TBD falls under S1, or under RB-3.2 with an AROU entry). Graders need the S-IDs. **(b) C1(b):** "a prototype charger demonstrated at an operating hub → TRL 6". Week 6 defines AeroLink's *operational* environment as "AeroLink revenue service at its own hubs", and the Cargo scenario *shares the AeroLink hubs*. TRL 7 is therefore equally defensible, and Week 6 teaches that the environment must be defined before rating (R60 p.525), which the item does not do. The item has two defensible answers. **(c) B1(iv)** rewrite "TBD-xx … to be confirmed … by CP2" has no AROU/U-item owner (Week 5, RB-3.2: "explicit TBD/TBR with an AROU entry"), and CP2 is already past in Week 7. **(d) C2** cites R46 p.125 for condition–if–then. R46 gives event + consequence (+ cause) and the two-part if–then; condition–if–then is R61 p.630, as Week 6 cites. The key also omits the trigger and the horizon that Week 6 requires on every rated risk. | Week 6 `srr.ts` SRR_CRITERIA; Week 6 worked TRL para 2; RB-3.2; R46 p.125 text. | (a) Key C4 to S1/S2/S3 with the Week 6 titles. (b) Define the environments on the scenario sheet (e.g. "a supplier's demonstration hub, not an AeroLink hub") or accept 6 or 7 with justification. (c) Require a U-item with owner and need-by. (d) Cite R61 p.630–631; add "trigger" and "horizon" to the C2 marking. Then delete the stale caution. |
| W7-F05 | major | `workload`; notes open issue 5 | **Time budgets are implausible and not flagged in the module (§7 rule 3).** (1) The graduate memo gets 0.5 h, including R35 (4 pp ≈ 0.27 h). It is a **two-page** memo containing a Monte Carlo on the team's own trade (distributions with sources, correlation, seed, SE) *and* an SBD comparison (drivers and modifiers, feasible sets, a recommendation change), leaving ≈ 15 min. (2) Exam 1 preparation gets 0.6 h for a 12 % exam covering six weeks. (3) Online instruction plus three interactive activities get 0.5 h, although this lesson is longer than Week 5's (Week 5 budgets 0.8 h for 5,150 words). The notes concede "Workload is tight", but `cautions` is silent. | `week07.ts` `workload`. | Re-budget: memo ≥ 1.5 h, exam preparation ≥ 1.5 h, online ≈ 1 h. Record the overrun against the 9 h plan in `cautions`, or move the SBD half of the memo to Week 8. |
| W7-F06 | minor | `w7-worked-recommendation` para 4 | **Logic slip.** "A demand forecast of 192 trips/day or less (the baseline then runs at 80 % utilisation and meets the capacity objective without investment)". The baseline's capacity is 240 trips/day, which still fails REQ-STK-004 (≥ 300) as written. It would meet a *re-derived* requirement (240 at 80 %), not the current one. | `w7-worked-frame` para 1 defines 300 = 240 / 0.8. | Say "REQ-STK-004 would be re-derived to 240 trips/day, which the baseline already meets". |
| W7-F07 | minor | `w7-value` para 5 | **R34 is equated with swing weighting (rule 7).** "R34 describes the same selection-criteria model". R34 p.611 weights each criterion "according to its level of relative importance". That is the importance weighting the lesson's misconception list and RB-6.3 (level 2) reject. | R34 p.611 bullet 3 under "Define the selection criteria model". | Present R34 as the analyst's process outline and *contrast* its importance weights with R18's swing weights. |
| W7-F08 | minor | CRIT-002 ← MOE-005 (reference `week05.ts`, `week07.ts`); `w7-worked-frame` para 3 | **Cost is filed as an MOE.** RB-4.1 and Week 5 define an MOE as mission or user effectiveness. "Capital to meet the Year-2 capacity objective" is a cost measure, which RB-6.2 asks to be "handled explicitly". Tracing CRIT-002 to an "MOE" teaches students that cost is an effectiveness measure. This is reference-level, so the lead owns the fix. | Reference MOE-005 text; RB-4.1; RB-6.2. | Trace CRIT-002 to a cost objective (MGO/CON) and label it, or relabel MOE-005 as a course "cost measure". |
| W7-F09 | minor | Session 2 run-sheet; `w7-deliverable`; rubric blueprint | **Exam time disagrees with the blueprint.** The blueprint, syllabus §12, the weekly plan and the deliverable text say 75 min. The run-sheet gives 65 min of working time (5 + 65 + 5). Pacing A 15 / B 27 / C 23 is ≈ 0.65 min per point. | `instructorNotes.sessions[1]`. | Either state 65 min to students, or schedule arrival and collection outside the 75 min. |
| W7-F10 | minor | `w7-lab` text; `trade.ts` `checkStudy` | **The lab overstates what the simulator checks.** "The simulator checks the L7 minimums (≥ 3 alternatives including a baseline, ≥ 4 criteria with MOE traces …)". A missing baseline and missing MOE traces are only *warnings*, so a study with neither can be saved. Baseline detection is a regex that any description containing "baseline" satisfies (e.g. "much better than the baseline"). | `checkStudy` levels. | Make the MOE trace and the baseline errors at save time (L7 acceptance). Detect the baseline by an explicit flag, not text. |
| W7-F11 | minor | `docs/authoring/week07_notes.md`; `exam1.ts` header; `week07.ts` cautions | **Stale records.** The notes say "14 lesson blocks" (there are 13) and that the module contains "the Exam 1 item bank". Open issue 1 (exam security) is now resolved. The module caution "the Week 4–6 modules were not yet authored" and the `exam1.ts` header "Pending independent review" both remain. | Files as listed. | Update the notes and cautions after fixing F04. |
| W7-F12 | minor | `exam1.ts` A2 key | **The loop is not closed.** The causal chain stops at "fewer contract renewals". The key gives 5 polarities ("+, +, +, +, −") for a loop that needs a sixth link, renewals → contracts (+), to be a loop at all. The "odd number of negatives" rule still gives balancing, but a student who adds the closing link and lists 6 polarities has no matching key. | Item A2 text. | Add "→ (renewals → contracts, +)" to the stem or key; accept 5 or 6 listed links. |

**§7 rule check**

| Rule | Result |
|---|---|
| 1 | ✗ (F01). |
| 2 | ✓: `rubricScope` names RB-16.1 for the memo. |
| 3 | ✗ (F05). |
| 4 | ✓: the reference study passes `checkStudy`; the totals and reversals are test-asserted against the reference layer. |
| 5 | Weak (F10). |
| 6 | ✗ (F03). |
| 7 | Partly (F07, F08); the proportional-rescaling and Monte Carlo methods are labelled as course conventions. |
| 8 | ✓: ALT-005 in q7-6 is new and does not collide. |

## Exam 1 audit

- **Totals.** Part A = A1 5 + A2 8 + A3 7 + A4 5 = **25**. Part B = 16 + 8 + 8 + 8 = **40**. Part C = C1 7 (3 × 2 + 1) + C2 14 + C3 8 + C4 6 = **35**. 12 items, 100 points.
- **Blueprint alignment.**
  - Part A: classify a stakeholder set (A3), explain a causal loop (A2), short answer (A1, A4) ✓.
  - Part B: critique and rewrite 4 flawed requirements (B1), MOE/MOP classification (B2), missing scenario (B3) ✓.
  - Part C: assign a TRL (C1), write and rate 2 risks (C2), assumption vs risk (C3) ✓. C4 (SRR) is an addition and is fine.
- **Applied share.** The stated ≈ 84 of 100 points on the scenario is correct (A1–A4, B1, B3, C1–C4), well above the 60 % guideline.
- **Coverage gaps.** B3.1, B3.3, B4.3, B5.2 and B5.4 are acknowledged in `mapping`. B5.2 is partly touched by C4's "no parent".
- **Keys verified correct.**
  - A4: acknowledged SoS (R09 p.868 definition matches).
  - C1(a) TRL 4, C1(c) TRL 5.
  - C2's examples rate into moderate cells with Week 6-consistent handling: avoid for L2–3 × C4; L2 × C5 matches the reference R-003.
  - C3 classifications.
  - B2 classifications.
  - B1 (i)–(iii) rewrites.
- **Keys inconsistent with Weeks 4–6:** C4, C1(b), B1(iv), C2 (F04); A2 (F12).
- **Security.** The bank is excluded from the student build (verified). Instructor mode remains a display toggle in the instructor edition, and the caution says so.

## Citation table

| Claim / location | Citation | Verdict | Evidence |
|---|---|---|---|
| Keeney quote "Most important decisions involve multiple objectives, … you can't have it all." | R18 p.465 | OK (exact) | |
| Purpose (15288), formal process criteria, trade study within cognitive limits | R18 p.463 | OK | |
| Four best practices; UAV example; five trade-space objectives | R18 p.464 | OK | |
| Framing: baseline, boundaries, decision problem statement | R18 p.465 | OK | |
| Objective tests; measure properties | R18 p.465 | OK | |
| Walk-away → 0; stretch goal → 100 (or 1, 10); document shape rationale | R18 p.465–466 | OK | |
| Weights depend on importance and range; swing matrix; 100 top-left; normalise | R18 p.466–467 | OK | |
| Scoring sheets; ideal alternative | R18 p.468 | OK | |
| Value table, heat map, additive model | R18 p.469 | OK | The equation is an image; course notation is labelled |
| Value component chart | R18 p.470 | OK | |
| Stakeholder value scatter plot | R18 p.470–471 | OK | |
| Uncertainty of independent variables; lower/nominal/upper; Monte Carlo identifies key uncertainties | R18 p.471 | OK | |
| Line, tornado and waterfall diagrams; Monte Carlo, decision trees, influence diagrams; line diagram for swing weights | R18 p.472 | OK | |
| Value-focused improvement; actionable task list; report | R18 p.472–473 | OK | |
| Cognitive bias; confirmation; self-mitigation infeasible; rankism, complacency, optimism | R18 p.473 | OK | |
| Independent review (organisationally and financially independent), CRM, premortem | R18 p.474 | OK | |
| Traceable, defendable, actionable plan; integration with SE processes | R43 p.109 | OK | |
| Scale analysis to the decision; decision maker has full responsibility | R43 p.110 | OK | |
| Criteria include cost/time constraints; objective/subjective; sensitivity | R34 p.609 | OK | Cited as 608–609 |
| Full life-cycle cost | R34 p.609–610 | OK | |
| Selection-criteria model "the same" as swing weighting | R34 p.611 | OVERCLAIM | R34 weights by relative importance (F07) |
| Check sensitivity of scores to weights | R34 p.612 | OK | Last bullet of the "Checking correctness" list |
| Modelling is an aid, not a decision tool; keep modelling context | R34 p.614 | OK | |
| SBD definition; set drivers vs set modifiers | R35 p.1396 | OK | |
| One-requirement-at-a-time tornado | R35 p.1397 | OK | |
| Uniform random design variables; Monte Carlo; dominance; select sets | R35 p.1399 | OK | |
| Exam C1 TRL scale | R16 p.767 | OK | |
| Exam C2 condition–if–then | R46 p.125 | WRONG PAGE / OVERCLAIM | R46 gives event + consequence (+ cause) and two-part if–then; condition–if–then is R61 p.630 (F04d) |
| Exam C4 SRR criteria | R40 p.69–72 | OK (page) | The key's criterion names do not match Week 6 S1–S8 (F04a) |
| Exam B1 characteristics; rationale/verification attributes | R13 p.566; p.559 | OK | |
| Exam A3 supporters/skeptics | R63 p.235–237 | OK | |
| Exam A4 acknowledged SoS | R09 p.868–869 | OK | |

## Verified correct (independent recomputation)

**Raw scores**
- Wait from w(u): 240 → 66.67, 288 → 12.0, 320 → 8.0 min.
- Capacities: 240 / 288 / 240 / 320.
- Retained capacity: 80 / 66.7 / 100 / 90 %.

**Totals**
- 0.4520 / 0.4884 / 0.4580 / 0.6702.
- ALT-004 leads ALT-002 by 0.182.
- Largest gap to the ideal: capital, 0.192.

**Reversal points** (closed form and brute force agree)
- CRIT-002 0.478 → ALT-001, tie value 0.591.
- CRIT-001 0.2263 → ALT-003; the baseline crosses at 0.220.
- CRIT-003 0.5925 → ALT-003.
- CRIT-004 0.555 → ALT-003. This uses the rounded score 6.86; the exact 48/7 gives 0.554.
- ALT-003 crosses on cost at 0.569.
- Spot values at w = 0.47 and 0.49 are correct.

**Tornado (±0.1)**
- Worst margins 0.090 (wait at 0.30) and 0.096 (cost at 0.40).
- No crossing at ±0.1; both cross at ±0.2.
- The margin is concave in w, so the endpoint bound is valid.

**Other numbers**
- ALT-004 with zero capital value: 0.562.
- Mutation key: ALT-004 at USD 16 M scores 0.622, and the cost reversal moves down.
- q7-4: 0.364. q7-6: 0.651 (second). q7-7: w* = 0.50. q7-3: 0.545 and 0.
- Monte Carlo pins (seed 2026, as implemented): 9605 / 213 / 182 / 0 shared, which rounds to the quoted 96.1 / 2.1 / 1.8 %; 9039 independent (90.4 %); means 0.657 / 0.510 / 0.506 / 0.462; ALT-004 P5–P95 0.625–0.687; the bound argument 0.474 / 0.495 < 0.575.
- SBD: 15 points, 6 feasible, and the capital and retained values in the table are right (e.g. 16/5: 13.6, 100 %; 20/4: 24.8, 75 %). No feasible point dominates another.

**Sessions and workload**
- Session 1 = 45 + 30 = 75 min.
- The reading count of 14 pp is correct (R18 12 + R43 2). The workload sums to 9.0 h.
- RB-6.1–6.6 map one-to-one onto template sections 2–7.
- The CP3 continuity (RB-6 45 %, 9 %) matches syllabus §12.

**Accessibility**
- The line diagram and tornado have table equivalents, and series are distinguished by pattern and label.
