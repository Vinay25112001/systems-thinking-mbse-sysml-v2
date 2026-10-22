// Week 1 traceability relations (directive §14; spec §k.1, CNT-01). Course conventions for engineering traceability,
// not SysML relationships: each student-facing relation is derived from a stored relationship plus the types of its
// ends, so nothing is stored twice and every view (map, table, detail panel) reads the same canonical model.
//
//   stakeholder has concern          CON  derives-from STK   (trace; shown STK → CON)
//   stakeholder expresses need       NEED derives-from STK   (trace; shown STK → NEED)
//   need supports mission/objective  NEED derives-from MGO   (trace; shown NEED → MGO)
//   concern motivates need           NEED derives-from CON   (trace; shown CON → NEED)
//   stakeholder influences stakeholder  REL, one of the seven stakeholder types ("influences" is the umbrella label)
//   conflicting concerns             CON  conflicts-with CON (trace, symmetric; new in M6)
//   objective refines mission        MGO  derives-from MGO-001
//   enterprise contains element      ENT  contains PRT
//   artifact has documented rationale  an attribute (Artifact.rationale / Relationship.rationale), not a link
import { VOCABULARY } from './vocabulary'
import type { Artifact, ArtifactType, ProjectDoc, Relationship } from './types'

export type Week1RelationKind = 'has-concern' | 'expresses-need' | 'supports-objective' | 'motivates-need' | 'influences' | 'conflicting-concerns' | 'refines-mission' | 'contains'

export type Week1RelationInfo = {
  kind: Week1RelationKind
  /** Student label of the relation, e.g. "concern motivates need". */
  label: string
  /** The verb between the two shown ends ("motivates"). */
  verb: string
  /** One-line definition (course convention). */
  definition: string
  /** Which artifact types it joins, in the order it is read. */
  reads: [ArtifactType, ArtifactType]
  /** How it is stored, for the curious reader (never SysML keywords). */
  stored: string
  /** Where it is created in My Project. */
  createdIn: string
}

export const WEEK1_RELATIONS: Record<Week1RelationKind, Week1RelationInfo> = {
  'has-concern': { kind: 'has-concern', label: 'stakeholder has concern', verb: 'has concern', definition: 'The concern belongs to this stakeholder: it is what the stakeholder wants the system of interest to address.', reads: ['STK', 'CON'], stored: 'CON derives from STK', createdIn: 'Concerns: the holder of each concern' },
  'expresses-need': { kind: 'expresses-need', label: 'stakeholder expresses need', verb: 'expresses', definition: 'The stakeholder is a source of the need: the need is stated from their point of view.', reads: ['STK', 'NEED'], stored: 'NEED derives from STK', createdIn: 'Needs: source stakeholders' },
  'supports-objective': { kind: 'supports-objective', label: 'need supports mission or objective', verb: 'supports', definition: 'Meeting the need helps the enterprise achieve the mission or an objective.', reads: ['NEED', 'MGO'], stored: 'NEED derives from MGO', createdIn: 'Needs: mission or objective' },
  'motivates-need': { kind: 'motivates-need', label: 'concern motivates need', verb: 'motivates', definition: 'The need answers the concern: without the concern there would be no reason for the need.', reads: ['CON', 'NEED'], stored: 'NEED derives from CON', createdIn: 'Needs: concerns it answers' },
  influences: { kind: 'influences', label: 'stakeholder influences stakeholder', verb: 'influences', definition: 'One of seven typed relations between stakeholders (regulates, funds, supplies, is affected by, partners with, coordinates with, conflicts with).', reads: ['STK', 'STK'], stored: 'REL row', createdIn: 'Relationships' },
  'conflicting-concerns': { kind: 'conflicting-concerns', label: 'conflicting concerns', verb: 'conflicts with', definition: 'Addressing one concern makes the other harder to address; the conflict is recorded so the team can resolve it with the stakeholders.', reads: ['CON', 'CON'], stored: 'CON conflicts with CON', createdIn: 'Concerns or Relationships: conflicting concerns' },
  'refines-mission': { kind: 'refines-mission', label: 'objective refines mission', verb: 'refines', definition: 'The objective is part of what the mission is broken into.', reads: ['MGO', 'MGO'], stored: 'MGO derives from MGO-001', createdIn: 'Enterprise & mission: objectives' },
  contains: { kind: 'contains', label: 'enterprise contains element', verb: 'contains', definition: 'The element is inside the boundary of the system of interest.', reads: ['ENT', 'PRT'], stored: 'ENT contains PRT', createdIn: 'Boundary & context' },
}

export type Week1Relation = {
  rel: Relationship
  kind: Week1RelationKind
  /** The end read first (e.g. the concern in "CON-011 motivates NEED-010"), and the end read second. */
  first: Artifact | undefined
  second: Artifact | undefined
  /** "CON-011 motivates NEED-010"; for a REL row the stakeholder verb ("STK-002 regulates STK-005"). */
  sentence: string
  draft: boolean
}

/** The §14 kind of a stored relationship, or null when it is not a Week 1 relation. */
export function week1KindOf(doc: ProjectDoc, r: Relationship): Week1RelationKind | null {
  if (r.category === 'stakeholder') return 'influences'
  const a = doc.artifacts[r.from]?.type
  const b = doc.artifacts[r.to]?.type
  if (r.type === 'conflicts-with' && a === 'CON' && b === 'CON') return 'conflicting-concerns'
  if (r.type === 'contains' && a === 'ENT' && b === 'PRT') return 'contains'
  if (r.type !== 'derives-from') return null
  if (a === 'CON' && b === 'STK') return 'has-concern'
  if (a === 'NEED' && b === 'STK') return 'expresses-need'
  if (a === 'NEED' && b === 'MGO') return 'supports-objective'
  if (a === 'NEED' && b === 'CON') return 'motivates-need'
  if (a === 'MGO' && b === 'MGO') return 'refines-mission'
  return null
}

/** Kinds stored "dependent derives from source": shown the other way round (source first). */
const REVERSED = new Set<Week1RelationKind>(['has-concern', 'expresses-need', 'motivates-need'])

/** Every live Week 1 relation of the project (retired relationships left out), in a stable order. */
export function week1Relations(doc: ProjectDoc): Week1Relation[] {
  const out: Week1Relation[] = []
  for (const r of Object.values(doc.relationships)) {
    if (r.status === 'retired') continue
    const kind = week1KindOf(doc, r)
    if (!kind) continue
    const from = doc.artifacts[r.from]
    const to = doc.artifacts[r.to]
    const [first, second] = REVERSED.has(kind) ? [to, from] : [from, to]
    const verb = kind === 'influences' ? (r.type ? VOCABULARY[r.type].verb : '(type not chosen)') : WEEK1_RELATIONS[kind].verb
    const firstLabel = first?.id ?? (kind === 'influences' ? String(r.attributes?.fromText ?? '') || '(from not set)' : '(missing)')
    const secondLabel = second?.id ?? (kind === 'influences' ? String(r.attributes?.toText ?? '') || '(to not set)' : '(missing)')
    out.push({ rel: r, kind, first, second, sentence: `${firstLabel} ${verb} ${secondLabel}`, draft: !!r.draft })
  }
  return out.sort((x, y) => x.rel.id.localeCompare(y.rel.id, 'en', { numeric: true }))
}

/** §14 "an artifact has documented rationale": a rationale of at least a few words (presence, not quality). */
export const hasRationale = (a: Pick<Artifact, 'rationale'> | Pick<Relationship, 'rationale'>) => (a.rationale ?? '').trim().split(/\s+/).filter(Boolean).length >= 3

/** The concern pairs recorded as conflicting (each pair once, whichever way it was stored). */
export function concernConflicts(doc: ProjectDoc): { rel: Relationship; a: Artifact; b: Artifact }[] {
  return Object.values(doc.relationships)
    .filter((r) => r.status !== 'retired' && r.type === 'conflicts-with' && r.category === 'trace')
    .map((r) => ({ rel: r, a: doc.artifacts[r.from], b: doc.artifacts[r.to] }))
    .filter((x): x is { rel: Relationship; a: Artifact; b: Artifact } => !!x.a && !!x.b)
}
