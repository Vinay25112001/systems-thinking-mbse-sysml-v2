// Week 11 lab tool logic (pure): read the team's Week 10 model v0.3 (.sysml, the Week 10 lab tool's output) and its Week 5
// model inputs (.json: the components, externals, interfaces and interface requirements, with the Week 4 snapshot of the
// physical elements, functions and information items), and write model v0.4: the Physical package (the physical elements
// and components as parts inside one part physicalArchitecture, the functions they perform, a port definition, an
// interface definition and an interface usage for each physical or information interface, a connection for each
// organizational one, the flows of what crosses, the allocation of the logical architecture to the physical one, the
// interface requirements allocated to their interfaces and functions, and the first satisfy claims), plus the interface
// requirements Week 9 did not model (Requirements) and the externals Week 5 added (Context). Nothing in model v0.3 is
// retyped: the generator adds, between Week 11 marker comments, what this week models, so a file the tool wrote can be
// imported again without duplicating anything. The Week 8, 9 and 10 regions are kept exactly as they are.
//
// The same generator writes the AeroLink worked example (src/content/lectures/week11/aerolinkCase.ts). Its outputs for
// AeroLink, the fixture team and an adversarial record are kept under sysml/lectures/week11/ and validated by the course
// checker (scripts/build-week11-sysml.mjs writes them; sysmlWeek11.test.ts fails when a file is stale). A checker PASS
// shows the text parses, every name resolves and no validation rule fires; it does not show that two connected ports
// match, that a flow runs the right way or that a satisfy claim is true. That is the interface review's job, and the
// team's.
//
// Course conventions (labBrief.ts W11_MAPPING; each is labeled on the slides): every Phase I ID is a quoted short name; a
// function is performed by the level-1 physical element Week 4 placed it on (perform makes the part the performer, SysML
// v2.1 Beta 2 Part 1, 7.17.6); a logical part is allocated to each physical part that performs one of its functions, with
// a nested allocation per function (7.15; training deck slide 106); one port definition per interface, end A typed by it
// and end B by its conjugate (7.12.3); an interface requirement Week 9 did not model gets the interface definition as its
// subject; references to another package are qualified.
// Review status: new-pending-review.
import { isAeroLink } from '../week1/team'
import { idsIn as w5Ids, importWeek5, type Week5Record } from '../week5/record'
import { ascii, basicName, docText, quoted } from '../week8/skeleton'
import { COMPLETION_CLAIM, LAB11_MINIMUMS, type W11FindingClass } from '../../content/lectures/week11/labBrief'
import { isEmptyEveryWord, said, saidSomething } from '../emptyAnswer'

// ---------------------------------------------------------------------------------------------- the Week 5 source
export type W11Interface = { id: string; name: string; kind: string; endA: string; endB: string; crosses: string; direction: string; medium: string; constraint: string; requirements: string[]; protection: string; degraded: string; standard: string }
export type W11Req = { id: string; name: string; statement: string; interface: string; criterion: string; method: string; parents: string[]; rationale: string }
/** What the Week 5 file contributes (normalized; saved in the tool state). */
export type W11Phys = {
  team: string
  enterprise: string
  threePersonTeam: boolean
  physical: { id: string; name: string; text: string }[]
  components: { id: string; name: string; parent: string; kind: string; responsibility: string; functions: string[] }[]
  /** Externals of the Week 1 context, of Week 4 and of Week 5 (first occurrence of each ID). */
  externals: { id: string; name: string; origin: string }[]
  externalReasons: Record<string, string>
  interfaces: W11Interface[]
  requirements: W11Req[]
  functions: { id: string; name: string; phy: string; log: string }[]
  information: { id: string; name: string; producers: string[]; consumers: string[] }[]
  ai: { id: string; name: string; host: string }[]
}

const upIds = (s: string, re: RegExp) => [...new Set(s.toUpperCase().match(re) ?? [])]
const num = (id: string) => Number(id.replace(/^\D+/, '').split('-').pop()) || 0
const nameKey = (t: string) => ascii(t).toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]/g, '')

/** The Week 5 model inputs as a source: physical elements, components, externals, interfaces, interface requirements,
 *  and the functions and information items of the Week 4 snapshot. */
export function physFromWeek5(r: Week5Record): W11Phys {
  const w4 = r.week4
  const ext: W11Phys['externals'] = []
  const addExt = (id: string, name: string, origin: string) => {
    if (id && !ext.some((x) => x.id === id)) ext.push({ id, name: name.trim(), origin })
  }
  for (const x of w4?.week1Externals ?? []) addExt(x.id, x.name, 'Week 1')
  for (const x of w4?.externals ?? []) addExt(x.id, x.name, 'Week 4')
  for (const x of r.externals) addExt(x.id, x.name, 'Week 5')
  return {
    team: w4?.team.trim() ?? '',
    enterprise: w4?.enterprise.trim() ?? '',
    threePersonTeam: r.threePersonTeam,
    physical: (w4?.physical ?? []).map((p) => ({ id: p.id, name: p.name.trim(), text: p.text.trim() })),
    components: r.components.map((c) => ({ id: c.id, name: c.name.trim(), parent: c.parent, kind: c.kind, responsibility: c.responsibility.trim(), functions: upIds(c.functions, /FN-\d{3}/g) })),
    externals: ext,
    externalReasons: Object.fromEntries(Object.entries(r.externalReasons).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v)),
    interfaces: r.interfaces.map((x) => ({ id: x.id, name: x.name.trim(), kind: x.kind, endA: x.endA.trim().toUpperCase(), endB: x.endB.trim().toUpperCase(), crosses: x.crosses.trim(), direction: x.direction.trim(), medium: x.medium.trim(), constraint: x.constraint.trim(), requirements: w5Ids(x.requirements), protection: x.protection.trim(), degraded: x.degraded.trim(), standard: x.standard.trim() })),
    requirements: r.requirements.map((q) => ({ id: q.id, name: q.name.trim(), statement: q.statement.trim(), interface: q.interface.trim().toUpperCase(), criterion: q.criterion.trim(), method: q.method, parents: w5Ids(q.parents).filter((p) => p !== q.id), rationale: q.rationale.trim() })),
    functions: (w4?.functions ?? []).map((f) => ({ id: f.id, name: f.name.trim(), phy: f.phy, log: f.log })),
    information: (w4?.information ?? []).map((x) => ({ id: x.id, name: x.name.trim(), producers: x.producers, consumers: x.consumers })),
    ai: (w4?.ai ?? []).map((x) => ({ id: x.id, name: x.name.trim(), host: x.host })),
  }
}

/** Reads a Week 5 model-inputs file for Week 11 (refuses other weeks and AeroLink with a message; never throws). */
export function readWeek5For11(text: string): { record: Week5Record } | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON. Export the model inputs (.json) from the Week 5 lab tool and import that file here; the model file (.sysml) goes in the Week 10 field.' }
  }
  const format = d && typeof d === 'object' && !Array.isArray(d) ? (d as { format?: unknown }).format : undefined
  if (format === 'week4-model-inputs') return { error: 'This is the Week 4 model-inputs file. Week 11 reads your Week 5 file, which carries the Week 4 physical elements, functions and information items with the components and interfaces (format “week5-model-inputs”).' }
  if (d && typeof d === 'object' && !Array.isArray(d) && format === undefined) return { error: 'This file has no “format”: it is not a lab-tool export. Export the model inputs (.json) from the Week 5 lab tool (team-NN-week5-model-inputs.json) and import that file here.' }
  if (format === 'week11-physical') return { error: 'This is a Week 11 workspace file: import it in the workspace field. This field takes the Week 5 model-inputs file (format “week5-model-inputs”).' }
  if (format === 'week10-behavior') return { error: 'This is a Week 10 workspace file. This field takes the Week 5 model-inputs file (format “week5-model-inputs”); a teammate’s Week 11 workspace goes in its own field.' }
  if (typeof format === 'string' && /^week\d+-/.test(format) && format !== 'week5-model-inputs') return { error: `This is a ${format.replace(/^week(\d+)-.*/, 'Week $1')} file. This field takes the Week 5 model-inputs file (format “week5-model-inputs”).` }
  const r = importWeek5(text)
  if ('error' in r) return r
  if (isAeroLink(r.week4?.enterprise ?? '') || isAeroLink(r.week4?.soi ?? '')) return { error: 'This record is about AeroLink, the instructor’s worked example: import your team’s own Week 5 file.' }
  if (!r.week4 || !r.week4.physical.length) return { error: 'This Week 5 file carries no Week 4 physical elements. Export the model inputs again from the Week 5 lab tool after starting it from your Week 4 export.' }
  if (!r.interfaces.length) return { error: 'This Week 5 file has no interfaces. Export the model inputs again after defining your interfaces in the Week 5 lab tool.' }
  return { record: r }
}

// ---------------------------------------------------------------------------------------------- reading model v0.3
export const MARK_BEGIN = '// --- generated by the Week 11 lab tool: begin ---'
export const MARK_END = '// --- generated by the Week 11 lab tool: end ---'

/** Removes every region the Week 11 tool wrote (between its marker comments), so a model v0.4 can be imported again.
 *  The Week 8, 9 and 10 regions are kept. */
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
 *  closes. Same reading as the Week 9 and 10 tools. */
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
/** The body of the declaration whose header matches `re` (searched from `from`), as [open brace, close brace], or null. */
function blockOf(text: string, re: RegExp, from = 0): [number, number] | null {
  const m = new RegExp(re.source, re.flags.replace('g', '')).exec(text.slice(from))
  if (!m) return null
  const open = text.indexOf('{', from + (m.index ?? 0) + m[0].length - 1)
  if (open < 0) return null
  const close = closeOf(text, open)
  return close < 0 ? null : [open, close]
}

export type W10Model = {
  text: string
  rootName: string
  enterpriseName: string
  /** Requirement and need IDs with their declared names, and each requirement's subject type as written. */
  /** limit: the requirement's own constraint, read when it has the form the Week 9 generator writes
   *  (subject.attribute OP limit, the limit an attribute of the requirement or a number), for the satisfy check. */
  requirements: { id: string; name: string; subjectPkg: string; subjectDef: string; limit?: ReqLimit }[]
  /** Requirement → function allocations Week 10 wrote. */
  allocatedReqFns: { req: string; fn: string }[]
  /** Functions in Logical: ID, declared name, and the items of their parameters (item reference as written). */
  functions: { id: string; name: string; items: string[] }[]
  /** The logical architecture: LOG ID, usage name, definition, performed functions. */
  logical: { id: string; usage: string; def: string; performs: string[] }[]
  /** Item definitions in Logical: INFO ID (or '') and declared name. */
  items: { id: string; name: string }[]
  /** Part definitions in Physical (Week 8 parts, Week 9 placeholders) with their attributes. */
  physicalDefs: { name: string; attributes: string[] }[]
  /** External systems in the Context package's part context: ID, usage name, definition. */
  externals: { id: string; usage: string; def: string }[]
  hasContextPart: boolean
  /** The name of the context part usage that holds the externals (Week 8: `context`). */
  contextPart: string
  contextDefs: string[]
  hasReqAttributes: boolean
  hasDerivation: boolean
  hasRationale: boolean
  /** Highest numbers anywhere in the text (IDs are never reused). */
  maxInfo: number
  packages: string[]
}

/** Reads a team's Week 10 model v0.3 (or a model v0.4 this tool wrote). Refuses other files and AeroLink with a reason
 *  the student can act on; never throws. */
export function readWeek10(raw: string): { model: W10Model } | { error: string } {
  const r = parseModel(raw)
  if ('error' in r) return r
  if (isAeroLink(r.model.rootName) || isAeroLink(r.model.enterpriseName)) return { error: 'This model is AeroLink, the instructor’s worked example: import your team’s own Week 10 model.' }
  return r
}
/** Parses a model v0.3 or v0.4 text (no AeroLink check: the AeroLink worked example uses it on the instructor model). */
export function parseModel(raw: string): { model: W10Model } | { error: string } {
  if (/^\s*[[{]/.test(raw)) return { error: 'This is a JSON file. Import your Week 10 model here (the .sysml file the Week 10 lab tool exported), and the Week 5 JSON file in the Week 5 field.' }
  if (/^\s*#\s/.test(raw) || /^\s*\|.*\|\s*$/m.test(raw.split('\n').slice(0, 5).join('\n'))) return { error: 'This looks like a Markdown file (the Week 10 behavior review). Import the model file (.sysml) the Week 10 lab tool exported.' }
  const text = stripGenerated(raw)
  const root = new RegExp(String.raw`(^|\n)[ \t]*package\s+(${NAME})\s*\{`).exec(text)
  if (!root) return { error: 'No package found: this is not a SysML v2 model file. Import the model v0.3 file (.sysml) your team exported from the Week 10 lab tool.' }
  const rootName = unq(root[2])
  const ent = /part def <'ENT-001'>\s*('(?:[^'\\]|\\.)*'|[A-Za-z_][A-Za-z0-9_]*)?/.exec(text)
  if (!ent) return { error: 'The model declares no enterprise (part def <\'ENT-001\'> in the Context package). Import the model v0.3 your team exported from the Week 10 lab tool.' }
  const pkgs = topPackages(text)
  const names = pkgs.map((p) => p.name)
  for (const need of ['Context', 'Stakeholders', 'Needs', 'Requirements', 'Logical', 'Physical', 'Behavior'])
    if (!names.includes(need)) return { error: `The model has no top-level ${need} package. The Week 11 tool fills the Physical package of model v0.3 and reads the others: restore the ${need} package (an empty package with a doc comment is enough) and import again.` }
  // the root package too (Week 11 review m5): an unclosed root would make the generated v0.4 fail the checker
  const rootOpen = (root.index ?? 0) + root[0].length - 1
  if (pkgs.some((p) => p.close < 0) || closeOf(text, rootOpen) < 0) return { error: 'A package in this file is not closed (a missing “}”). Run the file through the checker, correct it and import again.' }
  const body = (name: string) => {
    const p = pkgs.find((x) => x.name === name)!
    return { p, b: text.slice(p.open + 1, p.close) }
  }
  const reqIds = [...new Set([...text.matchAll(/requirement <'((?:REQ-(?:STK|SYS)|NEED|MGO)-\d{3})'>/g)].map((m) => m[1]))]
  if (!reqIds.some((x) => x.startsWith('REQ-'))) return { error: 'This model has no requirements yet: it looks like a Week 8 model v0.1. Import model v0.3, the file the Week 10 lab tool exported.' }
  const logical = body('Logical')
  const la = blockOf(text, /(^|\n)[ \t]*part logicalArchitecture\s*\{/g, logical.p.open)
  if (!la || la[0] > logical.p.close) return { error: 'This model has no logical architecture (part logicalArchitecture in the Logical package): it looks like model v0.2 from Week 9. Import model v0.3, the file the Week 10 lab tool exported, so the logical elements can be allocated to physical ones.' }

  // requirements with their names and subject types
  const requirements: W10Model['requirements'] = []
  for (const m of text.matchAll(/requirement <'((?:REQ-(?:STK|SYS)|NEED|MGO)-\d{3})'>\s*('(?:[^'\\]|\\.)*'|[A-Za-z_][A-Za-z0-9_]*)?[^{;]*([{;])/g)) {
    if (requirements.some((q) => q.id === m[1])) continue
    let subjectPkg = ''
    let subjectDef = ''
    let limit: ReqLimit | undefined
    if (m[3] === '{') {
      const open = (m.index ?? 0) + m[0].length - 1
      const close = closeOf(text, open)
      limit = limitOf(text.slice(open, close))
      const sub = /subject\s+[A-Za-z_][A-Za-z0-9_]*\s*:\s*([^;=]+);/.exec(text.slice(open, close))
      if (sub) {
        const t = sub[1].trim()
        const parts = t.split('::').map((x) => x.trim())
        subjectDef = unq(parts[parts.length - 1])
        subjectPkg = parts.length > 1 ? unq(parts[parts.length - 2]) : ''
      }
    }
    requirements.push({ id: m[1], name: m[2] ? unq(m[2]) : '', subjectPkg, subjectDef, ...(limit ? { limit } : {}) })
  }
  const allocatedReqFns = [...logical.b.matchAll(/allocate\s+(?:[^\s;]*::)?'((?:REQ-(?:STK|SYS))-\d{3})'\s+to\s+(?:[^\s;]*::)?'(FN-\d{3})'\s*;/g)].map((m) => ({ req: m[1], fn: m[2] }))

  // functions, items in Logical (members of the package)
  const functions: W10Model['functions'] = []
  for (const m of logical.b.matchAll(new RegExp(String.raw`(^|\n)[ \t]*action <'(FN-\d{3})'>\s*(${NAME})?\s*([{;])`, 'g'))) {
    const at = logical.p.open + 1 + (m.index ?? 0) + m[0].length - 1
    if (depthAt(text, at) !== 2 && !(m[4] === '{' && depthAt(text, at) === 2)) continue
    let items: string[] = []
    if (m[4] === '{') {
      const close = closeOf(text, at)
      items = [...text.slice(at, close).matchAll(/(?:^|\n)[ \t]*(?:in|out|inout)\s+[A-Za-z_][A-Za-z0-9_]*\s*:\s*([^;]+);/g)].map((x) => unq(x[1].trim().split('::').pop()!.trim()))
    }
    functions.push({ id: m[2], name: m[3] ? unq(m[3]) : '', items })
  }
  const items: W10Model['items'] = []
  for (const m of logical.b.matchAll(new RegExp(String.raw`(^|\n)[ \t]*item def\s+(?:<'(INFO-\d{3})'>\s*)?(${NAME})`, 'g'))) {
    if (depthAt(text, logical.p.open + 1 + (m.index ?? 0) + m[0].length) !== 2) continue
    items.push({ id: m[2] ?? '', name: unq(m[3]) })
  }
  const logicalParts: W10Model['logical'] = []
  const laText = text.slice(la[0], la[1])
  for (const m of laText.matchAll(new RegExp(String.raw`(^|\n)[ \t]*part <'(LOG-\d{3})'>\s*([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(${NAME})\s*([{;])`, 'g'))) {
    let performs: string[] = []
    if (m[5] === '{') {
      const open = la[0] + (m.index ?? 0) + m[0].length - 1
      const close = closeOf(text, open)
      performs = [...text.slice(open, close).matchAll(/perform\s+(?:[^\s;]*::)?'(FN-\d{3})'\s*;/g)].map((x) => x[1])
    }
    logicalParts.push({ id: m[2], usage: m[3], def: unq(m[4]), performs })
  }

  // part definitions in Physical, with their attributes
  const physical = body('Physical')
  const physicalDefs: W10Model['physicalDefs'] = []
  for (const m of physical.b.matchAll(new RegExp(String.raw`(^|\n)[ \t]*part def\s+(?:<'[^']*'>\s*)?(${NAME})[^{;]*([{;])`, 'g'))) {
    const at = physical.p.open + 1 + (m.index ?? 0) + m[0].length - 1
    if (depthAt(text, at) !== 2) continue
    let attributes: string[] = []
    if (m[3] === '{') {
      const close = closeOf(text, at)
      attributes = [...text.slice(at, close).matchAll(/(?:^|\n)[ \t]*attribute\s+([A-Za-z_][A-Za-z0-9_]*)\s*:/g)].map((x) => x[1])
    }
    physicalDefs.push({ name: unq(m[2]), attributes })
  }

  // externals in the context
  const ctx = body('Context')
  // the Week 8 context part: the part usage of the Context package that holds the external systems (normally `context`)
  let cp: [number, number] | null = null
  let contextPart = ''
  for (const m of ctx.b.matchAll(/(^|\n)[ \t]*part ([A-Za-z_][A-Za-z0-9_]*)\s*\{/g)) {
    const open = ctx.p.open + 1 + (m.index ?? 0) + m[0].length - 1
    if (depthAt(text, open) !== 2) continue
    const close = closeOf(text, open)
    if (close > 0 && /part <'EXT-\d{3}'>/.test(text.slice(open, close))) {
      cp = [open, close]
      contextPart = m[2]
      break
    }
  }
  const hasContextPart = !!cp
  const externals = hasContextPart ? [...text.slice(cp![0], cp![1]).matchAll(/part <'(EXT-\d{3})'>\s*([A-Za-z_][A-Za-z0-9_]*)\s*:\s*('(?:[^'\\]|\\.)*'|[A-Za-z_][A-Za-z0-9_]*)/g)].map((m) => ({ id: m[1], usage: m[2], def: unq(m[3]) })) : []
  const contextDefs = [...ctx.b.matchAll(new RegExp(String.raw`(^|\n)[ \t]*part def\s+(?:<'[^']*'>\s*)?(${NAME})`, 'g'))].filter((m) => depthAt(text, ctx.p.open + 1 + (m.index ?? 0) + m[0].length) === 2).map((m) => unq(m[2]))
  const maxOf = (re: RegExp) => Math.max(0, ...[...raw.matchAll(re)].map((m) => Number(m[1])))
  return {
    model: {
      text,
      rootName,
      enterpriseName: ent[1] ? unq(ent[1]) : '',
      requirements,
      allocatedReqFns,
      functions,
      logical: logicalParts,
      items,
      physicalDefs,
      externals,
      hasContextPart,
      contextPart,
      contextDefs,
      hasReqAttributes: /metadata def RequirementAttributes\b/.test(body('Requirements').b),
      hasDerivation: /import RequirementDerivation::/.test(text),
      hasRationale: /import ModelingMetadata::/.test(text),
      maxInfo: maxOf(/INFO-(\d{3})/g),
      packages: names,
    },
  }
}

// ---------------------------------------------------------------------------------------------- the team's choices
/** One crossing of an interface: the item (an INFO ID, or the name of an item in the model or added this week) and its
 *  direction relative to the interface's two ends. */
export type FlowRow = { item: string; dir: 'AtoB' | 'BtoA' }
/** An item the team adds this week. An information item gets the next INFO ID; energy and material items are named. */
export type NewItem = { id: string; name: string; kind: 'information' | 'energy' | 'material' | 'load' }
/** The kinds of what crosses a physical or information interface (Week 5: information; energy, material, mechanical load). */
export const ITEM_KINDS: { id: NewItem['kind']; label: string }[] = [
  { id: 'information', label: 'information' },
  { id: 'energy', label: 'energy' },
  { id: 'material', label: 'material' },
  { id: 'load', label: 'mechanical load' },
]
/** A satisfy claim: the requirement, the element that satisfies it (PHY, CMP or IF ID), the design value of one of the
 *  subject's attributes (optional) and the basis the team would defend. */
export type SatisfyClaim = { req: string; by: string; attribute: string; value: string; basis: string }
export type W11Choices = {
  /** Week 8 or 9 part definition in Physical → the physical element it stands for (PHY ID, or '' for none). */
  placeholders: Record<string, string>
  /** Function → the physical element that performs it, where the Week 4 placement is missing or changed. */
  fnPhy: Record<string, string>
  /** Interface → its crossings, once the team has set them; absent means computed from the Week 5 record. */
  flows: Record<string, FlowRow[]>
  newItems: NewItem[]
  /** Interface requirement → the functions it is allocated to (IDs typed); absent means the tool's suggestion. */
  reqFns: Record<string, string>
  /** Rows of requirement → the physical elements it is allocated to (PHY or CMP IDs typed). Each row has a stable row
   *  number, so typing a requirement ID never re-keys or merges rows (Week 11 review N3). */
  reqParts: ReqPartRow[]
  satisfy: SatisfyClaim[]
}
export type ReqPartRow = { row: number; req: string; els: string }
export const EMPTY_CHOICES: W11Choices = { placeholders: {}, fnPhy: {}, flows: {}, newItems: [], reqFns: {}, reqParts: [], satisfy: [] }

export type GenOptions = {
  date?: string
  header?: string[]
  /** Root package name in the output (default: the Week 10 name, "v0.3" becoming "v0.4"). */
  packageName?: string
  origin?: string
}

// ---------------------------------------------------------------------------------------------- findings
export type W11Finding = { cls: W11FindingClass; id: string; code: string; text: string }
export const findingKey = (f: W11Finding) => `${f.cls}:${f.code}:${f.id}`
/** Gaps the tool cannot fix itself (the team writes a disposition); every other gap is fixed in the tool. */
export const DISPOSABLE_GAPS = new Set(['placeholder-unlinked', 'phy-idle', 'if-no-flow', 'name-clash', 'item-unused', 'flow-against-producer'])
/** Findings that need a team disposition in the audit. */
/** The code without the -2, -3 suffix a repeated finding on the same ID takes. */
export const baseCode = (code: string) => code.replace(/-\d+$/, '')
export const needsDisposition = (f: W11Finding) => f.cls === 'trace' || (f.cls === 'gap' && DISPOSABLE_GAPS.has(baseCode(f.code)))

/** Whether a text claims the work is done: a claim word at the start followed by nothing, punctuation or a short
 *  connective ("Fixed", "Resolved in Week 4", "Done: …"), a claim word after a form of "be" or "now"/"already" ("is
 *  fixed", "now resolved"), or one with an object pronoun ("fixed it"). A claim word used as an adjective ("Closed site at
 *  night: no function") is not a claim (Week 10 review m7). */
export function claimsCompletion(text: string): boolean {
  const w = COMPLETION_CLAIM.source.replace(/^\b\(|\)\b$/g, '')
  const lead = new RegExp(String.raw`^\s*(?:${w})(?=\s*(?:$|[.,;:!—–-]|\b(?:in|by|on|at|with|via|through|as|now|already|and|it|this|that|the|them)\b))`, 'i')
  const be = new RegExp(String.raw`\b(?:is|are|was|were|been|be|now|already)\s+(?:all\s+|fully\s+)?(?:${w})\b`, 'i')
  const obj = new RegExp(String.raw`\b(?:${w})\s+(?:it|this|that|them)\b`, 'i')
  return lead.test(text) || be.test(text) || obj.test(text)
}
/** Validity of a disposition: written, not an empty answer, and not a claim that the finding is fixed (it is computed
 *  from the imports and the choices, so while it is listed it is not fixed). Future or modal plans are accepted. */
export function dispositionProblem(text: string): string | null {
  const t = text.trim()
  if (!said(t) || isEmptyEveryWord(t)) return 'Write what the team will do and why (an open item with an owner, or why no change is needed); “none”, “n/a” or “later” is not a disposition.'
  const claimed = t.replace(/\b(?:(?:to|will|shall|would) be |once (?:it is |this is |the \w+ is )?|until (?:it is )?|when (?:it is )?)(?:\w+ )?(?:fixed|resolved|done|closed|corrected|completed?)\b/gi, '')
  if (claimsCompletion(claimed)) return 'This reads as a fix, but the finding is still computed from your imports and choices: change the choice in the tool, or correct the Week 5 file and import it again. If this is a plan, write it as one (for example “to be resolved in Week 12, owner JS”).'
  return null
}
/** Validity of a satisfy claim's basis: a design value, analysis or estimate the team would defend. */
export function basisProblem(text: string): string | null {
  return saidSomething(text) ? null : 'Write the basis of the claim: the design value and where it comes from (an analysis, an estimate, a supplier figure). A satisfy is an assertion the model makes; Week 12 plans how to verify it.'
}
export type ReqLimit = { attr: string; op: '<=' | '<' | '>=' | '>' | '=='; value: number; unit: string }
const FLIP: Record<ReqLimit['op'], ReqLimit['op']> = { '<=': '>=', '<': '>', '>=': '<=', '>': '<', '==': '==' }
const unitOf = (u: string | undefined) => (u ?? '').replace(/[[\]'\s]/g, '')
/** The limit of a requirement body's require constraint, when the constraint compares one attribute of the subject
 *  with a number or with an attribute of the requirement that has a value; otherwise undefined (nothing is compared). */
export function limitOf(body: string): ReqLimit | undefined {
  const c = /require\s+constraint\s*\{([^}]*)\}/.exec(body)
  if (!c) return undefined
  const NUM = /^(-?\d+(?:\.\d+)?)$/
  const side = /^(?:[A-Za-z_][A-Za-z0-9_]*\.)?([A-Za-z_][A-Za-z0-9_]*)$/
  const e = /^\s*(\S+)\s*(<=|>=|==|<|>)\s*(\S+)\s*$/.exec(c[1])
  if (!e) return undefined
  const limitValue = (t: string): { value: number; unit: string } | undefined => {
    if (NUM.test(t)) return { value: Number(t), unit: '' }
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(t)) return undefined
    const a = new RegExp(String.raw`attribute\s+${t}\b[^=;]*=\s*(-?\d+(?:\.\d+)?)\s*(\[[^\]]*\])?\s*;`).exec(body)
    return a ? { value: Number(a[1]), unit: unitOf(a[2]) } : undefined
  }
  const op = e[2] as ReqLimit['op']
  if (/\./.test(e[1]) && side.test(e[1])) {
    const l = limitValue(e[3])
    return l ? { attr: side.exec(e[1])![1], op, ...l } : undefined
  }
  if (/\./.test(e[3]) && side.test(e[3])) {
    const l = limitValue(e[1])
    return l ? { attr: side.exec(e[3])![1], op: FLIP[op], ...l } : undefined
  }
  return undefined
}
/** Whether a design value (VALUE form) meets the limit: true, false, or 'unit' when the units differ. */
export function meetsLimit(value: string, limit: ReqLimit): boolean | 'unit' {
  const m = /^(-?\d+(?:\.\d+)?)\s*(\[.*\])?$/.exec(value.trim())
  if (!m) return 'unit'
  if (unitOf(m[2]) !== limit.unit) return 'unit'
  const v = Number(m[1])
  return limit.op === '<=' ? v <= limit.value : limit.op === '<' ? v < limit.value : limit.op === '>=' ? v >= limit.value : limit.op === '>' ? v > limit.value : v === limit.value
}
/** A design value: a number, with an optional unit in brackets ("18 [min]", "63.5 [dB]", "0.2"). */
export const VALUE = /^-?\d+(?:\.\d+)?(?:\s*\[\s*(?:'[^'\]]+'|[A-Za-z%][A-Za-z0-9_/*^%]*)\s*\])?$/

// ---------------------------------------------------------------------------------------------- naming
const T = (n: number) => '\t'.repeat(n)
const sentence = (s: string) => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`)
const strLit = (s: string) => `"${ascii(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
/** Features every part, port or connection already has (Parts, Items, Ports and Occurrences libraries), which a generated
 *  usage, port or end must not shadow. */
export const PART_TAKEN = new Set([
  'self', 'this', 'that', 'start', 'done', 'time', 'parts', 'ports', 'items', 'subparts', 'subitems', 'subports', 'shape', 'boundingShapes', 'envelopingShapes', 'voids', 'isSolid',
  'exhibitedStates', 'ownedActions', 'ownedPorts', 'ownedStates', 'performedActions', 'interfacingPorts', 'occurrences', 'suboccurrences', 'portionOf', 'portionOfLife', 'timeSlices',
  'snapshots', 'localClock', 'successors', 'predecessors', 'incomingTransfers', 'outgoingTransfers', 'source', 'target', 'participant', 'sourceParticipant', 'targetParticipant',
  'connections', 'interfaces', 'allocations', 'actions', 'states', 'flows', 'messages', 'enterprise', 'context', 'soi', 'physicalArchitecture', 'logicalArchitecture', 'payload',
])
function uniqueIn(taken: Set<string>, n: string): string {
  let k = n
  for (let i = 2; taken.has(k); i++) k = `${n}${i}`
  taken.add(k)
  return k
}
const cap = (s: string) => s.replace(/^[a-z]/, (c) => c.toUpperCase())
/** A reference to a part, port, interface or item definition of the Physical package, resolved when the text is written:
 *  quoted, or qualified with the package when a feature in scope has the same name (a component or a performed function
 *  named like a definition would otherwise be found first, and `part x : 'x'` would refer to itself). */
const TY = (def: string) => `${def}`
const PACKAGES = ['Context', 'Stakeholders', 'Needs', 'Requirements', 'Physical', 'Logical', 'Behavior', 'Verification', 'Analysis', 'AROU', 'Evolution']
const METHOD: Record<string, string> = { inspection: 'inspect', analysis: 'analyze', demonstration: 'demo', test: 'test' }

// ---------------------------------------------------------------------------------------------- generation types
export type ItemRef = { id: string; name: string; ref: string; origin: 'Week 4' | 'Week 10' | 'Week 11' }
export type PartOut = { id: string; usage: string; def: string; specializes: string[]; components: { id: string; usage: string; def: string }[]; performs: string[]; values: { attribute: string; value: string }[] }
export type FlowOut = { item: string; itemName: string; dir: 'AtoB' | 'BtoA'; from: string; to: string; feature: string }
export type InterfaceOut = { id: string; name: string; kind: string; usage: string; def: string; portDef: string; endA: string; endB: string; pathA: string; pathB: string; flows: FlowOut[]; requirements: string[]; assumed: boolean }
export type Generated = {
  text: string
  findings: W11Finding[]
  items: ItemRef[]
  parts: PartOut[]
  externals: { id: string; usage: string; added: boolean }[]
  interfaces: InterfaceOut[]
  /** Function → the physical element that performs it (model functions only). */
  placements: { fn: string; phy: string }[]
  /** Logical element → physical element, with the functions allocated in the nested allocations. */
  allocations: { log: string; phy: string; fns: string[] }[]
  /** Requirement allocations written this week: to an interface (IF), a function (FN) or a physical element (PHY/CMP). */
  reqAllocations: { req: string; to: string }[]
  satisfied: { req: string; by: string; attribute: string; value: string }[]
  addedReqs: string[]
  addedExts: string[]
  /** IDs issued this week (new information items), for the review. */
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

/** The level-1 element of an interface end: a component's parent, an AI capability's host, else the end itself. */
function level1(phys: W11Phys, id: string): string {
  const c = phys.components.find((x) => x.id === id)
  if (c) return c.parent
  const a = phys.ai.find((x) => x.id === id)
  if (a) return a.host
  return id
}
const flowItemsOf = (s: string) =>
  s
    .replace(/\(.*?\)/g, ' ')
    .replace(/\bINFO-\d{3}\b/gi, ' ')
    .split(/[,;]|\band\b/i)
    .map((x) => x.trim())
    .filter((x) => x.length > 1)

/** The crossings Week 5 records for an interface, with a direction for each: computed from the Week 4 producers and
 *  consumers for an information item, read from the direction text ("PHY-004 → PHY-005") for anything else, and
 *  assumed from end A to end B where neither tells. Organizational interfaces carry nothing. */
export function defaultFlows(x: W11Interface, phys: W11Phys): { rows: FlowRow[]; assumed: boolean } {
  if (x.kind === 'organizational') return { rows: [], assumed: false }
  const a = level1(phys, x.endA)
  const b = level1(phys, x.endB)
  const rows: FlowRow[] = []
  let assumed = false
  for (const id of upIds(x.crosses, /INFO-\d{3}/g)) {
    const info = phys.information.find((y) => y.id === id)
    const prods = (info?.producers ?? []).map((p) => level1(phys, p))
    const cons = (info?.consumers ?? []).map((p) => level1(phys, p))
    const pa = prods.includes(a)
    const pb = prods.includes(b)
    const ca = cons.includes(a)
    const cb = cons.includes(b)
    if (pa && !pb) rows.push({ item: id, dir: 'AtoB' })
    else if (pb && !pa) rows.push({ item: id, dir: 'BtoA' })
    else if (cb && !ca) rows.push({ item: id, dir: 'AtoB' })
    else if (ca && !cb) rows.push({ item: id, dir: 'BtoA' })
    else {
      rows.push({ item: id, dir: 'AtoB' })
      assumed = true
    }
  }
  const d = x.direction.toUpperCase()
  const ia = d.indexOf(x.endA)
  const ib = d.indexOf(x.endB)
  const arrow = /→|->|>/.test(x.direction)
  for (const phrase of flowItemsOf(x.crosses)) {
    if (arrow && ia >= 0 && ib >= 0) rows.push({ item: phrase, dir: ia < ib ? 'AtoB' : 'BtoA' })
    else {
      rows.push({ item: phrase, dir: 'AtoB' })
      assumed = true
    }
  }
  return { rows, assumed }
}

/** Functions of the model placed on an end of the interface whose parameters use an item it carries: the suggestion
 *  for an interface requirement's allocation. */
export function suggestedFunctions(m: W10Model, phys: W11Phys, x: W11Interface, rows: FlowRow[], c: W11Choices = EMPTY_CHOICES): string[] {
  const ends = [level1(phys, x.endA), level1(phys, x.endB)]
  const infoIds = rows.map((r) => r.item.toUpperCase()).filter((i) => /^INFO-\d{3}$/.test(i))
  const names = rows.map((r) => r.item.toLowerCase())
  return m.functions
    .filter((f) => ends.includes(c.fnPhy[f.id]?.trim().toUpperCase() || phys.functions.find((y) => y.id === f.id)?.phy || ''))
    .filter((f) => f.items.some((it) => infoIds.includes(it.toUpperCase()) || names.includes(it.toLowerCase()) || names.includes((m.items.find((y) => y.id === it)?.name ?? '').toLowerCase())))
    .map((f) => f.id)
}

// ---------------------------------------------------------------------------------------------- generation
/** The model v0.4 text, the tables the review reads and the findings. Deterministic for given sources and choices. */
export function generateModel(m: W10Model, phys: W11Phys, choices: W11Choices, opts: GenOptions = {}): Generated {
  const findings: W11Finding[] = []
  // one finding per row: a code repeated on the same ID (two rows of one interface with the same problem) takes a -2,
  // -3 suffix, so finding keys stay unique (Week 10 C1; Week 11 review N2)
  const seenCodes = new Map<string, number>()
  const add = (cls: W11FindingClass, id: string, code: string, text: string) => {
    const k = `${id}|${code}`
    const n = (seenCodes.get(k) ?? 0) + 1
    seenCodes.set(k, n)
    findings.push({ cls, id, code: n > 1 ? `${code}-${n}` : code, text })
  }
  const c: W11Choices = { ...EMPTY_CHOICES, ...choices }
  const reqById = new Map(m.requirements.map((q) => [q.id, q]))
  const phyIds = new Set(phys.physical.map((p) => p.id))
  const fnIds = new Set(m.functions.map((f) => f.id))

  // ---- names in Physical never hide a package; then every cross-package reference is qualified from the root
  const rootName = opts.packageName ?? (/v0\.3$/.test(m.rootName) ? m.rootName.replace(/v0\.3$/, 'v0.4') : m.rootName)
  const rootQ = quoted(rootName)
  const newNames = [...phys.physical.map((p) => p.name), ...phys.components.map((x) => x.name), ...phys.interfaces.map((x) => x.name), ...c.newItems.map((x) => x.name), ...phys.requirements.map((q) => q.name), ...phys.externals.map((x) => x.name)].map((n) => ascii(n))
  const hides = newNames.some((n) => PACKAGES.includes(n))
  const pk = (p: string) => (hides ? `${rootQ}::${p}` : p)
  if (hides) add('gap', 'NAMES', 'name-clash', `A physical element, component, interface, item, requirement or external is named like one of the model’s packages (${[...new Set(newNames.filter((n) => PACKAGES.includes(n)))].join(', ')}): inside its package that name would hide the package, so every reference to another package is qualified from the root package. The file resolves; a more specific name is clearer.`)

  // declared names in Physical: the existing part definitions, then this week's; a repeat is renamed "name (ID)"
  const existingDefs = m.physicalDefs.map((d) => d.name)
  const declTaken = new Set<string>([...existingDefs, 'physicalArchitecture'])
  const declName = (id: string, name: string, what: string) => {
    const n = ascii(name) || id
    if (!declTaken.has(n)) {
      declTaken.add(n)
      return n
    }
    let alt = `${n} (${id})`
    for (let i = 2; declTaken.has(alt); i++) alt = `${n} (${id}, ${i})`
    declTaken.add(alt)
    if (!existingDefs.includes(n) || what !== 'part') add('gap', id, 'name-clash', `${id} is named “${n}”, which is also the name of another ${what === 'part' ? 'element' : what} in the Physical package; it is written “${alt}” so that every name in the package stays distinct. Rename it in the Week 5 record if the two are different things.`)
    return alt
  }

  // ---- items: the model's (Logical), then this week's (Physical; information items with the next INFO IDs)
  const items: ItemRef[] = []
  for (const it of m.items) items.push({ id: it.id || it.name, name: it.name || it.id, ref: it.id ? `${pk('Logical')}::'${it.id}'` : `${pk('Logical')}::${quoted(it.name)}`, origin: it.id ? 'Week 4' : 'Week 10' })
  const issued: string[] = []
  const newItemDecls: { name: string; id: string; kind: string }[] = []
  for (const x of c.newItems) {
    const name = ascii(x.name)
    if (!name) continue
    if (x.kind === 'information' && /^INFO-\d{3}$/.test(x.id)) {
      if (items.some((y) => y.id === x.id)) {
        add('defect', x.id, 'item-id-taken', `${x.id} is already an item of your model: the new item “${name}” is left out. Remove it, or use the existing item.`)
        continue
      }
      const nm = declName(x.id, name, 'item')
      items.push({ id: x.id, name, ref: TY(nm), origin: 'Week 11' })
      newItemDecls.push({ name: nm, id: x.id, kind: x.kind })
      issued.push(x.id)
    } else {
      const nm = declName(name, name, 'item')
      items.push({ id: name, name, ref: TY(nm), origin: 'Week 11' })
      newItemDecls.push({ name: nm, id: '', kind: x.kind })
    }
  }
  const itemOf = (key: string) => {
    const k = key.trim()
    if (/^info-\d{3}$/i.test(k)) return items.find((x) => x.id === k.toUpperCase())
    const lk = nameKey(k)
    return items.find((x) => x.origin === 'Week 11' && nameKey(x.name) === lk) ?? items.find((x) => nameKey(x.name) === lk)
  }

  // ---- usage names inside physicalArchitecture
  const usageTaken = new Set<string>(PART_TAKEN)
  // externals: the model's context, plus those Week 5 added (written into the context)
  const extOut: Generated['externals'] = []
  const addedExtDefs: string[] = []
  const addedExtUsages: string[] = []
  const extState = new Map<string, { ok: boolean; ctxUsage: string; added: boolean; name: string }>()
  const ctxUsageTaken = new Set<string>([...m.externals.map((x) => x.usage), 'systemOfInterest', ...PART_TAKEN])
  const ctxDefTaken = new Set<string>(m.contextDefs)
  const extName = (id: string) => phys.externals.find((x) => x.id === id)?.name || m.externals.find((x) => x.id === id)?.def || id
  const resolveExt = (id: string) => {
    if (extState.has(id)) return extState.get(id)!
    const inModel = m.externals.find((x) => x.id === id)
    const w5 = phys.externals.find((x) => x.id === id)
    let st: { ok: boolean; ctxUsage: string; added: boolean; name: string }
    if (inModel) {
      const same = !w5 || !w5.name || nameKey(w5.name) === nameKey(inModel.def) || nameKey(basicName(w5.name, '')) === nameKey(inModel.usage)
      if (!same) add('defect', id, 'ext-collision', `${id} is “${w5!.name}” in your Week 5 file but “${inModel.def}” in your model: the same ID names two different externals, so the interfaces of ${id} are left out. IDs are never renumbered: correct the Week 5 record (issue the next free EXT ID there) and import again.`)
      st = { ok: same, ctxUsage: inModel.usage, added: false, name: inModel.def }
    } else if (w5) {
      const def = ctxDefTaken.has(ascii(w5.name) || id) ? ascii(w5.name) || id : ascii(w5.name) || id
      if (!ctxDefTaken.has(def)) {
        ctxDefTaken.add(def)
        addedExtDefs.push(`part def ${quoted(def)} { doc /* External system added in Week 11 from the ${w5.origin} record. */ }`)
      }
      const u = uniqueIn(ctxUsageTaken, basicName(w5.name, `external${num(id)}`))
      addedExtUsages.push(`part <'${id}'> ${u} : ${quoted(def)};`)
      add('info', id, 'ext-added', `${id} ${w5.name} is an external of your ${w5.origin} record that the model did not have: it is added to the context, after the model’s own externals.`)
      st = { ok: true, ctxUsage: u, added: true, name: w5.name }
    } else {
      st = { ok: false, ctxUsage: '', added: false, name: id }
    }
    extState.set(id, st)
    return st
  }

  // ---- physical elements and components
  const linkOf = new Map<string, string[]>()
  for (const [ph, phy] of Object.entries(c.placeholders)) {
    if (!existingDefs.includes(ph) || ph === 'System of interest') continue
    if (phy && phyIds.has(phy)) linkOf.set(phy, [...(linkOf.get(phy) ?? []), ph])
  }
  const parts: PartOut[] = []
  const newDefs: string[] = []
  for (const p of phys.physical) {
    const name = ascii(p.name) || p.id
    const same = existingDefs.includes(name) && name !== 'System of interest'
    const linked = (linkOf.get(p.id) ?? []).filter((x) => x !== name)
    const def = same ? name : declName(p.id, name, 'part')
    if (!same) newDefs.push(`part def ${quoted(def)}${linked.length ? ` :> ${linked.map(quoted).join(', ')}` : ''}${p.text ? ` { doc /* ${docText(sentence(p.text))} */ }` : ';'}`)
    const usage = uniqueIn(usageTaken, basicName(p.name, `element${num(p.id)}`))
    parts.push({ id: p.id, usage, def, specializes: same ? [] : linked, components: [], performs: [], values: [] })
  }
  for (const ph of existingDefs.filter((x) => x !== 'System of interest')) {
    if (!parts.some((pt) => pt.def === ph || pt.specializes.includes(ph))) add('gap', ph, 'placeholder-unlinked', `The part definition “${ph}” in Physical (written in Week 8 or Week 9${m.requirements.some((q) => q.subjectDef === ph) ? ', the subject of a requirement' : ''}) is not linked to a physical element. Link it to the element it stands for, so the element’s definition specializes it, or record why it stays separate.`)
  }
  const cmpDefs: string[] = []
  for (const x of phys.components) {
    const parent = parts.find((pt) => pt.id === x.parent)
    if (!parent) {
      add('defect', x.id, 'cmp-parent-missing', `${x.id} belongs to ${x.parent || 'no element'}, which is not a physical element of your Week 5 file: the component is left out (it would have no parent). Correct its parent in the Week 5 record and import again.`)
      continue
    }
    const def = declName(x.id, x.name || x.id, 'component')
    cmpDefs.push(`part def ${quoted(def)}${x.responsibility || x.kind || x.functions.length ? ` { doc /* ${docText([x.responsibility ? sentence(x.responsibility) : '', x.kind ? `Kind: ${x.kind}.` : '', x.functions.length ? `Week 5 functions: ${x.functions.join(', ')} (performed by ${parent.id} in this model).` : ''].filter(Boolean).join(' '))} */ }` : ';'}`)
    const taken = new Set<string>([...PART_TAKEN, ...parent.components.map((y) => y.usage)])
    parent.components.push({ id: x.id, usage: uniqueIn(taken, basicName(x.name, `component${num(x.id)}`)), def })
  }

  // ---- functions placed on physical elements (level 1)
  const placements: Generated['placements'] = []
  for (const f of m.functions) {
    const chosen = c.fnPhy[f.id]?.trim().toUpperCase()
    const w4 = phys.functions.find((y) => y.id === f.id)?.phy ?? ''
    const phy = chosen || w4
    if (!phy) {
      add('trace', f.id, 'fn-no-physical', `${f.id} ${f.name || ''} is performed by no physical element: no Week 4 placement and no choice here. SEBoK asks for an allocation matrix of functional to physical elements: choose the element that performs it, or record why none does.`)
      continue
    }
    const pt = parts.find((x) => x.id === phy)
    if (!pt) {
      add('defect', f.id, 'fn-phy-missing', `${f.id} is placed on ${phy}, which is not a physical element of your Week 5 file: the perform is left out (it would not resolve). Choose a physical element, or correct the placement and import again.`)
      continue
    }
    pt.performs.push(f.id)
    placements.push({ fn: f.id, phy })
  }
  for (const f of phys.functions) if (!fnIds.has(f.id)) add('defect', f.id, 'fn-missing', `${f.id} is placed on ${f.phy || 'no element'} in your Week 4 snapshot, but it is not a function in your model: the perform is left out. Model the function in Week 10, or correct the Week 4 record.`)
  for (const pt of parts) if (!pt.performs.length) add('gap', pt.id, 'phy-idle', `${pt.id} performs no function. That is right for a medium or an enabling element (a network, a building) whose job is to carry or host; otherwise place a function on it, or record why it has none.`)

  // ---- interfaces
  const endPath = new Map<string, string>()
  const pathOf = (id: string): string | null => {
    if (endPath.has(id)) return endPath.get(id)!
    let p: string | null = null
    const pt = parts.find((x) => x.id === id)
    if (pt) p = pt.usage
    const cmp = parts.flatMap((x) => x.components.map((y) => ({ ...y, parent: x.usage }))).find((y) => y.id === id)
    if (cmp) p = `${cmp.parent}.${cmp.usage}`
    const ai = phys.ai.find((x) => x.id === id)
    if (ai) {
      const host = parts.find((x) => x.id === ai.host)
      if (host) p = host.usage
    }
    if (/^EXT-\d{3}$/.test(id)) {
      const st = resolveExt(id)
      if (st.ok) {
        let o = extOut.find((x) => x.id === id)
        if (!o) {
          o = { id, usage: uniqueIn(usageTaken, basicName(st.name, `external${num(id)}`)), added: st.added }
          extOut.push(o)
        }
        p = o.usage
      }
    }
    if (p) endPath.set(id, p)
    return p
  }
  const portLines = new Map<string, string[]>()
  const addPort = (path: string, line: string) => portLines.set(path, [...(portLines.get(path) ?? []), line])
  const portTaken = new Map<string, Set<string>>()
  const shadowNames = new Set<string>()
  const portDefs: string[][] = []
  const ifDefs: string[][] = []
  const ifUsages: string[] = []
  const interfaces: InterfaceOut[] = []
  const nameOfEnd = (id: string) => phys.physical.find((p) => p.id === id)?.name || phys.components.find((x) => x.id === id)?.name || phys.ai.find((x) => x.id === id)?.name || extName(id)
  for (const x of phys.interfaces) {
    const pa = x.endA ? pathOf(x.endA) : null
    const pb = x.endB ? pathOf(x.endB) : null
    if (!pa || !pb) {
      const missing = [!pa ? x.endA || '(no end A)' : '', !pb ? x.endB || '(no end B)' : ''].filter(Boolean)
      if (!missing.some((e) => /^EXT-\d{3}$/.test(e) && m.externals.some((y) => y.id === e) && !extState.get(e)?.ok)) add('defect', x.id, 'end-missing', `${x.id} ${x.name || ''} joins ${missing.join(' and ')}, which ${missing.length > 1 ? 'are' : 'is'} not a physical element, component, AI capability or external of your Week 5 file: the interface is left out (its port would not resolve). Correct the end in the Week 5 record and import again.`)
      else add('defect', x.id, 'end-collision', `${x.id} ${x.name || ''} joins ${missing.join(' and ')}, whose ID names a different external in your model: the interface is left out until the Week 5 record is corrected.`)
      continue
    }
    const ifName = x.name || x.id
    const usage = uniqueIn(usageTaken, basicName(ifName, `interface${num(x.id)}`))
    if (x.kind === 'organizational') {
      const doc = [`Organizational interface ${x.id}: ${sentence(ifName)}`, x.medium ? `Agreement: ${sentence(x.medium)}` : '', x.constraint ? `Constraint: ${sentence(x.constraint)}` : '', 'Nothing flows: it records an agreement between owners.'].filter(Boolean).join(' ')
      ifUsages.push(`connection <'${x.id}'> ${usage} connect ${pa} to ${pb} {`, `${T(1)}doc /* ${docText(doc)} */`, '}')
      interfaces.push({ id: x.id, name: ifName, kind: x.kind, usage, def: '', portDef: '', endA: x.endA, endB: x.endB, pathA: pa, pathB: pb, flows: [], requirements: x.requirements, assumed: false })
      continue
    }
    const explicit = c.flows[x.id]
    const dflt = explicit ? { rows: explicit, assumed: false } : defaultFlows(x, phys)
    if (dflt.assumed) add('gap', x.id, 'flow-direction-assumed', `${x.id}: the direction of ${dflt.rows.length > 1 ? 'a crossing' : 'its crossing'} could not be read from your Week 5 record (no producer or consumer at either end, or no direction text), so the tool assumed end A (${x.endA}) to end B (${x.endB}). Confirm or change each direction in the tool.`)
    const ifDef = declName(x.id, ifName, 'interface')
    const portDef = declName(x.id, `${ifName} port`, 'port')
    const featTaken = new Set<string>(PART_TAKEN)
    const flows: FlowOut[] = []
    const featLines: string[] = []
    for (const row of dflt.rows) {
      const it = itemOf(row.item)
      if (!it) {
        add('defect', x.id, `flow-item-missing-${nameKey(row.item) || 'empty'}`, `${x.id}: “${row.item}” crosses it, but it is neither an item of your model nor an item added here: the crossing is left out (it would not resolve). Add it under “New items”, or name an existing item (an INFO ID or the item’s name).`)
        continue
      }
      if (flows.some((f) => f.item === it.id && f.dir === row.dir)) continue
      // a crossing the team set against the Week 4 producers and consumers of an information item
      if (explicit && /^INFO-\d{3}$/.test(it.id)) {
        const info = phys.information.find((y) => y.id === it.id)
        const src = level1(phys, row.dir === 'AtoB' ? x.endA : x.endB)
        const dst = level1(phys, row.dir === 'AtoB' ? x.endB : x.endA)
        const prods = (info?.producers ?? []).map((p) => level1(phys, p))
        if (info && prods.length && !prods.includes(src) && prods.includes(dst) && !dflt.rows.some((r) => r !== row && itemOf(r.item)?.id === it.id && r.dir !== row.dir)) add('gap', `${x.id} ${it.id}`, 'flow-against-producer', `${x.id}: ${it.id} is set to flow from ${src} to ${dst}, but your Week 4 information view has ${dst} produce it and not ${src}. Turn the crossing round, or record why the item flows this way.`)
      }
      const both = dflt.rows.some((r) => r !== row && itemOf(r.item)?.id === it.id && r.dir !== row.dir)
      const base = basicName(it.name, 'item')
      const feature = uniqueIn(featTaken, both ? `${base}${row.dir === 'AtoB' ? 'Out' : 'In'}` : base)
      shadowNames.add(feature)
      featLines.push(`${row.dir === 'AtoB' ? 'out' : 'in'} item ${feature} : ${it.ref};`)
      flows.push({ item: it.id, itemName: it.name, dir: row.dir, from: row.dir === 'AtoB' ? x.endA : x.endB, to: row.dir === 'AtoB' ? x.endB : x.endA, feature })
    }
    if (!flows.length) add('gap', x.id, 'if-no-flow', `${x.id} ${ifName} is a ${x.kind || 'physical or information'} interface, but nothing crosses it in the model: its ports carry no item. Name what crosses (an item and its direction), or record why it carries nothing yet.`)
    const nameA = nameOfEnd(x.endA)
    const nameB = nameOfEnd(x.endB)
    portDefs.push([`port def ${quoted(portDef)} {`, `${T(1)}doc /* The port of ${docText(nameA)} on ${x.id}; ${docText(nameB)} uses its conjugate. */`, ...featLines.map((l) => `${T(1)}${l}`), '}'])
    const endTaken = new Set<string>(PART_TAKEN)
    const endA = uniqueIn(endTaken, basicName(nameA, 'sideA'))
    const endB = uniqueIn(endTaken, basicName(nameB, 'sideB'))
    shadowNames.add(endA)
    shadowNames.add(endB)
    const docBits = [`${cap(x.kind || 'interface')} interface ${x.id}.`, x.medium ? `Medium: ${sentence(x.medium)}` : '', x.constraint ? `Constraint: ${sentence(x.constraint)}` : '', x.protection ? `Protection: ${sentence(x.protection)}` : '', x.degraded ? `Degraded mode: ${sentence(x.degraded)}` : '', x.standard ? `Standard: ${sentence(x.standard)}` : ''].filter(Boolean).join(' ')
    ifDefs.push([
      `interface def ${quoted(ifDef)} {`,
      `${T(1)}doc /* ${docText(docBits)} */`,
      `${T(1)}end port ${endA} : ${TY(portDef)};`,
      `${T(1)}end port ${endB} : ~${TY(portDef)};`,
      ...flows.map((f) => `${T(1)}flow ${f.dir === 'AtoB' ? endA : endB}.${f.feature} to ${f.dir === 'AtoB' ? endB : endA}.${f.feature};`),
      '}',
    ])
    const portName = (path: string, other: string) => {
      const set = portTaken.get(path) ?? new Set<string>(PART_TAKEN)
      portTaken.set(path, set)
      return uniqueIn(set, `to${cap(basicName(other, 'other'))}`)
    }
    const portA = portName(pa, nameB)
    const portB = portName(pb, nameA)
    addPort(pa, `port ${portA} : ${TY(portDef)};`)
    addPort(pb, `port ${portB} : ~${TY(portDef)};`)
    ifUsages.push(`interface <'${x.id}'> ${usage} : ${TY(ifDef)} connect ${pa}.${portA} to ${pb}.${portB};`)
    interfaces.push({ id: x.id, name: ifName, kind: x.kind, usage, def: ifDef, portDef, endA: x.endA, endB: x.endB, pathA: `${pa}.${portA}`, pathB: `${pb}.${portB}`, flows, requirements: x.requirements, assumed: dflt.assumed })
  }
  // externals with no interface (the model's and the Week 5 record's)
  const extIds = [...new Set([...m.externals.map((x) => x.id), ...phys.externals.map((x) => x.id)])].sort()
  for (const id of extIds) {
    if (extState.has(id) && !extState.get(id)!.ok) continue
    const has = phys.interfaces.some((x) => x.endA === id || x.endB === id)
    if (!has) add('trace', id, 'ext-no-interface', `${id} ${extName(id)} has no interface${phys.externalReasons[id] ? ` (Week 5 reason: ${sentence(phys.externalReasons[id])})` : ''}. An external the enterprise exchanges with needs an interface; record why it has none, or add it in the Week 5 record.`)
  }
  // information flows between physical elements that no modeled interface carries
  for (const info of phys.information) {
    const prods = [...new Set(info.producers.map((p) => level1(phys, p)))]
    const cons = [...new Set(info.consumers.map((p) => level1(phys, p)))]
    const edges = interfaces.filter((x) => x.flows.some((f) => f.item === info.id)).map((x) => [level1(phys, x.endA), level1(phys, x.endB)])
    const reach = (from: string, to: string) => {
      const seen = new Set([from])
      for (let changed = true; changed; ) {
        changed = false
        for (const [a, b] of edges)
          for (const [u, v] of [[a, b], [b, a]])
            if (seen.has(u) && !seen.has(v)) {
              seen.add(v)
              changed = true
            }
      }
      return seen.has(to)
    }
    for (const p of prods)
      for (const q of cons) if (p !== q && p && q && !reach(p, q)) add('trace', `${info.id} ${p}→${q}`, 'crossing-uncovered', `${info.id} ${info.name} is produced at ${p} and consumed at ${q}, but no interface of the model carries it from one to the other. Add the crossing to the interface that carries it (or a relay), or record why it needs none.`)
  }
  for (const it of items.filter((x) => x.origin === 'Week 11')) if (!interfaces.some((x) => x.flows.some((f) => f.item === it.id))) add('gap', it.id, 'item-unused', `The item ${it.id === it.name ? `“${it.name}”` : `${it.id} ${it.name}`} added this week crosses no interface. Use it in a crossing, or remove it.`)

  // ---- logical elements allocated to the physical elements that perform their functions
  const allocations: Generated['allocations'] = []
  for (const l of m.logical) {
    const phys1 = [...new Set(l.performs.map((fn) => placements.find((p) => p.fn === fn)?.phy).filter((x): x is string => !!x))]
    if (!phys1.length) {
      add('trace', l.id, 'log-no-physical', `${l.id} (${l.def}) is allocated to no physical element: none of the functions it performs is performed by one. Place its functions on physical elements, or record why it has no physical home yet.`)
      continue
    }
    for (const phy of phys1) allocations.push({ log: l.id, phy, fns: l.performs.filter((fn) => placements.find((p) => p.fn === fn)?.phy === phy) })
  }

  // ---- interface requirements: in the model, or written now; allocated to the interface and to the functions
  const reqAllocations: Generated['reqAllocations'] = []
  const addedReqs: string[] = []
  const R: string[] = []
  const reqSubject = new Map<string, { pkg: string; def: string }>(m.requirements.map((q) => [q.id, { pkg: q.subjectPkg, def: q.subjectDef }]))
  const reqRef = (id: string) => `${pk('Requirements')}::'${id}'`
  for (const q of phys.requirements) {
    const x = interfaces.find((y) => y.id === q.interface)
    const inModel = reqById.get(q.id)
    if (inModel && inModel.name && q.name && nameKey(inModel.name) !== nameKey(q.name)) {
      add('defect', q.id, 'req-collision', `${q.id} is “${q.name}” in your Week 5 file but “${inModel.name}” in your model: the same ID names two requirements, so it is neither written nor allocated. IDs are never renumbered: correct the Week 5 record (issue the next free REQ ID there) and import again.`)
      continue
    }
    if (!inModel) {
      const subjectOk = !!x && x.kind !== 'organizational'
      const meta: string[] = []
      if (m.hasReqAttributes) meta.push(`@RequirementAttributes { level = "system"; requirementType = "interface";${METHOD[q.method] ? ` method = VerificationMethodKind::${METHOD[q.method]};` : ''}${q.criterion ? ` criterion = ${strLit(q.criterion)};` : ''} }`)
      if (m.hasRationale && q.rationale) meta.push(`@Rationale { text = ${strLit(q.rationale)}; }`)
      R.push(`requirement <'${q.id}'>${q.name ? ` ${quoted(q.name)}` : ''} {`)
      if (q.statement) R.push(`${T(1)}doc /* ${docText(q.statement)} */`)
      if (subjectOk) R.push(`${T(1)}subject ${basicName(x!.name, 'interface')} : ${pk('Physical')}::${quoted(x!.def)};`)
      for (const l of meta) R.push(`${T(1)}${l}`)
      R.push('}')
      if (subjectOk) reqSubject.set(q.id, { pkg: 'Physical', def: x!.def })
      addedReqs.push(q.id)
      add('info', q.id, 'req-added', `${q.id} is an interface requirement of your Week 5 record that model v0.3 did not have: it is written into Requirements${subjectOk ? ` with the interface definition ${x!.def} as its subject` : ' without a subject (its interface is not modeled)'}.`)
      for (const p of q.parents) {
        const parentIn = reqById.has(p) || addedReqs.includes(p)
        if (!parentIn) {
          add('defect', q.id, `req-parent-missing-${p}`, `${q.id} names ${p} as a parent, but ${p} is not in your model: the derivation is left out (it would not resolve). Correct the parent in the Week 5 record, or model the parent, and import again.`)
          continue
        }
        if (!m.hasDerivation) {
          add('gap', q.id, 'req-no-derivation', `${q.id} derives from ${p}, but the model does not import RequirementDerivation (Week 9), so the derivation is not written. Restore the Week 9 imports and import again.`)
          continue
        }
        R.push(`#derivation connection '${q.id} derives from ${p}' {`, `${T(1)}end #original ::> ${p.startsWith('NEED-') ? `${pk('Needs')}::'${p}'` : `'${p}'`};`, `${T(1)}end #derive ::> '${q.id}';`, '}')
      }
    }
    if (q.interface && !phys.interfaces.some((y) => y.id === q.interface)) add('defect', q.id, 'req-interface-missing', `${q.id} is written for ${q.interface}, which is not an interface of your Week 5 file: it is not allocated to an interface. Correct the interface in the Week 5 record and import again.`)
    if (x) reqAllocations.push({ req: q.id, to: x.id })
    // functions
    const typed = c.reqFns[q.id]
    const xi = phys.interfaces.find((y) => y.id === q.interface)
    const sugg = xi ? suggestedFunctions(m, phys, xi, x ? x.flows.map((f) => ({ item: f.item, dir: f.dir })) : [], c) : []
    const fns = typed !== undefined && typed.trim() ? upIds(typed, /FN-\d{3}/g) : sugg
    if (typed === undefined && sugg.length) add('gap', q.id, 'req-fn-assumed', `${q.id}: the tool allocated it to ${sugg.join(', ')}, the function${sugg.length > 1 ? 's' : ''} at the ends of ${q.interface} that use${sugg.length > 1 ? '' : 's'} an item it carries. Confirm or change the functions in the tool.`)
    for (const fn of fns) {
      if (!fnIds.has(fn)) {
        add('defect', q.id, `req-fn-missing-${fn}`, `${q.id} is allocated to ${fn}, which is not a function of your model: the allocation is left out (it would not resolve). Choose a function of the model.`)
        continue
      }
      reqAllocations.push({ req: q.id, to: fn })
    }
    if (!fns.some((fn) => fnIds.has(fn)) && !m.allocatedReqFns.some((a) => a.req === q.id)) add('trace', q.id, 'req-no-function', `${q.id} is allocated to no function. An interface requirement is realized by a function at one end of its interface: choose it, or record why none does.`)
  }
  // requirements allocated to physical elements (open items of Weeks 9 and 10)
  const reqRowsSeen = new Map<string, number>()
  for (const [i, r] of c.reqParts.entries()) {
    const req = r.req.trim().toUpperCase()
    const ids = upIds(r.els, /(?:PHY|CMP)-\d{3}/g)
    if (!ids.length || !req) continue
    const first = reqRowsSeen.get(req)
    if (first !== undefined) add('gap', req, 'req-part-duplicate', `${req} is in requirement allocations ${first + 1} and ${i + 1}: both rows are kept and their elements allocated. Merge them into one row.`)
    else reqRowsSeen.set(req, i)
    if (!reqById.has(req) && !addedReqs.includes(req)) {
      add('defect', req, 'req-part-missing', `${req} is not a requirement of your model: its allocation to ${ids.join(', ')} is left out.`)
      continue
    }
    for (const id of ids) {
      if (!pathOf(id) || /^EXT/.test(id)) {
        add('defect', req, `req-part-missing-${id}`, `${req} is allocated to ${id}, which is not a physical element or component of your Week 5 file: the allocation is left out.`)
        continue
      }
      reqAllocations.push({ req, to: id })
    }
  }
  // system requirements allocated to nothing at all
  for (const q of [...m.requirements.map((y) => y.id), ...addedReqs].filter((id) => id.startsWith('REQ-SYS-')))
    if (!m.allocatedReqFns.some((a) => a.req === q) && !reqAllocations.some((a) => a.req === q) && !findings.some((f) => f.id === q && (f.code === 'req-no-function' || f.code === 'req-collision'))) add('trace', q, 'req-unallocated', `${q} is allocated to no function, interface or physical element. SEBoK asks for a traceability matrix between the system requirements and the physical elements: allocate it, or record why nothing realizes it yet.`)

  // ---- satisfy claims
  const satisfied: Generated['satisfied'] = []
  const cmpValues: { path: string; attribute: string; value: string }[] = []
  const S: string[] = []
  const defsOf = (id: string): string[] => {
    const pt = parts.find((x) => x.id === id)
    if (pt) return [pt.def, ...pt.specializes]
    const cmp = parts.flatMap((x) => x.components).find((y) => y.id === id)
    if (cmp) return [cmp.def]
    const x = interfaces.find((y) => y.id === id)
    if (x && x.def) return [x.def]
    return []
  }
  const attrsOf = (defs: string[]) => [...new Set(defs.flatMap((d) => m.physicalDefs.find((p) => p.name === d)?.attributes ?? []))]
  const claimed = new Set<string>()
  let validClaims = 0
  for (const s of c.satisfy) {
    const req = s.req.trim().toUpperCase()
    const by = s.by.trim().toUpperCase()
    if (!req && !by) continue
    const key = `${req}:${by}`
    if (claimed.has(key)) continue
    claimed.add(key)
    if (!reqById.has(req) && !addedReqs.includes(req)) {
      add('defect', key, 'satisfy-req-missing', `The satisfy claim names ${req || '(no requirement)'}, which is not a requirement of your model: it is left out (it would not resolve). Choose a requirement of the model.`)
      continue
    }
    const target = /^IF-\d{3}$/.test(by) ? interfaces.find((x) => x.id === by && x.def) : null
    const path = target ? target.usage : /^(?:PHY|CMP)-\d{3}$/.test(by) ? pathOf(by) : null
    if (!path) {
      add('defect', key, 'satisfy-by-missing', `The satisfy claim for ${req} names ${by || '(no element)'}, which is not a modeled physical element, component or interface: it is left out (it would not resolve). Choose the element whose design is claimed to satisfy ${req}.`)
      continue
    }
    const subj = reqSubject.get(req)
    const defs = defsOf(by)
    if (!subj || !subj.def || subj.pkg !== 'Physical' || !defs.includes(subj.def)) {
      const why = !subj || !subj.def ? `${req} has no subject to bind` : subj.pkg !== 'Physical' ? `the subject of ${req} is ${subj.pkg ? `${subj.pkg}::` : ''}${subj.def}, not a physical element` : `the subject of ${req} is ${subj.def}, and ${by} is a ${defs.join(' / ') || 'element'} that does not specialize it (link the part definition “${subj.def}” to the element it stands for)`
      add('gap', key, 'satisfy-nonconforming', `The satisfy claim “${req} by ${by}” is left out: ${why}. The checker would only warn (“Bound features should have conforming types”), but the claim would be about the wrong subject. Choose an element whose type conforms, or remove the claim.`)
      continue
    }
    const attr = s.attribute.trim()
    const value = s.value.trim()
    const limit = m.requirements.find((q) => q.id === req)?.limit
    let written = { attribute: '', value: '' }
    if (attr || value) {
      const attrs = attrsOf(defs)
      if (!attrs.includes(attr)) add('gap', key, 'satisfy-attr-missing', `The design value of “${req} by ${by}” names “${attr || '(no attribute)'}”, which is not an attribute of ${subj.def} (${attrs.join(', ') || 'it has none'}): the value is left out and the claim stands without it. Choose the attribute the requirement constrains.`)
      else if (!VALUE.test(value)) add('gap', key, 'satisfy-value-unreadable', `The design value “${value || '(empty)'}” of “${req} by ${by}” is not a number with an optional unit in brackets (for example 18 [min]): the value is left out.`)
      else if (limit && limit.attr === attr && meetsLimit(value, limit) !== true) {
        const lim = `${attr} ${limit.op} ${limit.value}${limit.unit ? ` [${limit.unit}]` : ''}`
        if (meetsLimit(value, limit) === 'unit') add('gap', key, 'satisfy-value-unit', `The design value ${attr} = ${value} of “${req} by ${by}” is not in the unit of the requirement’s limit (${lim}), so the tool cannot compare them: the claim is left out. State the value in the requirement’s unit.`)
        else add('gap', key, 'satisfy-value-violates', `The design value ${attr} = ${value} does not meet the requirement’s own limit, ${lim}: the claim “${req} by ${by}” would assert something the model contradicts, so it is left out. The checker would accept it silently. Record the shortfall as a finding (a gap to close or a requirement to renegotiate) instead of claiming satisfaction.`)
        continue
      }
      else {
        const pt = parts.find((x) => x.id === by) ?? parts.find((x) => x.components.some((y) => y.id === by))
        const holder = pt && pt.id === by ? pt : null
        const other = satisfied.find((y) => y.by === by && y.attribute === attr && y.value !== value)
        if (other) add('gap', key, 'satisfy-value-conflict', `${by} already has ${attr} = ${other.value} from another claim: the second value (${value}) is left out. One element has one design value for an attribute.`)
        else if (holder) {
          if (!holder.values.some((v) => v.attribute === attr)) holder.values.push({ attribute: attr, value })
          written = { attribute: attr, value }
        } else if (/^CMP-/.test(by)) {
          written = { attribute: attr, value }
          const cmpParent = parts.find((x) => x.components.some((y) => y.id === by))!
          cmpValues.push({ path: `${cmpParent.usage}.${cmpParent.components.find((y) => y.id === by)!.usage}`, attribute: attr, value })
        }
      }
    }
    const basis = s.basis.trim()
    if (basisProblem(basis)) add('gap', key, 'satisfy-no-basis', `The satisfy claim “${req} by ${by}” states no basis. ${basisProblem(basis)}`)
    else validClaims++
    S.push(basis ? `satisfy ${reqRef(req)} by physicalArchitecture.${path} { doc /* ${docText(`Basis: ${sentence(basis)}`)} */ }` : `satisfy ${reqRef(req)} by physicalArchitecture.${path};`)
    satisfied.push({ req, by, attribute: written.attribute, value: written.value })
  }
  const minSat = phys.threePersonTeam ? LAB11_MINIMUMS.satisfyThree : LAB11_MINIMUMS.satisfy
  if (validClaims < minSat) add('gap', 'SATISFY', 'satisfy-minimum', `The model has ${validClaims} satisfy claim${validClaims === 1 ? '' : 's'} with a basis; the lab asks for at least ${minSat}. Claim a requirement for the physical element whose design value you can defend, with that value and its basis.`)

  // ---------------------------------------------------------------- write the text
  let text = m.text
  if (rootName !== m.rootName) text = text.split(quoted(m.rootName)).join(rootQ)

  // Context: the externals Week 5 added
  if (addedExtDefs.length) {
    const cp = topPackages(text).find((p) => p.name === 'Context')!
    text = insertBeforeClose(text, cp.open, ['// External systems of the Week 4 or Week 5 record the context did not have (added in Week 11).', ...addedExtDefs], 2)
  }
  if (addedExtUsages.length) {
    const cp = topPackages(text).find((p) => p.name === 'Context')!
    const ctx = m.hasContextPart ? blockOf(text, new RegExp(String.raw`(^|\n)[ \t]*part ${m.contextPart}\s*\{`), cp.open) : null
    if (ctx && ctx[0] < cp.close) text = insertBeforeClose(text, ctx[0], addedExtUsages, 3)
  }
  // Requirements: the interface requirements Week 9 did not model
  if (R.length) {
    const rp = topPackages(text).find((p) => p.name === 'Requirements')!
    text = insertBeforeClose(text, rp.open, ['// Interface requirements of the Week 5 record that model v0.3 did not have (course convention: the interface definition is the subject).', ...R], 2)
  }
  // Physical
  const P: string[] = ['// Week 11 models here what the package doc announces: the physical elements, their components, ports and interfaces. The part definitions above it are kept as written; the physical elements that stand for them specialize them.']
  if (newItemDecls.length) P.push('// The items added in Week 11: what crosses an interface that no item of the model names.')
  for (const it of newItemDecls) P.push(`item def ${it.id ? `<'${it.id}'> ` : ''}${quoted(it.name)} { doc /* ${it.kind === 'information' ? 'Information' : it.kind === 'energy' ? 'Energy' : it.kind === 'load' ? 'Mechanical load' : 'Material'} item added in Week 11. */ }`)
  if (newDefs.length) P.push('// The physical elements (Week 4) as part definitions; a part definition of the same name is reused, a linked one is specialized, so the requirements whose subject it is still conform.')
  P.push(...newDefs)
  if (cmpDefs.length) P.push('// The components (Week 5) as part definitions.')
  P.push(...cmpDefs)
  if (portDefs.length) P.push('// One port definition per interface (course convention): end A uses it, end B its conjugate, so every out item meets an in item.')
  for (const pd of portDefs) P.push(...pd)
  if (ifDefs.length) P.push('// The interfaces (Week 5) as interface definitions: two port ends and a flow for each crossing.')
  for (const d of ifDefs) P.push(...d)
  P.push('part physicalArchitecture {')
  P.push(`${T(1)}doc /* The physical architecture (Week 4 physical view, Week 5 components and interfaces): one part per physical element with its components, the ports of its interfaces and the functions it performs; the externals it exchanges with; the interfaces and connections. */`)
  for (const e of extOut) {
    const st = extState.get(e.id)!
    const lines = portLines.get(e.usage) ?? []
    const head = m.hasContextPart ? `ref part ${e.usage} :> ${pk('Context')}::${m.contextPart}.${st.ctxUsage}` : `ref part ${e.usage} : ${pk('Context')}::${quoted(st.name)}`
    if (!lines.length) P.push(`${T(1)}${head};`)
    else P.push(`${T(1)}${head} {`, ...lines.map((l) => `${T(2)}${l}`), `${T(1)}}`)
  }
  for (const pt of parts) {
    const inner: string[] = []
    for (const v of pt.values) inner.push(`attribute :>> ${v.attribute} = ${v.value};`)
    for (const cmp of pt.components) {
      const cl = [...(portLines.get(`${pt.usage}.${cmp.usage}`) ?? []), ...cmpValues.filter((v) => v.path === `${pt.usage}.${cmp.usage}`).map((v) => `attribute :>> ${v.attribute} = ${v.value};`)]
      if (!cl.length) inner.push(`part <'${cmp.id}'> ${cmp.usage} : ${TY(cmp.def)};`)
      else inner.push(`part <'${cmp.id}'> ${cmp.usage} : ${TY(cmp.def)} {`, ...cl.map((l) => `${T(1)}${l}`), '}')
    }
    inner.push(...(portLines.get(pt.usage) ?? []))
    for (const fn of pt.performs) inner.push(`perform ${pk('Logical')}::'${fn}';`)
    if (!inner.length) P.push(`${T(1)}part <'${pt.id}'> ${pt.usage} : ${TY(pt.def)};`)
    else P.push(`${T(1)}part <'${pt.id}'> ${pt.usage} : ${TY(pt.def)} {`, ...inner.map((l) => `${T(2)}${l}`), `${T(1)}}`)
  }
  for (const l of ifUsages) P.push(`${T(1)}${l}`)
  P.push('}')
  if (allocations.length) P.push('// The logical elements (Week 10) allocated to the physical elements that perform their functions, with a nested allocation for each function.')
  for (const a of allocations) {
    const l = m.logical.find((x) => x.id === a.log)!
    const pt = parts.find((x) => x.id === a.phy)!
    P.push(`allocate ${pk('Logical')}::logicalArchitecture.${l.usage} to physicalArchitecture.${pt.usage} {`)
    for (const fn of a.fns) P.push(`${T(1)}allocate ${pk('Logical')}::logicalArchitecture.${l.usage}.'${fn}' to physicalArchitecture.${pt.usage}.'${fn}';`)
    P.push('}')
  }
  if (reqAllocations.length) P.push('// Requirements allocated this week: interface requirements to their interface and to the function that realizes them; open requirements to physical elements.')
  for (const a of reqAllocations) {
    const to = /^FN-/.test(a.to) ? `${pk('Logical')}::'${a.to}'` : /^IF-/.test(a.to) ? `physicalArchitecture.${interfaces.find((x) => x.id === a.to)!.usage}` : `physicalArchitecture.${pathOf(a.to)}`
    P.push(`allocate ${reqRef(a.req)} to ${to};`)
  }
  if (S.length) P.push('// Satisfy claims: assertions that the design satisfies the requirement, each with its basis; Week 12 verifies them.')
  P.push(...S)
  const shadow = new Set<string>([...usageTaken, ...parts.flatMap((x) => x.components.map((y) => y.usage)), ...[...portTaken.values()].flatMap((x) => [...x]), ...shadowNames, ...m.functions.map((f) => ascii(f.name)), ...m.physicalDefs.flatMap((d) => d.attributes)])
  const resolve = (l: string) => l.replace(/([^]*)/g, (_, d: string) => (shadow.has(d) ? `${pk('Physical')}::${quoted(d)}` : quoted(d)))
  for (let i = 0; i < P.length; i++) P[i] = resolve(P[i])
  const pp = topPackages(text).find((p) => p.name === 'Physical')!
  text = insertBeforeClose(text, pp.open, P, 2)

  for (const id of issued) add('info', id, 'issued', `${id} is issued this week; IDs continue after the highest your Week 4 file and model have used, and none is ever reused.`)

  // header
  const header = [
    MARK_BEGIN,
    `// ${ascii(m.enterpriseName || phys.enterprise || 'Enterprise')}: SysML v2 model v0.4 (Week 11: physical architecture and interfaces).`,
    `// Generated by the Week 11 lab tool${opts.date ? ` on ${opts.date}` : ''} from model v0.3 (Week 10)${opts.origin ? ` and ${ascii(opts.origin)}` : ' and the Week 5 model inputs'}.`,
    ...(opts.header ?? []).map((h) => `// ${ascii(h)}`),
    '// Course conventions: a physical part performs the functions placed on it; a logical part is allocated to each physical',
    '// part that performs one of its functions; one port definition per interface, end B using its conjugate.',
    '// A checker PASS means the file parsed, every name resolved and no validation rule fired. It does not show that',
    '// connected ports match, that a flow runs the right way, or that a satisfy claim is true.',
    '// The model v0.3 header follows.',
    MARK_END,
  ]
  text = `${header.join('\n')}\n${text}`
  if (!text.endsWith('\n')) text += '\n'
  return { text, findings, items, parts, externals: extOut, interfaces, placements, allocations, reqAllocations, satisfied, addedReqs, addedExts: [...extState.entries()].filter(([, v]) => v.added).map(([k]) => k), issued }
}
// ---------------------------------------------------------------------------------------------- derived tables
/** Logical elements (rows) by physical elements (columns), true where an allocation connects them. */
export function allocationGrid(g: Generated): { cols: string[]; rows: { log: string; cells: boolean[] }[] } {
  const cols = [...new Set(g.allocations.map((a) => a.phy))].sort()
  const logs = [...new Set(g.allocations.map((a) => a.log))].sort()
  return { cols, rows: logs.map((l) => ({ log: l, cells: cols.map((p) => g.allocations.some((a) => a.log === l && a.phy === p)) })) }
}
/** The next information-item ID: one past the highest the Week 5 file, the model and this week's additions have used.
 *  Never reused. */
export function nextInfoId(phys: W11Phys | null, m: W10Model | null, issued: number, extra: string[] = []): string {
  const fromPhys = phys ? Math.max(0, ...phys.information.map((x) => num(x.id))) : 0
  const n = Math.max(fromPhys, m ? m.maxInfo : 0, issued, ...extra.map(num)) + 1
  return `INFO-${String(n).padStart(3, '0')}`
}
