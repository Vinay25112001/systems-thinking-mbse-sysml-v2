# Week 2 confirmation review (after fix commit b16b4ea)

Reviewer: independent reviewer (not the author). Date: 2026-10-19.
Inputs: `_source_cache/review/week02_review.md` (REVISE: 0 blocker, 2 major, 8 moderate, 13 minor) and
`learning-studio/docs/lectures/week02/WEEK2_REVIEW_DISPOSITIONS.md`.
No source file was edited and nothing was committed. One throwaway probe test
(`src/workbench/week2/zz_confirm_probe.test.ts`, 40 requirement statements) was written, run and deleted.
The Week 2 files have no uncommitted changes against b16b4ea (`git diff b16b4ea` on the Week 2 paths is empty).

## Verdict: **SIGN-OFF**

Both majors are closed and all eight moderates are closed, each with a test that can fail. Ten minors are closed,
one is closed in part, and the three deferrals are acceptable. Neither new gate causes a regression that blocks a
good requirement in normal use. The probe found four new **minor** findings (C1–C4 below). None needs fixing
before faculty review; they can go in the Week 3 batch.

Counts of new findings: **blocker 0 · major 0 · moderate 0 · minor 4**.

## Per-finding table

| # | Status | Evidence (file:line, all under `learning-studio/`) |
|---|---|---|
| M1 | **CLOSED** | `src/workbench/week2/record.ts:424-440` `subjectAccepted`, called at `:455` with the enterprise and the SoI name. `subjectOf` in `activities/week04/quality.ts:128` is unchanged, so Week 4 is not affected. Tests at `record.test.ts:451-469` cover both directions. Probe: "MedFly / FreshRoute / Dispatch shall …" count; "It / This / They shall …" and "…, it shall …" fail `subject` only. See C1 for what the capitalization rule lets through. |
| M2 | **CLOSED** | `aerolinkCase.ts:288`: CAP-005 needs only NEED-002 (corrected). `:298`: CAP-015 (proposed) holds NEED-011. `:234`: SCN-005 carries CAP-015. `:412` `AUDIT_RULE`. `:416-423`: the gap's `why` now agrees with the TBD doctrine, and the disposition is an open item for Week 3. `childlessNeeds` (`:407`) and the tool's `auditOf` (`record.ts:860`) both read direct parent links, which is the rule as stated. The rule is stated at `session2.ts:448` and `:895` and in lab step 7 (`week02Lab.ts:87`). **The gap test is a real check:** `aerolinkCase.test.ts:162-170` computes `needsOfRequirement` for every requirement, transitively through the CAPs, and `:171-177` shows it fails when NEED-011 is put back on CAP-005. Writing any requirement that names NEED-011 would also fail it. |
| M3 | **CLOSED** | Badges at `aerolinkCase.ts:162` (SCN-002 + CAP-007) and `:186` (SCN-003 + CAP-010, CAP-009). The notes are computed from the data: `session1.ts:627` (`mostNeeds`), `:678`, `:686` (`unbadged`). The exported notes say "SCN-002 touches the most needs (5)" (`exports/lectures/week02-session1-notes.md:545`). Test `aerolinkCase.test.ts:178-189` also checks that every badge is backed by a coverage row. |
| M4 | **CLOSED** | `labBrief.ts:119` is the tenth gate; `:123` is `UNMEASURABLE_TERMS`; `record.ts:420-422` and `:522-526` implement it, and the advisory is suppressed when the gate fires (`:531`, `:534`). The critique note `session2.ts:399` now says this one word-level sign blocks. Tests at `record.test.ts:471-488`. Probe: easy to use, user-friendly, "as fast as possible", quiet, optimise, adequate, maximize and "unsafe weather" all fail on this gate alone. Bounded or TBD-qualified uses, the fare display, "support", "fast-charge", "safety report" and "Rapid Response Team … within 5 min" count. See C2 and C3 for the heuristic's limits. |
| M5 | **CLOSED** | There are 0 hits for "SEBoK form" in the Week 2 sources, the Week 2 pages, the lab doc and both exported notes files. |
| M6 | **CLOSED** | `aerolinkCase.ts:316`: U-001 closes "before the Week 7 package baseline". `:317`: U-002 closes before the Week 3 trade study. MOE-005 cites "the Week 3 trade study" (`:468`). `course.ts:103`: "Measures of effectiveness and performance (MOE, MOP)". Test `aerolinkCase.test.ts:190-194`. |
| M7 | **CLOSED** | One vocabulary: `labBrief.ts:140-150` (`AUDIT_DISPOSITIONS`, `RECORD_WHY_NOT_FORMS`, `AUDIT_DISPOSITION_TEXT`). It is used in lab step 7 (`week02Lab.ts:87`, `WEEK2_LAB_INSTRUCTIONS.md:44`), in the tool help and field labels (`Week2LabTool.tsx:352`, `:356`), in the tool messages (`record.ts:898`, `:900`) and in the case (`aerolinkCase.ts:428-437`). There are no "covered elsewhere" or "recorded reason" hits in Week 2 student text. See C4 (the form test cannot fail). |
| M8 | **CLOSED** | REQ-STK-007 now says "a passenger with reduced mobility" (`aerolinkCase.ts:353`). `PARTIAL_COVERAGE` at `:443-447` covers NEED-008, NEED-006 and NEED-017. Test `aerolinkCase.test.ts:200-204`. See C4 (the open items name no owner). |
| M9 | **CLOSED** | `session1.ts:540-553`: students propose four fields (boundary, primary actor, trigger, one alternate) and the rest is revealed; the slide stays at 6 min. The timing test (≥ 5 min, ≤ 130 wpm) passes. |
| M10 | **CLOSED** | MOE-008 and MOE-009 at `aerolinkCase.ts:471-472`. MOP-008 and MOP-009 relinked at `:482-483`. MOE-006 measures NEED-005 and CAP-008 (`:469`). Tests `aerolinkCase.test.ts:205-219` cover both directions. The MOP-002 → MOE-001 exception is documented and reasonable (charge time drives the turnaround, which drives the wait). |
| N11 | CLOSED | `session1.ts:148`: the DEI-article warning. |
| N12 | CLOSED | `record.ts:503-507`: the token stem is kept ("TBD-01", "TBR-01"). Test `record.test.ts:490-496`. |
| N13 | CLOSED | `week02Lab.ts:99` computes ⌈10/4⌉ = 3 and ⌈6/3⌉ = 2; `WEEK2_LAB_INSTRUCTIONS.md:57`. |
| N14 | DEFERRED, **acceptable** | The reviewer marked it optional. The stated reason holds: an actor named in the SoI sentence as outside the system would trigger a false advisory. |
| N15 | CLOSED | `DISCOVERIES` takes the canonical statement; test `aerolinkCase.test.ts:220-222`. |
| N16 | PARTIAL, **acceptable** | w2q-9 relabeled; w2q-3 says "on weekends" (`quizWeek2.ts:40`); w2q-7 (b) reworded with R55 p.367 (`:90`); w2q-12 is now a judgment item (`:147`). The "Analyse" tag is the shared `Bloom` type value in `course.ts`, so renaming it is a template change across every week. The deferral is correct. Keys are a/b/c/d 3/3/3/3, and the length ranks are tested (`quizWeek2.test.ts` passes). |
| N17 | CLOSED | REQ-SYS-004 says "wind, gust or visibility … (TBD-01)" (`aerolinkCase.ts:371`). |
| N18 | CLOSED | `aerolinkCase.ts:62`: 12 aircraft at opening, about 15 by month 24; the arithmetic is tested. |
| N19 | DEFERRED, **acceptable for Week 2, must be tracked** | "[S01/S02]" and "S12 p.144" still reach students through the shared rubric register (Week 1 has them too). This belongs at template level, but it is student-visible, so it should be logged as a template item. The current INTERNAL regex (`timing.test.ts`) checks only `S0[1-4]` on slides and in the lesson, so it would not catch "S12". |
| N20 | CLOSED | `src/week2/Assessment.tsx`: four-level descriptors for the five exercise criteria and three memo criteria; the memo is narrowed to six checklist items. |
| N21 | DEFERRED, **acceptable** | The lesson is at the 8.0 h budget (the workload test passes). This is a template-parity gap, not a teaching defect: the whys are on each slide and on the bridge slide. It is placed in the Week 3 batch. |
| N22 | CLOSED | `session2.ts:673`, `:680`, `:686`, `:695`: 80 s + 20 s × 5 = 8 min 20 s, inside 9 min. |
| N23 | CLOSED | `session1.ts:154` cites R13 p.561, and the slide sources include `R('R13','561')` (`:145`). |

## Regression probe (the new `unmeasurable` gate and `subjectAccepted`, both directions)

Run on the food-bank fixture: statement swapped into REQ-SYS-004, type functional, method demonstration.

**Good requirements: all count except one arguable case.**
- A proper-noun subject (MedFly, FreshRoute, Dispatch) counts.
- A condition clause followed by "the warehouse lead shall …" counts.
- Bounded values count ("within 5 s", "at or below 5 °C", "between 22:00 and 06:00").
- An owned TBD counts ("within TBD-01", U-001 linked).
- "quickly, within 2 s for 95 %" counts.
- Hyphenated and inflected look-alikes count: "fast-charge", "safety report", "shortest".
- "as long as" counts.
- One false positive: "land at the nearest **safe** landing site when a battery fault occurs" fails `unmeasurable`. This is defensible, since "safe landing site" really is undefined until a criterion defines it. It is noted under C2.

**Bad requirements: pronouns and the listed words fail.**
- "It", "This" and "They shall …" and "…, it shall …" fail `subject`.
- easy to use, user-friendly, "as fast as possible", quiet, optimise, adequate and a bare "respond quickly" fail `unmeasurable` (typed performance, the last also fails `performance-value`).

Gaps found are in C1–C3.

## New findings

**C1 (minor). The proper-name test cannot tell a name from a sentence-initial capital.**
- `record.ts:439` accepts any one-word subject that begins with a capital letter. The first word of a sentence is always capitalized, so every one-word subject at the start passes.
- Probe results that count:
  - "System shall notify the coordinator within 5 min." (the lower-case "system shall" after a comma fails, per the test at `record.test.ts:466`, so the two are inconsistent);
  - "Users shall be able to book …";
  - "Our shall …" (possessive determiners such as our, their, my, his and her are missing from `NOT_A_SUBJECT`, `:424`);
  - "It also shall …" (a two-token subject is accepted unless every token is a pronoun or determiner);
  - "When the queue exceeds 10 orders it shall …" (with no comma, the whole clause becomes the subject; this predates the fix).
- *Failure scenario.* A student writes "System shall …" or "Users shall …" and the tool says the subject is fine. That gives false assurance on a form the lecture would correct. This is not a regression: the reviewer's own M1 fix proposed "capitalized". The common pronoun cases are caught.
- *Fix (Week 3 batch).*
  - When the capitalized word is sentence-initial and is a common noun, accept it only if it matches the enterprise or SoI name or a token that is capitalized elsewhere in the record (actors, scenario names). Otherwise treat it as lower-case.
  - Add the possessive determiners to `NOT_A_SUBJECT`.
  - Fail when the first token is a pronoun even if more tokens follow.

**C2 (minor). An unrelated bound or TBD anywhere in the statement lifts the `unmeasurable` gate.**
- `bounded` (`record.ts:524`) is statement-wide: a value and a bound word anywhere, or any TBD token, lift the gate. Probe results that count:
  - "The booking screen shall be easy to use for coordinators above 18 years.";
  - "The routing tool shall respond quickly before 07:00.";
  - "The booking function shall be easy to use for TBD-01 users." (U-001 linked).
- Each still raises the `vague` advisory, and the gate's pass message warns "make sure it, not the word, defines compliance". So the miss is not silent.
- The opposite case is a fail that is right: "respond quickly to requests from 20 vans" fails (no bound word).
- *Failure scenario.* A team gets an unmeasurable requirement to count by adding an unrelated number with a bound word. The grader still catches it on RB-3.1.
- *Fix (optional).* Require the bound or TBD to sit in the same clause as the term. Otherwise accept this as a documented heuristic limit in the S2 note.

**C3 (minor). Close synonyms of the listed words fall outside both the gate and the advisory.**
- "The booking function shall be **intuitive**." and "… shall respond **promptly**." count with **no advisory at all**.
- "in a timely manner" and "efficient" count with only the `vague` advisory.
- The term list is narrow on purpose, which is fine. But "promptly" is the plain synonym of "quickly", which blocks. A student who swaps the word passes the gate without a single advisory.
- *Fix.* Add "promptly", "prompt", "timely", "intuitive" and "efficient(ly)" to `UNMEASURABLE_TERMS`, or at least to the vague-word list behind the advisory (the Week 4 `quality.ts` list is shared, so check Week 4 first).

**C4 (minor). Two small gaps in the M7 and M8 fixes.**
- *(a) The reference open items do not model their own form.*
  - `RECORD_WHY_NOT_FORMS` defines an open item as "what is missing, **who closes it** and the target week" (`labBrief.ts:147`).
  - None of the reference open items names who closes it: the STK dispositions (`aerolinkCase.ts:429-434`), the three `PARTIAL_COVERAGE` dispositions (`:444-446`) and `DELIBERATE_REQ_GAP.disposition` (`:422`).
  - A student copying the instructor's model then omits the owner the rubric (RB-3.6) expects.
  - *Fix.* Add the owning role to each, for example "Open item (Requirements & Compliance lead): …".
- *(b) The M7 form test cannot fail.* `STK_DISPOSITION_FORM` is derived from the text by regex, with every string that is not "no child needed" mapped to `'open'` (`aerolinkCase.ts:437`). So `expect(['open','no-child']).toContain(...)` (`aerolinkCase.test.ts:196`) holds by construction. Only the separate not-match on the old phrases protects the vocabulary.
  - *Fix.* Assert that each disposition starts with "Open item:" or "No child needed:".

## Other checks (pass)

- **Timing.**
  - Both sessions are 68–70 min of content plus a buffer, 75 min in all.
  - Spoken density is at most 130 wpm on every slide (`timing.test.ts`, which passes; its negative direction is shown).
  - SCN-005 stays at 6 min with the 4-field construction; the clinic fits 8 min 20 s inside 9 min.
- **Workload.** 8.0 h for a team of four, proportional for a team of three (tested; passes). The headroom is thin, about 13 lesson words (see N21).
- **Quiz.** Keys are a/b/c/d 3/3/3/3, the length ranks are balanced with no run of three, and four Bloom levels are used (tested; passes).
- **Student text.**
  - "SEBoK form": 0 hits in Week 2 student text or in the exports.
  - No internal IDs on slide faces or in the lesson (tested).
  - The "RB-x" rubric row labels and the "W2.x" objectives in the lab doc are the intended student-facing scheme, the same as in Week 1. "[S01/S02]" and "S12 p.144" remain (N19, deferred).
- **Citations.** 265 citations in 13 Week 2 files were machine-checked against `src/content/readings.generated.json`. There are 0 unknown IDs and 0 pages outside a register range (R13 p.561 and R55 p.367 included).
- **The NEED-011 gap test is genuine.** It is transitive over CAP links, it has a mutation test that fails, and it fails if any requirement names NEED-011 (see M2).

## Gates (run from `learning-studio/`, 2026-10-19)

| Gate | Result | Week 2? |
|---|---|---|
| `npx tsc -b` | exit 0 | clean |
| `npx oxlint src` | exit 0: 0 errors, warnings only (Week 3 figure files) | 0 lines mention a Week 2 file |
| `npx vitest run` | 1,517 of 1,519 passed; 78 of 80 files | Two 30 s timeouts, both out of scope: `activities/week07/activities.test.tsx` (simulator DEC) and `activities/week11/activities.test.tsx` (RID writer). The Week 2 suites run alone (`workbench/week2`, `lectures/week02`, `quizWeek2.test.ts`, `src/week2`): **5 files, 131 of 131 passed**. No Week 3 or Week 8 failures in this run. |
| `npx vite build` | exit 0 (chunk-size warning only) | pass |
| Playwright `e2e/week2-flow.spec.ts` (default config, the shared 5173 server reused) | **6 of 6 passed**, axe light and dark at 1440 and 400 px | pass |
| Playwright `-c playwright.lectures.config.ts e2e/lectures-week2.spec.ts` (its own 5198 server) | **4 of 4 passed**; axe "no violations" in light and dark | pass. Only this spec was run; the config's testMatch now also lists the Week 3 and Week 8 specs (another agent's uncommitted edit), and those were not run. |

Lock protocol: the lock was held by the "Week 3 agent" at the start. I waited, then claimed it atomically ("Week 2
confirmation reviewer", 12:19:53), ran both specs and deleted it. `git status` on `screenshots/` was identical before and
after. The dev server on 5173 was not touched.
