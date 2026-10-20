# Week 1 package: sign-off confirmation pass

**Reviewer role.** Independent confirmation reviewer, systems-engineering professor and web-learning QA.
**Date.** 2026-10-19.
**Scope.** HEAD `bd39e01`, which addresses the findings in `week01_package_signoff.md`. Each finding was checked against the code and content, not against the disposition text. The pass also looked for regressions the fixes might have introduced.
**Read-only.** No source file was edited and nothing was committed.
- A throwaway probe test (`src/zz_probe_review.test.ts`) was copied in, run and deleted. It drove the need gate in both directions.
- Playwright ran on a `git archive` export of HEAD in the reviewer's scratchpad, with `node_modules` joined in by a junction, so no screenshots changed in the repository.
- The working tree is unchanged, apart from the other stream's partial files, which were ignored. No dev server is left running; ports 5173 and 5198 are free.

## Verdict: READY FOR FACULTY REVIEW

- **All 17 sign-off findings are closed:** B1, M1–M5, Mo1–Mo5 and m1–m6. Mo5 is closed with the residual it declares: the reference model and the SysML files keep the pre-revision names until Week 8. None of the student-path pages shows those names.
- **All gates are green,** including both Playwright configurations.
- **No new blocker or major finding.**
- **One new moderate finding:**
  - N1: the need gate rejects a correct need that names the system of interest by its proper name, and the rejection message misleads the student.
- **Nine new minor findings.** Most are stale text on non-student or archived surfaces, small wording mismatches, and one leaked internal ID on the student week page.

N1 should be fixed, or explicitly accepted by faculty, before students use the lab tool. It does not block faculty review of the package.

## 1. Gate results (HEAD `bd39e01`)

| Gate | Result |
|---|---|
| `npx tsc -b` | Clean (exit 0) |
| `npx oxlint src` | 0 errors, 15 warnings. All 15 are react only-export-components warnings in router, AppState, Workspace and ProvenanceOwnerFields. This matches the disposition. |
| `npx vitest run` | **61 files, 1,095 tests, all passed** (matches m2) |
| `npm run build` | Pass. Only chunk-size warnings. |
| `npm run build:student` | **PASS.**<ul><li>`dist-student` has 0 of 13 exam markers and 0 of 535 faculty-notes markers.</li><li>The student `.pptx` notes are empty.</li><li>The instructor build has 13 of 13 exam markers and 535 of 535 notes markers.</li></ul> |
| `npx playwright test -c playwright.lectures.config.ts` (HEAD export) | **9 passed** (3.0 min). The first run gave 2 failures, both caused by Vite answering 403. Vite's `fs.allow` blocked the junctioned `node_modules` in the scratch copy. Allowing that path **in the scratch copy only** gave 9 of 9. This is an artifact of the reviewer's environment, not a product defect. |
| `npx playwright test` (main config, HEAD export) | **48 passed, 1 skipped** (the parked `zz-visual-loop`), 3.3 min |

## 2. Per-finding confirmation

| ID | Status | Evidence (file:line) |
|---|---|---|
| **B1** e2e cannot load | **CLOSED** | `src/content/readings.ts:1` and `src/content/rubrics.ts:1` now import the JSON `with { type: 'json' }`. No other JSON import in `src` lacks the attribute. Both Playwright configs load and pass (above). |
| **M1** need form and six-check gate | **CLOSED** | <ul><li>`labBrief.ts:8,12-19`: `NEED_FORM` and `NEED_GATE` are in the lecture's order.</li><li>`needQuality.ts:30-37`: `SELF_CHECK` takes its ids and labels from `NEED_GATE`, and "traced to its concern" is now check 4.</li><li>`needQuality.ts:183-187`: the structure gate requires "need(s) the/our/its [system] to [what]". My probe confirms that the outcome form, "need to …", "need X" without "to", an empty "what" and "require" are all rejected, and that good taught-form statements pass.</li><li>The form is applied in the fixture (`teamFixture.ts:79-86`, all 8 needs), in w1q-10 (`quizWeek1.ts:166`), in mission 4 (`NeedsExercise.tsx:80`) and in lab method step 7 (`week01Lab.ts:65`).</li><li>`labBrief.test.ts:24-37` ties the lecture S2-09, the lesson, `SELF_CHECK` and the lab Markdown together.</li><li>Regression: see N1.</li></ul> |
| **M2** PRT meaning | **CLOSED** | <ul><li>One definition: `labBrief.ts:26-27`.</li><li>The lecture uses it at `session1.ts:768` and `:1340`, `session2.ts:726,734,754,765`, and in the figures `LectureWeek1S2.tsx:1056` ("SoI, PRT ≥ 3 (its parts)") and `:1117` ("PRT part inside the SoI boundary").</li><li>The lab and tool use it at `week01Lab.ts:59-60` and `TeamView.tsx:294`; the model-inputs map at `learn/week01.ts:782` (part usage).</li><li>A grep for "partner organization(s)" finds only the S1 enterprise figure and narrative (`session1.ts:344`, `LectureWeek1S1.tsx:186`), which is the enterprise concept, not the ID, plus the explicit "not a partner organization" in the S2-18 notes.</li></ul> |
| **M3** problem, mission and goal trace | **CLOSED** | <ul><li>`team.ts:60`: `Proposal` has `problem` and `goals`, with `purpose` holding the mission MGO-001.</li><li>`team.ts:283-290`: one-sentence problem and mission; goal IDs MGO-002 and up, unique, at least 4 words.</li><li>`team.ts:435-438`: every need must trace to MGO-001 or a recorded goal.</li><li>The export has the new Part 2 lines and a Goal column (`team.ts:528-530`, `:556`); the JSON is version 3 (`team.ts:582-594`); versions 1–3 import (`team.ts:623`).</li><li>The fixture has a problem, MGO-002..005 and a goal on every need.</li></ul> |
| **M4** lab timing | **CLOSED** | <ul><li>`labBrief.test.ts:85-101` asserts `S2_LAB` = {22, 2, 8, 10, 2, 5 teams}, equal to the sum of the `s2-lab-*` slide minutes.</li><li>The lab text is generated from it (`week01Lab.ts:33`, `:71-72`).</li><li>`labMarkdown()` contains no "28 min", "(10 min)" or "(12 min)".</li><li>`week1.test.tsx:117-118` proves `WEEK1_LAB_INSTRUCTIONS.md` equals `labMarkdown()`.</li></ul> |
| **M5** three red e2e tests | **CLOSED** | The main config passes 48 tests and the lectures config 9 on the HEAD export. The workload assertion derives from `workloadTotal`. |
| **Mo1** relationships | **CLOSED** | <ul><li>`team.ts:375-403`: REL rows need registered, distinct ends, a type from `REL_TYPES` and a note of at least 3 words. At least 3 complete rows and at least 1 "conflicts-with" are required; duplicate IDs and pairs are refused.</li><li>`REL_TYPES` equals the case's `RELATIONSHIP_VERB` (`labBrief.test.ts:66-69`).</li><li>The lab says "Required, as the lecture sets it" (`week01Lab.ts:64`).</li><li>REL and PRT are in `WEEK1_PREFIXES` (`labBrief.ts:45`).</li></ul> |
| **Mo2** quiz length cue and sources | **CLOSED** | <ul><li>Recomputed independently: the key's length ranks are 2,4,1,3,1,4,2,3,1,2. Each rank occurs 2–3 times, so "pick rank k" scores at most 30 %.</li><li>The key-to-mean length ratio is 0.87–1.17.</li><li>The key letters are a3 b2 c3 d2, in the order a,b,c,d,c,a,d,b,a,c, with no run.</li><li>Every item has `lecture: {session, slide, section}`. I checked by hand that all ten quoted "Session N, slide M" numbers match the slide order (S1: 16, 8, 6, 9, 3, 21, 19, 20; S2: 12, 9).</li><li>No L1–L3 references remain.</li><li>The cited passages were spot-checked against `_source_cache`:<ul><li>R11 p.553: the "approving authorities both within and external" passage (w1q-6).</li><li>R11 p.552: Table 1, disposal stage (w1q-7).</li><li>R11 p.554: "rationale often reveals the real need … as an implementation" (w1q-9).</li><li>R11 p.555: "The stakeholders need the system to" (w1q-10).</li><li>R02 p.264: boundaries (w1q-2, w1q-4).</li></ul></li></ul> |
| **Mo3** lab tool framing | **CLOSED** | <ul><li>`week1/Workbench.tsx:15-37`: the lab shows only `w1-m5-team`; the practice shows missions 1–4.</li><li>The progress reads "N of M Team Record parts complete" (`PracticeBar.tsx:12-16`, `StatusBar.tsx:53`).</li><li>"as Check & submit describes" is gone from all routed pages. The only "Check & submit" text left is in the unrouted `flow/CheckSubmit.tsx`; `/week/1/check` redirects to the assessment (`week1/route.ts:42`).</li></ul> |
| **Mo4** workload | **CLOSED** | <ul><li>The rows in `weeks/week01.ts:397-404` sum to 2.5+1.4+0.6+0.3+2.5+0.2+0.4+0.1 = **8.0 h**.</li><li>`TEAM_RECORD_PERSON_HOURS` (`week1Path.ts:148-156`) sums to 10.0 person-hours, which is 2.5 h each.</li><li>Three-person teams: 10 − 2.5×0.25 = 9.375, rounded to 9.4 person-hours, so 3.1 h each and an 8.6 h week. That is 0.6 h over budget, and it is flagged.</li><li>The S2-18 notes say 2.5 h and 3.1 h (`session2.ts:734`).</li><li>§10 of `WEEK1_LEARNING_DESIGN.md:457-487` is rewritten for 8.0 h. Two stale rows remain lower in that file (N8).</li></ul> |
| **Mo5** practice data | **CLOSED (declared residual)** | <ul><li>Placeholder at `ContextRecorder.tsx:152`: "e.g. Controlled airspace (air traffic service)".</li><li>`model/reference/week01.ts:1-7` is labelled pre-revision in a code comment.</li><li>Its only figure consumer, `OpenSystemFigure`, is used by the unrouted Learn L3 and the lecture fixture demo, not by the student path.</li></ul> |
| **m1** cold-start flake | **CLOSED** | `vite.config.ts:14` has `server.warmup`. The main suite passed on a cold server. |
| **m2** test count | **CLOSED** | 61 files and 1,095 tests, as recorded. |
| **m3** 400 px viewer | **CLOSED** | The lectures e2e test "400 px: the viewer falls back to a stacked slide + text" passes. |
| **m4** "69 min + 69 min" | **CLOSED** | `week1/Home.tsx:60`: "… min of content per 75-min session, lab included". |
| **m5** oxlint warnings | **CLOSED** (reduced to 15; the remainder is justified) | See the gates table. |
| **m6** R53 range | **CLOSED** | `labBrief.test.ts:118-132`: one range per reading across both decks. R53 reads pp.295–297 in both. |

## 3. New findings

### Moderate

**N1. The need gate rejects a correct need that names the system of interest by its proper name or with "a", and the message misleads the student.**
- *Where:* `src/workbench/week1/needQuality.ts:146-149` (`splitTaught`). The regex is `^(?:the|our|its)\s+…\s+to\s+…`.
- *Failure scenario:* a team names its enterprise "MedFly" and writes "Hospitals need MedFly to deliver blood units within 30 minutes of a request, at any hour." The probe also rejected "Families … need Riverside to keep fresh produce on shelves until closing time" and "… need a delivery service to …".
  - The structure gate fails, so the need cannot count.
  - The message tells the student to "name your system of interest and say what it must do for them". The student did name it, so the message points at the wrong fault.
  - SEBoK gives "The stakeholders need the system to" as a recommended format ("such as", R11 p.555). A proper-noun system is a natural instance of that form.
  - Teams that name their enterprise will hit this often.
- *Opposite direction (works as intended):*
  - "need the ability to …" and "need the refrigerated trucks to …" pass the structure gate but raise the advisory `system` warning, which needs a justification.
  - "need the network from the warehouse to the pantries to …" passes, with a nonsensical [system] of "network from the warehouse".
  - These are acceptable, since warnings stop a need counting until it is justified.
- *Fix:* do one of the following.
  - Accept a capitalised proper name, or any phrase that `namesSystem` matches, after "need(s)".
  - Or keep the rejection and make the message say so directly: "write 'the [system]' before your system's name, e.g. 'need the MedFly service to …'".
  - Add both cases to `needQuality.test.ts`.

### Minor

- **N2. An internal decision ID shows on the student week page.**
  - Where: `weeks/week01.ts:404` ("Time log (FD-22), per student") and `week1Path.ts:182` ("Log your actual hours (FD-22) …").
  - Both are rendered on `#/week/1` (`Home.tsx:42`, `:235`), and both are present in `dist-student/assets/week01-*.js`.
  - Fix: drop "(FD-22)".
- **N3. The archived Week 1 page and its instructor notes contradict the fixes.** The page is at `/archive/week/1`, which renders `WeekPage n={1}` with its instructor panel.
  - `weeks/week01.ts:373` (facilitation) still says the tool gates "the '<stakeholder> need(s) <what>' form". That is the opposite of the M1 decision.
  - The assignment template (`:324`) still says "mission or purpose", with no problem or goals, and "at least one recorded conflict", with no REL rows. The artefact minimums (`:300`, `:302`) say the same.
  - The lab steps carry "FD-24" (`:292`).
  - The instructor session plan (`:344` onwards, "Session 1 — concept studio") predates the lecture decks.
  - None of this is on the student path. A faculty reviewer who opens the archive or the curriculum export (`export/curriculum.ts`) will see contradictory guidance.
  - Fix: refresh those fields from `labBrief.ts`, or banner them as superseded.
- **N4. The parts count differs between the lab and the tool.**
  - The lab and the lecture say "The record has six parts" (`week01Lab.ts:149`; S2-18).
  - The lab tool's bar reads "N of **7** Team Record parts complete", because the export step counts as a part (`missions/week01.ts:276-282`).
  - Fix: label the 7th item "export", not a part, or say "6 parts and the export".
- **N5. The goal trace is worded two ways in the lecture.**
  - The S2-18 slide body and figure alt say "each traced to a goal" (`session2.ts:726`, `:729`).
  - The S2-18 notes, the S1 notes (`session1.ts:608`), the lab and the tool accept "the mission or a goal" (MGO-001 allowed).
  - Students see the slide.
  - Fix: say "traced to the mission or a goal" on the slide.
- **N6. Small quiz cues and one inaccurate explanation.**
  - w1q-2: the key repeats the stem's "emergency department" and "night". This is a stem-echo cue, though the content arguably requires it.
  - w1q-9: only the key repeats the stem's "often".
  - w1q-10, option a: the explanation says "there is still no condition", but "at each bedside" is a *where* condition by the course's own definition (`needQuality.ts:35`: "when, where or under what operating conditions"). Option a stays wrong because it names a solution.
  - Fix: reword the w1q-10 explanation to "the solution (tablet app) is the flaw; 'at each bedside' locates the app, not the need". Optionally paraphrase the w1q-9 key.
- **N7. Mission 4's diagnosis key carries Week 3 wording.**
  - `stakeholders.ts:245-253` swaps the Week 1 case needs into "after", but the shown `note` still comes from the Week 3 items (`activities/week03/needs.ts:186`, `:200`). The c4 and c6 notes say "the reference NEED-00x leaves its condition implicit" and "the rewrite adds safe access", which describe the Week 3 rewrite, not the case need now displayed with its own condition.
  - The c2 key marks "Communities need sound barriers around each vertiport" as "No condition", though "around each vertiport" is a *where*.
  - There is no checkbox for "not in the need form", although the intro says such drafts fail that check.
  - These are optional practice items.
  - Fix: author Week 1 notes in `W1_CRITIQUE`.
- **N8. Two disposition rows in the design doc are stale.**
  - `WEEK1_LEARNING_DESIGN.md:524` (F10) still reads "Workload table above: … honest total 8.9 h … not applied". The table above now says 8.0 h.
  - `:516` (F01) describes the retired "<subject> need(s) <object>" gate.
  - Fix: mark both superseded by the sign-off revision.
- **N9. The graduate review names the checks differently.**
  - `GRAD_REVIEW.what` (`learn/week01.ts:689`) is shown on the assessment page and says "test the six criteria".
  - The lecture and the tool say "the six minimum checks" of the course gate.
  - Fix: align the term.
- **N10. Dead Learn content keeps the old forms.**
  - The unrouted L6 worked example (`learn/week01.ts:375`) gives NEED-003 in outcome form, which differs from the case statement.
  - "w1-m6-recall" still says "The same quiz as Check & submit" (`learn/week01.ts:606`).
  - Students cannot reach either today: `/week/1/learn/*` redirects to the lesson.
  - It is a trap if the content is ever re-routed.

### Consistency sweeps with no defect

- **Need form:** all 17 AeroLink case needs, all 8 fixture needs, the w1q-10 key, the mission 4 c6 draft, the tool prompt, the lab and TEAM_RECORD use "The [stakeholders] need the [system] to …". No outcome-form need appears on a routed student page.
- **PRT** means a part inside the SoI boundary in the lecture, lesson, figures, lab, tool, fixture and model map.
- **Citations:** every Week 1 student-path citation is in `readings.generated.json`: R02, R07, R10 (marked further reading), R11, R39b, R53, R63, R96 and others.
- **Timing:** `timing.test.ts` passes, with 68–70 min of content plus a 5–7 min buffer = 75, and notes at or below 130 wpm per slide. The S2 lab slides sum to 22 min.
- **Workload** is 8.0 h everywhere it is stated.
- **Student build:** no notes or exam leak.

## 4. Recommendation

Release the package to faculty review now. Before students use the lab tool:
1. Fix or explicitly accept N1.
2. Make the one-line fixes for N2 and N5.

The rest (N3, N4, N6–N10) can be batched into the next maintenance pass. The faculty decisions 4–7 in `REVIEW_DISPOSITIONS.md` are still open:
- relationships required;
- the three-person team at 8.6 h;
- goals optional;
- the out-of-scope residuals.
