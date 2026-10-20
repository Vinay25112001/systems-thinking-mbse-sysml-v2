# Week 1 package: sign-off review

**Reviewer role.** Sign-off reviewer: a senior systems-engineering professor and a web-learning QA lead.
**Date.** 2026-10-19.
**Scope.** HEAD `6245f67`. Read-only: no source was edited and nothing was committed.

**Standard.** The review applies:
- DECISION_LOG A19 and A20;
- `COURSE_SCHEDULE.md`;
- the definition of done in `COURSE_PRODUCTION_PLAN.md`, items A–I.

The test is a professor-led, lecture-first graduate week: teach first, explain in depth, demonstrate on engineering examples, then assign the lab and the assessment.

**How HEAD was isolated.**
- The working tree holds uncommitted work that is not part of Week 1: weeks 9, 11 and 12, and another session's new `docs/lectures/weekNN/` folders.
- So HEAD was exported with `git archive` into the reviewer's scratchpad, with its own copy of `node_modules`. Every gate, the deck build, the e2e runs and the walkthrough ran there.
- That gives no screenshot churn in the repository, so nothing needed `git checkout`.
- The repository gained only two things: `learning-studio/screenshots/week1-demo/` and this file.
- All dev servers were stopped afterwards; ports 5173, 5197 and 5198 are free.

## Verdict: NOT YET

The lecture material is now strong:
- both decks, the faculty notes, the lesson and the AeroLink case;
- the five major lecture findings are fixed in the decks and the case;
- every citation sampled checks out against the source text;
- the student build is clean of notes and exams.

**What blocks sign-off:**
1. **The item I gate is red.** The full end-to-end suite cannot run at HEAD: one spec fails to load, so zero tests run. Three further tests fail once it can load.
2. **The package does not agree with itself on four things the brief names explicitly:**
   - the need statement form and the six-check gate;
   - what the PRT ID means;
   - the problem, mission and goal trace that the lecture assigns but the lab tool cannot record;
   - the in-class lab timing.

The lecture fixes were applied to the decks and the case data, but not carried through to the lab, the tool, the quiz and the exemplar record.

**Counts:** blocker 1 · major 5 · moderate 5 · minor 6.

---

## 1. Test results (HEAD snapshot)

| Gate | Result |
|---|---|
| `npx tsc -b` | Clean (exit 0) |
| `npx oxlint src` | 0 errors, 22 warnings (react only-export-components and set-state-in-effect) |
| `npx vitest run` | **60 files, 1,056 tests, all passed.** `REVIEW_DISPOSITIONS.md` says 1,065. |
| `npm run build` | Passes (chunk-size warnings only) |
| `npm run build:student` | Passes. Leak check PASS: 0 of 13 exam markers and 0 of 538 faculty-notes markers in `dist-student`; all 13 and all 538 present in `dist` |
| `npm run lectures:pptx` | Session 1: 25 slides, 25 notes pages, 22 images. Session 2: 22 slides, 22 notes pages, 20 images. Notes documents and handout written |
| `npx playwright test` (main config, one dev server) | **0 tests executed, exit 1.** `lectures.spec.ts` fails to load, which aborts the run (B1) |
| Main config, the four loadable specs (app, week1-flow, workbench, zz-visual-loop) | **36 passed, 3 failed, 1 skipped.** 1 of the 3 is a cold-start flake: `app.spec.ts:21` passes alone in 4.6 s |
| `npx playwright test -c playwright.lectures.config.ts` | **"No tests found", exit 1** (same load error) |
| Diagnostic only: lectures config with the JSON import patched in the scratch copy | 8 passed, 1 failed (`lectures.spec.ts:140`) |

So the real e2e state is two parts:
- **Load:** the suite does not load.
- **Behaviour:** past the load error, 3 tests are genuinely red:
  - `week1-flow.spec.ts:71`;
  - `app.spec.ts:131`;
  - `lectures.spec.ts:140`.

## 2. Dispositions verified

### Lecture review F01–F33 against `docs/lectures/week01/REVIEW_DISPOSITIONS.md`

| Finding | Verified in | Result |
|---|---|---|
| F01 time budget (major) | Notes timing plan (69 min + 6 buffer in both sessions); `timing.test.ts` passes; S2 charter 8 min and pitch 10 min | **Lecture fixed; lab not.** The lab source still says 28 / 10 / 12 min (M4) |
| F02 conflict (major) | `aerolinkCase.ts:310` NEED-003 now bounds exposure: loudness and number of evening events. Slide S2-13 (rendered) shows the shared variable "take-offs and landings per pad in the evening and early-morning hours" | **Fixed** |
| F03 systems named after organizations (major) | EXT-001 "Controlled airspace (air traffic service)", EXT-002 "Electric grid", EXT-004 "Aircraft and spares supply", EXT-006 "Emergency response service", each with a separate `owner` | **Fixed in the case.** The pre-revision labels survive in the optional practice (Mo5) |
| F04 need form (major) | All 17 case needs read "… need the air-taxi service to …"; the worked example on S2-15 is correct | **Fixed in the case only.** The tool, mission 4, the quiz and the exemplar record still teach the outcome form (M1) |
| F05 sweep figure (major) | PowerPoint render of S1-19: a matrix of prompts and stages, the stage-of-main-involvement outline, Communities at Concept, insurers and advocates "found by role class" | **Fixed** |
| F07 exit ticket | Wording in `session1.ts` | Fixed |
| F08 "needs are qualitative" | S2 slide 9 notes (MITRE metrics; Week 2 as a sequencing convention) | Fixed |
| F09 set test | S2 slide 9 notes | Fixed |
| F10 class of stakeholders | STK-015 is in the register and the sweep; NEED-008 is attributed to it | Fixed |
| F11 compound needs | NEED-016 and NEED-017 exist | Fixed |
| F15 BMA output | Lecture slides and the case have MGO goal columns | **Only partly fixed.** The Team Record cannot hold a problem statement or a goal trace (M3) |
| F16 internal IDs | `grep` for FD-, "faculty-default decision", "old course" and "A correction to earlier" finds 0 hits in the handout and both notes files | Fixed |
| F18 license | Credits slide rendered (S1-25); text checked against the SEBoK PDF p.31 | Fixed. MITRE p.4 and DoD Distribution A also verified |
| F25 warm-up | S2 slides 1 and 2 are separate question and reveal slides | Fixed |
| F30 counts and labels | "Five outputs plus AI statement" is consistent | **PRT is defined, but two different ways** (M2) |
| F33 handout figures | 41 embedded images in `week01-lesson.md` | Fixed |

### Rebuild review F01–F17 against `WEEK1_LEARNING_DESIGN.md` §10

| Finding | Verified in | Result |
|---|---|---|
| F01 (major) | `needQuality.ts` hard gates and advisory warnings, with tests passing | Fixed as a checker. It still accepts and models the outcome form (M1) |
| F02 (major) | `recordState`. The walkthrough reached "ready" only with "approved" and a date. The e2e "submitted for approval" test passed | Fixed |
| F04 | Import validation code | Fixed |
| F05 | Abbreviation-aware splitter at `team.ts:151` | Fixed |
| F06 | Neutral prediction options | Fixed |
| F08 | RB-1.1 reads "a single product" | Fixed |
| F09 | `courseSource` on w1q-1 and w1q-5 | Fixed |
| F11 | `NeedRow` has priority and concerns; inside elements have PRT IDs | Fixed |
| F16 | "Color theme" and "Artifact" | Fixed |
| F17 | w1q-2 is now a transfer item | Fixed |
| F10 | §10 still reports 8.9 h with FD-29 not applied | **Superseded and stale** (Mo4) |

## 3. Definition of done, items A–I

**A. Decks: pass, subject to the consistency findings.**
- Both decks build: 25 and 22 slides.
- I rendered 12 slides through PowerPoint COM (S1 1, 3, 9, 15, 19, 25; S2 2, 10, 13, 15, 18, 22). The design is professional, figures span the width, the credits slide is legible and nothing overflows.
- The web viewer was stepped through all 47 slides by keyboard: counter correct, no overflow of the slide face, 0 console errors.
- But slide S2-18 and the S2-19 charter figure carry the PRT and goal content behind M2 and M3.

**B. Faculty notes: pass.**
- Every slide has teach, why, figure walk, examples, misconceptions, transition and timing.
- The timing plan includes the buffer.
- They are teachable by another instructor.

**C. Lesson: pass.**
- About 13,000 counted words, with inline citations in both sessions and 41 figures.
- It is generated from the same source as the slides.

**D. Case: pass.**
- 15 STK, 17 NEED, renamed external systems, a coherent noise-exposure conflict, and goal traces.

**E/F. Lab: NOT YET.**
- The Markdown and `#/week/1/lab` agree, since both come from one source.
- But both disagree with the lecture on timing (M4), PRT (M2), the goal trace (M3) and relationships (Mo1).

**G. Assessment: needs work (Mo2).**
- 10 items. Keys: a 3, b 2, c 3, d 2.
- The key is never the longest or shortest option. The key's length relative to the option mean is 0.97–1.13.
- But that rule leaves the key always ranked 2nd or 3rd by length. It is the **2nd-longest in 7 of 10 items**, so the cue "pick the second-longest" scores 70 %.
- The model answer of w1q-10 is not in the need form the lecture teaches (M1).

**H. References: pass.**
- 13 citations were sampled against `_source_cache/*.txt`. All verbatim on the cited page:
  - R94 p.540; R07 p.815; R11 p.553; R11 p.555 (form);
  - R99 p.51; R63 p.237; R39d p.1497; R97 p.995;
  - R01 p.51; R39f p.1550; R96 p.986; R96 p.989; R53 p.296; R39a p.1631.
- The SEBoK CC BY-NC-SA statement (PDF p.31), the MITRE case numbers (p.4) and DoD Distribution Statement A were also verified.

**I. Web module: NOT YET.**
- The e2e gate is red (B1, M5).
- The routes and the journey work.
- The axe and overflow tests in the loadable specs pass.

## 4. Findings

### Blocker

**B1. The full e2e suite cannot run.**
- *Where:* `e2e/lectures.spec.ts` → `session2.ts` → `content/lectures/references.ts` → `content/readings.ts:1`, which does `import data from './readings.generated.json'`.
- *Evidence:*
  - Under Node 24.18 and Playwright 1.64, loading fails with "needs an import attribute of type: json".
  - `npx playwright test` executes 0 tests (exit 1). The lectures config reports "No tests found".
  - It reproduces in the working tree too.
- *Fix:*
  - Use `import data from './readings.generated.json' with { type: 'json' }`; in the scratch copy this makes the spec load. Or keep the JSON out of the spec's import graph.
  - Then rerun both configs.

### Major

**M1. The need statement form and the six-check gate disagree between the lecture and everything students use to do the lab.**
- *What the lecture teaches (S2-09):* the form "The [stakeholders] need the [system] to …". Its course gate is "SEBoK need form; no design; attributed to a registered stakeholder; **traced to its concern**; a condition; a rationale".
- *What the tool uses:* `needQuality.ts:21–27` has the criteria not-requirement, solution-free, attributed ("<stakeholder> need(s) …"), **traced to a stakeholder**, condition, rationale. Mission 4 (`NeedsExercise.tsx:79`) asks for "<stakeholder> need(s) …".
- *The quiz:* the w1q-10 key is "Night-shift nurses need each patient's current medication record whenever preparing a dose".
- *The exemplar record:* all 8 needs of the Team Record fixture are in outcome form ("Families using partner pantries need fresh produce …"), and the record reaches "ready to submit".
- *The lab instructions* never state the form.
- *Fix:* choose one form and one six-check list and apply it to the tool's criteria and prompt, mission 4, the quiz, the fixture and the lab method step 7. Then add a test that compares the lecture gate with `SELF_CHECK`.

**M2. PRT means two different things.**
- *In the lecture,* PRT is "partner organizations in the enterprise": `session1.ts:768`, `:1340`; the `session2.ts:753` charter figure; and the S2-18 figure "at least 3 partner organizations" (rendered as "PRT ≥ 3").
- *In the lab, the tool and the model-inputs map,* PRT is "the elements inside the boundary of the system of interest", seeding `part` usages: `week01Lab.ts:58`, `TeamView.tsx:265`, `team.ts:31`.
- *Effect:* Part 2 gets contradictory instructions, and the Phase II seed changes meaning.
- *Fix:* adopt the lab and tool meaning, and correct the lecture text, the notes and both figures.

**M3. The problem, mission and goal trace is taught as required but cannot be recorded (F15 only partly fixed).**
- *What the lecture says:*
  - S2-18: "Part 2 states the **problem** and the **mission** in one sentence each" and "Needs … each traced to a goal".
  - The notes: "A complete Part 5 entry: … goal …".
  - The worked example records "ID, trace, goal, priority".
- *What the tool holds:* the `Proposal` type has only "Mission or purpose", and `NeedRow` has no goal field (`team.ts:39–42`).
- *Elsewhere:* lab Part 5 evidence omits the goal; the export carries none.
- *The dispositions* claim "Problem statement and mission in Team Record Part 2".
- *Fix:* add problem, mission and goals (for example `GOAL-nnn`) to Part 2, and a goal link to each need, in the tool, the lab, the export and the rubric note. Or remove the requirement from the lecture.

**M4. The in-class lab timing contradicts the lecture (F01 residual).**
- *The lab says:* `week01Lab.ts:31, 69, 70, 112` and `WEEK1_LAB_INSTRUCTIONS.md` give "Session 2, about 28 min: charter (10 min) and the enterprise pitch (12 min)". Step 1 also completes norms and prefixes in class.
- *The lecture says:* lab 22 min; charter 8 min covering roles, tie-break and lead candidate, with norms and ID owners "by end of day 1"; pitch 10 min for up to five teams, the rest on the LMS.
- *Fix:* derive the lab's in-class figures from the Session 2 slide minutes, as `week1Path.ts` already does. Then regenerate the Markdown.

**M5. Three e2e tests fail once the suite can load (gate I).**
- `week1-flow.spec.ts:71` (the end-to-end journey) and `app.spec.ts:131` expect a workload of 7.9 h; the page shows 8.0, which matches the dispositions.
- `lectures.spec.ts:140` throws "Cannot read properties of undefined (reading 'lecture')": the lesson has no `slide-ref` blocks any more.
- *Fix:*
  - Update the two workload assertions, or derive them from `WORKLOAD.total`.
  - Restore slide links in the lesson or update the reader test.
  - Then rerun.

### Moderate

**Mo1. Relationships.**
- S2-18 sets "REL ≥ 3, 1 conflict" as a minimum, and the charter gives REL to Architecture.
- The lab calls three relationships "proposed (RB-1.4, pending)".
- The tool has only one free-text `conflict` field: no REL rows and no REL IDs.
- *Fix:* align the three, and add REL rows if the minimum stands.

**Mo2. The quiz has a length cue and old Learn references.**
- The key is the 2nd-longest option in 7 of 10 items, and never 1st or 4th, so length alone narrows every item to two options.
- `courseSource` and the explanations cite the retired Learn sections "L1", "L2" and "L3" (`quizWeek1.ts`). The file header still says the items are answerable from the Learn text.
- *Fix:*
  - Let some keys be the longest or shortest option.
  - Re-point the sources to lecture slides and lesson sections.
  - Re-verify every item against the lecture.

**Mo3. The lab tool still carries the old self-study framing.**
- `#/week/1/lab/tool` shows "Mission 5 is your team's own Week 1 Team Record", "Workbench progress 1 of 6 missions complete", and a mission brief that lists the AeroLink missions and a "Quiz 0/2 steps" mission (screenshot 10).
- The assessment readiness line says "upload them as Check & submit describes", which is a retired stage.
- *Fix:* in the lab-tool context, show the Team Record parts only, and rename the stage references.

**Mo4. Workload statements disagree.**
- `WEEK1_LEARNING_DESIGN.md` §10 still gives 8.9 h, with FD-29 not applied and the definition-of-done workload check failing.
- The week page and the lab say 8.0 h.
- The S2-18 notes say "about 2.4 hours per student" for the record; the lab and the week page say 2.5 h.
- Three-person teams are stated at 3.2 h, which makes the week about 8.7 h.
- *Fix:* update §10, correct the 2.4 in the notes, and record the three-person case for faculty.

**Mo5. The optional practice still uses pre-revision AeroLink data.**
- This is the practice offered from the worked-examples page.
- `ContextRecorder.tsx:152` uses the placeholder "e.g. Air navigation service provider" as an external system name, against F03.
- `stakeholders.ts` uses fourteen candidates, against the case's 15-stakeholder register.
- `model/reference/week01.ts` ENT-001 is still the "service enterprise".
- The (unrouted) Learn L3 figure text still lists the old EXT names and puts passenger demand inside the SoI.
- *Fix:* point the practice at `aerolinkCase.ts`, or label it clearly as pre-revision.

### Minor

- **m1.** `app.spec.ts:21` fails on a cold start (dashboard heading not visible within 5 s) and passes alone. Raise the timeout or warm the server.
- **m2.** The dispositions report 1,065 vitest tests; HEAD runs 1,056.
- **m3.** At 400 px the slide viewer puts the slide at y ≈ 1,518 px, below a 25-item contents list. Collapse the list on narrow screens.
- **m4.** The week-page lecture card reads "69 min + 69 min". Say "69 min of content per 75-min session, lab included".
- **m5.** oxlint reports 22 warnings.
- **m6.** The S1 credits slide lists R53 p.297, while the S2 notes cite R53 pp.295–297. This is harmless, but listing one range in both decks would be cleaner.

## 5. Walkthrough and demo set

I ran the student journey with Playwright on one dev server on HEAD:

| Step | What happened |
|---|---|
| Dashboard → Week 1 | Correct H1; workload 8.0 h |
| Session 1 | All 25 slides stepped by keyboard |
| Session 2 | All 22 slides stepped |
| Lesson | No horizontal scroll |
| Worked examples | Rendered |
| Lab | Rendered; the page text contains "28 min", "10 min" and "12 min" |
| Lab tool | Imported the fixture: "Imported 8 stakeholders and 8 needs"; exported |
| Assessment | 10 quiz items; readiness "ready to submit: Riverside Food Bank Network" |
| 400 px pages | No horizontal scroll |

There were 0 console or page errors.

Screenshots are in `learning-studio/screenshots/week1-demo/`:

1. `01-dashboard-1440x900-light.png`
2. `02-week1-home-1440x900-light.png`
3. `03-session1-slide01-title-1440x900-light.png`
4. `04-session1-slide19-lifecycle-sweep-1440x900-light.png`
5. `05-session2-slide15-worked-example-1440x900-light.png`
6. `06-session2-slide18-lab-brief-1440x900-light.png`
7. `07-lesson-1440x900-light.png`
8. `08-worked-examples-1440x900-light.png`
9. `09-lab-instructions-1440x900-light.png`
10. `10-lab-tool-team-record-1440x900-light.png`
11. `11-assessment-quiz-1440x900-light.png`
12. `12-assessment-record-ready-1440x900-light.png`
13. `13-week1-home-400-light.png`
14. `14-session1-slide19-400-light.png`
15. `15-session2-slide13-conflict-1440x900-dark.png`
16. `16-lab-instructions-1440x900-dark.png`
17. `week1-journey.gif`: frames 01–12 at 960 px wide, made with ffmpeg.

## 6. What sign-off needs

1. Fix B1 and M5, then rerun both Playwright configs to green.
2. Make the need form, the six checks, PRT, the problem, mission and goal fields, the relationships and the in-class timing identical across:
   - the lecture;
   - the lab source and its Markdown;
   - the tool;
   - the fixture;
   - the quiz.

   Add one consistency test that compares the lecture's lab-brief minimums and gate with the tool's constants and `SELF_CHECK`.
3. Rebalance the quiz keys' lengths and re-point their sources to the lecture.
4. Update `WEEK1_LEARNING_DESIGN.md` §10 and the 2.4 h in the notes.
