# Week 1 lecture: independent academic review

**Reviewer role.** Independent senior reviewer (graduate SE/MBSE faculty; reviewer of professional lecture decks).
**Date.** 2026-10-19.
**Scope.** Commit `ab2473d`. The in-scope files are unmodified in the working tree.
- `learning-studio/src/content/lectures/week01/session1.ts` (28 slides), `session2.ts` (21 slides) and `aerolinkCase.ts`.
- `src/components/figures/LectureWeek1S1.tsx` and `LectureWeek1S2.tsx`.
- `exports/lectures/week01-session{1,2}.pptx`, the two notes files and `week01-lesson.md`. These were generated at 00:59, after the last source edit, so they were not regenerated.
- `docs/lectures/week01/WEEK1_LECTURE_OUTLINE.md` and `AEROLINK_CASE_CHANGES.md`.

**Standard applied.** DECISION_LOG A20 and the faculty brief: a professor-led graduate course that teaches first, explains in depth, demonstrates on engineering examples and then assigns. Another qualified instructor must be able to teach from the notes. Every claim must be sourced, with no invented definitions. Figures must be original, spelling must be American English, AeroLink must be fictional, and teams must use their own enterprises.

**What was done.**
- Read both sessions, the case module and both documents in full.
- Checked 41 citation instances against the extracted page text in `_source_cache/*.txt`. Every formal definition was included.
- Rendered all 49 slides at 1600×900 in light mode. I used my own Vite instance on port 5199, which has been stopped. Screenshots are in `…/scratchpad/lecture_shots`.
- Rendered all 49 .pptx slides through PowerPoint COM, opened read-only, into `…/scratchpad/pptx_render`. I inspected 8 of them closely and checked the speaker-notes XML.
- Recomputed every count in the case data.
- Ran `vitest` on `src/content/lectures/week01`: 2 files, 24 tests, all passing.
- Measured the speaking load per slide: words in the teach, worked-solution and figure-walk notes, divided by the minutes allotted.

---

## Verdict: **REVISE**

The lecture is a genuine graduate lecture, not a summary. The citation discipline is unusually good, and the faculty notes are close to teachable as written. However, five major findings stand between it and sign-off:
- an unrealistic time budget;
- a worked conflict that is not technically coherent;
- external systems named after the organizations behind them, which contradicts the lecture's own central rule;
- reference needs that do not follow the statement form the lecture teaches;
- a life-cycle sweep figure that misrepresents the method it illustrates.

None of these is a blocker in the sense of misinformation from a source. All of them would be noticed by a careful student or a peer reviewer.

**Counts:** blocker 0 · major 5 · moderate 15 · minor 13.

---

## Strengths

- **The citations are accurate.**
  - Of the 41 instances checked, 39 say exactly what the slide or note claims.
  - All formal definitions are verbatim and on the cited page: system (R38 p.1637), SoI (R39b p.1652), enabling system (R39c p.1493), enterprise (R39d p.1497), boundary (R39i), environment (R39e), context (R39j), life cycle (R39f), stakeholder ×4 (R39a p.1631), team (R39k), IPT (R99 p.52), concern (R77 p.115) and SE (R01 p.51).
  - The specific claims the brief asked about all verify:
    - the 15288 process names as SEBoK prints them (R98 pp.1001–1002, including "Operations");
    - MITRE's six attributes (R53 p.296);
    - SEBoK's set characteristics, correct, consistent, complete and feasible (R11 p.551);
    - SEIT and AIT (R96 pp.987–988);
    - N(N−1)/2 with 10/21/36/45 and "more than 10 → hierarchical" (R96 p.988);
    - Tuckman's four stages, adjourning added by Tuckman and Jensen, and non-sequential progression via Forsyth (R96 p.989; R97 p.995);
    - DoD's eight technical processes and the consequences of skimping (R48a p.141).
- **Course conventions are labeled, and source gaps are stated honestly.** Examples are the influence × interest grid, the role groups, the six-check gate, the adjudication protocol and the elicitation ratings; and the missing 42010, INCOSE NRM/GtWR, 15288:2023 and power/interest grid.
- **The central distinctions are well chosen.**
  - Needs versus requirements uses SEBoK's black-box/white-box framing with "more than changing the subject".
  - The integrated set is presented as the validation reference.
  - Requirement verification is separated from requirement validation (R13 p.566).
  - An honest "one process, three names" slide covers SEBoK, 15288:2015 and DoD.
- **Every slide has notes in the same structure:** teach, why, figure walk, examples (aerospace, enterprise and AeroLink), misconceptions with corrections, transition and timing. The worked number on slide 19 is correct, including ×4.5 from 5 to 10.
- **The figures are original and mostly very good.** The best are the context layers (S1-13), the three scopes (S1-11), the coverage matrix (S2-16), the influence × support map (S2-01) and the need-quality layers (S2-08). The PNGs in the .pptx are crisp.
- **The case data is internally consistent and generated from one module.** I recomputed every count:
  - 14 STK, 16 CON, 15 NEED and 8 REL;
  - priorities split 7 mandatory, 4 critical, 4 desirable and 0 optional;
  - 13 of 14 stakeholders are traced, and CON-015 is the only unanswered concern;
  - both maps match the data point by point;
  - the method-coverage tallies are 12, 5 and 10.
- **American English** is clean in all in-scope files.

---

## Findings

### Major

**F01 (major): the time budget has no slack and is unrealistic on the interactive and demonstration slides.**
*Where:* both sessions; worst cases are S2-14 (`s2-worked-steps`), S2-16 (`s2-worked-audit`), S2-09, S2-12, S2-17, S1-11, S1-14 and S1-19.

*Evidence:*
- The slide minutes sum to exactly 75 in each session, with zero buffer for transitions, questions or room logistics.
- The required spoken exposition (teach, worked-solution and figure-walk notes) needs these rates before any interaction:

| Slide | Words | Minutes | Words per minute |
|---|---|---|---|
| S2-14 | 323 | 2 | 162 |
| S2-16 | 369 | 2 | 185 |
| S2-09 | 286 | 2 | 143 |
| S2-17 | 276 | 2 | 138 |
| S2-12 | 401 | 3 | 134 |
| S1-19 | 423 | 3 | 141 |

- Those same slides also ask students to supply each step, label the need with the class, answer "what should the team do?", or work the number together.
- Session 1 is 28 slides of continuous lecture.
- The A20 core act, the worked demonstration (S2-14), gets the least time: about 20 seconds per step "with student contributions".
- In the lab, 10 minutes for roles, decision rules, norms, ID owners and choosing the lead enterprise is ambitious. The 12-minute pitch block fits only six teams.

*Fix:*
- Cut or move about 8–10 minutes per session into the lesson or pre-reading. Candidates are the context-type table (S1-8), the program-level IPT structure (S1-18), the three-definitions table (S1-7) and the bridge (S2-17).
- Give worked example I 5–6 minutes and the audit 4 minutes.
- Keep 3–4 minutes of buffer in each session.
- State a team-count rule for the pitch: for example, more than six teams are decided asynchronously.

**F02 (major): the AeroLink conflict between NEED-001/004 and NEED-003 is not coherent as the needs are written.**
*Where:* `aerolinkCase.ts:232` (NEED-003) and `:256–270` (CONFLICT); S2-12 and figure `w1s2-adjudication`; lesson "AeroLink: noise against throughput".

*Evidence:*
- NEED-003 bounds noise "within the limit agreed with the city". The Data Sheet defines that limit as a "65 dBA pad-edge noise limit", which is a per-event level.
- The claimed shared variable is departures per pad per hour. More departures do not raise a per-event pad-edge level, so the two needs do not trade against each other.
- The protocol step "Week 3 trade … all held inside the 65 dBA agreed limit" therefore trades nothing.
- The stakeholder conflict (REL-002) is real only because CON-012 is about "how often it occurs and at what hours". NEED-003 dropped both of those dimensions; its condition is "at all operating hours".

*Fix:* choose one of the following, then update the figure, the why-ladder (F12) and the anatomy slide.
- Restate NEED-003 so that it carries exposure, for example "… noise exposure near homes kept within the agreed limits on event level and number of evening and night events".
- Or define the agreed limit as a cumulative metric, for example an hourly or day-night average.

**F03 (major): external systems are named after the organizations behind them, contradicting the lecture's own rule that systems are not stakeholders.**
*Where:*
- `aerolinkCase.ts:65–72`: EXT-001 "Air navigation service provider", EXT-004 "Aircraft manufacturer (OEM)", EXT-006 "Emergency services".
- Figure `w1s1-context-layers` (S1-13).
- The lesson's context table.

*Evidence:*
- The lesson table renders "EXT-001 Air navigation service provider → stakeholder behind it: STK-007 Air navigation service provider" and "EXT-004 Aircraft manufacturer (OEM) → STK-011 Aircraft manufacturer (OEM)".
- This is exactly the error that slide S1-21, warm-up Q1 (S2-01) and error #2 (S2-13) teach students to avoid.
- Elsewhere the same items are relabeled inconsistently: "EXT-001 airspace" and "EXT-004 aircraft supply" (S1-24), and "Airspace (ANSP)" (S1-9).

*Fix:*
- Rename the systems: EXT-001 "Controlled airspace (air traffic service)", EXT-004 "Aircraft and spares supply", EXT-006 "Emergency response service".
- Use one label everywhere.
- Add the change to `AEROLINK_CASE_CHANGES.md` for reconciliation with the reference data.

**F04 (major): the reference needs do not follow the statement form the lecture teaches, yet the worked solution says they pass.**
*Where:* all 15 NEED statements (`aerolinkCase.ts:230–244`); `session2.ts:736` ("in the SEBoK format: 'The electric utility needs …'") and `:739` ("form … passes"); figure S2-04.

*Evidence:*
- SEBoK (R11 p.555) writes needs "from the perspective of what the stakeholders need the SoI to do" and recommends the form "The stakeholders need the system to …". R13 p.558 adds: "what they need the system of interest (SoI) to do".
- None of the 15 AeroLink needs names the system of interest. Examples: "The electric utility needs the power drawn by each vertiport to stay within …"; "Passengers need to board …".
- Slide S2-08's own figure leaves the "… need the system to …" chip outside the course gate, which concedes the gap.
- Slide S2-04 puts the SEBoK coffee-maker need, which names the system, directly beside NEED-010, which does not.

*Fix:* choose one.
- Rewrite the needs in SEBoK form, for example "The electric utility needs the air-taxi service to keep the power drawn at each vertiport within the agreed connection capacity …".
- Or declare the outcome form a deliberate course convention, explain why, and correct the worked solution and step 4 so that they stop calling it the SEBoK format.

**F05 (major): the life-cycle sweep figure misrepresents the method, and the meaning of the register's stage field is inconsistent.**
*Where:* S1-23 figure `w1s1-lifecycle-sweep` and its caption; `aerolinkCase.ts:103` ("stage at which the stakeholder is first found"); Session 2 register column "Stage found"; S1-23 notes ("placed at the stage where the stakeholder is mainly involved").

*Evidence:*
- The caption says it shows "Table 1 prompts per stage, the stakeholders they surface".
- Under Operation, whose prompt in R11 p.552 is "Normal users, unexpected users", the figure places ANSP, Utility, Responders, Communities and Vertiport operators. That prompt surfaces none of them.
- Communities sit at Operation, although the driving scenario is a new vertiport being sited, which is a Concept activity (see also REL-007, public consultation on siting).
- The register says insurers and advocates were "found" at Operation, while Session 1 says no stage prompts them.
- The figure therefore teaches the operation-centred picture that the slide warns against: 7 of 14 chips sit in one column.

*Fix:*
- Place each chip under the stage whose prompt actually surfaces it. Owners of external systems and the public are both Concept prompts.
- Alternatively, draw prompt → stakeholder links.
- Rename the field "Stage of main involvement" and use one meaning in both sessions.
- Move Communities to Concept.

### Moderate

**F06 (moderate): the NSoI, WSoI and SOI-001 descriptions contradict each other.**
*Where:* S1-13 figure (the NSoI contains "passenger demand"); S1-14 figure ("We control: fleet, dispatch, ops center"); `aerolinkCase.ts:51` (SOI-001 includes "the vertiport pads and chargers it uses"); lesson ("the service is what AeroLink engineers and operates").

*Evidence:* the NSoI is "driven by the scope of authority or control" (R92 p.326). AeroLink controls neither passenger demand nor the operators' pads, yet both sit inside the scopes that claim control.

*Fix:*
- Move passenger demand to the WSoI.
- State explicitly that SOI-001 is the WSoI, which SEBoK permits: "may also include WSoI" (R92 p.327).
- Reword the lesson sentence.

**F07 (moderate): the exit ticket and the "check your understanding" item ask for a stakeholder "only the life-cycle sweep would find", which the lecture's own analysis contradicts.**
*Where:* `session1.ts:1351`, `:1370` and `:1658`.

*Evidence:*
- In the S1-27 coverage table, every stakeholder found by M1 is also found by M2 or M3. No AeroLink stakeholder is sweep-only.
- The model answer "trainers who certify new drivers" is in DoD's role list (R99 p.52), so under the lecture's rules it counts as M3.
- The outline itself dropped the claim "only the sweep finds the technicians" as untrue.

*Fix:* ask for "a stakeholder found by only one of your methods, and which method", or "one a customer-and-user list would miss". Correct the model answers.

**F08 (moderate): "needs are qualitative" is presented as fact, but both sources say otherwise.**
*Where:* `session2.ts:467` (misconception correction); lesson "Well-formed needs" (a need "is not expected to be verifiable as written").

*Evidence:*
- MITRE's attribute 4 asks for "quantifiable metrics … how much, how well, how often, and how quickly", and its lesson "State needs unambiguously" says key attributes and metrics are frequently missing (R53 pp.296–297).
- SEBoK expects "expected performance and quality ('how well')" in the integrated set (R11 p.554).

*Fix:* present "measures are attached in Week 2" as a course sequencing convention, not as a property of needs.

**F09 (moderate): the set test is claimed to apply only to the collection.**
*Where:* `session2.ts:454` and lesson Layer 3 ("properties of the collection … not of any one statement").

*Evidence:* SEBoK p.554 speaks of "correctness, completeness, and consistency of both individual needs and the integrated set of needs".

*Fix:* say "primarily tested on the set; also applicable to individual needs".

**F10 (moderate): the NEED-008 correction contradicts what Session 1 teaches about classes of stakeholders.**
*Where:* `aerolinkCase.ts:237`; S2-15; `session1.ts:1024`.

*Evidence:*
- S1-21 teaches that ISO/IEC 26702 admits "classes thereof", and gives "passengers who use wheelchairs" as its example.
- The correction then rejects that class as a subject, because it is not registered. The result is an awkward statement ("Passengers need … without being … separated from their mobility aid, including passengers who use wheelchairs") with a null concern.

*Fix:* register the class, for example STK-015 "Passengers with reduced mobility", and attribute the need to it, with the advocates contributing via CON-013. Or explain explicitly why the course prefers a parent class.

**F11 (moderate): several reference needs are compound or ambiguous by the lecture's own criteria.**
*Where:* NEED-012 (conform to zoning *and* connect with public transport); NEED-015 (know the fare *and* have it "comparable" with ride-hail); NEED-011.

*Evidence:*
- The lecture calls "singular" good discipline for needs (S2-08 notes) and cites MITRE's "state needs unambiguously".
- "Comparable" can mean "similar in price" or "possible to compare".
- NEED-015 drops public transport, which CON-003 names.
- No guidance reconciles "singular" with MITRE's "complete, end-to-end", which is used to justify NEED-006.

*Fix:* split NEED-012 and NEED-015, or justify them. Add one sentence distinguishing an end-to-end need from a compound statement.

**F12 (moderate): the why-ladder climbs to a proxy, not to the root need.**
*Where:* S2-11 figure `w1s2-why-ladder`.

*Evidence:*
- The middle rung discovers that late-evening and early-morning take-offs disturb sleep.
- The top rung, NEED-003 "within the limit agreed with the city … at all hours", is a negotiated constraint that loses the time-of-day dimension just discovered. That is the opposite of what root-cause questioning should do (R65 p.322).

*Fix:* make the top rung the residents' outcome, for example "sleep not disturbed by take-off and landing noise in evening and night hours". Treat the agreed limit as a driver or constraint (R11 p.554). This links to F02.

**F13 (moderate): the deliberate gap (STK-011) is fragile.**
*Where:* `aerolinkCase.ts:160` (CON-015) and `:277–283`; S2-16.

*Evidence:*
- CON-015 includes AeroLink's "operating data" reaching the manufacturer. Providing that data is something the service would do, and the S2-16 notes even draft such a need.
- The phrase "certification milestones" muddles whose program is meant.
- The stated reason, "not something the air-taxi service must do", is therefore contestable, which undermines the lesson that a reasoned gap is a decision.

*Fix:* reword CON-015 to purely contractual matters (delivery slots, payment milestones). Or keep it and make the debate itself the explicit teaching point, with a model answer.

**F14 (moderate): the lecture cites a source listing systems as stakeholders without reconciling it with its own rule.**
*Where:* `session1.ts:428` and `:1158` (lesson Method 3).

*Evidence:* DoD's partial list includes "Enabled or enabling systems in the SoS" (R99 p.51). It is cited approvingly while S1-21 and S2-13 teach that systems are not stakeholders.

*Fix:* add one sentence explaining it as DoD shorthand for the programs and owners of those systems, or drop the item.

**F15 (moderate): teams produce no Business or Mission Analysis output, and the reference needs do not trace to the mission.**
*Where:* S2-18 (Team Record parts), S2-20 (pitch card) and the case needs.

*Evidence:*
- S1-17 argues that needs written without a stated problem and mission drift toward wish lists.
- SEBoK says the integrated set reflects MGOs and measures (R11 p.554).
- Yet the Team Record has no problem or opportunity statement and no mission, and no AeroLink need traces to MGO-001…009.

*Fix:* add a problem statement and a one-sentence mission to Part 2 and to the pitch card. Add an MGO trace column to the case needs.

**F16 (moderate): internal production history and internal IDs appear in student-facing material and in the notes.**
*Where:*
- S2-15 subtitle "Decision 1: four needs added, two re-attributed" (on the slide).
- Lesson callout "A correction to earlier material" (`session1.ts:1465`).
- Lesson "Applying faculty-default decision 1 … changed the instructor reference in four ways" (`session2.ts:1222`).
- Notes that refer to "Week 1 of the old course … traffic-jam example" (`:326`), FD-24, "outline §8 item 2", "§4.7 c", "A1–A7".

*Evidence:* a new cohort has no "earlier material", and another instructor cannot decode the internal references. Also, "re-attributed" is wrong for NEED-002: its subject is unchanged and a contributing source was added.

*Fix:* present the case as it is now, and keep the change log in `AEROLINK_CASE_CHANGES.md`. In the notes, replace internal IDs with plain statements of the decision, or add a short glossary of them.

**F17 (moderate): the Session 2 lesson has no inline page citations.**
*Where:* `session2.ts` `studentLesson` and the corresponding part of `week01-lesson.md` (from "Concerns: the hinge" onward).

*Evidence:*
- The Session 1 lesson cites inline, as "(R11 p.552)".
- The Session 2 lesson quotes "changing the subject of the need statement", "high influencers must be committed advocates" and "beware solutions masquerading as needs" with only an end-of-section source list.
- The faculty standard requires a correct source reference for every major claim.

*Fix:* add inline "(Rxx p.n)" citations as in Session 1.

**F18 (moderate): the SEBoK license attribution is missing, and a few notes are near-verbatim without quotation marks.**
*Where:* all decks, notes and the lesson. A search for "Stevens", "Creative Commons" and "BY-NC-SA" finds nothing in the lecture source, the exports or the .pptx XML.

*Evidence:*
- SEBoK text is licensed CC BY-NC-SA 3.0 and requires the statement "This material is used under a Creative Commons Attribution-NonCommercial ShareAlike 3.0 Unported License from The Trustees of the Stevens Institute of Technology" (SEBoK PDF p.31).
- Near-verbatim notes without quotation marks:
  - S1-25 teach bullet 1 (R11 p.553 approving-authorities paragraph);
  - S1-18 team definition (R39k);
  - S1-20 cohesion list (R96 p.990).

*Fix:* add the attribution line to the deck footer or closing slide, to the notes and to the lesson. Quote, or paraphrase more loosely, the three passages. Treat this as a blocker before any public posting of the decks or the lesson.

**F19 (moderate): the V-model figure omits system verification.**
*Where:* S2-07 figure `w1s2-validation-v`.

*Evidence:* the right arm rises from integration straight to "System validation". The verification step against system requirements, which pairs with the left arm, is missing. That is an odd omission on the slide whose job is to separate verification from validation.

*Fix:* add "System verification (against requirements)" on the right arm, with a horizontal pairing to system requirements.

**F20 (moderate): sequence balance.**
*Where:* Session 1, sections B and C.

*Evidence:*
- 33 of 75 minutes (44 %) go to system concepts, the life cycle and 15288 before stakeholders, against 19 minutes for stakeholder identification and classification.
- These topics are prerequisites, but the depth is generous. The three definitions of system, the four context types, the NSoI/WSoI layers and the boundary vocabulary all fall in one class meeting.
- Combined with F01, this crowds out practice of the actual subject.

*Fix:* move the S1-7 table and the S1-8 context types to the lesson as reading, keep one boundary slide in class, and give the time to the worked sweep and the method comparison.

### Minor

- **F21 (minor), environment "one per life-cycle stage".** `session1.ts:562, 586`. R39e p.1501 says only that definition 2 "distinguishes between the different environments that exist during the life of a system". *Fix:* "different environments across the life cycle".
- **F22 (minor), register entry misattributed.** `session2.ts:268, 1065`, S2-04 and the lesson. R39b ("System-of-Interest (glossary)") is cited for the *System Requirement* glossary entry. The page is right, the register entry is wrong, and students following R39b find the wrong term. *Fix:* add a register entry for System Requirement (glossary) at p.1652.
- **F23 (minor), "Consensus SE principles".** S1-6 (`session1.ts:272`). R91 p.130 says the principles "represent the first steps towards consensus". *Fix:* "SEPAT's 15 principles (first steps toward consensus)". The notes already say this.
- **F24 (minor), heuristics repeated without caveat.** S1-19 and S1-20 notes repeat SEBoK's "7 ± 2 rule" justification for N(N−1)/2 and the Tuckman stages with no caveat. A graduate lecture should note that 7 ± 2 is a memory-span heuristic, not a team-size law, and that Tuckman's sequence is descriptive. SEBoK p.995 itself notes non-sequential progression.
- **F25 (minor), the warm-up shows its own answers.** S2-01 displays the shaded "not yet committed" zone and the approving-authority outlines while asking Q2 and Q3, and the notes rely on covering the screen. *Fix:* use a question slide followed by a reveal slide, or a build.
- **F26 (minor), figure polish.** In S1-18 the AIT bar is painted over the IPT boxes and reads as an overlap. In S2-03 the REL-006 label collides with a box border. In S2-03 the REL-007 arrow ("013 is affected by 004") points from 013 to 004, against the direction of influence.
- **F27 (minor), the elicitation matrix does not discriminate.** "Structured brainstorming workshop" and "Focus group or workshop" have identical ratings in all five columns. *Fix:* merge or differentiate them.
- **F28 (minor), card-like slides.** About 11 of 49 slides are text-only, with the lower 40–50 % empty: S1-2, 4, 5, 7, 21, 22, 24, 28 and S2-13, 14, 18. Faculty asked for neither paragraphs nor short web cards. The figure slides meet that standard; these do not. *Fix:* add a working visual. For example, S1-2 could show the vertiport scene, S1-24 a role-class panel, and S2-14 the draft→need transformation side by side.
- **F29 (minor), .pptx legibility.** Full-figure slides embed the figure at about 50–60 % of the content width, leaving small label text: S1-13 context layers and S1-23 sweep. On S1-27 the two tables use different font sizes and wrap the stakeholder names. *Fix:* scale figures to the full width and use one table font size.
- **F30 (minor), counts and labels disagree across artifacts.**
  - The title slide and lesson list "five outputs", but the lab brief has six parts (AI statement).
  - The S2-19 charter figure gives Architecture "ENT, EXT", while S1-20 says "ENT, PRT, EXT".
  - The PRT prefix is never defined for students.
  - The outline's Section E header says 16 minutes, but its slides sum to 19.
  - The outline still uses P-numbers throughout, despite the mapping note.
- **F31 (minor), insurers are misclassified.** `aerolinkCase.ts:131` makes them "Customer, acquirer or funder". They neither buy nor fund the service. "Supplier (of insurance)" or an indirectly affected class would fit better. Placing them inside the enterprise "sharing one mission" (S1-10) is also debatable.
- **F32 (minor), loose wording in the notes.** S2-15 asks "find the need whose condition is weakest", then answers with one need that is "adequate" and one that is "clearest". NEED-004 ("hub vertiport") and the S2-07 example ("spoke") use hub and spoke terms the Data Sheet never defines.
- **F33 (minor), the handout has no figures.** `exports/lectures/week01-lesson.md` renders each figure as a caption plus alt text. If the Markdown is distributed as the "student handout", students lose 33 figures. *Fix:* embed the PNGs from `.figure-cache`.

---

## Faculty-notes sample (10 slides)

| Slide | Teachable by another instructor? | Worked solution / misconception | Transition and timing |
|---|---|---|---|
| S1-2 driving question | Yes; the vote procedure is clear | Misconception is real and correctly corrected | Present; 3 min is realistic |
| S1-7 three definitions | Mostly; "old course traffic-jam" is opaque (F16) | Corrections correct | Present; tight |
| S1-11 three scopes | Yes, strong | Correct; the NSoI issue is on S1-13 (F06) | Present; 2 min is tight |
| S1-13 context layers | Yes; good model answer for the think-pair-share | Correct; the NSoI content is wrong (F06) | Present |
| S1-19 communication paths | Yes | Worked solution correct; heuristic caveat missing (F24) | Present; overloaded (F01) |
| S1-27 answer | Yes; explicit counting rules, a model of checkable analysis | Correct; feeds the flawed exit ticket (F07) | Present |
| S2-4 needs versus requirements | Yes | Correct; R39b misattribution (F22) | Present |
| S2-8 well formed | Yes | One wrong correction, "needs are qualitative" (F08) | Present; 4 min for three layers and six attributes is tight |
| S2-12 conflict | Procedure clear | The case conflict itself is incoherent (F02) | Present; overloaded |
| S2-14 worked example I | Steps clear | Claims "form passes" (F04); 2 min is unrealistic (F01) | Present |

---

## Answers to the brief's questions

1. **Depth and sequence.** This is graduate depth, and the sequence is sound: frame, system, life cycle, team, stakeholders, then concerns, needs, worked example and lab. The problems are balance and time (F01, F20).
   - Gaps against the subject: no BMA or mission output for teams (F15).
   - Thin practical guidance on team formation: how teams are formed, skills inventory, managing conflict within the team.
   - Stakeholder analysis stops at influence and support. Legitimacy and urgency are absent, though they are outside the collection.
   - Nothing is padded or off-subject, apart from the generous amount of system-concept material.
2. **Accuracy and citations.** 39 of 41 instances verified. One wrong register entry (F22). Overclaims in F08, F09, F21 and F23. One unreconciled source tension (F14). No course convention is presented as sourced, except "needs are qualitative" (F08).
3. **Faculty notes.** Teachable, apart from opaque internal references (F16). Worked solutions are correct, apart from F04. Misconceptions are real, apart from F08.
4. **Slides and figures.** The design is professional and the figures are original and mostly correct. Defects: F03, F05, F06, F19, F25–F29.
5. **AeroLink case.** The counts and IDs are consistent and the deliberate gap is present.
   - Gap rationale is fragile (F13).
   - Several needs fail the lecture's own criteria (F04, F10, F11).
   - The worked conflict is incoherent (F02).
   - The SoI/enterprise distinction is made, but the SoI/NSoI/WSoI scopes are inconsistent (F06), and the enterprise is muddled by organizations being modeled as external systems (F03).
6. **Student lesson.** Coherent, and aligned slide for slide. Two exceptions: no inline citations in Session 2 (F17) and no figures in the Markdown handout (F33).
7. **Copyright.** Quotes are short and attributed, but the SEBoK license attribution is missing and three passages are close paraphrases (F18).

---

## Improvements that would lift this to an excellent graduate lecture

1. **Re-time both sessions with explicit buffers.** Make the worked demonstration the longest segment of Session 2: concern → need live, then an audit in which students find the second tension themselves.
2. **Make the case data exemplary by the lecture's own rules.** That means SEBoK-form needs naming the SoI, singular statements, a coherent noise conflict on exposure, a cleaner deliberate gap, and external systems that are systems.
3. **Add a BMA layer for teams.** That means a problem statement, a mission and two goals, with needs traced to them, so that "why before what" is practised and not only asserted.
4. **Replace the operation-centred sweep figure.** Draw prompt → stakeholder links, and let students run the sweep live on the hospital helicopter-pad analogue from S1-2 before seeing AeroLink.
5. **Add one short critical-perspective segment.** Cover the limits of the 7 ± 2 rule, Tuckman and MITRE's change-management map when applied to regulators. Ask the faculty to add one stakeholder-salience source (for example Mitchell, Agle and Wood) so that legitimacy and urgency can be taught as sourced material, not course convention.
6. **Convert the eleven card-like slides into working visuals.** Split the warm-up into question and reveal. Scale figures to full width in the .pptx.
7. **Add the SEBoK license line, inline citations in the Session 2 lesson, and embedded figures in the handout.**
