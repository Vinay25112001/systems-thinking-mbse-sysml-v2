// Applying operations to a project document (data model §8). Pure and immutable: applyOps returns a new document or
// the reason the whole change set was refused (nothing changes). Every operation carries its `before` values, so a
// change set can be shown as a diff and inverted (undo) without consulting anything else.
import { checkOp } from './integrity'
import { numOf, prefixOf } from './ids'
import { relPrefix } from './vocabulary'
import { type Artifact, type AttrValue, type ChangeSet, type ChangeSource, type FieldChange, type Operation, type ProjectDoc, type Relationship, type Stamp } from './types'

export type OpContext = { at: string; by: string; change: string }
export type ApplyResult = { ok: true; doc: ProjectDoc } | { ok: false; error: string }

// ------------------------------------------------------------------------------------------------ dotted paths
export function getPath(obj: unknown, path: string): AttrValue | undefined {
  let cur: unknown = obj
  for (const k of path.split('.')) {
    if (!cur || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[k]
  }
  return cur as AttrValue | undefined
}
export function setPath<T>(obj: T, path: string, value: unknown): T {
  const [k, ...rest] = path.split('.')
  const src = (obj && typeof obj === 'object' ? obj : {}) as Record<string, unknown>
  const next = { ...src }
  if (rest.length) next[k] = setPath(src[k], rest.join('.'), value)
  else if (value === undefined) delete next[k]
  else next[k] = value
  return next as T
}
const applyFields = <T,>(obj: T, fields: FieldChange[]) => fields.reduce((o, f) => setPath(o, f.path, f.after), obj)
export const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
/** Field changes that turn `before` into `after` for the given paths (only paths that differ). */
export function fieldDiff(before: unknown, after: Record<string, unknown>): FieldChange[] {
  return Object.entries(after)
    .filter(([p, v]) => !same(getPath(before, p), v))
    .map(([path, v]) => ({ path, before: getPath(before, path), after: v as AttrValue }))
}

/** Week 1 artifact types: an operation on one of them changes the Week 1 content (Milestone 1 contentUpdatedAt). */
const WEEK1 = new Set(['ENT', 'PRT', 'EXT', 'STK', 'CON', 'MGO', 'NEED'])

// ------------------------------------------------------------------------------------------------ apply
export function applyOps(doc: ProjectDoc, ops: Operation[], ctx: OpContext): ApplyResult {
  const issuedAtStart = doc.issued
  let d: ProjectDoc = { ...doc, artifacts: { ...doc.artifacts }, relationships: { ...doc.relationships }, milestones: [...doc.milestones], issued: { ...doc.issued }, mappings: { ...doc.mappings }, modelElements: { ...doc.modelElements } }
  const touched = new Set<string>()
  const created = new Set<string>()
  let week1 = false
  const bump = (prefix: string, id: string) => (d.issued[prefix] = Math.max(d.issued[prefix] ?? 0, numOf(id)))
  const stamp: Stamp = { at: ctx.at, by: ctx.by, change: ctx.change }
  const setArt = (a: Artifact) => {
    d.artifacts[a.uid] = a
    touched.add(a.uid)
    if (WEEK1.has(a.type)) week1 = true
  }
  const setRel = (r: Relationship) => {
    d.relationships[r.uid] = r
    const ends = [d.artifacts[r.from], d.artifacts[r.to]]
    if (r.category === 'stakeholder' || ends.some((a) => a && WEEK1.has(a.type))) week1 = true
  }
  for (const op of ops) {
    const err = checkOp(d, op, issuedAtStart)
    if (err) return { ok: false, error: err }
    switch (op.op) {
      case 'create-artifact':
        d.artifacts[op.artifact.uid] = op.artifact
        created.add(op.artifact.uid)
        if (WEEK1.has(op.artifact.type)) week1 = true
        bump(op.artifact.type, op.artifact.id)
        break
      case 'update-artifact':
        setArt(applyFields(d.artifacts[op.uid], op.fields))
        break
      case 'retire-artifact':
        setArt({ ...d.artifacts[op.uid], status: 'retired', retired: { at: ctx.at, reason: op.reason, by: ctx.by } })
        break
      case 'restore-artifact': {
        const { retired: _r, ...rest } = d.artifacts[op.uid]
        void _r
        setArt({ ...rest, status: 'active' })
        break
      }
      case 'renumber-artifact': {
        const a = d.artifacts[op.uid]
        setArt({ ...a, id: op.to, formerIds: [...a.formerIds, op.from] })
        bump(prefixOf(op.to), op.to)
        break
      }
      case 'create-relationship':
        setRel(op.relationship)
        bump(relPrefix(op.relationship.category), op.relationship.id)
        break
      case 'update-relationship':
        setRel({ ...applyFields(d.relationships[op.uid], op.fields), revised: stamp })
        break
      case 'retire-relationship':
        setRel({ ...d.relationships[op.uid], status: 'retired', retired: { at: ctx.at, reason: op.reason, by: ctx.by }, revised: stamp })
        break
      case 'set-review':
        if (op.kind === 'artifact') d.artifacts[op.uid] = { ...d.artifacts[op.uid], review: op.after }
        else d.relationships[op.uid] = { ...d.relationships[op.uid] }
        break
      case 'update-team':
        d.team = applyFields(d.team, op.fields)
        week1 = true
        break
      case 'update-project':
        d.project = applyFields(d.project, op.fields)
        break
      case 'update-milestone':
        d.milestones = d.milestones.map((m) => (m.week === op.week ? applyFields(m, op.fields) : m))
        if (op.week === 1 && op.fields.some((f) => f.path === 'aiStatement')) week1 = true
        break
      case 'upsert-mapping':
        d.mappings[op.mapping.uid] = op.mapping
        bump('MAP', op.mapping.id)
        break
      case 'upsert-model-element':
        d.modelElements[op.element.uid] = op.element
        bump('MEL', op.element.id)
        break
    }
  }
  for (const uid of touched) {
    const a = d.artifacts[uid]
    if (a && !created.has(uid)) d.artifacts[uid] = { ...a, revised: stamp, revision: a.revision + 1 }
  }
  d = { ...d, project: { ...d.project, updatedAt: ctx.at } }
  if (week1) d.milestones = d.milestones.map((m) => (m.week === 1 ? { ...m, contentUpdatedAt: ctx.at } : m))
  return { ok: true, doc: d }
}

// ------------------------------------------------------------------------------------------------ invert (undo)
/** The operations that undo `ops` (applied in order). There is no delete operation (I13): undoing a creation retires
 *  the item, so its ID stays taken. */
export function invertOps(doc: ProjectDoc, ops: Operation[], reason: string): Operation[] {
  const swap = (fs: FieldChange[]) => fs.map((f) => ({ path: f.path, before: f.after, after: f.before }))
  const out: Operation[] = []
  for (const op of [...ops].reverse()) {
    switch (op.op) {
      case 'create-artifact':
        if (doc.artifacts[op.artifact.uid]?.status === 'active') out.push({ op: 'retire-artifact', uid: op.artifact.uid, reason })
        break
      case 'update-artifact':
        out.push({ op: 'update-artifact', uid: op.uid, fields: swap(op.fields) })
        break
      case 'retire-artifact':
        out.push({ op: 'restore-artifact', uid: op.uid })
        break
      case 'restore-artifact':
        out.push({ op: 'retire-artifact', uid: op.uid, reason })
        break
      case 'renumber-artifact':
        break // a renumbered ID is never given back (I3)
      case 'create-relationship':
        if (doc.relationships[op.relationship.uid]?.status !== 'retired') out.push({ op: 'retire-relationship', uid: op.relationship.uid, reason })
        break
      case 'update-relationship':
        out.push({ op: 'update-relationship', uid: op.uid, fields: swap(op.fields) })
        break
      case 'retire-relationship':
        out.push({ op: 'update-relationship', uid: op.uid, fields: [{ path: 'status', before: 'retired', after: 'suspect' }] })
        break
      case 'set-review':
        out.push({ ...op, before: op.after, after: op.before })
        break
      case 'update-team':
      case 'update-project':
        out.push({ ...op, fields: swap(op.fields) })
        break
      case 'update-milestone':
        out.push({ ...op, fields: swap(op.fields) })
        break
      default:
        break
    }
  }
  return out
}

// ------------------------------------------------------------------------------------------------ summaries
const idOf = (doc: ProjectDoc, uid: string) => doc.artifacts[uid]?.id ?? doc.relationships[uid]?.id ?? uid
const FIELD: Record<string, string> = { title: 'name', description: 'text', rationale: 'rationale', 'attributes.domain': 'domain', 'attributes.problem': 'problem statement', 'attributes.soi': 'system of interest', 'attributes.suitability': 'suitability', 'attributes.approval': 'instructor decision', 'attributes.sourcesText': 'sources', 'attributes.concernsText': 'concerns', 'attributes.goalText': 'goal', 'attributes.selfCheck': 'self-check', 'attributes.priority': 'priority' }
const fieldName = (p: string) => FIELD[p] ?? p.replace(/^attributes\./, '')

/** A generated, readable summary of a change set ("Edited STK-003 name; added NEED-004"). */
export function summarize(doc: ProjectDoc, ops: Operation[]): string {
  const parts: string[] = []
  const created = ops.filter((o) => o.op === 'create-artifact').map((o) => (o as { artifact: Artifact }).artifact.id)
  if (created.length) parts.push(`Added ${created.slice(0, 4).join(', ')}${created.length > 4 ? ` and ${created.length - 4} more` : ''}`)
  const edits = new Map<string, Set<string>>()
  for (const o of ops) if (o.op === 'update-artifact') for (const f of o.fields) edits.set(idOf(doc, o.uid), (edits.get(idOf(doc, o.uid)) ?? new Set()).add(fieldName(f.path)))
  for (const [id, fs] of [...edits].slice(0, 3)) parts.push(`Edited ${id} ${[...fs].join(', ')}`)
  if (edits.size > 3) parts.push(`edited ${edits.size - 3} more`)
  const retired = ops.filter((o) => o.op === 'retire-artifact').map((o) => idOf(doc, (o as { uid: string }).uid))
  if (retired.length) parts.push(`Retired ${retired.join(', ')}`)
  const rels = ops.filter((o) => o.op === 'create-relationship').length
  if (rels) parts.push(`${rels} relationship${rels > 1 ? 's' : ''} added`)
  if (ops.some((o) => o.op === 'update-team')) parts.push('Edited the team charter')
  if (ops.some((o) => o.op === 'update-milestone')) parts.push('Updated the milestone record')
  if (ops.some((o) => o.op === 'set-review')) parts.push('Review flags updated')
  return parts.join('; ') || 'No change'
}

export const makeChangeSet = (id: string, at: string, by: string, source: ChangeSource, summary: string, ops: Operation[], rev: number, rationale?: string): ChangeSet => ({ id, at, by, source, summary, ...(rationale ? { rationale } : {}), ops, rev })
