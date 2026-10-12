# External Review, Round 1: Systems Thinking + MBSE (SysML v2) Curriculum Proposal

- **Reviewer:** independent external reviewer (not the author). Adversarial quality review.
- **Date:** 2026-10-09
- **Scope:** the eight draft documents (Pathway B syllabus, Pathway A sequence, weekly plan, lab/capstone plan, rubrics, outcome matrix, comparison, decision register), checked against the official texts S01–S04 (`_source_cache/*.txt`), the source extracts, the reading register and verifier, and the reader notes.
- **Method:**
  - I re-read S01–S04 in full and compared every [S0x] or "official" label.
  - I recomputed every weight table, workload series, page count and evidence-weight table by hand.
  - I re-opened the cited source pages (`=== PAGE N ===` markers) with a read-only scratch script.
  - No project file was modified. `verify_readings.py` was **not** re-run, because it rewrites `readings_verified.txt`.

---

## 1. Summary verdict

**Not ready for faculty approval. Ready for a focused revision round (estimated 1–2 working days), then re-review.**

### Strengths

The package is unusually honest and well engineered for a first draft:
- Official content and recommendations are labelled consistently. The official learning outcomes (S01 O1–O5, S02 O1–O5) are reproduced verbatim (checked word by word).
- All weight tables sum correctly, and S03's 60 % error was correctly caught.
- Most SysML v2 facts are right and page-accurate: reserved keywords, short-name requirement IDs, VerdictKind, VerificationMethodKind, Risk LevelEnum, import visibility, the `first start` state form.
- No Wright State policy or accreditation status is invented; every policy reference says "verify".
- The decision register is complete: FD-01 to FD-25 are all defined, and every FD-ID used anywhere resolves.
- Lab IDs L1–L13 and rubric IDs RB-1 to RB-15 are used consistently and are all defined.

### Problems

The outcome-assessment layer, the SysML tooling dependency and several verification claims are not ready:

1. **The outcome-evidence maps contradict each other** across the Pathway B syllabus §3, syllabus §15, matrix B.1/B.2, lab plan B.5 and the rubric CLO tags. Cells marked "R" (reinforced, explicitly not attainment evidence) are nevertheless counted as attainment evidence in B.2 and A2.2.
2. **Individual attainment is not secured.** A2-CLO4 has 0 % individual evidence. The attainment rule averages team and individual levels, so team work can certify an individual outcome; this is the outcome the V2 rule was written to prevent.
3. **Every SysML lab, the RB-8 parse gate, RB-12.3 and the practical exam depend on a modelling tool that has not been chosen.** No SysML text has been parser-checked.
4. **"83/83 start pages verified" overstates what was checked.** R89 is counted as verified without any check. The match tokens for R86, R87, R88 and R90 ("9.3.3", "7.3", "Project", "SysML") are too weak to confirm a start page. The claim that "every assigned reading lies within pages read in full" is false for R07, R08, R12 and R24.
5. **One core SysML semantic is taught backwards and then examined.** S06 p.168 says a `satisfy` usage *asserts* that the requirement is satisfied. The drafts teach that it means the design "*should*" meet it, list "`satisfy` means the requirement is satisfied" as a misconception, and assess this in RB-14 T2.

**Recommendation on the pathways.** I agree with the author's recommendation (FD-01 (c)): Pathway A as the degree sequence and Pathway B as a separate, smaller course, but only after C1–C3 and M1–M6 are fixed.

---

## 2. Ratings (0–4)

**Scale:**
- 0 = absent or unacceptable
- 1 = major deficiencies
- 2 = adequate with significant gaps
- 3 = good with minor gaps
- 4 = exemplary / ready

**Rules applied:**
- A criterion is capped at **2** if a verified error of the relevant kind is *assessed* (it affects grades) or would mislead students.
- "Readiness" is capped at **2** while any Critical finding is open.
- A and B are rated separately. A covers A1+A2; where they differ, the weaker course sets the score and the reason is noted.

| # | Criterion | **A** | **B** | Evidence and rule |
|---|---|---|---|---|
| 1 | Academic coherence | **3** | **3** | Both have a clear arc. B has an explicit dependency map (§6) and hard-prerequisite list; A preserves S01/S02 and bridges them with the ID register. Minus one point each for the cross-document CLO-map contradictions (C2). |
| 2 | Depth and rigor | **3** | **2** | SE method content is rigorous in both: swing weights (S11 p.467), additive model (p.469), rank-reversal sensitivity, condition–if–then risks, TPM margins. B is capped at 2: only 6 weeks of SysML (B-CLO4 at "Create" for non-programmers), and S01 O4/O5 are covered only at awareness depth (declared). |
| 3 | Sequence and prerequisites | **2** | **3** | B respects its own hard prerequisites (§6; definition/usage first in Week 9). A2 is capped at 2: S02 demands model construction from Week 1, and the proposed 30–40-minute primer must carry 20+ STK (Week 2) and 30+ requirements with IDs (Week 3). The A2 exam slots are not placed in any session plan. |
| 4 | Learning-outcome measurability | **2** | **3** | B CLOs use observable verbs with criterion-level evidence, but CLO3 and CLO6 are compound. A relies on official outcomes plus performance indicators (PIs). The PIs point to rubric criteria whose CLO tags do not include the A outcome (RB-5.5, RB-6, RB-12.3; see M7). PI-2.3 (≥ 80 %) conflicts with the RB-3 level-3 band (75–89 %). |
| 5 | Assessment validity | **2** | **2** | Capped at 2 for both because of C2/C3 (inconsistent maps, attainment certifiable from team work). Also M4: a single parse error caps about 85 % of RB-8, so CP4 can score at most 25 %. Positives: the practical exam (RB-14) and closed-AI individual exams are strong. |
| 6 | Laboratory feasibility | **2** | **2** | Tool undecided (C1). B: the CP5 reviews need about 160 minutes for 8 teams but have one 75-minute session; the CP4 PDR-style review has no session at all (M3). A2: 16 labs in 15 slots plus a weekly peer-review cycle; Week 7 asks for 5 behaviour scenarios. |
| 7 | Student workload | **2** | **2** | B: the syllabus says "≈ 8.0–9.0 h typical", but the weekly plan sums to 134 h (mean 9.57). A: the drafts say "≈ 135 h", but the weekly figures sum to 142.5 h (A1) and 147 h (A2). Reading rates are unvalidated: up to 30 technical pages in 1.5–2 h. |
| 8 | Coverage of SE methods | **3** | **2** | A1 covers the S01 scope (stakeholders → roadmap). Gaps in both: configuration management (R36 is registered but never assigned) and life-cycle cost. B: integration, security, information management and roadmapping are at awareness depth or extension only; more than two core processes are thin. |
| 9 | Accuracy of SysML v2 content | **2** | **2** | Mostly accurate and page-verified (see the spot-check log). Capped at 2 because the `satisfy` semantics are taught inversely and assessed (M2). Also: a beta is called a "normative" reference (A2.8), "requirement groups" appear in primer P4 (not a v2 construct), and the formal SysML 2.0 is not used as the baseline (M8). |
| 10 | Capstone continuity | **3** | **3** | Stable-ID scheme (§C.2), provenance tags, thin-thread rule and a recovery reference model: well designed. Minus one point: the reference model and Data Sheet values do not yet exist. In A, the A1 requirement count (25–40) does not guarantee A2's 30+, and the AROU Register has no due week in S01 (m17). |
| 11 | Accessibility | **2** | **2** | WCAG 2.1 AA and the DOJ Title II rule are correctly labelled external and marked "verify". Gaps: the tool is unassessed, the university statement is TBD, the Mermaid concept map has no text alternative, and "textual notation = accessible equivalent" is asserted without validation. |
| 12 | Readiness for faculty review | **2** | **2** | Capped at 2 by the open Critical findings C1–C3. Otherwise near 3: honest labelling and a complete decision register. |

---

## 3. Findings

### Critical (would block faculty approval)

**C1. The SysML modelling tool is undecided, yet the assessment design depends on it** (both pathways).

- **Where:**
  - `ASSESSMENT_RUBRICS.md` §0 safeguard 5, the RB-8 gate, RB-12.3 and RB-14 T5
  - `LABORATORY_AND_CAPSTONE_PLAN.md` Part A2 header ("Every model submission must parse with zero errors") and L9–L13
  - `PROPOSED_TWO_COURSE_SEQUENCE.md` A2.10
  - `FACULTY_DECISION_REGISTER.md` FD-08
- **Problem:**
  - Graded gates, exam tasks and lab acceptance criteria are defined as "parses with zero errors in the adopted tool", but no tool has been chosen or evaluated.
  - No SysML text has been parsed (lab plan, Known limitations: "there is no tool on this machine").
  - A2 needs the tool in Week 1. The "Feasible" judgements in B.4 and A2.11 (for example, "10–15 min per requirement") are untested.
- **Why it matters:** a committee cannot approve graded instruments that cannot yet be run, or a lab sequence whose feasibility depends on an unnamed product (including its accessibility).
- **Fix:**
  - (a) Resolve FD-08 before submission: evaluate at least two candidates for grammar version, lab deployment, licence and screen-reader use, and attach the evaluation.
  - (b) Meanwhile, make the gates tool-neutral: "parses in the course-designated checker, named in the syllabus addendum".
  - (c) Build the instructor reference model and parse it; report the actual time taken per requirement and per scenario as feasibility evidence.

**C2. The outcome-evidence maps contradict each other** (mainly B; A2.2 is also affected).

- **Where:** `PROPOSED_COURSE_SYLLABUS_14_WEEK.md` §3 and §15; `COURSE_OUTCOME_ASSESSMENT_MATRIX.md` B.1, B.2, A2.2; `LABORATORY_AND_CAPSTONE_PLAN.md` B.5; `ASSESSMENT_RUBRICS.md` CLO tags.
- **Problem:** the same course has at least four inconsistent maps. Examples:
  - **B-CLO2 at CP1:** §15 says R; matrix B.1 says **A** (RB-2); §3's evidence list omits CP1.
  - **B-CLO6 at CP4:** §15 says R; B.1 says **A** ("peer review given"); B.2 counts CP4 review = 2.0 % as attainment evidence; §3's evidence list has no CP4.
  - **B-CLO6 at Peer:** §15 says R; B.1 says "conduct, non-outcome".
  - **B-CLO4 at CP3:** §15 blank; B.1 says R (RB-7.2–7.3); **B.2 counts 1.5 % as attainment evidence**.
  - **B-CLO1 at CP3:** §15 blank; B.1 says R (RB-7.1); **B.2 counts 1.5 %**.
  - **A2.2:** counts Labs 9 and 11–13 (marked R in A2.1) as about 4 % and 5 % evidence for A2-CLO2 and A2-CLO3.
  - The method in matrix §0 states that "R = reinforced (graded, **not attainment evidence**)". B.2 and A2.2 therefore violate it, and the V1 measure counts (B-CLO1 "(3)", B-CLO4 "(4)") are inflated.
- **Why it matters:** the CLO-assessment matrix is the artifact a curriculum or assessment committee audits first. Conflicting maps make the attainment rule impossible to apply.
- **Fix:**
  - Make `COURSE_OUTCOME_ASSESSMENT_MATRIX.md` the single source of truth and regenerate syllabus §3 (evidence column) and §15 from it.
  - Recompute B.2 and A2.2 using **A cells only**, and restate the V1 counts.
  - Add a consistency table (CLO × component × rubric criterion) and check it mechanically.

**C3. Individual attainment is not secured** (A2 especially; B partly).

- **Where:** `COURSE_OUTCOME_ASSESSMENT_MATRIX.md` §0 attainment rule, A2.1 (V2 ✘ for A2-CLO4), A2.2, B.2; `PROPOSED_TWO_COURSE_SEQUENCE.md` A2.12.
- **Problem:**
  - (i) A2-CLO4 has **0 %** individual evidence. This is acknowledged, but only an optional fix is offered (FD-17).
  - (ii) The attainment rule ("weighted mean level of that CLO's tagged criteria ≥ 3") pools team and individual levels. Examples:
    - B-CLO2: team evidence is 9.5 % of the grade against 4.8 % individual. A student who fails the Exam 1 Part B items can still "attain" CLO2 on team checkpoints.
    - B-CLO1: individual evidence is 3.0 %, about 19 minutes of one exam.
  - (iii) A2-CLO5's "V2 ✔" rests on counting the whole 5 % Executive Presentation as individual. S02 grades it as a team item; only "each student must present a portion" is individual.
- **Why it matters:** the V2 rule exists so that team work never certifies an individual outcome. As written, the attainment rule defeats it.
- **Fix:**
  - Make attainment **conjunctive**: level ≥ 3 on the individual measures *and* on the team measures, or compute attainment from individual measures alone with the team measures as corroboration.
  - Adopt the A2-CLO4 individual item as required, not optional.
  - Score RB-11.5 per student in the A2 presentation and count only that share as individual.

### Major (should be fixed before review)

**M1. Verification overclaims** (`readings_verified.txt`; syllabus §8; weekly plan header; syllabus "Known limitations").

- **Problem:**
  - (a) "verified: 83/83": R89 has no title check, but `verify_readings.py` counts any empty title as OK (`ok += 1`).
  - (b) Several match tokens are too weak to identify a start page ("SysML" R90, "7.3" R87, "9.3.3" R86, "Project" R88).
  - (c) End pages are never checked, although the syllabus admits SEBoK end pages come from running headers.
  - (d) "Every assigned reading (E, X and I) lies within pages that the audit read in full; this was checked against each reader's coverage ledger" is false:
    - R07 includes p.819: NOT-READ per `sebok_C.md`.
    - R08 includes p.836: NOT-READ.
    - R12 includes pp.864–865: NOT-READ.
    - R24 (A1 range 1203–1215) includes pp.1213–1215: SKIMMED (`sebok_D.md`).
  - These are bibliography pages, so the teaching impact is low, but the *claim* is wrong.
- **Fix:** report "82/83 title-checked; R89 range-only"; strengthen the tokens to full section titles; restate the coverage sentence ("all assigned body pages read in full; bibliography pages excluded"); trim the ranges to end before the reference lists.

**M2. The `satisfy` semantics are taught inversely and assessed** (`WEEKLY_INSTRUCTIONAL_PLAN.md` Week 10 key concepts and misconceptions; RB-14 T2; `PROPOSED_TWO_COURSE_SEQUENCE.md` A2.1).

- **Problem:**
  - The draft says "`satisfy` asserts the design *should* meet the requirement" and lists "`satisfy` means the requirement is satisfied" as a misconception.
  - S06 p.168: "a satisfy requirement usage **asserts that it is satisfied** as a requirement (that is, it always evaluates to true) when the role of its subject is bound to the satisfying feature."
- **Why it matters:** students would be graded (RB-14 T2) against a statement that contradicts the normative text.
- **Fix:** teach it as "`satisfy` is a model assertion that the requirement holds for the subject. A model whose values violate it is inconsistent. Verification provides the evidence that the real design makes the assertion true." Rewrite the misconception as "`satisfy` is evidence of compliance."

**M3. Pathway B review and exam sessions do not fit the calendar** (syllabus §7, §11, §17; weekly plan Weeks 7, 11, 13, 14; lab plan B.6).

- **Problem:**
  - CP5 is a 20-minute review (12 + 8) per team. With about 8 teams (syllabus Assumptions) that is about 160 minutes plus changeovers, but Week 14 session 2 is 75 minutes and session 1 is used for rehearsal.
  - The CP4 "PDR-style review" has no session: Week 11 session 2 already holds L11 plus the cross-team peer review.
  - L7 and L13 move fully out of class in exam weeks, although both feed checkpoints.
- **Fix:** schedule CP5 across both Week 14 sessions plus the finals slot, or cut it to 12 minutes per team. Give the CP4 review its own slot (for example Week 12 session 1). Show a minute-level calendar for Weeks 11–14.

**M4. The RB-8 parse gate is disproportionate, and its scope is ambiguous** (`ASSESSMENT_RUBRICS.md` §0 safeguard 5; RB-8 gate).

- **Problem:**
  - One residual syntax error caps 8.2–8.6 (85 % of the weight) at level 1, so the maximum is about 25 % of CP4 (10 % of the course grade). That is construct-irrelevant variance for a first-time modeller.
  - Safeguard 5 says "no SysML criterion" can exceed 1, which could be read to cover RB-9, RB-10 and RB-14 as well.
  - RB-8.1 has no level-2 descriptor.
- **Fix:** grade parse errors as defects inside 8.1 (for example, ≤ 2 errors = level 2), allow a 24-hour repair window with a fixed deduction, and state the gate's scope explicitly.

**M5. Workload figures are internally inconsistent** (syllabus §14; weekly plan summaries; `PROPOSED_TWO_COURSE_SEQUENCE.md` A1.7, A1.14, A2.13–15; FD-02).

- **Problem:**
  - B: "typical week ≈ 8.0–9.0 h" against a computed mean of 9.57 h (134 h).
  - B: §14 lists peaks in Weeks 6, 11 and 14 only, but the plan also has Week 3 = 10 h and Week 8 = 10.5 h (also checkpoint weeks).
  - A: "≈ 135 h" against weekly figures that sum to 142.5 h (A1) and 147 h (A2).
  - A1: "reading load runs 20–35 pages per week" is false. Weeks 6 and 9 = 15 pp, Week 14 = 17, Weeks 4 and 7 = 19.
  - A1 Week 12: "≈ 45 pages" against a 24-page essential set in the weekly plan.
- **Fix:** derive every summary figure from the weekly table and add a "how computed" line. State the reading-rate assumption in pages per hour and include it in the pilot (FD-22).

**M6. SysML compression in Pathway B** (syllabus §2, §7, §11; lab plan L9–L11; B.4).

- **Problem:**
  - Students meet the tool in Week 9 and must submit CP4 by Week 11.
  - CP4 must contain zero-error requirements, ports, interfaces, allocations, an action flow and a state machine.
  - The course explicitly admits "no prior programming", and B-CLO4 is set at "Create".
  - The B.4 judgement "Feasible if the tool works from Week 9" carries the entire risk.
- **Fix:** start a 20-minute textual-notation micro-lab in Weeks 5–8 (definition/usage, packages, parts) so Week 9 is not first contact. Alternatively, move the state machine to CP5 and make CP4 "requirements + structure + allocation" only.

**M7. Rubric CLO tags do not match how the rubrics are used** (`ASSESSMENT_RUBRICS.md`).

- **Problem:**
  - RB-7.2 and RB-7.3 are tagged **B-CLO4** (SysML model construction), but CP3 is a document checkpoint; the weekly-plan objectives B8.1–B8.3 carry the same mis-tag.
  - RB-6 has no A2-3 tag, but A2 PI-3.1 uses it.
  - RB-5.5 is not tagged A1-5, but A1 PI-5.1 uses it.
  - RB-12.3 is not tagged A1-4, but A1 PI-4.2 uses RB-12.
  - RB-3.6 is tagged A2-4, but RB-3 is applied in A1.
  - Syllabus §3 lists RB-6.1–6.6 as B-CLO3 evidence, but 6.6 is tagged B-CLO6.
- **Fix:** regenerate the tags from the single matrix (C2).

**M8. The language baseline is a beta, described as normative** (`CURRICULUM_COMPARISON.md` §6; `PROPOSED_TWO_COURSE_SEQUENCE.md` A2.8; syllabus §20 #3).

- **Problem:**
  - The course baselines on SysML **2.1 Beta 2** (S06 p.1: "Version 2.1 Beta 2 (Release 2026-07) … OMG Document Number: None"), while A2.8 calls S06 the "normative instructor reference".
  - Reviewer's knowledge, not verifiable from the collection: OMG formally adopted SysML v2.0 in 2025. A committee will ask why the formal edition is not the baseline.
- **Fix:** obtain the formal SysML 2.0 specification (needs approval; FD-10-type decision). Baseline teaching on 2.0 plus the tool's grammar, and treat 2.1 Beta 2 as a forward-looking reference. Remove "normative" from A2.8.

**M9. The Pathway A primer is not sized to the official lab demands** (`PROPOSED_TWO_COURSE_SEQUENCE.md` A2.4–A2.7; weekly plan Part A2).

- **Problem:**
  - Weeks 2–3 require 20+ stakeholders, 10+ capabilities and 30+ requirements as SysML with IDs (lab plan A2 acceptance criteria), with only 30–40 minutes of primer per week.
  - P4 teaches "requirement groups". SOURCE_ANALYSIS §2 itself flags «requirementGroup» as not in the formal spec.
  - The A2 exam slots (end of Weeks 6 and 12) take time from sessions that are already allocated.
- **Fix:** phase the A2 minimums in (for example, Week 3 acceptance at 15 requirements, full 30 by the Week 5 review). Replace "requirement groups" with "requirement nesting and packages". Show where the exam minutes come from.

### Minor

| ID | File and section | Problem | Fix |
|---|---|---|---|
| m1 | Syllabus B §19 "Official [S01/S02]" | "AI use is expected and required" is S01 wording. S02 says "permitted, encouraged, and required **within defined course activities**". | Quote each source separately. |
| m2 | Pathway A A1.1 | Labelled "[S01, verbatim intent]", but the text is a paraphrase. | Label "[S01, paraphrased]" or quote verbatim. |
| m3 | Pathway A A1.8 | Quotation marks around an abbreviated list ("FAA AAM resources, NASA SE resources"). S01 says "FAA Advanced Air Mobility resources", "NASA systems engineering resources". | Quote exactly or drop the quotation marks. |
| m4 | Pathway A A1.9 | The [S01] in-class list omits "Systems engineering activities". | Add it. |
| m5 | Comparison §1 table | "16 labs (S02)": the 16 labs are S04. S02 has 15 schedule rows. | Attribute to S04. |
| m6 | Lab plan L2; W2 | "all 7 from S04 Lab 2A" and "all 7 S04 Lab 2A classes". S04 Lab 2A's 7 entries include AeroLink itself (the enterprise), so there are 6 stakeholders, and they are entities, not classes. | "the 6 external entities of S04 Lab 2A". |
| m7 | Pathway A A2.16; FD-16 | "S12 defines SRR, SFR, PDR, CDR, SVR/FCA, PRR, PCA" omits **ASR** (23 mentions in S12) and TRR. "FDR does not appear in any source in the collection", but it appears in S02 itself. | Add ASR; say "no SE guidance source (S11–S13) defines FDR". The reconciliation file's C11 already gets this right. |
| m8 | Pathway A Week 2 readings | "R76 (sl.115)": R76 covers sl.100–107. Slide 115 (Stakeholders and Concerns) is inside R77. | Cite R77 sl.115. |
| m9 | Syllabus §8 Week 13; Pathway A A1.7 vs weekly plan | R78 is used as Essential, but the register level is X. A1 Week 11 lists R44 and Week 13 lists R25 as essential in the Pathway A doc but as X in the weekly plan. | Align the levels. |
| m10 | Weekly plan citation slips | (a) "N² matrix (S11 p.631)": the N-squared heading is on p.630; p.631 continues the coupling matrix. (b) "the Vee drawn as a relationship view, not a schedule (S11 p.395 caution)": p.395 says the Vee "is not a life cycle model" and "retains a sequential flow", and p.396 says "time and system maturity conceptually proceed from left to right". The source does not support the caution as stated. (c) "the API offers no transitive operation; S08 PDF 31–36": those pages cover repository records; an absence cannot be page-cited (relationship queries are at PDF 41 per the notes). (d) "ISO 42010 via S13 p.341": 42010 is cited on p.339. | Correct the pages and reword (b) as a course position, not a citation. |
| m11 | Syllabus §5 | The Bloom shares are not reproducible. Counting the 50 objectives in weekly plan Part B by highest level gives Understand 12 %, Apply 32 %, Analyse 26 %, Evaluate 22 %, Create 8 % (stated: 20/30/25/15/10). The "Evaluate" weeks omit Weeks 11 and 13. | Recompute from the plan. |
| m12 | Syllabus §11; Comparison §2, §5; lab plan C.5 | The model-minimum share is "40–60 %", "≈ 50–60 %" and 20–80 % (C.5) in different places. C.5 "Risks ≈ 80 %" compares 8 AROU entries (only one of which need be a risk) with 10 risks. | Use one figure and compare like with like. |
| m13 | Pathway A A1.14 | "S03's recommended lengths sum to ≈ 57–85 pages". Recomputed: 52–78 pp (S03 D1–D15, excluding D12 table and D16), or 54–81 with the REC 2–3 pp Technology Risk. | Correct, and show the sum. |
| m14 | Lab plan B.5; Part A2 | "RB-11 (short form)" and "RB-6 (short)" are undefined. CP1 uses RB-12 in B.5, but syllabus §12 lists only RB-1 and RB-2. | Define the short forms or drop them; align the CP1 rubric list. |
| m15 | Pathway A PI-2.3 vs RB-3 | PI threshold ≥ 80 %; RB-3 level 3 = 75–89 %. | Align the thresholds. |
| m16 | Pathway A (unflagged official gap) | S01 weights the **AROU Register at 2 %** but its weekly schedule gives it **no due week**. The drafts assign it inconsistently (weekly plan Week 8 "+ AROU update"; packaging P3 Week 9) without flagging the gap. | Add it to FD-14 or a new FD; propose a week. |
| m17 | Pathway A capstone continuity | A1 requirements are "25–40 [S03 D4]" but A2 needs 30+. S02 expects an "Operational Scenarios Package" that S01 does not produce (reconciliation C8, not carried into Pathway A). | Set the A1 acceptance at ≥ 30 requirements and ≥ 5 scenarios as a named package. |
| m18 | RB-13 + syllabus §12 | Peer evaluation is both 10 % of the grade and an optional multiplier (0.8–1.05) on the team component, so it can count twice. The asymmetric cap is unexplained. | Choose one mechanism, or justify both. |
| m19 | Weekly plan Week 6 | Handling options are cited to S12 p.124–126, but the "assume … watch" terms come from S13 p.642. S12 p.126 says "accepted (and monitored), avoided, transferred or controlled". | Cite S13 p.642 for the terms. |
| m20 | Syllabus §6 | The Mermaid concept map has no text alternative (the course's own WCAG commitment). | Add a nested-list equivalent. |
| m21 | Context files | `SOURCE_ANALYSIS.md` §6 refers to `TEST_REPORT.md`, which does not exist. `DECISION_LOG.md` still lists "Pending D0–D12" without pointing to the FD register. | Fix the references. |
| m22 | Syllabus §12 notebook | The 5 % individual notebook has no rubric beyond RB-12. Grading about 32 × 14 entries is not costed. | Add a short holistic rubric and a sampling rule. |

---

## 4. Spot-check log

"Confirmed" means the source text or my recomputation matches the claim. Source pages are PDF indices (`=== PAGE N ===`).

| # | Claim (location) | Check | Result |
|---|---|---|---|
| 1 | S03 weights sum to 60 % although labelled 50 % (Pathway A A1.12; FD-04) | 4+5+4+8+2+3+5+4+2+2+2+2+1+3+3+10 | **Confirmed**: 60 |
| 2 | S01 deliverable weights sum to 50 %; S01 assessment to 100 %; S02 to 100 % | Recomputed | **Confirmed** |
| 3 | B assessment weights total 100 %, split 50 % individual / 50 % team (syllabus §12) | 10+12+13+5+10 = 50; 7+10+9+10+14 = 50 | **Confirmed** |
| 4 | A1 optional packaging P1–P5 totals 50 % (A1.12) | 9+7+12+8+14 | **Confirmed** (note: it moves official due weeks, e.g. the Stakeholder Map from Week 2 to Week 4) |
| 5 | B workload mean ≈ 9.6 h/week (weekly plan) | Sum of 14 values = 134 → 9.57 | **Confirmed**; but **refutes** the syllabus §14 "≈ 8.0–9.0 typical" |
| 6 | A ≈ 135 h per course (A1.14, A2.13) | A1 weekly sum = 142.5 (mean 9.5); A2 = 147 (mean 9.8) | **Refuted** (the stated means are correct; the totals are not) |
| 7 | B reading page counts, all 14 weeks (syllabus §8) | Ranges recomputed (e.g. Wk 5: 2+8+12+8 = 30; Wk 11 slides 18+9+2 = 29) | **Confirmed** |
| 8 | A1 reading load "20–35 pp/week" (A1.7) | Weekly plan A1: Wk 6 = 15, Wk 9 = 15, Wk 14 = 17, Wk 4 = 19, Wk 7 = 19 | **Refuted** |
| 9 | S03 lengths sum to ≈ 57–85 pp (A1.14) | D1–D15 minimums and maximums | **Refuted**: 52–78 (54–81 with the REC Technology Risk) |
| 10 | All 15 rubrics' criterion weights sum to 100 (RB §0) | RB-1 … RB-15 summed | **Confirmed** |
| 11 | Matrix B.2 evidence weights total 100 % | 8.0+14.3+13.2+20.3+12.2+12.0+20 = 100; Exam 1 25/40/35 % × 12 → 3.0/4.8/4.2 ✓; Exam 2 60/40 % × 13 → 7.8/5.2 ✓ | **Arithmetic confirmed; method refuted** (R cells counted, C2) |
| 12 | A1.2 "exam split assumes equal topic weight" | Exam 2 has 10 equal topics → CLO5 ≈ 4.5 %, CLO3 ≈ 1.5 % under equal weighting; the table says 7 % and 2 % | **Refuted** (totals 100 % confirmed) |
| 13 | A2.2 totals; A2 individual = 30 % | 43+17.5+13.5+6+10+10; 5+5+10+10 | **Confirmed** |
| 14 | B team-hour budgets (B.4) | CP1 4×8.5+15 = 49; CP2 53; CP3 33; CP4 57; CP5 36 | **Confirmed** |
| 15 | Reserved keywords: `satisfy`, `verify`, `allocate`, `dependency` are keywords; `derive`, `refine`, `trace`, `block` are not (lab plan C.2 rule 4; S06 p.197) | Tokenised S06 p.197 | **Confirmed** (`derived` is reserved, as noted) |
| 16 | A requirement's short name is its ID; a requirement is a kind of constraint (S06 p.165) | S06 p.165: "If a requirement definition or usage is declared with a short name … this is also considered to be its requirement ID. Formally, a requirement is a kind of constraint." | **Confirmed** |
| 17 | Hyphenated IDs need unrestricted (quoted) names; element IDs are managed by tooling (S06 p.49–50) | S06 p.49 basic-name rule; p.50 unrestricted names; p.49 "expected to be managed by the underlying modeling tooling" | **Confirmed** |
| 18 | VerdictKind = pass/fail/inconclusive/error; VerificationMethodKind = inspect/analyze/demo/test (S06 p.537–540) | S06 p.537 and p.540 | **Confirmed** |
| 19 | Risk LevelEnum low/medium/high = 25/50/75 % (S06 p.559) | S06 p.559 "High level, taken to be 75% … Low … 25% … Medium … 50%" | **Confirmed** |
| 20 | `satisfy` asserts the design *should* meet the requirement (weekly plan Wk 10) | S06 p.168: "asserts that it is satisfied … always evaluates to true" | **Refuted** (M2) |
| 21 | Explicit import visibility is required (S10 sl.6) | S10 sl.6: "Visibility must be shown explicitly on import declarations" (last changed 2024-07) | **Confirmed** |
| 22 | Initial-state form changed 2026-03 (S10 sl.48–54) | Slides 48–54: "Last changed: 2026-03 (changed 'entry' to 'first start')" | **Confirmed** |
| 23 | R76 sl.115 = stakeholders (Pathway A Wk 2) | R76 = sl.100–107; sl.115 "Stakeholders and Concerns" lies in R77 | **Refuted** (mislabelled R-ID) |
| 24 | TRL table at S11 p.767 | "Table 1. Technology Readiness Levels … (Mankins 1995)" | **Confirmed** |
| 25 | Swing weight p.467; additive model p.469; Monte Carlo p.471–472 (S11) | Located on the stated pages | **Confirmed** |
| 26 | "Robust if the order is unchanged" (S11 p.340–341) | p.341 "The selection is robust if the variations do not change the order of scores" | **Confirmed** |
| 27 | N² matrix at S11 p.631 | The "Coupling Matrix and N-squared Diagram" heading is on p.630; p.631 continues it | **Partly confirmed** (off by one page) |
| 28 | Vee "not a schedule" caution at S11 p.395 | p.395: "not a life cycle model"; "retains a sequential flow". p.396: "time … proceed from left to right" | **Refuted as stated** |
| 29 | Air traffic management as a persistent SoS (S11 p.866–869) | p.869 | **Confirmed** |
| 30 | TBD/TBR at S11 p.565 | p.565 | **Confirmed** |
| 31 | DoD good-requirement attributes at S12 p.144; "orphaned" and "childless parent" at p.118 | p.144 list; p.118 both terms | **Confirmed** |
| 32 | 5×5 grid with Assume/Avoid/Control/Transfer/Watch (S13 p.642) | p.642 "Assume/Accept … Watch/Monitor", Figure 1 5×5 | **Confirmed** (S12 p.126 uses "accepted … avoided, transferred or controlled"; see m19) |
| 33 | MITRE reverses V&V (S13 p.286) | p.286 "(verification) … (validation)" reversed | **Confirmed** |
| 34 | No "FDR" in S12; S12 review set | FDR: 0 matches. ASR: 23, TRR: 4, SRR, SFR, PDR, CDR, SVR, FCA, PRR, PCA present | **Confirmed** for FDR; the list in A2.16 is **incomplete** (m7) |
| 35 | "83/83 start pages verified" | `verify_readings.py` counts an empty title as OK; R89 has "no title check" | **Refuted** (M1) |
| 36 | "Every assigned reading lies within pages read in full" | Ledgers: p.819, p.836 and pp.864–865 NOT-READ; pp.1213–1215 SKIMMED | **Refuted** (M1) |
| 37 | ISO 42010 via S13 p.341 | 42010 is in the article references on p.339; view/viewpoint definitions on p.341 | **Partly confirmed** |
| 38 | B Bloom distribution 20/30/25/15/10 % (syllabus §5) | 50 objectives by highest level: 12/32/26/22/8 % | **Refuted** |
| 39 | Exam 1 title mentions trade studies but its coverage does not (A1.12; FD-07) | S01 "Exam 1 – Foundations, Requirements, and Trade Studies" coverage list vs Exam 2 coverage | **Confirmed** |
| 40 | Phase-0 compression ≈ 19 h/week (Comparison §1) | 270/14 = 19.3 | **Confirmed** |
| 41 | Official outcome text verbatim (A1.3, A2.3) | Word-by-word comparison with S01 and S02 | **Confirmed** |
| 42 | S06 is "SysML 2.1 Beta 2 (Release 2026-07)"; S10 is "Release 2026-08" | S06 p.1; S10 p.1 | **Confirmed** |

**Result:** 42 checks.
- **28 confirmed:** #1–5, 7, 10, 13–19, 21, 22, 24–26, 29–33, 39–42.
- **3 partly confirmed:** #27, 34, 37.
- **11 refuted:** #6, 8, 9, 11 (method), 12, 20, 23, 28, 35, 36, 38.

---

## 5. Fidelity check: [S01]–[S04] and "official" labels

**Verbatim and correct:**
- A1-CLO1–5 and A2-CLO1–5
- the S01 and S02 assessment tables
- the S01 weekly topics, deliverables and assessments
- the S02 weekly topics and milestones, including SRR/PDR/FDR-style
- the S02 team roles and team size
- the S02 final-model packages and minimums
- the S02 11-link digital thread
- the S02 peer-review cycle
- the S02 Exam 1–3 coverage
- the S04 lab content in lab plan Part A2 (Labs 2A, 5, 6, 7, 8, 9, 13, 15)
- the S03 required contents in workshop rows W2–W12
- the AI Usage Statement contents (RB-12)

**Misattributions or misquotes:** m1 (merged AI-policy wording), m2 ("verbatim intent" on a paraphrase), m3 (quotation marks on an abbreviation), m4 (incomplete [S01] in-class list), m5 ("16 labs (S02)"), m6 (S04 Lab 2A count and "classes"), m7 ("FDR appears in no source", although it is in S02).

**Unflagged official gap:** m16 (AROU Register has no due week in S01).

None of these changes an official weight or outcome.

---

## 6. 20-item completeness checklist

Key: ✔ present and adequate · ◐ present with significant gaps · ✘ missing

| # | Item | **B** (integrated) | **A1** | **A2** |
|---|---|---|---|---|
| 1 | Course description | ✔ §1 | ✔ A1.1 (S01 + REC) | ✔ A2.1 |
| 2 | Population / prerequisites | ✔ §2 | ✔ A1.2 (REC; S01 silent) | ✔ A2.2 |
| 3 | Measurable CLOs | ✔ §3 (CLO3 and CLO6 compound) | ◐ official outcomes plus PIs; PI-to-rubric tags inconsistent (M7, m15) | ◐ same, plus no individual evidence for A2-CLO4 (C3) |
| 4 | Weekly objectives | ✔ weekly plan Part B (50 objectives) | ◐ one-line objectives per week | ◐ one or two objectives per week |
| 5 | Bloom alignment | ◐ tags present; the distribution is misreported (m11) | ◐ tags only, no distribution | ◐ tags only |
| 6 | Concept dependency map | ✔ §6 (needs a text alternative, m20) | ◐ "half of B's map plus bullets" | ◐ referenced ("in the order of the dependency map"), not drawn |
| 7 | Weekly topics | ✔ §7 | ✔ official | ✔ official |
| 8 | Verified readings | ◐ R-IDs with pages; verification overstated (M1) | ◐ as B; load claim false (M5) | ◐ as B; R76 sl.115 error (m8) |
| 9 | Lecture / interactive plans | ✔ session pattern plus per-week analogy, example and misconceptions | ◐ "same pattern as B"; one misconception per week | ◐ primer topics only |
| 10 | Lab specifications | ✔ L1–L13 with inputs, tasks, outputs, acceptance, time, tool, rubric | ◐ W1–W14: tasks and acceptance only; no time or inputs | ◐ acceptance criteria only; no time budgets; tool undecided (C1) |
| 11 | Deliverables | ✔ CP1–CP5 with minimum scope | ✔ the 17 official deliverables, S03 contents | ✔ official labs, reviews and final model |
| 12 | Individual + team assessments | ✔ §12 | ✔ official (40 % individual + peer) | ◐ official; 70 % team; A2-CLO4 has no individual evidence (C3) |
| 13 | Analytic rubrics | ◐ RB-1–14; no notebook rubric (m22), peer-review quality unscored, parse gate (M4) | ✔ RB-1–7, 11, 12, 13, 15 | ◐ no blueprint or rubric for Exams 1–2 beyond one sentence |
| 14 | Workload / contact hours | ◐ §14 inconsistent with the weekly plan (M5) | ◐ 135 h vs 142.5 h | ◐ 135 h vs 147 h |
| 15 | CLO matrix | ◐ contradictory (C2) | ✔ A1.1–A1.2 (equal-weight note, spot-check 12) | ◐ R cells counted as evidence; V2 ✘ (C2, C3) |
| 16 | Continuous capstone | ✔ one project, stable IDs, thin threads | ✔ ID register handed to A2 | ◐ continuity gaps (m17) |
| 17 | Final review criteria | ✔ §17, B.6, RB-11 | ✔ RB-11, 15–20 min (S03 D16) | ◐ "as B.6, scaled" plus CDR p.83–87; FDR basis is REC |
| 18 | Quality + accessibility | ◐ calibration and WCAG present; tool accessibility unassessed; university statement TBD | ◐ "same as B" | ◐ "same as B" plus a tool-accessibility risk |
| 19 | AI / integrity | ✔ §19 (fix m1) | ✔ official policy plus REC rules | ✔ official plus REC |
| 20 | Risks / limitations / decisions | ✔ §20 plus FD list | ✔ A1.20 | ✔ A2.20 |

**Tally:**
- B: 14 ✔, 6 ◐, 0 ✘
- A1: 11 ✔, 9 ◐, 0 ✘
- A2: 6 ✔, 14 ◐, 0 ✘

Nothing is missing outright. The A2 gaps are concentrated in instructional detail (items 4, 5, 6, 9, 10) and in assessment validity (items 3, 12, 15).

---

## 7. Items the review looked for and did *not* find (positive findings)

- **No invented university policy or accreditation.** FD register "Items explicitly not claimed"; every WSU reference says "verify". 34 CFR 600.2 and the DOJ 2024 Title II rule are real external sources and are labelled as such.
- **No FD-ID referenced but undefined.** FD-01 to FD-25 are all defined.
- **No lab-ID or rubric-ID drift.** L1–L13 are consistent across the syllabus, weekly plan and lab plan; RB-1 to RB-15 are all defined.
- **The checkpoint contents in syllabus §11 match** lab plan L1–L13 and B.5 (counts: ≥ 12 STK, ≥ 8 NEED, ≥ 5 CAP, 3 SCN, 15–20 REQ, ≥ 3 MOE, ≥ 5 MOP, ≥ 2 TPM, 3 TECH, ≥ 8 AROU, ≥ 6 FN and ≥ 6 PHY, ≥ 5 IF, ≥ 3 threads).
- **The week numbers of exams and checkpoints agree** across the syllabus, weekly plan and lab plan: B Exam 1 in Week 7, practical in Week 13; CP1, CP2, CP3, CP4 and CP5 due in Weeks 3, 6, 8, 11 and 14.
