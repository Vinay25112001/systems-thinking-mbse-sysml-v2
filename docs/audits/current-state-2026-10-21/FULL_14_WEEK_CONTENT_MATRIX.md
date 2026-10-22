# Full 14-Week Content Matrix (current state)

Audit date: 2026-10-21. This is a read-only discovery audit. Repo: `C:\Users\w451vxs\Documents\Course_Work\SysML`. App: `learning-studio/`.
Paths are relative to `learning-studio/` unless they start with `exports/`, `_source_cache/` or `docs/audits/`, which are at the repo root.

**Baseline:** HEAD `8b9637d` (2026-10-19 20:56, "P1 My Project workspace (A22)…"). The working tree holds uncommitted, unverified
partial work from stopped agents (`git status`):
- **Week 6:** an untracked build. It includes `src/content/lectures/week06/`, `LectureWeek6*.tsx`, `lectureWeek6Figures.ts`, `week6FigureKit*.ts`, `content/lab/week06Lab*.ts`,
  `quizWeek6*.ts`, `week6Path.ts` and `workbench/week6/`. Two modified tracked files register it: `lectures/index.ts` and `figures/registry.ts`.
- **Week 5:** fixes to `lectures/week05/{aerolinkCase,labBrief,session1,session2}.ts`, `week5/Examples.tsx` and `workbench/week5/record.ts`. These address the confirmation moderate N1.
- **Cross-week:** `workbench/week1/team.ts` and `week2/3/5/record.ts` now import `workbench/emptyAnswer.ts`, which is **untracked**. `week8/skeleton.ts` also changed.
- **Old-outline archive modules** (not the whiteboard weeks): changes to `content/weeks/week09.ts`, `week11.ts`, `week12.ts`, `activities/week11/*` and `activities/week12/*`.
  `activities/week11/*` imports `usePracticeUnlock.ts`, which is **untracked** and has an mtime of 2026-10-11.
- **Register:** `readings.generated.json` adds R105–R109, which only the uncommitted Week 6 uses.

**Status vocabulary (exact):** IMPLEMENTED AND TESTED / IMPLEMENTED BUT NOT TESTED / DRAFT CONTENT / OUTLINE ONLY / PLACEHOLDER /
MISSING / UNKNOWN.
- "Tested" means automated test files exist (named). I did **not** run any tests, so pass/fail is not asserted here.
- Internal review sign-off (`_source_cache/review/`) is reported separately in its own column. It is not the same thing as "tested".

**How the app serves weeks (this explains most of the matrix):**
- `App.tsx:159` and `lectures/route.ts:35` (`WEEK_PAGES = {1,2,3,4,5,8}`) give lecture-first week apps (`src/weekN/`) only to Weeks **1, 2, 3, 4, 5 and 8**.
- Every other `/week/N` renders `pages/WeekPage.tsx` → `RebuildWeek` (`WeekPage.tsx:198-288`). That page is an **outline only**: the course.ts outline, a
  "Provisional: being rebuilt" badge, "Learning objectives (provisional)" and links to archived old-outline draft modules at `#/draft/<old>`.
- `content/weeks/week03..13.ts` and `activities/week03..13/` are numbered by the **earlier outline** (`content/draftWeeks.ts`). They are archive material, not the whiteboard weeks.
- `_source_cache/review/week06..13_*.md` (2026-10-11/12) review those **old** modules.

---

## 1. Summary comparison matrix

Abbreviations: **I+T** = IMPLEMENTED AND TESTED · **I-NT** = IMPLEMENTED BUT NOT TESTED · **DRAFT** = DRAFT CONTENT · **OUT** = OUTLINE ONLY · **MISS** = MISSING · **UNK** = UNKNOWN.
"(wt)" marks content that exists only uncommitted in the working tree.

| Wk | Whiteboard topic | Displayed title matches? | Lecture (slides src/pptx) | Faculty notes | Student lesson | Worked examples | Interactive practice | Lab tool | Assessment (quiz) | Refs | PPTX | Internal review | **Overall** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Team Formation / Needs / Identifying Stakeholders | Yes | I+T (25+23 / 25+23) | I+T | I+T | I+T | I+T (4 AeroLink missions, optional) | I+T | I+T (10 MCQ) | 37 | present | READY FOR FACULTY REVIEW / flow SIGN-OFF | **IMPLEMENTED AND TESTED** (faculty review pending) |
| 2 | ConOps / Requirements | Yes | I+T (24+22 / 24+22) | I+T | I+T | I+T | MISS (paper exercise only) | I+T | I+T (12 MCQ) | 28 | present | SIGN-OFF | **IMPLEMENTED AND TESTED** |
| 3 | Technology Assessment / Risk Management / Trade Study | Yes | I+T (25+21 / 25+21) | I+T | I+T | I+T | MISS (paper exercise only) | I+T | I+T (12) | 20 | present; S2 deck older than its source | SIGN-OFF (5 minor) | **IMPLEMENTED AND TESTED** |
| 4 | Architecture / Information View | Yes | I+T (22+19 / 22+19) | I+T | I+T | I+T | MISS (paper exercise only) | I+T | I+T (12) | 20 | present | SIGN-OFF (7 minor) | **IMPLEMENTED AND TESTED** |
| 5 | Components / Interfaces | Yes | I+T (23+19 / 23+19) | I+T | I+T | I+T | MISS (paper exercise only) | I+T at HEAD, with 1 moderate open; fix in (wt) | I+T (12) | 17 | present; decks older than the HEAD fix commit and the (wt) edits | SIGN-OFF with **1 moderate open** | **IMPLEMENTED AND TESTED**, with an open moderate gate defect at HEAD |
| 6 | Evolution Roadmap | Yes (course.ts) | HEAD: OUT · (wt): DRAFT (23+19 / 23+19) | (wt) DRAFT | (wt) DRAFT | (wt) DRAFT, inside the lecture only | MISS | (wt) DRAFT, **not routed** | (wt) DRAFT, 12 items, **not routed** | HEAD 1 · (wt) 16 | (wt) from uncommitted source | none for the new Week 6 | **OUTLINE ONLY at HEAD**; DRAFT CONTENT uncommitted |
| 7 | Final Presentation (Phase I) | Yes | OUT (lecture outline doc) | MISS | MISS | MISS | MISS | MISS | MISS (no quiz by default; no presentation rubric for this week) | 1 | MISS | none | **OUTLINE ONLY** |
| 8 | Import Systems Thinking Artifacts / Stakeholders | Yes | I+T (27+21 / 27+21) | I+T | I+T | I+T | MISS (no exercise) | I+T (+ SysML checker guide) | I+T (12) | 13 | present | SIGN-OFF (final recheck) | **IMPLEMENTED AND TESTED** |
| 9 | Needs / Requirements | Yes | OUT | MISS | MISS | MISS | MISS (archive activities only) | MISS | MISS | 1+1 | MISS | none (old-module reviews only) | **OUTLINE ONLY** |
| 10 | Logical / Behavioral Modeling | Yes | OUT | MISS | MISS | MISS | MISS (archive only) | MISS | MISS | 3+1 | MISS | none | **OUTLINE ONLY** |
| 11 | Physical / Interfaces | Yes | OUT | MISS | MISS | MISS | MISS (archive only) | MISS | MISS | 2+1 | MISS | none | **OUTLINE ONLY** |
| 12 | Digital Thread / V&V | Yes | OUT | MISS | MISS | MISS | MISS (archive only) | MISS | MISS | 5+2 | MISS | none | **OUTLINE ONLY** |
| 13 | Trade Study / Analysis | Yes | OUT | MISS | MISS | MISS | MISS (archive only) | MISS | MISS | 5+2 | MISS | none | **OUTLINE ONLY** |
| 14 | Final Presentation (Phase II) | Yes | OUT | MISS | MISS | MISS | MISS | MISS | MISS (no quiz by default; no final model-review rubric) | 3+1 | MISS | none | **OUTLINE ONLY** |

**Headline:**
- 6 of 14 weeks are implemented on the lecture-first template: 1, 2, 3, 4, 5 and 8.
- 1 week has uncommitted draft content: Week 6.
- 7 weeks are outline only: 7, 9, 10, 11, 12, 13 and 14.
- **Phase II has one built week (8) out of seven.**

**Status-signal inconsistencies students will see:**
- `course.ts` marks Weeks 2–14 `status: 'provisional'` (`course.ts:102,124,144,160,176,192,214…`).
- `state/weekStatus.ts:24-32` therefore labels **built** Weeks 2–5 and 8 "Provisional: being rebuilt" on the Roadmap (`pages/Roadmap.tsx:52-56`).
- The Dashboard lists only Weeks 1–5 and 8 as available.
- With the working tree applied, the Dashboard would show Week 6 as "Available (pending review)" while the Roadmap still says "Provisional".

---

## 2. Per-week detail

Each week lists the dimensions in the order the brief asks for. Sources: course.ts, the week path files, lecture sources and `exports/lectures/`.

### Week 1: Team Formation / Needs / Identifying Stakeholders
See `docs/audits/current-state-2026-10-21/WEEK_1_DEEP_AUDIT.md` for the full audit. Summary:

| Dimension | Content | Status / evidence |
|---|---|---|
| Displayed title | "Week 1 — Team Formation / Needs / Identifying Stakeholders" (`course.ts:76`; `week1/Home.tsx:46`). Matches the whiteboard | — |
| Objectives | B1.1–B1.5 (`course.ts:84-90`), plus B1.6 and B1.7 "proposed, pending faculty approval" (`week1Path.ts:27-30`) | quoted in the deep audit §2 |
| Lecture sessions | S1 "Team Formation / Needs / Identifying Stakeholders"; S2 "Concerns, needs and the AeroLink case" | I+T: `lectures.test.ts`, `week01/timing.test.ts`, `session2.test.ts`, `e2e/lectures.spec.ts` |
| Slides | 25 + 23 in source = 25 + 23 in pptx | match |
| Faculty notes | about 11,250 + 10,380 words (`exports/lectures/week01-session*-notes.md`) | stripped in the student edition (`student-edition.ts`) |
| Student lesson | 21 sections + references; about 22,560 words; 7 optional self-checks | I+T |
| Worked examples | `week1/Examples.tsx`: S2 worked-example slides, lesson parts, a paper exercise (CON-014→NEED-014) | I+T: `week1/week1.test.tsx`, `e2e/week1-flow.spec.ts` |
| Interactive activities | Optional AeroLink missions w1-m1..m4 in the embedded workbench (`content/missions/week01.ts`) | I+T: `missions.test.ts`, `workbench/missions.test.ts`, `shell/practice.test.tsx`, `e2e/workbench.spec.ts` |
| Lab tool | Team enterprise view (`workbench/week1/team.ts`, `needQuality.ts`, `TeamView.tsx`), linked to My Project (IndexedDB) | I+T: `team.test.ts`, `needQuality.test.ts`, `labBrief.test.ts`, `shortAnswers.test.ts`, `project/adapters/week1.test.ts`, `e2e/project.spec.ts` |
| Assessment | Quiz Q1: 10 MCQ with explanations and taught-in links; record readiness; graduate needs review | I+T: `learn/week01.test.ts`, `components.test.tsx` |
| Project deliverable | Team charter, enterprise proposal, context, register (with REL), ≥8 needs, AI statement → `team-NN-week1-record.md` + `team-NN-week1-model-inputs.json` (format `week1-model-inputs` v3) | I+T |
| References | 37 distinct register IDs, all `verified: true`. Register verification is title-level; claim checks were done by the reviews | `week01_final_review.md` |
| PowerPoint | `public/lectures/week01-session{1,2}.pptx` (also in `exports/lectures/`), 2026-10-19 14:11, gitignored | present, current |
| Student web integration | Full lecture-first path: Overview → Lecture → Lesson → Examples → Lab → Assessment (`week1/route.ts:49-56`) | I+T |
| Instructor material | Faculty notes and slide purposes (instructor build only), notes Markdown, `docs/lectures/week01/*`; exam bank `instructor/exams/exam1.ts` (old outline) | — |
| Review | `week01_signoff_confirmation.md`: READY FOR FACULTY REVIEW. `week01_flow_signoff_confirmation.md`: SIGN-OFF (N4 minor open). All content `new-pending-review` | faculty review pending |
| **Overall** | **IMPLEMENTED AND TESTED** | |

### Week 2: ConOps / Requirements
| Dimension | Content | Status / evidence |
|---|---|---|
| Title | course.ts:102 "ConOps / Requirements"; both sessions use the same title (`week02/session1.ts:53`, `session2.ts:54`). Matches | — |
| Objectives | W2.1 "Construct a ConOps with nominal and off-nominal operational scenarios for the team’s enterprise"; W2.2 "Distinguish needs, stakeholder requirements and system requirements"; W2.3 "Write well-formed requirements with rationale, parent and verification method"; W2.4 "Trace requirements to needs in both directions and find orphans and childless parents"; W2.5 "Define measures of effectiveness and performance for the key requirements" (`course.ts:105-109`). W2.6 and W2.7 proposed (`week2Path.ts:30-31`) | — |
| Lecture | S1 sections: Framing; ConOps; Use cases, scenarios and mission threads; AeroLink worked example; Capabilities; Toward requirements. S2: Writing requirements; AeroLink requirements worked; Traceability and measures; Bridge; Lab launch | I+T: `week02/timing.test.ts`, `week02/aerolinkCase.test.ts`, `e2e/lectures-week2.spec.ts` |
| Slides | 24 + 22 = pptx 24 + 22. Content: 8 definitions, 5 tables, 40 figures | match |
| Faculty notes | about 10,790 + 9,230 words | I+T (timing test) |
| Lesson | about 14,260 words | I+T |
| Worked examples | `week2/Examples.tsx`: 5 parts + reference catalogue + optional paper exercise | I+T: `e2e/week2-flow.spec.ts` |
| Interactive activities | None on the path; `/week/2/practice` redirects to the lab (`week2/route.ts:29`) | MISS |
| Lab tool | "Lab L2 tool": scenarios ≥3 (nominal, off-nominal, support), capabilities ≥5, requirements ≥10 (6 STK + 4 SYS), ≥3 of 4 requirement types, MOE ≥3, MOP ≥3 (`week02/labBrief.ts:11-24`). Exports `week2-model-inputs` v1 and imports the Week 1 JSON | I+T: `workbench/week2/record.test.ts`, `Week2LabTool.test.tsx`, `lab/week02Lab.test.ts` |
| Assessment | 12 MCQ | I+T: `quizWeek2.test.ts` |
| Deliverable | ConOps with scenarios; stakeholder and system requirements traced to needs | — |
| References | 28 distinct IDs; R39m–R39p "pending faculty confirmation" | — |
| PPTX | `public/lectures/week02-session{1,2}.pptx`, 14:11, after the source mtime 11:26 | current |
| Review | `week02_confirmation.md:10` SIGN-OFF. N19 deferred: "S12 p.144" and "[S01/S02]" visible in rubric rows | — |
| Uncommitted | `workbench/week2/record.ts` (shared EMPTY_ANSWER, `TRIVIAL_CRITERION`) | depends on untracked `emptyAnswer.ts` |
| **Overall** | **IMPLEMENTED AND TESTED** | |

### Week 3: Technology Assessment / Risk Management / Trade Study
| Dimension | Content | Status / evidence |
|---|---|---|
| Title | course.ts:124; sessions `week03/session1.ts:57`, `session2.ts:52`. Matches | — |
| Objectives | W3.1 "Assess the readiness of the enterprise’s enabling technologies with evidence or labeled assumptions"; W3.2 "Write, rate and treat risks and maintain a risk register"; W3.3 "Structure a trade study with criteria traced to measures of effectiveness"; W3.4 "Test the sensitivity of the result and recommend a justified decision with residual uncertainty". W3.5 and W3.6 (TPMs) proposed (`week3Path.ts:38-39`) | — |
| Lecture | S1: Framing; Technology readiness; Risk management (security, resilience); TPMs; Hand-off. S2: Decision management and the trade study; AeroLink Year-2 capacity trade worked; Answer, bias, decision; Lab L3 | I+T |
| Slides | 25 + 21 = pptx 25 + 21. Content: 4 equations, 11 tables, 7 worked-example slides, 31 figures | match |
| Faculty notes | about 10,960 + 7,650 words | I+T |
| Lesson | about 11,650 words | I+T |
| Worked examples | 5 parts, computed in `week03/aerolinkCase.ts`; catalogue; optional exercise | I+T: `e2e/week3-flow.spec.ts` |
| Interactive | None (paper exercise only) | MISS |
| Lab tool | TECH ≥3, risks ≥6 (≥1 security, ≥1 resilience), opportunity ≥1, TPM ≥2, alternatives ≥3 incl. baseline, criteria ≥4; `MATURE_TRL 6` (`week03/labBrief.ts:28-39`). `week3-model-inputs` v1, imports Week 2 | I+T: `workbench/week3/*.test.ts*`, `lab/week03Lab.test.ts` |
| Assessment | 12 MCQ | I+T: `quizWeek3.test.ts` |
| References | 20 distinct IDs | — |
| PPTX | present. **S2 deck (14:13) is older than the S2 source (14:53) and its commit (14:54)**, so it is possibly stale | — |
| Review | `week03_confirmation.md:8` SIGN-OFF (5 minor follow-ups) | — |
| Uncommitted | `workbench/week3/record.ts` (shared EMPTY_ANSWER) | — |
| **Overall** | **IMPLEMENTED AND TESTED** | |

### Week 4: Architecture / Information View
| Dimension | Content | Status / evidence |
|---|---|---|
| Title | course.ts:144; sessions `week04/session1.ts:60`, `session2.ts:49`. Matches | — |
| Objectives | W4.1 "Describe architecture viewpoints and select the views the team’s enterprise needs"; W4.2 "Decompose the enterprise’s functions and allocate them with justification"; W4.3 "Build an information view that traces information from producer to consumer to decision". W4.4–W4.6 proposed (`week4Path.ts:37-39`) | — |
| Lecture | S1: Framing; Architecture and its description; Functions and decomposition; Logical/physical and allocation; Enterprise view and exit. S2: Information management and the information view; AeroLink worked example; Evaluation and consistency; Lab L4 | I+T |
| Slides | 22 + 19 = pptx 22 + 19. Content: 3 definitions, 8 tables, 29 figures | match |
| Faculty notes | about 9,030 + 7,360 words | I+T |
| Lesson | about 11,250 words | I+T |
| Worked examples | 5 parts + catalogue + optional exercise | I+T: `e2e/week4-flow.spec.ts` |
| Interactive | None | MISS |
| Lab tool | VP ≥5, functions ≥10, groups ≥3, LOG ≥4, PHY ≥4, decision ≥1, INFO ≥5, AI card ≥1 (`week04/labBrief.ts:26-37`). `week4-model-inputs` v1, imports Week 3 | I+T: `workbench/week4/*.test.ts*`, `lab/week04Lab.test.ts` |
| Assessment | 12 MCQ | I+T: `quizWeek4.test.ts` |
| References | 20 distinct IDs | — |
| PPTX | present (20:55–20:56, after the sources) | current |
| Review | `week04_confirmation.md:16` SIGN-OFF; N1 and N2 recommended before teaching; "3 weakly justified gates" (commit 229105d) | — |
| **Overall** | **IMPLEMENTED AND TESTED** | |

### Week 5: Components / Interfaces
| Dimension | Content | Status / evidence |
|---|---|---|
| Title | course.ts:160; sessions `week05/session1.ts:187`, `session2.ts:156`. Matches | — |
| Objectives | W5.1 "Break the architecture down into components with clear responsibilities"; W5.2 "Identify interfaces between components with an N² chart"; W5.3 "Define each interface in an interface table: what crosses it, in which direction and under which constraints". W5.4 and W5.5 proposed (`week5Path.ts:38-39`) | — |
| Lecture | S1: Framing; Components; Interfaces and the N² chart; Interface definitions and requirements. S2: Managing interfaces; Interface security and resilience; Auditing, integrating and comparing; Limits; Lab L5 | I+T |
| Slides | 23 + 19 = pptx 23 + 19. Content: 2 definitions, 12 tables, 6 worked-example slides, 32 figures (33 per the commit message) | match |
| Faculty notes | about 9,260 + 7,160 words | I+T |
| Lesson | about 12,140 words; 9 + 7 sections | I+T |
| Worked examples | 6 parts + catalogue + optional exercise (answer computed, hidden until requested) | I+T: `week5/exampleParts.test.ts`, `e2e/week5-flow.spec.ts` |
| Interactive | None | MISS |
| Lab tool | CMP ≥5, IF ≥8, interface requirements ≥3, risk links ≥2, change request ≥1; 17 named gates (`week05/labBrief.ts:38-46`). `week5-model-inputs` v1, imports Week 4 | I+T: `workbench/week5/*.test.ts*`, `lab/week05Lab.test.ts` |
| Assessment | 12 MCQ | I+T: `quizWeek5.test.ts` |
| References | 17 distinct IDs (incl. R100–R104) | — |
| PPTX | present, but the decks (20:17) are **older than the HEAD review-fix commit 41b2578 (20:23)** and the (wt) edits. Likely stale | — |
| Review | `week05_confirmation.md:17` "SIGN-OFF (Week 5), with one moderate from the sweep to fix before teaching". N1: protection and decision fields accept "none/n/a/-/?" | open at HEAD |
| Uncommitted | Fix for N1 and others: `week05/{aerolinkCase,labBrief,session1,session2}.ts`, `week5/Examples.tsx`, `workbench/week5/record.ts` (+ tests). Depends on untracked `emptyAnswer.ts`; unverified | — |
| **Overall** | **IMPLEMENTED AND TESTED**, with one moderate gate defect open at HEAD | |

### Week 6: Evolution Roadmap
| Dimension | Content | Status / evidence |
|---|---|---|
| Title | course.ts:176 "Evolution Roadmap". Matches | — |
| Objectives (HEAD, provisional) | W6.1 "Plan enterprise evolution increments with their triggers and dependencies"; W6.2 "Plan technology insertion from the Week 3 readiness assessment"; W6.3 "Describe the transition from the current enterprise to each increment" (`course.ts:179-183`). (wt) `week6Path.ts:36-41` proposes W6.4–W6.6 | — |
| What `/week/6` renders | **HEAD:** `RebuildWeek` outline. **(wt):** a `LectureEntry` above the outline. `/week/6/lecture/{1,2}`, the handout and `/week/6/lesson` work. Lab, lab tool, quiz, examples and week page are **unreachable**: there is no `src/week6/`, so `#/week/6/lab` is "Page not found" | — |
| Lecture | (wt) `lectures/week06/session1.ts` (855 lines), `session2.ts` (705 lines), 2026-10-19, "new-pending-review". The committed outline is `docs/lectures/week06/WEEK06_LECTURE_OUTLINE.md` (about 7,340 words) | HEAD OUT · (wt) DRAFT |
| Slides | (wt) 23 + 19 = pptx 23 + 19 (S1: 22 slides + refs; S2: 18 slides + refs) | — |
| Faculty notes | (wt) about 9,140 + 7,420 words | DRAFT |
| Lesson | (wt) 6 + 7 sections, about 10,210 words | DRAFT |
| Worked examples | (wt) inside the lecture: S1 "Worked example: AeroLink's technology plan"; S2 worked examples I–V. No examples page | DRAFT |
| Interactive | none | MISS |
| Lab tool | (wt) `workbench/week6/record.ts` (878 lines): 36 hard gates and 7 advisories (`week06/labBrief.ts:128-201`); lab instructions `content/lab/week06Lab.ts`, 9-step procedure; not routed | DRAFT |
| Assessment | (wt) `quizWeek6.ts`, 12 items; not routed | DRAFT |
| Tests | (wt) `week6FigureKit.test.ts`, `week06Lab.test.ts`, `quizWeek6.test.ts`, `workbench/week6/record.test.ts`, `lectures/week06/timing.test.ts`. All uncommitted and not run | — |
| References | HEAD: R26 only. (wt) lecture: 16 distinct IDs, including R105–R109, which exist only in the uncommitted register | — |
| PPTX | `public/lectures/week06-session*.pptx` and `exports/…`, generated 20:38 from **uncommitted** source | — |
| Review | None for the new Week 6. `week06_review/signoff.md` cover old Week 6 (TRL/risk) | — |
| Whiteboard coverage | (wt) increments, technology insertion and transition are all covered | — |
| **Overall** | **OUTLINE ONLY at HEAD**; DRAFT CONTENT (unverified, uncommitted, partly unreachable) in the working tree | |

### Week 7: Final Presentation (Phase I)
| Dimension | Content | Status |
|---|---|---|
| Title / objectives | course.ts:192: W7.1 "Integrate the Weeks 1–6 work into a consistent Systems Thinking Engineering Package"; W7.2 "Present and defend the team’s decisions in the Phase I presentation"; W7.3 "Review another team’s package against stated criteria" (provisional) | OUT |
| Lecture | `docs/lectures/week07/WEEK07_LECTURE_OUTLINE.md` (about 3,700 words): "Draft outline for faculty review… Nothing here is in the app source yet" | OUT |
| Notes / lesson / examples / activities / lab | none | MISS |
| Assessment | No quiz by default. **No package-integration or Phase I presentation rubric** for this schedule. RB-11 (`ASSESSMENT_RUBRICS.md:135-143`) was written for the old CP reviews. `instructor/exams/exam1.ts` is the old-outline Exam 1 ("week: 7") and conflicts with Week 7 now being a presentation week | MISS |
| Deliverable | Systems Thinking Engineering Package + presentation (course.ts) | OUT |
| **Overall** | **OUTLINE ONLY** | |

### Week 8: Import Systems Thinking Artifacts / Stakeholders
| Dimension | Content | Status / evidence |
|---|---|---|
| Title | course.ts:214; sessions `week08/session1.ts:61`, `session2.ts:69`. Matches | — |
| Objectives | W8.1 "Explain what MBSE changes compared with document-based work, and the difference between a model and a view"; W8.2 "Explain definition vs usage in SysML v2 and create packages and part definitions with typed attributes"; W8.3 "Map the Systems Thinking Engineering Package, by artifact ID, onto model packages"; W8.4 "Model the Week 1 stakeholders and their concerns". W8.5 and W8.6 proposed (`week8Path.ts:31-32`) | — |
| Lecture | S1: Framing; What MBSE changes; Model and view; Language architecture; Definition and usage; Attributes and units; Calibration. S2: Retrieval; Packages, imports and names; Course toolchain; Importing the package; Stakeholders and concerns; Auditing the import; Lab launch. Validated SysML listings (`week08/listings.ts`, `sysml/lectures/week08/*`) | I+T: `week08/timing.test.ts`, `e2e/lectures-week8.spec.ts`; there is no Week 8 aerolinkCase test |
| Slides | 27 + 21 = pptx 27 + 21 | match |
| Faculty notes | about 10,260 + 9,160 words | I+T |
| Lesson | about 13,420 words | I+T |
| Worked examples | 4 parts + full mapping matrix + generated `.sysml` model, validated | I+T: `e2e/week8-flow.spec.ts` |
| Interactive | none (no exercise) | MISS |
| Lab tool | Lab L8 Model v0.1: 8 steps; register coverage 1.0; purpose ≥15 words; outputs `team-NN-model-v01.sysml`, mapping matrix, checker log; checker guide `/week/8/lab/checker`. **Imports only the Week 1 and Week 2 exports** (`workbench/week8/skeleton.ts:104-180`); Week 3–5 IDs are entered by hand | I+T: `workbench/week8/*.test.ts*`, `lab/week08Lab.test.ts`, `lab/week08Checker.test.ts` |
| Assessment | 12 MCQ + listing exercise | I+T: `quizWeek8.test.ts` |
| References | 13 distinct IDs | — |
| PPTX | present (15:40) | current |
| Review | `week08_confirmation.md:266` final recheck SIGN-OFF (N1–N9 closed) | — |
| **Overall** | **IMPLEMENTED AND TESTED** | |

### Weeks 9–14: outline only
At HEAD and in the working tree, every one of these weeks renders `RebuildWeek`. None has a current-week lecture, notes, lesson,
examples, activities, lab tool, quiz, deliverable template or pptx. Each has a committed lecture outline in `docs/lectures/weekNN/`. The archive draft
modules linked from each outline page are old-outline material, reviewed 2026-10-11/12 against **old** objectives.

| Wk | Title (course.ts) and objectives (provisional) | Lecture outline doc (committed) | Archive material reused (old module) | Refs (course.ts) | Overall |
|---|---|---|---|---|---|
| 9 | Needs / Requirements (`:231`): W9.1 model the Week 2 requirements as requirement defs/usages with subject, constraint and ID; W9.2 trace model requirements to needs; W9.3 check each Week 2 requirement is represented once | `WEEK09_LECTURE_OUTLINE.md`, about 10,260 words, 42 slides planned. **Uses B9.x IDs, not W9.x** | old Week 10 "SysML v2 requirements and structure" (`weeks/week10.ts`; old SIGN-OFF) | R74 + R83 | **OUTLINE ONLY** |
| 10 | Logical / Behavioral Modeling (`:247`): W10.1 Week 4 logical architecture; W10.2 ConOps scenario as action flow + states; W10.3 check behavior vs ConOps | `WEEK10_…`, about 8,750 words, 45 planned; B10.x IDs | old Week 11 "SysML v2 behaviour" | R72, R73, R76 + R82 | **OUTLINE ONLY** |
| 11 | Physical / Interfaces (`:263`): W11.1 parts with ports; W11.2 interfaces and connections; W11.3 logical→physical allocation | `WEEK11_…`, about 9,050 words, 41 planned; B11.x IDs | old Week 10 (structure) + old Week 8 (interfaces) | R71, R57 + R20c | **OUTLINE ONLY** |
| 12 | Digital Thread / V&V (`:282`): W12.1 V vs V, method per requirement; W12.2 verification cases, satisfy/verify; W12.3 digital-thread audit | `WEEK12_…`, about 7,500 words, 42 planned; B12.x IDs | old Week 12 (same subject); (wt) edits to `weeks/week12.ts` and `activities/week12/*` | R75, R49, R58, R23a, R30 + R23b, R64 | **OUTLINE ONLY** |
| 13 | Trade Study / Analysis (`:298`): W13.1 analysis cases and constraints; W13.2 redo the Week 3 trade in the model; W13.3 change impact and consistency | `WEEK13_…`, about 9,930 words, 45 planned. Status line says "Nothing here is committed", but the file is committed | old Week 13 (`week13_review.md` **REVISE**: 6 Major) | R75, R77, R78, R24, R31 + R32, R88 | **OUTLINE ONLY** |
| 14 | Final Presentation (`:314`): W14.1 coherent SysML v2 enterprise model; W14.2 Week 6 roadmap in the model; W14.3 non-technical view and defence | `WEEK14_…`, about 5,590 words | old Week 14 outline only (no module, no review) | R77, R41, R26 + R29 | **OUTLINE ONLY** |

Additional notes:
- There is no `content/weeks/week14.ts`.
- Week 14 has no final model-review rubric, only RB-11, which was written for the old CP reviews.
- The (wt) edits to `weeks/week09.ts`, `week11.ts`, `week12.ts` and `activities/week11|12` change **old-outline** modules: old 9 = MBSE foundations, reused by current Week 8; old 11 = behaviour; old 12 = V&V.
  They date from the 2026-10-12 sign-off passes, not from this week's work. They change no whiteboard week's student path.
- Exports `exports/curriculum/{instructor,student}/week06–14.md` are course.ts outline dumps (about 200–330 words each, 2026-10-18). **They also label Weeks 2–5 and 8 "Provisional: being rebuilt"**, which is stale.

---

## 3. Cross-cutting dimensions

| Dimension | Finding | Evidence |
|---|---|---|
| Student/instructor separation | The notes toggle and handout notes render only `!IS_STUDENT_EDITION`. `student-edition.ts` strips `notes` and `purpose` from `session*.ts` and blanks pptx speaker notes. `scripts/check-student-build.mjs` checks both directions and the exam banks. Quiz keys and explanations ship to students by design (formative). The dev server at :5173 is the instructor edition | `lib/edition.ts`, `LectureViewer.tsx:112,125` |
| PPTX exports | 14 decks, for Weeks 1–6 and 8, in `public/lectures/` and `exports/lectures/`. **Gitignored** (`.gitignore:12`, `learning-studio/.gitignore:29`), so they are not part of HEAD. W3 S2 and W5 S1/S2 are older than their sources. W6 comes from uncommitted source | `stat` times |
| Phase continuity (data) | Weeks 1→2→3→4→5 chain by JSON file import (each `weekN-model-inputs` v1; Week 1 is v3). Week 8 imports only the Week 1 and Week 2 files. My Project (A22, IndexedDB) covers **Week 1 only** (`project/practice/handoffs.ts`: "P1: Week 1. Later weeks add an entry here (P2)") | `workbench/week8/skeleton.ts:104-180` |
| AeroLink canonical data | `aerolinkCanonical.test.ts` `PRE_REVISION`: 21 entries `fixIn: 'Week 2'` and 2 `fixIn: 'Week 12'` remain. The shared reference baseline is not reconciled with the per-week lecture case modules | `week01/aerolinkCanonical.test.ts:20-46` |
| Internal codes visible to students | Rubric rows "all S04 classes", "per S12 p.144", "[S01/S02]" (`rubrics.generated.json`). Raw "(Rnn p.x)" in the W3/W4/W5 lessons. Week 5 gate bases show "DoD p.139" and "R101 p.1467" (`week5/Lab.tsx:213`) | Week 2 confirmation N19 deferred |
| Tests (inventory) | Weeks 1–5 and 8 each have unit tests (timing, case, quiz, lab, record or tool) and e2e flow and lecture specs. Weeks 7 and 9–14: none for current content. Old archive modules have tests (`activities/week0X..13/*.test.ts*`, `weeks/weeks.test.ts`). No test run was performed in this audit | `git ls-tree` |
| Exams | `instructor/exams/exam1.ts` (old outline, Week 7). Exam placement is an open faculty decision (`course.ts:62-66`) | — |
