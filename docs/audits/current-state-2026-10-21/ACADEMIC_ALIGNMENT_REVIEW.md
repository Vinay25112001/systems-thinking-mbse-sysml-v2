# Academic Alignment Review: actual content vs the whiteboard schedule

Audit date: 2026-10-21. This is a read-only discovery audit at HEAD `8b9637d`. It proposes no academic revisions and records findings only.
The companion files are `FULL_14_WEEK_CONTENT_MATRIX.md` (evidence per week) and `WEEK_1_DEEP_AUDIT.md`.
Paths are relative to `learning-studio/` unless otherwise stated.

The authoritative whiteboard schedule is held in `course.ts` WEEKS, from COURSE_SCHEDULE.md and DECISION_LOG A19.
- **Phase I:** W1 Team Formation/Needs/Identifying Stakeholders; W2 ConOps/Requirements; W3 Technology Assessment/Risk
  Management/Trade Study; W4 Architecture/Information View; W5 Components/Interfaces; W6 Evolution Roadmap; W7 Final Presentation.
- **Phase II:** W8 Import Systems Thinking Artifacts/Stakeholders; W9 Needs/Requirements; W10 Logical/Behavioral Modeling;
  W11 Physical/Interfaces; W12 Digital Thread/V&V; W13 Trade Study/Analysis; W14 Final Presentation.

All 14 displayed titles in `course.ts` match the whiteboard word for word. The gaps are in content, not in titles.

---

## 1. Week-by-week comparison of actual content with the whiteboard

| Wk | Whiteboard | What is actually taught (built weeks: lecture section titles) | Alignment finding |
|---|---|---|---|
| 1 | Team Formation / Needs / Identifying Stakeholders | S1: course framing and AeroLink; system concepts (system, SoI, enterprise, boundary, context); life cycle and 15288; teams (IPT, roles, charter); identifying and classifying stakeholders. S2: concerns and the register; needs at graduate depth (needs vs requirements, integrated set, well-formedness, elicitation, conflict, priority, errors); AeroLink worked example; lab launch | **Aligned and extended.** All three subjects are taught in depth. *Added:* system concepts, life cycle and 15288 framing. These were carried over from old Weeks 1–3 (`course.ts` draftSources), so the week is broad. Two objectives (B1.6, B1.7) are still "proposed" |
| 2 | ConOps / Requirements | S1: ConOps; use cases, scenarios and mission threads; AeroLink worked example; **capabilities**; toward requirements. S2: writing requirements; the AeroLink requirements, worked; traceability and **measures (MOE/MOP)**; lab | **Aligned.** *Added:* capabilities (old Week 3) and MOE/MOP (old Week 5), which is a reasonable bridge. The whiteboard pairing ConOps→Requirements is kept in order |
| 3 | Technology Assessment / Risk Management / Trade Study | S1: technology readiness; risk management **including security and resilience**; **technical performance measures**; hand-off. S2: decision management and the trade study; AeroLink Year-2 capacity trade; sensitivity and bias; lab | **Aligned and extended.** All three subjects are present in whiteboard order. *Added:* TPMs and security/resilience. That makes Week 3 the densest week (the lab has 4 parts: TPM, TRA, risk register, trade study) |
| 4 | Architecture / Information View | S1: architecture and its description; functions and decomposition; logical/physical and allocation; enterprise view. S2: information management and the information view; AeroLink worked example; evaluation and consistency; lab | **Aligned.** *Added:* an AI-enabled capability card (proposed objective W4.6) and allocation, which overlaps what Phase II W11 will model |
| 5 | Components / Interfaces | S1: components; interfaces and the N² chart; interface definitions and requirements. S2: managing interfaces; **interface security and resilience**; auditing, integrating and comparing; lab | **Aligned.** Security/resilience is taught a **second** time, after W3. The uncommitted W6 teaches it a third time (S2 "Security and resilience as the enterprise evolves"). See duplication below |
| 6 | Evolution Roadmap | HEAD: **outline only** (W6.1 increments, W6.2 technology insertion, W6.3 transition; 1 reading). Uncommitted draft: capability evolution and horizons; development approaches and increments; technology plan and maturity evidence; known unknowns; transition while operating; AeroLink roadmap worked; lab | **Not delivered at HEAD (omitted).** The uncommitted draft covers all three whiteboard subjects but is unreviewed and only partly routed |
| 7 | Final Presentation | Outline only (integrate W1–6, present and defend, peer review) | **Omitted** as student content. No integration guidance, package template, presentation rubric or peer-review criteria exist. The only exam bank (`instructor/exams/exam1.ts`) still assumes the old plan of Exam 1 in Week 7 |
| 8 | Import Systems Thinking Artifacts / Stakeholders | S1: what MBSE changes; model and view; language architecture; **definition and usage; attributes, units**. S2: packages, imports and names; course toolchain; importing the ST package; stakeholders and concerns as model elements; auditing the import; lab | **Aligned, with a large added SysML v2 foundations load.** Faculty decision 8 in DECISION_LOG A21 sanctions it. About half of the week teaches the language rather than "Import / Stakeholders". The import itself covers **only the Week 1 and Week 2 exports** (`workbench/week8/skeleton.ts:104-180`); Week 3–5 artifacts are entered by hand |
| 9 | Needs / Requirements | Outline only. The outline doc uses objective IDs B9.x, while `course.ts` uses W9.x | **Omitted** (outline). There is an ID-scheme conflict between the outline and course.ts |
| 10 | Logical / Behavioral Modeling | Outline only | **Omitted** (outline) |
| 11 | Physical / Interfaces | Outline only | **Omitted** (outline) |
| 12 | Digital Thread / V&V | Outline only | **Omitted** (outline) |
| 13 | Trade Study / Analysis | Outline only. The archive source (old Week 13) is at review verdict REVISE | **Omitted** (outline) |
| 14 | Final Presentation | Outline only. No final model-review rubric | **Omitted** (outline) |

### Omitted topics
- Week 6 at HEAD, and Weeks 7 and 9–14 entirely. **Seven whiteboard weeks have no taught content**, which is half the course and six of the seven Phase II weeks.
- Phase I synthesis: there is no Systems Thinking Engineering Package template or integration checklist. Week 6's draft has a "Preparing the Phase I baseline for Week 7" slide, but it is uncommitted.
- Phase I and Phase II presentation assessment criteria. The only presentation rubric is RB-11, written for the old checkpoint (CP) reviews.

### Rearranged topics
Content was moved from the earlier outline into new whiteboard weeks (`course.ts` draftSources). In the built weeks:
- capabilities (old W3) moved to W2;
- MOE/MOP and quality/traceability (old W5) moved to W2;
- TPMs moved to W3;
- interfaces (old W8) moved to W5;
- MBSE foundations (old W9) moved to W8.

These moves are coherent with the whiteboard. They were made at the lecture level and are recorded in each week's lecture outline.

### Diluted topics
- **Week 8 "Import … / Stakeholders":** the import is partial (Weeks 1–2 only), and the week is shared with language foundations. The stakeholder
  modelling itself is concentrated in S2 ("Stakeholders and concerns as model elements").
- **Week 3:** four subject areas in one week (TRA, risk with security/resilience, TPM, trade study), plus a 4-part lab. The
  depth per subject is lower than in Weeks 1, 2 or 4.

### Duplicated topics
- **Security and resilience:** W3 risk, W5 interface security and resilience, and (uncommitted) W6 evolution. Each is framed
  differently, but it is the same theme three times.
- **Allocation:** logical→physical allocation is taught in W4 S1 and is the declared Phase II subject of W11 ("Allocation from logical to
  physical"). This is intentional (Phase II re-models Phase I), but the boundary between "teach" and "model" is not written down for W11.
- **Trade study:** W3 and W13. This is intentional, since W13 redoes W3 in the model (`course.ts` W13.2).

---

## 2. Lecture-first philosophy (teach before practice; quizzes not ahead of material)

Evidence from the built weeks (1–5, 8):
- **Order:** the week bar is Overview → Lecture → Lesson → Worked examples → Laboratory → Assessment (`week1/route.ts:49-56`, the same in each
  `weekN/route.ts`). Session 2 of every built week ends with the lab launch after the lecture sections. In Week 1, about 47 lecture
  minutes come before about 22 lab minutes (`week1Path.ts:38-50`).
- **The quiz follows the material, and this is tested:** every quiz item carries `lecture: {session, slide, section}`. The Week 1 test
  `learn/week01.test.ts:232` checks that each item's slide and lesson section exist and contain the deciding idea, and each `quizWeekN.test.ts`
  carries equivalent assertions. The Assessment page says the quiz is "taken after both lectures" (`week1/Assessment.tsx:33`).
- **No gating either way:** "nothing on the site locks the laboratory behind a quiz" (`learn/welcome.ts:63`). Nothing stops a student
  from opening the quiz or the lab before the lecture either. The order is guidance, not enforcement. This fits a lecture-taught course.
- **Practice placement:** the Week 1 optional AeroLink missions sit after the worked examples (`/week/1/examples/practice`). The
  old self-study flow, where practice could come first, is unrouted (`App.tsx` comment: "kept but no longer routed").
- **Outline weeks** (6 at HEAD, 7, 9–14) show readings and objectives with nothing to teach from. No quiz is exposed there, so no
  quiz runs ahead of the material. Archived old-module quizzes at `#/draft/<old>` are reachable from those outline pages. They test old objectives,
  so a student who follows them would be assessed on material not taught under the current schedule.

**Verdict:** the built weeks are structurally lecture-first. The risk sits in the outline weeks, where the only taught-looking
material is archive content keyed to the old outline.

---

## 3. Deep teaching vs superficial Q&A

**Signs of deep teaching (built weeks):**
- Every slide has faculty notes with teach steps, why, figure walk-through, misconceptions, transition and timing (`lectures/types.ts`), checked to stay at or below
  130 spoken words per minute (`timing.test.ts`).
- Notes run to about 7,000–11,000 words per session (`exports/lectures/*-notes.md`). Long-form lessons run to about 11,000–22,500 words per week.
- Cited definitions with pages; worked examples computed from case data (W3, W5); 4 equations in W3; a step-by-step concern→need method in W1.
- Quizzes use transfer items in new domains (e.g. W1 q2, hospital emergency department) and explain every option. Keys are balanced against
  test-wise guessing (`learn/week01.test.ts:182,198`).

**Where it behaves more like superficial Q&A or form-filling:**
- **The lab tools check form, not quality.** After the 2026-10-19 gate sweep, "only an empty answer fails" for many fields:
  - In W1, a need warning is cleared by a one-word justification, and the rationale needs one word (`needQuality.ts:117,333-341`).
  - The six-check need self-check is ticked by the student.
  - In W5 at HEAD, "none/n/a/?" is accepted for protection and decision (Week 5 confirmation N1, open).
  - W4's confirmation records "3 weakly justified gates".
  The tools therefore certify completeness. Engineering quality is left to the rubric and instructor feedback, which is appropriate only if the
  instructor actually reviews every record.
- **Assessment is formative MCQ only:** 10–12 items per week, with no short-answer or applied item in the app. Weeks 2–5 and 8 list
  an "applied exercise" or "listing exercise" brief, but that work is submitted outside the app. Exam placement is undecided.
- **Interactive practice is uneven:** only Week 1 has interactive practice (4 AeroLink missions). Weeks 2–5 and 8 have a paper "try it yourself"
  exercise only. Week 8 has none. The many interactive activities in `src/activities/week02..13` belong to the old outline and are not
  linked from the built weeks.
- **Enterprise approval is self-declared** in the W1 tool (`team.ts:280-317`). A team can mark itself "approved".

---

## 4. Phase I → Phase II continuity in content

| Link | Designed (course.ts `models`) | Actual |
|---|---|---|
| W1 → W8 (stakeholders) | W8 models W1 | **Implemented.** The W8 tool imports the W1 model-inputs file (v1–3). The W1 JSON carries `seeds` naming the SysML v2 element for each item (`team.ts:587-618`). My Project shows a Week 8 mapping preview |
| W2 → W8 / W9 (requirements) | W9 models W2 | W8 imports W2 (v1). **W9 does not exist** |
| W3 → W13 (trade study) | W13 models W3 | W3 is built. **W13 does not exist** (outline only) |
| W4 → W10 (logical/behavior) | W10 models W2 and W4 | W4 is built. **W10 does not exist** |
| W5 → W11 (physical/interfaces) | W11 models W5 | W5 is built. **W11 does not exist**. The W8 import does not read the W5 export |
| W6 → W14 (roadmap in the model) | W14 models W6 and W7 | **Neither exists** at HEAD |
| W7 package → W8 import | W8 imports "the package" | There is no W7 package artifact. W8 imports per-week files (W1, W2) instead |

Mechanically, Phase I weeks chain by file import: each `weekN-model-inputs` v1 imports the previous week's file. The canonical
project store (My Project, A22) covers only Week 1; per `project/practice/handoffs.ts`, later weeks come in phase P2. There is also a data-layer
inconsistency in the instructor's own case. The shared AeroLink reference baseline still carries 21 differences marked
"fix in Week 2" (`week01/aerolinkCanonical.test.ts:20-46`), so Phase II weeks built on that baseline (W12/W13 archive counts) would inherit
pre-revision AeroLink data.

**Verdict:** continuity is designed thoroughly (`course.ts` `models`, the JSON `seeds`, the bridge sections in every lecture). It is delivered only
for W1/W2 → W8. Five of the six Phase II modelling links point at weeks that do not exist yet.

---

## 5. AeroLink (instructor case) vs student enterprise separation

**Separation that is enforced:**
- The Welcome page (§3) and every lab say AeroLink is the instructor's FICTIONAL reference case and that each team models its own enterprise
  (`learn/welcome.ts:43-44`; `week01Lab.ts` LAB_PURPOSE "never to AeroLink").
- The W1 tool rejects a proposal that names AeroLink (`team.ts:228-229, 289`).
- The W2 import rejects a W1 record that names AeroLink (`workbench/week2/record.ts:367`).
- The navigation groups AeroLink pages under "AeroLink worked example (instructor’s case)" (`App.tsx` NAV).
- Practice banners point to "Apply it in My Project" (`week1/Workbench.tsx:46`).

**Separation that is weakened:**
- **Copy-from-practice** of AeroLink stakeholders into a team project is enabled (`project/practice/copyFromPractice.ts:14`
  `COPY_FROM_PRACTICE_ENABLED = true`), even though it is marked "Faculty decision F4 (pending)". The copies are flagged and
  count only after adaptation.
- Teaching material is AeroLink-centred by design: every lecture works AeroLink. Generalisation to student enterprises appears only through
  transfer quiz items and the labs. No second, contrasting example domain appears in the lectures.
- AeroLink data is spread across several modules: `lectures/week0N/aerolinkCase.ts` per week, `src/model/reference/week0N.ts`, `src/model/airtaxi.ts`
  and `sysml/reference/*`. The canonical-data plan and test manage the drift but do not yet remove it (see §4).

---

## 6. Top academic risks (ordered)

1. **Half the course has no taught content.** Week 6 at HEAD and Weeks 7 and 9–14 are outline only, six weeks before the 2026-12-01
   deadline. Phase II, the MBSE half of the course title, has one built week of seven.
2. **Archive content could stand in for the current schedule.** The outline pages link old-outline modules and quizzes (`#/draft/<old>`) that
   assess old objectives. Students may treat these as current week material.
3. **The lab tools certify completeness, not engineering quality.** Gates were loosened on purpose ("only empty fails"; one-word justifications;
   self-ticked checks; W5's n/a acceptance open at HEAD). Assessment rigour therefore depends on instructor review of every record.
4. **No Phase I or Phase II synthesis assessment.** There are no Week 7 or Week 14 package or model rubrics and no peer-review criteria, and the exam plan is undecided while
   the old Exam 1 still assumes Week 7.
5. **Continuity is broken where Phase II should consume Phase I:** W8 imports only W1–W2, and there is no W7 package. The AeroLink reference
   baseline is not reconciled.
6. **Topic load and duplication:** W3 is overloaded. Security/resilience appears in 3 weeks. W8 is split between language foundations and the
   whiteboard subject.
7. **Unreviewed, uncommitted Week 6.** It is partly reachable (lectures and pptx exist; lab and quiz are unrouted), it depends on uncommitted register entries
   R105–R109, and it has no independent review.
8. **Faculty decisions are visible to students but unresolved:** proposed objectives in every built week, three-person minimums, RB-1.4
   scoring, F4 copy-from-practice and exam placement.
