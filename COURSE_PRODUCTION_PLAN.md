# Course Production Plan (to the 2026-12-01 submission)

Governing decisions: DECISION_LOG A19 (whiteboard schedule, `COURSE_SCHEDULE.md`) and A20 (professor-led, lecture-first course).
Written 2026-10-18.

## Definition of done for a week

A week is complete only when every item below has passed an independent check:

| Item | Content | Check |
|---|---|---|
| A | PowerPoint lecture (.pptx), sized to two 75-minute sessions | Slide review: purpose, depth, design, figures |
| B | Slide-by-slide faculty notes with timing | Can another instructor teach from them? |
| C | Long-form student lecture material | Matches the slides (generated from the same source) |
| D | AeroLink case study, worked in full | Technical accuracy; consistent with the reference model |
| E/F | Team-enterprise laboratory with inputs, method, procedure, outputs and rubric | Feasible within the workload; gradable |
| G | Assessment, separate from the lecture | Key balance, answerable from the lecture, no cueing |
| H | Reference register; every major claim cited to a page | Each citation checked against the source text |
| I | Web module: lecture viewer, reader, examples, laboratory, submission | Gates: tsc, unit tests, build, end-to-end and accessibility tests |

A title on the dashboard is not completion.

## Single-source pipeline (built once with Week 1, reused by every week)

`learning-studio/src/content/lectures/weekNN/` holds slides (title, purpose, body, figure, sources, minutes, notes) and
the long-form lesson sections. From that one source come:

- the web slide viewer and the single-column reader;
- `exports/lectures/weekNN.pptx`, with the faculty notes as speaker notes and figures rendered from the same SVG components;
- the faculty-notes PDF/Markdown and the student lecture handout.

## Milestones

| Date | Milestone |
|---|---|
| Oct 18–25 | **M1 Week 1 package.** Critical review, then the outline, the pipeline, the slides and notes, the case study, the laboratory, the web integration, then independent review and tests. Presented for faculty approval. |
| Oct 26–28 | **M2 Template approved.** Faculty feedback applied; the format is frozen as the template. In parallel: source-grounded outlines for Weeks 2–14. |
| Oct 29 – Nov 8 | **M3 Phase I.** Weeks 2–6 (about two days each, two weeks in parallel) and Week 7 (review and presentation week), each reviewed. |
| Nov 9 – Nov 22 | **M4 Phase II.** Weeks 8–13, with SysML v2 examples validated by the OMG Pilot checker, and Week 14 (review and presentation week). |
| Nov 23–27 | **M5 Integration and QA.** Course-wide consistency, the reference register, workload, accessibility and the full end-to-end run. |
| Nov 28–30 | **M6 Submission package.** Exports, syllabus, the faculty decision list and the final build. |
| Dec 1 | Submission. |

Risk: Phase II is the larger body of work, with the SysML v2 validation runs. If M3 slips by more than three days,
Weeks 7 and 14 drop to the minimum review-week content first, then the optional interactive tools.

## Re-use

The independently reviewed draft material (`COURSE_SCHEDULE.md` reuse map; archive at `#/draft/N`), the verified
reading register and the AeroLink reference model are re-used as source material. Nothing is discarded.
