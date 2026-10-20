# Week 2 independent review: ConOps / Requirements (A21 template package, commit 752c15e)

Reviewer: independent academic and technical reviewer (not the author). Date: 2026-10-19.
Standard applied: DECISION_LOG A20 and A21; COURSE_PRODUCTION_PLAN.md definition of done, items A–I; the Week 1
template (`src/content/lectures/week01/*`, `src/week1/*`, `src/workbench/week1/*`, `week01_final_review.md`).
Scope: `src/content/lectures/week02/{session1,session2,aerolinkCase,labBrief}.ts`, `LectureWeek2S1.tsx`, `LectureWeek2S2.tsx`,
`week2Path.ts`, `quizWeek2.ts`, `lab/week02Lab.ts`, `WEEK2_LAB_INSTRUCTIONS.md`, `src/workbench/week2/*`, `src/week2/*`,
and `exports/lectures/week02-*`.
No source file was edited and nothing was committed. One throwaway probe test (`src/workbench/week2/zz_reviewer_probe.test.ts`)
was written, run and deleted. The file this report replaces was the review of the earlier pre-A21 Week 2 (2026-10-09).

## Verdict: **REVISE**

The package is close to sign-off. This is a strong teaching package. Both sessions can be taught live from the slides and
notes:

- every slide carries teach, why, figure walk, misconceptions, transition and a timing split;
- the worked slides carry full worked solutions;
- the instructor decisions are flagged and stripped from the student build;
- each method's use downstream (Week 3, Weeks 9, 10 and 12) is stated.

Citation fidelity is high. All 261 citations in the Week 2 files fall inside their register ranges, and none cites a
source outside the register. The 50 claims I checked against the opened pages (table below) all match their sources. The noise
correction does flow down: NEED-003 → CAP-007 → REQ-STK-011 → REQ-SYS-011 → MOE-007 and MOP-010. The student build strips
every note.

Two findings are major and must be fixed before faculty review:

- **M1.** The lab tool rejects valid requirements whose subject is a named system ("MedFly shall …"). This is the A21
  item 2 defect that Week 1 already fixed for needs.
- **M2.** The week's central audit example, the deliberate gap (NEED-011), is undermined by the case's own data and by the
  lecture's own TBD doctrine.

Eight moderate findings follow, mostly factual slips in the worked examples and inconsistencies with the schedule or
vocabulary. None needs restructuring.

Counts: **blocker 0 · major 2 · moderate 8 · minor 13**.

## Findings

### Major

**M1 (major). The lab tool's subject gate rejects valid requirements whose subject is a one-word named system.**
- *Evidence.*
  - `record.ts:433` requires `words(subject) >= 2`, using `subjectOf` (`activities/week04/quality.ts:128`).
  - The probe ran a complete, well-formed requirement: "MedFly shall deliver each blood unit to the requesting hospital
    within 30 min of the request." It had a criterion, a rationale, a parent and a method. Result: `counts=false`, failing
    gate `subject`, with the message "Put the obliged entity before 'shall'".
  - "Dispatch shall assign a van … within 10 min" was rejected the same way.
- *Failure scenario.* A team whose enterprise or system has a one-word name (FreshRoute, MedFly; teams are told to name
  their system) writes correct requirements in the natural form. The tool refuses to count them, so the team cannot reach
  the minimum of 10. Or the team pads the subject ("The MedFly system") only to satisfy a pattern. A21 item 2 forbids
  exactly this: valid statements must not be rejected for pattern alone. Week 1 fixed the same defect for needs
  (confirmation item N1: the need gate accepts named systems). Week 2 reintroduces it as a hard gate.
- *Fix.*
  - Accept a one-word subject when it is a proper noun (capitalized, not a pronoun or determiner), or when it matches the
    imported enterprise or SoI name, or any capitalized token.
  - Keep the rejection for "it/this/they/we/you" and for an empty subject.
  - Add a both-directions test: the named-system requirement counts, and "It shall …" fails.

**M2 (major). The deliberate gap (NEED-011) is not clean: the case traces it transitively, and the reason given for leaving it contradicts the lecture.**
- *Evidence, part (a): a transitive trace.* NEED-011 is a need of CAP-005 (`aerolinkCase.ts:282`). REQ-STK-003 has CAP-005
  as a parent (`:339`). The case's own helper `needsOfRequirement` (`:382–388`) therefore returns NEED-011 for REQ-STK-003,
  and for REQ-SYS-004 below it. In the trace graph, NEED-011 ← CAP-005 ← REQ-STK-003.
  - The lecture says NEED-011 "has a capability (CAP-005) but no stakeholder requirement" (`:405`).
  - It then warns that linking an unrelated requirement to NEED-011 "would make the matrix look complete and hide the gap"
    (`:407`). The case already does this, through the capability.
  - CAP-005's text ("detect weather … hold, divert or recover flights", `:282`) does not mention passenger notice at all,
    so the CAP-005 → NEED-011 link itself is weak.
- *Evidence, part (b): the stated reason.* The gap's reason (`:406`) is that the requirement depends on A-008, so the
  reference "records the reason rather than writing a requirement with nothing to stand on". But:
  - Session 2's TBD slide teaches the opposite (`session2.ts:273`): "A requirement with a TBD is not ready …" is a
    misconception, and "Writing it with a tracked TBD is the right move".
  - Only the "way onward" half of NEED-011 depends on A-008. The promptness of notice does not.
- *Failure scenario.* A capable graduate student challenges the instructor on slide S2.13: "REQ-STK-003 traces to NEED-011
  through CAP-005. And why not write the notice requirement with a TBD, as you told us six slides ago?" The instructor's
  central audit example then collapses in class. Teams also learn two incompatible rules: trace through a capability
  either does or does not cover every need of that capability.
- *Fix (two parts, both small).*
  1. **Fix the trace.** Do one of these:
     - remove NEED-011 from CAP-005.needs and give it a proposed CAP-015, "Disruption notice and re-accommodation", which
       SCN-005 steps 5–6 exercise; or
     - state the audit rule explicitly on S2.12/S2.13 and in the lesson ("a need is covered only by a REQ-STK that names it
       directly; trace through a shared capability does not cover every need of that capability"), and make
       `needsOfRequirement` or a test reflect it.
  2. **Rewrite the reason.** Make it consistent with the TBD doctrine. For example: "the notice obligation can be written
     now with a TBD (do so in Week 3); the reference leaves the need childless only to serve as the audit teaching case."
     Alternatively, make the gap a different need whose requirement genuinely cannot yet be stated. Add a test asserting
     that no requirement reaches NEED-011 through any path.

### Moderate

**M3 (moderate). Factual errors in the worked-example notes on the coverage and capability slides.**
- *The "most needs" claim.* `session1.ts:616` (figure walk, slide 16) says "SCN-005 touches the most needs". From
  `NEED_COVERAGE`, SCN-002 touches 5 needs (002, 003, 008, 009, 014) and SCN-005 touches 4 (002, 009, 011, 013).
- *The "no badge" claim.* `session1.ts:675` and `:678` (slide 18) say the capabilities without a scenario badge are
  "CAP-007, CAP-008 and CAP-009", and "finish on … the three nodes without one". But CAP-010 also has no badge:
  `scenariosOfCapability('CAP-010')` is empty, and the figure draws none.
- *Inconsistency with the coverage matrix.* The case is internally inconsistent here. The needs of CAP-010 (NEED-010),
  CAP-007 (NEED-003) and CAP-009 (NEED-006) are all marked exercised by scenarios (SCN-003 step 2 and A2; SCN-002 step 5;
  SCN-003 A3). Yet the notes call these "capabilities no scenario exercises".
- *Failure scenario.* Students read the matrix and the tree while the instructor reads the notes aloud. Both statements are
  visibly false on the projected figure, and the exports carry them (`week02-session1-notes.md`).
- *Fix.*
  - Correct both sentences.
  - Either add CAP-010 (and CAP-007) to the capabilities lists of SCN-003 (and SCN-002), or define the badge as "primary
    capability the scenario derives from", distinct from "exercised by".
  - Add a test that derives these claims from the data.

**M4 (moderate). The tool counts canonical requirement defects toward the minimum.**
- *Evidence.* Probe results, each with attributes filled:

  | Requirement | Typed as | Counts? |
  |---|---|---|
  | F4 "The fleet shall maximize availability." | constraint | yes |
  | F5 "The operations system shall not dispatch flights in unsafe weather." | functional | yes |
  | "The booking function shall be easy to use for pantry coordinators." | functional | yes |
  | "The routing tool shall respond quickly to driver requests." | functional | yes |

  Each shows only advisories. MITRE names "easy to use", "maximize" and "minimize" explicitly as defects (R55 p.370). The
  course's own Week 4 checker fails a vague term that has no bounded measure (`quality.ts:189`). Week 2 downgrades every
  vague term to an advisory (`record.ts:502–503`).
- *Failure scenario.* A team reaches "ready" with a set the grader must fail on RB-3.1. The completeness check is described
  to students as "the same checks the instructor applies first", so it gives false assurance.
- *Fix.*
  - Keep the false-positive protection: the fare display, "including every charge", and "support" stay advisories.
  - Promote a narrow list to a hard gate when the statement has no bounded measure and no TBD/TBR: easy to use,
    user-friendly, quickly, fast, adequate, as appropriate, as possible, safe/unsafe, quiet, and
    maximize/minimize/optimize.
  - Test both directions (F4 and F5 fail; REQ-STK-012 and the qualified "and" still count).
  - Update the S2 critique note, which says the word-level signs "never block".

**M5 (moderate). "SEBoK form" is reintroduced, against the Week 1 final review and A21 item 2.**
- *Evidence.* Week 1's final review replaced "SEBoK form" with "the recommended form" throughout, because the form is a
  recommendation, not a requirement. Week 2 uses "SEBoK form" in student-visible text:
  - `session1.ts:92` (caption), `:93` (alt) and `:881` (lesson);
  - `LectureWeek2S1.tsx:279` (figure label);
  - `src/week2/Assessment.tsx:35` ("three needs in SEBoK form").
- *Failure scenario.* Students infer that needs must follow one sentence pattern, which reverses the faculty decision.
- *Fix.* Replace with "the recommended form" or "well-formed needs".

**M6 (moderate). Schedule references are stale (A19 and A21 consistency, review item 7).**
- *Evidence, case data.* The A19 schedule puts the trade study in Week 3, the roadmap in Week 6 and the presentation in
  Week 7. The case data say otherwise:
  - U-001 closes "before the requirements baseline (Week 6)" (`aerolinkCase.ts:306`);
  - U-002 closes "before the Week 7 trade study" (`:307`);
  - MOE-005 uses "unit costs in the Week 7 trade study" (`:442`).
  - The same table says U-003 closes "before the Week 3 trade study closes". These texts are shown on the
    worked-examples catalogue and in the S2 negatives/TBD figure.
- *Evidence, course data.* `course.ts:103` still lists Week 2 topics as "Measures: MOE, MOP and TPM". `Roadmap.tsx:59` and
  `WeekPage.tsx:114` render these topics to students, against A21 item 5 (TPMs in Week 3). The milestone report
  acknowledges this (§10.3), but it is still visible to students.
- *Fix.*
  - Change U-001 to a Week 3 closure, or to "before the Week 7 package baseline".
  - Change U-002 and MOE-005 to "Week 3 trade study".
  - Update the `course.ts` Week 2 topics (and the Week 3 topics) now. The decision is already provisionally made in A21.

**M7 (moderate). Three different disposition vocabularies.**
- *Evidence.*
  - Lecture S2.13 (`session2.ts:469`) and the lesson: "write the requirement, link the real parent, or record why not".
  - Lab method step 7 (`week02Lab.ts:87`) and the tool message (`record.ts:869`): "covered elsewhere, deferred, or a
    deliberate gap".
  - The case (`STK_DISPOSITIONS`, figure legend): "O (open item) / R (recorded reason)".
- *Failure scenario.* "Covered elsewhere" is the wrong fix the lecture warns against (hiding a gap behind another
  requirement), offered here as a valid disposition. Graders and students also cannot map one set of terms to another.
- *Fix.* Choose one set, for example: write it; link the real parent; open item, with target week; recorded reason, no
  child needed. Use it in the lecture, the lab, the tool and the case. Drop "covered elsewhere", or require the covering
  requirement's ID.

**M8 (moderate). Partial need coverage goes unremarked, and the lecture's own NEED-003 lesson applies to it.**
- *Evidence.* The lecture teaches that a need with two bounds needs two requirements (`session2.ts:371`). Three other
  stakeholder requirements cover only part of their need, silently:
  - **REQ-STK-007** (`aerolinkCase.ts:343`): "a passenger using a wheelchair … without being lifted". The corrected NEED-008
    (`week01/aerolinkCase.ts:313`, listed in `TRACE_CORRECTED`) has a wider class, "Passengers with reduced mobility", and
    adds "travel … without being … separated from their mobility aid".
  - **REQ-STK-008** covers alert only. NEED-006 (`:311`) also asks for "safe access".
  - **REQ-STK-017** caps the fare against ride-hail only. NEED-017 (`:322`) names public transport too.
- *Failure scenario.* A21 requires "corrected AeroLink data propagated", but the NEED-008 subject correction has not
  reached REQ-STK-007. A student who applies the noise lesson finds three counter-examples in the instructor's own
  baseline.
- *Fix.*
  - Widen REQ-STK-007 to the corrected class, and add a proposed requirement (or a recorded disposition) for keeping the
    mobility aid with the passenger.
  - Note NEED-006 access and NEED-017 public transport as partial coverage, with dispositions, on the audit slide or in
    the catalogue.

**M9 (moderate). The pivotal guided construction of SCN-005 is under-timed.**
- *Evidence.* `session1.ts:542` and `:564` plan "about forty-five seconds per field", with students proposing and two
  proposals taken for each field. There are 8 fields: the boundary, actors, trigger, preconditions, 7 main-flow steps,
  3 alternates and 2 end states. The whole slide is budgeted at 6 min.
- *Failure scenario.* Run as written, with real proposals, the slide takes 10–12 min. The session overruns the 6-minute
  buffer, or the instructor rushes the method's core demonstration.
- *Fix.*
  - Either budget 9 min, taking the time from slides 8 and 12 (the notes already name them as the places to shorten), or
    change the instructions so students propose only the boundary, primary actor, trigger and one alternate, and the
    rest is revealed.
  - Update `timing.test.ts`, which requires 5 min or more.

**M10 (moderate). Wrong MOP → MOE linkage in the reference measures (RB-4.2).**
- *Evidence.*
  - MOP-008, fire-alarm transmission latency, "measures" MOE-004, dispatches outside approved limits
    (`aerolinkCase.ts:454`).
  - MOP-009, peak charging power, measures MOE-002, daily trips (`:455`).
  - MOE-006, capacity after losing a hub, measures CAP-005, weather-aware operations (`:443`).
  - NEED-006 and CAP-009 (incident response) have no MOE.
- *Failure scenario.* RB-4.2 grades "every MOP → MOE → NEED" linkage. The catalogue, which students consult while writing
  their own measures, models links that are semantically false.
- *Fix.* Add an MOE for incident response (for example, responder-alert compliance), and link MOP-008 to it. Link MOP-009
  to a grid-compliance MOE, or to REQ-STK-010 only with an MOE for NEED-010. Link MOE-006 to NEED-005 or CAP-008.

### Minor

- **N11. A DEI article is cited for the 15288 process list.** Slide 3 cites R98 p.1001, a Diversity, Equity and Inclusion
  article's table that maps 15288 processes to inclusion considerations. The order is supported, but a student who opens
  the source finds a DEI table. *Fix:* say so in the note ("SEBoK's DEI article tabulates the 15288 technical
  processes"), or cite a process-oriented page.
- **N12. A TBD token with one digit gets a garbled message.** "TBD-1" returns "Number the TBD-1 (for example TBD-1-01)"
  (`record.ts:483`, probe G7). *Fix:* suggest "TBD-01".
- **N13. The per-member requirement quota breaks the three-person minimum.** Lab procedure step 7 says "Each member writes
  at least three" (`week02Lab.ts:99`). A team of three then writes 9 requirements, above its proportional minimum of 6.
  *Fix:* "at least ⌈minimum ÷ members⌉".
- **N14. The scenario boundary gate catches only one case.** The `outside` gate catches a primary actor only when its name
  equals the scenario SoI's name. "Routing tool", inside the SoI, passes (probe S1). This is acceptable as clinic judgment.
  *Optional fix:* an advisory when the actor's name appears in the SoI sentence.
- **N15. NEED-011 is retyped.** `DISCOVERIES[0].text` (`aerolinkCase.ts:247`, shown in the lesson at `session1.ts:1062`)
  paraphrases NEED-011 instead of importing the canonical Week 1 statement, against "nothing is retyped". *Fix:* use
  `need('NEED-011').statement`.
- **N16. Quiz details.**
  - w2q-9 reuses the S2.12 figure's N-n/Y-n labels, with N-3 childless as on the slide: overlap with an in-lecture example.
  - The w2q-3 key alone lacks "and" (a form cue), and "at weekends" is British usage.
  - w2q-12 is tagged Evaluate but is recall.
  - In w2q-7, option (b) "card or phone" is arguably design-laden, and the explanation gives no source.
  - The Bloom tag is spelled "Analyse".
  - *Fix:* relabel and reword.
- **N17. Weather flow-down is partial.** REQ-SYS-004 covers only wind and gust. Its parent REQ-STK-003 and U-001 include
  visibility. *Fix:* add visibility, or note the remaining child requirement.
- **N18. Fleet and capacity do not reconcile.** The ConOps fleet of 12 aircraft at about 20 trips each gives 240
  trips/day, below the 300 trips/day that REQ-STK-004 requires by month 24. *Fix:* label 12 as the opening fleet, and point
  the growth to about 15 aircraft at the Week 3 trade.
- **N19. Internal source IDs reach students.** The lab rubric rows show "[S01/S02]" (RB-12.1) and "S12 p.144" (RB-3.5).
  This is inherited from the shared rubric register, and Week 1 has it too. Fix it at template level.
- **N20. Two assessments cannot be graded consistently yet.** The applied exercise names five criteria on four levels but
  has no level descriptors. The graduate memo has no criteria. The memo's 0.8 h (read R55 pp.368–370 and write one page)
  is tight. *Fix:* add brief level descriptors for both.
- **N21. No consolidated "why each method" view.** Week 1's final review added a single-source table of why each method
  matters and what it feeds (`methods.ts`, slide `s2-why-methods`). Week 2 has the whys per slide and a bridge slide, but
  no consolidated view. This is a template-parity gap.
- **N22. The clinic slot is slightly short.** Five teams × (90 s + 20 s) = 9 min 10 s, in a 9-minute slot
  (`session2.ts:678`, `:687`). *Fix:* "about 80 s per team".
- **N23. Figure walk on slide 3.** The misconception "performed concurrently with Architecture Definition" has no page.
  The support is R13 p.561, which is in the register range. *Fix:* add "(R13 p.561)".

## What was checked and passed (no finding)

- **1. Teachability.** Every slide has teach, why, figure walk, transition, timing and misconceptions. Worked solutions
  are complete (SCN-005, F1–F6). The driving question is posed on slide 2 and answered on slide 22. Retrieval opens
  Session 2, with the answers kept apart from the questions. Sourced definitions are separated from labeled course
  conventions throughout. Source gaps (IEEE 1362, INCOSE GtWR and NRM) are said aloud. The exported notes are 10,562 and
  8,999 words. S1 = 69 + 6 min and S2 = 69 + 6 min (47 min of lecture, 22 of lab launch). Spoken density is tested at
  130 wpm or less.
- **2. Technical content.** These match their sources:
  - ConOps against operational concept against CONOPS (R39m, R39g, R52);
  - scenario, use case and actor definitions (R39n, R39o, R59);
  - need → requirement as analysis (R13 p.558);
  - the requirement definition and attributes (R13 pp.558–559);
  - characteristics (R48b p.144; R54 pp.329–330). The claim that eight are shared is correct;
  - categories (R13 p.560); TBX (R13 p.565);
  - requirement V&V against system V&V (R13 p.566);
  - the verification methods (R49 pp.149–150; R16 p.769);
  - traceability: orphan, childless parent, "ultimately" (R45 p.118);
  - MOE, MOP and KPP (R54 pp.330–331).
- **3. AeroLink.**
  - Every requirement resolves to a corrected Week 1 need. None is an orphan, and the case test passes.
  - The turnaround budget holds: 25 = 5 + 20.
  - The aircraft cycle holds: 43 = 16 + 25 + 2, so 960/43 × 0.9 ≈ 20 trips per aircraft per day.
  - The assignment allocation holds (60 s against a 15 min budget), as does the alarm allocation (30 of 60 s).
  - The counts hold: TBD-01..04 and TBR-01..02 are four TBDs and two TBRs, as stated. There are 7 childless REQ-STK, and
    the lecture says 7.
  - The noise correction flows down fully.
  - The figures are generated from the case data.
- **4. Lab and tool.**
  - Imports Week 1 v1–v3 through Week 1's own importer. Rejects v4, a Week 2 file and AeroLink.
  - Exports `week2-model-inputs` v1. The round trip returns "ready". Rejects v99 and cross-imports.
  - Rejects good requirements: see M1.
  - Accepts defective requirements: see M4.
  - Rejects these correctly: two "shall"s, a "should", a restated rationale, a STK under SYS, an orphan, an untracked TBD.
  - Workload: 10.5 person-hours ÷ 4 = 2.6 h. The three-person team's 7.9 ÷ 3 = 2.6 h, so the load is proportional. The
    week totals 8.0 h, or 8.2 h for graduates. The estimate is plausible for a graduate team, if optimistic for 10
    fully attributed requirements in 2.5 person-hours. Check it against the logged hours.
- **5. Assessment.**
  - Keys a/b/c/d appear 3/3/3/3, and the length-rank control is tested.
  - Every item names a real slide. The slide numbers quoted in the explanations match the decks (S1: 4, 7, 10, 12, 17;
    S2: 6, 7, 8, 11, 12, 15).
  - All items are answerable from the lecture, in non-AeroLink contexts.
- **6. Web.**
  - Routes work: the Week 2 walk e2e passes.
  - No internal IDs appear on slide faces or in the lesson (tested).
  - The student build strips the notes: 967 markers are absent from `dist-student/`, the Week 2 student decks have 24 and
    22 notes slides that are all empty, and the instructor decks carry the notes.
  - axe reports no violations, in light and dark, at 1440 and 400 px.
- **7. A21 compliance.**
  - TPMs are taught in Week 3 in the lecture (`course.ts` still lists them in Week 2: see M6).
  - AeroLink is the instructor's reference only: the tool refuses AeroLink imports and text, and the lab is about the
    team's own enterprise.
  - Security and resilience point to Weeks 3, 5 and 6.

## Citation spot-check (50 claims opened in `_source_cache` via `scripts/source_pages.py`)

| # | Claim as taught (file) | Cite | Verdict |
|---|---|---|---|
| 1 | SRD is third in SEBoK's table of 15288:2015 technical processes (S1.3) | R98 p.1001 | Supported (DEI article table; see N11) |
| 2 | SRD turns the stakeholder view into a developer view; inputs are the life-cycle concepts and the integrated set of needs (S1.3) | R13 p.557 | Supported, verbatim |
| 3 | Operational concepts include modes, scenarios, use cases, misuse and loss scenarios; the operational concept is a life-cycle concept (S1.3) | R10 p.546 | Supported |
| 4 | Needs black box, requirements white box (S1.4) | R13 p.558 | Supported |
| 5 | More than changing the subject; analysis (S1.4, w2q-5) | R13 p.558 | Supported, verbatim |
| 6 | CONOPS definition, a user-oriented document (S1.5) | R52 p.298 | Supported, verbatim quote |
| 7 | Purpose without the technical solution; first step to requirements; update after DT/OT; critical objectives with rationale (S1.5) | R52 p.299 | Supported |
| 8 | OMB definition (S1.5 example) | R52 p.299 | Supported |
| 9 | ConOps glossary definition, discussion, "slightly different" (S1.6) | R39m p.1469 | Supported, verbatim |
| 10 | Operational concept, "of a system or a related set of systems" (S1.6) | R39g p.1579 | Supported, verbatim |
| 11 | IEEE 1362 is a well-developed guideline (S1.7) | R52 p.300 | Supported |
| 12 | Four critical components; six additional objectives (S1.7, w2q-1) | R52 p.301 | Supported |
| 13 | Best practices: user language, glossary, graphics, environment, safety, security and privacy (S1.8) | R52 p.302 | Supported |
| 14 | "Highly reliable" acceptable; the buyer or developer quantifies it (S1.8) | R52 p.302 | Supported |
| 15 | OV-1 as a tool for recognizing external interfaces (S1.9) | R54 p.331 | Supported |
| 16 | Use case; actors outside; primary and secondary actors (S1.10, w2q-2) | R59 p.453 | Supported, verbatim |
| 17 | A thread is one path; main flow and variations (S1.10) | R59 p.452 | Supported |
| 18 | Mission threads drive the architecture and are the basis for test cases; support and maintenance threads (S1.10, S1.12) | R59 p.453 | Supported |
| 19 | Operational scenario definition; used to evaluate requirements and to verify and validate (S1.10) | R39n p.1581 | Supported, verbatim |
| 20 | Use case: behavioral requirements and interaction with a user (S1.10) | R39o p.1669 | Supported |
| 21 | Trigger to goal; failure falls short; intent, not UI; implementation only for assurance (S1.11, clinic) | R59 pp.453–454 | Supported |
| 22 | Elicit off-nominal use cases, misuse cases and loss scenarios (S1.12, w2q-3) | R11 p.553 | Supported |
| 23 | Review questions; stopping rule; Gottesdiener pitfalls (S1.13) | R59 p.455 | Supported |
| 24 | Parameterization list; do not describe internal workings (S1.12, S1.13) | R59 p.456 | Supported |
| 25 | Four capability definitions; SEBoK def. (4); feature, capability, benefit (S1.17, w2q-4) | R39p pp.1457–1458 | Supported, verbatim |
| 26 | Enterprise capabilities exist for mission needs; the 150,000-passenger example; gaps and excess (S1.17) | R12 p.862 | Supported, verbatim |
| 27 | Stakeholder requirements "transformed … to objectively adequate, structured and more formal statements" (S1.20) | R39a p.1632 | Supported (entry "Stakeholder Needs and Requirements" on that page) |
| 28 | System requirement, a technical view of a solution (S1.20) | R39l p.1652 | Supported |
| 29 | Stakeholder Requirements Definition translates capability needs into technical requirements (S1.20) | R48a p.141 | Supported, verbatim |
| 30 | Requirements Analysis: clear, achievable, verifiable requirements; allocation and derivation (S1.20) | R48b p.142 | Supported |
| 31 | Budgeting creates dependent requirements (S1.21) | R13 p.562 | Supported |
| 32 | NRM requirement definition; one need, several requirements; attributes; rationale (S2.3, S2.10) | R13 pp.558–559 | Supported, verbatim |
| 33 | Shall, should, may, will (S2.3) | R54 p.330 | Supported |
| 34 | DoD list of 13; MITRE list of 11; eight shared (S2.4) | R48b p.144; R54 pp.329–330 | Supported (overlap count verified) |
| 35 | Five categories; "each category topic … must be addressed" (S2.5) | R13 p.560 | Supported, verbatim |
| 36 | Checklist: function, performance, constraint, interface; legal, environmental, external interfaces (S2.5) | R55 pp.368–369 | Supported |
| 37 | White space; too high or too low a level of detail (S2.6, w2q-7) | R55 pp.367, 371 | Supported |
| 38 | Derived requirements come from solution decisions (S2.6) | R48 p.146 | Supported (in the Architecture Design section, as the note says) |
| 39 | Shall not, maximize, single point, threshold and objective; every requirement has a method (S2.7, S2.8, w2q-6, w2q-10) | R55 p.370 | Supported |
| 40 | TBD, TBR, TBX management; traceability and change impact (S2.7, S2.12, w2q-12) | R13 p.565 | Supported |
| 41 | Requirement verification and validation are not system V&V; peer review and comparison; plan verification early (S2.8, S2.14) | R13 p.566 | Supported, verbatim |
| 42 | DoD demonstration, examination, analysis, test (S2.8, w2q-8) | R49 pp.149–150 | Supported, verbatim |
| 43 | INCOSE's four methods plus certification; airworthiness the best known (S2.8) | R16 p.769 | Supported |
| 44 | Bottom-up and bidirectional; orphaned, childless parent, "ultimately"; RTM (S2.12, w2q-9) | R45 pp.118–119 | Supported, verbatim |
| 45 | "Needs and requirements not traced to a source" as a metric (S2.12) | R14 p.478 | Supported |
| 46 | MOE, MOP, KPP definitions (S2.15, w2q-11) | R54 pp.330–331 | Supported, verbatim |
| 47 | Measures expressed as MOEs (S2.15) | R10 p.544 | Supported |
| 48 | Technical measurement includes MOE, MOP, TPM (S2.15) | R15 p.532 | Supported |
| 49 | Verification cases (Week 12 destination, S2.17) | R75 pp.96–97 | Supported (verification case definitions on those pages) |
| 50 | Requirements definition concurrent with architecture (S1.3 misconception, no page given) | R13 p.561 | Supported (see N23) |

All 261 Week 2 citations were also machine-checked against `readings.generated.json`. There are 0 unknown IDs and 0 pages
outside a register range. The four new entries (R39m–R39p) are verified glossary headings on the cited pages. They are
pending faculty confirmation.

## Gate results (run from `learning-studio/`, 2026-10-19)

| Gate | Result | Week 2? |
|---|---|---|
| `npx tsc -b` | **exit 2**: 1 error, `src/workbench/week8/skeleton.ts(460,18)` TS6133 | Out of scope (Week 8 agent's in-progress file); no Week 2 error |
| `npx oxlint src` | exit 0: 0 errors, 16 warnings | None in Week 2 files |
| `npx vitest run` | **68 files, 1,252 tests passed** | All Week 2 suites pass |
| `npm run build` | **exit 2 at `tsc -b`** (the same Week 8 error) | Out of scope. `npx vite build` alone: exit 0 |
| `npm run build:student` | **exit 2 at `tsc -b`**: Week 8 `skeleton.ts` plus `src/content/lectures/week08/_print.test.ts` (TS2591 `node:fs`) | Out of scope. `npx vite build --mode student --outDir dist-student`, then `node scripts/check-student-build.mjs`: **PASS** (13 exam markers and 967 faculty-notes markers absent from the student build and present in the instructor build; Week 2 student decks 24 and 22 notes slides, all empty; instructor decks 57,156 and 48,991 characters of notes) |
| Playwright `e2e/week2-flow.spec.ts` (default config, shared 5173 server, lock held) | **6/6 passed** (axe light and dark, 1440 and 400 px, every Week 2 page; import, export and version e2e) | Pass |
| Playwright `-c playwright.lectures.config.ts e2e/lectures-week2.spec.ts` (own 5198 server) | **4/4 passed**; axe: "no violations", light and dark, every slide with notes, handout and reader | Pass. `lectures.spec.ts` (Week 1) was not run, because it rewrites tracked screenshots |
| Reviewer probe (throwaway, deleted) | 10 good and 12 defective requirements, the scenario boundary, import and export: results quoted in M1, M4, N12, N14 and §4 above | n/a |

The dev server on 5173 was left running. `_source_cache/.playwright.lock` was created before the Playwright runs and
deleted after them. No tracked screenshot changed: `git status` on `screenshots/` was the same before and after.

## Required for sign-off

1. **M1.** Accept named-system subjects; add a both-directions test.
2. **M2.** Make the deliberate gap clean: fix the CAP-005 → NEED-011 trace, or state the audit rule, and give a reason
   consistent with the TBD doctrine.
3. **M3–M10.** Fix or explicitly disposition each.

The minor items can follow in the Week 3 batch.
