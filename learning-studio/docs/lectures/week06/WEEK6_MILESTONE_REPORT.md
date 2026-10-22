# Week 6 milestone report: Evolution Roadmap (Phase I)

> Status on 2026-10-21: the Week 6 teaching package is complete in the working tree and **not committed**. A previous
> build stopped on 2026-10-19; its unverified files were kept, preserved on branch `wip/2026-10-19-interrupted-snapshot`,
> then checked, corrected and finished here. DECISION_LOG A24: content runs in parallel with the Week 1 platform work, on
> the current approved lecture template (A21): lecture sessions, then the detailed lesson, worked examples, the lab, and a
> separate assessment. The structure matches Weeks 2–5 and 8, and no navigation was redesigned. Every part is pending
> faculty review. AeroLink is FICTIONAL and is the instructor's worked example only: each team roadmaps its own enterprise.
> Paths are relative to `learning-studio/` unless they start with `_source_cache/`.

## 1. What the week contains

| Component | Where | State |
|---|---|---|
| Session 1, "From capability gaps to a technology plan" | `src/content/lectures/week06/session1.ts` | 23 slides; 69 min of content and a 6 min buffer; 6 lesson sections |
| Session 2, "Transition, the AeroLink roadmap and the lab launch" | `src/content/lectures/week06/session2.ts` | 19 slides; 47 min of lecture and a 22 min lab launch, 69 min in all; 7 lesson sections |
| Detailed lesson | the `studentLesson` of both sessions, at `#/week/6/lesson` | 6,593 words (0.7 h at 150 words a minute) |
| Figures | `src/components/figures/LectureWeek6S1.tsx`, `LectureWeek6S2.tsx`, `LectureWeek6Parts.tsx`, `week6FigureKit.ts`, `lectureWeek6Figures.ts` (registered in `registry.ts`, delimited block) | 31 figures, rendered to PNG for the decks |
| AeroLink case | `src/content/lectures/week06/aerolinkCase.ts` | Imports Weeks 1–5 read-only. Every capacity, limit, count and transition step is computed from the Week 3 trade rules |
| Week app | `src/week6/` (`route.ts`, `WeekNav.tsx`, `WeekShell.tsx`, `Week6App.tsx`, `Home.tsx`, `Examples.tsx`, `exampleParts.ts`, `Lab.tsx`, `Readiness.tsx`, `Assessment.tsx`, `assessmentParts.ts`) | Routed: `#/week/6`, `/examples`, `/lab`, `/lab/tool`, `/assessment`; aliases `/overview`, `/classic`, `/practice` and `/check` redirect; the earlier page is archived at `#/archive/week/6` |
| Lab instructions | `src/content/lab/week06Lab.ts` → `docs/lectures/week06/WEEK6_LAB_INSTRUCTIONS.md` (`node scripts/build-lab-md.mjs 6`) | Purpose, inputs, eight method steps, nine procedure steps, outputs, parts 23–27, ID prefixes, the gate table, rubric rows, level descriptors, submission and workload |
| Lab tool | `src/workbench/week6/record.ts`, `Week6LabTool.tsx`, `week6tool.css`, `fixture.ts` | Imports `week5-model-inputs` v1 (and, optionally, `week3-model-inputs` v1) and exports `week6-model-inputs` v1 plus Markdown. A teammate's file replaces the record only after a confirmation |
| Quiz Q6 | `src/content/quizWeek6.ts` | 12 items, W6.1–W6.6, keys `abdcdabcadbc` (three of each, no run of three) |
| Applied exercise | `src/week6/assessmentParts.ts`; brief and marking notes in `docs/lectures/week06/WEEK6_APPLIED_EXERCISE_BRIEF.md` | A city bike-share: 5 min reading and four tasks, 5 + 7 + 13 + 5 + 6 = 36 min (revised after review Mo4), four criteria × four levels (16 points). The graduate memo uses the same scale |
| Path text and workload | `src/content/week6Path.ts` | 8.0 h per student for a team of four, which is the budget. Graduate students: 8.1 h. A team of three: 2.5 h of lab each, 0.1 h above a team of four |
| Decks | `exports/lectures/week06-session{1,2}.pptx`, `-notes.md`, `week06-lesson.md`; `public/lectures/` copies | `npm run lectures:pptx -- --week 6`: 23 and 19 slides; the instructor decks carry 50,142 and 40,005 characters of notes; the student decks have empty notes |
| Dashboard | `src/pages/Dashboard.tsx` (delimited `week06` blocks) | Week 6 path card marked "Available (pending review)", the same as Weeks 2–5 and 8. The prototype-status bullet names Week 6. The Roadmap page is unchanged: it shows the same status for Weeks 2–14 |

**Input and output chain.** Week 6 starts from the team's Week 5 export (`week5-model-inputs`, read with Week 5's own
importer). The optional Week 3 export supplies the technology table, because the Week 5 file does not carry it. The
output is `team-NN-week6-model-inputs.json` (`week6-model-inputs` v1), which feeds the Week 7 package. Each entry names
its canonical artifact type (INC, TECH, U, R, O, A; GAP is a proposed nested row) and the typed relationships it implies
(INC precedes INC, INC delivers TECH/CAP/REQ, U and R affect INC), so My Project and Week 7 can read it without retyping.

**Security and resilience (A21 decision 6)** are integrated, not added on:
- every later increment carries a hard-gated security and resilience change;
- Part 26 requires at least one security or resilience risk and at least one transition risk, each linked to an
  increment;
- the lesson section "Security and resilience as the enterprise evolves" and Session 2 slide 6 teach it;
- the applied exercise asks for it in task 2;
- the AeroLink case states it per increment, and the test checks that.

## 2. What this pass changed (beyond wiring)

| # | Defect class (origin) | Finding in the 2026-10-19 build | Fix | Evidence |
|---|---|---|---|---|
| 1 | Over-relaxation (W5 confirmation N1) | Every free-text gate was "≥ 1 word", so "n/a", "?", "later" and "TBD" counted as a trigger, owner, mitigation, off-ramp, transition or TRL basis | Gates use the shared `src/workbench/emptyAnswer.ts` (`said`). Exceptions are stated in their gate text: "None" is a complete security and resilience change, and "TBD" or "none" is a valid capability level. Names only need to be written. The rule is visible to students (`EMPTY_ANSWER_RULE`, on the Laboratory page, the lab instructions and the tool) and in four gate texts | `record.test.ts` (new test, both directions); Week 6 block of `shortAnswers.test.ts` (228 cases). A mutation probe that drops the empty-answer check fails 108 tests |
| 2 | Untestable "complete" claim | The case header named `aerolinkCase.test.ts`, which did not exist | Written: 23 tests (traces, impact judgments, recomputed numbers, the case's own record rules, the reference passing the tool's hard gates), each with a negative direction | It found a stale judgment: `R-004` was judged but is not a candidate the links reach. Removed |
| 3 | Data vs decision (W4 M1) | Slide bullet "The board's answer: D by preference; capacity first by evidence" reads as two answers | Now "D at the vote, before the evidence; capacity first by evidence", with the notes to match. The key stays D, as the outline sets it | `timing.test.ts` (the phrase is in Session 2 only) |
| 4 | Number typed in text | The lesson says "Only high-power charging passes all three now" | Tested: `TECH_PLAN.filter(insertionReady)` is `['TECH-001']` | `aerolinkCase.test.ts` |
| 5 | Missing assessment brief (W4 Mo5, W5 Mo3) | No brief and no exercise tasks | Brief with marking notes for each criterion; four tasks that fit 35 min; one scale for the exercise and the graduate memo | `assessmentParts.test.ts` (also checks that no quiz item uses the bike-share setting) |
| 6 | Rubric reference to a row not shown | Part 24 "judged by … RB-5.2"; RB-5.2 is not among the rows the lab applies | Removed | Lab instructions regenerated |

## 3. Sources

R105–R109 went through the register pipeline only:
1. They are in `_source_cache/verification/readings.py` (appended 2026-10-19).
2. `python verify_readings.py` finds each title as a heading line on its first page: `readings_verified.txt` reads
   144/145, and the one unverified entry is R30, the declared exception.
3. `npm run content:readings` exported them as `verified: true`.

No evidence table was edited by hand. The claims Week 6 cites were also checked in the page text:
- R105: pp.528, 529 (available now, in development, do not yet exist), 530 (insertion points; immature with
  mitigation; horizon 5–10 years);
- R106: pp.582, 583 ("cannot be defined at the beginning"), 584 ("No technology before its time");
- R107: pp.447 (simultaneous operation, cutover, retirement), 448 (transition as a process), 449 (when, how and why to
  insert);
- R108: p.391;
- R109: pp.131–132 (snapshots of current and target; as is to be);
- R12 p.862, R46 p.126, R13 p.565, R25 p.1231, R26 p.683 and R60 p.525.

`content.test.ts` now expects 145 readings, with a comment explaining why.

**Still pending faculty confirmation:**
- approval of R105–R109 as register additions (outline §9, P6-1..P6-5; the comment in `readings.py` says so);
- the proposed R26 start-page correction to p.680. It is not made, because Week 6 cites R26 only within pp.681–684.

## 4. Tests and gates run (2026-10-21)

| Gate | Result |
|---|---|
| Week 6 and shared vitest set: `src/week6`, `src/workbench/week6`, `shortAnswers.test.ts`, `content.test.ts`, `lectures.test.ts`, `src/content/lectures/week06`, `src/lectures/route.test.ts`, `week6FigureKit.test.ts`, `week06Lab.test.ts`, `quizWeek6.test.ts` | **13 files, 771 / 771 pass**. Week 6 files: case 23, timing 20, record 25, tool DOM 5, lab 12, quiz 25, figures 34, example parts 5, assessment parts 5; Week 6 sweep block 228 |
| Full `npx vitest run` | 2624 / 2633. The 9 failures are outside Week 6: 6 in `src/week1/week1.test.tsx` (the concurrent Week 1 platform rework) and the known 30 s timeouts in `activities/week07` and `week11` |
| `npx tsc -b` | Clean for every Week 6 file. When last run, the only errors were in `src/week1/*` and the Week 1 line of `App.tsx` (`w1.page === 'lab-tool'`), from the concurrent Week 1 rework; it was exit 0 before that work landed |
| `npx oxlint src/week6 src/workbench/week6 …` | exit 0, no warnings |
| `npm run build:student` + `scripts/check-student-build.mjs` | **PASS**: the Week 6 student decks have empty notes; no `P6-`, `outline §` or internal source codes in the Week 6 chunks |
| `npm run lectures:pptx -- --week 6 --port 5296` | Both decks and the lesson Markdown were written; validation passed |
| Playwright `e2e/week6-flow.spec.ts` (new, workers = 1) | **6 / 6**: dashboard card, the walk, lab-tool import and export with the confirmation, the archive and aliases, and axe in light and dark at 1440 and 400 px on all 8 Week 6 pages |
| Playwright `e2e/lectures-week6.spec.ts` (new; added to `playwright.lectures.config.ts`) | **4 / 4**: viewer, axe on every slide with notes in light and dark (no violations), 400 px with no horizontal scroll |

**Lock and screenshots.**
- The lock `_source_cache/.playwright.lock` was taken as "week6" and deleted after the runs.
- The 11 screenshot files that were already modified are unchanged, so no `git checkout` was needed.
- Both specs ignore one console error class: a failed `/api/...` request. That is the course-server session probe
  from the concurrent auth work, and no server runs during e2e.

## 5. Gate-justification table

Generated from `labBrief.ts`, the single source the tool checks against, by `week06Lab.ts` (`GATE_TABLE`). The same
table is on the Laboratory page and in `WEEK6_LAB_INSTRUCTIONS.md`. For every hard gate, the last column names the slide
by number and title and quotes the sentence a student reads there. `week06Lab.test.ts` asserts that each phrase is on the
student-visible face of that slide; speaker notes do not count. **43 hard gates and 10 advisories.**

The rule, as students read it: a one-word answer counts wherever the lecture calls a word complete, but an answer that
says nothing ("n/a", "none", "?", "-", "later", "TBD") never counts where an answer is required. The two exceptions are
stated in their gates: "None" is a complete security and resilience change, and "TBD" or "none" is a valid capability
level.

| Where | Check | Kind | What it checks (threshold as stated to students) | Student-visible basis |
|---|---|---|---|---|
| Gap or excess | statement, levels, kind, horizon, source | gate | what is short (one word); both levels (a number, a word or "TBD"); gap or excess; horizon; an ID in the record | Session 1 "Operational needs, capability gaps and excesses over horizons" (R12 p.862) |
| Technology | name, status, trl, basis, insertion, risk | gate | one word; available, in development or not yet existing; TRL 1–9 unless not existing; an ID or evidence ("TBD" is not a basis); an increment or a one-word reason; a risk or mitigation if immature | Session 1 "The contents of a technology plan", "What maturity evidence can and cannot tell you" (R105 pp.529–530, R16) |
| Technology | near-immature, trl-changed, not-in-week3 | advisory | timing judgment; changed since Week 3; a new TECH ID | never blocks |
| Baseline | content | gate | the as-is (one word) | Session 2 "Worked example I: Increment 0, the baseline" (R109 pp.131–132) |
| Increment | name, horizon, content, serves, trigger, approach, transition, off-ramp, security, dependencies | gate | one word each where text ("later" is not a trigger); an ID of a gap, need or objective; an off-ramp only when it inserts immature technology; "None" accepted for security; dependencies resolve | Session 2 "Anatomy of a roadmap", "Security and resilience…"; Session 1 "Development approaches: sequential, incremental, evolutionary", "Deferral and off-ramps as risk control" (R12, R105, R108, R46 p.126, R25 p.1231) |
| Increment | trigger-vague, security-none, off-ramp-mature, no-risk | advisory | measurable trigger; reason for "None"; off-ramp good practice; a linked risk | never blocks |
| Known unknown | name, impact, need, mitigation, owner, gates | gate | one word each ("none" is not a mitigation; "TBD" or "?" is not an owner); an increment it gates | Session 1 "Known unknowns: a managed input to the roadmap" (R13 p.565) |
| AROU item | statement, category, owner, increment | gate | one word; category for a risk; owner; an increment | Session 2 "Security and resilience as the enterprise evolves" |
| Impact list | increment, ids | gate | an increment after the baseline; at least one affected ID that resolves | Session 2 "Worked example V: an increment’s impact across the package" (R13 p.565) |
| Review row | status, items | gate | ready or open; open items and who closes them | Session 2 "Preparing the Phase I baseline for Week 7, and what comes after" |
| Part rules | horizons, baseline, beyond-near, insertion, security-link, transition-risk, unique-ids | gate | lengths stated; one baseline; an increment beyond the near term; a technology inserted; a security or resilience risk linked; a transition risk; IDs once | Session 1 gaps slide; Session 2 anatomy, baseline, security and baseline-review slides (R12, R109, R105, R25, R26 p.683) |
| Part rules | horizon-empty, no-excess, no-week3 | advisory | an empty horizon; no excess; Week 3 file not loaded | never blocks |

The full per-gate table, with each gate's basis sentence and the exact slide number, title and phrase, is section "Why
each check blocks, or only advises" of `WEEK6_LAB_INSTRUCTIONS.md` (generated, not retyped). **Changed against the
2026-10-19 build:** every free-text gate above went from "≥ 1 word" to "written and not an empty answer", except names
(still "written") and the two stated exceptions. No threshold rises above one word, and the export format is unchanged
(`week6-model-inputs` v1).

## 6. Recurring defect classes checked

- **Short valid input rejected:** "Cutover", "Approved", "None", "A-003", "TL", "2 min", "Refrigeration" and
  "Board decision" are all accepted (sweep).
- **Over-relaxation:** fixed (§2 #1).
- **Quiz cues:** `quizWeek6.test.ts` checks length rank, outlier, farthest option, second-order middle length, stem echo,
  count echo, grammar and absolutes, each with a negative direction.
- **Numbers computed from data:** case, lesson and figures (§2 #2 and #4).
- **Figures match captions:**
  - the full-roadmap, impact-tree, Increment 1 and technology-exercise PNGs were opened;
  - the step chart's 240 → 320 and its 288 aircraft-first line match the computed values;
  - the exercise table is blank, as its alt text says.
- **Answers before attempts:** `timing.test.ts`. On the Examples page the try-it solution is behind `<details>`.
- **Internal codes and stale weeks:** `timing.test.ts` (INTERNAL, STALE) and `week06Lab.test.ts`.
- **Level descriptors:** present for every lab criterion, the exercise and the graduate memo.
- **Workload:** 8.0 h, at the cap and not over it.

## 7. Open deficiencies (for faculty and the next pass)

1. **No independent review yet.** Every earlier week needed one: Weeks 2, 4 and 5 each returned REVISE.
2. **Proposed content awaiting faculty decision:**
   - the AeroLink horizons, Increments 2 and 3, TECH-004 and TECH-005, U-008 and U-009, R-012 and R-013, and A-009;
   - objectives W6.4–W6.6;
   - rubric rows RB-15.5 and RB-15.6;
   - the RB-15 re-mapping to Week 6;
   - three-person minimums;
   - R105–R109 approval;
   - the R26 p.680 correction.
3. **Driving-question key.** Superseded by the review dispositions below: the key is D, now "none of the three first"
   (resilience first), a substantive evidence answer under the baseline-trajectory model.
4. **Lesson reading rate.** The workload sits exactly at the 8.0 h cap, and the lesson estimate uses 150 words a minute,
   which is optimistic for a lesson with many tables. A slower measured rate would push the week over budget; ask for
   logged hours.
5. **`course.ts` Week 6 readings still show R26 only.** The content test restricts provisional weeks to their draft
   sources' readings. The week page uses the full list from `week6Path.ts`. The graduate task in `course.ts` is filled.
6. **Environment.** `tsc -b` and the full vitest run currently fail only in Week 1 files under concurrent rework. The
   e2e specs filter the course-server `/api` probe error. Re-run both once the Week 1 and auth work land.
7. **WIP branch.** `wip/2026-10-19-interrupted-snapshot` can be deleted once this package is committed.

## 8. December 1 risk

Low for Week 6 content and moderate for sign-off. The package is complete, routed and green on its own gates. The
remaining risk is review turnaround: an independent review plus one revision cycle took about a day for Week 5. The
proposed AeroLink content (Increments 2 and 3) should be confirmed before the Week 14 package, which models one increment
as a change. A faculty change to the horizons or increments flows through the computed case, but the figures and decks
must then be re-exported (`npm run lectures:pptx -- --week 6`) and the lab instructions regenerated
(`node scripts/build-lab-md.mjs 6`).

## 9. Review dispositions (independent review 2026-10-21, verdict REVISE)

Review: `_source_cache/review/week06_review.md` (1 Major, 6 Moderate, 11 Minor). Fixed the same day.

| Finding | Disposition |
|---|---|
| **M1** baseline vs gap table | **Fixed** (integrator decision, faculty may revisit: SEBoK trajectory, option b). Increment 0 is the baseline *trajectory*: entry snapshot (240) plus the committed DEC-001 step (320 trips/day by month 24). `aerolinkCase.ts` adds `YEAR2`, `YEAR2_TRANSITION`, `FLEET_STEP`; every gap is recomputed against the trajectory. GAP-001 becomes an **excess** of 20 trips/day above the desired 300 (kept with a reason: +4 was the smallest Week 3 fleet step; headroom to 256 trips/day of demand); the snapshot reading (a 60 gap) is taught as the error. Increment 1 is now the first change after the Year-2 decision: "Resilient hubs" (storage at four hubs, one first; overnight leasing; transition risk R-012 recomputed: one hub out = 288 < 300). Increment 2 "Data-ready, integrated network" (AI-001, workload evidence, ticketing, capacity step above 256), Increment 3 autonomy. TECH-001 is inserted by the committed step (INC-000); U-002 gates INC-000. Driving question: "After the Year-2 decision …"; options A autonomy, B more capacity, C ticketing, D none of the three first; key D with the evidence order resilience → data/ticketing/capacity on triggers → autonomy. Slides, notes, lesson, figures (gap chart, baseline grid, increments, full roadmap, S&R, unknowns record, horizon board), captions, worked examples, quiz-free case text and the outline were updated. New tests pin the model (`aerolinkCase.test.ts`: GAP-001 baseline = trajectory stated in the notes; excess above / gap below desired; no later increment re-plans DEC-001; snapshot negative case). |
| Mo1 excess | **Fixed.** Excess = baseline above the desired level everywhere (lesson, slide bullet, gate `kind` text, lab method). GAP-002 is only the overnight idle chargers (8 × 8 h); charger slack (384 vs 320) is taught as *not* an excess. Exercise notes accept only an excess against the desired level (200 near term; none by year 4). |
| Mo2 dependency gate | **Fixed.** `record.ts`: DFS cycle check and later-horizon rejection, student-visible basis on the anatomy slide ("Dependencies point back in time: a cycle has no first step"), gate-table row updated, failing dependencies no longer exported as `precedes`. Tests both ways, incl. lower-case IDs, same-horizon and baseline dependencies. |
| Mo3 W6.4/W6.6 assessment | **Fixed in the exercise.** Task 2 asks for the development approach with a reason (W6.4) and one transition-only risk (W6.6); descriptor and marking notes updated; tested. |
| Mo4 exercise timing | **Fixed.** 5 min reading + 7/13/5/6 = 36 min = 0.6 h; Task 2 is one full increment plus a second with content, trigger, off-ramp; Task 3 one full unknown plus one named. Workload stays 8.0 h. |
| Mo5 quiz cues | **Fixed.** w6q-11 rewritten (two distractors inside the weekend, not transition risks; retagged W6.3); soft absolutes removed from all options; hedges removed from keys q7/q10 and added to distractors; w6q-5 distractor in the key's form; w6q-3 key shortened, b strengthened; w6q-4 distractors made stem-consistent. New tests: soft-absolute ban, hedge balance, form cue, w6q-11 locus, with negative cases. Key positions and length ranks unchanged. |
| Mo6 SEBoK grouping page | **Fixed by citing only what p.391 supports** (variety of approaches incl. sequential/incremental/evolutionary, overlapping groups, classification criteria); the agile clause (p.390) is removed. No register change. Extending R108 to p.390 remains a faculty option (F5). |
| n1 names | Fixed: technology and increment names must say something; tests. |
| n2 levels | Fixed: at least one level must be stated (not both TBD/none); EMPTY_ANSWER_RULE and gate text updated; fixture baseline changed from "TBD". |
| n3 baseline gating | Fixed as advisories (`gates-baseline`, `belongs-baseline`), consistent with a baseline that holds a committed change; shown in the tool and gate table. |
| n4 horizons | Fixed: years 3–5 and 6–10. |
| n5 readings | Partly fixed: R107 pp.447–449 assigned (17 pages, still 1.1 h); R106 p.585 added as extension reading. Making p.585 required (18 pages → 1.2 h, total 8.1 h) is a faculty item. |
| n6 off-ramp rule | Fixed: labelled a course convention on the slide face, notes, lesson and gate basis (confirmation still F6). |
| n7 R105 citation | Fixed: p.529 (living document) and p.531 (annual review) cited separately. |
| n8 raw slide ids | Fixed cross-week: `src/components/quizText.ts` renders "slide N “title”" in quiz explanations (Weeks 5 and 6); tested. |
| n9 objective tags | Partly fixed: w6q-11 retagged W6.3 (W6.3 now 2 items). w6q-1/w6q-2 test gap analysis, which no Week 6 objective names: faculty item. |
| n10 descriptors | Fixed: LC-N2 per bike; Insertion descriptor "depot, vans and winter"; tariff-to-wrong-increment rule in level 2. |
| n11 depth | Deferred (optional; lesson word budget is at 6,658 of the 6,749 that keep 0.7 h). |

**Also fixed (integrator note):** `tsc -b` error in `aerolinkCase.test.ts` (block narrowing); a student-build leak check
failure where a faculty-notes sentence ("SEBoK’s baseline is current and planned …", Session 1 misconception) also
appeared in the Session 2 lesson: the lesson sentence is reworded. `npm run build:student` and the leak check pass.

**Verification after the fixes:** vitest on the Week 6 suites, `shortAnswers.test.ts`, `content.test.ts`, the figure-kit
and `quizText` tests plus the figures registry tests: 13 files, 759 tests pass. `tsc -b`: clean. `node scripts/build-lab-md.mjs 6` and
`npm run lectures:pptx -- --week 6` regenerated. Playwright: `lectures-week6` 4/4 pass; `week6-flow` 4/6 — the two
failures (dashboard `week6-path-card`, `archive-banner`) come from the concurrent home-page/routing rework in shared
files (the root route now renders the new home page), not from Week 6 content. Workload: 8.0 h (team of four).

**Faculty items:** F1 workload (graduate and three-person 8.1 h; making R106 p.585 required +0.1 h); F2 confirm the
baseline-trajectory model (integrator chose b); F3 key D "none of the three first"; F4 proposed content, now incl.
the re-cut Increments 1–2 and the new R-012; F5 register (R105–R109; optional R108 p.390 extension); F6 off-ramp rule;
a Week 6 objective for gap analysis (n9).

### 9.1 Confirmation dispositions (`_source_cache/review/week06_confirmation.md`, REVISE narrow)

| Finding | Disposition |
|---|---|
| N1 (Moderate) exercise excess | **Fixed.** The marking notes now follow the lecture's charger rule: Lakeside has no capacity excess; the docks do not bind, so dock headroom (200 against 2,800, or 600 against 2,400) is slack, and an answer calling it an excess scores at most 2, matching the task text and the level-2 descriptor. Level-4 descriptor reworded; `assessmentParts.test.ts` asserts the notes, task text and descriptor agree. This supersedes the "200 trips a day" note in §9. |
| N2 baseline label | **Fixed.** The tool's baseline field and the baseline gate text add "plus any change already decided (the baseline trajectory)"; lab instructions regenerated. |
| N3 extreme words in distractors | **Fixed.** "alone" (w6q-4 a, b), "as soon as" (w6q-6 b), "right away" (w6q-9 b), "a full stop" (w6q-8 a) reworded; the soft-absolute regex adds alone, right away, as soon as, at all, completely, a full, with negative cases. Key positions and length ranks unchanged. |
| N4 workload 8.07 h unrounded | **Fixed (≤ 8.0 unrounded, about 7.996 h).** (1) The lab "integration" estimate falls from 0.8 to 0.6 person-hours: the tool's Markdown export already generates the roadmap grid's text equivalent (`roadmapGrid` in `recordMarkdown`), so teams no longer write it by hand (lab 9.4 person-hours, 2.35 h each). (2) The lesson's impact table lists the IDs Increment 3 reaches without repeating each reason, which stays in the worked-examples reference catalogue (≈230 words). No learning outcome or required reading is cut. A new test asserts the unrounded total ≤ 8.0 h, with the pre-fix values as the negative case. Graduate and three-person totals remain an F1 faculty item. |
| N5 baseline dependencies exported | Fixed: the baseline exports no `precedes` relations. |
| N6 rank of a horizon-less dependency | Not changed (harmless, as the confirmation notes). |
| N7 fixture horizons overlap | Fixed: "years 5 to 8". |
| N8 outline / §2 wording | Left as is: the outline's original plan sits under the revision banner, and §2 row 3 records the pre-review state (historical). |

Verification: Week 6 vitest set (13 files) 760/760 pass; `tsc -b` errors are only in other streams' files
(`src/week1/learn/dump*.tmp.test.tsx`, `server/services/projects.ts`); lab instructions and the Week 6 decks regenerated.
