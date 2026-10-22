# Application State Report — SysML Learning Studio

Audit date: 2026-10-21 · Auditor 1 of 3 · READ-ONLY discovery audit
Repository: `C:\Users\w451vxs\Documents\Course_Work\SysML` · App: `learning-studio/`

Method: everything here comes from reading source files, `git` read-only commands, `node_modules/<pkg>/package.json`, `curl` against the running dev server, and the commands listed in §14 that were run during this audit. Statements quoted from project documents are labelled as claims. Line references are to the **working tree as found** (dirty, see §2).

---

## 1. Branch and latest commit

| Item | Value |
|---|---|
| Branch | `master` (the only branch; `git branch -a` lists no remotes) |
| Remote | none (`git remote -v` is empty) |
| HEAD | `8b9637d114f4d2ca46a18c88386e5cd7e2462fa8`, 2026-10-19 20:56:52 -0400, author `subedi.34` |
| HEAD subject | "P1 My Project workspace (A22): canonical project data layer (IDs, typed relationships, integrity, change log, impact), IndexedDB store with autosave/snapshots/recovery/tab lock, My Project UI, Week 1 lab tool on the project, practice->project handoff, validated export/import (no silent overwrite), Week 8 mapping preview" |
| Commits on master | 132 |
| Stashes | 0 |
| Tracked files | 1,128 in the repo, 973 under `learning-studio/` |

## 2. Working tree: committed vs uncommitted

`git status --porcelain` shows **66 entries = 50 modified tracked files + 16 untracked entries** (the 16 untracked entries expand to **22 untracked files**; two are directories: `src/content/lectures/week06/` with 5 files and `src/workbench/week6/` with 3). This matches the baseline file saved by the caller; it was re-checked after every command run in this audit and did not change (§14).

`git diff --stat`: 50 files changed, 1,269 insertions, 743 deletions.

Everything below is **uncommitted and unverified** (written by stopped agents). Only HEAD `8b9637d` is committed.

### 2.1 Week 6 partial build (uncommitted)

| Kind | Files |
|---|---|
| Untracked lecture source | `src/content/lectures/week06/{aerolinkCase.ts, labBrief.ts, session1.ts, session2.ts, timing.test.ts}` (mtime 2026-10-19 19:52–20:38) |
| Untracked figures | `src/components/figures/{LectureWeek6Parts.tsx, LectureWeek6S1.tsx, LectureWeek6S2.tsx, lectureWeek6Figures.ts, week6FigureKit.ts, week6FigureKit.test.ts}` |
| Untracked lab/quiz/path | `src/content/lab/week06Lab.ts` (+ `.test.ts`), `src/content/quizWeek6.ts` (+ `.test.ts`), `src/content/week6Path.ts` |
| Untracked lab-tool data layer | `src/workbench/week6/{fixture.ts, record.ts, record.test.ts}` (no `Week6LabTool.tsx` exists) |
| Untracked doc | `docs/lectures/week06/WEEK6_LAB_INSTRUCTIONS.md` |
| Modified tracked (wiring) | `src/content/lectures/index.ts` (registers `WEEK6_SESSION1/2` in `LECTURES`), `src/components/figures/registry.ts` (registers Week 6 figures), `scripts/build-lab-md.mjs` (adds Week 6 row) |
| Modified tracked (readings) | `_source_cache/verification/readings.py` (adds R105–R109, comment says "PENDING FACULTY CONFIRMATION"), `_source_cache/verification/readings_verified.txt`, `src/content/readings.generated.json` (140 → 145 readings) |
| Gitignored generated decks | `public/lectures/week06-session{1,2}.pptx` (2026-10-19 20:38; also copied into `dist/` and `dist-student/`) |

What the Week 6 partial actually wires into the running app (verified by `grep` of import sites): only the two lecture sessions and their figures. `week6Path.ts`, `quizWeek6.ts`, `week06Lab.ts` and `src/workbench/week6/*` are imported **only by their own tests** (and `week06/labBrief.ts`), so no route renders them. There is no `src/week6/` folder, no `week6Route`, and `WEEK_PAGES` in `src/lectures/route.ts:204` is still `{1,2,3,4,5,8}`.

### 2.2 Week 5 small fixes (uncommitted)

`src/content/lectures/week05/{aerolinkCase.ts, aerolinkCase.test.ts, labBrief.ts, session1.ts, session2.ts}`, `src/week5/Examples.tsx`, `src/workbench/week5/{record.ts, record.test.ts}`, `src/workbench/shortAnswers.test.ts`, `docs/lectures/week05/{WEEK5_LAB_INSTRUCTIONS.md, WEEK5_MILESTONE_REPORT.md, WEEK5_REVIEW_DISPOSITIONS.md}`, `docs/lectures/GATE_SWEEP_2026-10-19.md`.

Cross-week "empty answer" fix bundled with it: untracked `src/workbench/emptyAnswer.ts` is now imported by **tracked** files `src/workbench/week1/team.ts:27`, `week2/record.ts:24`, `week3/record.ts:25`, `week5/record.ts:33` (the HEAD version of `team.ts` defined `EMPTY_ANSWER` inline). Consequence: the modified tracked files cannot be committed without the untracked `emptyAnswer.ts`. Also `src/workbench/week8/skeleton.ts` (`countOf` regex narrowed, comment "confirmation review N4").

### 2.3 Week 9 / 11 / 12 partials (uncommitted)

`src/content/weeks/{week09.ts, week11.ts, week12.ts}` (these are the *earlier-outline draft modules* served under `#/draft/:n`, see §6), `src/activities/week11/{FlowCoverage.tsx, RidWriter.tsx, StateWalker.tsx, activities.test.tsx, flow.ts, logic.test.ts, rids.ts}` + untracked `src/activities/week11/usePracticeUnlock.ts` (imported by the three modified components), `src/activities/week12/{dispositions.ts, logic.test.ts, planner.ts}`, `docs/authoring/{week09_notes.md, week11_notes.md, week12_notes.md}`.

### 2.4 Screenshots (uncommitted)

11 modified PNGs under `learning-studio/screenshots/week1-workbench/` (6) and `learning-studio/screenshots/workbench/` (5). These are e2e outputs (`e2e/workbench.spec.ts` writes them via `page.screenshot`), mtime 2026-10-18.

### 2.5 Gitignored build/test outputs present on disk (not in `git status`)

`learning-studio/dist/` (instructor build, 2026-10-19 20:59), `learning-studio/dist-student/` (rebuilt by this audit, §14), `learning-studio/test-results/` (last Playwright run 2026-10-19 20:53), `public/lectures/*.pptx` (14 decks), `sysml/partial-report.json`, `tools/`, `exports/`.

## 3. Directory structure (`learning-studio/src`, 596 files, 106 test files)

| Path | Files | Purpose (from code) |
|---|---|---|
| `main.tsx`, `App.tsx`, `index.css` | 3 | Entry; `App.tsx` is the router + classic shell (sidebar `NAV`, header toggles) |
| `lib/` | 6 | `router.tsx` (hash router), `storage.ts` (prefixed localStorage), `usePersistentState.ts`, `edition.ts` (`IS_STUDENT_EDITION`), `sysml.ts` (listing-validation lookup) |
| `state/` | 8 | `Providers.tsx`, `AppState.tsx`, `Workspace.tsx`, `ProjectLegacyMirror.tsx`, `progress.ts`, `weekStatus.ts` |
| `pages/` | 11 | Classic-shell pages: Dashboard, Welcome, Roadmap, WeekPage (+DraftWeekPage), StakeholderEditorPage, ModelWorkspacePage, CaseStudy, ProgressPage, InstructorReview, SourcesPage, ToolchainPage |
| `week1/ … week5/, week8/` | 10–12 each | Lecture-first week pages (Home, Examples, Lab, Assessment, WeekShell, WeekNav, route.ts; Week 8 adds Checker) |
| `lectures/` | 14 | Lecture viewer, handout, lesson reader, figure canvas, `route.ts` |
| `content/` | 123 | Course data: `course.ts` (14-week schedule), `draftWeeks.ts`, `weeks/weekNN.ts` (earlier draft modules), `lectures/weekNN/*`, `lab/weekNNLab.ts`, `quizWeekN.ts`, `weekNPath.ts`, `missions/`, `learn/`, `readings.*`, `rubrics.*`, `schema.ts` |
| `activities/` | 138 | Interactive activities for draft modules 2–13, discovered by `*.activity.tsx` glob (`activities/registry.ts`) |
| `workbench/` | 93 | Week 1 workbench shell (`WorkbenchShell.tsx`, `shell/*`, `week1/*`) and the Week 2/3/4/5/8 lab tools (`weekN/WeekNLabTool.tsx`, `record.ts`); `week6/` has data layer only |
| `project/` | 49 | My Project (A22): `model/`, `store/` (IndexedDB/memory), `transfer/`, `pages/`, `adapters/`, `practice/`, `nav/`, `route.ts` |
| `flow/` | 15 | Earlier Week 1 self-study flow. `WeekFlow.tsx` has **no importer** (unrouted); `Chrome.tsx` (TopBar), `Practice.tsx` (`EmbeddedWorkbench`), `state.tsx`, `storage.ts`, `CheckSubmit.tsx`, `Learn.tsx` are still reused |
| `components/` | 45 | Shared UI (`ui.tsx`, `Quiz.tsx`, `SysmlListing.tsx`, …) and `figures/` (figure registry + per-week lecture figures) |
| `model/` | 19 | AeroLink teaching model (`airtaxi.ts`, `engineering.ts`, `reference/` baseline and SysML mapping/drift tests) |
| `instructor/` | 3 | Exam banks (`exams/exam1.ts`), excluded from the student edition |
| `sim/` | 2 | AeroLink system-dynamics simulation |
| `export/` | 1 | `curriculum.ts` (used by `scripts/export-curriculum.mjs`) |
| `test/` | 1 | `setup.ts` (Vitest setup) |
| `assets/` | 0 | empty |

Other top-level folders of `learning-studio/`: `e2e/` (16 Playwright specs), `scripts/` (9 entries), `sysml/` (reference/lecture/instructor SysML files + validation reports), `docs/`, `public/`, `screenshots/`.

## 4. Framework and package versions

Declared in `package.json`; installed versions read from `node_modules/<pkg>/package.json`. Runtime: Node v24.18.0, npm 11.16.0.

| Package | Declared | Installed | Licence |
|---|---|---|---|
| react / react-dom | ^19.2.8 | 19.3.0 | MIT |
| @xyflow/react | ^12.12.0 | 12.12.0 | MIT |
| recharts | ^3.10.1 | 3.10.1 | MIT |
| lucide-react | ^1.55.0 | 1.55.0 | ISC |
| react-resizable-panels | ^4.14.4 | 4.14.4 | MIT |
| @radix-ui/react-dialog / -tabs / -tooltip | ^1.3.0 / ^1.2.0 / ^1.4.0 | 1.3.0 / 1.2.0 / 1.4.0 | MIT |
| @fontsource/ibm-plex-sans, -sans-condensed, -mono | ^5.3.0 | 5.3.0 | OFL-1.1 |
| vite | ^8.3.0 | 8.3.4 | MIT |
| @vitejs/plugin-react | ^6.1.1 | 6.1.2 | MIT |
| tailwindcss / @tailwindcss/vite | ^4.3.3 | 4.3.3 | MIT |
| typescript | ~6.0.2 | 6.0.3 | Apache-2.0 |
| vitest | ^5.0.3 | 5.0.3 | MIT |
| jsdom | ^30.1.2 | 30.1.2 | MIT |
| @testing-library/react / jest-dom / user-event | ^16.3.3 / ^7.0.1 / ^14.6.7 | 16.3.3 / 7.0.1 / 14.6.7 | MIT |
| fake-indexeddb | ^6.2.6 | 6.2.6 | Apache-2.0 |
| @playwright/test | ^1.64.0 | 1.64.0 | Apache-2.0 |
| @axe-core/playwright | ^4.13.0 | 4.13.0 | **MPL-2.0** |
| oxlint | ^1.81.0 | 1.87.0 | MIT |
| pptxgenjs | 4.0.1 | 4.0.1 | MIT |
| jszip | 3.10.1 | 3.10.1 | **(MIT OR GPL-3.0-or-later)** |
| @types/node / react / react-dom | ^24.13.3 / ^19.2.18 / ^19.2.7 | 24.19.1 / 19.3.0 / 19.3.0 | MIT |

Licence flags: all 12 runtime dependencies are permissive (MIT, ISC, OFL-1.1 for fonts). Two dev dependencies are not plain-permissive: `@axe-core/playwright` (MPL-2.0, weak file-level copyleft, test-only, not shipped) and `jszip` (dual MIT/GPL-3.0; MIT can be elected; used only at build time in `student-edition.ts` and `check-student-build.mjs`). No GPL-only package is a direct dependency. Transitive licences were not audited.

## 5. Build commands and npm scripts

All scripts from `package.json`:

| Script | Command | Notes |
|---|---|---|
| `dev` | `vite` | binds 127.0.0.1:5173, `strictPort` (`vite.config.ts`) |
| `build` | `tsc -b && vite build` | instructor build → `dist/` (gitignored by `learning-studio/.gitignore`) |
| `preview` | `vite preview` | 127.0.0.1:4173 |
| `typecheck` | `tsc -b` | both tsconfigs have `noEmit: true`; tsbuildinfo goes to `node_modules/.tmp/` |
| `test` | `vitest run` | |
| `test:e2e` | `playwright test` | rewrites tracked screenshots (not run) |
| `lint` | `oxlint` | |
| `content:readings` / `content:rubrics` / `content:sysml` | `python -I scripts/export_readings.py` / `export_rubrics.py` / `check_sysml.py` | generators/validator (not run) |
| `export:curriculum` | `node scripts/export-curriculum.mjs` | writes `../exports/curriculum/` |
| `build:student` | `tsc -b && vite build --mode student --outDir dist-student && node scripts/check-student-build.mjs` | student edition + leak check |
| `lectures:pptx` | `node scripts/build-lectures.mjs` | decks → `exports/lectures/` and `public/lectures/` (not run) |
| `lab:md` | `node scripts/build-lab-md.mjs` | lab instructions Markdown into tracked `docs/lectures/weekNN/` (not run) |

Unlisted script: `scripts/build-week08-sysml.mjs` (writes generated Week 8 `.sysml` files; `sysmlWeek08.test.ts` checks they are current).

Vite config (`vite.config.ts`): `base: './'` (relative assets, hash routing), plugins `studentEdition()`, `react()`, `tailwindcss()`, `server.warmup` on `src/main.tsx`.

## 6. Routing implementation

Custom hash router, `src/lib/router.tsx`:
- `currentPath()` (l.4–7): strips `#`; anything not starting with `/` becomes `/`. Query strings in the hash are not parsed.
- `useRoute()` (l.13–21): state + `hashchange` listener.
- `matchRoute(pattern, path)` (l.24–34): segment-by-segment, `:param` captures with `decodeURIComponent`, segment counts must match.
- `Link` (l.37–43): plain `<a href="#…">`.

Dispatch order in `App()` (`src/App.tsx:336–501`):
1. `lectureRoute(path)` (`src/lectures/route.ts:181`) → `LectureApp` (full viewport): `/week/:n/lecture/:s[/:slide|/handout]`, `/week/:n/lesson[/:section]`, `/figure/:id`. Matches **any** week number.
2. `projectRoute(path)` (`src/project/route.ts:218`) → `ProjectApp`.
3. `week1Route` … `week5Route`, `week8Route` (`src/weekN/route.ts`) → `WeekNApp`, or `<Redirect>` (uses `location.replace`, no history entry) for legacy aliases (`/overview`, `/classic`, `/practice`, `/check`, Week 1 `/learn/*`, Week 8 `/checker`).
4. `/welcome` → `Welcome`.
5. `workbenchWeekOf(path)` (l.329) → `WorkbenchShell` for `/week/N` when `hasWorkbench(N)`. Only `content/missions/week01.ts` exists, and `/week/1` is consumed by step 3, so **this branch is unreachable** in the current code.
6. Otherwise the classic shell (header + sidebar `NAV`, l.123–136) renders `route(path)` (l.138–185): `/`, `/roadmap`, `/week/:n`, `/week/:n/classic`, `/archive/week/{1,2,3,4,5,8}`, `/draft/:n`, `/workspace/{stakeholders,model,aerolink}`, `/progress`, `/sources`, `/sources/:id[/:pages]`, `/instructor`, `/sysml`; else an in-shell "Page not found".

Every page is a `React.lazy` chunk (l.48–83). Full route list: `NAVIGATION_AND_ROUTE_MAP.md`.

## 7. State management

Provider tree (`src/state/Providers.tsx`, mounted in `main.tsx:16–22` under `StrictMode`):
`AppStateProvider` → `WorkspaceProvider` → `ProjectProvider` → (`ProjectLegacyMirror`, `App`).

| Provider / hook | File | Holds |
|---|---|---|
| `AppStateProvider` / `useApp()` | `state/AppState.tsx:71` | theme, instructor flag, faculty reviews, completed blocks, quiz answers, boundary classifications, stakeholder map (STK IDs never reused) |
| `WorkspaceProvider` | `state/Workspace.tsx` | AeroLink engineering model (elements, links, issued counters); stakeholders come from the AppState map |
| `ProjectProvider` / `useProjectState()` / `useProjectStore()` | `project/store/ProjectProvider.tsx` | My Project `ProjectStore` (`useSyncExternalStore`): doc, change sets, snapshots, save state, read-only, quota |
| `ProjectLegacyMirror` | `state/ProjectLegacyMirror.tsx` | Side-effect only: writes the project's Week 1 projection into `wb-artefacts['w1.team']`, backs up the previous record once under `w1-team-before-project` |
| `WorkbenchProvider` | `workbench/WorkbenchProvider.tsx` | Week 1 workbench artefacts, mission signals/progress, UI state |
| Flow state | `flow/state.tsx` | Week 1 earlier-flow progress (`w1-flow-v2`) |
| Week 7 store | `activities/week07/store.ts` | module-level singleton over `w07-trade-study` |

No Redux/Zustand/other state library.

## 8. Persistence and storage

### 8.1 localStorage (all keys prefixed `sysml-studio:v1:`, `lib/storage.ts:3`; every access try/catch-guarded)

| Key | Writer / reader |
|---|---|
| `theme`, `instructor`, `reviews`, `completed`, `quiz`, `boundary`, `stakeholder-map` | `state/AppState.tsx:72–78` (read everywhere via `useApp`); `ProgressPage` reset removes `completed`, `quiz`, `boundary` |
| `workspace-model` | `state/Workspace.tsx:44` (ModelWorkspacePage, draft-module activities W12/W13) |
| `welcome-dismissed` | `pages/Dashboard.tsx:27` |
| `welcome-seen` | written `pages/Welcome.tsx:34`; read `Dashboard.tsx:29` |
| `w1-flow-v2` | `flow/state.tsx:44` |
| `wb-artefacts` (contains `w1.team`), `mission-signals`, `mission-progress`, `wb-ui`, `wb-probe` | `workbench/WorkbenchProvider.tsx:34–48`; `wb-artefacts` also read by `Week2LabTool.tsx:149`, `flow/modelInputs.ts`, written by `ProjectLegacyMirror`; `mission-progress`/`wb-ui` also by `flow/storage.ts`, `week1/Workbench.tsx:21–24`, `workbench/missions.ts` |
| `wb-tree-collapsed-w<N>` | `workbench/shell/ModelBrowser.tsx:30` |
| `layout:<k>` | `workbench/WorkbenchShell.tsx:47–54` (direct `localStorage`, same prefix) |
| `w1-classic-stakeholders`, `w1-classic-needs` | `workbench/week1/ClassicActivities.tsx:9,13` |
| `w1-team-before-project` | `ProjectLegacyMirror` (write once), `project/adapters/legacy.ts` (read) |
| `w2.record`, `w3.record`, `w4.record`, `w5.record` | `workbench/weekN/WeekNLabTool.tsx` (read/write), `weekN/Readiness.tsx` (read) |
| `w6.record` | declared `workbench/week6/record.ts:36` (untracked); no UI writes it |
| `w8.import` | `workbench/week8/Week8LabTool.tsx:35–38`, `week8/Readiness.tsx` |
| ~70 activity keys `w02-*` … `w13-*` | the draft-module activities under `src/activities/weekNN/` (e.g. `w02-conflict-matrix`, `w07-trade-study`, `w11-rids-practice`, `w11-rids-week12`, `w11-rids` legacy, `w11-flow-teamk`, `w12-dispositions`, `w13-whatif-*`) — full list obtained by grepping `usePersistentState(` |

### 8.2 IndexedDB

Database `sysml-studio-projects` v1 (`project/store/indexedDb.ts:1–40`), object stores `meta` (activeProjectId, editor, schemaVersion, persistGranted), `projects` (key project uid), `changes` (key `[projectUid, id]`), `snapshots` (key `[projectUid, id]`). Only My Project uses it. Autosave debounced 600 ms; flush on tab hidden / page leave / route change (`ProjectProvider.tsx:56+`).

### 8.3 Cross-tab

`BroadcastChannel('sysml-studio-project')` (`ProjectStore.ts:82`) and Web Locks single-writer per project (`ProjectStore.ts:107–119`; other tabs read-only with "Take over editing").

### 8.4 Memory fallback

`MemoryAdapter` when `?storage=memory`, `?storage=fail`, no `indexedDB`, or open fails (`ProjectProvider.tsx:25–37`); shows the "This browser is not saving your project" banner.

### 8.5 sessionStorage, cookies, network

No `sessionStorage` use and no `fetch(` call anywhere in non-test `src/` (grep). The app is static; all state is in the browser.

## 9. Component architecture

- Three shells: (a) the **classic shell** in `App.tsx` (header with "Instructor review mode" checkbox and theme select, left sidebar `NAV`); (b) the **lecture-first week shell** `weekN/WeekShell.tsx` using `flow/Chrome.tsx` `TopBar` (brand link, "My Project" link, "Instructor mode" checkbox, theme) and `WeekNav` (Overview / Lecture / Lesson / Worked examples / Laboratory / Assessment); (c) the **lecture shell** (`lectures/Chrome.tsx`) and **My Project shell** (`project/pages/ProjectApp.tsx`, also using `TopBar`).
- Week 1 lab tool and optional practice embed the workbench via `flow/Practice.tsx:234 EmbeddedWorkbench` → `WorkbenchShell` (`week={1} embedded`), views from `workbench/views.ts` (Dynamics, Causal loops, Boundary & context, L1 record, Principles, Stakeholders, Needs, Team enterprise).
- Weeks 2–5 and 8 lab tools are single-page editors (`workbench/weekN/WeekNLabTool.tsx`) with pure logic in `record.ts` / `skeleton.ts`.
- Plugin-style discovery by file glob: weeks (`content/weeks/index.ts`), activities (`activities/registry.ts`), workbench missions (`content/missions/index.ts`), exam banks (`instructor/index.ts`).

## 10. Lecture content architecture

- Source: one TS module per session, `src/content/lectures/weekNN/session{1,2}.ts`, plus `aerolinkCase.ts`, `labBrief.ts`, tests. Weeks present: 01, 02, 03, 04, 05, 06 (untracked), 08, plus `fixture/demo.ts` (validator tests only).
- Registry: `src/content/lectures/index.ts:30` `LECTURES` = 14 sessions in the working tree (12 at HEAD; Week 6 added by the uncommitted edit). Helpers `getLecture`, `lecturesOfWeek`, `hasLecture`, `weekLesson`.
- Validation: `src/content/lectures/validate.ts` (ids, word budgets, 75-minute sessions, figure registration, alt text, citations in the verified register and page ranges); enforced by `lectures.test.ts` (31 tests) and per-week `timing.test.ts`.
- References: `src/content/lectures/references.ts` + `src/content/readings.ts` / `readings.generated.json` (generated from `_source_cache/verification/readings.py` by `content:readings`).
- Figures: `src/components/figures/registry.ts` `FIGURE_REGISTRY` (Week 6 entries added uncommitted); each figure renderable at `#/figure/:id` (`lectures/FigureCanvas.tsx`).
- PPTX pipeline: `scripts/build-lectures.mjs` starts its own Vite server on 5197, validates each lecture, captures figures with Playwright from `#/figure/:id`, writes `exports/lectures/weekNN-sessionS.pptx` (+ notes Markdown, lesson Markdown) and copies decks to `public/lectures/` (gitignored). Viewer/dashboard "Download .pptx" links point at `./lectures/<stem>.pptx` (`lectures/route.ts:201`).
- Student edition: `student-edition.ts` strips `notes` and `purpose` from lecture sources by TS AST in `--mode student`, and blanks speaker notes in copied decks.

## 11. Configuration and feature flags

| Flag | Where | Effect |
|---|---|---|
| `VITE_EDITION=student` | `.env.student` (only env file); read in `lib/edition.ts:4` and `instructor/index.ts:8` | removes the slide "Notes" button and handout "Include faculty notes", empties the exam-bank glob, export stamps `edition: 'student'` |
| Vite `--mode student` | `student-edition.ts` | AST-strips faculty notes/purpose; blanks deck notes |
| `?storage=memory` / `?storage=fail` | `project/store/ProjectProvider.tsx:16–28` (read from `location.search`, i.e. before the `#`) | forces My Project memory store / failing writes |
| Instructor mode | `AppState` key `instructor`; toggles in `App.tsx:315` ("Instructor review mode"), `flow/Chrome.tsx:15` ("Instructor mode"), `pages/InstructorReview.tsx:71`, `WorkbenchShell.tsx:107` | shows provenance/review badges, instructor notes panel and exam banks on WeekPage/draft pages, workbench instructor notes, banner. **Not role-protected**: any viewer can tick it, including in the student build (only the lecture notes and exam banks are compiled out) |
| Theme | `AppState` key `theme` (system/light/dark) | `dark` class on `<html>` |
| Lecture "Notes" toggle | `lectures/LectureViewer.tsx:112` | visible to every viewer of the instructor build, independent of instructor mode |

No other env vars (`import.meta.env` used only for `VITE_EDITION`).

## 12. Dependencies and licences

See §4. Runtime bundle dependencies: React, @xyflow/react, recharts, lucide-react, react-resizable-panels, Radix dialog/tabs/tooltip, IBM Plex fonts. Build-time: TypeScript compiler API and JSZip are used inside the Vite plugin. Python scripts (`scripts/*.py`, `_source_cache/verification/*.py`) and the Java SysML checker (`scripts/sysml-launcher/SysMLBatchCheck.java`, toolchain under gitignored `tools/`) are external to npm.

## 13. Test infrastructure

| Item | Value |
|---|---|
| Vitest config | `vitest.config.ts`: merges `vite.config.ts`, `environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']`, `include: ['src/**/*.test.{ts,tsx}']`, `testTimeout: 30_000` |
| Vitest files | 106 (`src/**/*.test.ts[x]`), 2,351 tests in this run; 5 of the files (115 tests) are untracked Week 6 files |
| Playwright configs | `playwright.config.ts` (testDir `e2e`, Chrome channel, `reuseExistingServer: true` on 5173, JSON reporter to `test-results/e2e-results.json`); `playwright.lectures.config.ts` (6 lecture specs, own server on 5198, `workers: 1`) |
| E2E specs | 16 files in `e2e/` (one `test.skip`) |
| Accessibility | `@axe-core/playwright` (`AxeBuilder`) in 15 e2e specs; no axe in Vitest |
| Lint | `oxlint` with `learning-studio/.oxlintrc.json` |
| Python | `scripts/check_sysml.py --selftest` (not run in this audit) |

Details: `FEATURE_AND_TEST_INVENTORY.md`.

## 14. Commands run in this audit (against the dirty working tree)

| Command | Duration | Result |
|---|---|---|
| `npx vitest run` (full) | 127.66 s (wall 2 m 15 s) | **103/106 files passed; 2,347/2,351 tests passed; 4 failed** (details in inventory §2) |
| `npx vitest run src/activities/week07/activities.test.tsx` | 25.2 s | 11/11 passed |
| `npx vitest run src/activities/week11/activities.test.tsx` | 20.3 s | 9/9 passed |
| `npx vitest run src/content/content.test.ts` | 1.9 s | 12/13 passed, **1 failed** (readings count 145 vs expected 140) — reproducible |
| `npx tsc -b` | 69 s | exit 0, no output |
| `npm run lint` (oxlint) | — | exit 0, 0 errors, warnings only (`only-export-components`, one `no-unused-vars` in `scripts/build-lectures.mjs:68`) |
| `npm run build:student` | 2 m 4 s | exit 0, "student build check: PASS" |
| `curl` dev server | — | see §15 |

`git status --porcelain` was diffed against the baseline after each of these: **identical every time** (no tracked or untracked file changed). `dist-student/` was overwritten (gitignored, expected). Logs were written to the session scratchpad only.

## 15. Running dev server

- `netstat`: `127.0.0.1:5173` LISTENING, PID 12752 (not started by this audit).
- `curl http://127.0.0.1:5173/` → 200, 790 bytes, `<title>SysML Learning Studio</title>`, Vite client + React refresh injected.
- Module transform checks (200 each): `/src/main.tsx`, `/src/App.tsx`, `/src/pages/WeekPage.tsx`, `/src/project/pages/ProjectApp.tsx`, `/src/content/lectures/index.ts`, `/src/components/figures/registry.ts`, `/src/content/lectures/week06/session1.ts`, `/src/workbench/week6/record.ts`. The server is serving the dirty tree, including the uncommitted Week 6 sources.
- Hash routes cannot be resolved by `curl` (the fragment never reaches the server); route behaviour was established from code and tests, not from a browser session.
