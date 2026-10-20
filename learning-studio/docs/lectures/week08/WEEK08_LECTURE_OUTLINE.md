# Week 8 Lecture Outline: Import Systems Thinking Artifacts / Stakeholders

**Status.** Draft for faculty approval (COURSE_PRODUCTION_PLAN M2, source-grounded outline). Written 2026-10-19. The built package was independently reviewed the same day (`_source_cache/review/week08_review.md`, REVISE) and revised; **where this outline and the built sources differ, the sources and `WEEK8_REVIEW_DISPOSITIONS.md` govern.** Revisions that supersede this outline: Session 1 is 70 min on 26 slides + 5 min buffer (a two-minute writing check and a three-minute live checker demonstration added; notation, benefits, redefinition and units shortened); the package construct is Kernel, not Root (R70 sl.4; KerML 7.4.14); every dependency runs from the dependent element to the element it depends on (R80 pp.50–51), so the Week 1 active-voice types become `#regulatedBy`, `#fundedBy`, `#suppliedBy` written from the register's target; the checker installation is a Week 8 team task with a student install guide (`#/week/8/lab/checker`), not a Week 7 task; the applied exercise is about 45 min with both recorded checker outputs given; the Evolution package is in the skeleton.
**Governing documents.** DECISION_LOG A19 and A20; COURSE_SCHEDULE.md (Week 8 subject, exact; rules 4–7); COURSE_PRODUCTION_PLAN.md; the Week 1 template (`docs/lectures/week01/WEEK1_LECTURE_OUTLINE.md`) and its review lessons (`REVIEW_DISPOSITIONS.md`: 69 min + 6 min buffer per session; spoken notes ≤ 130 wpm; definitions verified; course conventions labeled; no internal IDs in student text).
**Format.** Two sessions of 75 minutes each.
- Session 1: all lecture, 24 slides (69 min) + 6 min buffer + generated "References and credits" slide (0 min).
- Session 2: 16 lecture slides (47 min) and 4 lab-launch slides (22 min) = 20 slides (69 min) + 6 min buffer + references slide.
- Total: 44 content slides + 2 references slides.
**Position in the course.** First Phase II week. It carries the introductory MBSE and SysML v2 material (COURSE_SCHEDULE rule 7) *and* the whiteboard subject: the team imports its Week 7 Systems Thinking Engineering Package and models its stakeholders and concerns. No week is added and no topic is displaced.

## 0. Conventions used in this outline

- **Citations.**
  - `R80 p.63` = verified register entry R80, PDF page 63 of the SysML v2.1 Beta 2 (Release 2026-07) Part 1 text (S06). The specification is always cited as that Beta 2 text, never as "the standard" (DECISION_LOG W4).
  - `R70 sl.11` = register entry R70, slide 11 of the OMG textual-notation training deck, Release 2026-08 (S10, CC BY 4.0). `R90 sl.22` = the graphical-notation deck (S09).
  - SEBoK pages are PDF indices (W1).
  - `PX3`, `P8.1` … = **proposed register additions** (§10). Their page text was opened for this outline; they are not yet in `readings.py`.
  - Every citation below was opened in `_source_cache/*.txt`. A citation supports only what is written beside it.
- **Course convention** marks content the source collection does not supply (tool choices, ID scheme, package layout, mapping rules). It is taught as the course's choice, not as literature.
- **Toolchain claims** cite `docs/SYSML_TOOLCHAIN.md` and DECISION_LOG A8/A13, never the specification.
- **AeroLink** values are FICTIONAL. They come from `sysml/reference/aerolink_v01_skeleton.sysml` (L9 skeleton), `src/model/reference/week01–03.ts` and `src/content/lectures/week01/aerolinkCase.ts`. Nothing is retyped from memory; anything not in those files is marked **(proposed, instructor to confirm)**.
- **Validity versus meaning.** A checker PASS means the file parsed, every name resolved and no validation rule fired. It never shows the model means what the team intends. (Forward pointer only this week: a `satisfy` usage *asserts* that a requirement is satisfied, R83 p.168; it proves nothing about the real system.)
- **Student-facing text** (slide faces, notes read aloud, lesson) contains no internal IDs: no decision numbers, FD numbers, "old Week 9", source codes S01–S13, P/PX numbers or objective codes. Those appear only in the Sources lines and in §§9–11.
- **Speaker notes** (written later, from this outline) stay at or below 130 words per minute of slide time.
- **Listings** below are short teaching sketches. Each one marked *to be checker-validated* must pass the course-designated checker before it is used; listings quoted from existing files already passed (2026-10-11 run, `sysml/validation-report.json`).

## 1. Learning objectives (graduate level)

The draft-material IDs B9.1–B9.5 are superseded; the reuse map is in §9.

| ID | Objective | Bloom | Taught in |
|---|---|---|---|
| B8.1 | Explain what model-based systems engineering changes relative to a document-based package, and distinguish a model from a view of it | Understand | S1.2–S1.10 |
| B8.2 | Describe the SysML v2 language architecture (Root, Core, Kernel, Systems; KerML under SysML) and the element–relationship–ownership structure of a model | Understand | S1.11–S1.13 |
| B8.3 | Distinguish definition from usage, and read specialization, subsetting, redefinition, multiplicity and composite versus referential features correctly in a listing | Analyze | S1.14–S1.20, S1.22 |
| B8.4 | Write packages, imports with explicit visibility, names and short-name IDs, documentation and quantity-typed attributes that the course-designated checker accepts | Apply | S1.21; S2.2–S2.5 |
| B8.5 | Map every artifact of the team's Systems Thinking package, by ID, to a model package and a SysML v2 construct, and justify each mapping choice | Apply / Evaluate | S2.8–S2.10; lab |
| B8.6 | Model the system of interest's context, the stakeholders, their concerns and the stakeholder relationships as SysML v2 elements traced to the Phase I register | Apply | S2.11–S2.15; lab |
| B8.7 | Separate what the checker decides from what the language semantics and the model's purpose require, and act on that difference | Evaluate | S1.23; S2.7; S2.15 |
| Graduate | Apply KerML's classification semantics (extents; necessary versus sufficient conditions; subsetting and redefinition as statements about values) to an AeroLink fragment | Analyze | Applied exercise task 5 (§6.2) |

## 2. Session 1: From documents to a model; the language (75 min, all lecture)

**Design rationale.** Session 1 earns the change of representation before it teaches syntax: one number repeated across the Phase I package motivates a single source; then the session builds the vocabulary every later Phase II week depends on (model, view, language layers, definition and usage). The worked example is AeroLink's vertiport network, already familiar from Phase I. Two short predict-then-reveal moments replace quiz cards (A20).

### Section A: Framing (8 min)

#### S1.1 Week 8 at a glance (2 min)
- **Purpose.** Orient: the two halves of the week (learn the language; import the package) and the outputs.
- **Content.**
  - Subject, exactly as scheduled: *Import Systems Thinking Artifacts / Stakeholders*.
  - Session 1: what MBSE changes and the core of SysML v2. Session 2: packages, names, the toolchain, the import mapping, stakeholders and concerns, lab launch.
  - Outputs of the week: the model skeleton, the artifact-to-model mapping matrix, the context and stakeholder packages, and a checker log.
- **Figure.** A horizontal band: "Week 7 package" (stack of document icons) → arrow labeled "import by ID" → "Model v0.1" (package tree). Under the model: three filled packages (Context, Stakeholders, mapping matrix) and seven dimmed ones labeled with the week that fills them (Needs and Requirements: 9; Logical and Behavior: 10; Physical: 11; Verification: 12; Analysis: 13).
- **Sources.** COURSE_SCHEDULE.md (schedule, rule 6). Course convention (package-to-week labels).

#### S1.2 The driving question: one number, nine places (3 min)
- **Purpose.** Create the need for a single source before defining MBSE.
- **Content.**
  - AeroLink's 20-minute charge to the dispatch threshold appears in at least nine Phase I artifacts: as a value (REQ-SYS-001), in values computed from it (REQ-STK-005's 25 min turnaround = 20 + 5 min handling; A-007's 48 charges per charger per day), and in conclusions resting on it (TECH-001; DEC-001).
  - What-if (FICTIONAL): the supplier now says 24 min. Students predict in pairs: which artifacts change, and how would you be sure you found them all?
  - Answer withheld until S1.6 (finding them) and S1.7 (what a model does and does not do about it).
- **Figure.** A grid of nine document tiles, each with the "20 min" highlighted in a different place; one tile hidden under a fold ("the one you miss").
- **Sources.** Reference baseline (`src/model/reference/week03–07.ts`; worked example "one number in nine places" reused from the reviewed draft module). FICTIONAL.

#### S1.3 Phase II: your package becomes one model (3 min)
- **Purpose.** Make the continuity explicit; nothing from Phase I is discarded.
- **Content.**
  - Phase I produced a document-based Systems Thinking Engineering Package. Phase II rebuilds that same enterprise as one SysML v2 model; Week 14 presents it.
  - Every Phase II week names the Phase I artifact it models: this week the Week 1 stakeholder register and concerns (and the context), next week the Week 2 needs and requirements, and so on.
  - Stable IDs (ENT, EXT, STK, CON, NEED, REQ …) are the thread: the same ID in the document and in the model.
  - AeroLink is demonstrated first; each team then models its own instructor-approved enterprise.
- **Figure.** Two parallel lanes (Phase I documents, Phase II model) with dashed vertical arrows Week 1 → Week 8, Week 2 → Week 9, Weeks 2 and 4 → Week 10, Week 5 → Week 11, Weeks 2 and 3 → Week 12, Week 3 → Week 13, Weeks 6 and 7 → Week 14.
- **Sources.** COURSE_SCHEDULE.md rules 2–6.

**Transition A → B.** "To keep the 20 minutes in one place, we need something that is not a document. What is a model, exactly?"

### Section B: What MBSE changes (14 min)

#### S1.4 What a model is (3 min)
- **Purpose.** A precise, sourced definition that later slides can test against.
- **Content.**
  - SEBoK collects several definitions; all treat a model as a representation. The OMG definition it lists: "a selective representation of some system whose form and content are chosen based on a specific set of concerns", related to the system by an explicit or implicit mapping (R33a p.290; P8.1 p.1567).
  - Consequences: a model is *selective* (chosen for concerns), and many models may be needed for one system (R33a p.290).
  - Physical, mathematical and logical models (R33a p.290).
- **Figure.** One AeroLink aircraft at the center; around it three representations (a scale mockup, a range equation, a box-and-line logical diagram), each labeled with the concern it serves.
- **Sources.** R33a p.290; **P8.1 p.1567 (register addition)**.

#### S1.5 Modeling languages and tools (3 min)
- **Purpose.** Separate the three things a "language" gives a model; set up what a checker can and cannot do.
- **Content.**
  - Abstract models rely on a modeling language: an **abstract syntax** (constructs and rules for building a model), a **concrete syntax** (graphical symbols and/or text) and **semantics** (meaning) (R33a pp.291–292).
  - Modeling tools build models in a language and typically check conformance to its rules (R33a p.292).
  - Teaching point: conformance is about syntax and rules. Whether the model means what you intend is a semantic and engineering question.
- **Figure.** Three stacked layers: "Abstract syntax (what may exist)", "Concrete syntax (how it is written: text, diagram, table)", "Semantics (what it means)". A tool icon checks only the first two arrows.
- **Sources.** R33a pp.291–292.

#### S1.6 MBSE versus a document-centric package (3 min)
- **Purpose.** Define MBSE and contrast it with what the team just delivered in Week 7.
- **Content.**
  - INCOSE's definition, quoted by SEBoK: MBSE is "the formalized application of modeling to support system requirements, design, analysis, verification and validation activities", from conceptual design onward (R33a p.292; P8.2 p.1569).
  - In a document-centric approach the documents are the controlled artifacts; in MBSE a model in a standardized language can serve as a "single source of truth" (R33a p.292; R28 p.370).
  - Digital engineering uses authoritative sources of system data and models across disciplines (R27 p.56).
  - Driving-question answer, part 1: in the model, the 20 min is one attribute; the nine artifacts relate to it by relationships you can follow, so "find them all" becomes a traversal, not a text search.
- **Figure.** Left: nine documents with hand-drawn sync arrows between them. Right: one model node `chargeTimeToDispatch` with nine labeled relationship lines to the elements that depend on it.
- **Sources.** R33a p.292; **P8.2 p.1569 (register addition)**; R28 p.370; R27 p.56.

#### S1.7 What MBSE buys, and what it costs (3 min)
- **Purpose.** Calibrated expectations, not advocacy.
- **Content.**
  - Benefits SEBoK names: inconsistencies surface while the model is built; one source reduces miscommunication; information is easier to search and extract (R28 p.373).
  - Cost: the benefits shrink when the model falls out of date; regular updates are a minimum (R28 p.373).
  - Where stakeholders expect documents, a hybrid approach generates documents from the model (R28 p.374).
  - Driving-question answer, part 2: following relationships finds what depends on the 20 min; it does not recompute the consequences. Recomputing needs an analysis in the model (Week 13).
- **Figure.** A balance: "single source, early inconsistency detection, search" versus "upkeep discipline, tool learning, model drift".
- **Sources.** R28 pp.373–374.

#### S1.8 Model quality is not design quality (2 min)
- **Purpose.** Inoculate against "the model is valid, so the design is good".
- **Content.**
  - SEBoK: "The quality of a model should not be confused with the quality of the design that the model represents" (R33b p.296).
  - A model's purpose must be defined first; it is judged by how well it serves that purpose (R33b pp.295–296).
  - For the team: write the model's purpose (who uses it, for which decisions) in the root package's documentation.
- **Figure.** A precise, beautifully dimensioned drawing of a chair with one leg too short.
- **Sources.** R33b pp.295–296.

**Transition B → C.** "If one model holds the 20 minutes, where do the tables and diagrams you hand to reviewers come from?"

### Section C: Model and view (7 min)

#### S1.9 Model versus view (4 min)
- **Purpose.** The central idea of the week: diagrams, tables and text are renderings of one model.
- **Content.**
  - A system model may comprise multiple views (R33c p.300).
  - SysML v2: viewpoints specify information of interest to a set of stakeholders; views specify a query of the model and a rendering of the query results intended to satisfy a viewpoint (R80 p.48).
  - A viewpoint definition is a kind of requirement definition that frames stakeholder concerns; a view definition specifies how to create a view artifact and can preserve a correspondence between model elements and view elements (R85 p.181).
  - SEBoK glossary, for comparison: a view is "a representation of a system from the perspective of a viewpoint" (P8.3 p.1677); a viewpoint is a specification of conventions and rules for constructing and using a view to address stakeholder concerns (P8.4 p.1678). (Both glossary entries cite SysML 1.3, derived from IEEE 1471.)
  - Applied: your Phase I context diagram, N² chart and stakeholder table become views produced from the model, not files kept beside it.
- **Figure.** One model (a cylinder labeled "AeroLink model") with three outgoing arrows to a table view, a diagram view and a textual view; each arrow labeled "query + rendering"; a stakeholder icon beside each view with its concern.
- **Sources.** R33c p.300; R80 p.48; R85 p.181; **P8.3 p.1677, P8.4 p.1678 (register additions)**.

#### S1.10 SysML v2 in one slide (3 min)
- **Purpose.** What is new relative to SysML v1, so students can read older literature critically.
- **Content.**
  - Key elements of SysML v2: a new metamodel not constrained by UML; grounded in formal semantics; visualizations based on view and viewpoint specifications (graphical, tabular, textual); a standardized API to access the model (R90 sl.7).
  - The API lets other tools create, update, delete, query and navigate model elements (R90 sl.9).
  - Caution: SEBoK's MBSE article describes SysML as a graphical language with nine diagram types (R28 p.372). That is SysML v1; it does not describe v2.
  - Course convention: this course writes models in the textual notation; diagrams are views.
- **Figure.** A two-column "v1 → v2" contrast: UML profile → own metamodel; nine diagram types → views and viewpoints; diagrams as the model → text, diagrams, tables as renderings; tool files → standard API.
- **Sources.** R90 sl.7, sl.9; R28 p.372. Course convention (textual notation first).

**Transition C → D.** "To write the model, we need the language's building blocks. Start with how the language itself is built."

### Section D: The language architecture (8 min)

#### S1.11 Four layers: KerML under SysML (4 min)
- **Purpose.** A map of the language the students will use for seven weeks.
- **Content.**
  - SysML extends the Kernel Modeling Language (KerML); most SysML elements specialize KerML elements (R80 p.47).
  - Four layers (R70 sl.3–4; R90 sl.8):
    - **Root**: syntactic elements without model-level semantics (element, comment, namespace, relationship, import, dependency). *Revised:* the package construct is listed under Kernel (R70 sl.4; KerML 7.4.14), not Root.
    - **Core**: type, classifier, feature, multiplicity; specialization and related relationships; a direct semantic mapping to formal logic.
    - **Kernel**: the foundation for building modeling languages (class, data type, behavior, function, connector …) with the kernel semantic library.
    - **Systems**: SysML proper, the definition and usage of attributes, items, parts, ports, actions, states, constraints, requirements, concerns, cases, views and more, with domain libraries.
  - SysML uses KerML's elements and relationships, dependencies, annotations, namespaces and specialization directly (R80 p.47).
- **Figure.** Redrawn layer stack (original drawing): Root at the bottom, Systems at the top; on the right, example keywords per layer; a bracket "KerML" around Root–Kernel and "SysML" around Systems.
- **Sources.** R80 p.47; R70 sl.3–4; R90 sl.8.

#### S1.12 Elements, relationships, ownership (2 min)
- **Purpose.** The graph underneath every listing; why deleting a package deletes its contents.
- **Content.**
  - Elements are the constituents of a model; some elements are relationships between other elements (R80 pp.48–49).
  - Ownership forms a tree: deleting an element deletes its owned relationships and owned elements, cascading down the subtree (R80 p.49).
  - Every element has an element ID managed by the tool; the notation cannot write it. Instead an element has a name and/or a short name (R80 p.49). (Session 2 uses short names for course IDs.)
- **Figure.** A small ownership tree (package → part def → attribute), a dashed relationship line crossing between branches, and a "delete" mark at one node greying its subtree.
- **Sources.** R80 pp.48–49.

#### S1.13 No "system" keyword: everything with structure and behavior is a part (2 min)
- **Purpose.** Prevent the most common translation error from Phase I vocabulary.
- **Content.**
  - SysML has no constructs called system, subsystem, assembly or component; an entity with structure and behavior is a part (R80 p.48).
  - The enterprise, the air-taxi service, a vertiport and a charger are all parts at different places in a decomposition; external systems in the context are parts too.
  - SysML v1's blocks and value properties become part definitions and attribute usages; whether the checker tolerates `block` is a prediction for S1.23.
- **Figure.** Phase I words (system, subsystem, component, external system) on the left, all arrowing to one "part" box on the right, annotated with the position each occupies.
- **Sources.** R80 p.48. Course convention (Phase I vocabulary mapping).

**Transition D → E.** "One pattern runs through all of the Systems layer: definition and usage. Get it right now and every later week is easier."

### Section E: Definition and usage (20 min)

#### S1.14 The definition–usage pattern (3 min)
- **Purpose.** The single most important SysML v2 concept.
- **Content.**
  - A definition classifies a kind of element; a usage is a usage of a definition in a context. A usage is always defined by at least one definition of its kind, or implicitly by the most general one from the library (R80 p.63).
  - The pattern applies to attributes, items, parts, ports, connections, interfaces, allocations, actions, states, calculations, constraints, requirements, concerns, cases, views and more (R80 p.63).
  - One definition can be used in different contexts, or several times in one context (R90 sl.12).
  - A usage is not an instance: it is a feature, a role that instances play in a context.
- **Figure.** One `part def Charger` card; two contexts (a hub vertiport, a spoke vertiport) each holding a usage of it; a third layer of physical charger icons labeled "instances (not in the model text)".
- **Sources.** R80 p.63; R90 sl.12.

#### S1.15 Part and attribute definitions; composite and referential (3 min)
- **Purpose.** The two definition kinds the team uses first.
- **Content.**
  - A part definition defines a class of systems or parts of systems, mutable and existing in space and time; an attribute definition defines attributive data used to describe systems or parts (R70 sl.9).
  - A part usage is a composite feature; a `ref part` is referential; attribute usages are always referential, and an attribute definition may not have composite features (R70 sl.9; R80 p.64).
  - Composite means integral: destroying the container destroys it (a vehicle's wheels); referential is a simple reference (the road it drives on) (R80 p.64).
- **Figure / SysML v2 example.** Quoted from R70 sl.9:
  ```sysml
  part def Vehicle {
      attribute mass : ScalarValues::Real;
      part eng : Engine;
      ref part driver : Person;
  }
  ```
  Callouts: composite (eng), referential (driver), attribute (mass).
- **Sources.** R70 sl.9; R80 p.64.

#### S1.16 Features and multiplicity (3 min)
- **Purpose.** How usages nested in a definition become features; reading `[12]`, `[1..*]`, `[*]`.
- **Content.**
  - Usages nested in a definition are its features; a feature relates each instance of the featuring definition to values (a vehicle to its mass) (R80 p.63).
  - A package-level usage is a generic feature that can be specialized in context (R80 p.64).
  - Multiplicity gives lower and upper bounds; a single bound means exactly that number; `*` alone means 0 or more (R80 pp.64, 73). The default multiplicity for parts is 1..1 (R70 sl.12).
- **Figure / SysML v2 example.** AeroLink, excerpt of an existing file (reference skeleton style): `part <'PHY-001'> aircraft : EVTOLAircraft[12];` with callouts "short name (Session 2)", "name", "definition", "multiplicity 12 (FICTIONAL fleet size)".
- **Sources.** R80 pp.63–64, 73; R70 sl.12. AeroLink: `sysml/reference/aerolink_v01_skeleton.sysml` (Physical package).

#### S1.17 Specialization (2 min)
- **Purpose.** Taxonomies of definitions.
- **Content.**
  - A specialized definition classifies a subset of what its general definition classifies, inherits its features and may add its own; `:>` is equivalent to `specializes`; a definition may specialize several (R70 sl.10; R80 pp.64, 72).
  - An abstract definition's instances must also be instances of some concrete specialization (R70 sl.10; R80 p.72).
- **Figure / SysML v2 example.** From the existing worked file `sysml/week09/aerolink_def_usage.sysml`: `abstract part def Charger`, `HighPowerCharger :> Charger`, `StandardCharger :> Charger` (FICTIONAL ratings).
- **Sources.** R70 sl.10; R80 pp.64, 72.

#### S1.18 Subsetting (3 min)
- **Purpose.** Features that are "among" other features.
- **Content.**
  - Subsetting asserts that, in any common context, the values of one feature are a subset of the values of another (R70 sl.11).
  - The subsetting usage may further constrain definition and multiplicity; it is an additional feature, the subsetted one remains (R80 p.64).
  - AeroLink: a hub's two turnaround chargers are among its chargers: `turnaroundChargers : HighPowerCharger[2] subsets chargers`.
  - Think-pair (30 s): does a hub with `chargers[4]` and `turnaroundChargers[2] subsets chargers` have four or six chargers?
- **Figure.** Venn sketch: the set "chargers (4)" containing "turnaroundChargers (2)".
- **Sources.** R70 sl.11; R80 p.64. AeroLink: `sysml/week09/aerolink_def_usage.sysml`.

#### S1.19 Redefinition (3 min)
- **Purpose.** Replacing an inherited feature in context.
- **Content.**
  - Redefinition is a kind of subsetting in which the redefining usage replaces the redefined usage in its context (R80 p.65).
  - It can change the name, specialize the type and constrain the multiplicity; `:>>` is equivalent to `redefines`; `part redefines cyl[4]` keeps the name (R70 sl.12).
  - Usages inherit from their definitions and can redefine "to any level of nesting" (R70 sl.15).
  - AeroLink: at a spoke, `chargers` is redefined with type `StandardCharger`, so every charger at a spoke is standard.
- **Figure / SysML v2 example.** Side by side, R70 sl.12's engine (cyl[4..6] redefined to [4] and [6]) and the AeroLink spoke redefinition from `aerolink_def_usage.sysml`.
- **Sources.** R80 p.65; R70 sl.12, sl.15.

#### S1.20 One symbol, two meanings (3 min)
- **Purpose.** The reading error students make most often.
- **Content.**
  - After a definition's name, `:>` means specialization (subclassification). After a usage's name, `:>` means subsetting, so what follows must be a feature (R80 p.72).
  - A usage has three owned specializations: feature typing `:`, subsetting `:>`, redefinition `:>>` (R80 p.72).
  - Equivalent forms: `item x : A, B :> f :>> g;` is `item x defined by A defined by B subsets f redefines g;` (R80 p.72).
  - Predict (1 min): a usage that "subsets" a part definition; does the checker accept it? (Recorded result: rejected. File: `invalid_pc8_usage_subsets_a_definition.sysml`.)
- **Figure.** A decision tree: "Is the thing left of `:>` a definition or a usage?" → specialization / subsetting → "what must be on the right?".
- **Sources.** R80 p.72. Checker result: `sysml/validation-report.json` (FAIL, as intended).

**Transition E → F.** "Parts have numbers attached: speeds, powers, durations. SysML v2 treats units more carefully than a spreadsheet does."

### Section F: Attributes, units and a worked configuration (7 min)

#### S1.21 Attributes and quantities with units (3 min)
- **Purpose.** Typed quantities, the basis for every later analysis.
- **Content.**
  - An attribute definition defines a set of data values: numbers, quantities with units, strings, structures (R80 p.77).
  - Quantities with units are defined with the Quantities and Units Domain Library; only the *kind* of unit belongs to the attribute definition; the specific unit comes with the value, so `18 [min]` and `1080 [s]` are both acceptable values of a `DurationValue` (R80 p.77).
  - The library's ISQ package gives standard quantity kinds; a quantity is a usage of a quantity value representing a feature of something (R79 sl.164, sl.167).
  - AeroLink: `attribute operatingDay : DurationValue = 16 [h];` (FICTIONAL) in `ENT-001`.
- **Figure / SysML v2 example.** Excerpt of `aerolink_v01_skeleton.sysml` lines 37–40 (ENT-001 with `operatingDay` and `vertiportCount : Natural = 6`), with callouts "quantity kind from ISQ", "unit given with the value", "count as a natural number".
- **Sources.** R80 p.77; R79 sl.164, sl.167.

#### S1.22 Worked example: definitions describe kinds; usages describe configurations (4 min)
- **Purpose.** All of Section E applied to one AeroLink fragment, and the Phase I trade decision expressed as a configuration.
- **Content.**
  - `aerolink_def_usage.sysml` models the vertiport network: abstract `Charger` with two specializations whose ratings are bound in the definitions; `HubVertiport` subsets its turnaround chargers; `SpokeVertiport` redefines its chargers.
  - `baselineNetwork` and `alt004Network` both subset the package-level `vertiportNetwork` and redefine multiplicities (6 sites, 3 hubs, 3 spokes; and 6, 4, 2 for the recommended alternative ALT-004). They are siblings; neither edits the definitions (R80 p.65; R70 sl.16).
  - Rule of thumb (course convention): a value that defines a kind goes in the definition; a configuration value goes in a usage.
  - Students classify five marked tokens as specialization, subsetting, redefinition or typing (whole class, 1 min).
- **Figure / SysML v2 example.** The existing file, lines 11–51 (PASS, 2026-10-11 run), with the five tokens highlighted.
- **Sources.** R80 p.65; R70 sl.10–16. AeroLink DEC-001/ALT-004: `src/model/reference/week07.ts`. FICTIONAL.

**Transition F → G.** "You have read nine listings today. Before you write your own, calibrate what the checker will and will not tell you."

### Section G: Calibration and exit (5 min)

#### S1.23 Predict the checker (3 min)
- **Purpose.** Separate validity from correctness before the students rely on a tool (B8.7).
- **Content.** Three listings; vote PASS or FAIL, then reveal the recorded result.
  1. `block EVTOLAircraft { … }` (SysML v1 keyword): **FAIL**, a syntax error (`invalid_pc5_block_keyword.sysml`).
  2. Two parts given the same short name `<'PHY-004'>`: **PASS with two warnings** ("Duplicate of other owned member name") (`predict_pc2_duplicate_short_name.sysml`).
  3. An attribute definition that owns a `part`: **PASS, no message** (`predict_pc6_attribute_def_with_part.sysml`), although an attribute definition may not have composite features (R70 sl.9; R80 p.77).
  - Teaching point: a PASS shows the file parsed and no rule fired; item 3 passed with a real modeling error. The team, not the tool, is responsible for meaning.
- **Figure.** Three cards with a hidden PASS/FAIL stamp, revealed in sequence; item 3 stamped "PASS — but wrong".
- **Sources.** R70 sl.9; R80 p.77. Checker results: `sysml/validation-report.json` (run of 2026-10-11, release 2026-08).

#### S1.24 Exit and preparation (2 min)
- **Purpose.** Retrieval and readiness for Session 2.
- **Content.**
  - Exit ticket (one line each): (a) one place your Week 7 package repeats a value; (b) in `part x : A :> y;`, what is `y`?
  - Before Session 2: confirm the checker runs on your machine (≈ 15 min, instructions on the course site); bring the Week 7 package's ID list.
- **Figure.** Two-line ticket card; a checklist with "checker runs: pass file and fail file".
- **Sources.** Course convention.

**Session 1 timing.** A 8 (2+3+3) · B 14 (3+3+3+3+2) · C 7 (4+3) · D 8 (4+2+2) · E 20 (3+3+3+2+3+3+3) · F 7 (3+4) · G 5 (3+2) = **69 min + 6 min buffer = 75 min**. Slide 25: References and credits (0 min; S10 CC BY 4.0 notice; SEBoK CC BY-NC-SA 3.0 statement as in Week 1).

## 3. Session 2: Packages, toolchain, the import, stakeholders and concerns, lab launch (75 min)

**Split.** About 47 min of lecture (16 slides) and 22 min of lab launch (4 slides), the Week 1 pattern.

### Section H: Retrieval (2 min)

#### S2.1 Warm-up: read this listing (2 min)
- **Purpose.** Retrieve Session 1 before adding to it.
- **Content.** A six-line listing (unseen, not AeroLink: a library building with `part def Room`, `part rooms : Room[*]`, `part studyRooms : StudyRoom[4] subsets rooms`). Three questions: which line is a specialization, which a subsetting, how many rooms at least? Answers revealed on the slide after a 60-second think.
- **Figure.** The listing with blank callout boxes.
- **Sources.** R70 sl.10–11; R80 p.64. Instructor-authored example; *to be checker-validated*.

### Section I: Packages and names (11 min)

#### S2.2 Packages, namespaces and qualified names (3 min)
- **Purpose.** How a model is organized and how one element refers to another.
- **Content.**
  - A namespace contains elements and names them; a package is a namespace used solely to organize the model (R80 pp.55–56).
  - A package acts as a namespace for its members and a container for its owned members; a name with spaces or special characters is quoted; a qualified name joins names with `::` (R70 sl.5).
  - Definitions and usages are namespaces too (R80 p.56).
  - AeroLink: `Stakeholders::'STK-001'`, `Context::AeroLinkEnterprise`.
- **Figure.** A nested package tree with one qualified-name path traced through it.
- **Sources.** R80 pp.55–56; R70 sl.5.

#### S2.3 Imports and visibility (3 min)
- **Purpose.** The import rules that most first models break.
- **Content.**
  - An import adds one member, or all members (`::*`), of another namespace; `::**` imports recursively (R70 sl.5; R80 p.60).
  - Members are public by default; members of a private import are not re-exported; visibility must be shown explicitly on import declarations, and private is advised unless re-export is required (R70 sl.6).
  - An import owned by a root namespace must be private (R80 p.63).
  - AeroLink's root package begins `private import ISQ::*; private import SI::*; private import ScalarValues::*;` (reference skeleton lines 21–23).
  - Recorded result: an import written without visibility fails in the 2026-08 checker (`invalid_pc3_import_without_visibility.sysml`).
- **Figure.** Two packages; a private import arrow (elements stop at the boundary) and a public import arrow (elements pass through to a third package).
- **Sources.** R70 sl.5–6; R80 pp.60, 63. Checker result: `sysml/validation-report.json`.

#### S2.4 Names and short names: carrying the Phase I IDs (3 min)
- **Purpose.** The course rule that keeps the digital thread by ID.
- **Content.**
  - The notation cannot write the tool's element ID; an element may have a name and a short name, the short name in `< >` before the name (R80 p.49). The short name "can be a user or tool selected id" (R90 sl.22).
  - A basic name starts with a letter or underscore and continues with letters, digits or underscores; anything else is an unrestricted name in single quotes (R80 pp.49–50).
  - Course convention: every Phase I ID becomes a quoted short name: `part def <'STK-005'> 'Vertiport Operators'`; references use it: `Stakeholders::'STK-005'`. IDs contain hyphens, so the quotes are mandatory.
  - Recorded result: `part <PHY-003> …` (unquoted) fails with "mismatched input '-' expecting '>'" (`invalid_unquoted_short_name.sysml`).
- **Figure.** An anatomy strip of one declaration: keyword · short name · name · body, each labeled.
- **Sources.** R80 pp.49–50; R90 sl.22. Course convention (ID rule; lab plan C.2 rule 3; `sysml/reference/README.md` §3.1).

#### S2.5 Comments, documentation and notes (2 min)
- **Purpose.** Where the Phase I prose goes.
- **Content.**
  - A comment `/* … */` is part of the model; a note `// …` is in the text but not in the model (R70 sl.7).
  - Documentation (`doc /* … */`) is a comment owned by the element it documents (R70 sl.8).
  - Course convention: the Phase I statement, rationale and register fields that have no modeled attribute go into `doc`, so nothing in the package is lost; notes are for the modeler only.
- **Figure.** Three snippets side by side, each with a "in the model? yes/no" badge.
- **Sources.** R70 sl.7–8. Course convention.

### Section J: The toolchain (6 min)

#### S2.6 The course toolchain (3 min)
- **Purpose.** Answer "what do I type into, and what decides if it is right?"
- **Content (all course convention).**
  - **Course-designated checker:** the OMG SysML v2 Pilot Implementation, release 2026-08, published with the 2.1 Beta 2 texts this course cites. It is a pilot implementation, not the formal SysML 2.0 publication. Grades follow the instructor's checker run.
  - **Authoring:** the textual notation in a SysML notebook or a text editor, run through the checker; one file per model version, because each file is checked on its own.
  - **Course workbench:** the in-browser views of the team model (trace matrix, stakeholder table, context view) and the course's own acceptance checks; it is a teaching environment, not a SysML tool.
  - **Optional:** Eclipse SysON locally (Docker), for graphical editing. Not required and not graded on the tool.
- **Figure.** A flow: editor → `.sysml` file → checker (PASS/FAIL log) → workbench views; SysON dashed as optional.
- **Sources.** `docs/SYSML_TOOLCHAIN.md`; DECISION_LOG A8, A13 (faculty sources only; not on the slide face).

#### S2.7 What the checker decides, and what it cannot (3 min)
- **Purpose.** Make the validity/meaning distinction operational (B8.7).
- **Content.**
  - For each file the checker parses the text, resolves every name against the file and the standard library, and runs its validation rules. An ERROR fails the file; a WARNING does not (course toolchain).
  - It does not judge: whether units are of the right kind for the attribute's purpose, whether a stakeholder is the right one, whether a concern says what the register says, whether the model serves its purpose (R33b pp.295–296).
  - Recall S1.23: an attribute definition owning a part passed silently.
  - Rubric consequence: validity (zero errors) and structure semantics are separate rubric criteria.
- **Figure.** Two columns: "Checker decides" (syntax, name resolution, rule violations) / "You decide" (semantics, completeness, fidelity to the package, purpose).
- **Sources.** `docs/SYSML_TOOLCHAIN.md`; R33b pp.295–296; ASSESSMENT_RUBRICS RB-8.1, RB-8.3 (faculty source).

### Section K: Importing the package (10 min)

#### S2.8 The import is a mapping, not a copy (3 min)
- **Purpose.** Define "import" for this course.
- **Content (course convention, from the course's weekly lab deliverables).**
  - Import means: every artifact of the Week 7 package, by ID, gets a home in the model (a package) and a construct (part def, concern, requirement, use case …), or an explicit reason why it waits for a later week.
  - Week 8 *models* the context and the stakeholder content; it *maps* everything else, so that Weeks 9–13 fill packages that already exist.
  - Nothing is retyped from memory: the package is the source; disagreements found while modeling are recorded, not silently fixed.
  - The documents become views generated at milestones (R28 p.374).
- **Figure.** The Week 7 package's table of contents on the left; arrows to model packages on the right; three arrows solid (modeled now), the rest dashed with the week number.
- **Sources.** Course convention (based on the course's weekly lab deliverable notes, Lab 1A/1B and 2A/2B: repository and package structure, naming standards, artifact-to-model mapping matrix, enterprise context and stakeholder model). R28 p.374.

#### S2.9 The artifact-to-model mapping matrix (4 min)
- **Purpose.** Show the matrix the team will produce, on AeroLink.
- **Content.** The AeroLink matrix by kind (reused, reviewed draft table):

  | Phase I kind (week) | Package | Construct | AeroLink example |
  |---|---|---|---|
  | ENT (1) | Context | part def (system of interest) | `part def <'ENT-001'> AeroLinkEnterprise` |
  | EXT (1) | Context | part usage in the context part | `part <'EXT-001'> ansp : AirNavigationServiceProvider` |
  | STK (1) | Stakeholders | part def, used as stakeholder type | `part def <'STK-005'> 'Vertiport Operators'` |
  | CON (1) | Stakeholders | concern with subject and stakeholder | `concern <'CON-001'> 'Predictable waiting time'` |
  | REL (1) | Stakeholders | keyword dependency (proposed) | `REL-002` STK-004 conflicts-with STK-005 |
  | MGO, NEED (1–2) | Needs | requirement with stakeholder and frame | Week 9 |
  | REQ (2) | Requirements | requirement with subject | Week 9 |
  | CAP, SCN (2) | Needs; Behavior | action def; use case | Weeks 9–10 |
  | FN, LOG, INFO (4) | Logical; Physical | action usages; parts; item defs | Weeks 10–11 |
  | PHY, IF (5) | Physical (external IF in Context) | part usages; interface usages | Week 11 |
  | MOE, MOP, VER (2) | owned by what they measure; Verification | attributes; verification cases | Week 12 |
  | TECH, A/R/O/U, ALT, CRIT, DEC (3) | Analysis; AROU | part def with TRL; metadata; analysis | Weeks 12–13 |
  | Roadmap increments (6) | Evolution (proposed) | to be decided in Week 14 | Week 14 |

  - Teams decide and record where kinds without an obvious home go; the reason is graded, not the choice.
- **Figure.** The table, with the three "modeled now" rows highlighted.
- **Sources.** Course convention (lab plan C.2; `sysml/reference/README.md` §§2–3.2). Week numbers per COURSE_SCHEDULE rule 6.

#### S2.10 The model's package structure (3 min)
- **Purpose.** A skeleton that mirrors the artifact map, so later weeks have a place to work.
- **Content.**
  - AeroLink's root package `'AeroLink Reference Model'` with packages Context, Stakeholders, Needs, Requirements, Logical, Physical, Behavior, Verification, AROU, plus Measures, Analysis and Traceability (reference README §2).
  - Every package that is still empty carries a `doc` saying which week fills it.
  - The root `doc` states the model's purpose (S1.8).
- **Figure / SysML v2 example.** Excerpt of the existing file `sysml/week09/aerolink_l9_skeleton.sysml` (root package, imports, the empty packages with their `doc` lines). PASS, 2026-10-11 run.
- **Sources.** Course convention (`sysml/reference/README.md` §2). R70 sl.6, sl.8.

**Transition K → L.** "The first artifact we model, not just map, is the one Phase I started with: who the stakeholders are and what they care about."

### Section L: Stakeholders and concerns as model elements (13 min)

#### S2.11 Stakeholders and concerns in SysML v2 (3 min)
- **Purpose.** The language constructs, from the sources.
- **Content.**
  - "A stakeholder is a person, organization or other entity with concerns to be addressed"; "a concern is a specific topic that one or more stakeholders desire to be addressed" (R77 sl.115).
  - A concern is declared like a requirement, with the keyword `concern`; the intent is that stakeholders' concerns are modeled as the required constraints of a concern, with stakeholder parameters (R83 p.167).
  - A subject must be declared first, before any stakeholders; stakeholders may be specified for any kind of requirement, not only concerns (R77 sl.115).
  - Source caution (instructor only): the deck declares `part def 'Systems Engineer'` but types a stakeholder as `'systems engineer'`; the case mismatch is a slide typo, not a language rule.
- **Figure / SysML v2 example.** Simplified from R77 sl.115:
  ```sysml
  part def 'IV&V';
  concern modularity {
      subject system;
      stakeholder ivv : 'IV&V';
  }
  ```
  *to be checker-validated* (adapted).
- **Sources.** R77 sl.115; R83 p.167.

#### S2.12 Where concerns go next: framed by requirements and viewpoints (3 min)
- **Purpose.** Show why concerns are modeled now: later elements frame them.
- **Content.**
  - A concern can be framed in other requirement definitions and usages with `frame`; a framed concern is a subrequirement and therefore a required constraint of its container (R83 p.167).
  - A viewpoint is a requirement to present model information in a view that addresses stakeholder concerns; it frames those concerns; any requirement may frame relevant concerns (R77 sl.116).
  - A viewpoint definition is a kind of requirement definition that frames the concerns of stakeholders; its subject is a view (R85 p.181).
  - So the Week 1 concern is the anchor for Week 9's needs (`frame`) and Week 14's stakeholder views (viewpoints).
- **Figure.** One concern node (CON-001) with two incoming `frame` arrows: from NEED-001 (Week 9) and from a "passenger-experience viewpoint" (Week 14).
- **Sources.** R83 p.167; R77 sl.116; R85 p.181.

#### S2.13 AeroLink worked example I: the context part (3 min)
- **Purpose.** Model the Week 1 system of interest and context.
- **Content.**
  - `ENT-001` is a part definition (the enterprise as the system of interest's type), with FICTIONAL attributes such as `operatingDay = 16 [h]` and `vertiportCount = 6`.
  - The context part `aeroLinkContext` holds `ref part systemOfInterest :> Physical::aeroLink` and the six external systems as part usages with their EXT short names.
  - Reading: why is the system of interest a `ref part` here? (It is owned by the Physical package; the context refers to it.)
  - Continuity flag: the reference model still names EXT-001, -002, -004 and -006 after organizations; the Week 1 lecture renamed them as systems (controlled airspace, electric grid, aircraft and spares supply, emergency response service). Until faculty adopt the renaming, the slide shows the lecture names with the reference IDs.
- **Figure / SysML v2 example.** Existing file `aerolink_v01_skeleton.sysml` lines 35–74, abridged (ENT-001 with two attributes; the six EXT usages). PASS, 2026-10-11 run.
- **Sources.** R80 p.64 (referential vs composite); R70 sl.9. AeroLink: reference skeleton; `src/model/reference/week01.ts`; `docs/lectures/week01/AEROLINK_CASE_CHANGES.md` §5 item 5.

#### S2.14 AeroLink worked example II: stakeholders, concerns, register fields and relationships (4 min)
- **Purpose.** Model the Week 1 register: every STK, every CON, the ratings with reasons, and the relationships.
- **Content.**
  - Each STK is a part definition with its ID as short name; each CON is a concern with `subject enterprise : Context::AeroLinkEnterprise` and `stakeholder … : 'STK-n'` (existing reference pattern; 14 STK, 16 CON).
  - What the reference does not yet model: interest, influence and support with their reasons are only in `doc` text; REL-001..008 are absent. Proposed: a `StakeholderAssessment` metadata definition and keyword dependencies for relationships (user-defined keywords, PX3 p.193; dependencies, R80 pp.50–51).
  - Students say which form is better for a later query ("list all stakeholders with influence ≥ 4"): a value inside `doc` or a metadata attribute.
- **Figure / SysML v2 example.** Existing (reference skeleton lines 78 and 92–96):
  ```sysml
  part def <'STK-001'> 'Passengers' { doc /* … */ }
  concern <'CON-001'> 'Predictable waiting time' {
      doc /* … */
      subject enterprise : Context::AeroLinkEnterprise;
      stakeholder passengers : 'STK-001';
  }
  ```
  Proposed (new fragment, *to be checker-validated*; values from `aerolinkCase.ts`, FICTIONAL):
  ```sysml
  metadata def StakeholderAssessment {
      attribute interest : Natural;
      attribute influence : Natural;
      attribute influenceReason : String;
  }
  metadata def <conflictsWith> ConflictsWithLink {
      :> annotatedElement : SysML::Dependency;
  }
  part def <'STK-005'> 'Vertiport operators' {
      @StakeholderAssessment { interest = 5; influence = 4;
          influenceReason = "Own a scarce capacity constraint (pads, chargers)"; }
  }
  #conflictsWith dependency <'REL-002'> 'Noise and siting vs throughput'
      from 'STK-004' to 'STK-005';
  ```
  *Revised:* `from` is the dependent element (client) and `to` the element it depends on (supplier), R80 pp.50–51. A conflict is symmetric (register order kept); a directed type is written from the dependent, e.g. `#regulatedBy dependency <'REL-001'> from 'STK-011' to 'STK-002'` for "STK-002 regulates STK-011".
- **Sources.** R77 sl.115; R83 p.167; R80 pp.50–51; **PX3 p.193 (register addition)**; R70 sl.8. AeroLink: reference skeleton; `aerolinkCase.ts` (STK-005, REL-002).

### Section M: Auditing the import, and the bridge (5 min)

#### S2.15 Worked example III: auditing the import (3 min)
- **Purpose.** The checks the checker cannot do (B8.7).
- **Content.** Four questions applied to the AeroLink Stakeholders package (course convention):
  1. **Completeness:** every STK and CON in the Phase I register appears once, with the same ID and name.
  2. **Structure:** every concern has a subject and at least one stakeholder typed by an STK part definition; every STK has at least one concern.
  3. **Fidelity:** the concern's `doc` says what the register says; differences are logged, not fixed silently.
  4. **Gaps:** what the package holds that the model does not yet (REL; ratings; STK-015 and CON-017 pending adoption), each with a disposition.
  - Model answer (reference v0.1): 14 STK, 16 CON, each concern with one `stakeholder` declaration (the file holds 27 in all, the rest on needs); REL and ratings flagged as gaps.
- **Figure.** A four-row audit checklist with AeroLink results (✓ / gap) and a disposition column.
- **Sources.** Course convention. AeroLink: `aerolink_v01_skeleton.sysml`; `AEROLINK_CASE_CHANGES.md` §5 items 3 and 7.

#### S2.16 Bridge: Week 9 (2 min)
- **Purpose.** Show where the modeled concerns go next.
- **Content.**
  - Week 9 models the Week 2 needs and requirements: needs frame these concerns; requirements get subjects and are derived from needs.
  - The requirement constructs are new next week; today's concerns already use the requirement pattern (R83 p.167).
- **Figure.** The concern node from S2.12 with a "Week 9" arrow to a requirement box.
- **Sources.** COURSE_SCHEDULE.md rule 6; R83 p.167.

### Section N: Laboratory launch (22 min)

#### S2.17 Lab L8 brief (3 min)
- **Purpose.** What each team delivers, and when.
- **Content.** Model v0.1 of the team's own enterprise: package skeleton with purpose; mapping matrix for the whole Week 7 package; Context and Stakeholders packages fully modeled; import audit note; checker log (pass and fail proof plus the final zero-error run); AI-use statement. Due before Week 9 Session 1.
- **Figure.** The deliverable list as five tiles plus the AI statement.
- **Sources.** Course convention (§5).

#### S2.18 Team work: draft the mapping matrix and the skeleton (12 min)
- **Purpose.** Start the hardest decision in class, with the instructor circulating.
- **Content.** Teams list every ID kind in their Week 7 package, assign package and construct, and mark "modeled now" or "week N". Each member writes one empty package with its `doc`.
- **Figure.** A blank matrix template on screen with a 12-minute timer.
- **Sources.** Course convention.

#### S2.19 Checkpoint: prove the toolchain (5 min)
- **Purpose.** No team leaves without a working checker.
- **Content.** Each team runs the provided pass file and fail file and shows both outputs; teams with a failing setup get the lab-machine fallback.
- **Figure.** Two expected outputs side by side (no errors; one error at the short name).
- **Sources.** Course convention (`docs/SYSML_TOOLCHAIN.md`).

#### S2.20 Close: the next seven days (2 min)
- **Purpose.** The plan to the deadline.
- **Content.** Day 1–2 matrix and skeleton; day 3–4 Context and Stakeholders; day 5 audit; day 6 checker to zero errors; day 7 integrate and submit. Reading for Week 9: requirement definitions.
- **Figure.** A seven-day strip.
- **Sources.** Course convention.

**Session 2 timing.** H 2 · I 11 (3+3+3+2) · J 6 (3+3) · K 10 (3+4+3) · L 13 (3+3+3+4) · M 5 (3+2) = 47 min lecture · N 22 (3+12+5+2) = **69 min + 6 min buffer = 75 min**. Slide 21: References and credits (0 min).

## 4. AeroLink worked model example (continues Phase I Week 1)

**Continuity.** Week 1 built the AeroLink register (ENT-001, EXT-001..006, STK-001..014, CON-001..016, REL-001..008; proposed STK-015, CON-017). Week 8 models it. The reference model at this level is `aerolink_v01_skeleton.sysml` (the L9 skeleton: 80 IDs declared), which also already holds the MGO, NEED, CAP and SCN content that Weeks 9–10 will teach; Week 8 shows only its Context and Stakeholders packages and the package structure.

### 4.1 Existing fragments (reuse)

| File | Shows | Used on | Checker status |
|---|---|---|---|
| `sysml/reference/aerolink_v01_skeleton.sysml` | Package structure; Context (ENT-001, EXT parts, context part); Stakeholders (14 STK, 16 CON with subject and stakeholder) | S1.16, S1.21, S2.3, S2.10, S2.13, S2.14, S2.15 | PASS in the 2026-10-11 checker run (zero errors, zero warnings) |
| `sysml/week09/aerolink_def_usage.sysml` | Vertiport network: specialization, subsetting, redefinition; baseline and ALT-004 configurations | S1.17–S1.19, S1.22 | PASS in the 2026-10-11 checker run |
| `sysml/week09/aerolink_network_stated.sysml` | Stating an entailed property as asserted constraints | Lesson (advanced) | PASS in the 2026-10-11 checker run |
| `sysml/week09/aerolink_l9_skeleton.sysml` | Miniature skeleton: packages with `doc`, private imports, PHY with ISQ/SI attributes | S2.10; lab starter | PASS in the 2026-10-11 checker run |
| `sysml/week09/invalid_unquoted_short_name.sysml` | Unquoted short name | S2.4; lab tool proof (fail file) | FAIL in the 2026-10-11 run, as intended |
| `sysml/week09/invalid_pc3_import_without_visibility.sysml` | Import without visibility | S2.3 | FAIL, as intended |
| `sysml/week09/invalid_pc5_block_keyword.sysml` | v1 `block` keyword | S1.23 | FAIL, as intended |
| `sysml/week09/invalid_pc8_usage_subsets_a_definition.sysml` | Usage subsetting a definition | S1.20 | FAIL, as intended |
| `sysml/week09/predict_pc2_duplicate_short_name.sysml` | Duplicate short names | S1.23 | PASS with 2 warnings |
| `sysml/week09/predict_pc6_attribute_def_with_part.sysml` | Attribute def owning a part (semantic error) | S1.23, S2.7 | PASS, no message (teaching point) |
| `sysml/week09/invalid_pc1_*`, `invalid_pc7_*`, `predict_pc4_*` | Further predict items | Lesson practice set | FAIL / FAIL / PASS with warning |

All `sysml/week09/` files are in the old numbering's folder; they move or are copied (unchanged) to `sysml/lectures/week08/` when the lecture source is built, or are referenced in place (faculty or lead decision; §11).

### 4.2 Needed fragments (to be written and checker-validated)

| Proposed path | Must show | Used on |
|---|---|---|
| `sysml/lectures/week08/aerolink_stakeholder_register.sysml` | All 14 reference STK (plus STK-015 if adopted) with a `StakeholderAssessment` metadata annotation carrying interest, influence, support and the reasons from `aerolinkCase.ts`; the 16 (or 17) concerns unchanged from the reference | S2.14, S2.15; lab exemplar |
| `sysml/lectures/week08/aerolink_stakeholder_relationships.sysml` | REL-001..008 as keyword dependencies, one metadata definition per relationship type (regulates, conflicts-with, supplies, funds, coordinates-with, affected-by), each with its REL short name and the Week 1 note in `doc` | S2.14; lab exemplar |
| `sysml/lectures/week08/aerolink_context_lecture_names.sysml` | The context part with the Week 1 lecture's system names for EXT-001/002/004/006 and the owning stakeholder recorded separately (only if faculty adopt the renaming) | S2.13 |
| `sysml/lectures/week08/warmup_library_rooms.sysml` | The unseen S2.1 listing (definition, subsetting with multiplicity) | S2.1 |
| `sysml/lectures/week08/stakeholders_concerns_adapted.sysml` | The S2.11 adaptation of R77 sl.115 (case-consistent names) | S2.11 |
| `sysml/lectures/week08/invalid_exercise_microgrid_seeded.sysml` | Applied-exercise file with three seeded defects (two the checker reports: the import without visibility and the unquoted short name; one it accepts silently: a composite part in an attribute definition), shown whole on the Assessment page with its own line numbers; `exercise_microgrid_defects12_fixed.sysml` (defects 1 and 2 fixed) and the corrected key `sysml/instructor/week08/exercise_microgrid_key.sysml` (instructor-only) | §6.2 |

Each needed file must pass the checker (zero errors; warnings explained), and `sysmlMapping.test.ts`/`sysmlDrift.test.ts` coverage must be extended or the files declared outside the reference baseline (lead decision).

## 5. Laboratory outline: Lab L8, model v0.1 (import and stakeholder model)

### 5.1 Inputs
- The team's approved Week 7 Systems Thinking Engineering Package and its ID list (instructor feedback from Week 7 applied or logged).
- Session 1–2 slides and the long-form lesson; the AeroLink worked examples (S2.9 matrix, S2.13–S2.15).
- Starter: `aerolink_l9_skeleton.sysml` (as a pattern, not to copy names); the pass and fail tool-proof files.
- Readings (essential): R33a pp.290–292; R28 pp.370–374; R70 sl.3–16; R77 sl.115–116; R80 pp.47–50, 63–65.

### 5.2 Objectives
B8.4, B8.5, B8.6 and B8.7, applied to the team's own enterprise.

### 5.3 Method
1. **Purpose first:** one root `doc` paragraph: who uses the model, for which decisions (S1.8).
2. **Mapping matrix:** every ID kind in the Week 7 package → package, construct, week; a reason for every non-obvious choice (S2.8–S2.9).
3. **Skeleton:** packages mirroring the matrix; private imports; `doc` on empty packages (S2.2–S2.5, S2.10).
4. **Context:** ENT as a part definition; the context part with the system of interest and every EXT as a part usage with its short name (S2.13).
5. **Stakeholders and concerns:** every STK as a part definition, every CON as a concern with subject and stakeholder; register ratings and reasons as metadata (or in `doc`, with the trade-off stated); REL entries as keyword dependencies (S2.14).
6. **Import audit:** the four questions of S2.15, with a disposition for every gap.
7. **Checker:** pass/fail proof, then iterate the model to zero errors; explain every warning.

### 5.4 Procedure

| Step | When | Lead role | Output |
|---|---|---|---|
| 1. Tool proof (pass file, fail file) | Before Session 2; checkpoint S2.19 | Every member | Two outputs in the checker log |
| 2. Mapping matrix draft | In class S2.18 (12 min), finish day 1–2 | Architecture | Matrix v1 |
| 3. Skeleton with purpose and package `doc` | Day 1–2 | Each member writes ≥ 1 package | `team-NN-model-v01.sysml` (skeleton) |
| 4. Context package | Day 3 | Architecture | ENT, EXT, context part |
| 5. Stakeholders package (STK, CON, ratings, REL) | Day 3–4 | Requirements & Compliance (STK, CON); Architecture (REL) | Stakeholders package |
| 6. Import audit | Day 5 | V&V lead | Audit note with dispositions |
| 7. Checker to zero errors; warnings explained | Day 6 | AI & Data lead runs; owners fix | Final checker log |
| 8. AI usage statement; every AI-suggested element tagged and reviewed | Day 6 | AI & Data lead | Statement |
| 9. Integration review and upload | Day 7 | V&V lead | Submission |

### 5.5 Outputs
`team-NN-model-v01.sysml`; `team-NN-mapping-matrix.md` (or .csv); `team-NN-import-audit.md`; `team-NN-checker-log.txt` (pass/fail proof and final run); AI usage statement. Ownership: each element's owner listed in the matrix (individual accountability).

### 5.6 Rubric rows (from ASSESSMENT_RUBRICS.md)

| Row | Criterion | Applied this week |
|---|---|---|
| RB-8.1 | Validity | Yes (formative now, summative later): zero errors; warnings explained for level 4 |
| RB-8.2 | Organization and conventions | Yes: package structure mirrors the mapping matrix; short-name IDs consistent and quoted; imports explicit with visibility |
| RB-8.3 | Structure semantics | Partly: definition versus usage for STK (definition), EXT (usage), ENT (definition), context part (usage); ref versus composite. Ports, interfaces and units deferred (Week 11) |
| RB-8.6 | Completeness versus minimums | Context and Stakeholders packages only: every Phase I STK, CON and EXT present |
| RB-1.3 / RB-1.4 | Concerns; relationships | Carried from Week 1 as fidelity checks: concerns specific; relationships including ≥ 1 conflict modeled |
| RB-9.4 | Trace audit (partial) | The import audit: coverage of STK/CON, gaps with dispositions |
| RB-12.1–12.3 | AI usage statement | Yes; AI-generated SysML must be accepted by the checker and explained by its owner (12.3) |
| Completeness check | Tool proof; mapping matrix covers every ID kind | Not scored |

The RB-8 parse gate (§0 safeguard 5 of the rubrics) does not apply this week, because the grading mode is formative. **Grading mode:** formative feedback returned before Week 9 Session 2; summative RB-8 scoring at the later model checkpoint (faculty decision).

### 5.7 Realistic per-student workload (budget ≤ 8 h)

| Activity | Hours per student | Basis |
|---|---|---|
| Class sessions (2 × 75 min) | 2.5 | Timetable |
| Readings: R33a 3 pp, R28 5 pp, R80 7 pp (15 pp at ≈ 15 pp/h ≈ 1.0 h); R70 sl.3–16 and R77 sl.115–116 (16 slides ≈ 0.5 h) | 1.5 | Register page counts |
| Long-form lesson and worked examples | 0.4 | ≈ 4,000 words |
| Tool proof before Session 2 | 0.2 | *Revised:* run on any working installation; the checker is installed once per team in Week 8 (about 0.9 person-hour, inside the lab hours); a personal installation is optional and not counted. No Week 7 installation task exists. |
| Lab out of class: student's share of steps 2–9 | 2.0 | ≈ 8 person-hours per team of 4 (matrix 1.5; skeleton 1.0; context 1.0; stakeholders 2.5; audit 1.0; checker iterations 0.5; AI statement and integration 0.5) |
| Quiz Q8 | 0.3 | 12 items |
| Applied exercise | 0.8 | *Revised:* about 45 min (task 3 without a metadata definition; task 5 with both recorded outputs) |
| Time log | 0.1 | |
| **Total** | **7.7** | Within 8 h. A 3-person team carries ≈ 2.7 h of lab each (total ≈ 8.4 h) unless the REL modeling is reduced to the conflict relationships only. If the checker is not pre-installed, add ≈ 1 h (total ≈ 8.7 h). |

## 6. Assessment outline (separate from the lecture)

Items use unseen, non-AeroLink contexts; none reuses a slide's wording or a worked-example answer.

### 6.1 Quiz Q8 (individual, 15 min, closed book, 12 items)
- **Format.** 9 single-best-answer items + 3 short-answer items (≤ 40 words). Keys distributed evenly across positions; distractors from the common errors (definition/usage confusion; `:>` misread; view treated as a separate master; PASS treated as correct); no key longer than its distractors.

| # | Objective | Bloom | Item focus (unseen context) | Key rests on |
|---|---|---|---|---|
| 1 | B8.1 | Understand | Which definition element makes a model *selective*? (choose the property) | R33a p.290 |
| 2 | B8.1 | Apply | A team keeps a spreadsheet and a diagram for two leads; what should exist instead? | R80 p.48; R33c p.300 |
| 3 | B8.1 | Evaluate | A valid model with no stated purpose asks for the top grade; best reply | R33b pp.295–296 |
| 4 | B8.2 | Understand | Which layer holds element, namespace and import, with no model-level semantics? | R70 sl.3–4 |
| 5 | B8.3 | Apply | Hospital ward listing: subsetting with multiplicity; how many beds in all? | R70 sl.11; R80 p.64 |
| 6 | B8.3 | Analyze | Same symbol `:>` after a definition and after a usage: what each asserts | R80 p.72 |
| 7 | B8.3 | Analyze | Redefinition versus subsetting: which statement the listing guarantees | R80 pp.64–65 |
| 8 | B8.4 | Apply | Which declaration correctly writes the ID `TRK-07` as a short name? | R80 pp.49–50 |
| 9 | B8.4 | Apply | Which import form re-exports and which does not; which is required at the root? | R70 sl.6; R80 p.63 |
| 10 (SA) | B8.6 | Apply | Write a concern for a given stakeholder and subject (syntax and order) | R77 sl.115; R83 p.167 |
| 11 (SA) | B8.5 | Evaluate | Where would you map a Phase I "decision record", and why? (two acceptable answers with reasons) | Course convention (mapping rule) |
| 12 (SA) | B8.7 | Evaluate | A file passes the checker; name one defect it may still contain and how you would find it | R33a p.292; course toolchain |

- **Scoring.** 1 point each for items 1–9; 2 points each for 10–12 (two-criterion keys). Total 15. Weight within the weekly-quiz component.

### 6.2 Applied exercise (individual, ≈ 45 min after revision, open book, unseen case)
- **Case brief** (≈ 250 words, instructor-authored, FICTIONAL): a university campus microgrid enterprise. An excerpt of its Phase I register: 5 stakeholders, 6 concerns, 2 relationships (one conflict), and a list of 8 artifact IDs.
- **Tasks.**
  1. Write the package skeleton with a purpose statement and private imports. *(B8.4)*
  2. Model the 5 stakeholders and 6 concerns with short-name IDs, subject and stakeholder. *(B8.6)*
  3. Model the conflict relationship. *(B8.6)*
  4. Map the 8 artifacts to package and construct, with a reason for two non-obvious ones. *(B8.5)*
  5. A provided 15-line fragment has three seeded defects: one syntax (unquoted ID), one that passes the checker but is semantically wrong (an attribute definition owning a part), one convention (an import without visibility). Find, explain and fix each; say which the checker would report. *(B8.7)* *Revised:* the brief gives the recorded checker output of the fragment and of the fragment with defects 1 and 2 fixed (PASS, no message), so the answer is unambiguous; the key's defect-1 rationale is "visibility is always shown on an import" (R70 sl.6; R80 p.61), not the root-namespace rule. **Graduate:** explain the semantic defect in KerML terms (R87 pp.51–53, 61–63).
- **Rubric** (4 levels each, 20 points).

| Criterion | 4 | 3 | 2 | 1 |
|---|---|---|---|---|
| Skeleton and conventions | Purpose stated; imports explicit and private; IDs quoted | One slip | Several convention errors | No structure |
| Stakeholders and concerns | All present; subject first; stakeholders typed; IDs match | One omission | Concerns without subject or stakeholder | Prose only |
| Relationship | Modeled with direction and type, consistent with the register | Direction unclear | Modeled as a part or comment | Missing |
| Mapping | All 8 mapped; reasons sound | One weak reason | Several unmapped or unjustified | Missing |
| Defect analysis | All three found, explained and fixed; checker behavior predicted correctly | One explanation weak | One defect missed | Two or more missed |

- **Submission.** LMS, before Week 9 Session 1. Checker run optional for the student; the instructor runs the key.

## 7. Continuity link to the Phase I artifact

| Phase I artifact (week) | Week 8 model element | AeroLink reference |
|---|---|---|
| Enterprise proposal and system of interest (Week 1) | `part def <'ENT-…'>` in Context | ENT-001 `AeroLinkEnterprise` |
| Context: external systems and exchanges (Week 1) | Context part with EXT part usages; `ref part systemOfInterest` | EXT-001..006 in `aeroLinkContext` (exchanges become interfaces in Week 11) |
| Stakeholder register (Week 1) | `part def <'STK-…'>` with assessment metadata | STK-001..014 (STK-015 pending) |
| Concerns (Week 1) | `concern <'CON-…'>` with subject and stakeholder | CON-001..016 (CON-017 pending) |
| Relationships (Week 1) | Keyword dependencies `<'REL-…'>` | REL-001..008 (new to the model) |
| Whole Systems Thinking Engineering Package (Week 7) | Mapping matrix; package skeleton | `sysml/reference/README.md` §2 |

- COURSE_SCHEDULE rule 6: Week 8 ↔ Week 1; rule 4: the Week 7 package is the source.
- Course weekly lab deliverable notes (S04): Lab 1A (repository setup: packages, naming standards, modeling conventions), Lab 1B (artifact mapping matrix), Lab 2A (enterprise context model), Lab 2B (stakeholder model: relationships, objectives, concerns). Week 8 covers 1A, 1B, 2A and 2B except stakeholder *objectives*, which Week 9 models as MGO requirements.

## 8. Section transitions (summary)

| From → to | Transition line |
|---|---|
| S1 A → B | To keep one number in one place, we need a model, not a document |
| B → C | One model; where do the tables and diagrams come from? Views |
| C → D | To write the model, learn how the language is built |
| D → E | One pattern runs through the Systems layer: definition and usage |
| E → F | Parts carry quantities; SysML v2 types their units |
| F → G | Before you write, calibrate what the checker tells you |
| S2 H → I | Organize the model and name its elements so the Phase I IDs survive |
| I → J | What you type into, and what decides if it is right |
| J → K | Import: a mapping of the whole package, by ID |
| K → L | The first artifact modeled: stakeholders and concerns |
| L → M | Audit what the checker cannot; next week's requirements frame these concerns |
| M → N | Now your team imports its own package |

## 9. Source gaps

1. **No source for the import method itself.** The mapping matrix, the "modeled now / week N" rule and the audit questions are course conventions grounded only in the course's own weekly lab deliverable notes (Lab 1A/1B). No SEBoK, DoD or MITRE page describes migrating a document package into a SysML v2 model.
2. **Stakeholder register attributes in SysML v2.** The sources give `stakeholder` and `concern` (R77 sl.115; R83 p.167) but no pattern for interest, influence or support ratings, nor for stakeholder-to-stakeholder relationships. The metadata and keyword-dependency pattern (S2.14) is a course design and must be labeled so.
3. **SEBoK's MBSE article describes SysML v1** (nine diagram types, R28 p.372); the View/Viewpoint glossary entries cite SysML 1.3. SysML v2 content rests on S06, S09 and S10 only.
4. **S09 graphical deck is dated 2022–2023** (slides 7–22), older than the 2026-08 textual deck; cited only for concepts unchanged since (key elements, layers, names).
5. **Source typo** in R77 sl.115 (`'Systems Engineer'` versus `'systems engineer'`); the slide uses an adapted, case-consistent version.
6. **Toolchain facts** (checker behavior, installation, SysON) rest on `docs/SYSML_TOOLCHAIN.md` and local probes, not on a citable source; the formal SysML 2.0 publication is not in the collection.
7. **No source on team practice for modeling** (repository branching, ownership in a shared model); handled as course convention.
8. **Reuse map.** Reviewed draft material reused: the old Week 9 module (`src/content/weeks/week09.ts`, committed version: MBSE, model vs view, language architecture, definition/usage, checker, worked examples a–d, quiz items q9-1..q9-4 as patterns), `docs/authoring/week09_notes.md`, and `draftWeeks.ts` week 9. The old CP3 defence block is not reused (Week 7 now hosts the Phase I presentation).

## 10. Register additions needed

| Proposed ID | Source, PDF pages | First-page title | Supports |
|---|---|---|---|
| P8.1 | SEBoK p.1567 | Model (glossary) | S1.4 (five definitions incl. OMG's) |
| P8.2 | SEBoK p.1569 | Model-Based Systems Engineering (MBSE) (glossary) — second entry on the page (running header: Model Validation) | S1.6 |
| P8.3 | SEBoK p.1677 | View (glossary) — second entry (running header: Viable) | S1.9 |
| P8.4 | SEBoK p.1678 | Viewpoint (glossary) | S1.9 |
| PX3 | S06 pp.188–194 | 7.27 Metadata | S2.14 (user-defined keywords, p.193; metadata definitions) |

Existing entries used and in range: R27 (p.56), R28 (pp.370–374), R33a (pp.290–292), R33b (pp.295–296), R33c (p.300), R70 (sl.3–16), R77 (sl.115–116), R79 (sl.164, 167), R80 (pp.47–50, 55–56, 60, 63–65, 72–73, 77), R83 (p.167; p.168 forward pointer), R85 (p.181), R87 (pp.51–53, 61–63; graduate), R90 (sl.7–9, 12, 22).

**Proposed Week 8 essential readings:** R33a pp.290–292; R28 pp.370–374; R70 sl.3–16; R77 sl.115–116; R80 pp.47–50, 63–65. **Extension:** R33b pp.295–296; R33c pp.298–302; R90 sl.7–9, 12, 22; R87 pp.51–53, 61–63 (graduate).

## 11. Open items for faculty

1. **Phase II tooling (open decision in COURSE_SCHEDULE).** *Superseded 2026-10-19 (WEEK8_REVIEW_DISPOSITIONS.md, faculty decision item FD-W8-1): no Week 7 task exists; one installation per team in Week 8 from the student install guide, the in-app lab tool as the required environment, personal installation optional, lab machines as fallback.* Original proposal: the checker is installed as a take-home task in Week 7 (≈ 1 h, with lab-machine fallback), verified before Week 8 Session 2 (≈ 15 min) and proven at the S2.19 checkpoint; the textual notation is taught first (Session 1 reads listings, Session 2 writes them); the course workbench provides views; SysON stays optional. Alternative if Week 7 cannot absorb it: install in Week 8, adding ≈ 1 h (workload ≈ 8.7 h), and shorten the lab by modeling only the conflict relationships.
2. Adopt the stakeholder-assessment metadata and keyword-dependency pattern for REL (S2.14), and whether REL is required in the model or optional.
3. Week 1 case changes in the reference model before Week 8 is built: STK-015, CON-017 and the renamed external systems (EXT-001/002/004/006); the support levels are proposed values (`AEROLINK_CASE_CHANGES.md` §5 items 3, 5, 7).
4. Folder for lecture fragments: copy the `sysml/week09/` files to `sysml/lectures/week08/` or reference them in place (the old folder numbers no longer match the weeks).
5. Grading mode for model v0.1: formative now, RB-8 summative at a later checkpoint.
6. Approve register additions P8.1–P8.4 and PX3, and the proposed essential readings.
7. Whether the graduate KerML analysis is a quiz/exercise task (as proposed) or a separate required notebook entry (adds ≈ 1.5 h).
