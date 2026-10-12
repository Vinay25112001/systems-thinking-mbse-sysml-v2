// Week 5 measures logic (pure): TPM margin arithmetic and explicit status rules.
//
// Source basis (DoD SE Guidebook §4.1.3, R44 p.116-117): a TPM is reported as actual versus planned over time; a
// contingency allowance for measurement error and immaturity is added to the Current Best Estimate (CBE) to give a
// Worst Case Estimate (WCE); margin is the growth that can be accommodated while staying within the threshold
// (threshold minus WCE). The instructor reference (src/model/reference/week05.ts) records the simpler margin
// threshold minus CBE; both are computed here so the difference can be taught.
//
// The status rules below are an INSTRUCTOR-AUTHORED operationalisation (not from a source):
//   R1 breach    - WCE margin < 0 (the worst case is already beyond the threshold)
//   R2 at risk   - WCE margin < the TPM's alert floor
//   R3 at risk   - linear projection of the WCE margin to the next review (same interval, same change) < alert floor
//   otherwise on track. Rules are applied in that order; the first that fires sets the status.
// All TPM histories, contingencies and alert floors are FICTIONAL teaching values.

export type Sense = 'lower-is-better' | 'higher-is-better'
export type TpmStatus = 'breach' | 'at-risk' | 'on-track'

export type TpmSpec = {
  id: string
  name: string
  unit: string
  sense: Sense
  threshold: number
  objective: number
  /** Margin below which the TPM is flagged at risk (FICTIONAL, instructor-set). */
  alertFloor: number
  /** Requirement whose risk the TPM tracks, and its parent MOP (reference IDs). */
  tracks: string
  mop: string
}

export type TpmPoint = { month: number; cbe: number; contingency: number; basis: string }

const r6 = (x: number) => Math.round(x * 1e6) / 1e6

/** Margin of an estimate against the threshold: positive is good for either sense. */
export function marginOf(sense: Sense, threshold: number, estimate: number): number {
  return r6(sense === 'lower-is-better' ? threshold - estimate : estimate - threshold)
}

/** Worst case estimate: contingency moves the estimate towards the threshold (DoD Fig. 4-7 logic). */
export function worstCase(sense: Sense, cbe: number, contingency: number): number {
  return r6(sense === 'lower-is-better' ? cbe + contingency : cbe - contingency)
}

export type Assessment = {
  month: number
  cbe: number
  wce: number
  marginCbe: number
  marginWce: number
  projectedMargin: number | null
  objectiveMet: boolean
  status: TpmStatus
  rule: 'R1' | 'R2' | 'R3' | null
  reason: string
}

export function assessPoint(spec: TpmSpec, point: TpmPoint, previous?: TpmPoint): Assessment {
  const wce = worstCase(spec.sense, point.cbe, point.contingency)
  const marginWce = marginOf(spec.sense, spec.threshold, wce)
  const marginCbe = marginOf(spec.sense, spec.threshold, point.cbe)
  const prevMargin = previous ? marginOf(spec.sense, spec.threshold, worstCase(spec.sense, previous.cbe, previous.contingency)) : null
  const projectedMargin = prevMargin === null ? null : r6(marginWce + (marginWce - prevMargin))
  const objectiveMet = marginOf(spec.sense, spec.objective, point.cbe) >= 0
  const base = { month: point.month, cbe: point.cbe, wce, marginCbe, marginWce, projectedMargin, objectiveMet }
  if (marginWce < 0) return { ...base, status: 'breach', rule: 'R1', reason: `Worst case ${wce} ${spec.unit} is beyond the threshold ${spec.threshold} ${spec.unit}.` }
  if (marginWce < spec.alertFloor) return { ...base, status: 'at-risk', rule: 'R2', reason: `Margin ${marginWce} ${spec.unit} is below the alert floor ${spec.alertFloor} ${spec.unit}.` }
  if (projectedMargin !== null && projectedMargin < spec.alertFloor)
    return { ...base, status: 'at-risk', rule: 'R3', reason: `Margin is eroding: at the same rate it would be ${projectedMargin} ${spec.unit} at the next review, below the alert floor ${spec.alertFloor} ${spec.unit}.` }
  return { ...base, status: 'on-track', rule: null, reason: 'Margin is at or above the alert floor and not projected to fall below it by the next review.' }
}

export function assessHistory(spec: TpmSpec, points: TpmPoint[]): Assessment[] {
  const sorted = [...points].sort((a, b) => a.month - b.month)
  return sorted.map((p, i) => assessPoint(spec, p, i > 0 ? sorted[i - 1] : undefined))
}

export const STATUS_LABEL: Record<TpmStatus, string> = { breach: 'BREACH', 'at-risk': 'AT RISK', 'on-track': 'On track' }
/** Non-colour marker for each status (shape is the encoding; colour only reinforces it). */
export const STATUS_SYMBOL: Record<TpmStatus, string> = { breach: '✖', 'at-risk': '▲', 'on-track': '●' }

// ------------------------------------------------------------------------------------------------
// Reference TPMs (src/model/reference/week05.ts) with FICTIONAL review histories. The month-9 CBE equals the
// reference current estimate (18 min, 63.5 dBA, 23 %), so the CBE margins equal the reference margins (2, 1.5, 3).
// Contingency only falls when the basis matures (R44 p.117): TPM-001 moves from analysis to a surrogate module test
// (month 6) to an end-item pack test (month 9); TPM-002 is still prediction-only, so its contingency falls only with
// model refinement and stays at 1.0 dBA without a measurement.

export const TPMS: TpmSpec[] = [
  { id: 'TPM-001', name: 'Charge time to dispatch threshold', unit: 'min', sense: 'lower-is-better', threshold: 20, objective: 15, alertFloor: 1, tracks: 'REQ-SYS-001', mop: 'MOP-002' },
  { id: 'TPM-002', name: 'Pad-edge noise', unit: 'dBA', sense: 'lower-is-better', threshold: 65, objective: 62, alertFloor: 0.5, tracks: 'REQ-SYS-002', mop: 'MOP-004' },
  { id: 'TPM-003', name: 'Landing energy reserve on the design trip', unit: '%', sense: 'higher-is-better', threshold: 20, objective: 25, alertFloor: 1, tracks: 'REQ-SYS-003', mop: 'MOP-005' },
]

export const TPM_HISTORY: Record<string, TpmPoint[]> = {
  'TPM-001': [
    { month: 0, cbe: 19.0, contingency: 1.0, basis: 'Supplier datasheet charge curve' },
    { month: 3, cbe: 18.6, contingency: 0.9, basis: 'Charge-curve analysis with cell model' },
    { month: 6, cbe: 18.3, contingency: 0.8, basis: 'Bench test of one module (surrogate)' },
    { month: 9, cbe: 18.0, contingency: 0.6, basis: 'Full-pack charge test on a production-representative pack (end item)' },
  ],
  'TPM-002': [
    { month: 0, cbe: 62.5, contingency: 1.5, basis: 'Noise prediction, generic rotor model' },
    { month: 3, cbe: 62.9, contingency: 1.2, basis: 'Prediction with updated rotor geometry' },
    { month: 6, cbe: 63.2, contingency: 1.0, basis: 'Prediction with heavier take-off mass' },
    { month: 9, cbe: 63.5, contingency: 1.0, basis: 'Noise prediction analysis; no measurement yet' },
  ],
  'TPM-003': [
    { month: 0, cbe: 25.0, contingency: 2.0, basis: 'Energy analysis, beginning-of-life cells' },
    { month: 3, cbe: 24.2, contingency: 1.8, basis: 'Energy analysis with mass growth' },
    { month: 6, cbe: 23.5, contingency: 1.6, basis: 'Energy analysis with fade model' },
    { month: 9, cbe: 23.0, contingency: 1.5, basis: 'Energy analysis with end-of-life cell capacity' },
  ],
}
