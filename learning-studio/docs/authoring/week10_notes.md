# Week 10 authoring notes — SysML v2 requirements and structure (L10, model v0.2; prepares CP4)

Author: AI author (Claude), 2026-10-11. Revised the same day after the independent review
(`_source_cache/review/week10_review.md`, verdict REVISE, findings W10-F01…F20). Status: `self-checked`, pending
re-review and faculty review (DECISION_LOG A4).

## Files

- `src/content/weeks/week10.ts`: the module.
  - 15 lesson blocks (≈ 5,100 words by `lessonWordCount`, including the probe table).
  - 3 activities, lab L10 and assignment L10 (with the graduate memo as template section 6).
  - 12 quiz items (Readiness quiz Q9): Apply 5, Analyse 5, Evaluate 2. Keys: a, b, c and d three times each.
  - Instructor notes, workload of 9.5 h, and references.
- `src/activities/week10.activity.tsx` registers `w10-req-translator`, `w10-relation-classifier` and `w10-predict-checker`.
- `src/activities/week10/`:
  - Logic: `translator.ts`, `referenceTranslations.ts`, `relations.ts`, `predict.ts`.
  - Components: `ReqTranslator.tsx`, `RelationClassifier.tsx`, `PredictChecker10.tsx`.
  - Tests: `logic.test.ts` (20), `activities.test.tsx` (7).
- `sysml/week10/` (15 files):
  - Lesson listings, each PASS with no diagnostics: `aerolink_requirement_def_usage.sysml` (worked a),
    `aerolink_ports_interfaces.sysml` (worked b), `aerolink_satisfy_allocate.sysml` (worked c),
    `aerolink_satisfy_gap.sysml` (worked d) and `aerolink_assume_still_air.sysml` (advanced).
  - `invalid_port_typed_by_item.sysml`: FAIL as intended, `ERROR 12:3 A port must be typed by port definitions.`
  - Nine predict items: `predict_pc1/2/4/7_*` (PASS) and `invalid_pc3/5/6/8/9_*` (FAIL).
- `sysml/instructor/week10/aerolink_grad_key_assume_require.sysml`: the graduate answer key. PASS, no messages.
  Validated with the other listings, excluded from the bundle by the glob in `src/lib/sysml.ts` (tested), and
  referenced from no student block.

The activities are read-only with respect to the workspace and record nothing, so §7 rule 1 does not apply. The
tests assert that nothing is written. Week 10 imports nothing from Week 9 (own copies of the outcome classes,
`outcomeOf`, the fail-closed `recordedResult`, the scoring and `shortNameProblem`).

## Pages read (`python -I scripts/source_pages.py …`), re-read for the revision

- R74 S10 sl.86–91 (full). sl.89 has short name, subject, binding and assume, but no doc (W10-F20). sl.90: grouped
  requirements take the group's subject by default, or bind it explicitly (W10-F12). sl.91 uses
  `ref vehicle_design :> vehicle_c1`, the pattern of the graduate key's `arrivingAircraft`.
- R71 S10 sl.18–29 (full); sl.24–25 for q10-7.
- R76 S10 sl.105–107; sl.106 (nested allocations, direction) for the new q10-10.
- R83 S06 p.161–169 (full; register page indices = printed pp.129–137). p.162: "The satisfaction of the requirement
  by a specific subject entity is then relative to the specific environment entity filling the actor role" (used in
  the graduate key (c)). p.166: subject before any other parameter.
- R72 S10 sl.41 (perform). R80 S06 p.49–50 (names) and p.77 (units come with the value).

Planning documents read: WEEKLY_INSTRUCTIONAL_PLAN Week 10; LABORATORY_AND_CAPSTONE_PLAN C.2, C.5, L10, L11;
ASSESSMENT_RUBRICS RB-8, RB-16 (W7 note); syllabus CP4 rows; WORKLOAD_ANALYSIS.md; `sysml/reference/README.md` and
`aerolink_v02_req_structure.sysml`; `week08.ts`, `week09.ts` and their notes. Library file read for the gap convention
(not a register source, not cited as one): `sysml.library/Domain Libraries/Metadata/ModelingMetadata.sysml`.

## SysML validation (release 2026-08; one JVM at a time, `tasklist` checked before every run)

- **Partial run** after the listing changes, `python -I scripts/check_sysml.py sysml/week10 sysml/instructor/week10
  <scratch>/w10fix --report <scratch>/w10fix_report.json`: 26 files (16 course files + 10 probes). Every course file
  matched its expectation; the probes are listed below.
- **Full run** after the final listing change, `npm run content:sysml`: **49 files, 32 PASS, 17 FAIL, 0 ERROR, every
  file matching its expectation.** This regenerated the canonical `sysml/validation-report.json` (it includes other
  weeks' files; all matched).
- **Recorded diagnostics of the FAIL items:**

  | Item | Result |
  |---|---|
  | pc3 | `ERROR 13 A port must be typed by port definitions.` (twice), each with a WARNING "Duplicate of inherited member name 'self'" |
  | pc5 | `ERROR 20:31 Cannot override a binding feature value` |
  | pc6 | three ERRORs at 19: "Must reference a requirement.", "Must reference a constraint.", "A requirement must be typed by one requirement definition." **Their order differs between runs** (the reviewer's run, the previous canonical report and this partial run each listed a different one first), so the lesson quotes all three (W10-F13). All are rule errors, so the outcome class is stable. |
  | pc8 | `ERROR 6:61 mismatched input 'by' expecting 'to'` and follow-on errors |
  | pc9 | `ERROR 17:10 Couldn't resolve reference to Feature 'ChargeTimeRequirement'.`, "Must reference a requirement.", "Must reference a constraint." |

- **PASS items:** pc4 has `WARNING 19:27 Bound features should have conforming types`; pc1, pc2 and pc7 have none.

### Probes (scratch files in the session scratchpad; not course listings; release 2026-08, 2026-10-11)

Original probes (first authoring pass):

| Probe | Construct | Outcome |
|---|---|---|
| A | Interface def with both ends ChargingPort (two outputs) | PASS, silent (→ pc1) |
| B | Interface end `~ChargingPort` connected to an `AircraftPadPort` | PASS, silent (→ pc2) |
| C / D | Interface connecting two parts; port typed by a part def | FAIL "A port must be typed by port definitions." |
| E | Allocation usage against its allocation def's end types | PASS, silent (→ pc7) |
| F | `satisfy 'REQ-SYS-001';` at package level, no `by` | PASS, silent (not taught) |
| H | Group `require 'FN-006'` (an action) | FAIL "A constraint must be typed by one constraint definition." |
| K / s4 | `allocate` REQ → PHY and PHY → REQ; FN allocation written PHY → FN | PASS, silent |
| L | `satisfy … by` a port | PASS + WARNING "Bound features should have conforming types" (→ pc4) |
| M | Flow from an input to an output | PASS, silent |
| N | `not satisfy` | PASS, silent |
| P | Requirement usage typed by two requirement defs | FAIL "A requirement must be typed by one requirement definition." and "Only one subject is allowed." |
| Q2 / Q3b / Q4 / Q5 | actor + named assume; satisfy binding the actor; def with assume; `@StatusInfo` + `@Issue` | PASS, silent |
| q6 / q6b / q6c / q7 | satisfy typed by a usage; rebinding the bound limit; 22 min against 20 min; satisfy a def | FAIL / FAIL (→ pc5) / PASS silent / FAIL (→ pc9) |
| q8–q12, s1–s3, nested allocation | as recorded in the first pass | as before |

Revision probes (this pass; files `probe_*.sysml` in `<scratch>/w10fix/`):

| Probe | Construct | Outcome | Used for |
|---|---|---|---|
| G | plain `attribute lim` before `subject` | PASS, silent | F04 |
| G2 | `in attribute lim` (a directed parameter) before `subject` | **FAIL `ERROR 6:3 Subject must be first parameter.`** | F04: confirms the reviewer |
| G3 | `actor` before `subject` | **FAIL `ERROR 7:3 Subject must be first parameter.`** | F04: actors are parameters too |
| X3 | group with a Scheduling subject requiring a ChargingSystems requirement, satisfied by a Scheduling part | PASS, silent | F12 |
| X3b | subject-less group of ChargingSystems and Scheduling requirements, satisfied by PHY-003 | PASS, silent | F12 |
| X7 | `attribute :>> faultReportToFlagTime := 90 [s];` | PASS, silent | F08 (q10-7) |
| R10 | REQ-SYS-010 with `attribute connectionLimit : PowerValue = chargingSystem.connectionLimit;` and satisfy by PHY-003 | PASS, silent | F07 (lead request) |
| Q10 | nested allocation `allocate LOG-003.'FN-008' to PHY-005.diagnostics.'FN-008'` inside LOG-003 → PHY-005 | PASS, silent | new q10-10 key |
| Q10a | the same written PHY → LOG, outer and nested | PASS, silent | new q10-10 option a |
| Q11 | `satisfy` by PHY-003 and `not satisfy` by a rejected option of the same definition | PASS, silent | new q10-11 key |

The graduate key (new version: actor bound to a `ref part arrivingAircraft : EVTOLAircraft[1] :> 'PHY-001'`, required
constraint depending on the arrival state) and the still-air listing (tolerance `<= 0.5 [m/s]`) PASS with no messages
in both runs. The reviewer's X9 (a single actor bound to PHY-001[12]) was not re-run: the key no longer does that.

## Mutation evidence (each mutation restored afterwards; final suite: `src/activities/week10` 27/27)

| Mutation | Tests that fail |
|---|---|
| Predict score reverted to the pre-review behaviour (no reveal/record filter, scored against the hard-coded key) | 3: the logic test "only revealed items with a SHA-matched record are scored…" and the two component tests "an unrevealed prediction is never scored…" and "a revealed item whose hash cannot be verified is not scored" (W10-F01) |
| Direction check forced to pass | 1: "a reversed inequality fails the direction check…" (W10-F03) |
| Literal-limit check removed | 1: "a literal limit in the constraint is checked…" (W10-F02) |
| Unit check reverted to same-unit-only (wrong unit = advisory) | 1: "a value of the right number in a wrong unit, or of another kind, fails" (W10-F03) |
| (first pass) value / subject plausibility / constraint checks forced to true | 1 / 2 / 1 |

## Rule 4 (the reference passes its own checks)

`referenceTranslations.ts` encodes the v0.2 model's realisation of all 20 requirements, and a test pins each row's
subject, constraint, parameter and statement to `aerolink_v02_req_structure.sysml`. All 20 pass with no failed check,
including the new direction check (made on the 13 whose statement has a limit word before the bound value: STK-001,
-002, -004, -005, -008, SYS-001, -002, -003, -005 to -009; all pass) and the literal-limit check (no reference row uses
a literal). The advisories, where the tool cannot judge, are unchanged: STK-003, STK-010 and SYS-010 (TBD, unbound);
STK-007 (the 6 is not in "every vertiport"); STK-009 and SYS-004 (Boolean feature).

## Review response (W10-F01…F20)

| Finding | Response |
|---|---|
| F01 (High) | `scorePredictions10(predictions, revealed, recorded)` scores only revealed items whose record is `recorded` (SHA-matched), against `rec.outcome`. The component hashes every revealed listing, and "Your prediction matches" compares with the recorded outcome. Score line: "N predicted; M revealed with a verified record; of those, X exactly right and Y right on PASS/FAIL". Tests and mutation above. |
| F02, F03 | Translator: new `valueAgainstStatement` (unit kinds with conversion; same kind, wrong magnitude fails; another kind fails when the statement gives values of known kinds), new `limit-value` check (a literal in the constraint is checked against the statement and against the bound parameter), new `direction` check (`limitDirection` reads "within / no more than / at or below / …" or "at least / at or above / …" before the limit value; subject on either side; `==`/`!=` fail; strict `<` for "within" is an advisory). Tests on realistic bad inputs; reference unchanged. |
| F04 | Confirmed by probes G2 and G3. Caution rewritten; one sentence added to the lesson; commentary row added. Open issue 4 closed. |
| F05 | Option (i): the required constraint now depends on the arrival state (`(dispatchThreshold − arrivalStateOfCharge) × fullChargeTime <= maxChargeTime`); actor bound to a single `arrivingAircraft`. Answer key (c) explains per-binding satisfaction (S06 p.162), why the implication now holds for every arrival, and the free-feature trap; it also says how to credit a memo that keeps the reference form. |
| F06 | Tolerance `<= 0.5 [m/s]`; new paragraph "Gate or reference condition?" recommending the reference-condition reading for "in still air" (labelled a course choice); "weaker" sentence corrected; misconception 6 now targets "an assumption is a requirement on the environment". |
| F07 | Option (ii) in the lesson (intent the model does not yet express), with the binding that would express it (probe R10). Lead request below. |
| F08 | q10-7 reconciled with the course convention: binding the current estimate is a snapshot re-baselined in the model; the error is "behaviour will update it". `:=` / `default` mentioned as the language's initial/default forms, with the register gap stated. |
| F09 | Keys rebalanced (a 3, b 3, c 3, d 3); no correct option is the unique longest (checked by script); distractors given their own reasons. |
| F10 | Memo reading cut to p.161–162 and 165 (only p.162 new); (e) merged into (d); realistic breakdown in cautions (1 h; ≈ 1.5 h if a student writes new constructs instead of adapting the listing). |
| F11 | In-class step: at least the REQ-SYS set (or six requirements); the rest out of class, consistent with the lab introduction; session plan updated. |
| F12 | "so" removed; groups with heterogeneous member subjects described as collections for organisation, never satisfied as a whole (lesson, worked (a), listing doc); probes X3/X3b added to the silent-pass table. |
| F13 | All three pc6 errors quoted, with the note that their order varies (see the table above). |
| F14 | q10-10 replaced by an allocation-direction and nested-allocation item (S10 sl.106), validated by probes Q10/Q10a. |
| F15 | q10-11 replaced by a case where `not satisfy` is right (a rejected alternative decided on certified evidence), discriminating it from a gap record, a false satisfy and an AROU-only record (probe Q11). Borderline under rule 6 because the lesson names "a rejected alternative" as the fitting case; the item applies it to a new two-option model rather than restating it. |
| F16 | Workload row renamed "Lesson-cited S06 extracts … (extension reading in the register)". Promoting R83 to a core reading is a register change for the lead. |
| F17 | Lead decision (reference file not editable here): see request 3. |
| F18 | c4 explanation reworded: not a satisfy; in Week 12 it becomes the result of a verification case that verifies REQ-SYS-005. |
| F19 | These notes. |
| F20 | "following the pattern of S10 sl.89, with the doc comment added from S06 p.165 (the slide has none)". |

## Design decisions

- **Workload** (rule 3, WORKLOAD_ANALYSIS.md), budget 9.5 h: in class 2.5; slides 0.7; S06 p.161, 165, 168 0.2;
  lesson + activities 1.0; quiz 0.3; L10 out of class 3.5 (includes the requirements not done in class); graduate memo
  1.0; notebook 0.3. Realistic ≈ 9.5 h graduate, ≈ 8.5 h others. The lesson is ≈ 5,100 words after trimming (it was
  ≈ 5,470 after the review additions).
- **No repetition of Week 8**, and quiz items use new cases (REQ-SYS-021/022, weather data, IF-013, cross
  multiplicity, PHY-005's flag time, the diagnostics workstation, charger option B; all FICTIONAL, non-colliding).
- **Predict ordering.** The predict activity sits before the commentary table, so that the table does not answer it.
- **Course conventions, labelled as such:** REQ-STK subject = enterprise; logical/physical by package; the
  satisfy-gap record; `not satisfy` for decided cases; bound TPM estimates as snapshots; reference-condition reading of
  "in still air".

## Open issues and requests to the lead

1. **Register requests.** (a) The standard library page for `ModelingMetadata` (StatusInfo, StatusKind, Issue), S06
   §9: the gap convention uses `@Issue`. (b) S06 §7.13.3 / the feature-value section that defines `:=` (initial) and
   `default` values: q10-7 mentions them uncited, supported only by probe X7.
2. **Reference model, REQ-SYS-010 (W10-F07).** Bind the requirement's limit to the satisfier's configured value:
   `attribute connectionLimit : PowerValue = chargingSystem.connectionLimit;` (ChargingSystems already has an unbound
   `connectionLimit`, reference line ≈ 709; probe R10 PASS). Then re-run the reference checks and the `sysmlDrift` /
   `sysmlMapping` tests; `referenceTranslations.ts` and its drift test must be updated in the same change (the
   translator will show `connectionLimit` with no value as before).
3. **Reference model, REQ-SYS-001 rationale (W10-F17).** The student-visible rationale ends "(open point for the
   graduate memo)", which hints at memo part (d). Decide: drop the parenthesis, or accept the hint.
4. **Reference model, still air.** Do not add the still-air gate to REQ-SYS-007: the lesson now recommends the
   reference-condition reading. Optionally rename `designTripBlockTime` to `stillAirBlockTime` or say "still air" in
   its doc.
5. **Register, R83 status (W10-F16).** R83 is `extension`, but the lesson depends on p.161, 165–168. Consider
   promoting those pages to a core reading.
6. **Closed:** the subject-first question (old issue 4; probes G2/G3) and the key location (old issue 3; already in
   `sysml/instructor/week10/`).
7. **Shared files:** none changed and none needed.

## Sign-off fix pass (2026-10-11; `_source_cache/review/week10_signoff.md`, S10-N1..N7)

| Finding | Fix | Evidence |
|---|---|---|
| S10-N1 negated limit phrases | `limitDirection`: a "not"/"never" up to two words before a limit word that does not itself carry the negation inverts it | Tests: "shall not take more than 20 min" (<= passes, >= fails) and "shall not be less than 90 %" (>= passes, <= fails); "never … above", "not exceed", "no less than" not double-inverted. All 20 reference requirements still pass (rule 4). Mutation (negation off): the test fails. |
| S10-N2(b) value vs declared type | `valueAgainstType`: a …Value type needs a unit; Real/Integer/Natural take none; a plain 90 for "90 %" fails (course convention: fractions). The direction check is skipped when the bound value already failed (no cascaded message) | Tests: "90" and "0.20 bound to DurationValue" fail; 0.90, Natural 6, 1200 [s] pass. Mutation (type check off): the test fails. |
| S10-N2(a) nested chains | `featureOf` accepts `subject(.name)+` | Test: `chargingSystem.charger.x` and `chargingSystem.'PHY-003'.x` pass; `aircraft.chargingSystem.x` fails. Mutation (single segment): the test fails. Tool text in ReqTranslator documents what the wording checks read. |
| S10-N3 openIssues | The five lead requests above are a caution ("Open lead requests"), not `openIssues`: `weeks.test.ts` requires an independently-reviewed week to have no open issues (the Weeks 1–8 pattern). | See the conflict note in the lead report. |
| S10-N4 terminology | Lesson ¶2, the probe table row and caution: "S10 calls such attributes parameters (sl.86, as worked example (a) does), but they have no direction; the checker applies subject-first to directed parameters and actors" | Re-read R74 sl.86–89, S06 p.166. |
| S10-N6 rule 6 | q10-3: explicit subject binding of a subrequirement to a feature of the group's subject (S06 p.167; S10 sl.90). q10-7: a subsetting usage rebinding a bound value means two values at once (S10 sl.24–25; not probed, said so). q10-11: `not satisfy` misused for an open question; key = gap record | Keys still a3 b3 c3 d3; correct option longest in 0/12. |
| S10-N7 lesson length | Trimmed to 4,971 words (from 5,095); the caution states ≈ 1.2–1.4 h for a slower reader | `lessonWordCount`. |
| Lead a11y item | `<pre>` in PredictChecker10 and ReqTranslator: `tabIndex={0}` and an aria-label | Component test. |

`review.status` is now `independently-reviewed` (reviewer, date, report = week10_signoff.md), as in Week 8. No listing changed, so no checker run was needed.
