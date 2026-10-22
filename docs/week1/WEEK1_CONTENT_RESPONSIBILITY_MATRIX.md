# Week 1 content responsibility matrix

Prepared 2026-10-21 for directive §10.4 ("a concept may appear in several stages, but for a different purpose each time, never as repeated
paragraphs") and §5 ("one authored source … no duplication"). A document only: nothing was moved or deleted. Paths are relative to
`learning-studio/`. Line numbers are from the 2026-10-21 working tree. Word counts for lesson sections were measured with the app's own
`wordCount`/`blockText` helpers (paragraph, heading, table, list and callout text; figures excluded).

**Stage responsibilities (§10.4)**

| Code | Stage | Responsibility | Voice |
|---|---|---|---|
| **L** | Learn | Theory: definition, source, method, distinctions, AeroLink worked example, common errors | Explains |
| **GP** | Guided Practice | Application of the method to AeroLink, with reasoned feedback | Asks and responds; links back to L, does not re-explain |
| **MP** | My Project / Lab | Application to the team's own enterprise: field guidance (definition in one line, linked to L), format, validation | Guides a field |
| **RS** | Review & Submit | Quality review against criteria, then submission | Checks; cites the criterion |
| *F* | Faculty-only | Slides, notes, pptx, keys | Teaches in class |

Rule applied throughout: **the full explanation lives once, in Learn.** Other stages may show one sentence plus a link to the Learn
section id. They never repeat the paragraph.

---

## 1. Inventory of explanatory content, by surface

| # | Surface | Source | Student-visible today? | Size | Nature |
|---|---|---|---|---|---|
| S1 | Lecture slides (on-slide text) | `src/content/lectures/week01/session1.ts`, `session2.ts` (`sections[].slides[]`) | Yes: Lecture tab, handout, pptx | 48 slides, ≤60 words each (`SLIDE_WORD_BUDGET`, `types.ts`) | Summary bullets and figures |
| S2 | Faculty notes | same files (`notes`) | No in `build:student`; **yes** on the dev server (audit L-1) | ≈11,250 + ≈10,380 words (exported notes, audit §3) | Spoken teaching script, misconceptions, worked solutions |
| S3 | Student lesson | `session1.ts:1157-1452`, `session2.ts:881-1126` | Yes: `#/week/1/lesson` | **13,493 words**, 21 sections + references | Textbook prose with citations |
| S4 | Worked-examples page | `src/week1/Examples.tsx`, `exampleParts.ts` | Yes: `#/week/1/examples` | Re-renders **3,662 words** of S3 + slide faces + a paper exercise | Duplicate render |
| S5 | Learn sections l1–l7 | `src/content/learn/week01.ts:19-488` | Bodies **no** (dormant); checks c1–c7 **yes** as lesson self-checks | 7 bodies, each `maxWords` 580–660 | Older parallel explanation + MCQ checks |
| S6 | Week 1 blocks | `src/content/week1.ts`, `src/content/weeks/week01.ts` | Archive only (faculty); `w1-se` quote on Welcome | ≈20 blocks | Older parallel explanation |
| S7 | Overview text | `src/content/week1Path.ts`, `src/week1/Home.tsx` | Yes | ≈600 words of prose | Orientation |
| S8 | Welcome | `src/content/learn/welcome.ts`, `src/pages/Welcome.tsx` | Yes | ≈650 words | Course orientation |
| S9 | Missions (briefs, instructions, debriefs, step explanations) | `src/content/missions/week01.ts`; keys in `src/workbench/week1/stakeholders.ts`, `src/content/week1.ts BOUNDARY_ITEMS` | Yes | 6 missions | Task text plus feedback |
| S10 | Lab instructions | `src/content/lab/week01Lab.ts` (+ generated `docs/lectures/week01/WEEK1_LAB_INSTRUCTIONS.md`) | Yes: `#/week/1/lab` | ≈2,000 words | Procedure plus method re-statement |
| S11 | Lab tool labels and help | `src/workbench/week1/TeamView.tsx`, `needQuality.ts SELF_CHECK`, `stakeholders.ts CONCERN_HELP` | Yes | Field labels, checks | Field guidance and validation |
| S12 | Quiz Q1 explanations | `src/content/quizWeek1.ts` | Yes | 10 items × 4 explanations | Feedback that re-explains |
| S13 | Lesson self-checks (c1–c7) | `learn/week01.ts` `check` objects; rendered by `LessonReader.tsx:56-68` | Yes | 7 items × 4 feedbacks | Feedback |
| S14 | Team Record and rubric text | `learn/week01.ts TEAM_RECORD`, `rubrics.generated.json` | Yes (Lab, Assessment) | 6 parts | Criteria |

---

## 2. Concept matrix: where each concept is explained, the duplication, and who owns it

Legend for the stage columns: **own** = the full explanation lives here; **apply** = used in a task, linked back to L; **guide** = a one-line
field definition plus a link; **review** = cited as a criterion; — = absent.

### C01. Course architecture: two phases, one enterprise, continuity to Week 8
- **Explained in:** S3 `session1.ts:1169` ("In Phase I (Weeks 1–7) each team builds a document-based Systems Thinking Engineering Package. In Phase II (Weeks 8–14) the same team rebuilds that package as a SysML v2 model"); S8 `welcome.ts:54` ("Phase I, Systems Thinking (Weeks 1–7), builds your team’s Systems Thinking Engineering Package … Phase II … turns that package into a coherent SysML v2 enterprise model"); S7 `week1Path.ts:22` ("in Week 8 the same IDs become elements of your SysML v2 model"); S1 slide `s1-course-architecture` (`session1.ts:160-200`).
- **Duplication:** three student-visible prose versions (S3, S7, S8).
- **Assignment:** Homepage **own** (§8 requires it there) · L: one paragraph that refers to the homepage and adds only the Week 1 consequence (identifiers are keys), from `session1.ts:1169` second half · GP — · MP: Week 8 preview panel (`ModelPreview.tsx`) **apply** · RS: "how this is used in Week 2/8" line **review**.
- **Action:** **merge** S7's WHY into Overview's single "how this is used later" sentence. **Cut from student view**: the duplicate of the phase description in S3 (keep its ID-continuity sentence).

### C02. AeroLink: what it is, why it is used, what is fictional
- **Explained in:** S3 `session1.ts:1174` ("a fictional company that runs electric vertical-take-off-and-landing air taxis between six vertiports … Every number about it … is a teaching value"); S8 `welcome.ts:45` ("a FICTIONAL urban air-taxi operator, is the instructor’s reference case"); S5 dormant `MEET_AEROLINK` (`learn/week01.ts:618-634`); S1 slide `s1-meet-aerolink` (`session1.ts:210-248`); S3 `s2-l-case-register` callout (`session2.ts:1010`, "Every number, rating and statement is a teaching value"); S7 `week1Path.ts:18`.
- **Duplication:** four student-visible introductions (S3 ×2, S7, S8), none of which covers all §10.1 items (mission, operating concept, stakeholders, real versus fictional, how the professor uses it).
- **Assignment:** Homepage: two sentences (what AeroLink is and why it is used) · **L own** (new chapter 1.3, built from `MEET_AEROLINK` + `aerolinkCase.ts`) · GP: case banner "AeroLink — instructor example (fictional)" **apply** (exists: `ExampleBanner`, `project/pages/ui.tsx`) · MP: "AeroLink example" line in each field's guidance **guide** · RS —.
- **Action:** **move** `MEET_AEROLINK` into Learn; **merge** the S3 paragraph (`:1174`) into it; **cut from student view** the remaining restatements (S7 keeps one clause).

### C03. Purpose of systems engineering and the definition of success
- **Explained in:** S3 `session1.ts:1190` ("“a transdisciplinary approach and means to enable the realization of successful systems,” … (R01 p.51)"); S6 `week1.ts:62-70` (w1-se; quote from R01 p.52); S8 Welcome quotes w1-se (`Welcome.tsx:22,64-66`).
- **Duplication:** the lesson cites p.51, the Welcome quotes the INCOSE Fellows definition at p.52. They are two different, both correct, quotations. Keep both, in different roles.
- **Assignment:** Homepage: the p.52 definition (course framing) · **L own** (p.51, success = stakeholder needs) · GP/MP/RS —.
- **Action:** none beyond the placement.

### C04. Engineered systems: definitions of system, engineered system, context types
- **Explained in:** S3 `s1-lesson-system` (`session1.ts:1185-1214`, 582 words; R38 p.1637 three definitions, R01 p.51 engineered system, R92 p.326 context types); S6 `weeks/week01.ts:39` (w1-system ¶1, the same three definitions); S5 l2 body and keyTerms (`learn/week01.ts:96-134`); S12 w1q-3.
- **Duplication:** `weeks/week01.ts:39` and `session1.ts:1199` both paraphrase R38 p.1637 ("“a set of elements in interaction” (von Bertalanffy) … “combination of interacting elements organized to achieve one or more stated purposes”").
- **Assignment:** **L own** · GP — · MP: the SoI field definition (one line) **guide** · RS —.
- **Action:** S6 and the S5 bodies stay retired. The S5 keyTerms feed the Learn glossary.

### C05. Systems thinking (principles, holism and separation of concerns, analysis and synthesis, the paradox)
- **Explained in:** S8 `welcome.ts:18` only, as **course framing without a source** ("Systems thinking, as this course uses the term, is the habit of seeing a problem as interacting parts, boundaries and feedback"). Cited material exists but is **off the student path**: `week1.ts:85-106` (w1-paradox R02 p.266, R04 pp.273–275; w1-analysis-synthesis R50 pp.46–47), `week1.ts PRINCIPLES` (8 principles, R04 pp.274–275).
- **Duplication:** none. This is a **coverage gap** (§10 topic 2).
- **Assignment:** **L own** (new chapter 3) · GP: optional principle-spotting prompt on AeroLink (e.g. Equifinality "Shorter waits can come from more aircraft, faster charging or better scheduling", `week1.ts:168`) **apply** · MP: none required · RS —.
- **Action:** **move** w1-paradox, w1-analysis-synthesis and PRINCIPLES into Learn chapter 3 (after a fresh claim-check against `_source_cache`).

### C06. System of interest and enabling systems
- **Explained in:** S3 `s1-lesson-soi` (`session1.ts:1220-1226`; R39b p.1652, R39c p.1493); S6 `weeks/week01.ts:40`; S5 l2; S12 w1q-3; S1 slide `s1-soi-enabling`.
- **Duplication:** S3 versus S6 (dormant).
- **Assignment:** **L own** · GP: boundary task asks which elements are enabling **apply** · MP: SoI and PRT fields **guide** · RS: "SoI stated, distinct from the enterprise" **review**.

### C07. Enterprise versus organization; extended enterprise
- **Explained in:** S3 `session1.ts:1231` ("It warns that treating an enterprise as an organization is “a frequent misuse” … (R07 p.815)"); S2 notes `session1.ts:367,380`; S6 `weeks/week01.ts:41` ("SEBoK warns that an enterprise is not the same as an organization"); S5 keyTerms `learn/week01.ts:133`, check c2 (`:144-145`).
- **Duplication:** the same warning appears in S3, S6 and S5 (S5 is visible only as c2 feedback).
- **Inconsistency to resolve:** S5 keyTerm `Enterprise` uses R07 p.815; S3 gives R39d p.1497 as **SEBoK's preferred** definition and R07 as a description. Keep S3's framing.
- **Assignment:** **L own** · GP: "three scopes" task **apply** · MP: enterprise name/description field **guide** · RS: proposal names enterprise and SoI separately **review**.

### C08. Boundary, environment and context (vocabulary, four layers, environments by stage)
- **Explained in:** S3 `s1-lesson-boundary` (`session1.ts:1242-1284`, 708 words); S6 `week1.ts:77-79` (w1-soi: "Observers draw boundaries"); S5 l3 body and c3 (`learn/week01.ts:158-214`); S9 mission 2 (`missions/week01.ts:105-172`) with `BOUNDARY_ITEMS` explanations (`week1.ts:170-180`); S12 w1q-2, w1q-4.
- **Duplication:** the "drawn by an observer" idea appears in S3 `:1253` ("It is drawn, not found"), S6 `week1.ts:77`, and S5 `learn/week01.ts:162`. The mission 2 explanations re-explain the endogenous-variable criterion (`week1.ts:178`), which is feedback and therefore legitimate.
- **Assignment:** **L own** · **GP apply** (mission 2: classify inside / environment / irrelevant for a question) · MP: context rows (EXT, crosses, direction) **guide** · RS: "≥6 external systems, each exchange stated" **review**.

### C09. A boundary is a decision: control, influence, power
- **Explained in:** S3 `session1.ts:1279` ("Churchman and other critical systems thinkers treat the relative power and responsibility of the participants as key factors … (R02 p.264)"); S6 `week1.ts:79`; S5 c3 (`learn/week01.ts:202`); S6 `week1.ts:142` (w1-application, R50 p.48).
- **Duplication:** three copies of the Churchman sentence (S3, S6, S5 c3 feedback).
- **Assignment:** **L own** · GP: control/influence ring sort **apply** (candidate interactive, IA §4.4) · MP —.

### C10. Life cycle, ISO/IEC/IEEE 15288 processes, BMA → Stakeholder Needs Definition; problem, mission, goals
- **Explained in:** S3 `s1-lesson-lifecycle` (`session1.ts:1286-1320`, 609 words); S1 slides `s1-life-cycle-stages`, `s1-15288-processes`, `s1-bma-feeds-snd`. The mission and problem statement appear only as BMA outputs (`session1.ts:1311`, R10 p.544) and in the lab (`week01Lab.ts:59`).
- **Duplication:** none in student view.
- **Gap:** no formal definition of *mission*, *goal* or *objective*, and no guidance on writing a problem statement (only "one sentence each"). See IA gap G4.
- **Assignment:** **L own** · GP: link AeroLink needs to MGO-001…009 **apply** · MP: problem, mission, goals fields **guide** · RS: every need traces to the mission or a goal **review**.

### C11. Teams: definition, IPT, roles, communication paths, charter, norms
- **Explained in:** S3 `s1-lesson-teams` (`session1.ts:1322-1358`, 694 words); S6 `weeks/week01.ts:24-26` (w1-team); S5 l1 body, worked example, keyTerms, c1 (`learn/week01.ts:20-83`); S10 `week01Lab.ts:59` (Charter method) and `LAB_PROCEDURE` charter row; S1 slides `s1-team-*`, `s2-lab-charter`; S12 w1q-1.
- **Duplication:** charter fields restated in S3 `:1354` ("The course charter has four fields: lead roles, decision rules, communication norms and owned identifier prefixes"), S6 `weeks/week01.ts:25`, S5 `learn/week01.ts:25`, S10 `week01Lab.ts:59`, S14 `learn/week01.ts:671`.
- **Inconsistency:** S6 `weeks/week01.ts:26` and S5 `:39,49-50` say ENT is "the system of interest"; S3 `session1.ts:1236` and `:1354` say ENT is the enterprise and SoI is separate.
- **Assignment:** **L own** (chapter 11) · GP — (no AeroLink team) · MP: charter fields **guide** · RS: completeness check **review**.

### C12. Enterprise selection criteria and the proposal
- **Explained in:** S3 `session1.ts:1174` ("A suitable enterprise, by course convention, has several interacting parts, people as well as technology, exchanges across its boundary, stakeholders whose needs differ, and enough substance to be modeled in Phase II"); S5 l2 callout `learn/week01.ts:111`; S2 notes `weeks/week01.ts:371`; S12 w1q-5 (`quizWeek1.ts:68-77`); S10 pitch step.
- **Duplication:** three student-visible versions of the criteria (S3, S12 explanation, and S5 when the archive is open).
- **Gap:** no dedicated section. The criteria are a course convention with no source (acceptable if labelled), and no worked example of a good or weak proposal exists.
- **Assignment:** **L own** (chapter 11.4) · GP: evaluate four candidate proposals (reuse w1q-5 as a reasoning task) **apply** · MP: suitability field **guide** · RS: instructor approval **review** (§12 instructor action).

### C13. Who counts as a stakeholder
- **Explained in:** S3 `session1.ts:1365-1370` (R39a p.1631, four definitions; "The weather and the electric grid are parts of the context, although the utility that runs the grid is a stakeholder"); S6 `weeks/week01.ts:55`; S5 l4 and c4 (`learn/week01.ts:271-274`); S9 mission 1 instruction `missions/week01.ts:64` ("A stakeholder is an individual, group or organization, or a class of them, with an interest in the system or affected by it (Session 1)"); S2 notes `weeks/week01.ts:365`; S3 errors table row 2 (`session2.ts:991`).
- **Duplication:** the weather-versus-utility example appears in S3 `:1370`, S5 c4 (`learn/week01.ts:271-272`), S6 `weeks/week01.ts:365` and the errors table.
- **Assignment:** **L own** · **GP apply** (mission 1: stakeholder or not) · MP: stakeholder name field **guide** · RS —.
- **Action:** **cut** the mission 1 definition sentence to a link ("see Learn 6.1").

### C14. Why stakeholders first; identification methods; approving authorities
- **Explained in:** S3 `session1.ts:1374-1401` (R11 pp.552–553, R98 p.1001, R53 p.297, R65 p.322, R63 p.235, R99 pp.51–52); S6 `weeks/week01.ts:56-59`, `w1-worked-stakeholders` (`:116-128`); S5 l4 (`learn/week01.ts:216-283`); S5 OPENER.why (`:513`, "Stakeholders are the primary source of needs"); S10 `week01Lab.ts:62`; S12 w1q-6, w1q-7, w1q-8.
- **Duplication:** "primary source of needs and requirements" appears at `session1.ts:1374`, `weeks/week01.ts:56,61`, `learn/week01.ts:513`, and slide notes `session1.ts:855,861`. "Run all three methods" is restated in S10 `week01Lab.ts:62`.
- **Assignment:** **L own** · GP: mission 3 classify plus "which method finds whom" **apply** · MP: approving-authority flag **guide** · RS: "≥1 approving authority; ≥1 stakeholder who is not a customer or user" **review**.
- **Action:** **cut** S10's method restatement to a link.

### C15. Classifying stakeholders; the register; interest, influence, support
- **Explained in:** S3 `s1-lesson-classifying` (`session1.ts:1413-1417`) and `s2-l-concerns` (`session2.ts:893-894`); S6 `weeks/week01.ts:72-75`; S5 l5 (`learn/week01.ts:285-342`); S9 mission 3; S10 classification step.
- **Duplication:** S3 explains the register **twice**, in S1 (`:1413` "The course register (course convention) records for each stakeholder…") and in S2 (`:893` "The course register combines the two…"). MITRE's "high influencers must be committed advocates" appears at `session1.ts:1417` **and** `session2.ts:894`.
- **Inconsistency:** S3 says the register records "an interest and an influence rating from 1 to 5, each with a reason" (`session1.ts:1413`) and S2 adds support. The lab tool records **influence only** (`team.ts` `StakeholderRow`).
- **Assignment:** **L own** (one register section, merged) · GP: mission 3 rows **apply** · MP: role, stage, side, approving, influence and reason fields **guide** · RS: "≥3 role groups, ratings carry reasons" **review**.
- **Action:** **merge** the two S3 register passages into one Learn section.

### C16. Concerns
- **Explained in:** S3 `s2-l-concerns` (`session2.ts:887-891`; R77 p.115 definition; "The operative word is *specific*"); S6 `weeks/week01.ts:74` ("Write the concern so that someone else could check it: say what, for whom, and where or when it bites"); S5 l5 and c5; S11 `CONCERN_HELP` (`stakeholders.ts:120`, "Say what, for whom, and where or when it bites"); S3 errors table row 8 (`session2.ts:997`).
- **Duplication:** "what, for whom, where or when" appears in S3 `session2.ts:889`, S6 `:74`, S11 `:120`, S3 errors table, and the TeamView label (`TeamView.tsx:474`). The S11 and label uses are legitimate field guidance.
- **Assignment:** **L own** · GP: concern rewriting **apply** (mission 3 part 3) · MP: concern field **guide** (CONCERN_HELP + AeroLink CON-012) · RS: "no generic concerns" **review**.

### C17. Relationships between stakeholders; recording conflict
- **Explained in:** S3 `session2.ts:896` ("a register should record **relationships** between stakeholders, because a flat list hides dependencies and conflicts") and `s2-l-conflict` (`session2.ts:969-978`); S6 `weeks/week01.ts:75`, `:191-197` (w1-advanced); S10 `week01Lab.ts:64`.
- **Gap:** the seven relationship types (`labBrief.ts:69`) are not defined anywhere for students (course convention).
- **Assignment:** **L own** · **GP apply** (identify relationships and conflicts on AeroLink, §11) · MP: REL rows **guide** · RS: "≥3 REL, ≥1 conflict" **review**.

### C18. Needs versus requirements versus proposed solutions; the transformation
- **Explained in:** S3 `s2-l-needs-reqs` (`session2.ts:904-911`; R11 p.549, R13 pp.557–559, R39a p.1632, R39l p.1652); S6 `weeks/week01.ts:88-90`; S5 l6, c6 (`learn/week01.ts:406-409`); S3 errors table row 3; S2 notes `session2.ts:274-293`; S12 w1q-10.
- **Duplication:** "transformed into system requirements, which communicate the developer’s perspective" appears at `session2.ts:904` and `weeks/week01.ts:89`. The "not a need with shall added" point appears in S3 `:909` and S5 c6 feedback `learn/week01.ts:407`.
- **Assignment:** **L own** · GP: mission 4 part 1 diagnose drafts **apply** · MP: need statement field **guide** · RS: "no shall, no named solution" **review**.

### C19. The integrated set of needs and why it is kept (validation)
- **Explained in:** S3 `s2-l-integrated-set` (`session2.ts:919-924`); S6 `weeks/week01.ts:90`.
- **Assignment:** **L own** · GP — · MP — · RS: set-level checks **review**.

### C20. Well-formed needs: form, MITRE attributes, set test, the six-check gate, design words
- **Explained in:** S3 `s2-l-well-formed` (`session2.ts:934-945`, 900 words); S6 `weeks/week01.ts:103-106`; S5 l7, c7; S9 mission 4 brief (`missions/week01.ts:241,250`); S10 `week01Lab.ts:65`, `LAB_TOOL` (`:107`); S11 `needQuality.ts:35-42` (SELF_CHECK), `TeamView.tsx:578-588`; S1 slide `s2-well-formed`.
- **Duplication:** the recommended form and the six checks are stated in S3 callout `session2.ts:940`, S6 `weeks/week01.ts:106`, S9 `:241,250`, S10 `:65,107`, S11 ×2. "Beware solutions masquerading as needs" (R53 p.296) appears at `session2.ts:935`, `weeks/week01.ts:108`, `learn/week01.ts:437`.
- **Assignment:** **L own** · **GP apply** (mission 4 part 2: write two needs, receive gate feedback) · **MP guide** (SELF_CHECK labels as field help; the gate is the validation feedback) · RS: the six checks as the review checklist **review**.
- **Action:** **cut** the S10 restatements (`week01Lab.ts:65,107`) to "see Learn 9.4; the tool applies the six checks". S11 stays (field guidance).

### C21. Elicitation techniques and finding the real need
- **Explained in:** S3 `s2-l-elicitation` (`session2.ts:953-961`); S6 `weeks/week01.ts:91` ("rationale often reveals the real need"); S12 w1q-9; S1 `s2-real-need`; the AeroLink "sound barriers" example at `session2.ts:961`, `weeks/week01.ts:167`, `learn/week01.ts:374`, `LectureWeek1S2.tsx:564`.
- **Duplication:** the sound-barrier example appears in three text sources plus the figure.
- **Assignment:** **L own** · GP: choose a technique for an AeroLink stakeholder (reuse `ELICITATION_PLAN`, `aerolinkCase.ts:375`) **apply** · MP: rationale field **guide** · RS —.

### C22. Priority and conflict adjudication
- **Explained in:** S3 `s2-l-conflict` (`session2.ts:969-978`; R10 p.546, R11 pp.551–553, R65 p.325); `labBrief.ts:35-40` (priority definitions); S6 w1-advanced.
- **Assignment:** **L own** · GP: AeroLink noise against throughput (`CONFLICT`, `aerolinkCase.ts:341`) **apply** · MP: priority field **guide** (`NEED_PRIORITY_DEFINITION`) · RS: conflict recorded with protocol **review**.

### C23. Coverage audit
- **Explained in:** S3 `s2-l-case-audit` (`session2.ts:1054-1060`); S10 `week01Lab.ts:66` ("Build the stakeholder-by-need matrix. For every stakeholder without a need, either add a need or record why…"); S3 `s2-l-lab` (`session2.ts:1103`); S4 re-renders the audit section.
- **Duplication:** S3 ↔ S4 (whole section); S3 `:1060` ↔ S10 `:66` (same instruction).
- **Assignment:** L **own** (method and AeroLink audit) · GP: run the audit on AeroLink, find `DELIBERATE_GAP` **apply** · MP: coverage matrix view (computed) · **RS own** (audit as a review step).

### C24. Common errors
- **Explained in:** S3 `s2-l-errors` table (`session2.ts:987-1001`); S2 46 `misconceptions` entries; S6 `weeks/week01.ts:360-367` (instructor misconceptions).
- **Assignment:** **L own** (a "Common errors" box per chapter, from the table and the notes) · GP: feedback text draws on them **apply** · RS: checklist **review**.

### C25. Identifiers, traceability foundations, Week 2 and Week 8 continuity
- **Explained in:** S3 `session1.ts:1169` (IDs as keys); S3 `s2-l-bridge` (`session2.ts:1083-1084`); S3 `s2-l-why-methods`; S5 `MODEL_INPUTS` (`learn/week01.ts:776-790`, rendered on the Lab page); S5 BRIDGE (Assessment); S7 `week1Path.ts:22`; S6 `weeks/week01.ts:26`.
- **Duplication:** the forward link to Week 2/Week 8 is stated in five student-visible places (S3 ×2, S7, S10 model-inputs lede, Assessment bridge).
- **Gap:** no definition of *traceability* or *trace link* with a source.
- **Assignment:** **L own** (chapter 10) · GP: AeroLink trace STK-010 → CON-011 → NEED-010 (`w1s2-trace-lanes`) **apply** · **MP own** for the live view: IDs and typed links, Week 8 preview (`ModelPreview.tsx`) · RS: traceability completeness **review**.

### C26. Team Record parts, minimums and submission
- **Explained in:** S3 `s2-l-lab` (`session2.ts:1100-1103`); S10 whole page; S14 `TEAM_RECORD` (`learn/week01.ts:668-685`); S9 mission 5 briefs (`missions/week01.ts:276-282`); S7 deliverables (`week1Path.ts:92-98`); S1 slides `s2-lab-brief`, `s2-lab-close`.
- **Duplication:** the minimums appear in S3 (via the slide figures), S10, S14 and S9. All read `labBrief.ts`, so the numbers agree, but the prose repeats.
- **Assignment:** L: one closing paragraph "what you will produce", linking to MP · GP — · **MP own** (instructions drawer + live checks) · **RS own** (checklist + states).
- **Action:** **cut** `s2-l-lab` from Learn's body (it is lab instruction, not theory). **Move** it to MP.

### C27. AI usage statement
- **Explained in:** S10 `week01Lab.ts` (AI step); S14 part 6; rubric RB-12 (with internal "[S01/S02]").
- **Gap:** no Learn text and no definition. It is a course policy.
- **Assignment:** L — · MP: field guidance **guide** · RS: RB-12 rows **review** (strip internal codes).

---

## 3. Summary of moves (source is never deleted)

| Content | From | To | Kind |
|---|---|---|---|
| Lesson sections (21) | `#/week/1/lesson` (shell C) | Learn chapters 1–11 (`WEEK1_TEXTBOOK_IA.md`) | Move and re-sequence |
| `s2-l-case-register`, `s2-l-case-needs`, `s2-l-case-audit` | Lesson **and** Examples page | Learn only (as the worked example inside chapters 6, 7, 9 and 10) | Remove the duplicate render |
| `s2-l-lab` | Lesson | My Project / Lab instructions | Move |
| `MEET_AEROLINK` (dormant) | `learn/week01.ts` | Learn ch. 1.3 | Move |
| Systems-thinking blocks | `week1.ts` (off path) | Learn ch. 3 | Move (after claim re-check) |
| Self-checks c1–c7 and quiz items | Lesson end of section / Assessment page | Learn knowledge checks after instruction (placement in IA) | Re-place |
| Mission 1–4 definitions in briefs | `missions/week01.ts` | One-line link to Learn | Cut from view |
| `LAB_METHOD` restatements | `week01Lab.ts:58-66` | Links to Learn sections | Cut from view |
| Overview "why" duplicate | `week1Path.ts:22` | One sentence on the Overview | Merge |
| Slides and notes | Student Lecture tab | Faculty only | Retire from student nav |
| `weeks/week01.ts` and `week1.ts` duplicate blocks; Learn l1–l7 bodies | Archive / dormant | Stay in source; no student route | Retire from student nav |

## 4. Internal codes and faculty states visible to students (flag list)

| Code or state | Where (file:line) | Seen on |
|---|---|---|
| Register codes in prose, e.g. "(R01 p.51)", "(R11 pp.549–555)" — **150** in the lesson | `session1.ts:1157-1452` (71), `session2.ts:881-1126` (79); readings callout `session1.ts:1447` | Lesson |
| Register id prefix in every citation, "R11 · SEBoK…" | `readings.ts:33` | Lesson, Overview, Lab |
| Error-table "Basis" column of codes, e.g. "R39a p.1631 (inferred from the definitions)" | `session2.ts:990-999` | Lesson |
| "all S04 classes" | `rubrics.generated.json:59`; `learn/week01.ts:682` | Lab rubric |
| "[S01/S02]", "S01 gives the statements no weight" | `rubrics.generated.json:753,770,774,783` | Lab rubric (RB-12) |
| "S12 p.144", "S11 p.767", "S11 p.467" (later weeks) | `rubrics.generated.json:205,293,367` | Later-week rubric rows |
| "AROU", "CAP → NEED" | `learn/week01.ts:682` | Lab rubric note |
| "RB-1.1", "RB-1.3", "RB-1.4" | `stakeholders.ts:129` (in a validation message), `week01Lab.ts:64,92-94`, `weeks/week01.ts:74` | Lab tool message, Lab page |
| "L4", "(L5)", "L3" | `missions/week01.ts:100,191`; `learn/week01.ts:629` | Practice |
| "Session 1, slide 16" and 10 more slide numbers | `quizWeek1.ts` (11 occurrences); `Quiz.tsx:17` taught-in line | Assessment |
| "On the slide: session N, slide K" | `LessonReader.tsx:45-48` | Lesson |
| "B1.6/B1.7 proposed, pending faculty approval" | `week1Path.ts:27-30`; `week01Lab.ts:49-56` | Overview, Lab |
| "pending faculty approval" (three-person minimums), "proposed, pending faculty decision" (RB-1.4) | `week01Lab.ts:64,70,92-94` | Lab |
| "(FICTIONAL, proposed)", "proposed clock times" | `aerolinkCase.ts:270`, `:82` | Lesson case tables |
| "slide 3 of 28" | `SiteGuide.tsx` (lecture branch); `week1Path.ts:56` fallback | Welcome |
| "Week 1 is built this way; later weeks will follow it as they are rebuilt" | `welcome.ts:62` | Welcome |

## 5. Stale or contradictory duplicates found while mapping

| Claim | Version A | Version B (canonical) |
|---|---|---|
| Number of AeroLink stakeholders | "Result: fourteen stakeholders" (`weeks/week01.ts:124`) | 15 (`aerolinkCase.ts:167-183`; `session1.ts:1423` computes it) |
| STK-004 stage of main involvement | "Operation" (`weeks/week01.ts:144`) | "Concept" (`aerolinkCase.ts:171`) |
| What ENT identifies | "ENT-001 for the system of interest" (`weeks/week01.ts:26`); "ENT (system of interest)" (`learn/week01.ts:50`) | ENT = enterprise, SOI-001 separate (`session1.ts:1236`, `aerolinkCase.ts:56-77`) |
| AeroLink SoI | "SoI = the AeroLink service enterprise" (`week1.ts:117`) | "the AeroLink air-taxi service" (corrected in `weeks/week01.ts` `workedSoi`) |
| Charter minimum | "decision rules and norms of at least five words each" (`learn/week01.ts:671`) | Not empty and not an empty answer (`team.ts:46`, `EMPTY_ANSWER`) |
| Register contents | interest + influence (+ support) (`session1.ts:1413`, `session2.ts:893`) | Lab tool stores influence only (`team.ts` `StakeholderRow`) |
| Life-cycle stage list | "Production, integration, verification and validation"; Logistics before Operation (`stakeholders.ts:32`) | "Production, integration, V&V"; Operation before Logistics (`aerolinkCase.ts:129`) |
| AeroLink facts source | `DATA_SHEET` in `src/model/airtaxi.ts` (read by `MEET_AEROLINK`) | `CASE_FACTS` in `aerolinkCase.ts:79-87` |
