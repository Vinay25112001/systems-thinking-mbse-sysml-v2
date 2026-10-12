# Project Status

**Project:** Systems Thinking and MBSE with SysML v2 — one integrated 14-week graduate course (Weeks 1–7 Systems Thinking, Weeks 8–14 MBSE with SysML v2) and its local interactive application, `learning-studio/`.
**Governing directive:** 2026-10-09 deadline directive — submission **2026-12-01** (DECISION_LOG A6–A8). Milestones and acceptance criteria: `IMPLEMENTATION_ROADMAP.md`. Live task board: `TASK_BOARD.md`.
**Folder:** `C:\Users\w451vxs\Documents\Course_Work\SysML` — local git repository (no remote; never pushed).
**Last updated:** 2026-10-11 (night)

## Current phase
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
