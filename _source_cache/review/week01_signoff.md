# Week 1 sign-off check

- **Reviewer:** Independent AI reviewer (Claude), sign-off pass. I did not author the material or the fixes.
- **Date:** 2026-10-11
- **Scope:** the items left open by `week01_rereview.md`: W1-R01 to W1-R08, and F05, F06, F11 and F19, which were partly resolved. I also checked the second-pass changes recorded in `learning-studio/docs/authoring/week01_notes.md` (commit `6707e8b`).
- **Tree state:** HEAD is `eacdf33`. The Week 1 files are committed. The only uncommitted file under `src/` is `src/content/weeks/week03.ts`, which carries the W1-R04 wording fix.

## Verdict: **SIGN-OFF**

No critical or major finding is open. Both majors from the re-review (W1-R01, W1-R02) are resolved, and so is the partly resolved major F06. I re-ran every new number the author pinned, and each one reproduces exactly. Both mutations I spot-checked matched the author's record test for test.

Three minor items remain open, and two release conditions apply. None of them blocks sign-off:

- **Condition C1:** commit the `week03.ts` W1-R04 fix. It exists only in the working tree.
- **Condition C2:** regenerate `exports/curriculum/` before distributing it. The exports are older than both fix passes (see W1-S01).

## Tool runs

| Command | Result |
|---|---|
| `npx tsc -b` | exit 0 |
| `npx vitest run src/sim src/content src/components` | 5 files, **74 passed**, 0 failed |
| Temporary `src/sim/zz_signoff.test.ts`, written to scratch and then deleted | Every value in the step-3 table reproduced (see below). `git status --short src` afterwards shows only the pre-existing `week03.ts` change. |
| Mutation M9, then revert | 1 failing test, as recorded. `git diff --stat -- src/content/causalLoops.ts` was empty after the revert. |
| Mutation M12, then revert | 2 failing tests, as recorded. `git diff --stat -- src/sim/aerolink.ts` was empty after the revert. |

## Re-verified numbers

All runs start from "Fleet grows, charging does not". The last column is the snapshot at month 60.

| Run | Riders m60 | Wait m60 (regime) | Fleet / chargers m60 | Surplus a/c-months (60 / 120) | Charger-months (60 / 120) | Riders m120 | Surplus snapshot m60 |
|---|---|---|---|---|---|---|---|
| Baseline | 2,596 | 20.3 (charging) | 40 / 6 | 1,135 / 2,671 | 366 / 726 | 2,596 | 25.6 |
| (a) chargers scale | 28,776 | 4.2 (demand) | 276 / 138 | 1,079 / 5,284 | 3,366 / 11,646 | 28,831 | 70.5 |
| (b) count supply line | 2,596 | 20.3 (charging) | 19 / 6 | 235 / 511 | 366 / 726 | 2,596 | 4.6 |
| (c) 12 initial chargers | 5,163 | 19.3 (charging) | 45 / 12 | 679 / 1,651 | 732 / 1,452 | 5,163 | 16.2 |
| (a) + (b) | 11,107 | 16.9 (fleet) | 63 / 32 | 49 / 49 | 892 / 4,984 | 26,714 (wait 6.8) | 0.0 |

Every figure matches the notes table and the step-3 answer key. I also confirmed the claims built on these numbers:

- **"About nine times the charger-months":** 3,366 / 366 = 9.2.
- **Time profile of the surplus:** the baseline idles 25.6 aircraft from month 22. Run (a) carries almost no surplus from month 8 to month 44, apart from 0.2–0.5 in months 16–17 and 31–32. It reaches 13.6 at month 45, more than 25 from month 46, and 70.5 at month 60.
- **"Chargers scale, 3-month delivery":** riders reach 27,759 (92.5 %), the charging pool grows to 106 chargers, and the run accumulates 449 surplus aircraft-months with a snapshot of 13.7. The last month with a wait above 15 minutes is month 27, matching "none after month 27".
- **"More than double" with a 6-month delay:** 1,079 / 449 = 2.4. Riders rise slightly, from 27,759 to 28,776.
- **Explorer partial-fit notes:** "19 with no delay, or with orders that count them" is correct. Delay 0 gives a fleet of 19 at month 60, and counting the supply line also gives 19. "About 91 %" in the procurement-delay run is correct: 27,261 / 30,000 = 90.9 %.

## Disposition

| ID | Sev. | Disposition | Evidence |
|---|---|---|---|
| W1-R01 | major | **RESOLVED** | `DynamicsExplorer.tsx` `ARCHETYPE_CHOICES` now holds six R05 pp.283–284 archetypes and no descriptive giveaway. `ARCHETYPE_FEEDBACK.balanced['Limits to Growth']` is a `match` for the market limit (R1 meets B4) and cites q1-5. The scenario archetype string, answerKey[3] and `week1.ts` ("reproduces Limits to Growth twice, with different limits") all agree. R05 p.283 text checked: "A reinforcing process of accelerating growth … will encounter a balancing process as the limit … is approached". Mutation M13 is recorded as killed by a component test. |
| W1-R02 | major | **RESOLVED** | The explorer shows charger-months next to surplus aircraft-months, and the latter is labelled "counts aircraft only". The months slider runs 36–120 in steps of 12, so both 60 and 120 can be reached. Step 3 now compares (a), (b) and (c) at 60 and 120 months and asks students to state the relative cost they assume. The key says (a) is *not* a trade-off on 60-month surplus aircraft-months, explains how the snapshot and the total diverge, and marks the argument rather than the choice. All of its numbers re-verified (table above). |
| W1-R03 | minor | **RESOLVED** | The q1-5 stem holds attractiveness constant. Explanation b states proportionality to 1 − 2R/M, which is correct (d/dR[R(1 − R/M)]). Explanation c gives the full-model effect: negative well below half the market at the 8.7 % plateau. Activity step 1, `week1.ts`, misconception 5 and the diagram caption are aligned. The keyed answer is still unique, and the R05 p.283 citation holds. |
| W1-R04 | minor | **RESOLVED, but not committed** (C1) | The `week03.ts:135` working-tree diff now reads "the Week 1 Limits-to-Growth (charging limit) structure". `model/reference/week02.ts:56` R-001 is aligned. A grep of `src/model/reference/` and `reference_model_notes.md` finds no "growth-and-underinvestment" left. The 90th-percentile wording is kept as a deliberate design-measure choice: it is justified at `week04.ts:27`, and `reference_model_notes.md:67` flags the Week 1 average wait as a proxy. I accept this. |
| W1-R05 | minor | **RESOLVED** | The regime label is "demand (waits within tolerance)". The worked example says "buying aircraft now helps most" and adds the convention caveat, and the launch text says "almost nothing". The `Regime` doc comment was rewritten. |
| W1-R06 | minor | **RESOLVED** | `demand → orderRate (+)` was added, and `util → orderRate` is labelled as a gate. The polarity test checks every link against the function that implements it. I applied M9 myself (a double flip on B2 with the loop kinds unchanged, the case the re-review could not catch), and the per-link test killed it. |
| W1-R07 | minor | **RESOLVED** | `week01_notes.md` records M1–M15 with the diff, the failing tests and revert evidence. It says the earlier M1–M10 claim was never recorded and withdraws it, and it names M15 as the equivalent mutant with its justification (capacity is never 0 in any reachable configuration). Both mutations I spot-checked, M9 and M12, reproduced their recorded failing-test sets exactly. |
| W1-R08 | minor | **PARTLY** (non-blocking) | **(a) Resolved:** `LABORATORY_AND_CAPSTONE_PLAN.md` lines 116 and 184 now read "RB-1.1, RB-1.4 causal-argument clause (formative)". **(c) Resolved, pending faculty confirmation:** the memo-reading choice is now recorded as DECISION_LOG W7 and the RB-16 graduate-task note, both flagged for faculty confirmation. **(b) Open:** RB-1.4 still has no clause-level descriptors for a memo scored on the causal-argument clause alone. Its levels 2–1 describe stakeholder relationships. The feedback is formative, so this does not block. |
| F05 | major→minor | **RESOLVED** | Closed through W1-R06 above. |
| F06 | major | **RESOLVED** | Closed through W1-R02 above. The key no longer frames (a) as a trade-off on the measure students are told to report. |
| F11 | major | **RESOLVED** | The memo is always read, with formative feedback on RB-1.4 (`week01.ts` assignment instruction 2). The decision is recorded as DECISION_LOG W7 and the RB-16 note, flagged for faculty confirmation. |
| F19 | minor | **RESOLVED** | The lab plan rows now match the Week 1 rubric scope. The only residue is W1-R08(b). |

## New findings

| ID | Sev. | Location | Finding | Fix |
|---|---|---|---|---|
| W1-S01 | minor (release condition C2) | `exports/curriculum/student/week01.md`, `exports/curriculum/instructor/week01.md` (dated 2026-10-09 13:08) | The exported curriculum documents predate both fix passes and still carry text the reviews corrected: "every additional aircraft adds zero monthly trips while adding cost", the "Balanced investment" scenario, "riders stay below 20 % of the market", and "Memo: RB-16.1". The app content is correct. Only the generated copies are stale. | Run `scripts/export-curriculum.mjs` before any export is distributed. |
| W1-S02 | minor | `quizWeek1.ts` q1-7 option a explanation; `DynamicsExplorer.tsx` underinvestment / Balancing Process with Delay note | Both say the plateau persists "after the supply line is empty (from month 24)". The model's `onOrder` is 0 from **month 22** (the fleet reaches 40 at month 22). The statement is true but imprecise, and the re-review also recorded month 22. | Say "from month 22", or "once the last order is delivered (month 22)". |
| W1-S03 | minor | Release hygiene | The W1-R04 student-facing fix in `week03.ts` is uncommitted (condition C1). | Commit it with the next authorised commit. |

## What I verified

- **Builds and tests:** `tsc -b` exits 0, and the targeted suite passes 74 of 74.
- **Model numbers:** every new pinned number (the table above) was re-run independently through a temporary test file, which I then deleted.
- **Citations:** I checked R05 p.283 against the source pages for Limits to Growth, Fixes that Fail (under "Trade-offs") and Drift to Low Performance. The q1-5 explanation and the explorer feedback are faithful to it. The second pass changed no other citation.
- **Quiz:** q1-5 (the only item changed in the second pass) has one keyed answer, the mathematics is correct, and the explanations are now consistent with the full model.
- **Mutations:** I spot-checked two. **M9** (the B2 double flip in `causalLoops.ts`) was killed by "EVERY link polarity agrees…", 1 failing test as recorded. **M12** (charger-months skip month 0 in `aerolink.ts`) was killed by the explorer component test and the step-3 key pin, 2 failing tests as recorded. Each file was restored from a backup, and `git diff --stat` for it was empty afterwards.
- **Hygiene:** I edited no course or app file. The temporary test was deleted, and both mutated files are byte-identical to HEAD.
