# Week 5 confirmation review (after commit `41b2578`): review findings + cross-week gate sweep

Reviewer: independent confirmation pass (not the author). Date: 2026-10-19.
Inputs: `_source_cache/review/week05_review.md` (REVISE, 0 / 2 / 6 / 22),
`learning-studio/docs/lectures/week05/WEEK5_REVIEW_DISPOSITIONS.md`, `learning-studio/docs/lectures/GATE_SWEEP_2026-10-19.md`,
`learning-studio/src/workbench/shortAnswers.test.ts`.
Method: the case was recomputed and every lab tool probed with a throwaway vitest file. The files were
`src/workbench/zz_confirm_probe.test.ts`, plus a copy of the pre-commit Week 5 `record.ts`
(`src/workbench/week5/zz_old_record_confirm.ts`) used for the old-format export. Both files were deleted after the run.
Six changed figures were render-checked in `exports/lectures/.figure-cache/`: trust-boundaries, modularity,
worked-security, answer, integration and worked-n2. They were exported at 20:17, after the last source edit at 20:01.
R54 was checked against the page text in `_source_cache`.
No source was edited and nothing was committed. Paths are relative to `learning-studio/` unless noted.
Other agents own `src/project/*`, `week06` and `TeamView.tsx`, and `src/content/zz_quizdbg.test.ts` belongs to another
agent. All of these were ignored.

## Verdict: **SIGN-OFF** (Week 5), with one moderate from the sweep to fix before teaching

**Blocker 0 · Major 0 · Moderate 1 · Minor 9** (new findings). The review's findings:
- **M1, M2 and Mo1–Mo6: CLOSED.**
- **Minors:** 19 CLOSED and 3 PARTIAL: n11 (residual walk text), n14 (a new citation slip, see N6) and n20 (accepted
  remainder).

The sweep holds for Weeks 1–4 and 8. Every defect named in the brief is still rejected:
- a need with no stakeholder;
- a requirement with two "shall"s;
- an interface with identical ends;
- a missing parent;
- unknown IDs.

Export formats are byte-identical. One over-relaxation matters. In Week 5, a trust-boundary-crossing interface
counts with protection "none", "n/a" or "-". The sweep's own rule says such answers stay rejected (N1, Moderate).

## A. Week 5 review findings

| # | Status | Evidence (file:line) |
|---|---|---|
| **M1** radio datalink | **CLOSED** | Fifth reason `'radio medium'` and `RADIO_MEDIUM` (`aerolinkCase.ts:286–295`). Medium "air-ground radio datalink (PHY-006)" (`:123`). IF-013 authenticates the sender (`:210`). `RADIO_INTERFACES` / `LEASE_DEPENDENT` (`:308–310`). F6 is computed (`:566`). **Recomputed from data:** 16 interfaces, **14 crossing** (IF-001, 002, 003, 005–011, 013–016), **possible: IF-012** (the only lease-dependent one that does not cross), **none: IF-004**. Agreement: lesson (`session2.ts:89`, `:103`), slide caption, alt, notes and walk (`:329–343`), worked-security caption, alt and notes (`:413–414`, `:437`), table `crossText` (`:44–47`), figure strip (`LectureWeek5S2.tsx:302`, PNG "14 crossing · 1 possible (leased ground network) · 1 none"), and exported `week05-lesson.md:469`. Nothing says "12 crossing" or "3 possible" anywhere in `src/` or `docs/` for Week 5. Examples shows "no" for IF-012 (minor N7). **R54 p.331:** `_source_cache/se_guide_book_interactive.txt:15657` ("radios connect subsystems via airwaves") lies under `=== PAGE 331 ===` (`:15621`). The rule is labeled a course convention and is consistent with the source. Tool: `UNOWNED_MEDIUM` (`workbench/week5/record.ts:46`); the probe fires `hidden-external` on "Wi-Fi" but not on "copper cable". |
| **M2** word minimums | **CLOSED** | `MIN_PART_WORDS` 1, `MIN_TEXT_WORDS` 2, `criterionOk` (`record.ts:41–48`). Every threshold is in the `labBrief.ts` short text and in the generated table (`WEEK5_LAB_INSTRUCTIONS.md` gate table). "By construction" is corrected (`labBrief.ts:13`). Probe: "Fail safe", "Power only", "TLS", "Approved"+ICWG, "2 min", "TBD (Ops)", "Charges aircraft", "No arrangement yet" and "None apply" all count. **Over-relaxed in the other direction:** see N1 and N2. |
| **Mo1** IF-015 miscount | **CLOSED** | `counts {1,1,0}`, `path {1,2,0}` (`aerolinkCase.ts:411–412`); the rationale says the count does not decide (`:409`). Lesson: "the N² has 15 interfaces either way" (`session1.ts:143`). Bullets, caption, alt and notes at `:704–715`. PNG cards read "1 new interface · path of 1 / path of 2". Recomputed: PHY-008 has only IF-007 and IF-015, so each option adds exactly one interface (15 before IF-016). |
| **Mo2** forecast coverage | **CLOSED** | IF-011: "every 10 min, each covering at least the next 60 min" (`aerolinkCase.ts:196`). Degraded trigger "more than 30 min old" (`:199`). REQ-SYS-014 statement, criterion and rationale (`:436–439`). **Arithmetic:** 60 − 10 = 50 ≥ 30 just before the next refresh. The look-ahead is lost at age > 30, so the t+10 and t+20 refreshes may both be lost and the t+30 one restores coverage. Two consecutive losses are tolerated, exactly at the boundary, which matches the "more than 30 min" trigger. No "spare refresh" or "valid for the next 30 min" text remains. |
| **Mo3** assessment | **CLOSED** | `docs/lectures/week05/WEEK5_APPLIED_EXERCISE_BRIEF.md` (ski resort, marking notes). Four tasks, 6+10+13+6 = 35 min, and 16 points on both scales (`week5/Assessment.tsx:79–86`, `:116`; `week05Lab.ts:291`). The ferry overlap is removed. |
| **Mo4** modularity geometry | **CLOSED** | `MODULARITY` plus `minLinkClearance` (`week5FigureKit.ts:54–76`), used by the figure (`LectureWeek5S1.tsx:922`). Test `week5FigureKit.test.ts` includes a negative direction (the old layout). **Can fail:** the mutation probe moved node A onto the C–F link, and clearance fell to 0.0 against the threshold of 34. The real layouts have 53.3 (grouped) and 92.0 (scattered). PNG: five heavy links, none through a node. |
| **Mo5** degenerate grouping | **CLOSED** | Lesson `session2.ts:125` ("one aggregate holding everything … Compare groupings of similar size …"); bullet `:493`; notes `:501`. |
| **Mo6** latency budget | **CLOSED** | Slide-face bullet "Latency budget: 120 s = 30 + 30 + 30 s + 30 s margin; a hold precedes classification" (`session2.ts:565`). `holdNote` and `linkLossNote` are in the lesson (`:147`) and the Examples caption (`week5/Examples.tsx:211`). The hold keeps Week 4's rule that only technicians classify (`aerolinkCase.ts:463`, `:467`). IF-013 degraded states the exception (`:211`). Recomputed: 90 s used, 30 s margin. |
| n1 | CLOSED | `session1.ts:583`: both bullets end "(course convention)". |
| n2 | CLOSED | `session2.ts:389` "**Fail safe** (course default)". |
| n3 | CLOSED | `session2.ts:138` "On κ and P". |
| n4 | CLOSED | `aerolinkCase.ts:130`: boarding goes PHY-002→001 and alighting PHY-001→002. |
| n5 | CLOSED | `week04/aerolinkCase.ts:230`: FN-010 outputs "pad incident records" (INFO-006). |
| n6 | CLOSED | `session2.ts:128`, `:536` explain 20 vs X. |
| n7 | CLOSED | `session2.ts:414` alt promises one protection example per card plus the strip, which matches the PNG. |
| n8 | CLOSED | PNG `w5s2-trust-boundaries`: examples 3, 4 and 5 each sit within one owner; the leased line has two ends (C, D). |
| n9 | CLOSED | Question posed in the standards transition before advancing (`session2.ts:269`); answers taken first (`:298`). |
| n10 | CLOSED | "before revealing each card" is gone; `session2.ts:430`. |
| n11 | PARTIAL | The timing and "row and column" are fixed (`session1.ts:624–637`). The figure walk still says "then the operations center row" (`:634`). Cosmetic. |
| n12 | CLOSED | `session1.ts:96`, `session2.ts:437` read "the reference was checked …". |
| n13 | CLOSED | `session1.ts:84` ("the app design", "integration test results"). |
| n14 | PARTIAL | Slide titles (`week05Lab.ts:36–46`), the impact basis without R22 p.631 (`labBrief.ts:168`) and the one-shall basis (`:158`) are fixed. The rewritten `name` basis cites the wrong page (N6). |
| n15 | CLOSED | `PART_RULES` `icwg`, `standards`, `unique-ids` (`labBrief.ts:184–186`). Probe: ICWG "Ops" alone fails. |
| n16 | CLOSED | `owner-spelling` advisory (`record.ts`, `assessInterface`). |
| n17 | CLOSED | Probe: EXT–EXT still counts, with advisory `no-internal-end`. |
| n18 | CLOSED | `Week5LabTool.tsx:176` asks for confirmation when `hasWork`; the e2e test asserts the dialog. |
| n19 | CLOSED | `normalizeRecord` lower-cases kind and method; probe: an old export with "Test" imports as **ready**. |
| n20 | PARTIAL (accepted) | As dispositioned; the 26 quiz-rule tests are green. |
| n21 | CLOSED | Per dispositions; "disaggregation" is gone from `quizWeek5.ts`. |
| n22 | PARTIAL | Now names `7ab45a5`, but goes stale again (N8). |
| Legibility | CLOSED (partial, accepted) | PNGs: breakdown boxes wrap. Corner marks clear the IF digits (`w5s1-worked-n2`). Integration pills are coloured by kind and the lines stop at them. The IF-015 label is clear. The worked-security card 1 title touches its border (cosmetic). |

**Workload:** `week5Path.ts` `WORKLOAD_TOTAL` = 8.0 h (2.5 + 0.8 + 0.7 + 0.2 + 2.8 + 0.3 + 0.6 + 0.1), ≤ 8.0, and
`timing.test.ts` is green. Graduate students come to 8.1 h, with the 0.7 h task replacing the 0.6 h exercise. This is
stated on the page (`week5Path.ts:155`) and predates the commit (observation only).

## B. Gate-sweep audit

Probe method: through the real record API, each field took a value on a passing fixture. "Defect" means the entry must
not count.

| Week | Short valid answers accepted | Real defects still rejected (probe) | Over-relaxed? | Remaining hard gates have a student-visible basis |
|---|---|---|---|---|
| W1 | Yes (sweep tests; probe: mission "Feed every family weekly." passes) | A need whose subject is not in the register → `subject`. A need with no subject → `subject`. "shall" → `requirement`. A solution → `solution`. A 2-word need → `structure`. "Families need it." → `structure`. Concern "Safety" / "ok" → specificity. Rating reason "none" → rejected. A 2-word mission and a 2-sentence mission → rejected. A need with no sources fails the `attributed` completeness item (`needQuality.ts:293`) | Minor: the Week 1 `EMPTY_ANSWER` (`team.ts:44`) lacks `later`/`todo`, so charter decision rules "later" count, while Weeks 2–3 reject "later" (N5) | Yes. 40 words (`week01Lab.ts:73`); 60 words (L1 step; `logic.ts:242`, shown in `L1RecordView.tsx:91`); AI 12 words in the field label; 3-word sentence stated in the message (`team.ts:291`). HEAD still has the old "(at least five words)" label at `TeamView.tsx:128`; the working tree is correct and lands with P1 (N9) |
| W2 | Yes | Two shalls → `one-shall`. No parent → `parent`. Unknown parent → `parent`. Pronoun subject → `subject`. Criterion "TBD", "n/a" or "Very fast" → `criterion`. Rationale "none" or a restatement → `rationale`. Scenario trigger "later", failure "None", success "n/a" → reject. Disposition "later" or "TBD" → reject | **Minor: criterion "none" counts** (`record.ts:493` anchors on `none`; `TRIVIAL_CRITERION` `:426` lacks it) (N3) | Yes (sweep table; `EMPTY_ANSWER` `:40`) |
| W3 | Yes | Risk then "none" or condition "n/a" → `form`. Treatment "later", empty, or no handling → `handling`. An issue phrased as a risk → `not-issue`. TPM basis "none", trade with no decision, residual "none", or sensitivity "see table" → reject. Assumption validation "later" → reject | No | Yes |
| W4 | Yes | Unknown producer → `producer`. Data = information → `data-information`. AI supports empty or FN-099 → `function`. Oversight "nobody" → `oversight`. Unknown host → `host`. Allocation "flow" or empty → `criterion`. Chosen not among the alternatives → `chosen`. Two alternatives → `alternatives`. Function named as an element → `name`. Empty mission → Part fails | No | Yes. **AI "supports a function":** the lesson paragraph and the new "Supports" table row (`week04/session2.ts`, `w4-lesson-ai`) are lesson content (not notes) and are **present in the student build** (`dist-student/assets/lectures-*.js` contains "the element that hosts it and the function it supports"). The exported `exports/lectures/week04-lesson.md` (15:24) predates the change (N9) |
| W5 | Yes (all review M2 inputs) | Identical ends or unknown end → `ends`. Two shalls → `one-shall`. No or unknown parent → `parent`. Unknown interface on a requirement or a CR → `interface`. Unknown or no impact → `impact`. No decider → `decision`. One-org ICWG → Part fails. Degraded "n/a" → `degraded` | **Moderate N1:** protection "none", "n/a" or "-" (and reason "?") on a crossing interface counts; CR decision "n/a" or "?" counts; external reason "?" counts. **Minor N2:** criterion "TBD" (no owner), "TBD later", "1" and "Very fast" count | Yes (`labBrief.ts` short + basis, generated table) |
| W8 | Yes ("12 items", "none", "3 (SCN-…)") | "", "some", "TBD", "12.5", "several", "not sure" → null | **Minor N4:** "no idea" and "no clue" count as 0 (`skeleton.ts:459`) | Yes (purpose 15 words, `week08Lab.ts:80`) |

**Export formats unchanged.** The commit touches no `modelInputs` or import function except Week 5's
`normalizeRecord` (lower-casing). The Week 5 fixture exported by the **pre-commit** `record.ts` is byte-identical to the
current export (21,323 chars). The current `importWeek5` imports it as **ready**. The Week 4 fixture export imports into
Week 5 (`importWeek4File` ok). Weeks 2, 3 and 4 `modelInputs` → `import*` round-trip ok. The pre-commit gates also rate
the Week 5 fixture **ready**.

## New findings

| # | Sev. | Finding (file:line) | Failure scenario | Fix |
|---|---|---|---|---|
| N1 | **Moderate** | Week 5 has no empty-answer check, unlike Weeks 1–3 (`EMPTY_ANSWER` / `said()`). `pOk` (`workbench/week5/record.ts:411`) accepts protection "none", "n/a" or "-", and `noProtectionReason` "?". The decision (`:558`) accepts "n/a" and "?". The external reason (`checkInterfacesPart`, `:652`) accepts "?". Before the sweep, all of these failed (≥ 3 or ≥ 5 words). The sweep's stated rule (`GATE_SWEEP_2026-10-19.md:72–76`) says such empty answers stay rejected. `shortAnswers.test.ts` (Week 5 block) and `record.test.ts` only test `''` and `' '` in the reject direction. | A team writes "none" in Protection for its Stripe API interface, which crosses a trust boundary on an external end. The tool reports "protection stated" and the interface counts toward the 8. This is the A21 item 6 security column the week exists to teach. | Reuse the Week 2 `EMPTY_ANSWER` for protection, reason, decision and external reason (keep "Power only", "TLS" and "None apply" for standards). Add "none", "n/a", "-" and "?" to the reject lists in both test files. |
| N2 | Minor | `criterionOk` (`record.ts:48`) accepts any single token holding "tbd" or a digit: "TBD" with no owner, "TBD later", "1". Two words of any kind also pass ("Very fast"). The gate text promises "a TBD with an owner". Week 2 rejects bare TBD (`TRIVIAL_CRITERION`) and unanchored vague criteria. | An interface requirement with criterion "TBD" counts in Week 5 but fails the Week 2 gates that the lecture says are "kept". | Require an owner in parentheses for TBD; reuse the Week 2 trivial and vague checks; add reject cases. |
| N3 | Minor | Week 2 criterion "none" counts: `critAnchored` (`week2/record.ts:493`) treats `none` as an anchor, and `TRIVIAL_CRITERION` (`:426`) lacks it. Pre-sweep it failed (≥ 3 words). | A requirement with no pass condition counts. | Add `none` to `TRIVIAL_CRITERION` when it stands alone. |
| N4 | Minor | `countOf` (`week8/skeleton.ts:459`) maps "no idea" and "no clue" to 0 through `no(?:ne)?(?: \w+)?`. | A package row reads "none in the package" when the team does not know the count. | Limit the pattern to "no", "none", "zero" and "no items/entries/IDs". |
| N5 | Minor | Week 1 `EMPTY_ANSWER` (`week1/team.ts:44`) lacks `later` and `todo` (Weeks 2–3 have them), so charter decision rules "later" count. | Inconsistent across weeks. | Align the regex. |
| N6 | Minor | The rewritten `name` gate basis (`content/lectures/week05/labBrief.ts:125`, generated into `WEEK5_LAB_INSTRUCTIONS.md:85`) quotes "one of the parts that make up a system" as "SEBoK glossary p.1643, after ISO/IEC/IEEE 15288". That definition is R101 p.1467 (IEEE 829 / IEEE 2008; `Guide_to_…_v2_14.txt:63948` under `=== PAGE 1467 ===`). R102 p.1643 is the system element entry. This slip was introduced by the n14 fix. | A student following the gate basis finds a different definition on p.1643. | Cite R101 p.1467 (IEEE); drop "after 15288". |
| N7 | Minor | The Examples interface table shows Trust boundary "no" for IF-012 (`week5/Examples.tsx:172`, `list(boundaryReasons(x), 'no')`). The lesson table, slides and figure call it "possible (leased ground network)" (`session2.ts:44–47`). | Two student pages disagree on one cell. | Use the same `crossText` logic on Examples. |
| N8 | Minor | Stale status again (n22 class): `WEEK5_MILESTONE_REPORT.md:4–6` and `WEEK5_REVIEW_DISPOSITIONS.md:3–4` say the fixes are "in the working tree, not yet committed". They are commit `41b2578`. | — | Update both lines. |
| N9 | Minor | `exports/lectures/week04-lesson.md` (15:24) predates the Week 4 lesson "Supports" row and paragraph; the app and student build have them. HEAD `TeamView.tsx:128` still says "(at least five words)" until the entangled P1 commit lands. | A faculty member reading the exported lesson or checking out HEAD alone sees the old text. | Re-export Week 4 (`npm run lectures:pptx -- --week 4`, lesson md); land TeamView with P1. |

Observation: graduate workload is 8.1 h (stated, pre-existing). Cosmetic: n11 walk text (`session1.ts:634`); the
worked-security card 1 title touches its border.

## Gates (run 2026-10-19 from `learning-studio/`; shared tree with other agents' uncommitted edits)

| Gate | Result |
|---|---|
| `npx vitest run src/workbench src/content/lectures/week05 src/content/lab src/content/quizWeek5.test.ts src/components/figures/week5FigureKit.test.ts` | **29 files, 975 / 975 pass** (before the probe was added) |
| `npx vite build` | ✓ (chunk-size warning only) |
| Student build (`vite build --mode student --outDir dist-student` + `scripts/check-student-build.mjs`) | **PASS**; the Week 5 instructor decks keep 23 / 19 notes slides |
| `npx tsc -b` | exit 0 (it ran clean despite the in-progress `src/project/*`) |
| Playwright `e2e/week5-flow.spec.ts`, workers = 1 | **6 / 6** (3.3 min). Lock: waited for `p1-project-workspace` to release it, created `week05-confirmation-reviewer` at 20:41:09, deleted after |
| Throwaway probe | ~150 cases across W1–W5 and W8, plus the case recompute and the Mo4 mutation. Deleted; `git status` shows no file of mine |

The dev server on 5173 was left running.
