// Practice → My Project handoff content (directive §8, roadmap §2.2), per week, built from the lecture's lab brief so
// no minimum is retyped. P1: Week 1. Later weeks add an entry here (P2).
import { LAB_MINIMUMS, LAB_MINIMUMS_THREE } from '../../content/lectures/week01/labBrief'

export type Handoff = {
  week: number
  /** What the student practised on AeroLink. */
  practised: string
  create: string[]
  prior: string[]
  howTo: string
  connects: string[]
  done: string[]
  evidence: string
  editor: { label: string; to: string }
  library: { label: string; to: string }[]
}

const M = LAB_MINIMUMS
export const HANDOFFS: Record<number, Handoff> = {
  1: {
    week: 1,
    practised: 'stakeholder analysis, the boundary and needs on the AeroLink case',
    create: [
      'The team charter: lead roles by initials, decision rules, norms, one owner per Week 1 prefix.',
      'The enterprise proposal: ENT-001, the problem statement, the mission MGO-001 (goals MGO-002 onward optional), the system of interest and at least ' + M.inside + ' elements inside its boundary (PRT).',
      `The context: at least ${M.context} external systems or actors (EXT), each with what crosses the boundary and the direction.`,
      `The stakeholder register: at least ${M.stakeholders} stakeholders (STK) in at least ${M.roleGroups} role groups, each with a specific concern (CON).`,
      `Relationships: at least ${M.relationships} REL rows, at least ${M.conflicts} of them a conflict.`,
      `Needs: at least ${M.needs} needs (NEED) from at least ${M.needSources} stakeholders (three-person team: ${LAB_MINIMUMS_THREE.needs} from ${LAB_MINIMUMS_THREE.needSources}).`,
    ],
    prior: ['None: Week 1 starts your project. Your register starts empty; nothing from AeroLink is copied unless you choose to.'],
    howTo: 'Open the Week 1 lab tool: every part is checked as you type and saved in your project. Each item then appears in My Project under Artifacts, with its ID, its checks and its history.',
    connects: ['Each concern belongs to a stakeholder; each need traces to its stakeholders, the concern it answers and the mission or a goal.', 'In Week 8 these same items become your model: stakeholders become part definitions, concerns become concerns, needs become requirements.'],
    done: ['The lab tool’s part checks pass: Team charter, Enterprise proposal, Context, Stakeholder register (with relationships), Initial needs, AI usage statement.', 'The instructor approves the enterprise proposal (recorded with its date in Part 2).'],
    evidence: 'The Week 1 Markdown record and the model-inputs JSON, exported from My Project (Export and import) or the lab tool, uploaded once per team to the LMS assignment.',
    editor: { label: 'Open the Week 1 lab tool', to: '/week/1/lab/tool' },
    library: [
      { label: 'Stakeholders in My Project', to: '/project/artifacts/STK' },
      { label: 'Needs in My Project', to: '/project/artifacts/NEED' },
      { label: 'How it maps in Week 8', to: '/project/model' },
    ],
  },
}
