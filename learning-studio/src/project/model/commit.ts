// One change set from an editor's operations: the derived operations are added (retirement → relationships suspect,
// material change → dependents flagged for review) so the change log records them with their before values, then the
// whole set is applied atomically.
import { flagOps, materialChanges, retireSideEffects } from './impact'
import { applyOps, type ApplyResult, type OpContext } from './ops'
import type { Operation, ProjectDoc } from './types'

export type CommitResult = (ApplyResult & { ok: false }) | { ok: true; doc: ProjectDoc; ops: Operation[] }

export function deriveOps(doc: ProjectDoc, ops: Operation[], ctx: OpContext, summary: string, earlier: Operation[] = []): Operation[] {
  const handled = new Set<string>()
  for (const o of ops) if (o.op === 'retire-relationship' || o.op === 'update-relationship') handled.add(o.uid)
  const extra: Operation[] = []
  const add = (o: Operation) => {
    if (o.op === 'update-relationship') {
      if (handled.has(o.uid)) return
      handled.add(o.uid)
    }
    extra.push(o)
  }
  for (const o of ops) if (o.op === 'retire-artifact') retireSideEffects(doc, o.uid).forEach(add)
  flagOps(doc, materialChanges(doc, ops, earlier), ctx.change, summary, ctx.at).forEach(add)
  return [...ops, ...extra]
}

export function commitOps(doc: ProjectDoc, ops: Operation[], ctx: OpContext, summary: string, earlier: Operation[] = []): CommitResult {
  const all = deriveOps(doc, ops, ctx, summary, earlier)
  const r = applyOps(doc, all, ctx)
  return r.ok ? { ok: true, doc: r.doc, ops: all } : r
}
