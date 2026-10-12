# Week 6 independent review: Technology readiness, uncertainty, risk and AROU (CP2, SRR-style review)

Reviewer: independent adversarial review (not the author). Date: 2026-10-11.

**Scope**
- `learning-studio/src/content/weeks/week06.ts`
- `src/activities/week06.activity.tsx`, `src/activities/week06/*`
- `docs/authoring/week06_notes.md`

**Checked against**
- `course.ts`; `AUTHORING_GUIDE.md` §7; `schema.ts`
- `ASSESSMENT_RUBRICS.md` RB-3–RB-5, RB-12, RB-16
- Lab plan L6; syllabus §11 (CP2 scope) and §12 (CP2 weights)
- `WEEKLY_INSTRUCTIONAL_PLAN.md` Week 6 (incl. B6.5)
- Reference `src/model/reference/week02.ts`, `week06.ts`

**Sources read**
- Text pages: R16 p.766–770; R60 p.523–531; R17 p.481–486; R46 p.120–128; R40 p.69–72; R61 p.630–646; R51 p.50–56.
- Rendered figures: **DoD Figure 4-9** (Guidebook PDF page index 125) and **MITRE Figure 1** (SEG PDF page index 641), both rendered with PyMuPDF to check the bands and cell layout independently.

Heuristics were probed with `jiti` from a scratch directory. No course or app file was edited.

## Verdict: **PASS WITH FIXES**

There are no critical defects, but there are six major ones. Do not release before F01–F04 are fixed.

**What holds up**
- **Source work is strong.** Every page lands. The quotations are exact. The DoD likelihood bands and the 5×5 cell layout (LMHHH / LMMHH / LLMMH / LLLMM / LLLLM) match both figures cell for cell, which I checked by rendering them.
- **Graduate arithmetic is correct to the stated precision.** This covers the binomial/Poisson exposure model and the event tree.

**What must be fixed**
- **Provenance and owner.** The recurring recorder defect is back in both workspace writers.
- **Micro-lab 2 is missing.** The module lists it as a deliverable and budgets time for it.
- **A quiz key contradicts the course's own consequence scale.**
- **The risk-statement and SRR-finding heuristics accept realistic bad input.** That includes the exact bad example the quiz teaches.
- **Recurring defects:** quiz items answered verbatim by the lesson, and the graduate time budget.

Counts: **critical 0 · major 6 · minor 5**.

## Tool runs (from `learning-studio/`)

| Command | Result |
|---|---|
| `npx vitest run src/activities/week05 src/activities/week06 src/activities/week07 src/content` | **8 files, 147 tests passed**. |
| `npx tsc -b` | **clean** (exit 0). |
| Probe: reference A/R/O/U through `checkEntry` (`entryFrom` + `affects` link) | All 17 reference entries pass: errors [] for each (rule 4 ✓). |
| Probe: bad inputs through `checkEntry` and `checkFinding` | See F04. Every probe below was **accepted**. |

## Findings

| ID | Sev. | Location | Finding | Evidence | Recommended fix |
|---|---|---|---|---|---|
| W6-F01 | major | `RiskRegister.tsx` `save()`; `TrlAssessor.tsx` `record()` | **Recorders do not record owner or provenance (§7 rule 1, recurring from W2/W4).** Neither recorder renders `ProvenanceOwnerFields` or checks `ownerProblem`, and neither passes `{owner, provenance}` to `apply()`. Provenance is hard-coded to `'team-derived'` / `'team-assumption'`, so an AI-drafted risk **cannot** be tagged `AI-suggested-reviewed`. That tag is exactly what `assignment.aiUse` and template §10 require ("every AI-suggested … risk or TRL basis … tagged AI-suggested-reviewed"). The register's "owner" is a free-text role in `attributes`, not the element owner (initials) used for individual accountability (syllabus §12). The TRL assessor also creates a new A element with `attributes: { owner: '' }`, which immediately fails the register's own "owned" completeness check. | `RiskRegister.tsx` l.71–74; `TrlAssessor.tsx` l.56, 61. | Add `ProvenanceOwnerFields` to both recorders, block saving on `ownerProblem`, and pass `{owner, provenance}` on every created element. Prefill the new A's owner from the form. |
| W6-F02 | major | `w6-deliverable`; `workload`; facilitation; cautions | **Micro-lab 2 (B6.5) does not exist, yet it is promised.** The deliverable lists "Individual: … micro-lab 2 (online)". The workload budgets 0.3 h for it. Facilitation says it "runs online this week per the syllabus", and the session notes remind students of it. No listing, activity or assessment exists, and `course.ts` lacks B6.5 (known). The B-CLO4 progression therefore jumps from Week 5 reading straight to Week 10 modelling with no second reading step. Week 6 content does **not** cover definition vs usage, or attributes with units, beyond Week 5. | `WEEKLY_INSTRUCTIONAL_PLAN.md` Week 6 B6.5; `week06.ts` deliverable and workload. | Author the micro-lab: a `sysml/week06/` listing (e.g. TECH/charger fragment with typed, unit-bearing attributes and a definition/usage pair), a reading activity reusing `week05/reading.ts`, and 2–3 quiz items. Add B6.5 to `course.ts`. Until then, remove the deliverable line and the 0.3 h, and say so in `cautions`. |
| W6-F03 | major | q6-6 key and explanation; `w6-worked-risks` para 3 (R-004 "L3 × C3"); reference R-004 | **The key contradicts the course consequence scale the question tells students to use.** `risk.ts` CONSEQUENCE: C3 = "A system requirement (REQ-SYS) is missed at times"; C4 = "A stakeholder requirement (REQ-STK) … is missed; **network capacity** or service level is impaired". REQ-STK-004 (network capacity by month 24) is a stakeholder requirement about capacity, so the scale gives **C4**. The key says C3 ("missing a requirement at times is C3"). The cell is moderate either way, so option b survives, but the explanation teaches the wrong anchor. A student who applies the scale correctly finds no matching option. R-005 (turnaround > 25 min, REQ-STK-005) is rated C4 by the same anchors, so the register is internally inconsistent. | `risk.ts` CONSEQUENCE l.3–4; q6-6 option b. | Rate R-004 C4 (cell still moderate) in the worked example, the table, q6-6 and the reference (lead). Or reword the C3/C4 anchors so that occasional capacity shortfall is explicitly C3. |
| W6-F04 | major | `risk.ts` `isConditionIfThen`, `MITIGATION_IN_STATEMENT`; `srr.ts` `checkFinding` | **The heuristics accept realistic bad input (§7 rule 5).** Every probe below was accepted with errors = []. (1) Embedded mitigation: q6-5's own wrong option in register form. (2) A vague risk. (3) An **issue** written as a risk. (4) Three non-actionable SRR findings, two of them the q6-13 "wrong" answers dressed up. The activity tells students "the tool rejects findings that do not [name the artefact and request a change]"; the probes show it does not. | Risk probes: "Condition: hub pads are crowded. If we do not install pad fire suppression, then a fire will spread on the pad." · "Because the team is busy, if anything goes wrong then the project could be late." · "Condition: two chargers at hub 3 overheated last week. If they overheated, then the pad was closed for a day." SRR probes (rated "partly"): "REQ-SYS-003 is bad and we would rather add something different here please." · "TECH-002 is rated low; we would rate it differently in our own opinion overall." · "We would have done R-001 differently; please change the whole approach to everything." | Mitigation: flag `if (we\|the team\|AeroLink) (do not\|does not\|fail to) (install\|add\|use\|buy)` in the *if* clause. Issues: flag past-tense markers (`last week\|yesterday\|has (already )?\|was closed\|overheated`). Vagueness: require a consequence that names an element ID or a quantity. SRR: require the ID and the action verb in the same clause, and reject opinion markers (`we would\|in our opinion\|differently`). Add all six probes as regression tests. Soften the activity wording to "flags". |
| W6-F05 | major | quiz q6-2, q6-5, q6-6, q6-7, q6-8, q6-9, q6-14 | **Quiz items are answered verbatim by the lesson (§7 rule 6).** | q6-2: TRLs 6/5/4, "average 5.0", lowest critical 5 is worked TRL para 4. q6-5 (c): the R-008 statement word for word. q6-6: R-004 L3 × C3 moderate. q6-7: "commit to a hub only when the utility confirms capacity" is `w6-advanced` para 2. q6-8: the event-tree numbers and conclusion. q6-9: R-004 transfer, dependency and contingent strategy. q6-14: REQ-SYS-003 / TECH-002 TRL 5 / maturation plan. | Re-case each item on new technologies, risks and numbers (e.g. a cargo winch, a different hazard, a different exposure count). |
| W6-F06 | major | `workload` | **The graduate time budget is implausible and not flagged (§7 rule 3).** "Graduate risk-quantification annex, including extension readings R61 and R51" gets 1.2 h. R61 is 22 pp and R51 is 10 pp: ≈ 2.1 h at 15 pp/h before any modelling, sensitivity or the 1–2 page write-up. R61 is also cited throughout the *core* lesson (statement form, handling, issue scale) and by quiz items q6-5, q6-7, q6-9, q6-12, so it is not optional for anyone. Separately, 0.3 h is budgeted for the non-existent micro-lab (F02). `cautions` is silent; the total is held at exactly 11.0. | Register: R61 p.626–647, R51 p.50–59; `workload`. | Either name the R61 pages actually needed (p.630–646, ≈ 17 pp) as core reading and re-budget, or cut. Give the annex ≥ 2 h and record the overrun in `cautions`. |
| W6-F07 | minor | `w6-worked-quant` para 3; q6-8 key; `quant.ts` `compareWithOrdinal` | **"Defensible rating L1 × C5" for an outcome outside L1.** The C5 outcome is 0.345 %, below the L1 band (> 1 % to ≤ 20 %). The lesson says so, then calls L1 × C5 "defensible", and the tool reports `agrees: true` for an ordinal of 1. Under the DoD bands, the honest statement is "below the scale; L1 is the floor by convention". That is the very blindness the advanced block criticises. | R46 Fig. 4-9 (rendered); `quant.ts` `agrees: below && ordinal === 1`. | Word it "rate at the scale floor (L1) and record that the model puts it below the scale". Return `agrees: false` with that note. |
| W6-F08 | minor | `w6-srr` para 3 | **The adaptation statement understates what was dropped.** It says only "cost, contracting and software sizing" criteria were dropped. Also dropped without comment: system safety and hazards reviewed with mitigations allocated (R40 p.72), R&M feasibility (p.71), and M&S / digital-engineering planning (p.72). The safety omission matters in a week whose flagship risk is battery thermal runaway (R-008). | R40 p.71–72 Table 3-2. | Add an S9 "hazards reviewed and mitigations allocated", or list every dropped criterion with a reason. |
| W6-F09 | minor | `w6-worked-trl` table (TECH-001 → R-005); `trl.ts` TRL_KEY | **The maturity-risk rule is muddied.** TECH-001 is TRL 6, so the course rule requires no maturity risk. The key nonetheless assigns "R-005 (grid connection)", a utility-capacity/interface risk, not charger technology maturity. Students may conclude that any related risk satisfies the "maturity risk" rule. | `w6-trl` para 4 rule; R-005 text. | Show "— (TRL ≥ 6; external dependency R-005)" for TECH-001. |
| W6-F10 | minor | L6 step "AROU v2"; template §7; `RiskRegister` | **Issues have nowhere to go.** The lab and template require students to "separate any issue … issues listed separately", but the register tool offers only A/R/O/U, and q6-12 says issues must be "recorded and owned now". | `risk.ts` `AROUKind`. | Add an "Issue" kind (probability 1, owner, action, linked risk) or say where issues are recorded. |
| W6-F11 | minor | `w6-advanced` para 2 | **R51's strategy is stretched.** "Staged commitments" is MITRE's strategy for **evolving requirements**. The lesson applies it to unconfirmed grid connections (U-002, R-005), an external-dependency uncertainty. It is labelled instructor reasoning, but it is presented as "exactly the avoid treatment". | R51 p.56 bullets. | Present it as an analogy, or tie it to an evolving requirement (e.g. capacity target revisions). |

**§7 rule check**

| Rule | Result |
|---|---|
| 1 | ✗ (F01). |
| 2 | ✓: the CP2 `rubricScope` names RB-16.1 for the annex. |
| 3 | ✗ (F06). |
| 4 | ✓: the reference register passes `checkEntry` and `registerCompleteness`; the TRL key matches the reference. |
| 5 | ✗ (F04). |
| 6 | ✗ (F05). |
| 7 | ✓: "Unknown" is labelled as a course category; the consequence anchors are labelled as an adaptation. |
| 8 | ✓. |

**CP2 template vs syllabus §11**
- Every minimum is present: 15–20 REQ with rationale, method and parent; ≥ 3 MOE / 5 MOP / 2 TPM; trace table; 3 TECH TRLs; AROU v2 with ≥ 8 entries, ≥ 4 risks and ≥ 1 each of A/O/U on the 5×5. The live SRR-style review is included.
- The weights match §12: RB-3 40 · RB-4 20 · RB-5 30 · RB-12 10.

## Citation table

| Claim / location | Citation | Verdict | Evidence |
|---|---|---|---|
| TRA purpose; Mankins/NASA → DoD, AFRL, DoE; TRL 1–9 | R16 p.766–767 | OK | Table 1 level names match the lesson table exactly |
| TRL limits, MRL | R16 p.767 | OK | |
| IRL/SRL; COTS caution | R16 p.768 | OK | |
| Certification: airworthiness; involve agencies early; re-certification | R16 p.769 | OK | |
| Immature technologies need risk reduction (prototyping, test) | R16 p.770 | OK | |
| s-curve; TRL scale; interpret environments; architecture fit | R60 p.525 | OK | |
| Hype cycle; assess before significant investment | R60 p.524–525 | OK | |
| TRL < 6 not considered "threshold" | R60 p.526 | OK | |
| Immature → risk + mitigation; R&D > 5 years | R60 p.530 | OK | |
| Living roadmap, insertion points | R60 p.529–530 | OK | |
| Risk definitions (ISO; probability × severity; opportunities) | R17 p.481–482 | OK | |
| if–then; condition → consequence | R17 p.483 | OK | |
| No best approach; prioritisation by level or pair | R17 p.483 | OK | Source says "max(probability), max(consequence)"; paraphrase acceptable |
| Quantitative methods; model-quality caution | R17 p.484 | OK | |
| Four treatment options, hybrid, contingent strategy, buying information | R17 p.484 | OK | |
| Opportunity as dual | R17 p.484–485 | OK | |
| Pitfalls: automatic mitigation, sea of green, band-aid | R17 p.485–486 | OK | |
| Quote "Risk analysis results should be challenged because considerable input uncertainty and/or potential errors may exist." | R17 p.486 | OK (exact) | |
| RIO; closely related processes; top risks at decision points | R46 p.120 | OK | |
| ITRA; contract type by risk profile | R46 p.121 | OK | |
| RMB; shared register | R46 p.122 | OK | |
| Risk definition; early TMRR, competitive prototypes | R46 p.123 | OK | |
| Statement elements; consequence tailoring | R46 p.125 | OK | |
| Fig. 4-9 bands and cell layout | R46 p.126 | OK | **Image**: verified by rendering (levels 5..1: >80–≤99, >60–≤80, >40–≤60, >20–≤40, >1–≤20 %) |
| Handling options; alert next level; mitigation examples | R46 p.126 | OK | |
| Quote "The Condition reflects what is known today." | R61 p.630 | OK (exact) | |
| Condition–if–then construct | R61 p.630–631 | OK | |
| No mitigation in the statement; need-by refinement | R61 p.633 | OK | |
| Subjective probabilities; quantitative techniques (expected monetary value) | R61 p.635–637 | OK | |
| 1.00 = issue | R61 p.637 | OK | Table 1 |
| Document the rationale | R61 p.639 | OK | |
| Handling options incl. watch; "many, but not all"; acceptance needs approval | R61 p.642 | OK | Figure 1 rendered: identical layout |
| Transfer double-edged; revisit premises | R61 p.644 | OK | |
| Watch list; risk manager with knowledge and authority | R61 p.645 | OK | |
| Exit criteria; contingency plans and triggers | R61 p.646 | OK | |
| Security a risk in nearly every development (notes) | R61 p.629 | OK | |
| SRR purpose, four tests, risk understanding | R40 p.69 | OK | |
| SE responsibilities; review does not begin until criteria met | R40 p.70 | OK | |
| Table 3-2 criteria (verifiable, achievable given maturation, traceability, conservative requirements) | R40 p.71 | OK | |
| Key technologies, verification methodologies, certifying agencies | R40 p.72 | OK | |
| External/internal uncertainty; watchmaker | R51 p.50–51 | OK | |
| Options in designs; M&S | R51 p.53, 55 | OK | |
| Small bets / staged commitments | R51 p.56 | OK | Application stretched (F11) |
| Gate options | R06b p.385 | not re-read | Verified in the Week 2 review |

## Verified correct

**Graduate model** (independently recomputed)
- Exposure: 12 × 20 × 360 = 86,400 sessions/yr; 172,800 over the horizon. λ = 0.1728. P(any) = 1 − e^−0.1728 = 15.87 %; the binomial agrees to about 7 decimal places.
- Outcomes: 0.15552 / 0.013824 / 0.003456 expected; 14.40 % / 1.37 % / 0.345 % at least once.
- B1 at 0.01: 0.0346 % (shown as 0.035 %).
- p0 × 10: any-initiation 82.2 % (L5); C5 outcome 3.40 % (L1).

**5×5 ratings** (all reference ratings fall in the stated cells)
- R-001 L3 × C4 = M.
- R-002 L3 × C4 = M.
- R-003 L2 × C5 = M.
- R-004 L3 × C3 = M.
- R-005 L2 × C4 = M.
- R-006 L3 × C2 = L.
- R-007 L2 × C4 = M.
- R-008 L2 × C5 = M.

So "all moderate except R-006" holds. The q6-6 band arithmetic (50 % → L3) is right.

**TRL key and rule logic**
- The TRL key (6 / 5 / 4; lowest critical 5) is consistent with the R16 level names and the course ladder rule.
- `checkTrl`'s ladder, gap and maturity-risk logic is mutation-tested.

**SRR session**
- 8 × 7 = 56 min plus a 19-min debrief = 75. The pairing (k reviews k + 1) is consistent across the lab, the run-sheet and facilitation.

**Workload and quiz**
- The reading count of 31 pp is correct (R16 5 + R60 9 + R17 6 + R46 7 + R40 4). The workload sums to 11.0 h.
- Every quiz item has one defensible key. Distractors are plausible (apart from F03's explanation).

**Accessibility**
- Matrix cells carry the level as text plus a distinct border style, and have an `aria-label` and a table equivalent.
