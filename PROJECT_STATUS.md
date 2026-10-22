# Project Status

**Project:** Systems Thinking and MBSE with SysML v2 — one integrated 14-week graduate course (Weeks 1–7 Systems Thinking, Weeks 8–14 MBSE with SysML v2) and its local interactive application, `learning-studio/`.
**Governing directive:** 2026-10-09 deadline directive — submission **2026-12-01** (DECISION_LOG A6–A8). Milestones and acceptance criteria: `IMPLEMENTATION_ROADMAP.md`. Live task board: `TASK_BOARD.md`.
**Folder:** `C:\Users\w451vxs\Documents\Course_Work\SysML` — local git repository (no remote; never pushed).
**Last updated:** 2026-10-21 late (M0, M1, M2, M4a and Week 6 committed)

## Current phase (2026-10-21): Week 1 reconstruction + admin/student platform (DECISION_LOG A23)
- **Specification:** `docs/directives/2026-10-21_MASTER_IMPLEMENTATION_DIRECTIVE_WEEK1.md` + `docs/directives/2026-10-21_WEEK1_REDESIGN_PROPOSAL.md`.
- **Evidence of current state:** `docs/audits/current-state-2026-10-21/` (read-only audit, 11 documents).
- **Milestone 0 (closed 2026-10-21).** Baseline tag `baseline/2026-10-21-pre-week1`, WIP branch `wip/2026-10-19-interrupted-snapshot`, P0 save defect fixed (`d24f379`), W5 shared empty-answer fix (`9643455`), architecture (`SECURITY_ARCHITECTURE.md`, `CONTENT_PUBLISHING_DESIGN.md`, `PROJECT_DATA_SCHEMA.md`, `docs/architecture/BACKEND_OPTIONS_AND_RECOMMENDATION.md`), Week 1 planning (`docs/week1/`), `WEEK1_IMPLEMENTATION_BASELINE.md`, `WEEK1_CHANGE_IMPACT_MATRIX.md`, `WEEK1_RECOVERY_PLAN.md`.
- **Critical path:** `docs/week1/WEEK1_CRITICAL_PATH.md`. About 35 agent-days for Week 1 + platform, plus about 20–23 for Weeks 6, 7 and 9–14. It is feasible only with parallel content production (faculty decision pending).
- **Committed 2026-10-21 (late):** M1 spec `1aed289`; Week 6 package `693d620`; M2 course server `042befc` (tag `week1/m2`); M4 part A Week 1 nav + Learn + homepage `355207b` (tag `week1/m4a`). Final tree verified: tsc clean, vitest 2695/2695, server 248/248, build:student + leak check PASS, e2e week1-flow 11/11, week6-flow 6/6, app 10/10. Next: M3 limited publishing, M5 Guided Practice, M6 My Project canvas + Excel import, M7 Week 8 continuity; content stream Week 7.
- **Course weeks:** taught and tested are Weeks 1–6 and 8 (Week 6 reviewed and confirmed 2026-10-21). Weeks 7 and 9–14 are outline only.
- **Sections below** describe earlier phases and are kept for history.

## Current phase
**2026-10-18 — schedule realigned (DECISION_LOG A19).** The faculty whiteboard schedule in `COURSE_SCHEDULE.md` is now
authoritative: Phase I — Systems Thinking (Weeks 1–7, ending with the Systems Thinking Engineering Package) and Phase II —
MBSE with SysML v2 (Weeks 8–14, ending with the SysML v2 enterprise model). The app's course data, roadmap, dashboard,
welcome map, course-map dialog and curriculum export follow it. Week 1 is the design template and keeps its module; Weeks
2–14 show a provisional outline ("being rebuilt from the Week 1 template") and link the earlier reviewed draft modules,
which are preserved unedited under the labeled archive route `#/draft/<oldWeek>`. Open faculty decisions: exam placement,
quizzes in Weeks 7 and 14 (default none), Phase II tooling in Week 8. The milestone text below predates this change.

**Milestone M2 met on 2026-10-11 (due Oct 23): Weeks 1–7 (Part I, Systems Thinking) are complete drafts** — every definition-of-done check passes, including an independent review and sign-off for each week (`_source_cache/review/weekNN_signoff.md`). Part II is under way: Week 8 authored, reviewed and fixed (sign-off pending); Week 9 being authored; Weeks 10–14 next. Faculty review remains separate (DECISION_LOG A4).

## Week status
See `TASK_BOARD.md` (complete drafts: Weeks 1–7).

## Verified assets
- **Instructor reference AeroLink baseline** (`learning-studio/src/model/reference/`): 0 validation errors at every week; 25 complete 11-link digital threads; trade study recomputed in tests.
- **Instructor reference SysML v2 model** (`learning-studio/sysml/reference/aerolink_v01…v04`): all four accepted by the OMG SysML v2 Pilot Implementation release 2026-08; ID → qualified-name table in its README; mapping test.
- **Reference validator**: portable Java 21 + pilot 2026-08 in `tools/`; `npm run content:sysml`; self-test passes; canonical `sysml/validation-report.json`; the app labels a listing "accepted" only when the report's SHA-256 matches the displayed text (test-enforced).
- **Exam security**: exam banks live in `src/instructor/` and are excluded from the student edition (`npm run build:student`), verified by a leak check that is proven to detect the material in the instructor build.
- **Curriculum export**: `npm run export:curriculum` → student and instructor Markdown editions in `exports/curriculum/`.

## Latest test results (2026-10-11)
- Type check: pass. Content/lib tests pass; full suite last run 346/346 (before the latest commits).
- End-to-end + axe: 11/11; axe now scans all 14 week pages and 7 other pages in light and dark: 0 violations.
- SysML: 7 files, 6 PASS + 1 intentional FAIL as expected.

## Known issues being worked
- Four plan objectives (B6.5, B8.5, B9.5, B12.5) were missing from the app outline since milestone 1; to be restored with the Week 6 micro-lab content and the Week 8/9/12 modules.
- Reference baseline items flagged by authors (STK-011 concern; NEED-004/006/008 conditions; REQ-STK-003 "shall not"); applied after the reviews that read them finish.

## Decisions awaiting the user
- Confirm A7 (Week 8 opens Part II). FD-27 (formal SysML 2.0 documents). FD-17, FD-02 (see `FACULTY_DECISION_REGISTER.md`).
