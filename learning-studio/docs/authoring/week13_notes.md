# Week 13 authoring notes — Analysis, change impact and model consistency (L13; Exam 2)

Author: AI author (Claude), 2026-10-11. Status: `self-checked`, pending independent and faculty review (DECISION_LOG A4).

## Files created (only these)

- `src/content/weeks/week13.ts`: 15 lesson blocks, **4,162 words** by `lessonWordCount`; 3 activities; lab L13; assignment L13 with the graduate task as template section 7; 12 quiz items; instructor notes; workload exactly 9.0 h; references.
- `src/activities/week13.activity.tsx`: `w13-impact-explorer`, `w13-margin-whatif`, `w13-consistency-review`.
- `src/activities/week13/`: pure logic `impact.ts`, `margins.ts`, `consistency.ts`, `commits.ts`; components `ImpactExplorer.tsx`, `MarginWhatIf.tsx`, `ConsistencyReview.tsx`; tests `logic.test.ts` (25) and `activities.test.tsx` (5).
- `sysml/week13/`: `aerolink_tpm003_landing_reserve_analysis.sysml` (PASS, no messages), `aerolink_r002_risk_causation.sysml` (PASS, no messages), `aerolink_consistency_seeded.sysml` (PASS, 2 warnings, intended), `invalid_dangling_requirement_id.sysml` (FAIL 23:10 as intended), `invalid_risk_level_slide_abbreviation.sysml` (FAIL 15:18 as intended).
- `sysml/instructor/week13/`: not used (the graduate key is prose plus `commits.ts`).

**Workspace writes.** Only the impact explorer writes (one DEC + `affects` links to the impact set). It renders `ProvenanceOwnerFields`, requires `ownerProblem` to pass, and passes owner/provenance into `apply()`; saving is impossible in practice (reference) mode. Component test covers it, including `AI-suggested-reviewed`.

## Pages read (`python -I scripts/source_pages.py …`)

| Reading | Pages | Used for |
|---|---|---|
| R75 (S10) | sl.92–95 | Analysis case definition/usage, steps, trade study |
| R77 (S10) | sl.108–109 | Metadata definitions, annotation, @, nested feature binding |
| R78 (S10) | sl.147–159 (all read) | Cited: 147 (RiskMetadata), 148 (ModelingMetadata), 152 (TradeStudies), 158–159 (cause and effect). 149–150, 153–156 read, not cited |
| R24 (S11) | p.1203–1210 | Resilience definition, taxonomy, process, metrics, requirement pattern |
| R31 (S11) | p.1368–1373 | AI/ML, AI4SE/SE4AI, three challenges (p.1371). p.1372–1373 tables not used |
| R88 (S08) | p.31–36 (PDF indices; printed 17–22) | Commit/DataVersion model, versionedData rule, invariants, branch/tag, mutability table |
| R32 (S11) | p.1374–1376 | Extension pointer only (references p.1374–1375) |

Back-references cited from earlier weeks' readings (listed in `references`): R83 p.168 (satisfy asserts; Week 8 reading) and R49 p.150 (verification repeated after a design change; Week 12 reading). Also read: AUTHORING_GUIDE (§1–§7), WORKLOAD_ANALYSIS, course.ts W13, weekly plan W13, lab plan Part B/B.4–B.6, RB-5/9/14/15/16, DECISION_LOG A9–A14, week10–12 modules/notes, the three reviews, engineering.ts, reference week04–08/12, reference_model_notes.md, v04 SysML (measures, risk, analysis packages), the pilot library files RiskMetadata, CausationConnections, CauseAndEffect (to write correct usages; not cited).

## Checker probes (release 2026-08, 2026-10-11; one JVM, `tasklist` empty before each run; scratch files, not in the repo)

| Probe | Construct | Result |
|---|---|---|
| a01 | Worked example (a) draft | PASS, no message |
| a02 | `power*time + power` (dimension error) | PASS, no message |
| a03 | `in terminalTime = 6 [kW]` | PASS, no message |
| a04 | capacity retained 8.5 (violates the assumption) | PASS, no message |
| a05 | objective reversed (`<=`) | PASS, no message |
| a06 | misspelt result in objective | FAIL `Couldn't resolve reference to Element 'landingFracton'.` + WARNING |
| a07 | `130 [kWh]` | FAIL `Couldn't resolve reference to Element 'kWh'.` + 2 WARNINGs |
| a08 | result declared EnergyValue for a Real | PASS, WARNING `Bound features should have conforming types` |
| a09 | no return, result used | FAIL (2 unresolved references) |
| a10 | subject bound to a part of another definition | PASS, WARNING conforming types |
| a11 | MOP-005 = 0.18 with satisfy REQ-SYS-003 (≥ 0.20) | PASS, no message |
| a12 | calc called with one argument missing | PASS, no message |
| a13 | extra `in` parameter in the usage | PASS, no message |
| a14 | objective limit literal 0.18 | PASS, no message |
| c01 | consistency base | PASS |
| c02 | `18 [s]` for 18 min | PASS, no message |
| c03 | `18 [kW]` for a DurationValue | PASS, no message |
| c04 | `= 18` (no unit) | PASS, WARNING conforming types |
| c05 | satisfy names renumbered ID | FAIL `Couldn't resolve reference …` + `Must reference a requirement.` + `Must reference a constraint.` |
| c06 | duplicate short name in a **different** package | PASS, no message |
| c07 | design value 19 min, satisfy ≤ 18 | PASS, no message |
| c08 | margin as expression | PASS |
| c09 | satisfier of another definition | PASS, WARNING conforming types |
| c10 | contradictory constraint (≤ 18 and ≥ 25) | PASS, no message |
| c11 | attribute redefined twice | PASS, WARNINGs `Duplicate of other owned member name` |
| c12 | seeded listing without the duplicate ID | PASS, no message (5 defects silent) |
| c13 | duplicate short name in the **same** package | PASS, 2 WARNINGs `Duplicate of other owned member name` |
| r01 | risk/causation base | PASS |
| r02 | `LevelEnum::M` (slide abbreviation) | FAIL `Couldn't resolve reference to Element 'LevelEnum::M'.` |
| r03 | probability = 1.5 (Level constraint) | PASS, no message |
| r04 | `#cause attribute` | PASS, WARNING `Duplicate of inherited member name 'self'…` (not taught) |
| r05 | reversed causation | PASS, no message |
| r06 | CausationMetadata probability 1.6 | PASS, no message |
| r07 | `StatusKind::pending` | FAIL unresolved |
| r08 | effect end is a part | PASS, no message |
| r09 | Risk about a definition | PASS, no message |

Full run after the last listing change: `npm run content:sysml` → 55 files, 36 PASS, 19 FAIL, 0 ERROR, 0 mismatches (every FAIL is `invalid_*`, every `invalid_*` FAILs); report 2026-10-12T02:13:28Z (includes concurrent authors' files).

## Design decisions

- **Impact method (course convention).** Dependency table per link type and direction (`impact.ts depends`); hop 1 = dependents; upstream elements reviewed only; hop 2 opened only from elements the student marks must-change. The undirected `impactSet` is shown for comparison. Reproducible numbers (asserted): REQ-SYS-001 naive 9/28/63 of 203; hop 1 FN-006, IF-005, MOP-002, PHY-003, R-008, TECH-001, TPM-001, VER-001; upstream REQ-STK-005; hop 2 from PHY-003 FN-007, INFO-003, LOG-002, R-001, R-005, REQ-SYS-010.
- **Energy model.** New FICTIONAL inputs (120 kWh, 92 %, 400 kW × 6 min, 270 kW × 10 min) reproduce TPM-003 = 23.0 % and make the reserve fail at 88.5 % capacity retained (≈ R-002's "more than 10 % fade"). Same expressions in SysML and `margins.ts`.
- **Margins** use Week 5's contingencies/alert floors and rules R1/R2 (cross-checked against `week05/measures.ts assessPoint` in a test). R3 not applied (no history).
- **Consistency tool** is a teaching tool over a table, not a validator; each finding shows the probe-recorded checker behaviour. Rule 4: reference TPM rows (limits parsed from recorded criteria, VER criteria) pass. Rule 5: realistic bad inputs (kWh on a power, 20 vs 18 criterion, 19 min design value, unitless, dangling, stale margin, fraction 25 % vs 0.20) fail; equivalent units (1200 s vs 20 min, 0.20 vs 20 %, dB(A)) pass.
- **Predict-first without leaks.** Explorer: derive disabled until a whole-number prediction; no score. Consistency: findings hidden until the student's own count; editing hides results again.
- **Graduate task required** this week (option B alternation; Week 12's was optional). ≈ 1 h: R88 p.33–36 (4 pp) + ½–1 page. The merge-rule point (draft C4 violates p.34 for REQ-SYS-001 and TPM-003) is the spec's rule, verified by `commits.ts` tests.
- **Quiz:** keys a 3, b 3, c 3, d 3; Bloom Understand 2, Apply 4, Analyse 3, Evaluate 3. Key option length rank (1 = longest): 1 in 2 items (q13-6 tied, q13-7), 2 in 3, 3 in 1, 4 in 6. No item depends on R88 (extension). All are new cases (REQ-SYS-002 63 dBA, A-006 doubling, REQ-SYS-005, R-005, AI-002, 88 % capacity).

## Workbench missions plan (WORKBENCH_SPEC §3; Week 13 is also a Program-review week)

| Kind | Mission (minutes) | Steps and checks |
|---|---|---|
| try | "One number, how many places?" (10) | Select REQ-SYS-001; record prediction of hop-1 count (answers.prediction); no feedback until Worked |
| worked | REQ-SYS-001 20 → 18 (15) | view: impact explorer on reference; focus PHY-003; `worked` text from w13-worked-impact; check: signal `w13-impact.firstOrder.length === 8` |
| guided | TPM-003 under battery −15 % (15) | view: what-if; check signal `w13-whatif.tpm003Status === 'breach'`; then explorer from TPM-003, hint: which re-check fails? check `mustChange` non-empty with reason |
| guided | Seeded fragment review (15) | view: consistency; check: student count entered before run; debrief compares with the six defects |
| own | L13 on the team model (rubric, RB-9.5) | no machine check except: a DEC exists with `affects` links and owner (model check), checker log attached (student marks done) |
| recall | 4 items drawn from q13-1, q13-5, q13-7, q13-12 | each needs the model (impact set, margin) |
| review | Program review (Weeks 9–13) | later; reuse Exam 2 T1–T6 structure |

Signals needed (optional props, no rewrite): `w13-impact` (start, firstOrder ids, mustChange, recommendation ok), `w13-whatif` (rows' status), `w13-consistency` (ran, myCount, findings count). The Parametric Analysis panel (A10–A12), when it exists, can replace the analyser's energy inputs for TPM-003 ("analysis-computed (teaching)").

## Register requests (lead runs the scripts)

1. Week 13 readings: narrow R78 to `147–148, 152, 158–159` (weekly plan says sl.147, 157–159; sl.152 is cited for TradeStudies) and R31 to `1368–1371`; R24 to `1203–1205, 1208–1210` with 1206–1207 as look-up (DECISION_LOG A14 option C). Weekly plan page count would become 10 pp + 11 slides.

## Shared changes needed (not made)

1. LABORATORY_AND_CAPSTONE_PLAN L13: "Out 3" → 2.5 h (team-hour check in `cautions`), or accept a ≈ 9.5 h week.
2. `course.ts` W13 `graduateTask` could say "required (option B)"; weekly plan W13 workload note: Exam 2 prep budgeted 0.5 h.
3. Reference model (lead): REQ-STK-005's rationale "25 = 20 + 5" would go stale under any charge-time change — fine as a teaching point; no change requested. R-002's "more than 10 %" fade and TPM-003's 23 % are now numerically linked only through the Week 13 inputs; the lead may wish to record that in `reference_model_notes.md` §6.
4. SEBoK p.1207 "functional … also called homogeneous redundancy" looks like a source error (caution recorded); S10 sl.147 L/M/H abbreviation and sl.109 "mass" ToolVariable slip recorded in cautions.

## Verification run (exact)

- `npx tsc -b`: no output (pass).
- `npx vitest run src/activities/week13 src/content src/lib`: 6 files, 137 tests, all pass.
- `npx oxlint src`: exit 0; 13 warnings, all `only-export-components` except one `set-state-in-effect` in the shared `SysmlListing.tsx`; none in Week 13 files.
- Full `npx vitest run` not run (memory constraint).

## Open issues

- The dependency table is a course convention; a reviewer may dispute individual entries (e.g. `allocated-to` treated as two-way; `affects` re-opening TECH).
- `primaryMention` reads requirement criteria by regex; reference texts parse, but unusual team wording may not (then no limit row is made and cross-checks are skipped, not falsely raised).
