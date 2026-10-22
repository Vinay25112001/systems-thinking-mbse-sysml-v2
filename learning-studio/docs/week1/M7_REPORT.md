# Week 1 reconstruction, Milestone M7 (Week 1 → Week 8 continuity): report

Date 2026-10-22. Controlling spec: directive §14 (continuity), §18 M7, §19 Demo E; `docs/week1/spec/WEEK1_DESIGN_SPECIFICATION.md`
§k.1–§k.3 (CNT-01, CNT-02, CNT-10 … CNT-12); `WEEK1_CHANGE_IMPACT_MATRIX.md` X11; `PROJECT_DATA_SCHEMA.md` §11.
Nothing is committed. No acceptance row is claimed PASSED: the matrix rule needs the runs recorded in `TEST_REPORT.md`.
X15 (Week 2 reading the project instead of the legacy mirror) was not touched.

## 1. What was built

| Area | Change | Files |
|---|---|---|
| Source choice | The Week 8 lab tool now offers two Week 1 sources, chosen by the student with a radio group: **My Project** (the team's project from the project store: IndexedDB in this browser, or the course server project when signed in) or **a Week 1 model-inputs file** (unchanged, still the default, so existing behaviour and tests are untouched). With My Project the tool shows the project name, team, revision, where it is saved, when it was read and when the project was last saved. Going back to a file clears what came from the project, so the two sources are never mixed. With no project, the option is disabled and the reason is given | `src/workbench/week8/ProjectSource.tsx` (new), `Week8LabTool.tsx`, `state.ts` (`source`, `projectRef`; normalised on load) |
| Same skeleton | `week8SourceFromProject(doc)` builds the generator input from the same projection the Week 1 model-inputs export uses (`toTeamRecord`, unadapted AeroLink practice copies left out). The skeleton is byte-identical to a file import of the same data (golden test), and the file-import skeleton is pinned to a golden file so it cannot drift. `skeleton.ts` is unchanged | `src/project/adapters/week8.ts`, `src/project/__golden__/week8-skeleton-fixture.golden.sysml` |
| Package per Week 1 ID | New section "4b · Package for each Week 1 ID (saved in My Project)": one row per active Week 1 item (ENT, PRT, EXT, STK, CON, MGO, NEED, live REL). It shows the course working mapping, a package select (default: the course package), a reason, the status and a Confirm button, plus "Confirm the proposed package for every unmapped ID". A package other than the course one needs a reason; empty answers ("n/a", "none", …) are refused through `src/workbench/emptyAnswer.ts`; a short real reason ("Regulator") is accepted. A save line shows the store's real save state ("Saved on the course server at …") | `ProjectSource.tsx`, `week8tool.css` |
| Persistence and provenance | Each confirmation is one `upsert-mapping` operation through the project store (`ProjectStore.apply`), so in server mode it goes through `POST /projects/:id/changes`, `project.write` and `authorize()`. Record: `MAP-nnn` (never renumbered; a re-confirmation keeps uid and ID; a new one takes the next never-issued number), `status: mapped`, `rule` (the prefix, or `custom`), `pkg`, `statusReason`, `confirmedBy` (who, when, which change), `sourceRevision` (the item's revision), `source: {id, title, projectRev}`. `pkg` and `source` are new optional fields (additive; the server's `normMapping` allow-lists and validates them) | `src/project/model/types.ts`, `server/services/memberOps.ts`, `PROJECT_DATA_SCHEMA.md` §11 |
| Change since mapping | `mappingViews(doc)` compares every stored mapping with the live item: **renamed** (ID or name differs from the confirmed one), **changed** (newer revision), **removed** (item retired or gone; the mapping is kept and offered for withdrawal, which keeps the record as "not mapped"), **added** (created after the first mapping and not mapped yet). Shown in a "What changed in My Project since you made your mappings" box and per row. No mapping is ever deleted or silently dropped. Separately, "My Project has changed since you read it (revision a → b)" appears when the Week 1 content of the project differs from what was read; the team's own mapping writes, which also raise the revision, do not trigger it | `src/project/adapters/week8.ts`, `ProjectSource.tsx`, `Week8LabTool.tsx` |
| Week 8 preview | Kicker renamed to "Week 8 preview: how your Week 1 records will be modelled" (CNT-11); the enterprise name is shown; the banner says an item shows as Mapped only after the team confirms it in the Week 8 lab tool (linked); a team-confirmed, unchanged mapping shows **Mapped**, a changed or renamed one **Needs review**; an audit gap or defect still wins (a confirmation never hides a gap); the selected item's detail lists its Week 1 traceability with the §14 labels (e.g. "CON-001 motivates NEED-001 (concern motivates need)") | `src/project/pages/ModelPreview.tsx`, `src/project/adapters/week8.ts` (`buildPreview`) |

No new SysML claim: the mapping records are the team's decisions beside the skeleton; the generator does not read them.
Student text carries no internal codes; new text is 13–15 px; indigo `#3d4ac4` (dark `#9aa4ff`) marks My Project, the
same token pair as `project.css`.

## 2. Demo E (directive §19 E) as run

`e2e/demo-e-continuity.e2e.ts`, server config (`playwright.server.config.ts`, real course server, throwaway accounts,
two browser contexts):

1. Student A creates "Harbour Bike Share Cooperative" on the course server and records mission, an objective, two
   stakeholders, a concern, a need (sources, concern, objective) and a stakeholder relationship.
2. **E1** opens the Week 8 preview (`#/project/model`). **E2** the enterprise name is shown. **E3** ENT-001, MGO-001,
   MGO-002, STK-001, STK-002, CON-001, NEED-001, REL-001 are visible. **E4** proposed statuses and the course working
   mapping target ("in package Stakeholders (course mapping, Week 8)"); nothing is Mapped yet. **E5** NEED-001's
   traceability: "STK-001 expresses NEED-001", "CON-001 motivates NEED-001", "NEED-001 supports MGO-002" with labels.
   **E6** no AeroLink name or AeroLink stakeholder in the page. axe: no serious or critical violation.
3. In the Week 8 lab tool A chooses My Project: name, revision, "saved on the course server", read and saved times;
   the skeleton names the enterprise. An empty reason is refused, "Regulator" accepted (STK-002 → Context, MAP-001),
   then every other proposed ID is confirmed; "Saved on the course server". axe on the tool: clean.
4. Reload: the source choice and all mappings persist, MAP-001 unchanged.
5. Teammate B, separate session, reads the same project and sees the same mappings.
6. The preview now shows team-confirmed items as Mapped.
7. A renames STK-002 in My Project; the tool shows the rename ("“City streets office” is now “City transport office”"),
   the row as renamed with MAP-001 kept, and "My Project has changed since you read it". Confirming again clears the
   review; "Read My Project again" clears the notice and the skeleton shows the new name.

**Status: passes** (1 test, 16.6 s, 2026-10-22).

## 3. Test evidence (current tree, 2026-10-22)

| Gate | Result |
|---|---|
| `npx tsc -b` | clean (after the review fixes) |
| `npx vitest run` | 157 files, 3602 tests passed (after the review fixes; the total includes other streams' new tests) |
| `npx vitest run -c vitest.server.config.ts` | 16 files, 384 tests passed |
| New unit tests | `src/project/adapters/week8.test.ts` (15, 5 added for the review: golden equality field by field and text for three option sets and through `derive`, pinned file-import golden, a partly written project; MAP provenance, stable IDs, no reuse after withdrawal; renamed / changed / removed / added; withdraw keeps the record; isolation of unadapted practice copies) and `src/workbench/week8/ProjectSource.test.tsx` (10, 5 added for the review: source choice and display, same text as a file, empty answer refused and short answer accepted, persistence across a store reload, change report, file fallback, no-project state) |
| New server test | `server/test/week8Mappings.test.ts` (4, server stamping added for the review: member write with provenance, teammate reads it, re-confirmation keeps the ID; another team 404 read and write, instructor 403, nothing stored; malformed `source`/`pkg` refused, unknown fields dropped) |
| Mutation check | Pointing `week8SourceFromProject` at the preview's origin text makes the three golden tests fail (then restored); comparing the "changed since read" notice on the revision instead of the content makes the reload test fail |
| E2E, server config | `demo-e-continuity.e2e.ts`: 1 passed (18 s, after the review fixes: it also checks that the ✓ appears only after the server confirmed the save, that STK-002 with an audit gap stays Invalid or incomplete after confirmation, and that the preview shows the team's own package) |
| E2E, default config | `week8-flow.spec.ts` 7 passed (unchanged, signed-off flow); new `week8-project-source.spec.ts` 3 passed (IndexedDB source, reload persistence, file fallback, axe light and dark at 1440 and 400 px, no sideways scroll); `project.spec.ts` 11 passed (preview changes) |
| `npm run build:student && node scripts/check-student-build.mjs` | PASS |

Tracked screenshots rewritten by `project.spec.ts` were restored with `git restore` (the 11 screenshots modified before
this milestone were left as they were).

## 4. Decisions the faculty owner should know about

1. **Faculty item: origin line in the generated file (review M7-7, kept by decision).** For the skeleton to be byte-identical, a project read records the same origin
   words as a file import of the equivalent data ("Week 1 model inputs, version 3"): the project passes through the same
   v3 projection. The header comment therefore does not say "My Project"; the tool's screen, the saved workspace and the
   mapping-matrix Markdown ("Source: My Project “…”, revision n") carry the project provenance instead. An instructor
   reading only the submitted `.sysml` cannot tell it came from My Project. Faculty to accept this wording, or ask for
   line 2 alone to differ (the review's option).
2. **File stays the default.** The source is never switched automatically; the student chooses My Project.
3. **Package choice.** Any package name of the course working mapping may be chosen per ID ("owned by what it measures"
   is not a package and is not offered; the server refuses any other value); another package than the course
   one needs a reason. The records are decisions only: they do not change the generated SysML.
4. **Gaps win over Mapped in the preview.** An item the course audit finds incomplete keeps "Invalid or incomplete" even
   after the team confirmed its package.
5. **Two additive optional fields** on `ModelMapping` (`pkg`, `source`); no schema-version change, no migration.
6. **Section number "4b".** The new section sits after the mapping matrix without renumbering the signed-off sections.

## 5. Known limitations

- The tool's package-per-ID table does not show the audit findings per row (they stay in section 5 and in the preview).
- "Added" means created after the team's first confirmation; an item that existed earlier and was never mapped shows
  only as "Not mapped yet".
- A stakeholder relationship has no revision counter, so for REL rows only a change of ends or type (the row's name) is
  detected, not a note-only edit.
- After a save the course server refuses (stale token, password change required, lost access, too large, invalid content), the student recovers through the existing "Save failed" banner and its "Keep my edits as a version and load the saved project" button. There is no automatic token refresh or sign-in prompt for 403 (unchanged since before M7; §6.2).
- Week 2 IDs still come only from a Week 2 model-inputs file (Week 2 does not write the project yet; X15 is open).
- CNT-14 (showing the approved Week 1 baseline next to the live project) is not built.
- Rows stay IN PROGRESS in `WEEK1_ACCEPTANCE_MATRIX.md` until the runs are recorded in `TEST_REPORT.md`.

## 6. Independent review (`_source_cache/review/week1_m7_review.md`: REVISE, no blockers): dispositions

| Finding | Disposition | Evidence |
|---|---|---|
| M7-1 provenance trusted the browser | Fixed. The server's `stampCreates` overwrites `confirmedBy` on every `upsert-mapping` with the session member's initials, the server time and the change set's own CHG, and sets `source.projectRev` to the stored revision the change applies to. The browser adopts the server's document after the save | `server/services/projects.ts`; server test "the server stamps … forged values are overwritten" (forged `ZZ`, `CHG-999999`, 1999 time, revision 4242 are all replaced, also in the recorded history) |
| M7-2 crash on malformed mapping data | Fixed. `src/project/model/mappingShape.ts` (`cleanMapping`) reads every field; a record without a usable uid and MAP ID is left out, a malformed `source`/`pkg`/`confirmedBy`/`status` is dropped or defaulted and reported. Used by the Week 8 views (`week8Mappings`) and by Import Project (warnings in the import report; `issued.MAP` never below the file's numbers). The preview and the lab tool say in plain words that some records could not be read | unit "malformed mapping records never crash…" (`source: {id}`, `source: 'x'`, `title: 5`, object reason, no ID, not an object), "Import Project reads mapping records field by field…", DOM "an unreadable mapping record … never a crash" |
| M7-3 false "course working mapping" label | Fixed. `mappedReason`: a team-chosen package reads "package Context, chosen by your team instead of the course working mapping (Stakeholders). Reason: …"; the preview detail adds "Your team chose package … instead" next to the course target | unit "a package the team chose instead…"; Demo E checks the detail line |
| M7-4 optimistic ✓ | Fixed. The outcome line says "… recorded in My Project. Saving…" until the store reports `saved` after the action, then "✓ … Saved on the course server / in this browser"; a failed or conflicting save shows "✗ … not saved" (`role=alert`); memory storage says "Kept in this tab only (not saved)" | DOM "pending until the store confirms…", "a save that fails…" (mutation: showing ✓ at once fails the first) ; Demo E waits for `data-state=saved` |
| M7-5 untested "gap wins" | Fixed with a test: STK-003 with an empty name stays Invalid or incomplete after the team confirms it, while STK-001 in the same change becomes Mapped. Mutation `if (block && !views.get(uid)?.mapping)` makes it fail (reverted, diff-checked). Demo E asserts it for STK-002 on the server | `src/project/adapters/week8.test.ts` |
| M7-6 circular golden tests | Fixed. The equality tests compare the project read with the file a student actually exports (`teamModelInputs(TEAM_FIXTURE)`), the partial case with the student's own edited record built without the project, and the project read with the pinned golden file. Mutation `of('NEED').slice(1)` in `adapters/week1.ts` now fails all four golden tests (reverted) | same file |
| M7-7 header origin line | Not changed, by decision; listed as a faculty item in §4.1 | — |
| M7-8 "owned by what it measures" offered as a package | Fixed. `src/project/model/week8Packages.ts` derives the package names from `MAPPING_KINDS` (single source) without non-package entries; the server refuses any other `pkg` | unit "the package list holds packages only"; server test (`pkg: 'owned by what it measures'` → 400) |
| M7-9 read-only notice flashed / wrong reason | Fixed. The table uses `showReadOnly()` and the shared `EditAccess` banner (store reason, conflict wording, "Take over editing") | DOM "no read-only notice while the writer lock is being acquired…" (mutation to raw `readOnly` fails it) |
| M7-10 damaged saved state | Fixed. `normalizeState` falls back to the file import when a project source has no readable project reference, clears what came from the project, and the tool shows a one-time notice | DOM "damaged saved state … falls back to the file import with a notice" |
| M7-11 unpositioned scroll container | Fixed: `.w8-scroll { position: relative }` | `week8tool.css`; Week 8 axe and 400 px no-sideways-scroll checks green |

### 6.1 Confirmation review (`_source_cache/review/week1_m7_confirmation.md`: REVISE, one moderate): dispositions

| Finding | Disposition | Evidence |
|---|---|---|
| N1 a non-package `pkg` could enter by import, then every later save failed | Fixed at the source (a); part (b) was **withdrawn**, see §6.2. (a) `cleanMapping` drops a `pkg` that `isWeek8Package` rejects and reports it ("… is not a package of the course working mapping and was left out"); it runs on both Import Project paths, including the server replace import, which uses the same `importProject` pipeline, so such a record is never written back. (b) The save queue: the HTTP adapter now reports a refusal that retrying cannot fix (400, 403, 404, 413) as `rejected`; `ProjectStore` keeps the unsaved edits as a version in History, loads the saved project again, and tells the student "The course server refused this change: … This change was not saved …; later changes save normally" (the shared "Your last edit was not saved" banner). The refused change is never re-sent. 409, 422, 429, network errors and 5xx keep their existing handling. The Week 8 outcome line counts a refusal as a failure, never as ✓. This was a small change (one error kind, about ten lines in `ProjectStore.write`), not a redesign | unit "a package name that is not a package is dropped and reported, on import too…" (mutation: no package check fails it); server test `server/test/rejectedSave.test.ts`: a 400 from the real server is dropped and reported, a version is kept, and the next edit saves (mutation: no `rejected` branch fails it) |
| N2 "not shown" banner listed records that are shown | Fixed. `week8Mappings` separates `skipped` (not shown: no usable ID, or the Week 1 item cannot be read) from `partial` (shown, with the unreadable parts left out); the preview and the lab tool word the two separately | unit "records that are not shown and records shown in part are reported separately"; DOM test checks both banners |
| N3 Engineering Report heading said "(not yet confirmed)" | Fixed. The heading is now "Week 8 mapping preview", followed by "Mapped: confirmed by the team in the Week 8 lab tool (n). Every other status is a proposal or a gap, not yet confirmed." or "No mapping is confirmed yet …" | unit "the Engineering Report heading tells confirmed from unconfirmed mappings" |
| N4 a dropped record's MAP number could be reissued | Fixed. Import raises `issued.MAP` from every well-formed MAP ID in the file, including records it left out | unit "a dropped record with a well-formed MAP ID still raises the counter…" (MAP-007 dropped → the next mapping is MAP-008; mutation: kept-only bump fails it) |

Re-run after these fixes:
- `tsc`: no errors outside the Week 10 and 11 files, which other streams are still writing.
- vitest: 157 files, 3606 tests passed. Server vitest: 17 files, 385 tests passed.
- Demo E: 1 passed. `week8-flow`, `week8-project-source` and `project.spec`: 21/21 passed.
- `build:student` and the leak check: PASS.

### 6.2 Second confirmation (BLOCK on the `rejected` save path): the automatic drop is withdrawn

The reviewer reproduced data loss against the real server. A stale CSRF token (403) was classed as `rejected`. The History write failed and that failure was swallowed. The reload then cleared the outbox, and the tool showed "saved". The edit was gone.

**Decision: revert to the previous behaviour.** Doing it properly needs all of the following:
- a token refresh and retry;
- password-change and lost-access handling, each keeping the outbox;
- a 413 path;
- a History write that is confirmed before any reload;
- re-sending the valid change sets of a refused batch.

That last item needs a server API change. A 400 from the server's `normOp` (bad-request) does not say which change set failed: `clientChangeId` comes only with integrity errors, and the server refuses the whole batch at once. Together this is more than about a day of careful work on the save path, so the coordinator's fallback applies.

| Item | Now |
|---|---|
| `rejected` error kind and the store branch | Removed. `src/project/store/ProjectStore.ts` and `src/project/store/adapter.ts` are back to HEAD (no diff) |
| 400 `bad-request`/`integrity` from the course server | Still the existing `write` path: one retry, then "Save failed". The edit stays in the tab and in the outbox. The message is now plain: "the course server refused this change, so it was not saved (…). Your edits are still here: use “Keep my edits as a version and load the saved project” to continue". That existing EditAccess recovery writes the version first, then loads the saved project. Every other status (401, 403, 404, 409, 413, 422, 429, 5xx, network) is unchanged |
| What stops a bad value at the source | N1 (a): `cleanMapping` drops a non-package `pkg` on both import paths. The tool only offers real packages (M7-8) |
| The Week 8 outcome line | A failed save shows ✗ "not saved", never ✓ (unchanged, M7-4) |
| Test | `server/test/rejectedSave.test.ts`, rewritten against the real server. A 400 gives `save.kind = error` with the plain message. The edit is still in the document, `hasUnsaved()` is true, and the outbox still holds it; no version is written automatically. The recovery (`takeOver`) then writes exactly one version, the saved project is loaded, and the next edit saves |

Reviewer cases, checked against the code:
- **403 `csrf`, 403 `password-change-required`, 403/404 lost access, 413:** they now take the same path as before M7, `write`. Nothing is discarded and the outbox is kept. The message is the server's own.
- **Still open, unchanged since before M7:** none of these four cases offers the specific recovery the coordinator listed (token refresh, sign-in prompt, read-only with Export). That needs separate save-path work and is listed as a limitation.

Runs after the revert:
- `tsc`: no errors outside the Week 10 and 11 files.
- P0 lock tests `lock.test.tsx`: 15/15.
- vitest: 3590 passed, 19 failed. All 19 failures are in Week 10 files another stream is writing: `sysmlWeek10.test.ts`, `week10Lab.test.ts`, `timing.test.ts`, `week10FigureKit.test.ts`. Every M7 test passes.
- Server vitest: 17 files, 385 passed.
- Demo E: 1 passed. `week8-project-source` and `week8-flow`: 10/10 passed.
- `build:student`: built. The leak check now fails on one missing faculty-notes marker from `src/content/lectures/week10/session2.ts` (Week 10, another stream, still being written), even after rebuilding `dist/`. Its student side reports no course-server markers. No M7 file affects the decks.
