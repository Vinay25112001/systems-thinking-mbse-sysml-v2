# M3 report: content publishing (limited scope)

Date: 2026-10-21. Milestone 3 (Admin Content Management) of the Week 1 reconstruction, **limited scope per DECISION_LOG
A24**. Controlling design: `CONTENT_PUBLISHING_DESIGN.md`; security rules `SECURITY_ARCHITECTURE.md`; tables
`PROJECT_DATA_SCHEMA.md` §8; spec `docs/week1/spec/WEEK1_DESIGN_SPECIFICATION.md` §h (mockup `admin-publish.html`).
Status: **built and tested in the working tree; not committed.** Paths are relative to `learning-studio/`.

## 1. What is real and what is not

| Real (built, tested) | Not built (limited scope, recorded) |
|---|---|
| Content store in its own tables (`content_items`, `content_revisions`, `content_releases`, `content_release_items`) and its own repository module (`server/repo/content.ts`) | Faculty content table (`faculty_content_revisions`): slides and faculty notes stay code-authored (A24), so there is no faculty body to store yet |
| Lifecycle DRAFT → READY FOR REVIEW → PUBLISHED → SUPERSEDED / ARCHIVED; one open draft per item (unique index); version check on draft saves (409 names the other editor and time) | Week 1 Overview (`w01.overview`) and the Learn outline (`w01.learn`, section reordering): spec §h lists them; the task scope is the course introduction and the Learn sections |
| Seed at first start: every code-authored item becomes **r1 PUBLISHED in REL-0001** (idempotent; new code items get their own seed release; a later TypeScript change is flagged "Code changed", never applied silently) | Section titles, structure of lists and of the homepage (number of paragraphs) are read-only |
| Immutable history enforced in SQLite: body frozen once a revision leaves draft, published/superseded/archived rows never deleted, terminal states, append-only releases (triggers) | Definitions, tables, equations, worked steps, figures and interactive figures are read-only (see §5) |
| Structured editing (no HTML): paragraph, heading, list and callout text; add/delete paragraphs; move blocks; course-introduction text fields; department label + "verified" flag | Second-reviewer workflow (FD-C2 default: self-review, both steps recorded), release revert, raster upload, references add-new, student word-level diff (FD-C4 default: badge only) |
| Validation shared by editor and server; errors block mark-ready, plan and publish (citations in the register and in range, quotations verbatim, read-only blocks, no HTML/script, student wording layer + leak rules, gap-free numbering on withdrawal) | Three-way stale-draft view: a stale draft needs an explicit "I compared…" acknowledgement and the block/word compare view instead (written deviation, §6) |
| Publish plan (diff summary, word delta, validation, stale flag, "Student data: none affected"), token bound to instructor + exact draft/published versions, 10-minute expiry, required change note; `409 plan-stale` | Plan tokens live in server memory (single process, D1); a restart invalidates open plans |
| History per item and release list; compare any two revisions (block level by stable id + word-level LCS, no new dependency); restore = new draft copying the old body (`restoredFrom`), then the normal publish path; withdraw (archive) with a reason | `npm run content:snapshot` → `public/content/release.json` for the Pages edition (design §7.3): the static build keeps the bundled code content |
| Student consumption: Learn reader and homepage read the latest publication when signed in to the server; bundled code content offline, on Pages and in the static student build; "Updated content available" banner (focus, visibility, route change, 5-minute poll); "Updated since you read it" badge | Progress stored on the server with the revision read (M6 progress store); the badge compares the local read time with the publication time |
| Instructor UI at `#/authoring` (content list, editor, validation, preview as student, compare, publish dialog, history, restore, discard, withdraw); "Content" link and "Edit this section" in Learn for signed-in instructors | `.pptx --from <lecture.json>` export (design §10.3): decks are unchanged because slides are not in the store |

## 2. How to use

```
cd learning-studio
npm run server:seed        # once (M2): demo instructor + students; passwords printed once
npm run server             # seeds the content store at first start (REL-0001), API on 127.0.0.1:5174
npm run dev                # Vite on 5173, /api proxied
```

1. Sign in as the instructor (`#/signin`). The top bar shows **Content** (`#/authoring`).
2. Pick an item: the course introduction, the course settings (department label), or a Week 1 Learn section (chapters
   → sections, with state chips and the filters "Has draft" / "Ready to publish"). In Learn, "Edit this section" under a
   section heading opens the same editor.
3. Edit the text. The validation panel updates live; **Save draft** stores the draft (students still see the published
   version). The server's normalised copy replaces the working copy after every save.
4. **Preview as student** renders the real Learn reader (or homepage) with the draft, using the student wording layer,
   register footnotes and gap-free numbering.
5. **Mark ready for review** (optional with self-review) and **Review and publish**: the dialog shows the plan; a change
   note is required; **Publish to students** creates a release.
6. Students who are signed in see "Updated content available … Show the update" on their next focus, route change or
   5-minute check; a reload shows the new text directly.
7. **History**: every revision with state, author, time, change note and release; **Compare** any two revisions;
   **Restore rN** creates a new draft from rN, which is then published through the same dialog. **Discard draft** and
   **Withdraw from students** are confirmed (withdraw needs a reason).

## 3. Endpoints and authorization (`server/services/contentRoutes.ts`)

S = student, A = admin without the instructor role, I = instructor. Every route needs a session; anonymous = 401. Every
POST/DELETE needs JSON, an allowed Origin and the CSRF header. Hidden routes answer 404 (no enumeration).

| Endpoint (`/api/v1/…`) | S | A | I | Notes |
|---|---|---|---|---|
| `GET content/release` | ✔ | ✔ | ✔ | `{releaseId, publishedAt}`, ETag, `no-cache`, 304 |
| `GET content/course` | ✔ | ✔ | ✔ | published course introduction + settings (`assemble`, published rows only) |
| `GET content/weeks/1` | ✔ | ✔ | ✔ | published Learn sections + withdrawn ids; other weeks 404 (bundled, design §7.4) |
| `GET authoring/items`, `GET authoring/items/:id`, `GET …/revisions/:rev`, `GET authoring/releases` | 404 | 404 | ✔ | list with states; item with history, draft + validation, published, seed |
| `GET authoring/preview/:scope?item=` | 404 | 404 | ✔ | the student assembly with the open draft as override |
| `POST authoring/items/:id/draft` | 404 | 404 | ✔ | create/update the one open draft; `version` check (409); 512 KB |
| `POST …/draft/ready`, `POST …/draft/return`, `DELETE …/draft` | 404 | 404 | ✔ | ready refuses with 422 on errors; discard deletes only the open draft |
| `POST …/restore {revisionId}` | 404 | 404 | ✔ | new draft copying a non-draft revision; 409 while a draft is open |
| `POST …/archive {note}` | 404 | 404 | ✔ | Learn sections only; refuses sections referenced by number (422) |
| `POST authoring/publish-plan {items}` | 404 | 404 | ✔ | plan + token (10 min) |
| `POST authoring/releases {planToken, note, acknowledgeStale?}` | 404 | 404 | ✔ | 409 `plan-stale` / `stale-draft`, 422 on errors, 400 without a note |

Admin without the instructor role gets 404 on `authoring/*`, following `SECURITY_ARCHITECTURE.md` §5.2 ("✘ unless also
I") and ADM-01. **Written deviation from the M3 brief**, which said "instructor/admin": the controlling design wins; the
faculty owner holds both roles.

Audit entries (no bodies): `content.seed`, `content.draft.save`, `content.ready`, `content.return`, `content.discard`,
`content.restore`, `content.archive`, `content.publish` (with release and self-review flag).

## 4. Data and isolation

- Tables: `PROJECT_DATA_SCHEMA.md` §8 plus `content_items.title/sort/seed_sha256` and `content_release_items.action`
  (`publish` | `archive`; a withdrawal is a release so students' release check notices it).
- **Own migration track** (written deviation from `PROJECT_DATA_SCHEMA.md` §12): `content_schema_migrations`, run right
  after the main track in the same connection. Reason: the main track is being extended concurrently by M6; two
  "version 3" migrations would collide. Same forward-only rules; merging into the main track later is a renumbering.
- A publish, restore or withdrawal touches only `content_*` and `audit_log`. Test: every other table (projects,
  changes, snapshots, teams, memberships, users, approvals, faculty notes, and any table M6 adds) is byte-identical
  before and after; a second test greps `server/repo/content.ts` and finds no other store's table named.
- Bodies are the **evaluated** code content (design §1): a Learn section body is the resolved block list (sentence cuts
  applied, slide figures resolved, slide pointers dropped), each block with a stable id `b001…` in source order; new
  paragraphs take the next number above the highest ever used (never reissued).

## 5. Limits of the limited scope (validation rules)

- Editable: paragraph, heading, list-item and callout text; course-introduction text fields; department label and its
  "verified" flag. Paragraphs can be added, deleted (unless they carry attached footnotes) and blocks moved.
- **Read-only** (must equal the seed revision r1; the server stores the seed block whatever the client sends):
  definitions (a quoted definition stays tied to its verified source; changing it needs a developer edit of the TS seed
  and a new item revision path, not in scope), tables (computed from case data), equations, worked steps, figures,
  interactive figures, attached footnotes, extension-reading flags, section titles, homepage structure, stage names.
- Every quotation (“…”) in a seed paragraph must survive verbatim; a new quotation is a warning; a removed citation is a
  warning.
- Inline citations (`R11 p.552`) must name a register entry and stay inside its verified page range; a bare code is a
  leak error. The homepage has no inline citations.
- The student wording layer (`studentText`) is applied before the leak rules (`studentScan.ts`), exactly as students
  read the text. Gap-free numbering: withdrawing a section renumbers the chapter (student edition rules), and sections
  whose number other text writes out (`NUMBER_REFERENCED_SECTIONS`, kept equal to the literal ids by a test) cannot be
  withdrawn; a chapter cannot lose its last section.
- The course introduction and settings cannot be withdrawn (publish a new version instead).
- A draft may be saved with errors (it carries its validation); a refused structural change (e.g. an added heading, an
  edited definition) is reported and dropped from the stored draft.

## 6. Deviations from the design (written reasons)

| Design | Built | Reason |
|---|---|---|
| One migration track (§12) | Content track `content_schema_migrations` | Concurrent M6 migrations; avoids version collisions |
| Stale draft: three-way view (design §4.2) | Stale flag in the plan + compare view + explicit acknowledgement (`acknowledgeStale`) | Limited scope; the compare view already shows published → draft at block and word level |
| `authoring/*` for instructor (and the brief's "admin") | instructor only; admin alone 404 | `SECURITY_ARCHITECTURE.md` §5.2 controls |
| Seed via `npm run content:seed` (design §10.1) | Seed at first server start and lazily on the first content request | Task: "seed at first start (idempotent)"; same evaluated modules |
| Releases group several items | API accepts up to 100 items per plan; the UI publishes one item per release | Limited scope UI |
| Draft autosave with If-Match | Explicit "Save draft" with the version check; unload warning while unsaved | Demo A names "saves a draft"; autosave can follow |

## 7. Tests (run 2026-10-21)

| Check | Result |
|---|---|
| `npx vitest run -c vitest.server.config.ts` | 14 files, **363 passed** (whole server suite; M3 adds 99: `content.test.ts` 22 — seed validity/idempotency, ETag 304, Demo A on the API, one draft + version conflict, ready/return/discard, paragraph ids never reissued, 7 validation refusals, read-only definitions, quotations, intro/settings rules, plan expiry/ownership/stale, archive + stale acknowledgement, DB triggers, store isolation, SQL table grep; `content.authz.test.ts` 75 — every content route × anonymous/student/admin-only/instructor, CSRF on every write, leak crawl with a draft marker proven findable through instructor routes; `contentClient.test.ts` 2 — the SPA's sync code against the real server) |
| `npx vitest run src/publishing` | 11 passed (seed renders identically to the code for all 11 chapters; reference list = literal ids; diff; fallback offline; published text when signed in; banner instead of swap, then "Show the update"; "Updated since you read it"; withdrawn section + gap-free numbering; homepage lede and verified department) |
| `npx vitest run` (whole frontend) | 135 files, 3089 passed, 2 failed — both in `src/project/**` (M6, in progress: `m6model.test.ts`, `isolation.test.ts`); `src/week1`, `src/pages`, `src/flow`, `src/publishing` 144/144 |
| `npx playwright test -c playwright.server.config.ts` | **2 passed** — `e2e/publishing-demo-a.e2e.ts` (Demo A, all ten steps, instructor and student in separate browser contexts, 8.8 s) and the M2 two-session spec; lock `_source_cache/.playwright.lock` = `m3`, released; screenshots off, output in `test-results/server-e2e` |
| `npx tsc -b` | my files clean; the run currently fails only on `src/week1/week1.test.tsx:176` (M6 work in progress) |
| `npm run build:student` | blocked at its `tsc -b` step by the same M6 file; `vite build --mode student` + `node scripts/check-student-build.mjs` run directly: **PASS**, including the new `--- publishing ---` check: "none of 5 course-server/publishing markers present (offline-only)" in `dist-student`, "5 of 5 present" in `dist/` (both directions) |

Demo A evidence (`e2e/publishing-demo-a.e2e.ts`): the student creates a team project; the instructor opens Content → Week 1
Learn → 4.1, appends a sentence, saves (draft r2 based on published r1); the student still sees r1 after a focus check
and a reload; the preview shows the sentence with student numbering 4.1; the plan shows r1 → r2, "1 changed", "None
affected", the button is disabled until a change note is typed; after publishing (REL-0002) the student's text is
unchanged until the banner "Updated content available. Week 1 was updated (1 section)." is used, then shows the
sentence, also after a reload; the SHA-256 of the team project (document, version, saved versions) is identical before
and after; history shows r2 published with its note and r1 superseded; Restore r1 creates draft r3 "restored from r1"
with the original text, compare shows "1 changed", publishing it (REL-0003) brings the original text back for the
student; the student's project fingerprint is still identical and `authoring/*` answers 404 to the student.

Mutation checks (temporary edits, restored): student view including drafts → 8 failures; applying a new release
without the banner → 1 failure; read-only definition check off → 1 failure; opening `content.author` to everyone in
`authorize()` alone → 0 failures, because every authoring handler re-checks through `asInstructor` (second layer);
removing both layers → 27 failures.

## 8. Faculty decisions touched (defaults applied)

FD-C1 (cutover; not performed: the TypeScript stays the offline/pptx source, the store is authoritative on the server and
"Code changed" flags drift), FD-C2 (self-review, recorded), FD-C4 (badge only), FD-C5 (not built). Department label:
placeholder per A24, shown to students only when set **and** marked verified.

## 9. Review dispositions (`_source_cache/review/m3_publishing_review.md`, verdict SIGN-OFF WITH MINORS)

| ID | Disposition | What changed | Evidence |
|---|---|---|---|
| M1 | **Fixed** | A paragraph whose seed text quotes a source (“…”) must keep every citation the seed paragraph carried: removing one is the error `attribution-removed` (editor and server; mark-ready, plan and publish refuse). A removed citation in a paragraph without quotations stays a warning. | `server/test/content.review.test.ts` M1 (2) |
| L1 | **Fixed** | Content migration 2: `content_revision_frozen` (published, superseded and archived rows accept only a permitted state transition with its own timestamp columns; no metadata-only update, no change of note, author, publisher, times, seq, release, version), `content_releases_no_update`, `content_items_identity`; `setState` refuses `from === to`. | L1 test: 10 direct-SQL updates refused; publish → supersede still works |
| L2 | **Fixed** (repair) | A non-seed `bNNN` is accepted only when the open draft or the published revision uses it; otherwise it is stored under the next free id (warning `block-id-repaired`), so a retired id is never reissued and a forged high id cannot break the next save. Ids are `b` + 3–5 digits (cap 99999); duplicates are refused. | L2 tests (3) |
| L3 | **Fixed** | Format characters (`\p{Cf}`: zero-width, bidi, BOM; and U+00AD) outside quotations are the error `invisible-chars`; Greek/Cyrillic letters next to digits are `confusable`; citations and every leak rule run on NFKC text with format characters stripped (homepage and department label too). Quotation and citation comparisons read the text as written. | L3 tests: `R​11` → `invisible-chars` + `leak:register-code`; bidi/BOM/soft hyphen; Cyrillic; full-width digits |
| L4 | **Documented** | Markdown-style links (`[text](url)`) and bare https URLs render as plain text: there is no link renderer, React escapes everything, and HTML/`javascript:`/`data:text` are refused. No change. | — |
| I1 | Accepted | Withdrawal needs CSRF, a reason and the confirmation dialog, not a plan token (design §4.4 requires the token for publish only). | — |
| D1 | Kept | Admin without the instructor role gets 404 on `authoring/*` (SECURITY §5.2); decision recorded separately by the integrator. | `content.authz.test.ts` |

Re-run after the fixes (2026-10-21): server suite 15 files **373 passed** (M3 adds 13 in `content.review.test.ts`);
`src/publishing` 11 passed; `tsc -b`: M3 files clean (the run currently stops on another agent's
`src/workbench/week9/requirements.ts:74`); `vite build --mode student` + leak check **PASS** (offline-only markers 0 in
`dist-student`, 5 of 5 in `dist/`); Demo A e2e **1 passed** (8.5 s; lock `m3fix`, released).
