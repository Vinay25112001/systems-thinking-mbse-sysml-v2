# Week 6 sign-off pass: Technology readiness, uncertainty, risk and AROU (CP2, SRR-style review, micro-lab 2)

Reviewer: Independent AI reviewer (Claude), sign-off pass. Date: 2026-10-11.

**Inputs**
- First review: `_source_cache/review/week06_review.md` (W6-F01..F11).
- Authors' dispositions: `learning-studio/docs/authoring/week06_notes.md`. These were verified against the code, not taken on trust.

**Material re-read**
- `src/content/weeks/week06.ts`
- `src/activities/week06/*`
- `sysml/week06/*`
- `src/content/course.ts` (Week 6)
- Reference `src/model/reference/week06.ts`, in the state after the lead's batch commits (HEAD `63ee490`)

No course or app file was left modified. Mutations were applied and then reverted with `git checkout`; afterwards `git diff --stat` was empty for each file.

## Verdict: **SIGN-OFF**

All eleven original findings are resolved. There are no new critical or major defects.

The new findings are all minor or nit. One minor (W6-S01, heuristic false positives) should be fixed before release, but it does not block. The workload caution is honest but understates the overrun slightly (W6-S03). That is a faculty decision.

## Tool runs (from `learning-studio/`, after the batch commits)

| Command | Result |
|---|---|
| `npx tsc -b` | **clean** (exit 0). An earlier run failed on `src/model/reference/week07.ts` l.75: the batch agent's unescaped apostrophe in DEC-001, which is not Week 6 material. It was fixed in `6c04ddb` and re-run clean. |
| `npx vitest run src/activities/week06 src/activities/week07 src/content` | **8 files, 167 tests passed**. |
| `npm run build:student` | Built. Leak check: "student build: none of 13 exam markers present; instructor build: 13 of 13". |
| `python -I scripts/check_sysml.py sysml/week06 --report <scratch>` | `aerolink_charging.sysml` **PASS**. `invalid_usage_redefines_missing_feature.sysml` **FAIL as intended**, with `ERROR 16:23 Couldn't resolve reference to Feature 'usableEnergy'`, exactly as the lesson states (line 16). |
| Probe (scratch file): `attribute redefines ratedPower = 160 [kW * h]` on a `PowerValue` | **PASS**, no diagnostic. This confirms the observed behaviour that the lesson, u2 and q6-17 teach. |
| Independent recomputation (Python) | All Week 6 numbers reproduce (below). |
| Heuristic probes (`jiti`, new inputs, not the first reviewer's six) | See W6-S01. |

## Disposition of the original findings

| ID | Sev. | Status | Evidence |
|---|---|---|---|
| W6-F01 owner/provenance | major | **RESOLVED** | Both recorders render `ProvenanceOwnerFields`. Both block on `ownerProblem` (`RiskRegister.tsx` l.64; `TrlAssessor.tsx` l.35). Both pass `{owner, provenance}` to `apply()` and `updateElement()` (RR l.72, l.80; TA l.56, l.62, l.67). The new A created from the assessor carries owner and provenance and no empty `owner` attribute. Edits reload the element's own tag (RR l.57). Component tests cover it. |
| W6-F02 micro-lab 2 missing | major | **RESOLVED** | Block `w6-sysml`, listings `sysml/week06/*` (validated above), activity `w06-sysml-microlab2` (14 reading targets and 6 unit verdicts, matching the facilitation note) and quiz q6-16..18. B6.5 is in `course.ts` l.123. Content checked against S06 p.63–64 and p.77 (R80), S10 sl.9–15 (R70) and sl.167–168 (R79). |
| W6-F03 q6-6 key vs consequence scale | major | **RESOLVED** | R-004 is C4 in the worked example and table, with the cell still moderate. q6-6 is re-cased: 30 %, a REQ-SYS with a workaround → L2 × C3, Low, consistent with the `risk.ts` C3 anchor and row L2 = LLLMM. The reference now records `3, 4` (batch commit). |
| W6-F04 heuristics accept bad input | major | **RESOLVED** (for the reported class) | `riskStatementProblems` and the SRR `OPINION` / `VAGUE_CHANGE` checks reject all six reviewer probes, and the regression tests exist. Mutation M1 (below) proves the tests bite. The activity wording is softened to "flags … heuristic". Residual over- and under-matching on new inputs: W6-S01. |
| W6-F05 quiz verbatim | major | **RESOLVED** | Seven items re-cased: q6-2 cargo-pod TRLs; q6-5 freezing fog; q6-6 firmware; q6-7 spoke lease; q6-8 bird strike; q6-9 charger SLA; q6-14 AI dispatch optimiser. None is answerable by copying the lesson. Keys checked (below). |
| W6-F06 workload | major | **RESOLVED** (disclosed) | R61 p.630–646 is core (`course.ts` l.125). Core reading is 48 pp: 5 + 9 + 6 + 7 + 4 + 17, verified. The annex is 2.0 h, the micro-lab 0.5 h, and the total is held at 11.0 (sum verified). The ≈ 13 h realistic figure is stated in `cautions`. See W6-S03 for one omission. |
| W6-F07 "defensible L1 × C5" | minor | **RESOLVED** | The lesson now says "below the scale … floor L1 by convention, record it". `compareWithOrdinal` returns `agrees: false` below 1 % for every ordinal. Mutation M2 proves the test catches the old behaviour. |
| W6-F08 SRR adaptation understated | minor | **RESOLVED** | S9 was added (R40 p.72 "System safety … hazards … mitigating courses of action allocated", verified on the page). Dropped and deferred criteria are listed with reasons. Remaining small gaps: W6-S05 (nit). |
| W6-F09 TECH-001 "maturity risk" R-005 | minor | **RESOLVED** | The table shows "— (TRL ≥ 6; external dependency R-005)". `TRL_KEY` has `maturityRisk: ''` and `relatedRisk`. The reference now uses `relatedRisk: 'R-005'` (batch commit). |
| W6-F10 issues have nowhere to go | minor | **RESOLVED** (locally) | `IssueLog.tsx` provides `checkIssue` (owner role, affects, action, R-nnn link) and copies to CP2 §7. A shared ISS kind remains an optional lead request. |
| W6-F11 R51 strategy stretched | minor | **RESOLVED** | Staged commitments are now tied to the evolving REQ-STK-004. The grid connection is presented via R51 p.56's real-options advice, "by analogy". Both are verified against R51 p.56. |

## New findings

| ID | Sev. | Location | Finding | Evidence | Recommended fix |
|---|---|---|---|---|---|
| W6-S01 | minor (fix before release) | `risk.ts` `MISSING_TREATMENT_AS_EVENT`, `PAST_IN_THEN`; `srr.ts` | **The new heuristics over-match legitimate risks and still miss near variants.** These are errors, so they block saving, and the message is wrong and cites a source. **False positives (blocked):** (1) "If the supplier **fails to provide** the test report by month 6, then the charger order slips and REQ-SYS-001 cannot be verified…". (2) "If the utility **does not install** the upgraded transformer by month 12, then hub 3 cannot charge two aircraft… REQ-STK-004…". Both get "the 'if' is the absence of a treatment … a mitigation written into the statement (R61 p.633)". But third-party non-performance is a genuine uncertain event, and external-dependency risks of exactly this kind (R-005, U-002) are central to CP2. (3) "…then by month 18 the 20 % reserve of REQ-SYS-003 **will have been** eroded…" is rejected as an issue. **Still accepted:** "If **no** fire suppression **is installed** on the pads, then…" (embedded mitigation); "If the utility **has cut** the connection at hub 3 twice **this month**, then…" (an issue); SRR "REQ-SYS-003 seems off…; please **change** it so it is better somehow overall." | `jiti` probe in a scratch dir; `heuristics.test.ts` has no third-party "fails to / does not" case. | Restrict the `do not / fail to` branch to a first-person or AeroLink subject (`(we\|the team\|aerolink)\s+(do not\|…)`), as the first review suggested. Add `no … (is\|are) installed\|fitted\|provided`. Drop `have been\|has been` from `PAST_IN_THEN` when preceded by `will`. Add `has <verb>ed` and `this (week\|month)` to the issue markers, and `somehow\|better` to `VAGUE_CHANGE`. Add these seven probes as regression tests: three must pass, four must be flagged. |
| W6-S02 | minor | `week06.ts` `cautions` (bullet 9 "reference … still rates R-004 C3…"; workload bullet "course.ts lists R61 as an extension reading"); `answerKey` bullet 2 ("the reference file still records C3 pending the lead's update"); `trl.ts` l.109–111 comment; notes "Requests to the lead" 1–3 | **Stale records after the lead's updates landed.** The reference now has R-004 `3, 4` and TECH-001 `relatedRisk`, and `course.ts` has R61 p.630–646 in `readings`. The module still tells instructors that the reference view shows the old values. | `git log` `6c04ddb`, `63ee490`; `course.ts` l.125. | Delete the caution bullet and the clause in the answer key. Change the workload caution to "R61 p.630–646 is a core reading". Update the `trl.ts` comment and mark notes requests 1–3 done. |
| W6-S03 | minor (faculty) | `workload`, `cautions` | **The realistic total is slightly understated.** "Online direct instruction and the four … activities" is budgeted at 0.8 h. The lesson is ≈ 7,300 words (counted), and there are five activities, including the micro-lab reading tool and the quantifier. Week 5 budgets 0.8 h for ≈ 5,150 words, and Week 7 states ≈ 1.0 h realistic for ≈ 5,000 words. At the same rates Week 6 online work is ≈ 1.2–1.4 h. The realistic total is therefore ≈ 13.5 h, not ≈ 13 h, and the online line is not mentioned in the caution. The caution's other arithmetic is right: L6 1.4 vs ≈ 3.5 h, annex 2 h, readings 3.2 h. | Word count of the `blocks` strings; Week 5 and Week 7 budgets. | Add the online line to the workload caution, giving ≈ 13.5 h. Faculty decide whether to raise §14 or move R61 p.630–633 into Week 5. |
| W6-S04 | nit | `w6-sysml` para 4 | "typed by primitive data types such as **Natural**, String and Real" is attributed to S06 p.77. That page lists String, Boolean, Integer, Rational, Real and Complex; Natural is not in the list. Natural is a ScalarValues type and the listing uses it correctly, so this is a citation-precision point only. | R80 p.77 text. | "…such as Integer, String and Real (the listing uses Natural, another ScalarValues type)". |
| W6-S05 | nit | `w6-srr` para 3; notes "every other dropped or deferred … criterion is listed" | A few Table 3-2 entries are neither kept nor listed. They are mostly contractor-understanding items: consistency with the ICD/CDD, detail enabling functional decomposition, the contractor's expansion of the specification, adequate processes and metrics, and design-consideration requirements reviewed (p.71). All are defensible to drop, but the "each for a stated reason" claim is slightly over-complete. | R40 p.71–72 (re-read). | Add one clause: "and the contractor-understanding and process criteria (p.71), because there is no contractor". |

There are **no** new critical or major findings.

## What I re-verified

**Pinned numbers (independent Python)**
- 12 × 20 × 360 × 2 = 172,800 sessions; λ = 0.1728. P(any) = 1 − e^−0.1728 = 0.158694. The exact binomial gives 0.158694, a difference of 7 × 10⁻⁸, so "agrees to five decimal places" is conservative and true.
- Outcomes: λ × 0.90 / 0.08 / 0.02 = 0.15552 / 0.013824 / 0.003456. P(≥ 1) = 14.40 % / 1.373 % / 0.345 %.
- B1 → 0.01: 0.0346 % (0.035 %). p0 × 10: any 82.24 % (L5); C5 3.397 % (L1).
- **New bird-strike item q6-8:**
  - λ = 60,000 × 5 × 10⁻⁶ = 0.3, so P(any) = 25.92 % (L2).
  - Severe λ = 0.015, so P = 1.489 %. The binomial gives 1.4888 %. This is inside L1 (> 1 %).
  - L3 × C5 is High (row L3 = LLMMH); L1 × C5 is Moderate. The key is correct, and distractor (a)'s explanation is correct.

**New and changed citations, all inside register ranges and read on the page**
- R40 p.71–72 (Table 3-2 incl. S9 safety and the cyber hazard review).
- R51 p.56 (small bets, staged commitments, "tighten … in time or scope", real options "good for interfaces in which details can be deferred").
- R80 p.63–64 (definition/usage, features, package-level usage, specialization, a usage inheriting from its definition, subsetting).
- R80 p.77 (only the kind of unit on the type; see W6-S04).
- R70 sl.9–13, 15 (definitions; abstract; `:>`; subsetting; redefinition and multiplicity; binding).
- R79 sl.167–168 (ISQ length value; SI prefixed and derived units, `newton = kg * m / s ^ 2`).
- The quiz cites R61 p.630–644 and R46 p.126; these pages were already verified in the first review.

**Quiz keys (new and re-cased items)**
- q6-2: lowest critical TRL 5 is the noise shield; the TRL 3 cells are not critical.
- q6-5 (c) is condition–if–then with no mitigation, and passes the course check (test-asserted).
- q6-6: L2 × C3, Low.
- q6-7: moderate cell → avoid, control or transfer; accept needs approval.
- q6-9: transfer leaves a dependency and the operational consequence.
- q6-14: S4 not met.
- q6-16..18 are consistent with S06 p.64 and S10 sl.10.
- Each item has one defensible key.

**Mutations (applied, targeted tests run, reverted; `git diff --stat` empty afterwards)**
- **M1** `risk.ts`: disabled the missing-treatment-as-event check (`if (false && …)`). Result: **3 tests fail** (`heuristics.test.ts` ×2, `activities.test.tsx` ×1).
- **M2** `quant.ts`: restored the pre-review `agrees: below && ordinal === 1`. Result: **1 test fails** ("…below the scale even L1 is only the floor (W6-F07)").

**Other checks**
- Session timings: 10 + 20 + 15 + 15 + 10 + 5 = 75, and 56 + 19 = 75.
- Workload sums to 11.0.
- B6.5 progression is restored (Week 5 reading → Week 6 explanation).
- The student build is free of exam markers.

## Workload (faculty decision; not blocking)

The caution is honest and mostly complete. It names syllabus §14's 11 h and a realistic ≈ 13 h, shows where the time goes (L6 1.4 vs ≈ 3.5 h, annex ≥ 2 h, core R61) and offers mitigations.

It omits the under-budgeted online line (W6-S03), so ≈ 13.5 h is the better estimate. This is a ≈ 20–25 % overrun in a checkpoint week. Recommend that faculty either raise the §14 figure for Week 6 or move R61 p.630–633 and CP2 assembly into Week 5, as the caution suggests.

---
Independent AI reviewer (Claude), sign-off pass, 2026-10-11.
