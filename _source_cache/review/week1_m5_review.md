# Week 1 M5 (Guided Practice) — independent adversarial review

Date 2026-10-21. Reviewer: independent, read-only (no source edits, no git, no installs). Scope: uncommitted M5 work
(`src/week1/practice/**`, `src/project/practice/{TemplateCopy,copyFromPractice,Handoff}`, `src/week1/{route,Week1App,Workbench,Overview}`,
`src/content/missions/week01.ts`, `src/workbench/**` edits). Out of scope: `src/week1/learn/**`, Week 7, `server/**`.

## Verdict: **REVISE**

The isolation design is solid: practice cannot write into the team record or the project, and the copy flow is the single,
reviewed path into the project. Three defects block sign-off, all confirmed in the browser:
1. Every "read why" link leaves the practice page and lands on Home (M5-01).
2. One malformed stored value blanks the whole Guided Practice page, and "Reset all" can no longer be reached (M5-02).
3. Instructor readings show before the student has attempted the step, in GP-1, GP-2 and GP-5 (M5-03, M5-04, M5-05).

The other findings are minor. Each fix is small.

## Checks run

| Check | Result |
|---|---|
| `npx tsc -b` | exit 0, clean. The Week 7 errors the builder reported are no longer present. |
| `npx vitest run src/workbench src/week1 src/project/practice src/content/missions` | 32 files, 1416/1416 pass |
| Scratchpad Playwright, system Chrome, fresh contexts, against 127.0.0.1:5173 | Ran under lock "m5review"; lock deleted afterwards. Results and screenshots are in `SysML-audit-screenshots-2026-10-21/m5-review/` (`m5-review-results.txt`). |

The Playwright run confirmed these:
- **Migration:** seeded legacy keys were byte-identical after migration and after "Reset all". After reset and a reload, the old answers did not come back.
- **Template copy:** the button is disabled when no project exists.
- **No page errors** in normal use.
- **Keyboard:** pressing Enter on a map edge moves focus to that relationship's select.

## Findings

| ID | Sev | file:line | Evidence | Fix |
|---|---|---|---|---|
| M5-01 | **Major** | `TaskViews.tsx:97,225,341,489,598,725`; `ui.tsx:32`; `lib/router.tsx:6` | The `Agreement` "read why" link is a raw `<a href="#why-k1">`. The app uses a hash router, and `currentPath()` maps any hash without a leading `/` to `/`. Playwright: on GP-1 after a check, clicking "read why" changed the hash from `#/week/1/practice/gp-1` to `#why-k1` and the practice page unmounted (`read-why-click.png`). This affects every compared step in all six tasks. | Make it a button that runs `document.getElementById('why-'+id)?.scrollIntoView()` and moves focus to that block, or drop the link. Add a test that the route is unchanged after the click. |
| M5-02 | **Major** | `store.ts:65-80`; `tasks.ts:309` (`concern(c1)` throws); `GuidedPractice.tsx:68` | `normalizePractice` checks containers but not values. Seeding `gp-4.conflict.concerns:['CON-999',…]` made `stepStatus()` throw "unknown concern CON-999" for every task, so GP-1, GP-4 and GP-5 all rendered nothing (`corrupt-data.png`). "Reset all" is on the page that crashed, so the student cannot recover without clearing site data. Concern IDs renamed in a later case-data release would trigger the same failure. Other values are also cast unchecked: `prediction` as a number, `needs:[null]`, `generic` as a non-string (`s.generic.trim()`). | Validate leaf values in `normalizePractice`: drop unknown concern, stakeholder and objective IDs, and coerce strings and arrays. Make `tasks.ts` use `CONCERNS.find` instead of the throwing `concern()`. Wrap the page in an error boundary that offers "Reset all practice". Add a store test with corrupt values. |
| M5-03 | **Major** (answer revealed early) | `TaskViews.tsx:128-134`; `tasks.ts:170-183` | The GP-1 step 3 reveal needs only a prediction and a match answer. The step 2 sort and check are not required. Playwright: predict, jump to step 3, pick "It matched", and the reveal names "the FAA and the city planning authority" and "Residents near the site" as the missing stakeholders before the student has sorted anything (`gp1-early-reveal.png`). Asking whether "what you found" matched the prediction before anything was found is also incoherent. | Disable step 3 (or its choice) until `gp1Identify(s).checked`, and say why. |
| M5-04 | Minor→Major (answer revealed early) | `TaskViews.tsx:255` | The GP-2 step 2 instruction says "Passenger demand is inside the boundary and the electric grid is in the environment". Steps can be opened freely, so this gives away b4 and the grid's placement (b4 is the most contested item) before step 1 is checked. | Gate step 2 on `gp2Boundary(s).checked`, or reword so it does not presuppose the placements. |
| M5-05 | **Major** (empty answer accepted; reveal without attempt) | `TaskViews.tsx:603` (`ready={d.touched \|\| true}`) | On GP-5 diagnose, "Check" is always enabled. Playwright: with nothing ticked, Check showed all five reference rewrites and the instructor's flaw keys. Ticking "read why" six times then completes the step. Because "nothing ticked" also means "acceptable", an untouched draft cannot be told apart from a judged one. | Add an explicit per-draft choice "Acceptable as written" (or "No flaw"). Enable Check only when every draft has a recorded judgment. |
| M5-06 | Minor (valid short input rejected / empty accepted) | `tasks.ts:228` (≥2 words), `:310` (≥3 words), `:397` (≥8 words) | M5 adds word-count gates, which the 2026-10-19 gate sweep removed (comment at `stakeholders.ts:127`). It does not use `src/workbench/emptyAnswer.ts`. Playwright: "Clearances" and "Electricity" were rejected ("state what crosses the boundary…"), while "n/a todo" was accepted. A shared variable of "evening flight frequency" passes; "flight frequency" fails. An 8-word reason of "none none none…" passes. | Gate on `said()` from `emptyAnswer.ts` (with a per-word empty check for the reason). Drop the word counts, or keep them only as non-blocking advice. Add tests for both sides, mirroring `shortAnswers.test.ts`. |
| M5-07 | Minor | `GuidedPractice.tsx:64,81-87` | There is no `storage` listener. Each edit writes the whole in-memory state. Playwright: text typed in tab B (GP-4 rewrite) was lost when tab A, still open, made one edit. Likewise, "Reset all" in one tab is undone by any edit in another open tab. | Listen for `storage` events on `w1.practice` and reload the state, or merge per task on save. |
| M5-08 | Minor (a11y) | `ui.tsx:67-88`; `GuidedPractice.tsx:234` | The reset `ConfirmDialog` has no Radix Trigger, so focus is not returned on close. Playwright: after Escape or confirm, focus lands on BODY. Initial focus is on the destructive "Reset all practice" button, so pressing Enter right away wipes the practice. `aria-describedby={undefined}` although a body exists. | Store the opener and refocus it in `onCloseAutoFocus`. Use `onOpenAutoFocus` to focus Cancel. Point `aria-describedby` at the body. |
| M5-09 | Minor (a11y) | `TemplateCopy.tsx:100,123` | Switching between the pick step and the review step unmounts the focused button. Radix then moves focus to the dialog container, and nothing announces the step change. The review IDs (`planTemplateCopy`, line 36) are computed when the review opens and can differ from what `confirm` creates if the document changes in between (server mode, a teammate's edit). | On step change, focus the title (`tabIndex={-1}`). Recompute the plan at confirm and refuse if it differs, or show the IDs in the result message (already done) and say "IDs may differ". |
| M5-10 | Minor (390 px) | `practice.css` task list or grid | At 390 px, GP-3 scrolls the whole page horizontally (`scrollWidth` 671; `gp-3-390.png`). The other five tasks do not. The builder's 390 px pass covered GP-4. The classify table's four answer columns sit inside a 316 px scroll box, and two of them are off-screen until scrolled. | Find the overflowing element: the task-list item and LI extend to right=542/716 on GP-3. Clip it with `min-width:0` or `overflow-x` on the task list. At 390 px, stack the classify controls per row. |
| M5-11 | Minor | `practice.css` (`.gp-map svg{display:none}` at narrow widths) | At 390 px the editable relationship map is hidden. The fallback list is `aria-hidden`, so phone users get no diagram, although §11 lists "editable diagrams". The table still works. | Accept and document this, or show a scaled map. |
| M5-12 | Minor (data) | `TaskViews.tsx:671` | Need IDs are `PN-${needs.length+1}`. If you record two, revise PN-1 and record again, there are two PN-2 entries: duplicate React keys, and "Revise" (filter by id) removes both. | Use the maximum existing number + 1, or a uid. |
| M5-13 | Minor (consistency) | `copyFromPractice.ts:18`, `TemplateCopy.tsx:58,108` vs `pages/Library.tsx:16`, `ArtifactPage.tsx:108` | The warning and the review promise rows "marked ‘Template: adapt before use’", but My Project shows "Copied from practice". Spec §e.5 step 4 asks for a plum "Template: adapt" chip. | Align the chip text with the promise, or soften the promise. |
| M5-14 | Minor (wording, A25) | `project/practice/handoffs.ts:26,34` (rendered by M5-edited `Handoff.tsx:48,54` on Lab and Examples) | Students still see "goals MGO-002 onward optional" and "the mission or a goal". The `week1-m5` leak block scans only practice surfaces. | Change the wording to "objectives". Add the handoff panel to the scan. |
| M5-15 | Minor (workload) | `content/week1Path.ts:140,182` vs `Overview.tsx:39`, `tasks.ts:142` | Practice is 96 min (1.6 h) on the Overview and the task list, but `WORKLOAD.practiceHours` still computes 1.1 h from the retired missions m1–m4 (Examples page and workload text). The builder acknowledged this as open item 4. It does not affect the A26 required 8.1 h, because practice is optional. | Derive `practiceHours` from `PRACTICE_MINUTES`. |
| M5-16 | Minor (pedagogy vs A25(3)) | `TaskViews.tsx:373,386`; `tasks.ts:91` | The GP-3 register row requires influence 1–5 with a reason. A25(3) makes **interest required (with a short reason)** and support and influence optional in the student register. Spec §e.2 predates A25. Practice therefore rehearses a different required field from the one the lab requires. | Ask faculty (F-2). The default is to ask for interest with a reason, and keep influence optional. |
| M5-17 | Minor | `TaskViews.tsx:286-294, 241` | On GP-2 exchanges, the per-system reading and "Agrees" update live once `exchangesCheckedAt` is set, with no new Check. A changed direction keeps its earlier acknowledgement. A first failed check followed by later edits reveals the reading without another Check. | Snapshot the directions at Check, as `runCheck` does. Clear the acknowledgement when the direction changes. |
| M5-18 | Minor | `GuidedPractice.tsx:98-102,128-129` | The reset status ("GP-1 reset…") stays visible after moving to another task. Step changes are not announced, and focus is not moved to the step heading. | Clear the status on task change. Focus `h2.gp-h2` (`tabIndex=-1`) on step change. |
| M5-19 | Nit | `TaskViews.tsx:506` | The GP-4 reasoning header shows "STK-010 → STK-005" (IDs) where the table shows names. | Use the names. |
| M5-20 | Nit | `store.ts:141-147` | If `w1.practice` contains unparseable JSON, `loadJSON` returns null and migration runs again. Answers cleared by "Reset all" then come back. This is unlikely. | Tell a missing key apart from a corrupt one: use `localStorage.getItem !== null`. |

## Areas checked that passed

- **Migration and reset isolation (item 1).** `store.ts` only reads `wb-artefacts`, `mission-progress` and `boundary`. It writes only `w1.practice`. Unit tests and the browser run both show the legacy keys and the team record byte-identical after migration, per-task reset and reset-all. The project in IndexedDB or on the server is never touched by practice code.
- **Copy flow.** It is the only path: the old CopyDialog is removed, and `TemplateCopy` is used on GP-3, GP-5, the GP-6 handoff and the Lab. It produces one `store.apply` change set with source `practice-copy`, which is in `MEMBER_SOURCES`. Every created item carries `copied-from-practice` provenance with `adapted:false`. Ratings, reasons, interest and support are not copied (`ratings:false`). STK copies carry role, side and `approving` classification only. They cannot reach the enterprise approval fields, which `screenMemberOps` refuses on ENT/Milestone. Offline and server mode share the path.
- **Coverage of §11 (item 2).** All required items are covered:
  - boundary and external systems: GP-2
  - identify and classify stakeholders: GP-1, GP-3
  - concerns, conflicts and relationships: GP-4
  - draft needs: GP-5
  - needs linked to objectives: GP-6
- **Learn links.** Each task's "Learn this" links to Learn sections rather than repeating prose.
- **Feedback wording.** The feedback model never scores, and "Attempted" never needs agreement (`feedback.test.ts`). The "defensible" sentences are thoughtful and at graduate level.
- **Case facts spot-checked against `aerolinkCase.ts`:**
  - Counts: 15 stakeholders + 3 non-stakeholders = 18; REL-001…008; CON-001…017; NEED-001…017; MGO-002/003/004/009.
  - GP-6 links match the data: NEED-001→002, 003→003, 004→002, 007→009, 010→004, 012→003.
  - GP-4 types match the data: REL-003 supplies, 001 regulates, 007 affected-by, 005 coordinates-with, 008 partners-with.
  - Conflict REL-002, CON-012 vs CON-006, `sharedVariable`, DELIBERATE_GAP STK-011 — all match.
  - The facts-panel counts are typed into strings rather than computed (nit). They match the data today.
- **Internal codes.** No internal codes appear on practice surfaces.

## Faculty items

- **F-1.** Review the instructor-authored reasoning and "defensible" sentences in `tasks.ts`, in particular:
  - the EXT-001 "both directions" reading, which adds "flight intent out" beyond the case's `exchange` text;
  - EXT-002 "in";
  - the REL-008 "partners-with" rationale;
  - the STK-010|STK-003 "defensible second tension" (the instruction says "one pair").
- **F-2.** A25(3) versus the GP-3 row: should practice require interest (with a reason) instead of influence (M5-16)?
- **F-3.** A25(1) asks for an explicit realism note: "the regulator is real; AeroLink and its numbers are fictional". The practice banner says only "Fictional teaching case", yet GP-1 and GP-3 use the FAA. Should the banner carry the note?
- **F-4.** Practice workload is 1.6 h (optional, outside the 8.1 h of A26). Confirm, and confirm that `week1Path` should show the same figure (M5-15).
- **F-5.** At 390 px the relationship map is hidden and only the table is shown (M5-11). Is that acceptable?
