# Week 1 Deep Audit: Team Formation / Needs / Identifying Stakeholders

Audit date: 2026-10-21. Read-only discovery audit. Repo `C:\Users\w451vxs\Documents\Course_Work\SysML`, app `learning-studio/`.
Baseline: **HEAD `8b9637d`** (2026-10-19 20:56). All paths below are relative to `learning-studio/` unless stated.

**Commit state for Week 1:** Week 1 is committed at HEAD. One uncommitted working-tree change touches it:
`src/workbench/week1/team.ts`, where `EMPTY_ANSWER` moves into the **untracked** file `src/workbench/emptyAnswer.ts`. The
working copy therefore depends on an untracked file. HEAD does not. Everything below describes HEAD unless marked otherwise.

**Method.** I read the sources and checked line references. I counted slides by `layout:` occurrences in the session files
and pptx slides with `unzip -l`. I counted citations by grepping `R('Rxx'` and `reading: 'Rxx'`. I made one curl check
against the running dev server: `/` and `/lectures/week01-session1.pptx` both return 200. Hash routes render on the
client, so the findings come from the source.
I did not run any tests. "Tested" below means automated test files exist; I give their names.

---

## 0. Summary

| Area | Status | Evidence |
|---|---|---|
| Course Welcome | IMPLEMENTED AND TESTED | `src/pages/Welcome.tsx`, `src/content/learn/welcome.ts`. Tests: `e2e/week1-flow.spec.ts`, `src/flow/flow.test.tsx` (welcome testids) |
| Week 1 Overview | IMPLEMENTED AND TESTED | `src/week1/Home.tsx`, `src/content/week1Path.ts`. Tests: `src/week1/week1.test.tsx`, `src/content/learn/week01.test.ts` (workload), `e2e/week1-flow.spec.ts` |
| Lecture (2 sessions, 48 slides) | IMPLEMENTED AND TESTED | `src/content/lectures/week01/session1.ts` (25 slides), `session2.ts` (23 slides). Tests: `lectures.test.ts`, `week01/timing.test.ts`, `week01/session2.test.ts`, `e2e/lectures.spec.ts` |
| PowerPoint exports | IMPLEMENTED BUT NOT TESTED (as artifacts) | `public/lectures/week01-session{1,2}.pptx` and `../exports/lectures/…` (25 and 23 slides, generated 2026-10-19 14:11; **gitignored**). Generator `scripts/build-lectures.mjs`. The student-edition stripping is checked by `scripts/check-student-build.mjs`, a build script, not a test file |
| Detailed lesson | IMPLEMENTED AND TESTED | 21 authored sections plus a generated references section (`studentLesson` in the session files). `week01.test.ts` checks the quiz-to-lesson links |
| AeroLink case | IMPLEMENTED AND TESTED | `src/content/lectures/week01/aerolinkCase.ts`. Tests: `aerolinkCase.test.ts`, `aerolinkCanonical.test.ts` |
| Worked examples and optional practice | IMPLEMENTED AND TESTED | `src/week1/Examples.tsx`, `src/week1/Workbench.tsx`, missions in `src/content/missions/week01.ts`. Tests: `missions.test.ts`, `workbench/missions.test.ts`, `shell/practice.test.tsx`, `e2e/workbench.spec.ts` |
| Lab and Team Record (lab tool) | IMPLEMENTED AND TESTED | `src/workbench/week1/team.ts`, `needQuality.ts`, `TeamView.tsx`, `src/content/lab/week01Lab.ts`, `labBrief.ts`. Tests: `team.test.ts`, `needQuality.test.ts`, `labBrief.test.ts`, `shortAnswers.test.ts`, `project/adapters/week1.test.ts`, `e2e/week1-flow.spec.ts`, `e2e/project.spec.ts` |
| Assessment (Quiz Q1 plus readiness) | IMPLEMENTED AND TESTED | `src/week1/Assessment.tsx`, `src/content/quizWeek1.ts` (10 items). Tests: `learn/week01.test.ts` (key distribution, taught-in links), `components.test.tsx` |
| Internal review | Package **READY FOR FACULTY REVIEW**; flow **SIGN-OFF** | `_source_cache/review/week01_signoff_confirmation.md` (all 17 findings closed), `week01_flow_signoff_confirmation.md` (N4 minor open), `week01_final_review.md` (2026-10-19). All content is still tagged `new-pending-review`, and **faculty review is outstanding** |

---

## 1. Course Welcome (`#/welcome`)

**Source:** `src/pages/Welcome.tsx` (135 lines) and text in `src/content/learn/welcome.ts` (91 lines). Every block is tagged
`review: PENDING`.

**Layout and reading order.** One readable column (`lf-onecol`). The lede tells the student to "Read it top to bottom; it takes about five minutes"
(`welcome.ts:87`). There are five numbered sections, then two actions.

| # | Section (title from `welcome.ts`) | Purpose | Content and evidence |
|---|---|---|---|
| — | H1 "Systems Thinking and MBSE with SysML v2" and lede | Orientation | `Welcome.tsx:51-52`, `welcome.ts:87` |
| 1 | What this subject is, with the sub-head "Where it starts, and what you need" | Course introduction and prerequisites | Systems thinking is defined as course framing. The SE definition is a quote block from the reviewed `w1-se` block (R01 p.52) (`Welcome.tsx:22,64-66`). MBSE is paraphrased from SEBoK with a citation (R28 p.370) (`welcome.ts:18`). Prerequisites: "No prior systems-engineering, SysML or MBSE coursework and no programming… college algebra, introductory probability and spreadsheet use" (`welcome.ts:27`). MBSE is deferred to Week 8 (`welcome.ts:26`) |
| 2 | Why engineers need it | Motivation | One paragraph of course framing on engineering judgment (`welcome.ts:35`) |
| 3 | The AeroLink case | AeroLink and student-enterprise explanation | "AeroLink Urban Mobility, a FICTIONAL urban air-taxi operator, is the instructor’s reference case…". "Each team develops and models its own enterprise, in any domain. Your team proposes it in Week 1 and the instructor approves it" (`welcome.ts:43-44`) |
| 4 | The 14-week map | Roadmap | One paragraph (`welcome.ts:52`), the `CourseTimeline` figure with a text equivalent generated from `course.ts` WEEKS (`Welcome.tsx:24-30, 96-101`), and the Phase summaries from `PARTS` |
| 5 | How to use this site | How-to-use guidance | Two paragraphs (`welcome.ts:62-63`), then six stage cards with mini-figures (`WEEK_STAGES`, `welcome.ts:78-85`; `SiteGuide.tsx`): Overview, Lecture slides, Detailed lesson, Worked examples, Engineering laboratory, Assessment and submission |
| — | Actions | Next step | "Start Week 1" and "Go to the dashboard" (`Welcome.tsx:124-131`). Visiting the page sets `welcome-seen` (`Welcome.tsx:34`) |

**Observations (Welcome)**
- W-1 (stale text): "Week 1 is built this way; later weeks will follow it as they are rebuilt" (`welcome.ts:62`). At HEAD,
  Weeks 2, 3, 4, 5 and 8 are also built on the lecture-first template (`App.tsx:159`, `lectures/route.ts:35`
  `WEEK_PAGES = {1,2,3,4,5,8}`).
- W-2: The map shows all 14 whiteboard titles with equal weight. It does not tell the student that Weeks 6, 7 and 9–14 are
  outline pages only (see the content matrix).
- W-3: The mini-figure for the lecture stage reads "← slide 3 of 28 →" (`SiteGuide.tsx`, lecture branch). This is
  decorative, but no Week 1 session has 28 slides (25 and 23). `week1Path.ts:56` also uses 28 as a fallback slide count.
- W-4: Section 1 reads well. The prerequisites live only here; the Week 1 Overview has no prerequisites section of its own.

---

## 2. Week 1 Overview (`#/week/1`)

**Source:** `src/week1/Home.tsx` (249 lines), text in `src/content/week1Path.ts` (183 lines), and data from `course.ts` WEEKS[0]
and `weeks/week01.ts` (workload, assignment).

**Structure, in render order** (`Home.tsx:44-246`)
1. Kicker, then H1 "Week 1 — Team Formation / Needs / Identifying Stakeholders" (`course.ts:76`; matches the whiteboard).
2. A "Subject:" line joining the five `topics` (`course.ts:77`).
3. Intro: `WEEK1_LEDE` and `WEEK1_WHY` (`week1Path.ts:18-24`). The text explains the forward links: the Week 2 requirements, the Week 3 trade study and the Week 8 model.
4. "Work through the week in this order": five entry cards (Lecture slides, Detailed lesson, Worked examples, Engineering
   laboratory, Assessment and submission). Each card has computed metadata, such as the slide count and lesson words and hours (`Home.tsx:57-108`). The lecture card links to the
   viewer, the **.pptx download** and the handout for each session.
5. "Learning objectives", quoted exactly (`course.ts:84-90`, `week1Path.ts:27-30`):
   - **B1.1** (Apply) "Form a project team with a charter that assigns roles, decision rules, communication norms and ID ownership"
   - **B1.2** (Understand) "Explain system, system of interest, boundary, context and enterprise, using cited definitions"
   - **B1.3** (Apply) "Propose an enterprise and its system of interest, with a boundary and a context, for instructor approval"
   - **B1.4** (Apply) "Identify and classify the stakeholders of a system of interest, with their specific concerns"
   - **B1.5** (Apply) "Write well-formed stakeholder need statements traced to stakeholders, and tell needs from requirements"
   - **B1.6** (Understand / Analyze, *proposed, pending faculty approval*) "Place stakeholder needs work in the life cycle and in the ISO/IEC/IEEE 15288 technical processes, and explain why the integrated set of needs is the validation reference that requirements are transformed from"
   - **B1.7** (Evaluate, *proposed, pending faculty approval*) "Select elicitation techniques for a stakeholder, and evaluate a set of needs for coverage, conflict and priority"
6. "How this week runs": a four-phase timeline (Session 1, Session 2 with the lab launch, 7 days out of class, then the assessment) with
   slide and lab minutes computed from the lecture (`week1Path.ts:52-77`).
7. "Required readings": R11 pp.549–555 and R63 pp.234–235, with page counts and the reading-rate note (15 pages per hour) (`course.ts:91`,
   `week1Path.ts:80-89`).
8. "Deliverables and due points": five rows (candidate enterprise, charter and pitch decision, Team Record .md+.json, Quiz Q1,
   graduate needs review) (`week1Path.ts:92-98`).
9. Workload table. Rows come from `weeks/week01.ts` workload. The total is checked against the 8 h budget, and the optional practice is shown but not counted
   (`Home.tsx:208-242`). The sign-off confirmation records 8.0 h for a 4-person team and an 8.6 h week (0.6 h over budget) for a 3-person team.
10. Actions: "Start with the Session 1 slides" and "Course welcome".

**Navigation.** `WEEK1_NAV` (`src/week1/route.ts:49-56`): Overview → Lecture → Lesson → Worked examples → Laboratory →
Assessment, shown as a week bar on every Week 1 page (`WeekShell.tsx`, `WeekNav.tsx`). Earlier self-study routes redirect to the new ones
(`route.ts:37-46`).

**Expectations** are stated through the deliverables table, the workload table and the timeline. The approval rule is in
`weeks/week01.ts:315`: the record may be submitted "submitted for approval", but approval is required before Week 2.

**Observations (Overview)**
- O-1: Two objectives, B1.6 and B1.7, are shown to students as "proposed, pending faculty approval". The lab also practises B1.7
  (`week01Lab.ts:57`). The open faculty decision is visible to students.
- O-2: Objective IDs use the `B1.x` scheme. Weeks 2–14 use `W<n>.<k>` (`course.ts`). The schemes are inconsistent across the course.
- O-3: `course.ts:7-13` still says "Weeks 2–14 are PROVISIONAL", and every week from 2 to 14 has `status: 'provisional'`. That is stale for Weeks 2–5 and 8.

---

## 3. Lecture

**Sources:** `src/content/lectures/week01/session1.ts` (1,453 lines), `session2.ts` (1,131 lines), `aerolinkCase.ts`,
`labBrief.ts`, `methods.ts`. Figures: `src/components/figures/LectureWeek1S1.tsx`, `LectureWeek1S2.tsx`, through
`figures/registry.ts`. The model is in `src/content/lectures/types.ts`: each slide carries a `purpose` field (for the instructor), `minutes`, `layout`, `body`, `figure`,
`sources` and `notes` (teach, why, figure, workedSolution, examples, misconceptions, transition, timing).

### Session 1: "Team Formation / Needs / Identifying Stakeholders" (`session1.ts:78`)
25 slides in the source (24 authored, plus the generated "References and credits" slide). The pptx has 25 slides. Planned time is
69 min of content plus `bufferMinutes: 6` (`session1.ts:2-3,80`).

| # | Section | Slide title (layout) |
|---|---|---|
| 1 | Course framing and the reference case | Team Formation / Needs / Identifying Stakeholders (title) |
| 2 | | The driving question: is this list enough? (figure-bullets) |
| 3 | | One enterprise, two representations; AeroLink is the worked case (figure-bullets) |
| 4 | | Meet AeroLink (FICTIONAL) (figure-bullets) |
| 5 | System concepts at graduate depth | What systems engineering is for, and what we mean by “system” (definition) |
| 6 | | System of interest and enabling systems (figure-bullets) |
| 7 | | An enterprise is not an organization (figure-bullets) |
| 8 | | AeroLink: three scopes, one question (figure-bullets) |
| 9 | | Boundary and context: the structure, applied to AeroLink (figure) |
| 10 | | A boundary is a decision: purpose, control and power (figure-bullets) |
| 11 | Life cycle and the 15288 process frame | The life cycle and its stages (figure) |
| 12 | | Where Week 1 sits in ISO/IEC/IEEE 15288 (figure) |
| 13 | | Business or Mission Analysis feeds Stakeholder Needs Definition (figure-bullets) |
| 14 | Teams in systems engineering | What makes a team, and what an IPT is (figure-bullets) |
| 15 | | Organizing your team: roles and communication paths (figure-bullets) |
| 16 | | The charter: norms, decision rules and how teams develop (figure-bullets) |
| 17 | Identifying and classifying stakeholders | Who counts as a stakeholder (figure-bullets) |
| 18 | | Why stakeholders come first, and who gets forgotten (figure-bullets) |
| 19 | | Method 1: the life-cycle sweep (figure) |
| 20 | | Methods 2 and 3: from the context; by role class (figure) |
| 21 | | Approving authorities (figure-bullets) |
| 22 | | Classifying stakeholders: what the register records (figure) |
| 23 | | Answering the driving question (figure-bullets) |
| 24 | Exit | Exit: retrieval, roster, preparation (figure-bullets) |
| 25 | (generated) | References and credits (references) |

### Session 2: "Concerns, needs and the AeroLink case" (`session2.ts:131`)
23 slides in the source (22 authored plus references). The pptx has 23 slides. `bufferMinutes: 5` (`session2.ts:133`). The last section is the in-class lab
launch.

| # | Section | Slide title (layout) |
|---|---|---|
| 1 | Concerns and the register | Retrieval warm-up: who must we win over? (two-column) |
| 2 | | Reveal: the AeroLink register by influence and support (figure-bullets) |
| 3 | | Concerns: what a stakeholder cares about, relative to the system (figure-bullets) |
| 4 | | The AeroLink register and its relationships (figure) |
| 5 | Needs at graduate depth | Needs versus requirements: two perspectives (figure) |
| 6 | | From individual needs to an integrated set (figure-bullets) |
| 7 | | The transformation is analysis, not rewording (figure-bullets) |
| 8 | | Why keep the needs: verification, validation and cost (figure-bullets) |
| 9 | | What makes a need well formed (figure-bullets) |
| 10 | | Anatomy of a need, and the level problem (figure-bullets) |
| 11 | | Choosing elicitation techniques (figure) |
| 12 | | What to ask, and how to find the real need (figure-bullets) |
| 13 | | Conflicting needs and prioritization (figure-bullets) |
| 14 | | Common errors and their corrections (figure-bullets) |
| 15 | The AeroLink worked example | Worked example I: concern to need in six steps (figure-bullets) |
| 16 | | Worked example II: the AeroLink reference needs (figure) |
| 17 | | Worked example III: auditing coverage and conflict (figure) |
| 18 | | Why each method, and what it feeds (figure) |
| 19 | Laboratory launch | Lab L1: what you deliver, and by when (figure-bullets) |
| 20 | | Team work: roles, a tie-break, a lead candidate (figure-bullets) |
| 21 | | Instructor checkpoint: the enterprise pitch (figure-bullets) |
| 22 | | Close: the next seven days (figure) |
| 23 | (generated) | References and credits (references) |

### Depth, definitions, citations, figures, tables, equations

| Count (grep) | Session 1 | Session 2 |
|---|---|---|
| Figures (`figure: {`) | 24 | 22 |
| Definition blocks | 3: Systems engineering, System (course working definition), IPT (DoD) | 1: Concern (SysML v2, R77 p.115) |
| Tables | 3 (including the three-definitions table, `session1.ts:51-60`) | 11 |
| Equations | 2: P = N(N − 1) ÷ 2, communication paths (`session1.ts:708`, repeated in the lesson at `:1340`) | 0 |
| Steps blocks / callouts | 0 / 3 | 3 / 5 |
| `misconceptions` entries in notes | 24 | 22 |
| `workedSolution` | 1 | 1 |

- **Citations:** Sessions 1 and 2, the case module and the lab brief together cite **37 distinct register readings**. The most
  frequent are R11 (40 citations), R63 (14), R53 (13), R65 (12), R13 (10), R96, R39a, R92, R48a, R10, R99, R98, R77, R23a,
  plus the SEBoK glossary entries R39b–R39l. All 37 resolve in `readings.generated.json` with `verified: true`. **Register
  verification means "title found on first page"** (the `verification` field). It is not a claim-by-claim check. A
  claim-level check was done by the reviewers (`_source_cache/review/week01_final_review.md`: "Two independent read-only
  passes… opened every cited page").
- **Accuracy rules** are stated in the header (`session1.ts:16-25`): verbatim definitions with page, course conventions
  labeled, AeroLink FICTIONAL, and at most 130 spoken words per minute (`timing.test.ts`).

### Slides vs faculty notes
- On-slide text is held to `SLIDE_WORD_BUDGET = 60` (`types.ts`).
- Notes per slide: `teach[]`, `why`, figure walk-through, misconceptions, transition and timing.
- Exported notes Markdown: `../exports/lectures/week01-session1-notes.md` is about 11,250 words and
  `week01-session2-notes.md` about 10,380 words (wc -w; slide headings included).
- **Visibility:** the notes toggle is rendered only when `!IS_STUDENT_EDITION` (`src/lectures/LectureViewer.tsx:112,125`;
  `Handout.tsx:20,37`). `student-edition.ts` strips every `notes` object and `purpose` string from `session*.ts` at
  compile time and blanks the pptx speaker notes in `dist-student/`. `scripts/check-student-build.mjs` checks both directions.

### Presentation controls
`LectureViewer.tsx:2-3,50-73`: ←/→, PageUp/PageDown, Home/End, a slide counter, present mode (Fullscreen API; Esc exits),
a faculty-notes toggle (instructor build only), and links to the Handout, the Reader and "Download .pptx".

### PowerPoint exports
- `public/lectures/week01-session1.pptx` (25 slides) and `week01-session2.pptx` (23 slides), with identical copies in
  `../exports/lectures/`. Faculty-notes Markdown is `week01-session{1,2}-notes.md` and the lesson is `week01-lesson.md` (about 22,560 words).
- All were generated 2026-10-19 14:11. The session sources were last modified at 09:42 and 10:11 that day, so the decks are newer than their
  sources and are probably current. **They are gitignored** (`.gitignore:12` at the root, `learning-studio/.gitignore:29`), so a fresh
  clone has no decks until `lectures:pptx` runs.

**Observations (Lecture)**
- L-1: The dev server at `http://127.0.0.1:5173/` is the instructor edition. It shows the faculty-notes toggle and serves
  decks with speaker notes (the pptx URL returns 200). Students must only ever get the `build:student` output.
- L-2: Slide counts agree in three places: source, pptx and the "24 slides plus the generated references slide" comment.
- L-3: Session 2 gives about 22 minutes to the lab launch, so roughly 47 minutes are lecture (`week1Path.ts:38-50`). The design
  teaches first, then launches the lab.

---

## 4. Detailed lesson (`#/week/1/lesson`)

**Source:** the `studentLesson` arrays in `session1.ts:1157-1452` and `session2.ts:881-1126`, rendered by
`src/lectures/LessonReader.tsx`.

**Structure** (21 authored sections plus a generated references section):
- S1, 8 sections: Why Week 1 matters · What a system is, and why purpose matters · System of interest, enabling systems and the
  enterprise · Boundary, environment and context · Life cycle and the ISO/IEC/IEEE 15288 process frame · Systems engineering
  teams · Who counts as a stakeholder, and how to find them all · Classifying stakeholders and checking the list. The last section has a
  "Readings" callout.
- S2, 13 sections: Concerns: the hinge… · Needs, requirements and the transformation… · The integrated set of needs… ·
  Well-formed needs: three layers of quality · Elicitation as a method choice · Conflict, priority and adjudication · Ten
  common errors… · The AeroLink case: context and register · …from concern to need, and the reference set · …auditing the
  set · Why each method, and what it feeds · Toward Week 2 and Week 8 · Lab L1: the Week 1 Team Record.
- Then "References and credits for Week 1" (`session2.ts:1126`, `referencesSection([...])`).

**Depth and sources.** Each section carries a `sources` citation list. Long-form paragraphs, tables and steps are
included. The exported lesson is about 22,560 words. The lesson card computes words and hours from `lessonWords()` at 150 wpm
(`week1Path.ts:116-126`).

**Link to slides.** There are 39 `{ kind: 'figure', slide: '…' }` blocks: 20 in S1 and 19 in S2. They reuse slide figures and captions. There are
no `slide-ref` ("see slide N") blocks. The reader top bar has "Open the slides" (`LessonReader.tsx:102-104`).

**Self-checks.** There are seven optional "Check your understanding (optional, ungraded)" `<details>` blocks, carried over from the earlier Learn
sections l1–l7 and mapped by `LEARN_TO_LESSON` (`route.ts:20-28`; `LessonReader.tsx:56-67,129`). They appear in Week 1 only.

**Observations (Lesson)**
- LS-1: Register codes appear in student prose, for example "SEBoK, Stakeholder Needs Definition (R11 pp.549–555)" in the S1
  readings callout (`session1.ts:1447`). `formatCitation` also prints the ID (`readings.ts:33`, "R11 · SEBoK…"). This is
  consistent across the app, but it is internal register notation.
- LS-2: Without "see slide N" pointers, students cannot jump from a lesson paragraph to the slide it explains, except where the
  figure is reused.

---

## 5. AeroLink case (Week 1 layer)

**Source:** `src/content/lectures/week01/aerolinkCase.ts` (411 lines; `AEROLINK_CASE_REVIEW = 'new-pending-review'`).
Canonical plan: `docs/lectures/AEROLINK_CANONICAL_DATA.md`. Check: `aerolinkCanonical.test.ts`.

| Element | Content (IDs) | Evidence |
|---|---|---|
| Context | ENT-001 "AeroLink Urban Mobility" (enterprise with partners); SOI-001 (proposed ID) "the AeroLink air-taxi service", with a narrower SoI (fleet, operations center, booking and dispatch) and a wider SoI (vertiport pads and chargers, passenger demand) | `aerolinkCase.ts:56-77` |
| Facts and assumptions | 12 aircraft of 4 seats; 6 vertiports with 2 chargers each; a 16 h day (06:00–22:00, proposed); 25 km trips at 150 km/h; 20 min charge; 65 dBA pad-edge limit; an event cap in sensitive hours (proposed) | `CASE_FACTS :79-87`, `NOISE_AGREEMENT :91-95` |
| External systems | EXT-001..006, each named as a system, with an `owner` stakeholder | `:98-108` |
| Stakeholders | **STK-001..015**: Passengers, FAA, Investors, Communities, Vertiport operators, Emergency responders, ANSP, Pilots/remote operators, Maintenance technicians, Electric utility, Aircraft manufacturer (OEM), Insurers, City planning authority, Accessibility advocates, Passengers with reduced mobility | `:167-184` |
| Concerns | CON-001..017 | `:209-228` |
| Relationships | 8 REL rows, 7 types | `:249-261` |
| Mission and objectives | MGO-001 mission ("Safe, quiet, on-demand air trips between six vertiports…"), goals MGO-002, 003, 004 and 009 | `:262-268` |
| Problem statement | "Cross-town trips… 45–70 minutes… (FICTIONAL, proposed)" | `:270` |
| Needs | **NEED-001..017** in the recommended form "…need the air-taxi service to…", each with a priority | `:305-325` |
| Teaching devices | `CONFLICT`, `SECOND_TENSION`, `DELIBERATE_GAP` (STK-011 has no need, with the reason recorded), `ELICITATION_PLAN`, `coverageMatrix()` | `:341-400` |

**Cross-week dependencies.** `AEROLINK_CANONICAL_DATA.md` §1 says later weeks must import from this module and never retype.
`aerolinkCanonical.test.ts:20-46` holds a `PRE_REVISION` allowlist of differences that still exist between this case and the shared instructor
reference baseline (`src/model/reference/week0N.ts`, `sysml/reference/aerolink_v01..v04`):
- 11 × `statement:NEED-001..011`, `name:NEED-003`, `trace:NEED-008`, 6 × `missing:NEED-012..017`, `noise:CAP-007` and `noise:REQ-STK-002`,
  all with **fixIn: 'Week 2'**;
- `missing:STK-015` and `missing:CON-017` with fixIn: 'Week 12'.

**Observations (AeroLink)**
- A-1: Week 2 is signed off, but 21 allowlist entries still carry `fixIn: 'Week 2'`. The Week 2 lecture uses its own
  `week02/aerolinkCase.ts`, and the shared reference baseline was not reconciled. Two AeroLink data sources therefore
  still diverge. The test documents this; it does not hide it.
- A-2: The case names a real authority ("FAA", STK-002) inside a FICTIONAL case. The header says no real regulatory facts
  are stated (`:10-11`).
- A-3: Several values are marked `proposed, instructor to confirm`: SOI-001, the clock times, the event cap and the problem statement.
  They are teaching values that are not yet faculty-confirmed.

---

## 6. Worked examples and "Practice Canvas" (optional practice)

**Worked examples** (`#/week/1/examples`, `src/week1/Examples.tsx`, 210 lines). The AeroLink worked-example slides (S2, section
"The AeroLink worked example") are shown as static slide faces with "Open it in the slide viewer". Step-by-step solutions,
tables and figures come from the student lesson and `aerolinkCase.ts`; nothing is retyped (`Examples.tsx:1-5`). There is a
paper "try it yourself" exercise, CON-014 → NEED-014, with a built solution (`:24-26`, `TryItYourself`). At the end is a link to the optional
practice.

**Optional practice** (`#/week/1/examples/practice`, `src/week1/Workbench.tsx`) uses the embedded workbench (`flow/Practice.tsx`
`EmbeddedWorkbench`) with **AeroLink missions 1–4** (`src/content/missions/week01.ts`):

| Mission | Title | Minutes | What is practised | Feedback (step checks) |
|---|---|---|---|---|
| w1-m1-who | Try first: who is missing? | 11 | A prediction, locked once recorded, then stakeholder identification | `check(ctx)`, e.g. "Prediction recorded and locked." (`:59`) |
| w1-m2-boundary | Guided: an AeroLink boundary fit for its question | 15 | Boundary view | step checks `:123-165` |
| w1-m3-stakeholders | Guided: classify AeroLink’s stakeholders | 22 | Classification and register row | `checkClassified`, `checkRegisterRow` (`:208,219`) |
| w1-m4-needs | Guided: write AeroLink needs that pass the checks | 18 | Critique and two needs | `checkCritique`, `checkTwoNeeds` (`:246,257`) |

- **What can change:** workbench artefacts (stakeholders, boundary, needs) on the AeroLink model.
- **Feedback:** per-step checks with detail text, the Problems panel rules (`teamRule…` `:324+`), and the "Changes & impact" log.
- **Completion:** all steps of missions 1–4 done ("Every practice mission is complete. Now apply this engineering method to your
  own enterprise", `Workbench.tsx:37`).
- **Reset:** there is no reset or restart control (grep found none in `src/workbench/shell/*`). Undo and redo cover the change log, at most 50
  entries (`WorkbenchProvider.tsx:28`). The only way to start over is clearing site data.
- **Storage keys** (`localStorage`, prefix `sysml-studio:v1:` from `src/lib/storage.ts:3`): `wb-artefacts`, `wb-ui`, `mission-progress`,
  `w1-flow-v2`, `quiz`, `welcome-seen`, plus `theme` and `instructor` (`state/AppState.tsx:72-78`).
- **Effect on project data:** the practice uses the AeroLink artefacts in `wb-artefacts`. The team record is stored under
  `w1.team` (`team.ts:29`), or in the IndexedDB project `sysml-studio-projects` (`project/store/indexedDb.ts:10`) when a
  project exists. Practice does not write to the team record. **An explicit copy is possible:** `project/practice/copyFromPractice.ts`
  copies AeroLink stakeholders into the team project as templates flagged `copied-from-practice`. They count toward minimums only once a team member
  edits them and marks them adapted. This is enabled by default: `COPY_FROM_PRACTICE_ENABLED = true` (`:14`), "Faculty decision F4 (pending)".

**Observations (Practice)**
- P-1: There is no reset for a student who wants to redo the practice.
- P-2: Copy-from-practice is enabled ahead of the pending faculty decision F4. It weakens the AeroLink and own-enterprise separation,
  although the copies are flagged and the "adapt before it counts" rule mitigates it.
- P-3: A sixth mission, w1-m6-recall (a knowledge check, 12 min), exists in the mission file. It is excluded from both the practice
  and the lab tool (`Workbench.tsx:16-17`), so it is unused on the student path.

---

## 7. Lab L1 and the Week 1 Team Record

**Sources:** the instructions in `src/content/lab/week01Lab.ts` (164 lines; page `src/week1/Lab.tsx`; generated
`docs/lectures/week01/WEEK1_LAB_INSTRUCTIONS.md`, with equality checked by `week01Lab`'s md test path in `labBrief.test.ts` and `lab:md`). The
minimums are in `src/content/lectures/week01/labBrief.ts`. The tool is `src/workbench/week1/team.ts` (729 lines), `needQuality.ts`
(343) and `TeamView.tsx`, with the project link in `src/project/adapters/useTeamRecord.ts` and `TeamProject.tsx`.

**Lab page sections** (`Lab.tsx`): Purpose and at-a-glance → Inputs → Objectives → Engineering method (8 steps, each naming the
slide that teaches it) → Procedure (10 steps, `week01Lab.ts:72-83`) → Expected outputs (2 files, 6 parts) → Grading rubric rows →
Submission → Where your team’s record stands → The lab tool → Workload.

**Every field and its validation (the gate) — quoted thresholds**

| Part | Fields | Gate (file:line) |
|---|---|---|
| 1 Charter | `threePersonTeam`; initials for each of the 4 `COURSE_ROLES` (Requirements & Compliance, Architecture, AI & Data Management, Verification & Validation; `logic.ts:161`); `decisionRules`; `norms`; `prefixes` (one line per member) | Initials of "2–4 letters". Each role is held by a different member. Decision rules and norms must not be empty or an `EMPTY_ANSWER` (`ok, n/a, none, tbd, ?, see above…`, `team.ts:44-46`). Every Week 1 prefix (ENT, PRT, EXT, STK, CON, NEED, REL) has exactly one owner (`team.ts:244-275`) |
| 2 Proposal | name, domain, problem, purpose (mission **MGO-001**), goals (**MGO-002…**), soi, inside (**PRT**), why, decision, decidedOn | The proposal must not name AeroLink (`isAeroLink`, `:228-229`). Problem, mission and SoI are one sentence each of at least `MIN_STATEMENT_WORDS = 3` words. At least `MIN_INSIDE = 3` elements inside the boundary. Suitability needs at least **40 words** (`MIN_WHY_WORDS = 40`). A decision is required. "Approved" needs a YYYY-MM-DD date that is not in the future (`:286-317`) |
| 3 Context | rows **EXT-nnn**: name, kind (system/actor), crosses, direction | At least `MIN_CONTEXT = 6` complete rows. No duplicates. The SoI may not appear in its own context (`:328-342`) |
| 4 Register | rows **STK-nnn**: name, role (`ROLES`), stage (6 `STAGES`), side, approving, concerns **CON-nnn**, influence, reason | At least **8** complete stakeholders. Each concern must be specific (`isSpecificConcern`; no word count). Influence is an integer 1–5. The reason must not be empty. At least **3 role groups**. At least 1 approving authority. At least 1 stakeholder who is not a customer or user (`:353-392`) |
| 4b Relationships | rows **REL-nnn**: from, to (STK IDs in the register), type (7 `REL_TYPES`), note | At least **3** complete rows, at least **1** `conflicts-with`, and no duplicate pair-and-type (`:395-424`) |
| 5 Needs | rows **NEED-nnn**: name, text, conditions, rationale, sources (STK), concerns (CON), goal (MGO), priority (mandatory, critical, desirable, optional), selfCheck (6), justification | Hard gates from `assessNeed` (`needQuality.ts:229-300`): structure (an outcome of at least `MIN_OBJECT_WORDS = 1`), subject is a registered stakeholder and not the SoI, no "shall", no named solution, unique ID. Completeness: name, trace, rationale (at least 1 word). Team checks: a priority, CON IDs held by a source stakeholder, and an MGO that exists (`team.ts:430-457`). All **six self-check boxes ticked by the student**. Each warning needs a justification of at least `MIN_JUSTIFICATION_WORDS = 1` word that is not an empty answer (`needQuality.ts:333-341`). Part minimum: **8 counting needs from at least 5 stakeholders, including an approving authority**; three-person teams need **6 from 4**, pending faculty approval (`labBrief.ts:52-62`, `team.ts:460-476`) |
| 6 AI statement | aiStatement | At least `MIN_AI_WORDS = 12` words (`team.ts:478-482`) |
| Export | exportedMdAt, exportedJsonAt | All six parts pass, both files are exported, and nothing has changed since the last export (`:487-497`) |

**Input and output formats.** The lab produces two files (`week01Lab.ts:87-90`): `team-NN-week1-record.md`, built by `teamMarkdown()` with
headed parts, and `team-NN-week1-model-inputs.json`. The JSON has `format: 'week1-model-inputs'` and **`version: 3`**
(`MODEL_INPUTS_VERSION`, `team.ts:587-618`). Every item carries its ID and the SysML v2 elements it `seeds`. Import accepts versions 1, 2 and 3
(`importModelInputs`, `:622+`) and reports actionable errors. In project mode, exports are recorded against Milestone 1 with format versions
(md v1, json v3) (`useTeamRecord.ts:27-31`).

**Artifact IDs:** ENT-001, MGO-001.., PRT-, EXT-, STK-, CON-, NEED-, REL- (`labBrief.ts:68`; `team.ts:610-616`). In project mode
the IDs come from the project counters.

**Save.**
- Legacy mode: `localStorage` `wb-artefacts` → `w1.team`.
- Project mode: IndexedDB with autosave, snapshots, recovery and a tab lock (commit `8b9637d` message; `project/store/*`). Ctrl+Z
  undoes project change sets (`TeamProject.tsx:21-35`). Importing into a non-empty record asks for confirmation and keeps the previous record.

**Enterprise approval workflow.** The student team records the instructor's decision in Part 2: `pending`, `approved` with a date, or `revise`
(`team.ts:66, 280-284`). A complete, exported record whose proposal is only `pending` gets the state **"SUBMITTED FOR APPROVAL"**,
never "ready" (`team.ts:499-512`). The pitch happens in class: up to 5 teams pitch, and the rest submit on the LMS and get a decision
within 48 hours (`week1Path.ts:46-48`).

**Continuity to later weeks.** The Week 2 tool imports the Week 1 JSON file or reads the browser copy (`workbench/week2/Week2LabTool.tsx:143-154`,
`record.ts:358`) and rejects records that name AeroLink (`record.ts:367`). The JSON's `seeds` prepare Week 8. The Week 8
mapping preview is in My Project (`project/adapters/week8.ts`).

**Student instructions:** the Laboratory page and its generated Markdown, the mission briefs in the lab tool (`missions/week01.ts:276-282`), and
the Assessment page steps (`Assessment.tsx:55-59`).

**Observations (Lab)**
- LB-1 (approval is self-reported): the app has no instructor-side approval. Any team member can set
  `decision: 'approved'` and a date, and the record then becomes "ready". The control is the LMS upload and instructor review, outside
  the app.
- LB-2 (permissive gates rely on self-attestation): the six-check self-check is ticked by the student. A warning is cleared by
  a **one-word** justification. A rationale needs one word, and the need outcome needs one word after "to". The 2026-10-19 gate sweep
  loosened these on purpose ("only an empty answer fails"), so the tool checks form, not quality. Quality judgment sits with the rubric.
- LB-3: Rubric text shown to students contains internal source codes. The RB-1.2 level-4 cell reads "all **S04** classes", and the rubric note
  repeats "RB-1.2’s “all S04 classes”" (`learn/week01.ts:682`). The RB-12 rows contain "[S01/S02]" (`rubrics.generated.json`). `LAB_RUBRIC_ROWS`
  renders these rows on the Lab page (`week01Lab.ts:94,104-109`). Elsewhere in the rubric register, students would see "S12 p.144",
  "S11 p.767" and "S06 p.168" when those weeks' rows render. The S-codes are internal source-inventory IDs, not register R-codes.
- LB-4: The relationships minimum is required, but its scoring under RB-1.4 and RB-1.5 is "proposed, pending faculty decision"
  (`week01Lab.ts:96-97`). Students see this open decision.
- LB-5 (uncommitted): the working-tree `team.ts` imports the untracked `../emptyAnswer`. If that file is lost, the working
  copy will not compile.

---

## 8. Assessment (`#/week/1/assessment`)

**Source:** `src/week1/Assessment.tsx` (88 lines), `src/content/quizWeek1.ts` (139 lines), `components/Quiz.tsx`,
`flow/CheckSubmit.tsx`.

- **Placement:** a separate page after the lab, in the week bar. The page says it is "taken after both lectures"
  (`Assessment.tsx:33`), and nothing on the site locks the lab behind the quiz (`welcome.ts:63`).
- **Question types:** 10 single-answer multiple-choice items with 4 options each, w1q-1..10.
  - Bloom: Understand ×4, Apply ×5, Evaluate ×1.
  - Objectives: B1.1 ×1, B1.2 ×2, B1.3 ×2, B1.4 ×3, B1.5 ×2 (`quizWeek1.ts:19-128`).
  - Items include transfer cases in other domains, e.g. w1q-2 on a hospital emergency department.
- **Link to lecture:** every item has `lecture: {week, session, slide, section}` (`:28-137`), and `Quiz.tsx:10-18` renders "Session N, slide K
  “title”; lesson: “…”". Items cite a register page (`cite`) or declare a `courseSource` for course conventions.
  `learn/week01.test.ts:232` checks that every item is taught, `:182` checks the key length-rank distribution, and `:198` checks the key letter spread.
- **Scoring and feedback:** an explanation is revealed per option, there is "Try again", a score line, and "Reset knowledge check" (`Quiz.tsx:80,101-119`).
  Answers persist in `localStorage` `quiz` (`AppState.tsx:76`). The quiz is formative and ungraded.
- **Objective status:** "Where you stand, by objective" combines quiz items with the optional self-checks, scored on first attempts
  (`ObjectiveStatus`).
- **Submission flow:** `RecordReadiness` uses the same checks as the lab tool (not ready / submitted for approval / ready). There are 3 steps (finish,
  export both files, one member uploads to the LMS "Week 1 Team Record"). The graduate needs review is at most 250 words, on the LMS
  (`GraduateSection`). A bridge to Week 2 closes the page.
- **Instructor-only answers:** quiz keys and explanations are **in the student bundle by design**, because the quiz is formative
  and shows feedback on answer. Exam banks (`src/instructor/exams/exam1.ts`) are excluded from the student edition
  (`instructor/index.ts:10`, `AssessmentBanks.tsx:14`), and `check-student-build.mjs` checks that their phrases are absent. Faculty
  notes and slide `purpose` strings are stripped (§3).

**Observations (Assessment)**
- AS-1: Explanations hard-code slide numbers, e.g. "Session 1, slide 16" in w1q-1, with 11 occurrences in `quizWeek1.ts`. Two of them
  are pinned by tests (`week01.test.ts:297-298`). The rest would go stale silently if slides move, although the rendered "taught in"
  line is computed live.
- AS-2: All 10 items are formative, and the rubric governs the Team Record. No summative Week 1 assessment exists, and exam
  placement is an open faculty decision (`course.ts:62-66`).

---

## 9. Consolidated observations (no fixes made)

| ID | Severity (auditor) | Observation | Where |
|---|---|---|---|
| LB-1 | High (integrity) | The enterprise approval is self-reported in the app; there is no instructor-side control | `team.ts:280-317` |
| LB-2 | Medium (academic) | The need and lab gates accept one-word justifications and rationales, and the six-check self-attestation is student-ticked. The tool checks form, not quality | `needQuality.ts:117,333-341`; `team.ts:46` |
| LB-3 | Medium (presentation) | Internal source codes are visible to students in rubric rows ("all S04 classes", "[S01/S02]"; elsewhere "S12 p.144") | `learn/week01.ts:682`, `rubrics.generated.json` |
| L-1 | Medium (deployment) | The default/dev build exposes faculty notes and speaker-note decks; only `build:student` is safe for students | `LectureViewer.tsx:112`; `student-edition.ts` |
| A-1 | Medium (data) | Two AeroLink sources diverge: 21 `fixIn: 'Week 2'` allowlist entries remain after Week 2 sign-off | `aerolinkCanonical.test.ts:20-46` |
| P-2 | Medium (separation) | Copy AeroLink stakeholders into the team project is enabled before faculty decision F4 | `copyFromPractice.ts:14` |
| O-1 / LB-4 | Low | Pending faculty decisions are shown to students: B1.6 and B1.7 proposed, RB-1.4 scoring, the three-person minimum | `week1Path.ts:27-30`; `week01Lab.ts:96` |
| W-1 / O-3 | Low (stale) | "later weeks will follow it as they are rebuilt" and `course.ts` "Weeks 2–14 PROVISIONAL" | `welcome.ts:62`; `course.ts:7-13` |
| W-3 | Low (cue) | The mini-figure says "slide 3 of 28", and the fallback slide count is 28; the real counts are 25 and 23 | `SiteGuide.tsx`; `week1Path.ts:56` |
| AS-1 | Low (cue) | Hard-coded slide numbers in quiz explanations | `quizWeek1.ts` |
| LS-1 | Low | Register R-codes appear in lesson prose and in every citation | `session1.ts:1447`; `readings.ts:33` |
| P-1 | Low (UX) | No reset for the optional practice | `src/workbench/shell/*` |
| PPT | Low (ops) | Decks are gitignored generated artifacts, so their freshness has to be re-checked after any source change | `.gitignore:12`; `learning-studio/.gitignore:29` |
| LB-5 | Low (tree hygiene) | The uncommitted `team.ts` depends on the untracked `emptyAnswer.ts` | `git status` |
