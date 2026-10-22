// Binding an enterprise approval to the content the instructor approved (M2 review finding H1; directive §12). Pure and
// shared: the course server computes the approved content's fingerprint and decides the approval state; the browser
// uses the same field list to warn a student before an edit changes an approved proposal.
//
// APPROVAL_MATERIAL_FIELDS is the ONE place that says which fields are "material" to the approval. It is an integrator
// default awaiting faculty confirmation (FD item in docs/server/M2_BACKEND_REPORT.md): change the list here and both the
// server and the browser follow. Items are compared by artifact type; every active artifact of a listed type counts
// (creating or retiring one is a material change), and only the listed fields of it are compared. Everything else
// (stakeholders, concerns, needs, relationships, notes, review flags) never affects the approval.
import type { AttrValue, Operation, ProjectDoc } from './types'

export type MaterialSpec = { label: string; fields: readonly string[] }
export const APPROVAL_MATERIAL_FIELDS: Readonly<Record<string, MaterialSpec>> = {
  ENT: { label: 'Enterprise', fields: ['title', 'description', 'attributes.problem'] }, // name, description, problem statement
  MGO: { label: 'Mission and objectives', fields: ['title', 'description'] }, // MGO-001 is the mission; the others are objectives
  PRT: { label: 'Inside the system boundary', fields: ['title', 'description'] },
  EXT: { label: 'Outside the boundary (context)', fields: ['title', 'description', 'attributes.kind', 'attributes.crosses', 'attributes.direction'] },
}

/** The decision string the server mirrors into the document while an approved proposal has unreviewed material changes.
 *  The Week 1 readers treat any decision other than 'approved' / 'pending' as "not approved", which is the honest reading. */
export const CHANGED_SINCE_APPROVAL = 'changed-since-approval'
export const APPROVED_CHANGE_WARNING = 'This changes your approved proposal; it will need instructor re-review. Save this change?'

export type MaterialItem = { id: string; type: string; fields: Record<string, string> }
export type MaterialContent = MaterialItem[]

const text = (v: AttrValue | undefined): string => (v === undefined || v === null ? '' : typeof v === 'string' ? v.trim() : JSON.stringify(v))
function read(obj: unknown, path: string): AttrValue | undefined {
  let cur: unknown = obj
  for (const k of path.split('.')) {
    if (!cur || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[k]
  }
  return cur as AttrValue | undefined
}

/** The material content of a document, canonical (types in spec order, items by ID, fields in spec order), so equal
 *  content always serialises to the same string. Retired artifacts are not part of the proposal. */
export function materialContent(doc: ProjectDoc, spec: Readonly<Record<string, MaterialSpec>> = APPROVAL_MATERIAL_FIELDS): MaterialContent {
  const out: MaterialContent = []
  for (const [type, s] of Object.entries(spec)) {
    const items = Object.values(doc.artifacts ?? {})
      .filter((a) => a.type === type && a.status !== 'retired')
      .sort((a, b) => a.id.localeCompare(b.id))
    for (const a of items) {
      const fields: Record<string, string> = {}
      for (const f of s.fields) fields[f] = text(read(a, f))
      out.push({ id: a.id, type, fields })
    }
  }
  return out
}
export const canonicalMaterial = (doc: ProjectDoc) => JSON.stringify(materialContent(doc))

export type MaterialDiffRow = { id: string; type: string; field: string; approved: string; current: string; change: 'added' | 'removed' | 'changed' }
/** What differs between the approved and the current material content, field by field. */
export function materialDiff(approved: MaterialContent, current: MaterialContent): MaterialDiffRow[] {
  const rows: MaterialDiffRow[] = []
  const a = new Map(approved.map((x) => [x.id, x]))
  const c = new Map(current.map((x) => [x.id, x]))
  for (const x of approved) {
    const y = c.get(x.id)
    for (const [field, v] of Object.entries(x.fields)) {
      if (!y) {
        if (v) rows.push({ id: x.id, type: x.type, field, approved: v, current: '', change: 'removed' })
      } else if ((y.fields[field] ?? '') !== v) rows.push({ id: x.id, type: x.type, field, approved: v, current: y.fields[field] ?? '', change: 'changed' })
    }
    if (!y && !Object.values(x.fields).some(Boolean)) rows.push({ id: x.id, type: x.type, field: '', approved: '(empty)', current: '', change: 'removed' })
  }
  for (const y of current) {
    if (a.has(y.id)) continue
    const filled = Object.entries(y.fields).filter(([, v]) => v)
    if (!filled.length) rows.push({ id: y.id, type: y.type, field: '', approved: '', current: '(empty)', change: 'added' })
    for (const [field, v] of filled) rows.push({ id: y.id, type: y.type, field, approved: '', current: v, change: 'added' })
  }
  return rows
}

/** Whether operations may change the material content (the browser's early warning; the server decides on the actual
 *  content, so an edit that is typed and undone within one change set does not count there). */
export function touchesMaterial(doc: ProjectDoc, ops: Operation[], spec: Readonly<Record<string, MaterialSpec>> = APPROVAL_MATERIAL_FIELDS): boolean {
  for (const o of ops) {
    switch (o.op) {
      case 'create-artifact':
        if (spec[o.artifact.type]) return true
        break
      case 'update-artifact': {
        const a = doc.artifacts[o.uid]
        const s = a ? spec[a.type] : undefined
        if (s && o.fields.some((f) => s.fields.includes(f.path) && text(read(a, f.path)) !== text(f.after))) return true
        break
      }
      case 'retire-artifact':
      case 'restore-artifact':
      case 'renumber-artifact': {
        const a = doc.artifacts[o.uid]
        if (a && spec[a.type]) return true
        break
      }
      default:
        break
    }
  }
  return false
}
