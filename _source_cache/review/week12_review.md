# Week 12 independent review — Verification, measures and the digital thread (L12, model v0.4, RID dispositions)

Reviewer: independent adversarial reviewer (AI, Claude), 2026-10-11. No course or app file was edited. Scratch work (probe files, scratch vitest configs, outputs) is in the session scratchpad only.

Scope: commit `d130fcf`.
- `src/content/weeks/week12.ts`
- `src/activities/week12.activity.tsx` and `src/activities/week12/*`
- `sysml/week12/*.sysml`
- `docs/authoring/week12_notes.md`

Read against:
- `course.ts` (B12.1–B12.5; readings R75 sl.96–99, R49, R58, R23a, R30; extension R23b, R64)
- AUTHORING_GUIDE §7 (all eight rules)
- ASSESSMENT_RUBRICS RB-9, RB-10, RB-11, RB-16, RB-17
- LABORATORY_AND_CAPSTONE_PLAN L12, B.5, B.6, C.2
- WEEKLY_INSTRUCTIONAL_PLAN Week 12
- DECISION_LOG W9
- `engineering.ts`, `src/model/reference/*`, `sysml/reference/aerolink_v04_full.sysml`
- `week11.ts` and `week11/rids.ts`
- The extracted source pages of every citation (`scripts/source_pages.py`)

## Verdict

**REVISE (moderate). Not ready for sign-off.** What is sound:
- The SysML core and the probe table are sound. All 18 recorded probes reproduce exactly.
- The audit numbers and the thread count reproduce independently.
- The S06/S10 verification-case semantics are cited faithfully.
- The R30 exception is handled correctly.

The defects that block sign-off:
- **Quiz cue (F01).** The quiz key is the longest option in 13 of 13 items, and no item is keyed *d*.
- **REQ-STK claim (F02).** The lesson excuses the 55 % verified figure by claiming that the nine unverified REQ-STK are "validated against the MOEs by design". The reference model does not say that: five of them record test or demonstration as their verification method, and no MOE measures any REQ-STK. The claim also contradicts the lesson's own V&V convention.
- **DoD attribution (F03).** The "DoD/MITRE convention" misattributes DoD's validation baseline.
- **Disposition screens (F04).** The disposition log passes a promise as closure evidence, which the lesson says it must not.
- **Planner checks (F05, F06).** The planner rejects good criteria ("correctly", "reliably", SEBoK's MTTR-style demonstration) and passes a wrong subject, inconsistent verdict conditions and a loosened limit.
- **One-feature claim (F07).** The "one feature" claim in worked examples (b) and (c) is false for the listings themselves.
- **Rubric claim (F08).** The caution says dispositions carry no scoring criterion. RB-11.6 scores them.

Tests and type check:
- `npx vitest run src/activities/week12 src/content src/lib`: **5 files, 116/116 pass**.
- `npx tsc -b`: **exit 0, no output**.
- Lesson word count by `lessonWordCount`: **5,207**. Workload sums to **10.0 h**.

## Findings

| ID | Severity | Location | Finding | Evidence | Fix |
|---|---|---|---|---|---|
| W12-F01 | **High** | `quiz` (all 13 items) | **The longest-option cue gives away every key, and the key letters are biased.** The correct option is the longest in **13/13** items, often 2–5 times the length of the distractors: q12-8 307 chars against 77/42/63, q12-12 303 against 53/28/45, q12-13 300 against 66/54/24. Key distribution: a 3, b 6, c 4, **d 0**. A student who always picks the longest option scores 100 %. This is the same defect class as W10-F09. | Scratch count over `week12.quiz` (option text lengths; key letter per item). | Shorten each key to the decisive clause and move the justification into the explanation. Lengthen two or three distractors per item with plausible detail. Rebalance the keys to about 3–4 per letter, including *d*. |
| W12-F02 | **High** | w12-worked-audit ¶2 ("the other nine stakeholder requirements are validated against the MOEs by design (RB-10.1)"); q12-11 option c explanation ("The others are validated against MOEs by design"); answer key | **The lesson's excuse for "55 % verified" is not what the reference says, and it contradicts the course convention.** First, w12-vv ¶4 defines the course convention: verification compares the system with "its specified requirements (REQ-SYS **and REQ-STK**)". Second, in the reference model REQ-STK-002, 005, 008 and 010 record **test** as their method and REQ-STK-003, 006 and 009 record **demonstration**. Only REQ-STK-001 and REQ-STK-004 record analysis. Third, no `measures` link from any MOE targets a REQ-STK: MOEs measure NEED, CAP and MGO only. So seven of the nine unverified REQ-STK are, by the model's own data, requirements with a planned verification method and no VER. "Validated by design" is an unrecorded rationale, and it would teach graders to accept unverified stakeholder requirements. | My reproduction of `referenceUpTo(12)`. REQ methods: STK-001 analysis, 002 test, 003 demonstration (TBD-01), 004 analysis, 005 test, 006 demonstration, 007 inspection, 008 test, 009 demonstration, 010 test (TBD-02). `measures` targets: no REQ-STK from any MOE; MOP-002 → REQ-STK-005, MOP-004 → REQ-STK-002, MOP-008 → REQ-STK-008. | Choose one rule and state it. One option: a REQ-STK counts as verified through the VERs of its REQ-SYS children, and is validated only where it reads an MOE (REQ-STK-001, 004). Another: the reference gets VERs or validation records for the REQ-STK it marks test or demonstration. Then rewrite worked (d) ¶2 and the q12-11 explanation to match. The lead owns the reference. |
| W12-F03 | Medium | w12-vv ¶4 ("The course convention … follows the DoD and MITRE wording"); w12-advanced ¶3 ("DoD and MITRE … validate against the stakeholders' operational need (R49 p.149–150)"); misconception 1 | **The DoD baseline is misstated (OVERCLAIM), in the very block that teaches rule 7.** R49 p.149 verifies against "the system performance specification and functional and allocated baselines". R49 p.150 validates for compliance "with stakeholder performance requirements" in the intended operational environment. So DoD validates against stakeholder *requirements* (REQ-STK in course terms), which is exactly what the lesson presents as SEBoK's divergent view ("validation … (system and/or stakeholder) requirements", R23a p.639). Placing REQ-STK under verification is the course's choice, not DoD's wording. MITRE p.433 ("customer's operational need") supports the lesson's wording; DoD does not. | R49 p.150 text: "complies with stakeholder performance requirements"; the lesson quotes this correctly in w12-vv ¶2 and then drops it in ¶4 and in the advanced block. | Label the convention "course convention, following MITRE p.433. DoD p.150 validates against stakeholder performance requirements." In w12-advanced ¶3, put DoD next to SEBoK on the validation baseline. Reconcile with F02. |
| W12-F04 | Medium | `dispositions.ts` `EVIDENCE`, `CHANGE_VERB`, `CRITERION`, the deferral rule; test "an acceptance without a findable change…" | **The disposition screens pass realistic bad dispositions (rule 5), contrary to the lesson's "closed by evidence, not by a promise".** Probes that **pass every screen**: (D1) accept, with change "Will change REQ-SYS-001 next week." and evidence "Will run the checker afterwards."; (D2) evidence "Audit pending."; (D7) change "Recorded the RID against REQ-SYS-001.", evidence "See the log."; (D3) reject a **major** RID with "We disagree with this RID on REQ-STK-004 and the instructor was told about it." Here any REQ ID satisfies `CRITERION` and "instructor" satisfies the confirmation rule; (D4) defer a major RID "by CP5 if time allows, otherwise after the course.", because only "after CP5", "Week 15+" and "next term/course/release" are caught. The tests use only trivially bad text ("Done and looks fine now."). | Scratch `probe.test.ts` against `checkDisposition`. | Reject future or conditional tense in change and evidence (will, pending, planned, if time, later). Require evidence of a past run (e.g. "run … N errors" or a link ID or line). Drop bare REQ IDs from `CRITERION`, or require a criterion token as well (RB-x.y or a page). Make the major-deferral check positive: the change must name CP5 or earlier and contain no "after", "otherwise" or "if". Add D1–D4 as failing tests. |
| W12-F05 | Medium | `planner.ts` `VAGUE`, `CIRCULAR`, the demonstration rule, `DESIGN_ID` | **The planner rejects good plans, and one message misquotes its own source.** (G1) The reference VER-004 criterion with "correctly" added ("A hold is correctly placed for all 20 injected exceedances …") gets ✗ "not measurable". (G7) The VER-008 criterion with "reliably" added gets ✗. (G3) The VER-001 criterion plus ", which complies with REQ-SYS-001" gets ✗ "restates that the requirement is met", although it carries the number, the comparison and the sample. (G2) A demonstration of an MTTR ≤ 2 h requirement gets ✗ "Demonstration relies on observation without physical measurement (R23a p.639)". **R23a p.639 says the opposite:** demonstration "may be appropriate when requirements or specification are given in statistical terms (e.g. mean time to repair …)". (Code inference) A demonstration criterion that quotes REQ-SYS-004's own "next 30 min" forecast window is blocked for the same reason. (G6) A subject named ENT-001, for an enterprise-level requirement, is blocked. | Scratch probes G1–G7 (output in the probe table). R23a p.639 Table 3, Demonstration row. | Narrow the vague-word list, or apply it only when no number and comparator follow. Fire `CIRCULAR` only when the criterion has no number. Turn the demonstration rule into a warning (?) that cites both R49 p.149 and R23a p.639's statistical exception. Allow ENT-/EXT- subjects. Add good-input tests (rule 4 covers only reference items verbatim). |
| W12-F06 | Medium | `planner.ts` `checkPlan` (subject, verdict logic, limit check) | **The planner passes realistic bad plans, including the silent passes the lesson lists.** All of these give **no message**: (B1) VER-001 with subject "PHY-008 fire detection", the very defect the facilitation note says students make, which the workspace could detect from `satisfies` links; (B2) pass "≤ 20 min", fail "> 25 min" (20–25 is undecided); (B6) pass "all 30 charges >= 20.0 min" (reversed); (B4) fail "exceeds 20 min", inconclusive "is over 20 min" (only exact string equality is checked); (B3) a criterion of "≤ 22 min (requirement 20 min, 2 min allowance)", where the requirement's value appears, so the limit check passes; (B5) "All 30 charge tests performed well at the hub". | Scratch probes B1–B6. | Check that the subject is (or contains) a satisfier, or the subject definition, of the target requirement, as a warning. Check that the pass and fail thresholds equal the requirement limit and are complementary. Compare the comparator direction with the requirement constraint. Use the smallest or largest criterion value rather than "any value equals". Add "well" and similar words to the vague list. |
| W12-F07 | Medium | w12-measures ¶2 ("So the measure, the requirement and the verification refer to one feature"); w12-worked-vercase ¶2 ("the number 20 is written once"); probe-table row "PassIf with the comparison reversed — rule: PassIf checks the requirement for the given values (S10 sl.97)"; `aerolink_moe_mop.sysml` l.61–63; `aerolink_ver001_charge_time.sysml` l.43–47 | **The listings do not do what the text says, and they depart from the cited S10 pattern without saying so.** VER-005 compares its own attribute `measuredLatencyP99`, not `scheduling.assignmentLatencyP99` (MOP-001). VER-001 compares `maxMeasuredChargeTime`, not MOP-002. So the verification does not refer to the measure feature. That is the "two features that can drift apart" weakness q12-8 penalises, moved into the case. Both cases also re-write the requirement's comparison operator (`<=`) inside PassIf, instead of evaluating the requirement as S10 sl.96–97 does (`PassIf(vehicleMassRequirement(vehicle = testVehicle, massActual = …))`, with `massActual == vehicle.mass` asserted in the requirement). The duplicated operator is exactly what lets the "reversed comparison" silent pass happen. The S10 form is accepted by the checker (author pb11; my q17 PASS). | The listings read in full; S10 sl.96–97; probe q17. | Either adopt the S10 form: give the requirement an `in` parameter for the measured value, bound to the subject's MOP, and call the requirement in PassIf. Or keep the course form, state that it duplicates the comparison and why, and correct "refer to one feature". |
| W12-F08 | Medium | `cautions` ("Dispositions have no scoring criterion … a criterion has to be added"); `rubricScope`; notes open issue 4 | **A scoring criterion for dispositions exists.** RB-11.6 "Review conduct (5): On time; findings recorded; **peer findings dispositioned**" is part of RB-11, which carries 30 % of CP5. "No grade points attached here (L12)" is true. "No scoring criterion" and the proposed new RB-17.4 are not. | ASSESSMENT_RUBRICS RB-11 row 11.6; syllabus CP5 weights. | Say in the caution and the rubric scope that RB-11.6 scores dispositions at CP5, and that L12 feedback is formative against it. Withdraw or reframe open issue 4. |
| W12-F09 | Medium | `workload` ("Required S06 extract p.173–176 (R84)"); citations in w12-methods, w12-vercase, w12-advanced; q12-4, q12-5, q12-6 (R84); q12-7, q12-8 (R78) | **The reading-register gap is honest but unresolved (same class as W9-F06).** R84 appears in **no** `course.ts` week, yet the lesson calls it required, and the verdict meanings and three quiz items depend on it. R78 is a **Week 13** reading (sl.147–159), cited forward by two quiz items and the measures block. The pages themselves are correct: S06 §7.24 sits on PDF p.173–176 (printed 141–144) inside R84's verified range p.170–177; p.172 and p.177 hold §7.23.3 and §7.25 and are correctly not cited. | `course.ts` l.214–215 and l.228; R84 p.172–177 read in full. | Add `{ reading: 'R84', pages: '173–176' }` and `{ reading: 'R78', pages: '149' }` to the Week 12 readings, and update the weekly plan's page count. Otherwise, re-anchor the items. |
| W12-F10 | Medium | `audit.ts` (childless rule, `elements`/`links`, `auditMarkdown`); w12-thread ¶2 (cites R45 p.118) | **The audit cannot see the childless parent that R45 defines, and the export is not fully reproducible.** R45 p.118 defines a childless parent as a *higher-level requirement* that is not addressed "by lower-level requirements and system element designs". The tool counts childless NEED and CAP only, and reports satisfy and verify gaps for REQ-SYS only. A new REQ-STK with a parent and **no child, no satisfier and no VER yields zero gaps** (probe). Separately, the export prints `m.elements.length` and `m.links.length`, which include retired elements, although rule 1 says the population is active elements only: retiring PHY-008 still reports 204/381. The export also carries no model identity (date, element-set digest or per-requirement list), so "someone else reaches the same numbers from the same model" cannot be confirmed. | Scratch `stk.test.ts`; `audit.ts` l.124–125. | Add a gap kind "REQ-STK with no child requirement and no satisfier (R45 p.118)". Report the active counts. Add a timestamp and a short hash of the sorted active IDs and links, plus a per-requirement coverage table, to the export. |
| W12-F11 | Medium | q12-2, q12-5, q12-8, q12-12 | **Lesson text answers quiz items (rule 6), and the Bloom labels are inflated.** q12-2 swaps exactly the two rows of the measures table (MOE-001 validation; MOP-001/REQ-SYS-005 verification by VER-005). q12-5 is w12-advanced ¶2 with VER-004 → VER-010 and TBD-01 → TBD-02: placeholder run, "logic works", inconclusive, re-run. q12-8's key is the lab step's own sentence ("Make each MOP the attribute its requirement constrains"). q12-12 repeats worked (e) RID-T4-02 (reject a major RID that asks for more than the rubric requires, cite the rubric, confirm with the instructor) plus the methods block's "use only testing" and "default test everywhere". q12-5 and q12-12 are labelled Evaluate but need only pattern transfer (Apply). | Lesson blocks against the quiz items. | Re-case these four, e.g. a measure whose V&V class is genuinely arguable; a TBD case where error rather than inconclusive is right; a RID whose rejection would be *wrong*. Or relabel the Bloom levels. |
| W12-F12 | Medium | `workload`; caution 7; AUTHORING_GUIDE §7 rule 3; WEEKLY_INSTRUCTIONAL_PLAN Week 12 ("includes RID dispositions and behaviour finalisation") | **The workload is understated, and behaviour finalisation is budgeted nowhere.** (a) The lesson is 5,207 words, above rule 3's ≈ 4,000–5,000. (b) The "lesson + four activities" line is 1 h. The planner alone asks for three complete plans with every ✗ cleared, and the log asks for every RID; realistically about 1.5 h, unless these are counted inside L12, in which case say so. (c) RID fixes get 0.2 h, which the author already doubts. (d) The graduate argument gets 1 h for 7 pp of R64 (≈ 0.5 h at 15 pp/h) plus a five-part argument with a quantitative validation requirement; ≈ 1.5 h is realistic. (e) The S06 extract (4 pp of specification) is read at 20 pp/h, faster than the guide's 15 pp/h. (f) The weekly plan puts behaviour finalisation in Week 12, and B.5 needs the final behaviour at CP5. The lesson moves it to CP5 ("the L13 behaviour pass", see F13), but L13 is the exam-week impact lab (In 0 / Out 3). | Workload rows; lab plan L13 row and CP5 row ("Tight … Behaviour finalised"). | Trim about 300 words (e.g. the application block). Record the realistic total (≈ 11 h graduate) in `cautions`. Name the week and budget in which behaviour is finalised, and align the weekly plan. |
| W12-F13 | Low | `MODEL_DISPOSITIONS` RID-T4-04 reason; worked (e) | **The model log names a process step that does not exist.** "the A3 branch is planned with the L13 behaviour pass": L13 has no behaviour task. | Lab plan L13 row. | Say "before CP5 submission (Week 14), owner RP". |
| W12-F14 | Low | caution 5; notes open issue 5 | **The hop-type count is imprecise.** "The hops use 7 of the course's 10 relationship types" holds for thread 1. The rule also admits `refines` (step 4 chains) and `mitigates` (step 11), so a complete thread can use up to 9. Thread 1 itself has 11 links, because step 4 is two links. | `threadsFrom` in `engineering.ts`; THREAD_STEPS. | Say "7–9 of the 10 types, depending on the thread". |
| W12-F15 | Low | `TraceAudit.tsx`; `audit.ts` `dispositionProblem` | **Minor screen and predict-first weaknesses.** "Predict first" is not enforced: Compute works with blank predictions. A non-numeric prediction renders "off by NaN points". The gap-disposition screen accepts "We will look into this gap at some point", which has no action, no owner and no tracking. | Component code; probe. | Disable Compute until both predictions parse. Require an owner token (initials or a role) or a tracking token (CP, @Issue, AROU) in the gap disposition. |
| W12-F16 | Low | Lab step "In class — verification cases (25 min)" | **The in-class segment is over-scoped.** Three planner entries, three SysML cases with method, subject, objective, recorded results and verdict logic, and a checker run do not fit in 25 min. | Lab steps against Session 2. | Say "plan all three and model one in class; the rest out of class". |
| W12-F17 | Low | q12-10 explanation; w12-advanced ¶1 | **A mild R30 overclaim.** "A digital thread is only useful if the relationships it links are the real ones (R30 p.1394)": R30 says that an ontology is needed to link the models "in a cohesive and useful manner", and that the thread "would be the authoritative source of truth". The "only as true as its links" inference is the instructor's own. The advanced block marks it as such; the quiz explanation does not. | R30 p.1394. | Mark it as an inference, e.g. "(instructor reasoning from R30 p.1394)". |
| W12-F18 | Low | q12-13 key ("defer it to CP5 at the latest"); `checkDisposition` deferral rule | **A wording conflict with Week 11.** Week 11's scale says a major RID "must be fixed **before** CP5". Week 12 keys and screens accept a major deferral "to CP5". The intent is probably the same (by the CP5 submission), but the wording conflicts. | `week11/rids.ts` l.15; `week11.ts` l.180. | Use "fixed by the CP5 submission" in both weeks. |

## Citation fidelity (every citation in week12.ts)

| Citation | Where | Claim | Result |
|---|---|---|---|
| R23a p.634 | w12-vv ¶1; q12-9; advanced | Verification = confirmation through objective evidence that specified requirements are fulfilled; purpose is finding faults; separate from validation but performed together with it | **OK** |
| R23a p.635 | w12-vv ¶1; q12-1 | Verification action: definition (element, reference) and performance (obtain, compare, deduce); any element can be verified; requirement and design verification | **OK** (Table 1) |
| R23a p.636 | w12-vv ¶3; q12-2c; misconception | Binary against value judgement; one element against a set; validation presupposes verification | **OK** |
| R23a p.637 | w12-methods; worked (b) | Simulation and peer review listed among strategy techniques | **OK** |
| R23a p.638 | worked (e); application; q12-9, q12-13 | Issue/trouble reports and change requests as outputs; verification-matrix contents; results compared before a status is recorded | **OK** (also stated on p.637) |
| R23a p.639 | w12-methods; worked (a); q12-3, q12-12; planner messages | Table 3 techniques; validation "(system and/or stakeholder) requirements" | **OK** in the lesson. **OVERCLAIM in the planner**: the demonstration message cites p.639 for "without measurement", but p.639 allows demonstration for statistical requirements (F05) |
| R23a p.640 | methods; thread; advanced; q12-3, q12-11, q12-12 | Pitfalls (confusion of baselines, no strategy, use only testing); ending criteria and coverage rates; start early | **OK** |
| R23b p.648 | advanced | Table 2: verification baseline = system design; validation = system (and stakeholder) requirements | **OK** (extension reading, labelled) |
| R49 p.149 | vv; methods; application; q12-2, q12-3 | Verification definition and the "Did you build…" quote; begins in requirements analysis; matrix in the baselines; demonstration and examination; analysis incl. analysis of test data | **OK** |
| R49 p.150 | vv; methods; advanced; continuity | Test; cost-effective combination; FCA/SVR; repeat verification after a design change; validation definition, independent testers, end users | **OK** as cited in w12-vv ¶2. **WRONG/OVERCLAIM** in ¶4 and advanced ¶3: DoD validates against stakeholder performance requirements, not "operational need" (F03) |
| R58 p.433 | vv; advanced | MITRE definitions (previous phase; operational need, most realistic environment) | **OK** |
| R58 p.434 | vv; q12-2d | V&V and T&E are integrated activities, not separate stages | **OK** |
| R58 p.437 | application | Undisciplined verification (missing entry/exit criteria) hides gaps until OT&E; establish the intended use of M&S at the start | **OK** |
| R30 p.1394 | thread; advanced; q12-10 | DE models over the life cycle; shared schemata; MBSE a subset; ontology needed for the thread; authoritative source of truth | **OK**. Two sentences are merged, but faithfully. The "SysML 2.0" wording is correctly not repeated. Only p.1394 is cited, which is correct given the declared exception (the reference list starts on p.1395). q12-10's explanation is a mild OVERCLAIM (F17) |
| R45 p.118 | thread; worked (d) | Bidirectional trace; no orphans; no childless parents | **OK** as a quote. The tool implements a narrower definition (F10) |
| R75 sl.96–99 (S10) | vercase; worked (b); probe table | Verification case definition; VerdictKind values; objective declares the requirements; subject auto-binding; PassIf; usage with a restricted subject; verification system; individuals pass and fail | **OK**. The listings depart from sl.97's PassIf-on-the-requirement pattern without saying so (F07) |
| R84 p.173 (S06) | vercase; advanced; q12-4, q12-5, q12-6, misconception | Verdict meanings; unit under test; subject general in the definition and specific in usages | **OK** (PDF p.173 = printed 141). Not a Week 12 reading (F09) |
| R84 p.173–174 | vercase; q12-6 | Collect, analyse (distribution, mean, sd), evaluate | **OK** |
| R84 p.176 | vercase; methods; probe rows | verify = subrequirement and required constraint of the objective, subject bound by default; VerificationMethod inspect/analyze/demo/test; PassIf | **OK** |
| R84 p.172–177 (notes) | notes "pages read" | §7.24 sits on p.173–176 inside R84's range p.170–177 | **OK and honest**: p.172 is §7.23.3 trade-off, p.177 is §7.25 use cases; neither is cited |
| R83 p.168 | vercase; probe row | satisfy is an assert constraint usage | **OK** (Week 10 extension; prior reading) |
| R78 sl.149 (S10) | worked (b) row; measures; q12-7, q12-8 | ParametersOfInterestMetadata `<moe>`/`<mop>` annotate a Usage; baseType is an attribute; no "measures" and no TPM | **OK**. It is a Week 13 reading cited forward (F09) |
| R64 p.475–479, 481–482 | assignment section 6; answer key | Intended use; verification and validation definitions (p.477); Table 1 (p.476); Type I/II and CI requirement (p.479); partial validation, subsystem credibility, hidden tool assumptions (p.481); discrete-math extremes and rounding (p.482) | **OK** (extension, graduate) |
| S13 p.286 | instructor notes only | Reversed V&V sentence, shown and not cited | **OK**: the author's instructor-only handling is correctly fenced |

## Probes re-run (release 2026-08, 2026-10-11; one JVM, `tasklist | grep -i java` empty before the run; report at scratchpad `w12/report.json`)

All 20 of my probe files and the 3 lesson listings were run in one run: 23 files, 14 PASS, 9 FAIL.

| # | Construct (author ID) | Author's record | My result | Lesson table / quiz consistent? |
|---|---|---|---|---|
| q00 | Baseline case | — | PASS, no message | — |
| q01 | `verify charger;` (pb01) | FAIL "A requirement must be typed by one requirement definition." + WARNING | **Same** | Yes |
| q02 | Case subject ChargingSystems verifying an aircraft requirement (pb02) | PASS | **PASS, no message** | Yes ("silent pass") |
| q03 | `return verdict : Boolean` (pb03) | PASS | **PASS** | Yes |
| q04 | `verdict : VerdictKind = m <= …` (pb04) | PASS + WARNING conforming types | **Same** | Yes |
| q05 | Reversed PassIf (pb05) | PASS | **PASS** | Yes |
| q06 | `VerificationMethodKind::simulation` (pb06) | FAIL unresolved + WARNING | **Same**; the lesson listing also FAILs on l.33 | Yes |
| q07 | No objective (pb07) | PASS | **PASS** | Yes |
| q08 | `verify LatencyLimit;` (definition) (pb08) | FAIL unresolved Feature | **Same** | Yes |
| q09 | verify outside the objective (pb09) | FAIL syntax + cascade | **Same** | Yes |
| q10 | Usage `subject :> aircraft1` (pb10) | PASS | **PASS** | Yes |
| q12 | `#moe part def` (pb12) | FAIL "Cannot annotate PartDefinition" | **Same** | Yes |
| q13 | `#moe part` usage (pb13) | FAIL typing | **Same** | Yes |
| q14 | No verdict (pb14) | PASS | **PASS** | Yes |
| q15 | `VerdictKind::partial` (pb15) | FAIL unresolved | **Same** | Yes |
| q16 | `objective { satisfy r1 by charger; }` (pb16) | PASS | **PASS** | Yes |
| q17 | S10 sl.97 form `PassIf(r1(chargingSystem = testCharger))` (pb11) | PASS | **PASS** | Yes; it shows the S10 form is usable (F07) |
| q18 | (own) `verify r1; verify r2;` with different requirement subjects | — | PASS, no message | A further silent pass; worth adding to the self-review list |
| q19 | (own) `#moe requirement …` | — | FAIL "A requirement must be typed by one requirement definition." | Supports q12-7 option c being wrong |
| q20 | (own) `#mop` on an attribute declared inside the verification case | — | PASS, no message | Supports q12-8: the bad pattern passes silently |
| listings | `aerolink_ver001_charge_time`, `aerolink_moe_mop` | PASS, no diagnostics | **PASS, no diagnostics** | Yes. The line references in worked (b) and (c) were checked and are correct |

### Activity probes (pure logic, scratch vitest)

| Probe | Input | Result | Correct? |
|---|---|---|---|
| G1 | VER-004 criterion with "correctly" | ✗ untestable | **Rejects good** (F05) |
| G2 | MTTR ≤ 2 h by demonstration | ✗ citing R23a p.639 | **Rejects good, misquotes the source** (F05) |
| G3 | VER-001 criterion + "which complies with REQ-SYS-001" | ✗ circular | **Rejects good** |
| G4 | VER-002 + "background at least 10 dB below" | no message | OK |
| G5 | VER-001 limit in seconds (1200 s) | no message | OK |
| G6 | REQ-STK-004, subject ENT-001 | ✗ subject | Rejects good |
| G7 | VER-008 + "reliably" | ✗ untestable | **Rejects good** |
| B1 | VER-001, subject PHY-008 | no message | **Passes bad** (F06) |
| B2 | fail "> 25 min" against a 20 min limit | no message | **Passes bad** |
| B3 | "≤ 22 min (requirement 20 min …)" | no message | **Passes bad** |
| B4 | inconclusive paraphrases fail | no message | **Passes bad** |
| B5 | "All 30 charge tests performed well" | no message | **Passes bad** |
| B6 | pass "≥ 20.0 min" | no message | **Passes bad** |
| B10 | VER-010 inconclusive without TBD-02 or U-002 | ✗ | OK |
| B11 | Test of REQ-SYS-003 | ? long horizon, ? method | OK |
| D1, D2, D7 | Accept with a promise or "pending" as change and evidence | pass all screens | **Passes bad** (F04) |
| D3 | Major rejection citing only a REQ ID, "instructor was told" | pass | **Passes bad** |
| D4 | Major deferral "by CP5 … otherwise after the course" | pass | **Passes bad** |
| D5 | Rejection citing "Week 10 lesson worked example (c)" | ✗ | Debatable; acceptable |
| D6 | Accept-modified with evidence "re-read against interface definitions" | ✗ evidence | Mildly strict (the model log's own RID-T4-03 passes only because it says "Checker run") |
| Audit | New REQ-STK with a parent only | gaps = [] | **Misses a dead-end requirement** (F10) |

## Audit reproduction (independent code over `referenceUpTo(12)`; `referenceUpTo(14)` is identical because there is no week 13/14 file)

- **204 elements, 381 links** ✓. No duplicate IDs, no dangling links. 14 STK, 11 NEED, 10 CAP, 20 REQ, 11 VER, 6 MOE, 9 MOP, 3 TPM.
- **Link types present: 10** (derives-from 144, affects 75, measures 41, allocated-to 41, performs 21, flows-to 18, satisfies 15, mitigates 12, verifies 11, refines 3).
- **Parent 20/20** ✓. REQ parents: NEED ×10, CAP ×12, REQ-STK ×9.
- **Satisfied 12/20** ✓ (REQ-SYS 10/10; REQ-STK-007 ← PHY-002, REQ-STK-009 ← IF-003).
- **Verified 11/20** ✓ (REQ-SYS 10/10; REQ-STK-007 ← VER-011).
- **Childless: NEED-011 only** ✓, under the NEED/CAP rule. NEED-011 is still reached downward through CAP-005 → REQ-STK-003 → REQ-SYS-004; this is consistent with DECISION_LOG W9.
- **Stakeholders with no need: STK-008, 011, 012, 013** ✓.
- **Complete threads: 26 from 10 stakeholders** ✓, reproduced with my own walker: STK-001 4, 002 4, 003 4, 004 2, 005 4, 006 1, 007 2, 009 1, 010 2, 014 2. Every path that reaches step 10 also finds a risk.
- **STK-005: 6 threads, 4 complete** ✓. Two of the four are the PHY-004 → INFO-001 variants, as the advanced block says.
- **Thread 1 hop by hop** ✓, as in the worked-example table:
  - Step 4 = REQ-SYS-001 derives-from REQ-STK-005 derives-from CAP-003 (two links).
  - Step 9 = VER-001 verifies REQ-SYS-001.
  - Step 10 = MOP-002 measures REQ-SYS-001.
  - Step 11 = R-001 affects CAP-003.
- **"11 link types"**: THREAD_STEPS has 11 *steps*; LinkType has 10 types. The lab plan's "traverse all 11 link types" is impossible, and the lesson correctly says "11-step" and flags it. The count of types used is imprecise (F14).
- **Reference VERs pass the planner with no warning** ✓ (11/11).
- **VER-004** is inconclusive until U-001 closes, consistently in the reference, worked (a), advanced ¶2 and the planner's TBD rule ✓. VER-010 matches for U-002 ✓.

## Verified correct (no finding)

- **The SysML listings.** Both conformant listings PASS clean, and the invalid listing fails for the stated reason. Every line reference in worked (b) and (c) is correct. The "what the checker checks" table matches all 14 rows I re-ran. The lesson correctly says that the checker enforces names and kinds and evaluates nothing.
- **Verification-case semantics.** Pass, fail, inconclusive and error are given with S06 meanings. verify is a subrequirement and required constraint. Subject binding is correct. The satisfy-against-verify distinction (assertion against evidence) is correct.
- **Method names kept apart.** DoD examination, SEBoK inspection and SysML `inspect` are named separately. Simulation is recorded as `analyze`, with a doc, which is correct, and the invalid listing demonstrates why.
- **MOE/MOP.** The library facts are correct: #moe and #mop annotate usages, record nothing about what they measure, and there is no TPM metadata. The `#measures` and TPM conventions are labelled as the course's.
- **R30 handling.** Only p.1394 is cited, with no "SysML 2.0 as a standard" wording. The caution explains the declared exception correctly.
- **Rule 1 (provenance).** The planner renders `ProvenanceOwnerFields`, requires initials and passes `{owner, provenance}` to `apply()`. The component test confirms owner JD and AI-suggested-reviewed are stored. The disposition log records the owner and provenance per entry. The explorer and the audit are read-only.
- **Rule 2.** The graduate task is always read, with formative feedback on RB-10.2, informing RB-16.1.
- **Rule 8.** The Team Kestrel and T4 IDs do not collide with the reference.
- **Tests that can fail.** The mutation tests that move audit numbers and threads are genuine: removing VER-001's verifies link drops thread 1 to step 8, and the orphan, unsatisfied and unverified gap kinds and the missing-method count each move.
- **Accessibility.** The step bar has an sr-only "n of 11 steps". ✓, ✗ and ? always come with words. Controls are labelled. The tables have captions and row headers.
- **Session run-sheets** add up (75 and 75). The CP5 weights match the syllabus (14 %; RB-8 25, RB-9 30, RB-10 15, RB-11 30).
- **Continuity.** It holds with Week 5 (RB-4.1 definitions), Week 10 (satisfy gap, R83 p.168) and Week 11 (RID form, severity scale, days 1–3 timing, the IN-07-style A3 finding deferred as minor). The exception is the wording conflict in F18.
- **The author's disclosures are honest:** R84 is not a Week 12 reading, S13 p.286 is instructor-only, the lab plan's "11-link" wording is flagged, and the verdict-wording note in reference_model_notes is flagged. The disclosure about RID points is wrong (F08).
