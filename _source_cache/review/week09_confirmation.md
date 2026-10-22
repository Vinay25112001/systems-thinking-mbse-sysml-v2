# Week 9 confirmation review: fixes to the 2026-10-22 REVISE (light) findings

Reviewer: independent reviewer, read-only. Date: 2026-10-22.

**Scope**
- Original review: `_source_cache/review/week09_review.md`.
- The builder's dispositions: `learning-studio/docs/lectures/week09/WEEK9_MILESTONE_REPORT.md` §12 (lines 108–127).

**What I did not do**
- I edited no file except this one.
- No git operations, installs or generators.
- No checker run and no Playwright. I inspected the recorded checker report instead.

All paths below are relative to `learning-studio/` unless they start with `_source_cache/`.

## Verdict: **SIGN-OFF for Week 9**, with one cross-week follow-up (C1) and four minor notes

All five findings that blocked sign-off are fixed, and each fix is tested. All nine minor findings are fixed except m9, which was deferred as directed.

**What I re-ran**
- Vitest on 14 files: the Week 9 activities, figures, lab, lectures, quiz and workbench, plus `shortAnswers` and `content.test`. Result: **988 passed, 0 failed**.
- `npx tsc -b`: **exit 0**.

**Checker evidence: valid**
- `sysml/lectures/week09/week09-report.json` (timestamp 2026-10-22T04:56Z) covers 16 files: 13 PASS and 3 FAIL. The 3 FAILs are the intended `invalid_*` files.
- For every file, the SHA-256 I recomputed today matches the report, and every file's last-modified time is earlier than the report.
- The diagnostic counts are unchanged from the original review: 3, 1 and 1 on the invalid files, 2 on the stress model, 1 on the satisfy predict listing.
- The listings changed by M1 (the four generated models) and the key changed by m8 are therefore re-validated.
- `sysml/validation-report.json` is dated 2026-10-11. It is not the Week 9 record and is not relevant here.

## Per-finding table

| ID | Status | Evidence |
|---|---|---|
| M1 | **Fixed in Week 9; consistent with the sources** | **Slide** (`src/content/lectures/week09/session1.ts`): purpose `:484`; caption `:489` (now labelled); bullets `:493` ("bind theirs to a feature of it: subject engine = vehicle.engine;", "independent, unbound subjects … not satisfiable as a whole"); notes `:497-501`, with the binding pattern, a Week 11 preview and "course reasoning"; misconception `:505`.<br>**Lesson** `:844`: the same content, citing R83 p.167 and R74 sl.90.<br>**Figure** (`LectureWeek9S1.tsx:273-274`): chips read "satisfiable" and "satisfy members", and the alt text matches (`session1.ts:490`).<br>**Generated doc** (`src/workbench/week9/requirements.ts:711,718`) and all four regenerated models (`aerolink_needs_requirements_v02.sysml:781,806`; `labtool_{collision,stress,team07}_model_v02.sysml`) now carry the narrowed claim and say that binding makes the group satisfiable.<br>**Deck** (`public/lectures/week09-session1.pptx`, built 00:58): the old wording is absent, and slide 15 carries the new wording.<br>**Quiz**: no item about groups and subjects (`quizWeek9.ts:33` is the package-vs-requirement item, which is unaffected).<br>**Sources checked**: R83 p.167 (`2a_OMG_Systems_Modeling_Language.txt:8767-8787`) has `VehicleRequirementsGroup` with `requirement engineRqts … { subject engine = vehicle.engine; }`. R74 sl.90 (`Intro_to_the_SysML_v2_Language_Textual_Notation.txt:3895-3940`) has `engineSpecification` with `subject clutchPort = engine.clutchPort` and `subject generateTorque = engine.generateTorque`, and the line "The subject of a grouped …" bound explicitly. The new text matches both. |
| N1 | **Fixed** | **State** (`state.ts`): `partials` and `auditNote` at `:40,42,47`; normalization drops junk keys (`:98-99`); `traceRows` receives the partial needs (`:129`, `requirements.ts:796-815`, status `'partial'`).<br>**`partialProblem`** (`:150-155`) uses `saidSomething` for the missing part, the owner and the week. A readiness item uses it (`:192,201`).<br>**Export**: the `.md` coverage column writes "partial" (`:230`). New sections "Partly covered needs (open items carried from the Week 2 audit)" (`:255-262`) and "Trace-audit note" (`:263`).<br>**UI** (`Week9LabTool.tsx`): status cell `:317`, checkbox `:321`, help text `:331`, open-item fields `:332-341`, note textarea `:391-392`.<br>**Lab text and rubric evidence**: `week09Lab.ts:79,104`; `WEEK9_LAB_INSTRUCTIONS.md:97`.<br>**AeroLink**: `TRACE_ROWS` passes `PARTIAL_OPEN`, so the matrix shows NEED-017 as partial (`aerolinkCase.ts:177,187`).<br>**Tests**: `state.test.ts:136-166`, including the negative case `owner: 'n/a n/a'` refused; `Week9LabTool.test.tsx:109-120`. |
| N2 | **Fixed** | **Student-visible top descriptor** (`week9Assessment.ts:65`): it names both classifications with their definitions ("requirement verification when a characteristic … is breached, requirement validation when the requirement does not carry the intent of its need"). No requirement ID or defect is named.<br>**Instructor key** (`exercise_flood_warning_key.sysml:5-14`): accepts EITHER classification for REQ-STK-003, each with its reason. States that REQ-SYS-003 is a requirement-verification finding, not system verification.<br>**Test**: `week09Lab.test.ts:62-76` checks both, including "reveals neither defect".<br>The old "validation finding" text no longer appears anywhere in the repo. |
| N3 | **Fixed** | "Course illustration, not SysML v2 graphical notation." appears in 17 captions in `session1.ts` and 10 in `session2.ts`, 27 in all.<br>`week9FigureKit.test.ts:77-89` asserts that all 27 drawn figures carry it (listings exempt) and includes a negative case.<br>Lesson figure blocks reference the slide figures (`session1.ts:781-831`), so they inherit the caption.<br>The deck has the label on 17 slide or notes parts. |
| N4 | **Fixed** | `aiProblem` (`state.ts:159-167`) uses `saidSomething` for the quote, the reason and the change. The shared-definition reason uses it as well (`:191`).<br>Negative tests: `state.test.ts:87-92` (quote, reason and change each tested with "none none", "n/a todo" and "tbd, later") and the `shortAnswers.test.ts:364` row. |
| m1 | Fixed | The `session1.ts:446` misconception now reads "…makes the need also require that concern to be addressed, which nothing in it does." The word "unsatisfiable" no longer appears in the Week 9 lectures. |
| m2 | Fixed | `session1.ts:676`: "Course rule: not between two requirements; use a derivation". |
| m3 | Fixed | `session2.ts:384-385,403`: the title, purpose and debrief now match the table. |
| m4 | Fixed | No "SysML v2.1" without "Beta 2" remains in the Week 9 lectures or the week page. |
| m5 | Fixed | The specification group / organizing group pair is used in the slide, the generated doc (`requirements.ts:711,718`) and the lab instructions (`:66`). |
| m6 | Fixed | `requirements.ts:355-357`: future or modal plans are stripped before the claim test, and the message explains how to write a plan. |
| m7 | Fixed | `Week9LabTool.tsx:273`: the assumption field says it is written informally (doc only) and how to make it gate the requirement. |
| m8 | Fixed | The key now uses `residentsWarned60MinBeforeFloodingPercent` (`:22,53`). The checker records PASS and the SHA-256 matches the file. |
| m9 | Deferred (cross-week, as directed) | Not re-checked. |

## New findings

| ID | Severity | File:line | Evidence | Fix |
|---|---|---|---|---|
| C1 | Moderate, **cross-week** (outside the Week 9 package, but a student will see both) | `src/content/weeks/week10.ts:46` (live: it is loaded by the `weeks/index.ts` glob); also `docs/authoring/week10_notes.md:143` | The Week 10 lesson still states the M1 claim in general form: "A group whose members keep different subjects of their own is therefore a collection for organisation: no single element conforms to all of them, and it is never satisfied as a whole." It cites S10 sl.90 and S06 p.167, the same sources Week 9 now uses to teach the opposite: members with different subjects can be satisfied together when their subjects are bound. `week10.ts:57` and `sysml/week10/aerolink_requirement_def_usage.sysml:49-50` are about one specific unbound group with no group subject, so they are still true and can stay. | In `week10.ts:46`, narrow the sentence to members whose subjects are independently typed and not bound to the group's subject or its features. Do this when Week 10 is next opened. |
| C2 | Minor | `docs/lectures/week09/WEEK09_LECTURE_OUTLINE.md:198,209` | The authoring outline still says "No single element conforms to all of them, so it is never satisfied as a whole". It is not student-facing. | Align it with `session1.ts:501`, or mark it as superseded. |
| C3 | Minor | `state.ts:180-205` vs `week09Lab.ts:78`; `WEEK9_LAB_INSTRUCTIONS.md:46` | The lab requires "Justify each assumption in one sentence in the trace-audit note", but readiness never checks the note. A team that writes assumptions and leaves the note empty reaches "ready", and the export reads "(not written yet)". | Add a readiness item for when any assumption is written: the note must pass `saidSomething`. Alternatively, accept it as written and leave it to the rubric. |
| C4 | Minor | `WEEK9_LAB_INSTRUCTIONS.md:87,138` (and its source in `week09Lab.ts`) | The list of what `team-NN-trace-matrix.md` contains (matrix, mapping table, trace audit, AI log) does not mention the new sections "Partly covered needs" and "Trace-audit note". | Add them to the list. |
| C5 | Minor (inherited, not a regression) | `week9Assessment.ts:22,29` | The graduate task 5 prompt says "REQ-SYS-003's condition is really 'in winds up to 10 m/s'". Together with the "(tested on calm days only)" note in the table, it tells graduate students which requirement is one of the two task-4 defects. N2 removed the reveal from the rubric, but this one remains in the prompt. | Faculty choice. Either accept it as a deliberate scaffold, or move task 5 after task 4 and phrase it without naming the defect. |

**No other new defects found**
- **Internal codes.** I searched the student-facing Week 9 sources (lectures, lab, assessment, quiz, tool, week page) for review codes, DECISION_LOG, "faculty item" and A2x. The only hits are in source comments.
- **Answer reveals.** None, apart from C5.
- **Stale numbers.** None in the changed text. The counts in the group docs (21/15 for AeroLink, 6/4 for the fixtures) are computed values.

## Required for sign-off

Nothing for Week 9. Fix C1 when Week 10 is next touched. C2–C5 are optional; C5 is a faculty choice.
