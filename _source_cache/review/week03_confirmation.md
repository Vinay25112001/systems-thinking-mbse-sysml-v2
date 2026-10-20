# Week 3 confirmation review: Technology Assessment / Risk / Trade Study, after fix commit 8118ac6

- **Reviewer:** independent confirmation reviewer (not the author). **Date:** 2026-10-19.
- **Inputs:** the review `_source_cache/review/week03_review.md` (REVISE: 2 major, 6 moderate, 12 minor) and the dispositions `learning-studio/docs/lectures/week03/WEEK3_REVIEW_DISPOSITIONS.md`.
- **What I changed:** no source file edited and nothing committed. I wrote two throwaway probe tests, `src/workbench/week3/zz_probe_confirm.test.ts` and `src/content/zz_probe_quizlen.test.ts`, ran them and deleted them; `git status` shows no trace. I recomputed the trade independently in Python (`scratchpad/w3recompute.py`, outside the repo). Playwright ran under the `_source_cache/.playwright.lock` protocol.
- **Tree state:** every Week 3 file is clean at HEAD 8118ac6. The modified files in the tree belong to the concurrent Week 8, 11 and 12 work.

## Verdict: **SIGN-OFF** (with five minor follow-ups, none blocking)

- Both majors are closed and tested. So are all six moderates (m6 as an accepted declared gap with a faculty acquisition item) and minors 1–9; minors 10–12 are dispositioned acceptably.
- Every trade number reproduces independently: screens, totals, the reversal points among the feasible alternatives (both closed form and a 2 × 10⁵-step scan), min–max, the morphological box and MONTH6.
- No stale pre-review number is presented as a decision condition. 0.478 appears exactly once, computed from `UNSCREENED_SENSITIVITY`, and is framed as "no condition" (`session2.ts:401`, `:757`).
- The new lab gates hold in both directions, including boundary cases I added.
- All gates pass for Week 3.

New findings: **blocker 0 · major 0 · moderate 0 · minor 5** (N1–N5 below), plus one note on the dispositions document.

## Per-finding table

| Finding | Status | Evidence (file:line) | Disposition judged |
|---|---|---|---|
| **M1** eliminated alternatives kept in play | **CLOSED** | Screens: SCREEN-3 capacity ≥ 300 and SCREEN-4 walk-aways, computed (`aerolinkCase.ts:527-568`). `FEASIBLE` / `SCREENED_OUT` / `RANKING` (`:571-574`). ALT-005 and ALT-006 added (`:473-474`). `MORPH_PATHS` covers all nine paths (`:584-596`). `SENSITIVITY` runs over the feasible set only (`:600-603`). `DECISION` conditions are computed from it (`:643-669`). Slides, lesson, five figures (`LectureWeek3S2.tsx:167-385`), Examples (`Examples.tsx:102-106`). Tests `aerolinkCase.test.ts:217-317`; "every reversal target passes every screen" is shown able to fail (`:285-297`). | Sound. Exactly the fix the review asked for; a residual edge case is raised as N1. |
| **M2** REQ-STK-018 has two "shall"s | **CLOSED** | Split into REQ-STK-018 (performance) and REQ-STK-019 (functional) (`aerolinkCase.ts:299-316`). I-001 updated (`:324`). Week 2 `assessRequirement` gates run on both, with a negative test (`aerolinkCase.test.ts:178-188`). | Sound |
| m1 TRL 6 basis read as TRL 7 | **CLOSED** | `aerolinkCase.ts:70`, `:113` ("relevant, not operational … would be TRL 7"); test `aerolinkCase.test.ts:51` | Sound |
| m2 Week 2 promises left stale | **CLOSED** | `W2_DISPOSITIONS` (`aerolinkCase.ts:288-297`); Examples `catalogue-unknowns` (`Examples.tsx:96`); Session 1 notes (`session1.ts:670`); test `aerolinkCase.test.ts:143` | Sound. Week 2 was correctly left untouched. |
| m3 quiz length-outlier cue | **CLOSED** for the rule as stated | Recomputed: no key reaches 1.4 × the next longest or 0.7 × the next shortest. Keys a–d 3/3/3/3; ranks 1–4 three each. The new test fails on the pre-review lengths (`quizWeek3.test.ts:90-105`). | Accepted. A second-order cue remains (N3). The dispositions' claim that "all key ratios lie within 0.69–1.35 of the nearest distractor" is not accurate: w3q-8's key is 60 against neighbours 103 and 23. It is harmless, because the outlier rule is the one that matters. |
| m4 R-011 against the C5 anchor | **CLOSED** | Anchors sharpened by recoverability (`labBrief.ts:104-105`); reasons reworded (`aerolinkCase.ts:174, 231, 254`); test `aerolinkCase.test.ts:91` | Sound. It is a legitimate alternative to re-rating, and the Low-cell prompt stays valid. |
| m5 lab tool does not enforce screens or walk-aways | **CLOSED** | Walk-away hard gate and advisory, `breach-risk` gate, `not-top`, `reversal-number` (`record.ts`, `assessTpm`/`computeTrade`/`assessTrade`); tests `record.test.ts:192-305`. Probe results below. | Sound. N2 is a display inconsistency. |
| m6 ordinal critique unsourced | **CLOSED as a declared gap** | Gap statement kept (`session1.ts:496`); Cox (2008) is a faculty acquisition item, not cited | Acceptable. Faculty must record acceptance in the decision register. |
| Minor 1 R61b pages | CLOSED | `session1.ts:492` (sources include p.636), `:496`, `:956` cite pp.636–637 | ✓ |
| Minor 2 defense in depth | CLOSED | `session1.ts:605`, `:971`: "SEBoK lists coordinated defense … for example through a defense-in-depth strategy (R24 p.1206)" | ✓ |
| Minor 3 gloss unmarked | CLOSED | `session1.ts:496`: "the instructor's gloss" | ✓ |
| Minor 4 R78 title | CLOSED (register) | `readings.generated.json` R78 title is "Standard View Definitions and Domain Libraries (…)", range 145–162, verified | ✓ |
| Minor 5 pre-work time | CLOSED | `session1.ts:871` "about twenty minutes" against `week3Path.ts:155` 0.3 h | ✓ |
| Minor 6 R-008 charge count | CLOSED | `aerolinkCase.ts:221` | ✓ |
| Minor 7 loose traces | CLOSED | CRIT-004 lens (`aerolinkCase.ts:506`); ALT-003 and ALT-005 seventh-site note (`:471`, `:473`); `DECISION.wouldChangeIf` (`:665`) | ✓ |
| Minor 8 double rounding | CLOSED | `MONTH6` (`aerolinkCase.ts:409-416`); exports show 21.25 / 0.25 | ✓ |
| Minor 9 outline figure | CLOSED | `WEEK03_LECTURE_OUTLINE.md:449` "about 2.5 h each (7.6 person-hours)" | ✓ |
| Minor 10 workload slack | Dispositioned | Test-enforced at or under 8.0 h (`timing.test.ts:81-95`) | Acceptable; check against the time logs |
| Minor 11 flaky tests | Recorded | See gates. No Week 3 flake in this run. | Acceptable |
| Minor 12 security optional in trade | Dispositioned (faculty) | Register gates still require security and resilience risks | Acceptable |

## Recomputation table

I computed these independently in Python from the stated rules: demand 240; aircraft × 20 against chargers × 48; w(u) = 2/(1 − min(u, 0.97)) + 120·max(0, u − 1); swing weights 100/75/40/35. Reversal points were both scanned and solved in closed form.

| Quantity | Package | Independent | OK |
|---|---|---|---|
| Capacities ALT-001..006 | 240/288/240/320/320/360 | same | ✓ |
| SCREEN-3 (≥ 300) | ALT-001, 002, 003 fail | same | ✓ |
| SCREEN-4 (walk-away) | ALT-001 and ALT-003 fail on wait 66.7 > 60 | same; ALT-002 wait 12.0 passes | ✓ |
| SCREEN-1/2 (security) | all pass (ALT-004/006 conditional on replacement) | consistent with notes | ✓ |
| Feasible set | ALT-004, ALT-005, ALT-006 | same | ✓ |
| ALT-004 total | 0.670 | 0.6702 (values 0.9455/0.36/0.8/0.4) | ✓ |
| ALT-005 total | 0.624 | 0.6242 (0.9455/0.10/0.8/0.6286; cost 18.0) | ✓ |
| ALT-006 total | 0.563 | 0.5627 (0.9818/0.06/0.6/0.4; cost 18.8) | ✓ |
| Reference totals ALT-001..003 | 0.452/0.488/0.458 | 0.4520/0.4884/0.4580 | ✓ |
| Cost reversal (feasible) | down 0.150 → ALT-005 | 0.14953 → ALT-005 (ALT-006 crosses at −0.09, outside) | ✓ |
| Noise reversal | up 0.284 → ALT-005 | 0.28408 → ALT-005 (ALT-006 ties only at w = 1) | ✓ |
| Wait reversal | up 0.848 → ALT-006 | 0.84829 → ALT-006 (ALT-005 ties only at w = 1) | ✓ |
| Resilience | none | ALT-005 meets ALT-004 only at w = 1 (equal resilience value); ALT-006 at −0.82 → none | ✓ (the `EDGE` fix is correct) |
| Unscreened (display only) | 0.478 → ALT-001 | 0.4780 → ALT-001; also 0.2264 / 0.5924 / 0.554 → ALT-003 | ✓, shown only as the mistake |
| Min–max, feasible set | 0.460 / 0.340 / 0.400 (004/005/006) | same | ✓ |
| Min–max, ALT-004 removed | ALT-005 0.600 > ALT-006 0.400 (reversal) | same | ✓ |
| Fixed anchors in both sets | 0.624 > 0.563 | same | ✓ |
| Morphological paths not listed | keep 12 + upgrade 240/day; add 4 + keep 288/day; add 6 + new USD 24 M > 20 | 240 (also fails wait); 288; 24.0 (cost walk-away) | ✓ |
| Decision conditions | capital > 0.15, noise < 0.28; would change at 0.150 / 0.284 / 0.848; demand ≤ 192 | toFixed of the values above; 192 = 0.8 × 240 | ✓ (see N1) |
| MONTH6 | T 0.693; reserve 21.25 %; WCE 20.25; margin 0.25 < 1 trigger | 0.693; 21.25; 20.25; 0.25 | ✓ |
| 15 % fade | 18.47 % (shown 18.5) | 18.47 | ✓ |
| Lab fixture reversals (tool) | CRIT-002 up 0.467 → ALT-001; CRIT-004 up 0.496; CRIT-001 up 0.730 / down 0.018 | probe output | ✓ |

**Stale-number sweep.**
- The literals 0.478, 0.48, 0.226, 0.592, 0.554, 21.3 and 20.3 do not appear in Week 3 student or faculty source, figures, Examples, quiz, lab text or the e2e specs, apart from one code comment and the e2e `not.toContainText('0.478')`.
- Every displayed trade number is computed from the case module.
- In the regenerated exports (`exports/lectures/week03-*`, written at 14:13:59, newer than every source), 0.478 appears once, in the Session 2 notes, as the unscreened contrast. 0.150, 0.284, 0.848, 0.624, 0.563, 21.25 and 0.25 appear where expected.

## Regression checks

**Lab tool probe (throwaway, deleted).** All seven probe cases behaved as specified:

- *Walk-away boundary.* A score exactly at the walk-away (60) is not beyond it. 59.9 fails the `recommendation` gate alone. On the lower-is-better side, cost 61 against a walk-away of 60 fails `recommendation` and raises `walk-away`.
- *Screened-out alternatives.* An alternative that is screened out and also beyond a walk-away raises no `walk-away` advisory, because it is not scored. Correct.
- *`not-top`.* It fires for a third-ranked recommendation and not for the fixture.
- *`reversal-number`.* It fires for 0.90 and not for 0.467 or 0.48. 0.49 does not fire either, because it lies within 0.02 of the CRIT-004 point 0.496, so this is correct. A note with no number fires.
- *`breach-risk` on a higher-is-better TPM.* WCE below the threshold with no link fails `breach-risk` alone. With an R link it passes. At margin 0 (cbe 3.3) it passes, and at cbe 3.29 it fails.
- *Display gap.* An alternative beyond a walk-away still gets a total and **rank 1** in the tool's table (N2).

**Quiz.**
- Keys a/b/c/d are 3/3/3/3, and length ranks 1–4 occur three times each with no run of three.
- No key is a length outlier under the 1.4× / 0.7× rule.
- The new tests can fail: the negative test restores three pre-review keys and both rules catch them.
- Residual pattern: see N3.

**Timing and workload.** `timing.test.ts` passes 16/16:
- notes at most 130 wpm on every slide;
- 68–70 min of content + buffer = 75 min per session;
- workload at or under 8.0 h;
- a three-person team within 0.1 h of a four-person team;
- the lesson row computed from its own word count.

**Leaks.** No "review M/m", "minor n", A21, DECISION_LOG, `_source_cache` or TODO strings appear in Week 3 student-facing strings (session text, Examples, lab tool, lab text, quiz, figures). ALT, R and SCREEN identifiers are case IDs, as in Week 2.

**Citations.** I checked 469 citation occurrences across the Week 3 sessions, labBrief, the case, the quiz, the lab, the path and Examples. All 20 reading IDs exist in `readings.generated.json`, all are verified, and every cited page lies within `firstPage`–`lastPage`.

**Student build.** `vite build --mode student --outDir dist-student` and then `scripts/check-student-build.mjs` both PASS. All 2062 of 2062 faculty-notes markers are in `dist/` and none are in the student build. The Week 3 student decks have 25 and 21 notes slides, all empty.

## New findings

**N1 (minor). The demand condition points at an alternative that the screen, as written, still eliminates.**
- `DECISION.wouldChangeIf[0]` (`aerolinkCase.ts:662`; lesson, decision-record figure "demand ≤ 192") says the decision changes if demand falls to 192 or less, "and the baseline provides 240".
- But SCREEN-3 is hard-coded at `REQUIRED_CAPACITY = 300` (`:515`), and the baseline (240/day) fails it whatever the demand.
- The condition is correct only because REQ-STK-004's 300 is itself derived as 240 ÷ 0.8 (`week02/aerolinkCase.ts:350` rationale), but the text never says that the requirement, and therefore the screen, would be re-derived.
- *Failure scenario:* the same question M1 raised, in a smaller form: "how can the baseline win if it fails the capacity screen?"
- *Fix:* add "(REQ-STK-004 is derived from demand ÷ 0.8, so the requirement and its screen would fall to 240)".

**N2 (minor). The lab tool still ranks alternatives that are beyond a walk-away point, although the advisory says they are left out of the ranking.**
- `computeTrade` keeps walk-away alternatives in `ranking` (`record.ts`, `ranking = [...scored].sort(...)`). `Week3LabTool.tsx:390` shows that rank.
- The `walk-away` advisory text (`labBrief.ts:282`), which also appears in `WEEK3_LAB_INSTRUCTIONS.md:46`, says "(it is left out of the ranking and the sensitivity)".
- The probe showed a walked-away ALT-004 displayed as rank 1, while the sensitivity and `not-top` use ALT-002 as leader.
- The hard gate still blocks recommending it, so this is a display and text inconsistency, not a hole.
- *Fix:* either rank only `feasible` (show "walked away" in the Rank cell, as "screened out" is shown in the Total cell), or drop "the ranking" from the advisory text.

**N3 (minor). The quiz has a residual "isolated middle-length option" cue.**
- In all six items whose key has length rank 2 or 3, the key is the only middle option standing apart from a near-equal pair of distractors:
  - w3q-1: 76 / **53** / 28 / 26
  - w3q-4: 124 / 122 / **97** / 46
  - w3q-5: 108 / **71** / 18 / 17
  - w3q-8: 103 / **60** / 23 / 20
  - w3q-9: 111 / 110 / **74** / 24
  - w3q-12: 110 / 110 / **75** / 24
- No distractor ever has that position.
- The rule "pick a non-extreme option at least 20 characters from both neighbours, else guess" scores about 62 % (6 + 6 × 0.25 of 12), against 25 % for chance. That is the same magnitude as the original m3, although the rule is post hoc.
- The quiz is formative, so this is minor.
- *Fix:* in those six items, move one short distractor up to near the key's length, and extend the test with a "no option isolated by ≥ 20 chars unless it is a distractor in some items" check.

**N4 (minor, faculty notes). Wrong capacity in the answer-slide notes.**
- `session2.ts:502` says: "Four aircraft with a fourth hub give 320; six aircraft with a fourth hub would too, at a higher cost."
- Six aircraft with a fourth hub (ALT-006) give **360**, not 320. Four aircraft with a *new* hub (ALT-005) also give 320, and the notes do not mention it.
- *Fix:* "…give 320 (so does a new vertiport as the fourth hub); six aircraft with a fourth hub give 360, at a higher cost". Use `cap('ALT-006')`.

**N5 (minor, student lesson wording).** `session2.ts:742` (lesson) has two wording problems:
- It says "Before any weight, every alternative **meets** the screens". It means "faces" or "is checked against": as written it states the opposite of the next sentence.
- `outNames` produces "Baseline: no added capacity, additional aircraft only, additional vertiport only fail them". The colon in the alternative's name reads as a label, and the same construction appears in the slide-9 notes (`:324`).
- *Fix:* reword to "every alternative is checked against the screens". Use short names for the list, e.g. "The baseline, aircraft only and vertiport only fail them".

**Note on the dispositions document.** The m3 claim about key ratios is inaccurate (see the per-finding table). Correct the sentence when the document is next touched.

## Gates

| Gate | Result |
|---|---|
| `npx tsc -b` | PASS (exit 0, clean tree-wide at the time of the run) |
| `npx oxlint src` | PASS: exit 0, 0 errors, 31 warnings, all only-export-components (Week 3: `LectureWeek3S1.tsx:812`, `LectureWeek3S2.tsx:594`, as before) |
| `npx vitest run` | 1641 passed, 2 failed, 87 files. Failures: `activities/week07/activities.test.tsx` and `activities/week11/activities.test.tsx`; both are outside scope (Week 11 is being modified in the tree by another agent). Week 3 suites run alone: **167/167** (case 37, timing 16, quiz 14+, lab, record, lab tool). |
| `npx vite build` | PASS (chunk-size warning only) |
| Student build + `check-student-build.mjs` | PASS |
| Playwright `week3-flow.spec.ts` + `lectures-week3.spec.ts` (workers=1, lock protocol) | First run (14:35): `week3-flow` **6/6 PASS**, including axe light and dark at 1440 and 400 px. `lectures-week3` 3/4: the dark axe test died with "Execution context was destroyed … because of a navigation". That is a page reload in the middle of the scan, not an axe violation, and it matches the recorded flake (minor 11): the dev server on 5173 is shared with the concurrent Week 4 and Week 8 agents. Rerun (14:50) of `lectures-week3` alone: **4/4 PASS**, axe dark reports no violations. Lock created with my name, waited for the Week 4 reviewer's lock, and deleted after each run (confirmed absent). |

## Re-review scope

None is required for sign-off. N1–N5 are small text and display fixes that the author can apply and self-verify: rerun the case, quiz and lab-tool suites and `week3-flow`. If N3 is fixed, rerun `quizWeek3.test.ts` and confirm the key distribution is unchanged.
