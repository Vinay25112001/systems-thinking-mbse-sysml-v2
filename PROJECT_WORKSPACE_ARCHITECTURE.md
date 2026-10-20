# Project Workspace Architecture

**Status:** design, ready to implement. Written 2026-10-19 under DECISION_LOG A22 and the master development directive
(`docs/directives/2026-10-19_MASTER_DEVELOPMENT_DIRECTIVE.md`, "the directive"). No application code was changed to
write it.

**Companion documents:** `CANONICAL_ENGINEERING_DATA_MODEL.md` (the schema), `CROSS_PHASE_TRACEABILITY_PLAN.md` (trace
journey, SysML mapping, change impact, the Week 8 transformation), `UPDATED_IMPLEMENTATION_ROADMAP.md` (increments,
dates, the P1 build spec) and `UI_UX_REDESIGN_PROPOSAL.md` (visual system and navigation, written separately; this
document names screens and routes and leaves their look to that proposal).

All paths below are relative to `learning-studio/` unless they start with a repository-root file name.

---

## 1. Audit of the existing implementation

### 1.1 Headline findings

1. **There is no project.** Team work lives in six independent per-week records, each under its own localStorage key
   (`w1.team` inside `wb-artefacts`, then `w2.record`, `w3.record`, `w4.record`, `w5.record`, `w8.import`). Weeks are
   chained by exporting a JSON file from week N and importing it into week N+1, which stores a **read-only snapshot
   copy** of the earlier week (`Week1Snapshot` in `src/workbench/week2/record.ts`, `Week2Snapshot` in week3,
   `Week3Snapshot` in week4, `Week4Snapshot` in week5). Editing a Week 1 need after Week 2 has started does not reach
   Week 2, 3, 4, 5 or 8 unless the student re-exports and re-imports every link of the chain.
2. **Traces are free text.** Cross-artifact links are typed into string fields and parsed by regex: need sources
   (`sourcesOf`, `concernsOf` in `src/workbench/week1/team.ts`), requirement `parents`, risk `affects`, technology
   `affects`, function `capabilities`/`scenarios`/`requirements`/`log`/`phy`, interface `endA`/`endB`/`crosses`/`risks`
   (week2–5 `record.ts`, `idsIn`/`ANY_ID`). There is no relationship entity, so referential integrity is checked per
   week, after the fact, and only against that week's snapshot.
3. **Imports overwrite silently.** `TeamView.importJson` (`src/workbench/week1/TeamView.tsx` l.175–189) replaces the
   whole Team Record with `wb.setArtefact(TEAM_KEY, () => res)`. Weeks 3–5 label the field "replaces the record in this
   browser" but never confirm and keep no backup; there is no `confirm`, dialog or pre-import snapshot anywhere in `src/`
   (grep: zero hits). This violates directive §3.C.6 ("never silently overwrite").
4. **Practice and team data share one blob.** The Week 1 lab tool (`#/week/1/lab/tool`) and the optional AeroLink
   practice (`#/week/1/examples/practice`) both mount the same `WorkbenchProvider` for week 1
   (`src/week1/Workbench.tsx` → `EmbeddedWorkbench`, `src/flow/Practice.tsx` l.234). The team's record is the key
   `w1.team` inside the same `wb-artefacts` object that holds the AeroLink practice artefacts (`w1.l1`, `w1.loops`,
   `w1.stakeholders`, `w1.needs`). Isolation is by key name only. The workbench's top-bar export
   (`src/workbench/WorkbenchShell.tsx` l.188) writes **both** into one file labeled "Practice workbench export. All
   AeroLink values are FICTIONAL", which mislabels the team's real data.
5. **IDs are stable within a week, not across weeks.** Each record keeps its own `issued` counters, so a deleted ID is
   never reused inside that record (a good, tested property). Across weeks, counters collide: Week 4 issues `EXT-001`
   from zero (`src/workbench/week4/record.ts` l.104) while Week 1 already issued `EXT-001` for a different context
   element; Week 4 issues `DEC-001` while the Week 3 trade study has no DEC ID at all. Week 5 interface requirements
   continue the REQ-SYS numbering only by reading the Week 4 snapshot (`week5/record.ts` l.224–227).
6. **The validation logic is the asset.** Every week's `record.ts` is pure, never throws on load (`normalize*`), checks
   every gate in both directions in its `record.test.ts`, and reads its minimums from the lecture's `labBrief.ts`. The
   canonical project must reuse these checks, not rewrite them.
7. **Week 8 already does most of a baseline transformation**, for Week 1 (full) and Week 2 (IDs only):
   `src/workbench/week8/skeleton.ts` builds an `ImportSource`, a mapping matrix over the course's
   `MAPPING_KINDS` (`src/content/lectures/week08/labBrief.ts`), audit findings (defect / gap / unmapped / info) and a
   SysML v2 v0.1 skeleton validated by the course checker. It reads only files, not browser state, and its per-kind
   status vocabulary ("modeled now / mapped / not in the imported files / none in the package") is not the directive's
   per-artifact vocabulary.
8. **A canonical engineering model already exists, for AeroLink.** `src/model/engineering.ts` defines `Element`
   (27 kinds), `Link` (10 typed relationship kinds with allowed source/target kinds in `LINK_RULES`), `validateModel`
   (duplicate, malformed, dangling, disallowed and self links), `requirementCoverage`, `impactSet` (BFS over links) and
   `threadsFrom` (the 11-step digital thread). `src/state/Workspace.tsx` persists one such model with
   never-reused IDs. It is used only for the AeroLink practice model (`#/workspace/model`) and is seeded from the
   instructor reference. It is the natural core of the project's relationship layer.
9. **Storage failures are mostly invisible.** `saveJSON` returns `false` on failure, but every lab tool ignores the
   result (`Week2LabTool.tsx` l.123–125 and siblings). Only the workbench status bar reports "Storage unavailable"
   (`src/workbench/shell/StatusBar.tsx` l.66). There is no quota check, no snapshot and no recovery.
10. **The student build already strips faculty notes and exam banks** and proves it can detect a leak
    (`student-edition.ts`, `scripts/check-student-build.mjs`). Instructor review mode is a runtime toggle that still
    ships in the student build (`src/App.tsx` `InstructorToggle`, `src/pages/InstructorReview.tsx`).

### 1.2 Reusable functionality (keep, wrap, or extend)

| Asset | Path | Reuse in the workspace |
|---|---|---|
| Guarded storage helpers | `src/lib/storage.ts`, `src/lib/usePersistentState.ts` | Keep for practice and UI preferences; the project gets its own store (§5) |
| Hash router | `src/lib/router.tsx` | Add `#/project/...` routes; no router change needed |
| Canonical AeroLink model, link rules, validation, impact, threads | `src/model/engineering.ts` | Base vocabulary for project relationships (superset, see the data model doc §6); `impactSet` and `threadsFrom` reused over a projection of the project |
| Week 1 Team Record logic: normalize, checks, Markdown, model inputs v3, import v1–3 | `src/workbench/week1/team.ts` (719 lines), `needQuality.ts`, `stakeholders.ts` | Kept unchanged; becomes the validation and legacy import/export layer of the Week 1 editor via a projection adapter (§8) |
| Week 1 lab tool UI | `src/workbench/week1/TeamView.tsx` (576 lines) | Kept; its read/write lines (l.161–183) switch to a `useTeamRecord()` hook backed by the project |
| Week 2–5 records and tools | `src/workbench/week{2..5}/record.ts`, `Week{N}LabTool.tsx` | Same projection pattern in P2; their snapshot import is replaced by a projection of the project |
| Week 8 import, mapping, audit, SysML generator | `src/workbench/week8/skeleton.ts`, `state.ts`, `labBrief.ts` | `sourceFromProject()` replaces file import; generator and audit unchanged; mapping statuses added per artifact |
| Undo/redo and change coalescing | `src/workbench/changes.ts` (`shouldCoalesce`, `diffSnapshots`) | Pattern reused for revision coalescing |
| Provenance and owner fields | `src/components/ProvenanceOwnerFields.tsx` (`ownerProblem`, `STUDENT_PROVENANCE`) | Initials validation for the self-declared editor; provenance tags extended |
| AeroLink-name guard | `isAeroLink`, `proposalNamesAeroLink` in `team.ts` | Reused to keep AeroLink content out of project fields unless explicitly copied |
| Download helper | `src/workbench/download.ts` | Project export |
| Test fixtures | `src/workbench/week1/teamFixture.ts` (fictional food-bank team, passes every check) | Round-trip and migration tests |
| Student-edition plugin and leak check | `student-edition.ts`, `scripts/check-student-build.mjs` | Extended with project-related markers (§9) |

### 1.3 Every place student or team data is stored today

All keys are in `window.localStorage` with the prefix `sysml-studio:v1:` (`src/lib/storage.ts`). Nothing uses
IndexedDB or sessionStorage.

| Key | Owner (writer) | Content | Whose data |
|---|---|---|---|
| `wb-artefacts` | `WorkbenchProvider` (`usePersistentState`) | Object of week artefacts: **`w1.team` = the Week 1 Team Record** (`TeamRecord`, `team.ts`); `w1.l1`, `w1.loops`, `w1.stakeholders`, `w1.needs` = AeroLink practice activity state | **Mixed: team + practice** |
| `w2.record` | `Week2LabTool` | `Week2Record` incl. `week1: Week1Snapshot` | Team |
| `w3.record` | `Week3LabTool` | `Week3Record` incl. `week2: Week2Snapshot` | Team |
| `w4.record` | `Week4LabTool` | `Week4Record` incl. `week3: Week3Snapshot` | Team |
| `w5.record` | `Week5LabTool` | `Week5Record` incl. `week4: Week4Snapshot` | Team |
| `w8.import` | `Week8LabTool` | `W8State` (imported Week 1 `ImportSource`, Week 2 IDs, purpose, manual counts, dispositions, audit notes) | Team |
| `stakeholder-map` | `AppStateProvider` | AeroLink stakeholder map, seeded from `SEED_STAKEHOLDERS` (`src/model/airtaxi.ts`), positions, `issuedMax` | Practice |
| `workspace-model` | `WorkspaceProvider` | AeroLink engineering model (elements, links, issued) | Practice |
| `boundary` | `AppStateProvider` | AeroLink boundary classification | Practice |
| `mission-progress`, `mission-signals`, `wb-ui`, `wb-probe`, `layout:*` | Workbench | Mission completion, signals, view and panel layout | Per viewer |
| `quiz`, `completed`, `reviews`, `theme`, `instructor`, `welcome-seen`, `w1-flow-v2` | AppState, flow | Quiz answers, completion ticks, instructor review notes, preferences | Per viewer |
| `w07-trade-study`, `w05-tpm-selected`, week 11 RID practice store | Archive draft activities (`src/activities/week07/store.ts`, `week05/TpmTracker.tsx`, `week11/rids.ts`) | Old-outline activity state | Practice (archive) |

Downstream readers of team data: `src/flow/modelInputs.ts` (`teamRecordStatus`, dashboard), `src/week{2..5,8}/Readiness.tsx`,
`Week2LabTool.loadSavedWeek1` (reads `wb-artefacts['w1.team']`).

### 1.4 The Week 1 Team Record end to end

1. **Create.** `#/week/1/lab/tool` mounts `Week1Workbench kind="lab"` (`src/week1/Workbench.tsx`), which preselects
   the `team` view and mission `w1-m5-team` in `wb-ui`, then renders the embedded workbench. `TeamView` reads
   `teamArtefact(wb.state.artefacts)` = `normalizeTeam(artefacts['w1.team'])` and writes through
   `set(p) = wb.setArtefact(TEAM_KEY, prev => ({...normalizeTeam(prev), ...p, updatedAt: Date.now()}))` (l.161). The
   provider persists `wb-artefacts` on every change. IDs come from `nextId(record, prefix)` against the record's
   `issued` counters (never reused).
2. **Structure.** Six parts: charter (roles by initials, decision rules, norms, prefix ownership), enterprise proposal
   (ENT-001 name, domain, problem, mission MGO-001, goals MGO-002+, system of interest, PRT elements, suitability,
   instructor decision and date), context (EXT rows), stakeholder register (STK rows with nested CON concerns) and
   relationships (REL rows of seven types), needs (NEED rows with sources, concerns, goal, priority, six-check
   self-check, justification), and the AI usage statement.
3. **Validate.** Pure checks per part (`checkCharterPart`, `checkProposal`, `checkContextPart`, `checkRegister`,
   `checkRelationships`, `checkNeedsPart`, `checkAiStatement`), need quality (`needQuality.ts`), readiness states
   `not-ready / pending-approval / ready` (`recordState`, `contentState`). Approval is the student's own record of the
   instructor's decision with a past calendar date. Every gate is tested both ways in `team.test.ts` (441 lines).
4. **Export.** Markdown record (`teamMarkdown`) and JSON model inputs (`teamModelInputs`, format
   `week1-model-inputs`, **version 3**; each item carries the SysML v2 element it seeds). `exportedMdAt` /
   `exportedJsonAt` must postdate `updatedAt` for the export step to pass.
5. **Import.** `importModelInputs(text)` reads versions 1–3, checks list shapes, concern owners, ID forms per prefix and
   duplicate IDs, returns a normalized record or one actionable error. On success the tool replaces the stored record
   (finding 3).
6. **Downstream.** Week 2 starts from the file (`importWeek1` → `snapshotOf` → `withWeek1`) or from the copy saved in
   this browser (`loadSavedWeek1`, refuses AeroLink). Week 8 reads the file only (`Week8LabTool.onFile`).

### 1.5 Practice data and isolation

- The "Practice Canvas" of the directive does not exist under that name. Its current pieces are: the Week 1 practice
  workbench with AeroLink missions 1–4 (`#/week/1/examples/practice`, `src/content/missions/week01.ts`); the AeroLink
  engineering model page (`#/workspace/model`, `ModelWorkspacePage`, backed by `Workspace.tsx`); the AeroLink
  stakeholder ecosystem editor (`#/workspace/stakeholders`, backed by `AppState.map`); the case brief
  (`#/workspace/aerolink`). Weeks 2–5 and 8 have static worked-example pages with no interactive practice
  (`src/week{2..5,8}/Examples.tsx`: no state hooks).
- Isolation today: AeroLink practice lives in `stakeholder-map`, `workspace-model`, `boundary` and the practice keys of
  `wb-artefacts`. Team data lives in `wb-artefacts['w1.team']` and `w{2..5}.record`, `w8.import`. The two are separated
  by key, share one storage namespace and one in-memory workbench document (`Doc` in `WorkbenchProvider`, which undo
  restores as a whole), and leave in the same export file. The lab tools refuse AeroLink names in a few fields
  (`isAeroLink`), but nothing records where content came from, and nothing stops a student retyping AeroLink content.
- No reset exists for practice, so no practice action can wipe the team record today; that is luck, not design.

### 1.6 AeroLink canonical data

- **Case modules (single source per week):** `src/content/lectures/week0{1..5,8}/aerolinkCase.ts`. Week 1 is the
  course source for STK, CON, NEED and MGO (`aerolinkCanonical.test.ts` enforces it across all sources with an
  allowlist that cannot go stale). Weeks 2–5 import Week 1 data read-only and start from the instructor reference.
- **Instructor reference baseline:** `src/model/reference/week{01..08,12}.ts` (204 IDs, 381 links), assembled by
  `referenceUpTo(week)`.
- **SysML v2 reference model:** `sysml/reference/aerolink_v01..v04.sysml`, checker-accepted, with the course's
  realisation of every link type (`sysml/reference/README.md` §3.3) and drift/mapping tests
  (`src/model/reference/sysmlDrift.test.ts`, `sysmlMapping.test.ts`).
- All AeroLink data is FICTIONAL and instructor-owned. **None of it may be a default value in a team project.**

### 1.7 Functional vs stale

| Area | State |
|---|---|
| Weeks 1–5 and 8 lecture-first apps (`src/week{1..5,8}/`, `src/lectures/`), lab tools, lab briefs, case modules | Functional, reviewed (Week 1 conditionally approved, A21; Weeks 4 and 8 signed off) |
| Weeks 6, 7, 9–14 at `#/week/N` | Placeholder `RebuildWeek` in `src/pages/WeekPage.tsx`; only outlines exist in `docs/lectures/weekNN/` |
| `src/content/weeks/week02..13.ts` and `src/activities/week02..13/` | **Earlier-outline draft modules** (old A7 numbering), served only under `#/draft/<oldWeek>` (`content/weeks/index.ts`). Source material, not live content |
| Classic `WorkbenchShell` weeks via `hasWorkbench` | Only Week 1 has a missions module (`src/content/missions/week01.ts`) |
| `src/flow/*` (earlier self-study flow) | Kept, no longer routed; `EmbeddedWorkbench` still used |
| `#/archive/week/N` pages | Instructor review of earlier pages |
| `src/workbench/week1/export.ts` (`l1Markdown`) | Earlier L1 record export over the AeroLink model; not on the student path |

### 1.8 Uncommitted work in the tree (noted, not touched)

`git status` on 2026-10-19 shows uncommitted edits to old-outline draft material: `src/activities/week11/*`
(FlowCoverage, RidWriter, StateWalker, flow, rids, tests, new `usePracticeUnlock.ts`), `src/activities/week12/*`
(dispositions, planner, tests), `src/content/weeks/week09.ts`, `week11.ts`, `week12.ts`, and
`docs/authoring/week09/11/12_notes.md` (16 files, +951/−686), plus refreshed screenshots. These belong to another
workstream; the workspace plan does not depend on them and must not be built on top of them until they are committed.

### 1.9 Routes and navigation

`src/App.tsx` routes lecture paths first (`lectures/route.ts`), then the per-week apps (`week1Route` … `week8Route`),
`/welcome`, workbench weeks, and finally the classic shell with the sidebar `NAV` (Dashboard, Roadmap, 14 weeks,
three AeroLink pages, toolchain, progress, sources, instructor review). Each lecture-first week has its own `WeekShell`
and sub-navigation (`WEEK1_NAV` … Overview, Lecture, Lesson, Worked examples, Laboratory, Assessment). There is no
project entry anywhere, and the AeroLink pages sit under "AeroLink worked example (instructor's case)".

### 1.10 Student vs instructor build

`npm run build:student` (`vite build --mode student`, `.env.student` `VITE_EDITION=student`) strips every slide's
`notes` and `purpose` from lecture sources at compile time, blanks speaker notes in shipped decks, and removes exam
banks (`src/instructor/index.ts` glob is empty in student mode). `check-student-build.mjs` proves absence in
`dist-student/` and presence in `dist/`. Instructor review mode, the instructor review page and the instructor
reference model remain in the student build (they are runtime toggles and course material).

### 1.11 What must change

| # | Change | Why | Priority |
|---|---|---|---|
| C1 | One canonical project store, separate from practice storage | Findings 1, 4 | P1 |
| C2 | Relationships as entities with referential integrity; text fields become views of them | Finding 2 | P1 (Week 1), P2 (Weeks 2–5) |
| C3 | Import with a validation report and an explicit choice (new project / replace with backup / merge); pre-import snapshot always | Finding 3 | P1 |
| C4 | Project-wide ID counters; collision handling in legacy imports | Finding 5 | P1 |
| C5 | Lab tools become editors over the project through projection adapters; per-week snapshots retired | Findings 1, 6 | P1 (Week 1), P2 |
| C6 | Week 8 reads the project, keeps per-artifact mapping status | Finding 7, directive §9 | P1 preview, P3 full |
| C7 | Save status, quota, snapshots, recovery visible to the student | Finding 9 | P1 |
| C8 | Practice clearly labeled; explicit copy with confirmation and provenance | Finding 4, directive §3.B, §5 | P1 (Week 1) |
| C9 | Workbench export no longer includes team data | Finding 4 | P1 |
| C10 | Week 8 mapping covers every prefix the Phase I tools issue (CMP, VP, FG, ICR, I, SCREEN, TRD) | Data model doc §4 | P3 (course convention, needs instructor review) |

---

## 2. The four experiences mapped onto the app

| Experience | What it is | Existing routes/modules | Change |
|---|---|---|---|
| **A. Lecture Studio** (primary) | Slides, notes (instructor build), long-form lesson, worked examples | `#/week/N/lecture/*`, `#/week/N/lesson/*`, `#/week/N/examples` (`src/lectures/`, `src/week{N}/Examples.tsx`) | None to content. Each week page gains an "Apply to your project" link at the end of Examples and Laboratory |
| **B. Practice Canvas** | AeroLink sandbox; reset without touching the project | `#/week/1/examples/practice` (workbench missions), `#/workspace/model`, `#/workspace/stakeholders`, `#/workspace/aerolink` | Relabel as Practice Canvas (AeroLink); add a reset per practice area; add the Practice → My Project handoff panel; remove team data from the workbench export; later weeks get practice areas as P5 scope allows |
| **C. My Project** | The team's own enterprise: overview, milestones 1–14, artifact library, editors, history, export/import, traceability | **New** `#/project/*` (`src/project/`) | New module; Week 1 lab tool becomes an editor over it (P1); Weeks 2–5 (P2) |
| **D. MBSE Modeling Studio** | Weeks 8–14 on the same project: baseline transformation, mapping, model elements, SysML text, digital thread | `#/week/8/lab/tool` (`src/workbench/week8/`), `#/week/8/lab/checker`, `#/sysml` | `#/project/model` hosts the transformation view (left package, right model); the Week 8 lab tool opens it in project mode; Weeks 9–14 extend it (P3–P5) |

Navigation rule: **My Project is a persistent top-level entry** (sidebar first section, and a fixed link in every
`WeekShell` header). Practice pages carry a persistent "Practice: AeroLink (instructor example)" banner; project pages
carry the team enterprise name. Visual treatment: `UI_UX_REDESIGN_PROPOSAL.md`.

---

## 3. My Project modules

| Module | Route | Content | Built in |
|---|---|---|---|
| Overview | `#/project` | Enterprise name, mission, goals, problem, team members and roles (initials), approval status (as recorded), system boundary summary (SOI, PRT count, EXT count), milestone strip, save status, last export | P1 |
| Milestones | `#/project/milestones`, `#/project/milestones/:week` | Weeks 1–14: expected artifacts (from each `labBrief.ts`), completion state computed by the week's checks, outstanding tasks (failing gates), submission readiness, export for submission | P1 strip; P2 detail |
| Artifact library | `#/project/artifacts`, `#/project/artifacts/:type` | Table per artifact type: ID, title, status, validation, review flag, provenance, milestone; filter and search | P1 (Week 1 types); P2+ |
| Artifact detail / editors | `#/project/artifact/:id` and the week lab tools in project mode | Structured form, relationships in and out (typed, with rationale), revision history of the item, mapping status | P1 Week 1 (via TeamView); P2 Weeks 2–5 |
| History | `#/project/history` | Change log (who as self-declared initials, when, what, rationale), named versions (snapshots), restore as new state, compare two versions | P1 log + snapshots; P2 compare |
| Export / import | `#/project/transfer` | Whole-project JSON export, readable Markdown report, per-week legacy exports (unchanged formats), import with validation report and choice | P1 |
| Traceability and impact | `#/project/trace` | Trace matrix by journey step, orphans/childless, digital threads (`threadsFrom`), "needs review" queue with the change that caused each flag | P1 review queue for Week 1 links; P3 full |
| Model transformation (MBSE Studio entry) | `#/project/model` | Left: Phase I package by type; right: model packages and constructs; per-artifact mapping status; findings; generated SysML | P1 read-only preview; P3 full |

---

## 4. Code layout

```
src/project/
  model/
    types.ts            canonical types (CANONICAL_ENGINEERING_DATA_MODEL.md §3–§9)
    ids.ts              ID scheme, nextId, parse, legacy ID forms
    vocabulary.ts       artifact type registry + relationship vocabulary (allowed pairs, impact direction)
    integrity.ts        referential integrity + validateProject (extends model/engineering.ts validateModel)
    impact.ts           change impact (direction-aware BFS), needs-review flags
    projection.ts       project → EngineeringModel (for impactSet/threadsFrom reuse)
  store/
    adapter.ts          StorageAdapter interface
    indexedDb.ts        IndexedDB adapter (production)
    memory.ts           in-memory adapter (unit tests, storage-unavailable fallback)
    ProjectProvider.tsx React context: load, autosave, revisions, snapshots, tab lock, save status
    revisions.ts        change sets, coalescing, snapshot policy
  transfer/
    exportProject.ts    sysml-studio-project v1 writer (+ checksum)
    importProject.ts    reader, validation report, merge plan
    report.ts           readable Markdown report of the whole project
  adapters/
    week1.ts            TeamRecord ⇄ project (fromTeamRecord, toTeamRecord, diffTeamRecord)
    week2.ts … week5.ts (P2)  WeekNRecord ⇄ project
    week8.ts            project → ImportSource (sourceFromProject), mapping status
    legacy.ts           detect and import week1..5-model-inputs, week8-import, wb-artefacts['w1.team']
  pages/
    ProjectApp.tsx      route switch for #/project/*
    Overview.tsx, Milestones.tsx, Library.tsx, ArtifactPage.tsx, History.tsx, Transfer.tsx, Trace.tsx, ModelPreview.tsx
  practice/
    Handoff.tsx         Practice → My Project panel (per week, data-driven)
    copyFromPractice.ts explicit copy with confirmation and provenance
```

Boundary rule, enforced by a unit test that scans imports: nothing under `src/project/` imports `src/lib/storage.ts`,
`src/state/AppState.tsx`, `src/state/Workspace.tsx`, `src/model/reference/*` or any `aerolinkCase.ts`, except
`src/project/practice/copyFromPractice.ts`, which reads practice data and only through an explicit, confirmed action.

---

## 5. Storage design (local only)

### 5.1 Choice

**IndexedDB**, through a small in-house adapter (~200 lines, no new runtime dependency), with an in-memory fallback.

- localStorage is synchronous, shares a ~5 MB per-origin budget with every existing key, and cannot hold a 14-week
  project plus its revision log and snapshots with margin. IndexedDB has a far larger quota, transactional writes and
  `navigator.storage.persist()` support.
- Unit tests run against `memory.ts`; one adapter contract suite runs against both adapters (IndexedDB in Playwright;
  optionally `fake-indexeddb` as a free dev dependency so the same suite runs in Vitest; reversible choice).
- If IndexedDB is unavailable (some private modes), the app runs on the memory adapter with a persistent banner:
  "This browser is not saving your project. Export before you close the tab."

### 5.2 Database layout

Database `sysml-studio-projects`, version 1:

| Object store | Key | Value |
|---|---|---|
| `meta` | string | `activeProjectId`, `editor` (self-declared initials and optional display name), `schemaVersion`, `persistGranted` |
| `projects` | `projectId` | `ProjectDoc` (data model doc §3): project, team, artifacts, relationships, milestones, model elements, mappings, counters, `rev` |
| `changes` | `[projectId, seq]` | `ChangeSet` (data model doc §8) |
| `snapshots` | `[projectId, snapshotId]` | `{ id, at, kind, label, rev, doc: ProjectDoc }` |

Practice data stays in localStorage under `sysml-studio:v1:*`. The project and practice therefore live in different
storage mechanisms, different code modules and different export files.

### 5.3 Save, autosave and revisions

- Every edit is an operation applied to the in-memory `ProjectDoc` by `ProjectProvider.apply(ops, meta)`. Operations
  are validated first (integrity rules, data model doc §7); an invalid operation is refused with a message and nothing
  changes.
- Autosave: debounced 600 ms after the last operation, and immediately on `visibilitychange → hidden`, `pagehide` and
  route change. One IndexedDB transaction writes the new `ProjectDoc` (with `rev + 1`) and the `ChangeSet`.
- Coalescing: consecutive edits to the same field of the same artifact by the same editor within 60 s merge into one
  change set (pattern of `shouldCoalesce` in `src/workbench/changes.ts`), so the log records meaningful changes, not
  keystrokes.
- Save status is always visible (Saved · Saving · Not saved: reason). A failed write keeps the in-memory state, retries
  with backoff, and after the second failure shows "Not saved" with an Export button.

### 5.4 Snapshots (named versions)

| Kind | When | Retention |
|---|---|---|
| `manual` | Student clicks "Save version" (label required, e.g. "Week 1 submitted") | Kept until the student deletes it |
| `milestone` | Each export for submission of a week | Kept |
| `pre-import` | Before every import that changes the current project (replace or merge) | Kept (last 10, then oldest auto-pruned with notice) |
| `pre-restore` | Before restoring an earlier version | Kept (last 10) |
| `auto` | First save of each calendar day | Last 14 |

Restore never deletes history: it writes the restored content as a new revision with source `restore`.

### 5.5 Crash recovery and integrity on load

- Writes are transactional, so a crash loses at most the debounce window (≤ 600 ms of typing).
- On load, the stored `ProjectDoc` is normalized (never throws, like the `normalize*` functions) and validated. If it
  cannot be read, the student is offered the newest readable snapshot, or an export of the raw stored data for the
  instructor. Nothing is discarded automatically.
- The schema version is checked; older versions are migrated by pure functions (`migrateV1toV2`, …) after a
  `pre-migration` snapshot.

### 5.6 Multiple tabs

`navigator.locks.request('project:<id>', …)` makes the first tab the writer; other tabs open the project read-only with
a "This project is open for editing in another tab" notice and a "Take over editing" button. Without the Web Locks API,
the `rev` check inside the write transaction detects a concurrent write and stops with "Changed in another tab: reload"
(no automatic merge). A `BroadcastChannel('sysml-studio-project')` refreshes read-only tabs after each save.

### 5.7 Quota

`navigator.storage.estimate()` is read at startup and after each snapshot. At 80 % of quota: warning with "Export and
prune automatic versions". On `QuotaExceededError`: the change is kept in memory, auto snapshots beyond the newest 3 are
offered for pruning, and the student is told to export. `navigator.storage.persist()` is requested when the first
project is created (the browser may refuse; the result is shown in History).

### 5.8 Multiple projects

The store holds several projects; one is active. Uses: importing a teammate's file as a separate project to compare
before merging; an instructor opening several teams' exports. The project switcher lives in `#/project/transfer`.
Default for students: one project. (Reversible technical decision.)

### 5.9 Attribution ("where technically supported")

There is no authentication. Each browser holds a **self-declared editor** (initials, 2–4 letters, validated with
`ownerProblem`; optional display name), asked for at project creation and changeable at any time. Every change set
records it. When the initials are not one of the team's members, or the edited artifact's prefix is owned by another
member in the charter, the change is accepted and an advisory is shown. The UI and the export call this "recorded by
(self-declared)", never "authored by". This is attribution as an honest log, not proof of authorship.

---

## 6. Practice vs project isolation

1. **Separate stores, separate modules** (§4, §5.2). No project code path reads practice keys implicitly.
2. **No AeroLink defaults.** A new project starts empty: no seeded stakeholders, no reference model, no example text in
   fields (placeholders describe what to write, never AeroLink values). `isAeroLink` guards the enterprise name,
   domain, SOI and PRT names as today.
3. **Explicit copy only** (`src/project/practice/copyFromPractice.ts`): the student selects practice items, sees a
   confirmation listing exactly what will be copied and the warning "These are AeroLink (instructor example) items.
   They count only after you adapt them to your enterprise", then confirms. Copied items:
   - get new project IDs (the AeroLink IDs are recorded in `provenance.copiedFrom`, never reused);
   - carry `provenance.kind = 'copied-from-practice'` and a visible badge;
   - keep relationships only among items copied together (others are listed as "not copied");
   - are excluded from milestone minimums until the student edits the text and confirms adaptation (proposed policy,
     faculty decision F4 in the roadmap).
4. **Reset practice** never touches the project (different store); a test proves it.
5. **Visual distinction**: practice pages show the AeroLink banner and practice color treatment; project pages show the
   team's enterprise name (`UI_UX_REDESIGN_PROPOSAL.md`).
6. **Exports are separate**: the workbench export (`WorkbenchShell.tsx` l.188) drops `w1.team`; the project export
   contains no practice data.

---

## 7. Migration from existing records

Students may already hold data in this browser or as files. Import adapters (`src/project/adapters/legacy.ts`) read
every existing format with the existing importers, so no format knowledge is duplicated:

| Source | Read with | Adapter |
|---|---|---|
| `wb-artefacts['w1.team']` in this browser | `normalizeTeam` | `fromTeamRecord` (offered once: "We found your Week 1 Team Record in this browser. Create your project from it?") |
| `week1-model-inputs` v1, v2, v3 file | `importModelInputs` | `fromTeamRecord` |
| `week2-model-inputs` v1 file or `w2.record` | `importWeek2` / `normalizeRecord` | `fromWeek2Record` (P2) |
| `week3-`, `week4-`, `week5-model-inputs` v1 or stored records | `importWeek3/4/5` / `normalizeRecord` | `fromWeekNRecord` (P2) |
| `week8-import` v1 or `w8.import` | `normalizeState` | `fromWeek8State`: purpose, dispositions and audit notes only; the artifacts come from the project (P3) |

Rules:

- Every legacy import produces an **import plan** (data model doc §10.3): items to create, items identical to existing
  ones, items that differ, ID collisions, broken references, and the parsed relationships. The student confirms; a
  pre-import snapshot is written first.
- Snapshot data embedded in a later week's record (for example `Week2Record.week1`) is used only when the earlier week
  is absent from the project; when present, the project's version wins and differences are listed for review.
- Cross-week ID collisions (Week 4 `EXT-001` vs Week 1 `EXT-001`): same name (case- and space-insensitive) → treated as
  the same artifact; different name → the incoming item is renumbered to the next free ID, every reference to it inside
  the imported record is rewritten, and the change is shown and recorded (`formerIds`).
- Free-text references are parsed with the existing helpers (`sourcesOf`, `concernsOf`, `idsIn`). Tokens that do not
  resolve are kept on the artifact as `unresolvedRefs` with a validation issue; they are never dropped.
- Legacy exports stay available: the project can still write `week1-model-inputs` v3 and the other week formats
  (`toTeamRecord` + `teamModelInputs`), so LMS submissions and the existing Week 8 file path keep working.

---

## 8. Lab tools as editors over the project (adapter pattern)

Each week's `record.ts` stays the validation and rendering logic. A week adapter provides three pure functions:

```ts
toWeekRecord(project: ProjectDoc): WeekRecord                 // projection: the record the tool expects
diffWeekRecord(project: ProjectDoc, before: WeekRecord, after: WeekRecord): Operation[]  // edits → canonical ops
fromWeekRecord(rec: WeekRecord, ctx: ImportContext): ImportPlan  // legacy import
```

The lab tool's single write path is redirected:

- **Week 1:** `TeamView` gets `const [r, set] = useTeamRecord()` in place of `teamArtefact(wb.state.artefacts)` and
  `wb.setArtefact(TEAM_KEY, …)` (l.161, l.165, l.171, l.183). In project mode the hook projects the record from the
  project and turns each `set(patch)` into operations via `diffTeamRecord`. Outside project mode (no project yet,
  instructor demo) it keeps the old behavior. The six part checks, readiness and both exports run unchanged on the
  projected record.
- **Weeks 2–5 (P2):** each tool's `useState(normalizeRecord(loadJSON(Wn_KEY)))` + `saveJSON` pair becomes
  `useWeekRecord(n)`. The "Import your Week N−1 file" step disappears in project mode: the snapshot fields
  (`week1`, `week2`, …) are filled by projection from the project, so earlier-week edits flow forward automatically and
  the tool's existing snapshot checks keep working.
- **Week 8 (P3):** `sourceFromProject(project)` builds the `ImportSource` the generator already consumes; the Week 2
  part and the "manual" counts come from project artifacts instead of files and hand counts.

Fields that exist only for the tool (export timestamps, UI choices) are stored on the week's `Milestone`, not on
artifacts. Round-trip property tests prove `toWeekRecord(fromWeekRecord(fixture))` equals the normalized fixture
(roadmap acceptance tests).

---

## 9. What the student build must exclude

The project workspace is student-facing and ships in both builds. In addition to the current exclusions (faculty notes,
slide purposes, exam banks):

- No instructor answer keys or grading rubrics with scoring notes inside project code paths (none planned).
- No instructor-only project tools (bulk review of team exports, grade annotations) if they are added later: they live
  under `src/instructor/` and are globbed out in student mode, and `check-student-build.mjs` gains their markers.
- The project contains no AeroLink content by default, in either build (test: a new project's export contains no
  string matching `isAeroLink`, no AeroLink stakeholder name and no reference ID set).
- Recommended, outside the project scope: hide the instructor review toggle in the student build
  (`IS_STUDENT_EDITION`), since reviews stored in a student's browser have no authority (faculty decision F8).

---

## 10. Future backend (documented need, not built)

Real shared team workspaces need a server. Browser storage gives each student a separate copy; teammates exchange files.
A future backend needs, at minimum:

- **Authentication** through the university identity provider (SSO), no local passwords.
- **Access control**: team membership, instructor and TA roles, per-course isolation, read-only after submission.
- **Concurrency and conflict resolution**: per-artifact revisions with server-side merge, or operational transforms;
  the local `ChangeSet` model (field-level operations with `before` values) was chosen so it can be replayed against a
  server later.
- **Authoritative history and attribution** (server-stamped user and time), replacing self-declared initials.
- **Submission integration** with the LMS (file or LTI), replacing manual upload.
- **University data-protection review** (FERPA and university policy): student records, retention, export and deletion
  rights, hosting location, accessibility of the service, incident handling.
- Hosting, backup, monitoring and support ownership.

None of this is in scope for 2026-12-01, and the app must not imply it exists: no "share", "invite" or "sync" wording.

---

## 11. Honest limits of the local design

- Two students editing their own copies diverge; merge is by import with an explicit plan, not live collaboration.
- Clearing site data, a different browser or a different computer means a different, empty store. Exports are the
  only durable copy; the UI says so on every save status hover and in the milestone export step.
- Attribution is self-declared and can be wrong or misused.
- The checksum in the export detects corruption and accidental edits, not deliberate tampering (no secret key).
- "Approved by the instructor" in a project is the team's own record of the decision and date, as today; the LMS or
  the instructor's records are authoritative.
