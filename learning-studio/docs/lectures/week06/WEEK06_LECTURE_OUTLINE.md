# Week 6 Lecture Outline: Evolution Roadmap

**Status.** Draft outline for faculty review (COURSE_PRODUCTION_PLAN M2), written 2026-10-19. Nothing here is in the app source yet.
**Governing documents.** DECISION_LOG A19 and A20; COURSE_SCHEDULE.md (Week 6 subject, exact: *Evolution Roadmap*; team output: "Enterprise evolution roadmap (increments, technology insertion, transition)"); the Week 1 template (`docs/lectures/week01/WEEK1_LECTURE_OUTLINE.md`, `REVIEW_DISPOSITIONS.md`).
**Reuse.** Old Week 14 (draft objectives B14.1 "plan an evolution increment and identify affected elements"; the autonomy increment), the course document's Deliverable 15 (Enterprise Evolution Roadmap) and Deliverable 13 (Known Unknowns), and the AeroLink reference data in `src/model/reference/week02.ts`–`week08.ts` and `src/content/lectures/week01/aerolinkCase.ts`.
**Format.** Two sessions of 75 minutes, each 69 min of planned content plus a 6-min buffer.
- Session 1: all lecture, 21 slides plus the generated References and credits slide.
- Session 2: about 47 min of lecture on 14 slides, then about 22 min of laboratory launch on 4 slides, plus References and credits.
- Total: 39 content slides plus 2 generated reference slides.

## 0. Conventions used in this outline

- **Citations.** `R12 p.862` = verified register entry R12, PDF page 862 (SEBoK pages are PDF indices, DECISION_LOG W1). `P6-1 p.529` = a **proposed register addition** (§9): its page was checked in `_source_cache` for this outline, but it is not yet in `readings.py`. The P6- prefix keeps Week 6 proposals distinct from other weeks' proposals. A citation supports only the claim beside it.
- **Course convention** marks content the collection does not supply (for example the roadmap lane layout and the near/mid/far horizons chosen for AeroLink).
- **AeroLink is FICTIONAL.** Values come only from `src/model/airtaxi.ts`, `src/model/reference/week02–08.ts` and `aerolinkCase.ts`. Any horizon, date or increment content not in those files is marked **(proposed, instructor to confirm)**.
- **Slide faces** carry short citations only and no internal identifiers (no rubric, decision-log, faculty-decision, course-document or P-numbers, no objective IDs). Those stay in this faculty outline. Faculty notes are written at ≤ 130 words per minute.
- Quotations are limited to short verified definitions; everything else is paraphrase. All figures are original drawings.

## 1. Learning objectives (graduate level)

IDs W6.1–W6.3 are kept from `course.ts`; W6.4–W6.5 are proposed additions.

| ID | Objective | Bloom | Taught in |
|---|---|---|---|
| W6.1 | Plan enterprise evolution increments with their triggers, dependencies and off-ramps, from a baseline and a capability-gap analysis over stated time horizons | Create | S1.5–S1.8, S1.10–S1.13; S2.8–S2.11; lab |
| W6.2 | Plan technology insertion from the Week 3 readiness assessment, judging maturity, insertability and operational timing together, and stating what TRL does not tell you | Evaluate | S1.14–S1.18; S2.3 |
| W6.3 | Describe the transition from the current enterprise to each increment, including how the service keeps operating while it changes | Apply | S2.2–S2.6 |
| **W6.4 (new)** | Distinguish an enterprise evolution roadmap from a development approach (sequential, incremental, evolutionary), and justify the approach chosen for each increment | Analyze | S1.10–S1.12 |
| **W6.5 (new)** | Record known unknowns with impact, information need and mitigation, and connect each to the increment it gates | Apply | S1.19–S1.20; lab |
| Graduate | Analyze roadmap sensitivity: which trigger or unknown moves an increment, and trace an increment's impact set across the Weeks 1–5 artifacts | Evaluate | Graduate task (§6.3) |

## 2. Session 1: From capability gaps to a technology plan (75 min, all lecture)

**Design rationale.** Weeks 1–5 described the enterprise as it is planned for entry into service. Week 6 asks how it changes afterward. Session 1 builds the concepts in the order an engineer uses them: capability gaps over time, how change is delivered in increments, what a technology plan contains, and what maturity evidence can and cannot support. Session 2 covers transition, then the full AeroLink roadmap and the lab launch.

### Section A: Framing (6 min)

#### S1.1 Week 6 at a glance (1 min)
- **Purpose.** Orient: subject, two sessions, the week's output.
- **Content.** Subject: *Evolution Roadmap*. Output: an enterprise evolution roadmap with increments, technology insertion and transition, plus a known-unknowns register. It closes the content weeks; Week 7 integrates.
- **Figure.** The six-week package band (Weeks 1–5 filled, Week 6 highlighted, Week 7 outlined "integrate"). Adapted from the Week 1 `week-path` figure.
- **Sources.** Course schedule (course convention).

#### S1.2 Driving question: after the Year-2 decision, what comes next? (3 min)
- **Purpose.** Create a need to know.
- **Content.** Week 3 decided AeroLink's Year-2 capacity plan (DEC-001: buy 4 aircraft and convert one spoke vertiport into a fourth hub). The decision is committed, so it is part of the baseline trajectory. The board now asks: "After the Year-2 decision, should the next step be autonomous operations, more capacity, or integrated ticketing, and in what order?" Students vote: (A) autonomy first, (B) more capacity first, (C) ticketing first, (D) none of the three first. Answer withheld until S2.11. *(Revised 2026-10-21, review M1: see §4.)*
- **Figure.** A fork in a road drawn as a timeline: one branch labeled "autonomy", one "more hubs", one "ticketing", with a question mark at the fork.
- **Sources.** DEC-001, TECH-003, O-001 from `reference/week06–07.ts` (FICTIONAL). Driving question instructor-authored.

#### S1.3 Where Week 6 sits in the package (2 min)
- **Purpose.** Show that a roadmap consumes every earlier artifact.
- **Content.** Needs and MGOs (Weeks 1–2) say *why* change; the readiness assessment, risks and trade study (Week 3) say *what is ready* and *what was decided*; architecture and interfaces (Weeks 4–5) say *where* change lands. The roadmap adds *when* and *in what order*.
- **Figure.** Five input arrows (Weeks 1–5, each labeled with its artifact) converging on a timeline box "roadmap".
- **Sources.** Course convention.

### Section B: Capability evolution over time (18 min)

#### S1.4 Architecture includes the principles of its evolution (2 min)
- **Purpose.** Anchor evolution in the definition of architecture the class used in Week 4.
- **Content.** The 15288:2015 definition, as given in the SEBoK glossary, speaks of fundamental concepts or properties of a system "embodied in its elements, relationships, and in the principles of its design and evolution" (P6-6 p.1445). Evolution is part of the architecture, not an afterthought.
- **Figure.** The Week 4 architecture sketch, with a fourth tab added: "evolution principles".
- **Sources.** **P6-6 p.1445 (register addition needed).**

#### S1.5 Three kinds of capability and the baseline trajectory (3 min)
- **Purpose.** Locate the roadmap in enterprise capability management.
- **Content.** SEBoK distinguishes organizational, system and operational capability (R12 p.860). The enterprise has a current and planned baseline capability; capability management aims to "vector" it away from the baseline trajectory toward a position that better meets strategic goals within resource constraints (R12 p.860).
- **Figure.** A line chart (no numbers): "baseline trajectory" as a dashed line, "desired trajectory" above it, an arrow labeled "vectoring" between them.
- **Sources.** R12 p.860.

#### S1.6 Operational needs, enterprise needs and capability gaps (4 min)
- **Purpose.** Connect the roadmap to the needs work of Week 1.
- **Content.**
  - An operational need supports end-user activities; an enterprise need supports the enterprise's internal activities and enabling assets (R12 p.861).
  - Capabilities exist to meet mission and enterprise needs. The desired capability is compared with the baseline to find **gaps** and **excesses** (R12 p.862).
  - Gaps can be mapped into future time "buckets" such as near-, mid- and far-term; for long-lasting capabilities SEBoK cites about five, ten and twenty years, and shorter buckets (one, two, three years) for fast-changing ones (R12 p.862).
  - AeroLink reading (revised 2026-10-21, review M1): MGO-007 sets a Year-2 capacity objective (300 trips/day by month 24). Measured against the baseline TRAJECTORY, which includes the committed DEC-001 step (320 trips/day by month 24), there is no near-term capacity gap: GAP-001 is an excess of 20 trips/day above the desired level, kept as headroom. Measured against the entry snapshot (240, ALT-001) it would wrongly read as a 60 trips/day gap. Excess means baseline above the desired level; slack on a non-binding limit (chargers 384 vs fleet 320) is not an excess (review Mo1).
- **Figure.** A gap chart: three columns (near, mid, far), each with a "desired" bar and a "baseline" bar; the near column labeled with AeroLink's 240 versus 300 trips/day.
- **Sources.** R12 pp.861–862. MGO-007, ALT-001 from `reference/week03.ts`, `week07.ts` (FICTIONAL).

#### S1.7 From gaps to changes: architecture, opportunities, portfolio (3 min)
- **Purpose.** Show how a gap becomes a candidate change.
- **Content.** Enterprise architecture analysis shows where elements must be added, dropped or changed; each change has benefits, costs and risks (R12 p.862). Opportunities are assessed individually or as a portfolio, because they depend on each other, on current operations and on partners; a business case usually supports each (R12 p.862).
- **Figure.** Gap → "architecture change" cards (add, change, drop) → a portfolio box with dependency lines among cards.
- **Sources.** R12 p.862.

#### S1.8 The enterprise improvement plan and managing change (3 min)
- **Purpose.** Give the roadmap its professional form.
- **Content.** Assessed opportunities are laid out in an enterprise plan with a long horizon, aligned with strategic goals; planned changes carry performance targets that are monitored, and the plan is adjusted as needed (R12 p.863). Changes should be managed so current operations are not adversely affected; SEBoK lists seven lenses for change management: strategic objectives, stakeholders, processes, performance metrics, current state alignment, resources and maturity assessment (R12 p.863).
- **Figure.** A plan "page" with three fields (target, metric, review date) beside a seven-spoke wheel labeled with the lenses.
- **Sources.** R12 p.863.

#### S1.9 As-is, to-be and the roadmap between them (3 min)
- **Purpose.** Introduce the canonical roadmap structure.
- **Content.** MITRE describes an enterprise architecture as snapshots of the current and target environments plus a capital investment roadmap for moving from "as is" to "to be" (P6-5 pp.131–132). Views of "as is" and "to be" architectures help stakeholders understand migration paths and transitions, and architectures can be used to assess different evolutionary paths (R62 p.345).
- **Figure.** Two architecture thumbnails ("as is", "to be") joined by a stepped path of three increments.
- **Sources.** **P6-5 pp.131–132 (register addition needed)**; R62 p.345.

**Transition B → C.** "A gap tells us where we must go. Increments are how we get there without stopping the service."

### Section C: Delivering change in increments (15 min)

#### S1.10 Development approaches: sequential, incremental, evolutionary (4 min)
- **Purpose.** Give the sourced vocabulary, and its limits.
- **Content.**
  - SEBoK groups development approaches as sequential, incremental and evolutionary, with agile as another type or subset; the classification rests on how well the requirements are known, whether there are increments, and what they are used for (P6-4 pp.390–391).
  - Incremental: a sequence of increments with increasing capability; the last meets all requirements; benefits include a focus on technical risk and room for emerging technologies (P6-4 p.393).
  - Evolutionary: start with a limited set of requirements; each cycle provides value and increases problem understanding (P6-4 p.393).
  - **Caution.** SEBoK notes these adjectives apply to the *development stage*, not to the life cycle as a whole (P6-4 p.391). An enterprise roadmap evolves an *operating* enterprise; each increment may still be developed sequentially, incrementally or evolutionarily.
- **Figure.** Three small strip diagrams (one block; stacked blocks of growing size; looping cycles), with a bracket "development stage only" under them and a separate long arrow "enterprise roadmap" above.
- **Sources.** **P6-4 pp.390–393 (register addition needed).**

#### S1.11 Evolutionary acquisition: two ways to define increments (4 min)
- **Purpose.** A practitioner's model of increment planning.
- **Content.** MITRE defines evolutionary acquisition as a strategy that delivers capability in increments, recognizing up front the need for future improvements (P6-2 p.582). It allows insertion of new technologies when they are sufficiently mature (P6-2 p.583). Two approaches: the ultimate functionality is defined at the start and maturing technologies set each increment's content; or it cannot be defined at the start and each increment is set by maturing technologies matched with evolving user needs (P6-2 p.583).
- **Figure.** Two timelines: the first with a fixed end-state box and increments filling toward it; the second with an end-state drawn as a cloud that sharpens with each increment.
- **Sources.** **P6-2 pp.582–583 (register addition needed).**

#### S1.12 Lessons for planning increments (4 min)
- **Purpose.** Turn the model into rules of practice.
- **Content.** From MITRE's lessons (P6-2 pp.583–585):
  - Architecture is key: develop the architecture first; the first increment should include the target architecture that later increments build on.
  - Manage expectations: do not expect to define every increment accurately in advance; change is normal.
  - User requirements should drive the content and priority of increments, provided users understand the end state.
  - No technology before its time: use emerging technology when it is mature.
  - Plan for parallel developments under configuration management.
- **Figure.** Five rule cards, each with a one-line AeroLink illustration (for example "architecture first: the operations platform with hot standby (DEC-002) is the base every increment uses").
- **Sources.** **P6-2 pp.583–585 (register addition needed).** DEC-002 from `reference/week08.ts`.

#### S1.13 Deferral and off-ramps as risk control (3 min)
- **Purpose.** Link increments back to Week 3 risk handling.
- **Content.** DoD lists, among top-level mitigation activities, deferring capability to a follow-on increment, limiting the number of critical technologies, and identifying off-ramps, that is, a contingency plan to use mature technology if a technology is not developed successfully (R46 p.126).
- **Figure.** A timeline with a branch: "planned technology" path and a dashed "off-ramp: mature technology" path rejoining later.
- **Sources.** R46 p.126.

**Transition C → D.** "Increments need content. The content comes from a technology plan, and the plan rests on maturity evidence."

### Section D: The technology plan and maturity evidence (19 min)

#### S1.14 What technology planning is (3 min)
- **Purpose.** Define the central method of the week.
- **Content.** MITRE: technology planning is "the process of planning the technical evolution of a program or system to achieve its future vision or end-state" (P6-1 p.528). It may include desired outcomes, forecasting and schedule projections, maturation requirements and insertion points; the goal is a defined technical end-state reached by technology insertion over time (P6-1 p.528). Business or mission needs and gaps drive technology needs; technology evaluations inform the plan; the resulting plan serves as the roadmap for closing the gaps (P6-1 p.529).
- **Figure.** Original three-box loop: "mission objectives and gaps" → drives → "technology plan" ← informs ← "technology evaluations".
- **Sources.** **P6-1 pp.528–529 (register addition needed).**

#### S1.15 The contents of a technology plan (4 min)
- **Purpose.** Give students a checklist they can apply.
- **Content.** The plan defines an end-state and determines which technologies are available now, which are in development (with maturity levels) and which do not yet exist (P6-1 p.529). Immature technologies are assigned risk with mitigation plans (P6-1 p.530). At a minimum the plan identifies the technologies brought to bear, their maturation trend, insertion points, required investments and dependencies (P6-1 p.530). It should be a "living" document (P6-1 p.529).
- **Figure.** A three-column technology table (available now / in development / does not exist) with a fourth column "insertion point".
- **Sources.** **P6-1 pp.529–530 (register addition needed).**

#### S1.16 Forming the roadmap: the practice steps (4 min)
- **Purpose.** Show the procedure.
- **Content.** MITRE's activities, abridged (P6-1 pp.530–531): evaluate the environment; define desired results within a planning horizon, usually 5–10 years, and work back to the present; identify core technologies first and assess their maturation risk; establish a quantifiable feedback system; assess the organization's current state; develop tactical plans with measurable goals; form the roadmap (phasing, insertion points, investments, sequencing); assess life-cycle costs; communicate the plan in the users' terms; implement, monitor and review it annually or at an agreed period.
- **Figure.** A backward-planning arrow from "end-state (year 10)" to "today", with numbered step markers along it.
- **Sources.** **P6-1 pp.530–531 (register addition needed).**

#### S1.17 What maturity evidence can and cannot tell you (4 min)
- **Purpose.** Connect Week 3's readiness assessment to insertion decisions, honestly.
- **Content.**
  - TRL rates a technology by development, prototyping and testing across environments; stakeholders need a common reading of "relevant environment" and similar terms (R60 p.525).
  - The TRL scale does not address how well a technology fits the architecture absorbing it, which is a systems engineering task critical to transition (R60 p.525).
  - In DoD practice, threshold capabilities judged to depend on immature technology (TRL below 6) are not treated as threshold (R60 p.526).
  - Integration readiness levels address interface maturity; system readiness levels combine TRLs with integration points (R16 p.768).
- **Figure.** A TRL ladder (1–9, labels from R16 p.767) with a separate side gauge "architecture fit" that the ladder does not measure, and a line at TRL 6 labeled "threshold practice (DoD)".
- **Sources.** R60 pp.525–526; R16 pp.767–768.

#### S1.18 AeroLink: from maturity to insertion candidates (4 min)
- **Purpose.** Apply S1.14–S1.17 to the reference data.
- **Content.**
  - TECH-001 high-power charging, TRL 6, resting on assumption A-003 (supplier test report to confirm): candidate for near-term insertion, already selected in DEC-001.
  - TECH-002 battery cells, TRL 5 (A-004): in service at the baseline; its fade risk R-002 is tracked through TPM-003.
  - TECH-003 detect-and-avoid and autonomy enablers, TRL 4 (A-005): not ready; R-006 is accepted because the baseline is piloted.
  - Every TRL is an assumption, not evidence, because the course holds no supplier or test data (reference note in `week06.ts`).
- **Figure.** The S1.15 table filled in for AeroLink: TECH-001 "available (assumed TRL 6)", TECH-002 "in service, fade risk", TECH-003 "in development (assumed TRL 4)".
- **Sources.** TECH-001..003, A-003..A-005, R-002, R-006, TPM-003 from `reference/week05–06.ts` (FICTIONAL).

### Section E: Known unknowns (7 min)

#### S1.19 Known unknowns and placeholders (4 min)
- **Purpose.** Make what we do not know a managed input to the roadmap.
- **Content.** SEBoK: when a value is unknown, a requirement carries a TBD; when a value is set but confidence is low, a TBR. Tracking these "TBXs" shows the maturity of the set, and unresolved TBXs can lead to risk; TBX management names the work, the owner and the closure (R13 p.565). The course's known-unknowns record (course convention) gives each unknown its impact, the information needed, and a mitigation, and names the increment it gates.
- **AeroLink.** U-001 (aircraft weather limits, TBD-01) and U-002 (vertiport grid connection, TBD-02). U-002 gates the fourth hub (DEC-001 condition; R-005).
- **Figure.** A four-column record (unknown, impact, information need, mitigation) with two AeroLink rows: U-009 (storage integration) gating Increment 1 and U-004 gating Increment 3 (revised 2026-10-21).
- **Sources.** R13 p.565. U-001, U-002 from `reference/week02.ts`, `week04.ts` (FICTIONAL). Course convention (record fields).

#### S1.20 Think-pair-share: place AeroLink items on the horizons (3 min)
- **Purpose.** Retrieval and application before Session 2.
- **Content.** Pairs place six cards on near/mid/far: fourth hub (DEC-001), integrated ticketing (O-001), overnight charger leasing (O-002), predictive maintenance maturity (AI-001), demand re-forecasting (AI-002), autonomous operations (TECH-003). Each placement must name the evidence or the unknown that sets it.
- **Figure.** A three-lane board with six blank cards.
- **Sources.** O-001, O-002, AI-001, AI-002 from `reference/week02.ts`, `week06.ts`, `week08.ts` (FICTIONAL).

### Exit (4 min)

#### S1.21 Exit: retrieval and preparation (4 min)
- **Purpose.** Hand-off to Session 2.
- **Content.** One-minute paper: "Name one technology or change in your enterprise that you would *not* insert in the near term, and the evidence that would change your mind." Before Session 2 (about 20 min): each member brings one candidate change for the team's enterprise and its maturity or unknown.
- **Figure.** None (text slide with a link to the LMS form).
- **Sources.** Course convention.

#### S1.22 References and credits (0 min, generated)

**Session 1 running total**

| Section | Slides | Minutes | Cumulative |
|---|---|---|---|
| A Framing | S1.1–S1.3 | 6 | 6 |
| B Capability evolution | S1.4–S1.9 | 18 | 24 |
| C Increments | S1.10–S1.13 | 15 | 39 |
| D Technology plan and maturity | S1.14–S1.18 | 19 | 58 |
| E Known unknowns | S1.19–S1.20 | 7 | 65 |
| Exit | S1.21 | 4 | **69** |
| Buffer | | 6 | **75** |

## 3. Session 2: Transition, the AeroLink roadmap and the lab launch (75 min)

**Split.** About 47 min lecture (S2.1–S2.14) and about 22 min lab launch (S2.15–S2.18), plus a 6-min buffer. The worked roadmap must be shown before teams build their own (A20: teach, demonstrate, then assign); the in-class lab time is used for the one decision that benefits most from the instructor: the team's baseline and first increment trigger.

### Section F: Transition and changing a system in operation (20 min)

#### S2.1 Retrieval warm-up (2 min)
- **Purpose.** Spaced retrieval of Session 1.
- **Content.** Three questions on cards: (1) What does a TRL not tell you? (2) Name the two ways to define increments. (3) What is an off-ramp? Reveal on the next click.
- **Figure.** Three question cards.
- **Sources.** R60 p.525; P6-2 p.583; R46 p.126.

#### S2.2 Transition is a process, not a date (3 min)
- **Purpose.** Define transition and its scope.
- **Content.** MITRE: transition is when the system moves from development to the manufacturing, fielding and sustainment phase (P6-3 p.447). It is a process over time with three parts: planning for transition, implementation, and operations and maintenance; planning should begin early, and how to insert technology improvements during operations and maintenance needs to be addressed in the initial design (P6-3 p.448). Transition strategies include simultaneous operation, cutover and retirement of old systems (P6-3 p.447).
- **Figure.** A three-phase bar (plan → implement → operate and maintain) with a repeating "insert technology" marker inside the third phase.
- **Sources.** **P6-3 pp.447–448 (register addition needed).**

#### S2.3 A flexible technology roadmap (3 min)
- **Purpose.** The insertion rule students will apply.
- **Content.** MITRE: have a plan for when, how and why technology improvements are inserted after deployment, and develop a roadmap that balances technology maturity, the ability to insert the technology into the system, and when the upgrade is operationally appropriate (P6-3 p.449).
- **Figure.** A three-circle diagram (maturity, insertability, operational timing); the intersection is labeled "insertion point".
- **Sources.** **P6-3 p.449 (register addition needed).**

#### S2.4 Modernizing a service or enterprise while it operates (4 min)
- **Purpose.** Why evolution of a service enterprise is hard.
- **Content.**
  - Modernization reasons include degraded performance, a new capability desired by a stakeholder, obsolescence, and new uses (R26 pp.680–681).
  - Service system modernization may need regulatory change, requires backward compatibility during the change, and often a phase-based strategy over large geographic areas (R26 p.682).
  - For enterprises, the largest challenge is implementing changes while the system remains operational; disruption of operations is a serious risk and the transition between old and new configurations must be carefully planned (R26 p.683).
  - Understanding intended usage, documented as a concept of operations, matters when making changes (R26 p.681).
- **Figure.** A running service drawn as a moving train with one carriage being replaced while in motion, labeled "phase-based change, backward compatible".
- **Sources.** R26 pp.680–683 (register start correction, §9).

#### S2.5 Changing without breaking: F3I, Vee entry points, regression (4 min)
- **Purpose.** Engineering discipline for upgrades.
- **Content.** Form, fit, function and interface (F3I) is an important principle where backward compatibility is required (R26 p.680). A modification initiated at a lower level enters the Vee at that level, and changes at lower levels must flow upward through parent requirements (R26 pp.683–684). Regression testing confirms that unmodified parts still work, aided by a requirements verification traceability matrix (R26 p.682).
- **Figure.** An original Vee sketch with three entry points (system, subsystem, component) and an upward arrow "flow requirements to parents".
- **Sources.** R26 pp.680, 682–684.

#### S2.6 Concurrent changes and open interfaces (4 min)
- **Purpose.** Link back to the Week 5 interfaces.
- **Content.** When several modifications run at once, SEBoK names a "block" method (a group deployed together) and continuous integration (R26 p.684). DoD: modular, open systems with standardized interfaces facilitate future technology insertion and refresh (R47 p.139). The Week 5 interface table is therefore an evolution asset: an interface that is defined and controlled can be upgraded on one side.
- **Figure.** The AeroLink N² chart from Week 5, with IF-005 (aircraft–charger power) and IF-006 (charger–grid) highlighted as the interfaces a charger upgrade must keep.
- **Sources.** R26 p.684; R47 p.139. IF-005, IF-006 from `reference/week08.ts`.

**Transition F → G.** "Now the method end to end, on AeroLink."

### Section G: The AeroLink worked example (22 min)

#### S2.7 Anatomy of a roadmap (3 min)
- **Purpose.** Fix the product's form before the worked example.
- **Content.** The course's roadmap (course convention) has: horizons (near, mid, far, each with an end state); lanes (capability, technology, architecture and interfaces, operations and people); increments with content, entry trigger, dependencies, off-ramp and transition approach; and a link from each increment to the gap, need or MGO it serves and to the risks and unknowns that gate it.
- **Figure.** An empty roadmap grid: three horizon columns, four lanes, increment bars spanning lanes, a trigger diamond at each bar's start.
- **Sources.** Course convention, built on R12 pp.862–863 and P6-1 p.530.

> **Revision 2026-10-21 (review M1, integrator decision; faculty may revisit).** S2.8–S2.11 below are the original plan.
> As built: S2.8 is Increment 0, the baseline TRAJECTORY (entry snapshot 240 plus the committed Year-2 step, 320 by month
> 24); S2.9 is the committed Year-2 step and its computed transition order (hub first; the wrong order is Week 3's R-001);
> S2.10 is Increments 1–3: Increment 1 "Resilient hubs" (storage at the four hubs, one first; overnight charger leasing;
> mid term), Increment 2 "Data-ready, integrated network" (AI-001, workload evidence, ticketing, the capacity step above
> 256 trips/day; mid term, in parallel), Increment 3 autonomy (far term). S2.11's answer is (D) none of the three first:
> resilience first, then data, ticketing and capacity on their triggers, then autonomy. Horizons: years 3–5 and 6–10.
> The data, every number and the tests are in `src/content/lectures/week06/aerolinkCase.ts` and its test.

#### S2.8 Worked example I: Increment 0, the baseline (3 min)
- **Purpose.** Every roadmap starts from an honest "as is".
- **Content.** Data Sheet: 12 aircraft of 4 seats; 6 vertiports with 2 chargers each, of which 3 hubs carry turnaround charging (A-002); 16 h operating day; piloted operations; one operations platform with hot standby (DEC-002). Capacity is min(12 × 20, 6 × 48) = 240 trips/day (ALT-001), fleet-limited.
- **Figure.** The roadmap grid with the "as is" column filled.
- **Sources.** DATA_SHEET (`airtaxi.ts`); A-002 (`week02.ts`); ALT-001 (`week07.ts`); DEC-002 (`week08.ts`). FICTIONAL.

#### S2.9 Worked example II: Increment 1, Year-2 capacity (4 min)
- **Purpose.** The near-term increment, already decided.
- **Content.** Content: 4 aircraft (16 in total) and a fourth hub by upgrading one spoke's 2 chargers to high-power units (ALT-004, DEC-001); capacity 320 trips/day, meeting the 300 trips/day objective by month 24. Entry triggers from the DEC-001 action list: the supplier test report confirms TRL 6 for the charger (A-003), and the utility confirms connection capacity at the candidate spoke (U-002; R-005 is handled by avoidance). Off-ramp: if the connection is refused, choose another spoke (proposed, instructor to confirm). Transition: phase the upgrade at one site while the other hubs carry the turnaround load (proposed, instructor to confirm).
- **Figure.** The near column filled: one increment bar across the capability, technology and architecture lanes, two trigger diamonds (A-003, U-002).
- **Sources.** DEC-001, ALT-004, A-003, U-002, R-005 from `reference/week04–07.ts` (FICTIONAL); R26 p.682 (phase-based change).

#### S2.10 Worked example III: Increments 2 and 3, toward autonomy (5 min)
- **Purpose.** A mid- and far-term increment gated by immature technology.
- **Content.**
  - The old course lab sequence ends with adding "Autonomous Flight Operations" to the enterprise; the reference data carry the enabler TECH-003 at an assumed TRL 4 (A-005), with R-006 accepted for the piloted baseline.
  - **Increment 2 (mid, years 3–5; proposed, instructor to confirm):** prepare for autonomy without depending on it: mature AI-001 predictive maintenance and AI-002 demand forecasting, collect operating evidence, and add integrated ticketing (O-001) if the transport authority agrees.
  - **Increment 3 (far, years 5–10; proposed, instructor to confirm):** remote or autonomous flight operations, entered only when TECH-003 reaches TRL 6 or higher (the reference R-006 trigger is a TRL review at evolution planning) and when the approving authority (STK-002) and operators' trust (CON-009) are addressed.
  - Which development approach? Increment 3's end functionality cannot be fully defined now, so the second evolutionary approach fits (P6-2 p.583).
- **Figure.** Mid and far columns filled; the Increment 3 bar is dashed until a "TECH-003 ≥ TRL 6" diamond; an off-ramp arrow "stay piloted" runs below it.
- **Sources.** TECH-003, A-005, R-006, AI-001, AI-002, O-001 from `reference/week02–08.ts`; STK-002, CON-009 from `aerolinkCase.ts` (FICTIONAL); P6-2 p.583. Horizons are a course convention after R12 p.862.

#### S2.11 Worked example IV: triggers, dependencies and the answer (4 min)
- **Purpose.** Close the driving question.
- **Content.**
  - Triggers that move increments: the quarterly demand re-forecast (A-006; DEC-001 would change at 192 trips/day or less); TPM margins (TPM-001 charge time; TPM-003 landing energy, whose margin below 1 percentage point triggers R-002); the U-002 agreement; the TECH-003 TRL review.
  - Dependencies: Increment 3 depends on the operations platform (DEC-002) and on Increment 2's data; O-002 overnight charger leasing improves Increment 1's cost case.
  - Answer to S1.2: (D) cannot tell from preference alone; with the evidence, capacity comes first because its technology is assumed ready and its gap is near-term; autonomy waits for TRL evidence and is prepared for, not scheduled.
- **Figure.** The full roadmap with trigger diamonds and dependency arrows; the S1.2 vote result shown beside it.
- **Sources.** A-006, DEC-001, TPM-001, TPM-003, R-002, O-002 from `reference/week05–07.ts` (FICTIONAL); P6-2 p.584 (no technology before its time).

#### S2.12 Worked example V: an increment's impact across the package (3 min)
- **Purpose.** Show that an increment changes earlier artifacts.
- **Content.** Increment 3 touches: stakeholders and concerns (STK-008 pilots and remote operators; CON-009); needs (NEED-013 workload; NEED-002 assurance); requirements (REQ-STK-003, REQ-SYS-003 planning functions); functions and allocation (FN-003, FN-005, FN-012); physical elements (PHY-001, PHY-004); interfaces (IF-002, IF-003); risks (R-006). The impact list is the input to Week 14's model change.
- **Figure.** A tree from "Increment 3" fanning to the affected IDs, grouped by week.
- **Sources.** IDs from `aerolinkCase.ts` and `reference/week04, 06, 08.ts` (FICTIONAL); P6-2 p.583 (architecture first).

#### S2.13 Common errors in roadmaps (4 min)
- **Purpose.** Consolidate by contrast.
- **Content.**
  1. A timeline of features with no gap or need behind them (R12 p.862).
  2. A technology scheduled because it is exciting, not because it is mature (P6-2 p.584; P6-1 p.530).
  3. TRL treated as proof of architecture fit (R60 p.525).
  4. Increments with no trigger, so nothing tells you when to start them (P6-1 p.530 feedback system).
  5. No off-ramp for an immature technology (R46 p.126).
  6. Transition left until the end (P6-3 p.448).
  7. Ignoring that the service must keep operating (R26 p.683).
  8. Unknowns hidden instead of recorded (R13 p.565).
- **Figure.** A two-column error → correction table.
- **Sources.** As listed.

#### S2.14 Where this goes: Week 7 and Week 14 (2 min)
- **Purpose.** Continuity.
- **Content.** Week 7 integrates the roadmap into the Systems Thinking Engineering Package and presents it. Week 14 models one increment as a change to the team's SysML v2 model and assesses its impact from the model.
- **Figure.** Three-lane trace: Week 6 roadmap → Week 7 package → Week 14 model change.
- **Sources.** Course schedule (course convention).

### Section H: Laboratory launch (22 min)

#### S2.15 Lab L6 brief (3 min)
- **Purpose.** Unambiguous instructions.
- **Content.** Deliverables (§5.5): the roadmap (three horizons, at least three increments including the baseline and at least one technology insertion), a known-unknowns record (at least four entries), a roadmap graphic with text equivalent, AI usage statement. Due before Week 7 Session 1.
- **Figure.** One-slide checklist with minimums and lead roles.
- **Sources.** Course convention.

#### S2.16 Team work: baseline and gaps (10 min)
- **Purpose.** Lab step 1 in the room.
- **Content.** Teams write their "as is" baseline in five lines and list their top three capability gaps with a horizon each, drawing on their Weeks 1–5 package.
- **Figure.** Timer; the S2.7 grid as a worksheet.
- **Sources.** R12 p.862.

#### S2.17 Instructor check: the first increment and its trigger (7 min)
- **Purpose.** Lab step 2: catch the commonest error early.
- **Content.** Each team states its first increment, its trigger and the unknown that gates it (about 60–80 s for five teams). The instructor accepts or asks for a measurable trigger.
- **Figure.** A three-line card: increment / trigger / gating unknown.
- **Sources.** Course convention.

#### S2.18 Close: the next seven days (2 min)
- **Purpose.** Work plan.
- **Content.** Out-of-class sequence (§5.4); quiz and individual exercise open after this session; log hours.
- **Figure.** Seven-day timeline with owner initials.
- **Sources.** Course convention.

#### S2.19 References and credits (0 min, generated)

**Session 2 running total**

| Section | Slides | Minutes | Cumulative |
|---|---|---|---|
| F Transition | S2.1–S2.6 | 20 | 20 |
| G AeroLink worked example | S2.7–S2.14 | 27 | 47 |
| *Lecture subtotal* | *14 slides* | *47* | |
| H Lab launch | S2.15–S2.18 | 22 | **69** |
| Buffer | | 6 | **75** |

## 4. AeroLink worked example (summary table for the lesson)

All content is FICTIONAL. Horizons and Increment 2–3 content are **(proposed, instructor to confirm)**.

> **Superseded 2026-10-21 (review M1).** The table below is the original plan. As built, Increment 0 is the baseline
> trajectory including the committed Year-2 step (row 1 below), Increment 1 is "Resilient hubs" (storage, leasing),
> Increment 2 is "Data-ready, integrated network" (AI-001, workload evidence, ticketing, capacity step), Increment 3 is
> autonomy. The authoritative values are generated from `aerolinkCase.ts` (see the lesson and the worked-examples page).

| Increment | Horizon | Content | Gap / need / MGO served | Entry trigger | Gating unknowns and risks | Off-ramp | Transition approach |
|---|---|---|---|---|---|---|---|
| 0 Baseline | Entry into service | 12 aircraft; 6 vertiports (3 hubs); piloted; one platform with hot standby | MGO-001 | — | U-001 weather limits; R-001 | — | — |
| 1 Year-2 capacity | Near (to month 24) | +4 aircraft; fourth hub by charger upgrade (ALT-004) | MGO-007 gap 240 → 300 trips/day; NEED-005 | A-003 confirmed (TRL 6 report); U-002 connection agreed | U-002, R-005, R-001 reduced, R-002 rises | Different spoke site (proposed) | Phased at one site; other hubs carry turnaround (proposed) |
| 2 Prepare autonomy, integrate | Mid (years 3–5, proposed) | AI-001 and AI-002 matured; O-001 integrated ticketing; O-002 charger leasing | NEED-001, NEED-005, NEED-013 (proposed trace) | A-006 re-forecast; transport authority agreement (A-008, O-001) | A-008 unconfirmed | Keep separate ticketing | Continuous integration on the platform (proposed) |
| 3 Autonomous operations | Far (years 5–10, proposed) | Remote or autonomous flight operations (TECH-003) | CON-009, NEED-013; crew cost (TECH-003 benefit) | TECH-003 ≥ TRL 6 (R-006 review); approving authority engaged | A-005, R-006 | Stay piloted | Block deployment after evidence (proposed) |

## 5. Laboratory outline: Lab L6, the enterprise evolution roadmap

### 5.1 Inputs
- The team's Weeks 1–5 package: needs and MGOs; ConOps and requirements; readiness assessment, risk register and trade-study decision; architecture and information view; component breakdown and interface table.
- Session 1–2 slides and the long-form lesson, especially the worked roadmap (§4).
- Readings (essential): R12 pp.860–863 (4 pp); P6-1 pp.528–531 (4 pp); P6-2 pp.582–585 (4 pp); P6-3 pp.447–449 (3 pp); R26 pp.680–684 (5 pp). Extension: P6-4 pp.390–393; R60 pp.523–526; R62 p.345.

### 5.2 Objectives
W6.1, W6.2, W6.3 and W6.5 applied to the team's own enterprise.

### 5.3 Method
1. Baseline ("as is") from the Weeks 1–5 package.
2. Capability gaps by horizon (near, mid, far, with the team's own justified bucket lengths; R12 p.862).
3. Candidate changes from the gaps and from the Week 3 opportunities; technology table (available / in development / not existing; P6-1 p.529).
4. Increments: content, trigger, dependencies, off-ramp, development approach and transition approach (S1.10–S1.13, S2.2–S2.6).
5. Known-unknowns record: impact, information need, mitigation, gated increment (S1.19).
6. Impact list for one increment across the team's own Weeks 1–5 IDs (S2.12).
7. Update the AROU register: new risks, opportunities and unknowns linked to increments.

### 5.4 Procedure

| Step | When | Lead role | Output |
|---|---|---|---|
| 1 Baseline and top three gaps | In class (S2.16) | Whole team | Part 1 draft |
| 2 First increment and trigger checked | In class (S2.17) | Architecture lead presents | Instructor note |
| 3 Gap analysis completed for three horizons | Days 1–2 | Requirements & Compliance | Part 1 |
| 4 Technology table and insertion points from the Week 3 readiness assessment | Days 2–3 | AI & Data Management (Architecture in 3-person teams) | Part 2 |
| 5 Increments with triggers, dependencies, off-ramps, transition approach | Days 3–4 | Architecture | Part 3 |
| 6 Known-unknowns record; AROU update with links | Days 4–5 | Verification & Validation | Part 4 |
| 7 Impact list for one increment | Day 5 | Each member traces the IDs they own | Part 5 |
| 8 Roadmap graphic with text equivalent | Day 6 | Architecture | Part 6 |
| 9 AI usage statement; integration review; upload | Day 7 | V&V lead | Submission |

### 5.5 Outputs
`team-NN-week6-roadmap.md` (Parts 1–6 and AI statement) and the updated `team-NN-arou.md`; the roadmap graphic as an image with its text equivalent. Suggested length: 4–6 pages plus the graphic.

### 5.6 Rubric rows (from ASSESSMENT_RUBRICS.md)

| Row | Criterion | Applied this week |
|---|---|---|
| RB-15.4 | Roadmap | Yes: near/mid/long states, technology insertions with maturity rationale, capability evolution, opportunities |
| RB-15.3 | Known unknowns | Yes: impact, information need and mitigation for each unknown |
| RB-5.4 | Treatment and AROU | Yes, for the new or changed AROU items (owner, trigger, distinct A, R, O, U) |
| RB-5.5 | Linkage | Yes: each new item linked to the affected REQ, PHY or SCN, and here also to an increment |
| RB-12.1–12.3 | AI usage statement | Yes |
| RB-15.1, 15.2 | Resilience, security | **Not applied** (no whiteboard week; faculty decision §10) |

Note: RB-15 is labeled "A1 Week 13; B awareness" in the rubric file; using it in Week 6 is a re-mapping for faculty to confirm.

### 5.7 Per-student workload (budget about 8 h)

| Activity | Hours | Basis |
|---|---|---|
| Class (2 × 75 min) | 2.5 | Timetable |
| Readings, 20 pp at about 15 pp/h | 1.3 | §5.1 |
| Lesson handout review | 0.4 | About 4,000 words |
| Candidate change before Session 2 | 0.3 | S1.21 |
| Lab, the student's share of steps 3–9 | 2.3 | About 9 person-hours per team of 4 (gaps 1.5; technology table 1.5; increments 2.5; unknowns and AROU 1.5; impact 1.0; graphic and integration 1.0) |
| Quiz | 0.3 | 10 items |
| Individual applied exercise | 0.6 | 35 min plus upload |
| Time log | 0.1 | |
| **Total** | **7.8** | Within budget. A 3-person team carries about 3.0 h of lab each (8.5 h total) unless the minimum drops to three increments including the baseline and three unknowns (faculty decision) |

## 6. Assessment outline (separate from the lecture)

Items use unseen contexts (not AeroLink): a regional water utility adding smart meters, a hospital network adopting telemedicine, a city bike-share adding electric bikes.

### 6.1 Quiz Q6 (individual, 15 min, closed book, 10 items)

| # | Objective | Bloom | Item focus | Key rests on |
|---|---|---|---|---|
| 1 | W6.1 | Understand | What a capability gap is, and what an "excess" is | R12 p.862 |
| 2 | W6.1 | Apply | Assign three bike-share changes to near/mid/far with a stated reason | R12 p.862 |
| 3 | W6.4 | Analyze | Water utility: is a stated plan a development approach or an enterprise roadmap? | P6-4 p.391 |
| 4 | W6.4 | Analyze | Which evolutionary approach fits when the end functionality is unknown? | P6-2 p.583 |
| 5 | W6.2 | Understand | What a TRL does not assess | R60 p.525 |
| 6 | W6.2 | Evaluate | Telemedicine: choose the insertion point that balances maturity, insertability and timing | P6-3 p.449 |
| 7 | W6.1 | Apply | Identify the missing element in an increment (no trigger / no off-ramp) | R46 p.126; P6-1 p.530 |
| 8 | W6.3 | Apply | What backward compatibility requires during a service change | R26 p.682 |
| 9 (SA) | W6.5 | Apply | Write a known-unknown entry (impact, information need, mitigation) | R13 p.565; course convention |
| 10 (SA) | W6.3 | Analyze | Explain why a modification at component level must not change system-level requirements, and what to do if it does | R26 p.684 |

Scoring: 1 point items 1–8, 2 points items 9–10; total 12. Distractors from the common-error list (S2.13); keys balanced across positions.

### 6.2 Individual applied exercise (about 35 min, open book)
Case brief (about 250 words, FICTIONAL): a city bike-share with a baseline fleet, a proposed electric fleet, an untested battery-swap technology and an unknown grid tariff. Tasks: state baseline and two gaps with horizons; plan two increments with trigger, dependency and off-ramp; record two known unknowns; justify one insertion point against maturity, insertability and timing. Rubric: four criteria at four levels (gaps; increments; unknowns; insertion justification).

### 6.3 Graduate task (required notebook entry)
Roadmap sensitivity memo (one page): for the team's own roadmap, identify the trigger or unknown that would move an increment by a full horizon, trace the impact set of that increment across the Weeks 1–5 IDs, and state which earlier decision (for example the Week 3 trade) would need to be re-run.

## 7. Continuity to Phase II

- **Week 14 (Final Presentation; schedule rule 6: Week 14 ↔ Weeks 6 and 7).** One roadmap increment becomes a model change: the earlier lab sequence's last lab adds "Autonomous Flight Operations" and updates requirements, architecture, operations, interfaces and risks, producing an evolution package and an autonomy impact assessment. The Week 6 impact list (S2.12) is the checklist for that change.
- **Week 13 (Trade Study / Analysis)** may reuse the triggers as analysis cases (what if demand changes).
- Phase II readings named only (not taught here): R77 pp.116–119; R78 (standard views).

## 8. Source gaps

- No source in the collection gives a roadmap template or graphic convention; the lane layout and horizon choices are course conventions.
- DoD technology readiness assessment guidance and NASA TRL definitions are cited by the sources but not held; TRLs come only via SEBoK's table (R16 p.767).
- Integration and system readiness levels are named (R16 p.768) without a scale.
- Technology roadmapping literature (for example industrial roadmapping methods) and ISO/IEC/IEEE 24748-1 (life cycle management, cited P6-4 p.393) are not in the collection.
- Resilience and security (the course document's Deliverable 14) have no whiteboard week; R24 and R25 are registered but not used here.
- The INCOSE UK guidance on in-service systems cited by R26 is not held.

## 9. Register additions needed

All pages below were opened in `_source_cache` for this outline.

| Proposed ID | Source, PDF pages | Title | Used on slides | Verification note |
|---|---|---|---|---|
| P6-1 | MITRE SEG pp.528–531 | Technology Planning | S1.14–S1.16, S2.7, S2.13; quiz 7 | Title on p.528; body pp.529–531 (references on p.531). **Register correction:** R60 (pp.523–531) spans two articles; narrow R60 to pp.523–526 (Assessing Technical Maturity; references p.527) and add P6-1 |
| P6-2 | MITRE SEG pp.582–585 | Evolutionary Acquisition | S1.11–S1.12, S2.10–S2.11, S2.13; quiz 4 | Definition p.582; two approaches p.583; lessons pp.583–585; references p.585 |
| P6-3 | MITRE SEG pp.447–449 | Implementation, O&M, and Transition | S2.2–S2.3, S2.13; quiz 6 | Topic-level article (definitions p.447, lessons pp.448–449) |
| P6-4 | SEBoK pp.390–393 | Development Approaches (KA intro, p.390) and Development Approach Concepts (pp.391–393) | S1.10; quiz 3 | Two headings: verify against the KA heading on p.390 and the article title on p.391; consider splitting a/b |
| P6-5 | MITRE SEG pp.130–133 | Architectures Federation | S1.9 | Only pp.131–132 used (EA as as-is/to-be snapshots plus investment roadmap) |
| P6-6 | SEBoK p.1445 | Architecture (glossary) | S1.4 | Definition (1) from 15288:2015 |
| R26 correction | SEBoK pp.680–684 | Capability Updates, Upgrades, and Modernization | S2.4–S2.5 | The article body (F3I, ECPs, modernization reasons 1–2) begins on p.680; the register starts at p.681. Change the first page to 680 (the verifier's running-header check still passes) |

**Week 6 essential readings, proposed:** R12 pp.860–863; P6-1; P6-2; P6-3; R26 pp.680–684. **Extension:** P6-4; R60 pp.523–526; R62 p.345; R46 p.126.

## 10. Open items for faculty

1. Accept W6.4 and W6.5; map RB-15.3/15.4 to Week 6 (rubric file assigns RB-15 to another pathway's Week 13).
2. Where resilience and security (Deliverable 14, RB-15.1–15.2) sit, since no whiteboard week names them.
3. Confirm the AeroLink horizons and Increments 2–3 (all proposed), and whether Increment 3 is the autonomy increment Week 14 will model.
4. 3-person team minimums (§5.7).
5. Approve P6-1..P6-6 and the R60 and R26 register corrections.
6. Reference-data wording uses the old week numbering (see the parent report): TECH-003, A-005 and R-006 say "Week 14 evolution"; A-002, A-007 and U-002 say "before the Week 7 trade study"; U-001 says "Before CP2 requirements baseline (Week 6)". Under the new schedule these are Week 6 (roadmap), Week 3 (trade study) and Week 2 (requirements). Fix in the data or annotate.
