// Changes & impact (WORKBENCH_SPEC §3). Every state the workbench shows is reduced to a Snapshot; a change is the diff
// of two snapshots: which elements changed, which problems appeared or cleared, which metrics moved and which mission
// steps started or stopped passing. Pure, so the impact of any mutation (including those made by unmodified
// activities such as the boundary exercise or the stakeholder editor) is computed the same way and unit-tested.
import type { EngineeringModel } from '../model/engineering'
import { problemKey, type Problem } from './problems'

export type Snapshot = {
  /** element id → signature; a changed signature means the element changed */
  entities: Record<string, string>
  problems: Problem[]
  /** labelled derived metrics, e.g. "EXT elements", "Requirements with a parent" */
  metrics: Record<string, number>
  /** "missionId/stepId" → passing */
  steps: Record<string, boolean>
  /** "missionId/stepId" → human label */
  stepLabels: Record<string, string>
}

export type Impact = {
  added: string[]
  removed: string[]
  changed: string[]
  problemsAdded: Problem[]
  problemsCleared: Problem[]
  metrics: { label: string; before: number; after: number }[]
  stepsNowPassing: string[]
  stepsNowFailing: string[]
  /** every element the change touched or whose problems moved (highlighted briefly) */
  affected: string[]
}

/** `op`: an edit the student made, or an undo / redo of one (`of` = the change undone or redone). */
export type ChangeOp = 'edit' | 'undo' | 'redo'
export type ChangeRecord = { id: number; at: number; ids: string[]; summary: string; before: Snapshot; impact: Impact; op?: ChangeOp; of?: number }

export function diffSnapshots(before: Snapshot, after: Snapshot): Impact {
  const added = Object.keys(after.entities).filter((k) => !(k in before.entities))
  const removed = Object.keys(before.entities).filter((k) => !(k in after.entities))
  const changed = Object.keys(after.entities).filter((k) => k in before.entities && before.entities[k] !== after.entities[k])
  const bk = new Set(before.problems.map(problemKey))
  const ak = new Set(after.problems.map(problemKey))
  const problemsAdded = after.problems.filter((p) => !bk.has(problemKey(p)))
  const problemsCleared = before.problems.filter((p) => !ak.has(problemKey(p)))
  const labels = [...new Set([...Object.keys(before.metrics), ...Object.keys(after.metrics)])]
  const metrics = labels
    .map((label) => ({ label, before: before.metrics[label] ?? 0, after: after.metrics[label] ?? 0 }))
    .filter((m) => m.before !== m.after)
  const stepIds = [...new Set([...Object.keys(before.steps), ...Object.keys(after.steps)])]
  const stepsNowPassing = stepIds.filter((s) => after.steps[s] && !before.steps[s]).map((s) => after.stepLabels[s] ?? s)
  const stepsNowFailing = stepIds.filter((s) => before.steps[s] && !after.steps[s]).map((s) => after.stepLabels[s] ?? before.stepLabels[s] ?? s)
  const affected = [...new Set([...added, ...changed, ...[...problemsAdded, ...problemsCleared].flatMap((p) => (p.elementId ? [p.elementId] : []))])]
  return { added, removed, changed, problemsAdded, problemsCleared, metrics, stepsNowPassing, stepsNowFailing, affected }
}

export const isEmptyImpact = (i: Impact) =>
  !i.added.length && !i.removed.length && !i.changed.length && !i.problemsAdded.length && !i.problemsCleared.length && !i.metrics.length && !i.stepsNowPassing.length && !i.stepsNowFailing.length

export function summarise(i: Impact): string {
  const parts: string[] = []
  if (i.added.length) parts.push(`Added ${i.added.join(', ')}`)
  if (i.changed.length) parts.push(`Updated ${i.changed.join(', ')}`)
  if (i.removed.length) parts.push(`Removed ${i.removed.join(', ')}`)
  return parts.join(' · ') || 'Derived state changed'
}

/** Two updates to the same elements within `windowMs` are one edit (typing a statement is one change, not forty).
 *  Creations and removals are never merged, so the problems a new element raised stay visible in the log. */
export function shouldCoalesce(prev: ChangeRecord | undefined, ids: string[], now: number, impact?: Impact, windowMs = 4000): boolean {
  if (!prev || now - prev.at > windowMs || !ids.length) return false
  if (prev.op && prev.op !== 'edit') return false // an undo or redo is its own entry
  const updateOnly = (i: Impact) => !i.added.length && !i.removed.length
  if (!updateOnly(prev.impact) || (impact && !updateOnly(impact))) return false
  return prev.ids.length === ids.length && prev.ids.every((x) => ids.includes(x))
}

/** Metrics derived from the engineering model that any week's impact view reports when they are non-zero. */
export function modelMetrics(m: EngineeringModel): Record<string, number> {
  const out: Record<string, number> = {}
  for (const e of m.elements) if (e.status === 'active') out[`${e.kind} elements`] = (out[`${e.kind} elements`] ?? 0) + 1
  out['Links'] = m.links.length
  return out
}

export function elementSignatures(m: EngineeringModel): Record<string, string> {
  const out: Record<string, string> = {}
  for (const e of m.elements) out[e.id] = JSON.stringify([e.name, e.text, e.attributes, e.owner, e.provenance, e.status])
  for (const l of m.links) out[l.id] = JSON.stringify([l.source, l.type, l.target])
  return out
}
