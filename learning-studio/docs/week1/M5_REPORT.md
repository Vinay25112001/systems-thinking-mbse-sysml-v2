# Week 1 reconstruction, Milestone M5 (Guided Practice): report

Date 2026-10-21. Controlling spec: directive §11 (and §2, §9, §17, §19 Demo B 7–10, §20); `docs/week1/spec/WEEK1_DESIGN_SPECIFICATION.md` §e;
change-impact X8; reuse map C16, C25, U14, U15, U23; DECISION_LOG A25. Nothing is committed. No acceptance row is claimed PASSED.

## 1. What changed

| Area | Change | Spec |
|---|---|---|
| Store split (first) | Guided Practice has its own key `w1.practice` (`src/week1/practice/store.ts`). It never reads or writes the team record, the project or any workbench key. On first load it copies the earlier practice answers forward (`wb-artefacts['w1.stakeholders'|'w1.needs']`, `mission-progress['w1-m1…m4']`, AppState `boundary` b1–b9). It only reads those keys and records where the answers came from. "Reset all" leaves a marker so the old answers never come back. | X8, GP-23, checklist 5 |
| Guided Practice page | New page at `#/week/1/practice[/gp-1…gp-6]` (`GuidedPractice.tsx`, `TaskViews.tsx`, `tasks.ts`, `feedback.ts`, `ui.tsx`, `practice.css`), following the mockup. It has a plum hatched banner with the "Fictional teaching case" badge, a task list with state words (Not started, In progress, Attempted), minutes and "Reset all practice…", a task card with steps, one instruction, "Check my answer" / "Check again", feedback, and Previous / Next step / Next task. The right rail holds "Learn this" (links to the sections visible in this edition), "AeroLink facts used here" and "Why it matters for your project". The dense workbench is no longer used here. | GP-01, GP-21, GP-24 |
| Tasks (96 min) | GP-1 who is missing (predict → sort 18 → reveal); GP-2 boundary diagram (9 elements), model-boundary criterion (best-supported answer, every option explained), **new** EXT-001…003 exchange and direction with a context sketch; GP-3 classify six + one register row compared with the instructor's register; GP-4 **new**: five relationship pairs on a keyboard-operable relationship map, the conflict (REL-002, CON-012 vs CON-006, shared variable), "Insurers: safety" rewrite; GP-5 diagnose six drafts + write two needs (needQuality gates, warnings, six-check self-check, comparison with the case need); GP-6 **new**: six needs → mission/objectives, coverage matrix, gap decision with reason (DELIBERATE_GAP). It ends with "Now apply this to your own enterprise". | GP-10…15, §11 |
| Template transfer | `src/project/practice/TemplateCopy.tsx` is now the only path, used on GP-3, GP-5, GP-6 and the Lab handoff. The flow: a secondary action, then a choice of rows each with an "with its concerns" box, then a review listing exactly what would be created (with the new project IDs), what is not copied, and the spec warning word for word, then "I understand these must be adapted", then confirm. One change set, "Template copied from AeroLink (n rows)", source `practice-copy`. Ratings and reasons are never copied (`copyStakeholdersOps` gained `{concernsOf, ratings}`; existing callers are unchanged). The copy goes through `store.apply`, so it works with both IndexedDB and HTTP. `COPY_FROM_PRACTICE_ENABLED` is kept. The old CopyDialog and the student-visible "Pending faculty decision F4" chip are removed. | GP-30, U23 |
| Audit M2 | The lab tool (`#/week/1/project/tool`) shows only the Team view. It has no AeroLink rehearsal tree groups, no boundary-practice rules and no practice Export, and it is branded "Week 1 lab tool · your team's record" instead of "Practice workbench" (new optional `PracticeLinks` fields `views`, `hideTreeGroups`, `hideRules`, `brand`). | M2, U14 |
| Internal codes | Removed from missions m1–m4: (Session 1), (L5), L4's, the RB-1.3 and RB-2.2 rubric labels, and "taught in Session 2". Reused checker text goes through `plain()`, which strips register citations. Students see "objective". | GP-17, A25 |
| Overview | The optional practice row is now computed from the six tasks (1.6 h, up from 1.1 h) and is still not counted in the total. | §c block 7 |

Shared files: `App.tsx` (one delimited line: the practice fallback skeleton) and `scripts/check-student-build.mjs` (delimited `week1-m5` block). I did not touch `src/week1/learn/**`, `server/**`, Week 7, or the W9/W11/W12 partials.

## 2. Files

New: `src/week1/practice/{store,feedback,tasks}.ts`, `{GuidedPractice,TaskViews,ui,practiceSurfaces}.tsx`, `practice.css`, tests
`{store,feedback}.test.ts`, `{practice,surfaces}.test.tsx`; `src/project/practice/{TemplateCopy.tsx,templateCopy.css}`; this report.
Edited: `src/week1/{route.ts,Week1App.tsx,Workbench.tsx,Overview.tsx,week1.test.tsx}`, `src/project/practice/{copyFromPractice.ts,Handoff.tsx}`,
`src/workbench/{learnLink.ts,WorkbenchShell.tsx}`, `src/content/missions/week01.ts`, `e2e/{week1-flow,project}.spec.ts`,
`../WEEK1_ACCEPTANCE_MATRIX.md`.

## 3. Isolation proof

- `store.test.ts`: migration plus a task reset plus a full reset leave every localStorage key other than `w1.practice` byte-identical, including `wb-artefacts` (with `w1.team`), `mission-progress`, `boundary` and `w1-team-before-project`.
- `practice.test.tsx`: the test runs all 6 tasks, answers and checks every step, then resets one task (with confirmation) and resets all. The project document JSON, its `rev`, its change log and `wb-artefacts` are identical afterwards.
- Scratchpad Playwright (Demo B 7–10): a real IndexedDB project is created, then practice runs on GP-2 to GP-6, the template review opens (not confirmed), and "Reset all" runs. The SHA-256 of the IndexedDB project stores is the same before and after (`ba0486ae…`), and `wb-artefacts` is byte-identical.
- `src/project/isolation.test.ts` (import boundary) still passes: only `copyFromPractice.ts` reads AeroLink data on the project side.

## 4. Feedback design (§e.3)

- **Structural:** "Passes the course check" or "Does not pass yet: <rule>", with a green or amber border and a check or warning icon.
- **Compared with the instructor's reading:** the count "n agree · m differ", then the instructor's reasoning for each differing item. Where the case allows another reading, it adds "A well-argued different answer can be defensible: …", followed by "I have read why (or change my answer above)". A plum border and target icon mark this kind. There is never a score or percentage, and nothing is called "correct" or "wrong".
- **Reasoned reveal:** shown after the answer is recorded, with a teal border and lightbulb icon. For GP-1 it is computed from the student's own sort.
- **Completion:** a task is complete when every step is attempted, the answers are unchanged since the last check, and every difference has been changed or acknowledged. Agreement is never required: `feedback.test.ts` proves a task can be completed with every judgment differing. Changing an answer clears its acknowledgement at the next check.

## 5. Checks run

- `npx tsc -b`: no errors in M5 files. The only remaining errors are in the Week 7 agent's in-flight `src/content/lectures/week07/*`.
- Vitest (`src/workbench src/week1 src/project src/content/missions src/flow src/content/learn`): 44 files, 1390/1390.
- `vite build --mode student`: passes. `check-student-build.mjs` currently stops before §4 because the Learn gap-marker probe finds 0 markers (`too few textbook gap markers`). That is caused by M4b's in-flight gap prose, not by M5.
- The `week1-m5` block was run on its own in student mode: 30 surfaces (every task and step, fresh and with all feedback), 146,232 characters, 0 hits under every rule including "goal". The mutation run (`LEAK_CHECK_MUTATE=practice`) fails with 2 hits. The unit scan `surfaces.test.tsx` checks the same 30 surfaces.
- `e2e/week1-flow.spec.ts` against my own dev server on port 5185: 9/11 pass, including the full end-to-end walk with the new practice steps and axe at 1440/400 in light and dark.
  - Two tests fail on `#/dashboard` and `#/archive/week/1` lazy chunks hitting the 5 s timeout on a cold dev server. M4a reported the same behaviour; these tests do not touch practice.
  - `e2e/project.spec.ts` has its copy test updated but was not run.
- Scratchpad Demo B: 32/32 checks pass. It covers axe (WCAG 2.2 AA tags) at 1440, 1200, 900 and 390 px and in dark, the 13 px floor, no horizontal scroll, keyboard map edge → select, and no page errors.
  - The first run caught a `target-size` failure on the rail Learn links; it is fixed.
  - Results: `SysML-audit-screenshots-2026-10-21/m5/m5-demo-b-results.txt`. Screenshots (b7…b10, template review, GP-4 at four widths and dark) are in the same folder, and the e2e shots are in `m5/e2e-week1-flow/`.
- Housekeeping: the tracked screenshots the e2e run rewrote were restored (back to the 11 files that were modified before M5), the Playwright lock was taken as "m5" and deleted, and the temporary scripts were removed from the repo.

## 6. Acceptance rows advanced (honest)

AC-06, B7, B8, B9 and B10 moved from NOT STARTED to IN PROGRESS. AC-05 now records that the practice banner is done. None is PASSED: each still needs the e2e-server suite and faculty review.

## 7. Open items

1. **Leak-check ceiling (M4b-owned file):** in `src/week1/learn/studentScan.ts` `DEFERRED_STAGE_HITS`, the entry `'practice and lab tool: Week 1 mission texts'` now only needs ceilings for m5 and m6 (the lab tool and the quiz). Guided Practice no longer renders mission texts and is scanned strictly by the `week1-m5` block. Suggested change: rename the entry to "lab tool" and lower it to the recounted values. I did not edit it, because the file belongs to the M4b agent.
2. Server-side `practice_state` (spec GP-22/23 served mode) and `server/practice.test.ts` are not built. Practice is browser-local, which is the spec's Pages path.
3. Faculty review: the M5 reasoning and "defensible" sentences (instructor-authored, in `tasks.ts`), and the EXT direction readings.
4. `content/week1Path.ts WORKLOAD.practiceHours` and its text still state 1.1 h from the retired missions (shown on the Examples page and in the workload text). The Overview uses 1.6 h.
5. The optional GP-16 principle prompt (a SHOULD) is not built.
6. A Playwright run that selects within about 150 ms of a task switch can lose that edit. Real use is not affected, and the specs wait 400 ms. Worth a look when routing is next touched.
7. The week1-flow dashboard and archive timeouts (cold dev server).

## 8. Review dispositions (M5 fix, 2026-10-21)

Review: `_source_cache/review/week1_m5_review.md` (verdict REVISE; the reviewer confirmed isolation). Nothing is committed. Every finding is fixed in the working tree.

| ID | Disposition | What changed | Proof |
|---|---|---|---|
| M5-01 | Fixed | "read why" is now a button. `goToWhy()` scrolls to the explanation block and moves focus to it (the block has `tabIndex -1`). No `#why-…` href is left anywhere. | `review.test.tsx`: the hash route is unchanged, focus is on `why-…`, and there are 0 `a[href^="#why"]`. Playwright: the URL and the page stay, and focus moves. |
| M5-02 | Fixed | New `validate.ts` `sanitizePractice()` checks every stored leaf value against the task content. It drops unknown concern, stakeholder, objective, draft and pair IDs and wrong types, and it repairs duplicate need IDs. The page shows a dismissable notice naming what it left out. `tasks.ts` no longer calls the throwing `concern()` / `stakeholder()`. Step states are computed per task with try/catch. A `TaskBoundary` around each task shows "Reset GP-n", and a page-level `PracticeBoundary` offers "Reset all practice". The task list and both reset buttons sit outside the boundary. | `review.test.tsx`: the validator test (CON-999, a numeric prediction, `needs:[null]`, duplicate PN-1, unknown STK); the page renders with the corrupt data, the notice appears and Reset all stays enabled. |
| M5-03 | Fixed | GP-1 step 3 is disabled until step 2 has been checked, with a hint, and the reveal needs the check. | `review.test.tsx`: every radio is disabled, and no FAA, planning authority or residents text appears before the check. |
| M5-04 | Fixed | GP-2 step 2 opens only after step 1 has been checked. The instruction now says "In the instructor's reading, …". | `review.test.tsx`. |
| M5-05 | Fixed | Each draft has an explicit "Acceptable as written" judgment, and ticking a flaw clears it. "Check" is enabled only when every draft is judged, with a count of the drafts left. Acknowledgements of changed judgments are cleared at the next check. | `review.test.tsx` (disabled at first; all "acceptable" gives 1 agree · 5 differ). Playwright. |
| M5-06 | Fixed | Exchange text, the shared variable and the gap reason use `said()` from `workbench/emptyAnswer.ts`. A reason also fails when every word is an empty word. The word counts are gone, and each message tells the student why. | `review.test.tsx`: "Electricity" and "Clearances" pass; "n/a" and "todo" fail; "flight frequency" passes; "none none …" fails. |
| M5-07 | Fixed | The practice carries a write counter (`rev`). `savePracticeGuarded` writes only over the version this tab last read, and the page listens for `storage` events. When another tab has written, edits here pause and a notice offers "Load the latest answers". Nothing is ever overwritten silently. | `review.test.tsx` (the other tab's value survives; edits save after a reload). Two real Chrome tabs: tab A shows the notice and tab B's text is kept (`m5-fix/two-tab-notice.png`). |
| M5-08 | Fixed | The dialog opens with focus on Cancel and returns focus to the button that opened it. `aria-describedby` points at the body. | `review.test.tsx`; Playwright. |
| M5-09 | Fixed | When the template dialog changes step, focus moves to its title. At confirm the plan is recomputed: if the IDs differ, the copy is refused and the dialog asks for a fresh review. | Code; existing copy tests pass. |
| M5-10 | Fixed | The task list gets `min-width:0; overflow:hidden`. Below 600 px the GP-3 table stacks into labelled blocks. | Playwright: GP-3 at 390 px has no horizontal scroll and axe is clean (`m5-fix/gp3-390-light.png`). |
| M5-11 | Accepted (faculty F-5) | At 390 px the map is replaced by a list, which is now announced as "Relationships, as a list" (it was `aria-hidden`). The table stays the editable surface. | — |
| M5-12 | Fixed | Practice need IDs come from a stored counter (`pnSeq`) and are never reused. The validator renumbers duplicates found in earlier data. | `review.test.tsx`. |
| M5-13 | Fixed | One wording everywhere: "Template from AeroLink — adapt before use" in the warning, the review, the result message, the My Project chip and the artifact banner. Adapted copies read "Adapted from AeroLink template". | Unit and e2e expectations updated. |
| M5-14 | Fixed | `handoffs.ts` now says "objectives". The handoff panel is part of the strict practice scan. | `surfaces.test.tsx`; leak block covers 31 surfaces. |
| M5-15 | Fixed | New module `practice/minutes.ts` is the one source. `week1Path WORKLOAD.practiceHours` now comes from it (1.6 h), and the stated row in `weeks/week01.ts` reads 1.6 h. That row is optional and not counted in the 8.1 h (A26). Missions m1–m4 draw on the renamed optional row. | `review.test.tsx` (stated = computed = Overview); `content/learn/week01.test.ts` and `missions.test.ts` pass. |
| M5-16 | Fixed (A25-3 default) | The GP-3 row asks for interest 1–5 with a short reason (both required). Influence and its reason are optional. The comparison shows the instructor's interest and influence. | `review.test.tsx`. |
| M5-17 | Fixed | GP-2 exchanges are snapshotted at Check, and the reading and "Agrees" refer to that snapshot. A change is flagged as "Changed since the last check", and an acknowledgement is cleared when its direction changed. | `review.test.tsx`. |
| M5-18 | Fixed | The status message is cleared when the task changes. On a step change, focus moves to the step heading. | Code. |
| M5-19 | Fixed | The GP-4 reasoning header now uses names. | — |
| M5-20 | Fixed | A stored value that cannot be read no longer re-runs the migration. | `review.test.tsx`. |
| F-3 | Applied (A25-1) | The banner adds: "AeroLink and its numbers are fictional teaching assumptions; the regulator it names, the FAA, is real, and its role is simplified." | — |

**Checks (fix):**
- `npx tsc -b`: clean.
- Vitest (`src/workbench src/week1 src/project src/content src/flow src/pages`): 81 files, 2259/2259 after the workload-line fix. Practice suite: 5 files, 45/45.
- `vite build --mode student` and `node scripts/check-student-build.mjs`: **PASS** in full. The student-surface scan is clean, and the guided-practice block covers 31 surfaces and 151,232 characters with no banned string. The mutation run gets 2 hits.
- Scratchpad Playwright under lock "m5fix", released afterwards, on its own dev server on port 5185: 40/40 checks plus the two-tab check pass. They cover axe at 1440/1200/900/390 px and in dark, GP-3 at 390 px, the 13 px floor, no horizontal scroll and no page errors, and the IndexedDB project hash is identical before and after practice and reset.
- Results: `SysML-audit-screenshots-2026-10-21/m5-fix/m5-demo-b-results.txt`, with screenshots in the same folder.
- Tracked screenshots: unchanged (the 11 files that were already modified before M5).

## 9. Confirmation follow-ups (M5 fix 2, 2026-10-21)

Review: `_source_cache/review/week1_m5_confirmation.md` (CONFIRMED, with 4 follow-ups). All four are fixed. Nothing is committed.

| ID | Fix | Proof |
|---|---|---|
| M5-06 rest | `workbench/emptyAnswer.ts` adds `isEmptyEveryWord` and `saidSomething`: an answer counts as empty when every word is an empty answer ("n/a todo", "none none", "tbd, later"). The GP-2 exchanges, the GP-4 shared variable, the GP-3 interest reason and the GP-6 reason use it. `said`/`isEmptyAnswer` are unchanged, so the shared gates are unaffected. | `review.test.tsx`: "Electricity", "TLS", "Fail safe" and "none apply here" pass; the multi-token empties fail. `shortAnswers.test.ts` passes. |
| N-1 | GP-2 step 3 is locked until step 1 has been checked, and it names no external system before then. | `review.test.tsx`. Browser at 390 px: PASS (`m5-fix2/gp2-step3-locked-390.png`). |
| N-2 | Fields, selects and the two-column form shrink to the column, and long option labels wrap. | Browser: GP-4 step 2 at 390 px with long concerns selected has 0 px overflow (`m5-fix2/gp4-step2-390.png`). |
| N-3 | When the stored practice cannot be read, the raw text is first kept under `w1.practice.unreadable` (with the time). The practice then starts again without migrating, and the page shows a notice naming the backup key. | `review.test.tsx`. |

**Checks:**
- `npx tsc -b`: clean.
- Vitest (`src/workbench`, including `shortAnswers`, plus `src/week1`, `src/project` and `src/content/missions`): 1500/1501. The one failure is `week01Lab` vs `WEEK1_LAB_INSTRUCTIONS.md`, which are out of sync because another agent edited the stakeholder row wording in the lab source (interest/support). That source is not M5's and has not been regenerated here.
- Practice leak block in student mode: 31 surfaces, 0 hits.
- Browser check under lock "m5fix2": 2/2 pass. Lock released; tracked screenshots unchanged.

**Still open after the fix:** items 1–3 and 5–7 of §7. Item 4 is closed by M5-15. The faculty items F-1, F-2 (default applied), F-4 and F-5 remain.
