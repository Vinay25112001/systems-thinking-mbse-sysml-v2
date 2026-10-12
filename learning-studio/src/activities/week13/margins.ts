// Week 13 margin / what-if logic (pure): TPM-001..003 margins under changed estimates, contingencies or thresholds, the
// requirement each TPM tracks, and the risks whose trigger reads the TPM.
//
// Values: thresholds, objectives and current best estimates (CBE) are the instructor reference's (src/model/reference/
// week05.ts); contingencies and alert floors are the Week 5 month-9 teaching values (Week 5 worked example (c)). The
// energy model reproduces the Week 13 analysis-case listing (sysml/week13/aerolink_tpm003_landing_reserve_analysis.sysml)
// with NEW FICTIONAL inputs chosen so that it returns the reference's 23 % estimate. Results are labelled
// "analysis-computed (teaching)" (DECISION_LOG A12) and are never aircraft data.
//
// Status rules: Week 5's instructor-authored rules R1 (breach: worst-case margin < 0) and R2 (at risk: worst-case margin
// below the alert floor). R3 (projection) needs a history and is not applied here. Margin = threshold - estimate for a
// lower-is-better TPM and estimate - threshold for a higher-is-better TPM, so a positive margin is always good; the worst
// case estimate (WCE) moves the CBE towards the threshold by the contingency (Week 5, from R44 p.117).
import { kindOfId, type EngineeringModel } from '../../model/engineering'

export type Sense = 'lower-is-better' | 'higher-is-better'
export type TpmSpec = { id: string; name: string; unit: string; sense: Sense; threshold: number; objective: number; cbe: number; contingency: number; alertFloor: number; tracks: string }

export const TPM_SPECS: TpmSpec[] = [
  { id: 'TPM-001', name: 'Charge time to dispatch threshold', unit: 'min', sense: 'lower-is-better', threshold: 20, objective: 15, cbe: 18, contingency: 0.6, alertFloor: 1, tracks: 'REQ-SYS-001' },
  { id: 'TPM-002', name: 'Pad-edge noise', unit: 'dBA', sense: 'lower-is-better', threshold: 65, objective: 62, cbe: 63.5, contingency: 1.0, alertFloor: 0.5, tracks: 'REQ-SYS-002' },
  { id: 'TPM-003', name: 'Landing energy reserve on the design trip', unit: '%', sense: 'higher-is-better', threshold: 20, objective: 25, cbe: 23, contingency: 1.5, alertFloor: 1, tracks: 'REQ-SYS-003' },
]

const r6 = (x: number) => Math.round(x * 1e6) / 1e6
export const marginOf = (sense: Sense, threshold: number, estimate: number) => r6(sense === 'lower-is-better' ? threshold - estimate : estimate - threshold)
export const worstCase = (sense: Sense, cbe: number, contingency: number) => r6(sense === 'lower-is-better' ? cbe + contingency : cbe - contingency)

export type Status = 'breach' | 'at-risk' | 'on-track'
export type Assessment = { wce: number; marginCbe: number; marginWce: number; objectiveMet: boolean; status: Status; rule: 'R1' | 'R2' | null; reason: string }

export function assess(spec: Pick<TpmSpec, 'sense' | 'threshold' | 'objective' | 'alertFloor' | 'unit'>, cbe: number, contingency: number): Assessment {
  const wce = worstCase(spec.sense, cbe, contingency)
  const marginCbe = marginOf(spec.sense, spec.threshold, cbe)
  const marginWce = marginOf(spec.sense, spec.threshold, wce)
  const objectiveMet = marginOf(spec.sense, spec.objective, cbe) >= 0
  if (marginWce < 0) return { wce, marginCbe, marginWce, objectiveMet, status: 'breach', rule: 'R1', reason: `Worst case ${wce} ${spec.unit} is beyond the threshold ${spec.threshold} ${spec.unit}.` }
  if (marginWce < spec.alertFloor) return { wce, marginCbe, marginWce, objectiveMet, status: 'at-risk', rule: 'R2', reason: `Worst-case margin ${marginWce} ${spec.unit} is below the alert floor ${spec.alertFloor} ${spec.unit}.` }
  return { wce, marginCbe, marginWce, objectiveMet, status: 'on-track', rule: null, reason: `Worst-case margin ${marginWce} ${spec.unit} is at or above the alert floor ${spec.alertFloor} ${spec.unit} (no history, so Week 5 rule R3 is not applied).` }
}

// ------------------------------------------------------------------------------------------------
// Energy model behind TPM-003 (same expressions as the SysML analysis case; FICTIONAL inputs).

export type EnergyInputs = { usableEnergyBOL: number; capacityRetainedEOL: number; terminalPower: number; terminalTime: number; cruisePower: number; cruiseTime: number }
/** kWh, fraction, kW, min, kW, min. */
export const BASE_ENERGY: EnergyInputs = { usableEnergyBOL: 120, capacityRetainedEOL: 0.92, terminalPower: 400, terminalTime: 6, cruisePower: 270, cruiseTime: 10 }

export const tripEnergy = (i: EnergyInputs) => r6((i.terminalPower * i.terminalTime + i.cruisePower * i.cruiseTime) / 60)
export const usableEnergyEOL = (i: EnergyInputs) => r6(i.usableEnergyBOL * i.capacityRetainedEOL)
/** Landing energy as a fraction of end-of-life usable energy (the analysis case's return value). */
export const landingFraction = (i: EnergyInputs) => r6((usableEnergyEOL(i) - tripEnergy(i)) / usableEnergyEOL(i))
/** TPM-003 estimate in percent, rounded to 0.1 (what the tracker records). */
export const landingPercent = (i: EnergyInputs) => Math.round(landingFraction(i) * 1000) / 10

/** Smallest capacity retained at end of life that still meets a landing fraction `target` with these trip inputs. */
export const minRetainedFor = (i: EnergyInputs, target: number) => r6(tripEnergy(i) / (1 - target) / i.usableEnergyBOL)

export type Scenario = { id: string; label: string; inputs: EnergyInputs; note: string }
export const ENERGY_SCENARIOS: Scenario[] = [
  { id: 'base', label: 'Baseline energy inputs (reproduce the reference 23 %)', inputs: BASE_ENERGY, note: 'FICTIONAL inputs chosen to reproduce TPM-003’s reference estimate.' },
  { id: 'battery-15', label: 'S04 Lab 13: battery usable energy 15 % lower', inputs: { ...BASE_ENERGY, usableEnergyBOL: r6(BASE_ENERGY.usableEnergyBOL * 0.85) }, note: '“Battery range decreases” read as 15 % less usable energy, same trip energy (the course’s reading of the question).' },
  { id: 'cruise+10', label: 'Cruise power 10 % higher (headwind or heavier aircraft)', inputs: { ...BASE_ENERGY, cruisePower: 297 }, note: 'Trip energy rises by 4.5 kWh.' },
]

// ------------------------------------------------------------------------------------------------
// What the model links a TPM to: the requirement it measures, the verification of that requirement, and the risks that
// affect the TPM or its requirement, with any trigger written as "TPM-nnn margin below X".

export type RiskHit = { id: string; name: string; trigger: string; floor: number | null; firesOnCbe: boolean | null; firesOnWce: boolean | null }
export type TpmLinks = { requirement: string | null; verifications: string[]; risks: RiskHit[] }

const TRIGGER = /\b(TPM-\d{3}) margin below (\d+(?:\.\d+)?)/i

export function linksOf(m: EngineeringModel, tpm: string, marginCbe?: number, marginWce?: number): TpmLinks {
  const live = new Map(m.elements.filter((e) => e.status === 'active').map((e) => [e.id, e] as const))
  const L = m.links.filter((l) => live.has(l.source) && live.has(l.target))
  const requirement = L.find((l) => l.source === tpm && l.type === 'measures' && kindOfId(l.target) === 'REQ')?.target ?? null
  const verifications = requirement ? L.filter((l) => l.type === 'verifies' && l.target === requirement).map((l) => l.source).sort() : []
  const riskIds = new Set(L.filter((l) => l.type === 'affects' && kindOfId(l.source) === 'R' && (l.target === tpm || l.target === requirement)).map((l) => l.source))
  const risks = [...riskIds].sort().map((id) => {
    const e = live.get(id)!
    const trigger = String(e.attributes?.trigger ?? '')
    const t = trigger.match(TRIGGER)
    const floor = t && t[1] === tpm ? Number(t[2]) : null
    return {
      id, name: e.name, trigger, floor,
      firesOnCbe: floor === null || marginCbe === undefined ? null : marginCbe < floor,
      firesOnWce: floor === null || marginWce === undefined ? null : marginWce < floor,
    }
  })
  return { requirement, verifications, risks }
}

export type WhatIfRow = { spec: TpmSpec; cbe: number; contingency: number; threshold: number; a: Assessment; links: TpmLinks }

export function whatIf(m: EngineeringModel, edits: Partial<Record<string, { cbe?: number; contingency?: number; threshold?: number }>>): WhatIfRow[] {
  return TPM_SPECS.map((spec) => {
    const e = edits[spec.id] ?? {}
    const threshold = e.threshold ?? spec.threshold
    const cbe = e.cbe ?? spec.cbe
    const contingency = e.contingency ?? spec.contingency
    const a = assess({ ...spec, threshold }, cbe, contingency)
    return { spec, cbe, contingency, threshold, a, links: linksOf(m, spec.id, a.marginCbe, a.marginWce) }
  })
}

/** Inputs must be finite numbers, contingency non-negative; returns a message or null. */
export function editProblem(v: { cbe?: number; contingency?: number; threshold?: number }): string | null {
  for (const [k, x] of Object.entries(v)) if (x !== undefined && !Number.isFinite(x)) return `${k} must be a number.`
  if (v.contingency !== undefined && v.contingency < 0) return 'Contingency cannot be negative: it is an allowance for uncertainty (Week 5).'
  return null
}

export function whatIfMarkdown(rows: WhatIfRow[], scenario: string): string {
  return [
    `# TPM what-if (analysis-computed, teaching values): ${scenario}`,
    '',
    'Margin = threshold − estimate (lower is better) or estimate − threshold (higher is better); WCE = CBE moved towards the threshold by the contingency; status by Week 5 rules R1 (WCE margin < 0) and R2 (WCE margin < alert floor). All values FICTIONAL.',
    '',
    '| TPM | Threshold | CBE | Contingency | WCE | Margin (CBE) | Margin (WCE) | Status | Tracks | Verification to re-run | Risks (trigger) |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    ...rows.map((r) => `| ${r.spec.id} | ${r.threshold} ${r.spec.unit} | ${r.cbe} | ${r.contingency} | ${r.a.wce} | ${r.a.marginCbe} | ${r.a.marginWce} | ${r.a.status}${r.a.rule ? ` (${r.a.rule})` : ''} | ${r.links.requirement ?? '—'} | ${r.a.status === 'on-track' ? '—' : r.links.verifications.join(', ') || '—'} | ${r.links.risks.map((k) => `${k.id}${k.floor !== null ? ` fires on CBE: ${k.firesOnCbe ? 'yes' : 'no'}, on WCE: ${k.firesOnWce ? 'yes' : 'no'}` : ''}`).join('; ') || '—'} |`),
  ].join('\n')
}
