# Laboratory and Capstone Plan

> **Schedule superseded (2026-10-18).** The week sequence in this plan (labs L1–L13 and checkpoints CP1–CP5 by week) is
> superseded by `COURSE_SCHEDULE.md`, the authoritative faculty schedule (DECISION_LOG A19): team outputs are the
> Systems Thinking Engineering Package (Week 7) and the SysML v2 enterprise model (Week 14). The text below is kept
> unchanged as reviewed source material.

**Status:** PROPOSAL, **revision 1**, 2026-10-09, after external review round 1. Not approved.

**Changes in revision 1:**
- Acceptance criteria are neutral about which SysML checker is used (C1).
- Checkpoint 4 no longer includes behaviour, and its review is now an asynchronous written review using review item discrepancies (RIDs) (M3, M6).
- Model minimums are compared like with like (m12).
- A2 targets are phased (M9).
- Fixes for m6, m14, m16 and m17.

**Contents:**
- §C: the shared identifier scheme, data rules and reference model, used by both pathways.
- Part B: labs and checkpoints for the 14-week course.
- Parts A1 and A2: workshops and labs for the two-course sequence.

**Labels:** official content is marked **[S0x]**; recommendations are marked **[REC]**.

---

## C. Shared capstone infrastructure (both pathways)

### C.1 The case
**AeroLink Urban Mobility** [S04 Lab 2A] is a **fictional** urban air-taxi enterprise (FD-21). It operates eVTOL aircraft between vertiports in one metropolitan region. Its
operations centre, maintenance facility, charging systems and communications infrastructure are listed in S04 Lab 6.

The case is an **enterprise containing systems**, and students are expected to argue whether it is also a system of systems (S11 p.832–835, 866–869).

### C.2 Stable identifier scheme [REC]

*Example IDs revised 2026-10-09 to match the official S04 element lists and the app's instructor reference baseline (`learning-studio/src/model/reference/`).*

| Prefix | Element | Created (B wk / A course-wk) | Example | Re-used in SysML as |
|---|---|---|---|---|
| ENT | Enterprise / system of interest | B1 / A1-1 | ENT-001 AeroLink | top-level package / part |
| EXT | External system or actor | B1 / A1-2 | EXT-001 Air navigation service provider | part or actor |
| STK | Stakeholder | B2 / A1-2 | STK-006 Emergency Responders | part def + `stakeholder` usage |
| CON | Stakeholder concern | B2 / A1-2 | CON-012 Community noise | `concern` |
| NEED | Need statement | B3 / A1-3 | NEED-004 | requirement (stakeholder level) |
| MGO | Mission, goal or objective | B3 / A1-3 | MGO-002 | requirement / doc |
| CAP | Capability | B3 / A1-3 | CAP-003 Fleet charging management | action def or part def (team decision, justified) |
| SCN | Operational scenario | B3 / A1-4 | SCN-005 Weather Disruption | use case / action |
| REQ | Requirement (REQ-STK-nnn stakeholder; REQ-SYS-nnn system) | B4 / A1-5 | REQ-SYS-014 | requirement with short name = ID |
| MOE / MOP / TPM | Measures | B5 / A1-11 | MOP-006 | attribute + metadata (S10 sl.149) |
| TECH | Technology assessed | B6 / A1-7 | TECH-002 Battery cell technology | part def / doc |
| A / R / O / U | AROU items | B1 onward / A1-2 onward | R-009 | metadata (Risk, S10 sl.147) or dependency |
| ALT / CRIT / DEC | Trade alternatives, criteria, decision record | B7 / A1-9 | DEC-001 | analysis / trade study (S10 sl.95) |
| FN | Function (logical) | B8 / A1-10 | FN-011 Dispatch aircraft | action def / logical part |
| LOG | Logical element | B8 / A2-5 | LOG-005 Scheduling | part (logical) |
| PHY | Physical element | B8 / A2-6 | PHY-002 Vertiport | part (physical) |
| IF | Interface | B8 / A1-12 | IF-005 Aircraft ↔ charger power | interface def / connection |
| INFO | Information item | B8 / A1-11 | INFO-004 Weather Data | item def / flow |
| AI | AI-enabled capability | B8 / A1-11 | AI-002 Demand forecasting | part/action + metadata |
| VER | Verification activity | B12 / A1-12 | VER-004 | verification case (method kind per S06 p.540) |

**Rules**
1. IDs are never reused. A retired item keeps its ID with `status = retired` and a reason.
2. Every relationship records `source ID → relationship type → target ID`. Relationship types are restricted to: derives-from, refines, satisfies, allocated-to, verifies, measures, mitigates, affects, performs, flows-to.
3. **In SysML, IDs become short names.**
   - A requirement's short name is its requirement ID (S06 p.165).
   - Hyphenated IDs are not basic names, so they must be written as quoted (unrestricted) names (S06 p.49–50).
   - Course IDs are *human-readable* names. The tool's internal element identifiers are separate and managed by the tool (S06 p.49).
   - The exact form is confirmed in the course-designated checker before release (FD-08).
4. Teaching relationship names that are **not SysML keywords** (derives-from, refines, mitigates, affects) are realised in the model as `dependency`, the Derivation library (`#derivation`), or Cause-and-Effect/Risk metadata. In the S06 reserved-keyword list (p.197, verified), `satisfy`, `verify`, `allocate` and `dependency` are keywords; `derive`, `refine` and `trace` are **not**.
5. Every element has an `owner` (student initials) and a `provenance` tag: `official-S04`, `instructor-fictional`, `team-assumption`, `team-derived`, `AI-suggested-reviewed`, or `cited:<source>`.

### C.3 AeroLink Data Sheet (instructor-issued) [REC]
This sheet lists the parameters teams may need for requirements, measures, trade studies and impact analysis. The parameters are:
- aircraft passenger capacity
- usable battery energy
- reserve energy policy
- typical trip distance
- cruise speed
- charge time to the dispatch threshold
- vertiport pads and chargers
- fleet size
- daily demand profile
- noise limit at the pad edge
- fare
- operating hours
- weather-limit thresholds

The instructor sets the values. **Every value is labelled FICTIONAL. It is chosen for teaching tractability, not taken from any aircraft or regulation.** No such source exists in the collection (FD-10). If faculty approve external public sources, values may be replaced with cited ones, and the provenance tag changes accordingly.

### C.4 Instructor reference model [REC]
The instructor maintains a reference AeroLink package (A1 level) and model (A2/B level). It is used for:
- worked examples;
- the practical exam (a variant with seeded defects);
- a recovery input for any team whose earlier work is unusable, or for A2 students without A1.

It must be complete, accepted by the course-designated checker, and itself pass the RB-8 and RB-9 checks before term starts.

### C.5 Model minimums by pathway

| Element | A2 official [S02] | Pathway B [REC] | B as share of A2 |
|---|---|---|---|
| Stakeholders | 20+ | 12+ | 60 % |
| Capabilities | 10+ | 5+ | 50 % |
| Requirements | 30+ | 15–20 | 50–67 % |
| Logical elements | 10+ | 6+ (functions) | 60 % |
| Physical elements | 10+ | 6+ | 60 % |
| Operational scenarios | 5+ (modelled as behaviour) | 3 documented; 1 modelled as behaviour | 20 % (modelled) |
| Risks | 10+ | ≥ 4 risks (within ≥ 8 AROU entries, ≥ 1 each of A, O, U) | 40 % |
| Verification activities | 5+ | 3+ modelled verification cases | 60 % |
| AI capabilities | 4+ | 2+ | 50 % |
| Complete 11-link threads | not specified; [REC] ≥ 5 (FD-13) | ≥ 3 | 60 % |

---

# Part B: Laboratories and checkpoints (14-week course)

All labs are team labs (3–4 students). "In" means in-class minutes; "Out" means out-of-class hours per student.

| Lab | Wk | Objective | Inputs | Tasks | Outputs (IDs) | Acceptance criteria | Time | Tool | Rubric |
|---|---|---|---|---|---|---|---|---|---|
| L1 Context & causal loops | 1 | Bound the system and expose dynamics | Case brief; Data Sheet | (1) Choose and justify the system of interest; (2) context diagram with ≥ 6 external systems/actors; (3) two causal loops with polarity; (4) one emergent behaviour explained; (5) team charter with roles | ENT, EXT-nnn; loop diagram; charter | Boundary stated in one sentence; every loop arrow has a polarity; the emergent behaviour cannot be attributed to a single element | In 75 / Out 2.5 | Whiteboard or any drawing tool | RB-1.1, RB-1.4 causal-argument clause (formative) |
| L2 Stakeholder ecosystem map | 2 | Identify and characterise stakeholders | L1 | (1) Brainstorm (AI allowed, tagged); (2) classify into ≥ 4 classes; (3) interests, concerns, influence/interest rating with rationale; (4) relationships among stakeholders; (5) AROU v0 (≥ 4 entries) | STK (≥ 12), CON, A/R/O/U | ≥ 12 STK incl. the 6 external entities of S04 Lab 2A; each has interest + concern + rating + rationale; ≥ 5 stakeholder–stakeholder relationships | In 75 / Out 2.5 | Spreadsheet + diagram | RB-1 |
| L3 Needs → capabilities; scenarios | 3 | Move from concerns to needs, capabilities and operations | L2 | (1) Mission/goals/objectives; (2) ≥ 8 solution-free needs, each tracing to ≥ 1 STK/CON; (3) ≥ 5 capabilities, ≥ 2 decomposed; (4) three scenarios (nominal, weather, charging/maintenance): actors, preconditions, steps, alternate flows, end state | MGO, NEED, CAP, SCN (official S04 Lab 7 IDs: SCN-002 nominal transport, SCN-005 weather disruption, SCN-003 charging / SCN-004 maintenance) | No need names a solution; every capability traces to a need; each scenario has ≥ 1 alternate flow | In 75 / Out 3.5 | Document + table | RB-2 → **CP1** |
| L4 Requirements writing studio | 4 | Draft requirements | CP1 | (1) Stakeholder requirements from needs; (2) system requirements; (3) rationale, verification method and parent for each; (4) type classification | REQ-STK, REQ-SYS (15–20) | Every requirement has one "shall", a measurable criterion (or a TBD with an AROU entry), a rationale, a method and a parent | In 75 / Out 3 | Requirements table | RB-3 (formative) |
| L5 Peer audit; measures (+ SysML reading micro-lab 1, 20 min) | 5 | Improve quality; define measures | L4 | (1) Cross-team audit of 10 requirements against the characteristics checklist (S12 p.144), AI critique allowed with an accept/reject reason; (2) revise; (3) ≥ 3 MOE, ≥ 5 MOP, ≥ 2 TPM with threshold and margin; (4) trace table | Audit report; MOE/MOP/TPM; trace table | The audit cites the characteristic for each finding; every MOP links to an MOE and ≥ 1 REQ | In 75 / Out 3 | Spreadsheet | RB-3, RB-4 |
| L6 TRL & AROU; SRR-style review | 6 | Assess maturity and risk; review | L5 | (1) TRL for 3 TECH with evidence or labelled assumption; (2) ≥ 8 AROU entries; risks as condition–if–then, rated 5×5, with handling; (3) **in class:** live SRR-style review, 8 teams × 7 min, against adapted SRR criteria (R40). Items (1)–(2) are prepared **before class**. Micro-lab 2 is online | TECH, A/R/O/U; review record | Each TRL cites evidence or an assumption ID; each risk has an owner and a treatment; review findings are actionable | In 75 / Out 3.5 | Spreadsheet | RB-5 → **CP2** |
| L7 Trade study | 7 | Decide under uncertainty | CP2 | (1) Decision statement (S04 Lab 11 or approved alternative); (2) ≥ 3 ALT incl. baseline; (3) ≥ 4 CRIT traced to MOE; (4) value scales; (5) swing weights with rationale; (6) scores; (7) sensitivity on the top 2 weights, reporting the rank-reversal point; (8) recommendation (DEC) | ALT, CRIT, DEC | Additive model computed correctly (instructor spot-check); sensitivity reported; recommendation states its conditions | In 0 (exam week) / Out 3.5 | Spreadsheet | RB-6 |
| L8 Architecture concept (+ micro-lab 3, 20 min) | 8 | Multi-viewpoint architecture | CP2, L7 | (1) Operational view (from SCN); (2) ≥ 6 FN decomposed from CAP; (3) ≥ 6 PHY (incl. S04 Lab 6 elements); (4) FN→PHY allocation matrix; (5) N² with ≥ 5 IF (physical, information, organisational); (6) information flows for ≥ 3 INFO with producer, consumer and decision; (7) ≥ 2 AI capabilities | FN, PHY, IF, INFO, AI | Every FN is allocated; every IF has a type and both ends; every INFO names the decision it supports | In 75 / Out 3.5 | Diagram + matrices | RB-7 → **CP3** |
| L9 Tool onboarding; model skeleton | 9 | First valid model | CP1–CP3 | (1) Install/verify the tool; (2) package structure (Context, Stakeholders, Needs, Requirements, Logical, Physical, Behavior, Verification, AROU); (3) artifact-to-package mapping table; (4) part defs/usages for ≥ 6 PHY with typed attributes (units from the quantities library) | Model v0.1; mapping table | **Accepted by the course-designated checker** (zero errors); names follow the conventions; IDs present as short names | In 75 / Out 3 | Course-designated checker / tool (FD-08) | RB-8.1–8.2 |
| L10 Requirements & structure | 10 | Requirements and structure in the model | L9 | (1) All CP2 REQ as SysML requirements with subject and ID; (2) logical and physical parts with ≥ 3 port/interface definitions and connections; (3) `satisfy` for every REQ-SYS (or a recorded gap); (4) `allocate` FN→PHY | Model v0.2 | Accepted by the checker; each `satisfy` targets a design element of the right kind; allocation matches CP3 or the change is recorded | In 75 / Out 3.5 | Tool | RB-8 |
| L11 Behaviour (formative); RID review | 11 | Behaviour in the model; model review | L10 | (1) SCN-001 as an action flow with ≥ 1 decision (formative; graded in CP5). (2) Operating-state definition (≥ 4 states, ≥ 5 transitions). (3) Perform/exhibit links to structure. (4) **Submit CP4** (requirements, structure, allocation). (5) Asynchronous RID review of one other team's CP4 model: ≥ 5 RIDs with severity and fix, within days 1–3 of Week 12 | Model v0.3; RID set given | CP4 accepted by the checker; RIDs scored with RB-17. **Fallback (review N11):** if a peer team's RIDs are late, the receiving team works from the instructor's RIDs alone; late RIDs score 0 on RB-17.3. Instructor load ≈ 30 min × 8 teams ≈ 4 h within 3 days | In 75 / Out 4 | Tool | RB-8, RB-17 → **CP4** |
| L12 Verification & thread audit | 12 | Close the loop | CP4 | (1) Verification cases for ≥ 3 REQ (method, objective, verdict logic); (2) MOE/MOP in the model; (3) trace audit: % REQ with parent, satisfy, verify; list orphans and childless parents; (4) complete ≥ 3 full threads; (5) disposition the RIDs received | Model v0.4; audit report; RID dispositions | Audit numbers are reproducible from the model; the 3 threads traverse all 11 link types | In 75 / Out 3.5 | Tool | RB-9, RB-10 |
| L13 Impact analysis | 13 | Use the model to answer a question | L12 | (1) Choose one S04 Lab 13 question; (2) compute the impact set by traversal; (3) assess affected requirements, verification and risks; (4) recommendation; (5) evolution note for autonomous operations (S04 Lab 14, awareness) | Impact report; DEC | Impact set is derived from model relationships (method shown), not a free-text guess | In 0 (exam week) / Out 3 | Tool | RB-9.5 → **CP5** |

### B.4 Team-hour budget per checkpoint (estimate)

Team-hours = students × out-of-class project hours in the window + in-class lab time. Basis: team of 4 and the lab "Out" estimates above.

| CP | Weeks | ≈ Team-hours available | Main scope | Judgement |
|---|---|---|---|---|
| CP1 | 1–3 | 4 × (2.5 + 2.5 + 3.5) + 3 × 1.25 × 4 ≈ 49 | 12 STK, 8 NEED, 5 CAP, 3 SCN, AROU v1 | Feasible |
| CP2 | 4–6 | 4 × (3 + 3 + 3.5) + 15 ≈ 53 | 15–20 REQ, measures, TRL × 3, AROU v2, review | Feasible; Week 6 is the peak |
| CP3 | 7–8 | 4 × (3.5 + 3.5) + 5 ≈ 33 | Trade study + architecture concept | Tight; trade data comes from the Data Sheet to avoid research overhead |
| CP4 | 9–11 | 4 × (3 + 3.5 + 4) + 15 ≈ 57 | Requirements, structure and allocation model; behaviour drafted (formative); RIDs given | Feasible if the checker works from Week 9 (main risk, C1). **Untested** until the instructor reference model is built and timed (FD-08) |
| CP5 | 12–14 | 4 × (3.5 + 3) + 10 ≈ 36 + review prep | Behaviour finalised; verification; 3 threads; impact; RID dispositions; review | Tight. Bounded by the thin-thread rule and by the FD-22 trigger (action flow only; 2 threads) |

### B.5 Learning evidence per milestone

| CP | Evidence the instructor must see | CLO evidenced | Rubric criteria |
|---|---|---|---|
| CP1 | A justified boundary; a stakeholder map with ratings and rationale; needs free of solutions; capability decomposition; three scenarios incl. alternates; AROU v1; AI statement | B-CLO1, B-CLO2, B-CLO6 | RB-1, RB-2, RB-12 |
| CP2 | Requirements set with rationale, methods and parents; audit response log; measures hierarchy; TRL evidence; 5×5 risks with treatment; SRR review record (given and received) | B-CLO2, B-CLO3, B-CLO6 | RB-3 (3.6 counts for B-CLO6), RB-4, RB-5, RB-12 |
| CP3 | Trade-study workbook with sensitivity; recommendation; architecture views; allocation; N²; information flows; 5-minute defence | B-CLO3, B-CLO4, B-CLO6 | RB-6, RB-7, RB-12 (the Week-9 defence informs the RB-6.6 and RB-7.4 scores) |
| CP4 | Checker log showing zero errors; requirement and structure packages; allocation; RID set given to another team | B-CLO4, B-CLO6 | RB-8, RB-17, RB-12 |
| CP5 | Final model incl. behaviour; trace audit; 3 complete threads demonstrated live; ≥ 3 verification cases; impact analysis; evolution note; RID dispositions; 16-minute review with individual Q&A | B-CLO4, B-CLO5, B-CLO6 | RB-8, RB-9, RB-10, RB-11 (RB-11.5 scored individually) |

### B.6 Final model review and presentation criteria (CP5)
**Entry criteria** (adapted from S12 PDR p.75–82 and S02 Week-15 focus):
1. Model accepted by the course-designated checker.
2. Every CP4 RID has a disposition.
3. Trace audit attached.
4. AROU current.
5. AI Usage Statement attached.

**Conduct**
- 10 minutes of presentation, including **live navigation of one complete thread**.
- 6 minutes of panel Q&A, with ≥ 1 question per student on elements that student owns.
- 2 minutes of changeover. Eight teams take 144 of the 150 minutes in Week 14's two sessions.

**Exit:** the panel records findings, and the grade uses RB-11 together with RB-8, RB-9 and RB-10 applied to the submitted model.

**Presentation must show:**
- model purpose and scope;
- one decision and its evidence;
- the thread demonstration;
- the impact-analysis result;
- top 3 risks;
- what the team would do next;
- one slide for a non-technical reviewer.

---

# Part A1: Project workshops (Foundations of Systems Thinking)

Workshops are in-class (75 min) coaching sessions. Each one produces the first draft of the deliverable due that week **[S01]**. Contents follow **[S03]** "Required Contents". Acceptance criteria are **[REC]**.

| W | Wk | Deliverable [S01] (S03 contents) | Workshop tasks [REC] | Acceptance criteria [REC] | Rubric |
|---|---|---|---|---|---|
| W1 | 1 | Team formation | Charter; roles; context diagram; causal loop | Charter signed; boundary stated | RB-1.1, RB-1.4 causal-argument clause (formative) |
| W2 | 2 | Stakeholder Ecosystem Map (identification, categories, relationships, interests, initial AROU) | Map with IDs; ratings; AROU v0 | ≥ 20 STK (to meet the A2 minimum later), including the 6 external entities of S04 Lab 2A | RB-1 |
| W3 | 3 | Needs & Capability Analysis (needs, hierarchy, mission objectives, capability analysis and decomposition, AROU) | Needs hierarchy; capability tree | Needs solution-free; capabilities traced | RB-2.1–2.3 |
| W4 | 4 | ConOps (mission, environment, scenarios, user interactions, constraints) | Storyboards; scenario tables | ≥ 5 scenarios (the S04 Lab 7 list), incl. off-nominal, collected as a named **Operational Scenarios Package**, which S02 expects as input (review m17) | RB-2.4 |
| W5 | 5 | Requirements Draft | Writing studio | **≥ 30** requirements (within S03 D4's 25–40, so that A2's 30+ is met), each with rationale, method and parent | RB-3 (formative) |
| W6 | 6 | Requirements Package (stakeholder, operational, performance, constraints, rationale, AROU) | Peer audit; RTM | Audit log; RTM complete | RB-3 |
| W7 | 7 | Technology Assessment (descriptions, benefits, limitations, maturity, enterprise impacts, AI insights and critique) | TRL evidence table | Each TECH has a TRL with evidence or an assumption | RB-5.1–5.2 |
| W8 | 8 | Technology Risk Assessment; **AROU Register graded here** [REC]. S01 weights the register at 2 % but sets no due week (FD-26) | 5×5 rating; handling | Condition–if–then form; owners | RB-5.3–5.5 |
| W9 | 9 | Trade Study (alternatives, criteria, weighted matrix, sensitivity, recommendation) | Swing weights; sensitivity | Rank-reversal point reported | RB-6 |
| W10 | 10 | Architecture Concept (operational, functional, physical, enterprise perspectives; interactions) | Viewpoint set; allocation | Each viewpoint states its purpose | RB-7.1–7.4 |
| W11 | 11 | Measures Framework (MOE, MOP, definitions, rationale, relationship to requirements); Information View (producers, consumers, flows, data vs information, decision support, AI interactions) | Measures tree; information flows | Each MOP → MOE → NEED; each INFO → decision | RB-4, RB-7.5–7.6 |
| W12 | 12 | Interface Inventory (physical, information, organisational, external); Verification Strategy (methods, validation, MOE/MOP alignment, approach) | N²; verification matrix | Every REQ has a method; validation tied to MOE | RB-7.3, RB-10 |
| W13 | 13 | Known Unknowns; Risk, Security & Resilience; Enterprise Evolution Roadmap | Resilience scenarios (S11 p.1209–1210 pattern); roadmap | Near/mid/long states; technology insertions dated | RB-5, RB-15 |
| W14 | 14 | Draft Enterprise Package + **ID register** [REC] | Integration; consistency check | All IDs resolve; no dangling references | RB-9.4 (formative) |
| — | 15 | Final package & executive presentation [S01/S03 D16] | Rehearsal | 15–20 min [S03] | RB-11 |

# Part A2: Laboratories (Model-Based Systems Integration)

Labs are **[S04]**. Acceptance criteria and time budgets are **[REC]**.

- **Checker:** every model submission must be accepted by the course-designated checker (FD-08). Until one is designated, the instructor reviews syntax against the course errata sheet.
- **Peer review:** each major lab goes through the S02 peer-review cycle.
- **Time budget:** about 75 min in class plus 3.5–4.5 h out of class per student, per lab.
- **Phasing:** Lab 7 (behaviour) is the heaviest, so its scenarios 4–5 roll into Week 8. The other interim targets are phased as set out in Part A2 of the weekly plan.

| Lab [S04] | Wk | Official content (abridged) | Acceptance criteria [REC] | Rubric |
|---|---|---|---|---|
| 1A/1B | 1 | Repository, packages, naming standards, conventions; artifact-to-model mapping matrix | Naming conventions written and applied; every A1 artifact mapped | RB-8.1–8.2 |
| 2A/2B | 2 | Enterprise context (AeroLink, passengers, FAA, investors, communities, vertiport operators, emergency responders); stakeholder relationships, objectives, concerns | ≥ 12 STK now, ≥ 20 by the Week-5 review; concerns modelled; accepted by the checker | RB-8 |
| 3A–3C | 3 | Needs; capability hierarchy; requirements v1 import | ≥ 10 CAP; ≥ 15 REQ with IDs now, ≥ 30 by the Week-5 review | RB-8, RB-3 (re-check) |
| 4A/4B | 4 | Requirements architecture; AI quality assessment (ambiguity, duplication, conflicts, gaps) | AI findings accepted or rejected with reasons | RB-3, RB-12.3 |
| 5 | 5 | Logical architecture (flight ops, fleet mgmt, maintenance mgmt, customer services, scheduling, decision support) | ≥ 10 LOG; interfaces defined | RB-8 → SRR-style review |
| 6 | 6 | Physical architecture (eVTOL, vertiports, charging, ops centre, maintenance facility, comms); AI-generated alternatives | ≥ 10 PHY; allocation complete; alternative assessment | RB-8, RB-12 (critical evaluation of AI-generated alternatives) |
| 7 | 7 | Scenarios: ride request, transport mission, charging, maintenance event, weather disruption | 3 behaviours now, all 5 by Week 8; consistent with the ConOps | RB-8 |
| 8 | 8 | Information (passenger, flight, maintenance, weather, financial data); producers, consumers, AI interactions | Every INFO has producer/consumer; ≥ 4 AI capabilities | RB-7.5–7.6, RB-8 |
| 9 | 9 | Digital thread Need → Capability → Requirement → Logical → Physical → Information; traceability matrix | Audit numbers reproducible | RB-9 |
| 10 | 10 | MOEs, MOPs, verification methods and relationships | ≥ 5 verification activities; every REQ has a method | RB-10 → PDR-style review |
| 11 | 11 | Trade study (additional aircraft vs vertiports, or approved); AI-generated alternatives | Swing weights; sensitivity; model-linked criteria | RB-6, RB-12 |
| 12 | 12 | Assumptions, risks, opportunities, unknowns linked to requirements, architecture and operations; impact chains | ≥ 10 risks linked to elements | RB-5.5, RB-9.5 |
| 13 + 14 | 13 | Model query and impact (battery range, demand ×2, regulation change); autonomous flight operations added | Impact sets derived from relationships; evolution updates consistent | RB-9.5 |
| 15 | 14 | Views for engineering, operations, investors, regulators and the board; AI-drafted narratives | Each view states viewpoint and concern; narratives verified against the model | RB-11.4, RB-12 |
| 16 | 15 | Final integrated model; live navigation; executive Q&A | Entry criteria as in B.6, scaled to the S02 minimums | RB-8, RB-9, RB-10, RB-11 |

---

## Source traceability
- Case and labs: S04 (all lab content), S03 (A1 contents), S02 (minimums, chain, reviews, peer-review process).
- Review criteria: S12 §3.2, §3.4.
- SysML facts: S06 p.49–50 (names), p.165 (requirement ID as short name), p.197 (keywords, verified), p.540 (method kinds); S10 sl.95, 147, 149 (trade, risk, MOE/MOP metadata).

## Assumptions
- A SysML v2 tool is available. Teams of 4. The instructor reference model exists before term.

## Decisions requiring approval
FD-08, FD-10, FD-13, FD-14, FD-21, FD-24.

## Known limitations
- Budgets are estimates.
- The quoted-short-name form follows the grammar on S06 p.49–50, but no parser has checked it yet. No tool is installed on this machine, and installing one needs approval (FD-08).
- The "feasible" judgements in B.4 and A2 stay untested until the instructor reference model has been built and timed.
- The Data Sheet values are not yet set.
