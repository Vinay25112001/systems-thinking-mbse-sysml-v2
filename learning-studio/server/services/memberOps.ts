// What the server does to a member's operations before they touch the stored document (M2 review M1, M2, L1). Pure
// functions over the shared model; services/projects.ts calls them inside the write transaction.
//   serverBefores  every `before` value recomputed from the stored document (forged history is impossible)
//   serverDerive   the side-effect operations the browser should have derived, appended when it did not
//   newProblems    the integrity problems a write would newly introduce (validateProject before vs after)
//   normMapping / normElement / upsertProblem   allow-listed shapes, safe uids and the ID rules for MAP and MEL items
import { deriveOps } from '../../src/project/model/commit'
import { ID_RE, numOf } from '../../src/project/model/ids'
import { validateProject, type Issue } from '../../src/project/model/integrity'
import { getPath, setPath, type OpContext } from '../../src/project/model/ops'
import { MAPPING_STATUSES, NO_REVIEW, type FieldChange, type ModelElement, type ModelMapping, type Operation, type ProjectDoc, type Stamp } from '../../src/project/model/types'
import { isWeek8Package } from '../../src/project/model/week8Packages'
import { badRequest, isObj, str } from '../http/core'

// ------------------------------------------------------------------------------------------- mappings, model elements
const SAFE_UID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/
const RESERVED_UIDS = new Set(['constructor', 'prototype', 'hasOwnProperty', 'toString', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString'])
function safeUid(x: unknown, f: string): string {
  const v = str(x, f, 100, { min: 1 })
  if (!SAFE_UID.test(v) || RESERVED_UIDS.has(v)) throw badRequest(`${f} is not a valid uid.`)
  return v
}
const optStr = (x: unknown, f: string, max: number) => (x === undefined || x === null ? '' : str(x, f, max))
function strList(x: unknown, f: string, maxItems: number, maxLen: number): string[] {
  if (x === undefined || x === null) return []
  if (!Array.isArray(x) || x.length > maxItems) throw badRequest(`${f} must be a list of at most ${maxItems} texts.`)
  return x.map((y, i) => str(y, `${f}[${i}]`, maxLen))
}
function int(x: unknown, f: string, min: number, max: number): number {
  const v = Number(x ?? min)
  if (!Number.isInteger(v) || v < min || v > max) throw badRequest(`${f} must be a whole number from ${min} to ${max}.`)
  return v
}
function stampOf(x: unknown, f: string): Stamp | undefined {
  if (x === undefined || x === null) return undefined
  if (!isObj(x)) throw badRequest(`${f} must be a stamp.`)
  return { at: str(x.at, `${f}.at`, 40), by: str(x.by, `${f}.by`, 8), change: str(x.change, `${f}.change`, 20) }
}

export function normMapping(x: unknown, f: string): ModelMapping {
  if (!isObj(x)) throw badRequest(`${f} must be a mapping.`)
  const id = str(x.id, `${f}.id`, 20)
  if (!ID_RE('MAP').test(id)) throw badRequest(`${f}.id is not a MAP ID (I2).`)
  const status = String(x.status ?? 'not-mapped') as ModelMapping['status']
  if (!MAPPING_STATUSES.includes(status)) throw badRequest(`${f}.status is not a mapping status.`)
  const confirmedBy = stampOf(x.confirmedBy, `${f}.confirmedBy`)
  // M7 (additive): the Week 8 lab tool's chosen package and the Week 1 item as it was when the mapping was confirmed
  const pkg = optStr(x.pkg, `${f}.pkg`, 200)
  if (pkg && !isWeek8Package(pkg)) throw badRequest(`${f}.pkg is not a package of the course working mapping.`)
  if (x.source !== undefined && x.source !== null && !isObj(x.source)) throw badRequest(`${f}.source must be an object.`)
  const source = isObj(x.source) ? { id: str(x.source.id, `${f}.source.id`, 20, { min: 1 }), title: str(x.source.title, `${f}.source.title`, 2000, { optional: true }), projectRev: int(x.source.projectRev, `${f}.source.projectRev`, 0, 1_000_000_000) } : undefined
  return {
    uid: safeUid(x.uid, `${f}.uid`),
    id,
    artifact: str(x.artifact, `${f}.artifact`, 100, { optional: true }),
    elements: strList(x.elements, `${f}.elements`, 200, 100),
    rule: str(x.rule, `${f}.rule`, 2000, { optional: true }),
    status,
    statusReason: str(x.statusReason, `${f}.statusReason`, 4000, { optional: true }),
    findings: strList(x.findings, `${f}.findings`, 200, 200),
    ...(confirmedBy ? { confirmedBy } : {}),
    sourceRevision: int(x.sourceRevision, `${f}.sourceRevision`, 0, 1_000_000),
    week: int(x.week, `${f}.week`, 1, 14),
    ...(pkg ? { pkg } : {}),
    ...(source ? { source } : {}),
  }
}

const CONFORMANCE: ModelElement['conformance'][] = ['teaching-diagram', 'generated-text-unchecked', 'checker-accepted']
export function normElement(x: unknown, f: string): ModelElement {
  if (!isObj(x)) throw badRequest(`${f} must be a model element.`)
  const id = str(x.id, `${f}.id`, 20)
  if (!ID_RE('MEL').test(id)) throw badRequest(`${f}.id is not a MEL ID (I2).`)
  const conformance = String(x.conformance ?? 'teaching-diagram') as ModelElement['conformance']
  if (!CONFORMANCE.includes(conformance)) throw badRequest(`${f}.conformance is not a conformance state.`)
  let textRef: ModelElement['textRef']
  if (x.textRef !== undefined && x.textRef !== null) {
    if (!isObj(x.textRef)) throw badRequest(`${f}.textRef must be an object.`)
    textRef = { file: str(x.textRef.file, `${f}.textRef.file`, 300), ...(x.textRef.line !== undefined ? { line: int(x.textRef.line, `${f}.textRef.line`, 0, 1_000_000) } : {}) }
  }
  const shortName = optStr(x.shortName, `${f}.shortName`, 100)
  const qualifiedName = optStr(x.qualifiedName, `${f}.qualifiedName`, 500)
  const checkedAt = optStr(x.checkedAt, `${f}.checkedAt`, 40)
  return {
    uid: safeUid(x.uid, `${f}.uid`),
    id,
    package: str(x.package, `${f}.package`, 200, { optional: true }),
    construct: str(x.construct, `${f}.construct`, 100, { optional: true }),
    name: str(x.name, `${f}.name`, 300, { optional: true }),
    conformance,
    ...(shortName ? { shortName } : {}),
    ...(qualifiedName ? { qualifiedName } : {}),
    ...(textRef ? { textRef } : {}),
    ...(checkedAt ? { checkedAt } : {}),
  }
}

/** I1/I3 for mappings and model elements: a new item takes a fresh, never-issued ID; an existing one keeps its ID. */
export function upsertProblem(doc: ProjectDoc, ops: Operation[]): string | null {
  const seen = new Map<string, string>()
  for (const o of ops) {
    if (o.op !== 'upsert-mapping' && o.op !== 'upsert-model-element') continue
    const prefix = o.op === 'upsert-mapping' ? 'MAP' : 'MEL'
    const item: { uid: string; id: string } = o.op === 'upsert-mapping' ? o.mapping : o.element
    const store: Record<string, { id: string }> = o.op === 'upsert-mapping' ? doc.mappings : doc.modelElements
    const existing = Object.prototype.hasOwnProperty.call(store, item.uid) ? store[item.uid] : undefined
    if (existing) {
      if (existing.id !== item.id) return `${existing.id} keeps its ID; an edit cannot renumber it.`
      continue
    }
    const key = `${prefix} ${item.id}`
    if (seen.has(key)) {
      if (seen.get(key) !== item.uid) return `${item.id} is used twice in this change (I1).`
      continue
    }
    if (Object.values(store).some((y) => y.id === item.id)) return `${item.id} is already used in this project (I1).`
    if (numOf(item.id) <= (doc.issued[prefix] ?? 0)) return `${item.id} was issued before in this project; IDs are never reused (I3).`
    seen.set(key, item.uid)
  }
  return null
}

// ------------------------------------------------------------------------------------------- before values (M2)
const own = (o: Record<string, unknown>, k: string) => (Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined)
function walk(obj: unknown, fields: FieldChange[]): [FieldChange[], unknown] {
  let cur = obj
  const out = fields.map((f) => {
    const fc: FieldChange = { path: f.path, before: getPath(cur, f.path), after: f.after }
    cur = setPath(cur, f.path, f.after)
    return fc
  })
  return [out, cur]
}

/** Recomputes every `before` value of a member's operations from the stored document, walking the operations in order
 *  (a later operation sees the earlier ones), so the recorded history never carries a value the client made up. */
export function serverBefores(doc: ProjectDoc, ops: Operation[]): Operation[] {
  const arts: Record<string, unknown> = { ...doc.artifacts }
  const rels: Record<string, unknown> = { ...doc.relationships }
  const maps: Record<string, unknown> = { ...doc.mappings }
  const els: Record<string, unknown> = { ...doc.modelElements }
  const ms = new Map<number, unknown>(doc.milestones.map((m) => [m.week, m]))
  let team: unknown = doc.team
  let project: unknown = doc.project
  return ops.map((op): Operation => {
    switch (op.op) {
      case 'create-artifact':
        arts[op.artifact.uid] = op.artifact
        return op
      case 'create-relationship':
        rels[op.relationship.uid] = op.relationship
        return op
      case 'update-artifact':
      case 'update-relationship': {
        const store = op.op === 'update-artifact' ? arts : rels
        const cur = own(store, op.uid)
        if (!cur) return op // checkOp refuses it
        const [fields, next] = walk(cur, op.fields)
        store[op.uid] = next
        return { ...op, fields }
      }
      case 'retire-artifact':
      case 'restore-artifact':
      case 'retire-relationship': {
        const store = op.op === 'retire-relationship' ? rels : arts
        const cur = own(store, op.uid)
        if (cur) store[op.uid] = { ...(cur as object), status: op.op === 'restore-artifact' ? 'active' : 'retired' }
        return op
      }
      case 'set-review': {
        const store = op.kind === 'artifact' ? arts : rels
        const cur = own(store, op.uid) as { review?: unknown } | undefined
        if (!cur) return op
        store[op.uid] = { ...cur, review: op.after }
        return { ...op, before: (cur.review ?? NO_REVIEW) as never }
      }
      case 'update-team': {
        const [fields, next] = walk(team, op.fields)
        team = next
        return { ...op, fields }
      }
      case 'update-project': {
        const [fields, next] = walk(project, op.fields)
        project = next
        return { ...op, fields }
      }
      case 'update-milestone': {
        const cur = ms.get(op.week)
        if (!cur) return op
        const [fields, next] = walk(cur, op.fields)
        ms.set(op.week, next)
        return { ...op, fields }
      }
      case 'upsert-mapping': {
        const before = own(maps, op.mapping.uid) as ModelMapping | undefined
        maps[op.mapping.uid] = op.mapping
        return { op: 'upsert-mapping', mapping: op.mapping, ...(before ? { before } : {}) }
      }
      case 'upsert-model-element': {
        const before = own(els, op.element.uid) as ModelElement | undefined
        els[op.element.uid] = op.element
        return { op: 'upsert-model-element', element: op.element, ...(before ? { before } : {}) }
      }
      default:
        return op
    }
  })
}

// ------------------------------------------------------------------------------------------- derived operations (M1)
/** The member's operations plus the side-effect operations deriveOps finds that the browser did not send. deriveOps
 *  already skips relationships the operations handle; review flags on a target the operations already set are skipped
 *  here, so a browser that derived them itself records nothing twice. */
export function serverDerive(doc: ProjectDoc, ops: Operation[], ctx: OpContext, summary: string): Operation[] {
  const reviewed = new Set(ops.flatMap((o) => (o.op === 'set-review' ? [o.uid] : [])))
  const all = deriveOps(doc, ops, ctx, summary)
  return [...ops, ...all.slice(ops.length).filter((o) => !(o.op === 'set-review' && reviewed.has(o.uid)))]
}

const issueKey = (i: Issue) => `${i.code} ${i.message}`
/** Integrity problems `after` has that `before` did not: every new error, and every new I8 problem (an active
 *  relationship touching a retired artifact) unless the write replaced the whole content (a restored or imported version
 *  went through the import pipeline, which refuses errors and reports the rest). */
export function newProblems(before: ProjectDoc, after: ProjectDoc, opts: { i8: boolean }): Issue[] {
  const had = new Set(validateProject(before).map(issueKey))
  return validateProject(after).filter((i) => !had.has(issueKey(i)) && (i.severity === 'error' || (opts.i8 && i.code === 'I8')))
}
