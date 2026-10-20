// Week 1 workbench logic: the student's causal loops, the L1 record and the explorer run summary. Pure functions only,
// shared by the Week 1 missions (src/content/missions/week01.ts), the Week 1 problem rules and the Week 1 views.
// The rules encoded here come from reviewed Week 1 content: Lab L1 steps and artefact minimums (weeks/week01.ts lab),
// the loop-type rule (week01.ts lab step 3 and misconception 5: even number of negative links = reinforcing, odd =
// balancing) and the explorer's link polarities (content/causalLoops.ts, each checked against the model in
// src/sim/aerolink.test.ts).
import { LOOP_LINKS, LOOP_NODES } from '../../content/causalLoops'
import type { EngineeringModel, ElementProvenance } from '../../model/engineering'
import { chargerMonths, excessAircraftMonths, type SimParams, type SimPoint } from '../../sim/aerolink'
import { ownerProblem } from '../../components/ProvenanceOwnerFields'

// ---------------------------------------------------------------------------------------------- signals
export const SIG_RUN = 'w1-dynamics.run'
export const SIG_ARCHETYPE = 'w1-dynamics.archetypes'
export const SIG_BOUNDARY = 'w1-boundary.check'

/** What the dynamics explorer publishes after a student-initiated run. */
export type RunSummary = {
  scenario: string
  months: number
  end: {
    month: number
    riders: number
    served: number
    capacity: number
    chargingCapacity: number
    waitMin: number
    fleet: number
    chargers: number
    bottleneck: 'demand' | 'fleet' | 'charging'
    utilisation: number
  }
  /** Fleet at month 0, so a comparison can say "from 12 to 40". */
  startFleet: number
  surplusAircraftMonths: number
  chargerMonths: number
  seq?: number
}

/** Builds the run summary the explorer publishes (`seq` makes a repeated run of the same scenario a new signal). */
export function summariseRun(scenario: string, p: SimParams, run: SimPoint[], seq: number): RunSummary {
  const e = run[run.length - 1]
  return {
    scenario,
    months: p.months,
    end: {
      month: e.month, riders: e.riders, served: e.served, capacity: e.capacity, chargingCapacity: e.chargingCapacity, waitMin: e.waitMin,
      fleet: e.fleet, chargers: e.chargers, bottleneck: e.bottleneck, utilisation: e.utilisation,
    },
    startFleet: run[0].fleet,
    surplusAircraftMonths: excessAircraftMonths(run),
    chargerMonths: chargerMonths(run),
    seq,
  }
}

export type BoundaryCheckSignal = { score: number; answered: number; total: number }

export function isRunSummary(v: unknown): v is RunSummary {
  return !!v && typeof v === 'object' && 'scenario' in v && 'end' in v
}

// ---------------------------------------------------------------------------------------------- loops
export type Polarity = '+' | '−' | ''
export type LoopType = 'Reinforcing' | 'Balancing' | ''
/** A loop variable: an explorer variable (ref = LOOP_NODES id) or the student's own variable (label only). */
export type LoopVar = { ref?: string; label: string }

export type StudentLoop = {
  id: string // LOOP-nnn, never reused
  name: string
  vars: LoopVar[]
  /** polarities[i] is the link from vars[i] to vars[(i + 1) % n]; the last one closes the loop. */
  polarities: Polarity[]
  declared: LoopType
  owner: string
  provenance: ElementProvenance
}

export type LoopsArtefact = { loops: StudentLoop[]; issued: number }
export const LOOPS_KEY = 'w1.loops'
export const EMPTY_LOOPS: LoopsArtefact = { loops: [], issued: 0 }

export const varLabel = (v: LoopVar) => (v.ref ? (LOOP_NODES.find((n) => n.id === v.ref)?.label ?? v.label) : v.label).trim()

export type LoopIssueCode = 'too-short' | 'blank-variable' | 'repeated-variable' | 'missing-polarity' | 'undeclared' | 'type-mismatch' | 'contradicts-explorer' | 'not-in-explorer' | 'owner'
export type LoopIssue = { code: LoopIssueCode; message: string }

export type LoopAnalysis = {
  links: { from: string; to: string; polarity: Polarity; explorer?: '+' | '−' | null }[]
  negatives: number
  /** Computed from the polarities; null while any polarity is missing or the loop has fewer than two links. */
  computed: 'Reinforcing' | 'Balancing' | null
  issues: LoopIssue[]
  /** Uses at least one variable or link the explorer's model does not contain (facilitation note: require one). */
  beyondExplorer: boolean
}

/** Analyses one student loop. The loop type follows from the count of negative links (even → reinforcing). */
export function analyseLoop(l: StudentLoop): LoopAnalysis {
  const n = l.vars.length
  const issues: LoopIssue[] = []
  const links = l.vars.map((v, i) => {
    const w = l.vars[(i + 1) % n]
    const pol = l.polarities[i] ?? ''
    const known = v.ref && w?.ref ? LOOP_LINKS.find((x) => x.from === v.ref && x.to === w.ref) : undefined
    return { from: varLabel(v), to: w ? varLabel(w) : '', polarity: pol, explorer: v.ref && w?.ref ? (known ? known.polarity : null) : undefined }
  })
  if (n < 2) issues.push({ code: 'too-short', message: `${l.id} needs at least two variables to close a loop` })
  const blanks = l.vars.filter((v) => !varLabel(v)).length
  if (blanks) issues.push({ code: 'blank-variable', message: `${l.id} has ${blanks} unnamed variable${blanks > 1 ? 's' : ''}` })
  const labels = l.vars.map((v) => varLabel(v).toLowerCase()).filter(Boolean)
  if (new Set(labels).size !== labels.length) issues.push({ code: 'repeated-variable', message: `${l.id} passes through the same variable twice` })
  const missing = n >= 2 ? links.filter((k) => !k.polarity).length : 0
  if (missing) issues.push({ code: 'missing-polarity', message: `${l.id}: ${missing} link${missing > 1 ? 's have' : ' has'} no polarity` })
  const negatives = links.filter((k) => k.polarity === '−').length
  const computed = n >= 2 && !missing ? (negatives % 2 === 0 ? 'Reinforcing' : 'Balancing') : null
  if (!l.declared) issues.push({ code: 'undeclared', message: `${l.id} has no declared loop type` })
  else if (computed && computed !== l.declared)
    issues.push({ code: 'type-mismatch', message: `${l.id} is declared ${l.declared.toLowerCase()}, but its polarities make it ${computed.toLowerCase()}` })
  for (const k of links) {
    if (k.explorer && k.polarity && k.polarity !== k.explorer)
      issues.push({ code: 'contradicts-explorer', message: `${l.id}: ${k.from} → ${k.to} is marked ${k.polarity}, but the explorer's model has ${k.explorer === '+' ? '+ (same direction)' : '− (opposite direction)'}` })
    if (k.explorer === null) issues.push({ code: 'not-in-explorer', message: `${l.id}: ${k.from} → ${k.to} is not a link in the explorer's model` })
  }
  if (ownerProblem(l.owner)) issues.push({ code: 'owner', message: `${l.id} has no owner initials` })
  const beyondExplorer = n >= 2 && (l.vars.some((v) => !v.ref) || links.some((k) => k.explorer === null))
  return { links, negatives, computed, issues, beyondExplorer }
}

/** A loop counts toward L1 when it is closed, every link has a polarity, its declared type matches, no link
 *  contradicts the explorer's polarity, and it names an owner. */
export function loopIsSound(l: StudentLoop): boolean {
  const a = analyseLoop(l)
  return a.computed !== null && a.computed === l.declared && !a.issues.some((i) => ['blank-variable', 'repeated-variable', 'contradicts-explorer', 'owner'].includes(i.code))
}

export function soundLoopsOfType(loops: StudentLoop[], t: 'Reinforcing' | 'Balancing'): StudentLoop[] {
  return loops.filter((l) => l.declared === t && loopIsSound(l))
}

export function loopsArtefact(artefacts: Record<string, unknown>): LoopsArtefact {
  const v = artefacts[LOOPS_KEY] as LoopsArtefact | undefined
  return v && Array.isArray(v.loops) ? v : EMPTY_LOOPS
}

// ---------------------------------------------------------------------------------------------- L1 record
export const L1_KEY = 'w1.l1'
export type CharterRole = { role: string; initials: string }
export type L1Record = {
  behaviour: '' | 'plateau' | 'overbuild'
  explanation: string
  threePersonTeam: boolean
  roles: Record<string, string>
  decisionRules: string
  norms: string
  prefixes: string
}

/** The four course roles (week01.ts lab step 5; FD-24 merges AI & Data Management with Architecture in a 3-person team). */
export const COURSE_ROLES = ['Requirements & Compliance', 'Architecture', 'AI & Data Management', 'Verification & Validation'] as const
export const MERGED_ROLE = 'AI & Data Management'

export const EMPTY_L1: L1Record = { behaviour: '', explanation: '', threePersonTeam: false, roles: {}, decisionRules: '', norms: '', prefixes: '' }

export function l1Artefact(artefacts: Record<string, unknown>): L1Record {
  const v = artefacts[L1_KEY] as Partial<L1Record> | undefined
  return { ...EMPTY_L1, ...(v ?? {}), roles: { ...(v?.roles ?? {}) } }
}

export const words = (s: string) => s.split(/\s+/).filter(Boolean).length

/** Scenario that reproduces each L1 emergent behaviour (instructor answer key: plateau below the charging ceiling, or
 *  the fleet over-build from the delay plus the ordering rule). */
export const BEHAVIOUR_SCENARIO: Record<'plateau' | 'overbuild', { scenario: string; label: string }> = {
  plateau: { scenario: 'underinvestment', label: 'the plateau below the charging ceiling (“Fleet grows, charging does not”)' },
  overbuild: { scenario: 'delay', label: 'the fleet over-build (“Long procurement delay”)' },
}

/** Loop IDs from the explorer (R1, B1–B7) and the student's own loop IDs and names that the explanation mentions. */
export function loopsMentioned(text: string, loops: StudentLoop[]): string[] {
  const found = new Set<string>()
  for (const m of text.matchAll(/\b([RB]\d)\b/g)) found.add(m[1])
  for (const l of loops) {
    if (text.includes(l.id)) found.add(l.id)
    else if (l.name.trim().length >= 4 && text.toLowerCase().includes(l.name.trim().toLowerCase())) found.add(l.id)
  }
  return [...found]
}

export const MIN_EXPLANATION_WORDS = 60

export type CheckOut = { ok: boolean; detail: string }

/** L1 step 1: ENT-001 with a one-sentence boundary, a rejected boundary with its reason, and an owner. */
export function checkSoi(model: EngineeringModel): CheckOut {
  const ent = model.elements.find((e) => e.kind === 'ENT' && e.status === 'active')
  if (!ent) return { ok: false, detail: 'No system of interest (ENT) recorded yet.' }
  const text = (ent.text ?? '').trim()
  const sentences = text.split(/[.!?](\s|$)/).filter((s) => s && s.trim().length > 0).length
  const rejected = String(ent.attributes?.rejectedBoundary ?? '').trim()
  const missing: string[] = []
  // gate sweep 2026-10-19: one sentence, not a length (was 8 words); a subject, a verb and an object
  if (words(text) < 3) missing.push('a boundary sentence (at least a subject, a verb and an object)')
  else if (sentences > 1) missing.push('a single sentence (the boundary statement has more than one)')
  if (words(rejected) < 1) missing.push('a rejected boundary and why')
  if (ownerProblem(ent.owner ?? '') && ent.provenance !== 'official-S04' && ent.provenance !== 'instructor-reference') missing.push('owner initials')
  return missing.length ? { ok: false, detail: `${ent.id}: still needs ${missing.join('; ')}.` } : { ok: true, detail: `${ent.id} recorded with a rejected boundary.` }
}

export const MIN_EXT = 6
/** Exchange labels named in L1 step 2; the recorder also accepts the team's own label. */
export const EXCHANGES = ['power', 'data', 'passengers', 'approvals']

/** L1 step 2: at least 6 EXT items, each with a labelled exchange and an owner. */
export function checkContext(model: EngineeringModel): CheckOut {
  const ext = model.elements.filter((e) => e.kind === 'EXT' && e.status === 'active')
  const labelled = ext.filter((e) => String(e.attributes?.exchange ?? '').trim() || (e.text ?? '').trim())
  const owned = labelled.filter((e) => !ownerProblem(e.owner ?? '') || e.provenance === 'instructor-reference' || e.provenance === 'official-S04')
  if (owned.length >= MIN_EXT) return { ok: true, detail: `${owned.length} external systems with labeled exchanges.` }
  const notes = []
  if (ext.length > labelled.length) notes.push(`${ext.length - labelled.length} without a labeled exchange`)
  if (labelled.length > owned.length) notes.push(`${labelled.length - owned.length} without owner initials`)
  return { ok: false, detail: `${owned.length} of ${MIN_EXT} complete${notes.length ? ` (${notes.join(', ')})` : ''}.` }
}

/** L1 step 3: one sound reinforcing and one sound balancing loop. */
export function checkTwoLoops(loops: StudentLoop[]): CheckOut {
  const r = soundLoopsOfType(loops, 'Reinforcing').length
  const b = soundLoopsOfType(loops, 'Balancing').length
  if (r >= 1 && b >= 1) return { ok: true, detail: `${r} reinforcing and ${b} balancing loop${b > 1 ? 's' : ''} pass the polarity checks.` }
  const need = [r ? '' : 'a reinforcing loop', b ? '' : 'a balancing loop'].filter(Boolean).join(' and ')
  return { ok: false, detail: `Still needs ${need} whose declared type matches its polarities (see Problems).` }
}

/** L1 step 4 (completeness only; the causal argument itself is read against RB-1.4). */
export function checkEmergent(rec: L1Record, loops: StudentLoop[], runs: { scenario: string }[]): CheckOut {
  if (!rec.behaviour) return { ok: false, detail: 'Choose the behavior you will explain.' }
  const want = BEHAVIOUR_SCENARIO[rec.behaviour]
  const missing: string[] = []
  if (!runs.some((r) => r.scenario === want.scenario)) missing.push(`reproduce it in the Dynamics view (run “${want.scenario === 'delay' ? 'Long procurement delay' : 'Fleet grows, charging does not'}”)`)
  if (words(rec.explanation) < MIN_EXPLANATION_WORDS) missing.push(`an explanation of at least ${MIN_EXPLANATION_WORDS} words (${words(rec.explanation)} so far)`)
  if (loopsMentioned(rec.explanation, loops).length < 2) missing.push('name at least two loops (e.g. R1, B2 or your own LOOP IDs) — the behavior must not be attributable to a single element')
  return missing.length ? { ok: false, detail: `Still needs: ${missing.join('; ')}.` } : { ok: true, detail: 'Complete; the causal argument is read against RB-1.4.' }
}

/** L1 step 5: four roles (three in a 3-person team), decision rules, communication norms and owned prefixes. */
export function checkCharter(rec: L1Record): CheckOut {
  const roles = COURSE_ROLES.filter((r) => !(rec.threePersonTeam && r === MERGED_ROLE))
  const unassigned = roles.filter((r) => ownerProblem(rec.roles[r] ?? ''))
  const missing: string[] = []
  if (unassigned.length) missing.push(`initials for ${unassigned.join(', ')}`)
  if (words(rec.decisionRules) < 1) missing.push('decision rules')
  if (words(rec.norms) < 1) missing.push('communication norms')

  if (!/[A-Z]{2,5}/.test(rec.prefixes)) missing.push('each member’s owned ID prefixes')
  return missing.length ? { ok: false, detail: `Still needs ${missing.join('; ')}.` } : { ok: true, detail: 'Roles, decision rules, norms and owned prefixes recorded.' }
}
