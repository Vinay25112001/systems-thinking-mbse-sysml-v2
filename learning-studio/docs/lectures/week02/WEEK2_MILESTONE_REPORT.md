# Week 2 milestone report: ConOps / Requirements

**Date.** 2026-10-19. **Status.** Built to the Week 1 template (DECISION_LOG A21); every item is new and pending independent and faculty review. Nothing has been committed.
**Governing documents.** DECISION_LOG A19, A20 and A21; `COURSE_SCHEDULE.md`; `COURSE_PRODUCTION_PLAN.md`; `docs/lectures/week02/WEEK02_LECTURE_OUTLINE.md`.

## 1. Files

| Area | File |
|---|---|
| Case data (single source) | `src/content/lectures/week02/aerolinkCase.ts`, `aerolinkCase.test.ts` |
| Lab brief (minimums, gates, fields, person-hours) | `src/content/lectures/week02/labBrief.ts` |
| Lectures | `src/content/lectures/week02/session1.ts`, `session2.ts`, `timing.test.ts`; registered in `src/content/lectures/index.ts` |
| Figures (40, original) | `src/components/figures/LectureWeek2S1.tsx` (22), `LectureWeek2S2.tsx` (18); delimited `--- week02 ---` block in `registry.ts` |
| Week page text, workload | `src/content/week2Path.ts` |
| Assessment | `src/content/quizWeek2.ts`, `quizWeek2.test.ts` |
| Lab instructions (single source) | `src/content/lab/week02Lab.ts`, `week02Lab.test.ts`; generated `docs/lectures/week02/WEEK2_LAB_INSTRUCTIONS.md` |
| Lab tool | `src/workbench/week2/record.ts` (logic), `Week2LabTool.tsx` (UI), `week2tool.css`, `fixture.ts` (test fixture), `record.test.ts`, `Week2LabTool.test.tsx` |
| Web pages | `src/week2/route.ts`, `WeekNav.tsx`, `WeekShell.tsx`, `Week2App.tsx`, `Home.tsx`, `Examples.tsx`, `exampleParts.ts`, `Lab.tsx`, `Assessment.tsx`, `Readiness.tsx` |
| E2E | `e2e/week2-flow.spec.ts`, `e2e/lectures-week2.spec.ts` |
| Exports | `exports/lectures/week02-session1.pptx`, `week02-session2.pptx`, `week02-session1-notes.md`, `week02-session2-notes.md`, `week02-lesson.md` (copies in `public/lectures/`) |
| Register | `_source_cache/verification/readings.py` (R39m–R39p), `readings_verified.txt`, `src/content/readings.generated.json` |

**Shared changes (additive, backward compatible).** `src/App.tsx` (Week 2 routes, `/archive/week/2`, workbench exclusion); `src/lectures/Chrome.tsx` (Week 2 navigation in viewer/handout/reader); `src/lectures/route.ts` (`backOf` for Week 2); `src/pages/Dashboard.tsx` (Week 2 path card, "Available (pending review)" badge); `scripts/build-lab-md.mjs` (also writes the Week 2 instructions; Week 1 output byte-identical); `playwright.lectures.config.ts` (adds `lectures-week2.spec.ts`); `e2e/app.spec.ts` (Week 2 branch in the every-week test); `src/content/content.test.ts` (register count 115 → 119). No Week 1 file was edited.

## 2. Sessions and slides

| Session | Slides | Content | Buffer | Lecture / lab |
|---|---|---|---|---|
| 1 From needs to operations: ConOps, scenarios, capabilities | 23 + references | 69 min | 6 min | all lecture |
| 2 Writing, checking and tracing requirements; measures; lab launch | 21 + references | 69 min | 6 min | 47 min lecture, 22 min lab launch (brief, scenario selection, scenario clinic, close) |

Structure follows the outline (sections A–F and G–K) with three changes: the Session 2 warm-up is split into question and reveal (Week 1 lesson); worked examples are numbered I–VIII across the week; TPMs are deferred to Week 3 (A21 item 5). The two worked-scenario and critique slides use full-width figures (the worked steps live in the notes).

## 3. Faculty notes

Every slide carries teach, why, figure walk (where a figure exists), transition, timing and misconceptions; worked slides carry the full worked solution. Spoken notes average 70–110 words per minute and never exceed 130 (tested); lecture slides carry at least 40 spoken words per planned minute (tested). Notes give the source page for every claim, state course conventions as such, and include instructor-decision prompts (operating-day clock times, the scenario-boundary choice, the proposed capabilities). Instructor build: 24 + 22 speaker-note slides (about 106,000 characters). The student build strips every note and purpose (`check-student-build.mjs`: 967 markers absent from `dist-student/`, present in `dist/`; student decks have empty notes).

## 4. Engineering examples (AeroLink, FICTIONAL)

- ConOps: existing situation, justification and restrictions, proposed system, environment table, user interactions, OV-1-style overview.
- Five scenarios on the course template (structured steps and alternates); SCN-005 worked in full. **One scenario exposes a deliberate gap:** SCN-005 exposed NEED-011, which is kept without a requirement (missing requirement, not a missing link; reason and wrong fix recorded).
- Needs × scenarios coverage for all 17 corrected needs, with reasons for unexercised needs and one finding (NEED-013).
- 14 capabilities (10 reference; CAP-007 corrected to both noise limits; CAP-011–014 proposed for NEED-012–017).
- 17 stakeholder + 12 system requirements, all traced through their parents to the corrected Week 1 needs (imported read-only). **The noise correction flows down:** REQ-STK-011 (event cap, TBD-03/U-003) → REQ-SYS-011, MOE-007, MOP-010 (proposed). Tests: every trace resolves to a Week 1 need id; no orphan requirements; exactly one childless need (NEED-011); every childless stakeholder requirement has a disposition; each audit helper shown able to fail.
- Quality critique F1–F6 worked in full (four found by word-level checks, two need judgment); TBX register U-001–U-006 and A-008 (TBR-01/02 numbered and owned).
- MOEs 001–007, MOPs 001–010 with thresholds and data sources.
- Worked-examples page with a reference catalogue (consult as needed, not counted in reading load) and an optional paper exercise on the deliberate gap.

## 5. Laboratory

- Instructions: purpose, inputs (the Week 1 Team Record), objectives, eight-step method with "taught in" slide references, ten-step procedure, outputs, Parts 7–11 with evidence and minimums (team of four and of three), rubric rows from the register (RB-2.3–2.5, RB-3.1–3.6, RB-4.1–4.3, RB-12.1–12.3), submission, workload. Page and Markdown from one module; a test fails if they differ.
- Tool (`#/week/2/lab/tool`): imports the Week 1 model-inputs JSON (versions 1–3, read with Week 1's own importer) or the Week 1 record saved in the browser; ConOps, scenario editor, discovery log, uncertainty register, coverage matrix, capabilities, requirements, trace audit with dispositions, MOE/MOP, AI statement; exports Markdown and versioned JSON (`week2-model-inputs`, v1) and imports a teammate's Week 2 JSON with validation.
- **Hard gates only for real defects** (labBrief `REQ_HARD_GATES`: one "shall", subject, existing non-inverted parent, type, method, criterion, value-or-TBX on performance requirements, owned TBX, non-restating rationale); **advisories** never block (vague, maximize, negative, single point, design wording, compound, method fit). Tests show every gate failing alone and every advisory leaving a good requirement counted, including the known false positives (a fare-display requirement with no number counts; a tracked negative counts with an advisory). Scenario gates likewise, with the actor-inside-boundary check.
- 80 unit tests in the lab modules; e2e covers good and bad import and the versioned export.

## 6. Assessment

Quiz Q2: 12 items, unseen non-AeroLink contexts, all seven objectives, keys a–d three each, key length rank 1–4 three times each with no run of three and no ties (tested, with a negative test); every item names its slide and lesson section, the deciding phrase is in that section, quoted slide numbers match, keys share no 8-word run with the lesson, prompts share none with the slides. Applied exercise and graduate memo specified on the Assessment page.

## 7. Sources verified (claim table)

Every page below was opened in `_source_cache/*.txt` and supports the claim.

| Claim (as taught) | Source |
|---|---|
| System Requirements Definition is the third 15288:2015 technical process | R98 p.1001 |
| SRD turns the stakeholder view into a developer view; inputs are life-cycle concepts and the integrated set of needs; requirements definition is engineering | R13 p.557 |
| Needs black box / requirements white box; requirements at the SoI's level, what not how; more than changing the subject | R13 p.558 |
| INCOSE NRM requirement definition (as quoted by SEBoK); one need may yield several requirements; attributes; rationale; verification criteria | R13 pp.558–559 |
| Example categories; each category must be addressed | R13 p.560 |
| Budgeting creates dependent requirements | R13 p.562 |
| TBD/TBR, TBX management; traceability and change impact | R13 p.565 |
| Requirement verification vs validation; not system V&V; review methods; INCOSE GtWR cited | R13 p.566 |
| Operational concepts include modes, scenarios, use cases, misuse cases, loss scenarios | R10 p.546 |
| Measures expressed as MOEs | R10 p.544 |
| Elicit off-nominal use cases, misuse cases, loss scenarios | R11 p.553 |
| Enterprise capabilities meet needs; 150,000 passengers example; capability gaps | R12 p.862 |
| "Needs and requirements not traced to a source" as a measure | R14 p.478 |
| MOEs, MOPs and TPMs in technical measurement | R15 p.532 |
| Certification as a fifth verification method; airworthiness | R16 p.769 |
| Stakeholder requirements transformed into more formal statements (29148) | R39a p.1632 |
| Operational concept definition | R39g p.1579 |
| System requirement definition (15288) | R39l p.1652 |
| Concept of operations definition; "slightly different" | R39m p.1469 (new) |
| Operational scenario definition; used to evaluate requirements and verify/validate | R39n p.1581 (new) |
| Use case definition | R39o p.1669 (new) |
| Capability definition (SEBoK); feature/capability/benefit example | R39p pp.1457–1458 (new) |
| Bidirectional traceability, orphans, childless parents ("ultimately"); RTM | R45 pp.118–119 |
| Derived requirements come from solution decisions | R48 p.146 |
| SRD translates capability needs into technical requirements | R48a p.141 |
| Requirements Analysis decomposes needs into clear, achievable, verifiable requirements; DoD characteristics list | R48b pp.142, 144 |
| Demonstration, examination, analysis, test | R49 pp.149–150 |
| CONOPS definition; purpose; first step to requirements; objectives with rationale; update after testing | R52 pp.298–299 |
| IEEE 1362 as guideline; critical components; additional objectives | R52 pp.300–301 |
| Best practices: user language, graphics, environment, safety/security/privacy; "highly reliable" | R52 p.302 |
| MITRE characteristics; shall/should/may/will | R54 pp.329–330 |
| MOE, MOP, KPP; OV-1 for external interfaces | R54 pp.330–331 |
| White space; checklist kinds; shall not, maximize, ranges, thresholds/objectives; every requirement a method; level of detail | R55 pp.367–371 |
| Use cases, actors (primary/secondary), threads, test basis, trigger to goal/failure, intent not UI, review questions, pitfalls, parameterization, stopping rule | R59 pp.452–456 |
| Phase II destinations (named only) | R72 pp.30–47; R74 pp.86–91; R75 pp.96–97; R76 pp.100–107 |

**Course conventions (labeled as such, no source claimed):** the scenario template (no source gives one field set), the three-kind scenario minimum, the ConOps deliverable contents, the four requirement types, the minimum requirement record, the REQ-STK/REQ-SYS subject rule, the coverage matrix, the hard-gate/advisory split, the lab minimums, person-hours and the decision rules. **Source gaps:** IEEE 1362-1998, INCOSE GtWR and NRM, ISO/IEC/IEEE 29148 (available only through the SEBoK glossary).

**Register additions** (via `readings.py` → `verify_readings.py` → `npm run content:readings`, all four title-verified as entry headings), **pending faculty confirmation:** R39m Concept of Operations (glossary) p.1469; R39n Operational Scenario (glossary) p.1581; R39o Use Case (glossary) p.1669; R39p Capability (glossary) pp.1457–1458.

## 8. Workload (A21 item 4)

Team of four: 8.0 h per student (class 2.5; readings 12 pp 0.8; lesson 7,600 words 0.8; candidate scenario 0.3; lab 10.5 person-hours ÷ 4 = 2.6; quiz 0.3; applied exercise 0.6; log 0.1); graduate 8.2 h. Team of three: minimums reduced in proportion (2 scenarios, 3 capabilities, 6 requirements, 2 MOE, 2 MOP) → 7.9 person-hours, 2.6 h each (tested within 0.1 h). Essential readings were trimmed to 12 pages (R54 and R13 p.560 moved to extension) so the detailed lesson fits the budget; the lesson sits just under the 0.8 h rounding limit (7,650 words), so any lesson addition must be offset (the timing test fails otherwise).

## 9. Tests and gates (final run)

`npx tsc -b`: Week 2 clean (one error elsewhere, `src/workbench/week8/skeleton.ts`, another agent's in-progress file). `npx oxlint src`: 0 errors. `npx vitest run`: 1,252 tests; Week 2 suites all pass; two unrelated activity tests (Weeks 7 and 11) failed once under load and pass in isolation. `npm run lectures:pptx`, `npm run build`, `npm run build:student` (PASS). Playwright: `week2-flow.spec.ts` 6/6 (axe light and dark, 1440 and 400 px, every Week 2 page); lectures config 13/13 including `lectures-week2.spec.ts` (axe on every Week 2 slide with notes, handout, reader); default config full run green after a serial re-run (first parallel run had load-related timeouts on the shared 5173 server).

## 10. Outstanding deficiencies

1. Independent review not yet run (Week 1 had one); every item is `new-pending-review`.
2. Faculty decisions: proposed capabilities CAP-011–014, REQ-STK-011–017, REQ-SYS-011–012, MOE-007, MOP-010, U-003–U-006 values (TBD-03/04, 400 m, 2.0×); scenario boundary versus Week 1 SOI-001; three-person minimums; register entries R39m–R39p; W2.6/W2.7 and W2.2 at Analyze; Session 2 split.
3. `course.ts` Week 2 still lists "Measures: MOE, MOP and TPM" and the broad reading list; the week page uses `WEEK2_TOPICS`/`week2Path.ts`. Updating `course.ts` (and Week 3 topics) is left for the faculty decision on A21 item 5.
4. The outline (`WEEK02_LECTURE_OUTLINE.md`) still says "one per member" scenarios and the earlier three-person minimums; the implementation supersedes it.
5. Lab tool: the "use the Week 1 record saved in this browser" route is untested; ConOps word minimums and 5-word dispositions are tool conventions; REQ-STK-007 raises a harmless `design` advisory (the word "using").
6. Spelling scan (`src/flow/spelling.test.ts`) does not cover Week 2 files; the case and lab tests check American spelling themselves.
7. The full Playwright run regenerated Week 1 screenshot PNGs under `screenshots/` (week1-flow, lectures, week1-workbench); `screenshots/workbench/*` was not touched.

## 11. Dec 1 risk

Week 2 took about one working day with parallel production (figures and lab tool delegated). At that rate Weeks 3–6 and 8–13 (10 content weeks) need roughly 10–12 working days plus reviews, against six weeks to 1 December: **feasible, moderate risk.** The binding constraints are faculty turnaround on proposed values and the independent review per week, and the lesson-length/workload ceiling, which forces trimming rather than expansion. Recommend batching faculty confirmations weekly and starting Week 3 from this template now.
