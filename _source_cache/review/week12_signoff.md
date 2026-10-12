# Week 12 sign-off review: verification, measures and the digital thread (L12, model v0.4, RID dispositions)

Reviewer: Independent AI reviewer (Claude), sign-off pass. Date: 2026-10-12.

No course or app file was changed. The one mutation was applied, tested and reverted, and `git diff --stat` on that file is empty afterwards. Probe files, probe reports and scratch tests are in the reviewer's scratchpad only.

**Under review:** fix commit `d95f432`, checked against `week12_review.md` (REVISE moderate, W12-F01 to F18). Files:
- `src/content/weeks/week12.ts`
- `src/activities/week12/*` (`planner.ts`, `dispositions.ts`, `audit.ts`, `thread.ts`, the four components, the tests)
- `sysml/week12/*`
- `docs/authoring/week12_notes.md`, revision section

## Verdict: **SIGN-OFF** (one Medium to correct in the next authoring pass; minors)

All 18 findings are resolved. Three of them leave a small Low residual or a lead-owned remainder.

The SysML change in F07 to the S10 sl.96–97 pattern reproduces with the checker. The tools now fail on realistic bad input and accept realistic good input, with the residuals listed below. The audit counts active elements only, and its digest behaves correctly.

One new **Medium** finding: the Week 12 model answer rates a defect minor that Week 11 rates major (W12-N1). It does not block sign-off:
- The fix is a one-word severity change in two places.
- I confirmed that the corrected entry already passes the disposition screens.
- It should be made before release, because students calibrate RB-17.2 severities on the model answers.

## Disposition of the review findings

| ID | Sev. | Disposition | Evidence |
|---|---|---|---|
| F01 | High | **RESOLVED** | My option-length script:<br>• Keys: a 3 · b 3 · c 3 · d 4.<br>• The correct option is the longest in **0 of 13** items; it was 13 of 13.<br>• The highest correct-to-distractor-mean ratio is 1.46 (q12-7), but that option is never the longest.<br>• One 6-word run is shared with the lesson: q12-13 "to the CP5 submission with an", which echoes worked (e). The decision the item tests differs, so this is acceptable. |
| F02 | High | **RESOLVED** | "validated against the MOEs by design" survives only as a *distractor* (q12-2 d), with a correcting explanation. The new rule, "a REQ-STK counts as verified directly or through a verified child", is applied by the audit. My run: REQ-STK verified directly 1 of 10; the gap list is `childless:NEED-011` and `unverified-stk:REQ-STK-009`. |
| F03 | Med | **RESOLVED** | "course convention, following MITRE p.433; DoD p.150 validates against stakeholder performance requirements" (2 occurrences). "DoD and MITRE" no longer appears. q12-2 now tests exactly this difference. |
| F04 | Med | **RESOLVED** (Low residuals W12-N2, W12-N3) | **My probes:**<br>• Accept with a vague change ("Changed the model as the reviewer asked"): flagged.<br>• Accept with "to be fixed next week": flagged as a promise.<br>• The five model dispositions pass.<br>• A natural accept (rename, line 12, commit hash): passes.<br>• A major deferral "by the CP5 submission (Week 14)": passes.<br>Residual escapes are recorded below. |
| F05 | Med | **RESOLVED** | **My good plans pass with no error:**<br>• the reference VER-001;<br>• a re-worded criterion ("Each of the 30 timed charges … within 20 min");<br>• pass/fail written in words ("all 30 valid charges reach the threshold within 20 min" / "at least one valid charge needs more than 20 min").<br>The test set covers G1–G7, including the MTTR demonstration, which is now a warning citing R23a p.639's statistical exception. |
| F06 | Med | **RESOLVED** (Low residual W12-N5) | **My bad plans:**<br>• Fail threshold "more than 22 min": error, not the requirement's limit.<br>• Pass "no less than 20 min": error, compares the wrong way.<br>• Inspection of a datasheet charge time: error, plus a method-mismatch warning.<br>• Subject PHY-001: warning naming the satisfiers (PHY-003, IF-005).<br>• Inconclusive repeating the fail bound: error.<br>• Missing level and environment: errors. |
| F07 | Med | **RESOLVED** (Low wording residual W12-N4) | The listings now use the S10 pattern: an `in` parameter asserted equal to the subject's MOP, and the requirement called in PassIf. **My checker runs:**<br>• A copy of `aerolink_ver001_charge_time.sysml`: PASS, 0 messages.<br>• The same with a misspelt parameter name: FAIL, `Couldn't resolve reference to Feature 'chargeTimeActal'` and `Must correspond to one input parameter of the invoked type`, matching pr01.<br>`validation-report.json` records both conformant listings PASS with 0 messages, and the invalid listing FAIL with 2 messages. |
| F08 | Med | **RESOLVED** | RB-11.6 is named as scoring the dispositions at CP5 in the worked (e) text, `rubricScope`, the deliverable and the CP5 weight line. "no scoring criterion" no longer appears. |
| F09 | Med | **RESOLVED in the module** (lead remainder) | R84 p.173–176 is labelled "a Week 12 reading under DECISION_LOG A14" and R78 sl.149 "one Week 13 slide read ahead", and both are budgeted (0.3 h). `course.ts` Week 12 `readings` still lists only R75, R49, R58, R23a and R30, so the register addition is pending with the lead. |
| F10 | Med | **RESOLVED** | **My audit probes:**<br>• Reference: 204 active elements, 381 links, digest `7103d600`.<br>• PHY-008 retired: 203 elements and 377 links. The 4 links touching PHY-008 drop out, and the digest changes (`c9c513fb`).<br>• Elements and links reversed: same digest.<br>• VER-001's verifies link retargeted: the digest changes, and `unverified-sys:REQ-SYS-001` and `unverified-stk:REQ-STK-005` appear.<br>The export header carries the active counts, the digest and the timestamp. |
| F11 | Med | **RESOLVED** | q12-2 is re-cased: the operational measurement is verification under the course convention and validation under DoD's. q12-5 is re-cased: error, not inconclusive, after TBD-02 closed. q12-8 is re-cased: a reversed PassIf, fixed by the S10 pattern. q12-12 is re-cased: a RID whose rejection would be wrong. Bloom: Understand 1 · Apply 4 · Analyse 3 · Evaluate 5 (I reproduced this). I re-checked every key and explanation, and all are correct. |
| F12 | Med | **RESOLVED** (Low residual W12-N7) | `lessonWordCount` is 4,903. The rows sum to 10.0 h and include the RID review (1.5 h) and behaviour finalisation (0.3 h). The graduate task is optional under option B. |
| F13 | Low | **RESOLVED** | RID-T4-04 now reads "by the CP5 submission (Week 14), owner RP". "L13 behaviour pass" no longer appears. |
| F14 | Low | **RESOLVED** | The caution reads "7–9 of the course's 10 relationship types, depending on the thread". |
| F15 | Low | **RESOLVED** | Compute is disabled until both predictions are 0–100 %. A gap disposition needs an owner or a tracking token. Tests exist for `predictionOk` and `dispositionProblem`. |
| F16 | Low | **RESOLVED** | The lab step reads "plan three cases, model one in class". |
| F17 | Low | **RESOLVED** | The q12-10 explanation and advanced ¶1 mark the inference as the instructor's reasoning from R30 p.1394. |
| F18 | Low | **RESOLVED (both weeks)** | Week 12 says "by the CP5 submission" in q12-13, the screens and the log. Week 11's `SEVERITIES` (`rids.ts` l.18) and lesson (l.180) now say "fixed by the CP5 submission" (`d95f432`). |

## New findings (none blocking)

| ID | Severity | Location | Finding | Evidence | Fix |
|---|---|---|---|---|---|
| **W12-N1** | **Medium** | `dispositions.ts` `MODEL_DISPOSITIONS` RID-T4-04 (`severity: 'minor'`); worked example (e) ¶2 ("RID-T4-04 (minor, no A3 branch in SCN-005)") | **Week 12's model answer contradicts Week 11's severity scale on the same defect.** RID-T4-04 is "SCN-005 alternate flow A3 (hold longer than 2 h) has no branch in the action flow", with the fix "Add decide holdDuration … before liftHold". That is Week 11's RID-IN-07 on Team K/Kestrel's draft. Week 11 raised IN-07 to **major** in response to W11-F06: a missing ConOps alternate is inconsistent with its source, `alt-covered` reports it as an error, and q11-10 teaches that a missing ConOps step is major. Week 12 calls it minor because "Behaviour is formative at CP4". On the course scale, severity describes the defect, not how it is graded. Students calibrate RB-17.2 ("severity assigned sensibly") on these model answers. | `week11/rids.ts` RID-IN-07 (major) and the test "W11-F06 … a missing ConOps alternate … major"; `week12/dispositions.ts` l.132; `week12.ts` worked (e). | Set RID-T4-04 to `major` in `MODEL_DISPOSITIONS` and in worked (e). Keep the deferral "by the CP5 submission (Week 14), owner RP": my probe DG3 shows that a major deferral worded this way passes every screen, so no other change is needed. Optionally change the reason to "Behaviour is finalised this week (Week 12) …". |
| W12-N2 | Low | `dispositions.ts` defer branch (TARGET, CONDITIONAL, the major check) | **Two realistic hedged deferrals of a major RID pass every screen:** "… by Week 14 or later, owner RP." and "… by CP5 or in the evolution increment, owner RP." The major check excludes after/if/otherwise/unless/Week 15+/next term, but not "or later" or "or in …". | Probes DB3 and DB4 against `checkDisposition`. | Add `\bor later\b`, `\bor (?:in|at|during)\b` and `\bevolution increment\b` to the major-deferral exclusions (and to CONDITIONAL). Add DB3 and DB4 as failing tests. |
| W12-N3 | Low | `dispositions.ts` `CONFIRMED` | **"the reviewer was informed and agreed to disagree" counts as the confirmation needed to reject a major RID.** The regex matches "reviewer … agreed" within 60 characters. Only the wording "agreed to disagree" is affected; "confirmed with the instructor" works as intended. | Probe DB5. | Exclude `agreed to disagree` (or `\bagreed to\b`), or require "confirmed/agreed (the rejection|with)". |
| W12-N4 | Low | `w12-worked-vercase` ¶2: "The reference model writes the comparison again inside PassIf, which is what lets a reversed comparison pass silently (table)." | **The sentence overstates the cause.** A reversed comparison passes silently in **both** forms. My runs: reversed inside PassIf in the short form, PASS with 0 messages; reversed inside the requirement in the S10 form, PASS with 0 messages (= pr03). The S10 form writes the comparison once, so there is one place to review and no second copy to drift, but the checker catches a reversal in neither. ¶3 lists "a reversed comparison" among the silent passes, which is correct. Only the causal "which is what lets" misleads. | Checker probes `w12_reversed_in_passif` and `w12_reversed_in_requirement`, both PASS, 0 messages. | Reword to: "The reference model writes the comparison a second time inside PassIf, a second place where it can be reversed or drift; the checker catches a reversed comparison in neither place (table)." |
| W12-N5 | Low | `planner.ts` criterion and limit checks | **Two weakened criteria still pass.**<br>(a) "The mean charge time over 30 charges … is <= 20 min" is a statistical criterion for a requirement that holds "from any landing state of charge" (every case), and it passes with no message.<br>(b) "… in <= 1500 s" loosens the 20 min limit in another unit and passes. The authors disclose this (they compare within one unit only). | Probes PB1 and PB2. | (a) Warn when the criterion uses mean, average or median and the requirement or the reference criterion says any, every, each or all. (b) Convert s/min/h before comparing limits. Both are optional heuristics; a reviewer catches them. |
| W12-N6 | Low | `instructorNotes.cautions` workload (i) | **Stale schedule statement.** "graduate tasks in alternate weeks; Weeks 9–11 each carry one". Since `7543dbe`, Week 9's memo is optional; the pattern is W8 required, W9 optional, W10 and W11 required, W12 optional. | `week09.ts` (memo optional); Week 9 open issue on option B. | "Weeks 10 and 11 each carry one (Week 9's is optional)". See also the Week 9 confirmation, S9C-2, on the "alternate weeks" wording. |
| W12-N7 | Low | workload row "Online lesson (≈ 4,900 words), thread explorer and trace-audit practice", 1.0 h | **At the edge of rule 3.** Rule 3 sets ≈ 4,000–5,000 words for ≈ 1 h *plus* activities. At 4,903 words, the lesson alone is ≈ 1 h, and the explorer and the predict-then-compute audit practice add ≈ 0.2–0.3 h. Realistically the week is ≈ 10.2–10.3 h for every student. The cautions present 10 h as designed to fit at realistic rates, with risk only in the team-hour case. | `lessonWordCount` 4,903; AUTHORING_GUIDE §7 rule 3. | Either record "lesson and the two practice activities ≈ 1.25 h; week ≈ 10.25 h" in the caution, or trim ≈ 300 words, for example from the application block. |

## Cross-week consistency (Weeks 10–12)

- **The RID flow is consistent:**
  - Week 10 announces the peer review with RIDs in Week 12, days 1–3.
  - Week 11 sets the form, the severity scale, team k → k+1 and the missing-CP4 k+2 rule. It says the RIDs are written in Week 12 and budgeted there, and that "every CP4 RID has a disposition" is a CP5 entry criterion.
  - Week 12 has the 1.5 h RID line ("RID writer's Week 12 list (not the practice list)"), the k+2 rule repeated, RB-17 in CP4 for the RIDs written, and RB-11.6 at CP5 for the dispositions received.
- **The deadline reads "by the CP5 submission" in every place:** Week 11's scale (lesson l.180, `rids.ts` l.18), Week 12's screens, q12-13 and the model log.
- **The CP5 weights are consistent:** RB-8 25 · RB-9 30 · RB-10 15 · RB-11 30.
- **The one inconsistency is W12-N1**, the severity of the missing A3 branch.

## Workload

The rows sum to 10.0 h, which equals the syllabus figure:

| Row | h |
|---|---|
| In-class | 2.5 |
| Narrowed core readings | 0.9 |
| S06 + R78 | 0.3 |
| Lesson and practice | 1.0 |
| Quiz | 0.3 |
| RID review | 1.5 |
| L12 out of class | 3.0 |
| Behaviour finalisation | 0.3 |
| Notebook | 0.2 |

The team-hour check in the cautions (12 team-hours for L12 out of class) is itemised and plausible. Moving the planner and the disposition log inside L12 is stated. The 1.0 h lesson row is tight (W12-N7).

**Option B.** The graduate argument is optional in every student-facing place: objective l.23, assignment, deliverable and `rubricScope` l.520, which says it is read when submitted. `course.ts` Week 12 `graduateTask` does not yet say optional; that shared change is requested by the author and is lead-owned. The cautions' schedule statement is stale (W12-N6).

## Cautions for the faculty and lead (not blockers)

- Register (A14): add `{ reading: 'R84', pages: '173–176' }` and `{ reading: 'R78', pages: '149' }` to the Week 12 readings in `course.ts`. Until then, three quiz items depend on R84, which is labelled "registration pending".
- Shared changes requested by the author: `course.ts` graduate task optional; lab plan L12 "Out 3.5" → 3.0 + 0.3; weekly-plan workload note; the `engineering.ts` step-9 comment.
- Reference model (lead): REQ-STK-009 has no VER and no child; the reference VERs still use the short PassIf form; VER-007's "no flight > 17.0 min" against a 16 min requirement deserves a look.
- The q12-5 line between error and inconclusive rests on the course's reading of S06 p.173. The item and the planner state that reading.

## What I verified

- **Build and tests.**
  - `npx tsc -b`: clean (exit 0) at the start of the pass. A re-run at the end failed only in `src/workbench/WorkbenchShell.tsx`, caused by another session's uncommitted workbench edits; there were no errors in Week 9, 11 or 12 files.
  - `npx vitest run src/activities/week09 src/activities/week11 src/activities/week12 src/content src/lib`: 12 files, **227/227 pass** on the final run. An earlier run's single failure was a Week 13 listing that was not yet recorded, and it cleared with commit `8af1385`.
- **Checker probes.** Release 2026-08, kernel 0.62.0, one JVM. `tasklist | grep -i java` was empty before the run, and the report was written to the scratchpad with `--report`.

  | Probe | Result | Lesson claim |
  |---|---|---|
  | Copy of `aerolink_ver001_charge_time.sysml` (S10 sl.96–97 form: `in` parameter, requirement called in PassIf) | PASS, 0 messages | Agrees ("accepted the file with no errors and no warnings") |
  | S10 form with a misspelt parameter in the call | FAIL: unresolved `chargeTimeActal`; "Must correspond to one input parameter" | Agrees with pr01 |
  | Reversed comparison inside the requirement (S10 form) | PASS, 0 messages | Agrees ("a reversed comparison" passes silently); see W12-N4 |
  | Reversed comparison inside PassIf (short form, as in the reference) | PASS, 0 messages | Agrees; see W12-N4 on the causal wording |

- **Tools, realistic bad and good input (rule 5).** The planner (8 bad, 3 good), the disposition screens (7 bad, 3 good, plus the 5 model entries) and the audit (active-only counts, digest under retirement, reordering and retargeting). All are covered in the tables above.
- **Rule 4.** The five model dispositions pass; the reference VER-001 plan passes with no message. The test suite also passes all 11 reference VERs.
- **Mutation.** I replaced the evidence screen in `dispositions.ts` with "any non-empty text". 2 tests fail: "an acceptance without a findable change or closure evidence is flagged" and "… closed by a promise, a pending check or a pointer (D1, D2, D7)". After restoring, `git diff --stat dispositions.ts` is empty.
- **Quiz.** I checked all 13 items, their keys and their explanations, against the cited pages where the claim changed: R58 p.433, R49 p.150, S06 p.173–174 and S10 sl.96–97.
