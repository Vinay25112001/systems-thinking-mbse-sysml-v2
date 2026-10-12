# Week 7 authoring notes — Trade studies and decision analysis (Exam 1 week)

## Files
- `src/content/weeks/week07.ts`: the module, with 13 lesson blocks, 14 quiz items, lab L7, assignment W7-A and instructor notes. The Exam 1 item bank is NOT in the module.
- `src/instructor/exams/exam1.ts`: the Exam 1 item bank and key (instructor edition only; excluded from `npm run build:student`, whose leak check looks for each item label such as `'A1 (5 pts; …'` and the bank title).
- `src/activities/week07.activity.tsx`: registers three activities, `w07-trade-simulator`, `w07-monte-carlo` and `w07-swing-elicitation`.
- `src/activities/week07/`:
  - Pure logic: `trade.ts` (value functions, additive model, algebraic sensitivity, tornado, seeded Monte Carlo with drivers and derived scores, `checkStudy`, `checkForSave`), `reference.ts` (reads ALT/CRIT from a model; FICTIONAL reference drivers and derived-score uncertainty), `save.ts` (workspace save plan with owner and provenance; DEC), `swing.ts`, `tradespace.ts` (SBD example).
  - Shared state: `store.ts` (one trade study, its uncertainty and drivers, shared by the three activities; key `w07-trade-study`; states saved before drivers existed are read with an empty driver list).
  - Components: `TradeStudySimulator.tsx`, `MonteCarloPanel.tsx`, `SwingWeightWalkthrough.tsx`, `charts.tsx`.
  - Tests: `trade.test.ts` (pure logic, every number quoted in the lesson, the independent Monte Carlo cross-check and its mutation, the save-time acceptance checks) and `activities.test.tsx` (component behaviour, owner/provenance on CRIT/ALT/DEC).

## Pages actually read (via `python -I scripts/source_pages.py`)
- R18 S11 p.463–474, all of it. The additive equation (p.469) and the value-function, swing-matrix and Monte Carlo figures are images; only the surrounding text was paraphrased.
- R43 S12 p.109–110; R34 S11 p.608–614; R35 S11 p.1396–1399, all of them.
- For the exam key: R16 p.767–768 (TRL scale); R46 p.120–128; R61 p.630–631 (condition–if–then, as cited by Week 6); R13 p.557–567; R15 p.532–533; R60 p.523–526; R40 SRR criteria via the Week 6 checklist (S1–S9).

## Independent review (2026-10-11) — dispositions
| ID | Disposition |
|---|---|
| W7-F01 owner/provenance | Fixed. `ProvenanceOwnerFields` in the simulator; `ownerProblem` blocks both the study save and the DEC; `{ owner, provenance }` is passed on every CRIT/ALT created or updated and on the DEC. Tested (refusal without initials; saved elements carry `JK` / `AI-suggested-reviewed`; DEC carries the owner). |
| W7-F02 Monte Carlo shared driver | Fixed by implementing the model. Uncertain drivers (demand D, aircraft price AC, charger upgrade HP, vertiport VP, noise peaking PK) are drawn once per trial and pushed through each alternative's score model (`wait` and `linear` derived cells). The old same-quantile option is kept only for elicited distributions, renamed "same quantile (approximation)" and described honestly. Re-pinned: 9381 / 311 / 308 / 0 (P = 0.938 ± 0.0024); independent draws 8751 / 625 / 624 / 0. Cross-check (xorshift32, min/max triangular sampler, hand-coded model, 200,000 trials): 0.9407, z = 1.07 combined SE, |Δ| = 0.0026 ≈ 1.1 × the headline's own SE. Mutation: the pre-review method (9605) gives z = 9.8 and fails the gate. Student text, q7-11 and the activity rewritten. |
| W7-F03 quiz verbatim | Fixed: q7-2, q7-3, q7-8, q7-9, q7-10, q7-11, q7-13 re-cased on a charger-supplier decision (new numbers, a feasible reversal winner, a positive-to-negative tornado bar, a shared commodity-index Monte Carlo, a new SBD factor pair). q7-3 numbers test-asserted. |
| W7-F04 exam key | Fixed: C4 → S1/S2/S3 with Week 6 titles; C1 environments defined on the scenario sheet and (b) placed at a supplier demonstration vertiport (TRL 6 unambiguous); B1(iv) requires an owned AROU entry with need-by (CP2 reference removed; TBR/TBD distinguished); C2 cites R61 p.630–631 and marks horizon and trigger. Stale caution replaced by a dated re-check note. Further consistency fixes from a Weeks 1–6 sweep: A1 citation (R02 p.264; R04 p.274) and model-boundary alternative; A3 "conflict weight" not "salience"; A4 "pause activity"; B1 characteristics as taught in Week 4, LAmax, method analysis for (iii); B2 course definitions (RB-4.1); B3 alternate flow form; B4 REQ-STK/REQ-SYS wording; C3 unknown definition. |
| W7-F05 workload | Partly fixed within the 9 h total: online 0.7, exam prep 0.5, memo Part 1 0.4 (Part 2 ≈ 1.1 h falls in Week 8 before its due date). Caution records the realistic total ≈ 10.3 h. Needs a Week 8 workload line (shared change). |
| W7-F06 192 trips/day | Fixed in the lesson; reference DEC-001 `wouldChangeIf` has the same slip (lead). |
| W7-F07 R34 vs swing weights | Fixed: R34 presented as process outline; its importance weights contrasted with R18's swing weights. |
| W7-F08 cost as MOE | Labelled in the lesson as a course convention; reference relabel is the lead's (proposed text in the report). |
| W7-F09 exam timing | Fixed: Session 2 is 75 min of working time (matches blueprint, syllabus, plan, deliverable); instructions posted in advance; pacing 18/30/25 + 2. |
| W7-F10 lab overstatement | Fixed: explicit Baseline column (stored as ALT attribute `baseline`); `checkForSave` makes one baseline and an MOE trace that exists in the workspace errors at save time; lab text says exactly what is and is not checked. Reference without the attribute falls back to a name that starts with "Baseline"/"Status quo". |
| W7-F11 stale records | Fixed (this file, the exam1.ts header, module header and cautions). |
| W7-F12 A2 loop | Fixed: closing link added to the stem; key accepts five or six listed links. |

## Design decisions
- Sensitivity uses proportional rescaling of the other weights (course convention, labelled).
- Tornado: base winner's margin at w ± Δ; concave in w, so the endpoints bound it.
- Monte Carlo: drivers drawn first in a fixed order, then elicited cells criterion-major, so a seed reproduces a run. "Independent draws" gives every derived cell its own driver draw, as the comparison.
- The wait model is the Week 1 2/(1 − u) with a cap at 0.97 and a 120 min overload term (course extension, labelled). Noise exposure is held at planning demand; only the peaking factor is uncertain (simplification, labelled).

## Open issues / requests for the lead
1. Reference `src/model/reference/week07.ts` DEC-001 `wouldChangeIf`: replace "(the baseline then meets 80 % utilisation)" by "(MGO-007's 80 % rule would then re-derive REQ-STK-004 as 240 trips/day, which the baseline already provides)".
2. Reference MOE-005 is a cost measure (RB-4.1 defines an MOE as mission or user effectiveness). Either relabel it in `week05.ts` as a course cost measure ("Capital to meet the Year-2 capacity objective (course cost measure, handled explicitly per RB-6.2)") or trace CRIT-002 to MGO-004 instead.
3. Reference ALT-001 should carry `baseline: true` so the name fallback in `studyFromModel` is no longer needed.
4. Week 8 workload: add ≈ 1.1 h for the graduate memo Part 2 (set-based comparison, R35, writing).
5. Register request: `WEEKLY_INSTRUCTIONAL_PLAN.md` Week 7 cites a robustness definition at "S11 p.341", outside every register reading; not cited.
6. Week 6 was being revised concurrently: SRR S1–S9, the TRL environment definitions and the consequence anchors were re-read at 18:25 on 2026-10-11 and still matched the key.
7. Vitest: `activities.test.tsx` calls `afterEach(cleanup)` explicitly and uses a 30 s timeout under parallel runs.
