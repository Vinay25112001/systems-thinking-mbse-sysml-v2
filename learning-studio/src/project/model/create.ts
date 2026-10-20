// Building blocks for new documents and artifacts. A new project starts EMPTY: no seeded stakeholders, no reference
// model, no example text (architecture §6.2). Only ENT-001 and the mission MGO-001 exist, both blank.
import { newMilestones } from './milestones'
import { newUid } from './ids'
import { relPrefix } from './vocabulary'
import { APP_NAME, NO_REVIEW, OWN, SCHEMA_VERSION, UNCHECKED, type Artifact, type ArtifactType, type AttrValue, type ProjectDoc, type Provenance, type Relationship, type RelationshipCategory, type RelationshipType, type Stamp } from './types'

export const APP_VERSION = '0.0.0'
export const EMPTY_STAMP: Stamp = { at: '', by: '', change: '' }

export function makeArtifact(p: { id: string; type: ArtifactType; title?: string; description?: string; attributes?: Record<string, AttrValue>; rationale?: string; provenance?: Provenance; stamp: Stamp; uid?: string; week?: number }): Artifact {
  return {
    uid: p.uid ?? newUid(),
    id: p.id,
    type: p.type,
    title: p.title ?? '',
    description: p.description ?? '',
    attributes: p.attributes ?? {},
    status: 'active',
    provenance: p.provenance ?? OWN,
    ...(p.rationale !== undefined ? { rationale: p.rationale } : {}),
    validation: UNCHECKED,
    review: NO_REVIEW,
    milestones: [p.week ?? 1],
    aiAssisted: false,
    unresolvedRefs: [],
    formerIds: [],
    created: p.stamp,
    revised: p.stamp,
    revision: 1,
  }
}

export function makeRelationship(p: { id: string; category: RelationshipCategory; type: RelationshipType | ''; from: string; to: string; stamp: Stamp; note?: string; attributes?: Record<string, AttrValue>; draft?: boolean; provenance?: Provenance; uid?: string; rationale?: string }): Relationship {
  return {
    uid: p.uid ?? newUid(),
    id: p.id,
    category: p.category,
    type: p.type,
    from: p.from,
    to: p.to,
    ...(p.note !== undefined ? { note: p.note } : {}),
    ...(p.rationale !== undefined ? { rationale: p.rationale } : {}),
    ...(p.attributes ? { attributes: p.attributes } : {}),
    ...(p.draft ? { draft: true } : {}),
    status: 'active',
    provenance: p.provenance ?? OWN,
    created: p.stamp,
    revised: p.stamp,
  }
}
export { relPrefix }

export type NewProjectOptions = { teamLabel?: string; initials?: string; enterpriseName?: string; at?: string }

/** An empty project: the team, the 14 milestones, ENT-001 (named if a working name is given) and a blank mission. */
export function emptyProject(o: NewProjectOptions = {}): ProjectDoc {
  const at = o.at ?? new Date().toISOString()
  const stamp: Stamp = { at, by: (o.initials ?? '').toUpperCase(), change: 'CHG-000000' }
  const ent = makeArtifact({ id: 'ENT-001', type: 'ENT', title: o.enterpriseName?.trim() ?? '', attributes: { domain: '', problem: '', suitability: '', soi: '', approval: { decision: '', decidedOn: '' } }, stamp })
  const mission = makeArtifact({ id: 'MGO-001', type: 'MGO', title: 'Mission', attributes: { level: 'mission' }, stamp })
  const initials = (o.initials ?? '').trim().toUpperCase()
  return {
    schemaVersion: SCHEMA_VERSION,
    project: {
      uid: newUid(),
      title: '',
      createdAt: at,
      updatedAt: at,
      createdWith: { app: APP_NAME, version: APP_VERSION },
      course: { teamLabel: o.teamLabel?.trim() ?? '' },
      model: { purpose: '', options: { assessment: true, relationships: 'all' } },
    },
    team: { label: o.teamLabel?.trim() ?? '', threePersonTeam: false, members: initials ? [{ initials, active: true }] : [], roles: {}, decisionRules: '', norms: '', prefixOwnership: {}, prefixesText: '' },
    artifacts: { [ent.uid]: ent, [mission.uid]: mission },
    relationships: {},
    milestones: newMilestones(),
    modelElements: {},
    mappings: {},
    findings: [],
    issued: { ENT: 1, MGO: 1, CHG: 0, SNP: 0 },
    rev: 0,
  }
}

/** The project's display title: its own title, else the enterprise name, else the team label. */
export function projectTitle(doc: ProjectDoc): string {
  const ent = Object.values(doc.artifacts).find((a) => a.type === 'ENT')
  return doc.project.title.trim() || ent?.title.trim() || (doc.team.label.trim() ? `Team ${doc.team.label.trim()} project` : 'My project')
}
export const enterpriseOf = (doc: ProjectDoc) => Object.values(doc.artifacts).find((a) => a.type === 'ENT')
export const artifactById = (doc: ProjectDoc, id: string) => Object.values(doc.artifacts).find((a) => a.id === id)
export const activeOfType = (doc: ProjectDoc, type: ArtifactType) => Object.values(doc.artifacts).filter((a) => a.type === type && a.status === 'active')
/** Title shown in lists: the name, else the start of the statement, else "(untitled)". */
export function displayTitle(a: Artifact): string {
  const t = a.title.trim() || a.description.trim()
  return t ? (t.length > 90 ? `${t.slice(0, 88)}…` : t) : '(not written yet)'
}
export const relationshipCategoryPrefix = (c: RelationshipCategory) => relPrefix(c)
