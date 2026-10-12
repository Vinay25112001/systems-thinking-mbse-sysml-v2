// Week 4: parent-trace and set checker, and an RB-3 self-audit on a random sample (pure logic).
//
// Each workspace requirement is turned back into a quality-lab draft and run through the same heuristics, so a
// requirement recorded through any route is judged by the same rules. Set-level checks follow the L4 acceptance rule
// (15–20 REQ, every one with one "shall", a criterion or TBD+AROU, rationale, method and parent; a missing criterion is a
// failing check, so a requirement without one is never counted as "clean") and RB-3.5 (types
// balanced, no duplicates). The RB-3 sample procedure and the percentage-to-level bands are from ASSESSMENT_RUBRICS.md;
// the mapping of heuristic checks to criteria 3.1–3.4 is instructor-authored and is only a proxy for the grader.
import { isWellFormedId, orphansAndChildless, type Element, type EngineeringModel } from '../../model/engineering'
import { checkRequirement, type CheckId, type CheckResult, type Draft, type Level, type Method, type ReqType } from './quality'

const METHOD_SET = new Set(['inspection', 'analysis', 'demonstration', 'test'])
const TYPE_SET = new Set(['functional', 'performance', 'interface', 'constraint'])

/** Rebuild the draft a requirement element corresponds to, from its attributes and links. */
export function draftOf(e: Element, m: EngineeringModel): Draft {
  const live = new Set(m.elements.filter((x) => x.status === 'active').map((x) => x.id))
  const a = e.attributes ?? {}
  const level: Level = e.id.startsWith('REQ-STK') ? 'STK' : 'SYS'
  const arou = m.links.filter((l) => l.target === e.id && l.type === 'affects' && live.has(l.source) && /^(U|A)-/.test(l.source)).map((l) => l.source)
  return {
    level,
    name: e.name,
    text: e.text ?? '',
    type: TYPE_SET.has(String(a.type)) ? (a.type as ReqType) : undefined,
    method: METHOD_SET.has(String(a.method)) ? (a.method as Method) : undefined,
    criterion: typeof a.criterion === 'string' ? a.criterion : '',
    rationale: typeof a.rationale === 'string' ? a.rationale : '',
    parents: m.links.filter((l) => l.source === e.id && (l.type === 'derives-from' || l.type === 'refines') && live.has(l.target)).map((l) => l.target),
    arou,
    arouTbd: Object.fromEntries(arou.map((id) => [id, (() => { const v = m.elements.find((x) => x.id === id)?.attributes?.tbd; return typeof v === 'string' ? v : undefined })()])),
  }
}

export type ReqAudit = { id: string; level: Level; type?: ReqType; method?: Method; parents: string[]; idOk: boolean; levelAttrOk: boolean; checks: CheckResult[]; fails: CheckId[]; advisories: CheckId[]; owner?: string; provenance: string }

export function auditRequirement(e: Element, m: EngineeringModel): ReqAudit {
  const d = draftOf(e, m)
  const checks = checkRequirement(d)
  const lvl = e.attributes?.level
  return {
    id: e.id, level: d.level, type: d.type, method: d.method, parents: d.parents, owner: e.owner, provenance: e.provenance,
    idOk: isWellFormedId(e.id, 'REQ'),
    levelAttrOk: lvl === undefined || lvl === (d.level === 'STK' ? 'stakeholder' : 'system'),
    checks,
    fails: checks.filter((c) => c.status === 'fail').map((c) => c.id),
    advisories: checks.filter((c) => c.status === 'advisory').map((c) => c.id),
  }
}

export type SetAudit = {
  total: number
  byLevel: Record<Level, number>
  byType: Record<ReqType | 'untyped', number>
  missingTypes: ReqType[]
  sizeOk: boolean
  duplicates: string[][]
  orphans: string[]
  childlessParents: string[]
  reqs: ReqAudit[]
  clean: number
}

const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9%]+/g, ' ').trim()

export function auditSet(m: EngineeringModel): SetAudit {
  const reqEls = m.elements.filter((e) => e.kind === 'REQ' && e.status === 'active')
  const reqs = reqEls.map((e) => auditRequirement(e, m))
  const byType: SetAudit['byType'] = { functional: 0, performance: 0, interface: 0, constraint: 0, untyped: 0 }
  for (const r of reqs) byType[r.type ?? 'untyped'] += 1
  const groups = new Map<string, string[]>()
  for (const e of reqEls) {
    const k = norm(e.text ?? '')
    if (k) groups.set(k, [...(groups.get(k) ?? []), e.id])
  }
  const { orphans, childless } = orphansAndChildless(m)
  return {
    total: reqs.length,
    byLevel: { STK: reqs.filter((r) => r.level === 'STK').length, SYS: reqs.filter((r) => r.level === 'SYS').length },
    byType,
    missingTypes: (['functional', 'performance', 'interface', 'constraint'] as ReqType[]).filter((t) => byType[t] === 0),
    sizeOk: reqs.length >= 15 && reqs.length <= 20,
    duplicates: [...groups.values()].filter((g) => g.length > 1),
    orphans,
    childlessParents: childless,
    reqs,
    clean: reqs.filter((r) => r.fails.length === 0 && r.idOk && r.levelAttrOk).length,
  }
}

// ---------------------------------------------------------------------------------------------
// RB-3 sample-based self-audit

/** Deterministic PRNG (mulberry32), so a sample can be reproduced from its seed. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Draw `n` distinct IDs at random (Fisher–Yates on a copy); fewer if the set is smaller. Order of input does not matter. */
export function drawSample(ids: string[], seed: number, n = 10): string[] {
  const a = [...ids].sort()
  const rnd = mulberry32(seed)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, Math.min(n, a.length))
}

/** RB-3 bands: ≥ 90 % → 4, 75–89 % → 3, 50–74 % → 2, < 50 % → 1 (ASSESSMENT_RUBRICS.md, RB-3). */
export function rb3Level(pct: number): 1 | 2 | 3 | 4 {
  return pct >= 90 ? 4 : pct >= 75 ? 3 : pct >= 50 ? 2 : 1
}

/** Which heuristic checks stand in for each per-requirement RB-3 criterion (proxy; the grader decides). */
export const RB3_PROXY: { id: '3.1' | '3.2' | '3.3' | '3.4'; label: string; checks: CheckId[] }[] = [
  { id: '3.1', label: 'Well-formed', checks: ['subject', 'single-shall', 'vague'] },
  { id: '3.2', label: 'Verifiable', checks: ['measurable', 'tbx', 'method', 'method-fit', 'criterion'] },
  { id: '3.3', label: 'Rationale', checks: ['rationale'] },
  { id: '3.4', label: 'Parent trace', checks: ['parent', 'parent-level'] },
]

export type Rb3Row = { id: string; label: string; met: number; of: number; pct: number; level: 1 | 2 | 3 | 4 }

export function rb3SelfAudit(audits: ReqAudit[], sample: string[]): Rb3Row[] {
  const rows = audits.filter((a) => sample.includes(a.id))
  return RB3_PROXY.map((c) => {
    const met = rows.filter((r) => c.checks.every((k) => !r.fails.includes(k))).length
    const pct = rows.length ? Math.round((met / rows.length) * 100) : 0
    return { id: c.id, label: c.label, met, of: rows.length, pct, level: rb3Level(pct) }
  })
}
