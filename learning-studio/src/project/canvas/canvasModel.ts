// My Project canvas (M6; spec §f.3–§f.4): the pure operations every canvas view writes through. One canonical model:
// the Week 1 record parts go through the existing adapter (diffTeamRecord: IDs from the project counters, need traces
// parsed from the typed fields, REL drafts), and the M6 additions (enterprise description, assumptions and unknowns,
// conflicting concerns) are canonical operations written here. A view never keeps its own copy of the data.
import { normalizeTeam, type TeamRecord } from '../../workbench/week1/team'
import { diffTeamRecord, toTeamRecord } from '../adapters/week1'
import { makeArtifact, makeRelationship } from '../model/create'
import { formatId, nextNumber } from '../model/ids'
import { applyOps } from '../model/ops'
import type { Artifact, AttrValue, Operation, ProjectDoc, Provenance, Stamp } from '../model/types'

/** A record edit as canonical operations (the Week 1 parts). */
export function recordOps(doc: ProjectDoc, edit: Partial<TeamRecord> | ((r: TeamRecord) => TeamRecord), stamp: Stamp, provenance?: Provenance): Operation[] {
  const cur = toTeamRecord(doc)
  const next = typeof edit === 'function' ? edit(cur) : { ...cur, ...edit }
  return diffTeamRecord(doc, normalizeTeam(next), stamp, provenance)
}

const entOf = (doc: ProjectDoc) => Object.values(doc.artifacts).find((a) => a.type === 'ENT' && a.status === 'active')

/** The enterprise description (spec §f.2, FGS Part 7: a new field of ENT-001). Creates ENT-001 first if a project has
 *  none yet (through the record adapter, so the enterprise is created exactly as the lab tool creates it). */
export function setEnterpriseField(doc: ProjectDoc, field: 'description', value: string, stamp: Stamp): Operation[] {
  const ent = entOf(doc)
  if (ent) return ent[field] === value ? [] : [{ op: 'update-artifact', uid: ent.uid, fields: [{ path: field, before: ent[field], after: value }] }]
  const base = recordOps(doc, {}, stamp)
  const created = base.find((o) => o.op === 'create-artifact' && o.artifact.type === 'ENT') as { op: 'create-artifact'; artifact: Artifact } | undefined
  if (created) created.artifact = { ...created.artifact, [field]: value }
  return base
}

// ------------------------------------------------------------------------------------------- assumptions & unknowns
/** A25 (4): Week 1 records assumptions and unknowns (optional), each with a rationale, carried forward to Weeks 2–3.
 *  The existing A and U artifact types, tagged milestone 1 (spec MP-25). */
export type AuKind = 'A' | 'U'
export type AuFields = { title?: string; description?: string; rationale?: string }

export function createAu(doc: ProjectDoc, kind: AuKind, f: AuFields, stamp: Stamp): { ops: Operation[]; id: string } {
  const id = formatId(kind, nextNumber(doc, kind))
  const a = makeArtifact({ id, type: kind, title: f.title ?? '', description: f.description ?? '', rationale: f.rationale ?? '', stamp, week: 1 })
  return { ops: [{ op: 'create-artifact', artifact: a }], id }
}
export function updateArtifactFields(doc: ProjectDoc, uid: string, fields: Record<string, AttrValue | undefined>): Operation[] {
  const a = doc.artifacts[uid]
  if (!a) return []
  const read = (p: string): AttrValue | undefined => p.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), a) as AttrValue | undefined
  const changes = Object.entries(fields)
    .filter(([p, v]) => JSON.stringify(read(p) ?? null) !== JSON.stringify(v ?? null))
    .map(([path, after]) => ({ path, before: read(path), after }))
  return changes.length ? [{ op: 'update-artifact', uid, fields: changes }] : []
}
export const retireOps = (uid: string, reason: string): Operation[] => [{ op: 'retire-artifact', uid, reason }]

/** "A-001 affects NEED-003" (the vocabulary's affects rule, A/U → any): what the assumption or unknown bears on. */
export function linkAffects(doc: ProjectDoc, fromUid: string, toUid: string, stamp: Stamp): Operation[] {
  if (Object.values(doc.relationships).some((r) => r.status !== 'retired' && r.type === 'affects' && r.from === fromUid && r.to === toUid)) return []
  return [{ op: 'create-relationship', relationship: makeRelationship({ id: formatId('LNK', nextNumber(doc, 'LNK')), category: 'trace', type: 'affects', from: fromUid, to: toUid, stamp }) }]
}

// ------------------------------------------------------------------------------------------- conflicting concerns
/** Directive §14 "conflicting concerns": CON conflicts-with CON (trace category, LNK ID, symmetric) with its rationale
 *  ("what pulls against what"). Integrity refuses a self-link, a duplicate either way round and any other pair. */
export function addConcernConflict(doc: ProjectDoc, fromUid: string, toUid: string, rationale: string, stamp: Stamp): Operation[] {
  return [{ op: 'create-relationship', relationship: makeRelationship({ id: formatId('LNK', nextNumber(doc, 'LNK')), category: 'trace', type: 'conflicts-with', from: fromUid, to: toUid, rationale, stamp }) }]
}
export const retireRelationshipOps = (uid: string, reason: string): Operation[] => [{ op: 'retire-relationship', uid, reason }]
export function setRelationshipRationale(doc: ProjectDoc, uid: string, rationale: string): Operation[] {
  const r = doc.relationships[uid]
  if (!r || (r.rationale ?? '') === rationale) return []
  return [{ op: 'update-relationship', uid, fields: [{ path: 'rationale', before: r.rationale, after: rationale }] }]
}

/** Dry run: the reason a set of operations would be refused, or null (used to disable a button with a message). */
export function refusal(doc: ProjectDoc, ops: Operation[], stamp: Stamp): string | null {
  const r = applyOps(doc, ops, { at: stamp.at, by: stamp.by, change: stamp.change })
  return r.ok ? null : r.error
}

// ------------------------------------------------------------------------------------------- reading
export const activeOf = (doc: ProjectDoc, type: Artifact['type']) =>
  Object.values(doc.artifacts)
    .filter((a) => a.type === type && a.status === 'active')
    .sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }))
export const byCourseId = (doc: ProjectDoc, id: string) => Object.values(doc.artifacts).find((a) => a.id === id && a.status === 'active')
export const str = (v: AttrValue | undefined) => (typeof v === 'string' ? v : v === undefined || v === null ? '' : String(v))
