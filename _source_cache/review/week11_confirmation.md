# Week 11 confirmation review: fixes to the 2026-10-22 REVISE findings

**Reviewer.** Independent reviewer (AI, Claude). Date: 2026-10-22.

**Mode.** Read-only. No git operation; Week 12 files ignored. The only file I wrote is this one; probes and logs are in my session scratchpad.

**Mutation tests.** Three cheap mutations of `src/workbench/week11/physical.ts`, each reverted at once. A backup copy and `diff -q` confirm the file is byte-identical to its state before the mutations.

**Under review.** The dispositions in `learning-studio/docs/lectures/week11/WEEK11_MILESTONE_REPORT.md` §11, checked against the code, the models and the runs, not taken from the report. Paths are relative to `learning-studio/`.

## Verdict: **SIGN-OFF for Week 11**, with one new minor note (C1) that does not block

The major finding, all three moderates and every minor finding are closed, each for the right reason, apart from m9, which stays a faculty exemption as directed. The mutation tests show that the new N1, N2 and m5 checks can fail.

## What I re-ran

- **Type check:** `npx tsc -b`, **exit 0** (the Week 12 errors of the first review are gone).
- **Unit tests:** `npx vitest run src/week11 src/workbench/week11 src/content src/components/figures src/pages/InstructorReview.test.tsx src/workbench/shortAnswers.test.ts` gave **66 files, 2,249 passed, 0 failed**. The register-count test now passes too.
  - A first run in the background overlapped my mutation window, so I discarded it and ran again with the file restored.
- **Checker:** under `_source_cache/.sysml.lock` ("w11-confirm", deleted after), on `sysml/lectures/week11` plus the exercise key.
  - Result: **19 files, 14 PASS, 5 FAIL, 0 ERROR**.
  - All 19 match `week11-report.json` (2026-10-22T10:43Z) on SHA-256, status and diagnostics.
- **Playwright:** under `_source_cache/.playwright.lock` ("w11-confirm", deleted after).
  - `week11-flow.spec.ts` **6/6**, plus `app.spec.ts` "every week, the roadmap and the reference pages render" **1/1**.
  - `lectures-week11.spec.ts` **4/4**. The dark axe test failed once with "Execution context was destroyed … navigation". That fits a dev-server reload while the Week 12 agent was editing; the test passed on a rerun with no violations.
  - My scratch probe spec (separate port 5191):
    - no sideways scroll at 400 px with blank crossing rows and a requirement-allocation row added;
    - **no console error or warning**;
    - drawn figure labels at least **24.2 px** (lesson) and **16.6 px** (examples), none under 13 px.
- **Screenshots.** No screenshot was rewritten by my runs. The 9 extra screenshots that were modified when I recorded `git status` belonged to another agent's run, which held the Playwright lock at that moment; they were restored before my runs ended. Besides those, `git status` differs only by Week 12 work (`content/course.ts`, the Week 12 milestone report).

## Per-finding table

| ID | Status | Evidence |
|---|---|---|
| M1 | **Closed, for the right reason** | **The intended FAIL.** `invalid_conjugate_unqualified.sysml` uses `'~Oxygen port'` unqualified, and its comment says the name is declared inside `'Oxygen port'`, so it does not resolve here. It fails with "Couldn't resolve reference to Type ''~Oxygen port''.": exactly what it now teaches.<br>**The recorded PASS.** `conjugate_qualified_name.sysml` (`~'Oxygen port'` and `'Oxygen port'::'~Oxygen port'`) PASSes with no message, in my run and in the record.<br>**The teaching text.** The slide notes (`session1.ts:486`) give the actual name `P::'~P'` and its quotes (R81 p.95, R71 sl.21). The misconception (`:492`) and the lesson (`:770`) state both correct forms, in ASCII quotes. The calibration label reads "unqualified '~P' name" (`listings.ts:303`).<br>No "nobody declared", "~ inside quotes" or old file name remains in `src`, `sysml`, `docs`, `scripts` or `e2e`. |
| N1 | **Closed** | **The new check.** `limitOf` / `meetsLimit` (`physical.ts:452-485`) produce `satisfy-value-violates` and `satisfy-value-unit`. Either one leaves the claim out of the model, the minimum and readiness.<br>**Mutation.** Making `meetsLimit` always return `true` fails the N1 test in `physical.test.ts`, so the check can fail.<br>**No misfire on valid models.** Limits parsed:<br>- AeroLink v0.3: 25, among them REQ-SYS-001 `chargeTimeToDispatch <= 20 min` and REQ-SYS-002 `<= 65 dB`;<br>- the team07, stress and collision models: 8, 6 and 8.<br>The AeroLink claims (18 min, 63.5 dB) and the fixture claims raise no satisfy finding.<br>**Edge probes:**<br>- An attribute with no value (TBD), even one whose doc contains "= 30", gives no limit.<br>- A compound `and` constraint and an expression limit (`a * 2`) give no limit.<br>- A reversed constraint (`minP <= s.p`) is flipped correctly.<br>- `ab` versus `a` resolves to the right attribute.<br>- At the boundary: 20 [min] meets `<= 20`, 20.01 does not; `18 ['min']` and `18[min]` both read.<br>**Conservative choices (not defects):**<br>- A compatible unit (`0.3 [h]` against 20 min) or a bare number against a unit limit gets `satisfy-value-unit`, which says the tool cannot compare.<br>- Only the first `require constraint` is read.<br>The tool help and checklist disclose that other constraint forms are not compared. |
| N2 | **Closed** | **The new rule.** A code repeated on one ID takes `-2`, `-3` (`physical.ts:622-630`), and `needsDisposition` reads `baseCode`.<br>**Probe.** Two blank rows and the same unknown item in both directions on IF-003 give `flow-item-missing-empty`, `-empty-2`, `-unknown` and `-unknown-2`, with no duplicate key. The fixture has no duplicate keys. Disposable codes with a suffix (`name-clash-2`, `phy-idle-2`) still need a disposition.<br>**Mutation.** Removing the suffix fails the N2 unit test.<br>**The e2e.** The axe test now tracks console errors and adds two blank rows plus a requirement-allocation row. It passes, and my probe saw no console output. |
| N3 | **Closed** | **The new storage.** Allocation rows are an array keyed by a stable `row` number (`Week11LabTool.tsx:353-380`).<br>**Probe (Playwright).** Two rows typed with the same REQ-STK-001 both stay, holding PHY-002 and PHY-005. The tool shows a message beside the row and raises `req-part-duplicate` (`physical.ts:997`).<br>**Old stored records.** `normalizeState` (`state.ts:82`) converts the old object form to rows, for the browser store and a teammate's workspace file alike. |
| m1 | **Closed** (see C1) | **The change.** `InstructorReview.tsx:22-28` renames the lab item to `w<N>-lab-summary` only where a lesson block already holds `w<N>-lab`.<br>**Saved decisions still match.** Lesson block IDs are unchanged, and Weeks 2–8 keep `w<N>-lab` for their lab item. `InstructorReview.test.tsx` checks both, plus ID uniqueness and a full render with no same-key warning (passes).<br>**Every week renders.** The app.spec "every week" test passes. |
| m2 | **Closed** | Recomputed from `LAB11_PERSON_HOURS_THREE`: 1.0 + 0.6 + 2.2 + 1.0 + 0.5 + 0.8 + 1.2 + 0.6 = **7.9 person-hours**, 7.9 / 3 = **2.6 h** each.<br>Recomputed `week11Path.ts`: class 2.5, readings 0.5, slides 0.4, lesson 0.5, lab 2.1, quiz 0.3, exercise 0.8, log 0.1, total **7.2 h**; for a team of three **7.7 h**.<br>The only reduction is the satisfy minimum, which the tool enforces. |
| m3 | **Closed (faculty item 3a)** | Task 1 now allows one-line part definitions. The key marks a REQUIRED CORE and an EXTENSION (the context the tables give). Still 50 min. |
| m4 | **Closed** | `predict_conjugate_end_unprotected.sysml` (P3) PASSes and is a session 2 calibration row (`listings.ts:307`). The checklist rows on ports and flows (`labBrief.ts:54-55`) name P3, P4 and P6 in plain words, with no review codes. |
| m5 | **Closed** | `parseModel` now also checks that the root package closes (`physical.ts:251-253`).<br>**Mutation.** Removing that check fails the m5 test.<br>**No false refusal.** All valid models still import: AeroLink v0.3 and v0.4 through `parseModel`, and the fixture, stress and collision models, all of whose generator tests pass. |
| m6 | **Closed (documented, faculty item 8)** | The e2e reads `e2e/fixtures/week11-team07-week5-inputs.json`. Its currency test (`sysmlWeek11.test.ts:185-188`) compares it with `FIXTURE_WEEK5_JSON` (passes). |
| m7 | **Closed** | The outline is marked superseded at `:3`, `:523` (with the built 7.2 h / 7.9 person-hours / 7.7 h) and `:562` (exercise). |
| m8 | **Closed** | `week11Lab.test.ts:25` now says `build-lab-md.mjs 11`. |
| m9 | Faculty exemption (item 6) | Unchanged. Drawn labels are at least 16.6 px; listing code is as in Weeks 9–10. |

## New note (minor; does not block)

| ID | Severity | File:line | Evidence | Fix |
|---|---|---|---|---|
| C1 | Minor (shared, pre-existing) | `src/pages/WeekPage.tsx:430` (`<ReviewControls id={`w${c.week}-lab`} …>`), against `:332` (`id={b.id}`) | The m1 fix separates the two items only in the review list. On a week page, the lab section's review control still writes to `w<N>-lab`, which for Weeks 9–13 is the lab lesson block's ID.<br>**Effect.** Where those archived pages render both, the lab decision and the block decision are still one record. A decision made on the week page does not appear on the `-lab-summary` row of the review list. | Use the same rule in `WeekPage.tsx:430`: `-lab-summary` where a block holds `w<N>-lab`. Better, share one helper with `reviewableItems()`. |

**Also checked, with nothing new found**
- **Student text.** No review code, finding code or probe label in the lessons, the week pages, the lab, the tool help or the checklist. Finding codes appear only in `data-` attributes.
- **The five intended FAILs.** Each still fails for its stated reason.

## Required for sign-off

Nothing. C1 can be fixed on the next touch of the shared review pages.
