# Assessment Rubrics

**Status:** PROPOSAL, **revision 1** (2026-10-09), after external review round 1. CLO tags regenerated from the single evidence map (`COURSE_OUTCOME_ASSESSMENT_MATRIX.md` §4).

These are author recommendations **[REC]**, not official course instruments.
The official weights of the graded items they apply to are in S01/S02 (Pathway A) and in the proposed syllabus (Pathway B).

## 0. How the rubrics work

**Scale (all criteria)**

| Level | Name | Meaning |
|---|---|---|
| 4 | Exemplary | Correct, complete, justified with evidence; would pass a professional review with minor comments |
| 3 | Proficient | Correct and complete; justification present but uneven. **Attainment threshold for outcome assessment** |
| 2 | Developing | Partly correct or incomplete; reasoning weak or unsupported |
| 1 | Beginning | Attempted; major errors or misconceptions |
| 0 | Missing | Not present |

**Scoring:** item score = Σ (criterion weight × level / 4). The criterion weights within a rubric sum to 100.

**Outcome tagging:** each criterion is tagged with the CLOs it evidences, in the form `B-CLOn`, `A1-n` or `A2-n`. The tags are what `COURSE_OUTCOME_ASSESSMENT_MATRIX.md` aggregates.

**Validity safeguards [REC]**
1. **Calibration.** Before grading CP2/CP4 (B) or the Requirements Package and Week-10 review (A), every grader independently scores two anchor submissions. Graders then reconcile. Target: same level on ≥ 80 % of criteria.
2. **Sampling for scale.** RB-3 audits a random sample of 10 requirements per team, not every requirement. The sample is drawn by the grader, not chosen by the team.
3. **Evidence over polish.** Formatting and visual quality are never more than 10 % of any rubric.
4. **Individual accountability.** Team rubrics are paired with RB-11.5 individual Q&A, RB-13 peer evaluation and element ownership tags.
5. **Model validity (scope: RB-8 only; revised for review M4).**
   - Parse errors are graded as defects inside RB-8.1.
   - If the model has **more than 2** parse errors at submission, criteria RB-8.2–8.6 are capped at **level 2**, not 1, and the team gets a **24-hour repair window**. A repaired model is regraded with a fixed 10 % deduction on RB-8.
   - The gate does **not** apply to RB-9, RB-10 or RB-14.
   - "Parse" means: accepted by the **course-designated checker** named in the syllabus addendum. Until FD-08 designates one, RB-8.1 is assessed by instructor syntax review against the course errata sheet (review C1).
6. **Tags.** CLO tags must match `_source_cache/verification/clo_evidence.py`; `consistency_check.py` asserts the RB-14 and RB-12 tags. When the script changes, the tags follow it.
7. **IDs.** The course IDs (C.2 of the lab plan) are *human-readable short names*. The tool's internal element identifiers are separate and managed by the tool (S06 p.49).

---

## RB-1 Stakeholder analysis and system context
| # | Criterion (weight) | 4 | 3 | 2 | 1 | CLO |
|---|---|---|---|---|---|---|
| 1.1 | Boundary and context (20) | SoI and boundary stated and justified; external systems complete for the scenarios; rejected boundary options discussed | SoI and boundary clear; context mostly complete | Boundary ambiguous or inconsistent with later work | Boundary missing or equal to a single product without justification | B-CLO1, A1-1 |
| 1.2 | Stakeholder identification and classification (25) | Meets minimum count; all S04 classes; non-obvious stakeholders (e.g. maintainers, emergency responders, community) with rationale | Meets minimum; classes sensible | Below minimum or missing whole classes | Short list of customers/users only | B-CLO1, A1-1 |
| 1.3 | Interests, concerns, influence (30) | Each stakeholder has a specific concern, an influence/interest rating **with rationale**, and identified conflicts between stakeholders | Concerns and ratings present; rationale for most | Generic concerns ("wants safety"); ratings without rationale | Concerns absent | B-CLO1, A1-1 |
| 1.4 | Relationships and dynamics (20) | Stakeholder relationships and ≥ 1 feedback or emergent effect explained with a causal argument | Relationships shown; dynamics mentioned | Relationships only as a hub-and-spoke list | None | B-CLO1, A1-1 |
| 1.5 | IDs, AROU v0, presentation (5) | IDs stable; AROU entries linked to stakeholders; diagram legible with text equivalent | Minor gaps | Inconsistent IDs | No IDs | B-CLO1, A1-1 |

## RB-2 Needs, capabilities and ConOps
| # | Criterion (weight) | 4 | 3 | 2 | 1 | CLO |
|---|---|---|---|---|---|---|
| 2.1 | Mission, goals, objectives (15) | Measurable objectives traced to stakeholder concerns | Mostly measurable | Vague goals | Missing | B-CLO2, A1-2 |
| 2.2 | Need statements (25) | Solution-free, stakeholder-attributed, conditions stated; no "shall" | ≤ 2 needs with embedded solutions | Many solution-laden or untraced needs | Needs are requirements or features | B-CLO2, A1-2 |
| 2.3 | Capability analysis (25) | Capabilities derived from needs, decomposed, with gaps identified | Derived and partly decomposed | Listed but not derived | Missing | B-CLO2, A1-2 |
| 2.4 | ConOps and scenarios (30) | Required scenarios incl. off-nominal; actors, preconditions, steps, alternates, end states; operational constraints and environment | Scenarios complete; alternates thin | Nominal only, or steps without actors | Narrative without scenarios | B-CLO2, A1-2 |
| 2.5 | Traceability and AROU (5) | All NEED → STK and CAP → NEED links present | Minor gaps | Several gaps | None | B-CLO2, A1-2 |

## RB-3 Requirements (sample-based audit)
Procedure: the grader draws 10 requirements at random and scores 3.1–3.4 as **the percentage of the sample that meets each condition**.
Scoring: ≥ 90 % → 4, 75–89 % → 3, 50–74 % → 2, < 50 % → 1. Criteria 3.5–3.6 are judged on the whole set.

| # | Criterion (weight) | Condition checked per requirement | CLO |
|---|---|---|---|
| 3.1 | Well-formed (20) | Single "shall"; clear subject; no vague terms (e.g. "user-friendly", "adequate") without a measurable criterion; solution-independent at its level | B-CLO2, A1-2, A2-1 |
| 3.2 | Verifiable (20) | Measurable criterion or explicit TBD/TBR with an AROU entry; verification method stated (inspect/analyze/demo/test) and appropriate | B-CLO2, A1-2, A2-1 |
| 3.3 | Rationale (15) | Rationale explains *why*; it does not restate the requirement | B-CLO2, A1-2, A2-1 |
| 3.4 | Parent trace (15) | Traces to a NEED/CAP (or a higher REQ) that actually motivates it | B-CLO2, A1-2, A2-1 |
| 3.5 | Set quality (20) | 4: complete for the scenarios, consistent, no duplicates, types balanced (functional/performance/interface/constraint), quality characteristics per S12 p.144 respected. 3: minor gaps. 2: conflicts or obvious omissions. 1: a list of features | B-CLO2, A1-2, A2-1 |
| 3.6 | Audit response (10) | 4: every peer/AI finding accepted or rejected with a reason. 3: most. 2: few. 1: none | B-CLO6, A1-2, A2-4 |

## RB-4 Measures (MOE/MOP/TPM)
| # | Criterion (weight) | 4 | 3 | 2 | 1 | CLO |
|---|---|---|---|---|---|---|
| 4.1 | Correct classification and definitions (35) | MOE = mission/user effectiveness; MOP = system characteristic; TPM = tracked design parameter with threshold/margin; all definitions correct and operational | ≤ 1 misclassification | MOE/MOP confused in several places | Measures listed without distinction | B-CLO2, A1-3 |
| 4.2 | Hierarchy and linkage (35) | Every MOP → MOE → NEED; every MOP → ≥ 1 REQ; TPMs tied to risky requirements | Minor gaps | Partial linkage | None | B-CLO2, A1-3 |
| 4.3 | Measurement rationale (30) | How, when and with what data each measure is obtained; thresholds justified | Present for most | Thin | Missing | B-CLO2, A1-3 |

## RB-5 Technology maturity, risk and AROU
| # | Criterion (weight) | 4 | 3 | 2 | 1 | CLO |
|---|---|---|---|---|---|---|
| 5.1 | Technology description and impacts (15) | Benefits, limitations and enterprise impacts specific to AeroLink | Mostly specific | Generic | Missing | B-CLO3, A1-3 |
| 5.2 | Maturity assessment (25) | TRL assigned using the scale definitions (S11 p.767), with cited evidence or an explicitly labelled assumption; maturity risk identified | TRL with partial evidence | TRL asserted without evidence | No TRL | B-CLO3, A1-3 |
| 5.3 | Risk statements and rating (25) | Condition–if–then statements; 5×5 likelihood/consequence with defined scales; consistent ratings; issues separated from risks | Mostly | Several malformed or inconsistent | List of worries | B-CLO3, A1-5 |
| 5.4 | Treatment and AROU (25) | Handling option justified; owner; trigger/watch item; assumptions, opportunities and unknowns each distinct and actionable | Mostly | AROU = risks only | Missing | B-CLO3, A1-5 |
| 5.5 | Linkage (10) | Each item linked to affected REQ/PHY/SCN (in the model for A2/B) | Most | Few | None | B-CLO3, A1-5, A2-3 |

## RB-6 Trade study
| # | Criterion (weight) | 4 | 3 | 2 | 1 | CLO |
|---|---|---|---|---|---|---|
| 6.1 | Decision framing and alternatives (15) | Decision statement; ≥ 3 genuinely different alternatives incl. baseline/status quo | ≥ 3 alternatives | Strawman alternatives | One option evaluated | B-CLO3, A1-3, A2-3 |
| 6.2 | Criteria (15) | Criteria traced to MOEs, independent, non-overlapping; cost and risk handled explicitly | Mostly | Overlapping or untraced | Unclear | B-CLO3, A1-3, A2-3 |
| 6.3 | Value scales and weights (20) | Value functions/scales defined; **swing weights** elicited with stated ranges and rationale (S11 p.467) | Weights with rationale | Importance weights without ranges | Arbitrary | B-CLO3, A1-3, A2-3 |
| 6.4 | Computation (15) | Additive model computed correctly; units normalised; reproducible workbook | Minor errors not affecting the ranking | Errors affecting the ranking | Not computed | B-CLO3, A1-3, A2-3 |
| 6.5 | Sensitivity (20) | Sensitivity on the top weights with the rank-reversal point; uncertainty in scores considered | Weight sensitivity only | Mentioned, not done | Missing | B-CLO3, A1-3, A2-3 |
| 6.6 | Recommendation (15) | Recommendation with conditions, residual risk and what would change it | Clear recommendation | Recommendation does not follow from the analysis | None | B-CLO6, A1-3, A2-3 |

## RB-7 Architecture concept, interfaces and information view
| # | Criterion (weight) | 4 | 3 | 2 | 1 | CLO |
|---|---|---|---|---|---|---|
| 7.1 | Viewpoints (15) | Operational, functional, physical (and enterprise for A1) views, each stating its purpose and concern | All present | Missing a view or views without purpose | Single picture | B-CLO4, A1-2 |
| 7.2 | Decomposition (20) | Functions derived from capabilities and scenarios; sensible levels; no physical names in the functional view | Minor mixing | Function/physical confusion | Missing | B-CLO4, A1-2 |
| 7.3 | Allocation and interfaces (25) | Complete FN→PHY allocation; N² with typed interfaces (physical, information, organisational, external) and both ends | Mostly | Partial | Missing | B-CLO4, A1-2, A1-4 |
| 7.4 | Rationale (10) | Key architecture decisions recorded (DEC) with alternatives considered | Some | Few | None | B-CLO6, A1-2 |
| 7.5 | Information flows (20) | Producers, consumers, flows; data vs information distinguished; the decision each item supports | Mostly | Flows without decisions | Missing | B-CLO4, A1-4, A2-1 |
| 7.6 | AI capabilities (10) | AI capabilities with inputs, outputs, human oversight and failure considerations | Inputs/outputs only | Named only | Missing | B-CLO4, A1-4, A2-1 |

## RB-8 SysML v2 model quality
**Gate:** see §0 safeguard 5. More than 2 parse errors caps 8.2–8.6 at level 2, with a 24-hour repair window.

| # | Criterion (weight) | 4 | 3 | 2 | 1 | CLO |
|---|---|---|---|---|---|---|
| 8.1 | Validity (15) | Zero errors **and** zero warnings, or warnings explained | Zero errors | 1–2 localised errors | > 2 errors, or does not load | B-CLO4, A2-1 |
| 8.2 | Organisation and conventions (15) | Package structure mirrors the artifact map; naming and short-name IDs consistent; imports explicit (visibility stated) | Minor deviations | Inconsistent | Flat or unstructured | B-CLO4, A2-1 |
| 8.3 | Structure semantics (20) | Definition/usage used correctly; specialization, subsetting and redefinition used purposefully; ports and interfaces typed; quantities with units | ≤ 2 semantic errors | Frequent misuse (e.g. definitions where usages are needed) | Pervasive | B-CLO4, A2-1 |
| 8.4 | Requirements semantics (20) | Requirements with subject and ID; `satisfy` relates appropriate design elements; derivation and dependencies used correctly | Minor issues | `satisfy` misused (e.g. between requirements) | Requirements as comments | B-CLO4, A2-1 |
| 8.5 | Behaviour semantics (15) | Actions and states consistent with scenarios; linked to structure (perform/exhibit) | Minor issues | Unlinked or inconsistent | Missing | B-CLO4, A2-1 |
| 8.6 | Completeness vs minimums (15) | Meets or exceeds the pathway minimums (lab plan C.5) | ≥ 90 % of minimums | 60–89 % | < 60 % | B-CLO4, A2-1 |

## RB-9 Traceability, digital thread and impact analysis
| # | Criterion (weight) | 4 | 3 | 2 | 1 | CLO |
|---|---|---|---|---|---|---|
| 9.1 | Upward trace (15) | 100 % of REQ trace to NEED/CAP; 100 % of NEED to STK | ≥ 90 % | 60–89 % | < 60 % | B-CLO5, A2-2 |
| 9.2 | Downward trace (15) | 100 % of REQ-SYS have satisfy and a verification method | ≥ 90 % | 60–89 % | < 60 % | B-CLO5, A2-2 |
| 9.3 | Complete threads (25) | Required number of full 11-link threads (B ≥ 3; A2 ≥ 5) demonstrated live without error | One link weak | Threads incomplete | None | B-CLO5, A2-2 |
| 9.4 | Trace audit (20) | Reproducible coverage metrics, orphans and childless parents listed, with a disposition for each gap | Metrics without dispositions | Partial | None | B-CLO5, A2-2 |
| 9.5 | Impact analysis (25) | Impact set derived by relationship traversal (method shown); second-order effects; consequences for verification and risk; recommendation | Correct first-order set | Set guessed or incomplete | Narrative only | B-CLO5, A2-3 |

## RB-10 Verification and validation planning
| # | Criterion (weight) | 4 | 3 | 2 | 1 | CLO |
|---|---|---|---|---|---|---|
| 10.1 | V vs V (20) | Verification ("built right") and validation ("right system") distinguished correctly and applied; validation tied to MOEs/scenarios | Minor slips | Confused | Reversed | B-CLO5, A1-2, A2-2 |
| 10.2 | Method selection (25) | Method per requirement justified (inspect/analyze/demo/test), with level and environment | Mostly | Default "test" everywhere | Missing | B-CLO5, A1-2, A2-2 |
| 10.3 | Verification cases (35) | (B/A2) Cases with objective, subject, method and verdict logic (pass/fail/inconclusive/error), linked to requirements | Mostly | Partial | Missing | B-CLO5, A1-2, A2-2 |
| 10.4 | Measures alignment (20) | MOE/MOP to verification and validation activities mapped | Mostly | Partial | None | B-CLO5, A1-2, A2-2 |

## RB-11 Technical review and executive presentation
| # | Criterion (weight) | 4 | 3 | 2 | 1 | CLO |
|---|---|---|---|---|---|---|
| 11.1 | Technical content and evidence (25) | Claims backed by model or analysis evidence; assumptions explicit | Mostly | Claims unsupported | Inaccurate | B-CLO6, A1-all, A2-5 |
| 11.2 | Decision justification (20) | ≥ 1 key decision presented with alternatives, criteria and sensitivity | Present | Asserted | Missing | B-CLO6, A1-all, A2-5 |
| 11.3 | Live model demonstration (15) | Navigates a complete thread fluently; answers a trace question from the model (B/A2) | Minor hesitation | Scripted only | Fails | B-CLO5, A2-5 |
| 11.4 | Audience adaptation (15) | Distinct, accurate message for a non-technical reviewer; views fit stakeholder concerns | Mostly | Technical only | Unclear | B-CLO6, A1-all, A2-5 |
| 11.5 | **Individual Q&A** (20, scored per student) | Answers on own elements correctly, with reasoning | Correct, shallow reasoning | Partly correct | Cannot answer | B-CLO6, A1-all, A2-5 (**individual**) |
| 11.6 | Review conduct (5) | On time; findings recorded; peer findings dispositioned | Minor | Poor | — | B-CLO6, A1-all, A2-5 |

## RB-12 AI Usage Statement (official contents [S01/S02] plus quality)
| # | Criterion (weight) | 4 | 3 | 2 | 1 | CLO |
|---|---|---|---|---|---|---|
| 12.1 | Completeness (20) | Tool, purpose, example prompts, outputs, evaluation and human contribution all present [S01/S02] | One element thin | Several missing | Token statement | B-CLO6, A2-4 (A1-4 corroborating only; S01 gives the statements no weight) |
| 12.2 | Critical evaluation (40) | Specific errors or limitations of AI output identified and corrected; accept/reject reasons recorded | Generic evaluation | "Output was good" | None | B-CLO6, A2-4 (A1-4 corroborating only; S01 gives the statements no weight) |
| 12.3 | Verification of AI-generated artifacts (40) | AI-generated SysML is accepted by the course-designated checker and explained by its owner; AI-suggested requirements, stakeholders and risks individually reviewed and tagged | Mostly | Unverified content present | AI content submitted unreviewed (also an integrity concern) | B-CLO6, A2-4 (A1-4 corroborating only; S01 gives the statements no weight) |

## RB-13 Peer evaluation instrument
Each student rates each teammate (and themselves) on five behaviours, 0–4:
1. contribution to deliverables;
2. quality of own work;
3. reliability and timeliness;
4. collaboration and communication;
5. support of team learning.

Each rating needs one sentence of evidence. **Mechanism (revised for review m18):** peer evaluation counts **once**, as its own 10 % component [S01/S02; B §12]. It is **not** also used as a multiplier. S01 says peer evaluations "may be used to adjust individual project grades". **[REC]** Limit that to documented non-contribution cases decided by the instructor, not a formula (FD-17). Ratings without evidence, or showing collusion patterns, are reviewed before use. Used at CP2, CP4 and CP5 (B), and at major submissions (A1/A2).

## RB-14 Practical model examination (B Exam 2; A2 Exam 3)
**Format.**
- 75 min (B) or 100 min (A2). Individual. Supervised lab. Closed-AI.
- Instructor-provided AeroLink model, not seen before.
- Extended time for accommodations.

| Task | Weight | What is scored | CLO |
|---|---|---|---|
| T1 Navigate | 15 | Locate specified elements and report relationships (e.g. "which physical elements does FN-011 allocate to?") | B-CLO4, A2-1 |
| T2 Explain semantics | 15 | Explain what given constructs mean. Example: definition vs usage. Another: a `satisfy` usage **asserts** that the requirement is satisfied by the given feature (S06 p.168), so a model whose values violate it is inconsistent, whereas verification supplies evidence that the real system makes the assertion true | B-CLO4, A2-1 |
| T3 Trace and coverage | 20 | Report upward/downward trace for 2 requirements; find 2 seeded orphans | B-CLO5, A2-2 |
| T4 Impact | 20 | Determine the impact set of a stated change, with method | B-CLO5, A2-3 |
| T5 Repair | 15 | Fix 3 seeded defects (one syntax, two semantic); the model must be accepted by the checker afterwards | B-CLO4, A2-1 |
| T6 Extend | 15 | Add one requirement with ID, subject, satisfy link and a verification case stub | B-CLO4, A2-1 |

The answer key and seeded-defect list are held by the instructor. **Two model variants** are used to limit answer sharing.

## RB-15 Resilience, security and evolution roadmap (A1 Week 13; B awareness)
| # | Criterion (weight) | 4 | 3 | 2 | 1 | CLO |
|---|---|---|---|---|---|---|
| 15.1 | Resilience (30) | Adversities identified; resilience objectives/means/techniques applied (S11 p.1204–1210); resilience requirements via the scenario pattern (p.1210) | Mostly | Redundancy only | Missing | A1-5 |
| 15.2 | Security (20) | Assets and losses identified (S11 p.1230–1233); security considerations tied to architecture | Mostly | Generic | Missing | A1-5 |
| 15.3 | Known unknowns (20) | Each unknown has impact, information need and mitigation [S03 D13] | Mostly | Thin | Missing | A1-5 |
| 15.4 | Roadmap (30) | Near/mid/long states; technology insertions with maturity rationale; capability evolution; opportunities [S03 D15] | Mostly | Timeline without rationale | Missing | A1-5 |


## RB-16 Individual review notebook (Pathway B, 5 %) [REC; review m22]
**Sampling rule:** the grader reads **3 randomly chosen weekly entries** plus the **final reflection**. The student does not know which entries in advance. This costs ≈ 10 min per student per course.

**Graduate weekly tasks (revision 2026-10-11, author convention W7, pending faculty confirmation):** the individual graduate task set each week (memo, analysis or checklist) is a **required notebook entry that is always read**, not sampled. It receives formative feedback on the criterion named in that week's assignment, and the set of graduate tasks informs RB-16.1. The 3-entry random sample applies to the remaining routine entries. Added cost ≈ 5 min per student per week.

| # | Criterion (weight) | 4 | 3 | 2 | 1 | CLO |
|---|---|---|---|---|---|---|
| 16.1 | Engineering reasoning (40) | Entries record the student's own decisions, assumptions and alternatives, with reasons | Decisions recorded; reasons thin | Activity log only | Missing or perfunctory | B-CLO6 |
| 16.2 | Ownership evidence (30) | Owned elements (IDs) listed, with what the student did and how it was checked | Listed | Vague | None | B-CLO6 |
| 16.3 | AI Usage Statements (30) | Scored with RB-12.1–12.3 | | | | B-CLO6 |

## RB-17 Review findings (review item discrepancies, RIDs) given in a technical review [REC; review M3]
Used for the CP4 PDR-style review in Pathway B. That review is **asynchronous**: the peer team and the instructor submit RIDs within 3 days, and the owning team must disposition them in CP5. It can also be used for the A2 peer-review cycle.

| # | Criterion (weight) | 4 | 3 | 2 | 1 | CLO |
|---|---|---|---|---|---|---|
| 17.1 | Correctness (40) | Every RID identifies a real defect, with location (ID) and the violated criterion or source | Most | Several invalid | Mostly invalid | B-CLO6 |
| 17.2 | Significance (30) | Severity assigned sensibly; at least 2 RIDs address semantics or traceability, not just style | Mostly | Style-only | — | B-CLO6 |
| 17.3 | Actionability (30) | Each RID proposes a concrete fix | Most | Few | None | B-CLO6 |

---

## Exam blueprints [REC]

**Pathway B, Exam 1** (Week 7; 75 min; individual; closed-AI)

| Part | Weight | Content | Item types | CLO |
|---|---|---|---|---|
| A | 25 % | Systems thinking, SoS, life cycle, stakeholders | Short answer; classify a stakeholder set; explain a causal loop | B-CLO1 |
| B | 40 % | Needs, ConOps, requirements, measures | Critique and rewrite 4 flawed requirements; MOE/MOP classification; identify a missing scenario | B-CLO2 |
| C | 35 % | TRL, risk, AROU | Assign a TRL from a description; write and rate 2 risks; distinguish an assumption from a risk | B-CLO3 |

**Pathway A1, Exam 1 / Exam 2:** coverage exactly as listed in S01 (Exam 1: systems thinking, stakeholders, needs, capabilities, ConOps, requirements, technology assessment; Exam 2: trade studies, architecture, information, integration, V&V, risk, security and resilience, roadmaps, digital engineering, MBSE). **[REC]** At least 60 % of each exam is applied analysis of a short AeroLink-variant scenario, not recall.

**Pathway A2, Exam 1** (5 %; end of Week 6; 40 min, in class, closed-AI) [S02 coverage: MBSE fundamentals through physical architecture]

| Part | Weight | Items |
|---|---|---|
| Model reading | 60 % | Interpret provided textual and graphical fragments: definition vs usage, ports and interfaces, allocation |
| Concepts | 40 % | Short answers on MBSE purpose, stakeholders and needs, requirement structure |

All of Exam 1 evidences A2-CLO1.

**Pathway A2, Exam 2** (5 %; end of Week 12; 40 min, in class, closed-AI) [S02 coverage: behaviour through risk and AROU]

| Part | Weight | Items | CLO |
|---|---|---|---|
| Behaviour and interfaces | 30 % | Read an action flow and a state machine; identify an inconsistency with a scenario | A2-1 |
| Digital thread, traceability, verification | 30 % | Given a fragment, list the trace and identify the missing verify link | A2-2 |
| Trade studies and risk | 20 % | Interpret a trade-study result and a risk annotation | A2-3 |
| **Critique of an AI-generated model fragment** [REC, required; review C3] | 20 % | Find the errors in an AI-produced SysML fragment, explain them, and state how each would be verified | A2-4 |

**Exam 3** = RB-14.

---

## Source traceability
- Official items and contents: S01 (assessment table, AI statement contents, exam coverage), S02 (assessment table, Exam 3 description, AI statement), S03 (deliverable contents in RB-15.3–15.4).
- Method criteria cite S11 p.467 (swing weights), p.767 (TRL), p.1204–1210 (resilience), p.1230–1233 (security); S12 p.144 (requirement characteristics), p.149 (verification methods); S06 p.49 (IDs managed by tooling), p.540 (method kinds; verified).

## Assumptions
- The sample-based audit (RB-3) is acceptable to faculty as a grading practice.
- Two graders are available for calibration. With a single instructor, the instructor self-calibrates against archived anchors.

## Decisions requiring approval
FD-17 (peer adjustment and individual accountability), FD-22 (attainment threshold = level 3), FD-08 (parser gate depends on the tool).

## Known limitations
- The rubrics have not been piloted. Inter-rater reliability is not yet measured.
- Level descriptors will need anchor samples from a first offering.
