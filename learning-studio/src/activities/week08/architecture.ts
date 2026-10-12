// Week 8 architecture checks (pure). Reads the FN / LOG / PHY / EXT / IF / INFO / AI layer of an engineering model and
// checks it against the L8 acceptance rules (LABORATORY_AND_CAPSTONE_PLAN.md Part B, L8: "Every FN is allocated; every
// IF has a type and both ends; every INFO names the decision it supports") and the L8 minimums, plus RB-7.2's "no
// physical names in the functional view". Screening heuristics are labelled as such; a reviewer still judges.
// Source of the allocation-justification criteria: SEBoK Physical Architecture, R20c p.598-599 (affinity criteria for
// partitioning and allocation). Course convention: an IF's two ends are stored as "A <-> B" in attributes.ends.
import type { Element, EngineeringModel, Link } from '../../model/engineering'

export const IF_TYPES = ['physical', 'information', 'organisational'] as const
export type IfType = (typeof IF_TYPES)[number]

export type ArchFn = { id: string; name: string; caps: string[]; scenarios: string[]; phys: string[]; performers: string[]; rationale: string[] }
export type ArchIf = { id: string; name: string; type: string; ends: [string, string] | null; endsRaw: string; carries: string }
export type ArchLog = { id: string; name: string; performs: string[]; phys: string[] }
export type Architecture = {
  fns: ArchFn[]
  logs: ArchLog[]
  /** PHY elements each performer (LOG or AI) is allocated to; used by the allocation-consistency advisory. */
  performerPhys: Record<string, string[]>
  phys: Element[]
  exts: Element[]
  ifs: ArchIf[]
  infos: Element[]
  ais: Element[]
}

const live = (m: EngineeringModel) => {
  const ids = new Set(m.elements.filter((e) => e.status === 'active').map((e) => e.id))
  return { ids, links: m.links.filter((l) => ids.has(l.source) && ids.has(l.target)) }
}
const ofKind = (m: EngineeringModel, k: Element['kind']) => m.elements.filter((e) => e.kind === k && e.status === 'active')
const pre = (id: string) => id.split('-')[0]

/** Parses "PHY-001 <-> PHY-002" (also "↔", "-", "," or "to" as separators) into two IDs, or null. */
export function parseEnds(raw: string | number | boolean | undefined): [string, string] | null {
  if (typeof raw !== 'string') return null
  const ids = raw.match(/\b[A-Z]{2,4}-\d{3}\b/g) ?? []
  return ids.length === 2 ? [ids[0], ids[1]] : null
}

export function readArchitecture(m: EngineeringModel): Architecture {
  const { links } = live(m)
  const out = (src: string, t: Link['type']) => links.filter((l) => l.source === src && l.type === t)
  const into = (tgt: string, t: Link['type']) => links.filter((l) => l.target === tgt && l.type === t)
  const fns: ArchFn[] = ofKind(m, 'FN').map((f) => {
    const alloc = out(f.id, 'allocated-to').filter((l) => pre(l.target) === 'PHY')
    return {
      id: f.id,
      name: f.name,
      caps: out(f.id, 'derives-from').map((l) => l.target).filter((t) => pre(t) === 'CAP'),
      scenarios: out(f.id, 'derives-from').map((l) => l.target).filter((t) => pre(t) === 'SCN'),
      phys: alloc.map((l) => l.target),
      performers: into(f.id, 'performs').map((l) => l.source).filter((s) => ['LOG', 'AI'].includes(pre(s))),
      rationale: alloc.map((l) => l.rationale ?? ''),
    }
  })
  const logs: ArchLog[] = ofKind(m, 'LOG').map((l) => ({
    id: l.id,
    name: l.name,
    performs: out(l.id, 'performs').map((x) => x.target),
    phys: out(l.id, 'allocated-to').map((x) => x.target).filter((t) => pre(t) === 'PHY'),
  }))
  const ifs: ArchIf[] = ofKind(m, 'IF').map((i) => ({
    id: i.id,
    name: i.name,
    type: String(i.attributes?.type ?? ''),
    ends: parseEnds(i.attributes?.ends),
    endsRaw: String(i.attributes?.ends ?? ''),
    carries: String(i.attributes?.carries ?? ''),
  }))
  const performerPhys: Record<string, string[]> = Object.fromEntries(
    [...ofKind(m, 'LOG'), ...ofKind(m, 'AI')].map((p) => [p.id, out(p.id, 'allocated-to').map((x) => x.target).filter((t) => pre(t) === 'PHY')]),
  )
  return { fns, logs, performerPhys, phys: ofKind(m, 'PHY'), exts: ofKind(m, 'EXT'), ifs, infos: ofKind(m, 'INFO'), ais: ofKind(m, 'AI') }
}

// ------------------------------------------------------------------------------------------------
// Screening heuristics

const SOLUTION_NOUNS =
  /\b(system|systems|platform|cent(er|re)|facility|server|app|application|software|hardware|computer|database|controller|subsystem|module|unit|panel|sensor|device|equipment|infrastructure|datalink)\b/i
/** Performer roles that, as the first word of a name, make the performer the subject ("Technician repairs aircraft"). */
const PERFORMER_FIRST = /^(technicians?|dispatchers?|pilots?|chargers?|operators?|staff|crew|controllers?|agents?|team|managers?|engineers?|mechanics?|drivers?|attendants?|ai|algorithm|model)\b/i
const norm = (s: string) => s.toLowerCase().replace(/centre/g, 'center').replace(/\s+/g, ' ').trim()

/**
 * RB-7.2 (level 4: "no physical names in the functional view"). Flags a function name that names a solution
 * (a physical or software element noun), starts with a performer role, or starts with the name of a physical element
 * (the performer as subject). Screening only: "Charge aircraft" passes because the aircraft is the object of the verb,
 * not the performer.
 */
export function functionNameProblem(name: string, physNames: string[] = []): string | null {
  const n = norm(name)
  if (n.split(' ').length < 2) return 'A function name should be a verb phrase (verb + object), e.g. “Charge aircraft”.'
  const noun = name.match(SOLUTION_NOUNS)
  if (noun) return `“${noun[0]}” names a solution element; the functional view states what is done, not what does it.`
  const role = n.match(PERFORMER_FIRST)
  if (role) return `The name starts with a performer (“${role[0]}”); state the transformation as verb + object, without who performs it.`
  const phy = physNames.find((p) => p.length >= 5 && n.startsWith(norm(p)))
  if (phy) return `The name starts with the physical element “${phy}”; name the transformation instead.`
  return null
}

/**
 * Affinity criteria for partitioning and allocation, paraphrased from R20c p.598-599, plus two aims R20c p.599 lists for
 * a candidate physical architecture (proximity of elements in space; fewer physical interfaces). The
 * patterns deliberately avoid single generic words ("data", "safe", "location", "similar", "control") that a vague
 * justification uses without naming a criterion; review W8-F05.
 */
export const AFFINITY_CRITERIA: { label: string; re: RegExp }[] = [
  { label: 'same input-output flows (information, energy, material)', re: /\b(inputs?|outputs?|flows?|energy|power|telemetry|handshake|charge-state|material)\b/i },
  { label: 'similar transformation or same technology', re: /\b(technolog\w*|similar transformations?|same kind of transformation)\b/i },
  { label: 'centralised or distributed control', re: /\b(centrali[sz]ed|distributed|network-wide|single point of failure|control loop)\b/i },
  { label: 'close execution frequency (course reading: response time)', re: /\b(frequen\w*|response time|latency|real-time|within \d+\s?(s|min|seconds?|minutes?)\b|\d+-?\s?(s|min|second|minute) (loop|cycle|response|assignment)|seconds)\b/i },
  { label: 'dependability, safety or environment', re: /\b(dependab\w*|reliab\w*|safety|availability|redundan\w*|environment\w*|fire|hazard|certif\w*)\b/i },
  { label: 'proximity in space (candidate-architecture aim, R20c p.599)', re: /\b(proximity|co-locat\w*|on the pad|at the pad|at every pad|on board|onboard|at the vertiport|at each vertiport|at the site|at the facility)\b/i },
  { label: 'fewer physical interfaces (candidate-architecture aim, R20c p.599)', re: /\b(interfaces?|coupling|modular\w*)\b/i },
]

/** IDs a justification can rest on: the requirement, interface, flow, information item, scenario or decision. */
const ANCHOR_ID = /\b(?:REQ-(?:STK|SYS)|IF|FN|INFO|SCN|DEC|R|TPM|MOP|MOE|CAP|PHY|LOG)-\d{3}\b/

/**
 * An allocation justification must be a sentence (≥ 8 words) that names at least one affinity criterion AND cites
 * the ID of what the criterion rests on (the requirement served, the interface or information item crossed, …).
 * Screening only: it rejects vague text of passing length; a reviewer still judges whether the argument holds.
 */
export function justificationProblem(text: string): string | null {
  const t = text.trim()
  if (t.split(/\s+/).filter(Boolean).length < 8) return 'Justify the allocation in at least one full sentence (8 words or more).'
  if (!AFFINITY_CRITERIA.some((c) => c.re.test(t)))
    return 'The justification names no allocation criterion (shared flows, similar technology, centralised or distributed control, execution frequency, dependability, proximity or interfaces; R20c p.598–599). A requirement ID alone is what the criterion rests on, not the criterion.'
  if (!ANCHOR_ID.test(t)) return 'The justification cites no ID: name the requirement, interface, information item or scenario the criterion rests on (e.g. REQ-SYS-001, IF-005).'
  return null
}

export function criteriaNamed(text: string): string[] {
  return AFFINITY_CRITERIA.filter((c) => c.re.test(text)).map((c) => c.label)
}

// ------------------------------------------------------------------------------------------------
// Completeness checks

export type ArchCheck = {
  id: string
  label: string
  severity: 'required' | 'minimum' | 'advisory'
  ok: boolean
  failing: string[]
  source: string
}

export const L8_MINIMUMS = { fn: 6, phy: 6, if: 5, info: 3, ai: 2 }

export function checkArchitecture(m: EngineeringModel): ArchCheck[] {
  const a = readArchitecture(m)
  const { links } = live(m)
  const nodeIds = new Set([...a.phys, ...a.exts].map((e) => e.id))
  const physNames = a.phys.map((p) => p.name)
  const decisionOf = (i: Element) => String(i.attributes?.decisionSupported ?? '')
  const decLinks = (id: string) => links.filter((l) => l.source === id && l.type === 'flows-to' && pre(l.target) === 'DEC')
  const producers = (id: string) => links.filter((l) => l.target === id && l.type === 'flows-to')
  const consumers = (id: string) => links.filter((l) => l.source === id && l.type === 'flows-to')
  const types = new Set(a.ifs.map((i) => i.type))
  const touched = new Set(a.ifs.flatMap((i) => i.ends ?? []))

  const c = (id: string, label: string, severity: ArchCheck['severity'], failing: string[], source: string): ArchCheck => ({ id, label, severity, ok: failing.length === 0, failing, source })
  return [
    c('fn-allocated', 'Every function is allocated to a physical element', 'required', a.fns.filter((f) => f.phys.length === 0).map((f) => f.id), 'L8 acceptance; RB-7.3'),
    c('fn-derived', 'Every function derives from a capability', 'required', a.fns.filter((f) => f.caps.length === 0).map((f) => f.id), 'RB-7.2'),
    c('fn-name', 'No physical names in the functional view (screening)', 'required', a.fns.filter((f) => functionNameProblem(f.name, physNames)).map((f) => f.id), 'RB-7.2'),
    c('if-typed', 'Every interface has a type (physical, information or organisational)', 'required', a.ifs.filter((i) => !(IF_TYPES as readonly string[]).includes(i.type)).map((i) => i.id), 'L8 acceptance; RB-7.3'),
    c('if-ends', 'Every interface has two different ends that exist as PHY or EXT elements', 'required', a.ifs.filter((i) => !i.ends || i.ends[0] === i.ends[1] || !i.ends.every((e) => nodeIds.has(e))).map((i) => i.id), 'L8 acceptance; RB-7.3'),
    c('info-decision', 'Every information item names the decision it supports', 'required', a.infos.filter((i) => !decisionOf(i).trim() && decLinks(i.id).length === 0).map((i) => i.id), 'L8 acceptance; RB-7.5'),
    c('info-ends', 'Every information item has a producer and a consumer', 'required', a.infos.filter((i) => producers(i.id).length === 0 || consumers(i.id).length === 0).map((i) => i.id), 'RB-7.5'),
    c('min-fn', `At least ${L8_MINIMUMS.fn} functions (${a.fns.length})`, 'minimum', a.fns.length >= L8_MINIMUMS.fn ? [] : ['FN'], 'L8 task 2'),
    c('min-phy', `At least ${L8_MINIMUMS.phy} physical elements (${a.phys.length})`, 'minimum', a.phys.length >= L8_MINIMUMS.phy ? [] : ['PHY'], 'L8 task 3'),
    c('min-if', `At least ${L8_MINIMUMS.if} interfaces covering all three types (${a.ifs.length}; types: ${[...types].filter(Boolean).sort().join(', ') || 'none'})`, 'minimum', a.ifs.length >= L8_MINIMUMS.if && IF_TYPES.every((t) => types.has(t)) ? [] : ['IF'], 'L8 task 5'),
    c('min-info', `At least ${L8_MINIMUMS.info} information items (${a.infos.length})`, 'minimum', a.infos.length >= L8_MINIMUMS.info ? [] : ['INFO'], 'L8 task 6'),
    c('min-ai', `At least ${L8_MINIMUMS.ai} AI-enabled capabilities (${a.ais.length})`, 'minimum', a.ais.length >= L8_MINIMUMS.ai ? [] : ['AI'], 'L8 task 7'),
    c('fn-performed', 'Every function is performed by a logical element or AI capability', 'advisory', a.fns.filter((f) => f.performers.length === 0).map((f) => f.id), 'R20b p.592; course thread link 5'),
    c(
      'alloc-consistent',
      'Every performer of a function (logical element or AI capability) is allocated to the physical element the function sits on',
      'advisory',
      a.fns.filter((f) => f.performers.some((p) => (a.performerPhys[p] ?? []).length > 0 && !(a.performerPhys[p] ?? []).some((x) => f.phys.includes(x)))).map((f) => f.id),
      'R20c p.598, p.601',
    ),
    c('fn-scenario', 'Every function is exercised in a scenario (FN derives-from SCN)', 'advisory', a.fns.filter((f) => f.scenarios.length === 0).map((f) => f.id), 'R20b p.594 (constitute scenarios of functions); RB-7.2'),
    c('if-carries', 'Every interface states what it carries', 'advisory', a.ifs.filter((i) => !i.carries.trim()).map((i) => i.id), 'R57 p.413'),
    c('phy-isolated', 'Every physical element has at least one interface', 'advisory', a.phys.filter((p) => !touched.has(p.id)).map((p) => p.id), 'R20c p.597'),
  ]
}

/** The FN -> PHY allocation matrix (rows FN, columns PHY), as R20c p.600 lists among the outputs. */
export function allocationMatrix(m: EngineeringModel): { phys: string[]; rows: { fn: string; name: string; cells: boolean[] }[] } {
  const a = readArchitecture(m)
  const phys = a.phys.map((p) => p.id)
  return { phys, rows: a.fns.map((f) => ({ fn: f.id, name: f.name, cells: phys.map((p) => f.phys.includes(p)) })) }
}
