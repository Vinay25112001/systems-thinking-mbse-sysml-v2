# Week 1 M7: confirmation review of the fixes

Date 2026-10-22. Reviewer: independent; read-only.
- No source, test or doc was edited, apart from this file.
- Every mutation and temporary probe test was reverted. Each file was checked with `cmp` against a backup taken first.
- Basis: `learning-studio/docs/week1/M7_REPORT.md` §6, and the first review `week1_m7_review.md`.

## Verdict: REVISE (one small moderate fix, otherwise ready)

Ten of the eleven findings are closed. Each fix has a test that fails when the fix is mutated away. M7-7 is correctly recorded as a faculty item.

One new moderate regression comes from the interaction of two fixes (N1):
- the server now refuses a `pkg` outside the package list (M7-8);
- `cleanMapping` (M7-2) still accepts any `pkg` text on import.

The fix is one line, plus a test. Two minor wording issues remain (N2, N3).

## Per-finding table

| Finding | Status | Evidence (mutation → result) |
|---|---|---|
| M7-1 browser-trusted provenance | **Closed** | `projects.ts` `stampCreates` overwrites `confirmedBy` with the server ctx (member initials, server time, this change set's CHG), and `source.projectRev` with the stored revision. Mutation: drop the `upsert-mapping` branch → the server test "the server stamps … forged values are overwritten" fails. Mappings are not undoable (`invertOps` has no mapping case), so the re-stamp cannot rewrite an older record's provenance on Undo. The browser adopts the server document (`ProjectStore.adopt`). |
| M7-2 crash on malformed mappings | **Closed** | `mappingShape.ts` `cleanMapping` is used by `week8Mappings`/`mappingViews`/`buildPreview` and by `importProject`. Mutation: raw records in `week8Mappings` → 2 tests fail. Mutation: raw records in import → the import test fails. Probe: junk records, a bad `MAP-9` ID, `source:'str'`, `pkg:4`, `confirmedBy:'z'` → dropped or flagged with plain warnings, no crash. |
| M7-3 false "course working mapping" | **Closed** | `mappedReason` plus the preview detail "Your team chose package … instead". Mutation: always the course wording → the unit test fails. |
| M7-4 optimistic ✓ | **Closed** | The outcome stays pending ("… Saving…") until `save.kind==='saved'`. It shows ✗ with `role=alert` on error or conflict, and "Kept in this tab only" for memory storage. Mutation: ✓ at once → the DOM test fails. Observation: removing only the `save.at >= msg.at` guard survives. That guard is redundant in practice, because `apply` → `markPending()` moves the save state off `saved` synchronously, and both times come from the same browser clock in IndexedDB and server modes. Not a finding. |
| M7-5 "gap wins" untested | **Closed** | Mutation `if (block && !views.get(uid))` → "an audit gap stays Invalid or incomplete…" fails. Demo E also asserts it. |
| M7-6 circular golden tests | **Closed** | Mutation `of('NEED').slice(1)` in `adapters/week1.ts` → all four M7 golden tests fail (plus the P1 round-trip and import tests). |
| M7-7 header origin line | **Deferred by decision** | Listed as a faculty item in report §4.1. Acceptable. |
| M7-8 non-package offered | **Closed (but see N1)** | `week8Packages.ts` filters with `/^[A-Z][A-Za-z]*$/`. Every rule package of the Week 1 prefixes (Context, Physical, Stakeholders, Needs) passes, so no default choice is refused. Mutation: remove the filter → "the package list holds packages only" fails. Mutation: remove the server check → the server allow-list test fails. |
| M7-9 read-only flash / wrong reason | **Closed** | `showReadOnly()` plus the shared `EditAccess` banner. Mutation: raw `handle.readOnly` → the DOM test fails. |
| M7-10 damaged saved state | **Closed** | `normalizeState` falls back to `file`, clears the project-derived `week1`/`week1Origin`, and sets a one-time `notice`. The tool shows the notice and strips it from state straight away (`Week8LabTool.tsx:49-51`), so it is neither exported nor saved back. Mutation: remove the fallback → the DOM test fails. Legacy state without `source` still reads as `file`. |
| M7-11 unpositioned scroll wrapper | **Closed** | `.w8-scroll { position: relative }` (`week8tool.css:110`). The Week 8 axe and 400 px no-sideways-scroll checks are green. |

## New findings

| ID | Severity | File:line | Evidence | Fix |
|---|---|---|---|---|
| N1 | moderate | `src/project/model/mappingShape.ts` (`pkg` kept if any string); `server/services/memberOps.ts` (`isWeek8Package` refusal); `src/project/adapters/week8.ts` `withdrawMappingOp` (spreads the record); `ProjectSource.tsx` `draftOf` (defaults to `mapping.pkg`) | Probe: `cleanMapping({… pkg: 'owned by what it measures'})` keeps the pkg with **no** problem reported. `normMapping(withdrawMappingOp(that).mapping)` throws "pkg is not a package of the course working mapping". Such a record can enter a project through Import Project, including the server's replace import, which runs the same `importProject` pipeline and not `normMapping`. Sources: a hand-edited file, or an export from the earlier M7 build that offered that value. After that, "Withdraw the mapping" or "Confirm again" sends the bad `pkg`. The `select` also shows its first option while its value is the invalid `pkg`. The server answers 400, the change set stays dirty, and `ProjectStore.write` puts it in every later save, so **all saves of the project fail** until the page is reloaded. | In `cleanMapping`, drop a `pkg` that `isWeek8Package` rejects and report it ("the package … is not a package of the course working mapping and was left out"). Optionally also strip an invalid `pkg` in `withdrawMappingOp`/`draftOf`. Add a unit test: import with `pkg: 'owned by what it measures'` → warning, no pkg. |
| N2 | minor | `ProjectSource.tsx` (`w8-skipped`); `ModelPreview.tsx` (`preview-skipped`); `week8.ts` `week8Mappings` | The banner says the records "could not be read and **are not shown**". But `skipped` also holds problems for records that **are** shown, just partly read: missing `source.title`, unreadable `confirmedBy`, non-string `pkg`. Example: "…not shown: MAP-001: the Week 1 item it was made for could not be fully read." | Split the two cases, or word the banner as "could not be read in full: …". |
| N3 | minor | `src/project/transfer/report.ts:67` | The Engineering Report heading still reads "Week 8 mapping preview (not yet confirmed)", but M7 now lets the counts include Mapped items the team confirmed. The file is unchanged by M7, but M7 made its wording false. | Drop "(not yet confirmed)", or say "Mapped = confirmed by the team in the Week 8 lab tool". |
| N4 | minor (note) | `importProject.ts` (`issued.MAP` bump) | `issued.MAP` is raised only from records that survive cleaning. A dropped record with a valid MAP ID but no usable uid does not raise the counter, so its number could be issued again later. This edges against I3. Probe: a junk record `MAP-9` is dropped and correctly not counted. | Optionally bump `issued.MAP` from any well-formed `id` in the file's mapping list, kept or not. |

## Regression checks requested

- **Import of legacy or older files.**
  - Probe: export → import round-trips a full M7 mapping and a P1-style record (no `source`, `pkg` or `confirmedBy`) byte-for-byte equal.
  - The checksum stays `ok`: it is computed on the raw file body, not on the cleaned document.
  - No warnings are raised for valid records.
  - `issued.MAP` is set to the file's highest number when the file has no `issued.MAP`.
  - Only records without a usable uid or MAP ID are dropped, and each is reported.
- **Server refusing an existing `pkg`.** This is N1. No committed or production data can hold a bad `pkg` (M7 is uncommitted), but import is a live path.
- **Save messages in IndexedDB mode.**
  - `where` = "in this browser"; ✓ appears only after the store reports `saved`.
  - Memory storage says "Kept in this tab only (not saved)".
  - Verified by the DOM tests and the offline e2e (`week8-project-source.spec.ts`, which waits for "Saved in this browser").
- **`normalizeState` fallback.**
  - Also applies to an imported teammate workspace, which is correct.
  - The notice is one-time and never exported.
  - A valid `projectRef` with a missing title or time is kept and shown as "not recorded" (no crash).
- **Line endings.**
  - Every changed file keeps the HEAD convention, CRLF throughout. For example `week8.ts` is 218/218 CRLF, `projects.ts` 519/519 and `importProject.ts` 365/365.
  - `playwright.server.config.ts` is 37 CRLF over 36 newline-counted lines, the same as HEAD.
  - All new files are CRLF throughout as well.
  - The diff stats are small, so there is no line-ending churn across whole files.

## What I ran (current tree)

- `npx tsc -b`: no errors outside the Week 10 files.
- `npx vitest run src/project src/workbench/week8`: 17 files, **250** tests passed.
- `npx vitest run -c vitest.server.config.ts`: 16 files, **384** tests passed.
- Playwright (lock taken as "m7-confirm" after "w10-review" released it, then removed):
  - default config, `week8-project-source`, `week8-flow` and `project.spec`: **21/21 passed**;
  - server config, `demo-e-continuity`: **1 passed**.
- Clean-up: the `screenshots/project-demo/*` files my run rewrote were restored, and the `demo-export.json` it created was deleted. The 11 screenshots that were already modified are untouched. After the run, `git status` matched the snapshot taken before it.
- Mutations: 12, all reverted and checked with `cmp`. Eleven were killed. One survived as an equivalent mutant (the M7-4 `save.at` guard, explained above).

---

# Second confirmation (N1–N4 and the new `rejected` save path)

Date 2026-10-22. Same rules as before: read-only; one temporary probe test, deleted afterwards. Week 10 and Week 11 files were ignored. Playwright was not needed: the defect below is reproduced against the real server in a vitest probe.

## Verdict: BLOCK, until the `rejected` path is narrowed

N1–N4 are fixed. The new save-path change, however, reintroduces a P0-class defect: a recoverable condition silently discards the student's work and then reports it as saved.

## Findings

| ID | Severity | File:line | Evidence | Fix |
|---|---|---|---|---|
| S1 | **blocker** | `src/services/httpProjectAdapter.ts:128`; `src/project/store/ProjectStore.ts:421-429` | Any 403 or 404 is classed as `rejected`. That includes 403 `csrf`, 403 `password-change-required`, 403 `origin`, and 404 after a membership change or a project removal.<br><br>**How the work is lost:**<br>1. The branch writes the History version through `this.snapshot(...)`, which in server mode is a **server POST** (`httpProjectAdapter.putSnapshot`). That POST fails for the same reason (stale CSRF, no access, too large for 413).<br>2. The failure is swallowed (`.catch(() => undefined)`).<br>3. `reload()` then replaces the live document, clears `dirty`, and calls `stash()`, which **deletes the outbox**.<br>4. The store sets `save: {kind: 'saved'}` with the text "Your unsaved edits are kept as a version in History".<br><br>**Reproduced** with the real server and `ProjectStore` + `HttpProjectAdapter`, built like `rejectedSave.test.ts`. A stale CSRF token, which happens when the student signs in again in another tab (the token is per tab, in `backend.ts` state; server mode has no Web Lock), gave:<br>- `save = {kind:'saved'}`;<br>- the refused message claims a History version;<br>- **snapshots 1 → 1** (none written);<br>- the student's edit is **gone** from the document.<br><br>Expired sessions answer **401** `session-expired`/`unauthenticated`, which correctly stays `auth`. Server restarts (status 0/5xx) and 409/422/429 are also unaffected. Only the 403/404/413 family is wrong. | Narrow `rejected` to refusals of the content itself: 400 `bad-request`/`integrity`, and 413 `too-large` only if the History version can still be written. Treat 403 `csrf`/`password-change-required` like `auth` (refresh the session or token, keep the edits and the outbox, retry after sign-in). For 403 `forbidden`/`origin` and 404, go read-only with the reason, keeping the edits and outbox, like the conflict branch. In the `rejected` branch, **reload only if the History version was actually written**; otherwise keep the edits, keep the outbox, and show "Not saved". Never set `saved` there. Add tests: stale CSRF → edits kept, no reload, no "saved"; snapshot POST failing → no reload. |
| S2 | moderate | `ProjectStore.ts:421-429` | Even on the intended path (400), every dirty change set in the batch is dropped from the live view, not only the refused one. Valid edits typed within the same debounce window or while the write ran also disappear from view; they are in the History version only. The message says only "This change was not saved". | Say how many changes were set aside, or re-apply the non-refused change sets after reloading. Alternatively, have the server name the refused change set (`clientChangeId` is already in the integrity error) and drop only that one. |
| S3 | minor | `ProjectStore.ts:426` | If `reload()` itself throws (for example 404 after losing access), the error escapes the `catch` of `write`. The save state then stays `saving` with no message. | Wrap the reload, and fall back to read-only or error with the reason. |

## Requested checks

- **Transient or recoverable conditions landing in `rejected`.** Expired session: no (401, which maps to `auth`). Server restart, 5xx, network, 429: no. Stale CSRF, password change required, membership or role change (404/403), and a 404 during creation: **yes**, and the work is lost (S1).
- **History version written before reload, and surviving a failure in between.** It is attempted first, but a failure is ignored and the reload goes ahead (S1). There is no retry and the outbox is not kept.
- **Web Lock, read-only and EditAccess.** Unchanged. The branch does not touch `readOnly` or `lock`, and M7-9's test still passes. Server mode has no Web Lock by design (`locks: adapter.kind === 'indexeddb'`), which is exactly why the stale-CSRF tab case is reachable.
- **Offline/IndexedDB mode.** Unaffected: only the HTTP adapter throws `rejected`.
- **`server/test/rejectedSave.test.ts`.** It proves the 400 happy path only: the bad pkg is dropped, a History version is written, and the next edit saves. It does not cover any 403/404 path, nor the case where the History write fails. Those are the cases where the branch loses data.

## N1–N4

| Finding | Status |
|---|---|
| N1 | **Fixed** at the data level. `cleanMapping` drops and reports a non-package `pkg` (`mappingShape.ts:27-28`), on both import paths. The accompanying save-queue change is S1–S3. |
| N2 | **Fixed.** `skipped` and `partial` are worded separately; covered by unit and DOM tests. |
| N3 | **Fixed.** The report heading is now "Week 8 mapping preview", followed by a confirmed-or-not sentence (`report.ts:67`). |
| N4 | **Fixed.** `issued.MAP` is raised from every well-formed MAP ID in the file (`importProject.ts:184`). |

## Runs (current tree)

- `npx tsc -b`: no errors outside the Week 10 and 11 files.
- `npx vitest run src/project src/workbench/week8`: 254/254 passed.
- `npx vitest run -c vitest.server.config.ts`: 17 files, 385/385 passed.
- Probe: `server/test/zz_m7c2_tmp.test.ts`, deleted after the run.
