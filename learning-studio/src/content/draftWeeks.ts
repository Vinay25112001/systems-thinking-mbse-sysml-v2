// ARCHIVE: the superseded provisional 14-week outline (Pathway B syllabus §7, revision 1; Part split per DECISION_LOG A7).
// The authoritative schedule is now COURSE_SCHEDULE.md (faculty whiteboard, 2026-10-18; DECISION_LOG A19), held in
// course.ts. This file keeps the earlier outline VERBATIM because the reviewed draft modules in content/weeks/weekNN.ts
// were written against it: their objective IDs, labs and readings refer to these weeks. The app serves those modules
// as "earlier reviewed draft material" under #/draft/<oldWeek>, never under a current week title.
// Objectives were copied from WEEKLY_INSTRUCTIONAL_PLAN.md Part B; reading IDs come from the verified register.
import type { Bloom, Objective, WeekOutline } from './course'

const o = (id: string, text: string, bloom: Bloom, clo: string[]): Objective => ({ id, text, bloom, clo })

export const DRAFT_WEEKS: WeekOutline[] = [
  {
    number: 1, part: 'ST', title: 'Systems, systems thinking and the engineered enterprise',
    topics: ['System of interest and boundary', 'Holism and separation of concerns', 'Feedback and emergence', 'Analysis vs synthesis', 'System archetypes'],
    objectives: [
      o('B1.1', 'Define system, system of interest, boundary, environment, emergence and enterprise', 'Understand', ['B-CLO1']),
      o('B1.2', 'Construct a context diagram and two causal loops for AeroLink', 'Apply', ['B-CLO1']),
      o('B1.3', 'Explain one emergent behaviour of AeroLink causally', 'Analyse', ['B-CLO1']),
      o('B1.4', 'Describe what systems engineering contributes across a life cycle', 'Understand', ['B-CLO1']),
    ],
    readings: [{ reading: 'R01' }, { reading: 'R02' }, { reading: 'R04' }, { reading: 'R50' }],
    extension: [{ reading: 'R03' }, { reading: 'R05' }],
    lab: 'L1 Context & causal loops; team charter',
    assessment: 'Readiness quiz Q1',
    graduateTask: 'Archetype analysis: use the AeroLink dynamics explorer to identify a leverage point and defend it in a one-page memo (R05 p.283–284).',
  },
  {
    number: 2, part: 'ST', title: 'Enterprises, systems of systems, life cycles and stakeholders',
    topics: ['Enterprise vs SoS', 'Life-cycle stages and technical reviews', 'Stakeholder identification and classification', 'Stakeholder conflicts'],
    objectives: [
      o('B2.1', 'Classify AeroLink as system, enterprise and/or SoS, and justify it against stated criteria', 'Analyse', ['B-CLO1']),
      o('B2.2', 'Identify and categorise stakeholders with interests, influence and relationships', 'Apply', ['B-CLO1']),
      o('B2.3', 'Analyse conflicts between stakeholder concerns', 'Analyse', ['B-CLO1']),
      o('B2.4', 'Explain life-cycle stages, decision gates and the purpose of technical reviews', 'Understand', ['B-CLO1']),
    ],
    readings: [{ reading: 'R07' }, { reading: 'R09' }, { reading: 'R06a' }, { reading: 'R06b' }, { reading: 'R06c' }, { reading: 'R63' }],
    extension: [{ reading: 'R08' }],
    lab: 'L2 Stakeholder ecosystem map; AROU v0 (stakeholder editor available now)',
    assessment: 'Readiness quiz Q2',
    graduateTask: 'Apply Maier’s criteria (R08 p.832–834) to AeroLink and two real transport enterprises.',
  },
  {
    number: 3, part: 'ST', title: 'Mission analysis, needs, capabilities and ConOps',
    topics: ['Mission, goals, objectives', 'Solution-free need statements', 'Capability derivation', 'ConOps and operational scenarios'],
    objectives: [
      o('B3.1', 'State the mission, goals and objectives in measurable form', 'Apply', ['B-CLO2']),
      o('B3.2', 'Transform stakeholder concerns into solution-free need statements', 'Apply', ['B-CLO2']),
      o('B3.3', 'Derive and decompose capabilities from needs', 'Analyse', ['B-CLO2']),
      o('B3.4', 'Construct three ConOps scenarios (nominal, weather disruption, charging/maintenance)', 'Create', ['B-CLO2']),
    ],
    readings: [{ reading: 'R10' }, { reading: 'R11' }, { reading: 'R52' }, { reading: 'R59' }, { reading: 'R12', pages: '860–862' }],
    extension: [{ reading: 'R53' }],
    lab: 'L3 Needs → capabilities; three scenarios', due: 'CP1 Problem Definition & ConOps',
    assessment: 'Readiness quiz Q3',
    graduateTask: 'Capability-gap analysis over near/mid/far horizons (R12).',
  },
  {
    number: 4, part: 'ST', title: 'Requirements engineering',
    topics: ['Needs vs requirements', 'Well-formed requirements', 'Rationale and verification method', 'Requirement types'],
    objectives: [
      o('B4.1', 'Distinguish needs, stakeholder requirements and system requirements', 'Understand', ['B-CLO2']),
      o('B4.2', 'Write well-formed requirements with rationale, parent and verification method', 'Create', ['B-CLO2']),
      o('B4.3', 'Classify requirements by type', 'Analyse', ['B-CLO2']),
    ],
    readings: [{ reading: 'R13' }, { reading: 'R48' }, { reading: 'R54' }, { reading: 'R49', pages: '149–150' }],
    extension: [{ reading: 'R55' }],
    lab: 'L4 Requirements writing studio', assessment: 'Readiness quiz Q4',
    graduateTask: 'Apply the system-level requirements checklist (R55 p.368–370) to the team set.',
  },
  {
    number: 5, part: 'ST', title: 'Requirement quality, traceability and measures',
    topics: ['Quality characteristics', 'Bidirectional traceability', 'MOE → MOP → TPM', 'SysML reading micro-lab 1'],
    objectives: [
      o('B5.1', 'Evaluate a peer team’s requirements against quality characteristics', 'Evaluate', ['B-CLO2']),
      o('B5.2', 'Build a bidirectional trace; identify orphans and childless parents', 'Analyse', ['B-CLO2']),
      o('B5.3', 'Define an MOE → MOP → TPM hierarchy with thresholds and margins', 'Create', ['B-CLO2']),
      o('B5.4', 'Read a SysML v2 package and part fragment and identify its elements', 'Understand', ['B-CLO4']),
    ],
    readings: [{ reading: 'R45' }, { reading: 'R56' }, { reading: 'R15' }, { reading: 'R44' }, { reading: 'R48', pages: '143–146' }],
    extension: [{ reading: 'R14' }],
    lab: 'L5 Peer audit; measures; micro-lab 1', assessment: 'Readiness quiz Q5',
    graduateTask: 'Design leading indicators for one TPM (R15).',
  },
  {
    number: 6, part: 'ST', title: 'Technology readiness, uncertainty, risk and AROU',
    topics: ['TRL with evidence', 'Condition–if–then risks', '5×5 rating and handling', 'AROU register', 'SRR-style review'],
    objectives: [
      o('B6.1', 'Assess TRL of three enabling technologies with evidence or labelled assumptions', 'Evaluate', ['B-CLO3']),
      o('B6.2', 'Write, rate and treat risks', 'Evaluate', ['B-CLO3']),
      o('B6.3', 'Maintain an AROU register', 'Apply', ['B-CLO3']),
      o('B6.4', 'Review another team’s baseline against adapted SRR criteria', 'Evaluate', ['B-CLO6']),
      o('B6.5', 'Explain definition vs usage and attributes with units in a SysML fragment (micro-lab 2)', 'Understand', ['B-CLO4']),
    ],
    readings: [{ reading: 'R16' }, { reading: 'R60' }, { reading: 'R17' }, { reading: 'R46', pages: '120–126' }, { reading: 'R40' }, { reading: 'R61', pages: '630–646' }],
    extension: [{ reading: 'R51', pages: '50–56' }],
    lab: 'L6 TRL & AROU; live SRR-style review', due: 'CP2 Requirements Baseline',
    assessment: 'Readiness quiz Q6',
    graduateTask: 'Quantify one risk with an explicit probability model and compare it with the ordinal 5×5 rating.',
  },
  {
    number: 7, part: 'ST', title: 'Trade studies and decision analysis',
    topics: ['Alternatives and criteria', 'Value functions and swing weights', 'Additive value model', 'Sensitivity and rank reversal'],
    objectives: [
      o('B7.1', 'Structure a trade study with criteria traced to MOEs', 'Apply', ['B-CLO3']),
      o('B7.2', 'Elicit swing weights and compute additive value', 'Apply', ['B-CLO3']),
      o('B7.3', 'Test sensitivity and interpret rank reversal', 'Analyse', ['B-CLO3']),
      o('B7.4', 'Recommend and justify a decision with residual uncertainty', 'Evaluate', ['B-CLO3', 'B-CLO6']),
    ],
    readings: [{ reading: 'R18' }, { reading: 'R43' }],
    extension: [{ reading: 'R34' }, { reading: 'R35' }],
    lab: 'L7 Trade study (aircraft vs vertiports)', assessment: 'Exam 1 (Weeks 1–6)',
    graduateTask: 'Monte Carlo on uncertain scores (R18 p.471–472); set-based design comparison (R35).',
  },
  {
    number: 8, part: 'MBSE', title: 'Architecture viewpoints, decomposition, interfaces and information',
    topics: ['Viewpoints and views', 'Functional decomposition and allocation', 'N² interface analysis', 'Information flows and decisions'],
    objectives: [
      o('B8.1', 'Describe operational, functional and physical viewpoints and their purposes', 'Apply', ['B-CLO4']),
      o('B8.2', 'Decompose functions and allocate them with justification', 'Analyse', ['B-CLO4']),
      o('B8.3', 'Identify interfaces with an N² matrix', 'Analyse', ['B-CLO4']),
      o('B8.4', 'Trace information from producer to consumer to decision', 'Analyse', ['B-CLO4']),
      o('B8.5', 'Read a SysML requirement and satisfy fragment and state what it asserts (micro-lab 3)', 'Understand', ['B-CLO4']),
    ],
    readings: [{ reading: 'R19' }, { reading: 'R62' }, { reading: 'R57' }, { reading: 'R21', pages: '510–514' }, { reading: 'R22', pages: '630–631' }, { reading: 'R20c', pages: '598–599' }, { reading: 'R74', pages: '86–91', note: 'micro-lab 3 extract' }, { reading: 'R83', pages: '168', note: 'satisfy semantics; micro-lab 3' }],
    extension: [{ reading: 'R20a' }, { reading: 'R20b' }, { reading: 'R20c' }, { reading: 'R22' }],
    lab: 'L8 Architecture concept; micro-lab 3', due: 'CP3 Trade Study & Architecture Concept',
    assessment: 'Readiness quiz Q7',
    graduateTask: 'Compare two allocation alternatives using coupling metrics from the N² matrix.',
  },
  {
    number: 9, part: 'MBSE', title: 'MBSE foundations and the SysML v2 language',
    topics: ['Model vs view', 'Language architecture (KerML/SysML)', 'Definition vs usage', 'Packages, parts, attributes and units'],
    objectives: [
      o('B9.1', 'Explain what MBSE changes; model vs view', 'Understand', ['B-CLO4']),
      o('B9.2', 'Explain definition vs usage, specialization, subsetting, redefinition', 'Understand', ['B-CLO4']),
      o('B9.3', 'Create packages and part definitions/usages with typed attributes', 'Apply', ['B-CLO4']),
      o('B9.4', 'Map earlier artifacts (by ID) to model packages', 'Apply', ['B-CLO5']),
      o('B9.5', 'Defend the CP3 trade and architecture decisions', 'Evaluate', ['B-CLO6']),
    ],
    readings: [{ reading: 'R28' }, { reading: 'R33a' }, { reading: 'R33b' }, { reading: 'R33c' }, { reading: 'R70' }, { reading: 'R90' }, { reading: 'R80', pages: '47–50, 55–56, 63–65, 72–73, 77', note: 'SysML v2 specification extracts the lesson relies on' }],
    extension: [{ reading: 'R87' }],
    lab: 'L9 Tool onboarding; model skeleton (requires the designated checker, FD-08)', assessment: 'Readiness quiz Q8',
    graduateTask: 'KerML semantics of specialization, subsetting and redefinition (R87).',
  },
  {
    number: 10, part: 'MBSE', title: 'SysML v2 requirements and structure',
    topics: ['Requirements with subject and IDs', 'Ports and interfaces', 'satisfy (an assertion, S06 p.168)', 'Allocation'],
    objectives: [
      o('B10.1', 'Model requirements with subject, constraint and short-name ID', 'Apply', ['B-CLO4']),
      o('B10.2', 'Model logical and physical structure with ports and interfaces', 'Apply', ['B-CLO4']),
      o('B10.3', 'Relate design with satisfy and allocate; explain what each asserts', 'Analyse', ['B-CLO4', 'B-CLO5']),
    ],
    readings: [{ reading: 'R74' }, { reading: 'R71' }, { reading: 'R76', pages: '105–107' }],
    extension: [{ reading: 'R83' }],
    lab: 'L10 Requirements & structure', assessment: 'Readiness quiz Q9',
    graduateTask: 'Model assume/require constraints and explain their semantics (S06 §7.21).',
  },
  {
    number: 11, part: 'MBSE', title: 'SysML v2 behaviour',
    topics: ['Action flows', 'States (current initial-state form)', 'Use cases', 'Behaviour–structure links'],
    objectives: [
      o('B11.1', 'Model a ConOps scenario as an action flow', 'Apply', ['B-CLO4']),
      o('B11.2', 'Model aircraft operating states', 'Apply', ['B-CLO4']),
      o('B11.3', 'Check behaviour against the ConOps and link it to structure', 'Evaluate', ['B-CLO4', 'B-CLO5']),
      o('B11.4', 'Write actionable review findings (RIDs)', 'Evaluate', ['B-CLO6']),
    ],
    readings: [{ reading: 'R72' }, { reading: 'R73' }, { reading: 'R76', pages: '100–101' }],
    extension: [{ reading: 'R82' }],
    lab: 'L11 Behaviour (formative); RID review kick-off', due: 'CP4 SysML Model Baseline',
    assessment: 'Readiness quiz Q10',
    graduateTask: 'An interaction view of one scenario.',
  },
  {
    number: 12, part: 'MBSE', title: 'Verification, measures and the digital thread',
    topics: ['Verification vs validation', 'Verification cases and verdicts', 'MOE/MOP in the model', 'Trace audit'],
    objectives: [
      o('B12.1', 'Distinguish verification from validation and select methods', 'Understand', ['B-CLO5']),
      o('B12.2', 'Define verification cases for at least three requirements', 'Apply', ['B-CLO5']),
      o('B12.3', 'Represent MOE/MOP in the model', 'Apply', ['B-CLO2', 'B-CLO5']),
      o('B12.4', 'Audit trace coverage and complete three threads', 'Evaluate', ['B-CLO5']),
      o('B12.5', 'Disposition the RIDs received on the CP4 model', 'Evaluate', ['B-CLO6']),
    ],
    readings: [{ reading: 'R75', pages: '96–99' }, { reading: 'R49' }, { reading: 'R58' }, { reading: 'R23a' }, { reading: 'R30' }],
    extension: [{ reading: 'R23b' }, { reading: 'R64' }],
    lab: 'L12 Verification & thread audit', assessment: 'Readiness quiz Q11',
    graduateTask: 'Model-credibility argument for one analysis (R64).',
  },
  {
    number: 13, part: 'MBSE', title: 'Analysis, change impact and model consistency',
    topics: ['Impact analysis by traversal', 'Consistency vs parse validity', 'Risk and cause–effect metadata', 'Resilience and AI (awareness)'],
    objectives: [
      o('B13.1', 'Determine a change’s impact set by traversing the model', 'Analyse', ['B-CLO5']),
      o('B13.2', 'Check model consistency; distinguish parses from correct', 'Evaluate', ['B-CLO4', 'B-CLO5']),
      o('B13.3', 'Represent risk and cause–effect with metadata', 'Apply', ['B-CLO3', 'B-CLO4']),
      o('B13.4', 'Explain resilience and AI V&V considerations', 'Understand', ['B-CLO1']),
    ],
    readings: [{ reading: 'R75', pages: '92–95' }, { reading: 'R77', pages: '108–109' }, { reading: 'R78', pages: '147–159' }, { reading: 'R24', pages: '1203–1210' }, { reading: 'R31' }],
    extension: [{ reading: 'R32' }, { reading: 'R88' }],
    lab: 'L13 Impact analysis', assessment: 'Exam 2 (practical model exam)',
    graduateTask: 'Repository/commit-based change analysis concepts (R88).',
  },
  {
    number: 14, part: 'MBSE', title: 'Enterprise evolution, stakeholder views and technical review',
    topics: ['Evolution increment (autonomy)', 'Views and viewpoints', 'Technical review conduct'],
    objectives: [
      o('B14.1', 'Plan an evolution increment and identify affected elements from the model', 'Evaluate', ['B-CLO5']),
      o('B14.2', 'Create a view for a non-technical reviewer', 'Create', ['B-CLO6']),
      o('B14.3', 'Defend decisions in a technical review', 'Evaluate', ['B-CLO6']),
    ],
    readings: [{ reading: 'R77', pages: '116–119' }, { reading: 'R41' }, { reading: 'R26' }],
    extension: [{ reading: 'R29' }],
    lab: 'CP5 reviews', due: 'CP5 Final Integrated Model & Technical Review',
    assessment: 'Readiness quiz Q12; peer evaluation',
    graduateTask: 'Model-based adoption memo (R29).',
  },
]

export function draftWeekByNumber(n: number): WeekOutline | undefined {
  return DRAFT_WEEKS.find((w) => w.number === n)
}
