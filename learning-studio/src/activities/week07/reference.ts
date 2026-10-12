// Reading a trade study out of an AeroLink engineering model (workspace or instructor reference), writing one back,
// and the FICTIONAL score uncertainty used for the Week 7 Monte Carlo worked example.
import type { Element, EngineeringModel } from '../../model/engineering'
import { REFERENCE_BY_WEEK } from '../../model/reference'
import { normaliseWeights, type Criterion, type Dist, type Driver, type TradeStudy, type Uncertainty } from './trade'

const num = (x: unknown): number | undefined => {
  const v = typeof x === 'number' ? x : typeof x === 'string' && x.trim() !== '' ? Number(x) : NaN
  return Number.isFinite(v) ? v : undefined
}

export type ReadResult = { study: TradeStudy; issues: string[] }

/** Build a trade study from the active CRIT, ALT and DEC elements of a model. */
export function studyFromModel(model: EngineeringModel): ReadResult {
  const issues: string[] = []
  const active = (k: string) => model.elements.filter((e) => e.kind === k && e.status === 'active')
  const crits = active('CRIT')
  const alts = active('ALT')
  const dec = active('DEC').find((d) => typeof d.attributes?.decision === 'string')
  const criteria: Criterion[] = crits.map((c: Element) => {
    const a = c.attributes ?? {}
    const best = num(a.best)
    const worst = num(a.worst)
    const pts = num(a.swingPoints) ?? (num(a.weight) !== undefined ? num(a.weight)! * 100 : undefined)
    if (best === undefined || worst === undefined) issues.push(`${c.id}: attributes best/worst (stretch goal and walk-away point) are missing`)
    if (pts === undefined) issues.push(`${c.id}: attribute swingPoints (or weight) is missing`)
    const moe = model.links.find((l) => l.source === c.id && l.type === 'derives-from' && l.target.startsWith('MOE-'))?.target
    const mid = num(a.mid)
    return {
      id: c.id,
      name: c.name,
      unit: String(a.unit ?? ''),
      best: best ?? 1,
      worst: worst ?? 0,
      swingPoints: pts ?? 0,
      shape: mid !== undefined ? 'piecewise' : 'linear',
      mid,
      moe,
      rationale: typeof a.swingRationale === 'string' ? a.swingRationale : undefined,
    }
  })
  const alternatives = alts.map((a) => {
    const scores: Record<string, number> = {}
    for (const c of criteria) {
      const v = num(a.attributes?.[c.id])
      if (v === undefined) issues.push(`${a.id}: no score for ${c.id} (attribute "${c.id}")`)
      else scores[c.id] = v
    }
    // Baseline: the explicit ALT attribute `baseline` (written by the simulator). Models without the attribute (such as
    // the instructor reference) fall back to a name that STARTS with "Baseline" or "Status quo" — a label, not a
    // mention anywhere in the description.
    const flag = a.attributes?.baseline
    const baseline = flag === true || flag === 'true' || (flag === undefined && /^\s*(baseline|status quo)\b/i.test(a.name))
    return { id: a.id, name: a.name, description: a.text, scores, baseline }
  })
  if (crits.length === 0) issues.push('No active CRIT elements in this model.')
  if (alts.length === 0) issues.push('No active ALT elements in this model.')
  return { study: { decision: typeof dec?.attributes?.decision === 'string' ? dec.attributes.decision : '', criteria, alternatives }, issues }
}

/** The instructor reference trade study (Week 7 layer of the reference baseline). */
export function referenceStudy(): TradeStudy {
  return studyFromModel(REFERENCE_BY_WEEK[7]).study
}

const tri = (low: number, mode: number, high: number): Dist => ({ kind: 'triangular', low, mode, high })

/**
 * FICTIONAL uncertain drivers for the reference trade study (R18 p.471: SMEs give a lower, nominal and upper bound for
 * the independent variables that drive one or more scores). All teaching values.
 */
export const REFERENCE_DRIVERS: Driver[] = [
  { id: 'D', name: 'Year-2 demand', unit: 'trips/day', dist: tri(216, 240, 264) }, // A-006 ± 10 %
  { id: 'AC', name: 'Aircraft unit price', unit: 'USD M', dist: tri(2.7, 3.0, 3.6) },
  { id: 'HP', name: 'High-power charger upgrade, per charger', unit: 'USD M', dist: tri(0.3, 0.4, 0.8) },
  { id: 'VP', name: 'New hub vertiport', unit: 'USD M', dist: tri(4.8, 6.0, 9.0) }, // USD 6.0 M, −20 % / +50 %
  { id: 'PK', name: 'Noise peaking factor', unit: '×', dist: tri(1.44, 1.6, 1.76) },
]

/**
 * Score uncertainty of the reference trade study, every uncertain cell DERIVED from the drivers above through the
 * model that produced its nominal score (so one draw of a driver moves every alternative that depends on it):
 *  - CRIT-001 wait = waitMinutes(D / capacity), capacity 240 / 288 / 240 / 320 trips/day.
 *  - CRIT-002 capital: ALT-002 = 6 × AC; ALT-003 = VP; ALT-004 = 4 × AC + 2 × HP. The baseline needs no capital.
 *  - CRIT-003 capacity after losing a hub: a network calculation, held fixed.
 *  - CRIT-004 busiest-vertiport movements/h = off-peak rate × PK (5 /h for ALT-001, -002, -004; 30/7 /h for ALT-003,
 *    whose fourth hub spreads the movements), i.e. the nominal 8 and 6.86 at PK = 1.6. Movements are held at the
 *    Year-2 planning demand: a course simplification.
 */
export const REFERENCE_UNCERTAINTY: Uncertainty = {
  'ALT-001': { 'CRIT-001': { kind: 'wait', driver: 'D', capacity: 240 }, 'CRIT-004': { kind: 'linear', constant: 0, terms: [{ driver: 'PK', coef: 5 }] } },
  'ALT-002': {
    'CRIT-001': { kind: 'wait', driver: 'D', capacity: 288 },
    'CRIT-002': { kind: 'linear', constant: 0, terms: [{ driver: 'AC', coef: 6 }] },
    'CRIT-004': { kind: 'linear', constant: 0, terms: [{ driver: 'PK', coef: 5 }] },
  },
  'ALT-003': {
    'CRIT-001': { kind: 'wait', driver: 'D', capacity: 240 },
    'CRIT-002': { kind: 'linear', constant: 0, terms: [{ driver: 'VP', coef: 1 }] },
    'CRIT-004': { kind: 'linear', constant: 0, terms: [{ driver: 'PK', coef: 30 / 7 }] },
  },
  'ALT-004': {
    'CRIT-001': { kind: 'wait', driver: 'D', capacity: 320 },
    'CRIT-002': { kind: 'linear', constant: 0, terms: [{ driver: 'AC', coef: 4 }, { driver: 'HP', coef: 2 }] },
    'CRIT-004': { kind: 'linear', constant: 0, terms: [{ driver: 'PK', coef: 5 }] },
  },
}
/** No elicited distributions are rank-correlated in the reference: every coupling goes through a driver. */
export const REFERENCE_SHARED: string[] = []

/** Attributes to store on a CRIT element so that studyFromModel() reads it back unchanged. */
export function critAttributes(c: Criterion, weight: number): Element['attributes'] {
  const attrs: Record<string, string | number | boolean> = {
    unit: c.unit,
    sense: c.best > c.worst ? 'higher-is-better' : 'lower-is-better',
    valueFunction: c.shape === 'piecewise' && c.mid !== undefined ? `piecewise linear: v = 0 at ${c.worst}, 0.5 at ${c.mid}, 1 at ${c.best}` : `linear: v = 0 at ${c.worst}, v = 1 at ${c.best}`,
    best: c.best,
    worst: c.worst,
    swingPoints: c.swingPoints,
    weight: Math.round(weight * 1000) / 1000,
  }
  if (c.shape === 'piecewise' && c.mid !== undefined) attrs.mid = c.mid
  if (c.rationale) attrs.swingRationale = c.rationale
  return attrs
}

export function studyWeights(s: TradeStudy) {
  return normaliseWeights(s.criteria)
}
