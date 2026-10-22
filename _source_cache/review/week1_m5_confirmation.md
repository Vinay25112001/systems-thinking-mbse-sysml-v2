# Week 1 M5 (Guided Practice): confirmation review of the fixes

Date 2026-10-21. Reviewer: independent, adversarial, read-only. I edited no source files, ran no git commands and installed nothing.
Inputs:
- the original review, `week1_m5_review.md` (verdict REVISE);
- the dispositions in `learning-studio/docs/week1/M5_REPORT.md` §8;
- the uncommitted M5 code.

Out of scope: `src/week1/learn/**` (M4b) and Week 7.

## Verdict: **CONFIRMED, with three minor follow-ups (none blocking)**

All five blocking findings are fixed, and I confirmed each one in the browser:
- **M5-01:** all 44 "read why" buttons across GP-1 to GP-6 keep the route and move focus to the explanation.
- **M5-02:** five kinds of corrupt data all leave the page usable, and both resets work.
- **M5-03, M5-04, M5-05:** no step shows an instructor answer before the student has attempted it, and GP-5 now needs a judgment on every draft.
- **Isolation:** the IndexedDB project and `wb-artefacts` (including `w1.team`) are byte-identical before practice, after practice, and after both resets.

Three minor items remain:
- **M5-06 is only partly fixed.** "n/a todo" is still accepted, along with other runs of empty words, in three fields.
- **N-1 (new, same class as M5-04).** GP-2 step 3 names three of the step 1 answers before step 1 has been checked.
- **N-2 (new).** GP-4 step 2 scrolls the page sideways at 390 px.

## Checks run

| Check | Result |
|---|---|
| `npx tsc -b` | exit 0 |
| `npx vitest run src/workbench src/week1 src/project/practice src/content/missions` | 33 files, **1431/1431** pass, exit 0. No failures need to be attributed to M4b or to the `week01.ts` workload row. |
| Scratchpad Playwright | System Chrome, fresh contexts, against `127.0.0.1:5173`, run under lock "m5confirm" (taken when no lock was present; deleted afterwards). The scripts are in the scratchpad, not the repo. Results, the pre-attempt DOM text dumps and the screenshots are in `SysML-audit-screenshots-2026-10-21/m5-confirm/` (`m5-confirm-results{,-2,-3}.txt`, `m5-confirm-pre-attempt-text.txt`). |
| Page errors | 0 in every run |

## Per-finding table

| ID | Builder | Confirmed? | Evidence |
|---|---|---|---|
| M5-01 | Fixed | **Yes** | **Browser:** with the student's answers chosen to differ from the instructor's, I clicked every "read why": GP-1 15, GP-2 8, GP-3 6, GP-4 4, GP-5 5, GP-6 6. The hash stayed `#/week/1/practice/gp-n`, the page stayed mounted, and focus went to `why-…` each time. There are 0 `a[href^="#why"]`. |
| M5-02 | Fixed | **Yes** | **Browser, five injected values:** (a) CON-999, a numeric prediction, an unknown pair, a numeric `variable` and `generic`, `needs:[null,…]`, duplicate PN-1, `traces` as a string; (b) malformed JSON; (c) wrong types throughout (`rev:'abc'`, `gp-1:'x'`, `b1:7`, direction `'up'`, `row:5`, `classes:[]`, `MGO-999`, `STK-999`, `reason:[…]`); (d) `null`; (e) `[1,2,3]`. In every case, all 16 steps render with no task error and no page error. Reset task and Reset all work. A new answer saves and survives a reload. The notice names the left-out items, e.g. "(6): GP-1 prediction; …; GP-4 concern 1: CON-999". |
| M5-03 | Fixed | **Yes** | **DOM text**, not visuals: after a prediction but before the sort is checked, the step 3 radios are `:disabled` (by their fieldset). A forced click stores no `match` and shows no reveal. "FAA", "planning authority" and "Residents" are absent from the card. After the check the reveal appears. |
| M5-04 | Fixed | **Yes for step 2**; see N-1 for step 3 | The step 2 card text before the step 1 check is only the locked hint. It no longer contains "passenger demand is inside". |
| M5-05 | Fixed | **Yes** | **Browser:** Check is disabled at first and with 5 of 6 drafts judged (hint: "1 left"), and enabled at 6 of 6. Ticking a flaw clears "Acceptable as written". Unticking that flaw leaves the draft unjudged, and Check is disabled again. Summary with all drafts acceptable: "1 agree · 5 differ". |
| M5-06 | Fixed | **Partly** | **Accepted, as they should be:** "Electricity", "Clearances", "flight frequency", "evening flight frequency". **Rejected, as they should be:** "n/a" in exchanges, the shared variable and the interest reason; "none ×8" in the GP-6 reason. **Still accepted:** "n/a todo" and "none none" in the GP-2 exchanges, the GP-4 shared variable and the GP-3 interest reason (`gp2-na-todo-accepted.png`, results-2). The original evidence named "n/a todo". The cause: `said()` tests the whole string against a single-token regex, and `saidReason()` (`tasks.ts:36`) is used only for the GP-6 reason. The fix tests cover only "n/a" and "todo" on their own. **Fix:** use `saidReason` (or a per-word check) in `gp2Exchanges` (`tasks.ts:234`), `gp4ConflictCheck` (`:336`) and `gp3RowIssues` (`:281`), and add "n/a todo" to `review.test.tsx`. |
| M5-07 | Fixed | **Yes** | **Two real tabs (same context):** B typed the GP-4 rewrite, then A typed. A showed "edits here are paused", the stored value kept B's text, and "Load the latest answers" brought B's text into A. Then A ran Reset all and B edited: B got the notice and the stored value stayed reset. Nothing was overwritten silently. |
| M5-08 | Fixed | **Yes** | **Browser:** the dialog opens with focus on Cancel. Escape returns focus to "Reset all practice…". Confirming a task reset returns focus to "Reset this task". `aria-describedby` points at the body text. |
| M5-09 | Fixed | **Yes** | **Browser:** focus moves to the dialog title on both the pick step and the review step. The plan is recomputed at confirm (code). Nit: `plan` is a `useMemo` on `st.doc`, so the listed IDs update live during the review while "I understand" stays ticked. The refusal path can almost never trigger. This is harmless. |
| M5-10 | Fixed | **GP-3 yes**; see N-2 | GP-3 has no horizontal scroll at 390 px on either step. |
| M5-11 | Accepted (F-5) | n/a | The list is now labelled "Relationships, as a list". |
| M5-12 | Fixed | **Yes** | **Browser:** record, record, revise PN-1, record → the stored IDs are `PN-2, PN-3`. No ID is reused or duplicated. |
| M5-13 | Fixed | **Yes** | The warning, the review and the result all read "Template from AeroLink — adapt before use". After a real copy, the My Project STK list chip shows the same text (`project-after-copy.txt`). "Copied from practice" and "Template: adapt" appear nowhere. |
| M5-14 | Fixed | **Yes** | No "goal" or "goals" on any of the 16 practice steps, nor in the handoff panel on `/week/1/project` or `/week/1/lab`. See observation O-1. |
| M5-15 | Fixed | **Yes** | `practice/minutes.ts` `TASK_MINUTES` is the single source: `TASKS[].minutes`, `PRACTICE_MINUTES`, the Overview and `week1Path WORKLOAD.practiceHours` all read it. The task list shows "≈ 96 min". The stated row in `content/weeks/week01.ts:406` is hard-coded to 1.6, but `content/learn/week01.test.ts:383` asserts it equal to the computed value. **Not counted:** the Overview's "Total required" is the sum of the eight required rows only, and practice is listed separately as "Optional practice, not counted in the total". The total currently reads **8.5 h, not 8.1 h**, because the Learn row is 17,309 words / 1.9 h. That comes from M4b's in-flight Learn text, not M5 (`overview-workload.txt`). |
| M5-16 | Fixed | **Yes** | **Browser:** no interest → "rate the stakeholder’s interest"; interest with no reason → "give a short reason…"; interest and reason with no influence → passes, and the instructor's register is shown. (The empty-word gap is under M5-06.) |
| M5-17 | Fixed | Yes (code + unit) | The reading and "Agrees" use `exchangesChecked`. A changed exchange shows "Changed since the last check". `gp2CheckExchanges` drops an acknowledgement when the direction changed. |
| M5-18 | Fixed | **Yes** | **Browser:** after a reset, the status message is cleared on a task change (1 → 0). "Next step" moves focus to `h2.gp-h2`. |
| M5-19 | Fixed | Yes (code) | The header is `{sourceName} → {targetName}`. |
| M5-20 | Fixed | **Yes** | `loadPractice` tests `storedRaw() !== null`. Malformed JSON does not re-run the migration, and the page is usable. See N-3. |
| F-3 | Applied | Yes | The banner carries the realism note. |

**Isolation:**
- I created a real IndexedDB project in the browser and seeded `wb-artefacts['w1.team']` with a sentinel.
- I then ran all six tasks (checks, a per-task reset, a template review and need records) and finished with Reset all.
- The IndexedDB dump hash was `7bf14f17204f8b6c` at all three points: before, after practice and after Reset all.
- `wb-artefacts` was byte-identical each time.
- The only other localStorage key that changed was `w01-learn-progress-v1`, which is written by visiting the Week 1 pages, not by practice.

(The template copy confirm, which is meant to write the project, ran in a separate context.)

## New findings

| ID | Sev | file:line | Evidence | Fix |
|---|---|---|---|---|
| N-1 | Minor (answer before attempt, same class as M5-04) | `TaskViews.tsx` GP2View exchanges branch; `tasks.ts:224-227` | GP-2 step 3 can be opened before step 1 is checked. It names "Controlled airspace (air traffic service)", "Electric grid" and "Weather" as **external systems** that sit across the boundary from the service, in the instruction, the context sketch and the fieldsets. Those are step 1 items b6, b5 and b7, all keyed "environment", so 3 of the 9 placements are given away (`gp2-exchanges-before-boundary-check.png`, pre-attempt dump). | Gate step 3 on `gp2Boundary(s).checked`, as step 2 now is, or accept and document it as a deliberate scaffold. |
| N-2 | Minor (390 px) | `practice.css:319` (`.gp-form.two { grid-template-columns: 1fr 1fr }`; at narrow widths `1fr`) | At 390 px, GP-4 step 2 "Find the conflict" scrolls the whole page horizontally: `scrollWidth` 608. The two concern `<select>`s are 572 px wide because of their longest option ("CON-0xx … (stakeholder)"). A `1fr` track is `minmax(auto, 1fr)`, so the select's min-content width wins over `max-width:100%`. The other 15 steps are clean (`gp4-conflict-390-fresh.png`). The builder's and the first reviewer's 390 px passes covered only the first step of each task. | Use `minmax(0,1fr)` for both column rules, or add `.gp-field { min-width:0 }` and `.gp-field select { width:100% }`. Add the conflict step to the 390 px sweep. |
| N-3 | Nit | `store.ts` `loadPractice`; `GuidedPractice.tsx` notice | When the whole stored value cannot be parsed (malformed JSON), the student gets an empty practice and **no notice**: `dropped` is empty, so the "could not be read" banner never shows. The answers are lost without a word. | When `storedRaw() !== null` but parsing fails, push something like "all saved practice answers (unreadable)" into `dropped`. |

## Observations (not M5 defects)

- **O-1:** My Project's overview still reads "Goals (MGO-002 onward) … Every need traces to the mission or a goal", and it reports "copied from the AeroLink practice". This is project-page text outside the M5 changes, but it conflicts with A25's "objective" wording. It is for the project-page owner.
- **O-2:** The Overview's required total is 8.5 h against the 8.1 h accepted in A26, because the Learn row is now computed from 17,309 words. This is M4b's in-flight Learn text. It is not caused by practice, which stays uncounted.
- **O-3:** GP-6 step 2 shows the coverage matrix (OEM 0/0) before the attempt. This is by design: reading the matrix is the task.
