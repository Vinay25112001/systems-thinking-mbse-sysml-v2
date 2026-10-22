// Reference-rail data for the Week 1 textbook (spec §d.5, LRN-12): "Definitions here" from the reviewed key terms
// (learn/week01.ts keyTerms; "course convention" where no source exists), "AeroLink at a glance" from the case data
// module only (aerolinkCase.ts, never DATA_SHEET), and "Used later" from MODEL_INPUTS, worded as a course working
// mapping. No new claims: every string is read from an existing module.
import { CASE_FACTS, CONFLICT, ENTERPRISE, EXTERNAL_SYSTEMS, MISSION_GOALS, NEEDS, ROLE_GROUP_LABEL, STAKEHOLDERS, SYSTEM_OF_INTEREST, priorityCounts } from '../../content/lectures/week01/aerolinkCase'
import { LEARN_SECTIONS, MODEL_INPUTS } from '../../content/learn/week01'
import type { Citation } from '../../content/readings'
import { FAA_NOTE } from './textbook'
import { studentProvenance, studentText } from './studentText'

export type Term = { term: string; def: string; source: Citation | 'course' }

/** Every reviewed key term of Week 1, by term name (one glossary). The "Generic concern" term cites a rubric code and the
 *  "Concern" term predates the SysML v2 definition now taught in 7.1, so both stay out of the student glossary. */
const EXCLUDED_TERMS = new Set(['Generic concern', 'Concern'])
export const TERMS: Term[] = LEARN_SECTIONS.flatMap((s) => s.keyTerms.items).filter((t) => !EXCLUDED_TERMS.has(t.term)).map((t) => ({ ...t, def: studentText(t.def) })) as Term[]
export const termByName = (name: string) => TERMS.find((t) => t.term === name)

export type Glance = { title: string; lines: string[] }
const roleGroups = () => {
  const counts = new Map<string, number>()
  for (const s of STAKEHOLDERS) counts.set(ROLE_GROUP_LABEL[s.roleGroup], (counts.get(ROLE_GROUP_LABEL[s.roleGroup]) ?? 0) + 1)
  return [...counts.entries()].map(([g, n]) => `${g}: ${n}`)
}
const pc = priorityCounts()

const RAW_GLANCE: Record<string, Glance> = {
  enterprise: { title: 'Enterprise', lines: [`${ENTERPRISE.name} (${ENTERPRISE.id}). ${ENTERPRISE.text}`] },
  soi: { title: 'System of interest', lines: [`${SYSTEM_OF_INTEREST.id}: ${SYSTEM_OF_INTEREST.name}.`, `Controlled by AeroLink: ${SYSTEM_OF_INTEREST.controlled.join(', ')}.`, `Needed but not controlled: ${SYSTEM_OF_INTEREST.wider.join(', ')}.`] },
  facts: { title: 'Teaching data', lines: CASE_FACTS.map(studentProvenance) },
  mission: { title: 'Mission and objectives', lines: [`Mission ${MISSION_GOALS[0].id}: ${MISSION_GOALS[0].name}.`, ...MISSION_GOALS.filter((m) => m.level === 'goal').map((m) => `Objective ${m.id}: ${m.name}.`)] },
  context: { title: 'External systems', lines: EXTERNAL_SYSTEMS.map((e) => `${e.id} ${e.name}: ${e.exchange}.`) },
  register: { title: 'Stakeholder register', lines: [`${STAKEHOLDERS.length} stakeholders, by role group:`, ...roleGroups()] },
  conflict: { title: 'Recorded conflict', lines: [`${CONFLICT.relationship}: ${CONFLICT.needsA.join(' and ')} against ${CONFLICT.needB}. Shared variable: ${CONFLICT.sharedVariable}.`] },
  needs: { title: 'Reference needs', lines: [`${NEEDS.length} needs, each traced to the mission or an objective.`, `Priorities: ${pc.mandatory} mandatory, ${pc.critical} critical, ${pc.desirable} desirable, ${pc.optional} optional.`] },
  faa: { title: 'Real and fictional', lines: [FAA_NOTE] },
}

/** Every rail line in the student wording (objectives, no lecture pointers; review M4A F1). */
export const GLANCE: Record<string, Glance> = Object.fromEntries(Object.entries(RAW_GLANCE).map(([k, g]) => [k, { title: studentText(g.title), lines: g.lines.map(studentText) }]))

/** "Used later": what a chapter's Week 1 items seed in the Week 8 model (MODEL_INPUTS, course working mapping). */
export function usedLater(rowIds: string[]): string[] {
  return rowIds.flatMap((id) => {
    const r = MODEL_INPUTS.rows.find((x) => x.id === id)
    return r ? [studentText(`${r.item} → ${r.seeds.map((s) => s.element).join('; ')} in the Week 8 model (course working mapping).`)] : []
  })
}
