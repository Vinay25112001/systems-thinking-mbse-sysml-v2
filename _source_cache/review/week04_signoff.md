# Week 4 sign-off pass: Requirements engineering

Reviewer: Independent AI reviewer (Claude), sign-off pass. Date: 2026-10-11.

## Inputs

- First review: `_source_cache/review/week04_review.md` (W4-F01..F17).
- Authors' dispositions: `learning-studio/docs/authoring/week04_notes.md`. I verified these against the code instead of taking them on trust.
- Shared changes since the first review:
  - REQ-SYS-005 now reads "at least 99 % … within 60 s".
  - A-007 has been aligned with the Week 4 turnaround derivation (DECISION_LOG W8).
  - W7 now requires that graduate tasks are always read.
  - `course.ts` adds R49 p.149–150 to the Week 4 essential readings.
- I checked the reference as it stands at HEAD `1067a4e`.

## Material re-read

- `src/content/weeks/week04.ts`, in full.
- `src/activities/week04/*`: `quality.ts`, `QualityLab.tsx`, `TraceChecker.tsx` and the tests.
- `src/model/reference/week04.ts`, loaded and inspected programmatically.
- `src/model/reference/week02.ts` (A-007).
- `src/content/weeks/week05.ts` q5-5, for cross-week consistency.

No course or app file was left modified. One mutation was applied and then reverted with `git checkout`, after which `git diff --stat` was empty for that file. My first attempt at the mutation addressed the wrong line and was a no-op. I noticed this from the empty diff, and the retry is the run reported below.

## Verdict: **SIGN-OFF**

All 17 original findings are resolved. There are no new critical or major defects.

- The worked turnaround budget matches the current A-007 and the REQ-STK-005 rationale.
- The REQ-SYS-005 statement and criterion now agree.
- The quality lab refuses the first reviewer's probes, and my new realistic bad requirements.

There are three minor findings. The most useful one (W4-S02) is that the tool still cannot see a criterion that contradicts its statement, which is the lesson W4-F02 was fixed to teach.

## Tool runs (from `learning-studio/`)

| Command | Result |
|---|---|
| `npx tsc -b` | Exit 0. |
| `npx vitest run src/activities/week02 src/activities/week03 src/activities/week04 src/content src/model` | **13 files, 275 tests passed.** |
| Reference inspection (jiti, scratch script) | 20 REQ: performance 11, constraint 4, functional 3, interface 2. TBX in REQ-STK-003, REQ-STK-010, REQ-SYS-004 and REQ-SYS-010, so 4 of 20 (20 %). The REQ-SYS-005 statement and criterion are shown under "What I verified". |
| Heuristic probes (jiti, new inputs, not the first reviewer's) | See W4-S02. |
| Mutation: missing criterion changed from `'fail'` to `'advisory'` in `checkRequirement` | **4 tests fail**, including "(c) superlatives and a missing criterion fail" and the trace-checker/RB-3.2 proxy test. Reverted; `git diff --stat` is empty. |

## Disposition of the original findings

| ID | Sev. | Status | Evidence |
|---|---|---|---|
| F01 unverifiable reqs pass | major | **RESOLVED** | (a) A count no longer softens a vague word; only a bounded measure or a TBX does. (b) Method fit fails on a quantitative value whatever the type label. (c) A missing or vague criterion fails for every type, and the vague list gains highest/lowest/possible. The mutation shows the criterion rule is load-bearing. My probes "fast enough for operations", "within an acceptable time", "in a timely manner" (re-typed functional/demonstration), "shall be reliable" and "quiet enough for residential areas" are all refused. The lab text says "necessary, not sufficient". |
| F02 criterion contradicts statement | major | **RESOLVED** | The reference REQ-SYS-005 statement is "…to at least 99 % of confirmed ride requests within 60 s of confirmation". The criterion is "≤ 60 s for at least 99 % of at least 200 requests in a replayed peak-hour request profile". Worked example (a) ¶3 uses the old pair as an explicit statement/criterion lesson (R55 p.370, verified "expanded test criteria … no disagreement later"). The table row, q4-4b and q4-7 match. |
| F03 memo never read | major | **RESOLVED** | The memo is notebook entry 4, always read (W7). It is formative on RB-3.5, with level descriptors in `rubricScope` and the facilitation note. |
| F04 memo 0.5 h | major | **RESOLVED (with caution)** | Scope is narrowed to six checklist items and R55 p.367–372, budgeted at 1.3 h. Caution 4 gives the full-checklist estimate (≈ 2 h) and the FD-22 rule. (The new essential R49 pages are uncounted; see W4-S01.) |
| F05 no owner/AI tag | major | **RESOLVED** | `QualityLab.tsx` uses `ProvenanceOwnerFields`/`ownerProblem`. `buildBatch(d, po)` passes owner and provenance to the REQ and any new Unknown. A new Unknown requires resolution work (≥ 3 words) and a need-by date (`quality.ts` l.224–232). |
| F06 worst arrival state | minor | **RESOLVED** | "Worst **planned** arrival state" appears in the lesson, the table, the REQ-SYS-001 rationale (reference, verified) and answerKey[3]. The below-reserve case is named as uncovered. |
| F07 R54 "must be testable" | minor | **RESOLVED** | Quoted and reconciled in w4-attributes ¶2 and misconception 3 (R54 p.329, verified). The block is tagged `mixed`. |
| F08 "must" across weeks | minor | **RESOLVED** | w4-application ¶1 reconciles the two weeks (R55 p.369 "must … may show intent but are not legally binding", verified). The Week 3 need-studio message is aligned. |
| F09 quiz revealed / Bloom | minor | **RESOLVED** | q4-9 (Vendor-Y ML), q4-10 (ANSP intent, 5 min), q4-11 (OEM fault records), q4-12 (curtailment) are new cases. q4-3 is Apply and q4-5 Understand. The Session 1 what-if is 6 min (lesson 7, quiz 8). |
| F10 R49 not assigned | minor | **RESOLVED** | `course.ts` l.96 now lists R49 p.149–150 as an essential reading. (The module text was not updated; see W4-S01.) |
| F11 design-free only on "using" | minor | **RESOLVED** | Probe: "The charging system shall use Brand-X 350 kW chargers." raises a design-free advisory and a range advisory, and is refused on method fit. |
| F12 TBX ownership | minor | **RESOLVED** | Every token must be owned. A U item owns a TBD or TBR; an A item owns only a TBR. A linked item whose `tbd` names another token does not count. All tokens are recorded (`quality.ts` l.222–237). |
| F13 three overclaims | minor | **RESOLVED** | Now "consistent with SEBoK, … but SEBoK does not assign" (R13 p.566, verified). Types are "adapted from" R55 with the reference-not-type caveat. q4-10 cites R55 p.370 only for ranges (verified "minimum of … within"). |
| F14 REQ-SYS-008 rationale | minor | **RESOLVED** | Per the notes and the reference: ≥ 5 min from assignment to release (FICTIONAL), and the interlock reads fault reports. |
| F15 reference vs marking guide | minor | **RESOLVED** | answerKey[3] names the three shortfalls (no utility/weather-data interface; performance-heavy mix 11/3/2/4, which matches my count; no below-reserve turnaround). The REQ-SYS-003 justification is noted. |
| F16 AROU v0 input | minor | **RESOLVED** | "AROU v1 from CP1". |
| F17 tsc | minor | **RESOLVED** | Exit 0. |

## New findings (none blocking)

| ID | Sev. | Location | Finding | Fix |
|---|---|---|---|---|
| W4-S01 | minor | w4-attributes ¶2 last sentence (l.69); caution 3 (l.502); workload readings line (l.515); `references` (l.521) | **Stale after R49 p.149–150 became an essential reading.** The lesson says "R49 itself is optional reading". Caution 3 says R49 is "not one of this week's readings … recommended to the lead: add R49 p.149–150", but `course.ts` l.96 already lists it. The readings line counts only R13, R48 and R54 (≈ 23 pp), so ≈ 2 pp (≈ 0.1 h) of required reading is uncounted. R49 p.149–150 also sits in `references`, which the schema defines as "additional references beyond the week's readings". | Remove "R49 itself is optional reading". Rewrite caution 3 so that R49 is required and only R55 is extension. Add R49 to the readings line (≈ 25 pp, ≈ 1.7 h) and rebalance or report the total. Keep only the R55 entry in `references`. |
| W4-S02 | minor | `quality.ts` criterion check (AUTHORING_GUIDE §7 rule 5) | **The quality lab cannot see a criterion that contradicts its statement.** This is the defect class of W4-F02, which the lesson now teaches ("check the pair, not each half"). Probe: statement "…within 20 min", criterion "Charge time <= 25 min for 9 of 10 charges", performance/test. Result: **recordable, no failing check and no advisory**. Related: a criterion that is neither vague nor measurable ("Residents do not complain during the trial") is only an advisory, although L4 asks for a measurable criterion for every requirement. Neither gap is claimed as checked, so this is minor. | Add an advisory when the statement and the criterion carry the same unit with different values, or when the statement's quantifier ("each", "every", "at least N %") differs from the criterion's population. Add the probe above as a regression test. Consider making a non-measurable criterion a fail for performance requirements. |
| W4-S03 | nit | `docs/authoring/week04_notes.md` "Verification runs (final)"; `week04.ts` header comment | The notes' "final" verification section still reports `tsc -b` exit 2 and 327 tests, which predates the revision. The revision table says exit 0. The module header still says "Pending independent review". | Refresh both. |

## What I verified independently

### Budgets

- 25 = 20 + 5.
- The lesson what-if of 7 min leaves 18 min of charge budget. q4-3 uses 8 min, leaving 17. The Session 1 what-if is 6 min, leaving 19, and is deliberately different from the quiz.
- 60 s ÷ 900 s = 6.7 %, and q4-7 rounds this to "about 7 %".
- TBX share: 4 of 20 requirements, or 20 %.

### Turnaround composition

The worked example (a) says: "Rotor stop, the safety check, and connecting and disconnecting the charger add 5 min, while deplaning and boarding overlap the charge." This agrees with three other sources:

- the reference REQ-STK-005 rationale;
- the current A-007, which adds that each pad pair shares one charger, switched during the 5 min;
- Week 5 q5-5 ("overlap the steps").

Week 4 does not need the two-pads detail, because it budgets time on the pad, not charger occupancy.

### Reference statements

These were read programmatically from the reference. REQ-SYS-001 (from "≥ 20 % reserve", "within 20 min", rationale "worst planned arrival state"), REQ-STK-001 (at least 90 % each calendar month within 15 min; analysis) and REQ-SYS-005 all match the table in worked example (a).

### Citations

New or changed citations were each read on the cited page:

- R54 p.329: "All requirements must be testable…"
- R54 p.330: "what" vs "how".
- R55 p.367: "white space".
- R55 p.368: "impossible to guarantee detection 100 percent".
- R55 p.369: "must … not legally binding".
- R55 p.370: expanded test criteria; "minimum of … within".
- R55 p.371: reverse reference.
- R13 p.563: "specific form or template for a functional requirement".
- R13 p.566: "individual requirements and sets of requirements".
- R49 p.149: "Demonstration is used when quantitative assurance is not required".
- R49 p.150: "fully controlled and traceable conditions".

All land and none is overstated.

### Quiz

- 13 items, each with one correct option and an explanation for every option.
- The answer-key line (q4-1 a … q4-13 b) matches the `correct` flags.
- Objectives covered: B4.1 ×3, B4.2 ×7, B4.3 ×3.

### AUTHORING_GUIDE §7

| Rule | Result |
|---|---|
| 1 | The quality lab records owner and provenance. |
| 2 | The memo is always read and scored with descriptors. |
| 3 | Met with caution; R49 is uncounted (W4-S01). |
| 4 | All 20 reference requirements have no failing check, and the six rewrites raise no advisory (tests). |
| 5 | The first reviewer's probes and my new probes are refused, except the statement/criterion pair (W4-S02). |
| 6 | The quiz uses fresh cases. |
| 7 | Course types vs SEBoK categories are labelled. |
| 8 | Reference IDs are used throughout. q4-9 to q4-12 use unnumbered new statements, so there is no collision. |
