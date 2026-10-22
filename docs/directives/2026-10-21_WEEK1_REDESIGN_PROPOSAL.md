# Week 1 Redesign and Platform Enhancement Proposal (faculty-revised, 2026-10-21)

Text extracted verbatim from `Downloads/Systems Thinking Course week 1 work.docx` (2026-10-21 11:31). Controlling specification together with docs/directives/2026-10-21_MASTER_IMPLEMENTATION_DIRECTIVE_WEEK1.md (DECISION_LOG A23).


Wright State University — Systems Thinking & MBSE Learning Studio
Week 1 Redesign and Platform Enhancement Proposal
Status: Proposed for faculty reviewTarget: Week 1 — Team Formation, Stakeholder Identification, and Needs AnalysisCourse: Integrated 14-Week Systems Thinking and MBSE with SysML v2Implementation deadline: December 1, 2026
1. Educational Vision
The course will follow one continuous engineering-development process.
During Weeks 1–7, students will learn systems engineering methodology and develop the document-based engineering baseline for an enterprise of their choosing.
During Weeks 8–14, students will transform their previously developed engineering artifacts into a structured, connected SysML v2 representation of the same enterprise.
The digital platform must preserve that continuity.
The student's experience will follow:
Learn → Understand → Practice → Apply to My Project → Preserve Engineering Evidence → Develop the Model
The application must support professional, instructor-led graduate education, rather than operating primarily as a quiz-based tutorial.
2. Administrator and Student Experiences
Introduce distinct administrative and student experiences.
Administrators / Instructors
Authorized faculty should be able to:
Create and modify instructional content.
Update course introductions, lesson sections, diagrams and worked examples.
Add or remove authorized reading references.
Manage Week 1 laboratory instructions and assessment content.
Preview the student-facing experience.
Save unpublished draft revisions.
Review and publish changes.
See publication history and restore earlier versions.
Manage assignment deadlines and course materials.
Review team enterprise proposals and submitted work.
Provide feedback and approve projects.
Students
Students should be able to:
View the currently published course content.
Resume their learning progress.
Complete guided AeroLink practice exercises.
Create and develop a team enterprise project.
Import engineering data from supported file formats.
Review, revise and export their own engineering artifacts.
View completion status and upcoming project milestones.
Receive updated lessons without losing previously saved project work.
Student users must not have access to unpublished content, faculty answer keys or administrative editing functions.
Implement secure authentication, server-enforced authorization, and versioned shared content storage.
Do not simulate security merely by hiding administrative buttons in the browser.
3. Professional Institutional Homepage
Redesign the course homepage to represent Wright State University and the correct sponsoring academic department.
Use the university's official name, approved department identification, and authorized branding assets.
The homepage should clearly communicate:
What the course is about.
Why Systems Thinking and MBSE are important.
What students will learn.
What they will accomplish during Weeks 1–7.
How that work becomes a SysML v2 model during Weeks 8–14.
What AeroLink Urban Mobility represents.
Why each team develops its own enterprise.
How the learning platform is organized.
What students need to do to begin Week 1.
The page should feel professional, modern, readable, and suitable for a graduate-level engineering course.
Avoid clutter, excessive text repetition, unnecessary data sheets, and confusing multi-column reading order.
4. Revised Week 1 Navigation
Replace the student-facing lecture-first tab structure with:
Overview → Learn → Guided Practice → My Project / Lab → Review & Submit
Remove the separate Lecture tab from student navigation.
Preserve useful lecture content, diagrams, technical explanations, verified references and faculty teaching notes in the underlying instructional source.
Retain PowerPoint export functionality as an optional instructor capability.
Avoid duplicate explanations across Learn and Guided Practice.
5. Unified Week 1 Learning Experience
The Learn tab will become the primary teaching environment.
It must provide comprehensive, graduate-level instruction covering:
Introduction to engineered systems.
Systems Thinking and enterprise systems.
System boundaries and operational environments.
Relationships between stakeholders, needs and enterprise missions.
Stakeholder identification and classification.
Stakeholder concerns, interests and relationships.
Stakeholder needs elicitation.
Needs versus requirements versus proposed solutions.
Engineering context and traceability.
Team formation and enterprise project selection.
Introduce the AeroLink reference case early, with a clear description of the fictional enterprise, its operating concept, stakeholders, and purpose as a continuous instructional example.
The Learn page must provide:
Clearly structured sections.
Detailed but readable engineering explanations.
Verified academic terminology and references.
Interactive technical diagrams where educationally useful.
Meaningful motion and animation, with reduced-motion accessibility support.
Selective knowledge checks after instruction, not in place of it.
Clear progress through the lesson.
Strong links between the material being taught and its use in later weeks.
Improve the current unused horizontal space with a responsive instructional layout, such as a persistent section navigator, expandable engineering-reference panel, or context-sensitive figure viewer.
Do not sacrifice readability by stretching long paragraphs across excessively wide screens.
6. Guided Practice
Guided Practice is where students apply the engineering method to the instructor's AeroLink example.
The practice experience should be interactive, understandable, and forgiving.
Students should be able to:
Explore the AeroLink enterprise boundary.
Identify and classify stakeholders.
Examine stakeholder concerns.
Identify relationships and conflicts.
Draft stakeholder needs.
Connect needs to mission objectives.
Receive context-sensitive feedback.
Revise their answers.
See why an engineering decision is appropriate or inappropriate.
Reset a practice activity without affecting their own project.
Include a limited number of thoughtfully designed assessment questions within the examples to reinforce engineering reasoning.
The purpose is genuine understanding, not superficial point scoring.
7. My Project — Persistent Engineering Canvas
Develop one coherent project workspace that supports every week of the semester.
Week 1 will establish the foundation.
Students must be able to:
Create their enterprise.
Record the enterprise mission and problem statement.
Define team members and roles.
Identify and categorize stakeholders.
Enter stakeholder interests and concerns.
Record relationships between stakeholders.
Develop initial stakeholder needs.
Associate needs with stakeholders and mission objectives.
Record assumptions and rationale.
View project completeness.
Save, edit and review artifacts.
Preserve stable identifiers for future weeks.
The workspace must dynamically track student progress while providing a clear path to Weeks 2–14.
Future weeks should extend the same underlying project, not introduce disconnected workbooks.
8. Intelligent Excel Import
Students should be allowed to prepare stakeholder data externally, including with AI assistance, and upload an Excel workbook.
The application should:
Accept supported Excel files.
Inspect available worksheets.
Detect likely stakeholder-related columns.
Propose mappings to the internal engineering data model.
Display each proposed mapping for student review.
Identify missing mandatory fields.
Detect potential duplicates.
Highlight uncertain or ambiguous information.
Allow students to correct mappings.
Preview the resulting stakeholder register.
Require explicit confirmation before saving.
Preserve provenance, source-file information and imported identifiers where appropriate.
Use deterministic column matching and validation first, with optional AI-assisted interpretation only if a suitable privacy-approved service is available.
Never silently convert guesses into authoritative engineering data.
Never invent stakeholders, needs or requirements because a spreadsheet field is missing.
9. Laboratory User Experience
Redesign the Week 1 laboratory interface to be easier for both faculty and students to understand.
For every input field, provide:
A clear field title.
A short explanation of what belongs in it.
An engineering example.
The relationship to the current week's learning objective.
A definition of the expected value or format.
Immediate, constructive validation messages.
Guidance on why the input matters in later weeks.
When students click or focus on an input, show contextual guidance without obscuring the form.
For example, selecting the Stakeholder Concern field should explain what a concern is, provide a relevant AeroLink example, and distinguish concerns from requirements.
Use editable tables, meaningful diagrams, and progressive disclosure where appropriate rather than presenting students with a large intimidating collection of blank boxes.
10. Week 1 Traceability Foundation
Every saved engineering artifact should receive a stable identifier.
Support relationships among:
Enterprise → Mission → Stakeholder → Concern → Need
Where applicable, relate needs to mission objectives and explicitly record the supporting rationale.
These Week 1 relationships must be reusable later.
Week 2 will extend the baseline with ConOps and requirements.
Week 8 will use the saved stakeholder and engineering baseline as the foundation for MBSE implementation.
The platform should display future relationships as a development roadmap without implying that students have completed work they have not yet performed.
11. Saving, Exporting and Student Data Protection
The current application uses browser-local project storage.
Before introducing student accounts and shared content, design an appropriate persistent storage architecture.
Student work must not be lost when an administrator publishes new content.
Provide:
Reliable autosave.
Visible save status.
Version and change history.
Project export and restore.
Conflict detection.
Stable artifact IDs.
Safe import validation.
Separate administrative and student data.
Appropriate backups and recovery procedures.
The initial implementation must address any existing data-save defects before student use.
Retain JSON for structured machine-readable project exchange and Markdown/PDF for human-readable reports where appropriate.
Use clear student-facing terminology rather than technical file extensions as the primary actions.
12. Visual and Interaction Design
Improve the existing UI through a consistent professional design system.
Prioritize:
Clear navigation.
High-quality typography.
Professional spacing and contrast.
Responsive layouts.
Context-sensitive instructional diagrams.
Accessible animations.
Interactive stakeholder maps.
Useful progress indicators.
Understandable laboratory controls.
Clear empty states and success/error messages.
Persistent connections between learning and student projects.
The experience should be engaging because it helps students understand and manipulate engineering concepts—not because it contains unnecessary animations or decorative gamification.
13. Initial Implementation Scope
Only Week 1 is authorized for instructional redesign during this approval phase.
The underlying project architecture should support future weeks, but avoid rebuilding Weeks 2–14 before the Week 1 template is reviewed.
Recommended initial milestones:
Milestone A: Approve the Week 1 learning structure, admin/student role requirements, and visual design.
Milestone B: Resolve student data persistence risks and establish secure content-management architecture.
Milestone C: Implement the new homepage, unified Learn experience, and Guided Practice.
Milestone D: Implement the simplified Week 1 engineering canvas and Excel stakeholder import.
Milestone E: Demonstrate Week 1 data continuity into the project workspace and Week 8 modeling preview.
Milestone F: Conduct academic review, student usability testing, accessibility checks and regression testing.
14. Acceptance Criteria
Week 1 should be considered ready for faculty sign-off only when:
The course introduction is accurate and professionally presented.
Students can understand Week 1 learning objectives without guessing.
Lesson and worked-example content is not unnecessarily repeated.
Technical explanations retain graduate-level depth.
AeroLink is clearly explained and identified as the instructor example.
Practice activities function independently of official project data.
Students can create their own enterprise and develop stakeholder information.
Excel imports require review and do not introduce fabricated engineering data.
Laboratory inputs have meaningful contextual guidance.
Student project artifacts persist reliably.
Week 1 artifacts retain their identities and can be used in later modeling activities.
Administrators can safely update and publish course content through a properly authorized system.
Student and administrative permissions are enforced securely.
The interface is understandable, accessible, and usable.
The demonstrated workflows have passed appropriate tests.
15. Faculty Decisions Required
Before implementation, confirm:
Official university and department branding.
Administrative account roles.
Whether a suitable university-hosted service or approved cloud backend will be available.
Whether students require individual accounts, shared team workspaces, or both.
Whether AI spreadsheet interpretation is permitted and, if so, through which approved service.
Which content and student-record features must be fully operational for the December 1 submission.
Primary principle: The platform must enable students to understand systems engineering concepts, practice them with the instructor's example, apply them to their own enterprise, and preserve every engineering artifact needed for the model-based phase.

