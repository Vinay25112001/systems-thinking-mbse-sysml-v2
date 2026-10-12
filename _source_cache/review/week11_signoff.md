# Week 11 sign-off review: SysML v2 behaviour; L11 (formative); CP4; RID review kick-off

Reviewer: Independent AI reviewer (Claude), sign-off pass. Date: 2026-10-12.

No course or app file was changed. The one mutation was applied, tested and reverted, and `git diff --stat` on that file is empty afterwards. Probe files, probe reports and scratch tests are in the reviewer's scratchpad only.

**Under review:** fix commits `8d553e2` (all 23 findings) and `d95f432` (the major-RID wording "by the CP5 submission"), checked against `week11_review.md` (REVISE major, W11-F01 to F23). Files:
- `src/content/weeks/week11.ts`
- `src/activities/week11/*` (`flow.ts`, `rids.ts`, `states.ts`, the three components, the tests)
- `sysml/week11/*` and `sysml/instructor/week11/*`
- `docs/authoring/week11_notes.md`

I verified the notes' finding-to-fix table against the code and the content. I did not take it on trust.

## Verdict: **SIGN-OFF** (minors and cautions only)

All 23 findings are resolved. In four of them a small residual or a lead-owned remainder is recorded as a Low finding or a caution below.

All six original blockers hold up under my own probes:
- the quiz key and the length cue (F01);
- the q11-8 key (F02);
- the flow checker's rejoin, origin and order checks (F03), on probes different from the author's tests;
- the RID budget, now in Week 12 (F04);
- the RID screens (F05);
- the model-RID severities and the worked RID fix (F06, F07), which I confirmed with the checker.

No new critical or major finding.

## Disposition of the review findings

| ID | Sev. | Disposition | Evidence |
|---|---|---|---|
| F01 | High | **RESOLVED** | My option-length script:<br>• Keys: a 4 · b 4 · c 4 · d 3.<br>• The correct option is the unique longest in 3 of 15 items (q11-5, q11-13, q11-14).<br>• The highest correct-to-distractor-mean ratio is 1.20.<br>• No correct option shares a 6-word run with the lesson.<br>`quiz.test.ts` guards all of this. The option shuffle in `Quiz.tsx` stays an optional lead change. |
| F02 | High | **RESOLVED** | The q11-8 key says that A2 must reach done; the explanation says that an accepted alternative is a new request. My checker probe of the q11-8 team flow (decide, then `offerAlternative; then quoteFare;`) PASSes with no messages, as the prompt says. `logic.test.ts` shows that the old key fails `alt-outcome` and the model answer passes. |
| F03 | High | **RESOLVED** (Low residual W11-N1) | **My own SCN-002 probes, different from the author's mutations:**<br>• A2 rejoins at approach (step 6) instead of take-off: `alt-outcome` error "rejoins at step 6".<br>• The A1 hold decided after boarding, before take-off: `alt-origin` error.<br>• Boarding reachable only through the A2 branch: `main-order` "step 4 cannot follow step 3", plus `alt-origin`.<br>• The A3 intent decision moved after boarding: `main-order` and `alt-origin` errors.<br>**Good variants:**<br>• A2 rejoining straight at take-off without a merge: advisory only.<br>• Step 7 realised by one node: no findings.<br>• The reference flow: no findings.<br>The lesson's `w11-checker` paragraph and the tool footer now say what is and is not checked. |
| F04 | High | **RESOLVED** | Week 11 tells students that RIDs are written in Week 12, days 1–3, and budgeted there (assignment, deliverable, artefacts). `week12.ts` has the line "RIDs on the assigned team's CP4 model … 1.5 h" verbatim. |
| F05 | Med | **RESOLVED** (Low residual W11-N2) | **Realistic bad RIDs I wrote, all of passing length.** Each is flagged on the right field:<br>• "some issues … should be reviewed" (discrepancy);<br>• "Update … to handle the closedForDay case correctly" (fix);<br>• S10 sl.250 (no such slide);<br>• "SysML best practice";<br>• RB-8.9 (no such criterion);<br>• "the behaviour package, state machine section" (location);<br>• "not right and does not do what … expects" (discrepancy).<br>**Good RIDs I wrote, worded differently from the test set.** Five of six pass, including an editorial one. One is falsely rejected (W11-N2). |
| F06 | Med | **RESOLVED** | IN-06 and IN-07 are now major, each with the reason in its text. The new IN-08 covers the below-minimum machine. All nine model RIDs pass `ridOk`, and `checkRidSet` reports no problems (my run). See W12 sign-off W12-N1 for a Week 12 model answer that still rates the same A3 defect minor. |
| F07 | Med | **RESOLVED** | My checker run applied RID-IN-05 exactly as worded: the SI import, `accept after 2 [h] then closedForDay;` after line 55, line 57 replaced by `accept OperatingDayStart then open;`, and `attribute def OperatingDayStart;`. Results:<br>• **With** `private import SI::*;`: PASS, 0 messages.<br>• **Without** it: FAIL, `57:20 Couldn't resolve reference to Element 'h'` and `57:11 An after expression must be a DurationValue`, plus two warnings.<br>This is what the lesson says ("without SI the unit h does not resolve"). |
| F08 | Med | **RESOLVED** | q11-15 is now a new derivation case: a port send, with the source's `do` interrupted. q11-3 and q11-14 diagnose listings the lesson does not show. q11-2 is an interval case: the guard bands have to be worked out to find the gap. The q11-6 fix is no longer in the advanced block. Bloom labels are Apply 7 · Analyse 3 · Evaluate 5, which I reproduced. Rule 6: no 6-word run is shared with the lesson. |
| F09 | Med | **RESOLVED** (faculty confirmation pending) | The student-facing `weight`, instructions, template and `rubricScope` say three things: RB-8.5 is formative at CP4 and graded at CP5; RB-8 at CP4 is scored on 8.1–8.4 and 8.6 against the §11 scope; and behaviour goes in a separate file, so its messages do not count toward 8.1. The proportional default is flagged for faculty (A14). |
| F10 | Med | **RESOLVED** | `aerolink_l11_starter_scn001.sysml` is recorded PASS with 0 messages in `validation-report.json`. The skeleton in the tool matches it (consistency test). Each lab step says what is finished in class and what out of class. Session 1 runs 20 min of worked flow and 20 min of states. |
| F11 | Med | **RESOLVED** | Rows: readings 24 slides 0.8 h; lesson and activities 1.4 h (4,665 words by `lessonWordCount`); graduate view 1.25 h (S06 p.137–138, CP4 ports reused, ½ page); total 10.5 h, which equals the syllabus figure. The realistic totals are in the cautions: graduate 10.5 h, others 9.25 h, a team with carried-over errors ≈ 11.5–12 h. See the Workload section below. |
| F12 | Med | **RESOLVED** | Team K's draft is stored separately (`w11-flow-teamk`) behind a "My draft / Team K's draft" switch. Replacing a non-empty draft, or clearing it, needs a second click. Covered by the component test "W11-F12". |
| F13 | Med | **RESOLVED** | The q11-6 key is now the change trigger on a shared attribute (S10 sl.54; S06 p.139, p.150). "One signal in both regions" is a distractor whose explanation says that a PASS is not semantic evidence. The advanced block no longer uses a PASS as evidence. |
| F14 | Med/Low | **RESOLVED** (caution W11-N3) | Team K's tool results and the key open only after 3 *distinct* passing RIDs (`practiceUnlock`). My runs:<br>• 3 distinct good RIDs → open.<br>• The same RID saved 3 times → 1 of 3.<br>• 2 good RIDs and 1 vague → 2 of 3.<br>• No writer initials → 0 of 3.<br>RID-IN-04, IN-06 and IN-09 are tool-invisible. |
| F15 | Low | **RESOLVED** | "non-deterministically (S06 p.134)" appears twice, and "model's semantics" no longer appears. (b) and (c) are marked as instructor reasoning. |
| F16 | Low | **RESOLVED** | q11-10, q11-12 and misconception 5 name RB-17 and the course RID convention. R06c is kept only for "pre-established criteria / identify actions". |
| F17 | Low | **RESOLVED** | The caution is corrected: q11-5 and q11-15 rest on the lesson's statements of S06 p.146 and p.153–154, cited as R82. |
| F18 | Low | **RESOLVED** | The graduate key is recorded PASS with 0 messages: `IntentDecision(true)`, `then done` after both end actions, a return connection sourced at the ANSP port, and a comment on the S06 p.138 direction rule. The template example is now the SCN-004 trigger over IF-013. |
| F19 | Low | **RESOLVED** | q11-11 item (4) is a lower-case title in a doc comment, which is editorial. The q11-12 key includes `else declarePriorityLanding`. |
| F20 | Low | **RESOLVED** | `sr-only` text appears in FlowCoverage (2), RidWriter (5) and StateWalker (3). Checkboxes have `aria-label="<node> realises <item>"`, which the component test uses. |
| F21 | Low | **RESOLVED** | Removed from `week11.ts`: "Seven defects", "first link from behaviour" and "exactly the CP4 scope" (0 occurrences each). It now says "at least nine defects". The probe table is renumbered honestly: 41 IDs, with p38 noted as never recorded. |
| F22 | Low | **RESOLVED** (lead remainder) | Separate stores `w11-rids-practice` and `w11-rids-week12`, with separate exports (component test "W11-F22"). Missing-CP4 rule: team k reviews k+2, stated in Week 11 facilitation and in the Week 12 timeline. The bundle issue (`instructorNotes` and `MODEL_RIDS` in the student bundle) is lead-owned and reported. |
| F23 | Low | **RESOLVED** | The edge-, guard- and node-kind consistency tests compare the worked flow, Team K's flow, the skeleton and both machines with their listings. The gating, overwrite and good-RID tests exist. **My mutation** disabled the `alt-origin` check in `flow.ts`: 2 tests fail, P2 and "an alternate branching AFTER a later main step". After restoring, `git diff --stat flow.ts` is empty. |

## New findings (none blocking)

| ID | Severity | Location | Finding | Evidence | Fix |
|---|---|---|---|---|---|
| W11-N1 | Low | `flow.ts` `main-order` | **A good, coarser mapping is rejected (rule 5, good input).** One node that realises two consecutive main steps fails the order check. Example: SCN-002 with `fileFlightIntent` covering M2 and M3, and the decision covering nothing. The check needs a coverer of step *i+1* that is reachable from a coverer of step *i* other than itself, so it reports "step 3 cannot follow step 2", which is misleading. When another node also covers one of the steps, the check passes: `landAtDestination` covering M6 and M7 passes, because `approach` also covers M6. | My scratch probe against `checkFlow`. | Treat `b.has(x)` (the same node covers both steps) as in order. Or have the tool say "one node realises steps i and i+1: split it if their order matters". Add a test. |
| W11-N2 | Low | `rids.ts` `DEFECT_CUE` / `CLAUSES` | **A naturally written good discrepancy built on a contrast is rejected.** "The hold is lifted the moment ForecastClear arrives, while step 7 requires conditions to stay inside limits for 30 minutes first." It is specific and states the defect, but it contains no listed cue word, and "while" is not a clause or contrast marker. The message tells the student what to add, so this costs a rewrite, not a dead end. | My scratch probe G5 against `checkRid`. | Add contrast cues (`while … requires`, `although`, `even though`, `before … is`), or count "requires/must/should … but/while" as a cue when an element name is present. Add G5 to the good-RID tests. |
| W11-N3 | Low (caution) | `rids.ts` `distinctFindings` | **The distinctness gate compares exact normalised text.** Three copies of one RID, each with a different line number and one word changed in the discrepancy, count as 3 distinct findings and open the key. Writing three such variants takes about as long as writing three real RIDs, so the incentive risk is small. | Scratch probe (near-duplicate set → `ok: true`). | Optional: compare discrepancies by token overlap (for example Jaccard ≥ 0.7 counts as the same finding), or require different criteria. |
| W11-N4 | Low (unverified UX note) | `FlowCoverage.tsx` l.35 (and the walker) | `practiceUnlock(practiceRids())` reads storage during render. A RID saved in the RID writer may not unlock Team K's results in an already-rendered coverage tool until that tool re-renders. I did not test this in a browser (no dev server in this pass). | Code reading. | Subscribe to the store (`usePersistentState(PRACTICE_STORE)`) or re-read on focus. |

## Cross-week consistency (Weeks 10–12)

- **The RID flow is consistent across the three weeks:**
  - Week 10 tells students that a peer team reviews CP4 with RIDs in Week 12, days 1–3.
  - Week 11 sets the RID form, the scale, k → k+1 and the missing-CP4 k+2 rule.
  - Week 12 has the 1.5 h RID line, "RIDs … scored under RB-17 in your CP4 grade", the k+2 rule repeated, and RB-11.6 scoring the dispositions at CP5.
- **Deadlines.**
  - Week 11's major severity reads "fixed by the CP5 submission" in the lesson (l.180) and in `SEVERITIES` (`rids.ts` l.18).
  - Week 12's screens, q12-13 and the model log use the same phrase.
  - F18 of the Week 12 review is closed in both weeks.
- **One inconsistency remains in the other direction.** Week 12's model disposition RID-T4-04 rates "no A3 branch in SCN-005" as **minor**. That is the same team, the same defect and the same fix as Week 11's RID-IN-07, which F06 raised to **major**. It is recorded as W12-N1 in the Week 12 sign-off, because the Week 12 file is the outlier.

## Workload

The rows sum to 10.5 h, which equals the syllabus figure for Week 11. Rates are realistic: 24 slides at 30 sl/h is 0.8 h, and 4,665 words plus the out-of-class part of three activities is 1.4 h. The graduate view at 1.25 h now reuses the CP4 ports and reads 2 spec pages. L11 out of class and CP4 finalisation are 2 + 2 h of team share, which matches the lab plan's "Out 4". The cautions disclose the risk case (≈ 11.5–12 h for a team carrying checker errors from Week 10).

**Option B as stated to students.** Week 11's graduate task is required and "always read", and the student-facing text never calls it optional, which is correct under the current schedule. The open course-level point is that Weeks 10 and 11 are consecutive required weeks under a rule described as "alternate weeks". The Week 9 author has raised this as a lead issue; see the Week 9 confirmation, S9C-2.

## Cautions for the faculty and lead (not blockers)

- The faculty must confirm the CP4 renormalisation of RB-8.5's 15 points (proportional by default; A14).
- Register: the S10 sl.59–64 Week 11 extension (A14) is still pending. The module mentions those slides only as "extension, registration pending", and no graded work depends on them.
- Bundle: `instructorNotes`, including the quiz-key line, and `MODEL_RIDS` ship in the student bundle. This is course-wide and lead-owned.
- Reference gaps taught as reviewer findings: T4 fault states, the FN-011 dispatch step and IF-003 acceptance. Lead-owned.

## What I verified

- **Build and tests.**
  - `npx tsc -b`: clean (exit 0) at the start of the pass. A re-run at the end failed only in `src/workbench/WorkbenchShell.tsx`, caused by another session's uncommitted workbench edits; there were no errors in Week 9, 11 or 12 files.
  - `npx vitest run src/activities/week09 src/activities/week11 src/activities/week12 src/content src/lib`: 12 files, **227/227 pass** on the final run. An earlier run's single failure was a Week 13 listing that was not yet recorded, and it cleared with commit `8af1385`.
- **Checker probes.** Release 2026-08, kernel 0.62.0, one JVM. `tasklist | grep -i java` was empty before the run, and the report was written to the scratchpad with `--report`.

  | Probe | Result | Lesson / key claim |
  |---|---|---|
  | Team K fragment + RID-IN-05 fix as written, **with** `private import SI::*;` | PASS, 0 messages | Agrees |
  | Same, **without** the SI import | FAIL: `57:20 Couldn't resolve reference to Element 'h'`, `57:11 An after expression must be a DurationValue` (+2 warnings) | Agrees ("without SI the unit h does not resolve") |
  | q11-8 team flow (A2 decision, `offerAlternative; then quoteFare;`) | PASS, 0 messages | Agrees ("the checker passes the file") |

- **Recorded results.** `validation-report.json` (2026-10-12T02:13Z) records PASS with 0 messages for the four Week 11 listings and the instructor key, and FAIL with 6 messages for `invalid_decide_target_declared`.
- **Tools, realistic bad and good input (rule 5).** The flow checker (wrong rejoin, wrong origin, skipped step, plus good variants), the RID screens (7 bad, 6 good), reveal gating (3 distinct, duplicate, vague, unowned, near-duplicate) and Team K store separation (code and test). All of these are covered in the table above.
- **Rule 4.** The reference SCN-002 flow passes every check, and all nine model RIDs pass the screens and the set screen (my run).
- **Quiz.** I checked every item, its key and its explanation, the letter spread, the length cue, rule 6 and the Bloom labels.
