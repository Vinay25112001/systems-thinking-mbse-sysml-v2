// Week 6 Team Record (pure logic, no React): the baseline and capability gaps over three horizons (Part 23), the technology
// plan with insertion points (Part 24), the increments with their triggers, approaches, transition and security and
// resilience change (Part 25), the known unknowns and the AROU update (Part 26), and the impact of one increment with the
// Phase I baseline review (Part 27), plus the AI usage statement. The record EXTENDS the team's Week 5 Team Record: it is
// started from the Week 5 model-inputs JSON (`week5-model-inputs` v1, read with Week 5's own importWeek5, read-only) and
// keeps a snapshot of what it traces to. The team's Week 3 export (`week3-model-inputs` v1, read with Week 3's own
// importWeek3) may be loaded too, because the Week 5 file does not carry the technology table: with it the tool compares
// TRLs, knows the MGO, TECH, U and A IDs, and continues their numbering.
//
// Adapter pattern (PROJECT_WORKSPACE_ARCHITECTURE.md; CANONICAL_ENGINEERING_DATA_MODEL.md §5): this module is the pure
// "record" layer a My Project editor projects through. Its export names, for every entry, the canonical artifact type
// (INC, TECH, U, R, O, A; GAP rows are nested, a proposed prefix) and the typed relationships it implies (INC precedes INC,
// INC delivers TECH/CAP/REQ, U affects INC, R affects INC), so an adapter maps it without reading the UI.
//
// Single sources: every minimum, gate id, advisory, status, approach and part rule is read from
// src/content/lectures/week06/labBrief.ts, so the lecture, the AeroLink worked example and the tool apply the same rules.
//
// Gates are designed against the recurring defect of Weeks 2, 4 and 5 (valid input rejected for its form): no gate tests a
// name's form or length beyond one word; each free-text gate asks for one word where the lecture calls a word complete
// ("Cutover", "None", "Approved", "A-003", "TL"), and, against the opposite defect (over-relaxation, Week 5 confirmation
// N1), a free-text answer that says nothing ("n/a", "none", "?", "-", "later", "TBD"; src/workbench/emptyAnswer.ts) never
// counts, except where the gate text names it as valid: "None" for an increment's security and resilience change and
// "TBD"/"none" for a capability level. Names are only required to be written. MGO IDs are accepted as traces even when the Week 3 file is not loaded
// (the tool cannot check them, and says so in an advisory). Normalize never throws; IDs the tool issues are never reused
// after deletion; checks return { ok, issues, detail, notes }; hard gates block an entry from counting, advisories never
// block; Markdown + JSON export with format/version; import with clear messages; a teammate's file replaces the record
// only after a confirmation (A22: no silent overwrite). AeroLink is the instructor's worked example: a record about
// AeroLink is refused.
import {
  APPROACHES, AROU_ADVISORIES, AROU_GATES, AROU_KINDS, BASELINE_GATES, GAP_GATES, HORIZONS, IMPACT_GATES, INCREMENT_ADVISORIES, INCREMENT_GATES, LAB6_MINIMUMS, LAB6_MINIMUMS_THREE, MATURE_TRL, PART_RULES, REVIEW_GATES, REVIEW_WEEKS, RISK_CATEGORIES,
  SECURITY_OR_RESILIENCE, TECH_ADVISORIES, TECH_GATES, TECH_STATUSES, UNKNOWN_ADVISORIES, UNKNOWN_GATES, WEEK6_PARTS, approachLabel, horizonLabel, techStatusLabel,
  type ApproachId, type ArouAdvisoryId, type ArouGateId, type ArouKind, type BaselineGateId, type GapGateId, type HorizonId, type ImpactGateId, type IncrementAdvisoryId, type IncrementGateId, type Lab6Minimums, type ReviewGateId, type TechAdvisoryId,
  type TechGateId, type TechStatus, type UnknownAdvisoryId, type UnknownGateId,
} from '../../content/lectures/week06/labBrief'
import { importWeek5, recordState as week5State, type Week5Record } from '../week5/record'
import { importWeek3, recordState as week3State, type Week3Record } from '../week3/record'
import { isAeroLink } from '../week1/team'
import { isEmptyAnswer, said } from '../emptyAnswer'

export const W6_KEY = 'w6.record'
export const MODEL_INPUTS_FORMAT = 'week6-model-inputs'
export const MODEL_INPUTS_VERSION = 1
export const SOURCE_FORMAT = 'week5-model-inputs'
export const WEEK3_FORMAT = 'week3-model-inputs'
export const MIN_AI_WORDS = 12
/** A word is a complete answer wherever the lecture calls one complete (the gate texts say so). */
export const MIN_WORDS = 1
export { isAeroLink }

export const minimumsOf = (r: Pick<Week6Record, 'threePersonTeam'>): Lab6Minimums => (r.threePersonTeam ? LAB6_MINIMUMS_THREE : LAB6_MINIMUMS)

// ---------------------------------------------------------------------------------------------- types
export type Week5Snapshot = {
  team: string
  enterprise: string
  soi: string
  needs: { id: string; name: string }[]
  capabilities: { id: string; name: string }[]
  requirements: { id: string; name: string }[]
  risks: { id: string; name: string; category: string }[]
  tpms: { id: string; name: string }[]
  physical: { id: string; name: string }[]
  externals: { id: string; name: string }[]
  functions: { id: string; name: string; phy: string }[]
  information: { id: string; name: string; producers: string[]; consumers: string[] }[]
  ai: { id: string; name: string; host: string }[]
  decisions: { id: string; question: string }[]
  components: { id: string; name: string; parent: string }[]
  interfaces: { id: string; name: string; endA: string; endB: string; standard: string }[]
  changes: { id: string; interface: string; change: string }[]
  threePersonTeam: boolean
  week5Status: string
  sourceVersion: number
}
/** What the optional Week 3 file adds: the technology table, the objectives, the unknowns and assumptions. */
export type Week3Extra = {
  technologies: { id: string; name: string; trl: number; critical: boolean }[]
  objectives: { id: string; statement: string }[]
  unknowns: { id: string; name: string }[]
  assumptions: { id: string; name: string }[]
  /** Week 3 opportunities (O IDs): Week 6 AROU opportunities continue after them (Week 7 review M3: they were reused). */
  opportunities: { id: string; name: string }[]
  enterprise: string
  week3Status: string
}
export type Horizons = Record<HorizonId, string>
export type Gap = { id: string; capability: string; kind: '' | 'gap' | 'excess'; horizon: HorizonId | ''; desired: string; baseline: string; sources: string; ai: boolean }
export type Tech = { id: string; name: string; status: TechStatus | ''; trl: number; basis: string; insertion: string; notInserted: string; risk: string; ai: boolean }
export type Increment = {
  id: string
  baseline: boolean
  name: string
  horizon: HorizonId | ''
  content: string
  serves: string
  trigger: string
  dependencies: string
  offRamp: string
  approach: ApproachId | ''
  transition: string
  security: string
  risks: string
  ai: boolean
}
export type Unknown = { id: string; name: string; tbx: string; impact: string; need: string; mitigation: string; owner: string; gates: string; ai: boolean }
export type Arou = { id: string; kind: ArouKind | ''; statement: string; category: string; owner: string; increment: string; transition: boolean; ai: boolean }
export type Impact = { increment: string; reached: string; notReached: string }
export type ReviewRow = { week: number; status: '' | 'ready' | 'open'; items: string; owner: string }
export type Issued = { GAP: number; INC: number; TECH: number; U: number; R: number; O: number; A: number }
export type IdPrefix = keyof Issued
export type Week6Record = {
  week5: Week5Snapshot | null
  week3: Week3Extra | null
  threePersonTeam: boolean
  horizons: Horizons
  gaps: Gap[]
  technologies: Tech[]
  increments: Increment[]
  unknowns: Unknown[]
  arou: Arou[]
  impact: Impact
  review: ReviewRow[]
  aiStatement: string
  issued: Issued
  updatedAt?: number
  exportedMdAt?: number
  exportedJsonAt?: number
}

export const EMPTY_ISSUED: Issued = { GAP: 0, INC: 0, TECH: 0, U: 0, R: 0, O: 0, A: 0 }
export const EMPTY_REVIEW = (): ReviewRow[] => REVIEW_WEEKS.map((week) => ({ week, status: '', items: '', owner: '' }))
export const EMPTY_RECORD: Week6Record = { week5: null, week3: null, threePersonTeam: false, horizons: { near: '', mid: '', far: '' }, gaps: [], technologies: [], increments: [], unknowns: [], arou: [], impact: { increment: '', reached: '', notReached: '' }, review: EMPTY_REVIEW(), aiStatement: '', issued: EMPTY_ISSUED }
export const EMPTY_GAP = (id: string): Gap => ({ id, capability: '', kind: '', horizon: '', desired: '', baseline: '', sources: '', ai: false })
export const EMPTY_TECH = (id: string): Tech => ({ id, name: '', status: '', trl: 0, basis: '', insertion: '', notInserted: '', risk: '', ai: false })
export const EMPTY_INCREMENT = (id: string, baseline = false): Increment => ({ id, baseline, name: baseline ? 'Baseline' : '', horizon: '', content: '', serves: '', trigger: '', dependencies: '', offRamp: '', approach: '', transition: '', security: '', risks: '', ai: false })
export const EMPTY_UNKNOWN = (id: string): Unknown => ({ id, name: '', tbx: '', impact: '', need: '', mitigation: '', owner: '', gates: '', ai: false })
export const EMPTY_AROU = (id: string, kind: ArouKind | '' = ''): Arou => ({ id, kind, statement: '', category: '', owner: '', increment: '', transition: false, ai: false })

// ---------------------------------------------------------------------------------------------- helpers
const pad = (n: number, w = 3) => String(n).padStart(w, '0')
const num = (id: string) => Number(id.split('-').pop()) || 0
const str = (x: unknown) => (typeof x === 'string' ? x : x === undefined || x === null ? '' : String(x))
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const objs = (x: unknown): Record<string, unknown>[] => (Array.isArray(x) ? x.filter(isObj) : [])
const oneOf = <T extends string>(x: unknown, allowed: readonly T[]): T | '' => (allowed.includes(x as T) ? (x as T) : '')
const int = (x: unknown) => (typeof x === 'number' && Number.isInteger(x) && x > 0 ? x : 0)
const upId = (x: unknown) => str(x).trim().toUpperCase()
const linkText = (x: unknown) => (Array.isArray(x) ? x.map(str).join(', ') : str(x))
export const words = (s: string) => s.split(/\s+/).filter(Boolean).length
export const duplicates = (ids: string[]) => [...new Set(ids.filter((x, i) => x && ids.indexOf(x) !== i))]
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
const HORIZON_IDS = HORIZONS.map((h) => h.id)
const STATUS_IDS = TECH_STATUSES.map((s) => s.id)
const APPROACH_IDS = APPROACHES.map((a) => a.id)
const AROU_IDS = AROU_KINDS.map((a) => a.id)

export const ID_FORMS: Record<IdPrefix, RegExp> = { GAP: /^GAP-\d{3}$/, INC: /^INC-\d{3}$/, TECH: /^TECH-\d{3}$/, U: /^U-\d{3}$/, R: /^R-\d{3}$/, O: /^O-\d{3}$/, A: /^A-\d{3}$/ }
const ANY_ID = /\b(?:REQ-(?:STK|SYS)|NEED|MGO|SCN|CAP|MOE|MOP|TPM|TECH|R|O|A|U|I|VP|FG|FN|LOG|PHY|EXT|DEC|INFO|AI|CMP|IF|ICR|GAP|INC)-\d{3}\b/g
/** The IDs written in a free-text link field, upper-cased, each once. */
export const idsIn = (s: string) => [...new Set(s.toUpperCase().match(ANY_ID) ?? [])]
type PartKey = (typeof WEEK6_PARTS)[number]['id']
export const partTitle = (id: PartKey) => WEEK6_PARTS.find((p) => p.id === id)!.title
export const partNumber = (id: PartKey) => WEEK6_PARTS.find((p) => p.id === id)!.n
export const gateShort = (list: readonly { id: string; short: string }[], id: string) => list.find((g) => g.id === id)?.short ?? id
export const ruleShort = (id: (typeof PART_RULES)[number]['id']) => PART_RULES.find((p) => p.id === id)!.short

// ---------------------------------------------------------------------------------------------- normalize
function normalizeSnapshot(v: unknown): Week5Snapshot | null {
  if (!isObj(v)) return null
  const pair = (x: Record<string, unknown>) => ({ id: upId(x.id), name: str(x.name) })
  const list = (x: unknown) => (Array.isArray(x) ? x.map(upId).filter(Boolean) : idsIn(str(x)))
  return {
    team: str(v.team), enterprise: str(v.enterprise), soi: str(v.soi),
    needs: objs(v.needs).map(pair), capabilities: objs(v.capabilities).map(pair), requirements: objs(v.requirements).map(pair),
    risks: objs(v.risks).map((x) => ({ ...pair(x), category: str(x.category) })), tpms: objs(v.tpms).map(pair),
    physical: objs(v.physical).map(pair), externals: objs(v.externals).map(pair), functions: objs(v.functions).map((x) => ({ ...pair(x), phy: upId(x.phy) })),
    information: objs(v.information).map((x) => ({ ...pair(x), producers: list(x.producers), consumers: list(x.consumers) })),
    ai: objs(v.ai).map((x) => ({ ...pair(x), host: upId(x.host) })), decisions: objs(v.decisions).map((x) => ({ id: upId(x.id), question: str(x.question) })),
    components: objs(v.components).map((x) => ({ ...pair(x), parent: upId(x.parent) })),
    interfaces: objs(v.interfaces).map((x) => ({ ...pair(x), endA: upId(x.endA), endB: upId(x.endB), standard: str(x.standard) })),
    changes: objs(v.changes).map((x) => ({ id: upId(x.id), interface: upId(x.interface), change: str(x.change) })),
    threePersonTeam: v.threePersonTeam === true, week5Status: str(v.week5Status), sourceVersion: int(v.sourceVersion),
  }
}
function normalizeWeek3(v: unknown): Week3Extra | null {
  if (!isObj(v)) return null
  const pair = (x: Record<string, unknown>) => ({ id: upId(x.id), name: str(x.name) })
  return {
    technologies: objs(v.technologies).map((x) => ({ ...pair(x), trl: Number.isInteger(x.trl) && (x.trl as number) >= 1 && (x.trl as number) <= 9 ? (x.trl as number) : 0, critical: x.critical === true })),
    objectives: objs(v.objectives).map((x) => ({ id: upId(x.id), statement: str(x.statement) })),
    unknowns: objs(v.unknowns).map(pair), assumptions: objs(v.assumptions).map(pair), opportunities: objs(v.opportunities).map(pair), enterprise: str(v.enterprise), week3Status: str(v.week3Status),
  }
}
const trlOf = (x: unknown) => (typeof x === 'number' && Number.isInteger(x) && x >= 1 && x <= 9 ? x : typeof x === 'string' && /^[1-9]$/.test(x.trim()) ? Number(x.trim()) : 0)

/** Fills missing fields of a stored or imported record. Never throws. */
export function normalizeRecord(v: unknown): Week6Record {
  const r = isObj(v) ? v : {}
  const week5 = normalizeSnapshot(r.week5)
  const h = isObj(r.horizons) ? r.horizons : {}
  const imp = isObj(r.impact) ? r.impact : {}
  const reviewIn = objs(r.review)
  const rec: Week6Record = {
    week5,
    week3: normalizeWeek3(r.week3),
    threePersonTeam: typeof r.threePersonTeam === 'boolean' ? r.threePersonTeam : (week5?.threePersonTeam ?? false),
    horizons: { near: str(h.near), mid: str(h.mid), far: str(h.far) },
    gaps: objs(r.gaps).map((x) => ({ id: upId(x.id), capability: str(x.capability), kind: oneOf(str(x.kind).trim().toLowerCase(), ['gap', 'excess'] as const), horizon: oneOf(str(x.horizon).trim().toLowerCase(), HORIZON_IDS), desired: str(x.desired), baseline: str(x.baseline), sources: linkText(x.sources), ai: x.ai === true })),
    technologies: objs(r.technologies).map((x) => ({ id: upId(x.id), name: str(x.name), status: oneOf(str(x.status).trim().toLowerCase(), STATUS_IDS), trl: trlOf(x.trl), basis: str(x.basis), insertion: upId(x.insertion), notInserted: str(x.notInserted), risk: str(x.risk), ai: x.ai === true })),
    increments: objs(r.increments).map((x) => ({
      id: upId(x.id), baseline: x.baseline === true, name: str(x.name), horizon: oneOf(str(x.horizon).trim().toLowerCase(), HORIZON_IDS), content: str(x.content), serves: linkText(x.serves), trigger: str(x.trigger), dependencies: linkText(x.dependencies),
      offRamp: str(x.offRamp), approach: oneOf(str(x.approach).trim().toLowerCase(), APPROACH_IDS), transition: str(x.transition), security: str(x.security), risks: linkText(x.risks), ai: x.ai === true,
    })),
    unknowns: objs(r.unknowns).map((x) => ({ id: upId(x.id), name: str(x.name), tbx: upId(x.tbx), impact: str(x.impact), need: str(x.need), mitigation: str(x.mitigation), owner: str(x.owner), gates: upId(x.gates), ai: x.ai === true })),
    arou: objs(r.arou).map((x) => ({ id: upId(x.id), kind: oneOf(str(x.kind).trim().toLowerCase(), AROU_IDS), statement: str(x.statement), category: oneOf(str(x.category).trim().toLowerCase(), RISK_CATEGORIES), owner: str(x.owner), increment: upId(x.increment), transition: x.transition === true, ai: x.ai === true })),
    impact: { increment: upId(imp.increment), reached: str(imp.reached), notReached: str(imp.notReached) },
    review: REVIEW_WEEKS.map((week) => {
      const x = reviewIn.find((y) => Number(y.week) === week) ?? {}
      return { week, status: oneOf(str(x.status).trim().toLowerCase(), ['ready', 'open'] as const), items: str(x.items), owner: str(x.owner) }
    }),
    aiStatement: str(r.aiStatement),
    issued: { ...EMPTY_ISSUED },
    updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : undefined,
    exportedMdAt: typeof r.exportedMdAt === 'number' ? r.exportedMdAt : undefined,
    exportedJsonAt: typeof r.exportedJsonAt === 'number' ? r.exportedJsonAt : undefined,
  }
  const issuedIn = isObj(r.issued) ? r.issued : {}
  for (const k of Object.keys(EMPTY_ISSUED) as IdPrefix[]) rec.issued[k] = Math.max(Number(issuedIn[k]) || 0, 0, ...floorIds(rec, k).map(num))
  return rec
}

/** The IDs of a prefix in the Week 6 record. */
export function idsOf(r: Week6Record, prefix: IdPrefix): string[] {
  switch (prefix) {
    case 'GAP': return r.gaps.map((x) => x.id)
    case 'INC': return r.increments.map((x) => x.id)
    case 'TECH': return r.technologies.map((x) => x.id)
    case 'U': return r.unknowns.map((x) => x.id)
    case 'R': case 'O': case 'A': return r.arou.filter((x) => x.id.startsWith(`${prefix}-`)).map((x) => x.id)
  }
}
/** IDs a new ID must come after: the record's own, plus the numbering it continues from the imported files. */
function floorIds(r: Week6Record, prefix: IdPrefix): string[] {
  const own = idsOf(r, prefix)
  const w3 = r.week3
  if (prefix === 'TECH') return [...own, ...(w3?.technologies ?? []).map((x) => x.id)]
  if (prefix === 'U') return [...own, ...(w3?.unknowns ?? []).map((x) => x.id)]
  if (prefix === 'A') return [...own, ...(w3?.assumptions ?? []).map((x) => x.id)]
  if (prefix === 'O') return [...own, ...(w3?.opportunities ?? []).map((x) => x.id)]
  if (prefix === 'R') return [...own, ...(r.week5?.risks ?? []).map((x) => x.id)]
  return own
}
/** The next ID for a prefix: one past the highest ever issued, present or imported, so a deleted ID is never reused. */
export function nextId(r: Week6Record, prefix: IdPrefix): string {
  return `${prefix}-${pad(Math.max(r.issued[prefix], 0, ...floorIds(r, prefix).map(num)) + 1)}`
}
export const withIssued = (r: Week6Record, prefix: IdPrefix, id: string): Issued => ({ ...r.issued, [prefix]: Math.max(r.issued[prefix], num(id)) })

// ---------------------------------------------------------------------------------------------- imports
/** The Week 5 snapshot kept in the Week 6 record, from a Week 5 record (read-only). */
export function snapshotOf(w: Week5Record, sourceVersion: number): Week5Snapshot {
  const w4 = w.week4
  return {
    team: (w4?.team ?? '').trim(), enterprise: (w4?.enterprise ?? '').trim(), soi: (w4?.soi ?? '').trim(),
    needs: (w4?.needs ?? []).map((x) => ({ id: x.id, name: x.name })),
    capabilities: (w4?.capabilities ?? []).map((x) => ({ id: x.id, name: x.name })),
    requirements: [...(w4?.requirements ?? []).map((x) => ({ id: x.id, name: x.name })), ...w.requirements.map((x) => ({ id: x.id, name: x.name.trim() }))],
    risks: (w4?.risks ?? []).map((x) => ({ id: x.id, name: x.name, category: x.category })),
    tpms: (w4?.tpms ?? []).map((x) => ({ id: x.id, name: x.name })),
    physical: (w4?.physical ?? []).map((x) => ({ id: x.id, name: x.name })),
    externals: [...(w4?.externals ?? []).map((x) => ({ id: x.id, name: x.name })), ...w.externals.map((x) => ({ id: x.id, name: x.name.trim() }))],
    functions: (w4?.functions ?? []).map((x) => ({ id: x.id, name: x.name, phy: x.phy })),
    information: (w4?.information ?? []).map((x) => ({ id: x.id, name: x.name, producers: x.producers, consumers: x.consumers })),
    ai: (w4?.ai ?? []).map((x) => ({ id: x.id, name: x.name, host: x.host })),
    decisions: (w4?.decisions ?? []).map((x) => ({ id: x.id, question: x.question })),
    components: w.components.map((x) => ({ id: x.id, name: x.name.trim(), parent: x.parent })),
    interfaces: w.interfaces.map((x) => ({ id: x.id, name: x.name.trim(), endA: x.endA, endB: x.endB, standard: x.standard.trim() })),
    changes: w.changes.map((x) => ({ id: x.id, interface: x.interface, change: x.change.trim() })),
    threePersonTeam: w.threePersonTeam,
    week5Status: week5State(w),
    sourceVersion,
  }
}

const EARLIER: Record<string, string> = { 'week1-model-inputs': 'Week 1', 'week2-model-inputs': 'Week 2', 'week3-model-inputs': 'Week 3', 'week4-model-inputs': 'Week 4' }

/** Reads the team's Week 5 model-inputs JSON with Week 5's own importer and returns the snapshot, or a message the
 *  student can act on. Earlier-week files, a Week 6 file and a record about AeroLink are refused. Never throws. */
export function importWeek5File(text: string): { snapshot: Week5Snapshot } | { error: string } {
  try {
    let d: unknown
    try {
      d = JSON.parse(text)
    } catch {
      return { error: 'This file is not valid JSON. Choose the Week 5 export, team-NN-week5-model-inputs.json.' }
    }
    if (isObj(d) && d.format === WEEK3_FORMAT) return { error: 'This is a Week 3 model-inputs file: load it with “Add your Week 3 record (optional)”. The Week 6 record starts from your team’s Week 5 export.' }
    if (isObj(d) && typeof d.format === 'string' && EARLIER[d.format]) return { error: `This is a ${EARLIER[d.format]} model-inputs file. The Week 6 record starts from your team’s Week 5 export (team-NN-week5-model-inputs.json).` }
    if (isObj(d) && d.format === MODEL_INPUTS_FORMAT) return { error: 'This is a Week 6 model-inputs file: use “Import a teammate’s Week 6 model-inputs file” at the top of the tool.' }
    if (!isObj(d)) return { error: `This file holds ${Array.isArray(d) ? 'a list' : 'no object'}, not a Week 5 model-inputs file. Choose team-NN-week5-model-inputs.json, exported from the Week 5 lab tool.` }
    if (d.format === undefined) return { error: 'This file has no “format”: it is not a lab-tool export. Choose team-NN-week5-model-inputs.json, exported from the Week 5 lab tool.' }
    if (d.format === SOURCE_FORMAT && typeof d.version === 'string') return { error: `This Week 5 file gives its version as text (“${d.version}”); this tool reads version 1 written as a number. Export the file again from the Week 5 lab tool.` }
    const w = importWeek5(text)
    if ('error' in w) return { error: w.error }
    if (!w.week4) return { error: 'This Week 5 record carries no Week 4 snapshot (needs, requirements, physical elements): export it again from the Week 5 lab tool after importing the Week 4 record.' }
    if ([w.week4.enterprise, w.week4.soi].some(isAeroLink)) return { error: 'This Week 5 record names AeroLink, the instructor’s worked example. Import your team’s own record.' }
    if (!w.week4.physical.length) return { error: 'This Week 5 record has no physical elements: the roadmap’s baseline starts from them, so export the record again once they are in.' }
    return { snapshot: snapshotOf(w, int(d.version)) }
  } catch (e) {
    return { error: `This file could not be read as Week 5 model inputs (${e instanceof Error ? e.message : String(e)}).` }
  }
}

/** Reads the team's optional Week 3 model-inputs JSON with Week 3's own importer. Never throws. */
export function importWeek3File(text: string): { extra: Week3Extra } | { error: string } {
  try {
    let d: unknown
    try {
      d = JSON.parse(text)
    } catch {
      return { error: 'This file is not valid JSON. Choose the Week 3 export, team-NN-week3-model-inputs.json.' }
    }
    if (isObj(d) && d.format === SOURCE_FORMAT) return { error: 'This is the Week 5 model-inputs file: load it with “Start from your Week 5 Team Record”. This field takes the optional Week 3 export.' }
    if (!isObj(d) || d.format !== WEEK3_FORMAT) return { error: `This is not a Week 3 model-inputs file (format “${WEEK3_FORMAT}”). Choose team-NN-week3-model-inputs.json, exported from the Week 3 lab tool.` }
    const w: Week3Record | { error: string } = importWeek3(text)
    if ('error' in w) return { error: w.error }
    if ([w.week2?.enterprise ?? '', w.week2?.soi ?? ''].some(isAeroLink)) return { error: 'This Week 3 record names AeroLink, the instructor’s worked example. Load your team’s own record.' }
    return {
      extra: {
        technologies: w.technologies.map((x) => ({ id: x.id, name: x.name.trim(), trl: x.trl, critical: x.critical })),
        objectives: (w.week2?.objectives ?? []).map((x) => ({ id: x.id, statement: x.statement })),
        unknowns: [...(w.week2?.unknowns ?? []).map((x) => ({ id: x.id, name: x.name })), ...w.unknowns.filter((x) => !(w.week2?.unknowns ?? []).some((y) => y.id === x.id)).map((x) => ({ id: x.id, name: x.name }))],
        assumptions: [...(w.week2?.assumptions ?? []).map((x) => ({ id: x.id, name: x.name })), ...w.assumptions.filter((x) => !(w.week2?.assumptions ?? []).some((y) => y.id === x.id)).map((x) => ({ id: x.id, name: x.name }))],
        opportunities: w.opportunities.map((x) => ({ id: x.id, name: x.name.trim() })),
        enterprise: (w.week2?.enterprise ?? '').trim(),
        week3Status: week3State(w),
      },
    }
  } catch (e) {
    return { error: `This file could not be read as Week 3 model inputs (${e instanceof Error ? e.message : String(e)}).` }
  }
}

/** Puts a Week 5 snapshot into the record, keeping the Week 6 work, and seeds the baseline increment if there is none. */
export function withWeek5(r: Week6Record, snapshot: Week5Snapshot): Week6Record {
  let next: Week6Record = { ...r, week5: snapshot, threePersonTeam: snapshot.threePersonTeam }
  if (!next.increments.some((x) => x.baseline)) {
    const id = nextId(next, 'INC')
    next = { ...next, increments: [EMPTY_INCREMENT(id, true), ...next.increments], issued: withIssued(next, 'INC', id) }
  }
  return { ...next, issued: { ...next.issued, R: Math.max(next.issued.R, ...floorIds(next, 'R').map(num), 0) } }
}
/** Adds the optional Week 3 data and continues the TECH, U and A numbering from it. */
export function withWeek3(r: Week6Record, extra: Week3Extra): Week6Record {
  const next: Week6Record = { ...r, week3: extra }
  return { ...next, issued: { ...next.issued, TECH: Math.max(next.issued.TECH, ...floorIds(next, 'TECH').map(num), 0), U: Math.max(next.issued.U, ...floorIds(next, 'U').map(num), 0), A: Math.max(next.issued.A, ...floorIds(next, 'A').map(num), 0), O: Math.max(next.issued.O, ...floorIds(next, 'O').map(num), 0) } }
}

// ---------------------------------------------------------------------------------------------- lookups
/** Every ID the record can trace to, with a name: the Week 5 snapshot, the optional Week 3 data, and the Week 6 entries. */
export function knownIds(r: Week6Record): Map<string, string> {
  const m = new Map<string, string>()
  const w = r.week5
  const add = (xs: { id: string; name?: string; question?: string; statement?: string }[]) => xs.forEach((x) => m.set(x.id, x.name ?? x.question ?? x.statement ?? ''))
  if (w) [w.needs, w.capabilities, w.requirements, w.risks, w.tpms, w.physical, w.externals, w.functions, w.information, w.ai, w.decisions, w.components, w.interfaces].forEach(add)
  if (w) w.changes.forEach((x) => m.set(x.id, x.change))
  if (r.week3) [r.week3.technologies, r.week3.objectives, r.week3.unknowns, r.week3.assumptions, r.week3.opportunities].forEach(add)
  r.gaps.forEach((x) => m.set(x.id, x.capability))
  r.technologies.forEach((x) => m.set(x.id, x.name))
  r.increments.forEach((x) => m.set(x.id, x.name))
  r.unknowns.forEach((x) => m.set(x.id, x.name))
  r.arou.forEach((x) => m.set(x.id, x.statement))
  return m
}
export const nameOf = (r: Week6Record, id: string) => knownIds(r).get(id) ?? ''
export const baselineOf = (r: Week6Record) => r.increments.find((x) => x.baseline)
export const laterIncrements = (r: Week6Record) => r.increments.filter((x) => !x.baseline)
export const incrementOf = (r: Week6Record, id: string) => r.increments.find((x) => x.id === id)
/** Technologies an increment inserts (each technology's insertion point names it). */
export const insertsOf = (r: Week6Record, incId: string) => r.technologies.filter((t) => t.insertion === incId)
export const isImmature = (t: Pick<Tech, 'status' | 'trl'>) => t.status === 'in-development' || t.status === 'not-existing' || (t.trl > 0 && t.trl < MATURE_TRL)
/** Risk categories by ID: the imported register, then the Week 6 AROU risks. */
export function riskCategory(r: Week6Record, id: string): string {
  return r.week5?.risks.find((x) => x.id === id)?.category ?? r.arou.find((x) => x.id === id && x.kind === 'risk')?.category ?? ''
}
/** Whether the record holds any team work (an import or any Week 6 entry): a teammate's file would replace it. */
export const hasWork = (r: Week6Record) => !!r.week5 || [r.gaps, r.technologies, r.unknowns, r.arou].some((x) => x.length > 0) || laterIncrements(r).length > 0 || !!r.aiStatement.trim()

// ---------------------------------------------------------------------------------------------- gates
export type Gate<T extends string = string> = { id: T; ok: boolean; message: string }
export type Advisory<T extends string = string> = { id: T; message: string }
export type Assessment<G extends string, A extends string> = { gates: Gate<G>[]; advisories: Advisory<A>[]; counts: boolean }
function collector<G extends string, A extends string>() {
  const gates: Gate<G>[] = []
  const advisories: Advisory<A>[] = []
  return {
    gate: (id: G, ok: boolean, message: string) => gates.push({ id, ok, message }),
    adv: (id: A, message: string) => advisories.push({ id, message }),
    done: (): Assessment<G, A> => ({ gates, advisories, counts: gates.every((g) => g.ok) }),
  }
}
/** A name is written and says something (one word is enough; no gate tests a name's form). "?", "n/a" and "-" are not
 *  names (review n1: the same rule as the known-unknown name). */
const filled = (s: string) => words(s) >= MIN_WORDS && said(s)
/** A free-text answer: written, and not an empty answer ("n/a", "none", "?", "-", "later", "TBD"; the shared
 *  src/workbench/emptyAnswer.ts, Week 5 confirmation N1). One word is still enough ("Cutover", "A-003", "TL"). */
const answered = (s: string) => said(s)
/** A capability level: an answer, or "TBD", "none" or "zero", which the gate text names as valid levels (a baseline can
 *  genuinely be none, and a desired level can be a TBD the unknowns record owns). */
const LEVEL_WORD = /^(?:tbd|none|nil|zero|nothing)\.?$/i
export const levelOk = (s: string) => said(s) || LEVEL_WORD.test(s.trim())
/** The security and resilience change: an answer, or a bare "None", which the gate text names as complete (the
 *  security-none advisory then asks for the reason). "n/a", "?" and "-" say nothing and fail. */
export const securityOk = (s: string) => said(s) || /^none\.?$/i.test(s.trim())
/** The failure message when an answer is written but says nothing. */
const emptyNote = (s: string) => (s.trim() && isEmptyAnswer(s) ? ` “${s.trim()}” says nothing here.` : '')
const MGO = /^MGO-\d{3}$/
/** Trace IDs that resolve in the record (an MGO ID counts as a trace even if the tool cannot check it). */
export function traceIds(r: Week6Record, text: string, kinds: RegExp): { ok: string[]; unknown: string[]; unchecked: string[] } {
  const known = knownIds(r)
  const ids = idsIn(text).filter((id) => kinds.test(id))
  const ok = ids.filter((id) => known.has(id))
  const unchecked = ids.filter((id) => !known.has(id) && MGO.test(id))
  return { ok, unchecked, unknown: ids.filter((id) => !ok.includes(id) && !unchecked.includes(id)) }
}
const SOURCE_KINDS = /^(NEED|MGO|CAP|REQ-STK|REQ-SYS)-\d{3}$/
const SERVES_KINDS = /^(GAP|NEED|MGO|CAP|REQ-STK|REQ-SYS)-\d{3}$/

export function assessGap(g: Gap, r: Week6Record): Assessment<GapGateId, never> {
  const c = collector<GapGateId, never>()
  c.gate('statement', answered(g.capability), answered(g.capability) ? `${g.capability.trim()}` : `Say what is short or in excess (one word is enough).${emptyNote(g.capability)}`)
  const levels = levelOk(g.desired) && levelOk(g.baseline)
  // review n2: "TBD" and "none" are valid levels, but a gap with NEITHER level stated compares nothing
  const oneStated = said(g.desired) || said(g.baseline)
  c.gate('levels', levels && oneStated, !levels ? `Give the desired level and the baseline level (a number, a word or “TBD” each).${emptyNote(g.desired) || emptyNote(g.baseline)}` : !oneStated ? `State at least one of the two levels: “${g.desired.trim()}” and “${g.baseline.trim()}” compare nothing.` : `Desired ${g.desired.trim()}; baseline ${g.baseline.trim()}.`)
  c.gate('kind', !!g.kind, g.kind ? `A ${g.kind}.` : 'Say whether it is a gap or an excess.')
  c.gate('horizon', !!g.horizon, g.horizon ? horizonLabel(g.horizon) : 'Choose its horizon: near, mid or far term.')
  const t = traceIds(r, g.sources, SOURCE_KINDS)
  c.gate('source', t.ok.length + t.unchecked.length > 0 && !t.unknown.length, t.unknown.length ? `${t.unknown.join(', ')} ${t.unknown.length > 1 ? 'are' : 'is'} not in the record.` : t.ok.length + t.unchecked.length ? `From ${[...t.ok, ...t.unchecked].join(', ')}.` : 'Name the need, objective, capability or requirement behind it (an ID in the record).')
  return c.done()
}

const INC_ID = /^INC-\d{3}$/
/** Horizon order for the dependency gate: the baseline first, then near, mid, far. */
const HORIZON_RANK: Record<string, number> = { near: 1, mid: 2, far: 3 }
export const horizonRank = (x: Pick<Increment, 'baseline' | 'horizon'>) => (x.baseline ? 0 : (HORIZON_RANK[x.horizon] ?? 0))
/** The dependency cycle through `startId`, as a path that starts and ends at it, or null (depth-first search over the
 *  increments' named dependencies; only IDs that are increments in the record are followed). */
export function dependencyCycle(r: Week6Record, startId: string): string[] | null {
  const deps = (id: string) => idsIn(incrementOf(r, id)?.dependencies ?? '').filter((d) => INC_ID.test(d) && !!incrementOf(r, d))
  const seen = new Set<string>()
  const walk = (id: string, path: string[]): string[] | null => {
    for (const d of deps(id)) {
      if (d === startId) return [...path, d]
      if (seen.has(d)) continue
      seen.add(d)
      const found = walk(d, [...path, d])
      if (found) return found
    }
    return null
  }
  return walk(startId, [startId])
}
export function assessTech(t: Tech, r: Week6Record): Assessment<TechGateId, TechAdvisoryId> {
  const c = collector<TechGateId, TechAdvisoryId>()
  c.gate('name', filled(t.name), filled(t.name) ? t.name.trim() : `Name the technology (one word is enough).${emptyNote(t.name)}`)
  c.gate('status', !!t.status, t.status ? techStatusLabel(t.status) : 'Choose its status: available now, in development, or does not yet exist.')
  const needsTrl = t.status !== 'not-existing'
  c.gate('trl', !needsTrl || (t.trl >= 1 && t.trl <= 9), !needsTrl ? 'No TRL needed: it does not yet exist.' : t.trl ? `TRL ${t.trl}.` : 'Choose a TRL from 1 to 9.')
  c.gate('basis', !(t.trl >= 1) || answered(t.basis), t.trl >= 1 ? (answered(t.basis) ? `Basis: ${t.basis.trim()}.` : `Give the evidence or the labeled assumption behind the TRL (an ID such as A-003 is enough).${emptyNote(t.basis)}`) : 'No TRL, so no basis needed.')
  const inc = t.insertion ? incrementOf(r, t.insertion) : undefined
  const insertionOk = (!!inc && INC_ID.test(t.insertion)) || (!t.insertion && answered(t.notInserted))
  c.gate('insertion', insertionOk, inc ? `Inserted by ${inc.id}${inc.baseline ? ' (in service at the baseline)' : ''}.` : t.insertion ? `${t.insertion} is not an increment in the record.` : answered(t.notInserted) ? `Not inserted: ${t.notInserted.trim()}.` : `Give its insertion point (an increment) or the reason it is not inserted (one word is enough).${emptyNote(t.notInserted)}`)
  const immature = isImmature(t)
  c.gate('risk', !immature || answered(t.risk), !immature ? 'Mature: no maturity risk required.' : answered(t.risk) ? `Risk or mitigation: ${t.risk.trim()}.` : `Immature: give a risk ID or a mitigation (one word is enough).${emptyNote(t.risk)}`)
  if (inc && !inc.baseline && inc.horizon === 'near' && immature) c.adv('near-immature', gateShort(TECH_ADVISORIES, 'near-immature'))
  const w3 = r.week3?.technologies.find((x) => x.id === t.id)
  if (r.week3 && t.id && !w3) c.adv('not-in-week3', gateShort(TECH_ADVISORIES, 'not-in-week3'))
  if (w3 && w3.trl && t.trl && w3.trl !== t.trl) c.adv('trl-changed', `${gateShort(TECH_ADVISORIES, 'trl-changed')} (Week 3: TRL ${w3.trl}; now ${t.trl})`)
  return c.done()
}

export function assessBaseline(x: Increment): Assessment<BaselineGateId, never> {
  const c = collector<BaselineGateId, never>()
  c.gate('content', answered(x.content), answered(x.content) ? 'The as-is is written.' : `Write the as-is baseline in a few words (one word is enough).${emptyNote(x.content)}`)
  return c.done()
}

/** An observable trigger: a number, an ID, a comparison or an event word a reviewer could check (advisory only). */
const OBSERVABLE = /\d|[<>≥≤=]|\b[A-Z]{1,4}-\d{3}\b|\b(approv|agree|sign|pass|confirm|report|test|demonstrat|reach|exceed|above|below|complete|receiv|award|grant|publish|accept)/i
export function assessIncrement(x: Increment, r: Week6Record): Assessment<IncrementGateId, IncrementAdvisoryId> {
  const c = collector<IncrementGateId, IncrementAdvisoryId>()
  c.gate('name', filled(x.name), filled(x.name) ? x.name.trim() : `Name the increment (one word is enough).${emptyNote(x.name)}`)
  c.gate('horizon', !!x.horizon, x.horizon ? horizonLabel(x.horizon) : 'Choose its horizon: near, mid or far term.')
  c.gate('content', answered(x.content), answered(x.content) ? 'Content stated.' : `Say what changes (one word is enough).${emptyNote(x.content)}`)
  const s = traceIds(r, x.serves, SERVES_KINDS)
  c.gate('serves', s.ok.length + s.unchecked.length > 0 && !s.unknown.length, s.unknown.length ? `${s.unknown.join(', ')} ${s.unknown.length > 1 ? 'are' : 'is'} not in the record.` : s.ok.length + s.unchecked.length ? `Serves ${[...s.ok, ...s.unchecked].join(', ')}.` : 'Name the gap, need or objective it serves (a GAP, NEED, MGO, CAP or REQ ID).')
  c.gate('trigger', answered(x.trigger), answered(x.trigger) ? `Starts when: ${x.trigger.trim()}.` : `Give its entry trigger: the evidence or event that starts it (one word is enough).${emptyNote(x.trigger)}`)
  c.gate('approach', !!x.approach, x.approach ? approachLabel(x.approach) : 'Choose its development approach.')
  c.gate('transition', answered(x.transition), answered(x.transition) ? `Transition: ${x.transition.trim()}.` : `Say how the service keeps operating while it changes (one word is enough: “Cutover”).${emptyNote(x.transition)}`)
  const immature = insertsOf(r, x.id).filter(isImmature)
  c.gate('off-ramp', !immature.length || answered(x.offRamp), immature.length ? (answered(x.offRamp) ? `Off-ramp: ${x.offRamp.trim()}.` : `It inserts ${immature.map((t) => t.id).join(', ')}, which is immature: name its off-ramp (one word is enough).${emptyNote(x.offRamp)}`) : 'No immature technology inserted: no off-ramp required.')
  c.gate('security', securityOk(x.security), securityOk(x.security) ? `Security and resilience: ${x.security.trim()}.` : `State its security and resilience change (one word is enough: “None”, with a reason advised).${emptyNote(x.security)}`)
  const deps = idsIn(x.dependencies)
  const badDeps = deps.filter((id) => !INC_ID.test(id) || !incrementOf(r, id) || id === x.id)
  // review Mo2: a roadmap is an order. A dependency on a later horizon, or a cycle, has no first step.
  const later = deps.filter((id) => !badDeps.includes(id) && !!x.horizon && horizonRank(incrementOf(r, id)!) > horizonRank(x))
  const cycle = badDeps.length ? null : dependencyCycle(r, x.id)
  c.gate(
    'dependencies',
    !badDeps.length && !later.length && !cycle,
    badDeps.length
      ? `${badDeps.join(', ')}: not another increment in the record.`
      : later.length
        ? `${later.join(', ')} ${later.length > 1 ? 'are' : 'is'} in a later horizon than ${x.id}: a dependency points back in time, so move one of them or drop the dependency.`
        : cycle
          ? `The dependencies form a cycle (${cycle.join(' → ')}): a roadmap is an order, and a cycle has no first step.`
          : deps.length
            ? `Depends on ${deps.join(', ')}.`
            : 'No dependencies named.',
  )
  if (answered(x.trigger) && !OBSERVABLE.test(x.trigger)) c.adv('trigger-vague', gateShort(INCREMENT_ADVISORIES, 'trigger-vague'))
  if (/^\s*none\W*$/i.test(x.security)) c.adv('security-none', gateShort(INCREMENT_ADVISORIES, 'security-none'))
  if (!immature.length && !answered(x.offRamp)) c.adv('off-ramp-mature', gateShort(INCREMENT_ADVISORIES, 'off-ramp-mature'))
  if (!idsIn(x.risks).some((id) => /^R-\d{3}$/.test(id)) && !r.arou.some((a) => a.kind === 'risk' && a.increment === x.id)) c.adv('no-risk', gateShort(INCREMENT_ADVISORIES, 'no-risk'))
  return c.done()
}

export function assessUnknown(u: Unknown, r: Week6Record): Assessment<UnknownGateId, UnknownAdvisoryId> {
  const c = collector<UnknownGateId, UnknownAdvisoryId>()
  c.gate('name', answered(u.name), answered(u.name) ? u.name.trim() : `Say what is unknown (one word is enough).${emptyNote(u.name)}`)
  c.gate('impact', answered(u.impact), answered(u.impact) ? `Impact: ${u.impact.trim()}.` : `Give its impact if it comes out badly (one word is enough).${emptyNote(u.impact)}`)
  c.gate('need', answered(u.need), answered(u.need) ? `Information needed: ${u.need.trim()}.` : `Give the information needed to close it (one word is enough).${emptyNote(u.need)}`)
  c.gate('mitigation', answered(u.mitigation), answered(u.mitigation) ? `Mitigation: ${u.mitigation.trim()}.` : `Give the mitigation while it stays open (one word is enough).${emptyNote(u.mitigation)}`)
  c.gate('owner', answered(u.owner), answered(u.owner) ? `Owner: ${u.owner.trim()}.` : `Name its owner (one word is enough).${emptyNote(u.owner)}`)
  const inc = incrementOf(r, u.gates)
  c.gate('gates', !!inc, inc ? `Gates ${inc.id}.` : u.gates ? `${u.gates} is not an increment in the record.` : 'Name the increment it gates.')
  if (inc?.baseline) c.adv('gates-baseline', gateShort(UNKNOWN_ADVISORIES, 'gates-baseline'))
  return c.done()
}

export function assessArou(a: Arou, r: Week6Record): Assessment<ArouGateId, ArouAdvisoryId> {
  const c = collector<ArouGateId, ArouAdvisoryId>()
  c.gate('statement', !!a.kind && answered(a.statement), !a.kind ? 'Choose risk, opportunity or assumption.' : answered(a.statement) ? 'Stated.' : `Say what it is (one word is enough).${emptyNote(a.statement)}`)
  c.gate('category', a.kind !== 'risk' || !!a.category, a.kind !== 'risk' ? 'Not a risk: no category needed.' : a.category ? `Category: ${a.category}.` : 'Choose the risk’s category.')
  c.gate('owner', answered(a.owner), answered(a.owner) ? `Owner: ${a.owner.trim()}.` : `Name its owner (one word is enough).${emptyNote(a.owner)}`)
  const inc = incrementOf(r, a.increment)
  c.gate('increment', !!inc, inc ? `Belongs to ${inc.id}.` : a.increment ? `${a.increment} is not an increment in the record.` : 'Name the increment it belongs to.')
  if (inc?.baseline) c.adv('belongs-baseline', gateShort(AROU_ADVISORIES, 'belongs-baseline'))
  return c.done()
}

const IMPACT_KINDS = /^(STK|CON|NEED|MGO|CAP|REQ-STK|REQ-SYS|SCN|TECH|R|A|U|O|TPM|FN|LOG|PHY|EXT|INFO|AI|DEC|CMP|IF|ICR)-\d{3}$/
export function assessImpact(r: Week6Record): Assessment<ImpactGateId, never> {
  const c = collector<ImpactGateId, never>()
  const inc = incrementOf(r, r.impact.increment)
  c.gate('increment', !!inc && !inc.baseline, inc ? (inc.baseline ? 'Choose an increment after the baseline.' : `Impact of ${inc.id}.`) : 'Choose one increment after the baseline.')
  const known = knownIds(r)
  const ids = idsIn(r.impact.reached).filter((id) => IMPACT_KINDS.test(id))
  const ok = ids.filter((id) => known.has(id))
  c.gate('ids', ok.length > 0, ok.length ? `${plural(ok.length, 'affected ID')} found in the record.` : ids.length ? `${ids.join(', ')}: not in the imported record.` : 'List at least one affected ID from your imported record.')
  return c.done()
}

/** Candidates the record's links reach from what an increment names (its content, trigger, serves, risks, security): each
 *  physical element brings its functions, components, interfaces and hosted AI; each function, component or AI its host;
 *  each interface its ends; each information item its producers and consumers. The team judges each candidate. */
export function impactCandidates(r: Week6Record, incId: string): string[] {
  const x = incrementOf(r, incId)
  const w = r.week5
  if (!x || !w) return []
  const seeds = idsIn([x.content, x.trigger, x.serves, x.risks, x.security, x.transition, ...insertsOf(r, x.id).map((t) => `${t.id} ${t.risk}`)].join(' '))
  const out = new Set<string>(seeds)
  for (const id of seeds) {
    if (id.startsWith('PHY-')) {
      w.functions.filter((f) => f.phy === id).forEach((f) => out.add(f.id))
      w.components.filter((cmp) => cmp.parent === id).forEach((cmp) => out.add(cmp.id))
      w.interfaces.filter((i) => i.endA === id || i.endB === id).forEach((i) => out.add(i.id))
      w.ai.filter((a) => a.host === id).forEach((a) => out.add(a.id))
    }
    const fn = w.functions.find((f) => f.id === id)
    if (fn?.phy) out.add(fn.phy)
    const cmp = w.components.find((c2) => c2.id === id)
    if (cmp?.parent) out.add(cmp.parent)
    const ai = w.ai.find((a) => a.id === id)
    if (ai?.host) out.add(ai.host)
    const itf = w.interfaces.find((i) => i.id === id)
    if (itf) [itf.endA, itf.endB].filter(Boolean).forEach((e) => out.add(e))
    const inf = w.information.find((i) => i.id === id)
    if (inf) [...inf.producers, ...inf.consumers].forEach((e) => out.add(e))
  }
  const known = knownIds(r)
  return [...out].filter((id) => known.has(id) && IMPACT_KINDS.test(id)).sort()
}

export function assessReviewRow(x: ReviewRow): Assessment<ReviewGateId, never> {
  const c = collector<ReviewGateId, never>()
  c.gate('status', !!x.status, x.status ? (x.status === 'ready' ? 'Ready.' : 'Open items.') : 'Say ready, or open items.')
  c.gate('items', x.status !== 'open' || (answered(x.items) && answered(x.owner)), x.status !== 'open' ? 'No open items.' : answered(x.items) && answered(x.owner) ? `Open: ${x.items.trim()} (owner: ${x.owner.trim()}).` : `Name each open item and who closes it (one word each is enough).${emptyNote(x.items) || emptyNote(x.owner)}`)
  return c.done()
}

// ---------------------------------------------------------------------------------------------- part checks
export type PartCheck = { ok: boolean; issues: string[]; detail: string; notes?: string[] }
const result = (issues: string[], okDetail: string, notes: string[] = []): PartCheck => ({ ok: issues.length === 0, issues, detail: issues.length ? issues[0] + (issues.length > 1 ? ` (+${issues.length - 1} more)` : '') : okDetail, notes })
const three = (r: Week6Record) => (r.threePersonTeam ? ' (three-person team minimum, pending faculty approval)' : '')
const failed = <G extends string>(id: string, a: Assessment<G, string>, list: readonly { id: string; short: string }[]) => {
  const f = a.gates.filter((g) => !g.ok)
  return f.length ? `${id} does not count: ${gateShort(list, f[0].id)} (${f[0].message})${f.length > 1 ? ` (+${f.length - 1} more)` : ''}` : ''
}
const aeroIssue = (id: string, text: string) => (isAeroLink(text) ? `${id} names AeroLink, the instructor’s worked example: describe your own enterprise.` : '')

export function checkImport(r: Week6Record): PartCheck {
  const w = r.week5
  if (!w) return result(['Import your team’s Week 5 model-inputs file (team-NN-week5-model-inputs.json): the roadmap’s baseline and every trace start from it.'], '')
  const issues: string[] = []
  const notes: string[] = []
  if ([w.enterprise, w.soi].some(isAeroLink)) issues.push('The imported record names AeroLink, the instructor’s worked example: import your team’s own Week 5 record.')
  if (w.week5Status && w.week5Status !== 'ready') notes.push('The Week 5 record was exported as “not ready”. Correct it first where the feedback asks, then import it again.')
  if (!r.week3) notes.push(`Advisory: ${ruleShort('no-week3')}.`)
  else if (r.week3.enterprise && w.enterprise && r.week3.enterprise.trim().toLowerCase() !== w.enterprise.trim().toLowerCase()) notes.push(`Advisory: the Week 3 file is about “${r.week3.enterprise}”, the Week 5 file about “${w.enterprise}”: check that both are your team’s.`)
  return result(issues, `${w.enterprise}: ${plural(w.needs.length, 'need')}, ${plural(w.requirements.length, 'requirement')}, ${plural(w.risks.length, 'risk')}, ${plural(w.physical.length, 'physical element')}, ${plural(w.interfaces.length, 'interface')} from Week 5${r.week3 ? `; ${plural(r.week3.technologies.length, 'technology', 'technologies')} from Week 3` : ''}.`, notes)
}

export function checkGapsPart(r: Week6Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  const missing = HORIZONS.filter((h) => !answered(r.horizons[h.id])).map((h) => h.label.toLowerCase())
  if (missing.length) issues.push(`State the length of the ${missing.join(', ')} horizon${missing.length > 1 ? 's' : ''} (a word or a range is enough: “2 years”).`)
  const base = baselineOf(r)
  if (!base) issues.push('The baseline increment is missing: import the Week 5 record, or mark one increment as the baseline.')
  else {
    const m = failed(base.id, assessBaseline(base), BASELINE_GATES)
    if (m) issues.push(m.replace('does not count', 'is incomplete'))
  }
  const dup = duplicates(r.gaps.map((g) => g.id))
  if (dup.length) issues.push(`Duplicate ID ${dup.join(', ')}: each ID once.`)
  for (const g of r.gaps) {
    const m = failed(g.id, assessGap(g, r), GAP_GATES)
    if (m) issues.push(m)
    const a = aeroIssue(g.id, `${g.capability} ${g.desired} ${g.baseline}`)
    if (a) issues.push(a)
  }
  const counting = r.gaps.filter((g) => !dup.includes(g.id) && assessGap(g, r).counts)
  if (counting.length < min.gaps) issues.push(`At least ${min.gaps} gaps or excesses that pass every hard gate${three(r)} (${counting.length} so far).`)
  if (r.gaps.length && !r.gaps.some((g) => g.kind === 'excess')) notes.push(`Advisory: ${ruleShort('no-excess')}.`)
  const unchecked = [...new Set(r.gaps.flatMap((g) => traceIds(r, g.sources, SOURCE_KINDS).unchecked))]
  if (unchecked.length) notes.push(`Advisory: ${unchecked.join(', ')} accepted as objectives; load your Week 3 file so the tool can check them.`)
  return result(issues, `${plural(counting.length, 'entry', 'entries')} count (${plural(counting.filter((g) => g.kind === 'gap').length, 'gap')}, ${plural(counting.filter((g) => g.kind === 'excess').length, 'excess', 'excesses')}); horizons ${HORIZONS.map((h) => `${h.label.toLowerCase()} ${r.horizons[h.id].trim()}`).join(', ')}.`, notes)
}

export function checkTechnologyPart(r: Week6Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  const dup = duplicates(r.technologies.map((t) => t.id))
  if (dup.length) issues.push(`Duplicate ID ${dup.join(', ')}: each ID once.`)
  const badId = r.technologies.filter((t) => !ID_FORMS.TECH.test(t.id)).map((t) => t.id || '(empty)')
  if (badId.length) issues.push(`${badId.join(', ')}: a technology ID looks like TECH-001.`)
  for (const t of r.technologies) {
    const a = assessTech(t, r)
    const m = failed(t.id, a, TECH_GATES)
    if (m) issues.push(m)
    for (const y of a.advisories) notes.push(`${t.id}: advisory, ${y.message}`)
    const ae = aeroIssue(t.id, t.name)
    if (ae) issues.push(ae)
  }
  const counting = r.technologies.filter((t) => !dup.includes(t.id) && ID_FORMS.TECH.test(t.id) && assessTech(t, r).counts)
  if (counting.length < min.technologies) issues.push(`At least ${min.technologies} technologies that pass every hard gate${three(r)} (${counting.length} so far).`)
  const inserted = counting.filter((t) => { const inc = incrementOf(r, t.insertion); return !!inc && !inc.baseline })
  if (!inserted.length) issues.push(`${ruleShort('insertion')[0].toUpperCase()}${ruleShort('insertion').slice(1)} (none so far).`)
  return result(issues, `${plural(counting.length, 'technology', 'technologies')} count; ${inserted.map((t) => `${t.id} → ${t.insertion}`).join(', ')} inserted.`, notes)
}

export function checkIncrementsPart(r: Week6Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  const bases = r.increments.filter((x) => x.baseline)
  if (bases.length !== 1) issues.push(`${ruleShort('baseline')[0].toUpperCase()}${ruleShort('baseline').slice(1)} (${bases.length} marked).`)
  const dup = duplicates(r.increments.map((x) => x.id))
  if (dup.length) issues.push(`Duplicate ID ${dup.join(', ')}: each ID once.`)
  for (const x of laterIncrements(r)) {
    const a = assessIncrement(x, r)
    const m = failed(x.id, a, INCREMENT_GATES)
    if (m) issues.push(m)
    for (const y of a.advisories) notes.push(`${x.id}: advisory, ${y.message}`)
    const ae = aeroIssue(x.id, `${x.name} ${x.content}`)
    if (ae) issues.push(ae)
  }
  const counting = laterIncrements(r).filter((x) => !dup.includes(x.id) && assessIncrement(x, r).counts)
  const total = counting.length + (bases.length === 1 && assessBaseline(bases[0]).counts ? 1 : 0)
  if (total < min.increments) issues.push(`At least ${min.increments} increments counting the baseline, each passing every hard gate${three(r)} (${total} so far).`)
  if (counting.length && !counting.some((x) => x.horizon === 'mid' || x.horizon === 'far')) issues.push(`${ruleShort('beyond-near')[0].toUpperCase()}${ruleShort('beyond-near').slice(1)} (none so far).`)
  for (const h of HORIZONS) if (counting.length && !counting.some((x) => x.horizon === h.id)) notes.push(`Advisory: ${h.label.toLowerCase()}: ${ruleShort('horizon-empty')}.`)
  return result(issues, `${plural(total, 'increment')} count, the baseline included (${HORIZONS.map((h) => `${counting.filter((x) => x.horizon === h.id).length} ${h.label.toLowerCase()}`).join(', ')}).`, notes)
}

/** Security or resilience risks linked to an increment: through an increment's risk IDs, or an AROU risk naming it. */
export function securityLinks(r: Week6Record): string[] {
  const viaIncrements = r.increments.flatMap((x) => idsIn(x.risks).filter((id) => SECURITY_OR_RESILIENCE.test(riskCategory(r, id))))
  const viaArou = r.arou.filter((a) => a.kind === 'risk' && SECURITY_OR_RESILIENCE.test(a.category) && !!incrementOf(r, a.increment)).map((a) => a.id)
  return [...new Set([...viaIncrements, ...viaArou])].sort()
}
export const transitionRisks = (r: Week6Record) => r.arou.filter((a) => a.kind === 'risk' && a.transition && !!incrementOf(r, a.increment) && !incrementOf(r, a.increment)!.baseline && assessArou(a, r).counts).map((a) => a.id)

export function checkUnknownsPart(r: Week6Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  const dup = duplicates([...r.unknowns.map((u) => u.id), ...r.arou.map((a) => a.id)])
  if (dup.length) issues.push(`Duplicate ID ${dup.join(', ')}: each ID once.`)
  const badU = r.unknowns.filter((u) => !ID_FORMS.U.test(u.id)).map((u) => u.id || '(empty)')
  if (badU.length) issues.push(`${badU.join(', ')}: a known-unknown ID looks like U-001.`)
  const badA = r.arou.filter((a) => !/^(R|O|A)-\d{3}$/.test(a.id) || (a.kind && a.id[0] !== { risk: 'R', opportunity: 'O', assumption: 'A' }[a.kind])).map((a) => a.id || '(empty)')
  if (badA.length) issues.push(`${badA.join(', ')}: an AROU ID looks like R-001, O-001 or A-001, matching its kind.`)
  for (const u of r.unknowns) {
    const au = assessUnknown(u, r)
    const m = failed(u.id, au, UNKNOWN_GATES)
    if (m) issues.push(m)
    for (const y of au.advisories) notes.push(`${u.id}: advisory, ${y.message}`)
  }
  for (const a of r.arou) {
    const aa = assessArou(a, r)
    const m = failed(a.id, aa, AROU_GATES)
    if (m) issues.push(m)
    for (const y of aa.advisories) notes.push(`${a.id}: advisory, ${y.message}`)
  }
  const unknowns = r.unknowns.filter((u) => !dup.includes(u.id) && ID_FORMS.U.test(u.id) && assessUnknown(u, r).counts)
  if (unknowns.length < min.unknowns) issues.push(`At least ${min.unknowns} known unknowns that pass every hard gate${three(r)} (${unknowns.length} so far).`)
  const arou = r.arou.filter((a) => !dup.includes(a.id) && assessArou(a, r).counts)
  if (arou.length < min.arou) issues.push(`At least ${min.arou} new or changed AROU item linked to an increment (${arou.length} so far).`)
  const links = securityLinks(r)
  if (!links.length) issues.push(`${ruleShort('security-link')[0].toUpperCase()}${ruleShort('security-link').slice(1)} (none so far).`)
  const tr = transitionRisks(r)
  if (!tr.length) issues.push(`${ruleShort('transition-risk')[0].toUpperCase()}${ruleShort('transition-risk').slice(1)} (none so far: tick “exists only while the change is being made” on a risk).`)
  const unknownRisk = r.increments.flatMap((x) => idsIn(x.risks).filter((id) => id.startsWith('R-') && !riskCategory(r, id)).map((id) => `${x.id}: ${id}`))
  if (unknownRisk.length) notes.push(`Risk IDs not in the register or the AROU update: ${unknownRisk.join('; ')}.`)
  return result(issues, `${plural(unknowns.length, 'known unknown')}; ${plural(arou.length, 'AROU item')}; security or resilience risks linked: ${links.join(', ')}; transition risks: ${tr.join(', ')}.`, notes)
}

export function checkReviewPart(r: Week6Record): PartCheck {
  const issues: string[] = []
  const notes: string[] = []
  const m = failed('The impact list', assessImpact(r), IMPACT_GATES)
  if (m) issues.push(m.replace('does not count', 'is incomplete'))
  const cands = impactCandidates(r, r.impact.increment)
  const judged = new Set([...idsIn(r.impact.reached), ...idsIn(r.impact.notReached)])
  const open = cands.filter((id) => !judged.has(id))
  if (open.length) notes.push(`Advisory: candidates the links reach that are not judged yet: ${open.join(', ')}. Put each under “reached” or “not reached”.`)
  for (const row of r.review) {
    const mm = failed(`Week ${row.week}`, assessReviewRow(row), REVIEW_GATES)
    if (mm) issues.push(mm.replace('does not count', 'is not reviewed'))
  }
  const all = [...r.gaps.map((x) => x.id), ...r.technologies.map((x) => x.id), ...r.increments.map((x) => x.id), ...r.unknowns.map((x) => x.id), ...r.arou.map((x) => x.id)]
  const dup = duplicates(all)
  if (dup.length) issues.push(`${ruleShort('unique-ids')[0].toUpperCase()}${ruleShort('unique-ids').slice(1)}: ${dup.join(', ')} appears more than once.`)
  return result(issues, `Impact of ${r.impact.increment}: ${plural(idsIn(r.impact.reached).length, 'ID')} reached; baseline review: ${r.review.filter((x) => x.status === 'ready').length} ready, ${r.review.filter((x) => x.status === 'open').length} with open items.`, notes)
}

export function checkAiStatement(r: Week6Record): PartCheck {
  const n = words(r.aiStatement)
  return result(n >= MIN_AI_WORDS ? [] : [`Write the AI usage statement for the Week 6 work (at least ${MIN_AI_WORDS} words, ${n} so far): tool, purpose, prompts, what you accepted or rejected and why, with AI-suggested items tagged; or say that no AI tool was used.`], 'AI usage statement recorded.')
}

export type PartId = 'import' | PartKey | 'ai'
export const WEEK6_PART_IDS: PartId[] = ['import', ...WEEK6_PARTS.map((p) => p.id), 'ai']
export function allChecks(r: Week6Record): Record<PartId, PartCheck> {
  return { import: checkImport(r), gaps: checkGapsPart(r), technology: checkTechnologyPart(r), increments: checkIncrementsPart(r), unknowns: checkUnknownsPart(r), review: checkReviewPart(r), ai: checkAiStatement(r) }
}
export type RecordState = 'not-ready' | 'ready'
export const recordState = (r: Week6Record): RecordState => (Object.values(allChecks(r)).every((c) => c.ok) ? 'ready' : 'not-ready')

// ---------------------------------------------------------------------------------------------- roadmap grid
/** The roadmap grid: one column per horizon (the baseline first), the increments in each, with their triggers and the
 *  technologies they insert. The text equivalent of the team's roadmap graphic. */
export function roadmapGrid(r: Week6Record) {
  const base = baselineOf(r)
  const col = (h: HorizonId | 'baseline') => {
    const xs = h === 'baseline' ? (base ? [base] : []) : laterIncrements(r).filter((x) => x.horizon === h)
    return xs.map((x) => ({ id: x.id, name: x.name.trim(), trigger: x.trigger.trim(), inserts: insertsOf(r, x.id).map((t) => t.id), dependencies: idsIn(x.dependencies), dashed: insertsOf(r, x.id).some(isImmature) }))
  }
  return [
    { horizon: 'baseline' as const, label: 'Baseline (as is)', length: '', increments: col('baseline') },
    ...HORIZONS.map((h) => ({ horizon: h.id, label: h.label, length: r.horizons[h.id].trim(), increments: col(h.id) })),
  ]
}

// ---------------------------------------------------------------------------------------------- Markdown
const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n+/g, '; ').trim()
export const fileStem = (r: Week6Record) => `team-${(r.week5?.team || 'NN').replace(/[^\w-]+/g, '') || 'NN'}-week6`
const gateText = (a: { counts: boolean; gates: { id: string; ok: boolean }[]; advisories: { id: string }[] }) => `${a.counts ? 'all pass' : `fails ${a.gates.filter((g) => !g.ok).map((g) => g.id).join(', ')}`}${a.advisories.length ? `; advisory: ${a.advisories.map((x) => x.id).join(', ')}` : ''}`

export function recordMarkdown(r: Week6Record, today = new Date().toISOString().slice(0, 10)): string {
  const w = r.week5
  const checks = allChecks(r)
  const base = baselineOf(r)
  const L: string[] = [
    `# Week 6 Team Record: ${cell(w?.enterprise ?? '') || '(Week 5 record not imported)'}`,
    '',
    `Team: ${cell(w?.team ?? '') || '____'} · Exported from the Week 6 lab tool, ${today}. Extends the Week 5 Team Record.`,
    '',
    `**Record status:** ${recordState(r) === 'ready' ? 'complete: every part passes its checks' : `not ready: ${Object.entries(checks).filter(([, x]) => !x.ok).length} part(s) still incomplete`}.${r.threePersonTeam ? ' Three-person team: reduced minimums (pending faculty approval).' : ''}`,
    '',
    '## 6. AI usage statement (updated)',
    '',
    r.aiStatement.trim() || '_Not written yet._',
    '',
  ]
  const tagged = [...r.gaps, ...r.technologies, ...r.increments, ...r.unknowns, ...r.arou].filter((x) => x.ai).map((x) => x.id)
  if (tagged.length) L.push(`AI-suggested, reviewed by the team: ${tagged.join(', ')}.`, '')
  // Part 23
  L.push(`## ${partNumber('gaps')}. ${partTitle('gaps')}`, '', `- Horizons: ${HORIZONS.map((h) => `${h.label.toLowerCase()} ${cell(r.horizons[h.id]) || '____'}`).join('; ')}`, `- Baseline (${base?.id ?? '____'}): ${cell(base?.content ?? '') || '____'}`, '')
  L.push('| ID | Kind | Horizon | Capability | Desired | Baseline | From | Checks |', '|---|---|---|---|---|---|---|---|')
  for (const g of r.gaps) L.push(`| ${g.id} | ${g.kind} | ${g.horizon ? horizonLabel(g.horizon) : ''} | ${cell(g.capability)}${g.ai ? ' (AI-suggested, reviewed)' : ''} | ${cell(g.desired)} | ${cell(g.baseline)} | ${idsIn(g.sources).join(', ')} | ${gateText(assessGap(g, r))} |`)
  // Part 24
  L.push('', `## ${partNumber('technology')}. ${partTitle('technology')}`, '', '| ID | Technology | Status | TRL | Basis | Insertion point | Risk or mitigation | Checks |', '|---|---|---|---|---|---|---|---|')
  for (const t of r.technologies) L.push(`| ${t.id} | ${cell(t.name)}${t.ai ? ' (AI-suggested, reviewed)' : ''} | ${t.status ? techStatusLabel(t.status) : ''} | ${t.trl || '—'} | ${cell(t.basis)} | ${t.insertion || (t.notInserted.trim() ? `not inserted: ${cell(t.notInserted)}` : '')} | ${cell(t.risk)} | ${gateText(assessTech(t, r))} |`)
  // Part 25
  L.push('', `## ${partNumber('increments')}. ${partTitle('increments')}`, '', '| ID | Increment | Horizon | Content | Serves | Entry trigger | Depends on | Off-ramp | Approach | Transition | Security and resilience | Risks | Checks |', '|---|---|---|---|---|---|---|---|---|---|---|---|---|')
  for (const x of r.increments) {
    if (x.baseline) L.push(`| ${x.id} | ${cell(x.name)} (baseline) | as is | ${cell(x.content)} | | | | | | | | | ${gateText(assessBaseline(x))} |`)
    else L.push(`| ${x.id} | ${cell(x.name)}${x.ai ? ' (AI-suggested, reviewed)' : ''} | ${x.horizon ? horizonLabel(x.horizon) : ''} | ${cell(x.content)} | ${idsIn(x.serves).join(', ')} | ${cell(x.trigger)} | ${idsIn(x.dependencies).join(', ')} | ${cell(x.offRamp)} | ${x.approach ? approachLabel(x.approach) : ''} | ${cell(x.transition)} | ${cell(x.security)} | ${idsIn(x.risks).join(', ')} | ${gateText(assessIncrement(x, r))} |`)
  }
  L.push('', '### Roadmap grid (text equivalent of the roadmap graphic)', '', '| Horizon | Length | Increments, each with its entry trigger and the technologies it inserts |', '|---|---|---|')
  for (const c of roadmapGrid(r)) L.push(`| ${c.label} | ${cell(c.length)} | ${c.increments.map((x) => `${x.id} ${cell(x.name)}${x.trigger ? `, starts when ${cell(x.trigger)}` : ''}${x.inserts.length ? `, inserts ${x.inserts.join(', ')}` : ''}${x.dependencies.length ? `, after ${x.dependencies.join(', ')}` : ''}${x.dashed ? ' (immature technology: dashed)' : ''}`).join('; ') || '—'} |`)
  // Part 26
  L.push('', `## ${partNumber('unknowns')}. ${partTitle('unknowns')}`, '', '| ID | Unknown | TBX | Impact | Information needed | Mitigation | Owner | Gates | Checks |', '|---|---|---|---|---|---|---|---|---|')
  for (const u of r.unknowns) L.push(`| ${u.id} | ${cell(u.name)}${u.ai ? ' (AI-suggested, reviewed)' : ''} | ${u.tbx} | ${cell(u.impact)} | ${cell(u.need)} | ${cell(u.mitigation)} | ${cell(u.owner)} | ${u.gates} | ${gateText(assessUnknown(u, r))} |`)
  L.push('', '| ID | Kind | Statement | Category | Owner | Increment | Transition risk | Checks |', '|---|---|---|---|---|---|---|---|')
  for (const a of r.arou) L.push(`| ${a.id} | ${a.kind} | ${cell(a.statement)} | ${a.category} | ${cell(a.owner)} | ${a.increment} | ${a.transition ? 'yes' : ''} | ${gateText(assessArou(a, r))} |`)
  L.push('', `Security or resilience risks linked to increments: ${securityLinks(r).join(', ') || 'none'}. Transition risks: ${transitionRisks(r).join(', ') || 'none'}.`, '')
  // Part 27
  L.push(`## ${partNumber('review')}. ${partTitle('review')}`, '', `### Impact of ${r.impact.increment || '____'}`, '', `- Candidates the record’s links reach: ${impactCandidates(r, r.impact.increment).join(', ') || 'none'}`, `- Reached: ${cell(r.impact.reached) || '____'}`, `- Not reached: ${cell(r.impact.notReached) || '—'}`, `- Checks: ${gateText(assessImpact(r))}`, '')
  L.push('### Phase I baseline review (for Week 7)', '', '| Week | Status | Open items | Owner |', '|---|---|---|---|', ...r.review.map((x) => `| Week ${x.week} | ${x.status === 'open' ? 'open items' : x.status} | ${cell(x.items)} | ${cell(x.owner)} |`), '')
  L.push('## Part checks', '', ...Object.entries(checks).map(([k, c]) => `- ${c.ok ? 'pass' : 'open'}: ${k} (${cell(c.detail)})`), '')
  return L.join('\n')
}

// ---------------------------------------------------------------------------------------------- JSON model inputs
/** The canonical artifact type each kind of entry maps to (CANONICAL_ENGINEERING_DATA_MODEL.md §2.1, §5), and the SysML v2
 *  construct a later week may seed (named only). */
export const ARTIFACT_TYPES = {
  increment: 'INC',
  technology: 'TECH',
  unknown: 'U',
  risk: 'R',
  opportunity: 'O',
  assumption: 'A',
  gap: 'GAP (proposed nested row of the roadmap; no canonical artifact type yet)',
} as const
/** The typed relationships the record implies, for the My Project adapter (vocabulary of src/project/model). */
export function relationships(r: Week6Record): { from: string; type: 'precedes' | 'delivers' | 'affects'; to: string }[] {
  const out: { from: string; type: 'precedes' | 'delivers' | 'affects'; to: string }[] = []
  for (const x of r.increments) {
    // only a later increment's dependencies that pass the gate become "precedes" relations (review Mo2); the baseline has
    // none (confirmation N5: an imported baseline with dependencies would otherwise export them unchecked)
    const depsOk = !x.baseline && !!assessIncrement(x, r).gates.find((g) => g.id === 'dependencies')?.ok
    if (depsOk) for (const d of idsIn(x.dependencies).filter((id) => incrementOf(r, id))) out.push({ from: d, type: 'precedes', to: x.id })
    for (const id of idsIn(x.serves).filter((i) => /^(CAP|REQ-STK|REQ-SYS)-/.test(i))) out.push({ from: x.id, type: 'delivers', to: id })
    for (const id of idsIn(x.risks).filter((i) => i.startsWith('R-'))) out.push({ from: id, type: 'affects', to: x.id })
  }
  for (const t of r.technologies) if (incrementOf(r, t.insertion)) out.push({ from: t.insertion, type: 'delivers', to: t.id })
  for (const u of r.unknowns) if (incrementOf(r, u.gates)) out.push({ from: u.id, type: 'affects', to: u.gates })
  for (const a of r.arou) if (incrementOf(r, a.increment)) out.push({ from: a.id, type: 'affects', to: a.increment })
  const key = (x: { from: string; type: string; to: string }) => `${x.from}|${x.type}|${x.to}`
  return out.filter((x, i) => out.findIndex((y) => key(y) === key(x)) === i)
}

export function modelInputs(r: Week6Record) {
  const checks = allChecks(r)
  const gates = (a: { counts: boolean; gates: { id: string; ok: boolean }[]; advisories: { id: string }[] }) => ({ counts: a.counts, gatesFailed: a.gates.filter((g) => !g.ok).map((g) => g.id), advisories: a.advisories.map((g) => g.id) })
  return {
    format: MODEL_INPUTS_FORMAT,
    version: MODEL_INPUTS_VERSION,
    team: r.week5?.team ?? '',
    status: recordState(r),
    threePersonTeam: r.threePersonTeam,
    week5: r.week5,
    week3: r.week3,
    horizons: r.horizons,
    gaps: r.gaps.map((g) => ({ ...g, sources: idsIn(g.sources), artifactType: ARTIFACT_TYPES.gap, ...gates(assessGap(g, r)) })),
    technologies: r.technologies.map((t) => ({ ...t, artifactType: ARTIFACT_TYPES.technology, immature: isImmature(t), ...gates(assessTech(t, r)) })),
    increments: r.increments.map((x) => ({
      ...x, serves: idsIn(x.serves), dependencies: idsIn(x.dependencies), risks: idsIn(x.risks), inserts: insertsOf(r, x.id).map((t) => t.id), artifactType: ARTIFACT_TYPES.increment,
      ...(x.baseline ? gates(assessBaseline(x)) : gates(assessIncrement(x, r))),
    })),
    unknowns: r.unknowns.map((u) => ({ ...u, artifactType: ARTIFACT_TYPES.unknown, ...gates(assessUnknown(u, r)) })),
    arou: r.arou.map((a) => ({ ...a, artifactType: a.kind ? ARTIFACT_TYPES[a.kind] : '', ...gates(assessArou(a, r)) })),
    impact: { ...r.impact, reached: idsIn(r.impact.reached), notReached: idsIn(r.impact.notReached), candidates: impactCandidates(r, r.impact.increment), ...gates(assessImpact(r)) },
    review: r.review,
    roadmap: roadmapGrid(r),
    relationships: relationships(r),
    securityLinks: securityLinks(r),
    transitionRisks: transitionRisks(r),
    aiStatement: r.aiStatement.trim(),
    checks: { parts: Object.fromEntries(Object.entries(checks).map(([k, x]) => [k, { ok: x.ok, issues: x.issues.length }])) },
    issued: r.issued,
  }
}

// ---------------------------------------------------------------------------------------------- import (teammate share)
const kindOf = (x: unknown) => (x === null ? 'null' : Array.isArray(x) ? 'a list' : typeof x === 'object' ? 'an object' : typeof x === 'string' ? 'text' : typeof x)

/** Reads a Week 6 model-inputs JSON file (a teammate's export) back into a record. Never throws. */
export function importWeek6(text: string): Week6Record | { error: string } {
  try {
    return importUnsafe(text)
  } catch (e) {
    return { error: `This file could not be read as Week 6 model inputs (${e instanceof Error ? e.message : String(e)}).` }
  }
}

function importUnsafe(text: string): Week6Record | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON. Choose a teammate’s team-NN-week6-model-inputs.json.' }
  }
  if (isObj(d) && d.format === SOURCE_FORMAT) return { error: 'This is a Week 5 model-inputs file: use “Start from your Week 5 Team Record” to start the Week 6 record from it.' }
  if (isObj(d) && (d.format === WEEK3_FORMAT || (typeof d.format === 'string' && EARLIER[d.format]))) return { error: `This is a ${EARLIER[str(d.format)] ?? 'Week 3'} model-inputs file: the Week 6 record starts from your team’s Week 5 export, and a teammate shares a Week 6 export.` }
  if (!isObj(d)) return { error: `This file holds ${kindOf(d)}, not a Week 6 model-inputs file (format “${MODEL_INPUTS_FORMAT}”).` }
  if (d.format !== MODEL_INPUTS_FORMAT) return { error: d.format === undefined ? 'This file has no “format”: it is not a lab-tool export. Ask your teammate for team-NN-week6-model-inputs.json.' : `This is not a Week 6 model-inputs file (format “${MODEL_INPUTS_FORMAT}”; this file says ${JSON.stringify(d.format)}).` }
  if (typeof d.version === 'string') return { error: `This Week 6 file gives its version as text (“${d.version}”); this tool reads version ${MODEL_INPUTS_VERSION} written as a number. Ask your teammate to export again.` }
  if (d.version !== MODEL_INPUTS_VERSION) return { error: `This Week 6 file has version ${JSON.stringify(d.version)}; this tool reads version ${MODEL_INPUTS_VERSION}.` }
  for (const path of ['gaps', 'technologies', 'increments', 'unknowns', 'arou', 'review'] as const) {
    const x = d[path]
    if (x === undefined) continue
    if (!Array.isArray(x)) return { error: `“${path}” must be a list; this file has ${kindOf(x)}.` }
    const bad = x.findIndex((y) => !isObj(y))
    if (bad >= 0) return { error: `“${path}” item ${bad + 1} is ${kindOf(x[bad])}, not an object.` }
  }
  if (d.week5 !== undefined && d.week5 !== null && !isObj(d.week5)) return { error: `“week5” must be an object; this file has ${kindOf(d.week5)}.` }
  const w5 = isObj(d.week5) ? d.week5 : undefined
  if (w5 && (isAeroLink(str(w5.enterprise)) || isAeroLink(str(w5.soi)))) return { error: 'This file is about AeroLink, the instructor’s worked example: import your team’s own record.' }
  const rec = normalizeRecord(d)
  for (const prefix of ['GAP', 'INC'] as const) {
    const ids = idsOf(rec, prefix)
    const bad = ids.filter((id) => !ID_FORMS[prefix].test(id))
    if (bad.length) return { error: `Unexpected ${prefix} IDs in the file: ${bad.slice(0, 3).map((x) => x || '(empty)').join(', ')}. IDs look like ${prefix}-001.` }
    const dup = duplicates(ids)
    if (dup.length) return { error: `Duplicate ID ${dup[0]} in the file: each ID once. Fix the file, or ask the teammate who exported it to export again.` }
  }
  return rec
}
