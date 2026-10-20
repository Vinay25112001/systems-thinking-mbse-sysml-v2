# Week 4 independent review: Architecture / Information View (A21 template package, commit 44620ef)

Reviewer: independent academic and technical reviewer (not the author). Date: 2026-10-19.

**Standard applied:**
- DECISION_LOG A20 and A21 (teach first; Week 1 template; item 4 workload in proportion to team size; item 9 AeroLink is the instructor reference only).
- COURSE_PRODUCTION_PLAN.md definition of done, items A–I.
- Week 2 as the signed-off comparison (`week02_review.md`, `week02_confirmation.md`). Recent review patterns from `week03_review.md` and `week08_review.md`.
- The milestone report, `learning-studio/docs/lectures/week04/WEEK4_MILESTONE_REPORT.md`.

**Scope:**
- `src/content/lectures/week04/*`, `LectureWeek4{S1,S2,Parts}.tsx`, `week4Path.ts`, `quizWeek4.ts`, `lab/week04Lab.ts`.
- `src/workbench/week4/*`, `src/week4/*`, `docs/lectures/week04/*`, `exports/lectures/week04-*`.
- The uncommitted Week 4 block in `src/components/figures/registry.ts`.

**What I did and did not change:**
- I edited no source file and committed nothing.
- I wrote two throwaway probe tests (`src/workbench/week4/zz_probe_review.test.ts` and `src/content/lectures/week04/zz_probe_timing.test.ts`) and one screenshot script. I ran them and deleted them; `git status` shows no trace of them.
- Playwright ran under the `_source_cache/.playwright.lock` protocol: the lock was free, I created it as `week04-reviewer`, used `--workers=1`, and deleted it after the runs. I did not touch the dev server on 5173.
- This file replaces the 2026-10-11 review of the earlier, pre-A21 Week 4 (requirements engineering). That review is in git history (`4f3f073`).
- The Week 3 fixer and the Week 8 fixer were working at the same time. I ran every Week 4 check against the current working tree, which already contains the Week 3 split of REQ-STK-018/019 and the added alternatives.

## Verdict: **REVISE**

This is a substantial, well-built package, and in several respects it is the strongest Phase I week so far:

- **Notes.** Every slide carries teach, why, figure walk, misconceptions, transition and a timing split. The worked slides carry full solutions.
- **Computed counts.** Every count in the notes and on the slides is computed in `aerolinkCase.ts` (`COUNTS`). I recomputed them all independently and they match: 6 viewpoints, 17/17 concerns, 7 groups, 17 functions (14 + 3), 14/15 capabilities, 12/12 system requirements, 19 stakeholder requirements with 3 no-child, 6 items, 11/12 routes, 2 AI cards, 5 human operations.
- **Week 3 imports.** Week 3 values are imported, never copied.
  - The physical configuration (16 aircraft, 6 sites = 4 hubs + 2 spokes, 8 + 4 chargers, min(16 × 20, 8 × 48) = 320 trips/day) is computed from `DECISION.recommended`, `ALTERNATIVES` and `TRADE_RULES`.
  - The TPM margins (1.0 min, 0.5 dBA, 1.5 points) and the 90 % retained capacity are read from the Week 3 case.
  - FN-015 picks up both REQ-STK-018 and REQ-STK-019 through `parents.includes('CAP-015')`, so the concurrent Week 3 split has already flowed through.
- **Honest source gaps.** ISO/IEC/IEEE 42010 is named as missing. The two different source wordings of "viewpoint" are taught side by side. The required view set, the producer → consumer → decision method, the route rule and the AI card are each labeled as course conventions where they are taught.
- **Citations.** Fidelity is high: 377 citations sit inside their register ranges, and 46 claims were opened on the cited page (45 supported; 1 page slip).
- **Gates and pacing.** All Week 4 gates pass, the student build strips every note, axe is clean, and pacing is within the template. The low spoken rates (28–29 wpm on the warm-up and exit, 11–12 wpm on the lab slides) are activity slides with the activity time stated, so they are not padding (n6).

Two findings are major. Both concern the week's central new idea, the information view:

- **M1.** The driving-question answer and the "complete" worked information view mix up data, the decision made from it, and who makes that decision. That is the exact distinction Session 2 teaches.
- **M2.** The lab tool's information-view gates reject valid entries that the lecture explicitly allows. This repeats the Week 2 M1 lesson: a valid entry must never be rejected for its form.

Counts: **blocker 0 · major 2 · moderate 8 · minor 11**.

## Findings

### Major

**M1 (major). The driving-question answer and the worked information view mix up data, decisions and decision makers.**

*Evidence:*
- `DISPATCH_ANSWER` (`aerolinkCase.ts:575–580`) lists the four inputs to FN-011 Dispatch aircraft. The slide-9 figure shows them on its face ("weather-hold state / IF-011 from EXT-007"; "energy state and flight plan / IF-002 from PHY-001"), and the notes read them aloud (`session2.ts:299, 311`). Two of the four are wrong:
  - **The weather-hold state** is not produced by the weather information service. The hold is placed by FN-004 at PHY-004, a decision by the duty manager (`aerolinkCase.ts:178–182`; SCN-005 step 2). What EXT-007 sends over IF-011 is weather *data* (INFO-004). The hold is the *information or decision* made from it, and it never crosses IF-011.
  - **The flight plan** is produced by FN-003 at PHY-004 (`aerolinkCase.ts:172–175`), not by the aircraft. The aircraft reports energy state over IF-002; the plan is internal to the operations center.
  - These two errors teach the reverse of slide 3 (data ≠ information) at the climax of the week.
- **INFO-006** (`aerolinkCase.ts:486–492`) names its decision as "the insurers' premium and coverage decision", but its only consumer is PHY-004. The course method (slide 4, `session2.ts:151`; misconception at `:285`) says the consumer is the element that uses the item for the named decision. Here the decision maker (the insurers, external) is not the consumer. The tool's consumer gate forbids an external consumer (M2), so the reference was forced into this inconsistency.
- **Missing items.** The slide calls this "the complete information view" (`session2.ts:261`). Yet function flows that cross elements have no information item:
  - FN-015's input "hold, diversion or cancellation decision" must travel PHY-004 → PHY-007, and that is the function the walk exposed;
  - FN-012's flight intent goes to the air traffic service (IF-003);
  - FN-010's alarm goes to the emergency services (IF-007);
  - FN-007's power set-points go to the chargers.
- **The route check covers only the items listed.** "11 of 12 routes covered" therefore passes for the wrong reason: a flow with no item can never fail it. None of the four consistency checks (`labBrief.ts:204–209`) relates function inputs and outputs that cross elements to information items.

*Failure scenario:*
- A student copies the worked answer and writes "weather-hold state: producer weather service".
- The rubric row RB-7.5 ("data vs information distinguished; the decision each item supports") marks exactly that as Developing.
- A reviewer asks "who decides the insurers' premium?" and the AeroLink view has no answer.

*Fix:*
- Split the dispatch inputs.
  - Weather: INFO-004 weather data (EXT-007 → PHY-004 over IF-011) feeds FN-004, and the duty manager's hold state reaches FN-011 inside PHY-004.
  - Flight plan: it comes from FN-003 inside PHY-004; IF-002 carries the energy state only.
  - Redraw the slide-9 figure to match.
- Make the insurers (an external) the consumer of the quarterly evidence report, or restate the decision as the operations center's.
- Add one item for the disruption notice (PHY-004 → PHY-007 over IF-008), or drop "complete" and say which cross-element flows are deliberately out of the view.
- Consider a fifth consistency check: every function input whose producing function sits on a different physical element appears in an information item.

**M2 (major). The lab tool rejects valid information-view and viewpoint entries that the lecture allows.**

*Evidence (throwaway probe against the fixture, then deleted):*
- **External consumer.** `consumers: 'EXT-001'` (the fixture's own county funders' reporting portal) fails the `consumer` gate (`record.ts:366–368`).
  - The lecture's own examples need such consumers: alarms to emergency services, reports to insurers (AG-5) and regulators.
  - The fixture's INFO-003 decision is "what to report to funders", but it cannot list the funders as a consumer.
- **AI producer.** `producers: 'AI-001'` fails the `producer` gate (`record.ts:363–365`).
  - Session 2 says "Some consumers and producers are AI capabilities. They need a card of their own" (`session2.ts:216`).
  - An AI card's outputs, for example AI-001's ranked list, are information that someone consumes.
- **Short concern.** A viewpoint whose concern is written as "Noise", or as the Week 1 ID "CON-003", fails the `stakeholders` gate. The gate requires two words for the concern (`record.ts:287`), although the concern is valid and traceable.
- The gates the reviewer would want do work: unknown IDs, a logical consumer, a missing decision, an unreached physical element, no input or output, and an element name used as a function name are all rejected. One-word and thing-like names ("Dispatch", "Charger") count, with advisories only, as intended.

*Failure scenario:*
- A food-bank team records "quarterly reach report → county funders" and the tool will not count it.
- To reach its minimum of 5 items, the team re-labels the funders as a physical element or drops the item. Either way the information view gets worse to satisfy the tool.
- This is the Week 2 M1 failure mode the milestone report says was designed out (§5).

*Fix:*
- Allow an external element as a consumer (and an AI card as a producer), with the route rule applied to the host element.
- Make the concern gate "at least one word or one CON-ID".
- Add probe cases for all three to `record.test.ts`, in both directions.

### Moderate

**Mo1. Figures do not show what their captions, alt text and figure walks describe.**

Each case below sends the instructor to point at something that is not drawn, and gives screen-reader users the wrong description.
- **Swimlane** (`LectureWeek4S1.tsx:406–440`). The alt text, the caption and the figure walk (`session1.ts:593–594, 621`) promise "the physical lane header reads 16 aircraft, 4 hubs, 8 turnaround chargers". The header reads only "physical".
- **Scenario walk.**
  - The alt text and figure walk speak of brackets and person icons for human operations (`session1.ts:422, 448`). The figure is a list of step numbers with no icons and no step text.
  - The figure shows every answer on the face, although the notes say "Students supply the function at each step" (`:439`).
- **Enterprise view.**
  - The alt text lists five agreements with their parties (`session1.ts:675`), including the electric utility, the manufacturer and the insurers, and the figure walk says "follow each dashed agreement line and name its parties" (`:691`).
  - The figure draws one dashed line and a text note "5 agreements … e.g." The external parties do not appear.
- **Information graph.** The caption says "with the decision written on each consumer arrow" (`session2.ts:266`), and the figure walk says "decision on the arrow" (`:284`). No decision is drawn, although it is the field the method is about.
- **Evaluation matrix.** The alt text says "columns item, allocated to, evidence, verdict" (`session2.ts:400`). Only item and verdict are drawn.
- **Answer figure.** The aircraft sits disconnected in a corner.

*Fix:* Draw what the alt text says, or cut the alt text and figure walk to what is drawn. On slide 12, show the step text and hide the function column (or reveal it as a build) so that students can actually supply the answers.

**Mo2. The 17-of-17 concern coverage rests on weak concern-to-viewpoint assignments.**

This is a check that can pass for the wrong reason.
- CON-003 *Affordable fare* (a passenger concern) is answered only by the information viewpoint (`aerolinkCase.ts:93`). Fares are quoted by FN-001 (functional) and governed by CAP-014; the information view does not tell a passenger whether the fare is affordable.
- The logical viewpoint is justified by CON-005 *Return on capital* and CON-015 *Fleet orders and delivery milestones* (`aerolinkCase.ts:79`; `session1.ts:306`; lesson `:811`). Technology independence does not answer either concern. Both are already in the enterprise viewpoint (`:100`), so deleting the logical view changes nothing.
- The demonstration "remove the information view and two concerns are left without a view" (`session1.ts:298, 306`) is true only because of the CON-003 assignment.

*Fix:* Reassign CON-003 to the functional view (FN-001 quotes the fare) or add a cost view. Justify the logical viewpoint by what it does answer: supplier choice open, CON-015 only if argued. State that coverage is only as good as the assignments, and that a reviewer checks that each one is plausible.

**Mo3. The audit slide states two things about the reference that are not true.**
- **Not all three defects are in the reference.** The title is "Auditing the view: three defects in the reference" (`session2.ts:355`). But F3 is in INFO-006 and FN-016 (`aerolinkCase.ts:614`), which this Week 4 package created (`provenance: 'proposed'`, `:491`). It is the author's own new gap, not a reference defect.
- **The flows were traced.** "Every one of these defects passed earlier reviews because nobody traced the flows" (`session2.ts:375`) is contradicted by `docs/authoring/reference_model_notes.md:41`. The coverage rule is tested on the reference, with mutations. F1 and F2 are element-kind errors, not tracing failures.
- **F1 overstates.** The reference's INFO-004 producer already reads "EXT-003 weather (via weather service)" (`src/model/reference/week08.ts:102`), so F1 refines the reference rather than overturning it.

*Fix:* Retitle the slide "two defects in the reference and one gap the new item exposes". Replace the "nobody traced" sentence with what actually happened: the kind check (what may produce or consume) is a separate check from the route check.

**Mo4. The evaluation gives one verdict without evidence and mislabels one check.**
- REQ-SYS-008 (no-go flag within 2 min) is marked **meets** because an interface exists (`aerolinkCase.ts:601`). The slide's own correction says allocation is not proof and asks for "evidence such as a margin or a capacity computation" (`session2.ts:417`). The existence of IF-013 says nothing about latency. Mark it open, with a latency budget owned by Week 5.
- "AeroLink passes all four [consistency checks] except the incident route already found" (`session2.ts:442`) mixes categories. The route check is not one of the four (`labBrief.ts:204–209`); AeroLink passes all four.
- The capacity threshold `300` is typed in two places (`aerolinkCase.ts:597`; `session2.ts:412`). Week 3 exports `REQUIRED_CAPACITY`, so import it.

**Mo5. The assessment regresses on the closed Week 2 finding N20.**
- The applied exercise is "scored on four levels against five criteria (20 points)" with no level descriptors (`src/week4/Assessment.tsx:43`). The graduate task has no criteria (`:72`). Week 2 closed exactly this finding (`week02_confirmation.md:42`; `src/week2/Assessment.tsx:13–31`).
- The bike-share brief is "released on the LMS" (`:35`), but no brief exists in the repository, so neither task can be graded consistently.
- "One criterion from SEBoK's list" in the graduate task is ambiguous: its examples are R20c p.599 *aims*, not the affinity criteria.

*Fix:* Copy the Week 2 descriptor table pattern, write the brief, and name the list.

**Mo6. The quiz carries length and wording cues.**

Key positions are balanced (a/b/c/d = 3/3/3/3), and so are length ranks (3/3/3/3). Slide numbers are correct, contexts are unseen, and every item is answerable from the cited slide. Cues remain:
- **Odd one out by length.** The option farthest in length from the other three is the key in **5/12** items: Q1, Q4, Q6, Q9, Q10 (chance is 3/12). This is above the about-3/12 level Week 8 accepted. The Q6 key is 82 characters against 28–37, and the Q9 key 55 against 14–31.
- **Prompt echo.** The Q6 key repeats the prompt's wording ("the tag data both functions read and write" against "read and write the same tag data"). The Q5 key is the only option that names two pitfalls, the number the prompt asks for, in the prompt's own terms (too deep, no scenario walk).
- **Form cue.** In Q4 the key is the only noun phrase ("Pumping station") among three verb phrases, so the item is answerable by grammar alone.
- **Throwaways.** Q5c "It uses verbs", Q7a, Q11c "The cost of the model" and Q12d "central servers always fail" leave effectively three options.

*Fix:* Lengthen distractors to the key's length in Q6, Q9 and Q1. Paraphrase the Q6 key away from the prompt. Give Q4 four noun phrases ("which is an element, not a function?" with three element-like distractors), or four verb phrases with one that names an element. Replace the throwaways. Add an odd-one-out-by-length check (≤ 3/12) to `quizWeek4.test.ts`.

**Mo7. The workload has no hours for Part 15 (viewpoints).**
- `LAB4_PERSON_HOURS` (`labBrief.ts:56–64`) has no row for writing 5 viewpoints (purpose, stakeholders, concerns, items served, form) or for the concern-coverage check that the method asks for (`WEEK4_LAB_INSTRUCTIONS.md`, step 1). The 5 minutes in class covers purpose questions only.
- The week total is 7.9 h against 8.0 h (`week4Path.ts:139–152`), with lesson reading at 150 wpm for a table-heavy 5,835-word lesson. Week 3's review noted the same optimism.
- One hour of viewpoint work, about 0.25 h each, takes the total to 8.1–8.2 h.

*Fix:* Add a fixed 1.0 h viewpoints row and trim elsewhere, or state the overage. The three-person figure (7.6 person-hours, 2.5 h each) is otherwise computed correctly.

**Mo8. Commit 44620ef is not self-consistent.**
- At HEAD the Week 4 figures are not registered: the `// --- week04 ---` block is only in the working tree.
- That block's hunk sits next to the Week 8 change that imports the untracked `lectureWeek8Figures.ts`, so committing `registry.ts` as is would also take the Week 8 change.
- The milestone report still says "Nothing is committed; the faculty member commits" (§Status), which is stale.

*Fix:* Commit the Week 4 hunk alone (`git add -p`) or together with the Week 8 file, and update the report.

### Minor

- **n1. Page slip.** "SEBoK asks for the selected logical architecture to come with the rationale for its selection (R20b p.592)" (`session1.ts:650`). The sentence is on **p.591**. The lesson's traceability cite to p.592 is correct.
- **n2. One allocation criterion is used where it cannot discriminate.** "Exchange of the same type of flow" is the criterion for 8 of 17 allocations, usually in the form "its inputs already arrive at the operations center" (FN-003, FN-004, FN-013, FN-016). Among elements that all handle information, the criterion cannot choose between PHY-004 and PHY-007. The real reason is the R20c p.599 aim of fewer interfaces or proximity. Either allow the aims as stated reasons or rewrite those sentences. Quiz Q6 inherits the same reading.
- **n3. Provenance labels do not match the text.**
  - LOG-002, LOG-004, LOG-005 and LOG-007 have their text extended to cover the proposed functions (evidence log, notices, flights to operators, fire detection) but are labeled `'reference'` (`aerolinkCase.ts:337–342`; compare `src/model/reference/week08.ts:48–51`).
  - AI-002's `dataQuality` text is new, and its claim that "the converted fourth hub has no booking history" is doubtful: as a spoke it had bookings. The wording also assumes ALT-004, so it will be wrong if Week 3 ever recommends ALT-005 (`:528–529`).
- **n4. Direct stakeholder-requirement allocations need a note.** REQ-STK-007, 009, 015, 016, 018 and 019 are allocated directly to functions with no derived system requirement. Say on slide 13 that this is a concept-level shortcut, and that Week 5 derives the system requirement (R48c p.146).
- **n5. Viewpoint and view are blurred in the records.** The course teaches that the viewpoint is the rule and the view is the instance. The AeroLink "viewpoint" record holds view content (`shows`), and the tool has no separate view. Add one sentence saying each record holds a viewpoint and its view for one system.
- **n6. Live timing.** The interactive slides overrun once speech at 130 wpm is added to the stated student time:
  - slide 2: about 80 s of speech + 90 s of cards + 60 s of answers ≈ 3.9 min, planned 3;
  - slide 12: 386 words + student answers ≈ 5.5–6 min, planned 5;
  - slide 17: 408 words + 12 student prompts ≈ 6.5–7 min, planned 6.
  
  The 6-minute buffer absorbs this. The activity slides (warm-up 28 wpm, exit 29 wpm, lab 11–12 wpm) are correctly sized activities, not under-filled slides.
- **n7. The decision-test text repeats itself and asserts without evidence.**
  - It reads "Against NEED-001, short predictable waits: short, predictable waits need one network-wide assignment…" (`session1.ts:649` with `aerolinkCase.ts:406`).
  - The "supports" verdict asserts that distributed dispatch cannot meet 60 s. Base it on fleet pooling across vertiports instead of latency.
- **n8. Capitalization slip.** "three rows open, each with an owner week" starts lower-case on the slide face (`session2.ts:405`, uncapitalized `numberWord`).
- **n9. Inherited internal code.** The rubric row RB-12.1 shows "[S01/S02]" on the Laboratory page and in the generated Markdown. This is Week 2 N19, a template-level fix. The RB-12.3 SysML-checker clause does not apply in Week 4; the note says so.
- **n10. INFO-002's decision is incomplete.** It names only the dispatch-energy decision (`aerolinkCase.ts:457`), but PHY-005 consumes the fault reports for FN-008's go / no-go decision. Name both.
- **n11. Hub derivation assumption.** `CONFIGURATION.hubs = chargers / chargersPerHub` (`aerolinkCase.ts:353`) assumes every turnaround charger sits at a hub, in pairs. That holds for every current Week 3 alternative (ALT-004, 005, 006). A test comment would protect it if Week 3 adds an alternative with a single upgraded charger.

## Checks against the brief

1. **Depth, teachability, why, downstream, limitations.**
   - Strong. Each slide states its why. Downstream use is explicit: Week 5 interfaces, Week 6 roadmap, Week 10 actions and modes, Week 11 parts and allocations (`session1.ts:143`; `session2.ts:472–474`; `FEEDS_FORWARD`). Limitations are taught on slide 14.
   - Timing: 69 + 6 = 75 min per session; every slide is ≤ 130 wpm (maximum 114, the S1 title slide).
   - Teachability defects are in Mo1 (slide 12 shows the answers) and n6.
2. **Technical correctness.**
   - Architecture versus its description, framework/view/viewpoint, the 42010 gap honestly labeled, functional versus behavioral, decomposition from scenarios with R20b's pitfalls, logical (PIM) versus physical (PSM), and R20c's affinity criteria are all correct and sourced.
   - Data versus information is correct in the definition (R21 p.512) but contradicted in the worked answer (M1).
   - Information traced to decisions: M1 and n10. Evaluation against requirements and TPMs is a good lesson (TPM-003 split allocation) but has Mo4. The AI oversight claims are correctly sourced to R31 pp.1370–1371.
3. **AeroLink.**
   - Consistent with Weeks 1–3, and every Week 3 value is imported (see the verdict).
   - FN-015 to FN-017 are sound and found by the SCN-005 walk (steps 3, 5 and 6 verified against `week02/aerolinkCase.ts:219–225`).
   - INFO-004's correction is reasonable (Mo3 on how it is framed). INFO-005 is sound. INFO-006 has the decision-owner defect (M1).
   - The INFO-006 gap for Week 5 (PHY-008 → PHY-004, with no information interface among IF-001 to IF-014) is genuine. The counts in the notes are computed.
4. **Lab tool, both directions.**
   - Week 3 v1 good: imported, seeds five viewpoints, and the fixture is `ready`.
   - Week 3 bad, each refused with a clear message: version 2, no version, `week2` as text, no requirements, AeroLink SOI, `{}`, `[]`, and Week 1, 2 and 4 files.
   - Week 4 export: `week4-model-inputs` v1, and the Markdown round trip is identical. Week 4 import refuses version 2, bad IDs, duplicates, a non-list, AeroLink, and a Week 3 file.
   - Real defects are rejected, and one-word names are advisory only. Valid entries are wrongly rejected in M2.
   - Workload is 7.9 h, with the Mo7 gap. Three-person scaling is 7.6 person-hours → 2.5 h each, correctly computed.
5. **Quiz.** See Mo6.
6. **Web.**
   - No `RB`, `W4.x`, `DECISION_LOG`, outline or `new-pending-review` string appears on slide faces or in the lesson (tested, and confirmed on the rendered examples page). Objective codes W4.1–W4.6 appear on the week and lab pages, as in other weeks. "[S01/S02]" is the n9 inheritance.
   - The student build strips all notes.

## Citation spot-check (opened on the cited PDF page in `_source_cache/*.txt`)

| # | Claim (where) | Source | Result |
|---|---|---|---|
| 1 | Architecture: fundamental concepts … principles of design and evolution (S1 s4) | R39t p.1445 | ✓ verbatim; (1) is 15288:2015, (3) is 42010:2011 |
| 2 | Conceptual, realized through a description; description justifies inclusions (S1 s4) | R39t p.1445 | ✓ |
| 3 | Elements operate together to satisfy stakeholder needs (S1 s4) | R19 p.569 | ✓ |
| 4 | Document-based practice needs manual updating (S1 s5) | R19 p.570 | ✓ |
| 5 | Authoritative source of truth (S1 s5) | R19 p.570 | ✓ |
| 6 | Framework/models/views relationship figure, after IEEE 1471 (S1 s5) | R62 p.342 | ✓ Figure 1 (reference [1]) |
| 7 | MITRE definitions: framework, models, views, viewpoint (S1 s6) | R62 p.341 | ✓ verbatim |
| 8 | A functional architecture model is not the architecture (S1 s5) | R20a p.582 | ✓ ("not equivalent") |
| 9 | Framework: conventions, principles, practices; DoDAF, MoDAF, TOGAF, Zachman (S1 s6) | R39u p.1446 | ✓ |
| 10 | View: from the perspective of a viewpoint (S1 s6) | R39v p.1677 | ✓ (OMG SysML 1.3, from IEEE 1471) |
| 11 | Viewpoint: conventions and rules … stakeholder concerns (S1 s6) | R39w p.1678 | ✓ verbatim |
| 12 | 42010 named as a source of templates (S1 s6) | R20b p.593 | ✓ |
| 13 | Purpose is paramount; each view lets a stakeholder conclude (S1 s7) | R62 p.344 | ✓ |
| 14 | Frameworks set minimum guidelines (S1 s7) | R62 p.344 | ✓ |
| 15 | View principle: multiple views, each on an aspect or concern (S1 s7) | R04 p.275 | ✓ verbatim |
| 16 | The model has views for each stakeholder's viewpoint and concerns (S1 s7) | R19 p.573 | ✓ |
| 17 | Function: four senses (Ackoff, Hitchins, transformation, work area) (S1 s9) | R39x p.1510 | ✓ |
| 18 | Flows: data, materials, energies (S1 s9) | R20b p.587 | ✓ |
| 19 | "y is a function of x" (S1 s9) | R20a p.580 | ✓ |
| 20 | Six minimum contents incl. modes and interfaces (S1 s10) | R20a p.581 | ✓ |
| 21 | Functional versus behavioral (S1 s10) | R20a p.581 | ✓ |
| 22 | Two kinds of function (S1 s10) | R20b p.587 | ✓ |
| 23 | Mission as black box; built over iterations (S1 s11) | R20b p.587 | ✓ |
| 24 | Pitfalls: too deep; no scenarios; I/O forgotten (S1 s11) | R20b p.594 | ✓ |
| 25 | Five plus or minus two (S1 s11) | R20c p.597 | ✓ |
| 26 | Logical = PIM, physical = PSM, V8 example (S1 s14) | R19 p.571 | ✓ |
| 27 | Requirements allocated to logical and physical (S1 s14) | R20c p.596 | ✓ |
| 28 | Enterprise elements: departments, teams (S1 s19) | R20c p.597 | ✓ |
| 29 | Affinity criteria (S1 s15) | R20c pp.598–599 | ✓ |
| 30 | Allocation matrix and traceability matrix (S1 s15) | R20c p.600 | ✓ |
| 31 | No logical architecture; function I/O in a specific domain set; direct allocation on technologies (S1 s16) | R20c p.602 | ✓ verbatim in substance |
| 32 | Rationale for the selected logical architecture (S1 s18) | R20b p.592 | ✗ **on p.591** (n1) |
| 33 | Derived requirements from solution decisions; traceable (S1 s18) | R48c p.146 | ✓ |
| 34 | Architecture Design translates requirements into alternative solutions (S1 s20) | R48c p.144 | ✓ |
| 35 | Functions to HW, SW, DB, facilities, human operations; baselines (S1 s20) | R48c p.145 | ✓ |
| 36 | Requirements are the basis of architecture; concurrent (S1 s3) | R13 pp.557, 561 | ✓ |
| 37 | IM purpose (15288 6.3.6.1) (S2 s2) | R21 p.510 | ✓ verbatim |
| 38 | Supports analytics and decision-making; 15289 / GEIA definitions differ (S2 s2–3) | R21 p.511 | ✓ |
| 39 | Data raw unstructured; information structured, in context, analyzed (S2 s3) | R21 p.512 | ✓ verbatim |
| 40 | Data flows between systems, departments; useful information; well-informed decisions (S2 s2) | R66 p.112 | ✓ |
| 41 | Data without context; weather data loses value (S2 s3, s8) | R66 p.113 | ✓ |
| 42 | What decisions an architecture supports; early and often (S2 s4) | R62 pp.345–346 | ✓ |
| 43 | Views consistent, concordant; manage shared data centrally (S2 s5) | R62 p.345 | ✓ |
| 44 | Metadata: data about data; governance (S2 s6) | R21 p.513 | ✓ |
| 45 | Sensitive information: identifies an individual, health (S2 s6) | R21 p.514 | ✓ |
| 46 | Human in the loop; only as good as the data; trust, explainability, bias (S2 s7) | R31 p.1370 | ✓ |
| 47 | Five failure modes incl. distributional shift (S2 s7) | R31 p.1371 | ✓ |
| 48 | Physical architecture shaped more by non-functional requirements (S2 s12) | R20c p.599 | ✓ verbatim |
| 49 | Design points to capabilities meeting each requirement; two-way traceability (S2 s12) | R56 p.386 | ✓ |
| 50 | TPMs allocated or decomposed to subsystem assemblies (S2 s12) | R44 p.115 | ✓ |
| 51 | Action definition; directed features are parameters (S2 s14) | R72 p.30 | ✓ verbatim |
| 52 | Viewpoint definition is a kind of requirement framing concerns (S2 s14) | R85 p.181 | ✓ verbatim |
| 53 | IF-012 added because the interlock rode on a procedure (S2 s9) | `reference_model_notes.md:32` | ✓ (instructor history) |

All 377 `R(...)` and `cite` references in the Week 4 sources resolve to register entries inside their page ranges (scripted check). R39t–R39x, R48c and R66 are verified heading pages (`readings_verified.txt`).

## Gates (run 2026-10-19 from `learning-studio/`, on the shared working tree)

| Gate | Result |
|---|---|
| `npx tsc -b` | exit 2: **two errors, both Week 8** (`week08/session2.ts:30` `EXERCISE_MINUTES`; `workbench/week8/skeleton.test.ts:205`), from the Week 8 fixer's in-flight work. No Week 4 error. |
| `npx oxlint src` | 0 errors (warnings: the repository's existing `only-export-components` pattern) |
| `npx vitest run` | 1640 / 1643. Failures: Week 7 `activities.test.tsx` (two 30 s timeouts) and Week 11 RID writer (Week 11 files modified in the tree by another agent), both out of scope. **Week 4 suites 90 / 90** (case, timing, lab, quiz, record, tool). |
| `npx vite build` | ✓ |
| Student build (`vite build --mode student --outDir dist-student` + `scripts/check-student-build.mjs`) | **PASS**: Week 4 decks have 22 / 19 notes slides, all empty in the student build. The instructor decks have 49,608 / 36,532 characters of notes. No faculty-notes marker present. |
| Playwright `e2e/week4-flow.spec.ts` (lock held, workers = 1) | 6 / 6 (dashboard, walk, lab-tool import and export, archive, axe light and dark at 1440 and 400 px) |
| Playwright `e2e/lectures-week4.spec.ts` (lectures config, port 5198) | 4 / 4 (viewer, axe on every slide with notes light and dark: no violations, 400 px) |

## Required for sign-off

- **M1** and **M2**.
- **Mo1–Mo8.**
- Minor items at the author's discretion. n1, n3 and n8 are one-line fixes.

After the Week 3 fix lands, re-run the Week 4 case and timing tests. The configuration, TPM and disruption-requirement imports are already correct for the current Week 3 working tree.
