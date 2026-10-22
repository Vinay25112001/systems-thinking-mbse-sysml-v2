// Week 9 lab tool logic (pure): read the team's Week 8 model v0.1 (.sysml, the Week 8 lab tool's output) and its Week 1
// and Week 2 model inputs, and write model v0.2: the Needs package (mission and objectives, every need with its
// stakeholders and the concerns it frames) and the Requirements package (every requirement with its ID as short name,
// its statement as doc, a subject, a required constraint where the team has formalized one, its attributes, rationale
// and TBD status as metadata), the derivation connections from each parent, a specification group and an organizing group, and the needs to
// requirements trace matrix. Nothing in the Week 8 model is retyped: the generator fills the two packages the Week 8
// tool created and adds, between marker comments, the imports, the metadata definitions, the measured features of each
// subject and the placeholder subjects, so a file the tool wrote can be imported again without duplicating anything.
//
// The same generator writes the AeroLink worked example (src/content/lectures/week09/aerolinkCase.ts). Its outputs for
// AeroLink, the fixture team and an adversarial record are kept under sysml/lectures/week09/ and validated by the course
// checker (scripts/build-week09-sysml.mjs writes them; sysmlWeek09.test.ts fails when a file is stale). A checker PASS
// shows the text parses, every name resolves and no validation rule fires; it does not show that a requirement is the
// right one, that its subject is the right element, or that a design meets it. That is the trace audit's job, and the
// team's.
//
// Course conventions (labBrief.ts; each is labeled on the slides): every Phase I ID is a quoted short name <'ID'>; a
// need is a requirement usage with the enterprise as subject, framing the concerns it answers; a stakeholder requirement
// has the enterprise as subject; a system requirement has the element its "shall" is about as subject; derivation runs
// from the parent (#original) to the child (#derive); a #serves dependency runs from the need (client, `from`) to the
// objective it serves (supplier, `to`), the course's one dependency direction (SysML v2.1 Beta 2 Part 1, 7.3).
// Review status: new-pending-review.
import { importModelInputs, isAeroLink, proposalNamesAeroLink, type TeamRecord } from '../week1/team'
import { idsIn, importWeek2, tbxTokensIn, type Week2Record } from '../week2/record'
import { CONCERN_INHERITED, ascii, basicName, docText, quoted } from '../week8/skeleton'
import { COMPLETION_CLAIM, METHOD_KIND, OPS, QUANTITIES, opOf, quantityOf, type OpId, type QuantityId, type W9FindingClass } from '../../content/lectures/week09/labBrief'
import { isEmptyEveryWord, said } from '../emptyAnswer'

// ---------------------------------------------------------------------------------------------- the import sources
export type W9Objective = { id: string; name: string; text: string; level: 'mission' | 'goal' | 'objective'; parent?: string }
export type W9Need = {
  id: string
  name: string
  statement: string
  condition: string
  rationale: string
  priority: string
  /** Stakeholder IDs, the need's subject first. */
  stakeholders: string[]
  concerns: string[]
  objective: string
  origin: 'Week 1' | 'Week 2'
}
export type W9Req = {
  id: string
  level: 'stakeholder' | 'system'
  name: string
  statement: string
  type: string
  method: string
  criterion: string
  rationale: string
  parents: string[]
  /** TBD/TBR tokens of the statement (TBD-01, TBR-02). */
  tokens: string[]
  /** The owner of the unknown behind the token (from the Week 2 register), if recorded. */
  tbdOwner: string
  /** Where the requirement was written ("Week 2"; AeroLink: "Week 3", "Week 5"). */
  origin: string
}
/** What the Week 1 and Week 2 files contribute (normalized; saved in the tool state). */
export type W9Phase1 = {
  team: string
  enterprise: string
  objectives: W9Objective[]
  needs: W9Need[]
  requirements: W9Req[]
  stakeholderNames: Record<string, string>
  /** Week 2 dispositions of childless needs and childless stakeholder requirements, by ID. */
  dispositions: Record<string, string>
  threePersonTeam: boolean
}

const idList = (s: string, re: RegExp) => [...new Set(s.toUpperCase().match(re) ?? [])]

/** The Week 1 model inputs as a Phase I source: mission, objectives, needs and stakeholder names. */
export function phase1FromWeek1(t: TeamRecord): Pick<W9Phase1, 'team' | 'enterprise' | 'objectives' | 'needs' | 'stakeholderNames' | 'threePersonTeam'> {
  const objectives: W9Objective[] = [
    ...(t.proposal.purpose.trim() ? [{ id: 'MGO-001', name: 'Mission', text: t.proposal.purpose.trim(), level: 'mission' as const }] : []),
    ...t.proposal.goals.filter((g) => g.text.trim()).map((g) => ({ id: g.id, name: '', text: g.text.trim(), level: 'objective' as const })),
  ]
  return {
    team: t.team.trim(),
    enterprise: t.proposal.name.trim(),
    objectives,
    needs: t.needs.map((n) => ({
      id: n.id,
      name: n.name.trim(),
      statement: n.text.trim(),
      condition: n.conditions.trim(),
      rationale: n.rationale.trim(),
      priority: n.priority,
      stakeholders: idList(n.sources, /STK-\d{3}/g),
      concerns: idList(n.concerns, /CON-\d{3}/g),
      objective: idList(n.goal, /MGO-\d{3}/g)[0] ?? '',
      origin: 'Week 1' as const,
    })),
    stakeholderNames: Object.fromEntries(t.stakeholders.map((s) => [s.id, s.name.trim()])),
    threePersonTeam: t.charter.threePersonTeam,
  }
}

/** The Week 2 model inputs as a Phase I source: requirements (with TBD owners), the needs Week 2 added, dispositions. */
export function phase1FromWeek2(r: Week2Record): Pick<W9Phase1, 'requirements' | 'dispositions'> & { needsAdded: W9Need[]; team: string; enterprise: string } {
  const owners = new Map(r.uncertainties.map((u) => [u.id, u.owner.trim()]))
  const tokenOwner = new Map(r.uncertainties.filter((u) => u.tbx).map((u) => [u.tbx, u.owner.trim()]))
  return {
    team: r.week1?.team ?? '',
    enterprise: r.week1?.enterprise ?? '',
    requirements: r.requirements.map((q) => {
      const tokens = tbxTokensIn(q.statement)
      const linked = idsIn(q.tbx).filter((x) => x.startsWith('U-'))
      const owner = [...linked.map((u) => owners.get(u) ?? ''), ...tokens.map((tk) => tokenOwner.get(tk) ?? '')].find((o) => o) ?? ''
      return {
        id: q.id,
        level: q.id.startsWith('REQ-STK-') ? ('stakeholder' as const) : ('system' as const),
        name: q.name.trim(),
        statement: q.statement.trim(),
        type: q.type,
        method: q.method,
        criterion: q.criterion.trim(),
        rationale: q.rationale.trim(),
        parents: idsIn(q.parents).filter((p) => p !== q.id),
        tokens,
        tbdOwner: owner,
        origin: 'Week 2',
      }
    }),
    needsAdded: r.needsAdded.map((n) => ({ id: n.id, name: n.name.trim(), statement: n.statement.trim(), condition: '', rationale: '', priority: n.priority, stakeholders: [], concerns: [], objective: idList(n.goal, /MGO-\d{3}/g)[0] ?? '', origin: 'Week 2' as const })),
    dispositions: r.dispositions,
  }
}

/** Reads a Week 1 model-inputs file for Week 9 (refuses AeroLink and other files with a message; never throws). */
export function readWeek1(text: string): { record: TeamRecord } | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON. Export the model inputs (.json) from the Week 1 lab tool.' }
  }
  if (!d || typeof d !== 'object' || (d as { format?: unknown }).format !== 'week1-model-inputs') return { error: 'This is not a Week 1 model-inputs file (format “week1-model-inputs”).' }
  const t = importModelInputs(text)
  if ('error' in t) return t
  if (proposalNamesAeroLink(t.proposal)) return { error: 'This record is about AeroLink, the instructor’s worked example: import your team’s own record.' }
  return { record: t }
}
/** Reads a Week 2 model-inputs file for Week 9 (refuses AeroLink and other files with a message; never throws). */
export function readWeek2For9(text: string): { record: Week2Record } | { error: string } {
  const r = importWeek2(text)
  if ('error' in r) return r
  return { record: r }
}

// ---------------------------------------------------------------------------------------------- reading model v0.1
export const MARK_BEGIN = '// --- generated by the Week 9 lab tool: begin ---'
export const MARK_END = '// --- generated by the Week 9 lab tool: end ---'

/** Removes every region the Week 9 tool wrote (between its marker comments), so a model v0.2 can be imported again. */
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

/** Positions of the braces of a SysML text that are code (not inside comments, strings or quoted names), with the depth
 *  each brace opens or closes. */
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
/** The index of the brace that closes the one opened at `open`. */
function closeOf(text: string, open: number): number {
  const bs = braces(text)
  const k = bs.findIndex((b) => b.at === open)
  if (k < 0) return -1
  const d = bs[k].depth
  for (let j = k + 1; j < bs.length; j++) if (bs[j].ch === '}' && bs[j].depth === d) return bs[j].at
  return -1
}
/** The depth (number of open braces) at a position. */
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
export type W8Model = {
  text: string
  rootName: string
  /** How the Week 8 concerns refer to the enterprise (normally Context::'ENT-001'). */
  entRef: string
  enterpriseName: string
  stakeholders: string[]
  concerns: string[]
  /** Part definitions declared directly in the Physical package (possible subjects). */
  physicalDefs: string[]
  packages: string[]
}

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

/** Reads a team's Week 8 model v0.1 (or a model v0.2 this tool wrote). Refuses other files and AeroLink with a reason
 *  the student can act on; never throws. */
export function readWeek8(raw: string): { model: W8Model } | { error: string } {
  const r = parseModel(raw)
  if ('error' in r) return r
  if (isAeroLink(r.model.rootName) || isAeroLink(r.model.enterpriseName)) return { error: 'This model is AeroLink, the instructor’s worked example: import your team’s own Week 8 model.' }
  return r
}
/** Parses a model v0.1 or v0.2 text (no AeroLink check: the AeroLink worked example uses it on the instructor model). */
export function parseModel(raw: string): { model: W8Model } | { error: string } {
  if (/^\s*[[{]/.test(raw)) return { error: 'This is a JSON file. Import your Week 8 model here (the .sysml file the Week 8 lab tool exported), and the JSON files in the Week 1 and Week 2 fields.' }
  const text = stripGenerated(raw)
  const root = new RegExp(String.raw`(^|\n)[ \t]*package\s+(${NAME})\s*\{`).exec(text)
  if (!root) return { error: 'No package found: this is not a SysML v2 model file. Import the model v0.1 file (.sysml) your team exported from the Week 8 lab tool.' }
  const rootName = unq(root[2])
  const ent = /part def <'ENT-001'>\s*('(?:[^'\\]|\\.)*'|[A-Za-z_][A-Za-z0-9_]*)?/.exec(text)
  const enterpriseName = ent?.[1] ? unq(ent[1]) : ''
  if (!ent) return { error: 'The model declares no enterprise (part def <\'ENT-001\'> in the Context package). Import the model v0.1 your team exported from the Week 8 lab tool.' }
  const pkgs = topPackages(text)
  const names = pkgs.map((p) => p.name)
  for (const need of ['Context', 'Stakeholders', 'Needs', 'Requirements', 'Physical', 'Logical'])
    if (!names.includes(need)) return { error: `The model has no top-level ${need} package. The Week 9 tool fills the Needs and Requirements packages of the model v0.1 skeleton and adds subjects to Physical and Logical: restore the ${need} package (an empty package with a doc comment is enough) and import again.` }
  if (pkgs.some((p) => p.close < 0)) return { error: 'A package in this file is not closed (a missing “}”). Run the file through the checker, correct it and import again.' }
  const stk = pkgs.find((p) => p.name === 'Stakeholders')!
  const stkText = text.slice(stk.open, stk.close)
  const entRef = /subject\s+enterprise\s*:\s*([^;]+);/.exec(stkText)?.[1].trim() ?? "Context::'ENT-001'"
  const phy = pkgs.find((p) => p.name === 'Physical')!
  const physicalDefs: string[] = []
  const phyBody = text.slice(phy.open + 1, phy.close)
  for (const m of phyBody.matchAll(new RegExp(String.raw`(^|\n)[ \t]*part def\s+(?:<'[^']*'>\s*)?(${NAME})`, 'g'))) {
    if (depthAt(text, phy.open + 1 + (m.index ?? 0) + m[0].length) === 2) physicalDefs.push(unq(m[2]))
  }
  return {
    model: {
      text,
      rootName,
      entRef,
      enterpriseName,
      stakeholders: [...new Set([...text.matchAll(/part def <'(STK-\d{3})'>/g)].map((m) => m[1]))],
      concerns: [...new Set([...text.matchAll(/concern <'(CON-\d{3})'>/g)].map((m) => m[1]))],
      physicalDefs,
      packages: names,
    },
  }
}

// ---------------------------------------------------------------------------------------------- the team's choices
export type SubjectChoice = '' | 'enterprise' | 'soi' | `def:${string}` | 'new'
/** How the team formalizes one requirement (and, for a need, which stakeholders and concerns it uses). */
export type Choice = {
  subject: SubjectChoice
  newName: string
  newPkg: 'Physical' | 'Logical'
  feature: string
  quantity: QuantityId | ''
  unit: string
  op: OpId
  value: string
  form: 'direct' | 'shared'
  assume: string
  /** Overrides the TBD owner the Week 2 register gives (or supplies a missing one). */
  owner: string
}
export const EMPTY_CHOICE: Choice = { subject: '', newName: '', newPkg: 'Physical', feature: '', quantity: '', unit: '', op: '<=', value: '', form: 'direct', assume: '', owner: '' }
/** A need's stakeholders and concerns as the team corrects them (IDs typed: "STK-001, STK-004"). */
export type NeedChoice = { stakeholders: string; concerns: string }

export type GenOptions = {
  date?: string
  header?: string[]
  /** Root package name in the output (default: the Week 8 name, "v0.1" becoming "v0.2"). */
  packageName?: string
  /** Where the sources came from, for the header. */
  origin?: string
}

// ---------------------------------------------------------------------------------------------- formalization
export type Formal = { ok: true; subjectRef: string; subjectName: string; feature: string; type: string; limitName: string; value: string | null; op: OpId; quantity: QuantityId } | { ok: false; why: string }
const NUM = /^-?\d+(?:\.\d+)?$/
const cleanNum = (v: string) => v.replace(/[\s,]/g, '')
const tbdOf = (r: W9Req) => r.tokens.some((t) => t.startsWith('TBD'))
const tbrOf = (r: W9Req) => r.tokens.some((t) => t.startsWith('TBR'))
export const hasUnknown = (r: W9Req) => r.tokens.length > 0
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)
/** A unit written as SysML: symbols with characters outside a basic name are quoted (°C). */
const unitText = (u: string) => (/^[A-Za-z/]+$/.test(u) ? u : `'${u}'`)

/** Subject names the generator avoids for a requirement's parameters (the inherited features of every requirement). */
const PARAM_TAKEN = new Set(['enterprise', ...CONCERN_INHERITED])

// ---------------------------------------------------------------------------------------------- findings
export type W9Finding = { cls: W9FindingClass; id: string; code: string; text: string }
export const findingKey = (f: W9Finding) => `${f.cls}:${f.code}:${f.id}`
/** Findings that need a team disposition in the trace audit. */
export const needsDisposition = (f: W9Finding) => f.cls === 'trace' || (f.cls === 'gap' && DISPOSABLE_GAPS.has(f.code))
/** Gaps the tool cannot fix itself (the team writes a disposition); every other gap is fixed in the tool. */
const DISPOSABLE_GAPS = new Set(['need-no-stakeholder', 'need-no-concern', 'need-no-objective', 'stk-doc-only', 'attributes-incomplete', 'name-shadow', 'shared-single'])

/** Validity of a disposition: written, not an empty answer, and not a claim that the finding is fixed (the finding is
 *  computed from the exports, so while it is listed it is not fixed: re-export the corrected week instead). */
export function dispositionProblem(text: string): string | null {
  const t = text.trim()
  if (!said(t) || isEmptyEveryWord(t)) return 'Write what the team will do and why (an open item with an owner, or why no change is needed); “none”, “n/a” or “later” is not a disposition.'
  // a plan in the future or modal form ("to be resolved in Week 10", "will be done once the layout is fixed") is not a claim
  const claimed = t.replace(/\b(?:(?:to|will|shall|would) be |once (?:it is |this is |the \w+ is )?|until (?:it is )?|when (?:it is )?)(?:\w+ )?(?:fixed|resolved|done|closed|corrected|completed?)\b/gi, '')
  if (COMPLETION_CLAIM.test(claimed)) return 'This reads as a fix, but the finding is still computed from your exports: correct the Week 1, Week 2 or Week 8 file, export it again and re-import it. If this is a plan, write it as one (for example “to be resolved in Week 10, owner JS”).'
  return null
}

// ---------------------------------------------------------------------------------------------- generation
export type Derivation = { original: string; derived: string }
export type Generated = {
  text: string
  /** IDs written into the file. */
  included: Set<string>
  /** Items left out (defects). */
  excluded: string[]
  derivations: Derivation[]
  /** Parent links to capabilities (modeled in Week 10). */
  pendingCaps: Derivation[]
  findings: W9Finding[]
  /** Requirement ID → its formalization (or why it has none). */
  formal: Map<string, Formal>
  /** Shared requirement definitions written, with their members. */
  sharedDefs: { name: string; members: string[] }[]
}

const T = (n: number) => '\t'.repeat(n)
const strLit = (s: string) => `"${ascii(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
const sentence = (s: string) => (/[.!?)]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`)

/** Inserts lines just before the closing brace that matches the brace at `open`, between markers. */
function insertBeforeClose(text: string, open: number, lines: string[], indent: number): string {
  const close = closeOf(text, open)
  if (close < 0 || !lines.length) return text
  const block = [`${T(indent)}${MARK_BEGIN}`, ...lines.map((l) => `${T(indent)}${l}`), `${T(indent)}${MARK_END}`].join('\n')
  const before = text.slice(0, close).replace(/[ \t]*$/, '')
  const nl = before.endsWith('\n') ? '' : '\n'
  return `${before}${nl}${block}\n${T(indent - 1)}${text.slice(close)}`
}
/** Adds lines to the body of the definition declared at `at` (a `part def` line), making a `;` declaration a body. */
function addToDefinition(text: string, at: number, lines: string[], indent: number): string {
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
/** Replaces the body of a top-level package with new lines. */
function replacePackageBody(text: string, name: string, lines: string[]): string {
  const p = topPackages(text).find((x) => x.name === name)
  if (!p) return text
  return `${text.slice(0, p.open + 1)}\n${lines.map((l) => `${T(2)}${l}`).join('\n')}\n${T(1)}${text.slice(p.close)}`
}

/** The model v0.2 text, the trace data and the findings. Deterministic for given sources and choices. */
export function generateModel(w8: W8Model, p1: W9Phase1, choices: Record<string, Choice>, needChoices: Record<string, NeedChoice> = {}, opts: GenOptions = {}): Generated {
  const findings: W9Finding[] = []
  const included = new Set<string>()
  const excluded: string[] = []
  const add = (cls: W9FindingClass, id: string, code: string, text: string) => findings.push({ cls, id, code, text })
  const stkIn = new Set(w8.stakeholders)
  const conIn = new Set(w8.concerns)
  const objIds = new Set(p1.objectives.map((o) => o.id))
  const needIds = new Set(p1.needs.map((n) => n.id))
  const reqIds = new Set(p1.requirements.map((r) => r.id))

  // ---- names: a requirement or need name never equals another member's name or short name in its package, and never
  // hides a package the generated references name (then every cross-package reference is qualified from the root).
  const PACKAGES = ['Context', 'Stakeholders', 'Needs', 'Requirements', 'Physical', 'Logical', 'Behavior', 'Verification', 'Analysis', 'AROU', 'Evolution']
  const allNames = [...p1.needs.map((n) => n.name), ...p1.objectives.map((o) => o.name), ...p1.requirements.map((r) => r.name)].map((n) => ascii(n))
  const hides = allNames.some((n) => PACKAGES.includes(n))
  const rootName = opts.packageName ?? (/v0\.1$/.test(w8.rootName) ? w8.rootName.replace(/v0\.1$/, 'v0.2') : w8.rootName)
  const rootQ = quoted(rootName)
  const pk = (p: string) => (hides ? `${rootQ}::${p}` : p)
  const entRef = hides && !w8.entRef.startsWith("'") ? `${rootQ}::${w8.entRef}` : w8.entRef
  if (hides) add('gap', 'NAMES', 'name-shadow', `A need, objective or requirement is named like one of the model’s packages (${allNames.filter((n) => PACKAGES.includes(n)).join(', ')}): inside its package that name would hide the package, so every reference to another package is qualified from the root package. The file resolves; a more specific name is clearer.`)
  const clashFree = (items: { id: string; name: string }[], reserved: string[]) => {
    const taken = new Set<string>([...reserved, ...items.map((x) => x.id)])
    const out = new Map<string, string>()
    for (const x of items) {
      const n = ascii(x.name)
      if (!n) {
        out.set(x.id, '')
        continue
      }
      if (!taken.has(n)) {
        taken.add(n)
        out.set(x.id, n)
        continue
      }
      let alt = `${n} (${x.id})`
      for (let i = 2; taken.has(alt); i++) alt = `${n} (${x.id}, ${i})`
      taken.add(alt)
      out.set(x.id, alt)
      add('gap', x.id, 'name-shadow', `${x.id} is named “${n}”, which is also the name or ID of another element in its package; it is written “${alt}” so that every name in the package stays distinct. Rename it in the Phase I record if the two are different things.`)
    }
    return out
  }
  const needNames = clashFree([...p1.objectives, ...p1.needs], ['ServesLink', 'serves'])
  const reqNames = clashFree(p1.requirements, ['RequirementAttributes', 'stakeholderRequirements', 'systemRequirements', ...QUANTITIES.flatMap((q) => OPS.map((o) => `${q.defName}${o.defPart}`))])

  // ---- subjects and formalizations
  const formal = new Map<string, Formal>()
  /** Requirement ID → its subject parameter (name and type reference). */
  const subjects = new Map<string, { ref: string; name: string }>()
  /** Measured features per subject definition reference: name → type. */
  const features = new Map<string, Map<string, string>>()
  const placeholders = new Map<string, { pkg: 'Physical' | 'Logical'; name: string; for: string[] }>()
  const physSet = new Set(w8.physicalDefs)
  for (const r of p1.requirements) {
    const c = { ...EMPTY_CHOICE, ...(choices[r.id] ?? {}) }
    let subject = c.subject || (r.level === 'stakeholder' ? 'enterprise' : '')
    if (!subject && r.level === 'system') {
      add('gap', r.id, 'sys-no-subject', `${r.id} has no subject chosen: it is written with the system of interest as its subject. Choose the element its “shall” is about (an existing part definition, or a new placeholder that Weeks 10–11 will complete).`)
      subject = 'soi'
    }
    if (subject === 'enterprise' && r.level === 'system') add('gap', r.id, 'sys-enterprise-subject', `${r.id} is a system requirement with the enterprise as its subject. A subject that large cannot be shown to satisfy it at element level: choose the element its “shall” is about.`)
    let subjectRef = entRef
    let subjectDefKey = 'ENT'
    if (subject === 'soi') {
      subjectRef = `${pk('Physical')}::'System of interest'`
      subjectDefKey = 'def:System of interest'
    } else if (subject.startsWith('def:')) {
      const name = subject.slice(4)
      if (!physSet.has(name)) {
        add('gap', r.id, 'subject-missing', `${r.id} names the part definition “${name}”, which is not in the Physical package of your model: it is written with the system of interest as its subject. Choose again.`)
        subjectRef = `${pk('Physical')}::'System of interest'`
        subjectDefKey = 'def:System of interest'
      } else {
        subjectRef = `${pk('Physical')}::${quoted(name)}`
        subjectDefKey = `def:${name}`
      }
    } else if (subject === 'new') {
      const name = ascii(c.newName)
      if (!name) {
        add('gap', r.id, 'sys-no-subject', `${r.id}: a new subject was chosen but not named; it is written with the system of interest as its subject. Name the placeholder.`)
        subjectRef = `${pk('Physical')}::'System of interest'`
        subjectDefKey = 'def:System of interest'
      } else if (c.newPkg === 'Physical' && physSet.has(name)) {
        subjectRef = `${pk('Physical')}::${quoted(name)}`
        subjectDefKey = `def:${name}`
      } else {
        const key = `${c.newPkg}:${name}`
        const ph = placeholders.get(key) ?? { pkg: c.newPkg, name, for: [] }
        ph.for.push(r.id)
        placeholders.set(key, ph)
        subjectRef = `${pk(c.newPkg)}::${quoted(name)}`
        subjectDefKey = key
      }
    }
    const subjectName = subjectDefKey === 'ENT' ? 'enterprise' : basicName(subjectDefKey.replace(/^(def|Physical|Logical):/, ''), 'element')
    const sName = PARAM_TAKEN.has(subjectName) && subjectName !== 'enterprise' ? `${subjectName}Element` : subjectName
    // formal part
    const q = quantityOf(c.quantity)
    const op = opOf(c.op)
    const feat = c.feature.trim() ? basicName(c.feature, 'measured') : ''
    const valueRaw = cleanNum(c.value)
    let f: Formal
    if (!feat || !q || !op) f = { ok: false, why: !feat ? 'no measured feature named' : !q ? 'no quantity kind chosen' : 'no comparison chosen' }
    else if (q.units.length && !q.units.includes(c.unit)) f = { ok: false, why: `no unit chosen for the ${q.label.toLowerCase()}` }
    else if (valueRaw && !NUM.test(valueRaw)) f = { ok: false, why: `the limit “${c.value}” is not a number` }
    else if (valueRaw && q.id === 'count' && !/^\d+$/.test(valueRaw)) f = { ok: false, why: 'a count must be a whole number of zero or more' }
    else if (!valueRaw && !hasUnknown(r)) f = { ok: false, why: 'no limit value, and the statement has no TBD or TBR token to explain why' }
    else {
      const featName = CONCERN_INHERITED.has(feat) || feat === sName ? `${feat}Value` : feat
      const value = valueRaw ? (q.units.length ? `${valueRaw} [${unitText(c.unit)}]` : valueRaw) : null
      const limitName = /^(max|min|required)[A-Z]/.test(featName) ? `${featName}Limit` : `${op.limitPrefix}${cap(featName)}`
      f = { ok: true, subjectRef, subjectName: sName, feature: featName, type: q.type, limitName, value, op: op.id, quantity: q.id }
      const fm = features.get(subjectDefKey) ?? new Map<string, string>()
      const prev = fm.get(featName)
      if (prev && prev !== q.type) {
        f = { ok: false, why: `the feature ${featName} is already measured as ${prev} by another requirement on the same subject` }
      } else fm.set(featName, q.type)
      features.set(subjectDefKey, fm)
    }
    if (!f.ok) {
      if (r.level === 'system') add('gap', r.id, 'sys-doc-only', `${r.id} has no required constraint (${f.why}): it is written with its statement as doc only. A system requirement needs a measured feature of its subject, a comparison and a limit, or a recorded TBD.`)
      else add('gap', r.id, 'stk-doc-only', `${r.id} has no required constraint (${f.why}): it is written with its statement as doc only, which the rubric treats as the lowest level of requirement semantics. Formalize it, or record why it stays informal.`)
    }
    formal.set(r.id, f)
    subjects.set(r.id, { ref: subjectRef, name: sName })
    if (hasUnknown(r) && !(c.owner.trim() || r.tbdOwner)) add('gap', r.id, 'tbd-owner', `${r.id} carries ${r.tokens.join(', ')} but no owner is recorded (the Week 2 unknown has no owner, or none is linked): enter the owner here, so the status annotation names who closes it.`)
    if ([r.type, r.method, r.criterion].some((x) => !x)) add('gap', r.id, 'attributes-incomplete', `${r.id} lacks its ${[!r.type && 'type', !r.method && 'verification method', !r.criterion && 'criterion'].filter(Boolean).join(' and ')} in the Week 2 record, so its attribute annotation is left out (an annotation binds every attribute).`)
  }
  // shared definitions: one per (quantity, comparison) with at least two members marked "shared"
  const sharedGroups = new Map<string, string[]>()
  for (const r of p1.requirements) {
    const f = formal.get(r.id)!
    if (f.ok && (choices[r.id]?.form ?? 'direct') === 'shared') {
      const k = `${f.quantity}|${f.op}`
      sharedGroups.set(k, [...(sharedGroups.get(k) ?? []), r.id])
    }
  }
  const sharedDefs: { name: string; members: string[]; quantity: QuantityId; op: OpId }[] = []
  for (const [k, members] of sharedGroups) {
    const [qid, opid] = k.split('|') as [QuantityId, OpId]
    if (members.length < 2) {
      add('gap', members[0], 'shared-single', `${members[0]} is marked for a shared definition, but no other requirement shares its quantity and comparison: it is written directly. Mark a second requirement of the same form, or record why none exists.`)
      continue
    }
    sharedDefs.push({ name: `${quantityOf(qid)!.defName}${opOf(opid)!.defPart}`, members, quantity: qid, op: opid })
  }
  const sharedOf = (id: string) => sharedDefs.find((d) => d.members.includes(id))

  // ---- needs: stakeholders and concerns that resolve; defects for the ones that would not
  const needStk = new Map<string, string[]>()
  const needCon = new Map<string, string[]>()
  for (const n of p1.needs) {
    const nc = needChoices[n.id]
    const stks = nc && nc.stakeholders.trim() ? idList(nc.stakeholders, /STK-\d{3}/g) : n.stakeholders
    const cons = nc && nc.concerns.trim() ? idList(nc.concerns, /CON-\d{3}/g) : n.concerns
    const okS = stks.filter((s) => stkIn.has(s))
    const okC = cons.filter((c) => conIn.has(c))
    for (const s of stks.filter((x) => !stkIn.has(x))) {
      add('defect', n.id, 'need-stk-missing', `${n.id} names ${s} as a stakeholder, but ${s} is not a part definition in your Week 8 model: the stakeholder parameter is left out (it would not resolve). Add ${s} to the Week 8 model, or correct the need in the Week 1 record, and import again.`)
      excluded.push(`${n.id}→${s}`)
    }
    for (const c of cons.filter((x) => !conIn.has(x))) {
      add('defect', n.id, 'need-con-missing', `${n.id} answers ${c}, but ${c} is not a concern in your Week 8 model: the frame is left out (it would not resolve). Add the concern in the Week 8 model, or correct the need, and import again.`)
      excluded.push(`${n.id}→${c}`)
    }
    if (!stks.length) add('gap', n.id, 'need-no-stakeholder', `${n.id} names no stakeholder${n.origin === 'Week 2' ? ' (needs added in Week 2 carry none)' : ''}: enter its stakeholder IDs here, or record why it has none.`)
    if (!cons.length) add('gap', n.id, 'need-no-concern', `${n.id} frames no concern: a need answers at least one stakeholder concern. Enter the concern IDs it answers here, or record why none.`)
    if (!n.objective || !objIds.has(n.objective)) add('gap', n.id, 'need-no-objective', n.objective ? `${n.id} serves ${n.objective}, which is not among the mission and objectives imported: the #serves dependency is left out.` : `${n.id} names no objective it serves: the #serves dependency is left out.`)
    needStk.set(n.id, okS)
    needCon.set(n.id, okC)
  }

  // ---- derivations from parents
  const derivations: Derivation[] = []
  const pendingCaps: Derivation[] = []
  for (const r of p1.requirements) {
    for (const p of r.parents) {
      if (p.startsWith('CAP-')) pendingCaps.push({ original: p, derived: r.id })
      else if (needIds.has(p) || reqIds.has(p)) derivations.push({ original: p, derived: r.id })
      else {
        add('defect', r.id, 'parent-missing', `${r.id} names ${p} as a parent, but ${p} is not in the imported files: the derivation is left out (it would not resolve). Correct the parent in the Week 2 record and import again.`)
        excluded.push(`${r.id}→${p}`)
      }
    }
  }
  // trace findings
  const stkReqs = p1.requirements.filter((r) => r.level === 'stakeholder')
  const sysReqs = p1.requirements.filter((r) => r.level === 'system')
  for (const n of p1.needs) if (!stkReqs.some((r) => r.parents.includes(n.id))) add('trace', n.id, 'childless-need', `${n.id} has no stakeholder requirement derived from it: no requirement obliges anyone to meet it yet.`)
  for (const r of stkReqs) if (!sysReqs.some((s) => s.parents.includes(r.id))) add('trace', r.id, 'childless-stk', `${r.id} has no system requirement derived from it.`)
  for (const r of p1.requirements) {
    const modeled = r.parents.filter((p) => needIds.has(p) || reqIds.has(p))
    const caps = r.parents.filter((p) => p.startsWith('CAP-'))
    if (!r.parents.length) add('trace', r.id, 'orphan', `${r.id} names no parent: a requirement traces upward to a need or a parent requirement.`)
    else if (!modeled.length && caps.length) add('info', r.id, 'cap-only', `${r.id} traces only to ${caps.join(', ')}: its derivation is drawn in Week 10, when the capability is modeled. Until then the model shows no parent for it.`)
  }
  for (const d of pendingCaps) if (p1.requirements.find((r) => r.id === d.derived)!.parents.some((p) => !p.startsWith('CAP-'))) add('info', d.derived, `cap-parent-${d.original}`, `${d.derived} also traces to ${d.original}; that link is recorded in the trace matrix and modeled in Week 10.`)

  // ---------------------------------------------------------------- write the text
  let text = w8.text
  // rename the root package (v0.1 → v0.2) everywhere it is written
  if (rootName !== w8.rootName) text = text.split(quoted(w8.rootName)).join(rootQ)
  const rootMatch = new RegExp(String.raw`(^|\n)[ \t]*package\s+${NAME}\s*\{`).exec(text)!
  const rootOpen = (rootMatch.index ?? 0) + rootMatch[0].length - 1

  // Needs package body
  const N: string[] = []
  N.push(`doc /* The mission, the objectives and the stakeholder needs as requirement usages (Week 9). A need is not a requirement on the system: it states what a stakeholder needs, in the stakeholder's words; course convention: it is modeled as a requirement usage whose subject is the enterprise, with a stakeholder parameter and a frame for each concern it answers. Capabilities follow in Week 10. */`)
  for (const o of p1.objectives) {
    const name = needNames.get(o.id) ?? ''
    N.push(`requirement <'${o.id}'>${name ? ` ${quoted(name)}` : ''} {`)
    N.push(`${T(1)}doc /* ${docText(`${sentence(o.text)} Level: ${o.level}.`)} */`)
    N.push(`${T(1)}subject enterprise : ${entRef};`)
    N.push('}')
    included.add(o.id)
  }
  for (const o of p1.objectives.filter((x) => x.parent && objIds.has(x.parent))) {
    N.push(`#derivation connection '${o.id} derives from ${o.parent}' {`)
    N.push(`${T(1)}end #original ::> '${o.parent}';`)
    N.push(`${T(1)}end #derive ::> '${o.id}';`)
    N.push('}')
  }
  for (const n of p1.needs) {
    const name = needNames.get(n.id) ?? ''
    const parts = [n.statement && sentence(n.statement), n.condition && `Condition: ${sentence(n.condition)}`, n.rationale && `Rationale: ${sentence(n.rationale)}`, n.priority && `Priority: ${n.priority}.`].filter(Boolean).join(' ')
    N.push(`requirement <'${n.id}'>${name ? ` ${quoted(name)}` : ''} {`)
    if (parts) N.push(`${T(1)}doc /* ${docText(parts)} */`)
    N.push(`${T(1)}subject enterprise : ${entRef};`)
    const stks = needStk.get(n.id) ?? []
    const taken = new Set<string>(PARAM_TAKEN)
    for (const s of stks) {
      let pn = basicName(p1.stakeholderNames[s] ?? '', `stk${s.replace(/\D/g, '')}`)
      if (taken.has(pn)) {
        let i = 2
        while (taken.has(`${pn}${i}`)) i++
        pn = `${pn}${i}`
      }
      taken.add(pn)
      N.push(`${T(1)}stakeholder ${pn} : ${pk('Stakeholders')}::'${s}';`)
    }
    for (const c of needCon.get(n.id) ?? []) N.push(`${T(1)}frame ${pk('Stakeholders')}::'${c}';`)
    N.push('}')
    included.add(n.id)
  }
  for (const n of p1.needs.filter((x) => x.objective && objIds.has(x.objective))) N.push(`#serves dependency '${n.id} serves ${n.objective}' from '${n.id}' to '${n.objective}';`)
  text = replacePackageBody(text, 'Needs', N)

  // Requirements package body
  const R: string[] = []
  const pendingText = pendingCaps.length ? ` Parent links to capabilities wait for Week 10, when the capabilities are modeled: ${pendingCaps.map((d) => `${d.derived} to ${d.original}`).join('; ')}.` : ''
  R.push(`doc /* The stakeholder and system requirements (Week 9): each with its ID as short name, its statement as doc, a subject, a required constraint where formalized, its attributes and rationale as metadata, and a derivation connection from each parent need or requirement.${pendingText} */`)
  R.push('// Course convention: the Week 2 requirement attributes as metadata (SysML v2 textual-notation training deck, slides 108-109).')
  R.push('metadata def RequirementAttributes {')
  R.push(`${T(1)}attribute level : String;`)
  R.push(`${T(1)}attribute requirementType : String;`)
  R.push(`${T(1)}attribute method : VerificationMethodKind;`)
  R.push(`${T(1)}attribute criterion : String;`)
  R.push('}')
  for (const d of sharedDefs) {
    const q = quantityOf(d.quantity)!
    const op = opOf(d.op)!
    R.push(`requirement def ${d.name} {`)
    R.push(`${T(1)}doc /* Shared form (course convention): the measured ${q.label.toLowerCase()} shall be ${op.label.replace(/ \(.*\)$/, '')} the limit. Used by ${d.members.join(', ')}. */`)
    R.push(`${T(1)}attribute measured : ${q.type};`)
    R.push(`${T(1)}attribute limit : ${q.type};`)
    R.push(`${T(1)}require constraint { measured ${d.op} limit }`)
    R.push('}')
  }
  for (const r of p1.requirements) {
    const f = formal.get(r.id)!
    const sj = subjects.get(r.id)!
    const c = { ...EMPTY_CHOICE, ...(choices[r.id] ?? {}) }
    const name = reqNames.get(r.id) ?? ''
    const shared = f.ok ? sharedOf(r.id) : undefined
    R.push(`requirement <'${r.id}'>${name ? ` ${quoted(name)}` : ''}${shared ? ` : ${shared.name}` : ''} {`)
    if (r.statement) R.push(`${T(1)}doc /* ${docText(r.statement)} */`)
    R.push(`${T(1)}subject ${sj.name} : ${sj.ref};`)
    const tokNote = hasUnknown(r) ? `${r.tokens.join(', ')}: value pending${(c.owner.trim() || r.tbdOwner) ? ` (owner: ${ascii(c.owner.trim() || r.tbdOwner)})` : ''}.` : ''
    if (f.ok && shared) {
      R.push(`${T(1)}attribute :>> measured = ${f.subjectName}.${f.feature};`)
      R.push(f.value ? `${T(1)}attribute :>> limit = ${f.value};` : `${T(1)}attribute :>> limit { doc /* ${docText(tokNote)} */ }`)
    } else if (f.ok) {
      R.push(f.value ? `${T(1)}attribute ${f.limitName} : ${f.type} = ${f.value};` : `${T(1)}attribute ${f.limitName} : ${f.type} { doc /* ${docText(tokNote)} */ }`)
    }
    if (c.assume.trim()) R.push(`${T(1)}assume constraint { doc /* ${docText(c.assume)} */ }`)
    if (f.ok && !shared) R.push(`${T(1)}require constraint { ${f.subjectName}.${f.feature} ${f.op} ${f.limitName} }`)
    if (r.type && r.method && r.criterion) R.push(`${T(1)}@RequirementAttributes { level = "${r.level}"; requirementType = ${strLit(r.type)}; method = VerificationMethodKind::${METHOD_KIND[r.method] ?? 'test'}; criterion = ${strLit(r.criterion)}; }`)
    if (r.rationale) R.push(`${T(1)}@Rationale { text = ${strLit(r.rationale)}; }`)
    if (hasUnknown(r)) {
      const owner = c.owner.trim() || r.tbdOwner
      R.push(`${T(1)}@StatusInfo { status = StatusKind::${tbdOf(r) ? 'tbd' : tbrOf(r) ? 'tbc' : 'tbd'};${owner ? ` owner = ${strLit(owner)};` : ''} }`)
    }
    R.push('}')
    included.add(r.id)
  }
  if (stkReqs.length) {
    R.push('requirement stakeholderRequirements {')
    R.push(`${T(1)}doc /* Specification group: the ${stkReqs.length} stakeholder requirements. They share the enterprise as subject, so the group declares it. */`)
    R.push(`${T(1)}subject enterprise : ${entRef};`)
    for (const r of stkReqs) R.push(`${T(1)}require '${r.id}';`)
    R.push('}')
  }
  if (sysReqs.length) {
    R.push('requirement systemRequirements {')
    R.push(`${T(1)}doc /* Organizing group: the ${sysReqs.length} system requirements. Each keeps its own subject, unbound to a group subject, so the group declares none and cannot be satisfied as a whole: satisfy its members. Binding each member subject to a feature of one group subject (Week 11) would make it satisfiable. */`)
    for (const r of sysReqs) R.push(`${T(1)}require '${r.id}';`)
    R.push('}')
  }
  const refOf = (id: string) => (needIds.has(id) || objIds.has(id) ? `${pk('Needs')}::'${id}'` : `'${id}'`)
  for (const d of derivations) {
    R.push(`#derivation connection '${d.derived} derives from ${d.original}' {`)
    R.push(`${T(1)}end #original ::> ${refOf(d.original)};`)
    R.push(`${T(1)}end #derive ::> '${d.derived}';`)
    R.push('}')
  }
  text = replacePackageBody(text, 'Requirements', R)

  // measured features on the enterprise and on existing Physical definitions; placeholders in Physical and Logical
  const attrLines = (fm: Map<string, string> | undefined, who: string) => (fm && fm.size ? [`// Quantities the requirements constrain (Week 9; ${who}).`, ...[...fm].map(([n, t]) => `attribute ${n} : ${t};`)] : [])
  const entAt = text.search(/part def <'ENT-001'>/)
  if (entAt >= 0) text = addToDefinition(text, entAt, attrLines(features.get('ENT'), 'stakeholder requirements'), 3)
  for (const name of w8.physicalDefs) {
    const fm = features.get(`def:${name}`)
    if (!fm?.size) continue
    const phy = topPackages(text).find((p) => p.name === 'Physical')!
    const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(String.raw`(^|\n)[ \t]*part def\s+(?:<'[^']*'>\s*)?(?:${esc(quoted(name))}|${esc(name)}(?![A-Za-z0-9_]))`, 'g')
    const body = text.slice(phy.open, phy.close)
    const m = re.exec(body)
    if (m) text = addToDefinition(text, phy.open + (m.index ?? 0) + m[1].length, attrLines(fm, 'system requirements'), 3)
  }
  for (const pkgName of ['Physical', 'Logical'] as const) {
    const lines: string[] = []
    for (const ph of [...placeholders.values()].filter((x) => x.pkg === pkgName)) {
      const fm = features.get(`${pkgName}:${ph.name}`)
      lines.push(`part def ${quoted(ph.name)} {`)
      lines.push(`${T(1)}doc /* Placeholder subject of ${ph.for.join(', ')} (Week 9). Week ${pkgName === 'Logical' ? 10 : 11} models this element; keep the name, or update the subjects when it is renamed. */`)
      for (const [n, t] of fm ?? []) lines.push(`${T(1)}attribute ${n} : ${t};`)
      lines.push('}')
    }
    const p = topPackages(text).find((x) => x.name === pkgName)
    if (p && lines.length) text = insertBeforeClose(text, p.open, lines, 2)
  }
  // imports and the #serves keyword, after the root's imports
  const head = [
    'private import ISQ::*;',
    'private import SI::*;',
    'private import ModelingMetadata::*;',
    'private import RequirementDerivation::*;',
    'private import VerificationCases::*;',
    '// Course convention: a need serves a mission or objective; the dependency runs from the need (client) to what it serves (supplier).',
    'metadata def <serves> ServesLink {',
    `${T(1)}doc /* Tags a dependency from a need (client, after from) to the mission or objective it serves (supplier, after to): a change to the objective may require a change to the need. */`,
    `${T(1)}:> annotatedElement : SysML::Dependency;`,
    '}',
  ]
  const rootEnd = text.indexOf('\n', rootOpen)
  const afterRoot = text.slice(rootEnd + 1)
  const lastImport = [...afterRoot.matchAll(/^\t(?:private |public )?import [^\n]*\n/gm)].filter((m) => depthAt(text, rootEnd + 1 + (m.index ?? 0)) === 1)
  const docLine = /^\tdoc \/\*[^\n]*\*\/\n/m.exec(afterRoot)
  const insertAt = lastImport.length ? rootEnd + 1 + (lastImport.at(-1)!.index ?? 0) + lastImport.at(-1)![0].length : docLine && docLine.index === 0 ? rootEnd + 1 + docLine[0].length : rootEnd + 1
  text = `${text.slice(0, insertAt)}${[`\t${MARK_BEGIN}`, ...head.map((l) => `\t${l}`), `\t${MARK_END}`].join('\n')}\n${text.slice(insertAt)}`

  // header
  const header = [
    MARK_BEGIN,
    `// ${ascii(w8.enterpriseName || p1.enterprise || 'Enterprise')}: SysML v2 model v0.2 (Week 9: needs and requirements).`,
    `// Generated by the Week 9 lab tool${opts.date ? ` on ${opts.date}` : ''} from model v0.1 (Week 8)${opts.origin ? ` and ${ascii(opts.origin)}` : ' and the Week 1 and Week 2 model inputs'}.`,
    ...(opts.header ?? []).map((h) => `// ${ascii(h)}`),
    '// Course conventions: every Phase I ID is a quoted short name; a need is a requirement usage with the enterprise as subject,',
    '// framing the concerns it answers; a derivation connection runs from the parent (#original) to the child (#derive).',
    '// A checker PASS means the file parsed, every name resolved and no validation rule fired. It does not show that a',
    '// requirement is the right one, that its subject is the right element, or that any design meets it.',
    '// The model v0.1 header follows.',
    MARK_END,
  ]
  text = `${header.join('\n')}\n${text}`
  if (!text.endsWith('\n')) text += '\n'
  return { text, included, excluded, derivations, pendingCaps, findings, formal, sharedDefs: sharedDefs.map((d) => ({ name: d.name, members: d.members })) }
}

// ---------------------------------------------------------------------------------------------- trace matrix
/** covered: a stakeholder requirement is derived from the need; partial: one is, but the team records that it does not
 *  cover the whole need (an open item carried from the Week 2 audit); childless: none is derived. */
export type CoverageStatus = 'covered' | 'partial' | 'childless'
export type NeedRow = { need: string; name: string; stakeholders: string[]; concerns: string[]; stkReqs: string[]; sysReqs: string[]; status: CoverageStatus }
/** One row per need: its stakeholders and framed concerns, the stakeholder requirements derived from it and the system
 *  requirements derived from those (read from the derivations the generator wrote, never typed). */
export function traceRows(p1: W9Phase1, g: Generated, needChoices: Record<string, NeedChoice> = {}, partlyCovered: readonly string[] = []): NeedRow[] {
  const children = (id: string) => g.derivations.filter((d) => d.original === id).map((d) => d.derived)
  return p1.needs.map((n) => {
    const nc = needChoices[n.id]
    const stk = children(n.id).filter((x) => x.startsWith('REQ-STK-'))
    const sys = [...new Set(stk.flatMap((s) => children(s)).filter((x) => x.startsWith('REQ-SYS-')))]
    return {
      need: n.id,
      name: n.name,
      stakeholders: nc && nc.stakeholders.trim() ? idList(nc.stakeholders, /STK-\d{3}/g) : n.stakeholders,
      concerns: nc && nc.concerns.trim() ? idList(nc.concerns, /CON-\d{3}/g) : n.concerns,
      stkReqs: stk,
      sysReqs: sys,
      status: !stk.length ? 'childless' : partlyCovered.includes(n.id) ? 'partial' : 'covered',
    }
  })
}
/** The grid: needs (rows) by stakeholder requirements (columns), true where a derivation connects them. */
export function traceGrid(p1: W9Phase1, g: Generated): { cols: string[]; rows: { need: string; cells: boolean[] }[] } {
  const cols = p1.requirements.filter((r) => r.level === 'stakeholder').map((r) => r.id)
  return { cols, rows: p1.needs.map((n) => ({ need: n.id, cells: cols.map((c) => g.derivations.some((d) => d.original === n.id && d.derived === c)) })) }
}
