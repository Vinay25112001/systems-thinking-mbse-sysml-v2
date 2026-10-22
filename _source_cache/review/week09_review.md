# Week 9 independent review: Needs / Requirements (Phase II, SysML v2), uncommitted package of 2026-10-21

Reviewer: independent reviewer, not the author. Roles taken: senior SE professor with SysML v2 expertise, instructional designer, QA. Date: 2026-10-22.

**Standard applied**
- DECISION_LOG A20–A28.
- DECISION_LOG W4: SysML v2 is cited as "2.1 Beta 2 (Release 2026-07)".
- COURSE_SCHEDULE.md row 9.
- Directive §2 (continuity) and §3D: teaching diagrams are kept apart from standard notation; textual SysML is validated with a reference implementation; a custom visualization is never called a SysML v2 tool.
- Templates: the Week 7 and Week 8 reviews, confirmation and recheck.

**Scope**
- Builder report: `learning-studio/docs/lectures/week09/WEEK9_MILESTONE_REPORT.md`.
- Lectures: `src/content/lectures/week09/*`.
- Figures: `LectureWeek9{S1,S2,Code}.tsx` and `week9FigureKit.ts`.
- Week page: `src/week9/*`.
- Quiz, assessment, path and lab: `quizWeek9.ts`, `week9Assessment.ts`, `week9Path.ts`, `lab/week09Lab.ts`.
- Lab tool: `src/workbench/week9/*`.
- SysML: `sysml/lectures/week09/*` and `sysml/instructor/week09/*`.
- Register: R114 and R115.

**What I did, and what I did not do**
- I edited no file except this one. No git operations, no generators, no installs, no Playwright.
- **Checker.** I ran it once (`python -I scripts/check_sysml.py sysml/lectures/week09`), with the report going to my scratchpad. I had first confirmed that no other checker run was active.
  - Result: 15 files, 12 PASS and 3 FAIL. All three FAILs are the `invalid_*` files, as intended.
  - All 15 SHA-256 values and all diagnostics are identical to `week09-report.json`. That includes the 2 inherited duplicate-name warnings and the 1 "Bound features should have conforming types" warning.
  - The report's 16th file is `sysml/instructor/week09/exercise_flood_warning_key.sysml`, recorded as PASS. Its current SHA-256 (`3ca2bb85…8bc9`) matches the recorded one, so the validated content is unchanged. I did not re-run the checker on it, to keep to one run.
  - The builder's "13 PASS + 3 intended FAIL" is therefore **confirmed**.
- **Unit tests.** I ran vitest on 18 files: the Week 9 workbench, lectures, figures, quiz, lab and the old `activities/week09`, plus `shortAnswers`, `content.test`, `lib/sysml`, `sysmlDrift`, `sysmlMapping` and `sysmlWeek08`. Result: **1,046 passed, 0 failed**.
- **Type check.** `npx tsc -b`: **exit 0**.
- **Student build.** `npm run build:student` plus the leak check: **PASS** (exit 0).
  - Both Week 9 student decks ship with notes blanked: 24 and 21 notes slides, all empty.
  - 16 of 18 decks are shipped.
  - No exam, instructor, faculty, pending-decision or server markers are present.
  - The instructor key (`FloodWarningKey`, `calmEnough`) does not appear anywhere in `dist-student`.
- **Spec citations.** I checked these against the register text (`2a_OMG_Systems_Modeling_Language.txt`, which is 2.1 Beta 2, and the textual-notation training deck):
  - R83 pp.161, 162, 165, 167, 168
  - R84 pp.175–176
  - R80 pp.50–51
  - R114 p.556
  - R115 pp.580–581
  - R74 sl.90
  - R76 sl.105

  I also checked the Requirement Derivation, Modeling Metadata and VerificationCases library sources in the pilot 2026-08 library. Every quotation I checked is verbatim and on the cited page.

## Verdict: **REVISE** (light; one major, the rest moderate or minor)

This package is careful and, on almost every point, technically right.

**SysML v2 content: correct almost everywhere.** The following all match the 2.1 Beta 2 text and the library:
- The requirement as a constraint definition (p.161).
- The subject as first parameter, which the checker enforces.
- The short name as requirement ID (p.165).
- assume ⇒ require as the effective constraint (p.165).
- Actor and stakeholder parameters (p.162).
- Frame making the concern a required subrequirement (p.167).
- satisfy binding the satisfier to the subject (pp.162, 168).
- verify inside a verification objective (p.176).
- `StatusInfo`/`StatusKind::tbd|tbc`, `VerificationMethodKind::demo`, and `Refinement` (p.556).
- Derivation semantics, `originalImpliesDerived` (pp.580–581), including the warning that the direction runs against the common intuition.

The dependency direction rule (`from` = client, the dependent element; R80 pp.50–51) is stated once and applied consistently to `#serves`.

**Checker evidence is reproducible.** Listings are proven verbatim excerpts (`sysmlWeek09.test.ts`). The predict and calibration slides quote recorded diagnostics.

**Continuity is exemplary:**
- AeroLink v0.2 is *generated* from the Week 1, 2, 3 and 5 case modules on top of the Week 8 v0.1 text. Nothing is retyped (`aerolinkCase.ts:1-27`, tested).
- NEED-006 and NEED-008 are closed exactly as the Week 7 review deferred them (`week07/aerolinkCase.ts:251`; Week 2 `PARTIAL_COVERAGE`, `week02/aerolinkCase.ts:443-447`). NEED-017 correctly stays open on TBR-02.
- The new IDs continue the sequences and collide with nothing in the repo:
  - REQ-STK-020 and REQ-STK-021 after REQ-STK-019;
  - U-010 after U-009;
  - TBD-08 after TBD-07.

  (TBD-09 appears only as a negative fixture in a Week 3 test.)
- The parents CAP-001 and CAP-009 exist with matching text (`week02/aerolinkCase.ts:284,292`).

**The lab tool works in both directions:**
- It refuses a JSON file in the model field, an AeroLink model, and a Week 1 file in the Week 2 field.
- It accepts short valid entries.
- It rejects empty answers and claimed fixes in dispositions.
- Re-importing a generated file is idempotent, and the trace matrix is computed from the derivations.

**Why REVISE rather than sign-off.** One major finding: a SysML v2 grouping rule is taught on a slide and in the lesson that contradicts the example on the very pages it cites (M1). Two moderate findings break the lab method's own instructions (N1) and the assessment key (N2).

Counts: **blocker 0 · major 1 · moderate 4 · minor 9**.

## Findings

| ID | Severity | File:line | Evidence | Fix |
|---|---|---|---|---|
| M1 | **Major** | `src/content/lectures/week09/session1.ts:484, 489-490, 493, 500, 843`; `src/components/figures/LectureWeek9S1.tsx:272-274`; generated doc `src/workbench/week9/requirements.ts:716` | Slide body: "Members with different subjects: an organizing group, **never satisfied as a whole**". Notes and lesson: "if the members keep different subjects, no single element conforms to all of them". The figure chip reads "never as a whole". The cited sources show the opposite pattern. R83 p.167: `requirement engineRqts : EngineRequirementsGroup { subject engine = vehicle.engine; }` inside a group whose subject is `vehicle`. R74 sl.90 (cited on this slide): `engineSpecification` groups requirements whose subjects are `clutchPort = engine.clutchPort` and `generateTorque = engine.generateTorque`, and "the subject of a grouped requirement can also be bound explicitly". So members with different subjects **are** satisfiable together when each member's subject is bound to a feature of the group's subject. That is the standard pattern students need in Week 11, when one design satisfies a group through its parts. The claim is true only of the AeroLink `systemRequirements` group, whose members have independently typed, unbound subjects and which has no group subject. | Restate it as: "a group whose members keep independently typed subjects, not bound to the group's subject or to its features, cannot be satisfied as a whole". Add the binding pattern (`subject x = group.subject.feature;`) as the way to make a satisfiable group, with p.167 or sl.90 as the source, and preview it for Week 11. Change the chip and the generated doc to match. |
| N1 | Moderate | `src/content/lab/week09Lab.ts:78` ("Justify each assumption in one sentence in the **trace-audit note**"), `:79` ("Carry any Week 2 partial-coverage open item into the audit"), `:104` (evidence "the Week 2 open items carried"); `src/workbench/week9/Week9LabTool.tsx:322`; `state.ts` (W9State) | The lab tool has no trace-audit note field. `W9State` has no free-text audit field, and `matrixMarkdown` writes none. The tool does not read Week 2 partial-coverage items, which are not in the Week 2 export (`grep partial` finds nothing in `workbench/week9` or `week2/record.ts`). A partly covered need has one derivation, so `traceRows` reports it as **covered** and raises no finding. The help text ("carry that open item in the disposition of the matching finding or in your trace-audit note") points at a finding that does not exist and a note that does not exist. Quiz Q7, the trace slide and the rubric evidence all require this carry-over, so a team that does exactly what the tool allows submits a matrix showing those needs as covered. | Add an "audit notes / carried open items" text area to the tool state and to the exported `.md`, under its own heading. Also add one row per need that the team marks "partly covered" (need ID, missing part, owner, week), and show those needs as "partial" in the coverage column. Alternatively, rewrite the lab text and help so that the team edits the `.md` by hand, and say so in the rubric. |
| N2 | Moderate | `src/content/week9Assessment.ts:65` (diagnosis rubric, level 4) | The key fixes one classification: "REQ-STK-003 names a solution (the SMS gateway) … **a validation finding** against the need". The course taught "design-free" as a requirement *characteristic*: the Week 2 critique F3 is "Design-free; leave white space" (`week02/aerolinkCase.ts:455`). Session 2 (`session2.ts:123,129`; R13 p.566) defines requirement verification as conformance to the characteristics. A student who classifies REQ-STK-003 as a *verification* finding (it fails the implementation-free characteristic) is consistent with the course, but the key as written marks that answer down. The REQ-SYS-003 classification is not stated at all ("cannot be verified as written" is ambiguous between requirement verification and system verification). | Accept either classification when the reason given matches the definition used: a characteristic breached means verification; intent of NEED-001 not communicated means validation. State the expected classification of REQ-SYS-003 explicitly (requirement verification: the condition is missing, so the requirement is not verifiable as written). |
| N3 | Moderate | Figure captions in `session1.ts:196, 286, 431, 489, 611, 670-672` (satisfy preview) and `session2.ts:119`; builder report §8 | Directive §3D requires teaching diagrams to be kept apart from standard notation. Only one caption (`session1.ts:640`, the trace thread) and one callout (`:645`) say "a course illustration, not SysML v2 graphical notation". Several other box-and-arrow figures carry labeled relationship arrows (frame, derivation, satisfy, verify), which SysML v2 graphical notation also defines symbols for, and they have no such label: the table-vs-model figure, the subject figure, the frame figure, the groups figure, the ladder and the satisfy preview. The satisfy preview comes one slide after the disclaimer, but the frame figure (slide 13) comes seven slides before it. The builder report's claim that the visualizations are "labelled as such" is true of one figure. | Add "Course illustration, not SysML v2 graphical notation." to every relationship-diagram caption, or stamp it in the figure kit. Alternatively, put one disclaimer on the first such slide (`w9s1-table-vs-model`) and point back to it. Correct the report §8. |
| N4 | Moderate | `src/workbench/week9/state.ts:146,148` (`aiProblem`) | The AI review log gate uses `said()` for the quote and the reason. `said("none none")`, `said("n/a todo")` and `said("tbd, later")` are all true, because `EMPTY_ANSWER` is anchored to a single token. The shared module provides `saidSomething()`/`isEmptyEveryWord()` for exactly this case (Week 5 confirmation N1/N5, M5), and `dispositionProblem` in the same package uses it (`requirements.ts:354`). So an AI finding with the reason "n/a n/a" counts towards the 8-finding minimum. | Use `saidSomething` for the quote, the reason and the change in `aiProblem`, and add a negative test ("none none" as reason → refused). |
| m1 | Minor | `session1.ts:446` (frame misconception) | "framing one it does not answer makes the need **unsatisfiable** as stated" overstates it. An extra frame adds a required subrequirement (p.167), so the need then also requires that concern to be addressed. The notes at `:441` say this correctly. | "…makes the need also require that concern to be addressed, which nothing in it does." |
| m2 | Minor | `session1.ts:675` | "Never between two requirements: that is a derivation" is stated like a language rule. The checker gives only a type-conformance warning (the predict item shows this), and the spec forbids nothing here. | Prefix "Course rule:" or "Do not write it between two requirements (course rule)". |
| m3 | Minor | `session2.ts:384-406` | The title "Reveal: two of three are wrong, one is caught" and the debrief "two of the three are semantically wrong, and only one is rejected" do not match the table, which marks all three "No". Card 1 is wrong too (syntax); card 3 gets a warning. | Title: "Reveal: all three are wrong; only the syntax error is rejected". Debrief: "the two semantic errors pass; one draws only a type warning". |
| m4 | Minor | `session1.ts:233, 290, 586, 674, 793` | Definitions are attributed to "SysML v2.1" without "Beta 2". DECISION_LOG W4 requires "2.1 Beta 2", never the final standard, and Week 8 complies throughout. | Use "SysML v2.1 Beta 2" in the term labels and the lesson sentence. |
| m5 | Minor | `labBrief.ts:26`; `requirements.ts:709` vs `session1.ts:489` | Terminology drifts. The slide contrasts a "specification group" (shared subject) with an "organizing group" (own subjects). The mapping table and the generated doc call the shared-subject stakeholder group an "Organizing group". | Use one term pair everywhere. |
| m6 | Minor | `labBrief.ts:77` (`COMPLETION_CLAIM`), `requirements.ts:355` | The regex refuses legitimate future-tense dispositions, such as "Open item: to be resolved in Week 10 (owner: Architecture lead)" or "…to be done with the vertiport layout". The message shown ("A fix cannot be recorded as a sentence here") then misleads the student. This is inherited from the Week 7 approach, so I list it but do not block on it. | Exempt future or modal forms ("to be / will be / once … is"), or reword the message: "If this is a plan, write it without 'resolved/done' …". |
| m7 | Minor | `src/workbench/week9/requirements.ts:696` | The tool writes a team's assumption as `assume constraint { doc /* … */ }`, with no expression. Its truth value is unconstrained, so the generated requirement does not have the gate semantics taught on `w9s1-assume` and Worked example V. Nothing tells students that this is informal. | Add one line to the field label or help: "Written as an informal assumption (doc only); write the condition as an expression by hand if it should gate the requirement". |
| m8 | Minor | `sysml/instructor/week09/exercise_flood_warning_key.sysml:38-43` | The key formalizes REQ-STK-001 as `residentsWarnedBeforeFloodingPercent >= 95`. The "at least 60 min before" lead time survives only in the doc, so a key that rubric row 2 holds up as exemplary drops half the criterion. | Rename the feature to `residentsWarned60MinBeforeFloodingPercent`, or add a lead-time attribute. Then re-run the checker and record the result. |
| m9 | Minor | `playwright.lectures.config.ts` | Systemic, recorded as directed and not fixed here. The Week 9 e2e specs pass only with `VITE_BACKEND=none`. Without the course server, the backend probe (`src/services/backend.ts:56`) logs a 502 that fails the "no console errors" assertions. `playwright.config.ts` sets `VITE_BACKEND: 'none'`; the lectures config does not. Week 8 specs fail the same way. | Set `env: { VITE_BACKEND: 'none' }` in the lectures config, or make the probe silent on 502. This is a cross-week task. |

## Checks that passed (evidence)

- **Requirement construct.**
  - `requirement_anatomy.sysml` puts the subject first, a typed attribute, `require constraint`, and a usage binding `:>> limit = 2 [s]`.
  - The calibration rows "Subject must be first parameter." and "A requirement must be typed by one requirement definition." are reproduced.
- **Short names.** `<'REQ-…'>` is quoted everywhere. The unquoted form fails at 3:18, as recorded.
- **Derivation.** It is written with `#derivation connection { end #original ::> parent; end #derive ::> child; }`. This matches `RequirementDerivation.sysml` / `DerivationConnections.sysml` (pilot 2026-08). The parent is `#original` in every AeroLink, fixture and key connection I read (`aerolink…v02.sysml:839-905`).
- **Needs as requirement usages.** This is labelled a course convention on the slide (`session1.ts:470` "Course convention: a need is a requirement usage whose subject is the enterprise") and in the notes ("a course modeling choice, not a rule of the language"). It is also in the model's package doc and in report §10.1 as a faculty item. Needs stay distinct from requirements (a SEBoK R13 p.558 quote on the first recall slide), consistent with Weeks 1–2.
- **Concerns and stakeholders are model elements.** Week 8 concern usages have subject and stakeholder. Needs carry `stakeholder` parameters typed by `STK-*` part definitions, and `frame` to `CON-*`.
- **satisfy and verify.**
  - satisfy is previewed with the right semantics. It is not written into team models, and the rubric scores it from Week 11.
  - verify is placed in a verification case's objective (R84 p.176).
- **Quiz Q9 (12 items).**
  - Keys a, b, c and d appear three times each.
  - The key's length rank is 1/2/3/4 three times each (computed). No run of three.
  - No "all/none of the above".
  - Every item is unseen and never AeroLink. Stems are neutral.
  - Weak cues remain, but they are within the Weeks 3–6 tolerance:
    - Q10's key is the longest option and the only "list of three", and option d is short (28 characters).
    - Q7's key is the longest and uses the course phrase "open item with an owner".
    - Q3's key repeats the stem's "pump controller", though distractor b also echoes the stem.

  The faculty may wish to shorten the Q10 key.
- **Rubric.** Five criteria, each with four distinct, observable level descriptors, 4 points each (20). Graduate and other versions of task 5 are both described.
- **Workload, recomputed by hand.** Total **7.8 h ≤ 8.0**. The rows:
  - class 2.5
  - readings 12 pp / 15 = 0.8 (R83 8 + R13 2+1+1)
  - slides 6 / 30 = 0.2 (R74 86–91)
  - lesson 0.6
  - lab 10.0 person-hours / 4 = 2.5 (1.2+0.3+2.0+2.4+1.0+1.4+0.8+0.5+0.4)
  - quiz 0.3
  - exercise 45 min → 0.8 (0.75 rounded up)
  - log 0.1

  A team of three: 7.5 / 3 = 2.5 h each.
- **Lab tool gates.**
  - Refusals tested: JSON in the model field, an AeroLink model or Week 1 record (`requirements.ts:145,257`), and a Week 1 file in the Week 2 field (`week2/record.ts:1099`).
  - Empty or claimed-fix dispositions are refused (`requirements.ts:352-356`). Short valid entries are accepted (tests at `requirements.test.ts:140-147` and `Week9LabTool.test.tsx:62-86`).
  - A team mismatch across the three files is reported.
  - AI IDs are never reused.
- **No internal codes on student pages.** Searched: A2x, DECISION_LOG, outline §, "instructor to confirm". The only hit is "proposed, pending faculty approval" on proposed objectives, which is the Week 7 and Week 8 precedent. Quiz slide IDs are rewritten by `readableSlideRefs`. "Learning objectives" wording is used.

## Faculty items (decisions only the instructor can make)

1. The convention that needs are modeled as `requirement` usages in a Needs package, with the enterprise as subject (report §10.1). I recommend approval; it is labelled honestly.
2. Adding REQ-STK-020, REQ-STK-021, U-010 and TBD-08 (owner: Vertiport Infrastructure Manager; close-by: the Week 11 layout review) to the AeroLink canonical data. Approving them makes them binding on Weeks 10–12 (CAP-001 and CAP-009 links, Week 11 allocation).
3. The AI-assisted review method with a minimum of 8 findings (6 for a team of three).
4. Formative grading of Lab L9; proposed objectives W9.4–W9.6 (the quiz already tags W9.4 and W9.5); exam placement of the applied exercise. Also whether 45 minutes is enough for three SysML modeling tasks plus diagnosis and task 5.
5. Register additions R114 and R115. Their text and pages are verified.
6. The code-listing exemption from the projector type rule (Week 8 precedent).
7. New, from this review (N2): whether the diagnosis rubric accepts either requirement verification or requirement validation for a design-prescriptive requirement, when the reason given matches.

## Required for sign-off

Fix M1, N1, N2, N3 and N4. The minor findings may be batched. A confirmation pass needs only these:
- the re-generated listings and figure for M1;
- the tool state and `.md` for N1;
- the rubric text for N2;
- the captions for N3;
- `aiProblem` plus its test for N4;
- one checker run if the key or a listing changes.
