// The 14 weekly milestones (data model §9.1): titles from the whiteboard schedule (src/content/course.ts WEEKS) and the
// expected artifacts of each week, with minimums read from that week's lecture lab brief where one exists (single
// source, never retyped). Weeks without a lab brief yet (6, 7, 9–14) list the artifact types the course plan names for
// them, marked provisional.
import { WEEKS } from '../../content/course'
import { LAB_MINIMUMS, LAB_MINIMUMS_THREE } from '../../content/lectures/week01/labBrief'
import { LAB2_MINIMUMS } from '../../content/lectures/week02/labBrief'
import { LAB3_MINIMUMS } from '../../content/lectures/week03/labBrief'
import { LAB4_MINIMUMS } from '../../content/lectures/week04/labBrief'
import { LAB5_MINIMUMS } from '../../content/lectures/week05/labBrief'
import type { ExpectedArtifact, Milestone } from './types'

const E = (type: ExpectedArtifact['type'], min: number, rule?: string, minThreePerson?: number): ExpectedArtifact => ({ type, min, ...(rule ? { rule } : {}), ...(minThreePerson !== undefined ? { minThreePerson } : {}) })

export const EXPECTED: Record<number, ExpectedArtifact[]> = {
  1: [
    E('ENT', 1, 'the enterprise proposal, with the instructor’s decision recorded'),
    E('MGO', 1, 'the mission (MGO-001); goals MGO-002 onward are optional'),
    E('PRT', LAB_MINIMUMS.inside, 'elements inside the boundary of the system of interest'),
    E('EXT', LAB_MINIMUMS.context, 'external systems and actors, each with what crosses and its direction'),
    E('STK', LAB_MINIMUMS.stakeholders, `in at least ${LAB_MINIMUMS.roleGroups} role groups, each with a specific concern`),
    E('REL', LAB_MINIMUMS.relationships, `stakeholder relationships, at least ${LAB_MINIMUMS.conflicts} a conflict`),
    E('NEED', LAB_MINIMUMS.needs, `from at least ${LAB_MINIMUMS.needSources} stakeholders (three-person team: ${LAB_MINIMUMS_THREE.needs} from ${LAB_MINIMUMS_THREE.needSources})`, LAB_MINIMUMS_THREE.needs),
  ],
  2: [E('CONOPS', 1), E('SCN', LAB2_MINIMUMS.scenarios), E('CAP', LAB2_MINIMUMS.capabilities), E('REQ-STK', LAB2_MINIMUMS.stakeholderRequirements), E('REQ-SYS', LAB2_MINIMUMS.systemRequirements), E('MOE', LAB2_MINIMUMS.moes), E('MOP', LAB2_MINIMUMS.mops)],
  3: [E('TECH', LAB3_MINIMUMS.technologies), E('R', LAB3_MINIMUMS.risks), E('O', LAB3_MINIMUMS.opportunities), E('TPM', LAB3_MINIMUMS.tpms), E('ALT', LAB3_MINIMUMS.alternatives), E('CRIT', LAB3_MINIMUMS.criteria)],
  4: [E('VP', LAB4_MINIMUMS.viewpoints), E('FN', LAB4_MINIMUMS.functions), E('FG', LAB4_MINIMUMS.groups), E('LOG', LAB4_MINIMUMS.logical), E('PHY', LAB4_MINIMUMS.physical), E('DEC', LAB4_MINIMUMS.decisions), E('INFO', LAB4_MINIMUMS.information), E('AI', LAB4_MINIMUMS.ai)],
  5: [E('CMP', LAB5_MINIMUMS.components), E('IF', LAB5_MINIMUMS.interfaces), E('REQ-SYS', LAB5_MINIMUMS.requirements, 'interface requirements'), E('ICR', LAB5_MINIMUMS.changeRequests)],
  6: [E('INC', 0, 'roadmap increments (provisional: minimums come with the Week 6 lab brief)')],
  7: [E('PKG', 1, 'the Phase I package and baseline (provisional)'), E('RID', 0, 'design review items (provisional)')],
  8: [E('ENT', 0, 'Week 1 artifacts mapped into the model baseline: ENT, PRT, EXT, STK, CON, REL (provisional)')],
  9: [E('NEED', 0, 'needs and requirements as model elements (provisional)'), E('REQ-STK', 0), E('REQ-SYS', 0)],
  10: [E('CAP', 0, 'logical and behavioral model from the ConOps and architecture (provisional)'), E('SCN', 0), E('FN', 0), E('LOG', 0)],
  11: [E('PHY', 0, 'physical architecture and interfaces (provisional)'), E('INFO', 0), E('IF', 0)],
  12: [E('VER', 0, 'verification plans and the digital thread (provisional)'), E('EVD', 0)],
  13: [E('ANL', 0, 'model-based trade studies and impact analysis (provisional)'), E('DEC', 0)],
  14: [E('RID', 0, 'integrated model review and defence (provisional)')],
}

/** The fourteen milestones of a new project. */
export function newMilestones(): Milestone[] {
  return WEEKS.map((w) => ({ week: w.number, title: w.title, expected: EXPECTED[w.number] ?? [], state: 'not-started', aiStatement: '', notes: {}, exports: [] }))
}
export const weekTitle = (n: number) => WEEKS.find((w) => w.number === n)?.title ?? `Week ${n}`
export const weekOutput = (n: number) => WEEKS.find((w) => w.number === n)?.output ?? ''
export const phaseOf = (n: number) => (n <= 7 ? 'Phase I' : 'Phase II')
