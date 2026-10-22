// Week 5 Team Record (pure logic, no React): the component breakdown with responsibility cards (Part 19), the N² chart and
// interface definitions (Part 20), the interface requirements (Part 21) and interface management with security and
// resilience (Part 22), plus the AI usage statement. The record EXTENDS the team's Week 4 Team Record: it is started from
// the Week 4 model-inputs JSON (`week4-model-inputs` v1, read with Week 4's own importWeek4, read-only) and keeps a
// snapshot of what it traces to (needs, capabilities, requirements, risks, TPMs from the nested Week 3 snapshot; the
// Week 4 physical elements, externals, functions, information items with their producers and consumers, AI cards and
// decisions).
//
// Single sources: every minimum, gate id, advisory, interface kind, component kind and part rule is read from
// src/content/lectures/week05/labBrief.ts, so the lecture, the AeroLink worked example and the tool apply the same rules.
// The N², the degrees, the trust boundaries and the crossing-flow check are computed the way
// src/content/lectures/week05/aerolinkCase.ts computes them for AeroLink, on the team's own data.
//
// Patterns mirror src/workbench/week4/record.ts: normalize never throws, IDs are issued by the tool and never reused after
// deletion, checks return { ok, issues, detail, notes }, hard gates block an entry from counting, advisories never block,
// Markdown + JSON export with format/version, import with clear messages. No gate tests a name's form: one-word names,
// proper nouns, IDs, people and external AI services are valid names and ends (the recurring defect of Weeks 1, 2 and 4).
// Free-text gates ask only for the shortest answer the lecture calls complete (review 2026-10-19 M2): one word where a
// word is an answer ("TLS", "Power only", "Approved", "None"), two where the lecture asks for an action ("Fail safe",
// "Charges aircraft"); a criterion with a value and its unit counts however short ("2 min", "≤2min") and a TBD needs its
// owner ("TBD (Ops)"). An empty answer ("none", "n/a", "-", "?"; ../emptyAnswer.ts) never counts (confirmation N1, N2).
// External consumers are valid everywhere (the Week 4 consumer defect is not copied). AeroLink is the instructor's worked
// example: a record about AeroLink is refused.
import {
  CARD_GATES, CHANGE_GATES, COMPONENT_GATES, COMPONENT_KINDS, INTERFACE_ADVISORIES, INTERFACE_GATES, INTERFACE_KINDS, LAB5_MINIMUMS, LAB5_MINIMUMS_THREE, PART_RULES, REQUIREMENT_GATES, SPAN,
  TABLE_COLUMNS, WEEK5_PARTS, componentKindLabel, interfaceKindLabel,
  type CardGateId, type ChangeGateId, type ComponentGateId, type ComponentKind, type InterfaceAdvisoryId, type InterfaceGateId, type InterfaceKind, type Lab5Minimums, type RequirementGateId,
} from '../../content/lectures/week05/labBrief'
import { idsIn as week4IdsIn, importWeek4, recordState as week4State, type Week4Record } from '../week4/record'
import { isAeroLink } from '../week1/team'
import { TRIVIAL_CRITERION, valueIn } from '../week2/record'
import { vagueTermsIn } from '../../activities/week04/quality'
import { said } from '../emptyAnswer'

export const W5_KEY = 'w5.record'
export const MODEL_INPUTS_FORMAT = 'week5-model-inputs'
export const MODEL_INPUTS_VERSION = 1
export const SOURCE_FORMAT = 'week4-model-inputs'
export const MIN_AI_WORDS = 12
/** Tool conventions for free-text fields, each set at the shortest valid entry the lecture allows (labBrief gates; the
 *  thresholds are stated in each gate's text). MIN_PART_WORDS: a word is a complete answer (protection or its reason,
 *  a decision, the reason an external has no interface, the standards). MIN_TEXT_WORDS: an action, verb and object
 *  (a responsibility, a degraded mode, a change); the lecture's own "Fail safe" is two words. Relaxed from 3 and 5 by the
 *  2026-10-19 review (M2); the names are kept for compatibility. */
export const MIN_PART_WORDS = 1
export const MIN_TEXT_WORDS = 2
export const VERIFICATION_METHODS = ['inspection', 'analysis', 'demonstration', 'test'] as const
export type VerificationMethod = (typeof VERIFICATION_METHODS)[number]
/** A medium that names a network, link or service the team may not own (hidden-external advisory, R55 p.369). */
export const UNOWNED_MEDIUM = /network|internet|\bweb\b|online|cloud|link|radio|wireless|satellite|leased|wi-?fi|cellular|mobile|\blte\b|\b[345]g\b|vpn|bluetooth|\bapi\b|saas|third[- ]party|public/i
/** A TBD with its owner, as the lecture writes it: "TBD (Ops)", or "TBD: Ops", "TBD – Ops lead", "TBD owner Ops". */
const OWNED_TBD = /\btb[dr]\b(?:-\d+)?\s*(?:\(\s*([^)]*)\)|[:–—-]\s*([A-Za-z].*)|owner:?\s+(.+))/i
/** A population or bound that makes a vague word checkable ("every booking", "within"), as Week 2's criterion gate. */
const CRITERION_ANCHOR = /[≤≥<>]|\b(every|each|all|zero|any|at least|within|before|after)\b/i
/** The lecture's criterion rule (labBrief `criterion`): "a value with its unit (“2 min”) or a TBD with an owner
 *  (“TBD (Ops)”)". A value with its unit counts however short ("2 min", "≤2min", "100%"); any TBD/TBR needs an owner;
 *  otherwise two words that are not themselves vague. An empty answer, a trivial criterion ("works", "TBD"), a bare
 *  number ("1") and an unanchored vague one ("Very fast") fail, as in Week 2 (confirmation review 2026-10-19, N2). */
/** A short answer that counts: at least MIN_PART_WORDS and not an empty answer (protection, its reason, a decision, the
 *  reason an external has no interface). Not used for the standards, where "none" is a valid answer. */
export const partSaid = (s: string) => said(s) && words(s) >= MIN_PART_WORDS
export const criterionOk = (s: string) => {
  const t = s.trim()
  if (!said(t) || TRIVIAL_CRITERION.test(t)) return false
  if (/\btb[dr]\b/i.test(t)) {
    const m = t.match(OWNED_TBD)
    return !!m && said(m[1] ?? m[2] ?? m[3] ?? '')
  }
  if (valueIn(t)) return true
  return words(t) >= MIN_TEXT_WORDS && (!vagueTermsIn(t).length || CRITERION_ANCHOR.test(t))
}
export { isAeroLink, TABLE_COLUMNS }

export const minimumsOf = (r: Pick<Week5Record, 'threePersonTeam'>): Lab5Minimums => (r.threePersonTeam ? LAB5_MINIMUMS_THREE : LAB5_MINIMUMS)

// ---------------------------------------------------------------------------------------------- types
export type Week4Snapshot = {
  team: string
  enterprise: string
  soi: string
  needs: { id: string; name: string }[]
  capabilities: { id: string; name: string }[]
  requirements: { id: string; name: string; statement: string }[]
  risks: { id: string; name: string; category: string }[]
  tpms: { id: string; name: string }[]
  physical: { id: string; name: string; text: string }[]
  externals: { id: string; name: string }[]
  /** Week 1 context EXT IDs the Week 4 file carries (Week 7 review M3/N1): new Week 5 externals continue after them. */
  week1Externals: { id: string; name: string }[]
  functions: { id: string; name: string; phy: string; log: string }[]
  information: { id: string; name: string; producers: string[]; consumers: string[]; route: string; sensitivity: string }[]
  ai: { id: string; name: string; host: string }[]
  decisions: { id: string; question: string }[]
  threePersonTeam: boolean
  week4Status: string
  sourceVersion: number
}
/** The responsibility card of a Week 4 physical element (level 1). Its functions are computed from the allocation. */
export type Card = { phy: string; responsibility: string; owner: string }
export type Component = { id: string; name: string; parent: string; kind: ComponentKind | ''; responsibility: string; functions: string; ai: boolean }
export type External = { id: string; name: string }
export type Interface = {
  id: string
  name: string
  kind: InterfaceKind | ''
  endA: string
  endB: string
  /** What crosses: words and/or INFO IDs. */
  crosses: string
  /** Free text naming the direction, for example "PHY-001 → PHY-004". Never parsed. */
  direction: string
  medium: string
  constraint: string
  requirements: string
  ownerA: string
  ownerB: string
  verification: string
  protection: string
  noProtectionReason: string
  degraded: string
  risks: string
  standard: string
  /** "An end accepts input from the public, or the medium is a network we may not own": makes the boundary cross. */
  exposed: boolean
  ai: boolean
}
export type Requirement = { id: string; name: string; statement: string; interface: string; criterion: string; method: VerificationMethod | ''; parents: string; rationale: string; ai: boolean }
export type Change = { id: string; interface: string; change: string; impact: string; decision: string; decider: string }
export type Issued = { CMP: number; IF: number; REQ: number; ICR: number; EXT: number }
export type IdPrefix = keyof Issued
export type Week5Record = {
  week4: Week4Snapshot | null
  threePersonTeam: boolean
  cards: Card[]
  components: Component[]
  /** Externals added in Week 5 (EXT numbering continues the Week 4 numbering). */
  externals: External[]
  /** Per external (Week 4 or Week 5): the reason it has no interface, if it has none. */
  externalReasons: Record<string, string>
  interfaces: Interface[]
  /** Per uncovered producer→consumer pair (pairKey): the relay, a list of IF IDs. */
  relays: Record<string, string>
  requirements: Requirement[]
  icwg: string
  standards: string
  changes: Change[]
  aiStatement: string
  issued: Issued
  updatedAt?: number
  exportedMdAt?: number
  exportedJsonAt?: number
}

export const EMPTY_ISSUED: Issued = { CMP: 0, IF: 0, REQ: 0, ICR: 0, EXT: 0 }
export const EMPTY_RECORD: Week5Record = { week4: null, threePersonTeam: false, cards: [], components: [], externals: [], externalReasons: {}, interfaces: [], relays: {}, requirements: [], icwg: '', standards: '', changes: [], aiStatement: '', issued: EMPTY_ISSUED }
export const EMPTY_CARD = (phy: string): Card => ({ phy, responsibility: '', owner: '' })
export const EMPTY_COMPONENT = (id: string, parent = ''): Component => ({ id, name: '', parent, kind: '', responsibility: '', functions: '', ai: false })
export const EMPTY_EXTERNAL = (id: string): External => ({ id, name: '' })
export const EMPTY_INTERFACE = (id: string): Interface => ({ id, name: '', kind: '', endA: '', endB: '', crosses: '', direction: '', medium: '', constraint: '', requirements: '', ownerA: '', ownerB: '', verification: '', protection: '', noProtectionReason: '', degraded: '', risks: '', standard: '', exposed: false, ai: false })
export const EMPTY_REQUIREMENT = (id: string, iface = ''): Requirement => ({ id, name: '', statement: '', interface: iface, criterion: '', method: '', parents: '', rationale: '', ai: false })
export const EMPTY_CHANGE = (id: string): Change => ({ id, interface: '', change: '', impact: '', decision: '', decider: '' })

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
const strMap = (x: unknown): Record<string, string> => (isObj(x) ? Object.fromEntries(Object.entries(x).filter(([, v]) => typeof v === 'string').map(([k, v]) => [k, v as string])) : {})
export const words = (s: string) => s.split(/\s+/).filter(Boolean).length
export const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)
export const duplicates = (ids: string[]) => [...new Set(ids.filter((x, i) => x && ids.indexOf(x) !== i))]
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
const same = (a: string, b: string) => a.trim().toLowerCase().replace(/\s+/g, ' ') === b.trim().toLowerCase().replace(/\s+/g, ' ')
const KIND_IDS = INTERFACE_KINDS.map((k) => k.id)
const COMPONENT_KIND_IDS = COMPONENT_KINDS.map((k) => k.id)

export const ID_FORMS: Record<IdPrefix, RegExp> = { CMP: /^CMP-\d{3}$/, IF: /^IF-\d{3}$/, REQ: /^REQ-SYS-\d{3}$/, ICR: /^ICR-\d{3}$/, EXT: /^EXT-\d{3}$/ }
const ANY_ID = /\b(?:REQ-(?:STK|SYS)|NEED|MGO|SCN|CAP|MOE|MOP|TPM|R|VP|FG|FN|LOG|PHY|EXT|DEC|INFO|AI|CMP|IF|ICR)-\d{3}\b/g
/** The IDs written in a free-text link field, upper-cased, each once. */
export const idsIn = (s: string) => [...new Set(s.toUpperCase().match(ANY_ID) ?? [])]
type PartKey = (typeof WEEK5_PARTS)[number]['id']
export const partTitle = (id: PartKey) => WEEK5_PARTS.find((p) => p.id === id)!.title
export const partNumber = (id: PartKey) => WEEK5_PARTS.find((p) => p.id === id)!.n
export const gateShort = (list: readonly { id: string; short: string }[], id: string) => list.find((g) => g.id === id)?.short ?? id
export const ruleShort = (id: (typeof PART_RULES)[number]['id']) => PART_RULES.find((p) => p.id === id)!.short

// ---------------------------------------------------------------------------------------------- normalize
function normalizeSnapshot(v: unknown): Week4Snapshot | null {
  if (!isObj(v)) return null
  const pair = (x: Record<string, unknown>) => ({ id: upId(x.id), name: str(x.name) })
  const list = (x: unknown) => (Array.isArray(x) ? x.map(upId).filter(Boolean) : idsIn(str(x)))
  return {
    team: str(v.team), enterprise: str(v.enterprise), soi: str(v.soi),
    needs: objs(v.needs).map(pair), capabilities: objs(v.capabilities).map(pair),
    requirements: objs(v.requirements).map((x) => ({ ...pair(x), statement: str(x.statement) })),
    risks: objs(v.risks).map((x) => ({ ...pair(x), category: str(x.category) })),
    tpms: objs(v.tpms).map(pair),
    physical: objs(v.physical).map((x) => ({ ...pair(x), text: str(x.text) })),
    externals: objs(v.externals).map(pair),
    week1Externals: objs(v.week1Externals).map(pair),
    functions: objs(v.functions).map((x) => ({ ...pair(x), phy: upId(x.phy), log: upId(x.log) })),
    information: objs(v.information).map((x) => ({ ...pair(x), producers: list(x.producers), consumers: list(x.consumers), route: str(x.route), sensitivity: str(x.sensitivity) })),
    ai: objs(v.ai).map((x) => ({ ...pair(x), host: upId(x.host) })),
    decisions: objs(v.decisions).map((x) => ({ id: upId(x.id), question: str(x.question) })),
    threePersonTeam: v.threePersonTeam === true, week4Status: str(v.week4Status), sourceVersion: int(v.sourceVersion),
  }
}

/** Fills missing fields of a stored or imported record. Never throws. */
export function normalizeRecord(v: unknown): Week5Record {
  const r = isObj(v) ? v : {}
  const week4 = normalizeSnapshot(r.week4)
  const m = isObj(r.management) ? r.management : {}
  const rec: Week5Record = {
    week4,
    threePersonTeam: typeof r.threePersonTeam === 'boolean' ? r.threePersonTeam : (week4?.threePersonTeam ?? false),
    cards: objs(r.cards).map((x) => ({ phy: upId(x.phy), responsibility: str(x.responsibility), owner: str(x.owner) })),
    components: objs(r.components).map((x) => ({ id: upId(x.id), name: str(x.name), parent: upId(x.parent), kind: oneOf(str(x.kind).trim().toLowerCase(), COMPONENT_KIND_IDS), responsibility: str(x.responsibility), functions: linkText(x.functions), ai: x.ai === true })),
    externals: objs(r.externals).map((x) => ({ id: upId(x.id), name: str(x.name) })),
    externalReasons: Object.fromEntries(Object.entries(strMap(r.externalReasons)).map(([k, x]) => [k.trim().toUpperCase(), x])),
    interfaces: objs(r.interfaces).map((x) => ({
      ...EMPTY_INTERFACE(upId(x.id)),
      name: str(x.name), kind: oneOf(str(x.kind).trim().toLowerCase(), KIND_IDS), endA: upId(x.endA), endB: upId(x.endB), crosses: str(x.crosses), direction: str(x.direction), medium: str(x.medium), constraint: str(x.constraint),
      requirements: linkText(x.requirements), ownerA: str(x.ownerA), ownerB: str(x.ownerB), verification: str(x.verification), protection: lineText(x.protection), noProtectionReason: str(x.noProtectionReason),
      degraded: str(x.degraded), risks: linkText(x.risks), standard: str(x.standard), exposed: x.exposed === true, ai: x.ai === true,
    })),
    relays: strMap(r.relays),
    requirements: objs(r.requirements).map((x) => ({ id: upId(x.id), name: str(x.name), statement: str(x.statement), interface: upId(x.interface), criterion: str(x.criterion), method: oneOf(str(x.method).trim().toLowerCase(), VERIFICATION_METHODS), parents: linkText(x.parents), rationale: str(x.rationale), ai: x.ai === true })),
    icwg: lineText(r.icwg ?? m.icwg),
    standards: str(r.standards ?? m.standards),
    changes: objs(r.changes ?? m.changes).map((x) => ({ id: upId(x.id), interface: upId(x.interface), change: str(x.change), impact: linkText(x.impact), decision: str(x.decision), decider: str(x.decider) })),
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

/** The IDs of a prefix in the Week 5 record (what the team issued this week). */
export function idsOf(r: Week5Record, prefix: IdPrefix): string[] {
  switch (prefix) {
    case 'CMP': return r.components.map((x) => x.id)
    case 'IF': return r.interfaces.map((x) => x.id)
    case 'REQ': return r.requirements.map((x) => x.id)
    case 'ICR': return r.changes.map((x) => x.id)
    case 'EXT': return r.externals.map((x) => x.id)
  }
}
/** IDs a new ID must come after: the record's own, plus the imported ones the numbering continues (REQ-SYS, EXT). */
function floorIds(r: Week5Record, prefix: IdPrefix): string[] {
  const own = idsOf(r, prefix)
  if (prefix === 'REQ') return [...own, ...(r.week4?.requirements ?? []).map((q) => q.id).filter((id) => id.startsWith('REQ-SYS-'))]
  // the max across every imported earlier-week EXT ID: Week 4's externals and the Week 1 range Week 4 carries (review N1)
  if (prefix === 'EXT') return [...own, ...(r.week4?.externals ?? []).map((x) => x.id), ...(r.week4?.week1Externals ?? []).map((x) => x.id)]
  return own
}
const PREFIX_TEXT: Record<IdPrefix, string> = { CMP: 'CMP', IF: 'IF', REQ: 'REQ-SYS', ICR: 'ICR', EXT: 'EXT' }
/** The next ID for a prefix: one past the highest ever issued or present (or imported), so a deleted ID is never reused. */
export function nextId(r: Week5Record, prefix: IdPrefix): string {
  return `${PREFIX_TEXT[prefix]}-${pad(Math.max(r.issued[prefix], 0, ...floorIds(r, prefix).map(num)) + 1)}`
}
export const withIssued = (r: Week5Record, prefix: IdPrefix, id: string): Issued => ({ ...r.issued, [prefix]: Math.max(r.issued[prefix], num(id)) })

// ---------------------------------------------------------------------------------------------- Week 4 import
/** The Week 4 snapshot kept in the Week 5 record, from a Week 4 record (read-only). */
export function snapshotOf(w: Week4Record, sourceVersion: number): Week4Snapshot {
  const w3 = w.week3
  return {
    team: (w3?.team ?? '').trim(), enterprise: (w3?.enterprise ?? '').trim(), soi: (w3?.soi ?? '').trim(),
    needs: (w3?.needs ?? []).map((x) => ({ id: x.id, name: x.name })),
    capabilities: (w3?.capabilities ?? []).map((x) => ({ id: x.id, name: x.name })),
    requirements: (w3?.requirements ?? []).map((x) => ({ id: x.id, name: x.name, statement: x.statement })),
    risks: (w3?.risks ?? []).map((x) => ({ id: x.id, name: x.name, category: x.category })),
    tpms: (w3?.tpms ?? []).map((x) => ({ id: x.id, name: x.name })),
    physical: w.physical.map((x) => ({ id: x.id, name: x.name.trim(), text: x.text.trim() })),
    externals: w.externals.map((x) => ({ id: x.id, name: x.name.trim() })),
    week1Externals: (w.week1Externals ?? []).map((x) => ({ id: x.id, name: x.name.trim() })),
    functions: w.functions.map((x) => ({ id: x.id, name: x.name.trim(), phy: x.phy, log: x.log })),
    information: w.information.map((x) => ({ id: x.id, name: x.name.trim(), producers: week4IdsIn(x.producers), consumers: week4IdsIn(x.consumers), route: x.route.trim(), sensitivity: x.sensitivity.trim() })),
    ai: w.ai.map((x) => ({ id: x.id, name: x.name.trim(), host: x.host })),
    decisions: w.decisions.map((x) => ({ id: x.id, question: x.question.trim() })),
    threePersonTeam: w.threePersonTeam,
    week4Status: week4State(w),
    sourceVersion,
  }
}

const EARLIER: Record<string, string> = { 'week1-model-inputs': 'Week 1', 'week2-model-inputs': 'Week 2', 'week3-model-inputs': 'Week 3' }

/** Reads the team's Week 4 model-inputs JSON with Week 4's own importer and returns the snapshot, or a message the
 *  student can act on. Earlier-week files, a Week 5 file and a record about AeroLink are refused. Never throws. */
export function importWeek4File(text: string): { snapshot: Week4Snapshot } | { error: string } {
  try {
    let d: unknown
    try {
      d = JSON.parse(text)
    } catch {
      return { error: 'This file is not valid JSON. Choose the Week 4 export, team-NN-week4-model-inputs.json.' }
    }
    if (isObj(d) && typeof d.format === 'string' && EARLIER[d.format]) return { error: `This is a ${EARLIER[d.format]} model-inputs file. The Week 5 record starts from your team’s Week 4 export (team-NN-week4-model-inputs.json).` }
    if (isObj(d) && d.format === MODEL_INPUTS_FORMAT) return { error: 'This is a Week 5 model-inputs file: use “Import a teammate’s Week 5 model-inputs file” at the top of the tool.' }
    if (!isObj(d)) return { error: `This file holds ${Array.isArray(d) ? 'a list' : 'no object'}, not a Week 4 model-inputs file. Choose team-NN-week4-model-inputs.json, exported from the Week 4 lab tool.` }
    if (d.format === undefined) return { error: 'This file has no “format”: it is not a lab-tool export. Choose team-NN-week4-model-inputs.json, exported from the Week 4 lab tool.' }
    if (d.format === SOURCE_FORMAT && typeof d.version === 'string') return { error: `This Week 4 file gives its version as text (“${d.version}”); this tool reads version 1 written as a number. Export the file again from the Week 4 lab tool.` }
    const w = importWeek4(text)
    if ('error' in w) return { error: w.error }
    if (!w.week3) return { error: 'This Week 4 record carries no Week 3 snapshot (needs, requirements, risks): export it again from the Week 4 lab tool after importing the Week 3 record.' }
    if ([w.week3.enterprise, w.week3.soi].some(isAeroLink)) return { error: 'This Week 4 record names AeroLink, the instructor’s worked example. Import your team’s own record.' }
    if (!w.physical.length) return { error: 'This Week 4 record has no physical elements: the Week 5 breakdown starts from them, so export the record again once they are in.' }
    return { snapshot: snapshotOf(w, int(d.version)) }
  } catch (e) {
    return { error: `This file could not be read as Week 4 model inputs (${e instanceof Error ? e.message : String(e)}).` }
  }
}

/** Puts a Week 4 snapshot into the record, keeping the Week 5 work, and seeds one responsibility card per physical
 *  element that has none yet. */
export function withWeek4(r: Week5Record, snapshot: Week4Snapshot): Week5Record {
  const cards = [...r.cards]
  for (const p of snapshot.physical) if (!cards.some((c) => c.phy === p.id)) cards.push(EMPTY_CARD(p.id))
  const next: Week5Record = { ...r, week4: snapshot, threePersonTeam: snapshot.threePersonTeam, cards }
  return { ...next, issued: { ...next.issued, REQ: Math.max(next.issued.REQ, ...floorIds(next, 'REQ').map(num), 0), EXT: Math.max(next.issued.EXT, ...floorIds(next, 'EXT').map(num), 0) } }
}

// ---------------------------------------------------------------------------------------------- lookups
export const physicalOf = (r: Week5Record) => r.week4?.physical ?? []
/** Every external in the record: Week 4's, then those added in Week 5. */
export const allExternals = (r: Week5Record): External[] => [...(r.week4?.externals ?? []), ...r.externals]
export const cardOf = (r: Week5Record, phy: string): Card => r.cards.find((c) => c.phy === phy) ?? EMPTY_CARD(phy)
/** Functions the Week 4 allocation places on a physical element (computed, never typed). */
export const functionsAt = (r: Week5Record, phy: string) => (r.week4?.functions ?? []).filter((f) => f.phy === phy).map((f) => f.id)
const isPhy = (r: Week5Record, id: string) => physicalOf(r).some((p) => p.id === id)
const isExt = (r: Week5Record, id: string) => allExternals(r).some((x) => x.id === id)
const isCmp = (r: Week5Record, id: string) => r.components.some((c) => c.id === id)
const aiCard = (r: Week5Record, id: string) => (r.week4?.ai ?? []).find((a) => a.id === id)
/** Where an end stands for the interface: an AI capability stands at its host element (as Week 4's placeOf does). */
export const placeOf = (r: Week5Record, id: string) => (id.startsWith('AI-') ? (aiCard(r, id)?.host ?? id) : id)
/** An ID that names an end in the record: a physical element, a component, an external element, or an AI capability whose
 *  host is a physical element in the record. */
export const isEnd = (r: Week5Record, id: string) => !!id && (isPhy(r, id) || isCmp(r, id) || isExt(r, id) || (id.startsWith('AI-') && !!aiCard(r, id) && isPhy(r, placeOf(r, id))))
/** The N² element an end belongs to: AI at its host, a component at its parent, a physical or external element itself. */
export function elementOf(r: Week5Record, id: string): string {
  const p = placeOf(r, id)
  const c = r.components.find((x) => x.id === p)
  return c && isPhy(r, c.parent) ? c.parent : p
}
export const isExternalEnd = (r: Week5Record, id: string) => isExt(r, elementOf(r, id))
export const nameOf = (r: Week5Record, id: string): string =>
  physicalOf(r).find((p) => p.id === id)?.name ?? allExternals(r).find((x) => x.id === id)?.name ?? r.components.find((c) => c.id === id)?.name ?? aiCard(r, id)?.name ?? ''
/** The owner an end's card records (a component inherits its parent's): a hint for the owner fields, never a check. */
export function cardOwnerOf(r: Week5Record, id: string): string {
  const e = elementOf(r, id)
  return isPhy(r, e) ? cardOf(r, e).owner.trim() : ''
}

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

// ---------------------------------------------------------------------------------------------- Part 19: breakdown
export function assessCard(c: Card): Assessment<CardGateId, never> {
  const g = collector<CardGateId, never>()
  const rOk = said(c.responsibility) && words(c.responsibility) >= MIN_TEXT_WORDS
  g.gate('responsibility', rOk, rOk ? 'responsibility stated' : `say what ${c.phy} is responsible for: an action and what it acts on (at least ${MIN_TEXT_WORDS} words, for example “Charges aircraft”)`)
  const oOk = words(c.owner) >= 1
  g.gate('owner', oOk, oOk ? `owned by ${c.owner.trim()}` : 'name the organization that owns it')
  return g.done()
}

export function assessComponent(c: Component, r: Week5Record): Assessment<ComponentGateId, never> {
  const g = collector<ComponentGateId, never>()
  g.gate('name', words(c.name) >= 1, words(c.name) >= 1 ? 'named' : 'name the component')
  const parent = physicalOf(r).find((p) => p.id === c.parent)
  g.gate('parent', !!parent, parent ? `under ${parent.id} ${parent.name}` : 'choose the Week 4 physical element it belongs to')
  g.gate('kind', !!c.kind, c.kind ? componentKindLabel(c.kind) : 'choose its kind')
  const rOk = said(c.responsibility) && words(c.responsibility) >= MIN_TEXT_WORDS
  g.gate('responsibility', rOk, rOk ? 'responsibility stated' : `state its responsibility: an action and what it acts on (at least ${MIN_TEXT_WORDS} words, for example “Raises alarms”)`)
  return g.done()
}
export const componentsOf = (r: Week5Record, phy: string) => r.components.filter((c) => c.parent === phy)

// ---------------------------------------------------------------------------------------------- Part 20: interfaces
export type BoundaryReason = 'external end' | 'different owners' | 'public input or unowned medium'
/** Course convention (Session 2): an interface crosses a trust boundary when an end is external, when its two sides have
 *  different owners, or when the team says an end accepts input from the public or the medium is a network it may not
 *  own. Each reason is computed from the record. */
export function boundaryReasons(x: Interface, r: Week5Record): BoundaryReason[] {
  const out: BoundaryReason[] = []
  if ([x.endA, x.endB].some((e) => e && isExternalEnd(r, e))) out.push('external end')
  if (x.ownerA.trim() && x.ownerB.trim() && !same(x.ownerA, x.ownerB)) out.push('different owners')
  if (x.exposed) out.push('public input or unowned medium')
  return out
}
export const crossesBoundary = (x: Interface, r: Week5Record) => boundaryReasons(x, r).length > 0
export const isExternalInterface = (x: Interface, r: Week5Record) => [x.endA, x.endB].some((e) => e && isExternalEnd(r, e))

export function endsOk(x: Interface, r: Week5Record): { ok: boolean; message: string } {
  const bad = [x.endA, x.endB].filter((e) => !isEnd(r, e))
  if (!x.endA || !x.endB) return { ok: false, message: 'choose both ends' }
  if (bad.length) return { ok: false, message: `${bad.join(', ')} is not a physical element, component, external element or AI capability in the record` }
  if (placeOf(r, x.endA) === placeOf(r, x.endB)) return { ok: false, message: `both ends are ${placeOf(r, x.endA)}${x.endA.startsWith('AI-') || x.endB.startsWith('AI-') ? ' (an AI capability stands at its host element)' : ''}: an interface joins two different ends` }
  return { ok: true, message: `${x.endA} ↔ ${x.endB}` }
}

export function assessInterface(x: Interface, r: Week5Record): Assessment<InterfaceGateId, InterfaceAdvisoryId> {
  const c = collector<InterfaceGateId, InterfaceAdvisoryId>()
  const e = endsOk(x, r)
  c.gate('ends', e.ok, e.message)
  c.gate('kind', !!x.kind, x.kind ? interfaceKindLabel(x.kind) : 'choose physical, information or organizational')
  const cOk = words(x.crosses) >= 1
  c.gate('crosses', cOk, cOk ? 'what crosses stated' : 'say what crosses it, in words or as INFO IDs')
  const needsDir = x.kind !== 'organizational'
  const dOk = !needsDir || words(x.direction) >= 1
  c.gate('direction', dOk, !needsDir ? 'an organizational interface needs no direction' : dOk ? 'direction stated' : 'say which way it flows (for example PHY-001 → PHY-004)')
  const mOk = words(x.medium) >= 1
  c.gate('medium', mOk, mOk ? 'medium stated' : 'name the medium or carrier: connector, network, document or agreement')
  const oOk = words(x.ownerA) >= 1 && words(x.ownerB) >= 1
  c.gate('owners', oOk, oOk ? `${x.ownerA.trim()} / ${x.ownerB.trim()}` : 'name the owner of each side')
  const reasons = boundaryReasons(x, r)
  // confirmation review N1: "none", "n/a", "-" or "?" is neither a protection nor a reason for none
  const protected_ = partSaid(x.protection)
  const pOk = !reasons.length || protected_ || partSaid(x.noProtectionReason)
  c.gate('protection', pOk, !reasons.length ? 'crosses no trust boundary' : pOk ? `crosses a trust boundary (${reasons.join(', ')}); ${protected_ ? 'protection stated' : 'reason for no protection stated'}` : `crosses a trust boundary (${reasons.join(', ')}): state its protection, or the reason it needs none (one word is enough, for example “TLS” or “Power only”; “none”, “n/a” or “-” is not an answer)`)
  const gOk = said(x.degraded) && words(x.degraded) >= MIN_TEXT_WORDS
  c.gate('degraded', gOk, gOk ? 'degraded mode stated' : `say what each side does when it fails (at least ${MIN_TEXT_WORDS} words, for example “Fail safe”)`)
  if (x.kind === 'organizational' && idsIn(x.crosses).some((id) => id.startsWith('INFO-'))) c.adv('org-carries-data', gateShort(INTERFACE_ADVISORIES, 'org-carries-data'))
  if (!words(x.constraint) && !idsIn(x.requirements).length) c.adv('no-constraint', gateShort(INTERFACE_ADVISORIES, 'no-constraint'))
  if (!words(x.verification)) c.adv('no-verification', gateShort(INTERFACE_ADVISORIES, 'no-verification'))
  if (UNOWNED_MEDIUM.test(x.medium) && !x.exposed) c.adv('hidden-external', gateShort(INTERFACE_ADVISORIES, 'hidden-external'))
  if (isExternalInterface(x, r) && x.ownerA.trim() && x.ownerB.trim() && same(x.ownerA, x.ownerB)) c.adv('same-owner-external', gateShort(INTERFACE_ADVISORIES, 'same-owner-external'))
  const cardMismatch = ([[x.endA, x.ownerA], [x.endB, x.ownerB]] as const).some(([end, owner]) => { const card = end && endsOk(x, r).ok ? cardOwnerOf(r, end) : ''; return !!card && !!owner.trim() && !same(card, owner) })
  if (cardMismatch) c.adv('owner-spelling', gateShort(INTERFACE_ADVISORIES, 'owner-spelling'))
  if (e.ok && isExternalEnd(r, x.endA) && isExternalEnd(r, x.endB)) c.adv('no-internal-end', gateShort(INTERFACE_ADVISORIES, 'no-internal-end'))
  return c.done()
}
export const countedInterfaces = (r: Week5Record) => {
  const dup = duplicates(r.interfaces.map((x) => x.id))
  return r.interfaces.filter((x) => !dup.includes(x.id) && assessInterface(x, r).counts)
}
/** Interfaces whose two ends are valid (shown in the live N² while the rest is being written). */
export const placedInterfaces = (r: Week5Record) => r.interfaces.filter((x) => endsOk(x, r).ok)

// ---------------------------------------------------------------------------------------------- the N² chart
export type N2 = {
  /** The diagonal: the Week 4 physical elements, then every external element, in record order. */
  elements: string[]
  /** Cell (a, b) as a key `a|b` with a before b in diagonal order: the interface IDs joining a and b. */
  cells: Record<string, string[]>
  /** Interfaces with both ends inside one element (two components of one parent, or a component and its parent). */
  internal: Record<string, string[]>
  degrees: Record<string, number>
  degreeSum: number
  interfaces: number
  counts: { physical: number; information: number; organizational: number; external: string[] }
}
export const cellKey = (a: string, b: string, elements: string[]) => (elements.indexOf(a) <= elements.indexOf(b) ? `${a}|${b}` : `${b}|${a}`)
/** The interface N² (symmetric), computed from the definitions over `set` (default: the counted interfaces). A degree
 *  counts the interface ends at an element, so the degree sum is twice the number of interfaces in the chart. */
export function n2Of(r: Week5Record, set: Interface[] = countedInterfaces(r)): N2 {
  const elements = [...physicalOf(r).map((p) => p.id), ...allExternals(r).map((x) => x.id)]
  const cells: Record<string, string[]> = {}
  const internal: Record<string, string[]> = {}
  const degrees: Record<string, number> = Object.fromEntries(elements.map((e) => [e, 0]))
  const shown = set.filter((x) => endsOk(x, r).ok && elements.includes(elementOf(r, x.endA)) && elements.includes(elementOf(r, x.endB)))
  for (const x of shown) {
    const a = elementOf(r, x.endA)
    const b = elementOf(r, x.endB)
    degrees[a] += 1
    degrees[b] += 1
    if (a === b) (internal[a] ??= []).push(x.id)
    else (cells[cellKey(a, b, elements)] ??= []).push(x.id)
  }
  return {
    elements, cells, internal, degrees, degreeSum: Object.values(degrees).reduce((s, d) => s + d, 0), interfaces: shown.length,
    counts: {
      physical: shown.filter((x) => x.kind === 'physical').length, information: shown.filter((x) => x.kind === 'information').length, organizational: shown.filter((x) => x.kind === 'organizational').length,
      external: shown.filter((x) => isExternalInterface(x, r)).map((x) => x.id),
    },
  }
}
export const n2Cell = (n: N2, a: string, b: string) => (a === b ? (n.internal[a] ?? []) : (n.cells[cellKey(a, b, n.elements)] ?? []))
/** The interfaces that share an end element with `id`: its ends' rows and columns in the N² (the change-impact suggestion). */
export function neighboursOf(r: Week5Record, id: string): string[] {
  const x = r.interfaces.find((y) => y.id === id)
  if (!x || !endsOk(x, r).ok) return []
  const ends = [elementOf(r, x.endA), elementOf(r, x.endB)]
  return placedInterfaces(r).filter((y) => y.id !== id && [elementOf(r, y.endA), elementOf(r, y.endB)].some((e) => ends.includes(e))).map((y) => y.id)
}

// ---------------------------------------------------------------------------------------------- crossing flows
export type CrossingPair = { key: string; info: string; infoName: string; from: string; to: string; direct: string[]; relay: string; status: 'direct' | 'relay' | 'broken' | 'missing'; message: string }
export const pairKey = (info: string, from: string, to: string) => `${info}|${from}|${to}`
const infoInterfaces = (r: Week5Record) => r.interfaces.filter((x) => x.kind === 'information' && endsOk(x, r).ok)
/** Checks a relay (a list of IF IDs) hop by hop from `from` to `to`, as aerolinkCase.crossingFlows checks a route. */
export function relayPath(r: Week5Record, from: string, to: string, text: string): { ok: boolean; message: string } {
  const ids = idsIn(text).filter((id) => id.startsWith('IF-'))
  if (!ids.length) return { ok: false, message: 'no relay recorded' }
  let at = from
  for (const id of ids) {
    const x = r.interfaces.find((y) => y.id === id)
    if (!x) return { ok: false, message: `${id} is not an interface in the record` }
    if (x.kind !== 'information' || !endsOk(x, r).ok) return { ok: false, message: `${id} is not an information interface with two valid ends` }
    const a = elementOf(r, x.endA)
    const b = elementOf(r, x.endB)
    const next = a === at ? b : b === at ? a : null
    if (!next) return { ok: false, message: `${id} does not touch ${at}: the relay breaks there` }
    at = next
  }
  return at === to ? { ok: true, message: `relayed over ${ids.join(' → ')}` } : { ok: false, message: `the relay ends at ${at}, not at ${to}` }
}
/** PART_RULES 'crossing': every producer→consumer pair of every Week 4 information item, between different elements
 *  (an AI producer or consumer at its host), must ride an information interface directly or by a recorded relay. */
export function crossingPairs(r: Week5Record): CrossingPair[] {
  const out: CrossingPair[] = []
  const known = (id: string) => isPhy(r, id) || isExt(r, id)
  const infos = infoInterfaces(r)
  for (const item of r.week4?.information ?? []) {
    for (const p of item.producers) for (const q of item.consumers) {
      const from = placeOf(r, p)
      const to = placeOf(r, q)
      if (from === to || !known(from) || !known(to)) continue
      const key = pairKey(item.id, from, to)
      if (out.some((o) => o.key === key)) continue
      const direct = infos.filter((x) => { const a = elementOf(r, x.endA), b = elementOf(r, x.endB); return (a === from && b === to) || (a === to && b === from) }).map((x) => x.id)
      const relay = r.relays[key] ?? ''
      const base = { key, info: item.id, infoName: item.name, from, to, direct, relay }
      if (direct.length) out.push({ ...base, status: 'direct', message: `rides ${direct.join(', ')}` })
      else if (!idsIn(relay).length) out.push({ ...base, status: 'missing', message: 'rides no information interface: add one, or record the relay (IF IDs in order)' })
      else {
        const p2 = relayPath(r, from, to, relay)
        out.push({ ...base, status: p2.ok ? 'relay' : 'broken', message: p2.message })
      }
    }
  }
  return out
}

// ---------------------------------------------------------------------------------------------- Part 21: requirements
const snapIds = (r: Week5Record, k: 'needs' | 'capabilities' | 'requirements' | 'risks') => new Set((r.week4?.[k] ?? []).map((x) => x.id))
export function assessRequirement(q: Requirement, r: Week5Record): Assessment<RequirementGateId, never> {
  const c = collector<RequirementGateId, never>()
  const shalls = (q.statement.match(/\bshall\b/gi) ?? []).length
  c.gate('one-shall', shalls === 1, shalls === 1 ? 'one “shall”' : shalls === 0 ? 'write the requirement with one “shall”' : `${shalls} “shall”s: split it into ${shalls} requirements`)
  const iOk = r.interfaces.some((x) => x.id === q.interface)
  c.gate('interface', iOk, iOk ? `governs ${q.interface}` : 'choose the interface it governs')
  const crOk = criterionOk(q.criterion)
  c.gate('criterion', crOk, crOk ? 'criterion stated' : 'give the verification criterion: a value with its unit (“2 min”) or a TBD with an owner (“TBD (Ops)”)')
  c.gate('method', !!q.method, q.method ? q.method : 'choose inspection, analysis, demonstration or test')
  const earlier = r.requirements.filter((x) => num(x.id) < num(q.id)).map((x) => x.id)
  const known = new Set([...snapIds(r, 'needs'), ...snapIds(r, 'capabilities'), ...snapIds(r, 'requirements'), ...earlier])
  const ps = idsIn(q.parents)
  const bad = ps.filter((p) => !known.has(p))
  c.gate('parent', ps.length > 0 && !bad.length, bad.length ? `${bad.join(', ')} is not a need, capability or earlier requirement in the record` : ps.length ? `traces to ${ps.join(', ')}` : 'name the need, capability or requirement it refines')
  return c.done()
}

// ---------------------------------------------------------------------------------------------- Part 22: management
const IMPACT_PREFIX = /^(IF|PHY|EXT|CMP|REQ-STK|REQ-SYS)-/
export function assessChange(x: Change, r: Week5Record): Assessment<ChangeGateId, never> {
  const c = collector<ChangeGateId, never>()
  const iOk = r.interfaces.some((y) => y.id === x.interface)
  c.gate('interface', iOk, iOk ? `changes ${x.interface}` : 'choose the interface it changes')
  const chOk = said(x.change) && words(x.change) >= MIN_TEXT_WORDS
  c.gate('change', chOk, chOk ? 'change stated' : `state the change (at least ${MIN_TEXT_WORDS} words, for example “Add encryption”)`)
  const known = new Set([...r.interfaces.map((y) => y.id), ...physicalOf(r).map((p) => p.id), ...allExternals(r).map((e) => e.id), ...r.components.map((y) => y.id), ...snapIds(r, 'requirements'), ...r.requirements.map((q) => q.id)])
  const ids = idsIn(x.impact).filter((id) => IMPACT_PREFIX.test(id))
  const bad = ids.filter((id) => !known.has(id))
  c.gate('impact', ids.length > 0 && !bad.length, bad.length ? `${bad.join(', ')} not in the record` : ids.length ? `reaches ${ids.join(', ')}` : 'name the interfaces, elements or requirements it reaches (read its ends’ N² row and column)')
  const dOk = partSaid(x.decision) && words(x.decider) >= 1
  c.gate('decision', dOk, dOk ? `decided by ${x.decider.trim()}` : 'state the decision (one word is enough, for example “Approved”; “n/a” or “?” is not a decision) and who made it')
  return c.done()
}
/** Interfaces linked to a risk that exists in the register, and the security or resilience risks among those links. */
export function riskLinks(r: Week5Record) {
  const risks = r.week4?.risks ?? []
  const known = new Set(risks.map((x) => x.id))
  const linked = r.interfaces.filter((x) => idsIn(x.risks).some((id) => known.has(id)))
  const sr = [...new Set(linked.flatMap((x) => idsIn(x.risks)).filter((id) => /security|resilience/i.test(risks.find((y) => y.id === id)?.category ?? '')))]
  const unknown = r.interfaces.flatMap((x) => idsIn(x.risks).filter((id) => id.startsWith('R-') && !known.has(id)).map((id) => `${x.id}: ${id}`))
  return { linked: linked.map((x) => x.id), securityOrResilience: sr, unknown }
}
export const icwgMembers = (r: Week5Record) => lines(r.icwg)
/** Whether the record holds any team work (an imported Week 4 record or any Week 5 entry): a teammate's file would
 *  replace it, so the tool asks first (A22, no silent overwrite). */
export const hasWork = (r: Week5Record) => !!r.week4 || [r.components, r.interfaces, r.requirements, r.changes, r.externals].some((x) => x.length > 0) || !!(r.icwg.trim() || r.standards.trim() || r.aiStatement.trim())

// ---------------------------------------------------------------------------------------------- part checks
export type PartCheck = { ok: boolean; issues: string[]; detail: string; notes?: string[] }
const result = (issues: string[], okDetail: string, notes: string[] = []): PartCheck => ({ ok: issues.length === 0, issues, detail: issues.length ? issues[0] + (issues.length > 1 ? ` (+${issues.length - 1} more)` : '') : okDetail, notes })
const three = (r: Week5Record) => (r.threePersonTeam ? ' (three-person team minimum, pending faculty approval)' : '')
const failed = <G extends string>(id: string, a: Assessment<G, string>, list: readonly { id: string; short: string }[]) => {
  const f = a.gates.filter((g) => !g.ok)
  return f.length ? `${id} does not count: ${gateShort(list, f[0].id)} (${f[0].message})${f.length > 1 ? ` (+${f.length - 1} more)` : ''}` : ''
}

export function checkImport(r: Week5Record): PartCheck {
  const w = r.week4
  if (!w) return result(['Import your team’s Week 4 model-inputs file (team-NN-week4-model-inputs.json): the Week 5 breakdown starts from its physical elements and the interfaces from its information routes.'], '')
  const issues: string[] = []
  const notes: string[] = []
  if ([w.enterprise, w.soi].some(isAeroLink)) issues.push('The imported record names AeroLink, the instructor’s worked example: import your team’s own Week 4 record.')
  if (!w.physical.length) issues.push('The imported record has no physical elements.')
  if (w.week4Status && w.week4Status !== 'ready') notes.push('The Week 4 record was exported as “not ready”. Correct it first where the feedback asks, then import it again.')
  return result(issues, `${w.enterprise}: ${plural(w.physical.length, 'physical element')}, ${plural(w.externals.length, 'external element')}, ${plural(w.information.length, 'information item')} from Week 4.`, notes)
}

/** The component count of Part 19: physical elements with a passing card plus level-2 components that pass every gate. */
export function componentCount(r: Week5Record) {
  const dup = duplicates(r.components.map((c) => c.id))
  const level1 = physicalOf(r).filter((p) => assessCard(cardOf(r, p.id)).counts).map((p) => p.id)
  const level2 = r.components.filter((c) => !dup.includes(c.id) && assessComponent(c, r).counts).map((c) => c.id)
  return { level1, level2, total: level1.length + level2.length }
}

export function checkBreakdownPart(r: Week5Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  const dup = duplicates(r.components.map((c) => c.id))
  if (dup.length) issues.push(`Duplicate component ID ${dup.join(', ')}: each ID once.`)
  for (const p of physicalOf(r)) {
    const m = failed(`${p.id}’s responsibility card`, assessCard(cardOf(r, p.id)), CARD_GATES)
    if (m) issues.push(m.replace('does not count', 'is incomplete'))
  }
  for (const c of r.components) {
    const m = failed(c.id, assessComponent(c, r), COMPONENT_GATES)
    if (m) issues.push(m)
    if (isAeroLink(`${c.name} ${c.responsibility}`)) issues.push(`${c.id} names AeroLink, the instructor’s worked example: describe your own enterprise.`)
  }
  const n = componentCount(r)
  if (n.total < min.components) issues.push(`At least ${min.components} components that pass every hard gate, counting the physical elements with a complete card${three(r)} (${n.total} so far).`)
  const l1 = physicalOf(r).length
  if (l1 && (l1 < SPAN.low || l1 > SPAN.high)) notes.push(`Advisory: ${l1} level-1 elements; ${ruleShort('span')}.`)
  for (const p of physicalOf(r)) {
    const k = componentsOf(r, p.id).length
    if (k === 1) notes.push(`${p.id}: advisory, ${ruleShort('single-child')}.`)
    else if (k > 1 && (k < SPAN.low || k > SPAN.high)) notes.push(`${p.id}: advisory, ${k} components under it; ${ruleShort('span')}.`)
  }
  for (const c of r.components) {
    const fs = idsIn(c.functions).filter((id) => id.startsWith('FN-'))
    const outside = fs.filter((f) => !functionsAt(r, c.parent).includes(f))
    if (outside.length) notes.push(`${c.id}: advisory, ${outside.join(', ')} ${outside.length > 1 ? 'are' : 'is'} not allocated to ${c.parent || 'its parent'} in Week 4; a component refines its parent’s allocation.`)
  }
  return result(issues, `${n.total} components count (${n.level1.length} level-1 elements with a card, ${n.level2.length} level-2 components).`, notes)
}

export function checkInterfacesPart(r: Week5Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  const dup = duplicates([...r.interfaces.map((x) => x.id), ...r.externals.map((x) => x.id), ...(r.week4?.externals ?? []).map((x) => x.id)])
  if (dup.length) issues.push(`Duplicate ID ${dup.join(', ')}: each ID once.`)
  for (const x of r.externals) if (words(x.name) < 1) issues.push(`${x.id}: name the external element (one word is enough), or remove it.`)
  const st = r.interfaces.map((x) => ({ x, a: assessInterface(x, r) }))
  for (const { x, a } of st) {
    const m = failed(x.id, a, INTERFACE_GATES)
    if (m) issues.push(m)
    for (const y of a.advisories) notes.push(`${x.id}: advisory, ${y.message}`)
  }
  const counted = countedInterfaces(r)
  if (counted.length < min.interfaces) issues.push(`At least ${min.interfaces} interfaces that pass every hard gate${three(r)} (${counted.length} so far).`)
  const n = n2Of(r, counted)
  for (const e of allExternals(r)) if (!n.degrees[e.id] && !partSaid(r.externalReasons[e.id] ?? '')) issues.push(`${e.id} ${e.name.trim() || ''}`.trim() + `: ${ruleShort('externals')} (give it an interface, or the reason it has none; a short reason such as “No exchange yet” is enough).`)
  for (const p of crossingPairs(r)) if (p.status === 'missing' || p.status === 'broken') issues.push(`${p.info} ${p.from} → ${p.to}: ${p.message}.`)
  if (counted.length) for (const k of INTERFACE_KINDS) if (!counted.some((x) => x.kind === k.id)) notes.push(`Advisory: no ${k.label.toLowerCase()} interface; ${ruleShort('kinds')}.`)
  const unknownReq = r.interfaces.flatMap((x) => idsIn(x.requirements).filter((id) => id.startsWith('REQ-') && !snapIds(r, 'requirements').has(id) && !r.requirements.some((q) => q.id === id)).map((id) => `${x.id}: ${id}`))
  if (unknownReq.length) notes.push(`Requirement IDs not in the record: ${unknownReq.join('; ')}.`)
  return result(issues, `${counted.length} interfaces count (${n.counts.physical} physical, ${n.counts.information} information, ${n.counts.organizational} organizational; ${n.counts.external.length} external); degree sum ${n.degreeSum} = 2 × ${n.interfaces}.`, notes)
}

export function checkRequirementsPart(r: Week5Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  const snapReqs = snapIds(r, 'requirements')
  const dup = duplicates(r.requirements.map((q) => q.id))
  if (dup.length) issues.push(`Duplicate requirement ID ${dup.join(', ')}: each ID once.`)
  const reused = r.requirements.filter((q) => snapReqs.has(q.id)).map((q) => q.id)
  if (reused.length) issues.push(`${reused.join(', ')} already exists in the imported record: a requirement ID is never reused.`)
  const st = r.requirements.map((q) => ({ q, a: assessRequirement(q, r) }))
  for (const { q, a } of st) {
    const m = failed(q.id, a, REQUIREMENT_GATES)
    if (m) issues.push(m)
  }
  const counting = st.filter((x) => x.a.counts && !dup.includes(x.q.id) && !reused.includes(x.q.id))
  if (counting.length < min.requirements) issues.push(`At least ${min.requirements} interface requirements that pass every hard gate${three(r)} (${counting.length} so far).`)
  const counted = countedInterfaces(r)
  const ext = counted.filter((x) => isExternalInterface(x, r)).map((x) => x.id)
  const governed = new Set(counting.map((x) => x.q.interface))
  const ungoverned = ext.filter((id) => !governed.has(id))
  if (ext.length && ungoverned.length) notes.push(`External interfaces with no interface requirement yet: ${ungoverned.join(', ')}. Write one per external interface where you can.`)
  return result(issues, `${counting.length} interface requirements count.`, notes)
}

export function checkManagementPart(r: Week5Record): PartCheck {
  const min = minimumsOf(r)
  const issues: string[] = []
  const notes: string[] = []
  const members = icwgMembers(r)
  if (members.length < 2) issues.push(`Name the interface control working group: at least two organizations, one per line (${members.length} so far).`)
  if (words(r.standards) < MIN_PART_WORDS) issues.push('Say which interface standards apply, or write “none” (one word is enough).')
  else if (/^\s*none\W*$/i.test(r.standards)) notes.push('Advisory: “none” with no reason: add why no standard applies (for example “none: both ends are ours”) so a reviewer can check it.')
  const dup = duplicates(r.changes.map((x) => x.id))
  if (dup.length) issues.push(`Duplicate change request ID ${dup.join(', ')}: each ID once.`)
  const st = r.changes.map((x) => ({ x, a: assessChange(x, r) }))
  for (const { x, a } of st) {
    const m = failed(x.id, a, CHANGE_GATES)
    if (m) issues.push(m)
  }
  const counting = st.filter((y) => y.a.counts && !dup.includes(y.x.id))
  if (counting.length < min.changeRequests) issues.push(`At least ${min.changeRequests} change request that passes every hard gate (${counting.length} so far).`)
  const links = riskLinks(r)
  if (links.linked.length < min.riskLinks) issues.push(`At least ${min.riskLinks} interfaces linked to a risk in the register (${links.linked.length} so far).`)
  if (!links.securityOrResilience.length) issues.push(`${ruleShort('security-link')[0].toUpperCase()}${ruleShort('security-link').slice(1)} (none so far).`)
  if (links.unknown.length) notes.push(`Risk IDs not in the register: ${links.unknown.join('; ')}.`)
  return result(issues, `${plural(members.length, 'organization')} in the ICWG; ${plural(counting.length, 'change request')}; ${plural(links.linked.length, 'interface')} linked to risks (${links.securityOrResilience.join(', ')} security or resilience).`, notes)
}

export function checkAiStatement(r: Week5Record): PartCheck {
  const n = words(r.aiStatement)
  return result(n >= MIN_AI_WORDS ? [] : [`Write the AI usage statement for the Week 5 work (at least ${MIN_AI_WORDS} words, ${n} so far): tool, purpose, prompts, what you accepted or rejected and why, with AI-suggested items tagged; or say that no AI tool was used.`], 'AI usage statement recorded.')
}

export type PartId = 'import' | PartKey | 'ai'
export const WEEK5_PART_IDS: PartId[] = ['import', ...WEEK5_PARTS.map((p) => p.id), 'ai']
export function allChecks(r: Week5Record): Record<PartId, PartCheck> {
  return { import: checkImport(r), breakdown: checkBreakdownPart(r), interfaces: checkInterfacesPart(r), requirements: checkRequirementsPart(r), management: checkManagementPart(r), ai: checkAiStatement(r) }
}
export type RecordState = 'not-ready' | 'ready'
export const recordState = (r: Week5Record): RecordState => (Object.values(allChecks(r)).every((c) => c.ok) ? 'ready' : 'not-ready')

// ---------------------------------------------------------------------------------------------- Markdown
const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n+/g, '; ').trim()
export const fileStem = (r: Week5Record) => `team-${(r.week4?.team || 'NN').replace(/[^\w-]+/g, '') || 'NN'}-week5`
const gateText = (a: { counts: boolean; gates: { id: string; ok: boolean }[]; advisories: { id: string }[] }) => `${a.counts ? 'all pass' : `fails ${a.gates.filter((g) => !g.ok).map((g) => g.id).join(', ')}`}${a.advisories.length ? `; advisory: ${a.advisories.map((x) => x.id).join(', ')}` : ''}`
const kindText = (x: Interface, r: Week5Record) => `${x.kind ? interfaceKindLabel(x.kind) : ''}${isExternalInterface(x, r) ? ' (external)' : ''}`
const protectionText = (x: Interface, r: Week5Record) => (crossesBoundary(x, r) ? `${boundaryReasons(x, r).join(', ')}: ${cell(x.protection) || (x.noProtectionReason.trim() ? `none needed: ${cell(x.noProtectionReason)}` : '')}` : cell(x.protection) || 'no trust boundary')

export function recordMarkdown(r: Week5Record, today = new Date().toISOString().slice(0, 10)): string {
  const w = r.week4
  const checks = allChecks(r)
  const n = n2Of(r)
  const label = (id: string) => `${id}${nameOf(r, id) ? ` ${cell(nameOf(r, id))}` : ''}`
  const L: string[] = [
    `# Week 5 Team Record: ${cell(w?.enterprise ?? '') || '(Week 4 record not imported)'}`,
    '',
    `Team: ${cell(w?.team ?? '') || '____'} · Exported from the Week 5 lab tool, ${today}. Extends the Week 4 Team Record.`,
    '',
    `**Record status:** ${recordState(r) === 'ready' ? 'complete: every part passes its checks' : `not ready: ${Object.entries(checks).filter(([, x]) => !x.ok).length} part(s) still incomplete`}.${r.threePersonTeam ? ' Three-person team: reduced minimums (pending faculty approval).' : ''}`,
    '',
    '## 6. AI usage statement (updated)',
    '',
    r.aiStatement.trim() || '_Not written yet._',
    '',
  ]
  const tagged = [...r.components.filter((x) => x.ai).map((x) => x.id), ...r.interfaces.filter((x) => x.ai).map((x) => x.id), ...r.requirements.filter((x) => x.ai).map((x) => x.id)]
  if (tagged.length) L.push(`AI-suggested, reviewed by the team: ${tagged.join(', ')}.`, '')
  // Part 19
  L.push(`## ${partNumber('breakdown')}. ${partTitle('breakdown')}`, '', '| Element | Responsibility | Owner | Functions (Week 4 allocation) | Level-2 components | Checks |', '|---|---|---|---|---|---|')
  for (const p of physicalOf(r)) {
    const c = cardOf(r, p.id)
    L.push(`| ${p.id} ${cell(p.name)} | ${cell(c.responsibility)} | ${cell(c.owner)} | ${functionsAt(r, p.id).join(', ')} | ${componentsOf(r, p.id).map((x) => x.id).join(', ')} | ${gateText(assessCard(c))} |`)
  }
  L.push('', '| Component | Name | Parent | Kind | Responsibility | Functions | Checks |', '|---|---|---|---|---|---|---|')
  for (const c of r.components) L.push(`| ${c.id} | ${cell(c.name)}${c.ai ? ' (AI-suggested, reviewed)' : ''} | ${c.parent} | ${c.kind ? componentKindLabel(c.kind) : ''} | ${cell(c.responsibility)} | ${idsIn(c.functions).join(', ')} | ${gateText(assessComponent(c, r))} |`)
  // Part 20
  L.push('', `## ${partNumber('interfaces')}. ${partTitle('interfaces')}`, '')
  L.push('| External | Name | Interfaces | Reason for none |', '|---|---|---|---|', ...allExternals(r).map((e) => `| ${e.id} | ${cell(e.name)} | ${n.degrees[e.id] ?? 0} | ${cell(r.externalReasons[e.id] ?? '')} |`), '')
  L.push(`### N² chart (interfaces that pass every hard gate)`, '', `| | ${n.elements.join(' | ')} | Degree |`, `|---|${n.elements.map(() => '---').join('|')}|---|`)
  for (const a of n.elements) L.push(`| **${label(a)}** | ${n.elements.map((b) => (a === b ? (n2Cell(n, a, a).length ? `(${n2Cell(n, a, a).join(', ')})` : '■') : n2Cell(n, a, b).join(', '))).join(' | ')} | ${n.degrees[a]} |`)
  L.push('', `Degree sum ${n.degreeSum} = 2 × ${n.interfaces} interfaces. ${n.counts.physical} physical, ${n.counts.information} information, ${n.counts.organizational} organizational; external: ${n.counts.external.join(', ') || 'none'}.`, '')
  L.push(`| ${[...TABLE_COLUMNS, 'risks', 'standard', 'checks'].join(' | ')} |`, `|${[...TABLE_COLUMNS, 'risks', 'standard', 'checks'].map(() => '---').join('|')}|`)
  for (const x of r.interfaces) L.push(`| ${x.id} ${cell(x.name)}${x.ai ? ' (AI-suggested, reviewed)' : ''} | ${kindText(x, r)} | ${x.endA} ↔ ${x.endB} | ${cell(x.crosses)} | ${cell(x.direction) || (x.kind === 'organizational' ? 'none (agreement)' : '')} | ${cell(x.medium)}${x.exposed ? ' (public input or unowned medium)' : ''} | ${[cell(x.constraint), idsIn(x.requirements).join(', ')].filter(Boolean).join('; ')} | ${cell(x.ownerA)} / ${cell(x.ownerB)} | ${cell(x.verification)} | ${protectionText(x, r)} | ${cell(x.degraded)} | ${idsIn(x.risks).join(', ')} | ${cell(x.standard)} | ${gateText(assessInterface(x, r))} |`)
  L.push('', '### Crossing-flow check', '')
  const cp = crossingPairs(r)
  if (!cp.length) L.push('_No Week 4 information item crosses between two different elements._')
  for (const p of cp) L.push(`- ${p.status === 'direct' || p.status === 'relay' ? 'pass' : 'open'}: ${p.info} ${cell(p.infoName)}, ${p.from} → ${p.to}: ${cell(p.message)}`)
  // Part 21
  L.push('', `## ${partNumber('requirements')}. ${partTitle('requirements')}`, '', '| ID | Name | Statement | Interface | Criterion | Method | Parents | Rationale | Checks |', '|---|---|---|---|---|---|---|---|---|')
  for (const q of r.requirements) L.push(`| ${q.id} | ${cell(q.name)}${q.ai ? ' (AI-suggested, reviewed)' : ''} | ${cell(q.statement)} | ${q.interface} | ${cell(q.criterion)} | ${q.method} | ${idsIn(q.parents).join(', ')} | ${cell(q.rationale)} | ${gateText(assessRequirement(q, r))} |`)
  // Part 22
  const links = riskLinks(r)
  L.push('', `## ${partNumber('management')}. ${partTitle('management')}`, '', `- Interface control working group: ${icwgMembers(r).map(cell).join('; ') || '____'}`, `- Standards: ${cell(r.standards) || '____'}`, `- Interfaces linked to risks: ${links.linked.join(', ') || 'none'}; security or resilience risks linked: ${links.securityOrResilience.join(', ') || 'none'}`, '')
  for (const x of r.changes) L.push(`### ${x.id}: change to ${x.interface || '____'}`, '', `- Change: ${cell(x.change)}`, `- N² neighbours of ${x.interface || 'the interface'}: ${neighboursOf(r, x.interface).join(', ') || 'none'}`, `- Impact: ${idsIn(x.impact).join(', ')}`, `- Decision: ${cell(x.decision)} (decided by ${cell(x.decider) || '____'})`, `- Checks: ${gateText(assessChange(x, r))}`, '')
  L.push('## Part checks', '', ...Object.entries(checks).map(([k, c]) => `- ${c.ok ? 'pass' : 'open'}: ${k} (${cell(c.detail)})`), '')
  return L.join('\n')
}

// ---------------------------------------------------------------------------------------------- JSON model inputs
/** The SysML v2 element each item seeds in Phase II (course working mapping; named only). */
export const SEEDS = {
  component: ['part def/part usage (named only)'],
  interface: ['interface def with ends as ports; connection usage (named only)'],
  flows: ['flow of items (named only)'],
  requirement: ['requirement def (named only)'],
  change: ['metadata (named only)'],
} as const

export function modelInputs(r: Week5Record) {
  const checks = allChecks(r)
  const gates = (a: { counts: boolean; gates: { id: string; ok: boolean }[]; advisories: { id: string }[] }) => ({ counts: a.counts, gatesFailed: a.gates.filter((g) => !g.ok).map((g) => g.id), advisories: a.advisories.map((g) => g.id) })
  const n = n2Of(r)
  return {
    format: MODEL_INPUTS_FORMAT,
    version: MODEL_INPUTS_VERSION,
    team: r.week4?.team ?? '',
    status: recordState(r),
    threePersonTeam: r.threePersonTeam,
    week4: r.week4,
    cards: r.cards.map((c) => ({ ...c, functions: functionsAt(r, c.phy), ...gates(assessCard(c)) })),
    components: r.components.map((c) => ({ ...c, functions: idsIn(c.functions), ...gates(assessComponent(c, r)), seeds: SEEDS.component })),
    externals: r.externals,
    externalReasons: r.externalReasons,
    interfaces: r.interfaces.map((x) => ({
      ...x, requirements: idsIn(x.requirements), risks: idsIn(x.risks), crossesItems: idsIn(x.crosses).filter((id) => id.startsWith('INFO-')),
      elements: endsOk(x, r).ok ? [elementOf(r, x.endA), elementOf(r, x.endB)] : [], external: isExternalInterface(x, r), boundary: boundaryReasons(x, r),
      ...gates(assessInterface(x, r)), seeds: x.kind === 'information' || x.kind === 'physical' ? [...SEEDS.interface, ...SEEDS.flows] : SEEDS.interface,
    })),
    relays: r.relays,
    n2: { elements: n.elements, cells: n.cells, internal: n.internal, degrees: n.degrees, degreeSum: n.degreeSum, interfaces: n.interfaces },
    crossing: crossingPairs(r),
    requirements: r.requirements.map((q) => ({ ...q, parents: idsIn(q.parents), ...gates(assessRequirement(q, r)), seeds: SEEDS.requirement })),
    icwg: icwgMembers(r),
    standards: r.standards,
    changes: r.changes.map((x) => ({ ...x, impact: idsIn(x.impact), neighbours: neighboursOf(r, x.interface), ...gates(assessChange(x, r)), seeds: SEEDS.change })),
    riskLinks: riskLinks(r),
    aiStatement: r.aiStatement.trim(),
    seeds: SEEDS,
    checks: { parts: Object.fromEntries(Object.entries(checks).map(([k, x]) => [k, { ok: x.ok, issues: x.issues.length }])) },
    issued: r.issued,
  }
}

// ---------------------------------------------------------------------------------------------- import (teammate share)
const kindOf = (x: unknown) => (x === null ? 'null' : Array.isArray(x) ? 'a list' : typeof x === 'object' ? 'an object' : typeof x === 'string' ? 'text' : typeof x)

/** Reads a Week 5 model-inputs JSON file (a teammate's export) back into a record. Never throws. */
export function importWeek5(text: string): Week5Record | { error: string } {
  try {
    return importUnsafe(text)
  } catch (e) {
    return { error: `This file could not be read as Week 5 model inputs (${e instanceof Error ? e.message : String(e)}).` }
  }
}

function importUnsafe(text: string): Week5Record | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON. Choose a teammate’s team-NN-week5-model-inputs.json.' }
  }
  if (isObj(d) && d.format === SOURCE_FORMAT) return { error: 'This is a Week 4 model-inputs file: use “Start from your Week 4 Team Record” to start the Week 5 record from it.' }
  if (isObj(d) && typeof d.format === 'string' && EARLIER[d.format]) return { error: `This is a ${EARLIER[d.format]} model-inputs file: the Week 5 record starts from your team’s Week 4 export, and a teammate shares a Week 5 export.` }
  if (!isObj(d)) return { error: `This file holds ${kindOf(d)}, not a Week 5 model-inputs file (format “${MODEL_INPUTS_FORMAT}”).` }
  if (d.format !== MODEL_INPUTS_FORMAT) return { error: d.format === undefined ? 'This file has no “format”: it is not a lab-tool export. Ask your teammate for team-NN-week5-model-inputs.json.' : `This is not a Week 5 model-inputs file (format “${MODEL_INPUTS_FORMAT}”; this file says ${JSON.stringify(d.format)}).` }
  if (typeof d.version === 'string') return { error: `This Week 5 file gives its version as text (“${d.version}”); this tool reads version ${MODEL_INPUTS_VERSION} written as a number. Ask your teammate to export again.` }
  if (d.version !== MODEL_INPUTS_VERSION) return { error: `This Week 5 file has version ${JSON.stringify(d.version)}; this tool reads version ${MODEL_INPUTS_VERSION}.` }
  for (const path of ['cards', 'components', 'externals', 'interfaces', 'requirements', 'changes'] as const) {
    const x = d[path]
    if (x === undefined) continue
    if (!Array.isArray(x)) return { error: `“${path}” must be a list; this file has ${kindOf(x)}.` }
    const bad = x.findIndex((y) => !isObj(y))
    if (bad >= 0) return { error: `“${path}” item ${bad + 1} is ${kindOf(x[bad])}, not an object.` }
  }
  if (d.week4 !== undefined && d.week4 !== null && !isObj(d.week4)) return { error: `“week4” must be an object; this file has ${kindOf(d.week4)}.` }
  const w4 = isObj(d.week4) ? d.week4 : undefined
  if (w4 && (isAeroLink(str(w4.enterprise)) || isAeroLink(str(w4.soi)))) return { error: 'This file is about AeroLink, the instructor’s worked example: import your team’s own record.' }
  const rec = normalizeRecord(d)
  for (const prefix of Object.keys(ID_FORMS) as IdPrefix[]) {
    const ids = idsOf(rec, prefix)
    const bad = ids.filter((id) => !ID_FORMS[prefix].test(id))
    if (bad.length) return { error: `Unexpected ${PREFIX_TEXT[prefix]} IDs in the file: ${bad.slice(0, 3).map((x) => x || '(empty)').join(', ')}. IDs look like ${PREFIX_TEXT[prefix]}-001.` }
    const dup = duplicates(ids)
    if (dup.length) return { error: `Duplicate ID ${dup[0]} in the file: each ID once. Fix the file, or ask the teammate who exported it to export again.` }
  }
  return rec
}
