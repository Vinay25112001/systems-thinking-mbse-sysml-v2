# Week 5 Lecture Outline: Components / Interfaces

**Status.** Draft outline for faculty review (COURSE_PRODUCTION_PLAN M2), written 2026-10-19. Not yet built into
`src/content/lectures/week05/`. Nothing committed.
**Governing documents.** DECISION_LOG A19 and A20; COURSE_SCHEDULE.md (Week 5 subject, exact: *Components / Interfaces*;
team output: "Component breakdown; interface definitions (N² chart / interface table)"); COURSE_PRODUCTION_PLAN.md; the
Week 1 template and `docs/lectures/week01/REVIEW_DISPOSITIONS.md`.
**Reused reviewed material.** Old Week 8 (`src/content/weeks/week08.ts`: `w8-interfaces`, worked example (c) "the N² of
AeroLink's physical interfaces", `w8-advanced` coupling comparison; `draftWeeks.ts` old Week 8 objective B8.3 and the
graduate task "compare two allocation alternatives using coupling metrics from the N² matrix"); `src/model/reference/
week08.ts` (PHY-001..008, IF-001..014); `aerolinkCase.ts` (corrected external-system names).
**Format.** Two 75-minute sessions, each 69 min of planned content plus a recorded 6-min buffer.
- Session 1: 20 content slides (69 min) plus References and credits.
- Session 2: 12 lecture slides (47 min) plus 4 laboratory-launch slides (22 min) plus References and credits.
- Total: 36 content slides plus 2 generated reference slides.

## 0. Conventions used in this outline

- **Citations.** `R57 p.411` = verified register entry, PDF page. `P5-2 p.1467` = proposed register addition for Week 5
  (§9). `P4-1` = the Week 4 proposed DoD Architecture Design split (R48c), reused here. Every citation was checked against
  `_source_cache/*.txt`; it supports only what is written beside it.
- **Course convention** marks content the collection does not supply.
- **AeroLink** is FICTIONAL; values only from `reference/week03.ts`–`week08.ts`, `week12.ts` and `aerolinkCase.ts`.
  Corrected external-system names: EXT-001 Controlled airspace (air traffic service), EXT-002 Electric grid, EXT-003
  Weather, EXT-004 Aircraft and spares supply, EXT-005 Public transport network, EXT-006 Emergency response service. New
  values are marked **(proposed, instructor to confirm)**. "Organisational"/"centre" in the reference become
  "organizational"/"center" on student surfaces.
- **Slide faces** carry short citations only and no internal IDs (rubric rows, decision numbers, course-document codes,
  P-numbers, objective IDs). Spoken notes ≤ 130 words per minute.
- Short verified definitions only are quoted; all figures are original drawings.

## 1. Learning objectives (graduate level)

| ID | Objective | Bloom | Taught in |
|---|---|---|---|
| W5.1 | Break the architecture down into components (system elements) with clear responsibilities, at a manageable number per level | Apply | S1.4–S1.9 |
| W5.2 | Identify interfaces between components and with external systems using an N² chart, and type each interface | Analyze | S1.10–S1.15 |
| W5.3 | Define each interface in an interface table: what crosses it, in which direction, over which medium, under which constraints, and who owns each side | Create | S1.16–S1.18; S2.7 |
| **W5.4 (new)** | Write interface requirements by the three-step method and identify hidden external interfaces | Apply | S1.17; S1.12 |
| **W5.5 (new)** | Evaluate an interface set for coverage, coupling and risk, and recommend interface-management actions (standards, control working group, service levels) | Evaluate | S2.2–S2.9 |
| Graduate | Compare two allocation alternatives by an explicit coupling count from the N² and state what the count cannot see | Evaluate | §6.2 |

## 2. Session 1: Components, the N² chart and interface definitions (75 min = 69 + 6 buffer)

**Design rationale.** Week 4 produced the physical view and the allocation. Week 5 asks what the physical elements are
made of and, above all, what passes between them. SEBoK's physical-architecture practice is to focus on interfaces rather
than elements at abstract levels (R20c p.603); the session gives interfaces most of the time.

### Section A: Framing (6 min)

#### S1.1 Week 5 at a glance (1 min)
- **Content.** Subject exactly as scheduled; outputs: component breakdown with responsibilities; N² chart; interface
  table; interface requirements for the external interfaces; interface-management notes.
- **Figure.** The package band with "Components and interfaces" highlighted and "Week 6 evolution roadmap" dimmed.
- **Sources.** COURSE_SCHEDULE.md.

#### S1.2 Driving question: why could the fault status not reach dispatch? (3 min)
- **Purpose.** A real defect motivates the method.
- **Content.** In the first version of the AeroLink reference, maintenance and the operations center were joined only by
  an agreed work-order procedure (IF-004). The go/no-go status had no information interface to travel on, although
  dispatch must block a faulted aircraft within 2 min (REQ-SYS-008). Students predict which tool would have found it. Answer
  at S1.15 (the N² plus the coverage rule).
- **Figure.** Two boxes (Maintenance Facility, Operations Center) joined by a dashed "procedure" line; a status message
  stuck at the boundary.
- **Sources.** `reference/week08.ts` (IF-004, IF-012 history in its header comment); `reference/week04.ts` REQ-SYS-008.

#### S1.3 Where Week 5 sits (2 min)
- **Content.** Inputs: Week 4 physical view and allocation; Week 2 interface requirements (REQ-STK-009) and constraints;
  Week 3 risks touching interfaces (R-005, R-007, R-008). Output feeds Week 6 (technology insertion depends on interface
  standards) and Week 11 (physical modeling).
- **Figure.** Arrows Week 4 → Week 5 → Week 6, and a dashed Week 5 → Week 11 arrow.
- **Sources.** COURSE_SCHEDULE.md rule 6.

### Section B: Components (28 min)

#### S1.4 System element and component (3 min)
- **Purpose.** Exact vocabulary.
- **Content.**
  - System element (P5-3 p.1643, from 15288:2015): a discrete part of a system that can be implemented to fulfill
    specified requirements; it can be hardware, software, data, humans, processes, procedures, facilities, materials and
    naturally occurring entities.
  - Component (P5-2 p.1467) has three recorded definitions; definition (2), "One of the parts that make up a system"
    (IEEE 829-2008), is the plain sense the schedule uses. The course treats "component" in Week 5 as a system element at
    the chosen level (course convention).
  - The same list appears in SEBoK's physical architecture article (R20c p.597).
- **Figure.** A system element card with a type icon row (hardware, software, data, people, procedure, facility).
- **Sources.** R20c p.597; P5-2 p.1467, P5-3 p.1643 (register additions).

#### S1.5 Layers and the five-plus-or-minus-two guideline (3 min)
- **Content.** A complex system is structured in layers of systems and system elements; the number of elements per level
  is kept small, a common guideline being five plus or minus two (R20c p.597). SEBoK presents a hierarchical decomposition
  of a system of interest and applies the system definition processes recursively at each layer (P5-5 p.430). Caution:
  the guideline is a rule of thumb (instructor's caution, as in Week 1).
- **Figure.** A three-layer tree with a bracket "5 ± 2" at each level.
- **Sources.** R20c p.597; P5-5 p.430 (register addition).

#### S1.6 System breakdown structure and WBS (3 min)
- **Content.** System breakdown structure (P5-4 p.1640, after IEEE 1220): a hierarchy of elements, related life-cycle
  processes and personnel used to assign teams, conduct reviews and partition work. The DoD WBS is a product-oriented
  decomposition of the work and deliverables, defined in outcomes, not actions, with non-overlapping elements and a WBS
  dictionary (P5-6 p.104). Distinguish: the component breakdown describes the system; the WBS describes the work to build
  it.
- **Figure.** Two trees side by side, "system breakdown" and "work breakdown", with dotted mapping lines.
- **Sources.** P5-4 p.1640, P5-6 p.104 (register additions).

#### S1.7 Logical and physical components (3 min)
- **Content.** Logical configuration items carry allocated functions, interfaces and requirements without a specific
  implementation; physical items are specific implementations (R19 p.571). A physical architecture is built from system
  elements, the physical interfaces between them, and external elements (R20c p.597). Product structures define the
  arrangement of elements and interfaces (P4-1 p.145).
- **Figure.** LOG-002 Fleet Management drawn once in the logical plane and split across PHY-003 and PHY-004 in the physical
  plane.
- **Sources.** R19 p.571; R20c p.597; P4-1 p.145.

#### S1.8 AeroLink component breakdown (5 min)
- **Content.** The breakdown table (§4.1): eight physical elements under the service, with counts and responsibilities;
  second-level components for PHY-002 and PHY-003 **(proposed, instructor to confirm)**: pads, terminal and step-free
  route; high-power turnaround chargers at hubs, standard chargers at spokes (A-002), vertiport power controller. Count
  check: 8 at level 1 sits within 5 ± 2 only if PHY-007 and PHY-008 are grouped; discuss.
- **Figure.** A two-level tree with counts (12 → 16 aircraft after DEC-001; 6 vertiports = 3 hubs + 3 spokes; 12 chargers =
  6 high-power + 6 standard).
- **Sources.** `reference/week08.ts`, `reference/week02.ts` A-002, `reference/week07.ts` DEC-001.

#### S1.9 Component responsibility cards (3 min)
- **Content.** **Course convention:** each component card states its responsibility (the functions allocated to it), the
  requirements it satisfies, its owner organization and its interfaces. Example: PHY-003 Charging Systems — FN-006, FN-007;
  satisfies REQ-SYS-001, REQ-SYS-010; owner: vertiport operators (WSoI); interfaces IF-005, IF-006, IF-010.
- **Figure.** Card template filled for PHY-003.
- **Sources.** `reference/week08.ts`; `aerolinkCase.ts` (SYSTEM_OF_INTEREST wider elements). Course convention.

### Section C: Interfaces and the N² chart (25 min)

#### S1.10 What an interface is (4 min)
- **Content.**
  - SEBoK glossary (P5-1 p.1541), definition 1 (ISO/IEC 2382-1): "A shared boundary between two functional units, defined
    by various characteristics pertaining to the functions, physical signal exchanges, and other characteristics."
  - MITRE: interface management defines, controls and communicates the information that lets unrelated objects
    co-function; it begins at design and continues through operations (R57 p.410). Interfaces are the functional and
    physical connections at system boundaries; they come in many types (R57 p.411).
  - SEBoK: a physical interface binds two system elements, like a link or connector; in service and enterprise systems the
    interface may be a protocol, a procedure or a document (R20c p.597).
- **Figure.** A plug-and-outlet pair (MITRE's own example, R57 p.411) redrawn beside a procedure document and a data
  message, all three labeled "interface".
- **Sources.** R57 pp.410–411; R20c p.597; P5-1 p.1541 (register addition).

#### S1.11 Typing interfaces (3 min)
- **Content.** **Course convention** (the course's Interface Inventory lists four kinds): physical (energy, mass, load),
  information (data), organizational (an agreed procedure or responsibility), and external (any interface to an element
  outside the system of interest, flagged in addition to its type). Honest note: this typing is not a SEBoK or MITRE
  taxonomy; in SEBoK all of these are physical interfaces in the binding sense (R20c p.597). Why type them: each type is
  verified and managed differently (instructor guidance).
- **Figure.** Four icons with one AeroLink example each: IF-005 power, IF-008 bookings, IF-004 work-order handover, IF-006
  grid connection (external).
- **Sources.** R20c p.597. Course convention.

#### S1.12 External and hidden external interfaces (3 min)
- **Content.** Requirements must capture all interactions with external systems and the environment so that boundaries
  are clear; internal subsystem communication over an external medium creates hidden external interfaces (R54 p.331).
  MITRE's checklist: include all external interfaces, and major internal ones important for modularity or growth; an
  internal interface over a transport the system does not own is a hidden external interface (R55 p.369). AeroLink:
  PHY-006 datalink and ground network carry IF-002, IF-010, IF-012, IF-013, IF-014; if any segment is a leased network,
  those interfaces have a hidden external part **(proposed discussion point)**. *Superseded by the 2026-10-19 review (M1):
  the datalink is radio, which MITRE names as a hidden external medium (R54 p.331), so IF-002 and IF-013 cross a trust
  boundary whoever owns the radios; only the ground-network interfaces depend on the leasing decision. The lecture,
  case and tool now teach a fifth trust-boundary reason, "radio or another medium outsiders can reach".*
- **Figure.** Two internal boxes talking through a cloud labeled "leased network (not ours)", with a red "hidden external"
  tag.
- **Sources.** R54 p.331; R55 p.369; `reference/week08.ts` PHY-006.

#### S1.13 The N² chart (5 min)
- **Content.**
  - SEBoK names the N-squared diagram, after Grady, as one of the most basic methods for defining integration aggregates
    and order; the coupling matrix is reorganized to group elements so that the interfaces to be verified between
    aggregates are minimized, and it helps locate faults (R22 pp.630–631).
  - **Course convention** for reading the chart: elements on the diagonal; in the interface N² each off-diagonal cell lists
    the interface IDs joining two elements, written once above the diagonal (symmetric); in the functional N² the matrix is
    directed (row = producing function, column = consuming function). The row/column convention is not stated in the
    collection (source gap).
  - Arithmetic check: each interface has two ends, so the element degrees sum to twice the number of interfaces.
- **Figure.** A blank 5 × 5 N² teaching grid with one cell filled and the "row outputs, column inputs" arrow for the
  directed form.
- **Sources.** R22 pp.630–631. Course convention.

#### S1.14 Worked: AeroLink's interface N² (6 min)
- **Content.** The N² of PHY-001..008 and EXT-001..006 (§4.3). Counts: 14 interfaces; 3 physical, 9 information,
  2 organizational; 4 external (IF-003, IF-006, IF-007, IF-011). Degrees: PHY-004 9; PHY-001 4; PHY-002, PHY-003, PHY-005
  3 each; PHY-007, PHY-008 1 each; EXT-001, EXT-002, EXT-003, EXT-006 1 each; PHY-006 0 (it is the medium). Sum 28 = 2 × 14.
  Students locate the hub (PHY-004) and say what that means for risk R-007.
- **Figure.** The filled N² with cells colored by type and degree totals in the margin.
- **Sources.** `reference/week08.ts`; R22 p.631; `reference/week06.ts` R-007.

#### S1.15 Functional flows across the physical boundary (4 min)
- **Content.** Overlay the allocation: a function-to-function flow whose functions sit on different physical elements is a
  crossing flow and needs an interface of the matching type (course coverage rule from Week 4). Answer to S1.2: the
  crossing flow "go/no-go status" (FN-008 at PHY-005 → FN-011 at PHY-004) had only the organizational IF-004; the reference
  added IF-012 (and IF-013, IF-010 for two further gaps).
- **Figure.** The S1.2 scene with the crossing flow now riding IF-012.
- **Sources.** `reference/week08.ts`; course coverage rule.

### Section D: Interface definitions (10 min)

#### S1.16 The interface definition table (4 min)
- **Content.** MITRE: describe every interface with the same set of attributes, including the business process or data
  flow it supports, not only its technical aspects; establish the framework early, during design (R57 p.413). **Course
  convention** columns: ID, name, type, ends (both), what crosses, direction, medium, constraint (with the requirement),
  owner of each side, verification.
- **Figure.** The column header strip with one filled row (IF-006).
- **Sources.** R57 p.413. Course convention (columns).

#### S1.17 Interface requirements in three steps (3 min)
- **Content.** SEBoK, after INCOSE NRM: identify the interface boundaries and interactions; define the interactions (what
  crosses, and the media); write the interface requirements. Example form: "The System shall send telemetry to the Ground
  System as defined in ICD 123, Table X" (R13 p.563). AeroLink: REQ-STK-009 (flight intent to the ANSP) and REQ-SYS-009
  (fire alarm within 30 s) are interface requirements.
- **Figure.** Three numbered steps with the IF-007 alarm as the running example.
- **Sources.** R13 p.563; `reference/week04.ts`.

#### S1.18 Worked: defining IF-006 and IF-007 (5 min)
- **Content.** IF-006 Charger ↔ Electric grid: physical, external; electrical power; constraint: agreed connection limit
  TBD-02 (U-002), enforced by REQ-SYS-010; owners: vertiport operators and the utility (STK-010); verification VER-010.
  IF-007 Fire alarm ↔ Emergency response service: information, external; alarm and pad location; constraint ≤ 30 s
  (REQ-SYS-009); owners: vertiport safety and emergency services (STK-006); verification VER-009.
- **Figure.** Two completed table rows, each with a small boundary sketch.
- **Sources.** `reference/week04.ts`, `week08.ts`, `week12.ts`; `aerolinkCase.ts` (owners).

#### S1.19 Modularity and coupling (3 min)
- **Content.** Aims of a candidate physical architecture include fewer physical interfaces and modularity (low
  interdependence) (R20c p.599). Proven practice: maximum consistency inside an element, minimum interfaces outside; focus
  on interfaces (R20c p.603). Interface standards can enable technology insertion and interoperability (R20c p.596).
- **Figure.** Two layouts of the same six elements: tangled (12 links) vs grouped (5 cross-group links).
- **Sources.** R20c pp.596, 599, 603.

#### S1.20 Exit (3 min)
- **Content.** One-minute paper: "Name one interface of your enterprise that is organizational, and who owns each side."
  Before Session 2: list your Week 4 physical elements and the flows between them (about 15 min).
- **Sources.** Course convention.

**Session 1 running total**

| Section | Slides | Minutes | Cumulative |
|---|---|---|---|
| A Framing | S1.1–S1.3 | 6 | 6 |
| B Components | S1.4–S1.9 | 20 | 26 |
| C Interfaces and N² | S1.10–S1.15 | 25 | 51 |
| D Interface definitions and exit | S1.16–S1.20 | 18 | **69** |
| References and credits (generated) | — | 0 | 69 + 6 buffer = **75** |

## 3. Session 2: Managing interfaces, the worked example and the lab launch (75 min = 69 + 6 buffer)

**Split decision: 47 min lecture, 22 min lab launch.** Interface management, risk and the audit of the AeroLink set are
taught first; the lab's in-room part is the team's first N² from its Week 4 physical view, where most typing errors appear.

### Section F: Managing interfaces (23 min)

#### S2.1 Warm-up (3 min)
- **Content.** (1) Type IF-009. (2) Why does PHY-006 have degree 0? (3) What is a hidden external interface? Reveal next.
- **Sources.** R55 p.369; `reference/week08.ts`.

#### S2.2 Why interfaces are managed (3 min)
- **Content.** DoD: interface management identifies, defines, manages and ensures compliance of internal and external
  interfaces, in line with configuration management (R47 p.138); as complexity grows, poor interface configuration
  control degrades performance, affordability, sustainability and maintainability (R47 p.139). MITRE: use interface
  attributes as constraints on design change (R57 p.411).
- **Figure.** An interface control loop: define → control → communicate → verify.
- **Sources.** R47 pp.138–139; R57 p.411.

#### S2.3 Governance and the interface control working group (5 min)
- **Content.** Loosely coupled architectures need more governance, not less; interface sprawl degrades performance (R57
  p.412). An ICWG is a specialized IPT of technical representatives from the interfacing activities, for issues
  engineer-to-engineer contact cannot resolve (R57 p.414). DoD: the PM should establish an ICWG; the interface management
  plan documents internal and external interfaces, standards and applicable tests (R47 p.140). AeroLink: an ICWG with the
  vertiport operators, the utility and emergency services **(proposed)**.
- **Figure.** A round table with five organization seats and the interfaces each seat owns.
- **Sources.** R57 pp.412, 414; R47 p.140.

#### S2.4 Standards and modular open systems (4 min)
- **Content.** Standards-based interfaces support interoperability and reuse (R57 p.413). Interface specifications that
  comply with consensus standards enable a modular open systems approach and facilitate future technology insertion and
  refresh (R47 p.139). Physical interface standards can be key enablers of families of systems and technology insertion
  (R20c p.596). Bridge to Week 6: insertion points depend on stable interfaces.
- **Figure.** A charger slot drawn as a standard socket accepting a "today" and a "future" charger.
- **Sources.** R57 p.413; R47 p.139; R20c p.596.

#### S2.5 Interfaces as a source of risk (4 min)
- **Content.** DoD: internal and external interfaces are significant sources of risk; interdependent programs should
  manage interface and integration risks jointly, with agreements, an ICWG and a synchronized schedule (R46 p.127).
  AeroLink: R-005 (grid connection, IF-006), R-007 (platform outage at the degree-9 hub PHY-004), R-008 (pad fire,
  IF-007). Each risk is linked to the interface it threatens (risk register from Week 3).
- **Figure.** The N² with three risk flags on cells.
- **Sources.** R46 p.127; `reference/week06.ts`.

#### S2.6 Service levels and organizational interfaces (4 min)
- **Content.** Establish service-level agreements to document interface performance and report against them; they bind
  provider and user (R57 p.413). An organizational interface is managed by an agreement with an owner on each side
  (course convention). AeroLink: IF-009 pad-slot agreement with the vertiport operators; IF-004 work-order handover.
- **Figure.** An agreement card: parties, obligations, service level, review date.
- **Sources.** R57 p.413. Course convention.

### Section G: AeroLink worked example (17 min)

#### S2.7 The complete interface table (6 min)
- **Content.** §4.4, read across, with students filling direction for three rows.
- **Figure.** The table as a slide-width register.
- **Sources.** `reference/week08.ts`, `week04.ts`, `week12.ts`.

#### S2.8 Auditing the set (6 min)
- **Content.** Pairs find the gaps (model answers):
  - EXT-004 Aircraft and spares supply and EXT-005 Public transport network have **no interface**, although SCN-004 A1
    orders parts from EXT-004 and assumption A-008 relies on EXT-005 during weather holds.
  - IF-011 ends at EXT-003 Weather, a natural system; the real counterpart is a weather information service not in the
    context (Week 4 finding).
  - No interface carries passenger notifications to passengers (NEED-011, SCN-005 step 5); passengers are users outside the
    system, so this is a human-system interface the reference does not list.
  - Verification coverage: IF-005, IF-006, IF-007 have verification cases (VER-001, VER-010, VER-009); most information
    interfaces have none. SEBoK: every interface and interaction between implemented elements is verified during integration
    (R22 p.630).
- **Figure.** The N² with empty rows highlighted red for EXT-004 and EXT-005.
- **Sources.** R22 p.630; `reference/week03.ts`, `week08.ts`, `week12.ts`.

#### S2.9 Coupling of two allocation alternatives (preview of the graduate task) (5 min)
- **Content.** Old-module result, recomputed and test-pinned: reference allocation κ = 10/19 = 0.526 vs distributed
  dispatch κ = 16/19 = 0.842 over 19 instructor-defined flows (course metric). What the count cannot see: criticality,
  site aggregation, concentration risk at the hub (modularity vs resilience, R20c p.599).
- **Figure.** Two N² heat maps side by side with κ values.
- **Sources.** R20c p.599; R22 p.631; old `w8-advanced` (instructor-defined metric and flows, FICTIONAL).

### Section H: Consolidation and bridge (7 min)

#### S2.10 Common errors (3 min)
- **Content.** (1) Interfaces named after organizations instead of what crosses. (2) One-ended interfaces. (3) An
  organizational agreement as the carrier of data. (4) Missing external interfaces. (5) Hidden external interfaces ignored
  (R55 p.369). (6) Untyped interfaces. (7) No constraint or requirement on an interface (R13 p.563). (8) No owner per side.
  (9) Degrees that do not sum to twice the interface count.
- **Sources.** As listed.

#### S2.11 Interfaces and verification (2 min)
- **Content.** Each interface definition names how it will be verified; integration checks that no element or interface
  is forgotten (R22 p.630). Week 12 models verification cases.
- **Sources.** R22 p.630.

#### S2.12 Where this goes: Week 6 and Week 11 (2 min)
- **Content.** Week 6: technology insertion needs the interfaces the new technology must meet. Week 11: components become
  parts, interfaces become ports, interfaces and connections, and what crosses becomes flows (§7).
- **Sources.** COURSE_SCHEDULE.md rule 6; R71 pp.18–29 (Phase II; named only).

### Section J: Laboratory launch (22 min)

#### S2.13 Lab L5 brief (3 min)
- **Content.** Deliverables (§5.5), minimums, due before Week 6 Session 1; the team's own enterprise.

#### S2.14 Team work: the first N² (12 min)
- **Content.** Teams place their Week 4 physical elements and external systems on the diagonal and fill the cells from
  their Week 4 information view and allocation; they type each interface. The instructor checks typing and two-ended
  definitions.
- **Figure.** Timer plus a blank N² template.
- **Sources.** R22 pp.630–631; course convention.

#### S2.15 Instructor check (5 min)
- **Content.** Two teams read their degree totals aloud; the room checks the sum rule.

#### S2.16 Close (2 min)
- **Content.** Seven-day plan (§5.4); quiz opens; log hours.

**Session 2 running total**

| Section | Slides | Minutes | Cumulative |
|---|---|---|---|
| F Managing interfaces | S2.1–S2.6 | 23 | 23 |
| G AeroLink worked example | S2.7–S2.9 | 17 | 40 |
| H Consolidation and bridge | S2.10–S2.12 | 7 | 47 |
| *Lecture subtotal* | *12 slides* | *47* | |
| J Lab launch | S2.13–S2.16 | 22 | **69** |
| References and credits (generated) | — | 0 | 69 + 6 buffer = **75** |

## 4. AeroLink worked example (FICTIONAL)

### 4.1 Component breakdown (level 1 from `reference/week08.ts`; level 2 proposed)

| PHY | Name | Count / attributes | Functions allocated | Requirements satisfied | Owner (case module) | Level-2 components *(proposed)* |
|---|---|---|---|---|---|---|
| PHY-001 | eVTOL Aircraft | 12 baseline, 16 planned (DEC-001); 4 seats; 150 km/h | FN-005 | REQ-SYS-002, REQ-SYS-007 | AeroLink | airframe and rotors, battery pack, flight management and health monitoring |
| PHY-002 | Vertiports | 6 sites: 3 hubs, 3 spokes | FN-014 | REQ-STK-007 | Vertiport operators (WSoI) | pads, terminal and step-free route |
| PHY-003 | Charging Systems | 12 installed: 6 high-power at hubs, 6 standard at spokes; 20 min to dispatch threshold | FN-006, FN-007 | REQ-SYS-001, REQ-SYS-010 | Vertiport operators (WSoI) | turnaround chargers, standard chargers, vertiport power controller |
| PHY-004 | Operations Center | 1 site, hot standby (DEC-002) | FN-002, 003, 004, 009, 011, 012, 013 | via LOG-001, 005, 006, 002 | AeroLink | scheduling and dispatch platform, standby platform, duty-manager console |
| PHY-005 | Maintenance Facility | 1 site | FN-008 (AI-001 hosted) | REQ-SYS-008 via LOG-003 | AeroLink | battery workshop, diagnostic tools |
| PHY-006 | Communications Infrastructure | datalink + ground network | none (medium) | — | AeroLink (segments may be leased: open question) | air-ground datalink, ground network |
| PHY-007 | Passenger booking platform | app and back end | FN-001 | REQ-STK-001 | AeroLink | — |
| PHY-008 | Pad fire detection and alarm system | all pads | FN-010 | REQ-SYS-009 | Vertiport operators *(proposed)* | thermal and flame detectors, alarm transmitter |

### 4.2 Interface counts
14 interfaces: physical 3 (IF-001, 005, 006); information 9 (IF-002, 003, 007, 008, 010, 011, 012, 013, 014);
organizational 2 (IF-004, 009); external 4 (IF-003, 006, 007, 011). Degrees sum to 28.

### 4.3 Interface N² (upper triangle; P = physical, I = information, O = organizational)

| | PHY-002 | PHY-003 | PHY-004 | PHY-005 | PHY-007 | PHY-008 | EXT-001 | EXT-002 | EXT-003 | EXT-006 |
|---|---|---|---|---|---|---|---|---|---|---|
| **PHY-001** | IF-001 P | IF-005 P | IF-002 I | IF-013 I | | | | | | |
| **PHY-002** | — | | IF-009 O, IF-014 I | | | | | | | |
| **PHY-003** | | — | IF-010 I | | | | | IF-006 P | | |
| **PHY-004** | | | — | IF-004 O, IF-012 I | IF-008 I | | IF-003 I | | IF-011 I | |
| **PHY-008** | | | | | | — | | | | IF-007 I |

### 4.4 Interface table (from `reference/week08.ts`; direction, owners and verification columns partly proposed)

| IF | Ends | Type | What crosses | Direction | Constraint / requirement | Verification |
|---|---|---|---|---|---|---|
| IF-001 | PHY-001 ↔ PHY-002 | P | landing loads, tie-down, pad markings | both | — | — |
| IF-002 | PHY-001 ↔ PHY-004 | I | INFO-002 flight following, energy state, telemetry (over PHY-006) | aircraft → center | REQ-SYS-003 | — |
| IF-003 | PHY-004 ↔ EXT-001 | I, external | flight intent and acceptance | both | REQ-STK-009 | — |
| IF-004 | PHY-004 ↔ PHY-005 | O | work orders, release to service (procedure) | both | REQ-STK-006 | — |
| IF-005 | PHY-001 ↔ PHY-003 | P | DC power, battery-management handshake | charger → aircraft (handshake both) | REQ-SYS-001 | VER-001 |
| IF-006 | PHY-003 ↔ EXT-002 | P, external | electrical power within agreed limit | grid → chargers | TBD-02 (U-002); REQ-SYS-010 | VER-010 |
| IF-007 | PHY-008 ↔ EXT-006 | I, external | battery-fire alarm, pad location | alarm → responders | ≤ 30 s; REQ-SYS-009 | VER-009 |
| IF-008 | PHY-007 ↔ PHY-004 | I | INFO-001 confirmed requests; assignments back | both | REQ-SYS-005 | VER-005 (via LOG-005) |
| IF-009 | PHY-002 ↔ PHY-004 | O | pad slots, ground-handling duties (agreement) | both | — | — |
| IF-010 | PHY-003 ↔ PHY-004 | I | charge-session records, charge-complete status | chargers → center | — | — |
| IF-011 | EXT-003 ↔ PHY-004 | I, external | INFO-004 forecasts | service → center | REQ-SYS-004 | — |
| IF-012 | PHY-005 ↔ PHY-004 | I | go/no-go, availability, release records | maintenance → center | ≤ 2 min; REQ-SYS-008 | VER-008 |
| IF-013 | PHY-001 ↔ PHY-005 | I | health and fault reports | aircraft → maintenance | — | — |
| IF-014 | PHY-002 ↔ PHY-004 | I | boarding timestamps, gate status | vertiports → center | MOE-001 data | — |

Directions are instructor readings of the `carries` text **(proposed, instructor to confirm)**; the reference stores no
direction or owner fields.

### 4.5 Reference-data defects (for reconciliation; not changed here)
1. EXT-004 and EXT-005 have no interface although SCN-004 A1 and A-008 use them.
2. IF-011's end is EXT-003, a natural system (also a Week 4 finding).
3. No human-system interface to passengers for notifications (NEED-011; SCN-005).
4. Interfaces lack direction, owner and verification attributes; most information interfaces have no VER case.
5. PHY-008's owner is not recorded; PHY-006 ownership (owned vs leased segments) is open.
6. `reference/week01.ts` still uses organization names for EXT-001, 002, 004, 006; British spellings in `week08.ts`.

## 5. Laboratory outline: Lab L5, Component breakdown and interface definitions

### 5.1 Inputs
- The team's Week 4 architecture description (physical view, allocation matrix, information view, decision record) and
  Weeks 1–3 package (context EXT list, requirements, risk register).
- Session slides, handout, §4 tables.
- Readings (essential, 15 pp): R57 pp.410–414; R47 pp.138–140; R22 pp.630–631; R20c pp.597–599, 603; R13 p.563.

### 5.2 Objectives
W5.1–W5.5 applied to the team's own enterprise.

### 5.3 Method
1. **Component breakdown** to two levels where useful, 5 ± 2 per level, each with a responsibility card (S1.4–S1.9).
2. **N² chart** of physical elements and external systems; type every interface; check the degree sum (S1.13–S1.14).
3. **Crossing-flow check** against the Week 4 information view and allocation (S1.15).
4. **Interface table** with all course columns (S1.16).
5. **Interface requirements** for every external interface by the three steps (S1.17).
6. **Interface-management notes:** standards used, agreements and service levels for organizational interfaces, ICWG
   membership, risks linked to interfaces (S2.2–S2.6).
7. **Audit:** gaps, hidden external interfaces, verification coverage (S2.8).

### 5.4 Procedure

| Step | When | Lead role | Output |
|---|---|---|---|
| 1. First N² | In class, S2.14 | Architecture | Part 2 draft |
| 2. Component breakdown and cards | Day 1–2 | Architecture | Part 1 |
| 3. Complete N²; typing; degree check | Day 2 | Architecture with AI & Data | Part 2 |
| 4. Crossing-flow check; add missing interfaces | Day 3 | AI & Data Management | Part 2 notes |
| 5. Interface table | Day 3–4 | each member owns ≥ 2 rows | Part 3 |
| 6. External interface requirements | Day 4–5 | Requirements & Compliance | Part 4 |
| 7. Management notes and risk links | Day 5 | V&V | Part 5 |
| 8. Audit; AI usage statement | Day 6 | V&V; AI & Data | Part 6 |
| 9. Integration and upload | Day 7 | V&V lead | Submission |

### 5.5 Outputs
`team-NN-week5-interfaces.md` and `team-NN-week5-model-inputs.json` (PHY elements with responsibilities, IF elements with
type, ends, carries, direction, owner, constraint, verification). Minimums (course convention): ≥ 5 level-1 components;
≥ 8 interfaces covering all four kinds; every external system with at least one interface or a recorded reason; ≥ 3
interface requirements; ≥ 2 interface-linked risks.

### 5.6 Rubric rows (ASSESSMENT_RUBRICS.md)

| Row | Criterion | Applied this week |
|---|---|---|
| RB-7.3 | Allocation and interfaces (25) | **Interface part**: N² with typed interfaces (physical, information, organizational, external) and both ends; combined with the Week 4 allocation score (faculty to confirm) |
| RB-7.5 | Information flows (20) | Re-scored only for the crossing-flow coverage: every information flow rides an information interface or a recorded relay |
| RB-3.2 (applied to interface requirements) | Verifiable | Each interface requirement has a measurable criterion or TBD with an AROU entry and a method |
| **Proposed RB-7.7** | Interface definitions (new) | 4: every interface has what crosses, direction, medium, constraint, owner per side and verification; 3: one attribute missing on a few; 2: names and ends only; 1: list of connections |
| **Proposed RB-7.8** | Interface management and risk (new) | 4: standards, agreements, ICWG and interface risks recorded and linked; 3: most; 2: generic; 1: none |
| RB-12.1–12.3 | AI usage statement | Yes |

Proposed rows need faculty approval and new weights inside RB-7 (the official Interface Inventory deliverable carries its
own weight in the course document).

### 5.7 Per-student workload

| Activity | Hours | Basis |
|---|---|---|
| Class sessions | 2.5 | 2 × 75 min |
| Readings, 15 pp | 1.0 | §5.1 |
| Handout and worked example | 0.4 | |
| Session 2 pre-work | 0.2 | S1.20 |
| Lab share (steps 2–9) | 2.8 | about 11 person-hours per team of 4 (breakdown 1.5; N² and checks 2.0; interface table 3.0; requirements 1.5; management notes 1.5; audit and integration 1.5) |
| Quiz | 0.3 | 10 items |
| Individual exercise / graduate task | 0.7 | §6.2 |
| Time log | 0.1 | |
| **Total** | **8.0** | 3-person teams about 8.9 h unless the interface minimum drops to 6 |

## 6. Assessment outline (unseen, non-AeroLink contexts)

### 6.1 Quiz Q5 (15 min, 10 items: 7 single-best-answer, 3 short answer)

| # | Objective | Bloom | Item focus | Key rests on |
|---|---|---|---|---|
| 1 | W5.1 | Understand | Which of five items is not a system element under 15288? | P5-3 p.1643 |
| 2 | W5.1 | Apply | A hospital breakdown has 11 elements at one level: apply the guideline | R20c p.597 |
| 3 | W5.1 | Understand | System breakdown vs WBS: which describes the work? | P5-4 p.1640; P5-6 p.104 |
| 4 | W5.2 | Apply | Type four interfaces of a food-bank network | Course convention; R20c p.597 |
| 5 | W5.2 | Analyze | Given an N² with degrees 4, 3, 3, 2, how many interfaces? | Sum rule (course) |
| 6 | W5.4 | Analyze | Identify the hidden external interface in a campus-shuttle description | R55 p.369; R54 p.331 |
| 7 | W5.5 | Understand | When should an ICWG be used? | R57 p.414 |
| 8 (SA) | W5.4 | Apply | Write an interface requirement for a given exchange by the three steps | R13 p.563 |
| 9 (SA) | W5.3 | Apply | Complete a defective interface row (missing direction, owner, constraint) | R57 p.413; course columns |
| 10 (SA) | W5.5 | Evaluate | A design concentrates 9 of 14 interfaces on one element: one benefit, one risk | R20c p.599; R46 p.127 |

### 6.2 Graduate task (individual, about 40 min; always-read notebook entry)
**Coupling comparison.** For the team's enterprise, define two allocation alternatives for the same functions, build the
directed functional N² for each, compute E, X, κ = X/E, P (element pairs joined by a crossing flow) and D_max, and argue
what the metric cannot see (criticality, aggregation, concentration risk). The metric is the course's (old `w8-advanced`),
labeled as such; R20c p.599 and R22 p.631 support only the aim of fewer interfaces and the coupling matrix.

## 7. Continuity to Phase II

- **Week 11 (Physical / Interfaces)** models this week's artifact (COURSE_SCHEDULE rule 6: Week 11 ↔ Week 5). Components
  become part definitions and usages; interface ends become ports; interfaces become interface definitions and connections;
  what crosses becomes flows of items; FN → PHY becomes allocation. Readings named only: R71 pp.18–29 (connections, ports,
  interfaces, flows); R76 pp.106–107 (allocation).
- **Week 12** turns the interface verification column into verification cases.
- **Week 13** may reuse the coupling count as an analysis (instructor option).
- IDs PHY and IF are the import keys.

## 8. Source gaps

1. **N² conventions** (diagonal elements; row outputs, column inputs; symmetric interface form) are not stated in the
   collection; R22 pp.630–631 cites Grady (1994), not in the collection.
2. **Interface typing** (physical, information, organizational, external) comes from the course document, not a source.
3. **Interface definition attributes**: MITRE asks for a consistent attribute set (R57 p.413) but gives no column list;
   ICD templates and ISO/IEC/IEEE 29148 interface guidance are not in the collection.
4. **Coupling metric** (κ, P, D_max) is instructor-defined; no source defines a numerical coupling measure.
5. **Human-system interfaces** (passengers, operators) have no dedicated source in the collection.
6. **MIL-STD-881** (WBS) is referenced by DoD p.104 but not in the collection.

## 9. Register additions needed

All verified in the extracted text for this outline. None is in `readings.py` yet.

| Proposed ID | Source, PDF pages | Title | Used on | Verification note |
|---|---|---|---|---|
| P5-1 | SEBoK p.1541 | Interface (glossary) | S1.10 | Entry heads the page; three definitions (ISO/IEC 2382-1; ISO/IEC/IEEE 24765) |
| P5-2 | SEBoK p.1467 | Component (glossary) [page begins with *Complexity avoidance*] | S1.4 | Second entry on the page; three definitions |
| P5-3 | SEBoK p.1643 | System Element (glossary) [page begins with *System Deployment and Use*] | S1.4; quiz 1 | Second entry; 15288:2015 definition with element types |
| P5-4 | SEBoK p.1640 | System Breakdown Structure (glossary) | S1.6; quiz 3 | Entry heads the page; IEEE 1220-2005 definition |
| P5-5 | SEBoK pp.429–430 | Applying Life Cycle Processes (life-cycle process recursion) | S1.5 | Running header on both pages; p.430 hierarchical decomposition of an SoI and recursive application of the definition processes |
| P5-6 | DoD SE Guidebook p.104 | Work Breakdown Structure (§4.1.1 subsection) | S1.6; quiz 3 | Heading "Work Breakdown Structure" on p.104; product-oriented decomposition, outcomes not actions, WBS dictionary |
| (P4-1) | DoD SE Guidebook pp.144–147 | 4.2.3 Architecture Design Process (R48c) | S1.7 | Proposed in Week 4; p.145 product structures |

Pages used inside existing ranges (no addition): R46 p.127; R55 p.369; R54 p.331; R13 p.563; R20c pp.596–599, 603;
R22 p.630–631; R47 pp.138–140; R57 pp.410–414.

**Week 5 essential readings (proposed):** R57 pp.410–414; R47 pp.138–140; R22 pp.630–631; R20c pp.597–599, 603; R13
p.563. **Extension:** R22 (full); R55 pp.368–369; R46 p.127.

## 10. Open items for faculty

1. Approve the four-kind interface typing and the N² conventions as course conventions.
2. Add RB-7.7 and RB-7.8 (or score interfaces inside RB-7.3 only).
3. Reference fixes in §4.5: interfaces for EXT-004 and EXT-005; a weather information service; a passenger notification
   interface; direction/owner/verification attributes.
4. Whether second-level components (§4.1) become reference data.
5. Approve register additions P5-1..P5-6.
