# Week 5 authoring notes — Requirement quality, traceability and measures (+ SysML reading micro-lab 1)

Status: self-checked, 2026-10-09; revised 2026-10-11 after the independent review (`_source_cache/review/week05_review.md`, PASS WITH FIXES: 3 major, 9 minor; disposition below). Review status stays `self-checked`. Not committed.

## Files

- `src/content/weeks/week05.ts` — WeekContent (13 blocks, 4 activities, L5, W5-A, 13 quiz items, notes, 9 h workload). Lesson word count 5,815 (schema `lessonWordCount`, after the 2026-10-11 revision).
- `src/activities/week05.activity.tsx` — keys `w05-quality-audit`, `w05-trace-explorer`, `w05-tpm-tracker`, `w05-sysml-reading`.
- `src/activities/week05/` — pure logic `audit.ts`, `trace.ts`, `measures.ts`, `reading.ts`; components `QualityAudit.tsx`, `TraceExplorer.tsx`, `TpmTracker.tsx`, `SysmlReading.tsx`; tests `logic.test.ts` (23), `activities.test.tsx` (7).
  - The reading logic is `reading.ts`, not `sysmlReading.ts`: on Windows the case-insensitive file system resolved `./sysmlReading` to `SysmlReading.tsx`.
- `sysml/week05/aerolink_fleet.sysml` (conformant), `aerolink_tpm.sysml` (conformant), `invalid_missing_unit_import.sysml` (intentionally invalid).

## Pages actually read (via `python -I scripts/source_pages.py`)

| Reading | Pages read | Used for |
|---|---|---|
| R45 (DoD §4.1.4) | 118–119 (whole range) | bidirectional trace, orphans, childless parents, RTM, feasible allocation / tolerance bands |
| R44 (DoD §4.1.3) | 110–117 (whole range) | TPM definition, leading indicators, 15 core categories, TPM hierarchy, four attributes of a good metric, contingency / CBE / WCE / margin |
| R56 (MITRE) | 384–391 (whole range) | traceability definition, change process, 32-knot example, RTM, best practices (may/will, derived reqs, creep, hard-to-test) |
| R15 (SEBoK Measurement) | 528–536 (whole range) | technical measurement (MOE/MOP/TPM), leading indicators, pitfalls, good practices, Primer attributes |
| R14 (SEBoK Req. Mgmt, extension) | 476–480 (whole range) | monitoring metrics (TBD/TBR, not traced), attributes |
| R48 (DoD §4.2.2) | 143–146 | the 13 attributes of good requirements (p.144); now an essential Week 5 reading in course.ts |
| R13 (SEBoK Sys. Req. Def.) | 557–567 (skimmed; read 565–566 closely) | traceability model; requirement verification vs validation |
| R70 (S10 sl.1–17) | whole range | packages, imports, visibility, part/attribute defs, redefinition, multiplicity, definitions vs usages |
| R71 (S10) | sl.18–20 | context only (not cited) |
| R72 (S10) | sl.44 | `:> ISQ::mass` pattern (context only) |
| R74 (S10) | sl.86–91 | short names, value with unit `2000[kg]`, requirement syntax |
| R75 (S10) | sl.92–93 | `objective` keyword (reason for the reserved-word rename) |
| R76 (S10) | grep only | `objective` in use cases (not cited) |
| R79 (S10) | sl.163–168 | ISQ / SI / units |
| R80 (S06 7.1–7.7) | 47–52, 63–65, 72–74, 77 | definition/usage pattern, features, multiplicity defaults (p.73: inherited from subsetted/redefined usages, else [0..*]; [1..1] only under three conditions), short names (p.49), units principle, primitive data types (p.77) |

Syntax was also checked against the installed pilot library files (SI.sysml: `<min>`, `<h>`, `<'km/h'>`, `<dB>`; ISQ re-exports ISQAcoustics with `SoundPressureLevelValue`). That was only to choose names that resolve. The tool decides validity.

Unit classification (W5-F07) is taken from `tools/sysml-pilot-2026-08/kernel/sysml/sysml.library/Domain Libraries/Quantities and Units/SI.sysml`: `h` and `min` are declared under the comment "Units recognized in SI as specified in ISO 80000-1:2009" (lines 88–97), i.e. units accepted for use with the SI, not SI base or derived units; `'km/h'` is declared under "Prefixed units / Speed" as `= km/h` (line 334), a unit built from `km` and `h`, not a coherent SI unit; `dB` is under "Units with special names" (line 56). S10 sl.168 shows only the base units and `newton` and elides the rest ("…"), so it is not cited for min/h. S06's Quantities and Units clause (9.8) is outside the verified register range, so the library file is named in the text instead of a citation.

## SysML check (final run)

```
npm run content:sysml        (FULL run, 2026-10-11, after the last listing change: TPM attribute renamed)
PASS  (expected PASS: OK)  sysml/reference/aerolink_v01_skeleton.sysml
PASS  (expected PASS: OK)  sysml/reference/aerolink_v02_req_structure.sysml
PASS  (expected PASS: OK)  sysml/reference/aerolink_v03_behavior.sysml
PASS  (expected PASS: OK)  sysml/reference/aerolink_v04_full.sysml
PASS  (expected PASS: OK)  sysml/week05/aerolink_fleet.sysml
PASS  (expected PASS: OK)  sysml/week05/aerolink_tpm.sysml
FAIL  (expected FAIL: OK)  sysml/week05/invalid_missing_unit_import.sysml
         ERROR   11:50    Couldn't resolve reference to Element 'min'.
         WARNING 11:50    Should be a measurement reference (unit).
         WARNING 11:50    Bound features should have conforming types
PASS  (expected PASS: OK)  sysml/week06/aerolink_charging.sysml
FAIL  (expected FAIL: OK)  sysml/week06/invalid_usage_redefines_missing_feature.sysml
         ERROR   16:23    Couldn't resolve reference to Feature 'usableEnergy'.
PASS  (expected PASS: OK)  sysml/week08/aerolink_charge_requirement.sysml
PASS  (expected PASS: OK)  sysml/week08/aerolink_if005_allocation.sysml
FAIL  (expected FAIL: OK)  sysml/week08/invalid_wrong_subject.sysml
         ERROR   17:33    Couldn't resolve reference to Element 'chargeTimeToDispatch'.
12 file(s): 9 PASS, 3 FAIL, 0 ERROR. Report: sysml/validation-report.json
```

`sysml/validation-report.json` is therefore current, and `npx vitest run src/lib` (listing hashes) passes.

Probe for quiz q5-13 (scratch copy outside the repo, `aerolink_fleet.sysml` with line 9 `private import ScalarValues::*;` deleted, own report path): FAIL with `Couldn't resolve reference to Type 'Real'` (original line 14), `… 'Integer'` (original line 18) and four follow-on "An attribute must be typed by attribute definitions" errors on those attributes and their redefinitions (original lines 14, 18, 43, 46). No ISQ type or SI unit failed.

On the first run `aerolink_tpm.sysml` used a feature named `objective` and was rejected ("no viable alternative at input 'objective'"), because `objective` is a reserved word. It was renamed `objectiveValue`, and the lesson uses this as a teaching point. The full run above regenerated `sysml/validation-report.json`.

## Design decisions

- **Peer sample.** "Team Kestrel" is FICTIONAL and is defined once, in `trace.ts` (`PEER_SAMPLE`). Worked example (b) and the trace explorer use it. Its NEED/CAP elements are the reference's (same IDs and names, test-asserted). Its requirements are its own and are numbered REQ-STK-901..903 and REQ-SYS-901..905 so that no peer item reuses a reference ID with a different meaning (§7 rule 8; W5-F01). The audit items in `audit.ts` reuse three of them (903, 905, STK-903) and add REQ-SYS-906 (high availability), -907 (block time + reserve) and -908 (grid-power limit with the case's TBD-02/U-002), which are not in the trace extract. Where a revision points to the reference it says so (e.g. "the instructor reference's REQ-STK-005"). A test asserts that no peer or audit requirement ID exists in `referenceUpTo(14)`.
- **Margin.** The DoD definition (R44 p.117) is margin = threshold − WCE, with WCE = CBE + contingency. The reference `week05.ts` records margin = threshold − CBE. Both are computed. The reference data are unchanged, and `logic.test.ts` asserts that the CBE margins equal the reference attributes. The higher-is-better mirror, (CBE − contingency) − threshold, is a course extension.
- **Status rules.** R1 breach (margin < 0), R2 below the alert floor, R3 trend projection below the floor. These rules, the alert floors (1 min, 0.5 dBA, 1 pp) and the contingencies and histories are instructor-authored and FICTIONAL. The TPM-003 floor of 1 pp matches the Week 6 R-002 trigger. Boundary behaviour is pinned by tests: margin 0 is not a breach, and margin = floor is not R2. TPM-002 sits exactly at its floor, so R3 is what flags it.
- **Two childless checks of equal standing (W5-F10).** Check 1 is R45 p.118's own case: a REQ-STK with no REQ child and no `satisfies` link. Check 2 is the course's extension to NEED/CAP (`engineering.ts` `orphansAndChildless`), labelled as a course convention. The trace explorer now has a prediction fieldset for each. At Week 5 the reference shows REQ-STK-007 and REQ-STK-009 under check 1 (resolved by Week 8: PHY-002 and IF-003 satisfy them; test-asserted) and NEED-011 under check 2 (a missing requirement, not a missing link; see reference_model_notes §5). The lesson (worked example (b)) and the answer key now say so; they previously said the reference had "no childless needs".
- **TPM listing.** This is a teaching representation (attribute def + short name `TPM-001`). The lesson states that SysML v2 has no MOE/MOP/TPM construct. The attribute was renamed `turnaroundChargeTime` → `chargeTimeToDispatch` (W5-F09) and the tracker's TPM-001 name is now "Charge time to dispatch threshold"; the reference model still calls TPM-001 "Turnaround charge time" (reference-level change requested below).
- **TPM-001 contingency basis (W5-F05).** Month 9 is now a full-pack charge test on a production-representative pack (end item), after the month-6 surrogate module test, so the fall 0.8 → 0.6 has better evidence behind it (R44 p.117). The tracker table now shows Contingency and Basis columns, and student entries take a basis. A test asserts that no TPM history has a contingency that rises and that TPM-001's month-9 basis is the end item.
- **Workload (W5-F03).** Readings 2.1 h (≈ 31 pp incl. R48 p.143–146), online 1.2 h, quiz 0.2, L5 out of class 1.8, graduate memo 1.0 (R14 ≈ 20 min + design/writing ≈ 40 min), notebook 0.2, in class 2.5 = 9.0 h. A caution records that a realistic total is about 10 h and that the L5 share is compressed. The memo is always read and scored formatively on RB-4.3 with level descriptors in `rubricScope`.
- **dBA.** `SoundPressureLevelValue` with `[dB]` is used, and a doc comment records the A-weighting. This is used as a reading point: the notation cannot express the weighting in the unit.

## Open issues / register requests

1. **Plan citation.** WEEKLY_INSTRUCTIONAL_PLAN B5.1 cites "S12 p.144" and B5.2/B5.3 cite "S12 p.116–118". p.144 is in R48. Resolved by the lead on 2026-10-11: R48 p.143–146 is now an essential Week 5 reading in `course.ts`, so it was removed from the module's `references` and counted in the reading workload.
2. **SEBoK Figure 3 (R15 p.533).** The figure is an image, and its content is not in the extracted text. The module does not describe it. It relies on the RB-4.1 definitions.
3. **Shared change (optional).** Two candidate changes for `engineering.ts`:
   - `orphansAndChildless` could also report REQ-STK without a child REQ or a `satisfies` link (R45 p.118). For now it is implemented locally in `week05/trace.ts`.
   - Optionally, add a `contingency` attribute to the reference TPMs so that the WCE margin lives in the shared model.
4. **Test timing.** Under a full concurrent run, other weeks' RTL tests hit the 5 s default timeout (week04, week07). The Week 5 activity tests set `{ timeout: 20000 }` on their describe block for this reason.
5. **Unrelated breakage seen while verifying.** At the time of the runs, `tsc -b` reported an error only in `src/activities/week07/trade.test.ts(255,16)`. An earlier run also reported a missing temporary file `src/activities/week04/zz_tmp_wordcount.test.ts`. Neither is Week 5 work.

## Independent review disposition (2026-10-11)

| ID | Sev. | Disposition | Where |
|---|---|---|---|
| W5-F01 | major | Fixed. Kestrel requirements renumbered REQ-STK-901..903, REQ-SYS-901..908; NEED/CAP kept as reference items (names asserted equal). Worked (a) no longer traces the airframe to "REQ-SYS-003"; it derives the replacement from CAP-004. Audit a6 moves the reserve to "a new requirement under CAP-004 (REQ-SYS-003 in the reference)". q5-4 rewritten. Rule-8 test added. | trace.ts, audit.ts, week05.ts worked (a)/(b), answer key, facilitation, logic.test.ts |
| W5-F02 | major | Fixed. q5-1 (REQ-STK-007 "no number" false finding), q5-2 (unmanaged TBD, the inverse case), q5-4 (orphan = missing link, childless = missing requirement, the inverse of worked (b)), q5-8 (hover-power margin 6 kW), q5-9 (range series, on track by R3, projection 3.0 km), q5-11 (`reserveShare : Real`, no unit), q5-12 (`vertiports[6]` × nested `chargers[2]` = 12), q5-13 (deleting the ScalarValues import, verified by the tool) are new cases; q5-10 (b) now uses rotor tip speed. q5-8/q5-9 arithmetic is computed in a test. | week05.ts quiz, logic.test.ts |
| W5-F03 | major | Fixed. Memo 1.0 h, online 1.2 h, readings 2.1 h (R48 added), L5 out of class 1.8 h; total exactly 9.0 h; caution says the realistic total is ≈ 10 h and what to move if teams run over. Memo always read, scored on RB-4.3 with descriptors; informs RB-16.1. | week05.ts workload, cautions, assignment |
| W5-F04 | minor | Fixed. q5-5 key and the advanced block cite R45 only for "correctly / feasibly allocated" and label the sequential-budget arithmetic as course reasoning. | week05.ts q5-5, w5-advanced |
| W5-F05 | minor | Fixed. Month-9 basis is an end-item pack test; tracker shows Contingency and Basis; test asserts non-increasing contingency. | measures.ts, TpmTracker.tsx, week05.ts worked (c) |
| W5-F06 | minor | Fixed. Text says WCE 64.0, margin 1.0, R3 projection 1.2 dBA; test computes it with `assessPoint` and pins the lesson text (and rejects "0.7 dBA"). | week05.ts w5-advanced, logic.test.ts |
| W5-F07 | minor | Fixed. h/min described as units accepted for use with the SI, km/h as built from km and h (not coherent SI), with the library file as the evidence; sl.168 no longer cited for min/h. | reading.ts t11/t12/hint, week05.ts w5-sysml, worked (d) table, answer key |
| W5-F08 | minor | Fixed. S06 p.73 conditions stated; `part battery` (line 20, default 1..1) vs `part redefines battery` (line 45, inherited) used as the example; t5 explanation adds the default. | week05.ts w5-sysml, worked (d), reading.ts |
| W5-F09 | minor | Fixed. `turnaroundChargeTime` → `chargeTimeToDispatch`; tracker name "Charge time to dispatch threshold"; full validator run. Reference TPM-001 name still "Turnaround charge time" (reference-level request). | aerolink_tpm.sysml, measures.ts, week05.ts worked (d) |
| W5-F10 | minor | Fixed. Check 1 (R45, REQ-STK) and check 2 (course, NEED/CAP) presented with equal weight; REQ-STK prediction ticks added; activity test predicts check 1 on the reference. | trace.ts, TraceExplorer.tsx, week05.ts w5-trace, worked (b), activity instructions, activities.test.tsx |
| W5-F11 | minor | Fixed. `{R80, '49'}` added to w5-sysml citations; references R80 "49–77"; Figure 3 credited to Roedler et al. 2010 with Roedler and Jones 2005 as the text citation. | week05.ts |
| W5-F12 | minor | Fixed. A "shall have / be made of / fitted with …" requirement with no vague term gets an inspection pointer instead of "No number or TBD"; vague list extended so realistic bad "shall have an intuitive / comfortable … " inputs still get the number warning; the UI labels lints "advisory only: a signal may be false". Tests cover both directions. | audit.ts, QualityAudit.tsx, logic.test.ts |
| Lead item | — | Reference "no childless needs" corrected: the lesson and key now name NEED-011 as the reference's one childless need, found by the audit, a missing requirement. | week05.ts worked (b), answer key, cautions |

Mutation evidence (each applied alone to the working tree, `npx vitest run src/activities/week05/logic.test.ts`, then restored; all 23 pass after restore): M1 TPM-001 month-9 basis back to "Supplier charge-curve analysis" → 1 failed; M2 month-9 contingency 0.9 (> month 6) → 2 failed; M3 advanced text back to "trend projection 0.7 dBA" → 1 failed; M4 peer REQ-SYS-903 renamed REQ-SYS-003 → 3 failed; M5 audit a6 back to REQ-SYS-007 → 1 failed; M6 lint inspection path disabled → 1 failed; M7 lint inspection path ignoring vague terms → 1 failed; M8 q5-8 key text "15 kW" → 1 failed.

## Reference-level requests (not edited here)

- `src/model/reference/week05.ts` TPM-001 name: "Turnaround charge time" → "Charge time to dispatch threshold" (and the same in `sysml/reference/aerolink_v04_full.sysml` `attribute <'TPM-001'> 'Turnaround charge time'` and `sysml/reference/README.md`), so the reference matches the Week 5 listing and tracker.
- `src/model/reference/week04.ts` REQ-STK-005 rationale still says the 5 min is "rotor stop, safety check, connection and disconnection, with deplaning and boarding overlapping the charge"; under A-007 it is passenger handling and positioning off the charger (already listed in reference_model_notes §3). q5-5 uses the A-007 reading.
- NEED-011 needs a disruption-notice REQ-STK (reference_model_notes §5). When it is added, update the Week 5 counts ("20 of 20", "one childless need") and the activity test that expects NEED-011 under check 2.
