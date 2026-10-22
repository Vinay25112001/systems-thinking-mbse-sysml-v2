# Content Publishing Design (M0, Week 1 first)

Status: **design, not built.** Written 2026-10-21 for M0, covering directive §5 (single source), §6.3 (instructor
capabilities) and §7 (publishing lifecycle, separate stores, students see the latest published version); the M3 scope
is in §18 of the directive. Security rules are in `SECURITY_ARCHITECTURE.md`, tables in `PROJECT_DATA_SCHEMA.md` §8,
and the stack in `docs/architecture/BACKEND_OPTIONS_AND_RECOMMENDATION.md`. Paths are relative to `learning-studio/`.

## 1. What exists today

| Source | Shape | Consumers | Faculty-only parts |
|---|---|---|---|
| `src/content/lectures/week01/session1.ts`, `session2.ts` (1,453 and 1,131 lines) | `Lecture` (`src/content/lectures/types.ts:96`): `sections[].slides[]` with `id`, `title`, `body: Block[]`, `figure`, `sources`, **`purpose`**, **`notes: FacultyNotes`**; plus `studentLesson: LessonSection[]` (`id`, `title`, `blocks: LessonBlock[]`, `sources`) | Slide viewer, lesson reader, handout, `scripts/build-lectures.mjs` (`.pptx` with speaker notes, notes Markdown, lesson Markdown; loads the TS through Vite `ssrLoadModule`, l.401–409) | `notes`, `purpose` (stripped by `student-edition.ts` in student mode) |
| `src/content/lectures/week01/aerolinkCase.ts` | Case data (stakeholders, goals, method coverage) | Lectures **compute** tables and text from it (e.g. `coverageTable` in `session1.ts:42-50`), figures, tests (`aerolinkCanonical.test.ts`) | — |
| `src/content/learn/week01.ts` (791 lines), schema `src/content/learn/types.ts` | `LearnSection` (id, code, question, inShort, body `BodyItem[]`, figures, worked, keyTerms, check, cite, readMore…). A `BodyItem` either **references** a reviewed lesson block by `{block, para, sentences}` or is new text marked `review: 'new-pending-review'` | Week 1 Learn reader | `SectionCheck.options[].correct/feedback` (in the bundle) |
| `src/content/quizWeek1.ts` | `QuizQuestion[]` with ids `w1q-1…` and `correct` + `explanation` per option | Week 1 Assessment | Keys and explanations (in the bundle) |
| `src/content/lab/week01Lab.ts`, `lectures/week01/labBrief.ts` | Lab instructions; minimums used by `src/project/model/milestones.ts:6` | Lab page, milestone expected artifacts | Grading notes, if any |
| `src/content/readings.generated.json` (from `_source_cache/verification/readings.py`) | Verified reference register (`R38` …) with verified page ranges | Citations everywhere; `validate.ts` checks every citation against it | — |
| `src/components/figures/registry.ts` | Figures are **React SVG components**, registered by id (`w1s1-soi-enabling`, …) | Viewer, lesson, `#/figure/:id`, pptx capture | — |

Consequences for the design:

- Content is code. Values are computed, imports cross modules, and figures are components. Publishing therefore
  operates on the **evaluated, serialised** form, not on TypeScript text.
- Paragraph-index references (`BlockRef.para`) are stable only while nobody edits. Once faculty can insert a paragraph,
  every later index shifts. Seeding must give every paragraph its own ID (§3).
- New diagrams cannot be authored in a browser editor; they are code. "Manage diagrams" in v1 means: select a
  registered figure, place it, and edit its caption, alt text and text equivalent (§9).

## 2. Principles

1. **One authored source per item at any time.**
   - Before M3 cutover, the TS module is authoritative.
   - After cutover, the **content store** is authoritative for migrated items (Week 1 and the course introduction). The
     TS module is frozen as the seed, and is never deleted (directive §5, §24).
   - Weeks 2–14 stay TS-authored and are served unchanged ("bundled" items, §7.4) until someone migrates them
     deliberately. Content production for the remaining eight weeks must not wait for the CMS (directive §21).
2. **Revisions are immutable once they leave DRAFT.** History is linear. A rollback is a new revision, never a mutation
   or reactivation of an old row.
3. **Student work is never touched by publishing.** Content, progress, projects, submissions and faculty material are
   separate stores (directive §7; schema doc §2). A publish writes only content tables and the audit log.
4. **Structured blocks only.** The editor edits the existing block union. There is no free HTML, and the inline markup
   is the existing two-token subset (§8).
5. **Accuracy over convenience.** The publish gate re-runs the existing citation and register validation, so an edit
   cannot silently detach a definition from its verified source (directive §5).

## 3. Stable content IDs (Week 1)

IDs are dotted, lower-case and permanent. **A number is never reused,** the same rule as course IDs in
`src/project/model/ids.ts`. Seeding derives them from IDs that already exist, so links, tests and analytics survive.

| Kind | ID pattern | Derived from | Example |
|---|---|---|---|
| Course introduction (homepage) | `course.intro.<slug>` | `src/content/learn/welcome.ts` sections | `course.intro.aerolink` |
| Week overview | `w01.overview` | `week1/Home.tsx` / `content/week1.ts` | `w01.overview` |
| Learn outline (ordered child list) | `w01.learn` | order of `LearnSection`s | `w01.learn` |
| Learn section | `w01.learn.<LearnSection.id>` | `learn/week01.ts` | `w01.learn.boundaries` |
| Lesson section (long form) | `w01.lesson.<LessonSection.id>` | `studentLesson[].id` | `w01.lesson.s1-lesson-system` |
| Paragraph or block inside a section | `<sectionId>#b<NNN>` | assigned in source order at seed; new blocks take the next number | `w01.lesson.s1-lesson-system#b004` |
| Slide | `w01.s<session>.<slide.id>` | `slides[].id` | `w01.s1.s1-soi-enabling` |
| Figure placement | `fig.<registry id>` | `FIGURE_REGISTRY` | `fig.w1s1-soi-enabling` |
| Worked example | `w01.example.<slug>` | Examples page / `Worked` entries | `w01.example.con014-need014` |
| Lab | `w01.lab.L1`, parts `w01.lab.L1.p<N>` | `content/lab/week01Lab.ts` | `w01.lab.L1.p2` |
| Assessment item | `w01.assess.<question id>` | `quizWeek1.ts` ids | `w01.assess.w1q-3` |
| Section check | `w01.check.<check id>` | `SectionCheck.id` | |
| Reference | `ref.<register id>` | `readings.generated.json` | `ref.R38` |

- At seed, `BlockRef {block, para}` in `learn/week01.ts` is rewritten to `{block: '<sectionId>#bNNN', sentences?}`.
  A seed test proves every reference resolves to the same text before and after.
- Moving a block keeps its ID. Splitting a block keeps the ID on the first part and gives the second part a new
  number. Deleting a block retires its ID, and the ID is never reissued.

## 4. Revisions and lifecycle

### 4.1 Revision record

```ts
type ContentState = 'draft' | 'ready-for-review' | 'published' | 'superseded' | 'archived'
type ContentRevision = {
  id: string                  // uuid; shown as "<itemId> r<seq>"
  itemId: string              // stable content ID (§3)
  seq: number                 // 1, 2, 3 … per item
  state: ContentState
  body: unknown               // student-visible structured blocks, validated per item kind (§8)
  bodySha256: string          // canonical JSON hash (canonicalJson from src/project/transfer/exportProject.ts)
  baseRevisionId?: string     // the published revision the draft started from (diff base; stale-draft detection)
  restoredFrom?: string       // set when this revision is a rollback copy
  authorId: string; createdAt: string; updatedAt: string
  submittedAt?: string; submittedBy?: string        // → ready-for-review
  publishedAt?: string; publishedBy?: string; releaseId?: string
  supersededAt?: string; archivedAt?: string; archivedBy?: string
  changeNote: string          // required at publish: what changed and why
  version: number             // optimistic-concurrency counter for draft autosave (If-Match)
}
```

Faculty-only parts of the same item (notes, purpose, worked solution, answer key) go in a parallel
`FacultyRevision {id, itemId, contentRevisionId, body}` row in a **separate table**. It has the same lifecycle and is
published in the same release (§6; `SECURITY_ARCHITECTURE.md` §6).

### 4.2 State machine

```
            save (autosave, If-Match)
  ┌──────► DRAFT ──── mark ready (validation: no errors) ────► READY FOR REVIEW
  │          ▲  └─ discard (draft only; audit) ─► (deleted)        │      │
  │          └────────────── return with comment ───────────────────┘      │ publish (confirm, §4.4)
  │                                                                       ▼
  │   new draft from latest published (base = it)                  PUBLISHED ── newer revision published ──► SUPERSEDED
  └──────────────────────────────────────────────────────────────── │
                                                                     └── archive (withdraw item) ──► ARCHIVED
  restore earlier revision R = new DRAFT whose body copies R (restoredFrom = R), then the normal path
```

- An item has at most **one open draft** (DRAFT or READY FOR REVIEW) at a time. A second instructor opening the item
  edits the same draft under version checks. On a conflict, the message names the other editor and the time, and
  offers "Reload their draft" or "Copy my text".
- **Stale draft:** if a newer revision was published after the draft's `baseRevisionId`, publishing is blocked until
  the instructor opens the three-way view (base → published → draft) and confirms.
- **Self-review:** a single-instructor course may mark ready and publish its own revision. Both steps are recorded. A
  second reviewer is FD-C2.
- **Archive** removes an item from the student view without deleting history. Assessment items that have attempts or
  submissions can be archived but never deleted.
- **Restore (rollback)** creates a new revision from an earlier one and publishes it through the normal confirm step.
  For a fast rollback of a whole release, see §5.

### 4.3 Releases

A publish acts on a **set** of revisions, because a Week 1 change often spans a section, its figure caption and the
outline. One publish creates a `content_release` with `id`, `publishedAt`, `publishedBy`, a note and
`items[]: {itemId, revisionId}`, all in one transaction. The previous published revisions of those items become
SUPERSEDED in the same transaction.

The **current release** is the newest release. A student's view is always the latest PUBLISHED revision of every item,
which equals the composition of all releases.

### 4.4 Publish confirmation

1. The instructor selects drafts in READY FOR REVIEW, or DRAFT with self-review, and clicks "Review and publish".
2. The server returns a **publish plan**:
   - the per-item diff summary (blocks added, changed and removed; word delta);
   - validation results;
   - stale-draft warnings;
   - assessment impact: "w01.assess.w1q-3 has 14 attempts and 3 submissions referencing r2; they keep pointing to r2";
   - a `planToken`, the hash of the plan, valid for 10 minutes.
3. The confirmation dialog shows the plan and requires a change note.
4. `POST authoring/releases {planToken, note}` publishes. The server refuses with `409 plan-stale` if any included draft
   or published head changed since the plan was made.
5. Audit entry `content.publish` with the release ID.

## 5. History, compare, rollback

- **History per item:** every revision, with state, author, timestamps, change note and release. **History per
  release:** what changed together.
- **Compare** any two revisions of an item. The diff has two levels:
  - block level: match by block ID (§3) into added, removed, moved and changed;
  - word level inside changed blocks: in-house longest-common-subsequence diff over tokens, about 100 lines, no new
    dependency (the licence rule is MIT/Apache only).

  Tables compare cell by cell. Figure placements compare their ID, caption, alt text and text equivalent.
- **Rollback of one item:** "Restore r2" creates rN+1 as a copy of r2's body (`restoredFrom`) and its faculty body,
  then goes through the publish confirmation.
- **Rollback of a release:** "Revert release X" creates a draft set that restores, for every item in X, the revision
  that was current just before X. It is then published as a new release. History stays linear and nothing is
  overwritten.

## 6. Preview and faculty-only separation

- **One assembly function.** `assembleStudentView(week, overrides?)` builds exactly the JSON that
  `GET /api/v1/content/weeks/:n` returns, from student-visible tables only.
  - Instructor preview calls it with `overrides = {itemId → draftRevisionId}`, so "Preview as student" is byte-for-byte
    the future student payload.
  - Instructor views add faculty bodies **after** assembly, through `faculty/*`.
- **Faculty fields:**
  - lecture `notes` (teach, why, figure walk, workedSolution, examples, misconceptions, transition, timing) and
    `purpose` (`src/content/lectures/types.ts:43-73`);
  - answer keys (`correct`, `explanation`, `feedback`);
  - lab grading notes;
  - rubric scoring notes;
  - exam banks (`src/instructor/exams`).

  Seeding splits them into `faculty_content_revisions` with the same AST walk that `student-edition.ts` and
  `scripts/check-student-build.mjs` already use, so the split is the one already proven.
- **Leak test:** `SECURITY_ARCHITECTURE.md` §6 item 5.

## 7. How students get the latest published version

### 7.1 Fetch

- `GET content/release` returns `{releaseId, publishedAt}`, about 100 bytes, with `ETag: <releaseId>`.
- `GET content/weeks/1` returns the assembled week, with `ETag: <releaseId>:<week>` and `Cache-Control: no-cache`, so
  the browser revalidates and gets `304` when nothing changed.
- The SPA keeps the last fetched week in memory and in IndexedDB, under a cache store separate from projects, for
  offline reading.

### 7.2 Update notification (no data loss)

- The SPA re-checks `content/release` on window focus, on route change and every 5 minutes while visible.
- **A new release never swaps text under a reader.** A polite live-region banner appears instead: "Week 1 was updated
  (2 sections). Show the update". Choosing it re-fetches content only. Project state, progress and practice live in
  other stores and are untouched (directive §7 test: "the student refreshes and sees the update, and the student's
  work is intact").
- **Progress keeps meaning.** Progress rows store `itemId` and the `revisionId` read (schema doc §4). When a section's
  published revision changed after the student marked it read, the section shows "Updated since you read it". A link
  to a word-level diff for students is FD-C4; the default is no diff, just the badge.

### 7.3 Static edition (Pages, offline)

- `npm run content:snapshot` exports the current release as `public/content/release.json`, containing student-visible
  bodies only.
- The static build's `StaticContentAdapter` reads that file. Pages shows the last published content with no server,
  and no faculty data ever enters that file. `check-student-build.mjs` gains a check that the file carries no faculty
  markers.

### 7.4 Bundled items (Weeks 2–14 until migrated)

- `ContentService.getWeek(n)` first asks the store. Items that were never seeded come from the existing TS modules
  through a `BundledContentAdapter`, which wraps today's `src/content/lectures/index.ts` and `learn/*` imports.
- Bundled items are labelled internally as `source: 'bundled'` and are not editable in the authoring UI. Students see
  no difference.

## 8. Item kinds, editing granularity, sanitisation and validation

### 8.1 Editing granularity

- Edit is **section-level**: one Learn or lesson section, one slide, one lab part, one assessment item, one overview.
- Inside a section, the instructor adds, removes, reorders and edits **blocks**.
- **Reordering sections** is a new revision of the outline item `w01.learn`, whose body is the ordered list of section
  IDs.

| Block kind (existing union, `lectures/types.ts:27-37`, `:79-87`, `learn/types.ts`) | Editable fields | Notes |
|---|---|---|
| `para`, `heading` | text | inline `**bold**`, `*emphasis*` only |
| `bullets` | items (two levels at most, as typed today) | |
| `definition` | term, text, **source** (citation picker over the register, page range) | The source is required; the text must be the source's wording or a marked paraphrase (A21 rules) |
| `table` | header, rows, caption | Cell text is plain. A table derived from case data carries `derived: {from: 'aerolinkCase.methodCoverage'}` (§10) |
| `callout` | tone, title, text | |
| `steps` (worked example) | label, text | The full solution goes in the faculty body |
| `equation` | display, speech, where[] | `speech` is required (screen readers) |
| `figure` | registered figure ID (picker), caption, alt, text equivalent | No upload in v1 (§9) |
| `slide-ref` / cross-reference | target content ID | Must resolve |
| Learn-specific: `question`, `inShort`, `keyTerms` (term, def, source or `'course'`), `check` (options; keys in the faculty body), `readMore`, `apply`, `convention` | as typed in `learn/types.ts` | |

### 8.2 Sanitisation

- Stored bodies are JSON validated against the kind's shape. Unknown keys are dropped, and strings get length caps and
  NFC normalisation, with control characters rejected (`SECURITY_ARCHITECTURE.md` §7).
- The text is rendered by the existing React components, which escape everything and use no `innerHTML`
  (`SECURITY_ARCHITECTURE.md` §9).
- Links: internal content IDs or hash routes, or `https:` URLs on the course allow-list.

### 8.3 Validation before "mark ready" and publish

Errors block the action; warnings are shown in the plan.

| Rule | Severity | Reuses |
|---|---|---|
| Every citation is a register entry and its page range lies within the verified ranges | error | `src/content/lectures/validate.ts` (citation and page checks), `readings.generated.json` |
| Every definition has a source, and every key term has a source or `'course'` | error | `learn/types.ts` contract |
| Every figure ID is registered and has alt text and a text equivalent | error | `validate.ts` figure registration and alt-text rules; `FigureSpec.textEquivalent` |
| Every cross-reference and BlockRef resolves | error | new (ID resolver) |
| Inline markup well-formed; no HTML tags or `javascript:` URLs | error | new |
| Slide word budget (`SLIDE_WORD_BUDGET = 60`) and session timing (75 minutes) | error for slides | `validate.ts` (`minutes-over`), `timing.test.ts` logic |
| Assessment item: exactly one correct option for single-choice; the key is in the faculty body; each option has feedback | error | `quizWeek1.ts` shape |
| Derived table still equals its recomputation from the case data | warning ("AeroLink case data changed; this table no longer matches") | `aerolinkCase.ts`, `aerolinkCanonical.test.ts` idea |
| Heading order (no skipped levels); table has a header row | warning | new |
| Fictional values labelled as FICTIONAL where the source module labelled them | warning | new (string check) |
| Change note present | error at publish | new |

## 9. Diagrams and references in v1 (honest limits)

- **Diagrams:** instructors place, reorder and caption **registered** figures, and edit alt text and text equivalents.
  A new figure needs a developer to add a React component to `FIGURE_REGISTRY`.
  - Raster upload (PNG/JPEG/WebP, at most 2 MB, magic-byte check, served with `nosniff` and CSP) is a "should" for M3
    if time allows.
  - SVG upload is **out**: SVG is an XSS vector unless sanitised, and no approved sanitiser is in the dependency
    budget.
- **References:** instructors can add an entry to the course reference list. It is stored as
  `ref.<new id>` with `verification: 'instructor-entered, not verified'` and shown with that label to instructors.
  Entries in the existing register keep `verified` status, which comes from the Python verification pipeline
  (`_source_cache/verification/readings.py`). The CMS cannot claim it verified a page range. Removing a reference that
  a published block cites is blocked until the citation is changed.

## 10. Seeding: TS modules become "published v1" without losing the pptx and notes pipeline

### 10.1 Seed (M3, one-time, repeatable in tests)

`npm run content:seed` starts Vite in middleware mode and loads the modules with `ssrLoadModule`. This is the pattern
already used by `scripts/build-lectures.mjs:401-409`, so there is no new tooling. The seed then:

1. evaluates `LECTURES` (Week 1 sessions), `learn/week01.ts`, `quizWeek1.ts`, `lab/week01Lab.ts`,
   `learn/welcome.ts` and the reading register;
2. runs `validate.ts` and refuses to seed invalid content;
3. splits faculty fields from student fields, using the same AST rules as `student-edition.ts`;
4. assigns content IDs and block IDs (§3), rewrites BlockRefs, and records `derived` markers on computed tables;
5. writes revision r1 of every item as PUBLISHED in release `REL-0001` ("Seed from source, git <sha>"), with
   `author = system`.

**Seed test:** the assembled student view of `REL-0001` renders the same text as today's TS-driven pages for every
section, compared through the existing Markdown exporters (`src/content/lectures/markdown.ts`). After that, every
faculty marker that `check-student-build.mjs` extracts must be present in the faculty tables and absent from the student
tables.

### 10.2 Cutover

- Cutover happens after M3's acceptance demonstration A passes. From then on, Week 1 items are edited only in the
  store.
- The TS sources get a header comment, "Frozen seed of content release REL-0001 (date). The authoritative copy is the
  content store; do not edit". `content.test.ts` asserts that the seed output still equals r1, so an accidental TS edit
  fails a test instead of silently forking the content.
- Before cutover, no store edits are allowed, so there is never a moment with two writable sources.

### 10.3 The pptx, notes and handout keep working

- `npm run content:export-lecture -- --week 1 [--release <id>|--include-drafts]` reassembles a full `Lecture` object
  (`lectures/types.ts:96`) from the store: student bodies joined with faculty bodies. It writes the result as JSON.
- `scripts/build-lectures.mjs` gains a `--from <lecture.json>` input. It already works on a `Lecture` object after
  `ssrLoadModule` (l.404), so the change is confined to the loader. Figures are still captured from `#/figure/:id`,
  because figures stay code.
- Notes Markdown, lesson Markdown and the student-deck note blanking (`student-edition.ts` `stripDeckNotes`) are
  unchanged.
- **Optional pptx stays optional** (directive §9): it is an instructor action, and so is the export.

## 11. Assessment versioning

- An assessment item is a content item. Its published revisions are immutable.
- **Attempts** (`assessment_attempts`) and **submissions** (`submissions.content_refs`) store the exact
  `itemRevisionId`, plus the revisions of the lab instructions and rubric in force (schema doc §5.3).
- A past attempt or submission is always rendered with **its** revision, which students and instructors can fetch per
  the access rule in `SECURITY_ARCHITECTURE.md` §5.2.
- **A revised key never rescored anything automatically.** The instructor sees "r3 changed the key; 14 attempts were
  made against r2", and regrading is an explicit, audited instructor action (FD-C3).
- **Week 1 formative checks** are ungraded. Versioning still applies, so feedback stays interpretable.

## 12. Effort and scope cut (M3)

See `docs/architecture/BACKEND_OPTIONS_AND_RECOMMENDATION.md` §8 for the estimate.

- **Must:** seed, store, the lifecycle (draft, ready, publish, supersede, archive), releases, the publish plan and
  confirmation, history, item restore, the block editor for `para`, `heading`, `bullets`, `definition`, `table`,
  `callout`, `figure` (registered) and `steps`, validation reuse, preview, update notification, faculty separation and
  the leak test.
- **Should:** word-level compare UI (block-level compare is a must), release revert, pptx `--from` export, references
  add-new.
- **Defer past 2026-12-01:** raster upload, migrating Weeks 2–14 into the store, a second-reviewer workflow, a student
  diff view.

## 13. Faculty decisions (content)

| ID | Decision | Default |
|---|---|---|
| FD-C1 | Cutover: after M3 acceptance, Week 1 content is edited only in the app (TS frozen as seed) | Yes |
| FD-C2 | Must another person review before publishing (READY FOR REVIEW by a second instructor)? | No; self-review is recorded |
| FD-C3 | Regrading policy when an assessment key changes after attempts | Never automatic; instructor-initiated |
| FD-C4 | Show students what changed in an updated section? | Badge only |
| FD-C5 | May instructors add unverified references (labelled)? | Yes, labelled "not verified" |
