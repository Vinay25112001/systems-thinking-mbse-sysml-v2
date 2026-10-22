# Week 1 M6 confirmation review (fixes for `week1_m6_review.md`)

Date 2026-10-22. Reviewer: independent, adversarial, read-only. I edited no source file, ran no git operation and installed nothing. Scope: the dispositions in `learning-studio/docs/week1/M6_REPORT.md` §7 for H-1, M-1 to M-6 and the Lows. Week 9 and M3 publishing are out of scope.

## Verdict

**CONDITIONAL, with a narrow condition. Every original finding (H-1, M-1 to M-6, L-1, L-2) is confirmed fixed as specified.** Each was checked in the code and with a probe.

The fix for H-1 still has a hole: the course server can reissue a snapshot ID. Probing it found two new Medium defects:

- **N-1:** "Undo this import" can still restore the wrong version. This happens if a member deletes the import's pre-import version in History; the import record then points at a version created later.
- **N-2:** a cross-project collision on the import id causes an HTTP 500. In the browser, the save then fails on every retry.

Both fixes are small. Re-confirm N-1 and N-2 with a probe and the review is signed off. The Lows below do not block.

## Runs (current tree, 2026-10-22)

| Check | Result |
|---|---|
| `npx tsc -b` | **Exit 0**, no errors. The Week 9 errors from the first review are gone. |
| `npx tsc -p tsconfig.server.json --noEmit` | Exit 0 |
| `npx vitest run` (app) | 146 files, **3318 passed**, 0 failed |
| `npx vitest run --config vitest.server.config.ts` | 15 files, **376 passed** |
| Throwaway server | Started with `node server/run.mjs serve` and `SLS_MODE=test`, on port 51739, chosen at random. Data dir: `C:\Users\w451vxs\AppData\Local\Temp\claude\C--Users-w451vxs\d2f69355-808b-4b69-b891-131c6cae6c93\scratchpad\m6confirm\data`. Two `test-fixture` runs gave 2 teams, 2 instructors and 4 students. The server was killed after the probes, the port is free again, and the data dir was deleted. The default data dir was never touched. |
| Probe scripts | Kept in the same scratchpad folder: `srvprobe.ts`, `probe2.ts`, `dbprobe.mjs`, `xmlprobe.ts` and `xlsxlimits.ts`, run with `jiti` and `node:sqlite`. The output is in `srvprobe.out`. |

No Playwright run was made.

## Per-finding table

| ID | Status | Evidence (file:line) | Probe result |
|---|---|---|---|
| **H-1** | **Fixed, but N-1 and N-3 remain** | **Server, merge or replace import:**<br>• `server/services/projects.ts:295-297` calls `preImport`.<br>• `:368-392` writes a `pre-import` snapshot labelled `Before import CHG-…`, plus an `import_records` row keyed by the browser's `attributes.import.importId`.<br>• `server/services/submissionRoutes.ts:191-200` adds `GET /projects/:id/imports/:importId`.<br>**Client:**<br>• `src/project/canvas/ExcelImport.tsx:89-90` makes a fresh UUID for each import.<br>• `:109-118` undoes exactly that record's snapshot; with no match it explains and restores nothing.<br>• `:126-130` asks first when the project has changed since the import (L-7).<br>**Browser storage:** `src/project/store/ProjectStore.ts:526-531` returns its own `preImport` id and writes no client snapshot in http mode.<br>**Client snapshots:** a client `pre-import` is still stored as `manual` (`projects.ts:37,439`). | **Two imports with edits between:**<br>• Import 1 got SNP-002 (rev 1, the same rev as before import 1, only ENT and MGO).<br>• Import 2 got SNP-003 (rev 3, the same rev as before import 2, with STK-001 and B's edit).<br>• Undoing the second import gave {ENT, MGO, STK-001, B's edit}. Undoing the first then gave {ENT, MGO, empty description}. Both are exact.<br>**Project created from an imported file:**<br>• SNP-001 is `pre-import`.<br>• A manual version was saved, then an Excel import made.<br>• The import's target is SNP-003 (rev 1, as expected), never SNP-001.<br>**Other checks:**<br>• Unknown import id: 404.<br>• Another team reading the import: 404.<br>• A client posting `kind:'pre-import'`: stored as `manual`. |
| **M-1** | **Fixed** | `src/project/xlsx/xml.ts:101-118`: one pass that tracks the opening quote character. `check()` is called every 64 K characters inside a tag (`:116`), and a tag is capped at 1 MB (`:115`). | **Accepted:**<br>• Sheet `Stakeholders' register`.<br>• `Members' "quoted" list`.<br>• A `dataValidation` with `prompt="Rate 1-5 > don't…"`, `promptTitle="Don't guess"` and `error='Use a "number"'`.<br>• A single-quoted attribute containing `"`.<br>All read correctly.<br>**Linear time:**<br>• 10 k attributes in one tag: 17 ms. 40 k attributes (658 KB): 54 ms.<br>• 200 k tags with mixed quotes: 139 ms.<br>• An unclosed value with 200 k `>`: refused in 1 ms. A closed one: 4 ms. The first review measured 965 ms.<br>• A tag over 1 MB: refused.<br>• The deadline `check()` fires inside a long tag. |
| **M-2** | **Fixed** (one wording issue, see N-5) | **Server:**<br>• `server/services/submissions.ts:113` runs `validationReport(reviewModel(cur.doc,…))` on the frozen document.<br>• `:117` stores `{server, reportedByBrowser}`.<br>• `:54-60` derives `validationMismatch`.<br>**Instructor page:** `src/auth/SubmissionReview.tsx:147-156` shows the server's count and flags a mismatch. | A forged `headline {7,7}` on an almost empty project returned 201. The stored and shown result was `{meets:0, required:7}` with `reportedByBrowser {7,7}` and `mismatch:true`. The instructor queue showed the same. A `validation` sent as an array was refused with 400. |
| **M-3** | **Fixed** | **Server rules:**<br>• `submissions.ts:24`: `MAX_PER_WEEK 10`, `MIN_INTERVAL_MS 60 000`.<br>• `:109`: an unchanged SHA-256 answers 409.<br>• `:110`: a second submission within a minute answers 429.<br>• `:111`: the cap counts superseded submissions too.<br>**Quota:** `server/repo/sqlite.ts:213-217` leaves `proposal` and `submission` out of `snapshotUsage`.<br>**Queue:** superseded submissions are hidden by default (`submissionRoutes.ts:221-223`). | **Real server:**<br>• An unchanged resubmission: 409 "Nothing changed…".<br>• A changed one within a minute: 429.<br>**Cap and quota (clock-driven, in `server/test/submissions.test.ts:149-229`):**<br>• The 11th submission answers 409.<br>• `usage.count` equals all snapshots minus kept ones.<br>• Both pass in the suite run above.<br>A note on the cap is under Info. |
| **M-4** | **Fixed** | **Server:**<br>• `submissions.ts:73` requires an integer `rev`.<br>• `:103` answers 409 when `cur.doc.rev !== b.rev`.<br>**Client:**<br>• `src/week1/review/ReviewSubmit.tsx:122-128` refuses to submit when the save is pending, saving, error, conflict or unsaved.<br>• `:132` sends `rev`.<br>• `:138` polls after a 409. | A stale `rev` gets 409 "Your project changed since you reviewed it (you reviewed revision 9; it is now revision 10)". A request with no `rev` gets 400. |
| **M-5** | **Fixed** | `src/week1/guidance/fieldGuidance.ts:99`: the `con.conflict` example is `CON-012` (Community noise) against `CON-006` (Pad throughput and charging capacity), read from `aerolinkCase.ts:215,221`, with caseRef `CON-012, CON-006`. | Code check. `canvas.test.tsx` M-5 passes. |
| **M-6** | **Fixed** | **Live region:**<br>• The `aria-live` is gone from the guidance `<dl>`; `canvas.test.tsx:96` asserts it.<br>• One polite line remains: "Guidance available for X." (`Panel.tsx:268-271`).<br>**Narrow screens (below 1200 px):**<br>• Bare table cells get an (i) button (`ctx.tsx:231-238`, `.cv-info-narrow`, `canvas.css:550,581-587`).<br>• The button opens a bottom sheet that takes focus (`Panel.tsx:221-248`) and returns focus on Close or Escape (`ctx.tsx:101-110`).<br>• The sheet is hidden at 1200 px and above (`canvas.css:576-580`).<br>• The (i) button is 24×24 px (`canvas.css:242-249`). | Code check. `canvas.test.tsx` M-6 passes. Not checked in a browser. |
| **L-1** | **Fixed, but N-4 found** | `server/repo/submissions.ts:34-50`, migration 2: triggers `kept_snapshot_no_replace`, `submission_no_replace` and `submission_decision_final`. | **Run against the probe DB inside a transaction, then rolled back. Refused:**<br>• INSERT OR REPLACE and REPLACE over a submission or proposal snapshot.<br>• INSERT OR REPLACE of a submission row.<br>• Rewriting a returned submission's feedback.<br>• returned→approved and returned→submitted.<br>• UPDATE of a kept snapshot's kind.<br>• DELETE of a kept snapshot.<br>**Allowed:** UPDATE OR REPLACE (N-4). |
| L-2 | Fixed | `xml.ts:116` | Deadline fires inside a tag (above). |
| L-5 to L-17 | Not re-probed | §7 dispositions | No regression was seen in the suites. |

### Regression

| Check | Result |
|---|---|
| Authorization matrix (real server) | **Other team:** project, snapshots, changes, `GET` and `POST` submissions, import record: all **404**.<br>**Instructor:** writing changes, submitting, saving a version: all **403**.<br>**Student:** submission queue, approval queue, deciding their own or another team's submission: all **404**. |
| No self-approval path | Approval decision route as a student: 404.<br>`attributes.approval` path: 422. Whole `attributes` object: 422.<br>A snapshot with `kind:'submission'`: 400.<br>An instructor (from the other fixture) returning the submission: 200, so only instructors decide. |
| XLSX limits | All refused: DOCTYPE or ENTITY, 60 sheets, macro, 200 MB bomb (205 KB file), `../` name, non-ZIP, 5 MB + 1 byte.<br>All capped with a report: rows at 2,000, columns at 50, cells at 4,000 characters.<br>`XLSX_LIMITS` is unchanged (`reader.ts:12`). |

## New findings

### N-1 (Medium; an H-1 residual): a deleted pre-import version's ID is reissued, so Undo restores a different, later version

**Where:**
- `server/services/projects.ts:373` and `:472` number snapshots `maxSnapshotNo + 1`. `server/repo/sqlite.ts:219` takes the maximum over the rows that *still exist*.
- `deleteSnapshot` (`projects.ts:478-485`) lets a member delete a `pre-import` version. Only `proposal` and `submission` are kept.
- The import record keeps the bare ID (`pre_import_snapshot`).
- `ExcelImport.tsx:109-118` restores whatever that ID now holds, and does not check its kind or label.

**Probe:**
1. Import 4 created SNP-005 (`pre-import`, the newest).
2. A member deleted SNP-005 in History: 200.
3. The member edited the project, then saved a manual version "later work". That version was **SNP-005**.
4. `GET /imports/<U4>` still returned `preImportSnapshot: "SNP-005"`, which now has `kind: manual`, label "later work", and **contains STK-004**, the very artifact the import created.

Undo would "restore" a version that still holds the import and drops nothing, and it would report success: "back to the version saved just before it (SNP-005)". This is the same failure class as H-1. Quota pruning also deletes `pre-import` versions beyond 10, through `prunable`. Pruning leaves a dangling record, which fails honestly ("That version is not stored."). It reuses an ID only if the newest version is pruned.

**Fix (either, ideally both):**
- Never reissue snapshot numbers. Keep a per-project monotonic counter in the projects row or in `doc.issued`, as change sets already do.
- Bind the import record more tightly than by ID:
  - in `GET /imports/:id`, answer 404 or 410 unless the snapshot exists with `kind === 'pre-import'` and the label `Before import <chgId>`, or its `at` equals the record's;
  - have the client check the same before it restores.

Alternatively, refuse to delete a `pre-import` version that an import record points to, or mark the record as void when it is deleted.

### N-2 (Medium): the same import id in another project returns HTTP 500, and the browser's save then fails on every retry

**Where:**
- `import_records.id` is a **global** `PRIMARY KEY` (`server/repo/migrations.ts:67-68`).
- `preImport` checks only whether the id exists *in this project* (`projects.ts:372`, which uses `importRecord(projectId, asked)`), then INSERTs it (`sqlite.ts:220-222`).
- A legitimate path carries a foreign id: a JSON project merge copies the incoming artifacts' attributes verbatim (`src/project/transfer/importProject.ts:312`, `{ ...inc, … }`). So merging a file exported by **another team** sends that team's `attributes.import.importId`.

**Probe:** team 2 sent an import change set whose created artifact carries team 1's import id U1. The server answered **500** "Something went wrong on the course server. Your changes were not saved; try again." Team 1's record was left intact.

**In the browser:**
- `ProjectStore.write` (`ProjectStore.ts:398-430`) retries a 500 once, then shows a save error.
- The change set stays dirty and is resent with every later edit, so nothing after it can be saved until the page is reloaded.
- The message says "try again", but trying again cannot succeed.

**Fix:**
- Make the record key per project: a composite `(project_id, id)` key, or a separate `client_import_id` column with `UNIQUE(project_id, client_import_id)` (needs a migration).
- Or check whether the id exists *globally*, and fall back to `newUid()`.
- In both cases, ignore an `importId` on artifacts that come from a project merge.

### N-3 (Low): an Excel import that only merges into existing stakeholders cannot be undone on the course server

**Where:** `preImport` takes the import id only from `create-artifact` operations (`projects.ts:369-372`). A merge-only import sends only `update-artifact` operations on `attributes.importMerges` (`importPlan.ts:193-199`). So the server writes the pre-import version under a fresh id that the browser never learns.

**Probe:** a merge-only import returned 200 and the server wrote `pre-import` SNP-008. `GET /imports/<its importId>` returned **404**, so Undo says "no restore point… nothing was restored". That is honest, but the X5 promise ("A restore point is made first", implying Undo) fails for this case.

**Fix:** also read `importId` from `attributes.importMerges[*]` (the last entry), or let the change set carry the import id explicitly, for example as a top-level `importId` field.

### N-4 (Low; an L-1 residual): `UPDATE OR REPLACE` still deletes a kept snapshot without firing a trigger

**Where:** `server/repo/submissions.ts:28-31,41-43`. The UPDATE trigger fires only when `OLD.kind` is kept.

**Probe:** `UPDATE OR REPLACE project_snapshots SET snp_id='SNP-007' WHERE snp_id='SNP-005'` moved a *manual* row onto the submission's key. It returned `changes:1`, and SNP-007 became `{kind: manual, label: "later work"}`. The submission row now points at a non-submission document. Rolled back afterwards.

No code path uses `OR REPLACE`: a search of `server/` outside the tests finds only the comment. So, like L-1, this is defence in depth.

**Fix:**
- Add a `BEFORE UPDATE OF project_id, snp_id ON project_snapshots` trigger that aborts when a kept row exists at `(NEW.project_id, NEW.snp_id)`.
- Or run `PRAGMA recursive_triggers = ON` on every connection, so that REPLACE deletes fire `kept_snapshot_no_delete`.

### N-5 (Low): the instructor page and two code headers still say the validation is "as the team saw it"

**Where:**
- `src/auth/SubmissionReview.tsx:135`: "The validation report is the course's automated structural checks as the team saw them".
- `server/services/submissions.ts:6-7`: "the validation report is stored as the team saw it".
- `server/repo/submissions.ts:3`: "computed in the browser".

Since M-2, the count shown is the server's own, computed from the snapshot, and line 149 says so. The intro paragraph now contradicts the line below it, in an assessment view.

**Fix:** reword all three to say the summary is computed by the server from the frozen snapshot, and that the browser's figure is kept only to flag a difference.

### N-6 (Low, documentation): server pre-import versions are not outside the quota, contrary to the comment

**Where:** `projects.ts:364` says the pre-import version is written "outside the version quota like every restore point the server keeps for itself". In fact:
- `snapshotUsage` leaves out only `proposal` and `submission` (`sqlite.ts:216`), so `pre-import` versions count;
- `prunable` deletes them beyond 10 (`revisions.ts:54`);
- `preImport` itself writes without checking the quota.

So an old import's Undo can find its version pruned, and fails honestly. **Fix:** correct the comment, or leave `pre-import` versions bound to an import record out of pruning. That second option overlaps with N-1.

### Info (no action required)

- **Revision timing:** M-4 sends `fresh.rev`, read after `flush()` at click time (`ReviewSubmit.tsx:129-132`). If the 15 s `pollRemote` adopts a teammate's revision while the dialog is open, the package frozen is the revision on screen at click time, not necessarily the one shown when the confirmation was opened. Pinning `rev` when the dialog opens would close this narrow window.
- **Submission cap:** the cap of 10 includes superseded and returned submissions, and there is no instructor override ("Ask your instructor", `submissions.ts:111`). This is acceptable for Week 1, but faculty should know it.
- **Screen-reader chatter:** M-6 still announces one line ("Guidance available for X.") on every field focus. This is much lighter than the eight items before; consider announcing only when the guidance tab or sheet is visible.
