// Preview, duplicate detection, validation and the single-transaction commit of the stakeholder import (directive §13
// steps 10–15; spec §j.1 X4–X6). Pure. Missing data is flagged, never invented: an empty or unrecognised value stays
// empty; a row without a name cannot be imported; a row without the level of interest (A25) is imported only as a
// stakeholder that the register then flags as incomplete. Nothing is overwritten silently: a duplicate is skipped,
// imported as new, or merged into an existing stakeholder filling only its EMPTY fields.
import { normalizeTeam, type ConcernRow, type StakeholderRow, type TeamRecord } from '../../workbench/week1/team'
import { diffTeamRecord, toTeamRecord } from '../adapters/week1'
import type { Artifact, AttrValue, Operation, ProjectDoc, Provenance, Stamp } from '../model/types'
import { COURSE_REQUIRED, FIELD_LABEL, normalizeValue, type ColumnMapping, type ImportField } from './mapping'
import type { CellFlag, SheetData } from './reader'

export type RowIssue = { field: ImportField | null; kind: 'missing-required' | 'missing-course' | 'not-recognised' | 'formula' | 'formula-no-value' | 'formula-text' | 'invalid-cell' | 'truncated'; message: string }
export type DuplicateHit = { kind: 'existing'; id: string; name: string; exact: boolean; score: number } | { kind: 'file'; row: number; name: string; exact: boolean; score: number }
export type RowChoice = 'new' | 'skip' | 'merge'
export type PreviewRow = {
  /** Spreadsheet row number (1-based, as Excel shows it). */
  rowNumber: number
  values: Partial<Record<ImportField, string>>
  concerns: string[]
  issues: RowIssue[]
  duplicate: DuplicateHit | null
  choice: RowChoice
  /** Merge target (an existing STK ID) when choice = 'merge'. */
  mergeInto?: string
}
export type RowStatus = 'ready' | 'missing-required' | 'duplicate' | 'not-recognised' | 'formula' | 'incomplete'
export const ROW_STATUS_LABEL: Record<RowStatus, string> = { ready: 'Ready', 'missing-required': 'Missing required', duplicate: 'Duplicate?', 'not-recognised': 'Value not recognised', formula: 'Formula: check', incomplete: 'Imported as incomplete' }

/** Lower-case, punctuation removed, a leading "the" removed. */
export const normName = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim().replace(/^the /, '')
/** Token similarity (Sørensen–Dice over word sets), 0–1. */
export function nameSimilarity(a: string, b: string): number {
  const A = new Set(normName(a).split(' ').filter(Boolean))
  const B = new Set(normName(b).split(' ').filter(Boolean))
  if (!A.size || !B.size) return 0
  let inter = 0
  for (const t of A) if (B.has(t)) inter++
  return (2 * inter) / (A.size + B.size)
}
export const SIMILAR = 0.85

const FLAG_ISSUE: Record<CellFlag, RowIssue['kind']> = { formula: 'formula', 'formula-no-value': 'formula-no-value', error: 'invalid-cell', truncated: 'truncated' }
const FLAG_TEXT: Record<CellFlag, string> = {
  formula: 'formula: check this value (the value the spreadsheet stored is used; the formula is never run)',
  'formula-no-value': 'a formula with no stored value: read as empty',
  error: 'the cell holds a spreadsheet error: read as empty',
  truncated: 'longer than 4,000 characters: cut to the limit',
}

/** Splits a multi-concern cell on line breaks or semicolons (the student can turn splitting off). */
export const splitConcerns = (v: string, split: boolean) => (split ? v.split(/\r?\n|;/) : [v]).map((x) => x.trim()).filter(Boolean)

export function buildPreview(sheet: SheetData, cols: ColumnMapping[], existing: { id: string; name: string }[], opts: { splitConcerns: boolean }): PreviewRow[] {
  const mapped = cols.filter((c) => c.selected)
  const rows: PreviewRow[] = []
  for (let i = 1; i < sheet.rows.length; i++) {
    const raw = sheet.rows[i]
    const values: Partial<Record<ImportField, string>> = {}
    const issues: RowIssue[] = []
    for (const c of mapped) {
      const f = c.selected!
      const cellRaw = raw[c.index] ?? ''
      const flag = sheet.flags[`${i}:${c.index}`]
      if (flag) issues.push({ field: f, kind: FLAG_ISSUE[flag], message: `${FIELD_LABEL[f]}: ${FLAG_TEXT[flag]}` })
      const n = normalizeValue(f, cellRaw)
      // text that a spreadsheet would read as a formula (=, +, -, @) is kept as plain text and flagged (M6 review L-4;
      // any future spreadsheet export must prefix-escape it)
      if (n.ok && /^[=+\-@]/.test(n.value) && !/^[+-]?\d+(\.\d+)?$/.test(n.value)) issues.push({ field: f, kind: 'formula-text', message: `${FIELD_LABEL[f]}: looks like a formula; stored as plain text and never run` })
      if (n.ok) values[f] = n.value
      else issues.push({ field: f, kind: 'not-recognised', message: `${FIELD_LABEL[f]}: ${n.reason}` })
    }
    if (!(values.name ?? '').trim()) issues.unshift({ field: 'name', kind: 'missing-required', message: 'No stakeholder name: this row cannot be imported.' })
    for (const f of COURSE_REQUIRED) if (!(values[f] ?? '').trim() && !issues.some((x) => x.field === f && x.kind === 'not-recognised')) issues.push({ field: f, kind: 'missing-course', message: `${FIELD_LABEL[f]} is missing: required by the course, flagged in the register until you add it (never filled in for you).` })
    const concerns = splitConcerns(values.concerns ?? '', opts.splitConcerns)
    rows.push({ rowNumber: sheet.rowNumbers[i] ?? i + 1, values, concerns, issues, duplicate: null, choice: values.name?.trim() ? 'new' : 'skip' })
  }
  // duplicates: against the register first, then earlier rows of the file
  rows.forEach((r, k) => {
    const name = r.values.name ?? ''
    if (!name.trim()) return
    let hit: DuplicateHit | null = null
    for (const s of existing) {
      const exact = normName(s.name) === normName(name)
      const score = exact ? 1 : nameSimilarity(s.name, name)
      if (score >= SIMILAR && (!hit || score > hit.score)) hit = { kind: 'existing', id: s.id, name: s.name, exact, score }
    }
    if (!hit)
      for (let j = 0; j < k; j++) {
        const o = rows[j].values.name ?? ''
        if (!o.trim()) continue
        const exact = normName(o) === normName(name)
        const score = exact ? 1 : nameSimilarity(o, name)
        if (score >= SIMILAR) {
          hit = { kind: 'file', row: rows[j].rowNumber, name: o, exact, score }
          break
        }
      }
    r.duplicate = hit
    // never imported twice by default: an exact duplicate is skipped until the student decides
    if (hit?.exact) r.choice = 'skip'
  })
  return rows
}

export function rowStatus(r: PreviewRow): RowStatus {
  if (r.issues.some((x) => x.kind === 'missing-required')) return 'missing-required'
  if (r.duplicate) return 'duplicate'
  if (r.issues.some((x) => x.kind === 'not-recognised' || x.kind === 'invalid-cell')) return 'not-recognised'
  if (r.issues.some((x) => x.kind === 'formula' || x.kind === 'formula-no-value' || x.kind === 'formula-text')) return 'formula'
  if (r.issues.some((x) => x.kind === 'missing-course')) return 'incomplete'
  return 'ready'
}

/** `importId`: the import's own id, carried on every artifact it creates; the course server binds its pre-import version
 *  to it (M6 review H-1), so "Undo this import" can find exactly that restore point. */
export type ImportSource = { file: string; sha256: string | null; size: number; sheet: string; at: string; mapping: ColumnMapping[]; importId?: string }
export type ImportSummary = { created: number; concerns: number; merged: number; skipped: number; warnings: number }
export function summarize(rows: PreviewRow[]): ImportSummary {
  const live = rows.filter((r) => r.choice !== 'skip' && (r.values.name ?? '').trim())
  return {
    created: live.filter((r) => r.choice === 'new').length,
    concerns: live.reduce((n, r) => n + r.concerns.length, 0),
    merged: live.filter((r) => r.choice === 'merge').length,
    skipped: rows.length - live.length,
    warnings: live.reduce((n, r) => n + r.issues.filter((x) => x.kind !== 'missing-required').length, 0),
  }
}

/** The compact mapping stored with each artifact's provenance: field ← header, and whether the student chose it. */
export const mappingRecord = (cols: ColumnMapping[]): Record<string, AttrValue> => Object.fromEntries(cols.filter((c) => c.selected).map((c) => [c.selected!, `${c.header}${c.correctedByStudent ? ' (chosen by the student)' : ''}`]))

/** The canonical operations of an approved import, as ONE change set (directive §13 step 14): new stakeholders and
 *  their concerns get IDs from the project counters; merges fill only empty fields; every created or changed artifact
 *  carries the provenance (file, sheet, row, import time, mapping; step 15). Returns the IDs created. */
export function importOps(doc: ProjectDoc, rows: PreviewRow[], src: ImportSource, stamp: Stamp): { ops: Operation[]; createdIds: string[]; mergedIds: string[] } {
  const rec = toTeamRecord(doc)
  let stkN = Math.max(rec.issued.STK, 0)
  let conN = Math.max(rec.issued.CON, 0)
  const pad = (n: number) => String(n).padStart(3, '0')
  const rowOf = new Map<string, PreviewRow>()
  const next: TeamRecord = { ...rec, stakeholders: rec.stakeholders.map((s) => ({ ...s, concerns: [...s.concerns] })) }
  const mergedIds: string[] = []
  for (const r of rows) {
    const name = (r.values.name ?? '').trim()
    if (r.choice === 'skip' || !name) continue
    const v = r.values
    if (r.choice === 'merge' && r.mergeInto) {
      const s = next.stakeholders.find((x) => x.id === r.mergeInto)
      if (!s) continue
      // IDs only for the concerns that are actually added (M6 review L-8: no gaps in the series)
      const concerns: ConcernRow[] = r.concerns.filter((text) => !s.concerns.some((x) => x.text.trim().toLowerCase() === text.toLowerCase())).map((text) => ({ id: `CON-${pad(++conN)}`, text }))
      // fill only empty fields; never overwrite a value the register already holds
      const fill = <K extends keyof StakeholderRow>(k: K, val: StakeholderRow[K] | undefined) => {
        if (val && !String(s[k] ?? '').trim()) (s as StakeholderRow)[k] = val
      }
      fill('role', v.role)
      fill('stage', v.stage)
      fill('side', v.side as StakeholderRow['side'])
      fill('approving', v.approving as StakeholderRow['approving'])
      fill('interest', v.interest)
      fill('interestReason', v.interestReason)
      fill('influence', v.influence ?? '')
      fill('reason', v.influenceReason ?? '')
      fill('support', v.support)
      s.concerns.push(...concerns)
      mergedIds.push(s.id)
      rowOf.set(s.id, r)
      for (const c of concerns) rowOf.set(c.id, r)
      continue
    }
    const concerns: ConcernRow[] = r.concerns.map((text) => ({ id: `CON-${pad(++conN)}`, text }))
    const id = `STK-${pad(++stkN)}`
    next.stakeholders.push({ id, name, role: v.role ?? '', stage: v.stage ?? '', side: (v.side ?? '') as StakeholderRow['side'], approving: (v.approving ?? '') as StakeholderRow['approving'], concerns, influence: v.influence ?? '', reason: v.influenceReason ?? '', interest: v.interest ?? '', interestReason: v.interestReason ?? '', support: v.support ?? '' })
    rowOf.set(id, r)
    for (const c of concerns) rowOf.set(c.id, r)
  }
  next.issued = { ...next.issued, STK: stkN, CON: conN }
  const provenance: Provenance = { kind: 'imported', from: { format: 'xlsx', version: 1, file: src.file, ...(src.sha256 ? { sha256: src.sha256 } : {}) }, at: src.at }
  const ops = diffTeamRecord(doc, normalizeTeam(next), stamp, provenance)
  const mapping = mappingRecord(src.mapping)
  const importAttr = (r: PreviewRow): AttrValue => ({ file: src.file, sheet: src.sheet, row: r.rowNumber, at: src.at, mapping, ...(src.sha256 ? { sha256: src.sha256 } : {}), ...(src.importId ? { importId: src.importId } : {}) })
  const createdIds: string[] = []
  for (const o of ops) {
    if (o.op !== 'create-artifact') continue
    const r = rowOf.get(o.artifact.id)
    if (!r) continue
    createdIds.push(o.artifact.id)
    const notes = o.artifact.type === 'STK' ? (r.values.notes ?? '') : ''
    o.artifact = { ...o.artifact, ...(notes ? { description: notes } : {}), attributes: { ...o.artifact.attributes, import: importAttr(r), importRow: `${src.sheet}!row ${r.rowNumber}` } }
  }
  // merged stakeholders: record that the import contributed to them (the provenance of the artifact stays its own)
  const byId = new Map<string, Artifact>(Object.values(doc.artifacts).map((a) => [a.id, a]))
  for (const id of mergedIds) {
    const a = byId.get(id)
    const r = rowOf.get(id)
    if (!a || !r) continue
    const before = a.attributes.importMerges as AttrValue[] | undefined
    ops.push({ op: 'update-artifact', uid: a.uid, fields: [{ path: 'attributes.importMerges', before, after: [...(Array.isArray(before) ? before : []), importAttr(r)] }] })
  }
  return { ops, createdIds, mergedIds }
}
