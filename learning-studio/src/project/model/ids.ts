// Course IDs (data model §2): PREFIX-nnn (three digits, four after 999), two-part prefixes REQ-STK and REQ-SYS, issued
// from project-wide counters that never decrease, so a retired artifact's ID stays taken forever. Every artifact and
// relationship also carries a hidden uid (UUID) that survives renumbering.
import type { ProjectDoc } from './types'

export const ID_RE = (prefix: string) => new RegExp(`^${prefix.replace('-', '\\-')}-\\d{3,4}$`)
export const formatId = (prefix: string, n: number) => `${prefix}-${String(n).padStart(3, '0')}`
export const numOf = (id: string) => Number(/-(\d+)$/.exec(id)?.[1]) || 0
/** "REQ-STK-004" → "REQ-STK", "STK-004" → "STK", "A-002" → "A". */
export const prefixOf = (id: string) => (/^REQ-(STK|SYS)-/.test(id) ? id.slice(0, 7) : id.replace(/-\d+$/, ''))
export const isWellFormed = (id: string, prefix: string) => ID_RE(prefix).test(id)

/** Lowest numbers a counter starts from: MGO-001 is reserved for the mission (team.ts MISSION_ID), ENT-001 is the
 *  enterprise singleton. */
export const RESERVED: Record<string, number> = { MGO: 1, ENT: 1 }

/** Highest number present for a prefix among artifacts (any status) and relationships. */
export function maxPresent(doc: Pick<ProjectDoc, 'artifacts' | 'relationships'>, prefix: string): number {
  let m = 0
  for (const a of Object.values(doc.artifacts)) if (prefixOf(a.id) === prefix) m = Math.max(m, numOf(a.id))
  for (const r of Object.values(doc.relationships)) if (prefixOf(r.id) === prefix) m = Math.max(m, numOf(r.id))
  return m
}
/** nextId(prefix) = max(issued[prefix], max present, reserved) + 1 (data model §2.2). */
export function nextNumber(doc: Pick<ProjectDoc, 'artifacts' | 'relationships' | 'issued'>, prefix: string): number {
  return Math.max(doc.issued[prefix] ?? 0, maxPresent(doc, prefix), prefix === 'ENT' ? 0 : (RESERVED[prefix] ?? 0)) + 1
}
export const nextId = (doc: Pick<ProjectDoc, 'artifacts' | 'relationships' | 'issued'>, prefix: string) => formatId(prefix, nextNumber(doc, prefix))

export const changeId = (n: number) => `CHG-${String(n).padStart(6, '0')}`
export const snapshotId = (n: number) => `SNP-${String(n).padStart(3, '0')}`

/** crypto.randomUUID where available, otherwise time + random (never shown in the UI). */
export function newUid(): string {
  const c = globalThis.crypto as Crypto | undefined
  if (c && typeof c.randomUUID === 'function') return c.randomUUID()
  const r = () => Math.random().toString(16).slice(2, 10)
  return `${Date.now().toString(16)}-${r()}-${r()}-${r()}`
}
