// Week 6 — graduate task logic (pure): an explicit probability model for one risk, compared with its ordinal 5×5 rating.
// Model: exposures (e.g. charging sessions) arrive at a known count; each initiates the risk event independently with a
// small probability p0, so the number of initiating events over the horizon is Binomial(N, p0) ≈ Poisson(N·p0); each
// initiation then passes through up to three barriers (event tree), each of which fails with a stated probability.
// R17 p.483–484 names probabilistic risk assessment and decision trees among the quantitative methods and warns that the
// result is only as good as the model structure and the probability estimates; R61 p.637 and R46 p.126 supply the
// verbal-probability scales used for the comparison. All rates used in the course are FICTIONAL.
import { LIKELIHOOD } from './risk'

export type Barrier = { name: string; failProb: number }

export type QuantInput = {
  /** Exposures per year (e.g. charging sessions). */
  exposuresPerYear: number
  /** Probability that one exposure initiates the risk event. */
  p0: number
  years: number
  barriers: Barrier[]
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

/** P(at least one event) for an expected count m (Poisson). */
export const pAtLeastOne = (m: number) => 1 - Math.exp(-Math.max(0, m))
/** Exact binomial P(at least one) for n independent trials of probability p. */
export const pAtLeastOneBinomial = (n: number, p: number) => 1 - Math.pow(1 - clamp01(p), Math.max(0, n))

export type Outcome = { id: string; path: string; fraction: number; expected: number; pAtLeastOne: number }

/**
 * Event tree over the barriers: outcome k = the first k barriers fail and barrier k+1 holds (k = 0..n-1), plus the
 * outcome in which all n fail. Fractions are per initiating event and sum to 1.
 */
export function eventTree(input: QuantInput): { initiations: number; pInitiation: number; outcomes: Outcome[] } {
  const initiations = Math.max(0, input.exposuresPerYear) * Math.max(0, input.years) * clamp01(input.p0)
  const outcomes: Outcome[] = []
  let reach = 1
  input.barriers.forEach((b, i) => {
    const f = clamp01(b.failProb)
    const fraction = reach * (1 - f)
    outcomes.push({ id: `stop-${i + 1}`, path: `${input.barriers.slice(0, i).map((x) => `${x.name} fails`).concat(`${b.name} holds`).join(' → ')}`, fraction, expected: initiations * fraction, pAtLeastOne: pAtLeastOne(initiations * fraction) })
    reach *= f
  })
  outcomes.push({ id: 'all-fail', path: input.barriers.length ? `${input.barriers.map((x) => `${x.name} fails`).join(' → ')}` : 'No barriers', fraction: reach, expected: initiations * reach, pAtLeastOne: pAtLeastOne(initiations * reach) })
  return { initiations, pInitiation: pAtLeastOne(initiations), outcomes }
}

export type Band = { level: number | null; label: string }

/** Maps a probability onto the DoD likelihood bands (R46 p.126); outside 1 %–99 % the scale has no level. */
export function likelihoodBand(p: number): Band {
  if (p >= 1) return { level: null, label: 'Certain (1.00) — an issue, not a risk (R61 p.637)' }
  if (p > 0.99) return { level: null, label: 'Above the top band (> 99 %) — treat as an issue in waiting' }
  if (p <= 0.01) return { level: null, label: 'Below the lowest band (≤ 1 %) — the scale cannot resolve it' }
  const b = LIKELIHOOD.find((x) => p > x.lo && p <= x.hi)!
  return { level: b.level, label: `L${b.level} ${b.label} (${b.band})` }
}

/** `agrees` is true only when the model probability lies inside the band of the ordinal level; below 1 % it is always false. */
export type Comparison = { modelBand: Band; ordinal: number; agrees: boolean; message: string }

/** Compares a model probability with the ordinal likelihood a team assigned. */
export function compareWithOrdinal(p: number, ordinal: number): Comparison {
  const modelBand = likelihoodBand(p)
  const pct = `${(p * 100).toPrecision(3)} %`
  if (modelBand.level === null) {
    const below = p <= 0.01
    return {
      modelBand,
      ordinal,
      // Below the scale nothing agrees: L1 means > 1 % (R46 p.126). L1 is only the floor the matrix offers (W6-F07).
      agrees: false,
      message: below
        ? `The model gives ${pct}, below the lowest band (L1 starts above 1 %). ${ordinal === 1 ? 'L1 is the scale floor, not a match: rate at the floor by convention and record in the rationale that the model puts the event below the scale.' : `L${ordinal} overstates it. Rate at the scale floor (L1) by convention and record in the rationale that the model puts the event below the scale.`}`
        : `The model gives ${pct}: this is effectively an issue, not a risk.`,
    }
  }
  const agrees = modelBand.level === ordinal
  return { modelBand, ordinal, agrees, message: agrees ? `The model (${pct}) falls in the band of L${ordinal}.` : `The model (${pct}) falls in ${modelBand.label}, not L${ordinal}. Either the rating or the model inputs need to be revisited — and the rationale recorded (R61 p.639).` }
}

/** Order-of-magnitude sensitivity on the initiating probability (R17 p.486: challenge results; inputs are uncertain). */
export function sensitivity(input: QuantInput, factor = 10) {
  return [1 / factor, 1, factor].map((k) => {
    const t = eventTree({ ...input, p0: input.p0 * k })
    return { factor: k, pInitiation: t.pInitiation, pWorst: t.outcomes[t.outcomes.length - 1].pAtLeastOne }
  })
}

/** Worked example: R-008 thermal runaway during hub charging (all values FICTIONAL). */
export const R008_EXAMPLE: QuantInput = {
  exposuresPerYear: 12 * 20 * 360,
  p0: 1e-6,
  years: 2,
  barriers: [
    { name: 'Cell-temperature monitoring stops charging', failProb: 0.1 },
    { name: 'Pad fire detection and response contain the fire', failProb: 0.2 },
  ],
}
