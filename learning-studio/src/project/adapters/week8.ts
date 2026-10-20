// Week 8 preview adapter (roadmap §2.2, trace plan §4): the project's Week 1 artifacts as the ImportSource the existing
// Week 8 pipeline consumes (src/workbench/week8/skeleton.ts), so the generator, the audit and the mapping rules run
// unchanged; and a per-artifact mapping status from the five statuses. In P1 nothing is stored and nothing is ever
// "Mapped": a mapping becomes Mapped only when a person confirms it in Week 8 (P3).
import { auditFindings, generateSysml, sourceFromTeam, type Finding, type ImportSource } from '../../workbench/week8/skeleton'
import { MAPPING_KINDS, mappingOf, type MappingKind } from '../../content/lectures/week08/labBrief'
import { toTeamRecord } from './week1'
import type { MappingStatus, ProjectDoc } from '../model/types'

export const PREVIEW_ORIGIN = 'My Project (Week 1 artifacts)'
/** The kinds the preview shows on the left, in MAPPING_KINDS order (Week 1 rows). */
export const PREVIEW_PREFIXES = ['ENT', 'PRT', 'EXT', 'STK', 'CON', 'REL', 'MGO', 'NEED'] as const

/** The ImportSource the Week 8 generator expects, built from the project (T-C1: equal to sourceFromTeam on the record).
 *  AeroLink practice copies not yet adapted are left out (they must not enter the team model, trace plan §4.3). */
export function sourceFromProject(doc: ProjectDoc): ImportSource {
  return sourceFromTeam(toTeamRecord(doc, { excludeUnadapted: true }), PREVIEW_ORIGIN)
}

export type PreviewRow = { uid: string; id: string; title: string; prefix: string; status: MappingStatus; reason: string; findings: Finding[] }
export type PreviewGroup = { kind: MappingKind; rows: PreviewRow[] }
export type Preview = { source: ImportSource; findings: Finding[]; groups: PreviewGroup[]; text: string; counts: Record<MappingStatus, number>; unadapted: string[] }

const BLOCKING = new Set(['defect', 'gap'])

/** Status per artifact (trace plan §4.4, P1 subset): Invalid or incomplete when a defect or an undispositioned gap of the
 *  audit names it; Needs review when it carries a review flag or a suspect relationship; Mapping proposed when a course
 *  rule exists; Not mapped when none does. Never Mapped. */
export function buildPreview(doc: ProjectDoc, date = new Date().toISOString().slice(0, 10)): Preview {
  const source = sourceFromProject(doc)
  const findings = auditFindings(source)
  const text = generateSysml(source, { purpose: doc.project.model.purpose || 'Model purpose not written yet: who uses this model, for which decisions (Week 8 lab, Session 1).', date }).text
  const active = Object.values(doc.artifacts).filter((a) => a.status === 'active')
  const suspect = new Set(Object.values(doc.relationships).filter((r) => r.status === 'suspect').flatMap((r) => [r.from, r.to]))
  const unadapted = active.filter((a) => a.provenance.kind === 'copied-from-practice' && !a.provenance.adapted)
  const rows: PreviewRow[] = []
  const statusOf = (id: string, prefix: string, review: boolean, practice: boolean): { status: MappingStatus; reason: string; findings: Finding[] } => {
    const f = findings.filter((x) => x.id === id)
    const rule = mappingOf(prefix)
    if (practice) return { status: 'invalid-or-incomplete', reason: 'Copied from the AeroLink practice and not adapted yet: practice content must not enter your model.', findings: f }
    const block = f.find((x) => BLOCKING.has(x.cls))
    if (block) return { status: 'invalid-or-incomplete', reason: block.text, findings: f }
    if (review) return { status: 'needs-review', reason: 'Changed upstream since it was written: review it in My Project, then the mapping can be confirmed.', findings: f }
    if (!rule) return { status: 'not-mapped', reason: 'The course mapping has no rule for this kind yet.', findings: f }
    return { status: 'mapping-proposed', reason: `Proposed: ${rule.construct} in package ${rule.pkg}${rule.modeledIn > 8 ? `, modeled in Week ${rule.modeledIn}` : ''}. You confirm it in Week 8.`, findings: f }
  }
  for (const a of active) {
    if (!PREVIEW_PREFIXES.includes(a.type as (typeof PREVIEW_PREFIXES)[number])) continue
    const practice = a.provenance.kind === 'copied-from-practice' && !a.provenance.adapted
    rows.push({ uid: a.uid, id: a.id, title: a.title || a.description, prefix: a.type, ...statusOf(a.id, a.type, a.review.state === 'needs-review' || suspect.has(a.uid), practice) })
  }
  for (const r of Object.values(doc.relationships).filter((x) => x.category === 'stakeholder' && x.status !== 'retired')) {
    const from = doc.artifacts[r.from]?.id ?? String(r.attributes?.fromText ?? '')
    const to = doc.artifacts[r.to]?.id ?? String(r.attributes?.toText ?? '')
    rows.push({ uid: r.uid, id: r.id, title: `${from || '?'} ${r.type || '(type not chosen)'} ${to || '?'}`, prefix: 'REL', ...statusOf(r.id, 'REL', r.status === 'suspect', false) })
  }
  const groups = MAPPING_KINDS.filter((k) => PREVIEW_PREFIXES.includes(k.prefix as (typeof PREVIEW_PREFIXES)[number])).map((kind) => ({ kind, rows: rows.filter((r) => r.prefix === kind.prefix).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })) }))
  const counts = { 'not-mapped': 0, 'mapping-proposed': 0, mapped: 0, 'needs-review': 0, 'invalid-or-incomplete': 0 } as Record<MappingStatus, number>
  for (const r of rows) counts[r.status]++
  return { source, findings, groups, text, counts, unadapted: unadapted.map((a) => a.id) }
}
