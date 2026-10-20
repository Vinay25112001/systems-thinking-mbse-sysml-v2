# Week 1 Lecture Outline: Team Formation / Needs / Identifying Stakeholders

> **Superseded for the slide plan, timing and case data (2026-10-19, after the independent review).** The lecture source (`src/content/lectures/week01/session1.ts`, `session2.ts`, `aerolinkCase.ts`) is now authoritative: Session 1 has 24 slides plus a generated references slide (69 min + 6 min buffer), Session 2 has 21 slides plus references (47 min lecture, 22 min lab launch, 6 min buffer). The P-numbers below are historical placeholders: read each as its register ID from the mapping that follows. Finding-by-finding dispositions: `REVIEW_DISPOSITIONS.md`.

> **Register ID mapping (added 2026-10-19).** The proposed P-numbers below are placeholders. They are now in `_source_cache/verification/readings.py` under these IDs, each title-verified on its first page by `verify_readings.py` and each pending faculty confirmation: P1 → R91, P2 → R92, P3 → R93, P4 → R94, P5 → R95, P6 → R96, P7 → R97, P8 → R98, P9a → R39c, P9b → R39d, P9c → R39e, P9d → R39f, P9e → R39g, P9f → R39h, P9g → R39i, P9h → R39j, P9i → R39k, P10 → R99, P11 → R65. R48 correction: R48a (pp.141–142, Stakeholder Requirements Definition) and R48b (pp.142–144, Requirements Analysis) were added; R48 (pp.141–147) is kept as the umbrella entry, because Weeks 4–5 cite it, including p.146 in Architecture Design.

**Status.** Draft for faculty approval (COURSE_PRODUCTION_PLAN M1). Written 2026-10-18.
**Governing documents.** DECISION_LOG A19 and A20; COURSE_SCHEDULE.md (Week 1 subject, exact); `WEEK1_CRITICAL_REVIEW.md` (same folder).
**Format.** Two sessions of 75 minutes each.
- Session 1 is all lecture: 28 slides.
- Session 2 is about 47 minutes of lecture (17 slides) followed by about 28 minutes of laboratory launch (4 slides).
- Total: 49 slides.

## 0. Conventions used in this outline

- **Citations.**
  - `R11 p.552` = verified register entry R11, PDF page 552 (SEBoK pages are PDF indices, DECISION_LOG W1).
  - `P6 p.986` = a **proposed register addition** (list in §7). Its page text was checked for this outline, but it is not yet in `readings.py`.
  - `S12 p.52` = DoD SE Guidebook PDF page.
  - Every citation below was checked against `_source_cache/*.txt`. A citation supports only what is written beside it.
- **Course convention** marks content the collection does not supply. It is taught as the course's choice, not as literature.
- **AeroLink** values are FICTIONAL and come from `src/model/airtaxi.ts` and `src/model/reference/week01–03.ts`:
  - The Data Sheet: 12 aircraft, 4 seats, 6 vertiports, 2 chargers each, a 16 h day, a 25 km trip at 150 km/h (about 10 min), a 20 min charge, a 20 % reserve and a 65 dBA pad-edge limit.
  - STK-001..014, CON-001..016, REL-001..008, EXT-001..006, MGO-001..009 and NEED-001..011.
  - Nothing is retyped from memory. Where the outline proposes a value not yet in `src/` it says **(proposed, instructor to confirm)**.
- **Quotations** are limited to short definitions. Everything else is paraphrased. All figures are original drawings, not redraws of SEBoK or MITRE figures.

## 1. Learning objectives (graduate level)

Existing IDs B1.1–B1.5 are kept for continuity with `course.ts`. B1.6 and B1.7 are proposed additions.

| ID | Objective | Bloom | Taught in |
|---|---|---|---|
| B1.1 | Form a project team and write a charter (roles, decision rules, communication norms, ID ownership), and justify its structure against SE team practice | Apply | S1.18–20; lab |
| B1.2 | Define and distinguish system, system of interest, enabling system, enterprise, boundary, environment and context, citing the source of each definition, and analyze how a boundary choice changes the questions a study can answer | Analyze (was Understand) | S1.6–14 |
| B1.3 | Propose an enterprise and the system of interest inside it, with a boundary and a context, for instructor approval | Apply | S1.11–13; lab |
| B1.4 | Identify stakeholders by three complementary methods; classify them; record specific concerns, influence and interest with reasons, and relationships including conflicts | Apply / Analyze | S1.21–27; S2.2–3 |
| B1.5 | Write well-formed stakeholder need statements traced to stakeholders and concerns; distinguish needs from requirements | Apply | S2.4–9, 14–15 |
| **B1.6 (new)** | Place stakeholder needs work in the life cycle and in the ISO/IEC/IEEE 15288 technical processes (via SEBoK), and explain why the integrated set of needs is the validation reference that the requirements are transformed from | Understand / Analyze | S1.15–17; S2.4–7 |
| **B1.7 (new)** | Select elicitation techniques for a stakeholder, and evaluate a set of needs for coverage, conflict and priority | Evaluate | S2.10–13, 16 |
| Graduate | Critique a set of needs against the sourced characteristics and defend each revision | Evaluate | Applied exercise (§5.2) |

## 2. Session 1: Systems, teams and stakeholders (75 min, all lecture)

**Design rationale.** Session 1 builds the conceptual frame that stakeholder work rests on: what the system is, where its boundary lies, where in the life cycle the work happens, and who does it. It then teaches stakeholder identification and classification on AeroLink. There are no team activities beyond two short think-pair-share prompts and the roster at the exit. A20's rule is to teach first.

### Section A: Course framing and the reference case (11 min)

#### S1.1 Week 1 at a glance (2 min)
- **Purpose.** Orient students: the subject, the two sessions, what they will be able to do.
- **Content.**
  - Subject, exactly as scheduled: *Team Formation / Needs / Identifying Stakeholders*.
  - The seven objectives in plain words.
  - Session 1 covers systems, life cycle, teams and stakeholders. Session 2 covers concerns, needs, the worked example and the lab launch.
  - The outputs of the week: team charter, enterprise proposal, context, stakeholder register with relationships, initial needs.
- **Figure.** A horizontal band of five boxes (Charter → Enterprise proposal → Context → Stakeholder register → Initial needs). A bracket underneath reads "Week 1 Team Record". Two dimmed boxes to the right read "Week 2 ConOps and requirements" and "Week 8 SysML v2 model". Adapted from the existing `week-path` figure.
- **Sources.** Course schedule (COURSE_SCHEDULE.md). Course convention for the Team Record.

#### S1.2 The driving question: is this list enough? (3 min)
- **Purpose.** Create a need to know before any explanation. Elicit a prediction.
- **Content.**
  - AeroLink plans a new vertiport next to a residential district. The project team proposes to write the needs from three stakeholders only: passengers, investors and the aircraft manufacturer.
  - Students vote (A) enough, (B) add more users or customers, (C) add other kinds of party, (D) cannot tell yet.
  - The answer is withheld until S1.27.
- **Figure.** A plan-view sketch of a vertiport pad beside housing blocks, with three highlighted figures (passenger, investor, manufacturer) and many faint unlabeled silhouettes around the site.
- **Sources.** Driving question reused from `WEEK1_INTRO.question` (instructor-authored).

#### S1.3 The course architecture: one enterprise, two representations (2 min)
- **Purpose.** Show why Week 1 data must be precise.
- **Content.**
  - Phase I (Weeks 1–7) builds a document-based Systems Thinking Engineering Package.
  - Phase II (Weeks 8–14) rebuilds it as a SysML v2 model.
  - Week 8 imports this week's stakeholders and concerns; Week 9 models this week's needs (COURSE_SCHEDULE rule 6).
  - Stable IDs (STK, CON, NEED) are therefore engineering data, not paperwork.
- **Figure.** Two parallel lanes, Phase I documents and Phase II model. Vertical dashed arrows link Week 1 → Week 8 and Week 2 → Week 9. The Week 1 → Week 8 arrow is labeled "STK, CON → part def, concern".
- **Sources.** COURSE_SCHEDULE.md, schedule and rule 6. R77 p.115 (Phase II reading; named only).

#### S1.4 AeroLink is the instructor's case; your enterprise is your own (2 min)
- **Purpose.** Separate the worked example from the team project, which is a faculty rule.
- **Content.**
  - Every method is demonstrated on AeroLink first; each team then applies it to its own instructor-approved enterprise.
  - **The criteria for a team enterprise (course convention):**
    - several interacting parts;
    - people as well as technology;
    - exchanges across the boundary;
    - stakeholders whose needs differ;
    - enough substance for Phase II modeling.
  - Too small: a single product with no enterprise around it. Too large: a whole industry.
  - AeroLink, or a near copy of it, is not available to teams.
- **Figure.** Two columns. Left: "AeroLink (worked in class)", with an eVTOL icon. Right: "Your enterprise (worked in lab)", with three example tiles: regional food bank network, hospital emergency department, campus shuttle service. Arrows labeled "same method" run left to right.
- **Sources.** COURSE_SCHEDULE.md, instructional rules 1–3. Course convention (criteria; reused from `w1-system` para 4 and the answer key).

#### S1.5 Meet AeroLink (2 min)
- **Purpose.** Give the case enough substance to reason about.
- **Content.**
  - AeroLink Urban Mobility (FICTIONAL) runs electric vertical-take-off air taxis between vertiports.
  - Teaching data: 12 aircraft × 4 seats; 6 vertiports × 2 chargers; 16 h per day; a typical trip of 25 km at 150 km/h (about 10 min); a 20 min charge to the dispatch threshold.
  - The five operational scenarios: SCN-001 Passenger Ride Request; SCN-002 Passenger Transport Mission; SCN-003 Aircraft Charging; SCN-004 Maintenance Event; SCN-005 Weather Disruption.
  - Every number is a teaching value.
- **Figure.** A "case card": a stylized network of six vertiport nodes, a Data Sheet panel with the values above, and a five-step strip for the scenarios.
- **Sources.** `DATA_SHEET`, `OFFICIAL_ELEMENTS.scenarios` (airtaxi.ts). FICTIONAL.

**Transition A → B.** "Before we can ask *whose* needs, we have to agree *what system* we mean, because the stakeholders follow from the system and its boundary."

### Section B: System concepts at graduate depth (24 min)

#### S1.6 What systems engineering is for (2 min)
- **Purpose.** Anchor the week in the purpose of SE: successful systems satisfy stakeholder needs.
- **Content.**
  - SEBoK describes SE as a transdisciplinary approach to realizing successful systems. Success means satisfying the needs of customers, users and *other* stakeholders (R01 p.51).
  - The consensus SE principles (SEBoK lists 15) include three that frame this week (P1 p.130):
    - (1) SE is specific to stakeholder needs, solution space and context.
    - (2) SE takes a holistic view that includes enabling systems and the environment.
    - (7) SE addresses stakeholder needs that change over the life cycle.
- **Figure.** A simple triangle: Stakeholder needs at the apex, System and Context at the base corners. A circular arrow around it is labeled "changes over the life cycle".
- **Sources.** R01 p.51; **P1 p.130 (register addition needed)**.

#### S1.7 Three definitions of "system" (3 min)
- **Purpose.** Show that "system" has disciplinary meanings, and adopt the engineering one deliberately.
- **Content.** The SEBoK glossary gives three definitions (R38 p.1637):
  1. Systems science, von Bertalanffy: "a set of elements in interaction". It applies to natural, social and technical systems.
  2. ISO/IEC/IEEE 15288:2015, as given by SEBoK: "combination of interacting elements organized to achieve one or more stated purposes".
     - SEBoK notes that its glossary wording is an *expanded* version of the standard's.
     - It calls this "the recognized definition for systems engineers" and restricts it to engineered systems created to provide value to beneficiaries.
     - Elements may include hardware, software, people, information, facilities and services.
  3. INCOSE Fellows (2019): parts that together exhibit behavior or meaning the individual parts do not.
- **Teaching point.** Definition 2 makes *purpose* and *beneficiaries* part of what a system is. That is the logical hook for stakeholders.
- **Figure.** Three stacked cards, each with the short definition, its origin and its domain of applicability: all systems / engineered systems / emergent behavior. Card 2 is highlighted as "this course's working definition".
- **Sources.** R38 p.1637 (all three definitions and the SEBoK commentary).

#### S1.8 Engineered system and engineered system context (2 min)
- **Purpose.** Move from "a system" to "a system in its context", which is where SE actually operates.
- **Content.**
  - **Engineered system** (R01 p.51): a technical or socio-technical system that is the subject of an SE life cycle, designed or adapted to operate in an anticipated environment for intended purposes under constraints.
  - **Engineered system context** (R01 p.51): centered on an engineered system, but including other engineered, social and natural systems.
  - SEBoK's "single most important principle of the systems approach": it is applied to a context, not only to a single system (P2 p.326).
  - **Four context types** (P2 p.326): product system; service system; enterprise system; system of systems capability.
  - AeroLink is a *service* in an *enterprise* context.
- **Figure.** Four small panels, one per context type, each with a one-line AeroLink reading. Product: the eVTOL aircraft. Service: the air-taxi service. Enterprise: the AeroLink enterprise. SoS: urban mobility with public transport.
- **Sources.** R01 p.51; **P2 p.326 (register addition needed)**.

#### S1.9 System of interest, enabling systems and the systems around them (3 min)
- **Purpose.** Introduce the distinction most first-year students miss: operational versus enabling systems.
- **Content.**
  - **System of interest** has two definitions (R39b p.1652):
    - "the system whose life cycle is under consideration" (15288:2015), which SEBoK calls the common SE definition;
    - "the system of interest to an observer" (von Bertalanffy).
  - SEBoK adds that a system of interest may include both operational and enabling systems (R39b p.1652, discussion).
  - **Enabling system** (P9a p.1493): complements the system of interest during its life-cycle stages, but does not necessarily contribute directly to its function in operation. Examples are maintenance, test, installation and training systems, and even the project team and its information resources.
  - **Applied to AeroLink:**
    - Aircraft, vertiport pads and the operations center are operational.
    - The maintenance facility, the training system and the charger-commissioning test rig are enabling.
    - The electric grid is an external system that the service depends on.
  - **Why it matters for stakeholders.** Each enabling system has owners and operators. They are stakeholders found by the life-cycle sweep (S1.23).
- **Figure.** A central rounded box, "System of interest: AeroLink air-taxi service". Around it, a ring of operational elements (fleet, pads, operations center). Outside the ring, four "enabling" tiles (maintenance facility, training system, test rig, project team) joined by dotted lines labeled with the life-cycle stage they serve. Separate external systems (grid, airspace) are joined by solid lines.
- **Sources.** R39b p.1652; **P9a p.1493 (register addition needed)**. The AeroLink element lists come from `OFFICIAL_ELEMENTS.physical` (PHY-001..006).

#### S1.10 Enterprise, organization, extended enterprise (3 min)
- **Purpose.** Make the enterprise concept exact, because each team proposes an *enterprise*.
- **Content.**
  - **SEBoK's working definition** (R07 p.815, after Rebovich and White): a purposeful combination, such as a network, of interdependent resources (people, processes, organizations, technologies, funding). They interact with each other and with their environment to achieve business and operational goals.
  - **The glossary's preferred definition** (P9b p.1497): (1) one or more organizations sharing a definite mission, goals and objectives to offer a product or service. SEBoK prefers it because it focuses on *purpose rather than structure*.
  - **An enterprise is not an organization.** Treating them as the same is "a frequent misuse". An enterprise includes people, knowledge, processes, policies, facilities and other assets, and some enterprises contain no identifiable organization (R07 p.815).
  - **Extended enterprise** (R07 p.816): upstream suppliers, downstream consumers, and "sidestream" partners and key stakeholders.
  - **Consequence for the proposal.** Name the enterprise (purpose plus participants), then name the system of interest inside it.
- **Figure.** Nested regions: the organization (AeroLink Urban Mobility) is a small shape inside the enterprise region. The extended enterprise ring outside it holds the vertiport operators, the utility, the OEM, insurers and investors.
- **Sources.** R07 pp.815–816; **P9b p.1497 (register addition needed)**.

#### S1.11 AeroLink: three scopes, one question (2 min)
- **Purpose.** Demonstrate that the system of interest is chosen *for a question*.
- **Content.**
  - The question: "Will adding aircraft reduce average passenger waiting time?"
  - Candidate (a), the aircraft: cannot answer, because waiting is outside the boundary.
  - Candidate (b), flight operations: optimistic if chargers and pads are the real limit.
  - Candidate (c), the air-taxi service (fleet, vertiports and chargers, operations center, demand): large enough to contain the feedback between demand, capacity and waiting, and small enough to analyze.
  - Synthesis check: the urban transport and airspace systems become environment.
- **Figure.** Three concentric dashed boundaries labeled (a), (b) and (c). A "waiting time" marker lies outside (a), inside (c), and on the edge of (b) with its cause (chargers) outside.
- **Sources.** Reused from the reviewed `w1-worked` (R02 p.264; R50 pp.46–47).

#### S1.12 Boundary, environment and context: the vocabulary (3 min)
- **Purpose.** Give precise, sourced definitions, replacing the existing "course" labels.
- **Content.**
  - **System boundary** (P9g p.1639, after Checkland): a distinction an observer makes between what is taken to be the system and its environment.
  - **Boundary principle** (R04 p.274): the boundary concentrates interactions inside while allowing exchange with external systems.
  - **Environment** (P9c p.1501) has two definitions:
    - (1) anything affecting, or affected by, a subject system through interaction (system science);
    - (2) the surroundings in which the system of interest is used and supported, or developed, produced or retired (engineered systems).
    - Definition 2 means there are *several* environments across the life cycle.
  - **System context** (P9h p.1641, after Flood and Carson):
    - (1) the system's relationships and environment, resolved around a selected system of interest;
    - (2) the context diagram, the highest-level view of a system in its environment.
  - **Systemic resolution** (R02 p.264): focusing complex relationships on a chosen boundary. It is an ongoing act of attention, not a one-off decision.
- **Figure.** A labeled anatomy diagram. A closed curve (the boundary) with internal elements and dense internal links. Sparse arrows cross the curve to external systems (the exchanges). The shaded surround is labeled "environment (operational)", and a second faint surround is labeled "environment (development, production, retirement)".
- **Sources.** R02 p.264; R04 p.274; **P9c p.1501, P9g p.1639, P9h p.1641 (register additions needed)**.

#### S1.13 The structure of a context, applied to AeroLink (4 min)
- **Purpose.** Graduate-level context analysis: narrower and wider system of interest, immediate and wider environment.
- **Content.** SEBoK's open-system context (P2 pp.326–327, after Flood and Carson) has four layers:
  - **Narrower system of interest (NSoI).** Of direct concern; scoped by authority or control.
  - **Wider system of interest (WSoI).** Every element needed to understand behavior, including some the observer does not control.
  - **Immediate environment.** Engineered, natural and social systems that directly exchange material, energy or information with the WSoI.
  - **Wider environment.** No direct interaction, but it may influence decisions.

  The choice of boundary depends on "what can be changed and what must remain fixed" (P2 p.327).

  **AeroLink reading:**
  - NSoI: the AeroLink air-taxi service.
  - WSoI: adds the independent vertiport operators' pads and chargers, which AeroLink does not own but cannot ignore.
  - Immediate environment: EXT-001 air navigation service provider (airspace access); EXT-002 electric utility grid (power); EXT-003 weather (one-way influence); EXT-004 aircraft manufacturer (aircraft, delivery lead time); EXT-005 public transport network (passengers); EXT-006 emergency services (incident response).
  - Wider environment: regional economy, public opinion, national aviation policy.

  **Think-pair-share (1 min).** Is the electric grid in the WSoI or the immediate environment? Defend the answer with "what can be changed".
- **Figure.** Four nested rounded rectangles: NSoI, WSoI, immediate environment, wider environment. The six EXT items sit in the immediate-environment band, each joined to the WSoI by a labeled arrow giving the exchange and its direction (the weather arrow points inward only). The wider band holds three faint labels.
- **Sources.** **P2 pp.326–327 (register addition needed)**. EXT-001..006 from `reference/week01.ts`.

#### S1.14 Boundary choice is a decision: purpose, control and power (2 min)
- **Purpose.** Show that boundaries are never neutral. This motivates stakeholder analysis.
- **Content.**
  - Several systems of interest can be identified in one situation. The observer's purpose shapes which one is chosen (R02 p.264).
  - Churchman and other critical systems thinkers treat the relative power and responsibility of the participants as key factors in defining problem boundaries (R02 p.264).
  - MITRE's questions (R50 p.48): what is my enterprise? Which elements do I control? Which do I influence? Which influence me but are beyond my influence?
  - A boundary drawn too tightly hides the stakeholders who own your constraints. On AeroLink that is the utility and the vertiport operators.
- **Figure.** A three-ring "control / influence / influenced-by" diagram. AeroLink fleet and operations sit in "control". Vertiport operators and the utility sit in "influence". Weather, national policy and the ANSP's airspace rules sit in "influences us, beyond our influence".
- **Sources.** R02 p.264; R50 p.48.

**Transition B → C.** "We now know *what* system. Next, *when* in its life we do this work, and under which formal process."

### Section C: Life cycle and the 15288 process frame (9 min)

#### S1.15 The life cycle and its stages (3 min)
- **Purpose.** Locate needs identification in time.
- **Content.**
  - **Life cycle** (P9d p.1550, 15288:2015 via SEBoK): the evolution of a system, product, service, project or other human-made entity from conception through retirement.
  - **Stage**: a period relating to the state of description or realization (R06b p.384).
  - **Typical stages and their primary goals** (R06b p.384): Concept, whose goal is to identify stakeholders' needs, explore concepts and propose viable solutions; Development; Production; Utilization; Support; Retirement.
  - Movement between stages passes decision gates.
  - **Mapping to the stakeholder table** (R11 p.552, Table 1):
    - Production ↔ "production, integration, V&V";
    - Utilization ↔ "operation";
    - Support ↔ "logistics and maintenance";
    - Retirement ↔ "disposal".
  - **Teaching point.** A stakeholder register built only from the utilization stage misses most stakeholders.
- **Figure.** A horizontal six-stage arrow with diamond decision gates between stages. Above the Concept stage, a callout reads "identify stakeholders' needs". Below the arrow, a second row shows the R11 Table 1 stage names aligned to their R06b equivalents.
- **Sources.** R06b p.384; R11 p.552; **P9d p.1550 (register addition needed)**.

#### S1.16 Where Week 1 sits in ISO/IEC/IEEE 15288 (3 min)
- **Purpose.** Give students the formal process map and an honest view of the terminology.
- **Content.**
  - **The 15288:2015 technical processes**, as SEBoK lists them (P8 pp.1001–1002): Business or Mission Analysis; Stakeholder Needs and Requirements Definition; System Requirements Definition; Architecture Definition; Design Definition; System Analysis; Implementation; Integration; Verification; Transition; Validation; Operations; Maintenance; Disposal.
  - Week 1 = the first two. Week 2 starts the third.
  - **SEBoK's Concept Definition knowledge area** pairs BMA and Stakeholder Needs Definition. They answer *why* and *what* before *how* (P4 p.540) and are performed iteratively (R11 p.549).
  - **The same process carries three names in the sources:**
    - SEBoK article: "Stakeholder Needs Definition" (R11 p.549). SEBoK notes the process is frequently called "Stakeholder Needs and Requirements" (R11 p.551).
    - 15288:2015, as listed by SEBoK: "Stakeholder Needs and Requirements Definition" (P8 p.1001).
    - DoD: "Stakeholder Requirements Definition", one of eight technical processes (S12 p.141; R48 range, see §7).
  - The 2023 edition of the standard is not in the collection, so its exact naming is not verified here (source gap).
- **Figure.** A 14-cell process strip. The first two cells are highlighted "Week 1" and the third "Week 2". Above the first two, a bracket reads "SEBoK: Concept Definition". A side panel tabulates the three names and their sources.
- **Sources.** **P8 pp.1001–1002 and P4 p.540 (register additions needed)**; R11 pp.549, 551; S12 p.141 (R48, register correction).

#### S1.17 Business or Mission Analysis feeds Stakeholder Needs Definition (3 min)
- **Purpose.** Needs have an anchor: the problem or opportunity, and the mission.
- **Content.**
  - **BMA's purpose** (R10 p.543): understand the mission or market problem, threat or opportunity, and set goals, objectives and measures of success for a solution class.
  - **Its outputs** (R10 p.544) include:
    - the major stakeholders;
    - the problem, threat or opportunity statement;
    - the MGOs and measures;
    - preliminary life-cycle concepts and solution classes.
  - **Initial stakeholder identification**, including a ranking, happens in BMA and is expanded in Stakeholder Needs Definition (R10 p.545; R11 p.552).
  - **Business and user perspectives** can give different MGOs, which may conflict (R10 p.546). This foreshadows S2.12.
  - **AeroLink BMA output**, shown as context only:
    - MGO-001, the mission: "safe, quiet, on-demand air trips between the six vertiports … at waits passengers find predictable and at a cost that lets the network grow".
    - Goals MGO-002 (short, predictable waits), MGO-003 (be a good neighbor), MGO-004 (grow capacity with demand) and MGO-009 (every flight within approved limits).
    - Objectives with measures come in Week 2.
- **Figure.** A left-to-right flow. A "BMA" box (problem or opportunity, mission and goals, major stakeholders, preliminary life-cycle concepts) feeds a larger "Stakeholder Needs Definition" box (identify more stakeholders; elicit; drivers and constraints; risks; mature life-cycle concepts; baseline the integrated set of needs). A dashed feedback arrow returns to BMA, labeled "iterate". The AeroLink MGO-001 text sits in a callout under BMA.
- **Sources.** R10 pp.543–546; R11 pp.549–552. MGO-001..004 and MGO-009 from `reference/week03.ts` (FICTIONAL).

**Transition C → D.** "Fifteen-two-eighty-eight describes processes; people perform them. Before your team performs this one, it has to become a team."

### Section D: Teams in systems engineering (9 min)

#### S1.18 What makes a team, and what an IPT is (3 min)
- **Purpose.** Ground team formation in SE practice, not just in course logistics.
- **Content.**
  - **Team** (P9i p.1662): a group with complementary skills that operates interdependently, shares authority and responsibility for self-management, is accountable for collective performance and works toward a common goal.
  - **SE team** (P9i p.1662; P7 p.994): individuals who cooperatively perform SE tasks on a shared vision and common engineering objectives.
  - **Integrated Product Team** (S12 p.52): a multidisciplinary group collectively responsible for delivering a defined product or process. Smaller programs may run as a single IPT.
  - **IPTs in product SE** (P5 p.761): cross-functional, typically including representatives of all relevant stakeholders.
  - **Program level** (P6 pp.987–988): an SE and integration team (SEIT) oversees the IPTs. Analysis and integration teams (AITs) cover specialties across a level.
  - **Your team** is a single IPT for one enterprise.
- **Figure.** An organization sketch: a top "SEIT" box over three IPT boxes aligned to a system breakdown (aircraft, vertiport, operations). A horizontal "AIT (safety, reliability)" bar crosses all three. A callout reads "your team = one IPT".
- **Sources.** S12 p.52 (**P10, register addition needed**); **P5 p.761, P6 pp.987–988, P7 p.994, P9i p.1662 (register additions needed)**.

#### S1.19 Organizing your team: roles and communication (3 min)
- **Purpose.** Justify the course's four lead roles from the literature.
- **Content.**
  - **SEBoK** (P6 p.986): an SE team can be organized by job specialization (requirements engineering, architecture, integration, V&V, …) coordinated by a lead, or by subsystem. Roles, responsibilities and authority should be set per project.
  - **The course's four lead roles** (course convention; syllabus; FD-24): Requirements & Compliance, Architecture, AI & Data Management, Verification & Validation. In a three-person team, AI & Data Management merges with Architecture. This is the specialization pattern.
  - **Communication paths** (P6 p.988, after Brooks): N(N−1)/2. Four members give 6 paths; 10 members give 45, and a team above 10 should be organized hierarchically. This is why a team of 3–4 (the S01 syllabus range) can run flat.
  - **Collective competencies** depend on domain, stakeholders, scope and criticality. The last staffing step is to consult stakeholders and ask "What are we missing?" (P6 pp.988–989).
- **Figure.** Left: four role cards (each listing its Week 1 artifacts and owned ID prefixes: R&C owns STK, CON, NEED; Architecture owns ENT, PRT, EXT; AI & Data and V&V own prefixes added later). Right: two small complete graphs, K4 with 6 edges and K10 with 45 edges.
- **Sources.** **P6 pp.986, 988–989 (register addition needed)**. Course convention (roles, prefixes). S01 team size.

#### S1.20 The charter: norms, decision rules and how teams develop (3 min)
- **Purpose.** Make the charter a professional instrument.
- **Content.**
  - **"The team should have a charter"** (P6 p.986).
  - **Group structure** emerges in roles and norms. Norms are formal and informal rules that govern members' actions (P7 p.995).
  - **Tuckman's stages** (P6 p.989; P7 p.995): forming, storming, norming, performing, later adding adjourning. Groups may cycle through them.
  - **Cohesive-team indicators** (P6 p.990): clear roles and responsibilities; shared ownership of work products; willingness to help; good communication. Their negations are the hallmarks of a dysfunctional team.
  - **Charter contents** (course convention):
    - lead roles;
    - **decision rules**, for example "lead proposes; consensus within one working day; then majority; a tie goes to the instructor";
    - communication norms;
    - **owned ID prefixes**.
  - The collection prescribes no specific decision rule, so these are course choices.
  - Link to peer evaluation (S01: 10 %).
- **Figure.** A charter "form" mock-up with four labeled fields. Beside it, a Tuckman cycle drawn as a loop with a back-arrow from norming to storming.
- **Sources.** **P6 pp.986, 989–990; P7 p.995 (register additions needed)**. Course convention (decision rules, ID ownership). S01 assessment table.

**Transition D → E.** "Your team will identify stakeholders as its first engineering act. So: who counts as a stakeholder, and how do we find them all?"

### Section E: Identifying and classifying stakeholders (19 min as first planned; 24 min after the review)

#### S1.21 Four definitions of "stakeholder" (3 min)
- **Purpose.** Show how the definitions differ in scope and what follows from each.
- **Content.** The SEBoK glossary (R39a p.1631) records four definitions:
  1. **15288:2015**: an individual or organization "having a right, share, claim, or interest in a system or in its possession of characteristics that meet their needs and expectations".
  2. **ISO/IEC 2010 (draft 29148)**: the same, plus a list that includes trainers, maintainers, disposers and regulatory bodies.
  3. **ISO/IEC 26702:2007**: an individual, team or organization, *or classes thereof*, with interests in, or *concerns relative to*, a system.
  4. **Freeman (1984)**: any group or individual who can affect or is affected by the achievement of an organization's objectives.

  **Consequences:**
  - A stakeholder is a person, group or organization (or a class of them). Weather is context, not a stakeholder.
  - An *interest* or being *affected* is enough. Using, buying or building the system is not required.
  - Definition 3 introduces **concerns**, which are the subject of Session 2.
- **Figure.** A four-column comparison table. Rows: who can be a stakeholder; what qualifies them; scope (system versus organization's objectives). The key phrase in each column is highlighted.
- **Sources.** R39a p.1631.

#### S1.22 Why stakeholders come first, and who gets forgotten (2 min)
- **Purpose.** Establish the stakes: missing a stakeholder means failing validation.
- **Content.**
  - Stakeholders are "the primary source of needs and requirements". All relevant stakeholders must be included from the beginning. Leaving one out often results in missing needs and a failure to pass system validation (R11 p.552).
  - SEBoK's application of the 15288 processes to inclusive engineering asks BMA to identify both the obvious, beneficial stakeholders and those potentially affected, the "unwilling" stakeholders. It asks stakeholder needs work to capture *unstated but necessary* needs (access, language, disability) (P8 p.1001).
  - MITRE (R53 p.297), "Get all relevant views": needs driven by a subset of stakeholders miss key capability needs.
  - **AeroLink.** Communities near the vertiport (STK-004) are unwilling stakeholders. Passengers who use wheelchairs carry an unstated need (CON-013).
- **Figure.** A two-axis sketch. The horizontal axis runs "benefits ← → bears costs"; the vertical axis runs "consulted ← → not consulted". The lower-right quadrant, "bears costs, not consulted", is shaded and labeled "the stakeholders most often missed", with STK-004 placed in it.
- **Sources.** R11 p.552; R53 p.297; **P8 p.1001 (register addition needed)**.

#### S1.23 Method 1: the life-cycle sweep (3 min)
- **Purpose.** Teach the most thorough sourced method.
- **Content.**
  - **SEBoK's rationale.** There can be many stakeholders over the life cycle, so the life-cycle concepts are "a thorough source" for identification (R11 p.552).
  - **SEBoK's list of possible stakeholders** (R11 p.552): customers, sponsors, decision makers, regulators, developers, integrators, testers, users, operators, maintainers, support organizations, the public, and those involved in disposal.
  - **Table 1 by stage** (R11 p.552), with examples per stage. Notable entries: owners of enabling and external systems and approving authorities at concept; "unexpected users" in operation; waste management at disposal.
  - **AeroLink sweep:**
    - Concept: FAA (STK-002); city planning authority (STK-013); investors (STK-003).
    - Development and production: aircraft manufacturer (STK-011).
    - Operation: passengers (STK-001); pilots and remote operators (STK-008); vertiport operators (STK-005); ANSP (STK-007); electric utility (STK-010).
    - Logistics and maintenance: maintenance technicians (STK-009).
    - Disposal: battery recycler. This candidate is **not** in the reference register; it is a deliberate prompt for discussion.
- **Figure.** A six-column swimlane (the stages from S1.15). Each column holds AeroLink stakeholder chips with STK IDs. The disposal column holds one dashed "candidate" chip.
- **Sources.** R11 p.552 (Table 1). STK IDs from `airtaxi.ts`. The disposal candidate is instructor discussion only.

#### S1.24 Method 2: from the context. Method 3: role classes (3 min)
- **Purpose.** Two further methods that catch what the sweep misses.
- **Content.**
  - **Method 2, context-based** (instructor method, built on R02 p.264 and R11 p.552). Every external system that is run by an organization has a stakeholder behind it:
    - EXT-001 → STK-007 ANSP;
    - EXT-002 grid → STK-010 utility;
    - EXT-004 → STK-011 OEM;
    - EXT-006 → STK-006 emergency responders;
    - EXT-003 weather → none, because it is a natural system;
    - EXT-005 public transport → its operator, who is *not* in the reference register. Should it be? A discussion point.
  - **Method 3, role classes.**
    - MITRE's key groups (R63 p.235): decision makers; sponsors and agents of the change; those directly affected; the "customers" of the change agents.
    - MITRE's stakeholder roles (P11 p.322): executive sponsor; primary stakeholders who provide requirements; indirectly affected stakeholders; SMEs; those to be kept in the loop.
    - The DoD list (S12 pp.51–52) includes end users, certification and accreditation authorities, maintainers and logisticians, and enabling systems in the SoS.
  - **Snowballing** (R63 p.235): start from the sponsor's list, ask interviewees for more names, and seek out supporters, skeptics and rivals.
- **Figure.** Left half: the S1.13 context ring, with each EXT node sprouting an arrow to its STK chip; the weather node has a struck-through arrow. Right half: a checklist "role-class sieve" with MITRE's five roles as rows and AeroLink examples in each row.
- **Sources.** R63 p.235; R02 p.264; R11 p.552; **P11 p.322 and P10 (S12) pp.51–52 (register additions needed)**.

#### S1.25 Approving authorities (2 min)
- **Purpose.** The non-obvious stakeholder class that can stop the system.
- **Content.**
  - Determining who the approving authorities are is "a key part" of identification. They formally certify, qualify and approve the system for use in its operational environment.
  - The customer cannot be assumed to be the only one. There may be approving authorities inside and outside the organization, especially for highly regulated systems (R11 p.553).
  - **AeroLink:**
    - The FAA approves the aircraft and the operation (STK-002, yes).
    - The city planning authority approves vertiport sites (STK-013, yes).
    - The ANSP controls airspace access but does not certify the system: it is a constraint holder. This classification is **(proposed, instructor to confirm)** and makes a good debate.
- **Figure.** A "gate" graphic: the system passes through three gates on its way to "operational use". The FAA and city planning gates are solid. The ANSP gate is dashed and labeled "access, not approval?".
- **Sources.** R11 p.553. Classification of STK-002 and STK-013 from `stakeholders.ts` (`CLASSIFY`, k13).

#### S1.26 Classifying stakeholders: what the register records (3 min)
- **Purpose.** Turn a list into an analytic instrument.
- **Content.**
  - **The stakeholder register** holds key information about each stakeholder and how they are involved with the system of interest. Re-evaluate it periodically (R11 p.553). BMA adds a *ranking* (R10 p.545).
  - **Course register fields:**
    - role group, in six course groups (course convention): user or operator; customer, acquirer or funder; approving or regulatory authority; supplier or owner of an enabling or external system; maintainer or support; affected public;
    - life-cycle stage;
    - internal or external;
    - approving authority (yes or no);
    - concerns;
    - interest 1–5 and influence 1–5, each with a reason.
  - **MITRE's stakeholder management** (R63 p.234) identifies the interests each group represents, the power it holds, and whether it supports or inhibits the change.
  - **MITRE's maps** (R63 pp.236–237) plot influence over the change against level of support. "High influencers must be committed advocates."
  - **The influence × interest grid** is a **course convention**: the classic power/interest grid is not in the collection.
- **Figure.** A scatter plot of all 14 AeroLink stakeholders, with interest (1–5) on the x-axis and influence (1–5) on the y-axis. Values come from `INSTRUCTOR_EXAMPLE`: STK-001 (5,3), 002 (4,5), 003 (4,5), 004 (4,4), 005 (5,4), 006 (3,3), 007 (4,5), 008 (5,3), 009 (4,2), 010 (3,4), 011 (4,4), 012 (3,4), 013 (3,5), 014 (3,2). Dashed lines at 3.5 divide the quadrants (course convention). An inset sketches MITRE's influence × support idea, with an arrow "move high-influence stakeholders toward commitment".
- **Sources.** R11 p.553; R10 p.545; R63 pp.234, 236–237. Course convention (grid, role groups). Values from airtaxi.ts (FICTIONAL).

#### S1.27 Answering the driving question (3 min)
- **Purpose.** Close the loop opened in S1.2. Consolidate the three methods.
- **Content.**
  - The three methods together yield 14 stakeholders, against the original 3.
  - The original list missed both approving authorities (FAA, city planning), the affected public (communities, accessibility advocates), the operators and maintainers, the owners of enabling systems (vertiport operators, utility), the ANSP, emergency responders and insurers.
  - Answer (C): "add other kinds of party".
  - **Which method found which:**
    - only the life-cycle sweep found the maintenance technicians;
    - only the context found the utility behind the grid;
    - only "who is affected or could stop us" found the communities.
  - Agreement across methods raises confidence. A stakeholder found by only one method is the likeliest to be missed.
- **Figure.** A three-set Venn diagram (life-cycle sweep, context, role classes plus affected or blocking) with the 14 STK chips placed in their regions. The original three are circled in red.
- **Sources.** R11 p.552 (consequence of omission); instructor synthesis of S1.23–25. Reuses the existing figure `stakeholder-sources` text equivalent.

#### S1.28 Exit: retrieval, roster, preparation (3 min)
- **Purpose.** Retrieval practice, then hand-off to Session 2.
- **Content.**
  - One-minute paper: "Name one stakeholder of your *own* candidate enterprise that only the life-cycle sweep would find."
  - Team roster announced. Formation is instructor-assigned or self-selected: **faculty decision**.
  - Teams sit together in Session 2.
  - **Before Session 2** (about 20 min per student; budgeted in §4.7):
    - each member brings one candidate enterprise: name, one-line purpose, a first guess at the system of interest;
    - read R11 pp.549–555.
- **Figure.** None (a text slide with a QR link to the LMS form).
- **Sources.** Course convention.

**Session 1 running total**

| Section | Slides | Minutes | Cumulative |
|---|---|---|---|
| A Course framing and AeroLink | S1.1–S1.5 | 11 | 11 |
| B System concepts | S1.6–S1.14 | 24 | 35 |
| C Life cycle and 15288 | S1.15–S1.17 | 9 | 44 |
| D Teams | S1.18–S1.20 | 9 | 53 |
| E Stakeholders | S1.21–S1.27 | 19 | 72 |
| Exit | S1.28 | 3 | **75** |

## 3. Session 2: Concerns, needs, the worked example and the lab launch (75 min)

### Session 2 split decision: about 47 min lecture and about 28 min lab launch

**Decision.** Slides S2.1–S2.17 are lecture (47 min). Slides S2.18–S2.21 are the laboratory launch (28 min).

**Justification.**
1. **Needs content is the intellectual core of the week and cannot be deferred.** It covers concerns, needs versus requirements, the integrated set and the transformation, needs characteristics, elicitation, conflict and priority, and the full worked example. A20 requires that it be *taught* before it is assigned. Session 1 is already full with the conceptual frame, so the needs lecture must sit in Session 2. Self-study of L6–L7, the old design, is the shallow option A20 rejects.
2. **Some lab work is only possible in the room.**
   - The instructor's *enterprise approval* checkpoint gates every later week, and it needs a face-to-face pitch and an immediate decision.
   - The charter negotiation benefits from instructor presence: role disputes and decision-rule ties are settled on the spot.
   - Neither needs more than about 25 minutes if teams arrive with candidate enterprises (S1.28 pre-work).
3. **Why not the old 75-minute lab?** The old Session 2 spent 30 minutes on the context and register in class. Those tasks are better done after the needs lecture and out of class, guided by the worked example. A whole-session lab would leave needs untaught.
4. **Why not 75 minutes of lecture with the lab entirely outside class?** The approval checkpoint would slip by a week, and teams would start their Team Record without an approved enterprise. The record is due before Week 2 Session 1.
5. **Cognitive load.** About 47 minutes of dense lecture followed by active team work matches a well-established pacing practice. I state it here as course reasoning, not as a cited claim; no source in the collection covers lecture pacing.

### Section F: Concerns and the register (10 min)

#### S2.1 Retrieval warm-up: who did we miss? (3 min)
- **Purpose.** Spaced retrieval of Session 1. Surface misconceptions.
- **Content.**
  - Three rapid questions, answered on cards:
    - (1) Is the electric grid a stakeholder?
    - (2) Name an approving authority for AeroLink other than the FAA.
    - (3) Which life-cycle stage would find the maintenance technicians?
  - Then a one-sentence recap of the three methods.
- **Figure.** The S1.27 Venn diagram, shown small, with three blanks.
- **Sources.** R39a p.1631; R11 pp.552–553.

#### S2.2 Concerns: what a stakeholder cares about relative to the system (3 min)
- **Purpose.** Define concern carefully and admit the source gap.
- **Content.**
  - **The ISO/IEC 26702 definition of stakeholder** speaks of "concerns relative to a system" but does not define *concern* (R39a p.1631 (3)).
  - **SEBoK's View principle**: understanding a complex system needs multiple views, "each based on a system aspect or concern" (R04 p.275). The glossary defines a viewpoint as addressing a set of stakeholder concerns (glossary p.1678; not proposed for Week 1).
  - **SysML v2**, which students meet in Week 8 (Phase II reading): "A concern is a specific topic that one or more stakeholders desire to be addressed" (R77 p.115).
  - **The course's working rule** (course convention, consistent with R77 p.115): write each concern so someone else could check it. Say *what*, *for whom*, and *where or when* it bites.
  - **Generic versus specific:**
    - "Communities: noise" is generic. It is RB-1.3 level 2.
    - CON-012, "Residents near vertiports are concerned about take-off and landing noise, how often it occurs and at what hours", is specific.
  - A concern is **not yet a need**. It states the worry, not what the stakeholder needs the system to do.
  - The ISO/IEC/IEEE 42010 definition of concern is not in the collection (source gap).
- **Figure.** A "specificity ladder" of three rungs for the same stakeholder: "noise" → "noise near homes" → CON-012 in full. Each rung is annotated with what a reviewer could check.
- **Sources.** R39a p.1631; R04 p.275; R77 p.115 (Phase II). Course convention (specificity rule; RB-1.3).

#### S2.3 The AeroLink stakeholder register and its relationships (4 min)
- **Purpose.** Show the complete instrument: the worked example, part 1.
- **Content.** The full 14-row register (table below), read across, followed by the relationships.
  - **Relationships** (REL-001..008): regulates, funds, supplies, coordinates-with, affected-by, partners-with, and **conflicts-with**. REL-002: communities (STK-004) ↔ vertiport operators (STK-005), "noise and siting vs throughput".
  - **Teaching points:**
    - every rating carries a reason, so a reviewer can challenge it (RB-1.3);
    - the register is re-evaluated periodically (R11 p.553);
    - relationships expose dependencies that a flat list hides (RB-1.4; S03 Deliverable 1; S04 Lab 2B).
- **Figure.** (a) The register table. (b) A stakeholder relationship graph with 14 nodes colored by role group and 8 labeled edges. REL-002 is drawn as a red double-headed edge labeled "conflicts with".
- **Sources.** R11 p.553. RB-1.3, RB-1.4. S03 Deliverable 1 and S04 Lab 2B (internal course documents). Data from airtaxi.ts and reference/week02.ts (FICTIONAL).

**AeroLink reference stakeholder register (worked example).** Six rows (STK-002, 004, 005, 008, 009, 010) use the instructor key in `stakeholders.ts`. **The other eight classifications are (proposed, instructor to confirm).** Interest and influence values and reasons are from `INSTRUCTOR_EXAMPLE`.

| ID | Stakeholder | Role group | Stage | Int./Ext. | Approving | Concern(s) | Interest | Influence | Reason for influence |
|---|---|---|---|---|---|---|---|---|---|
| STK-001 | Passengers | User or operator *(proposed)* | Operation | External | No | CON-001 predictable wait; CON-002 safety in flight; CON-003 affordable fare | 5 | 3 | Revenue depends on them; individually little leverage |
| STK-002 | FAA | Approving or regulatory authority | Concept | External | **Yes** | CON-004 airworthiness and operational safety | 4 | 5 | Without approval no revenue operation |
| STK-003 | Investors | Customer, acquirer or funder *(proposed)* | Concept | External | No | CON-005 return on capital and path to scale | 4 | 5 | Control funding for fleet and vertiports |
| STK-004 | Communities near vertiports | Affected public | Operation | External | No | CON-012 community noise | 4 | 4 | Can block siting through planning |
| STK-005 | Vertiport operators | Supplier or owner of an enabling system | Operation | External | No | CON-006 pad throughput and charging capacity | 5 | 4 | Own a scarce capacity constraint |
| STK-006 | Emergency responders | Owner of an external system *(proposed)* | Operation | External | No | CON-007 battery-fire response | 3 | 3 | Can impose operating conditions |
| STK-007 | Air navigation service provider | Approving or regulatory authority *(proposed)* | Operation | External | No *(proposed; debated, S1.25)* | CON-008 airspace integration | 4 | 5 | Controls airspace access |
| STK-008 | Pilots / remote operators | User or operator | Operation | Internal | No | CON-009 workload and automation trust | 5 | 3 | Workforce availability limits scaling |
| STK-009 | Maintenance technicians | Maintainer or support | Logistics and maintenance | Internal | No | CON-010 turnaround pressure | 4 | 2 | Turnaround drives availability |
| STK-010 | Electric utility | Supplier or owner of an enabling system | Operation | External | No | CON-011 peak grid load | 3 | 4 | Grid capacity can cap charging |
| STK-011 | Aircraft manufacturer (OEM) | Supplier *(proposed)* | Development / production | External | No | CON-015 fleet delivery and certification progress | 4 | 4 | Sole source; delivery delays shape growth |
| STK-012 | Insurers | Customer, acquirer or funder *(proposed)* | Operation | External | No | CON-014 quantifiable operational risk | 3 | 4 | Premiums and coverage constrain operations |
| STK-013 | City planning authority | Approving or regulatory authority *(proposed)* | Concept | External | **Yes** (site) | CON-016 land use and zoning of sites | 3 | 5 | Grants or blocks vertiport sites |
| STK-014 | Accessibility advocates | Affected public *(proposed)* | Operation | External | No | CON-013 step-free boarding | 3 | 2 | Shape acceptance and compliance expectations |

**Transition F → G.** "A concern is a worry. A need is what the stakeholder needs the system to do about it. And a need is still not a requirement."

### Section G: Needs at graduate depth (24 min)

#### S2.4 Needs versus requirements: two perspectives, two views (3 min)
- **Purpose.** The central distinction of the week.
- **Content.**
  - **Stakeholder needs** represent the perspective of users, acquirers, customers and other stakeholders. They are transformed into **system requirements**, which communicate the *developer's* perspective (R11 p.549).
  - **Needs are the external, black-box view; requirements are the internal, white-box view** (R13 p.558). SEBoK's coffee-maker pair (paraphrased): the user needs the maker to stop heating once the selected temperature is reached; the maker *shall* stop the heating function once the selected brew temperature is reached.
  - **15288:2023 via SEBoK**: stakeholder needs include elicited needs, wants, desires, expectations and perceived constraints. They concentrate on purpose and behavior in the operational environment (R39a p.1632 (1a)).
  - **System requirement** (R39b p.1652): transforms the stakeholder, user-oriented view into a technical view of a solution.
  - **Stakeholder requirements** are transformed from needs into more formal statements (R39a p.1632 (1b), 29148). SEBoK notes that 15288 has no formal definition of the term (R39a p.1632, discussion).
- **Figure.** A two-column "mirror" layout. Left: the stakeholder's view (black box, outside looking in), with the need. Right: the developer's view (white box, inside), with the requirement. A center arrow is labeled "transformation (analysis)". AeroLink appears below the coffee example: NEED-003 on the left and "Week 2: requirements, to be written" on the right.
- **Sources.** R11 p.549; R13 p.558; R39a p.1632; R39b p.1652.

#### S2.5 From individual needs to the integrated set of needs (3 min)
- **Purpose.** Show that "needs" is an engineered *set*, not a wish list.
- **Content.**
  - **The integrated set** combines stakeholder needs with the results of analyzing risks, drivers, constraints and life-cycle concepts (R11 pp.549–550).
  - **The process activities** (R11 p.552):
    - identify more stakeholders across the life cycle;
    - elicit, consolidate and prioritize;
    - identify drivers and constraints;
    - identify risks;
    - mature life-cycle concepts;
    - baseline and manage the set.
  - **Drivers and constraints** lie outside the project's control: standards, regulations, operating environment, existing systems, technology maturity, cost, schedule (R11 p.554).
  - **Risks**: failing to address them leaves the set incomplete and the system failing validation (R11 p.554).
  - **The set must be correct, consistent, complete and feasible.** It defines the project scope, and the requirements, design and realized system are validated against it (R11 p.551).
  - **Across the set**, needs state expected functionality, expected performance and quality ("how well"), conditions of action, and compliance (R11 p.554).
- **Figure.** A funnel. Four input streams (stakeholder needs, drivers and constraints, risks, life-cycle concepts) feed a box labeled "integrated set of needs", annotated with its four set properties. Two outgoing arrows: "transformed into → requirements (Week 2)" and "validates ← system". This is an original drawing; it does not reproduce the Wheatcraft figure on R11 p.549.
- **Sources.** R11 pp.549–552, 554.

#### S2.6 The transformation is analysis, not rewording (3 min)
- **Purpose.** Pre-empt the most damaging misconception: "requirement = need + shall".
- **Content.**
  - Generating a requirement is "more than changing the subject of the need statement". It is an analysis of what the system must do (R13 p.558).
  - **The analysis tools named** (R13 p.558): functional analysis, interface analysis, data-flow diagrams, performance analysis, and a needs-to-requirements transformation matrix.
  - **One need can yield several requirements**, with measurable performance criteria (R13 p.559).
  - **Every requirement is an engineering decision** (R13 p.557). A requirement statement is a formal transformation of needs into an agreed obligation (R13 p.558, quoting INCOSE NRM; NRM itself is not in the collection).
  - **Requirements must suit the level** of the system of interest in the architecture, saying *what* and not *how* (R13 p.558).
  - **AeroLink preview** (not solved today): NEED-010, "the utility needs the power drawn by each vertiport to stay within the agreed connection capacity at all times", may lead in Week 2 to requirements on charging power control, the charger schedule, monitoring and alarms. That is several requirements, each a design decision.
- **Figure.** A one-to-many tree. The NEED-010 node at the left fans out to four blank "REQ-? (Week 2)" leaves labeled power limit, scheduling, monitoring, alarm. A note at the fan-out point reads "functional / interface / performance analysis".
- **Sources.** R13 pp.557–559. NEED-010 from reference/week03.ts.

#### S2.7 Why it matters: validation, scope and cost (2 min)
- **Purpose.** Motivate rigor with consequences.
- **Content.**
  - **The integrated set is the validation reference** for requirements, design and the realized system (R11 pp.551, 555).
  - **Requirement verification** asks whether the requirements are well formed. **Requirement validation** asks whether we have the right requirements, faithful to the needs they came from (R13 p.566). Without kept needs, the second question cannot be asked.
  - **DoD:** an inadequate stakeholder-requirements effort risks requirements creep, rework from misunderstood end-user needs, contract modifications, cost growth and schedule slip (S12 p.141).
- **Figure.** A V-shaped sketch. The left arm descends from "needs" to "requirements" to "design"; the right arm rises from "realized system" to "validation against needs". A dashed horizontal line links "needs" to "validation", labeled "the needs must survive to here".
- **Sources.** R11 pp.551, 555; R13 p.566; S12 p.141 (R48, register correction).

#### S2.8 Characteristics of well-formed needs (4 min)
- **Purpose.** Replace the course-only "six criteria" with a sourced, layered set.
- **Content.** Three layers.
  - **Statement form** (SEBoK, R11 p.555):
    - structured natural language, from the stakeholder's perspective;
    - no "shall" or other requirement wording;
    - a distinct format, such as "The stakeholders need the system to …";
    - recorded with ID, name, statement, rationale and source (Table 2).
  - **Content attributes of a need** (MITRE, R53 pp.295–296):
    1. enterprise and operational context;
    2. complete, end-to-end need. MITRE's example contrasts detect-identify-defeat with detect only;
    3. conditions or scenario under which the need exists;
    4. attributes and metrics: how much, how well, how often, how quickly, tied to mission goals;
    5. growth and extensibility;
    6. independence of solution approach.

    MITRE's lessons add "state needs unambiguously" and "beware solutions masquerading as needs" (R53 pp.296–297).
  - **Set properties** (R11 p.551): correct, consistent, complete, feasible.
  - **Requirement-level characteristics, for contrast:** necessity, implementation-free, unambiguous, consistent, complete, singular, feasible, traceable, verifiable (R23a p.635). DoD lists similar attributes for requirements (S12 p.144). These apply to the Week 2 requirements; several of them, such as singular, traceable and implementation-free, are also good discipline for needs.
  - **The course check** keeps the old six criteria as a *minimum gate*: need wording; no design; attributed; traced; condition; rationale. Students are taught the full sourced set above.
  - **Source gap:** INCOSE's characteristics in GtWR and NRM are cited by SEBoK but not in the collection.
- **Figure.** A three-layer stack. The bottom layer, "statement form (SEBoK)", has 4 chips. The middle layer, "content attributes (MITRE)", has 6 chips. The top layer, "set properties (SEBoK)", has 4 chips. A side bar labeled "course minimum gate" brackets six of the chips across the layers.
- **Sources.** R11 pp.551, 555; R53 pp.295–297; R23a p.635; S12 p.144 (R48b, register correction).

#### S2.9 Anatomy of a need, and the level-of-abstraction problem (2 min)
- **Purpose.** Practice reading a need, and handle the hard case.
- **Content.**
  - **Anatomy of NEED-003**: "Communities near vertiports need take-off and landing noise kept within the limit agreed with the city, at every pad, at all operating hours."
    - The who, the verb "need", the what (no design), and the condition.
    - Attached: the ID, source STK-004 and CON-012, and the rationale (an exceedance puts the operating permit at risk).
  - **The hard case.** SEBoK's own example needs include feature-level statements: two temperature settings, four colors (R11 p.555, Table 2). Whether a statement is solution-laden depends on the *level* of the system of interest (R13 p.558) and on genuine constraints.
  - **The course rule:** a design term may stay only if the team justifies it as a constraint, for example a city-mandated noise metric.
- **Figure.** NEED-003 with bracketed parts (reused from the existing `need-anatomy` figure). Beside it, a two-level sketch: at the *service* level, "noise within the agreed limit" is a need; at the *rotor-blade* level, a specific blade-tip speed might be a legitimate derived constraint.
- **Sources.** R11 p.555; R13 p.558. NEED-003 from reference/week03.ts.

#### S2.10 Elicitation techniques and when to use each (3 min)
- **Purpose.** Elicitation as a method choice, not a list.
- **Content.**
  - **SEBoK** recommends several techniques to suit diverse sources (R11 p.553): structured brainstorming workshops; interviews and questionnaires; workshops or focus groups; visual and descriptive content about the system of interest; documentation review; feedback from verification and validation.
  - **MITRE** (P11 p.324): direct observation; one-on-one and group interviews; brainstorming; focus groups; surveys and targeted questions; prototyping. Joint user–developer sessions are "frequently one of the most powerful". The choice depends on project size, type, complexity, schedule, number of interviewees and locations.
  - **Interview practice** (R63 pp.235–236): open-ended plus Likert-scaled questions; follow-up questions that ask for specific examples; detailed notes analyzed for themes.
  - **User surrogates** when end users are inaccessible (R53 p.296).
  - **AeroLink choice table** (instructor reasoning):
    - communities → public workshop plus a questionnaire;
    - FAA → documentation review plus a structured meeting;
    - maintenance technicians → direct observation of a turnaround;
    - passengers → survey plus a booking prototype;
    - utility → interview plus review of the connection agreement.
- **Figure.** A matrix of techniques (rows) against selection factors (columns: reach, depth, cost, suits tacit knowledge, suits contested topics), with filled or empty dots. **The dot ratings are instructor judgment (course convention)**, not taken from a source. Below it, the five-row AeroLink choice table.
- **Sources.** R11 p.553; R63 pp.235–236; R53 p.296; **P11 p.324 (register addition needed)**.

#### S2.11 What to ask, and how to find the real need (2 min)
- **Purpose.** The content of elicitation, and the "why" ladder.
- **Content.**
  - **SEBoK's topic list** (R11 p.553):
    - feedback on the BMA outputs;
    - the stakeholder's life-cycle stages and role;
    - nominal and off-nominal use cases, misuse cases and loss scenarios;
    - capabilities and functions;
    - interactions with external systems;
    - quality and "-ilities";
    - risks and hazards;
    - the rationale ("why");
    - criticality and priority.
  - **"Providing rationale often reveals the real need**, especially when the stakeholder expresses a need as an implementation" (R11 p.553).
  - **MITRE**: determine the root cause and separate real from perceived needs. State the problem in an implementation-independent manner (P11 p.322). Solutions masquerade as needs because of marketing, familiarity or unstated political or economic motives (R53 p.296).
  - **AeroLink**: residents ask for sound barriers → why? → night noise disturbs sleep → the need is NEED-003 (noise within the agreed limit at all operating hours). The barrier is one possible mitigation.
- **Figure.** A "why ladder": three rungs rising from the stated solution (barriers) through the effect (sleep disturbed at night) to the need (NEED-003). At the top, a branch to "possible solutions (Week 3+)": barriers, flight paths, operating hours.
- **Sources.** R11 p.553; R53 p.296; **P11 p.322 (register addition needed)**.

#### S2.12 Conflicting needs and prioritization (3 min)
- **Purpose.** What to do when needs pull apart.
- **Content.**
  - **Conflicts are normal.** Business and user MGOs can conflict (price, profitability, market share) and must be prioritized against the enterprise strategy (R10 p.546).
  - **Record, do not delete.** The set must be consistent (R11 p.551), but a conflict is recorded and resolved by trade and agreement. Deleting one side silently drops a stakeholder (instructor synthesis; reused misconception).
  - **Priority is elicited.** Ask for criticality and relative priority. Some needs are "nice-to-haves" that stakeholders can live without under budget or schedule pressure (R11 p.553).
  - **Priority categories and adjudication** (P11 p.325): define each priority category (mandatory, critical, desirable, optional); point out inappropriate priorities; prioritization ends when stakeholders agree. Put a **stakeholder contention adjudication protocol** in place early. Escalate unresolved conflicts to the customer or sponsor.
  - **DoD**: negotiate modifications with stakeholders to resolve discrepancies (S12 p.142).
  - **AeroLink conflict**: NEED-001 (short, predictable waits; more departures) versus NEED-003 (noise within the limit; fewer or quieter departures), mirrored by REL-002. Both stay in the set. The conflict is resolved later by trade study (Week 3) and agreement with the city.
  - **Course convention**: every team records at least one conflict and the protocol it will use (for example, the sponsor role decides after a trade study).
- **Figure.** A tension diagram. NEED-001 and NEED-003 sit at opposite ends of a bar, with "departure rate" as the shared variable. A balance pivot is labeled "resolved by trade + agreement (Week 3)". Beside it, a four-step protocol flow: record → analyze → negotiate → escalate.
- **Sources.** R10 p.546; R11 pp.551, 553; S12 p.142; **P11 p.325 (register addition needed)**. NEED-001, NEED-003 and REL-002 from the reference data.

#### S2.13 Common errors in stakeholder and needs work (2 min)
- **Purpose.** Consolidate by contrast.
- **Content.** Each error is paired with its source-based correction.
  1. "Stakeholders are customers and users": approving authorities, maintainers, the public and disposers are missed (R11 pp.552–553).
  2. "Everything in the context diagram is a stakeholder": systems are not stakeholders; their owners may be (R39a p.1631).
  3. "A need is a requirement written informally" (R11 pp.549, 555; R13 p.558).
  4. A solution masquerading as a need (R53 p.296).
  5. A need with no condition or scenario (R53 p.296; R11 p.554).
  6. A need driven by a subset of stakeholders (R53 p.297).
  7. Deleting the weaker of two conflicting needs (R11 p.551).
  8. A generic concern ("wants safety") (RB-1.3; course).
  9. A rating without a reason (RB-1.3; course).
  10. No approving authority in the register (R11 p.553).
- **Figure.** A two-column "error → correction" table with a small icon per row.
- **Sources.** As listed. Reuses `instructorNotes.misconceptions`.

**Transition G → H.** "Now the whole method, once, end to end, on AeroLink."

### Section H: The AeroLink worked example (8 min)

#### S2.14 Worked example I: from concern to need, step by step (2 min)
- **Purpose.** A model of the procedure students will follow.
- **Content.** The six-step method (instructor-authored, built on R11 pp.553–555 and R53 p.296), shown on STK-010 and CON-011:
  1. Start from the concern (CON-011, peak grid load).
  2. Ask why until the answer is an outcome: exceeding the agreed connection trips protection or incurs penalty tariffs.
  3. Remove the design and requirement wording. The draft was "There is a need for a smart grid controller that must cap charging".
  4. Attribute the need: "The electric utility needs …".
  5. State the condition: "at all times, including when several arriving aircraft charge together".
  6. Record the rationale and the trace.

  The result is **NEED-010**.
- **Figure.** A six-step vertical flow. The draft is struck through at step 3, and the final NEED-010 is shown with its tags.
- **Sources.** R11 pp.553–555; R53 p.296. NEED-010 from reference/week03.ts.

#### S2.15 Worked example II: the AeroLink reference needs (4 min)
- **Purpose.** At least 10 well-formed needs with rationale, as the standard the teams must meet.
- **Content.** The 11 reference needs in the table below. Statements, conditions and rationales are from `reference/week03.ts`.
  - **Priority** is not stored in the reference data. The priorities shown use MITRE's categories (P11 p.325) and are **(proposed, instructor to confirm)**.
  - **Two trace notes for the instructor:**
    - **NEED-008.** Its subject (passengers who use wheelchairs) is a sub-class of STK-001, represented by STK-014. List both as sources (critical review A2).
    - **NEED-002.** It also answers CON-002, a passenger concern (review A3).
- **Figure.** The table itself, typeset as a slide-width register. Each row has a small colored tag for its source stakeholder's role group.
- **Sources.** Needs from reference/week03.ts (FICTIONAL). Form per R11 p.555; attributes per R53 pp.295–296.

| ID | Name | Need statement | Source (STK, CON) | Condition | Rationale | Priority *(proposed)* |
|---|---|---|---|---|---|---|
| NEED-001 | Short, predictable wait to board | Passengers need to board within a short and predictable time after confirming a ride, throughout operating hours. | STK-001; CON-001 | Throughout the 16 h operating day, including peak hours | The wait and its predictability decide whether passengers use the service again | Critical |
| NEED-002 | Assurance of flight within safety limits | The FAA needs assurance that every flight is conducted within the approved airworthiness, energy and weather limits, including when weather changes during the day. | STK-002; CON-004, CON-002 | For every flight, including when weather changes during the day | The regulator must be assured that the operation, not only the aircraft, stays inside the approved envelope | Mandatory |
| NEED-003 | Noise kept within the local agreement | Communities near vertiports need take-off and landing noise kept within the limit agreed with the city, at every pad, at all operating hours. | STK-004; CON-012 | At every pad, at all operating hours | An exceedance puts the operating permit at risk and erodes acceptance | Mandatory |
| NEED-004 | Pads not limited by turnaround | Vertiport operators need arriving aircraft to be ready to depart again quickly enough that pad turnaround does not become the throughput limit. | STK-005; CON-006 | At peak hours, at every hub vertiport | Pad occupancy time sets how many departures a pad supports | Critical |
| NEED-005 | Capacity that grows with demand | Investors need service capacity to grow in step with demand so that capital is neither short when demand arrives nor idle when it does not. | STK-003; CON-005 | Throughout the first three years of service | Idle assets, or turned-away demand, erode the expected return | Desirable |
| NEED-006 | Early warning and access for a vertiport fire | Emergency responders need early warning of, and safe access to, a battery fire at a vertiport. | STK-006; CON-007 | At any hour of operation, at every vertiport | Lithium battery fires escalate within minutes and need a safe approach | Mandatory |
| NEED-007 | Known aircraft condition before release | Maintenance technicians need the condition of each aircraft to be known before it is released for a flight, regardless of schedule pressure. | STK-009; CON-010 | At every release, regardless of schedule pressure | Releasing an aircraft of unknown condition is the failure technicians most want to prevent | Mandatory |
| NEED-008 | Unassisted step-free travel | Passengers who use wheelchairs need to board, travel and alight without being lifted or separated from their mobility aid. | STK-014 (for a sub-class of STK-001); CON-013 | At every vertiport, throughout operating hours | Being lifted is unsafe and undignified and excludes passengers who travel with their own aid | Critical |
| NEED-009 | Flight intent known to the ANSP | The air navigation service provider needs each flight's intended route and time known before the aircraft enters controlled airspace. | STK-007; CON-008 | Whenever a flight will enter controlled airspace | The ANSP can separate air-taxi flights from other traffic only if it knows them in advance | Mandatory |
| NEED-010 | Charging load within the grid connection | The electric utility needs the power drawn by each vertiport to stay within the agreed connection capacity at all times. | STK-010; CON-011 | At all times, including when several arriving aircraft charge together | Exceeding the agreed connection trips protection or incurs penalty tariffs | Mandatory |
| NEED-011 | Prompt notice and a way onward when a trip is disrupted | Passengers need prompt notice whenever their trip is held, diverted or cancelled, and a usable alternative way to complete their journey. | STK-001; CON-001 | Whenever a confirmed trip is held, diverted or cancelled, including weather holds | A passenger left without news or a way onward loses more time and trust than one told early | Desirable |

#### S2.16 Worked example III: auditing the set for coverage and conflict (2 min)
- **Purpose.** Evaluate a set (B1.7), and show that the reference itself has gaps.
- **Content.**
  - **Coverage matrix, stakeholders × needs.** Ten of the 14 stakeholders have at least one need. **STK-008, STK-011, STK-012 and STK-013 have none.**
  - **STK-013 is an approving authority.** By the lecture's own rule (R11 p.553) that is a defect.
  - **Not every concern becomes a need on the system of interest.** CON-015 (the OEM's delivery and certification progress) is an enterprise or agreement matter, not something the air-taxi service must do. The register should record that decision.
  - **Draft gap-filling needs** (lecture illustrations, **unnumbered; not part of the reference set**). Adding them to the reference is a faculty decision, because it changes the later-week counts protected by DECISION_LOG W9.
    - D1 (STK-013, CON-016): "The city planning authority needs each vertiport site to conform to the zoning and land-use plan and to connect with public transport, from site approval through operation."
    - D2 (STK-008, CON-009): "Pilots and remote operators need their workload to remain manageable throughout every shift, including during weather disruptions."
    - D3 (STK-012, CON-014): "Insurers need the operational risk of the service to be measurable from evidence gathered on every flight, from the first day of service."
  - **Conflict check.** NEED-001 versus NEED-003 (S2.12). NEED-005 versus NEED-010 may also tension: capacity growth against the grid connection.
- **Figure.** A 14 × 11 matrix with a filled cell where a need traces to a stakeholder. Four empty rows are highlighted red; the STK-013 row is flagged "approving authority". Three dashed cells show D1–D3.
- **Sources.** R11 pp.551, 553. Reference data. D1–D3 are instructor illustrations (course convention).

### Section I: Bridge (2 min)

#### S2.17 Where this goes: Week 2 and Week 8 (2 min)
- **Purpose.** Continuity, document → model.
- **Content.**
  - **Week 2 (ConOps / Requirements).** Operational scenarios are built from SCN-001..005. Operational concept (P9e p.1579): a verbal and graphic statement of assumptions or intent regarding an operation. Concept of operations (R52). Requirements are then *transformed* from these needs (R13 pp.557–559) and traced by NEED ID. Writing scenarios exposes missing needs: NEED-011 was found through SCN-005.
  - **Week 8 (stakeholders in SysML v2).**
    - Each STK becomes a `part def` used as a stakeholder parameter.
    - Each CON becomes a `concern` with `subject` and `stakeholder`: "a specific topic that one or more stakeholders desire to be addressed".
    - A requirement can `frame` concerns (R77 pp.115–116).
    - Week 9 models the needs as requirement definitions and usages (R74).
  - **The IDs recorded this week are the keys.**
- **Figure.** A three-lane trace. Week 1 (STK-010 → CON-011 → NEED-010) → Week 2 (SCN-003 and a REQ placeholder) → Week 8 (a small SysML v2 textual snippet: `concern 'peak grid load' { subject ...; stakeholder utility : 'Electric utility'; }`, original, minimal, syntax checked against R77 p.115).
- **Sources.** R52; R13 pp.557–559; R77 pp.115–116 (Phase II); R74 (Phase II). **P9e p.1579 (register addition needed)**.

**Transition I → J.** "You have seen the method done once. Now your team starts doing it on its own enterprise."

### Section J: Laboratory launch (28 min)

#### S2.18 Lab L1 brief: what you deliver, and by when (3 min)
- **Purpose.** Unambiguous instructions.
- **Content.**
  - The Team Record:
    1. charter;
    2. enterprise proposal (ENT) with its system of interest and inside elements (PRT);
    3. context (EXT ≥ 6);
    4. stakeholder register (STK ≥ 8 with CON) **plus relationships (REL ≥ 3, including ≥ 1 conflict)**;
    5. initial needs (NEED ≥ 8 from ≥ 5 stakeholders, including an approving authority);
    6. AI usage statement.
  - Due before Week 2 Session 1, uploaded to the LMS.
  - Rubric rows (§4.6).
  - The deliverable is about the team's own enterprise, never AeroLink.
- **Figure.** A one-slide checklist with minimums and owners (role prefixes).
- **Sources.** Course convention. RB-1, RB-2, RB-12.

#### S2.19 Team work: form, charter, assign owners (10 min)
- **Purpose.** In-class team formation (lab step 1).
- **Content.**
  - Teams agree:
    - the lead roles (each held by a different member);
    - the decision rules, including a tie-break;
    - the communication norms;
    - one owner each for ENT, PRT, EXT, STK, CON, NEED and REL.
  - They pick their lead candidate enterprise from the members' pre-work.
  - The instructor circulates and checks that each charter has a tie-break rule.
- **Figure.** A timer, plus the charter form (from S1.20).
- **Sources.** P6 p.986 (charter); course convention.

#### S2.20 Instructor checkpoint: the enterprise pitch (12 min)
- **Purpose.** Approval decision (lab step 2).
- **Content.**
  - Each team (about 90 s) states three things in one sentence each: the enterprise; the system of interest inside it; the boundary.
  - It names one approving authority and one stakeholder who is not a customer or user.
  - The instructor approves, or approves with conditions, or asks for a revision with a reason.
  - The decision and its date are recorded in the proposal. Teams not reached are decided within 48 h via the LMS.
- **Figure.** A pitch template with three fill-in lines and two name slots.
- **Sources.** Course convention. Proposal criteria from S1.4.

#### S2.21 Close: the next 7 days (3 min)
- **Purpose.** A work plan and accountability.
- **Content.**
  - Out-of-class sequence (§4.4): context → register and relationships → needs → self-check → AI statement → integration review by the V&V lead → upload.
  - The quiz and the individual applied exercise open after this session (§5).
  - Log your hours (FD-22).
- **Figure.** A seven-day timeline with owner initials per task.
- **Sources.** Course convention.

**Session 2 running total**

| Section | Slides | Minutes | Cumulative |
|---|---|---|---|
| F Concerns and register | S2.1–S2.3 | 10 | 10 |
| G Needs | S2.4–S2.13 | 27 | 37 |
| H AeroLink worked example | S2.14–S2.16 | 8 | 45 |
| I Bridge | S2.17 | 2 | 47 |
| *Lecture subtotal* | *17 slides* | *47* | |
| J Lab launch | S2.18–S2.21 | 28 | **75** |

Section G's 27 min breaks down by slide as 3 + 3 + 3 + 2 + 4 + 2 + 3 + 2 + 3 + 2.

**Slide counts.** Session 1: 28 slides (75 min lecture). Session 2: 21 slides (17 lecture, 4 lab launch). **Total: 49.**

## 4. Laboratory outline: Lab L1, the Week 1 Team Record

### 4.1 Inputs
- The approved, or submitted, enterprise idea from the S2.20 checkpoint.
- The Session 1–2 slides and the long-form lesson, especially the AeroLink worked example: the register (S2.3), the needs (S2.15) and the coverage audit (S2.16).
- Readings: R11 pp.549–555 (essential); R10 pp.543–546 (essential, BMA); R53 pp.295–297 (essential, needs attributes); R63 pp.234–237 (essential, stakeholder assessment and maps).
- The Team enterprise view in the web module (checks and export). The blank Markdown template is available for offline work.

### 4.2 Objectives
B1.1, B1.3, B1.4, B1.5 and B1.7, applied to the team's own enterprise.

### 4.3 Method (what the team applies)
1. **Charter**: roles, decision rules, norms, ownership (S1.18–20).
2. **Enterprise and system of interest**: name, purpose (a one-sentence problem or opportunity statement and a mission sentence, as BMA context; R10 pp.543–545), system of interest, inside elements (PRT), and suitability.
3. **Context**: NSoI, then the immediate environment, with every exchange and its direction (S1.12–13).
4. **Stakeholder identification**: all three methods (S1.23–24), with approving authorities checked explicitly (S1.25).
5. **Classification and concerns**: register fields, ratings with reasons, specific concerns (S1.26, S2.2).
6. **Relationships**: at least three REL entries, including at least one *conflicts-with* (S2.3, S2.12).
7. **Needs**: the six-step concern-to-need method (S2.14), checked against the layered characteristics (S2.8). Priority uses MITRE's categories (S2.12).
8. **Coverage audit**: a stakeholder × need matrix. For each stakeholder with no need, either add a need or record why its concern is not a need on the system of interest (S2.16).

### 4.4 Procedure

| Step | When | Who (lead role) | Output |
|---|---|---|---|
| 1. Charter | In class, S2.19 (10 min) | Whole team | Part 1 |
| 2. Enterprise pitch and decision | In class, S2.20 (12 min) | Architecture lead presents | Part 2 decision and date |
| 3. Proposal write-up (purpose, system of interest, PRT ≥ 3, suitability ≥ 40 words) | Day 1–2 | Architecture | Part 2 |
| 4. Context (EXT ≥ 6, each exchange and direction) | Day 1–2 | Architecture | Part 3 |
| 5. Stakeholder sweep: each member independently runs one method, then the team merges | Day 2–3 | Requirements & Compliance (merge) | Candidate list |
| 6. Register: classification, concerns (CON), ratings with reasons; relationships (REL ≥ 3, ≥ 1 conflict) | Day 3–4 | R&C (STK, CON); Architecture (REL) | Part 4 |
| 7. Needs: ≥ 8 needs, ≥ 5 stakeholders, ≥ 1 approving authority; each with condition, rationale, priority, source STK and CON | Day 4–5 | R&C drafts; each member writes ≥ 2 | Part 5 |
| 8. Self-check and coverage audit (layered characteristics; matrix) | Day 6 | V&V lead | Part 5 self-check column, audit note |
| 9. AI usage statement; every AI-suggested item tagged | Day 6 | AI & Data lead | Part 6 |
| 10. Integration review and export (Markdown + JSON) and upload | Day 7 | V&V lead | Submission |

### 4.5 Outputs
`team-NN-week1-record.md` and `team-NN-week1-model-inputs.json`:
- Part 1, charter.
- Part 2, ENT and PRT, with the instructor's decision.
- Part 3, EXT.
- Part 4, STK, CON and **REL** (new).
- Part 5, NEED, with priority and coverage audit.
- Part 6, AI statement.

The JSON adds REL entries and a per-need priority field. This changes the export format; whoever owns the app source must implement it.

### 4.6 Rubric rows (from ASSESSMENT_RUBRICS.md)

| Row | Criterion | Applied this week |
|---|---|---|
| RB-1.1 | Boundary and context | Yes: system of interest, boundary, EXT exchanges; rejected boundary options earn level 4 |
| RB-1.2 | Stakeholder identification and classification | Yes. "All S04 classes" is read as all six course role groups that apply, plus ≥ 1 approving authority and ≥ 1 non-customer/user (faculty to confirm) |
| RB-1.3 | Interests, concerns, influence | Yes: specific concerns; influence *and* interest with reasons; ≥ 1 conflict |
| **RB-1.4** | Relationships and dynamics | **Proposed new for Week 1**: REL ≥ 3 with ≥ 1 conflict. The "feedback or emergent effect" part is deferred (scored at most 3 this week) |
| RB-1.5 | IDs, presentation | Yes: stable IDs; figure text equivalents. AROU v0 is not in scope this week |
| RB-2.2 | Need statements | Yes |
| RB-2.5 | Traceability | NEED → STK (and NEED → CON) only; CAP → NEED is not in scope |
| RB-12.1–12.3 | AI usage statement | Yes |
| Completeness checks | Charter; instructor decision | Not scored |

**Grading mode.** Formative, as now; a faculty decision could make it summative. Feedback is returned before Week 2 Session 2.

### 4.7 Realistic per-student workload (budget: about 8 h per week in total)

| Activity | Hours per student | Basis |
|---|---|---|
| Class sessions (2 × 75 min) | 2.5 | Timetable |
| Readings: R11 pp.549–555 (7 pp), R10 pp.543–546 (4 pp), R53 pp.295–297 (3 pp), R63 pp.234–237 (4 pp); 18 pp at about 15 pp/h | 1.2 | Register page counts |
| Reviewing the lecture handout and worked example | 0.4 | Long-form lesson of about 4,000 words |
| Candidate enterprise before Session 2 (S1.28) | 0.3 | One candidate per member |
| Team Record out of class: the student's share of steps 3–10 | 2.4 | About 9.5 person-hours per team of 4 (context 1.0; sweep and merge 2.0; register and relationships 2.5; needs 2.5; audit and AI statement 1.0; integration 0.5). A team of 3 carries about 3.2 h each, unless the 3-person minimum is reduced (see the note) |
| Quiz Q1 (§5.1) | 0.3 | 12 items |
| Individual applied exercise (§5.2) | 0.7 | 40 min plus upload |
| Time log (FD-22) | 0.1 | |
| **Total** | **7.9** | Within the 8 h budget |

Notes and faculty decisions this workload depends on:
- **(a)** The four AeroLink Practice rehearsal missions (currently 1.1 h) become **optional**, because the lecture now does that demonstration.
- **(b)** The applied exercise **replaces** the separate graduate needs review (0.4 h), or serves as it for graduate students.
- **(c)** For 3-person teams, the needs minimum drops to 6 needs from 4 stakeholders. Otherwise their load is about 8.7 h.
- **(d)** The estimate must be tested against the logged hours (FD-22).

## 5. Assessment outline (separate from the lecture)

Neither instrument reuses the Learn checks, the in-class retrieval questions or the worked-example wording. Items use unseen scenarios, not AeroLink, so the key cannot be read off the slides.

### 5.1 Quiz Q1 (individual, 15 min, closed book, 12 items)
- **Format.** 9 single-best-answer items, plus 3 short-answer items of no more than 40 words each.
- **Balance.**
  - Keyed options are distributed evenly across positions.
  - Distractors are plausible errors taken from the common-error list (S2.13).
  - No option is longer or more qualified than the key.

**Blueprint**

| # | Objective | Bloom | Item focus (unseen context) | Source the key rests on |
|---|---|---|---|---|
| 1 | B1.2 | Understand | Which definition of *system* restricts itself to engineered systems with beneficiaries? | R38 p.1637 |
| 2 | B1.2 | Analyze | Water utility case: classify four items as system of interest, enabling system, or external system | R39b p.1652; P9a p.1493 |
| 3 | B1.2 | Analyze | Hospital case: which boundary choice can answer a stated question? | R02 p.264; P2 p.327 |
| 4 | B1.6 | Understand | Which two 15288 technical processes come first, and what does BMA hand to the second? | P8 p.1001; R11 p.552 |
| 5 | B1.1 | Apply | A team deadlocks two against two; which charter element was missing? (new scenario, not c1) | Course convention; P6 p.986 |
| 6 | B1.4 | Apply | From a five-candidate list, identify the one that is not a stakeholder, and say why | R39a p.1631 |
| 7 | B1.4 | Apply | A team's register has only customers and users; which life-cycle stage would add an approving authority? | R11 pp.552–553 |
| 8 | B1.6 | Analyze | Why must the needs survive after the requirements are written? | R11 pp.551, 555; R13 p.566 |
| 9 | B1.5 | Analyze | Which statement is a need, which a requirement, and which a solution masquerading as a need? | R11 p.555; R13 p.558; R53 p.296 |
| 10 (SA) | B1.5 | Apply | Rewrite a given defective need so that it has a stakeholder, a condition and no design | R11 p.555; R53 p.296 |
| 11 (SA) | B1.7 | Apply | Choose two elicitation techniques for a named stakeholder and justify each in one sentence | R11 p.553; P11 p.324 |
| 12 (SA) | B1.7 | Evaluate | Two needs conflict: state what the team records and who decides | R11 pp.551, 553; P11 p.325 |

- **Scoring.** 1 point each for items 1–9; 2 points each for items 10–12. Total 15. Short answers are scored against a two-criterion key.
- **Weight.** Within "Weekly quizzes 10 %" (S01).

### 5.2 Applied exercise (individual, about 40 min, open book, unseen case)
- **Case brief** (about 300 words, instructor-authored, FICTIONAL). A county is creating a *regional emergency-medical transfer service*: ambulances, a dispatch center, two hospitals, and a helicopter contract. A short narrative names nine actors and organizations and gives two quoted "needs" from interviews.
- **Tasks.**
  1. State the system of interest and its boundary in one sentence each. Name one enabling system. *(B1.2)*
  2. Identify stakeholders by **two** of the three methods, at least 8 in total. Mark the approving authorities, and state which stakeholders only one method found. *(B1.4)*
  3. For four stakeholders, write a specific concern and an influence rating with a reason. *(B1.4)*
  4. Critique the two quoted interview "needs" against the layered characteristics (S2.8). Rewrite each as a well-formed need with condition and rationale. *(B1.5, Graduate)*
  5. Write two further needs from different stakeholders, one of them an approving authority. *(B1.5)*
  6. Identify one conflict between your needs. State the resolution route and who adjudicates. *(B1.7)*
- **Rubric** (4 levels each, 20 points).

| Criterion | 4 | 3 | 2 | 1 |
|---|---|---|---|---|
| System of interest, boundary, enabling system | All correct and justified | One imprecise | System of interest confused with enterprise | Missing |
| Stakeholder identification | ≥ 8, both methods, approving authority, single-method finds named | ≥ 8, minor gaps | < 8 or no approving authority | Customers and users only |
| Concerns and ratings | Specific; reasoned ratings | Mostly specific | Generic concerns | Absent |
| Needs critique and rewrites | Correct diagnosis citing characteristics; rewrites well formed | One weakness missed | Rewrites still solution-laden or unconditioned | Rewrites are requirements |
| Conflict and resolution | Conflict real; route and adjudicator stated with reason | Route vague | Conflict trivial | Missing |

- **Submission.** Through the LMS before Week 2 Session 1.
- **Graduate students.** The exercise counts as review-notebook entry 1 (RB-16), replacing the old four-need review (faculty decision, §4.7 b).

## 6. Section transitions (summary)

| From → to | Transition line |
|---|---|
| Session 1, A → B | Stakeholders follow from the system and its boundary, so define the system first |
| B → C | We know *what* system; now *when* in its life, and under which process |
| C → D | Processes are performed by people; first become a team |
| D → E | The team's first engineering act: who counts as a stakeholder, and how to find them all |
| E → exit | Answer the driving question; prepare candidate enterprises |
| Session 2, F → G | A concern is a worry; a need says what the system must do about it, and is still not a requirement |
| G → H | The whole method once, end to end, on AeroLink |
| H → I | Where the IDs go: Week 2 requirements, Week 8 model |
| I → J | Now your team applies it to its own enterprise |

## 7. Register additions needed by this outline

All of these were verified in the extracted text for this outline; full detail is in `WEEK1_CRITICAL_REVIEW.md` §7.2. None is in `readings.py` yet.

| Proposed ID | Source, PDF pages | Title | Used on slides |
|---|---|---|---|
| P1 | SEBoK p.130 | Systems Engineering Principles | S1.6 |
| P2 | SEBoK pp.326–327 | Engineered System Context | S1.8, S1.13; quiz 3 |
| P3 | SEBoK pp.330–331 | Identifying and Understanding Problems and Opportunities | (long-form lesson: soft versus hard problems) |
| P4 | SEBoK pp.540–541 | System Concept Definition | S1.16 |
| P5 | SEBoK p.761 | Product Systems Engineering Key Aspects | S1.18 |
| P6 | SEBoK pp.986–990 | Team Capability | S1.18–20; S2.19; quiz 5 |
| P7 | SEBoK pp.994–995 | Team Dynamics | S1.18, S1.20 |
| P8 | SEBoK pp.1001–1002 | Diversity, Equity, and Inclusion (Table 1: 15288:2015 technical processes) | S1.16, S1.22; quiz 4 |
| P9a | SEBoK p.1493 | Enabling System (glossary) | S1.9; quiz 2 |
| P9b | SEBoK p.1497 | Enterprise (glossary) | S1.10 |
| P9c | SEBoK p.1501 | Environment (glossary) | S1.12 |
| P9d | SEBoK p.1550 | Life Cycle (glossary) [page begins with *Leverage*] | S1.15 |
| P9e | SEBoK p.1579 | Operational Concept (glossary) [page begins with *Operational Capability*] | S2.17 |
| P9f | SEBoK p.1607 | Requirement (glossary) [page begins with *Reparability*] | (long-form lesson) |
| P9g | SEBoK p.1639 | System Boundary (glossary) [page begins with *System Assurance*] | S1.12 |
| P9h | SEBoK p.1641 | System Context (glossary) | S1.12 |
| P9i | SEBoK p.1662 | Team (glossary) | S1.18 |
| P10 | DoD SE Guidebook pp.51–52 | Stakeholders; Integrated Product Teams | S1.18, S1.24 |
| P11 | MITRE SEG pp.318–326 | Eliciting, Collecting, and Developing Requirements | S1.24, S2.10–12, S2.15; quiz 11–12 |
| R48 correction | DoD pp.141–142 / 142–144 | Split into Stakeholder Requirements Definition (R48a) and Requirements Analysis (R48b) | S1.16, S2.7, S2.8 |

**Week 1 essential readings, proposed** (replacing `course.ts` Week 1 `readings`): R11 pp.549–555; R10 pp.543–546; R53 pp.295–297; R63 pp.234–237.
**Extension:** R38, R39a, R39b, R07 pp.815–816, P2, P6, P11 pp.322–325.

## 8. Open items for faculty

1. Approve the Session 2 split (about 47 min lecture, about 28 min lab launch).
2. Team formation: instructor-assigned or self-selected (S1.28).
3. Accept the new objectives B1.6 and B1.7, and raise B1.2 to Analyze.
4. Add REL and RB-1.4 to Week 1. Add a per-need priority field.
5. Classification of the eight unkeyed AeroLink stakeholders (S2.3), especially whether the ANSP is an approving authority.
6. The reference-set defects (critical review §5, A1–A4): fix in the data, or teach as audit findings. D1–D3 stay as unnumbered illustrations unless approved.
7. Workload decisions §4.7 (a)–(c).
8. Approve the register additions P1–P11 and the R48 correction.
9. Whether to acquire the INCOSE NRM/GtNR/GtWR, the INCOSE SE Handbook v5 and ISO/IEC/IEEE 15288:2023 (critical review §6).
