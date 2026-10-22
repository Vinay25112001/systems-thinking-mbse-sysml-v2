# Master Implementation Directive: Week 1 Reconstruction, Admin/Student Platform and Continuous Engineering Project

Received 2026-10-21 and recorded as DECISION_LOG A23. The directive builds on the Week 1 Redesign and Platform Enhancement
Proposal, which faculty reviewed and the faculty owner's manager modified on 2026-10-21; see
`2026-10-21_WEEK1_REDESIGN_PROPOSAL.md`. Together the two documents are the controlling functional and instructional
specification for this phase. This file condenses the directive by section. The substance is unchanged and every hard rule is
kept word for word where it matters. The deadline is **2026-12-01**. Improve and extend the existing app; do not build an
unrelated one. Do not touch the MBSE Studio or eVTOL projects.

## 1. Roles
The work is done by a coordinated team of specialists. Each role has its own focus:

| Role | Focus |
|---|---|
| Senior SE professor | PhD-level rigour: systems thinking, stakeholders, needs, requirements, enterprise architecture, lifecycle, MBSE, SysML v2, traceability, V&V, design reviews |
| Graduate instructional designer | Clear conceptual progression; students understand an activity before performing it |
| Principal software architect | Preserve working components; modular services, tested data models, explicit integration boundaries |
| Security/data engineer | Authentication, authorization, publishing, persistence, backups, recovery; instructor and student permissions kept separate |
| Senior UI/UX designer | Professional, usable, no clutter, no decoration |
| Independent QA | Nothing is reported complete until its acceptance tests have passed |

## 2. Principle
This is one continuous 14-week course:
- **Weeks 1–7:** systems-thinking methods define, analyse, justify and document an enterprise.
- **Weeks 8–14:** MBSE and SysML v2 implement the SAME enterprise.

The journey is LEARN → UNDERSTAND → PRACTICE → APPLY TO MY PROJECT → PRESERVE ENGINEERING EVIDENCE → DEVELOP THE MODEL.
- There are no 14 disconnected assignments or independent lab records.
- Quizzes are never the primary teaching method.

## 3. Schedule (unchanged whiteboard)

| Phase | Week | Topic |
|---|---|---|
| I | 1 | Team Formation / Needs / Identifying Stakeholders |
| I | 2 | ConOps / Requirements |
| I | 3 | Technology Assessment / Risk Management / Trade Study |
| I | 4 | Architecture / Information View |
| I | 5 | Components / Interfaces |
| I | 6 | Evolution Roadmap |
| I | 7 | Final Presentation |
| II | 8 | Import Systems Thinking Artifacts / Stakeholders |
| II | 9 | Needs / Requirements |
| II | 10 | Logical / Behavioral Modeling |
| II | 11 | Physical / Interfaces |
| II | 12 | Digital Thread / V&V |
| II | 13 | Trade Study / Analysis |
| II | 14 | Final Presentation |

- AeroLink Urban Mobility is the instructor's continuous reference enterprise.
- Each team develops its OWN instructor-approved enterprise.

## 4. First action: reconcile the repository
Read the audit and inspect the actual implementation. Covered areas:
- git state and the dependencies between modified and new files;
- Week 1 content, lecture and pptx sources, lesson reader, worked examples, practice, lab tools;
- My Project, storage, import/export and the Week 8 tools;
- the student/instructor build split, routes, tests and reusable visual components.

Then:
1. Identify what is complete, what is incomplete and what is uncommitted.
2. Identify the student-data compatibility risks.
3. Establish a recoverable baseline without deleting work.
4. Record the baseline and the recovery steps.

Rules:
- No destructive git commands (hard reset, clean) without approval.
- Never commit sensitive data, student records, credentials or source documents.

Deliverables: `WEEK1_IMPLEMENTATION_BASELINE.md`, `WEEK1_CHANGE_IMPACT_MATRIX.md`, `WEEK1_RECOVERY_PLAN.md`. Earlier test claims are not
evidence for the current tree.

## 5. Single source of academic content
- **Preserve verified Week 1 work.** Do not delete the lecture sources just because the student Lecture tab is removed.
- **One authored source** feeds the digital textbook sections, interactive examples, figures, faculty notes, optional pptx exports and references.
- **No duplication:** do not repeat the same explanation independently in several places.
- **Stable identity:** keep stable content IDs, source references and revision metadata, and preserve prior published versions.
- **Accuracy over UI convenience:** never alter definitions, principles or attributions to simplify the UI.

## 6. Admin and student accounts
Two experiences, INSTRUCTOR/ADMIN and STUDENT. Students have individual identities and share team enterprise projects. Hosting has
NOT been decided.

**6.1 Architecture.** The design must:
- be demonstrable locally and portable to an institutionally approved host;
- not lock in an unapproved cloud provider;
- separate the frontend from the authentication, authorization, publishing, project and persistence service interfaces.

**6.2 Authentication.**
- A secure local demonstration of real accounts.
- Protected operations are authenticated and authorized server-side.
- Passwords use a proper password hash; no plaintext.
- A frontend role switch, a hidden button or a separate build is NOT authorization.
- Sessions are protected.
- Demo accounts are for development and testing only; never publish reusable credentials.

**6.3 Instructor capabilities.**
- Content: create teaching content; edit and reorder lesson sections; edit course introductions; manage diagrams and worked examples; add or remove references; edit lab instructions and assessments.
- Publishing: preview the student experience; save drafts; compare revisions; publish; view publication history; restore earlier versions.
- Course management: configure deadlines.
- Student work: review enterprise proposals; approve projects or request changes; review submitted artifacts; give feedback.
- Destructive operations are confirmed.
- Publishing must never overwrite student project data.

**6.4 Students can:**
- view published materials and resume their progress;
- do guided practice;
- create or join an authorized team project and work on their own enterprise;
- save artifacts and import approved file formats;
- view milestones, feedback and approval status;
- export their package and continue the project all semester.

**Students cannot see:** unpublished drafts, faculty-only notes, private answer keys, publication controls, or other teams' private records.

**6.5 Shared team projects.**
- Several students per team enterprise, with authorization enforced for membership and project access.
- Contributions are tracked by authenticated identity.
- Accidental overwrites and lost updates are prevented, for example with version checks or transactional updates.
- Simultaneous edits are handled as defined, and conflicts are explained clearly.
- Separate browser-local copies are never presented as collaboration.

**6.6 Hosting stays open.**
- A local backend for a genuine end-to-end demonstration.
- Database, authentication, backup, configuration and deployment requirements documented.
- No public deployment and no cloud service registration without approval.

## 7. Content publishing system
**Lifecycle:** DRAFT → READY FOR REVIEW → PUBLISHED → SUPERSEDED / ARCHIVED.

**Features:**
- draft save, preview and validation;
- publication confirmation;
- version IDs, timestamps and author;
- history and rollback;
- students see the latest published version, with safe refresh or update notification.

**Separate stores** for:
1. course content;
2. student progress;
3. team engineering projects;
4. assessments and submissions;
5. faculty-only material.

**Rules:**
- Updating a lesson never erases student work.
- A changed assessment keeps the version information needed to interpret earlier submissions.

**Test with two genuinely separate sessions:** the instructor publishes, the student refreshes and sees the update, and the student's work is intact.

## 8. Institutional homepage
**Branding.**
- Institution: Wright State University.
- The sponsoring department is **NOT YET VERIFIED**. Do not present "Department of Civics" as official; the department name is configurable.
- Do not invent endorsements, department titles, logos or accreditation statements. Use official branding only when authorized.

**The homepage must make clear:**
- what the course teaches;
- why systems thinking matters, and what MBSE and SysML v2 add;
- what the first seven weeks and the second seven weeks each accomplish;
- that both phases work on the same enterprise;
- what AeroLink is, what it is trying to accomplish, and why it is used;
- why every team develops its own enterprise;
- what students submit;
- how to navigate, and how to begin Week 1.

**Layout:**
- a clear reading hierarchy;
- no case data sheets, card grids, repetition or confusing multi-column reading paths;
- a strong transition into Week 1.

## 9. Week 1 student navigation
Student navigation is **OVERVIEW → LEARN → GUIDED PRACTICE → MY PROJECT / LAB → REVIEW & SUBMIT**.
- Remove the Lecture tab from student navigation, but keep the teaching material.
- Keep an optional faculty pptx and export workflow.

**The Overview is concise and states:**
- what Week 1 covers and why it matters;
- what students should understand by the end and what they will practise;
- what they must create for their own project;
- how this is used in Week 2 and Week 8;
- the time commitment and the required references.

**The other stages:**
- **Learn** is the central instruction.
- **Guided Practice** applies the methods to AeroLink.
- **My Project / Lab** applies them to the team's own enterprise.
- **Review & Submit** is where students inspect the package, resolve issues and submit evidence.
- No faculty development notes or internal terminology are visible to students.

## 10. Learn: a comprehensive digital textbook
It is not a slideshow and not quiz cards.

**Coverage:**
1. Engineered systems.
2. Systems thinking and enterprise systems.
3. Boundaries and operational environments.
4. Mission ↔ stakeholders ↔ needs.
5. Stakeholder identification and classification.
6. Concerns, interests and relationships.
7. Needs elicitation.
8. Needs vs requirements vs proposed solutions.
9. Engineering context and traceability foundations.
10. Team formation and enterprise selection.

**For each major concept**, provide:
- a formal definition and a verified source;
- a detailed explanation and the methodology;
- an original diagram;
- an AeroLink worked example;
- the key distinctions and the practical significance;
- the connection to future project artifacts;
- common errors, where useful.

**Length:** do not shorten the content artificially and do not inflate it.

**10.1 AeroLink introduced early.** Cover:
- the type of enterprise, the problem, the mission and the operational environment;
- the stakeholders, the boundaries and the high-level operating concept;
- which facts are fictional teaching assumptions;
- how the professor uses it all semester, and how students adapt the methods to their own enterprises.

Do not assume prior knowledge, and never present fictional numbers as real-world facts.

**10.2 Reading layout.**
- Investigate why there is unused space on the right, then design a deliberate content grid.
- Possible elements: a main column, sticky chapter navigation, a context reference panel, expandable diagrams, figure descriptions, source footnotes, progress, related concepts and practice links.
- Keep a comfortable line length.
- Support desktop, tablet and mobile.

**10.3 Interactivity, only where it teaches.**
- Examples: a boundary diagram, a stakeholder ecosystem, influence and concern comparison, system–environment interaction, mission–need–stakeholder relationships, progressive traceability, classification examples.
- Animation is subtle, accurate, optional and respects reduced motion.
- Every visualization has a text equivalent. Not a game.

**10.4 Eliminate repetition.** Build a content responsibility matrix:

| Stage | Responsibility |
|---|---|
| LEARN | Theory |
| GUIDED PRACTICE | Instructor example |
| MY PROJECT | The team's own enterprise |
| REVIEW & SUBMIT | Quality review and submission |

A concept may appear in several stages, but for a different purpose each time, never as repeated paragraphs.

## 11. Guided Practice (AeroLink)
**Students practise:**
- the boundary and external systems;
- identifying and classifying stakeholders;
- concerns, conflicts and relationships;
- drafting needs and linking needs to mission objectives.

**The practice provides:**
- task instructions and brief context;
- editable diagrams and guided inputs;
- examples and reasoned feedback;
- revision, completion indicators and reset;
- next-step navigation.

**Data and copying:**
- Practice uses the AeroLink dataset and stays separate from the project.
- AeroLink artifacts are never copied silently. A template transfer is explicitly requested, reviewed, and comes with a warning to adapt it.

**Scoring:** never score judgment-dependent reasoning as objectively correct; give explanatory feedback.

## 12. My Project: the continuous engineering canvas
One project identity and one connected artifact model for all 14 weeks. Week 1 lays the foundation. There is no separate project per week.

**Week 1 data:**
- enterprise name, description, problem statement, mission and objectives;
- boundary and context;
- team members and roles;
- stakeholders, their categories, interests and concerns;
- relationships and conflicts;
- needs, with rationale and related objectives;
- assumptions and unknowns.

AeroLink is never required. **Enterprise approval is an instructor action**, with the states pending, approved and revision requested.

**12.1 Single canvas.**
- Complementary representations: visual relationships, tables, context editing panels, artifact details and progress.
- Not everything has to be a node diagram.
- Every representation stays in sync through the canonical model.

**12.2 Field guidance on focus.** Shown accessibly and without getting in the way:
1. the field name;
2. its definition;
3. what is expected;
4. an AeroLink example;
5. the format;
6. the link to the current objective;
7. its later use;
8. validation feedback.

**12.3 Progress** is based on real artifacts and validation, never on nonempty fields alone. It covers:
- completed, draft and missing items;
- unresolved relationships;
- pending reviews and approvals;
- future milestones and change impact.

The completion criteria are transparent.

**12.4 Identity and history.**
- Persistent IDs, and typed links by ID with referential integrity.
- Rationale and provenance are recorded.
- IDs are never regenerated on text edits.
- Revisions and decisions keep a history.

## 13. Excel stakeholder import
Students may use AI tools for research, but they stay responsible for their data.

**The parser:** `.xlsx` read with a maintained, appropriately licensed library.

**The import flow:**
1. Select the file.
2. Check type, size, structure and limits.
3. List the sheets.
4. Choose a sheet.
5. Read the headers and values.
6. Propose field mappings.
7. Flag missing and ambiguous columns.
8. Show confidence.
9. The student corrects the mappings.
10. Preview the records.
11. Detect duplicates.
12. Validate required fields.
13. The student explicitly approves.
14. Commit in one transaction.
15. Record the provenance.

No silent import or overwrite. Missing data is flagged, never invented.

**AI:**
- Deterministic heuristics come first. AI is only an optional provider interface.
- No data goes to unapproved services, and the import works without paid AI.
- AI output is labelled as a suggestion.

**Security:**
- The file is untrusted input; malformed files fail safely.
- Formulas are never evaluated, and future exports guard against formula injection.
- Size, row and resource limits apply.
- Tests cover duplicates, partial mapping, invalid cells and rollback.

## 14. Week 1 traceability
The conceptual chain is Enterprise → Mission → Stakeholders → Concerns → Needs; it is not necessarily linear.

**Explicit relations:**
- stakeholder has concern;
- stakeholder expresses need;
- need supports a mission or objective;
- concern motivates need;
- stakeholder influences stakeholder;
- conflicting concerns;
- an artifact has documented rationale.

There are no fake SysML semantics at this stage. **Continuity:**
- Week 2 extends Week 1 with ConOps and requirements.
- Week 8 accesses the stakeholders, needs, missions and relationships.
- Demonstrate the mapping without implementing Weeks 2–14 now, and show students how today's work feeds later work.

## 15. Saving, history, backup and protection (priority zero)
**The read-only-after-reload defect.**
- Reproduce or rule it out, trace the failure path and fix the root cause.
- Verify in a normal browser:
  - save and reload;
  - persistence across authenticated sessions and membership permissions;
  - export and import;
  - history;
  - recovery after an interrupted save.

**Save status:** Saving / Saved / Unsaved changes / Save failed / Conflict requires review.
- Never show success unless the persistence layer confirms it.
- Writes are transactional and backups are durable.

**Export:**
- Keep the JSON project export, plus a human-readable report.
- Student labels are Export Project, Import Project and Download Engineering Report; formats are explained in optional help.

## 16. Review & Submit
**Students review:**
- the enterprise, team, mission and objectives;
- stakeholders, concerns, relationships and conflicts;
- needs and traceability completeness;
- source and rationale quality;
- outstanding issues.

**States:** DRAFT / READY FOR REVIEW / SUBMITTED / APPROVED or RETURNED FOR REVISION.
- Automated validation never substitutes for faculty assessment.
- The submitted snapshot is preserved even after further edits.
- Faculty feedback and approval, where authorized.

## 17. UI/UX
**One coherent design system**, with priority on:
- professional quality, hierarchy, typography, spacing, colour and contrast;
- predictable navigation and meaningful feedback;
- empty, active and completed states;
- responsive layouts and interactive diagrams;
- accessible animation with reduced-motion support;
- keyboard navigation and contextual help;
- stable navigation.

**Consistency:**
- No excess motion and no decoration.
- Homepage, Learn, Practice, My Project and Review must feel like one product.
- No unrelated layouts, inconsistent instructor toggles, raw status codes or confusing labels.
- The student build exposes no unpublished faculty material or developer controls.

**Evidence:** find UX defects from real screenshots, desktop and mobile.

## 18. Milestones (no uncontrolled rewrite)

| # | Milestone | Scope |
|---|---|---|
| M0 | Repository safety and architecture | Inventory and git status; recoverable baseline; reuse map; storage defect investigation; auth and publishing architecture; project schema and migration plan; security boundaries; updated critical path. No destructive refactoring until recovery and migration risks are understood |
| M1 | Faculty-reviewable design spec | Homepage; Week 1 navigation; textbook IA; Practice flows; My Project flows; admin publishing workflow; student and team access workflow; Excel import workflow; data-continuity diagram; acceptance-test matrix. A small reversible prototype if helpful; resolve only genuinely blocking ambiguities |
| M2 | Reliable data foundation | Local backend; accounts; team membership; server-side authorization; canonical model; persistence; safe migrations; autosave feedback; recovery and export; versioning. Demo: save, reload and restore reliably |
| M3 | Admin content management | Editor; drafts; preview; publish; history; restore; student consumption; permission checks. Demo: a visible publish with no student data loss |
| M4 | Homepage and digital textbook | Welcome; course introduction; AeroLink introduction; Week 1 overview; Learn; interactive figures; navigation; sources. Remove the student Lecture tab; keep the content and notes |
| M5 | Guided Practice | Guidance; interactive relationships; feedback; reset; completion; isolated state. Demo: practice cannot corrupt the project |
| M6 | My Project and Excel import | Enterprise creation; instructor approval; Week 1 editing; visual and tabular views; field guidance; Excel import with mapping review and validation; relationships; milestone progress |
| M7 | Week 1 → Week 8 continuity | Mission, stakeholders, concerns, needs, relationships and stable IDs accessible to the Week 8 transformation. No invented model relationships and no unsupported SysML claims |
| M8 | Final validation | Sources; depth; duplication; types; unit, integration and e2e tests; accessibility; authentication and authorization; persistence and reload; concurrency; Excel; publishing; isolation; export and import recovery; production build; the full student journey |

## 19. Acceptance demonstrations (in a running app)
**A. Instructor publishing**
1. The instructor signs in.
2. The instructor opens the Week 1 textbook editor.
3. The instructor edits a section.
4. The instructor saves a draft.
5. The student still sees the old published version.
6. The instructor previews and publishes.
7. The student refreshes, or is notified.
8. The student sees the update.
9. The student's artifacts are unchanged.
10. The instructor views the history and restores an earlier version.

**B. Student learning**
1. The student signs in.
2. Opens the welcome page.
3. Understands the 14 weeks.
4. Opens Week 1.
5. Reads the textbook.
6. Explores a diagram.
7. Opens Guided Practice.
8. Analyses AeroLink stakeholders and needs.
9. Receives feedback.
10. Resets the practice without touching the project.

**C. Student project**
1. The student creates or joins a team.
2. Proposes an enterprise.
3. The instructor reviews the proposal.
4. The instructor approves it or requests changes.
5. The student opens My Project.
6. Records the mission, objectives, stakeholders, concerns and needs.
7. Uses the contextual help.
8. Creates relationships.
9. Sees milestone progress.
10. Reloads, and the work persists.

**D. Excel import**
1. Upload the file.
2. Sheets and columns are detected.
3. Review the mappings.
4. Ambiguities are flagged.
5. Correct them.
6. Confirm.
7. The stakeholders appear in the canonical project.
8. IDs and provenance are kept.
9. An export and reimport recovers the project.

**E. MBSE continuity**
1. Open the Week 8 preview.
2. The same enterprise is found.
3. The Week 1 IDs are visible.
4. The mapping opportunities are shown.
5. Traceability is available.
6. No AeroLink records are mixed in.

## 20. Academic quality gate
**Criteria:**
- graduate depth, formal definitions and accurate citations;
- sequencing and clarity;
- worked-example quality and AeroLink consistency;
- stakeholder methods;
- the needs/requirements relationship and the traceability foundations;
- reusable outputs, no duplication, and integrated figures.

Polished visuals are not strong teaching, and an exercise is not a lesson. Learn must stand alone as a textbook.

## 21. Deadline and scope
Keep a critical path that separates:
- mandatory Week 1 features and reusable infrastructure;
- features that affect later weeks;
- security and data-integrity blockers and academic review blockers;
- optional enhancements and deferred production features.

**Priorities:** student-data safety, academic quality, working content delivery and continuity.
- Do not block production of the remaining course materials on cosmetic UI work.
- If something cannot be done responsibly by Dec 1, deliver a tested limited alternative and name what is incomplete.
- Never silently replace a required feature with a mockup.

## 22. Change control
**Maintain:**
- PROJECT_STATUS.md;
- DECISION_LOG.md;
- IMPLEMENTATION_ROADMAP.md;
- TEST_REPORT.md;
- KNOWN_LIMITATIONS.md;
- SECURITY_ARCHITECTURE.md;
- CONTENT_PUBLISHING_DESIGN.md;
- PROJECT_DATA_SCHEMA.md;
- WEEK1_ACCEPTANCE_MATRIX.md.

**Per milestone:**
1. Document the baseline.
2. Make a small, reviewable change.
3. Run the checks.
4. Fix any regressions.
5. Document the affected files.
6. Verify data compatibility.
7. Commit only related, validated changes.
8. Record the next step.

**Rules:**
- Never discard unrelated changes, and never fold incomplete parallel-agent work into undocumented commits.
- Use parallel agents only on clearly independent file sets.
- Integrate the shared data model, routing, authentication and persistence sequentially.

## 23. Reporting and approvals
**Each milestone report covers:**
- what changed, why, and the files affected;
- academic implications and user-visible behaviour;
- tests and their pass/fail results;
- security and data concerns, blockers and deadline impact;
- the next milestone.

Do not ask about minor reversible details. **STOP and ask approval for:**
- changes to the 14-week sequence;
- destructive project-data migrations;
- public deployment;
- paid services;
- external transfer of protected data;
- unverified institutional branding;
- major changes to grading or official course policy;
- architectural trade-offs that materially alter the agreed functionality.

## 24. Immediate start
1. Read the proposal.
2. Review the audit.
3. Inspect the working tree.
4. Check what is committed and what is incomplete.
5. Identify the components to keep.
6. Investigate the save defect.
7. Write the architecture and the Week 1 specification.
8. Establish a safe baseline.
9. Update the Dec 1 critical path.
10. Begin the first approved, reversible milestone.

**Hard rules:**
- No new application.
- No deletion of verified teaching material.
- Learn is never replaced by slides, summaries or Q&A.
- Data integrity comes before aesthetics.
- Never falsely claim secure accounts, live collaboration, publishing or SysML compliance when it is only simulated.

**THE FINAL EXPERIENCE MUST ALLOW A STUDENT TO LEARN A SYSTEMS ENGINEERING METHOD, PRACTICE IT ON AEROLINK, APPLY IT TO THEIR OWN
ENTERPRISE, PRESERVE THE RESULT, AND USE THAT SAME RESULT DURING THE MBSE PHASE.**
