# Week 8 authoring notes — Architecture viewpoints, decomposition, interfaces and information (opens Part II; CP3; micro-lab 3)

## Files
- `src/content/weeks/week08.ts`: the module. 16 lesson blocks (8,386 words counted by `lessonWordCount` after the reference corrections of 2026-10-11, second batch; 7,833 before; the micro-lab commentary is now its own block after the activity), 15 quiz items (Readiness quiz Q7), lab L8, assignment CP3 with the graduate memo (and the carried-over Week 7 memo Part 2), instructor notes and references.
- `src/activities/week08.activity.tsx` registers four activities: `w08-architecture-editor`, `w08-n2-coupling`, `w08-info-tracer`, `w08-satisfy-reading`.
- `src/activities/week08/`:
  - Pure logic:
    - `architecture.ts`: reads FN (with CAP and SCN parents) / LOG / PHY / EXT / IF / INFO / AI and the PHY of every performer (LOG or AI); L8 checks, minimums and advisories; screening heuristics (function names, allocation justifications); allocation matrix.
    - `n2.ts`: interface N²; the 19 instructor-defined teaching flows; allocations A and B; the coupling metric; induced and functional N²; the typed coverage rule (`pairsWithoutInterface`); the student's own flows and allocation read from the workspace (`flowsFromModel`, `allocationFromModel`, `parseFlowRationale`).
    - `infoflow.ts`: the tracer (typed coverage rule), the decision-wording screen, the peer practice sample and the data-or-information set.
    - `reading.ts`: the micro-lab 3 key.
  - Components: `ArchitectureEditor.tsx` (new modes: function-to-function flow; scenario on FN), `N2Coupling.tsx` (reference or workspace source for both parts), `InfoTracer.tsx`, `SatisfyReading.tsx` (two written answers, kept in the browser, for the notebook entry).
  - Tests: `logic.test.ts` (47), `activities.test.tsx` (11).
- `sysml/week08/`: `aerolink_charge_requirement.sysml` (conformant), `aerolink_if005_allocation.sysml` (conformant), `invalid_wrong_subject.sysml` (intentionally invalid). **Unchanged in the 2026-10-11 revision.**

## Pages actually read (`python -I scripts/source_pages.py …`)
- R19 p.569–577; R62 p.341–347; R57 p.410–415; R21 p.510–514 (re-read p.511–512 for the GEIA-STD-927B wording).
- R20a p.580–584; R20b p.587–594 (re-read p.594, both tables); R20c p.596–603 (re-read p.597–599, 602–603); R22 p.624–632 (re-read p.630–631).
- R74 S10 sl.86–91 (re-read); R71 S10 sl.18–29; R72 S10 sl.41; R83 S06 p.165–169 (re-read p.168).
- R35 p.1396–1399 was not re-read here; the Week 7 memo Part 2 scope is taken from `week07.ts` (assignment instruction, workload line) and `week07_notes.md` (W7-F05, open item 4).
- Planning: WEEKLY_INSTRUCTIONAL_PLAN Week 8; LAB plan Part B L8 (In 75 / Out 3.5); ASSESSMENT_RUBRICS RB-7.2 ("derived from capabilities and scenarios"), RB-8.1 ("zero warnings, or warnings explained"); reference `week03.ts` (SCN-002, SCN-005 main flows and preconditions), `week04.ts` (REQ-SYS-001/002/008 text), `week08.ts`; `aerolink_v02_req_structure.sysml` l.41 and l.416–424.

## SysML validation and probes (2026-10-11, one JVM at a time; `--report` in the scratchpad)
- `python -I scripts/check_sysml.py sysml/week08`: `aerolink_charge_requirement.sysml` PASS; `aerolink_if005_allocation.sysml` PASS; `invalid_wrong_subject.sysml` FAIL as expected (`ERROR 17:33 Couldn't resolve reference to Element 'chargeTimeToDispatch'.`). No listing changed, so no full `content:sysml` run was needed for this revision.
- Probes (scratch files, not course listings):

| Probe | Content | Outcome |
|---|---|---|
| P5 | subject `aircraft : EVTOLAircraft`; constraint on `aeroLink.'PHY-003'.chargeTimeToDispatch`; `satisfy … by aeroLink.'PHY-001'` | PASS, no diagnostic |
| P6 | subject `aircraft`; `EVTOLAircraft` also declares `chargeTimeToDispatch` | PASS, no diagnostic |
| P7 | listing 1 with `satisfy 'REQ-SYS-001' by aeroLink.'PHY-001'` | PASS, `WARNING 17:27 Bound features should have conforming types` |
| P8 | listing 1 with 22 [min] | PASS, no diagnostic |
| P9 | REQ-SYS-002 with subject `vertiports : VertiportNetwork` (no `padEdgeNoise`) | FAIL, `ERROR 9:35 Couldn't resolve reference to Element 'padEdgeNoise'.` (q8-14) |
| P10 | REQ-SYS-002 (subject aircraft) `satisfy … by aeroLink.'PHY-002'`, a `VertiportNetwork` that also declares `padEdgeNoise` | PASS, `WARNING 15:27 Bound features should have conforming types` (q8-13) |
| earlier | `satisfy 'FN-008' by …` on an action | "Must reference a requirement" (q8-15; unchanged) |

## Disposition of the independent review (`_source_cache/review/week08_review.md`)

| ID | Sev. | Disposition |
|---|---|---|
| F01 | High | Fixed. The false rule is gone from the lesson, q8-14 and the key. The commentary says the invalid listing fails on name resolution only, that S10 sl.87 is a permission, and that listing 1 uses the parameter `maxChargeTime`. q8-14 b is rekeyed. The false rule is now distractor c, with an explanation. A sixth misconception was added. |
| F02 | High | Fixed. A new commentary paragraph says what the checker does not catch, with probe outcomes P6, P5 and P7 (PASS; PASS; PASS + WARNING). It states that subject and satisfier choice is a review matter and points to RB-8.1 (warnings explained). The answer key and caution list the probes. |
| F03 | High | Fixed by option (a). The editor records FN → FN flows (kind, item, owner/provenance in the link rationale). The N² tool's "My workspace" mode drives both parts. It reads the student's FN, PHY, typed IF and flows (including FN → INFO → FN chains), takes A from the recorded allocation, and lets B be set over the student's own PHYs. It reports when there is nothing to compute. Tested with logic tests (19 recorded flows reproduce 0.526 / 0.842) and a component test. Memo time is recorded honestly (budget 0.4 h, realistic ≈ 1.2 h; see F08). |
| F04 | Medium | Fixed. The course coverage rule is stated in the lesson and the cautions: information needs an information IF; energy or material needs a physical IF; an organisational IF carries no flow. `pairsWithoutInterface` and the tracer apply it and report the IFs present. Recount: A has 3 gaps (adds PHY-004–PHY-005, F10/F18 over IF-004 only); B has 7 of 8 (the reviewer's "5" undercounted, see tests). Reference trace: 5 advisories. Worked (d) table, ¶2, the advanced table, q8-7 a and the answer key were updated. Mutation tests show the check fails on the type, not on the ends. |
| F05 | Medium | Fixed. Name screen: a performer role as first word is rejected. Justification: generic words are removed from the criterion patterns; a REQ ID alone is no longer a criterion; an anchoring ID is required. Decision screen: needs a choice frame ("which X to", "when to", …); bare which/when/if/order no longer count. Every reviewer string has a test, and each fails for the stated reason (message-matched). The lesson's six table justifications pass (rule 4; tested from the content). The lesson says "screens", not "refuses". |
| F06 | Medium | Fixed. q8-11 is a new case: a pad thermal alarm whose only interface is an organisational contract. It applies F04 and is not answered by worked (d). q8-13 is a new case from P10: REQ-SYS-002 satisfied by the vertiports, PASS + WARNING, with a design fix to choose. The lesson states the general warning behaviour (P7) on a different requirement, so the item is applied, not recalled. |
| F07 | Medium | Taught as a finding in worked (b) (¶4 and the table row), in the advanced fourth limit and in worked (d). **Reference corrected 2026-10-11** (IF-012, IF-013; see below); the lesson now teaches the gap as "what the review found and how the reference was corrected". |
| F08 | Medium | Fixed in the cautions and the budget. Each compressed line says it is compressed. The caution gives the realistic ≈ 13.8 h (graduate) and ≈ 11.5 h (others) against 10.5 h, and gives the lead two options. |
| F09 | Medium | Mitigated. S10 sl.86–91 and S06 p.168 are assigned as a micro-lab extract: a workload line (0.2 h), a lab step, an activity instruction, `references` and a caution. The lesson paraphrases everything q8-12–15 need. A course.ts request is below. |
| F10 | Medium | Fixed. The design aim is now cited to R20c p.599 and p.603. R22 is presented as the integration analogue in the interfaces ¶3, the advanced ¶1 and the `n2.ts` header. q8-8 b's explanation and its citation moved to R20c p.599. |
| F11 | Medium | Fixed. P is now "pairs joined by a crossing flow, each needing a direct interface or a recorded relay — an upper bound on the direct interfaces needed". Changed in the lesson, the tool and the `n2.ts` type comment. |
| F12 | Medium | Fixed in the lesson (new ¶ "A tree is not a derivation": FN-005 derives from CAP-001/CAP-007; FN-011 from CAP-002/CAP-004). The reference needed no change. |
| F13 | Medium | Fixed. The lesson cites the R20b p.594 static-decomposition pitfall and the proven practice. Worked (b) now walks SCN-002/SCN-005 before drawing the tree. The editor records the scenario (FN derives-from SCN). There is a new advisory `fn-scenario`. The lab step, template B2 (scenario per FN, RB-7.2 "and scenarios") and session notes are updated. **Reference corrected 2026-10-11:** 13 FN derive from their SCN; FN-013 (a planning function) is the only, explained, advisory. |
| F14 | Medium | Fixed. q8-5 is rekeyed to "direct allocation on technologies" and cites R20c p.602. The explanation separates it from "no logical architecture". |
| F15 | Low | Fixed. "ICT" is kept, and the course's extension to physical and organisational interfaces is labelled as instructor extension (interfaces ¶1–2, application ¶2). |
| F16 | Low | Fixed. "Response time" is labelled as the course's reading of "execution with close frequency level". The FN-006 argument is now the charge-control loop (seconds), with 20 min as the allocated performance. Proximity and fewer interfaces are labelled as R20c p.599 candidate-architecture aims in the screen. q8-4 is reworded. |
| F17 | Low | Fixed. Misconception 3 now cites R20c p.597, with R57 p.411 in the text. Misconception 2's allocation clause now cites R20c p.598. |
| F18 | Low | Fixed. The stale caution and open issue are removed. R22 and R20c are called "required extracts". |
| F19 | Low | Fixed. q8-8 uses Alt 1 / Alt 2. |
| F20 | Low | Fixed. The commentary moved to the new block `w8-sysml-commentary` after the activity. The `w8-sysml` block ends with the "do the micro-lab first" instruction, and the invalid listing comes before the activity. |
| F21 | Low | Fixed. Two answer fields in the activity (kept in the browser), a notebook entry "Micro-lab 3" in the lab step, the assignment and the answer key. Closed-AI now has something to apply to. |
| F22 | Low | Fixed. d5 is now a raw log export. d3's explanation names the GEIA-STD-927B difference (R21 p.511). Bloom: q8-3 Understand; q8-7 and q8-10 Apply. The new q8-11 and q8-13 are Apply. |
| F23 | Low | Fixed. `alloc-consistent` covers AI performers (tested by mutation: AI-001 back on PHY-004 flags FN-008). **Reference corrected 2026-10-11:** AI-001 is allocated to PHY-005; DEC-002 no longer names booking. The lesson states both as review findings. |
| F24 | Low | Fixed. A fifth limit was added: the flow set was written for the central-dispatch decomposition, and DEC-002's rationale is not what κ measures. |
| F25 | Low | Fixed. R57 p.411 is replaced by R20c p.599 in worked (c), which the new coverage sentence uses. |
| F26 | Low | Rejected with evidence. The listing's doc text is verbatim the reference requirement text (`week04.ts` l.74 and `aerolink_v02_req_structure.sysml` l.417: "from any landing state of charge at or above the 20 % reserve"). The reviewer compared it with the verification *criterion* string ("from 20 % reserve"). |
| §7 rule 2 note | — | `rubricScope` now names RB-16.1 as the primary criterion, with RB-7.3 for the N² content. |

## Mutation evidence (each run restored afterwards; suite then 42/42)
- Type-blind coverage (`there.length === 0` in `n2.ts`; `if (there.length) continue` in `infoflow.ts`): 5 tests fail — typed gaps A, typed gaps B, the retype mutation, the five reference advisories, and the IF-110 clearing test.
- Pre-review decision regex restored, performer screen disabled, ID requirement disabled: 3 tests fail — the function-name, justification and decision-wording tests.

## Reference baseline through the module's own checks (rule 4)
- All required and minimum checks pass. Advisories (2, both explained in the model): `phy-isolated` PHY-006 (the medium of the information interfaces); `fn-scenario` FN-013 (a planning function).
- Tracer: no advisory. Interface N²: 14 IF (3 P, 9 I, 2 O; 4 external), degrees PHY-004 9, PHY-001 4, PHY-002/003/005 3, PHY-007/008 and each EXT 1, PHY-006 0 (sum 28), 12 of 66 pairs (18.2 %). Coupling unchanged (A κ = 10/19 = 0.526, P = 7, D_max = 4; B κ = 16/19 = 0.842, P = 8, D_max = 5). N² typed gaps: A 0, B 4 of 8 (PHY-001–PHY-002 F12 over physical IF-001 only; PHY-002–PHY-003 F11; PHY-002–PHY-005 F10; PHY-002–PHY-007 F01/F02).
- First version (IF-001..009, AI-001 on PHY-004, no FN → SCN links), still pinned by `logic.test.ts` through `draftIfs` and mutations because the lesson teaches it as the review's findings: advisories PHY-006, FN-008, all 14 FN; tracer 5 advisories; typed gaps A 3, B 7; 9 IF, PHY-004 degree 5, 9 of 55 pairs (16.4 %).
- The six worked-table justifications pass the justification screen (test reads them from the lesson).

## Reference changes proposed to the lead — MADE on 2026-10-11 (second batch; details and decisions in `reference_model_notes.md` §1)
Disposition: 1 → IF-012 (IF-004 kept); 2 → IF-010; 3 → direct IF-013 (keeps the no-go path off the dispatch platform, R-007); 4 → direct IF-014 (IF-009 kept); 5 → IF-011; 6 → AI-001 re-allocated to PHY-005, charge-session input as a recorded relay over IF-010 and IF-012 (INFO-003 `relay`); 7 → "booking" dropped from DEC-002; 8 → 13 FN → SCN links as listed below except **FN-011 → SCN-002** (release happens in SCN-002, not SCN-001), FN-013 none (planning function); 9 → PHY-006 kept without an interface (the medium; recorded in its text), IF-002 carries INFO-002 only. Week 8 lesson, activities, tests and answer key updated to the corrected reference; the first version's gaps are taught as "what the review found and how the reference was corrected". The original proposal follows for the record.
1. Add an **information** interface PHY-005 ↔ PHY-004 (maintenance ↔ operations data: go/no-go status, availability, work-order data). It closes F10/F18 (REQ-STK-006 / REQ-SYS-008 interlock) and INFO-003 from PHY-005, and makes the INFO-002 relay to PHY-005 possible. Keep IF-004 as the organisational handover.
2. Add IF-010 charger ↔ operations centre (information; INFO-003 charge-session records, F11 charge-complete status).
3. Fault reports PHY-001 → PHY-005: either record the relay (IF-002, then item 1) in INFO-002/F17, or add a direct interface.
4. INFO-001 boarding timestamps PHY-002 → PHY-004: add a vertiport ↔ operations data interface, or record the relay. IF-009 (organisational) does not carry them.
5. INFO-004 weather EXT-003 → PHY-004: add an IF-011 weather service ↔ operations centre interface (the SysML reference already has the item flow).
6. AI-001: either `allocated-to PHY-005` (with FN-008), or split prediction out of FN-008 into a function on PHY-004.
7. DEC-002 text: drop "booking" ("Host scheduling and dispatch on one operations platform …"), or move FN-001 to PHY-004. The reference allocates FN-001 to PHY-007.
8. Add `FN derives-from SCN` links (e.g., FN-003/FN-005/FN-012/FN-014 → SCN-002; FN-004 → SCN-005; FN-006/FN-007 → SCN-003; FN-010 → SCN-003 (alternate flow A3, cell over-temperature); FN-008/FN-009 → SCN-004; FN-001/FN-002/FN-011 → SCN-001; FN-013 Forecast demand: no current SCN exercises it, which is itself a finding) so that the reference passes `fn-scenario` and RB-7.2's "and scenarios".
9. Still open from before: PHY-006 degree 0 (split IF-002 or treat PHY-006 as the medium); IF-002 `carries` lists INFO-003 without a PHY-001 → INFO-003 flow.

## Requests to the lead (shared files)
1. `course.ts` Week 8: add `{ reading: 'R74', pages: '86–91' }` and `{ reading: 'R83', pages: '168' }` as required micro-lab extracts (F09). They are budgeted here already.
2. Workload: the realistic Week 8 total is ≈ 13.8 h (graduate) and ≈ 11.5 h (others) against 10.5 h. Either move the Week 7 memo Part 2 due date to the end of Week 9, or accept the overrun and record it under FD-22. `week07.ts`'s caution says Part 2 is "done in Week 8", which matches this module.
3. Register: no S10 allocation slide is in the register; listing 2 uses `allocation … allocate` as the validated reference does (unchanged request).
4. The weekly plan's ISO 42010 pointer (S13 p.339) is outside R62's verified range and is not cited (unchanged).
5. Canonical `sysml/validation-report.json`: regenerated by a full run on 2026-10-11 (23:33Z) after the reference SysML files changed (second batch): 23 files, 14 PASS, 9 FAIL as intended, 0 ERROR.

## Design decisions (kept from the first authoring, still valid)
- Viewpoints: operational/functional/physical is the course's RB-7.1 convention. MITRE (operational/system/technical, R62 p.341) and SEBoK (functional/logical/physical, R20a–c) are attributed separately.
- Interface typing (physical/information/organisational) and the coverage rule are course conventions. SEBoK calls any element binding a "physical interface", including procedures and documents (R20c p.597).
- N² conventions, the metric (E, X, κ, P, D_max) and the 19 teaching flows are instructor-defined and labelled.
- Recording: every element carries owner and provenance. Link-only records (allocations, FN → FN flows) carry `[owner · provenance]` in the link rationale; a flow rationale reads `<kind>: <item> [owner · provenance]`.
- Known screening limits: "Monitor fire detection system" is flagged (false positive, see facilitation). A well-formed but wrong justification with a criterion word and an ID passes; a reviewer judges it.
