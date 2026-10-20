# Week 1 Critical Review: Team Formation / Needs / Identifying Stakeholders

**Purpose.** This review checks whether the existing Week 1 material can be the source for the lecture-first, professor-led week that DECISION_LOG A20 and COURSE_PRODUCTION_PLAN.md require. That week has a PowerPoint lecture for 2 × 75 min, faculty notes, a long-form lesson, an AeroLink case, a team laboratory, a separate assessment and a verified reference register.
**Reviewer stance.** A graduate systems-engineering course taught at doctoral depth.
**Date.** 2026-10-18. The files were read as they stood at 23:45 EDT, while a fix agent was still editing them. Everything here is read-only: no source was changed and nothing was committed.
**Companion document.** `WEEK1_LECTURE_OUTLINE.md` (same folder).

## 0. Scope and method

Files reviewed (current working tree, uncommitted edits included):

| File | What it holds |
|---|---|
| `src/content/learn/week01.ts` (783 lines) | Seven Learn sections L1–L7. Also the opener, summary, bridge, workload, Team Record, graduate review and model-inputs map |
| `src/content/weeks/week01.ts` (413 lines) | Lesson blocks, activities, Lab L1, assignment W1-A, instructor notes (session plan, misconceptions, answer key), workload, references |
| `src/content/week1.ts` (184 lines) | Driving question, outcomes, the reviewed blocks kept from the old Week 1 (`w1-se`, `w1-soi`, `w1-worked`), unused systems-thinking blocks, `PRINCIPLES`, the boundary exercise |
| `src/content/missions/week01.ts` | Six Practice missions: four AeroLink rehearsals, the team's own record, and a recall quiz |
| `src/content/quizWeek1.ts` | Readiness quiz Q1, ten items |
| `src/model/airtaxi.ts`, `src/model/reference/week01–03.ts` | AeroLink case data: Data Sheet; STK-001..014; CON-001..016; REL-001..008; EXT-001..006; MGO-001..009; NEED-001..011; CAP-001..010 |
| `src/workbench/week1/stakeholders.ts`, `team.ts` | Classification key; Team Record checks and export |

Sources the material was compared against:
- `SOURCE_INVENTORY.md`.
- The verified register `_source_cache/verification/readings.py` (R01–R90).
- The extracted text of SEBoK v2.14 (S11), the DoD SE Guidebook 2021 (S12), the MITRE SEG 2014 (S13), the SysML v2 decks (S09, S10) and the course documents S01–S04.

Every page cited below was opened in the extracted text. SEBoK pages are PDF page indices (DECISION_LOG W1).

## 1. Verdict

The existing Week 1 is **a careful, well-sourced self-study module. It is not a lecture.** Its definitions, citations, AeroLink reference data and need-writing example can be reused with confidence. But it is **too shallow and too fragmented** to support two 75-minute professor-led sessions at graduate depth:

1. **Shallow.** About 57 minutes of reading in total, delivered as seven micro-lessons of 7–9 minutes each. The core ideas get one paragraph each: the needs-to-requirements transformation, needs quality, elicitation, conflict and prioritization. Several topics a graduate lecture needs are missing: the life cycle and the 15288 process frame, Business or Mission Analysis, enabling systems, the structure of a system context, and the theory of teams.
2. **Fragmented.** The prose sits in three files and is assembled at run time from sentence ranges (`{ ref: { block, para, sentences: [2, 2] } }`). No continuous narrative exists that an instructor could teach from, or that a .pptx and faculty notes could be generated from.
3. **Not lecture-first.** The session plan teaches definitions for 15 minutes. It then runs a 25-minute "needs clinic" in Session 1, before needs have been taught (they are L6–L7). Session 2 is entirely lab. This contradicts A20 ("teach first, explain in depth, demonstrate, then assign").
4. **Some course conventions are labeled "course" where sources exist.** Teams, boundary, context and environment all have sourced material in the collection (§4.2). Conversely, several things the week needs have **no source in the collection** and must be labeled honestly (§6).

Recommendation: keep the data and the verified sentences. Rebuild the week as a single narrative source: slides, notes and lesson come from one file, as COURSE_PRODUCTION_PLAN.md §"Single-source pipeline" requires. Follow the outline in `WEEK1_LECTURE_OUTLINE.md`.

## 2. What is good and reusable (keep, with page checks done)

| # | Asset | Where | Why it is reusable | Reuse in the new lecture |
|---|---|---|---|---|
| G1 | **Carefully attributed definitions** | L2 and L4 key terms; `w1-system`, `w1-stakeholders` | System (R38 p.1637), with the SEBoK note that definition (2) is an expanded version of the 15288:2015 wording. System-of-interest (R39b p.1652). Stakeholder, all four definitions (R39a p.1631). Stakeholder needs from 15288:2023 §6.4.2 (R39a p.1632). Enterprise (R07 p.815). I checked all five against the page text and all are accurate | Session 1 slides 7, 9, 10 and 21; Session 2 slide 4 |
| G2 | **The point that an enterprise is not an organization** | `w1-system` para 3; check c2 | R07 p.815 supports it exactly ("a frequent misuse of the term enterprise") | Session 1 slide 10 |
| G3 | **Three-source stakeholder identification** (context, life-cycle stages, "who is affected or could stop us?") and the 14-stakeholder AeroLink result | `w1-worked-stakeholders`; figure `stakeholder-sources` | A sound teaching device. Each source finds stakeholders the others miss. The life-cycle source is grounded in R11 p.552 (Table 1). The other two are instructor method (correctly labeled "mixed") | Session 1 slides 23–24 and 26 |
| G4 | **Emphasis on approving authorities** | `w1-stakeholders` para 4; misconceptions | R11 p.553 is used accurately. This is the most important non-obvious point in the source and the existing week carries it well | Session 1 slide 25 |
| G5 | **The rule that the weather is context but not a stakeholder** | c4, misconception 2 | The source supports it: a stakeholder is an individual or organization (R39a p.1631). It is good teaching for a common error | Session 1 slide 24 |
| G6 | **Need-statement form and the bad-draft-to-rewrite method** | `w1-worked-needs`; figure `need-anatomy` | Built on R11 p.555 (no "shall", "The stakeholders need the system to…") and R53 p.296 ("Beware solutions masquerading as needs"). The four rewrites (NEED-001, -002, -003, -010) match the reference data exactly | Session 2 slides 9 and 14 |
| G7 | **Honest caution that SEBoK's own example needs are feature-level** | `w1-writing-needs` para 4 | R11 p.555, Table 2 (N1 two temperature settings, N3 four colors). This is a graduate-level observation worth developing (§3.6) | Session 2 slide 9 |
| G8 | **Misconception list with citations** | `instructorNotes.misconceptions` | Four misconceptions, each correctly cited (R11 pp.549, 551, 552, 555; R39a p.1631) | Session 2 slide 13 |
| G9 | **AeroLink reference data, consistent across files** | `airtaxi.ts`; `reference/week01–03.ts` | STK-001..014 have interest and influence ratings with rationale. CON-001..016 give one or more concerns per stakeholder. REL-001..008 include one "conflicts-with". The 11 NEED entries each carry a condition and a rationale. The Data Sheet numbers are read, never retyped. Everything is labeled FICTIONAL | The whole AeroLink worked example |
| G10 | **Boundary exercise: three candidate systems of interest for one question** | `w1-worked`; `BOUNDARY_ITEMS` | A classic, well-built demonstration that the right boundary depends on the question (R02 p.264; R50 pp.46–47) | Session 1 slides 11 and 14 |
| G11 | **Model-inputs map to SysML v2** | `MODEL_INPUTS` | It shows that the Week 1 IDs seed `part def`, `concern` (R77 p.115), `requirement` and `frame` (R77 p.116). Correctly labeled as Phase II readings | Session 2 slide 17, the Week 8 bridge |
| G12 | **Figure text equivalents** | every `figures[]` entry | Ready-made alt text and text equivalents for the slide figures (accessibility) | All figures |
| G13 | **Honest workload accounting** | `WORKLOAD`, `TRIM` | It states 8.9 h against an 8 h budget instead of hiding the overrun | Laboratory workload (outline §4) |
| G14 | **Team Record structure and stable-ID scheme** | `TEAM_RECORD`, template | ENT, PRT, EXT, STK, CON and NEED, each with an owner. This continuity is what makes Weeks 8–9 possible | Lab outputs |

## 3. What is too shallow for a graduate lecture

### 3.1 Volume and depth of instruction
- The Learn stage is budgeted at seven sections × 7–9 minutes, plus the overview and summary: about 66 minutes of self-paced reading (`WORKLOAD.learnMinutes`). The word caps are 560–920 per section.
- Each core concept gets one or two paragraphs and one multiple-choice check. That is the right size for a refresher card. It is too small for the conceptual core of a graduate SE course, the part on which Weeks 2, 8 and 9 depend.
- The `bloom` levels are Understand or Apply throughout. No objective asks students to **analyze** a boundary choice or **evaluate** a set of needs, except the graduate review.

### 3.2 System concepts stop at three definitions
Missing items, all of which the collection supports:
- **Enabling systems.** Glossary p.1493: a system that complements the system of interest during its life-cycle stages but does not necessarily contribute directly to its function in operation. Examples include test, training and maintenance systems, and even project teams. R39b p.1652 adds that a system of interest "may include both operational or enabling systems". The existing week never says this. Yet the AeroLink chargers, the maintenance facility and the operations center are exactly where the enabling-versus-operational distinction matters.
- **Engineered system and engineered system context** (R01 p.51). The structure of a context: narrower and wider system of interest, immediate environment, wider environment (SEBoK *Engineered System Context*, pp.326–327). Also the four kinds of engineered-system context: product, service, enterprise, SoS (p.326). The existing L3 reduces context to "the systems it works with directly and those that influence it" (R02 p.264). That is accurate but one level shallower than the source.
- **Environment.** Two definitions: system-science and engineered-system (glossary p.1501).
- **System boundary.** "A distinction made by an observer…" (Checkland, glossary p.1639). The existing key term "Boundary" is labeled `source: 'course'` although a sourced definition exists.
- **System context.** Glossary p.1641 (Flood and Carson): both the relationships view and the context-diagram view. The existing week labels it R02 only.
- **Extended enterprise** (R07 p.816). Directly useful for AeroLink's vertiport operators, utility and manufacturer.
- **The SEBoK-preferred enterprise definition.** Glossary p.1497 prefers definition (1), "one or more organizations sharing a definite mission, goals, and objectives…". The existing week teaches only the Rebovich and White definition on R07 p.815. Both are legitimate. A graduate lecture should show both and explain why SEBoK prefers the purpose-centered one.

### 3.3 Systems thinking foundations were removed, not adapted
The rebuild retired `w1-paradox`, `w1-analysis-synthesis`, `w1-feedback` and `PRINCIPLES` from the week (comment in `week1.ts` lines 10–14).

The faculty brief, however, asks for the systems-thinking foundations that stakeholder work needs. Several are already verified and sit unused in `week1.ts`:
- The Boundary principle (R04 p.274).
- The View principle: multiple views, "each based on a system aspect or concern" (R04 p.275). This is the theoretical bridge to *concerns*.
- Holism versus separation of concerns (R04 p.275).
- MITRE's control / influence / influenced-by question set (R50 p.48).

They should come back into the lecture as foundations of stakeholder analysis, rather than as a separate systems-thinking unit.

### 3.4 No life-cycle or process frame
The week never says where stakeholder work sits in the life cycle or in ISO/IEC/IEEE 15288. A graduate student should leave Week 1 able to name all of the following:
- **Life-cycle stages** and the primary goal of the concept stage, "Identify stakeholders' needs" (R06b p.384).
- **The 15288:2015 technical processes**, with Business or Mission Analysis and Stakeholder Needs and Requirements Definition first. SEBoK lists all fourteen in *Diversity, Equity, and Inclusion*, Table 1, pp.1001–1002.
- **The SEBoK Concept Definition knowledge area**, which pairs those two processes and runs them iteratively (pp.540–541; R10 p.543; R11 p.549).
- **The naming differences across sources**:
  - SEBoK article: "Stakeholder Needs Definition" (p.549). SEBoK notes the process is "frequently referred to as" Stakeholder Needs and Requirements (p.551).
  - 15288:2015 as listed by SEBoK: "Stakeholder Needs and Requirements Definition" (p.1001).
  - DoD Guidebook: "Stakeholder Requirements Definition", one of eight technical processes (S12 pp.50, 141).

### 3.5 Business or Mission Analysis is missing
SEBoK makes BMA the input to Stakeholder Needs Definition:
- The problem, threat or opportunity statement, the mission, goals and objectives (MGOs), the measures, the major stakeholders and the preliminary life-cycle concepts all flow into it (R11 pp.550, 552).
- BMA performs the *initial* stakeholder identification and ranking (R10 p.545).

The AeroLink reference already has a mission statement and goals (MGO-001..004, MGO-009, in `reference/week03.ts`). Under the old 15-week plan they sat in Week 3. Under the new schedule Week 3 is Technology / Risk / Trade, so **the MGOs currently have no home**.

Week 1 should introduce the problem or opportunity statement and the mission and goals as BMA outputs, because needs without a mission have no anchor. Objectives with measures can wait for Week 2. RB-2.1 already exists for this.

### 3.6 Needs versus requirements: correct but one-dimensional
L6 teaches only the difference in **perspective**: stakeholder versus developer (R11 p.549). The sources support a much richer treatment:
- **Black box versus white box.** Needs are the external, black-box view; requirements are the internal, white-box view. SEBoK pairs a coffee-maker need with the requirement transformed from it (R13 p.558).
- **The transformation is engineering analysis, not rewording.** It is "more than changing the subject of the need statement". It uses functional, interface, data-flow and performance analysis (R13 p.558). One need can yield several requirements (R13 p.559).
- **Every requirement is an engineering decision** (R13 p.557). A requirement statement is a "formal transformation of one or more needs … into an agreed-to obligation" (R13 p.558, quoting INCOSE NRM).
- **The integrated set of needs** combines stakeholder needs with drivers, constraints, risks and life-cycle concepts (R11 pp.549–551, 554). It must be correct, consistent, complete and feasible (R11 p.551). It defines the project scope and is the validation reference (R11 pp.551, 555).
- **Stakeholder requirements versus stakeholder needs** (R39a p.1632 (1b)–(1c); R11 p.551, nomenclature discussion). The glossary also notes that 15288 has no formal definition of "stakeholder requirement".
- **Requirement verification versus requirement validation** (R13 p.566). This is the distinction that explains *why* the need must survive as the reference.

The existing week mentions the integrated set in one sentence and the transformation in one sentence. The rest is absent.

### 3.7 The "six criteria" are a course construct presented as if complete
The six criteria in `w1-writing-needs` para 4:
1. Need wording.
2. No design.
3. Attributed to a stakeholder.
4. Traced to the register.
5. Condition stated.
6. Rationale recorded.

Problems:
- **They mix two kinds of rule.** Rules about the *statement* (1, 2, 3, 5) sit beside rules about the *record* (4, 6).
- **Sourced characteristics are left out.** MITRE lists six attributes a needs statement should have (R53 pp.295–296): enterprise and operational context; complete, end-to-end need; conditions or scenario; attributes and metrics; growth and extensibility; independence of solution approach. The course keeps only two of them (conditions, solution-independence). "State needs unambiguously" with metrics tied to mission goals (R53 pp.296–297) is not taught at all.
- **The set-level characteristics are missing.** Correct, consistent, complete, feasible (R11 p.551) never appear as criteria.
- **The rubric and the lesson disagree about measures.** "Attributes/metrics" (R53 p.296) and "expected performance and quality ('how well')" (R11 p.554) are sourced. But check c7 tells students that numbers are not required in a need. This should become: a need states *how well* in the stakeholder's terms; the numeric value is engineered in Week 2.

The INCOSE characteristics (GtWR / NRM) that SEBoK cites (R11 p.555; R13 p.566) are **not in the collection** (§6). The lecture therefore cannot teach the INCOSE C1–C15 list from a verified page.

### 3.8 Elicitation: a list, not a method
L6 gives the SEBoK technique list in one sentence (R11 p.553). It omits material the collection supports:
- The **elicitation topic set**: feedback on BMA outputs, life-cycle role, nominal and off-nominal use cases and misuse and loss scenarios, capabilities, external interactions, "-ilities", risks and hazards, rationale, criticality and priority (R11 p.553).
- **MITRE's practice**: direct observation; one-on-one and group interviews; brainstorming; focus groups; surveys; prototyping. MITRE calls joint user-developer sessions "frequently one of the most powerful techniques" and says choosing techniques depends on size, complexity, schedule and locations (MITRE *Eliciting, Collecting, and Developing Requirements*, p.324). It adds Likert-scaled interview protocols and follow-up questions (R63 pp.235–236).
- **Root cause, "real vs. perceived needs"**, and an implementation-independent problem statement (MITRE p.322).
- **The "user surrogate" when end users are inaccessible** (R53 p.296).

### 3.9 Conflict and prioritization: recorded, never resolved
The week correctly says a conflict is recorded rather than deleted (R11 p.551). It also correctly says the conflict is resolved later. But it gives no method and no prioritization scheme. The collection has:
- **Business versus user perspectives**, which yield conflicting MGOs that must be prioritized against the enterprise strategy (R10 p.546).
- **Asking stakeholders for priority and criticality**: "nice-to-haves" and what they can "live without" (R11 p.553).
- **Defining priority categories** (mandatory, critical, desirable, optional) and setting up a **stakeholder contention adjudication protocol early** (MITRE p.325). When conflicts cannot be resolved, escalate to the customer or sponsor (MITRE p.325).
- **Negotiating modifications with stakeholders** (DoD S12 p.142).

None of this appears.

### 3.10 Stakeholder classification is thin and internally inconsistent
- **Three different taxonomies coexist:**
  - The lesson's six role groups (`w1-register` para 2).
  - The eight `StakeholderCategory` values in `airtaxi.ts` (customers, regulators, investors, community, infrastructure, safety, workforce, suppliers).
  - The "S04 classes" that rubric RB-1.2 refers to.

  Students will meet all three. The lesson admits the six groups are "a course grouping … not a standard taxonomy". That is honest, but the code should use one scheme.
- **The reference data has interest ratings, but the lesson never teaches an interest dimension.** It teaches only influence 1–5. RB-1.3 asks for "an influence/interest rating with rationale".
- **MITRE's two-dimensional map**, influence over change versus level of support (R63 pp.236–237, Figures 1–2), is mentioned in one sentence and never drawn.
- **Stakeholder relationships** (REL-001..008 exist) are not part of Week 1, although S03 Deliverable 1 asks for "stakeholder relationships" and S04 Lab 2B asks for "stakeholder relationships, objectives, concerns". RB-1.4 (relationships and dynamics) is not applied.

### 3.11 Teams: entirely "course convention" though sources exist
L1 cites nothing ("this section cites no reading"). The collection has:
- **Definition of a team and of an SE team** (glossary p.1662).
- **IPTs**: a multidisciplinary group collectively responsible for a defined product or process (DoD S12 p.52). SEBoK covers the IPT, the SEIT and AIT teams (*Team Capability* pp.987–988) and IPTs in product SE (p.761).
- **"The team should have a charter"** (*Team Capability* p.986).
- **Organizing an SE team by job specialization** (requirements, architecture, integration, V&V) or by subsystem (p.986). This directly underwrites the course's four lead roles.
- **Communication paths N(N−1)/2**, with a team of more than 10 to be organized hierarchically (p.988).
- **Tuckman's forming–storming–norming–performing**, later adding adjourning (pp.989, 995).
- **Indicators of cohesive and dysfunctional teams** (p.990), and the nature of groups (structure, roles, norms, cohesion; *Team Dynamics* p.995).
- **"Consult stakeholders to ask 'What are we missing?'"** as the final team-staffing step (p.989).

Decision rules and ID ownership remain course conventions; no page in the collection prescribes them. The charter itself, the roles and the developmental stages are sourced.

## 4. What is fragmented

### 4.1 Structural fragmentation
- **One week's prose is spread across three files and assembled at run time:**
  - `week1.ts` holds the old reviewed blocks and the driving question.
  - `weeks/week01.ts` holds the new blocks, the lab, the assignment and the session notes.
  - `learn/week01.ts` holds sections that quote *sentence ranges* of those blocks, plus new paragraphs.
- **Several blocks are cut mid-paragraph.** `w1-system` para 0 is used as sentences [2,2] and [4,5]. `w1-se` is used as sentence [0,0]. Neither a .pptx generator nor a human instructor can produce a coherent talk from this. COURSE_PRODUCTION_PLAN requires one content source for slides, notes and lesson.
- **The same idea is stated in up to four places**, with drifting wording:
  - Stakeholder definitions: `w1-stakeholders` para 0, L4 body, L4 key terms, quiz.
  - The six criteria: `w1-writing-needs` para 3, L7 apply text, `TEAM_RECORD`, the checker.
  - The team roles: `w1-team`, `w1-lab`, `lab.steps`, `TEAM_RECORD`, the template.
- **Dead and live material share files.** `week1.ts` keeps `w1-paradox`, `w1-analysis-synthesis`, `w1-feedback` and `w1-application` (old version). Their comment says they "are no longer part of Week 1". `w1-application` exists in two versions with the same ID: the old one in `week1.ts` and a new one in `weeks/week01.ts`.

### 4.2 Pedagogical fragmentation
- **The order of the session plan contradicts the order of teaching.** The Session 1 "needs clinic" (25 min) precedes any instruction on needs. Needs are L6–L7, assigned as self-study, and Session 2 contains no instruction at all.
- **The AeroLink case is split across weeks that no longer exist in that order:**
  - The reference needs (`reference/week03.ts`) are the old Week 3's.
  - The concerns (`reference/week02.ts`) are the old Week 2's.
  - The MGOs live in old Week 3.

  Week 1 shows 4 of the 11 needs and 6 of the 14 register rows. A lecture needs the full worked set on one slide sequence.
- **Assessment items double as instruction.** The Learn checks, the readiness quiz and the Practice missions all test the same seven points, and the quiz is formative. A20 asks for assessment *separate* from the lecture.

### 4.3 Terminology drift (precision matters most in Week 1)
- **The system of interest and the enterprise share one identifier.** `model/reference/week01.ts` names ENT-001 "AeroLink Urban Mobility **service enterprise**". L2 renamed the system of interest "the AeroLink air-taxi service" to keep it distinct from the enterprise. The ID is also overloaded: in the Team Record, ENT-001 is both "Enterprise proposal" and "Enterprise and system of interest" (`MODEL_INPUTS` row `soi`). The lecture needs two identities: the enterprise, and the system of interest inside it.
- **British spelling in shown data**: "operations centre" (`reference/week01.ts`), "utilisation", "neighbour" (`reference/week02–03.ts`). This violates the American English rule (COURSE_SCHEDULE rule 8).
- **Two life-cycle stage vocabularies.** SEBoK Table 1 (R11 p.552) uses concept; development; production, integration, V&V; logistics and maintenance; operation; disposal. The Life Cycle Stages article uses concept, development, production, utilization, support, retirement (R06b p.384). The existing week uses the first without noting the second. Both should be shown, with a mapping.

## 5. Defects in the AeroLink reference that a lecture would expose

These are content findings for the instructor's worked example. I changed none of them.

| # | Finding | Evidence | Consequence | Suggested handling |
|---|---|---|---|---|
| A1 | **Four stakeholders have no need.** STK-008 (pilots/remote operators), STK-011 (OEM), STK-012 (insurers) and STK-013 (city planning authority). STK-013 is an **approving authority** for vertiport sites (`stakeholders.ts` k13) | `reference/week03.ts` NEED-001..011 sources | The lesson's own rule (cover approving authorities; R11 p.553) and the advanced block ("every stakeholder should have at least one need traced to it", `w1-advanced`) are violated by the instructor's reference | The lecture uses the gap as a deliberate coverage-audit finding (outline, Session 2 slide 16). Add reference needs only by faculty decision: adding needs changes the later-week counts that DECISION_LOG W9 protects |
| A2 | **NEED-008 has a subject that is not in the register.** "Passengers who use wheelchairs need…" is traced to STK-014 (accessibility advocates). The subject is a subset of STK-001, not STK-014 | `reference/week03.ts` line 65 | The Team Record checker requires the subject to be a register stakeholder (`TEAM_RECORD` part 5). The reference breaks the rule students are graded on | Teach it as "advocates speaking for a sub-class of STK-001" and list both STK-001 and STK-014 as sources. Or add a register row for passengers with reduced mobility (faculty decision) |
| A3 | **NEED-002 answers CON-002, a passenger concern** (it derives from STK-001), but lists only STK-002 (FAA) as its source stakeholder | `reference/week02.ts` CON-002 → STK-001; `week03.ts` NEED-002 parents | A trace audit finds a concern answered by a need not attributed to its stakeholder | Either list STK-001 as a secondary source or drop CON-002 from NEED-002 |
| A4 | **ENT-001 is named "service enterprise"** and its text says it is bounded "for the question of passenger waiting time" | `reference/week01.ts` | ENT-001 conflates the system of interest with the enterprise (§4.3) | Split into ENT-001 (enterprise) and SOI-001 (the air-taxi service). This needs a faculty decision because it touches the ID scheme |
| A5 | **Concern CON-016 (city planning authority) answers to no need** (follows from A1) | `reference/week02–03.ts` | Childless concern | As A1 |
| A6 | **The reference needs carry no priority attribute.** The Team Record requires a priority for every need, and SEBoK asks for priority during elicitation (R11 p.553) | `reference/week03.ts` tuple `[id, name, text, parents, conditions, rationale]` | The instructor's example cannot show what students must supply | The outline proposes priorities in MITRE's categories (MITRE p.325), marked *instructor to confirm* |
| A7 | **The classification key covers only 6 of the 14 stakeholders** (`CLASSIFY` in `stakeholders.ts`) | `workbench/week1/stakeholders.ts` lines 60–65 | The full 14-row register needed for the lecture has no instructor key for 8 rows | The outline proposes the eight missing classifications, marked *instructor to confirm* |

## 6. Source gaps (honest statement)

The collection (`SOURCE_INVENTORY.md` §3) does **not** contain the following. The lecture must not cite them as if verified.

| Gap | What the faculty brief or a graduate lecture would want from it | What the collection offers instead | Handling |
|---|---|---|---|
| **INCOSE Systems Engineering Handbook v5 (2023)** | Stakeholder Needs and Requirements Definition process; stakeholder identification; the "onion" view | SEBoK articles written by the same authors, which cite it (R11 p.556 primary references) | Cite SEBoK. Mark the handbook "not in collection; recommended register addition if faculty obtain it" |
| **INCOSE Needs and Requirements Manual (NRM 2022), Guide to Needs and Requirements (GtNR 2022), Guide to Writing Requirements (GtWR v4, 2023)** | The authoritative characteristics of well-formed needs and requirements (C1–C15 plus set characteristics); the needs-to-requirements transformation method | SEBoK cites them (R11 pp.553, 555; R13 pp.558, 566), with the definition of a requirement statement quoted from NRM (R13 p.558); MITRE needs attributes (R53 pp.295–296); DoD good-requirement attributes (S12 p.144); SEBoK requirement-verification characteristics (R23a p.635) | Teach MITRE's six attributes and the SEBoK set characteristics as the sourced basis. State explicitly that INCOSE's C-list is not in the collection. **Highest-value acquisition** |
| **ISO/IEC/IEEE 15288:2023 itself** | Exact process names and outcomes | SEBoK quotations: §6.4.2 (R39a p.1632); 15288:2015 process list (pp.1001–1002); glossary definitions | Cite "15288 via SEBoK" with the SEBoK page. Flag the naming inconsistency: SEBoK p.1632 discusses the "Stakeholder Requirements Definition Process" while p.1001 lists 15288:2015 "Stakeholder Needs and Requirements Definition". It cannot be resolved without the standard |
| **ISO/IEC/IEEE 29148:2018; ISO/IEC/IEEE 42010** | Formal definitions of stakeholder requirement and of *concern* | 29148 only via the glossary (R39a p.1632 (1b)). No SEBoK definition of concern. SysML v2's definition (R77 p.115, a Phase II reading) | Label the Week 1 meaning of concern a course convention, consistent with R77 p.115 and with "concerns relative to a system" (R39a p.1631 (3)) |
| **NASA SE Handbook (SP-2016-6105 Rev 2)** | Stakeholder Expectations Definition; NASA ConOps; aerospace exemplars | Cited only in SEBoK reference lists (e.g., p.542) | Do not cite. Aerospace exemplars come from DoD (S12) and MITRE (S13) |
| **Mitchell, Agle and Wood (1997), stakeholder salience** | Power, legitimacy and urgency classification | The title only, in a MITRE reference list (S13 p.238). No content | **Do not teach salience as sourced.** Mention at most as further reading, flagged unverified. Register addition needed if faculty want it |
| **The onion model of stakeholders (Alexander)** | Concentric stakeholder rings | Nothing. MITRE p.201's "onion model" concerns security countermeasures, an unrelated topic | **Omit** (faculty brief: "only if sourced") |
| **Power/interest (influence/interest) grid** (Mendelow; Eden and Ackermann) | The classic 2×2 grid | MITRE's influence-versus-support map (R63 pp.236–237). Influence and interest ratings in the reference data (course convention) | Teach MITRE's map as sourced. Present the influence × interest plot as a **course convention** |
| **Freeman (1984), stakeholder theory** | Origin of the management definition | The definition quoted in the glossary (R39a p.1631 (4)) | Cite via the glossary only |
| **Systems-thinking texts** (Checkland, Churchman, Senge, Meadows, Ulrich's critical systems heuristics) | Boundary critique; soft systems | Only via SEBoK: Checkland's boundary definition (glossary p.1639); Churchman (R02 p.264); soft versus hard problem framing (pp.330–331) | Cite via SEBoK pages. Boundary critique beyond R02 p.264 is a gap |
| **Team decision-making literature** (consensus, voting, RACI) | Decision rules in a charter | None prescribes decision rules; SEBoK gives norms as "rules that govern the actions of group members" (p.995) | Label decision rules and ID ownership course conventions |
| **Prioritization methods** (MoSCoW, Kano, AHP) | Structured prioritization | MITRE's priority categories and contention protocol (p.325); R11 p.553 | Teach MITRE's categories. Any MoSCoW use is a course convention |
| **FAA Advanced Air Mobility / vertiport guidance** | Realistic regulatory content for AeroLink | None (SOURCE_INVENTORY §3) | Keep the FAA as a *role* (approving authority) in a FICTIONAL case. Never state real regulatory facts |

## 7. Register status and needed additions

### 7.1 Register entries already used and verified for Week 1

| ID | Pages used in the outline |
|---|---|
| R01 | p.51 |
| R02 | p.264 |
| R04 | pp.274–275 |
| R06b | p.384 |
| R07 | pp.815–816 |
| R10 | pp.543–546 |
| R11 | pp.549–556 |
| R13 | pp.557–559, 566 (a Week 2 reading, used here for the bridge) |
| R23a | p.635 |
| R38 | p.1637 |
| R39a | pp.1631–1632 |
| R39b | p.1652 (also holds the *System Requirement* glossary entry) |
| R50 | p.48 |
| R52 | (Week 2 bridge) |
| R53 | pp.295–297 |
| R63 | pp.234–237 |
| R77 | p.115 (Phase II) |

**One register correction.** R48 is titled "Stakeholder Requirements Definition Process", PDF 141–147. That process occupies only pp.141–142. Pages 142–144 are *Requirements Analysis*, which includes the good-requirement attributes on p.144, and pp.144–147 are *Architecture Design* and *Implementation*. Split it into **R48a 141–142** and **R48b 142–144**, or narrow it, so that a citation to R48 does not imply that DoD discusses needs on those pages.

### 7.2 Register additions the new lecture needs
Pages were verified in the extracted text, and the title text appears on the first page.

| Proposed ID | Source | PDF pages | Title on first page | Level | Used for |
|---|---|---|---|---|---|
| P1 | S11 SEBoK | 130 | Systems Engineering Principles | X | Principles 1, 2, 7 (SE specific to stakeholder needs and context; holistic view incl. enabling systems; changing stakeholder needs) |
| P2 | S11 SEBoK | 326–327 | Engineered System Context | E | NSoI / WSoI / immediate and wider environment; four context types |
| P3 | S11 SEBoK | 330–331 | Identifying and Understanding Problems and Opportunities | X | Soft versus hard problem framing; problem identification |
| P4 | S11 SEBoK | 540–541 | System Concept Definition | E | BMA + SND as the Concept Definition pair; "why and what before how"; green-field / brown-field |
| P5 | S11 SEBoK | 761 | Product Systems Engineering Key Aspects | X | IPT definition (cross-functional, representatives of relevant stakeholders) |
| P6 | S11 SEBoK | 986–990 | Team Capability | E | Charter; organizing by specialization; IPT/SEIT; N(N−1)/2; Tuckman; cohesion |
| P7 | S11 SEBoK | 994–995 | Team Dynamics | X | SE team definition; structure, roles, norms, cohesion, stages |
| P8 | S11 SEBoK | 1001–1002 | Diversity, Equity, and Inclusion (Table 1) | E | The 14 ISO/IEC/IEEE 15288:2015 technical processes; "unwilling" stakeholders; unstated needs arising from inclusive design |
| P9a | S11 glossary | 1493 | Enabling System (glossary) | X | Enabling system |
| P9b | S11 glossary | 1497 | Enterprise (glossary) | X | SEBoK-preferred enterprise definition |
| P9c | S11 glossary | 1501 | Environment (glossary) | X | Two definitions of environment |
| P9d | S11 glossary | 1550 | Leverage (glossary) [*Life Cycle (glossary)* on the same page] | X | Life-cycle definitions |
| P9e | S11 glossary | 1579 | Operational Capability (glossary) [*Operational Concept* on the same page] | X | Week 2 bridge |
| P9f | S11 glossary | 1607 | Reparability (glossary) [*Requirement (glossary)* on the same page] | X | Requirement definition |
| P9g | S11 glossary | 1639 | System Assurance (glossary) [*System Boundary* on the same page] | X | Boundary (Checkland) |
| P9h | S11 glossary | 1641 | System Context (glossary) | X | Context, two senses |
| P9i | S11 glossary | 1662 | Team (glossary) | X | Team; SE team |
| P10 | S12 DoD | 51–52 | Stakeholders / Integrated Product Teams (section 2) | E | DoD stakeholder list; IPT definition |
| P11 | S13 MITRE | 318–326 | Eliciting, Collecting, and Developing Requirements | E | Stakeholder roles; root cause; capability scope; elicitation techniques; prioritization; contention adjudication |

**Note for `verify_readings.py`.** For P9d, P9e, P9f and P9g the entry of interest is the *second* entry on the page. The title-check token should therefore be the first entry's title shown in brackets, or the verifier must be extended to search the whole page.

## 8. Specific recommendations for the rebuild (in priority order)

1. **Write one narrative source** (`src/content/lectures/week01/`) from which slides, notes and the lesson are all generated. Retire sentence-range references in Week 1.
2. **Restructure the sessions.** Session 1 is all lecture. Session 2 is about 47 min of lecture and about 28 min of laboratory launch (justified in the outline). The needs clinic moves *after* needs are taught.
3. **Add the missing graduate content.** In priority order:
   1. Life cycle and 15288 placement.
   2. BMA as input.
   3. Enabling systems and context structure.
   4. The needs-to-requirements transformation and the integrated set.
   5. Sourced needs characteristics.
   6. Elicitation method.
   7. Conflict and prioritization.
   8. Team theory.
4. **Correct the labels.** Mark items "course convention" only where no source exists: decision rules, ID ownership, the six role groups, the influence × interest grid, priority scales.
5. **Unify the stakeholder taxonomy** to one scheme across lesson, data and rubric, and map RB-1.2's "S04 classes" to it.
6. **Add relationships to the lab** (S03 Deliverable 1, S04 Lab 2B, RB-1.4) with a minimum of three REL entries, one of them a conflict.
7. **Reposition the AeroLink MGOs** (mission and goals) in Week 1 as BMA context, so that needs have an anchor.
8. **Resolve the reference defects A1–A4** by faculty decision, or teach them explicitly as audit findings.
9. **Separate assessment from instruction.** Use a summative quiz item bank that is not reused in the Learn checks, plus one applied exercise on an unseen case (outline §5).
10. **Bring the workload within 8 h.** Make the four AeroLink Practice rehearsal missions optional (the lecture now does that demonstration), and fold the graduate needs review into the applied exercise (outline §4.7, a faculty decision).
11. **Acquire INCOSE NRM/GtNR/GtWR and the 15288:2023 standard**, or record that they are out of scope.
