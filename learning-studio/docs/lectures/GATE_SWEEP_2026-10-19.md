# Gate sweep 2026-10-19: "the lab tool rejects valid short answers"

The same defect was found in four weeks' independent reviews: Week 2 M1 (one-word subject), Week 4 M2 and its
confirmation N2/N3 (mission ≥ 3 words, decision ≥ 2 words, the chosen-alternative match, an AI-card gate justified only
by stripped notes), and Week 5 M2 (unstated word minimums rejecting "Fail safe", "Approved", "2 min"). This sweep checked
every hard gate of every team lab tool (`src/workbench/week1`, `week2`, `week3`, `week4`, `week5`, `week8`) that rejects
an entry by its length, its word count or its form alone.

**Rule applied.** A length or form gate stays only when a *student-visible* sentence (slide body, caption, alt text,
lesson, lab instructions, or the tool's own field label) makes the short entry a real defect, and the threshold is shown
to the student. Speaker notes and `purpose` are stripped from the student build and do not count. Otherwise the gate is
relaxed to "something is written", and where "none"/"n/a"/"later" can never be a valid answer, such empty answers are
still rejected (a content check, not a length check). Useful signals that are not defects became advisories.

**Kept as length gates** (each a stated sentence or paragraph, where no valid answer is shorter):
- one-sentence statements: at least a subject, a verb and an object (3 words; the Week 4 allocation sentence 2 words);
- the Week 1 suitability paragraph (40 words, stated in the lab: "a suitability paragraph of at least 40 words");
- the Week 1 L1 emergent-behaviour explanation (60 words, stated in L1 step 4);
- the AI usage statement (12 words, course-wide A21 template; stated in the tool field label and the Week 2–4 lab
  tables "At least 12 words; present even if no AI tool was used");
- the Week 8 purpose paragraph (15 words, stated in the lab step "Purpose first" and the readiness label).

**API and formats.** No record or gate function changed its signature; only behaviour was relaxed. Old constants
(`MIN_PART_WORDS`, `MIN_TEXT_WORDS`, `MIN_NARRATIVE_WORDS`, `MIN_REASON_WORDS`, `MIN_RATIONALE_WORDS`) remain exported
for compatibility. Export formats and versions are unchanged (`week1`…`week4-model-inputs` v1, `week8-import`), and
every file that was valid before is still valid. Owner fields keep the course's initials convention (2–4 letters,
stated in the charter field and messages): an ID-like key, not prose.

**Tests.** `src/workbench/shortAnswers.test.ts` is the shared, table-driven check: for each week it sets one field of a
passing fixture entry to a short valid answer (accepted) and to a real defect (rejected), through the real record API.
Each week's `record.test.ts` / `team.test.ts` / `needQuality.test.ts` was updated in both directions.

Line numbers are those of the working tree on 2026-10-19.

## Week 1 (`src/workbench/week1/team.ts`, `needQuality.ts`, `stakeholders.ts`, `logic.ts`)

### Changed

| Gate (file:line) | Before | After | Justification |
|---|---|---|---|
| Charter decision rules (`team.ts:252`) | ≥ 5 words | written, not an empty answer | "Majority vote" is a decision rule; no student-visible sentence sets a length. |
| Charter communication norms (`team.ts:253`) | ≥ 5 words | written, not an empty answer | "Discord daily" answers where and how often. |
| Problem statement, mission, system of interest (`team.ts:291`, `MIN_STATEMENT_WORDS`) | one sentence of ≥ 8 words | one sentence of ≥ 3 words (stated in the message) | Lab: "state the problem statement in one sentence; state the mission … in one sentence". "Feed every family weekly." is one sentence (4 words). Two words is not a sentence, so 3 stays. The single-sentence check is unchanged. |
| Goal (`team.ts:296`) | ≥ 4 words | written | "Cut food waste" is a goal. |
| Stakeholder concern (`team.ts:348`) | ≥ 5 words, then specificity | written, then specificity | "Noise after 10 pm" is specific in four words. The specificity screen (`isSpecificConcern`: not generic, at least one concrete detail; CONCERN_HELP and RB-1.3 are student-visible) is the real gate and is unchanged: "Noise" and "They want safety." still fail. |
| Rating reason (`team.ts:365`) | ≥ 3 words | written, not an empty answer | "Certifies vans" is a reason a reviewer can challenge. |
| Relationship note (`team.ts:402`) | ≥ 3 words | written, not an empty answer | "Noise vs. schedule", "Funds it". |
| Need structure (`needQuality.ts:260`) | ≥ 4 words | ≥ 3 words | "Families need food" with the condition in the condition field is a full need; who + need + what is three words. |
| Need object (`needQuality.ts:117`, `MIN_OBJECT_WORDS`) | ≥ 2 content words | ≥ 1 content word | "Drivers need routes before shifts" and "Families need the Pantry to feed them" were rejected as "no outcome". An object with no content word ("… need it when …") still fails. |
| Need rationale (`needQuality.ts:297`, self-check text `:41`) | ≥ 5 words | written | "Legal requirement" is why the stakeholder needs it. |
| Warning justification (`needQuality.ts:340`, labels in `TeamView.tsx:128`, `NeedsExercise.tsx:138`) | ≥ 5 words | written, not "ok"/"n/a"/"none" | "Regulator’s own term" justifies keeping a word; the field labels no longer state "at least five words". |
| In-class register concern (`stakeholders.ts:128`) | ≥ 5 words, then specificity | written, then specificity | As for the team register. |
| In-class register reason (`stakeholders.ts:132`) | ≥ 3 words | written | As above. |
| L1 boundary sentence (`logic.ts:204`) | ≥ 8 words | ≥ 3 words (one sentence) | As for the system of interest. |
| L1 rejected boundary (`logic.ts:206`) | ≥ 5 words | written | No stated length. |
| L1 charter rules and norms (`logic.ts:253–254`) | ≥ 5 words | written | As for the team charter. |

### Examined and kept

| Gate | Student-visible basis |
|---|---|
| Suitability paragraph ≥ 40 words (`team.ts`, `MIN_WHY_WORDS`) | Lab step "Proposal write-up": "a suitability paragraph of at least 40 words". |
| AI usage statement ≥ 12 words | Tool field label "(at least 12 words)"; course-wide A21 template. |
| L1 explanation ≥ 60 words and two loops named (`logic.ts`) | L1 step 4 states both. |
| Initials 2–4 letters (charter roles, owners) | Charter field and message; initials are keys for prefix ownership. |
| Context row "what crosses" (≥ 1 word) | Already non-empty only. |
| Need gates: subject in the register, no "shall", asked-for thing is not a solution, unique ID | S2-09 gate (R11 p.555, R53 p.296), student-visible in the lesson and the self-check. |

## Week 2 (`src/workbench/week2/record.ts`)

### Changed

| Gate (file:line) | Before | After | Justification |
|---|---|---|---|
| Requirement criterion (`:496`) | ≥ 3 words | written; trivial ("works", "is met") and vague-unanchored criteria still fail | "2 min", "Every delivery", "≤ 4 °C" are pass conditions (the Week 5 M2 example "2 min"). |
| Requirement rationale (`:529`) | ≥ 6 words | written, not an empty answer; restatement check unchanged | "Food must be kept cold." (5 words) was rejected although it says why. |
| Scenario name (`:592`) | ≥ 2 words | written | "Blackout" names a scenario. |
| Scenario trigger (`:604`) | ≥ 3 words | written, not an empty answer; the state-trigger advisory now runs on any trigger | "Power fails" is an event. |
| Scenario preconditions (`:606`) | ≥ 3 words | written ("None" is valid here) | "Shop open". |
| Alternate condition / response (`:622–623`) | ≥ 2 words each | written, not an empty answer | "Rain" / "Reroute". |
| Success / failure end state (`:635–636`) | ≥ 3 words each | written, not an empty answer | "Order delivered", "Fail safe"; "None" as a failure end state still fails. |
| ConOps system of interest, existing situation, justification (`:661`, `:663–664`, `:718`) | ≥ 8 words each | one sentence of ≥ 3 words (stated) | The ConOps asks for statements, not lengths; a short sentence can state each. |
| ConOps proposed system (`:666`) | ≥ 16 words | one sentence of ≥ 3 words (stated) | As above; the instructor judges completeness on RB criteria. |
| Discovery "what was found" (`:687`) | ≥ 5 words | written, not an empty answer | "Missing cold chain". |
| Register name (`:693`) | ≥ 2 words | written | "Grant". |
| Unknown closed by / assumption validated by (`:697–698`) | ≥ 3 words | written, not an empty answer | "Week 6", "Ask clinic"; "later" fails. |
| Added need statement (`:704`) | ≥ 8 words | ≥ 3 words (who needs what; stated) | Aligned with the Week 1 need structure gate. |
| Clinic revision reason (`:734`) | ≥ 3 words | written, not an empty answer | "Add support scenario". |
| Capability statement (`:761`) | ≥ 5 words | written | "Deliver meals". |
| Coverage reason (`:815`) | ≥ 5 words | written, not an empty answer | "Support-only need". |
| MOE/MOP definition (`:877`) | ≥ 5 words | written | "Delivery time". |
| MOE/MOP data source (`:880`) | ≥ 2 words | written | "Logs". |
| Audit disposition (`:905`, messages `:907–909`) | ≥ 5 words | written, not an empty answer | "Open: AB, Week 6" is the open-item form of S2.13; "later" still fails. |

### Examined and kept

| Gate | Student-visible basis |
|---|---|
| Subject accepted (`subjectAccepted`) | Review M1 fix: a one-word proper name or the enterprise/SoI name passes; pronouns fail (S1 slide on the obliged entity). |
| Unmeasurable, vague, TBD/TBR owned, performance value, parents | S2 gates (R13 pp.559–565, R55), each a defect a verifier rejects. |
| Owner 2–4 letters (scenario owner, register owner ≥ 2 characters) | Course initials convention, stated in the message. |
| ConOps environment ≥ 3 entries, restrictions/interactions/constraints ≥ 1 line | Counts, not lengths (MITRE components, lab Part 7). |
| AI usage statement ≥ 12 words | Lab table "At least 12 words; present even if no AI tool was used". |

## Week 3 (`src/workbench/week3/record.ts`)

None of these thresholds was stated in `labBrief.ts` gate texts; all were tool conventions.

### Changed

| Gate (file:line) | Before | After | Justification |
|---|---|---|---|
| Technology "does" (`:448`) | ≥ 5 words | written, not an empty answer | "Keeps food cold". |
| Basis: cited evidence (`:452`) | ≥ 3 words | written, not an empty answer | "Vendor datasheet". |
| Basis: assumption validation (`:456`), assumption register (`:760`) | ≥ 3 words | written, not an empty answer | "Site visit"; "later" fails. |
| Risk condition / if / then (`:505`) | ≥ 3 words each | written, not an empty answer, each | "Condition: old freezer. If power fails, then food spoils." was rejected on every part. Order, not-issue and no-mitigation gates unchanged. |
| Risk likelihood and consequence reasons (`:511`) | ≥ 3 words each | written, not an empty answer | "Happened twice". |
| Risk trigger (`:514`) | ≥ 2 words | written, not an empty answer | "Alarm". |
| Risk treatment (`:514`) | ≥ 3 words | written, not an empty answer | "Buy generator". |
| TPM basis (`:578`) | ≥ 3 words | written, not an empty answer | "Vendor test". |
| Trade decision statement (`:673`) | ≥ 8 words | written, not an empty answer; trace gate unchanged | The course form "How should [enterprise] [achieve objective X] given [constraint]?" (S2 callout) is itself 7 words when filled tersely; the trace to a REQ/MGO is the check. |
| Criterion weight rationale (`:687`) | ≥ 5 words | written, not an empty answer | "Range 2–6 h swung". |
| Sensitivity note (`:694`) | ≥ 5 words | written; **must state a number when the tool computed a reversal point** | The gate text asks for "the reversal point … stated": a note with no number states none ("see table" still fails); "Robust above 0.48" passes; "No reversal in range" passes when none was computed. |
| Recommendation residual risk (`:697`) | ≥ 3 words | written, not an empty answer | "Power cuts". |
| Unknown name / closed by (`:765`, `:768`); assumption, opportunity, issue names (`:758`, `:776`) | name ≥ 2 words; closed by ≥ 3 | written; closed by not an empty answer | "Grant", "Week 6". |
| Opportunity / issue text and action (`:777`, `:779`) | ≥ 5 / ≥ 3 words | written, not an empty answer | "New grant" / "Apply". |
| Screen test (`:861`), alternative description (`:865`) | ≥ 3 words | written, not an empty answer | "Fits in the van". |
| Advisories `no-limitations` (`:469`), `critical-why` (`:470`), `vague-event` / `vague-consequence` (`:524–525`) | ran only above a word count | run on any written answer | Advisory only. |

### Examined and kept

| Gate | Student-visible basis |
|---|---|
| TRL 1–9; maturity risk when critical below TRL 6 | S1 TRL scale and lab rule. |
| Risk not-issue, no-mitigation | S1 (R61a p.633, R46 p.125). |
| TPM numbers, objective side, profile, breach risk | S2 TPM slides. |
| Trade baseline, distinct, criteria trace, anchors, scores, recommendation | S2 trade slides and callouts. |
| Owner ≥ 2 characters | Initials convention. |
| AI usage statement ≥ 12 words | Lab table. |

## Week 4 (`src/workbench/week4/record.ts`, `labBrief.ts`; lesson `session2.ts`)

### Changed

| Gate (file:line) | Before | After | Justification |
|---|---|---|---|
| Mission function (`record.ts:501–502`) | ≥ 3 words | written; one word is an advisory note | Confirmation N3: verb plus object (S1 slide 9) is two words; "Feed families" failed Part 16. |
| Viewpoint purpose (`:299`; gate text `labBrief.ts`) | ≥ 3 words | written | "Who decides?" is a complete question. |
| Viewpoint form (`:307`) | ≥ 3 words | written | "Table" names a form; a length cannot check the element types. |
| Planning reason (`:326`) | ≥ 3 words | written, and not just the label "planning" / "planning function" | "Runs nightly" is a reason. |
| Allocation sentence (`:347–348`) | ≥ 5 words | ≥ 2 words, stated in the gate text and message | The lab asks for "a one-sentence justification"; "Same voltage." is one. One word ("flow") repeats the criterion and still fails. |
| Decision question (`:355`) | ≥ 3 words | written | "Fridges?". |
| Decision alternatives / chosen (`:356`, `:360`, helper `unlist` `:134`) | match stripped only `.;:!` | list markers (`-`, `*`, `•`, `–`, `1.`, `1)`, `a)`) and any final punctuation (incl. `?`) ignored; markers removed before counting alternatives | Confirmation N3; the gate text already said "final punctuation ignored". |
| Decision rationale (`:364`) | ≥ 5 words | written | "Cheaper." is a rationale. |
| Information decision (`:393`) | ≥ 2 words | written | S2 slide 4 asks for "a decision", not two words; "Restock" passes. |
| Information `no-route` advisory (`:398`) | < 2 words | empty | Advisory only. |
| AI oversight (`:418–419`) | ≥ 3 words | written, not "none" / "n/a" / "nobody" | "Manager approves"; "none" is the defect (human in the loop, S2 slide 7, R31 p.1370). |
| AI failure (`:420–421`) | ≥ 3 words | written, not "none" | "False alarms". |
| AI supports a function | gate kept | basis made student-visible | Confirmation N2: the lab step "AI capability card" already says "the host element, the function it supports" (`week04Lab.ts`); the lesson card paragraph and the lesson card table (`session2.ts`, `w4-lesson-ai`) now name the supported function (new "Supports" row). The slide face was not changed, so the exported decks stay current. |

Gate texts in `labBrief.ts` (`VIEWPOINT_GATES`, `ALLOCATION_GATES`, `DECISION_GATES`, `INFO_GATES`, `AI_GATES`) updated
to match; `WEEK4_LAB_INSTRUCTIONS.md` regenerated.

### Examined and kept

| Gate | Student-visible basis |
|---|---|
| Function name is not an element's name | S1 slide 9 naming rule. |
| Inputs and outputs, capability, group, known requirements | S1 slides 9, 11, 13; S2 slide 13. |
| Allocation logical, physical, consistent | S1 slides 16–17. |
| Alternatives ≥ 3 | S1 slide 18. |
| Data ≠ information (same text fails) | S2 slide 3 (R21 p.512). |
| Producer / consumer / decision reference exist | S2 slides 4, 6, 8. |
| AI host, inputs exist, outputs written | S2 slides 5, 7. |
| AI usage statement ≥ 12 words | Lab table. |

## Week 5 (`src/workbench/week5/record.ts`, `labBrief.ts`; review M2, n15)

Every Week 5 threshold is now in its gate's `short` text in `labBrief.ts`, so the generated gate table in
`WEEK5_LAB_INSTRUCTIONS.md` shows it. `MIN_PART_WORDS` (now 1) and `MIN_TEXT_WORDS` (now 2) keep their names.

### Changed

| Gate (file:line) | Before | After | Justification |
|---|---|---|---|
| Card responsibility (`record.ts:354–355`) | ≥ 3 words, not stated | ≥ 2 words, stated ("Charges aircraft") | Lesson: "the responsibility in one sentence"; a verb and its object is the shortest sentence. "Charges aircraft" failed. |
| Component responsibility (`:367–368`) | ≥ 3 words, not stated | ≥ 2 words, stated ("Raises alarms") | Same basis. |
| Interface protection or reason for none (`:411–412`) | ≥ 3 words, not stated | ≥ 1 word, stated ("TLS", "Power only") | S2 lesson: "A power cable carries no data, and saying so is a complete answer." "Power only", "TLS" failed. |
| Interface degraded mode (`:413–414`) | ≥ 5 words, not stated | ≥ 2 words, stated ("Fail safe") | The S2 slide face gives "**Fail safe**" as a degraded mode; it failed. One word ("Stop") still fails: the column asks what each side *does*. |
| Requirement criterion (`:48`, `:535`) | ≥ 3 words, not stated | two words, or one token holding a number or a TBD; stated | Week 2 rule: a measurable value or an owned TBD (R13 p.565). "2 min" and "TBD (Ops)" failed while "≤ 2 min" passed, so a typographic space decided. "Fast" still fails. |
| Change request change (`:552–553`) | ≥ 5 words, not stated | ≥ 2 words, stated ("Add encryption") | S2 worked example I, step Request: "state the change to one interface". "Add encryption to IF-006" failed. |
| Change request decision (`:558`) | ≥ 3 words, not stated | ≥ 1 word, stated ("Approved"); decider still required | S2 slide: "the owners decide"; "Approved" by the ICWG failed Part 22. |
| External with no interface: reason (`:652`) | ≥ 5 words, not stated | ≥ 1 word, stated ("No exchange yet") | The reference's own dispositions say exactly "No exchange yet", in more words; R55 p.369 asks that every external be accounted for, not for a word count. |
| Standards (`:690–691`) | ≥ 3 words, not stated ("None apply" failed) | ≥ 1 word; a bare "none" gets an advisory asking for the reason | DoD R47 p.140: the plan documents the preferred standards; "None" is an answer. Added to `PART_RULES` (n15). |
| Hidden-external advisory pattern (`:46`, `:418`) | network, internet, cloud, link, radio, satellite, leased, wifi, cellular | adds Wi-Fi, wireless, mobile, LTE, 3G/4G/5G, VPN, Bluetooth, API, web, online, SaaS, third-party, public | Review M1 (R54 p.331: radio). Advisory only, never a gate. |
| Import of method and kind (`normalizeRecord`) | exact lower-case only ("Test" dropped silently, so the method gate then failed) | trimmed and lower-cased | Review n19: a form-only rejection on import. |

New advisories (never gates): `owner-spelling` (an owner spelled differently from the end's card, n16) and
`no-internal-end` (both ends external, n17). New `PART_RULES` rows with a basis (n15): `icwg` (≥ 2 organizations,
R57 p.414), `standards`, `unique-ids` (IDs are the import keys).

### Examined and kept

| Gate | Student-visible basis |
|---|---|
| Component name, card owner, interface "what crosses", medium, owners, external name: ≥ 1 word | Already one word; "Hub", "Stripe", "Ops" pass. |
| Interface ends (two different ends, AI at its host) | Glossary p.1541; R20c p.597 ("binds two system elements"). |
| Interface kind; direction for physical and information | S1 "Typing interfaces"; "The interface definition table". |
| Requirement: exactly one "shall"; names an interface; method; parent exists | Week 2 rules; R13 p.563. |
| Change request: names an interface; ≥ 1 existing impacted ID; a decider | S2 worked example I; DoD p.140. |
| Part rules: externals, crossing flows and relays, security-risk link, ICWG ≥ 2 organizations, unique IDs | R55 p.369; R22 p.630; R25 p.1234; R57 p.414; "Keep your IDs stable: they are the import keys". |
| AI usage statement ≥ 12 words | Course-wide A21 template, stated in the lab. |

Tests: `src/workbench/week5/record.test.ts` (accept and reject for every changed gate, plus M1/n16/n17/n18/n19) and the
Week 5 block of `src/workbench/shortAnswers.test.ts`. Dispositions: `docs/lectures/week05/WEEK5_REVIEW_DISPOSITIONS.md`.

## Week 8 (`src/workbench/week8/skeleton.ts`, `state.ts`)

### Changed

| Gate (file:line) | Before | After | Justification |
|---|---|---|---|
| Package count for a kind not in the imported files (`skeleton.ts:455–461`, `countOf`; used at `:467`) | digits only (`/^\d+$/`) | a leading whole number ("12", "12 items", "3 (SCN-001 to SCN-003)") or "none"/"zero"/"no" (= 0); decimals and words without a number still do not count | The lab asks for the count ("count their IDs by kind"; "enter 0 if the package has none"); "12 items" or "none" left the readiness item open. |

### Examined and kept

| Gate | Student-visible basis |
|---|---|
| Purpose ≥ 15 words (`state.ts`) | Lab step "Purpose first": "Write one paragraph … (at least 15 words)", and the readiness label. |
| Dispositions written (non-empty only) | Already non-empty only. |
| Coverage, relationships, exports | Counts and generated content, not lengths. |

## Addendum (2026-10-19, after the Week 5 confirmation review)

The independent confirmation (`_source_cache/review/week05_confirmation.md`, after `41b2578`) audited this sweep. It
found one over-relaxation that breaks the sweep's own rule above ("where 'none'/'n/a'/'later' can never be a valid
answer, such empty answers are still rejected") and four minor inconsistencies. All five are fixed; every fix is tested
in both directions, and the mutation probe (Week 5 `partSaid` without the empty-answer check) fails 21 tests.

**One shared empty-answer check.** `src/workbench/emptyAnswer.ts` now holds the single `EMPTY_ANSWER` (ok, fine, yes, no,
n/a, none, nil, nothing, "-", "?", tbd, todo, later, see above) with `isEmptyAnswer` and `said`. Weeks 1, 2 and 3 import
it and re-export it under their old name `EMPTY_ANSWER`, so no public API changed (`shortAnswers.test.ts` asserts the
three exports are the same object). Week 5 imports `said` from it. Week 8 does not use it: its only free-text gate is a
count, where "none" means 0 (N4 below).

### Week dispositions

| Week | Finding | Gate (file:line) | Before | After | Tests (accept / reject) |
|---|---|---|---|---|---|
| W1 | N5 Minor | `EMPTY_ANSWER` (`week1/team.ts:45`, now the shared regex) | lacked `later` and `todo`: charter decision rules "later" counted | rejected, as in Weeks 2–3; "Majority vote", "Consensus" still pass | `shortAnswers.test.ts` W1 block: + "later", "todo" rejected |
| W2 | N3 Minor | Requirement criterion (`week2/record.ts:500`) | "none" counted (it anchors a phrase such as "none spoiled", and `TRIVIAL_CRITERION` lacked it) | an empty answer ("none", "None.", "-") fails like a trivial criterion; "2 min", "Every delivery", "≤ 4 °C" pass | W2 block: + "none", "None.", "-" rejected |
| W3 | — | `EMPTY_ANSWER` (`week3/record.ts:38`) | own copy | the shared regex (identical content: no behaviour change) | identity test |
| W4 | — | none | — | unchanged (the confirmation found no over-relaxation) | — |
| W5 | **N1 Moderate** | Protection and its reason (`week5/record.ts:435`), change-request decision (`:583`), external reason (`:677`), all through `partSaid` (`:61`) | ≥ 1 word: protection "none", "n/a", "-", reason "?", decision "n/a"/"?", external reason "?" counted | written and not an empty answer. "TLS", "Power only", "Approved", "No exchange yet" pass; "none" in Protection beside a real reason passes (the reason is the answer); the standards keep "None"/"None apply" (a valid answer there). The external reason "None" alone now fails: it does not say why there is no interface ("None needed: no exchange" passes) | `record.test.ts` "N1 (confirmation)" and externals-rule test; W5 block of `shortAnswers.test.ts` |
| W5 | (same) | Degraded mode (`:438`), responsibility (`:377`, `:390`), change (`:577`) | 2 words: "see above" counted | also not an empty answer | "see above" rejected for degraded and change |
| W5 | N2 Minor | Requirement criterion (`criterionOk`, `week5/record.ts:62`) | any one token with a digit or "tbd" ("TBD", "TBD later", "1"), or any two words ("Very fast") | the lecture's rule (labBrief `criterion`): a value with its unit counts however short ("2 min", "≤2min", "100%", "five working days"); any TBD/TBR needs an owner ("TBD (Ops)", "TBD: Ops lead"); otherwise two words not themselves vague unless anchored ("Every warning received"); Week 2's `TRIVIAL_CRITERION`, `valueIn` and `vagueTermsIn` are reused | `record.test.ts` "N2 (confirmation)": rejects "TBD", "TBD later", "TBD (later)", "TBD-1", "within TBD min", "1", "42", "Very fast", "none", "works" |
| W8 | N4 Minor | `countOf` (`week8/skeleton.ts:460`) | `no(?:ne)?(?: \w+)?` read "no idea", "no clue" as 0 | 0 only for "none", "zero", "nil", "no", "no items/entries/IDs/elements" | W8 block: + "no idea", "no clue", "No Idea.", "not sure" rejected; "no", "No items", "no entries", "nil" accepted |

The gate texts that a student sees now say so: `labBrief.ts` protection ("“none”, “n/a” or “-” is not an answer"),
decision ("“n/a” or “?” is not a decision") and criterion (the full rule), regenerated into
`week05/WEEK5_LAB_INSTRUCTIONS.md` (`node scripts/build-lab-md.mjs 5`). Export formats and versions are unchanged.
The Week 5 fixture still rates ready.
