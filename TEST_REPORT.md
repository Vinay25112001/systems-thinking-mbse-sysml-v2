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

## 2026-10-22 regression (pre-commit of M3, M6, Week 9)

QA pass on the uncommitted tree (M3 publishing, M6 My Project canvas / Review & Submit / Excel import, Week 9 package, Week 7 App.tsx route block) on top of `16490ae`. Nothing committed. All results below come from runs made in this pass. Playwright lock `_source_cache/.playwright.lock` ("regression") was held for every e2e run and then deleted. The screenshot `git status` was recorded before the first run. After each run, only the tracked screenshots that run had rewritten were restored (`git checkout --`), and files the run created were removed. The 11 screenshots that were already modified (`screenshots/week1-workbench/*` x6, `screenshots/workbench/*` x5) were put back byte for byte from a copy taken before the first run, because the retargeted `workbench.spec.ts` writes 5 of those names. The final screenshot status matches the baseline.

### Environment fix (task 1)

- `playwright.config.ts`: the default suite now starts its **own** dev server on port **5176** (`e2e/vite.offline-e2e.config.ts`: its own optimizer cache `node_modules/.vite-e2e-offline`, no `/api` proxy), with `VITE_BACKEND=none` and `reuseExistingServer: false`. It no longer reuses the shared 5173 server or its optimizer cache, and never depends on a course server. Offline mode is a real product mode: `.env.student` sets `VITE_BACKEND=none` for the static student build. `src/services/backend.ts` then compiles the server paths out (state `offline`, no `/api` probe), `src/publishing/client.ts` sets `OFF`, and `App.tsx` drops the authoring route. Server mode keeps its own suite (`playwright.server.config.ts`).
- Added `e2e/warmup.global-setup.ts`, which visits each lazily loaded route once on the fresh server before the tests run. It asserts nothing.
- Set `workers: 4` and `expect.timeout: 10 s`. Run 2 still had 13 first-render timeouts under 7 workers, and every one of them passed on its own. No assertion was changed.
- `playwright.lectures.config.ts`: same own server on 5198, plus `VITE_BACKEND=none`. Before this, Weeks 2-5, 8 and 9 failed on "502 Bad Gateway" console errors from the `/api` probe.
- `e2e/project.spec.ts`: the second browser context took a hard-coded `http://127.0.0.1:5173`. It now uses the suite's `baseURL`.

### E2E runs

| Run | Command | Result | Duration |
|---|---|---|---|
| Default, run 1 (new server, before spec fixes) | `npx playwright test` | 88 passed, 53 failed, 1 skipped | 23.5 min |
| Lectures, run 1 (before fixes) | `npx playwright test -c playwright.lectures.config.ts` | 27 passed, 14 failed | 24.4 min |
| Default, run 2 (warm-up and spec fixes, 7 workers) | `npx playwright test` | 123 passed, 15 failed, 1 skipped | 14.1 min |
| **Default, final** (4 workers, 10 s expect) | `npx playwright test` | **136 passed, 2 failed, 1 skipped** (`zz-visual-loop`, a deliberate `test.skip`) | 14.6 min |
| **Lectures, final** | `npx playwright test -c playwright.lectures.config.ts` | **41 passed** | 17.7 min |
| **Server** (two-session, Demo A publishing, Demo C/D canvas) | `npx playwright test -c playwright.server.config.ts` | **4 passed** | 1.3 min |

Run 1 had no console-error failures: offline mode removed the `/api` 502 cause from the default suite.

### Classification of the run-1 failures (default 53 + lectures 14)

| Class | Count | Tests | Disposition |
|---|---|---|---|
| Environment: cold server or load (first render past 5 s; "Execution context destroyed" while axe ran during an optimizer reload) | 21 | `lectures-week2…7:19`, `lectures-week4:65`, `week3/6/7-flow` archive, `week1-flow:63,208`, `app.spec:140`, `week8/9-flow` lab tool, `week6/8-flow` axe dark, `week9-flow:50` | Fixed by warm-up, 4 workers and 10 s expect. All pass in the final run. |
| Environment: `/api` 502 in the lectures config | 6 | `lectures-week2,3,4,5,8,9:19` | Fixed by `VITE_BACKEND=none` |
| Stale: dashboard moved to `#/dashboard` (M4a) | 5 | `week2,3,4,5,8-flow` dashboard tests | `fresh(page, '/dashboard')`. Same assertions. |
| Stale: Weeks 7 and 9 are lecture-first weeks | 1 | `app.spec:180` | Added `week7-home`/`week7-workload` and `week9-home`/`week9-workload` branches, like Weeks 2–8 |
| Stale: Week 1 lectures instructor-only (M4a), Learn replaces the reader (M4b), homepage at `#/` | 16 (8 per config) | `lectures.spec.ts` | Tests run as the instructor (instructor mode stored before load). The viewer checks the five-stage nav. The retired Week 1 reader test now checks that the lesson and every legacy section redirect to the Learn section that absorbed it (`LEGACY_TO_SECTION`), plus a textbook citation reaching the sources route. Dashboard card: Learn link and `#/dashboard`. Axe and 400 px scan Learn. |
| Stale: practice workbench retired (M5) | 17 | `workbench.spec.ts` | Retargeted to `#/week/1/project/tool`, the only route that still mounts the Week 1 workbench. Problems → selection → impact and undo/redo now run on the team proposal. Regions, keyboard, assessments, theme, axe, layout, medium and narrow are kept. Axe now waits for the drawer's fade-in to finish. Removed with the retired surface (its views are not routed): the try-first and guided-boundary missions and the AeroLink needs writer (3 tests). |
| **Real regression** | 2 | `week9-flow:138` light and dark | **Not fixed** (Week 9 is under review). See below. |

### Real regression (open)

**Week 9 lab tool scrolls sideways at 400 px.** Repro: offline dev server, viewport 400×860, `#/week/9/lab/tool`, import the three fixture files (`importAll` in `e2e/week9-flow.spec.ts`). `table.w8-table[data-testid="w9-needs"]` is 860 px wide, `document.documentElement.scrollWidth` = 749 > 400. The table's inputs (`input.w8-input`, 167 px) are not inside a horizontally scrolling wrapper. Before the import the page fits (scrollWidth 400). This sits in Week 9 content and styles (`src/week9/**`), so it is left to the Week 9 stream.

### Static and unit gates (final tree)

| Check | Command | Result | Duration |
|---|---|---|---|
| Type check | `npx tsc -b` | exit 0 | 141 s |
| Config and setup typecheck (not covered by `tsc -b`) | `tsc --ignoreConfig --noEmit --strict …` on the two Playwright configs, `e2e/warmup.global-setup.ts`, `e2e/vite.offline-e2e.config.ts` | exit 0 | — |
| Unit / interaction | `npx vitest run` | **146 files, 3331 passed** (no timeouts, so the Week 7/11 reruns were not needed) | 76 s |
| Server | `npx vitest run --config vitest.server.config.ts` | **15 files, 380 passed** | 8 s |
| Student build + checks | `npm run build:student` (runs `tsc -b`, `vite build --mode student`, `scripts/check-student-build.mjs`) | **PASS**. Week 9 decks already present (`public/lectures/week09-session1/2.pptx`), so `lectures:pptx` was not run. 64 student deck links all resolve, none to Week 1. No course-server or publishing marker in the student build. Note: the instructor-build checks read the existing `dist/`, which was not rebuilt in this pass. | 91 s |
| Lint | `npm run lint` (oxlint) | **0 errors, 110 warnings** (`only-export-components`, `react(refs)`, `set-state-in-effect`, `purity`; none in the files changed here) | 7 s |

### Files changed in this pass (tests and config only, no app code)

`learning-studio/playwright.config.ts`, `learning-studio/playwright.lectures.config.ts`, new `learning-studio/e2e/vite.offline-e2e.config.ts`, new `learning-studio/e2e/warmup.global-setup.ts`, `learning-studio/e2e/{app,lectures,workbench,project,week2-flow,week3-flow,week4-flow,week5-flow,week8-flow}.spec.ts`. Each edited file keeps its committed line endings (CRLF for `app`, `lectures`, `workbench` and the lectures config; LF for the rest), and `git diff --stat` equals `--ignore-cr-at-eol` for every file except `e2e/project.spec.ts`. That file was already LF in the working tree against a CRLF index before this pass (348 vs 21 changed lines), and the same holds for `src/activities/week11/{FlowCoverage.tsx,StateWalker.tsx,logic.test.ts}` and `_source_cache/verification/readings.py`.

### What remains

1. The Week 9 lab-tool 400 px overflow (above), for the Week 9 stream.
2. If the reviewers want the three retired practice-workbench tests (missions 1–2, AeroLink needs writer) covered again, that coverage belongs to Guided Practice's own specs.
3. The default suite takes about 15 min with 4 workers on this laptop. The lectures suite takes about 18 min (1 worker, every slide scanned with axe).
