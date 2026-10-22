// Week 7 package record (pure logic, no React): the team's Systems Thinking Engineering Package, assembled from its six
// weekly exports (Part 28), audited for cross-week consistency and traceability with a disposition for every finding
// (Part 29), with the executive summary and lessons learned (Part 30), the design review preparation (Part 31), the review
// findings received and their dispositions (Part 32) and the package AI usage summary.
//
// Sources are kept as the RAW TEXT of each week's export and parsed with THAT WEEK'S OWN importer (read-only): Week 1
// importModelInputs, Weeks 2–6 importWeekN. Nothing in an earlier week's record is changed here; a finding is fixed by
// correcting the week's record in its own lab tool and importing the new export, after which the audit no longer finds it.
// The only dispositions a team types are accept (with a rationale and an evidence reference) and defer (with the rationale,
// the owner and the Phase II week it closes in); a rationale that only claims completion ("Fixed", "Resolved", "Withdrawn")
// fails, and a collision (two elements sharing an ID) cannot be accepted (Week 7 review M2, M3), so the tool never holds a
// claim it cannot test.
//
// Single sources: every gate, advisory, finding kind, layer, disposition, section and part comes from
// src/content/lectures/week07/labBrief.ts. Free-text gates use the shared src/workbench/emptyAnswer.ts: one word counts,
// an answer that says nothing ("n/a", "none", "?", "-", "later", "TBD") does not. Findings carry STABLE keys (kind plus the
// IDs or weeks they concern), so a disposition survives a re-import. Normalize never throws; IDs issued (RID) are never
// reused; checks return { ok, issues, detail, notes }; export as Markdown and as the week7-package v1 JSON documented in
// docs/lectures/week07/WEEK7_PACKAGE_FORMAT.md; a teammate's package replaces the record only after a confirmation (A22).
// AeroLink is the instructor's worked example: a file about AeroLink is refused.
import {
  COVERAGE_LAYERS, DISPOSITIONS, FINDING_ADVISORIES, FINDING_GATES, FINDING_KINDS, PACKAGE_FORMAT, PACKAGE_SECTIONS, PACKAGE_VERSION, PART_RULES, PREP_ADVISORIES, PREP_GATES, RID_ADVISORIES, RID_DISPOSITIONS, RID_GATES, SEVERITIES,
  SOURCE_ADVISORIES, SOURCE_GATES, SOURCE_WEEKS, SUMMARY_GATES, WEEK7_PARTS, isCompletionClaim, DEFER_WEEKS, WEEK_REF, sameElement,
  type DispositionId, type FindingAdvisoryId, type FindingGateId, type FindingKind, type LayerId, type PackageState, type PrepAdvisoryId, type PrepGateId, type RidAdvisoryId, type RidDispositionId, type RidGateId, type SectionId, type SeverityId,
  type SourceAdvisoryId, type SourceGateId, type SourceWeek, type SummaryGateId,
} from '../../content/lectures/week07/labBrief'
import { importModelInputs, isAeroLink, type TeamRecord } from '../week1/team'
import { importWeek2, type Week2Record } from '../week2/record'
import { importWeek3, type Week3Record } from '../week3/record'
import { importWeek4, type Week4Record } from '../week4/record'
import { importWeek5, type Week5Record } from '../week5/record'
import { importWeek6, type Week6Record } from '../week6/record'
import { said } from '../emptyAnswer'

export const W7_KEY = 'w7.package'
export const MIN_AI_WORDS = 12
export { PACKAGE_FORMAT, PACKAGE_VERSION, isAeroLink }

// ---------------------------------------------------------------------------------------------- types
export type Disposition = { disposition: DispositionId | ''; reason: string; owner: string; /** the Phase II week a deferred finding closes in, '8'…'14' */ week: string }
export type Summary = { recommendation: string; evidence: string; conditions: string; residual: string; decisions: string; next: string }
export type Rid = { id: string; from: string; location: string; finding: string; criterion: string; severity: SeverityId | ''; disposition: RidDispositionId | ''; response: string; owner: string }
export type Week7Record = {
  /** The raw text of each week's export, keyed by week (1–6). */
  sources: Partial<Record<SourceWeek, string>>
  /** Dispositions the team typed, by finding key. A finding with no entry uses its pre-filled disposition, if any. */
  dispositions: Record<string, Disposition>
  summary: Summary
  /** One lesson per line. */
  lessons: string
  owners: Partial<Record<SectionId, string>>
  /** 'TRADE' (the Week 3 trade decision) or a Week 4 DEC id. */
  decision: string
  threadNeed: string
  rids: Rid[]
  aiStatement: string
  issued: { RID: number }
  updatedAt?: number
  exportedMdAt?: number
  exportedJsonAt?: number
}
export const EMPTY_SUMMARY: Summary = { recommendation: '', evidence: '', conditions: '', residual: '', decisions: '', next: '' }
export const EMPTY_RECORD: Week7Record = { sources: {}, dispositions: {}, summary: EMPTY_SUMMARY, lessons: '', owners: {}, decision: '', threadNeed: '', rids: [], aiStatement: '', issued: { RID: 0 } }
export const EMPTY_RID = (id: string): Rid => ({ id, from: '', location: '', finding: '', criterion: '', severity: '', disposition: '', response: '', owner: '' })

export type Gate<T extends string = string> = { id: T; ok: boolean; message: string }
export type Advisory<T extends string = string> = { id: T; message: string }
export type Assessment<G extends string, A extends string> = { gates: Gate<G>[]; advisories: Advisory<A>[]; counts: boolean }
export type PartCheck = { ok: boolean; issues: string[]; detail: string; notes?: string[] }

// ---------------------------------------------------------------------------------------------- helpers
const str = (x: unknown) => (typeof x === 'string' ? x : x === undefined || x === null ? '' : String(x))
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const objs = (x: unknown): Record<string, unknown>[] => (Array.isArray(x) ? x.filter(isObj) : [])
const oneOf = <T extends string>(x: unknown, allowed: readonly T[]): T | '' => (allowed.includes(x as T) ? (x as T) : '')
export const words = (s: string) => s.split(/\s+/).filter(Boolean).length
const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
const pad = (n: number) => String(n).padStart(3, '0')
const num = (id: string) => Number(id.split('-').pop()) || 0
const ANY_ID = /\b(?:REQ-(?:STK|SYS)|NEED|MGO|STK|CON|EXT|PRT|SCN|CAP|MOE|MOP|TPM|TECH|ALT|CRIT|R|O|A|U|I|VP|FG|FN|LOG|PHY|DEC|INFO|AI|CMP|IF|ICR|GAP|INC|RID)-\d{3}\b/g
/** The IDs written in a free-text field, upper-cased, each once. */
export const idsIn = (s: string) => [...new Set(s.toUpperCase().match(ANY_ID) ?? [])]
export const prefixOf = (id: string) => id.replace(/-\d{3}$/, '')
const norm = (s: string) => s.toLowerCase().replace(/[.;:!]+$/, '').replace(/\s+/g, ' ').trim()
const WEEKS = SOURCE_WEEKS.map((w) => w.week) as SourceWeek[]
const MISSING = (what: string) => `missing: ${what}`
const EMPTY_MSG = (what: string) => `says nothing (“n/a”, “none”, “?”, “TBD” are not ${what})`
const textGate = <T extends string>(id: T, s: string, what: string): Gate<T> => ({ id, ok: said(s), message: !s.trim() ? MISSING(what) : said(s) ? 'written' : EMPTY_MSG(what) })
/** A Phase II week as text ('8'…'14'), or '' (a stored number or "Week 9" is accepted). */
export const weekOf = (x: unknown): string => {
  const m = str(x).match(/(\d{1,2})/)
  return m && (DEFER_WEEKS as readonly number[]).includes(Number(m[1])) ? m[1] : ''
}

// ---------------------------------------------------------------------------------------------- loading the sources
export type Loaded =
  | { week: 1; raw: Record<string, unknown>; rec: TeamRecord; status: string; version: number }
  | { week: 2; raw: Record<string, unknown>; rec: Week2Record; status: string; version: number }
  | { week: 3; raw: Record<string, unknown>; rec: Week3Record; status: string; version: number }
  | { week: 4; raw: Record<string, unknown>; rec: Week4Record; status: string; version: number }
  | { week: 5; raw: Record<string, unknown>; rec: Week5Record; status: string; version: number }
  | { week: 6; raw: Record<string, unknown>; rec: Week6Record; status: string; version: number }
type ByWeek = { 1?: TeamRecord; 2?: Week2Record; 3?: Week3Record; 4?: Week4Record; 5?: Week5Record; 6?: Week6Record }

/** The enterprise, system of interest and team a week's record names (its own or its snapshot of the earlier week). */
export function namesOf(l: Loaded): { enterprise: string; soi: string; team: string } {
  switch (l.week) {
    case 1:
      return { enterprise: l.rec.proposal.name.trim(), soi: l.rec.proposal.soi.trim(), team: l.rec.team.trim() }
    case 2:
      return { enterprise: (l.rec.week1?.enterprise ?? '').trim(), soi: (l.rec.week1?.soi ?? '').trim(), team: (l.rec.week1?.team ?? '').trim() }
    case 3:
      return { enterprise: (l.rec.week2?.enterprise ?? '').trim(), soi: (l.rec.week2?.soi ?? '').trim(), team: (l.rec.week2?.team ?? '').trim() }
    case 4:
      return { enterprise: (l.rec.week3?.enterprise ?? '').trim(), soi: (l.rec.week3?.soi ?? '').trim(), team: (l.rec.week3?.team ?? '').trim() }
    case 5:
      return { enterprise: (l.rec.week4?.enterprise ?? '').trim(), soi: (l.rec.week4?.soi ?? '').trim(), team: (l.rec.week4?.team ?? '').trim() }
    case 6:
      return { enterprise: (l.rec.week5?.enterprise ?? '').trim(), soi: (l.rec.week5?.soi ?? '').trim(), team: (l.rec.week5?.team ?? '').trim() }
  }
}

const FORMAT_WEEK: Record<string, SourceWeek> = Object.fromEntries(SOURCE_WEEKS.map((w) => [w.format, w.week]))
const cache = new Map<string, Loaded | { error: string }>()

/** Reads one weekly export with its week's own importer. Refuses anything else with a message the student can act on;
 *  never throws. */
export function loadSource(text: string): Loaded | { error: string } {
  const hit = cache.get(text)
  if (hit) return hit
  const out = loadUnsafe(text)
  if (cache.size > 40) cache.clear()
  cache.set(text, out)
  return out
}
function loadUnsafe(text: string): Loaded | { error: string } {
  try {
    let d: unknown
    try {
      d = JSON.parse(text)
    } catch {
      return { error: 'This file is not valid JSON. Choose the model-inputs file (.json) exported from a weekly lab tool, not the Markdown record.' }
    }
    if (!isObj(d)) return { error: `This file holds ${Array.isArray(d) ? 'a list' : 'no object'}, not a lab-tool export.` }
    if (d.format === undefined) return { error: 'This file has no “format”: it is not a lab-tool export. Choose a team-NN-weekN-model-inputs.json file.' }
    if (d.format === PACKAGE_FORMAT) return { error: 'This is a Week 7 package file: use “Import a teammate’s Week 7 package” to load it.' }
    const week = FORMAT_WEEK[str(d.format)]
    if (!week) return { error: `This file’s format is ${JSON.stringify(d.format)}; the package is built from the Week 1–6 model-inputs files (${SOURCE_WEEKS.map((w) => w.format).join(', ')}).` }
    if (typeof d.version === 'string') return { error: `This Week ${week} file gives its version as text (“${d.version}”); export it again from the Week ${week} lab tool.` }
    const status = str(d.status)
    const version = typeof d.version === 'number' ? d.version : 0
    let l: Loaded
    switch (week) {
      case 1: {
        const rec = importModelInputs(text)
        if ('error' in rec) return { error: `Week 1 file: ${rec.error}` }
        l = { week, raw: d, rec, status, version }
        break
      }
      case 2: {
        const rec = importWeek2(text)
        if ('error' in rec) return { error: `Week 2 file: ${rec.error}` }
        l = { week, raw: d, rec, status, version }
        break
      }
      case 3: {
        const rec = importWeek3(text)
        if ('error' in rec) return { error: `Week 3 file: ${rec.error}` }
        l = { week, raw: d, rec, status, version }
        break
      }
      case 4: {
        const rec = importWeek4(text)
        if ('error' in rec) return { error: `Week 4 file: ${rec.error}` }
        l = { week, raw: d, rec, status, version }
        break
      }
      case 5: {
        const rec = importWeek5(text)
        if ('error' in rec) return { error: `Week 5 file: ${rec.error}` }
        l = { week, raw: d, rec, status, version }
        break
      }
      case 6: {
        const rec = importWeek6(text)
        if ('error' in rec) return { error: `Week 6 file: ${rec.error}` }
        l = { week, raw: d, rec, status, version }
        break
      }
    }
    const n = namesOf(l)
    if ([n.enterprise, n.soi].some(isAeroLink)) return { error: `This Week ${week} file is about AeroLink, the instructor’s worked example. Import your team’s own export.` }
    return l
  } catch (e) {
    return { error: `This file could not be read as a weekly export (${e instanceof Error ? e.message : String(e)}).` }
  }
}

/** Adds one file's text under its week (replacing only that week). */
export function withSource(r: Week7Record, text: string): { record: Week7Record; loaded: Loaded } | { error: string } {
  const l = loadSource(text)
  if ('error' in l) return l
  return { record: { ...r, sources: { ...r.sources, [l.week]: text } }, loaded: l }
}

// ---------------------------------------------------------------------------------------------- normalize
/** Fills missing fields of a stored or imported record. Never throws. */
export function normalizePackage(v: unknown): Week7Record {
  const r = isObj(v) ? v : {}
  const src = isObj(r.sources) ? r.sources : {}
  const sources: Partial<Record<SourceWeek, string>> = {}
  for (const w of WEEKS) if (typeof src[w] === 'string' && src[w]) sources[w] = src[w] as string
  const dIn = isObj(r.dispositions) ? r.dispositions : {}
  const dispositions: Record<string, Disposition> = {}
  for (const [k, x] of Object.entries(dIn)) if (isObj(x)) dispositions[k] = { disposition: oneOf(x.disposition, DISPOSITIONS.map((d) => d.id)), reason: str(x.reason), owner: str(x.owner), week: weekOf(x.week) }
  const s = isObj(r.summary) ? r.summary : {}
  const o = isObj(r.owners) ? r.owners : {}
  const owners: Partial<Record<SectionId, string>> = {}
  for (const sec of PACKAGE_SECTIONS) if (typeof o[sec.id] === 'string') owners[sec.id] = o[sec.id] as string
  const rids: Rid[] = objs(r.rids).map((x) => ({
    id: str(x.id).trim().toUpperCase(), from: str(x.from), location: str(x.location), finding: str(x.finding), criterion: str(x.criterion), severity: oneOf(x.severity, SEVERITIES.map((v) => v.id)),
    disposition: oneOf(x.disposition, RID_DISPOSITIONS.map((v) => v.id)), response: str(x.response), owner: str(x.owner),
  }))
  const iss = isObj(r.issued) ? r.issued : {}
  const issuedRid = Math.max(typeof iss.RID === 'number' && Number.isInteger(iss.RID) && iss.RID > 0 ? iss.RID : 0, ...rids.map((x) => num(x.id)), 0)
  return {
    sources, dispositions,
    summary: { recommendation: str(s.recommendation), evidence: str(s.evidence), conditions: str(s.conditions), residual: str(s.residual), decisions: str(s.decisions), next: str(s.next) },
    lessons: str(r.lessons), owners, decision: str(r.decision), threadNeed: str(r.threadNeed).trim().toUpperCase(), rids, aiStatement: str(r.aiStatement), issued: { RID: issuedRid },
    updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : undefined, exportedMdAt: typeof r.exportedMdAt === 'number' ? r.exportedMdAt : undefined, exportedJsonAt: typeof r.exportedJsonAt === 'number' ? r.exportedJsonAt : undefined,
  }
}
export const nextRid = (r: Week7Record) => `RID-${pad(Math.max(r.issued.RID, ...r.rids.map((x) => num(x.id)), 0) + 1)}`
export const hasWork = (r: Week7Record) => Object.keys(r.sources).length > 0 || Object.keys(r.dispositions).length > 0 || r.rids.length > 0 || Object.values(r.summary).some((x) => x.trim()) || !!r.lessons.trim() || !!r.aiStatement.trim()

// ---------------------------------------------------------------------------------------------- the package model
export type IndexEntry = { id: string; name: string; prefix: string; week: SourceWeek; /** other weeks that define the same ID for a different element (a collision, review M3) */ others?: { week: SourceWeek; name: string }[] }
export type Relationship = { from: string; type: string; to: string }
export type Coverage = { id: LayerId; label: string; covered: number; total: number; pct: number; uncovered: string[] }
export type Finding = {
  key: string
  kind: FindingKind
  ids: string[]
  weeks: SourceWeek[]
  text: string
  /** A disposition an earlier week already recorded (carried) or the Week 6 owner of an open item. */
  prefill?: Disposition & { carried: boolean }
}
export type Thread = { need: string; hops: { layer: string; ids: string[] }[]; reachesSys: boolean; reachesArch: boolean; reachesInterface: boolean; reachesRoadmap: boolean }
export type Pkg = {
  loaded: Partial<Record<SourceWeek, Loaded>>
  errors: { week: SourceWeek; error: string }[]
  by: ByWeek
  index: Map<string, IndexEntry>
  relationships: Relationship[]
  findings: Finding[]
  coverage: Coverage[]
  enterprise: string
  team: string
  /** Weeks not loaded: findings that depend on them are withheld (review m3). */
  missing: SourceWeek[]
}

type Pair = { id: string; name: string }
/** What each week DEFINES (its own artifacts). */
function ownOf(l: Loaded): Pair[] {
  const p = (id: string, name: string): Pair => ({ id: id.trim().toUpperCase(), name: name.trim() })
  switch (l.week) {
    case 1: {
      const t = l.rec
      return [
        ...t.stakeholders.map((s) => p(s.id, s.name)), ...t.stakeholders.flatMap((s) => s.concerns.map((c) => p(c.id, c.text))), ...t.needs.map((n) => p(n.id, n.name)),
        p('MGO-001', t.proposal.purpose), ...t.proposal.goals.map((g) => p(g.id, g.text)), ...t.context.map((c) => p(c.id, c.name)), ...t.proposal.inside.map((x) => p(x.id, x.name)),
      ]
    }
    case 2: {
      const r = l.rec
      return [
        ...r.scenarios.map((x) => p(x.id, x.name)), ...r.capabilities.map((x) => p(x.id, x.name)), ...r.requirements.map((x) => p(x.id, x.name)), ...r.moes.map((x) => p(x.id, x.name)), ...r.mops.map((x) => p(x.id, x.name)),
        ...r.uncertainties.map((x) => p(x.id, x.name)), ...r.needsAdded.map((x) => p(x.id, x.name)),
      ]
    }
    case 3: {
      const r = l.rec
      return [
        ...r.technologies.map((x) => p(x.id, x.name)), ...r.assumptions.filter((x) => !x.fromWeek2).map((x) => p(x.id, x.name)), ...r.unknowns.filter((x) => !x.fromWeek2).map((x) => p(x.id, x.name)),
        ...r.risks.map((x) => p(x.id, x.name)), ...r.opportunities.map((x) => p(x.id, x.name)), ...r.issues.map((x) => p(x.id, x.name)), ...r.tpms.map((x) => p(x.id, x.name)),
        ...r.trade.alternatives.map((x) => p(x.id, x.name)), ...r.trade.criteria.map((x) => p(x.id, x.name)),
      ]
    }
    case 4: {
      const r = l.rec
      return [
        ...r.viewpoints.map((x) => p(x.id, x.name)), ...r.groups.map((x) => p(x.id, x.name)), ...r.functions.map((x) => p(x.id, x.name)), ...r.logical.map((x) => p(x.id, x.name)), ...r.physical.map((x) => p(x.id, x.name)),
        ...r.externals.map((x) => p(x.id, x.name)), ...r.decisions.map((x) => p(x.id, x.question)), ...r.information.map((x) => p(x.id, x.name)), ...r.ai.map((x) => p(x.id, x.name)),
      ]
    }
    case 5: {
      const r = l.rec
      return [...r.components.map((x) => p(x.id, x.name)), ...r.interfaces.map((x) => p(x.id, x.name)), ...r.requirements.map((x) => p(x.id, x.name)), ...r.changes.map((x) => p(x.id, x.change)), ...r.externals.map((x) => p(x.id, x.name))]
    }
    case 6: {
      const r = l.rec
      return [...r.gaps.map((x) => p(x.id, x.capability)), ...r.increments.map((x) => p(x.id, x.name)), ...r.technologies.map((x) => p(x.id, x.name)), ...r.unknowns.map((x) => p(x.id, x.name)), ...r.arou.map((x) => p(x.id, x.statement))]
    }
  }
}

/** What a later week's file carries about earlier weeks (its embedded snapshot), and which (defining week, prefix) pairs
 *  that snapshot is meant to carry in full. */
function snapshotOf(l: Loaded): { pairs: Pair[]; carries: { week: SourceWeek; prefix: string }[] } {
  const P = (xs: { id: string; name?: string; statement?: string; question?: string }[] | undefined) => (xs ?? []).map((x) => ({ id: x.id.trim().toUpperCase(), name: (x.name ?? x.statement ?? x.question ?? '').trim() }))
  const c = (week: SourceWeek, ...prefixes: string[]) => prefixes.map((prefix) => ({ week, prefix }))
  const reqs = [...c(2, 'REQ-STK', 'REQ-SYS')]
  switch (l.week) {
    case 1:
      return { pairs: [], carries: [] }
    case 2: {
      const s = l.rec.week1
      return { pairs: s ? [...P(s.needs), ...P(s.stakeholders), ...P(s.goals)] : [], carries: s ? c(1, 'NEED', 'STK') : [] }
    }
    case 3: {
      const s = l.rec.week2
      return { pairs: s ? [...P(s.needs), ...P(s.requirements), ...P(s.capabilities), ...P(s.scenarios), ...P(s.moes), ...P(s.mops)] : [], carries: s ? [...c(1, 'NEED'), ...c(2, 'NEED', 'CAP', 'SCN', 'MOE', 'MOP'), ...reqs] : [] }
    }
    case 4: {
      const s = l.rec.week3
      return { pairs: s ? [...P(s.needs), ...P(s.capabilities), ...P(s.scenarios), ...P(s.requirements), ...P(s.risks), ...P(s.tpms)] : [], carries: s ? [...c(1, 'NEED'), ...c(2, 'NEED', 'CAP', 'SCN'), ...reqs, ...c(3, 'R', 'TPM')] : [] }
    }
    case 5: {
      const s = l.rec.week4
      return {
        pairs: s ? [...P(s.needs), ...P(s.capabilities), ...P(s.requirements), ...P(s.risks), ...P(s.tpms), ...P(s.physical), ...P(s.externals), ...P(s.functions), ...P(s.information), ...P(s.ai), ...P(s.decisions)] : [],
        carries: s ? [...c(1, 'NEED'), ...c(2, 'NEED', 'CAP'), ...reqs, ...c(3, 'R', 'TPM'), ...c(4, 'PHY', 'FN', 'INFO', 'AI', 'DEC')] : [],
      }
    }
    case 6: {
      const s = l.rec.week5
      const x = l.rec.week3
      return {
        pairs: [
          ...(s ? [...P(s.needs), ...P(s.capabilities), ...P(s.requirements), ...P(s.risks), ...P(s.tpms), ...P(s.physical), ...P(s.externals), ...P(s.functions), ...P(s.information), ...P(s.ai), ...P(s.decisions), ...P(s.components), ...P(s.interfaces)] : []),
          ...(x ? P(x.technologies) : []),
        ],
        carries: [...(s ? [...c(1, 'NEED'), ...c(2, 'NEED', 'CAP'), ...reqs, ...c(3, 'R', 'TPM'), ...c(4, 'PHY', 'FN', 'INFO', 'AI', 'DEC'), ...c(5, 'CMP', 'IF', 'REQ-SYS')] : []), ...(x ? c(3, 'TECH') : [])],
      }
    }
  }
}

const pkgCache = new Map<string, Pkg>()
/** The package computed from the record's sources (memoized by the source texts). */
export function packageOf(r: Pick<Week7Record, 'sources'>): Pkg {
  const key = WEEKS.map((w) => r.sources[w] ?? '').join('\u0000')
  const hit = pkgCache.get(key)
  if (hit) return hit
  const p = buildPackage(r.sources)
  if (pkgCache.size > 20) pkgCache.clear()
  pkgCache.set(key, p)
  return p
}

function buildPackage(sources: Partial<Record<SourceWeek, string>>): Pkg {
  const loaded: Partial<Record<SourceWeek, Loaded>> = {}
  const errors: { week: SourceWeek; error: string }[] = []
  for (const w of WEEKS) {
    const t = sources[w]
    if (!t) continue
    const l = loadSource(t)
    if ('error' in l) errors.push({ week: w, error: l.error })
    else if (l.week !== w) errors.push({ week: w, error: `The file stored as Week ${w} is a Week ${l.week} export.` })
    else loaded[w] = l
  }
  const by = Object.fromEntries(Object.entries(loaded).map(([w, l]) => [w, l!.rec])) as ByWeek

  // ---- index: first definer wins
  const own: Partial<Record<SourceWeek, Map<string, string>>> = {}
  const index = new Map<string, IndexEntry>()
  for (const w of WEEKS) {
    const l = loaded[w]
    if (!l) continue
    const m = new Map<string, string>()
    for (const x of ownOf(l)) if (x.id && !m.has(x.id)) m.set(x.id, x.name)
    own[w] = m
    for (const [id, name] of m) {
      const e = index.get(id)
      if (!e) index.set(id, { id, name, prefix: prefixOf(id), week: w })
      else if (!sameElement(name, e.name)) e.others = [...(e.others ?? []), { week: w, name }]
    }
  }
  const has = (id: string) => index.has(id)

  // ---- relationships (typed traces)
  const rels: Relationship[] = []
  const rel = (from: string, type: string, to: string) => from && to && rels.push({ from, type, to })
  const w2 = by[2], w4 = by[4], w5 = by[5], w6 = by[6]
  type Req = { id: string; parents: string[]; iface: string }
  const requirements: Req[] = [
    ...(w2?.requirements ?? []).map((q) => ({ id: q.id.toUpperCase(), parents: idsIn(q.parents), iface: '' })),
    ...(w5?.requirements ?? []).map((q) => ({ id: q.id.toUpperCase(), parents: idsIn(q.parents), iface: idsIn(q.interface)[0] ?? '' })),
  ]
  for (const q of requirements) for (const pid of q.parents) rel(q.id, 'traces to', pid)
  for (const c of w2?.capabilities ?? []) for (const n of c.needs) rel(c.id, 'serves', n.toUpperCase())
  for (const f of w4?.functions ?? []) {
    for (const q of idsIn(f.requirements)) rel(f.id, 'satisfies', q)
    for (const c of idsIn(f.capabilities)) rel(f.id, 'delivers', c)
    for (const ph of idsIn(f.phy)) rel(f.id, 'allocated to', ph)
  }
  for (const ph of w4?.physical ?? []) for (const q of idsIn(ph.requirements)) rel(ph.id, 'satisfies', q)
  for (const c of w5?.components ?? []) rel(c.id, 'part of', c.parent.toUpperCase())
  for (const a of w4?.ai ?? []) if (idsIn(a.host)[0]) rel(a.id, 'hosted by', idsIn(a.host)[0])
  for (const x of w5?.interfaces ?? []) {
    for (const e of [x.endA, x.endB]) if (e.trim()) rel(x.id, 'connects', e.trim().toUpperCase())
    for (const q of idsIn(x.requirements)) rel(q, 'carried by', x.id)
  }
  for (const q of requirements) if (q.iface) rel(q.id, 'carried by', q.iface)
  for (const x of w6?.increments ?? []) {
    for (const s of idsIn(x.serves)) rel(x.id, 'serves', s)
    for (const d of idsIn(x.dependencies)) rel(d, 'precedes', x.id)
  }
  for (const g of w6?.gaps ?? []) for (const s of idsIn(g.sources)) rel(g.id, 'traces to', s)
  for (const t of w6?.technologies ?? []) if (idsIn(t.insertion)[0]) rel(idsIn(t.insertion)[0], 'delivers', t.id)
  for (const u of w6?.unknowns ?? []) if (idsIn(u.gates)[0]) rel(u.id, 'affects', idsIn(u.gates)[0])
  const relationships = rels.filter((x, i) => rels.findIndex((y) => y.from === x.from && y.type === x.type && y.to === x.to) === i)

  // ---- trace lookups
  const reqParents = (id: string) => requirements.filter((q) => q.parents.includes(id)).map((q) => q.id)
  const fnCarried = new Set((w4?.functions ?? []).flatMap((f) => idsIn(f.requirements)))
  const phyCarried = new Set((w4?.physical ?? []).flatMap((p) => idsIn(p.requirements)))
  const ifIds = new Set((w5?.interfaces ?? []).map((x) => x.id.toUpperCase()))
  const ifCarried = new Set([...(w5?.interfaces ?? []).flatMap((x) => idsIn(x.requirements)), ...requirements.filter((q) => q.iface && ifIds.has(q.iface)).map((q) => q.id)])
  const archCarries = (id: string) => fnCarried.has(id) || phyCarried.has(id) || ifCarried.has(id)
  const needs = [...new Set([...(by[1]?.needs ?? []).map((n) => n.id.toUpperCase()), ...(w2?.week1?.needs ?? []).map((n) => n.id.toUpperCase()), ...(w2?.needsAdded ?? []).map((n) => n.id.toUpperCase())])]
  const needCovered = (n: string) => reqParents(n).some((c) => c.startsWith('REQ-STK-'))
  const stks = requirements.filter((q) => q.id.startsWith('REQ-STK-')).map((q) => q.id)
  const stkCovered = (s: string) => reqParents(s).some((c) => c.startsWith('REQ-SYS-')) || archCarries(s)
  const syss = requirements.filter((q) => q.id.startsWith('REQ-SYS-')).map((q) => q.id)
  // an AI capability as an interface end stands for the element that hosts it (Week 4 AI card host), as in Week 5
  const hostOf = new Map((w4?.ai ?? []).map((a) => [a.id.toUpperCase(), idsIn(a.host)[0] ?? '']))
  const ends = new Set((w5?.interfaces ?? []).flatMap((x) => [x.endA, x.endB].map((e) => e.trim().toUpperCase())).flatMap((e) => (hostOf.get(e) ? [e, hostOf.get(e)!] : [e])))
  const phys = (w4?.physical ?? []).map((p) => p.id.toUpperCase())
  const phyCovered = (p: string) => ends.has(p) || (w5?.components ?? []).some((c) => c.parent.toUpperCase() === p && ends.has(c.id.toUpperCase()))
  const laterIncs = (w6?.increments ?? []).filter((x) => !x.baseline)
  const incCovered = (x: { serves: string }) => idsIn(x.serves).length > 0 && idsIn(x.serves).every(has)

  // ---- findings
  const findings: Finding[] = []
  const add = (f: Finding) => findings.push(f)
  const names = Object.fromEntries(Object.entries(loaded).map(([w, l]) => [w, namesOf(l!)])) as Partial<Record<SourceWeek, ReturnType<typeof namesOf>>>
  const ents = [...new Set(Object.values(names).map((n) => norm(n!.enterprise)).filter(Boolean))]
  if (ents.length > 1) add({ key: 'enterprise', kind: 'enterprise', ids: [], weeks: WEEKS.filter((w) => loaded[w]), text: `The files name ${ents.length} enterprises: ${WEEKS.filter((w) => names[w]).map((w) => `Week ${w} “${names[w]!.enterprise || '(none)'}”`).join(', ')}.` })
  for (const w of WEEKS) {
    const l = loaded[w]
    if (l && l.status !== 'ready') add({ key: `not-ready:${w}`, kind: 'not-ready', ids: [], weeks: [w], text: `The Week ${w} file was exported with the status “${l.status || 'none'}”: its own lab tool did not judge it ready.` })
  }
  // stale, dangling, renamed
  const renamedIds = new Map<string, Set<string>>()
  const collisions = new Map<string, Set<string>>()
  const definers = (prefix: string, carries: { week: SourceWeek; prefix: string }[]) => carries.filter((c) => c.prefix === prefix).map((c) => c.week)
  for (const L of WEEKS) {
    const l = loaded[L]
    if (!l) continue
    const snap = snapshotOf(l)
    const snapIds = new Set(snap.pairs.map((x) => x.id))
    for (const { week: D, prefix } of snap.carries) {
      const m = own[D]
      if (!m || D >= L) continue
      const missing = [...m.keys()].filter((id) => prefixOf(id) === prefix && !snapIds.has(id))
      if (missing.length) add({ key: `stale:${L}:${D}:${prefix}`, kind: 'stale', ids: missing, weeks: [D, L], text: `The Week ${L} file was built from an older export: it does not carry ${plural(missing.length, `${prefix} ID`)} your Week ${D} record now defines (${missing.join(', ')}). Re-export the weeks in between from your latest records.` })
    }
    const byPrefix = new Map<string, string[]>()
    for (const x of snap.pairs) {
      const ds = definers(prefixOf(x.id), snap.carries).filter((d) => d < L)
      if (!ds.length || ds.some((d) => !own[d])) continue
      if (!ds.some((d) => own[d]!.has(x.id))) byPrefix.set(prefixOf(x.id), [...(byPrefix.get(prefixOf(x.id)) ?? []), x.id])
    }
    for (const [prefix, ids] of byPrefix) add({ key: `dangling:${L}:${prefix}`, kind: 'dangling', ids, weeks: [L], text: `The Week ${L} file carries ${plural(ids.length, `${prefix} ID`)} that the week which owns them no longer defines (${ids.join(', ')}): deleted or renumbered since.` })
    // a snapshot copy is compared with the week that OWNS that prefix in this snapshot (never with the first definer of
    // the ID in another week: review M3); same element, older wording = drift; a different element = a collision
    for (const x of snap.pairs) {
      const ds = definers(prefixOf(x.id), snap.carries).filter((d) => d < L && own[d]?.has(x.id))
      for (const d of ds) {
        const ownName = own[d]!.get(x.id)!
        if (!x.name || !ownName || norm(x.name) === norm(ownName)) continue
        if (sameElement(x.name, ownName)) renamedIds.set(`${L}:${x.id}`, new Set([`Week ${d} “${ownName}”`, `Week ${L} copy “${x.name}”`]))
        else collisions.set(x.id, new Set([...(collisions.get(x.id) ?? []), `Week ${d} “${ownName}”`, `Week ${L} “${x.name}”`]))
      }
    }
  }
  // the same ID DEFINED by two weeks' own records for different elements (for example a Week 1 context EXT and a Week 4
  // EXT numbered from 001): a collision, never a rename (identity rule, labBrief.sameElement)
  for (const e of index.values()) for (const o of e.others ?? []) collisions.set(e.id, new Set([...(collisions.get(e.id) ?? []), `Week ${e.week} “${e.name}”`, `Week ${o.week} “${o.name}”`]))
  const renamedBy = new Map<string, string[]>()
  for (const k of renamedIds.keys()) {
    const [L, id] = k.split(':')
    renamedBy.set(`${L}:${prefixOf(id)}`, [...(renamedBy.get(`${L}:${prefixOf(id)}`) ?? []), k])
  }
  for (const [g, keys] of renamedBy) {
    const [L, prefix] = g.split(':')
    add({ key: `renamed:${L}:${prefix}`, kind: 'renamed', ids: keys.map((k) => k.split(':')[1]), weeks: [Number(L) as SourceWeek], text: `The Week ${L} file carries older wording of ${plural(keys.length, `${prefix} element`)} (the same elements, renamed since): ${keys.map((k) => [...renamedIds.get(k)!].join(' / ')).join('; ')}. Re-export the Week ${L} record.` })
  }
  for (const [id, seen] of collisions) add({ key: `collision:${id}`, kind: 'collision', ids: [id], weeks: [], text: `${id} names two different elements: ${[...seen].join(' / ')}. Renumber it in the later week’s own tool and export again; until then defer it with an owner (it cannot be accepted).` })
  // recorded dispositions an earlier week holds (Week 2 audit dispositions)
  const w2disp = Object.fromEntries(Object.entries(w2?.dispositions ?? {}).map(([k, v]) => [k.toUpperCase(), v])) as Record<string, string>
  for (const [id, text] of Object.entries(w2disp)) {
    if (!said(text)) continue
    const closed = id.startsWith('NEED-') ? needCovered(id) : id.startsWith('REQ-STK-') ? stkCovered(id) : false
    if (closed) {
      const by2 = id.startsWith('NEED-') ? reqParents(id).filter((c) => c.startsWith('REQ-STK-')) : [...reqParents(id).filter((c) => c.startsWith('REQ-SYS-')), ...(archCarries(id) ? ['an architecture element'] : [])]
      add({ key: `stale-disposition:${id}`, kind: 'stale-disposition', ids: [id], weeks: [2], text: `Week 2 recorded ${id} as a gap (“${text.trim()}”), but the package now covers it (${by2.join(', ')}): withdraw the Week 2 disposition from the package.` })
    }
  }
  // an earlier-week disposition that deferred the gap ("Open item: …", "Deferred …", "planned for Week 3") is an OPEN ITEM:
  // if the gap is still open, nothing later carried it (review M1), so it is pre-filled as a deferral, never as accepted
  const OPEN_TEXT = /^\s*(open|defer|later|pending|to do|planned|revisit)|\bopen item\b|\bweek\s*\d+\b/i
  const carriedW2 = (id: string): Finding['prefill'] => {
    const t = w2disp[id]
    if (!t || !said(t)) return undefined
    return OPEN_TEXT.test(t) ? { disposition: 'defer', reason: t.trim(), owner: '', week: weekOf(t.match(/week\s*(\d+)/i)?.[1]), carried: true } : { disposition: 'record', reason: t.trim(), owner: '', week: '', carried: true }
  }
  const openW2 = (id: string) => !!w2disp[id] && said(w2disp[id]) && OPEN_TEXT.test(w2disp[id])
  const dropped = (id: string, gap: string): Finding => ({ key: `dropped-open-item:${id}`, kind: 'dropped-open-item', ids: [id], weeks: [2], text: `Week 2 recorded ${id} as an open item (“${w2disp[id].trim()}”); ${gap}, and no later week carried it.`, prefill: carriedW2(id) })
  // traceability, one finding per ID (withheld while a week they depend on is missing: review m3)
  const all = (...ws: SourceWeek[]) => ws.every((w) => loaded[w])
  if (all(1, 2)) for (const n of needs) if (!needCovered(n)) add(openW2(n) ? dropped(n, 'the need still has no stakeholder requirement') : { key: `childless-need:${n}`, kind: 'childless-need', ids: [n], weeks: [], text: `${n}${index.get(n)?.name ? ` “${index.get(n)!.name}”` : ''}: no stakeholder requirement names it as a parent.`, prefill: carriedW2(n) })
  if (all(1, 2)) for (const q of requirements) {
    const bad = q.parents.filter((x) => !has(x))
    if (!q.parents.length || bad.length) add({ key: `orphan:${q.id}`, kind: 'orphan', ids: [q.id], weeks: [], text: q.parents.length ? `${q.id}: its parent ${bad.join(', ')} does not exist in the package.` : `${q.id}: it has no parent.` })
  }
  if (all(4, 5)) for (const s of stks) if (!stkCovered(s)) add(openW2(s) ? dropped(s, 'it is still not flowed down') : { key: `childless-stk:${s}`, kind: 'childless-stk', ids: [s], weeks: [], text: `${s}${index.get(s)?.name ? ` “${index.get(s)!.name}”` : ''}: no system requirement refines it and no function or element carries it.`, prefill: carriedW2(s) })
  if (w4) for (const q of syss) if (!archCarries(q)) add({ key: `unallocated:${q}`, kind: 'unallocated', ids: [q], weeks: [], text: `${q}${index.get(q)?.name ? ` “${index.get(q)!.name}”` : ''}: no function, physical element or interface carries it.` })
  if (w4) for (const c of w2?.capabilities ?? []) if (!(w4.functions ?? []).some((f) => idsIn(f.capabilities).includes(c.id.toUpperCase()))) add({ key: `cap-no-function:${c.id.toUpperCase()}`, kind: 'cap-no-function', ids: [c.id.toUpperCase()], weeks: [], text: `${c.id.toUpperCase()} “${c.name.trim()}”: no function delivers it.` })
  if (w5) for (const p of phys) if (!phyCovered(p)) add({ key: `phy-no-interface:${p}`, kind: 'phy-no-interface', ids: [p], weeks: [], text: `${p}${index.get(p)?.name ? ` “${index.get(p)!.name}”` : ''}: neither it nor any of its components is an end of an interface.` })
  if (w5) {
    const exts = [...new Set([...(w4?.externals ?? []), ...w5.externals].map((x) => x.id.toUpperCase()))]
    const reasons = Object.fromEntries(Object.entries(w5.externalReasons ?? {}).map(([k, v]) => [k.toUpperCase(), v]))
    for (const e of exts) if (!ends.has(e) && !said(reasons[e] ?? '')) add({ key: `ext-no-interface:${e}`, kind: 'ext-no-interface', ids: [e], weeks: [], text: `${e}${index.get(e)?.name ? ` “${index.get(e)!.name}”` : ''}: no interface and no recorded reason for having none.` })
    for (const [e, why] of Object.entries(reasons)) if (said(why) && ends.has(e)) add({ key: `stale-disposition:${e}`, kind: 'stale-disposition', ids: [e], weeks: [5], text: `Week 5 recorded why ${e} has no interface (“${why.trim()}”), but it is now an interface end: withdraw the recorded reason.` })
  }
  if (all(1, 2, 3, 4, 5)) for (const x of laterIncs) {
    const bad = idsIn(x.serves).filter((s) => !has(s))
    if (bad.length) add({ key: `increment-unresolved:${x.id}`, kind: 'increment-unresolved', ids: [x.id, ...bad], weeks: [6], text: `${x.id} “${x.name.trim()}” serves ${bad.join(', ')}, which ${bad.length === 1 ? 'does' : 'do'} not exist in the package.` })
  }
  // one finding per item ID the row names (review m9), the row itself when it names none
  for (const row of w6?.review ?? []) {
    if (row.status !== 'open') continue
    const owner = row.owner.trim()
    const pre = { disposition: 'defer' as const, reason: `Carried from the Week 6 baseline review: ${row.items.trim()}`, owner, week: weekOf(owner.match(/week\s*(\d+)/i)?.[1]), carried: true }
    const ids = idsIn(row.items)
    if (!ids.length) add({ key: `open-item:${row.week}`, kind: 'open-item', ids: [], weeks: [6], text: `Week ${row.week} open item from the baseline review: ${row.items.trim() || '(not named)'}${owner ? ` (owner: ${owner})` : ''}.`, prefill: pre })
    for (const id of ids) add({ key: `open-item:${row.week}:${id}`, kind: 'open-item', ids: [id], weeks: [6], text: `Week ${row.week} open item from the baseline review: ${id}${index.get(id)?.name ? ` “${index.get(id)!.name}”` : ''}${owner ? ` (owner: ${owner})` : ''}.`, prefill: pre })
  }

  // ---- coverage
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 0)
  const layer = (id: LayerId, all: string[], ok: (x: string) => boolean): Coverage => {
    const unc = all.filter((x) => !ok(x))
    return { id, label: COVERAGE_LAYERS.find((x) => x.id === id)!.label, covered: all.length - unc.length, total: all.length, pct: pct(all.length - unc.length, all.length), uncovered: unc }
  }
  const coverage: Coverage[] = [
    layer('need-req', needs, needCovered),
    layer('stk-sys', stks, stkCovered),
    layer('sys-arch', syss, archCarries),
    layer('arch-if', phys, phyCovered),
    layer('roadmap', laterIncs.map((x) => x.id), (id) => incCovered(laterIncs.find((x) => x.id === id)!)),
  ]
  const ent = WEEKS.map((w) => names[w]?.enterprise).find(Boolean) ?? ''
  const team = WEEKS.map((w) => names[w]?.team).find(Boolean) ?? ''
  return { loaded, errors, by, index, relationships, findings, coverage, enterprise: ent, team, missing: WEEKS.filter((w) => !loaded[w]) }
}

// ---------------------------------------------------------------------------------------------- findings: dispositions
/** The disposition in force for a finding: the team's own, else the pre-filled one. */
export function dispositionOf(r: Week7Record, f: Finding): Disposition & { carried: boolean } {
  const own = r.dispositions[f.key]
  if (own) return { ...own, carried: !!f.prefill && own.disposition === f.prefill.disposition && own.reason.trim() === f.prefill.reason.trim() }
  return f.prefill ?? { disposition: '', reason: '', owner: '', week: '', carried: false }
}
/** The gates of one finding's disposition (labBrief FINDING_GATES). `kind` makes a collision unacceptable; `has` checks the
 *  evidence IDs against the package index (any ID counts when it is not given). */
/** A finding's disposition in force, assessed with its kind and the package index. */
export const assessFindingIn = (r: Week7Record, f: Finding, pkg: Pkg) => assessFinding(dispositionOf(r, f), { kind: f.kind, has: (id) => pkg.index.has(id) })
export function assessFinding(d: Pick<Disposition, 'disposition' | 'reason' | 'owner'> & { week?: string; carried?: boolean }, ctx: { kind?: FindingKind; has?: (id: string) => boolean } = {}): Assessment<FindingGateId, FindingAdvisoryId> {
  const collision = ctx.kind === 'collision'
  const dispOk = d.disposition === 'defer' || (d.disposition === 'record' && !collision)
  const claim = isCompletionClaim(d.reason)
  const gates: Gate<FindingGateId>[] = [
    { id: 'disposition', ok: dispOk, message: !d.disposition ? MISSING('accept with rationale, or defer') : dispOk ? DISPOSITIONS.find((x) => x.id === d.disposition)!.label : 'two elements share this ID: a collision cannot be accepted; renumber it in the later week’s tool, or defer it' },
    { id: 'reason', ok: said(d.reason) && !claim, message: !d.reason.trim() ? MISSING('a rationale') : !said(d.reason) ? EMPTY_MSG('a rationale') : claim ? 'claims the gap is closed, but the audit still finds it in your exports: correct the week and import its new export, or give the real rationale' : 'written' },
  ]
  if (d.disposition === 'record') {
    const has = ctx.has ?? (() => true)
    const ev = idsIn(d.reason).filter(has)
    const ok = ev.length > 0 || WEEK_REF.test(d.reason)
    gates.push({ id: 'evidence', ok, message: ok ? (ev.length ? `cites ${ev.join(', ')}` : 'cites the week whose record holds it') : 'no evidence: cite an ID in the package or the week whose record holds it (“Week 2 record”)' })
  }
  if (d.disposition === 'defer') {
    gates.push(textGate('owner', d.owner, 'an owner'))
    const w = weekOf(d.week ?? '')
    gates.push({ id: 'week', ok: !!w, message: w ? `closes in Week ${w}` : MISSING('the week it closes in (8 to 14)') })
  }
  const advisories: Advisory<FindingAdvisoryId>[] = []
  if (d.carried) advisories.push({ id: 'carried', message: FINDING_ADVISORIES[0].short })
  const past = [...d.reason.matchAll(/week\s*(\d+)/gi)].map((m) => Number(m[1])).filter((n) => n >= 1 && n <= 6)
  if (d.carried && past.length) advisories.push({ id: 'past-week', message: `${FINDING_ADVISORIES[1].short} (Week ${past[0]})` })
  if (d.disposition === 'defer' && /^\s*week\s*\d+\s*$/i.test(d.owner)) advisories.push({ id: 'week-owner', message: FINDING_ADVISORIES[2].short })
  return { gates, advisories, counts: gates.every((g) => g.ok) }
}

// ---------------------------------------------------------------------------------------------- summary
export function assessSummary(s: Summary, pkg: Pkg): Assessment<SummaryGateId, never> {
  const ev = idsIn(s.evidence).filter((id) => pkg.index.has(id))
  const rs = idsIn(s.residual).filter((id) => id.startsWith('R-') && pkg.index.has(id))
  const incs = idsIn(s.next).filter((id) => (pkg.by[6]?.increments ?? []).some((x) => !x.baseline && x.id.toUpperCase() === id))
  const gates: Gate<SummaryGateId>[] = [
    textGate('recommendation', s.recommendation, 'a recommendation'),
    { id: 'evidence', ok: ev.length > 0, message: ev.length ? `cites ${ev.join(', ')}` : s.evidence.trim() ? 'no ID in it exists in the package' : MISSING('an ID that exists in the package') },
    textGate('conditions', s.conditions, 'conditions'),
    { id: 'residual', ok: rs.length > 0, message: rs.length ? `names ${rs.join(', ')}` : s.residual.trim() ? 'no R ID in it exists in the package' : MISSING('an R ID that exists in the package') },
    textGate('decisions', s.decisions, 'a decision'),
    { id: 'next', ok: incs.length > 0, message: incs.length ? `${incs[0]}` : s.next.trim() ? 'no increment after the baseline in your Week 6 file is named' : MISSING('an INC ID after the baseline') },
  ]
  return { gates, advisories: [], counts: gates.every((g) => g.ok) }
}
export const lessonsOk = (s: string) => lines(s).some(said)

// ---------------------------------------------------------------------------------------------- review preparation
/** The decisions a team may defend: its Week 3 trade decision (when an alternative is recommended) and every Week 4 DEC. */
export function decisionOptions(pkg: Pkg): { value: string; label: string; alternatives: number }[] {
  const out: { value: string; label: string; alternatives: number }[] = []
  const t = pkg.by[3]?.trade
  if (t && t.recommended.trim()) out.push({ value: 'TRADE', label: `Week 3 trade study: ${t.decision.trim() || 'the trade decision'} (recommended ${t.recommended.trim()})`, alternatives: t.alternatives.length })
  for (const d of pkg.by[4]?.decisions ?? []) out.push({ value: d.id.toUpperCase(), label: `${d.id.toUpperCase()} ${d.question.trim()}`, alternatives: lines(d.alternatives).length })
  return out
}
export const needOptions = (pkg: Pkg) => [...pkg.index.values()].filter((e) => e.prefix === 'NEED').map((e) => ({ value: e.id, label: `${e.id} ${e.name}` }))

/** The thread from a need, following the package's links layer by layer: capabilities that serve it; stakeholder
 *  requirements whose parent it is; system requirements refining those; the functions and physical elements that carry
 *  them (and the element each function is allocated to); the interfaces at those elements or their components; and the
 *  roadmap: increments that serve any ID on the thread, directly or through a gap sourced from one. */
export function threadOf(pkg: Pkg, need: string): Thread {
  const n = need.trim().toUpperCase()
  const R = pkg.relationships
  const from = (type: string, to: string[]) => [...new Set(R.filter((x) => x.type === type && to.includes(x.to)).map((x) => x.from))]
  const caps = from('serves', [n]).filter((x) => x.startsWith('CAP-'))
  const stk = from('traces to', [n]).filter((x) => x.startsWith('REQ-STK-'))
  const sys = from('traces to', stk).filter((x) => x.startsWith('REQ-SYS-'))
  const carriers = from('satisfies', [...sys, ...stk])
  const fns = carriers.filter((x) => x.startsWith('FN-'))
  const phys = [...new Set([...carriers.filter((x) => x.startsWith('PHY-')), ...R.filter((x) => x.type === 'allocated to' && fns.includes(x.from)).map((x) => x.to)])]
  const cmps = [...from('part of', phys), ...from('hosted by', phys)]
  const ifs = [...new Set([...from('connects', [...phys, ...cmps]), ...R.filter((x) => x.type === 'carried by' && sys.includes(x.from)).map((x) => x.to)])]
  const chain = [n, ...caps, ...stk, ...sys, ...fns, ...phys, ...cmps, ...ifs]
  const gaps = from('traces to', chain).filter((x) => x.startsWith('GAP-'))
  const incs = from('serves', [...chain, ...gaps]).filter((x) => x.startsWith('INC-'))
  const hops = [
    { layer: 'Need', ids: pkg.index.has(n) ? [n] : [] },
    { layer: 'Capability', ids: caps },
    { layer: 'Stakeholder requirement', ids: stk },
    { layer: 'System requirement', ids: sys },
    { layer: 'Architecture (functions and elements)', ids: [...fns, ...phys] },
    { layer: 'Interface', ids: ifs },
    { layer: 'Roadmap (gaps and increments)', ids: [...gaps, ...incs] },
  ]
  return { need: n, hops, reachesSys: sys.length > 0, reachesArch: fns.length + phys.length > 0, reachesInterface: ifs.length > 0, reachesRoadmap: gaps.length + incs.length > 0 }
}

export function assessPrep(r: Week7Record, pkg: Pkg): Assessment<PrepGateId, PrepAdvisoryId> {
  const missing = PACKAGE_SECTIONS.filter((s) => !said(r.owners[s.id] ?? ''))
  const opts = decisionOptions(pkg)
  const dec = opts.find((o) => o.value === r.decision)
  const t = r.threadNeed ? threadOf(pkg, r.threadNeed) : null
  const threadOk = !!t && pkg.index.has(t.need) && t.reachesSys && t.reachesArch
  const gates: Gate<PrepGateId>[] = [
    { id: 'owners', ok: !missing.length, message: missing.length ? `no owner yet for ${missing.map((s) => `${s.n}. ${s.title}`).join(', ')}` : 'every section has an owner' },
    { id: 'decision', ok: !!dec, message: dec ? dec.label : opts.length ? MISSING('choose the decision you defend') : 'no decision in the package: load your Week 3 and Week 4 exports' },
    { id: 'thread', ok: threadOk, message: !t ? MISSING('choose the need whose thread you walk') : !pkg.index.has(t.need) ? `${t.need} is not a need in the package` : threadOk ? `${t.need} reaches ${t.hops[3].ids.join(', ')} and ${t.hops[4].ids.join(', ')}` : `${t.need}’s thread stops before ${t.reachesSys ? 'the architecture' : 'a system requirement'}: choose another need or close the gap` },
  ]
  const advisories: Advisory<PrepAdvisoryId>[] = []
  if (threadOk && !t!.reachesInterface) advisories.push({ id: 'thread-interface', message: PREP_ADVISORIES[0].short })
  if (threadOk && !t!.reachesRoadmap) advisories.push({ id: 'thread-roadmap', message: PREP_ADVISORIES[1].short })
  return { gates, advisories, counts: gates.every((g) => g.ok) }
}

// ---------------------------------------------------------------------------------------------- RIDs
export function locationOk(location: string, pkg: Pkg): boolean {
  const l = location.trim().toLowerCase()
  if (!l) return false
  return idsIn(location).some((id) => pkg.index.has(id)) || PACKAGE_SECTIONS.some((s) => l.includes(s.title.toLowerCase()))
}
export function assessRid(x: Rid, pkg: Pkg): Assessment<RidGateId, RidAdvisoryId> {
  const rejectOk = x.disposition !== 'reject' || idsIn(x.response).length > 0 || words(x.response) >= 2
  const gates: Gate<RidGateId>[] = [
    { id: 'location', ok: locationOk(x.location, pkg), message: !x.location.trim() ? MISSING('an ID or a section title') : locationOk(x.location, pkg) ? 'found in the package' : 'neither an ID in the package nor a section title' },
    textGate('finding', x.finding, 'a finding'),
    textGate('criterion', x.criterion, 'the criterion or source it breaks'),
    { id: 'severity', ok: !!x.severity, message: x.severity ? SEVERITIES.find((s) => s.id === x.severity)!.label : MISSING('major or minor') },
    { id: 'disposition', ok: !!x.disposition, message: x.disposition ? RID_DISPOSITIONS.find((s) => s.id === x.disposition)!.label : MISSING('accept, defer or reject') },
    { id: 'response', ok: said(x.response) && rejectOk, message: !x.response.trim() ? MISSING('the response') : !said(x.response) ? EMPTY_MSG('a response') : rejectOk ? 'written' : 'a rejection needs its evidence: an ID or a reason' },
  ]
  if (x.disposition === 'accept' || x.disposition === 'defer') gates.push(textGate('owner', x.owner, 'an owner'))
  const advisories: Advisory<RidAdvisoryId>[] = x.disposition === 'reject' && said(x.response) && !idsIn(x.response).length ? [{ id: 'reject-no-id', message: RID_ADVISORIES[0].short }] : []
  return { gates, advisories, counts: gates.every((g) => g.ok) }
}

// ---------------------------------------------------------------------------------------------- checks
export type PartId = (typeof WEEK7_PARTS)[number]['id'] | 'ai'
export const PART_IDS: PartId[] = [...WEEK7_PARTS.map((p) => p.id), 'ai']
const rule = (id: (typeof PART_RULES)[number]['id']) => PART_RULES.find((p) => p.id === id)!.short
const gateShort = (list: readonly { id: string; short: string }[], id: string) => list.find((g) => g.id === id)?.short ?? id
const failed = (prefix: string, list: readonly { id: string; short: string }[], a: Assessment<string, string>) => a.gates.filter((g) => !g.ok).map((g) => `${prefix}: ${gateShort(list, g.id)} (${g.message})`)

export function assessSources(r: Week7Record, pkg = packageOf(r)): Assessment<SourceGateId, SourceAdvisoryId> {
  const missing = WEEKS.filter((w) => !pkg.loaded[w])
  const ents = [...new Set(WEEKS.map((w) => pkg.loaded[w]).filter(Boolean).map((l) => norm(namesOf(l!).enterprise)).filter(Boolean))]
  const teams = [...new Set(WEEKS.map((w) => pkg.loaded[w]).filter(Boolean).map((l) => namesOf(l!).team.trim().toLowerCase()).filter(Boolean))]
  const gates: Gate<SourceGateId>[] = [
    { id: 'all-weeks', ok: !missing.length, message: missing.length ? `missing Week ${missing.join(', Week ')}` : 'Weeks 1–6 loaded' },
    { id: 'one-enterprise', ok: ents.length === 1 && Object.keys(pkg.loaded).length > 0, message: ents.length === 1 ? `“${pkg.enterprise}”` : ents.length ? `${ents.length} enterprises named` : 'no file loaded' },
  ]
  const advisories: Advisory<SourceAdvisoryId>[] = []
  if (teams.length > 1) advisories.push({ id: 'team-code', message: gateShort(SOURCE_ADVISORIES, 'team-code') })
  const w1 = pkg.loaded[1]
  if (w1 && w1.version < 3) advisories.push({ id: 'old-version', message: gateShort(SOURCE_ADVISORIES, 'old-version') })
  return { gates, advisories, counts: gates.every((g) => g.ok) }
}

export function allChecks(r: Week7Record): Record<PartId, PartCheck> {
  const pkg = packageOf(r)
  const src = assessSources(r, pkg)
  const sources: PartCheck = {
    ok: src.counts && !pkg.errors.length, issues: [...failed('Sources', SOURCE_GATES, src), ...pkg.errors.map((e) => `Week ${e.week}: ${e.error}`)],
    detail: `${plural(Object.keys(pkg.loaded).length, 'weekly export')} loaded; ${pkg.index.size} IDs in the package index.`, notes: src.advisories.map((a) => a.message),
  }
  const fa = pkg.findings.map((f) => ({ f, a: assessFindingIn(r, f, pkg) }))
  const low = pkg.coverage.filter((c) => c.total > 0 && c.pct < 80)
  const audit: PartCheck = {
    ok: sources.ok && fa.every((x) => x.a.counts),
    issues: [...(sources.ok ? [] : ['load all six exports first']), ...fa.filter((x) => !x.a.counts).map((x) => `${x.f.key}: ${x.a.gates.filter((g) => !g.ok).map((g) => gateShort(FINDING_GATES, g.id)).join('; ')}`)],
    detail: `${plural(pkg.findings.length, 'finding')}, every one dispositioned (${fa.filter((x) => dispositionOf(r, x.f).disposition === 'record').length} accepted with rationale, ${fa.filter((x) => dispositionOf(r, x.f).disposition === 'defer').length} deferred and open).`,
    notes: [...(fa.some((x) => x.a.advisories.length) ? [`${fa.filter((x) => x.a.advisories.length).length} carried disposition(s): ${FINDING_ADVISORIES[0].short}`] : []), ...(low.length ? [`${low.map((c) => `${c.label} ${c.pct} %`).join('; ')}: ${rule('coverage-low')}`] : [])],
  }
  const sa = assessSummary(r.summary, pkg)
  const summary: PartCheck = { ok: sa.counts && lessonsOk(r.lessons), issues: [...failed('Summary', SUMMARY_GATES, sa), ...(lessonsOk(r.lessons) ? [] : [`Lessons: ${rule('lessons')}`])], detail: 'The executive summary and the lessons learned are written.' }
  const pa = assessPrep(r, pkg)
  const prep: PartCheck = { ok: pa.counts, issues: failed('Review preparation', PREP_GATES, pa), detail: 'Owners, the key decision and the thread are set.', notes: pa.advisories.map((a) => a.message) }
  const ra = r.rids.map((x) => ({ x, a: assessRid(x, pkg) }))
  const rids: PartCheck = {
    ok: ra.length > 0 && ra.every((y) => y.a.counts),
    issues: [...(ra.length ? [] : [rule('no-rids')]), ...ra.flatMap((y) => failed(y.x.id, RID_GATES, y.a))],
    detail: `${plural(ra.length, 'RID')} received, every one dispositioned.`, notes: ra.flatMap((y) => y.a.advisories.map((a) => `${y.x.id}: ${a.message}`)),
  }
  const ai: PartCheck = { ok: words(r.aiStatement) >= MIN_AI_WORDS && said(r.aiStatement), issues: words(r.aiStatement) >= MIN_AI_WORDS ? [] : [`${rule('ai')} (now ${words(r.aiStatement)})`], detail: 'The AI usage summary is written.' }
  return { sources, audit, summary, prep, rids, ai }
}

export function packageState(r: Week7Record): PackageState {
  const c = allChecks(r)
  if (!(c.sources.ok && c.audit.ok && c.summary.ok && c.prep.ok && c.ai.ok)) return 'not-ready'
  return c.rids.ok ? 'review-closed' : 'ready-for-review'
}

// ---------------------------------------------------------------------------------------------- export
export const fileStem = (r: Week7Record) => {
  const t = packageOf(r).team.replace(/[^\w-]+/g, '')
  return `team-${t || 'NN'}-week7-package`
}
const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n+/g, '; ').trim()
const STATE_LABEL: Record<PackageState, string> = { 'not-ready': 'not ready for review', 'ready-for-review': 'ready for review: the entry criteria are met', 'review-closed': 'review closed: every RID dispositioned' }
const PART_TITLE: Record<PartId, string> = { ...Object.fromEntries(WEEK7_PARTS.map((p) => [p.id, `Part ${p.n} · ${p.title}`])), ai: 'Part 6 · AI usage summary' } as Record<PartId, string>

/** Counts of the IDs each section's source week defines, for the package index. */
function sectionCounts(pkg: Pkg, week: number) {
  const byPrefix = new Map<string, number>()
  for (const e of pkg.index.values()) if (e.week === week) byPrefix.set(e.prefix, (byPrefix.get(e.prefix) ?? 0) + 1)
  return [...byPrefix].map(([p, n]) => `${n} ${p}`).join(', ')
}

export function packageMarkdown(r: Week7Record, today = new Date().toISOString().slice(0, 10)): string {
  const pkg = packageOf(r)
  const checks = allChecks(r)
  const state = packageState(r)
  const L: string[] = []
  L.push(`# ${pkg.enterprise || 'Team'}: Systems Thinking Engineering Package (Week 7)`, '', `Team ${pkg.team || 'NN'} · exported ${today} · status: **${STATE_LABEL[state]}**`, '')
  L.push('## Readiness report', '', '| Part | Status | Still needed |', '|---|---|---|')
  for (const id of PART_IDS) L.push(`| ${PART_TITLE[id]} | ${checks[id].ok ? 'complete' : 'incomplete'} | ${cell(checks[id].issues.slice(0, 6).join('; ')) || '—'} |`)
  L.push('', `Entry criteria (ready for review): Parts 28–31 and the AI usage summary complete. Exit criteria (review closed): Part 32 complete as well.`, '')
  L.push('## Package index', '', '| Section | Source | Content |', '|---|---|---|')
  for (const s of PACKAGE_SECTIONS) {
    const src = s.week <= 6 ? `Week ${s.week} export${pkg.loaded[s.week as SourceWeek] ? ` (status ${pkg.loaded[s.week as SourceWeek]!.status || 'none'})` : ' (not loaded)'}` : 'written in Week 7'
    L.push(`| ${s.n}. ${s.title} | ${src} | ${s.week <= 6 ? sectionCounts(pkg, s.week) || '—' : '—'} |`)
  }
  L.push('', `${pkg.index.size} IDs in the index; ${pkg.relationships.length} typed relationships.`, '')
  L.push('## 1. Executive summary', '')
  const S = r.summary
  L.push(`- **Recommendation.** ${S.recommendation.trim() || '_not written_'}`, `- **Why (evidence).** ${S.evidence.trim() || '_not written_'}`, `- **Conditions.** ${S.conditions.trim() || '_not written_'}`, `- **Residual risk.** ${S.residual.trim() || '_not written_'}`, `- **Decisions needed from the reviewer.** ${S.decisions.trim() || '_not written_'}`, `- **Next increment.** ${S.next.trim() || '_not written_'}`, '')
  L.push('## 9. Consistency and trace audit', '', '| Layer | Covered | Total | Coverage | Not covered |', '|---|---|---|---|---|')
  for (const c of pkg.coverage) L.push(`| ${c.label} | ${c.covered} | ${c.total} | ${c.pct} % | ${c.uncovered.join(', ') || '—'} |`)
  L.push('', '| Finding | Kind | What the audit found | Disposition | Rationale | Owner | Closes in |', '|---|---|---|---|---|---|---|')
  for (const f of pkg.findings) {
    const d = dispositionOf(r, f)
    L.push(`| ${f.key} | ${FINDING_KINDS.find((k) => k.id === f.kind)!.label} | ${cell(f.text)} | ${d.disposition || '_none_'}${d.carried ? ' (carried)' : ''} | ${cell(d.reason) || '—'} | ${cell(d.owner) || '—'} | ${d.week ? `Week ${d.week}` : '—'} |`)
  }
  L.push('', '## 10. Open items and lessons learned', '')
  for (const f of pkg.findings.filter((x) => dispositionOf(r, x).disposition === 'defer')) L.push(`- ${f.key}: ${dispositionOf(r, f).reason.trim()} (status: open; owner: ${dispositionOf(r, f).owner.trim() || '—'}; closes in ${dispositionOf(r, f).week ? `Week ${dispositionOf(r, f).week}` : '—'})`)
  L.push('', '**Lessons learned**', '', ...(lines(r.lessons).length ? lines(r.lessons).map((x) => `- ${x}`) : ['_none written_']), '')
  L.push('## Design review preparation', '', '| Section | Owner |', '|---|---|', ...PACKAGE_SECTIONS.map((s) => `| ${s.n}. ${s.title} | ${cell(r.owners[s.id] ?? '') || '—'} |`), '')
  const dec = decisionOptions(pkg).find((o) => o.value === r.decision)
  L.push(`**Key decision defended:** ${dec ? `${dec.label} (${plural(dec.alternatives, 'alternative')})` : '_not chosen_'}`, '')
  if (r.threadNeed) {
    const t = threadOf(pkg, r.threadNeed)
    L.push(`**Thread walked:** ${t.hops.map((h) => `${h.layer}: ${h.ids.join(', ') || '—'}`).join(' → ')}`, '')
  }
  L.push('## Review findings (RIDs) and dispositions', '')
  if (r.rids.length) {
    L.push('| RID | From | Where | Finding | Criterion | Severity | Disposition | Response | Owner |', '|---|---|---|---|---|---|---|---|---|')
    for (const x of r.rids) L.push(`| ${x.id} | ${cell(x.from)} | ${cell(x.location)} | ${cell(x.finding)} | ${cell(x.criterion)} | ${x.severity} | ${x.disposition} | ${cell(x.response)} | ${cell(x.owner)} |`)
  } else L.push('_No RIDs recorded yet (completed after the review)._')
  L.push('', '## 11. AI usage summary', '', r.aiStatement.trim() || '_Not written yet._', '')
  return L.join('\n')
}

export function packageJson(r: Week7Record) {
  const pkg = packageOf(r)
  const checks = allChecks(r)
  const sources = Object.fromEntries(WEEKS.filter((w) => pkg.loaded[w]).map((w) => [`week${w}`, pkg.loaded[w]!.raw]))
  return {
    format: PACKAGE_FORMAT,
    version: PACKAGE_VERSION,
    team: pkg.team,
    enterprise: pkg.enterprise,
    state: packageState(r),
    sources,
    // a collision keeps every definition (review M3): one row per defining week, marked
    index: [...pkg.index.values()].flatMap((e) => [{ id: e.id, name: e.name, prefix: e.prefix, week: e.week, ...(e.others?.length ? { collision: true } : {}) }, ...(e.others ?? []).map((o) => ({ id: e.id, name: o.name, prefix: e.prefix, week: o.week, collision: true }))]),
    relationships: pkg.relationships,
    coverage: pkg.coverage,
    findings: pkg.findings.map((f) => {
      const d = dispositionOf(r, f)
      return { key: f.key, kind: f.kind, ids: f.ids, text: f.text, disposition: d.disposition, status: d.disposition === 'defer' ? 'open' : d.disposition === 'record' ? 'accepted' : '', reason: d.reason.trim(), owner: d.owner.trim(), week: d.week ? Number(d.week) : null, carried: d.carried }
    }),
    summary: Object.fromEntries(Object.entries(r.summary).map(([k, v]) => [k, v.trim()])),
    lessons: lines(r.lessons),
    prep: { owners: r.owners, decision: r.decision, thread: r.threadNeed ? threadOf(pkg, r.threadNeed) : null },
    rids: r.rids,
    aiStatement: r.aiStatement.trim(),
    // the RID counter travels with the package, so a teammate never reuses a deleted RID number (review m8)
    issued: r.issued,
    checks: Object.fromEntries(Object.entries(checks).map(([k, x]) => [k, { ok: x.ok, issues: x.issues.length }])),
  }
}

// ---------------------------------------------------------------------------------------------- import (teammate share)
const kindOf = (x: unknown) => (x === null ? 'null' : Array.isArray(x) ? 'a list' : typeof x === 'object' ? 'an object' : typeof x === 'string' ? 'text' : typeof x)

/** Reads a teammate's week7-package file back into a record (the embedded sources are re-read with each week's own
 *  importer). Never throws. */
export function importPackage(text: string): Week7Record | { error: string } {
  try {
    let d: unknown
    try {
      d = JSON.parse(text)
    } catch {
      return { error: 'This file is not valid JSON. Ask your teammate for team-NN-week7-package.json.' }
    }
    if (!isObj(d)) return { error: `This file holds ${kindOf(d)}, not a Week 7 package.` }
    if (typeof d.format === 'string' && FORMAT_WEEK[d.format]) return { error: `This is a Week ${FORMAT_WEEK[d.format]} export: add it with “Add your weekly exports”.` }
    if (d.format !== PACKAGE_FORMAT) return { error: d.format === undefined ? 'This file has no “format”: it is not a Week 7 package.' : `This is not a Week 7 package (format “${PACKAGE_FORMAT}”; this file says ${JSON.stringify(d.format)}).` }
    if (typeof d.version === 'string') return { error: `This package gives its version as text (“${d.version}”); this tool reads version ${PACKAGE_VERSION} written as a number. Ask your teammate to export again.` }
    if (d.version !== PACKAGE_VERSION) return { error: `This package has version ${JSON.stringify(d.version)}; this tool reads version ${PACKAGE_VERSION}.` }
    if (isAeroLink(str(d.enterprise))) return { error: 'This package is about AeroLink, the instructor’s worked example: import your team’s own package.' }
    if (d.sources !== undefined && !isObj(d.sources)) return { error: `“sources” must be an object; this file has ${kindOf(d.sources)}.` }
    const src = isObj(d.sources) ? d.sources : {}
    const sources: Partial<Record<SourceWeek, string>> = {}
    for (const w of WEEKS) {
      const s = src[`week${w}`]
      if (s === undefined) continue
      if (!isObj(s)) return { error: `“sources.week${w}” must be an object; this file has ${kindOf(s)}.` }
      const t = JSON.stringify(s)
      const l = loadSource(t)
      if ('error' in l) return { error: `The package’s Week ${w} source: ${l.error}` }
      sources[w] = t
    }
    if (d.rids !== undefined && !Array.isArray(d.rids)) return { error: `“rids” must be a list; this file has ${kindOf(d.rids)}.` }
    const prep = isObj(d.prep) ? d.prep : {}
    const dispositions: Record<string, unknown> = {}
    for (const f of objs(d.findings)) if (str(f.key)) dispositions[str(f.key)] = { disposition: f.disposition, reason: f.reason, owner: f.owner, week: f.week }
    const rec = normalizePackage({
      sources, dispositions, summary: d.summary, lessons: Array.isArray(d.lessons) ? d.lessons.map(str).join('\n') : str(d.lessons), owners: prep.owners, decision: prep.decision,
      threadNeed: isObj(prep.thread) ? prep.thread.need : '', rids: d.rids, aiStatement: d.aiStatement,
      issued: d.issued,
    })
    const dup = rec.rids.map((x) => x.id).find((id, i, a) => a.indexOf(id) !== i)
    if (dup) return { error: `Duplicate ID ${dup} in the file: each RID once.` }
    const badRid = rec.rids.find((x) => !/^RID-\d{3}$/.test(x.id))
    if (badRid) return { error: `Unexpected RID ID “${badRid.id || '(empty)'}”: IDs look like RID-001.` }
    return rec
  } catch (e) {
    return { error: `This file could not be read as a Week 7 package (${e instanceof Error ? e.message : String(e)}).` }
  }
}
