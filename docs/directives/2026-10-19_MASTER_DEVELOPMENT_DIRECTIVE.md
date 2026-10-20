# Master Development Directive — Continuous Engineering Project + Project Workspace + Professional UI/UX

Faculty directive received 2026-10-19 after the faculty owner's meeting with their manager. Recorded as DECISION_LOG A22.
Text preserved here (lightly condensed headings, content unchanged in substance) so every workstream reads the same brief.

## 1. Critical context
Weeks 1–7 teach students what they are doing, why, and how systems engineering methods are applied. Weeks 8–14 teach
how to implement the SAME engineering work practically in SysML v2 through MBSE. Not two courses: one continuous
engineering journey. Students develop their own enterprise in Phase I, preserve the work, and transform that same
project into a structured, connected MBSE model in Phase II. Continuity is a fundamental academic requirement.

## 2. Governing schedule (unchanged whiteboard)
Phase I: W1 Team Formation / Needs / Identifying Stakeholders; W2 ConOps / Requirements; W3 Technology Assessment /
Risk Management / Trade Study; W4 Architecture / Information View; W5 Components / Interfaces; W6 Evolution Roadmap;
W7 Final Presentation. Phase II: W8 Import Systems Thinking Artifacts / Stakeholders; W9 Needs / Requirements;
W10 Logical / Behavioral Modeling; W11 Physical / Interfaces; W12 Digital Thread / Verification and Validation;
W13 Trade Study / Analysis; W14 Final Presentation. Do not rearrange, rename or replace without approval.

## 3. Four-part learning experience
**A. Professor-led Lecture Studio (primary).** Professional slides, detailed explanations, source-grounded definitions,
faculty notes in instructor mode, technical illustrations, worked examples, AeroLink demonstrations, math where
appropriate, full student reading material, clear transitions theory → practice. No Q&A screens/quizzes/cards/gamified
replacement. Teach first, practice second.

**B. Practice Canvas.** Guided interactive sandbox using AeroLink as default example: explore/manipulate diagrams,
stakeholder analysis, relationships, requirements, scenarios and architecture views, risk and trade methods, SysML
concepts, contextual feedback, reset without damaging project work. Never automatically overwrites the official
project. Explicit action to copy/adapt work into the project, with confirmation and relationship preservation.

**C. My Project (new, prominent, persistent tab).** Dedicated team enterprise workspace:
1. Enterprise Overview — name, mission and objectives, problem statement, team members and roles, approval status,
   system boundary and context, milestone progress.
2. Weekly Project Milestones — Weeks 1–14, expected artifacts, completion status, outstanding tasks, submission readiness.
3. Engineering Artifact Library — stakeholders, needs, capabilities, ConOps, scenarios, requirements, technology
   assessments, AROU and risk registers, trade studies, architecture elements, information flows, components,
   interfaces, roadmaps, model elements, verification plans, analysis results, traceability relationships.
4. Engineering Editors — structured forms, visual mapping, tables (requirements, interface inventories), connected
   architecture diagrams, decision matrices, risk tools, clear validation feedback.
5. Project History — save, artifact revisions, who changed what where attribution is technically supported, prior
   versions, decision rationale, prevent accidental loss.
6. Export and Import — whole project in a documented portable structured format, readable engineering reports, import
   with validation, stable IDs and relationships preserved, warn about conflicts/broken references, never silently overwrite.
7. Engineering Traceability — stakeholder→need, need→capability/requirement, requirement→architecture,
   architecture→interface, verification, risk and decision relationships, change-impact indicators.

**D. MBSE Modeling Studio (Weeks 8–14)** using Phase I data. Week 8: controlled process turning the Phase I package
into a model-ready baseline; no unrelated example models or needless re-entry. Support artifact-to-model mapping,
stable IDs, packages, requirement relationships, logical and behavioral representations, physical architecture,
interfaces and allocations, digital thread, verification planning, risk and impact analysis, final integrated review.
Distinguish conceptual teaching diagrams from standards-conformant SysML v2. Validate textual SysML with a reference
implementation where feasible. Never claim a custom visualization is a complete SysML v2 tool without established compliance.

## 4. Strict engineering data continuity
Canonical structured enterprise project data model, independent of presentation. Each artifact: persistent unique ID,
type, title/description, engineering attributes, creation and revision metadata, source or rationale, related IDs,
validation status, milestone associations. Typed relationships with referential integrity, e.g. Stakeholder → Need →
Capability → Requirement → Behavior → Logical → Physical → Interface → Verification Evidence (an instructional
traceability journey, not a claim of identical SysML semantics; store relationship types explicitly). On change:
identify potentially affected artifacts, show links needing review, preserve history, never silently delete
relationships, never auto-declare validity without evidence. Phase I feeds Phase II directly.

## 5. Two case-study modes
AeroLink = instructor worked example; every team selects its own instructor-approved enterprise. Teaching shows the
professor applying the method to AeroLink with decisions, assumptions, tools. My Project: students do the
corresponding work on their own enterprise, data completely separate from AeroLink; deliberate template copying
allowed, never inadvertent copying of AeroLink answers; separation visually obvious. Never assume teams build an air taxi.

## 6. Week-by-week buildup
W1 identity, mission, team, stakeholders, needs, context. W2 ConOps, scenarios, requirements. W3 technology
alternatives, risks, trade decisions. W4 viewpoints, information exchanges. W5 components, interfaces, integration
dependencies. W6 evolution roadmap and Phase I baseline review. W7 Systems Thinking Engineering Package and design
review. W8 import/map the SAME baseline into a model repository. W9 needs/requirements as model elements and
relationships. W10 logical architecture and selected behaviors from the ConOps and architecture. W11 physical
architecture and interfaces. W12 digital thread, requirements → verification plans. W13 model-based trade studies,
risk-informed analysis, change impact on the student's data. W14 demonstrate and defend the integrated SysML v2 model
showing continuity with the original package. Not 14 disconnected assignments.

## 7. Professional UI/UX redesign
Current UI feels raw, overly technical, not engaging. Serious UI/UX review and a proposed design system: premium
educational product + professional engineering workspace. Priorities: intuitive navigation, strong typography,
consistent hierarchy, professional color and spacing, modern dashboards, meaningful microinteractions, restrained
transitions, interactive diagrams, responsive, accessible, readable lecture content, slide presentation mode, clear
artifact status, discoverable milestones, helpful empty states, contextual tooltips and onboarding, clear practice vs
project distinction. No clutter, childish gamification, decorative features, superficial polish. Preserve the
lecturer-driven experience; quizzes never ahead of core material.

## 8. Practice → Project handoff
End of each week's Practice Canvas: "Now apply this engineering method to your own enterprise." Action opens the
corresponding My Project workspace whose editor reflects what was just learned: what to create, prior artifacts
needed, how to create/edit, how it connects to earlier work, how completion is determined, evidence to submit.

## 9. Week 8 as the critical milestone
Explicit baseline transformation. LEFT: completed Phase I package. RIGHT: emerging model structure and mappings.
Statuses: Not mapped, Mapping proposed, Mapped, Needs review, Invalid or incomplete. Retain source identities and
traceability. Show where document information is insufficient for formal modeling. Teach the difference between an
engineering document, a model element and a traceable relationship.

## 10. Local data and teamwork limits
Runs locally. Do not pretend browser storage gives multi-user collaboration. Reliable local save, export/import and
recovery first. Document that true shared workspaces need a backend, authentication, access control, conflict
resolution and university data-protection review. No paid dependencies without authorization. Reuse existing work.

## 11. Priorities
P1: project architecture; canonical schema; My Project navigation and workspace; Week 1 lab output → persistent team
project; export/import and save validation. P2: milestones and weekly editors; Practice → My Project navigation; Phase I
package export. P3: Week 8 baseline transformation; project artifacts → MBSE representations; traceability and impact
exploration. P4: visual system and UX redesign; lecture navigation and tool onboarding; accessibility and responsive.
P5: extend to all 14 weeks; test continuity and content integration. Reuse working features.

## 12. Tests required
Project creation; persistence; saving/editing artifacts; stable IDs; valid relationships; referential integrity;
export and reimport; protection against accidental overwrite; practice vs project isolation; Week 1 data available in
Week 8; requirement changes affecting model traceability; cross-week continuity; student build separation from faculty
content; accessibility and keyboard navigation. Realistic end-to-end student workflows. Never report unrun tests as passed.

## 13. Process and deadline
Deadline 2026-12-01. Don't restart or discard progress. First audit: reusable functionality, current project data
model, where Practice Canvas stores data, how the Week 1 Team Record works, what is functional, what must change.
Then create PROJECT_WORKSPACE_ARCHITECTURE.md, CANONICAL_ENGINEERING_DATA_MODEL.md, CROSS_PHASE_TRACEABILITY_PLAN.md,
UI_UX_REDESIGN_PROPOSAL.md, UPDATED_IMPLEMENTATION_ROADMAP.md. Build the minimum functional Project Workspace while
lecture packages continue separately; don't block lectures on UI redesign. Reversible technical decisions autonomously;
approval for major academic scope or data/security decisions.

Demo: (1) reviewing Week 1 lecture; (2) practicing stakeholder analysis on AeroLink; (3) opening My Project;
(4) creating own enterprise; (5) saving stakeholders and needs; (6) viewing milestone progress; (7) exporting and
restoring; (8) seeing how the same data will be transformed in Week 8.

Standard: LEARN THE METHOD → PRACTICE ON THE INSTRUCTOR EXAMPLE → APPLY TO YOUR OWN ENTERPRISE → PRESERVE THE WORK →
TRANSFORM INTO MBSE → ANALYZE AND DEFEND THE MODEL.
