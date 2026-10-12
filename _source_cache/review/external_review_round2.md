# External Review, Round 2: Disposition of Round-1 Findings

- **Reviewer:** independent external reviewer (same reviewer as round 1).
- **Date:** 2026-10-09
- **Inputs:** the revision-1 package; the round-1 review (`external_review_round1.md`); the new and revised scripts in `_source_cache/verification/`.
- **Method:**
  - I re-ran all four scripts. Their outputs were byte-identical to the committed files: SHA-1 of the syllabus, `readings_verified.txt` and `bloom_count.txt` unchanged, and `clo_evidence.py` stdout identical to `clo_evidence_out.md`.
  - I recomputed every new number by hand.
  - I re-opened the cited source pages.
  - No curriculum document was modified. The scripts rewrote their own outputs with identical content.

---

## 1. Summary verdict

**Substantially improved. No critical finding remains open in a form that blocks *faculty review*.** Two items cannot be resolved inside this session and remain preconditions for *approval*:
- **C1:** the tool decision, FD-08.
- **M8:** the formal SysML 2.0 text, FD-27.

**What was fixed well:**
- **Evidence maps (C2).** The outcome-evidence maps are now generated from one checked script, and the syllabus, matrix and generator agree.
- **Attainment rule (C3).** Attainment is conjunctive: a student needs level ≥ 3 on the CLO's individual parts *and* on its team parts.
- **`satisfy` (M2).** The semantics are correct and include the negated form (S06 p.168).
- **Reading verification (M1).** It is honest: 89/90 entries pass, with one exception (R30) declared. The start-page tokens are now real headings, and the reading ranges stop before the reference lists.
- **Pathway B calendar (M3).** It fits the available minutes.
- **Smaller fixes.** The parse gate is proportionate (M4), the workload totals are internally consistent (M5), and 21 of the 22 minor findings are fixed.

**Residual problems are mostly second-order:**
- Rubric CLO tags that the generator does not use.
- Three stale "adopted tool / parser" phrasings.
- A dangling reference to a disposition file that does not exist.
- Workload series that were not re-derived after scope moved.
- Thin individual evidence for A2-CLO4 (1 % of the grade) and A2-CLO5 (2.2 %).

**Disputed point (M9, "requirement groups").** The author is right. S06 p.167 says nested requirements are "useful for modeling groups of requirements that are intended to be satisfied together on the same subject" (example `requirement def VehicleRequirementsGroup`). S10 slide 90 is titled "Requirement Groups" and states "A requirement may also be used to group other requirements… Grouped requirements are treated as required constraints of the group." Only the graphical «requirementGroup» stereotype (S09) is non-standard. **I withdraw that sub-point**, and the revised primer P4 wording is accurate.

---

## 2. Disposition of every round-1 finding

Key: **R** = Resolved · **PR** = Partly resolved · **NR** = Not resolved · **D-A** = Disputed, author's position upheld (finding withdrawn) · **D-R** = Disputed, reviewer's finding stands.

### Critical

| ID | Disposition | Evidence |
|---|---|---|
| **C1** Tool undecided; gates depend on it | **PR**: cannot be resolved in this session; **downgraded to Major (open, externally blocked)** | **Done:** gates now read "course-designated checker" (RB §0 safeguard 5; lab plan; syllabus §10, §17). FD-08 holds a 7-step evaluation protocol, including timing 10 requirements and 1 scenario as feasibility evidence and a screen-reader test. There is an interim fallback ("instructor syntax review against the errata sheet"). B.4 CP4 is honestly marked "**Untested**".<br>**Still open:** no tool has been run; the practical exam (RB-14 T1/T5) cannot be run without one. Leftover tool wording: N6. |
| **C2** Contradictory outcome-evidence maps | **R** (residual tag issues carried under M7) | `clo_evidence.py` decomposes every component into parts, asserts the sums, and is the stated single source. Syllabus §3 and §15 match matrix §1 and §4 cell by cell; I checked all 6 × 10 cells. "R" cells are no longer counted. My hand recomputation of the B table: CLO1 3.0 + 3.15 = 6.15; CLO2 4.8 + 8.75; CLO3 4.2 + 6.44; CLO4 7.8 + 14.645; CLO5 5.2 + 6.93; CLO6 5.84 + 9.24. Total 80 % + 20 % formative/conduct = 100 %, matching the generator. |
| **C3** Individual attainment not secured | **PR**: resolved for B; thin for A2 | The conjunctive rule (matrix §0) and V2 now hold for every CLO in B, A1 and A2. A2-CLO4 now has an individual part: 20 % of Exam 2 = **1.0 %** of the grade, roughly 8 minutes of a 40-minute exam. A2-CLO5 individual = 2.2 % (per-student RB-11.5 shares). Because attainment is conjunctive, these small items now **decide** individual attainment. That is valid in kind but low in reliability (see N10). |

### Major

| ID | Disposition | Evidence |
|---|---|---|
| **M1** Verification overclaims | **R** | The verifier no longer counts an empty title as a pass ("RANGE ONLY (not verified)"). It adds a SEBoK reference-list check, and the result is 89/90 with R30 declared (p.1395 confirmed: the Digital Twin paragraph, then "References"). The new tokens are genuine section headings: "1 Scope" (S07 p.33), "7.1 API Model" (S08 p.31), "7.3 Core" (S05 p.51), "9.3.3 Risk Metadata" (S06 p.558), "Systems Modeling Language" (S09 p.5). The ranges were trimmed to body pages (R07 814–818, R08 829–834, R12 860–863, R24 1203–1212), and each now lies inside READ-FULL rows of `sebok_C.md` and `sebok_D.md`. |
| **M2** `satisfy` inverted | **R** | Weekly plan Week 10, RB-14 T2 and primer P3 now state that a `satisfy` usage *asserts* the requirement is satisfied (S06 p.168). The negated `not satisfy` form is mentioned (p.168, confirmed). The misconception was rewritten as "`satisfy` is evidence of compliance." |
| **M3** B calendar infeasible | **R** (two new minors: N3, N11) | Minutes recomputed: Week 6 is 56 + 19 = 75; Week 9 is 40 + 35; Weeks 7, 11 and 13 are 45 + 30; Weeks 5 and 8 are 55 + 20. CP5 needs 8 × (10 + 6 + 2) = 144 of 150 minutes. The CP4 review is now asynchronous and written (RIDs, RB-17). |
| **M4** Parse gate disproportionate | **R** | More than 2 parse errors now caps RB-8.2–8.6 at level 2, not 1, with a 24-hour repair window and a 10 % deduction. Scope is limited to RB-8. RB-8.1 now has a level-2 descriptor ("1–2 localised errors"). |
| **M5** Workload inconsistent | **R** (new minor N4) | B: 134 h, mean 9.57, 6.3 % above 126 h; syllabus and plan agree. A1: 142.5 h, 5.6 % above 135 h. A2: 147 h, 8.9 % above. The reading-rate assumption is stated (≈ 15 pp/h). A1 reading load of 13–26 pp/week is verified (Week 4 = 13, Weeks 3 and 11 = 26). |
| **M6** SysML compression in B | **R** (new minor N5) | Three 20-minute read-only micro-labs (Weeks 5, 6 online, 8). CP4 is reduced to requirements, structure and allocation; behaviour moves to CP5. The FD-22 trigger is restated. The load moves to CP5 (budget still "≈ 36 h, tight"). |
| **M7** Rubric CLO tags inconsistent | **PR** | Most tags were regenerated (RB-5.5 → B-CLO3/A1-5/A2-3; RB-6 → A2-3; RB-12 → A1-4; RB-7.x → B-CLO4). Remaining mismatches with `clo_evidence.py` are listed in N2. |
| **M8** Beta baseline described as normative | **PR**: cannot be resolved in this session | "Normative" was removed (A2.8). FD-27 was created. Comparison §6 now baselines on "the grammar accepted by the course-designated checker" and labels the reviewer's 2025-adoption remark as unverified. Obtaining SysML 2.0 needs approval. |
| **M9** Primer not sized to the official A2 demands | **R**; requirement-groups sub-point **D-A** (withdrawn) | Phased targets: STK ≥ 12 in Week 2 → 20 by the Week-5 review; REQ ≥ 15 in Week 3 → 30; scenarios 3 in Week 7 → 5 in Week 8. These appear in Pathway A A2.11, weekly plan A2 and lab plan A2. Exam minutes are now placed (40 minutes at the start of session 2 in Weeks 6 and 12; that week's lab is done out of class). Leftover "Lab 7 (5 scenarios)" in Pathway A A2.4: N7. |

### Minor

| ID | Disposition | Evidence |
|---|---|---|
| m1 | R | Syllabus §19 quotes S01 ("AI use is expected and required throughout this course.") and S02 ("AI is permitted, encouraged, and required within defined course activities.") separately. Both verified against the source text. |
| m2 | R | A1.1 is now labelled "[S01, paraphrased]". |
| m3 | R | A1.8 uses the full S01 names and no quotation marks. |
| m4 | R | A1.9 now includes "systems engineering activities" and "assignment revisions". |
| m5 | R | Comparison §1 now reads "16 labs (S04)". |
| m6 | R | "the 6 external entities of S04 Lab 2A" (L2, W2, CP1). |
| m7 | R | A2.16 and FD-16 add ASR and TRR, and "FDR is S02's own term". |
| m8 | R | "R77 sl.115" (Pathway A Week 2; weekly plan A2 Week 2). `consistency_check.py` checks for the stale form. |
| m9 | R | R78 is level E in the register. R44, R25, R57 and R58 are X in both the Pathway A document and the weekly plan. |
| m10 | R | N² cited as "S11 p.630–631" (confirmed). The Vee is now taught as a course position, quoting "not a life cycle model" / "retains a sequential flow" (p.395). The API claim is attributed to the reader notes. ISO 42010 is cited at p.339, definitions at p.341 (confirmed). |
| m11 | R | `bloom_count.py` counts 57 objectives (`grep` confirms 57 objective lines): Understand 11, Apply 17, Analyse 12, Evaluate 13, Create 4. The syllabus table is generated from it. |
| m12 | **PR** | C.5 now compares like with like: risks 4/10 = 40 %, modelled scenarios 1/5 = 20 %. But the summary "≈ 40–60 %" (syllabus §11, comparison §2) omits the 20 % row and the 67 % upper bound for requirements. Comparison §5 item 8 does mention the 20 % exception. |
| m13 | R | 52–78 pp (54–81 with Technology Risk), matching my round-1 computation. |
| m14 | R | "Short form" rubric references are removed; no matches remain. |
| m15 | R | PI-2.3 threshold changed to ≥ 75 %, matching the RB-3 band. |
| m16 | R | FD-26: AROU starts in Week 2 and is graded in Week 8. Reflected in A1.12, the weekly plan and the generator. |
| m17 | R | W5 now requires ≥ 30 requirements; W4 requires a named Operational Scenarios Package. |
| m18 | R | RB-13: peer evaluation counts once; no multiplier. |
| m19 | R | Handling terms are cited to S13 p.642. |
| m20 | R | Syllabus §6 has a nested-list text alternative. |
| m21 | R (but see N1) | The `TEST_REPORT.md` note was corrected, and `DECISION_LOG.md` now points to the FD register. |
| m22 | R | RB-16: 3 random entries plus the final reflection, ≈ 10 minutes per student. |

**Tally of the 34 round-1 findings:**

| Disposition | Count | Findings |
|---|---|---|
| Resolved | 29 | C2; M1–M6; M9; m1–m11; m13–m22 |
| Partly resolved | 5 | C1, C3, M7, M8, m12 (C1 and M8 are externally blocked) |
| Not resolved | 0 | — |
| Disputed | 1 sub-point | Inside M9; author upheld |

---

## 3. New issues introduced or exposed by the revision

There are no new critical issues and no new major issues. All are minor, plus one carried Major (C1, downgraded).

| ID | Where | Problem | Fix |
|---|---|---|---|
| **N1** | Syllabus status row; `DECISION_LOG.md` R2; `PROJECT_STATUS.md` | They cite `ACADEMIC_QUALITY_REVIEW.md` as the disposition record. **The file does not exist.** `consistency_check.py` lists it but skips it silently when absent. | Create it, or remove the references. Make the checker fail on a missing referenced file. |
| **N2** | `ASSESSMENT_RUBRICS.md` tags vs `clo_evidence.py` (residual M7) | (a) RB-14 T2 and T5 lack **A2-1**, but the generator counts T1, T2, T5 and T6 as A2-1. (b) T6 is tagged **B-CLO5**, but the generator counts it only as B-CLO4. (c) RB-12 is tagged **A1-4**, but no A1 component has an RB-12 evidence part (PI-4.2 is described as "corroborating"). (d) Lab plan A2 Lab 6 lists **RB-6.1–6.3** and Lab 11 omits **RB-12**; the generator does the opposite. (e) Lab plan B.5's CLO column omits **B-CLO6** for CP1 and CP2, although RB-12 and RB-3.6 count there. The claim "tags regenerated from the single evidence map" is therefore not literally true. | Generate the tag column from the script, or add a tag-vs-generator assertion to `consistency_check.py`. |
| **N3** | Syllabus §12 "Individual accountability" | Claims "individual questioning at CP3, CP4 and CP5". The CP4 review is asynchronous and written, with no individual element. The CP3 5-minute team defence has no individual criterion. | Say "CP5 (and A2 reviews)", or add an individual item to CP3 and CP4. |
| **N4** | Weekly plan workload series | The series were not re-derived after scope moved. A2 says "phasing moves load from Week 7 into Week 8", but the A2 series is byte-identical to round 1 (Week 7 = 11, Week 8 = 9.5). The A2 exam weeks now push labs out of class, with no change in hours. B moves behaviour from CP4 to CP5 and adds micro-labs, and the B series is also unchanged. | Re-derive the series, or state that the numbers are unchanged estimates. |
| **N5** | Syllabus §9 micro-labs; A2 primer | The micro-labs (Weeks 5–8) and the primer show SysML fragments. The course's own policy (comparison §6; weekly plan "Known limitations") forbids showing SysML as correct before checker validation. The M6 fix therefore pulls the FD-08 dependency forward from Week 9 to Week 5. | State that micro-lab fragments fall under the interim errata-review fallback, or require FD-08 before Week 5. |
| **N6** | Pathway A A2.3 PI-1.1 ("parses … in the adopted tool"); A2.4 ("must be parser-checked in the adopted tool"); A2.10 ("parser check"); RB-12.3 ("passes the parser") | Stale tool wording, inconsistent with the tool-neutral gate. | Replace with "accepted by the course-designated checker". |
| **N7** | Pathway A A2.4 table ("Lab 7 (5 scenarios)"); FD-13 ("may roll scenarios 4–5") | Conflicts with the now-required phasing (3 in Week 7, 5 in Week 8). | Align. |
| **N8** | Comparison §2 | "SysML exposure: 6 weeks (9–14)" ignores the Week 5–8 micro-labs. "PDR-style (Week 11)" is now an asynchronous review spanning Weeks 11–12. | Update. |
| **N9** | Syllabus §11; comparison §2 (residual m12) | "≈ 40–60 % like for like", while C.5 ranges from 20 % to 67 %. | Say "40–67 %, except modelled behaviour (20 %)". |
| **N10** | Matrix §0 (conjunctive rule) | (a) A strong student in a weak team cannot attain a CLO ("an individual cannot attain a CLO that their team's artifact did not demonstrate"). This is a defensible programme-assessment choice, but it should be stated as such. (b) For A2-CLO4 (1.0 %) and A2-CLO5 (2.2 %), and for B-CLO6's live individual part (RB-11.5 at CP5 = 0.84 %, about 90 seconds of Q&A per student in a 6-minute panel), the deciding individual measure is very short. | Report individual and team attainment separately. Lengthen or replicate the decisive individual items (e.g. two AI-critique items; a 3-minute individual slot at CP5). |
| **N11** | Lab plan L11; RB-17 | CP4 (due in Week 11) is partly graded on RIDs written in days 1–3 of Week 12. Instructor RIDs for 8 teams within 3 days is a concentrated load, and a late peer team delays another team's CP5 dispositions. | Allow a late-RID fallback (instructor RIDs only). Budget the instructor hours. |
| **C1 (carried)** | FD-08 | No tool has been evaluated. The practical exams and L9–L13 cannot be run. | Execute the FD-08 protocol before the submission for approval. |

---

## 4. Spot-check log, round 2

| # | Claim | Check | Result |
|---|---|---|---|
| 1 | B weights total 100 %; CP compositions each 100 % (syllabus §12) | 10+12+13+5+7+10+9+10+14+10; CP1 45/45/10, CP2 40/20/30/10, CP3 45/45/10, CP4 75/15/10, CP5 25/30/15/30 | Confirmed |
| 2 | B evidence table (matrix §4, syllabus §15) | Hand recomputation (see C2 row) | Confirmed |
| 3 | A1 evidence table | Exam 1 sevenths: 4.29 / 8.57 / 2.14; Exam 2 thirty/ten percent shares; deliverables 50 % | Confirmed (equal-topic claim now true) |
| 4 | A2 evidence table; "A2-1 ≈ 42 %", "A2-2 + A2-3 ≈ 29 %" | Labs 25/14 each; reviews; final model; total 90 + 10 | Confirmed (42.4; 16.3 + 12.7 = 29.0) |
| 5 | `clo_evidence_out.md` is the script's verbatim output | Re-ran and compared with `diff` | Confirmed |
| 6 | B workload 134 h, 9.6 mean, ≈ 6 % above 126 h | Sum; 134/126 = 1.063 | Confirmed |
| 7 | A1 142.5 h, +5.6 %; A2 147 h, +8.9 % | Sums; ratios against 135 | Confirmed |
| 8 | A2 "phasing moves load from Week 7 to Week 8" | The series is identical to round 1 | **Refuted** (N4) |
| 9 | B reading loads per week (§8) | e.g. Week 1: 4+3+4+5 = 16; Week 6: 5+9+6+7+4 = 31; Week 9: 5+3+3+5 = 16, 17+18 = 35 slides; Week 13: 8+6 = 14 | Confirmed (all 14 weeks) |
| 10 | A1 reading loads 13–26 pp | Week 4 6+7 = 13; Weeks 3 and 11 = 26; Week 14 5+2+11 = 18 | Confirmed |
| 11 | Bloom table: 57 objectives, 11/17/12/13/4 | Re-ran the script; `grep` gives 57 objective lines | Confirmed |
| 12 | CP5 minutes 144 of 150; other review-week minute plans | 8 × 18; 56 + 19; 40 + 35; 45 + 30; 55 + 20 | Confirmed |
| 13 | Verifier 89/90; R30 shares p.1395 with its references | Re-ran; p.1395 shows Digital Twin, then "References" | Confirmed |
| 14 | Strengthened instructor-reference tokens are real headings | S07 p.33, S08 p.31, S05 p.51, S06 p.558, S09 p.5 | Confirmed |
| 15 | Revised SEBoK start pages (articles beginning mid-page) | Title is a heading mid-page on pp.273, 463, 481, 569, 1229, 279 | Confirmed |
| 16 | "Every assigned body page lies in READ-FULL pages" | R07, R08, R09, R12, R24, R25 and R30 ranges against the `sebok_C`/`sebok_D` ledgers | Confirmed |
| 17 | S06 p.167 / S10 sl.90: requirement groups | Source text quoted in §1 | Confirmed (author upheld) |
| 18 | S06 p.168: `satisfy` asserts satisfied; `not satisfy` exists | Source text | Confirmed |
| 19 | S11 p.630–631 N²; S13 p.339 ISO 42010 | Round-1 extracts | Confirmed |
| 20 | Official AI-policy quotes (syllabus §19) | S01 and S02 text | Confirmed (verbatim) |
| 21 | Lab plan C.5 like-for-like shares | 12/20, 5/10, 15–20/30, 6/10, 1/5, 4/10, 3/5, 2/4, 3/5 | Confirmed; the summary range is **refuted** (N9) |
| 22 | "Tags regenerated from the single evidence map" | Tag-by-tag comparison (N2) | **Refuted** (5 mismatches) |
| 23 | "Individual questioning at CP3, CP4 and CP5" | CP4 is asynchronous and written | **Refuted** (N3) |
| 24 | Disposition record `ACADEMIC_QUALITY_REVIEW.md` | File listing | **Refuted** (absent; N1) |
| 25 | `consistency_check.py` reports "NO PROBLEMS"; 27 FD, 17 RB, 90 readings | Re-ran | Confirmed (scope limited; it does not check tags or missing files) |
| 26 | S03 lengths 52–78 / 54–81 pp (A1.14) | Round-1 computation | Confirmed |
| 27 | A2 "14 graded lab submissions" (generator) | 1–12 + 13/14 + 15 = 14; Lab 16 = final model | Confirmed (Lab 16's exclusion is implicit; worth stating) |
| 28 | Comparison "SysML exposure 6 weeks" | Micro-labs from Week 5 | **Refuted** (stale; N8) |

**Result:** 28 checks; 22 confirmed (one of them with a refuted sub-claim, #21), 6 refuted (#8, 22, 23, 24, 28, and #21's summary range).

---

## 5. Re-ratings (0–4; same rules as round 1)

**Rules, restated:**
- A criterion is capped at 2 if a verified error of the relevant kind is assessed or would mislead students.
- Readiness is capped at 2 while a Critical finding is open. C1 is now carried as Major (externally blocked), so the cap no longer applies.
- **Added in round 2:** laboratory feasibility cannot exceed 2 until a tool has been run on the instructor reference model (FD-08 step 4).

| # | Criterion | A (r1 → **r2**) | B (r1 → **r2**) | Evidence |
|---|---|---|---|---|
| 1 | Academic coherence | 3 → **3** | 3 → **3** | Maps now consistent. B-CLO4 is broader and compound (architecture plus model). |
| 2 | Depth and rigor | 3 → **3** | 2 → **3** | B: on-ramp from Week 5 and lighter CP4. Awareness-depth topics are declared. |
| 3 | Sequence and prerequisites | 2 → **3** | 3 → **3** | A2 phasing and exam minutes placed. N7 is a leftover. |
| 4 | Outcome measurability | 2 → **3** | 3 → **3** | PI-2.3 aligned; A2-CLO4 individual PI added. N2 tag drift remains. |
| 5 | Assessment validity | 2 → **2** | 2 → **3** | B: conjunctive rule, proportionate gate, RB-16 and RB-17. A: still significant gaps, because the decisive individual evidence for A2-CLO4 (1 %) and A2-CLO5 (2.2 %) is thin (N10) and the official weighting is 70 % team. |
| 6 | Laboratory feasibility | 2 → **2** | 2 → **2** | B calendar fixed (M3). Capped by the round-2 rule: no tool has been run (C1). |
| 7 | Student workload | 2 → **3** | 2 → **3** | Totals consistent and honestly above baseline. N4: series not re-derived. |
| 8 | Coverage of SE methods | 3 → **3** | 2 → **2** | Unchanged by the revision (configuration management and cost absent; B integration and security at awareness depth). |
| 9 | SysML v2 accuracy | 2 → **3** | 2 → **3** | M2 fixed; requirement groups correct; beta status stated honestly. Not 4: nothing has been parsed, and the formal 2.0 text is absent. |
| 10 | Capstone continuity | 3 → **3** | 3 → **3** | m17 fixed. Not 4: the reference model and Data Sheet are not built. |
| 11 | Accessibility | 2 → **2** | 2 → **2** | Text alternative added; "textual = accessible" reframed as a hypothesis. The tool is unassessed and the university statement is still TBD. |
| 12 | Readiness for faculty review | 2 → **3** | 2 → **3** | No open Critical. Remaining issues are minor plus two externally blocked decisions (FD-08, FD-27). |

---

## 6. Recommendation

The package is **ready for faculty review** after a short clean-up pass:
- N1 (create or remove the disposition-file reference)
- N2 (generate the rubric tags from the script)
- N3, N6, N7, N8, N9 (wording)

**Before approval:**
- Execute FD-08: tool evaluation, reference model and timing.
- Decide FD-27 (formal SysML 2.0).
- Consider N10: strengthen the decisive individual items for A2-CLO4, A2-CLO5 and B-CLO6.
