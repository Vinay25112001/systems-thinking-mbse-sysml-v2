# Week 6 confirmation review: Evolution Roadmap fixes

Reviewer: independent confirmation review (read-only). Date: 2026-10-21. This file is the only file written. I made no git
operations, ran no generators and installed nothing. One temporary vitest file, used to print the workload numbers, was
created under `src/` and deleted straight after the run.

- Original review: `_source_cache/review/week06_review.md` (REVISE: M1; Mo1–Mo6; n1–n11).
- Dispositions: `learning-studio/docs/lectures/week06/WEEK6_MILESTONE_REPORT.md` §9.
- Integrator decision for M1: option (b), the SEBoK trajectory, with DEC-001 committed and 320 trips/day by month 24.

Paths are relative to `learning-studio/` unless they start with `_source_cache/`.

## Verdict: **REVISE (narrow)**

Every original finding is fixed or properly handed to faculty, and M1 is carried through consistently. The case, the
slides, the notes, the lessons, the figures, the examples page and the tests all use one model, and every AeroLink number
recomputes from the data.

One new Moderate defect blocks sign-off. It sits in the concept that Mo1 fixed: the exercise's marking notes count the
bike-share dock headroom as an excess. The student task text, the level-2 descriptor and the lecture's own rule all say it
is not (N1). The fix is a few lines in the instructor brief. After that, a spot check is enough and no full re-review is
needed. The remaining new items are Minor or nits.

## Tests and type check

- **vitest, Week 6 and shared set: 14 files, 764 / 764 pass.** The set was `src/week6`, `src/workbench/week6`,
  `src/content/lectures/week06`, `week06Lab.test.ts`, `quizWeek6.test.ts`, `week6FigureKit.test.ts`,
  `shortAnswers.test.ts`, `content.test.ts`, `quizText.test.ts`, `components.test.tsx` (the Quiz component) and
  `src/lectures`.
- **vitest, other weeks' quizzes and week apps** (`quizWeek2/3/4/5/8.test.ts`, `src/week2–5`, `src/week8`): **6 files,
  81 / 81 pass.**
- **`npx tsc -b`.**
  - First run (15:22): exit 0, clean.
  - Re-run a few minutes later: exit 2, with 2 errors, both in `src/week1/learn/dump.tmp.test.tsx`. That file is untracked
    and was created at 15:26 by the concurrent Week 1 stream, so it is not a Week 6 error.
  - No Week 6 file has a type error.
- Playwright was not run, as instructed.

## AeroLink numbers, recomputed by hand

Inputs come from the Week 3 trade rules: 20 trips per aircraft, 48 charges per charger, 2 chargers per hub, a 16 h
operating day, demand 240, required capacity 300, and utilization at most 80 %.

| Quantity | Computation | Value | What the content says |
|---|---|---|---|
| Entry snapshot (ALT-001) | min(12×20, 6×48) = min(240, 288) | 240, fleet-limited | 240 (s2:608, Examples:158) ✓ |
| Trajectory at month 24 (ALT-004) | min(16×20, 8×48) = min(320, 384) | 320, fleet-limited | 320 (s1:197, :228, :771, :782; gap chart LectureWeek6S1.tsx:99–112) ✓ |
| GAP-001 | 320 − 300 | **excess of 20** | `C.capacityExcess` (s1:228, :235, :782; Examples:103) ✓ |
| Snapshot reading, taught as the error | 300 − 240 | 60 | `C.snapshotGap` (s1:228, :782) ✓ |
| Charger slack, taught as not an excess | 384 − 320 | 64 | `C.chargerSlack` (s1:236) ✓ |
| GAP-002, idle chargers | 8 chargers × (24 − 16) h | 8 × 8 h | aerolinkCase.ts:128–133 ✓ |
| Demand the trajectory supports | round(320 × 0.8) | 256 | INC-002 trigger, DQ reason 1 ✓ |
| Smallest fleet step that meets 300 | options +0/+4/+6 → 240/320/360 | +4 | FLEET_STEP (s1:229, :782) ✓ |
| Year-2 transition | hub first: min(12×20, 8×48) = 240; aircraft first: min(320, 6×48) = 288 < 300; 300 reached at ceil(300/20) = 15 aircraft, the 3rd of the 4 added | 240 / 288 / 15 | s2:290–300, :608 and the step chart ✓ |
| R-012, one hub out | min(320, 6×48) | 288 < 300 | aerolinkCase.ts:316, :369; s2:610 ✓ |
| Retained capacity after losing a hub | 192/240 and 288/320 | 80 % / 90 % | INC-000 resilience ✓ |
| INC-002 capacity step (ALT-006) | min(18×20, 8×48) = 360; supports 288; fires above 256 | 360 / 256 | aerolinkCase.ts:275–283, :325 ✓ |
| Bike-share exercise | fleet 600×4 = 2,400; docks 1,000×3 = 3,000; near gap 2,800 − 2,400 = 400; mid gap 3,600 − 2,400 = 1,200; docks against 3,600 are 600 short | as stated | brief:70–81 ✓ (but see N1) |

## Per-finding table

| ID | Status | Evidence |
|---|---|---|
| **M1** baseline contradiction | **Verified** | **Case data.** `aerolinkCase.ts:29–34` states the model. `YEAR2` (:88–103), GAP-001 against the trajectory (:120–125), INC-000 holds DEC-001 (:291–307), and Increment 1 is now "Resilient hubs" (:309–320).<br>**Lectures and lessons.** The notes (s1:197), the misconception card (s1:203), the lesson (s1:771, :782), the Session 2 slide and lesson (s2:245–277, :608) and the figures (LectureWeek6S1.tsx:98–112, S2 :226) all use the trajectory.<br>**No stale references.** No student text still reads "capacity first" or treats Increment 1 as the capacity step. The only remaining copies are in the outline's original plan, under a revision banner (see N8).<br>**Tests.** The model is pinned by `aerolinkCase.test.ts:151–192` (GAP-001 equals the trajectory; excess above and gap below the desired level; a negative test that the snapshot would show 60). |
| M1, driving question and key D | **Verified, coherent** | **Question and options.** The question is "After the Year-2 decision, should the next step be autonomy, more capacity, or ticketing, and in what order?" with A/B/C/D, and D is "None of the three first" (aerolinkCase.ts:526–543; s1:105).<br>**Coherence.** The evidence answer (resilience first, then Increment 2 on its triggers, then autonomy) follows from the data: there is no near-term capacity gap (+20); GAP-003's technology is available; ticketing waits for a partner; autonomy is at TRL 4. Session 1 teaches GAP-003 on the gap chart before the reveal, and the answer appears only in Session 2 (s2:372, :378) and its lesson (s2:620).<br>**Cues.** Nothing on the S1 slide face hints at D. The scenario names only the committed capacity step. D is the only negatively phrased option, which is a mild structural tell in an ungraded poll (faculty item F3). |
| Mo1 excess | **Verified in AeroLink; regressed in the exercise (N1)** | **AeroLink.** GAP-002 is only the idle chargers. Charger slack is taught as not an excess (aerolinkCase.ts:132; s1:229, :236, :782; misconception s1:240). Gate `kind` and the lab method agree (week06Lab.ts:141).<br>**Exercise.** The notes now accept the dock "excess" of 200 against the desired level (brief:76–81), which contradicts the task text, the descriptor and the AeroLink rule. See N1. |
| Mo2 dependency gate | **Verified** | **The gate.** `record.ts:443–460` is a DFS cycle search with a global visited set, which is correct. Lines 500–517 reject a later-horizon dependency and a cycle with student-visible messages, and line 854 exports only passing dependencies as `precedes`.<br>**Strings traced by hand:**<br>• "INC-000" on a mid increment: rank 0 ≤ 2, passes.<br>• "inc-002" passes, because `idsIn` upper-cases.<br>• An empty field passes ("No dependencies named").<br>• Same horizon passes.<br>• "INC-099" fails (not in the record).<br>• Self-reference fails.<br>• "GAP-001" fails.<br>• A near increment on a mid one fails as "later horizon".<br>• INC-002 → INC-003 → INC-002 fails as a cycle.<br>**Tests and table.** `record.test.ts:140–160` covers both directions. Gate-table row: LAB_INSTRUCTIONS.md:123. Slide-face phrase: anatomy slide, asserted by week06Lab.test.<br>**Residue.** Nits N5 and N6. |
| Mo3 W6.4 / W6.6 assessed | **Verified** | **W6.4.** Task 2 asks for the "development approach with a one-line reason" (assessmentParts.ts:14). The level-4 descriptor reads "justifies its development approach" and level 3 reads "approach has no reason" (:24). Marking notes: brief:89–92.<br>**W6.6.** Task 2 asks for "one risk that exists only during its transition" (:14). The descriptor names the "transition-only risk" (:24). Marking notes: brief:93–96.<br>**Tests.** assessmentParts.test.ts:34–43. |
| Mo4 exercise timing | **Verified** | **Arithmetic.** 5 reading + 7 + 13 + 5 + 6 = **36 min**, equal to the 0.6 h row (assessmentParts.ts:10–19; week6Path.ts exercise row; brief:130). Task 2 now has one full increment (9 elements) and a second with 3, which is 12 elements in 13 min, about 65 s each.<br>**Tests.** assessmentParts.test.ts:13–24. |
| Mo5 quiz cues | **Verified, with residue (N3)** | **Items rewritten.**<br>• w6q-11: options a and c fall inside the weekend but are not transition risks; retagged W6.3.<br>• w6q-5: b now has the "How …" form of the key.<br>• w6q-3: key shortened and b strengthened.<br>• w6q-4: distractors no longer contradict the stem.<br>**Keys and rules.** Keys are `abdcdabcadbc`, three of each. The soft-absolute list (any, every, all, whole, whatever, at once, without delay) is absent from every option.<br>**Residue.** Extreme words outside the regex remain only in distractors (N3). |
| Mo6 R108 page | **Verified** | **Evidence.** SEBoK text `=== PAGE 391 ===`: "there are a variety of development approaches; several with combinations of features including sequential, incremental and evolutionary … The boundaries between these groups are not clear-cut and there can be overlaps. The classification into the groups is mainly based on the criteria of the extent to which the requirements … are known, whether there are increments or not, and what these increments are used for", and "These adjectives apply only to the development stage".<br>**Content.** s1:353, :355, :802 and :803 now say only this. The agile clause (p.390) is gone. The `agile` pick-list entry (labBrief.ts:104) is supported by p.392 ("An agile approach is an iterative and incremental approach … frequently combined"), which is inside R108's registered range 391–393.<br>**Register.** No register change is needed. |
| n1 names | Verified | `filled` = words ≥ 1 and `said` (record.ts:400), used for technology and increment names (:462, :489). |
| n2 levels | Verified | `oneStated` (record.ts:430–431). The message names both inputs. |
| n3 baseline gating | Verified (as advisories) | record.ts:534 and :545; labBrief.ts:184–210; LAB_INSTRUCTIONS.md:134 and :139. |
| n4 horizons | Verified | "years 3–5" and "years 6–10" (aerolinkCase.ts:56–57). A test fixture still overlaps (N7). |
| n5 readings | Verified (partly, as stated) | **Fixed.** R107 pp.447–449 is required (week6Path.ts:81; week06Lab.ts:62), for 17 pages.<br>**Left to faculty.** R106 p.585 is an extension reading (week6Path.ts:86; week06Lab.ts:68). Making it required is a faculty item. |
| n6 off-ramp rule | Verified | The slide face reads "Course rule: an increment that inserts an immature technology needs an off-ramp". The notes (s1:444), the lesson (s1:809) and the gate basis (labBrief.ts:172) say "course convention". |
| n7 R105 | Verified | "living document (R105 p.529) … reviewed annually … (R105 p.531)" (s2:426, :646). |
| n8 raw slide ids | Verified; no cross-week break | **The diff.** `git diff src/components/Quiz.tsx` changes one line: `{o.explanation}` becomes `{readableSlideRefs(o.explanation)}`, and only after reveal.<br>**The helper.** `quizText.ts` replaces only `slide wNsK-…` IDs that resolve to a slide and leaves any other text unchanged.<br>**Other weeks.** Weeks 1–4 and 8 have no such IDs (0 occurrences each), so their rendering is byte-identical. Week 5 (54) and Week 6 (51) now render as "slide N “title”".<br>**Semantics.** Reveal-on-check is unchanged. components.test.tsx, quizText.test.ts and the other weeks' quiz tests pass. |
| n9 objective tags | Partly fixed (faculty item kept) | w6q-11 moves to W6.3, so W6.3 now has two items (w6q-8, w6q-11). w6q-1 and w6q-2 stay on W6.1, because no Week 6 objective covers gap analysis. |
| n10 descriptors | Verified | LC-N2 reads "same trip rate per bike" (brief:37). Insertion: "depot, vans and winter" (assessmentParts.ts:26; brief:127). Tariff rule at level 2 (assessmentParts.ts:25). Tested (assessmentParts.test.ts:48–52). |
| n11 depth | Deferred (optional) | Accepted. Adding text would push the lesson past the word count that keeps the lesson row at 0.7 h. |
| Session 2 lesson sentence | Verified | **The new wording.** s2:608 now reads "SEBoK counts planned capability in the baseline (R12 p.860), so the committed Week 3 step belongs to it …".<br>**No duplication.** It no longer repeats the faculty misconception text (s1:203, "SEBoK’s baseline is current and planned capability. Changes already decided …") or the Session 2 card (s2:277). |

## New findings

| ID | Sev | File:line | Evidence | Fix |
|---|---|---|---|---|
| **N1** | **Moderate** | `docs/lectures/week06/WEEK6_APPLIED_EXERCISE_BRIEF.md:76–81` vs `src/week6/assessmentParts.ts:13`, `:23`; `session1.ts:229`, `:240`, `:782` | **Notes:** the marking notes accept "dock limit of 3,000 against the desired 2,800 = 200 trips a day above the desired level" as an excess that can score 4.<br>**Task text:** the student task says "An excess is the baseline above the desired level, not spare room on a limit that does not bind".<br>**Descriptor:** level 2 lists "slack on the dock limit called an excess".<br>**Why the notes are wrong:** in the case the docks are the limit that does not bind (the fleet binds at 2,400), the same structure as AeroLink's chargers. The lecture and lesson rule that AeroLink's 384-charge limit, which lies above both the capacity of 320 and the desired 300, is *not* an excess. That rule is the misconception card's "removing it creates a gap".<br>**Effect:** a grader using the notes awards a 4 for the answer that the task statement and the descriptor score 2. The defect came from the original review's own prescription for Mo1 ("200 in the near term"), followed literally in the brief while the AeroLink fix applied the stricter rule. | Make the brief follow the lecture rule. The dock headroom is slack on a limit that does not bind, at any reference level, so Lakeside has no capacity excess. Task 1 is then answered with two gaps, and an answer that calls dock headroom (200 or 600) an excess scores at most 2.<br>Alternatively, if faculty prefer the per-capability reading, change the lecture rule, the misconception card, the task text and the descriptor to match. Do not leave the two halves inconsistent.<br>Update the assertion at `assessmentParts.test.ts:54` to match. |
| N2 | Minor | `src/workbench/week6/Week6LabTool.tsx:272`; `src/content/lectures/week06/labBrief.ts:161`, `:238` | **What the tool says:** the baseline field reads "The as-is: what exists when the enterprise enters service, and the limit that binds it". The baseline gate's short text and basis also say only "the as-is".<br>**What the rest says:** the lab method (week06Lab.ts:136) and both lectures say the baseline also holds any committed change, the baseline trajectory.<br>**Risk:** a team working from the tool alone is steered toward the snapshot reference, the very M1 error. | Add ", plus any change already decided (the baseline trajectory)" to the field label and to the gate's short text, then regenerate the lab instructions. |
| N3 | Minor | `src/content/quizWeek6.ts` w6q-4 a and b, w6q-6 b, w6q-9 b, w6q-8 a; `quizWeek6.test.ts` (soft-absolute list) | **Extreme wording, in distractors only:**<br>• "alone" (twice in w6q-4, the only two such options);<br>• "as soon as it can" (w6q-6b);<br>• "right away" (w6q-9b), a synonym of the banned "without delay";<br>• "A full stop" (w6q-8a).<br>No key uses such wording, so the absolute/hedge cue the Mo5 fix targeted survives in synonyms. | Reword, or extend the regex to include alone, right away, as soon as, at all, completely and a full. Keep the negative-direction test. |
| N4 | Minor (faculty) | `src/content/week6Path.ts` workload | **Rounded and unrounded totals:** each row is rounded, giving a total of 8.0 h. Unrounded, the total is 2.5 + 17/15 (1.133) + 6,658/9,000 (0.740) + 0.3 + 2.4 + 0.3 + 0.6 + 0.1 = **8.07 h**, up from 7.9996 h before the fixes.<br>**Other cases:** graduate students and three-person teams remain at 8.1 h. | Add to F1. Either accept, or trim about 100 lesson words, or 0.1 of lab person-hours, so that the unrounded total is at most 8.0. |
| N5 | Nit | `src/workbench/week6/record.ts:854` | `depsOk = x.baseline \|\| …` exports a baseline increment's dependencies as `precedes` without the gate. The tool gives the baseline no dependencies field, but an imported or hand-edited JSON can (importer line 209). For example, INC-000 depending on INC-002 would export "INC-002 precedes INC-000". | Export no dependencies from the baseline, or strip them on import. |
| N6 | Nit | `record.ts:442`, `:503` | A dependency on an increment with no horizon gets rank 0 and is never "later". This is harmless, because that increment fails its own horizon gate. | Optional. |
| N7 | Nit | `src/workbench/week6/fixture.ts:28` | The test fixture's horizons are "years 2 to 4" and "years 4 to 8", which overlap (the n4 class). The fixture is test-only, not student-facing. | Optional: "years 5 to 8". |
| N8 | Nit | `docs/lectures/week06/WEEK06_LECTURE_OUTLINE.md:285`, `:296`, `:306`; milestone report §2 row 3 | The outline's original S2.9–S2.11 text still reads "Increment 1, Year-2 capacity", "years 5–10" and "capacity comes first". It sits under an explicit "Revision 2026-10-21 … As built" banner (:269–277), so it is a faculty document and acceptable. The milestone report's §2 row 3 still quotes the superseded slide bullet, and §7 item 3 says so. | Optional: strike through the superseded lines. |

I checked these classes and found no other new defect:
- internal codes in student text (none: "review …" appears only in comments);
- stale week numbers;
- answers revealed early (quiz explanations appear only after Check; the driving-question answer appears only in Session 2 and its lesson);
- a workload above 8.0 h per row (none, but see N4).

## Faculty items

- **F1. Workload.** The row-rounded total is 8.0 h and the unrounded total is 8.07 h (N4). Graduate students and
  three-person teams are at 8.1 h. Making R106 p.585 required adds another 0.1 h.
- **F2. Baseline model.** Confirm the integrator's option (b), the SEBoK trajectory.
- **F3. Driving-question key.** D, "None of the three first", is now a substantive answer. Note that it is the only
  negatively phrased option.
- **F4. Proposed content.** This now includes the re-cut Increments 1 and 2, R-012 and the INC-002 capacity step at 256.
- **F5. Register.** R105–R109; the optional extension of R108 to p.390; the R26 p.680 correction.
- **F6. Off-ramp course rule.**
- **F7. Gap analysis.** A Week 6 objective for gap analysis, so that w6q-1 and w6q-2 can be retagged (n9).
- **F8 (new). Definition of an excess.** Decide which reading of "excess" applies to a limit that does not bind before the
  exercise brief is released (N1).
