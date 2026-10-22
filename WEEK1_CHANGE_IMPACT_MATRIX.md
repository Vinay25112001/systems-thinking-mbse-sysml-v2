# Week 1 Change Impact Matrix (Milestone 0)

**What this matrix shows.** For each change that A23 requires, it lists:
- what is touched;
- which existing behaviour or data it affects;
- the regression risk;
- the safeguard.

**Sources.**
- Component verdicts come from `docs/week1/WEEK1_REUSE_MAP.md` (C# = content module, U# = UI component).
- Architecture comes from `SECURITY_ARCHITECTURE.md`, `CONTENT_PUBLISHING_DESIGN.md`, `PROJECT_DATA_SCHEMA.md` and `docs/architecture/BACKEND_OPTIONS_AND_RECOMMENDATION.md`.
- The git baseline is in `WEEK1_IMPLEMENTATION_BASELINE.md`.

**Risk ratings.**
- **H**: student data or another week can break.
- **M**: visible regression that tests can catch.
- **L**: local to Week 1.

## 1. Changes and impacts

| # | Change (milestone) | Files / modules touched | Affects | Risk | Safeguard |
|---|---|---|---|---|---|
| X0 | Fix the read-only-after-reload save defect; truthful save states (M0, P0) | `src/project/store/ProjectStore.ts`, `project/adapters/useTeamRecord.ts`, `TeamProject.tsx`, the lab-tool banner | Every My Project edit; the Week 1 lab tool | **H** | Regression tests (lock re-acquire, second tab, takeover, refused edits shown); real Chrome and Edge reproduction before and after; report `learning-studio/docs/project/P0_SAVE_DEFECT_REPORT.md` |
| X1 | Local backend: accounts, sessions, teams, server-side authorization (M2) | New `learning-studio/server/**`; Vite dev proxy `/api`; new HTTP persistence adapter beside the IndexedDB adapter | Persistence path for projects; the build; e2e setup | **H** | Repository interface; the IndexedDB adapter stays as offline mode; no auto-migration (students import an exported file); authorization tests per endpoint class; two-session Playwright tests |
| X2 | Server-side project concurrency (M2) | `src/project/store/*` (revision handling), new server version counter | Shared team projects | **H** | Optimistic version check → "Conflict requires review". The audit-of-code finding (the local store keeps the same `rev` when it merges keystroke edits) is fixed server-side, not by changing the export format |
| X3 | Content publishing: drafts, review, publish, history, restore (M3) | New content store (server); `src/content/lectures/types.ts` (stable content ID, revision, status, `textEquivalent`); Learn reader reads the published version | Lecture/lesson single source; the pptx pipeline; the student build | **H** | The existing TypeScript modules become the seed "published v1". pptx generation still reads the same source. Faculty-only fields are stored and served separately. The leak check is extended |
| X4 | Student nav becomes Overview → Learn → Guided Practice → My Project/Lab → Review & Submit (M4) | `week1/route.ts` (`WEEK1_NAV`, redirects), `WeekNav.tsx`, `WeekShell.tsx`, `Week1App.tsx`, `lectures/route.ts` | Week 1 links, bookmarks, e2e `week1-flow.spec.ts`, `week1.test.tsx` | M | Old routes redirect (no 404); the Lecture route stays reachable for instructors only; tests updated in the same commit |
| X5 | Retire the student Lecture tab and Worked Examples page; keep the source (M4) | `week1/Home.tsx` (lecture cards, pptx links), `week1/Examples.tsx` (retired), U9 lecture viewer gated to the instructor role | Faculty presentation workflow; worked-example content | M | Content moves into Learn (no text deleted). The viewer and pptx stay available to the instructor role. The duplication of 3,662 words disappears |
| X6 | Learn digital textbook (M4) | `lectures/LessonReader.tsx`, `Blocks.tsx`, `lectures.css:610-718` (reader grid), new chapter order from `WEEK1_TEXTBOOK_IA.md`, `readings.ts` citation display | **The Weeks 2–5 and 8 lessons share the reader and CSS** | **H** (cross-week) | Scope the new grid to Week 1 behind a class or version flag, then roll it out after review; run the Weeks 2–5 and 8 lesson render tests on every change |
| X7 | Gap content (systems thinking, enterprise selection, unsourced terms) (M4) | `content/lectures/week01/session1.ts`, `session2.ts` (studentLesson), possibly `readings.py` register entries | Verified references; the academic sign-off of Week 1 | M | New claims only with register-verified sources (pipeline `verify_readings.py` → `content:readings`); flagged "pending faculty review"; register count tests updated deliberately |
| X8 | Guided Practice: reset, isolated state, explanatory feedback (M5) | `content/missions/week01.ts` (m1–m4 adapt), `workbench/WorkbenchProvider.tsx`, `flow/Practice.tsx`, `week1/Workbench.tsx` | Practice localStorage keys **shared with the team record** (`wb-artefacts['w1.team']`) | **H** | Split the practice store from the team record **before** adding reset, so a reset can never touch `w1.team`. An isolation test asserts that the project is unchanged after a practice reset |
| X9 | My Project canvas replaces the TeamView UI; field guidance; instructor approval (M6) | `workbench/week1/TeamView.tsx` (replaced), `team.ts` (approval field → instructor action), `needQuality.ts` and `stakeholders.ts` (kept), `project/pages/*` (adapted), new canvas components | Week 1 gates and exports (`week1-model-inputs` v3); the Week 2 import; the Week 8 import | **H** | Keep `team.ts` logic and the v3 export byte-compatible (golden-file test). The approval state moves to the server and the self-declared flag is read-only legacy |
| X9a | A25 in the Week 1 register gate (M6): the level of interest with a reason is required | `workbench/week1/team.ts` (`stakeholderRowIssues`), `teamModelInputs` (v3 `status`) | Week 7 reads the v3 `status` (`workbench/week7/record.ts:455`): a Week 1 record completed before M6 and re-exported now carries `not-ready`, so the Week 7 tool reports “its own lab tool did not judge it ready”. Week 2 ignores `status`; Week 8 does not read it | **M** | Recorded in KNOWN_LIMITATIONS (M6) and M6_REPORT; teams add interest values in My Project and export again. Optional later: word the Week 7 finding as “interest not yet recorded (A25)” (Week 7 stream decides) |
| X10 | Excel stakeholder import (M6) | New import module + parser dependency (licence check; M6 decision), new UI flow, project ops with provenance | Project integrity; security surface | M | Size, row and cell limits; no formula evaluation; preview, then one transaction; rollback test; malformed-file fuzz cases |
| X11 | Week 1 → Week 8 continuity (M7) | `project/adapters/week8.ts`, `workbench/week8/Week8LabTool.tsx` (read the project), `skeleton.ts` | Week 8 lab tool (signed off) | M | Keep file import as a fallback; Week 8 tests stay green; no new SysML claims |
| X12 | Homepage redesign (M4) | `pages/Welcome.tsx`, `content/learn/welcome.ts`, `pages/Dashboard.tsx` (student landing replaced), `App.tsx` routes | Every entry route | M | Sponsoring department is a config value marked "not verified"; no logos or endorsements |
| X13 | One chrome and design tokens across the student pages (M4–M6) | `flow/Chrome.tsx` (instructor checkbox → role-based), `lectures/Chrome.tsx`, `project/pages/project.css`, tokens | All weeks' shells | M | Scope tokens; visual check with screenshots outside the repo; axe on 25+ states |
| X14 | Student build hardening (M4/M8) | `student-edition.ts`, `scripts/check-student-build.mjs`, internal codes in `rubrics.generated.json`, quiz "Session N slide K" lines | Student and faculty separation | M | The leak check covers the instructor toggle, pending-decision text, register codes and slide references |
| X15 | Week 2 reads Week 1 from the project instead of the mirror (M7, or after) | `workbench/week2/Week2LabTool.tsx:148-155`, `state/ProjectLegacyMirror.tsx` | Week 2 lab tool (signed off) | M | Keep the mirror until Week 2 reads the project; remove it in the same commit that switches Week 2 |

## 2. Interaction with the uncommitted WIP streams

| WIP | Collides with | Handling |
|---|---|---|
| (b) shared `emptyAnswer.ts` + `week1/team.ts` edit | X9 (`team.ts` is kept as logic) | Verify stream (b) on its own (tests + the W5 moderate), then commit it as a separate unit **before** X9 touches `team.ts`. If it fails verification, restore `team.ts` from HEAD for Week 1 work and keep (b) on the WIP branch. The decision is recorded in the M0 report |
| (a) Week 6 `lectures/index.ts`, `figures/registry.ts` blocks | X3, X6 (if the Week 1 rebuild touches these registries) | Week 1 commits stage explicit hunks only; the Week 6 blocks stay unstaged until Week 6 is resumed and reviewed |
| (a) R105–R109 in `readings.generated.json` / `readings.py` | X7 (register additions) | Do not regenerate the register while (a) is parked. If X7 needs new entries, resume or park (a) first and decide with the user |
| Old-outline W9/W11/W12 partials | none | Left untouched (standing rule) |

## 3. Data compatibility checklist (run at every milestone close)

1. A project exported at baseline (`sysml-studio-project` v1) imports with no loss.
2. A browser with a baseline IndexedDB project opens it after the upgrade, and the IDs are unchanged.
3. `week1-model-inputs` v1, v2 and v3 still import in Week 2, Week 8 and My Project.
4. The legacy `w1.team` record is still detected and offered for import.
5. A practice reset leaves the project and `w1.team` byte-identical.
6. Student build: the leak check passes, the instructor material is absent, and no draft content is reachable.
