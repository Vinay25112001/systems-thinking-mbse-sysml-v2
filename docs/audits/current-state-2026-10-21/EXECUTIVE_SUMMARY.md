# Executive Summary — Current-State Discovery Audit (2026-10-21)

**Scope:** read-only audit of the Systems Thinking + MBSE with SysML v2 Learning Studio
(`C:\Users\w451vxs\Documents\Course_Work\SysML\learning-studio`).

**Method:** three independent auditors covered (1) architecture, routes and tests, (2) curriculum and Week 1, and (3) My Project, data flow and UI/UX. Their findings were cross-checked and consolidated here.

**Changes made:** none to application code, content, configuration or git state. The only new repository files are the 11 documents in this folder. The audit's 72 screenshots are stored **outside the repo** at `C:\Users\w451vxs\Documents\Course_Work\SysML-audit-screenshots-2026-10-21\`. `git status` matched the pre-audit baseline except for the new untracked `docs/audits/` folder.

**Baseline caveat:** HEAD is `8b9637d` (branch `master`, no remote). The working tree also carries 50 modified tracked files and 22 untracked files from three stopped, unreviewed agent streams (a Week 6 draft, Week 5 fixes, and older W9/W11/W12 partials). The dev server and every test run in this audit used that dirty tree. Curriculum status is classified against HEAD.

## A. What the application contains

The application is a static, offline React 19 + TypeScript + Vite app with a custom hash router. It has no backend and no accounts.
- **Lecture pipeline:** TypeScript slide sources render a web slide viewer, a student lesson and handouts. The same sources generate `.pptx` decks with speaker notes.
- **Week pages:** lecture-first pages for Weeks 1, 2, 3, 4, 5 and 8.
- **AeroLink:** the instructor's worked example, with its model and stakeholder workspaces.
- **Optional practice:** a practice workbench (Week 1 missions only).
- **Lab tools:** per-week lab tools (Weeks 1–5 and 8, plus a Week 8 SysML checker guide).
- **My Project:** a new workspace (IndexedDB, Week 1 artifacts).
- **Other pages:** a verified-sources register (145 entries), a progress page and an instructor review page.

There are two build editions. The default/instructor edition shows faculty notes; `build:student` strips notes and exam banks and passes its leak check.

## B. Major tabs and what each displays

The full tree is in `NAVIGATION_AND_ROUTE_MAP.md` §1.

| Area | What it shows |
|---|---|
| **Welcome** (`#/welcome`) | Course introduction, AeroLink vs own enterprise, a 14-week roadmap, how to use the site |
| **Dashboard** (`#/`) | Week cards with status badges |
| **Roadmap** (`#/roadmap`) | 14-week schedule (built weeks are still badged "Provisional") |
| **Weeks 1–5, 8** | Overview → Lecture (slide viewer, present mode, handout) → Lesson → Worked examples → Lab (instructions + lab tool) → Assessment |
| **Weeks 6, 7, 9–14** | Outline page with provisional objectives and links to archived old-outline draft modules. The Week 6 lecture exists only in the uncommitted tree |
| **My Project** (`#/project`) | Overview, Milestones, Artifacts, Artifact page, History, Export/Import, Week 8 preview |
| **AeroLink workspaces** (`#/workspace/model`, `#/workspace/stakeholders`, `#/workspace/aerolink`) | The instructor case model, stakeholder editor and data sheet |
| **Other course pages** | SysML toolchain (`#/sysml`), My progress (`#/progress`), Verified sources (`#/sources`), Instructor review (`#/instructor`) |

The application does **not** have:
- a separate MBSE modelling workspace;
- a digital thread;
- settings;
- instructor review of student projects.

## C. Completion status, Weeks 1–14 (against HEAD)

Detail is in `FULL_14_WEEK_CONTENT_MATRIX.md`. In the table, "Tested" means automated tests exist, and internal review sign-off is reported separately.

| Week | Status | Notes |
|---|---|---|
| 1 | IMPLEMENTED AND TESTED | Ready for faculty review |
| 2 | IMPLEMENTED AND TESTED | Signed off |
| 3 | IMPLEMENTED AND TESTED | Signed off; the S2 deck is older than its source |
| 4 | IMPLEMENTED AND TESTED | Signed off, 7 minors |
| 5 | IMPLEMENTED AND TESTED | 1 moderate gate defect is open; the fix is uncommitted |
| 6 | OUTLINE ONLY | An uncommitted draft has both lectures, but the lab and quiz are not routed and it has not been reviewed |
| 7 | OUTLINE ONLY | |
| 8 | IMPLEMENTED AND TESTED | Signed off |
| 9–14 | OUTLINE ONLY | |

Only 6 of 14 weeks are taught. Only one of the seven Phase II weeks (Week 8) is taught.

## D. Week 1 structure and what students experience

Detail is in `WEEK_1_DEEP_AUDIT.md`. A student goes through these steps:
1. **Welcome.**
2. **Week 1 Overview:** objectives B1.1–B1.5 and expectations.
3. **Lecture Session 1** (25 slides, "Team Formation / Needs / Identifying Stakeholders") and **Session 2** (23 slides, "Concerns, needs and the AeroLink case"). There is a slide viewer with present mode, and faculty notes are visible only in the instructor edition. The decks are exported as `.pptx`.
4. **Detailed lesson:** 21 sections plus references, on one long page.
5. **Worked examples:** AeroLink slides, plus a paper exercise (CON-014 → NEED-014) with its solution.
6. **Optional practice:** four AeroLink missions in the embedded workbench, with step checks.
7. **Lab L1:** instructions, and the Team Record lab tool for the student's own enterprise (team, stakeholders, concerns, needs, relationships). The tool has validation gates. It exports `.md` and `week1-model-inputs` v3 JSON, and saves into My Project when a project exists.
8. **Assessment:** 10 formative multiple-choice items, each linked to its slide and lesson section, stored locally and ungraded.

Submission happens outside the app, by uploading exported files. Approval of the student's enterprise is self-declared.

## E. How the Practice Canvas works

Only Week 1 has one: `#/week/1/examples/practice`, with four AeroLink missions.
- **Storage:** students edit AeroLink artefacts in localStorage (`wb-artefacts`, `mission-progress`).
- **Feedback:** step checks, a Problems panel and a change/impact log.
- **Reset:** there is no reset; undo goes back at most 50 steps.
- **Isolation:** practice never writes to the project. An explicit, confirmed "copy to project" copies AeroLink stakeholders and concerns as flagged templates. These don't count toward minimums, or reach submissions, until a student adapts them. This copy feature is enabled even though faculty decision F4 is still pending.
- **Other weeks:** Weeks 2–5 and 8 have paper exercises only.

## F. Is there a separate student Project Workspace?

**Yes, but only for Week 1** (`PROJECT_WORKSPACE_STATUS.md`). `#/project` is a real local, single-user workspace. It provides:
- course IDs with hidden UUIDs;
- typed relationships with integrity rules;
- a change log with undo, and snapshots;
- 600 ms autosave;
- a one-writer lock across tabs;
- validated export/import (checksum, merge plan, no silent overwrite);
- milestone views and a read-only Week 8 preview.

Its limits are:
- **No editors of its own:** all editing happens in the Week 1 lab tool.
- **Weeks 2–6 are outside it.**
- **No instructor review.**
- **Possible editing-lock defect:** reloading can leave the project read-only (see K).

## G. How student data is stored and preserved

- **Week 1:** stored in the browser's IndexedDB (`sysml-studio-projects`), mirrored to localStorage, and exported as JSON/Markdown.
- **Weeks 2–6:** stored in separate localStorage keys (`w2.record` … `w6.record`) and preserved only if the student exports each week's file.
- **Week 8:** stored in `w8.import`.

Nothing is stored on a server. Clearing browser data or changing machines loses everything except the files the student exported. True multi-user teamwork is not offered, and the app does not claim it.

## H. Can Week 1 work flow into Week 8?

**Partly.** This was demonstrated in a fresh browser: an enterprise was created and stakeholder STK-001 added, and the My Project Week 8 preview generated SysML text naming STK-001, with no AeroLink content.

The graded **Week 8 lab tool does not read the project**. The student must export the Week 1 file and import it there. Weeks 3–6 outputs are not used by Week 8 at all. The Week 7 package, the digital thread and the final review do not exist.

## I. Main UI/UX weaknesses

Detail and screenshots are in `UI_UX_SCREEN_AUDIT.md`.
1. **Lost edits after reload:** the project can turn read-only after a reload, while the lab page still accepts typing that is silently not saved.
2. **Practice and graded work look the same:** the graded lab tool is labelled "Practice workbench" and lists AeroLink groups beside the team's record.
3. **Inconsistent layouts:** four different page layouts, and inconsistent instructor toggles.
4. **Contradictory status badges,** and faculty-review text visible to students.
5. **Missing handoffs:** nothing connects the Week 8 preview to the Week 8 lab tool, and the preview is labelled "MBSE Studio" without being connected to it.
6. **Mobile:** page headers take about 60% of the lab screen, and the project tabs are cut off.
7. **Long pages:** the lesson is one very long page, and the lab tool needs 22+ Tab presses to reach its first field.
8. **Accessibility:** axe found 0 violations on 25 screen states.

## J. Reusable components

- **Project layer:** the canonical project layer (`src/project/**`: model, IDs, integrity, change log, impact, store, export/import).
- **Adapter pattern:** `useTeamRecord` (a template for Week 2–6 adapters) and `sourceFromProject` (ready for the Week 8 tool).
- **Lecture pipeline:** the lecture pipeline and figure registry.
- **Lab tools:** the per-week record and validation modules, and the shared short-answer tests.
- **Week 8:** the SysML skeleton generator and checker guide.
- **Other:** the workbench practice engine, the readings register, the student-build leak check, and the Playwright + axe harness.

## K. Technical and academic risks

The ranked list is in `PRIORITIZED_GAPS_AND_RISKS.md`.

Critical:
- 8 weeks still to build in about 5.7 weeks.
- Weeks 2–6 work sits outside the project and its export.
- The read-only reload defect, reproduced headless but not yet confirmed in desktop Chrome/Edge.

High:
- Week 8 is not connected to the project.
- There is no Week 7 package.
- The instructor toggle is available in the student build.
- Enterprise approval is self-declared.
- Archived old-outline modules are linked from current pages.
- The working tree is entangled: modified files import untracked ones, and one test fails (145 vs 140 readings).
- Week status labels contradict each other.

Academic:
- Lab checks test completeness more than quality.
- Students can see internal source codes.
- There is no Week 7 or Week 14 rubric.
- Phase I → II continuity covers only Weeks 1–2 → 8.

**Tests run during this audit, on the dirty tree:**

| Check | Result |
|---|---|
| Vitest | 2,347 of 2,351 passed (127.7 s) |
| Week 7 and Week 11 tests | 3 of the 4 failures; they time out under load and pass alone |
| `content.test.ts` | Fails: 145 readings vs 140 expected, caused by the uncommitted Week 6 work |
| `tsc -b` | Clean |
| Lint | 0 errors |
| `build:student` | Leak check PASS |

The e2e suites were not run because they overwrite tracked screenshots. Their last recorded run (2026-10-19) failed at Week 8 because of a stale test.

## L. Highest-priority improvements

1. Stabilise the working tree: decide, commit or discard the three interrupted streams.
2. Confirm and fix the read-only reload defect in a real browser.
3. Adapters to bring Weeks 2–6 into the canonical project.
4. Connect the Week 8 lab tool to My Project and persist the mappings.
5. Week 7 Systems Thinking Engineering Package, with export and rubric.
6. A faculty-agreed production plan for Weeks 6, 7 and 9–14, including the depth of SysML authoring.
7. Student-build hardening: instructor toggle, internal codes, pending-decision text, consistent status labels.
8. Remove or clearly label the archived old-outline links.
9. Distinguish practice from project inside the Week 1 tool.
10. Restore meaningful lab-gate quality checks, with justification students can see.

## M. Documents and screenshots

Folder: `C:\Users\w451vxs\Documents\Course_Work\SysML\docs\audits\current-state-2026-10-21\`

1. `APPLICATION_STATE_REPORT.md`
2. `NAVIGATION_AND_ROUTE_MAP.md`
3. `FULL_14_WEEK_CONTENT_MATRIX.md`
4. `WEEK_1_DEEP_AUDIT.md`
5. `PROJECT_WORKSPACE_STATUS.md`
6. `PRACTICE_PROJECT_MBSE_DATA_FLOW.md`
7. `UI_UX_SCREEN_AUDIT.md`
8. `FEATURE_AND_TEST_INVENTORY.md`
9. `ACADEMIC_ALIGNMENT_REVIEW.md`
10. `PRIORITIZED_GAPS_AND_RISKS.md`
11. `EXECUTIVE_SUMMARY.md`

Screenshots (72 PNG, desktop 1440×900 `d*` and mobile 390×844 `m*`): `C:\Users\w451vxs\Documents\Course_Work\SysML-audit-screenshots-2026-10-21\`
