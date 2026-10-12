# Week 9 sign-off confirmation pass: MBSE foundations and the SysML v2 language (L9, CP3 defence)

Reviewer: Independent AI reviewer (Claude), sign-off pass. Date: 2026-10-12.

No course or app file was changed. The one mutation was applied, tested and reverted, and `git diff --stat` on that file is empty afterwards. Probe files and reports are in the reviewer's scratchpad only.

**Under review:** fix commit `7543dbe`, checked against the sign-off review `week09_signoff.md` (NOT SIGNED OFF: blockers S9-N1 and S9-N2; minors S9-N3 to S9-N7). Files:
- `src/content/weeks/week09.ts`
- `src/activities/week09/*` (`predict.ts`, `PredictChecker.tsx`, the new `quiz.test.ts`, `logic.test.ts`, `activities.test.tsx`)
- `docs/authoring/week09_notes.md`, section "Sign-off fix pass"

## Verdict: **SIGN-OFF** (minors and cautions only)

Both blockers are fixed, and I confirmed each one independently:
- **S9-N1.** The predict score no longer moves before a reveal. I put the old behaviour back as a mutation and three tests failed.
- **S9-N2.** The quiz key is balanced, and the correct option is no longer a length cue.

All five minors are resolved. No new critical or major finding.

The workload question the lead asked me to judge (L9 out of class budgeted at 1.2 h against a realistic 1.5 h) is a **minor, not a blocker**. The reasoning is in the Workload section below, with a rebalance that would remove it.

## Disposition of the sign-off findings

| ID | Sev. | Disposition | Evidence |
|---|---|---|---|
| S9-N1 | High | **RESOLVED** | `scorePredictions(predictions, revealed, recorded)` skips any item that is unrevealed or whose `recordedResult` is not `recorded`, and scores against `rec.outcome`, never `item.answer` (`predict.ts`). `PredictChecker.tsx` hashes the listing on screen plus every revealed listing. `item.answer` is no longer read anywhere in the component. The status line now reads "N predicted; M revealed with a verified record; of those …", and "N predicted" carries no key information. **Mutation:** I removed the reveal/record filter and compared against `item.answer`. 3 tests fail: the logic test "review S9-N1 …", the component test "trying every option before reveal never moves the score", and "a stale record is not scored". After reverting, `git diff --stat predict.ts` is empty. |
| S9-N2 | High | **RESOLVED** | My option-length script over `week09.quiz`:<br>• Keys: a 4 · b 4 · c 4 · d 3.<br>• The correct option is the unique longest in 3 of 15 items (q9-3, q9-8, q9-10), by 1, 8 and 1 characters.<br>• The highest ratio of correct-option length to distractor mean is 1.14 (q9-15). It was 5.5× before.<br>• No correct option shares a 6-word run with the lesson (my check is stricter than the test's 8 words).<br>`quiz.test.ts` now pins the spread, the length cue, rule 6 and the Bloom counts (Apply 7 · Analyse 5 · Evaluate 3, which I reproduced). |
| S9-N3 | Low | **RESOLVED** | The result text compares with `rec.outcome`: "Your prediction matches the recorded result". |
| S9-N4 | Low | **RESOLVED** (lead remainder) | Installation is now the pre-course Week 0 task (DECISION_LOG A14 option E) in the L9 block, lab step 1, the facilitation note, the workload row and the caution. The faculty open issue is replaced by a lead request: "no pre-course Week 0 task exists in the app yet". That task is still to be created, so it is listed under Cautions. |
| S9-N5 | Low–Med | **RESOLVED** | The memo is optional this week under option B everywhere a student sees it: objective line 25, assignment, template §7 heading, `due`, `weight` and `rubricScope`. The cautions record ≈ 1.5 h for a student who submits it, with a part-by-part breakdown. KerML stays assessed through q9-5 and q9-14. |
| S9-N6 | Low | **RESOLVED** | `week09.ts` no longer contains "R79" (0 occurrences). Worked (c) now cites S06 p.77. I re-read it: "only the kind of unit … is associated with an attribute definition, while a specific unit … is only given with an actual quantity value", and the library "specif[ies] the full set of international standard quantity kinds and units". |
| S9-N7 | Low | **RESOLVED** | **q9-5** is a new case: subsetting [8] under a redefined [6], so the model is unsatisfiable. I re-read R87 p.61: a subsetting feature may "restrict the multiplicity … to allow cardinalities that are smaller". The "unique by default" premise is S06 p.73 ("The default is that the usage is unique"), which I re-read. My checker run of the q9-5 fragment PASSes with the warning "Subsetting/redefining feature should not have larger multiplicity upper bound". The item makes no checker claim, so nothing contradicts the recorded behaviour.<br>**q9-14** is a new case: two sibling bindings of a single-valued feature entail disjointness. The key is right: an owned attribute usage gets the implicit [1..1] (S06 p.73), and conditions are necessary (R87 p.52–53). |

## New findings (none blocking)

| ID | Severity | Location | Finding | Fix |
|---|---|---|---|---|
| S9C-1 | Low | `instructorNotes.cautions` (workload caution); workload row 8 | **The caution contradicts itself.** It opens with "every row is at a realistic rate" and then says that the L9 out-of-class row is budgeted at 1.2 h against a realistic 1.5 h. The disclosure itself is honest and specific. | Either delete "every row is at a realistic rate", or apply the rebalance below so that the sentence becomes true. |
| S9C-2 | Low (lead) | `course.ts` Week 9 `graduateTask`; option-B wording | **Students see two different statements about the Week 9 graduate task.** `course.ts` still states the task without "optional", and the course-level pages render it that way. The week page says the memo is optional "under option B (graduate tasks in alternate weeks)", but the actual pattern is W8 required, W9 optional, W10 required, W11 required, W12 optional. Weeks 10 and 11 are consecutive required weeks, so "alternate weeks" is not literally true. The Week 9 author already lists the scheduling question as a lead open issue. | Lead: mark Weeks 9 and 12 optional in `course.ts`. Either word option B as "graduate tasks are optional in some weeks (9, 12, …)", or move one of Week 10's or Week 11's tasks to optional so that the pattern really alternates. |

## Workload (rule 3): judgement on the 1.2 h vs 1.5 h row

- **What the rows say.** They sum to 9.0 h. L9 out of class is budgeted at 1.2 h. The caution states the realistic figure (≈ 1.5 h), the realistic week (≈ 9.3 h for every student, ≈ 10.8 h for a graduate who submits the optional memo), and the cost for a student who skipped the Week 0 install (≈ +1.5 h).
- **Does it meet rule 3? Yes, by its own fallback clause, so it is not a blocker.**
  - AUTHORING_GUIDE §7 rule 3 says: "If the syllabus total forces an item below a realistic time, say so in `cautions` instead of shrinking it silently." That is exactly what was done, with the figure.
  - The "design to fit at realistic rates" mandate in rule 3 is written for Weeks 10–14. Week 9 was written before it.
  - The overrun (0.3 h, ≈ 3 %) is within the precision of these estimates.
  - The week fell from ≈ 12 h (WORKLOAD_ANALYSIS) to ≈ 9.3 h through options B, C and E.
- **What is wrong.** Only the wording (S9C-1). A row that knowingly under-states, under a caution headed "every row is at a realistic rate", is the pattern rule 3 exists to stop. Here it is disclosed.
- **A rebalance that removes the issue (option C, readings narrowed to the pages the lesson cites):**
  - The lesson cites R90 only at sl.7–9, 12 and 17–22, about 11 of the 18 registered slides.
  - It cites R70 only at sl.3–16, about 14 of 17.
  - Narrowing both saves ≈ 10 slides ≈ 0.3 h at 30 sl/h. The core-reading row becomes 2.0 h and the L9 row 1.5 h. The rows then sum to 9.0 h at realistic rates, and the caution's opening sentence becomes true.
  - Alternative: drop the 0.2 h "CP3 defence final rehearsal" row, since the main preparation is already budgeted in Week 8, and add 0.1 h from narrowing R90.

## Cautions for the faculty and lead (not blockers)

- The pre-course Week 0 install task (A14 option E) does not exist in the app yet (lead open issue). Until it does, the L9 block is the only place where the install steps are written.
- The open lead items carried from the first sign-off still stand: the reference v0.1 skeleton alignment (F04), the PROVENANCE append (F09), and S06 p.197 being outside the register.
- R43 (q9-12, q9-13) and R87 (q9-5, q9-14) are cited but are not in Week 9's `readings`. They come from earlier-week readings and the graduate task respectively. The first sign-off accepted this, and I have nothing new to add.

## What I verified

- **Build and tests.**
  - `npx tsc -b`: clean (exit 0) at the start of the pass, against HEAD `7543dbe`. A re-run at the end failed with one error in `src/workbench/WorkbenchShell.tsx`, caused by another session's uncommitted workbench edits. None is in Weeks 9, 11 or 12.
  - `npx vitest run src/activities/week09 src/activities/week11 src/activities/week12 src/content src/lib`: 12 files, **227/227 pass** on the final run. The first run had one failure, in `src/lib/sysml.test.ts`, for a concurrent author's Week 13 listing that was missing from `validation-report.json`. It cleared once that author's commit `8af1385` landed.
- **Predict cannot leak.** The checks were:
  - Code reading: no key read, scoring filtered by reveal and SHA.
  - The component and logic tests.
  - The mutation above.
- **Quiz.** I checked every item, its key and its explanation:
  - The key letters, the length cue and rule 6, using my own script.
  - The Bloom labels.
  - The changed citations: R87 p.61 for q9-5, S06 p.73 for q9-5 and q9-14, S06 p.77 for worked (c).
- **Checker probe** (release 2026-08, one JVM, `tasklist | grep -i java` empty before the run, report written to the scratchpad with `--report`). The q9-5 fragment PASSes with the larger-upper-bound warning, which is consistent with the item. I made no other Week 9 listing change, so I did not re-run the canonical record. Its entry for pc4 still reads PASS with 1 diagnostic.
- **Workload.** The rows sum to 9.00 h (my computation). `lessonWordCount` is 4,825.
