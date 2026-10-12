# Implementation Roadmap — firm dates to submission on 2026-12-01

**Governing directive:** the 2026-10-09 deadline directive (DECISION_LOG A6–A8). It replaces the earlier approval gates with milestone delivery: reversible local development proceeds without per-step approval; only decisions that materially affect academic requirements, data security, technical correctness or the deadline are escalated.
**Live status:** `TASK_BOARD.md` (critical path, done/in progress/blocked/remaining, risks). Updated at every milestone together with `PROJECT_STATUS.md`.

## Architecture (confirmed 2026-10-09, milestone M1)

| Layer | Decision |
|---|---|
| App | React 19 + TypeScript (strict) + Vite 8 + Tailwind 4, local only (`npm run dev`, 127.0.0.1:5173); `npm run build` + `npm run preview` for the packaged build |
| Diagrams / charts | React Flow 12 (stakeholder, architecture), Recharts 3 (dynamics, trade study, measures); every visual has a text/table equivalent |
| Course content | One `WeekContent` module per week (`src/content/weeks/weekNN.ts`), typed by `src/content/schema.ts`; readings from the verified register (`readings.generated.json`), rubrics exported from `ASSESSMENT_RUBRICS.md` (`rubrics.generated.json`) — never re-typed |
| Definition of done | `weekChecks` (structure, depth ≥ 1,800 words, citations in verified ranges, activity, lab, assignment + rubric, ≥ 10 explained quiz items covering every objective, instructor notes that add up, workload = syllabus §14, independent review) enforced by `weeks.test.ts`; shown per week in the app |
| Shared engineering model | `src/model/engineering.ts`: course ID scheme (lab plan §C.2), 10 relationship types with allowed-combination rules, validation, requirement coverage, orphans, impact traversal, 11-link digital-thread detection. Student workspace persisted per browser (`state/Workspace.tsx`); instructor reference baseline by week (`src/model/reference/`) |
| SysML v2 | Reference tool: **OMG SysML v2 Pilot Implementation release 2026-08** (kernel 0.62.0, Java 21 Temurin, portable in `tools/`). `npm run content:sysml` validates every listing; the app labels a listing "accepted" only if the validation report has PASS for the exact text shown (SHA-256 match). Conceptual exercises are labelled as such |
| Activities | Registered components (`src/activities/weekNN.activity.tsx`), pure logic unit-tested |
| Tests | Vitest (unit, content, model), Playwright (e2e on installed Chrome) + axe WCAG 2 A/AA in light and dark |
| Curriculum export | Script generating per-week Markdown/HTML curriculum documents from the same content modules (M5) |
| Version control | Local git only (no remote, never pushed) |

## Milestones and acceptance criteria

| # | Date | Deliverable | Acceptance (evidence) |
|---|---|---|---|
| M1 | **Oct 13** | Final provisional 14-week structure (1–7 ST, 8–14 MBSE); app shell; Week 1 demonstration; confirmed architecture | Structure in `course.ts` + test; Week 1 passes every structural check and the independent review; tsc/vitest/playwright/axe/build green; launch commands verified |
| M2 | **Oct 23** | Weeks 1–7 complete instructional drafts with labs, assessments, readings | Weeks 1–7 status "Complete draft" in the app (all checks incl. independent review); Exam 1 blueprint + item bank; CP1–CP2 instruments |
| M3 | **Nov 7** | Weeks 8–14 complete drafts; SysML examples validated; main technical interactions | Weeks 8–14 "Complete draft"; every conformant listing PASS in the pilot implementation; instructor reference SysML model accepted by the tool; trade simulator, architecture/N² editor, requirements lab, risk/TRL, SysML exercises, digital-thread explorer, impact analysis working with tests |
| M4 | **Nov 17** | All 14 weeks integrated; progression; Air Taxi continuity; instructor assessment materials | Course progression (week unlocking/recommended order), workspace carries IDs Week 1 → 14, reference baseline ≥ 5 complete threads, instructor guide, exam keys, CP1–CP5 instruments |
| M5 | **Nov 25** | Full academic + software QA; technical checks; workload & assessment verification; complete local build | Round-3 independent academic review of all weeks with findings closed; verification scripts green; workload/CLO recomputation; cross-browser e2e; axe 0 violations all pages; production build + preview verified |
| M6 | **Nov 30** | Submission package | Exported curriculum (Markdown/HTML/PDF), documentation, tested build, manager demonstration script, known-limitations statement |
| — | **Dec 1** | Submission | No essential work remaining |

## Critical path

`week schema + definition of done (done)` → `reference engineering baseline` → `Weeks 3–7 content (depend on reference IDs)` → `Week 8 architecture` → `instructor reference SysML model (validated)` → `Weeks 9–14 SysML content + exercises` → `digital thread / impact tools on the reference model` → `integration + progression` → `round-3 review + fixes` → `export + package`.

The SysML reference model is the longest single dependency: Weeks 9–14 examples, the practical exam (RB-14) and the CP4/CP5 instruments all derive from it. It starts as soon as the Week 8 architecture layer of the reference baseline exists.

## Parallel workstreams (separate files, no concurrent edits of the same file)

| Stream | Owns | Depends on |
|---|---|---|
| Lead (integration) | shared types, schema, shell, pages, e2e, docs, commits | — |
| Reference baseline | `src/model/reference/week02–12.ts` | engineering model |
| Week N author | `src/content/weeks/weekNN.ts`, `src/activities/weekNN*`, `sysml/weekNN/`, `docs/authoring/weekNN_notes.md` | reference baseline (Weeks 3+) |
| Independent reviewer | `_source_cache/review/weekNN_review.md` (read-only otherwise) | finished week |
| SysML toolchain | `scripts/check_sysml.py`, launcher, `tools/` | — (done) |

## Simplification policy (deadline protection)

If a feature threatens a milestone, simplify the implementation, never the academic substance: keep the lesson, lab, assessment and rubric complete, and reduce interaction richness (e.g. a table-driven editor instead of a canvas). Any lower-priority feature dropped is recorded in `KNOWN_LIMITATIONS.md` with its teaching workaround.

## History
- Phase 0 (source audit, curriculum proposal) and milestone 1 (dashboard, Week 1, stakeholder editor) were delivered on 2026-10-09 under the earlier gated plan; see `DECISION_LOG.md` A1–A5 and `TEST_REPORT.md`.
