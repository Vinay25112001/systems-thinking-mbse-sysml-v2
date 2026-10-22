# Week 7 milestone report: Final Presentation (end of Phase I)

> Status on 2026-10-21: the Week 7 teaching package is built in the working tree and **not committed**. DECISION_LOG A21
> decision 7 (Weeks 7 and 14 are engineering reviews and presentations), A22/A23 §6 (Week 7 = the Systems Thinking
> Engineering Package and its design review) and A24 (content in parallel on the current approved template: lecture
> sessions, the detailed lesson, worked examples, the lab, a separate assessment; no navigation redesigned; the new Week 1
> navigation is applied later). Every part is pending faculty review. AeroLink is FICTIONAL and is the instructor's own
> worked package only: each team assembles and defends its own enterprise. Paths are relative to `learning-studio/` unless
> they start with `_source_cache/`.

## 1. What the week contains

| Component | Where | State |
|---|---|---|
| Session 1, “The Phase I engineering package and its design review” | `src/content/lectures/week07/session1.ts` | 21 slides + generated references; 69 min (56 min lecture, 13 min studio) + 6 min buffer; 6 lesson sections |
| Session 2, “Presenting and defending engineering decisions; the Phase I design review” | `src/content/lectures/week07/session2.ts` | 12 slides + references; 25 min lecture, 44 min review, 69 min + 6 buffer; 3 lesson sections |
| Detailed lesson | `studentLesson` of both sessions, `#/week/7/lesson` | 5,167 words (0.6 h at 150 wpm) |
| Faculty notes | every slide (`notes`: teach, why, figure walk, worked solution, examples, misconceptions, transition, timing) | 32,409 + 19,619 characters of notes source; decks 36,980 and 22,379 characters of speaker notes; 40–130 spoken wpm on every lecture slide (tested) |
| Figures | `src/components/figures/LectureWeek7S1.tsx` (9), `LectureWeek7S2.tsx` (6), `LectureWeek7Parts.tsx`, `week7FigureKit.ts`, `lectureWeek7Figures.ts`; registry block `// --- week07 ---` | 15 figures, every data label computed from the case; type rule and in-drawing checks (`week7FigureKit.test.ts`) |
| AeroLink case | `src/content/lectures/week07/aerolinkCase.ts` | Imports Weeks 1–6 read-only; package index, coverage per layer, 30 findings with dispositions, the 11-hop thread, the executive summary, the readiness answer, 4 RIDs — all computed |
| Lab brief (single source of rules) | `src/content/lectures/week07/labBrief.ts` | package sections, finding kinds, coverage layers, dispositions, RID vocabularies, gates with student-visible phrases, entry/exit criteria, review timing, person-hours |
| Week app | `src/week7/` (`route.ts`, `WeekNav.tsx`, `WeekShell.tsx`, `Week7App.tsx`, `Home.tsx`, `Examples.tsx`, `exampleParts.ts`, `Lab.tsx`, `Readiness.tsx`, `Assessment.tsx`, `assessmentParts.ts`) | Routed: `#/week/7`, `/examples`, `/lab`, `/lab/tool`, `/assessment`; aliases `/overview`, `/classic`, `/practice`, `/check` redirect; the earlier page archived at `#/archive/week/7` |
| Lab instructions | `src/content/lab/week07Lab.ts` → `docs/lectures/week07/WEEK7_LAB_INSTRUCTIONS.md` (`node scripts/build-lab-md.mjs 7`; Week 7 entry added to the script) | purpose, inputs, 8 method steps, 8 procedure steps, entry/exit criteria, presentation and review instructions, outputs, Parts 28–32, gate table, register rubric rows, the presentation rubric, the RID form, submission, workload |
| Package lab tool | `src/workbench/week7/record.ts`, `Week7LabTool.tsx`, `week7tool.css`, `fixture.ts` | imports the six weekly exports with each week's own importer; refuses wrong files and AeroLink; audit + coverage; dispositions, summary, review prep, RIDs; exports `team-NN-week7-package.md` (index + readiness report) and `.json` (`week7-package` v1) |
| Package format | `docs/lectures/week07/WEEK7_PACKAGE_FORMAT.md` | documents `week7-package` v1 for a later Week 8 adapter; **Week 8 unchanged** |
| Assessment | `src/week7/Assessment.tsx`, rubric in `week07Lab.ts` (`PRESENTATION_RUBRIC`, `RID_FORM_FIELDS`, `ridFormMarkdown`) | design-review rubric: 6 team + 2 individual criteria, 4 graduate criteria, a descriptor at every level; RID form with Markdown download; **no quiz** (justified on the page) |
| Path text and workload | `src/content/week7Path.ts` | 7.3 h per student (team of four); graduate 8.0 h; team of three 7.7 h; graduate on a team of three 8.4 h (faculty item) |
| Decks | `exports/lectures/week07-session{1,2}.pptx`, `-notes.md`, `week07-lesson.md`; `public/lectures/` copies | `npm run lectures:pptx -- --week 7 --port 5297`: 22 and 13 slides; student decks ship with empty notes (decks.ts rule: only Week 1 decks dropped) |
| Dashboard | `src/pages/Dashboard.tsx` (delimited `week07` blocks) | Week 7 path card “Available (pending review)”, like Weeks 2–6 and 8; the prototype-status bullet names Week 7. Roadmap page unchanged (same status for Weeks 2–14) |
| Shared wiring | `src/lectures/route.ts` (`WEEK_PAGES` adds 7), `App.tsx` (delimited `// --- week07 ---` blocks + two inline `/* week07 */` route checks), `lectures/Chrome.tsx`, `lectures/deckLinks.tsx`, `lectures/decks.test.ts`, `content/lectures/index.ts`, `content/course.ts` (Week 7 graduate task), `playwright.lectures.config.ts` | each a minimal, delimited edit; line endings of each file preserved |

**Input and output chain.** Week 7 reads the team's six exports (`week1-model-inputs` v1–3, `week2…week6-model-inputs` v1)
with each week's own importer; nothing is retyped. Its output `team-NN-week7-package.json` embeds the six exports
verbatim with the index, typed links, coverage, findings and dispositions, this week's writing and the readiness state.

## 2. Sessions, slides and design

**Session 1 (lecture first, then studio).** Framing (title; driving question “is the package ready to become a model?”,
vote A/B/C, answered only after the audit; where Week 7 sits). The package (a baseline, R36 pp.498–499; contents; a
requirements baseline records what is open, R56 p.389, R45 p.119; the executive summary, R18 p.473, R43 p.110; one
enterprise, one ID, one meaning, R13 p.565). Traceability and the audit (bidirectional traceability, R45 p.118; requirement
verification vs validation, R13 p.566, R06c p.387; coverage, findings and dispositions, R44 p.111, R13 p.565; worked
example: one thread; worked example: AeroLink's audit). The design review (definition, R06c p.386; prepare/conduct/complete,
R06c pp.387–388; entry and exit criteria, R40 p.70, R44 p.111; roles and independence, R06c p.388, R18 p.474; the SRR as a
labeled analogy, R40 pp.69–70; readiness answer for Week 8). Studio (11 min) and close (2 min).

**Session 2 (lecture first, then the review).** A defendable decision (R43 pp.109–110, R56 p.387); the six-link argument
(claim, evidence by ID, criteria, conditions, residual risk, what would change it; course convention on R43 p.110 and R18
p.473); defending AeroLink's Year-2 trade (computed from DEC-001); defending a risk position and a roadmap (R06c p.387,
R105 p.531); briefing a mixed audience (R105 p.531, R43 p.110); RIDs (R06c p.388); dispositions accept/defer/reject (R06c
p.388); worked example: four RIDs against the AeroLink package. Then the review: opening (criteria, roles, timing), team
slots (40 min: five teams 8 min = 4 briefing + 4 questions; four teams 10 min = 6 + 4; below 8 min is a faculty decision),
close (exit criteria, hand-on to Week 8).

**Design decisions taken by the integrator (faculty may revisit):**
1. Presentations happen in Session 2 after a 25-min lecture, as the brief's Session 2 content requires; to keep slots
   meaningful, **RIDs are written before the meeting** from the package sent 24 h ahead (SEBoK's preparation stage), and
   the meeting discusses them. This departs from the outline's Plan A (RIDs after the review).
2. The executive summary is taught in Session 1 (it is an entry criterion, due before Session 2).
3. The tool offers only record and defer; a fix is proven by re-export (no untestable “fixed” claim).

## 3. AeroLink worked example (the instructor's own package and review)

All computed in `aerolinkCase.ts` from Weeks 1–6 (FICTIONAL):
- Package index: 265 IDs across sections 2–8.
- Coverage (package rule, every week read): needs → stakeholder requirements 17/17 (100 %); stakeholder → system
  requirements 16/19 (84 %; REQ-STK-013, 014, 017 have no child by recorded decision); system requirements → architecture
  15/15 (100 %; the Week 5 interface requirements count as allocated to their interfaces); architecture → interfaces 7/8
  (88 %; PHY-006 is a medium, not an end); roadmap → package 3/3.
- 30 findings: 13 accepted with rationale and evidence (5 **Week 2 dispositions that later weeks made false** — NEED-011 gained REQ-STK-018/019 in Week 3;
  REQ-STK-007, 009, 015, 016 were flowed down in Weeks 4–5), 17 deferred with owners and weeks (the Week 6 baseline review's 15 open items, and NEED-006 and NEED-008, Week 2 partial-coverage open items due in Week 5 that Week 6 dropped; NEED-017 is accepted against U-006/TBR-02).
- Thread from NEED-010: CAP-010 → REQ-STK-010 → REQ-SYS-010 → FN-007 → PHY-003 → IF-006 → MOP-009 → U-002 → INC-000 →
  DEC-001 (every hop is a real link; tested).
- Executive summary consistent with Week 6's baseline trajectory including the committed Year-2 decision (DEC-001, 320
  trips/day by month 24 vs 300 required; next increment INC-001 “Resilient hubs”).
- Driving question: C, ready with conditions.
- RIDs: RID-001 NEED-008 partial coverage (major, accept — the gap the structural audit cannot see); RID-002 PHY-006 network
  ownership, due before this review and not decided (major, defer, re-dated in the open); RID-003 GAP-001 “divest the
  excess” (minor, reject with the computed smallest fleet step); RID-004 open items owned by a week (Week 4 F5, Week 5 F7,
  F8: minor, accept, role owners assigned).

## 4. Laboratory and the package tool

Five parts (28 sources and index; 29 audit with dispositions; 30 executive summary and lessons; 31 review preparation;
32 RIDs after the review) plus the package AI summary. Two readiness states: **ready for review** (entry criteria the tool
can check) and **review closed** (exit). On the Riverside Food Bank fixture (the Weeks 1–6 fixture chain) the audit finds
a real cross-week ID collision (Week 4 reuses Week 1's EXT IDs for other externals), a stale disposition, three childless
needs, an element with no interface and two Week 6 open items. Earlier-week reasons are carried as starting dispositions
(advisory “carried”). Teammate share by the package file, with a confirmation before replacing work (A22).

## 5. Sources

Only already-registered, verified entries are cited: R06c pp.386–388, R13 pp.565–566, R18 pp.473–474, R36 pp.498–499, R40
pp.69–70, R43 pp.109–110, R44 p.111, R45 pp.118–119, R56 pp.387, 389, R105 p.531. Each claim was checked in the
extracted page text (`scripts/source_pages.py`). **No register file was touched** (M4b owns `readings.py` and
`readings.generated.json`). Proposed additions are staged in `docs/lectures/week07/WEEK7_PENDING_READINGS.md`: P7-1
(DoD SFR pp.73–74) and P7-2 (extend R40 to p.73, “the Technical Review Chair determines when the review is complete”);
neither is cited anywhere. Required readings: 10 pages (R06c 386–388, R40 69–70, R45 118–119, R56 387–389).

## 6. Tests and gates run (2026-10-21)

| Gate | Result |
|---|---|
| `npx tsc -b` | clean (no errors) |
| `npx oxlint` on the Week 7 files | exit 0, no warnings |
| Week 7 + shared vitest set: `src/week7`, `src/workbench/week7`, `src/content/lectures` (all weeks, incl. week07 timing 22 + case tests), `src/content/lab/week07Lab.test.ts`, `src/workbench/shortAnswers.test.ts` (Week 7 block added), `src/content/content.test.ts`, `src/lectures`, `src/components/figures` | **31 files, 1,250 / 1,250 pass** |
| Package tool mutation probe (fork) | replacing `said()` by a not-blank check fails 5 record tests (restored) |
| `npm run build` + `npm run build:student` + `scripts/check-student-build.mjs` | **PASS**: Week 7 student decks have empty notes (22 and 13 notes slides); 14 of 16 decks shipped (all but Week 1); every rendered .pptx link resolves; no `P7-`, `outline §`, `new-pending-review`, `DECISION_LOG` or `_source_cache` in the Week 7 student chunk. (The first `build:student` run failed only because `dist/` predated Week 7; rebuilt with `npm run build`, then PASS.) |
| `npm run lectures:pptx -- --week 7 --port 5297` | both decks and the lesson Markdown written; validation passed |
| `node scripts/build-lab-md.mjs 7` | written; the lab test asserts the file equals the module |
| Playwright `e2e/week7-flow.spec.ts` (new, workers = 1) | **6 / 6**: dashboard card, the walk (RID form download included), package tool (refuses a wrong file, loads six exports, teammate package after confirmation, exports `week7-package` v1 with six sources and the Markdown), archive and aliases, axe light and dark at 1440 and 400 px on all 8 Week 7 pages. First run 4/6: one `link-in-text-block` violation (an inline link on the Laboratory page without underline), fixed, rerun 6/6 |
| Playwright `e2e/lectures-week7.spec.ts` (new; added to `playwright.lectures.config.ts`) | **4 / 4**: viewer, axe on every slide with notes in light and dark (no violations), handout with notes, reader, 400 px with no horizontal scroll |

**Lock and screenshots.** The lock `_source_cache/.playwright.lock` was held by other sessions (m4b, then m5review); the
runs waited, took it as “week7” (20:13), and deleted it afterwards. `git status` of `screenshots/` and the md5 of all 206
screenshot files were recorded before and after: both unchanged (the 11 files already modified by others stay as they
were; no `git checkout` was needed). Both specs ignore one console error class, a failed `/api/...` request (the
course-server session probe; no server runs during e2e), as Week 6 does. The final vitest set, `tsc -b` and `oxlint` were
re-run after the last edits: 31 files, 1,250 / 1,250; clean; clean.

## 7. Gate-justification table

Generated from `labBrief.ts` by `week07Lab.ts` (`GATE_TABLE`); the same table is on the Laboratory page and in
`WEEK7_LAB_INSTRUCTIONS.md`, where each hard gate names its slide number, title and the exact phrase a student reads
(`week07Lab.test.ts` asserts each phrase is on the slide face; notes do not count). **27 hard gates and 10 advisories** (after the review fixes).

The rule, as students read it: a one-word answer counts wherever the lecture calls a word complete (“Duplicate”, “TL”,
“R-005”), but an answer that says nothing (“n/a”, “none”, “?”, “-”, “later”, “TBD”) never counts where an answer is
required. A rejection of a RID needs evidence: an ID or a reason in a phrase (a bare “No” is not evidence).

| Where | Check | Kind | What it checks | Student-visible basis |
|---|---|---|---|---|
| Package sources | all-weeks, one-enterprise | gate | six exports; one enterprise | S1 slide 5 “Built from all six weekly exports”; slide 8 “One enterprise, one ID, one meaning” (R36 p.498) |
| Package sources | team-code, old-version | advisory | team code differs; Week 1 v1/v2 | never blocks |
| Audit finding | disposition, reason, owner | gate | record or defer; a reason (one word); an owner when deferred | S1 slide 11 “Every finding gets a disposition: record or defer”, “Every disposition states its reason”, “Defer: name who closes it” (R45 pp.118–119, R56 p.389, R13 p.565) |
| Audit finding | carried | advisory | disposition carried from an earlier week | never blocks |
| Executive summary | recommendation, evidence, conditions, residual, decisions, next | gate | six fields; evidence = an ID in the package; residual = an R ID in the package; next = an INC after the baseline | S1 slide 7 (six phrases) (R18 p.473, R43 pp.109–110, R06c pp.386–387) |
| Review preparation | owners, decision, thread | gate | every section owned; a key decision; a thread reaching a REQ-SYS and an architecture element | S1 slide 17, slide 16, slide 12 (R06c p.387, R13 p.565) |
| Review preparation | thread-interface, thread-roadmap | advisory | the thread stops before an interface / the roadmap | never blocks |
| RID | location, finding, severity, disposition, response, owner | gate | an ID or section title; what and against which criterion; major/minor; accept/defer/reject; response (rejection with evidence); owner when accepted/deferred | S2 slide 7 (three phrases), slide 8 (three phrases) (R06c pp.386, 388) |
| RID | reject-no-id | advisory | a rejection citing no ID | never blocks |
| Part rules | all-dispositioned, lessons, ai, all-rids | gate | none silent; one lesson; AI summary ≥ 12 words; every RID after the review | S1 slides 16 and 5 (R06c p.387, R40 p.70, R06c p.388) |
| Part rules | no-rids, coverage-low | advisory | no RIDs yet; a layer below 80 % | never blocks |

## 8. Recurring defect classes checked

- **Valid short input rejected / empty answers accepted:** the Week 7 block of `shortAnswers.test.ts` sweeps 13 fields both
  ways (“Duplicate”, “TL”, “Ops lead”, “R-002”, “Evolution roadmap”, “executive summary” accepted; “n/a”, “none”, “?”,
  “-”, “later”, “TBD”, unknown IDs rejected).
- **Untestable “complete” claims:** no “fixed” disposition exists (tested in `week07Lab.test.ts`); readiness states are
  computed by the tool's own checks; the case test checks every finding would pass the tool's gates.
- **Quiz cues:** not applicable (no quiz); the no-quiz decision is tested and stated to students.
- **Numbers computed from data:** case, slides, notes, lesson and figures read `aerolinkCase.ts`; `aerolinkCase.test.ts`
  recomputes coverage, findings, the thread hop by hop and the RIDs, each with a negative direction.
- **Figures match captions:** every figure drawn from its slide's caption and alt; PNGs opened for the thread, coverage,
  RID table, package tabs, review flow and argument figures; two alt texts corrected (coverage tally; argument figure in
  two rows).
- **Internal codes / stale weeks:** `timing.test.ts` (INTERNAL, STALE incl. “Week N package/model” rules) and
  `week07Lab.test.ts`; the student chunk scanned (§6).
- **Level descriptors:** every criterion (6 team, 2 individual, 4 graduate) has four distinct descriptors (tested).
- **Answers before attempts:** the driving question's answer appears only on the readiness slide (tested); the Examples
  try-it solution is behind `<details>`.
- **Workload:** 7.3 h, unrounded within 8.0 (tested); graduate 8.0 h; team of three 7.7 h; graduate on a team of three 8.4 h (reported on the week page, faculty item).

## 9. Workload (per student, team of four, computed)

| Activity | h |
|---|---|
| Class (2 × 75 min, studio and review included) | 2.5 |
| Readings, 10 pages at 15 pages/h | 0.7 |
| Lesson and worked examples, 5,167 words at 150 wpm | 0.6 |
| Lab L7 out of class, 7.4 person-hours ÷ 4 | 1.9 |
| Peer review (read assigned sections, ≥ 2 RIDs) | 1.0 |
| Prepare to answer for own elements | 0.3 |
| Peer evaluation | 0.2 |
| Time log | 0.1 |
| **Total** | **7.3** (graduate + 0.7 memo = 8.0; team of three 7.7; graduate on a team of three 8.4, over budget: faculty item) |

## 10. Open deficiencies

1. **No independent review yet.** Every earlier week needed one (Weeks 2, 4, 5 and 6 returned REVISE).
2. **Week 8 does not read `week7-package` yet.** The format is documented; Week 8 still imports the Week 1/2 exports. The
   Week 7 and Week 8 pages describe Week 8 as importing the package, which is the course design, not yet the tool.
3. **Three-person teams** carry 2.3 h of lab each against 1.9 h for four (the briefing and front matter do not shrink);
   the week total stays at 7.6 h, within 8.0, but not “proportional” in the Week 6 sense (faculty item).
4. **Lesson reading rate** 150 wpm is optimistic for the tables; logged hours requested.
5. **The package tool's thread** lists every ID reached per layer rather than one path (the AeroLink case computes one
   path); renamed findings are grouped per prefix, so one disposition covers the group.
6. **Review timing** fits at most five teams at the 8-min floor; six or more is a faculty decision (stated on the slide).
7. **Environment:** e2e specs filter the course-server `/api` probe error, as Week 6 does.

## 11. Faculty items

- F1 Presentation timing: Session 2 = 25 min lecture + 40 min of team slots (5 × 8 or 4 × 10); RIDs written before the
  meeting (departs from the outline's Plan A).
- F2 Rubric: the design-review presentation rubric (6 team, 2 individual criteria) and the graduate criteria are proposed;
  RB-11.3 adapted to a thread walk through the package; no register row scores a whole package (T1 proposed).
- F3 **Exam placement: the old Exam 1 (`src/instructor/exams/exam1.ts`, “week: 7”) still assumes Week 7, which is now the
  review week.** Not changed here (grading policy untouched); the Assessment page names it as an open faculty decision.
- F4 No readiness quiz in Week 7 (A21 default) — confirm.
- F5 Proposed objectives W7.4 (technical reviews, SRR analogy) and W7.5 (dispositions with evidence).
- F6 Register: P7-1 (SFR pp.73–74), P7-2 (R40 to p.73) — staged, not cited.
- F7 AeroLink proposed content: the PHY-006 disposition, the executive summary's decisions needed, the four RIDs; the
  Week 2 dispositions that later weeks made false are kept as teaching findings (outline item 7: fix in the reference data
  or keep — kept, recommended).
- F8 Three-person workload (deficiency 3).

## 12. December 1 risk

Low for Week 7 content, moderate for sign-off. The package is complete, routed and green on its own gates; the remaining
risk is the independent review and one revision cycle (about a day per week so far), and the faculty decisions F1–F3,
which change the Session 2 timing and the assessment table rather than the content. A change to Weeks 1–6 data flows
through the computed case; the decks must then be re-exported (`npm run lectures:pptx -- --week 7`) and the lab
instructions regenerated (`node scripts/build-lab-md.mjs 7`).

## 13. Independent review dispositions (`_source_cache/review/week07_review.md`, REVISE; fixed 2026-10-21)

| Finding | Disposition |
|---|---|
| **M1** dropped open items | **Fixed.** New finding kind `dropped-open-item` (labBrief). The case computes `PARTIAL_OPEN` from Week 2's `PARTIAL_COVERAGE`: NEED-006 and NEED-008 (due Week 5, never done, dropped by Week 6) are deferred findings with an owner and Week 9; NEED-017 is accepted against U-006/TBR-02. `EARLIER_OPEN_ITEMS` lists every open item any earlier week recorded (partial coverage, Week 2 open-item dispositions, the deliberate gap, the Week 6 review) with its computed closure or its finding; `aerolinkCase.test.ts` fails if any is silent (negative direction included) and checks every case finding passes the tool's own gates. Executive summary, readiness answer, RID-001 (now: the reviewer refuses a second deferral of a slipped item), slides, notes, lesson, figures and the Examples try-it are truthful about what the coverage layer and the audit each see. The tool now turns an earlier-week disposition that deferred a still-open gap into a `dropped-open-item` pre-filled as a deferral (never as accepted). |
| **M2** bare completion claims | **Fixed.** Disposition set: corrected-and-re-imported (never typed), accept with rationale **and evidence** (an ID in the package or the week whose record holds it; gate `evidence`), defer to Week 8–14 with an owner (gates `owner`, `week`; status “open”). A rationale matching `COMPLETION_CLAIM` (fixed, resolved, withdrawn, corrected, done, closed, addressed …) fails the reason gate. Student promise aligned on the slide face (gate phrases), lesson, lab instructions and tool. Fixture: no “Withdrawn”; stale dispositions accepted with their superseding evidence. Tests both ways in `record.test.ts` and the `shortAnswers.test.ts` Week 7 block (“Duplicate of REQ-STK-004” accepted; “Duplicate”, “Fixed”, “Withdrawn”, “n/a” rejected). The review's probe (`Withdrawn` → review-closed) now fails. |
| **M3** collision reported as rename | **Fixed at source and in Week 7.** Identity rule (`labBrief.IDENTITY_RULE`, `sameElement`), shown on the slide and in the tool: same element only if names match ignoring case/punctuation or one contains the other whole. New kind `collision`, keyed per ID, which can only be deferred; `renamed` now means wording drift of the same element, compared with the week that owns the prefix in that snapshot (not the first definer). The index keeps every definition (`others`; JSON rows marked `collision: true`). **Upstream bug fixes (signed-off weeks, minimal):** `src/workbench/week4/record.ts` + `Week4LabTool.tsx`: optional Week 1 file (`importWeek1Externals`, `withWeek1Externals`, field `week1Externals`, exported additively) so new EXT IDs continue after the highest Week 1 ID; a Week 1 system can be added under its own ID. `src/workbench/week6/record.ts`: `Week3Extra.opportunities`, O IDs floored on Week 3's (`floorIds`, `withWeek3`, `knownIds`); `src/workbench/week6/fixture.ts`: the opportunity is O-002. Old files with colliding IDs import unchanged and are flagged in Week 7 (the Riverside Week 4/5 fixtures still collide on EXT-001..005; the Week 7 fixture defers them with an owner and Week 8). Tests added to `week4/record.test.ts` (4) and `week6/record.test.ts` (3). |
| m1 requirements outside Weeks 2/5 | Fixed by instruction: the lesson and lab method say a requirement written in another week belongs in the Week 2 record, exported again. |
| m2 carried deferrals / week owners | Fixed: earlier-week deferrals pre-fill as `defer`; advisories `past-week` and `week-owner`. |
| m3 partial packages | Fixed: findings depending on a missing week are withheld; the tool shows a “Provisional” note. |
| m4 R40 tailoring | Fixed in the entry/exit notes (tailoring, chair checks items due before the review). |
| m5 Week 8 claim | Fixed: “Week 8 starts from the closed package (its import of the package file is still being built)” on the slide, lab and Assessment page. |
| m6 graduate on a team of three | **Faculty item** (8.4 h > 8.0); stated on the week page and lab note; tested; policy unchanged. |
| m7 RID criterion | Fixed: `Rid.criterion` with a gate; the RID form explains the RID-001 numbering. |
| m8 RID counter across a share | Fixed: `issued` exported and imported; tested. |
| m9 open-item granularity | Fixed: one finding per item ID of a Week 6 review row. |
| n1, n2 | n2 fixed (the outline's revision banner is listed here); n1 left as stated rule. |

Re-verified after the fixes: `tsc -b` clean; vitest (Week 7, Week 4/6 workbench, shortAnswers, content, lectures, figures) 35 files, 1,335 / 1,335; oxlint clean; `node scripts/build-lab-md.mjs 7` and `npm run lectures:pptx -- --week 7` regenerated; `npm run build` + `build:student` + leak check PASS; Playwright `week7-flow` 6/6 and `lectures-week7` 4/4 under the lock “w7fix” (taken and deleted; screenshot status and bytes unchanged). `src/App.tsx` restored to LF (only the week07 hunks differ from HEAD besides another stream's one line). Also listed: `docs/lectures/week07/WEEK07_LECTURE_OUTLINE.md` (revision banner), `WEEK7_PACKAGE_FORMAT.md` (revision section).

### 13.1 Confirmation dispositions (`_source_cache/review/week07_confirmation.md`, REVISE short; fixed 2026-10-21)

| Finding | Disposition |
|---|---|
| N1 Week 5 EXT numbering | **Fixed (minimal, signed-off week).** `src/workbench/week5/record.ts`: the Week 4 snapshot carries `week1Externals` (from the Week 4 export, default `[]`), and `floorIds('EXT')` takes the max across Week 4's externals and that Week 1 range. Tests in `week5/record.test.ts` (both directions). Older Week 4 files import unchanged; their collisions are flagged in Week 7. |
| N2 deferrals refused | **Fixed.** `labBrief.isCompletionClaim`: a completion word counts as a bare claim only when no Phase II week (8–14) is named; “To be closed in Week 10” and “Will be addressed in Week 9” pass, “Fixed”, “Withdrawn”, “Resolved in Week 4” fail. Lists in `week7/record.test.ts` and the `shortAnswers.test.ts` Week 7 block; gate text updated. |
| N3 line endings | **Fixed.** Every file this stream changed now has its HEAD line-ending style (week4 `record.ts`/`record.test.ts` and week6 `record.test.ts` CRLF; the rest LF); `git diff --stat` equals `git diff --ignore-cr-at-eol --stat` for them. (`src/workbench/week1/team.test.ts` differs, but it belongs to another stream and is not touched here.) |
| N4 executive summary | **Fixed.** `AUDIT.droppedDeferred` (NEED-008, NEED-006) and `AUDIT.droppedViaUnknown` (NEED-017 through U-006); `dropText()` feeds the summary, the readiness answer, the findings slide and the lesson; tested. |
| m1/m5 leftovers | Lab output file, source gate basis and RID prefix text no longer claim that Week 8 imports or reads the package file. |

Re-verified: vitest (Week 7, Weeks 4/5/6/8 workbench, shortAnswers, content, lectures, figures) 40 files, 1,489 / 1,489. `tsc -b`: no error in this stream's files; the remaining errors are in `src/project/*` and `src/publishing/*` from other streams, so the builds were run with `vite build` (instructor and student) and then `scripts/check-student-build.mjs`: PASS. Lab Markdown and decks regenerated (`build-lab-md.mjs 7`, `lectures:pptx -- --week 7`). Playwright under the lock “w7fix2”: `lectures-week7` 4/4; `week7-flow` 6/6. In the first run the walk test failed once on a cold dev server (60 s timeout) and one axe run failed once; on rerun both passed, and then the full spec passed 6/6. Screenshot status and bytes unchanged; lock removed.
