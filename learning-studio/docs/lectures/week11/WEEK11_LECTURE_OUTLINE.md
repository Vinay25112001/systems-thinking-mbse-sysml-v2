# Week 11 Lecture Outline: Physical / Interfaces

**Superseded in part (2026-10-22).** The week is built; where this outline and the built week differ (workload, exercise, quiz), the built week and `WEEK11_MILESTONE_REPORT.md` govern.
**Status.** Draft for faculty approval (COURSE_PRODUCTION_PLAN M2, outlines for Weeks 2–14). Written 2026-10-19. New, pending review. Nothing here is in `src/` yet.
**Governing documents.** DECISION_LOG A19 and A20; COURSE_SCHEDULE.md (Week 11 subject, exact; instructional rules 2, 3, 4 and 6); COURSE_PRODUCTION_PLAN.md (definition of done A–I); the Week 1 template and its review lessons (`../week01/REVIEW_DISPOSITIONS.md`).
**Format.** Two sessions of 75 minutes each, planned as 69 minutes of content plus a 6-minute buffer.
- Session 1 is all lecture: 23 slides plus a generated "References and credits" slide (0 min).
- Session 2 is 47 minutes of lecture (14 slides) followed by 22 minutes of laboratory launch (4 slides), plus the references slide.
- Total: 41 content slides.

## 0. Conventions used in this outline

- **Citations.** `R81 p.106` = verified register entry R81 (S06, SysML v2.1 Beta 2 (Release 2026-07) language specification, PDF pages 90–116, which spans clauses 7.11–7.16), PDF page 106. `R71 sl.22` = slide 22 of the OMG SST textual-notation deck, release 2026-08 (S10). SEBoK, DoD and MITRE pages are PDF pages (DECISION_LOG W1). The specification is never called "the standard" (W4).
- **Proposed register additions** are written `PX10 p.610` (shared placeholder) or `P11.1` (this week only); §10 lists them. Each page was opened for this outline.
- **Every SysML v2 claim** below was checked against the page text in `_source_cache/` on 2026-10-19. A citation supports only what is written beside it.
- **Recorded checker behavior** comes from the recorded runs of 2026-10-11 (`sysml/validation-report.json`; probes in `docs/authoring/week10_notes.md`, earlier numbering). It describes release 2026-08 only and is not literature.
- **Course convention** marks a modeling choice the course makes that the SysML texts do not prescribe (for example, logical and physical structure kept in separate packages; ports written from the producing side).
- **AeroLink** values are FICTIONAL and come from `sysml/reference/aerolink_v02_req_structure.sysml` (Physical package: item, port and interface definitions; PHY-001..008; IF-001..014; INFO-001..005; allocations; satisfy) and `src/model/reference/week08.ts` (architecture layer, earlier numbering). Nothing is retyped from memory. Anything new is marked **(proposed, instructor to confirm)**.
- **Student-facing text** carries no internal IDs (decision-log IDs, FD numbers, source codes, P-numbers, old week numbers, objective codes); these appear only in Sources lines and faculty sections.
- **Pacing.** Spoken faculty notes, when written, stay at or below 130 words per minute on every slide.
- **The central rule this week.** An allocation assigns responsibility; a `satisfy` usage *asserts* that a requirement is satisfied when its subject is bound to the satisfying feature (R83 p.168). Neither is shown true by a checker PASS.

## 1. Learning objectives (graduate level)

| ID | Objective | Bloom | Taught in |
|---|---|---|---|
| B11.1 | Explain the physical architecture as an arrangement of system elements and physical interfaces, and how SysML v2 represents it with parts at any level of abstraction | Understand | S1.4–S1.6 |
| B11.2 | Model physical elements as part definitions and usages with multiplicity and quantity-typed attributes (ISQ/SI), distinguishing bound, default and initial feature values | Apply | S1.6–S1.8 |
| B11.3 | Model interfaces from the team's interface table: items, port definitions with directed features, conjugate ports, interface definitions and usages that connect compatible ports, and flows | Apply | S1.9–S1.17; S2.3–S2.6 |
| B11.4 | Allocate logical elements and functions to physical elements, and relate the design to requirements with `satisfy` or a recorded gap; explain what each relationship asserts | Analyze | S1.19–S1.22; S2.7 |
| B11.5 | Evaluate an interface model for coverage, direction and type errors that the checker does not report, and evaluate AI-generated physical alternatives against requirements | Evaluate | S2.8–S2.12 |
| Graduate | Specify one physical interface with a constraint on its port features (for example a power limit) and argue what the constraint adds to the interface definition | Evaluate | S2.13; assessment §6.2 |

Continuity with the earlier draft material: B11.2–B11.4 rework the structure half of the reviewed draft objectives "model logical and physical structure with ports and interfaces" and "relate design with satisfy and allocate"; the requirements half moved to Week 9.

## 2. Session 1: Physical structure, ports, interfaces and allocation (75 min, all lecture)

**Design rationale.** Week 10 built the logical architecture and behavior. Session 1 now builds the physical side: parts, attributes with units, items, ports, conjugation, connections, interfaces, bindings and flows, then allocation from logical to physical and the first defensible `satisfy` claims. AeroLink's interface IF-005 (aircraft ↔ charger power) is the running example. Two think-pair-share prompts; no team work.

### Section A: Framing (7 min)

#### S1.1 Week 11 at a glance (2 min)
- **Purpose.** Orient students.
- **Content.**
  - Subject, exactly as scheduled: *Physical / Interfaces*.
  - This week the component breakdown and interface table from Week 5 become model elements, connected to the logical architecture from Week 10 and the requirements from Week 9.
  - Session 1: the structural constructs and allocation. Session 2: the information view, gaps, checker limits, AI-generated alternatives, lab launch.
- **Figure.** Phase II strip with Week 11 highlighted; arrows from "Week 5 components and interfaces" and "Week 4 information view" into a Physical package.
- **Sources.** COURSE_SCHEDULE.md (schedule, rule 6).

#### S1.2 Driving question: can a model catch a wrong connection? (3 min)
- **Purpose.** Create a need to know.
- **Content.**
  - AeroLink's interface table says: charger → aircraft, electrical energy (physical). A team models both ends with the same port definition, and connects them.
  - Vote: (A) the model is correct, the connection exists; (B) the model is wrong, and the checker will say so; (C) the model is wrong, and the checker may not say so; (D) ports do not matter, only parts do.
  - Answer withheld until S1.17 (C).
- **Figure.** Two part boxes with identical port symbols facing each other, a connector between them, and a question mark.
- **Sources.** AeroLink IF-005 (reference v0.2, FICTIONAL). Recorded checker behavior: interface between two ports with the same directions PASSes with no message (2026-10-11 run; faculty-only).

#### S1.3 From the Week 5 tables to the model (2 min)
- **Purpose.** Make the continuity explicit (rule 6).
- **Content.**
  - Week 5 produced a component breakdown (PHY) and interface definitions (N² chart and interface table: both ends, type, what crosses). Week 4 produced the information view (INFO: producer, consumer, decision supported).
  - The IDs stay the same: PHY, IF, INFO. Each interface-table row becomes a port pair, an interface definition and an interface usage; each information item becomes an item definition carried by ports.
- **Figure.** One interface-table row exploded into five model elements (item def, port def, two ports, interface usage), each labeled with the column it came from.
- **Sources.** COURSE_SCHEDULE.md rule 6. Course convention (reference `README.md` §3.2, faculty-only).

**Transition A → B.** "First, what systems engineering means by a physical architecture, and why SysML v2 does not have a separate kind of physical part."

### Section B: Physical architecture and parts (14 min)

#### S1.4 The physical architecture in systems engineering (3 min)
- **Purpose.** Ground the week in SE theory.
- **Content.**
  - "A physical architecture model is an arrangement of physical elements, (system elements and physical interfaces) that provides the solution for a product, service, or enterprise" (R20c p.596).
  - It is intended to satisfy logical architecture elements and system requirements; system requirements are allocated to both the logical and physical architectures (R20c p.596).
  - A system element can be hardware, software, data, humans, processes, procedures, facilities, materials and naturally occurring entities; "a physical interface binds two system elements together" (R20c p.597).
  - Interface standards can be among the most important drivers of a physical architecture (R20c p.596).
- **Figure.** A layered sketch: logical elements on top, physical elements below, allocation arrows down; physical interfaces drawn as connectors between physical elements.
- **Sources.** R20c pp.596–597.

#### S1.5 Logical and physical in SysML v2: one construct, two viewpoints (3 min)
- **Purpose.** Prevent a common confusion.
- **Content.**
  - "A part can represent any level of abstraction, such as a purely logical component without implementation constraints, or a physical component with a part number, or some intermediate abstraction" (R81 p.90).
  - A system is modeled as a composite part; its parts may have attributes, ports, connections, perform actions and exhibit states (R81 p.90).
  - Course convention: logical and physical structure live in separate packages (`Logical`, `Physical`), so a function can be reallocated without being deleted. The distinction is the course's viewpoint, not a SysML kind.
- **Figure.** Two packages side by side, each with part symbols of the same shape; an allocation arrow crossing between them.
- **Sources.** R81 p.90. Course convention labeled.

#### S1.6 Part definitions, part usages and multiplicity (3 min)
- **Purpose.** Recall Week 8 in the physical setting.
- **Content.**
  - A part usage is defined by item definitions (including part definitions); its default multiplicity is `[1..1]` under the conditions in the specification (R81 p.92).
  - Parts inherit features from their definitions and can redefine them at any level of nesting; composite structure can also be specified entirely on parts (R70 sl.15–16).
  - AeroLink: `part <'PHY-001'> aircraft : EVTOLAircraft[12];` the multiplicity is the fleet size, a design decision recorded in the model.
- **Figure / SysML v2 example.** The `aeroLink` part with PHY-001..004 usages (four lines) and the `EVTOLAircraft` definition beside it.
- **Sources.** R81 p.92; R70 sl.15–16. Excerpt: reference v0.2 lines 684–780 (PASS in the 2026-10-11 checker run; FICTIONAL).

#### S1.7 Attributes with quantities and units (3 min)
- **Purpose.** Make physical characteristics computable.
- **Content.**
  - The Quantities and Units library provides reusable elements for quantities, units, scales and coordinate frames, representing the ISQ and SI (ISO/IEC 80000) and enabling automated unit conversion and dimension checking (PX10 p.610).
  - The ISQ defines seven base quantities and many derived ones; `SI` publicly imports `ISQ` and defines the units (R79 sl.167–168).
  - AeroLink: `attribute cruiseSpeed : SpeedValue = 150 [km/h];`, `attribute chargeTimeToDispatch : DurationValue;` (the quantity type is chosen in the definition; the value is bound in the usage).
  - Requirement constraints from Week 9 compare these same attributes; a unit error here breaks the requirement thread.
- **Figure.** One attribute declaration with callouts: name, quantity type (ISQ), value, unit (SI).
- **Sources.** PX10 p.610; R79 sl.167–168. Excerpt: reference v0.2 `EVTOLAircraft` and `ChargingSystems` (FICTIONAL).

#### S1.8 Bound, default and initial values (2 min)
- **Purpose.** Avoid writing a design claim by accident.
- **Content.**
  - A fixed feature value written with `=` binds the feature to the expression's result; it "cannot be overridden in a redefinition" (R81 p.96); such a feature value asserts the feature is equivalent to the expression (R81 p.105).
  - `:=` gives an initial value that may later change; `default` delays the binding and can be overridden (R81 pp.96, 105).
  - The feature-value notation "is a binding, not an initial or default value" (R71 sl.25).
  - Consequence: `attribute :>> chargeTimeToDispatch = 18 [min];` on PHY-003 is a claim about the design (here, the current estimate). A satisfy later reasons from it.
- **Figure.** Three rows: `=` (bound, fixed), `:=` (initial), `default =` (overridable), each with a one-line meaning.
- **Sources.** R81 pp.96, 104–105; R71 sl.24–25.

#### S1.9 Items: what flows (3 min)
- **Purpose.** Separate what is exchanged from where it is exchanged.
- **Content.**
  - An item definition defines a class of identifiable objects that may be acted on over time but do not necessarily perform actions; item usages can represent inputs and outputs "such as water, fuel, electrical signals and data" (P11.1 p.88).
  - "All parts are items, but not all items are necessarily parts" (P11.1 p.88; R70 sl.17).
  - Items may model continuous materials that flow between parts (R70 sl.17).
  - AeroLink: `item def ElectricalEnergy`, and the information items `INFO-001`..`INFO-005` from the Week 4 information view (each with producer, consumer and decision supported in its doc).
- **Figure.** Three item icons (energy, maintenance data, weather data) with their source column in the Week 4/5 tables.
- **Sources.** P11.1 p.88; R70 sl.17. AeroLink: reference v0.2 item defs (FICTIONAL).

**Transition B → C.** "An item says what flows. A port says where a part lets it in or out."

### Section C: Ports, connections, interfaces and flows (25 min)

#### S1.10 Ports and directed features (3 min)
- **Purpose.** The connection point concept.
- **Content.**
  - A port definition defines a connection point to enable interactions between occurrences, most commonly parts (R81 p.93).
  - A port definition defines features that can be made available via ports and replaces interface blocks in SysML v1; a port is a connection point through which a part makes some of its features available "in a limited way" (R71 sl.20).
  - A feature with a direction (`in`, `out`, `inout`) is a directed feature; directed features are always referential (R71 sl.20).
  - A port usage must only be defined by port definitions (R81 p.95).
  - Course convention (reference model): write each port definition from the producing side.
- **Figure / SysML v2 example.** `port def ChargingPort { out item energy : ElectricalEnergy; }` and `ChargingSystems` with `port chargerOutlet : ChargingPort;`.
- **Sources.** R81 pp.93, 95; R71 sl.20.

#### S1.11 Conjugation and compatible ports (3 min)
- **Purpose.** Get directions right.
- **Content.**
  - Two features match if they have conforming definitions and either both have no direction or they have conjugate directions; `in` and `out` are conjugates, `inout` is its own (R81 p.93).
  - Every port definition implicitly declares a conjugated port definition with reversed directions; `~P` is shorthand for a port defined by it (R81 p.95; R71 sl.21).
  - Two ports are compatible for connection if they have directed features that match with inverse directions (R71 sl.20).
  - AeroLink: `port chargeInlet : ~ChargingPort;` on the aircraft: energy is now an input.
- **Figure.** Charger and aircraft with port symbols; arrows showing `out energy` meeting `in energy` (via `~`).
- **Sources.** R81 pp.93, 95; R71 sl.20–21.

#### S1.12 Connections: logical connection or interface medium? (3 min)
- **Purpose.** Decide what the connector represents.
- **Content.**
  - A connection definition is both a relationship and a kind of part definition; a connection usage connects usage elements (R81 p.96).
  - A connection between parts "is often a logical connection that abstracts away details of how the parts are connected"; alternatively the medium (for example plumbing) can be modeled as a part that both ends connect to (R81 p.96).
  - AeroLink choice: PHY-006 (communications infrastructure) is the medium of five information interfaces, recorded in its doc, "not an end of any of them". The reference models the interfaces as logical connections between the communicating elements.
  - Think-pair-share (1 min): when would you model the medium as an end instead?
- **Figure.** Two renderings of IF-010: direct connector "over PHY-006" vs a charger → network → operations-center chain.
- **Sources.** R81 p.96. AeroLink: PHY-006 doc, reference v0.2 (FICTIONAL).

#### S1.13 Interface definitions and interface usages (3 min)
- **Purpose.** The interface construct.
- **Content.**
  - "An interface definition is a kind of connection definition … whose ends are restricted to be port definitions"; an interface usage is a usage of an interface definition (R81 p.106).
  - An interface facilitates the specification and reuse of compatible connections between parts (R81 p.106).
  - All end features of an interface must be port usages; the connection shorthands may be used (R81 p.109): `connect a to b` for binary connections, with ends in order (R81 p.103).
  - An interface usage connects two compatible ports (R71 sl.22).
- **Figure / SysML v2 example.** `interface def AircraftChargerPower { end chargerSide : ChargingPort; end aircraftSide : ~ChargingPort; }` and the IF-005 usage.
- **Sources.** R81 pp.103, 106, 109; R71 sl.22.

#### S1.14 End multiplicity and cross multiplicity (3 min)
- **Purpose.** Read multiplicities on interfaces correctly.
- **Content.**
  - Connection end features identify the participants and must have multiplicity 1..1 (R81 p.100).
  - Cross multiplicities constrain the number of connections, not the end values (R71 sl.18; R81 pp.101–102).
  - Example reading (course): `[0..1]` on the aircraft end of a charging-session interface means each charger is connected to at most one aircraft at a time; it does not mean "zero or one aircraft exist".
- **Figure.** One charger, three aircraft; at most one connector drawn at a time, labeled with the cross multiplicity.
- **Sources.** R81 pp.100–102; R71 sl.18, sl.22–23.

#### S1.15 Binding connections (2 min)
- **Purpose.** Equality across contexts.
- **Content.**
  - A binding is a binary connection that requires its two related usages to have the same values; it can bind a reference in one context to a composite feature in another (R81 p.96).
  - Declared with `bind a = b` (R81 p.104).
  - Use: bind a requirement's limit to the configured value of the satisfier (Week 9, worked example on TBD limits); bind a port feature to an internal attribute.
- **Figure.** Two features joined by an "=" connector.
- **Sources.** R81 pp.96, 104; R71 sl.24.

#### S1.16 Flows: messages, streaming flows and succession flows (3 min)
- **Purpose.** Model what crosses an interface.
- **Content.**
  - A flow definition classifies transfers of a payload from a source to a target; a flow usage represents the performance of such a transfer (R81 p.112).
  - Three forms: a message (says a transfer happens, not how the payload is obtained or delivered); a streaming flow (identifies the source output and target input features); a succession flow (adds that the source completes before the transfer, and the transfer before the target starts) (R81 p.113).
  - Messages are typically used for abstract logical interaction, realized later by streaming or succession flows (R81 p.113).
  - Flows can be defined inside an interface definition; they are established when the interface is used (R71 sl.28).
- **Figure.** Three arrows with the same source and target, annotated message / flow / succession flow.
- **Sources.** R81 pp.112–113; R71 sl.26–28.

#### S1.17 Worked example (a): IF-005 power and IF-010 data (4 min)
- **Purpose.** Everything in Section C on one AeroLink pair.
- **Content.**
  - IF-005 (aircraft ↔ charger power, physical): `ChargingPort` with `out item energy`; charger `chargerOutlet : ChargingPort`; aircraft `chargeInlet : ~ChargingPort`; interface definition `AircraftChargerPower` with an internal flow; usage with explicit end reference subsetting.
  - IF-010 (charger ↔ operations center data, information): `MaintenanceDataPort` carrying `INFO-003`; usage with the `connect a to b` shorthand; a separate flow usage of INFO-003.
  - Answer to S1.2: (C). Two ports with the same directions are not compatible (R71 sl.20), but the recorded run of release 2026-08 accepts such an interface with no message. The model would be wrong and silent.
- **Figure / SysML v2 example.** The existing listing (lines 22–59 on two slides).
- **Sources.** R71 sl.20–22, 27–28. Listing `sysml/week10/aerolink_ports_interfaces.sysml` (PASS in the 2026-10-11 checker run; FICTIONAL). Recorded result: `predict_pc1_interface_two_outputs.sysml` PASS (faculty-only). Reused from the reviewed draft worked example (b).

#### S1.18 Typing interfaces: physical, information, organizational (4 min)
- **Purpose.** Carry the Week 5 interface types into the model.
- **Content.**
  - Week 5 typed each interface as physical, information, organizational or external (course convention, from the interface inventory deliverable).
  - SysML v2 has one interface construct; the type is the course's classification, recorded in the interface's doc in the reference (`IF-004 … (organisational)`).
  - An organizational interface (IF-004 work-order handover; IF-009 pad-slot agreement) is modeled with ports carrying the agreed items (work orders, pad slots); course coverage rule: an organizational interface carries no information flow of its own.
  - External interfaces (IF-003, IF-006, IF-007, IF-011) sit in the context part, connecting the system of interest's ports to EXT parts.
  - Think-pair-share (1 min): is the battery-management handshake in IF-005 a second interface or a feature of the first?
- **Figure.** The AeroLink N² chart (PHY and EXT on the diagonal) with each off-diagonal cell colored by interface type and labeled with its IF ID.
- **Sources.** Course convention (Week 5 inventory; reference v0.2 IF docs; coverage rule in `src/model/reference/week08.ts` header, faculty-only). AeroLink IF-001..014 (FICTIONAL).

**Transition C → D.** "Structure says what is there. Allocation says who is responsible for what; satisfy says what the design is claimed to achieve."

### Section D: Allocation and satisfaction (17 min)

#### S1.19 Allocation in SysML v2 (3 min)
- **Purpose.** The allocation construct and its meaning.
- **Content.**
  - "An allocation definition is a connection definition … that specifies that a target element is responsible for realizing some or all of the intent of the source element" (R81 p.110).
  - Allocation is a mapping across the structures and hierarchies of a system model, usable early as a precursor to more rigorous specification (R81 p.110).
  - Allocations are instantiable connections, so they can be related to satisfying requirements, performing actions and exhibiting states (R81 p.111). In SysML v2 an allocation is not a dependency (R76 sl.107).
  - Allocations are always binary; the shorthand uses `allocate … to …` (R81 p.112). An allocation can be refined by nested allocations (R76 sl.106).
- **Figure / SysML v2 example.** `allocation 'FN-006 allocated-to PHY-003' allocate Logical::'FN-006' to Physical::aeroLink.'PHY-003';`
- **Sources.** R81 pp.110–112; R76 sl.106–107. Excerpt: reference v0.2 line 1041.

#### S1.20 Allocation as an engineering activity (2 min)
- **Purpose.** Connect the construct to architecture practice.
- **Content.**
  - Partitioning and allocation use criteria to find affinities between functions and assign them to system elements, identifying the interfaces that carry the input-output and control flows (R20c p.598).
  - Allocation of requirements assigns them to entities at the next lower level that have a role in implementing them; budgeting divides a parameter's total value among them (R13 p.562).
  - Course rule: allocation directions are REQ → FN, FN/LOG/AI → PHY.
- **Figure.** Function blocks grouped by affinity into physical elements, with the cut interfaces highlighted.
- **Sources.** R20c p.598; R13 p.562. Course rule labeled.

#### S1.21 Worked example (b): the charging thread (4 min)
- **Purpose.** Read allocation and satisfy side by side.
- **Content.**
  - Thread: REQ-SYS-001 → FN-006 → LOG-002 → PHY-003.
  - `satisfy Requirements::'REQ-SYS-001' by Physical::aeroLink.'PHY-003';` binds the subject to PHY-003 and asserts its charge time is at most 20 min; the model can support the claim, because PHY-003 binds 18 min (current estimate).
  - `satisfy 'REQ-SYS-006' by LOG-002` (availability ≥ 90 %) rests on judgement: LOG-002 binds no availability value. Only verification can confirm it.
  - Allocations: REQ-SYS-001 → FN-006; FN-006 and FN-007 → PHY-003; FN-009 → PHY-004; LOG-002 → PHY-003 and PHY-004.
  - Two review checks (course, not checker rules): the satisfier and the allocation chain agree; each satisfier conforms to the subject's definition (R83 p.161).
- **Figure / SysML v2 example.** The existing listing's Traceability package (lines 55–65).
- **Sources.** R83 pp.161, 168; R76 sl.106. Listing `sysml/week10/aerolink_satisfy_allocate.sysml` (PASS in the 2026-10-11 checker run; FICTIONAL). Reused from the reviewed draft worked example (c).

#### S1.22 Satisfy by a physical design: what it claims (4 min)
- **Purpose.** Assert only what can be defended.
- **Content.**
  - A satisfy requirement usage asserts that the requirement is satisfied (always evaluates to true) when its subject is bound to the satisfying feature (R83 p.168).
  - A negated satisfy asserts the feature does *not* satisfy the requirement (R83 p.168): a claim just as strong, for decided cases only.
  - Allocating a requirement assigns responsibility and is less formal than satisfaction, with no explicit constraint assertion (P11.2 sl.93).
  - So: an allocation without a satisfy says who is responsible, not what has been achieved. A model whose bound values contradict a satisfy is inconsistent; the checker evaluates no constraints and will not say so.
  - Test for every satisfy (course): could you defend it at a review today, from what the model says?
- **Figure.** A 2 × 2: allocated yes/no × satisfied yes/no, with one AeroLink example per cell and the cell "satisfied but not allocated" flagged for review.
- **Sources.** R83 p.168; P11.2 sl.93. Course test labeled.

#### S1.23 Exit: one interface-table row (4 min)
- **Purpose.** Retrieval and preparation.
- **Content.** Individually, take one row of your team's Week 5 interface table and write: the item definition, the port definition (producing side), the two ports (one conjugated), the interface definition and the interface usage. Then state in one sentence which element is responsible for which function across it (allocation), and whether any requirement could be satisfied by one of its ends.
- **Figure.** Fill-in card with six fields.
- **Sources.** Instructor-authored.

**Session 1 timing.** 1 (2) · 2 (3) · 3 (2) · 4 (3) · 5 (3) · 6 (3) · 7 (3) · 8 (2) · 9 (3) · 10 (3) · 11 (3) · 12 (3) · 13 (3) · 14 (3) · 15 (2) · 16 (3) · 17 (4) · 18 (4) · 19 (3) · 20 (2) · 21 (4) · 22 (4) · 23 (4) · references (0). **69 min + 6 min buffer = 75.**

## 3. Session 2: Information view, gaps, checker limits, alternatives and the lab launch (75 min)

**Split.** About 47 minutes of lecture and worked examples, then 22 minutes of laboratory launch.

### Section E: Retrieval and the table-to-model method (8 min)

#### S2.1 Warm-up: three port pairs (2 min)
- **Purpose.** Retrieval of compatibility and typing.
- **Content.** Unseen context (a home heat-pump system): three port pairs with an interface between each: (a) `out heat` with `~` on the other side; (b) `out` on both sides; (c) a port typed by the item it carries. Which is correct, and what is wrong with the others?
- **Sources.** R71 sl.20–21; R81 p.95.

#### S2.2 Reveal (1 min)
- **Purpose.** Confirm the rules and the checker's limits.
- **Content.** (a) correct; (b) not compatible, accepted silently by release 2026-08; (c) rejected: "A port must be typed by port definitions."
- **Sources.** R71 sl.20; R81 p.95. Recorded results: `predict_pc1_interface_two_outputs.sysml` PASS, `invalid_port_typed_by_item.sysml` FAIL (2026-10-11).

#### S2.3 From the interface table to the model, step by step (5 min)
- **Purpose.** A repeatable method.
- **Content.**
  1. For each "what crosses" entry, find or create the item definition.
  2. Write one port definition per direction of exchange, from the producing side.
  3. Give each end part a port; the consuming side uses `~`.
  4. Write the interface definition with two ends (and an internal flow if every usage carries it).
  5. Write the interface usage with the IF ID as short name; `connect` producer port to consumer port.
  6. Record the interface type and what it carries in its doc; check every N² cell has an interface usage or a recorded reason.
  - Demonstrated live on IF-013 (aircraft ↔ maintenance health data, information; INFO-002).
- **Figure.** The six steps as a vertical checklist beside the IF-013 row and its model text.
- **Sources.** R71 sl.20–22, 27–28; R81 pp.95, 103, 106. AeroLink IF-013: reference v0.2 (FICTIONAL). Course method labeled.

### Section F: The AeroLink worked model, continued from Week 5 (25 min)

#### S2.4 External interfaces at the context boundary (3 min)
- **Purpose.** Where the system of interest meets its environment.
- **Content.**
  - The context part holds `ref part systemOfInterest :> Physical::aeroLink`, the six EXT parts and the four external interfaces: IF-003 (operations center ↔ air navigation service provider, flight intent), IF-006 (grid ↔ chargers, power), IF-007 (fire alarm ↔ emergency services), IF-011 (weather service ↔ operations center, INFO-004).
  - External interfaces connect a port of an element inside the system of interest to a port of an external system; the external element is a part, not a stakeholder.
- **Figure.** The Week 1 context diagram redrawn as model elements: SoI boundary, EXT parts, four interface usages with IDs.
- **Sources.** R71 sl.22. AeroLink: reference v0.2 `Context` package lines 85–97 (FICTIONAL). Week 1 context: Week 1 lecture source.

#### S2.5 The communications network as interface medium (3 min)
- **Purpose.** Apply S1.12 to a real modeling decision.
- **Content.**
  - The reference treats PHY-006 as the medium of IF-002, IF-010, IF-012, IF-013 and IF-014, not an end, so it has no port of its own.
  - Consequence: a network outage does not appear as a broken connector; it must be captured elsewhere (a risk, an availability requirement on PHY-006). Week 12 traces it.
  - Alternative (S06's plumbing pattern): model the network as a part both ends connect to; the information interfaces then become two hops each.
- **Figure.** The two alternatives side by side with a "what each makes visible" note.
- **Sources.** R81 p.96. AeroLink: PHY-006 doc (FICTIONAL). Course reasoning labeled.

#### S2.6 The information view in the model (5 min)
- **Purpose.** Carry the Week 4 information view into physical structure.
- **Content.**
  - INFO-001..005 are item definitions; each doc keeps producer, consumer and decision supported.
  - Ports carry them (`port def MaintenanceDataPort { out item maintenanceData : 'INFO-003'; }`); flows realize producer → consumer: `flow … of 'INFO-003' from 'PHY-003'.sessionDataOut.maintenanceData to 'PHY-004'.chargeSessionIn.maintenanceData;`.
  - Coverage rule (course): every information flow between two PHY or EXT elements crosses an information-typed interface, or a recorded relay whose every hop does. INFO-003's relay PHY-003 → PHY-004 → PHY-005 is the reference example.
  - INFO-005 (financial data) has no physical flow in the reference: a decision-support item consumed by a decision (DEC-001), not by an element. Discuss: is that a gap or correct?
- **Figure.** Producer → item → consumer chains for INFO-001..004 on the PHY layout, with the interfaces they cross.
- **Sources.** R81 pp.112–113; R71 sl.27–28. AeroLink: reference v0.2 INFO defs and flows (FICTIONAL). Coverage rule: `src/model/reference/week08.ts` header (faculty-only).

#### S2.7 Worked example (c): recording a satisfy gap honestly (5 min)
- **Purpose.** What to write when the evidence is against the claim, or there is no candidate.
- **Content.**
  - What-if variant (not the reference): the charger supplier's estimate rises to 24 min; and a team design with no fire-detection element.
  - Writing `satisfy 'REQ-SYS-001' by PHY-003` would assert 24 ≤ 20; the checker would accept it; the model would contradict itself.
  - Course convention: record the gap in three places: in the model (no satisfy; an `@Issue` annotation starting "SATISFY GAP" naming candidate, evidence, action, owner; `@StatusInfo` open), in the lab gap table, and in the AROU register when it is a risk. `Issue` and `StatusInfo` are library metadata (PX8 pp.555–557).
  - `not satisfy` is for decided cases (a rejected alternative, a certified failed test), not for open questions.
- **Figure / SysML v2 example.** The existing gap listing, the `@Issue` annotation on two lines.
- **Sources.** R83 p.168; PX8 pp.555–557. Listing `sysml/week10/aerolink_satisfy_gap.sysml` (PASS in the 2026-10-11 checker run; FICTIONAL). Course convention labeled; reused from the reviewed draft worked example (d).

#### S2.8 What the checker enforces, and what passes silently (4 min)
- **Purpose.** Build the review checklist.
- **Content.** Recorded behavior of release 2026-08:
  - Rejected: a port typed by an item definition; an interface usage connecting two parts; `allocate … by …` (syntax: `to` expected); satisfy with requirement and satisfier swapped; a satisfy body rebinding a bound limit.
  - Passed silently: an interface between two ports with the same directions; an interface end connected to a port of another definition; a flow from an input to an output; an allocation written PHY → FN; a satisfy whose satisfier violates the limit.
  - Passed with a warning: a satisfy by a port of the right element ("Bound features should have conforming types").
  - Review each `connect` against its definition's ends, each port pair for inverse directions, each allocation in the course direction, each satisfy against the satisfier's bound values.
- **Figure.** Three-column table: rejected / warning / silent.
- **Sources.** Rules: R71 sl.20, 22, 27; R76 sl.106–107; R83 p.168; R71 sl.25. Recorded runs: `sysml/week10/` invalid and predict listings and probes in `docs/authoring/week10_notes.md` (faculty-only). Reused from the reviewed draft checker commentary.

#### S2.9 Predict the checker (4 min)
- **Purpose.** Practice before the lab.
- **Content.** Three listings, predict PASS / warning / FAIL: an interface whose end connects a port of another definition (PASS, silent); an allocation with ends reversed (PASS, silent); an interface usage that connects two parts (FAIL, once per end).
- **Figure.** Code cards, then a reveal table.
- **Sources.** Listings `predict_pc2_interface_wrong_port.sysml`, `predict_pc7_allocation_ends_reversed.sysml`, `invalid_pc3_interface_connects_parts.sysml` (recorded results as stated, 2026-10-11 run).

#### S2.10 Physical alternatives generated with AI (4 min)
- **Purpose.** Use AI to widen the option set, then evaluate with the model.
- **Content.**
  - Task (course lab, from the program's lab list): generate and evaluate alternative physical architectures.
  - Method (course convention): prompt with the logical architecture and the system requirements; ask for at least two alternatives that change allocation (for example, charging control moved from chargers to the operations center), not just names. For each alternative, record which allocations, interfaces and satisfy claims change, and which requirement each change puts at risk.
  - The AI cannot check compatibility or units; every generated alternative is reviewed against the S2.8 checklist and tagged as AI-suggested.
  - AeroLink demonstration: one AI-style alternative (a separate charging-management controller as a new physical element) evaluated live **(proposed, instructor to confirm)**.
- **Figure.** Baseline vs alternative allocation matrices with changed cells highlighted.
- **Sources.** Program lab list, Lab 6 AI activity (faculty-only: S04). R20c p.598 (allocation criteria). RB-12.1–12.3 (faculty-only).

### Section G: Review and extension (12 min)

#### S2.11 Coverage review: N² chart against the model (4 min)
- **Purpose.** A model-based interface audit.
- **Content.**
  - Every N² cell that the Week 5 table marks has an interface usage with the same ID; every interface usage traces to a cell.
  - Every information item has a producer and consumer port and a flow (or a recorded relay).
  - Every PHY element is the target of at least one allocation; every function is allocated to exactly the elements the course rule permits.
  - Result: a short coverage table with dispositions, the start of the Week 12 digital-thread audit.
- **Figure.** The N² chart with a check or a gap marker in each cell.
- **Sources.** Course convention. Criterion RB-7.3 (complete FN → PHY allocation; N² with typed interfaces and both ends) and RB-9.4 (faculty-only).

#### S2.12 Common errors in physical and interface models (2 min)
- **Purpose.** A checklist.
- **Content.**
  1. A port typed by an item.
  2. Both ports with the same direction.
  3. An interface connecting parts, not ports.
  4. The medium modeled as an end in one place and as a medium in another.
  5. A flow from an input to an output.
  6. Allocation written backward.
  7. A satisfy asserted without supporting bound values, or contradicting them.
  8. Attributes without quantity types (plain `Real` for a speed).
- **Figure.** Eight compact "wrong → right" pairs.
- **Sources.** R71 sl.20–22, 27; R81 pp.95, 106, 112; R83 p.168; R79 sl.167.

#### S2.13 Graduate extension: constraints on an interface (3 min)
- **Purpose.** What an interface definition can say beyond its ends.
- **Content.**
  - When modeling physical interactions, an interface definition or usage can contain constraints on the features of the ports on its ends, for example across and through variables governed by conservation laws (R81 p.106).
  - AeroLink: a constraint in `GridConnection` that the power delivered through the charger end does not exceed the agreed connection limit (TBD) **(proposed, instructor to confirm; new fragment needed)**.
  - Question for the memo: does the constraint belong on the interface, on the requirement (REQ-SYS-010), or both, and what does each placement assert?
- **Figure.** The interface with a constraint box attached to both ends.
- **Sources.** R81 p.106. Course question labeled.

#### S2.14 Bridge to Week 12 (2 min)
- **Purpose.** Show the thread ahead.
- **Content.** Week 12 verifies the satisfy claims made this week (verification cases), adds measures, and audits the full digital thread from stakeholder to verified physical element; gaps recorded this week become audit findings and risks.
- **Figure.** The trace picture with the satisfy arrows from this week turning into verify arrows.
- **Sources.** COURSE_SCHEDULE.md.

### Section H: Laboratory launch (22 min)

#### S2.15 Lab brief (3 min)
- **Content.** Outputs (§5.5), minimums, checker rule (zero errors, warnings explained), gap convention, due before Week 12 Session 1.

#### S2.16 Team work: three interfaces from your table (12 min)
- **Content.** At least one physical and one information interface from the team's Week 5 table, with items, port definitions, conjugate ports, interface definitions and usages, and flows; run the checker.

#### S2.17 Instructor checkpoint (5 min)
- **Content.** Per team: one interface usage and its ports, one allocation, one satisfy or gap. Typical findings: same-direction ports; ports typed by items; unquoted IDs in `connect` lines; satisfy without a supporting value.

#### S2.18 Close: the next seven days (2 min)
- **Content.** The procedure table with owners; readings; quiz window.

**Session 2 timing.** 1 (2) · 2 (1) · 3 (5) · 4 (3) · 5 (3) · 6 (5) · 7 (5) · 8 (4) · 9 (4) · 10 (4) · 11 (4) · 12 (2) · 13 (3) · 14 (2) · 15 (3) · 16 (12) · 17 (5) · 18 (2) · references (0). **69 min (47 lecture + 22 lab) + 6 min buffer = 75.**

## 4. AeroLink worked model example (continues Week 5)

**Phase I starting point.** The architecture layer of the reference baseline (`src/model/reference/week08.ts`, earlier numbering): PHY-001..008 (the six program physical elements plus booking platform and pad fire detection), IF-001..014 typed with both ends, INFO-001..005 with producer, consumer and decision, and the FN → PHY and LOG → PHY allocation matrices; DEC-002 (operations center hot standby).

**What Week 11 adds to the AeroLink model.** The `Physical` package of reference v0.2: item definitions, 11 port definitions, 14 interface definitions, PHY part definitions with ISQ/SI attributes and ports, the `aeroLink` part with PHY usages, internal interfaces and information flows; the external interfaces in `Context`; the allocations (FN → PHY, LOG → PHY, REQ → FN, AI → PHY; 41 in the reference) and the 10 `satisfy` usages, one per system requirement. Week 10 has already added the `Logical` package (FN, LOG, AI, perform).

### 4.1 Existing fragments (reuse)

| Path (under `learning-studio/`) | What it shows | Status | Used on |
|---|---|---|---|
| `sysml/reference/aerolink_v02_req_structure.sysml` | Full Physical package, Context interfaces, allocations, satisfy | PASS in the 2026-10-11 checker run | S1.6–S1.9, S1.18, S1.19, S2.4–S2.6 (excerpts) |
| `sysml/week10/aerolink_ports_interfaces.sysml` | IF-005 and IF-010: ports, conjugation, interface defs (one with flow), usages, INFO-003 flow | PASS | S1.17 |
| `sysml/week10/aerolink_satisfy_allocate.sysml` | Charging thread: two satisfy, six allocations | PASS | S1.21 |
| `sysml/week10/aerolink_satisfy_gap.sysml` | What-if: gap recorded with `@Issue` and `@StatusInfo` | PASS | S2.7 |
| `sysml/week08/aerolink_if005_allocation.sysml` | FN-006 → LOG-002 → PHY-003 chain and IF-005 (read-only) | PASS | Lesson reading |
| `sysml/week05/aerolink_fleet.sysml`, `sysml/week06/aerolink_charging.sysml` | Attributes with units, definition vs usage, redefinition | PASS | S1.6–S1.7 (optional) |
| `sysml/week10/invalid_port_typed_by_item.sysml`, `invalid_pc3_interface_connects_parts.sysml`, `invalid_pc8_allocate_by.sysml`, `invalid_pc6_satisfy_reversed.sysml`, `invalid_pc5_satisfy_relaxes_limit.sysml` | Rejected constructs | FAIL as intended (2026-10-11) | S2.2, S2.8, S2.9 |
| `sysml/week10/predict_pc1_interface_two_outputs.sysml`, `predict_pc2_interface_wrong_port.sysml`, `predict_pc4_satisfy_by_port.sysml`, `predict_pc7_allocation_ends_reversed.sysml` | Silent or warning passes | PASS (pc4 with warning) | S1.17, S2.2, S2.8, S2.9 |
| `sysml/week05/invalid_missing_unit_import.sysml` | Units without the import | FAIL as intended | S2.12 item 8 (optional) |

### 4.2 Needed fragments (to be written and checker-validated; proposed folder `sysml/lectures/week11/`)

| Proposed file | Must show | Used on |
|---|---|---|
| `aerolink_physical_parts_units.sysml` | PHY part defs with ISQ/SI attributes; `aeroLink` usages with multiplicity; one bound (`=`), one initial (`:=`) and one `default` feature value with a comment on what each asserts. Values copied from v0.2 | S1.6–S1.8 |
| `aerolink_context_interfaces.sysml` | Self-contained context part with `systemOfInterest`, EXT-001..003 and IF-003, IF-006, IF-011 with the INFO-004 flow. Copied from v0.2; EXT names as in the reference (see §9 item 6) | S2.4 |
| `aerolink_information_flows.sysml` | INFO-001..004 item defs, carrying ports, information interfaces and flows, including the INFO-003 relay; one `message` alongside a streaming `flow` to contrast the forms | S2.6 |
| `aerolink_if013_step_by_step.sysml` | The six-step method applied to IF-013, each step marked by a comment | S2.3 |
| `aerolink_interface_constraint_grad.sysml` | Graduate extension: `GridConnection` with a constraint over port features (power ≤ connection limit, limit TBD and unbound or bound to a configured value) **(proposed, instructor to confirm)** | S2.13; graduate key |
| `aerolink_alternative_charging_controller.sysml` | AI-style alternative: a charging-management controller as a new PHY element (ID proposed, instructor to confirm), changed allocations and the satisfy that moves | S2.10 |
| `invalid_flow_input_to_output.sysml` (optional) | Promote the recorded probe "flow from an input to an output" (PASS) to a teaching listing | S2.8 |

## 5. Laboratory outline: modeling the team's own physical architecture and interfaces

### 5.1 Inputs
- The team's Phase I package (Week 7): component breakdown and interface table / N² chart (Week 5), information view (Week 4), and the architecture decisions recorded with them.
- The team's model after Week 10 (Logical package with functions, logical elements and `perform`; Requirements package from Week 9) and its checker log.
- Session 1–2 slides, the long-form lesson, the worked examples (S1.17, S1.21, S2.3–S2.7).
- Readings (§5.7).

### 5.2 Objectives
B11.2, B11.3, B11.4 and B11.5, applied to the team's own enterprise.

### 5.3 Method
1. **Physical elements.** One part definition per component type, with quantity-typed attributes for every characteristic a requirement constrains; one usage per element in the system-of-interest part, with the PHY ID as short name and multiplicity where it is a design decision (S1.6–S1.8).
2. **Items.** One item definition per "what crosses" entry and per information item, keeping producer, consumer and decision in the doc (S1.9).
3. **Ports and interfaces.** The six-step method (S2.3) for every interface-table row; external interfaces in the context part (S2.4); the medium decision stated once (S2.5).
4. **Flows.** One flow per information producer → consumer pair, or a recorded relay (S2.6).
5. **Allocation.** FN/LOG/AI → PHY as in the team's allocation matrix, or a recorded change with a reason; REQ → FN where the team's Week 9 model has the function (S1.19–S1.21).
6. **Satisfy or gap.** For every system requirement, a satisfy the team can defend from bound values or explicit judgement, or a recorded gap (S1.22, S2.7).
7. **AI alternatives.** At least two AI-generated physical alternatives evaluated (S2.10).
8. **Coverage review and checker.** N² coverage table; zero errors; every warning explained; the S2.8 and S2.12 checklists applied.

### 5.4 Procedure

| Step | When | Lead role | Output |
|---|---|---|---|
| 1. Three interfaces (≥ 1 physical, ≥ 1 information) | In class, S2.16 | Whole team | Started Physical package |
| 2. Checkpoint feedback applied | Day 1 | Architecture lead | Fixed interfaces |
| 3. PHY part definitions, attributes and usages | Days 1–2 | Architecture lead; each member owns ≥ 2 PHY | Physical parts |
| 4. Remaining interfaces, external interfaces, items | Days 2–4 | Each member models ≥ 3 interfaces | Interfaces complete |
| 5. Information flows and relays | Day 3 | AI & Data lead | Flows |
| 6. Allocations and satisfy-or-gap table | Days 4–5 | Requirements & Compliance | Traceability additions; gap table |
| 7. AI-generated alternatives and evaluation | Day 5 | AI & Data lead | Alternatives note |
| 8. Coverage review; checker to zero errors; warnings explained | Day 6 | V&V lead | Coverage table; checker log |
| 9. AI statement; mapping table updated | Day 6 | AI & Data lead | Statement; table |
| 10. Integration review and submission | Day 7 | V&V lead | Submission |

### 5.5 Outputs
- The team model with the Physical package, context interfaces, allocations and satisfy usages or recorded gaps.
- Checker log of the final run (zero errors; each warning explained).
- Interface coverage table (N² cell → IF usage → items carried → type; gaps with dispositions).
- Satisfy-and-allocation table (each system requirement: allocated function(s), satisfier and basis, or gap with owner).
- AI alternatives note (≥ 2 alternatives; changed allocations, interfaces and satisfy claims; requirements at risk; disposition).
- AI usage statement.

**Minimums (course convention, proposed).** All Week 5 components and interfaces modeled (or each omission recorded); ≥ 1 physical, ≥ 1 information and ≥ 1 organizational or external interface; every information item with a flow or relay; complete FN → PHY allocation; a satisfy or recorded gap for every system requirement.

### 5.6 Rubric rows (from ASSESSMENT_RUBRICS.md)

| Row | Criterion | Applied this week |
|---|---|---|
| RB-8.1 | Validity | Yes |
| RB-8.2 | Organization and conventions | Yes: Physical package, short-name IDs in `connect` lines, explicit imports |
| RB-8.3 | Structure semantics | Yes, core row: definition/usage, ports and interfaces typed, quantities with units |
| RB-8.4 | Requirements semantics | Yes, for `satisfy`: appropriate design elements; misuse scores level 2 |
| RB-8.6 | Completeness vs minimums | Yes, against §5.5 |
| RB-7.3 | Allocation and interfaces | Yes, in model form: complete FN → PHY allocation; typed interfaces with both ends |
| RB-7.5 | Information flows | Yes: producers, consumers, flows (decision supported kept in item docs) |
| RB-9.2 | Downward trace | Partly: every system requirement has a satisfy or recorded gap (verification method completed in Week 12) |
| RB-12.1–12.3 | AI usage statement; AI-generated SysML accepted by the checker and explained by its owner | Yes |

**Gate.** RB-8 parse-error gate applies. **Grading mode.** Proposed: the Week 11 model is the first graded model baseline (the earlier draft's mid-course model checkpoint, weighted RB-8 75 · RB-17 15 · RB-12 10), with a peer review-findings round (RB-17) kicked off in Week 11 and dispositioned in Week 12. Faculty decision (§11).

### 5.7 Realistic per-student workload (budget 8 h)

> **Superseded (2026-10-22, Week 11 review m7).** The figures in this section are the outline's estimate. The built week computes its workload in `src/content/week11Path.ts`: 7.2 h for a team of four (lab 8.4 person-hours, 2.1 h each; exercise 50 min); a team of three carries 7.9 person-hours, 2.6 h each, a week of 7.7 h. See `WEEK11_MILESTONE_REPORT.md` §5.

| Activity | Hours | Basis |
|---|---|---|
| Class sessions (2 × 75 min) | 2.5 | Timetable |
| Readings: R71 sl.18–29 (12 slides), R76 sl.105–107 (3), R81 pp.93, 95–96, 106, 110–113 (8 pp spec), R20c pp.596–598 (3 pp) | 0.9 | About 15 pp/h for specification text, 30 slides/h |
| Long-form lesson and worked examples | 0.5 | About 4,500 words |
| Lab out of class: the student's share of steps 2–10 | 2.8 | About 11 person-hours per team of 4 (parts and attributes 1.5; interfaces and items 3.5; flows 1.0; allocations and satisfy/gap table 2.0; AI alternatives 1.0; coverage and checker 1.5; integration 0.5) |
| Quiz Q11 (§6.1) | 0.3 | 12 items |
| Applied exercise (§6.2) | 0.7 | 40 min plus upload |
| Time log and AI statement contribution | 0.2 | |
| **Total** | **7.9** | Within the 8 h budget |

Note: if the graded baseline and peer-review round (§5.6) are adopted, the RB-17 review findings (about 1 h per student) must fit in Week 12, not Week 11. Teams of 3 carry about 3.7 h of lab each unless the minimums are reduced.

## 6. Assessment outline (separate from the lecture)

Unseen, non-AeroLink contexts; no reuse of slide, worked-example or warm-up wording.

### 6.1 Quiz Q11 (individual, 15 min, closed book, 12 items)
9 single-best-answer items (1 point) and 3 short answers (2 points, ≤ 40 words); keyed positions balanced; distractors from S2.12.

| # | Objective | Bloom | Item focus (unseen context) | Key source |
|---|---|---|---|---|
| 1 | B11.1 | Understand | What does SEBoK say a physical interface does? | R20c p.597 |
| 2 | B11.1 | Understand | Can a SysML v2 part represent a purely logical component? | R81 p.90 |
| 3 | B11.2 | Apply | Water-treatment plant: choose the correctly typed attribute for a flow rate | PX10 p.610; R79 sl.167–168 |
| 4 | B11.2 | Analyze | A usage binds a value with `=` and a specialization rebinds it: what does the model assert? | R81 pp.96, 105 |
| 5 | B11.3 | Apply | Drone-delivery dock: which port declaration makes the two ends compatible? (`~`) | R81 pp.93, 95; R71 sl.20–21 |
| 6 | B11.3 | Apply | Which declaration is a correct interface usage between two ports? | R81 pp.103, 106, 109 |
| 7 | B11.3 | Analyze | A cross multiplicity `[0..1]` on one end: what does it constrain? | R71 sl.18; R81 pp.100–102 |
| 8 | B11.3 | Understand | Message vs streaming flow: which identifies the source output feature? | R81 p.113 |
| 9 | B11.4 | Analyze | A requirement is allocated to a function that is allocated to an element, with no satisfy: what has the model claimed? | R81 p.110; R83 p.168 |
| 10 (SA) | B11.3 | Apply | Turn one interface-table row (rail substation ↔ train, traction power) into port def, ports, interface def and usage | R71 sl.20–22 |
| 11 (SA) | B11.4 | Evaluate | The satisfier's bound value violates the requirement and the checker reports nothing: explain and state the correct record | R83 p.168 |
| 12 (SA) | B11.5 | Evaluate | Name two interface errors the checker does not report and how a reviewer finds each | Recorded behavior (lesson table); R71 sl.20, 27 |

### 6.2 Applied exercise (individual, about 40 min, open book, unseen case)

> **Superseded (2026-10-22).** The built exercise is the water-kiosk case of `src/content/week11Assessment.ts`, 50 minutes, five tasks; the outline below is kept as the planning record.
- **Case brief** (about 300 words, instructor-authored, FICTIONAL): an *electric-bus depot* with a component list (buses, chargers, depot control system, grid connection), a five-row interface table and three system requirements.
- **Tasks.**
  1. Model two physical elements with quantity-typed attributes and one usage with a multiplicity. *(B11.2)*
  2. Model one physical and one information interface from the table, with items, ports (one conjugated), interface definitions and usages, and one flow. *(B11.3)*
  3. Allocate two functions to elements and write one satisfy you can defend from bound values, and one recorded gap. *(B11.4)*
  4. Find and fix two seeded errors in a given fragment, one the checker rejects and one it accepts. *(B11.5)*
  5. Graduate: add a constraint to the power interface and argue whether it duplicates, refines or replaces the corresponding requirement. *(Graduate)*
- **Rubric** (4 levels, 20 points): parts and quantities; ports and interfaces (compatibility, typing); allocation and satisfy/gap semantics; error diagnosis; graduate interface constraint (non-graduate students: explanation of what the checker did not check).

## 7. Continuity link to the Phase I artifact

- **Phase I artifact modeled.** Week 5 (Components / Interfaces): the component breakdown and the interface definitions (N² chart / interface table) (COURSE_SCHEDULE rule 6: Week 11 ↔ Week 5). The Week 4 information view is carried in as items and flows.
- **What crosses.** PHY IDs (part usages), characteristics (attributes with units), IF IDs (interface usages), interface type and contents (doc), "what crosses" (item definitions), information producer/consumer/decision (item docs and flows), allocation matrix (allocations), architecture decisions (rationale metadata where used).
- **What does not cross yet.** Verification of the satisfy claims (Week 12); trade-study alternatives as an analysis (Week 13).
- **Program lab list alignment (faculty-only: S04).** Lab 6 (physical architecture: eVTOL aircraft, vertiports, charging systems, operations center, maintenance facility, communications infrastructure; AI activity: generate and evaluate alternative physical architectures) and Lab 8 (information, interfaces and AI: passenger, flight, maintenance, weather, financial data; producers, consumers, AI interactions).

## 8. Section transitions (summary)

| From → to | Transition line |
|---|---|
| Session 1, A → B | What SE means by a physical architecture, and why SysML v2 has no separate physical part |
| B → C | An item says what flows; a port says where a part lets it in or out |
| C → D | Structure says what is there; allocation says who is responsible; satisfy says what is claimed |
| D → exit | One interface-table row, written as a model |
| Session 2, E → F | The method, then the AeroLink model continued from Week 5 |
| F → G | Review what the checker cannot, then extend |
| G → H | Your team models its own physical architecture |

## 9. Source gaps

1. **Spec clause 7.10 Items (S06 pp.88–89)** is outside every registered range (R80 ends at p.77, R81 starts at p.90); P11.1 is needed.
2. **Interface types (physical, information, organizational, external)** are a course classification from the program deliverable list; SysML v2 has one interface construct and no source in the collection maps the types to modeling patterns. The reference's patterns for organizational interfaces are course conventions.
3. **Modeling the interface medium.** S06 p.96 describes both options (logical connection vs medium as part) but gives no selection guidance; the S2.5 discussion is course reasoning.
4. **Graphical interconnection notation.** The graphical deck's part-interconnection module (S09 sl.39–44) and requirement-allocation slide (sl.93) are dated 2022–2023 and not registered; figures are original drawings labeled as course illustrations.
5. **AI-generated architecture alternatives.** No source describes a method; S2.10 is a course method.
6. **Week 1 case changes.** The Week 1 lecture renamed external systems (for example EXT-001 "Controlled airspace (air traffic service)", EXT-002 "Electric grid"); the reference `.sysml` still uses the earlier names (`AirNavigationServiceProvider`, `ElectricUtilityGrid`). External-interface examples (S2.4) must use one naming consistently once faculty decide.
7. **Checker behavior** is recorded for release 2026-08 only.
8. **OMG specification license terms** for quoting on slides were not checked in this outline (the copyright pages begin at S06 PDF p.3); the References and credits slide needs the exact notice, as Week 1 did for SEBoK.

## 10. Register additions needed

| ID | Source, PDF pages | First-page title (to verify with `verify_readings.py`) | Supports |
|---|---|---|---|
| P11.1 | S06 pp.88–89 | 7.10 Items | S1.9; quiz |
| PX10 (shared) | S06 pp.610–618 | 9.8 Quantities and Units Domain Library | S1.7; quiz 3 |
| PX8 (shared) | S06 pp.555–562 | 9.3.2 Modeling Metadata | S2.7 (Issue, StatusInfo) |
| P11.2 | S09 sl.39–44 and sl.93 | Part Interconnection (module title slide "Module 5 / Part Interconnection"); sl.93 "Requirement Allocation vs. Requirement Satisfaction" | S1.22 (allocation is less formal than satisfaction); optional graphical figures. Dated 2022–2023: extension only |

Existing entries used: R13, R20c, R70, R71, R76, R79, R81, R83. **Essential readings, proposed:** R71 sl.18–29; R76 sl.105–107; R20c pp.596–598. **Extension:** R81 pp.93–96, 106–113 (instructor reference level in the register; propose raising the cited pages to extension for graduate students); PX10 p.610; R47 (DoD interface management, pp.138–140) and R57 (MITRE interface management, pp.410–415) as practice context.

## 11. Open items for faculty

1. Whether the Week 11 model is the first graded model baseline (proposed), with an RB-17 peer review round dispositioned in Week 12.
2. Approve the course conventions: separate Logical and Physical packages; ports written from the producing side; interface type recorded in doc; the information coverage rule; the satisfy-gap record.
3. Decide the external-system names (reference vs Week 1 lecture) before the context-interface fragment is written.
4. Approve the AI alternatives activity (≥ 2 alternatives) and its tagging rule.
5. Approve register additions P11.1, PX8, PX10 and optional P11.2; consider raising R81's cited pages from instructor reference to extension.
6. Workload for 3-person teams; placement of the RB-17 review hours.
7. Objective IDs B11.x reuse the numbering of the earlier draft's Week 11 objectives; confirm before `course.ts` is updated.
