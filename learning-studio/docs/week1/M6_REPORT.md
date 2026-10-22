# Week 1 reconstruction, Milestone M6 (My Project canvas, instructor approval UI, field guidance, Review & Submit, Excel import): report

Date 2026-10-21. Controlling spec: directive §12, §13 (all 15 steps, AI policy, security), §14, §15, §16, §19 Demos C and D;
`docs/week1/spec/WEEK1_DESIGN_SPECIFICATION.md` §f, §g, §j, §k.1; `docs/week1/WEEK1_FIELD_GUIDANCE_SOURCE.md`; DECISION_LOG
A23–A27 (A25: interest required with a reason, influence and support optional, assumptions and unknowns optional,
"objectives"; A26: re-review material fields). Nothing is committed. No acceptance row is claimed PASSED (the matrix rule
needs the runs in `TEST_REPORT.md`).

## 1. What changed

| Area | Change | Spec |
|---|---|---|
| Canonical model | `CON conflicts-with CON` added as an extra rule of the existing type in the trace category (LNK ID, impact none, symmetric: a duplicate either way round is refused); `vocabulary.ts` gains `rulesOf`, `ruleOf`, `isSymmetric`, `categoryFor`, and `allowedPair` takes the category; `integrity.ts` and `impact.ts` read the rule of the relationship's category. The §14 relations are derived, never stored twice: `model/week1Relations.ts` labels every stored link (has concern, expresses need, supports mission or objective, motivates need, influences, conflicting concerns, objective refines mission, enterprise contains element) and `hasRationale` covers "has documented rationale" | §14, §k.1 CNT-01 |
| A25 fields | `StakeholderRow` gains `interest`, `interestReason`, `support` (optional in the type, always filled by `normalizeTeam`); stored on STK as `attributes.interest/interestReason/support` (null when empty, so a pre-M6 project gets no edit); the gate now requires interest 1–5 with a reason, keeps influence optional (a given rating needs its reason), support 1–4 optional. Assumptions and unknowns use the existing `A`/`U` types tagged milestone 1, with rationale and optional `affects` links | A25 (3), (4); MP-25 |
| Approval fix | `diffTeamRecord` no longer rewrites the stored approval when the record's decision is just its projection (e.g. the server's `changed-since-approval`, which the record cannot hold): before, every edit after an approval change was refused by the server. It also no longer emits `draft: false` edits for complete REL rows on every save | §12, A26 |
| Migration | No structural change was needed: schema and export format stay at version 1 (`sysml-studio-project` v1), every addition is optional. A baseline export written by the pre-M6 code (`src/project/__golden__/project-baseline.v1.json`, captured before any change) imports with a valid checksum, no integrity error and the same record, and re-saving it issues no operation; IndexedDB and server documents are opened as they are. The importer now carries `Milestone.teamReview`. A pre-M6 app that opens an M6 file reports the CON–CON link as an integrity error (reported, not crashed) | §12.4 |
| week1-model-inputs v3 | Byte-identical for records without the A25 fields (golden `model-inputs-partial.v3.golden.json`); for the complete pre-M6 record only `status` changes (A25 makes interest required); with A25 values recorded, `interest`, `interestReason`, `support` are appended to each stakeholder object, nothing else moves; the Week 1, Week 2 and Week 8 importers read both | brief, X9 |
| Canvas | `#/week/1/project[/:part]` is one workspace (`src/project/canvas/`): section navigator (10 parts with state and counts, compact 14-week strip), work area (tables first; stakeholders: Table · Map · Coverage; relationships: Table · Map · All Week 1 relations), detail and guidance panel (Details: links, rationale, provenance, recent history, instructor feedback; Field guidance). All views write the one document through `store.apply` (record parts through the existing adapter; description, A/U, conflicts as canonical operations). Text fields write on pause and on blur; row keyboard navigation (↑/↓, Enter); removals ask first and retire (IDs never reused). Banner "Your enterprise", save status from the store, Undo, Export Project, Import Project, Download Engineering Report. The Lab L1 brief moved to `#/week/1/project/instructions` (drawer link on the overview) | §12.1, §f.3, §f.4, MP-20…MP-27 |
| Field guidance | `src/week1/guidance/fieldGuidance.ts`: 43 field records with the eight items (name, definition with its source in words or "course convention", expected, AeroLink example read from `aerolinkCase.ts`, format, objective text from `course.ts`, later use, live validation from the selected item's course checks) plus the Learn link and "not to be confused with". Shown on focus without moving focus, `aria-describedby` to the definition, an (i) button per field. Kept outside `src/project` (the project model never imports the AeroLink case) | §12.2, §f.5, MP-40 |
| Progress | `canvas/progress.ts`: per part a readable criteria checklist, per artifact Missing / Draft / Template: adapt / Meets course checks / Needs review / Instructor reviewed (from the team.ts and needQuality gates, impact flags, practice provenance, the instructor's decision); headline "n of 7 required parts meet the course checks"; unresolved links, pending reviews and approvals, future weeks (dashed). Always with "checks show it is complete enough to review, not that it is right" | §12.3, §f.6, MP-50 |
| Approval UI | Enterprise part: request (enabled when the proposal checks pass), state chip, dates, the instructor's comment, "changed since your request", re-review notice; after approval the material fields (A26 list) are locked behind "I understand: edit the approved proposal". No self-declared approval control anywhere on the student route; offline the box says approval happens on the course server and shows an earlier typed decision read-only as "not an approval". The instructor review page shows description and objectives | §12, MP-10…MP-14, A26 |
| Review & Submit | `#/week/1/review` (`src/week1/review/`): five numbered sections, outstanding issues with severity (only an unnamed enterprise or a never-requested approval blocks) and a team note per item (Milestone 1 notes), DRAFT / READY FOR REVIEW (Milestone 1 `teamReview`) / SUBMITTED / APPROVED / RETURNED FOR REVISION (server), confirmation with the responsibility checkbox, latest submission with version ID, fingerprint, "changes since submission", instructor feedback and anchored feedback links; package downloads; the optional quiz in a student-safe form (sources without register codes, no slide pointers) with "where you stand by objective"; the advisory statement beside every check summary | §16, §g, RS-01…RS-30 |
| Server | Submissions store with its own migration track (`server/repo/submissions.ts`, like the M3 content store): `submissions` table, database triggers that forbid updating or deleting a submission record and any `submission` or `proposal` snapshot. Service `server/services/submissions.ts` + routes `server/services/submissionRoutes.ts` (one delimited line in `routes.ts`): `GET/POST /api/v1/projects/:id/submissions` (members; instructors read, 403 to submit), `GET /api/v1/submissions` (instructor queue), `POST /api/v1/submissions/:id/decision` (approve / return with required comment, anchors checked against the snapshot), audit entries. Authz actions in `policy.ts`. Instructor UI `src/auth/SubmissionReview.tsx` on `#/review`: queue, snapshot read-only, validation summary, team notes, decision with anchored feedback | §16, §g.3, §g.4 |
| Excel import | `src/project/xlsx/` + `canvas/ExcelImport.tsx`, screens X1–X6 for all 15 steps (§2 below) | §13, §j |
| Wording | team.ts messages and the Markdown record say "objective(s)" for MGO-002… (A25) | A25 (2) |

Shared files (minimal delimited edits, LF/CRLF kept as found): `src/week1/route.ts` (`--- m6 ---` part routes), `src/week1/Week1App.tsx`,
`server/routes.ts`, `server/repo/{types,sqlite}.ts`, `server/authz/policy.ts`, `src/auth/ReviewPage.tsx`, `src/components/Quiz.tsx`
(additive `studentSafe` prop), `vite.config.ts` (`fflate` in `optimizeDeps.include`), `playwright.server.config.ts` (testMatch),
`scripts/check-student-build.mjs` (expected-route list), and in `src/week1/learn/` only the student-surface scan files
(`studentSurfaces.tsx`, `studentScan.ts`, `surfaces.test.tsx`: the Lab brief route renamed, the canvas surfaces added, the
review ceiling removed). `App.tsx` and `flow/Chrome.tsx` were not edited. W9/W11/W12 partials untouched (a W9 file currently
fails `tsc -b`: `src/workbench/week9/requirements.ts(74,7)` unused `str`, not M6).

## 2. Excel import (§13, every step)

**Reader choice.** Evaluated: `read-excel-file` 9.3.12 (MIT, maintained, Oct 2026) — rejected because it cannot tell a formula
cell from a value (it silently returns the cached value or empty), has no size/row/sheet limits and pulls four runtime
dependencies; `exceljs` 4.4.0 (MIT, last release Dec 2024, large bundle) — rejected; npm `xlsx` 0.18.5 — excluded by the
spec (stale, known advisories). Chosen: **fflate 0.8.3 (MIT, zero dependencies, maintained, July 2026)** for the ZIP layer and
an in-repo SpreadsheetML reader (~300 lines: `zip.ts`, `xml.ts`, `reader.ts`) so that every limit is enforced by us.
Installed with `npm install fflate@0.8.3 --save-exact` (authorized by §13); no paid service. `npm audit --omit=dev` did not return within 5 minutes on this network, so no audit result is claimed (licence and release date checked with `npm view`). Bundled in the student build as a
worker chunk (`xlsx.worker-*.js`).

| §13 step | Where |
|---|---|
| 1 select, 2 type/size/structure/limits | X1: `.xlsx` only (`.xlsm` refused, `.xls`/`.csv` explained), ≤ 5 MB; central directory parsed before anything is inflated (encrypted, ZIP64, unknown methods, unsafe names refused; ≤ 2,000 parts; declared ≤ 50 MB); streaming inflate stops at the declared size and the budget (ZIP-bomb guard); macros (`vbaProject.bin`, macro-enabled content types) refused; any `<!DOCTYPE`/`<!ENTITY` refused (no entity expansion); ≤ 50 sheets; Web Worker with a 12 s hard stop, reader deadline 10 s |
| 3 list, 4 choose sheet | X2: row/column counts, first headers, "Suggested" sheet (best header match), hidden sheets marked |
| 5 read, 6 propose, 7 flag, 8 confidence, 9 correct | X3: headers normalised; synonyms → High; significant-word overlap → Medium; value pattern only → Low suggestion, never selected; two columns for one field or one column for two fields → "Ambiguous: choose one"; a plain "Reason" resolves only when one rating column exists; required (name), course-required (interest + reason, A25) and recommended fields listed; unmapped columns "will not be imported"; every student change recorded (`correctedByStudent`) |
| 10 preview, 11 duplicates, 12 required fields | X4: IDs not issued yet; per row Ready / Missing required / Duplicate? / Value not recognised / Formula: check / Imported as incomplete; duplicates in the file and against the register (normalised exact, then word similarity ≥ 0.85), exact duplicates skipped by default; Skip · Import as new · Merge into STK-x (fills only empty fields); unrecognised enumeration values flagged and left empty; missing interest flagged, never filled; ≤ 2,000 rows, ≤ 50 columns, ≤ 4,000 characters per cell (overflow reported, never silently dropped) |
| 13 approve | X5: summary, "A restore point is made first", checkbox "I have reviewed these records and take responsibility for them" |
| 14 one transaction | `store.importMerge`: a pre-import version, then one `import` change set; any refused operation refuses all (tested) |
| 15 provenance | each created artifact: `provenance {kind:'imported', from:{format:'xlsx', file, sha256}}`, `attributes.import` (file, SHA-256, sheet, row, time, mapping with the student's choices), `importRow`; merges add `attributes.importMerges`; change-set rationale states file, sheet, mapping and counts. X6 lists the created IDs and offers "Undo this import" (restores the pre-import version as a new revision) |
| AI | `xlsx/ai.ts`: provider interface, the only provider is disabled, no network code; a future suggestion would be labelled "Suggestion (AI)" and never preselected |

Committed demo workbook (fictional, no real people): `docs/week1/samples/m6-stakeholders-sample.xlsx`, generated by
`src/project/xlsx/testWorkbook.ts` (`SAMPLE_SHEETS`); a test asserts the committed file still reads as generated.

## 3. Verification (current tree, 2026-10-21)

| Check | Result |
|---|---|
| `npx tsc -b` | clean for M6 code; one error in the concurrent W9 partial (above) |
| `npx tsc -p tsconfig.server.json --noEmit` | clean |
| `npx vitest run` (app) | 138 files, 3105 tests passed (new and changed tests in §3.1) |
| `npx vitest run -c vitest.server.config.ts` | 14 files, 363 tests passed (incl. `server/test/submissions.test.ts`, 16) |
| Student build (`vite build --mode student` + `node scripts/check-student-build.mjs`) | PASS: 32 student surfaces (the canvas parts, the empty canvas, Review & Submit and every field guidance record scanned with no ceiling, "goal" included), no course-server or publishing marker in the student build. (`npm run build:student` itself stops at the W9 `tsc` error) |
| `npx playwright test -c playwright.server.config.ts project-canvas.e2e.ts` | 2 passed: Demo C (incl. axe WCAG 2.2 AA: no serious/critical violation on overview, stakeholders, needs, Review & Submit) and Demo D |
| `server-two-session.e2e.ts` | 1 passed (approval panel on `#/project` unchanged); final run of both server specs together: 3 passed |
| `e2e/week1-flow.spec.ts`, `e2e/project.spec.ts` (default config, shared dev server) | updated for the new routes; 15 passed, 7 failed for reasons outside M6 (homepage `start-here`, archive banner, lecture slide counter, hand-off panel on the Learn redirect of `/week/1/examples`; listed in KNOWN_LIMITATIONS) |

### 3.1 New and changed tests

- `src/project/canvas/m6model.test.ts` (24): relation rules and integrity both ways, §14 labels on the fixture, A25 gate,
  approval rewrite fix, material-field detection, A/U, progress (a filled box that fails a criterion does not count),
  guidance completeness and strict text scan, migration of the pre-M6 baseline (export → import, IndexedDB reload),
  golden v3 files and the three importers, Review & Submit model.
- `src/project/canvas/canvas.test.tsx` (10): entry state, overview, no self-declared approval, guidance on focus with the
  eight items, table ↔ map ↔ detail on one model, conflicts, REL creation, A/U, description, Review & Submit states and notes.
- `src/project/canvas/canvasSurfaces.test.tsx` (3): strict student-text scan of every canvas part and Review & Submit.
- `src/project/xlsx/xlsx.test.ts` (21): limits, malformed and hostile packages, formulas, deadline, mapping, values, AI stub,
  preview, duplicates, commit with provenance, merge, rollback, undo, the committed sample.
- `server/test/submissions.test.ts` (16): M6 change sets accepted, approval still server-owned, authorization table,
  blocks, immutability (API and database triggers), supersede, decision rules, anchors, feedback visibility, audit.
- `e2e/project-canvas.e2e.ts`: Demos C and D (screenshots `SysML-audit-screenshots-2026-10-21/m6/`).
- Updated: `team.test.ts` (messages), `week1.test.tsx` (routes), `surfaces.test.tsx` (surfaces), `week1-flow.spec.ts`,
  `project.spec.ts` (routes). Tracked screenshots rewritten by the default-config run were restored byte for byte.

## 4. Demos

- **C** (one test, three browser contexts): student A creates the team project in the canvas, fills the proposal, sees
  "Request instructor approval" enabled only when the checks pass, requests; the instructor sees the frozen proposal and
  approves with a comment; A reloads and sees "Approved by the instructor" with the comment, the material fields locked;
  records two stakeholders with interest, two concerns and their conflict, a need traced to its stakeholder, concern and
  objective, a REL row selected from the map edge in the detail panel; progress updates; after a reload the data persists
  and teammate B sees it; Review & Submit: ready for review, submit (snapshot), the instructor opens the snapshot and returns
  it with feedback anchored to CON-002; A sees RETURNED FOR REVISION, the feedback and the anchor (also in the canvas).
- **D**: the sample workbook → sheets listed with "Suggested" → mapping with High confidence and the ambiguous "Reason"
  flagged, Next disabled → the student chooses "Reason for the interest" → preview flags the duplicate, the missing name, the
  formula and the unrecognised "high" → confirm with responsibility → STK-001…004 created, "high" left empty → the detail panel
  shows file, sheet, row and mapping → Export Project → a fresh browser imports the file and finds the same records and
  provenance.

## 5. Remaining (honest)

Not built: withdraw of a pending approval request; a downloadable copy of the
submitted snapshot; submission states mirrored into the document; per-field conflict panel (M2 item); drag-to-connect on the
map (LATER); faculty review of the guidance text; recording the M6 runs in `TEST_REPORT.md` (needed for PASSED). Week 8
continuity (Demo E) is M7. Details in `KNOWN_LIMITATIONS.md` (M6 section).

## 6. Faculty decisions to confirm (defaults applied)

1. The enterprise description is a progress criterion (one sentence) and part of the request gate; it is a material field (A26 list already named it).
2. Conflicting concerns are optional in Week 1 (criterion shown, never blocks); stakeholder REL conflicts keep their minimum of one.
3. Only "enterprise not named" and "approval never requested" block a submission (spec RS-11 default).
4. A record exported before M6 without interest values now reads "not ready" in the v3 `status` field (consequence of A25).

## 7. Independent review (`_source_cache/review/week1_m6_review.md`, CONDITIONAL): dispositions

| ID | Disposition | Evidence |
|---|---|---|
| H-1 | **Fixed.** Every import change set (merge or replace) received by the course server gets a version the SERVER writes (kind `pre-import`, label `Before import CHG-…`) and an `import_records` row (format, file, SHA-256 when known, created IDs, change set, restore point), keyed by the import's own id that the browser puts on the imported artifacts (`attributes.import.importId`). A browser can still not file its own version as `pre-import` (stored as manual). "Undo this import" restores exactly that version (course server: `GET /api/v1/projects/:id/imports/:importId`; browser storage: the id `importMerge` returns) and never "the newest pre-import version"; without a match it explains and restores nothing; when the project moved since the import it asks first (L-7). | `server/test/submissions.test.ts` "H-1" (project created from an imported file: SNP-001 is never the target; a manual version in between; unknown import 404; other team 404); `src/project/xlsx/xlsx.test.ts` "H-1 (browser storage)"; Demo D undo step on the course server |
| M-1 | **Fixed.** The tag end is found in one pass with the current quote character (only the opening quote closes a value); linear; the reader's deadline is checked inside long tags (L-2). | `xlsx.test.ts` M-1 ("Bob's list", `Members' "quoted" register`, a data-validation prompt with an apostrophe and `>`, single-quoted values with `"`), fuzz of 300 generated tags, a 200k `>` tag fails fast |
| M-2 | **Fixed.** The server computes the validation summary from the document it freezes (`reviewModel` + `validationReport`, the same pure code as the page); the browser's headline is kept only as `reportedByBrowser` and a mismatch is flagged on the instructor's page. | `submissions.test.ts`: a forged 7 of 7 is stored and shown as the server's own count, flagged |
| M-3 | **Fixed.** Rule: at most 10 submissions per project and week (superseded ones included), no resubmission of an unchanged project (same SHA-256), at least one minute between two submissions of a project (429); proposal and submission versions are outside the members' version quota (their number is bounded by these rules); superseded submissions leave the default instructor queue (`?all=1` shows them). | `submissions.test.ts` M-3 tests (unchanged → 409, interval → 429, eleventh → 409, quota excludes kept versions, default queue) |
| M-4 | **Fixed.** The submission carries the revision the team reviewed; the server refuses (409, "your project changed since you reviewed it") when the stored revision differs; the page refuses to submit while changes are unsaved or failed. | `submissions.test.ts` (stale revision 409); Demo C submits successfully with the reviewed revision |
| M-5 | **Fixed.** The conflicting-concerns example is CON-012 (community noise) conflicts with CON-006 (pad throughput), read from `aerolinkCase.ts`. | `canvas.test.tsx` M-5 |
| M-6 | **Fixed.** No live region over the eight items; one polite line "Guidance available for <field>." Below 1200 px the (i) buttons (now also in table cells, 24 px) open the guidance as a bottom sheet that takes focus and returns it on close. | `canvas.test.tsx` M-6; Demo C axe check |
| L-1 | **Fixed.** Submissions track migration 2: `BEFORE INSERT` triggers refuse a replacing insert over a kept snapshot or a submission row; a decided submission's decision columns are final (only returned → superseded). | `submissions.test.ts` (INSERT OR REPLACE refused for both; feedback rewrite and approved → submitted refused) |
| L-2 | Fixed with M-1. | as M-1 |
| L-3 | **Fixed.** The local header's part name (and encryption flag) must match the directory entry. | `xlsx.test.ts` L-3 |
| L-4 | **Fixed.** Text starting with `=`, `+`, `-`, `@` (not a number) is kept as text and flagged "looks like a formula". No export of registers to spreadsheets exists yet (documented). | `xlsx.test.ts` L-4 |
| L-5 | **Documented.** Week 7 reads the v3 `status`: `WEEK1_CHANGE_IMPACT_MATRIX.md` X9a, KNOWN_LIMITATIONS. Week 7 wording left to the Week 7 stream. | — |
| L-6 | **Fixed.** An optional conflict's missing rationale keeps that item a draft but no longer changes the concerns or relationships part state or the headline. | `m6model.test.ts` progress tests |
| L-7 | **Fixed.** Undo asks before removing later changes. | ExcelImport |
| L-8 | **Fixed.** Merge issues concern IDs only for concerns it adds. | `xlsx.test.ts` L-8 |
| L-9 | **Fixed.** "No AI service is used; the workbook is read in this browser, and only the records you approve are saved to your project." | ExcelImport |
| L-10 | **Not fixed** (documented): duplicate similarity stays word-set Dice, advisory. | KNOWN_LIMITATIONS |
| L-11 | **Not fixed** (pre-M6 server rule; documented). | KNOWN_LIMITATIONS |
| L-12 | **Fixed.** The charter examples are read from the Learn worked example (`content/learn/week01.ts` section l1); the prefix example notes that PRT and REL also need an owner. | `m6model.test.ts` guidance completeness |
| L-13 | **Fixed.** Interest and support later-use now point to Week 2 stakeholder assessment and engagement. | — |
| L-14 | **Fixed.** A generic `artifact.rationale` record for rationale fields of non-need items and relationships. | — |
| L-15 | **Fixed.** The submit confirmation takes focus and Cancel returns it; "I understand" moves focus to the enterprise name. | — |
| L-16 | **Fixed.** (i) 24×24 px; map labels and node IDs 13 px. | canvas.css |
| L-17 | **Partly fixed.** Edges read IDs and names; the objective select shows the objective text; the canvas message is announced once; retire reasons say "objective … My Project". `aria-invalid` on table cells not added (documented). | — |
| E2E | The 5 stale default tests corrected as the reviewer prescribed (lecture viewer behind the instructor view, Guided Practice route and banner, hand-off at `/week/1/project/instructions`, the `/week/1/examples` axe entry removed); `recharts` and `@xyflow/react` added to `optimizeDeps.include`. | §7.1 |

### 7.1 Re-run on the current tree (2026-10-21, after the fixes)

- `npx tsc -b`: clean for M6; Week 9 stream errors only (`src/content/lectures/week09/session2.ts`, `src/content/quizWeek9.ts`, `src/workbench/week9/requirements.ts` at times), not M6.
- `npx tsc -p tsconfig.server.json --noEmit`: clean.
- `npx vitest run`: 140 files, 3201 tests passed.
- `npx vitest run -c vitest.server.config.ts`: 15 files, 376 tests passed (`submissions.test.ts` 19).
- Student build (`vite build --mode student`) and `node scripts/check-student-build.mjs`: every M6 check passes (32 student surfaces, the canvas and Review & Submit scanned strictly, no course-server or publishing marker); the script still exits 1 because the Week 9 decks (`week09-session1/2.pptx`) are not built yet: 8 broken Week 9 deck links (Week 9 stream). `dist/` was rebuilt (`vite build`) so the faculty-notes markers are current.
- Server Playwright config (lock "m6fix"): `project-canvas.e2e.ts` Demo C (now submitting with the reviewed revision) and Demo D (now including "Undo this import" on the course server, restoring exactly the import's own pre-import version) and `server-two-session.e2e.ts`: 3 passed.
- Full default suite on a fresh private dev server (port 5391, own optimizer cache; temporary config removed afterwards): first run 77 passed, 64 failed; the failures re-run with one worker: 9 passed, 55 failed. `week1-flow.spec.ts` passes in full. `project.spec.ts` demo workflow passes every step and fails only its final "no console errors" check on a 502 from the `/api` proxy (no course server behind the default dev config), as does `week2-flow.spec.ts:73`: environment. The other failures are outside Week 1 and M6: Weeks 2–5 and 8 path cards, archives and lab walks (`week2…5,8-flow`), the retired practice workbench (`workbench.spec.ts`, M5), the lecture pages run outside their own config (`lectures*.spec.ts`, which have `playwright.lectures.config.ts`), `app.spec.ts:180` (rebuild notice) and the Week 9 stream (`week9-flow`, `lectures-week9`). They were not changed (outside M6 scope). The demo-workflow step (3) now opens My Project from the Lab page's hand-off with the keyboard, since the hand-off moved there (as the reviewer prescribed) and the Week 1 chrome has no top-bar link; the Lab brief shows the full hand-off (what to create, done when, evidence) with M6 wording (My Project, Review & Submit).
- Tracked screenshots rewritten by the runs were restored byte for byte; the lock was released.

## 8. Confirmation review (`_source_cache/review/week1_m6_confirmation.md`, CONDITIONAL, narrow): dispositions

| ID | Disposition | Evidence |
|---|---|---|
| N-1 | **Fixed.** Members cannot delete server-labelled `pre-import` or `milestone` versions (403; proposal and submission were already kept). Snapshot numbers are never reused: a per-project counter (`snapshot_counters`, submissions track migration 3, initialised from the existing maximum) keeps the highest number ever issued, read by `maxSnapshotNo` for every server writer. `GET /imports/:id` answers 410 unless the version still exists with kind `pre-import` and the label `Before import <its change set>`; the browser checks the same binding before restoring (offline: kind `pre-import`) and otherwise restores nothing and says why. | `server/test/submissions.test.ts` N-1 (the reviewer's sequence: delete refused; after a server-side prune the next manual version gets a higher number; undo lookup 410) |
| N-2 | **Fixed.** An import id already used by any project is replaced by a fresh server id (no 500); the other team's record stays intact. A save the server keeps refusing no longer blocks the tab until a reload: the banner "Keep my edits as a version and load the saved project" keeps the unsaved edits in History and reloads the saved project (save state cleared). | N-2 test (merge of another team's file: 200, own restore point, other record intact); `EditAccess.tsx`, `ProjectStore.reload` |
| N-3 | **Fixed.** The import id is also read from the last `attributes.importMerges` entry, so a merge-only import gets its bound restore point. | N-3 test |
| N-4 | **Fixed.** Trigger `kept_snapshot_no_update_onto`: an UPDATE (any conflict clause) cannot move a row onto a proposal or submission key. | N-4 test (UPDATE OR REPLACE refused) |
| N-5 | **Fixed.** Instructor page: "computed by the course server from the submitted snapshot; the team's own view may differ (a difference is flagged)"; the two code headers reworded. | — |
| N-6 | **Fixed (comment).** Server pre-import versions count toward the version quota and the oldest beyond ten may be pruned when the quota is full; Undo then reports the version is gone (410), never restores another one. | as N-1 |
| Info | Not changed: `rev` is read at the click (not when the dialog opens); the cap of 10 includes superseded/returned submissions with no instructor override; one polite line per field focus. | — |

Re-run (2026-10-22): `npx tsc -b` and `tsc -p tsconfig.server.json` clean; `npx vitest run` 146 files, 3318 passed; server 15 files, 380 passed; Demo C and Demo D on the course server (lock "m6fix2"): 2 passed.

