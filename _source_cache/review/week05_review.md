# Week 5 independent review: Requirement quality, traceability and measures (+ SysML reading micro-lab 1)

Reviewer: independent adversarial review (not the author). Date: 2026-10-11.

**Scope**
- `learning-studio/src/content/weeks/week05.ts`
- `src/activities/week05.activity.tsx` and `src/activities/week05/*` (logic, components, tests)
- `docs/authoring/week05_notes.md` (checked, not trusted)
- `sysml/week05/aerolink_fleet.sysml`, `aerolink_tpm.sysml`, `invalid_missing_unit_import.sysml`

**Checked against**
- `course.ts`; `AUTHORING_GUIDE.md` §7 (all eight rules); `schema.ts`
- `ASSESSMENT_RUBRICS.md` RB-3, RB-4, RB-12, RB-16 (incl. the graduate-task note)
- `LABORATORY_AND_CAPSTONE_PLAN.md` Part B L5; syllabus §11–12; `WEEKLY_INSTRUCTIONAL_PLAN.md` Week 5
- Reference baseline `src/model/reference/week04.ts`, `week05.ts`
- Prior reviews `week01`–`week04` (recurring defect classes)

**Sources read** (via `python -I scripts/source_pages.py`, every cited page):
- R45 p.118–119; R44 p.113–117; R15 p.531–536; R56 p.384–390; R48 p.143–144; R13 p.565–566; R14 p.478
- S10: R70 sl.5–17; R74 sl.87–89; R75 sl.92; R79 sl.167–168
- S06: R80 p.49, 63–64, 72–73, 77

No course or app file was edited. Probes ran from a scratch directory outside the repo.

## Verdict: **PASS WITH FIXES**

There are no critical defects.

**What holds up**
- Citation fidelity is high. Every DoD, SEBoK and MITRE page lands, and both quotations are exact.
- The TPM arithmetic is correct and test-asserted (CBE and WCE margins, projections, statuses).
- The trace numbers for the peer sample and the reference are correct and test-asserted.
- The three SysML listings validate exactly as the lesson says, including the error text and line for the invalid listing.
- The SysML reading key is correct for all 14 targets.

**What must be fixed**
- **ID collisions.** The peer-team sample reuses reference IDs with different meanings (rule 8). This makes worked example (a) contradict itself: REQ-SYS-003 is both the booking app and the "landing energy reserve".
- **Quiz items answered by the lesson.** Most quiz items are answered verbatim by the lesson or the activities (rule 6).
- **Workload.** The graduate memo's time budget is implausible and no caution says so (rule 3).

Counts: **critical 0 · major 3 · minor 9**.

## Tool runs (from `learning-studio/`)

| Command | Result |
|---|---|
| `npm run content:sysml -- sysml/week05` | Pilot 2026-08 (kernel 0.62.0). `aerolink_fleet` PASS, `aerolink_tpm` PASS, `invalid_missing_unit_import` FAIL as expected: `ERROR 11:50 Couldn't resolve reference to Element 'min'` + 2 warnings. This matches the lesson and the notes exactly. |
| `npx vitest run src/activities/week05 src/activities/week06 src/activities/week07 src/content` | **8 files, 147 tests passed** (exit 0). |
| `npx tsc -b` | **clean** (exit 0, no output). |

## Findings

| ID | Sev. | Location | Finding | Evidence | Recommended fix |
|---|---|---|---|---|---|
| W5-F01 | major | `trace.ts` `PEER_SAMPLE`; `audit.ts` a1–a6; `w5-worked-audit`, `w5-worked-trace`, `w5-worked-tpm`; q5-3, q5-4, q5-5 | **The "Team Kestrel" peer sample reuses reference IDs with different meanings (§7 rule 8). This creates contradictions inside one example.** Kestrel uses REQ-STK-003 for hub turnaround (reference: weather limits), REQ-SYS-003 for the booking app (reference: landing energy reserve), REQ-SYS-004 for assignment time (reference: weather dispatch hold) and REQ-SYS-005 for the carbon airframe (reference: assignment time). The same worked example (a) then revises REQ-SYS-005 by tracing it "to REQ-SYS-003 (landing energy reserve)", while its own REQ-SYS-003 is the booking app. Audit item a6 says "move the reserve to REQ-SYS-003" in the same activity where a1 *is* REQ-SYS-003. The TPM table then cites "TPM-003 … REQ-SYS-003" in the reference sense. The quiz switches numbering between items: q5-4 uses Kestrel's REQ-SYS-004, while q5-3 and q5-5 use the reference REQ-STK-005 for the same turnaround concept that Kestrel calls REQ-STK-003. | `week04.ts` lines 32, 80, 84, 89 vs `trace.ts` PEER_SAMPLE; `w5-worked-audit` para 3; `audit.ts` a2 and a6 `revision`. | Give the peer sample its own non-colliding IDs (e.g. `KES-REQ-…`, or REQ-SYS-9xx). Update audit.ts, the worked tables, the answer key and q5-4. |
| W5-F02 | major | quiz q5-1, q5-2, q5-4, q5-8, q5-9, q5-11, q5-12, q5-13; q5-10 option b | **Most quiz items are answered verbatim by the lesson or an activity (§7 rule 6).** | q5-1: the carbon-fibre airframe is the same case as worked (a) and audit a2, with the same answer. q5-2: REQ-SYS-010 / TBD-02 / U-002 is audit a4. q5-4: CAP-002 missing link to REQ-SYS-004 is the conclusion of worked (b). q5-8: TPM-003 23.0 / 1.5 / 1.5 points is the worked (c) table. q5-9: the TPM-002 series 1.0/0.9/0.8/0.5 and the projection 0.2 are worked (c). q5-11 and q5-12: `chargeTimeToDispatch = 20 [min]` and `fleet[12]` are worked (d). q5-13: the invalid listing is explained in worked (d). q5-10 (b): "take-off mass growth per review" is a candidate given in `w5-advanced`. | Recast each item as a new case: a different requirement, a different TPM series, a different listing line (e.g. `vertiports[6]`, `reserveShare`), and a different missing link. |
| W5-F03 | major | `workload` | **Graduate time budget is implausible and not flagged (§7 rule 3).** "Graduate leading-indicator memo, including extension reading R14" gets 0.5 h. R14 is 5 pp (≈ 0.33 h at 15 pp/h), which leaves ≈ 10 min to design two leading indicators with characteristic, condition, predicted behaviour, time range and decision, plus a pitfall (template §6). The 5,150-word lesson plus four activities (14-element SysML reading, six-item audit, trace and TPM tracker) gets 0.8 h. `cautions` says nothing; the week total is held at exactly 9.0. | `week05.ts` `workload`; notes "Lesson word count 5,150". | Budget ≥ 1 h for the memo and ≈ 1.2 h for online material and activities. Record the overrun against the 9 h plan in `cautions`, or cut scope. |
| W5-F04 | minor | q5-5 key and explanation; `w5-advanced` para 3 | **OVERCLAIM of R45 p.119.** The source says a lower-level element "cannot have the same or wider tolerance bands" than its parent: a statement about tolerances. The lesson uses it to (a) reject a sequential time budget (20 + 8 = 28 > 25 min) and (b) claim that sub-TPM margins "must sum to no more than TPM-001's". Both are budget-allocation arguments that R45 does not make. | R45 p.119 bullet 3 (quoted in the review notes). | Keep the arithmetic but present it as instructor reasoning ("budget allocation"). Cite R45 only for "correctly / feasibly allocated". |
| W5-F05 | minor | `measures.ts` TPM_HISTORY TPM-001; `w5-worked-tpm` para 3 | **The contingency basis regresses while the lesson cites R44 for the fall.** Month 6 is a "Bench test of one module (surrogate)" with contingency 0.8. Month 9 reverts to "Supplier charge-curve analysis" (no test) with *lower* contingency, 0.6. The lesson calls this "exactly the pattern R44 p.117 describes" (contingency falls as measurements mature). It is the shrink-contingency move that `w5-advanced` warns against. The tracker table shows neither contingency nor basis, so students cannot see it. The status is unaffected: with 0.8, the margin is 1.2 ≥ floor and still on track. | R44 p.117 ("a surrogate item … would warrant a greater contingency … than if the actual end item were used"). `TpmTracker.tsx` table columns. | Make month 9 a more mature basis (e.g. a full-pack test), or keep 0.8. Add Contingency and Basis columns to the tracker table. |
| W5-F06 | minor | `w5-advanced` para 3 | **The arithmetic contradicts rule R3 as implemented.** "With 0.5 dBA … WCE margin would be 1.0 dBA and its trend projection 0.7 dBA". By R3 (`assessPoint`) the projection is 1.0 + (1.0 − 0.8) = **1.2**. The 0.7 comes from reusing the old −0.3 slope. Either way the status is on track. | `measures.ts` `projectedMargin = marginWce + (marginWce − prevMargin)`. | Say 1.2 (or state the different assumption). Add the case to `logic.test.ts`. |
| W5-F07 | minor | `reading.ts` t11, t12; q5-11 explanation | **Metrology slip.** It says "h (hour) is a specific SI unit", "km/h … a derived SI unit" and "min is an SI unit (S10 sl.168)". Hour and minute are non-SI units accepted for use with the SI, and km/h is not a coherent SI derived unit. S10 sl.168 shows neither min nor h (it elides with "…"). | R79 sl.168 text. | Say "declared in the SysML `SI` library package". Cite the library file or the S06 Quantities clause, not sl.168. |
| W5-F08 | minor | `w5-sysml` para 3 | **The multiplicity default is overstated.** "Parts, attributes and items owned by a definition or usage default to exactly one (S06 p.73; S10 sl.12)". S06 p.73 adds a condition: [1..1] applies only when the usage has **no explicit subsettings or redefinitions**. Otherwise it inherits from the feature it subsets or redefines, else [0..*]. Every usage in the second half of the listing is a redefinition. | R80 p.73 conditions 1–3. | Add the condition. Point at `part redefines battery` as a case where the multiplicity is inherited. |
| W5-F09 | minor | `aerolink_tpm.sysml` l.20; `measures.ts` TPMS[0].name | **Naming conflates turnaround with charge time.** The TPM-001 attribute is `turnaroundChargeTime` ("Turnaround charge time"). The lesson carefully separates the 25-min turnaround (REQ-STK-005) from the 20-min charge (REQ-SYS-001 / MOP-002), and worked (a) faults Kestrel for exactly this blur. | Lesson worked (a) para 4; quiz q5-5. | Rename it `chargeTimeToDispatch` / "Charge time to dispatch threshold". Re-run the validator. |
| W5-F10 | minor | `w5-trace` para 4; `TraceExplorer` predictions | **The source's definition becomes the "supplementary" check (rule 7).** R45 defines a childless parent as a *higher-level requirement* not flowed down. The course's primary rule applies it to NEED/CAP, and the source's own case (REQ-STK without child) is "supplementary" and not part of the student prediction task. The course convention is labelled, so this is minor. | R45 p.118. | Present both checks as equal. Include REQ-STK in the prediction ticks. |
| W5-F11 | minor | `w5-sysml` `citations`; `references`; `w5-measures` | Citation bookkeeping: (a) **S06 p.49** is cited inline for short names, but it is absent from the block's `citations` array and from `references` (R80 "63–77"). (b) SEBoK Figure 3 is described as "after Roedler and Jones". The figure caption credits Roedler et al. 2010; Roedler and Jones 2005 is the text citation. | R80 p.49; R15 p.532–533. | Add `{R80, '49'}`. Say "Figure 3 (Roedler et al. 2010)". |
| W5-F12 | minor | `audit.ts` `lintSignals` on a2 | **Misleading lint on the "false finding" item.** For "The aircraft shall have a carbon-fibre airframe", the mechanical lint prints "No number or TBD: check that a measurable criterion exists". The key's teaching point is that this requirement is verifiable by inspection. The lint nudges students towards the false "not verifiable" finding the item is designed to catch. | Lint rule `!/\d/.test(text)`. | Suppress the number check when the requirement names a material or feature checkable by inspection. At minimum, label the lint "advisory; may be a false signal". |

**§7 rule check**

| Rule | Result |
|---|---|
| 1 (recorders) | n/a: no Week 5 activity writes to the workspace. |
| 2 | ✓: `rubricScope` names RB-16.1. |
| 3 | ✗ (F03). |
| 4 | ✓: the reference trace and the CBE margins pass the tool's checks in tests. |
| 5 | Lint is advisory only (F12). |
| 6 | ✗ (F02). |
| 7 | Partly (F10); the RB-4.1 and margin conventions are labelled. |
| 8 | ✗ (F01). |

## Citation table

| Claim / location | Citation | Verdict | Evidence |
|---|---|---|---|
| 13 attributes; poorly written requirements raise risk | R48 p.143–144 | OK | p.144 bullet list (13 items); p.143 "Poorly written requirements can lead to significant problems…" |
| Requirement verification vs validation; methods | R13 p.566 | OK | "Assessing the Requirements" section |
| Traceability model at project start | R13 p.565 | OK | "Defining a traceability relationship model at the beginning…" |
| Quote "Poorly written requirements make traceability difficult because the real meaning is often lost." | R56 p.389 | OK (exact) | Verbatim |
| may/will, derived requirements, creep, hard-to-test | R56 p.389–390 | OK | "Best practices" list |
| Definition, two-way flow, 32 knots, change process | R56 p.384–385 | OK | |
| RTM links, extendable to tests | R56 p.387–388 | OK | |
| Bidirectional, orphan, childless parent; quote | R45 p.118 | OK (exact quote) | |
| RTM; traceable, correctly and feasibly allocated | R45 p.119 | OK | |
| Allocation budgets (q5-5) and margin sums (advanced) | R45 p.119 | OVERCLAIM | F04 |
| Technical measurement; MOE/MOP/TPM; fidelity grows | R15 p.532–533 | OK | Figure credited to Roedler et al. 2010 (F11b) |
| Leading indicator definition and composition | R15 p.531–532 | OK | |
| Pitfalls (golden measures, single pass, measurement for its own sake, inappropriate use) | R15 p.535 | OK | Table 1 |
| Good practices (action-driven, timely, relevance) | R15 p.536 | OK | Table 2 |
| TPM definition; quote "TPMs provide leading indicators…" | R44 p.113 | OK (exact) | |
| 15 core categories; Mission, System performance, RAM, Requirements management | R44 p.113–115 | OK | Table 4-2 (Cybersecurity is a sub-row, so 15) |
| TPM hierarchy (system weight allocated) | R44 p.115 | OK | |
| Actual vs planned; four attributes of a good metric | R44 p.116 | OK | |
| Contingency, CBE, WCE, margin = threshold − WCE; margin not allocated | R44 p.117 | OK | The higher-is-better mirror is labelled as course |
| Monitoring metrics (TBD/TBR, not traced to source) | R14 p.478 | OK | |
| Packages, imports, quotes; visibility, private imports | S10 sl.5–6 (R70) | OK | |
| Definition/usage; implicit definition; features | S06 p.63 | OK | |
| Part def; composite part usage; attribute usage referential | S10 sl.9; S06 p.77 | OK | |
| def keyword; `:`, `:>`, `:>>` | S06 p.72 | OK | |
| Multiplicity default exactly one | S06 p.73; S10 sl.12 | OVERCLAIM (condition omitted) | F08 |
| Units: only the kind on the type, unit with the value | S06 p.77 | OK | |
| ISQ value types; SI units, prefixed and derived | S10 sl.167–168 | OK | |
| "min is an SI unit (S10 sl.168)" | S10 sl.168 | NOT FOUND | min/h are not on the slide (F07) |
| `attribute :>> massReqd = 2000[kg]` | S10 sl.89 | OK | |
| Short names on any element | S10 sl.87, 89; S06 p.49 | OK | p.49 is missing from the citation array (F11a) |
| Redefinition in usages; inheritance by usages | S10 sl.12, sl.15 | OK | |
| `objective` is a keyword (analysis case objective) | S10 sl.92 (R75) | OK | |
| Contingency tied to evidence (advanced) | R44 p.117 | OK | |

## Verified correct

**SysML listings**
- All three listings validate exactly as stated: 2 PASS, 1 expected FAIL at 11:50 with the quoted message.
- The line numbers in worked (d) and in the reading key match the file:
  - package at line 5, imports at lines 7–9, definitions at lines 12–37, usages at lines 40–55
  - targets at lines 12, 13, 18, 20, 29, 30, 33, 40, 41, 44, 50, 51
- The SysML reading key (t1–t14) is correct. The answer key matches `reading.ts`. A test asserts that each token sits on its stated line.

**TPM arithmetic** (independently recomputed)
- TPM-001: WCE 18.6, margin 1.4, projection 1.9, history 0 / 0.5 / 0.9 / 1.4 (statuses at-risk ×3, then on track).
- TPM-002: WCE 64.5, margin 0.5, projection 0.2, at risk by R3. History 1.0 / 0.9 / 0.8 / 0.5.
- TPM-003: WCE 21.5, margin 1.5, projection 1.1, on track.
- No objective is met.
- Student entry 64.4 + 0.8 = 65.2 is a BREACH.

**Trace**
- Peer sample: 8 requirements, 9 links, 6/8 with a parent (75 %).
- Orphans: REQ-SYS-003 and -005. Childless: NEED-002, CAP-002, CAP-004.
- Reference at Week 5: 20/20 with a parent. The supplementary check flags REQ-STK-007 and -009, which are resolved by Week 8 (test-asserted).

**Quiz arithmetic**
- q5-6: at a 63 dBA threshold, the CBE margin is −0.5.
- q5-8: margin 1.5.
- q5-9: projection 0.2.
- Each quiz item has exactly one defensible key. Bloom tags are plausible.

**Sessions and workload**
- Session 1 = 75 min and Session 2 = 75 min (L5 55 + micro-lab 20), as in the weekly plan.
- The 12-measure classification key adds up to 4 MOE + 5 MOP + 2 TPM + 1 non-measure.
- The reading count of 27 pp is correct (R45 2 + R56 8 + R15 9 + R44 8). The workload sums to 9.0 h.

**Assignment and lab**
- The W5-A template covers RB-3.1–3.6 and RB-4.1–4.3.
- The weight statement matches CP2 (RB-3 40, RB-4 20). `rubricScope` names RB-16.1 for the graduate memo.
- The L5 steps match lab plan L5: random draw of 10, AI tagging, ≥ 3 MOE / 5 MOP / 2 TPM.

**Accessibility**
- The TPM chart encodes status by marker shape and text, and has a full table equivalent.
- SysML targets are labelled buttons.
