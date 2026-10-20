// Change-set coalescing and the snapshot policy (architecture §5.3–§5.4). Pure.
import type { ChangeSet, Operation, SnapshotKind, SnapshotMeta } from '../model/types'

export const COALESCE_MS = 60_000
export const AUTOSAVE_MS = 600

/** The fields an operation list edits, as "uid path" keys; null when it does anything else than edit fields. */
function editKeys(ops: Operation[]): Set<string> | null {
  const keys = new Set<string>()
  for (const o of ops) {
    if (o.op === 'update-artifact' || o.op === 'update-relationship') for (const f of o.fields) keys.add(`${o.uid} ${f.path}`)
    else if (o.op === 'update-team') for (const f of o.fields) keys.add(`team ${f.path}`)
    else if (o.op === 'update-milestone') for (const f of o.fields) keys.add(`m${o.week} ${f.path}`)
    else if (o.op === 'update-project') for (const f of o.fields) keys.add(`project ${f.path}`)
    else if (o.op === 'set-review') continue
    else return null
  }
  return keys
}
const primary = (ops: Operation[]) => ops.filter((o) => o.op !== 'set-review' && !(o.op === 'update-relationship' && o.fields.every((f) => f.path === 'status')))

/** Consecutive edits to the same fields by the same editor within 60 s merge into one change set (pattern of
 *  shouldCoalesce in src/workbench/changes.ts), so the log records meaningful changes, not keystrokes. */
export function canCoalesce(last: ChangeSet | null | undefined, ops: Operation[], by: string, at: string, source: ChangeSet['source']): boolean {
  if (!last || last.source !== 'editor' || source !== 'editor' || last.by !== by) return false
  if (Date.parse(at) - Date.parse(last.at) > COALESCE_MS) return false
  const a = editKeys(primary(last.ops))
  const b = editKeys(primary(ops))
  if (!a || !b || !b.size) return false
  return [...b].every((k) => a.has(k)) && [...a].every((k) => b.has(k))
}

/** Merges `next` into `last`: each field keeps its earliest `before` and takes the newest `after`; derived operations
 *  (review flags, suspect links) are appended once. */
export function mergeOps(last: Operation[], next: Operation[]): Operation[] {
  const out: Operation[] = last.map((o) => ('fields' in o ? { ...o, fields: o.fields.map((f) => ({ ...f })) } : o)) as Operation[]
  for (const o of next) {
    if (o.op === 'update-artifact' || o.op === 'update-relationship' || o.op === 'update-team' || o.op === 'update-milestone' || o.op === 'update-project') {
      const target = out.find((x) => x.op === o.op && (!('uid' in o) || ('uid' in x && x.uid === o.uid)) && (!('week' in o) || ('week' in x && x.week === o.week))) as { fields: { path: string; before: unknown; after: unknown }[] } | undefined
      if (target) {
        for (const f of o.fields) {
          const ex = target.fields.find((x) => x.path === f.path)
          if (ex) ex.after = f.after
          else target.fields.push({ ...f })
        }
        continue
      }
    }
    out.push(o)
  }
  return out
}

export const RETENTION: Partial<Record<SnapshotKind, number>> = { 'pre-import': 10, 'pre-restore': 10, auto: 14 }
/** Snapshots beyond the retention of their kind, oldest first (manual and milestone versions are kept). */
export function prunable(snaps: SnapshotMeta[]): SnapshotMeta[] {
  const out: SnapshotMeta[] = []
  for (const [kind, keep] of Object.entries(RETENTION)) {
    const of = snaps.filter((s) => s.kind === kind).sort((a, b) => a.at.localeCompare(b.at))
    out.push(...of.slice(0, Math.max(0, of.length - (keep ?? 0))))
  }
  return out
}
export const localDay = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
/** The first save of each calendar day writes an `auto` snapshot. */
export const needsDailySnapshot = (snaps: SnapshotMeta[], at: string) => !snaps.some((s) => s.kind === 'auto' && localDay(s.at) === localDay(at))
