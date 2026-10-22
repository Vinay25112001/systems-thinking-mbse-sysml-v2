# Navigation and Route Map — SysML Learning Studio

Audit date: 2026-10-21 · Auditor 1 of 3 · READ-ONLY
App: `learning-studio/` · Working tree: HEAD `8b9637d` + 66 uncommitted entries (see `APPLICATION_STATE_REPORT.md` §2)

## How "works" was established

- **Route resolution**: read from the dispatcher (`src/App.tsx:336–501`) and the route parsers (`src/lectures/route.ts`, `src/project/route.ts`, `src/week{1,2,3,4,5,8}/route.ts`). Parsers are unit-tested in `src/lectures/route.test.ts`, `src/week1/week1.test.tsx` (l.35, l.48), `src/state/AppState.test.tsx:64` (`matchRoute`); those tests passed in this audit's `npx vitest run`.
- **Rendering**: component tests that passed in this audit are named per row. E2E specs exist for most pages but were **not run** in this audit (they rewrite tracked screenshots); where cited they are labelled "e2e spec (not run)". The last recorded Playwright run on disk is `learning-studio/test-results/.last-run.json` (2026-10-19 20:53, status `failed`); its only failure artefact is `app-every-week-…/error-context.md` (see §5).
- **Dev server**: `curl` confirms HTTP 200 for `/` and that Vite transforms the route modules (`App.tsx`, `WeekPage.tsx`, `ProjectApp.tsx`, Week 6 lecture source). `curl` cannot exercise hash routes. No browser session was used (to avoid writing into the user's browser storage).
- "Audience": the app has **no authentication or roles**. "Faculty" below means content intended for faculty (instructor mode, archive pages, faculty notes); every route is reachable by anyone who types the hash.

---

## 1. Information-architecture tree

```
SysML Learning Studio (index.html, hash router)
├── Classic shell (App.tsx header + sidebar NAV, l.123–136)
│   ├── #/welcome ............................ "Start here: course welcome" (own full-page layout, not the shell)
│   ├── #/ ................................... Dashboard
│   ├── #/project ............................ "My Project" (own shell, see below)
│   ├── #/roadmap ............................ Course roadmap
│   ├── Phase I — Systems Thinking
│   │   ├── #/week/1 … #/week/5 ............... lecture-first week pages (own shell)
│   │   ├── #/week/6 .......................... classic WeekPage: rebuild outline (+ lecture entry, dirty tree only)
│   │   └── #/week/7 .......................... classic WeekPage: rebuild outline
│   ├── Phase II — MBSE with SysML v2
│   │   ├── #/week/8 .......................... lecture-first week page (own shell)
│   │   └── #/week/9 … #/week/14 .............. classic WeekPage: rebuild outline
│   ├── AeroLink worked example (instructor's case)
│   │   ├── #/workspace/model ................. AeroLink engineering model
│   │   ├── #/workspace/stakeholders .......... Stakeholder ecosystem editor
│   │   └── #/workspace/aerolink .............. Case brief and data sheet
│   ├── Course
│   │   ├── #/sysml ........................... SysML v2 toolchain
│   │   ├── #/progress ........................ My progress
│   │   ├── #/sources[/:id[/:pages]] .......... Verified sources
│   │   └── #/instructor ...................... Instructor review
│   └── Not in sidebar (reachable by links or typing)
│       ├── #/week/:n/classic ................. classic WeekPage (weeks 6, 7, 9–14; 1–5, 8 redirect)
│       ├── #/archive/week/{1,2,3,4,5,8} ...... earlier week pages (instructor archive banner)
│       ├── #/draft/1 … #/draft/14 ............ earlier-outline draft modules (activities for old weeks 2–13)
│       └── anything else ..................... in-shell "Page not found"
├── Lecture-first week shell (weekN/WeekShell.tsx + flow/Chrome TopBar + WeekNav), weeks 1, 2, 3, 4, 5, 8
│   ├── #/week/N ............................ Overview
│   ├── #/week/N/lecture/:s[/:slide] ........ Lecture (slide viewer, LectureApp)
│   ├── #/week/N/lecture/:s/handout ......... Handout (print)
│   ├── #/week/N/lesson[/:section] .......... Lesson (reader)
│   ├── #/week/N/examples ................... Worked examples
│   │   └── #/week/1/examples/practice ...... Optional practice: AeroLink missions (Week 1 only, embedded workbench)
│   ├── #/week/N/lab ........................ Laboratory
│   │   ├── #/week/N/lab/tool ............... Lab tool
│   │   └── #/week/8/lab/checker ............ Install and run the course checker (Week 8 only)
│   └── #/week/N/assessment ................. Assessment and submission
├── Lecture routes for weeks WITHOUT a week page (6 in dirty tree; any other N shows "No lecture here"/"No lesson yet")
├── #/figure/:id ............................ single figure on a 1600×900 canvas (PPTX capture tool)
└── My Project shell (project/pages/ProjectApp.tsx)
    ├── #/project ........................... Overview (or "Start your team's project" when none exists)
    ├── #/project/milestones[/:week] ........ Milestones
    ├── #/project/artifacts[/:type] ......... Artifacts (library)
    ├── #/project/artifact/:id .............. Artifact page
    ├── #/project/history ................... History
    ├── #/project/transfer .................. Export and import
    └── #/project/model ..................... Week 8 preview
```

Unreachable code paths (no route leads to them):
- `WorkbenchShell` as a **top-level** route (`App.tsx:428–434`): `workbenchWeekOf()` only returns a week that has a missions module; only `content/missions/week01.ts` exists and `/week/1` is consumed earlier by `week1Route`. The shell is still used *embedded* in Week 1 lab tool and practice.
- `src/flow/WeekFlow.tsx`: no importer in non-test code (App.tsx comment l.60–61: "kept but no longer routed"). Its routes redirect (`week1/route.ts:153–157`).
- Week 6 modules `content/week6Path.ts`, `content/quizWeek6.ts`, `content/lab/week06Lab.ts`, `workbench/week6/*` (untracked): imported only by tests.
- `content/lectures/fixture/demo.ts`: no longer registered (validator tests only).

---

## 2. Classic-shell routes

Shell: `App.tsx:438–500`. Header: brand link to `#/`, checkbox "Instructor review mode" (`App.tsx:315`), "Theme" select (System/Light/Dark). When instructor mode is on, an amber banner: "Instructor review mode: provenance, review controls and the instructor example are visible. Reviews are stored in this browser only." Sidebar footer: "Prototype for faculty review. Lesson content is pending review; numbers about AeroLink are fictional."

| Displayed name | Route | Audience | What is rendered (from code) | Controls | Data origin → saved where | Works? (evidence) | Incomplete / confusing | Source |
|---|---|---|---|---|---|---|---|---|
| Dashboard ("Systems Thinking and MBSE with SysML v2") | `#/` | student | "Start here" card (until dismissed); path cards "This week: Week 1 — …", Week 2, 3, 4, 5, 8 (each with lecture/lesson/examples/lab/assessment links and "Download Session N .pptx"); "Prototype status — read before you start"; Continue / Stakeholder ecosystem map / Course progress cards; Phase I and Phase II week lists with status badges | Dismiss start-here, links, .pptx downloads | `WEEKS` (`content/course.ts`), lectures registry, AppState → `welcome-dismissed` | Route: `App.tsx:139`. e2e specs (not run): `app.spec.ts:26`, `week1-flow.spec.ts:76`, `weekN-flow.spec.ts` "dashboard: Week N is available" | Badge logic `Dashboard.tsx:~455` shows "Available (pending review)" for any week with a lecture; in the dirty tree **Week 6 now shows "Available (pending review)"** although it has no week page, lab or assessment. Status copy hard-codes "Week 2, 3, 4, 5 and Week 8 … available" | `pages/Dashboard.tsx` |
| Start here: course welcome | `#/welcome` | student | One-column welcome: what/why, AeroLink case, 14-week map, "How to use this site"; links to `#/week/1` and `#/` | Links | static content (`content/learn/welcome.ts`) → writes `welcome-seen` | Route `App.tsx:421`. e2e (not run) `week1-flow.spec.ts:52` | — | `pages/Welcome.tsx` |
| Course roadmap ("Course roadmap — 14 weeks") | `#/roadmap` | student | Team outputs; per-phase week list linking `#/week/N` | Links | `WEEKS` | e2e (not run) `app.spec.ts:177` | — | `pages/Roadmap.tsx` |
| Week N: <title> (provisional weeks) | `#/week/6`, `#/week/7`, `#/week/9` … `#/week/14` | student | `WeekPage` → `RebuildWeek` (provisional outline: objectives, topics, readings, lab/assessment text, "being rebuilt from the Week 1 template" notice, links to earlier draft modules). For Week 6 in the dirty tree, `hasLecture(6)` is true, so a `LectureEntry` box (slides, lesson, .pptx) is shown above the outline (`WeekPage.tsx:662–671`) | Links to `#/draft/<old>`; lecture entry | `content/course.ts`, `draftWeeks.ts`, lectures registry | Route `App.tsx:141–142`; e2e (not run) `app.spec.ts:177` loops over weeks | No lab, lab tool, assessment, or week navigation for these weeks. Week 6 is half-way: lecture + lesson exist, the rest of the week does not | `pages/WeekPage.tsx:650` |
| (classic page) | `#/week/:n/classic` | faculty/legacy | Same `WeekPage` for weeks 6, 7, 9–14; for 1–5 and 8 the week route redirects to `#/week/N` | — | — | `App.tsx:145`; redirects in `weekN/route.ts` | Title gets " (classic page)" suffix | `App.tsx` |
| Earlier Week N page (archive) | `#/archive/week/1`, `/2`, `/3`, `/4`, `/5`, `/8` | faculty | Amber "Archive for instructor review" banner + `WeekPage n={N}`; Week 1 archive renders the authored Week 1 module (activities, quiz, lab, assignment, workload); 2–5, 8 render the rebuild outline | Link back to the week | same as WeekPage | `App.tsx:148–163`; e2e (not run) `weekN-flow.spec.ts` "earlier Week N page stays in the archive" | Not linked from the sidebar | `App.tsx:187–286` |
| Earlier draft, old Week N (archive) | `#/draft/1` … `#/draft/14` | faculty (reachable from provisional week pages' draft links) | `DraftWeekPage`: `/draft/1` = "Rebuilt in place" notice; `/draft/2`–`/draft/13` = full earlier-outline module (blocks, interactive activities, lab, quiz, assignment, workload; instructor notes + exam banks in instructor mode); `/draft/14` = outline only | Activities (see §6), quiz, complete-block toggles | `content/weeks/weekNN.ts` (old numbering), activity state in localStorage `w0N-*` | `App.tsx:166`; activity component tests `src/activities/weekNN/activities.test.tsx` passed (W07/W11 only when run alone) | Numbering mismatch: old Week 12 ("Verification, measures and the digital thread") is not current Week 12. W09/W11/W12 modules are modified in the dirty tree (unverified) | `pages/WeekPage.tsx:674` |
| AeroLink engineering model | `#/workspace/model` | shared (instructor's case) | "One model for the whole course…" view selector (mine / reference), reference-week select, type filter, Model checks, Requirement coverage, Complete digital threads (links to `#/week/12`, `#/week/13`), Elements table, Links editor | Add link, load reference, Export JSON / Import JSON (`aerolink-model.json`) | `model/reference`, `Workspace` → `workspace-model` | e2e (not run) `app.spec.ts:155`; `state/Workspace.test.tsx` (3 passed) | "Complete digital threads" links go to `#/week/12` / `#/week/13`, which are provisional outlines, not the old draft modules that teach threads | `pages/ModelWorkspacePage.tsx` |
| Stakeholder ecosystem editor | `#/workspace/stakeholders` | shared (Lab L2/CP1 on AeroLink) | Network/table views, selection details, relationships form, influence–interest grid, acceptance checks | Add/edit/delete stakeholder & relationship, import/export JSON | `model/airtaxi.ts` seed → `stakeholder-map` | e2e (not run) `app.spec.ts:69`; `state/AppState.test.tsx` (5 passed); `model/model.test.ts` (4 passed) | Labelled "Lab L2 / checkpoint CP1" — an earlier-outline lab label, not the current Week 2 lab | `pages/StakeholderEditorPage.tsx` |
| Case brief and data sheet ("Air Taxi Enterprise workspace") | `#/workspace/aerolink` | shared | Required digital thread, AeroLink data sheet, course questions | Links | static | e2e (not run) `app.spec.ts:177` | Sidebar label and page heading differ | `pages/CaseStudy.tsx` |
| SysML v2 toolchain | `#/sysml` | shared | "SysML v2: teaching editor vs conformant modelling tool": what the app is, conformant tool, reference toolchain (FD-08 pending), language version | — | static | e2e (not run) `app.spec.ts:177` | States toolchain facts "checked on 2026-10-09" | `pages/ToolchainPage.tsx` |
| My progress | `#/progress` | student | Week 1 summary, completion-by-week bar chart + table, stakeholder map status, "Reset my progress" | Reset (confirm) removes `completed`, `quiz`, `boundary` | AppState | e2e (not run) `app.spec.ts:177` | Measures only classic-module activities/quiz; **does not read** lab-tool records (`w2.record`…`w8.import`) or My Project, so a student working in Weeks 2–5/8 lab tools sees no progress there | `pages/ProgressPage.tsx` |
| Verified sources | `#/sources`, `#/sources/:id`, `#/sources/:id/:pages` | shared | Reading register; `focus` highlights one reading/pages | — | `readings.generated.json` | `content/content.test.ts` (12/13 passed; the register-count test fails on the dirty tree, see inventory) | Register now lists 145 entries incl. R105–R109 "pending faculty confirmation" (uncommitted) | `pages/SourcesPage.tsx` |
| Instructor review | `#/instructor` | faculty | Review items with approve / request changes + note, "Export review log (JSON)", own instructor-mode checkbox, "What instructor mode shows" | Review buttons, export `sysml-studio-review-log.json` | AppState `reviews` | e2e (not run) `app.spec.ts:122`; `components.test.tsx` "records decisions and updates the counts" (passed) | Linked in the student sidebar; not access-controlled | `pages/InstructorReview.tsx` |
| Page not found | any unmatched path | — | "No page exists at <path>. Return to the dashboard." | Link | — | `App.tsx:177–184` | Shown inside the classic shell, e.g. for `#/week/6/lab`, `#/week/7/examples` | `App.tsx` |

---

## 3. Lecture-first week pages (Weeks 1, 2, 3, 4, 5, 8)

Shell: `weekN/WeekShell.tsx` with `flow/Chrome.tsx TopBar` (brand → `#/`, "My Project" link, checkbox **"Instructor mode"**, Theme) and `WeekNav` ("Week N sections": Overview, Lecture, Lesson, Worked examples, Laboratory, Assessment). Audience: student; instructor material appears only via instructor mode.

| Displayed name | Route | Rendered content | Controls / interactions | Data → saved | Works? (evidence) | Notes | Source |
|---|---|---|---|---|---|---|---|
| Overview ("Week N — <title>") | `#/week/N` | Entry cards (Lecture slides, Detailed lesson, Worked examples, Engineering laboratory, Assessment and submission), objectives, run of the week, readings, deliverables, workload | Links | `content/weekNPath.ts`, `course.ts` | `week1.test.tsx:71` (passed); e2e (not run) `weekN-flow.spec.ts` walk | — | `weekN/Home.tsx` |
| Worked examples | `#/week/N/examples` | "Worked examples: the AeroLink case" (Week 8: "…the AeroLink import"); one section per part; Week 1 adds "Try it yourself" and the practice→project **Handoff** panel | Links; Handoff "copy practice stakeholders" (confirm) | `content/lectures/weekNN/aerolinkCase.ts`, `weekN/exampleParts.ts` → Handoff writes to My Project | `week1.test.tsx:93`; `week5/exampleParts.test.ts` (passed) | Week 5 `Examples.tsx` modified (uncommitted) | `weekN/Examples.tsx`, `project/practice/Handoff.tsx` |
| Optional practice: AeroLink missions | `#/week/1/examples/practice` (Week 1 only) | Embedded workbench (missions w1-m1…m4: who, boundary, stakeholders, needs) with model browser, centre views, properties, problems, dock | Mission steps, undo/redo (Ctrl+Z / Ctrl+Shift+Z), F6 region cycling, `?` shortcuts | `content/missions/week01.ts` → `wb-artefacts`, `mission-progress`, `mission-signals`, `wb-ui` | `workbench/shell.test.tsx` (8 passed), `shell/practice.test.tsx` (5 passed); e2e (not run) `workbench.spec.ts` | Optional, ungraded | `week1/Workbench.tsx`, `flow/Practice.tsx:234`, `workbench/*` |
| Laboratory | `#/week/N/lab` | Lab LN instructions: inputs, objectives, method, procedure, outputs, rubric, submission, link to the lab tool, workload; Week 1 adds "Download record template (.md)" and Handoff; Week 8 links the checker guide | Downloads | `content/lab/weekNNLab.ts` (also rendered to `docs/lectures/weekNN/WEEKN_LAB_INSTRUCTIONS.md` by `lab:md`) | `week1.test.tsx:117,121`, `content/lab/week0NLab.test.ts` (passed) | — | `weekN/Lab.tsx` |
| Lab tool (Week 1: "Lab tool: Team enterprise view") | `#/week/1/lab/tool` | Embedded workbench on the Team enterprise view (mission w1-m5-team), Team Record parts and export | Edit record, export, import (via My Project import plan when a project exists) | When a project exists: My Project IndexedDB (via adapters); legacy: `wb-artefacts['w1.team']` | `project/adapters/week1.test.ts` (8 passed); e2e (not run) `project.spec.ts:209` | Two storage modes (project vs legacy) | `week1/Workbench.tsx`, `project/adapters/*` |
| Lab tool (Weeks 2–5: "Lab tool: the Week N record") | `#/week/{2,3,4,5}/lab/tool` | Single-page record editor extending the previous week's record; per-part status, hard gates, advisories; Week 5 adds N² chart | Add rows (scenarios, risks, TPMs, viewpoints, components, interfaces…), import previous-week export / teammate export, Export record (.md), Export model inputs (.json) | `workbench/weekN/record.ts` → `wN.record`; Week 2 can read Week 1 from `wb-artefacts` ("Use the Week 1 record saved in this browser"); Weeks 3–5 import the previous week by file only | `WeekNLabTool.test.tsx` + `record.test.ts` (all passed) | Records are **not** stored in My Project (P1 covers Week 1 only) | `workbench/weekN/WeekNLabTool.tsx` |
| Lab tool (Week 8: "Lab tool: import and model v0.1") | `#/week/8/lab/tool` | Import Week 1 (v1–3) and Week 2 model inputs, mapping matrix, findings, SysML v2 skeleton preview | Export `.sysml`, mapping matrix (.md), workspace (.json) | `workbench/week8/skeleton.ts`, `state.ts` → `w8.import` | `Week8LabTool.test.tsx` (12), `skeleton.test.ts` (34), `sysmlWeek08.test.ts` (50) passed | Does not read My Project; `#/project/model` is a separate read-only preview | `workbench/week8/Week8LabTool.tsx` |
| Install and run the course checker | `#/week/8/lab/checker` (`#/week/8/checker` redirects) | Prerequisites, OS-specific steps (Windows/macOS/Linux buttons), downloadable course files, expected output, troubleshooting | OS toggle, downloads | `content/lab/week08Checker.ts` | `content/lab/week08Checker.test.ts` (8 passed); e2e (not run) `week8-flow.spec.ts:116` | — | `week8/Checker.tsx` |
| Assessment and submission | `#/week/N/assessment` | Readiness quiz, standards, submission readiness (record status: not ready / submitted for approval / ready), bridge to next week; Week 8 adds exercise and graduate task | Quiz answers | `content/quizWeekN.ts`; readiness reads `wN.record` / Team Record | `week1.test.tsx:134`; `content/quizWeekN.test.ts` (passed) | — | `weekN/Assessment.tsx`, `weekN/Readiness.tsx` |
| Legacy aliases | `#/week/N/overview`, `/classic`, `/practice`, `/check`; Week 1 `/learn[/lN]`; Week 8 `/checker` | Redirect (no history entry) | — | — | `week1.test.tsx:48` (passed); e2e (not run) `week1-flow.spec.ts:182` | — | `weekN/route.ts` |

---

## 4. Lecture routes (`LectureApp`, full viewport)

| Displayed name | Route | Content | Controls | Works? | Notes | Source |
|---|---|---|---|---|---|---|
| Lecture viewer | `#/week/:n/lecture/:s[/:slide]` | Slide face, outline, counter, citations, `WeekNav` when the week has a page | ← → PageUp/PageDown Home End, Previous/Next, **Notes** (faculty notes panel, hidden in student edition), Present (fullscreen), Download .pptx | `lectures/route.test.ts` (3 passed), `lectures.test.ts` (31 passed); e2e (not run) `lectures*.spec.ts` | Available for weeks 1, 2, 3, 4, 5, 8 (committed) and **6 (uncommitted)**. In the instructor build the Notes button is visible to everyone, independent of instructor mode (`LectureViewer.tsx:112`). For other weeks: "No lecture here … Week N has no session S lecture yet" | `lectures/LectureViewer.tsx` |
| Handout | `#/week/:n/lecture/:s/handout` | Every slide, print layout | "Include faculty notes (instructor)" (not in student edition), Print | e2e (not run) `lectures.spec.ts:127` | — | `lectures/Handout.tsx` |
| Lesson reader ("Week N lesson") | `#/week/:n/lesson[/:section]` | Both sessions' lesson sections, TOC, figures with "On the slide" links; Week 1 adds optional self-checks | TOC links | e2e (not run) `lectures.spec.ts:140` | Weeks without lectures show "No lesson yet — Week N has no lecture source yet." | `lectures/LessonReader.tsx` |
| Figure canvas | `#/figure/:id` | One registered figure on a 1600×900 light canvas | — | e2e (not run) `lectures.spec.ts:183`; `lectures.test.ts:56` | Tooling route used by `build-lectures.mjs`; not linked in the UI | `lectures/FigureCanvas.tsx` |

Week 6 lecture pages in the dirty tree: `backOf(6)` returns "Dashboard" (`lectures/route.ts:206`) because 6 is not in `WEEK_PAGES`, so there is no Week 6 week navigation. No e2e spec covers Week 6.

---

## 5. My Project (`ProjectApp`, own shell)

Shell: `TopBar` ("My Project — <name>"), breadcrumb, save status, "Export project" button, tabs "My Project sections" (Overview, Milestones, Artifacts, History, Export and import, Week 8 preview), storage banners (memory fallback, read-only tab with "Take over editing", "Not saved" error, notices). Audience: student team. Data: `ProjectStore` over IndexedDB `sysml-studio-projects` (memory fallback). Evidence for the whole area: `project/store/store.test.ts` (14), `project/transfer/transfer.test.ts` (8), `project/model/model.test.ts` (8), `project/isolation.test.ts` (5), `project/adapters/week1.test.ts` (8), all passed in this audit; e2e (not run) `e2e/project.spec.ts` (7 tests + axe/layout matrix).

| Displayed name | Route | Content | Controls | Notes | Source |
|---|---|---|---|---|---|
| Start your team's project | `#/project` with no project | About your team (team label, editor initials 2–4 letters, optional name); "We found your Week 1 Team Record in this browser" when one exists; import a project/Week 1 file | Create empty, Create from record, Import + confirm | Initials self-declared (no identity) | `project/pages/CreateProject.tsx` |
| Overview | `#/project` | Enterprise name/ENT ID/team/approval/SoI/revision/last export, mission/problem/goals, milestone strip, boundary, team & roles, artifact library at a glance, save/export/history | Export, Save version | — | `project/pages/Overview.tsx` |
| Milestones | `#/project/milestones[/:week]` | Week 1 in full (expected artifacts, outstanding tasks, submission: export Week 1 files, mark submitted); Weeks 2–14 "upcoming" with what each week adds | Export Week 1 files, Export project, Mark submitted | Weeks 2–14 informational only; Weeks 2–5/8 lab-tool records are not linked | `project/pages/Milestones.tsx` |
| Artifacts | `#/project/artifacts[/:type]` | Per-type tables (ENT, MGO, PRT, EXT, STK, CON, NEED, REL, LNK) with checks, review flag, provenance, last revision | Links | Editing happens in the Week 1 lab tool | `project/pages/Library.tsx` |
| Artifact | `#/project/artifact/:id` | Fields (read-only), what checks still need, relationships, actions, revision history | Edit in Week 1 lab tool, Mark reviewed (rationale ≥3 words), Mark adapted, Retire (reason) | `#/project/artifact` without id → Artifacts | `project/pages/ArtifactPage.tsx` |
| History | `#/project/history` | Change sets with field diffs, versions (manual/milestone/pre-import/pre-restore/automatic), editor initials, persistence/quota | Expand, Restore (with reason), Export this version, set editor | — | `project/pages/History.tsx` |
| Export and import | `#/project/transfer` | Export project (`sysml-studio-project` v1), readable report (.md), Week 1 files; Import with validation report + plan (new/identical/changed/conflict/ID collision/broken) → Open as separate / Merge / Replace (type title); project switcher | Buttons as listed | Pre-import snapshot before merge/replace | `project/pages/Transfer.tsx`, `ImportFlow.tsx` |
| Week 8 preview ("How your Week 1 work becomes a model") | `#/project/model` | Read-only mapping of Week 1 artifacts to packages + generated SysML v2 skeleton text, status per artifact | Select row | "Nothing is stored and nothing is Mapped" | `project/pages/ModelPreview.tsx` |

Route rules (`project/route.ts:218–227`): `history`, `transfer`, `model` reject a trailing parameter (fall through to the classic "Page not found").

---

## 6. Interactive activities (draft modules only)

Rendered only inside `#/draft/2` … `#/draft/13` (and `#/archive/week/1` for Week 1's activities). Registry `activities/registry.ts` (glob `*.activity.tsx`). Folders `activities/week02` … `week13` (old-outline numbering): e.g. W02 ConflictMatrix, LifecycleExplorer, SosClassifier; W03 CapabilityBuilder, MgoRecorder, NeedStudio, ScenarioBuilder; W04 QualityLab, TypeClassifier; W05 QualityAudit, SysmlReading, TpmTracker, TraceExplorer; W06 IssueLog, MicroLab2, RiskQuantifier, RiskRegister, SrrChecklist, TrlAssessor; W07 MonteCarloPanel, SwingWeightWalkthrough, TradeStudySimulator; W08 InfoTracer, N2Coupling, SatisfyReading; W09 PackageMapper, PredictChecker, SemanticsClassifier; W10 PredictChecker10, RelationClassifier, ReqTranslator; W11 FlowCoverage, RidWriter, StateWalker; W12 RidDispositionLog, ThreadExplorer, TraceAudit, VerPlanner; W13 ConsistencyReview, ImpactExplorer, MarginWhatIf. Each persists to its own `w0N-*`/`wNN-*` localStorage keys. Tests: `src/activities/weekNN/{activities,logic}.test.*` (all passed; W07 and W11 component tests pass only when run alone).

---

## 7. Checklist of named areas

| Area asked about | Exists? | Where / note |
|---|---|---|
| Course Dashboard | Yes | `#/` (`pages/Dashboard.tsx`) |
| Welcome | Yes | `#/welcome` |
| Roadmap | Yes | `#/roadmap` |
| Weekly modules | Partly | Lecture-first week pages for 1, 2, 3, 4, 5, 8. Weeks 6, 7, 9–14 = provisional outline only (Week 6 has lectures in the dirty tree). Earlier-outline modules under `#/draft/:n` |
| Lecture viewer | Yes | `#/week/:n/lecture/:s` (weeks 1–5, 8; 6 uncommitted) |
| Lesson reader | Yes | `#/week/:n/lesson` |
| Worked examples | Yes | `#/week/{1,2,3,4,5,8}/examples` |
| Practice canvas | Yes (Week 1 only) | `#/week/1/examples/practice` (embedded workbench); no practice canvas for other weeks |
| Workbench | Embedded only | Week 1 lab tool and practice. The top-level `/week/N` workbench route is unreachable (§1). Loading frame text "Practice workbench" |
| My Project | Yes | `#/project/*` |
| "SysML Learning Studio" | App name | Document title suffix and brand; not a separate page |
| MBSE workspace | No page by that name | Closest: `#/workspace/model` "AeroLink engineering model" (instructor case, teaching representation, not SysML) and `#/project/model` "Week 8 preview" |
| Digital Thread | No dedicated page | "Complete digital threads" section in `#/workspace/model`; "Required digital thread" in `#/workspace/aerolink`; ThreadExplorer activity in `#/draft/12`; current Week 12 ("Digital Thread / Verification and Validation") is outline-only |
| Assessments | Yes | `#/week/N/assessment` (1–5, 8); quizzes in draft modules; exam banks only in instructor panel of instructor build |
| Instructor mode | Yes (toggle, no auth) | Checkboxes in classic header, week TopBar, `#/instructor`, workbench |
| Settings | Does not exist | Only theme and instructor toggles in headers |
| Export / import | Yes, per area | My Project transfer; lab-tool exports/imports (Weeks 1–5, 8); model and stakeholder JSON on workspace pages; review-log export on `#/instructor` |
| Progress dashboard | Yes, limited | `#/progress` (classic-module activities only) |

## 8. Known broken / inconsistent routes and copy

1. `e2e/app.spec.ts:177` ("every week … render without errors") expects either `lab-panel` or `rebuild-notice` for weeks without a dedicated branch; there is no `n === 8` branch, so at `#/week/8` (lecture-first page) it fails. Historical artefact: `test-results/app-every-week-…/error-context.md` — "Locator: getByTestId('rebuild-notice') … element(s) not found" with the Week 8 page snapshot. The page itself renders; the **test** is stale. Not re-run in this audit.
2. Week 6 (dirty tree): Dashboard badge "Available (pending review)", lectures and lesson exist, but `#/week/6/examples`, `#/week/6/lab`, `#/week/6/lab/tool`, `#/week/6/assessment` all fall through to "Page not found"; lecture back-link goes to Dashboard.
3. Two different instructor checkbox labels ("Instructor review mode" in the classic header vs "Instructor mode" in week pages) for the same flag.
4. `#/workspace/model` "Complete digital threads" links to current Weeks 12/13, which have no thread content.
5. `#/progress` ignores lab-tool and My Project work.
6. Draft modules use old week numbers that collide with current week numbers (e.g. old Week 8 "Architecture…" vs current Week 8 "Import Systems Thinking Artifacts / Stakeholders").
