# Week 6 authoring notes

Module: `src/content/weeks/week06.ts` · activities: `src/activities/week06.activity.tsx` + `src/activities/week06/` · status: `self-checked` (independent review still required).

## Pages actually read (via `python -I scripts/source_pages.py <ID>`)

| Reading | Pages read | Used for |
|---|---|---|
| R16 SEBoK Product SE Special Activities | 766–770 (full) | TRA purpose, NASA/DoD origin, TRL 1–9 names (Table 1, p.767), TRL limits and MRL (p.767), IRL/SRL and COTS caution (p.768), certification (p.769), technology planning and risk reduction (p.770) |
| R60 MITRE Assessing Technical Maturity / Technology Planning | 523–531 (full) | Hype cycle (p.524–525), s-curve, TRL as accepted method, "relevant environment" must be interpreted, architecture fit not addressed (p.525), TRL < 6 threshold practice (p.526), technology plan as living roadmap (p.529), immature tech gets risk + mitigation, R&D > 5 years trend (p.530) |
| R17 SEBoK Risk Management | 481–486 (full) | Definitions (p.481), matrix and ISO 31010, opportunities, process (p.482), RMP incl. assumptions (p.482–483), if–then / condition statements, analysis, prioritisation by level or pair (p.483), quantitative methods and model-quality caution, treatment options, contingent strategies, buying information, monitoring (p.484), opportunity management, pitfalls incl. automatic mitigation selection, sea of green (p.484–486), good practices incl. "results should be challenged" quote (p.486) |
| R46 DoD Risk Management Process | 120–126 (assigned sub-range) | RIO (p.120), ITRA, contract type (p.121), RMB, register (p.122), risk definition, early entry for maturation (p.123), Table 4-3 (p.124–125), statement elements and consequence tailoring (p.125), **Figure 4-9** and handling options / mitigation examples (p.126) |
| R40 DoD SRR | 69–72 (full) | SRR purpose and assessment questions (p.69), PM/SE responsibilities, entry rule (p.70), Table 3-2 criteria (p.71–72) |
| R61 MITRE Risk Identification / Impact / Mitigation (extension) | 626–647 (full) | Condition–if–then (p.630–631), statement practice, no mitigation in statement (p.632–633), subjective probability (p.635), quantitative techniques (p.636–637), Table 1 probability scale incl. 1.00 = issue (p.637), rationale (p.639), **Figure 1** handling options and their definitions (p.642), transfer double-edged (p.644), watch list, risk manager (p.645), contingency plans (p.646) |
| R51 MITRE Uncertainty and Complexity (extension) | 50–59 (full) | External/internal uncertainty (p.50), watchmaker vs gardener (p.51), options in designs (p.53), M&S (p.55), small bets / staged commitments (p.56) |
| R06b SEBoK Life Cycle Stages | 385 (re-used from Week 2) | Gate decision options, cross-referenced for the SRR recommendation |
| R70 S10 Introduction to SysML v2 (micro-lab 2) | sl.8–17 | Part/attribute definitions (sl.9), specialization and abstract (sl.10), subsetting (sl.11), redefinition and multiplicity (sl.12), binding a value (sl.13), parts as usages (sl.15–16), items/defaults (sl.17) |
| R79 S10 Quantities and Units | sl.163–168 | Quantity values, measurement references, units, ISQ (sl.167), SI incl. prefixed and derived units (sl.168) |
| R80 S06 7.6–7.7 | p.63–64, 76–77 | Definition/usage, features, package-level usages, multiplicity, referential vs composite, specialization (p.63–64); implicit specialization; attributes, primitive types, only the kind of unit with the type (p.76–77) |

**Figures read from the rendered PDF, not the text extraction.** R46 p.126 Figure 4-9 (likelihood levels with probability bands > 1–20 / 20–40 / 40–60 / 60–80 / 80–99 %, the 5×5 Low/Moderate/High layout, and the consequence table) and R61 p.642 Figure 1 (identical cell layout; green = watch/assume, yellow and brown = avoid/control/transfer) are images. I rendered `Shared Resource Folder/Systems Engineering/Systems Engineering Guidebook.pdf` page index 125 and `se-guide-book-interactive.pdf` page index 641 with PyMuPDF to read them. The layout encoded in `risk.ts` (rows L5..L1: LMHHH, LMMHH, LLMMH, LLLMM, LLLLM) is identical in both figures and is test-asserted.

Every citation in the module lies inside these ranges (enforced by `weeks.test.ts`).

## Design decisions

- **Likelihood scale** = DoD Figure 4-9 bands unchanged. **Consequence scale** = five AeroLink anchors adapted (instructor) from the Figure 4-9 performance/schedule columns, as R46 p.125 asks programs to tailor consequence criteria. Horizon fixed at the CP2 planning horizon (month 24, the REQ-STK-004 horizon).
- **Cell levels, not products.** The matrix reports Low/Moderate/High per cell as drawn in both figures; the module explains why it does not multiply L × C (instructor reasoning, boundary marked).
- **Handling options**: accept/assume, watch, avoid, control (stored as `mitigate` to match the reference attribute values), transfer. The guideline check (R61 p.642) is a *warning*, never a block, because MITRE says it fits "many, but not all" programs.
- **Condition–if–then check** is a regex heuristic (condition/given/because … if … then, in order); it also blocks embedded mitigations (R61 p.633). Completeness accepts plain if–then for legacy entries (SEBoK p.483 permits it) but the entry form requires the condition.
- **TRL ladder**: a level counts only if every lower level is "yes" (course convention); claimed > supported = error; supported > claimed = warning; TRL ≥ 5 requires a relevant-environment definition (R60 p.525); critical TECH < 6 requires a maturity risk (R60 p.526, p.530). The lowest-critical-TRL argument is instructor reasoning consistent with R16 p.768 (SRL) — labelled in the text.
- **Workspace writes** use the atomic `apply` batch (TECH + new A + affects links; A/R/O/U + affects link), `updateElement` for edits. The workspace issues IDs; if the student types an assumption ID that does not exist, a new A is created and the issued ID is reported and stored.
- **Graduate model**: binomial/Poisson count × event tree, FICTIONAL inputs: 12 aircraft × 20 charges/day × 360 days; p0 = 1e-6 per session; B1 fails 0.10, B2 fails 0.20; 24-month horizon. Results (test-asserted): λ = 0.1728, P(any) = 15.9 %, outcomes 14.4 % / 1.37 % / 0.345 %; B1 → 0.01 gives 0.035 % with no cell change; p0 × 10 gives 82 % any-initiation (L5) but 3.4 % C5 (L1).
- **SRR criteria S1–S9** adapt R40 p.69–72 to a requirements baseline. S9 (system-safety hazards reviewed, mitigations allocated, p.72) was added after review; every other dropped or deferred Table 3-2 criterion is listed with its reason in `w6-srr` para 3. The actionable-finding rule (ID + action verb + ≥ 10 words, no preference/opinion markers, no vague change request) and the three recommendations are course conventions. The 48 h posting rule and the k → k+1 pairing are instructor design to make 8 × 7 min feasible.
- **Assignment** is CP2 itself (team, 10 %, RB-3 40 · RB-4 20 · RB-5 30 · RB-12 10). The graduate annex is individual and scored in the review notebook (RB-16.1), so RB-16 is listed with that scope.
- Five activities (`w06-trl-assessor`, `w06-risk-register` incl. issue log, `w06-risk-quantifier`, `w06-srr-checklist`, `w06-sysml-microlab2`); logic in pure modules with unit tests in `logic.test.ts`, `heuristics.test.ts`, `microlab.test.ts` (mutation-style tests for every check) and component tests in `activities.test.tsx`.

## Open issues / requests to the lead

1. **B6.5 resolved.** Micro-lab 2 is authored (block `w6-sysml`, listings in `sysml/week06/`, activity `w06-sysml-microlab2`, quiz q6-16..q6-18) and B6.5 was added to `course.ts` as the last step, per the lead's instruction.
2. **Reference rating of R-008** (`src/model/reference/week06.ts`, likelihood 2). Under the DoD bands L2 means 20–40 % over the horizon; the FICTIONAL worked model supports L1. The module uses this as the graduate teaching point and does not change the shared file. Optional: change R-008 to likelihood 1 (cell stays Moderate, so nothing else moves) — or leave it as the deliberate "challenge the rating" example (my preference; the module text currently assumes L2 stays).
3. **Reference attribute naming**: the reference uses `handling: 'mitigate'`; the sources say "control (mitigation)". The UI labels it "Control (mitigate)". If faculty prefer source wording, rename in the reference and in `risk.ts` together.
4. **Shared UI (optional):** the `/workspace/model` page could show the 5×5 matrix for the whole register; the activity already does, so this is not blocking.
5. **Concurrent edits seen**: during my runs `tsc -b` reported errors only in other authors' files (`src/activities/week07/zz_print.test.ts`, then `src/activities/week05/logic.test.ts`). Nothing in Week 6 imports them.

## Not verified / limits

- The TRL 8/9 trailing description in R16 Table 1 is ambiguous in extraction and is not used; the table caption attributes the scale to Mankins 1995 (NASA) while the text says DoD — only the level names are used.
- No real supplier, OEM or regulator data exist in the collection: every TRL, rating and rate is FICTIONAL and labelled so.
- SysML listings now exist (micro-lab 2); see the check output in the review-response section.

## Review response (independent review 2026-10-11, `_source_cache/review/week06_review.md`)

| ID | Disposition | Where |
|---|---|---|
| W6-F01 | Fixed. Both recorders render `ProvenanceOwnerFields`, block on `ownerProblem`, pass `{owner, provenance}` to `apply()` / `updateElement()`. The new A from the TRL assessor gets the element owner (initials) and no empty `owner` attribute. The register keeps the role (`attributes.owner`, risk manager) separate from the accountable student (`element.owner`). | `RiskRegister.tsx`, `TrlAssessor.tsx`; component tests |
| W6-F02 | Fixed. Micro-lab 2 authored (see above). | `week06.ts` `w6-sysml`; `microlab.ts`, `MicroLab2.tsx` |
| W6-F03 | Fixed in the module: R-004 is C4 under the course scale (REQ-STK-004 is a stakeholder capacity requirement); cell stays moderate. q6-6 re-cased (30 %, REQ-SYS with workaround → L2 × C3 low). **Reference change requested** (below). | `w6-worked-risks`, answer key |
| W6-F04 | Fixed. New `riskStatementProblems` (missing treatment as the event, past-tense if/then = issue, vague event, consequence naming nothing harmed) and SRR opinion / vague-change checks. All six reviewer probes fail with exactly the targeted message; minimally repaired versions pass; all reference A/R/O/U entries still pass; mutation runs disable each check and the targeted test fails. Activity wording softened to "flags". | `risk.ts`, `srr.ts`, `heuristics.test.ts` |
| W6-F05 | Fixed. q6-2, q6-5, q6-6, q6-7, q6-8, q6-9, q6-14 re-cased on new technologies, risks and numbers (cargo-pod TRLs; freezing fog; firmware; spoke lease; bird-strike model λ = 0.3; charger SLA; AI dispatch optimiser). | quiz |
| W6-F06 | Fixed with caution. R61 p.630–646 now core (48 pp = 3.2 h); annex 2.0 h incl. R51 p.50–56; micro-lab 0.5 h; total held at 11.0 by budgeting L6 at 1.4 h, and the ≈ 13 h realistic total is stated in `cautions`. | `workload`, `cautions` |
| W6-F07 | Fixed. Lesson says "below the scale; rate at the floor L1 by convention and record it"; `compareWithOrdinal` returns `agrees: false` below 1 % for every ordinal. | `w6-worked-quant`, `quant.ts` |
| W6-F08 | Fixed. S9 added; all dropped/deferred criteria listed with reasons. | `srr.ts`, `w6-srr` |
| W6-F09 | Fixed in the module: TECH-001 "— (TRL ≥ 6; external dependency R-005)"; key `maturityRisk: ''`, `relatedRisk`; test asserts the rule. **Reference change requested.** | `trl.ts`, `w6-worked-trl` |
| W6-F10 | Fixed locally: issue log in the register activity (owner role, affects, action, linked future risk), copied to CP2 §7. **Shared change suggested** (issue kind). | `IssueLog.tsx`, `risk.ts` `checkIssue` |
| W6-F11 | Fixed. Staged commitments tied to the evolving requirement REQ-STK-004; grid connection presented via R51 p.56 real-options advice, R-005 avoid "by analogy". | `w6-advanced` |

### Requests to the lead (shared files)

1. `src/model/reference/week06.ts`, R-004: change `3, 3, 'Director of Flight Operations', 'transfer'` to `3, 4, 'Director of Flight Operations', 'transfer'` (cell stays Moderate; no test changes needed).
2. Same file, TECH-001 attributes: replace `maturityRisk: 'R-005'` with `relatedRisk: 'R-005'` (or delete it). The `ln('R-005', 'affects', 'TECH-001')` link can stay.
3. `src/content/course.ts` Week 6 readings: move R61 from `extension` to `readings` with `pages: '630–646'`, and give R51 `pages: '50–56'` in `extension`.
4. Optional: an `ISS` element kind in `src/model/engineering.ts` (affects-link source; probability fixed at 1) so issues join the digital thread; the activity's issue log would then write to the workspace.
5. Regenerate `sysml/validation-report.json` with a full run (new files `sysml/week06/*`). Note: my scratch probe run overwrote `sysml/partial-report.json`; the last run is the week06 run below.

### SysML findings

- `aerolink_charging.sysml` PASS; `invalid_usage_redefines_missing_feature.sysml` FAIL with `ERROR 16:23 Couldn't resolve reference to Feature 'usableEnergy'.`
- Probe (scratch file, not kept): `attribute redefines ratedPower = 160 [kW * h];` on a `PowerValue` attribute PASSES the 2026-08 pilot with no diagnostic. The lesson, u2 and q6-17 use this; only the observed behaviour is claimed.
- `kW`, `MJ`, `W`, `h`, `min`, `s` resolve in the bundled SI library; `kW * h` is accepted as a unit expression.
