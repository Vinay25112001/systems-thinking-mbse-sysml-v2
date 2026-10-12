# Week 2 authoring notes

Module: `src/content/weeks/week02.ts` · activities: `src/activities/week02.activity.tsx` + `src/activities/week02/` · status: `self-checked`. Revised 2026-10-11 against the independent review `_source_cache/review/week02_review.md` (W2-F01..F28); the disposition of each finding is at the end.

## Pages actually read (via `python -I scripts/source_pages.py <ID>`, full verified range)

| Reading | Pages read | Used for |
|---|---|---|
| R07 Enterprise Systems Engineering | 814–818 | Enterprise definitions, enterprise vs organisation (quote p.815), extended enterprise, "rather than merely as a collection of functions connected solely by information systems" (p.816), ESE, practical considerations / POET (p.818) |
| R08 The Enterprise as a System (extension) | 829–834 | Maier's two-property SoS definition (p.832–833, "the component systems must be able to usefully operate independently"), "not the appropriate taxonomic classifiers" and "Four kinds of SoS have been defined (Dahmann, Lane, and Rebovich 2008)" (p.833), FoS (p.833), "the criteria of operational and managerial independence" and enterprise ≠ SoS (p.833), enterprise vs SoS control (p.834) |
| R09 Systems of Systems | 866–872 | Five characteristics "not criteria" (p.866), ISO 21839 definition (p.866), SoS formation not necessarily permanent (p.867), SE process table and pain points (p.867–868), four SoS types citing Maier 1998, Dahmann & Baldwin 2008, ISO 21839; taxonomy presented in ISO 21841; discovered SoS; ATM as persistent SoS (p.868–869), application domains (p.870–871), ISO 21839/21840/21841 (p.872) |
| R06a Life Cycle Models | 380–382 | Definitions, iteration and concurrency (p.380), mid-life upgrade "were restarted" (p.381), DevSecOps loop, work never "done" (p.382) |
| R06b Life Cycle Stages | 384–385 | Six stages and goals; gates evaluated against criteria for a stage or an independent increment; backwards/forwards; interim maturity reviews; tailoring; technical debt (p.384); five decision options, joint reviews (p.385) |
| R06c Technical Reviews and Audits | 386–388 | Definitions and purposes (p.386), preparation, Boehm & Lane review types (p.387), reviewer selection, timing, representative guidance (p.388) |
| R63 MITRE Stakeholder Assessment and Management | 234–238 | Definition and SE role (p.234), key groups, snowball identification incl. skeptics/rivals (p.235), Likert and variance, stakeholder maps (p.236), current vs required support, "high influencers must be committed advocates", highlight differences (p.237), perceived-resistance note about a sponsor's own organisation; reference list incl. Mitchell, Agle & Wood 1997 (p.238) |

Every citation in the module lies inside these ranges (enforced by `weeks.test.ts`).

## Design decisions

- **Boundary first, three AeroLink boundaries.** Boundary A (AeroLink's own operation) is deliberately narrower than Week 1's ENT-001 and is no longer labelled ENT-001. ENT-001 as Week 1 defines it (fleet, vertiports and chargers, operations centre, demand) is classified separately: OI partly, MI partly → borderline, best argued as "not an SoS — an enterprise with one independent partner" (both verdicts accepted). Boundary B is the regional service.
- **Operational independence is two-sided** (R08 p.832: "the component systems must be able to usefully operate independently"). Boundary B is keyed "yes" only because the case states two FICTIONAL premises: the vertiports host other operators, and AeroLink has its own operating approval and a base pad from which it flies charter and medical-cargo work. Without the base-pad premise the key says OI partly → borderline. The multimodal case uses general-purpose map apps (useful without operator data) instead of timetable-only journey planners, and says that the latter would make OI partly.
- **"Criteria" vs "characteristics".** R08 p.833 calls the two independences "the criteria"; R09 p.866 calls the five-item list "characteristics (not criteria)". These are consistent with B2.1's "stated criteria"; the earlier request to reword the objective is withdrawn.
- **SoS types** are attributed as the sources do: R08 p.833 credits the four kinds to Dahmann, Lane and Rebovich (2008); R09 p.868 cites Maier 1998, Dahmann & Baldwin 2008 and ISO 21839. The governance decision rule (three questions) is instructor-authored and labelled.
- **Classifier verdict logic.** `verdictFollows`: a "partly" principal rating implies borderline, and both "borderline" and "not an SoS" follow from it (R09 p.866); "not an SoS" is flagged as needing an explicit argument. Feedback lines carry ✓/✗ text, not colour alone.
- **Conflict matrix.** Nine of the fourteen reference stakeholders (STK-007 ANSP added on V2 ↓, from its rationale "capacity limits schedule density"); excluded stakeholders are listed with reasons in the UI and the lesson, and conclusions are stated as conditional on the selection. The ranking measure is called **conflict weight** (influence × influence), explicitly not Mitchell–Agle–Wood salience. V3 is "chargers per vertiport" (Data Sheet count); V2's 6 departures per pad-hour is labelled a new FICTIONAL value. Test-asserted key: 28 conflicts (V1 6, V2 12, V3 2, V4 2, V5 6); two tie at 25 (V2 STK-003/STK-007; V5 STK-003/STK-013); six at 20; pairs 80 / 48 / 36 / 30; sensitivity (Communities 3) 60 vs 36; (Communities 2) 40 vs 30. A test ties the numbers quoted in the lesson and answer key to the computed ones.
- **Recorder.** Uses the shared `ProvenanceOwnerFields` (owner initials validated by `ownerProblem`; provenance incl. `AI-suggested-reviewed`) and `Workspace.apply()`, so element and link are created atomically and any error is shown. AROU entries may affect an STK or a CON. Coverage counts an AROU entry as linked only through `affects` to an STK or CON.
- **Generic-concern check (heuristic, instructor-authored).** After removing filler words (articles, the "X wants/is concerned about" frame, generic subjects), a concern is generic if every remaining word is a generic quality (safety, cost, noise, quality, reliability …) and it contains no number. Rejects "The community is concerned about noise.", "Passengers want the service to be safe.", "Stakeholders want safety and reliability always", "They want low cost and good quality"; accepts all fourteen reference concerns. The UI says it is a screen, not a judgement of specificity.
- **Risk form check.** Requires a condition clause (Given / Condition: / Because / Since / As / While / With / Under + ≥ 2 words) before "if", and "if … then". Separate messages for each failure. The reference R-001 passes.
- **Life-cycle explorer.** g3 accepts "restart" (preferred, R06a p.381) and "begin" (R06b p.385). Parts B and C have per-item free-text prompts (saved in the browser; students copy them into the notebook). Part C no longer prints the risks before the student answers; they appear after checking. Part B's intro no longer states the backwards/forwards rule (it would answer q2-11).
- **Graduate memo.** Restored to "two **real** transport enterprises" (course.ts graduateTask). Students find and cite public evidence; the FICTIONAL comparison cases may not be used. The answer key contains no facts about real enterprises. The memo is a required notebook entry, always read (RB-16 graduate-task note, DECISION_LOG W7) and scored formatively on RB-1.1 (B-CLO1) with Maier level descriptors in the answer key.
- **Workload (8.5 h).** Memo scope reduced to one page plus an evidence table (full five-characteristic analysis for AeroLink only); R08 reading limited to p.832–834 because p.829–831 duplicate R07. Memo 1.2 h, online instruction + life-cycle activity 0.4 h, notebook time log 0.1 h (the memo is the entry). The estimate is tight; the cautions say so and ask FD-22 logs to test it.
- **Quiz.** 16 items: B2.1 ×5, B2.2 ×3, B2.3 ×4, B2.4 ×4; Bloom Analyse 5, Apply 7, Understand 4. Items that repeated activity items (old q2-12/q2-13) or restated lesson sentences (q2-3, q2-4, q2-5, q2-11, q2-14) were rewritten as new cases. q2-9 now requires computing pair totals from a small matrix.
- **REL IDs** are editor-local; the lab artefact row says so.
- No SysML listings this week, so no `sysml/week02/` run.

## Open issues / requests to the lead

1. **Reference baseline concerns (W2-F04).** `src/model/reference/week02.ts` has no CON for STK-011 and gives STK-013 only the shared residents'-noise CON-012. Proposed text (new, non-colliding IDs):
   - change `CON-012` stakeholder list from `['STK-004', 'STK-013']` to `['STK-004']`;
   - add `['CON-015', 'Fleet delivery and certification progress', 'The aircraft manufacturer is concerned that AeroLink’s orders, operating data and certification milestones arrive as planned, because delivery slots and certification progress set its own production plan.', ['STK-011']]`;
   - add `['CON-016', 'Land use and zoning of vertiport sites', 'The City planning authority is concerned that vertiport sites conform to zoning and land-use plans and connect to public transport, especially sites in residential districts.', ['STK-013']]`;
   - add a reference test: `expect(l2Coverage(referenceUpTo(2)).missingConcern).toEqual([])`.
   The Week 2 answer key states the current gap; `src/activities/week02/logic.test.ts` ("the reference baseline (Week 2) is reported truthfully") asserts it and will fail when the fix lands, so answerKey[3] and the caution can be updated at the same time.
2. **Stakeholder editor AI tag.** The editor's stakeholder provenance (`official-S04 | teaching-content | fictional | student`) has no `AI-suggested-reviewed`. Until it does, Week 2 tells students to start the rationale with "AI-suggested-reviewed:". Request: add the tag (and owner initials) to the editor.
3. **§C.2 ID scheme.** `REL` and the editor's relationship vocabulary (conflicts-with, regulates, funds, …) are not in lab plan §C.2. Request: add them or confirm they stay editor-local.
4. **Register request — Vee pages.** `WEEKLY_INSTRUCTIONAL_PLAN.md` Week 2 quotes S11 p.395–396, outside every register reading; not cited. Request: register S11 p.395–396 if the Vee segment should be cited.
5. **Shared component (optional):** label the editor's influence–interest quadrant as an external (Mendelow-style) convention.
6. **Workload pilot.** Memo estimate 1.2 h is tight for two real enterprises; check FD-22 logs.

## Disposition of review findings (2026-10-11)

| ID | Disposition |
|---|---|
| F01 | Fixed: boundary A no longer labelled ENT-001; ENT-001 classified as Week 1 defines it (borderline); new classifier case. |
| F02 | Fixed: two-sided OI argued for every constituent; FICTIONAL premises stated; without them the key gives "partly". |
| F03 | Fixed: key uses reference A-001, A-002, R-001, O-001, U-001; siting risk is R-009 (proposed). |
| F04 | Reference not editable here: key states the gap truthfully; proposed reference text above; test asserts current state. |
| F05 | Fixed: content-word generic check and condition-clause risk check; tests use ≥ 5-word inputs and assert the specific message; mutation runs recorded. |
| F06 | Fixed: memo always read, scored on RB-1.1 (B-CLO1) via RB-16 graduate-task rule; "two real" restored; key invents no real facts. |
| F07 | Fixed within 8.5 h by reducing memo scope; caution states the estimate is tight; "three" → four activities. |
| F08 | Fixed: shared ProvenanceOwnerFields in the recorder; tag shown in the table. |
| F09 | Outside Week 2; `tsc -b` re-run: exit 0. |
| F10 | Fixed: `verdictFollows`; "not an SoS" from "partly" accepted with an argument prompt. |
| F11 | Fixed: ✓/✗ text on every feedback line. |
| F12 | Fixed: q2-12, q2-13 replaced; activity no longer reveals q2-3/q2-11 answers. |
| F13 | Fixed: Bloom re-tagged; q2-9 requires computation; two new B2.3 items. |
| F14 | Fixed: "may"; MITRE's context (own organisation) stated; extension labelled the course's. |
| F15 | Fixed: misconception reworded. |
| F16 | Fixed: retitled; attribution to Dahmann, Lane & Rebovich (R08 p.833) and R09's citations. |
| F17 | Fixed: B2.1 wording kept; cautions, facilitation and notes reworded; request withdrawn. |
| F18 | Fixed: R06b p.384 for stages; R06a p.380–381 for concurrency. |
| F19 | Fixed: two separate statements. |
| F20 | Fixed: q2-4 explanation cites p.816 and is softened. |
| F21 | Fixed: STK-007 added; scope and exclusions stated; all numbers and tests recomputed. |
| F22 | Fixed: renamed "conflict weight"; Mitchell–Agle–Wood distinction stated. |
| F23 | Fixed: V3 is chargers per vertiport; V2 labelled a new FICTIONAL value. |
| F24 | Fixed: `apply()`; CON targets; coverage counts only STK/CON targets; errors shown. |
| F25 | Fixed: Causal-argument lab step; six S04 classes listed in Classify. |
| F26 | Fixed in the lab artefact text (editor-local IDs); lead request 3. |
| F27 | Fixed: "begin" also accepted for g3, with the reason. |
| F28 | Fixed: written prompts per item in Parts B and C; risks shown only after checking. |

## Not verified / limits

- Influence ratings, variables, case premises and all AeroLink numbers are FICTIONAL calibration values.
- The generic-concern check is a heuristic: "The community is concerned about aircraft noise." passes it; the reviewer still judges specificity.
