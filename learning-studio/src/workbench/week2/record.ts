// Week 2 Team Record (pure logic, no React): the team's own ConOps, operational scenarios, discovery log and uncertainty
// register, capabilities with the needs × scenarios coverage, stakeholder and system requirements, the trace audit and
// the measures (Parts 7–11), plus the updated Parts 5–6 (needs added by discovery, AI usage statement). The record
// EXTENDS the team's Week 1 Team Record: it is started from the Week 1 model-inputs JSON (read with Week 1's
// importModelInputs, read-only) and keeps a snapshot of the Week 1 items it traces to.
//
// Single sources: every minimum, scenario kind, requirement type, verification method, hard gate and advisory is read
// from src/content/lectures/week02/labBrief.ts (same ids, same labels), so the lecture and the tool agree. Text
// heuristics are reused from src/activities/week04/quality.ts where their meaning matches; a quality.ts "fail" becomes a
// hard gate here only when it corresponds to a REQ_HARD_GATES id (its vague-word check, for example, is advisory, except
// for the narrow UNMEASURABLE_TERMS list, which blocks when no bounded value or TBD/TBR defines the word: review M4).
//
// Patterns mirror src/workbench/week1/team.ts: normalize never throws, IDs are issued by the tool and never reused after
// deletion, checks return { ok, issues, detail }, Markdown + JSON export with format/version, import with clear
// messages. record.test.ts tests every gate in both directions (good input accepted, bad input rejected).
// AeroLink is the instructor's worked example: a record about AeroLink is refused (Week 1's isAeroLink).
import { ownerProblem } from '../../components/ProvenanceOwnerFields'
import { checkRequirement as qualityChecks, restatementRatio, subjectOf, vagueTermsIn } from '../../activities/week04/quality'
import {
  AUDIT_DISPOSITION_TEXT, LAB2_MINIMUMS, LAB2_MINIMUMS_THREE, REQUIRED_KINDS, REQUIRED_KINDS_THREE, REQ_ADVISORIES, REQ_HARD_GATES, REQ_TYPES, SCENARIO_KINDS, UNMEASURABLE_TERMS, VER_METHODS, WEEK2_PARTS,
  type Lab2Minimums, type ReqAdvisoryId, type ReqGateId, type ReqTypeId, type ScenarioKindId, type VerMethodId,
} from '../../content/lectures/week02/labBrief'
import { importModelInputs, isAeroLink, MISSION_ID, proposalNamesAeroLink, type TeamRecord } from '../week1/team'
import { EMPTY_ANSWER } from '../emptyAnswer'

export const W2_KEY = 'w2.record'
export const MODEL_INPUTS_FORMAT = 'week2-model-inputs'
export const MODEL_INPUTS_VERSION = 1
export const MIN_AI_WORDS = 12
/** Tool conventions for the free-text fields (not lab minimums). Gate sweep 2026-10-19
 *  (docs/lectures/GATE_SWEEP_2026-10-19.md): a field that asks for a sentence needs MIN_SENTENCE_WORDS (a subject, a verb
 *  and an object); every other free-text field needs only to be written, because short answers can be complete ("Power
 *  fails", "Order delivered", "Week 6", "2 min"). The older constants stay exported for compatibility; no gate reads
 *  MIN_NARRATIVE_WORDS, MIN_REASON_WORDS or MIN_RATIONALE_WORDS any more. */
export const MIN_NARRATIVE_WORDS = 8
export const MIN_REASON_WORDS = 5
export const MIN_RATIONALE_WORDS = 6
export const MIN_SENTENCE_WORDS = 3
/** An answer that says nothing ("none", "n/a", "later"): not an end state, a reason or a disposition. Used where "none" is
 *  never a valid answer (not for preconditions, where "None" is a valid answer). */
export { EMPTY_ANSWER } // shared with Weeks 1, 2, 3 and 5 (src/workbench/emptyAnswer.ts)
const said = (s: string) => words(s) >= 1 && !EMPTY_ANSWER.test(s.trim())
/** quality.ts flags a rationale whose content words are mostly the statement's (R13 p.559: why, not what). */
export const RESTATEMENT_LIMIT = 0.7
export const MIN_ENVIRONMENT = 3

/** The scenario kinds a set must contain: all three for a team of four; nominal and off-nominal for a team of three
 *  (support recommended). Read from labBrief.ts. */
export const requiredKindsOf = (r: Pick<Week2Record, 'threePersonTeam'>): readonly ScenarioKindId[] => (r.threePersonTeam ? REQUIRED_KINDS_THREE : REQUIRED_KINDS)
export const minimumsOf = (r: Pick<Week2Record, 'threePersonTeam'>): Lab2Minimums => (r.threePersonTeam ? LAB2_MINIMUMS_THREE : LAB2_MINIMUMS)

// ---------------------------------------------------------------------------------------------- types
export type NeedSnap = { id: string; name: string; statement: string; priority: string; goal: string }
export type Week1Snapshot = {
  team: string
  enterprise: string
  domain: string
  soi: string
  mission: string
  goals: { id: string; statement: string }[]
  stakeholders: { id: string; name: string }[]
  needs: NeedSnap[]
  /** Initials of the members holding the Week 1 lead roles. */
  members: string[]
  threePersonTeam: boolean
  /** The instructor's decision on the Week 1 proposal: approval is required before the Week 2 submission. */
  decision: string
  decidedOn: string
  sourceVersion: number
}
export type EnvRow = { id: string; label: string; value: string }
export type Conops = {
  /** Short name of the scenario system of interest (an actor's name must not be this). */
  soiName: string
  /** The scenario system of interest, stated in a sentence: what is inside, and so who is an actor outside it. */
  soi: string
  existing: string
  justification: string
  /** Restrictions on the proposed system, one per line. */
  restrictions: string
  proposed: string
  environment: EnvRow[]
  /** User interactions, one per line. */
  interactions: string
  /** Operational constraints, one per line. */
  constraints: string
}
export type Actor = { id: string; name: string; primary: boolean; environment: boolean }
export type Step = { actor: string; action: string }
export type Alternate = { id: string; fromStep: number; condition: string; response: string; outcome: '' | 'rejoin' | 'ends'; rejoin: number }
export type ClinicDecision = { decision: '' | 'proceed' | 'revise'; reason: string }
export type Scenario = {
  id: string
  name: string
  kind: ScenarioKindId | ''
  owner: string
  actors: Actor[]
  trigger: string
  preconditions: string
  steps: Step[]
  alternates: Alternate[]
  success: string
  failure: string
  clinic: ClinicDecision
}
export type DiscoveryKind = '' | 'need' | 'assumption' | 'unknown'
export type Discovery = { id: string; scenario: string; where: string; kind: DiscoveryKind; ref: string; text: string }
/** U-nnn (unknown: a TBD/TBR token, an owner, how and when it closes) or A-nnn (assumption: an owner, how it is validated). */
export type Uncertainty = { id: string; name: string; tbx: string; owner: string; closeBy: string; validation: string }
export type CoverageRow = { need: string; scenarios: { scenario: string; steps: string }[]; reason: string }
export type Capability = { id: string; name: string; statement: string; needs: string[]; refines: string; scenarios: string[] }
export type Requirement = {
  id: string
  name: string
  statement: string
  type: ReqTypeId | ''
  method: VerMethodId | ''
  criterion: string
  rationale: string
  /** Parent IDs as typed ("NEED-004, CAP-003"). */
  parents: string
  /** Unknowns (U IDs) the TBD/TBR tokens of the statement link to, as typed; may be left empty when the token decides. */
  tbx: string
  owner: string
  reviewer: string
  /** Suggested by an AI tool and reviewed by the team (tagged in the record and in the AI usage statement). */
  ai: boolean
}
export type Measure = { id: string; name: string; definition: string; measures: string; unit: string; threshold: string; source: string }
export type Issued = { SCN: number; CAP: number; 'REQ-STK': number; 'REQ-SYS': number; MOE: number; MOP: number; U: number; A: number; NEED: number; D: number; ENV: number; ACT: number }
export type IdPrefix = keyof Issued
export type Week2Record = {
  week1: Week1Snapshot | null
  threePersonTeam: boolean
  conops: Conops
  scenarios: Scenario[]
  discoveries: Discovery[]
  uncertainties: Uncertainty[]
  /** Needs the scenarios exposed (Part 5 revised): numbered after the Week 1 needs. */
  needsAdded: NeedSnap[]
  coverage: CoverageRow[]
  capabilities: Capability[]
  requirements: Requirement[]
  /** Disposition of each childless NEED (no REQ-STK child) and childless REQ-STK (no REQ-SYS child), by ID. */
  dispositions: Record<string, string>
  moes: Measure[]
  mops: Measure[]
  aiStatement: string
  issued: Issued
  updatedAt?: number
  exportedMdAt?: number
  exportedJsonAt?: number
}

export const EMPTY_CONOPS: Conops = { soiName: '', soi: '', existing: '', justification: '', restrictions: '', proposed: '', environment: [], interactions: '', constraints: '' }
export const EMPTY_ISSUED: Issued = { SCN: 0, CAP: 0, 'REQ-STK': 0, 'REQ-SYS': 0, MOE: 0, MOP: 0, U: 0, A: 0, NEED: 0, D: 0, ENV: 0, ACT: 0 }
export const EMPTY_RECORD: Week2Record = { week1: null, threePersonTeam: false, conops: EMPTY_CONOPS, scenarios: [], discoveries: [], uncertainties: [], needsAdded: [], coverage: [], capabilities: [], requirements: [], dispositions: {}, moes: [], mops: [], aiStatement: '', issued: EMPTY_ISSUED }
export const EMPTY_SCENARIO = (id: string): Scenario => ({ id, name: '', kind: '', owner: '', actors: [], trigger: '', preconditions: '', steps: [], alternates: [], success: '', failure: '', clinic: { decision: '', reason: '' } })
export const EMPTY_REQUIREMENT = (id: string): Requirement => ({ id, name: '', statement: '', type: '', method: '', criterion: '', rationale: '', parents: '', tbx: '', owner: '', reviewer: '', ai: false })
export const EMPTY_MEASURE = (id: string): Measure => ({ id, name: '', definition: '', measures: '', unit: '', threshold: '', source: '' })
export const EMPTY_CAPABILITY = (id: string): Capability => ({ id, name: '', statement: '', needs: [], refines: '', scenarios: [] })
export const EMPTY_UNCERTAINTY = (id: string): Uncertainty => ({ id, name: '', tbx: '', owner: '', closeBy: '', validation: '' })

// ---------------------------------------------------------------------------------------------- helpers
const pad = (n: number, w = 3) => String(n).padStart(w, '0')
const num = (id: string) => Number(id.split('-').pop()) || 0
const str = (x: unknown) => (typeof x === 'string' ? x : x === undefined || x === null ? '' : String(x))
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const objs = (x: unknown): Record<string, unknown>[] => (Array.isArray(x) ? x.filter(isObj) : [])
const oneOf = <T extends string>(x: unknown, allowed: readonly T[]): T | '' => (allowed.includes(x as T) ? (x as T) : '')
const int = (x: unknown) => (typeof x === 'number' && Number.isInteger(x) && x > 0 ? x : typeof x === 'string' && /^\d+$/.test(x.trim()) ? Number(x) : 0)
export const words = (s: string) => s.split(/\s+/).filter(Boolean).length
export const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)
export const duplicates = (ids: string[]) => [...new Set(ids.filter((x, i) => x && ids.indexOf(x) !== i))]
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

export const SCENARIO_KIND_IDS = SCENARIO_KINDS.map((k) => k.id) as ScenarioKindId[]
export const REQ_TYPE_IDS = REQ_TYPES.map((t) => t.id) as ReqTypeId[]
export const VER_METHOD_IDS = VER_METHODS.map((m) => m.id) as VerMethodId[]
const KIND_LABEL = Object.fromEntries(SCENARIO_KINDS.map((k) => [k.id, k.label])) as Record<ScenarioKindId, string>
const TYPE_LABEL = Object.fromEntries(REQ_TYPES.map((k) => [k.id, k.label])) as Record<ReqTypeId, string>
const METHOD_LABEL = Object.fromEntries(VER_METHODS.map((k) => [k.id, k.label])) as Record<VerMethodId, string>
export const kindLabel = (k: string) => KIND_LABEL[k as ScenarioKindId] ?? '(kind not chosen)'
export const typeLabel = (k: string) => TYPE_LABEL[k as ReqTypeId] ?? '(type not chosen)'
export const methodLabel = (k: string) => METHOD_LABEL[k as VerMethodId] ?? '(method not chosen)'
export const partTitle = (id: (typeof WEEK2_PARTS)[number]['id']) => WEEK2_PARTS.find((p) => p.id === id)!.title

/** The ID forms of the course scheme this record uses. */
export const ID_FORMS: Record<string, RegExp> = {
  NEED: /^NEED-\d{3}$/, STK: /^STK-\d{3}$/, MGO: /^MGO-\d{3}$/, SCN: /^SCN-\d{3}$/, CAP: /^CAP-\d{3}$/, 'REQ-STK': /^REQ-STK-\d{3}$/, 'REQ-SYS': /^REQ-SYS-\d{3}$/,
  MOE: /^MOE-\d{3}$/, MOP: /^MOP-\d{3}$/, U: /^U-\d{3}$/, A: /^A-\d{3}$/,
}
const ANY_ID = /\b(?:REQ-(?:STK|SYS)|NEED|STK|MGO|SCN|CAP|MOE|MOP|U|A)-\d{3}\b/g
/** The IDs written in a free-text link field ("NEED-004, CAP-003"), upper-cased, each once. */
export const idsIn = (s: string) => [...new Set(s.toUpperCase().match(ANY_ID) ?? [])]
/** Tokens in a link field that are not IDs of the course scheme ("NEED-99", "need 4"), so a typo is never silently dropped. */
export const badTokensIn = (s: string) =>
  s
    .split(/[,;\s]+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((x) => !new RegExp(`^${ANY_ID.source}$`).test(x.toUpperCase()))
export const prefixOf = (id: string) => (id.startsWith('REQ-STK-') ? 'REQ-STK' : id.startsWith('REQ-SYS-') ? 'REQ-SYS' : id.split('-')[0])

/** Every TBD/TBR token in a text, upper-cased, in order (bare "TBD" included, so an unnumbered one is never missed). */
export const tbxTokensIn = (s: string) => [...new Set((s.match(/\bTB[DR](?:-\d+)?\b/gi) ?? []).map((x) => x.toUpperCase()))]
export const TBX_FORM = /^TB[DR]-\d{2,3}$/

// ---------------------------------------------------------------------------------------------- normalize
function normalizeSnapshot(v: unknown): Week1Snapshot | null {
  if (!isObj(v)) return null
  return {
    team: str(v.team),
    enterprise: str(v.enterprise),
    domain: str(v.domain),
    soi: str(v.soi),
    mission: str(v.mission),
    goals: objs(v.goals).map((g) => ({ id: str(g.id).trim().toUpperCase(), statement: str(g.statement) })),
    stakeholders: objs(v.stakeholders).map((s) => ({ id: str(s.id).trim().toUpperCase(), name: str(s.name) })),
    needs: objs(v.needs).map(normalizeNeed),
    members: (Array.isArray(v.members) ? v.members : []).map(str).filter(Boolean),
    threePersonTeam: v.threePersonTeam === true,
    decision: str(v.decision),
    decidedOn: str(v.decidedOn),
    sourceVersion: int(v.sourceVersion),
  }
}
const normalizeNeed = (n: Record<string, unknown>): NeedSnap => ({ id: str(n.id).trim().toUpperCase(), name: str(n.name), statement: str(n.statement), priority: str(n.priority), goal: str(n.goal).trim().toUpperCase() })
const normalizeMeasure = (m: Record<string, unknown>): Measure => ({ id: str(m.id).trim().toUpperCase(), name: str(m.name), definition: str(m.definition), measures: Array.isArray(m.measures) ? m.measures.map(str).join(', ') : str(m.measures), unit: str(m.unit), threshold: str(m.threshold), source: str(m.source) })
const linkText = (x: unknown) => (Array.isArray(x) ? x.map(str).join(', ') : str(x))

/** Fills missing fields of a stored or imported record. Never throws. */
export function normalizeRecord(v: unknown): Week2Record {
  const r = isObj(v) ? v : {}
  const c = isObj(r.conops) ? r.conops : {}
  const week1 = normalizeSnapshot(r.week1)
  const rec: Week2Record = {
    week1,
    threePersonTeam: typeof r.threePersonTeam === 'boolean' ? r.threePersonTeam : (week1?.threePersonTeam ?? false),
    conops: {
      soiName: str(c.soiName),
      soi: str(c.soi),
      existing: str(c.existing),
      justification: str(c.justification),
      restrictions: Array.isArray(c.restrictions) ? c.restrictions.map(str).join('\n') : str(c.restrictions),
      proposed: str(c.proposed),
      environment: objs(c.environment).map((e, i) => ({ id: str(e.id) || `ENV-${pad(i + 1)}`, label: str(e.label), value: str(e.value) })),
      interactions: Array.isArray(c.interactions) ? c.interactions.map(str).join('\n') : str(c.interactions),
      constraints: Array.isArray(c.constraints) ? c.constraints.map(str).join('\n') : str(c.constraints),
    },
    scenarios: objs(r.scenarios).map((s) => {
      const cl = isObj(s.clinic) ? s.clinic : {}
      return {
        id: str(s.id).trim().toUpperCase(),
        name: str(s.name),
        kind: oneOf(s.kind, SCENARIO_KIND_IDS),
        owner: str(s.owner),
        actors: objs(s.actors).map((a, i) => ({ id: str(a.id) || `ACT-${pad(i + 1)}`, name: str(a.name), primary: a.primary === true, environment: a.environment === true })),
        trigger: str(s.trigger),
        preconditions: str(s.preconditions),
        steps: objs(s.steps).map((x) => ({ actor: str(x.actor), action: str(x.action) })),
        alternates: objs(s.alternates).map((a, i) => {
          const outcome = a.outcome === 'ends' ? 'ends' : a.outcome === 'rejoin' || int(a.rejoin) ? 'rejoin' : ''
          return { id: str(a.id) || `A${i + 1}`, fromStep: int(a.fromStep), condition: str(a.condition), response: str(a.response), outcome, rejoin: int(a.rejoin) } as Alternate
        }),
        success: str(s.success),
        failure: str(s.failure),
        clinic: { decision: oneOf(cl.decision, ['proceed', 'revise'] as const), reason: str(cl.reason) },
      }
    }),
    discoveries: objs(r.discoveries).map((d, i) => ({ id: str(d.id) || `D-${pad(i + 1)}`, scenario: str(d.scenario).trim().toUpperCase(), where: str(d.where), kind: oneOf(d.kind, ['need', 'assumption', 'unknown'] as const), ref: str(d.ref).trim().toUpperCase(), text: str(d.text) })),
    uncertainties: objs(r.uncertainties).map((u) => ({ id: str(u.id).trim().toUpperCase(), name: str(u.name), tbx: str(u.tbx).trim().toUpperCase(), owner: str(u.owner), closeBy: str(u.closeBy), validation: str(u.validation) })),
    needsAdded: objs(r.needsAdded).map(normalizeNeed),
    coverage: objs(r.coverage).map((x) => ({ need: str(x.need).trim().toUpperCase(), scenarios: objs(x.scenarios).map((y) => ({ scenario: str(y.scenario).trim().toUpperCase(), steps: str(y.steps) })), reason: str(x.reason) })),
    capabilities: objs(r.capabilities).map((x) => ({ id: str(x.id).trim().toUpperCase(), name: str(x.name), statement: str(x.statement), needs: (Array.isArray(x.needs) ? x.needs : []).map((y) => str(y).trim().toUpperCase()).filter(Boolean), refines: str(x.refines).trim().toUpperCase(), scenarios: (Array.isArray(x.scenarios) ? x.scenarios : []).map((y) => str(y).trim().toUpperCase()).filter(Boolean) })),
    requirements: objs(r.requirements).map((x) => ({
      ...EMPTY_REQUIREMENT(str(x.id).trim().toUpperCase()),
      name: str(x.name),
      statement: str(x.statement),
      type: oneOf(x.type, REQ_TYPE_IDS),
      method: oneOf(x.method, VER_METHOD_IDS),
      criterion: str(x.criterion),
      rationale: str(x.rationale),
      parents: linkText(x.parents),
      tbx: linkText(x.tbx),
      owner: str(x.owner),
      reviewer: str(x.reviewer),
      ai: x.ai === true,
    })),
    dispositions: Object.fromEntries(Object.entries(isObj(r.dispositions) ? r.dispositions : {}).map(([k, x]) => [k.trim().toUpperCase(), str(x)])),
    moes: objs(r.moes).map(normalizeMeasure),
    mops: objs(r.mops).map(normalizeMeasure),
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

/** Every ID of one prefix present in the record (Week 1 needs included for NEED, so an added need never collides). */
export function idsOf(r: Week2Record, prefix: IdPrefix): string[] {
  switch (prefix) {
    case 'SCN': return r.scenarios.map((x) => x.id)
    case 'CAP': return r.capabilities.map((x) => x.id)
    case 'REQ-STK': return r.requirements.filter((x) => x.id.startsWith('REQ-STK-')).map((x) => x.id)
    case 'REQ-SYS': return r.requirements.filter((x) => x.id.startsWith('REQ-SYS-')).map((x) => x.id)
    case 'MOE': return r.moes.map((x) => x.id)
    case 'MOP': return r.mops.map((x) => x.id)
    case 'U': return r.uncertainties.filter((x) => x.id.startsWith('U-')).map((x) => x.id)
    case 'A': return r.uncertainties.filter((x) => x.id.startsWith('A-')).map((x) => x.id)
    case 'NEED': return [...(r.week1?.needs ?? []), ...r.needsAdded].map((x) => x.id)
    case 'D': return r.discoveries.map((x) => x.id)
    case 'ENV': return r.conops.environment.map((x) => x.id)
    case 'ACT': return r.scenarios.flatMap((s) => s.actors.map((a) => a.id))
  }
}
/** The next ID for a prefix: one past the highest ever issued or present, so a deleted ID is never reused. */
export function nextId(r: Week2Record, prefix: IdPrefix): string {
  const n = Math.max(r.issued[prefix], 0, ...idsOf(r, prefix).map(num)) + 1
  return `${prefix}-${pad(n)}`
}
/** Records that an ID was issued (call with the record that will hold it). */
export const withIssued = (r: Week2Record, prefix: IdPrefix, id: string): Issued => ({ ...r.issued, [prefix]: Math.max(r.issued[prefix], num(id)) })
/** The next alternate-flow ID inside a scenario (A1, A2 …), one past the highest present. */
export const nextAlternateId = (s: Scenario) => `A${Math.max(0, ...s.alternates.map((a) => Number(a.id.replace(/\D/g, '')) || 0)) + 1}`
/** The next TBD token not used by any unknown in the register (TBD-01 …). */
export function nextTbx(r: Week2Record): string {
  const used = r.uncertainties.map((u) => num(u.tbx)).filter(Boolean)
  return `TBD-${pad(Math.max(0, ...used) + 1, 2)}`
}

// ---------------------------------------------------------------------------------------------- Week 1 import
/** The Week 1 snapshot kept in the Week 2 record, from a Week 1 Team Record. */
export function snapshotOf(t: TeamRecord, sourceVersion: number): Week1Snapshot {
  return {
    team: t.team.trim(),
    enterprise: t.proposal.name.trim(),
    domain: t.proposal.domain.trim(),
    soi: t.proposal.soi.trim(),
    mission: t.proposal.purpose.trim(),
    goals: t.proposal.goals.filter((g) => g.text.trim()).map((g) => ({ id: g.id, statement: g.text.trim() })),
    stakeholders: t.stakeholders.map((s) => ({ id: s.id, name: s.name.trim() })),
    needs: t.needs.map((n) => ({ id: n.id, name: n.name.trim(), statement: n.text.trim(), priority: n.priority, goal: n.goal })),
    members: [...new Set(Object.values(t.charter.roles).map((x) => x.trim().toUpperCase()).filter((x) => !ownerProblem(x)))],
    threePersonTeam: t.charter.threePersonTeam,
    decision: t.proposal.decision,
    decidedOn: t.proposal.decidedOn,
    sourceVersion,
  }
}

/** Reads the Week 1 model-inputs JSON (versions 1–3) with Week 1's own importer and returns the snapshot, or a message
 *  the student can act on. A record about AeroLink is refused. Never throws. */
export function importWeek1(text: string): { snapshot: Week1Snapshot } | { error: string } {
  const t = importModelInputs(text)
  if ('error' in t) return { error: t.error }
  let version = 0
  try {
    version = int((JSON.parse(text) as Record<string, unknown>).version)
  } catch {
    /* importModelInputs already parsed it */
  }
  if (proposalNamesAeroLink(t.proposal)) return { error: 'This Week 1 record names AeroLink, the instructor’s worked example. Import your team’s own Week 1 record.' }
  if (!t.proposal.name.trim()) return { error: 'This Week 1 record has no enterprise name: export the record again from the Week 1 lab tool.' }
  if (!t.needs.length) return { error: 'This Week 1 record has no needs: the Week 2 work traces to your Week 1 needs, so export the record again once Part 5 is filled in.' }
  return { snapshot: snapshotOf(t, version) }
}

/** Puts a Week 1 snapshot into the record, keeping the Week 2 work; the three-person flag is copied from the charter. */
export function withWeek1(r: Week2Record, snapshot: Week1Snapshot): Week2Record {
  const next = { ...r, week1: snapshot, threePersonTeam: snapshot.threePersonTeam }
  return { ...next, issued: { ...next.issued, NEED: Math.max(next.issued.NEED, ...idsOf(next, 'NEED').map(num)) } }
}

// ---------------------------------------------------------------------------------------------- lookups
export const allNeeds = (r: Week2Record): NeedSnap[] => [...(r.week1?.needs ?? []), ...r.needsAdded]
const idSet = (r: Week2Record) => {
  const s = new Set<string>([
    ...allNeeds(r).map((n) => n.id),
    ...r.capabilities.map((x) => x.id),
    ...r.requirements.map((x) => x.id),
    ...r.scenarios.map((x) => x.id),
    ...r.moes.map((x) => x.id),
    ...r.mops.map((x) => x.id),
    ...r.uncertainties.map((x) => x.id),
    ...(r.week1?.goals ?? []).map((g) => g.id),
  ])
  if (r.week1) s.add(MISSION_ID)
  return s
}
export const isAeroLinkText = isAeroLink

// ---------------------------------------------------------------------------------------------- requirement gates
export type Gate<T extends string = string> = { id: T; ok: boolean; message: string }
export type Advisory<T extends string = string> = { id: T; message: string }
export type RequirementAssessment = { level: 'STK' | 'SYS' | ''; gates: Gate<ReqGateId>[]; advisories: Advisory<ReqAdvisoryId>[]; counts: boolean }

export const GATE_SHORT = Object.fromEntries(REQ_HARD_GATES.map((g) => [g.id, g.short])) as Record<ReqGateId, string>
export const ADVISORY_SHORT = Object.fromEntries(REQ_ADVISORIES.map((g) => [g.id, g.short])) as Record<ReqAdvisoryId, string>

const STOP_UNIT = new Set(['of', 'the', 'and', 'or', 'to', 'in', 'at', 'a', 'an', 'for', 'by', 'on', 'with', 'from', 'per', 'is', 'are', 'be', 'shall', 'that', 'which', 'when', 'if'])
const NUMBER_WORDS = 'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|ninety|hundred|thousand'
/** A value: a number (digits or a number word) followed by a unit or counted noun, a percentage, a temperature, a money
 *  amount or a clock time. Domain-neutral, so "500 lb", "4 °C", "$2.50" and "17:00" count as well as "20 min". IDs are
 *  removed first, so "NEED-004" is never a value. Instructor-authored heuristic. */
export function valueIn(statement: string): string | undefined {
  const t = statement.replace(ANY_ID, ' ').replace(/\bTB[DR](?:-\d+)?\b/gi, ' ')
  const money = t.match(/[$€£]\s?\d[\d,]*(?:\.\d+)?/)
  if (money) return money[0]
  const clock = t.match(/\b\d{1,2}:\d{2}\b/)
  if (clock) return clock[0]
  const re = new RegExp(`(?:\\b(?:${NUMBER_WORDS})\\b|\\d+(?:[.,]\\d+)?)\\s*(%|‰|°\\s?[CFK]\\b|[A-Za-zµ][A-Za-zµ-]*(?:\\/[A-Za-z]+)?)`, 'gi')
  for (const m of t.matchAll(re)) if (!STOP_UNIT.has(m[1].toLowerCase())) return m[0]
  return undefined
}
const BOUND = /\b(at least|at most|no more than|no less than|not (?:to )?exceed|within|up to|maximum|minimum|or more|or less|or fewer|between|greater than|less than|fewer than|more than|below|above|exceeds?|under|or above|or below|before|after|until|range)\b|[≤≥<>–]|\d\s*-\s*\d/i
const MAXIMIZE = /\b(maximi[sz]e[sd]?|minimi[sz]e[sd]?|optimi[sz]e[sd]?|maximi[sz]ing|minimi[sz]ing|optimi[sz]ing)\b/i
const MAX_TERMS = new Set(['maximize', 'maximise', 'minimize', 'minimise', 'optimize', 'optimise'])
/** Verbs that commonly open a requirement's action; "and"/"or" followed by one of them joins two actions. */
const ACTION_VERBS =
  'accept|alert|allow|assign|book|calculate|cancel|charge|check|clean|collect|compute|confirm|cool|deliver|detect|discard|dispatch|display|divert|enter|generate|hold|inform|inspect|issue|keep|label|limit|load|log|maintain|measure|monitor|notify|offer|operate|plan|prevent|print|protect|provide|receive|record|refrigerate|reject|remove|repair|replace|report|reroute|respond|retain|return|route|scan|schedule|send|separate|show|sign|sort|store|track|transmit|unload|update|verify|warn|weigh'
const COMPOUND = new RegExp(`\\b(?:and|or|and\\/or)\\s+(?:then\\s+|also\\s+)?(?:${ACTION_VERBS})(?:s|es|ed)?\\b`, 'i')
/** A criterion that names no pass condition ("works", "TBD"). Exported for Week 5's interface-requirement criterion. */
export const TRIVIAL_CRITERION = /^(?:it\s+)?(?:works|passes|pass(?:es)? (?:the )?test|is met|meets? (?:the )?requirement|requirement (?:is )?(?:met|satisfied)|verified(?: by \w+)?|as specified|as required|ok|yes|done|tbd|n\/?a|see above|satisfactory)\.?$/i

const escapeRe = (x: string) => x.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
const UNMEASURABLE_RE = new RegExp(`(?<![\\w-])(${[...UNMEASURABLE_TERMS].sort((a, b) => b.length - a.length).map(escapeRe).join('|')})(?![\\w-])`, 'gi')
/** The UNMEASURABLE_TERMS in a statement, lower-cased, once each. */
export const unmeasurableTermsIn = (t: string) => [...new Set((t.replace(ANY_ID, ' ').match(UNMEASURABLE_RE) ?? []).map((m) => m.toLowerCase()))]
/** Words that are never the obliged entity on their own (pronouns, determiners, quantifiers). */
const NOT_A_SUBJECT = /^(?:it|its|this|that|these|those|they|them|we|us|you|he|she|one|someone|something|everyone|everything|anyone|anything|nobody|nothing|each|every|all|both|either|neither|any|some|which|who|there|here|the|a|an)$/i
/** Review M1: a subject is the obliged entity. Two or more words ("The scheduling function") as before; ONE word is
 *  accepted when it is a proper name (capitalized, not a pronoun or determiner: "MedFly", "Dispatch") or the team's
 *  enterprise or scenario system-of-interest name in any case. A pronoun or an empty subject is still rejected. */
export function subjectAccepted(subject: string, names: string[] = []): boolean {
  const s = subject.trim().replace(/[“”"']/g, '')
  if (!s) return false
  const toks = s.split(/\s+/)
  if (toks.every((w) => NOT_A_SUBJECT.test(w))) return false
  if (toks.length >= 2) return true
  const w = toks[0]
  const norm = (x: string) => x.trim().toLowerCase().replace(/^the\s+/, '')
  if (names.map(norm).filter(Boolean).includes(norm(w))) return true
  return /^\p{Lu}/u.test(w) && /\p{L}/u.test(w)
}

/** The ID a link field names and the level it implies. */
const levelOf = (id: string): 'STK' | 'SYS' | '' => (id.startsWith('REQ-STK-') ? 'STK' : id.startsWith('REQ-SYS-') ? 'SYS' : '')

/** One requirement assessed against the record: the ten hard gates (REQ_HARD_GATES, in order) and the advisories
 *  (REQ_ADVISORIES). `counts` = it passes every hard gate; an advisory never blocks counting. */
export function assessRequirement(q: Requirement, r: Week2Record): RequirementAssessment {
  const level = levelOf(q.id)
  const t = q.statement.trim()
  const shalls = (t.match(/\bshall\b/gi) ?? []).length
  const gates: Gate<ReqGateId>[] = []
  const gate = (id: ReqGateId, ok: boolean, message: string) => gates.push({ id, ok, message })

  gate('one-shall', shalls === 1, shalls === 1 ? 'One “shall”: one binding obligation.' : shalls === 0 ? 'No “shall”: a requirement needs one to be binding.' : `${shalls} “shall”s: two obligations in one statement. Split it into ${shalls} requirements, each with its own ID, rationale and method.`)

  const subject = subjectOf(t)
  const subjectOk = shalls > 0 && subjectAccepted(subject, [r.week1?.enterprise ?? '', r.conops.soiName])
  gate('subject', subjectOk, subjectOk ? `Subject: “${subject}”.` : shalls === 0 ? 'No “shall”, so there is no subject before it.' : `Put the obliged entity before “shall”: ${level === 'SYS' ? 'a named element or function (“The scheduling function shall …”)' : 'the service (“The delivery service shall …”)'}.`)

  // parent: each parent exists in the record, at the right level
  const parents = idsIn(q.parents)
  const bad = badTokensIn(q.parents)
  const known = idSet(r)
  const needIds = new Set(allNeeds(r).map((n) => n.id))
  const parentProblems: string[] = []
  if (!parents.length && !bad.length) parentProblems.push(level === 'STK' ? 'Give at least one parent: the NEED (or CAP) it comes from.' : 'Give at least one parent: the REQ-STK (or CAP) it comes from.')
  if (bad.length) parentProblems.push(`${bad.map((x) => `“${x}”`).join(', ')} ${bad.length > 1 ? 'are not IDs' : 'is not an ID'} (IDs look like NEED-004, CAP-003, REQ-STK-005).`)
  for (const p of parents) {
    if (p === q.id) parentProblems.push(`${p} cannot be its own parent.`)
    else if (!known.has(p)) parentProblems.push(`${p} is not in the record${p.startsWith('NEED-') ? ' (neither a Week 1 need nor a need added this week)' : ''}: an orphan link.`)
    else if (level === 'STK') {
      if (p.startsWith('REQ-SYS-')) parentProblems.push(`${p} is a system requirement: a stakeholder requirement never derives from a system requirement (the trace is upside down).`)
      else if (!(needIds.has(p) || p.startsWith('CAP-'))) parentProblems.push(`${p}: a stakeholder requirement derives from a need (NEED) or a capability (CAP).`)
    } else if (level === 'SYS') {
      if (!(p.startsWith('REQ-STK-') || p.startsWith('CAP-') || p.startsWith('REQ-SYS-'))) parentProblems.push(`${p}: a system requirement derives from a stakeholder requirement (REQ-STK) or a capability (CAP), not directly from ${p.startsWith('NEED-') ? 'a need: trace it through the REQ-STK that carries the need' : 'this item'}.`)
    }
  }
  if (!level) parentProblems.push('The ID must be REQ-STK-nnn or REQ-SYS-nnn.')
  gate('parent', parentProblems.length === 0, parentProblems.length ? parentProblems.join(' ') : `Parent${parents.length > 1 ? 's' : ''}: ${parents.join(', ')}.`)

  gate('type', !!q.type, q.type ? `Type: ${typeLabel(q.type)}.` : `Choose a type: ${REQ_TYPES.map((x) => x.label.toLowerCase()).join(', ')}.`)
  gate('method', !!q.method, q.method ? `Method: ${methodLabel(q.method)}.` : `Choose a verification method: ${VER_METHODS.map((x) => x.label.toLowerCase()).join(', ')}.`)

  const crit = q.criterion.trim()
  const critVague = vagueTermsIn(crit)
  const critAnchored = !!valueIn(crit) || tbxTokensIn(crit).length > 0 || /[≤≥<>]|\b(every|each|all|zero|none|no|any|at least|within|before|after|100)\b/i.test(crit)
  const critProblem =
    // gate sweep 2026-10-19: no word count ("2 min", "Every booking" are criteria); an empty, trivial or vague one fails
    !crit ? 'Write the pass condition a verifier will check (for example “Total fare displayed before the confirmation in every demonstrated booking”).'
    // confirmation review N3: an empty answer ("none", "-") is no pass condition either, though "none" anchors a phrase
    : TRIVIAL_CRITERION.test(crit) || EMPTY_ANSWER.test(crit) ? `“${crit}” does not say how a verifier decides pass or fail: state what is observed or measured, and the threshold.`
    : critVague.length && !critAnchored ? `The criterion is itself vague (${critVague.map((v) => `“${v}”`).join(', ')}): a verifier could not say pass or fail. Give a value, a population (“every …”) or a TBD/TBR.`
    : ''
  gate('criterion', !critProblem, critProblem || 'Criterion recorded.')

  const tokens = tbxTokensIn(t)
  const value = valueIn(t)
  const perfOk = q.type !== 'performance' || !!value || tokens.length > 0
  gate('performance-value', perfOk, q.type !== 'performance' ? 'Not a performance requirement.' : value ? `Value: “${value}”.` : tokens.length ? `The value is a placeholder (${tokens.join(', ')}); see the TBD/TBR gate.` : 'A performance requirement says how well, how much or how fast: give the value with its unit, or a TBD/TBR linked to an unknown.')

  // tbx-owned: every token links to an unknown (U) in the register with an owner and the same token
  const linked = idsIn(q.tbx)
  const unknowns = r.uncertainties.filter((u) => u.id.startsWith('U-'))
  const tbxProblems: string[] = []
  for (const l of linked) if (!l.startsWith('U-')) tbxProblems.push(`${l} is not an unknown: TBD/TBR tokens link to U items.`)
    else if (!unknowns.some((u) => u.id === l)) tbxProblems.push(`${l} is not in the uncertainty register.`)
  for (const tok of tokens) {
    if (!TBX_FORM.test(tok)) {
      const stem = tok.match(/^TB[DR]/i)?.[0].toUpperCase() ?? 'TBD'
      tbxProblems.push(`Number the ${tok} with two digits (for example ${stem}-01) and record it on an unknown (U) with an owner, so it can be tracked.`)
      continue
    }
    const holders = unknowns.filter((u) => u.tbx === tok)
    const owned = holders.filter((u) => u.owner.trim().length >= 2)
    const linkedWrong = linked.filter((l) => l.startsWith('U-') && unknowns.some((u) => u.id === l)).filter((l) => !holders.some((u) => u.id === l))
    if (!holders.length) tbxProblems.push(`${tok} is not recorded on any unknown (U) in the register: add one with this token, an owner and how it will be closed.`)
    else if (!owned.length) tbxProblems.push(`${tok} is on ${holders.map((u) => u.id).join(', ')}, which has no owner: an untracked TBD becomes risk.`)
    else if (linked.length && !linked.some((l) => holders.some((u) => u.id === l))) tbxProblems.push(`${tok} is held by ${holders.map((u) => u.id).join(', ')}, but the requirement links ${linkedWrong.join(', ') || linked.join(', ')}.`)
  }
  gate('tbx-owned', tbxProblems.length === 0, tbxProblems.length ? tbxProblems.join(' ') : tokens.length ? tokens.map((tok) => `${tok} is held by ${unknowns.filter((u) => u.tbx === tok).map((u) => u.id).join(', ')}`).join('; ') + '.' : 'No TBD/TBR.')

  const ratio = restatementRatio(t, q.rationale)
  gate('rationale', said(q.rationale) && ratio < RESTATEMENT_LIMIT, !said(q.rationale) ? 'Give a rationale: why it is needed, its assumptions and where its numbers come from.' : ratio >= RESTATEMENT_LIMIT ? `${Math.round(ratio * 100)} % of the rationale’s words repeat the statement: say why the requirement exists and where its value comes from instead.` : 'The rationale adds information beyond the statement.')

  // unmeasurable: a word that can never define compliance by itself, with no bounded value and no TBD/TBR (review M4)
  const unmeasurable = unmeasurableTermsIn(t)
  const bounded = (!!value && BOUND.test(t)) || tokens.length > 0
  const unmeasurableFails = unmeasurable.length > 0 && !bounded
  gate('unmeasurable', !unmeasurableFails, unmeasurableFails ? `${unmeasurable.map((v) => `“${v}”`).join(', ')}: no value or TBD/TBR defines ${unmeasurable.length > 1 ? 'these words' : 'this word'}, so two readers could disagree about compliance. State the level that is enough, as a bounded value (“within 10 min”, “at least 90 %”), or a TBD/TBR on an unknown.` : unmeasurable.length ? `${unmeasurable.map((v) => `“${v}”`).join(', ')}: a bounded value or a TBD/TBR is present; make sure it, not the word, defines compliance.` : 'No unmeasurable word.')

  // advisories: word-level signs of a likely defect that can also occur in a good requirement
  const advisories: Advisory<ReqAdvisoryId>[] = []
  const adv = (id: ReqAdvisoryId, message: string) => advisories.push({ id, message })
  const vague = vagueTermsIn(t).filter((v) => !MAX_TERMS.has(v) && !(unmeasurableFails && unmeasurable.includes(v)))
  if (vague.length) adv('vague', `${vague.map((v) => `“${v}”`).join(', ')}: make sure a value or the criterion, not the word, defines compliance.`)
  const max = t.match(MAXIMIZE)?.[0]
  if (max && !unmeasurableFails) adv('maximize', `“${max}” has no end point: state the level that is enough, as a threshold or a range.`)
  if (/\bshall\s+not\b/i.test(t)) adv('negative', '“shall not” is hard to verify: prefer an observable positive obligation, or name the finite set of cases the verification covers.')
  // values inside a condition clause ("when the forecast exceeds 40 km/h") describe the situation, not the obligation
  const main = t.replace(/\b(?:when|whenever|if|whose|where|while|unless)\b[^,;]*/gi, ' ')
  const mainValue = valueIn(main)
  if (mainValue && !BOUND.test(main)) adv('single-point', `“${mainValue}” reads as a single point: say “within”, “at least”, “no more than” … so a result is unambiguous.`)
  const draft = { level: (level || 'SYS') as 'STK' | 'SYS', name: q.name, text: t, type: q.type || undefined, method: q.method || undefined, criterion: q.criterion, rationale: q.rationale, parents, arou: linked }
  const quality = qualityChecks(draft)
  if (quality.find((c) => c.id === 'design-free')?.status === 'advisory') adv('design', 'Wording that may name a design (using, via, a product, a count or rating of equipment): keep it only if it is a genuine constraint, and say why in the rationale.')
  if (COMPOUND.test(t.slice(Math.max(0, t.search(/\bshall\b/i))))) adv('compound', '“and” or “or” seems to join two actions: if they can be verified separately, write two requirements.')
  if (quality.find((c) => c.id === 'method-fit')?.status === 'fail') adv('method-fit', `${q.type === 'performance' ? 'A performance requirement' : 'A measured value'} usually needs test or analysis; ${methodLabel(q.method).toLowerCase()} is for cases where quantitative assurance is not required.`)

  return { level, gates, advisories, counts: gates.every((g) => g.ok) }
}

// ---------------------------------------------------------------------------------------------- scenario gates
export const SCENARIO_GATES = [
  { id: 'name', short: 'a name' },
  { id: 'kind', short: 'a kind (nominal, off-nominal or support)' },
  { id: 'primary', short: 'exactly one primary actor, named' },
  { id: 'outside', short: 'the primary actor is outside the scenario system of interest' },
  { id: 'trigger', short: 'a trigger' },
  { id: 'preconditions', short: 'preconditions' },
  { id: 'steps', short: 'numbered main-flow steps, each with an actor and an action' },
  { id: 'alternates', short: 'alternate flows that branch from a step and rejoin a step or end' },
  { id: 'success', short: 'a success end state' },
  { id: 'failure', short: 'a failure end state' },
] as const
export type ScenarioGateId = (typeof SCENARIO_GATES)[number]['id']
export const SCENARIO_ADVISORIES = [
  { id: 'actor-in-soi', short: 'the primary actor’s name contains the scenario system of interest' },
  { id: 'trigger-state', short: 'the trigger reads like a state rather than an event' },
  { id: 'short-step', short: 'a step whose action is a single word' },
  { id: 'environment-primary', short: 'an environmental factor is marked primary' },
  { id: 'loops-back', short: 'an alternate rejoins the step it branched from or an earlier one' },
] as const
export type ScenarioAdvisoryId = (typeof SCENARIO_ADVISORIES)[number]['id']
export type ScenarioAssessment = { gates: Gate<ScenarioGateId>[]; advisories: Advisory<ScenarioAdvisoryId>[]; ok: boolean }

const normName = (s: string) => s.trim().toLowerCase().replace(/^the\s+/, '').replace(/[.\s]+$/, '').replace(/\s+/g, ' ')
const STATE_TRIGGER = /^\s*(?:the system is|there (?:is|are)|it is|the [\w\s-]{1,40}? (?:is|are) (?:available|ready|open|closed|running|operating|online|in service|full|empty))\b/i

export function assessScenario(s: Scenario, r: Week2Record): ScenarioAssessment {
  const min = minimumsOf(r)
  const gates: Gate<ScenarioGateId>[] = []
  const gate = (id: ScenarioGateId, ok: boolean, message: string) => gates.push({ id, ok, message })
  const advisories: Advisory<ScenarioAdvisoryId>[] = []
  const adv = (id: ScenarioAdvisoryId, message: string) => advisories.push({ id, message })

  gate('name', words(s.name) >= 1, words(s.name) >= 1 ? `“${s.name.trim()}”.` : 'Name the scenario (for example “Freezer fails overnight”).')
  gate('kind', !!s.kind, s.kind ? `${kindLabel(s.kind)}.` : 'Choose the kind: nominal, off-nominal or support.')
  const named = s.actors.filter((a) => a.name.trim())
  const primaries = named.filter((a) => a.primary)
  gate('primary', primaries.length === 1, primaries.length === 1 ? `Primary actor: ${primaries[0].name.trim()}.` : primaries.length === 0 ? 'Mark one named actor as the primary actor: the party whose goal the scenario serves.' : `${primaries.length} actors are marked primary: exactly one is.`)
  const soiNames = [r.conops.soiName, r.conops.soi].map(normName).filter(Boolean)
  const p = primaries[0]
  const inside = !!p && soiNames.includes(normName(p.name))
  gate('outside', !!p && !inside, !p ? 'Name the primary actor first.' : inside ? `“${p.name.trim()}” is the scenario system of interest itself: an actor is a party outside it.` : `${p.name.trim()} is outside the scenario system of interest.`)
  if (p && !inside && r.conops.soiName.trim() && normName(p.name).includes(normName(r.conops.soiName))) adv('actor-in-soi', `“${p.name.trim()}” contains the name of the scenario system of interest: check that this actor is outside it.`)
  if (named.some((a) => a.primary && a.environment)) adv('environment-primary', 'An environmental factor (weather, the road network …) is marked primary: the primary actor is the party whose goal the scenario serves.')

  gate('trigger', said(s.trigger), said(s.trigger) ? 'Trigger recorded.' : 'State the event that starts the scenario.')
  if (words(s.trigger) >= 1 && STATE_TRIGGER.test(s.trigger)) adv('trigger-state', 'The trigger reads like a state (“there is …”, “the system is …”): a trigger is an event, something that happens.')
  gate('preconditions', words(s.preconditions) >= 1, words(s.preconditions) >= 1 ? 'Preconditions recorded.' : 'State what must already be true when the trigger occurs.')

  const stepProblems: string[] = []
  s.steps.forEach((x, i) => {
    const miss = [x.actor.trim() ? '' : 'an actor', x.action.trim() ? '' : 'an action'].filter(Boolean)
    if (miss.length) stepProblems.push(`step ${i + 1} needs ${miss.join(' and ')}`)
    else if (words(x.action) < 2) adv('short-step', `Step ${i + 1}: “${x.action.trim()}” is a single word: say what the actor does (a verb and its object).`)
  })
  const stepsOk = s.steps.length >= min.mainSteps && stepProblems.length === 0
  gate('steps', stepsOk, stepsOk ? `${s.steps.length} steps.` : [s.steps.length < min.mainSteps ? `At least ${min.mainSteps} main-flow steps (${s.steps.length} so far)` : '', ...stepProblems].filter(Boolean).join('; ') + '.')

  const n = s.steps.length
  const altProblems: string[] = []
  for (const a of s.alternates) {
    const miss: string[] = []
    if (!(a.fromStep >= 1 && a.fromStep <= n)) miss.push(`the step it branches from (1–${n || '?'})`)
    if (!said(a.condition)) miss.push('the condition')
    if (!said(a.response)) miss.push('the response')
    if (a.outcome === 'ends') {
      /* ends: valid */
    } else if (a.outcome === 'rejoin') {
      if (!(a.rejoin >= 1 && a.rejoin <= n)) miss.push(`a step to rejoin (1–${n || '?'}) or “ends”`)
      else if (a.fromStep >= 1 && a.rejoin <= a.fromStep) adv('loops-back', `${a.id} rejoins step ${a.rejoin}, at or before step ${a.fromStep} where it branched: check that the loop is intended.`)
    } else miss.push('how it ends: rejoins a step, or ends')
    if (miss.length) altProblems.push(`${a.id} needs ${miss.join(', ')}`)
  }
  const altOk = s.alternates.length >= min.alternatesPerScenario && altProblems.length === 0
  gate('alternates', altOk, altOk ? `${plural(s.alternates.length, 'alternate flow')}.` : [s.alternates.length < min.alternatesPerScenario ? `At least ${plural(min.alternatesPerScenario, 'alternate flow')} (${s.alternates.length} so far)` : '', ...altProblems].filter(Boolean).join('; ') + '.')

  gate('success', said(s.success), said(s.success) ? 'Success end state recorded.' : 'State what is observably true when the actor’s goal is met.')
  gate('failure', said(s.failure), said(s.failure) ? 'Failure end state recorded.' : 'State what is observably true when the goal is not met, and how it is left safe.')
  return { gates, advisories, ok: gates.every((g) => g.ok) }
}

// ---------------------------------------------------------------------------------------------- part checks
export type PartCheck = { ok: boolean; issues: string[]; detail: string; notes?: string[] }
const result = (issues: string[], okDetail: string, notes: string[] = []): PartCheck => ({ ok: issues.length === 0, issues, detail: issues.length ? issues[0] + (issues.length > 1 ? ` (+${issues.length - 1} more)` : '') : okDetail, notes })
const three = (r: Week2Record) => (r.threePersonTeam ? ' (three-person team minimum, pending faculty approval)' : '')

/** Step 0: the Week 1 record is imported, about the team's own enterprise, with needs, and its proposal approved. */
export function checkImport(r: Week2Record): PartCheck {
  const w = r.week1
  if (!w) return result(['Import your team’s Week 1 model-inputs file (team-NN-week1-model-inputs.json): the Week 2 record traces to its needs.'], '')
  const issues: string[] = []
  if ([w.enterprise, w.soi].some(isAeroLink)) issues.push('The imported record names AeroLink, the instructor’s worked example: import your team’s own Week 1 record.')
  if (!w.needs.length) issues.push('The imported record has no needs.')
  if (w.decision !== 'approved') issues.push('The Week 1 proposal is not recorded as approved: approval by the instructor is required before the Week 2 submission. Record the decision in the Week 1 lab tool and import the record again.')
  return result(issues, `${w.enterprise}: ${plural(w.needs.length, 'need')} from Week 1, ${plural(w.stakeholders.length, 'stakeholder')}.`)
}

/** Part 7: the ConOps narrative (MITRE's critical components) and the scenario system of interest. */
export function checkConopsPart(r: Week2Record): PartCheck {
  const c = r.conops
  const issues: string[] = []
  if (words(c.soiName) < 1) issues.push('Name the scenario system of interest (a short name, used to check that every actor is outside it).')
  if (words(c.soi) < MIN_SENTENCE_WORDS) issues.push(`State the scenario system of interest in a sentence (at least ${MIN_SENTENCE_WORDS} words): what is inside it, so that everyone outside it is an actor.`)
  if ([c.soiName, c.soi].some(isAeroLink)) issues.push('The scenario system of interest names AeroLink, the instructor’s worked example: describe your team’s own system.')
  if (words(c.existing) < MIN_SENTENCE_WORDS) issues.push(`The existing situation the users want to change, in a sentence (at least ${MIN_SENTENCE_WORDS} words).`)
  if (words(c.justification) < MIN_SENTENCE_WORDS) issues.push(`The justification for the change, in a sentence (at least ${MIN_SENTENCE_WORDS} words).`)
  if (!lines(c.restrictions).length) issues.push('At least one restriction on the proposed system (a limit it must respect), one per line.')
  if (words(c.proposed) < MIN_SENTENCE_WORDS) issues.push(`Describe the proposed system in the users’ language (at least a sentence of ${MIN_SENTENCE_WORDS} words).`)
  const env = c.environment.filter((e) => e.label.trim() && e.value.trim())
  if (env.length < MIN_ENVIRONMENT) issues.push(`At least ${MIN_ENVIRONMENT} entries of the operational environment, each a label and a value (${env.length} so far).`)
  const halfEnv = c.environment.filter((e) => !!e.label.trim() !== !!e.value.trim())
  if (halfEnv.length) issues.push(`Complete or remove ${plural(halfEnv.length, 'environment entry', 'environment entries')} with only a label or only a value.`)
  if (!lines(c.interactions).length) issues.push('At least one user interaction: who does what with the system, one per line.')
  if (!lines(c.constraints).length) issues.push('At least one operational constraint, one per line.')
  return result(issues, `ConOps recorded: the scenario system of interest (${c.soiName.trim()}), the existing situation, justification and restrictions, the proposed system, ${env.length} environment entries, the user interactions and the operational constraints.`)
}

/** Discovery-log row problems (empty = complete and its references exist). */
export function discoveryIssues(d: Discovery, r: Week2Record): string[] {
  const out: string[] = []
  if (!r.scenarios.some((s) => s.id === d.scenario)) out.push(d.scenario ? `${d.scenario} is not a scenario in the record` : 'the scenario that exposed it')
  if (words(d.where) < 1) out.push('where in the scenario (trigger, step n, alternate An)')
  if (!d.kind) out.push('its kind (need, assumption or unknown)')
  const prefix = d.kind === 'need' ? 'NEED' : d.kind === 'assumption' ? 'A' : d.kind === 'unknown' ? 'U' : ''
  if (prefix) {
    if (!ID_FORMS[prefix].test(d.ref)) out.push(`the ${prefix} ID it created or changed`)
    else if (prefix === 'NEED' ? !allNeeds(r).some((n) => n.id === d.ref) : !r.uncertainties.some((u) => u.id === d.ref)) out.push(`${d.ref} is not in the record`)
  }
  if (!said(d.text)) out.push('what was found')
  return out
}
/** Uncertainty-register row problems. */
export function uncertaintyIssues(u: Uncertainty): string[] {
  const out: string[] = []
  if (words(u.name) < 1) out.push('a name')
  if (u.owner.trim().length < 2) out.push('an owner')
  if (u.id.startsWith('U-')) {
    if (!TBX_FORM.test(u.tbx)) out.push('its TBD/TBR token (TBD-01 or TBR-01)')
    if (!said(u.closeBy)) out.push('how and by when it will be closed')
  } else if (!said(u.validation)) out.push('how it will be validated')
  return out
}
export function addedNeedIssues(n: NeedSnap, r: Week2Record): string[] {
  const out: string[] = []
  if (words(n.name) < 1) out.push('a short name')
  if (words(n.statement) < MIN_SENTENCE_WORDS) out.push(`a need statement: who needs what (at least ${MIN_SENTENCE_WORDS} words)`)
  if (/\bshall\b/i.test(n.statement)) out.push('a need, not a requirement (no “shall”)')
  const goals = [MISSION_ID, ...(r.week1?.goals ?? []).map((g) => g.id)]
  if (!goals.includes(n.goal)) out.push(`the goal it serves (${goals.join(', ')})`)
  if (!r.discoveries.some((d) => d.kind === 'need' && d.ref === n.id)) out.push('the discovery-log entry that exposed it')
  return out
}

/** Part 8: the scenarios (gates per scenario, the kinds, owners, the clinic decision), the discovery log, the
 *  uncertainty register and the needs added by discovery. */
export function checkScenariosPart(r: Week2Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  if (words(r.conops.soi) < MIN_SENTENCE_WORDS) issues.push('State the scenario system of interest in Part 7 first: every scenario is written against it.')
  const dup = duplicates(r.scenarios.map((s) => s.id))
  if (dup.length) issues.push(`Duplicate scenario ID ${dup.join(', ')}: each ID once.`)
  const assessed = r.scenarios.map((s) => ({ s, a: assessScenario(s, r) }))
  const passing = assessed.filter((x) => x.a.ok && !dup.includes(x.s.id))
  if (passing.length < min.scenarios) issues.push(`At least ${min.scenarios} complete scenarios${three(r)} (${passing.length} so far).`)
  const required = requiredKindsOf(r)
  for (const k of SCENARIO_KINDS) {
    if (passing.some((x) => x.s.kind === k.id)) continue
    if (required.includes(k.id)) issues.push(`At least one complete ${k.label.toLowerCase()} scenario${three(r)}: ${k.meaning}.`)
    else notes.push(`A ${k.label.toLowerCase()} scenario is recommended (not required for a team of three): ${k.meaning}.`)
  }
  for (const { s, a } of assessed) {
    const failed = a.gates.filter((g) => !g.ok)
    if (failed.length) issues.push(`${s.id}: ${failed[0].message}${failed.length > 1 ? ` (+${failed.length - 1} more)` : ''}`)
    if (ownerProblem(s.owner)) issues.push(`${s.id}: the owner’s initials (2–4 letters).`)
    if (s.clinic.decision === 'revise' && !said(s.clinic.reason)) issues.push(`${s.id}: the clinic asked for a revision; record what it asked for.`)
    for (const x of a.advisories) notes.push(`${s.id}: ${x.message}`)
  }
  for (const d of r.discoveries) {
    const miss = discoveryIssues(d, r)
    if (miss.length) issues.push(`Discovery log: add ${miss.join('; ')}.`)
  }
  const dupU = duplicates(r.uncertainties.map((u) => u.id))
  if (dupU.length) issues.push(`Duplicate register ID ${dupU.join(', ')}: each ID once.`)
  for (const u of r.uncertainties) {
    const miss = uncertaintyIssues(u)
    if (miss.length) issues.push(`${u.id}: add ${miss.join(', ')}.`)
  }
  const dupTok = duplicates(r.uncertainties.filter((u) => u.id.startsWith('U-')).map((u) => u.tbx))
  if (dupTok.length) issues.push(`${dupTok.join(', ')} is held by more than one unknown: one token per unknown.`)
  for (const n of r.needsAdded) {
    const miss = addedNeedIssues(n, r)
    if (miss.length) issues.push(`${n.id} (added need): add ${miss.join('; ')}.`)
  }
  if (!r.discoveries.length) notes.push('No discovery recorded yet: writing a scenario usually exposes a need, an assumption or an unknown that Week 1 missed. Record each one, or confirm that the scenarios exposed none.')
  return result(issues, `${passing.length} complete scenarios (${SCENARIO_KINDS.map((k) => `${passing.filter((x) => x.s.kind === k.id).length} ${k.label.toLowerCase()}`).join(', ')}), ${plural(r.discoveries.length, 'discovery', 'discoveries')}, ${plural(r.uncertainties.length, 'register entry', 'register entries')}.`, notes)
}

export function capabilityIssues(c: Capability, r: Week2Record): string[] {
  const out: string[] = []
  const needIds = new Set(allNeeds(r).map((n) => n.id))
  if (words(c.name) < 1) out.push('a name')
  if (words(c.statement) < 1) out.push('a statement of what the enterprise must be able to do')
  const valid = c.needs.filter((n) => needIds.has(n))
  if (!valid.length) out.push('at least one need it is derived from')
  const gone = c.needs.filter((n) => !needIds.has(n))
  if (gone.length) out.push(`remove ${gone.join(', ')}, not a need in the record`)
  if (c.refines) {
    if (c.refines === c.id) out.push('a capability other than itself to refine')
    else if (!r.capabilities.some((x) => x.id === c.refines)) out.push(`${c.refines} is not a capability in the record`)
  }
  const strange = c.scenarios.filter((s) => !r.scenarios.some((x) => x.id === s))
  if (strange.length) out.push(`remove ${strange.join(', ')}, not a scenario in the record`)
  return out
}
/** Coverage of one need by the scenarios: the existing scenarios that exercise it, or the recorded reason. */
export function coverageOf(r: Week2Record, need: string): { scenarios: { scenario: string; steps: string }[]; reason: string } {
  const row = r.coverage.find((x) => x.need === need)
  const ids = new Set(r.scenarios.map((s) => s.id))
  return { scenarios: (row?.scenarios ?? []).filter((x) => ids.has(x.scenario)), reason: row?.reason ?? '' }
}

/** Part 9: capabilities derived from needs, and the needs × scenarios coverage matrix. */
export function checkCapabilitiesPart(r: Week2Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  const dup = duplicates(r.capabilities.map((c) => c.id))
  if (dup.length) issues.push(`Duplicate capability ID ${dup.join(', ')}: each ID once.`)
  const complete = r.capabilities.filter((c) => !capabilityIssues(c, r).length && !dup.includes(c.id))
  if (complete.length < min.capabilities) issues.push(`At least ${min.capabilities} capabilities${three(r)}, each derived from at least one need (${complete.length} so far).`)
  for (const c of r.capabilities) {
    const miss = capabilityIssues(c, r)
    if (miss.length) issues.push(`${c.id}: add ${miss.join('; ')}.`)
    else {
      if (!c.scenarios.length) notes.push(`${c.id} is exercised by no scenario: a gap to note, or a scenario to link.`)
      if (/\bshall\b/i.test(c.statement)) notes.push(`${c.id}: a capability says what the enterprise must be able to do; “shall” belongs in the requirements.`)
    }
  }
  const refines = new Map(r.capabilities.filter((c) => c.refines).map((c) => [c.id, c.refines]))
  for (const start of refines.keys()) {
    let cur: string | undefined = start
    const seen = new Set<string>()
    while (cur && refines.has(cur)) {
      if (seen.has(cur)) {
        issues.push(`The “refines” links loop through ${start}: a capability tree has no cycles.`)
        break
      }
      seen.add(cur)
      cur = refines.get(cur)
    }
  }
  if (!r.scenarios.length) issues.push('Write the scenarios (Part 8) before the coverage matrix.')
  const uncovered: string[] = []
  for (const n of allNeeds(r)) {
    const cov = coverageOf(r, n.id)
    if (!cov.scenarios.length && !said(cov.reason)) uncovered.push(n.id)
  }
  if (r.scenarios.length && uncovered.length) issues.push(`Coverage: mark the scenarios that exercise ${uncovered.join(', ')}, or record why no scenario does.`)
  const notDerived = allNeeds(r).filter((n) => !complete.some((c) => c.needs.includes(n.id))).map((n) => n.id)
  if (notDerived.length && complete.length) notes.push(`No capability is derived from ${notDerived.join(', ')} yet.`)
  return result(issues, `${complete.length} capabilities, each derived from needs; every need exercised by a scenario or given a reason.`, notes)
}

export type RequirementStatus = { q: Requirement; a: RequirementAssessment }
export const requirementStatuses = (r: Week2Record): RequirementStatus[] => r.requirements.map((q) => ({ q, a: assessRequirement(q, r) }))
export type RequirementCount = { total: number; stk: number; sys: number; types: ReqTypeId[] }
/** The requirements that count: each passes every hard gate (advisories never block). Duplicated IDs never count. */
export function requirementCount(r: Week2Record): RequirementCount {
  const dup = duplicates(r.requirements.map((q) => q.id))
  const counting = requirementStatuses(r).filter((x) => x.a.counts && !dup.includes(x.q.id)).map((x) => x.q)
  return { total: counting.length, stk: counting.filter((q) => q.id.startsWith('REQ-STK-')).length, sys: counting.filter((q) => q.id.startsWith('REQ-SYS-')).length, types: REQ_TYPE_IDS.filter((t) => counting.some((q) => q.type === t)) }
}

/** Part 10: stakeholder and system requirements, counting only those that pass every hard gate. */
export function checkRequirementsPart(r: Week2Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  const dup = duplicates(r.requirements.map((q) => q.id))
  if (dup.length) issues.push(`Duplicate requirement ID ${dup.join(', ')}: each ID once.`)
  const c = requirementCount(r)
  if (c.total < min.requirements) issues.push(`At least ${min.requirements} requirements that pass every hard gate${three(r)} (${c.total} so far).`)
  if (c.stk < min.stakeholderRequirements) issues.push(`At least ${min.stakeholderRequirements} stakeholder requirements (REQ-STK) that count (${c.stk} so far).`)
  if (c.sys < min.systemRequirements) issues.push(`At least ${min.systemRequirements} system requirements (REQ-SYS) that count (${c.sys} so far).`)
  if (c.types.length < min.types) issues.push(`Requirements of at least ${min.types} of the four types among those that count (${c.types.length ? c.types.map(typeLabel).join(', ').toLowerCase() : 'none'} so far).`)
  for (const { q, a } of requirementStatuses(r)) {
    const failed = a.gates.filter((g) => !g.ok)
    if (failed.length) issues.push(`${q.id} does not count: ${GATE_SHORT[failed[0].id]} (${failed[0].message})${failed.length > 1 ? ` (+${failed.length - 1} more)` : ''}`)
    if (words(q.name) < 1) issues.push(`${q.id}: a short name.`)
    if (ownerProblem(q.owner)) issues.push(`${q.id}: the owner’s initials (2–4 letters).`)
    if (isAeroLink(q.statement)) issues.push(`${q.id} names AeroLink, the instructor’s worked example: write the requirement for your own system.`)
    if (a.advisories.length) notes.push(`${q.id}: advisory, ${a.advisories.map((x) => ADVISORY_SHORT[x.id]).join('; ')}.`)
  }
  const texts = r.requirements.map((q) => q.statement.trim().toLowerCase()).filter(Boolean)
  if (texts.some((x, i) => texts.indexOf(x) !== i)) issues.push('Two requirements have the same statement: each requirement once.')
  return result(issues, `${c.total} requirements count (${c.stk} stakeholder, ${c.sys} system; ${c.types.map(typeLabel).join(', ').toLowerCase()}).`, notes)
}

export type Audit = { orphans: { id: string; missing: string[] }[]; childlessNeeds: string[]; childlessStk: string[] }
/** The trace audit, both directions: orphans (a requirement with no parent, or a parent not in the record), needs with
 *  no REQ-STK child, and REQ-STK with no REQ-SYS child. */
export function auditOf(r: Week2Record): Audit {
  const known = idSet(r)
  const orphans = r.requirements
    .map((q) => ({ id: q.id, parents: idsIn(q.parents) }))
    .map((x) => ({ id: x.id, missing: x.parents.length ? x.parents.filter((p) => !known.has(p) || p === x.id) : ['(no parent)'] }))
    .filter((x) => x.missing.length)
  const stk = r.requirements.filter((q) => q.id.startsWith('REQ-STK-'))
  const sys = r.requirements.filter((q) => q.id.startsWith('REQ-SYS-'))
  const childlessNeeds = allNeeds(r).filter((n) => !stk.some((q) => idsIn(q.parents).includes(n.id))).map((n) => n.id)
  const childlessStk = stk.filter((q) => !sys.some((s) => idsIn(s.parents).includes(q.id))).map((q) => q.id)
  return { orphans, childlessNeeds, childlessStk }
}

export function measureIssues(m: Measure, kind: 'MOE' | 'MOP', r: Week2Record): string[] {
  const out: string[] = []
  if (words(m.name) < 1) out.push('a name')
  if (words(m.definition) < 1) out.push('a definition: what is measured and how')
  if (!m.unit.trim()) out.push('a unit')
  if (!m.threshold.trim()) out.push('a threshold')
  if (words(m.source) < 1) out.push('a data source')
  const links = idsIn(m.measures)
  const bad = badTokensIn(m.measures)
  if (bad.length) out.push(`${bad.map((x) => `“${x}”`).join(', ')} ${bad.length > 1 ? 'are not IDs' : 'is not an ID'}`)
  const known = idSet(r)
  const missing = links.filter((x) => !known.has(x))
  if (missing.length) out.push(`${missing.join(', ')} ${missing.length > 1 ? 'are' : 'is'} not in the record`)
  const present = links.filter((x) => known.has(x))
  if (kind === 'MOE') {
    if (!present.some((x) => x.startsWith('NEED-') || x.startsWith('CAP-') || x.startsWith('MGO-'))) out.push('at least one NEED, CAP or MGO it measures')
    const wrong = present.filter((x) => !(x.startsWith('NEED-') || x.startsWith('CAP-') || x.startsWith('MGO-')))
    if (wrong.length) out.push(`an MOE measures needs, capabilities or the mission and goals, not ${wrong.join(', ')}`)
  } else {
    if (!present.some((x) => x.startsWith('MOE-'))) out.push('at least one MOE it supports')
    if (!present.some((x) => x.startsWith('REQ-'))) out.push('at least one requirement (REQ) it measures')
  }
  return out
}

/** Part 11: the trace audit (orphans listed; every childless need and REQ-STK given a disposition) and the measures. */
export function checkAuditPart(r: Week2Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const a = auditOf(r)
  if (a.orphans.length) issues.push(`Orphans: ${a.orphans.map((o) => `${o.id} (${o.missing.join(', ')})`).join('; ')}. Give each a parent that exists in the record.`)
  const noDisp = (ids: string[]) => ids.filter((id) => !said(r.dispositions[id] ?? ''))

  const needsOpen = noDisp(a.childlessNeeds)
  if (needsOpen.length) issues.push(`Needs with no stakeholder requirement: write the REQ-STK, or record a disposition (${AUDIT_DISPOSITION_TEXT})
 for ${needsOpen.join(', ')}.`)
  const stkOpen = noDisp(a.childlessStk)
  if (stkOpen.length) issues.push(`Stakeholder requirements with no system requirement: derive the REQ-SYS, or record a disposition (${AUDIT_DISPOSITION_TEXT})
 for ${stkOpen.join(', ')}.`)
  const dup = duplicates([...r.moes, ...r.mops].map((m) => m.id))
  if (dup.length) issues.push(`Duplicate measure ID ${dup.join(', ')}: each ID once.`)
  const moes = r.moes.filter((m) => !measureIssues(m, 'MOE', r).length)
  const mops = r.mops.filter((m) => !measureIssues(m, 'MOP', r).length)
  if (moes.length < min.moes) issues.push(`At least ${min.moes} complete MOEs${three(r)} (${moes.length} so far).`)
  if (mops.length < min.mops) issues.push(`At least ${min.mops} complete MOPs${three(r)} (${mops.length} so far).`)
  for (const m of r.moes) {
    const miss = measureIssues(m, 'MOE', r)
    if (miss.length) issues.push(`${m.id}: add ${miss.join('; ')}.`)
  }
  for (const m of r.mops) {
    const miss = measureIssues(m, 'MOP', r)
    if (miss.length) issues.push(`${m.id}: add ${miss.join('; ')}.`)
  }
  return result(issues, `No orphans; ${a.childlessNeeds.length + a.childlessStk.length} childless items, each with a disposition; ${moes.length} MOEs and ${mops.length} MOPs, each with unit, threshold, data source and valid links.`)
}

/** Part 6 updated: the AI usage statement. */
export function checkAiStatement(r: Week2Record): PartCheck {
  const n = words(r.aiStatement)
  return result(n >= MIN_AI_WORDS ? [] : [`Write the AI usage statement for the Week 2 work (at least ${MIN_AI_WORDS} words, ${n} so far): tool, purpose, prompts, what you accepted or rejected and why, with AI-suggested items tagged; or say that no AI tool was used.`], 'AI usage statement recorded.')
}

export type PartId = 'import' | (typeof WEEK2_PARTS)[number]['id'] | 'ai'
export function allChecks(r: Week2Record): Record<PartId, PartCheck> {
  return { import: checkImport(r), conops: checkConopsPart(r), scenarios: checkScenariosPart(r), capabilities: checkCapabilitiesPart(r), requirements: checkRequirementsPart(r), audit: checkAuditPart(r), ai: checkAiStatement(r) }
}
export type RecordState = 'not-ready' | 'ready'
/** "ready" needs the Week 1 import and every part complete. */
export function recordState(r: Week2Record): RecordState {
  return Object.values(allChecks(r)).every((c) => c.ok) ? 'ready' : 'not-ready'
}

// ---------------------------------------------------------------------------------------------- Markdown
const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n+/g, '; ').trim()
export const fileStem = (r: Week2Record) => `team-${(r.week1?.team || 'NN').replace(/[^\w-]+/g, '') || 'NN'}-week2`

export function recordMarkdown(r: Week2Record, today = new Date().toISOString().slice(0, 10)): string {
  const w = r.week1
  const checks = allChecks(r)
  const c = r.conops
  const audit = auditOf(r)
  const counts = requirementCount(r)
  const statuses = requirementStatuses(r)
  const L: string[] = [
    `# Week 2 Team Record: ${cell(w?.enterprise ?? '') || '(Week 1 record not imported)'}`,
    '',
    `Team: ${cell(w?.team ?? '') || '____'} · Exported from the Week 2 lab tool, ${today}. Extends the Week 1 Team Record (Parts 1–6).`,
    '',
    `**Record status:** ${recordState(r) === 'ready' ? 'complete: every part passes its checks' : `not ready: ${Object.entries(checks).filter(([, x]) => !x.ok).length} part(s) still incomplete`}.${r.threePersonTeam ? ' Three-person team: reduced minimums (pending faculty approval).' : ''}`,
    '',
    '## 5. Stakeholder needs (revised): needs added by discovery',
    '',
  ]
  if (r.needsAdded.length) {
    L.push('| ID | Name | Need statement | Goal (MGO) | Exposed by |', '|---|---|---|---|---|')
    for (const n of r.needsAdded) {
      const d = r.discoveries.find((x) => x.kind === 'need' && x.ref === n.id)
      L.push(`| ${n.id} | ${cell(n.name)} | ${cell(n.statement)} | ${n.goal} | ${d ? `${d.scenario}, ${cell(d.where)}` : ''} |`)
    }
  } else L.push('No need was added this week.')
  L.push('', '## 6. AI usage statement (updated)', '', r.aiStatement.trim() || '_Not written yet._', '')
  const aiTagged = r.requirements.filter((q) => q.ai).map((q) => q.id)
  if (aiTagged.length) L.push(`AI-suggested, reviewed by the team: ${aiTagged.join(', ')}.`, '')
  L.push(
    '## 7. ConOps narrative',
    '',
    `- Scenario system of interest: **${cell(c.soiName)}**. ${cell(c.soi)}`,
    `- Existing situation: ${cell(c.existing)}`,
    `- Justification: ${cell(c.justification)}`,
    `- Restrictions: ${lines(c.restrictions).map(cell).join('; ')}`,
    `- Proposed system: ${cell(c.proposed)}`,
    '',
    '| Operational environment | Value |',
    '|---|---|',
    ...c.environment.filter((e) => e.label.trim() || e.value.trim()).map((e) => `| ${cell(e.label)} | ${cell(e.value)} |`),
    '',
    'User interactions:',
    ...lines(c.interactions).map((x) => `- ${x}`),
    '',
    'Operational constraints:',
    ...lines(c.constraints).map((x) => `- ${x}`),
    '',
    '## 8. Operational scenarios',
    '',
  )
  for (const s of r.scenarios) {
    const a = assessScenario(s, r)
    L.push(`### ${s.id} ${cell(s.name)} (${kindLabel(s.kind).toLowerCase()})`, '')
    L.push(`- Owner: ${s.owner.trim().toUpperCase()}${s.clinic.decision ? ` · Scenario clinic: ${s.clinic.decision}${s.clinic.reason.trim() ? ` (${cell(s.clinic.reason)})` : ''}` : ''}`)
    L.push(`- Actors: ${s.actors.filter((x) => x.name.trim()).map((x) => `${cell(x.name)}${x.primary ? ' (primary)' : ''}${x.environment ? ' (environment)' : ''}`).join('; ')}`)
    L.push(`- Trigger: ${cell(s.trigger)}`, `- Preconditions: ${cell(s.preconditions)}`, '', 'Main flow:', '')
    s.steps.forEach((x, i) => L.push(`${i + 1}. ${cell(x.actor)}: ${cell(x.action)}`))
    L.push('', 'Alternate flows:', '')
    for (const x of s.alternates) L.push(`- ${x.id} (from step ${x.fromStep || '?'}): if ${cell(x.condition)}, ${cell(x.response)} → ${x.outcome === 'ends' ? 'ends' : `rejoins step ${x.rejoin || '?'}`}`)
    L.push('', `- Success end state: ${cell(s.success)}`, `- Failure end state: ${cell(s.failure)}`, `- Checks: ${a.ok ? 'all scenario gates pass' : `fails ${a.gates.filter((g) => !g.ok).map((g) => g.id).join(', ')}`}${a.advisories.length ? `; advisory: ${a.advisories.map((x) => x.id).join(', ')}` : ''}`, '')
  }
  L.push('### Discovery log', '', '| Scenario | Where | Kind | Created or changed | What was found |', '|---|---|---|---|---|', ...r.discoveries.map((d) => `| ${d.scenario} | ${cell(d.where)} | ${d.kind} | ${d.ref} | ${cell(d.text)} |`), '')
  L.push('### Uncertainty register', '', '| ID | Name | TBD/TBR | Owner | Closed by / validated by |', '|---|---|---|---|---|', ...r.uncertainties.map((u) => `| ${u.id} | ${cell(u.name)} | ${u.id.startsWith('U-') ? u.tbx : ''} | ${cell(u.owner)} | ${cell(u.id.startsWith('U-') ? u.closeBy : u.validation)} |`), '')
  L.push('## 9. Capabilities and the needs × scenarios coverage', '', '| ID | Capability | Statement | Derived from (NEED) | Refines | Exercised by |', '|---|---|---|---|---|---|')
  for (const x of r.capabilities) L.push(`| ${x.id} | ${cell(x.name)} | ${cell(x.statement)} | ${x.needs.join(', ')} | ${x.refines} | ${x.scenarios.join(', ')} |`)
  L.push('', `| Need | ${r.scenarios.map((s) => s.id).join(' | ')} | Reason if none |`, `|---|${r.scenarios.map(() => '---|').join('')}---|`)
  for (const n of allNeeds(r)) {
    const cov = coverageOf(r, n.id)
    L.push(`| ${n.id} | ${r.scenarios.map((s) => { const e = cov.scenarios.find((x) => x.scenario === s.id); return e ? (e.steps.trim() ? cell(e.steps) : '✓') : '' }).join(' | ')} | ${cov.scenarios.length ? '' : cell(cov.reason)} |`)
  }
  L.push('', '## 10. Stakeholder and system requirements', '', `Counting (every hard gate passed): ${counts.total} (${counts.stk} stakeholder, ${counts.sys} system); types: ${counts.types.map(typeLabel).join(', ').toLowerCase() || 'none'}.`, '')
  L.push('| ID | Name | Statement | Type | Method | Criterion | Rationale | Parents | TBD/TBR | Owner | Gates | Advisories |', '|---|---|---|---|---|---|---|---|---|---|---|---|')
  for (const { q, a } of statuses) L.push(`| ${q.id} | ${cell(q.name)}${q.ai ? ' (AI-suggested, reviewed)' : ''} | ${cell(q.statement)} | ${typeLabel(q.type).toLowerCase()} | ${methodLabel(q.method).toLowerCase()} | ${cell(q.criterion)} | ${cell(q.rationale)} | ${idsIn(q.parents).join(', ')} | ${tbxTokensIn(q.statement).join(', ')} | ${q.owner.trim().toUpperCase()} | ${a.counts ? 'all pass' : `fails ${a.gates.filter((g) => !g.ok).map((g) => g.id).join(', ')}`} | ${a.advisories.map((x) => x.id).join(', ')} |`)
  L.push('', '## 11. Trace audit and measures', '', `- Orphans: ${audit.orphans.length ? audit.orphans.map((o) => `${o.id} (${o.missing.join(', ')})`).join('; ') : 'none'}`)
  L.push(`- Needs with no stakeholder requirement: ${audit.childlessNeeds.length ? audit.childlessNeeds.map((id) => `${id}: ${cell(r.dispositions[id] ?? '') || '(no disposition)'}`).join('; ') : 'none'}`)
  L.push(`- Stakeholder requirements with no system requirement: ${audit.childlessStk.length ? audit.childlessStk.map((id) => `${id}: ${cell(r.dispositions[id] ?? '') || '(no disposition)'}`).join('; ') : 'none'}`, '')
  L.push('| ID | Name | Definition | Measures | Unit | Threshold | Data source |', '|---|---|---|---|---|---|---|')
  for (const m of [...r.moes, ...r.mops]) L.push(`| ${m.id} | ${cell(m.name)} | ${cell(m.definition)} | ${idsIn(m.measures).join(', ')} | ${cell(m.unit)} | ${cell(m.threshold)} | ${cell(m.source)} |`)
  L.push('')
  return L.join('\n')
}

// ---------------------------------------------------------------------------------------------- JSON model inputs
/** The SysML v2 element each item seeds in Phase II (course working mapping; capabilities and measures are named only). */
export const SEEDS = {
  conops: ['doc', 'part def (the scenario system of interest)'],
  scenario: ['use case', 'action (one per step)'],
  capability: ['use case def or action def (named only)'],
  requirement: ['requirement def', 'requirement (usage)', 'verification case (named only)'],
  uncertainty: ['attribute with a TBD/TBR value (named only)'],
  measure: ['attribute (named only)'],
} as const

export function modelInputs(r: Week2Record) {
  const counts = requirementCount(r)
  const checks = allChecks(r)
  return {
    format: MODEL_INPUTS_FORMAT,
    version: MODEL_INPUTS_VERSION,
    team: r.week1?.team ?? '',
    status: recordState(r),
    threePersonTeam: r.threePersonTeam,
    week1: r.week1,
    conops: { ...r.conops, restrictions: lines(r.conops.restrictions), interactions: lines(r.conops.interactions), constraints: lines(r.conops.constraints), seeds: SEEDS.conops },
    scenarios: r.scenarios.map((s) => {
      const a = assessScenario(s, r)
      return { ...s, steps: s.steps.map((x, i) => ({ n: i + 1, ...x })), gatesFailed: a.gates.filter((g) => !g.ok).map((g) => g.id), advisories: a.advisories.map((x) => x.id), seeds: SEEDS.scenario }
    }),
    discoveries: r.discoveries,
    uncertainties: r.uncertainties.map((u) => ({ ...u, kind: u.id.startsWith('U-') ? 'unknown' : 'assumption', seeds: SEEDS.uncertainty })),
    needsAdded: r.needsAdded,
    coverage: allNeeds(r).map((n) => ({ need: n.id, ...coverageOf(r, n.id) })),
    capabilities: r.capabilities.map((x) => ({ ...x, seeds: SEEDS.capability })),
    requirements: requirementStatuses(r).map(({ q, a }) => ({ ...q, level: a.level === 'STK' ? 'stakeholder' : 'system', parents: idsIn(q.parents), tbx: idsIn(q.tbx), tokens: tbxTokensIn(q.statement), counts: a.counts, gatesFailed: a.gates.filter((g) => !g.ok).map((g) => g.id), advisories: a.advisories.map((x) => x.id), seeds: SEEDS.requirement })),
    dispositions: r.dispositions,
    moes: r.moes.map((m) => ({ ...m, measures: idsIn(m.measures), seeds: SEEDS.measure })),
    mops: r.mops.map((m) => ({ ...m, measures: idsIn(m.measures), seeds: SEEDS.measure })),
    aiStatement: r.aiStatement.trim(),
    checks: {
      requirements: counts,
      parts: Object.fromEntries(Object.entries(checks).map(([k, x]) => [k, { ok: x.ok, issues: x.issues.length }])),
      audit: auditOf(r),
    },
    issued: r.issued,
  }
}

// ---------------------------------------------------------------------------------------------- import (teammate share)
const kindOf = (x: unknown) => (x === null ? 'null' : Array.isArray(x) ? 'a list' : typeof x === 'object' ? 'an object' : typeof x === 'string' ? 'text' : typeof x)

/** Reads a Week 2 model-inputs JSON file (a teammate's export) back into a record. Every problem is returned as a
 *  message the student can act on; nothing is thrown. */
export function importWeek2(text: string): Week2Record | { error: string } {
  try {
    return importUnsafe(text)
  } catch (e) {
    return { error: `This file could not be read as Week 2 model inputs (${e instanceof Error ? e.message : String(e)}).` }
  }
}

function importUnsafe(text: string): Week2Record | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON.' }
  }
  if (isObj(d) && d.format === 'week1-model-inputs') return { error: 'This is a Week 1 model-inputs file: use “Import the Week 1 record” at the top of the tool.' }
  if (!isObj(d) || d.format !== MODEL_INPUTS_FORMAT) return { error: `This is not a Week 2 model-inputs file (format “${MODEL_INPUTS_FORMAT}”).` }
  if (d.version !== MODEL_INPUTS_VERSION) return { error: `This Week 2 file has version ${JSON.stringify(d.version)}; this tool reads version ${MODEL_INPUTS_VERSION}.` }
  const lists: [string, unknown][] = [['scenarios', d.scenarios], ['discoveries', d.discoveries], ['uncertainties', d.uncertainties], ['needsAdded', d.needsAdded], ['coverage', d.coverage], ['capabilities', d.capabilities], ['requirements', d.requirements], ['moes', d.moes], ['mops', d.mops]]
  for (const [path, x] of lists) {
    if (x === undefined) continue
    if (!Array.isArray(x)) return { error: `“${path}” must be a list; this file has ${kindOf(x)}.` }
    const bad = x.findIndex((y) => !isObj(y))
    if (bad >= 0) return { error: `“${path}” item ${bad + 1} is ${kindOf(x[bad])}, not an object.` }
  }
  if (d.week1 !== undefined && d.week1 !== null && !isObj(d.week1)) return { error: `“week1” must be an object; this file has ${kindOf(d.week1)}.` }
  if (d.conops !== undefined && !isObj(d.conops)) return { error: `“conops” must be an object; this file has ${kindOf(d.conops)}.` }
  for (const s of objs(d.scenarios)) for (const k of ['actors', 'steps', 'alternates'] as const) if (s[k] !== undefined && !Array.isArray(s[k])) return { error: `${str(s.id) || 'A scenario'}: “${k}” must be a list; this file has ${kindOf(s[k])}.` }
  const w1 = isObj(d.week1) ? d.week1 : undefined
  if (w1 && isAeroLink(str(w1.enterprise))) return { error: 'This file is about AeroLink, the instructor’s worked example: import your team’s own record.' }
  const rec = normalizeRecord({ ...d, coverage: objs(d.coverage).filter((c) => objs(c.scenarios).length || str(c.reason).trim()) })
  const checks: [string, string[], RegExp][] = [
    ['scenario', rec.scenarios.map((x) => x.id), ID_FORMS.SCN],
    ['capability', rec.capabilities.map((x) => x.id), ID_FORMS.CAP],
    ['requirement', rec.requirements.map((x) => x.id), /^REQ-(?:STK|SYS)-\d{3}$/],
    ['MOE', rec.moes.map((x) => x.id), ID_FORMS.MOE],
    ['MOP', rec.mops.map((x) => x.id), ID_FORMS.MOP],
    ['register', rec.uncertainties.map((x) => x.id), /^[UA]-\d{3}$/],
    ['need', allNeeds(rec).map((x) => x.id), ID_FORMS.NEED],
  ]
  for (const [label, ids, re] of checks) {
    const bad = ids.filter((id) => !re.test(id))
    if (bad.length) return { error: `Unexpected ${label} IDs in the file: ${bad.slice(0, 3).map((x) => x || '(empty)').join(', ')}. IDs look like ${label === 'requirement' ? 'REQ-STK-001 or REQ-SYS-001' : label === 'register' ? 'U-001 or A-001' : re.source.replace(/[\^$\\]/g, '').replace('d{3}', '001')}.` }
    const dup = duplicates(ids)
    if (dup.length) return { error: `Duplicate ID ${dup[0]} (${ids.filter((x) => x === dup[0]).length} times) in the file: each ID once. Fix the file, or ask the teammate who exported it to export again.` }
  }
  return rec
}
