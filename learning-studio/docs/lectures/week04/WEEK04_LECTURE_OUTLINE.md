# Week 4 Lecture Outline: Architecture / Information View

**Status.** Draft outline for faculty review (COURSE_PRODUCTION_PLAN M2), written 2026-10-19. Not yet built into
`src/content/lectures/week04/`. Nothing committed.
**Governing documents.** DECISION_LOG A19 and A20; COURSE_SCHEDULE.md (Week 4 subject, exact: *Architecture /
Information View*; team output: "Architecture description: viewpoints, functional decomposition, information view");
COURSE_PRODUCTION_PLAN.md; the Week 1 template and its lessons (`docs/lectures/week01/REVIEW_DISPOSITIONS.md`).
**Reused reviewed material.** Old Week 8 (`src/content/weeks/week08.ts`: blocks `w8-viewpoints`, `w8-decomposition`,
`w8-information`, worked examples (a), (b), (d), the AI capabilities; `draftWeeks.ts` old Week 8 objectives B8.1, B8.2,
B8.4); the instructor reference `src/model/reference/week08.ts`; the case module
`src/content/lectures/week01/aerolinkCase.ts`. Interfaces and the N² chart (old Week 8 `w8-interfaces`, worked
example (c), `w8-advanced`) move to Week 5.
**Format.** Two 75-minute sessions, each 69 min of planned content plus a recorded 6-min buffer.
- Session 1: 21 content slides (69 min) plus the generated References-and-credits slide.
- Session 2: 14 lecture slides (47 min) plus 4 laboratory-launch slides (22 min) plus References and credits.
- Total: 39 content slides plus 2 generated reference slides.

## 0. Conventions used in this outline

- **Citations.** `R19 p.571` = verified register entry, PDF page (SEBoK pages are PDF indices, DECISION_LOG W1).
  `P4-3 p.1445` = a **proposed register addition** for Week 4 (§9); its page text was checked for this outline, but it is
  not yet in `readings.py`. Every citation was checked against `_source_cache/*.txt`; a citation supports only what is
  written beside it.
- **Course convention** marks content the collection does not supply (taught as the course's choice).
- **AeroLink** is FICTIONAL. Values come only from `src/model/reference/week03.ts`, `week04.ts`, `week06.ts`,
  `week07.ts`, `week08.ts` and `aerolinkCase.ts`. External systems use the corrected names of the case module: EXT-001
  Controlled airspace (air traffic service), EXT-002 Electric grid, EXT-003 Weather, EXT-004 Aircraft and spares supply,
  EXT-005 Public transport network, EXT-006 Emergency response service. New values are marked **(proposed, instructor to
  confirm)**. British spellings in the reference data ("organisational", "centre", "utilisation") are written in American
  English on every student-facing surface.
- **Slide faces** carry short citations only and no internal IDs (no rubric row numbers, faculty-decision numbers,
  course-document codes, decision-log IDs, P-numbers or objective IDs). Those stay in this faculty outline. Spoken faculty
  notes stay at or below 130 words per minute.
- **Quotations** are limited to short verified definitions; all figures are original drawings.

## 1. Learning objectives (graduate level)

IDs W4.1–W4.3 are kept from `course.ts`; W4.4–W4.6 are proposed additions.

| ID | Objective | Bloom | Taught in |
|---|---|---|---|
| W4.1 | Describe architecture viewpoints and select, with a stated purpose, the views the team's enterprise needs (operational, functional, physical, enterprise) | Apply → Evaluate (raised) | S1.4–S1.8 |
| W4.2 | Decompose the enterprise's functions from its capabilities and scenarios and allocate them to logical and physical elements, justifying each allocation by a named criterion | Analyze | S1.9–S1.18 |
| W4.3 | Build an information view that traces each information item from producer to consumer to the decision it supports | Analyze | S2.2–S2.9 |
| **W4.4 (new)** | Distinguish data from information and an architecture from its description, citing the source of each distinction | Understand / Analyze | S1.4, S1.6, S2.3 |
| **W4.5 (new)** | Record an architecture decision with the alternatives considered and the rationale, and test it against the needs and risks it touches | Evaluate | S1.19 |
| **W4.6 (new)** | Specify an AI-enabled capability with its inputs, outputs, human oversight and failure mode, and place it in the information view | Analyze | S2.7, S2.10 |
| Graduate | Evaluate the team's view set for coverage of stakeholder concerns and defend one architecture decision against a stated criterion | Evaluate | §6.3 |

## 2. Session 1: Viewpoints, functions and allocation (75 min = 69 + 6 buffer)

**Design rationale.** Weeks 1–3 answered *why* (needs), *what* (requirements) and *which option* (the trade). Week 4 is
the first *how*, but at concept level. The course deliverable asks for "architecture concepts and viewpoints, not
detailed architectures" (course document, Architecture Concept Description). Session 1 therefore teaches the vocabulary of
architecture description, then functions and allocation on AeroLink. Session 2 teaches the information view and launches
the lab.

### Section A: Framing (7 min)

#### S1.1 Week 4 at a glance (1 min)
- **Purpose.** Orient: subject, two sessions, outputs.
- **Content.** Subject exactly as scheduled. Outputs: a view set with a stated purpose per view; functions derived from
  capabilities and scenarios; an allocation matrix with criteria; at least one recorded architecture decision; an
  information view; AI capability cards.
- **Figure.** The package band from Week 1 extended: Charter → Stakeholders → Needs → ConOps and requirements → Readiness,
  risk, trade → **Architecture and information view** (highlighted) → Week 5 components and interfaces (dimmed).
- **Sources.** COURSE_SCHEDULE.md. Course convention (package band).

#### S1.2 Driving question: who decides that an aircraft may fly? (3 min)
- **Purpose.** Create the need to know.
- **Content.** In AeroLink, the dispatch decision depends on the aircraft's fault status, its charge state and the weather.
  Where is each produced, where is it used, and what carries it? Students predict on cards; the answer is withheld until
  S2.9.
- **Figure.** An aircraft on a pad with three question marks (fault status, charge state, forecast) floating toward an
  operations-center console.
- **Sources.** Instructor-authored; data from `reference/week08.ts` (FN-008, FN-011, INFO-002..004).

#### S1.3 Where Week 4 sits (3 min)
- **Purpose.** Connect to Weeks 2–3 and to Phase II.
- **Content.**
  - Inputs: capabilities CAP-001..010 and scenarios SCN-001..005 (Week 2), system requirements REQ-SYS-001..010 (Week 2),
    the trade decision DEC-001 and the risk register (Week 3).
  - SEBoK places architecture after requirements: system requirements form the basis of architecture and design (R13
    p.557) and requirements are defined concurrently with architecture (R13 p.561).
  - Phase II: Week 10 models this week's functions and Week 2's scenarios; Week 11 models Week 5's components.
- **Figure.** Two lanes (documents, model) with dashed arrows Week 4 → Week 10 and Week 5 → Week 11.
- **Sources.** R13 pp.557, 561; COURSE_SCHEDULE.md rule 6.

### Section B: Architecture and its description (18 min)

#### S1.4 What an architecture is (3 min)
- **Purpose.** Separate the architecture from the documents about it.
- **Content.**
  - SEBoK glossary, definition (1), from 15288:2015: "fundamental concepts or properties of a system in its environment
    embodied in its elements, relationships, and in the principles of its design and evolution" (P4-3 p.1445).
  - SEBoK's discussion: the architecture of a system of interest is conceptual and is realized through an architecture
    description; the level of detail depends on purpose, and a description should justify what it includes and excludes
    (P4-3 p.1445).
  - SEBoK's architecture article: the architecture ensures that system elements operate together in the operating
    environment to satisfy stakeholder needs (R19 p.569).
  - Teaching point: "evolution" is in the definition. Week 6 depends on it.
- **Figure.** An iceberg: above the waterline, "architecture description (views, tables, diagrams)"; below, "architecture
  (concepts, elements, relationships, principles of design and evolution)".
- **Sources.** P4-3 p.1445 (register addition); R19 p.569.

#### S1.5 Why descriptions drift, and why Phase II uses a model (2 min)
- **Purpose.** Motivate disciplined IDs now.
- **Content.** Document-based design information is spread across documents with their own notation and no formal
  semantics, so changes are synchronized by hand, with consistency, cost and schedule losses (R19 pp.569–570). A model
  becomes an authoritative source of truth holding requirement, functional, logical and physical representations with
  traceability (R19 pp.570, 572). Week 4 is still tables and diagrams, organized by view with stable IDs, so Week 10 can
  import them.
- **Figure.** Three documents with a shared element drawn in three different ways and one red "out of sync" mark; beside
  them, one model feeding three views.
- **Sources.** R19 pp.569–570, 572.

#### S1.6 Framework, model, view and viewpoint (5 min)
- **Purpose.** Exact vocabulary.
- **Content.**
  - MITRE (R62 p.341): an architecture framework encapsulates a minimum set of practices and requirements for architecture
    artifacts; models represent how objects fit structurally and behave; a view is "a partial expression of the system
    from a particular perspective"; a viewpoint is a set of representations that covers a stakeholder's issues.
  - SEBoK glossary (after OMG SysML 1.3, derived from IEEE 1471): a view is a representation of a system from the
    perspective of a viewpoint (P4-5 p.1677); a viewpoint specifies the conventions and rules for constructing and using a
    view to address a set of stakeholder concerns (P4-6 p.1678).
  - Architecture framework (P4-4 p.1446): conventions, principles and practices for describing architectures within a
    domain or community (examples: DoDAF, MoDAF, TOGAF, Zachman).
  - SEBoK's View principle: multiple views, each based on a system aspect or concern (R04 p.275). Week 1's concerns
    (CON-001..017) are what viewpoints answer.
  - Honest note: the two sources word "viewpoint" differently (a set of representations vs. a specification of
    conventions); ISO/IEC/IEEE 42010 itself is not in the collection (source gap).
- **Figure.** A chain: stakeholder → concern → viewpoint (rules) → view (instance) → model elements, with one AeroLink
  example per link (communities → CON-012 → operational viewpoint → noise-sensitive-hours view → SCN-002 step 5).
- **Sources.** R62 p.341; R04 p.275; P4-4 p.1446, P4-5 p.1677, P4-6 p.1678 (register additions).

#### S1.7 Purpose is paramount: choosing the views (4 min)
- **Purpose.** Views are chosen, not collected.
- **Content.**
  - Systems have many stakeholders with different concerns; frameworks let teams create views directly relevant to those
    concerns (R62 p.342).
  - "Purpose is paramount": generate only the views the purpose needs; each should help a stakeholder conclude whether
    their objectives will be met (R62 p.344).
  - "Know the relationships": related views must be consistent; manage shared data centrally (R62 p.345). "Keep it simple":
    start from operational concepts users already understand (R62 p.345).
  - MITRE: architecture definition usually produces operational, system and technical views (R62 p.341). SEBoK treats
    functional, logical and physical architecture as complementary views (R20a pp.580–581).
  - **Course convention:** four perspectives — operational, functional, physical, enterprise (the course's Architecture
    Concept Description lists these four).
- **Figure.** A 4 × 3 grid: rows = the four perspectives; columns = "question it answers", "who reads it", "Week 1–3
  input". Filled for AeroLink.
- **Sources.** R62 pp.341–342, 344–345; R20a pp.580–581. Course convention (four perspectives).

#### S1.8 AeroLink's four views at a glance (4 min)
- **Purpose.** Show the whole before the parts.
- **Content.** Operational: SCN-001..005 with actors (Week 2). Functional: FN-001..014. Physical: PHY-001..008 (six
  official elements plus PHY-007 Passenger booking platform and PHY-008 Pad fire detection and alarm system). Enterprise:
  AeroLink Urban Mobility and its extended enterprise (Week 1, ENT-001), with the organizational agreements IF-004 and
  IF-009 as the enterprise-level couplings. The logical elements LOG-001..007 sit between the functional and physical
  views (R19 p.571).
- **Figure.** Four quadrant thumbnails with ID ranges and one thread drawn across them: SCN-003 → FN-006 → LOG-002 →
  PHY-003.
- **Sources.** `reference/week08.ts`, `reference/week03.ts`, `aerolinkCase.ts` (FICTIONAL); R19 p.571.

### Section C: Functions and decomposition (17 min)

#### S1.9 What a function is (3 min)
- **Purpose.** A function is a transformation with inputs and outputs.
- **Content.**
  - SEBoK (R20b p.587): a function transforms inputs into outputs (data, materials or energy); inputs and outputs are the
    flow items between functions. Some functions follow directly from functional and interface requirements; others appear
    only after a physical solution is chosen.
  - R20a p.580: "function" here is close to its mathematical sense, so a functional view defines inputs and outputs.
  - The glossary records four senses (Ackoff, Hitchins, SEBoK's transformation sense, and the management sense of a work
    area) (P4-7 pp.1510–1511). Use sense (3) this week.
  - Naming rule (course convention): verb + object, no element name ("Charge aircraft", not "Charger").
- **Figure.** One box "FN-006 Charge aircraft" with inputs (arrived aircraft at the reserve, grid power within the limit)
  and outputs (aircraft at the dispatch threshold, charge-session record).
- **Sources.** R20b p.587; R20a p.580; P4-7 pp.1510–1511 (register addition).

#### S1.10 What a functional view must contain (3 min)
- **Purpose.** A checklist from the source.
- **Content.** SEBoK's minimum for a functional architecture view (R20a p.581): the functional capabilities that meet
  mission objectives and needs; required inputs and outputs; the transformation steps; grouping into sub-functions with
  their inputs and outputs; variations per system mode; and the internal and external interfaces carrying the flows.
  Functional architecture defined as functions and sub-functions transforming input flows into output flows (P4-8
  p.1511). Functional vs behavioral: input-output transformation vs sequencing and execution (R20a p.581).
- **Figure.** A six-row checklist with the AeroLink item that satisfies each row and one row left empty ("modes": the
  reference has none; a discussion point).
- **Sources.** R20a p.581; P4-8 p.1511 (register addition).

#### S1.11 Decomposition and its pitfalls (4 min)
- **Purpose.** How deep, and in which order.
- **Content.**
  - The hierarchy starts from the mission as one black-box function and breaks down until leaf functions have a known or
    imaginable physical solution; it is populated over iterations, not in one pass (R20b p.587).
  - Pitfalls (R20b p.594): not relating back to operational scenarios; decomposing too deeply; forgetting inputs and
    outputs; relying on a static decomposition alone.
  - Proven practice (R20b p.594): establish scenarios of functions before the decomposition tree.
- **Figure.** A three-level tree F0 "Provide on-demand air trips" → F1 booking and dispatch, F2 flight, F3 energy, F4
  fleet health, F5 vertiport safety → leaves (FN IDs). A red "too deep" marker on a fourth level ("press button").
- **Sources.** R20b pp.587, 594. Tree grouping (proposed, instructor to confirm; the reference has no F0–F5 level).

#### S1.12 Worked: walking SCN-001 to find functions (4 min)
- **Purpose.** Model the scenario-first practice.
- **Content.** SCN-001 steps (Week 2) → FN-001 Accept ride request (steps 1–4), FN-002 Match request to aircraft
  (step 5), FN-011 Dispatch aircraft (release later, in SCN-002). Students name the step that yields FN-013? None: FN-013
  Forecast demand is a planning function with no scenario (the reference records this exception).
- **Figure.** SCN-001 steps as a vertical strip, each step bracketed to the function it exercises.
- **Sources.** `reference/week03.ts` SCN-001; `reference/week08.ts` (FN → SCN links); R20b p.594.

#### S1.13 Functions from capabilities (3 min)
- **Purpose.** Show the derivation and its coverage check.
- **Content.** The capability-to-function table (§4.1). Every CAP has at least one FN; FN-005 serves two (CAP-001,
  CAP-007); FN-009 and FN-011 also serve two. Coverage question: which capability is served only through its parent?
  (None: CAP-010 has FN-007.)
- **Figure.** A bipartite graph, 10 CAP nodes left, 14 FN nodes right.
- **Sources.** `reference/week08.ts`, `reference/week03.ts`.

### Section D: Logical and physical elements and allocation (18 min)

#### S1.14 Logical and physical (3 min)
- **Purpose.** The two structural views.
- **Content.**
  - Logical configuration items have allocated functions, interfaces and requirements but no specific implementation;
    physical items are the specific implementation (R19 p.571).
  - Logical architecture: a set of related technical concepts and principles supporting the logical operation of the
    system; includes functional, behavioral and temporal architecture (P4-9 p.1554).
  - Physical architecture: an arrangement of physical elements (system elements and physical interfaces) providing the
    design solution for a product, service or enterprise (P4-10 p.1587; R20c p.596).
  - Requirements are allocated to both (R20c p.596).
- **Figure.** Three stacked planes (functional, logical, physical) with vertical allocation arrows for FN-006 → LOG-002 →
  PHY-003.
- **Sources.** R19 p.571; R20c p.596; P4-9 p.1554, P4-10 p.1587 (register additions).

#### S1.15 Allocation criteria (4 min)
- **Purpose.** Allocation needs a reason.
- **Content.**
  - First identify elements that can perform the functions and interfaces that can carry the flows (R20c p.598).
  - Affinity criteria (R20c pp.598–599): similar transformations within one technology, similar efficiency, exchange of
    the same type of flow (information, energy, materials), centralized or distributed control, similar execution
    frequency, dependability, environment resistance, other enterprise constraints.
  - Aims (R20c p.599): fewer physical interfaces, separately testable elements, compatible technology, proximity, ease
    of handling, shared resources, modularity, resilience.
  - Outputs include an allocation matrix of functions to physical elements and a traceability matrix to system
    requirements (R20c p.600).
  - **Course convention:** every allocation carries one sentence naming its criterion and the ID it rests on.
- **Figure.** A criteria card deck (eight cards); one card face-up on an allocation arrow.
- **Sources.** R20c pp.598–600.

#### S1.16 Two allocation pitfalls (2 min)
- **Purpose.** What reviewers catch.
- **Content.** Skipping the logical architecture; allocating functions straight onto technologies at a high level
  instead of alternating logical and physical levels (R20c p.602).
- **Figure.** Two "don't" arrows: requirement → product box (red), function → technology box (red); the correct
  zig-zag through a logical plane (green).
- **Sources.** R20c p.602.

#### S1.17 Worked: FN → LOG → PHY with justification (6 min)
- **Purpose.** The full method once on AeroLink.
- **Content.** The allocation table (§4.2). Three rows reasoned aloud, with students supplying the criterion:
  - FN-006 Charge aircraft → LOG-002 → PHY-003: energy and the charge handshake cross the same physical interface
    (exchange of the same flow type); serves REQ-SYS-001.
  - FN-008 Assess aircraft health → LOG-003 → PHY-005: certifying technicians and diagnostic tools sit there; AI-001 is
    hosted with them (human decision on every withdrawal).
  - FN-002 Match request to aircraft → LOG-005 → PHY-004: centralized control gives one network-wide assignment
    (REQ-SYS-005; DEC-002).
  - Check rule from the reference: every FN's PHY is one that its performing LOG is allocated to.
- **Figure.** A three-column swimlane (FN | LOG | PHY) with criterion labels on the arrows.
- **Sources.** R20c pp.598–599; `reference/week08.ts`.

#### S1.18 The process frame: DoD Architecture Design (3 min)
- **Purpose.** Professional context and baselines.
- **Content.** Architecture Design translates the outputs of stakeholder requirements definition and requirements
  analysis into alternative design solutions (R48 p.144). The functional architecture allocates functions to hardware,
  software, facilities and human operations; the physical architecture is one or more product structures (R48 p.145).
  Derived requirements come from solution decisions and must stay traceable; the output is the allocated baseline (R48
  p.146). Human operations are allocation targets: AeroLink allocates decisions to the duty manager and to certifying
  technicians.
- **Figure.** A flow: stakeholder requirements → requirements analysis → architecture design → allocated baseline, with
  a "derived requirements" side arrow.
- **Sources.** R48 pp.144–146 (proposed split entry P4-1, §9).

### Section E: Decisions, the enterprise view and exit (9 min)

#### S1.19 Recording an architecture decision: DEC-002 (4 min)
- **Purpose.** Architecture decisions are engineering records (rubric criterion "rationale").
- **Content.** DEC-002 "One operations platform with hot standby": alternatives considered (distributed dispatch at each
  vertiport; single platform without standby; single platform with hot standby); rationale (one network-wide assignment
  for REQ-SYS-005; the standby removes the single point of failure R-007). Students test it against NEED-001 and R-007.
  The quantitative comparison (coupling count) is the Week 5 graduate task.
- **Figure.** A decision card: question, three alternatives with a check on the selected one, rationale, risks touched.
- **Sources.** `reference/week08.ts` DEC-002, `reference/week06.ts` R-007; R48 p.146 (decision analysis trades
  alternatives).

#### S1.20 The enterprise view (2 min)
- **Purpose.** The fourth perspective.
- **Content.** Which organizations own which elements and agreements: AeroLink (fleet, operations center, booking),
  vertiport operators (pads and chargers, WSoI), utility, OEM, approving authorities. The enterprise view shows
  organizational agreements (IF-004 work-order handover; IF-009 pad-slot agreement) and where the enterprise boundary cuts
  the physical view. MITRE notes that "as is" and "to be" views help stakeholders see migration paths (R62 p.345), which
  Week 6 uses.
- **Figure.** The physical view tinted by owner, with organizational agreements as dashed double lines.
- **Sources.** `aerolinkCase.ts` (SYSTEM_OF_INTEREST, ENTERPRISE); `reference/week08.ts`; R62 p.345.

#### S1.21 Exit (3 min)
- **Purpose.** Retrieval and preparation.
- **Content.** One-minute paper: "Name one function of your enterprise and the criterion you would use to allocate it."
  Before Session 2: list three decisions your enterprise makes daily and the information each needs (about 15 min).
- **Figure.** None (text slide with LMS link).
- **Sources.** Course convention.

**Session 1 running total**

| Section | Slides | Minutes | Cumulative |
|---|---|---|---|
| A Framing | S1.1–S1.3 | 7 | 7 |
| B Architecture and its description | S1.4–S1.8 | 18 | 25 |
| C Functions and decomposition | S1.9–S1.13 | 17 | 42 |
| D Logical, physical, allocation | S1.14–S1.18 | 18 | 60 |
| E Decisions, enterprise view, exit | S1.19–S1.21 | 9 | **69** |
| References and credits (generated) | — | 0 | 69 + 6 buffer = **75** |

## 3. Session 2: The information view, the worked example and the lab launch (75 min = 69 + 6 buffer)

**Split decision: 47 min lecture, 22 min lab launch.** The information view and AI capabilities are new theory that the
lab depends on, so they are taught before the lab, not assigned as reading (A20). The in-room part of the lab is the
view-selection and function-list start, where instructor feedback prevents the most common error (physical names in the
functional view). The rest of the lab is out of class.

### Section F: Information management and the information view (23 min)

#### S2.1 Warm-up (3 min)
- **Purpose.** Retrieval of Session 1.
- **Content.** Three cards: (1) Is "Charger" a good function name? (2) Which allocation pitfall skips a plane? (3) What
  does DEC-002 record besides the choice? Reveal on the next click.
- **Figure.** The S1.17 swimlane with three blanks.
- **Sources.** R20b p.587; R20c p.602.

#### S2.2 What information management is for (3 min)
- **Purpose.** Ground the information view in a process.
- **Content.** Information management keeps information relevant, complete, verified, protected, distributed and managed;
  15288's purpose statement (generate, obtain, confirm, transform, retain, retrieve, disseminate, dispose) (R21 p.510).
  Among its business objectives is support for analytics and decision-making (R21 p.511). Honest scope note: R21 is
  written about project and enterprise information assets; the course applies it to operational information flows.
- **Figure.** An information life-cycle ring (generate → … → dispose) with one AeroLink item (INFO-004 weather) placed at
  each stage.
- **Sources.** R21 pp.510–511.

#### S2.3 Data versus information (5 min)
- **Purpose.** The distinction the deliverable asks for.
- **Content.**
  - The standards SEBoK cites distinguish the terms slightly differently (R21 p.511). SEBoK's synthesis: "data are raw
    unstructured values, and information is structured data in context that has been analyzed and interpreted" (R21
    p.512).
  - MITRE: "Data without context has no value; data that consumers never use is worthless" (P4-2 p.113). Data flows
    between systems, processes and departments and is transformed into useful information for decisions (P4-2 p.112).
  - AeroLink: a cell-temperature reading is data; "pack 7 is trending toward its limit within 40 cycles" is information
    (the 40-cycle figure is illustrative, proposed).
- **Figure.** A three-step transformation strip: raw readings → structured, contextualized record → decision.
- **Sources.** R21 pp.511–512; P4-2 pp.112–113 (register addition).

#### S2.4 Producer → consumer → decision (3 min)
- **Purpose.** The course method for each information item.
- **Content.** **Course convention** (instructor method, built on R21 p.511 "decision-making"): every INFO records a
  producer, a consumer and the decision supported, ideally naming the REQ or DEC it serves. If no decision can be named,
  the item is data not yet turned into information, or nobody needs it.
- **Figure.** A three-box template with an empty "decision" box highlighted.
- **Sources.** R21 p.511. Course convention.

#### S2.5 Information flows check the physical view (3 min)
- **Purpose.** Cross-view consistency (R62 p.345 "know the relationships").
- **Content.** **Course coverage rule:** a flow between two physical elements must cross an information interface, or a
  recorded relay of information interfaces; an organizational agreement carries no flow by itself. Preview of Week 5: the
  same check finds missing interfaces.
- **Figure.** Two physical boxes joined only by a dashed organizational line, with a data arrow that has nowhere to go.
- **Sources.** R62 p.345. Course convention.

#### S2.6 Metadata and sensitive information (2 min)
- **Purpose.** Information has owners and protection needs.
- **Content.** Metadata is "data about data" (title, author, provenance, status) and supports governance (R21 p.513).
  Security starts by defining sensitive information, such as information that identifies an individual (R21 p.514).
  AeroLink: INFO-001 passenger information carries accessibility needs, so it is sensitive. The owner and provenance tags
  on every course element are metadata.
- **Figure.** An INFO-001 card with a metadata strip and a lock icon.
- **Sources.** R21 pp.513–514.

#### S2.7 AI capabilities in the information view (4 min)
- **Purpose.** AI as a consumer and producer of information, with a human in the loop.
- **Content.** SEBoK: in both knowledge-based and learning approaches, a human is in the loop to validate the
  intelligence gained by the system (R31 p.1370). **Course convention** AI capability card: inputs, outputs, human
  oversight, failure mode. AI-001 Predictive maintenance and AI-002 Demand forecasting (§4.4).
- **Figure.** Two AI cards on the information-flow diagram, each with a human-decision diamond downstream.
- **Sources.** R31 p.1370; `reference/week08.ts`. Course convention (card fields).

### Section G: AeroLink worked example (16 min)

#### S2.8 The five information items (5 min)
- **Purpose.** The complete view, read across.
- **Content.** The INFO table (§4.3): producer, consumer, decision supported for INFO-001..005.
- **Figure.** A producer → INFO → consumer graph with the decision written on each consumer arrow.
- **Sources.** `reference/week08.ts`.

#### S2.9 Answering the driving question (4 min)
- **Purpose.** Close S1.2.
- **Content.** Fault status: produced by PHY-005 from INFO-002 health reports (IF-013), sent to dispatch over IF-012
  within the 2 min of REQ-SYS-008. Charge state: charge-session records from PHY-003 over IF-010. Forecast: INFO-004 over
  IF-011. The decision is FN-011 Dispatch, at PHY-004, with the REQ-STK-006 interlock. Teaching history: in the first
  reference version, the fault status had only the organizational IF-004 to travel on; the information trace exposed the
  gap and IF-012 and IF-013 were added.
- **Figure.** The S1.2 scene redrawn with three labeled arrows and their interface IDs.
- **Sources.** `reference/week08.ts`; `docs/authoring/reference_model_notes.md` §1 (instructor history).

#### S2.10 AI-001 with its oversight (3 min)
- **Purpose.** Show a complete AI capability card and its failure path.
- **Content.** Inputs INFO-003 (cell temperatures, capacity trends); output a ranked at-risk list; oversight: a certifying
  technician decides every withdrawal, the model never releases an aircraft; failure: a missed prediction leaves the
  reactive FN-008 path as the safety net, false alarms cost availability (MOP-006). Mitigates R-002.
- **Figure.** The card with a fault-tree-style branch for missed prediction vs false alarm.
- **Sources.** `reference/week08.ts`, `reference/week06.ts`; R31 p.1370.

#### S2.11 Auditing the view: two defects in the reference (4 min)
- **Purpose.** Evaluate, not just read (as Week 1's coverage audit did).
- **Content.**
  - IF-011 names EXT-003 Weather as an interface end, but weather is a natural system (Week 1 rule: systems have owners;
    weather has none). The real producer is a weather information service, which the context does not list. Proposed fix:
    a new external system "Weather information service" **(proposed, instructor to confirm)**.
  - INFO-005's consumer is DEC-001, a decision record, not an element. Proposed reading: consumer = network planning (an
    AeroLink role), decision supported = DEC-001 **(proposed, instructor to confirm)**.
- **Figure.** Two red callouts on the S2.8 graph.
- **Sources.** `reference/week08.ts`; Week 1 context rule (`aerolinkCase.ts` EXTERNAL_SYSTEMS).

### Section H: Consolidation and bridge (8 min)

#### S2.12 Keeping the views consistent (3 min)
- **Purpose.** One description, not four.
- **Content.** Related views must be consistent and share data managed centrally (R62 p.345). Course checks: every FN
  from a CAP and (except planning functions) an SCN; every FN allocated to one PHY that its LOG reaches; every INFO with a
  producer, consumer and decision; every flow covered by an information interface or a recorded relay.
- **Figure.** Four view icons around a central ID register, with check marks on the connecting spokes.
- **Sources.** R62 p.345. Course convention (checks).

#### S2.13 Common errors (3 min)
- **Purpose.** Consolidate by contrast.
- **Content.** (1) Physical names in the functional view. (2) Decomposing too deep. (3) Functions without inputs and
  outputs (R20b p.594). (4) Allocation without a criterion (R20c pp.598–599). (5) Skipping the logical plane (R20c p.602).
  (6) Information items with no decision. (7) An organizational agreement drawn as the carrier of a data flow. (8) An AI
  capability with no human oversight (R31 p.1370). (9) Views produced for their own sake (R62 p.344).
- **Figure.** Error → correction table.
- **Sources.** As listed.

#### S2.14 Where this goes: Week 5 and Week 10 (2 min)
- **Purpose.** Continuity.
- **Content.** Week 5 breaks the physical view into components and defines every interface. Week 10 models functions as
  actions and scenarios as use cases; Week 11 models the physical elements and allocations (§7).
- **Figure.** A three-lane trace FN-006 → (Week 5) IF-005, IF-010 → (Week 10/11) model element types.
- **Sources.** COURSE_SCHEDULE.md rule 6; R72 pp.30–47 and R76 pp.106–107 (Phase II; named only).

### Section J: Laboratory launch (22 min)

#### S2.15 Lab L4 brief (3 min)
- **Content.** Deliverables (§5.5), minimums, due before Week 5 Session 1; the team's own enterprise, never AeroLink.
- **Figure.** One-slide checklist with owners by lead role.
- **Sources.** Course convention.

#### S2.16 Team work: view purposes and the function list (12 min)
- **Content.** Teams write one purpose sentence per view and derive their first functions by walking one of their Week 2
  scenarios. The instructor circulates and flags physical names in function lists.
- **Figure.** Timer plus the view-purpose template.
- **Sources.** R62 p.344; R20b p.594.

#### S2.17 Instructor check (5 min)
- **Content.** Two or three teams show one scenario → function mapping; quick feedback to the room.
- **Sources.** Course convention.

#### S2.18 Close: the next seven days (2 min)
- **Content.** Out-of-class sequence (§5.4); quiz opens; log hours.
- **Sources.** Course convention.

**Session 2 running total**

| Section | Slides | Minutes | Cumulative |
|---|---|---|---|
| F Information management and view | S2.1–S2.7 | 23 | 23 |
| G AeroLink worked example | S2.8–S2.11 | 16 | 39 |
| H Consolidation and bridge | S2.12–S2.14 | 8 | 47 |
| *Lecture subtotal* | *14 slides* | *47* | |
| J Lab launch | S2.15–S2.18 | 22 | **69** |
| References and credits (generated) | — | 0 | 69 + 6 buffer = **75** |

## 4. AeroLink worked example (FICTIONAL; from `src/model/reference/week08.ts` unless stated)

### 4.1 Capabilities → functions (with the scenario that exercises each)

| FN | Name | From CAP | Exercised in |
|---|---|---|---|
| FN-001 | Accept ride request | CAP-002 | SCN-001 |
| FN-002 | Match request to aircraft | CAP-002 | SCN-001 |
| FN-003 | Plan flight | CAP-004 | SCN-002 |
| FN-004 | Assess dispatch weather | CAP-005 | SCN-005 |
| FN-005 | Fly passenger trip | CAP-001, CAP-007 | SCN-002 |
| FN-006 | Charge aircraft | CAP-003 | SCN-003 |
| FN-007 | Control vertiport charging power | CAP-010 | SCN-003 |
| FN-008 | Assess aircraft health | CAP-006 | SCN-004 |
| FN-009 | Manage fleet availability | CAP-008, CAP-006 | SCN-004 |
| FN-010 | Detect and report pad fire | CAP-009 | SCN-003 |
| FN-011 | Dispatch aircraft | CAP-002, CAP-004 | SCN-002 |
| FN-012 | Coordinate flight intent | CAP-004 | SCN-002 |
| FN-013 | Forecast demand | CAP-008 | none (planning function) |
| FN-014 | Board and alight passengers | CAP-001 | SCN-002 |

### 4.2 Allocation FN → LOG → PHY, with the requirement allocated to each function

| FN | LOG (performs) | PHY | Requirement allocated | Criterion to state (students supply; model answer) |
|---|---|---|---|---|
| FN-001 | LOG-004 Customer Services | PHY-007 Passenger booking platform | REQ-STK-001 | Passenger-facing information exchange |
| FN-002 | LOG-005 Scheduling | PHY-004 Operations Center | REQ-SYS-005 | Centralized control (DEC-002) |
| FN-003 | LOG-001 Flight Operations | PHY-004 | REQ-SYS-003 | Same information flows as dispatch |
| FN-004 | LOG-006 Decision Support | PHY-004 | REQ-SYS-004 | Weather information consumed centrally |
| FN-005 | LOG-001 | PHY-001 eVTOL Aircraft | REQ-SYS-002, REQ-SYS-007 | Only the aircraft can perform it |
| FN-006 | LOG-002 Fleet Management | PHY-003 Charging Systems | REQ-SYS-001 | Energy and charge handshake share IF-005 |
| FN-007 | LOG-002 | PHY-003 | REQ-SYS-010 | Enforcement in the charger, not by procedure |
| FN-008 | LOG-003 Maintenance Management | PHY-005 Maintenance Facility | REQ-SYS-008 | Certifying technicians and tools located there |
| FN-009 | LOG-002 | PHY-004 | REQ-SYS-006 | Fleet-wide planning |
| FN-010 | LOG-007 Vertiport Operations | PHY-008 Pad fire detection and alarm system | REQ-SYS-009 | Detection must be at the pad |
| FN-011 | LOG-005 | PHY-004 | REQ-STK-006 | Interlock reads central fault status |
| FN-012 | LOG-001 | PHY-004 | REQ-STK-009 | Single point of contact with the ANSP |
| FN-013 | LOG-006 | PHY-004 | — | Planning data held centrally |
| FN-014 | LOG-007 | PHY-002 Vertiports | REQ-STK-007 | Step-free route is a site property |

LOG → PHY (reference): LOG-001 → PHY-001, PHY-004; LOG-002 → PHY-003, PHY-004; LOG-003 → PHY-005; LOG-004 → PHY-007,
PHY-004; LOG-005 → PHY-004; LOG-006 → PHY-004; LOG-007 → PHY-002, PHY-008. PHY-006 Communications Infrastructure is the
medium of the information interfaces and has no function allocated. The criteria column is instructor reasoning
**(proposed, instructor to confirm)**; the reference stores no criterion field.

### 4.3 Information view

| INFO | Content | Producer | Consumer | Decision supported |
|---|---|---|---|---|
| INFO-001 Passenger Information | Requests, party size, accessibility needs, confirmation and boarding timestamps | PHY-007; PHY-002 boarding gates | PHY-004 scheduling; AI-002 | Which aircraft to assign, and when (REQ-SYS-005); wait monitoring (MOE-001) |
| INFO-002 Flight Data | Flight plan, position, energy state, landing energy, health and fault reports | PHY-001 | PHY-004; PHY-005 | Whether the next leg can be dispatched with the reserve (REQ-SYS-003) |
| INFO-003 Maintenance Data | Faults, deferrals, work orders, release records, charge-session data | PHY-005; PHY-003 | PHY-004 dispatch; AI-001 | Release or withhold an aircraft (REQ-STK-006, REQ-SYS-008) |
| INFO-004 Weather Data | Observed and forecast wind, gust, visibility per vertiport | EXT-003 via a weather service (see §4.6) | PHY-004 decision support | Place or lift a dispatch hold (REQ-SYS-004) |
| INFO-005 Financial Data | Fare revenue, operating cost, capital spend | PHY-007; LOG-002 | DEC-001 (see §4.6) | How much capacity to add and when |

### 4.4 AI capability cards

| ID | Inputs | Outputs | Human oversight | Failure mode | Risk link |
|---|---|---|---|---|---|
| AI-001 Predictive maintenance (on PHY-005) | INFO-003 incl. cell temperatures and capacity trends | Ranked at-risk aircraft and packs with predicted time to limit | Certifying technician decides every withdrawal; never releases an aircraft | Missed prediction → reactive FN-008 remains; false alarms cost availability (MOP-006) | Mitigates R-002 |
| AI-002 Demand forecasting (on PHY-004) | INFO-001 history, calendar, weather outlook | Hourly forecast; Year-2 re-forecast (A-006) | Network planning reviews quarterly before DEC-001 | Over-forecast strands capital; under-forecast repeats the charging limit (R-001) | Mitigates R-001 |

### 4.5 Architecture decision
DEC-002 as in S1.19.

### 4.6 Reference-data defects found while building this example (for reconciliation; not changed here)
1. **IF-011 / INFO-004:** an interface end and an information producer are EXT-003 Weather, a natural system. Add an
   external system for the weather information service (proposed) or rename the end.
2. **INFO-005:** consumer is a decision record (DEC-001); the flow `INFO-005 flows-to DEC-001` mixes element kinds.
3. **`reference/week01.ts`:** EXT-001, EXT-002, EXT-004, EXT-006 still carry organization names; the case module's
   corrected names are used here (Week 1 finding F03).
4. **Spelling:** `week08.ts` "organisational", "centre", "utilisation"; to be Americanized on student surfaces.
5. **Need coverage:** the Week 1 corrected set has NEED-012..017; no capability or function traces to them yet (for
   example, no function realizes NEED-003's evening event cap). Weeks 2–3 decide whether the reference grows; Week 4 should
   not add functions until then (faculty decision; DECISION_LOG W9 counts).
6. **Modes:** the reference has no system modes, although R20a p.581 lists mode variations in a functional view.

## 5. Laboratory outline: Lab L4, Architecture description and information view

### 5.1 Inputs
- The team's approved enterprise and package: Week 1 stakeholders, concerns, needs; Week 2 ConOps scenarios,
  capabilities, stakeholder and system requirements with traces; Week 3 readiness assessment, risk register and trade
  decision.
- Session 1–2 slides, the long-form lesson, the AeroLink tables (§4).
- Readings (essential, 19 pp): R19 pp.569–573; R62 pp.341–345; R20b pp.587, 594; R20c pp.596–599; R21 pp.510–512.

### 5.2 Objectives
W4.1–W4.6 applied to the team's own enterprise.

### 5.3 Method
1. **View set:** one purpose sentence per view (operational, functional, physical, enterprise), naming the stakeholders and
   concerns it serves (S1.6–S1.7).
2. **Functions:** walk each Week 2 scenario step by step; name functions verb + object with inputs and outputs; trace each
   to a capability (S1.9–S1.13).
3. **Decomposition:** at most three levels; check against the R20b pitfalls (S1.11).
4. **Logical and physical elements:** group functions into logical elements, then allocate to physical elements (S1.14).
5. **Allocation matrix:** each FN → LOG → PHY with a criterion sentence and the requirement it serves (S1.15–S1.17).
6. **Decision record:** at least one architecture decision with three alternatives and rationale, linked to a risk
   (S1.19).
7. **Information view:** every information item with producer, consumer, decision; data vs information stated (S2.3–S2.5).
8. **AI capability:** at least one AI card with oversight and failure mode (S2.7).
9. **Consistency check:** the four checks of S2.12.

### 5.4 Procedure

| Step | When | Lead role | Output |
|---|---|---|---|
| 1. View purposes; first scenario walk | In class, S2.16 | Architecture | Part 1 draft |
| 2. Remaining scenario walks; function list with I/O | Day 1–2 | Each member walks one scenario | Part 2 |
| 3. CAP → FN trace and decomposition | Day 2 | Requirements & Compliance | Part 2 trace |
| 4. Logical elements; allocation matrix with criteria | Day 3–4 | Architecture | Part 3 |
| 5. Decision record | Day 4 | Architecture with whole team | Part 4 |
| 6. Information view (≥ 5 items) | Day 4–5 | AI & Data Management | Part 5 |
| 7. AI capability card(s) | Day 5 | AI & Data Management | Part 6 |
| 8. Consistency check and AI usage statement | Day 6 | Verification & Validation | Part 7 |
| 9. Integration and upload | Day 7 | V&V lead | Submission |

### 5.5 Outputs
`team-NN-week4-architecture.md` and `team-NN-week4-model-inputs.json` (FN, LOG, PHY, INFO, AI, DEC elements and
derives-from, performs, allocated-to, flows-to links, mirroring the reference schema). Minimums (course convention):
4 view purposes; ≥ 10 functions; ≥ 4 logical and ≥ 4 physical elements; every function allocated with a criterion;
≥ 1 decision; ≥ 5 information items; ≥ 1 AI card. For 3-person teams: ≥ 8 functions.

### 5.6 Rubric rows (ASSESSMENT_RUBRICS.md RB-7)

| Row | Criterion | Applied this week |
|---|---|---|
| RB-7.1 | Viewpoints (15) | Yes. Four perspectives, each with purpose and concern |
| RB-7.2 | Decomposition (20) | Yes. Functions from capabilities **and scenarios**; no physical names |
| RB-7.3 | Allocation and interfaces (25) | **Allocation part only** (complete FN → PHY with criteria). The N² and typed interfaces are assessed in Week 5; this row is scored at most 3 this week (faculty to confirm) |
| RB-7.4 | Rationale (10) | Yes. ≥ 1 decision with alternatives |
| RB-7.5 | Information flows (20) | Yes. Producers, consumers, flows, data vs information, decision supported |
| RB-7.6 | AI capabilities (10) | Yes. Inputs, outputs, oversight, failure |
| RB-12.1–12.3 | AI usage statement | Yes |

Formative; feedback before Week 5 Session 2.

### 5.7 Per-student workload (budget about 8 h)

| Activity | Hours | Basis |
|---|---|---|
| Class sessions | 2.5 | 2 × 75 min |
| Readings, 19 pp at about 15 pp/h | 1.3 | §5.1 |
| Lecture handout and worked example | 0.4 | about 4,000 words |
| Session 2 pre-work (three decisions and their information) | 0.2 | S1.21 |
| Lab share (steps 2–9) | 2.5 | about 10 person-hours per team of 4 (scenario walks 2.5; trace and decomposition 1.0; allocation 2.5; decision 1.0; information view 1.5; AI card 0.5; checks and integration 1.0) |
| Quiz | 0.3 | 10 items |
| Individual exercise (graduate: the graduate task) | 0.7 | §6.2 |
| Time log | 0.1 | |
| **Total** | **8.0** | 3-person teams: about 8.8 h unless the function minimum drops to 8 |

## 6. Assessment outline (separate from the lecture; unseen, non-AeroLink contexts)

### 6.1 Quiz Q4 (individual, 15 min, 10 items: 7 single-best-answer, 3 short answer ≤ 40 words)

| # | Objective | Bloom | Item focus (unseen context) | Key rests on |
|---|---|---|---|---|
| 1 | W4.4 | Understand | Which statement describes an architecture rather than an architecture description? | P4-3 p.1445 |
| 2 | W4.1 | Understand | Match view, viewpoint and framework to definitions | R62 p.341; P4-5, P4-6 |
| 3 | W4.1 | Apply | A hospital board asks about patient flow: which view answers it? | R62 p.344 |
| 4 | W4.2 | Apply | Which of four "functions" for a water utility is a physical element in disguise? | R20b p.587 |
| 5 | W4.2 | Analyze | A team decomposed to six levels and has no scenarios: name the two pitfalls | R20b p.594 |
| 6 | W4.2 | Analyze | Choose the affinity criterion that justifies a given allocation | R20c pp.598–599 |
| 7 | W4.4 | Analyze | Sort five items from a rail operator into data and information | R21 p.512 |
| 8 (SA) | W4.3 | Apply | Complete producer → consumer → decision for a given campus-shuttle item | Course method; R21 p.511 |
| 9 (SA) | W4.6 | Analyze | Name the missing oversight in an AI triage card and its failure mode | R31 p.1370 |
| 10 (SA) | W4.5 | Evaluate | Critique a decision record that lists one alternative | R48 p.146; rubric criterion (rationale) |

Scoring: 1 point items 1–7, 2 points items 8–10 (13). Distractors from S2.13; keys balanced across positions.

### 6.2 Graduate task (individual, about 40 min; always-read notebook entry)
**Viewpoint coverage and one decision defended.** Build a concern × view matrix for the team's enterprise (every Week 1
concern against the four views); identify concerns no view addresses and propose the missing view. Then evaluate the
team's architecture decision against one stated criterion from R20c p.599 (e.g., fewer physical interfaces or
resilience), stating what evidence would reverse it. Rubric: coverage completeness, correctness of the criterion use,
quality of the reversal condition, citations (4 levels each).

## 7. Continuity to Phase II

- **Week 10 (Logical / Behavioral Modeling)** models this week's functional and logical work together with Week 2's
  scenarios (COURSE_SCHEDULE rule 6: Week 10 ↔ Weeks 2 and 4). Functions become action definitions and usages with their
  inputs and outputs; scenarios become use cases and action flows; logical elements become parts that perform actions.
  Readings named only: R72 pp.30–47 (actions), R76 pp.100–107 (use cases; allocation on pp.106–107).
- **Week 11 (Physical / Interfaces)** models the physical elements and the FN → PHY and LOG → PHY allocations as
  allocations; information items become items carried by flows across interfaces (R71 pp.18–29: connections, ports,
  interfaces and flows; named only).
- **Week 14** uses the view purposes again for stakeholder views (R85 views and viewpoints; R78 pp.145–162 standard view
  definitions; named only).
- Stable IDs (FN, LOG, PHY, INFO, AI, DEC) are the import keys.

## 8. Source gaps

1. **ISO/IEC/IEEE 42010** (architecture description; concern, viewpoint, view) is cited by SEBoK but not in the
   collection; the two available viewpoint definitions differ in wording (R62 p.341 vs P4-6 p.1678).
2. **Four-perspective set** (operational, functional, physical, enterprise) comes from the course document, not from a
   source; MITRE names operational, system and technical views (R62 p.341). Taught as a course convention.
3. **Operational information view.** R21 treats project and enterprise information assets; no source in the collection
   gives a method for operational producer → consumer → decision views. The method is a course convention.
4. **DoDAF** viewpoints are referenced (P4-4 p.1446; R62 p.343) but the framework is not in the collection.
5. **AI capability specification** (inputs, outputs, oversight, failure): only general support (R31 p.1370); the card is
   a course convention.
6. **Allocation criterion record** (one sentence per allocation) is a course rule; R20c gives criteria, not a record
   format.

## 9. Register additions needed

All verified in the extracted text for this outline (heading or title checked on the first page; page supports the claim
cited). None is in `readings.py` yet.

| Proposed ID | Source, PDF pages | Title | Used on | Verification note |
|---|---|---|---|---|
| P4-1 | DoD SE Guidebook pp.144–147 | 4.2.3 Architecture Design Process (proposed **R48c**, split from umbrella R48) | S1.18, S2.13, quiz 10 | Heading "Architecture Design Process" on p.144; pp.144–146 support translation of requirements into alternatives, functional/physical architecture, derived requirements, allocated baseline. Shared with Week 5 |
| P4-2 | MITRE SEG pp.111–113 | Information and Data Management | S2.3 | Title and definition on p.111; p.112 data transformed into information for decisions; p.113 "data without context has no value" |
| P4-3 | SEBoK p.1445 | Architecture (glossary) | S1.4, quiz 1 | Entry heads the page; three definitions and the discussion of architecture vs description |
| P4-4 | SEBoK p.1446 | Architecture Framework (glossary) | S1.6 | Entry heads the page; definition after 42010 and framework examples |
| P4-5 | SEBoK p.1677 | View (glossary) [page begins with *Viable*] | S1.6, quiz 2 | Second entry on the page; one-line definition after OMG SysML 1.3 |
| P4-6 | SEBoK p.1678 | Viewpoint (glossary) | S1.6, quiz 2 | Entry heads the page |
| P4-7 | SEBoK pp.1510–1511 | Function (glossary) [p.1510 begins with *Framework*] | S1.9 | Second entry on p.1510; four definitions; discussion on p.1511 |
| P4-8 | SEBoK p.1511 | Functional Architecture (glossary) [page begins with *Function* discussion] | S1.10 | Two SEBoK-created definitions |
| P4-9 | SEBoK p.1554 | Logical Architecture (glossary) [page begins with *Location-Based Service*] | S1.14 | Second entry; SEBoK definition (functional, behavioral, temporal) |
| P4-10 | SEBoK p.1587 | Physical Architecture (glossary) [page begins with *Personnel*] | S1.14 | Second entry; two definitions |

Pages used inside existing ranges (no addition): R20c pp.600, 602; R21 pp.513–514; R31 p.1370; R13 pp.557, 561.

**Week 4 essential readings (proposed):** R19 pp.569–573; R62 pp.341–345; R20b pp.587, 594; R20c pp.596–599; R21
pp.510–512. **Extension:** R20a pp.580–581; R48 pp.144–146; P4-2 pp.111–113; R31 pp.1368–1370.

## 10. Open items for faculty

1. Adopt the four-perspective view set as a course convention (vs MITRE's operational/system/technical).
2. Score RB-7.3 in two parts across Weeks 4 and 5 (allocation now, interfaces next week).
3. Fix the reference defects in §4.6 (weather information service as an external system; INFO-005 consumer).
4. Whether the reference grows to cover NEED-012..017 with capabilities and functions (DECISION_LOG W9 counts).
5. Approve the register additions P4-1..P4-10 and the R48c split.
6. Raise W4.1 to Evaluate and accept W4.4–W4.6.
