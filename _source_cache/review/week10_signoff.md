# Week 10 sign-off review: SysML v2 requirements and structure (L10, model v0.2, prepares CP4)

Reviewer: Independent AI reviewer (Claude), sign-off pass. Date: 2026-10-11. No course or app file was changed. The one mutation was applied, tested and reverted, and `git diff --stat` on that file is empty afterwards.

**Under review:** the fix commit c604481 against the first review (`week10_review.md`, W10-F01 to F20), and the author's response table in `docs/authoring/week10_notes.md`, which I checked rather than trusted. Files: `src/content/weeks/week10.ts`, `src/activities/week10*`, `sysml/week10/*`, `sysml/instructor/week10/*`. Nothing under these paths has changed since c604481 apart from the shared `validation-report.json`.

## Verdict: **SIGN-OFF**

All 20 original findings are resolved, or deferred to the lead with a recorded request (F16, F17). The High finding (F01, key leak) is fixed and tested; my probe and my mutation confirm it. The quiz key is balanced. The translator's new limit, direction and unit checks fail the realistic bad inputs the first review named.

There is no new critical or major finding. The new findings below are minor. The most useful is S10-N1: the direction check wrongly fails two common negated phrasings. It should be fixed before release, but it does not block sign-off: the reference set and the course's own requirement wording are unaffected.

## Disposition of the original findings

| ID | Sev. | Disposition | Evidence |
|---|---|---|---|
| F01 | High | **RESOLVED** | `scorePredictions10` scores only revealed items whose record is `recorded`, against `rec.outcome`. A jiti probe with no reveal gives `scored: 0, correct: 0`. The score line reads "N predicted; M revealed with a verified record; of those …", and "Your prediction matches the recorded result" compares with `rec.outcome`. The tests cover the unrevealed and unverifiable cases. |
| F02 | Med | **RESOLVED** | `limit-value` check. My probes: `<= 25 [min]` with no parameter FAILs; parameter 20 [min] with constraint literal `20 [s]` FAILs ("the constraint ignores the value you bound"). |
| F03 | Med | **RESOLVED** (one new false reject, S10-N1) | `direction` check plus unit-kind conversion. My probes: `>=` for "within 20 min" FAILs; `<=` for "at least 90 %" FAILs; `20 [s]`, `20 [km]` and `0.25 [h]` FAIL; `1200 [s]` passes (converted); limit on the left (`maxChargeTime >= feature`) passes. Mutation: forcing `want = op` made 1 test fail. Reverted, and the diff is empty. |
| F04 | Med | **RESOLVED** | My probes reproduce the notes: G2 (`in attribute` before `subject`) FAILs "Subject must be first parameter."; G3 (`actor` before `subject`) FAILs the same; G (plain attribute before subject) PASSES. The lesson ¶2, the commentary row and the caution say exactly this. S06 p.166, re-read: "must come before the declaration of any other parameters". See S10-N4 on terminology. |
| F05 | Med | **RESOLVED** | The key's required constraint now depends on the arrival state, and the actor is bound to `ref part arrivingAircraft : EVTOLAircraft[1] :> 'PHY-001'`. The arithmetic in key (c) checks: (0.80 − x) × 30 ≤ 20 ⇔ x ≥ 2/15. The per-binding reading cites S06 p.162, re-read ("relative to the specific environment entity filling the actor role"). The key PASSES with no messages (SHA-matched record). |
| F06 | Med | **RESOLVED** | The listing uses `windSpeed <= 0.5 [m/s]`, labelled FICTIONAL. A new paragraph, "Gate or reference condition?", recommends the reference-condition reading as a course choice. Misconception 6 now targets "an assumption is a requirement on the environment". |
| F07 | Med | **RESOLVED** (lead remainder) | The lesson presents the REQ-SYS-010 satisfy as an intent the model does not yet express, explains the free-feature trap, and gives the binding that would express it (probe R10 in the notes). The reference change is lead request 2. |
| F08 | Med | **RESOLVED** | q10-7 is keyed on "a binding; a better estimate means editing the model". The explanation ties this to TPM-001's bound 18 min as a re-baselined snapshot, and mentions `:=`/`default` with the register gap stated. S10 sl.24–25, re-read: "This is a binding, not an initial or default value." |
| F09 | Med | **RESOLVED** | My script gives keys a3 b3 c3 d3, with the correct option the unique longest in 0/12. |
| F10 | Med | **RESOLVED** | The memo reading is p.161–162 and 165 (only p.162 new), and part (e) is merged into (d). The cautions give a realistic breakdown (1 h, or ≈ 1.5 h if new constructs are written). |
| F11 | Low–Med | **RESOLVED** | The lab step reads "at least the REQ-SYS set (or six requirements) … the rest out of class". The session notes match. |
| F12 | Low–Med | **RESOLVED** | The "so" causal claim is gone. Groups with heterogeneous members are now described as collections for organisation, never satisfied as a whole. The silent-pass table has the row "group whose members have different subjects". |
| F13 | Low | **RESOLVED** | All three pc6 errors are quoted, with "order varies". My run listed "Must reference a requirement." first, a fourth order, which confirms the caution. |
| F14 | Low | **RESOLVED** | q10-10 is now an allocation-direction and nested-allocation item. S10 sl.106, re-read: "can be refined using nested allocations"; "responsibility for realizing the intent of the source". The reference has `'LOG-003 allocated-to PHY-005'` and LOG-003 performs FN-008. |
| F15 | Low | **RESOLVED** (borderline) | q10-11 is now a case where `not satisfy` is right (a rejected alternative with a certified test). My probe of the satisfy / not-satisfy pair PASSES with no messages. It is still close to the lesson's sentence on "a rejected alternative" (S10-N6). |
| F16 | Low | **DEFERRED to the lead** (recorded) | The workload row is renamed "lesson-cited S06 extracts (extension reading)". Promoting R83 to a reading is in the notes' lead request 5. See S10-N5. |
| F17 | Low | **DEFERRED to the lead** (recorded) | The reference REQ-SYS-001 rationale hint is lead request 3. |
| F18 | Low | **RESOLVED** | The c4 explanation now says "not a satisfy … in Week 12 it becomes the result of a verification case that verifies REQ-SYS-005". |
| F19 | Low | **RESOLVED** (one new staleness, S10-N3) | The notes are updated: key location, probe G superseded, full-run counts at fix time. |
| F20 | Low | **RESOLVED** | The text reads "following the pattern of S10 sl.89, with the doc comment added from S06 p.165 (the slide has none)". |

## New findings (all minor; none blocks)

| ID | Severity | Location | Finding | Evidence | Fix |
|---|---|---|---|---|---|
| S10-N1 | Low–Med | `translator.ts` `limitDirection` | **False reject on common negated phrasings (rule 5, good input).** The nearest limit word wins, and "not … than" with a word in between is not recognised. "shall **not take more than** 20 min" is read as a lower limit, so a correct `<=` FAILs with "states the opposite requirement". "shall **not be less than** 90 %" is read as an upper limit, so a correct `>=` FAILs. The message is confidently wrong. The reference statements do not use these forms, so rule 4 still holds. | My probes through `checkTranslation`: the cases "GOOD not take more than" and "GOOD shall not be less than 90%" each give `direction:false`. | When a "not" or "never" precedes "more than", "less than", "above" or "below" within the window, invert the direction (or treat it as an advisory). Add both sentences as good-input tests. |
| S10-N2 | Low | `translator.ts` `featureOf`; value check | **Two smaller edge cases.** (a) A nested feature chain such as `chargingSystem.charger.chargeTime <= maxChargeTime` FAILs with "Neither side is a feature of the subject", which is false for a chain. (b) The value check ignores the declared type. `90` for "at least 90 %" passes although the course writes fractions. `0.20` bound to `maxChargeTime` passes all checks when the statement contains "20 %". | My probes: "GOOD nested feature" gives `constraint:false`; the "90" and "0.20" cases give 0 failed. | (a) Accept `subject.(name.)+name`. (b) Advise when a DurationValue parameter gets a unitless value, or when a fraction convention is broken. |
| S10-N3 | Low | `week10.ts` `review.openIssues: []` | **Open lead requests are not surfaced (W9-F18 class).** The notes list five live requests: register pages (ModelingMetadata; `:=`/`default`), the REQ-SYS-010 binding, the REQ-SYS-001 rationale hint, the still-air note, and R83 promotion. `openIssues` is empty. | Notes, "Open issues and requests to the lead". | Copy the five requests into `openIssues`. |
| S10-N4 | Low | `w10-requirements` ¶2; caution 4 | **Terminology tension.** The lesson says "a plain body attribute is not a parameter". Yet worked (a) calls LatencyLimit's plain `attribute latency` and `attribute latencyLimit` "two parameters", and S10 sl.86/89 calls such features parameters ("binds parameters to specific values"). The checker claim itself is correct. | R74 sl.86–89 (re-read); worked (a) ¶1. | Say "a plain attribute (S10 calls it a parameter, but it is not a *directed* parameter) declared before the subject passes". |
| S10-N5 | Low | `course.ts` Week 10 (R83 is an extension); q10-2, -3, -4, -8 and -11 cite R83 | **Quiz depends on an extension reading (W9-F06 class; F16 remainder).** Five of 12 items cite S06 p.161–168, which the register lists as an extension. Week 9's equivalent was fixed by registering the S06 pages. | `course.ts` l.185. | Lead: register R83 p.161–162 and 165–168 as Week 10 readings (they are already budgeted at 0.2 h plus the memo page). |
| S10-N6 | Low | q10-3, q10-7, q10-11 | **Rule 6 borderline.** Each applies a lesson sentence to a new case: grouped requirements take the group's subject; a binding is not an initial value; `not satisfy` fits a rejected alternative. They are acceptable as Apply/Evaluate items, but they discriminate weakly. | Lesson ¶4 of w10-requirements; w10-structure ¶3; w10-worked-gap ¶3. | Optional: in q10-11, make the rejected option's evidence uncertified, so that the gap record and `not satisfy` compete. |
| S10-N7 | Low | Workload row "Online lesson and the three activities 1 h" | **Lesson length is at the guide's ceiling.** The lesson is 5,095 words by `lessonWordCount`. The guide's ≈ 1 h covers "≈ 4,000–5,000 words plus activities", and the translator also needs three requirements done before class. Realistically this is ≈ 1.2–1.4 h, so the total is ≈ 9.7–9.9 h against 9.5 h. That is within noise, but not stated. | AUTHORING_GUIDE §7 rule 3; my word count. | Trim about 100–300 words (e.g. the application block), or add one sentence to the workload caution. |

**Cautions for the faculty and lead (not blockers):**

- The instructor key is excluded from the bundle (tested) but is readable in the repository.
- The course-convention items (enterprise subject; the gap record using ModelingMetadata, whose library page is not in the register; the reference-condition reading of "in still air") are labelled as such.
- A14 option B (graduate tasks every other week) is not yet reflected in Weeks 9 and 10; this is a course-level scheduling decision.
- CP4 weights (RB-8 75 · RB-17 15 · RB-12 10) need confirmation against the A14 RB-8.5 renormalisation, which faculty must confirm.

## What I verified

- **Build and tests.** `npx tsc -b` is clean (exit 0). `npx vitest run src/activities/week09 src/activities/week10 src/content src/lib` gives 8 files, **156/156 pass**. The week10 suite is 27/27.
- **Checker runs** (release 2026-08, one JVM, `tasklist` empty before the run, report written to the scratchpad):
  - All nine predict items re-run from scratch copies match their keys: pc1, pc2 and pc7 PASS clean; pc4 PASS + "Bound features should have conforming types"; pc3 and pc5 FAIL rule; pc6 FAIL rule (three errors, order different again); pc8 FAIL syntax; pc9 FAIL resolution.
  - Subject-first probes: G, G2 and G3 as above.
  - The `not satisfy` pair (q10-11 key) PASSES with no messages.
  - q10-12a cross multiplicities `end [0..1] port …` PASSES with no messages.
- **Integrity.** All 16 Week 10 files (15 listings plus the instructor key) match `validation-report.json` by SHA-256, status and diagnostic count.
- **Checker statements.** The lesson's statements about what the checker does and does not detect agree with the recorded runs and my probes. Enforced: port typing, interface ends as ports, satisfy target, group requires only constraints, subject-first for directed parameters and actors, and no override of a bound value. Not enforced: port compatibility, end conformance, allocation direction, heterogeneous groups, and satisfy truth (the false satisfy passes silently).
- **Predict activity.** The key cannot leak through the score line (probe and tests). Missing, stale, pending and unverifiable records show nothing and are not scored.
- **Reference and quiz.** The reference translations pass every check, including direction and literal (rule 4, tested). The quiz references (IF-013 ports, WeatherDataPort, LOG-003/FN-008, `requestToQuoteTime`, `faultReportToFlagTime`) exist in `aerolink_v02_req_structure.sysml`.
- **Citations re-read.** S06 p.162, 166; S10 sl.86–89, sl.23–25, sl.106–107.
- **Workload.** The rows sum to 9.5 h, the syllabus figure; the lesson is 5,095 words (see S10-N7).
