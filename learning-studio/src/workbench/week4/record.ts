// Week 4 Team Record (pure logic, no React): the team's architecture viewpoints (Part 15), functional architecture
// (Part 16), logical and physical elements with the allocation and the architecture decision (Part 17), and the
// information view with the AI capability cards (Part 18), plus the AI usage statement. The record EXTENDS the team's
// Week 3 Team Record: it is started from the Week 3 model-inputs JSON (`week3-model-inputs` v1, read with Week 3's
// importWeek3, read-only) and keeps a snapshot of the items it traces to (needs, capabilities, scenarios, requirements,
// risks, TPMs and the trade decision).
//
// Single sources: every minimum, gate id, view kind and allocation criterion is read from
// src/content/lectures/week04/labBrief.ts, so the lecture, the worked example and the tool apply the same rules.
//
// Patterns mirror src/workbench/week3/record.ts: normalize never throws, IDs are issued by the tool and never reused after
// deletion, checks return { ok, issues, detail, notes }, hard gates block an entry from counting, advisories never block,
// Markdown + JSON export with format/version, import with clear messages. record.test.ts tests every gate in both
// directions. AeroLink is the instructor's worked example: a record about AeroLink is refused.
import {
  AI_GATES, ALLOCATION_CRITERIA, ALLOCATION_GATES, CONSISTENCY_CHECKS, DECISION_GATES, FUNCTION_ADVISORIES, FUNCTION_GATES, INFO_ADVISORIES, INFO_GATES, LAB4_MINIMUMS, LAB4_MINIMUMS_THREE,
  REQUIRED_VIEW_KINDS, SPAN, THING_WORDS, VIEWPOINT_ADVISORIES, VIEWPOINT_GATES, VIEW_KINDS, WEEK4_PARTS, criterionLabel, viewKindLabel,
  type AiGateId, type AllocationGateId, type CriterionId, type DecisionGateId, type FunctionAdvisoryId, type FunctionGateId, type InfoAdvisoryId, type InfoGateId, type Lab4Minimums, type ViewKind, type ViewpointAdvisoryId,
  type ViewpointGateId,
} from '../../content/lectures/week04/labBrief'
import { importWeek3, recordState as week3State, type Week3Record } from '../week3/record'
import { importModelInputs as importWeek1Team, isAeroLink } from '../week1/team'

export const W4_KEY = 'w4.record'
export const MODEL_INPUTS_FORMAT = 'week4-model-inputs'
export const MODEL_INPUTS_VERSION = 1
export const SOURCE_FORMAT = 'week3-model-inputs'
export const MIN_AI_WORDS = 12
/** Tool conventions for free-text fields (not lab minimums). Gate sweep 2026-10-19 (docs/lectures/GATE_SWEEP_2026-10-19.md):
 *  no free-text gate counts words beyond "something is written", because a short entry can be complete ("Who decides?",
 *  "Cheaper", "Restock", "Feed families"). The one remaining minimum is MIN_SENTENCE_WORDS for the allocation
 *  justification, which the lab asks for as a sentence (stated in the gate text). MIN_TEXT_WORDS and MIN_PART_WORDS are
 *  kept as exports for compatibility; no gate reads them any more. */
export const MIN_TEXT_WORDS = 5
export const MIN_PART_WORDS = 3
export const MIN_SENTENCE_WORDS = 2
/** An answer that says there is nothing ("none", "n/a", "nobody"): not an oversight arrangement and not a failure mode. */
const NOTHING = /^(?:none|n\/?a|nil|nobody|no one|no-one|nothing|no oversight|-+|\?+|tbd)\.?$/i
export { isAeroLink, CONSISTENCY_CHECKS }

export const minimumsOf = (r: Pick<Week4Record, 'threePersonTeam'>): Lab4Minimums => (r.threePersonTeam ? LAB4_MINIMUMS_THREE : LAB4_MINIMUMS)

// ---------------------------------------------------------------------------------------------- types
export type Week3Snapshot = {
  team: string
  enterprise: string
  soi: string
  needs: { id: string; name: string }[]
  capabilities: { id: string; name: string }[]
  scenarios: { id: string; name: string }[]
  requirements: { id: string; name: string; statement: string }[]
  risks: { id: string; name: string; category: string }[]
  tpms: { id: string; name: string; measures: string }[]
  decision: { recommended: string; name: string; derived: string[] }
  threePersonTeam: boolean
  week3Status: string
  sourceVersion: number
}
export type Viewpoint = { id: string; kind: ViewKind | ''; name: string; purpose: string; stakeholders: string; concerns: string; serves: string; form: string }
export type Group = { id: string; name: string }
export type Fn = {
  id: string
  name: string
  group: string
  /** One input per line; one output per line. */
  inputs: string
  outputs: string
  capabilities: string
  scenarios: string
  /** The reason a function has no scenario (a planning function); empty otherwise. */
  planning: string
  requirements: string
  log: string
  phy: string
  criterion: CriterionId | ''
  why: string
  human: string
  ai: boolean
}
export type Logical = { id: string; name: string; text: string; phys: string }
export type Physical = { id: string; name: string; text: string; requirements: string }
export type External = { id: string; name: string }
export type Decision = { id: string; question: string; alternatives: string; chosen: string; rationale: string; links: string }
export type Info = { id: string; name: string; content: string; data: string; information: string; producers: string; consumers: string; decision: string; decisionRefs: string; route: string; sensitivity: string; ai: boolean }
export type AiCard = { id: string; name: string; host: string; supports: string; inputs: string; outputs: string; oversight: string; failure: string; dataQuality: string }
export type Issued = { VP: number; FG: number; FN: number; LOG: number; PHY: number; EXT: number; DEC: number; INFO: number; AI: number }
export type IdPrefix = keyof Issued
export type Week4Record = {
  week3: Week3Snapshot | null
  /** The Week 1 context EXT IDs (optional Week 1 file; Week 7 review M3): new externals continue after the highest, so a
   *  Week 4 external never reuses a Week 1 ID for a different element; an external that IS a Week 1 system keeps its ID. */
  week1Externals: { id: string; name: string }[]
  threePersonTeam: boolean
  mission: string
  viewpoints: Viewpoint[]
  groups: Group[]
  functions: Fn[]
  logical: Logical[]
  physical: Physical[]
  externals: External[]
  decisions: Decision[]
  information: Info[]
  ai: AiCard[]
  aiStatement: string
  issued: Issued
  updatedAt?: number
  exportedMdAt?: number
  exportedJsonAt?: number
}

export const EMPTY_ISSUED: Issued = { VP: 0, FG: 0, FN: 0, LOG: 0, PHY: 0, EXT: 0, DEC: 0, INFO: 0, AI: 0 }
export const EMPTY_RECORD: Week4Record = { week3: null, week1Externals: [], threePersonTeam: false, mission: '', viewpoints: [], groups: [], functions: [], logical: [], physical: [], externals: [], decisions: [], information: [], ai: [], aiStatement: '', issued: EMPTY_ISSUED }
export const EMPTY_VIEWPOINT = (id: string, kind: ViewKind | '' = ''): Viewpoint => ({ id, kind, name: kind ? `${viewKindLabel(kind)} viewpoint` : '', purpose: '', stakeholders: '', concerns: '', serves: '', form: '' })
export const EMPTY_GROUP = (id: string): Group => ({ id, name: '' })
export const EMPTY_FN = (id: string): Fn => ({ id, name: '', group: '', inputs: '', outputs: '', capabilities: '', scenarios: '', planning: '', requirements: '', log: '', phy: '', criterion: '', why: '', human: '', ai: false })
export const EMPTY_LOGICAL = (id: string): Logical => ({ id, name: '', text: '', phys: '' })
export const EMPTY_PHYSICAL = (id: string): Physical => ({ id, name: '', text: '', requirements: '' })
export const EMPTY_EXTERNAL = (id: string): External => ({ id, name: '' })
export const EMPTY_DECISION = (id: string): Decision => ({ id, question: '', alternatives: '', chosen: '', rationale: '', links: '' })
export const EMPTY_INFO = (id: string): Info => ({ id, name: '', content: '', data: '', information: '', producers: '', consumers: '', decision: '', decisionRefs: '', route: '', sensitivity: '', ai: false })
export const EMPTY_AI = (id: string): AiCard => ({ id, name: '', host: '', supports: '', inputs: '', outputs: '', oversight: '', failure: '', dataQuality: '' })

// ---------------------------------------------------------------------------------------------- helpers
const pad = (n: number, w = 3) => String(n).padStart(w, '0')
const num = (id: string) => Number(id.split('-').pop()) || 0
const str = (x: unknown) => (typeof x === 'string' ? x : x === undefined || x === null ? '' : String(x))
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const objs = (x: unknown): Record<string, unknown>[] => (Array.isArray(x) ? x.filter(isObj) : [])
const oneOf = <T extends string>(x: unknown, allowed: readonly T[]): T | '' => (allowed.includes(x as T) ? (x as T) : '')
const int = (x: unknown) => (typeof x === 'number' && Number.isInteger(x) && x > 0 ? x : 0)
const linkText = (x: unknown) => (Array.isArray(x) ? x.map(str).join(', ') : str(x))
const lineText = (x: unknown) => (Array.isArray(x) ? x.map(str).join('\n') : str(x))
const upId = (x: unknown) => str(x).trim().toUpperCase()
export const words = (s: string) => s.split(/\s+/).filter(Boolean).length
export const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)
/** One list item without its marker: "- x", "* x", "• x", "1. x", "1) x", "a) x" all read as "x". */
export const unlist = (s: string) => s.trim().replace(/^(?:[-*•–](?:\s+|$)|(?:\d{1,2}|[a-zA-Z])[.)](?:\s+|$))/u, '').trim()
export const duplicates = (ids: string[]) => [...new Set(ids.filter((x, i) => x && ids.indexOf(x) !== i))]
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
const VIEW_IDS = VIEW_KINDS.map((v) => v.id)
const CRITERION_IDS = ALLOCATION_CRITERIA.map((c) => c.id)

export const ID_FORMS: Record<IdPrefix, RegExp> = {
  VP: /^VP-\d{3}$/, FG: /^FG-\d{3}$/, FN: /^FN-\d{3}$/, LOG: /^LOG-\d{3}$/, PHY: /^PHY-\d{3}$/, EXT: /^EXT-\d{3}$/, DEC: /^DEC-\d{3}$/, INFO: /^INFO-\d{3}$/, AI: /^AI-\d{3}$/,
}
const ANY_ID = /\b(?:REQ-(?:STK|SYS)|NEED|MGO|SCN|CAP|MOE|MOP|TPM|R|VP|FG|FN|LOG|PHY|EXT|DEC|INFO|AI)-\d{3}\b/g
/** A Week 1 concern ID (CON-001): accepted where a concern is asked for. Week 1 concerns are not in the Week 3 snapshot,
 *  so the tool cannot check that the ID exists; it accepts the form. */
const CONCERN_ID = /\bCON-\d{3}\b/i
/** The IDs written in a free-text link field, upper-cased, each once. */
export const idsIn = (s: string) => [...new Set(s.toUpperCase().match(ANY_ID) ?? [])]
export const partTitle = (id: (typeof WEEK4_PARTS)[number]['id']) => WEEK4_PARTS.find((p) => p.id === id)!.title
export const partNumber = (id: (typeof WEEK4_PARTS)[number]['id']) => WEEK4_PARTS.find((p) => p.id === id)!.n

// ---------------------------------------------------------------------------------------------- normalize
function normalizeSnapshot(v: unknown): Week3Snapshot | null {
  if (!isObj(v)) return null
  const pair = (x: Record<string, unknown>) => ({ id: upId(x.id), name: str(x.name) })
  const d = isObj(v.decision) ? v.decision : {}
  return {
    team: str(v.team), enterprise: str(v.enterprise), soi: str(v.soi),
    needs: objs(v.needs).map(pair), capabilities: objs(v.capabilities).map(pair), scenarios: objs(v.scenarios).map(pair),
    requirements: objs(v.requirements).map((x) => ({ ...pair(x), statement: str(x.statement) })),
    risks: objs(v.risks).map((x) => ({ ...pair(x), category: str(x.category) })),
    tpms: objs(v.tpms).map((x) => ({ ...pair(x), measures: upId(x.measures) })),
    decision: { recommended: upId(d.recommended), name: str(d.name), derived: Array.isArray(d.derived) ? d.derived.map(str) : [] },
    threePersonTeam: v.threePersonTeam === true, week3Status: str(v.week3Status), sourceVersion: int(v.sourceVersion),
  }
}

/** Fills missing fields of a stored or imported record. Never throws. */
export function normalizeRecord(v: unknown): Week4Record {
  const r = isObj(v) ? v : {}
  const week3 = normalizeSnapshot(r.week3)
  const rec: Week4Record = {
    week3,
    week1Externals: objs(r.week1Externals).map((x) => ({ id: upId(x.id), name: str(x.name) })).filter((x) => /^EXT-\d{3}$/.test(x.id)),
    threePersonTeam: typeof r.threePersonTeam === 'boolean' ? r.threePersonTeam : (week3?.threePersonTeam ?? false),
    mission: str(r.mission),
    viewpoints: objs(r.viewpoints).map((x) => ({ id: upId(x.id), kind: oneOf(x.kind, VIEW_IDS), name: str(x.name), purpose: str(x.purpose), stakeholders: str(x.stakeholders), concerns: str(x.concerns), serves: linkText(x.serves), form: str(x.form) })),
    groups: objs(r.groups).map((x) => ({ id: upId(x.id), name: str(x.name) })),
    functions: objs(r.functions).map((x) => ({
      ...EMPTY_FN(upId(x.id)),
      name: str(x.name), group: upId(x.group), inputs: lineText(x.inputs), outputs: lineText(x.outputs), capabilities: linkText(x.capabilities), scenarios: linkText(x.scenarios), planning: str(x.planning),
      requirements: linkText(x.requirements), log: upId(x.log), phy: upId(x.phy), criterion: oneOf(x.criterion, CRITERION_IDS), why: str(x.why), human: str(x.human), ai: x.ai === true,
    })),
    logical: objs(r.logical).map((x) => ({ id: upId(x.id), name: str(x.name), text: str(x.text), phys: linkText(x.phys) })),
    physical: objs(r.physical).map((x) => ({ id: upId(x.id), name: str(x.name), text: str(x.text), requirements: linkText(x.requirements) })),
    externals: objs(r.externals).map((x) => ({ id: upId(x.id), name: str(x.name) })),
    decisions: objs(r.decisions).map((x) => ({ id: upId(x.id), question: str(x.question), alternatives: lineText(x.alternatives), chosen: str(x.chosen), rationale: str(x.rationale), links: linkText(x.links) })),
    information: objs(r.information).map((x) => ({
      ...EMPTY_INFO(upId(x.id)),
      name: str(x.name), content: str(x.content), data: str(x.data), information: str(x.information), producers: linkText(x.producers), consumers: linkText(x.consumers), decision: str(x.decision),
      decisionRefs: linkText(x.decisionRefs), route: str(x.route), sensitivity: str(x.sensitivity), ai: x.ai === true,
    })),
    ai: objs(r.ai).map((x) => ({ id: upId(x.id), name: str(x.name), host: upId(x.host), supports: upId(x.supports), inputs: linkText(x.inputs), outputs: str(x.outputs), oversight: str(x.oversight), failure: str(x.failure), dataQuality: str(x.dataQuality) })),
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

export function idsOf(r: Week4Record, prefix: IdPrefix): string[] {
  switch (prefix) {
    case 'VP': return r.viewpoints.map((x) => x.id)
    case 'FG': return r.groups.map((x) => x.id)
    case 'FN': return r.functions.map((x) => x.id)
    case 'LOG': return r.logical.map((x) => x.id)
    case 'PHY': return r.physical.map((x) => x.id)
    case 'EXT': return r.externals.map((x) => x.id)
    case 'DEC': return r.decisions.map((x) => x.id)
    case 'INFO': return r.information.map((x) => x.id)
    case 'AI': return r.ai.map((x) => x.id)
  }
}
/** IDs a new ID must come after: the record's own, plus (EXT) the Week 1 context IDs when the Week 1 file is loaded. */
function floorIds(r: Week4Record, prefix: IdPrefix): string[] {
  return prefix === 'EXT' ? [...idsOf(r, prefix), ...(r.week1Externals ?? []).map((x) => x.id)] : idsOf(r, prefix)
}
/** The next ID for a prefix: one past the highest ever issued, present or imported, so a deleted ID is never reused and a
 *  new external never takes a Week 1 ID. */
export function nextId(r: Week4Record, prefix: IdPrefix): string {
  return `${prefix}-${pad(Math.max(r.issued[prefix], 0, ...floorIds(r, prefix).map(num)) + 1)}`
}
export const withIssued = (r: Week4Record, prefix: IdPrefix, id: string): Issued => ({ ...r.issued, [prefix]: Math.max(r.issued[prefix], num(id)) })

// ---------------------------------------------------------------------------------------------- Week 3 import
/** The Week 3 snapshot kept in the Week 4 record, from a Week 3 record. */
export function snapshotOf(w: Week3Record, sourceVersion: number): Week3Snapshot {
  const w2 = w.week2
  const alt = w.trade.alternatives.find((a) => a.id === w.trade.recommended)
  return {
    team: (w2?.team ?? '').trim(), enterprise: (w2?.enterprise ?? '').trim(), soi: (w2?.soi ?? '').trim(),
    needs: (w2?.needs ?? []).map((x) => ({ id: x.id, name: x.name })),
    capabilities: (w2?.capabilities ?? []).map((x) => ({ id: x.id, name: x.name })),
    scenarios: (w2?.scenarios ?? []).map((x) => ({ id: x.id, name: x.name })),
    requirements: (w2?.requirements ?? []).map((x) => ({ id: x.id, name: x.name, statement: x.statement })),
    risks: w.risks.map((x) => ({ id: x.id, name: x.name.trim(), category: x.category })),
    tpms: w.tpms.map((x) => ({ id: x.id, name: x.name.trim(), measures: x.measures })),
    decision: { recommended: w.trade.recommended, name: alt?.name.trim() ?? '', derived: lines(w.trade.derived) },
    threePersonTeam: w.threePersonTeam,
    week3Status: week3State(w),
    sourceVersion,
  }
}

/** Reads the team's Week 3 model-inputs JSON with Week 3's own importer and returns the snapshot, or a message the
 *  student can act on. A record about AeroLink, an earlier-week file and a Week 4 file are refused. Never throws. */
export function importWeek3File(text: string): { snapshot: Week3Snapshot } | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON.' }
  }
  if (isObj(d) && (d.format === 'week1-model-inputs' || d.format === 'week2-model-inputs')) return { error: `This is a ${d.format === 'week1-model-inputs' ? 'Week 1' : 'Week 2'} model-inputs file. The Week 4 record starts from your team’s Week 3 export (team-NN-week3-model-inputs.json).` }
  if (isObj(d) && d.format === MODEL_INPUTS_FORMAT) return { error: 'This is a Week 4 model-inputs file: use “Import a teammate’s Week 4 model-inputs file” at the top of the tool.' }
  const w = importWeek3(text)
  if ('error' in w) return { error: w.error }
  if (!w.week2) return { error: 'This Week 3 record carries no Week 2 snapshot (requirements, capabilities, scenarios): export it again from the Week 3 lab tool after importing the Week 2 record.' }
  if ([w.week2.enterprise, w.week2.soi].some(isAeroLink)) return { error: 'This Week 3 record names AeroLink, the instructor’s worked example. Import your team’s own record.' }
  if (!w.week2.requirements.length || !w.week2.capabilities.length) return { error: 'This Week 3 record has no requirements or no capabilities: the Week 4 functions trace to both, so export the record again once they are in.' }
  return { snapshot: snapshotOf(w, int(isObj(d) ? d.version : 0)) }
}

/** Puts a Week 3 snapshot into the record, keeping the Week 4 work, and seeds one viewpoint of each required kind that is
 *  not there yet (the course minimum), so the team starts from the required view set. */
export function withWeek3(r: Week4Record, snapshot: Week3Snapshot): Week4Record {
  let next: Week4Record = { ...r, week3: snapshot, threePersonTeam: snapshot.threePersonTeam }
  for (const k of REQUIRED_VIEW_KINDS) {
    if (next.viewpoints.some((v) => v.kind === k)) continue
    const id = nextId(next, 'VP')
    next = { ...next, viewpoints: [...next.viewpoints, EMPTY_VIEWPOINT(id, k)], issued: withIssued(next, 'VP', id) }
  }
  return next
}

// ---------------------------------------------------------------------------------------------- Week 1 externals (optional)
/** Reads the team's Week 1 model-inputs file (Week 1's own importer, read-only) for its context EXT IDs only, so that new
 *  Week 4 externals continue the numbering (Week 7 review M3: Week 4 used to number from EXT-001 and collide). Refuses other
 *  files and AeroLink. Never throws. */
export function importWeek1Externals(text: string): { externals: { id: string; name: string }[] } | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON. Choose your Week 1 export (team-NN-model-inputs.json).' }
  }
  if (!isObj(d) || d.format !== 'week1-model-inputs') return { error: 'This is not a Week 1 model-inputs file (format “week1-model-inputs”). This field only reads your Week 1 export, for its external IDs.' }
  const t = importWeek1Team(text)
  if ('error' in t) return { error: t.error }
  if ([t.proposal.name, t.proposal.soi].some(isAeroLink)) return { error: 'This Week 1 record names AeroLink, the instructor’s worked example. Load your team’s own record.' }
  return { externals: t.context.map((c) => ({ id: c.id.trim().toUpperCase(), name: c.name.trim() })).filter((x) => /^EXT-\d{3}$/.test(x.id)) }
}
/** Keeps the Week 1 context EXT IDs and raises the EXT floor above them (nothing already in the record is renumbered). */
export function withWeek1Externals(r: Week4Record, externals: { id: string; name: string }[]): Week4Record {
  const next = { ...r, week1Externals: externals }
  return { ...next, issued: { ...next.issued, EXT: Math.max(next.issued.EXT, ...floorIds(next, 'EXT').map(num), 0) } }
}

// ---------------------------------------------------------------------------------------------- lookups
const snapSet = (r: Week4Record, k: 'needs' | 'capabilities' | 'scenarios' | 'requirements' | 'risks' | 'tpms') => new Set((r.week3?.[k] ?? []).map((x) => x.id))
export const isSystemRequirement = (id: string) => id.startsWith('REQ-SYS-')
/** Where an information item's AI producer or consumer stands: its host element. */
export const placeOf = (r: Week4Record, id: string) => (id.startsWith('AI-') ? (r.ai.find((a) => a.id === id)?.host ?? id) : id)

export type Gate<T extends string = string> = { id: T; ok: boolean; message: string }
export type Advisory<T extends string = string> = { id: T; message: string }
export type Assessment<G extends string, A extends string> = { gates: Gate<G>[]; advisories: Advisory<A>[]; counts: boolean }
const collector = <G extends string, A extends string>() => {
  const gates: Gate<G>[] = []
  const advisories: Advisory<A>[] = []
  return {
    gate: (id: G, ok: boolean, message: string) => gates.push({ id, ok, message }),
    adv: (id: A, message: string) => advisories.push({ id, message }),
    done: (): Assessment<G, A> => ({ gates, advisories, counts: gates.every((g) => g.ok) }),
  }
}
export const gateShort = (list: readonly { id: string; short: string }[], id: string) => list.find((g) => g.id === id)?.short ?? id
const unknown = (ids: string[], known: Set<string>) => ids.filter((x) => !known.has(x))

// ---------------------------------------------------------------------------------------------- viewpoints
export function assessViewpoint(v: Viewpoint, r: Week4Record): Assessment<ViewpointGateId, ViewpointAdvisoryId> {
  const c = collector<ViewpointGateId, ViewpointAdvisoryId>()
  c.gate('kind', !!v.kind, v.kind ? viewKindLabel(v.kind) : 'choose the kind of view')
  c.gate('purpose', words(v.purpose) >= 1, words(v.purpose) >= 1 ? 'purpose stated' : 'write the question the view answers for its stakeholders')
  // a concern is valid as one word ("Noise") or as its Week 1 ID ("CON-003"): the lecture asks for the concern, not a length
  const sOk = words(v.stakeholders) >= 1 && (words(v.concerns) >= 1 || CONCERN_ID.test(v.concerns))
  c.gate('stakeholders', sOk, sOk ? 'stakeholders and concern named' : 'name the stakeholders and the concern the view answers (in words, or its concern ID)')
  const known = new Set([...snapSet(r, 'needs'), ...snapSet(r, 'capabilities'), ...snapSet(r, 'requirements')])
  const ids = idsIn(v.serves)
  const strange = unknown(ids, known)
  c.gate('serves', !strange.length, strange.length ? `${strange.join(', ')} not in the record` : ids.length ? `serves ${ids.join(', ')}` : 'no link named (advisory)')
  c.gate('form', words(v.form) >= 1, words(v.form) >= 1 ? 'conventions stated' : 'say the form of the view (table, diagram, list) and the element types it shows')
  if (!ids.length) c.adv('no-serves', gateShort(VIEWPOINT_ADVISORIES, 'no-serves'))
  return c.done()
}

// ---------------------------------------------------------------------------------------------- functions
export function assessFunction(f: Fn, r: Week4Record): Assessment<FunctionGateId, FunctionAdvisoryId> {
  const c = collector<FunctionGateId, FunctionAdvisoryId>()
  const name = f.name.trim().toLowerCase()
  const clash = [...r.logical, ...r.physical].find((e) => e.name.trim() && e.name.trim().toLowerCase() === name)
  c.gate('name', !!name && !clash, !name ? 'name the action' : clash ? `“${f.name.trim()}” is the name of ${clash.id}: name the action, not the element` : 'named as an action')
  const io = lines(f.inputs).length > 0 && lines(f.outputs).length > 0
  c.gate('io', io, io ? `${plural(lines(f.inputs).length, 'input')}, ${plural(lines(f.outputs).length, 'output')}` : 'give at least one input and one output (inputs and outputs are part of a function)')
  const caps = idsIn(f.capabilities).filter((x) => x.startsWith('CAP-'))
  const badCaps = unknown(caps, snapSet(r, 'capabilities'))
  c.gate('capability', caps.length > 0 && !badCaps.length, badCaps.length ? `${badCaps.join(', ')} not in the record` : caps.length ? `derived from ${caps.join(', ')}` : 'trace it to at least one capability')
  const scns = idsIn(f.scenarios).filter((x) => x.startsWith('SCN-'))
  const badScns = unknown(scns, snapSet(r, 'scenarios'))
  // a reason that only repeats the label ("planning", "planning function") gives no reason; any other reason counts
  const planning = words(f.planning) >= 1 && !/^(?:an? )?planning(?: function)?\.?$/i.test(f.planning.trim())
  c.gate('scenario', !badScns.length && (scns.length > 0 || planning), badScns.length ? `${badScns.join(', ')} not in the record` : scns.length ? `exercised in ${scns.join(', ')}` : planning ? 'planning function, reason given' : 'name the scenario that exercises it, or say why it is a planning function')
  c.gate('group', r.groups.some((g) => g.id === f.group), r.groups.some((g) => g.id === f.group) ? `under ${f.group}` : 'place it under a first-level function')
  const reqs = idsIn(f.requirements)
  const badReqs = unknown(reqs, snapSet(r, 'requirements'))
  c.gate('known', !badReqs.length, badReqs.length ? `${badReqs.join(', ')} not in the record` : reqs.length ? `${reqs.join(', ')} allocated` : 'no requirement allocated')
  if (name && words(f.name) === 1) c.adv('one-word', gateShort(FUNCTION_ADVISORIES, 'one-word'))
  const last = name.split(/\s+/).pop() ?? ''
  if (THING_WORDS.includes(last)) c.adv('thing-name', gateShort(FUNCTION_ADVISORIES, 'thing-name'))
  if (!reqs.length && !planning) c.adv('no-requirement', gateShort(FUNCTION_ADVISORIES, 'no-requirement'))
  return c.done()
}

export function assessAllocation(f: Fn, r: Week4Record): Assessment<AllocationGateId, never> {
  const c = collector<AllocationGateId, never>()
  const log = r.logical.find((x) => x.id === f.log)
  const phy = r.physical.find((x) => x.id === f.phy)
  c.gate('logical', !!log, log ? `${log.id} ${log.name}` : 'choose the logical element that performs it')
  c.gate('physical', !!phy, phy ? `${phy.id} ${phy.name}` : 'choose the physical element it is allocated to')
  const reach = log ? idsIn(log.phys) : []
  c.gate('consistent', !!log && !!phy && reach.includes(phy.id), !log || !phy ? 'needs both elements' : reach.includes(phy.id) ? `${log.id} reaches ${phy.id}` : `${log.id} is not allocated to ${phy.id}: add it to ${log.id}’s physical elements, or choose another`)
  const cOk = !!f.criterion && words(f.why) >= MIN_SENTENCE_WORDS
  c.gate('criterion', cOk, cOk ? criterionLabel(f.criterion) : `choose a criterion and write the sentence that justifies the allocation (at least ${MIN_SENTENCE_WORDS} words)`)
  return c.done()
}

// ---------------------------------------------------------------------------------------------- decision, information, AI
export function assessDecision(d: Decision, r: Week4Record): Assessment<DecisionGateId, never> {
  const c = collector<DecisionGateId, never>()
  c.gate('question', words(d.question) >= 1, words(d.question) >= 1 ? 'question stated' : 'state the architecture question')
  const alts = lines(d.alternatives).map(unlist).filter(Boolean)
  c.gate('alternatives', alts.length >= 3, `${plural(alts.length, 'alternative')}${alts.length < 3 ? ': list at least three, one per line' : ''}`)
  // the same alternative written with different capitals, spacing, a list marker (- * • 1. 1) a.) or any final
  // punctuation (. ; : ! ? , …) is the same alternative (gate sweep 2026-10-19; Week 4 confirmation N3)
  const same = (x: string) => unlist(x).toLowerCase().replace(/\s+/g, ' ').replace(/[\s.;:!?,…]+$/u, '')
  const chosen = same(d.chosen)
  const listed = alts.some((a) => same(a) === chosen)
  c.gate('chosen', !!chosen && listed, !chosen ? 'name the chosen alternative' : listed ? 'chosen alternative listed' : 'the chosen alternative must be one of those listed (same wording)')
  c.gate('rationale', words(d.rationale) >= 1, words(d.rationale) >= 1 ? 'rationale given' : 'give the rationale')
  const known = new Set([...snapSet(r, 'needs'), ...snapSet(r, 'requirements'), ...snapSet(r, 'risks'), ...snapSet(r, 'capabilities'), ...snapSet(r, 'tpms')])
  const ids = idsIn(d.links)
  const bad = unknown(ids, known)
  c.gate('links', ids.length > 0 && !bad.length, bad.length ? `${bad.join(', ')} not in the record` : ids.length ? `affects ${ids.join(', ')}` : 'name the needs, requirements or risks it affects')
  return c.done()
}

const PERSONAL = /\b(names?|address(es)?|phone|e-?mail|health|medical|payment|card|birth|accessib\w*|disabilit\w*|home location)\b/i
export function assessInfo(x: Info, r: Week4Record): Assessment<InfoGateId, InfoAdvisoryId> {
  const c = collector<InfoGateId, InfoAdvisoryId>()
  const nOk = words(x.name) >= 1 && words(x.content) >= 1
  c.gate('name', nOk, nOk ? 'named, content stated' : 'name the item and say what it contains')
  const norm = (t: string) => t.trim().toLowerCase().replace(/\s+/g, ' ')
  const di = words(x.data) >= 1 && words(x.information) >= 1 && norm(x.data) !== norm(x.information)
  c.gate('data-information', di, di ? 'data and information stated' : words(x.data) >= 1 && words(x.information) >= 1 ? 'the data and the information are the same text: say what the data become once structured and analyzed' : 'state the raw data and the information made from it')
  // producers and consumers may be physical elements, external elements (an alarm to the emergency services, a report to
  // a funder's portal) or AI capabilities (an AI card's output is information someone uses); the route rule then
  // applies to the AI's host element (Session 2, slides 5 and 6)
  const phys = new Set(r.physical.map((p) => p.id))
  const exts = new Set(r.externals.map((p) => p.id))
  const ais = new Set(r.ai.map((a) => a.id))
  const placed = (p: string) => phys.has(p) || exts.has(p) || ais.has(p)
  const prods = idsIn(x.producers)
  const badP = prods.filter((p) => !placed(p))
  c.gate('producer', prods.length > 0 && !badP.length, badP.length ? `${badP.join(', ')} is not a physical element, external element or AI capability in the record` : prods.length ? `from ${prods.join(', ')}` : 'name the element that produces it')
  const cons = idsIn(x.consumers)
  const badC = cons.filter((p) => !placed(p))
  c.gate('consumer', cons.length > 0 && !badC.length, badC.length ? `${badC.join(', ')} is not a physical element, external element or AI capability in the record` : cons.length ? `to ${cons.join(', ')}` : 'name the element, external system or AI capability that uses it')
  c.gate('decision', words(x.decision) >= 1, words(x.decision) >= 1 ? 'decision named' : 'name the decision it supports; if none, it is not information yet')
  const knownRef = new Set([...r.functions.map((f) => f.id), ...snapSet(r, 'requirements'), ...r.decisions.map((d) => d.id)])
  const refs = idsIn(x.decisionRefs)
  const badR = unknown(refs, knownRef)
  c.gate('decision-ref', refs.length > 0 && !badR.length, badR.length ? `${badR.join(', ')} not in the record` : refs.length ? `serves ${refs.join(', ')}` : 'name the function, requirement or decision record the decision belongs to')
  if (words(x.route) < 1) c.adv('no-route', gateShort(INFO_ADVISORIES, 'no-route'))
  if (prods.some((p) => ais.has(p))) c.adv('ai-producer', gateShort(INFO_ADVISORIES, 'ai-producer'))
  const places = new Set(cons.map((y) => placeOf(r, y)))
  if (prods.length && prods.every((p) => places.has(placeOf(r, p))) && places.size === 1) c.adv('same-element', gateShort(INFO_ADVISORIES, 'same-element'))
  if (PERSONAL.test(`${x.content} ${x.data}`) && words(x.sensitivity) < 1) c.adv('personal', gateShort(INFO_ADVISORIES, 'personal'))
  return c.done()
}

export function assessAi(a: AiCard, r: Week4Record): Assessment<AiGateId, never> {
  const c = collector<AiGateId, never>()
  const host = r.physical.find((p) => p.id === a.host)
  c.gate('host', !!host, host ? `on ${host.id}` : 'choose the physical element that hosts it')
  const f = r.functions.find((x) => x.id === a.supports)
  c.gate('function', !!f, f ? `supports ${f.id}` : 'choose the function it supports')
  const ins = idsIn(a.inputs)
  const infos = new Set(r.information.map((x) => x.id))
  const bad = unknown(ins, infos)
  c.gate('inputs', ins.length > 0 && !bad.length, bad.length ? `${bad.join(', ')} not in the information view` : ins.length ? `reads ${ins.join(', ')}` : 'name the information items it reads')
  c.gate('outputs', words(a.outputs) >= 1, words(a.outputs) >= 1 ? 'outputs stated' : 'say what it produces')
  // "none" is not an oversight arrangement: the lecture requires a human in the loop (S2 slide 7, R31 p.1370)
  const ovOk = words(a.oversight) >= 1 && !NOTHING.test(a.oversight.trim())
  c.gate('oversight', ovOk, ovOk ? 'oversight stated' : 'say who decides, and what the AI may not do on its own')
  const faOk = words(a.failure) >= 1 && !NOTHING.test(a.failure.trim())
  c.gate('failure', faOk, faOk ? 'failure mode stated' : 'name a failure mode and its effect')
  return c.done()
}

// ---------------------------------------------------------------------------------------------- consistency
export type ConsistencyResult = { check: string; ok: boolean; detail: string }
/** The four consistency checks (labBrief CONSISTENCY_CHECKS), computed on the record. */
export function consistency(r: Week4Record): ConsistencyResult[] {
  const fs = r.functions
  const noTrace = fs.filter((f) => !assessFunction(f, r).gates.filter((g) => g.id === 'capability' || g.id === 'scenario').every((g) => g.ok)).map((f) => f.id)
  const badAlloc = fs.filter((f) => !assessAllocation(f, r).counts).map((f) => f.id)
  const unalloc = unallocatedSystemRequirements(r)
  const badInfo = r.information.filter((x) => !assessInfo(x, r).gates.filter((g) => ['producer', 'consumer', 'decision'].includes(g.id)).every((g) => g.ok)).map((x) => x.id)
  const res = (k: number, bad: string[], ok: string) => ({ check: CONSISTENCY_CHECKS[k], ok: !bad.length, detail: bad.length ? `not yet: ${bad.join(', ')}` : ok })
  return [
    res(0, noTrace, `${plural(fs.length, 'function')} traced`),
    res(1, badAlloc, `${plural(fs.length, 'function')} allocated consistently`),
    res(2, unalloc, 'every system requirement allocated'),
    res(3, badInfo, `${plural(r.information.length, 'item')} complete`),
  ]
}
/** System requirements in the imported record allocated to no counting function and no physical element. */
export function unallocatedSystemRequirements(r: Week4Record): string[] {
  const counted = r.functions.filter((f) => assessFunction(f, r).counts)
  const allocated = new Set([...counted.flatMap((f) => idsIn(f.requirements)), ...r.physical.flatMap((p) => idsIn(p.requirements))])
  return (r.week3?.requirements ?? []).map((q) => q.id).filter((id) => isSystemRequirement(id) && !allocated.has(id))
}
/** Capabilities served by no function (advisory: give each a disposition or a function). */
export const capabilitiesWithoutFunction = (r: Week4Record) => (r.week3?.capabilities ?? []).map((c) => c.id).filter((id) => !r.functions.some((f) => idsIn(f.capabilities).includes(id)))

// ---------------------------------------------------------------------------------------------- part checks
export type PartCheck = { ok: boolean; issues: string[]; detail: string; notes?: string[] }
const result = (issues: string[], okDetail: string, notes: string[] = []): PartCheck => ({ ok: issues.length === 0, issues, detail: issues.length ? issues[0] + (issues.length > 1 ? ` (+${issues.length - 1} more)` : '') : okDetail, notes })
const three = (r: Week4Record) => (r.threePersonTeam ? ' (three-person team minimum, pending faculty approval)' : '')
const failed = <G extends string>(id: string, a: Assessment<G, string>, list: readonly { id: string; short: string }[]) => {
  const f = a.gates.filter((g) => !g.ok)
  return f.length ? `${id} does not count: ${gateShort(list, f[0].id)} (${f[0].message})${f.length > 1 ? ` (+${f.length - 1} more)` : ''}` : ''
}

export function checkImport(r: Week4Record): PartCheck {
  const w = r.week3
  if (!w) return result(['Import your team’s Week 3 model-inputs file (team-NN-week3-model-inputs.json): the Week 4 record traces to its capabilities, scenarios and requirements.'], '')
  const issues: string[] = []
  const notes: string[] = []
  if ([w.enterprise, w.soi].some(isAeroLink)) issues.push('The imported record names AeroLink, the instructor’s worked example: import your team’s own Week 3 record.')
  if (!w.requirements.length) issues.push('The imported record has no requirements.')
  if (w.week3Status && w.week3Status !== 'ready') notes.push('The Week 3 record was exported as “not ready”. Correct it first where the feedback asks, then import it again.')
  return result(issues, `${w.enterprise}: ${plural(w.capabilities.length, 'capability', 'capabilities')}, ${plural(w.scenarios.length, 'scenario')}, ${plural(w.requirements.length, 'requirement')} from Weeks 2–3${w.decision.name ? `; decision: ${w.decision.name}` : ''}.`, notes)
}

export function checkViewsPart(r: Week4Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  const dup = duplicates(r.viewpoints.map((v) => v.id))
  if (dup.length) issues.push(`Duplicate viewpoint ID ${dup.join(', ')}: each ID once.`)
  const st = r.viewpoints.map((v) => ({ v, a: assessViewpoint(v, r) }))
  const counting = st.filter((x) => x.a.counts && !dup.includes(x.v.id))
  if (counting.length < min.viewpoints) issues.push(`At least ${min.viewpoints} viewpoints that pass every hard gate (${counting.length} so far).`)
  const missing = REQUIRED_VIEW_KINDS.filter((k) => !counting.some((x) => x.v.kind === k))
  if (missing.length) issues.push(`The course minimum needs a counting viewpoint of each kind: ${missing.map((k) => viewKindLabel(k).toLowerCase()).join(', ')} still missing.`)
  for (const { v, a } of st) {
    const m = failed(v.id, a, VIEWPOINT_GATES)
    if (m) issues.push(m)
    for (const x of a.advisories) notes.push(`${v.id}: advisory, ${x.message}`)
  }
  const served = new Set(counting.flatMap((x) => idsIn(x.v.serves)))
  const unserved = (r.week3?.needs ?? []).map((n) => n.id).filter((id) => !served.has(id))
  if (unserved.length) notes.push(`Needs no viewpoint serves yet: ${unserved.join(', ')}. Check that their concerns are answered by some view.`)
  return result(issues, `${counting.length} viewpoints count, covering every required kind.`, notes)
}

export function checkFunctionsPart(r: Week4Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  const dup = duplicates([...r.functions.map((f) => f.id), ...r.groups.map((g) => g.id)])
  if (dup.length) issues.push(`Duplicate ID ${dup.join(', ')}: each ID once.`)
  // the mission is a function name: verb plus object ("Feed families") is complete; one word is an advisory, as for any
  // function (gate sweep 2026-10-19; Week 4 confirmation N3)
  if (words(r.mission) < 1) issues.push('Name the mission function at the top of the tree (an action: a verb and its object).')
  else if (words(r.mission) === 1) notes.push('Advisory: the mission function is one word; add the object the action works on (verb and object).')

  const st = r.functions.map((f) => ({ f, a: assessFunction(f, r) }))
  const counting = st.filter((x) => x.a.counts && !dup.includes(x.f.id))
  if (counting.length < min.functions) issues.push(`At least ${min.functions} functions that pass every hard gate${three(r)} (${counting.length} so far).`)
  const usedGroups = r.groups.filter((g) => words(g.name) >= 1 && counting.some((x) => x.f.group === g.id))
  if (usedGroups.length < min.groups) issues.push(`At least ${min.groups} first-level functions, each with a name and at least one function under it (${usedGroups.length} so far).`)
  if (r.groups.length && (r.groups.length < SPAN.low || r.groups.length > SPAN.high)) notes.push(`Advisory: ${r.groups.length} first-level functions; five plus or minus two per level is the usual guideline.`)
  for (const { f, a } of st) {
    const m = failed(f.id, a, FUNCTION_GATES)
    if (m) issues.push(m)
    for (const x of a.advisories) notes.push(`${f.id}: advisory, ${x.message}`)
    if (isAeroLink(`${f.name} ${f.inputs} ${f.outputs}`)) issues.push(`${f.id} names AeroLink, the instructor’s worked example: describe your own enterprise.`)
  }
  const capless = capabilitiesWithoutFunction(r)
  if (capless.length) notes.push(`Capabilities no function serves: ${capless.join(', ')}. Add a function, or record why (for example a constraint met by a design property).`)
  return result(issues, `${counting.length} functions under ${plural(usedGroups.length, 'first-level function')}.`, notes)
}

export function checkAllocationPart(r: Week4Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  const dup = duplicates([...r.logical.map((x) => x.id), ...r.physical.map((x) => x.id), ...r.externals.map((x) => x.id), ...r.decisions.map((x) => x.id)])
  if (dup.length) issues.push(`Duplicate ID ${dup.join(', ')}: each ID once.`)
  const phys = new Set(r.physical.map((p) => p.id))
  const logOk = r.logical.filter((l) => words(l.name) >= 1 && idsIn(l.phys).some((p) => phys.has(p)))
  const phyOk = r.physical.filter((p) => words(p.name) >= 1)
  if (logOk.length < min.logical) issues.push(`At least ${min.logical} logical elements, each named and allocated to a physical element${three(r)} (${logOk.length} so far).`)
  if (phyOk.length < min.physical) issues.push(`At least ${min.physical} physical elements${three(r)} (${phyOk.length} so far).`)
  for (const l of r.logical) {
    const bad = idsIn(l.phys).filter((p) => !phys.has(p))
    if (bad.length) issues.push(`${l.id}: ${bad.join(', ')} is not a physical element in the record.`)
  }
  const counted = r.functions.filter((f) => assessFunction(f, r).counts)
  for (const f of counted) {
    const m = failed(f.id, assessAllocation(f, r), ALLOCATION_GATES)
    if (m) issues.push(m.replace('does not count', 'is not allocated'))
  }
  const unalloc = unallocatedSystemRequirements(r)
  if (unalloc.length) issues.push(`Allocate every system requirement to a function or a physical element: ${unalloc.join(', ')} ${unalloc.length > 1 ? 'are' : 'is'} not allocated.`)
  const st = r.decisions.map((d) => ({ d, a: assessDecision(d, r) }))
  const countingD = st.filter((x) => x.a.counts)
  if (countingD.length < min.decisions) issues.push(`At least ${min.decisions} architecture decision that passes every hard gate (${countingD.length} so far).`)
  for (const { d, a } of st) {
    const m = failed(d.id, a, DECISION_GATES)
    if (m) issues.push(m)
  }
  const idle = r.physical.filter((p) => !r.functions.some((f) => f.phy === p.id)).map((p) => p.id)
  if (idle.length) notes.push(`Physical elements with no function: ${idle.join(', ')}. Fine for a medium such as a network; otherwise check the allocation.`)
  return result(issues, `${logOk.length} logical and ${phyOk.length} physical elements; ${counted.length} functions allocated; ${plural(countingD.length, 'decision')}.`, notes)
}

export function checkInformationPart(r: Week4Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  const dup = duplicates([...r.information.map((x) => x.id), ...r.ai.map((x) => x.id)])
  if (dup.length) issues.push(`Duplicate ID ${dup.join(', ')}: each ID once.`)
  const st = r.information.map((x) => ({ x, a: assessInfo(x, r) }))
  const counting = st.filter((y) => y.a.counts)
  if (counting.length < min.information) issues.push(`At least ${min.information} information items that pass every hard gate${three(r)} (${counting.length} so far).`)
  for (const { x, a } of st) {
    const m = failed(x.id, a, INFO_GATES)
    if (m) issues.push(m)
    for (const y of a.advisories) notes.push(`${x.id}: advisory, ${y.message}`)
  }
  const ai = r.ai.map((a) => ({ a, s: assessAi(a, r) }))
  const countingAi = ai.filter((y) => y.s.counts)
  if (countingAi.length < min.ai) issues.push(`At least ${min.ai} AI capability card that passes every hard gate (${countingAi.length} so far).`)
  for (const { a, s } of ai) {
    const m = failed(a.id, s, AI_GATES)
    if (m) issues.push(m)
  }
  return result(issues, `${counting.length} information items and ${plural(countingAi.length, 'AI capability card')} count.`, notes)
}

export function checkAiStatement(r: Week4Record): PartCheck {
  const n = words(r.aiStatement)
  return result(n >= MIN_AI_WORDS ? [] : [`Write the AI usage statement for the Week 4 work (at least ${MIN_AI_WORDS} words, ${n} so far): tool, purpose, prompts, what you accepted or rejected and why, with AI-suggested items tagged; or say that no AI tool was used.`], 'AI usage statement recorded.')
}

export type PartId = 'import' | (typeof WEEK4_PARTS)[number]['id'] | 'ai'
export function allChecks(r: Week4Record): Record<PartId, PartCheck> {
  return { import: checkImport(r), views: checkViewsPart(r), functions: checkFunctionsPart(r), allocation: checkAllocationPart(r), information: checkInformationPart(r), ai: checkAiStatement(r) }
}
export type RecordState = 'not-ready' | 'ready'
export const recordState = (r: Week4Record): RecordState => (Object.values(allChecks(r)).every((c) => c.ok) ? 'ready' : 'not-ready')

// ---------------------------------------------------------------------------------------------- Markdown
const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n+/g, '; ').trim()
export const fileStem = (r: Week4Record) => `team-${(r.week3?.team || 'NN').replace(/[^\w-]+/g, '') || 'NN'}-week4`
const gateText = (a: { counts: boolean; gates: { id: string; ok: boolean }[]; advisories: { id: string }[] }) => `${a.counts ? 'all pass' : `fails ${a.gates.filter((g) => !g.ok).map((g) => g.id).join(', ')}`}${a.advisories.length ? `; advisory: ${a.advisories.map((x) => x.id).join(', ')}` : ''}`

export function recordMarkdown(r: Week4Record, today = new Date().toISOString().slice(0, 10)): string {
  const w = r.week3
  const checks = allChecks(r)
  const L: string[] = [
    `# Week 4 Team Record: ${cell(w?.enterprise ?? '') || '(Week 3 record not imported)'}`,
    '',
    `Team: ${cell(w?.team ?? '') || '____'} · Exported from the Week 4 lab tool, ${today}. Extends the Week 3 Team Record.${w?.decision.name ? ` Starting configuration: ${cell(w.decision.name)} (Week 3 decision).` : ''}`,
    '',
    `**Record status:** ${recordState(r) === 'ready' ? 'complete: every part passes its checks' : `not ready: ${Object.entries(checks).filter(([, x]) => !x.ok).length} part(s) still incomplete`}.${r.threePersonTeam ? ' Three-person team: reduced minimums (pending faculty approval).' : ''}`,
    '',
    '## 6. AI usage statement (updated)',
    '',
    r.aiStatement.trim() || '_Not written yet._',
    '',
  ]
  const tagged = [...r.functions.filter((x) => x.ai).map((x) => x.id), ...r.information.filter((x) => x.ai).map((x) => x.id)]
  if (tagged.length) L.push(`AI-suggested, reviewed by the team: ${tagged.join(', ')}.`, '')
  L.push(`## ${partNumber('views')}. ${partTitle('views')}`, '', '| ID | Kind | Name | Purpose | Stakeholders | Concerns | Serves | Form | Checks |', '|---|---|---|---|---|---|---|---|---|')
  for (const v of r.viewpoints) L.push(`| ${v.id} | ${v.kind ? viewKindLabel(v.kind) : ''} | ${cell(v.name)} | ${cell(v.purpose)} | ${cell(v.stakeholders)} | ${cell(v.concerns)} | ${idsIn(v.serves).join(', ')} | ${cell(v.form)} | ${gateText(assessViewpoint(v, r))} |`)
  L.push('', `## ${partNumber('functions')}. ${partTitle('functions')}`, '', `Mission function: ${cell(r.mission) || '____'}`, '')
  for (const g of r.groups) L.push(`- ${g.id} ${cell(g.name)}: ${r.functions.filter((f) => f.group === g.id).map((f) => f.id).join(', ') || '(none)'}`)
  L.push('', '| ID | Function | Inputs | Outputs | Capabilities | Scenarios | Requirements | Checks |', '|---|---|---|---|---|---|---|---|')
  for (const f of r.functions) L.push(`| ${f.id} | ${cell(f.name)}${f.ai ? ' (AI-suggested, reviewed)' : ''}${f.human ? ` (human: ${cell(f.human)})` : ''} | ${lines(f.inputs).map(cell).join('; ')} | ${lines(f.outputs).map(cell).join('; ')} | ${idsIn(f.capabilities).join(', ')} | ${idsIn(f.scenarios).join(', ') || (f.planning ? `planning: ${cell(f.planning)}` : '')} | ${idsIn(f.requirements).join(', ')} | ${gateText(assessFunction(f, r))} |`)
  L.push('', `## ${partNumber('allocation')}. ${partTitle('allocation')}`, '', '| Logical | Name | Allocated to |', '|---|---|---|', ...r.logical.map((l) => `| ${l.id} | ${cell(l.name)} | ${idsIn(l.phys).join(', ')} |`))
  L.push('', '| Physical | Name | Description | Requirements allocated directly |', '|---|---|---|---|', ...r.physical.map((p) => `| ${p.id} | ${cell(p.name)} | ${cell(p.text)} | ${idsIn(p.requirements).join(', ')} |`))
  if (r.externals.length) L.push('', '| External | Name |', '|---|---|', ...r.externals.map((x) => `| ${x.id} | ${cell(x.name)} |`))
  L.push('', '| Function | Logical | Physical | Criterion | Justification | Checks |', '|---|---|---|---|---|---|', ...r.functions.map((f) => `| ${f.id} | ${f.log} | ${f.phy} | ${f.criterion ? criterionLabel(f.criterion) : ''} | ${cell(f.why)} | ${gateText(assessAllocation(f, r))} |`))
  for (const d of r.decisions) L.push('', `### ${d.id}: ${cell(d.question)}`, '', `- Alternatives: ${lines(d.alternatives).map(cell).join('; ')}`, `- Chosen: ${cell(d.chosen)}`, `- Rationale: ${cell(d.rationale)}`, `- Affects: ${idsIn(d.links).join(', ')}`, `- Checks: ${gateText(assessDecision(d, r))}`)
  L.push('', `## ${partNumber('information')}. ${partTitle('information')}`, '', '| ID | Item | Data → information | Producers → consumers | Decision supported | Route | Sensitivity | Checks |', '|---|---|---|---|---|---|---|---|')
  for (const x of r.information) L.push(`| ${x.id} | ${cell(x.name)}: ${cell(x.content)} | ${cell(x.data)} → ${cell(x.information)} | ${idsIn(x.producers).join(', ')} → ${idsIn(x.consumers).join(', ')} | ${cell(x.decision)} (${idsIn(x.decisionRefs).join(', ')}) | ${cell(x.route)} | ${cell(x.sensitivity)} | ${gateText(assessInfo(x, r))} |`)
  L.push('', '| AI | Name | Host | Supports | Inputs | Outputs | Oversight | Failure | Data quality | Checks |', '|---|---|---|---|---|---|---|---|---|---|', ...r.ai.map((a) => `| ${a.id} | ${cell(a.name)} | ${a.host} | ${a.supports} | ${idsIn(a.inputs).join(', ')} | ${cell(a.outputs)} | ${cell(a.oversight)} | ${cell(a.failure)} | ${cell(a.dataQuality)} | ${gateText(assessAi(a, r))} |`))
  L.push('', '## Consistency checks', '', ...consistency(r).map((c) => `- ${c.ok ? 'pass' : 'open'}: ${c.check} (${c.detail})`), '')
  return L.join('\n')
}

// ---------------------------------------------------------------------------------------------- JSON model inputs
/** The SysML v2 element each item seeds in Phase II (course working mapping; named only). */
export const SEEDS = {
  viewpoint: ['viewpoint def framing stakeholder concerns (named only)'],
  function: ['action def with in and out parameters (named only)'],
  logical: ['part def, logical (named only)'],
  physical: ['part def (named only)'],
  allocation: ['allocation from action to part (named only)'],
  information: ['item def carried by flows (named only)'],
  ai: ['part with metadata on oversight (named only)'],
  decision: ['rationale metadata (named only)'],
} as const

export function modelInputs(r: Week4Record) {
  const checks = allChecks(r)
  const gates = (a: { counts: boolean; gates: { id: string; ok: boolean }[]; advisories: { id: string }[] }) => ({ counts: a.counts, gatesFailed: a.gates.filter((g) => !g.ok).map((g) => g.id), advisories: a.advisories.map((g) => g.id) })
  return {
    format: MODEL_INPUTS_FORMAT,
    version: MODEL_INPUTS_VERSION,
    team: r.week3?.team ?? '',
    status: recordState(r),
    threePersonTeam: r.threePersonTeam,
    week1Externals: r.week1Externals,
    week3: r.week3,
    mission: r.mission,
    viewpoints: r.viewpoints.map((v) => ({ ...v, serves: idsIn(v.serves), ...gates(assessViewpoint(v, r)), seeds: SEEDS.viewpoint })),
    groups: r.groups,
    functions: r.functions.map((f) => ({ ...f, inputs: lines(f.inputs), outputs: lines(f.outputs), capabilities: idsIn(f.capabilities), scenarios: idsIn(f.scenarios), requirements: idsIn(f.requirements), ...gates(assessFunction(f, r)), allocation: gates(assessAllocation(f, r)), seeds: [...SEEDS.function, ...SEEDS.allocation] })),
    logical: r.logical.map((l) => ({ ...l, phys: idsIn(l.phys), seeds: SEEDS.logical })),
    physical: r.physical.map((p) => ({ ...p, requirements: idsIn(p.requirements), seeds: SEEDS.physical })),
    externals: r.externals,
    decisions: r.decisions.map((d) => ({ ...d, alternatives: lines(d.alternatives), links: idsIn(d.links), ...gates(assessDecision(d, r)), seeds: SEEDS.decision })),
    information: r.information.map((x) => ({ ...x, producers: idsIn(x.producers), consumers: idsIn(x.consumers), decisionRefs: idsIn(x.decisionRefs), ...gates(assessInfo(x, r)), seeds: SEEDS.information })),
    ai: r.ai.map((a) => ({ ...a, inputs: idsIn(a.inputs), ...gates(assessAi(a, r)), seeds: SEEDS.ai })),
    aiStatement: r.aiStatement.trim(),
    consistency: consistency(r),
    checks: { parts: Object.fromEntries(Object.entries(checks).map(([k, x]) => [k, { ok: x.ok, issues: x.issues.length }])) },
    issued: r.issued,
  }
}

// ---------------------------------------------------------------------------------------------- import (teammate share)
const kindOf = (x: unknown) => (x === null ? 'null' : Array.isArray(x) ? 'a list' : typeof x === 'object' ? 'an object' : typeof x === 'string' ? 'text' : typeof x)

/** Reads a Week 4 model-inputs JSON file (a teammate's export) back into a record. Never throws. */
export function importWeek4(text: string): Week4Record | { error: string } {
  try {
    return importUnsafe(text)
  } catch (e) {
    return { error: `This file could not be read as Week 4 model inputs (${e instanceof Error ? e.message : String(e)}).` }
  }
}

function importUnsafe(text: string): Week4Record | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON.' }
  }
  if (isObj(d) && d.format === SOURCE_FORMAT) return { error: 'This is a Week 3 model-inputs file: use “Import your Week 3 record” to start the Week 4 record from it.' }
  if (isObj(d) && (d.format === 'week1-model-inputs' || d.format === 'week2-model-inputs')) return { error: 'This is an earlier week’s model-inputs file: the Week 4 record starts from your team’s Week 3 export.' }
  if (!isObj(d) || d.format !== MODEL_INPUTS_FORMAT) return { error: `This is not a Week 4 model-inputs file (format “${MODEL_INPUTS_FORMAT}”).` }
  if (d.version !== MODEL_INPUTS_VERSION) return { error: `This Week 4 file has version ${JSON.stringify(d.version)}; this tool reads version ${MODEL_INPUTS_VERSION}.` }
  for (const path of ['viewpoints', 'groups', 'functions', 'logical', 'physical', 'externals', 'decisions', 'information', 'ai'] as const) {
    const x = d[path]
    if (x === undefined) continue
    if (!Array.isArray(x)) return { error: `“${path}” must be a list; this file has ${kindOf(x)}.` }
    const bad = x.findIndex((y) => !isObj(y))
    if (bad >= 0) return { error: `“${path}” item ${bad + 1} is ${kindOf(x[bad])}, not an object.` }
  }
  if (d.week3 !== undefined && d.week3 !== null && !isObj(d.week3)) return { error: `“week3” must be an object; this file has ${kindOf(d.week3)}.` }
  const w3 = isObj(d.week3) ? d.week3 : undefined
  if (w3 && (isAeroLink(str(w3.enterprise)) || isAeroLink(str(w3.soi)))) return { error: 'This file is about AeroLink, the instructor’s worked example: import your team’s own record.' }
  const rec = normalizeRecord(d)
  for (const prefix of Object.keys(ID_FORMS) as IdPrefix[]) {
    const ids = idsOf(rec, prefix)
    const bad = ids.filter((id) => !ID_FORMS[prefix].test(id))
    if (bad.length) return { error: `Unexpected ${prefix} IDs in the file: ${bad.slice(0, 3).map((x) => x || '(empty)').join(', ')}. IDs look like ${prefix}-001.` }
    const dup = duplicates(ids)
    if (dup.length) return { error: `Duplicate ID ${dup[0]} in the file: each ID once. Fix the file, or ask the teammate who exported it to export again.` }
  }
  return rec
}
