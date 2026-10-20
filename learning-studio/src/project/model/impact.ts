// Change impact (trace plan §5): a material change to an artifact flags the artifacts that depend on it, direction-aware
// along the vocabulary's impact rule, and turns the directly involved relationships suspect. Never deletes, never marks
// anything valid: only a person clears a flag, with a rationale (clearReviewOps).
import { VOCABULARY } from './vocabulary'
import type { AttrValue, Operation, ProjectDoc, ReviewCause, ReviewState } from './types'

export type Flag = { target: string; kind: 'artifact' | 'relationship'; cause: ReviewCause }

/** Presentation-only or bookkeeping fields: changing them is not material (trace plan §5.1). */
const NOT_MATERIAL = /^(owner|aiAssisted|unresolvedRefs|formerIds|milestones|provenance(\..*)?|attributes\.seq)$/
const blank = (v: AttrValue | undefined) => v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length) || (typeof v === 'object' && !Array.isArray(v) && v !== null && !Object.keys(v).length)

export function impactOf(doc: ProjectDoc, changedUid: string, cause: Omit<ReviewCause, 'path'>, maxDepth = 3): Flag[] {
  const flags: Flag[] = []
  const seen = new Set([changedUid])
  let frontier: { uid: string; path: string[] }[] = [{ uid: changedUid, path: [] }]
  const rels = Object.values(doc.relationships).filter((r) => !r.draft && r.status !== 'retired')
  for (let d = 1; d <= maxDepth && frontier.length; d++) {
    const next: typeof frontier = []
    for (const { uid, path } of frontier) {
      for (const rel of rels) {
        if (rel.from !== uid && rel.to !== uid) continue
        if (!rel.type) continue
        const dir = VOCABULARY[rel.type].impact
        const other = rel.from === uid ? rel.to : rel.from
        const propagates = dir === 'both' || (dir === '→from' && rel.to === uid) || (dir === '→to' && rel.from === uid)
        if (!propagates) continue
        const p = [...path, rel.id]
        if (d === 1) flags.push({ target: rel.uid, kind: 'relationship', cause: { ...cause, path: p } })
        if (!seen.has(other)) {
          seen.add(other)
          flags.push({ target: other, kind: 'artifact', cause: { ...cause, path: p } })
          if (rel.category !== 'structure') next.push({ uid: other, path: p })
        }
      }
    }
    frontier = next
  }
  return flags
}

/** The artifacts a set of operations changes materially. `earlier` = operations of the change set this one coalesces
 *  into: a field counts from its earliest value, so filling in a blank field while typing is not a material change. */
export function materialChanges(doc: ProjectDoc, ops: Operation[], earlier: Operation[] = []): string[] {
  const firstBefore = new Map<string, AttrValue | undefined>()
  for (const o of [...earlier, ...ops]) if (o.op === 'update-artifact') for (const f of o.fields) if (!firstBefore.has(`${o.uid} ${f.path}`)) firstBefore.set(`${o.uid} ${f.path}`, f.before)
  const out = new Set<string>()
  for (const o of ops) {
    if (o.op === 'retire-artifact') out.add(o.uid)
    if (o.op === 'update-artifact' && doc.artifacts[o.uid])
      for (const f of o.fields) {
        if (NOT_MATERIAL.test(f.path)) continue
        const before = firstBefore.get(`${o.uid} ${f.path}`)
        if (!blank(before) && JSON.stringify(before) !== JSON.stringify(f.after)) out.add(o.uid)
      }
  }
  return [...out]
}

/** Operations that apply the flags of a change set: review causes on dependent artifacts (no duplicate cause for the
 *  same changed artifact), suspect status on the directly involved active relationships (integrity I8 for retirements). */
export function flagOps(doc: ProjectDoc, changed: string[], change: string, summary: string, at: string, skip: Set<string> = new Set()): Operation[] {
  const out: Operation[] = []
  const reviews = new Map<string, ReviewState>()
  const suspect = new Set<string>()
  for (const uid of changed) {
    const a = doc.artifacts[uid]
    if (!a) continue
    for (const f of impactOf(doc, uid, { change, changedId: a.id, summary })) {
      if (f.kind === 'relationship') {
        if (doc.relationships[f.target]?.status === 'active') suspect.add(f.target)
        continue
      }
      if (skip.has(f.target) || changed.includes(f.target)) continue
      const t = doc.artifacts[f.target]
      if (!t || t.status !== 'active') continue
      const cur = reviews.get(f.target) ?? t.review
      const causes = cur.state === 'needs-review' ? cur.causes : []
      if (causes.some((c) => c.changedId === f.cause.changedId)) continue
      reviews.set(f.target, { state: 'needs-review', since: cur.state === 'needs-review' ? cur.since : at, causes: [...causes, f.cause] })
    }
  }
  for (const uid of suspect) out.push({ op: 'update-relationship', uid, fields: [{ path: 'status', before: 'active', after: 'suspect' }] })
  for (const [uid, after] of reviews) out.push({ op: 'set-review', uid, kind: 'artifact', before: doc.artifacts[uid].review, after })
  return out
}

/** Retiring an artifact turns every active relationship touching it suspect and removes none (I8, I13). */
export function retireSideEffects(doc: ProjectDoc, uid: string): Operation[] {
  return Object.values(doc.relationships)
    .filter((r) => r.status === 'active' && !r.draft && (r.from === uid || r.to === uid))
    .map((r) => ({ op: 'update-relationship', uid: r.uid, fields: [{ path: 'status', before: 'active', after: 'suspect' }] }) as Operation)
}

/** A person's review: "Reviewed: still holds", with the rationale. Clears the flag, records the causes it cleared, and
 *  returns its suspect relationships whose both ends are active to active. */
export function clearReviewOps(doc: ProjectDoc, uid: string, by: string, rationale: string, at: string): Operation[] {
  const a = doc.artifacts[uid]
  if (!a) return []
  const out: Operation[] = []
  if (a.review.state === 'needs-review') out.push({ op: 'set-review', uid, kind: 'artifact', before: a.review, after: { state: 'reviewed', at, by, rationale, clearedCauses: a.review.causes } })
  for (const r of Object.values(doc.relationships)) {
    if (r.status !== 'suspect' || (r.from !== uid && r.to !== uid)) continue
    if (doc.artifacts[r.from]?.status === 'active' && doc.artifacts[r.to]?.status === 'active') out.push({ op: 'update-relationship', uid: r.uid, fields: [{ path: 'status', before: 'suspect', after: 'active' }] })
  }
  return out
}
