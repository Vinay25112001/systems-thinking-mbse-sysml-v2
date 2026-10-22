# Week 6 independent review: Evolution Roadmap (Phase I teaching package)

Reviewer: independent adversarial review (senior SE professor, instructional designer and QA). Not the author.
Date: 2026-10-21. Read-only: this file is the only file written. No git operations, generators or installs.

> This file replaces the 2026-10-11 review of the earlier Week 6 page (Technology readiness, uncertainty, risk and AROU),
> which is now archived at `#/archive/week/6`. That review is still in git history at commit `85da1bb`.

Scope: everything in `git status` for Week 6 (uncommitted).
- `src/week6/*`, `src/content/lectures/week06/*`, `src/components/figures/LectureWeek6*.tsx`, `lectureWeek6Figures.ts`,
  `week6FigureKit*.ts`
- `src/content/lab/week06Lab*.ts`, `src/content/quizWeek6*.ts`, `src/content/week6Path.ts`, `src/workbench/week6/*`
- `docs/lectures/week06/*` and the two e2e specs
- the `week06` blocks in `App.tsx`, `lectures/route.ts`, `lectures/index.ts`, `figures/registry.ts`, `Dashboard.tsx`,
  `course.ts`
- register entries R105–R109

Paths are relative to `learning-studio/` unless they start with `_source_cache/`.

## Verdict: **REVISE**

The package is large, well built and mostly correct. Source fidelity is high: 15 of 18 claims checked against the page
text match exactly. It follows the A21 template, and its tests are green. It cannot be signed off for two reasons:

1. **The central worked example contradicts its own definition of the baseline (M1).** Session 1 teaches that the baseline
   trajectory already includes the Week 3 Year-2 decision. The gap table, Increment 1 and the answer to the driving
   question ("after the Year-2 decision, what comes next?" → "capacity first") all measure from the pre-decision
   configuration. On the course's own SEBoK framing, the "next step after the Year-2 decision" is the Year-2 decision
   itself.
2. **Several moderate defects from known recurring classes:**
   - "excess" is applied against the binding limit, not the desired level;
   - the dependency gate accepts cycles and exports contradictory `precedes` relations;
   - the applied exercise does not assess one proposed objective, and leaves no time to read the brief;
   - quiz cues: an item answerable from its stem, and absolutes that appear only in distractors;
   - one SEBoK claim is cited to the wrong page.

## Findings

| ID | Sev | File:line | Evidence | Required fix |
|---|---|---|---|---|
| **M1** | **Major** | `content/lectures/week06/session1.ts:197`, `:202`, `:768`; `:227`; `aerolinkCase.ts:85–90` (GAP-001), `:484–497` (DRIVING_QUESTION); `session1.ts:93–104`; `session2.ts:373` | **Baseline definition:** the notes (s1:197) say "the baseline trajectory … already includes the Week 3 decision. Without any further change the network reaches ${INC1.capacity} [320] trips a day by month 24". The misconception card (s1:202) and the lesson (s1:768) say the same: "The baseline includes changes already decided: for AeroLink, the Week 3 decision is part of it."<br>**Gap table:** GAP-001 measures the near-term gap against `BASELINE.capacity` = ALT-001 (240), giving a gap of 60 (s1:227). Against the trajectory just taught (320 ≥ 300), the near-term capacity gap is zero.<br>**Increment 1 and the driving question:** Increment 1 *is* DEC-001. The scenario is "Week 3 decided … four more aircraft and a fourth hub. The board asks what comes next". The evidence answer is "Capacity comes first" (`aerolinkCase.ts:494`), but capacity is what was already decided. The as-is snapshot (Increment 0, MITRE) and SEBoK's "current and planned" baseline are conflated. This is the data-vs-decision class (W4 M1) at the core of the week. | Pick one model and carry it through the case, the slides, the notes, the lesson, the figures and the quiz:<br>(a) Increment 0 is the as-is at entry into service, and Increment 1 re-plans the decided Year-2 step. Then reword s1:197/202/768: planned changes appear on the roadmap as committed increments, not inside Increment 0. Reframe the driving question as "in what order", with Increment 1 committed, and make the evidence answer "after the committed capacity step, resilience preparation, then …".<br>(b) Keep the SEBoK trajectory. Then measure GAP-001 against 320 (no near-term capacity gap, or a different near-term gap), and re-derive the answer to the driving question.<br>Under either model, revisit the D/B key (faculty item F3). Add a test that pins the chosen model, for example that GAP-001's baseline value equals the trajectory the notes state. |
| Mo1 | Moderate | `aerolinkCase.ts:91–96` (GAP-002); `session1.ts:228`, `:779`; `docs/lectures/week06/WEEK6_APPLIED_EXERCISE_BRIEF.md:71–72`; vs `session1.ts:771` and quiz `w6q-1` key | **"Excess" is used against the wrong reference.** The lesson defines it from SEBoK p.862 as baseline above the *desired* level, and quiz w6q-1's key is "more than the desired level, a candidate for divestment". AeroLink's GAP-002 instead compares the charger limit (288) with *current trips* (240). 288 is below the desired 300, and Increment 1 *adds* chargers, so the "excess" is slack on a non-binding constraint, not capacity to eliminate. The exercise notes repeat this: 3,000 docks against 2,400 trips is called excess. Against the desired 2,800 it is 200, and by year 4 (3,600) the docks become a gap. The overnight idle hours are a defensible excess (desired: use or earn); the "slots a day" part is not. | GAP-002: keep only the overnight-idle excess, or state it against a desired level. Teach the difference between slack on a non-binding limit and an excess. Fix the exercise marking notes to accept only an excess measured against the desired level (200 in the near term; none by year 4). |
| Mo2 | Moderate | `workbench/week6/record.ts:476–478`, `:805–808` | The dependency gate checks only that each named increment exists and is not itself. INC-001 → INC-002 → INC-001 passes. So does a near-term increment that depends on a far-term one, or an increment that depends on the baseline being changed. `relationships()` then exports `precedes` both ways into `week6-model-inputs` for Week 7 and My Project. The order of change is the core of a roadmap, and the gate text "dependencies resolve" implies a valid order. | Reject cycles (DFS over `dependencies`) with a student-visible basis sentence: "a roadmap is an order; a cycle has no first step". Make horizon inversion (a dependency in a later horizon) at least an advisory. Add tests in both directions, and an entry in the gate table. |
| Mo3 | Moderate | `week6/assessmentParts.ts:5–10`, `:15–18`; `content/week6Path.ts:39–41` | Proposed objective W6.4 ("justify the development approach chosen for each increment") is assessed nowhere with a justification. Task 2 omits the approach. The lab gate `approach` (record.ts:471) is a pick-list with no reason. Only two formative quiz items cover it. W6.6's "risks that exist only during its transition" is also absent from the exercise and its descriptor. | Add "its development approach, with a reason" and "one transition-only risk" to Task 2, the Increments descriptor and the marking notes. Alternatively, make the lab ask for a reason for the approach, so W6.4 is assessed in the team record. |
| Mo4 | Moderate | `week6/assessmentParts.ts:6–9`; brief :1–60 | Task minutes 8 + 12 + 7 + 8 = 35 sum correctly, but there is no time to read an unseen brief of about 50 lines with five tables. Task 2 asks for 2 increments × 7 elements in 12 minutes, under a minute per element. This is the Week 4 Mo5 / Week 5 Mo3 overfull class again. | Add 5 minutes of reading and restate the time as 40 minutes (the workload row moves 0.6 → 0.7 h; see F1), or cut Task 2 to one full increment and a second with only its trigger and off-ramp. |
| Mo5 | Moderate | `content/quizWeek6.ts:141–145` (w6q-11); `:22`, `:60`, `:82`, `:108`, `:131` vs `:34`, `:94`, `:133`; `:69–72` (w6q-5); `:45–48` (w6q-3); `:57–60` (w6q-4); test `quizWeek6.test.ts:79` | **Quiz cues the cue tests miss.**<br>- **w6q-11 is answerable from the stem.** Every distractor announces it falls outside the change ("year two", "once the move is over", "next year"). Only the key says "during the move", and the item is tagged Analyse.<br>- **Absolutes appear only in distractors, hedges only in keys.** Distractors: "any difference", "whatever the crane technology allows", "without delay", "any plan", "every station", "every interface". Keys: "such as", "in case", "seldom". The test regex checks only always/never/only/none/cannot.<br>- **w6q-5:** the three distractors share a "Whether …" form; the key alone is "How well …".<br>- **w6q-3:** the key is the longest option (ratio 1.34) and the only meta-statement.<br>- **w6q-4:** three distractors contradict the stem, so the item tests recognition, not analysis. | Rewrite w6q-11 so that at least two distractors fall inside the weekend but are not transition risks. Balance absolutes and hedges across keys and distractors, and extend the test regex (any, every, all, whole, whatever, at once, without delay). Give w6q-5 a distractor in the key's form. Shorten w6q-3d and strengthen 3b. Make the w6q-4 distractors consistent with the stem. |
| Mo6 | Moderate | `content/lectures/week06/session1.ts:350`, `:799` | "SEBoK groups development approaches into sequential, incremental and evolutionary, with agile as another type or a subset … the classification rests on how well the requirements are known …" is cited to R108 p.391. That text is on PDF **p.390** ("roughly divided into sequential, incremental and evolutionary approaches. The agile development approach can be seen as another type or a subset … mainly based on the criteria of the extent to which the requirements … are known"), which is outside R108's registered range (391–393). I verified this in `Guide_to_the_Systems_Engineering_Body_of_Knowledge_v2_14.txt`. | Extend R108 to start at p.390 through the register pipeline (`readings.py` → `verify_readings.py` → `content:readings`), and cite p.390. Alternatively, cite only what p.391 supports. |
| n1 | Minor | `workbench/week6/record.ts:399`, `:438`, `:465` | Technology and increment names use `filled` (word count only), so "?", "n/a" and "-" are accepted as names and count toward the minimums. Known-unknown names use `said`, so the rule is inconsistent. | Use `said` for the technology and increment names. A one-word real name still passes. |
| n2 | Minor | `workbench/week6/record.ts:404–406`, `:427` | A gap with desired "TBD" and baseline "none" passes the `levels` gate, so neither level is stated. | Require at least one of the two levels to be a substantive answer, or add an advisory. |
| n3 | Minor | `workbench/week6/record.ts:493`, `:501` | A known unknown or an AROU item may gate or belong to the baseline INC-000, which is already in service. | Restrict `gates` to later increments, or make it an advisory. |
| n4 | Minor | `aerolinkCase.ts:50–51` | Horizons "years 3 to 5" and "years 5 to 10" share year 5. | Use "years 3–5" and "years 6–10", or say which bucket year 5 belongs to. |
| n5 | Minor | `content/week6Path.ts:70–71`; `content/lab/week06Lab.ts:61–62` | The required reading R107 pp.448–449 omits p.447 (the transition definition and the cutover/retirement strategies, s2:574). R106 pp.582–584 omits p.585 (parallel developments, s1:415). Students cannot find these claims in their assigned pages. | Assign R107 pp.447–449 and R106 pp.582–585. The workload recomputes: +2 pages = +0.1 h, which breaches 8.0 unless offset (see F1). |
| n6 | Minor | `session1.ts:806` (lesson para on off-ramps); `labBrief.ts:169` | "An increment that inserts an immature technology needs an off-ramp" is a course rule. R46 p.126 lists off-ramps among example mitigations "for selected technologies". Elsewhere Week 6 labels its conventions ("a course convention"); this one is not labelled. | Label the rule as a course convention in the lesson and the gate basis. |
| n7 | Minor | `content/lectures/week06/session2.ts:427`, `:649` | "(R105 pp.529, 531)" joins two separate sentences (the living document on p.529; the annual review on p.531) into one claim. Each fact is correct. | Cite each fact on its own page. |
| n8 | Minor | `content/quizWeek6.ts` explanations (51 occurrences) | Student-visible explanations name slides by raw id ("Session 2, slide w6s2-security-resilience") rather than number and title. Inherited from Week 5 (54 occurrences), so this is a cross-week fix. | Render the slide's number and title (the existing `taughtIn` helper does this). |
| n9 | Minor | `content/quizWeek6.ts` objective tags | W6.3 has one item and W6.1 has four. Items w6q-1 and w6q-2 (gaps, horizons) are tagged W6.1 ("plan increments"), which they do not test. | Retag them, or add a W6.3 item. |
| n10 | Minor | `week6/assessmentParts.ts:18` vs brief marking notes | The level-4 "Insertion" descriptor says the TRL does not rate fit "with the docks and the grid connection". The case and the notes put swap-pack fit in the depot, the vans and winter. LC-N2 is "trip rate per station" (brief :35), but the notes compute per bike. The level-2 Known-unknowns descriptor omits the notes' rule "tariff gated to the wrong increment scores 2". | Align the descriptor, the brief and the notes, and use one unit. |
| n11 | Minor | Lesson depth | There is one formal definition block (Technology planning, verbatim, R105 p.528). The capability-roadmap vs technology-roadmap distinction common in the literature is not drawn, and "enterprise evolution roadmap" is a labelled course convention with no sourced definition. Depth is otherwise comparable to Weeks 4–5: session files of 13.3k and 10.3k words against Week 5's 14.2k and 10.7k; the lesson is 6,593 words. | Optional: add a short sourced definition of a roadmap. MITRE p.529 ("the plan serves as the roadmap for satisfying the gaps over time") already gives one. |

## What was verified, and how

- **Tests.** `npx vitest run` on `src/week6`, `src/workbench/week6`, `shortAnswers.test.ts`, `content.test.ts`,
  `src/content/lectures/week06`, `week6FigureKit.test.ts`, `week06Lab.test.ts`, `quizWeek6.test.ts` and `src/lectures`
  (12 files) gave **740 / 740 pass**.
- **Type check.** `npx tsc -b` errors appear only in `src/App.tsx:390–391` (the Week 1 `lab-tool` line), in
  `src/week1/week1.test.tsx` and in `src/week1/Week1App.tsx`. All belong to the concurrent Week 1 rework; there are no
  Week 6 errors.
- **Student build.** My `npm run build:student` stopped at its `tsc -b` step because of the same Week 1 errors. I then
  ran `scripts/check-student-build.mjs` on the existing `dist-student/` (built 2026-10-21 14:17, newer than every Week 6
  source file, which I checked with `find -newer`). Result: **PASS**. The Week 6 student decks have 23 and 19 notes
  slides, all empty, and the instructor decks have 50,142 and 40,005 characters of notes. Slide `purpose` strings that
  mention "A21 item 6" render only in `NotesPanel` (faculty-only, `lectures/Chrome.tsx:88`). Re-run the student build
  once the Week 1 work compiles.
- **Workload arithmetic** (`week6Path.ts:142–155`): 2.5 class + 1.1 readings + 0.7 lesson + 0.3 pre-work + 2.4 lab +
  0.3 quiz + 0.6 exercise + 0.1 log = **8.0 h**.
  - The readings are 16 pages: R12 860–863 (4), R105 528–531 (4), R106 582–584 (3), R107 448–449 (2) and R26 682–684 (3).
    At 15 pages an hour that is 1.07 h.
  - The lesson is 6,593 words at 150 words a minute: 0.73 h.
  - The lab is 1.2 + 1.4 + 3.0 + 1.4 + 0.9 + 0.9 + 0.8 = 9.6 person-hours, so 2.4 h each in a team of four.
  - The unrounded total is 7.9996 h.
  - A team of three: ratios 3/4, 2/3, 2/3 and 3/4 give 7.48 → 7.5 person-hours, 2.5 h each, so **8.1 h**. Graduate
    students: **8.1 h**. Both are above the 8.0 cap (see F1).
  - The "worked examples" in the lesson row are not counted: the Examples page is not in `lessonWords()`.
- **Sources.** All five register entries R105–R109 exist (`readings.py:216–220`, marked pending faculty confirmation), and
  `readings_verified.txt` lists them as verified. I checked 18 claims against the extracted page text (PDF page numbers,
  the same convention as the register and Week 5):
  - R105 pp.528, 529, 530, 531: the definition is verbatim; available now / in development / do not yet exist; insertion
    points; horizon 5–10 years; living document;
  - R106 pp.582–584: two approaches; "No technology before its time";
  - R107 pp.447–449: simultaneous operation, cutover, retirement; transition as a process; when, how and why to insert;
  - R109 pp.131–132: as is → to be;
  - R12 p.862; R13 p.565; R25 p.1231; R26 pp.682–684; R46 p.126;
  - R60 pp.525–526: I confirmed "TRL of less than six … will not be considered further as 'threshold'" myself.

  15 claims MATCH, 2 are PARTIAL (n6, n7) and 1 is PAGE-OFF (Mo6). No quoted fragment is missing from its page. Inline
  "(Rnn p.N)" citations in lesson prose are the course convention (Week 3: 172, Week 4: 160, Week 5: 130, Week 6: 145
  occurrences), and no "S12 p.144"-style source codes appear in student text.
- **Lab gates** (`record.ts:399–560`). I traced each gate against concrete strings:
  - "n/a", "?", "-", "later" and "TBD" are rejected for trigger, transition, owner, mitigation, TRL basis and off-ramp;
  - "Cutover", "A-003", "TL", "None" (security only) and "TBD" (levels only) are accepted;
  - the exceptions n1–n3 and the missing cycle check (Mo2) are listed above.

  Every hard gate has a `basis` sentence and a `taught` slide phrase. `week06Lab.test.ts` asserts that each phrase is on
  the student-visible slide face.
- **Continuity.**
  - `aerolinkCase.ts` imports Weeks 1–5 read-only and computes every capacity from the Week 3 trade rules (240 baseline,
    288 charger limit, 300 required, 320 after Increment 1), so the numbers agree with earlier weeks by construction.
  - The import format is `week5-model-inputs` v1 through Week 5's own importer; the export is `week6-model-inputs` v1.
  - No Week 7 code consumes it yet (Week 7 is not on the new template), so the "feeds Week 7" claim is a format promise,
    not a tested path.
- **Answers before attempts.** Quiz explanations appear only after "Check answer" (`Quiz.tsx:36–49`). The in-class
  classify and think-pair-share slides precede their worked reveals. The Examples try-it is behind `<details>`.
- **Routing.** The `week06` blocks in `App.tsx` (lines 19–21, 68–71, 166–169, 279–295, 459–468) and `WEEK_PAGES` in
  `lectures/route.ts:35` include Week 6, and the archive route is preserved. Playwright was not run, as instructed.
- **Teaching flow.** The template is lecture → lesson → examples → lab → separate assessment. Every slide has teach, why,
  walk, misconception, transition and timing. Security and resilience are integrated as A21 item 6 requires: a gate on
  every increment, Part 26 risk rules, a lesson section and a slide, and exercise Task 2.

## Items needing faculty decision

- **F1. Workload at and over the cap.**
  - At the cap: the team-of-four total is exactly 8.0 h. It uses 150 words a minute for a table-heavy lesson and does not
    count the Examples page.
  - Over the cap: graduate students and three-person teams each come to 8.1 h.
  - Knock-on effects: the fixes for Mo4 and n5 each add 0.1 h.
  - Decide: accept 8.1 h (as was done for Week 5), or trim the lab estimate.
- **F2. Baseline model for M1.** Option (a), as-is plus committed increment, or option (b), the SEBoK trajectory. The
  choice changes the gap table, the driving-question answer and the key.
- **F3. Driving-question key.** D ("cannot tell yet") as the key of a poll whose evidence answer is a specific order is
  weak. After M1, consider keying B or the corrected order, with D as the "before evidence" discussion point.
- **F4. Proposed content.** The AeroLink horizons, Increments 2 and 3, TECH-004 and TECH-005, U-008 and U-009, R-012 and
  R-013, and A-009; objectives W6.4–W6.6; rubric rows RB-15.5 and RB-15.6 and the re-mapping of RB-15; the three-person
  minimums.
- **F5. Register.** Approval of R105–R109; the R108 start-page extension (Mo6); the deferred R26 p.680 correction.
- **F6. Off-ramp hard gate (n6).** Confirm "an immature insertion requires an off-ramp" as a course rule.
