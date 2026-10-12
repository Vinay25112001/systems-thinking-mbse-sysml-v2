# Week 12 authoring notes — Verification, measures and the digital thread (L12; RID dispositions)

Author: AI author (Claude), 2026-10-11; revised the same day after the independent review (`_source_cache/review/week12_review.md`, REVISE moderate, 18 findings). Status: `self-checked`, pending re-review and faculty review (DECISION_LOG A4). The revision section at the end supersedes any figure above it.

## Files created (only these)

- `src/content/weeks/week12.ts`: the module.
  - 15 lesson blocks, 5,207 words by `lessonWordCount` (about 700 of them in the four tables).
  - 4 activities, lab L12, and assignment L12 (with the graduate model-credibility argument as template section 6).
  - 13 quiz items (Readiness quiz Q11): Understand 1, Apply 4, Analyse 3, Evaluate 5.
  - Instructor notes, a workload of exactly 10 h, and references.
- `src/activities/week12.activity.tsx` registers `w12-thread-explorer`, `w12-trace-audit`, `w12-ver-planner` and `w12-rid-dispositions`.
- `src/activities/week12/`:
  - Pure logic: `thread.ts`, `audit.ts`, `planner.ts`, `dispositions.ts`.
  - Components: `ThreadExplorer.tsx`, `TraceAudit.tsx`, `VerPlanner.tsx`, `RidDispositionLog.tsx`.
  - Tests: `logic.test.ts` (21) and `activities.test.tsx` (5).
- `sysml/week12/`:
  - `aerolink_ver001_charge_time.sysml`: worked example (b). PASS, no diagnostics.
  - `aerolink_moe_mop.sysml`: worked example (c). PASS, no diagnostics.
  - `invalid_method_kind_simulation.sysml`: FAIL as intended. `ERROR 33:12 Couldn't resolve reference to Element 'VerificationMethodKind::simulation'.` and `WARNING 33:12 Bound features should have conforming types`.
- `sysml/instructor/week12/`: not used. The graduate answer key is prose in `instructorNotes.answerKey` and needs no listing.
- This file.

**Workspace writes.** Only the verification planner writes to the workspace. It renders `ProvenanceOwnerFields`, requires valid owner initials, and passes `{ owner, provenance }` into `apply()` (rule 1; component test). The disposition log records the owner and provenance on each entry in its own persistent state, because RIDs are not workspace elements. The explorer and the audit are read-only. The audit's gap dispositions persist per model source under one key, `w12-audit-dispositions`.

**Decoupling.** Week 12 imports nothing from the Week 11 activities, which another session may still be editing. `dispositions.ts` has its own small regexes, modelled on `week11/rids.ts`.

## Pages read (`python -I scripts/source_pages.py …`)

| Reading | Pages | Used for |
|---|---|---|
| R75 | S10 sl.96–99 (full) | Verification case definition and usage; VerdictKind; PassIf; subject binding; test configuration; individuals |
| R49 | p.149–151 (full) | DoD verification and validation; the four methods; the verification matrix; FCA/SVR; repeating verification after a design change. p.151 (early and final validation, transition) was read but is not cited |
| R58 | p.433–438 (full) | MITRE definitions (p.433); integrated V&V (p.434); M&S and integrated testing (p.437). p.435 is a figure and p.438 is references |
| R23a | p.634–640 (full) | Definitions, verification action, differences from validation, strategy, artefacts, techniques table, pitfalls and practices |
| R30 | p.1394–1395 (full) | Only p.1394 is cited. See the R30 caution below |
| R23b | p.646–648 | Validation definition; Table 2 (the baseline differences) |
| R64 | p.475–483 (full) | Graduate task and answer key |
| R84 | S06 p.172–177 (PDF indices) | §7.24 Verification Cases sits on p.173–176 inside R84's verified range ("7.23 Analysis Cases" p.170–177): verdict meanings, typical steps, verify as a subrequirement of the objective, VerificationMethod with inspect/analyze/demo/test |
| R78 | S10 sl.147–150 | sl.149 ParametersOfInterestMetadata (#moe, #mop) |

**R30 (declared exception).** `readings_verified.txt` records "REFERENCE LIST STARTS ON p.1395". The article starts mid-page on p.1394, after the reference list of the previous article. p.1395 has the digital-twin paragraph, then references. The lesson cites p.1394 only. It does not repeat SEBoK's "SysML 2.0" as the name of a final standard (AUTHORING_GUIDE §2).

**Planning documents read.**
- `course.ts` Week 12.
- WEEKLY_INSTRUCTIONAL_PLAN Week 12.
- LABORATORY_AND_CAPSTONE_PLAN C.2, C.5, the L11 and L12 rows, and B.4–B.6.
- ASSESSMENT_RUBRICS RB-4, RB-8, RB-9, RB-10, RB-16 (with the W7 graduate note) and RB-17.
- DECISION_LOG W7 and W9.
- WORKLOAD_ANALYSIS.md.
- Reviews `week08_review.md` and `week09_review.md`.
- `week05.ts` (trace and measures), `week10.ts` (in full) and `week11.ts` (the RID form).
- `sysml/reference/README.md` and `aerolink_v04_full.sysml` (Verification and Measures packages, measures dependencies).
- `docs/authoring/reference_model_notes.md`.
- `src/model/engineering.ts` and `src/model/reference/week04.ts` and `week12.ts`.

**Read, but outside the register, so not cited.**
- S13 (MITRE) p.286, the reversed V&V sentence. I confirmed it in `_source_cache/se_guide_book_interactive.txt` ("fulfills the users' needs (verification) and all of the defined requirements (validation)").
- The S06 library entries for VerdictKind and VerificationMethodKind (printed p.505–507).

## SysML validation (release 2026-08; one JVM at a time, `tasklist | grep -i java` empty before each run)

1. **Partial run:** `python -I scripts/check_sysml.py sysml/week12 <scratch>/w12probe --report <scratch>/w12probe/report.json` covered the 2 lesson listings and 18 probes. Both listings PASS with no diagnostics. The probe results are in the table below. "MISMATCH" lines in that run only mean that probe files are not named `invalid_*`.
2. **Full run after the final listing change:** `npm run content:sysml` regenerated the canonical `sysml/validation-report.json` (timestamp 2026-10-12T00:37:53Z).
   - 49 files: 32 PASS, 17 FAIL, 0 ERROR.
   - Every FAIL is an `invalid_*` file, and every `invalid_*` file FAILs, checked from the report.
   - The run included the `week11/` files of a concurrent author, and they matched their expectations.
3. `npx vitest run src/activities/week12 src/content src/lib`: 5 files, 116 tests, all pass. That includes `src/lib/sysml.test.ts`, which checks that every lesson listing is recorded with its current SHA-256 and the expected outcome.

### Checker probes (scratch files; not in the repository)

| Probe | Construct | Result |
|---|---|---|
| pb01 | `verify charger;` (a part usage) in the objective | FAIL `A requirement must be typed by one requirement definition.` (+ WARNING duplicate `self`) |
| pb02 | Case subject `ChargingSystems` verifying REQ-SYS-002 (subject `EVTOLAircraft`) | PASS, no message |
| pb03 | `return verdict : Boolean = …` | PASS, no message |
| pb04 | `return verdict : VerdictKind = m <= limit;` (a Boolean) | PASS, WARNING `Bound features should have conforming types` |
| pb05 | `PassIf(m >= maxChargeTime)` (reversed) | PASS, no message |
| pb06 | `VerificationMethodKind::simulation` | FAIL `Couldn't resolve reference to Element 'VerificationMethodKind::simulation'.` (basis of the invalid listing) |
| pb07 | Case with no objective and no verify | PASS, no message |
| pb08 | `verify LatencyLimit;` (a requirement definition) | FAIL `Couldn't resolve reference to Feature 'LatencyLimit'.` |
| pb09 | `verify` outside the objective | FAIL syntax (`no viable alternative at input 'verify'`, cascade) |
| pb10 | Usage `subject s :> aircraft` (EVTOLAircraft) for a definition whose subject is `ChargingSystems` | PASS, no message |
| pb11 | S10 sl.97 form `PassIf(r1m(chargingSystem = s, measured = m))` with an `in` parameter on the requirement | PASS, no message |
| pb12 | `#moe part def Fleet;` | FAIL `Cannot annotate PartDefinition` |
| pb13 | `#moe part fleet : ChargingSystems;` | FAIL `An occurrence, item or part must be typed by occurrence definitions.` |
| pb14 | Case with no verdict | PASS, no message |
| pb15 | `VerdictKind::partial` | FAIL `Couldn't resolve reference to Element 'VerdictKind::partial'.` |
| pb16 | `objective { satisfy 'REQ-SYS-001' by charger; }` | PASS, no message |
| pb17 | `@VerificationMethod { kind = (…::analyze, …::test); }` | PASS (not taught) |
| pb18 | No `import VerificationCases::*` | FAIL `Couldn't resolve reference to Type 'VerdictKind'.` (+ cascade) |

## Design decisions

- **V&V convention (revised, F03).** The course convention follows MITRE p.433 (RB-10.1); DoD p.150 validates against stakeholder performance requirements, like SEBoK. The SEBoK differences are taught as differences of baseline and level, not merged: R23a p.639 says validation "provide[s] evidence for the satisfaction of (system and/or stakeholder) requirements", and R23b p.648 Table 2 makes system design the verification baseline (rule 7).
- **Method names kept apart.** DoD examination, SEBoK inspection and SysML `inspect` are named separately. Simulation is recorded as `analyze`, with the simulation described in the doc; the invalid listing shows why.
- **Verification case listing.** It is adapted from v0.4 in three ways. It uses a definition plus a usage (S10 sl.98). The sample size is bound in the usage, not the definition (the Week 9 review's defect class). The `error` verdict is computed from a recorded flag. The reference v0.4 is unchanged.
- **"11-link thread".** The lesson says "11-step thread" and explains it: 11 elements, 10 hops, and steps 9–11 attach to earlier elements. This is how `threadsFrom` works.
- **Audit counting rules.** They are stated in the export (`audit.ts` RULES). The audit separates all REQ, REQ-STK and REQ-SYS, and adds RB-9.1 (upward trace through requirement chains; NEED → STK) and RB-9.2 (REQ-SYS with a satisfy and a recorded `method`).
- **"Verified" in the audit means "has a VER".** It does not mean a pass verdict. The lesson does not state this outright, because q12-9 tests that inference; the counting rules state the definition.
- **Planner heuristics** (each cited in the message):
  - Untestable criterion: vague term, circular wording, no number, no comparison.
  - The criterion's limit differs from the requirement's (same unit).
  - Inspection of a performance or measured quantity.
  - Demonstration with a measured quantity (s, min, h, dB, kW, km, kt; % is excluded because it usually counts cases).
  - Test of a long-horizon or every-case requirement (a warning).
  - The method differs from the method recorded on the requirement (a warning).
  - Verdict conditions are missing, inconclusive equals fail, or a TBD is ignored in the inconclusive condition.
  - The subject has no element ID; the environment or level is missing.
- **Rule 4.** All 11 reference VERs pass with no warning (test).
- **Rule 5.** Realistic bad inputs are each flagged (tests): a datasheet "inspection", a demonstration of a latency percentile, a 22 min limit, "quickly enough", a circular criterion, a TBD ignored in the inconclusive condition.
- **Disposition form** (course convention): accept, accept with modification, reject or defer. The screens are informed by RB-17 read from the owner's side. Rejecting a major RID requires a note that it was confirmed with the reviewer or instructor. A major RID may not be deferred past CP5 (the Week 11 severity scale). The model log (`MODEL_DISPOSITIONS`, Team Kestrel / Team T4, FICTIONAL) passes the screens (test).

## Reference numbers used in the lesson (reproduced by `logic.test.ts`)

`referenceUpTo(12)`:
- 204 elements and 381 links.
- Parent: 20/20. Upward trace: 20/20. NEED → STK: 11/11.
- Satisfied: 12/20 (REQ-SYS 10/10; REQ-STK 2/10, namely REQ-STK-007 by PHY-002 and REQ-STK-009 by IF-003).
- Verified: 11/20 (REQ-SYS 10/10; REQ-STK 1/10, namely REQ-STK-007 by VER-011).
- RB-9.2: 10/10.
- Orphans: none. Childless: NEED-011.
- 26 complete threads from 10 stakeholders. STK-008, 011, 012 and 013 stop at step 1. STK-005 has 6 threads, 4 of them complete.
- Thread 1, hop by hop: step 4 = REQ-SYS-001 derives-from REQ-STK-005 derives-from CAP-003; step 9 = VER-001 verifies REQ-SYS-001; step 10 = MOP-002 measures REQ-SYS-001; step 11 = R-001 affects CAP-003.


## Revision after the independent review (2026-10-11)

### Finding → fix → evidence

| Finding | Fix | Evidence |
|---|---|---|
| F01 longest-option cue, no *d* key | Every key shortened to its decisive clause; distractors lengthened or shortened so that the key is never the longest; keys rebalanced | Scratch script over `week12.quiz`: keys a 3, b 3, c 3, d 4; the key is the longest in 0 of 13 items; key length rank (1 = longest) is 2 in 4 items, 3 in 5 and 4 in 4 |
| F02 "REQ-STK validated against MOEs by design" | Claim removed from worked example (a), worked example (d), q12-11 and the RID-T4-02 model disposition. New rule stated: a REQ-STK counts as verified directly or through a verified child requirement (evidence, not proof). The audit reports this (9 of 10) and lists REQ-STK-009 (demonstration recorded, no VER, no child) as a gap. New misconception added | `logic.test.ts` "reproduces the reference numbers" (gaps `childless:NEED-011` and `unverified-stk:REQ-STK-009`; 9/10). Reference query: STK-001 and 004 analysis; 002, 005, 008 and 010 test; 003, 006 and 009 demonstration; 007 inspection. No MOE measures a REQ-STK |
| F03 DoD/MITRE label | w12-vv ¶3–4, advanced ¶3, misconception 1, template §2 and cautions now say "course convention, following MITRE p.433; DoD p.150 validates against stakeholder performance requirements" | R49 p.150 and R58 p.433 re-read |
| F04 disposition screens pass bad input | Change and evidence reject future or conditional tense. Evidence must be a result someone can look up (counts, n of N, %, link ID, line, commit, verdict, PASS/FAIL). "Recorded the RID" is not a change. Bare REQ IDs dropped from CRITERION. Confirmation needs "confirmed/agreed … instructor/reviewer". A major deferral must say "by the CP5 submission" or Week 12–14, with no after/if/otherwise | Tests D1, D2, D7, D3 and D4 fail the screens; the five model dispositions and a major deferral "by the CP5 submission" pass |
| F05 planner rejects good plans | Vague words split: judgement words always fail; hedge words (correctly, reliably, quickly …) fail only when there is no number and no comparison. CIRCULAR fires only when there is no unit quantity and no count limit. A demonstration with a measured quantity is a warning that cites R49 p.149 and the statistical exception of R23a p.639. ENT- and EXT- subjects allowed | Tests G1–G7, including the MTTR demonstration and REQ-SYS-004's 30 min window, give no error |
| F06 planner passes bad plans | Warning when the subject names none of the requirement's satisfiers (from the model). Pass and fail bounds must lie on the correct side of the requirement's limit and equal it. Inconclusive may not repeat a fail bound. Criterion bounds in the requirement's direction must equal its value, which catches allowances. "well" is a judgement word | Tests B1 (warning) and B2, B3, B4, B5, B6 (errors); all 11 reference VERs still pass with no warning (rule 4) |
| F07 "one feature" claim false | Both conformant listings, and the invalid one, adopt S10 sl.96–97: the requirement takes the measured value as an `in` parameter asserted equal to the subject's MOP, and PassIf calls the requirement. Worked examples (b) and (c), vercase ¶3, the probe table and the answer key updated. Reference v0.4 keeps the short form (noted) | Partial run: both listings PASS with no messages; the invalid listing FAILs at 34:12 as intended. New probes below |
| F08 rubric claim | Caution, rubricScope, deliverable, worked example (e) and continuity now say that RB-11.6 scores dispositions at CP5, with L12 feedback formative against it. Old open issue 4 withdrawn | ASSESSMENT_RUBRICS RB-11 row 11.6 |
| F09 R84/R78 register gap | R84 p.173–176 described as a Week 12 reading under DECISION_LOG A14 (registration pending). R78 sl.149 labelled "a Week 13 slide read ahead" and budgeted | Register requests below |
| F10 audit misses R45's childless parent; counts not active; no model identity | New gap kinds: `childless-stk` (REQ-STK with no child requirement and no satisfier, R45 p.118) and `unverified-stk`. Childless NEED/CAP labelled a course extension. Active element and link counts. FNV-1a digest of the sorted active IDs and links, a timestamp and a per-requirement coverage table in the export | Tests: a new REQ-STK with only a parent raises both gaps; retiring PHY-008 gives 203 elements, fewer links and a new digest; export regexes |
| F11 rule 6 and Bloom | q12-2 re-cased: an operational REQ-STK-002 measurement is verification by the course convention, while DoD would call it validation (Analyse). q12-5 re-cased: error, not inconclusive, for a wrong meter set-up after TBD-02 closed. q12-8 re-cased: reversed PassIf on REQ-SYS-008, fixed by the S10 pattern (Apply). q12-12 re-cased: a RID whose rejection would be wrong | Quiz Bloom levels: Understand 1, Apply 4, Analyse 3, Evaluate 5 |
| F12 workload | Lesson trimmed to 4,901 counted words. Workload rebuilt (table below) to include the RID review and behaviour finalisation. The graduate task is optional this week under option B | `lessonWordCount` 4,901; workload sum 10.0 |
| F13 L13 behaviour pass | RID-T4-04 now reads "by the CP5 submission (Week 14), owner RP" | MODEL_DISPOSITIONS |
| F14 hop types | Caution: 7–9 of the 10 types, depending on the thread; thread 1 has 11 links | `threadsFrom` uses derives-from, refines (optional), allocated-to, performs, flows-to, verifies, measures, and affects or mitigates |
| F15 predict-first, NaN, vague gap disposition | Compute is disabled until both predictions are 0–100 %, so NaN cannot occur. A gap disposition needs an owner or a tracking token, and "at some point" or "look into" is rejected | Component test (disabled until both parse); `predictionOk` and `dispositionProblem` tests |
| F16 in-class over-scoped | Plan three cases and model one in class; model two out of class (lab step, Session 2, lab block) | — |
| F17 R30 overclaim | The q12-10 explanation and advanced ¶1 mark "only as true as its links" as instructor reasoning from R30 p.1394 | R30 p.1394 re-read |
| F18 "to CP5" vs "before CP5" | Week 12 uses "by the CP5 submission" in q12-13, the screens and the model log. Week 11 still says "fix before CP5" (week11.ts l.180, rids.ts l.18): shared change requested | — |

### New checker probes (release 2026-08, 2026-10-11; one JVM; scratch files)

| Probe | Construct | Result |
|---|---|---|
| pr01 | Requirement call in PassIf with a misspelt parameter name | FAIL `Couldn't resolve reference to Feature 'chargeTimeActal'.` + `Must correspond to one input parameter of the invoked type` |
| pr02 | Requirement call without the measured value | PASS, no message |
| pr03 | Comparison reversed inside the requirement (S10 form) | PASS, no message |
| pr04 | Natural passed for the DurationValue parameter | PASS, WARNING `Bound features should have conforming types` |
| pr05 | `verify r1; verify r2;` with different requirement subjects (the reviewer's q18) | PASS, no message |

Full run after the last listing change: `npm run content:sysml` reported 50 files: 33 PASS, 17 FAIL, 0 ERROR, 0 mismatches (report 2026-10-12T01:33:58Z; it includes concurrent authors' files).

### Workload (10.0 h, every student)

| Item | h |
|---|---|
| In-class sessions | 2.5 |
| Core readings, narrowed: S10 sl.96–99, R49 p.149–150, R58 p.433–434, R23a p.634–640, R30 p.1394 (12 pp + 4 slides) | 0.9 |
| S06 p.173–176 (R84) + R78 sl.149 | 0.3 |
| Online lesson (4,901 words), explorer, audit practice | 1.0 |
| Quiz Q11 (13 items) | 0.3 |
| RIDs on the assigned team's CP4 model (the lead's line, verbatim, from the Week 11 fix) | 1.5 |
| L12 out of class, including the disposition log and the accepted RID fixes (team-hour check in `cautions`: 12 team-hours) | 3.0 |
| Behaviour finalisation (weekly plan) | 0.3 |
| Notebook, time log, AI statement | 0.2 |

Realistic risk case (several major RIDs, or a behaviour draft far from the CP5 minimum): ≈ 10.5–11 h, recorded in `cautions`. The graduate argument is optional (≈ 1 h if done).

### Register changes needed (the lead runs the scripts)

1. Week 12 readings: add `{ reading: 'R84', pages: '173–176' }` (DECISION_LOG A14) and `{ reading: 'R78', pages: '149' }` (one Week 13 slide cited ahead; otherwise re-anchor q12-7 and the measures block).
2. Weekly plan, Week 12 page count: core is 12 pp + 4 slides, plus S06 (4 pp) and 1 slide. R58 p.435–438 and R49 p.151 become extension.
3. The S06 library pages (printed p.505–507) stay unregistered. Lab plan C.2's "S06 p.540" could become "S06 p.176 (R84)".

### Shared changes needed (not made)

1. `course.ts` Week 12 `graduateTask`: mark it optional (option B), unless the lead's option-B schedule decides otherwise. If a required graduate task is restored, the graduate total is ≈ 11 h.
2. LABORATORY_AND_CAPSTONE_PLAN L12: change "Out 3.5" to 3.0 + 0.3 behaviour, and the acceptance wording "traverse all 11 link types" to "reach all 11 steps".
3. WEEKLY_INSTRUCTIONAL_PLAN, Week 12 workload note: the RID review (1.5 h) and behaviour finalisation (0.3 h) fall inside the 10 h, and the graduate task is optional.
4. Week 11 severity wording (`week11.ts` l.180, `week11/rids.ts` l.18): use "fixed by the CP5 submission" (F18).
5. The `engineering.ts` step-9 comment says "MOE/MOP measures REQ, CAP or a parent MOE", but the code checks REQ or CAP only.
6. `reference_model_notes.md` §5: the verdict wording comes from S10 sl.96 and S06 p.173 (R84).
7. Reference model (owned by the lead):
   - REQ-STK-009 has no VER and no child (it records demonstration). Add a VER, or record why there is none.
   - The reference VERs re-write comparisons in PassIf, but the lesson now teaches the S10 form. Aligning them is optional.
   - VER-007's "no flight > 17.0 min" allows a flight above the 16 min requirement. The planner accepts it because the bound runs in the opposite direction. Worth a look.

### Remaining open issues

- The full `npx vitest run` was not run (memory constraint); only the targeted runs listed in the report.
- The planner's limit check compares within one unit only (1200 s and 20 min are not converted).
- The q12-5 line between error and inconclusive rests on the course's reading of S06 p.173 ("error = not executed as planned"). The planner and the explanation state that reading.
