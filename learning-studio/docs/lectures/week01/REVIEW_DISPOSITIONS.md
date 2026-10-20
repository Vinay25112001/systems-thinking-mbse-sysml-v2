# Week 1 lecture: dispositions of the independent review

**Review.** `_source_cache/review/week01_lecture_review.md` (2026-10-19, verdict REVISE: 0 blocker, 5 major, 15 moderate,
13 minor).
**Revision.** 2026-10-19. Status stays **new-pending-review** in every file. Nothing committed or pushed.
**Files changed.** `src/content/lectures/week01/session1.ts`, `session2.ts`, `aerolinkCase.ts` (+ `aerolinkCase.test.ts`,
`session2.test.ts`, new `timing.test.ts`); `src/components/figures/LectureWeek1S1.tsx`, `LectureWeek1S2.tsx`,
`registry.ts` (11 new figures); content model and pipeline (`types.ts`, `validate.ts`, `markdown.ts`, new
`references.ts`, `lectures.test.ts`, `src/lectures/SlideFace.tsx`, new `src/lectures/ReferencesFace.tsx`, `lectures.css`,
`scripts/build-lectures.mjs`, `docs/lectures/PIPELINE.md`); register entry R39l (`_source_cache/verification/readings.py`,
`readings_verified.txt`, `src/content/readings.generated.json`, `content.test.ts` count 114 → 115);
`AEROLINK_CASE_CHANGES.md`; the outline header; the Week 1 lesson workload row (`src/content/weeks/week01.ts`) and the
regenerated `WEEK1_LAB_INSTRUCTIONS.md`.

## Dispositions

| Finding | Severity | Disposition |
|---|---|---|
| F01 time budget | major | **Fixed.** Each session plans 69 min of content plus a recorded 6-min buffer (`bufferMinutes`, shown in the notes’ timing plan; validator: slides + buffer ≤ 75). Spoken notes ≤ 130 wpm on every slide (max 96; `timing.test.ts`). Worked example I is 6 min with student contributions at every step; the audit is 4 min with pairs finding the second tension. Moved to the lesson: three definitions of system, the context types, the boundary vocabulary, the program-level IPT detail, the Week 2/8 bridge. Lab: charter cut to an 8-min scope (roles, tie-break, lead candidate); pitch 10 min for five teams, more than five decided on the LMS within 48 h. |
| F02 incoherent conflict | major | **Fixed.** NEED-003 now bounds noise **exposure**: the loudness of each event **and** the number of events in the evening and early morning (from CON-012). Shared variable: take-offs and landings per pad in those hours. Noise agreement terms recorded (65 dBA per event; sensitive hours and event cap proposed). Adjudication shown on the slide, the figure and the lesson from `CONFLICT` (single source). |
| F03 systems named after organizations | major | **Fixed.** EXT-001 Controlled airspace (air traffic service), EXT-002 Electric grid, EXT-004 Aircraft and spares supply, EXT-006 Emergency response service; the stakeholder behind each is a separate `owner`, shown separately in every figure and table. A test rejects organization words in system names. |
| F04 needs not in the taught form | major | **Fixed.** The lecture teaches SEBoK’s form, “The [stakeholders] need the [system] to …” (R11 p.555), with MITRE’s attributes. All 17 needs are rewritten to name “the air-taxi service”; a test enforces the form. The worked solution is now true (step 4 and the check); reference statements kept in `AEROLINK_CASE_CHANGES.md` §3. |
| F05 sweep figure | major | **Fixed.** New matrix: each stakeholder dotted under every Table 1 stage whose prompt surfaces it (`promptedAt`), outlined at its stage of main involvement. Communities at Concept. The register field is “Stage of main involvement” in both sessions. |
| F06 NSoI/WSoI/SOI-001 | moderate | **Fixed.** Passenger demand moved to the WSoI; NSoI = what AeroLink controls; SOI-001 stated as the WSoI (“may also include WSoI”, R92 p.327); lesson sentence rewritten. |
| F07 exit ticket | moderate | **Fixed.** “A stakeholder found by only one of your methods, and which”; model answers corrected (trainers flagged as a wrong answer); check-your-understanding item rewritten. |
| F08 “needs are qualitative” | moderate | **Fixed.** MITRE’s quantifiable metrics (R53 pp.295–297) and SEBoK’s “how well” (R11 p.554) stated; Week 2 measures labeled a course sequencing convention. |
| F09 set test only on the set | moderate | **Fixed.** “Primarily tested on the set; also applicable to individual needs” (R11 p.554). |
| F10 classes of stakeholders | moderate | **Fixed.** Registered class STK-015 Passengers with reduced mobility with its own concern CON-017; NEED-008’s subject; advocates contribute via CON-013. |
| F11 compound/ambiguous needs | moderate | **Fixed.** NEED-012 split (→ NEED-016), NEED-015 split (→ NEED-017, “competitive with ride-hail and public transport”); NEED-011 kept as one end-to-end need with the reason stated (W9 depends on it); end-to-end versus compound guidance added; a test catches compound statements. |
| F12 why ladder | moderate | **Fixed.** Top rung is the residents’ outcome (rest and home life, above all at night); the city agreement is drawn beside it as a constraint (R11 p.554); NEED-003 records the bounded outcome. |
| F13 fragile deliberate gap | moderate | **Fixed.** CON-015 reworded to purely contractual matters (orders, delivery slots, payment milestones); the operating-data counter-argument is now the explicit teaching point with a model answer (`DELIBERATE_GAP.debate`). |
| F14 DoD systems as stakeholders | moderate | **Fixed.** Notes and lesson read DoD’s item as shorthand for the programs and organizations that own those systems. |
| F15 no BMA output for teams | moderate | **Fixed.** Problem statement and mission in Team Record Part 2, the pitch card, the lab brief figure and the seven-day plan; AeroLink problem statement (proposed); every need traces to MGO-001 or a goal (`mgo`, Goal column in the catalog and the lesson table). |
| F16 internal history and IDs | moderate | **Fixed.** “Decision 1”, “A correction to earlier material”, “faculty-default decision 1”, A1–A7, FD-24, FD-22, outline §, §4.7 c, old-course references, S01/S02, B1.7 and quiz-item numbers removed from slides, lesson and notes; the change log lives in `AEROLINK_CASE_CHANGES.md`. |
| F17 Session 2 lesson citations | moderate | **Fixed.** Inline “(Rxx p.n)” throughout the Session 2 lesson. |
| F18 SEBoK license; near-verbatim notes | moderate | **Fixed.** The exact SEBoK statement (PDF p.31: CC BY-NC-SA 3.0 Unported, Trustees of the Stevens Institute of Technology), the S10 CC BY 4.0 notice, MITRE’s © notice and DoD Distribution A are on a generated **References and credits** slide in both decks, in both notes documents and in the reader/handout (“References and credits for Week 1”). Generator: `references.ts` + `layout: 'references'` (viewer, .pptx, notes, reader). The three near-verbatim passages are quoted or loosely paraphrased. |
| F19 V-model | moderate | **Fixed.** Right arm: integration → system verification (against the requirements, R23a p.634) → system validation; horizontal pairings. |
| F20 sequence balance | moderate | **Fixed.** Session 1 stakeholders 24 min vs system concepts 18 and life cycle 8; the definitions table and context types are lesson reading; the sweep (6 min) and the method comparison (4 min) gain the time. |
| F21 environment per stage | minor | **Fixed.** “Different environments across the life cycle” (R39e p.1501). |
| F22 R39b misattribution | minor | **Fixed.** New register entry **R39l System Requirement (glossary)**, p.1652, verified; cited for the system-requirement definition. |
| F23 “consensus principles” | minor | **Fixed.** “First steps toward consensus” (R91 p.130). |
| F24 heuristics without caveat | minor | **Fixed.** 7 ± 2 flagged as a memory-span rule of thumb (instructor’s caution); Tuckman presented as descriptive, citing SEBoK’s own note (R97 p.995). |
| F25 warm-up shows answers | minor | **Fixed.** Question slide, then a separate reveal slide. |
| F26 figure polish | minor | **Fixed.** AIT bar below the IPTs with connectors; REL-006 label clear; REL-007 arrow runs from 004 to 013 with the reading stated. |
| F27 elicitation matrix | minor | **Fixed.** Brainstorming and focus-group rows differentiated, with the reason in the notes and lesson. |
| F28 card-like slides | minor | **Fixed.** New working visuals: driving-question scene, AeroLink network, stakeholder-definitions test, missing-stakeholder chain, Methods 2/3 panel, method-coverage regions, exit hand-off, annotated weak register line, draft-to-need, Team Record parts, charter owners; S1-7 and S1-22-type text slides moved to the lesson. The Session 2 question slide stays deliberately sparse (it precedes the reveal). |
| F29 .pptx legibility | minor | **Fixed.** Short citations on slide faces (full entries on the credits slide); the context slide’s prompts moved to the subtitle so the figure fills the width; two text columns share one type scale. |
| F30 counts and labels | minor | **Fixed.** “Five engineering outputs plus an AI-use statement” everywhere; Architecture owns ENT, PRT, EXT (REL suggested) in both figures; PRT defined; outline Section E header corrected and the outline marked superseded with the P-number mapping pointer. |
| F31 insurers | minor | **Fixed.** Supplier (of insurance), placed in the extended enterprise. |
| F32 loose wording | minor | **Fixed.** One answer to “weakest condition” (NEED-006); “hub/spoke” removed from NEED-004 and the S2 example. |
| F33 handout without figures | minor | **Fixed.** The handout embeds every figure PNG (`.figure-cache/<id>.png`) beside its caption and text alternative (41 images). |

## Timing (minutes; spoken notes in words per minute)

Session 1: 1 title (1, 77) · 2 driving question (3, 35) · 3 two phases and your enterprise (3, 65) · 4 meet AeroLink
(2, 51) · 5 SE purpose and system (3, 59) · 6 SoI and enabling (3, 65) · 7 enterprise (3, 59) · 8 three scopes (3, 61)
· 9 boundary and context (4, 57) · 10 boundary decision (2, 62) · 11 life cycle (2, 73) · 12 15288 (3, 55) · 13 BMA
(3, 60) · 14 team and IPT (2, 74) · 15 roles and paths (3, 78) · 16 charter (2, 69) · 17 who counts (3, 60) · 18 why
first (2, 58) · 19 sweep (6, 52) · 20 Methods 2 and 3 (4, 68) · 21 approving authorities (2, 78) · 22 classifying
(3, 64) · 23 answer (4, 59) · 24 exit (3, 35) · 25 references (0). **69 min + 6 buffer = 75.**

Session 2: 1 warm-up questions (2, 47) · 2 reveal (1, 96) · 3 concerns (3, 63) · 4 register (3, 57) · 5 needs vs
requirements (3, 75) · 6 integrated set (2, 77) · 7 transformation (2, 64) · 8 why keep (2, 75) · 9 well formed (4, 82)
· 10 anatomy (2, 94) · 11 elicitation (2, 82) · 12 real need (2, 73) · 13 conflict (4, 75) · 14 errors (2, 49) · 15
worked example I (6, 70) · 16 worked example II (3, 68) · 17 worked example III (4, 72) · 18 lab brief (2, 65) · 19
charter (8, 16) · 20 pitch (10, 18) · 21 close (2, 54) · 22 references (0). **69 min (47 lecture + 22 lab) + 6 buffer = 75.**

## Gates

- `npx tsc -b`: clean.
- `npx vitest run src/content src/lectures`: 9 files, 209 tests passed (validator clean for both sessions; new rule tests
  for the references layout and the buffer; pacing tests). Full suite: 60 files, 1065 tests passed.
- `npm run lectures:pptx` (own Vite on port 5197): 45 figures; week01-session1.pptx 25 slides / 25 notes / 23 images;
  week01-session2.pptx 22 / 22 / 21; the last slide of each deck is “References and credits” with the SEBoK attribution.
- Viewer screenshots (own Vite on port 5196, stopped afterwards): every Week 1 slide in light, six in dark, in
  `screenshots/lectures/week01-s{1,2}-NN-<slide>-<theme>.png`, plus `week01-reader-references-light.png`; no overflow.
  The earlier, differently numbered week01-s* screenshots were replaced.

## For faculty decision

1. SEBoK’s ShareAlike term: if the lesson is treated as an adaptation of SEBoK text, it must be shared under CC BY-NC-SA 3.0.
2. Adopting STK-015/CON-017, NEED-012..017, the renamed external systems and the noise exposure terms into the reference
   data (consequences in `AEROLINK_CASE_CHANGES.md` §5, including CAP-007 and MGO-006 in Week 3).
3. The Week 1 workload is now 8.0 h, exactly the 8 h budget (the lesson grew by the detail moved off the slides).

## Sign-off review findings (`_source_cache/review/week01_package_signoff.md`, verdict NOT YET)

**Revision.** 2026-10-19. Status stays **new-pending-review**. Nothing committed or pushed.

The lecture (`session1.ts`, `session2.ts`, `aerolinkCase.ts`) is the authoritative source. The lab, the tool, the quiz, the practice and the docs now read its values.

**New single source for the lab brief:** `src/content/lectures/week01/labBrief.ts`. It holds:
- the need form;
- the six-check gate;
- what PRT means;
- the minimums;
- the Week 1 prefixes;
- the relationship types.

**One consistency test,** `labBrief.test.ts`, checks that these agree:
- the lecture's gate (S2-09) and lab-brief minimums (S2-18), the tool's constants, `SELF_CHECK`, the lab instructions and the model-inputs map;
- the Session 2 lab minutes and the lab page;
- the workload figures in every place they appear;
- each reading's page range across both decks.

| Finding | Severity | Disposition |
|---|---|---|
| B1 e2e cannot load | blocker | **Fixed.** Added `with { type: 'json' }` to the JSON imports in `src/content/readings.ts` and `src/content/rubrics.ts`, the only JSON imports e2e reaches. Both Playwright configs load and pass. |
| M1 need form and six-check gate | major | **Fixed.** In `needQuality.ts`, the structure gate requires the taught form “The [stakeholders] need the [system] to …”. **Decision: the outcome form “&lt;stakeholder&gt; need(s) &lt;something&gt;” is rejected.** It fails the gate and the message shows the rewrite, because the gate's first check is the SEBoK need form. A new advisory warning fires when the [system] does not look like the team's system of interest. `SELF_CHECK` now is the lecture's gate, in order: SEBoK need form; no design; attributed to a registered stakeholder; **traced to its concern**; a condition; a rationale. Its IDs come from `NEED_GATE`. The both-direction tests are kept, rewritten in the new form. New tests for the taught form: good statements pass; the outcome form, “need the X” without “to”, “need to …” and an empty “what” fail. The form is also used in: mission 4, w1q-10, the exemplar fixture (all 8 needs), the tool's prompt and help, lab method step 7, TEAM_RECORD, the template, and the old Learn L7 figure. |
| M2 PRT meaning | major | **Fixed.** PRT has one meaning: an element inside the boundary of the system of interest. In Week 8 each one seeds a `part` usage. Lecture text corrected: the S1-16 notes, the S1 lesson, the S2-18 and S2-19 alt text, the S2-19 notes and figure legend (now “PRT part inside the SoI boundary”). The S2-18 figure now reads “SoI, PRT ≥ 3 (its parts)”. The lab, the tool's label and the model-inputs row now say the same. The S1 enterprise figure still says “partner organizations”, but there it names an enterprise concept, not the ID. |
| M3 problem, mission, goals | major | **Fixed.** Part 2 records the problem statement and the mission (MGO-001), one sentence each, plus optional goals (MGO-002 …), each with its ID. Every need traces to a goal: MGO-001 or a recorded goal. Tests cover both directions: a missing or unknown goal stops the need counting; a valid one counts. The Markdown export has the new Part 2 lines and a Goal column. The JSON model inputs are now **version 3**, adding `enterprise.problem`, `missionGoals`, `needs[].goal` and `relationships`. Version 1 and 2 files still import; a version 2 conflict text becomes REL-001. The lab, the template, TEAM_RECORD and the model-inputs map (new MGO row) are updated. |
| M4 lab timing | major | **Fixed.** `S2_LAB` in `week1Path.ts` reads the minutes from the Session 2 slides. The 22 min are: brief 2; charter 8 (roles, tie-break, lead candidate); pitch 10 for up to five teams, with the rest decided on the LMS within 48 h; close 2. Norms and ID owners are due by the end of day 1. The lab page, the procedure, the workload row and `WEEK1_LAB_INSTRUCTIONS.md` (regenerated) all use these values, and e2e asserts them. |
| M5 three red e2e tests | major | **Fixed for real.** The workload assertions now derive from `workloadTotal(week01.workload)`, which is 8.0. The reader now links every figure shared with a slide back to that slide (“On the slide: session N, slide M”), and the reader test uses those links. No test was loosened. |
| Mo1 relationships | moderate | **Fixed. Faculty decision recorded; the default is required, as in the lecture.** The tool now has REL rows: ID, from, to, type (one of the case's seven kinds) and note. Validation requires at least 3 complete rows and at least 1 “conflicts with”. Both ends must be registered and different, with no duplicate ID or pair. The rows appear in the Markdown, the JSON and the map (new REL row). REL and PRT are added to the Week 1 prefixes that need an owner, as in the lecture's charter. The lab text says “required, as the lecture sets it”; scoring under RB-1.4 stays proposed. |
| Mo2 quiz length cue and sources | moderate | **Fixed.** The key's length rank per item is now 2, 4, 1, 3, 1, 4, 2, 3, 1, 2. Each rank appears 2–3 times, so “pick rank k” scores at most 30 %. Key letters stay a3 b2 c3 d2. A new test checks the rank distribution. Every item now has `lecture: { session, slide, section }`, and its source and explanations cite lecture slides and lesson sections, not L1–L3. A test checks that each slide and section exists and contains the item's deciding phrase. The quiz shows “Taught in: Session N, slide M”. |
| Mo3 lab tool framing | moderate | **Fixed.** The lab tool now shows only the Team Record (a `missions` filter): no mission list, no mission numbers, and no AeroLink or quiz mission. Progress reads “N of 7 Team Record parts complete”, and the status bar and change log name the Team Record. The practice shows missions 1–4 only. “as Check & submit describes” is replaced by a pointer to the LMS assignment and the Laboratory page. |
| Mo4 workload story | moderate | **Fixed; the three-person case is flagged.** §10 of `WEEK1_LEARNING_DESIGN.md` is rewritten for 8.0 h; FD-29 is superseded. The S2-18 notes go from 2.4 h to 2.5 h: 10 person-hours for a team of four, now counting the proposal write-up. The lab note is computed from `TEAM_RECORD_PERSON_HOURS` and `THREE_PERSON`. For three-person teams the tool applies the lecture's proposed minimum of 6 needs from 4 stakeholders, pending approval. The honest figure is about 9.4 person-hours: **3.1 h each, so the week is about 8.6 h, 0.6 h over budget.** The definition-of-done workload check now runs for Week 1; its exemption is removed. |
| Mo5 practice data | moderate | **Fixed, with one labeled residual.** These now read `aerolinkCase.ts`: missions 1–4; the candidate list (the case's 15 stakeholders plus three non-stakeholders); the reference register; the mission 4 drafts and model answers. The ContextRecorder placeholder now reads “e.g. Controlled airspace (air traffic service)”. The Learn L3 figure text labels the old EXT names as pre-revision and moves passenger demand to the WSoI. **Residual:** ENT-001 and the EXT names in `model/reference/week01.ts` are **not** renamed. They are copied into `sysml/aerolink_v01..v04`, so renaming them breaks the SysML drift check. They are labeled pre-revision, to be reconciled in Week 8. |
| m1 cold-start flake | minor | **Fixed.** The dev server now warms up the entry module (Vite `server.warmup`). The first assertion of `app.spec.ts` waits up to 30 s. |
| m2 test count | minor | **Corrected.** The full suite now runs 61 files and 1,095 tests. The 1,065 recorded above was stale; HEAD ran 1,056. |
| m3 400 px viewer | minor | **Fixed.** The outline now follows the slide in the DOM. Wide screens still place it in the left column; narrow screens show the slide first and the list after it. |
| m4 “69 min + 69 min” | minor | **Fixed.** The card now reads “69 min of content per 75-min session, lab included”. |
| m5 oxlint warnings | minor | **Reduced from 22 to 15, with 0 errors.** Fixed the set-state-in-effect warning and the Week 1 files' fast-refresh warnings: internals unexported, and helpers moved to `route.ts` and `exampleParts.ts`. The 15 left are fast-refresh advisories in shared hook and provider modules (router, AppState, Workspace, flow state). Fixing them would mean app-wide churn, so they stay. |
| m6 R53 page range | minor | **Fixed.** Each deck's credits slide (viewer, .pptx and notes) still lists only what that deck cites, but page ranges are now merged across the week. R53 reads pp.295–297 in both decks. |

**Gates (this revision).**

| Gate | Result |
|---|---|
| `npx tsc -b` | Clean |
| `npx oxlint src` | 0 errors, 15 warnings |
| `npx vitest run` | 61 files, 1,095 passed |
| `npm run build` | Pass |
| `npm run build:student` | PASS: 0 of 13 exam markers and 0 of 535 faculty-notes markers in `dist-student` |
| `npx playwright test` | 48 passed, 1 skipped (the parked `zz-visual-loop`) |
| `npx playwright test -c playwright.lectures.config.ts` | 9 passed |
| `npm run lectures:pptx` | 25 and 22 slides |
| `npm run lab:md` | Regenerated |
| `screenshots/week1-demo/` | Regenerated: 16 PNGs and the GIF |

**For faculty decision (added).** Numbered 4–7 to follow the three decisions listed earlier in this file.

4. **Relationships.** At least 3 REL rows with at least 1 conflict are **required** in Week 1, as the lecture states; this default is applied. Scoring them under RB-1.4 remains proposed.
5. **Three-person teams.** Either accept about 8.6 h with the reduced needs minimum (6 needs from 4 stakeholders, implemented pending approval), or cut further. For example, a register minimum of six stakeholders still gives about 8.1 h.
6. **Goals.** Goals are optional: a need may trace to the mission, MGO-001. Set a minimum if the faculty wants one.
7. **Residuals outside the Week 1 scope:**
   - Need priority in the tool is high/medium/low, while the lecture uses MITRE's categories (mandatory, critical, desirable, optional) for the AeroLink needs.
   - `weeks/week08.ts` and the reference model keep the pre-revision EXT and ENT-001 names.
   - The Week 3 critique rewrites are still in the outcome form.

## Sign-off confirmation pass (`_source_cache/review/week01_signoff_confirmation.md`, N1–N10), 2026-10-19

Not committed. Every fix was checked against the code and the regenerated outputs.

| ID | Severity | Disposition |
|---|---|---|
| N1 need gate rejects a proper-name system | moderate | **Fixed.** `splitTaught` (`needQuality.ts`) now accepts the [system] after “need(s)” when it opens with “the”, “our”, “its”, “a” or “an”, when it is a proper name (first word capitalised: “need MedFly to …”, “need Riverside to …”), or when it is exactly one of the team’s registered system names in any case (“need medfly to …”). A lower-case phrase with no article (“need blood units to arrive …”) is still read as the outcome form and rejected. A new `taughtFault` gives the message that fits the actual fault: no system between “need” and “to”; no “to” at all (the “<stakeholder> need(s) <something>” form); or a phrase that does not read as a system. The old message, which told the student to name a system they had already named, is gone. The advisory `system` warning still applies, so “need a taxi to …” passes the structure gate but cannot count until it is justified. `needQuality.test.ts` has a new block that tests both directions. Good: proper name, “The hospitals …”, lower-case registered name, possessive, “a”, “an”, and the reviewer’s Riverside probe. Bad: outcome form, “need to …”, a lower-case non-system phrase, “need MedFly within …”, the system of interest as the subject, and “a [thing] to …” warned. `labBrief.test.ts` still passes. |
| N2 internal ID on the student week page | minor | **Fixed.** “(FD-22)” is removed from `weeks/week01.ts` (workload row and assignment line) and from `week1Path.ts`. The same sentence in `learn/week01.ts`, and “FD-24” in `learn/week01.ts` and in the archived lab step, are removed too. A scan of the student Week 1 path (week page, lesson, lab, lab tool, assessment) and of `dist-student/assets/week01-*.js`, `Week1App-*.js` and `Week1Exercises-*.js` finds no FD-, F0x, Mo or N IDs in student text. Two kinds of ID remain, both on purpose: B1.x (learning-objective IDs shown to students) and M1–M3 on S1 (the three identification methods the slide defines). DECISION_LOG and FD- references remain only in instructor-only panels, comments and the archive's instructor notes. |
| N3 archived page contradicts the fixes | minor | **Fixed.** In `weeks/week01.ts` the facilitation note now describes the taught form, the article and proper-name rule, the rejected outcome form and “six minimum checks”. The ENT, STK and NEED artefact minimums and the assignment template now name the problem, the mission (MGO-001) and goals, PRT ≥ 3, ≥ 3 REL rows with ≥ 1 conflict, and the MGO trace. The FD-24 tag is dropped. Both pre-lecture session plans are titled “SUPERSEDED …”. A new first caution says the decks, the lab instructions and `labBrief.ts` are authoritative. The curriculum export reads the same fields. |
| N4 parts count differs (6 vs 7) | minor | **Fixed.** The record is “six parts” everywhere: five engineering outputs plus the AI usage statement, as the lecture puts it. The lab tool counts **steps**: the bar reads “N of 7 Team Record steps complete (six parts and the export)”, and the status bar and brief pane say “steps”. The mission goal reads “seven steps, the six parts … then the export”, and the step briefs read “Part 6: the AI usage statement” and “After the six parts: export the Team Record”. The lab Markdown, the lab output-file line, TEAM_RECORD, the opener, the archived page and the e2e assertion all agree. |
| N5 goal trace worded two ways | minor | **Fixed.** On S2-18 the slide bullet and the figure alt now say “each traced to the mission or a goal”. The figure box reads “NEED ≥ 8 from ≥ 5 STK, / each → mission or goal”. The notes were already worded this way and are unchanged, so wpm and the timing validator are unaffected. `labBrief.test.ts` asserts the new wording. The decks were regenerated. |
| N6 quiz cues and one explanation | minor | **Fixed.** In w1q-2 the key no longer echoes the stem: “The whole department: arrivals, triage, beds and the staff on shift”. It is still the shortest option, so its length rank is unchanged. In w1q-9 the key is paraphrased without “often”: “It can uncover the real need behind a request phrased as an implementation”. It is still the longest option. The w1q-10 option a explanation now says the solution (a tablet app) is the flaw and that “at each bedside” only says where the app would go. The key letters and length ranks are unchanged, and the length-rank distribution test passes. |
| N7 mission 4 key carries Week 3 wording | minor | **Fixed.** `W1_CRITIQUE` now carries Week 1 notes written for the case need shown, with its own condition. The Week 3 remarks “leaves its condition implicit” and “the rewrite adds” are gone, and a test asserts it. A fifth checkbox, **“Not in the need form”**, is added (`W1_FLAWS`). It is keyed on c1–c5 and not on c6, and a test proves the key equals the Week 1 structure gate on every draft. The intro now tells students to tick it. The c2 “No condition” key is kept and explained in its note: “around each vertiport” places the barriers, the solution, and gives no condition on the need. This is the same reading as the corrected w1q-10 explanation. |
| N8 stale design-doc rows | minor | **Fixed.** In `WEEK1_LEARNING_DESIGN.md`, F01 and F10 are marked “Superseded by the sign-off revision”, with the current rule or total. The F02 row notes the “six parts” wording. |
| N9 “six criteria” vs “six minimum checks” | minor | **Fixed.** `GRAD_REVIEW.what` now says “test the six minimum checks of the course gate”. The graduate objective, the assessed-graduate line, the L7 teaser, the archived assignment, purpose and artefact text, and the mission-4 comment say “six minimum checks”. |
| N10 dead Learn content | minor | **Fixed.** The L6 worked example now gives NEED-003 as the case states it, in the taught form with its condition. The w1-m6-recall note reads “The same quiz as on the Assessment page”. |

**Gates (this pass).**

| Gate | Result |
|---|---|
| `npx tsc -b` | Clean |
| `npx oxlint src` | 0 errors, 15 warnings (unchanged) |
| `npx vitest run` | 61 files, 1,100 passed |
| `npm run lab:md` | Regenerated |
| `npm run lectures:pptx` | 25 and 22 slides |
| `npm run build` | Pass |
| `npm run build:student` | PASS |
| `npx playwright test` | 48 passed, 1 skipped |
| `npx playwright test -c playwright.lectures.config.ts` | 9 passed |

## Gate sweep 2026-10-19 (cross-week “tool rejects valid short answers”)

Found as Week 2 M1, Week 4 M2/N3 and Week 5 M2; swept across every team lab tool. A length or form gate stays only when a
student-visible sentence makes the short entry a real defect and the threshold is shown to the student. Full
before/after table, justification and the gates examined and kept: `docs/lectures/GATE_SWEEP_2026-10-19.md`. Shared
test: `src/workbench/shortAnswers.test.ts`. Record and gate signatures and the export format are unchanged.

| Gate | Before | After | Why |
|---|---|---|---|
| Charter decision rules, norms (`team.ts`, `logic.ts`) | ≥ 5 words | written, not an empty answer | “Majority vote”, “Discord daily” are complete. |
| Problem, mission, system of interest; L1 boundary sentence | one sentence ≥ 8 words | one sentence ≥ 3 words (stated) | “Feed every family weekly.” is one sentence. |
| Goal | ≥ 4 words | written | “Cut food waste”. |
| Stakeholder concern (team and in-class register) | ≥ 5 words, then specificity | written, then specificity (unchanged) | “Noise after 10 pm” is specific; “Noise” still fails as generic. |
| Rating reason (team and in-class); relationship note | ≥ 3 words | written, not an empty answer | “Certifies vans”, “Funds it”. |
| Need structure | ≥ 4 words | ≥ 3 words | “Families need food” + condition field is a full need. |
| Need object (`MIN_OBJECT_WORDS`) | ≥ 2 content words | ≥ 1 | “Drivers need routes before shifts” was “no outcome”. |
| Need rationale | ≥ 5 words | written | “Legal requirement”. |
| Warning justification (and field labels) | ≥ 5 words | written, not “ok”/“n/a” | “Regulator’s own term”. |
| L1 rejected boundary | ≥ 5 words | written | No stated length. |
