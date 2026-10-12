# Week 7 sign-off pass: Trade studies and decision analysis, and the Exam 1 bank

Reviewer: Independent AI reviewer (Claude), sign-off pass. Date: 2026-10-11.

**Inputs**
- First review: `_source_cache/review/week07_review.md` (W7-F01..F12).
- Authors' dispositions: `learning-studio/docs/authoring/week07_notes.md`. These were verified against the code, not taken on trust.

**Material re-read**
- `src/content/weeks/week07.ts`
- `src/activities/week07/*`
- `src/instructor/exams/exam1.ts`
- Reference `week05.ts` and `week07.ts`, in the state after the lead's batch commits (HEAD `63ee490`)
- Week 1–6 modules, for the exam key

No course or app file was left modified. Mutations were applied and then reverted with `git checkout`; afterwards `git diff --stat` was empty.

## Verdict: **NOT SIGNED OFF**

There is one blocker, **W7-S01 (major)**. Every save of the trade-study simulator overwrites the owner and provenance of every CRIT and ALT in the study. The on-screen instruction to tag AI-suggested items "in a separate pass" therefore cannot work. A student who follows it silently erases the AI-suggested-reviewed tags, or the team-derived tags, that RB-12.3 grades.

W7-F01 is therefore only **partly** resolved. The fix is small (see below).

Everything else is in good shape:
- The Monte Carlo is now coherent and independently cross-checked.
- The quiz is re-cased.
- The exam key is consistent with Weeks 1–6.
- Ten of the twelve original findings are fully resolved, and W7-F05 is resolved as a disclosed caution.

## Tool runs (from `learning-studio/`, after the batch commits)

| Command | Result |
|---|---|
| `npx tsc -b` | **clean** (exit 0). The first attempt failed in the reference `week07.ts` l.75: an unescaped `MGO-007's` in a single-quoted string, from the concurrent batch edit of DEC-001. Fixed in `6c04ddb`. |
| `npx vitest run src/activities/week06 src/activities/week07 src/content` | **8 files, 167 tests passed** (run twice, before and after `63ee490`). |
| `npm run build:student` | Built. "student build: none of 13 exam markers present; instructor build (dist/): 13 of 13 markers present". An independent grep of `dist-student/assets/*.js` for exam-only strings ("AeroLink Cargo", "hospital pads", "cargo-pod latch", "renewals → contracts", "head of medical logistics", "ITEM BANK") found **0** hits. |
| Independent Monte Carlo (numpy, 2,000,000 trials, own sampler and value code) | **P(ALT-004 first) = 0.9412** (SE 0.00017). See below. |

## Disposition of the original findings

| ID | Sev. | Status | Evidence |
|---|---|---|---|
| W7-F01 owner/provenance | major | **PARTLY RESOLVED**; residual is W7-S01 | What works: `ProvenanceOwnerFields` is rendered (l.138); `ownerProblem` blocks both the save and the DEC (l.79, l.99–100); `{owner, provenance}` goes on every CRIT/ALT create and update (`save.ts` l.26, l.36) and on the DEC (l.103). What fails: tagging is per study, not per element, and every save re-tags every element. |
| W7-F02 Monte Carlo shared driver | major | **RESOLVED** | Five drivers (D, AC, HP, VP, PK) are drawn once per trial (`trade.ts` l.375–378) and pushed through `wait` and `linear` derived cells (`reference.ts` l.91–108). Pinned counts 9381 / 311 / 308 / 0 (seed 2026); independent draws 8751 / 625 / 624 / 0. The student text, q7-11 and the activity describe it truthfully, and the same-quantile method is labelled an approximation. The independent cross-check test is sound (see below). |
| W7-F03 quiz verbatim | major | **RESOLVED** | q7-2, -3, -8, -9, -10, -11 and -13 are re-cased on a charger-supplier decision with new numbers. None is answerable by copying the lesson. Keys recomputed (below). |
| W7-F04 Exam 1 key vs Weeks 4–6 | major | **RESOLVED** | **C4** keys S1, S2 and S3, with titles identical to `srr.ts` `SRR_CRITERIA`. **C1** has the environments defined on the scenario sheet, and (b) is placed at a supplier demonstration vertiport, so TRL 6. **B1(iv)** requires an owned AROU entry with a need-by date, and TBR/TBD match Week 4's definitions. **C2** cites R61 p.630–631 and marks horizon and trigger. The stale caution is replaced by a dated re-check note. |
| W7-F05 workload | major | **RESOLVED as a disclosed caution** (faculty) | The Week 7 caution is arithmetically right: fixed items 7.4 h, leaving 1.6 h; realistic 9 + 0.3 + 1.0 = 10.3 h. The displaced memo Part 2 is not yet budgeted in Week 8 (W7-S03). |
| W7-F06 192 trips/day slip | minor | **RESOLVED** | The lesson's worked (d) para 4 is corrected. Reference DEC-001 `wouldChangeIf` is corrected (batch commit). |
| W7-F07 R34 ≠ swing weights | minor | **RESOLVED** | R34 is now presented as the process outline, and its "relative importance" weights (re-read on p.611) are contrasted with R18's swing weights. |
| W7-F08 cost filed as MOE | minor | **RESOLVED** | The lesson labels it a course convention. Reference MOE-005 now reads "(course cost measure, handled explicitly per RB-6.2)". |
| W7-F09 exam time | minor | **RESOLVED** | Session 2 is 75 min of working time; pacing 18 + 30 + 25 + 2 = 75. This matches the bank overview and the deliverable. |
| W7-F10 lab overstates checks | minor | **RESOLVED** | An explicit Baseline radio column. `checkForSave` errors on ≠ 1 baseline and on missing or absent MOE traces. The lab text states exactly what is and is not checked. Reference ALT-001 now has `baseline: true`. Mutation M2 proves the test bites. |
| W7-F11 stale records | minor | **RESOLVED** | 13 blocks (counted). `exam1.ts` header updated. The stale module caution is removed. Notes open issues 1–3 are now done by the lead and should be ticked (W7-S05). |
| W7-F12 A2 loop not closed | minor | **RESOLVED** | The closing link renewals → contracts (+) is in the stem. The key accepts five or six links. 2 + 2 + 2 + 2 = 8. |

## New findings

| ID | Sev. | Location | Finding | Evidence | Recommended fix |
|---|---|---|---|---|---|
| **W7-S01** | **major (blocker)** | `save.ts` `planSave` l.26–38; `TradeStudySimulator.tsx` l.84–85 and help text l.139 | **Per-save, whole-study re-tagging defeats the AI tag that W7-F01 was meant to enable (§7 rule 1; DECISION_LOG W7).** The mechanism: `planSave` puts `owner: po.owner, provenance: po.provenance` into the update patch of *every* existing CRIT and ALT, and `updateElement` merges the patch (`state/Workspace.tsx`: `{ ...e, ...patch }`). The UI tells students to "save [AI-suggested items] in a separate pass from the team-derived ones". That cannot work, for two reasons. First, the second pass re-tags every element with that pass's provenance and owner. Second, a pass containing only the AI-suggested alternatives is refused by `checkForSave`, which requires exactly one baseline and at least 3 alternatives. The workspace page shows provenance read-only, so there is no fix-up route. **Consequences:** a team that saves team-derived after any AI help erases the AI tags, and RB-12.3 / `aiUse` ("every AI-suggested alternative, criterion or score is tagged") becomes unverifiable. Separately, every save also re-assigns each element's owner to whoever saved last, which destroys individual accountability for elements a teammate authored. | Code paths cited. No test covers a second save over existing elements with a different tag. | **Minimal:** in `planSave`, apply `{owner, provenance}` only to **created** elements and to elements whose name, text or attributes changed in this save. Leave unchanged elements' tags alone. Add a per-row provenance select, or let the AI tag apply to "changed rows only". **Test:** save as team-derived (JK); change one ALT and save as AI-suggested-reviewed (LM); assert that the unchanged CRITs and ALTs keep team-derived/JK and only the changed ALT is AI/LM. **Fallback wording fix, if code is frozen:** replace the "separate pass" advice with "if any CRIT, ALT or score was AI-suggested, save the study as AI-suggested-reviewed and name the items in the AI statement", and stop overwriting owner on updates. |
| W7-S02 | minor | `exam1.ts` C3 vs `week06.ts` q6-10 | **Exam C3 repeats a practice item.** Two of C3's four statements are near-verbatim copies of q6-10 entries that students see with answers: "Hub chargers idle overnight could be leased…" and "If the battery fades more than 10 % before pack replacement, then the reserve cannot be held…". The weather-limits unknown echoes U-001 / q6-10 (2). The item tests recall of the Week 6 quiz rather than classification. | q6-10 options (1) and (4); C3 stems. | Re-case two C3 statements on Cargo-specific content, for example a hospital pad-access opportunity and a cold-chain payload risk. |
| W7-S03 | minor (faculty) | `week07.ts` workload and caution; `week08.ts` workload | **The displaced memo Part 2 lands in a week that is already over budget.** The Week 7 caution assumes memo Part 2 (≈ 1.1 h) is done in Week 8. Week 8's workload has no such line. Week 8 already sums to 10.5 h (2.5 + 2 + 0.9 + 0.3 + 3.5 + 0.6 + 0.7) and has its own graduate coupling memo due the same day (end of Week 8). Realistic Week 8 is therefore ≈ 11.6 h with two graduate memos and CP3 due together. The Week 7 caution is honest about Week 7 but incomplete about the consequence. | `week08.ts` l.625–637; notes open issue 4. | Add the 1.1 h line to the Week 8 workload and caution (a lead/shared change). Alternatively, faculty could make the SBD half optional for Week 8 or merge it with the coupling memo. |
| W7-S04 | nit | q7-10 option (b) | "S2's firmware is at TRL 6 on its supplier's evidence, **so** a maturity risk stays in the register". The "so" contradicts the Week 6 rule that was just repaired (W6-F09: at TRL ≥ 6 no maturity risk is required). A residual technology risk can legitimately stay, but not because of TRL 6. | `w6-trl` para 4; W6-F09. | "…at TRL 6 on supplier evidence only; a technology risk stays watched until fleet data confirm availability". |
| W7-S05 | nit | `week07_notes.md` open issues 1–3; `exam1.ts` C1(b) | (a) Notes requests 1–3 (DEC-001 wording, MOE-005 relabel, ALT-001 `baseline: true`) are now done in the reference and should be marked closed. (b) C1(b): the sheet defines the relevant environment as "an operating vertiport…", and the item says "the supplier's demonstration vertiport". A student could argue that it is not "operating" and answer TRL 5. | Reference HEAD; overview text. | Tick the notes. In C1(b), write "the supplier's operating demonstration vertiport". |

## Pinned numbers re-verified

**Deterministic (spot-checked against the first review's recomputation; unchanged)**
- Totals: 0.670 / 0.489 / 0.458 / 0.452.
- Reversals: 0.478 / 0.226 / 0.592 / 0.555.
- Tornado worst margins: 0.090 / 0.096.
- ALT-004 with zero capital value: 0.562.
- Wait ranges from the demand triangle: ALT-004 6.15–8–11.43 min; ALT-002 8–12–24 min; ALT-001/003 20–66.7–78.7 min.
- No-wait bounds 0.474 and 0.495, against ALT-004's minimum 0.575.
- ALT-002's maximum is 0.567. Closed form: 0.378 + 0.057 + 0.053 + 0.078.

**Quiz arithmetic (new items)**
- q7-3: 10/14 = 0.714, and 0 below walk-away.
- q7-4: 100/275 = 0.364.
- q7-6: 0.364 + 0.075 + 0.128 + 0.084 = 0.651.
- q7-7: w* = 0.60/1.20 = 0.50.
- q7-8: distances +0.36 / −0.04.
- q7-11: SE = √(0.71 × 0.29 / 8000) = 0.0051, so 0.74 is ≈ 6 SE away.

**Coherent Monte Carlo** (my own numpy implementation, inverse-CDF triangular sampling, 2,000,000 trials, seed 7)

| Quantity | Mine | Lesson / test | Agreement |
|---|---|---|---|
| P(ALT-004 first), shared drivers | **0.9412** ± 0.0002 | 0.938 ± 0.0024 (n = 10,000, seed 2026) | Δ = 0.0032 ≈ 1.3 SE of the headline |
| | | Cross-check 0.941 (200,000 trials) | |
| P(first), ALT-001 / ALT-003 / ALT-002 | 0.029 / 0.029 / 0 | 0.031 / 0.031 / 0 | Within sampling error at n = 10⁴ |
| Independent draws | 0.8766 | 0.875 | Agrees |
| Largest demand among ALT-004's losses | 226.8 trips/day | "losses only below 232/day" | True (232 is the walk-away crossover) |
| P(D < 232) | 0.2224 | 22 % = 16²/(48 × 24) | Agrees |
| P(ALT-004 wins \| D < 232) | 0.736 | "about 73 %" | Fine |
| ALT-004 P5–P95 | 0.632–0.687 | 0.632–0.687 | Agrees |
| Baseline P5–P95 | 0.438–0.676 | 0.438–0.679 | Agrees within tail sampling noise at n = 10⁴ |
| ALT-002 mean value | 0.476 | 0.477 | Agrees |
| ALT-002 mean rank | 2.72 | 2.72 | Agrees |

**Independent cross-check test** (`trade.test.ts` l.339–421). The design is sound:
- It uses a different PRNG (xorshift32) and a different triangular sampler: the Stein–Keblis min/max construction, which is a valid triangular generator.
- The model is hand-coded independently of `trade.ts`.
- **Gate:** combined z < 3 and |Δ| < 2 × the headline SE. The innocent case sits at z ≈ 1.1, and the pre-review same-quantile method sits at z ≈ 9.8 and is asserted to fail. That is a threshold set from the failure mode, not from the innocent mean.
- One fragility: the test pins `pLossGivenLow.toFixed(2) === '0.27'`. The model value is 0.264 by my 2M-trial run, so the seed-12345 sample sits just over the 0.265 rounding boundary. This is deterministic, so it is not flaky, but it would break on any innocent change to the sampler. A tolerance (|x − 0.264| < 0.01) would be more robust. This is a nit; it is not a finding.

**Mutations (applied, targeted tests run, reverted; `git diff --stat` empty afterwards)**
- **M1** `trade.ts`: every derived cell takes its own fresh driver draw, which breaks the shared driver. Result: **3 tests fail**: the Monte Carlo summary, the shared-vs-independent pins, and **the independent cross-check gate**. So the gate catches it independently of the pinned counts.
- **M2** `trade.ts` `checkForSave`: `baselines.length !== 1` → `> 1` (allows zero baselines). Result: **1 test fails** ("a realistic study whose description only mentions the baseline … is refused").

## Exam 1 key: checked against what Weeks 1–6 teach

- **Totals:** A 5 + 8 + 7 + 5 = 25; B 16 + 8 + 8 + 8 = 40; C 7 + 14 + 8 + 6 = 35. C1 = 3 × 2 + 1; C2 = 2 × (3 + 2 + 2).
- **A1:** the boundary alternative ("partner-owned vertiports inside ENT-001") is supported by Week 2 `sos.ts` l.93. The citation R02 p.264 is in Week 1.
- **A2:** the R05 p.283 citation is in Week 1.
- **A3:** "conflict weight" and the salience reservation match Week 2.
- **A4:** "pause activity" and R06b p.385 match Week 2.
- **B1:**
  - TBR ("known but held with low confidence") and TBD match Week 4.
  - R48 p.144, R54 p.329 and R13 p.565 are all cited in Week 4.
  - "Design-free" and "technically feasible" are Week 4 terms.
- **B2:** R15 p.532 and the "effectiveness the user cares about (MOE)" definition match Week 5.
- **B3:** the reference has SCN-003 Aircraft Charging and SCN-004 Maintenance Event.
- **C1–C4:** consistent with Week 6 as it now stands (TRL environments, consequence anchors incl. R-003 C5, S1–S9 titles).
- **Remaining issues:** C3 repetition (W7-S02) and the C1(b) wording nit (W7-S05).

## Workload (faculty decision; not blocking)

The Week 7 caution is honest: 9 h planned, ≈ 10.3 h realistic, with the online, exam-prep and memo shortfalls named and memo Part 2 moved to Week 8. It is **not complete**, because Week 8 does not yet carry that 1.1 h. Week 8 is already at 10.5 h with a second graduate memo due the same day (W7-S03).

Recommend that faculty decide whether to formally move SBD into Week 8's budget (raising it to ≈ 11.6 h) or make it optional. The FD-22 time log is the right instrument to confirm either way.

## What is needed for sign-off

Fix **W7-S01**: either the code change with its test, or at minimum the honest wording change plus stopping owner overwrite on unchanged elements. Then re-run `npx vitest run src/activities/week07`. The minors and nits can follow in the normal update cycle.

---
Independent AI reviewer (Claude), sign-off pass, 2026-10-11.
