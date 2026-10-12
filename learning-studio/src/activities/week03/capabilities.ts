// Week 3 — capability tree and gap logic (pure).
// Course rules (LABORATORY_AND_CAPSTONE_PLAN.md L3; RB-2.3, RB-2.5): every capability traces to a need
// (CAP derives-from NEED); ≥ 5 capabilities, ≥ 2 of them decomposed (a child CAP refines its parent CAP); a need
// with no capability is a coverage gap. Source basis: capabilities exist to meet mission and enterprise needs, and
// desired levels compared with the baseline (existing plus planned) give capability gaps and excesses, sometimes mapped into near/mid/far time buckets
// (R12 p.862). The tree, the "≥ 2 constituents" advisory and the tolerance band are instructor-authored.
import { kindOfId, type EngineeringModel } from '../../model/engineering'
import { solutionTerms } from './needs'

export type CapNode = { id: string; name: string; needs: string[]; parent?: string; children: CapNode[] }

export type CapabilityCoverage = {
  needs: string[]
  caps: string[]
  /** Needs with no capability deriving from them (coverage gaps). */
  uncoveredNeeds: string[]
  /** Capabilities that derive from no need. */
  untracedCaps: string[]
  /** Parents with at least one refining child. */
  decomposed: string[]
  /** Decomposed parents with exactly one child (advisory: a single constituent rarely covers its parent). */
  singleChild: string[]
  /** Capabilities on a refines cycle (an error). */
  cycles: string[]
  roots: CapNode[]
}

export function capabilityCoverage(m: EngineeringModel): CapabilityCoverage {
  const live = new Map(m.elements.filter((e) => e.status === 'active').map((e) => [e.id, e]))
  const links = m.links.filter((l) => live.has(l.source) && live.has(l.target))
  const needs = [...live.values()].filter((e) => e.kind === 'NEED').map((e) => e.id)
  const caps = [...live.values()].filter((e) => e.kind === 'CAP').map((e) => e.id)
  const capSet = new Set(caps)
  const needsOf = (c: string) => links.filter((l) => l.source === c && l.type === 'derives-from' && kindOfId(l.target) === 'NEED').map((l) => l.target)
  const parentOf = new Map<string, string>()
  for (const l of links) if (l.type === 'refines' && capSet.has(l.source) && capSet.has(l.target) && !parentOf.has(l.source)) parentOf.set(l.source, l.target)

  const cycles = caps.filter((c) => {
    const seen = new Set<string>()
    let cur: string | undefined = c
    while (cur && !seen.has(cur)) {
      seen.add(cur)
      cur = parentOf.get(cur)
      if (cur === c) return true
    }
    return false
  })
  const childrenOf = (p: string) => caps.filter((c) => parentOf.get(c) === p)
  const build = (id: string, path: Set<string>): CapNode => ({
    id,
    name: live.get(id)?.name ?? id,
    needs: needsOf(id),
    parent: parentOf.get(id),
    children: childrenOf(id).filter((c) => !path.has(c)).map((c) => build(c, new Set([...path, c]))),
  })
  const roots = caps.filter((c) => !parentOf.has(c) || cycles.includes(c)).map((c) => build(c, new Set([c])))
  const covered = new Set(caps.flatMap(needsOf))
  const decomposed = caps.filter((c) => childrenOf(c).length > 0)
  return {
    needs,
    caps,
    uncoveredNeeds: needs.filter((n) => !covered.has(n)),
    untracedCaps: caps.filter((c) => needsOf(c).length === 0),
    decomposed,
    singleChild: decomposed.filter((c) => childrenOf(c).length === 1),
    cycles,
    roots,
  }
}

export type Check = { id: string; label: string; ok: boolean; detail?: string }

/** The L3 capability acceptance checks, computed from the workspace. */
export function l3CapabilityChecks(c: CapabilityCoverage): Check[] {
  return [
    { id: 'cap-count', label: '≥ 5 capabilities (L3, CP1)', ok: c.caps.length >= 5, detail: `${c.caps.length}` },
    { id: 'cap-decomposed', label: '≥ 2 capabilities decomposed (L3, CP1)', ok: c.decomposed.length >= 2, detail: c.decomposed.join(', ') || 'none' },
    { id: 'cap-traced', label: 'Every capability traces to a need (L3 acceptance, RB-2.5)', ok: c.caps.length > 0 && c.untracedCaps.length === 0, detail: c.untracedCaps.join(', ') || undefined },
    { id: 'need-covered', label: 'Every need is met by at least one capability (no coverage gap)', ok: c.needs.length > 0 && c.uncoveredNeeds.length === 0, detail: c.uncoveredNeeds.join(', ') || undefined },
    { id: 'no-cycles', label: 'Decomposition has no cycles', ok: c.cycles.length === 0, detail: c.cycles.join(', ') || undefined },
  ]
}

export type CapDraft = { name: string; text: string; needs: string[]; parent: string }

/** Reasons a capability draft cannot be recorded, plus advisories that do not block recording. */
export function checkCapability(d: CapDraft): { errors: string[]; advisories: string[] } {
  const errors: string[] = []
  const advisories: string[] = []
  if (!d.name.trim()) errors.push('Give the capability a short name.')
  if (d.text.trim().split(/\s+/).filter(Boolean).length < 5) errors.push('Describe the capability as what the enterprise must be able to do (at least five words).')
  if (!d.needs.some((n) => /^NEED-\d{3}$/.test(n))) errors.push('Trace the capability to at least one need (L3: every capability traces to a need).')
  if (/\b(shall|must)\b/i.test(d.text)) errors.push('Capabilities are abilities, not requirements: remove “shall”/“must”.')
  const sol = solutionTerms(d.text)
  if (sol.length) advisories.push(`Design terms (${sol.map((s) => `“${s.match}”`).join(', ')}): a capability states an ability, so keep the means open unless a constraint dictates it.`)
  return { errors, advisories }
}

// ------------------------------------------------------------------------------------------------
// Capability-gap analysis over near/mid/far horizons (graduate task, R12 p.862)

export const HORIZONS = [
  { id: 'near', label: 'Near (year 1)' },
  { id: 'mid', label: 'Mid (year 2)' },
  { id: 'far', label: 'Far (year 3)' },
] as const
export type Horizon = (typeof HORIZONS)[number]['id']

export type GapRow = {
  capability: string
  measure: string
  unit: string
  baseline: Partial<Record<Horizon, number>>
  desired: Partial<Record<Horizon, number>>
  /** The baseline is an upper bound (e.g. back-to-back use): a shortfall inside the band is then a probable gap. */
  upperBound?: boolean
}
export type GapStatus = 'gap' | 'probable-gap' | 'excess' | 'balanced' | 'incomplete'
export type GapCell = { horizon: Horizon; delta?: number; ratio?: number; status: GapStatus }

/**
 * Delta = baseline − desired. Within ±tolerance of desired counts as balanced (instructor convention, default 5 %),
 * except that a shortfall against an upper-bound baseline is a probable gap: the real baseline can only be lower.
 */
export function gapCell(horizon: Horizon, baseline: number | undefined, desired: number | undefined, tolerance = 0.05, upperBound = false): GapCell {
  if (baseline === undefined || desired === undefined || !Number.isFinite(baseline) || !Number.isFinite(desired) || desired <= 0) return { horizon, status: 'incomplete' }
  const delta = baseline - desired
  const ratio = baseline / desired
  const inBand = Math.abs(delta) <= tolerance * desired
  const status: GapStatus = inBand ? (delta < 0 && upperBound ? 'probable-gap' : 'balanced') : delta < 0 ? 'gap' : 'excess'
  return { horizon, delta, ratio, status }
}

export function gapAnalysis(rows: GapRow[], tolerance = 0.05) {
  return rows.map((r) => {
    const cells = HORIZONS.map((h) => gapCell(h.id, r.baseline[h.id], r.desired[h.id], tolerance, !!r.upperBound))
    const first = cells.find((c) => c.status === 'gap' || c.status === 'probable-gap')
    return { capability: r.capability, cells, firstGap: first?.horizon, firstGapProbable: first?.status === 'probable-gap' }
  })
}

/** Charges one turnaround charger can deliver in the 16 h operating day if it is occupied `minutes` per aircraft. */
export const chargesPerCharger = (minutes: number, operatingHours = 16) => (operatingHours * 60) / minutes

/**
 * Worked example (ALL VALUES FICTIONAL). Demand: 160 / 240 / 320 trips per day in years 1–3 (240 is the A-006
 * planning demand). Desired capacity = demand ÷ 0.8 utilisation ceiling (MGO-007): 200 / 300 / 400. Every trip ends in
 * one hub turnaround charge in the reference cycle, so the same desired levels apply to charging.
 * CAP-001 baseline: 12 aircraft × 20 trips per aircraft per day (net of availability) = 240, with no aircraft on order.
 * CAP-003 baseline depends on how long an aircraft holds a turnaround charger — the assumption the graduate task tests:
 *  - 20 min (course-wide convention, reference assumption A-007, as in the Week 1 dynamics model and the Week 7 trade
 *    study): the 25 min hub turnaround of REQ-STK-005 is 5 min of pad work + 20 min of charging (REQ-SYS-001); with two
 *    pads per turnaround charger the charger is busy only for the 20 min charge: 6 chargers (A-002) × 960 / 20 = 6 × 48 = 288;
 *  - 25 min (sensitivity: the charger is held for the whole turnaround): 6 × 960 / 25 = 6 × 38.4 = 230.4 → 230.
 * Both baselines are upper bounds: they assume every charger is in use back-to-back for the whole 16 h day, with no
 * idle time between arrivals.
 */
export const WORKED_GAP: GapRow[] = [
  { capability: 'CAP-001 On-demand passenger transport', measure: 'trip capacity', unit: 'trips/day', baseline: { near: 240, mid: 240, far: 240 }, desired: { near: 200, mid: 300, far: 400 } },
  { capability: 'CAP-003 Fleet charging management (20 min per charge, A-007)', measure: 'turnaround charges', unit: 'charges/day', baseline: { near: 288, mid: 288, far: 288 }, desired: { near: 200, mid: 300, far: 400 }, upperBound: true },
  { capability: 'CAP-003 sensitivity (25 min per charge)', measure: 'turnaround charges', unit: 'charges/day', baseline: { near: 230, mid: 230, far: 230 }, desired: { near: 200, mid: 300, far: 400 }, upperBound: true },
]
