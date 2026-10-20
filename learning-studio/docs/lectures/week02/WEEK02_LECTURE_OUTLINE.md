# Week 2 Lecture Outline: ConOps / Requirements

**Status.** Draft outline for faculty review (COURSE_PRODUCTION_PLAN M2, "source-grounded outlines for Weeks 2–14"). Written 2026-10-19. Not yet independently reviewed. Nothing here changes `src/`.
**Governing documents.** DECISION_LOG A19 and A20; `COURSE_SCHEDULE.md` (Week 2 subject, exact; reuse map: old Week 3 ConOps and scenarios, old Weeks 4–5 requirements, quality, traceability, measures); `COURSE_PRODUCTION_PLAN.md`; the Week 1 template and its lessons (`../week01/REVIEW_DISPOSITIONS.md`).
**Format.** Two sessions of 75 minutes, each planned as 69 minutes of content plus a recorded 6-minute buffer, plus a generated "References and credits" slide (0 min).
- Session 1 (all lecture): 23 slides, 69 min.
- Session 2: 16 lecture slides (47 min) and 4 laboratory-launch slides (22 min), 69 min.
- Total: 43 content slides plus 2 references slides.

## 0. Conventions used in this outline

- **Citations.** `R13 p.558` = verified register entry R13, PDF page 558 (SEBoK pages are PDF indices, DECISION_LOG W1). `P2-1 p.1469` = a **proposed register addition** listed in §9; its page text was checked for this outline but it is not yet in `readings.py`. Week 1's P-numbers are now register IDs (R91–R99, R39c–R39l, R48a/b, R65), and are cited by those IDs. Every page cited was opened in `_source_cache/*.txt` for this outline; a citation supports only the claim beside it.
- **Course convention** marks content the collection does not supply (templates, minimums, field sets, ID prefixes). It is taught as the course's choice.
- **AeroLink** is FICTIONAL. Values come from `src/model/airtaxi.ts`, `src/model/reference/week03.ts` (MGO, CAP, SCN, A-008), `week04.ts` (REQ-STK-001..010, REQ-SYS-001..010, U-002), `week05.ts` (MOE, MOP) and the corrected case module `src/content/lectures/week01/aerolinkCase.ts` (STK-001..015, CON-001..017, NEED-001..017 in SEBoK form, corrected external-system names, the noise agreement). Nothing is retyped from memory. A value not yet in `src/` is marked **(proposed, instructor to confirm)**.
- **Lessons carried from Week 1** (`REVIEW_DISPOSITIONS.md`): every session is 69 + 6 min; spoken notes stay at or below 130 words per minute (the minutes below are sized for that); every definition is quoted only from a verified page; course conventions are labeled on the slide; needs are always shown in SEBoK form ("The [stakeholders] need the [system] to …", R11 p.555); **slide faces carry short citations only and no internal IDs** (no RB-, FD-, S01–S04, DECISION_LOG or P-numbers, no objective IDs). Internal IDs appear only in this faculty outline.
- **Quotations** are limited to short definitions. All figures are original drawings, not redraws of SEBoK or MITRE figures.

## 1. Learning objectives (graduate level)

IDs W2.1–W2.5 are kept from `course.ts` (provisional). W2.6 and W2.7 are proposed additions. TPM moves to Week 3 (see §10, item 2).

| ID | Objective | Bloom | Taught in |
|---|---|---|---|
| W2.1 | Construct a ConOps for the team's enterprise: mission, operational environment and constraints, user interactions, and at least three operational scenarios (nominal, off-nominal, support) with actors, trigger, preconditions, main flow, alternate flows and end states | Create | S1.5–S1.16; lab |
| W2.2 | Distinguish needs, stakeholder requirements and system requirements, and analyze why the transformation between them is an engineering analysis, not a rewording | Analyze (was Understand) | S1.4, S1.20–S1.22; S2.5 |
| W2.3 | Write well-formed requirements, each with one obligation, a measurable criterion or a tracked TBD, a type, a rationale, a parent and a verification method | Create | S2.2–S2.10 |
| W2.4 | Trace requirements to needs and capabilities in both directions, and find and disposition orphans and childless parents | Analyze | S2.11–S2.12 |
| W2.5 | Define measures of effectiveness and measures of performance for the key needs and requirements, with data source and threshold | Apply | S2.14–S2.15 |
| **W2.6 (new)** | Derive capabilities from needs and relate each capability to the scenarios that exercise it | Apply / Analyze | S1.17–S1.19 |
| **W2.7 (new)** | Evaluate a scenario set for coverage of the needs and a requirement set against the sourced characteristics, and defend each finding | Evaluate | S1.13, S1.16; S2.10, S2.12; applied exercise |
| Graduate | Apply MITRE's system-level requirements checklist (R55 pp.368–370) to the team's set and write a one-page finding memo | Evaluate | Graduate task (§6.3) |

## 2. Session 1: From needs to operations: ConOps, scenarios and capabilities (69 min + 6 buffer)

**Design rationale.** Week 1 ended with an integrated set of needs. Session 1 shows how a ConOps and its scenarios put those needs into operation, expose needs that were missed, and yield the capabilities that requirements will be written against. It closes by setting up the two requirement levels, so that Session 2 can teach writing and checking requirements. Teach first (A20): the AeroLink scenario is worked in full before teams draft their own.

### Section A: Framing (8 min)

#### S1.1 Week 2 at a glance (1 min)
- **Purpose.** Orient: subject, sessions, outputs.
- **Content.** Subject exactly as scheduled: *ConOps / Requirements*. Session 1: ConOps, scenarios, capabilities. Session 2: writing, checking and tracing requirements; measures; lab launch. Week outputs: ConOps with scenarios; capabilities; stakeholder and system requirements traced to needs; MOE and MOP.
- **Figure.** The Week 1 five-box band, dimmed, with three new boxes appended: "ConOps and scenarios" → "Capabilities" → "Requirements and measures". A bracket reads "Week 2 additions to your package". Faint boxes to the right: "Week 9: requirements in SysML v2", "Week 10: scenarios as behavior".
- **Sources.** COURSE_SCHEDULE.md (subject, output). Course convention (package framing).

#### S1.2 Driving question: our needs are well formed, so can we write requirements now? (3 min)
- **Purpose.** Create a need to know; elicit a prediction.
- **Content.** AeroLink has 17 needs in SEBoK form (Week 1). A team member proposes to go straight to "shall" statements. Vote: (A) yes, the needs are complete; (B) first describe how the service will be operated; (C) first choose the technology; (D) cannot tell. Answer withheld to S1.21.
- **Figure.** The 17 need cards in a stack, an arrow labeled "shall?" jumping straight to an empty requirements table; a dashed detour labeled "?" passes through a storyboard frame.
- **Sources.** Instructor-authored. Need count from `aerolinkCase.ts` (NEEDS).

#### S1.3 Where Week 2 sits in the process frame (2 min)
- **Purpose.** Locate the week.
- **Content.** In the 15288:2015 technical processes as listed by SEBoK, System Requirements Definition is the third process, after Business or Mission Analysis and Stakeholder Needs and Requirements Definition (R98 p.1001). SEBoK: System Requirements Definition transforms the stakeholder view into a technical, developer view; its inputs are the life-cycle concepts and the integrated set of needs (R13 p.557). The operational concept is one of those life-cycle concepts (R10 p.546).
- **Figure.** The 14-cell process strip from Week 1 with cell 3 highlighted "Week 2"; two input arrows into it: "integrated set of needs (Week 1)" and "life-cycle concepts, incl. the ConOps (this week)".
- **Sources.** R98 p.1001; R13 p.557; R10 p.546.

#### S1.4 Retrieval: needs are the black box, requirements the white box (2 min)
- **Purpose.** Spaced retrieval of the central Week 1 distinction.
- **Content.** Needs communicate the stakeholder's expectations from an external, black-box view; requirements communicate what the system must do from an internal, white-box view (R13 p.558). One card question: "Is 'The air-taxi service shall keep pad-edge noise at or below 65 dBA' a need or a requirement, and who is speaking?"
- **Figure.** The Week 1 "mirror" figure, small, with NEED-003 on the left and a blank on the right.
- **Sources.** R13 p.558. NEED-003 from `aerolinkCase.ts`.

**Transition A → B.** "Before we say what the system shall do, we describe how it will be used, by whom, and when things go wrong."

### Section B: The concept of operations (15 min)

#### S1.5 What a ConOps is, and why it comes before requirements (3 min)
- **Purpose.** Define the artifact from the source and give its purpose.
- **Content.**
  - MITRE: a CONOPS is a user-oriented document that describes system characteristics for a proposed system from a user's perspective, and the user organization, mission and objectives (R52 p.298, short quotation).
  - Purpose: describe the user's operational needs, desires, visions and expectations without being overly technical or formal, and without addressing the technical solution; it is often a first step for developing system requirements (R52 p.299).
  - It should define critical top-level performance objectives with their rationale, and be updated after testing to show how the system will actually be used (R52 p.299).
- **Figure.** A timeline with the ConOps as a living document: drafted at concept, updated after developmental and operational testing; arrows from it to "requirements" and "test planning".
- **Sources.** R52 pp.298–299.

#### S1.6 Three names for related things: ConOps, operational concept, OpsCon (3 min)
- **Purpose.** Honest terminology, so students can read the sources.
- **Content.**
  - SEBoK glossary, Concept of Operations: a verbal and graphic statement, in broad outline, of an organization's assumptions or intent in regard to an operation or series of operations (ISO/IEC 29148 via SEBoK); often embodied in strategic and annual plans (**P2-1 p.1469**).
  - SEBoK glossary, Operational Concept: the same form of statement, but for the operation of a system or related set of systems, from the users' and operators' perspective (R39g p.1579). SEBoK notes the two are "slightly different" (P2-1 p.1469).
  - MITRE uses "CONOPS" for the user-oriented document about a proposed system (R52 p.298), close to SEBoK's operational concept.
  - **Course convention.** The team's Week 2 "ConOps" is a system-level operational concept for the system of interest inside the team's enterprise, written from the users' and operators' perspective (MITRE's sense).
- **Figure.** A two-level diagram: an enterprise-level band labeled "concept of operations (organization's intent)" over a system-level box labeled "operational concept / CONOPS (how this system is used)"; the team deliverable sits in the lower box.
- **Sources.** **P2-1 p.1469**; R39g p.1579; R52 p.298. Course convention.

#### S1.7 What every ConOps must contain (3 min)
- **Purpose.** Give the required content and the reasons.
- **Content.**
  - MITRE's critical components (from IEEE Std 1362-1998): the existing system the user wants to replace; the justification for a new or modified system, with its restrictions; a description of the proposed system; scenarios of use in the user's environment, including internal and external factors (R52 p.301).
  - Additional objectives: end-to-end traceability between operational needs and source requirements; a basis for requirements and for system-level test planning; a basis for computing system capacity; validating and discovering implicit requirements (R52 p.301).
  - **Course deliverable contents** (course convention, from the course deliverable specification): enterprise mission, operational environment, operational scenarios, user interactions, operational constraints.
- **Figure.** A ConOps "table of contents" with each section tagged by the objective it serves (traceability, test basis, capacity, implicit requirements).
- **Sources.** R52 p.301. Course convention (deliverable contents). IEEE Std 1362-1998 is not in the collection (source gap, §8).

#### S1.8 Writing it well: user's language, environment, constraints (3 min)
- **Purpose.** The craft of the document.
- **Content.** MITRE best practices: the user's perspective and language, with a glossary for user jargon; simple and clear; graphics (use cases, sequence or activity charts, storyboards and others); describe the operational environment in detail (assumptions, constraints, numbers, capacity); describe the physical environment, safety, security and privacy aspects that influence operation (R52 p.302). The user may state a need such as "highly reliable" without a testable value; quantifying it is the buyer's or developer's job (R52 p.302).
- **Figure.** A "before/after" paragraph pair: an engineer-jargon description of AeroLink dispatch versus the same content in a passenger's and an operator's words, with a glossary call-out.
- **Sources.** R52 p.302.

#### S1.9 The AeroLink ConOps at a glance (3 min)
- **Purpose.** Show the whole artifact before its parts.
- **Content.**
  - Mission MGO-001 and the problem statement (proposed) from Week 1.
  - Operational environment: 6 vertiports, 12 aircraft of 4 seats, a 16 h day (06:00–22:00, proposed clock times), 25 km typical trip at 150 km/h, 20 min charge to the dispatch threshold, 20 % energy reserve, 65 dBA per event at the pad edge plus noise-sensitive hours and an event cap (proposed).
  - External systems: EXT-001 Controlled airspace (air traffic service), EXT-002 Electric grid, EXT-003 Weather, EXT-004 Aircraft and spares supply, EXT-005 Public transport network, EXT-006 Emergency response service.
  - The five scenarios SCN-001..005 (Passenger Ride Request; Passenger Transport Mission; Aircraft Charging; Maintenance Event; Weather Disruption).
- **Figure.** A one-page "OV-1-style" storyboard (original): network of six vertiports, an aircraft on a 25 km leg, the operations center, the grid, weather, airspace and public transport, with the five scenario numbers placed where each occurs. (The OV-1 label is MITRE's example of a tool for recognizing external interfaces, R54 p.331; the drawing is original.)
- **Sources.** `aerolinkCase.ts` (MISSION_GOALS, PROBLEM_STATEMENT, CASE_FACTS, NOISE_AGREEMENT, EXTERNAL_SYSTEMS); `airtaxi.ts` (DATA_SHEET, OFFICIAL_ELEMENTS.scenarios). R54 p.331 (OV-1 named). FICTIONAL.

**Transition B → C.** "The ConOps becomes something we can analyze when it is broken into scenarios."

### Section C: Use cases, scenarios and mission threads (12 min)

#### S1.10 Use cases, actors and threads (3 min)
- **Purpose.** Define the parts of a scenario from the sources.
- **Content.**
  - A use case defines a goal-oriented set of interactions between external actors and the system; actors are parties outside the system (classes of users, roles, other systems); a primary actor has a goal that needs the system's help; a secondary actor is one from which the system needs help (R59 p.453).
  - A mission scenario or thread is one path through a use case (R59 p.452). Mission threads drive the architecture and are the basis for test cases (R59 p.453).
  - SEBoK glossary: operational scenario, "description of an imagined sequence of events that includes the interaction of the product or service with its environment and users" (ISO/IEC 29148 via SEBoK); used to evaluate requirements and design and to verify and validate the system (**P2-2 p.1581**). Use case: description of the behavioral requirements of a system and its interaction with a user (**P2-3 p.1669**).
- **Figure.** A boundary box (the system of interest) with a primary actor on the left and a secondary actor on the right; one use case oval inside, three thread lines through it (main, alternate, failure).
- **Sources.** R59 pp.452–453; **P2-2 p.1581; P2-3 p.1669**.

#### S1.11 Anatomy of a scenario (3 min)
- **Purpose.** Give the template students will fill.
- **Content.**
  - From MITRE: paths run from a trigger event to the goal (success scenarios) or fall short of it (failure scenarios); steps are simple and in the user's language; use cases specify intent, not user-interface or implementation detail (R59 pp.453–454).
  - **Course template** (course convention, from the reviewed scenario builder): actors with the primary actor marked and environmental factors marked "(environment)"; trigger; preconditions; a main flow with an actor on every step; alternate flows that each branch from a step and rejoin or end; separate success and failure end states.
  - **State the scenario system of interest.** Actors are outside it (R59 p.453), so the boundary decides who is an actor.
- **Figure.** An annotated scenario card with the seven fields; arrows mark "branch from step 3, rejoin at step 5" and the two end states.
- **Sources.** R59 pp.453–454. Course convention (field set).

#### S1.12 Which scenarios? Coverage across the life cycle and off-nominal cases (3 min)
- **Purpose.** Avoid the "sunny-day only" ConOps.
- **Content.**
  - SEBoK: operational concepts include high-level modes or states, operational scenarios, potential use cases, misuse cases and loss scenarios (R10 p.546). Elicitation covers nominal and off-nominal use cases, misuse cases and loss scenarios (R11 p.553).
  - MITRE: mission threads can describe operational, logistics, support, maintenance, training, test and development operations (R59 p.453).
  - Completeness aid: keep a list of ways the system may be parameterized (importance of actors, types of input, future modes, good actors doing bad things, exceptional circumstances) and iterate the use cases against it (R59 p.456).
  - Stopping rule: you have enough use cases when the users, sponsor and other stakeholders cannot think of any more (R59 p.455).
  - **Course minimum:** at least one nominal, one off-nominal (disruption or failure) and one support scenario (charging, maintenance, training or similar).
- **Figure.** A 3 × 3 grid: rows nominal / off-nominal / support; columns operation / logistics and maintenance / exceptional; the five AeroLink scenarios placed in cells; two empty cells marked "candidate" (a region-wide power cut; a passenger who books and cancels repeatedly).
- **Sources.** R10 p.546; R11 p.553; R59 pp.453, 455–456. Course convention (minimum). Candidate scenarios reused from the reviewed old Week 3 advanced block (instructor synthesis).

#### S1.13 Reviewing a scenario (3 min)
- **Purpose.** Evaluation, not just authoring (W2.7).
- **Content.** MITRE's review questions: is the use case complete; will the actor's goal be met; can a procedural or requirement change simplify it; are actors' goals or actors missing (R59 p.455). Common pitfalls: vague goals, ambiguous scope, nonfunctional requirements and user-interface detail in the text, too few use cases, and "wishful thinking" beyond the operational user's needs (R59 pp.455–456). Do not describe the system's internal workings (R59 p.456).
- **Think-pair-share (1 min).** SCN-001 step 3, "quotes the fare and an estimated boarding time": is that interface detail or intent?
- **Figure.** A review checklist beside SCN-001, with two margin comments (one valid, one a false alarm).
- **Sources.** R59 pp.455–456. SCN-001 from `reference/week03.ts`.

**Transition C → D.** "Now one complete scenario, the hardest one: a bad-weather afternoon."

### Section D: The AeroLink worked example (13 min)

#### S1.14 Worked example I: SCN-005 Weather Disruption, step by step (6 min)
- **Purpose.** Model the full method; students contribute at every field.
- **Content.** Walk the reference scenario field by field (the full text is in §4.2): primary actor (operations center duty manager), actors STK-001, STK-008, EXT-001, and EXT-003 marked as environment; trigger (forecast crosses a weather limit within 30 min; limits TBD-01, U-001); preconditions; seven main steps; alternates A1 (alternate also degrading), A2 (region-wide event; public transport offered, EXT-005), A3 (hold over 2 h); success and failure end states. Before each field is revealed, students propose it.
- **Instructor note.** Name the scenario system of interest on the slide: "AeroLink operational system (aircraft, booking, scheduling and dispatch systems, operations-support tools); operations staff and pilots are users outside it". This is narrower than Week 1's system of interest, the service including its people (SOI-001). It is a deliberate scope choice for scenario writing; say so (Week 1: the system of interest is chosen for a question).
- **Figure.** A swimlane of SCN-005: lanes for duty manager, system, pilot, air traffic service, passenger; weather as a shaded band across the top; alternates drawn as branches with "rejoin" or "end" markers.
- **Sources.** R59 pp.453–454 (structure); SCN-005 from `reference/week03.ts` (FICTIONAL).

#### S1.15 Worked example II: what writing the scenario exposed (3 min)
- **Purpose.** Show that scenarios discover needs, assumptions and unknowns (R52 p.301: "validate and discover implicit requirements").
- **Content.**
  - Step 5 ("notifies affected passengers") exposed NEED-011: "Passengers need the air-taxi service to tell them promptly when a confirmed trip is held, diverted or cancelled, and to offer them a usable way to complete the journey."
  - Alternate A2 relies on public transport carrying passengers onward: assumption A-008, not yet agreed with the transport authority.
  - The trigger depends on unpublished weather limits: unknown U-001, carried as TBD-01 into requirements.
  - Lesson: a scenario is an analysis instrument; every exposed item goes into the needs set or the uncertainty register.
- **Figure.** SCN-005 swimlane, small, with three call-outs pulled out to "NEED-011", "A-008", "U-001 / TBD-01".
- **Sources.** R52 p.301. NEED-011 (`aerolinkCase.ts`); A-008 (`reference/week03.ts`); U-001 (`reference/week02.ts`).

#### S1.16 Worked example III: do the scenarios exercise the needs? (4 min)
- **Purpose.** A coverage check that students will repeat (W2.7).
- **Content.** A needs × scenarios matrix (instructor reading of the reference flows, §4.3). Findings to elicit in pairs:
  - Most operational needs appear in at least one flow (for example NEED-008 in SCN-001 A3 and SCN-002 step 4; NEED-009 in SCN-002 steps 2–3; NEED-010 in SCN-003 step 2).
  - NEED-012 and NEED-016 (sites that conform to the land-use plan and connect to public transport) appear in no operational scenario. They are constraints on siting, verified before operation; that is a reason, not a defect, and it is recorded.
  - NEED-005 (capacity grows with demand) is a planning need, exercised by no daily scenario; it points to a planning scenario or to the Week 3 trade study.
  - NEED-013 (manageable operator workload) is stressed in SCN-005 but no step states how workload is limited: a finding.
- **Figure.** A 17 × 5 matrix, filled cells where a step exercises a need; three highlighted rows (NEED-005, NEED-012, NEED-016) with their recorded reasons; NEED-013 row flagged amber.
- **Sources.** Instructor analysis (course convention for the matrix). Reference flows and needs as above.

**Transition D → E.** "Scenarios show *how* the service is used. Capabilities say *what the enterprise must be able to do* to meet the needs."

### Section E: Capabilities (9 min)

#### S1.17 What a capability is (3 min)
- **Purpose.** Define it from the sources and separate it from feature and function.
- **Content.**
  - SEBoK glossary gives four definitions; the SEBoK-created one: "an outcome or effect which can be achieved through use of features of a system of interest and which contributes to a desired benefit or goal" (**P2-4 p.1457**). SEBoK's illustration: the fingerprint scanner is the feature, storing passwords the capability, saving time and adding security the benefit (**P2-4 p.1458**).
  - SEBoK: the capabilities of an enterprise exist to meet mission and enterprise needs; desired capability is compared with the baseline to find capability gaps (R12 p.862). Example operational capability: "Transport 150,000 passengers per hour among 27 nodes in the network" (R12 p.862).
- **Figure.** A three-step ladder, feature → capability → benefit, with SEBoK's scanner example on the left and an AeroLink rung on the right (high-power hub chargers → return aircraft to dispatch-ready within the turnaround → short, predictable waits).
- **Sources.** **P2-4 pp.1457–1458**; R12 p.862.

#### S1.18 The AeroLink capability tree (3 min)
- **Purpose.** Show derivation and decomposition.
- **Content.** CAP-001..010 from the reference, each derived from needs; CAP-002 refines CAP-001, CAP-005 refines CAP-004, CAP-010 refines CAP-003; each scenario derives from the capability it exercises (SCN-001 ← CAP-002; SCN-002 ← CAP-001, CAP-004; SCN-003 ← CAP-003; SCN-004 ← CAP-006; SCN-005 ← CAP-005).
- **Figure.** A tree of the ten capabilities with need tags on each node and scenario badges on the leaves.
- **Sources.** `reference/week03.ts` (caps, links). FICTIONAL.

#### S1.19 Coverage and level: what the tree does not yet cover (3 min)
- **Purpose.** Carry the Week 1 corrections forward honestly.
- **Content.**
  - The reference capabilities trace to NEED-001..011. The needs added or split in the Week 1 review (NEED-012..017) have no capability yet (proposed: siting and land-use compliance; workload-managed operations; operational risk evidence; fare transparency and competitiveness; all **(proposed, instructor to confirm)**).
  - CAP-007 covers per-event noise only; the corrected NEED-003 also bounds the number of evening and early-morning events. The capability should read "within both agreed limits" **(proposed, instructor to confirm)**.
  - A capability names an ability, not an implementation: "Charging power control" (CAP-010) is acceptable at enterprise level; "smart charger controller" would not be.
- **Figure.** The tree from S1.18 with six dashed "proposed" nodes and CAP-007 outlined amber.
- **Sources.** `aerolinkCase.ts` (NEEDS); `reference/week03.ts`; `../week01/AEROLINK_CASE_CHANGES.md` §5 items 1–2.

**Transition E → F.** "With needs, scenarios and capabilities, we can now say what the service and its elements *shall* do, at two levels."

### Section F: Toward requirements (12 min)

#### S1.20 Two levels: stakeholder requirements and system requirements (4 min)
- **Purpose.** Define the levels from the sources and state the course rule.
- **Content.**
  - SEBoK glossary: stakeholder requirements are transformed from needs into more formal statements (29148 via SEBoK); 15288 gives no formal definition (R39a p.1632). System requirement: transforms the stakeholder, user-oriented view into a technical view of a solution (R39l p.1652).
  - DoD: Stakeholder Requirements Definition translates stakeholder capability needs into a set of technical requirements (R48a p.141); Requirements Analysis decomposes end-user needs into clear, achievable and verifiable requirements and supports their allocation down to system elements (R48b p.142).
  - Requirements must be appropriate to the level of the system of interest and say "what", not "how" (R13 p.558).
  - **Course convention.** REQ-STK is written on the whole service ("The AeroLink service shall …"); REQ-SYS is written on a named element or function of it ("The charging system shall …").
- **Figure.** A three-tier staircase: NEED (stakeholder's words) → REQ-STK (service shall) → REQ-SYS (element shall), each step labeled with its source definition.
- **Sources.** R39a p.1632; R39l p.1652; R48a p.141; R48b p.142; R13 p.558. Course convention (prefixes and subjects).

#### S1.21 One chain, end to end: NEED-004 to REQ-SYS-001 (3 min)
- **Purpose.** Show the transformation as analysis (R13 pp.558–559), using numbers.
- **Content.** NEED-004 (turn aircraft around so pad occupancy does not limit departures) + CAP-003 + SCN-003 → REQ-STK-005 (dispatch-ready within 25 min of arrival on a hub pad) → REQ-SYS-001 (charge from the 20 % reserve to the dispatch threshold within 20 min). The 25 min is a budget: 5 min pad work + 20 min charging, boarding overlapping the charge (FICTIONAL, reference convention). SEBoK: budgeted values create dependent requirements; a change in one forces a change in another (R13 p.562).
- **Figure.** The chain as linked cards; under it a stacked bar "25 min = 5 + 20" with the charge segment shaded and labeled "REQ-SYS-001".
- **Sources.** R13 pp.558–559, 562. Data from `aerolinkCase.ts` (NEED-004), `reference/week03.ts` (CAP-003, SCN-003), `week04.ts` (REQ-STK-005, REQ-SYS-001), `week02.ts` (A-007).

#### S1.22 Answering the driving question (2 min)
- **Purpose.** Close the loop from S1.2.
- **Content.** Answer (B). Writing SCN-005 exposed a need (NEED-011), an assumption (A-008) and an unknown (U-001); the ConOps fixes the operational environment that requirement values depend on (16 h day, 20 % reserve, pad-edge limit); and the coverage matrix showed which needs are constraints rather than operations. Requirements written straight from the needs would have missed all of these.
- **Figure.** The S1.2 drawing completed: the detour through the storyboard, with the three discoveries dropping into the needs stack and the uncertainty register.
- **Sources.** Instructor synthesis of S1.14–S1.16; R52 p.301.

#### S1.23 Exit: retrieval and preparation (3 min)
- **Purpose.** Retrieval; hand-off to Session 2.
- **Content.** One-minute paper: "Name one off-nominal scenario for your enterprise and one need it might expose." Before Session 2 (about 25 min per student, budgeted in §5.7): each member drafts the trigger, primary actor and failure end state of one candidate scenario for the team's enterprise; read R13 pp.557–560 and 565–566.
- **Figure.** None (text slide with the LMS link).
- **Sources.** Course convention.

**Session 1 running total**

| Section | Slides | Minutes | Cumulative |
|---|---|---|---|
| A Framing | S1.1–S1.4 | 8 | 8 |
| B ConOps | S1.5–S1.9 | 15 | 23 |
| C Scenarios | S1.10–S1.13 | 12 | 35 |
| D AeroLink worked example | S1.14–S1.16 | 13 | 48 |
| E Capabilities | S1.17–S1.19 | 9 | 57 |
| F Toward requirements and exit | S1.20–S1.23 | 12 | **69** |
| Buffer | | 6 | 75 |

## 3. Session 2: Writing, checking and tracing requirements; measures; lab launch (69 min + 6 buffer)

### Split decision: 47 min lecture, 22 min laboratory launch
Same reasoning as Week 1. Requirements writing, quality, traceability and measures are the core of the week and must be taught before they are assigned (A20). The in-room part of the lab is the one thing that needs the instructor: a scenario clinic in which each team's off-nominal scenario skeleton is checked before the team writes requirements against it. A full-session lab would leave traceability and measures untaught; no lab time would push the first instructor check on scenarios to Week 3, after the requirements were written.

### Section G: Writing requirements (20 min)

#### S2.1 Retrieval warm-up (2 min)
- **Purpose.** Spaced retrieval of Session 1.
- **Content.** Three cards: (1) Is the weather an actor in SCN-005? (2) Name one thing SCN-005 exposed. (3) Which capability does SCN-003 exercise? Reveal on the next click (Week 1 lesson: question and reveal are separate).
- **Figure.** The SCN-005 swimlane with three blanks.
- **Sources.** R59 p.453. Reference data.

#### S2.2 Anatomy of a requirement and its attributes (3 min)
- **Purpose.** The parts of a well-formed requirement.
- **Content.**
  - A requirement statement is a formal transformation of needs or parent requirements into an agreed obligation to perform a function or possess a quality within constraints, with acceptable risk (INCOSE NRM via SEBoK, R13 p.558; the NRM itself is not in the collection).
  - "Shall" indicates a binding provision; "should" or "may" a nonbinding one; "will" a declaration of purpose (R54 p.330).
  - Useful attributes: rationale; trace to source or parent; verification success criteria; owner; category; status; criticality; priority (R13 p.559). Rationale says why the requirement is needed, its assumptions and the source of its numbers (R13 p.559).
  - **Course minimum record** (course convention): ID, name, statement, type, measurable criterion or TBD with an AROU link, rationale, parent(s), verification method, owner.
- **Figure.** REQ-STK-001 dissected: subject / "shall" / action / measurable criterion / condition, with its attribute card beside it.
- **Sources.** R13 pp.558–559; R54 p.330. REQ-STK-001 from `reference/week04.ts`. Course convention.

#### S2.3 Characteristics of good requirements (4 min)
- **Purpose.** A sourced, layered checklist, not a course invention.
- **Content.**
  - DoD: necessary, unique, unambiguous, clear and concise, complete, consistent, feasible, traceable, measurable, verifiable, able to be validated, operationally effective and survivable, singular (R48b p.144).
  - MITRE: traceable, unambiguous, specific and singular, measurable, performance specified, testable, consistent, feasible, uniquely identified, design-free, uses "shall" (R54 pp.329–330).
  - SEBoK: requirement verification asks whether requirements are well formed; requirement validation asks whether they are the right requirements, faithful to the needs and achievable (R13 p.566).
  - **Source gap.** SEBoK points to INCOSE's Guide to Writing Requirements for the rules (R13 p.566); the GtWR is not in the collection.
- **Figure.** A two-column overlap chart (DoD list, MITRE list) with shared characteristics in the middle band; a side tab "set-level: complete, consistent".
- **Sources.** R48b p.144; R54 pp.329–330; R13 p.566.

#### S2.4 Categories and types (3 min)
- **Purpose.** Organize a set so that gaps show.
- **Content.**
  - SEBoK's example categories (derived from the INCOSE NRM): function/performance; fit/operational; form; quality; compliance. For the set to be complete each category topic must be addressed (R13 p.560).
  - MITRE's checklist: each requirement describes a function, the performance a function must provide, a constraint on the design, or a reference such as an interface definition; include legal and regulatory constraints, environmental design requirements and all external interfaces (R55 pp.368–369).
  - **Course types** (course convention, used by the reference set and the deliverable specification): functional, performance, interface, constraint.
- **Figure.** The 20 AeroLink reference requirements sorted into the four course types (counts per type), with SEBoK's five categories as a second axis; empty cells highlighted.
- **Sources.** R13 p.560; R55 pp.368–369. Types from `reference/week04.ts`. Course convention.

#### S2.5 Level, white space and derived requirements (3 min)
- **Purpose.** The most common error at this level: designing in the requirement.
- **Content.** Give designers what they must know but leave as much white space as possible (R55 p.367). Too high a level leaves the designer guessing; too low artificially constrains the design (R55 p.371). Derived requirements come from solution decisions and must be identified and kept traceable (R48 p.146). A requirement suits the level of the system of interest in the architecture (R13 p.558).
- **Figure.** A "zoom" figure: service level (REQ-STK-005, 25 min turnaround) → charging-system level (REQ-SYS-001, 20 min) → a greyed charger-rating box marked "derived later, after a trade (Week 3)".
- **Sources.** R55 pp.367, 371; R48 p.146; R13 p.558.

#### S2.6 Negatives, ranges, thresholds and TBDs (3 min)
- **Purpose.** Word-level rules with reasons.
- **Content.**
  - Avoid "shall not": it is very difficult to prove a negative; avoid "maximize" and "minimize"; avoid single-point values and use ranges; distinguish thresholds (must be provided) from objectives (better has value up to the objective) (R55 p.370).
  - When a value is unknown, use TBD; when known but low-confidence, TBR; track TBXs with an owner and the work to close them, because unresolved TBXs become risk (R13 p.565).
  - AeroLink: REQ-STK-003 ("shall not dispatch a flight when the forecast … exceeds … TBD-01") is a reference requirement written as a negative with a TBD; ask students whether it is verifiable and how REQ-SYS-004 (a positive "dispatch hold" requirement) answers the concern.
- **Figure.** REQ-STK-003 and REQ-SYS-004 side by side, with the "shall not" and the TBD-01 → U-001 link highlighted.
- **Sources.** R55 p.370; R13 p.565. `reference/week04.ts`.

#### S2.7 A verification method for every requirement (2 min)
- **Purpose.** Plan verification while writing (it disciplines the wording).
- **Content.** Every requirement must have a verification method identified (R55 p.370). DoD methods: demonstration, examination, analysis, test (R49 pp.149–150). SEBoK records the INCOSE methods inspection, analysis, demonstration and test, and certification as a fifth method, verification against legal or industrial standards by an outside authority, with airworthiness certification as the best-known case (R16 p.769). Defining verification success criteria when writing the requirement helps ensure it is verifiable (R13 p.566).
  - **Course convention.** The course uses inspection / analysis / demonstration / test; "inspection" is the DoD "examination".
- **Figure.** Four method icons with one AeroLink requirement under each (REQ-STK-007 inspection; REQ-STK-004 analysis; REQ-STK-006 demonstration; REQ-SYS-001 test), and a fifth, dashed "certification" icon.
- **Sources.** R55 p.370; R49 pp.149–150; R16 p.769; R13 p.566. Methods from `reference/week04.ts`.

### Section H: The AeroLink requirements, worked (11 min)

#### S2.8 Worked example I: two chains and the reasoning in the rationale (3 min)
- **Purpose.** Show rationale as engineering argument.
- **Content.** Chain 1: NEED-001 → CAP-001 → REQ-STK-001 (90 % boarded within 15 min per month; rationale cites A-001) → REQ-SYS-005 (assignment within 60 s for 99 % of requests; "a negligible part of the 15 min budget"). Chain 2: NEED-010 → CAP-010 → REQ-STK-010 (power within the agreed connection, TBD-02) → REQ-SYS-010 (charging system limits combined power; "enforced in the system, not by procedure"). Point out the TBD-02 → U-002 link and the verification methods.
- **Figure.** Two vertical chains, rationale text in a call-out beside each "derives from" arrow.
- **Sources.** R13 p.559 (rationale attribute); R13 p.565 (TBD). Reference data.

#### S2.9 Worked example II: a Week 1 correction reaches the requirements (3 min)
- **Purpose.** Show that the package is one connected body of work.
- **Content.** The corrected NEED-003 bounds noise exposure: the loudness of each event and the number of events in the evening and early morning. REQ-STK-002 (65 dBA LAmax at the pad edge for every movement) covers only the first bound; MGO-006 and CAP-007 likewise. A second stakeholder requirement is needed, for example: "The AeroLink service shall limit take-offs and landings at each vertiport pad in the noise-sensitive hours to the number agreed with the city (TBD-03)" **(proposed, instructor to confirm; ID and TBD number to be assigned)**, with a new unknown for the agreed cap. Discuss: is this a requirement on the service or a term of the noise agreement?
- **Figure.** NEED-003 split into two bars ("level of each event", "number of evening and early-morning events"); REQ-STK-002 under the first bar, an empty dashed box under the second.
- **Sources.** R13 p.558 (one need, several requirements, R13 p.559). `aerolinkCase.ts` (NEED-003, NOISE_AGREEMENT); `reference/week04.ts`; `../week01/AEROLINK_CASE_CHANGES.md` §5 item 2.

#### S2.10 Worked example III: critique and rewrite (5 min)
- **Purpose.** Requirement verification as a review skill.
- **Content.** Six flawed drafts (reviewed old Week 4 set, `src/activities/week04/critique.ts`); pairs diagnose two each, then the reveal:
  - F1 "The aircraft shall be quiet and shall be safe to operate near homes." Two obligations; unmeasurable. → REQ-SYS-002.
  - F2 "The booking app should respond quickly …" Nonbinding "should"; vague; names an implementation. → REQ-SYS-005.
  - F3 "… using two 350 kW DC fast chargers per hub pad." A number that dictates design (R55 p.367). → REQ-SYS-001.
  - F4 "The fleet shall maximize availability." "Maximize" (R55 p.370). → REQ-SYS-006.
  - F5 "… shall not dispatch flights in unsafe weather." Negative; "unsafe" undefined. → REQ-SYS-004 with TBD-01.
  - F6 "… in 30 s." No start event; single point. → REQ-SYS-009 ("within 30 s of detection").
  - Point: word-level checks catch F2, F4, F5, F6; engineering judgment is needed for F1 and F3 (requirement verification is a review activity, R13 p.566).
- **Figure.** A three-column table: draft, defect and characteristic violated (with source), rewrite.
- **Sources.** R48b p.144; R54 pp.329–330; R55 pp.367, 370; R13 pp.565–566. Drafts and rewrites from `critique.ts` and `reference/week04.ts`.

### Section I: Traceability and measures (14 min)

#### S2.11 Bidirectional traceability, orphans and childless parents (3 min)
- **Purpose.** Define the audit from the source.
- **Content.** DoD: requirements management provides bottom-up traceability from any derived requirement to its source; bidirectional traceability ensures that changes create no "orphaned" lower-level requirements and that there are no "childless parent" higher-level requirements (R45 p.118). The requirements traceability matrix records decomposition, derivation, allocation and rationale (R45 p.119). SEBoK: traceability ensures requirements trace to their needs and supports impact analysis of changes (R13 p.565); "needs and requirements not traced to a source" is one requirements-management metric (R14 p.478).
- **Figure.** A small trace graph with one orphan requirement (no up-arrow) and one childless need (no down-arrow), each circled.
- **Sources.** R45 pp.118–119; R13 p.565; R14 p.478.

#### S2.12 Worked example IV: auditing the AeroLink trace (4 min)
- **Purpose.** Apply the audit to the instructor's own baseline (W2.4, W2.7).
- **Content.**
  - Backward: all 20 reference requirements have a parent; no orphans.
  - Forward, needs: NEED-011 has no child requirement. This is the reference's one deliberate childless need (it is a missing requirement, not a missing link; linking an unrelated requirement would hide the gap). NEED-012..017 (proposed in the Week 1 review) also have no requirement or capability yet: six further childless needs if adopted.
  - Forward, stakeholder requirements: REQ-STK-007 (step-free boarding) and REQ-STK-009 (flight intent to the ANSP) have no system requirement yet. DoD says each high-level requirement is "ultimately" addressed by lower-level requirements and designs (R45 p.118), so these stay on the open-items list until Weeks 4–5 allocate them.
  - Each finding gets a disposition: write, link, or record why not.
- **Figure.** A trace matrix (needs × REQ-STK) with the NEED-011 row and the NEED-012..017 rows highlighted, and a second strip (REQ-STK × REQ-SYS) with REQ-STK-007 and -009 flagged.
- **Sources.** R45 p.118. Reference data; DECISION_LOG W9 (faculty outline only, not on the slide).

#### S2.13 Requirement verification versus requirement validation (2 min)
- **Purpose.** Keep two different questions apart before Week 12.
- **Content.** Requirement verification: are they well formed? Requirement validation: are they the right requirements, communicating the intent of the needs, correct and achievable? Neither is system verification or system validation (R13 p.566). Methods: peer review and comparison against the characteristics and the integrated set of needs (R13 p.566).
- **Figure.** A 2 × 2 grid: rows "requirements" / "system", columns "verification (built right / well formed)" / "validation (right thing)", with this week's cells highlighted.
- **Sources.** R13 p.566.

#### S2.14 Measures of effectiveness and measures of performance (3 min)
- **Purpose.** Define the measures the requirements serve.
- **Content.** MOE: measures of mission success under specific environmental and operating conditions, from the users' viewpoint. MOP: specific physical or functional characteristics of the system's operation, measured under specified conditions, used to decide whether the system meets the performance requirements needed to satisfy the MOE. KPP: a stakeholder-defined measure of minimal, critical performance (R54 pp.330–331). SEBoK: measures validate the system against the objectives and are expressed as MOEs (R10 p.544); technical measurement includes MOEs, MOPs and TPMs (R15 p.532). TPMs are taught in Week 3 with technology and risk.
- **Figure.** A three-level pyramid: MGO objective → MOE (user view) → MOP (system characteristic) → (TPM, greyed, "Week 3").
- **Sources.** R54 pp.330–331; R10 p.544; R15 p.532.

#### S2.15 Worked example V: the AeroLink measures (2 min)
- **Purpose.** Show linkage and measurement rationale.
- **Content.** MOE-001 (monthly 90th-percentile wait; threshold 15 min; booking and boarding timestamps) measures NEED-001, CAP-001 and MGO-005; MOP-001 (assignment latency, 60 s) and MOP-002 (charge time, 20 min) measure MOE-001 and REQ-SYS-005 / REQ-SYS-001. MOE-003 (noise compliance rate) measures NEED-003 but, like REQ-STK-002, only the per-event bound: a second MOE for evening and early-morning events is needed **(proposed, instructor to confirm)**.
- **Figure.** A small linkage graph MGO-005 → MOE-001 ← MOP-001, MOP-002 → REQ-SYS-005, REQ-SYS-001, with data-source tags.
- **Sources.** `reference/week05.ts`; `reference/week03.ts`. FICTIONAL.

### Section J: Bridge (2 min)

#### S2.16 Where this goes: Week 3, Week 9, Week 10, Week 12 (2 min)
- **Purpose.** Continuity.
- **Content.** Week 3: the TBDs become unknowns and risks; technology readiness and TPMs attach to the risky requirements; the trade study scores alternatives against MOEs. Week 9: needs and requirements become SysML v2 requirement definitions and usages (R74 pp.86–91, named only). Week 10: the ConOps scenarios become use cases and actions (R76 pp.100–107; R72 pp.30–47, named only). Week 12: each verification method becomes a verification case (R75 pp.96–99, named only).
- **Figure.** Four arrows from this week's artifacts (scenarios, requirements, methods, measures) to the Phase II weeks.
- **Sources.** COURSE_SCHEDULE.md rule 6. Phase II readings named only.

### Section K: Laboratory launch (22 min)

#### S2.17 Lab L2 brief: what you deliver, and by when (3 min)
- **Purpose.** Unambiguous instructions.
- **Content.** The Week 2 additions to the Team Record (§5.5), the minimums, the due time (before Week 3 Session 1), the AI usage statement, the rubric criteria in plain words. The deliverable is about the team's own enterprise, never AeroLink.
- **Figure.** One-slide checklist with minimums and owners.
- **Sources.** Course convention.

#### S2.18 Team work: choose scenarios and owners (8 min)
- **Purpose.** In-class planning.
- **Content.** Teams merge the members' pre-work into a list of candidate scenarios, select at least three (nominal, off-nominal, support), assign an owner to each scenario and to the CAP, REQ-STK, REQ-SYS, MOE and MOP prefixes, and write the off-nominal scenario's trigger, primary actor, preconditions and failure end state.
- **Figure.** Timer; the scenario card template.
- **Sources.** Course convention; R59 pp.453–454 (template basis).

#### S2.19 Instructor checkpoint: scenario clinic (9 min)
- **Purpose.** Catch boundary and actor errors before requirements are written.
- **Content.** Each team (about 90 s, up to five teams; more decided on the LMS within 48 h) states its scenario system of interest, reads its off-nominal scenario's trigger and failure end state, and names one actor outside the boundary. The instructor checks: is the actor outside the system; is the trigger an event; is the failure end state observable? The decision is "proceed" or "revise, with the reason".
- **Figure.** The clinic card: three fill-in lines and a check box per criterion.
- **Sources.** R59 pp.453–455. Course convention.

#### S2.20 Close: the next seven days (2 min)
- **Purpose.** Work plan and accountability.
- **Content.** Out-of-class sequence (§5.4); quiz and individual applied exercise open after this session; log hours.
- **Figure.** Seven-day timeline with owner initials.
- **Sources.** Course convention.

**Session 2 running total**

| Section | Slides | Minutes | Cumulative |
|---|---|---|---|
| G Writing requirements | S2.1–S2.7 | 20 | 20 |
| H Worked requirements | S2.8–S2.10 | 11 | 31 |
| I Traceability and measures | S2.11–S2.15 | 14 | 45 |
| J Bridge | S2.16 | 2 | 47 |
| *Lecture subtotal* | *16 slides* | *47* | |
| K Lab launch | S2.17–S2.20 | 22 | **69** |
| Buffer | | 6 | 75 |

## 4. AeroLink worked example (continuity from Week 1)

All values FICTIONAL. The Week 1 case module is the starting point; nothing in it is changed by this outline.

### 4.1 Inputs carried from Week 1
SOI-001 "the AeroLink air-taxi service" (proposed ID); STK-001..015; CON-001..017; NEED-001..017 in SEBoK form with priority and MGO trace; the corrected external systems; the noise agreement (65 dBA per event; sensitive hours before 07:00 and after 20:00; an event cap to be quantified in Week 2, proposed); REL-002 conflict; MGO-001..004, MGO-009.

### 4.2 The reference ConOps scenarios (`reference/week03.ts`)

| ID | Name | Primary actor | Trigger | Alternates | Key values |
|---|---|---|---|---|---|
| SCN-001 | Passenger Ride Request | STK-001 | Passenger asks for a ride | A1 no aircraft within 15 min; A2 destination under weather hold; A3 wheelchair user asks for assistance | Assignment within 60 s; party 1–4 |
| SCN-002 | Passenger Transport Mission | STK-001 | Boarding time reached | A1 destination pad occupied; A2 no-show; A3 flight intent not accepted | ≥ 20 % usable energy at landing; about 10 min at 150 km/h |
| SCN-003 | Aircraft Charging | STK-005 | Aircraft lands on a hub pad | A1 both hub chargers occupied; A2 grid curtailment; A3 cell over-temperature | 20 min charge; 25 min turnaround; limit TBD-02 |
| SCN-004 | Maintenance Event | STK-009 | Fault reported or predicted | A1 part not in stock (EXT-004); A2 deferrable fault | No-go flag within 2 min |
| SCN-005 | Weather Disruption | Operations center duty manager | Forecast crosses a limit within 30 min (TBD-01) | A1 alternate degrading; A2 region-wide event, public transport offered; A3 hold over 2 h | Hold lifted after 30 min inside limits |

**Defects and decisions to note (instructor).**
1. The scenario system of interest ("AeroLink operational system"; people are users outside it) is narrower than Week 1's SOI-001 (the service, including its people). Teach it as a scoping choice and state it on every scenario; faculty may prefer to align the two.
2. British spellings remain in the reference scenario data ("Operations centre duty manager"); the slides use American spelling (AEROLINK_CASE_CHANGES §4).
3. The scenario actor list names EXT-001 by its corrected system name; the actor accepting flight intents is the air traffic service, whose owner is STK-007.

### 4.3 Needs × scenarios coverage (instructor reading, for S1.16)

| Need | Exercised in | Note |
|---|---|---|
| NEED-001 wait | SCN-001 main, A1 | |
| NEED-002 safety limits | SCN-002 step 1; SCN-005 | |
| NEED-003 noise exposure | SCN-002 step 5 (per-event only) | Event cap not exercised |
| NEED-004 turnaround | SCN-003 | |
| NEED-005 capacity growth | none | Planning need; Week 3 trade |
| NEED-006 fire warning and access | SCN-003 A3 | Responder access not shown |
| NEED-007 known condition | SCN-004 | |
| NEED-008 step-free travel | SCN-001 A3; SCN-002 step 4 | |
| NEED-009 flight intent | SCN-002 steps 2–3, A3; SCN-005 step 4 | |
| NEED-010 grid connection | SCN-003 step 2, A2 | |
| NEED-011 disruption notice | SCN-005 steps 5–6 | Exposed by this scenario |
| NEED-012, NEED-016 siting | none | Siting constraints; verified before operation |
| NEED-013 workload | SCN-005 (stress only) | No step limits workload: finding |
| NEED-014 risk evidence | SCN-002 end state (flight data logged) | Weak |
| NEED-015, NEED-017 fares | SCN-001 step 3 (fare quoted) | Competitiveness not exercised |

### 4.4 Capabilities and requirements
CAP-001..010 (`reference/week03.ts`), REQ-STK-001..010 and REQ-SYS-001..010 with type, method, criterion, rationale and parents (`reference/week04.ts`), U-002/TBD-02, MOE-001..006 and MOP-001..009 (`reference/week05.ts`). Proposed additions for discussion only, each **(proposed, instructor to confirm)**: capabilities for NEED-012..017; a stakeholder requirement and an MOE for the evening and early-morning event cap (S2.9, S2.15); a stakeholder requirement for NEED-011 only if faculty revise DECISION_LOG W9.

## 5. Laboratory outline: Lab L2, ConOps and requirements for the team's enterprise

### 5.1 Inputs
- The team's Week 1 Team Record as returned with feedback: approved enterprise and system of interest, context (EXT), stakeholder register (STK, CON, REL), needs (NEED) with priority and MGO trace.
- The Session 1–2 slides and the long-form lesson, especially the worked examples (S1.14–S1.16, S2.8–S2.12).
- Readings (essential): R52 pp.298–302; R59 pp.453–455; R13 pp.557–560, 565–566; R54 pp.329–331. Extension: R55 pp.365–371; R48a/b pp.141–144; R45 pp.118–119; R10 p.546.

### 5.2 Objectives
W2.1, W2.3, W2.4, W2.5, W2.6, W2.7 applied to the team's own enterprise.

### 5.3 Method
1. **ConOps narrative**: mission and problem statement (from Week 1), operational environment and constraints with numbers, user interactions, the existing situation and the justification (S1.7–S1.9).
2. **Scenarios**: at least three on the course template with the scenario system of interest stated (S1.10–S1.12); review each with MITRE's questions (S1.13).
3. **Discovery log**: every need, assumption or unknown a scenario exposes is added to the needs set or the uncertainty register (S1.15).
4. **Coverage check**: needs × scenarios matrix with a reason for every need not exercised (S1.16).
5. **Capabilities**: derived from needs, decomposed where useful, each linked to the scenarios that exercise it (S1.17–S1.19).
6. **Requirements**: stakeholder and system requirements on the course record, each with one obligation, a criterion or TBD (with an AROU unknown), type, rationale, parent and method (S2.2–S2.7).
7. **Trace audit**: forward and backward; list orphans and childless parents with a disposition (S2.11–S2.12).
8. **Measures**: MOEs for the key needs and objectives; MOPs linked to MOEs and requirements, with data source and threshold (S2.14–S2.15).

### 5.4 Procedure

| Step | When | Who (lead role) | Output |
|---|---|---|---|
| 1. Scenario selection, owners, off-nominal skeleton | In class, S2.18 (8 min) | Whole team | Scenario list |
| 2. Scenario clinic decision | In class, S2.19 | Requirements & Compliance lead presents | Proceed or revise |
| 3. ConOps narrative and environment | Day 1–2 | Architecture | Part 7 |
| 4. Scenarios (one per member, ≥ 3) and review | Day 1–3 | Each member owns one; V&V reviews | Part 8 |
| 5. Discovery log and needs update | Day 3 | Requirements & Compliance | Part 5 revised; AROU entries |
| 6. Capabilities and coverage matrix | Day 3–4 | Architecture | Part 9 |
| 7. Requirements (each member writes ≥ 3) | Day 4–5 | R&C merges | Part 10 |
| 8. Trace audit and measures | Day 6 | V&V (audit); AI & Data (measures) | Part 11 |
| 9. AI usage statement; AI-suggested items tagged | Day 6 | AI & Data | Part 6 updated |
| 10. Integration review, export, upload | Day 7 | V&V | Submission |

### 5.5 Outputs
`team-NN-week2-record.md` and `team-NN-week2-model-inputs.json`, appending to the Week 1 record:
- Part 7 ConOps narrative; Part 8 scenarios (SCN); Part 9 capabilities (CAP) and needs × scenarios matrix; Part 10 requirements (REQ-STK, REQ-SYS); Part 11 trace audit and measures (MOE, MOP); updated Parts 5 and 6.
- **Minimums (course convention, team of 4):** 3 scenarios (≥ 1 nominal, ≥ 1 off-nominal, ≥ 1 support), each with ≥ 1 alternate flow and both end states; ≥ 5 capabilities; ≥ 10 requirements (≥ 6 REQ-STK, ≥ 4 REQ-SYS), covering at least three of the four types; every NEED either traced to a requirement or carrying a recorded reason; ≥ 3 MOEs and ≥ 3 MOPs. Team of 3: 3 scenarios, 4 capabilities, 8 requirements, 2 MOEs and 2 MOPs. The deliverable specification's package target of 25–40 requirements is reached by Week 7 (interface requirements in Week 5, derived requirements after the Week 3 trade).
- The JSON gains SCN, CAP, REQ, MOE and MOP entries with their links; the app-source owner must extend the export format (not done here).

### 5.6 Rubric rows (from ASSESSMENT_RUBRICS.md)

| Row | Criterion | Applied this week |
|---|---|---|
| RB-2.3 | Capability analysis | Yes: derived from needs, decomposed, linked to scenarios. Gap analysis over horizons is deferred to Week 6 (scored at most 3 this week) |
| RB-2.4 | ConOps and scenarios | Yes, in full: required scenarios incl. off-nominal; actors, preconditions, steps, alternates, end states; constraints and environment |
| RB-2.5 | Traceability and AROU | Yes: NEED → STK and CAP → NEED, plus the new AROU entries from scenarios |
| RB-3.1–3.4 | Requirements, sample-based (10 drawn by the grader) | Yes; for sets under 10, every requirement is scored |
| RB-3.5 | Set quality | Yes, judged against the scenarios and the coverage matrix |
| RB-3.6 | Audit response | Yes for the team's own trace audit; peer audit is not run this week |
| RB-4.1–4.3 | Measures | MOE and MOP only; TPM criteria are applied in Week 3 |
| RB-12.1–12.3 | AI usage statement | Yes |

**Grading mode.** Formative (as Week 1), unless faculty make it summative. Feedback before Week 3 Session 2.

### 5.7 Realistic per-student workload (budget about 8 h)

| Activity | Hours per student | Basis |
|---|---|---|
| Class sessions (2 × 75 min) | 2.5 | Timetable |
| Readings: R52 pp.298–302 (5), R59 pp.453–455 (3), R13 pp.557–560, 565–566 (6), R54 pp.329–331 (3); 17 pp at about 15 pp/h | 1.1 | Register page counts |
| Lecture handout and worked examples | 0.4 | Long-form lesson of about 4,000 words |
| Candidate scenario before Session 2 (S1.23) | 0.4 | One skeleton per member |
| Lab L2 out of class: the student's share of steps 3–10 | 2.6 | About 10.5 person-hours per team of 4: narrative 1.5; scenarios 3 × 1.0; discovery and coverage 1.0; capabilities 1.0; requirements 2.5; audit and measures 1.0; integration and AI statement 0.5. A team of 3 at the reduced minimums carries about 3.0 h each |
| Quiz Q2 | 0.3 | 12 items |
| Individual applied exercise (graduate students: the graduate memo instead, 0.8 h) | 0.6 | §6.2 |
| Time log | 0.1 | |
| **Total** | **8.0** (graduate 8.2) | At the budget |

Faculty decisions this depends on: (a) the reduced minimums for teams of 3; (b) the graduate memo replacing the applied exercise; (c) the Practice-stage rehearsal tools for scenarios and requirements become optional, as in Week 1; (d) the estimate is checked against the logged hours.

## 6. Assessment outline (separate from the lecture)

No item reuses the in-class questions or the worked-example wording; contexts are unseen and not AeroLink.

### 6.1 Quiz Q2 (individual, 15 min, closed book, 12 items)

| # | Objective | Bloom | Item focus (unseen context) | Key rests on |
|---|---|---|---|---|
| 1 | W2.1 | Understand | Which element is a critical ConOps component per MITRE? (four options) | R52 p.301 |
| 2 | W2.1 | Analyze | A municipal water utility scenario lists "the SCADA server" as an actor in a scenario whose system is the SCADA system: what is wrong? | R59 p.453 |
| 3 | W2.1 | Apply | Which of four scenario sets meets the off-nominal and support coverage expectation for a hospital patient-transfer service? | R10 p.546; R11 p.553; R59 p.453 |
| 4 | W2.6 | Understand | Classify feature, capability and benefit for a library self-checkout kiosk | P2-4 p.1458 |
| 5 | W2.2 | Analyze | A team rewrites a need by replacing "need" with "shall": which source principle does this violate? | R13 p.558 |
| 6 | W2.3 | Apply | Identify the defect in "The app shall minimize response time" | R55 p.370 |
| 7 | W2.3 | Apply | Which statement is design-laden at system level? | R55 p.367; R54 p.330 |
| 8 | W2.3 | Understand | Which verification method fits a requirement on the presence of a labeled emergency exit? | R49 p.149 |
| 9 | W2.4 | Analyze | In a five-row trace table, find the orphan and the childless parent | R45 p.118 |
| 10 (SA) | W2.3 | Apply | Rewrite a given defective campus-shuttle requirement so that it is singular, measurable and has a start event | R48b p.144; R55 p.370 |
| 11 (SA) | W2.5 | Apply | For a given food-bank objective, propose one MOE and one MOP and say what distinguishes them | R54 pp.330–331 |
| 12 (SA) | W2.7 | Evaluate | A requirement carries "TBD" with no owner: state the risk and the minimum record needed | R13 p.565 |

Scoring: items 1–9 one point; items 10–12 two points (two-criterion key); total 15. Keyed positions balanced; distractors from the common errors (S2.10); no option longer or more qualified than the key.

### 6.2 Individual applied exercise (about 35 min, open book, unseen case)
- **Case brief** (about 300 words, FICTIONAL): a regional blood-supply courier service (drones and vans between a blood bank and four hospitals). It gives the mission, three needs in SEBoK form, an environment paragraph and a draft "scenario" that is really a feature list.
- **Tasks.** (1) Rewrite the draft as one off-nominal scenario on the course template, stating the scenario system of interest (W2.1). (2) Derive two capabilities from the needs (W2.6). (3) Write three requirements (two REQ-STK, one REQ-SYS) with rationale, parent and method (W2.3). (4) Trace them and name one childless need with its disposition (W2.4). (5) Propose one MOE and one MOP (W2.5).
- **Rubric** (4 levels, 20 points): scenario structure and boundary; capabilities; requirement quality; trace and disposition; measures.

### 6.3 Graduate task (always read; replaces the applied exercise for graduate students)
Apply MITRE's system-level requirements checklist (R55 pp.368–370) to the team's requirement set; one-page memo listing each checklist item met or not, with evidence and the fix (course.ts graduate task, kept).

## 7. Continuity link to Phase II

| Week 2 artifact | Modeled in | How (named only; no SysML syntax is taught in Week 2) |
|---|---|---|
| NEED, REQ-STK, REQ-SYS with IDs, parents, criteria | **Week 9** Needs / Requirements | Requirement definitions and usages with subject and short-name IDs; derivation traces (R74 pp.86–91) |
| ConOps scenarios SCN | **Week 10** Logical / Behavioral (rule 6: Week 10 ↔ Weeks 2 and 4) | Use cases with actors and subject; actions for the flows; states for modes (R76 pp.100–107; R72 pp.30–47; R73 pp.48–56) |
| Verification methods; MOE and MOP | **Week 12** Digital Thread / V&V (rule 6: Week 12 ↔ Weeks 2 and 3) | Verification cases with verdicts; measures as attributes (R75 pp.96–99) |

The REQ, SCN, CAP, MOE and MOP IDs recorded this week are the keys the Week 8 import uses.

## 8. Source gaps
1. **IEEE Std 1362-1998** (the ConOps guide MITRE summarizes, R52 pp.300–301) is not in the collection; its full outline cannot be taught from source.
2. **INCOSE Guide to Writing Requirements and Needs and Requirements Manual** are cited by SEBoK (R13 pp.558, 566) but not in the collection; the rules for well-formed requirements rest on the DoD and MITRE lists instead.
3. **ISO/IEC/IEEE 29148** (source of the ConOps, operational-scenario and stakeholder-requirement definitions) is available only through SEBoK's glossary.
4. **The scenario template** (seven fields) is a course convention; no source in the collection gives one field set.
5. **Requirement types.** The course's four types (functional, performance, interface, constraint) are a course convention; SEBoK's five categories (R13 p.560) and MITRE's checklist (R55 p.368) differ.
6. **Verification-method names.** DoD uses "examination" (R49 p.149); SEBoK/INCOSE and the course use "inspection" (R16 p.769).

## 9. Register additions needed

| Proposed ID | Source, PDF pages | Title | Used on | Verification note |
|---|---|---|---|---|
| P2-1 | SEBoK p.1469 | Concept of Operations (ConOps) (glossary) | S1.6 | Second entry on the page (running header "Concept Definition (glossary)"); definition from ISO/IEC 29148; discussion says operational concept is "slightly different" |
| P2-2 | SEBoK p.1581 | Operational Scenario (glossary) | S1.10 | Entry heading on the page; three definitions; discussion: used to evaluate requirements and design and to verify and validate |
| P2-3 | SEBoK p.1669 | Use Case (glossary) | S1.10 | Entry heading on the page; one definition (ISO/IEC/IEEE 26515) |
| P2-4 | SEBoK pp.1457–1458 | Capability (glossary) | S1.17; quiz 4 | Second entry on p.1457 (running header "C"; first entry Call Center); four definitions on p.1457; feature/capability/benefit discussion on p.1458 |

**Register notes (no change proposed now).** R59's register title "Use Cases and Mission Threads" differs from the article heading on p.452, "Spanning the Operational Space—How to Select Use Cases and Mission Threads"; check that `verify_readings.py` still passes on the heading. Week 2 essential readings proposed for `course.ts`: R52 pp.298–302; R59 pp.453–455; R13 pp.557–560, 565–566; R54 pp.329–331.

## 10. Open items for faculty
1. Approve the Session 2 split (47 min lecture, 22 min lab launch with a scenario clinic).
2. **Move TPM to Week 3** (course.ts lists "MOE, MOP and TPM" in Week 2). Rationale: TPMs track risky, technology-dependent requirements (all three reference TPMs attach to TECH-001/TECH-002 or R-003), so they teach best beside technology readiness and risk; Week 2 is already the densest week.
3. Accept W2.6 and W2.7 and raise W2.2 to Analyze.
4. Scenario system of interest versus Week 1's SOI-001: teach as a scoping choice (this outline) or align the reference scenarios.
5. The proposed additions in §4.4 (capabilities for NEED-012..017; event-cap requirement and MOE), and whether DECISION_LOG W9 still holds once NEED-012..017 are adopted.
6. Lab minimums for teams of 3; the graduate memo replacing the applied exercise.
7. Approve register additions P2-1 to P2-4.
