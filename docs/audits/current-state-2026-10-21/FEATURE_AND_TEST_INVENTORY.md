# Feature and Test Inventory — SysML Learning Studio

Audit date: 2026-10-21 · Auditor 1 of 3 · READ-ONLY
App: `learning-studio/`

**Important:** every command executed in this audit ran against the **dirty working tree** (HEAD `8b9637d` plus 50 modified tracked files and 22 untracked files from stopped, unverified agents: Week 6 partial build, Week 5 fixes, W9/W11/W12 partials). Results therefore describe neither HEAD alone nor a reviewed state. HEAD alone was **not** tested (that would need a checkout/stash/worktree, which the audit rules forbid).

---

## 1. Test infrastructure at a glance

| Layer | Tooling / config | Inventory |
|---|---|---|
| Unit + component (jsdom) | Vitest 5.0.3, `vitest.config.ts` (jsdom, `src/test/setup.ts`, 30 s timeout), Testing Library, `fake-indexeddb` | 106 files, 2,351 tests (this run). Untracked among them: `components/figures/week6FigureKit.test.ts` (34), `content/lab/week06Lab.test.ts` (12), `content/quizWeek6.test.ts` (25), `content/lectures/week06/timing.test.ts` (20), `workbench/week6/record.test.ts` (24) = 115 tests. Modified (uncommitted) test files: `activities/week11/{activities,logic}.test.*`, `activities/week12/logic.test.ts`, `content/lectures/week05/aerolinkCase.test.ts`, `workbench/week5/record.test.ts`, `workbench/shortAnswers.test.ts` |
| End-to-end | Playwright 1.64.0, local Chrome (`channel: 'chrome'`); `playwright.config.ts` (reuses 5173); `playwright.lectures.config.ts` (6 lecture specs, own server 5198) | 16 spec files, 2,616 lines (§3). **Not run in this audit** (they write tracked screenshots) |
| Accessibility | `@axe-core/playwright` `AxeBuilder`, tags `wcag2a`, `wcag2aa` | Used in 15 of 16 e2e specs; no axe in Vitest |
| Type check | `tsc -b` (both tsconfigs `noEmit: true`) | run (§2) |
| Lint | `oxlint` + `.oxlintrc.json` | run (§2) |
| Build validation | `npm run build:student` → `scripts/check-student-build.mjs` | run (§2, §4) |
| SysML validation | `scripts/check_sysml.py` (OMG Pilot Implementation via Java, toolchain in gitignored `tools/`); recorded reports under `sysml/**/*.json` checked by Vitest | Python checker **not run**; recorded-report tests run in Vitest |
| Content generators | `content:readings`, `lab:md`, `lectures:pptx`, `export:curriculum`, `build-week08-sysml.mjs` | not run (generators) |

---

## 2. Executed in this audit (dirty tree)

### 2.1 `npx vitest run` (full suite)

- Started 09:53:21, Duration **127.66 s** (wall 2 m 14.6 s).
- **Test Files: 3 failed | 103 passed (106). Tests: 4 failed | 2,347 passed (2,351).**
- Failures, verbatim:
  1. `src/content/content.test.ts > course content integrity > the readings export matches the project register (140 entries, … only R30 is a declared exception)` — `AssertionError: expected [ { id: 'R01', …(10) }, …(144) ] to have a length of 140 but got 145` (`content.test.ts:84:22`).
  2. `src/activities/week07/activities.test.tsx > Week 7 activities > simulator: the DEC is refused without owner initials and records them when given` — `Error: Test timed out in 30000ms.`
  3. `src/activities/week07/activities.test.tsx > Week 7 activities > swing walkthrough: flags points that rise down the ranking, then feeds consistent points to the simulator` — expected text "CRIT-003 is ranked below CRIT-002 but has more points"; received "✗ CRIT-002: points must be greater than 0 and at most 100.✗ CRIT-003: points must be greater than 0 and at most 100.✗ CRIT-002 is ranked below CRIT-001 but has more points (50000 > 100); …" (`activities.test.tsx:164:54`).
  4. `src/activities/week11/activities.test.tsx > Week 11 activities > RID writer: blocks a vague RID and a missing writer, records owner and provenance on a good one` — `Error: Test timed out in 30000ms.`

### 2.2 Isolated reruns

| Command | Result | Duration |
|---|---|---|
| `npx vitest run src/activities/week07/activities.test.tsx` | 11/11 passed | 25.21 s |
| `npx vitest run src/activities/week11/activities.test.tsx` | 9/9 passed | 20.28 s |
| `npx vitest run src/content/content.test.ts` | **1 failed / 12 passed** (same assertion, 145 vs 140) | 1.89 s |

Interpretation (evidence-based):
- Failures 2–4 are load-dependent (they pass alone), consistent with the known flake. Failure 3 is an assertion failure, not a timeout: under load the typed value became `50000`, i.e. keystrokes landed before a clear completed.
- Failure 1 is **deterministic and caused by the uncommitted tree**: `git show HEAD:…/readings.generated.json` has 140 readings, the working copy has 145 (R105–R109 added by the Week 6 agent in `_source_cache/verification/readings.py`, marked "PENDING FACULTY CONFIRMATION"); the test still expects 140.

### 2.3 Other commands

| Command | Result |
|---|---|
| `npx tsc -b` | exit 0, no diagnostics, 69 s |
| `npm run lint` (oxlint) | exit 0; 0 errors; warnings only: `react(only-export-components)` in figure and page modules (e.g. `LectureWeek3Parts.tsx:110`, `LectureWeek4S1.tsx:570`, `InstructorReview.tsx:13`) and `eslint(no-unused-vars)` at `scripts/build-lectures.mjs:68` |
| `npm run build:student` | exit 0, 2 m 4 s. Vite warning: chunks > 500 kB (largest `weeks-*.js` 1.10 MB, `lectures-*.js` 0.89 MB, `weekStatus-*.js` 0.60 MB, `sysml-*.js` 0.55 MB); `dist-student/` = 30 MB. Check output: "none of 13 exam markers present", "none of 2719 faculty-notes markers present", 14 student decks "all empty", "My Project present (4 of 4)", instructor `dist/` "13 of 13 exam markers", "2719 of 2719 faculty-notes markers", 14 instructor decks with notes → **"student build check: PASS"** |
| `git status --porcelain` vs baseline after each command | identical (no tracked/untracked change); `dist-student/` overwritten (gitignored) |

Caveat for the student-build PASS: the instructor-side proof compares against the existing `dist/`, which is dated 2026-10-19 20:59 (not rebuilt in this audit, `npm run build` was not in the allowed list). All markers were found there, so the both-directions proof held for this tree, but `dist/` is not guaranteed current.

---

## 3. End-to-end specs (read, not run)

| Spec | What it asserts (from test bodies/titles) | Writes screenshots? |
|---|---|---|
| `app.spec.ts` | Dashboard honest status + navigation to Week 1 (l.26); Week 1 archive module: complete a section, quiz, stakeholder exercise (l.41); stakeholder editor add/relate/validate/persist (l.69); theme toggle persists (l.111); instructor review mode controls + review log (l.122); Week 1 module lab/assignment/workload + instructor notes (l.137); AeroLink model workspace reference/load/link/persist (l.155); **every week 1–14, roadmap and reference pages render without console errors (l.177)**; axe WCAG 2 A/AA on 24 pages × light/dark (l.261) | yes (`screenshots/`) |
| `lectures.spec.ts` | Viewer keyboard nav, outline, counter, citations, address bar (l.38); notes toggle shows faculty notes marked instructor content; present mode (l.91); handout with notes only when asked (l.127); reader TOC, figures, citations to `#/sources`, slide links (l.140); figure canvas 1600×900 light even in dark preference (l.183); dashboard Week 1 card links (l.198); axe every slide both sessions notes on, handout, reader, both themes (l.213); 400 px stacked layout, no horizontal scroll (l.249) | yes |
| `lectures-week{2,3,4,5,8}.spec.ts` | Per week: viewer counter, week navigation, back to week page, reader lists both sessions; axe on every slide/handout/reader in both themes; 400 px no horizontal scroll | no `page.screenshot` found |
| `week1-flow.spec.ts` | Welcome one-column + "How to use this site" (l.52); end-to-end Dashboard → Week 1 → slides → lesson → examples → lab (record imported, exported) → assessment → ready (l.76); "submitted for approval" never "ready" (l.171); legacy routes redirect without history entry (l.182); week nav on every Week 1 page (l.203); axe + layout per page at widths × themes (l.249); 400 px layout (l.270) | yes |
| `week{2,3,4,5}-flow.spec.ts` | Dashboard "Available" card; full week walk with week nav; lab tool rejects wrong-week file, imports previous-week export and teammate export, exports versioned record; archive page + alias redirects; axe at 1440×900 and 400 px both themes | no |
| `week8-flow.spec.ts` | Same pattern plus: lab tool refuses wrong file, imports Week 1 + Week 2 exports, previews/exports model v0.1 and matrix (l.89); checker install guide (l.116) | no |
| `workbench.spec.ts` | Week 1 workbench regions, no lock; prediction locked before sort; boundary mission; problems → select → impact; undo/redo; AeroLink proposal error until own enterprise; layout at 1440×900 and medium width; needs writer gates; keyboard F6/arrows/?/Esc; assessments panel instructor notes only in instructor mode; theme; axe both themes; screenshots per view; narrow viewport | **yes — these are the 11 modified PNGs in `git status`** |
| `project.spec.ts` | Demo workflow lecture → practice → My Project → stakeholders/needs → milestones → export and restore → Week 8 preview (l.43); overwrite protection (typed title, pre-import version) (l.177); Week 1 lab-tool import via plan vs legacy (l.209); copy from practice needs confirmation, new IDs, practice badge (l.234); `?storage=memory` banner + export, `?storage=fail` "Not saved" (l.256); second tab read-only + take over (l.273); keyboard-only tabs and create form (l.286); axe + layout at widths × themes (l.309) | yes |
| `zz-visual-loop.spec.ts` | `test.skip` — causal loop capture | (skipped) |

No e2e spec exists for Week 6, Weeks 7, 9–14 week pages beyond the `app.spec.ts` loop, or the draft modules' activities (those have Vitest component tests).

---

## 4. Student/faculty separation — what `check-student-build.mjs` actually checks

1. **Exam banks**: extracts markers from `src/instructor/exams/*.ts` (bank `title:` strings and item labels matching `'[A-C]\d \(\d+ pts;…'`), comments stripped; throws if fewer than 3 markers. Asserts none appear in any text file of `dist-student/`.
2. **Faculty notes**: parses every `src/content/lectures/weekNN/sessionN.ts` with the TypeScript AST; every string inside a slide's `notes` object and every `purpose` string yields a 40-character marker (longest run without escapable chars); markers that also occur in public text (slide faces, lessons, any other non-test `src/` file) are discarded; throws if fewer than 50 remain (2,719 in this run). Asserts none appear in `dist-student/` text files.
3. **Decks**: every `dist-student/lectures/*.pptx` must have empty notes slides.
4. **My Project present**: 4 literal markers must be in the student build.
5. **Both-directions proof** (only if `dist/` exists): every exam and notes marker and all 4 project markers must be in `dist/`; each instructor deck must contain "TEACH" and at least one marker; deck counts must match.

What it does **not** check (from reading the code and the app):
- Instructor mode itself is not removed from the student build. `IS_STUDENT_EDITION` gates only the slide Notes button, the handout notes checkbox (`LectureViewer.tsx:112`, `Handout.tsx:20`) and the exam-bank glob (`instructor/index.ts:10`). The instructor-mode checkboxes, `#/instructor`, the `InstructorPanel` (week-content `instructorNotes`, rendered at `WeekPage.tsx:644` when instructor mode is on) and workbench instructor notes ship in the student edition and can be enabled by any student.
- `instructorNotes` in `content/weeks/weekNN.ts` and lab/quiz answer keys are not markers.
- No check that the student build has no "instructor" UI strings.

---

## 5. Feature → evidence table

"Executed?" = run in this audit. All executed results are on the dirty tree.

| Feature | Claimed where | Test evidence (file) | Executed in this audit? | Result |
|---|---|---|---|---|
| Hash routing and route parsing | `lib/router.tsx`, route files | `lectures/route.test.ts`, `week1/week1.test.tsx:35,48`, `state/AppState.test.tsx:64`, `flow/flow.test.tsx:17` | Yes | Pass |
| Every week page renders | `app.spec.ts:177` | e2e | No | Last recorded run (2026-10-19) **failed at Week 8** (stale test, see route map §8) |
| Lecture-first week pages W1–5, W8 | DECISION_LOG A20/A21 (claim) | `week1.test.tsx`; e2e `weekN-flow.spec.ts` | Unit yes; e2e no | Unit pass |
| Lecture registry and validator | `content/lectures/validate.ts` | `content/lectures/lectures.test.ts` (31), `weekNN/timing.test.ts` | Yes | Pass (incl. untracked Week 6 timing test) |
| Week 6 lecture/figures/lab/quiz/record (partial) | untracked files | `week6FigureKit.test.ts`, `week06Lab.test.ts`, `quizWeek6.test.ts`, `week06/timing.test.ts`, `workbench/week6/record.test.ts` | Yes | Pass (115 tests) — but no route renders lab/quiz/record, and no e2e/axe coverage |
| Readings register integrity | `content.test.ts` | `content/content.test.ts:83` | Yes | **Fail** (145 vs 140; caused by uncommitted R105–R109) |
| Citations resolve within verified page ranges | `content.test.ts:73`, `lectures.test.ts:113,125` | same | Yes | Pass |
| Quizzes (one correct option, explanations) | `content.test.ts:95`, `quizWeekN.test.ts` | same | Yes | Pass |
| Lab instructions single-source | `week1.test.tsx:117`, `week0NLab.test.ts` | same | Yes | Pass |
| Week 1 workbench (regions, keyboard, undo/redo, problems) | `workbench/*` | `workbench/shell.test.tsx` (8), `problems.test.ts`, `changes.test.ts`, `missions.test.ts` (73) | Yes | Pass |
| Lab tools W2–W5, W8 (gates, import/export) | `workbench/weekN/record.ts` | `WeekNLabTool.test.tsx`, `record.test.ts` | Yes | Pass |
| Cross-week short-answer gate sweep W1–W5, W8 | `docs/lectures/GATE_SWEEP_2026-10-19.md` (modified, uncommitted) | `workbench/shortAnswers.test.ts` (342; modified) | Yes | Pass |
| Cross-week import chain (Week N tool reads Week N−1 export) | lab tool headers | `record.test.ts` import cases; `Week2LabTool.test.tsx`; e2e `weekN-flow.spec.ts` "lab tool: rejects a non-Week-(N−1) file…" | Unit yes; e2e no | Unit pass |
| Week 8 SysML generator matches committed files and recorded checker report | `sysmlWeek08.test.ts` | `workbench/week8/sysmlWeek08.test.ts` (50), `skeleton.test.ts` (34) | Yes | Pass (compares SHA-256 against recorded report; does not run the Java checker) |
| SysML listings labelled "validated" only if text matches report | `lib/sysml.ts` | `lib/sysml.test.ts` (4, incl. mutation and "nothing under sysml/instructor/ is bundled") | Yes | Pass |
| Reference SysML model mapping/drift (v0.1–v0.4) | `model/reference` | `sysmlMapping.test.ts` (13), `sysmlDrift.test.ts` (4), `reference.test.ts`, `reference.detail.test.ts` (47) | Yes | Pass |
| Engineering model integrity (IDs, link rules, threads) | `model/engineering.ts` | `model/engineering.test.ts` (10), `model/model.test.ts` (4) | Yes | Pass |
| Stakeholder IDs never reused, persistence, storage-failure fallback | `state/AppState.tsx` | `state/AppState.test.tsx` (5) | Yes | Pass |
| AeroLink workspace persistence | `state/Workspace.tsx` | `state/Workspace.test.tsx` (3) | Yes | Pass |
| My Project store (IndexedDB rev check, autosave coalescing, undo, restore, failing disk, second writer, daily auto version) | `project/store/*` | `project/store/store.test.ts` (14, fake-indexeddb) | Yes | Pass |
| My Project export/import (round trip, checksum, schema refusal, plan, ID collision, replace + pre-import snapshot, v3 Week 1 import, report) | `project/transfer/*` | `project/transfer/transfer.test.ts` (8) | Yes | Pass |
| Practice/project isolation (no AeroLink in new project; copied items new IDs) | `project/isolation.test.ts` | same (5) | Yes | Pass |
| Week 1 ↔ project adapters | `project/adapters/week1.ts` | `project/adapters/week1.test.ts` (8) | Yes | Pass |
| Tab lock / read-only second tab, memory/fail storage banners | `ProjectStore.ts`, `ProjectProvider.tsx` | `store.test.ts:146` (unit); `project.spec.ts:256,273` (e2e) | Unit yes; e2e no | Unit pass |
| Draft-module activities W02–W13 | `activities/*` | `activities/weekNN/*.test.*` | Yes | Pass, except W07 (2) and W11 (1) under full load; pass when run alone |
| AeroLink simulation | `sim/aerolink.ts` | `sim/aerolink.test.ts` (19) | Yes | Pass |
| Accessibility WCAG 2 A/AA | `TEST_REPORT.md`, `PROJECT_STATUS.md` (claims) | 15 e2e specs with `AxeBuilder` | No | Not verified now |
| Student edition excludes exams and faculty notes | `student-edition.ts`, `check-student-build.mjs` | build script | Yes | PASS (see §4 for scope limits) |
| Type safety | — | `tsc -b` | Yes | Pass |
| Lint | — | `oxlint` | Yes | 0 errors, warnings only |
| Instructor-only UI hidden from students | (implied by "instructor mode") | none | — | Not enforced (toggle available to all; §4) |
| Progress tracking | `pages/ProgressPage.tsx` | none specific beyond AppState tests | — | Only classic-module activities counted |

---

## 6. Historical claims vs verified now

| Claim (source, date) | Verified now? |
|---|---|
| `TEST_REPORT.md` Milestone 1 (2026-10-09): Vitest 25/25 (5 files), Playwright 9/9, axe 0 violations on 10 pages × 2 themes, build PASS, lint 3 warnings | Superseded. Now: 106 files / 2,351 tests, 4 failures under full load (1 deterministic). Playwright/axe not re-run. Lint now has many more `only-export-components` warnings and 0 errors |
| `TEST_REPORT.md` deadline-directive section (2026-10-09): 46/46 Vitest, Playwright 10/10, SysML self-test PASSED | Not re-verified (SysML Python checker not run) |
| `TEST_REPORT.md` itself flags the milestone-1 `aerolink.test.ts` "Limits to Growth" row as "not verified" (correction notice) | `sim/aerolink.test.ts` now has 19 tests, all pass; their adequacy was not reviewed in this audit |
| `PROJECT_STATUS.md` (last updated 2026-10-11): "full suite last run 346/346"; "End-to-end + axe: 11/11 … 0 violations"; "SysML: 7 files, 6 PASS + 1 intentional FAIL" | Stale. Vitest count has grown ~7×; e2e last on-disk run (2026-10-19) failed (`.last-run.json` status `failed`) |
| `PROJECT_STATUS.md`: "Milestone M2 met … Weeks 1–7 are complete drafts" | Under the current schedule (`content/course.ts`), only Week 1 has `status: 'template'`; Weeks 2–14 are `provisional`. Weeks 2–5 and 8 have lecture-first pages; 6 (partial, uncommitted), 7 and 9–14 do not. The "complete drafts" refer to the earlier-outline modules now under `#/draft/:n` |
| `PROJECT_STATUS.md`: exam security verified by leak check proven to detect material in the instructor build | Re-verified now: PASS with both directions (13/13 exam markers, 2,719/2,719 notes markers in `dist/`). Scope limits in §4 |
| `vitest.config.ts` comment and caller: W07/W11 activity tests flaky under load | Confirmed: failed in full run, passed alone |
| Caller: `app.spec` "every week" fails at Week 8 | Confirmed from code (no `n === 8` branch, `app.spec.ts:177–231`) and the 2026-10-19 error-context artefact; not re-run |
| `docs/project/P1_IMPLEMENTATION_REPORT.md`, `docs/lectures/*/WEEKN_MILESTONE_REPORT.md` | Not re-verified individually; the corresponding Vitest areas pass on the dirty tree |

---

## 7. Gaps observed

- No e2e or axe coverage for Week 6 or for the Week 6 Dashboard badge change.
- No test asserts the student edition hides instructor mode.
- `content.test.ts` register count is hard-coded and now disagrees with the uncommitted register; either the register change or the test is unfinished.
- Tracked modified files depend on untracked files (`emptyAnswer.ts`, `usePracticeUnlock.ts`, Week 6 lecture/figure modules registered in tracked `index.ts`/`registry.ts`): a partial commit of the tracked changes alone would break type-check and tests.
- HEAD `8b9637d` by itself was not tested in this audit.
