# Test Report — Learning Studio

## Correction notice (2026-10-09, deadline-directive session) — read first
The independent Week 1 review (`_source_cache/review/week01_review.md`, finding W1-F01/F02) showed that the milestone-1 row below for `src/sim/aerolink.test.ts` **overstated what was tested**: in the fixed-charger scenario served trips level off at ≈ 90 % of the charging ceiling (7,788 of 8,640 trips/month), held there by wait-driven churn, not *at* the ceiling; and the assertion `served ≤ charging capacity` is true by construction, so it could not fail. The lead re-ran the model and confirmed this. Correction of the model claims, the lesson text and the tests (with mutation evidence that each behavioural test can fail) is in progress; until it lands, treat the "Limits to Growth" row below as **not verified**. Current results for the whole suite are in the section "Deadline-directive session" at the end.

# Milestone 1 (2026-10-09, superseded where noted)

**Date:** 2026-10-09 · **App:** `learning-studio/` · **Environment:** Windows 11 Enterprise, Node 24.18.0, npm 11.16.0, Google Chrome (installed), Vite 8.3.4, Vitest 5.0.3, Playwright 1.64.0, @axe-core/playwright 4.13.0.
All results below are from actual runs in this session. Logs: `learning-studio/test-results/`.

## Summary

| Check | Command | Result |
|---|---|---|
| Type check | `npx tsc -b` | **PASS** (exit 0) |
| Unit + interaction tests | `npx vitest run` | **25 / 25 passed** (5 files) |
| End-to-end (real Chrome) | `npx playwright test` | **9 / 9 passed** |
| Accessibility (axe, WCAG 2 A + AA) | part of e2e | **0 violations** on 10 pages × 2 themes (light, dark) |
| Production build | `npm run build` | **PASS** (bundle 934 kB JS / 274 kB gzip; size warning, see limitations) |
| Lint | `npx oxlint src e2e` | 0 errors; **3 warnings** (`only-export-components`: a hook/helper exported next to a component in `AppState.tsx`, `router.tsx`, `InstructorReview.tsx`; affects dev hot-reload only) |
| Local server | `npm run dev` + `curl` | **HTTP 200** at http://127.0.0.1:5173/ (title "SysML Learning Studio") |

## Unit and interaction tests (Vitest, jsdom)

| File | Tests | What they prove |
|---|---|---|
| `src/sim/aerolink.test.ts` | 4 | Model is deterministic and conserves trips; **Limits to Growth** (fixed chargers: served trips stay at the charging ceiling, fleet ≥ 2×, riders < 20 % of market, waits > tolerance); **Balancing Process with Delay** (15-month delay overshoot > 1.3 and greater than 3-month case, which stays < 1.15); balanced case reaches > 85 % of market with waits < 20 min |
| `src/content/content.test.ts` | 9 | 14 weeks, Part I = 1–8, Part II = 9–14; **every citation resolves to a verified reading and lies inside its verified page range**; register export = 90 entries with only R30 as declared exception; every objective has Bloom + CLO; every quiz question has exactly one correct option and explanations; source-based blocks carry citations; causal-loop polarity classification (R1 reinforcing; B1–B3 balancing) and rejection of non-existent links |
| `src/model/model.test.ts` | 4 | Stakeholder acceptance checks: lab start fails CP1 as expected; instructor example passes all 8; detects missing official entity, invalid ratings, dangling relationships; quadrant rule |
| `src/state/AppState.test.tsx` | 5 | **IDs never reused** (after delete and after reset); relationship cascade on delete; duplicate/self-link rejection; persistence across provider remount; graceful fallback when localStorage throws; route matching |
| `src/components/components.test.tsx` | 3 | Quiz reveals explanation, scores, retries; boundary exercise scores against the key; instructor review counts update |

## End-to-end tests (Playwright, Chrome)

| Test | Result |
|---|---|
| Dashboard loads with prototype status; navigates to Week 1; no console errors | pass |
| Week 1: mark section complete, answer quiz, scenario switch changes computed binding constraint (charging → fleet), loop polarities shown, progress persists after reload | pass |
| Stakeholder editor: 7 nodes at start (6 lab-sheet stakeholders + enterprise), add stakeholder (gets STK-007), add conflict relationship via keyboard table, conflict check updates, edits persist after reload, influence–interest grid placement | pass |
| Theme toggle sets/persists dark mode; returns to light | pass |
| Instructor mode: review controls appear only in instructor mode; approval reflected in review log counts; instructor example loads and passes 8/8 checks | pass |
| All 14 week routes, roadmap and reference pages render without console errors | pass |
| axe WCAG 2 A/AA, light theme, 10 pages | pass — 0 violations |
| axe WCAG 2 A/AA, dark theme, 10 pages | pass — 0 violations |
| Visual capture of the causal-loop diagram | pass |

## Defects found by testing and fixed during this milestone

1. **Teaching simulation did not exhibit the archetypes the lesson described** (3 of 4 behaviour tests failed initially): queueing wait exceeded rider tolerance at the target utilisation, and charging was never binding. Fixed by re-parameterising (fictional values) and replacing the ordering rule with a demand-gap rule that ignores aircraft on order (the decision error the archetype relies on). One test threshold (wait > 30 min) was replaced by the meaningful criterion (wait > rider tolerance).
2. **Quiz focus loss**: answering a question re-mounted it, dropping keyboard focus. Fixed (re-mount only on explicit reset).
3. **Accessibility**: dark-theme contrast of secondary text (59 occurrences), `aria-hidden` wrapper containing focusable diagram controls, an `aria-label` on a role-less element, and category-coloured text inside stakeholder nodes (contrast 2.8–3.7:1). All fixed; axe now reports 0 violations.
4. **Render-correctness lint findings** (variable reassigned during render; synchronous `setState` in an effect) fixed.
5. **Layout**: editor detail panel fell below the canvas at laptop widths; badges wrapped. Fixed.

## Screenshots (`learning-studio/screenshots/`)

`01-dashboard-light.png`, `02-week1-lesson.png`, `03-dynamics-explorer.png`, `04-stakeholder-network.png`, `05-stakeholder-table.png`,
`06-stakeholder-checks.png`, `07-week1-dark.png`, `08-instructor-review.png`, `09-roadmap.png`, `10-sysml-toolchain.png`, `11-case-study.png`, `12-causal-loops.png`.

## Not tested / limits of this report

- No testing with real students, screen-reader users, or other browsers (Edge/Firefox/Safari); axe automated checks catch only part of WCAG.
- No performance testing beyond the build size warning.
- Lesson **content correctness** is checked only for citation integrity and internal consistency; academic accuracy is pending faculty review.
- No SysML v2 parsing is performed or tested (no conformant tool installed; FD-08).

## Deadline-directive session (2026-10-09, in progress)

| Check | Command | Result |
|---|---|---|
| Type check | `npx tsc -b` | PASS |
| Unit/content/model tests | `npx vitest run` | **46 / 46 passed** (8 files) — includes definition-of-done checks per authored week, engineering-model tests with link-removal mutation checks (every one of the 10 thread links proven to break completeness at the right step) |
| End-to-end + axe | `npx playwright test` | **10 / 10 passed**; axe 0 violations on 12 pages × light/dark (after restarting a stale dev server whose module cache predated the changes) |
| SysML v2 reference validator | `python -I scripts/check_sysml.py --selftest` | **SELF-TEST PASSED** (OMG Pilot Implementation 2026-08, kernel 0.62.0, Java 21.0.12): valid file PASS; syntax error, undefined type and wrong keyword each FAIL with line:column diagnostics. Expected-fail handling checked: a deliberately invalid listing named `invalid_*` is accepted as an expected FAIL; a broken listing without that name makes the run exit 1 |
| Verification scripts | `_source_cache/verification/*.py` | readings 89/90 (R30 declared exception); consistency NO PROBLEMS; CLO sums checked; 57 objectives |
