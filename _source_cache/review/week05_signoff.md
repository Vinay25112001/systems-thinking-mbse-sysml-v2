# Week 5 sign-off pass: Requirement quality, traceability and measures (+ SysML reading micro-lab 1)

Reviewer: Independent AI reviewer (Claude), sign-off pass. Date: 2026-10-11.

**Inputs**
- First review `_source_cache/review/week05_review.md` (W5-F01..F12: 0 critical, 3 major, 9 minor).
- Author record `learning-studio/docs/authoring/week05_notes.md`, verified against the code and sources, not trusted.
- Material: `src/content/weeks/week05.ts`, `src/activities/week05.activity.tsx`, `src/activities/week05/*`, `sysml/week05/*`.
- Shared state since the first review: DECISION_LOG W8 as revised (A-007: 25 min = 5 min pad work + 20 min charge, boarding overlapping, two pads per charger) and W9 (NEED-011 is the reference's deliberate childless need); reference TPM-001 renamed "Charge time to dispatch threshold" (`b2a6540`); `course.ts` Week 5 readings now include R48 p.143–146; RB-16 graduate-task note (ASSESSMENT_RUBRICS l.191, DECISION_LOG W7).

No course or app file was left modified. One mutation and two temporary probes were applied and removed; afterwards `git diff --stat` on `src/activities/week05`, `src/activities/week07`, `src/content/weeks/week05.ts` and `sysml/` was empty. The only working-tree changes are another session's Week 8 edits (`src/activities/week08/*`, `week08.ts`), present before this pass and untouched by it.

## Verdict: **SIGN-OFF**

All three majors and all nine minors from the first review are resolved, each checked against code, tests, sources or the tool. No new critical or major finding. Three new minors and one observation are listed below; none blocks.

## Tool runs (from `learning-studio/`)

| Command | Result |
|---|---|
| `python -I scripts/check_sysml.py sysml/week05 <scratch probe dir> --report <scratch>` (one run; no other Java process running) | Pilot 2026-08 (kernel 0.62.0). `aerolink_fleet` PASS, `aerolink_tpm` PASS, `invalid_missing_unit_import` FAIL as expected: `ERROR 11:50 Couldn't resolve reference to Element 'min'` + 2 warnings. Matches worked (d) and the notes. |
| same run, q5-13 probe (`aerolink_fleet.sysml` with line 9 `private import ScalarValues::*;` deleted, scratch copy) | FAIL: `Couldn't resolve reference to Type 'Real'` (13:28), `… 'Integer'` (17:21), plus 4 × "An attribute must be typed by attribute definitions" (13, 17, 42, 45). With the line shift these are original lines 14, 18, 43, 46. No ISQ type or unit failed. **The q5-13 key is correct.** |
| `npx tsc -b` | clean (exit 0) |
| `npx vitest run src/activities/week05 src/activities/week07 src/content src/lib` | **7 files, 141 tests passed** |

## Disposition of the original findings

| ID | Sev. | Status | Evidence |
|---|---|---|---|
| W5-F01 ID collisions | major | **RESOLVED** | Kestrel's requirements are REQ-STK-901..903 and REQ-SYS-901..908 (`trace.ts` PEER_SAMPLE, `audit.ts`). NEED/CAP keep the reference IDs and names (checked against `week03.ts`). REQ-SYS-904's text is identical to reference REQ-SYS-005, as the lesson says. Worked (a) now derives the replacement from CAP-004. a6 points to "REQ-SYS-003 in the reference" by name. q5-4 is re-cased. The rule-8 test (`logic.test.ts` l.32) checks against `referenceUpTo(14)`. |
| W5-F02 quiz answered by lesson | major | **RESOLVED** | q5-1 (REQ-STK-007, "no number" false finding), q5-2 (unmanaged TBD), q5-4 (orphan = missing link, childless = missing requirement), q5-8 (hover power), q5-9 (range series), q5-10(b) (tip speed, not in `w5-advanced`), q5-11 (`reserveShare : Real`), q5-12 (nested `chargers[2]` in `vertiports[6]`) and q5-13 (ScalarValues import) are new cases. None is answered verbatim by the lesson. See the observation on q5-12. |
| W5-F03 workload | major | **RESOLVED** | 2.5 + 2.1 + 1.2 + 0.2 + 1.8 + 1.0 + 0.2 = 9.0 h. Readings: R45 2 + R56 8 + R15 9 + R44 8 + R48 4 = 31 pp, which is 2.07 h at 15 pp/h. The memo is budgeted at 1 h (R14 ≈ 20 min + 40 min). The caution states that a realistic total is ≈ 10 h and that L5 is tight, with a fallback. The memo is "always read" and matches the RB-16 note and W7. |
| W5-F04 R45 overclaim | minor | **RESOLVED** | q5-5 key and `w5-advanced` para 3 cite R45 p.119 only for "correctly / feasibly allocated" and the tolerance bands (verified on the page). The budget arithmetic is labelled course reasoning. |
| W5-F05 contingency regression | minor | **RESOLVED** | TPM-001 month 9 is "Full-pack charge test on a production-representative pack (end item)", with contingency 0.8 → 0.6. All three histories have non-increasing contingency (tested). The tracker has Contingency and Basis columns (`TpmTracker.tsx` l.88–89), and student entries take a basis. See W5-S03 for the reference-level echo. |
| W5-F06 0.7 vs 1.2 | minor | **RESOLVED** | Text: WCE 64.0, margin 1.0, R3 projection 1.2 = 1.0 + (1.0 − 0.8). Recomputed; test-pinned. |
| W5-F07 metrology | minor | **RESOLVED** | Verified in `SI.sysml`: h and min are under "Units recognized in SI as specified in ISO 80000-1:2009" (l.89–97), `'km/h' = km/h` (l.334), dB l.56. The lesson, `reading.ts` t11/t12 and the key now say "accepted for use with the SI" and "not coherent". sl.168 is no longer cited for min/h. q5-13(a) cites sl.168 only for "units live in SI", which the slide shows. |
| W5-F08 multiplicity default | minor | **RESOLVED** | `w5-sysml` para 3 states the three S06 p.73 conditions and the inheritance from a subsetted or redefined feature, else [0..*]. Verified on p.73. Worked (d) contrasts `part battery` (l.20) with `part redefines battery` (l.45); the line numbers match the file. |
| W5-F09 TPM naming | minor | **RESOLVED** | The listing attribute is `chargeTimeToDispatch`; the tracker name and the reference TPM-001 are both "Charge time to dispatch threshold" (`week05.ts` reference l.56). The validator passes. |
| W5-F10 two childless checks | minor | **RESOLVED** | Check 1 (R45, REQ-STK) and check 2 (course, NEED/CAP) are presented with equal weight in `w5-trace` para 4 and worked (b). The explorer has a separate prediction fieldset for check 1 (`TraceExplorer.tsx` l.113, l.137). |
| W5-F11 citation bookkeeping | minor | **RESOLVED** | `{R80, '49'}` is in the `w5-sysml` citations. References give R80 "49–77". Figure 3 is credited to Roedler et al. 2010, with Roedler and Jones 2005 as the text citation (R15 p.531–532 checked). |
| W5-F12 misleading lint on a2 | minor | **RESOLVED for the shipped items**; residual heuristic gap is W5-S01 | a2 now gets the inspection pointer, a5 still gets "No number or TBD", and the UI labels the lint "advisory only: a signal may be false". |
| Lead item: "no childless needs" | — | **RESOLVED** | Worked (b) para 3, the answer key and the cautions name NEED-011 as the reference's one childless need: a missing requirement, not a missing link (consistent with DECISION_LOG W9). CAP-005's parents include NEED-011, so "CAP-005 meets it" is correct. |

## New findings

| ID | Sev. | Location | Finding | Evidence | Recommended fix |
|---|---|---|---|---|---|
| W5-S01 | minor | `audit.ts` `lintSignals` vague-term list and presence path; `logic.test.ts` l.199–212 | **The inspection path still fires on realistic vague "shall have" requirements, and then asserts that inspection can verify them (§7 rule 5).** The F12 fix suppresses the path only when one of 21 listed vague words is present. I probed the function verbatim with ordinary bad requirements. The following all got "the criterion is the presence of a named material or feature, which inspection can verify … rather than calling it unverifiable", with no vague-term warning: "shall have a **low** noise signature", "shall have **good** visibility", "shall have **minimal** downtime", "shall have a **long** cycle life", "shall be fitted with a **lightweight** charger", "shall have a **user friendly** interface" (unhyphenated) and "shall have **enough** range". This is the inverse of F12: it steers the auditor *away* from a correct "not verifiable" finding. The test passes only for inputs whose adjective is already in the list. **Why it is minor:** the lint is rendered only for the six fixed calibration items (`QualityAudit.tsx` l.61), and on those it is correct. No student text reaches it today. | Probe output (14 inputs) run in a scratch copy of the function. | Add the common comparatives and evaluatives (low, good, minimal, maximal, long, short, lightweight, enough, user friendly, …). Soften the message to "if the criterion is only the presence of a named feature, inspection can verify it". Add two of the probe strings to the test. Re-check before reusing `lintSignals` on workspace text in a later week. |
| W5-S02 | minor | `docs/authoring/week05_notes.md` "Reference-level requests" and open issue 5 | **The author record is stale against the shared changes.** (a) The TPM-001 rename request is already done (`b2a6540`). (b) The REQ-STK-005 rationale request would change "rotor stop, safety check, connection and disconnection, with deplaning and boarding overlapping the charge" to "passenger handling and positioning off the charger". That contradicts A-007 as revised (W8: 5 min pad work, boarding overlapping the charge), which the current reference rationale already matches. (c) "q5-5 uses the A-007 reading" no longer applies: q5-5's 8-min sequential handling is a team's wrong allocation, and the key's "overlap the steps" is consistent with the revised A-007. (d) Open issue 5's `tsc` error in `trade.test.ts` no longer reproduces. | DECISION_LOG W8; `week04.ts` l.42–46; `tsc -b` clean. | Close (a) and (d). Withdraw (b). Reword (c). No course content change is needed. |
| W5-S03 | minor (reference-level) | `src/model/reference/week05.ts` TPM-001 `basis` | **The reference's TPM-001 basis contradicts the Week 5 tracker.** The reference records CBE 18 min with basis "Supplier charge-curve analysis (FICTIONAL estimate)". The tracker's month-9 point, at the same CBE of 18.0, is an end-item full-pack test, and the lesson leans on that basis for the 0.6 contingency. A student who loads the reference into the workspace sees the old basis, which is the regression F05 removed. | `measures.ts` TPM_HISTORY month 9 vs reference l.57. | Lead: set the reference basis to the end-item pack test (or "see Week 5 tracker"). |

**Observation (not a finding):** q5-12. Worked (d) already says `chargers[2]` "narrows [1..*] to 2 per vertiport", and the Data Sheet has 6 vertiports. The item still tests the nesting reasoning, and its distractors target that reasoning, so this is acceptable.

## Verified items

**Citations re-checked on the page** (via `source_pages.py`)
- R48 p.143: "Poorly written requirements can lead to significant problems in … schedule, cost or performance".
- R48 p.144: the 13 attributes, and "Early development … reduces development time". These are in the Requirements Analysis passage, as the lesson says.
- R45 p.118: "ultimately" addressed; orphan and childless-parent wording.
- R45 p.119: correctly / feasibly allocated, and the tolerance bands.
- R44 p.113: "collected over time … trends and forecasting" (q5-9); leading-indicator quote.
- R44 p.115: system weight TPM hierarchy.
- R44 p.116: four attributes.
- R44 p.117: contingency, surrogate vs end item, "Margin is not allocated", threshold − WCE (q5-8).
- R14 p.478: TBD/TBR count and "not traced to a source" (q5-2, worked b).
- R56 p.385: change process / impact (q5-6).
- R15 p.531–532: leading-indicator composition (q5-10).
- R80 p.49: short names.
- R80 p.73: multiplicity conditions.
- R80 p.77: primitive types Integer and Real vs Quantities and Units, and the units principle (q5-11).
- R79 sl.167–168: ISQ and SI packages (q5-13).
- `course.ts` l.110: Week 5 readings include R48 p.143–146, and the caution reflects it.

**Quiz items q5-1..q5-13**
- Each item has exactly one defensible key.
- q5-1: REQ-STK-007's text is verbatim from reference `week04.ts`, which assigns method inspection, as the key says.
- q5-3: NEED-004 is "Pads not limited by turnaround", consistent with the key.
- q5-5: 20 + 8 = 28 > 25. The key's "overlap the steps" is consistent with revised A-007.
- q5-6: at 63 dBA the CBE margin is −0.5 and the WCE margin is −1.5, so it is negative either way.
- q5-8: 220 − (205 + 9) = 6 kW; the distractor 15 kW is the CBE margin.
- q5-9: 3.5 + (3.5 − 4.0) = 3.0 ≥ floor 2, so on track; distractor (c) is 3.5 − 2.5 = 1.0.
- q5-11, q5-12 and q5-13: lines 14, 18, 46, 49 and 51 match the file.
- q5-13 was confirmed by the tool (above).

**TPM numbers** (recomputed independently from `TPM_HISTORY`)
- TPM-001: WCE 20.0 / 19.5 / 19.1 / 18.6 → margins 0 / 0.5 / 0.9 / 1.4 (R2 × 3, then on track); projection 1.9.
- TPM-002: margins 1.0 / 0.9 / 0.8 / 0.5; projection 0.2 < 0.5 floor, so at risk by R3 only.
- TPM-003: margins 3.0 / 2.4 / 1.9 / 1.5; projection 1.1 ≥ 1, so on track.
- The CBE margins 2.0 / 1.5 / 3.0 equal the reference attributes.
- Student entry 64.4 + 0.8 = 65.2 is a breach.
- Advanced variant: 1.2.

**Trace counts**
- Kestrel: 8 requirements and 9 links (counted); 6/8 = 75 %; orphans REQ-SYS-903 and -905; check 1 none; check 2 NEED-002, CAP-002, CAP-004.
- Reference at Week 5: 20/20; check 1 REQ-STK-007 and -009; check 2 NEED-011 only. All of this is test-asserted, and the reference detail test asserts `childless: ['NEED-011']`. At Week 8 check 1 is empty (test-asserted).

**Mutation (applied, run, reverted)**
- `trace.ts`: check 1 ignores `satisfies` links (removed `&& r.satisfiedBy.length === 0`).
- `npx vitest run src/activities/week05` gave **1 failed / 29 passed**: "reference at Week 5 … two stakeholder requirements without a lower-level child". The Week 8 empty-check-1 assertion caught it.
- Restored from a byte copy. `git diff --stat src/activities/week05` is empty. This mutation is not among the author's M1–M8.

**Other checks**
- Validator: one run; Java was confirmed idle first.
- Charger convention: no retired charger wording in Week 5 (grep for "passenger handling" and occupancy wording found only q5-5's deliberately wrong team allocation). The course-wide wording test in `src/content` passes.

---
Independent AI reviewer (Claude), sign-off pass, 2026-10-11.
