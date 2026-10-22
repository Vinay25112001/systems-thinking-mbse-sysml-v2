// The authoritative 14-week schedule: COURSE_SCHEDULE.md (repo root), set by faculty on 2026-10-18 from the whiteboard
// schedule (DECISION_LOG A19). Week numbers, the whiteboard subjects (verbatim), the phase split (Weeks 1–7 Phase I,
// Systems Thinking; Weeks 8–14 Phase II, MBSE with SysML v2), the team outputs and the Phase II continuity links all
// come from that document. It supersedes the earlier provisional outline (Pathway B syllabus §7, DECISION_LOG A7),
// which is kept verbatim in draftWeeks.ts because the reviewed draft modules in weeks/weekNN.ts were written against it.
//
// Status of each week:
// - Week 1 is the design template (COURSE_SCHEDULE.md rule 10). Its title, topics, lab label and team output follow
//   the new schedule; its objectives, readings and graduate task were rewritten in the Week 1 rebuild of 2026-10-18
//   (pending independent and faculty review; docs/redesign/WEEK1_LEARNING_DESIGN.md §10).
// - Weeks 2–14 are PROVISIONAL, in redesign: their objectives are drafts written for the new subjects (IDs W<n>.<k>,
//   to be finalized when each week is rebuilt), and their readings are reading IDs from the verified register taken
//   only from the earlier weeks the schedule's reuse map names, with the page ranges those weeks already used.
// Quizzes: a readiness quiz in every week except the presentation weeks 7 and 14 (the schedule's default). Exam
// placement is an open faculty decision and is NOT assigned to any week here.
// Detailed instructional content, grading and technical accuracy remain subject to faculty review (DECISION_LOG A4).
import type { Citation } from './readings'

export type Part = 'ST' | 'MBSE'
export type Bloom = 'Remember' | 'Understand' | 'Apply' | 'Analyse' | 'Evaluate' | 'Create'
export type Objective = { id: string; text: string; bloom: Bloom; clo: string[] }
/** The outline fields every week has, in the current schedule and in the archived earlier outline. */
export type WeekOutline = {
  number: number
  part: Part
  title: string
  topics: string[]
  objectives: Objective[]
  readings: Citation[]
  extension: Citation[]
  lab: string
  due?: string
  assessment: string
  graduateTask: string
}
/** Earlier reviewed draft material a rebuilt week re-uses (COURSE_SCHEDULE.md, reuse table). */
export type DraftSource = { week: number; scope: string }
export type Week = WeekOutline & {
  /** 'template': Week 1, the design template; 'provisional': outline only, the week is being rebuilt. */
  status: 'template' | 'provisional'
  /** What the week adds to the team's package (Phase I) or model (Phase II), from the schedule. */
  output: string
  /** Phase II only: the Phase I weeks whose artifacts this week models (COURSE_SCHEDULE.md rule 6). */
  models?: number[]
  draftSources: DraftSource[]
}

export const PARTS: Record<Part, { title: string; weeks: string; summary: string }> = {
  ST: {
    title: 'Phase I — Systems Thinking',
    weeks: 'Weeks 1–7',
    summary:
      'Each team carries its own instructor-approved enterprise from team formation, stakeholders and needs through ConOps, requirements, technology assessment, risk, trade study, architecture, interfaces and an evolution roadmap, and integrates the work in Week 7 as the Systems Thinking Engineering Package.',
  },
  MBSE: {
    title: 'Phase II — MBSE with SysML v2',
    weeks: 'Weeks 8–14',
    summary:
      'Week 8 introduces MBSE and SysML v2 and imports the team’s package; each later week models one Phase I artifact (stakeholders, requirements, behavior, physical structure and interfaces, verification, analysis), ending in Week 14 with a coherent SysML v2 enterprise model built from the team’s own package.',
  },
}

/** Open faculty decisions (COURSE_SCHEDULE.md). Shown wherever the schedule is shown; never resolved in code. */
export const FACULTY_DECISIONS: { topic: string; detail: string }[] = [
  { topic: 'Exam placement', detail: 'Pending faculty decision. The earlier plan had Exam 1 in Week 7 and Exam 2 in Week 13; Week 7 and Week 14 are now presentation weeks.' },
  { topic: 'Readiness quizzes in Weeks 7 and 14', detail: 'The default is no quiz in the presentation weeks.' },
  { topic: 'Phase II tooling in Week 8', detail: 'How the modeling tool is introduced alongside importing the package.' },
]

const o = (id: string, text: string, bloom: Bloom, clo: string[]): Objective => ({ id, text, bloom, clo })
const TBD = 'To be set when this week is rebuilt from the Week 1 template.'

export const WEEKS: Week[] = [
  {
    number: 1, part: 'ST', status: 'template', title: 'Team Formation / Needs / Identifying Stakeholders',
    topics: ['Team formation and the team charter', 'Enterprise proposal and instructor approval', 'System of interest, boundary and context', 'Identifying and classifying stakeholders', 'Initial stakeholder needs'],
    // Week 1 rebuild 2026-10-18 (new-pending-review): objectives for the whiteboard subject. Readings are verified
    // register pages: R11 (SEBoK Stakeholder Needs Definition) and R63 (MITRE stakeholder assessment) are core; the SEBoK
    // glossary entries R38 (system), R39a (stakeholder; stakeholder needs) and R39b (system-of-interest), R02 p.264
    // (system of interest and context) and R07 p.815 (enterprise) are the definitions the lessons cite; R53 p.296 backs
    // the solution-free criterion; R01 pp.51–53 and R50 pp.46–47 are cited by the kept reviewed blocks w1-se and w1-worked. R39a and R39b were added to the register for this rebuild and await faculty confirmation.
    objectives: [
      o('B1.1', 'Form a project team with a charter that assigns roles, decision rules, communication norms and ID ownership', 'Apply', ['B-CLO1']),
      o('B1.2', 'Explain system, system of interest, boundary, context and enterprise, using cited definitions', 'Understand', ['B-CLO1']),
      o('B1.3', 'Propose an enterprise and its system of interest, with a boundary and a context, for instructor approval', 'Apply', ['B-CLO1']),
      o('B1.4', 'Identify and classify the stakeholders of a system of interest, with their specific concerns', 'Apply', ['B-CLO1']),
      o('B1.5', 'Write well-formed stakeholder need statements traced to stakeholders, and tell needs from requirements', 'Apply', ['B-CLO2']),
    ],
    readings: [{ reading: 'R11', pages: '549–555' }, { reading: 'R63', pages: '234–235' }],
    extension: [{ reading: 'R63', pages: '236' }, { reading: 'R38' }, { reading: 'R39a' }, { reading: 'R39b' }, { reading: 'R01', pages: '51–53' }, { reading: 'R02', pages: '264' }, { reading: 'R07', pages: '815' }, { reading: 'R50', pages: '46–47' }, { reading: 'R53', pages: '296' }],
    lab: 'L1 Team charter, enterprise proposal and stakeholder register',
    output: 'Team charter; enterprise proposal (instructor-approved); stakeholder register; initial stakeholder needs',
    assessment: 'Readiness quiz Q1',
    graduateTask: 'Needs review (individual): test four of your team’s need statements against the need-quality criteria (R11 p.553–555; R53 p.296), record each revision and why, and name one need you would challenge (at most 250 words).',
    draftSources: [
      { week: 1, scope: 'systems, boundary, enterprise' },
      { week: 2, scope: 'stakeholders' },
      { week: 3, scope: 'needs' },
    ],
  },
  {
    number: 2, part: 'ST', status: 'provisional', title: 'ConOps / Requirements',
    topics: ['Concept of operations and operational scenarios', 'From needs to stakeholder requirements', 'System requirements: well-formed, with rationale and verification method', 'Requirement quality and bidirectional traceability', 'Measures of effectiveness and performance (MOE, MOP)'],
    objectives: [
      o('W2.1', 'Construct a ConOps with nominal and off-nominal operational scenarios for the team’s enterprise', 'Create', ['B-CLO2']),
      o('W2.2', 'Distinguish needs, stakeholder requirements and system requirements', 'Understand', ['B-CLO2']),
      o('W2.3', 'Write well-formed requirements with rationale, parent and verification method', 'Create', ['B-CLO2']),
      o('W2.4', 'Trace requirements to needs in both directions and find orphans and childless parents', 'Analyse', ['B-CLO2']),
      o('W2.5', 'Define measures of effectiveness and performance for the key requirements', 'Apply', ['B-CLO2']),
    ],
    readings: [{ reading: 'R52' }, { reading: 'R59' }, { reading: 'R11' }, { reading: 'R13' }, { reading: 'R48' }, { reading: 'R54' }, { reading: 'R45' }, { reading: 'R15' }],
    extension: [{ reading: 'R10' }, { reading: 'R53' }, { reading: 'R55' }, { reading: 'R14' }],
    lab: 'L2 ConOps scenarios and requirements traced to needs',
    output: 'ConOps with operational scenarios; stakeholder and system requirements traced to needs',
    assessment: 'Readiness quiz Q2',
    graduateTask: 'Apply the system-level requirements checklist (R55 p.368–370) to the team set.',
    draftSources: [
      { week: 3, scope: 'ConOps, scenarios' },
      { week: 4, scope: 'requirements' },
      { week: 5, scope: 'quality, traceability, measures' },
    ],
  },
  {
    number: 3, part: 'ST', status: 'provisional', title: 'Technology Assessment / Risk Management / Trade Study',
    topics: ['Technology readiness levels with evidence', 'Uncertainty and labeled assumptions', 'Risk statements, rating and handling; the risk register', 'Trade study: alternatives, criteria, weights and value', 'Sensitivity and a justified decision'],
    objectives: [
      o('W3.1', 'Assess the readiness of the enterprise’s enabling technologies with evidence or labeled assumptions', 'Evaluate', ['B-CLO3']),
      o('W3.2', 'Write, rate and treat risks and maintain a risk register', 'Evaluate', ['B-CLO3']),
      o('W3.3', 'Structure a trade study with criteria traced to measures of effectiveness', 'Apply', ['B-CLO3']),
      o('W3.4', 'Test the sensitivity of the result and recommend a justified decision with residual uncertainty', 'Evaluate', ['B-CLO3', 'B-CLO6']),
    ],
    readings: [{ reading: 'R16' }, { reading: 'R60' }, { reading: 'R17' }, { reading: 'R46', pages: '120–126' }, { reading: 'R18' }, { reading: 'R43' }],
    extension: [{ reading: 'R51', pages: '50–56' }, { reading: 'R61', pages: '630–646' }, { reading: 'R34' }, { reading: 'R35' }],
    lab: 'L3 Technology readiness, risk register and trade study',
    output: 'Technology readiness assessment; risk register; trade study with a justified decision',
    assessment: 'Readiness quiz Q3',
    graduateTask: 'Monte Carlo on uncertain scores (R18 p.471–472); set-based design comparison (R35).',
    draftSources: [
      { week: 6, scope: 'TRL, uncertainty, risk, AROU' },
      { week: 7, scope: 'trade studies' },
    ],
  },
  {
    number: 4, part: 'ST', status: 'provisional', title: 'Architecture / Information View',
    topics: ['Architecture viewpoints and views', 'Functional decomposition and allocation', 'The information view: producers, consumers and decisions'],
    objectives: [
      o('W4.1', 'Describe architecture viewpoints and select the views the team’s enterprise needs', 'Apply', ['B-CLO4']),
      o('W4.2', 'Decompose the enterprise’s functions and allocate them with justification', 'Analyse', ['B-CLO4']),
      o('W4.3', 'Build an information view that traces information from producer to consumer to decision', 'Analyse', ['B-CLO4']),
    ],
    readings: [{ reading: 'R19' }, { reading: 'R62' }, { reading: 'R21', pages: '510–514' }],
    extension: [{ reading: 'R20a' }, { reading: 'R20b' }],
    lab: 'L4 Architecture description and information view',
    output: 'Architecture description: viewpoints, functional decomposition, information view',
    assessment: 'Readiness quiz Q4',
    graduateTask: TBD,
    draftSources: [{ week: 8, scope: 'viewpoints, decomposition, information' }],
  },
  {
    number: 5, part: 'ST', status: 'provisional', title: 'Components / Interfaces',
    topics: ['Component breakdown', 'Identifying interfaces with an N² chart', 'Interface definitions and the interface table'],
    objectives: [
      o('W5.1', 'Break the architecture down into components with clear responsibilities', 'Apply', ['B-CLO4']),
      o('W5.2', 'Identify interfaces between components with an N² chart', 'Analyse', ['B-CLO4']),
      o('W5.3', 'Define each interface in an interface table: what crosses it, in which direction and under which constraints', 'Create', ['B-CLO4']),
    ],
    readings: [{ reading: 'R57' }, { reading: 'R22', pages: '630–631' }, { reading: 'R20c', pages: '598–599' }],
    extension: [{ reading: 'R22' }],
    lab: 'L5 Component breakdown and interface definitions (N² chart)',
    output: 'Component breakdown; interface definitions (N² chart / interface table)',
    assessment: 'Readiness quiz Q5',
    graduateTask: 'Compare two allocation alternatives using coupling metrics from the N² matrix.',
    draftSources: [{ week: 8, scope: 'interfaces' }],
  },
  {
    number: 6, part: 'ST', status: 'provisional', title: 'Evolution Roadmap',
    topics: ['Enterprise evolution increments', 'Technology insertion', 'Transition planning'],
    objectives: [
      o('W6.1', 'Plan enterprise evolution increments with their triggers and dependencies', 'Create', ['B-CLO3', 'B-CLO5']),
      o('W6.2', 'Plan technology insertion from the Week 3 readiness assessment', 'Evaluate', ['B-CLO3']),
      o('W6.3', 'Describe the transition from the current enterprise to each increment', 'Apply', ['B-CLO5']),
    ],
    readings: [{ reading: 'R26' }],
    extension: [],
    lab: 'L6 Enterprise evolution roadmap',
    output: 'Enterprise evolution roadmap (increments, technology insertion, transition)',
    assessment: 'Readiness quiz Q6',
    graduateTask: 'Roadmap sensitivity memo: the trigger or unknown that would move an increment by a full horizon, its impact set across the Weeks 1–5 IDs, and the earlier decision to re-run.',
    draftSources: [{ week: 14, scope: 'enterprise evolution' }],
  },
  {
    number: 7, part: 'ST', status: 'provisional', title: 'Final Presentation',
    topics: ['Integrating Weeks 1–6 into one package', 'Consistency across the package', 'The Phase I presentation and review'],
    objectives: [
      o('W7.1', 'Integrate the Weeks 1–6 work into a consistent Systems Thinking Engineering Package', 'Create', ['B-CLO5', 'B-CLO6']),
      o('W7.2', 'Present and defend the team’s decisions in the Phase I presentation', 'Evaluate', ['B-CLO6']),
      o('W7.3', 'Review another team’s package against stated criteria', 'Evaluate', ['B-CLO6']),
    ],
    readings: [{ reading: 'R40' }],
    extension: [],
    lab: 'Phase I presentations and package review',
    due: 'Systems Thinking Engineering Package',
    output: 'Systems Thinking Engineering Package (Weeks 1–6 integrated) and the Phase I presentation',
    assessment: 'Phase I presentation; no readiness quiz (default; pending faculty decision)',
    graduateTask: 'Package trace-audit memo: coverage per trace layer with the counting rule, every orphan and childless parent with its disposition judged for Phase II, the gap that most threatens the Week 8 import traced to the model elements it would corrupt, and what the structural audit cannot see.',
    draftSources: [
      { week: 3, scope: 'checkpoint CP1 (problem definition and ConOps)' },
      { week: 6, scope: 'checkpoint CP2 (requirements baseline, SRR-style review)' },
      { week: 8, scope: 'checkpoint CP3 (trade study and architecture concept)' },
      { week: 7, scope: 'review material' },
    ],
  },
  {
    number: 8, part: 'MBSE', status: 'provisional', title: 'Import Systems Thinking Artifacts / Stakeholders', models: [1],
    topics: ['Introduction to MBSE: model vs view', 'The SysML v2 language: definition vs usage, packages, parts and attributes', 'A model skeleton for the team’s enterprise', 'Importing the Systems Thinking Engineering Package', 'Stakeholders and concerns in the model'],
    objectives: [
      o('W8.1', 'Explain what MBSE changes compared with document-based work, and the difference between a model and a view', 'Understand', ['B-CLO4']),
      o('W8.2', 'Explain definition vs usage in SysML v2 and create packages and part definitions with typed attributes', 'Apply', ['B-CLO4']),
      o('W8.3', 'Map the Systems Thinking Engineering Package, by artifact ID, onto model packages', 'Apply', ['B-CLO5']),
      o('W8.4', 'Model the Week 1 stakeholders and their concerns', 'Apply', ['B-CLO4']),
    ],
    readings: [{ reading: 'R28' }, { reading: 'R33a' }, { reading: 'R33b' }, { reading: 'R33c' }, { reading: 'R70' }, { reading: 'R90' }, { reading: 'R80', pages: '47–50, 55–56, 63–65, 72–73, 77', note: 'SysML v2 specification extracts the lesson relies on' }],
    extension: [{ reading: 'R87' }],
    lab: 'L8 Model skeleton: import the package; stakeholders and concerns',
    output: 'Introduction to MBSE and SysML v2; model skeleton; the package imported; stakeholders and concerns modeled',
    assessment: 'Readiness quiz Q7',
    graduateTask: 'KerML semantics of specialization, subsetting and redefinition (R87).',
    draftSources: [{ week: 9, scope: 'MBSE foundations, SysML v2 language' }],
  },
  {
    number: 9, part: 'MBSE', status: 'provisional', title: 'Needs / Requirements', models: [2],
    topics: ['Requirement definitions and usages', 'Subject, constraint and short-name IDs', 'Tracing model requirements to needs'],
    objectives: [
      o('W9.1', 'Model the Week 2 requirements as SysML v2 requirement definitions and usages with subject, constraint and ID', 'Apply', ['B-CLO4']),
      o('W9.2', 'Trace model requirements to the needs they answer', 'Apply', ['B-CLO5']),
      o('W9.3', 'Check that every Week 2 requirement is represented once in the model', 'Evaluate', ['B-CLO5']),
    ],
    readings: [{ reading: 'R74' }],
    extension: [{ reading: 'R83' }],
    lab: 'L9 Needs and requirements in SysML v2, with traces',
    output: 'Needs and requirements as SysML v2 requirement definitions and usages, with traces',
    assessment: 'Readiness quiz Q8',
    graduateTask: 'Model assume/require constraints and explain their semantics (S06 §7.21).',
    draftSources: [{ week: 10, scope: 'SysML v2 requirements' }],
  },
  {
    number: 10, part: 'MBSE', status: 'provisional', title: 'Logical / Behavioral Modeling', models: [2, 4],
    topics: ['Logical architecture in the model', 'Action flows for ConOps scenarios', 'States', 'Use cases', 'Linking behavior to structure'],
    objectives: [
      o('W10.1', 'Model the Week 4 logical architecture', 'Apply', ['B-CLO4']),
      o('W10.2', 'Model a Week 2 ConOps scenario as an action flow and the main operating states', 'Apply', ['B-CLO4']),
      o('W10.3', 'Check behavior against the ConOps and link it to the logical structure', 'Evaluate', ['B-CLO4', 'B-CLO5']),
    ],
    readings: [{ reading: 'R72' }, { reading: 'R73' }, { reading: 'R76', pages: '100–101' }],
    extension: [{ reading: 'R82' }],
    lab: 'L10 Logical architecture and ConOps behavior',
    output: 'Logical architecture; actions, states and use cases for the ConOps scenarios',
    assessment: 'Readiness quiz Q9',
    graduateTask: 'An interaction view of one scenario.',
    draftSources: [{ week: 11, scope: 'behavior' }],
  },
  {
    number: 11, part: 'MBSE', status: 'provisional', title: 'Physical / Interfaces', models: [5],
    topics: ['Physical parts', 'Ports, interfaces and connections', 'Allocation from logical to physical'],
    objectives: [
      o('W11.1', 'Model the Week 5 components as physical parts with ports', 'Apply', ['B-CLO4']),
      o('W11.2', 'Model the Week 5 interfaces as SysML v2 interfaces and connections', 'Apply', ['B-CLO4']),
      o('W11.3', 'Allocate logical elements to physical parts and explain what each allocation asserts', 'Analyse', ['B-CLO4', 'B-CLO5']),
    ],
    readings: [{ reading: 'R71' }, { reading: 'R57' }],
    extension: [{ reading: 'R20c', pages: '598–599' }],
    lab: 'L11 Physical parts, ports, interfaces and allocation',
    output: 'Physical parts, ports, interfaces and connections; allocation from logical to physical',
    assessment: 'Readiness quiz Q10',
    graduateTask: TBD,
    draftSources: [
      { week: 10, scope: 'structure' },
      { week: 8, scope: 'interfaces, now in SysML v2' },
    ],
  },
  {
    number: 12, part: 'MBSE', status: 'provisional', title: 'Digital Thread / Verification and Validation', models: [2, 3],
    topics: ['Verification vs validation', 'Verification cases; satisfy and verify relationships', 'Measures in the model', 'Digital-thread audit'],
    objectives: [
      o('W12.1', 'Distinguish verification from validation and select a method for each requirement', 'Understand', ['B-CLO5']),
      o('W12.2', 'Define verification cases and relate the design with satisfy and verify', 'Apply', ['B-CLO5']),
      o('W12.3', 'Audit the digital thread from need to verification and close the gaps found', 'Evaluate', ['B-CLO5']),
    ],
    readings: [{ reading: 'R75', pages: '96–99' }, { reading: 'R49' }, { reading: 'R58' }, { reading: 'R23a' }, { reading: 'R30' }],
    extension: [{ reading: 'R23b' }, { reading: 'R64' }],
    lab: 'L12 Verification cases and digital-thread audit',
    output: 'Verification cases, satisfy and verify relationships; digital-thread audit',
    assessment: 'Readiness quiz Q11',
    graduateTask: 'Model-credibility argument for one analysis (R64).',
    draftSources: [{ week: 12, scope: 'verification, measures, digital thread' }],
  },
  {
    number: 13, part: 'MBSE', status: 'provisional', title: 'Trade Study / Analysis', models: [3],
    topics: ['Analysis cases and constraints', 'The Week 3 trade study redone in the model', 'Change impact and model consistency'],
    objectives: [
      o('W13.1', 'Model analysis cases and constraints for the key measures', 'Apply', ['B-CLO4', 'B-CLO5']),
      o('W13.2', 'Redo the Week 3 trade study in the model and compare the result with the document-based one', 'Evaluate', ['B-CLO3', 'B-CLO5']),
      o('W13.3', 'Determine a change’s impact by traversing the model and check model consistency', 'Analyse', ['B-CLO5']),
    ],
    readings: [{ reading: 'R75', pages: '92–95' }, { reading: 'R77', pages: '108–109' }, { reading: 'R78', pages: '147–159' }, { reading: 'R24', pages: '1203–1210' }, { reading: 'R31' }],
    extension: [{ reading: 'R32' }, { reading: 'R88' }],
    lab: 'L13 Analysis cases; the Week 3 trade study in the model',
    output: 'Analysis cases and constraints; the Week 3 trade study redone in the model',
    assessment: 'Readiness quiz Q12',
    graduateTask: 'Repository/commit-based change analysis concepts (R88).',
    draftSources: [{ week: 13, scope: 'analysis, change impact, consistency (and the Parametric Analysis panel, A10–A12)' }],
  },
  {
    number: 14, part: 'MBSE', status: 'provisional', title: 'Final Presentation', models: [6, 7],
    topics: ['A coherent enterprise model built from the team’s own package', 'The evolution roadmap in the model', 'Views for stakeholders', 'Final technical review'],
    objectives: [
      o('W14.1', 'Deliver a coherent SysML v2 enterprise model developed from the team’s Systems Thinking package', 'Create', ['B-CLO4', 'B-CLO5']),
      o('W14.2', 'Show the Week 6 evolution roadmap in the model and identify the elements each increment affects', 'Evaluate', ['B-CLO5']),
      o('W14.3', 'Create a view for a non-technical reviewer and defend the model in the final review', 'Evaluate', ['B-CLO6']),
    ],
    readings: [{ reading: 'R77', pages: '116–119' }, { reading: 'R41' }, { reading: 'R26' }],
    extension: [{ reading: 'R29' }],
    lab: 'Final presentations and model review',
    due: 'SysML v2 enterprise model',
    output: 'Coherent SysML v2 enterprise model built from the team’s own Systems Thinking package; final review',
    assessment: 'Final presentation and model review; no readiness quiz (default; pending faculty decision)',
    graduateTask: 'Model-based adoption memo (R29).',
    draftSources: [{ week: 14, scope: 'stakeholder views, technical review' }],
  },
]

export function weekByNumber(n: number): Week | undefined {
  return WEEKS.find((w) => w.number === n)
}

/** "Week 1" or "Weeks 2 and 4": the Phase I weeks a Phase II week models. */
export function modelsLabel(w: Week): string | null {
  if (!w.models?.length) return null
  const ws = w.models
  return ws.length === 1 ? `Week ${ws[0]}` : `Weeks ${ws.slice(0, -1).join(', ')} and ${ws[ws.length - 1]}`
}
