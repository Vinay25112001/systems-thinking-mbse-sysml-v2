# Week 9 sign-off review: MBSE foundations and the SysML v2 language (L9, CP3 defence)

Reviewer: Independent AI reviewer (Claude), sign-off pass. Date: 2026-10-11. No course or app file was changed. The one mutation was applied, tested and reverted, and `git diff --stat` on that file is empty afterwards.

**Under review:** the fix commit 952c2a2 against the first review (`week09_review.md`, W9-F01 to F19). Files: `src/content/weeks/week09.ts`, `src/activities/week09*`, `sysml/week09/*`, `sysml/instructor/week09/*` and `docs/authoring/week09_notes.md`. Nothing under these paths has changed since 952c2a2 apart from the shared `validation-report.json`.

## Verdict: **NOT SIGNED OFF**

The fix commit resolves all 19 original findings, two of them with a lead-owned remainder. The SysML teaching is now sound: the "stated versus entailed" passage, the KerML-only constructs and the multiplicity semantics all reproduce in my probes. The predict activity's hash gate now fails closed.

Two **new major findings** block sign-off. Both belong to defect classes that the Week 10 and Week 11 reviews have already raised. The first Week 9 review missed them.

1. **S9-N1 (High). The predict activity's score line gives away the key before any reveal.** This is the W10-F01 class.
2. **S9-N2 (High). The quiz key is all "b", and the correct option is usually the longest.** All 15 items are keyed "b". The correct option is the unique longest in 13 of 15, often 3 to 5.5 times the length of the next. This is the W10-F09 / W11-F01 class.

Both fixes are mechanical. Week 10's `scorePredictions10` already shows the pattern for S9-N1, and Week 10's rebalanced quiz shows the pattern for S9-N2. Once they are made and tested, I expect a confirmation pass to sign the week off.

## Disposition of the original findings

| ID | Sev. | Disposition | Evidence |
|---|---|---|---|
| F01 | High | **RESOLVED** | Commentary ¶3 now gives the entailment line by line (ll.15, 18, 26, 29). It says that coverage does not follow from the definition ("six sites, one hub and no spokes"), and that deleting the ratings removes the disjointness. a5 asks about coverage "by the definition alone" (key false), with a correct explanation. The advanced block's example is now "does not make a site with two high-power chargers one of the hubs", which is true. Memo (d) asks for the stated-versus-entailed argument. My probe `s9_hub_and_spoke` (HubAndSpoke :> both, plus a usage) passes with no messages, as the lesson says. |
| F02 | High | **RESOLVED** | The lesson, q9-14, the facilitation notes and the cautions now say that KerML has disjoining, unioning and `all`, and that the pilot's SysML notation has none of them on definitions or usages. The taught SysML alternative, `aerolink_network_stated.sysml` (asserted constraints), passes with no messages. My probes: `disjoint hubs from spokes;` FAILs with "no viable alternative at input 'hubs'"; `part def all FastHub` FAILs at 'all'; a false asserted constraint `size(hubs) > size(sites)` PASSES with no messages, which confirms "resolved but not evaluated". |
| F03 | Med | **RESOLVED** | pc4 is renamed `predict_pc4_conflicting_multiplicity.sysml`. Its explanation, advanced ¶2, misconception 5 and memo (c) all separate "ill-formed widening" (R87 p.62, re-read: "must only allow cardinalities consistent with") from "unsatisfiable (non-overlapping)". My probe `[2..4]`→`[2..6]` PASSES with the same "should not have larger multiplicity upper bound" warning, as the lesson now says. |
| F04 | Med | **RESOLVED** (lead remainder) | In the L9 skeleton, definitions declare and the `aeroLink` usages bind (ll.103–129). The lesson says why kind-defining ratings may sit in a definition, and a sentence reconciles the two PHY-002 models. The reference v0.1 skeleton still binds in its definitions. The lead change is recorded in the notes and `openIssues`, and the answer key tells graders not to penalise either form at L9. |
| F05 | Med | **RESOLVED** | `recordedResult` takes `HashState`: pending gives no verdict, and unavailable gives "cannot verify". Mutation: I removed the pending guard, and 2 tests failed (logic and component). I reverted it, and `git diff --stat` is empty. |
| F06 | Med | **RESOLVED** | `course.ts` l.171 registers R80 p.47–50, 55–56, 63–65, 72–73 and 77 as Week 9 readings. There is a workload row for them (0.8 h), and q9-5 is labelled "Graduate (KerML)". The remainder is minor: R79 (S10 sl.167–168) is cited in worked (c) but is only in `references` (S9-N6). |
| F07 | Med | **RESOLVED** (disclosed) | The lesson is now 4,747 words (`lessonWordCount`, my run). Session 2 has a 5-minute purpose-and-views segment and sums to 75. The cautions give realistic totals of 11.8 h (graduate) and 10.8 h (undergraduate), or 10.3 h and 9.3 h on prepared machines, against 9 h. See S9-N4 for the A14 follow-up. |
| F08 | Med | **RESOLVED** | `w9-checker` and the predict activity now come before every worked example. w9-language ¶5 says "whether the checker tolerates the v1 words is one of your predictions". No block before the activity states a probe outcome; some state rules (quoting, import visibility) but not the outcome class. |
| F09 | Med | **RESOLVED** (lead remainder) | The L9 block, lab step 1 and checklist item 3 now state the conda-forge install into the active environment, the npm labextension step, abort-on-first-failure, network and disk needs, and a fallback (a prepared machine or the instructor's headless run). The SHA-256s of the fetched files are in the notes. The PROVENANCE.txt append is a lead request. |
| F10 | Med | **RESOLVED** | The skeleton has exactly one element each of STK, CON, MGO, NEED, CAP and SCN (ll.34–137). The lesson sentence and caption match. The lab step and artefact say "beyond the lab-plan L9 minimum". |
| F11 | Low | **RESOLVED** | The text now reads "because ISO 80000 forbids decorating unit symbols (README §5)". |
| F12 | Low | **RESOLVED** | Advanced ¶4 is labelled "instructor guidance, not a rubric rule … offered as guidance for RB-8.3". |
| F13 | Low | **RESOLVED** | `KIND_MAPPING` has `nameStyle`, and `declaredNameFor` follows `idOn`. "Other" takes a package name (`otherName`), which is used in the Markdown table. |
| F14 | Low | **RESOLVED** | The escape set follows the KerML grammar: `PHY\-003` is rejected, `< 'PHY-003' >` is accepted, and `''` and reserved-word segments are rejected. My probes on `referenceProblems` agree, as do the tests at logic.test.ts ll.72–95. |
| F15 | Low | **RESOLVED** | Both `<pre>` blocks have `tabIndex={0}`. The token buttons' `aria-label` includes the student's choice and, after Check, the result in words. |
| F16 | Low | **RESOLVED** | Defence ¶2 and the answer key name R-001, R-005 and R-002, as DEC-001 does. |
| F17 | Low | **RESOLVED** | The Core layer is now worded as on R70 sl.4 (type, classifier, feature, multiplicity; specialization), which I re-read. The libraries (ISQ, SI, ScalarValues) are cited to R90 sl.17, also re-read. "No unit for counts" is labelled a course choice. |
| F18 | Low | **RESOLVED** (one new staleness, S9-N4) | `openIssues` now lists four live items. R83 is called "a Week 10 extension reading". The notes' probe row is corrected. |
| F19 | Low | **RESOLVED** | q9-3 is recast with a new artefact (a valid model with no stated purpose and 40 catalogue definitions). |

## New findings

| ID | Severity | Location | Finding | Evidence | Fix |
|---|---|---|---|---|---|
| **S9-N1** | **High (blocker)** | `PredictChecker.tsx` (score line); `predict.ts` `scorePredictions` | **The key leaks before the reveal.** The status line "N exactly right; M right on PASS/FAIL" is computed from every stored prediction against the hard-coded `item.answer`, whether or not the item is revealed. The radio buttons stay enabled until the reveal. A student can try each option in turn and watch the count change, and so read all eight answers without revealing any. The score is also computed for items whose record is stale, missing or unverifiable, which contradicts the activity's own "shows nothing unless SHA-matched". | Code: `const score = scorePredictions(store.predictions)`, with no reveal or record filter. A jiti probe of `scorePredictions` with no reveal: `{pc1:'fail-syntax'}` gives correct = 1, and `{pc1:'pass-clean'}` gives correct = 0. Week 10 fixed exactly this as W10-F01; its probe gives `scored: 0` for unrevealed items. | Port `scorePredictions10` (score only revealed items whose `recordedResult` is `recorded`, against `rec.outcome`). Hash every revealed listing. Add Week 10's two tests: an unrevealed prediction is never scored, and an unverifiable item is not scored. |
| **S9-N2** | **High (blocker)** | `week09.ts` quiz q9-1…q9-15 | **The answer letter and option length give the key away.** All 15 keys are "b". The correct option is the unique longest in 13 of 15. Its length relative to the longest distractor: q9-5 287 vs 59 (4.9×), q9-7 173 vs 34 (5.1×), q9-13 230 vs 47 (4.9×), q9-14 284 vs 52 (5.5×), q9-3 272 vs 81 (3.4×). `Quiz.tsx` renders options in authored order. A test-wise student scores 87–100 % without reading the content. | My option-length script over `week09.ts`: keys `{"b":15}`, correct option longest in 13/15. The Week 10 and Week 11 reviews raised the same class (W10-F09 Medium, W11-F01 High). Week 10's fix gives 3/3/3/3 with no correct option the unique longest (same script). | Rebalance the keys to about 4/4/4/3. Cut each keyed option to the length of its distractors: move the justification into the explanation and give the distractors their own reasons. Re-run the script, and add the check to the content tests if the lead agrees. |
| S9-N3 | Low | `PredictChecker.tsx` result text | "Your prediction matches" compares with the hard-coded `item.answer`, not with `rec.outcome`. A test pins the key to the record, so this is harmless today, but it is inconsistent with the fail-closed design. | Code. Week 10 compares with `rec.outcome`. | Fix together with S9-N1. |
| S9-N4 | Low | `review.openIssues[2]`; caution 9; workload row "L9 out of class 0.2 h" | **Stale against DECISION_LOG A14.** A14 (2026-10-11) adopted WORKLOAD_ANALYSIS options B+C+E. Week 9 still asks the faculty to decide option E (pre-course installation), and still budgets installation inside Week 9 at 0.2 h with a realistic total of 10.3–11.8 h. The fix commit predates A14, so this is a follow-up, not an error. | DECISION_LOG A14; week09.ts ll.594, 608, 628. | In the A14 revision pass: move install and verify to the Week 0 task, keep only the 15-min verification and smoke tests in L9, update the workload rows and cautions, and drop the faculty open issue. |
| S9-N5 | Low–Med | Workload row "Graduate KerML memo … 1 h"; template §7 | **The graduate memo is under-budgeted (W10-F10 class).** It asks for 6 pp of R87 (≈ 0.4 h), parts (a)–(d), and in part (d) a line-by-line argument, a one-line edit, an asserted constraint, and two checker runs with reports. That is realistically ≈ 1.5 h, not 1 h. | AUTHORING_GUIDE §7 rule 3 (graduate task ≈ 1 h including its reading). | Drop or merge part (b) or the "would the report differ" sub-question of (c), or record ≈ 1.5 h in the cautions. A14 option B may move the task anyway. |
| S9-N6 | Low | worked (c) ¶2 cites R79 sl.167–168; `course.ts` Week 9 readings | R79 is cited for ISQ and SI but is only in `references`, not in the readings. No quiz item depends on it. | `course.ts` l.171. | Register it as a Week 9 extension, or cite R90 sl.17 only. |
| S9-N7 | Low | q9-5, q9-14 | Rule 6 borderline. q9-5 (6 redefined as 8) has the same structure as the advanced block's pc4 (3 redefined as 4, "no network has three and four hubs"). q9-14 restates advanced ¶1 (necessary by default; `all`; no SysML declaration) in a new case. Both are new cases, so this is acceptable, but neither discriminates strongly. | Lesson advanced ¶1–2. | Optional: make q9-5 a satisfiable widening (e.g. [4..6] redefined as [4..8]) and ask which defect it has. |

**Cautions for the faculty and lead (not blockers):** the reference v0.1 skeleton alignment (F04) and the PROVENANCE append (F09) are lead-owned; S06 p.197 (reserved words) is outside the register; and A14 option B (graduate tasks every other week) is not yet reflected in Weeks 9 and 10, which both carry a graduate task. That is a course-level scheduling decision.

## What I verified

- **Build and tests.** `npx tsc -b` is clean (exit 0, with the redesign files present). `npx vitest run src/activities/week09 src/activities/week10 src/content src/lib` gives 8 files, **156/156 pass**.
- **Checker probes** (release 2026-08, one JVM, `tasklist` empty before the run, report written to the scratchpad):

  | Probe | Result | Lesson claim |
  |---|---|---|
  | `disjoint hubs from spokes;` | FAIL, syntax | Agrees |
  | `part def all FastHub` | FAIL, syntax | Agrees |
  | False asserted constraint | PASS, silent | Agrees: not evaluated |
  | HubAndSpoke :> HubVertiport, SpokeVertiport, plus a usage | PASS, silent | Agrees: entailment not detected |
  | [2..4]→[2..6] | PASS + "larger multiplicity upper bound" | Agrees |
  | Scratch copy of pc4 | PASS + the same warning, matching the record | Agrees |

- **Integrity.** All 14 Week 9 files (13 listings plus the instructor memo key) match their records in `validation-report.json` by SHA-256, with the recorded status and diagnostic counts. The predict key equals the recorded outcome class (tested).
- **Heuristics (rule 5).** `shortNameProblem` and `referenceProblems` behave correctly on realistic good input (`< 'PHY-003' >`, `aeroLink . 'PHY-003'`) and bad input (unquoted, `<' PHY-003'>`, `''`, `part`, a doubled `::`). The reference preview passes its own checks (rule 4, tested).
- **Mutation.** Removing the hash-pending guard in `predict.ts` made 2 tests fail. I reverted it, and the diff is empty.
- **Citations re-read.** R87 p.52–53 (Car, necessary versus sufficient), R87 p.62 (cardinalities), R70 sl.4, R90 sl.17. The classifier's a5 explanation and the memo's model answer are consistent with the listing.
- **Workload.** The rows sum to 9.0 h and the lesson is 4,747 words. The realistic totals are disclosed (see S9-N4 and S9-N5).
