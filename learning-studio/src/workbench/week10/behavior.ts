// Week 10 lab tool logic (pure): read the team's Week 9 model v0.2 (.sysml, the Week 9 lab tool's output), its Week 4
// architecture model inputs (functions, logical elements, information items) and its Week 2 ConOps model inputs
// (scenarios, capabilities, requirement parents), and write model v0.3: the Logical package (capabilities as action
// definitions, information items as item definitions, functions as action usages with in and out items, the logical
// architecture as part usages that perform the functions, requirement allocations, and the capability links Week 9 left
// waiting) and the Behavior package (a use case for every scenario, the chosen scenario as an action flow inside its use
// case, and one state definition exhibited by a part). Nothing in model v0.2 is retyped: the generator adds, between
// Week 10 marker comments, what this week models, so a file the tool wrote can be imported again without duplicating
// anything. The Week 8 and Week 9 regions are kept exactly as they are.
//
// The same generator writes the AeroLink worked example (src/content/lectures/week10/aerolinkCase.ts). Its outputs for
// AeroLink, the fixture team and an adversarial record are kept under sysml/lectures/week10/ and validated by the course
// checker (scripts/build-week10-sysml.mjs writes them; sysmlWeek10.test.ts fails when a file is stale). A checker PASS
// shows the text parses, every name resolves and no validation rule fires; it does not show that a flow follows the
// ConOps, that a guard means its condition or that a state machine is complete. That is the behavior review's job, and
// the team's.
//
// Course conventions (labBrief.ts W10_MAPPING; each is labeled on the slides): every Phase I ID is a quoted short name;
// a capability is an action definition and a function an action usage; a function is allocated to a logical element by
// `perform` in that element's part usage (the part is the performer, SysML v2.1 Beta 2 Part 1, 7.17.6); a requirement is
// allocated to a function with `allocate` (7.15); a scenario step subsets the function it is an occurrence of; a link to
// a capability is a dependency tagged #derivedFrom from the dependent element (client, `from`) to the capability
// (supplier, `to`), the course's one dependency direction.
// Review status: new-pending-review.
import { isAeroLink } from '../week1/team'
import { idsIn as w2Ids, importWeek2, type Week2Record } from '../week2/record'
import { importWeek4, lines as w4Lines, type Week4Record } from '../week4/record'
import { ascii, basicName, docText, quoted } from '../week8/skeleton'
import { COMPLETION_CLAIM, LAB10_MINIMUMS, type W10FindingClass } from '../../content/lectures/week10/labBrief'
import { isEmptyEveryWord, said } from '../emptyAnswer'

// ---------------------------------------------------------------------------------------------- the import sources
export type W10Fn = { id: string; name: string; text: string; inputs: string[]; outputs: string[]; capabilities: string[]; scenarios: string[]; requirements: string[]; log: string; planning: string }
export type W10Log = { id: string; name: string; text: string }
export type W10Info = { id: string; name: string; content: string; producers: string[]; consumers: string[]; decisionRefs: string[] }
/** What the Week 4 file contributes (normalized; saved in the tool state). */
export type W10Arch = { team: string; enterprise: string; functions: W10Fn[]; logical: W10Log[]; information: W10Info[]; issuedFn: number; issuedInfo: number; threePersonTeam: boolean }
export type W10Cap = { id: string; name: string; statement: string }
export type W10Step = { n: number; actor: string; text: string }
export type W10Alt = { id: string; fromStep: number; condition: string; response: string; outcome: 'ends' | { rejoin: number } }
export type W10Actor = { id: string; name: string }
export type W10Scenario = { id: string; name: string; kind: string; summary: string; actors: W10Actor[]; trigger: string; preconditions: string; steps: W10Step[]; alternates: W10Alt[]; success: string; failure: string }
/** What the Week 2 file contributes (normalized; saved in the tool state). */
export type W10Ops = { team: string; enterprise: string; scenarios: W10Scenario[]; capabilities: W10Cap[]; requirements: { id: string; parents: string[] }[] }

const upIds = (s: string, re: RegExp) => [...new Set(s.toUpperCase().match(re) ?? [])]
const num = (id: string) => Number(id.replace(/^\D+/, '').split('-').pop()) || 0

/** The Week 4 model inputs as a source: functions, logical elements, information items and the issued ID counters. */
export function archFromWeek4(r: Week4Record): W10Arch {
  return {
    team: r.week3?.team.trim() ?? '',
    enterprise: r.week3?.enterprise.trim() ?? '',
    functions: r.functions.map((f) => ({
      id: f.id,
      name: f.name.trim(),
      text: '',
      inputs: w4Lines(f.inputs),
      outputs: w4Lines(f.outputs),
      capabilities: upIds(f.capabilities, /CAP-\d{3}/g),
      scenarios: upIds(f.scenarios, /SCN-\d{3}/g),
      requirements: upIds(f.requirements, /REQ-(?:STK|SYS)-\d{3}/g),
      log: upIds(f.log, /LOG-\d{3}/g)[0] ?? '',
      planning: f.planning.trim(),
    })),
    logical: r.logical.map((l) => ({ id: l.id, name: l.name.trim(), text: l.text.trim() })),
    information: r.information.map((x) => ({ id: x.id, name: x.name.trim(), content: x.content.trim(), producers: upIds(x.producers, /[A-Z]+-\d{3}/g), consumers: upIds(x.consumers, /[A-Z]+-\d{3}/g), decisionRefs: upIds(x.decisionRefs, /[A-Z]+-(?:STK-|SYS-)?\d{3}/g) })),
    issuedFn: r.issued.FN,
    issuedInfo: r.issued.INFO,
    threePersonTeam: r.threePersonTeam,
  }
}

/** The Week 2 model inputs as a source: scenarios (steps, alternates, actors), capabilities and requirement parents. */
export function opsFromWeek2(r: Week2Record): W10Ops {
  return {
    team: r.week1?.team.trim() ?? '',
    enterprise: r.week1?.enterprise.trim() ?? '',
    scenarios: r.scenarios.map((s) => ({
      id: s.id,
      name: s.name.trim(),
      kind: s.kind,
      summary: '',
      actors: s.actors.map((a) => ({ id: a.id, name: a.name.trim() })),
      trigger: s.trigger.trim(),
      preconditions: s.preconditions.trim(),
      steps: s.steps.map((x, i) => ({ n: i + 1, actor: x.actor.trim(), text: x.action.trim() })),
      alternates: s.alternates.map((a) => ({ id: a.id, fromStep: a.fromStep, condition: a.condition.trim(), response: a.response.trim(), outcome: a.outcome === 'rejoin' && a.rejoin > 0 ? { rejoin: a.rejoin } : 'ends' })),
      success: s.success.trim(),
      failure: s.failure.trim(),
    })),
    capabilities: r.capabilities.map((c) => ({ id: c.id, name: c.name.trim(), statement: c.statement.trim() })),
    requirements: r.requirements.map((q) => ({ id: q.id, parents: w2Ids(q.parents).filter((p) => p !== q.id) })),
  }
}

/** Reads a Week 4 model-inputs file for Week 10 (refuses other weeks and AeroLink with a message; never throws). */
export function readWeek4For10(text: string): { record: Week4Record } | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON. Export the model inputs (.json) from the Week 4 lab tool and import that file here.' }
  }
  const format = d && typeof d === 'object' ? (d as { format?: unknown }).format : undefined
  if (format === 'week2-model-inputs') return { error: 'This is the Week 2 model-inputs file: import it in the Week 2 field. This field takes the Week 4 file (format “week4-model-inputs”).' }
  if (typeof format === 'string' && /^week\d+-/.test(format) && format !== 'week4-model-inputs') return { error: `This is a ${format.replace(/^week(\d+)-.*/, 'Week $1')} file. This field takes the Week 4 model-inputs file (format “week4-model-inputs”).` }
  const r = importWeek4(text)
  if ('error' in r) return r
  if (isAeroLink(r.week3?.enterprise ?? '') || isAeroLink(r.mission)) return { error: 'This record is about AeroLink, the instructor’s worked example: import your team’s own Week 4 file.' }
  if (!r.functions.length) return { error: 'This Week 4 file has no functions. Export the model inputs again after completing the functional decomposition in the Week 4 lab tool.' }
  return { record: r }
}
/** Reads a Week 2 model-inputs file for Week 10 (refuses other weeks and AeroLink with a message; never throws). */
export function readWeek2For10(text: string): { record: Week2Record } | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON. Export the model inputs (.json) from the Week 2 lab tool and import that file here.' }
  }
  const format = d && typeof d === 'object' ? (d as { format?: unknown }).format : undefined
  if (format === 'week4-model-inputs') return { error: 'This is the Week 4 model-inputs file: import it in the Week 4 field. This field takes the Week 2 file (format “week2-model-inputs”).' }
  if (typeof format === 'string' && /^week\d+-/.test(format) && format !== 'week2-model-inputs') return { error: `This is a ${format.replace(/^week(\d+)-.*/, 'Week $1')} file. This field takes the Week 2 model-inputs file (format “week2-model-inputs”).` }
  const r = importWeek2(text)
  if ('error' in r) return r
  if (isAeroLink(r.week1?.enterprise ?? '')) return { error: 'This record is about AeroLink, the instructor’s worked example: import your team’s own Week 2 file.' }
  if (!r.scenarios.length) return { error: 'This Week 2 file has no scenarios. Export the model inputs again from the Week 2 lab tool after writing your ConOps scenarios.' }
  return { record: r }
}

// ---------------------------------------------------------------------------------------------- reading model v0.2
export const MARK_BEGIN = '// --- generated by the Week 10 lab tool: begin ---'
export const MARK_END = '// --- generated by the Week 10 lab tool: end ---'

/** Removes every region the Week 10 tool wrote (between its marker comments), so a model v0.3 can be imported again.
 *  The Week 8 and Week 9 regions are kept. */
export function stripGenerated(text: string): string {
  const out: string[] = []
  let skip = false
  for (const line of text.replace(/\r\n?/g, '\n').split('\n')) {
    if (line.trim() === MARK_BEGIN) {
      skip = true
      continue
    }
    if (line.trim() === MARK_END) {
      skip = false
      continue
    }
    if (!skip) out.push(line)
  }
  return out.join('\n')
}

/** Positions of the braces that are code (not inside comments, strings or quoted names), with the depth each opens or
 *  closes. Same reading as the Week 9 tool. */
function braces(text: string): { at: number; ch: '{' | '}'; depth: number }[] {
  const out: { at: number; ch: '{' | '}'; depth: number }[] = []
  let depth = 0
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    const n = text[i + 1]
    if (c === '/' && n === '/') {
      while (i < text.length && text[i] !== '\n') i++
    } else if (c === '/' && n === '*') {
      i += 2
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++
      i++
    } else if (c === '"' || c === "'") {
      i++
      while (i < text.length && text[i] !== c) {
        if (text[i] === '\\') i++
        i++
      }
    } else if (c === '{') {
      out.push({ at: i, ch: '{', depth: depth++ })
    } else if (c === '}') {
      out.push({ at: i, ch: '}', depth: --depth })
    }
  }
  return out
}
function closeOf(text: string, open: number): number {
  const bs = braces(text)
  const k = bs.findIndex((b) => b.at === open)
  if (k < 0) return -1
  const d = bs[k].depth
  for (let j = k + 1; j < bs.length; j++) if (bs[j].ch === '}' && bs[j].depth === d) return bs[j].at
  return -1
}
function depthAt(text: string, pos: number): number {
  let d = 0
  for (const b of braces(text)) {
    if (b.at >= pos) break
    d = b.ch === '{' ? b.depth + 1 : b.depth
  }
  return d
}
const NAME = String.raw`(?:'(?:[^'\\]|\\.)*'|[A-Za-z_][A-Za-z0-9_]*)`
const unq = (n: string) => (n.startsWith("'") ? n.slice(1, -1).replace(/\\(.)/g, '$1') : n)
const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export type PackageSpan = { name: string; open: number; close: number }
/** The top-level packages (members of the root package) and their brace spans. */
export function topPackages(text: string): PackageSpan[] {
  const out: PackageSpan[] = []
  const re = new RegExp(String.raw`(^|\n)[ \t]*package\s+(${NAME})\s*\{`, 'g')
  for (const m of text.matchAll(re)) {
    const open = (m.index ?? 0) + m[0].length - 1
    if (depthAt(text, open) !== 1) continue
    out.push({ name: unq(m[2]), open, close: closeOf(text, open) })
  }
  return out
}

export type W9Model = {
  text: string
  rootName: string
  /** How the model refers to the enterprise (normally Context::'ENT-001'). */
  entRef: string
  enterpriseName: string
  stakeholders: { id: string; name: string }[]
  /** External systems of the Week 8 context: the usage's ID and the name of its part definition. */
  externals: { id: string; def: string; name: string }[]
  /** Requirement and need IDs in the model. */
  requirements: string[]
  /** Part definitions declared directly in the Logical package (the Week 9 placeholders) and in Physical. */
  logicalDefs: string[]
  physicalDefs: string[]
  /** Whether Physical has the Week 8 system-of-interest usage `part soi`. */
  hasSoi: boolean
  /** Highest FN and INFO numbers anywhere in the text (IDs are never reused). */
  maxFn: number
  maxInfo: number
  packages: string[]
}

/** Reads a team's Week 9 model v0.2 (or a model v0.3 this tool wrote). Refuses other files and AeroLink with a reason
 *  the student can act on; never throws. */
export function readWeek9(raw: string): { model: W9Model } | { error: string } {
  const r = parseModel(raw)
  if ('error' in r) return r
  if (isAeroLink(r.model.rootName) || isAeroLink(r.model.enterpriseName)) return { error: 'This model is AeroLink, the instructor’s worked example: import your team’s own Week 9 model.' }
  return r
}
/** Parses a model v0.2 or v0.3 text (no AeroLink check: the AeroLink worked example uses it on the instructor model). */
export function parseModel(raw: string): { model: W9Model } | { error: string } {
  if (/^\s*[[{]/.test(raw)) return { error: 'This is a JSON file. Import your Week 9 model here (the .sysml file the Week 9 lab tool exported), and the JSON files in the Week 2 and Week 4 fields.' }
  if (/^\s*#\s/.test(raw) || /^\s*\|.*\|\s*$/m.test(raw.split('\n').slice(0, 5).join('\n'))) return { error: 'This looks like a Markdown file (the Week 9 trace matrix). Import the model file (.sysml) the Week 9 lab tool exported.' }
  const text = stripGenerated(raw)
  const root = new RegExp(String.raw`(^|\n)[ \t]*package\s+(${NAME})\s*\{`).exec(text)
  if (!root) return { error: 'No package found: this is not a SysML v2 model file. Import the model v0.2 file (.sysml) your team exported from the Week 9 lab tool.' }
  const rootName = unq(root[2])
  const ent = /part def <'ENT-001'>\s*('(?:[^'\\]|\\.)*'|[A-Za-z_][A-Za-z0-9_]*)?/.exec(text)
  if (!ent) return { error: 'The model declares no enterprise (part def <\'ENT-001\'> in the Context package). Import the model v0.2 your team exported from the Week 9 lab tool.' }
  const enterpriseName = ent[1] ? unq(ent[1]) : ''
  const pkgs = topPackages(text)
  const names = pkgs.map((p) => p.name)
  for (const need of ['Context', 'Stakeholders', 'Needs', 'Requirements', 'Logical', 'Physical', 'Behavior'])
    if (!names.includes(need)) return { error: `The model has no top-level ${need} package. The Week 10 tool fills the Logical and Behavior packages of model v0.2 and reads the others: restore the ${need} package (an empty package with a doc comment is enough) and import again.` }
  if (pkgs.some((p) => p.close < 0)) return { error: 'A package in this file is not closed (a missing “}”). Run the file through the checker, correct it and import again.' }
  const requirements = [...new Set([...text.matchAll(/requirement <'((?:REQ-(?:STK|SYS)|NEED|MGO)-\d{3})'>/g)].map((m) => m[1]))]
  if (!requirements.some((x) => x.startsWith('REQ-'))) return { error: 'This model has no requirements yet: it looks like a Week 8 model v0.1. Import model v0.2, the file the Week 9 lab tool exported, so the requirements can be allocated to functions.' }
  const body = (name: string) => {
    const p = pkgs.find((x) => x.name === name)!
    return { p, b: text.slice(p.open + 1, p.close) }
  }
  const defsIn = (name: string) => {
    const { p, b } = body(name)
    const out: string[] = []
    for (const m of b.matchAll(new RegExp(String.raw`(^|\n)[ \t]*part def\s+(?:<'[^']*'>\s*)?(${NAME})`, 'g'))) {
      if (depthAt(text, p.open + 1 + (m.index ?? 0) + m[0].length) === 2) out.push(unq(m[2]))
    }
    return out
  }
  const needs = body('Needs').b
  const entRef = /subject\s+enterprise\s*:\s*([^;]+);/.exec(needs)?.[1].trim() ?? /subject\s+enterprise\s*:\s*([^;]+);/.exec(body('Stakeholders').b)?.[1].trim() ?? "Context::'ENT-001'"
  const ctx = body('Context').b
  const externals = [...ctx.matchAll(/part <'(EXT-\d{3})'>\s*([A-Za-z_][A-Za-z0-9_]*|'(?:[^'\\]|\\.)*')\s*:\s*('(?:[^'\\]|\\.)*'|[A-Za-z_][A-Za-z0-9_]*)/g)].map((m) => ({ id: m[1], name: unq(m[2]), def: unq(m[3]) }))
  const stakeholders = [...text.matchAll(/part def <'(STK-\d{3})'>\s*('(?:[^'\\]|\\.)*'|[A-Za-z_][A-Za-z0-9_]*)?/g)].map((m) => ({ id: m[1], name: m[2] ? unq(m[2]) : '' }))
  const maxOf = (re: RegExp) => Math.max(0, ...[...raw.matchAll(re)].map((m) => Number(m[1])))
  return {
    model: {
      text,
      rootName,
      entRef,
      enterpriseName,
      stakeholders: stakeholders.filter((s, i) => stakeholders.findIndex((x) => x.id === s.id) === i),
      externals,
      requirements,
      logicalDefs: defsIn('Logical'),
      physicalDefs: defsIn('Physical'),
      hasSoi: /(^|\n)[ \t]*part soi\s*:/.test(body('Physical').b),
      maxFn: maxOf(/FN-(\d{3})/g),
      maxInfo: maxOf(/INFO-(\d{3})/g),
      packages: names,
    },
  }
}

// ---------------------------------------------------------------------------------------------- the team's choices
/** A function's items as the team decides them (IDs typed: "INFO-001, INFO-004"), and its performer (a LOG ID). */
export type FnChoice = { inputs: string; outputs: string; performer: string }
/** A function the team adds this week (a scenario step no Week 4 function covers). Its ID continues after the highest. */
export type NewFn = { id: string; name: string; text: string; performer: string; capability: string }
/** An item the team adds this week. An information item gets the next INFO ID; energy and material items are named. */
export type NewItem = { id: string; name: string; kind: 'information' | 'energy' | 'material' }
export type StepChoice = { name: string; fn: string }
/** An alternate's action name and guard, and where its decision sits: after the step it branches from (default), or
 *  before it, when the condition is known before the step happens and the alternate replaces the step. */
export type AltChoice = { name: string; guard: string; at?: 'before' | 'after' }
export type StateRow = { name: string; entry: string; do: string; doc: string }
export type TransitionRow = { from: string; trigger: string; guard: string; to: string }
export type Machine = { name: string; usage: string; doc: string; exhibitor: string; initial: string; states: StateRow[]; transitions: TransitionRow[] }
export type W10Choices = {
  fn: Record<string, FnChoice>
  newFns: NewFn[]
  newItems: NewItem[]
  /** Week 9 placeholder part definition in Logical → the logical element it becomes (LOG ID, or '' for none). */
  placeholders: Record<string, string>
  /** The scenario modeled as an action flow. */
  scenario: string
  steps: Record<string, StepChoice>
  alts: Record<string, AltChoice>
  /** Actor types per scenario (IDs typed: "STK-001, EXT-001"); empty means read from the actor names. */
  actors: Record<string, string>
  machine: Machine
}
export const EMPTY_MACHINE: Machine = { name: '', usage: '', doc: '', exhibitor: '', initial: '', states: [], transitions: [] }
export const EMPTY_CHOICES: W10Choices = { fn: {}, newFns: [], newItems: [], placeholders: {}, scenario: '', steps: {}, alts: {}, actors: {}, machine: EMPTY_MACHINE }

export type GenOptions = {
  date?: string
  header?: string[]
  /** Root package name in the output (default: the Week 9 name, "v0.2" becoming "v0.3"). */
  packageName?: string
  origin?: string
}

// ---------------------------------------------------------------------------------------------- findings
export type W10Finding = { cls: W10FindingClass; id: string; code: string; text: string }
export const findingKey = (f: W10Finding) => `${f.cls}:${f.code}:${f.id}`
/** Gaps the tool cannot fix itself (the team writes a disposition); every other gap is fixed in the tool. */
const DISPOSABLE_GAPS = new Set(['fn-no-items', 'fn-no-input', 'fn-no-output', 'log-idle', 'placeholder-unlinked', 'actor-unmapped', 'name-clash', 'state-dead-end', 'no-item-flow'])
/** Findings that need a team disposition in the behavior audit. */
export const needsDisposition = (f: W10Finding) => f.cls === 'trace' || (f.cls === 'gap' && DISPOSABLE_GAPS.has(f.code))

/** Validity of a disposition: written, not an empty answer, and not a claim that the finding is fixed (it is computed
 *  from the imports and the choices, so while it is listed it is not fixed). Future or modal plans are accepted. */
export function dispositionProblem(text: string): string | null {
  const t = text.trim()
  if (!said(t) || isEmptyEveryWord(t)) return 'Write what the team will do and why (an open item with an owner, or why no change is needed); “none”, “n/a” or “later” is not a disposition.'
  const claimed = t.replace(/\b(?:(?:to|will|shall|would) be |once (?:it is |this is |the \w+ is )?|until (?:it is )?|when (?:it is )?)(?:\w+ )?(?:fixed|resolved|done|closed|corrected|completed?)\b/gi, '')
  if (COMPLETION_CLAIM.test(claimed)) return 'This reads as a fix, but the finding is still computed from your imports and choices: change the choice in the tool, or correct the Week 2, Week 4 or Week 9 file and import it again. If this is a plan, write it as one (for example “to be resolved in Week 11, owner JS”).'
  return null
}

// ---------------------------------------------------------------------------------------------- naming
const T = (n: number) => '\t'.repeat(n)
const sentence = (s: string) => (/[.!?)]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`)
const STOP = new Set(['the', 'a', 'an'])
/** A readable basic name from the first words of a text ("Plans the flight with …" → plansFlightWith). */
export function wordsName(text: string, count: number, fallback: string): string {
  const w = ascii(text).replace(/[^A-Za-z0-9 ]+/g, ' ').split(/\s+/).filter((x) => x && !STOP.has(x.toLowerCase())).slice(0, count)
  return basicName(w.join(' '), fallback)
}
/** Features every action (and use case) already has, which a generated parameter or step must not shadow. */
const ACTION_TAKEN = new Set(['start', 'done', 'this', 'that', 'self', 'time', 'result', 'subject', 'objective', 'actors', 'subactions', 'decisions', 'merges', 'forks', 'joins', 'enterprise'])
/** Distinct names: a repeat or a taken name gets the next free numeric suffix. */
function uniqueIn(taken: Set<string>, n: string): string {
  let k = n
  for (let i = 2; taken.has(k); i++) k = `${n}${i}`
  taken.add(k)
  return k
}

// ---------------------------------------------------------------------------------------------- generation
export type ItemRef = { id: string; name: string; kind: 'information' | 'energy' | 'material'; ref: string; origin: 'Week 4' | 'Week 10' }
export type ResolvedFn = { id: string; name: string; inputs: string[]; outputs: string[]; performer: string; capabilities: string[]; params: { item: string; dir: 'in' | 'out'; name: string }[]; origin: 'Week 4' | 'Week 10' }
export type FlowNode = { kind: 'step' | 'decide' | 'merge' | 'alt'; name: string; conops: string; construct: string }
export type ItemFlow = { from: string; to: string; item: string; text: string }
export type Generated = {
  text: string
  findings: W10Finding[]
  items: ItemRef[]
  functions: ResolvedFn[]
  /** LOG ID → its part usage name, definition and performed functions. */
  logical: { id: string; usage: string; def: string; specializes: string; performs: string[] }[]
  /** Requirement → function allocations written into the file. */
  allocations: { req: string; fn: string }[]
  /** #derivedFrom dependencies written (function or requirement → capability). */
  capLinks: { from: string; cap: string }[]
  useCases: { id: string; actors: string[]; unmapped: string[] }[]
  /** The chosen scenario's flow: nodes in text order (for the mapping table), decisions and item flows. */
  flow: { scenario: string; nodes: FlowNode[]; decisions: number; itemFlows: ItemFlow[] } | null
  machine: { name: string; states: string[]; transitions: { name: string; from: string; trigger: string; guard: string; to: string }[]; guards: number; unreachable: string[]; exhibitedBy: string } | null
  /** IDs issued this week (new functions and items), for the review. */
  issued: string[]
}

/** Inserts lines just before the closing brace that matches the brace at `open`, between markers. */
function insertBeforeClose(text: string, open: number, lines: string[], indent: number): string {
  const close = closeOf(text, open)
  if (close < 0 || !lines.length) return text
  const block = [`${T(indent)}${MARK_BEGIN}`, ...lines.map((l) => `${T(indent)}${l}`), `${T(indent)}${MARK_END}`].join('\n')
  const before = text.slice(0, close).replace(/[ \t]*$/, '')
  const nl = before.endsWith('\n') ? '' : '\n'
  return `${before}${nl}${block}\n${T(indent - 1)}${text.slice(close)}`
}
/** Adds lines to the body of the declaration at `at` (a `part def` or `part` line), making a `;` declaration a body. */
function addToDeclaration(text: string, at: number, lines: string[], indent: number): string {
  if (!lines.length) return text
  const brace = text.indexOf('{', at)
  const semi = text.indexOf(';', at)
  const lineEnd = text.indexOf('\n', at) < 0 ? text.length : text.indexOf('\n', at)
  if (semi >= 0 && (brace < 0 || semi < brace) && semi <= lineEnd) {
    const block = [` {`, `${T(indent)}${MARK_BEGIN}`, ...lines.map((l) => `${T(indent)}${l}`), `${T(indent)}${MARK_END}`, `${T(indent - 1)}}`].join('\n')
    return `${text.slice(0, semi)}${block}${text.slice(semi + 1)}`
  }
  if (brace < 0) return text
  return insertBeforeClose(text, brace, lines, indent)
}

const PACKAGES = ['Context', 'Stakeholders', 'Needs', 'Requirements', 'Physical', 'Logical', 'Behavior', 'Verification', 'Analysis', 'AROU', 'Evolution']
const parseGuard = (g: string): { neg: boolean; name: string } | null => {
  const m = /^\s*(not\s+)?([A-Za-z_][A-Za-z0-9_ ]*)\s*$/i.exec(ascii(g))
  if (!m) return null
  const name = basicName(m[2], '')
  return name ? { neg: !!m[1], name } : null
}

/** The model v0.3 text, the tables the review reads and the findings. Deterministic for given sources and choices. */
export function generateModel(w9: W9Model, arch: W10Arch, ops: W10Ops, choices: W10Choices, opts: GenOptions = {}): Generated {
  const findings: W10Finding[] = []
  // Two rows with the same blank or unknown states would share a code; later ones get -2, -3 so keys stay unique and
  // the first keeps its key (saved dispositions still match).
  const seenCodes = new Map<string, number>()
  const add = (cls: W10FindingClass, id: string, code: string, text: string) => {
    const k = `${id}|${code}`
    const n = (seenCodes.get(k) ?? 0) + 1
    seenCodes.set(k, n)
    findings.push({ cls, id, code: n > 1 ? `${code}-${n}` : code, text })
  }
  const c: W10Choices = { ...EMPTY_CHOICES, ...choices, machine: { ...EMPTY_MACHINE, ...(choices.machine ?? {}) } }
  const reqSet = new Set(w9.requirements)
  const logIds = new Set(arch.logical.map((l) => l.id))
  const capIds = new Set(ops.capabilities.map((x) => x.id))

  // ---- names in Logical and Behavior never hide a package; then every cross-package reference is qualified from the root
  const rootName = opts.packageName ?? (/v0\.2$/.test(w9.rootName) ? w9.rootName.replace(/v0\.2$/, 'v0.3') : w9.rootName)
  const rootQ = quoted(rootName)
  const newNames = [...arch.functions.map((f) => f.name), ...c.newFns.map((f) => f.name), ...arch.logical.map((l) => l.name), ...arch.information.map((x) => x.name), ...c.newItems.map((x) => x.name), ...ops.capabilities.map((x) => x.name), ...ops.scenarios.map((s) => s.name)].map((n) => ascii(n))
  const hides = newNames.some((n) => PACKAGES.includes(n))
  const pk = (p: string) => (hides ? `${rootQ}::${p}` : p)
  const entRef = hides && !w9.entRef.startsWith("'") ? `${rootQ}::${w9.entRef}` : w9.entRef
  if (hides) add('gap', 'NAMES', 'name-clash', `A function, capability, item, logical element or scenario is named like one of the model’s packages (${newNames.filter((n) => PACKAGES.includes(n)).join(', ')}): inside its package that name would hide the package, so every reference to another package is qualified from the root package. The file resolves; a more specific name is clearer.`)

  // declared names in Logical: the Week 9 placeholders, then this week's elements; a repeat is renamed "name (ID)"
  const declTaken = new Set<string>([...w9.logicalDefs, 'logicalArchitecture'])
  const declName = (id: string, name: string) => {
    const n = ascii(name)
    if (!n) return ''
    if (!declTaken.has(n)) {
      declTaken.add(n)
      return n
    }
    let alt = `${n} (${id})`
    for (let i = 2; declTaken.has(alt); i++) alt = `${n} (${id}, ${i})`
    declTaken.add(alt)
    add('gap', id, 'name-clash', `${id} is named “${n}”, which is also the name of another element in the Logical package; it is written “${alt}” so that every name in the package stays distinct. Rename it in the Phase I record if the two are different things.`)
    return alt
  }

  // ---- items: Week 4 information items, then the team's new items (information ones with the next INFO IDs)
  const items: ItemRef[] = []
  for (const x of arch.information) items.push({ id: x.id, name: x.name || x.id, kind: 'information', ref: `'${x.id}'`, origin: 'Week 4' })
  const issued: string[] = []
  for (const x of c.newItems) {
    const name = ascii(x.name)
    if (!name) continue
    if (x.kind === 'information' && /^INFO-\d{3}$/.test(x.id)) {
      items.push({ id: x.id, name, kind: 'information', ref: `'${x.id}'`, origin: 'Week 10' })
      issued.push(x.id)
    } else items.push({ id: name, name, kind: x.kind, ref: quoted(name), origin: 'Week 10' })
  }
  const itemDecl = new Map<string, string>()
  for (const it of items) itemDecl.set(it.id, declName(it.id, it.name))
  const itemOf = (key: string) => items.find((x) => x.id === key) ?? items.find((x) => x.id.startsWith('INFO-') ? false : x.name.toLowerCase() === key.toLowerCase())
  const parseItems = (s: string) =>
    s
      .split(/[,;\n]+/)
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => (/^info-\d{3}$/i.test(x) ? x.toUpperCase() : x))

  // ---- functions: Week 4, then the team's new ones; items, performer, capabilities
  const allFns: { id: string; name: string; text: string; capabilities: string[]; requirements: string[]; scenarios: string[]; planning: string; log: string; origin: 'Week 4' | 'Week 10' }[] = [
    ...arch.functions.map((f) => ({ ...f, origin: 'Week 4' as const })),
    ...c.newFns.filter((f) => /^FN-\d{3}$/.test(f.id) && f.name.trim()).map((f) => ({ id: f.id, name: f.name.trim(), text: f.text.trim(), capabilities: upIds(f.capability, /CAP-\d{3}/g), requirements: [], scenarios: c.scenario ? [c.scenario] : [], planning: '', log: upIds(f.performer, /LOG-\d{3}/g)[0] ?? '', origin: 'Week 10' as const })),
  ]
  for (const f of c.newFns.filter((x) => /^FN-\d{3}$/.test(x.id) && x.name.trim())) issued.push(f.id)
  const fnIds = new Set(allFns.map((f) => f.id))
  const fnDecl = new Map<string, string>()
  for (const f of allFns) fnDecl.set(f.id, declName(f.id, f.name || f.id))
  const capDecl = new Map<string, string>()
  for (const x of ops.capabilities) capDecl.set(x.id, declName(x.id, x.name || x.id))

  const scenarioFns = new Set(Object.values(c.steps).map((x) => upIds(x?.fn ?? '', /FN-\d{3}/g)[0]).filter(Boolean))
  const functions: ResolvedFn[] = []
  for (const f of allFns) {
    const ch = c.fn[f.id]
    const defaultsIn = arch.information.filter((x) => x.consumers.includes(f.id)).map((x) => x.id)
    const defaultsOut = arch.information.filter((x) => x.producers.includes(f.id)).map((x) => x.id)
    const wantIn = ch && ch.inputs.trim() ? parseItems(ch.inputs) : defaultsIn
    const wantOut = ch && ch.outputs.trim() ? parseItems(ch.outputs) : defaultsOut
    const inputs: string[] = []
    const outputs: string[] = []
    for (const [want, into, dir] of [[wantIn, inputs, 'input'], [wantOut, outputs, 'output']] as const) {
      for (const w of want) {
        const it = itemOf(w)
        if (!it) {
          add('defect', f.id, `item-missing-${w}`, `${f.id} names “${w}” as an ${dir}, but it is neither an information item of your Week 4 file nor an item added here: the parameter is left out (it would not resolve). Add the item under “New items”, or correct the ID.`)
          continue
        }
        if (!into.includes(it.id)) into.push(it.id)
      }
    }
    const performer = (ch && ch.performer.trim() ? upIds(ch.performer, /LOG-\d{3}/g)[0] : f.log) ?? ''
    if (performer && !logIds.has(performer)) add('defect', f.id, 'performer-missing', `${f.id} is allocated to ${performer}, which is not a logical element of your Week 4 file: the perform is left out (it would not resolve). Choose a logical element, or correct the Week 4 allocation and import again.`)
    if (!performer) add('gap', f.id, 'fn-no-performer', `${f.id} has no logical element that performs it. Choose its performer: every function is allocated to at least one logical element.`)
    // a team of three models the items of the functions its chosen scenario uses (the reduced scope); the others are
    // recorded for later, not gaps
    const later = arch.threePersonTeam && !scenarioFns.has(f.id)
    if (later && (!inputs.length || !outputs.length)) add('info', f.id, 'fn-items-later', `${f.id} lacks ${!inputs.length && !outputs.length ? 'input and output items' : !inputs.length ? 'an input item' : 'an output item'}. A team of three gives items to the functions its chosen scenario uses; this one can wait for the final model.`)
    else if (!inputs.length && !outputs.length) add('gap', f.id, 'fn-no-items', `${f.id} has no input or output item. SEBoK names forgetting the inputs and outputs of functions as a pitfall: give it the items it consumes and produces (add a new item if the information view has none), or record why it has none.`)
    else if (!outputs.length) add('gap', f.id, 'fn-no-output', `${f.id} consumes items but produces none. A function transforms inputs into outputs: give it the item it produces (add a new item if the information view has none), or record why its result leaves no item in the model.`)
    else if (!inputs.length) add('gap', f.id, 'fn-no-input', `${f.id} produces items but consumes none. A function transforms inputs into outputs: give it the item, energy or material it takes in (add a new item if needed), or record why it starts from nothing the model holds.`)
    // parameter names: one per item and direction; an item both consumed and produced gets In / Out
    const taken = new Set<string>(ACTION_TAKEN)
    const params: ResolvedFn['params'] = []
    for (const [list, dir] of [[inputs, 'in'], [outputs, 'out']] as const)
      for (const id of list) {
        const it = items.find((x) => x.id === id)!
        const base = basicName(it.name, 'item')
        const both = inputs.includes(id) && outputs.includes(id)
        params.push({ item: id, dir, name: uniqueIn(taken, both ? `${base}${dir === 'in' ? 'In' : 'Out'}` : ACTION_TAKEN.has(base) ? `${base}Item` : base) })
      }
    const caps = f.capabilities.filter((x) => capIds.has(x))
    for (const x of f.capabilities.filter((y) => !capIds.has(y))) add('defect', f.id, `cap-missing-${x}`, `${f.id} serves ${x}, which is not a capability of your Week 2 file: the #derivedFrom dependency is left out. Correct the capability in the Week 4 record or the Week 2 record and import again.`)
    functions.push({ id: f.id, name: f.name, inputs, outputs, performer: performer && logIds.has(performer) ? performer : '', capabilities: caps, params, origin: f.origin })
  }

  // ---- logical elements: reuse a Week 9 placeholder of the same name, or specialize the one the team links
  const linkOf = new Map<string, string[]>()
  for (const [ph, log] of Object.entries(c.placeholders)) {
    if (!w9.logicalDefs.includes(ph)) continue
    if (log && logIds.has(log)) linkOf.set(log, [...(linkOf.get(log) ?? []), ph])
  }
  const logicalOut: Generated['logical'] = []
  const usageTaken = new Set<string>(ACTION_TAKEN)
  for (const l of arch.logical) {
    const name = ascii(l.name)
    const same = w9.logicalDefs.includes(name)
    const linked = (linkOf.get(l.id) ?? []).filter((x) => x !== name)
    const def = same ? name : declName(l.id, name || l.id)
    const usage = uniqueIn(usageTaken, basicName(l.name, 'element'))
    const performs = functions.filter((f) => f.performer === l.id).map((f) => f.id)
    if (!performs.length) add('gap', l.id, 'log-idle', `${l.id} performs no function: a logical element exists to perform functions. Allocate a function to it, or record why it stays (for example, it performs a function modeled in a later week).`)
    logicalOut.push({ id: l.id, usage, def, specializes: same ? '' : linked[0] ?? '', performs })
  }
  for (const ph of w9.logicalDefs) {
    const reused = logicalOut.some((l) => l.def === ph || l.specializes === ph)
    if (!reused) add('gap', ph, 'placeholder-unlinked', `The Week 9 placeholder “${ph}” in Logical (a requirement subject) is not linked to a logical element. Link it to the element it stands for, so the logical part specializes it, or record why it stays separate.`)
  }

  // ---- allocations of requirements to functions, and the capability links of requirements (from Week 2)
  const allocations: { req: string; fn: string }[] = []
  for (const f of allFns)
    for (const q of f.requirements) {
      if (!reqSet.has(q)) {
        add('defect', f.id, `alloc-missing-${q}`, `${f.id} has ${q} allocated in your Week 4 file, but ${q} is not a requirement in your Week 9 model: the allocation is left out (it would not resolve). Correct the Week 4 allocation, or model the requirement in Week 9, and import again.`)
        continue
      }
      allocations.push({ req: q, fn: f.id })
    }
  const sysReqs = w9.requirements.filter((x) => x.startsWith('REQ-SYS-'))
  for (const q of sysReqs) if (!allocations.some((a) => a.req === q)) add('trace', q, 'req-unallocated', `${q} is allocated to no function. SEBoK asks for a traceability matrix between the logical architecture and the system requirements: allocate it in the Week 4 record and import again, or record why no function realizes it.`)
  const capLinks: { from: string; cap: string }[] = []
  for (const f of functions) for (const x of f.capabilities) capLinks.push({ from: f.id, cap: x })
  for (const q of ops.requirements) {
    if (!reqSet.has(q.id)) continue
    for (const p of q.parents.filter((x) => x.startsWith('CAP-'))) {
      if (capIds.has(p)) capLinks.push({ from: q.id, cap: p })
      else add('defect', q.id, `req-cap-missing-${p}`, `${q.id} traces to ${p}, which is not a capability of your Week 2 file: the #derivedFrom dependency is left out.`)
    }
  }
  for (const f of functions) if (!f.capabilities.length) add('trace', f.id, 'fn-no-capability', `${f.id} is derived from no capability. A function realizes part of a capability: name the capability in the Week 4 record, or record why it has none.`)
  for (const x of ops.capabilities) if (!functions.some((f) => f.capabilities.includes(x.id))) add('trace', x.id, 'cap-no-function', `${x.id} is served by no function. Name the function that realizes it, or record why none does (for example, a constraint met by site selection, not a function).`)
  for (const f of allFns) if (f.origin === 'Week 4' && !f.scenarios.length && !f.planning) add('trace', f.id, 'fn-no-scenario', `${f.id} is exercised by no scenario and has no planning reason. SEBoK asks that the logical architecture relate back to the operational scenarios: name the scenario, or record why it has none.`)

  // ---------------------------------------------------------------- write the text
  let text = w9.text
  if (rootName !== w9.rootName) text = text.split(quoted(w9.rootName)).join(rootQ)
  const rootMatch = new RegExp(String.raw`(^|\n)[ \t]*package\s+${NAME}\s*\{`).exec(text)!
  const rootOpen = (rootMatch.index ?? 0) + rootMatch[0].length - 1

  // Logical package
  const L: string[] = []
  L.push('// The capabilities (Week 2) as action definitions (course convention).')
  for (const x of ops.capabilities) L.push(`action def <'${x.id}'>${capDecl.get(x.id) ? ` ${quoted(capDecl.get(x.id)!)}` : ''}${x.statement ? ` { doc /* ${docText(sentence(x.statement))} */ }` : ';'}`)
  if (items.length) L.push('// The items the functions consume and produce: the Week 4 information items and the items added in Week 10.')
  for (const it of items) {
    const info = arch.information.find((x) => x.id === it.id)
    const nm = itemDecl.get(it.id) ?? ''
    const doc = info?.content ? info.content : it.origin === 'Week 10' ? `${it.kind === 'information' ? 'Information' : it.kind === 'energy' ? 'Energy' : 'Material'} item added in Week 10.` : ''
    const short = it.id.startsWith('INFO-') ? `<'${it.id}'> ` : ''
    L.push(`item def ${short}${quoted(nm || it.name)}${doc ? ` { doc /* ${docText(sentence(doc))} */ }` : ';'}`)
  }
  L.push('// The functions (Week 4) as action usages, each with an in parameter for every item it consumes and an out parameter for every item it produces.')
  for (const f of functions) {
    const src = allFns.find((x) => x.id === f.id)!
    const nm = fnDecl.get(f.id) ?? ''
    const docBits = [src.text, src.origin === 'Week 10' ? 'Function added in Week 10.' : ''].filter(Boolean).join(' ')
    const body = [...(docBits ? [`doc /* ${docText(docBits)} */`] : []), ...f.params.map((p) => `${p.dir} ${p.name} : ${items.find((x) => x.id === p.item)!.ref};`)]
    if (!body.length) L.push(`action <'${f.id}'>${nm ? ` ${quoted(nm)}` : ''};`)
    else {
      L.push(`action <'${f.id}'>${nm ? ` ${quoted(nm)}` : ''} {`)
      for (const b of body) L.push(`${T(1)}${b}`)
      L.push('}')
    }
  }
  const linkName = (a: string, b: string) => `'${a} derived from ${b}'`
  if (capLinks.length) L.push('// Course convention: a function or requirement depends on the capability it was derived from (client after from, supplier after to).')
  for (const k of capLinks) L.push(`#derivedFrom dependency ${linkName(k.from, k.cap)} from ${k.from.startsWith('REQ-') ? `${pk('Requirements')}::'${k.from}'` : `'${k.from}'`} to '${k.cap}';`)
  // logical part definitions not already in the model
  const newDefs = logicalOut.filter((l) => !w9.logicalDefs.includes(l.def))
  if (newDefs.length) L.push('// Logical elements (Week 4) as part definitions; a Week 9 placeholder linked to one is specialized, so its requirement subjects still conform.')
  for (const l of newDefs) {
    const src = arch.logical.find((x) => x.id === l.id)!
    L.push(`part def ${quoted(l.def)}${l.specializes ? ` :> ${quoted(l.specializes)}` : ''}${src.text ? ` { doc /* ${docText(sentence(src.text))} */ }` : ';'}`)
  }
  // exhibitor: a logical element
  const m = c.machine
  const machineOk = !!(m.name.trim() && m.states.length)
  const smDef = machineOk ? basicName(m.name, 'OperatingStates').replace(/^[a-z]/, (ch) => ch.toUpperCase()) : ''
  const smUsage = machineOk ? basicName(m.usage || smDef.replace(/^[A-Z]/, (ch) => ch.toLowerCase()), 'operatingStates') : ''
  const exhibitorLog = machineOk && /^LOG-\d{3}$/.test(m.exhibitor.trim().toUpperCase()) ? m.exhibitor.trim().toUpperCase() : ''
  L.push('part logicalArchitecture {')
  L.push(`${T(1)}doc /* The logical architecture (Week 4): one part per logical element, each the performer of the functions allocated to it. */`)
  for (const l of logicalOut) {
    const lines = [...l.performs.map((id) => `perform ${pk('Logical')}::'${id}';`), ...(exhibitorLog === l.id ? [`exhibit ${pk('Behavior')}::${smUsage};`] : [])]
    if (!lines.length) L.push(`${T(1)}part <'${l.id}'> ${l.usage} : ${quoted(l.def)};`)
    else {
      L.push(`${T(1)}part <'${l.id}'> ${l.usage} : ${quoted(l.def)} {`)
      for (const x of lines) L.push(`${T(2)}${x}`)
      L.push(`${T(1)}}`)
    }
  }
  L.push('}')
  if (allocations.length) L.push('// Requirements allocated to functions (Week 4): the function is responsible for realizing the intent of the requirement.')
  for (const a of allocations) L.push(`allocate ${pk('Requirements')}::'${a.req}' to '${a.fn}';`)
  const lp = topPackages(text).find((p) => p.name === 'Logical')!
  text = insertBeforeClose(text, lp.open, L, 2)
  // the Week 9 Requirements doc says the capability links wait for Week 10: say where Week 10 wrote them
  if (capLinks.some((k) => k.from.startsWith('REQ-'))) {
    const rq = topPackages(text).find((p) => p.name === 'Requirements')!
    const at = text.indexOf('Parent links to capabilities wait for Week 10', rq.open)
    if (at >= 0 && at < rq.close) {
      const lineEnd = text.indexOf('\n', at)
      const indent = /^[ \t]*/.exec(text.slice(text.lastIndexOf('\n', at) + 1))![0]
      const note = [`${indent}${MARK_BEGIN}`, `${indent}// Week 10: these capability links are written in the Logical package as #derivedFrom dependencies (a derivation connection cannot end on a capability, which is an action definition).`, `${indent}${MARK_END}`]
      text = `${text.slice(0, lineEnd + 1)}${note.join('\n')}\n${text.slice(lineEnd + 1)}`
    }
  }

  // Behavior package: use cases (the chosen scenario with its flow), signals, the state definition
  const B: string[] = []
  const stkById = new Map(w9.stakeholders.map((s) => [s.id, s]))
  const extById = new Map(w9.externals.map((x) => [x.id, x]))
  const actorType = (id: string): string | null => {
    if (stkById.has(id)) return `${pk('Stakeholders')}::'${id}'`
    const x = extById.get(id)
    if (x) return `${pk('Context')}::${quoted(x.def)}`
    return null
  }
  const nameMatch = (n: string): string | null => {
    const k = n.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]/g, '')
    if (!k) return null
    const s = w9.stakeholders.find((x) => x.name && x.name.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(k))
    if (s) return s.id
    const e = w9.externals.find((x) => x.def.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]/g, '') === k || x.name.toLowerCase() === k)
    return e ? e.id : null
  }
  const useCases: Generated['useCases'] = []
  let flow: Generated['flow'] = null
  const chosen = ops.scenarios.find((s) => s.id === c.scenario)
  if (!c.scenario) add('gap', 'SCENARIO', 'no-scenario', arch.threePersonTeam ? 'No scenario is chosen for the action flow. A team of three chooses any scenario with at least one alternate from its Week 2 ConOps.' : 'No scenario is chosen for the action flow. A team of four chooses the scenario with the most alternates from its Week 2 ConOps.')
  else if (!chosen) add('defect', c.scenario, 'scenario-missing', `${c.scenario} is not a scenario of your Week 2 file: no flow is written. Choose again.`)
  if (ops.scenarios.length) B.push('// The Week 2 scenarios as use cases: subject the enterprise, an actor for each modeled actor, the success end state as objective.')
  const ucTaken = new Set<string>()
  for (const s of ops.scenarios) {
    const typed = c.actors[s.id]?.trim()
    const ids = typed ? upIds(typed, /(?:STK|EXT)-\d{3}/g) : s.actors.map((a) => (/^(STK|EXT)-\d{3}$/.test(a.id) ? a.id : nameMatch(a.name))).filter((x): x is string => !!x)
    const unmapped = typed ? [] : s.actors.filter((a) => !(/^(STK|EXT)-\d{3}$/.test(a.id) ? a.id : nameMatch(a.name))).map((a) => a.name || a.id)
    const actorLines: string[] = []
    const taken = new Set<string>(ACTION_TAKEN)
    const okIds: string[] = []
    for (const id of [...new Set(ids)]) {
      const t = actorType(id)
      if (!t) {
        add('defect', s.id, `actor-missing-${id}`, `${s.id} names ${id} as an actor, but ${id} is neither a stakeholder nor an external system of your model: the actor is left out (it would not resolve).`)
        continue
      }
      const nm = stkById.get(id)?.name || extById.get(id)?.name || id
      actorLines.push(`actor ${uniqueIn(taken, basicName(nm, `actor${id.replace(/\D/g, '')}`))} : ${t};`)
      okIds.push(id)
    }
    if (unmapped.length) add('gap', s.id, 'actor-unmapped', `${s.id}: the actor${unmapped.length > 1 ? 's' : ''} ${unmapped.join(', ')} match${unmapped.length > 1 ? '' : 'es'} no stakeholder or external system of the model, so ${unmapped.length > 1 ? 'they are' : 'it is'} named in the doc only. Type the actor IDs for this use case (for example STK-003), or record why the actor is not modeled.`)
    useCases.push({ id: s.id, actors: okIds, unmapped })
    const docBits = [s.summary, s.trigger && `Trigger: ${sentence(s.trigger)}`, s.preconditions && `Preconditions: ${sentence(s.preconditions)}`, s.failure && `Failure end state: ${sentence(s.failure)}`, unmapped.length ? `Actors not modeled as parts: ${unmapped.join(', ')}.` : ''].filter(Boolean).join(' ')
    const nm = ascii(s.name)
    const declared = nm && !ucTaken.has(nm) ? nm : nm ? `${nm} (${s.id})` : ''
    if (declared) ucTaken.add(declared)
    B.push(`use case <'${s.id}'>${declared ? ` ${quoted(declared)}` : ''} {`)
    if (docBits) B.push(`${T(1)}doc /* ${docText(docBits)} */`)
    B.push(`${T(1)}subject enterprise : ${entRef};`)
    for (const a of actorLines) B.push(`${T(1)}${a}`)
    B.push(`${T(1)}objective { doc /* ${docText(s.success ? `Success: ${sentence(s.success)}` : 'Success end state not written in Week 2.')} */ }`)
    if (chosen && s.id === chosen.id) {
      const f = writeFlow(s, c, functions, items, pk, taken, add)
      for (const line of f.lines) B.push(`${T(1)}${line}`)
      flow = { scenario: s.id, nodes: f.nodes, decisions: f.decisions, itemFlows: f.itemFlows }
    }
    B.push('}')
  }

  // the state definition
  let machine: Generated['machine'] = null
  if (!machineOk) add('gap', 'STATES', 'no-machine', 'No state definition yet. Name the operating states of your principal element, with their transitions.')
  else {
    const stTaken = new Set<string>(ACTION_TAKEN)
    const stateName = new Map<string, string>()
    for (const st of m.states) {
      const key = st.name.trim()
      if (!key || stateName.has(key)) continue
      stateName.set(key, uniqueIn(stTaken, basicName(key, 'state')))
    }
    const states = [...stateName.values()]
    const init = stateName.get(m.initial.trim()) ?? states[0]
    if (!stateName.has(m.initial.trim())) add('gap', 'STATES', 'no-initial', `No initial state chosen: ${init ?? 'the first state'} is used. Choose the state the element is in after entry.`)
    const sigTaken = new Set<string>([smDef, smUsage])
    const sigName = new Map<string, string>()
    const guardNames = new Set<string>()
    const trs: { name: string; from: string; trigger: string; guard: string; guardText: string; to: string }[] = []
    const trTaken = new Set<string>([...stTaken])
    for (const t of m.transitions) {
      const from = stateName.get(t.from.trim())
      const to = stateName.get(t.to.trim())
      const trig = t.trigger.trim()
      if (!from || !to) {
        add('defect', 'STATES', `transition-state-missing-${t.from}-${t.to}`, `A transition from “${t.from}” to “${t.to}” names a state that is not in the list: it is left out (it would not resolve). Add the state or correct the transition.`)
        continue
      }
      if (!trig) {
        add('gap', 'STATES', `transition-no-trigger-${t.from}-${t.to}`, `The transition from ${t.from} to ${t.to} has no trigger: it is left out. Name the signal or event that fires it.`)
        continue
      }
      const sigKey = basicName(trig, 'Signal').replace(/^[a-z]/, (ch) => ch.toUpperCase())
      if (!sigName.has(sigKey)) sigName.set(sigKey, uniqueIn(sigTaken, sigKey))
      const g = t.guard.trim() ? parseGuard(t.guard) : null
      if (t.guard.trim() && !g) add('gap', 'STATES', `guard-unreadable-${t.from}-${t.to}`, `The guard “${t.guard}” of the transition from ${t.from} to ${t.to} is not a name or “not name”: it is left out. Write it as a condition name, for example noGoFaultOpen or not noGoFaultOpen.`)
      if (g) guardNames.add(g.name)
      trs.push({ name: uniqueIn(trTaken, basicName(`${t.from.trim()} to ${t.to.trim()}`, 'transition')), from, trigger: sigName.get(sigKey)!, guard: g ? g.name : '', guardText: g ? `${g.neg ? 'not ' : ''}${g.name}` : '', to })
    }
    // reachability from the initial state
    const reach = new Set<string>(init ? [init] : [])
    for (let changed = true; changed; ) {
      changed = false
      for (const t of trs) if (reach.has(t.from) && !reach.has(t.to)) {
        reach.add(t.to)
        changed = true
      }
    }
    const unreachable = states.filter((s) => !reach.has(s))
    for (const u of unreachable) add('gap', u, 'state-unreachable', `The state ${u} cannot be reached from the initial state ${init}: no chain of transitions enters it. The checker accepts this; add the transition that enters it, or remove the state.`)
    for (const s of states) if (s !== init && !trs.some((t) => t.from === s) && reach.has(s)) add('gap', s, 'state-dead-end', `The state ${s} has no transition out of it. That is right for a final condition (out of service for good); otherwise add the transition that leaves it, or record why it has none.`)
    const min = arch.threePersonTeam ? { s: LAB10_MINIMUMS.statesThree, t: LAB10_MINIMUMS.transitionsThree } : { s: LAB10_MINIMUMS.states, t: LAB10_MINIMUMS.transitions }
    if (states.length < min.s || trs.length < min.t || guardNames.size < LAB10_MINIMUMS.guards) add('gap', 'STATES', 'machine-minimum', `The state definition has ${states.length} state(s), ${trs.length} transition(s) and ${guardNames.size} guard condition(s); the lab asks for at least ${min.s} states, ${min.t} transitions and ${LAB10_MINIMUMS.guards} guard.`)
    const fnRef = (id: string) => (fnIds.has(id) ? `${pk('Logical')}::'${id}'` : null)
    if (sigName.size) B.push('// The signals that trigger the transitions.')
    for (const s of sigName.values()) B.push(`attribute def ${s};`)
    B.push(`state def ${smDef} {`)
    B.push(`${T(1)}doc /* ${docText(m.doc.trim() ? sentence(m.doc) : 'Operating states (Week 10).')} */`)
    for (const g of guardNames) B.push(`${T(1)}attribute ${g} : Boolean;`)
    if (init) B.push(`${T(1)}first start then ${init};`)
    const written = new Set<string>()
    for (const st of m.states) {
      const nm = stateName.get(st.name.trim())
      if (!nm || written.has(nm)) continue
      written.add(nm)
      const body: string[] = []
      if (st.doc.trim()) body.push(`doc /* ${docText(st.doc)} */`)
      for (const [kw, v] of [['entry', st.entry], ['do', st.do]] as const) {
        const id = upIds(v, /FN-\d{3}/g)[0]
        if (!v.trim()) continue
        const ref = id ? fnRef(id) : null
        if (!ref) add('defect', nm, `state-fn-missing-${kw}`, `The ${kw} action of state ${nm} names “${v}”, which is not a function of the model: it is left out. Choose a function ID.`)
        else body.push(`${kw} ${ref};`)
      }
      B.push(body.length ? `${T(1)}state ${nm} { ${body.join(' ')} }` : `${T(1)}state ${nm};`)
    }
    for (const t of trs) B.push(`${T(1)}transition ${t.name} first ${t.from} accept ${t.trigger}${t.guardText ? ` if ${t.guardText}` : ''} then ${t.to};`)
    B.push('}')
    B.push(`state ${smUsage} : ${smDef};`)
    // exhibitor
    let exhibitedBy = ''
    const ex = m.exhibitor.trim()
    if (exhibitorLog) {
      if (logIds.has(exhibitorLog)) exhibitedBy = exhibitorLog
      else add('defect', exhibitorLog, 'exhibitor-missing', `The exhibitor ${exhibitorLog} is not a logical element: no part exhibits the state definition.`)
    } else if (ex === 'soi' && w9.hasSoi) exhibitedBy = 'soi'
    else if (ex && w9.physicalDefs.includes(ex)) exhibitedBy = ex
    else if (ex) add('defect', ex, 'exhibitor-missing', `The exhibitor “${ex}” is neither a logical element, the system of interest, nor a part definition of the Physical package: no part exhibits the state definition.`)
    if (!exhibitedBy) add('gap', 'STATES', 'no-exhibitor', 'No part exhibits the state definition. Choose the part whose operating states these are: a part definition in Physical (completed in Week 11), the system of interest, or a logical element.')
    machine = { name: smDef, states, transitions: trs.map((t) => ({ name: t.name, from: t.from, trigger: t.trigger, guard: t.guardText, to: t.to })), guards: guardNames.size, unreachable, exhibitedBy }
    // write the exhibit in Physical (part definition or the system of interest)
    if (exhibitedBy && !exhibitorLog) {
      const bp = topPackages(text).find((p) => p.name === 'Physical')!
      const pbody = text.slice(bp.open, bp.close)
      const re = exhibitedBy === 'soi' ? /(^|\n)[ \t]*part soi\s*:/g : new RegExp(String.raw`(^|\n)[ \t]*part def\s+(?:<'[^']*'>\s*)?(?:${esc(quoted(exhibitedBy))}|${esc(exhibitedBy)}(?![A-Za-z0-9_]))`, 'g')
      const mm = re.exec(pbody)
      if (mm) text = addToDeclaration(text, bp.open + (mm.index ?? 0) + mm[1].length, [`exhibit ${pk('Behavior')}::${smUsage};`], 3)
    }
  }
  const bpk = topPackages(text).find((p) => p.name === 'Behavior')!
  text = insertBeforeClose(text, bpk.open, B, 2)

  // the #derivedFrom keyword, after the root's imports
  const head = [
    '// Course convention: a function or requirement depends on the capability it was derived from; the dependency runs from the dependent element (client) to the capability (supplier).',
    'metadata def <derivedFrom> DerivedFromLink {',
    `${T(1)}doc /* Tags a dependency from a function or a requirement (client, after from) to the capability it was derived from in Phase I (supplier, after to): a change to the capability may require a change to the client. A derivation connection cannot be used, because its ends must be requirements and a capability is an action definition. */`,
    `${T(1)}:> annotatedElement : SysML::Dependency;`,
    '}',
  ]
  const rootEnd = text.indexOf('\n', rootOpen)
  const afterRoot = text.slice(rootEnd + 1)
  const lastImport = [...afterRoot.matchAll(/^\t(?:private |public )?import [^\n]*\n/gm)].filter((mm) => depthAt(text, rootEnd + 1 + (mm.index ?? 0)) === 1)
  const docLine = /^\tdoc \/\*[^\n]*\*\/\n/m.exec(afterRoot)
  let insertAt = lastImport.length ? rootEnd + 1 + (lastImport.at(-1)!.index ?? 0) + lastImport.at(-1)![0].length : docLine && docLine.index === 0 ? rootEnd + 1 + docLine[0].length : rootEnd + 1
  // never inside an earlier week's generated region (the Week 9 imports sit in one): a Week 9 re-run would strip the
  // keyword definition and leave its #derivedFrom uses unresolved
  const W9_BEGIN = '// --- generated by the Week 9 lab tool: begin ---'
  const W9_END = '// --- generated by the Week 9 lab tool: end ---'
  const before = text.slice(0, insertAt)
  if (before.lastIndexOf(W9_BEGIN) > before.lastIndexOf(W9_END)) {
    const end = text.indexOf(W9_END, insertAt)
    if (end >= 0) insertAt = text.indexOf('\n', end) + 1
  }
  text = `${text.slice(0, insertAt)}${[`\t${MARK_BEGIN}`, ...head.map((l) => `\t${l}`), `\t${MARK_END}`].join('\n')}\n${text.slice(insertAt)}`

  for (const id of issued) add('info', id, 'issued', `${id} is issued this week; IDs continue after the highest your Week 4 file and model have used, and none is ever reused.`)

  // header
  const header = [
    MARK_BEGIN,
    `// ${ascii(w9.enterpriseName || arch.enterprise || ops.enterprise || 'Enterprise')}: SysML v2 model v0.3 (Week 10: logical architecture and behavior).`,
    `// Generated by the Week 10 lab tool${opts.date ? ` on ${opts.date}` : ''} from model v0.2 (Week 9)${opts.origin ? ` and ${ascii(opts.origin)}` : ' and the Week 2 and Week 4 model inputs'}.`,
    ...(opts.header ?? []).map((h) => `// ${ascii(h)}`),
    '// Course conventions: a capability is an action definition and a function an action usage; a logical part performs the',
    '// functions allocated to it; a requirement is allocated to a function; a scenario step subsets its function.',
    '// A checker PASS means the file parsed, every name resolved and no validation rule fired. It does not show that a',
    '// flow follows the ConOps, that a guard means its condition, or that the states are complete.',
    '// The model v0.2 header follows.',
    MARK_END,
  ]
  text = `${header.join('\n')}\n${text}`
  if (!text.endsWith('\n')) text += '\n'
  return { text, findings, items, functions, logical: logicalOut, allocations, capLinks, useCases, flow, machine, issued }
}

// ---------------------------------------------------------------------------------------------- the action flow
/** The chosen scenario as an action flow inside its use case. Steps in ConOps order joined by `then`; after a step with
 *  alternates, a decide with one guarded branch per alternate and an else to the next main node; an alternate's action
 *  then rejoins at a merge before its rejoin step, or ends at done; item flows from the nearest earlier step whose
 *  function produces the item to the step whose function consumes it. */
function writeFlow(
  s: W10Scenario,
  c: W10Choices,
  functions: ResolvedFn[],
  items: ItemRef[],
  pk: (p: string) => string,
  taken: Set<string>,
  add: (cls: W10FindingClass, id: string, code: string, text: string) => void,
): { lines: string[]; nodes: FlowNode[]; decisions: number; itemFlows: ItemFlow[] } {
  const n = s.steps.length
  const lines: string[] = []
  const nodes: FlowNode[] = []
  if (!n) {
    add('gap', s.id, 'no-steps', `${s.id} has no steps in your Week 2 file: no flow is written.`)
    return { lines, nodes, decisions: 0, itemFlows: [] }
  }
  const stepName = new Map<number, string>()
  const stepFn = new Map<number, ResolvedFn | undefined>()
  for (const st of s.steps) {
    const ch = c.steps[String(st.n)]
    stepName.set(st.n, uniqueIn(taken, basicName(ch?.name?.trim() || wordsName(st.text, 3, `step${st.n}`), `step${st.n}`)))
    const fid = ch?.fn ? upIds(ch.fn, /FN-\d{3}/g)[0] : ''
    const f = fid ? functions.find((x) => x.id === fid) : undefined
    if (fid && !f) add('defect', s.id, `step-fn-missing-${st.n}`, `Step ${st.n} of ${s.id} is an occurrence of ${fid}, which is not a function of the model: it is written without the subsetting. Choose a function ID.`)
    stepFn.set(st.n, f)
  }
  const alts = s.alternates.filter((a) => a.fromStep >= 1 && a.fromStep <= n)
  for (const a of s.alternates.filter((x) => !(x.fromStep >= 1 && x.fromStep <= n))) add('gap', s.id, `alt-step-missing-${a.id}`, `${s.id} ${a.id} branches from step ${a.fromStep}, which the scenario does not have: it is left out of the flow. Correct the alternate in the Week 2 record.`)
  const rejoinOf = (a: W10Alt) => (a.outcome === 'ends' ? 0 : a.outcome.rejoin >= 1 && a.outcome.rejoin <= n ? a.outcome.rejoin : -1)
  for (const a of alts) if (rejoinOf(a) === -1) add('gap', s.id, `alt-rejoin-missing-${a.id}`, `${s.id} ${a.id} rejoins at a step the scenario does not have: it is written to end at done. Correct the rejoin step in the Week 2 record.`)
  const rejoinTargets = new Set(alts.map(rejoinOf).filter((r) => r > 0))
  const mergeName = new Map<number, string>()
  for (const r of [...rejoinTargets].sort((a, b) => a - b)) mergeName.set(r, uniqueIn(taken, basicName(`rejoin ${stepName.get(r)}`, `rejoinStep${r}`)))
  // where each alternate's decision sits: after the step it branches from (the default), or before it, when the
  // condition is known before the step happens (the alternate then replaces the step)
  const atOf = (a: W10Alt): 'before' | 'after' => (c.alts[a.id]?.at === 'before' ? 'before' : 'after')
  const beforeAlts = (k: number) => alts.filter((a) => a.fromStep === k && atOf(a) === 'before')
  const afterAlts = (k: number) => alts.filter((a) => a.fromStep === k && atOf(a) === 'after')
  const beforeName = new Map<number, string>()
  const decideName = new Map<number, string>()
  for (let k = 1; k <= n; k++) {
    if (beforeAlts(k).length) beforeName.set(k, uniqueIn(taken, basicName(`before ${stepName.get(k)}`, `beforeStep${k}`)))
    if (afterAlts(k).length) decideName.set(k, uniqueIn(taken, basicName(`after ${stepName.get(k)}`, `afterStep${k}`)))
  }
  /** The first node of step k on the main path: its merge, else its before-decision, else the step itself. */
  const entry = (k: number) => (k > n ? 'done' : (mergeName.get(k) ?? beforeName.get(k) ?? stepName.get(k)!))
  const altName = new Map<string, string>()
  const guard = new Map<string, string>()
  // guard attributes: Boolean conditions the ConOps names (the model does not compute them); one name per condition,
  // distinct from every step and node name, shared when two alternates give the same guard
  const guardFinal = new Map<string, string>()
  for (const a of alts) {
    const ch = c.alts[a.id]
    altName.set(a.id, uniqueIn(taken, basicName(ch?.name?.trim() || `${a.id} ${wordsName(a.response, 3, 'response')}`, `alt${a.id}`)))
  }
  for (const a of alts) {
    const ch = c.alts[a.id]
    const g = ch?.guard?.trim() ? parseGuard(ch.guard) : null
    if (ch?.guard?.trim() && !g) add('gap', s.id, `guard-unreadable-${a.id}`, `The guard “${ch.guard}” of ${a.id} is not a condition name: a name is made from the condition instead. Write it as one name, for example destinationPadOccupied.`)
    const gn = g?.name || wordsName(a.condition, 5, `condition${a.id}`)
    if (!guardFinal.has(gn)) {
      guardFinal.set(gn, uniqueIn(taken, gn))
      lines.push(`attribute ${guardFinal.get(gn)} : Boolean;`)
    }
    guard.set(a.id, `${g?.neg ? 'not ' : ''}${guardFinal.get(gn)}`)
  }
  lines.push('first start;')
  let decisions = 0
  /** Whether the node written last flows into the next one by `then` (false after a decision and its alternates). */
  let open = true
  const decide = (k: number, name: string, mine: W10Alt[], elseTo: string, where: 'before' | 'after') => {
    decisions++
    lines.push(`${open ? 'then ' : ''}decide ${name};`)
    for (const a of mine) lines.push(`${T(1)}if ${guard.get(a.id)} then ${altName.get(a.id)};`)
    lines.push(`${T(1)}else ${elseTo};`)
    nodes.push({ kind: 'decide', name, conops: `${where} step ${k}: ${mine.map((a) => a.id).join(', ')}`, construct: `decide: ${mine.length} guarded branch${mine.length > 1 ? 'es' : ''} and else` })
    for (const a of mine) {
      const r = rejoinOf(a)
      lines.push(`action ${altName.get(a.id)} { doc /* ${docText(`${a.id} (${where} step ${k}): ${sentence(a.condition)} ${sentence(a.response)} ${r > 0 ? `Rejoins at step ${r}.` : 'The scenario ends.'}`)} */ }`)
      lines.push(`then ${r > 0 ? entry(r) : 'done'};`)
      nodes.push({ kind: 'alt', name: altName.get(a.id)!, conops: `${a.id}: ${a.condition}`, construct: `guard ${guard.get(a.id)}; ${r > 0 ? `then the merge before step ${r}` : 'then done'}` })
    }
    open = false
  }
  for (let k = 1; k <= n; k++) {
    const st = s.steps.find((x) => x.n === k)!
    const f = stepFn.get(k)
    const doc = `doc /* ${docText(`${k}. ${st.actor ? `${st.actor}: ` : ''}${sentence(st.text)}`)} */`
    if (mergeName.has(k)) {
      lines.push(`${open ? 'then ' : ''}merge ${mergeName.get(k)};`)
      nodes.push({ kind: 'merge', name: mergeName.get(k)!, conops: `before step ${k} (an alternate rejoins)`, construct: 'merge' })
      open = true
    }
    if (beforeName.has(k)) decide(k, beforeName.get(k)!, beforeAlts(k), stepName.get(k)!, 'before')
    lines.push(`${open ? 'then ' : ''}action ${stepName.get(k)}${f ? ` :> ${pk('Logical')}::'${f.id}'` : ''} { ${doc} }`)
    nodes.push({ kind: 'step', name: stepName.get(k)!, conops: `step ${k}: ${st.text}`, construct: f ? `action subsetting ${f.id}` : 'action (no function)' })
    open = true
    if (decideName.has(k)) decide(k, decideName.get(k)!, afterAlts(k), entry(k + 1), 'after')
  }
  if (open) lines.push('then done;')
  if (!alts.length) add('gap', s.id, 'no-decision', `${s.id} has no alternates, so its flow has no decision. Choose a scenario with at least one alternate: the lab asks for at least one decision.`)
  // item flows
  const itemFlows: ItemFlow[] = []
  for (let j = 2; j <= n; j++) {
    const fj = stepFn.get(j)
    if (!fj) continue
    for (const p of fj.params.filter((x) => x.dir === 'in')) {
      for (let k = j - 1; k >= 1; k--) {
        const fk = stepFn.get(k)
        const out = fk?.params.find((x) => x.dir === 'out' && x.item === p.item)
        if (!out) continue
        const it = items.find((x) => x.id === p.item)!
        itemFlows.push({ from: stepName.get(k)!, to: stepName.get(j)!, item: it.id, text: `flow ${stepName.get(k)}.${out.name} to ${stepName.get(j)}.${p.name};` })
        break
      }
    }
  }
  if (itemFlows.length) {
    lines.push('// Item flows: from the step whose function produces the item to a later step whose function consumes it.')
    for (const f of itemFlows) lines.push(f.text)
  } else add('gap', s.id, 'no-item-flow', `The flow of ${s.id} has no item flow: no step’s function produces an item that a later step’s function consumes. Give the functions of two steps a shared item (an out item of the earlier, an in item of the later), or record why the scenario carries none.`)
  return { lines, nodes, decisions, itemFlows }
}

// ---------------------------------------------------------------------------------------------- derived tables
/** Requirements (rows) by functions (columns), true where an allocation connects them. */
export function allocationGrid(g: Generated): { cols: string[]; rows: { req: string; cells: boolean[] }[] } {
  const cols = [...new Set(g.allocations.map((a) => a.fn))].sort()
  const reqs = [...new Set(g.allocations.map((a) => a.req))].sort()
  return { cols, rows: reqs.map((q) => ({ req: q, cells: cols.map((f) => g.allocations.some((a) => a.req === q && a.fn === f)) })) }
}
/** The cross-check of flow and states: for each transition, the steps of the chosen scenario whose function is the
 *  entry or do function of the transition's target state (a computed suggestion; the pairing is the team's to judge). */
export function crossCheck(g: Generated, machine: Machine): { transition: string; from: string; to: string; trigger: string; steps: string[] }[] {
  if (!g.machine || !g.flow) return []
  const stateFns = new Map<string, string[]>()
  for (const st of machine.states) {
    const nm = basicName(st.name.trim(), 'state')
    stateFns.set(nm, [...upIds(st.entry, /FN-\d{3}/g), ...upIds(st.do, /FN-\d{3}/g)])
  }
  const steps = g.flow.nodes.filter((x) => x.kind === 'step')
  return g.machine.transitions.map((t) => {
    const fns = stateFns.get(t.to) ?? []
    return { transition: t.name, from: t.from, to: t.to, trigger: t.trigger, steps: steps.filter((s) => fns.some((f) => s.construct.endsWith(f))).map((s) => s.name) }
  })
}
/** The next function or information-item ID: one past the highest the Week 4 file, its issued counter, the model and
 *  this week's additions have used. Never reused. */
export function nextId(prefix: 'FN' | 'INFO', arch: W10Arch | null, w9: W9Model | null, issued: number, extra: string[] = []): string {
  const fromArch = arch ? (prefix === 'FN' ? Math.max(arch.issuedFn, ...arch.functions.map((f) => num(f.id))) : Math.max(arch.issuedInfo, ...arch.information.map((x) => num(x.id)))) : 0
  const fromModel = w9 ? (prefix === 'FN' ? w9.maxFn : w9.maxInfo) : 0
  const n = Math.max(fromArch, fromModel, issued, ...extra.map(num)) + 1
  return `${prefix}-${String(n).padStart(3, '0')}`
}
