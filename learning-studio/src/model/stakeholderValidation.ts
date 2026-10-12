// Acceptance checks for the Stakeholder Ecosystem Map, taken from LABORATORY_AND_CAPSTONE_PLAN.md
// (Lab L2 and checkpoint CP1 minimum scope). These are course rules [REC], not an external standard.
import { OFFICIAL_STAKEHOLDER_IDS, type Relationship, type Stakeholder } from './airtaxi'

export type Check = { id: string; label: string; passed: boolean; detail: string; source: string }

export const MIN_STAKEHOLDERS = 12
export const MIN_CATEGORIES = 4
export const MIN_STAKEHOLDER_RELATIONSHIPS = 5

export function validateStakeholderMap(stakeholders: Stakeholder[], relationships: Relationship[]): Check[] {
  const ids = new Set(stakeholders.map((s) => s.id))
  const categories = new Set(stakeholders.map((s) => s.category))
  const missingOfficial = OFFICIAL_STAKEHOLDER_IDS.filter((id) => !ids.has(id))
  const incomplete = stakeholders.filter((s) => s.concern.trim().length < 10 || s.rationale.trim().length < 10)
  const stkRels = relationships.filter((r) => ids.has(r.source) && ids.has(r.target) && r.source !== r.target)
  const conflicts = stkRels.filter((r) => r.type === 'conflicts-with')
  const dangling = relationships.filter((r) => !(ids.has(r.source) || r.source === 'ENT-001') || !(ids.has(r.target) || r.target === 'ENT-001'))
  const badRatings = stakeholders.filter((s) => ![s.interest, s.influence].every((v) => Number.isInteger(v) && v >= 1 && v <= 5))

  return [
    {
      id: 'count',
      label: `At least ${MIN_STAKEHOLDERS} stakeholders`,
      passed: stakeholders.length >= MIN_STAKEHOLDERS,
      detail: `${stakeholders.length} identified`,
      source: 'Lab L2 / CP1 minimum scope',
    },
    {
      id: 'categories',
      label: `Stakeholders span at least ${MIN_CATEGORIES} categories`,
      passed: categories.size >= MIN_CATEGORIES,
      detail: `${categories.size} categories used`,
      source: 'Lab L2 / CP1 minimum scope',
    },
    {
      id: 'official',
      label: 'Includes the six external entities named in the lab sheet (S04 Lab 2A)',
      passed: missingOfficial.length === 0,
      detail: missingOfficial.length ? `Missing: ${missingOfficial.join(', ')}` : 'All present',
      source: 'S04 Lab 2A',
    },
    {
      id: 'characterised',
      label: 'Every stakeholder has a specific concern and a rating rationale',
      passed: incomplete.length === 0 && stakeholders.length > 0,
      detail: incomplete.length ? `${incomplete.length} incomplete: ${incomplete.map((s) => s.id).join(', ')}` : 'All characterised',
      source: 'RB-1.3 (concerns, influence, rationale)',
    },
    {
      id: 'ratings',
      label: 'Interest and influence ratings are integers from 1 to 5',
      passed: badRatings.length === 0,
      detail: badRatings.length ? `Invalid: ${badRatings.map((s) => s.id).join(', ')}` : 'Valid',
      source: 'Course convention',
    },
    {
      id: 'relationships',
      label: `At least ${MIN_STAKEHOLDER_RELATIONSHIPS} stakeholder-to-stakeholder relationships`,
      passed: stkRels.length >= MIN_STAKEHOLDER_RELATIONSHIPS,
      detail: `${stkRels.length} present`,
      source: 'Lab L2 acceptance criteria',
    },
    {
      id: 'conflict',
      label: 'At least one conflict between stakeholder concerns is identified',
      passed: conflicts.length >= 1,
      detail: `${conflicts.length} conflict relationship(s)`,
      source: 'Objective B2.3; RB-1.3',
    },
    {
      id: 'integrity',
      label: 'No relationship refers to a deleted element',
      passed: dangling.length === 0,
      detail: dangling.length ? `Dangling: ${dangling.map((r) => r.id).join(', ')}` : 'Referentially consistent',
      source: 'Model integrity',
    },
  ]
}

/** Power–interest quadrant (Mendelow-style grid: an external convention, not in the course source collection). */
export function quadrant(s: Pick<Stakeholder, 'interest' | 'influence'>): 'Manage closely' | 'Keep satisfied' | 'Keep informed' | 'Monitor' {
  const hiInf = s.influence >= 3
  const hiInt = s.interest >= 3
  if (hiInf && hiInt) return 'Manage closely'
  if (hiInf) return 'Keep satisfied'
  if (hiInt) return 'Keep informed'
  return 'Monitor'
}
