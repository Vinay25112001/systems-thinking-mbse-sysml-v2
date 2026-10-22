# Week 1 M6 independent review (canvas, approval UI, Review & Submit, guidance, Excel import)

Date 2026-10-21. Reviewer: independent, adversarial, read-only (no source edits, no git operations, no installs). Scope: the uncommitted M6 work listed in `learning-studio/docs/week1/M6_REPORT.md`. M3 publishing and Week 9 are out of scope.

## Verdict

**CONDITIONAL. Not signed off yet.** The core security model holds:

- no self-approval path through the UI, the API, the import or legacy flags;
- authorization is correct, with 404 across teams and 403 for instructor writes;
- the snapshots are immutable against UPDATE and DELETE;
- the XLSX reader refuses DTDs and entities, ZIP bombs, traversal names, macros, ZIP64 and encrypted files;
- formulas are never run, and the AI provider is disabled with no network code.

Five defects must be fixed before sign-off: **H-1** and **M-1 to M-4**. **M-5** and **M-6** are pedagogy and accessibility fixes that should land with them. Everything else is Low.

## Runs (current tree)

| Check | Result |
|---|---|
| `npx tsc -b` | 1 error: `src/workbench/week9/requirements.ts(74,7)` TS6133. Week 9 stream, not M6. |
| `npx vitest run` (app) | 138 files, 3105 tests. **1 failed:** `src/content/lectures/lectures.test.ts`, a word budget on the Week 9 session 2 slides `w9s2-ai-method` and `w9s2-ai-demo`. Week 9 stream, not M6. 3104 passed. |
| `npx vitest run -c vitest.server.config.ts` | 15 files, **373 passed**. This includes `submissions.test.ts` (16) and the M3 content tests. |
| XLSX hostile-input probes | `jiti` scratch script against `reader.ts`. Results in the table under M-1. |
| Server probes | Vitest harness, in-memory SQLite, ephemeral port. No data directory was touched. Results below. |
| Default e2e (`week1-flow.spec.ts` and `project.spec.ts`), run once under the lock | 7 failed, 15 passed, matching the builder. Triage is in the E2E section. Tracked screenshots the run rewrote were restored. The 11 files already modified before the run were not touched. |

## Findings

### H-1 (High): "Undo this import" is broken in server mode, and can restore the wrong, possibly weeks-old version

**Where:**
- `src/project/canvas/ExcelImport.tsx:101` picks the newest snapshot with `kind === 'pre-import'`.
- `server/services/projects.ts:37,403`: `CLIENT_STORED_KINDS = ['manual','pre-restore','auto']`, so a client's `pre-import` snapshot is **stored as `manual`**.
- `server/services/projects.ts:207`: a project *created on the server from an imported file* gets SNP-001 with kind `pre-import`.

**Probe:** `POST /snapshots {kind:'pre-import'}` returns `{"id":"SNP-002","kind":"manual"}`.

**Scenario A:** a normal server project.
- No `pre-import` snapshot exists, so the Undo button is silently disabled.
- X5 and X6 promised "the import can be undone" (`ExcelImport.tsx:319`).

**Scenario B:** the team's project was created by importing a JSON file.
- Undo restores SNP-001, the project as it was first imported, and silently replaces weeks of work as a new revision.
- It is recoverable only through the pre-restore snapshot, and a student is unlikely to know that.

**Fix:**
- Make `store.importMerge` return the id of the restore point it actually wrote. That is the server id from `putSnapshot`, so `HttpProjectAdapter.putSnapshot` must return the response.
- Undo exactly that id.
- Alternatively, let the server keep `pre-import` for client snapshots.
- Add a server-mode e2e for X6 Undo. Demo D does not cover Undo.

### M-1 (Medium): the XML scanner rejects valid workbooks when an attribute value contains an apostrophe

**Where:** `src/project/xlsx/xml.ts:210`. The loop that finds the end of a tag counts `"` and `'` *independently*.

So `<sheet name="Members' list" .../>` has an odd count of `'` and is extended to later `>` characters, which ends in "A tag is not closed."

Excel writes apostrophes unescaped inside double-quoted attributes. That covers sheet names like "Stakeholders' register" and data-validation `prompt="Don't…"` and `error=` texts, which are common in templates.

**Probe:** `apos1` (sheet "Bob's list") returned `{"ok":false,"error":"A tag is not closed."}`. The same tag is also rescanned in full on every extension, which is quadratic: the `quotebomb` probe took 965 ms for 200k `>`.

**Fix:** scan from `<` character by character. Track the *current* quote character (only the opening quote closes it), and stop at the first `>` outside quotes. That is linear and correct. Add tests with apostrophes in a sheet name and in a `dataValidation` prompt.

**Hostile-input probe results (all correct apart from M-1):**

| Input | Result |
|---|---|
| `<!DOCTYPE>` / `<!ENTITY>` (XXE) | Refused |
| Undeclared `&lol9;` | Left literal |
| Nesting 200k deep | Linear, 281 ms |
| 2.5M shared strings | 6.3 s, under the deadline |
| 200 MB honest bomb | Refused from the directory |
| Bomb lying in the directory (100 B, then 49 MB) | Refused while inflating; peak transient about 66 MB per 64 KB push |
| 60 sheets | Refused |
| `../evil.xml` | Refused |
| `C:/evil.xml` | Ignored |
| Non-ZIP, PDF, truncated, `.docx` renamed | Refused, each with a clear message |
| `HYPERLINK` / `cmd|` formulas | Cached value used and flagged; never run |
| `<f>NOW()</f>` with no value | Empty, flagged |

### M-2 (Medium): the instructor sees a client-supplied, forgeable validation summary

**Where:**
- `server/services/submissions.ts:200-202` stores `validation` exactly as the browser sent it.
- `src/auth/SubmissionReview.tsx:147-150` renders it as "Automated checks (advisory): 7 of 7 required parts met".

**Probe:** a member POSTed `headline:{meets:7,required:7}` for an almost empty project. The response was 201, and the instructor queue shows `{"meets":7,"required":7}`. The report also carries `approval`, which is equally forgeable.

"Advisory" does not make a false claim acceptable in an assessment view.

**Fix:**
- Compute the summary from the frozen snapshot: either on the server with the pure `reviewModel` and `progress`, or in `SubmissionReview`, which already loads the snapshot doc.
- Show the team's notes beside it.
- If the stored report is kept, label it "as reported by the team's browser" and flag any mismatch.

### M-3 (Medium): unlimited resubmissions create permanent, undeletable snapshots that count against the team's snapshot quota

**Where:**
- `server/services/submissions.ts:206-226` has no cap, no "unchanged since the last submission" check, and no quota.
- The `kept_snapshot_no_delete` trigger makes the snapshots permanent.
- `putSnapshot` (`projects.ts:417-431`) counts them in `snapshotUsage`. Pruning can never remove them.

**Probe:** 40 submissions in 587 ms were all accepted, leaving 41 permanent submission snapshots.

After about 200, every member's "Save version" (and the daily auto snapshot) answers 413 permanently, and nobody can clean it up, the instructor included. The instructor queue also lists every superseded row.

**Fix:**
- Refuse a resubmission whose `doc_sha256` equals the latest one (409, "nothing changed since your last submission").
- Cap submissions per week, for example 20.
- Exclude the `submission` and `proposal` kinds from the member snapshot quota, or give them their own budget.
- Hide superseded rows in the queue by default.

### M-4 (Medium): the frozen snapshot is not guaranteed to be the version the team reviewed

**Where:**
- `src/week1/review/ReviewSubmit.tsx:113-121` calls `store.flush()`, computes notes and validation from the browser's doc, then POSTs.
- `server/services/submissions.ts:209-220` freezes whatever `cur.doc` is on the server at that moment, with no expected revision.

**Scenario:**
- A teammate saves an edit between flush and POST; or
- this browser's flush leaves edits unsaved (a conflict, a refusal such as an approval edit, or offline).

Either way, the snapshot differs from what the submitter reviewed and confirmed. The confirmation ("I have reviewed…") and the stored notes and validation then describe another revision.

**Fix:**
- Send `rev`, the reviewed doc revision, with the submission. The server answers 409 when `cur.doc.rev !== rev` ("the project changed while you were reviewing; review again").
- Refuse to submit while the store has pending or failed changes.

### M-5 (Medium, pedagogy): the guidance for "conflicting concerns" teaches the confusion §14 exists to remove

**Where:** `src/week1/guidance/fieldGuidance.ts:92`, the `con.conflict` example.

The field is a concern-to-concern link (CON conflicts-with CON, LNK). The example is the stakeholder link **REL-002**, "Communities vs Vertiport operators".

**Fix:** use the concern pair from `aerolinkCase.ts`, CON-012 (community noise) against CON-006 (pad throughput), with caseRef "CON-012, CON-006".

### M-6 (Medium, accessibility and mobile): guidance is noisy for screen readers and hard to reach on phones

- **P-5:** `src/project/canvas/Panel.tsx:154` puts `aria-live="polite"` on the whole guidance `<dl>`. Every Tab reads out all eight items, on top of the field's own `aria-describedby`. Fix: remove it, and announce only the live-validation line.
- **P-6:** `canvas.css:559-573` and `ctx.tsx:193-205`.
  - Below 1199 px the panel moves below the work area. Focusing a field or pressing (i) updates it off-screen, with no scroll and no focus move.
  - `bare` fields have no (i) button. That covers every cell of the stakeholder, need and REL tables, so at 390 px the guidance for interest, influence and support is unreachable.
  - Fix: on narrow screens, show the guidance as a popover or sheet next to the field, and add (i) to the bare cells.

### Low

| ID | Where | Scenario | Fix |
|---|---|---|---|
| L-1 | `server/repo/submissions.ts:25-31` | The triggers are bypassed by `INSERT OR REPLACE`, because SQLite REPLACE deletes without firing DELETE triggers while `recursive_triggers` is off. Probe: REPLACE turned a `submission` snapshot into `{kind:'manual',doc:'{}'}` and a submission row into `doc_sha256:'forged', state:'approved'`. The decision columns (`state`, `decided_*`, `feedback`, `anchors`) can also be rewritten at database level after a decision (probe: approved→submitted allowed). No current code path does this, but the header claims immutability "whatever a service does". | Add `BEFORE INSERT` triggers that abort when the key exists with kind `submission`/`proposal` (and for `submissions`). Add a trigger forbidding a change of the decision columns once `OLD.state IN ('approved','returned','superseded')`, apart from returned→superseded. Or set `PRAGMA recursive_triggers=ON`. |
| L-2 | `xml.ts:209-216` | The tag-extension loop never calls `check()`, so the reader's own 10 s deadline cannot fire inside it (quadratic up to a 1 MB tag). The worker's 12 s hard stop protects browsers; the main-thread fallback (`parseInWorker.ts:238,243`) does not. | Fixed by the linear scanner in M-1; otherwise call `check()` inside the loop. |
| L-3 | `zip.ts:67-72` | The local header name is not checked against the central directory, so a crafted file can show Excel different content from what is imported (a parser differential). The student still reviews the preview. | Compare the local name and flags with the central entry, and refuse a mismatch. |
| L-4 | `reader.ts:214`, `importPlan.ts` | Text values starting with `=`, `+`, `-` or `@` (for example `=cmd|' /C calc'!A0`) are imported unflagged. There is no CSV or XLSX export today, so there is no live injection. | Flag them as "looks like a formula, stored as text". Prefix-escape them in any future CSV or XLSX export. |
| L-5 | `src/workbench/week7/record.ts:455` | Week 7 consumes the v3 `status`. A Week 1 record completed before M6 and re-exported now reads `not-ready`, so Week 7 raises "its own lab tool did not judge it ready". M6_REPORT and X9 list only the Week 1, 2 and 8 importers. | Record the Week 7 effect in the impact matrix (X9) and KNOWN_LIMITATIONS. Optionally word the Week 7 finding as "interest not yet recorded (A25)". |
| L-6 | `canvas/progress.ts:166,192` | The rationale of an optional conflicting-concern link feeds `concernIssues` and `relAllIssues`. One unexplained optional conflict downgrades two *required* parts and the headline, against the stated default "optional, never blocks" (M6_REPORT §6.2). | Keep the item at draft but leave it out of the part state, or show the criterion as optional only. |
| L-7 | `ExcelImport.tsx:105-110` | Undo is a whole-content restore, so in server mode it also discards a teammate's edits saved between the import and the Undo. | Warn when the revision has moved since the import, or undo by inverse operations of the import change set. |
| L-8 | `importPlan.ts:142,159` | When merging, CON IDs are issued for concern texts that are then filtered out as duplicates, leaving gaps in the series. This is harmless because IDs are never reused. | Issue IDs after filtering. |
| L-9 | `ExcelImport.tsx:152` | "No data leaves this computer" sits next to the mapping. In server mode the approved records do go to the course server. | Say "No AI service is used; the workbook is read in this browser". |
| L-10 | `importPlan.ts:32-40` | Duplicate detection uses exact word-set Dice. "City permits office" and "City permit office" score 0.67, which is not flagged. | Add stemming or character-trigram similarity. Keep it advisory. |
| L-11 | `server/services/projects.ts` (pre-M6, M2) | Members can write `Milestone.state`, with any string accepted ('approved' → 200), and `markedSubmittedAt`. No M6 surface reads either as an approval or a submission, so there is no exploit now. | Validate the `MilestoneState` enumeration on the server. |
| L-12 | `fieldGuidance.ts:60-63` | The charter examples are retyped, against the file header's "never retyped", and have drifted from Learn (`content/learn/week01.ts:38-40`): prefixes differ, and the majority-vote rule is dropped. The Learn example also leaves PRT and REL without an owner. | Use one source and import it. |
| L-13 | `fieldGuidance.ts:86,89` | The later-week claims "Week 3 engagement planning / trade-study weighting" are not backed by Week 3 content. Moving high-influence stakeholders toward commitment is taught in Week 2 (`weeks/week02.ts:96,307`). | Retarget the claims. |
| L-14 | `Panel.tsx:136` | The Rationale field of every non-need item uses the need-rationale guidance (with the NEED-010 example). | Add a generic rationale record. |
| L-15 | `ReviewSubmit.tsx:301`, `partsCore.tsx:237-244` | The submit confirmation and the "I understand" unlock do not move focus or return it (focus falls to `<body>`). | Manage focus with refs. |
| L-16 | `canvas.css:249,489`, `partsRegister.tsx:99` | The (i) target is 22×22 px, below the spec's 24×24 (WCAG 2.5.8). Map labels are 12 px and node IDs 11 px, scaling to about 7 px at 390. | Raise the target to 24 px or more, and the text to 13 px or more. |
| L-17 | `partsRegister.tsx:83,120-126,543`; `Canvas.tsx:230-236`; `adapters/week1.ts:246` | Map edges and the hidden list read IDs only. The MGO select shows bare IDs. The message is announced twice (`status` and `alert`). There is no `aria-invalid`. The stored retire reason still says "goal … Week 1 lab tool". | As named. |

## Security and authorization matrix (probed)

| Vector | Result |
|---|---|
| Member writes `attributes.approval` (path, or the whole `attributes` object) | 422; the stored approval is unchanged |
| Member creates a second ENT carrying `approval.decision` | 422 |
| Replace-import or restore carrying an approval | `keepServerOwned` keeps the server's approval (code review) |
| JSON import, offline | Approval shown as "self-reported / not an approval" (`progress.ts:46-48`, `partsCore.tsx:141-150`); material lock and "Instructor reviewed" are server-mode only |
| Excel import | Touches only STK and CON |
| Instructor writes the project | 403 |
| Instructor submits for a team | 403 |
| Student opens the queue | 404 |
| Student decides a submission | 404 |
| Other team, GET or POST submissions | 404 |
| Submission before the approval request | 400 |
| Approved week resubmitted | 409 (`submissions.test.ts`) |
| `UPDATE` / `DELETE` on a `submission` or `proposal` snapshot | Aborted by trigger |
| `DELETE` of a submission row | Aborted |
| `INSERT OR REPLACE` and decision-column update | Allowed (see L-1) |
| Anchors | Must name artifact IDs of the snapshot (400 otherwise) |
| Return without a comment | 400 |
| Rendering | No `dangerouslySetInnerHTML` in M6 files; React escapes feedback, notes and anchors |
| A26 lock | `ctx.tsx:77,97-99,166-167` locks exactly the APPROVAL_MATERIAL_FIELDS keys (ENT name, description, problem, mission, objectives, PRT, EXT); add/remove objective is disabled; the server sets `approved-changes-pending` regardless (M2) |

## Data integrity and migration (verified)

- **Export format:** schema and export stay at v1. The pre-M6 golden export re-imports with a valid checksum and the same record, and re-saving issues no operations (`m6model.test.ts`).
- **A25 attributes:** stored as `null` when empty, so a pre-M6 project gets no spurious edit.
- **IndexedDB:** opened as is, with no destructive migration.
- **Approval rewrite fix** (`adapters/week1.ts:150-165`): an edit no longer rewrites `changed-since-approval`. The new `draft` handling avoids no-op edits.
- **week1-model-inputs v3:** byte-identical without A25 values, with the A25 keys appended when present.
- **Week 2 importer** (`week2/record.ts:357-370`): ignores `status`, so "not ready" does not block it.
- **Week 8 skeleton:** does not read `status`.
- **Week 7:** reads `status` (L-5).
- **Relations:**
  - `CON conflicts-with CON` is symmetric, and a duplicate either way round is refused (`integrity.ts:35-36`; server 422).
  - A self-link is refused (I6).
  - Draft duplicates are not compared (acceptable).
  - An older app opening an M6 file reports, rather than crashes, on the CON–CON link (stated).
- **IDs:** issued from the counters (`importOps` uses `issued`). Removals retire, and IDs are never reused.
- **Canvas edits:** all go through `store.apply`, so table, map and detail share the one document (`canvas.test.tsx`).
- **Progress:** based on gates (`stakeholderRowIssues`, `concernIssue`, `needStatus`, `checkNeedsPart`), not on non-empty fields.
- **Import transaction:** `store.importMerge` takes one restore point, then one `import` change set, and any refused operation refuses all (`xlsx.test.ts` rollback).
- **Import provenance:** file, SHA-256, sheet, row, time and mapping, including the student's choices.
- **Missing data:** missing interest is flagged and never filled; unrecognised values are left empty.

## E2E triage (default config, 7 failures)

**Root cause of #1 and #2:** the shared dev server on :5173 answers `504 Outdated Optimize Dep` for `recharts` and `@xyflow/react`, so the lazy `Dashboard.tsx` and `WeekPage.tsx` fail to load. On a fresh Vite server (own cache, :5391) both pages render and both tests pass.

| # | Test | Failing assertion | Class | Origin | Fix |
|---|---|---|---|---|---|
| 1 | `week1-flow.spec.ts:63` homepage | `start-here` on `#/dashboard` (:77) | **Environment** (stale optimizer cache), not a regression | `Dashboard.tsx:39` still renders it | Restart the dev server with `--force`. Add `'recharts'` and `'@xyflow/react'` to `optimizeDeps.include` (`vite.config.ts:20`) so it cannot recur. |
| 2 | `week1-flow.spec.ts:208` redirects | `archive-banner` (:231) | **Environment**, same cause; every M6 redirect row before it passes | `App.tsx:211` | As #1 |
| 3 | `project.spec.ts:43` demo workflow | `slide-counter` (:50-51) | **Stale test** | M4a `355207b`: `week1LectureGate` (`route.ts:135`) sends `/week/1/lecture/1` to Learn when the instructor view is off | Delete step (1) at :48-56, or switch the instructor view on first. Step (2) at :59-60 is also stale since M5 `8048c25`: `/week/1/examples/practice` now goes to `/week/1/practice`, with no `workbench`/`stk-candidates`. Point the examples hand-off at :67-72 at `#/week/1/project/instructions`. |
| 4-7 | `project.spec.ts:312` axe ×4 (1440/400 × light/dark) | `handoff-panel` on `/week/1/examples` (:333-335) | **Stale test** | M4a `355207b`: `route.ts:113` redirects `/week/1/examples` to `learn/ch06#ch06-07`, and Examples.tsx is no longer routed | Remove the `['/week/1/examples','handoff-panel']` entry at :333. M6's own `/week/1/project/instructions` entry then runs; checked by hand: visible, axe clean, no horizontal scroll at 1440 and 400. |

None of the 7 is an M6 regression. The builder's KNOWN_LIMITATIONS wording ("outside M6") is right. It should say that #1 and #2 come from the environment, not from content, and that #3 to #7 are stale tests from M4a and M5.

## Verified (pedagogy and UX)

- **Guidance coverage:** 43 records; every canvas `gk` key resolves.
- **Definitions match Learn and the sources:** enterprise, system of interest, stakeholder, concern; interest is a course convention.
- **AeroLink examples match `aerolinkCase.ts`,** apart from M-5.
- **Objectives** come from `course.ts` B1.1–B1.5.
- **Interest is required with a reason; influence and support are optional,** consistently across the gate, tables, guidance, the Excel mapping (`COURSE_REQUIRED`), Markdown and Review.
- **Wording:** "objectives" in student text; no internal codes in canvas, review, guidance or ExcelImport JSX.
- **Dialogs:** the Excel import uses a Radix Dialog (focus trap and return).
- **Keyboard:** table rows support ↑/↓ and Enter, and map nodes and edges can be operated by keyboard. The table is the equivalent view.
- **Text sizes:** the canvas tokens are 13 and 14 px.
- **Mobile:** at 720 px and below, tables turn into cards and a section select replaces the navigator.
- **Submit confirmation:** the responsibility checkbox wording matches spec §g.
