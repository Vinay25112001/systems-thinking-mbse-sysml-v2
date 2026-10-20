# Week 3 review dispositions

These dispositions answer the independent review `_source_cache/review/week03_review.md` (2026-10-19, verdict REVISE: major 2, moderate 6, minor 12).

- **Date:** 2026-10-19.
- **Commits:** none. The author commits.
- **Register file:** after the Week 4 agent released `_source_cache/verification/readings.py`, the R78 correction was applied there, then `verify_readings.py` and `npm run content:readings` were run (see the register section at the end).

All numbers below are computed in `src/content/lectures/week03/aerolinkCase.ts` and recomputed in `aerolinkCase.test.ts`. None is typed into the slides.

## Summary

| Finding | Status | Where |
|---|---|---|
| M1 trade keeps eliminated alternatives in play | **Fixed** | case, Session 2 slides, notes and lesson, five figures, decision record, Examples, outline, tests |
| M2 REQ-STK-018 fails Week 2's one-"shall" gate | **Fixed** | case (split into REQ-STK-018 and REQ-STK-019), I-001, Session 1 text, Week 2 gates run in a test |
| m1 TECH-001 TRL 6 basis read as TRL 7 | **Fixed** | TECH-001 basis, A-003, Session 1 worked solution, test |
| m2 Week 2 items promised to Week 3 left stale | **Fixed in Week 3 data** (no Week 2 edit) | `W2_DISPOSITIONS`, Examples table, Session 1 notes and lesson, test |
| m3 quiz length-outlier cue | **Fixed** | six items rebalanced, two new tests (per item and across the set) |
| m4 R-011 rating against the C5 anchor | **Fixed** (anchors sharpened, so no re-rating) | `CONSEQUENCE` anchors with key phrases, risk reasons, test |
| m5 lab tool does not enforce screens or walk-aways | **Fixed** | `record.ts`, `labBrief.ts` gates and advisories, lab text, tests |
| m6 ordinal critique has no source | **Kept as a declared gap**, plus a faculty acquisition item | below |
| minors 1–12 | 1, 2, 3, 5, 6, 7, 8, 9 fixed; 4 needs a register change; 10, 11, 12 dispositioned | below |

## Major

### M1: fixed

**Screens.** Two frame screens now come before any weight:

- SCREEN-3: capacity of at least 300 trips/day (REQ-STK-004).
- SCREEN-4: every score inside its walk-away point.

They sit alongside the two security screens, SCREEN-1 and SCREEN-2, whose ids are kept. The screen results are computed, not typed:

- **ALT-001** fails both: 240 trips/day, and a wait of 66.7 min against the 60 min walk-away.
- **ALT-002** fails capacity: 288 trips/day.
- **ALT-003** fails both: 240 trips/day and 66.7 min.

Session 2 slide 9 now says: "the frame eliminated three alternatives before any weight."

**New alternatives.** Two alternatives are added from the morphological box, both marked provenance `proposed`:

- **ALT-005**: 4 aircraft and a new hub vertiport, giving 16 aircraft, 8 chargers and 7 sites. Capacity 320, cost USD 18.0 M, total **0.624**.
- **ALT-006**: 6 aircraft and an upgraded spoke, giving 18 aircraft, 8 chargers and 6 sites. Capacity 360, cost USD 18.8 M, total **0.563**.

The brief asked for ALT-005. ALT-006 is the review's second feasible path, and it is added so that every feasible path through the box is scored.

`MORPH_PATHS` accounts for all nine paths through the box:

- six are listed alternatives;
- three fail a screen straight from the box: keep 12 + upgrade gives 240/day; add 4 + keep gives 288/day; add 6 + new costs USD 24 M, past the 20 M walk-away.

The box figure and its notes show all of this.

**Ranking.** Only the alternatives that pass every screen are ranked: **ALT-004 0.670 > ALT-005 0.624 > ALT-006 0.563**. The reference totals of ALT-001 to ALT-004 are unchanged (0.452 / 0.488 / 0.458 / 0.670) and are still tested against the reference.

**Sensitivity among the feasible alternatives** (`SENSITIVITY`):

| Criterion | Reversal | To |
|---|---|---|
| CRIT-002 cost | down at **0.150** | ALT-005 |
| CRIT-004 noise | up at **0.284** | ALT-005 |
| CRIT-001 wait | up at **0.848** | ALT-006 |
| CRIT-003 resilience | none | — |

The resilience row is "none" because of a fix in `labBrief.reversalPoints`. ALT-004 and ALT-005 have equal resilience values, so their lines meet only at w = 1, and the function used to report that tie as a reversal. It no longer does (`EDGE`), and a test covers the case.

The review's figures assumed a feasible set that included ALT-002, which in fact fails capacity. The figures above use ALT-004, ALT-005 and ALT-006, and they agree with the review on 0.150, 0.284 and 0.848.

**The unscreened analysis.** The old analysis over ALT-001 to ALT-004 is kept as `UNSCREENED_SENSITIVITY`, which gives 0.478 → ALT-001: the reference DEC-001 value. It is shown once, on the sensitivity slide and in the lesson, as the mistake the screens prevent. It is never used as a decision condition.

**Decision record.**

- *Conditions:* the capital weight stays above about 0.15 and the noise weight below about 0.28; demand stays near 240; the grid connection holds; the chargers meet the signed-configuration rule.
- *Would change if:*
  - demand is 192 trips/day or less;
  - the capital weight falls below 0.150, or the noise weight rises above 0.284 (ALT-005 ranks first);
  - the wait weight rises above 0.848 (ALT-006 ranks first);
  - TBD-02 rules out converting the spoke. ALT-005 then becomes the recommendation, subject to its own grid connection, a seventh site (U-005) and a change to the six-vertiport wording of REQ-STK-004.
- The "capital weight below 0.48" condition is gone.

**Other content updated to match:**

- *Min–max pitfall.* It is now computed among the feasible alternatives. If ALT-004 drops out (the TBD-02 condition), min–max scaling reverses ALT-005 and ALT-006: 0.340 < 0.400 with three alternatives, 0.600 > 0.400 with two. Fixed anchors keep 0.624 > 0.563 in both sets.
- *Compensation.* The pitfall now names the baseline's zero cost buying back a rejected wait.
- *Scores table and value-component chart.* They show only the feasible three.
- *Lesson.* It gains a screens table.
- *Session 2 answer slide.* It now gives the capital and noise conditions.
- *Figures.*
  - morphological box: six paths, plus the three screened paths;
  - capacity chart: six points;
  - line diagram: three lines, crossing at 0.150;
  - normalization trap: feasible set;
  - decision record: new conditions.

  All were checked visually on the dev server.
- *Examples page.*
  - screens table: all four screens;
  - trade table: "screened out" instead of a total for screened-out alternatives;
  - sensitivity, min–max and decision tables;
  - Try-it: now on ALT-005.
- *Outline §3.* Annotated as revised after the review.

**Tests (all numbers recomputed):**

- capacities 240/288/240/320/320/360;
- the screen outcomes for each alternative;
- the nine box paths;
- ALT-005 and ALT-006 worked by hand;
- the feasible totals;
- each reversal point, with the leader checked either side of it;
- **every `SENSITIVITY` target passes every screen**. The test is also shown able to fail: the unscreened target ALT-001 fails it;
- the decision record names no screened-out alternative and does not contain 0.478 or 0.48;
- the min–max numbers.

### M2: fixed

REQ-STK-018 is split into two requirements, one "shall" each:

- **REQ-STK-018**, "Notice of a disrupted trip": notify each passenger whose confirmed trip is held, diverted or cancelled within TBD-05 min of the disruption decision. It is now typed `performance`, method demonstration, TBD-05 owned through U-007.
- **REQ-STK-019**, "A way onward for a disrupted trip": offer each such passenger a way onward to the destination. Type functional, method demonstration; it rests on A-008.

Both trace to NEED-011 and CAP-015.

I-001's action, the code comment and the Session 1 register notes and lesson now name both requirements.

A new test, `aerolinkCase.test.ts`, "the new requirements pass Week 2's own requirement gates", builds the Week 2 standard record with U-007 and the Week 3 requirements added. It then runs `assessRequirement` from `src/workbench/week2/record.ts` on every `W3_REQUIREMENTS` entry, and every hard gate passes. The test also shows the gates able to fail: the old compound statement fails `one-shall`, and an untracked TBD fails.

### m1: fixed

The TECH-001 basis and A-003 now read:

> a prototype at another operator's vertiport, whose grid connection and duty cycle differ from AeroLink's hubs: a relevant environment, not the operational one (that would be TRL 7).

The Session 1 worked solution adds the question "is that the operational environment? No …" and the line "the same prototype at an AeroLink hub would be TRL 7".

This is now consistent with:

- SEBoK Table 1, where TRL 6 is "Prototype demonstration in a relevant environment" and TRL 7 is the operational environment;
- quiz item w3q-1, option b;
- TPM-001's "another site".

A test checks that each basis names the environment its TRL wording requires. It also checks that the pre-review wording is rejected.

### m2: fixed in Week 3 data, Week 2 untouched

`W2_DISPOSITIONS` gives a status, a new close-by and a reason for U-001 to U-006 and for the REQ-STK-011 promise:

| Item | Status | Reason, in brief |
|---|---|---|
| U-002 | re-dated to the Week 4 architecture baseline | Made a decision condition, and R-005 is handled by avoidance. |
| U-003 | re-dated to Week 4 | The cap is enforced per pad by scheduling (REQ-SYS-011) whichever alternative wins; the alternatives differ only in peak movements, which the noise criterion scores. |
| REQ-STK-011 promise | re-dated with U-003 | Week 2's "must be a number before the trade" is acknowledged as too strong, and the reason is given. |
| U-004 | re-dated to the Week 6 roadmap | Every Year-2 alternative keeps the piloted baseline. |
| U-006 | re-dated to the first demand re-forecast (A-006 validation) | No alternative changes the fare. |
| U-001, U-005 | open, not promised to Week 3 | U-005 now matters to ALT-005's seventh site. |

Where the dispositions appear:

- the Examples page has a new "Unknowns … with their Week 3 disposition" table (`catalogue-unknowns`), plus a table of this week's requirements (`catalogue-requirements`);
- the Session 1 register notes (slide 18) and the lesson say that four Week 2 unknowns fell due at this trade and each is re-dated with a reason.

A test checks that every unknown whose Week 2 close-by mentions Week 3 has a non-open status and a new close-by that does not mention Week 3.

**Week 2 files edited: none.** No Week 2 export name changed.

### m3: fixed

Six items were rebalanced. Each key keeps its length rank, so ranks 1–4 still occur three times each with no run of three, and keys stay at a–d three each:

| Item | Key length, before → after | Distractor change |
|---|---|---|
| w3q-2 | 50 → 76 | — |
| w3q-3 | 103 → 52 | lengthened to 40–44 |
| w3q-6 | 5 → 26 | — |
| w3q-7 | 119 → 88 | lengthened to 59–65 |
| w3q-10 | 18 → 53 | — |
| w3q-11 | 51 → 22 | lengthened to 16–19 |

All key ratios now lie within 0.69–1.35 of the nearest distractor.

New tests:

1. No key is a length outlier: never at least 1.4 × the next longest option, nor at most 0.7 × the next shortest.
2. Across the set, the strategy "pick the odd one out by length, else guess" scores at most 25 %, and no key is the clear outlier.
3. Negative test: the pre-review lengths are caught by both rules.

### m4: fixed by sharpening the anchors

R-011 is not re-rated. The anchors now separate the two levels by recoverability:

- **C4:** "the service is impaired or suspended, but recoverable";
- **C5:** "Injury, *permanent* loss of a major asset or of the service, or a key requirement cannot be met".

Each anchor carries key phrases (`keys`).

Every risk's consequence reason was reworded to end in its level and to use a phrase from that level's anchor:

- R-009 is now C5 for injury; the network-wide suspension alone would be C4.
- R-011 is C4 as "suspended but recoverable the same day".
- R-003 is C5 as a "permanent loss of the service at that vertiport".

The prompt "which is in the Low cell? The grid outage" stays valid.

A test checks that every rating names its anchor, and that the old R-011 reason ("no safety consequence") is caught. The anchor change reaches the lab tool and the lab instructions through `labBrief`.

### m5: fixed in `src/workbench/week3/record.ts` and `labBrief.ts`

- **(a) Walk-away.**
  - *Hard gate:* the recommendation gate now also requires the recommended alternative to lie inside every walk-away point, and the message says so.
  - *Advisory:* `walk-away` names every scored alternative beyond a walk-away point.
  - Such alternatives are left out of the sensitivity (`computation.beyondWalkAway`, `computation.feasible`), so the tool reproduces the lecture.
- **(b) TPM breach.** A new hard gate, `breach-risk`: a negative margin needs a linked risk, or an issue (I id) if the breach is certain. The lab text now says this explicitly ("a TPM breach is a risk"). With a link in place, the `breach` advisory remains as a reminder to re-rate the risk.
- **(c) Recommendation not ranked first.** Advisory `not-top`: give the reason in the conditions.
- **(d) Wrong reversal number.** Advisory `reversal-number`: the note states no number within ±0.02 (`REVERSAL_TOLERANCE`) of any computed reversal point. The fixture's "0.47" against a computed 0.467 passes; 0.90 is flagged.

The lab instructions (steps 8–11) were aligned, and `npm run lab:md` was run.

Tests show each new gate failing alone and each advisory appearing and not appearing, both directions. The AeroLink reproduction test now feeds the capacity screen and matches `SENSITIVITY` exactly.

### m6: kept as a declared gap

The honest gap statement is kept in the Session 1 notes and the lesson: no held source argues the ordinal-arithmetic point, and the reasoning is the instructor's.

**Faculty source-acquisition item.** Cox, L.A. Jr. (2008), "What's wrong with risk matrices?", *Risk Analysis* 28(2):497–512.

- If it is acquired, register it and cite it on Session 1 slide 13 and in the lesson.
- Until then, the faculty should accept the declared gap in the decision register.
- Optional, as the reviewer suggested: NIST SP 800-160 Vol. 2 for resilience techniques.

## Minor

| # | Status | Disposition |
|---|---|---|
| 1 | Fixed | R61b now cited as pp.636–637 in the notes and the lesson, and p.636 added to the slide sources. This is inside the register range 634–640, so the register does not change. |
| 2 | Fixed | Both places now read: "SEBoK lists coordinated defense among the resilience techniques, for example through a defense-in-depth strategy (R24 p.1206)". |
| 3 | Fixed | "A pair rather than a product" is now labelled "the instructor's gloss" in the notes and the lesson. To stay within 130 wpm, the rest of that note was tightened. |
| 4 | Fixed in the register | The R78 displayed title now names the whole range. No Week 3 text change: the citations (R78 slides 147 and 152) are inside the existing range 145–162. See the register section below. |
| 5 | Fixed | The pre-work note now says "about twenty minutes", matching the 0.3 h workload row. |
| 6 | Fixed | R-008 now reads "about 240 high-power charges a day today, and more with a larger fleet". |
| 7 | Fixed | The CRIT-004 lens states that the trace to MOE-003 is indirect, and that peak movements are the stated proxy. ALT-003 and ALT-005 note that a seventh site needs a change to REQ-STK-004's six-vertiport wording. The decision record names this for the TBD-02 fallback. |
| 8 | Fixed | MONTH6 is rounded once: reserve 21.25 %, worst case 20.25 %, margin 0.25 points. The slides, notes, lesson and figure show two decimals, and the test was updated. |
| 9 | Fixed | The outline now says 2.5 h each (7.6 person-hours) for a team of three. |
| 10 | Dispositioned | The workload has no slack: undergraduates 7.8 h, graduates 8.0 h, against the 8.0 h budget, still test-enforced. The lesson grew with the screens and the dispositions, but its row is computed from its own word count and the total stayed within budget. As the reviewer suggests, check the 150 wpm lesson rate against the Week 3 time logs. |
| 11 | Recorded | Flake reproduced. `lectures-week3.spec.ts` failed two tests (viewer, and axe light) on a run under load, then passed 4/4 on an immediate rerun with no change. In full vitest, the legacy `activities/week03` suite fails under load and passes alone (67/67). |
| 12 | Dispositioned | No change. Security in every trade is a faculty decision: the `resilience` advisory can be promoted to a gate if wanted. The register gates still require one security risk and one resilience risk, and the new frame screens make screens the normal case. |

## Changes affecting Week 4

The Week 4 agent imports `week03/aerolinkCase.ts` read-only. Every exported name and id is kept; things were only added.

- **`W3_REQUIREMENTS` now has two entries.** REQ-STK-019 is new, and REQ-STK-018's statement and type changed (now `performance`). Week 4 already maps both through `W3_DISRUPTION_REQS` on FN-015; its tests pass (233/233 with Weeks 1–2).
- **`ALTERNATIVES` now has six entries**, adding ALT-005 and ALT-006. Week 4 uses `alternative(TRADE_DECISION.recommended)`, `alternative('ALT-001')` and `ALTERNATIVES.find(...)`; all are unaffected.
- **`DECISION`**:
  - unchanged: `id`, `recommended` (ALT-004), `decision`, `residualRisk`;
  - changed: `why`, `conditions` and `wouldChangeIf`. They no longer mention the 0.478 capital weight. They now give 0.15/0.28 and 0.150/0.284/0.848, and ALT-005 as the TBD-02 fallback.
- **`SCORES`, `TOTALS`, `CRITERIA`, `TRADE_RULES`, `TPMS`, `RISKS`, `marginOf`, `wceOf`, `tpm`, `criterion`, `capacityOf`:** unchanged for existing ids.
- **`RISKS`:** consequence and likelihood *reasons* reworded for R-002, R-003, R-005, R-006, R-008, R-009, R-010 and R-011. Ratings and handling are unchanged.
- **`RANKING` and `SENSITIVITY`:** same names, but now computed among the feasible alternatives only. `RANKING` is ALT-004, ALT-005, ALT-006 (previously ALT-004, ALT-002, ALT-003, ALT-001). Week 4 does not import either.
- **`MINMAX_DEMO`:** the key `without3` was replaced by `without` and `pair`. Only Week 3 used it.
- **`MONTH6`:** cbe 21.25, wce 20.25, margin 0.25 (were 21.3, 20.3, 0.3).
- **`labBrief.CONSEQUENCE`:** the C4 and C5 anchor text changed, and each anchor gained `keys`. `reversalPoints` no longer reports a tie at w = 0 or 1.
- **New exports:**
  - frame and screens: `W2_DISPOSITIONS`, `W2Disposition`, `REFERENCE_ALTERNATIVES`, `walkAwayFailures`, `passesScreens`, `FEASIBLE`, `SCREENED_OUT`;
  - box and sensitivity: `MORPH_FLEET`, `MORPH_HUBS`, `MORPH_PATHS`, `UNSCREENED_SENSITIVITY`.
- **`SCREENS`:** SCREEN-3 and SCREEN-4 now come first in the array; SCREEN-1 and SCREEN-2 keep their ids.
- **Side effect of `npm run lab:md`:** the script regenerates every week's lab markdown. It rewrote the untracked `docs/lectures/week04/WEEK4_LAB_INSTRUCTIONS.md` from the Week 4 agent's current source, and rewrote the Week 8 file with content identical to HEAD.

## Register changes (applied 2026-10-19, after the Week 4 agent released `readings.py`)

1. **R78, title.** Slide 145 really is headed "Standard View Definitions", and the verifier matches the title against the heading on the first page. So the verified title stays as it is, and the range stays 145–162, because Weeks 4 and 14 cite sl.145 and Week 12 cites sl.149 and 157–159.
   - `readings.py` gains a `DISPLAY_TITLES` map. R78 is shown as "Standard View Definitions and Domain Libraries (metadata, analysis, cause and effect, requirements derivation)".
   - `scripts/export_readings.py` gained one additive line: it shows the display title when one exists, and otherwise the verified title.
   - `verify_readings.py`: R78 is still "title found on first page (heading line)"; the total is 134/135, as before (R30 is the declared exception).
   - `npm run content:readings`: the only change in `readings.generated.json` is R78's title.
2. **R61b, page range.** No change. The pp.636–637 citation lies inside 634–640.
3. **Optional, faculty acquisition (not registered):**
   - Cox (2008), *Risk Analysis* 28(2):497–512 (m6);
   - NIST SP 800-160 Vol. 2.

   Neither is cited until it is registered.

## Gates (2026-10-19)

| Gate | Result |
|---|---|
| `npx tsc -b` | Week 3 clean. One error, in `src/workbench/week8/skeleton.test.ts:205`, a file the Week 8 agent is editing. |
| `npx oxlint src` | 0 errors. Warnings are only-export-components, as before. |
| `npx vitest run` | 1621 passed, 13 failed, none in Week 3. The failures are: legacy `activities/week03` (2, under load; passes alone, 67/67), week07 activities (2), week08 activities (1), Week 8 lab md and sysml listings (7, Week 8 work in progress), week11 (1). Week 1–4 lecture, Week 2 workbench and all Week 3 suites pass (167): case 37, timing 16, quiz 14, lab 13, record 79, lab tool 8. |
| `npx vite build` | PASS (chunk-size warning only) |
| Student build and `scripts/check-student-build.mjs` | PASS (re-run after the register change): 0 of 2062 faculty-notes markers in the student build; Week 3 student decks have empty notes. The first run caught one notes paragraph whose opening matched a lesson sentence; it was reworded and the check re-run. |
| `npm run lectures:pptx -- --week 3` | Rebuilt: session 1 has 25 slides, session 2 has 21, plus the notes and the lesson. |
| `npm run lab:md` | Rebuilt `WEEK3_LAB_INSTRUCTIONS.md`. |
| Playwright `week3-flow.spec.ts` | 6/6 PASS. The spec now expects 0.150 in the sensitivity table, no 0.478, the "re-dated" dispositions and REQ-STK-019. |
| Playwright `lectures-week3.spec.ts` | 4/4 PASS on rerun; the first run flaked (minor 11). |

Playwright ran under `_source_cache/.playwright.lock`: created, then deleted after the runs.

## Gate sweep 2026-10-19 (cross-week “tool rejects valid short answers”)

Found as Week 2 M1, Week 4 M2/N3 and Week 5 M2; swept across every team lab tool. A length or form gate stays only when a
student-visible sentence makes the short entry a real defect and the threshold is shown to the student. Full
before/after table, justification and the gates examined and kept: `docs/lectures/GATE_SWEEP_2026-10-19.md`. Shared
test: `src/workbench/shortAnswers.test.ts`. Record and gate signatures and the export format are unchanged.

| Gate | Before | After | Why |
|---|---|---|---|
| Technology “does”; evidence; assumption validation | ≥ 5; ≥ 3; ≥ 3 words | written, not an empty answer | “Keeps food cold”, “Vendor datasheet”. |
| Risk condition / if / then | ≥ 3 words each | written, not an empty answer, each | “If power fails, then food spoils.” |
| Risk reasons, trigger, treatment | ≥ 3, ≥ 2, ≥ 3 words | written, not an empty answer | “Happened twice”, “Alarm”, “Buy generator”. |
| TPM basis | ≥ 3 words | written, not an empty answer | “Vendor test”. |
| Trade decision statement | ≥ 8 words | written; trace gate kept | The course form filled tersely is 7 words. |
| Weight rationale; residual risk | ≥ 5; ≥ 3 words | written, not an empty answer | “Power cuts”. |
| Sensitivity note | ≥ 5 words | written and states a number when a reversal point was computed | The gate asks for the reversal point; “see table” still fails. |
| Register names; closed by; opportunity/issue text, action; screen test; alternative description | ≥ 2–5 words | written, not an empty answer | Short entries are complete. |
