// Week 3 Team Record (pure logic, no React): the team's technology readiness assessment (Part 12), its risk and
// uncertainty register with an issue log (Part 13), the technical performance measures added to the measures (Part 11)
// and the trade study with its decision record (Part 14), plus the AI usage statement. The record EXTENDS the team's
// Week 2 Team Record: it is started from the Week 2 model-inputs JSON (read with Week 2's importWeek2, read-only) and
// keeps a snapshot of the Week 2 items it traces to (requirements, capabilities, scenarios, objectives, MOEs, MOPs and the
// TBD/TBR register).
//
// Single sources: every minimum, scale, gate id and arithmetic rule is read from src/content/lectures/week03/labBrief.ts
// (the TRL wording, the likelihood bands and the cell layout, the handling options, worst case and margin, linear value,
// swing-weight normalization, additive value and the one-at-a-time reversal points), so the lecture, the worked example
// and the tool compute the same numbers.
//
// Patterns mirror src/workbench/week2/record.ts: normalize never throws, IDs are issued by the tool and never reused after
// deletion, checks return { ok, issues, detail, notes }, hard gates (labBrief TECH/RISK/TPM/TRADE gates) block an entry
// from counting, advisories never block, Markdown + JSON export with format/version, import with clear messages.
// record.test.ts tests every gate in both directions. AeroLink is the instructor's worked example: a record about
// AeroLink is refused.
import {
  CHECKPOINT_CRITERIA, ENTRY_KINDS, HANDLING, LAB3_MINIMUMS, LAB3_MINIMUMS_THREE, LIKELIHOOD, CONSEQUENCE, MATURE_TRL, RISK_CATEGORIES, RISK_GATES, TECH_GATES, TPM_GATES, TRADE_ADVISORIES, TRADE_GATES, TRL_SCALE, WEEK3_PARTS,
  additiveValue, cellLevel, linearValue, margin, normalizeWeights, reversalPoints, round, worstCase,
  type CellLevel, type Handling, type Lab3Minimums, type RiskCategory, type RiskGateId, type Sense, type TechGateId, type TpmGateId, type TradeAdvisoryId, type TradeGateId,
} from '../../content/lectures/week03/labBrief'
import { importWeek2, recordState as week2State, type Week2Record } from '../week2/record'
import { isAeroLink, MISSION_ID } from '../week1/team'
import { EMPTY_ANSWER } from '../emptyAnswer'

export const W3_KEY = 'w3.record'
export const MODEL_INPUTS_FORMAT = 'week3-model-inputs'
export const MODEL_INPUTS_VERSION = 1
export const MIN_AI_WORDS = 12
/** Tool conventions for free-text fields (not lab minimums). Gate sweep 2026-10-19 (docs/lectures/GATE_SWEEP_2026-10-19.md):
 *  no free-text gate counts words any more, because short answers can be complete ("If power fails, then food spoils";
 *  "Vendor datasheet"; "Week 6"). A field must be written and must not be an empty answer ("none", "n/a", "later").
 *  MIN_TEXT_WORDS and MIN_PART_WORDS stay exported for compatibility; no gate reads them. */
export const MIN_TEXT_WORDS = 5
export const MIN_PART_WORDS = 3
/** An answer that says nothing: not a reason, a basis, an action or an event. */
export { EMPTY_ANSWER } // shared with Weeks 1, 2, 3 and 5 (src/workbench/emptyAnswer.ts)
const said = (t: string) => t.split(/\s+/).filter(Boolean).length >= 1 && !EMPTY_ANSWER.test(t.trim())
/** How close a reversal point stated in the sensitivity note must be to a computed one (the reversal-number advisory). */
export const REVERSAL_TOLERANCE = 0.02
export { CHECKPOINT_CRITERIA, isAeroLink }

export const minimumsOf = (r: Pick<Week3Record, 'threePersonTeam'>): Lab3Minimums => (r.threePersonTeam ? LAB3_MINIMUMS_THREE : LAB3_MINIMUMS)

// ---------------------------------------------------------------------------------------------- types
export type Week2Snapshot = {
  team: string
  enterprise: string
  soi: string
  /** MGO ids: the mission (MGO-001) and the Week 1 goals. */
  objectives: { id: string; statement: string }[]
  needs: { id: string; name: string }[]
  requirements: { id: string; name: string; statement: string }[]
  capabilities: { id: string; name: string }[]
  scenarios: { id: string; name: string }[]
  moes: { id: string; name: string; unit: string; threshold: string }[]
  mops: { id: string; name: string; unit: string; threshold: string; measures: string[] }[]
  /** The Week 2 TBD/TBR register (U) and assumptions (A), carried into the Week 3 register. */
  unknowns: { id: string; name: string; tbx: string; owner: string; closeBy: string }[]
  assumptions: { id: string; name: string; owner: string; validation: string }[]
  threePersonTeam: boolean
  /** 'ready' or 'not-ready' as the Week 2 tool judged it. */
  week2Status: string
  sourceVersion: number
}
export type BasisKind = '' | 'evidence' | 'assumption'
export type Technology = {
  id: string
  name: string
  /** What the technology does for the enterprise. */
  does: string
  benefits: string
  limitations: string
  trl: number
  basisKind: BasisKind
  /** Evidence: the test report, demonstration or document, cited. */
  evidence: string
  /** Assumption: the A id in the register that carries the TRL claim. */
  assumption: string
  critical: boolean
  criticalWhy: string
  /** Requirement and capability IDs it affects, as typed. */
  affects: string
  /** The R id of its maturity risk. */
  maturityRisk: string
  ai: boolean
}
export type Assumption = { id: string; name: string; text: string; owner: string; validation: string; fromWeek2: boolean }
export type Unknown = { id: string; name: string; tbx: string; owner: string; closeBy: string; affects: string; fromWeek2: boolean }
export type Risk = {
  id: string
  name: string
  category: RiskCategory | ''
  condition: string
  ifEvent: string
  then: string
  likelihood: number
  consequence: number
  likelihoodWhy: string
  consequenceWhy: string
  handling: Handling | ''
  owner: string
  treatment: string
  trigger: string
  affects: string
  ai: boolean
}
export type Opportunity = { id: string; name: string; text: string; owner: string; action: string }
export type Issue = { id: string; name: string; text: string; owner: string; action: string }
export type ProfileRow = { label: string; month: string; cbe: string; contingency: string }
export type Tpm = {
  id: string
  name: string
  measures: string
  derivesFrom: string
  unit: string
  sense: Sense | ''
  threshold: string
  objective: string
  cbe: string
  contingency: string
  basis: string
  relatedRisk: string
  profile: ProfileRow[]
}
export type Alternative = { id: string; name: string; description: string; baseline: boolean }
export type Criterion = { id: string; name: string; moe: string; unit: string; walkAway: string; stretch: string; swingPoints: string; rationale: string }
export type Screen = { id: string; name: string; test: string; results: Record<string, '' | 'pass' | 'fail'> }
export type Trade = {
  decision: string
  /** The requirement or objective IDs the decision traces to, as typed. */
  trace: string
  alternatives: Alternative[]
  criteria: Criterion[]
  /** scores[altId][critId], as typed. */
  scores: Record<string, Record<string, string>>
  screens: Screen[]
  sensitivityNote: string
  recommended: string
  /** One per line. */
  conditions: string
  residualRisk: string
  wouldChangeIf: string
  /** Derived requirements the decision creates, one per line (optional). */
  derived: string
}
export type Issued = { TECH: number; A: number; U: number; R: number; O: number; I: number; TPM: number; ALT: number; CRIT: number; SCREEN: number }
export type IdPrefix = keyof Issued
export type Week3Record = {
  week2: Week2Snapshot | null
  threePersonTeam: boolean
  technologies: Technology[]
  assumptions: Assumption[]
  unknowns: Unknown[]
  risks: Risk[]
  opportunities: Opportunity[]
  issues: Issue[]
  tpms: Tpm[]
  trade: Trade
  aiStatement: string
  issued: Issued
  updatedAt?: number
  exportedMdAt?: number
  exportedJsonAt?: number
}

export const EMPTY_TRADE: Trade = { decision: '', trace: '', alternatives: [], criteria: [], scores: {}, screens: [], sensitivityNote: '', recommended: '', conditions: '', residualRisk: '', wouldChangeIf: '', derived: '' }
export const EMPTY_ISSUED: Issued = { TECH: 0, A: 0, U: 0, R: 0, O: 0, I: 0, TPM: 0, ALT: 0, CRIT: 0, SCREEN: 0 }
export const EMPTY_RECORD: Week3Record = { week2: null, threePersonTeam: false, technologies: [], assumptions: [], unknowns: [], risks: [], opportunities: [], issues: [], tpms: [], trade: EMPTY_TRADE, aiStatement: '', issued: EMPTY_ISSUED }
export const EMPTY_TECHNOLOGY = (id: string): Technology => ({ id, name: '', does: '', benefits: '', limitations: '', trl: 0, basisKind: '', evidence: '', assumption: '', critical: false, criticalWhy: '', affects: '', maturityRisk: '', ai: false })
export const EMPTY_ASSUMPTION = (id: string): Assumption => ({ id, name: '', text: '', owner: '', validation: '', fromWeek2: false })
export const EMPTY_UNKNOWN = (id: string): Unknown => ({ id, name: '', tbx: '', owner: '', closeBy: '', affects: '', fromWeek2: false })
export const EMPTY_RISK = (id: string): Risk => ({ id, name: '', category: '', condition: '', ifEvent: '', then: '', likelihood: 0, consequence: 0, likelihoodWhy: '', consequenceWhy: '', handling: '', owner: '', treatment: '', trigger: '', affects: '', ai: false })
export const EMPTY_OPPORTUNITY = (id: string): Opportunity => ({ id, name: '', text: '', owner: '', action: '' })
export const EMPTY_ISSUE = (id: string): Issue => ({ id, name: '', text: '', owner: '', action: '' })
export const EMPTY_PROFILE_ROW: ProfileRow = { label: '', month: '', cbe: '', contingency: '' }
export const EMPTY_TPM = (id: string): Tpm => ({ id, name: '', measures: '', derivesFrom: '', unit: '', sense: '', threshold: '', objective: '', cbe: '', contingency: '', basis: '', relatedRisk: '', profile: [] })
export const EMPTY_ALTERNATIVE = (id: string, baseline = false): Alternative => ({ id, name: '', description: '', baseline })
export const EMPTY_CRITERION = (id: string): Criterion => ({ id, name: '', moe: '', unit: '', walkAway: '', stretch: '', swingPoints: '', rationale: '' })
export const EMPTY_SCREEN = (id: string): Screen => ({ id, name: '', test: '', results: {} })

// ---------------------------------------------------------------------------------------------- helpers
const pad = (n: number, w = 3) => String(n).padStart(w, '0')
const num = (id: string) => Number(id.split('-').pop()) || 0
const str = (x: unknown) => (typeof x === 'string' ? x : x === undefined || x === null ? '' : String(x))
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const objs = (x: unknown): Record<string, unknown>[] => (Array.isArray(x) ? x.filter(isObj) : [])
const oneOf = <T extends string>(x: unknown, allowed: readonly T[]): T | '' => (allowed.includes(x as T) ? (x as T) : '')
const int = (x: unknown) => (typeof x === 'number' && Number.isInteger(x) && x > 0 ? x : typeof x === 'string' && /^\d+$/.test(x.trim()) ? Number(x) : 0)
const scale = (x: unknown, hi: number) => {
  const n = int(x)
  return n >= 1 && n <= hi ? n : 0
}
const numText = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) ? String(x) : str(x))
export const words = (s: string) => s.split(/\s+/).filter(Boolean).length
export const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)
export const duplicates = (ids: string[]) => [...new Set(ids.filter((x, i) => x && ids.indexOf(x) !== i))]
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
/** A number typed into a field ("18", "63.5", "-2", "1,000"), or null when it is not one. */
export function parseNum(s: string): number | null {
  const t = s.replace(/,/g, '').trim()
  if (!/^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(t)) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

export const HANDLING_IDS = HANDLING.map((h) => h.id) as Handling[]
export const CATEGORY_IDS = RISK_CATEGORIES.map((c) => c.id) as RiskCategory[]
export const categoryLabel = (c: string) => RISK_CATEGORIES.find((x) => x.id === c)?.label ?? '(category not chosen)'
export const handlingLabelOf = (h: string) => HANDLING.find((x) => x.id === h)?.label ?? '(handling not chosen)'
export const trlWording = (n: number) => TRL_SCALE.find((t) => t.level === n)?.text ?? ''
export const likelihoodLabel = (n: number) => LIKELIHOOD.find((x) => x.level === n)
export const consequenceLabel = (n: number) => CONSEQUENCE.find((x) => x.level === n)
export const partTitle = (id: (typeof WEEK3_PARTS)[number]['id']) => WEEK3_PARTS.find((p) => p.id === id)!.title
export const partNumber = (id: (typeof WEEK3_PARTS)[number]['id']) => WEEK3_PARTS.find((p) => p.id === id)!.n

/** The ID forms this record uses or links to. */
export const ID_FORMS: Record<string, RegExp> = {
  TECH: /^TECH-\d{3}$/, A: /^A-\d{3}$/, U: /^U-\d{3}$/, R: /^R-\d{3}$/, O: /^O-\d{3}$/, I: /^I-\d{3}$/, TPM: /^TPM-\d{3}$/, ALT: /^ALT-\d{3}$/, CRIT: /^CRIT-\d{3}$/, SCREEN: /^SCREEN-\d{1,3}$/,
}
const ANY_ID = /\b(?:REQ-(?:STK|SYS)|NEED|MGO|SCN|CAP|MOE|MOP|TECH|TPM|ALT|CRIT|U|A|R|O|I)-\d{3}\b/g
/** The IDs written in a free-text link field, upper-cased, each once. */
export const idsIn = (s: string) => [...new Set(s.toUpperCase().match(ANY_ID) ?? [])]
/** Tokens in a link field that are not IDs of the course scheme, so a typo is never silently dropped. */
export const badTokensIn = (s: string) =>
  s
    .split(/[,;\s]+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((x) => !new RegExp(`^${ANY_ID.source}$`).test(x.toUpperCase()))

// ---------------------------------------------------------------------------------------------- normalize
function normalizeSnapshot(v: unknown): Week2Snapshot | null {
  if (!isObj(v)) return null
  const pair = (x: Record<string, unknown>) => ({ id: str(x.id).trim().toUpperCase(), name: str(x.name) })
  return {
    team: str(v.team),
    enterprise: str(v.enterprise),
    soi: str(v.soi),
    objectives: objs(v.objectives).map((x) => ({ id: str(x.id).trim().toUpperCase(), statement: str(x.statement) })),
    needs: objs(v.needs).map(pair),
    requirements: objs(v.requirements).map((x) => ({ ...pair(x), statement: str(x.statement) })),
    capabilities: objs(v.capabilities).map(pair),
    scenarios: objs(v.scenarios).map(pair),
    moes: objs(v.moes).map((x) => ({ ...pair(x), unit: str(x.unit), threshold: str(x.threshold) })),
    mops: objs(v.mops).map((x) => ({ ...pair(x), unit: str(x.unit), threshold: str(x.threshold), measures: (Array.isArray(x.measures) ? x.measures : []).map((y) => str(y).trim().toUpperCase()).filter(Boolean) })),
    unknowns: objs(v.unknowns).map((x) => ({ ...pair(x), tbx: str(x.tbx).trim().toUpperCase(), owner: str(x.owner), closeBy: str(x.closeBy) })),
    assumptions: objs(v.assumptions).map((x) => ({ ...pair(x), owner: str(x.owner), validation: str(x.validation) })),
    threePersonTeam: v.threePersonTeam === true,
    week2Status: str(v.week2Status),
    sourceVersion: int(v.sourceVersion),
  }
}
const linkText = (x: unknown) => (Array.isArray(x) ? x.map(str).join(', ') : str(x))
const upId = (x: unknown) => str(x).trim().toUpperCase()

/** Fills missing fields of a stored or imported record. Never throws. */
export function normalizeRecord(v: unknown): Week3Record {
  const r = isObj(v) ? v : {}
  const t = isObj(r.trade) ? r.trade : {}
  const week2 = normalizeSnapshot(r.week2)
  const scores: Record<string, Record<string, string>> = {}
  if (isObj(t.scores)) for (const [a, row] of Object.entries(t.scores)) if (isObj(row)) scores[a.trim().toUpperCase()] = Object.fromEntries(Object.entries(row).map(([c, x]) => [c.trim().toUpperCase(), numText(x)]))
  const rec: Week3Record = {
    week2,
    threePersonTeam: typeof r.threePersonTeam === 'boolean' ? r.threePersonTeam : (week2?.threePersonTeam ?? false),
    technologies: objs(r.technologies).map((x) => ({
      ...EMPTY_TECHNOLOGY(upId(x.id)),
      name: str(x.name), does: str(x.does), benefits: str(x.benefits), limitations: str(x.limitations),
      trl: scale(x.trl, 9), basisKind: oneOf(x.basisKind, ['evidence', 'assumption'] as const), evidence: str(x.evidence), assumption: upId(x.assumption),
      critical: x.critical === true, criticalWhy: str(x.criticalWhy), affects: linkText(x.affects), maturityRisk: upId(x.maturityRisk), ai: x.ai === true,
    })),
    assumptions: objs(r.assumptions).map((x) => ({ id: upId(x.id), name: str(x.name), text: str(x.text), owner: str(x.owner), validation: str(x.validation), fromWeek2: x.fromWeek2 === true })),
    unknowns: objs(r.unknowns).map((x) => ({ id: upId(x.id), name: str(x.name), tbx: upId(x.tbx), owner: str(x.owner), closeBy: str(x.closeBy), affects: linkText(x.affects), fromWeek2: x.fromWeek2 === true })),
    risks: objs(r.risks).map((x) => ({
      ...EMPTY_RISK(upId(x.id)),
      name: str(x.name), category: oneOf(x.category, CATEGORY_IDS), condition: str(x.condition), ifEvent: str(x.ifEvent), then: str(x.then),
      likelihood: scale(x.likelihood, 5), consequence: scale(x.consequence, 5), likelihoodWhy: str(x.likelihoodWhy), consequenceWhy: str(x.consequenceWhy),
      handling: oneOf(x.handling, HANDLING_IDS), owner: str(x.owner), treatment: str(x.treatment), trigger: str(x.trigger), affects: linkText(x.affects), ai: x.ai === true,
    })),
    opportunities: objs(r.opportunities).map((x) => ({ id: upId(x.id), name: str(x.name), text: str(x.text), owner: str(x.owner), action: str(x.action) })),
    issues: objs(r.issues).map((x) => ({ id: upId(x.id), name: str(x.name), text: str(x.text), owner: str(x.owner), action: str(x.action) })),
    tpms: objs(r.tpms).map((x) => ({
      ...EMPTY_TPM(upId(x.id)),
      name: str(x.name), measures: upId(x.measures), derivesFrom: upId(x.derivesFrom), unit: str(x.unit), sense: oneOf(x.sense, ['lower-is-better', 'higher-is-better'] as const),
      threshold: numText(x.threshold), objective: numText(x.objective), cbe: numText(x.cbe), contingency: numText(x.contingency), basis: str(x.basis), relatedRisk: upId(x.relatedRisk),
      profile: objs(x.profile).map((p) => ({ label: str(p.label), month: numText(p.month), cbe: numText(p.cbe), contingency: numText(p.contingency) })),
    })),
    trade: {
      decision: str(t.decision),
      trace: linkText(t.trace),
      alternatives: objs(t.alternatives).map((x) => ({ id: upId(x.id), name: str(x.name), description: str(x.description), baseline: x.baseline === true })),
      criteria: objs(t.criteria).map((x) => ({ id: upId(x.id), name: str(x.name), moe: upId(x.moe), unit: str(x.unit), walkAway: numText(x.walkAway), stretch: numText(x.stretch), swingPoints: numText(x.swingPoints), rationale: str(x.rationale) })),
      scores,
      screens: objs(t.screens).map((x) => ({ id: upId(x.id), name: str(x.name), test: str(x.test), results: Object.fromEntries(Object.entries(isObj(x.results) ? x.results : {}).map(([k, y]) => [k.trim().toUpperCase(), oneOf(y, ['pass', 'fail'] as const)])) })),
      sensitivityNote: str(t.sensitivityNote),
      recommended: upId(t.recommended),
      conditions: Array.isArray(t.conditions) ? t.conditions.map(str).join('\n') : str(t.conditions),
      residualRisk: Array.isArray(t.residualRisk) ? t.residualRisk.map(str).join('\n') : str(t.residualRisk),
      wouldChangeIf: Array.isArray(t.wouldChangeIf) ? t.wouldChangeIf.map(str).join('\n') : str(t.wouldChangeIf),
      derived: Array.isArray(t.derived) ? t.derived.map(str).join('\n') : str(t.derived),
    },
    aiStatement: str(r.aiStatement),
    issued: { ...EMPTY_ISSUED },
    updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : undefined,
    exportedMdAt: typeof r.exportedMdAt === 'number' ? r.exportedMdAt : undefined,
    exportedJsonAt: typeof r.exportedJsonAt === 'number' ? r.exportedJsonAt : undefined,
  }
  const issuedIn = isObj(r.issued) ? r.issued : {}
  for (const k of Object.keys(EMPTY_ISSUED) as IdPrefix[]) rec.issued[k] = Math.max(Number(issuedIn[k]) || 0, 0, ...idsOf(rec, k).map(num))
  return rec
}

/** Every ID of one prefix present in the record (the Week 2 register included, so a new entry never collides). */
export function idsOf(r: Week3Record, prefix: IdPrefix): string[] {
  switch (prefix) {
    case 'TECH': return r.technologies.map((x) => x.id)
    case 'A': return [...r.assumptions.map((x) => x.id), ...(r.week2?.assumptions ?? []).map((x) => x.id)]
    case 'U': return [...r.unknowns.map((x) => x.id), ...(r.week2?.unknowns ?? []).map((x) => x.id)]
    case 'R': return r.risks.map((x) => x.id)
    case 'O': return r.opportunities.map((x) => x.id)
    case 'I': return r.issues.map((x) => x.id)
    case 'TPM': return r.tpms.map((x) => x.id)
    case 'ALT': return r.trade.alternatives.map((x) => x.id)
    case 'CRIT': return r.trade.criteria.map((x) => x.id)
    case 'SCREEN': return r.trade.screens.map((x) => x.id)
  }
}
/** The next ID for a prefix: one past the highest ever issued or present, so a deleted ID is never reused. */
export function nextId(r: Week3Record, prefix: IdPrefix): string {
  const n = Math.max(r.issued[prefix], 0, ...idsOf(r, prefix).map(num)) + 1
  return `${prefix}-${pad(n)}`
}
export const withIssued = (r: Week3Record, prefix: IdPrefix, id: string): Issued => ({ ...r.issued, [prefix]: Math.max(r.issued[prefix], num(id)) })

// ---------------------------------------------------------------------------------------------- Week 2 import
/** The Week 2 snapshot kept in the Week 3 record, from a Week 2 record. */
export function snapshotOf(w: Week2Record, sourceVersion: number): Week2Snapshot {
  const w1 = w.week1
  return {
    team: (w1?.team ?? '').trim(),
    enterprise: (w1?.enterprise ?? '').trim(),
    soi: (w1?.soi ?? '').trim(),
    objectives: [{ id: MISSION_ID, statement: (w1?.mission ?? '').trim() }, ...(w1?.goals ?? [])],
    needs: [...(w1?.needs ?? []), ...w.needsAdded].map((n) => ({ id: n.id, name: n.name.trim() })),
    requirements: w.requirements.map((q) => ({ id: q.id, name: q.name.trim(), statement: q.statement.trim() })),
    capabilities: w.capabilities.map((c) => ({ id: c.id, name: c.name.trim() })),
    scenarios: w.scenarios.map((s) => ({ id: s.id, name: s.name.trim() })),
    moes: w.moes.map((m) => ({ id: m.id, name: m.name.trim(), unit: m.unit.trim(), threshold: m.threshold.trim() })),
    mops: w.mops.map((m) => ({ id: m.id, name: m.name.trim(), unit: m.unit.trim(), threshold: m.threshold.trim(), measures: idsIn(m.measures) })),
    unknowns: w.uncertainties.filter((u) => u.id.startsWith('U-')).map((u) => ({ id: u.id, name: u.name.trim(), tbx: u.tbx, owner: u.owner.trim(), closeBy: u.closeBy.trim() })),
    assumptions: w.uncertainties.filter((u) => u.id.startsWith('A-')).map((u) => ({ id: u.id, name: u.name.trim(), owner: u.owner.trim(), validation: u.validation.trim() })),
    threePersonTeam: w.threePersonTeam,
    week2Status: week2State(w),
    sourceVersion,
  }
}

/** Reads the team's Week 2 model-inputs JSON with Week 2's own importer and returns the snapshot, or a message the
 *  student can act on. A record about AeroLink, a Week 1 file and a Week 3 file are refused. Never throws. */
export function importWeek2File(text: string): { snapshot: Week2Snapshot } | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON.' }
  }
  if (isObj(d) && d.format === 'week1-model-inputs') return { error: 'This is a Week 1 model-inputs file. The Week 3 record starts from your team’s Week 2 export (team-NN-week2-model-inputs.json).' }
  if (isObj(d) && d.format === MODEL_INPUTS_FORMAT) return { error: 'This is a Week 3 model-inputs file: use “Import a teammate’s Week 3 model-inputs file” at the top of the tool.' }
  const w = importWeek2(text)
  if ('error' in w) return { error: w.error }
  if (!w.week1) return { error: 'This Week 2 record carries no Week 1 snapshot (enterprise and needs): export it again from the Week 2 lab tool after importing the Week 1 record.' }
  if ([w.week1.enterprise, w.week1.soi].some(isAeroLink)) return { error: 'This Week 2 record names AeroLink, the instructor’s worked example. Import your team’s own record.' }
  if (!w.requirements.length) return { error: 'This Week 2 record has no requirements: the Week 3 work traces to them, so export the record again once Part 10 is filled in.' }
  return { snapshot: snapshotOf(w, int(isObj(d) ? d.version : 0)) }
}

/** Puts a Week 2 snapshot into the record, keeping the Week 3 work, and carries every Week 2 unknown and assumption into
 *  the register that is not there yet (TBD/TBR tokens kept). */
export function withWeek2(r: Week3Record, snapshot: Week2Snapshot): Week3Record {
  const haveU = new Set(r.unknowns.map((u) => u.id))
  const haveA = new Set(r.assumptions.map((a) => a.id))
  const next: Week3Record = {
    ...r,
    week2: snapshot,
    threePersonTeam: snapshot.threePersonTeam,
    unknowns: [...r.unknowns, ...snapshot.unknowns.filter((u) => !haveU.has(u.id)).map((u) => ({ ...EMPTY_UNKNOWN(u.id), name: u.name, tbx: u.tbx, owner: u.owner, closeBy: u.closeBy, fromWeek2: true }))],
    assumptions: [...r.assumptions, ...snapshot.assumptions.filter((a) => !haveA.has(a.id)).map((a) => ({ ...EMPTY_ASSUMPTION(a.id), name: a.name, owner: a.owner, validation: a.validation, fromWeek2: true }))],
  }
  return { ...next, issued: { ...next.issued, A: Math.max(next.issued.A, ...idsOf(next, 'A').map(num)), U: Math.max(next.issued.U, ...idsOf(next, 'U').map(num)) } }
}

// ---------------------------------------------------------------------------------------------- lookups
const snapIds = (r: Week3Record) => {
  const w = r.week2
  return {
    req: new Set((w?.requirements ?? []).map((x) => x.id)),
    cap: new Set((w?.capabilities ?? []).map((x) => x.id)),
    scn: new Set((w?.scenarios ?? []).map((x) => x.id)),
    moe: new Set((w?.moes ?? []).map((x) => x.id)),
    mop: new Set((w?.mops ?? []).map((x) => x.id)),
    mgo: new Set((w?.objectives ?? []).map((x) => x.id)),
  }
}
/** Every ID an entry may link to: the Week 2 items and the Week 3 entries. */
export function knownIds(r: Week3Record): Set<string> {
  const s = snapIds(r)
  return new Set<string>([
    ...s.req, ...s.cap, ...s.scn, ...s.moe, ...s.mop, ...s.mgo, ...(r.week2?.needs ?? []).map((n) => n.id),
    ...r.technologies.map((x) => x.id), ...r.assumptions.map((x) => x.id), ...r.unknowns.map((x) => x.id), ...r.risks.map((x) => x.id),
    ...r.opportunities.map((x) => x.id), ...r.issues.map((x) => x.id), ...r.tpms.map((x) => x.id),
  ])
}

export type Gate<T extends string = string> = { id: T; ok: boolean; message: string }
export type Advisory<T extends string = string> = { id: T; message: string }
export type Assessment<G extends string, A extends string> = { gates: Gate<G>[]; advisories: Advisory<A>[]; counts: boolean }
const collector = <G extends string, A extends string>() => {
  const gates: Gate<G>[] = []
  const advisories: Advisory<A>[] = []
  return {
    gates,
    advisories,
    gate: (id: G, ok: boolean, message: string) => gates.push({ id, ok, message }),
    adv: (id: A, message: string) => advisories.push({ id, message }),
    done: (): Assessment<G, A> => ({ gates, advisories, counts: gates.every((g) => g.ok) }),
  }
}
export const TECH_GATE_SHORT = Object.fromEntries(TECH_GATES.map((g) => [g.id, g.short])) as Record<TechGateId, string>
export const RISK_GATE_SHORT = Object.fromEntries(RISK_GATES.map((g) => [g.id, g.short])) as Record<RiskGateId, string>
export const TPM_GATE_SHORT = Object.fromEntries(TPM_GATES.map((g) => [g.id, g.short])) as Record<TpmGateId, string>
export const TRADE_GATE_SHORT = Object.fromEntries(TRADE_GATES.map((g) => [g.id, g.short])) as Record<TradeGateId, string>
export const TRADE_ADVISORY_SHORT = Object.fromEntries(TRADE_ADVISORIES.map((g) => [g.id, g.short])) as Record<TradeAdvisoryId, string>

// ---------------------------------------------------------------------------------------------- technology gates
/** Advisories on a readiness entry (tool conventions; they never block). */
export const TECH_ADVISORIES = [
  { id: 'assumed-high', short: 'a TRL of 7 or more resting on an assumption: operational-environment claims usually need evidence' },
  { id: 'no-limitations', short: 'no limitation recorded: every technology has one' },
  { id: 'critical-why', short: 'critical, but the reason is not stated' },
] as const
export type TechAdvisoryId = (typeof TECH_ADVISORIES)[number]['id']
export const TECH_ADVISORY_SHORT = Object.fromEntries(TECH_ADVISORIES.map((g) => [g.id, g.short])) as Record<TechAdvisoryId, string>

export function assessTechnology(t: Technology, r: Week3Record): Assessment<TechGateId, TechAdvisoryId> {
  const c = collector<TechGateId, TechAdvisoryId>()
  const s = snapIds(r)
  const named = words(t.name) >= 1 && said(t.does)
  c.gate('name', named, named ? 'Named and described.' : `Name the technology and say what it does for the enterprise.`)
  c.gate('trl', t.trl >= 1 && t.trl <= 9, t.trl ? `TRL ${t.trl}: ${trlWording(t.trl)}` : 'Choose a TRL from 1 to 9 against the scale wording.')
  if (t.basisKind === 'evidence') {
    const ok = said(t.evidence)
    c.gate('basis', ok, ok ? 'Basis: cited evidence.' : 'Cite the evidence: the report, test or demonstration and where it can be found.')
  } else if (t.basisKind === 'assumption') {
    const a = r.assumptions.find((x) => x.id === t.assumption)
    const ok = !!a && a.owner.trim().length >= 2 && said(a.validation)
    c.gate('basis', ok, ok ? `Basis: assumption ${a!.id}, owned and with a validation action.` : !t.assumption ? 'Name the assumption (A ID) that carries the TRL claim.' : !a ? `${t.assumption} is not an assumption in the register.` : `${a.id} needs an owner and a validation action in the register.`)
  } else c.gate('basis', false, 'Choose the basis of the TRL: cited evidence, or a labeled assumption.')
  const links = idsIn(t.affects)
  const valid = links.filter((x) => s.req.has(x) || s.cap.has(x))
  const strange = links.filter((x) => !(s.req.has(x) || s.cap.has(x)))
  const bad = badTokensIn(t.affects)
  const affectsOk = valid.length > 0 && !strange.length && !bad.length
  c.gate('affects', affectsOk, affectsOk ? `Affects ${valid.join(', ')}.` : !links.length && !bad.length ? 'Name at least one requirement or capability it affects (REQ or CAP IDs from your Week 2 record).' : [strange.length ? `${strange.join(', ')} ${strange.length > 1 ? 'are not requirements or capabilities' : 'is not a requirement or capability'} in the Week 2 record` : '', bad.length ? `${bad.map((x) => `“${x}”`).join(', ')} ${bad.length > 1 ? 'are not IDs' : 'is not an ID'}` : ''].filter(Boolean).join('; ') + '.')
  const needsRisk = t.critical && t.trl >= 1 && t.trl < MATURE_TRL
  const riskOk = !needsRisk || r.risks.some((k) => k.id === t.maturityRisk)
  c.gate('maturity-risk', riskOk, !needsRisk ? (t.critical ? `Critical at TRL ${t.trl}: no maturity risk required.` : 'Not critical: no maturity risk required.') : riskOk ? `Maturity risk ${t.maturityRisk}.` : `Critical and below TRL ${MATURE_TRL}: link the maturity risk (an R ID in the register).`)
  if (t.trl >= 7 && t.basisKind === 'assumption') c.adv('assumed-high', `TRL ${t.trl} claims an operational environment; an assumption that strong usually needs evidence before a decision rests on it.`)
  if (words(t.limitations) < 1) c.adv('no-limitations', 'Record at least one limitation: what the technology cannot do, costs or risks.')
  if (t.critical && !said(t.criticalWhy)) c.adv('critical-why', 'Say why it is critical: which requirement or capability fails without it.')
  return c.done()
}

// ---------------------------------------------------------------------------------------------- risk gates
/** A mitigation written into the statement (MITRE: do not include the mitigation in the risk statement, R61a p.633). */
const MITIGATION_IN_STATEMENT = /\b(we will|will be mitigated|mitigat(e|ion) (by|is)|to mitigate|the treatment is|so we (will|must|should))\b/i
const TREATMENT_VERB = '(install|add|fit|use|buy|procure|provide|implement|deploy|fund|hire|train|test|monitor|inspect|maintain|apply|introduce)'
/** The uncertain event is the absence of a treatment ("if we do not install …"): a mitigation in disguise. */
const MISSING_TREATMENT_AS_EVENT = new RegExp(`\\b(do not|does not|don[’']t|doesn[’']t|fail(s|ed)? to|neglects? to|never)\\s+(\\w+\\s+){0,2}?${TREATMENT_VERB}\\b|\\bwithout\\s+(\\w+ing)\\b|\\bunless\\s+(we|the team)\\b`, 'i')
/** Past-time or completed-event language in the "if" or "then": the event has happened, an issue (P = 1, R46 p.127).
 *  The condition may legitimately state past facts (it is what is known today, R61a p.630). */
const PAST_TIME = /\b(last (week|month|year|night|time)|yesterday|ago|this morning|earlier this (week|month)|already)\b/i
const PAST_EVENT_IN_IF = /\b(did|happened|occurred|has (failed|happened|occurred)|overheated|failed|tripped|broke|caught fire|exceeded)\b/i
const PAST_IN_THEN = /\b(has been|have been|had been)\b/i
const VAGUE_EVENT = /\b(anything|something|whatever|stuff|(things?|it) goes? wrong|(problems?|issues?) (arise|occur|happen)s?)\b/i
/** A consequence that names nothing harmed (domain-neutral: only generic phrases count as vague). */
const VAGUE_CONSEQUENCE = /^\s*(the )?(project|program|team|it|things?) (will )?(fail|fails|suffer|suffers|is (affected|impacted|delayed)|goes? badly)\b|\b(bad things happen|negative (impact|effects?|consequences?)( occurs?)?)\s*\.?\s*$/i

export const RISK_ADVISORIES = [
  { id: 'vague-event', short: 'the “if” names no specific event that could be given a probability' },
  { id: 'vague-consequence', short: 'the “then” does not say what is harmed' },
  { id: 'no-category', short: 'no category: security and resilience risks are counted by category' },
  { id: 'accept-high', short: 'a High-level risk accepted or watched: accepting it needs approval and a reason' },
  { id: 'transfer', short: 'transfer changes who pays, not what the users experience: record the residual consequence' },
] as const
export type RiskAdvisoryId = (typeof RISK_ADVISORIES)[number]['id']
export const RISK_ADVISORY_SHORT = Object.fromEntries(RISK_ADVISORIES.map((g) => [g.id, g.short])) as Record<RiskAdvisoryId, string>

/** The statement assembled in the course form. */
export const riskStatement = (k: Pick<Risk, 'condition' | 'ifEvent' | 'then'>) => `Condition: ${k.condition.trim().replace(/\.$/, '')}. If ${k.ifEvent.trim().replace(/^if\s+/i, '').replace(/[,.]$/, '')}, then ${k.then.trim().replace(/^then\s+/i, '').replace(/\.$/, '')}.`
export const riskLevel = (k: Pick<Risk, 'likelihood' | 'consequence'>): CellLevel | '' => (k.likelihood && k.consequence ? cellLevel(k.likelihood, k.consequence) : '')

export function assessRisk(k: Risk, r: Week3Record): Assessment<RiskGateId, RiskAdvisoryId> {
  const c = collector<RiskGateId, RiskAdvisoryId>()
  const miss = [said(k.condition) ? '' : 'the condition (what is known today)', said(k.ifEvent) ? '' : 'the “if” (the uncertain event)', said(k.then) ? '' : 'the “then” (the consequences)'].filter(Boolean)
  c.gate('form', !miss.length, miss.length ? `Write ${miss.join(', ')}.` : 'Condition, if and then recorded.')
  const happened = PAST_TIME.test(`${k.ifEvent} ${k.then}`) || PAST_EVENT_IN_IF.test(k.ifEvent) || PAST_IN_THEN.test(k.then)
  c.gate('not-issue', !happened, happened ? 'The “if” or “then” describes something that has already happened: that is an issue (probability one), recorded in the issue log, not a risk. A past fact belongs in the condition.' : 'A future, uncertain event.')
  const mitigated = MITIGATION_IN_STATEMENT.test(`${k.condition} ${k.ifEvent} ${k.then}`) || MISSING_TREATMENT_AS_EVENT.test(k.ifEvent)
  c.gate('no-mitigation', !mitigated, mitigated ? 'The statement contains a treatment (“we will …”, or an “if” that is the absence of a treatment). State the uncertain event; put the treatment under treatment.' : 'No mitigation in the statement.')
  const rated = k.likelihood >= 1 && k.consequence >= 1 && said(k.likelihoodWhy) && said(k.consequenceWhy)
  c.gate('ratings', rated, rated ? `L${k.likelihood} × C${k.consequence}: ${riskLevel(k)}.` : [k.likelihood ? '' : 'a likelihood (1–5)', k.consequence ? '' : 'a consequence (1–5)', said(k.likelihoodWhy) ? '' : 'the reason for the likelihood', said(k.consequenceWhy) ? '' : 'the reason for the consequence'].filter(Boolean).join(', ').replace(/^./, (x) => x.toUpperCase()) + '.')
  const noTreatmentNeeded = k.handling === 'accept' || k.handling === 'watch'
  const handled = !!k.handling && k.owner.trim().length >= 2 && said(k.trigger) && (noTreatmentNeeded || said(k.treatment))
  c.gate('handling', handled, handled ? `${handlingLabelOf(k.handling)}; owner ${k.owner.trim()}.` : [k.handling ? '' : 'a handling option', k.owner.trim().length >= 2 ? '' : 'an owner', said(k.trigger) ? '' : 'a trigger or watch item', noTreatmentNeeded || said(k.treatment) ? '' : 'the treatment'].filter(Boolean).join(', ').replace(/^./, (x) => x.toUpperCase()) + '.')
  const s = snapIds(r)
  const ownIds = new Set([...r.technologies.map((x) => x.id), ...r.tpms.map((x) => x.id)])
  const links = idsIn(k.affects)
  const ok = (x: string) => s.req.has(x) || s.cap.has(x) || s.scn.has(x) || ownIds.has(x)
  const strange = links.filter((x) => !ok(x))
  const bad = badTokensIn(k.affects)
  const affectsOk = links.some(ok) && !strange.length && !bad.length
  c.gate('affects', affectsOk, affectsOk ? `Affects ${links.join(', ')}.` : !links.length && !bad.length ? 'Name at least one requirement, capability or scenario it threatens (REQ, CAP or SCN IDs; TECH or TPM IDs also count).' : [strange.length ? `${strange.join(', ')} ${strange.length > 1 ? 'are' : 'is'} not in the record` : '', bad.length ? `${bad.map((x) => `“${x}”`).join(', ')} ${bad.length > 1 ? 'are not IDs' : 'is not an ID'}` : ''].filter(Boolean).join('; ') + '.')
  if (said(k.ifEvent) && VAGUE_EVENT.test(k.ifEvent)) c.adv('vague-event', 'The “if” names no specific event (“something goes wrong”): state one uncertain event that can be given a probability.')
  if (said(k.then) && VAGUE_CONSEQUENCE.test(k.then) && !idsIn(k.then).length) c.adv('vague-consequence', 'The “then” does not say what is harmed: name the requirement, the service, the asset or the people affected.')
  if (!k.category) c.adv('no-category', 'Choose a category; the register counts security and resilience risks by category.')
  if (riskLevel(k) === 'High' && noTreatmentNeeded) c.adv('accept-high', 'A High-level risk is accepted or watched: record who approved it and why the other options were rejected.')
  if (k.handling === 'transfer') c.adv('transfer', 'Transfer moves accountability and cost; the users still experience the event. State the residual consequence and any contingent plan.')
  return c.done()
}

// ---------------------------------------------------------------------------------------------- TPM gates
export const TPM_ADVISORIES = [
  { id: 'breach', short: 'the worst case is outside the threshold and a risk is linked: check the risk is rated for the breach' },
  { id: 'zero-contingency', short: 'zero contingency on an estimate: margin is then threshold minus the current estimate' },
  { id: 'contingency-grows', short: 'the planned contingency grows at a later review: it normally falls as the design matures' },
  { id: 'no-risk', short: 'no related risk: a TPM normally tracks a risky requirement' },
] as const
export type TpmAdvisoryId = (typeof TPM_ADVISORIES)[number]['id']
export const TPM_ADVISORY_SHORT = Object.fromEntries(TPM_ADVISORIES.map((g) => [g.id, g.short])) as Record<TpmAdvisoryId, string>

export type TpmNumbers = { threshold: number; objective: number; cbe: number; contingency: number; wce: number; margin: number; sense: Sense } | null
/** The computed worst case and margin (R44 p.117), or null while a number or the sense is missing. */
export function tpmNumbers(t: Tpm): TpmNumbers {
  const [threshold, objective, cbe, contingency] = [t.threshold, t.objective, t.cbe, t.contingency].map(parseNum)
  if (threshold === null || objective === null || cbe === null || contingency === null || contingency < 0 || !t.sense) return null
  const wce = round(worstCase(t.sense, cbe, contingency))
  return { threshold, objective, cbe, contingency, wce, margin: round(margin(t.sense, threshold, wce)), sense: t.sense }
}
export type ProfilePoint = { label: string; month: number; cbe: number; contingency: number; wce: number; margin: number }
/** The planned profile with each point's worst case and margin; rows with a missing number are skipped. */
export function tpmProfile(t: Tpm): ProfilePoint[] {
  const threshold = parseNum(t.threshold)
  const sense = t.sense
  if (threshold === null || !sense) return []
  return t.profile.flatMap((p) => {
    const [month, cbe, contingency] = [p.month, p.cbe, p.contingency].map(parseNum)
    if (month === null || cbe === null || contingency === null || contingency < 0) return []
    const wce = round(worstCase(sense, cbe, contingency))
    return [{ label: p.label.trim(), month, cbe, contingency, wce, margin: round(margin(sense, threshold, wce)) }]
  })
}

export function assessTpm(t: Tpm, r: Week3Record): Assessment<TpmGateId, TpmAdvisoryId> {
  const c = collector<TpmGateId, TpmAdvisoryId>()
  const s = snapIds(r)
  const parentOk = s.req.has(t.measures) && s.mop.has(t.derivesFrom)
  c.gate('parent', parentOk, parentOk ? `Tracks ${t.measures}; derives from ${t.derivesFrom}.` : [s.req.has(t.measures) ? '' : t.measures ? `${t.measures} is not a requirement in the Week 2 record` : 'the requirement it tracks (a REQ ID)', s.mop.has(t.derivesFrom) ? '' : t.derivesFrom ? `${t.derivesFrom} is not an MOP in the Week 2 record` : 'the MOP it derives from'].filter(Boolean).join('; ').replace(/^./, (x) => x.toUpperCase()) + '.')
  const n = tpmNumbers(t)
  const numbersOk = !!n && words(t.unit) >= 1 && words(t.name) >= 1
  const bad = [['threshold', t.threshold], ['objective', t.objective], ['current best estimate', t.cbe], ['contingency', t.contingency]].filter(([, v]) => parseNum(v) === null).map(([k]) => k)
  c.gate('numbers', numbersOk, numbersOk ? `Worst case ${n!.wce} ${t.unit.trim()}, margin ${n!.margin} ${t.unit.trim()}.` : [words(t.name) >= 1 ? '' : 'a name', bad.length ? `${bad.join(', ')} as numbers` : '', (parseNum(t.contingency) ?? 0) < 0 ? 'a contingency of zero or more' : '', t.sense ? '' : 'the sense (lower or higher is better)', words(t.unit) >= 1 ? '' : 'a unit'].filter(Boolean).join(', ').replace(/^./, (x) => x.toUpperCase()) + '.')
  const thr = parseNum(t.threshold)
  const obj = parseNum(t.objective)
  const sideKnown = thr !== null && obj !== null && !!t.sense
  const sideOk = sideKnown && (t.sense === 'lower-is-better' ? obj! < thr! : obj! > thr!)
  c.gate('objective-side', sideOk, !sideKnown ? 'Enter the threshold, the objective and the sense first.' : sideOk ? 'Objective on the good side of the threshold.' : `The objective must be ${t.sense === 'lower-is-better' ? 'below' : 'above'} the threshold for a ${t.sense.replace(/-/g, ' ')} measure.`)
  c.gate('basis', said(t.basis), said(t.basis) ? 'Basis recorded.' : 'State the basis of the current estimate: analysis, model, test.')
  const pts = tpmProfile(t)
  const future = pts.filter((p) => p.month > 0)
  const increasing = future.every((p, i) => i === 0 || p.month > future[i - 1].month)
  const profileOk = future.length >= 2 && increasing && pts.length === t.profile.length
  c.gate('profile', profileOk, profileOk ? `${future.length} planned future points.` : parseNum(t.threshold) === null || !t.sense ? 'Enter the threshold and the sense first, then the planned profile.' : pts.length !== t.profile.length ? 'Every profile row needs a month, a planned estimate and a contingency (numbers).' : !increasing ? 'Profile months must increase.' : `At least 2 planned values at future review points (month > 0); ${future.length} so far.`)
  const linked = r.risks.some((k) => k.id === t.relatedRisk) || r.issues.some((i) => i.id === t.relatedRisk)
  const breached = !!n && n.margin < 0
  c.gate('breach-risk', !breached || linked, !n ? 'Enter the numbers first: a breach needs a linked risk or issue.' : !breached ? 'Worst case inside the threshold.' : linked ? `Breach recorded: worst case ${n.wce} outside the threshold ${n.threshold}, watched by ${t.relatedRisk}.` : `The worst case (${n.wce}) is outside the threshold (${n.threshold}): a TPM breach is a risk. Link the risk in the register (an R ID), or an issue (an I ID) if the breach is certain.`)
  if (breached && linked) c.adv('breach', `The worst case (${n!.wce}) is outside the threshold (${n!.threshold}): check that ${t.relatedRisk} is rated for the breach, not for the original estimate.`)
  if (n && n.contingency === 0) c.adv('zero-contingency', 'Zero contingency: margin equals threshold minus the current estimate. An estimate from analysis normally carries a contingency.')
  if (pts.some((p, i) => i > 0 && p.contingency > pts[i - 1].contingency)) c.adv('contingency-grows', 'The planned contingency grows at a later review point: it normally falls as measurements mature.')
  if (!breached && !r.risks.some((k) => k.id === t.relatedRisk)) c.adv('no-risk', 'Link the risk this TPM watches (an R ID): a TPM normally tracks a risky requirement.')
  return c.done()
}

// ---------------------------------------------------------------------------------------------- trade study
export type TradeComputation = {
  /** Alternatives that pass every screen, in record order. */
  scored: string[]
  screenedOut: string[]
  weights: number[]
  /** values[altId] = single-attribute values per criterion; totals[altId] = additive value. */
  values: Record<string, number[]>
  totals: Record<string, number>
  ranking: string[]
  /** Scored alternatives with a score beyond a walk-away point: walked away from, so left out of the sensitivity. */
  beyondWalkAway: { id: string; criteria: string[] }[]
  /** The alternatives the sensitivity is computed over: scored and inside every walk-away point. */
  feasible: string[]
  sensitivity: { criterion: string; base: number; up: { w: number; to: string } | null; down: { w: number; to: string } | null }[]
  complete: boolean
}
export const scoreOf = (r: Week3Record, alt: string, crit: string) => parseNum(r.trade.scores[alt]?.[crit] ?? '')
const anchorsOf = (c: Criterion) => ({ walkAway: parseNum(c.walkAway), stretch: parseNum(c.stretch) })

/** The additive value model (R18 p.469): linear values between walk-away and stretch, swing weights normalized, totals,
 *  ranking and one-at-a-time reversal points for every criterion. Alternatives that fail a screen are not scored; an
 *  alternative with a score beyond a walk-away point is scored (clamped at 0) but left out of the sensitivity, because
 *  the decision maker walks away from it whatever its other scores (R18 pp.465–466). */
export function computeTrade(r: Week3Record): TradeComputation {
  const t = r.trade
  const screenedOut = t.alternatives.filter((a) => t.screens.some((s) => s.results[a.id] === 'fail')).map((a) => a.id)
  const scored = t.alternatives.map((a) => a.id).filter((id) => !screenedOut.includes(id))
  const points = t.criteria.map((c) => parseNum(c.swingPoints) ?? 0)
  const weights = normalizeWeights(points.map((p) => Math.max(0, p)))
  const values: Record<string, number[]> = {}
  const totals: Record<string, number> = {}
  let complete = t.criteria.length > 0 && scored.length > 0 && points.every((p) => p > 0)
  for (const a of scored) {
    values[a] = t.criteria.map((c) => {
      const { walkAway, stretch } = anchorsOf(c)
      const x = scoreOf(r, a, c.id)
      if (walkAway === null || stretch === null || walkAway === stretch || x === null) {
        complete = false
        return 0
      }
      return linearValue(x, walkAway, stretch)
    })
    totals[a] = additiveValue(weights, values[a])
  }
  const ranking = [...scored].sort((a, b) => totals[b] - totals[a])
  const beyondWalkAway = scored
    .map((a) => ({
      id: a,
      criteria: t.criteria.filter((c) => {
        const { walkAway, stretch } = anchorsOf(c)
        const x = scoreOf(r, a, c.id)
        if (walkAway === null || stretch === null || walkAway === stretch || x === null) return false
        return stretch < walkAway ? x > walkAway : x < walkAway
      }).map((c) => c.id),
    }))
    .filter((x) => x.criteria.length)
  // the sensitivity runs over the feasible alternatives only: a reversal to an alternative beyond a walk-away is no reversal
  const feasible = scored.filter((a) => !beyondWalkAway.some((x) => x.id === a))
  const sensitivity = complete && feasible.length >= 2
    ? t.criteria.map((c, k) => {
        const rp = reversalPoints(weights, feasible.map((a) => values[a]), k)
        return { criterion: c.id, base: weights[k], up: rp.up ? { w: rp.up.w, to: feasible[rp.up.to] } : null, down: rp.down ? { w: rp.down.w, to: feasible[rp.down.to] } : null }
      })
    : []
  return { scored, screenedOut, weights, values, totals, ranking, beyondWalkAway, feasible, sensitivity, complete }
}

const COST = /\b(cost|costs|capital|price|budget|spend|funding|usd|dollars?|\$)/i
const RESILIENCE_OR_SECURITY = /\b(resilien\w*|retain\w*|recover\w*|outage|disrupt\w*|loss of|redundan\w*|backup|secur\w*|cyber\w*|attack\w*|tamper\w*|authenticat\w*)/i

export function assessTrade(r: Week3Record): Assessment<TradeGateId, TradeAdvisoryId> & { computation: TradeComputation } {
  const c = collector<TradeGateId, TradeAdvisoryId>()
  const t = r.trade
  const s = snapIds(r)
  const comp = computeTrade(r)
  const trace = idsIn(t.trace)
  const traceOk = trace.some((x) => s.req.has(x) || s.mgo.has(x))
  // gate sweep 2026-10-19: no word count (was 8); the course form is shown on the slide and the trace is the check
  const decisionOk = said(t.decision) && traceOk
  c.gate('decision', decisionOk, decisionOk ? `Traces to ${trace.filter((x) => s.req.has(x) || s.mgo.has(x)).join(', ')}.` : [said(t.decision) ? '' : 'a decision statement (“How should [enterprise] [achieve objective X] given [constraint]?”)', traceOk ? '' : 'the requirement or objective it traces to (a REQ or MGO ID in the Week 2 record)'].filter(Boolean).join('; ').replace(/^./, (x) => x.toUpperCase()) + '.')
  const base = t.alternatives.filter((a) => a.baseline && words(a.name) >= 1)
  c.gate('baseline', base.length >= 1, base.length ? `Baseline: ${base[0].id} ${base[0].name.trim()}.` : 'Mark one alternative as the baseline (status quo) and name it.')
  const rows = t.alternatives.map((a) => ({ id: a.id, row: t.criteria.map((k) => scoreOf(r, a.id, k.id)) })).filter((x) => x.row.length && x.row.every((v) => v !== null)).map((x) => ({ id: x.id, key: x.row.join('|') }))
  const same = rows.filter((x, i) => rows.findIndex((y) => y.key === x.key) !== i).map((x) => x.id)
  c.gate('distinct', !same.length, same.length ? `${same.join(', ')} ${same.length > 1 ? 'have' : 'has'} the same scores as another alternative on every criterion: a strawman or a duplicate.` : 'Every alternative differs in at least one score.')
  const untraced = t.criteria.filter((k) => !(s.moe.has(k.moe) || s.mgo.has(k.moe)))
  c.gate('criteria-trace', t.criteria.length > 0 && !untraced.length, !t.criteria.length ? 'Add the criteria, each traced to an MOE.' : untraced.length ? `${untraced.map((k) => k.id).join(', ')}: trace each criterion to an MOE (or an objective) in the Week 2 record.` : 'Every criterion traces to an MOE or an objective.')
  const badAnchors = t.criteria.filter((k) => {
    const { walkAway, stretch } = anchorsOf(k)
    return walkAway === null || stretch === null || walkAway === stretch
  })
  c.gate('anchors', t.criteria.length > 0 && !badAnchors.length, badAnchors.length ? `${badAnchors.map((k) => k.id).join(', ')}: a walk-away point (value 0) and a stretch goal (value 1) as two different numbers.` : t.criteria.length ? 'Every criterion has a walk-away point and a stretch goal.' : 'Add the criteria first.')
  const badWeights = t.criteria.filter((k) => !((parseNum(k.swingPoints) ?? 0) > 0) || !said(k.rationale))
  c.gate('weights', t.criteria.length > 0 && !badWeights.length, badWeights.length ? `${badWeights.map((k) => k.id).join(', ')}: swing points above zero and a rationale that names the range swung.` : t.criteria.length ? `Weights ${comp.weights.map((w) => w.toFixed(2)).join(' / ')}.` : 'Add the criteria first.')
  const missing = t.alternatives.flatMap((a) => t.criteria.filter((k) => scoreOf(r, a.id, k.id) === null).map((k) => `${a.id}×${k.id}`))
  c.gate('scores', t.alternatives.length > 0 && t.criteria.length > 0 && !missing.length, missing.length ? `Score every alternative on every criterion (missing: ${missing.slice(0, 4).join(', ')}${missing.length > 4 ? ` and ${missing.length - 4} more` : ''}).` : t.alternatives.length && t.criteria.length ? 'Every alternative scored on every criterion.' : 'Add alternatives and criteria first.')
  // gate sweep 2026-10-19: no word count (was 5). The gate asks for the reversal point, so when the tool computed one the
  // note must state a number; when there is none, a note saying so ("No reversal in range: robust") is complete.
  const anyPoint = comp.sensitivity.some((x) => !!x.up || !!x.down)
  const sensOk = said(t.sensitivityNote) && (!anyPoint || /\d/.test(t.sensitivityNote))
  c.gate('sensitivity', sensOk, sensOk ? 'Sensitivity interpreted.' : said(t.sensitivityNote) ? 'State the reversal point as a number (the tool computes the points below) and what it means for the decision.' : 'State the reversal point of the most heavily weighted criterion and what it means for the decision (the tool computes the points below).')
  const recBeyond = comp.beyondWalkAway.find((x) => x.id === t.recommended)
  const recOk = comp.scored.includes(t.recommended) && !recBeyond && lines(t.conditions).length >= 1 && said(t.residualRisk) && lines(t.wouldChangeIf).length >= 1
  c.gate('recommendation', recOk, recOk ? `Recommends ${t.recommended}.` : [comp.scored.includes(t.recommended) ? '' : !t.recommended ? 'the recommended alternative' : comp.screenedOut.includes(t.recommended) ? `${t.recommended} fails a screen and cannot be recommended` : `${t.recommended} is not an alternative`, recBeyond ? `${t.recommended} scores beyond the walk-away point on ${recBeyond.criteria.join(', ')}: the decision maker walks away from it however well it scores elsewhere, so it cannot be recommended` : '', lines(t.conditions).length ? '' : 'at least one condition', said(t.residualRisk) ? '' : 'the residual risk', lines(t.wouldChangeIf).length ? '' : 'what would change the decision'].filter(Boolean).join('; ').replace(/^./, (x) => x.toUpperCase()) + '.')
  if (t.criteria.length && !t.criteria.some((k) => COST.test(`${k.name} ${k.unit}`))) c.adv('no-cost', 'No cost criterion: cost is usually a criterion, or a constraint stated in the decision.')
  const top = Math.max(0, ...comp.weights)
  if (t.criteria.length > 1 && top > 0.5) c.adv('dominant-weight', `One criterion carries ${(top * 100).toFixed(0)} % of the weight: check that its range really swings that much value.`)
  const moes = t.criteria.map((k) => k.moe).filter(Boolean)
  const dupMoe = duplicates(moes)
  if (dupMoe.length) c.adv('double-count', `${dupMoe.join(', ')} is traced by more than one criterion: possible double counting.`)
  if (t.criteria.length && !t.criteria.some((k) => RESILIENCE_OR_SECURITY.test(`${k.name} ${k.rationale}`)) && !t.screens.some((sc) => words(sc.name) >= 1)) c.adv('resilience', 'No resilience or security criterion and no screen: add one, or say why the decision does not touch them.')
  if (comp.sensitivity.some((x) => (x.up && x.up.w - x.base <= 0.05) || (x.down && x.base - x.down.w <= 0.05))) c.adv('fragile', 'The top rank reverses within 0.05 of a base weight: the recommendation is fragile; say so in the conditions.')
  for (const b of comp.beyondWalkAway) c.adv('walk-away', `${b.id} scores beyond the walk-away point on ${b.criteria.join(', ')}: the decision maker walks away from it whatever its other scores. Record it as failing a screen; it is left out of the sensitivity.`)
  const leader = comp.ranking.find((a) => comp.feasible.includes(a))
  if (leader && comp.scored.includes(t.recommended) && !recBeyond && t.recommended !== leader) c.adv('not-top', `${t.recommended} is not the top-ranked alternative (${leader} is): give the reason for recommending it in the conditions, such as a risk or a constraint the criteria do not capture.`)
  const points = comp.sensitivity.flatMap((x) => [x.up?.w, x.down?.w]).filter((w): w is number => typeof w === 'number')
  const stated = (t.sensitivityNote.match(/\d*\.\d+|\d+/g) ?? []).map(Number).filter((x) => x >= 0 && x <= 1)
  if (points.length && said(t.sensitivityNote) && !stated.some((x) => points.some((p) => Math.abs(x - p) <= REVERSAL_TOLERANCE)))
    c.adv('reversal-number', `The sensitivity note states no reversal point the tool computed (${points.map((p) => p.toFixed(3)).join(', ')}): check the number, within ±${REVERSAL_TOLERANCE}.`)
  return { ...c.done(), computation: comp }
}

// ---------------------------------------------------------------------------------------------- part checks
export type PartCheck = { ok: boolean; issues: string[]; detail: string; notes?: string[] }
const result = (issues: string[], okDetail: string, notes: string[] = []): PartCheck => ({ ok: issues.length === 0, issues, detail: issues.length ? issues[0] + (issues.length > 1 ? ` (+${issues.length - 1} more)` : '') : okDetail, notes })
const three = (r: Week3Record) => (r.threePersonTeam ? ' (three-person team minimum, pending faculty approval)' : '')

/** Step 0: the Week 2 record is imported, about the team's own enterprise, with requirements and MOEs. */
export function checkImport(r: Week3Record): PartCheck {
  const w = r.week2
  if (!w) return result(['Import your team’s Week 2 model-inputs file (team-NN-week2-model-inputs.json): the Week 3 record traces to its requirements and measures.'], '')
  const issues: string[] = []
  const notes: string[] = []
  if ([w.enterprise, w.soi].some(isAeroLink)) issues.push('The imported record names AeroLink, the instructor’s worked example: import your team’s own Week 2 record.')
  if (!w.requirements.length) issues.push('The imported record has no requirements.')
  if (!w.moes.length) issues.push('The imported record has no MOEs: the trade-study criteria trace to them.')
  if (w.week2Status && w.week2Status !== 'ready') notes.push('The Week 2 record was exported as “not ready”. Correct it first where the feedback asks, then import it again.')
  return result(issues, `${w.enterprise}: ${plural(w.requirements.length, 'requirement')}, ${plural(w.moes.length, 'MOE')}, ${plural(w.mops.length, 'MOP')}, ${plural(w.unknowns.length, 'unknown')} from Week 2.`, notes)
}

/** Part 12: the technology readiness assessment. */
export function checkReadinessPart(r: Week3Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  const dup = duplicates(r.technologies.map((t) => t.id))
  if (dup.length) issues.push(`Duplicate technology ID ${dup.join(', ')}: each ID once.`)
  const st = r.technologies.map((t) => ({ t, a: assessTechnology(t, r) }))
  const counting = st.filter((x) => x.a.counts && !dup.includes(x.t.id))
  if (counting.length < min.technologies) issues.push(`At least ${min.technologies} technologies that pass every hard gate${three(r)} (${counting.length} so far).`)
  for (const { t, a } of st) {
    const failed = a.gates.filter((g) => !g.ok)
    if (failed.length) issues.push(`${t.id} does not count: ${TECH_GATE_SHORT[failed[0].id]} (${failed[0].message})${failed.length > 1 ? ` (+${failed.length - 1} more)` : ''}`)
    if (isAeroLink(`${t.name} ${t.does}`)) issues.push(`${t.id} names AeroLink, the instructor’s worked example: assess your own enterprise’s technologies.`)
    for (const x of a.advisories) notes.push(`${t.id}: advisory, ${x.message}`)
  }
  const crit = counting.filter((x) => x.t.critical).sort((a, b) => a.t.trl - b.t.trl)
  if (counting.length && !crit.length) notes.push('No technology is marked critical: say which one the requirements depend on most, or why none is.')
  return result(issues, `${counting.length} technologies assessed${crit.length ? `; lowest critical TRL ${crit[0].t.trl} (${crit[0].t.id})` : ''}.`, notes)
}

export function assumptionIssues(a: Assumption): string[] {
  const out: string[] = []
  if (words(a.name) < 1) out.push('a name')
  if (a.owner.trim().length < 2) out.push('an owner')
  if (!said(a.validation)) out.push('how it will be validated')
  return out
}
export function unknownIssues(u: Unknown, r: Week3Record): string[] {
  const out: string[] = []
  if (words(u.name) < 1) out.push('a name')
  if (u.owner.trim().length < 2) out.push('an owner')
  if (!/^TB[DR]-\d{2,3}$/.test(u.tbx)) out.push('its TBD/TBR token')
  if (!said(u.closeBy)) out.push('how and by when it will be closed')
  const known = knownIds(r)
  const strange = idsIn(u.affects).filter((x) => !known.has(x))
  if (strange.length) out.push(`remove ${strange.join(', ')}, not in the record`)
  return out
}
const simpleIssues = (x: { name: string; text: string; owner: string; action: string }, what: string) => {
  const out: string[] = []
  if (words(x.name) < 1) out.push('a name')
  if (!said(x.text)) out.push(`the ${what}`)
  if (x.owner.trim().length < 2) out.push('an owner')
  if (!said(x.action)) out.push('the action')
  return out
}
export const opportunityIssues = (o: Opportunity) => simpleIssues(o, 'opportunity, as a possible better outcome')
export const issueIssues = (i: Issue) => simpleIssues(i, 'issue: what has happened or is certain')

/** Part 13: risks (counting only those that pass every hard gate), with the security and resilience minimums, the
 *  opportunity minimum, the carried Week 2 register and the issue log. */
export function checkRegisterPart(r: Week3Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  const dup = duplicates([...r.risks, ...r.opportunities, ...r.issues, ...r.assumptions, ...r.unknowns].map((x) => x.id))
  if (dup.length) issues.push(`Duplicate register ID ${dup.join(', ')}: each ID once.`)
  const st = r.risks.map((k) => ({ k, a: assessRisk(k, r) }))
  const counting = st.filter((x) => x.a.counts && !dup.includes(x.k.id))
  if (counting.length < min.risks) issues.push(`At least ${min.risks} risks that pass every hard gate${three(r)} (${counting.length} so far).`)
  const sec = counting.filter((x) => x.k.category === 'security').length
  const res = counting.filter((x) => x.k.category === 'resilience').length
  if (sec < min.securityRisks) issues.push(`At least ${min.securityRisks} security risk among those that count: what could cause loss of an asset through an attack, misuse or a fault (${sec} so far).`)
  if (res < min.resilienceRisks) issues.push(`At least ${min.resilienceRisks} resilience risk among those that count: an adversity that could degrade the delivered capability, and how the enterprise would avoid, withstand or recover from it (${res} so far).`)
  for (const { k, a } of st) {
    const failed = a.gates.filter((g) => !g.ok)
    if (failed.length) issues.push(`${k.id} does not count: ${RISK_GATE_SHORT[failed[0].id]} (${failed[0].message})${failed.length > 1 ? ` (+${failed.length - 1} more)` : ''}`)
    if (isAeroLink(riskStatement(k))) issues.push(`${k.id} names AeroLink, the instructor’s worked example: write your own enterprise’s risks.`)
    for (const x of a.advisories) notes.push(`${k.id}: advisory, ${x.message}`)
  }
  const opps = r.opportunities.filter((o) => !opportunityIssues(o).length)
  if (opps.length < min.opportunities) issues.push(`At least ${min.opportunities} opportunity (${opps.length} complete so far).`)
  for (const o of r.opportunities) {
    const m = opportunityIssues(o)
    if (m.length) issues.push(`${o.id}: add ${m.join(', ')}.`)
  }
  for (const a of r.assumptions) {
    const m = assumptionIssues(a)
    if (m.length) issues.push(`${a.id}: add ${m.join(', ')}.`)
  }
  for (const u of r.unknowns) {
    const m = unknownIssues(u, r)
    if (m.length) issues.push(`${u.id}: add ${m.join(', ')}.`)
  }
  const missingU = (r.week2?.unknowns ?? []).filter((u) => !r.unknowns.some((x) => x.id === u.id)).map((u) => u.id)
  if (missingU.length) issues.push(`Every Week 2 unknown stays in the register until it is closed: ${missingU.join(', ')} ${missingU.length > 1 ? 'are' : 'is'} missing.`)
  for (const i of r.issues) {
    const m = issueIssues(i)
    if (m.length) issues.push(`${i.id}: add ${m.join(', ')}.`)
  }
  return result(issues, `${counting.length} risks count (${sec} security, ${res} resilience), ${plural(opps.length, 'opportunity', 'opportunities')}, ${plural(r.assumptions.length, 'assumption')}, ${plural(r.unknowns.length, 'unknown')}, ${plural(r.issues.length, 'issue')} in the issue log.`, notes)
}

/** Part 11 (measures): the technical performance measures. */
export function checkTpmPart(r: Week3Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  const dup = duplicates(r.tpms.map((t) => t.id))
  if (dup.length) issues.push(`Duplicate TPM ID ${dup.join(', ')}: each ID once.`)
  const st = r.tpms.map((t) => ({ t, a: assessTpm(t, r) }))
  const counting = st.filter((x) => x.a.counts && !dup.includes(x.t.id))
  if (counting.length < min.tpms) issues.push(`At least ${min.tpms} TPMs that pass every hard gate${three(r)} (${counting.length} so far).`)
  for (const { t, a } of st) {
    const failed = a.gates.filter((g) => !g.ok)
    if (failed.length) issues.push(`${t.id} does not count: ${TPM_GATE_SHORT[failed[0].id]} (${failed[0].message})${failed.length > 1 ? ` (+${failed.length - 1} more)` : ''}`)
    for (const x of a.advisories) notes.push(`${t.id}: advisory, ${x.message}`)
  }
  return result(issues, `${counting.length} TPMs, each with worst case, margin and a planned profile.`, notes)
}

/** Part 14: the trade study and the decision record. */
export function checkTradePart(r: Week3Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  const t = r.trade
  const dup = duplicates([...t.alternatives.map((a) => a.id), ...t.criteria.map((c) => c.id), ...t.screens.map((s) => s.id)])
  if (dup.length) issues.push(`Duplicate trade ID ${dup.join(', ')}: each ID once.`)
  if (t.alternatives.length < min.alternatives) issues.push(`At least ${min.alternatives} genuinely different alternatives including the baseline (${t.alternatives.length} so far).`)
  if (t.criteria.length < min.criteria) issues.push(`At least ${min.criteria} criteria${three(r)} (${t.criteria.length} so far).`)
  const a = assessTrade(r)
  for (const g of a.gates.filter((x) => !x.ok)) issues.push(`${TRADE_GATE_SHORT[g.id]}: ${g.message}`)
  for (const x of a.advisories) notes.push(`Advisory: ${x.message}`)
  for (const sc of t.screens) {
    if (words(sc.name) < 1 || !said(sc.test)) issues.push(`${sc.id}: a name and the test every alternative must pass.`)
    const open = t.alternatives.filter((x) => !sc.results[x.id]).map((x) => x.id)
    if (open.length) issues.push(`${sc.id}: record pass or fail for ${open.join(', ')}.`)
  }
  if (t.alternatives.some((x) => words(x.name) < 1 || !said(x.description))) issues.push('Every alternative needs a name and a description.')
  if (isAeroLink(`${t.decision} ${t.alternatives.map((x) => x.name).join(' ')}`)) issues.push('The trade study names AeroLink, the instructor’s worked example: frame your own enterprise’s decision.')
  const c = a.computation
  return result(issues, `${c.ranking[0] ?? '—'} ranks first (${(c.totals[c.ranking[0]] ?? 0).toFixed(3)}); recommended ${t.recommended}.`, notes)
}

/** The AI usage statement. */
export function checkAiStatement(r: Week3Record): PartCheck {
  const n = words(r.aiStatement)
  return result(n >= MIN_AI_WORDS ? [] : [`Write the AI usage statement for the Week 3 work (at least ${MIN_AI_WORDS} words, ${n} so far): tool, purpose, prompts, what you accepted or rejected and why, with AI-suggested items tagged; or say that no AI tool was used.`], 'AI usage statement recorded.')
}

export type PartId = 'import' | (typeof WEEK3_PARTS)[number]['id'] | 'ai'
export function allChecks(r: Week3Record): Record<PartId, PartCheck> {
  return { import: checkImport(r), readiness: checkReadinessPart(r), register: checkRegisterPart(r), tpm: checkTpmPart(r), trade: checkTradePart(r), ai: checkAiStatement(r) }
}
export type RecordState = 'not-ready' | 'ready'
export function recordState(r: Week3Record): RecordState {
  return Object.values(allChecks(r)).every((c) => c.ok) ? 'ready' : 'not-ready'
}

// ---------------------------------------------------------------------------------------------- Markdown
const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n+/g, '; ').trim()
const f3 = (x: number | undefined) => (x === undefined ? '' : x.toFixed(3))
export const fileStem = (r: Week3Record) => `team-${(r.week2?.team || 'NN').replace(/[^\w-]+/g, '') || 'NN'}-week3`
const gateText = (a: { counts: boolean; gates: { id: string; ok: boolean }[]; advisories: { id: string }[] }) => `${a.counts ? 'all pass' : `fails ${a.gates.filter((g) => !g.ok).map((g) => g.id).join(', ')}`}${a.advisories.length ? `; advisory: ${a.advisories.map((x) => x.id).join(', ')}` : ''}`

export function recordMarkdown(r: Week3Record, today = new Date().toISOString().slice(0, 10)): string {
  const w = r.week2
  const checks = allChecks(r)
  const t = r.trade
  const trade = assessTrade(r)
  const comp = trade.computation
  const L: string[] = [
    `# Week 3 Team Record: ${cell(w?.enterprise ?? '') || '(Week 2 record not imported)'}`,
    '',
    `Team: ${cell(w?.team ?? '') || '____'} · Exported from the Week 3 lab tool, ${today}. Extends the Week 2 Team Record (Parts 7–11).`,
    '',
    `**Record status:** ${recordState(r) === 'ready' ? 'complete: every part passes its checks' : `not ready: ${Object.entries(checks).filter(([, x]) => !x.ok).length} part(s) still incomplete`}.${r.threePersonTeam ? ' Three-person team: reduced minimums (pending faculty approval).' : ''}`,
    '',
    '## 6. AI usage statement (updated)',
    '',
    r.aiStatement.trim() || '_Not written yet._',
    '',
  ]
  const aiTagged = [...r.technologies.filter((x) => x.ai).map((x) => x.id), ...r.risks.filter((x) => x.ai).map((x) => x.id)]
  if (aiTagged.length) L.push(`AI-suggested, reviewed by the team: ${aiTagged.join(', ')}.`, '')
  L.push(`## ${partNumber('tpm')}. ${partTitle('tpm')}`, '', 'Margin = threshold − worst-case estimate; worst case = current best estimate moved by the contingency toward the threshold.', '')
  L.push('| ID | Name | Tracks | From | Sense | Threshold | Objective | Estimate | Contingency | Worst case | Margin | Basis | Related risk | Checks |', '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
  for (const x of r.tpms) {
    const n = tpmNumbers(x)
    L.push(`| ${x.id} | ${cell(x.name)} | ${x.measures} | ${x.derivesFrom} | ${x.sense} | ${cell(x.threshold)} ${cell(x.unit)} | ${cell(x.objective)} | ${cell(x.cbe)} | ${cell(x.contingency)} | ${n ? n.wce : ''} | ${n ? n.margin : ''} | ${cell(x.basis)} | ${x.relatedRisk} | ${gateText(assessTpm(x, r))} |`)
  }
  for (const x of r.tpms) {
    const p = tpmProfile(x)
    if (!p.length) continue
    L.push('', `Planned profile, ${x.id}:`, '', '| Review point | Month | Planned estimate | Contingency | Worst case | Margin |', '|---|---|---|---|---|---|', ...p.map((q) => `| ${cell(q.label)} | ${q.month} | ${q.cbe} | ${q.contingency} | ${q.wce} | ${q.margin} |`))
  }
  L.push('', `## ${partNumber('readiness')}. ${partTitle('readiness')}`, '', '| ID | Technology | What it does | Benefits | Limitations | TRL | Basis | Critical | Affects | Maturity risk | Checks |', '|---|---|---|---|---|---|---|---|---|---|---|')
  for (const x of r.technologies) L.push(`| ${x.id} | ${cell(x.name)}${x.ai ? ' (AI-suggested, reviewed)' : ''} | ${cell(x.does)} | ${cell(x.benefits)} | ${cell(x.limitations)} | ${x.trl || ''}${x.trl ? ` (${trlWording(x.trl)})` : ''} | ${x.basisKind === 'evidence' ? `evidence: ${cell(x.evidence)}` : x.basisKind === 'assumption' ? `assumption ${x.assumption}` : ''} | ${x.critical ? `yes: ${cell(x.criticalWhy)}` : 'no'} | ${idsIn(x.affects).join(', ')} | ${x.maturityRisk} | ${gateText(assessTechnology(x, r))} |`)
  L.push('', `## ${partNumber('register')}. ${partTitle('register')}`, '', '### Risks', '', '| ID | Name | Category | Statement | L | C | Level | Handling | Owner | Treatment | Trigger | Affects | Checks |', '|---|---|---|---|---|---|---|---|---|---|---|---|---|')
  for (const k of r.risks) L.push(`| ${k.id} | ${cell(k.name)}${k.ai ? ' (AI-suggested, reviewed)' : ''} | ${categoryLabel(k.category).toLowerCase()} | ${cell(riskStatement(k))} | ${k.likelihood || ''} | ${k.consequence || ''} | ${riskLevel(k)} | ${handlingLabelOf(k.handling).toLowerCase()} | ${cell(k.owner)} | ${cell(k.treatment)} | ${cell(k.trigger)} | ${idsIn(k.affects).join(', ')} | ${gateText(assessRisk(k, r))} |`)
  L.push('', '### Assumptions', '', '| ID | Name | Owner | Validated by |', '|---|---|---|---|', ...r.assumptions.map((a) => `| ${a.id} | ${cell(a.name)} | ${cell(a.owner)} | ${cell(a.validation)} |`))
  L.push('', '### Unknowns', '', '| ID | Name | TBD/TBR | Owner | Closed by | Affects |', '|---|---|---|---|---|---|', ...r.unknowns.map((u) => `| ${u.id} | ${cell(u.name)} | ${u.tbx} | ${cell(u.owner)} | ${cell(u.closeBy)} | ${idsIn(u.affects).join(', ')} |`))
  L.push('', '### Opportunities', '', '| ID | Name | Opportunity | Owner | Action |', '|---|---|---|---|---|', ...r.opportunities.map((o) => `| ${o.id} | ${cell(o.name)} | ${cell(o.text)} | ${cell(o.owner)} | ${cell(o.action)} |`))
  L.push('', '### Issue log (kept apart from the risks)', '', '| ID | Name | Issue | Owner | Action |', '|---|---|---|---|---|', ...r.issues.map((i) => `| ${i.id} | ${cell(i.name)} | ${cell(i.text)} | ${cell(i.owner)} | ${cell(i.action)} |`))
  L.push('', `## ${partNumber('trade')}. ${partTitle('trade')}`, '', `- Decision: ${cell(t.decision)} (traces to ${idsIn(t.trace).join(', ')})`, '', '| ID | Alternative | Description | Baseline |', '|---|---|---|---|', ...t.alternatives.map((a) => `| ${a.id} | ${cell(a.name)} | ${cell(a.description)} | ${a.baseline ? 'yes' : ''} |`))
  L.push('', '| ID | Criterion | MOE | Unit | Walk-away (0) | Stretch (1) | Swing points | Weight | Rationale |', '|---|---|---|---|---|---|---|---|---|', ...t.criteria.map((c, i) => `| ${c.id} | ${cell(c.name)} | ${c.moe} | ${cell(c.unit)} | ${cell(c.walkAway)} | ${cell(c.stretch)} | ${cell(c.swingPoints)} | ${(comp.weights[i] ?? 0).toFixed(3)} | ${cell(c.rationale)} |`))
  if (t.screens.length) L.push('', `| Screen | Test | ${t.alternatives.map((a) => a.id).join(' | ')} |`, `|---|---|${t.alternatives.map(() => '---|').join('')}`, ...t.screens.map((s) => `| ${s.id} ${cell(s.name)} | ${cell(s.test)} | ${t.alternatives.map((a) => s.results[a.id] || '').join(' | ')} |`))
  L.push('', `| Alternative | ${t.criteria.map((c) => `${c.id} score (value)`).join(' | ')} | Total |`, `|---|${t.criteria.map(() => '---|').join('')}---|`)
  for (const a of t.alternatives) L.push(`| ${a.id} | ${t.criteria.map((c, i) => `${cell(t.scores[a.id]?.[c.id] ?? '')}${comp.values[a.id] ? ` (${comp.values[a.id][i].toFixed(3)})` : ''}`).join(' | ')} | ${comp.screenedOut.includes(a.id) ? 'screened out' : f3(comp.totals[a.id])} |`)
  L.push('', `- Ranking: ${comp.ranking.map((id) => `${id} ${f3(comp.totals[id])}`).join('; ') || '(incomplete)'}`)
  L.push(`- Sensitivity (one weight at a time, the others rescaled in proportion): ${comp.sensitivity.map((x) => `${x.criterion} base ${x.base.toFixed(3)}: ${x.up ? `above ${x.up.w.toFixed(3)} → ${x.up.to}` : 'no change upward'}; ${x.down ? `below ${x.down.w.toFixed(3)} → ${x.down.to}` : 'no change downward'}`).join(' · ') || '(incomplete)'}`)
  L.push(`- Team’s reading of the sensitivity: ${cell(t.sensitivityNote)}`, `- Recommendation: ${t.recommended}`, `- Conditions: ${lines(t.conditions).map(cell).join('; ')}`, `- Residual risk: ${lines(t.residualRisk).map(cell).join('; ')}`, `- Would change if: ${lines(t.wouldChangeIf).map(cell).join('; ')}`, `- Derived requirements: ${lines(t.derived).map(cell).join('; ') || 'none'}`, `- Checks: ${gateText(trade)}`, '')
  return L.join('\n')
}

// ---------------------------------------------------------------------------------------------- JSON model inputs
/** The SysML v2 element each item seeds in Phase II (course working mapping; named only). */
export const SEEDS = {
  technology: ['part def or attribute with TRL metadata (named only)'],
  risk: ['risk metadata on the affected elements (named only)'],
  register: ['metadata or attribute with a TBD/TBR value (named only)'],
  tpm: ['attribute with a constraint (threshold) (named only)'],
  trade: ['analysis case', 'calculation def (additive value)', 'constraint def (screens)'],
} as const

export function modelInputs(r: Week3Record) {
  const checks = allChecks(r)
  const trade = assessTrade(r)
  return {
    format: MODEL_INPUTS_FORMAT,
    version: MODEL_INPUTS_VERSION,
    team: r.week2?.team ?? '',
    status: recordState(r),
    threePersonTeam: r.threePersonTeam,
    week2: r.week2,
    technologies: r.technologies.map((x) => {
      const a = assessTechnology(x, r)
      return { ...x, trlWording: trlWording(x.trl), affects: idsIn(x.affects), counts: a.counts, gatesFailed: a.gates.filter((g) => !g.ok).map((g) => g.id), advisories: a.advisories.map((g) => g.id), seeds: SEEDS.technology }
    }),
    assumptions: r.assumptions.map((x) => ({ ...x, seeds: SEEDS.register })),
    unknowns: r.unknowns.map((x) => ({ ...x, affects: idsIn(x.affects), seeds: SEEDS.register })),
    risks: r.risks.map((k) => {
      const a = assessRisk(k, r)
      return { ...k, statement: riskStatement(k), level: riskLevel(k), affects: idsIn(k.affects), counts: a.counts, gatesFailed: a.gates.filter((g) => !g.ok).map((g) => g.id), advisories: a.advisories.map((g) => g.id), seeds: SEEDS.risk }
    }),
    opportunities: r.opportunities,
    issues: r.issues,
    tpms: r.tpms.map((x) => {
      const a = assessTpm(x, r)
      const n = tpmNumbers(x)
      return { ...x, worstCase: n?.wce ?? null, margin: n?.margin ?? null, plannedProfile: tpmProfile(x), counts: a.counts, gatesFailed: a.gates.filter((g) => !g.ok).map((g) => g.id), advisories: a.advisories.map((g) => g.id), seeds: SEEDS.tpm }
    }),
    trade: {
      ...r.trade,
      trace: idsIn(r.trade.trace),
      conditions: lines(r.trade.conditions),
      residualRisk: lines(r.trade.residualRisk),
      wouldChangeIf: lines(r.trade.wouldChangeIf),
      derived: lines(r.trade.derived),
      computed: trade.computation,
      gatesFailed: trade.gates.filter((g) => !g.ok).map((g) => g.id),
      advisories: trade.advisories.map((g) => g.id),
      seeds: SEEDS.trade,
    },
    aiStatement: r.aiStatement.trim(),
    checks: { parts: Object.fromEntries(Object.entries(checks).map(([k, x]) => [k, { ok: x.ok, issues: x.issues.length }])) },
    issued: r.issued,
  }
}

// ---------------------------------------------------------------------------------------------- import (teammate share)
const kindOf = (x: unknown) => (x === null ? 'null' : Array.isArray(x) ? 'a list' : typeof x === 'object' ? 'an object' : typeof x === 'string' ? 'text' : typeof x)

/** Reads a Week 3 model-inputs JSON file (a teammate's export) back into a record. Every problem is returned as a message
 *  the student can act on; nothing is thrown. */
export function importWeek3(text: string): Week3Record | { error: string } {
  try {
    return importUnsafe(text)
  } catch (e) {
    return { error: `This file could not be read as Week 3 model inputs (${e instanceof Error ? e.message : String(e)}).` }
  }
}

function importUnsafe(text: string): Week3Record | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON.' }
  }
  if (isObj(d) && d.format === 'week2-model-inputs') return { error: 'This is a Week 2 model-inputs file: use “Import your Week 2 record” to start the Week 3 record from it.' }
  if (isObj(d) && d.format === 'week1-model-inputs') return { error: 'This is a Week 1 model-inputs file: the Week 3 record starts from your team’s Week 2 export.' }
  if (!isObj(d) || d.format !== MODEL_INPUTS_FORMAT) return { error: `This is not a Week 3 model-inputs file (format “${MODEL_INPUTS_FORMAT}”).` }
  if (d.version !== MODEL_INPUTS_VERSION) return { error: `This Week 3 file has version ${JSON.stringify(d.version)}; this tool reads version ${MODEL_INPUTS_VERSION}.` }
  const lists: [string, unknown][] = [['technologies', d.technologies], ['assumptions', d.assumptions], ['unknowns', d.unknowns], ['risks', d.risks], ['opportunities', d.opportunities], ['issues', d.issues], ['tpms', d.tpms]]
  for (const [path, x] of lists) {
    if (x === undefined) continue
    if (!Array.isArray(x)) return { error: `“${path}” must be a list; this file has ${kindOf(x)}.` }
    const bad = x.findIndex((y) => !isObj(y))
    if (bad >= 0) return { error: `“${path}” item ${bad + 1} is ${kindOf(x[bad])}, not an object.` }
  }
  if (d.week2 !== undefined && d.week2 !== null && !isObj(d.week2)) return { error: `“week2” must be an object; this file has ${kindOf(d.week2)}.` }
  if (d.trade !== undefined && !isObj(d.trade)) return { error: `“trade” must be an object; this file has ${kindOf(d.trade)}.` }
  const w2 = isObj(d.week2) ? d.week2 : undefined
  if (w2 && (isAeroLink(str(w2.enterprise)) || isAeroLink(str(w2.soi)))) return { error: 'This file is about AeroLink, the instructor’s worked example: import your team’s own record.' }
  const rec = normalizeRecord(d)
  const checks: [string, string[], RegExp][] = [
    ['technology', rec.technologies.map((x) => x.id), ID_FORMS.TECH],
    ['risk', rec.risks.map((x) => x.id), ID_FORMS.R],
    ['opportunity', rec.opportunities.map((x) => x.id), ID_FORMS.O],
    ['issue', rec.issues.map((x) => x.id), ID_FORMS.I],
    ['assumption', rec.assumptions.map((x) => x.id), ID_FORMS.A],
    ['unknown', rec.unknowns.map((x) => x.id), ID_FORMS.U],
    ['TPM', rec.tpms.map((x) => x.id), ID_FORMS.TPM],
    ['alternative', rec.trade.alternatives.map((x) => x.id), ID_FORMS.ALT],
    ['criterion', rec.trade.criteria.map((x) => x.id), ID_FORMS.CRIT],
  ]
  for (const [label, ids, re] of checks) {
    const bad = ids.filter((id) => !re.test(id))
    if (bad.length) return { error: `Unexpected ${label} IDs in the file: ${bad.slice(0, 3).map((x) => x || '(empty)').join(', ')}. IDs look like ${re.source.replace(/[\^$\\]/g, '').replace('d{3}', '001')}.` }
    const dup = duplicates(ids)
    if (dup.length) return { error: `Duplicate ID ${dup[0]} (${ids.filter((x) => x === dup[0]).length} times) in the file: each ID once. Fix the file, or ask the teammate who exported it to export again.` }
  }
  return rec
}

/** Register entry kinds as the tool labels them (labBrief ENTRY_KINDS). */
export const ENTRY_KIND_LABELS = Object.fromEntries(ENTRY_KINDS.map((k) => [k.prefix, k])) as Record<string, (typeof ENTRY_KINDS)[number]>
