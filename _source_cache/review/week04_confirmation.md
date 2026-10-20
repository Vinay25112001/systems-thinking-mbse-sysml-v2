# Week 4 confirmation: Architecture / Information View (after fix commit b4311b5)

Reviewer: independent confirmation reviewer (not the author or the fixer). Date: 2026-10-19.
Inputs: `_source_cache/review/week04_review.md` (REVISE: 0 blocker, 2 major, 8 moderate, 11 minor) and
`learning-studio/docs/lectures/week04/WEEK4_REVIEW_DISPOSITIONS.md`, against HEAD `b4311b5` plus the shared working
tree. The Week 8 fixer and the Week 5 builder were working at the same time.

What I did and did not change:
- I edited no source file and committed nothing.
- I wrote one throwaway probe test (`src/workbench/week4/zz_confirm_probe.test.ts`, 45 cases) and one quiz-length
  script. I ran both and deleted both; `git status` shows no trace of them.
- Playwright ran under the `_source_cache/.playwright.lock` protocol. The lock was held by `week08-confirmation-fixer`,
  so I waited for it to clear, created the lock as `week04-confirmer`, ran with `--workers=1`, and deleted it afterwards.
- I did not touch the dev server on 5173.

## Verdict: **SIGN-OFF**

Both majors and all eight moderates are closed. Nine of the eleven minors are closed. The two that remain are
dispositioned acceptably (n6 timing buffer; n9 template-level).

**New findings: blocker 0 · major 0 · moderate 0 · minor 7 (N1–N7).** None of them blocks sign-off. N1 and N2 are
the ones worth fixing before the week is taught.

## 1. Per-finding table

| Finding | Status | Evidence (file:line at the working tree) | Disposition judged |
|---|---|---|---|
| **M1** data / decision / decider | **CLOSED** | See §2. `DISPATCH_ANSWER` `aerolinkCase.ts:655–671`. Weather data cross IF-011 and the hold is the duty manager's FN-004 decision inside PHY-004 (`:664`). The plan comes from FN-003, made from the energy state over IF-002 (`:665`). The release returns as INFO-008 (`:668`). `flowCheck()` `:625–642`; `unsourcedInputs()` `:644`. INFO-006 is re-scoped to the operations center's decision (`:496`). INFO-007…010 are at `:503–537`. Slide 9 notes `session2.ts:318–331` (with a new misconception, `:330`); lesson `:687`; figure `LectureWeek4S2.tsx:211–260`; exported PNG `w4s2-answer.png` inspected. | Sound. |
| **M2** tool rejects lecture-allowed entries | **CLOSED** | External consumers and producers, and AI producers, are accepted (`record.ts:430–440`). The `ai-producer` advisory is at `:446`. A one-word concern or a `CON-xxx` ID is accepted (`:296–297`). A word-minimum sweep followed (`:28–37`, `:385–399`). My probe confirmed all of this; see §3. | Sound. The gate table is audited in §3; N3–N5 are residual weak spots. |
| Mo1 figures vs caption / alt / walk | **CLOSED** | PNGs inspected. `w4s1-scenario-walk`: step text, empty function boxes, and person glyphs on A3, 2 and 7; no answers on the face. `w4s1-allocation-swimlane`: the line "16 aircraft · 4 hubs · 8 turnaround chargers" is drawn. `w4s1-enterprise-owners`: AG-1 to AG-5 drawn between their parties, with the three outside parties as boxes. `w4s2-info-graph`: the caption no longer promises decisions (`session2.ts:276`), and the alt text says "The decisions are not drawn" (`:277`). Evaluation caption reduced (`:414`). `w4s2-answer`: the aircraft is connected. | Sound. Cosmetic cramping noted in N7. |
| Mo2 coverage assignments | **CLOSED** | CON-003 is now in VP-002 (functional). VP-003 (logical) keeps only CON-005 (`aerolinkCase.ts:61–104`). `onlyAnsweredBy()` is at `:111`. A test asserts that removing VP-003 uncovers nothing (`aerolinkCase.test.ts:55–70`). | Sound and honest. |
| Mo3 audit slide | **CLOSED** | Title "Auditing the view: two reference defects and one new gap" (`session2.ts:369`). F1 "a refinement … not a reversal" and F3 "not in the reference" (`aerolinkCase.ts:698–700`). The "nobody traced" sentence is gone (grep: 0 hits). | Sound. |
| Mo4 evaluation | **CLOSED** | REQ-SYS-008 is `open`, with "an interface says nothing about latency" (`aerolinkCase.ts:687`). `REQUIRED_CAPACITY` is imported from Week 3 in both places (`aerolinkCase.ts:36`, `session2.ts:17`). The consistency slide says AeroLink passes all four checks and that the route was found separately (`session2.ts:457`). | Sound. |
| Mo5 assessment | **CLOSED** | Descriptor tables: 5 × 4 levels for the exercise and 3 × 4 for the graduate task (`src/week4/Assessment.tsx:17–30`). The graduate task names "the aims of a candidate physical architecture" (`:114`). The brief exists: `WEEK4_APPLIED_EXERCISE_BRIEF.md` has 4 stakeholders, 2 scenarios, 5 capabilities and 6 requirements, matching the page (`Assessment.tsx:87`). It has no AeroLink leakage (the only hit is the disclaimer, line 5). | Sound. See N6 (points scale). |
| Mo6 quiz cues | **CLOSED** | Recomputed independently. Keys a/b/c/d = 3/3/3/3. The key is longest 3/12 and shortest 3/12. The option farthest in length from the other three is the key in **0/12**. No key is a 1.4× / 0.7× outlier under the Week 3 rule. Q4 is four noun phrases. The throwaways are replaced. Q6 no longer echoes the prompt. The negative test restores the pre-review texts and is caught by all three rules (`quizWeek4.test.ts`, "negative direction"). | Sound. Residual soft cues are in N5. |
| Mo7 workload | **CLOSED** | Views row 1.0 h (`labBrief.ts:57`). Total 8.0 h; graduate 8.1 h, stated on the week page (`week4Path.ts` `WORKLOAD_SUMMARY`). Team of three: 2.6 h each. A test requires the Part 15 row. | Accepted, with a note: the 1.0 h was paid for by cutting walks and allocation from 2.5 to 2.0 h each. "Four members each walk one scenario" is a reason for less elapsed time, not for fewer person-hours. The estimate is now fitted to the budget, so it should be checked against the time logs. |
| Mo8 commit consistency | **CLOSED (substance)** | The `// --- week04 ---` registry block is now committed at HEAD (in `19ae781`). | Text is stale; see N4. |
| n1 p.592 → p.591 | CLOSED | `session1.ts:652, 657` | — |
| n2 non-discriminating criterion | CLOSED | FN-003, FN-013 and FN-016 `why` name the aim "adds no interface" (`aerolinkCase.ts:184, 238, 260`). | — |
| n3 provenance | CLOSED | LOG-002/004/005/007 are `corrected` (`aerolinkCase.ts:349–357`). AI-002 data quality is rewritten without the doubtful claim (`:576`). | — |
| n4 direct allocations note | CLOSED | `session1.ts:484`: a concept-level shortcut that Week 5 derives from (R48c p.146). The note is in the speaker notes, not on the slide face; that is acceptable. | — |
| n5 viewpoint vs view in records | CLOSED | `Week4LabTool.tsx:235`; `week04Lab.ts:129` | — |
| n6 live timing | Dispositioned | The buffer absorbs it. | Accepted. |
| n7 decision test | CLOSED | `ARCH_DECISION.tests[0]` now rests on fleet pooling (`aerolinkCase.ts:419`). | — |
| n8 capitalization | CLOSED | `Cap(numberWord(...))` (`session2.ts:420`). | — |
| n9 "[S01/S02]" | Dispositioned | Template-level item (Week 2 N19). | Accepted. |
| n10 INFO-002 decision | CLOSED | Both deciders are named (`aerolinkCase.ts:472`). | — |
| n11 hub derivation | CLOSED | Guarded by a test (`aerolinkCase.test.ts:133`). | — |

## 2. M1 in depth

**Data, decision and decider are now kept apart throughout.** I checked:
- slide 9 bullets, notes and alt text;
- the lesson's "driving question, answered" paragraph;
- the redrawn `AnswerW4Figure` (exported PNG);
- the Examples flow table (`Examples.tsx:96`).

The weather service sends data; the hold is the duty manager's decision; the plan is FN-003's. The S1 driving-question
slide still says "the forecast, from a weather source above". That is the question, not the answer, and the S2 answer
corrects it explicitly. That is good pedagogy.

**`flowCheck()` is a genuine check.**
- It derives each crossing from `FlowItem.src` / `dst` and `fn(src).phy` versus `f.phy`. The item list is never the
  source of the flows.
- It then requires the named item to have a producer at the source element and a consumer at the receiving element
  (`unlisted` otherwise). Then a covered route for that pair (`no-route` otherwise).
- `unsourcedInputs()` must be empty, which closes the "unseen input" blind spot.

**The negative tests genuinely fail** (`aerolinkCase.test.ts:257–280`). Each mutation is reported precisely:
- (a) a new FN-017 input from FN-005 is reported as `FN-017 PHY-001→PHY-004 unlisted`;
- (b) FN-015's input pointed at INFO-004 (which does not reach PHY-007) is reported `unlisted`;
- (c) removing INFO-007 reports both FN-001 and FN-015;
- (d) deleting a `src` is reported by `unsourcedInputs()`.

Each mutation is restored, and the final assertion re-checks a clean state.

**INFO-007…010 are sound.**
- INFO-007: a decision made at PHY-004 becomes the input to a different decision at PHY-007.
- INFO-008: plan and release go back to the aircraft.
- INFO-009: two-way, with two deciding parties, so both are consumers.
- INFO-010: the consumer is the external party that makes the decision.

Each has a covered route over an existing information interface.

**Two residual seams** (N1, N2) concern what the check does *not* verify. Neither falsifies the M1 fix.

## 3. M2: probe and gate-table audit

**Probe of the lab tool against the fixture** (45 cases, deleted after the run).

*Accepted, as the lecture allows:*
- an `EXT-001` consumer and an `EXT-001` producer;
- an `AI-001` producer (with the `ai-producer` advisory);
- mixed producers PHY + EXT + AI;
- lower-case IDs (`phy-004`) and an ID with words ("PHY-004 (scheduling software)");
- one-word data and information;
- a two-word decision;
- the concerns "Noise", `CON-003` and `con-003`; `CON-003` in serves; empty serves (advisory);
- a three-word purpose ("Who owns what?");
- function names with Unicode ("Réchauffer les plats"), hyphens and digits ("Re-ice 2 coolers"), one word ("Dispatch",
  advisory), and a function named like an external system;
- a re-cased chosen alternative with a final full stop;
- short AI card fields.

The fixture is still `ready` on all six parts.

*Rejected, as real defects:*
- a logical consumer;
- unknown `EXT-099` / `AI-099`;
- a consumer in words only;
- data identical to information (case and spacing ignored);
- an empty decision or an empty or unknown decision reference;
- an empty concern or stakeholder;
- an unknown `NEED-099`;
- a function named after a physical element (case-insensitive);
- no outputs; an unknown capability;
- an inconsistent allocation; a three-word justification;
- "none" as oversight;
- an AI card supporting an unknown function or a `DEC-001`.

*Form-only rejections the sweep missed* (all minor, each with a trivial non-degrading fix, so not a Week 2 M1
recurrence):
- **N3.** The `chosen` gate fails when the alternatives are written as a list: "- In the van …" or "1. In the van …"
  with chosen "In a refrigerator at each pantry". It also fails when the alternatives end in "?" (`record.ts:390`, which
  strips only `.;:!`). The gate text says "case and final punctuation ignored" (`labBrief.ts:146`), so "?" contradicts
  the tool's own wording. Fix: strip leading `-`, `*`, `•` and `n.`/`n)` list markers and any final punctuation in
  `same()`.
- **N4-gate.** The mission function needs ≥ 3 words (`record.ts:488`). The course's own naming rule is verb plus object
  (S1 slide 9), so "Feed families" or "Deliver food" fails Part 16. Two words is the shortest valid function name.
  (Listed in the table under N3.)

**Gate-table audit.** Each cited sentence was located in the decks, and the slide numbers were verified by counting
slides.

| Gate | Cited sentence found at | Judgment |
|---|---|---|
| Viewpoint kind, purpose, stakeholders, form | S1 s7, s6; lesson | Justified. The purpose ≥ 3 words is set by a lecture-style example. |
| Viewpoint serves (unknown ID fails) | S2 s13 "one register of IDs" | Justified (a broken trace). |
| Function name, io, capability, scenario, group, known | S1 s9, s11, s13; lesson | Justified. All sentences found on the cited slides. |
| Allocation logical, physical, consistent, criterion | S1 s15, s17 | Justified. |
| Decision question / alternatives / chosen / rationale / links | S1 s18; S2 s15 | Justified. The *implementation* of `chosen` is brittle (N3). |
| Information name | S2 s15 "at least N items, each with …" | **Weak citation.** That sentence is in the speaker notes only (`session2.ts:526`); the slide face shows counts. The gate is trivial (a name and content), so the effect is nil. |
| Information data-information, producer, consumer, decision-ref | S2 s3, s4, s6, s8 | Justified. |
| Information decision ≥ 2 words | S2 s4 "If you cannot name a decision …" | **Weak.** The sentence requires *a* decision, not two words. "Restock" is rejected. Defensible as "an action and what it acts on", but the gate text, not the lecture, makes that rule. Low cost. |
| AI host | S2 s5 "counts as the element that hosts it" | Adequate. That is the route rule; the requirement to *name* a host comes from the lab instructions (step 7). |
| **AI function** | S2 s10 "supporting FN-008" | **Weak, as the fixer flagged.** "Supporting FN-008" appears only in the S2 slide-10 *speaker notes* (`session2.ts:356`), which the student build strips. The card definition students see (S2 slide 7, and the lesson at `session2.ts:665`) omits the supported function. The lesson's AI card table has no "Supports" row (`:667`). The only student-facing basis is the lab instructions ("the host element, the function it supports", `week04Lab.ts:159`). See N2. |
| AI inputs, outputs, oversight, failure | S2 s7 | Justified. |
| Part minimums | S2 s15 / labBrief | Justified. |
| **Mission ≥ 3 words** | S1 s11 "one central function, its mission" | **Weak.** The sentence justifies having a mission, not three words, and it conflicts with the verb-plus-object rule (see above). |
| AI statement ≥ 12 words | Course-wide A21 rule | Justified (template). |

## 4. Regressions

- **Quiz.** See Mo6. `quizWeek4.test.ts` encodes the rules and has negative tests that fail on mutated copies:
  - pre-review texts → three outliers, an odd-one-out score above chance, and farthest-option hits above 3;
  - all keys longest → the rank rule fails;
  - unbalanced keys, a copied key and an AeroLink context are each detected.
- **Timing.** `timing.test.ts` asserts ≤ 130 wpm per slide, 68–70 minutes of content plus a 5–7 minute buffer = 75
  minutes, and the worked-slide minimums. It passes.
- **Workload.** 8.0 h for a team of four; 8.1 h for graduate students, stated on the page (`week4Path.ts`
  `WORKLOAD_SUMMARY`). See the Mo7 note.
- **Internal IDs.** No review codes (M1/Mo/n), `DECISION_LOG`, `RB-` or `new-pending-review` appear in student-facing
  strings: I grepped `src/week4/*`, `Week4LabTool.tsx`, the case data strings, and the slide bodies and lesson in
  `session1/2.ts`. Comments only.
- **Citations.** 388 `R..` citations in the Week 4 sources (sessions, case, labBrief, quiz, Assessment, Examples, lab,
  path) were checked by script against `readings.generated.json`. All 388 are inside their page ranges, including the new
  R20b p.591, R20c p.599, R48c p.146 and R21 p.515.
- **Bike-share brief.** It matches the Assessment page (counts and the five tasks). The marking notes model the
  consumer/decider distinction ("an answer that names the app as the consumer … with the decision 'where to rebalance'
  mixes up the consumer and the decider") and an external consumer (the contractor). There is no AeroLink content.

## 5. New findings

**N1 (minor). `flowCheck` does not verify that the named source function produces the item.**
- *What happens.* The check trusts `src: 'FN-xxx'` without matching it to that function's outputs. Three inputs name a
  source that does not list them:
  - FN-016's "pad incident records" names FN-010, whose only output is the alarm to EXT-006 (`aerolinkCase.ts:213, 257`);
  - FN-001's "weather and capacity status" names FN-004, whose only output is "dispatch hold placed or lifted"
    (`:172, 181`); FN-004 decides no capacity;
  - FN-015's "hold, diversion or cancellation decision" names FN-004, which neither diverts nor cancels.

  INFO-007 itself says "as decided at the operations center", so the decider of diversions and cancellations is left
  unnamed. That is the very distinction M1 is about, in a smaller form.
- *Also unchecked.* The `held` / `stakeholder` escape hatch could hide a real crossing; for example, FN-009's
  "maintenance slots" are `held` at PHY-004 although maintenance planning sits at PHY-005.
- *Failure scenario.* A student reading the Examples flow table asks "where does FN-010 output incident records?" and
  the case has no answer.
- *Fix.*
  - Add "incident record" to FN-010's outputs.
  - Name FN-002 or FN-017 (or the duty manager) as the source of diversions and cancellations, and add "capacity status"
    to a producing function.
  - Optionally add a test that every `src` function has an output whose text shares the input's key noun, or add
    `out` IDs.

**N2 (minor). The AI card "supports a function" gate has no student-facing lecture basis.**
- The fixer's flag is correct, and slightly worse than stated. The S2 slide-10 support is in speaker notes that the
  student build strips. The lesson's card definition and the card table both omit the field.
- *Failure scenario.* A student follows the lesson's card definition exactly, and the tool blocks the card with
  "choose the function it supports".
- *Fix (one line each).*
  - Add "the function it supports" to the slide-7 card bullet and to the lesson paragraph at `session2.ts:665`.
  - Add a "Supports" row to the lesson table at `:667`.

**N3 (minor). Two form-only rejections remain in the tool** (§3):
- the `chosen` match fails on list markers and a final "?";
- the mission needs ≥ 3 words although verb plus object is valid.

*Fix:* see §3. Add both directions to `record.test.ts`.

**N4 (minor). Mo8 text is stale again.**
- `WEEK4_MILESTONE_REPORT.md:4–9` says the review fixes "are uncommitted" and that the registry block is "only in the
  working tree … until then". Both were committed (`b4311b5`; registry in `19ae781`).
- The dispositions file (line 4) also says "Nothing is committed".
- *Fix:* update both to name `b4311b5` and `19ae781`.

**N5 (minor). Soft quiz cues remain** (no rule is broken):
- Q2: two distractors are very short (25 and 33 characters against 72 and 79), so "pick one of the two long options"
  halves the item.
- Q8: the key is the only full clause among three noun phrases.

*Fix:* lengthen Q2 a/d and make one Q8 distractor a clause, such as "The signaling system reports that train 14 has left
the junction".

**N6 (minor). The two individual tasks are scored on different scales.**
- The applied exercise is 20 points (5 × 4); the graduate replacement is 12 points (3 × 4).
- *Fix:* state how the 12 maps onto the 20, or add a criterion, so that grades are comparable.

**N7 (minor, cosmetic). Two figures are cramped.**
- `w4s1-allocation-swimlane`: three-line function labels touch the box edges (FN-008, FN-002, FN-015).
- `w4s2-answer`: the IF-002 release arrow runs along the bottom edge of the EXT-007 card, with its arrowhead in the gap
  above PHY-001, and its "IF-002" label sits right above the energy-state "IF-002" label.

  The meaning is clear from the caption, alt text and footer, but the arrow reads ambiguously at projection size.
- *Fix:* add 8–10 px of box height on the swimlane; route the release arrow into the top of the PHY-001 card, or draw it
  on the right-hand side.

## 6. Gates (run 2026-10-19 from `learning-studio/`, shared working tree)

| Gate | Result |
|---|---|
| `npx tsc -b` | Exit 2: **one error, Week 5 WIP** (`src/week5/Week5App.tsx(6,24)`: `./Assessment` not found; the Week 5 builder is in flight). No Week 4 error. |
| `npx oxlint src` | Exit 0. Warnings only: the repository's existing `only-export-components`, plus one Week 5 `immutability` warning. |
| `npx vitest run` (full) | 1826 passed / 3 failed of 1829. The three failures are all out of scope: Week 7 and Week 11 activity timeouts (30 s), and `lectures.test.ts` "every registered lecture validates", which fails only on Week 5 S2 `unknown-figure` entries (Week 5 WIP; no Week 4 entry). **Week 4 suites: 104 / 104** (case, timing, quiz, lab, record, tool). |
| `npx vite build` | ✓ |
| Student build (`vite build --mode student --outDir dist-student` + `scripts/check-student-build.mjs`) | **PASS.** The Week 4 decks have 22 / 19 notes slides, all empty in the student build. The instructor decks have 50,527 / 39,508 characters of notes. |
| Playwright `e2e/week4-flow.spec.ts` (lock as `week04-confirmer`, workers = 1) | **6 / 6** (dashboard, walk, lab-tool import/export, archive, axe light and dark at 1440 and 400 px) |
| Playwright `e2e/lectures-week4.spec.ts` (lectures config) | **4 / 4** (viewer, axe on every slide with notes light and dark: no violations, 400 px no horizontal scroll) |

## Recommended before teaching (not required for sign-off)

- N1 and N2 (one-line content fixes that tighten the M1 and M2 story).
- N3 (two gate relaxations, with tests).
- N4 (stale status text).
- N5–N7 at the author's discretion.
