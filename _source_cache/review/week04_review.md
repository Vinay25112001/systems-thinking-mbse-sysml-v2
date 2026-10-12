# Week 4 independent review: Requirements engineering

Reviewer: independent adversarial review (not the author). Date: 2026-10-11.

**Scope**
- `learning-studio/src/content/weeks/week04.ts`
- `src/activities/week04.activity.tsx` and `src/activities/week04/*` (logic and tests)
- `docs/authoring/week04_notes.md`

**Checked against**
- `course.ts`
- `AUTHORING_GUIDE.md` and `schema.ts`
- `ASSESSMENT_RUBRICS.md` (RB-3, RB-12, RB-16)
- `LABORATORY_AND_CAPSTONE_PLAN.md` (L4, §C.2, B.5)
- Syllabus §11–12 and §14
- `WEEKLY_INSTRUCTIONAL_PLAN.md` Week 4
- `src/model/reference/week02–04.ts`

**Sources read in full** (via `python -I scripts/source_pages.py`, every register page):
- R13 p.557–567
- R48 p.141–147
- R54 p.328–332
- R55 p.365–374
- R49 p.149–151

The heuristics were probed with `node_modules/.bin/jiti` on scratch scripts kept outside the repo. No course or app file was edited.

## Verdict: **PASS WITH FIXES**

There are no critical defects.

**What holds up**
- Citation fidelity is high. Every page lands and the one quotation is exact.
- The worked budget arithmetic is correct.
- The critique set is honest about what heuristics cannot see, and the tests assert those claims.
- The classifier texts are pulled from the reference, so they cannot drift.

**What must be fixed**
- **Quality lab.** Its heuristics let plainly unverifiable requirements be recorded and audited as "clean". This contradicts the L4 acceptance rule, and the RB-3 rehearsal overstates proxy levels as a result.
- **Worked example.** The flagship worked example contains a success criterion that contradicts its own requirement.
- **Recurring Week 2 defects:**
  - the graduate memo is graded only through RB-16 sampling;
  - its time budget is implausible;
  - the lab tool cannot record the owner or the AI-suggested-reviewed tag that the module requires.

Counts: **critical 0 · major 5 · minor 12**.

## Tool runs (from `learning-studio/`)

| Command | Result |
|---|---|
| `npx vitest run src/activities/week03 src/activities/week04 src/content` | **6 files, 131 tests passed** (exit 0). |
| `npx tsc -b` | **exit 2**: 2 errors, both in `src/sim/zz_tmp.test.ts` (TS2591). This file was created during the review by another author. No error is in a Week 4 file. |
| `npx oxlint` on the Week 3/4 activity and content files | no output (clean). |

## Findings

| ID | Sev. | Location | Finding | Evidence | Recommended fix |
|---|---|---|---|---|---|
| W4-F01 | major | `quality.ts` `checkRequirement` (vague, measurable, method-fit, criterion); `trace.ts` `RB3_PROXY`, `clean`; w4-lab "it will not record a requirement with a failing check"; L4 acceptance | **Unverifiable requirements pass the quality lab with no failing check.** Three heuristics fire only on easy cases. **(a) Any number followed by a count noun turns a vague-term fail into an advisory.** "The aircraft shall be safe and quiet for 4 passengers." is recordable because "4 passengers" matches `NUM_UNIT`. **(b) Typing a requirement as functional or constraint switches off the measurable and method-fit failures.** "The system shall support the operations." (functional, inspection) is recordable. So is "The scheduling function shall assign an aircraft within 60 s" when re-typed functional and verified by demonstration. **(c) The success criterion is only an advisory.** "The fleet shall achieve the highest availability possible." passes the vague check, because neither "highest" nor bare "possible" is on the list. **Why it matters.** All of these count as "clean" in the trace checker and as *met* for RB-3.1/3.2 in the rehearsal. L4 requires "a measurable criterion (or a TBD with an AROU entry)" for **every** requirement, and RB-3.2 asks for a "measurable criterion or explicit TBD/TBR". The tool's own header (`trace.ts`) claims to follow that rule. | Probe output: `"The aircraft shall be safe and quiet for 4 passengers." performance test recordable=true fail=` (none). `"The system shall support the operations." functional inspection recordable=true`. `"The fleet shall achieve the highest availability possible." functional analysis recordable=true`. LAB L4 acceptance: "Every requirement has one 'shall', a measurable criterion (or a TBD with an AROU entry) …". | Make a missing success criterion (or TBD) a **fail** for every type, matching the L4 rule. Keep vague terms a fail unless the vague word is itself bounded by the value. Restrict `NUM_UNIT` count nouns, or exclude them from the "measurable" test when a vague term is present. Add "highest", "lowest" and "possible" to the vague list. Add the probes above as regression tests. Reword the lab's "will not record a requirement with a failing check" so it does not suggest compliance. |
| W4-F02 | major | `reference/week04.ts` REQ-SYS-005 (statement vs `criterion`); w4-worked-chain ¶3 "Its criterion (99 % of requests within 60 s) is quantitative, so the method is test"; q4-4b, q4-7c | **The model requirement's success criterion contradicts its statement.** The statement says "assign … to **each** confirmed ride request within 60 s", which means 100 %. The criterion accepts **99 %**. A system that misses 1 % of requests passes verification while violating the requirement. This is the disagreement R55 says the criterion exists to prevent. The worked example presents the pair as a model, and the 60 s / 6.7 % rationale is built on it. | `week04.ts` reference line 90–91: statement "to each confirmed ride request within 60 s"; criterion "Confirmation-to-assignment <= 60 s for 99 % of requests". R55 p.370: "the verification requirement should include an expanded test criteria description to ensure that there is no disagreement later". | Make the two agree. One option is "shall assign … to at least 99 % of confirmed ride requests in each month within 60 s", with the criterion unchanged. The other is to keep "each" and make the criterion 100 % over a stated trial set. Use the corrected case in the lesson as a deliberate lesson on criterion and statement consistency. |
| W4-F03 | major | assignment `weight` "graduate memo counts toward the review notebook (RB-16, 5 %)", `rubricScope` "Memo: RB-16.1" | **The graduate memo may never be read (W2-F06 again).** The memo is the main evidence for the graduate expectation. RB-16 has the grader read **3 random weekly entries** plus the final reflection, so in most cases nobody reads the memo. RB-16.1 scores generic "engineering reasoning", not whether the checklist was applied correctly. | ASSESSMENT_RUBRICS RB-16: "the grader reads **3 randomly chosen weekly entries** plus the final reflection." | Make the memo an always-graded item. Either exempt it from sampling, or score it within the formative L4 or CP2 (RB-3.5 or 3.6) with a short R55-checklist criterion. Apply the same fix as for Week 2 so the course is consistent. |
| W4-F04 | major | `workload` "Graduate R55 checklist memo, including extension reading R55 (10 pp) — 0.5 h" | **The memo's time budget is implausible (W2-F07 again).** At the module's own 15 pp/h, reading R55 alone takes about 0.67 h. The memo also has to walk every Table 1 item (about 14) against 15–20 requirements, give a verdict, evidence IDs and a change for each, and argue one disagreement. The week total (9.0 h) matches the syllabus only because this line is compressed. | R55 p.365–374 = 10 pp; template §5. | Re-estimate at about 2 h for graduates. Rebalance or report the overrun under FD-22. Or narrow the memo, for example to the six checklist items most relevant to the team set. |
| W4-F05 | major | `quality.ts` `buildBatch` (`provenance: 'team-derived'`, no owner); `Draft.newUnknown` | **The lab tool cannot record the owner or AI provenance that the module requires.** Template §1 asks for an **owner** column. §6 and `aiUse` require AI-suggested requirements to be "tagged AI-suggested-reviewed and owned by a named team member". The advanced block says "This is why each L4 requirement has an owner". RB-12.3 scores the tagging. The quality lab, the only route the lab gives for recording, writes every REQ as `team-derived` with no owner. A new Unknown is created with only name, text and owner. The lab and worked example (c) also require "the resolution work and a need-by date", and the reference U-002 has both. | `quality.ts:282` `provenance: 'team-derived'`; `Draft` has no owner; `newUnknown: { name; text; owner }`. LAB §C.2 rule 5: every element has an owner and a provenance tag. | Add an owner field and the Week 2 provenance selector to the quality lab, and show both in the trace-checker table. Add resolution and need-by fields to the new Unknown and make them required. |
| W4-F06 | minor | w4-worked-chain ¶2 "the worst admissible arrival state, which is the 20 % energy reserve that every flight plan protects (REQ-SYS-003)"; REQ-SYS-001 rationale | **The "worst admissible arrival state" claim contradicts the reference's own rationale.** REQ-SYS-003 only **plans** a 20 % landing reserve. Its rationale says that reserve "covers a hold or a diversion", and SCN-002 A1 and SCN-005 step 4 divert *within* the reserve. Diverted aircraft therefore land below 20 %. REQ-SYS-001 ("from any landing state … at or above the 20 % reserve") leaves their turnaround unspecified. The lesson does not mention this, although Week 3 stressed off-nominal scenarios. | `reference/week04.ts` REQ-SYS-003 rationale: "The 20 % reserve … covers a hold or a diversion to the nearest open vertiport in SCN-002 A1 and SCN-005 A1". | Say "worst **planned** arrival state". Add a sentence, or a second requirement, for arrivals below the reserve, for example an extended turnaround allowance. A good graduate discussion point. |
| W4-F07 | minor | misconception 3 "Every requirement needs a test"; w4-attributes ¶2 (provenance `source-paraphrase`); w4-wellformed ¶2 | **A required reading appears to contradict a target misconception, and the module does not address it.** R54 says "All requirements must be testable". The module quotes the next sentence of R54 but not this one. A student reading R54 will see an apparent contradiction with "'Every requirement needs a test' is therefore wrong". The resolution is that "testable" in MITRE's sense is not the same as the *Test* method. Separately, w4-attributes is tagged `source-paraphrase` but ends with the instructor's own inference. It should be `mixed`. | R54 p.329: "Testable: All requirements must be testable to demonstrate that the end product satisfies the requirements." | Quote R54 and explain the distinction (testable = verifiable by some method). Re-tag w4-attributes as `mixed`. |
| W4-F08 | minor | `quality.ts` `binding` check; w4-application ¶1; Week 3 `needs.ts` `REQUIREMENT_WORDS` | **Weeks 3 and 4 treat "must" in opposite ways.** Week 3's need studio treats "must" as requirement wording that makes a need a requirement (a fail). Week 4 teaches that "must" is **not** legally binding (R55 p.369) and gives it only an advisory. Students moving from L3 to L4 get contradictory feedback on the same word. | R55 p.369: "Other words like 'will,' 'may,' 'should,' and 'must' may show intent but are not legally binding". `needs.ts:27` `/\b(shall\|must\|…)\b/`. | Explain in Week 4 that "must" marks requirement-like intent (so it is kept out of needs) but is not a binding provision (so use "shall"). Align the two messages. |
| W4-F09 | minor | q4-3, q4-5, q4-9, q4-10, q4-11, q4-12 | **Quiz answers are revealed by the lesson or activities, and Bloom levels are inflated.** <br>• q4-9's stem is F3 verbatim, and the lesson ("Read F3 carefully") and the quality lab give the answer. <br>• q4-10 is F6 verbatim, with the keyed rewrite shown in the critique table. <br>• q4-11 (REQ-SYS-009) and q4-12 (REQ-STK-002/SYS-002) repeat classifier items whose key and reasoning the classifier displays. <br>• q4-3 ("Analyse") is the lesson's 7-min what-if with 8 min, so a single subtraction. <br>• q4-5 ("Analyse") has two "… only" distractors and is recognition at most. | `critique.ts` F3/F6 `flawed`; `classify.ts` REQ-SYS-009 / REQ-STK-002 `why`. | Write fresh requirements for the quiz (for example a maintenance or ANSP requirement). Re-tag q4-3 and q4-5 honestly (Apply / Understand). |
| W4-F10 | minor | q4-6 (cites R49), q4-10 and q4-12 (cite R55); w4-attributes ¶2 | **The quiz depends on readings students were not assigned.** The four verification methods, which are central to B4.2 and misconception 3, are taught only from R49, which is not a Week 4 reading (cautions[2] admits this). Q4 also cites R55, an extension reading. | `course.ts:96–97` readings R13, R48, R54; extension R55. | Add R49 p.149–150 (about 1.5 pp) to the Week 4 readings, or make the lesson self-sufficient and say so. |
| W4-F11 | minor | `quality.ts` `SOLUTION` regex; w4-worked-critique ¶1 | **The design-free check is triggered only by the word "using", not by design content.** It fires only on "using / by means of / via a …". F3 is flagged only because it contains "using". "The charging system shall provide two 350 kW DC fast chargers per hub pad." and "The vertiport shall be equipped with a Brand-X fire suppression system." both pass design-free. Students may learn that deleting "using" fixes a design-laden requirement. | Probe output: both statements, `design-free` = pass, recordable. | Add a lexicon of equipment, brand and rating patterns like Week 3's `SOLUTION_TERMS`, or reuse it. Add the "provide two 350 kW chargers" variant to the F3 note as a case that only a reviewer can catch. |
| W4-F12 | minor | `quality.ts` `tbx` check, `buildBatch` | **The TBX check accepts any U-/A- item, not the one that owns the TBD.** Linking U-001 to a TBD-02 requirement passes. Linking an **Assumption** passes even though, in SEBoK, a TBD is an unknown value. Only the first TBX token is recorded (`tbxToken`), so a requirement with both a TBD and a TBR loses one. | `tbxItems = d.arou.filter(id => ['U','A'].includes(kindOfId(id)))`; no comparison with the item's `tbd` attribute. | Check that the linked item's `tbd` attribute equals the token, or prompt for it. Record all TBX tokens. Allow A- items only for TBR, where a value is known but doubted. |
| W4-F13 | minor | w4-wellformed ¶3; w4-types ¶1; q4-10 option a explanation | **Three small overclaims.** <br>• "SEBoK makes the same distinction" about statement-level versus set-level characteristics: R13 p.566 only mentions "individual requirements and sets of requirements", without assigning characteristics to either. <br>• The four types are "taken from MITRE's checklist", but R55's fourth item is "a reference such as to an interface definition", not an interface *type*. Cautions[3] half-admits this. <br>• "the start event … removes the ambiguity (R55 p.370)": R55 p.370 is about ranges and does not discuss start events. | R13 p.566: "do the individual requirements and sets of requirements have the characteristics…"; R55 p.368: "or a reference such as to an interface definition". | Soften to "consistent with"; "adapted from"; and "start event: instructor's point". |
| W4-F14 | minor | `reference/week04.ts` REQ-SYS-008 rationale | **The REQ-SYS-008 rationale is unsupported and partly inconsistent.** It claims "A 2 min flag is shorter than the shortest possible dispatch sequence". No dispatch-sequence duration is defined anywhere, and REQ-SYS-005 assigns aircraft within 60 s. If REQ-STK-006's interlock reads the unavailable flag, there is a window of up to 2 min in which a faulted aircraft can still be released. | REQ-SYS-005 "within 60 s"; REQ-SYS-008 "within 2 min". | Give the dispatch-sequence minimum (FICTIONAL) in the rationale, or make the interlock read the fault report directly. |
| W4-F15 | minor | reference set; answerKey[3] "Strong team sets show … interface requirements for the ANSP, emergency services and utility"; L4 artefact "REQ-SYS … (or a CAP, with justification)" | **The reference set falls short of its own marking guidance.** <br>• It has no utility interface requirement (REQ-STK-010 and SYS-010 are typed constraint) and no weather-data interface, although REQ-SYS-004 depends on forecasts. <br>• Its type mix is 11 performance, 4 constraint, 3 functional and 2 interface, which is hard to call "balanced" under RB-3.5. <br>• REQ-SYS-003 derives directly from CAP-004 and the rationale gives no justification, although the lab requires one. | `reference/week04.ts` parents `['REQ-SYS-003', ['CAP-004']]`; type attributes. | Add a utility or weather-data interface requirement, or mark the gap as a deliberate teaching point. Add the skip-level justification to REQ-SYS-003's rationale. |
| W4-F16 | minor | lab `inputs` "AROU v0 from L2" | **Wrong lab input.** CP1, the week before, produced **AROU v1**. | Week 3 lab artefact "AROU v1 (≥ 4 entries…)". | Change to "AROU v1 from CP1". |
| W4-F17 | minor | repo state | **The repo does not meet the definition of done.** `tsc -b` exits 2 because of another author's temporary file (`src/sim/zz_tmp.test.ts`). | tsc output. | Re-run after the file is removed. |

## Citation table

| Location | Citation | Verdict | Evidence (page, ≤ 25 words) |
|---|---|---|---|
| w4-levels quote | R13 p.557 | OK (exact) | "Defining requirements is not only an exercise in writing it is also an exercise in engineering." |
| w4-levels ¶1 | R13 p.557–558 | OK | p.558 needs "external, black box view"; requirements "internal white box view"; coffee-maker pair |
| w4-levels ¶2 | R13 p.558–559 | OK | "more than changing the subject of the need statement"; NRM definition "agreed-to obligation"; p.559 "may result in multiple requirements" |
| w4-levels ¶3 | R48 p.141–143 | OK | p.141 "requirements creep, rework …"; p.142 "specificity, completeness, consistency, measurability, testability and feasibility"; p.143 "Rationale for specification requirements" |
| w4-levels ¶4 | R13 p.558, 562 | OK | p.558 "the SoI could exist at any level of a system architecture"; p.562 "child requirements of an allocated parent" |
| w4-wellformed ¶1 | R48 p.143–144 | OK | attributes list p.144; "Poorly written requirements can lead to significant problems" p.143 |
| w4-wellformed ¶2 | R54 p.329–330 | OK; omits "All requirements must be testable" (F07) | "A requirement reflects 'what' the system shall accomplish, while the design reflects 'how'" |
| w4-wellformed ¶3 | R13 p.566; R55 p.367 | R13: OVERCLAIM (F13); R55: OK | R55 p.367 "Exhaustive and excessive use of 'shall' statements can be constricting and costly." |
| w4-attributes ¶1 | R13 p.559, 566 | OK | attributes list p.559; "A best practice is to do early planning for how the project will perform system verification" p.566 |
| w4-attributes ¶2 | R49 p.149–150; R55 p.370 | OK (R49 is not an assigned reading, F10) | R55 p.370 "Every requirement must have a verification method identified"; R49 method definitions |
| w4-attributes ¶3 | R55 p.371; R13 p.566 | OK | "cross-reference the source … and also to reverse reference"; requirement verification vs validation |
| w4-types ¶1 | R55 p.368 | OK, adapted (F13) | "a function …, performance a function must provide, a constraint on the design, or a reference such as to an interface definition" |
| w4-types ¶2 | R13 p.560 | OK | "for the set of requirements to be complete each category topic in Table 1 must be addressed" |
| w4-types ¶3 | R13 p.562–563; R54 p.331; R55 p.369 | OK | R13 p.563 "specific form or template for a functional requirement"; R54 p.331 hidden external interfaces; R13 p.562 budgets |
| w4-worked-chain | R13 p.558–559, 562; R49 p.149–150 | OK (criterion defect F02; reserve claim F06 is the instructor's) | — |
| w4-worked-critique | R48 p.144, 146; R54 p.329–330; R55 p.367, 370; R13 p.565–566; R49 p.149 | OK | R48 p.146 "derived requirements come from solution decisions … ensure that they are traceable" |
| w4-worked-tbd | R13 p.565 | OK | "When a value is determined but confidence is low … 'To Be Resolved' (TBR)"; TBX management definition |
| w4-advanced ¶1 | R55 p.371–372 | OK | cargo-space example; "detail requirements become a permanent part of the top-level system requirements for all future upgrades" |
| w4-advanced ¶2 | R55 p.368 | OK | "it is impossible to guarantee detection 100 percent of the time" |
| w4-advanced ¶3 | R55 p.370 | OK | "Avoid the phrase 'shall not.' It is very difficult to prove a negative."; threshold vs goal example |
| w4-advanced ¶4 | R55 p.372–373 | OK | argument list and sources; "Choosing clear requirements language is a good starting point." |
| w4-application ¶1 | R48 p.142; R55 p.369 | OK | R48 p.142 "The authoritative source for stakeholder requirements are documents produced via the JCIDS such as the ICD and the CDD" |
| w4-application ¶2 | R13 p.564, 567 | OK | model bullets p.564; artifacts list p.567 |
| q4-1 | R13 p.558 | OK | — |
| q4-2 | R13 p.558–559 | OK | — |
| q4-3 | R13 p.562 | OK | "Budgeted quantities result in requirements that have a dependency" |
| q4-4 | R54 p.329–330 | OK | "To state nonbinding provisions, use 'should' or 'may.'" |
| q4-5 | R48 p.144 | OK | "Singular"; "Unambiguous"; "Measurable/quantifiable" |
| q4-6 | R49 p.149–150 | OK (non-assigned reading, F10) | "Demonstration is used when quantitative assurance is not required" |
| q4-7 | R13 p.559 | OK | "the rationale attribute helps communicate why the requirement is needed, any assumptions made, the source of numbers" |
| q4-8 | R13 p.565 | OK | — |
| q4-9 | R54 p.330; R55 p.367 | OK | "leave as much 'white space' as possible" |
| q4-10 | R55 p.370 | OK for range and "minimize"; start-event claim not in source (F13) | "Avoid specific, one-point values" |
| q4-11 | R13 p.563; R54 p.331 | OK | — |
| q4-12 | R55 p.368 | OK | — |
| q4-13 | R13 p.560; R54 p.331 | OK | — |
| Misconceptions 1–5 | R54 p.330, R13 p.557, R55 p.367, R48 p.146 / R54 p.329 / R55 p.370, R49 p.149–150 / R13 p.566 / R13 p.558–559 | OK (3 leaves the R54 tension, F07) | — |
| Critique F1–F6 finding citations | R48 p.144; R54 p.329–330; R49 p.149; R55 p.370; R13 p.565 | OK | — |
| `quality.ts` check citations | R13 p.558, 559, 562, 565, 566; R48 p.144; R49 p.149–150; R54 p.329–330; R55 p.368–371 | OK | — |
| Cautions: R13 page offset | — | OK | PDF p.565 header shows printed "552" |

No NOT FOUND, no WRONG PAGE, no fabricated quotation. Overclaims: three minor (F13), plus the omission in F07.

## Verified as correct

**Arithmetic**
- 25 = 20 + 5 min.
- Handling what-ifs: 7 min leaves 18; 8 min leaves 17 (q4-3).
- 60 s / 15 min = 60 / 900 = 6.7 % (lesson, q4-7 "about 7 %").
- REQ-STK-004: 240 / 0.8 = 300.
- REQ-SYS-007: 25 km at 150 km/h = 10 min, + 6 = 16 min.
- Cycle: 16 + 25 + 2 = 43 min.
- REQ-SYS-009: 30 s is half of REQ-STK-008's 60 s.
- TBX share: 4 of 20 = 20 % (REQ-STK-003, REQ-SYS-004, REQ-STK-010, REQ-SYS-010).

**Reference set**
- 20 REQ: 10 STK and 10 SYS.
- No orphan and no childless NEED or CAP.
- No duplicate; all four types present; no failing heuristic check.
- REQ-STK-003 raises only the "shall not" advisory, as the lesson says.
- U-001 and U-002 are linked by `affects` to both TBD-01 requirements and both TBD-02 requirements.
- U-002 has an owner, a resolution and a need-by date.
- No ID collision with Weeks 1–3 or later reference layers.

**Critique set**
- Every heuristic that the worked example says is raised is raised; this is test-asserted.
- F3 passes the measurable check, as claimed.
- Each rewrite equals the reference text and raises no fail or advisory with the reference attributes.

**Classifier**
- 12 items covering all three levels and all four types.
- Keys equal the reference `type` attributes.
- A wrong level makes a right type "incorrect".
- The "defensible" alternatives match the answer key.

**RB-3 rehearsal**
- Bands match ASSESSMENT_RUBRICS RB-3 (≥ 90 → 4, 75–89 → 3, 50–74 → 2, < 50 → 1).
- The seeded sample is reproducible and independent of input order.
- The mutation (2 rationales removed) drops 3.3 to 80 % → level 3.

**Quiz**
- 13 items, each with exactly one correct option and an explanation for every option.
- Every objective is assessed (B4.1 ×3, B4.2 ×7, B4.3 ×3).
- 12 of 13 are tagged Apply or above, as the notes say (but see F09).

**Course structure**
- Sessions add up to 75 + 75 min.
- Workload sums to 9.0 h, equal to the syllabus §14 figure (but see F04).

**Accessibility**
- Every check shows a text label and a mark ("✓ Pass", "✗ Fail", "! Review", "– Not applicable"), not colour alone.
- Classifier verdicts are text ("Matches the key", "Defensible: argue it", "Does not match").
- All controls are native, labelled `select`, `input` and `button` elements.
- Tables have captions.

**Fictional values** are labelled throughout. New values (350 kW; 7 and 8 min what-ifs; 360-trip goal) are labelled in place.
