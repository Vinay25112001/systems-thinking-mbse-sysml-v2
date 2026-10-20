# Week 4 review dispositions

Response to `_source_cache/review/week04_review.md` (independent review of the A21 Week 4 package, commit `44620ef`,
verdict REVISE: 0 blockers, 2 major, 8 moderate, 11 minor). Written 2026-10-19 by the Week 4 fix pass. Nothing is
committed; the faculty member commits. Every changed item stays new-pending-review.

Summary: **both majors fixed, all eight moderates fixed** (Mo8 as the faculty member directed: report text corrected,
registry left for the Week 8 commit), **ten minors fixed and one dispositioned** (n6 kept within the buffer; n9 is the
inherited template item).

| Finding | Status | Where |
|---|---|---|
| M1 data, decisions and deciders mixed; "complete" view not complete; route check could not fail for an unlisted flow | **Fixed** | `aerolinkCase.ts` (flow sources, `flowCheck`, INFO-007 to INFO-010, INFO-002, INFO-006, `DISPATCH_ANSWER`), `session2.ts`, `LectureWeek4S2.tsx`, tests |
| M2 lab tool rejects valid entries the lecture allows | **Fixed**, every gate swept against the lecture (table below) | `labBrief.ts`, `record.ts`, `Week4LabTool.tsx`, `fixture.ts`, `record.test.ts`, `week04Lab.ts` |
| Mo1 figures do not show what caption, alt text and walk describe; slide 12 shows the answers | **Fixed** | `LectureWeek4S1.tsx`, `LectureWeek4S2.tsx`, `session1.ts`, `session2.ts`, `aerolinkCase.ts` (`WalkStep.short`, `human`) |
| Mo2 17-of-17 coverage rests on weak assignments | **Fixed** | `aerolinkCase.ts` (VP-002, VP-003, VP-005, `onlyAnsweredBy`), `session1.ts`, tests |
| Mo3 audit slide says two untrue things | **Fixed** | `aerolinkCase.ts` (F1, F3), `session2.ts`, `LectureWeek4S2.tsx`, `exampleParts.ts`, `Examples.tsx` |
| Mo4 one verdict without evidence; check mislabeled; 300 typed twice | **Fixed** | `aerolinkCase.ts` (REQ-SYS-008 open, `REQUIRED_CAPACITY`), `session2.ts` |
| Mo5 no level descriptors, no graduate criteria, no brief, ambiguous "criterion" | **Fixed** | `src/week4/Assessment.tsx`, `WEEK4_APPLIED_EXERCISE_BRIEF.md` (new), `week04Lab.ts` |
| Mo6 quiz length and wording cues | **Fixed** | `quizWeek4.ts`, `quizWeek4.test.ts` |
| Mo7 no hours for Part 15 | **Fixed** | `labBrief.ts` (`LAB4_PERSON_HOURS`), `week4Path.ts` (overage stated), `timing.test.ts`, `week04Lab.test.ts` |
| Mo8 commit not self-consistent; report stale | **Fixed as directed** (report text only; registry untouched) | `WEEK4_MILESTONE_REPORT.md` |
| n1 R20b p.592 → p.591 | Fixed | `session1.ts` (decision slide sources and note) |
| n2 one criterion used where it cannot discriminate | Fixed | `aerolinkCase.ts` (FN-003, FN-004, FN-013, FN-016 `why` name the aim), `session1.ts` (criteria slide) |
| n3 provenance labels | Fixed | `aerolinkCase.ts` (LOG-002/004/005/007 `corrected`; AI-002 data quality rewritten, `corrected`) |
| n4 direct stakeholder allocations need a note | Fixed | `session1.ts` (slide 13, computed count, R48c p.146) |
| n5 viewpoint and view blurred in records | Fixed | `session1.ts` lesson, `Week4LabTool.tsx` help text, `week04Lab.ts` |
| n6 live timing on interactive slides | Dispositioned | below |
| n7 decision test repeats itself and asserts without evidence | Fixed | `aerolinkCase.ts` (`ARCH_DECISION`, FN-002 `why`) |
| n8 capitalization slip | Fixed | `session2.ts` |
| n9 inherited "[S01/S02]" in RB-12.1 | Dispositioned (template-level, Week 2 N19) | below |
| n10 INFO-002 decision incomplete | Fixed | `aerolinkCase.ts` |
| n11 hub derivation assumption | Fixed (test guards it) | `aerolinkCase.test.ts` |

## M1: data, decisions and deciders

**What was wrong.** The dispatch answer said the weather-hold state came from the weather service over IF-011 and the
flight plan from the aircraft over IF-002; INFO-006 named the insurers' decision with the operations center as consumer;
four cross-element flows had no item; the route check only checked pairs that were already listed, so it could not fail
for a missing flow.

**What changed.**
- **Flow sources.** Every information input of every function now states its source (`FlowItem.src`: the producing
  function, an external system, an AI capability, `held` or `stakeholder`); outputs to an external system state `dst`; a
  crossing names the item that carries it (`info`). `flowCheck()` computes every flow between two elements **from the
  functions and the allocation alone**, then requires an item whose producers and consumers join the two elements
  (`unlisted` otherwise) and a covered route (`no-route` otherwise). `unsourcedInputs()` must be empty, so the check
  cannot be blinded by an input with no source. Result: 20 cross-element flows, 20 carried, 19 with a covered route; the
  one without is F3 (pad incident records), as before.
- **Missing items added** (all `proposed`): INFO-007 *Service status and disruption decisions* (PHY-004 → PHY-007 over
  IF-008: the hold decided by FN-004 reaches FN-015 and FN-001), INFO-008 *Flight release and plan* (PHY-004 → PHY-001
  over IF-002), INFO-009 *Flight intent* (PHY-004 ⇄ EXT-001 over IF-003; two parties decide with it, so both are
  consumers), INFO-010 *Pad fire alarm* (PHY-008 → EXT-006 over IF-007; the consumer is the external system, because the
  decision is made outside AeroLink). FN-012 gains the input "acceptance or amendment of each intent" from EXT-001.
  FN-007's power set-points stay inside PHY-003 (Charging Systems includes the power control), and passenger exchanges at
  the boundary are not flows between elements; both are said aloud in the notes and the lesson. The word "complete" is
  replaced by "every function flow between elements in it", which the flow check now proves.
- **INFO-006 re-scoped.** Its decision is now the operations center's (which incident causes to correct first, and what
  the quarterly report to the insurers shows); the note says the insurers' own premium decision lies outside the view.
- **Dispatch answer rebuilt** as `DispatchInput[]`: the go / no-go status (decided by a certifying technician in FN-008
  at PHY-005) and the charge-complete status cross IF-012 and IF-010; the weather-hold state (the duty manager's decision
  in FN-004), the flight plan (FN-003) and the assignment (FN-002) are made inside PHY-004, the hold from the weather data
  that cross IF-011 and the plan from the energy state that crosses IF-002; the release returns to the aircraft as
  INFO-008 over IF-002. Slide 9's bullets, notes, alt text and the lesson are computed from it, with a second
  misconception ("the weather service tells dispatch to hold") added.
- **Figure redrawn** (`AnswerW4Figure`): outside producers with the data they send and the interface, an operations-center
  panel holding FN-004 (by duty manager), FN-003 and FN-002 feeding FN-011, and the release arrow back to the aircraft (the
  aircraft is no longer disconnected). Render-checked in the exported PNG.
- INFO-002's decision names both deciders (n10).

**Proof that the check can fail (negative tests, `aerolinkCase.test.ts`).** (a) FN-017 given a new input from FN-005 (on
PHY-001) is reported `unlisted`; (b) FN-015's disruption input pointed at INFO-004, which does not reach PHY-007, is
reported `unlisted`; (c) INFO-007 removed from the view makes both FN-001 and FN-015 `unlisted`; (d) an input with its
source deleted appears in `unsourcedInputs()`. The dispatch-answer test checks every input against FN-011's inputs, their
`src`, the element they are produced on, the item and the route, and asserts that the hold does not cross IF-011.

## M2: the tool must accept what the lecture allows

Changed in `record.ts` (gate texts in `labBrief.ts`, shown in the tool and the lab instructions):
- **External consumers** accepted (`EXT-…`), and **AI producers** accepted (`AI-…`) with a new advisory `ai-producer`
  ("its card must say who reviews the output before it is used, and what the AI may not decide alone"); the
  `same-element` advisory now places an AI producer at its host, as the route rule says.
- **One-word concerns and concern IDs** accepted (`stakeholders` gate: a stakeholder plus a concern of at least one word,
  or a `CON-xxx` ID). A concern ID in the serves field is accepted too (Week 1 concerns are not in the Week 3 snapshot, so
  the form is accepted without an existence check; this is said in the code).
- The sweep below found further form-only rejections and removed them: purpose ≥ 5 words → ≥ 3 ("Who owns which
  element?" was rejected); serves required → only an unknown ID fails, none named is an advisory (`no-serves`), because
  the lecture asks for concerns, not needs; planning reason ≥ 5 → ≥ 3 words; decision question ≥ 5 → ≥ 3 ("Where should
  dispatch run?" was rejected); rationale ≥ 8 → ≥ 5; the chosen alternative matched ignoring case, spacing and a final full
  stop; item content ≥ 3 → ≥ 1 word; data and information ≥ 3 words each → ≥ 1 each but not the same text ("fault codes"
  was rejected; identical text now fails, which is the real defect); decision ≥ 5 → ≥ 2 words; AI outputs ≥ 3 → ≥ 1;
  oversight and failure ≥ 5 → ≥ 3.
- Tests in both directions (`record.test.ts`): accepted — `EXT-001` consumer, `AI-001` producer (advisory shown),
  "Noise", "CON-003", a four-word purpose, empty serves (advisory), a short planning reason, a four-word question, a
  five-word rationale, a re-cased chosen alternative, two-word data and decision, short AI card fields; rejected — unknown
  `PHY-099`, `EXT-099`, `AI-099`, a logical element as consumer, identical data and information, a one-word decision, an
  empty concern or stakeholder, an unknown NEED, a one-word purpose and form, "Fridges?", "Cheaper.", "none" as oversight.
  The fixture's report to funders now lists the funders' portal (`EXT-001`) as a consumer and still passes every check.
- Field labels in the tool: "Producers (PHY, EXT or AI IDs)", "Consumers (PHY, EXT or AI IDs)", "Their concern, in words
  or its ID (CON-001)", "Serves (…; optional)", and the external-systems legend now says producers or consumers.

### Every Week 4 hard gate and the lecture sentence that justifies it

Slide numbers are the registered decks (Session 1 = S1, Session 2 = S2). "Form" means the minimum the gate checks.

| Gate | Form checked | Lecture sentence that justifies it |
|---|---|---|
| Viewpoint `kind` | a view kind chosen | S1 slide 7: "Its minimum set is a course convention: the operational, functional, physical and enterprise perspectives … plus the information view the schedule requires." |
| Viewpoint `purpose` | written (≥ 1 word; was ≥ 3, gate sweep 2026-10-19) | S1 slide 7: "Each view still needs a purpose and the concerns it answers"; lesson: "write the purpose as the question it answers." (Shortest valid question in the lecture's style: "Who owns which element?") |
| Viewpoint `stakeholders` | a stakeholder and a concern (one word or CON-ID) | Lesson, choosing views: "write … the stakeholders and concerns it serves." |
| Viewpoint `serves` | only an ID not in the record fails | S2 slide 13: "Four view icons … around a central box labeled one register of IDs" and its note "know the relationships" (R62 p.345): a trace to a missing ID is a broken trace. Naming none is an advisory, because the lecture asks for concerns, not needs. |
| Viewpoint `form` | written (≥ 1 word; was ≥ 3, gate sweep 2026-10-19) | Lesson: "and its conventions: the form it takes and the element types it shows"; S1 slide 6: a viewpoint is "a specification of the conventions and rules for constructing and using a view" (R39w p.1678). |
| Function `name` | not the name of a logical or physical element | S1 slide 9: "The course naming rule: verb plus object, and never the name of an element." (One-word and thing-like names stay advisories.) |
| Function `io` | ≥ 1 input and ≥ 1 output | S1 slide 9: "So a functional view must say what goes in and what comes out"; slide 11: forgetting the inputs and outputs is a pitfall (R20b p.594). |
| Function `capability` | an existing capability | Lesson, applying the method: "trace each to a capability"; S1 slide 13: "Every capability has a function or a disposition." |
| Function `scenario` | an existing scenario, or a planning reason that is not just the label “planning” (was ≥ 3 words, gate sweep 2026-10-19) | S1 slide 11: "establish scenarios of functions before building the decomposition tree" (R20b p.594); slide 13: FN-013 "is a planning function, and we record the reason." |
| Function `group` | under a first-level function | Lesson, applying the method: "group them under three to seven first-level functions." |
| Function `known` | allocated requirements exist | S2 slide 13: one register of IDs (as for `serves`). |
| Allocation `logical` | an existing logical element | S1 slide 17 step: "Which technology-independent element performs it?"; slide 16: "no logical architecture" is a pitfall (R20c p.602). |
| Allocation `physical` | an existing physical element | S1 slide 17 step: "Which element implements that, in the Week 3 configuration?" |
| Allocation `consistent` | the physical element is reached by the logical one | S1 slide 17: "apply the check rule of the reference: a function’s physical element must be one its logical element is allocated to." |
| Allocation `criterion` | a criterion and a sentence (≥ 2 words, stated in the gate text; was ≥ 5, gate sweep 2026-10-19) | S1 slide 15: "every allocation carries one sentence naming its criterion and the ID it rests on." |
| Part: system requirements allocated | every REQ-SYS to a counted function or physical element | S1 slide 13: "All 12 AeroLink system requirements are allocated to a function"; S2 consistency check 3. |
| Decision `question`, `alternatives` (≥ 3), `chosen`, `rationale`, `links` | question and rationale written (were ≥ 3 and ≥ 5 words); `chosen` ignores list markers and any final punctuation incl. “?” (gate sweep 2026-10-19, confirmation N3) | S1 slide 18: "An architecture decision is an engineering record: question, alternatives, choice, rationale, and the needs and risks it is tested against"; S2 slide 15: "at least 1 architecture decision record with three alternatives." |
| Information `name` | a name and content | S2 slide 15: "at least 5 items, each with data and information, producer, consumer, decision and route" (an item must be identifiable). |
| Information `data-information` | both in words, not the same text | S2 slide 3: "data are raw unstructured values, and information is structured data in context that has been analyzed and interpreted" (R21 p.512). |
| Information `producer` | a physical, external or AI element in the record | S2 slide 4: "Producer: the element that creates it"; slide 6: "Some consumers and producers are AI capabilities." |
| Information `consumer` | a physical, external or AI element in the record | S2 slide 4: "Consumer: the element or AI capability that uses it"; slide 8: "The consumer is the element or capability that uses it for a named decision" (an external system that decides, such as the emergency services, is that element). |
| Information `decision` | written (≥ 1 word; was ≥ 2, gate sweep 2026-10-19: “Restock” is a decision) | S2 slide 4: "If you cannot name a decision, the item is data that has not yet been turned into information, or nobody needs it." |
| Information `decision-ref` | an existing FN, REQ or DEC | S2 slide 4: record "the function, requirement or decision record that decision belongs to." |
| AI `host` | an existing physical element | S2 slide 5: "An AI capability counts as the element that hosts it." |
| AI `function` | an existing function | **Basis now student-visible (gate sweep 2026-10-19):** the lab instructions step “AI capability card” says “the host element, the function it supports” (`week04Lab.ts`), and the lesson card paragraph and card table (`session2.ts`, `w4-lesson-ai`) now name the supported function. S2 slide 10 (worked cards: "hosted at … and supporting FN-008") and the lab brief method step. **Flag for faculty:** the card definition on S2 slide 7 lists inputs, outputs, oversight, failure modes and data quality but not the supported function; the gate rests on the worked example, not on that sentence. |
| AI `inputs` | existing information items | S2 slide 7: "the inputs, as information item IDs." |
| AI `outputs` | ≥ 1 word | S2 slide 7: "the outputs." |
| AI `oversight` | written, and not “none”/“n/a” (was ≥ 3 words, gate sweep 2026-10-19) | S2 slide 7: "the human oversight, who decides and what the AI may not do" (R31 p.1370). |
| AI `failure` | written, and not “none” (was ≥ 3 words, gate sweep 2026-10-19) | S2 slide 7: "the failure modes and their effects" (R31 p.1371). |
| Part minimums (5 viewpoints of the required kinds; 10/7 functions; 3 first-level; 4/3 logical, 4/3 physical; 1 decision; 5/3 items; 1 AI card) | counts | S2 slide 15 (lab brief), read from `labBrief.ts`. |
| Mission function | written; one word is an advisory (was ≥ 3 words, gate sweep 2026-10-19, confirmation N3: “Feed families” is verb plus object) | S1 slide 11: "at the top of the hierarchy the system is one central function, its mission, a black box" (R20b p.587). |
| AI usage statement | ≥ 12 words | Course-wide rule from the Week 1 template (DECISION_LOG A21), unchanged. |

Advisories (never block): mission one-word name (new, gate sweep 2026-10-19), function one-word name, thing-like name, no requirement; information no route, AI producer,
same element, personal content without sensitivity; viewpoint no need/capability/requirement named.

## Mo1: figures match their captions, alt text and walks

- **Scenario walk (slide 12)** is now a worksheet: each step's short text (`WalkStep.short`) with an **empty** function
  box and a person glyph on the three human-decision steps (SCN-001 A3, SCN-005 steps 2 and 7). No answer is on the slide
  face; the answers stay in the worked solution and in the lesson's text. Caption, alt text and figure walk rewritten to
  match.
- **Swimlane**: a line under the physical lane header now reads "16 aircraft · 4 hubs · 8 turnaround chargers"
  (computed); alt text and walk say exactly that.
- **Enterprise view**: all five agreements are drawn as labeled double dashed lines between their parties, with the
  electric utility, the aircraft manufacturer and the insurers drawn as boxes, and AG-2 between PHY-004 and PHY-005.
- **Information graph**: the caption and walk no longer promise decisions on the arrows; the class supplies each decision
  before it is revealed (as the notes already said). Alt text lists only what is drawn, including the dashed red route.
- **Evaluation matrix**: alt text and caption reduced to the two drawn columns; allocation and evidence are in the notes
  and the lesson table.
- **Answer figure**: redrawn (M1); the aircraft is connected by the energy-state and release arrows.
- Render check: `npm run lectures:pptx -- --week 4`, PNGs in `exports/lectures/.figure-cache/` inspected
  (`w4s1-scenario-walk`, `w4s1-allocation-swimlane`, `w4s1-enterprise-owners`, `w4s2-info-graph`, `w4s2-answer`,
  `w4s1-aerolink-views`).

## Mo2: concern coverage

CON-003 *Affordable fare* moves from the information to the functional viewpoint (FN-001 quotes the fare, REQ-SYS-012).
The logical viewpoint keeps only CON-005 and is justified by what it keeps open (make-or-buy and supplier choice), with
the honest statement that deleting it leaves **no** concern uncovered; CON-015 stays with the enterprise viewpoint (AG-4).
`onlyAnsweredBy()` computes the slide and lesson text: deleting the information viewpoint leaves one concern (CON-014).
Slide 8 and the lesson say that coverage is only as good as its assignments and that a reviewer checks each one. Tests
assert all of this and that removing VP-003 uncovers nothing.

## Mo3: the audit

Slide retitled "Auditing the view: two reference defects and one new gap"; bullets mark which is which. F1 now says the
reference had the service only in a note and that the fix refines it; F3 says it is in this week's proposed item. The
"nobody traced the flows" sentence is replaced with what happened: the reference's route check is tested but checks
interfaces, not what kind of element may produce or consume, which is a separate check. Figure title, examples-page intro
and findings caption follow.

## Mo4: evaluation

REQ-SYS-008 is now **open**: an information path exists, but an interface is not evidence of latency; a latency budget
across both hops is owned by Week 5 (notes and lesson say "an interface shows a path, not a time"). The consistency slide
now says AeroLink passes all four checks and that the incident route was found by the separate route check. The capacity
threshold is imported as `REQUIRED_CAPACITY` from the Week 3 case in both places (Week 2 does not export it).

## Mo5: assessment

`src/week4/Assessment.tsx` now carries four-level descriptor tables for the applied exercise (five criteria, 20 points) and
the graduate task (three criteria, 12 points), following the Week 2 pattern. The graduate task names the list: the aims of
a candidate physical architecture (SEBoK, Physical Architecture). The bike-share brief is written:
`docs/lectures/week04/WEEK4_APPLIED_EXERCISE_BRIEF.md` (four stakeholders with concerns, two scenarios, five capabilities,
six requirements, as the page says, plus instructor marking notes). It is an instructor document for release on the LMS.

## Mo6: quiz

Q1, Q6, Q9 and Q10 lengths rebalanced; Q6's key paraphrased away from the prompt; Q4 rewritten as four noun phrases
("which box names a physical element rather than a transformation?"), so grammar no longer gives the key; Q5 rewritten so
every option names two things; throwaways replaced (Q5c, Q7a, Q11c, Q12b, Q12d); absolute qualifiers removed from all
options (Q1, Q7d, Q10c) and the "and" cue removed (Q3, Q5). Key positions stay 3/3/3/3 and length ranks 3/3/3/3.
`quizWeek4.test.ts` adds the Week 3 rules (no key is a 1.4× / 0.7× outlier; "odd one out, else guess" ≤ chance), the
reviewer's measure (option farthest in length from the other three is the key in ≤ 3/12 items; now 0/12), a no-throwaway
and Q4 grammar check, an "and"/absolute-qualifier check, and a negative test that restores the pre-review texts and is
caught by all three length rules.

## Mo7: workload

`LAB4_PERSON_HOURS` gains a fixed 1.0 h row for Part 15 (viewpoints and the concern-coverage check). To stay honest at
about 8 h, the scenario walks and the allocation are re-estimated at 2.0 h each (four members each walk one scenario after
the first walk is done in class; ten allocations at about 12 minutes each). Team total 10.0 person-hours, 2.5 h each; team
of three 7.9 person-hours, 2.6 h each (within 0.1 h). The lesson grew to 6,554 words (0.7 h at 150 wpm), so the week
total is **8.0 h** for a team of four, and **8.1 h for graduate students**; the week page now states that 0.1 h overage
instead of hiding it (pending faculty review). The reviewer's point that 150 wpm is optimistic for a table-heavy lesson is
noted; the rate is kept equal to Weeks 1–3 so the weeks stay comparable. A test requires the Part 15 row.

## Mo8: commit consistency

As directed, `src/components/figures/registry.ts` is untouched (its Week 4 block will be committed with the Week 8 work).
The milestone report's status paragraph now records commit `44620ef`, the uncommitted registry block beside the Week 8
hunk, and the consequence that `44620ef` alone renders Week 4 slides without figures; its counts, gates and workload
lines are updated to the fixed package.

## Minor dispositions

- **n6 (live timing).** Kept: the 6-minute buffer absorbs the overrun the reviewer computed on slides 2, 12 and 17, and
  slide 12's spoken notes did not grow. The S1 title-slide note already tells the instructor never to shorten slides 12 or
  17 and which slides to shorten instead.
- **n9 ("[S01/S02]" in RB-12.1).** Inherited from the rubric register (Week 2 N19, a template-level item owned by the
  rubric source, not Week 4); the Week 4 rubric note already says RB-12.3's SysML part applies from Week 8.

## Gates (run 2026-10-19 from `learning-studio/`, shared working tree)

| Gate | Result |
|---|---|
| `npx tsc -b` | exit 0 on the final run. (An earlier run showed one error in another agent's untracked `src/content/lectures/week05/zprobe.test.ts`; no Week 4 error at any point.) |
| `npx oxlint src` | exit 0; warnings only (the repository's existing `only-export-components` pattern) |
| `npx vitest run` (full) | 1707 passed, 10 failed, 3 skipped. All failures are outside Week 4: `quizWeek5.test.ts` (8, another agent's in-progress Week 5) and the Week 7 / Week 11 activity tests (2 × 30 s timeouts, as in the review). Week 4 suites: 117 / 117 (case, timing, quiz, lab, record, tool, content). |
| `npx vite build` | ✓ |
| Student build (`vite build --mode student --outDir dist-student` + `scripts/check-student-build.mjs`) | PASS; Week 4 decks 22 / 19 notes slides, all empty in the student build |
| `npm run lab:md` | regenerated `WEEK4_LAB_INSTRUCTIONS.md` (the generator also rewrites the other weeks' files from their current sources; only Week 4's content changed) |
| `npm run lectures:pptx -- --week 4` | 22 + 19 slides; figure PNGs inspected |
| Playwright `e2e/week4-flow.spec.ts` (lock held as `week04-fixer`, workers = 1) | 6 / 6 |
| Playwright `e2e/lectures-week4.spec.ts` (lectures config) | 4 / 4, axe clean light and dark |

## Changed files

- `src/content/lectures/week04/aerolinkCase.ts`, `aerolinkCase.test.ts`, `labBrief.ts`, `session1.ts`, `session2.ts`,
  `timing.test.ts`
- `src/components/figures/LectureWeek4S1.tsx`, `LectureWeek4S2.tsx`
- `src/content/quizWeek4.ts`, `quizWeek4.test.ts`; `src/content/lab/week04Lab.ts`, `week04Lab.test.ts` (float tolerance)
- `src/content/week4Path.ts` (graduate overage stated)
- `src/workbench/week4/record.ts`, `record.test.ts`, `fixture.ts`, `Week4LabTool.tsx`
- `src/week4/Assessment.tsx`, `Examples.tsx`, `exampleParts.ts`
- `docs/lectures/week04/WEEK4_LAB_INSTRUCTIONS.md` (generated), `WEEK4_MILESTONE_REPORT.md`,
  `WEEK4_APPLIED_EXERCISE_BRIEF.md` (new), this file
- Generated exports: `exports/lectures/week04-*`, `public/lectures/week04-session{1,2}.pptx`

Not touched: `registry.ts`, the reference model, the register (no citation outside the register was needed: R20b p.591,
R20c p.599 and R48c p.146 are inside their ranges), and every Week 1/2/3/5/8–12 file.

## Gate sweep 2026-10-19 (cross-week “tool rejects valid short answers”)

Full before/after table and justification: `docs/lectures/GATE_SWEEP_2026-10-19.md` (Week 4 section). One row per
changed gate:

| Gate (`src/workbench/week4/record.ts`) | Before | After | Why |
|---|---|---|---|
| Mission function (`checkFunctionsPart`) | ≥ 3 words | written; one word is an advisory note | Confirmation N3: verb plus object (S1 slide 9) is two words; “Feed families” failed. |
| Viewpoint `purpose` | ≥ 3 words | written | “Who decides?” is a complete question; no slide sets a length. |
| Viewpoint `form` | ≥ 3 words | written | “Table” names the form; a length cannot check the element types. |
| Function `scenario` (planning reason) | ≥ 3 words | written, and not just “planning” / “planning function” | “Runs nightly” is a reason; repeating the label is not. |
| Allocation `criterion` sentence | ≥ 5 words | ≥ 2 words (stated in the gate text) | The lab asks for one sentence; “Same voltage.” is one. |
| Decision `question` | ≥ 3 words | written | “Fridges?” is a question. |
| Decision `rationale` | ≥ 5 words | written | “Cheaper.” is a rationale. |
| Decision `chosen` | strip only `.;:!` | strip list markers (`-`, `*`, `•`, `1.`, `1)`, `a)`) and any final punctuation incl. `?` | Confirmation N3: the gate text says final punctuation is ignored. Alternatives are counted after their markers are removed (three bare markers are not three alternatives). |
| Information `decision` | ≥ 2 words | written | “Restock” is a decision (S2 slide 4 asks for a decision, not two words). |
| Information `no-route` advisory | < 2 words | empty | Advisory only; “Radio” is a route. |
| AI `oversight` | ≥ 3 words | written, not “none”/“n/a”/“nobody” | “Manager approves” is oversight; “none” is the defect R31 p.1370 names. |
| AI `failure` | ≥ 3 words | written, not “none” | “False alarms” is a failure mode. |
| AI `function` | kept | kept; basis added to the lesson | Confirmation N2: lesson paragraph and card table now name the supported function; the lab step already did. |

Tests: `record.test.ts` (both directions for every changed gate) and `src/workbench/shortAnswers.test.ts` (Week 4 block).
`WEEK4_LAB_INSTRUCTIONS.md` regenerated (`node scripts/build-lab-md.mjs 4`). Export format unchanged
(`week4-model-inputs` v1).
