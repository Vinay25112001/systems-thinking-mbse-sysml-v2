// Week 3 lab brief: the single source of the Lab L3 minimums, the technology readiness scale, the risk scales and
// matrix, the handling options, the security and resilience vocabularies, the TPM arithmetic conventions and the trade
// study gates (which checks are hard gates and which are advisory). Read by the Week 3 lectures (session1.ts, session2.ts),
// the AeroLink case (aerolinkCase.ts), the lab instructions (src/content/lab/week03Lab.ts), the lab tool
// (src/workbench/week3/*) and their tests. Pure data and pure functions, no imports, so both the content and the workbench
// layers may depend on it.
//
// Review status: new-pending-review. Minimums, consequence anchors and person-hours are course conventions (outline §5),
// pending faculty approval; the three-person minimums follow DECISION_LOG A21 provisional decision 4 (workload
// proportional to team size).
//
// Sources checked for this file (page text in _source_cache/*.txt unless stated):
//   - TRL wording: SEBoK Table 1 (Mankins 1995), R16 p.767, quoted verbatim.
//   - Likelihood levels and probability bands, and the Low/Moderate/High cell layout: DoD Figure 4-9, R46 p.126. The
//     figure is an IMAGE; its content was read from the PDF page (Systems Engineering Guidebook.pdf, printed p.118) on
//     2026-10-19, not from the extracted text. The same layout appears in MITRE's handling-option guideline (R61c p.642).
//   - Consequence anchors: a course adaptation, tailored to AeroLink-scale enterprises as R46 p.125 asks ("tailored for the
//     program"); the anchors are instructor-authored.
//   - Handling options: R17 p.484 (assumption, avoidance, control (mitigation), transfer); R46 p.126 (accepted and
//     monitored, avoided, transferred, controlled); R61c p.642 (adds watch/monitor).
//   - Resilience objectives avoid / withstand / recover: R24 p.1204. Security asset classes: R25 p.1231, Table 1.
//   - Margin = threshold − worst-case estimate; worst case = current best estimate + contingency: R44 p.117.
//   - Swing weights depend on importance and range and are normalized to sum to one: R18 p.466. Additive value model
//     v(x) = Σ wᵢ vᵢ(xᵢ) with Σ wᵢ = 1: R18 p.469 (an IMAGE; checked on the PDF page, printed p.456, 2026-10-19).

// ---------------------------------------------------------------------------------------------------- minimums
/** Lab L3 minimums for a team of four (course convention, Session 2 lab brief). */
export const LAB3_MINIMUMS = {
  technologies: 3,
  risks: 6,
  /** Of the risks, at least one security risk and one resilience risk (DECISION_LOG A21 item 6). */
  securityRisks: 1,
  resilienceRisks: 1,
  opportunities: 1,
  tpms: 2,
  /** Including the baseline (status quo). */
  alternatives: 3,
  criteria: 4,
} as const

/** A three-person team: minimums reduced in proportion (A21 provisional decision 4, pending confirmation). The fixed work
 *  (register links, the recommendation, integration) does not shrink; the per-item work does, so the out-of-class load
 *  per person stays within 0.1 h of a team of four (week3Path.ts THREE_PERSON computes it; tested). */
export const LAB3_MINIMUMS_THREE = {
  technologies: 2,
  risks: 4,
  securityRisks: 1,
  resilienceRisks: 1,
  opportunities: 1,
  tpms: 1,
  alternatives: 3,
  criteria: 3,
} as const
export type Lab3Minimums = { [K in keyof typeof LAB3_MINIMUMS]: number }

/** Lab L3 out of class in person-hours for a team of four (course estimate, outline §5.7, checked against logged hours). */
export const LAB3_PERSON_HOURS: { id: string; task: string; hours: number; scales: 'technologies' | 'risks' | 'tpms' | 'criteria' | 'scores' | 'fixed' }[] = [
  { id: 'readiness', task: 'technology readiness assessment (3 × 0.5)', hours: 1.5, scales: 'technologies' },
  { id: 'risks', task: 'risk workshop: statements, ratings, handling (6 risks)', hours: 2.0, scales: 'risks' },
  { id: 'register', task: 'register: assumptions, opportunity, unknowns, issues and links', hours: 1.0, scales: 'fixed' },
  { id: 'tpms', task: 'technical performance measures (2 × 0.5)', hours: 1.0, scales: 'tpms' },
  { id: 'frame', task: 'trade study: criteria, value functions and swing weights', hours: 1.5, scales: 'criteria' },
  { id: 'score', task: 'trade study: scores, computation and sensitivity', hours: 1.5, scales: 'scores' },
  { id: 'decision', task: 'recommendation, conditions and derived requirements', hours: 1.0, scales: 'fixed' },
  { id: 'integration', task: 'integration review and AI usage statement', hours: 0.5, scales: 'fixed' },
]
export const LAB3_TEAM_HOURS = Math.round(LAB3_PERSON_HOURS.reduce((a, t) => a + t.hours, 0) * 10) / 10

// ---------------------------------------------------------------------------------------------------- readiness
/** The nine technology readiness levels, SEBoK Table 1 wording (Mankins 1995), R16 p.767. */
export const TRL_SCALE: { level: number; text: string; environment: 'concept' | 'laboratory' | 'relevant' | 'operational' }[] = [
  { level: 1, text: 'Basic principles observed and reported.', environment: 'concept' },
  { level: 2, text: 'Technology concept and/or application formulated.', environment: 'concept' },
  { level: 3, text: 'An analytical and experimental critical function and/or characteristic proof of concept.', environment: 'laboratory' },
  { level: 4, text: 'Component validation in laboratory environment.', environment: 'laboratory' },
  { level: 5, text: 'Component validation in relevant environment.', environment: 'relevant' },
  { level: 6, text: 'Prototype demonstration in a relevant environment.', environment: 'relevant' },
  { level: 7, text: 'Prototype demonstration in an operational environment.', environment: 'operational' },
  { level: 8, text: 'System qualified through test and demonstration.', environment: 'operational' },
  { level: 9, text: 'System proven through successful mission operations.', environment: 'operational' },
]
export const trlText = (n: number) => TRL_SCALE.find((t) => t.level === n)?.text ?? ''
/** DoD programs do not count a threshold capability met with immature technology (TRL below six) as "threshold"
 *  (MITRE, R60 p.526). The course uses six as the line below which a CRITICAL technology needs a maturity risk. */
export const MATURE_TRL = 6

// ---------------------------------------------------------------------------------------------------- risk scales
/** Likelihood levels and probability bands of DoD Figure 4-9 (R46 p.126, read from the PDF page; the figure is an image). */
export const LIKELIHOOD: { level: number; label: string; band: string; lo: number; hi: number }[] = [
  { level: 1, label: 'Not likely', band: '> 1 % to ≤ 20 %', lo: 0.01, hi: 0.2 },
  { level: 2, label: 'Low likelihood', band: '> 20 % to ≤ 40 %', lo: 0.2, hi: 0.4 },
  { level: 3, label: 'Likely', band: '> 40 % to ≤ 60 %', lo: 0.4, hi: 0.6 },
  { level: 4, label: 'Highly likely', band: '> 60 % to ≤ 80 %', lo: 0.6, hi: 0.8 },
  { level: 5, label: 'Near certainty', band: '> 80 % to ≤ 99 %', lo: 0.8, hi: 0.99 },
]
/** Course consequence anchors (an instructor adaptation of the Figure 4-9 performance and schedule columns, tailored as
 *  R46 p.125 asks). Written for any team's enterprise, not only AeroLink. C4 and C5 are separated by recoverability: a
 *  service suspended and recovered is C4, a permanent loss is C5 (review m4). `keys` are the anchor phrases a rating's
 *  written reason must use (aerolinkCase.test.ts checks every AeroLink rating names its anchor). */
export const CONSEQUENCE: { level: number; label: string; anchor: string; keys: string[] }[] = [
  { level: 1, label: 'Minimal', anchor: 'No effect on meeting any requirement; design margins are still met.', keys: ['no effect', 'margins are still met'] },
  { level: 2, label: 'Minor', anchor: 'A margin is reduced but every requirement is still met; little effect on objectives.', keys: ['margin is reduced', 'every requirement is still met', 'little effect'] },
  { level: 3, label: 'Moderate', anchor: 'A system requirement is missed at times or needs a workaround; one element out of service.', keys: ['system requirement', 'workaround', 'one element'] },
  { level: 4, label: 'Significant', anchor: 'A stakeholder requirement or a planned milestone is missed; the service is impaired or suspended, but recoverable.', keys: ['stakeholder requirement', 'milestone', 'impaired', 'suspended'] },
  { level: 5, label: 'Severe', anchor: 'Injury, permanent loss of a major asset or of the service, or a key requirement cannot be met.', keys: ['injur', 'permanent loss', 'major asset', 'key requirement'] },
]
export type CellLevel = 'Low' | 'Moderate' | 'High'
/** Rows are likelihood 5..1, columns consequence 1..5, as drawn in DoD Figure 4-9 (R46 p.126) and MITRE Figure 1 (R61c p.642). */
const LAYOUT: Record<number, CellLevel[]> = {
  5: ['Low', 'Moderate', 'High', 'High', 'High'],
  4: ['Low', 'Moderate', 'Moderate', 'High', 'High'],
  3: ['Low', 'Low', 'Moderate', 'Moderate', 'High'],
  2: ['Low', 'Low', 'Low', 'Moderate', 'Moderate'],
  1: ['Low', 'Low', 'Low', 'Low', 'Moderate'],
}
export const inScale = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 5
export function cellLevel(likelihood: number, consequence: number): CellLevel {
  if (!inScale(likelihood) || !inScale(consequence)) throw new Error(`Rating out of the 1–5 scale: L${likelihood} C${consequence}`)
  return LAYOUT[likelihood][consequence - 1]
}
/** The ordinal product L × C. Shown in the lecture only to demonstrate its misuse: the scales are ordinal, so the product
 *  is not a quantity (Session 1, "what the matrix cannot say"). The course ranks by cell level, then consequence. */
export const ordinalProduct = (likelihood: number, consequence: number) => likelihood * consequence
const LEVEL_RANK: Record<CellLevel, number> = { High: 3, Moderate: 2, Low: 1 }
/** The course ranking rule: cell level first, then the higher consequence, then the higher likelihood (course convention;
 *  SEBoK prioritizes by level and by the pair of maximum probability and maximum consequence, R17 p.483). */
export function compareRisks(a: { likelihood: number; consequence: number }, b: { likelihood: number; consequence: number }): number {
  return LEVEL_RANK[cellLevel(b.likelihood, b.consequence)] - LEVEL_RANK[cellLevel(a.likelihood, a.consequence)] || b.consequence - a.consequence || b.likelihood - a.likelihood
}
/** Midpoint of a likelihood band, used only when a consequence is measured on a cardinal scale (expected-value check). */
export const bandMid = (level: number) => {
  const b = LIKELIHOOD.find((x) => x.level === level)!
  return (b.lo + b.hi) / 2
}

export type Handling = 'avoid' | 'mitigate' | 'transfer' | 'accept' | 'watch'
export const HANDLING: { id: Handling; label: string; meaning: string }[] = [
  { id: 'avoid', label: 'Avoid', meaning: 'change requirements, constraints or the plan so the risk event cannot occur or no longer matters' },
  { id: 'mitigate', label: 'Control (mitigate)', meaning: 'act to reduce the likelihood, the consequence or both' },
  { id: 'transfer', label: 'Transfer', meaning: 'reassign accountability and consequence to another party willing to accept it' },
  { id: 'accept', label: 'Accept (assume)', meaning: 'a deliberate, approved decision to carry the risk, and monitor it' },
  { id: 'watch', label: 'Watch', meaning: 'monitor the environment for changes in the nature or impact of the risk' },
]
export const handlingLabel = (h: string) => HANDLING.find((x) => x.id === h)?.label ?? h

/** Register entry kinds. Risks and opportunities are uncertain (0 < P < 1); an issue has occurred or is certain (P = 1)
 *  (R39q p.1610; R39r p.1582; R46 p.127). Assumptions and unknowns are course definitions. */
export const ENTRY_KINDS = [
  { id: 'assumption', prefix: 'A', label: 'Assumption', meaning: 'taken as true for planning; must be validated by a named action' },
  { id: 'risk', prefix: 'R', label: 'Risk', meaning: 'a future event with 0 < probability < 1 and a negative consequence' },
  { id: 'opportunity', prefix: 'O', label: 'Opportunity', meaning: 'a possible outcome better than expected' },
  { id: 'unknown', prefix: 'U', label: 'Unknown', meaning: 'information not yet available (the requirement-level form is a TBD or TBR)' },
  { id: 'issue', prefix: 'I', label: 'Issue', meaning: 'has occurred or is certain to occur (probability one); kept in a separate issue log' },
] as const

/** Risk categories the course register uses; security and resilience are named so teams cannot leave them out (A21 item 6). */
export const RISK_CATEGORIES = [
  { id: 'technology', label: 'Technology maturity' },
  { id: 'performance', label: 'Technical performance' },
  { id: 'safety', label: 'Safety' },
  { id: 'security', label: 'Security' },
  { id: 'resilience', label: 'Resilience' },
  { id: 'external', label: 'External, regulatory or supply' },
  { id: 'schedule-cost', label: 'Schedule or cost' },
] as const
export type RiskCategory = (typeof RISK_CATEGORIES)[number]['id']

/** The three fundamental objectives of resilience (SEBoK, R24 p.1204). */
export const RESILIENCE_OBJECTIVES = [
  { id: 'avoid', label: 'Avoid', meaning: 'eliminate or reduce exposure to stress' },
  { id: 'withstand', label: 'Withstand', meaning: 'resist capability degradation when stressed' },
  { id: 'recover', label: 'Recover', meaning: 'replenish lost capability after degradation' },
] as const
/** Common asset classes of system security (SEBoK Table 1, R25 p.1231). */
export const SECURITY_ASSET_CLASSES = ['Material resources and infrastructure', 'System capability', 'Human resources', 'Intellectual property', 'Data and information', 'Derivative non-tangible (image, reputation, trust)'] as const

// ---------------------------------------------------------------------------------------------------- TPM arithmetic
export type Sense = 'lower-is-better' | 'higher-is-better'
/** Worst-case estimate: the current best estimate moved by the contingency toward the threshold (R44 p.117). */
export const worstCase = (sense: Sense, cbe: number, contingency: number) => (sense === 'lower-is-better' ? cbe + contingency : cbe - contingency)
/** Margin: the growth that can be accommodated while staying within the threshold, threshold minus worst case (R44 p.117);
 *  for a higher-is-better measure the sign is reversed so that a positive margin is always good. */
export const margin = (sense: Sense, threshold: number, wce: number) => (sense === 'lower-is-better' ? threshold - wce : wce - threshold)
export const round = (x: number, d = 2) => Math.round(x * 10 ** d) / 10 ** d

// ---------------------------------------------------------------------------------------------------- trade arithmetic
/** Linear single-attribute value: 0 at the walk-away point, 1 at the stretch goal, clamped (R18 pp.465–466). */
export function linearValue(x: number, walkAway: number, stretch: number): number {
  if (walkAway === stretch) return 0
  const t = (x - walkAway) / (stretch - walkAway)
  return Math.max(0, Math.min(1, t))
}
/** Swing points normalized to weights that sum to one (R18 p.466). */
export function normalizeWeights(points: number[]): number[] {
  const s = points.reduce((a, b) => a + b, 0)
  return s > 0 ? points.map((p) => p / s) : points.map(() => 0)
}
/** Additive value v(x) = Σ wᵢ vᵢ(xᵢ) (R18 p.469). */
export const additiveValue = (weights: number[], values: number[]) => weights.reduce((a, w, i) => a + w * (values[i] ?? 0), 0)
/** Weights after setting criterion k to w and rescaling the others in proportion so the set still sums to one. */
export function reweight(weights: number[], k: number, w: number): number[] {
  const rest = 1 - weights[k]
  return weights.map((x, i) => (i === k ? w : rest > 0 ? (x * (1 - w)) / rest : (1 - w) / (weights.length - 1)))
}
const EDGE = 1e-9
/** One-at-a-time weight sensitivity: the first weight of criterion k (scanning from the base weight up, and from the base
 *  down) at which the top-ranked alternative changes. Exact: each alternative's total is linear in w, so crossings are
 *  solved in closed form. Returns null in a direction with no change (two alternatives equal on every other criterion
 *  meet only at the end of the range, w = 0 or 1: a tie there is not a reversal). */
export function reversalPoints(weights: number[], values: number[][], k: number): { up: { w: number; to: number } | null; down: { w: number; to: number } | null; base: number } {
  const totals = (w: number) => values.map((v) => additiveValue(reweight(weights, k, w), v))
  const top = (w: number) => {
    const t = totals(w)
    return t.indexOf(Math.max(...t))
  }
  const base = top(weights[k])
  // total_a(w) = A_a + B_a w, linear; find crossings with the base leader
  const lin = (a: number) => {
    const t0 = additiveValue(reweight(weights, k, 0), values[a])
    const t1 = additiveValue(reweight(weights, k, 1), values[a])
    return { A: t0, B: t1 - t0 }
  }
  const L = lin(base)
  let up: { w: number; to: number } | null = null
  let down: { w: number; to: number } | null = null
  values.forEach((_, a) => {
    if (a === base) return
    const o = lin(a)
    const dB = L.B - o.B
    if (dB === 0) return
    const w = (o.A - L.A) / dB
    // a crossing exactly at w = 0 or w = 1 is a tie at the end of the range, not a change of leader inside it
    if (w > weights[k] && w < 1 - EDGE && (!up || w < up.w)) up = { w, to: a }
    if (w < weights[k] && w > EDGE && (!down || w > down.w)) down = { w, to: a }
  })
  return { up, down, base }
}

// ---------------------------------------------------------------------------------------------------- gates
/** Hard gates: defects any reviewer would reject on sight. The tool does not count an entry that fails one. Advisories
 *  are signs of a likely defect that can also occur in good work; the tool shows them and never blocks on them. */
export const TECH_GATES = [
  { id: 'name', short: 'a name and a description of what the technology does for the enterprise' },
  { id: 'trl', short: 'a TRL from 1 to 9' },
  { id: 'basis', short: 'a basis: cited evidence, or a labeled assumption with an owner and a validation action' },
  { id: 'affects', short: 'at least one requirement or capability it affects that exists in the record' },
  { id: 'maturity-risk', short: 'a linked maturity risk when the technology is critical and below TRL 6' },
] as const
export const RISK_GATES = [
  { id: 'form', short: 'condition, “if” and “then” parts, in that order' },
  { id: 'not-issue', short: 'an uncertain future event, not something that has already happened (that is an issue)' },
  { id: 'no-mitigation', short: 'no mitigation written into the statement' },
  { id: 'ratings', short: 'likelihood and consequence on the 1–5 scales, each with a rationale' },
  { id: 'handling', short: 'a handling option, an owner and a trigger (and a treatment unless accepted or watched)' },
  { id: 'affects', short: 'at least one requirement, capability or scenario it affects that exists in the record' },
] as const
export const TPM_GATES = [
  { id: 'parent', short: 'a measured requirement that exists, and the measure (MOP) it derives from' },
  { id: 'numbers', short: 'threshold, objective, current best estimate and contingency as numbers, with a unit and a sense' },
  { id: 'objective-side', short: 'an objective on the good side of the threshold' },
  { id: 'basis', short: 'a basis for the current estimate' },
  { id: 'profile', short: 'a planned value at two or more future review points' },
  { id: 'breach-risk', short: 'a linked risk (or issue) in the register when the worst case is outside the threshold: a TPM breach is a risk' },
] as const
export const TRADE_GATES = [
  { id: 'decision', short: 'a decision statement that names the objective and traces to a requirement or objective in the record' },
  { id: 'baseline', short: 'the baseline (status quo) among the alternatives' },
  { id: 'distinct', short: 'alternatives that differ in at least one score' },
  { id: 'criteria-trace', short: 'each criterion traced to an MOE (or an objective) in the record' },
  { id: 'anchors', short: 'each criterion with a walk-away point and a stretch goal that differ' },
  { id: 'weights', short: 'swing points for every criterion, each with a rationale' },
  { id: 'scores', short: 'a score for every alternative on every criterion' },
  { id: 'sensitivity', short: 'the reversal point of the most heavily weighted criterion stated' },
  { id: 'recommendation', short: 'a recommendation that passes every screen and lies inside every walk-away point, with conditions, residual risk and what would change it' },
] as const
export const TRADE_ADVISORIES = [
  { id: 'no-cost', short: 'no cost criterion: cost is usually a criterion or a stated constraint' },
  { id: 'dominant-weight', short: 'one criterion carries more than half of the weight' },
  { id: 'double-count', short: 'two criteria trace to the same MOE (possible double counting)' },
  { id: 'resilience', short: 'no resilience or security criterion or screen' },
  { id: 'fragile', short: 'the top rank reverses within ±0.05 of a base weight' },
  { id: 'walk-away', short: 'an alternative scores beyond a walk-away point: record it as failing a screen (it is left out of the ranking and the sensitivity)' },
  { id: 'not-top', short: 'the recommendation is not the top-ranked alternative: give the reason in the conditions' },
  { id: 'reversal-number', short: 'the sensitivity note states no number within ±0.02 of a computed reversal point' },
] as const
export type TechGateId = (typeof TECH_GATES)[number]['id']
export type RiskGateId = (typeof RISK_GATES)[number]['id']
export type TpmGateId = (typeof TPM_GATES)[number]['id']
export type TradeGateId = (typeof TRADE_GATES)[number]['id']
export type TradeAdvisoryId = (typeof TRADE_ADVISORIES)[number]['id']

/** The ID prefixes Week 3 adds to the record, and the lead role that owns each (course convention). */
export const WEEK3_PREFIXES = [
  { prefix: 'TECH', owner: 'AI & Data Management (one technology per member where possible)' },
  { prefix: 'R / O / A / U', owner: 'Verification & Validation leads the risk workshop; Requirements & Compliance keeps the links' },
  { prefix: 'I', owner: 'Project lead (the issue log)' },
  { prefix: 'TPM', owner: 'Verification & Validation' },
  { prefix: 'CRIT / ALT / DEC', owner: 'Architecture (frame and weights); AI & Data Management (scores and computation)' },
] as const

/** The parts the Week 3 work adds to the Team Record (outline §5.5). Part 11 (measures) gains the TPMs. */
export const WEEK3_PARTS = [
  { n: 11, id: 'tpm', title: 'Measures: technical performance measures' },
  { n: 12, id: 'readiness', title: 'Technology readiness assessment' },
  { n: 13, id: 'register', title: 'Risk and uncertainty register' },
  { n: 14, id: 'trade', title: 'Trade study and decision record' },
] as const

/** The framing checkpoint the instructor runs in Session 2 (course convention; R18 p.465). */
export const CHECKPOINT_CRITERIA = ['the baseline (status quo) is one of the alternatives', 'the alternatives are genuinely different, not strawmen', 'the decision traces to a requirement or objective in the record'] as const
