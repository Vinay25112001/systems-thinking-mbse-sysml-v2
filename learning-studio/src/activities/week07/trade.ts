// Week 7 trade-study logic (pure, unit-tested in trade.test.ts).
//
// Method, and where each part comes from:
//   - Value functions map each measure from its walk-away point (value 0) to its stretch goal (value 1)
//     (R18 = SEBoK "Decision Management", p.465–466). Linear is the default shape; a piecewise-linear shape with
//     a mid-value anchor is an instructor-authored option for showing returns to scale (R18 p.466 says value
//     functions show "returns to scale on the measure range" and that the rationale for the shape must be recorded).
//   - Swing weights: unnormalised points (100 for the most valuable swing), normalised to sum to one for the
//     additive value model (R18 p.466).
//   - Additive value v(a) = sum_i w_i v_i(x_i(a)) (R18 p.469; the equation itself is an image in the source PDF).
//   - One-way weight sensitivity (R18 p.472 "line diagram ... sensitivity to the swing weight judgment"). The
//     rescaling rule — set one weight to w and rescale the others in proportion so the weights still sum to one —
//     is the course convention used by the reference model (src/model/reference/week07.ts); it is not stated in R18.
//   - Monte Carlo over lower / nominal / upper estimates (R18 p.471–472). The triangular and uniform distributions,
//     the seeded PRNG, the derived-score model (one draw of each uncertain driver per trial, pushed through a stated
//     model into every alternative's score) and the "same quantile" rank-correlation approximation are
//     instructor-authored choices.
//
// All AeroLink numbers that flow through this module are FICTIONAL teaching values.

export type ValueShape = 'linear' | 'piecewise'

export type Criterion = {
  id: string
  name: string
  unit: string
  /** Walk-away point: value 0 (R18 p.465). */
  worst: number
  /** Stretch goal: value 1 (R18 p.466). */
  best: number
  /** Unnormalised swing points (100 = most valuable swing). */
  swingPoints: number
  shape?: ValueShape
  /** Piecewise shape only: the measure level worth half of the swing (value 0.5). */
  mid?: number
  /** MOE the criterion is traced to (CRIT derives-from MOE). */
  moe?: string
  rationale?: string
}

export type Alternative = {
  id: string
  name: string
  description?: string
  scores: Record<string, number>
  /** Explicitly marked as the baseline / status quo (RB-6.1); stored as the ALT attribute `baseline`. */
  baseline?: boolean
}

export type TradeStudy = { decision: string; criteria: Criterion[]; alternatives: Alternative[] }

export type Weights = Record<string, number>

// ------------------------------------------------------------------------------------------------
// Value functions and the additive model

export const isHigherBetter = (c: Criterion) => c.best > c.worst

/** Single-attribute value of measure level x on criterion c, in [0, 1]. Beyond the stretch goal adds no value. */
export function valueOf(x: number, c: Criterion): number {
  if (!Number.isFinite(x) || c.best === c.worst) return 0
  const f = Math.min(1, Math.max(0, (x - c.worst) / (c.best - c.worst)))
  if (c.shape !== 'piecewise' || c.mid === undefined) return f
  const fm = (c.mid - c.worst) / (c.best - c.worst)
  if (!(fm > 0 && fm < 1)) return f
  return f <= fm ? (0.5 * f) / fm : 0.5 + (0.5 * (f - fm)) / (1 - fm)
}

/** Swing weights normalised to sum to one (R18 p.466). Non-positive points count as zero; all zero → equal weights. */
export function normaliseWeights(criteria: Criterion[]): Weights {
  const pts = criteria.map((c) => (Number.isFinite(c.swingPoints) && c.swingPoints > 0 ? c.swingPoints : 0))
  const total = pts.reduce((a, b) => a + b, 0)
  return Object.fromEntries(criteria.map((c, i) => [c.id, total > 0 ? pts[i] / total : 1 / criteria.length]))
}

export type AltValue = { id: string; total: number; values: Record<string, number>; contributions: Record<string, number> }

export function valueTable(study: TradeStudy, weights: Weights = normaliseWeights(study.criteria)): AltValue[] {
  return study.alternatives.map((a) => {
    const values: Record<string, number> = {}
    const contributions: Record<string, number> = {}
    let total = 0
    for (const c of study.criteria) {
      const v = valueOf(a.scores[c.id], c)
      values[c.id] = v
      contributions[c.id] = (weights[c.id] ?? 0) * v
      total += contributions[c.id]
    }
    return { id: a.id, total, values, contributions }
  })
}

/** Alternatives in descending total value; equal totals (within 1e-12) keep their input order. */
export function rank(rows: { id: string; total: number }[]): { id: string; total: number; rank: number }[] {
  return rows
    .map((r, i) => ({ ...r, i }))
    .sort((a, b) => (Math.abs(b.total - a.total) > 1e-12 ? b.total - a.total : a.i - b.i))
    .map((r, k) => ({ id: r.id, total: r.total, rank: k + 1 }))
}

/** Weights with criterion k set to w and the others rescaled in proportion so the weights still sum to one. */
export function reweight(base: Weights, k: string, w: number): Weights {
  const bk = base[k]
  const rest = 1 - bk
  return Object.fromEntries(
    Object.entries(base).map(([id, x]) => [id, id === k ? w : rest > 1e-12 ? (x * (1 - w)) / rest : (1 - w) / (Object.keys(base).length - 1)]),
  )
}

// ------------------------------------------------------------------------------------------------
// One-way weight sensitivity, derived algebraically.
//
// With weight w on criterion k and proportional rescaling, the total of alternative a is
//   V_a(w) = w * v_ak + (1 - w) * S_a,   S_a = sum_{j != k} w_j v_aj / (1 - w_k)
// i.e. a straight line in w with intercept S_a and slope v_ak - S_a. Two alternatives a and b tie where
//   w* = (S_b - S_a) / ((v_ak - S_a) - (v_bk - S_b)).

export type Line = { id: string; intercept: number; slope: number }
export type Interval = { from: number; to: number; top: string }
export type Reversal = { at: number; from: string; to: string; direction: 'up' | 'down' }

export type Sensitivity = {
  criterion: string
  base: number
  lines: Line[]
  /** The top-ranked alternative over [0, 1], as consecutive intervals. */
  intervals: Interval[]
  /** First change of the top rank when the weight rises from its base value, and when it falls. */
  up: Reversal | null
  down: Reversal | null
  /** Every pairwise crossing inside (0, 1), for the table equivalent of the line diagram. */
  crossings: { a: string; b: string; at: number }[]
}

export function sensitivityLines(study: TradeStudy, k: string, weights: Weights = normaliseWeights(study.criteria)): Line[] {
  const rows = valueTable(study, weights)
  const wk = weights[k]
  return rows.map((r) => {
    const others = r.total - r.contributions[k]
    // When w_k = 1 the other weights are all zero, so S_a is not identified; reweight() then spreads 1 - w equally.
    const S = wk < 1 - 1e-12 ? others / (1 - wk) : study.criteria.filter((c) => c.id !== k).reduce((s, c) => s + r.values[c.id], 0) / Math.max(1, study.criteria.length - 1)
    return { id: r.id, intercept: S, slope: r.values[k] - S }
  })
}

const at = (l: Line, w: number) => l.intercept + l.slope * w

/** Top alternative at weight w (ties resolved by input order, as in rank()). */
function topAt(lines: Line[], w: number): string {
  let best = lines[0]
  for (const l of lines.slice(1)) if (at(l, w) > at(best, w) + 1e-12) best = l
  return best.id
}

export function sensitivity(study: TradeStudy, k: string, weights: Weights = normaliseWeights(study.criteria)): Sensitivity {
  const lines = sensitivityLines(study, k, weights)
  const base = weights[k]
  const crossings: { a: string; b: string; at: number }[] = []
  for (let i = 0; i < lines.length; i++)
    for (let j = i + 1; j < lines.length; j++) {
      const a = lines[i]
      const b = lines[j]
      const ds = a.slope - b.slope
      if (Math.abs(ds) < 1e-12) continue
      const w = (b.intercept - a.intercept) / ds
      if (w > 1e-9 && w < 1 - 1e-9) crossings.push({ a: a.id, b: b.id, at: w })
    }
  const cuts = [0, ...crossings.map((c) => c.at).sort((x, y) => x - y), 1]
  const intervals: Interval[] = []
  for (let i = 0; i < cuts.length - 1; i++) {
    if (cuts[i + 1] - cuts[i] < 1e-12) continue
    const top = topAt(lines, (cuts[i] + cuts[i + 1]) / 2)
    const last = intervals[intervals.length - 1]
    if (last && last.top === top) last.to = cuts[i + 1]
    else intervals.push({ from: cuts[i], to: cuts[i + 1], top })
  }
  const baseTop = topAt(lines, base)
  // The interval that holds the base weight (if the base sits exactly on a tie, the one whose top is the base top).
  let i0 = intervals.findIndex((iv) => base >= iv.from - 1e-12 && base <= iv.to + 1e-12 && iv.top === baseTop)
  if (i0 < 0) i0 = intervals.findIndex((iv) => base >= iv.from && base <= iv.to)
  const cur = intervals[i0]
  const up: Reversal | null = cur && i0 < intervals.length - 1 ? { at: cur.to, from: cur.top, to: intervals[i0 + 1].top, direction: 'up' } : null
  const down: Reversal | null = cur && i0 > 0 ? { at: cur.from, from: cur.top, to: intervals[i0 - 1].top, direction: 'down' } : null
  return { criterion: k, base, lines, intervals, up, down, crossings: crossings.sort((x, y) => x.at - y.at) }
}

/** Value of every alternative at weight w on criterion k (for the line diagram and its table). */
export function valuesAtWeight(s: Sensitivity, w: number): Record<string, number> {
  return Object.fromEntries(s.lines.map((l) => [l.id, at(l, w)]))
}

// ------------------------------------------------------------------------------------------------
// Tornado: how the base-case winner's margin over the best other alternative moves when each weight is varied
// by ±delta (clamped to [0, 1]). The margin is concave in w (a line minus a maximum of lines), so its minimum over
// the range is at an endpoint and the two endpoint margins bound it.

export type TornadoBar = { criterion: string; base: number; low: number; high: number; marginLow: number; marginHigh: number; marginBase: number; flips: boolean; swing: number }

export function margin(lines: Line[], winner: string, w: number): number {
  const wl = lines.find((l) => l.id === winner)!
  const others = lines.filter((l) => l.id !== winner)
  if (others.length === 0) return at(wl, w)
  return at(wl, w) - Math.max(...others.map((l) => at(l, w)))
}

export function tornado(study: TradeStudy, delta = 0.1, weights: Weights = normaliseWeights(study.criteria)): TornadoBar[] {
  const ranked = rank(valueTable(study, weights))
  const winner = ranked[0].id
  return study.criteria
    .map((c) => {
      const lines = sensitivityLines(study, c.id, weights)
      const base = weights[c.id]
      const low = Math.max(0, base - delta)
      const high = Math.min(1, base + delta)
      const marginLow = margin(lines, winner, low)
      const marginHigh = margin(lines, winner, high)
      return { criterion: c.id, base, low, high, marginLow, marginHigh, marginBase: margin(lines, winner, base), flips: Math.min(marginLow, marginHigh) < 0, swing: Math.abs(marginHigh - marginLow) }
    })
    .sort((a, b) => b.swing - a.swing)
}

// ------------------------------------------------------------------------------------------------
// Monte Carlo on uncertain scores (R18 p.471–472)

export type Dist = { kind: 'fixed' } | { kind: 'uniform'; low: number; high: number } | { kind: 'triangular'; low: number; mode: number; high: number }

/**
 * A score DERIVED from uncertain drivers through a stated model, instead of an elicited distribution of its own.
 *  - 'wait': CRIT-001-style wait in minutes, waitMinutes(driver / capacity) (the course wait model, below).
 *  - 'linear': constant + Σ coef × driver (e.g. capital = 4 × aircraft price + 2 × charger cost).
 * One draw of each driver per trial feeds every alternative that uses it, so the alternatives are coupled exactly
 * as the model says — not only rank-correlated (instructor-authored method).
 */
export type Derived = { kind: 'wait'; driver: string; capacity: number } | { kind: 'linear'; constant: number; terms: { driver: string; coef: number }[] }

/** Uncertainty of one score cell: an elicited distribution, or a score derived from drivers. */
export type CellUncertainty = Dist | Derived

/** Uncertainty per alternative and criterion; a missing entry means the nominal score is used (fixed). */
export type Uncertainty = Record<string, Record<string, CellUncertainty>>

/** An uncertain independent variable that drives one or more scores (R18 p.471), with its own elicited distribution. */
export type Driver = { id: string; name: string; unit: string; dist: Dist }

export const isDerived = (d: CellUncertainty): d is Derived => d.kind === 'wait' || d.kind === 'linear'

/**
 * Course wait model, in minutes, at utilisation u = demand / capacity: the Week 1 approximation 2 / (1 − u), with u
 * capped at 0.97 and an overload term of 120 min per unit of utilisation above 1 (unserved demand queues). The cap and
 * the overload term are instructor-authored extensions of the Week 1 model, used for CRIT-001 (FICTIONAL).
 */
export function waitMinutes(u: number): number {
  return 2 / (1 - Math.min(u, 0.97)) + Math.max(0, u - 1) * 120
}

/** The score of a derived cell for given driver values. */
export function derivedScore(d: Derived, x: Record<string, number>): number {
  if (d.kind === 'wait') return waitMinutes(x[d.driver] / d.capacity)
  return d.terms.reduce((s, t) => s + t.coef * x[t.driver], d.constant)
}

/** Human-readable formula of a derived cell. */
export function derivedFormula(d: Derived, names: Record<string, string> = {}): string {
  const n = (id: string) => names[id] ?? id
  if (d.kind === 'wait') return `wait model at ${n(d.driver)} ÷ ${d.capacity}`
  const terms = d.terms.map((t) => `${t.coef} × ${n(t.driver)}`)
  return [...(d.constant ? [String(d.constant)] : []), ...terms].join(' + ') || '0'
}

/** Most-likely value of a driver (the mode of a triangular, the midpoint of a uniform). */
export function driverNominal(d: Driver): number {
  return d.dist.kind === 'triangular' ? d.dist.mode : d.dist.kind === 'uniform' ? (d.dist.low + d.dist.high) / 2 : NaN
}

/** A driver is usable when it has a triangular or uniform distribution with ordered, finite bounds. */
export function driverIssue(d: Driver): string | null {
  if (d.dist.kind === 'fixed') return 'a driver needs a triangular or uniform distribution'
  return distIssue(d.dist)
}

/** Mulberry32: a small, fast, seeded PRNG so that runs are reproducible (instructor-authored choice). */
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

/** Inverse cumulative distribution: the score at quantile u in [0, 1). */
export function quantile(d: Dist, nominal: number, u: number): number {
  if (d.kind === 'fixed') return nominal
  if (d.kind === 'uniform') return d.low + u * (d.high - d.low)
  const { low: a, mode: c, high: b } = d
  if (b <= a) return c
  const fc = (c - a) / (b - a)
  return u < fc ? a + Math.sqrt(u * (b - a) * (c - a)) : b - Math.sqrt((1 - u) * (b - a) * (b - c))
}

export function distMean(d: Dist, nominal: number): number {
  if (d.kind === 'fixed') return nominal
  if (d.kind === 'uniform') return (d.low + d.high) / 2
  return (d.low + d.mode + d.high) / 3
}

/** A distribution is usable when its bounds are ordered (low ≤ mode ≤ high) and finite; a derived cell needs its drivers. */
export function distIssue(d: CellUncertainty, drivers: Driver[] = []): string | null {
  if (d.kind === 'fixed') return null
  if (isDerived(d)) {
    const ids = d.kind === 'wait' ? [d.driver] : d.terms.map((t) => t.driver)
    const missing = ids.find((id) => !drivers.some((x) => x.id === id))
    if (missing) return `driver ${missing} is not defined`
    if (d.kind === 'wait' && !(d.capacity > 0)) return 'capacity must be positive'
    if (d.kind === 'linear' && !(Number.isFinite(d.constant) && d.terms.every((t) => Number.isFinite(t.coef)))) return 'coefficients must be numbers'
    return null
  }
  const nums = d.kind === 'uniform' ? [d.low, d.high] : [d.low, d.mode, d.high]
  if (!nums.every(Number.isFinite)) return 'bounds must be numbers'
  if (d.kind === 'uniform' && d.low > d.high) return 'low must not exceed high'
  if (d.kind === 'triangular' && !(d.low <= d.mode && d.mode <= d.high)) return 'need low ≤ most likely ≤ high'
  return null
}

export type MonteCarloOptions = {
  n: number
  seed: number
  /** Drivers referenced by derived cells (R18 p.471: "independent variables ... that impact one or more scores"). */
  drivers?: Driver[]
  /**
   * Comparison only: draw every derived cell's drivers separately, as if each alternative had its own forecast. This
   * deliberately breaks the shared-driver model, to show what ignoring the dependence does.
   */
  independentDrivers?: boolean
  /**
   * Criteria whose ELICITED distributions are rank-correlated: in each trial the same quantile is used for every
   * alternative on that criterion. This is an approximation for scores that move together when no driver model is
   * available; equal quantiles of different distributions do not correspond to one common driver value unless each
   * distribution is the exact image of that driver. Derived cells ignore it.
   */
  shared?: string[]
}

export type MonteCarloResult = {
  n: number
  seed: number
  /** Times each alternative ranked first; ties at the top are credited to the first in input order. */
  firstCounts: Record<string, number>
  pFirst: Record<string, number>
  /** Monte Carlo standard error of pFirst: sqrt(p (1 − p) / n). */
  seFirst: Record<string, number>
  mean: Record<string, number>
  p05: Record<string, number>
  p95: Record<string, number>
  meanRank: Record<string, number>
}

const pct = (sorted: number[], p: number) => {
  if (sorted.length === 0) return NaN
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))))
  return sorted[i]
}

export function monteCarlo(study: TradeStudy, unc: Uncertainty, opts: MonteCarloOptions, weights: Weights = normaliseWeights(study.criteria)): MonteCarloResult {
  const n = Math.max(1, Math.floor(opts.n))
  const rnd = mulberry32(opts.seed)
  const shared = new Set(opts.shared ?? [])
  const ids = study.alternatives.map((a) => a.id)
  const firstCounts = Object.fromEntries(ids.map((id) => [id, 0]))
  const rankSum = Object.fromEntries(ids.map((id) => [id, 0]))
  const samples: Record<string, number[]> = Object.fromEntries(ids.map((id) => [id, []]))
  const drivers = opts.drivers ?? []
  const drawDrivers = () => Object.fromEntries(drivers.map((d) => [d.id, quantile(d.dist, NaN, rnd())]))
  for (let t = 0; t < n; t++) {
    // Draw in a fixed order (drivers first, then criterion-major) so that results depend only on the seed and the inputs.
    const x = opts.independentDrivers ? {} : drawDrivers()
    const u: Record<string, Record<string, number>> = Object.fromEntries(ids.map((id) => [id, {}]))
    for (const c of study.criteria) {
      const common = shared.has(c.id) ? rnd() : 0
      for (const a of study.alternatives) u[a.id][c.id] = shared.has(c.id) ? common : rnd()
    }
    const totals = study.alternatives.map((a) => {
      let total = 0
      for (const c of study.criteria) {
        const d = unc[a.id]?.[c.id] ?? { kind: 'fixed' as const }
        const score = isDerived(d) ? derivedScore(d, opts.independentDrivers ? drawDrivers() : x) : quantile(d, a.scores[c.id], u[a.id][c.id])
        total += (weights[c.id] ?? 0) * valueOf(score, c)
      }
      return { id: a.id, total }
    })
    const r = rank(totals)
    firstCounts[r[0].id] += 1
    for (const x of r) {
      rankSum[x.id] += x.rank
      samples[x.id].push(x.total)
    }
  }
  const pFirst = Object.fromEntries(ids.map((id) => [id, firstCounts[id] / n]))
  const sorted = Object.fromEntries(ids.map((id) => [id, [...samples[id]].sort((a, b) => a - b)]))
  return {
    n,
    seed: opts.seed,
    firstCounts,
    pFirst,
    seFirst: Object.fromEntries(ids.map((id) => [id, Math.sqrt((pFirst[id] * (1 - pFirst[id])) / n)])),
    mean: Object.fromEntries(ids.map((id) => [id, samples[id].reduce((a, b) => a + b, 0) / n])),
    p05: Object.fromEntries(ids.map((id) => [id, pct(sorted[id], 0.05)])),
    p95: Object.fromEntries(ids.map((id) => [id, pct(sorted[id], 0.95)])),
    meanRank: Object.fromEntries(ids.map((id) => [id, rankSum[id] / n])),
  }
}

// ------------------------------------------------------------------------------------------------
// Checks on a student's trade study (L7 acceptance rules, lab plan Part B; RB-6.1–6.3)

export type StudyIssue = { level: 'error' | 'warning'; text: string }

export function checkStudy(study: TradeStudy): StudyIssue[] {
  const out: StudyIssue[] = []
  if (!study.decision.trim()) out.push({ level: 'warning', text: 'No decision statement (R18 p.465: frame the decision first; RB-6.1).' })
  if (study.alternatives.length < 3) out.push({ level: 'error', text: `L7 needs at least 3 alternatives including a baseline (${study.alternatives.length} present).` })
  const baselines = study.alternatives.filter((a) => a.baseline)
  if (baselines.length === 0) out.push({ level: 'warning', text: 'No alternative is marked as the baseline / status quo (RB-6.1). Tick the Baseline column; L7 will not save without it.' })
  if (baselines.length > 1) out.push({ level: 'warning', text: `More than one alternative is marked as the baseline (${baselines.map((a) => a.id).join(', ')}); mark exactly one.` })
  if (study.criteria.length < 4) out.push({ level: 'error', text: `L7 needs at least 4 criteria (${study.criteria.length} present).` })
  for (const c of study.criteria) {
    if (c.best === c.worst) out.push({ level: 'error', text: `${c.id}: walk-away and stretch goal are equal, so the value function is undefined.` })
    if (!(c.swingPoints > 0)) out.push({ level: 'error', text: `${c.id}: swing points must be positive.` })
    if (!c.moe) out.push({ level: 'warning', text: `${c.id}: not traced to an MOE (RB-6.2); L7 will not save without it.` })
    if (c.shape === 'piecewise' && (c.mid === undefined || !((c.mid - c.worst) / (c.best - c.worst) > 0 && (c.mid - c.worst) / (c.best - c.worst) < 1)))
      out.push({ level: 'error', text: `${c.id}: the mid-value level must lie strictly between the walk-away point and the stretch goal.` })
    for (const a of study.alternatives) if (!Number.isFinite(a.scores[c.id])) out.push({ level: 'error', text: `${a.id} has no score on ${c.id}.` })
  }
  const pts = study.criteria.map((c) => c.swingPoints)
  if (pts.length && Math.max(...pts) !== 100) out.push({ level: 'warning', text: 'The most valuable swing is conventionally given 100 points (R18 p.466).' })
  return out
}

/**
 * L7 acceptance at save time: everything checkStudy() calls an error, plus exactly one alternative explicitly marked
 * as the baseline and every criterion traced to an MOE that exists in the workspace (moeIds). Exploring in the
 * simulator only warns about these; recording the study does not proceed without them.
 */
export function checkForSave(study: TradeStudy, moeIds: string[]): string[] {
  const errors = checkStudy(study).filter((i) => i.level === 'error').map((i) => i.text)
  const baselines = study.alternatives.filter((a) => a.baseline)
  if (baselines.length !== 1) errors.push(`Mark exactly one alternative as the baseline / status quo (RB-6.1; ${baselines.length} marked).`)
  for (const c of study.criteria) {
    if (!c.moe) errors.push(`${c.id}: trace the criterion to an MOE (RB-6.2).`)
    else if (!moeIds.includes(c.moe)) errors.push(`${c.id}: ${c.moe} is not an active MOE in your workspace, so the trace cannot be recorded (RB-6.2).`)
  }
  return errors
}
