# Week 1 M7 (Week 1 → Week 8 continuity): independent review

Date 2026-10-22. Reviewer: independent adversarial review (read-only; nothing committed, no source edited; temporary
mutations and probe tests were reverted and checked with `diff` against backups).
Scope: the uncommitted M7 diff listed in the brief (Week 10 files ignored).

## Verdict: REVISE

There are no blockers. The core claims hold:
- The skeleton is the same for a file import and a project read.
- Mappings persist and are never renumbered.
- Drift is shown and nothing is dropped.
- Cross-team access gets 404 and instructor writes get 403.
- Approval is not affected.
- The signed-off Week 8 flow is still green.

Five moderate findings need fixing before sign-off:
- provenance trusts the browser (M7-1);
- crash on malformed mapping data (M7-2);
- a false "course working mapping" label in the preview (M7-3);
- an optimistic success message (M7-4);
- an untested "gap wins over Mapped" claim (M7-5).

## Findings

| ID | Severity | File:line | Evidence | Fix |
|---|---|---|---|---|
| M7-1 | moderate | `server/services/memberOps.ts:45,59`; `server/services/projects.ts:296-308` | The report and UI show provenance as "confirmed by, when, which change", but the server stores `mapping.confirmedBy` exactly as the browser sent it. `stampCreates` re-stamps only created artifacts and relationships. The server's own ctx is `{by: p.user.initials, change: CHG-n}`, but it is never applied to mappings. Result: a client can write any `by`/`at`, and `change` is the browser's guessed CHG number, which can differ from the server's CHG for that change set (batched saves, teammate writes in between). `week8Mappings.test.ts:44` asserts `by: 'AA'` only because the client sent `AA`. | In the server write path, overwrite `confirmedBy` on every `upsert-mapping` that carries one with the server ctx (`{at, by: p.user.initials, change}`). Add a server test that sends `confirmedBy.by: 'ZZ'` and `change: 'CHG-999999'` and expects the server values back. |
| M7-2 | moderate | `src/project/adapters/week8.ts:98,144` (`clip(mapping.source!.title)`); `src/project/transfer/importProject.ts:157` | Probe test (deleted afterwards): a mapping whose `source` has no `title` makes `mappingViews` **and** `buildPreview` throw `TypeError: Cannot read properties of undefined (reading 'normalize')`. A non-string `title` throws `s.normalize is not a function`. So the Week 8 preview page (`#/project/model`) and the lab tool crash. `importProject` passes mappings through unvalidated (`{...x}`), so an Import Project file with a hand-edited or legacy mapping reaches this path. The server import goes through the same pipeline. | Make the readers defensive: `typeof m.source?.title === 'string' ? … : ''`, and treat `source` that is not `{id: string}` as absent. Ideally also normalise mappings in `importProject` (reuse `normMapping`'s shape). Add a unit test with `source: {id}`, `source: 'x'` and `title: 5`. |
| M7-3 | moderate | `src/project/adapters/week8.ts:53` (`statusOf`, mapped branch); `src/project/pages/ModelPreview.tsx:151` | For a team-chosen **custom** package, the preview reason reads "Mapped by your team … package Context, course working mapping." That is false: Context is not the course mapping for STK, and `rule === 'custom'`. Demo E does this exact case (STK-002 → Context, "Regulator"). The detail line under it still says "Target: … in package Stakeholders (course mapping)" with no mention of the team's different choice. CNT-12 is about labelling the course working mapping honestly. | When `mapping.rule === 'custom'`, say "package Context, chosen by your team instead of the course working mapping (Stakeholders): ‹reason›". Show the team's package next to the course target in the detail. Add a unit assertion. |
| M7-4 | moderate | `src/workbench/week8/ProjectSource.tsx:120-127,145-146` | `handle.apply` is a local optimistic commit (`ProjectStore.apply` sets state synchronously; the save is async). The tool immediately shows "✓ STK-002 mapped to package Context in My Project." (`role=status`). Directive §15 says: "Never show success unless the persistence layer confirms it." If the server later refuses the write (409 conflict, integrity error, `upsertProblem` MAP collision when two teammates confirm at the same time), the ✓ message stays. Only the separate save line turns to "Not saved". | Word the message as pending ("STK-002: mapping recorded, saving…"), or drop the ✓ and let the save line (which is truthful) carry success. Alternatively, show ✓ only after `save.kind === 'saved'` for a revision ≥ the applied one. |
| M7-5 | moderate | `src/project/adapters/week8.ts:50-53`; `e2e/demo-e-continuity.e2e.ts:187-190` | The report (§1, §4.4) claims "an audit gap or defect still wins (a confirmation never hides a gap)". Mutation `if (block && !views.get(uid))` (team confirmation overrides the gap) **survived**: `npx vitest run src/project src/workbench/week8` → 240/240 pass. The e2e comment claims to check this, but it asserts only `count of [data-status="mapped"] > 0`. | Add a unit test: confirm a mapping on an item with a blocking finding (e.g. a REL with an unregistered end, or a STK with an empty name), and expect `invalid-or-incomplete`. Optionally assert it in Demo E. |
| M7-6 | minor | `src/project/adapters/week8.test.ts:33-56` | Two of the three "golden equality" unit tests compare `toTeamRecord(doc)` → `sourceFromTeam` with `toTeamRecord(doc)` → JSON → `importFile`. Both sides share `toTeamRecord`, so a lossy projection passes them. Mutation: `of('NEED').slice(1)` in `adapters/week1.ts:73`. Both equality tests still passed. It was caught only by the pinned-golden test and the DOM test (`ProjectSource.test.tsx:43`, which uses the real `teamModelInputs(TEAM_FIXTURE)` file). So the claim holds overall, but these two tests do not prove what their names say. | Compare against `importFile(JSON.stringify(teamModelInputs(TEAM_FIXTURE, …)))`, the file a student actually exports, instead of a file rebuilt from the project. |
| M7-7 | minor | `src/project/adapters/week8.ts:81`; `src/workbench/week8/skeleton.ts:515` | A project read writes "Generated by the Week 8 lab tool on … from Week 1 model inputs, version 3." into the `.sysml` header. The student never made a file, and an instructor reading the submitted `.sysml` cannot tell it came from My Project. This is disclosed (report §4.1), and the screen and matrix carry the provenance, so it is not a SysML claim. It is still slightly misleading. | Option: keep the model body byte-identical, and let only line 2 differ ("from My Project “X”, revision n, read as Week 1 model inputs, version 3"). Make the golden compare all lines except line 2. Otherwise, faculty should accept the current wording explicitly. |
| M7-8 | minor | `src/project/adapters/week8.ts:117` (`WEEK8_PACKAGES`) | The package select offers every distinct `pkg` in `MAPPING_KINDS`, which includes "owned by what it measures" (MOE/MOP/TPM). That is not a package, but a student can pick it for STK-001. `normMapping` accepts any string of 200 characters or fewer. | Filter out non-package entries (or keep an explicit package list), and validate `pkg` against it on the server. |
| M7-9 | minor | `src/workbench/week8/ProjectSource.tsx:160-164` | Uses raw `readOnly`, not `showReadOnly()` (`ProjectStore.ts:28`). So "My Project is open read-only in this tab… Close the other tab" flashes while the Web Lock is still `acquiring`. It is also wrong for the other read-only causes, such as a server conflict, where `readOnlyReason` says something else. The buttons are correctly disabled. | Use `showReadOnly(handle.state)` and show `handle.state.readOnlyReason`. |
| M7-10 | minor | `src/workbench/week8/state.ts:396-397`; `ProjectSource.tsx:59,78` | Probe: corrupt saved state `{source:'project', projectRef:'junk'}` normalises to `source:'project', projectRef:null`. The My Project radio is then checked, but no project info appears and there is no "Read My Project again" button. Clicking a radio that is already checked fires no change event, so the student must click File and then My Project. It does not crash. | In `normalizeState`, fall back to `source:'file'` when `projectRef` is null. Or show the re-read button whenever `source === 'project'`. |
| M7-11 | minor | `src/workbench/week8/week8tool.css:109` (`.w8-scroll`); `ProjectSource.tsx:208-210` | The new table puts an `sr-only` (position:absolute) caption inside `.w8-scroll`, which is not positioned. This copies the signed-off matrix table. At 400 px, `scrollWidth ≤ innerWidth` passes today, because the caption sits at its static position. It is still the fragile pattern the course rules flag. | Add `position: relative` to `.w8-scroll`. |

## What I verified

- **Builds and suites (current tree).**
  - `npx tsc -b`: no errors outside the Week 10 files, which another agent is writing.
  - `npx vitest run src/project src/workbench/week8`: 17 files, 240 tests passed.
  - `npx vitest run -c vitest.server.config.ts`: 16 files, 383 tests passed.
- **Playwright, default config** (lock `_source_cache/.playwright.lock` = "m7-review", removed afterwards):
  - `week8-project-source.spec.ts`, `week8-flow.spec.ts` (signed-off Week 8, all 7 green) and `project.spec.ts`: 21/21 passed.
  - These include axe light and dark at 1440 and 400 px, no sideways scroll at 400 px, and the second-tab read-only/take-over test.
- **Playwright, server config.** `demo-e-continuity`: 1 passed (35 s).
- **Cleanup.**
  - The `screenshots/project-demo/*` files rewritten by my run were restored with `git restore`, and the generated `demo-export.json` was deleted.
  - The 11 screenshots that were already modified were left untouched.
  - Other agents' new or changed files (Week 10, `app.spec.ts`, `playwright.lectures.config.ts`, `build-lab-md.mjs`, `shortAnswers.test.ts`) appeared during the review and were not touched.
- **Mutations** (each reverted; files diff-checked against backups):
  - Renumber MAP on every confirmation: caught by unit.
  - Drop "removed" rows from `mappingViews`: 3 tests caught it.
  - Accept "n/a" as a reason for a custom package: caught by DOM.
  - Server drops `source` from `normMapping`: caught by server test.
  - Lossy `toTeamRecord`: only the golden file and DOM test caught it (M7-6).
  - Confirmation overrides an audit gap: **survived** (M7-5).
- **Byte identity.**
  - `ProjectSource.test.tsx` compares the preview text from a project read with the text from the real Week 1 file `teamModelInputs(TEAM_FIXTURE)`.
  - The pinned golden pins the file-import text.
  - `skeleton.ts` is unchanged.
  - Both paths end in `sourceFromTeam`, so the claim holds.
- **Mapping persistence.**
  - Reload persistence is covered by unit (store reload), e2e offline (IndexedDB) and Demo E (server, teammate).
  - Re-confirmation keeps uid and ID. The server also refuses an ID change (`upsertProblem`), and IDs are never reused after a withdrawal.
  - Renamed, changed, removed (kept, can be withdrawn) and added items are all shown. No path deletes a mapping.
  - Legacy saved state without `source` normalises to `file`.
  - Corrupt project mapping data: crash (M7-2). Corrupt tool state: degraded (M7-10).
- **Server.**
  - `upsert-mapping` goes through `normOp` → `normMapping` (allow-listed; `pkg` ≤200, `source.id` 1–20, `title` ≤2000, `projectRev` an integer; unknown fields in the mapping and in `source` dropped).
  - The `POST /projects/:id/changes` path is authorized per project: cross-team gets 404 and instructor writes get 403 (server test, nothing stored).
  - There is no path to another team's project: `mapping.artifact` is free text but only within the authorized document.
- **M6 approval.**
  - Mappings are not in `APPROVAL_MATERIAL_FIELDS` (ENT/MGO/PRT/EXT fields only), so mapping edits never move the material hash.
  - A member change set that alters the approval fingerprint is still refused (`projects.ts`, `approvalFingerprint`), so there is no bypass.
- **Truthfulness.**
  - Storage labels match the real adapter: "saved on the course server", "saved in this browser", "not being saved by this browser".
  - The save line maps the store's real save state.
  - No live-sync claim was found: the tool reads on an explicit click and flags "changed since you read it".
  - Exceptions: M7-4 and M7-7.
- **Student text.**
  - No internal codes in the new student-visible strings; the codes appear only in comments.
  - New font sizes are 13–15 px.
  - Empty versus short reasons use `src/workbench/emptyAnswer.ts` (`isEmptyAnswer`): "n/a" is refused and "Regulator" accepted, checked in the DOM test and Demo E.
- **Week 8 regressions.**
  - Section "4b" is inserted without renumbering.
  - File stays the default, and the file input is hidden only while My Project is chosen.
  - With no project, the My Project option is disabled with a reason (test).
  - The preview keeps "Invalid or incomplete" ahead of Mapped in the code, but no test covers it (M7-5).
  - The ProjectStore Web Lock is unchanged: the provider is app-wide (`state/Providers.tsx`), so M7 adds no new lock holder, and read-only tabs disable every write button.
