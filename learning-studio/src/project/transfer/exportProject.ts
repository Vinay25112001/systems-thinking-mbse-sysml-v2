// Whole-project export, format `sysml-studio-project` version 1 (data model §10.1): UTF-8 JSON, 2-space indented, keys
// in the documented order, relationships and mappings carrying both uids (authoritative) and course IDs (readable),
// validation snapshots filled in (recomputed on import, never trusted) and a SHA-256 checksum over the canonical form.
// The checksum detects corruption and accidental hand edits only; it has no secret and proves nothing about authorship.
import { IS_STUDENT_EDITION } from '../../lib/edition'
import { withValidation } from '../adapters/week1Status'
import { APP_VERSION } from '../model/create'
import { TYPE_ORDER } from '../model/vocabulary'
import { numOf } from '../model/ids'
import type { ChangeSet, ProjectDoc } from '../model/types'

export const PROJECT_FORMAT = 'sysml-studio-project'
export const PROJECT_FORMAT_VERSION = 1
export const CANONICALIZATION = 'JSON of the file without the integrity member, keys sorted recursively, no whitespace'

/** JSON with keys sorted recursively and no whitespace. */
export function canonicalJson(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v) ?? 'null'
  if (Array.isArray(v)) return `[${v.map((x) => (x === undefined ? 'null' : canonicalJson(x))).join(',')}]`
  const o = v as Record<string, unknown>
  return `{${Object.keys(o)
    .filter((k) => o[k] !== undefined)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${canonicalJson(o[k])}`)
    .join(',')}}`
}
export async function sha256Hex(text: string): Promise<string | null> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) return null
  const buf = await subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export type ExportOptions = { exportedBy: string; includesHistory?: boolean; at?: string; changes?: ChangeSet[] }
export type ProjectFile = Record<string, unknown> & { format: string; schemaVersion: number; integrity?: { algorithm: string; canonicalization: string; value?: string } }

/** The export document (without serialising it). */
export async function buildExport(docIn: ProjectDoc, o: ExportOptions): Promise<ProjectFile> {
  const doc = withValidation(docIn)
  const idOf = (uid: string) => doc.artifacts[uid]?.id ?? ''
  const includesHistory = o.includesHistory !== false
  const body: ProjectFile = {
    format: PROJECT_FORMAT,
    schemaVersion: PROJECT_FORMAT_VERSION,
    exportedAt: o.at ?? new Date().toISOString(),
    exportedBy: o.exportedBy,
    app: { name: 'sysml-learning-studio', version: APP_VERSION, edition: IS_STUDENT_EDITION ? 'student' : 'instructor' },
    scope: 'full',
    includesHistory,
    project: doc.project,
    team: doc.team,
    artifacts: Object.values(doc.artifacts).sort((a, b) => (TYPE_ORDER.get(a.type) ?? 99) - (TYPE_ORDER.get(b.type) ?? 99) || numOf(a.id) - numOf(b.id)),
    relationships: Object.values(doc.relationships)
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((r) => ({ ...r, fromId: idOf(r.from), toId: idOf(r.to) })),
    milestones: doc.milestones,
    modelElements: Object.values(doc.modelElements),
    mappings: Object.values(doc.mappings).map((m) => ({ ...m, artifactId: idOf(m.artifact) })),
    findings: doc.findings,
    issued: doc.issued,
    rev: doc.rev,
    changes: includesHistory ? (o.changes ?? []) : [],
  }
  const value = await sha256Hex(canonicalJson(body))
  return { ...body, integrity: { algorithm: 'SHA-256', canonicalization: CANONICALIZATION, ...(value ? { value } : {}) } }
}
export async function exportProjectText(doc: ProjectDoc, o: ExportOptions): Promise<string> {
  return JSON.stringify(await buildExport(doc, o), null, 2)
}
const slug = (s: string) => (s.trim() || 'NN').replace(/[^A-Za-z0-9-]+/g, '-')
export const exportFileName = (doc: ProjectDoc, at = new Date()) => `team-${slug(doc.team.label)}-project-${at.toISOString().slice(0, 10)}.json`
export const reportFileName = (doc: ProjectDoc, at = new Date()) => `team-${slug(doc.team.label)}-project-report-${at.toISOString().slice(0, 10)}.md`
