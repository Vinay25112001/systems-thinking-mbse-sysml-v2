# Week 10 confirmation review: fixes to the 2026-10-22 REVISE findings

Reviewer: independent reviewer, read-only. Date: 2026-10-22. No file edited except this one. No git operation. Week 11 files ignored.

**Under review:** the dispositions in `learning-studio/docs/lectures/week10/WEEK10_MILESTONE_REPORT.md` §12, checked against the code and models rather than taken from the report. Paths are relative to `learning-studio/`.

## Verdict: **SIGN-OFF for Week 10**, with two new minor notes (C1, C2) that do not block

Both majors and both moderates are closed, each for the right reason, and every minor finding is fixed except m8, which was deferred to the faculty as directed.

**What I re-ran**
- **Type check:** `npx tsc -b` exit 0 (no Week 11 noise at the time of my run).
- **Unit tests:** `npx vitest run src/week10 src/workbench/week10 src/content src/components/figures src/workbench/shortAnswers.test.ts` gave **1,922 passed, 0 failed**.
- **Checker:** one run under `_source_cache/.sysml.lock` ("w10-confirm", deleted after), on `sysml/lectures/week10` plus the bike-share key.
  - Result: **19 files, 15 PASS, 4 FAIL, 0 ERROR**.
  - All 19 match `week10-report.json` (2026-10-22T08:49Z) on SHA-256, status and diagnostic count.
- **Playwright:** run under `_source_cache/.playwright.lock` ("w10-confirm", deleted after).
  - `week10-flow` 6/6 and `lectures-week10` 4/4: axe clean in light and dark, no sideways scroll at 400 px.
  - The 400 px axe test now fills the lab tool.
  - My text-size measurement is unchanged: drawn figure labels are at least 14.5 px at 1440 px; listing code is 6.1–8.8 px, identical to Week 9 (m8, faculty item).
  - `git status` before and after differs only by two new Week 11 files written by the other agent. No screenshot changed, so none needed restoring.
- **Probes:** a scratch vitest probe of the readers, the dispositions, the three-person scope, the AeroLink findings, Week 9's strip and the workload.

## Per-finding table

| ID | Status | Evidence |
|---|---|---|
| M1 | **Closed, for the right reason** | **The intended FAIL.** `invalid_transition_parallel.sysml` now owns a *same-region* transition (`operational.onPad → operational.inFlight`) in the parallel state and fails at 20:3 with "A parallel state cannot have successions or transitions.". That is exactly the ownership rule it teaches; the file comment says the checker does not look at crossing.<br>**The new silent pass.** `predict_cross_region_inside.sysml` is a cross-region transition written inside a region. It PASSes with no message in my run and in the record. It is recorded truthfully everywhere I looked:<br>- the calibration row "crossing regions, inside a region" (`listings.ts`);<br>- the s1 checker bullets and notes (`session1.ts:690, 695`), with the misconception count now computed (`All ${accepted.length}`);<br>- predict card 2 and its reveal, "No, not caught", with the purpose line "all three pass" (`session2.ts:333-350`);<br>- the common errors ("none … reliably rejected", `:508, 512`) and the lesson (`:788`);<br>- milestone §7.<br>No "transition across regions … caught" wording remains. |
| M2 | **Closed** | **Generator** (`behavior.ts:914-972`): `AltChoice.at` takes 'before' or 'after'. A before-decision is written after the step's merge, with `else <step>`; an after-decision has `else <next entry>`.<br>**Before and after, per alternate, in AeroLink SCN-002:**<br>- A3: after step 3 → **before** step 3 (`else acceptIntent`).<br>- A2: after step 4 → after step 4 (unchanged).<br>- A1: after step 6 → **before** step 6. The flow is now `decide beforeApproachAndLand; if destinationPadOccupied then holdOrDivert; else approachAndLand`, and both paths reach `merge rejoinDeplane`. The aircraft is checked against the pad before landing; the checker PASSes.<br>**Teaching and disclosure.** The rule "the decision sits where the condition becomes known" and the whole-step limitation are stated in:<br>- the slide (`session1.ts:627, 634, 636`);<br>- the lesson (`:824`);<br>- the tool help (`Week10LabTool.tsx:307`) and the per-alternate select (`:370-372`);<br>- the lab method.<br>**Exercise.** Key, task 2 and the rubric rows for tasks 1 and 2 agree: A2 is decided before docking, and `else returned` leads into the merge before step 4.<br>**Tests:** `behavior.test.ts:178-185`, including the default "after". |
| N1 | **Closed** | **Recomputed from `LAB10_PERSON_HOURS_THREE`:** 1.0 + 1.0 + 1.6 + 1.0 + 0.6 + 0.8 + 1.0 + 0.5 = **7.5 person-hours, 2.5 h each**. Per student: 2.5 + 0.4 + 0.8 + 0.5 + 2.5 + 0.3 + 0.8 + 0.1 = **7.9 h**, which matches `THREE_PERSON` in my probe.<br>**Rows now match their scope.** The rows marked "as for a team of four" carry the team-of-four hours; the rows with fewer hours state a real reduction in scope.<br>**The tool enforces it.** My probe on the fixture team with `threePersonTeam: true`: the items of functions outside the chosen scenario become information findings (`fn-items-later`, no disposition needed). The scenario's own functions keep their gaps (FN-005, FN-011). The state minimums are 3 states and 4 transitions.<br>**The text shows the right rule per team size:** tool help, readiness detail (`state.ts:230`), audit message (`behavior.ts:689`), lab method and lab procedure. |
| N2 | **Closed** | **New gaps.** `fn-no-input` and `fn-no-output` are disposable (`behavior.ts:344, 528-529`). On the fixture team they fire on FN-005, FN-008, FN-009 and FN-011, and do not fire for a function that has neither (`fn-no-items` covers that case).<br>**AeroLink.** No function now lacks an input or an output, and the AeroLink findings contain no item gap.<br>**The new items are plausible against the Week 4 flow table** (`week04/aerolinkCase.ts:177-276`):<br>- INFO-012 Aircraft assignment: FN-002 "aircraft and time-slot assignment", consumed by FN-003, FN-009, FN-011 and FN-017.<br>- INFO-016 Aircraft availability: FN-009 → FN-002 "aircraft availability".<br>- INFO-015 Demand forecast: FN-013.<br>- INFO-013 Disruption notice: FN-015.<br>- INFO-014 Operator assignment: FN-017.<br>- "Heat and flame" (energy): FN-010's Week 4 input.<br>**No collisions.** INFO-011 to INFO-016 appear nowhere in Weeks 1–9; Weeks 4 and 5 stop at INFO-010. The Week 11 v0.4 file reuses them with the same names, which is the intended continuation. |
| m1 | Closed | `else returned;` (key `:34`); the checker PASSes. |
| m2 | Closed | Week 9's `stripGenerated` applied to AeroLink v0.3 keeps `metadata def <derivedFrom>` and all 44 dependencies (my probe). A negative test is at `behavior.test.ts:208-214`. |
| m3 | Closed | The v0.3 model carries "Week 10: these capability links are written in the Logical package as #derivedFrom dependencies…" right after the Week 9 sentence. |
| m4 | Closed | The lesson now reads "no valid continuation". |
| m5 | Closed | The card is retitled "Purpose of logical architecture (SEBoK)", and w10q-1 cites pp.587–592, naming both pages. |
| m6 | Closed | The Week 2 field now refuses a Week 1 file and a Week 3 file, naming the week ("This is a Week 1 file …"). |
| m7 | Closed | "Closed site at night: no function" is accepted; "It is closed now", "Fixed." and "Done" are refused. |
| m8 | Deferred (faculty item 7) | Unchanged: listing code is 6.1 px at 1440 px on the examples page, the same as Week 9. |
| m9 | Closed, now a faculty item | The exercise is 50 minutes and task 3 is trimmed to 3 states and 4 transitions. The key header and the rubric levels match. The 4-person total is **7.8 h**, recomputed. The exercise is done out of class, so the Session 2 plan (47 lecture + 22 lab = 69 min + 6 min buffer) is unaffected. No "40 min" remains in student text. |
| m10 | Closed | The R116 comment now reads "first line of p.177 (7.24 ends on p.176; R84's range … runs one page into 7.25)", which matches the cached text. |
| m11 | Closed | Labelled "course reasoning from p.146 and p.150" in the reveal, the predict file and w10q-12. |
| m12 | Closed | "therefore" is dropped from `weeks/week10.ts:46`; notes row F12 is reworded. |
| m13 | Closed | The 400 px test now fills the lab tool (a mapped scenario with a before-decision, and a filled states editor), with no sideways scroll. The two-views caption is corrected. |

## New notes (minor; neither blocks)

| ID | Severity | File:line | Evidence | Fix |
|---|---|---|---|---|
| C1 | Minor | `src/workbench/week10/behavior.ts:753` (and the trigger-missing key `:757`); the tool's findings list | During the new 400 px test, which fills the states editor, React logged **36** "Encountered two children with the same key, `defect:transition-state-missing--:STATES`". Two transition rows with blank from/to produce the same `findingKey`. React may then drop or duplicate one row in the findings list. The finding is a defect, so no disposition is lost. The spec does not assert on console errors in the axe test, which is why it still passes. | Add the row index to the code, for example `transition-state-missing-${i}-${from}-${to}`, or deduplicate the findings. Add `trackErrors` to the axe test. |
| C2 | Minor (authoring doc, not student-facing) | `docs/lectures/week10/WEEK10_LECTURE_OUTLINE.md:524-526, 551` | The outline still says 40 min, a 7.7 h total and an 8.6 h three-person total. | Mark it as superseded, or update it. |

**Also checked, with nothing new found**
- **Student text.** No internal codes: no register code, review ID or "probe" in the lesson paragraphs, the week pages, the lab, the tool, the assessment or the quiz, apart from the precedented register citations in quiz explanations.
- **Week numbers.** No stale week numbers in the student text.
- **The four intended FAILs.** Each still fails for its stated reason.

## Required for sign-off

Nothing. C1 should be fixed in the next touch of the tool, because the duplicate-key warning is reproducible. C2 is optional.
