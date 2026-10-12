# Week 8 independent review: Architecture viewpoints, decomposition, interfaces and information (CP3; micro-lab 3)

Reviewer: independent adversarial review (not the author). Date: 2026-10-11.

**Scope**
- `learning-studio/src/content/weeks/week08.ts`
- `src/activities/week08.activity.tsx`, `src/activities/week08/*` (architecture.ts, n2.ts, infoflow.ts, reading.ts, four components, two test files)
- `sysml/week08/*.sysml`
- `docs/authoring/week08_notes.md` (verified, not trusted)

**Checked against**
- `course.ts` (B8.1–B8.5; readings incl. R22 p.630–631 and R20c p.598–599); `AUTHORING_GUIDE.md` §1–§7; `schema.ts`
- `ASSESSMENT_RUBRICS.md` RB-6, RB-7, RB-12, RB-16 (graduate-task note)
- Lab plan Part B L8, B.4, B.5; syllabus §11–12 (CP3) and §14; `WEEKLY_INSTRUCTIONAL_PLAN.md` Week 8
- Reference `src/model/reference/week08.ts` (plus week03/04/05/06/12 for IDs); `sysml/reference/README.md`
- Prior reports in this folder (recurring defect classes: rule 3, 5, 6 violations; stale cautions)

**Sources read** (via `scripts/source_pages.py`, full verified ranges)
- R19 p.569–577; R62 p.341–347; R57 p.410–415; R21 p.510–514
- R20a p.580–584; R20b p.587–594; R20c p.596–603; R22 p.629–632
- R74 (S10 sl.86–91); R71 (S10 sl.20–22); R72 (S10 sl.41); R83 (S06 p.165–169)

**Runs** (from `learning-studio/`)
- `npx vitest run src/activities/week08 src/content` → **4 files, 103 tests, all passed**.
- `npx tsc -b` → **exit 0**, no output.
- `npm run content:sysml -- sysml/week08` → `aerolink_charge_requirement.sysml` PASS; `aerolink_if005_allocation.sysml` PASS; `invalid_wrong_subject.sysml` FAIL as intended (`ERROR 17:33 Couldn't resolve reference to Element 'chargeTimeToDispatch'`).
- Reviewer probes, scratchpad only, run one at a time with `--report` in the scratchpad:
  - P1: listing 1 with 22 [min] → PASS, zero diagnostics. This confirms the "checker does not evaluate constraints" claim.
  - P2 (q8-13): noise variant with 66 [dB] → PASS. Confirmed.
  - P3 (q8-14): subject `VertiportNetwork` → `Couldn't resolve reference to Element 'padEdgeNoise'`. Confirmed.
  - P4 (q8-15): `satisfy 'FN-008' by …` → `Must reference a requirement` (plus two further errors). Confirmed.
  - P5: subject `aircraft : EVTOLAircraft`, but the constraint reads `aeroLink.'PHY-003'.chargeTimeToDispatch` (not a feature of the subject); `satisfy … by aeroLink.'PHY-001'` → **PASS, zero diagnostics**.
  - P6: subject `aircraft`, and `EVTOLAircraft` also declares an attribute named `chargeTimeToDispatch` → **PASS**.
  - P7: listing 1 with `satisfy 'REQ-SYS-001' by 'PHY-001'` (an aircraft, not a charger) → **PASS with one WARNING** ("Bound features should have conforming types").
- Heuristic probes: the module's exact regexes, copied into a scratch script (results in W8-F05).

No course or app file was edited.

## Verdict: **PASS WITH FIXES**

There are no critical defects.

**What holds up**
- Every number in worked examples (c) and the advanced block recomputes exactly by hand:
  - type counts 3 + 4 + 2 = 9; degree sum 18; density 9/55;
  - A: X = 10, κ = 0.526, P = 7, D_max = 4;
  - B: X = 16, κ = 0.842, P = 8, D_max = 5;
  - single moves give 14/19; the gap pairs are as stated.
- The listings validate. The answer key matches the line numbers.
- Citation fidelity to SEBoK and MITRE is high. The R62 quotation is exact.
- Viewpoint vocabularies and the interface typing are labelled as course conventions, as rule 7 requires.
- The editor records owner and provenance (rule 1).
- The graduate task is always read (rule 2).

**What must be fixed**
1. **Two false SysML claims (B8.5).** Both are taught, and one is in a keyed correct answer:
   - "the constraint may only use features of the subject";
   - choosing the subject "is an allocation decision, and the model enforces it".

   Probes P5–P7 refute both. So does listing 1 itself: its constraint uses `maxChargeTime`, which is not a feature of the subject.
2. **The graduate memo cannot be done with the tool as promised.** The N² tool only handles the 13 reference functions and the 19 fixed flows. Yet the memo and its 0.7 h budget assume the tool computes the team's own two alternatives.
3. **The interface gap checks ignore interface type.** In both the N² coupling tool and the tracer, an organisational agreement counts as carrying information flows. That contradicts the lesson's own typing rule. q8-7 makes the inconsistency worse.
4. **Recurring defect classes:**
   - screening heuristics pass realistic bad input (rule 5);
   - two quiz items are answered verbatim by the lesson (rule 6);
   - the workload is under-budgeted in places (rule 3);
   - a caution and the notes are stale against `course.ts`.

## Findings

Severity scale:
- **High:** teaches something false, or makes an assessed task infeasible.
- **Medium:** a pedagogical, technical or rule violation that a student or grader will trip on.
- **Low:** polish, or a minor fidelity problem.

| ID | Sev. | Location | Finding | Evidence | Fix |
|---|---|---|---|---|---|
| W8-F01 | High | `week08.ts` w8-sysml ¶4 ("The constraint may only use features of the subject"); q8-14 option b (keyed correct: "the constraint may use only features of its subject"); `answerKey` micro-lab line | **False SysML rule.** S10 sl.87 grants a permission ("Features of the subject *can* be used in the requirement definition"). It is not a restriction. | Listing 1 line 25 uses `maxChargeTime`, a requirement attribute that is not a subject feature, and it PASSes. S10 sl.87's own example uses `massReqd`, which is not a subject feature either. Probe P5: a constraint that reads `aeroLink.'PHY-003'.chargeTimeToDispatch` under subject `aircraft` PASSes with zero diagnostics. The invalid listing fails only because the feature chain `aircraft.chargeTimeToDispatch` does not resolve on `EVTOLAircraft`. | Restate the rule as: "the feature chain `aircraft.chargeTimeToDispatch` does not resolve, because `EVTOLAircraft` has no such feature; a requirement's constraint is normally written over its subject's features (S10 sl.87) so that the satisfy binding is meaningful." Reword q8-14 b and its explanation the same way. |
| W8-F02 | High | w8-sysml ¶4 ("Choosing a requirement's subject is an allocation decision, and the model enforces it"); answer key ("which is the allocation REQ-SYS-001 intends") | **Overclaim about what the checker detects.** The checker enforces name resolution only. It does not enforce the subject choice, or which element may satisfy. | P6: if `EVTOLAircraft` also declares `chargeTimeToDispatch`, the wrong-subject requirement PASSes. P7: `satisfy 'REQ-SYS-001' by 'PHY-001'` (the aircraft) PASSes with only a WARNING ("Bound features should have conforming types"). P5 also PASSes. This contradicts the lesson's own correct point in ¶3 that a "valid" model can assert something false. | Say "the checker caught this only because the name did not resolve; it would not catch a wrongly chosen subject that happens to have a same-named feature, and a satisfy by an element of the wrong type is only a warning (P7). Review must catch subject and satisfier choices." Point out that RB-8.1 level 4 requires warnings to be explained, which links to Week 10. |
| W8-F03 | High | Assignment graduate instruction ("Compute both alternatives (by hand or with the N² tool)"); activity w8-act-n2 instruction 4 ("set A and B to your team's two candidate allocations"); workload 0.7 h; caution ("realistic only because the N² tool does the computation"); `N2Coupling.tsx` lines 11–12, 34–40 | **The graduate task is infeasible as specified.** The tool's rows are fixed to the 13 functions in `FN_FLOWS`, and its columns to the hard-coded `PHYS` (PHY-001..008). The flow set cannot be edited. "Load my workspace allocation" copies only FN IDs that coincide with the reference, which assumes the team's FN-001..014 mean the same as the reference's. A team with its own functions must define its own flows and compute by hand. 0.7 h for that, plus a one-page memo, is not realistic (rule 3). | `const FNS = [...new Set(FN_FLOWS.flatMap…)]`; `const PHYS = ['PHY-001', …, 'PHY-008']`; `coupling(FN_FLOWS, alts.A)` | Either (a) let the tool take workspace FNs and a student-entered flow list (FN → FN, kind), or (b) restate the task: "use the reference flow set and your team's own allocation of those functions", and re-budget hand computation at ≥ 1.5 h with a caution. |
| W8-F04 | Medium | `n2.ts` `pairsWithoutInterface`; `infoflow.ts` `hasIf`; worked (d) table INFO-001 "IF-008; IF-009"; advanced table "Crossing pairs with no declared IF" (B = 4); q8-7 option a explanation | **The gap checks ignore interface type and contents, which contradicts the course's own typing.** In B, six information flows on PHY-002↔PHY-004 count as "covered" by IF-009, an organisational pad-slot agreement. Passenger material flows F13/F14 count as carried by IF-001, which carries "mechanical loads, position". In the reference trace, INFO-001 boarding timestamps (PHY-002→PHY-004) cross IF-009 (organisational), and INFO-003 crosses IF-004 (organisational). The lesson says "An information interface carries data". q8-7's explanation says reports "travel over" an organisational interface. A student cannot tell which rule applies. | `ifs.some((i) => i.ends && ((i.ends[0]===a && i.ends[1]===b) …))`: no type test. IF-009 `carries: 'pad slots, duties'`. Recomputed B pairs: 002–004 carries F03, F04, F05, F07, F08, F09 (all information). | Decide the rule. Recommended: a flow is covered only by an IF whose type matches its kind (information → information; energy or material → physical), or by a documented relay. Make both checks type-aware. Recount B's gaps: with a type-aware check, PHY-002–PHY-004 becomes a gap, so 5 not 4. Change INFO-001's "interface crossed" to "IF-008; none (information) declared PHY-002→PHY-004". Fix q8-7 a's explanation. |
| W8-F05 | Medium | `architecture.ts` `justificationProblem`, `functionNameProblem`; `infoflow.ts` `decisionProblem`; lesson w8-worked-allocation ¶3 ("It refuses … a justification that names no criterion") | **Rule 5 violated: the screening heuristics pass realistic bad input of passing length.** Single generic words satisfy the criterion regexes: "data", "information", "location", "site", "safe", "similar", "control", "minutes". The decision check accepts any text containing "which", "when", "if" or "order". Performer-subject function names pass unless they contain a listed noun or start with a PHY name. The lesson promises a refusal. | Reviewer probe, exact regexes. These justifications pass: "We put it at the operations centre because that is where all the data ends up anyway."; "The team agreed this location is the most convenient place for the function overall."; "Allocated here because the operations centre is a safe choice for most things we do." These decisions pass: "Stored for future analysis if needed by the team" (the q8-9 c distractor plus two words); "Supports situational awareness of which aircraft are flying right now". These names pass: "Technician repairs aircraft" (q8-3 distractor c); "Charger delivers energy to aircraft"; "Dispatcher releases aircraft". | Require the criterion word in an argument frame (e.g., "because … [flow/timing/…] … [FN/IF/REQ ID]"), or require a cited FN/IF/REQ ID. Add tests with the failing strings above. Add performer-role nouns (technician, dispatcher, pilot, charger, operator, staff) to the name screen. Soften the lesson to "screens", not "refuses". |
| W8-F06 | Medium | q8-11; q8-13; (q8-4 borderline) | **Rule 6: answered verbatim earlier.** q8-11 restates worked (d)'s own gap case: PHY-003→PHY-004, release decision REQ-SYS-008, "declare an IF or record the relay". The tracer instruction says the same. q8-13 is worked (e) ¶3 with 66 dB in place of 22 min: "checker still reported PASS … review and verification exist to catch exactly that". | week08.ts lines 172, 196, 475 vs 379–386, 401–408 | Move q8-11 to a new pair, e.g., a fire-alarm item where PHY-008 is the producer and the consumer is internal. Make q8-13 ask what evidence would discharge the claim, or what the warning in P7 means. |
| W8-F07 | Medium | Worked (b) table row FN-008; reference REQ-SYS-008 ("mark an aircraft unavailable … within 2 min"); flows F17 and F10; IF-004 (organisational) | **The safety-critical go/no-go loop rides on a missing interface and an organisational one, and the lesson presents this allocation as exemplary.** Fault reports (F17, PHY-001→PHY-005) have no IF. The no-go status (F10, PHY-005→PHY-004, the REQ-STK-006 interlock) crosses only IF-004, a work-order handover procedure. A 2-min timing requirement over a procedure is the very dependency q8-4 calls wrong for the chargers. | Reference allocation A; IF list; REQ-SYS-008 text (week04.ts l.102–103); q8-4 option a explanation | Teach it as a finding. Add to worked (b) or the advanced "fourth limit": "FN-008's allocation is justified by dependability, but its timing requirement crosses an organisational interface; an information interface PHY-005↔PHY-004 is needed." Report it to the lead as a reference gap, alongside IF-010. |
| W8-F08 | Medium | Workload items; caution "Workload is tight" | **Rule 3, other items.** "CP3 assembly (revise L7 after feedback, integrate L8, AI statement) and defence preparation" at 0.6 h is implausible: Week 7 already flagged CP assembly budgets. "Online lesson and the four interactive activities" at 0.9 h covers a 6,313-word lesson (≈ 40 min at technical reading pace) plus three out-of-class activities with prediction steps. The SysML pages that q8-12–15 cite (R83, R74) are not budgeted (see F09). | week08.ts lines 630–637; notes "6,313 words" | State the realistic figures in `cautions`: e.g., CP3 assembly ≥ 1.5 h, online 1.3 h. Record the overrun against FD-22 rather than leave silent shortfalls. |
| W8-F09 | Medium | q8-12 to q8-15 cite R83 (S06 p.166–168) and R74 (S10 sl.87) | **Quiz depends on readings not assigned this week (W4-F10 class).** In `course.ts`, R74 is a Week 10 reading and R83 is a Week 10 extension. Week 8 assigns neither. The lesson's paraphrase is good, so this is a citation-hygiene problem rather than an unfairness. | course.ts l.184–185 vs l.159 | Either add the two-slide and one-page extracts (S10 sl.87, 91; S06 p.168) to Week 8 and the workload, or cite the lesson block and listing in the quiz and keep R83/R74 as "further reading". |
| W8-F10 | Medium | Advanced ¶1 and ¶3; q8-8 explanation; application ¶3 | **Context shift in R22 (overclaim).** R22 p.631 minimises "the number of interfaces **to be verified** between aggregates" when **defining the integration strategy** of already-designed elements. The lesson uses it as an architecture-allocation criterion ("R22 says aggregates should be formed so that as few interfaces as possible run between them"). It also uses it in q8-8 to justify weighing P against κ. The support for fewer interfaces as an architecture aim is R20c p.599 and p.603. | R22 p.630–631 text ("In the integration context, the coupling matrices are useful for optimizing the aggregate definition and verification of interfaces") | Cite R20c p.599 and p.603 for the design aim. Present R22 as the integration analogue ("the same matrix is later used to choose integration aggregates"). Fix q8-8 b's explanation. |
| W8-F11 | Medium | Advanced ¶2 ("P … which is the minimum number of interfaces the allocation needs") | **Internally contradicted.** The same lesson accepts relay paths as a valid resolution, so P is an upper bound on the number of *direct* interfaces, not a minimum. With relays through PHY-004, A needs fewer new IFs. | Worked (d) ¶2 ("flight data reach maintenance through the operations centre over IF-002 and then IF-004") | Say "the number of element pairs that need a direct interface, or a recorded relay". |
| W8-F12 | Medium | Worked (b) ¶1 decomposition of "Manage flight operations" (serves CAP-004) into FN-003, FN-004, FN-012, FN-011, FN-005 | **Inconsistent with the reference traceability.** In the reference, FN-005 derives from CAP-001 and CAP-007, not CAP-004, and FN-011 from CAP-002 and CAP-004. Students copying the worked example will create derives-from links that differ from the baseline. | reference/week08.ts l.28, 34 | Either say "FN-005 also serves CAP-001/CAP-007; it is listed here because …", or align the reference. |
| W8-F13 | Medium | Worked (b) ¶1–2; lab step "Functional decomposition"; template B2 | **Selective use of R20b p.594.** The lesson cites the pitfalls table for "decomposition too deep" and "forgetting inputs/outputs". It omits the pitfall in the same table that bears most directly on its method. "Considering static decomposition of functions only" says the static decomposition "should be established only when scenarios have been created". The proven practice is to constitute scenarios of functions before the decomposition tree. The worked example and B2 teach the reverse order. RB-7.2 asks for "derived from capabilities **and scenarios**", but the editor and B2 check CAP only. | R20b p.594 Table 1 and Table 2 | Add one sentence and a B2 requirement: derive the leaves from SCN-002 and SCN-005 action sequences, then build the tree. Record a scenario reference per FN, at least in the template. |
| W8-F14 | Medium | q8-5 correct option and explanation | **Merges two distinct R20c p.602 pitfalls (rule 7).** The scenario ("Python service on cloud VM 2", "charger model X-350") is the "Direct allocation on technologies" pitfall. The keyed answer and explanation describe "No logical architecture model", citing R19 p.571 (PIM/PSM). The lesson itself lists the two separately (w8-decomposition ¶4). | R20c p.602 Table 3 | Key it to "Direct allocation on technologies … alternate logical and physical levels before the technology level (R20c p.602)" and cite R20c p.602. |
| W8-F15 | Low | w8-interfaces ¶1–2; application ¶2 | **MITRE R57 is scoped to ICT.** "Interfaces are the functional and physical connections at the boundaries of **ICT** systems" (p.411). The lesson drops "ICT" and says "MITRE's advice applies to all three" types, including energy (IF-005, IF-006). | R57 p.410–411 | Keep "ICT" in the paraphrase. Present the extension to physical and organisational interfaces as instructor reasoning. |
| W8-F16 | Low | Worked (b) ¶2 and table ("Response time", "Location"); q8-4 b ("response time and safety") | **"Response time" is not in R20c's list.** R20c names "execution with close frequency level", and "proximity of elements in space" appears among candidate-architecture aims rather than the affinity criteria. The FN-006 argument also conflates the 20-min charge *duration* with a control-loop *latency*. | R20c p.598–599 | Label "response time" as the course's reading of "close frequency level". Rephrase FN-006 as "the charge-control loop (seconds) must not depend on the datalink", and keep the 20-min requirement as the allocated performance. |
| W8-F17 | Low | Misconception 3 citation | **Wrong source for part of the correction.** "Protocols, procedures and documents" in service and enterprise systems comes from R20c p.597, not R57 p.411. | R57 p.411 has no such list | Cite R57 p.411 and R20c p.597. |
| W8-F18 | Low | Caution 1; notes "Open issues 1"; w8-interfaces ¶3 ("extension reading R22") | **Stale.** `course.ts` already lists R22 p.630–631 and R20c p.598–599 as required Week 8 readings, so the "register/course request" is done. | course.ts l.159 | Delete the request. Call both "required extracts". |
| W8-F19 | Low | q8-8 | **Name clash.** The allocations are called "P" and "Q", while "P" is also the metric (pairs). "in P … with the course metric … P (pairs …)". | prompt text | Rename the allocations X1 and X2, or "Alt 1" and "Alt 2". |
| W8-F20 | Low | Micro-lab activity placed `inBlock: 'w8-sysml'`; instruction "Answer 'What does line 28 assert?' before reading the commentary" | **The ordering defeats the prediction.** The commentary (¶3) is in the same block, above the activity. The invalid-listing paragraph says "Before reading on, find the error" and gives the answer in the next sentence. | week08.ts l.196–197, 482–492 | Put the commentary in a collapsed "Commentary" disclosure after the activity, or split the block. |
| W8-F21 | Low | Micro-lab written outputs (lab step 8; instructor note) | **No submission or assessment pathway.** The "one sentence on what the satisfy asserts" and the "two-sentence explanation" are not in the CP3 template, have no notebook entry and are not captured by the activity. The "closed-AI" rule has nothing to apply to. | assignment.template; SatisfyReading.tsx | Add a notebook-entry instruction (RB-16), or a text field captured with owner. |
| W8-F22 | Low | `infoflow.ts` DATA_OR_INFORMATION d5 (and d3); q8-10 Bloom | **Ambiguous key.** The d5 rationale calls the booking log "a structured set of records", yet R21's synthesised definition says data are *unstructured*. GEIA-STD-927B, which R21 quotes, defines information as "data organized in a form that can be interpreted". The lesson concedes the standards differ (R21 p.511). q8-10 (labelled Analyse) is a direct application of a definition. | R21 p.511–512 | Make d5 raw (e.g., an unparsed log dump), or accept both with an explanation. Relabel q8-10, q8-3 and q8-7 as Apply/Understand (honest Bloom). |
| W8-F23 | Low | Reference (lead): AI-001 `performs` FN-008, `allocated-to` PHY-004, while FN-008 is on PHY-005; DEC-002 "host **booking**, scheduling and dispatch on one platform" while FN-001 is on PHY-007 | **Reference inconsistencies hidden by the checks.** `alloc-consistent` looks only at LOG performers (`logById`), so the AI performer mismatch never surfaces. | reference/week08.ts l.34, 106, 110, 144 | Report to the lead. Either extend `alloc-consistent` to AI performers or document the exclusion. |
| W8-F24 | Low | Advanced "what the metric cannot see" | **Missing limitation.** The 19 flows were authored over a functional decomposition built for the central-dispatch reference (e.g., F19 assignment FN-002→FN-011, F04 availability list), so comparing A and B on that set favours A. DEC-002's stated rationale (REQ-SYS-005, R-007) is not what κ measures. | n2.ts FN_FLOWS | Add a fifth limit: "the flow set is defined from A's decomposition; an alternative may need different functions and flows." |
| W8-F25 | Low | `week08.ts` w8-worked-n2 citations (R57 p.411) | **Citation not used.** The block's text uses nothing from R57. | — | Drop it, or add the sentence it supports. |
| W8-F26 | Low | Answer key micro-lab "which is the allocation REQ-SYS-001 intends"; listing 1 doc text vs reference REQ-SYS-001 | **Minor wording.** The listing's doc says "from any landing state of charge at or above the 20 % reserve". The reference text is "from 20 % reserve". The two are not inconsistent, but the listing is not verbatim. | week04.ts REQ-SYS-001 | Optional alignment. |

## AUTHORING_GUIDE §7 cross-week rules

| Rule | Status | Note |
|---|---|---|
| 1 Recorders record owner/provenance | **Met** | The editor renders `ProvenanceOwnerFields`, blocks on `ownerProblem` and passes owner/provenance on every element. Link-only allocations carry `[owner · provenance]` in the rationale. The other three activities do not write to the workspace. |
| 2 Graduate tasks always read | **Met, weak fit** | `rubricScope` names RB-7.3 (formative) and RB-16.1. RB-7.3 measures "complete allocation; typed N²", not a metric comparison, so feedback against it says little about the memo. Consider RB-16.1 as the primary criterion. |
| 3 Workload realistic | **Not met** | F03, F08 |
| 4 Reference passes own checks | **Met** | It is tested. But see F04: the reference "passes" partly because the gap checks ignore type. See also F23. |
| 5 Heuristics fail on realistic bad input | **Not met** | F05 |
| 6 Quiz not answered verbatim | **Not met** | F06 (q8-11, q8-13) |
| 7 Don't merge source levels/terms | **Partly** | Viewpoints and typing are labelled correctly. Merges: F14 (two R20c pitfalls), F10 (R22 integration → design), F15 (MITRE ICT → all interfaces). |
| 8 IDs | **Met** | Reference IDs are correct (STK-012, REQ-STK-002, VER-002, TPM-001/002, R-007/008, SCN-003, CAP-003/004/005). Fictional items use non-colliding IDs (INFO-101..105, IF-010 suggested, letters A–E in q8-6). F12 is a traceability mismatch, not an ID collision. |

## Citation table

| # | Where | Claim (short) | Verdict | Evidence |
|---|---|---|---|---|
| 1 | intuition | Interacting elements exchanging data, energy or mass (R19 p.569) | OK | p.569 Hamilton's principle |
| 2 | viewpoints ¶1 | Document weakness; SysML v2 textual; ASoT (R19 p.569–570, 572) | OK | p.569–570, 572 |
| 3 | viewpoints ¶2 | Framework / model / view / viewpoint definitions (R62 p.341) | OK | p.341 sidebar; quotation exact |
| 4 | viewpoints ¶2 | Multidimensional; views relevant to concerns (R62 p.342) | OK | p.342 |
| 5 | viewpoints ¶2 | Views tailorable (R19 p.573) | OK | p.573 |
| 6 | viewpoints ¶3 | Purpose is paramount; stakeholders conclude (R62 p.344) | OK | p.344 |
| 7 | viewpoints ¶3 | Know the relationships; keep it simple; requirements for the architecture (R62 p.345) | OK | p.345 |
| 8 | viewpoints ¶3 | Reference implementation (R62 p.343) | OK | p.343 |
| 9 | viewpoints ¶4 | Operational, system and technical views (R62 p.341) | OK | p.341 |
| 10 | viewpoints ¶4 | Functional is a view; the trio is fairly comprehensive (R20a p.580–581) | OK | p.580, 581 |
| 11 | viewpoints ¶4 | Logical configuration items with no implementation (R19 p.571) | OK | p.571 item 4 |
| 12 | decomposition ¶1 | Function = I/O transformation satisfying allocated requirements (R19 p.571) | OK | p.571 item 3 |
| 13 | decomposition ¶1 | Function definition; flow items; two kinds of function (R20b p.587) | OK | p.587 |
| 14 | decomposition ¶1 | "y is a function of x" (R20a p.580) | OK | p.580 |
| 15 | decomposition ¶2 | F0 black box; leaves; iterations (R20b p.587) | OK | p.587 |
| 16 | decomposition ¶2 | Pitfalls: too deep; I/O; relevance to scenarios (R20b p.594) | OK, selective | p.594. The static-decomposition pitfall is omitted (F13). |
| 17 | decomposition ¶3 | Identify elements and interfaces for flows (R20c p.598) | OK | p.598 |
| 18 | decomposition ¶3 | Affinity criteria list (R20c p.598–599) | OK | p.598–599 |
| 19 | decomposition ¶3 | Candidate aims: fewer interfaces, separately testable, modularity, resilience (R20c p.599) | OK | p.599 |
| 20 | decomposition ¶3 | Allocation and traceability matrices as outputs (R20c p.600) | OK | p.600 |
| 21 | decomposition ¶3 | Requirements allocated to logical and physical (R20c p.596) | OK | p.596 |
| 22 | decomposition ¶4 | Two pitfalls (R20c p.602) | OK | p.602 Table 3 |
| 23 | interfaces ¶1 | Interface-management definition; external interfaces; design → operations (R57 p.410) | OK | p.410 |
| 24 | interfaces ¶1 | Interface definition; kinds; purpose (R57 p.411) | OVERCLAIM (minor) | "ICT systems" dropped (F15) |
| 25 | interfaces ¶1 | Physical interface binds two elements; protocol, procedure or document (R20c p.597) | OK | p.597 Table 1 |
| 26 | interfaces ¶2 | Framework early; same attributes incl. business process/data flow; SLAs (R57 p.413) | OK | p.412–413 |
| 27 | interfaces ¶2 | ICWG for issues engineers cannot resolve (R57 p.414) | OK | p.414 |
| 28 | interfaces ¶2 | Loosely coupled architectures need more governance (R57 p.412) | OK | p.412 |
| 29 | interfaces ¶3 | N² a basic method for aggregates; minimise interfaces between aggregates; fault location (R22 p.630–631) | OK | p.630–631 (integration context) |
| 30 | interfaces ¶3 | Modularity; focus on interfaces (R20c p.603) | OK | p.603 Table 4 |
| 31 | information ¶1 | IM purpose (15288); INCOSE qualities (R21 p.510) | OK | p.510 |
| 32 | information ¶1 | Analytics and decision-making objective (R21 p.511) | OK | p.511 Table 1 |
| 33 | information ¶2 | Standards differ (R21 p.511); synthesised definition (p.512) | OK | p.511–512 |
| 34 | information ¶2 | Information asset (p.512); metadata incl. provenance (p.512–513) | OK | Metadata is on p.513 |
| 35 | information ¶2 | Sensitive information, e.g., identifies an individual (R21 p.514) | OK | p.514 step 1 |
| 36 | worked (a) | Start from concerns (R62 p.344); share data centrally (p.345) | OK | — |
| 37 | worked (a) table | Anchors: R62 p.341, 345; R20a p.580–581; R19 p.571; R20c p.597–598 | OK | — |
| 38 | worked (b) | Verb + object, I/O, no performer (R20b p.587, 594) | OK (weak) | "Action verb" is on p.594 Table 2 |
| 39 | worked (b) | "Two criteria from R20c p.598–599" (same flows; response time) | OVERCLAIM | "Response time" is not listed (F16) |
| 40 | worked (c) | N² citations R22 p.630–631; R57 p.411 | OK / NOT USED | The R57 citation supports nothing in the block (F25) |
| 41 | worked (d) | Data vs information (R21 p.512) | OK | — |
| 42 | worked (e) | perform identifies the performer (S10 sl.41) | OK | R72 sl.41 |
| 43 | worked (e) | Port definition; compatibility; ~ conjugate (S10 sl.20–21) | OK | R71 sl.20–21 |
| 44 | worked (e) | Interface definition and usage (S10 sl.22) | OK | R71 sl.22 |
| 45 | worked (e) | Requirement is a kind of constraint; doc text; short name = requirement ID (S06 p.165) | OK | R83 p.165 |
| 46 | worked (e) | Always about some subject; features of the subject can be used (S10 sl.87; S06 p.166) | OK | R74 sl.87; R83 p.166 |
| 47 | worked (e) | Requirement usage binds parameters (S10 sl.89) | OK | sl.89 |
| 48 | worked (e) | Satisfied if assumed ⇒ required (S10 sl.91; S06 p.165) | OK | — |
| 49 | worked (e) | satisfy binds subject; kind of assert constraint usage; asserts satisfied (S06 p.168; S10 sl.91) | OK | p.168 §7.21.4 |
| 50 | worked (e) | `not satisfy` asserts not satisfied (S06 p.168) | OK | p.168 |
| 51 | worked (e) | "The constraint may only use features of the subject" (implicitly S10 sl.87) | **WRONG** | F01; P5 |
| 52 | advanced ¶1 | "R22 says aggregates should be formed so that as few interfaces as possible run between them" (p.631) | OVERCLAIM (context) | F10 |
| 53 | advanced ¶1 | Fewer physical interfaces, modularity (R20c p.599, 603) | OK | — |
| 54 | advanced ¶4 | Modularity vs resilience pull apart (R20c p.599) | OVERCLAIM (minor) | R20c defines resilience as reliable, maintainable or replaceable elements. The tension is instructor reasoning. |
| 55 | application ¶1 | Powertrain example; Drive Vehicle; Control Vehicle Acceleration; external interfaces (R19 p.576–577) | OK | The last sentence ("what a design model is for …") is unmarked instructor inference. |
| 56 | application ¶2 | Interface standards as drivers; nuts and bolts to TCP/IP (R20c p.596) | OK | p.596 |
| 57 | application ¶2 | MITRE practices: early, standards, publish in one place, ICWG (R57 p.413–414) | OK | "Publish" runs onto p.414–415 |
| 58 | application ¶3 | N² for aggregates and integration order; fault location (R22 p.630–631) | OK | — |
| 59 | application ¶3 | Judge alternatives; as-is/to-be (R62 p.345) | OK | p.345 |
| 60 | q8-1 | R62 p.341, 344 | OK | — |
| 61 | q8-2 | R62 p.345; R20c p.597 (option d) | OK | — |
| 62 | q8-3 | R19 p.571 (verb and object, no performer) | OVERCLAIM (minor) | p.571 gives the I/O transformation only |
| 63 | q8-4 | R20c p.598–599 (same flows, frequency, dependability) | OK | "Response time" in the option is a gloss (F16) |
| 64 | q8-5 | R19 p.571 PIM/PSM | WRONG SOURCE for the scenario | It should be R20c p.602 "Direct allocation on technologies" (F14) |
| 65 | q8-6 | R22 p.630–631 | OK (weak) | The page supports N² use, not degree counting |
| 66 | q8-7 | R57 p.411 "characterised along several dimensions" | OVERCLAIM (minor) | MITRE's dimensions are function, performance, behavioural process and data, not the course's three types |
| 67 | q8-8 | R22 p.631 | OVERCLAIM (context) | F10 |
| 68 | q8-9 | R21 p.511 | OK | — |
| 69 | q8-10 | R21 p.512 | OK | — |
| 70 | q8-11 | R57 p.411 | OK | — |
| 71 | q8-12 | S06 p.166–168 | OK | — |
| 72 | q8-13 | S06 p.168 | OK | Checker behaviour confirmed by probe P2 |
| 73 | q8-14 | S10 sl.87 | **WRONG (keyed answer overstates)** | F01 |
| 74 | q8-15 | S06 p.168 | OK | Error text confirmed by probe P4 |
| 75 | misconception 3 | R57 p.411 (procedures, documents) | WRONG PAGE (partial) | F17 |
| 76 | misconceptions 1, 2, 4, 5 | R62 p.341, 345; R19 p.571; S06 p.168; R21 p.512 | OK | Misconception 2's "chosen by allocation with criteria" is R20c, not R19 (minor). |
| 77 | cautions | R62 p.341 = printed 327; Figures 4a/4b p.573–574 are images; ISO 42010 pointer outside the range | OK | Verified |

## Verified correct

**Numbers (recomputed by hand from `n2.ts`, `reference/week08.ts` and `architecture.ts`)**
- Interface types: 3 physical, 4 information, 2 organisational; external 3, internal 6.
- Degrees: PHY-004 5, PHY-001 3, PHY-002 2, PHY-003 2, PHY-005/007/008 1, EXT ×3 1, PHY-006 0. The sum is 18 = 2 × 9.
- Density: 9 of 55 pairs = 16.4 %. PHY-004 takes part in 5 of 9 interfaces (56 %).
- Alternative A:
  - crossing flows F01, F02, F10–F15, F17, F18 (10 of 19), κ = 0.526;
  - 7 pairs, as listed;
  - D_max = 4 (PHY-001 and PHY-004);
  - pairs with no IF: 001–005 (F17) and 003–004 (F11).
- Alternative B:
  - the internal flows are exactly F06, F16 and F19, so X = 16 and κ = 0.842;
  - 8 pairs; D_max = 5 at PHY-002;
  - with the type-blind rule, the four gaps are as stated. F04 explains why this rule is wrong.
- F03, F04, F05 and F07, F08, F09 all cross PHY-002↔PHY-004 in B.
- Moving only FN-002 or only FN-011 gives X = 14 (0.737) in each case.
- q8-6 arithmetic: degrees A2, B3, C4, D2, E3; 2/4/1 typing.
- q8-8 arithmetic: 0.30 vs 0.45.
- PHY-004 hosts 7 functions.

**Requirements and listings**
- Worked (b) table rows (FN, LOG, PHY, REQ) match the reference.
- REQ-SYS-005 is the 60 s requirement. REQ-STK-002 and REQ-SYS-002 are the 65 dBA limits. VER-002 is the noise measurement. TPM-001 is 18 min and TPM-002 is 63.5 dBA.
- The listings validate as claimed, and the line numbers cited in the lesson (16, 20–26, 23, 24, 25, 28, and 17:33 in the invalid file) are correct.
- The micro-lab key (t1–t9, assertion b) matches the listing. The tokens are pinned by a test.
- Listing 2 realises the ports and conjugation exactly as S10 sl.20–22 describes.
- The checker claims are confirmed by probes:
  - it does not evaluate constraints (P1, P2);
  - the q8-14 and q8-15 diagnostic texts are as quoted (P3, P4).

**Planning documents**
- Session plans sum to 75 + 75. L8 55 + micro-lab 20 matches syllabus §12 and Lab plan L8.
- CP3 scope matches syllabus §11 item for item. Weights RB-6 45 · RB-7 45 · RB-12 10 at 9 % match.
- The defence is 8 × 5 min in Week 9 and informs RB-6.6 and RB-7.4, as B.5 says.
- The workload sums to 10.5 = `WORKLOAD_TARGET[8]`.

**Rules and continuity**
- Rule 1: owner and provenance are present on every recorded element.
- Peer sample IDs INFO-101..105 do not collide with reference IDs. The seeded failures match `PEER_FAILING`.
- Continuity:
  - Week 7 states that CP3 is summative at the end of Week 8, which matches.
  - The continuity paragraph's Week 9 and Week 10 hand-offs (allocate, ports and interfaces, satisfy) match L9 and L10 in the Lab plan.
  - Week 9 is not yet authored, so its side cannot be checked.
- Accessibility: tables have row and column headers; types are written as letters; checks use ✓ / ✗ / ! with words; the micro-lab tokens are buttons with descriptive `aria-label`; controls are wrapped in labels.

**Bridge to MBSE**
- The week genuinely bridges to MBSE. Every artefact is keyed to a SysML construct (action, part, interface, item, perform, allocate, satisfy), with a validated listing for the worked chain.
- The weak point is the false "subject-only" rule and the "model enforces" claim (F01, F02), which mis-teach exactly the semantics Week 10 grades in RB-8.4.
