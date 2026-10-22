// Week 1 — complete module: Team Formation / Needs / Identifying Stakeholders (COURSE_SCHEDULE.md, faculty direction of
// 2026-10-18; DECISION_LOG A16, A19). Rebuilt 2026-10-18 from the reviewed material the schedule's reuse map names:
// old Week 1 (w1-se, w1-soi and w1-worked are kept verbatim from ../week1.ts), old Week 2 (w2-stakeholders, the
// reference stakeholder register) and old Week 3 (w3-needs, w3-worked-needs, the need-statement criteria). Every block,
// the activities, the lab, the assignment, the instructor notes and the workload written or rewritten for the rebuild
// carry review: 'new-pending-review'; the week is NOT independently reviewed until that pass is done (review.status).
// AeroLink is the instructor's worked example; each team's lab and Team Record are about its own enterprise (A16).
// All AeroLink values are FICTIONAL. Citations use only the Week 1 register (course.ts readings and extension).
import type { LessonBlock, WeekContent } from '../schema'
import { WEEK1_BLOCKS, WEEK1_INTRO } from '../week1'
import { WEEK1_QUIZ } from '../quizWeek1'
import { need as caseNeed } from '../lectures/week01/aerolinkCase'
import { NEED_GATE_TEXT } from '../lectures/week01/labBrief'

const byId = Object.fromEntries(WEEK1_BLOCKS.map((b) => [b.id, b]))
const PENDING = 'new-pending-review' as const

// ------------------------------------------------------------------------------------------- team formation
const team: LessonBlock = {
  id: 'w1-team',
  kind: 'concept',
  title: 'Forming the team: roles, the charter and ID ownership',
  paragraphs: [
    'Each team works as a small engineering organization for the whole term, on one enterprise. The course assigns four lead roles: Requirements & Compliance, Architecture, AI & Data Management, and Verification & Validation. In a three-person team, AI & Data Management merges with Architecture. A lead role makes one member answerable for the completeness and consistency of that area of the work; it does not stop the others contributing to it.',
    'A team charter records how the team will work before the work starts: who leads each area; the decision rules the team will use when members disagree (for example a vote, consensus by a deadline, or the area lead deciding after hearing everyone); the communication norms (where the team talks, how quickly members reply, when it meets); and each member’s owned ID prefixes.',
    'Owned ID prefixes come from the course’s stable identifier scheme. Every engineering element gets an ID that is never reused, such as ENT-001 for the system of interest, EXT-001 for an external system or actor, STK-001 for a stakeholder, CON-001 for a concern and NEED-001 for a need, and every element names its owner. Owning a prefix makes one member accountable for the elements of that kind: they keep the IDs unique, keep each element consistent with the rest, and answer questions about those elements at reviews.',
  ],
  citations: [],
  provenance: 'instructor-authored',
  review: PENDING,
}

// ------------------------------------------------------------------------------------------- system, SoI, enterprise
const system: LessonBlock = {
  id: 'w1-system',
  kind: 'concept',
  title: 'System, system of interest and enterprise',
  paragraphs: [
    'Start with the definition systems engineers use. SEBoK’s glossary entry for system gives three definitions. The systems-science definition, “a set of elements in interaction” (von Bertalanffy), applies to all systems, natural, social or technical. The second, “combination of interacting elements organized to achieve one or more stated purposes”, is attributed to ISO/IEC/IEEE 15288:2015; SEBoK notes that this wording is an expanded version of the standard’s, calls it the recognized definition for systems engineers, and restricts it to engineered systems created for a purpose that gives value to one or more beneficiaries. Its elements may include hardware, software, people, information, facilities and services. The third, from the INCOSE Fellows (2019), stresses behavior or meaning that the parts alone do not have.',
    'Which system you study is a choice. SEBoK’s glossary gives two definitions of system-of-interest: “the system whose life cycle is under consideration” (ISO/IEC/IEEE 15288:2015), which it calls the common systems engineering definition and which strictly applies to an engineered system; and “the system of interest to an observer” (von Bertalanffy), the system-science definition, which applies whether or not the system has a purpose or a life cycle in the engineering sense. Either way, the system of interest is named by someone, for a purpose.',
    'An enterprise is wider still. SEBoK’s Enterprise Systems Engineering knowledge area defines it as a purposeful combination, for example a network, of interdependent resources (people, processes, organizations, supporting technologies and funding) that interact with each other and with their environment to achieve business and operational goals. SEBoK warns that an enterprise is not the same as an organization: it includes the organizations that take part, but also people, knowledge, processes, policies, facilities and other assets, and some enterprises have no readily identifiable organization in them at all.',
    'Applied to AeroLink: the system the instructor’s worked example studies first is the AeroLink air-taxi service (fleet, vertiports and chargers, operations center and passenger demand), chosen because it is large enough to answer questions about the service and small enough to analyze. The AeroLink enterprise in SEBoK’s sense is wider than AeroLink Urban Mobility, the company: it also takes in the independent vertiport operators, the electric utility’s grid connections, the manufacturers’ delivery commitments and the funding that together deliver the service.',
  ],
  citations: [{ reading: 'R38', pages: '1637' }, { reading: 'R39b', pages: '1652' }, { reading: 'R07', pages: '815' }],
  provenance: 'mixed',
  review: PENDING,
}

// ------------------------------------------------------------------------------------------- stakeholders (old Week 2)
const stakeholders: LessonBlock = {
  id: 'w1-stakeholders',
  kind: 'concept',
  title: 'Identifying stakeholders',
  paragraphs: [
    'SEBoK’s glossary records several definitions of stakeholder. The ISO/IEC/IEEE 15288:2015 definition is an individual or organization having a right, share, claim or interest in a system or in its possession of characteristics that meet their needs and expectations. An earlier ISO/IEC definition speaks of an individual, team or organization, or classes of them, with interests in, or concerns relative to, a system; and Freeman’s management definition is any group or individual who can affect or is affected by the achievement of an organization’s objectives. Applying these definitions gives two rules of thumb. A stakeholder is a person, a group or an organization, so the weather or the electric grid belongs to the context but is not a stakeholder, while the utility that runs the grid is one. And a stakeholder need not use, buy or build the system: an interest, or being affected, is enough.',
    'Why identify them first? In SEBoK’s Stakeholder Needs Definition article, stakeholders are the primary source of needs and requirements, so all relevant stakeholders must be identified and included from the beginning of the project; leaving one out often results in missing needs and requirements and a failure to pass system validation.',
    'Where to look. SEBoK’s list of possible stakeholders includes customers, sponsors, organization decision makers, regulatory organizations, developing organizations, integrators, testers, users, operators, maintainers, support organizations, the public at large, and those involved in disposal or retirement. Stakeholders can be internal or external to the organization. Because there can be many over the system’s life cycle, SEBoK recommends walking the life-cycle stages as a thorough source: concept; development; production, integration, verification and validation; logistics and maintenance; operation; and disposal, where its examples include operators, waste management, regulators and the public.',
    'Find the approving authorities. SEBoK stresses that a key part of identification is to determine who the approving authorities are: the stakeholders responsible for formally certifying, qualifying and approving the system for use in its operational environment by its intended users. It cannot be assumed that the customer is the only one, and there can be approving authorities both inside and outside the organization, especially for highly regulated systems.',
    'Search wide. MITRE asks systems engineers to identify both directly and indirectly impacted stakeholders. Its key groups include the decision makers, the sponsors and agents responsible for the change, the people directly affected, and the “customers” of the change agents. A sponsor’s list is only a starting point: the assessment team asks interviewees for further names and organizations, and deliberately seeks out supporters, skeptics and rivals of the initiative.',
  ],
  quote: { text: 'Stakeholders are the primary source of needs and requirements', cite: { reading: 'R11', pages: '552' } },
  citations: [{ reading: 'R39a', pages: '1631' }, { reading: 'R11', pages: '552–553' }, { reading: 'R63', pages: '234–235' }],
  provenance: 'mixed',
  review: PENDING,
}

const register: LessonBlock = {
  id: 'w1-register',
  kind: 'concept',
  title: 'Classifying stakeholders and recording their concerns',
  paragraphs: [
    'SEBoK recommends recording stakeholders in a stakeholder register that holds key information about each stakeholder and how they are involved with the system of interest, and re-evaluating the stakeholder community periodically, because stakeholders and their needs change.',
    'This course’s register classifies each stakeholder in four ways drawn from that article: the role they play (user or operator; customer, acquirer or funder; approving or regulatory authority; supplier or owner of an enabling or external system; maintainer or support; affected public); the life-cycle stage where they matter most; whether they are internal or external to the organization that runs the system; and whether they are an approving authority. The six role groups are a course grouping of SEBoK’s list, not a standard taxonomy.',
    'Each row also records the stakeholder’s concern: the ISO/IEC definition in SEBoK’s glossary speaks of interests in, or concerns relative to, a system. Write the concern so that someone else could check it: say what, for whom, and where or when it bites. “Communities: noise” names a general quality and could belong to anyone; “Residents within sight of the pad are woken by departures before 7 a.m.” can be checked, and it already points toward a need. The course rubric places generic concerns such as “wants safety” at its developing level (RB-1.3).',
    'MITRE adds what a register should capture about influence. Stakeholder management identifies the interests each group represents, the power it holds, and whether it supports or inhibits the change, and stakeholder maps show the relative influence and the support of each group. This course records influence on a 1–5 scale with a one-line reason, so that a reviewer can challenge the rating rather than guess at it. Where two stakeholders’ concerns pull in opposite directions, record the conflict: it becomes a trade-off later in the course, not a decision for whoever edits the register.',
  ],
  citations: [{ reading: 'R11', pages: '552–553' }, { reading: 'R39a', pages: '1631' }, { reading: 'R63', pages: '234–236' }],
  provenance: 'mixed',
  review: PENDING,
}

// ------------------------------------------------------------------------------------------- needs (old Week 3)
const needs: LessonBlock = {
  id: 'w1-needs',
  kind: 'concept',
  title: 'Stakeholder needs, and how they differ from requirements',
  paragraphs: [
    'SEBoK’s glossary gives the ISO/IEC/IEEE 15288:2023 statement of what stakeholder needs cover: the needs, wants, desires, expectations and perceived constraints of the identified stakeholders. Needs concentrate on the system’s purpose and behavior, and they are described in the context of the operational environment and conditions.',
    'Stakeholder needs express the perspective of users, acquirers, customers and other stakeholders on the system of interest. They are later transformed into system requirements, which communicate the developer’s perspective. The needs are also the basis of system validation: the requirements, the design and the realized system are validated against them.',
    'SEBoK deliberately avoids calling its set of needs “stakeholder requirements”, because guides that treat expectations, needs and requirements as the same thing cause confusion. In its usage, stakeholder requirements are requirements on the system established by a stakeholder, transformed from their needs, and they are one input among several. The result the process aims at is an integrated set of needs that is correct, consistent, complete and feasible, combining stakeholder needs with the analysis of risks, drivers, constraints and life-cycle concepts.',
    'Needs are found by elicitation: structured brainstorming, interviews and questionnaires, workshops and focus groups, visual material, documentation review, and feedback from verification and validation. Ask each stakeholder for the rationale and the priority of what they ask for; SEBoK notes that rationale often reveals the real need, especially when the stakeholder has expressed the need as an implementation. Record each need with a trace to the stakeholder register; in an MBSE effort, the needs can be included in the system model and traced to the stakeholders.',
  ],
  citations: [{ reading: 'R39a', pages: '1632' }, { reading: 'R11', pages: '549–553' }],
  provenance: 'source-paraphrase',
  review: PENDING,
}

const writing: LessonBlock = {
  id: 'w1-writing-needs',
  kind: 'concept',
  title: 'Writing well-formed need statements',
  paragraphs: [
    'SEBoK says needs are written in structured natural language from the perspective of what the stakeholders need the system of interest to do. To keep them distinct from requirements, need statements do not use “shall” or any other word that marks a requirement; SEBoK recommends a form such as “The stakeholders need the system to …”. Its example table gives each need an ID, a short name, the need statement, a rationale and a source.',
    'Across the set, the needs state expected functionality (what the stakeholders need the system to do), expected performance and quality (how well), the conditions of action, such as triggering events, system states and operating environments (under what operating conditions), and compliance with standards and regulations.',
    'MITRE’s operational needs assessment adds independence of solution approach: a need stated as a particular solution can eliminate more effective ways of meeting it, so needs should describe a successful operation or mission rather than a proposed solution, and should state the conditions or scenario under which the need exists.',
    `The course gate checks six things in every need: ${NEED_GATE_TEXT}. One caution: SEBoK’s own example needs include feature-level statements (two temperature settings, four colors). Whether a statement is solution-laden depends on the level of the system of interest and on genuine constraints, so a team that keeps a design term must justify it as a constraint.`,
  ],
  quote: { text: 'Beware solutions masquerading as needs.', cite: { reading: 'R53', pages: '296' } },
  citations: [{ reading: 'R11', pages: '554–555' }, { reading: 'R53', pages: '296' }],
  provenance: 'mixed',
  review: PENDING,
}

// ------------------------------------------------------------------------------------------- worked examples (AeroLink)
const workedStakeholders: LessonBlock = {
  id: 'w1-worked-stakeholders',
  kind: 'worked-example',
  title: 'Worked example: from AeroLink’s context to its stakeholders',
  paragraphs: ['The question: whose needs must AeroLink’s new vertiport meet? Apply three sources in turn; each step below is one source, and the last step counts the result.'],
  bullets: [
    'Start from the context. Each external system or actor that is an organization reappears as a stakeholder: EXT-001, the air navigation service provider, becomes STK-007; behind EXT-002, the electric utility grid, stands the electric utility, STK-010; EXT-004, the aircraft manufacturer, becomes STK-011; EXT-006, emergency services, becomes STK-006. EXT-003, the weather, is a natural system: it shapes operations but has no interest, so it is not a stakeholder. EXT-005, the public transport network, is run by an operator that the instructor’s reference list does not include, so a team would have to argue whether that operator belongs.',
    'Walk the life-cycle stages. Concept: the FAA, which approves the aircraft and the operation (STK-002), and the city planning authority, which grants or blocks vertiport sites (STK-013). Operation: passengers (STK-001) and AeroLink’s pilots and remote operators (STK-008), with the vertiport operators who own the pads and chargers AeroLink depends on (STK-005). Logistics and maintenance: maintenance technicians (STK-009). Then ask who pays and who carries the risk: investors (STK-003) and insurers (STK-012).',
    'Ask who is affected but not consulted, and who could stop the project. The communities near vertiports (STK-004) are affected by noise and siting and can block a site through planning; accessibility advocates (STK-014) speak for passengers who use wheelchairs.',
    'Result: fourteen stakeholders against the three in the opening question. Two of them, the FAA and the city planning authority, approve what AeroLink may do, and neither passengers, investors nor the manufacturer can stand in for them. The full instructor reference register (FICTIONAL values) is in the workbench.',
  ],
  citations: [{ reading: 'R11', pages: '552–553' }],
  provenance: 'mixed',
  review: PENDING,
}

const workedRegister: LessonBlock = {
  id: 'w1-worked-register',
  kind: 'worked-example',
  title: 'Worked example: six rows of AeroLink’s stakeholder register',
  paragraphs: [
    'The rows are taken from the instructor reference register; the ratings are FICTIONAL. Read each row across: who, what role, when they matter most, inside or outside AeroLink Urban Mobility, whether they can approve the system, what exactly they are concerned about, and how much influence they hold, with the reason.',
    'Notice the conflict the register exposes: the communities’ concern about noise and the vertiport operators’ concern about pad throughput pull in opposite directions, and the reference register records this as a “conflicts with” relationship. A register makes such conflicts visible early; resolving them is a later design and governance task.',
  ],
  table: {
    caption: 'Six rows of the AeroLink reference register (instructor reference; influence ratings are FICTIONAL)',
    header: ['ID', 'Stakeholder', 'Role', 'Life-cycle stage', 'Internal or external', 'Approving authority', 'Concern (reference register)', 'Influence and reason'],
    rows: [
      ['STK-002', 'FAA', 'Approving or regulatory authority', 'Concept', 'External', 'Yes', 'CON-004: aircraft and operations stay within approved safety limits at all times, including in adverse weather', '5: approval authority; without it no revenue operation is possible'],
      ['STK-004', 'Communities near vertiports', 'Affected public', 'Operation', 'External', 'No', 'CON-012: take-off and landing noise near homes, how often it occurs and at what hours', '4: local opposition can block vertiport siting through planning processes'],
      ['STK-005', 'Vertiport operators', 'Supplier or owner of an enabling system (pads, chargers)', 'Operation', 'External', 'No', 'CON-006: charging and turnaround, not demand, limit how many flights a pad can handle', '4: they own a scarce capacity constraint'],
      ['STK-008', 'AeroLink’s pilots and remote operators', 'User or operator', 'Operation', 'Internal', 'No', 'CON-009: workload, duty time and how far they can trust automated decision aids', '3: they operate every flight; workforce availability limits scaling'],
      ['STK-009', 'Maintenance technicians', 'Maintainer or support', 'Logistics and maintenance', 'Internal', 'No', 'CON-010: schedule pressure leads to aircraft being released without a clear condition picture', '2: turnaround time drives aircraft availability'],
      ['STK-010', 'Electric utility', 'Supplier or owner of an enabling system (grid power)', 'Operation', 'External', 'No', 'CON-011: simultaneous high-power charging exceeding the agreed connection capacity at a vertiport', '4: grid capacity can cap charging throughput'],
    ],
  },
  citations: [{ reading: 'R11', pages: '553' }, { reading: 'R63', pages: '236' }],
  provenance: 'mixed',
  review: PENDING,
}

const workedNeeds: LessonBlock = {
  id: 'w1-worked-needs',
  kind: 'worked-example',
  title: 'Worked example: from AeroLink stakeholder concerns to well-formed needs',
  paragraphs: [
    'Method (instructor-authored, built on R11 p.553–555 and R53 p.296): (1) start from the concern, not from a proposed feature; (2) ask why until the answer describes an outcome for the stakeholder rather than a mechanism; (3) remove any design term and any requirement wording; (4) attribute the need to a stakeholder, preferably in the form recommended in Session 2, “The [stakeholders] need the [system] to …”; (5) state the condition: when, where, under what operating conditions; (6) record the rationale and the trace to the stakeholder and concern it came from. Each step below takes a deliberately bad draft and rewrites it as a reference need.',
    'Two subtler points. NEED-002 is attributed to the FAA, an approving authority: the customer cannot be assumed to be the only one (R11 p.553). And NEED-001 and NEED-003 pull in opposite directions: more departures shorten waits, and more departures make more noise. Both needs stay in the set and the conflict is recorded; it is resolved later by a trade and by stakeholder agreement, not by deleting a need.',
  ],
  // sign-off review 2026-10-19 (M1, Mo5): each rewrite is the corrected case need (aerolinkCase.ts), in the taught form
  bullets: [
    `Draft: “AeroLink shall provide a mobile app that books a ride in three taps.” What is wrong: requirement wording (“shall”), a design (an app, taps), no stakeholder and no condition. Rewrite, NEED-001: ${caseNeed('NEED-001').statement.replace(/\.$/, '')}. Source: STK-001, CON-001.`,
    `Draft: “Communities need sound barriers around each vertiport.” What is wrong: one mitigation is named as the need, with no limit and no hours, and the need does not name the system of interest. Rewrite, NEED-003: ${caseNeed('NEED-003').statement.replace(/\.$/, '')}. Source: STK-004, CON-012.`,
    `Draft: “The FAA needs a weather radar on every aircraft during flight.” What is wrong: a sensor is named, while the regulator’s real need is assurance about limits. Rewrite, NEED-002: ${caseNeed('NEED-002').statement.replace(/\.$/, '')}. Source: STK-002, CON-004; contributing STK-001, CON-002.`,
    `Draft: “There is a need for a smart grid controller that must cap charging.” What is wrong: no stakeholder, “must”, and a device named. Rewrite, NEED-010: ${caseNeed('NEED-010').statement.replace(/\.$/, '')}. Source: STK-010, CON-011.`,
  ],
  citations: [{ reading: 'R11', pages: '553–555' }, { reading: 'R53', pages: '296' }],
  provenance: 'mixed',
  review: PENDING,
}

/** The reviewed w1-worked block (old Week 1), with two edits pending review (rebuild review F07, F12): the third
 *  bullet no longer points to the Week 1 explorer, which is gone, and names the system of interest “the AeroLink air-taxi
 *  service”, so that the enterprise is not called a system of interest. The other bullets are verbatim. */
const workedSoiBase = byId['w1-worked']
const workedSoi: LessonBlock = {
  ...workedSoiBase,
  bullets: (workedSoiBase.bullets ?? []).map((b, i) => (i === 2 ? 'SoI = the AeroLink air-taxi service (fleet, vertiports, charging, operations center, demand). Large enough to contain the feedback between demand, capacity and waiting; small enough to analyze.' : b)),
  review: PENDING,
}

// ------------------------------------------------------------------------------------------- advanced and application
const advanced: LessonBlock = {
  id: 'w1-advanced',
  kind: 'advanced',
  title: 'Advanced analysis: is the stakeholder set complete, and is the set of needs consistent?',
  paragraphs: [
    'No list proves its own completeness, but three independent sources make gaps visible. A stakeholder found by only one of them (the context, the life-cycle stages, or the question “who could stop us?”) is the one most likely to be missing from a first draft, which is why the worked example applies all three. MITRE’s advice to seek out skeptics and rivals, not only supporters, is a deliberate check against a list that contains only the people who already agree (R63 p.235). SEBoK adds that the register is never finished: the stakeholder community is re-evaluated periodically because stakeholders and their needs change (R11 p.553).',
    'Completeness of the needs depends on the register: every stakeholder should have at least one need traced to it, and every need should trace to a stakeholder in the register. Consistency is a different test. SEBoK’s integrated set of needs must be consistent (R11 p.551), but that does not mean deleting one side of a conflict. Two needs that pull against each other, such as passengers’ short waits and communities’ noise limits, both stay in the set, the conflict is recorded, and later weeks resolve it with a trade study and stakeholder agreement. A set with no tension in it usually means a stakeholder was left out.',
  ],
  citations: [{ reading: 'R63', pages: '235' }, { reading: 'R11', pages: '551–553' }],
  provenance: 'mixed',
  review: PENDING,
}

const application: LessonBlock = {
  id: 'w1-application',
  kind: 'application',
  title: 'Aerospace and industry application',
  paragraphs: [
    'In regulated industries such as aviation, the approving authorities sit outside the organization that builds or runs the system. SEBoK’s list of concept-stage stakeholders includes regulating authorities and approving authorities, and its article warns that highly regulated systems have approving authorities both inside and outside the organization (R11 p.552–553). A register that leaves them out produces needs that cannot pass validation, however well the customer’s needs are met.',
    'In a model-based effort the register and the needs become model elements: SEBoK notes that elicited needs can be included in the system model and traced to the stakeholders (R11 p.553). This course does exactly that in Phase II: Week 8 imports your team’s Week 1 stakeholders and concerns into a SysML v2 model, and Week 9 models your needs, which is why the Week 1 Team Record captures IDs, sources and traces from the start.',
  ],
  citations: [{ reading: 'R11', pages: '552–553' }],
  provenance: 'mixed',
  review: PENDING,
}

const deliverable: LessonBlock = {
  id: 'w1-deliverable',
  kind: 'deliverable',
  title: 'Deliverable: the Week 1 Team Record',
  paragraphs: [
    'One Team Record per team, about the team’s own enterprise: six parts, (1) team charter; (2) enterprise proposal, approved by the instructor or submitted for approval; (3) context; (4) stakeholder register; (5) initial stakeholder needs; (6) the AI usage statement. The Team enterprise view (the lab tool on the Laboratory page) checks each part and exports the record as Markdown, with the same content as a JSON file of model inputs for Phase II. The Laboratory page lists the evidence each part needs, the minimums, where to submit and the rubric rows.',
  ],
  citations: [],
  provenance: 'instructor-authored',
  review: PENDING,
}

const order = ['w1-outcomes', 'w1-intuition', 'w1-team', 'w1-se', 'w1-system', 'w1-soi', 'w1-worked', 'w1-stakeholders', 'w1-worked-stakeholders', 'w1-register', 'w1-worked-register', 'w1-needs', 'w1-writing-needs', 'w1-worked-needs', 'w1-advanced', 'w1-application', 'w1-lab', 'w1-deliverable']
const extra: Record<string, LessonBlock> = {
  'w1-worked': workedSoi,
  'w1-team': team,
  'w1-system': system,
  'w1-stakeholders': stakeholders,
  'w1-register': register,
  'w1-needs': needs,
  'w1-writing-needs': writing,
  'w1-worked-stakeholders': workedStakeholders,
  'w1-worked-register': workedRegister,
  'w1-worked-needs': workedNeeds,
  'w1-advanced': advanced,
  'w1-application': application,
  'w1-deliverable': deliverable,
}

const week01: WeekContent = {
  week: 1,
  drivingQuestion: WEEK1_INTRO.question,
  blocks: order.map((id) => extra[id] ?? byId[id]),
  activities: [
    {
      id: 'w1-act-boundary',
      title: 'Boundary classification exercise',
      component: 'boundary-exercise',
      purpose: 'Practice drawing a boundary that is fit for a stated question.',
      instructions: ['Classify each candidate element as inside the boundary, environment or irrelevant to the question.', 'Check your answers and read the explanation for any you got wrong.'],
      objectives: ['B1.2', 'B1.3'],
      inBlock: 'w1-worked',
    },
    {
      id: 'w1-act-stakeholders',
      title: 'AeroLink stakeholder identification and classification',
      component: 'w01-stakeholder-exercise',
      purpose: 'Decide who is a stakeholder of AeroLink’s new vertiport, classify six reference stakeholders, and write one register row with a specific concern.',
      instructions: [
        'Mark each of the fourteen candidates as a stakeholder or not, then check: the explanation for each appears only after you check.',
        'Classify the six stakeholders by role, internal or external, and approving authority, then check against the instructor key.',
        'Write one register row for a stakeholder not yet classified: a specific concern, an influence rating from 1 to 5, and the reason.',
      ],
      objectives: ['B1.4'],
      inBlock: 'w1-worked-register',
      review: PENDING,
    },
    {
      id: 'w1-act-needs',
      title: 'Need-statement check',
      component: 'w01-need-check',
      purpose: 'Diagnose draft needs, then write AeroLink need statements that pass the six minimum checks.',
      instructions: [
        'Tick the flaws in each draft “need” and check: the key is computed by the same criteria the checker applies.',
        'Write two AeroLink needs, each traced to a different reference stakeholder, until every criterion passes.',
      ],
      objectives: ['B1.5'],
      inBlock: 'w1-worked-needs',
      review: PENDING,
    },
  ],
  lab: {
    id: 'L1',
    title: 'Team charter, enterprise proposal, stakeholder register and initial needs',
    setting: 'team',
    durationMinutes: 75,
    objectives: ['B1.1', 'B1.3', 'B1.4', 'B1.5'],
    inputs: ['Your team’s enterprise idea (any domain; not AeroLink)', 'The Session 1–2 lecture, the detailed lesson and the AeroLink worked examples', 'The Team enterprise view (the lab tool on the Laboratory page: checks and export)'],
    steps: [
      { title: 'Team charter', detail: 'Assign the four course roles (Requirements & Compliance, Architecture, AI & Data Management, Verification & Validation; in a 3-person team AI & Data Management merges with Architecture), agree decision rules and communication norms, and record each member’s owned ID prefixes.' },
      { title: 'Enterprise proposal', detail: 'Name your enterprise and its domain, state its problem statement and its mission (MGO-001) in one sentence each and any goals (MGO-002, …), state the system of interest inside it in one sentence and list at least 3 elements inside its boundary (PRT-001, …), and argue in one paragraph why it suits a 14-week project. Take it to the instructor at the checkpoint and record the decision: approved, with its date, or submitted for approval until the instructor decides.' },
      { title: 'Context', detail: 'Record at least 6 external systems or actors (EXT-001, …), each with what crosses the boundary (people, materials, energy, information, approvals) and its direction.' },
      { title: 'Stakeholder register', detail: 'Record at least 8 stakeholders (STK-001, …) from the three sources (context, life-cycle stages, who is affected or could stop you). Classify each (role, life-cycle stage, internal or external, approving authority), write one or more specific concerns (CON-001, …), rate influence 1–5 with a reason, and record at least 3 relationships between stakeholders (REL-001, …: from, to, type, note), at least one of them a conflict between two stakeholders’ concerns.' },
      { title: 'Initial needs', detail: 'Write at least 8 need statements (NEED-001, …), preferably in the form “The [stakeholders] need the [system] to …”, each traced to the stakeholder or stakeholders it comes from, the concern it answers and the mission or goal it serves, with its priority (mandatory, critical, desirable or optional) and rationale, confirmed by the team against the six minimum checks, and covering at least 5 different stakeholders including an approving authority.' },
    ],
    artefacts: [
      { idPrefix: 'Charter', description: 'Team charter', minimum: 'Roles, decision rules, communication norms, owned ID prefixes' },
      { idPrefix: 'ENT', description: 'Enterprise proposal and system of interest', minimum: 'ENT-001: name, domain, problem statement, mission (MGO-001) and any goals (MGO-002, …), system of interest, at least 3 elements inside the boundary (PRT), suitability, instructor decision' },
      { idPrefix: 'EXT', description: 'External systems and actors (context)', minimum: '≥ 6 EXT items, each with what crosses and its direction' },
      { idPrefix: 'STK', description: 'Stakeholder register (with CON concerns)', minimum: '≥ 8 STK, classified, each with specific concerns and a rated influence; ≥ 3 relationships (REL), ≥ 1 of them a conflict' },
      { idPrefix: 'NEED', description: 'Initial stakeholder needs', minimum: '≥ 8 NEED that count (structure and subject checked, six minimum checks confirmed, each need traced to the mission or a goal, warnings rewritten or justified), traced to ≥ 5 stakeholders incl. an approving authority' },
    ],
    continuity: 'The Week 1 Team Record is the first part of the Systems Thinking Engineering Package (Week 7). Week 2 builds the ConOps and requirements from these needs; Week 8 imports the stakeholders and concerns into the team’s SysML v2 model and Week 9 models the needs, using the IDs recorded this week.',
    tools: [{ label: 'Team enterprise view (Laboratory → lab tool)', to: '/week/1/lab/tool' }],
    review: PENDING,
  },
  assignment: {
    id: 'W1-A',
    title: 'Week 1 Team Record and graduate needs review',
    mode: 'team',
    due: 'Before the first session of Week 2',
    weight:
      'Formative. The Team Record (team) receives feedback against the rubric rows listed on the Laboratory page; it may be submitted with the proposal labeled “submitted for approval”, but the instructor’s approval is required before the Week 2 submission. The graduate needs review (individual) is always read, given feedback on RB-2.2 and filed as review-notebook entry 1 (RB-16, 5 %).',
    instructions: [
      'Team: complete the six parts of the Team Record for your own enterprise (charter, proposal, context, stakeholder register, initial needs, AI usage statement) in the Team enterprise view, export it, and upload the Markdown and JSON files.',
      'Team: take the enterprise proposal to the instructor at the Session 2 checkpoint, and record the decision and its date in the proposal (approved; or submitted for approval until the instructor decides).',
      'Graduate (individual): choose four of your team’s need statements, test each against the six minimum checks, record the revision and the reason for each, and name one need you would challenge (at most 250 words).',
      'Log your hours for the week in the review notebook (workload pilot).',
    ],
    template: [
      { heading: '1. Team charter', guidance: 'Roles with initials (four, or three in a 3-person team), decision rules, communication norms, owned ID prefixes per member.' },
      { heading: '2. Enterprise proposal (ENT-001)', guidance: 'Name, domain, problem statement and mission (MGO-001), one sentence each, any goals (MGO-002, …), system of interest (one sentence) and the elements inside its boundary (PRT), why it suits a 14-week project, the instructor’s decision and date (approved, or submitted for approval).' },
      { heading: '3. Context (EXT)', guidance: 'At least six external systems or actors, each with what crosses the boundary and its direction.' },
      { heading: '4. Stakeholder register (STK, CON)', guidance: 'At least eight stakeholders: role, life-cycle stage, internal or external, approving authority, one or more specific concerns with CON IDs, influence 1–5 with a reason; at least three relationships (REL-001 …: from, to, type, note), at least one of them a conflict.' },
      { heading: '5. Initial stakeholder needs (NEED)', guidance: 'At least eight needs: ID, name, statement, condition, rationale, priority, source stakeholder(s), the concern(s) answered, the mission or goal it serves (MGO), the team’s self-check against the six minimum checks and any justification; at least five stakeholders covered, including an approving authority.' },
      { heading: '6. AI usage statement', guidance: 'Tool, purpose, prompts, what you accepted or rejected and why (RB-12.1–12.2); tag AI-suggested stakeholders and needs AI-suggested-reviewed (RB-12.3).' },
    ],
    rubrics: ['RB-1', 'RB-2', 'RB-12', 'RB-16'],
    rubricScope:
      'Formative throughout. Team Record: RB-1.1 boundary and context (system of interest, boundary and context in the proposal); RB-1.2 stakeholder identification and classification; RB-1.3 interests, concerns, influence (with at least one conflict); RB-2.2 need statements; RB-2.5 traceability, applied to NEED → STK links only this week. The charter and the proposal’s approval are completeness checks, not scored rows. Graduate needs review (individual): RB-2.2, filed as review-notebook entry 1 under RB-16. AI usage statement: RB-12.1–12.3.',
    aiUse: 'AI tools may be used to brainstorm stakeholders and to critique draft needs. Every AI-suggested stakeholder or need must be tagged AI-suggested-reviewed, and the AI usage statement must say what was rejected.',
    objectives: ['B1.1', 'B1.2', 'B1.3', 'B1.4', 'B1.5'],
    review: PENDING,
  },
  quiz: WEEK1_QUIZ,
  instructorNotes: {
    sessions: [
      {
        title: 'Session 1 — concept studio (SUPERSEDED: pre-lecture plan; the Session 1 deck and its notes are authoritative)',
        minutes: 75,
        segments: [
          { label: 'Hook: who is missing?', minutes: 10, notes: 'Show the Overview question (three stakeholders for a vertiport next to homes). Collect predictions by show of hands before any explanation.' },
          { label: 'Definitions with sources', minutes: 15, notes: 'System (R38), system of interest (R39b), enterprise (R07 p.815), stakeholder (R39a p.1631). Stress that SEBoK attributes the system definition to ISO/IEC/IEEE 15288:2015 while noting its wording is an expanded version of the standard’s.' },
          { label: 'Worked example: from context to stakeholders', minutes: 15, notes: 'Walk the three sources on AeroLink (w1-worked-stakeholders). Ask why the weather is not a stakeholder but the utility is.' },
          { label: 'Active practice: needs clinic', minutes: 25, notes: 'Pairs rewrite three bad drafts from their own enterprise ideas; two pairs present; the class applies the six criteria.' },
          { label: 'Team formation', minutes: 10, notes: 'Teams form (3–4 members), choose lead roles and agree a first decision rule. Teams bring two candidate enterprises to Session 2 (budgeted at about 25 minutes per student out of class: a name, a one-line purpose and a first guess at the system of interest for each).' },
        ],
      },
      {
        title: 'Session 2 — Lab L1 (SUPERSEDED: pre-lecture plan; the Session 2 deck, its lab slides and the lab instructions are authoritative)',
        minutes: 75,
        segments: [
          { label: 'Brief', minutes: 5, notes: 'The six parts of the Team Record, the minimums, and the proposal criteria. AeroLink is not an acceptable team enterprise.' },
          { label: 'Team work: charter and proposal', minutes: 20, notes: 'Teams complete the charter and draft the proposal in the Team enterprise view.' },
          { label: 'Instructor checkpoint: proposal decision', minutes: 15, notes: 'Each team states its enterprise, system of interest and boundary in one sentence each. Approve, or ask for a revision with a reason, and tell the team to record the decision and date.' },
          { label: 'Team work: context and stakeholder register', minutes: 30, notes: 'Teams apply the three sources; circulate and challenge any register with no approving authority or only customers and users.' },
          { label: 'Close', minutes: 5, notes: 'Needs are finished out of class; remind teams of the minimums and the upload.' },
        ],
      },
    ],
    misconceptions: [
      { claim: '“The stakeholders are the customers and the users.”', correction: 'Stakeholders include anyone with a right, share, claim or interest in the system, including approving authorities, maintainers, the public and those involved in disposal. Leaving one out often results in missing needs and a failed system validation.', cite: { reading: 'R11', pages: '552' } },
      { claim: '“Everything in the context diagram is a stakeholder.”', correction: 'A stakeholder is an individual or organization (or a group or class of them). The weather and the electric grid belong to the context; the utility that runs the grid is a stakeholder, and the weather never is.', cite: { reading: 'R39a', pages: '1631' } },
      { claim: '“A need is just a requirement written informally.”', correction: 'Needs give the stakeholders’ perspective and are later transformed into requirements, which give the developer’s perspective (p.549). Need statements avoid “shall” so that the two stay distinct (p.555).', cite: { reading: 'R11', pages: '549, 555' } },
      { claim: '“If two needs conflict, delete the weaker one.”', correction: 'The integrated set must be consistent, but a conflict is recorded and resolved later by a trade and stakeholder agreement; deleting a need silently drops a stakeholder.', cite: { reading: 'R11', pages: '551' } },
    ],
    facilitation: [
      'Keep the Overview question visible in Session 1; every stakeholder argument should be tested against it.',
      'Do not accept AeroLink, or a near copy of it, as a team enterprise. Good proposals have several interacting parts, people as well as technology, exchanges with systems outside the boundary, stakeholders whose needs differ, and enough substance to carry through Phase II (architecture, interfaces, a SysML v2 model).',
      'Challenge any register that contains no approving authority, or only customers and users, and any concern that names only a general quality (“safety”, “cost”).',
      'The workbench need check rejects only real defects (faculty final review, A21): a statement that is not a sentence or names no outcome, no registered stakeholder in need (or the team’s own enterprise as the party in need), “shall”, a named solution as the thing needed, a duplicate ID, or missing record fields. A valid need in another phrasing than the recommended form “The [stakeholders] need the [system] to …” is accepted with a note recommending the form, which never stops it counting. Vague, requirement and design words and a missing condition are warnings the team rewrites or justifies, and the team confirms the six minimum checks per need. None of this judges quality: read the justifications, accept a need the team can defend, and challenge one that only satisfies the tool.',
      'Accessibility: every workbench check reports its result in text; the stakeholder and needs exercises are plain form controls with labels; the register and needs tables can be completed with the keyboard.',
    ],
    answerKey: [
      'Overview question: no. The three-stakeholder list leaves out the approving authorities (the FAA; the city planning authority for the site), the affected public (communities near the vertiport), the operators and maintainers, the vertiport operators and the utility. SEBoK: leaving out a relevant stakeholder often results in missing needs and a failed system validation (R11 p.552).',
      'Stakeholder identification key (AeroLink): stakeholders are the passengers, FAA, investors, communities near vertiports, vertiport operators, emergency responders, electric utility, aircraft manufacturer, maintenance technicians, city planning authority and air navigation service provider. Not stakeholders: the electric grid (a system in the context; its operator, the utility, is the stakeholder), the weather (a natural system) and the cabin color scheme (a design attribute).',
      'Classification key: FAA = approving or regulatory authority, external, approving authority yes; communities = affected public, external, no; vertiport operators = supplier or owner of an enabling system, external, no; AeroLink’s pilots and remote operators = user or operator, internal, no; maintenance technicians = maintainer or support, internal, no; electric utility = supplier or owner of an enabling system, external, no.',
      'Acceptable team enterprises are any domain the instructor approves (for example a regional food bank network, a hospital’s emergency department, a campus shuttle service). Reject proposals that are a single product with no enterprise around it, or so large that no system of interest can be stated.',
    ],
    cautions: [
      'This archived week page predates the Session 1 and Session 2 lecture decks (revised 2026-10-19). Where it differs, the decks, the lab instructions (WEEK1_LAB_INSTRUCTIONS.md) and the lab brief (labBrief.ts) are authoritative; the two session plans above are kept only as history.',
      'AeroLink is FICTIONAL. The reference stakeholders, concerns and ratings are instructor teaching values, not a survey of real organizations; the FAA appears only as the approving authority role in a teaching case.',
      'SEBoK page numbers in citations are PDF page indices (DECISION_LOG W1); printed page numbers in the PDF differ.',
      'R39a and R39b (SEBoK glossary entries for stakeholder and system-of-interest) were added to the verified register for this rebuild and await faculty confirmation.',
      'Workload (new, pending review; lecture-first path, 2026-10-19): per-student hours. The counted rows total 8.0 h, the 8 h syllabus estimate exactly (2 × 75 min in class, the detailed lesson, the readings, the candidate enterprise, the Team Record share, the quiz, the graduate review and the time log). The lesson row is computed from the lesson word count and the Team Record and quiz rows from the mission minutes (src/content/week1Path.ts WORKLOAD); the AeroLink practice missions 1–4 are optional and shown but not counted (faculty-default decision 3). Week 1 Overview (M4 part A, 2026-10-21): with the Learn row computed from the textbook (13,311 words, 1.48 h) the required total was 8.1 h, accepted by faculty 2026-10-21 (DECISION_LOG A26). After M4 part B the textbook has 17,309 required words plus 1,212 words of extension reading (optional, not counted; DECISION_LOG A27), so the Learn row is 1.92 h and the computed required total is 8.5 h; the Overview shows the honest computed total.',
    ],
    review: PENDING,
  },
  // Review F10 of commit 0f3ebcb: every row is PER STUDENT, the candidate-enterprise preparation is budgeted, and the
  // total was stated honestly (8.9 h then; FD-29 trim proposal, superseded by the lecture-first path below: 8.0 h).
  // Lecture-first path (DECISION_LOG A20, 2026-10-19): recomputed from the new path. The lesson row is the word count
  // of both sessions' student lesson at a study pace (src/content/week1Path.ts, LESSON_WPM); learn/week01.test.ts
  // asserts every computed row. The AeroLink practice missions 1–4 are optional (faculty-default decision 3) and are
  // shown but not counted.
  workload: [
    { activity: 'In-class sessions (2 × 75 min): Session 1 lecture; Session 2 lecture and Lab L1 launch', hours: 2.5, review: PENDING },
    { activity: 'Detailed lesson, both sessions, including the AeroLink worked examples (about 13,400 words at about 150 words a minute), per student', hours: 1.4, review: PENDING },
    { activity: 'Readings R11 pp.549–555 and R63 pp.234–235 (9 pp at ≈ 15 pp/h), per student', hours: 0.6, review: PENDING },
    { activity: 'Candidate enterprise for the Session 2 pitch (one per member, prepared between the sessions), per student', hours: 0.3, review: PENDING },
    { activity: 'Team Record out of class (Lab L1, procedure steps 3–10), per student: your share of the proposal (problem, mission and goals), the context, the stakeholder sweep, the register and its relationships, eight or more needs with their self-checks, the coverage audit, the AI usage statement and the export (10 person-hours for a team of four)', hours: 2.5, review: PENDING },
    { activity: 'Readiness quiz Q1, per student', hours: 0.2, review: PENDING },
    { activity: 'Graduate needs review (individual): four of the team’s needs revised, at most 250 words', hours: 0.4, review: PENDING },
    { activity: 'Time log, per student', hours: 0.1, review: PENDING },
    { activity: 'Optional practice: Guided Practice on AeroLink, six tasks (about 96 min), per student', hours: 1.6, review: PENDING, optional: true },
  ],
  references: [{ reading: 'R38' }, { reading: 'R39a' }, { reading: 'R39b' }, { reading: 'R07', pages: '815' }, { reading: 'R53', pages: '296' }],
  review: {
    status: 'self-checked',
    reviewer: 'Week 1 rebuild (2026-10-18); awaiting an independent review pass and faculty approval',
    date: '2026-10-18',
    report: '_source_cache/review/week01_rebuild_review.md',
    openIssues: [
      'Rebuilt for the whiteboard subject (Team Formation / Needs / Identifying Stakeholders); every new item carries new-pending-review and needs an independent review and faculty approval.',
      'Workload recomputed for the lecture-first path (2026-10-19): 8.0 h per student, the 8 h syllabus estimate exactly (a three-person team about 8.6 h, flagged for faculty decision); the AeroLink practice missions 1–4 are optional and not counted (faculty-default decision 3).',
    ],
  },
}

export default week01
