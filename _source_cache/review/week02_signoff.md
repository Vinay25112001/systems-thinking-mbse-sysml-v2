# Week 2 sign-off pass: Enterprises, SoS, life cycles and stakeholders

Reviewer: Independent AI reviewer (Claude), sign-off pass. Date: 2026-10-11.

**Inputs**
- First review: `_source_cache/review/week02_review.md` (W2-F01..F28).
- Authors' dispositions: `learning-studio/docs/authoring/week02_notes.md`. These were verified against the code and content, not taken on trust.
- Shared changes since the first review: `docs/authoring/reference_model_notes.md` (change log of 2026-10-11) and `DECISION_LOG.md` W7 and W8. The reference is checked as it stands at HEAD `1067a4e`.

**Material re-read**
- `src/content/weeks/week02.ts`, in full
- `src/activities/week02/*`: `conflicts.ts`, `register.ts`, `sos.ts`, `lifecycle.ts`, the recorder, the classifier, `logic.test.ts`
- `src/model/reference/week02.ts`
- `src/model/airtaxi.ts` (influences and REL-001..008)
- `AUTHORING_GUIDE.md` §7

No course or app file was left modified. One mutation was applied and then reverted with `git checkout`; afterwards `git diff --stat` was empty for that file. Other authors were editing Week 5 and Week 8 files during this pass. None of those files was touched.

## Verdict: **NOT SIGNED OFF** (1 blocker; a one-sentence fix)

All 28 original findings are resolved.

One new major defect blocks sign-off: **W2-S01**. The answer key misdescribes the charger convention A-007 as the reference now states it. It contradicts the reference, Week 4 and Week 5. Once that sentence is corrected (and ideally pinned by a test), Week 2 can be signed off without another full pass.

## Tool runs (from `learning-studio/`)

| Command | Result |
|---|---|
| `npx tsc -b` | exit 0 |
| `npx vitest run src/activities/week02 src/activities/week03 src/activities/week04 src/content src/model` | **13 files, 275 tests passed** (exit 0) |
| Heuristic probes (scratch script outside the repo; logic copied verbatim from `register.ts`) | See W2-S02 |
| Mutation: delete the `STK-007`/`V2` key cell in `conflicts.ts` | **4 tests fail.** These include the content-agreement test ("expected … to contain '25 conflicts'"). Reverted; `git diff --stat` empty. |

## Disposition of the original findings

| ID | Sev. | Status | Evidence |
|---|---|---|---|
| F01 ENT-001 boundary | major | **RESOLVED** | Boundary A is no longer labelled ENT-001. A separate ENT-001 case (Week 1 boundary, OI partly / MI partly, borderline) appears in the worked example, the table and the classifier (`SOS_CASES` ids are test-asserted). |
| F02 two-sided OI | major | **RESOLVED** | The method requires OI "in both directions". Boundary B states both FICTIONAL premises (other vertiport users; base pad), and without the base pad the rating falls to "partly". The multimodal case uses map apps, and journey-planner-only apps are noted to give OI partly. |
| F03 AROU ID collisions | major | **RESOLVED** | Answer key and worked example use the reference A-001, A-002, A-007, R-001, O-001 and U-001. The siting risk is R-009, which is free: the reference has R-001..R-008. (The A-007 *description* is wrong; see W2-S01.) |
| F04 reference coverage | major | **RESOLVED** | The reference now has CON-015 (STK-011) and CON-016 (STK-013), and CON-012 belongs to STK-004 only. `logic.test.ts` asserts `missingConcern` is empty, that no CON is shared, and a mutation (dropping CON-015 brings STK-011 back). answerKey[3] and caution 6 describe this truthfully. |
| F05 generic-concern regex | major | **RESOLVED** | A content-word check now covers statements of five or more words. It is tested on four inputs of five or more words, asserting the *generic* message rather than the length message. All 16 reference CONs pass. The risk check requires a condition clause. The R-001 reference text passes. Residual gaps are listed as W2-S02. |
| F06 memo never read | major | **RESOLVED** | `weight` and `rubricScope` say the memo is always read (RB-16 note, W7) and scored on RB-1.1 with Maier descriptors (answerKey[5]). The instructions say "two **real** transport enterprises". The FICTIONAL cases are excluded, and the key contains no facts about real enterprises. |
| F07 memo 0.6 h | major | **RESOLVED (with caution)** | Memo scope reduced and set at 1.2 h. The workload items sum to 8.5 h. The text says "four interactive activities". Caution 7 calls the estimate tight and gives the FD-22 rule. AUTHORING_GUIDE §7 rule 3 is met. |
| F08 recorder AI tag | major | **RESOLVED** | `ConcernArouRecorder.tsx` renders `ProvenanceOwnerFields` and passes owner and provenance to `apply()`. The table shows "Owner · provenance", and `checkEntry` enforces `ownerProblem`. |
| F09 tsc | minor | **RESOLVED** | `tsc -b` exit 0 |
| F10 partly → not-SoS | minor | **RESOLVED** | `verdictFollows` accepts not-sos from borderline. `needsArgument` prompts for the argument. |
| F11 colour-only feedback | minor | **RESOLVED** | Every feedback line in `SosClassifier.tsx` has ✓/✗ text. |
| F12 quiz repeats activity | minor | **RESOLVED** | q2-12 (DevSecOps gate) and q2-13 (event→schedule trigger) are new cases, not g3 or r2. |
| F13 Bloom / q2-9 / B2.3 | minor | **RESOLVED** | q2-9 requires pair totals; I recomputed 30 / 25 / 24. B2.3 now has 4 items (q2-9, 10, 15, 16). Bloom counts: Analyse 5, Apply 7, Understand 4. |
| F14 "often" / MITRE context | minor | **RESOLVED** | "may"; the sponsor's-own-organisation context is stated; the course extension is labelled (lesson ¶4, q2-10, q2-15). |
| F15 misconception overclaim | minor | **RESOLVED** | Reworded: "not the only group that can stop the operation". |
| F16 title attribution | minor | **RESOLVED** | Retitled. Dahmann, Lane and Rebovich are cited (R08 p.833, verified). R09 cites Maier, Dahmann & Baldwin and ISO 21839 (p.868, verified). |
| F17 criteria vs characteristics | minor | **RESOLVED** | Lesson, facilitation and cautions quote R08 p.833 "criteria of operational and managerial independence" (verified). |
| F18 wrong page | minor | **RESOLVED** | Session 1 cites R06b p.384 for stages and R06a p.380/381 for concurrency. |
| F19 merged sentences | minor | **RESOLVED** | Two separate observations. |
| F20 q2-4d overclaim | minor | **RESOLVED** | Cites R07 p.816 "solely by information systems" (verified) and is softened. |
| F21 ANSP missing | minor | **RESOLVED** | STK-007 added on V2↓, the exclusions listed in code and lesson, and the scope test asserts 9 + 5 = 14. |
| F22 "salience" | minor | **RESOLVED** | "Conflict weight". The Mitchell–Agle–Wood distinction is stated (R63 p.238 reference list, verified). |
| F23 V3 / V2 labels | minor | **RESOLVED** | V3 = chargers per vertiport. V2 is labelled "new FICTIONAL value; not on the Data Sheet". |
| F24 recorder links | minor | **RESOLVED** | `apply()` is atomic, `r.error` is surfaced, CON targets are allowed, and `l2Coverage` counts only STK/CON targets (retarget mutation test). |
| F25 RB-1.2/1.4 top bands | minor | **RESOLVED** | Causal-argument lab step; the six S04 classes are listed in Classify. answerKey[4] gives a worked loop with polarity count. |
| F26 REL outside §C.2 | minor | **RESOLVED** | The artefact row states that the IDs are editor-local; lead request 3 is recorded. |
| F27 g3 key | minor | **RESOLVED** | `alsoAccept` "begin", with the reason (R06a p.381 / R06b p.385). |
| F28 prompts without inputs | minor | **RESOLVED** | Per-item `textarea` in Parts B and C. Part C shows risks only after checking. |

## New findings

| ID | Sev. | Location | Finding | Fix |
|---|---|---|---|---|
| **W2-S01** | **major (blocker)** | `week02.ts` answerKey[3] (line 558), A-007 clause | **The answer key misdescribes the current reference A-007.** It says: "the 25 min hub turnaround is 20 min on the charger plus 5 min of **passenger handling and positioning** off it". The reference A-007 (`reference/week02.ts` l.62–64, aligned 2026-10-11 under DECISION_LOG W8) says something different. The 5 min is "rotor stop, safety check and charger connection and disconnection", and "deplaning and boarding overlap the charge". Positioning is a separate 2 min outside the 25 min turnaround (reference cycle 16 + 25 + 2). The key therefore contradicts the reference, the REQ-STK-005 rationale, the Week 4 worked example (a) ("deplaning and boarding overlap the charge") and Week 5 q5-5 (which keys "overlap the steps"). Removing this exact inconsistency across weeks was the purpose of the W8 revision. An instructor reading the key would teach the opposite of Weeks 4 and 5. | Replace the parenthesis with the reference wording, for example: "(course-wide convention: the 25 min hub turnaround is 5 min of rotor stop, safety check and charger connection plus 20 min of charging, with deplaning and boarding overlapping the charge; with two pads per turnaround charger the charger is busy 20 min per turnaround, so 48 charges per charger per 16 h day; FICTIONAL)". Optionally add a test asserting that the key mentions "overlap" and does not contain "passenger handling", so the next reference change cannot leave it behind silently. |
| W2-S02 | minor | `register.ts` `isGenericConcern`, `riskFormIssues` (AUTHORING_GUIDE §7 rule 5) | **Residual gaps in the screens.** The generic-concern screen works on the four tested phrases, but one ordinary noun or evaluative word defeats it. Probes accepted: "Residents worry about aircraft noise."; "Passengers want safe, reliable and affordable trips."; "The FAA cares about the safety of operations."; "Communities are concerned about noise and privacy."; and **"Safety is the most important concern for everyone."**, which names nothing beyond a general quality and so falls inside the UI's own claim ("rejects concerns that name nothing beyond a general quality"). The risk-form check accepts "Since risk exists if anything then happens." The UI and caution both call these screens, and "aircraft noise" is acknowledged in the notes, so this is minor. | Add evaluative and quantifier filler (important, most, main, key, everyone, everything, overall) to `FILLER`. Consider treating domain nouns (trips, flights, operations, aircraft) as filler when every other content word is generic. Add "Safety is the most important concern for everyone." as a regression probe. |
| W2-S03 | minor | `docs/authoring/week02_notes.md` | **The notes are stale after the reference batch.** Open issue 1 still proposes the CON-015/CON-016 text and says the logic test "asserts the current state" and "will fail when the fix lands". The F04 disposition says "Reference not editable here: key states the gap". Both have been overtaken: the reference and the test now assert the fixed state. | Mark open issue 1 and F04 as closed by the reference batch of 2026-10-11. |
| W2-S04 | nit | workload memo line | 0.4 h to find and cite public evidence for two real enterprises (about 12 min each) is very tight. The caution reports it honestly, with the FD-22 rule (> 1.5 h → one real enterprise or report the overrun). | No change required; faculty decision. |

## What I verified independently

- **Conflict matrix, recomputed by hand** from `KEY_CELLS` and the reference influences (001=3, 003=5, 004=4, 005=4, 006=3, 007=5, 008=3, 010=4, 013=5):
  - Conflicts per variable: V1 = 6, V2 = 12, V3 = 2, V4 = 2, V5 = 6, so **28** in total.
  - Two conflicts weigh **25**: V2 003↔007 and V5 003↔013.
  - **Six** conflicts weigh 20: 003↔004 on V1, V2, V4 and V5; 005↔007 on V2; 005↔013 on V5.
  - Pair totals: 003↔004 = **80**; 004↔005 = **48**; 001↔004 = **36** (V4 is not a conflict, because both want it lower); 003↔008 = **30**. The next pair is 003↔007 / 003↔013 at 25, then 005↔008 at 24.
  - Sensitivity with Communities at 3: **60 vs 36**. With Communities at 2: **40 vs 30** (004↔005 falls to 24).
  - Every number in the lesson, the table, answerKey[2], q2-9 (30 / 25 / 24), q2-10 (15 vs 8) and q2-16 (40, 24, 30) is correct.
- **Answer key against the current reference**:
  - 14 STK in 8 categories (test-asserted); REL-001..008 with REL-002 conflicts-with; REL-007 is STK-013 → STK-004 "Public consultation on siting".
  - CON-001..016 with one stakeholder each.
  - AROU v0 = A-001, A-002, A-007, R-001, O-001, U-001, all linked by `affects` to CONs. This is the test-asserted count of 6 linked.
  - The only untruthful statement found is W2-S01.
- **Citations (new or changed), each read on the page**: R08 p.832 ("must be able to usefully operate independently"); R08 p.833 ("Four kinds of SoS … Dahmann, Lane, and Rebovich 2008"; "criteria of operational and managerial independence"); R09 p.867 ("not necessarily a permanent phenomenon"); R09 p.868 (four types citing Maier, Dahmann & Baldwin, ISO 21839); R09 p.869 ("combination of SoS types which may change over time"); R07 p.815 ("frequent misuse"); R07 p.816 ("solely by information systems"); R06b p.384 ("increment … independent"; "interim maturity reviews"); R06a p.382 (work never "done"); R06c p.387 (independence, specialty engineering); R06c p.388 ("too close" / "too far"); R63 p.238 (Mitchell, Agle & Wood 1997; "perceived resistance"). All land, and none is overstated.
- **Quiz**: 16 items, each with one correct option and an explanation for every option. Objective spread is B2.1 ×5, B2.2 ×3, B2.3 ×4, B2.4 ×4.
- **AUTHORING_GUIDE §7**:
  - Rule 1: recorder owner and provenance present.
  - Rule 2: graduate task is always read.
  - Rule 3: the workload caution is present.
  - Rule 4: reference CONs and R-001 pass the recorder checks (test).
  - Rule 5: tests use concerns of five or more words, but residual gaps remain (W2-S02).
  - Rule 6: rewritten quiz cases.
  - Rule 7: criteria vs characteristics kept apart.
  - Rule 8: IDs.
