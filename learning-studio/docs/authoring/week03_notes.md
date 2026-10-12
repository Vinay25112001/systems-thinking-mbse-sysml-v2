# Week 3 authoring notes

Module: `src/content/weeks/week03.ts` · activities: `src/activities/week03.activity.tsx` + `src/activities/week03/` · status: `self-checked` (independent review still required).

## Pages actually read (via `python -I scripts/source_pages.py <ID>`, full verified range)

| Reading | Pages read | Used for |
|---|---|---|
| R10 SEBoK Business or Mission Analysis | 543–547 | Purpose; why/what/how well/environment; iteration with needs definition (p.543); MGO definitions (p.543); measures as MOE, outputs list (p.544); four steps of the problem statement, elicitation questions, as-is/to-be (p.545); business vs user MGO sets and their conflicts, preliminary life-cycle concepts incl. scenarios, misuse and loss scenarios (p.546); uncertainties, solution classes incl. operational change (p.547) |
| R11 SEBoK Stakeholder Needs Definition | 549–556 | Needs vs requirements perspectives, integrated set (p.549–550); correct/consistent/complete/feasible, nomenclature (p.551); activities, stakeholder classes (p.552); approving authorities, elicitation techniques and topics incl. off-nominal/misuse/loss, rationale reveals the real need (p.553); drivers and constraints, risk incl. the hacked-aircraft misuse example, conditions of action (p.554); no "shall", suggested form, example need table with feature-level needs (p.555); trace to source (p.556) |
| R52 MITRE Concept of Operations | 298–303 | Definition (p.298); OMB definition, purpose, update after testing, DOTMLPF factors, conceptual view (p.299); IEEE 1362 tailoring (p.300); objectives incl. capacity basis and implicit-requirement discovery; critical components (p.301); "highly reliable" need without testable spec; solution strategies and constraints; best practices (p.302). p.303 is references only. |
| R59 MITRE Use Cases and Mission Threads | 452–458 | Definitions, mission thread = one path (p.452); actors, primary/secondary, vignettes, threads as architecture drivers and test basis, success scenarios (p.453); failure scenarios, no UI/implementation detail (p.454); review questions, stopping rule, pitfalls (p.455–456); parameterisation list (p.456); environments, simulated inputs (p.457). p.458 is references only. |
| R12 SEBoK Enterprise Capability Management (extension) | 860–863 | Three kinds of capability (p.860); operational vs enterprise needs with examples (p.861); capabilities exist to meet needs, example capabilities, baseline vs desired → gaps and excesses, near/mid/far buckets (p.862); not only defence (p.863) |
| R53 MITRE Operational Needs Assessment (extension) | 293–297 | Definition (p.293); FAA/DoD requirement, DOTLPF non-materiel option (p.294–295); JCIDS CBA → ICD → AoA → CDD (p.295); need-statement attributes incl. conditions and solution independence, "Beware solutions masquerading as needs" (quote, p.296); all relevant views, one size may not fit all (p.297) |

Every citation in the module lies inside these ranges (enforced by `weeks.test.ts`).

## What was built

- **Content** (`week03.ts`): 13 blocks (5,269 lesson words by `lessonWordCount`), worked examples (a) concern → need before/after critique, (b) capability derivation, decomposition and near/mid/far gap analysis with the arithmetic, (c) complete SCN-005 scenario; advanced block on consistency/completeness/feasibility of the integrated set; 14 quiz items (12 Apply or above: 5 Apply, 5 Analyse, 2 Evaluate, 2 Understand); lab L3; CP1 assignment (8-section template covering the syllabus §11 CP1 scope; RB-1 45 · RB-2 45 · RB-12 10); instructor notes with answer key; workload 2.5 + 1.0 + 1.7 + 0.3 + 3.5 + 0.7 + 0.3 = 10.0 h.
- **Activities** (keys `w03-…`):
  - `w03-mgo-recorder` (`MgoRecorder.tsx`, logic `mgo.ts`): mission → goal → objective hierarchy; objective needs measure, numeric target, unit, horizon, no vague wording; mission/objectives trace to CON/STK. Writes MGO + derives-from links via `apply`.
  - `w03-need-studio` (`NeedStudio.tsx`, logic `needs.ts`): Part A diagnoses six drafted "needs" (key computed by the same checks, one flawless discrimination item); Part B checks six criteria — not a requirement (R11 p.555), solution-free (R53 p.296), attributed (R11 p.555), traced to STK/CON (R11 p.553), condition stated (R53 p.296 / R11 p.554), rationale (R11 p.553) — and records NEED + derives-from links atomically.
  - `w03-capability-tree` (`CapabilityBuilder.tsx`, logic `capabilities.ts`): records CAP (derives-from NEED, refines parent CAP), renders the tree as a nested list, computes L3 checks (≥ 5, ≥ 2 decomposed, all traced, all needs covered, no cycles) and a single-constituent advisory; Part B near/mid/far gap table (R12 p.862) with a ±5 % balanced band.
  - `w03-scenario-builder` (`ScenarioBuilder.tsx`, logic `scenarios.ts`): actors (model STK/EXT + free-text roles), primary actor, trigger, preconditions, steps with actors, alternate flows (branch step, condition, rejoin/end), success and failure end states, CAP trace; ten checks; records SCN with the reference attribute shape plus derives-from CAP and performs links; L3 coverage over the workspace.
- **Tests**: `logic.test.ts` (43 tests, including mutation tests showing each need, MGO, capability and scenario check fails on its own; the reference baseline passes; the worked gap numbers; tolerance mutation) and `activities.test.tsx` (7 tests driving every component through the workspace).
- No SysML listings this week (SysML starts in Week 9); no `sysml/week03/` run.

## Design decisions

- **MGO recorder added** although not in the brief: `/workspace/model` has no form for creating elements, so without it L3 step 1 (MGO) could not be done in the app, and B3.1 would be practised only on paper.
- **Lexical screens are declared as such.** The solution-term lexicon, condition cues and UI-term list are instructor-authored operationalisations of R53 p.296, R11 p.554–555 and R59 p.454–455; the UI and the cautions say a lexical screen can miss plain-word solutions and can mis-flag. "Aircraft", "vertiport", "charging" (as a verb/noun of the domain) are not flagged; "charger(s)", "rotor(s)", "app", "radar" etc. are.
- **Needs need not be quantified** (R52 p.302); only objectives are checked for measurability. The module states this to avoid conflating B3.1 with B3.2.
- **SEBoK's own example needs are feature-level** (R11 p.555: two temperature settings, four colours). The module points this out and states that the course applies R53's stricter solution-independence standard to enterprise-level needs.
- **Primary actor of SCN-005** is the operations-centre duty manager as a role (R59 p.453 allows roles); the system of interest for scenarios is AeroLink's operational system. The worked example says passengers as primary actor would give a different valid use case.
- **Capability gap vs coverage gap** are distinguished explicitly: a need without a capability (derivation gap, course convention) vs a shortfall in capability level (R12 p.862).
- **Gap-analysis numbers** (FICTIONAL): demand 160/240/320 trips/day (240 = A-006), desired = demand ÷ 0.8 (MGO-007); fleet baseline 12 × 20 = 240; charging baseline 6 × 48 = 288 (A-002; upper bound). Year 1–3 buckets per R12's fast-changing guidance. Test-asserted.
- `performs` links are created from every model actor chosen in a scenario (STK and EXT), including EXT-003 Weather; the reference uses `affects` for EXT-003 → SCN-005. Both are allowed by `LINK_RULES`; teams may prefer `affects` for non-acting environmental systems (see request 3).

## Open issues / requests to the lead

1. **(RESOLVED in the 2026-10-11 revision — reference needs now carry explicit `conditions` and `rationale` attributes.) Reference baseline — implicit conditions.** NEED-004, NEED-006 and NEED-008 in `src/model/reference/week03.ts` state no explicit operating condition (no condition cue; asserted in `logic.test.ts`). RB-2.2 level 4 requires "conditions stated". Suggest adding e.g. "at peak hours" (NEED-004), "at any hour of operation" (NEED-006), "at every vertiport" (NEED-008). If changed, update the expectation in `logic.test.ts` (`['NEED-004','NEED-006','NEED-008']`) to `[]`.
2. **Shared API — requested IDs.** `Workspace.apply` issues IDs in sequence, so a team that records SCN-005 first gets SCN-001, breaking the official S04 Lab 7 numbering. The builder warns and stores `official` as an attribute. Option: allow `apply` to accept a requested ID for SCN when it is free and well-formed.
3. **Shared UI (optional).** `/workspace/model` has no element-creation form; this week works around it with the MGO recorder. A generic "add element" form would help later weeks (AROU v1 in this week's lab still uses the Week 2 recorder).
4. **No register requests.** Every point needed is inside R10, R11, R12, R52, R53, R59.
5. **Concurrent edits seen:** `npx tsc -b` reports one error outside Week 3 (`src/activities/week07/trade.test.ts(255,16)`: TS6133 unused `a`) — another author's file. In the full `npx vitest run`, 8 tests in other files (`components.test.tsx`, week02 and week07 activity tests) timed out at the 5 s default under full-suite load; the same Week 2 tests pass when run alone. Week 3 component tests carry a 30 s timeout for this reason.

## Not verified / limits

- All AeroLink numbers are FICTIONAL teaching values (Data Sheet, reference baseline, or labelled in place).
- R53 p.295's JCIDS description reflects the 2009 DoD documents MITRE cites; presented as an example, not current policy.
- The "before" statements in the critique and worked example (a) are instructor-authored teaching examples.

## Revision after the independent review (2026-10-11, `_source_cache/review/week03_review.md`)

Pages re-read for the revision: R10 p.543–546 (four MGO levels; p.546 example objective vs separate measure), R11 p.554–556 (models key to correctness/completeness/consistency; stakeholder confirmation via traceability), R12 p.862 (baseline = existing + planned; "sometimes mapped"), R53 p.294–296 (needs "described and quantified"; "no corroborating analysis or evidence basis" p.296), R59 p.453 (actors are parties outside the system).

### Disposition

| ID | Sev. | Disposition |
|---|---|---|
| F01 | major | Fixed. Lesson states SEBoK's four levels with the p.546 example; recording each objective with its measure/target/unit/horizon is labelled a **course convention**; horizon and concern trace no longer attributed to R10. q3-1 re-keyed to an objective + measure pair under the course rule (d explained as SEBoK-form but missing its measure); q3-2c explained as a SEBoK measure. `mgo.ts`: measure check labelled course rule; vague check split into unobservable puffery (statement, any level) and directional words in the measure field ("minimise" is SEBoK-legitimate in an objective). |
| F02 | major | Fixed except one structural item. Objectives may answer a concern through their goal (explicit rule in `checkMgo`, shown in the recorder). Reference attributes fixed: MGO-006 horizon + unit `events per quarter` (dBA moved to `limitUnit`); MGO-007 unit; MGO-008 unit + horizon. New test rebuilds every reference MGO **from the model** (`mgoDraftOf`) and runs `checkMgo`; mutation tests prove it discriminates. **MGO-008 still skips a goal** — fixing it needs a new goal element and a changed link, which break `sysmlMapping.test.ts` (360 links, every element declared in v0.4). Test asserts the single known failure; lesson and answer key teach it as a visible defect; listed in `review.openIssues`. |
| F03 | major | Fixed. Reference SCN-001..005 rewritten in the builder's attribute format (trigger, primary actor, an actor per step, each alternate rejoins or ends, `Success: … Failure/degraded: …`). New `draftFromScenario` parses any recorded scenario; test runs all five through `checkScenario` (10/10) with mutation tests. Worked example (c) **is** reference SCN-005 (attribute-for-attribute test). Coverage now also requires `trigger`. |
| F04 | major | Fixed. SoI subjects rejected as the needing party; condition needs a cue (in statement or field), bare before/after/if dropped; lexicon adds vertiport infrastructure, operating restrictions (curfew), autonomy, asset expansion. Regression tests use the reviewer's probes plus long plausible variants. L3/activity text: acceptance = screen **and** team review. |
| F05 | major | Fixed. All four recorders render `ProvenanceOwnerFields`, require `ownerProblem(...) === null`, pass `{ owner, provenance }` to `apply()`, and show owner/provenance in their tables (tree for capabilities). Component tests cover the refusal and the AI tag. |
| F06 | major | Fixed. Graduate gap analysis is individual notebook entry 3, always read (RB-16 note, W7), scored formatively on RB-2.3 with level descriptors in `rubricScope`; team CP1 grade independent of it. |
| F07 | major | Fixed with caution. CP1 integration 1.0 h, graduate task 1.2 h (reading narrowed to R12 p.862 + R53 p.294–295), L3 out-of-class 2.4 h, online 0.7 h, notebook 0.2 h; total 10.0 h. Caution says the CP1 peak is probably understated (reviewer: ≈1.5 h integration). |
| F08 | major | Fixed. CP1 template §6 asks for MITRE's four components (as-is with EXT-005, justification, proposed service, scenarios); RB-2.4 level 4 tied to them in rubricScope and marking guide. |
| F09 | minor | Fixed. Charger occupancy stated: 25 min (consistent with REQ-STK-005) → 38.4/charger/day, 230/day; 20 min reading kept as an upper-bound sensitivity row (288). Year 2 is a gap under both readings; year 3 needs 5 (25 min) or 3 (20 min) chargers. Both readings accepted in the key. |
| F10 | minor | Fixed (lesson ¶4, q3-9c, misconception 5). |
| F11 | minor | Fixed (sometimes; models/traceability aids named; "not necessarily"). Also in `capabilities.ts` header. |
| F12 | minor | Fixed: q3-4 rewritten; option b cites R53 p.296. |
| F13 | minor | Fixed: both views presented (needs block, misconception 4, q3-6d). |
| F14 | minor | Fixed: q3-4 (insurer), q3-7 (CAP-002 with planned capability), q3-8 (CAP-006 constituent), q3-14 (SCN-004 discovery) are new cases; q3-10/q3-11 have plausible near-miss distractors and are re-tagged Analyse. Bloom now: Apply 7, Analyse 5, Understand 2. |
| F15 | minor | Mitigated: caution states B3.3 items are answerable from the lesson; request to lead to move R12 p.860–862 into required readings (course.ts). |
| F16 | minor | Fixed: scenario SoI = operational system; staff are users outside it; R59 attribution limited to "actors are outside the system"; weather made an environment item. |
| F17 | minor | Fixed: reference needs carry `conditions` and `rationale`; all ten pass the six criteria (test). |
| F18 | minor | Partly: AROU v1 model answer and the discovered need added to the answer key; adding them as reference elements needs SysML regeneration (open issue). |
| F19 | minor | Fixed: table shows all three goals; horizons present. |
| F20 | minor | Fixed: stakeholder concurrence (role-played; labelled a course simplification). |
| F21 | minor | Fixed: Part A has a rewrite box per item, screened after checking; session note matches; storyboard brief changed to SCN-003/004, ≥ 2 alternates. |
| F22 | minor | Fixed: Week 10 (requirements) and Week 11 (use cases). |
| F23 | minor | Fixed: per-row "baseline is an upper bound" flag → `probable-gap` status and summary note; UI mutation test. |
| F24 | minor | Fixed: per-actor "environmental factor" flag (suggested for weather-like EXT names) → `affects` link; environment actors cannot perform steps or be primary. |
| F25 | minor | `npx tsc -b` exit 0 at the end of this revision. |

### Requests to the lead (shared or reference-model changes)

1. **SysML reference model** (`sysml/reference/*.sysml`) — SCN-001..005 doc comments embed the old Actors / Preconditions / Main flow / Alternate flows text; regenerate them from the new attributes (now also `trigger`, `kind`, `official`, split end states). NEED-001..010 gained `conditions`/`rationale` attributes and MGO-006/007/008 gained `unit`/`horizon`/`limitUnit` attributes (texts unchanged). `sysmlMapping.test.ts` passes (IDs/links unchanged).
2. **Structural reference changes I could not make** (they add elements or change links, so the SysML model and the 360-link count must change with them): (a) new goal "Goal: every flight within approved limits" (MGO-009 is free), derives-from MGO-001 and CON-004, and re-parent MGO-008 to it (replace link `MGO-008 derives-from MGO-001`); (b) the need exposed by SCN-005 step 5 (passengers need prompt notice of a disruption with a usable alternative, from STK-001; NEED-011 free) with a capability trace; (c) the assumption exposed by SCN-005 A2 (public transport can absorb passengers in a region-wide closure; next free A- ID) affecting SCN-005. Then update the MGO test expectation (`MGO-008: ['parent']` → `[]`) and `review.openIssues`.
3. **Charger occupancy across weeks:** the Week 1 dynamics model (`chargeMinutesPerTrip` 20) and the Week 7 trade study (`min(aircraft × 20, chargers × 48)`) use the 20-min reading; Week 3 now states 25 min as the assumption consistent with Week 4 and shows 20 min as an upper bound. Decide whether Week 7 should state its occupancy assumption too.
4. **course.ts:** consider moving R12 p.860–862 into Week 3's required readings (F15).
