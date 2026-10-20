# Week 9 Lecture Outline: Needs / Requirements

**Status.** Draft for faculty approval (COURSE_PRODUCTION_PLAN M2, outlines for Weeks 2–14). Written 2026-10-19. New, pending review. Nothing here is in `src/` yet.
**Governing documents.** DECISION_LOG A19 and A20; COURSE_SCHEDULE.md (Week 9 subject, exact; instructional rules 2, 3, 4 and 6); COURSE_PRODUCTION_PLAN.md (definition of done A–I); the Week 1 template and its review lessons (`../week01/REVIEW_DISPOSITIONS.md`).
**Format.** Two sessions of 75 minutes each, planned as 69 minutes of content plus a 6-minute buffer.
- Session 1 is all lecture: 23 slides plus a generated "References and credits" slide (0 min).
- Session 2 is 47 minutes of lecture (15 slides) followed by 22 minutes of laboratory launch (4 slides), plus the references slide.
- Total: 42 content slides.

## 0. Conventions used in this outline

- **Citations.** `R83 p.168` = verified register entry R83, PDF page 168 of the SysML v2.1 Beta 2 (Release 2026-07) language specification (S06). `R74 sl.89` = slide 89 of the OMG SST textual-notation deck, release 2026-08 (S10; a slide is a PDF page). SEBoK, DoD and MITRE pages are PDF pages (DECISION_LOG W1). The specification is never called "the standard" (W4).
- **Proposed register additions** are written `PX7 pp.580–583` (shared placeholder, used by several Phase II outlines) or `P9.1` (this week only). §10 lists them. Each page was opened for this outline.
- **Every SysML v2 claim** below was checked against the page text in `_source_cache/` on 2026-10-19. A citation supports only what is written beside it.
- **Recorded checker behavior** (what release 2026-08 accepts or rejects) comes from the recorded runs of 2026-10-11 (`sysml/validation-report.json`; probe list in `docs/authoring/week10_notes.md`, old numbering). It describes that release only, and it is not literature.
- **Course convention** marks a modeling choice the course makes that the SysML texts do not prescribe (for example, the subject of a stakeholder requirement is the enterprise).
- **AeroLink** values are FICTIONAL and come from `sysml/reference/aerolink_v01_skeleton.sysml` (NEED, MGO, CON), `aerolink_v02_req_structure.sysml` (REQ-STK-001..010, REQ-SYS-001..010, groups, derivations) and `src/model/reference/week03.ts`, `week04.ts` (old numbering). Nothing is retyped from memory. Anything new is marked **(proposed, instructor to confirm)**.
- **Student-facing text.** Slide faces, notes and the lesson carry no internal IDs (decision-log IDs, FD numbers, source codes S01–S13, P-numbers, old week numbers, objective codes). These appear only in the Sources lines and faculty sections of this outline.
- **Pacing.** Spoken faculty notes, when written, stay at or below 130 words per minute on every slide (Week 1 lesson); definitions on slides are short verified quotations.
- **The central rule this week.** A `satisfy` usage *asserts* that a requirement is satisfied when its subject is bound to the satisfying feature (R83 p.168). A checker PASS shows that the text parses and validates; it does not show that the requirement is correct, measurable, or met.

## 1. Learning objectives (graduate level)

| ID | Objective | Bloom | Taught in |
|---|---|---|---|
| B9.1 | Explain why a requirement is a constraint in SysML v2, and distinguish its informal text (doc), its requirement ID (short name) and its formal required constraint | Understand | S1.6–S1.10 |
| B9.2 | Model stakeholder needs and mission objectives as requirements with a subject, stakeholder parameters and framed concerns, continuing the Week 8 stakeholder model | Apply | S1.12–S1.14 |
| B9.3 | Model stakeholder and system requirements as requirement usages (and, where several share a form, as usages of a requirement definition), with subject, bound parameters, assumptions where justified, groups and requirement metadata | Apply | S1.7–S1.11, S1.15–S1.17; S2.5–S2.7 |
| B9.4 | Relate needs and requirements with derivation connections and dependencies, and explain what each relationship asserts and what it does not | Analyze | S1.18–S1.21; S2.8–S2.9 |
| B9.5 | Evaluate a set of modeled requirements for well-formedness and intent (requirement verification and requirement validation), using AI-generated findings as candidates that the team accepts or rejects with reasons | Evaluate | S2.3–S2.4, S2.10–S2.13 |
| Graduate | Critique the assume/require form of one team requirement: is the condition a gate on applicability or a reference condition on the quantity, and what does a later `satisfy` then claim? | Evaluate | S2.7; assessment §6.2 |

Continuity with the earlier draft material: B9.3 and B9.4 rework the requirements half of the reviewed draft objectives "model requirements with subject, constraint and short-name ID" and "relate design with satisfy and explain what it asserts"; the structure half moves to Week 11.

## 2. Session 1: Requirements as model elements (75 min, all lecture)

**Design rationale.** Week 8 built the model skeleton and imported stakeholders and concerns. Session 1 teaches the requirement construct from the specification upward: constraint, definition and usage, subject, ID, doc and constraint, assumptions, stakeholders and concerns, groups, metadata, derivation, and a first, careful look at `satisfy`. Each construct is shown on AeroLink, using the reference model's own text. Two think-pair-share prompts; no team work (A20: teach first).

### Section A: Framing (7 min)

#### S1.1 Week 9 at a glance (2 min)
- **Purpose.** Orient students: subject, two sessions, outcomes.
- **Content.**
  - Subject, exactly as scheduled: *Needs / Requirements*.
  - This week the needs from Week 1 and the requirements from Week 2 become model elements that the rest of Phase II will trace to.
  - Session 1: the requirement construct. Session 2: quality, worked examples, AI-assisted review, lab launch.
  - The week's output: a Needs package and a Requirements package in the team model, with derivations to the Week 8 stakeholders and concerns.
- **Figure.** Phase II strip, Weeks 8–14, with Week 9 highlighted; two arrows rise from the Phase I lane: "Week 1 needs" and "Week 2 requirements" into "Needs" and "Requirements" packages.
- **Sources.** COURSE_SCHEDULE.md (schedule, rule 6). Course convention (package names follow the reference model, `sysml/reference/README.md` §2).

#### S1.2 Driving question: what can the model know about a requirement? (3 min)
- **Purpose.** Create a need to know.
- **Content.**
  - Two teams model the same AeroLink requirement: "The charging system shall charge an aircraft … to the dispatch threshold within 20 min."
  - Team A writes it as a requirement element whose only content is that sentence. Team B adds a subject (the charging system), a limit of 20 min and a constraint comparing the charging system's charge time with the limit.
  - Vote: (A) the two models say the same thing; (B) Team B's model says more; (C) Team B's model proves the design meets the requirement; (D) only Team A's model is a requirement.
  - Answer withheld until S1.10 (B is right; C is the misconception the week dismantles).
- **Figure.** Two cards side by side, same sentence; card B has three extra lines highlighted (subject, attribute, constraint).
- **Sources.** AeroLink REQ-SYS-001 text and form, `aerolink_v02_req_structure.sysml` (FICTIONAL). Instructor-authored question.

#### S1.3 From documents to model: what Week 9 imports (2 min)
- **Purpose.** Make the continuity explicit (rule 6).
- **Content.**
  - Week 1 gave each team a stakeholder register, concerns and initial needs; Week 2 gave stakeholder and system requirements traced to those needs, with measures and verification methods.
  - Week 8 put the stakeholders and concerns into the model. Week 9 adds needs and requirements, and connects them to the concerns already there.
  - The IDs stay the same: NEED, REQ-STK, REQ-SYS. A requirement ID in the model is the same string the Week 2 table carries.
- **Figure.** Two lanes: Phase I documents (register, needs table, requirements table) and Phase II packages (Stakeholders, Needs, Requirements). Dashed arrows labeled with the ID prefix that crosses.
- **Sources.** COURSE_SCHEDULE.md rule 6. Requirement ID = short name: R83 p.165.

**Transition A → B.** "Before modeling anything, recall what a requirement is in systems engineering, because the language encodes that idea."

### Section B: Needs, requirements and models (5 min)

#### S1.4 Needs, requirements and the transformation between them (3 min)
- **Purpose.** Recall Week 1–2 theory in one slide and connect it to modeling.
- **Content.**
  - System requirements say what the system of interest must fulfill to satisfy the stakeholder needs, "expressed in an appropriate combination of well-formed textual statements and supporting models or diagrams" (R13 p.557).
  - Defining requirements is an exercise in engineering, not only in writing: every requirement is an engineering decision (R13 p.557).
  - A requirement statement is the result of a formal transformation of one or more needs or parent requirements into an agreed-to obligation (R13 p.558, quoting INCOSE NRM 2022).
  - So a requirement has a source (a need or parent) and a subject (the entity obliged). Both become model relationships this week.
- **Figure.** Three boxes: Need (stakeholder view) → transformation (analysis, decision) → Requirement (developer view, obligation on an entity); the arrow is labeled "traceable".
- **Sources.** R13 pp.557–558.

#### S1.5 What a model adds to a requirements table (2 min)
- **Purpose.** Motivate the requirement construct.
- **Content.** SEBoK lists what models add (R13 p.564):
  - completeness in terms of functions, inputs, sources, outputs and destinations;
  - communication;
  - interdependencies between requirements and the rest of the system data;
  - quantitative analysis and simulation.
  - In MBSE the requirement's well-formed text is part of a requirement model element (R13 p.564).
- **Figure.** A requirements table row and a model element side by side; from the model element, lines run to a stakeholder, a concern, a parent requirement and a design element.
- **Sources.** R13 p.564.

**Transition B → C.** "SysML v2 makes the requirement a model element by making it a constraint. That one decision explains most of the syntax."

### Section C: The requirement construct (27 min)

#### S1.6 A requirement is a constraint (3 min)
- **Purpose.** The foundational idea.
- **Content.**
  - "A requirement definition is a kind of constraint definition … that specifies stakeholder-imposed constraints that a design solution must satisfy to be a valid solution" (R83 p.161).
  - The required constraints may be informal "shall" statements or formal constraint expressions; optional assumed constraints restrict when the required ones apply (R83 p.161).
  - Because it is a constraint, a requirement evaluates to true or false; it is satisfied when it evaluates to true (R83 p.162).
  - The textual statement is given as a documentation comment; the requirement is formalized by required constraints; like a constraint definition it can be parameterized by features (R74 sl.86).
- **Figure / SysML v2 example.** A generic skeleton (no domain names) with three callouts: `doc` (informal text), `attribute` (parameters), `require constraint { … }` (formal). AeroLink appears from S1.8 onward.
- **Sources.** R83 pp.161–162; R74 sl.86.

#### S1.7 Requirement definitions and requirement usages (3 min)
- **Purpose.** Apply the Week 8 definition/usage pattern to requirements.
- **Content.**
  - A requirement usage is a usage of a requirement definition in some context: a package, a part or another requirement (R83 p.161).
  - A usage can redefine the definition's features; a definition then serves as a template that is "reused and tailored to each context of use" (R83 p.161, the MaximumMass example).
  - A requirement usage must be defined by a single requirement definition (R83 p.165).
  - A usage will often bind the definition's parameters to specific values (R74 sl.89).
  - Course convention: write a requirement definition only when several requirements share a form; otherwise write usages directly in the Requirements package, as the reference model does for all twenty AeroLink requirements.
- **Figure.** One definition card ("latency within a limit") with three usage cards beneath it, each binding a different limit (60 s, 2 min, 30 s).
- **Sources.** R83 pp.161, 165; R74 sl.89. AeroLink values: REQ-SYS-005, -008, -009 (FICTIONAL).

#### S1.8 The subject: what the requirement is about (3 min)
- **Purpose.** The most consequential modeling decision for each requirement.
- **Content.**
  - "A requirement definition or usage always has a subject, which is a distinguished parameter that identifies the entity on which the requirement is being specified" (R83 p.161).
  - A requirement usage can only be satisfied by an entity that conforms to its subject's definition (R83 p.161).
  - If no subject is declared, it is implicitly `Anything` (R83 p.162). The subject is the first parameter and must be declared before any other parameter (R83 p.166).
  - The subject can have any kind of definition, for example a port or an action (R74 sl.88).
  - Course convention (from the reference model): a stakeholder requirement's subject is the enterprise, because it constrains the service as a whole; a system requirement's subject is the element the "shall" is about, for example `chargingSystem : Physical::ChargingSystems` for REQ-SYS-001.
- **Figure.** REQ-SYS-001 with an arrow from `subject` to the ChargingSystems definition; three candidate satisfiers below, two that conform (PHY-003, a specialization) and one that does not (the aircraft), marked with ✓/✗.
- **Sources.** R83 pp.161–162, 166; R74 sl.88. AeroLink: `aerolink_v02_req_structure.sysml` lines 417–421 (FICTIONAL).

#### S1.9 The requirement ID and the informal text (2 min)
- **Purpose.** Keep the Phase I IDs stable in the model.
- **Content.**
  - The informal text of a requirement is given by its documentation comments; if the requirement has a short name, "this is also considered to be its requirement ID" (R83 p.165).
  - A short name is written between `<` and `>` before the name; the name should be descriptive, the short name abbreviated (R80 p.49).
  - Course convention: the ID is a quoted short name, the official title is the declared name: `requirement <'REQ-SYS-001'> 'Charge to dispatch threshold in 20 min'`. References use the short name: `Requirements::'REQ-SYS-001'`.
  - The doc text is the Week 2 statement, word for word, so the table and the model cannot drift.
- **Figure.** One declaration line with four labeled parts: keyword, short name (ID), declared name, body.
- **Sources.** R83 p.165; R80 p.49. Reference convention: `sysml/reference/README.md` §3.1.

#### S1.10 Doc alone is not enough: the required constraint (3 min)
- **Purpose.** Answer the driving question.
- **Content.**
  - A requirement whose only content is a doc comment is still a constraint, but there is nothing for the model to evaluate.
  - Write the Week 2 measurable criterion as the required constraint, over a feature of the subject: `require constraint { chargingSystem.chargeTimeToDispatch <= maxChargeTime }`.
  - Answer to S1.2: (B). Team B's model says more: the requirement now names the quantity and the limit. It does not prove the design meets it (C is wrong): that needs a `satisfy` claim, consistent values, and, later, verification evidence.
  - A requirement with a TBD limit keeps its constraint and records the TBD (S2.6).
  - The course rubric treats "requirements as comments" as the lowest level of requirements semantics.
- **Figure / SysML v2 example.** REQ-SYS-001 as in the reference (subject, `attribute maxChargeTime : DurationValue = 20 [min];`, require constraint, doc), five lines, with the driving-question vote result beside it.
- **Sources.** R83 p.161, p.165; ASSESSMENT_RUBRICS.md RB-8.4 level 1 (faculty-only). Listing: reference v0.2 lines 417–421 (PASS in the 2026-10-11 checker run; FICTIONAL).

#### S1.11 Assumptions: when the requirement applies (3 min)
- **Purpose.** Teach assume/require precisely.
- **Content.**
  - The effective constraint of a requirement is a logical implication: "if all the assumption constraints are true, all the required constraints must be true" (R83 p.165).
  - Required and assumed constraints are declared with the keywords `require` and `assume` (R83 p.165); a requirement definition may specify one or more assumptions (R74 sl.87).
  - Formally, a requirement is satisfied for a subject if, when all its assumed constraints are true, all its required constraints are true (R74 sl.91).
  - Consequence (course reasoning, not the source): "if A then R" demands nothing where A is false. Every assumption marks a region the requirement deliberately does not cover; someone must decide whether another requirement covers it.
- **Figure.** A truth-table strip: A true/R true → satisfied; A true/R false → violated; A false → satisfied whatever R.
- **Sources.** R83 p.165; R74 sl.87, sl.91. Course reasoning labeled.

#### S1.12 Actors and stakeholders as requirement parameters (3 min)
- **Purpose.** Connect requirements to the Week 8 stakeholder model.
- **Content.**
  - Actors and stakeholders are additional distinguished parameters of a requirement; they are part usages, so they must be defined by part definitions (R83 pp.162, 166).
  - An actor is a role "played by an entity external to the subject … but necessary for the satisfaction of the requirement"; its features may be used in the assumed constraints (R83 p.162).
  - A stakeholder parameter is a role played by an entity having concerns related to the requirement (R83 p.162).
  - This is why Week 8 modeled each stakeholder class as a part definition: it can now be the type of a `stakeholder` parameter.
- **Figure.** A requirement card with three parameter slots: subject (the entity obliged), actor (external, needed for satisfaction), stakeholder (has concerns).
- **Sources.** R83 pp.162, 166. Week 8 convention: STK as part def (`sysml/reference/README.md` §3.2).

#### S1.13 Concerns and framing (3 min)
- **Purpose.** Show how a need addresses a concern already in the model.
- **Content.**
  - A concern definition is a kind of requirement definition that represents a stakeholder concern; its stakeholder parameters delineate the stakeholders who have it (R83 p.162).
  - A requirement can frame concerns: "All the framed concerns of a requirement must then be addressed for the requirement to be satisfied" (R83 p.162).
  - A framed concern is a subrequirement declared with the keyword `frame`, and so is automatically a required constraint of the requirement that frames it (R83 p.167).
  - Teaching point: framing is a strong statement. A need that frames a concern claims that satisfying the need addresses that concern. Frame only the concerns the need actually answers.
- **Figure.** The Week 8 concern CON-001 (passenger wait) with a `frame` arrow from NEED-001; a second, faint arrow from NEED-001 to an unrelated concern, crossed out.
- **Sources.** R83 pp.162, 167. AeroLink: NEED-001 frames CON-001 (`aerolink_v01_skeleton.sysml` lines 227–232, FICTIONAL).

#### S1.14 Modeling needs and mission objectives (4 min)
- **Purpose.** The first half of the AeroLink worked example: the Needs package.
- **Content.**
  - Course convention (reference model): a NEED and an MGO element are modeled as requirement usages with the enterprise as subject. A need declares its stakeholder and frames the concerns it answers; its doc carries the need statement, its conditions and its rationale.
  - MGO objectives carry their target values as attributes (MGO-005: `maxWait = 15 [min]`, `minShareBoarded = 0.90`), so later measures can bind to them.
  - Why a need is a requirement element even though it is not a "shall": SysML v2 has no separate need construct; a requirement usage with an informal doc and framed concerns is the closest construct, and the doc keeps the stakeholder's wording. This is a course modeling choice (label it).
  - Think-pair-share (1 min): which concern(s) should NEED-004 (pads not limited by turnaround) frame, and who is its stakeholder?
- **Figure / SysML v2 example.** Excerpt of NEED-001 from the reference, six lines: short name, name, doc (shortened on the slide with "…"), `subject enterprise : Context::AeroLinkEnterprise;`, `stakeholder passengers : Stakeholders::'STK-001';`, `frame Stakeholders::'CON-001';`.
- **Sources.** R83 pp.162, 167. Excerpt: `aerolink_v01_skeleton.sysml` lines 175–232 (PASS in the 2026-10-11 checker run; FICTIONAL). Course convention labeled.

#### S1.15 Requirement groups (3 min)
- **Purpose.** Organize requirements without changing their meaning by accident.
- **Content.**
  - A requirement may group other requirements, by reference (`require …`) or by composition (nested requirement usages) (R74 sl.90).
  - By default, grouped requirements take the group's subject; a grouped requirement's subject can also be bound explicitly; grouped requirements are treated as required constraints of the group (R74 sl.90; R83 p.167).
  - So a group is itself a requirement: satisfying it means satisfying every member (R83 p.161) on the one subject the satisfy binds.
  - Consequence (course reasoning): a group whose members keep different subjects is a collection for organization. No single element conforms to all of them, so it is never satisfied as a whole; satisfy its members instead. The reference model's `systemRequirements` group is of this kind.
- **Figure.** Two group shapes: "specification group" (one subject, members inherit it) and "organizing group" (members keep their own subjects), each with a one-line rule.
- **Sources.** R74 sl.90; R83 pp.161, 167. AeroLink: groups `stakeholderRequirements`, `systemRequirements` (v0.2 lines 501–527).

#### S1.16 Worked example (a): three latency requirements from one definition (4 min)
- **Purpose.** See definition, usage, subject, binding, ID and group together.
- **Content.**
  - REQ-SYS-005 (assignment within 60 s), REQ-SYS-008 (no-go flag within 2 min), REQ-SYS-009 (fire alarm within 30 s) share one form: a measured latency shall not exceed a limit.
  - `requirement def LatencyLimit` has two parameters and one required constraint, and no subject (so `Anything`).
  - Each usage declares the ID as short name, the Week 2 statement as doc, its own subject, and binds both parameters: `attribute :>> latency = scheduling.assignmentLatencyP99; attribute :>> latencyLimit = 60 [s];`.
  - Without the redefinition of `latency` as a feature of the subject, the constraint would read nothing the design has, and a later `satisfy` could not connect to any design value.
  - The group `latencyRequirements` organizes the three; it is never satisfied as a whole (three different subjects).
- **Figure / SysML v2 example.** The existing listing, lines 16–29 on the slide (definition and REQ-SYS-005); the other two usages in the handout.
- **Sources.** R74 sl.86–90; R83 pp.161, 165–166. Listing `sysml/week10/aerolink_requirement_def_usage.sysml` (PASS in the 2026-10-11 checker run; FICTIONAL). Reused from the reviewed draft worked example (a).

#### S1.17 Requirement attributes and metadata: rationale, method, status (3 min)
- **Purpose.** Carry the Week 2 requirement attributes into the model.
- **Content.**
  - Metadata is defined by a metadata definition and applied as an annotation to model elements (R77 sl.108).
  - The library `ModelingMetadata` provides `Rationale` (with a required `text`), `Issue`, `StatusInfo` (with `status`, optional `owner`) and the enumeration `StatusKind` (`open`, `tbd`, `tbc`, `done`, `closed`, …) (PX8 pp.555–557).
  - The verification-method kinds `inspect`, `analyze`, `demo`, `test` are an enumeration in the verification library (R84 p.175).
  - Course convention (reference model): a local metadata definition `RequirementAttributes` (level, type, method as `VerificationMethodKind`, criterion), `@Rationale { text = "…"; }`, and `@StatusInfo { status = StatusKind::tbd; … }` on TBD requirements.
  - Rationale explains why; it does not restate the requirement (Week 2).
- **Figure / SysML v2 example.** REQ-STK-001 annotations from the reference (two lines), with callouts to the Week 2 table columns they replace.
- **Sources.** R77 sl.108–109; PX8 pp.555–557; R84 p.175. Excerpt: reference v0.2 lines 331–344.

**Transition C → D.** "A requirement alone is half the story. The other half is where it came from and what is claimed about it."

### Section D: Relationships around requirements (21 min)

#### S1.18 Derivation: the library connection (3 min)
- **Purpose.** Model "derives from" with its defined semantics.
- **Content.**
  - The Requirement Derivation library defines a `Derivation` connection: it "asserts that one or more derivedRequirements are derived from a single originalRequirement. This means that any subject that satisfies the originalRequirement should, in itself or though other things related to it, satisfy each of the derivedRequirements" (PX7 p.580; the "though" is the source's spelling).
  - All its ends must be requirement usages; one end is the original, the rest are derived (PX7 p.580). Its constraint: whenever the original is satisfied, all the derived requirements must also be satisfied (PX7 p.581).
  - Metadata short names: `#derivation` for the connection, `#original` and `#derive` for its ends (PX7 pp.582–583).
  - Teaching point: the direction reads "the parent's satisfaction implies the child's". That is the reverse of the intuition "satisfy the children to satisfy the parent". Ask what each modeler means before drawing the arrow.
- **Figure / SysML v2 example.** From the reference: `#derivation connection 'REQ-SYS-001 derives-from REQ-STK-005' { end #original ::> Requirements::'REQ-STK-005'; end #derive ::> Requirements::'REQ-SYS-001'; }`.
- **Sources.** PX7 pp.580–583. Excerpt: reference v0.2 (Traceability package; PASS in the 2026-10-11 checker run).

#### S1.19 Dependencies and refinement (3 min)
- **Purpose.** Know the weaker relationships and when they are the honest choice.
- **Content.**
  - A dependency indicates that client elements require supplier elements for their complete specification; "a dependency is entirely a model-level relationship, without instance-level semantics" (R76 sl.105).
  - `Refinement` metadata identifies a dependency as a refinement: the source elements give a more precise or accurate representation than the targets (PX8 p.556).
  - Course convention (reference model): derivation between two requirements uses `#derivation`; links whose ends are not both requirements (for example CAP derives from NEED) use a user-defined `#derivesFrom` dependency; capability decomposition uses `#refinement` dependencies.
  - Rule of thumb (course): use the strongest relationship whose semantics you can defend; use a dependency when you only claim "this was written from that".
- **Figure.** A ladder of relationship strength: dependency (model-level only) → refinement-tagged dependency → derivation connection (implication between satisfactions) → satisfy (assertion about a design).
- **Sources.** R76 sl.105; PX8 p.556. Reference conventions: `sysml/reference/README.md` §3.3 (faculty-only).

#### S1.20 The course trace pattern from stakeholder to system requirement (4 min)
- **Purpose.** Give students one picture of the Phase II requirement thread.
- **Content.**
  - STK (part def) → CON (concern with stakeholder) → NEED (frames CON, names stakeholder) → REQ-STK (derives from NEED) → REQ-SYS (derives from REQ-STK) → later: satisfied by a design element (Weeks 11–12), verified by a verification case (Week 12).
  - AeroLink thread: STK-005 vertiport operators → CON-006 → NEED-004 → REQ-STK-005 (pad turnaround within 25 min) → REQ-SYS-001 (charge within 20 min).
  - Course convention: every REQ traces upward to a NEED or a parent REQ; every NEED to an STK; the deliberate exception NEED-011 (no child requirement) is the audit case in Session 2.
- **Figure.** The thread drawn left to right with the SysML keyword on each arrow (`stakeholder`, `frame`, `#derivation`, `#derivation`, dashed `satisfy` "Week 11", dashed `verify` "Week 12").
- **Sources.** Course convention. AeroLink IDs and links: reference v0.1/v0.2 (`frame` and derivation lines; FICTIONAL); upward-trace criterion RB-9.1 (faculty-only).

#### S1.21 A first look at satisfy: an assertion, not a trace link (4 min)
- **Purpose.** Prevent the most damaging misconception before students meet design elements.
- **Content.**
  - "A satisfy requirement usage is a kind of assert constraint usage … that asserts that a requirement is satisfied when a given feature is bound to the subject parameter of the requirement" (R83 p.162).
  - In the declaration, the satisfying feature follows `by`; the subject is bound to it, and the satisfy asserts the requirement "always evaluates to true" (R83 p.168).
  - A negated satisfy (`not satisfy … by …`) asserts that the feature does *not* satisfy the requirement (R83 p.168). It is just as strong a claim.
  - So `satisfy` belongs between a requirement and a design element, never between two requirements; and it should be written only when the team can defend the claim from what the model says. Weeks 11–12 do this properly.
  - A model whose values contradict a satisfy is inconsistent; verification (Week 12) supplies evidence that the real system makes the assertion true.
- **Figure.** Three arrows from REQ-SYS-001: `#derivation` up to REQ-STK-005 ("comes from"), `satisfy` across to PHY-003 ("is claimed met by", red border "assertion"), `verify` from a future verification case ("is checked by", grey).
- **Sources.** R83 pp.162, 168; R74 sl.91.

#### S1.22 What the checker checks, and what it cannot (3 min)
- **Purpose.** Calibrate trust in tool output from the first requirement onward.
- **Content.** Recorded behavior of release 2026-08 on requirement constructs:
  - Rejected: a requirement usage typed by two requirement definitions; a directed parameter or actor declared before the subject ("Subject must be first parameter."); a satisfy naming a requirement definition instead of a usage; requirement and satisfier swapped.
  - Accepted silently: a group whose members have different subjects, satisfied by one element; a satisfy whose satisfier's bound value violates the limit; a requirement with a doc and no constraint.
  - Rule for the course: zero errors is necessary, never sufficient. Read every requirement for subject, constraint and intent.
- **Figure.** Two-column table "Checker rejects / Checker accepts silently", four rows each.
- **Sources.** Rules: R83 pp.161, 165–166, 168. Recorded runs: `sysml/week10/invalid_pc9_satisfy_requirement_def.sysml`, `invalid_pc6_satisfy_reversed.sysml`, `invalid_pc5_satisfy_relaxes_limit.sysml` (each FAIL as intended in the 2026-10-11 run) and the probes listed in `docs/authoring/week10_notes.md` (faculty-only).

#### S1.23 Exit: one requirement, three questions (3 min)
- **Purpose.** Retrieval and preparation for Session 2.
- **Content.**
  - Individually, write one of your team's Week 2 system requirements as a requirement usage: ID as short name, doc, subject, required constraint.
  - Answer in one line each: What is its subject, and why that element? Is any condition in the text an assumption or a reference condition? Which need or parent does it derive from?
  - Bring it to Session 2; it is the first item of the lab.
- **Figure.** A fill-in card with the four fields and the three questions.
- **Sources.** Instructor-authored.

**Session 1 timing.** 1 (2) · 2 (3) · 3 (2) · 4 (3) · 5 (2) · 6 (3) · 7 (3) · 8 (3) · 9 (2) · 10 (3) · 11 (3) · 12 (3) · 13 (3) · 14 (4) · 15 (3) · 16 (4) · 17 (3) · 18 (3) · 19 (3) · 20 (4) · 21 (4) · 22 (3) · 23 (3) · references (0). **69 min + 6 min buffer = 75.**

## 3. Session 2: Quality, worked examples, AI-assisted review and the lab launch (75 min)

**Split.** About 47 minutes of lecture and worked examples, then 22 minutes of laboratory launch, following the Week 1 pattern.

### Section E: Retrieval and requirement quality (9 min)

#### S2.1 Warm-up: three declarations (2 min)
- **Purpose.** Retrieval of Session 1.
- **Content.** Three short declarations, unseen context (a library book-return kiosk): (a) a requirement with no subject and a constraint over an undeclared feature; (b) a requirement whose subject is the whole library service but whose "shall" is about the kiosk's scanner; (c) a correct usage. Pairs: which is correct, and what is wrong with the other two?
- **Figure.** Three cards; answers on the next slide.
- **Sources.** Instructor-authored; rules R83 pp.161–162, 166.

#### S2.2 Reveal (1 min)
- **Purpose.** Confirm the rules.
- **Content.** (a) constraint reads nothing the subject has; (b) subject mismatch: nothing at the kiosk level can be shown to satisfy it; (c) correct.
- **Sources.** R83 pp.161–162.

#### S2.3 Requirement verification and requirement validation (3 min)
- **Purpose.** Introduce the two quality questions applied to requirements themselves.
- **Content.**
  - Requirement verification asks whether the requirements are well-formed: do they have the characteristics and follow the rules the organization has defined (R13 p.566)?
  - Requirement validation asks whether they are the right requirements: do they communicate the intent of the needs and parents they were transformed from (R13 p.566)?
  - These are not the same as system verification and validation (R13 p.566), which Week 12 models.
  - Methods include peer review and comparison against characteristics and against the integrated set of needs (R13 p.566).
- **Figure.** Two magnifying glasses over one requirement: "well-formed?" (left) and "right intent?" (right, with an arrow back to the need).
- **Sources.** R13 p.566.

#### S2.4 What the model can check and what a reviewer must (3 min)
- **Purpose.** Separate tool checks from engineering judgement.
- **Content.**
  - DoD lists characteristics of good requirements, including unambiguous, traceable and verifiable (R48b p.144).
  - The model helps with some: traceable (every REQ has a derivation or dependency to a parent), a measurable criterion (a required constraint over a subject feature), a method (metadata).
  - It cannot judge others: whether the text is unambiguous, whether the limit is the right one, whether the subject is the right element. Those are review questions.
  - Defining the verification criterion and method when the requirement is written helps ensure it is verifiable; this information can be captured in the requirement's attributes (R13 p.566).
- **Figure.** Characteristic list with two columns, "model makes visible" / "reviewer decides", with ticks.
- **Sources.** R48b p.144; R13 p.566.

**Transition E → F.** "Now four worked examples from the AeroLink reference, each with one decision you will make for your own requirements."

### Section F: The AeroLink worked model, continued from Weeks 1–2 (22 min)

#### S2.5 Worked example (b): anatomy of a stakeholder requirement (4 min)
- **Purpose.** One complete stakeholder requirement.
- **Content.**
  - REQ-STK-001 (passenger wait to board): ID as short name; Week 2 statement as doc; subject the enterprise (course convention); `attribute maxWaitP90 : DurationValue = 15 [min];`; `require constraint { enterprise.passengerWaitP90 <= maxWaitP90 }`; `@RequirementAttributes` (stakeholder, performance, analyze, criterion); `@Rationale`.
  - Where each piece came from: Week 1 NEED-001 (via derivation), Week 2 requirements table (statement, criterion, method, rationale).
  - Students annotate a printout: draw the derivation to NEED-001 and the frame from NEED-001 to CON-001.
- **Figure / SysML v2 example.** The reference declaration (eight lines) with color-coded callouts to its Week 2 table row.
- **Sources.** R83 pp.161, 165; PX8 p.555; R84 p.175. Excerpt: reference v0.2 lines 337–344 (PASS in the 2026-10-11 checker run; FICTIONAL).

#### S2.6 Worked example (c): a requirement whose limit is still to be decided (4 min)
- **Purpose.** Model a TBD honestly.
- **Content.**
  - REQ-STK-010 and REQ-SYS-010 (vertiport charging power limit) depend on an open unknown (the grid connection limit). The reference keeps the constraint, leaves the value unbound and marks `@StatusInfo { status = StatusKind::tbd; owner = "…"; }`.
  - The trap (reasoning from the semantics, course): an assertion over an unbound feature does not mean "for every value"; it constrains the feature to values that make the assertion true, which a large enough limit always does. A later satisfy would then claim little.
  - The fix taught: bind the limit to the satisfier's configured value (`attribute connectionLimit : PowerValue = chargingSystem.connectionLimit;`), so the requirement says "the configured limit". **New fragment needed** (see §4).
  - Rule: a TBD is a recorded status with an owner and a closure event, never a missing constraint.
- **Figure.** Two versions side by side: "unbound limit (reads as: some limit exists)" and "bound to the configured limit (reads as intended)".
- **Sources.** PX8 pp.556–557 (StatusInfo, StatusKind); R83 p.168 (satisfy asserts). Excerpt: reference v0.2 lines 492–499. Course reasoning labeled; reused from the reviewed draft gap commentary.

#### S2.7 Worked example (d): "in still air": gate or reference condition? (4 min)
- **Purpose.** The graduate-level decision about assumptions.
- **Content.**
  - REQ-SYS-007: the aircraft shall complete the 25 km design trip within 16 min block time "in still air".
  - Modeled as a gate: the weather as `actor`, `assume constraint stillAir { weather.windSpeed <= 0.5 [m/s] }`, `require constraint withinBlockTime {…}`. The effective constraint is "if still air then within block time" (R83 pp.162, 165). The 0.5 m/s tolerance is FICTIONAL.
  - The problem: the block-time feature is one still-air design value that does not vary with wind, so the gate only makes the requirement vacuously true in wind.
  - The reference-condition reading keeps the condition with the quantity: name the feature `stillAirBlockTime`, state the condition in its doc, and have verification correct measured times to still air. The course recommends this reading here (a course choice; the source gives the semantics, not the choice).
  - Use an assumption when the condition bounds where the requirement applies and the required quantity depends on what it constrains.
- **Figure / SysML v2 example.** The existing listing (actor, assume, require), with the alternative two-line declaration beside it.
- **Sources.** R83 pp.162, 165. Listing `sysml/week10/aerolink_assume_still_air.sysml` (PASS in the 2026-10-11 checker run; FICTIONAL). Reused from the reviewed draft advanced analysis.

#### S2.8 Worked example (e): a full derivation chain (3 min)
- **Purpose.** Connect needs and requirements with defined semantics.
- **Content.**
  - NEED-004 (pads not limited by turnaround; stakeholder STK-005; frames CON-006) → REQ-STK-005 (pad arrival to dispatch-ready within 25 min) → REQ-SYS-001 (charge within 20 min).
  - Read each `#derivation` with its semantics: any subject that satisfies the original should, itself or through related things, satisfy the derived (PX7 p.580). The enterprise satisfying REQ-STK-005 implies the charging system meets 20 min, because 25 min = 20 min charge + 5 min handling (course turnaround convention).
  - The rationale annotation records exactly that arithmetic; the derivation does not compute it.
- **Figure.** The three elements stacked with two derivation connectors and the rationale text in a side note.
- **Sources.** PX7 pp.580–581. AeroLink: reference v0.1 (NEED-004) and v0.2 (REQ-STK-005, REQ-SYS-001, derivations; rationale text). Turnaround convention: DECISION_LOG W8 (faculty-only). **New consolidated fragment needed** (see §4).

#### S2.9 The childless need: an audit finding, not a modeling error (2 min)
- **Purpose.** Use the model to find a gap.
- **Content.**
  - NEED-011 (disruption notice) has no child requirement in the reference: a deliberate gap found through the weather-disruption scenario.
  - In the model, the gap is visible as a need with no derivation leaving it. A query or a trace matrix finds it; the disposition (add a requirement, or record why not) is an engineering decision.
- **Figure.** A trace matrix fragment, NEED rows × REQ-STK columns, with the NEED-011 row empty and highlighted.
- **Sources.** Reference baseline convention (DECISION_LOG W9, faculty-only). Trace-audit criterion RB-9.4 (faculty-only).

#### S2.10 Common errors in modeled requirements (4 min)
- **Purpose.** A checklist students can apply to their own model.
- **Content.**
  1. The enterprise as subject of a system requirement (subject too large to satisfy at element level).
  2. Doc only, no constraint ("requirements as comments").
  3. A requirement definition where a usage was meant (the ID then names a template, not a requirement).
  4. `satisfy` between two requirements (use derivation).
  5. Unquoted IDs with hyphens (`<REQ-SYS-001>`): rejected by the checker.
  6. A group with mixed subjects treated as if it could be satisfied.
  7. Framing every concern of a stakeholder rather than the ones the need answers.
- **Figure.** Seven compact "wrong → right" pairs.
- **Sources.** R83 pp.161, 162, 165, 168; R74 sl.90. Item 5: `sysml/week09/invalid_unquoted_short_name.sysml` (FAIL as intended in the 2026-10-11 run). Item 1 and 2: reviewed draft checkpoint findings.

#### S2.11 Predict the checker (4 min)
- **Purpose.** Practice the PASS-is-not-meaning rule.
- **Content.** Three listings shown; students predict PASS, PASS with warning, or FAIL before the reveal:
  - a satisfy naming a requirement definition (FAIL: name does not resolve as a feature);
  - a satisfy whose satisfier's value violates the limit (PASS, no message);
  - a satisfy by a port of the right element (PASS with a warning about conforming types).
  - Debrief: two of three are semantically wrong; only one is caught.
- **Figure.** Three code cards, then a reveal table.
- **Sources.** R83 p.168. Listings `sysml/week10/invalid_pc9_satisfy_requirement_def.sysml`, `invalid_pc5_satisfy_relaxes_limit.sysml`, `predict_pc4_satisfy_by_port.sysml` (recorded results as stated, 2026-10-11 run).

**Transition F → G.** "Reviewers are scarce. AI tools can propose review findings quickly; the engineering is in deciding which findings are real."

### Section G: AI-assisted requirements quality assessment (14 min)

#### S2.12 The method: AI findings are candidates to disposition (4 min)
- **Purpose.** Teach a defensible way to use AI on requirements.
- **Content.**
  - Task (course lab, from the program's lab list): use an AI tool to identify ambiguity, duplication, conflicts and missing information in the requirements model.
  - Method (course convention):
    1. Export the Requirements package text (doc, constraint, subject, metadata) and the needs it derives from.
    2. Ask for findings in four named categories, each tied to a requirement ID and a quoted phrase.
    3. For every finding, record *accept* or *reject* with a reason; for accepted ones, the change made and its ID.
    4. Re-run the checker; re-read any changed requirement against its need (requirement validation).
  - The AI cannot see intent that is not in the text; its "missing information" findings are prompts, not facts. Every AI-suggested change is tagged and reviewed by its owner.
- **Figure.** A four-lane funnel: AI findings → triage (accept/reject with reason) → change with ID → checker run and intent re-read.
- **Sources.** Program lab list, Lab 4B (faculty-only: S04). R13 p.566 (requirement verification/validation). RB-3.6 and RB-12.1–12.3 (faculty-only).

#### S2.13 Demonstrated on AeroLink: a seeded review set (3 min)
- **Purpose.** Show triage on a known set.
- **Content.**
  - Six AeroLink-style requirements with four seeded defects (one ambiguous term, one duplicate of REQ-SYS-005 with a different limit, one conflict with the 65 dBA limit, one missing condition). **(proposed, instructor to confirm; new fragment needed)**
  - An AI-style findings list of eight items: four true, two false positives, two partially right. Class triages three findings live.
  - Lesson: the false positives are as instructive as the true ones.
- **Figure.** Findings table with columns ID, category, quoted phrase, disposition, reason.
- **Sources.** Instructor-authored teaching set (FICTIONAL); method from S2.12.

#### S2.14 Mapping your Week 2 package into the model (4 min)
- **Purpose.** Prepare the lab.
- **Content.**
  - The artifact-to-model table for this week: needs → `Needs` requirement usages (subject enterprise, stakeholder, frame); stakeholder requirements → `Requirements` usages (subject enterprise); system requirements → usages with the element subject; criteria → required constraints; methods, rationale, TBDs → metadata; parent links → `#derivation` or dependencies.
  - Decide now, per system requirement, which element is the subject; if that element is not yet in the model, add a part definition placeholder in the Physical or Logical package (to be completed in Weeks 10–11).
- **Figure.** The mapping table with one AeroLink example row per artifact type.
- **Sources.** Course convention (reference model `README.md` §3.2, faculty-only).

#### S2.15 Bridge: where requirements go next (2 min)
- **Purpose.** Show the thread ahead.
- **Content.** Week 10: functions and behavior that requirements are allocated to. Week 11: physical elements, interfaces, and the first defensible `satisfy` claims. Week 12: verification cases that `verify` requirements, measures, and the digital-thread audit. Week 13: analysis cases that evaluate constraints.
- **Figure.** The Session 1 trace picture with Weeks 10–13 lighting up in turn.
- **Sources.** COURSE_SCHEDULE.md.

**Transition G → H.** "Now your team models its own needs and requirements."

### Section H: Laboratory launch (22 min)

#### S2.16 Lab brief: what you deliver, and by when (3 min)
- **Purpose.** Deliverables and minimums.
- **Content.** The lab outputs (§5.5); minimums; zero errors and every warning explained; the AI review log; due before Week 10 Session 1.
- **Sources.** §5 below.

#### S2.17 Team work: model three requirements end to end (12 min)
- **Purpose.** Start in class with feedback available.
- **Content.** Each team models, from its own package: one need (stakeholder, frame), the stakeholder requirement derived from it, and one system requirement derived from that, with constraint, metadata and two `#derivation` connections. Run the checker.
- **Sources.** Course convention.

#### S2.18 Instructor checkpoint (5 min)
- **Purpose.** Catch the common errors early.
- **Content.** Per team: show the system requirement's subject, its constraint and one derivation. Typical findings: enterprise subject on a system requirement; doc only; unquoted IDs; derivation ends reversed.
- **Sources.** S2.10.

#### S2.19 Close: the next seven days (2 min)
- **Purpose.** Plan the out-of-class work with owners.
- **Content.** The procedure table (§5.4) with owners; reading list; quiz window.
- **Sources.** §5.

**Session 2 timing.** 1 (2) · 2 (1) · 3 (3) · 4 (3) · 5 (4) · 6 (4) · 7 (4) · 8 (3) · 9 (2) · 10 (4) · 11 (4) · 12 (4) · 13 (3) · 14 (4) · 15 (2) · 16 (3) · 17 (12) · 18 (5) · 19 (2) · references (0). **69 min (47 lecture + 22 lab) + 6 min buffer = 75.**

## 4. AeroLink worked model example (continues Weeks 1–2)

**Phase I starting point.** Week 1's stakeholder register, concerns and needs (NEED-001..011 in the reference baseline) and Week 2's requirements (REQ-STK-001..010, REQ-SYS-001..010, each with one "shall", a criterion or TBD, a type, a rationale, a method and a parent). Week 8 already modeled STK-001..014 as part definitions and CON-001..016 as concerns.

**What Week 9 adds to the AeroLink model.** The `Needs` package (MGO-001..009 and NEED-001..011 as requirement usages with subject, stakeholder and frame) and the `Requirements` package (20 requirement usages with short-name IDs, doc, subject, require constraint, `@RequirementAttributes`, `@Rationale`, `@StatusInfo` for the two TBDs, and the two groups), plus `#derivation` connections NEED → REQ-STK → REQ-SYS. This is exactly the requirements layer of the reference v0.2 model, minus the structure, satisfy and allocation layers (Weeks 10–11).

### 4.1 Existing fragments (reuse)

| Path (under `learning-studio/`) | What it shows | Status | Used on |
|---|---|---|---|
| `sysml/reference/aerolink_v01_skeleton.sysml` | Needs package: MGO and NEED with subject, stakeholder, frame; derivations among MGO | PASS in the 2026-10-11 checker run | S1.14, S1.20, S2.8 (excerpts) |
| `sysml/reference/aerolink_v02_req_structure.sysml` | Requirements package: 20 usages, metadata, TBD status, groups, requirement derivations | PASS in the 2026-10-11 checker run | S1.10, S1.15, S1.17, S1.18, S2.5, S2.6 |
| `sysml/week10/aerolink_requirement_def_usage.sysml` | `LatencyLimit` definition, three usages with subject and bound parameters, organizing group | PASS in the 2026-10-11 checker run | S1.16 |
| `sysml/week10/aerolink_assume_still_air.sysml` | Actor, assumed and required constraints (REQ-SYS-007) | PASS in the 2026-10-11 checker run | S2.7 |
| `sysml/instructor/week10/aerolink_grad_key_assume_require.sysml` | Instructor key: actor-dependent required constraint (REQ-SYS-001 with arrival state of charge) | PASS in the 2026-10-11 checker run | Graduate assessment key (§6.2), never shown to students |
| `sysml/week08/aerolink_charge_requirement.sysml` | Requirement with subject and constraint, and a satisfy (read-only) | PASS in the 2026-10-11 checker run | S1.21 (optional) |
| `sysml/week08/invalid_wrong_subject.sysml` | Teaching listing, wrong subject | FAIL as intended (2026-10-11) | S2.1 alternative |
| `sysml/week09/invalid_unquoted_short_name.sysml` | Unquoted hyphenated short name | FAIL as intended | S2.10 item 5 |
| `sysml/week10/invalid_pc9_satisfy_requirement_def.sysml`, `invalid_pc6_satisfy_reversed.sysml`, `invalid_pc5_satisfy_relaxes_limit.sysml` | satisfy misuse | FAIL as intended | S1.22, S2.11 |
| `sysml/week10/predict_pc4_satisfy_by_port.sysml` | satisfy by a port (PASS with warning) | PASS (warning) | S2.11 |

Note: `sysml/week08`–`week13` folders use the earlier week numbering; their contents are reused, not moved.

### 4.2 Needed fragments (to be written and checker-validated; proposed folder `sysml/lectures/week09/`)

| Proposed file | Must show | Used on |
|---|---|---|
| `aerolink_need_to_req_chain.sysml` | Self-contained: STK-005 (part def), CON-006 (concern), NEED-004 (stakeholder, frame), REQ-STK-005 and REQ-SYS-001 (subject, doc, constraint, metadata), two `#derivation` connections with `#original`/`#derive` ends; the rationale arithmetic in `@Rationale`. Text and values copied from v0.1/v0.2 | S1.20, S2.8 |
| `aerolink_tbd_bound_limit.sysml` | REQ-SYS-010 with `@StatusInfo` tbd, first with the unbound limit (as in the reference), then the variant that binds `connectionLimit` to the satisfier's configured value. Two usages or two packages in one file | S2.6 |
| `aerolink_requirements_review_seeded.sysml` | Six requirement usages with four seeded quality defects (ambiguous term, near-duplicate with a different limit, conflict, missing condition); all must PASS the checker, which is the point. Values (proposed, instructor to confirm) | S2.13, quiz distractor source |
| `invalid_requirement_doc_only_satisfied.sysml` (optional) | A doc-only requirement that is "satisfied" by an element: PASS, demonstrating that the checker cannot see a missing constraint | S1.22 |

Reference-model note: the reference v0.1 need statements are in the earlier form ("Passengers need to …"); the Week 1 lecture now teaches SEBoK's form ("The [stakeholders] need the air-taxi service to …") and proposes NEED-012..017 and STK-015, which are not in the reference `.sysml` (see §9 and §11).

## 5. Laboratory outline: modeling the team's own needs and requirements

### 5.1 Inputs
- The team's Phase I package (the Week 7 Systems Thinking Engineering Package): stakeholder register, concerns and needs (Week 1), requirements with criteria, methods, rationale and parents (Week 2), and the AROU entries behind any TBD.
- The team's Week 8 model (skeleton; Stakeholders package with STK part definitions and CON concerns) and its checker log.
- The Session 1–2 slides, the long-form lesson, and the worked examples (S1.16, S2.5–S2.8).
- Readings (§5.7).

### 5.2 Objectives
B9.2, B9.3, B9.4 and B9.5, applied to the team's own enterprise.

### 5.3 Method
1. **Needs.** Each Week 1 need becomes a requirement usage in `Needs`: ID as short name, need statement as doc (with conditions and rationale), subject the enterprise, `stakeholder` typed by the Week 8 STK part definition, `frame` the concerns it answers (S1.13–S1.14).
2. **Mission and objectives** (if the Phase I package has them): MGO elements with target values as attributes.
3. **Stakeholder requirements.** Usages with subject the enterprise, doc, required constraint over an enterprise feature, metadata (S2.5).
4. **System requirements.** Usages with the element subject (add a placeholder part definition if needed), doc, constraint, metadata; a requirement definition only where three or more share a form (S1.16).
5. **TBDs.** Constraint kept, `@StatusInfo` tbd with owner, limit bound to the configured value where a satisfier is known (S2.6).
6. **Assumptions.** Only where the condition bounds applicability; otherwise a reference condition in the feature name and doc (S2.7). Each assumption justified in one sentence.
7. **Derivations.** `#derivation` for requirement-to-requirement and need-to-requirement links; dependencies where the semantics would be too strong (S1.18–S1.19).
8. **Groups.** One organizing group per requirement level.
9. **AI-assisted quality assessment.** The four-category review, with a disposition log (S2.12).
10. **Checker and self-review.** Zero errors; every warning explained; the S2.10 checklist applied; childless needs and orphan requirements listed with a disposition.

### 5.4 Procedure

| Step | When | Lead role | Output |
|---|---|---|---|
| 1. Three-requirement chain (need → REQ-STK → REQ-SYS) | In class, S2.17 | Whole team | Started model |
| 2. Checkpoint feedback applied | Day 1 | Requirements & Compliance | Fixed chain |
| 3. Needs package (all needs; frames checked against concerns) | Days 1–2 | Requirements & Compliance | `Needs` package |
| 4. Stakeholder requirements | Days 2–3 | Requirements & Compliance (each member models ≥ 3) | `Requirements` part 1 |
| 5. System requirements with subjects; placeholders listed | Days 2–4 | Architecture (subjects); each member models ≥ 3 | `Requirements` part 2 |
| 6. Derivations, dependencies, groups, metadata, TBDs | Days 3–4 | V&V lead | Traceability package |
| 7. AI quality assessment and dispositions | Day 5 | AI & Data lead | Review log |
| 8. Checker run to zero errors; warnings explained; trace audit (childless needs, orphans) | Day 6 | V&V lead | Checker log; audit note |
| 9. Artifact-to-model table updated; AI statement | Day 6 | AI & Data lead | Mapping table; statement |
| 10. Integration review and submission | Day 7 | V&V lead | Submission |

### 5.5 Outputs
- The team model with `Needs` and `Requirements` packages and derivations (one `.sysml` file or the team's agreed file set, as set up in Week 8).
- The checker log of the final run (zero errors; each warning explained).
- The requirements mapping table (Week 2 ID → model element, subject, constraint present Y/N, parent relationship, TBD status).
- The AI review log (finding, category, quoted phrase, disposition, reason, change ID).
- The trace-audit note (childless needs, orphan requirements, each with a disposition).
- The AI usage statement.

**Minimums (course convention, proposed).** All Week 1 needs and all Week 2 requirements modeled; every system requirement with an element subject and a required constraint or a recorded TBD; every requirement with a parent relationship; ≥ 1 requirement definition used by ≥ 2 usages, or a one-line reason why no shared form exists; ≥ 8 AI findings dispositioned.

### 5.6 Rubric rows (from ASSESSMENT_RUBRICS.md)

| Row | Criterion | Applied this week |
|---|---|---|
| RB-8.1 | Validity | Yes: zero errors and zero warnings, or warnings explained |
| RB-8.2 | Organization and conventions | Yes: Needs and Requirements packages; quoted short-name IDs; explicit imports |
| RB-8.4 | Requirements semantics | Yes, the core row: subject and ID, constraint, derivation used correctly; "satisfy misused (e.g. between requirements)" is level 2. Satisfy relationships themselves are scored from Week 11 |
| RB-8.6 | Completeness vs minimums | Yes, against §5.5 minimums |
| RB-3.1–3.4 | Requirement quality (sample audit of 10) | Applied to the modeled requirements (well-formed, verifiable, rationale, parent trace) |
| RB-3.6 | Audit response | Yes: the AI review log (every finding accepted or rejected with a reason) |
| RB-9.1 | Upward trace | Yes: REQ → NEED or parent; NEED → STK |
| RB-12.1–12.3 | AI usage statement; AI-suggested changes tagged and reviewed | Yes |

**Gate.** The RB-8 parse-error gate (more than two errors caps RB-8.2–8.6 at level 2; 24-hour repair window) applies. **Grading mode.** Formative, feedback before Week 10 Session 2; a faculty decision could make the Week 11 model a graded baseline (§11).

### 5.7 Realistic per-student workload (budget 8 h)

| Activity | Hours | Basis |
|---|---|---|
| Class sessions (2 × 75 min) | 2.5 | Timetable |
| Readings: R74 sl.86–91 (6 slides), R83 pp.161–168 (8 pp spec), R13 pp.557–558, 564, 566 (4 pp), PX7 pp.580–581 (2 pp) | 0.8 | About 15 pp/h for specification text, 30 slides/h |
| Long-form lesson and worked examples | 0.5 | About 4,500 words |
| Lab out of class: the student's share of steps 2–10 | 2.8 | About 11 person-hours per team of 4 (needs 1.5; REQ-STK 2.0; REQ-SYS 3.0; traceability and metadata 1.5; AI review 1.5; checker, audit, table 1.0; integration 0.5) |
| Quiz Q9 (§6.1) | 0.3 | 12 items |
| Applied exercise (§6.2) | 0.7 | 40 min plus upload |
| Time log and AI statement contribution | 0.2 | |
| **Total** | **7.8** | Within the 8 h budget |

Notes: teams of 3 carry about 3.7 h of lab each (total about 8.7 h) unless the minimums are reduced for them (faculty decision, as in Week 1). The earlier draft's equivalent week was estimated at 9.5 h; the savings come from moving structure to Week 11 and replacing the separate graduate memo with the applied exercise.

## 6. Assessment outline (separate from the lecture)

Items use unseen, non-AeroLink contexts. No item reuses slide, worked-example or warm-up wording. Keys rest on the cited pages.

### 6.1 Quiz Q9 (individual, 15 min, closed book, 12 items)
9 single-best-answer items (1 point each) and 3 short answers (2 points each, ≤ 40 words). Keyed positions balanced; distractors drawn from S2.10 errors; no option longer or more qualified than the key.

| # | Objective | Bloom | Item focus (unseen context) | Key source |
|---|---|---|---|---|
| 1 | B9.1 | Understand | Which statement about a requirement in SysML v2 is true? (it is a kind of constraint) | R83 p.161 |
| 2 | B9.1 | Understand | A requirement has a short name `<'R-12'>`; what is that short name considered to be? | R83 p.165 |
| 3 | B9.3 | Apply | Hospital infusion-pump service: choose the correct subject for a requirement about pump alarm latency | R83 pp.161, 166 |
| 4 | B9.3 | Analyze | A usage binds the limit but never redefines the measured feature as a feature of the subject: what follows? | R83 pp.161, 166 |
| 5 | B9.3 | Analyze | A rail-signal requirement with an assumption about visibility: is it satisfied on a foggy day when the stopping distance is exceeded? | R83 p.165; R74 sl.91 |
| 6 | B9.2 | Apply | Which declaration correctly states that a need answers a stakeholder's concern? (`frame`) | R83 p.167 |
| 7 | B9.3 | Apply | A group by reference whose members declare different subjects is satisfied by one element: what does the model claim? | R74 sl.90; R83 pp.161, 167 |
| 8 | B9.4 | Understand | What does a `#derivation` connection assert about the original and derived requirements? | PX7 pp.580–581 |
| 9 | B9.4 | Analyze | Which relationship belongs between a system requirement and its parent stakeholder requirement? (derivation, not satisfy) | PX7 p.580; R83 p.168 |
| 10 (SA) | B9.1 | Apply | Rewrite a doc-only requirement (water-utility pressure) as a usage with subject, bound limit and required constraint | R83 pp.161, 165 |
| 11 (SA) | B9.5 | Evaluate | Two AI findings on a given requirement set: accept or reject each with a reason | R13 p.566 |
| 12 (SA) | B9.4 | Evaluate | A teammate writes `satisfy` for every requirement "to show coverage". State what each such line asserts and what should replace it | R83 p.168 |

Weight: within the weekly quizzes component (faculty decision on exam placement pending, §11).

### 6.2 Applied exercise (individual, about 40 min, open book, unseen case)
- **Case brief** (about 300 words, instructor-authored, FICTIONAL): a *municipal bicycle-share service* with two stakeholder needs, three stakeholder requirements and four system requirements in a table, two of which contain defects (one solution-laden, one with an unstated condition).
- **Tasks.**
  1. Model one need with stakeholder and framed concern, and the stakeholder requirement derived from it. *(B9.2, B9.3)*
  2. Model two system requirements as usages of one requirement definition, with subjects and bound parameters. *(B9.3)*
  3. Add the two derivation connections, and state in one sentence each what they assert. *(B9.4)*
  4. Diagnose the two defective requirements (requirement verification or validation) and rewrite them. *(B9.5)*
  5. Graduate: decide whether the unstated condition is an assumption or a reference condition, model it, and state what a later `satisfy` would then claim. *(Graduate)*
- **Checker use.** Students may run the checker; a PASS earns no points by itself.
- **Rubric** (4 levels, 20 points): need and framing; requirement form (subject, constraint, binding); derivation semantics; diagnosis and rewrite; graduate condition analysis (non-graduate students: the fifth criterion is the explanation of what the checker did not check).

## 7. Continuity link to the Phase I artifact

- **Phase I artifact modeled.** Week 2 (ConOps / Requirements): the stakeholder and system requirements traced to needs, with criteria, methods and rationale; and the Week 1 needs (COURSE_SCHEDULE rule 6: Week 9 ↔ Week 2; the Week 1 outline states that Week 9 models Week 1's needs).
- **What crosses.** IDs (NEED, MGO, REQ-STK, REQ-SYS), statements (verbatim into `doc`), criteria (into required constraints), method and type (metadata), rationale (`@Rationale`), parents (`#derivation`), TBDs (`@StatusInfo`).
- **What does not cross yet.** ConOps scenarios and capabilities (Week 10), measures MOE/MOP (Week 12), verification methods as verification cases (Week 12).
- **Program lab list alignment (faculty-only: S04).** Lab 3A (needs model), Lab 3C (initial requirements model), Lab 4A (requirements architecture: stakeholder, operational, performance requirements, constraints), Lab 4B (AI quality assessment). Lab 3B (capability model) moves to Week 10 with the logical architecture.
- **Week 1 lecture alignment.** The Week 1 slide "Two phases" promised "STK, CON → part def, concern" (Week 8) and needs → Week 9; this outline fulfills the second promise.

## 8. Section transitions (summary)

| From → to | Transition line |
|---|---|
| Session 1, A → B | Recall what a requirement is in SE, because the language encodes it |
| B → C | SysML v2 makes the requirement a constraint; that explains the syntax |
| C → D | A requirement alone is half the story: where it came from, and what is claimed about it |
| D → exit | Write one of your own requirements as a usage |
| Session 2, E → F | Four worked examples, each a decision you will make |
| F → G | AI can propose findings; the engineering is deciding which are real |
| G → H | Your team models its own needs and requirements |

## 9. Source gaps

1. **No primary source on modeling needs in SysML v2.** The specification has requirements and concerns but no "need" construct; modeling a need as a requirement usage with framed concerns is a course convention (reference model). INCOSE NRM/GtNR, which SEBoK quotes (R13 p.558), is not in the collection.
2. **Derivation direction pedagogy.** PX7 gives the semantics (original's satisfaction implies the derived), but no source discusses how practitioners should choose between derivation and dependency. The S1.19 rule of thumb is a course convention.
3. **AI-assisted requirements review.** No source in the collection describes a method for AI-assisted requirement quality assessment; S2.12 is a course method resting on R13 p.566 (requirement verification/validation) and RB-3.6/RB-12.
4. **INCOSE Guide to Writing Requirements** (cited by R13 p.566 for characteristics) is not in the collection; DoD R48b p.144 substitutes.
5. **Graphical notation for requirements.** The graphical deck's requirements module (S09 sl.88–94) is dated January 2023 and is not registered; requirement diagrams in the figures are original drawings, labeled as course illustrations, not as normative notation.
6. **Checker behavior** is recorded for release 2026-08 only; it is not a source and may change with a new release.
7. **Week 1 case changes** (SEBoK-form need statements, NEED-012..017, STK-015, noise-exposure wording of NEED-003) are not in the reference `.sysml`. Until faculty decide, Week 9 examples use the reference text; the lesson must say so if the Week 1 lecture text differs.

## 10. Register additions needed

| ID | Source, PDF pages | First-page title (to verify with `verify_readings.py`) | Supports |
|---|---|---|---|
| PX7 (shared) | S06 pp.580–583 | 9.6 Requirement Derivation Domain Library | S1.18, S2.8; quiz 8–9 |
| PX8 (shared) | S06 pp.555–562 | 9.3.2 Modeling Metadata | S1.17, S1.19, S2.5–S2.6 |
| P9.1 | S09 sl.88–94 | Requirements (module title slide reads "Module 16 / Requirements") | Optional: graphical requirement notation and sl.93 "requirement allocation vs requirement satisfaction" (dated 2023; extension only) |

Existing entries used: R13, R48b, R74, R76, R77, R80, R83, R84. **Essential readings, proposed:** R74 sl.86–91; R83 pp.161–168; R13 pp.557–558, 564, 566. **Extension:** PX7 pp.580–581; PX8 pp.555–557; R48b p.144.

## 11. Open items for faculty

1. Approve modeling needs as requirement usages (subject enterprise, stakeholder, frame) as the course convention.
2. Decide whether the Week 1 case changes (NEED-012..017, STK-015, SEBoK-form statements) enter the reference model before Week 9 is built; if yes, the Needs package, counts and the NEED-011 audit case must be revised.
3. Approve the AI review method (S2.12) and the minimum of eight dispositioned findings.
4. Whether the Week 9 model is formative only (proposed) and the first graded model baseline sits at Week 11.
5. Exam placement (still open in COURSE_SCHEDULE.md): whether quiz Q9 counts toward weekly quizzes.
6. Workload for 3-person teams (§5.7 note).
7. Approve register additions PX7, PX8 and optional P9.1.
8. Objective IDs B9.x reuse the numbering of the earlier draft's Week 9 objectives; confirm the new IDs before `course.ts` is updated.
