// The shared AeroLink engineering data model: one typed set of elements and links that every week's tools read and
// extend, so identifiers carry from the Week 1 context through to the Week 14 review (lab plan §C.2).
// Elements use the course's stable ID scheme; links use only the ten relationship types of §C.2 rule 2.
// Pure functions only: persistence lives in state/Workspace.tsx.
import type { Citation } from '../content/readings'

export type ElementKind =
  | 'ENT' | 'EXT' | 'STK' | 'CON' | 'NEED' | 'MGO' | 'CAP' | 'SCN' | 'REQ'
  | 'MOE' | 'MOP' | 'TPM' | 'TECH' | 'A' | 'R' | 'O' | 'U' | 'ALT' | 'CRIT' | 'DEC'
  | 'FN' | 'LOG' | 'PHY' | 'IF' | 'INFO' | 'AI' | 'VER'

export const KIND_INFO: Record<ElementKind, { label: string; week: number; sysml: string }> = {
  ENT: { label: 'Enterprise / system of interest', week: 1, sysml: 'top-level package / part' },
  EXT: { label: 'External system or actor', week: 1, sysml: 'part or actor' },
  STK: { label: 'Stakeholder', week: 2, sysml: 'part def + stakeholder usage' },
  CON: { label: 'Stakeholder concern', week: 2, sysml: 'concern' },
  NEED: { label: 'Need statement', week: 3, sysml: 'requirement (stakeholder level)' },
  MGO: { label: 'Mission, goal or objective', week: 3, sysml: 'requirement / doc' },
  CAP: { label: 'Capability', week: 3, sysml: 'action def or part def' },
  SCN: { label: 'Operational scenario', week: 3, sysml: 'use case / action' },
  REQ: { label: 'Requirement', week: 4, sysml: 'requirement with short name = ID' },
  MOE: { label: 'Measure of effectiveness', week: 5, sysml: 'attribute + metadata' },
  MOP: { label: 'Measure of performance', week: 5, sysml: 'attribute + metadata' },
  TPM: { label: 'Technical performance measure', week: 5, sysml: 'attribute + metadata' },
  TECH: { label: 'Technology assessed', week: 6, sysml: 'part def / doc' },
  A: { label: 'Assumption', week: 2, sysml: 'metadata or dependency' },
  R: { label: 'Risk', week: 2, sysml: 'Risk metadata' },
  O: { label: 'Opportunity', week: 2, sysml: 'metadata' },
  U: { label: 'Unknown', week: 2, sysml: 'metadata' },
  ALT: { label: 'Trade alternative', week: 7, sysml: 'analysis / trade study' },
  CRIT: { label: 'Trade criterion', week: 7, sysml: 'analysis / trade study' },
  DEC: { label: 'Decision record', week: 7, sysml: 'analysis / trade study' },
  FN: { label: 'Function (logical behaviour)', week: 8, sysml: 'action def' },
  LOG: { label: 'Logical element', week: 8, sysml: 'part (logical)' },
  PHY: { label: 'Physical element', week: 8, sysml: 'part (physical)' },
  IF: { label: 'Interface', week: 8, sysml: 'interface def / connection' },
  INFO: { label: 'Information item', week: 8, sysml: 'item def / flow' },
  AI: { label: 'AI-enabled capability', week: 8, sysml: 'part/action + metadata' },
  VER: { label: 'Verification activity', week: 12, sysml: 'verification case' },
}

export const ELEMENT_KINDS = Object.keys(KIND_INFO) as ElementKind[]

export type ElementProvenance = 'official-S04' | 'instructor-fictional' | 'instructor-reference' | 'team-assumption' | 'team-derived' | 'AI-suggested-reviewed' | 'cited'

export type Element = {
  id: string
  kind: ElementKind
  name: string
  /** Statement text (need, requirement, risk statement, scenario summary, ...). */
  text?: string
  /** Typed attributes, e.g. { threshold: 15, unit: 'min' } for a measure; values are FICTIONAL unless cited. */
  attributes?: Record<string, string | number | boolean>
  provenance: ElementProvenance
  owner?: string
  status: 'active' | 'retired'
  retiredReason?: string
  cite?: Citation
}

export type LinkType = 'derives-from' | 'refines' | 'satisfies' | 'allocated-to' | 'verifies' | 'measures' | 'mitigates' | 'affects' | 'performs' | 'flows-to'

export type Link = { id: string; source: string; type: LinkType; target: string; rationale?: string }

export type EngineeringModel = { elements: Element[]; links: Link[] }

/** Which (source kind, link type, target kind) combinations are allowed. `source type target` reads as a sentence. */
const AROU: ElementKind[] = ['A', 'R', 'O', 'U']
const ANY: ElementKind[] = ELEMENT_KINDS
const DESIGN: ElementKind[] = ['FN', 'LOG', 'PHY', 'IF', 'INFO', 'AI', 'CAP', 'SCN']
export const LINK_RULES: Record<LinkType, { from: ElementKind[]; to: ElementKind[]; reads: string }> = {
  'derives-from': { from: ['CON', 'NEED', 'MGO', 'CAP', 'REQ', 'SCN', 'CRIT', 'FN', 'TPM'], to: ['STK', 'CON', 'NEED', 'MGO', 'CAP', 'REQ', 'SCN', 'MOE', 'MOP'], reads: 'is derived from' },
  refines: { from: ['REQ', 'SCN', 'NEED', 'CAP', 'FN'], to: ['REQ', 'SCN', 'NEED', 'CAP', 'FN'], reads: 'refines' },
  satisfies: { from: DESIGN, to: ['REQ'], reads: 'satisfies' },
  'allocated-to': { from: ['REQ', 'FN', 'LOG', 'CAP', 'AI'], to: ['FN', 'LOG', 'PHY', 'AI'], reads: 'is allocated to' },
  verifies: { from: ['VER'], to: ['REQ', 'NEED', 'MOP', 'TPM'], reads: 'verifies' },
  measures: { from: ['MOE', 'MOP', 'TPM'], to: ['MGO', 'NEED', 'CAP', 'REQ', 'PHY', 'LOG', 'FN', 'MOE', 'MOP', 'CRIT'], reads: 'measures' },
  mitigates: { from: ['REQ', 'FN', 'PHY', 'LOG', 'DEC', 'VER', 'TECH', 'AI'], to: ['R'], reads: 'mitigates' },
  affects: { from: [...AROU, 'TECH', 'DEC', 'EXT'], to: ANY, reads: 'affects' },
  performs: { from: ['LOG', 'PHY', 'EXT', 'STK', 'AI'], to: ['FN', 'SCN', 'CAP'], reads: 'performs' },
  'flows-to': { from: ['PHY', 'LOG', 'EXT', 'INFO', 'FN', 'AI'], to: ['PHY', 'LOG', 'EXT', 'INFO', 'FN', 'AI', 'DEC'], reads: 'flows to' },
}

export const kindOfId = (id: string): ElementKind | undefined => {
  const prefix = id.split('-')[0]
  return (ELEMENT_KINDS as string[]).includes(prefix) ? (prefix as ElementKind) : undefined
}

/** IDs: PREFIX-nnn, with REQ-STK-nnn / REQ-SYS-nnn for requirements (lab plan §C.2). */
export function isWellFormedId(id: string, kind: ElementKind): boolean {
  if (kind === 'REQ') return /^REQ-(STK|SYS)-\d{3}$/.test(id)
  return new RegExp(`^${kind}-\\d{3}$`).test(id)
}

export function nextId(kind: ElementKind, model: EngineeringModel, issued: Record<string, number> = {}, reqLevel: 'STK' | 'SYS' = 'SYS'): string {
  const prefix = kind === 'REQ' ? `REQ-${reqLevel}` : kind
  const max = model.elements
    .filter((e) => e.id.startsWith(prefix + '-'))
    .reduce((m, e) => Math.max(m, parseInt(e.id.slice(prefix.length + 1), 10) || 0), issued[prefix] ?? 0)
  return `${prefix}-${String(max + 1).padStart(3, '0')}`
}

export type Issue = { severity: 'error' | 'warning'; code: string; message: string; ids: string[] }

export function validateModel(m: EngineeringModel): Issue[] {
  const issues: Issue[] = []
  const byId = new Map<string, Element>()
  for (const e of m.elements) {
    if (byId.has(e.id)) issues.push({ severity: 'error', code: 'duplicate-id', message: `Duplicate element ID ${e.id}`, ids: [e.id] })
    byId.set(e.id, e)
    if (!isWellFormedId(e.id, e.kind)) issues.push({ severity: 'error', code: 'bad-id', message: `${e.id} does not follow the ${e.kind} ID scheme`, ids: [e.id] })
    if (e.status === 'retired' && !e.retiredReason) issues.push({ severity: 'warning', code: 'retired-no-reason', message: `${e.id} is retired without a reason`, ids: [e.id] })
  }
  const linkIds = new Set<string>()
  for (const l of m.links) {
    if (linkIds.has(l.id)) issues.push({ severity: 'error', code: 'duplicate-link', message: `Duplicate link ID ${l.id}`, ids: [l.id] })
    linkIds.add(l.id)
    const s = byId.get(l.source)
    const t = byId.get(l.target)
    if (!s || !t) {
      issues.push({ severity: 'error', code: 'dangling-link', message: `${l.id} refers to a missing element (${!s ? l.source : l.target})`, ids: [l.id] })
      continue
    }
    const rule = LINK_RULES[l.type]
    if (!rule.from.includes(s.kind) || !rule.to.includes(t.kind))
      issues.push({ severity: 'error', code: 'link-not-allowed', message: `${s.kind} ${rule.reads} ${t.kind} is not an allowed relationship (${l.id})`, ids: [l.id, l.source, l.target] })
    if (l.source === l.target) issues.push({ severity: 'error', code: 'self-link', message: `${l.id} links ${l.source} to itself`, ids: [l.id] })
    if ((s.status === 'retired' || t.status === 'retired') && l.type !== 'affects')
      issues.push({ severity: 'warning', code: 'link-to-retired', message: `${l.id} involves a retired element`, ids: [l.id] })
  }
  return issues
}

// ------------------------------------------------------------------------------------------------
// Traceability

const active = (m: EngineeringModel) => new Set(m.elements.filter((e) => e.status === 'active').map((e) => e.id))

export type ReqCoverage = { id: string; hasParent: boolean; satisfied: boolean; verified: boolean }

/** Coverage of every active requirement: parent (derives-from/refines), satisfy, and verify links (Week 12 audit). */
export function requirementCoverage(m: EngineeringModel): ReqCoverage[] {
  const live = active(m)
  const links = m.links.filter((l) => live.has(l.source) && live.has(l.target))
  return m.elements
    .filter((e) => e.kind === 'REQ' && e.status === 'active')
    .map((r) => ({
      id: r.id,
      hasParent: links.some((l) => l.source === r.id && (l.type === 'derives-from' || l.type === 'refines')),
      satisfied: links.some((l) => l.target === r.id && l.type === 'satisfies'),
      verified: links.some((l) => l.target === r.id && l.type === 'verifies'),
    }))
}

/** Requirements with no parent (orphans) and parents (NEED/CAP/REQ) with no child requirement. */
export function orphansAndChildless(m: EngineeringModel): { orphans: string[]; childless: string[] } {
  const cov = requirementCoverage(m)
  const live = active(m)
  const parents = m.elements.filter((e) => (e.kind === 'NEED' || e.kind === 'CAP') && e.status === 'active')
  const childless = parents
    .filter((p) => !m.links.some((l) => l.target === p.id && live.has(l.source) && kindOfId(l.source) === 'REQ' && (l.type === 'derives-from' || l.type === 'refines')))
    .map((p) => p.id)
  return { orphans: cov.filter((c) => !c.hasParent).map((c) => c.id), childless }
}

/**
 * Impact set of a change to `start`: every active element reachable by following links in either direction,
 * within `depth` hops. Returns elements with the hop distance and the path, so the method can be shown (Week 13).
 */
export function impactSet(m: EngineeringModel, start: string, depth = 3, types?: LinkType[]): { id: string; distance: number; via: string[] }[] {
  const live = active(m)
  const links = m.links.filter((l) => live.has(l.source) && live.has(l.target) && (!types || types.includes(l.type)))
  const seen = new Map<string, { distance: number; via: string[] }>([[start, { distance: 0, via: [] }]])
  let frontier = [start]
  for (let d = 1; d <= depth && frontier.length; d++) {
    const next: string[] = []
    for (const id of frontier) {
      for (const l of links) {
        const other = l.source === id ? l.target : l.target === id ? l.source : null
        if (other && !seen.has(other)) {
          seen.set(other, { distance: d, via: [...seen.get(id)!.via, l.id] })
          next.push(other)
        }
      }
    }
    frontier = next
  }
  return [...seen.entries()].filter(([id]) => id !== start).map(([id, v]) => ({ id, ...v })).sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id))
}

// ------------------------------------------------------------------------------------------------
// The required digital thread (S02): Stakeholder → Need → Capability → Requirement → Behavior → Logical →
// Physical → Information Flow → Verification Method → MOE/MOP → Associated Risk.
// Course convention for what counts as each link (an interpretation of S02, which lists the layers only):
//  1 NEED derives-from STK          2 CAP derives-from NEED         3 REQ derives-from/refines CAP (directly or via REQ)
//  4 REQ allocated-to FN            5 LOG performs FN               6 LOG allocated-to PHY
//  7 INFO flows-to/from PHY         8 VER verifies REQ              9 MOE/MOP measures REQ, CAP or a parent MOE
// 10 R affects, or is mitigated by, any element already in the thread

export const THREAD_STEPS = [
  'Stakeholder', 'Need', 'Capability', 'Requirement', 'Behavior (function)', 'Logical element', 'Physical element', 'Information flow', 'Verification', 'MOE/MOP', 'Associated risk',
] as const

export type Thread = { ids: string[]; complete: boolean; reachedStep: number }

export function threadsFrom(m: EngineeringModel, stakeholder: string): Thread[] {
  const live = active(m)
  const L = m.links.filter((l) => live.has(l.source) && live.has(l.target))
  const out = (src: string, type: LinkType) => L.filter((l) => l.source === src && l.type === type).map((l) => l.target)
  const into = (tgt: string, type: LinkType) => L.filter((l) => l.target === tgt && l.type === type).map((l) => l.source)
  const k = (id: string) => kindOfId(id)

  // requirements under a capability, directly or through a chain of REQ refinements/derivations
  const reqsUnder = (cap: string): string[] => {
    const found = new Set<string>()
    let frontier = [...into(cap, 'derives-from'), ...into(cap, 'refines')].filter((x) => k(x) === 'REQ')
    while (frontier.length) {
      const next: string[] = []
      for (const r of frontier) if (!found.has(r)) { found.add(r); next.push(...into(r, 'derives-from'), ...into(r, 'refines')) }
      frontier = next.filter((x) => k(x) === 'REQ' && !found.has(x))
    }
    return [...found]
  }

  const results: Thread[] = []
  const needs = into(stakeholder, 'derives-from').filter((x) => k(x) === 'NEED')
  if (!needs.length) return [{ ids: [stakeholder], complete: false, reachedStep: 1 }]
  for (const need of needs) {
    const caps = into(need, 'derives-from').filter((x) => k(x) === 'CAP')
    if (!caps.length) { results.push({ ids: [stakeholder, need], complete: false, reachedStep: 2 }); continue }
    for (const cap of caps) {
      const reqs = reqsUnder(cap)
      if (!reqs.length) { results.push({ ids: [stakeholder, need, cap], complete: false, reachedStep: 3 }); continue }
      for (const req of reqs) {
        const base = [stakeholder, need, cap, req]
        const fns = out(req, 'allocated-to').filter((x) => k(x) === 'FN')
        if (!fns.length) { results.push({ ids: base, complete: false, reachedStep: 4 }); continue }
        for (const fn of fns) {
          const logs = into(fn, 'performs').filter((x) => k(x) === 'LOG')
          if (!logs.length) { results.push({ ids: [...base, fn], complete: false, reachedStep: 5 }); continue }
          for (const log of logs) {
            const phys = out(log, 'allocated-to').filter((x) => k(x) === 'PHY')
            if (!phys.length) { results.push({ ids: [...base, fn, log], complete: false, reachedStep: 6 }); continue }
            for (const phy of phys) {
              const infos = [...out(phy, 'flows-to'), ...into(phy, 'flows-to')].filter((x) => k(x) === 'INFO')
              if (!infos.length) { results.push({ ids: [...base, fn, log, phy], complete: false, reachedStep: 7 }); continue }
              // Prefer the information item most related to this thread: one that also flows to/from the thread's
              // function or logical element, or that feeds a decision; otherwise the first linked item.
              const related = (x: string) => L.some((l) => l.type === 'flows-to' && ((l.source === x && [fn, log].includes(l.target)) || (l.target === x && [fn, log].includes(l.source))))
              const info = infos.find(related) ?? infos.find((x) => out(x, 'flows-to').some((y) => k(y) === 'DEC')) ?? infos[0]
              const ver = into(req, 'verifies').find((x) => k(x) === 'VER')
              if (!ver) { results.push({ ids: [...base, fn, log, phy, info], complete: false, reachedStep: 8 }); continue }
              const measure = [...into(req, 'measures'), ...into(cap, 'measures')].find((x) => k(x) === 'MOE' || k(x) === 'MOP')
              if (!measure) { results.push({ ids: [...base, fn, log, phy, info, ver], complete: false, reachedStep: 9 }); continue }
              const inThread = new Set([...base, fn, log, phy, info, ver, measure])
              const risk = L.find((l) => (l.type === 'affects' && k(l.source) === 'R' && inThread.has(l.target)) || (l.type === 'mitigates' && k(l.target) === 'R' && inThread.has(l.source)))
              const riskId = risk ? (k(risk.source) === 'R' ? risk.source : risk.target) : undefined
              const ids = [...base, fn, log, phy, info, ver, measure, ...(riskId ? [riskId] : [])]
              results.push({ ids, complete: !!riskId, reachedStep: riskId ? 11 : 10 })
            }
          }
        }
      }
    }
  }
  return results
}

export function completeThreads(m: EngineeringModel): Thread[] {
  const seen = new Set<string>()
  return m.elements
    .filter((e) => e.kind === 'STK' && e.status === 'active')
    .flatMap((s) => threadsFrom(m, s.id))
    .filter((t) => t.complete)
    .filter((t) => {
      const key = t.ids.join('>')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}
