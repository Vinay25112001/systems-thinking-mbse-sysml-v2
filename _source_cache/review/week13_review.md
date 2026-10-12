# Week 13 independent review — Analysis, change impact and model consistency (L13; Exam 2)

Reviewer: independent adversarial reviewer (AI), 2026-10-11. Object: commit `8af1385` (Week 13 files unchanged at HEAD `043ba62`).
Files: `src/content/weeks/week13.ts`, `src/activities/week13.activity.tsx`, `src/activities/week13/*`, `sysml/week13/*.sysml`, `docs/authoring/week13_notes.md`.
No course or app file was edited. Scratch probes, harnesses and the checker report are under the session scratchpad (`.../scratchpad/w13/`), not in the repo.

## Verdict

**REVISE before sign-off. No blocker; 6 Major, 5 Moderate, 12 Minor.**

The engineering core holds up. Every worked number reproduces independently. The directed impact method is stated as a course convention. Every citation inside the register is faithful, and the checker-behaviour table matches a fresh run of the 2026-08 release. The defects are in the tools and in continuity:

- The what-if analyser contradicts Week 5's taught status for TPM-002. Its "agrees with Week 5" test passes for the wrong reason.
- The energy inputs cannot take a typed decimal.
- The consistency review raises a false "dangling reference" on students' own rows.
- The graduate task depends on a commit history that students cannot see.
- Both predict-first activities sit directly under the answer they ask students to predict.
- The workload is still under-stated for an exam week.

## Verification run

| Command | Result |
|---|---|
| `npx vitest run src/activities/week13 src/content src/lib` | 6 files, 137 tests, all pass |
| `npx tsc -b` | exit 0, no output |
| Checker (`check_sysml.py <scratch> --report <scratch>`; one JVM, `tasklist` empty first) | 24 files: 19 PASS, 5 FAIL, 0 ERROR. The 5 FAILs are the 2 `invalid_*` listings plus 3 probes meant to fail. "MISMATCH" labels come only from the scratch file names. |
| Independent harnesses (Vite SSR loader; standalone scratch vitest config) | Undirected BFS, quiz sets, consistency probes, UI keystroke and false-positive probes (below) |

## Findings

### W13-F01 — Major — What-if baseline contradicts Week 5 (TPM-002 status); the cross-check test passes for the wrong reason
- **Location:** `margins.ts` header and `assess`; `MarginWhatIf.tsx`; `logic.test.ts` "baseline statuses agree with the Week 5 tracker logic"; answer key ("all on track (no history, so R3 is not applied; TPM-002 sits at its floor)").
- **Finding:** Week 5 teaches that TPM-002 at month 9 is **AT RISK by R3**. Its margin falls 0.8 → 0.5 dBA and projects to 0.2 dBA, below the 0.5 floor (`week05.ts` worked text, table row and tracker key: "TPM-002 … AT RISK by R3"). Week 13 shows the same month-9 data as "✓ On track" and says there is "no history". There is one: `TPM_HISTORY` in `week05/measures.ts`. The test calls `assessPoint` without the `previous` point, which switches R3 off. So it "agrees" with Week 5 only because the rule that differs was disabled.
- **Evidence:** `assessHistory(TPMS[1], TPM_HISTORY['TPM-002'])` → `[on-track, on-track, on-track, at-risk:R3]`. Week 13 baseline → TPM-002 on-track.
- **Fix:** Seed each TPM's previous point from Week 5's month-6 entry and apply R3 to the baseline, or show "Week 5 tracker: AT RISK (R3)" beside the row. Make the test pass the month-6 point so it can fail. Correct the answer key and the facilitation text.

### W13-F02 — Major — What-if energy inputs cannot take a typed decimal
- **Location:** `MarginWhatIf.tsx` energy fields: `onChange={(e) => setEnergy({ ...energy, [f.key]: Number(e.target.value) })}`.
- **Finding:** Each input is coerced to a number on every keystroke. Clearing a field shows "0". Typing `0.88` one key at a time displays `0`, `0`, `8`, `88`, because `"0."` becomes `0` and the dot is lost. Typing a leading `.` gives `NaN`. Capacity retained (0–1) is the input the battery scenarios, q13-12 (0.88) and the L13 battery question need.
- **Evidence:** Scratch RTL probe: after clearing → `"0"` plus the alert. Keystrokes of 0.88 → `["0","0","8","88"]`. Energy line hidden (invalid, > 1).
- **Fix:** Keep the energy inputs as strings (as the TPM edit table already does) and parse on use. Add a test that types `0.88` character by character.

### W13-F03 — Major — Consistency review flags a false "dangling reference" on students' own rows, with a false checker claim
- **Location:** `ConsistencyReview.tsx`, `checkFragment(s.rows)` called with no `knownIds`.
- **Finding:** The instructions say "enter the rows your L13 change touches and review them". Any `Refers to` naming a model element that the student did not also enter as a row is reported as "✗ Problem: … refers to REQ-SYS-001, which is not in the model". The checker column then says "Reported: FAIL 'Couldn't resolve reference …'", which is false for an element that exists. `logic.test.ts` proves that `knownIds` suppresses this, but the component never passes it. So rule 5's mirror (good input must not be rejected) fails in the real UI.
- **Evidence:** Scratch RTL probe with a single row `VER-001 criterion 18 min refersTo REQ-SYS-001` → "1 finding(s) from 1 check(s) … Reference to an ID that is not in the model".
- **Fix:** Pass the IDs of the active model as `knownIds`: `referenceUpTo(14)` in practice mode, the workspace model otherwise. Add a component test for the case above.

### W13-F04 — Major — The graduate task depends on a commit history that no student can see
- **Location:** Template section 7 ("Using the worked history (C1 tagged cp4-baseline; C2 on main; C3 on a branch; C4 merge)…"); advanced block ("In the worked history (commits.ts)…").
- **Finding:** `WORKED_HISTORY` and `RESOLVED_HISTORY` are used only by `commits.ts` and `logic.test.ts`. They are not rendered in any lesson block, activity or template. Students cannot compute (a), and (b) "why the draft C4 violates the rule" is specific to that history. The alternative, "your team's own repository", cannot answer (b) and is a git repo, not the API's DataVersion model.
- **Fix:** Render the four commits (identity → payload per change set, parents, tag) as a table in the advanced block or in the template guidance. Remove the reference to `commits.ts` from student-facing text.

### W13-F05 — Major — Both predict-first activities appear directly under the answer they ask students to predict
- **Location:** `w13-act-impact` sits in block `w13-worked-impact`; `w13-act-consistency` sits in block `w13-worked-consistency`. `WeekPage.tsx` renders `actsByBlock` at the end of the block.
- **Finding:**
  - The explorer asks "Predict the hop-1 count" for REQ-SYS-001. Directly above, the block says "gives 8 dependents at hop 1" and the table lists them. `w13-impact` already said "9 elements in one hop".
  - The consistency review asks students to "count the defects you see before running the checks". Directly above, the block says "It contains six seeded defects" and the table lists all six.
  - The code hides the results correctly. The lesson gives them away anyway. This is the recurring "predict activities leaking keys" class.
- **Fix:** Attach both activities to the concept blocks (`w13-impact`, `w13-consistency`) and tell students to use them before reading the worked example. Or put the worked tables in a `details` that opens after the run. Or make the practice target a case the lesson does not solve, e.g. REQ-SYS-005.

### W13-F06 — Major (rule 3) — Workload still under-stated for an exam week
- **Location:** `workload` (exactly 9.0 h), `cautions` (realistic ≈ 9.5 h).
- **Finding:** The caution records Exam 2 preparation as "realistically ≥ 1 h", which satisfies the letter of rule 3. The realistic total is still too low:
  - **Exam 2 prep.** Preparing for a 75-min practical over Weeks 9–12 skills (RB-14 T1–T6) realistically takes ~1.5–2 h.
  - **Knowledge check.** 0.3 h (1.5 min per item) is not enough: q13-1/2/3 need explorer runs and q13-12 needs a calculation. ~0.5 h is realistic.
  - **Reading time.** It omits R24 p.1206–1207, which the lesson cites (tolerate, modularity, loose coupling), q13-2 cites, and the evolution note and answer key use. The register narrowing that would exclude them is still only a request.
  - **Graduate task.** Option B placed the required graduate task in the exam week; Week 12's was optional.
  - **Realistic total.** ≈ 10–10.5 h for graduate students, not 9.5.
- **Fix:** State the realistic total honestly in `cautions` and the weekly plan. Better, reduce load: under option B, make Week 13's graduate task optional and put the required one in Week 14 or move it back to Week 12, or invoke FD-14 (assign the Week 13 deliverables in Week 11). Budget the knowledge check at 0.5 h.

### W13-F07 — Moderate — Graduate model answer (d) over-claims tag immutability
- **Location:** `answerKey` graduate (d): "A tag is immutable (p.35–36), so a verdict recorded against cp4-baseline always refers to the same versioned data"; advanced block, second paragraph.
- **Finding:** R88 p.35 says a Tag's `taggedCommit` cannot be modified. It also says the Tag "can be deleted and a new Tag can be created with the same name". The p.36 table gives Tag: Mutable No, **Destructible Yes**, and Commit: Mutable No, Destructible No. A verdict recorded against the tag *name* can therefore end up pointing at a different commit. Only the commit is both immutable and indestructible.
- **Fix:** Key (d): a tag is far better than a branch, which moves with every commit, but the robust reference is the tagged commit's ID; record both. Adjust the advanced block's "a tag gives the baseline" sentence the same way.

### W13-F08 — Moderate — q13-7 option b explanation misstates checker behaviour
- **Location:** q13-7 (b): "the checker does not evaluate that constraint, so it would pass silently and be wrong."
- **Finding:** Re-run: `totalRisk = new RiskLevel(probability = 2, impact = 4);` gives **PASS with 2 WARNINGs** "Bound features should have conforming types" (28:29, 28:46). Only a Real literal such as 1.5 passes silently (probe p11). This is the recurring "false SysML/checker rule" class.
- **Fix:** "…passes with only a type warning, which does not say the value is out of range; the 0–1 constraint is not evaluated."

### W13-F09 — Moderate — Quiz has a shortest-option cue
- **Location:** quiz.
- **Finding:** The key is the **shortest** option in 6 of 12 items (q13-1, -3, -4, -8, -11, -12); chance is 3 of 12. q13-8's key (40 chars) sits beside distractors of 73–86 chars and is the only option with no justification clause. The notes record "4 in 6" but leave it. Key letters are balanced (3/3/3/3).
- **Fix:** Lengthen four of those keys (give q13-8 c its reason) or shorten the distractors, so the key's length rank is about uniform.

### W13-F10 — Moderate (rule 7) — Resilience layers merged in the lab key and a misconception
- **Location:** Lab step 6 and template section 6 ask for "one resilience means (R24 p.1205–1206)"; answer key "resilience means: neutral state or safe state, human participation (R24 p.1207), monitor"; misconception "served by means such as graceful degradation, monitoring and margins (R24 p.1204–1207)".
- **Finding:** Neutral state, safe state, human participation and loss margins are **Layer 3 techniques** (p.1207). Means objectives are Layer 2 (p.1205–1206). The key answers a Layer 2 question with Layer 3 items. Monitor is correctly Layer 2.
- **Fix:** In the key, give a means (monitor, anticipate, degrade gracefully, tolerate) and optionally the technique that realises it. In the misconception, say "means such as graceful degradation and monitoring, realised by techniques such as loss margins".

### W13-F11 — Moderate — Directed method: TPM `derives-from` MOP treated as child→parent wrongly makes MOP-005 "review only"
- **Location:** `impact.ts depends` ('derives-from' → `dir === 'in'`); Session 1 notes ("Run the explorer from TPM-003 (R-002, REQ-SYS-003; upstream MOP-005)").
- **Finding:** The dependency table is clearly labelled a course convention, which is defensible. But it applies requirement-derivation semantics to `TPM derives-from MOP`, where the TPM is a MOP chosen for tracking (Week 5). In this week's own listing, MOP-005 is bound to the analysis result (line 69). When TPM-003's estimate falls to 9.4 %, MOP-005's value falls with it; it is not upstream "review only". The battery walk-through therefore gives an instruction that the week's own model contradicts.
- **Fix:** Treat `derives-from` between a TPM and a MOP as two-way (same quantity), or list it as an exception in the method text and the export.

### W13-F12 — Minor — What-if "Re-run if not on track" contradicts the lesson's re-run rule
- **Location:** `MarginWhatIf.tsx` and `whatIfMarkdown` show VERs only when status ≠ on-track.
- **Finding:** The lesson says every VER of a changed requirement goes on the re-run list. Set TPM-001's threshold to 21 (a requirement change): status is on track, so the column shows "—", yet VER-001's 20.0 min criterion must be re-stated.
- **Fix:** Show the VERs whenever the threshold differs from the reference, or on any edit.

### W13-F13 — Minor (rule 5) — Recommendation screen ticks non-recommendations
- **Location:** `recommendationProblem`; UI text "✓ OK: the recommendation states a decision, names affected elements and gives a condition or reason."
- **Finding:** "I do not really know what to say about R-001 here because it is complicated for me." returns null, which shows ✓ OK. "do not" matches as a decision, R-001 as an ID, "because" as a reason. The ✓ claims more than a form screen can know.
- **Fix:** Make the ✓ text modest ("form screen passed; the content is judged in review"), or match the decision verb in imperative position and treat "do not" only before a decision verb.

### W13-F14 — Minor — Consistency checks: silent gaps and misdiagnoses
- **Findings (scratch probes P2–P12):**
  - A unitless fraction limit (`0.20`, unit blank) whose statement says "at least 25 %" → no finding. `doc-value` needs a unit. The notes claim "fraction 25 % vs 0.20 fail"; that is true only for the threshold row.
  - "within 20 minutes" or "seconds" spelled out → silent. The regex knows only `min`/`s`.
  - Renaming one of an element's three rows → "TPM-001 is used by 3 different elements". The real defect is an inconsistent name, not a shared ID.
  - A wrong-kind estimate (`18 kW`) also triggers a meaningless stale-margin finding.
  - `mW` is read as MW, and `1e1` is ignored silently.
- **Fix:** Handle unitless fractions in `doc-value`; accept `minute(s)`/`second(s)`/`hour(s)`; report name drift as its own finding; skip the margin check when a row has a unit error. Keep unit case (`mW` vs `MW`).

### W13-F15 — Minor — Decorative or over-reaching citations
- **Findings:**
  - q13-3 cites R24 p.1208 (resilience requirements in the trade space) for a demand-change impact item. It is irrelevant to the reasoning.
  - q13-1's explanation cites R49 p.150 for "VER-002's criterion was set for 65 dBA". R49 says nothing about that criterion.
  - `actionFor('VER')` says "a verdict holds only for the configuration it was obtained on (R49 p.150)". R49 p.150 says to assess each design change against the qualified baseline, which "may include a need to repeat portions of verification". The stronger statement is the course's.
  - Likewise `w13-impact` "so every VER … goes on the re-run list" follows the R49 cite without marking where the source ends.
  - The first misconception cites R88 p.33–34 for an interpretive claim (VER-001 is not in the diff yet is affected). R88 only defines the change set.
  - q13-12 cites R75 p.93 (analysis steps) for an arithmetic item.
- **Fix:** Drop the decorative cites. Mark the R49 and R88 inferences as course reasoning.

### W13-F16 — Minor — B.6 overclaim
- **Location:** `w13-application` ("the CP5 panel will ask you to show your impact result live (B.6)"); lab continuity.
- **Finding:** B.6 requires the presentation to *show* the impact-analysis result. "Live" applies only to navigating the thread.
- **Fix:** Reword.

### W13-F17 — Minor — Cross-document drift
- **Findings:**
  - Kick-off length: 25 min in the lesson and lab, 30 min in the weekly plan, "In 0" in the lab plan.
  - L13 out of class: 2.5 h vs the lab plan's 3 h.
  - R88 pages: 32–36 (template, references) vs 33–36 (advanced block, workload).
  - R78 slides: the weekly plan says sl.147, 157–159; the lesson uses 147–148, 152 and 158–159.
  - The register and plan requests in the notes are not applied (the lead owns them).
- **Fix:** Align the documents, or list the deltas in `cautions`.

### W13-F18 — Minor — `aerolink_consistency_seeded.sysml` is committed with CRLF line endings (`git ls-files --eol`: i/crlf); the other Week 13 listings are LF. Cosmetic; line numbers are unaffected. Normalise.

### W13-F19 — Minor — Exam integrity: is the app allowed in Exam 2?
- **Finding:** The instructor notes say "Checker available; no AI tools" but say nothing about the app. On a workspace-format model, the impact explorer computes T4's first-order set mechanically.
- **Fix:** State whether the app and explorer are allowed. If they are, give T4 a model the explorer cannot load and score the method, not the list.

### W13-F20 — Minor (rule 6 edge / item quality) — Two quiz items are weak
- **Findings:**
  - q13-1 reduces to reading tool output: running the explorer on REQ-SYS-002 prints option c verbatim.
  - q13-2 can be answered by elimination: (a) is the only option that names a hop-2 element; (b), (c) and (d) are wrong by construction. The "first check" judgement is never really tested.
- **Fix:** For q13-1, add a judgement layer (which first-order re-check fails). For q13-2, make the distractors plausible hop-2 elements with weaker reasons.

### W13-F21 — Minor — Workbench missions plan
- **Findings:**
  - The "recall" mission reuses quiz items q13-1, -5, -7 and -12, which pre-exposes the knowledge check.
  - The A9 Program review that falls in Week 13 is deferred ("later") and unbudgeted, in an exam week.
  - The signals the plan relies on (`w13-impact`, `w13-whatif`, `w13-consistency`) do not exist yet. That is acceptable for a plan, but checks such as `firstOrder.length === 8` would also give away F05's answer.
- **Fix:** Draw recall from new items; budget or waive the Week 13 program review.

### W13-F22 — Minor — Analysis listing gives the TPM's short name to its margin
- **Location:** `aerolink_tpm003_landing_reserve_analysis.sysml` line 81: `attribute <'TPM-003'> landingReserveMargin : Real = …`; the risk listing (line 102) does the same.
- **Finding:** TPM-003 is the measure ("landing energy reserve", estimate 23 %). The reference puts `<'TPM-003'>` on the measure's attribute group (threshold, estimate, margin). Naming the margin TPM-003 conflates a measure with its margin. The lesson's "TPM-003's margin is an expression (line 81)" is then read as "TPM-003 = 0.03".
- **Fix:** Use `attribute <'TPM-003'> landingEnergyReserve { attribute estimate = …; attribute margin = estimate - …; }`, or give the margin no short name.

### W13-F23 — Minor — Exam 2 T4 sequencing
- **Finding:** T4 (20 % of RB-14) assesses the Week 13 convention two sessions after it is first taught. L13's formative feedback arrives after the exam. The session note "credit a stated method and a first-order set with reasons" mitigates this well.
- **Fix:** Keep that note and add it to the RB-14 key: any stated method that is consistently applied earns credit, not only the course dependency table.

## Citation fidelity

| Where | Citation | Verdict | Note |
|---|---|---|---|
| w13-analysis | R75 sl.92 (analysis def, subject, return result, objective with assume/require) | OK | |
| w13-analysis | R75 sl.93 (steps: power, then fuel economy; extra parameters) | OK | |
| w13-analysis | R75 sl.94 (usage; auto-redefinition; asserted to satisfy) | OK | Paraphrases the slide's own wording |
| w13-analysis | R75 sl.95 (TradeStudy, Min/Max objective, evaluationFunction) | OK | |
| w13-analysis | R78 sl.152 (TradeStudyObjective, selectedAlternative) | OK | |
| w13-worked-analysis, q13-6 | R75 sl.92–94 | OK | |
| q13-11, misconception | R75 sl.92 (objective is a requirement on the result) | OK | |
| q13-12 | R75 sl.93 | OVERCLAIM (decorative) | Arithmetic item (F15) |
| w13-impact | R49 p.150 (assess design changes against the qualified baseline; may repeat portions of verification) | OK; the following inference is unmarked | Week 12 reading; back-reference honest (F15) |
| q13-1 | R49 p.150 | OVERCLAIM | Not about VER-002's criterion (F15) |
| impact.ts `actionFor` | R49 p.150 "verdict holds only for the configuration…" | OVERCLAIM | F15 |
| w13-consistency, q13-4, q13-5, misconception | R83 (S06) p.168 (satisfy asserts; names the requirement) | OK | Week 8 reading (course.ts W8 lists R83 p.168); back-reference honest |
| w13-risk | R77 sl.108 (metadata def, tagging, annotatedElement subsetting) | OK | |
| w13-risk | R77 sl.109 (nested features bound; default "about" namespace; @) | OK | The "mass" ToolVariable slip caution is verified |
| w13-risk, q13-7, misconception | R78 sl.147 (Level 0–1, LevelEnum 0.25/0.50/0.75, RiskLevel, Risk) | OK | The L/M/H slide slip is verified; the library defines `RiskLevelEnum` via `LevelEnum::low/medium/high` |
| w13-risk | R78 sl.148 (StatusKind, StatusInfo, Rationale, Issue, Refinement) | OK | |
| w13-risk, q13-8 | R78 sl.158 (Multicausation, Causation binary; separate multiple effects) | OK | |
| w13-risk, q13-8 | R78 sl.159 (#cause/#effect, CausationMetadata isNecessary/isSufficient/probability) | OK | The library doc confirms causation probability = P(effects given causes), so q13-8 b's explanation is right |
| w13-resilience-ai | R24 p.1203 (RSWG definition; reactive and proactive) | OK | |
| w13-resilience-ai | R24 p.1204 (adversity, stress/strain, fundamental objectives) | OK | |
| w13-resilience-ai | R24 p.1205–1206 (means objectives incl. tolerate on p.1206) | OK | |
| w13-resilience-ai, q13-2 | R24 p.1207 (loss margins, modularity definition, loose coupling) | OK | q13-2 cite tangential |
| w13-resilience-ai, q13-3 | R24 p.1208 (life cycle; trade space) | OK in lesson; OVERCLAIM (decorative) in q13-3 | F15 |
| w13-resilience-ai | R24 p.1209–1210 (metrics; scenario requirement pattern) | OK | |
| q13-9 | R24 p.1204–1205 (withstand; degrade gracefully) | OK | Distractor c uses "prevent" (p.1206, outside the cited range); harmless |
| misconception | R24 p.1204–1207 | OK pages; layer merge | F10 |
| w13-resilience-ai | R31 p.1369–1370 (AI4SE / SE4AI) | OK | |
| w13-resilience-ai, q13-10, lab | R31 p.1371 (three challenges; distributional shift; unseen data; explainability) | OK | |
| w13-resilience-ai | R31 p.1370 ("only as good as the data") | OK | |
| w13-advanced | R88 p.33 (Commit change; deletion = null payload; versionedData cumulative) | OK | |
| w13-advanced | R88 p.34 (versionedData algorithm; merge invariant) | OK | "Stricter than a three-way merge" is correct |
| w13-advanced | R88 p.34–36 (immutable commits; branch mutable; tag immutable, used for baselines) | OK in the lesson; OVERCLAIM in key (d) | Tag is destructible (F07) |
| misconception | R88 p.33–34 | OVERCLAIM (interpretive) | F15 |
| references | R32 p.1374–1375 | OK (pointer only) | |

## Checker probes re-run (release 2026-08, 2026-10-11; 18 probes + 5 listings, one JVM)

| Probe | Construct | Lesson / notes claim | Re-run | Agrees? |
|---|---|---|---|---|
| listing | worked example (a) | PASS, no message | PASS, no message | Yes |
| listing | seeded fragment | PASS, 2 warnings (duplicate) | PASS; WARNING 31:16, 37:16 "Duplicate of other owned member name" | Yes |
| listing | risk/causation | PASS, no message | PASS, no message | Yes |
| listing | invalid_dangling | FAIL 23:10 | FAIL 23:10 "Couldn't resolve reference to Feature ''REQ-SYS-001''" + "Must reference a constraint/requirement" | Yes |
| listing | invalid_risk_level | FAIL 15:18 | FAIL 15:18 "Couldn't resolve reference to Element 'LevelEnum::M'" + warning | Yes |
| p01 (a03) | `terminalTime = 6 [kW]` | silent | PASS, no message | Yes (wrong dimensions silent) |
| p02 (a02) | power·time + power | silent | PASS, no message | Yes |
| p03 (a12) | calc called with one argument missing | silent | PASS, no message | Yes (missing calc argument silent) |
| p04 (a11) | MOP-005 = 0.18, satisfy REQ-SYS-003 (≥ 0.20) | silent | PASS, no message | Yes (satisfy with violating value silent) |
| p05 (a07) | `130 [kWh]` | FAIL + 2 warnings | FAIL "Couldn't resolve reference to Element 'kWh'" + 2 warnings | Yes |
| p06 (a08) | result declared EnergyValue for a Real | warn-pass | PASS, 2× "Bound features should have conforming types" | Yes |
| p07 (a05) | objective reversed | silent | PASS, no message | Yes |
| p08 (a06) | misspelt result in objective | FAIL | FAIL "…'landingFracton'" + warning | Yes |
| p09 (c04-like) | unitless 6 for a DurationValue | warn-pass | PASS, 1 warning | Yes |
| p10 (a04) | capacity retained 8.5 (violates assume) | silent | PASS, no message | Yes |
| p11 (r03) | RiskLevel probability 1.5 | silent | PASS, no message | Yes |
| p12 (r05) | reversed causation | silent | PASS, no message | Yes |
| p13 | q13-7 c `totalRisk = RiskLevelEnum::L` | (implied FAIL) | FAIL unresolved + warning | Yes |
| p14 | q13-7 d `technicalRisk = LevelEnum::medium` | (no checker claim) | PASS, 1 warning | n/a |
| p15 | q13-7 b `probability = 2, impact = 4` | "pass silently" | **PASS with 2 WARNINGs** | **No (F08)** |
| p16 (c06) | duplicate short name in a different package | silent | PASS, no message | Yes |
| p17 | q13-6 SpeedValue = 140 [kW] fed to a calc, satisfy | silent | PASS, no message | Yes |
| p18 | q13-5 a `ratedPower = 350` (no unit) | warn-pass | PASS, conforming-types warning (+ the 2 duplicate warnings already in the file) | Yes |

The lesson's checker-vs-reviewer table and the keys of q13-4, -5 and -6 match the re-run. The one disagreement is in q13-7 b (F08).

## Number reproduction (independent)

| Quantity | Lesson | Reproduced | Verdict |
|---|---|---|---|
| Trip energy | 85 kWh | 400·6/60 + 270·10/60 = 40 + 45 = 85 | OK |
| Usable at EOL | 110.4 kWh | 120 × 0.92 | OK |
| TPM-003 estimate | 23.0 % | 25.4 / 110.4 = 0.23007 | OK |
| Margins | 3.0; worst case 1.5 | 23.0 − 20; 21.5 − 20 | OK |
| Capacity at which the reserve is lost | 88.5 % (106.25 kWh) | 85 / 0.8 / 120 = 0.88542 | OK; worst case 90.2 % (85 / 0.785 / 120 = 0.90234) OK |
| Naive reach of REQ-SYS-001 | 9 / 28 / 63 of 203 | Own BFS on active links: 9 / 28 / 63; 204 active | OK ("nearly a third" = 31 %) |
| Directed hop 1 | 8 + 1 upstream | FN-006, IF-005, MOP-002, PHY-003, R-008, TECH-001, TPM-001, VER-001; upstream REQ-STK-005 (from the 9 links listed) | OK |
| Hop 2 from PHY-003 | 6 | FN-007, LOG-002 (allocated-to), REQ-SYS-010 (satisfies), INFO-003 (flows-to), R-001, R-005 (affects); R-008 and TECH-001 already in hop 1 | OK |
| TPM-001 at 18 min | 2 → 0; WCE −0.6, breach R1 | 18 − 18; 18 − 18.6 | OK |
| Supplier condition | ≤ 17.4 min; ≤ 16.4 min for the floor | 18 − 0.6; 18 − 0.6 − 1 | OK (R2 is "<", so a margin of exactly 1.0 is on track) |
| Battery −15 % | TPM-003 9.4 %, −10.6 / −12.1 | 102 × 0.92 = 93.84; 8.84 / 93.84 = 0.0942 | OK. The same 9.4 % results if "range −15 %" is read as consumption ÷ 0.85, so the reading is robust |
| Cruise +10 % | 18.9 % | trip 89.5; 20.9 / 110.4 | OK |
| q13-12 | 19.5 %; −0.5 / −2.0 | 105.6; 20.6 / 105.6 = 0.1951 | OK |
| q13-1 / q13-2 / q13-3 sets, 18 / 47 reach | as keyed | Explorer and own BFS | OK |
| Seeded fragment | 9 findings from 5 checks | Same | OK |
| Baseline TPM statuses | all on track | Week 5 tracker: TPM-002 AT RISK (R3) | **Conflict (F01)** |

**Is the directed method defensible, and stated as a convention?** Yes, it is labelled in four places: `w13-impact` ("a convention, not taken from a reading"), `impact.ts`, the export's method line and `cautions`. The per-link rules are reasonable and the must-change rule for second order is sound engineering. One entry is a weak spot: TPM `derives-from` MOP (F11).

## Activity logic (code read, tests run, mutation view)

- **Impact explorer.** Derive stays disabled until a whole-number prediction is entered. Editing the prediction resets the result. Must-change entries outside hop 1 are ignored (tested). Retired elements are ignored (tested). The direction mutation test can fail. The DEC recorder meets rule 1: `ProvenanceOwnerFields`, `ownerProblem`, `AI-suggested-reviewed` tested, and nothing is saved in practice mode. Weaknesses: the lesson gives away the prediction (F05) and the recommendation screen is weak (F13).
- **Margin what-if.** R1 and R2 match Week 5. R3 is omitted although the history exists (F01). The R-002 trigger boundary test (1.0 does not fire, 0.9 fires) can fail. Decimal entry is broken (F02). The re-run column contradicts the lesson (F12).
- **Consistency review.** Results stay hidden until a count is entered, and editing hides them again (tested). It rejects realistic bad input (rule 5 tests: kWh on a power, 20 vs 18 criterion, a 19 min design value, unitless, dangling, stale margin, 25 % vs 0.20 threshold). Reference rows and the repaired fragment pass (rule 4). Equivalent units are not flagged (1200 s vs 20 min, 0.20 vs 20 %, dB(A), 0.3 h vs 18 min, 0 s vs 0 min). Weaknesses: false dangling reference on student rows (F03) and silent gaps (F14).
- **Commits.** The versionedData steps, the four p.34 invariants and the p.36 table are implemented and tested. Draft C4 → violations for REQ-SYS-001 and TPM-003 is correct under the spec's record-based rule (the code compares payloads, a harmless simplification). Students cannot see the history (F04).

## Verified correct (no action needed)

- Every worked number in the lesson, the answer key and q13-12 (table above).
- Analysis-case semantics: objective = requirement on the result with assume/require; return result; usage binds the subject and parameters; the satisfy is an assertion that the checker does not test. Listing line references (30–41, 42–64, 63, 69, 71–80, 73, 81, 82) all match.
- Risk metadata: library Level and RiskLevel, the 5 × 5 ÷ 5 mapping labelled as the course's (it matches the reference v0.4 `CourseRisk` doc line 1052), the LevelEnum::M slide slip taught as an invalid listing, and CausationMetadata flags in q13-8.
- The `R-002` causation chain: the sufficient-not-necessary justification (headwind) is sound.
- Back-references R83 p.168 (Week 8) and R49 p.150 (Week 12) are honestly labelled and listed in `references`.
- Source cautions (SEBoK p.1207 "functional … also called homogeneous" contradiction; S10 sl.109 "mass"; sl.147 L/M/H) were checked against the extracted text and are correct.
- Quiz key letters are balanced (3/3/3/3). Bloom mix: Understand 2, Apply 4, Analyse 3, Evaluate 3. No item depends on R88.
- Rule 2: the graduate task is always read, and `rubricScope` names RB-9.5 and RB-16.1.
- Rule 8: new IDs (REQ-SYS-011/012/013, DEC-003) do not collide.
- RB-9.5 is 25 points; CP5 is 14 %; RB-14 T1–T6 is consistent with the session plan.
- Accessibility: labelled controls, statuses in words and symbols (never colour alone), `role="status"` on results, `tabIndex` on scrollable `pre`.
- Lesson length (4,162 words) is within rule 3's 4,000–5,000.
