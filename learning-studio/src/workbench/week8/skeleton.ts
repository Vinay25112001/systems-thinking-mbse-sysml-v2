// Week 8 lab tool logic (pure): read a team's Phase I exports (the Week 1 Team Record model inputs, versions 1–3, read
// with Week 1's own importer; and optionally the Week 2 model inputs), build the artifact-to-model mapping, run the
// mechanical part of the import audit, and generate the team's SysML v2 model v0.1 skeleton (package, purpose, the
// Context and Stakeholders packages modeled, every later package present with the week that fills it).
//
// The same generator writes the AeroLink worked example (src/content/lectures/week08/aerolinkCase.ts), and two of its
// outputs are kept as files and checked with the course-designated checker (sysml/lectures/week08/, written by
// `node scripts/build-week08-sysml.mjs`; skeleton.test.ts fails when a file is stale). A checker PASS shows the generated
// text parses, every name resolves and no validation rule fires; it does not show that the model says what the team's
// register says. That is the audit's job (fidelity and gaps), and the team's.
//
// Design rules (course conventions, labBrief.ts):
//   - every Phase I ID becomes a quoted short name, <'STK-004'> (S06 pp.49–50); names keep the register's wording;
//   - only a real defect keeps an item out of the file (a relationship whose end is not a registered stakeholder would
//     not resolve); everything else is imported and, where the record is incomplete, reported as a gap;
//   - nothing is invented: a value the record does not hold is not written (an unrated stakeholder gets no assessment
//     annotation, because a metadata annotation must bind every feature of its definition, S10 slide 109);
//   - one dependency direction (labBrief.ts REL_KEYWORDS): `from` is the dependent element (client), `to` the element it
//     depends on (supplier), S06 pp.50-51; the keyword names the client's relation to the supplier;
//   - a register name never breaks name resolution (namePlan): a generated usage name never hides a definition it
//     refers to, and a package reference that a register name would hide is qualified from the root package; each
//     adaptation is reported as a `name-shadow` gap (probed with the checker 2026-10-19: "Context", "context",
//     "Physical", "soi" and single lower-case words such as "weather" as names); a register name equal to another
//     element's ID or name in its namespace, or to "System of interest", is written "<name> (<ID>)", and a stakeholder
//     parameter never takes the name of a feature every concern inherits (checked file labtool_collision_model_v01).
// Review status: new-pending-review.
import { importModelInputs, isAeroLink, prefixLines, type TeamRecord } from '../week1/team'
import { MAPPING_KINDS, MODEL_PACKAGES, REL_KEYWORDS, dependencyEnds, mappingOf, prefixOfId, type FindingClass, type MappingKind } from '../../content/lectures/week08/labBrief'

// ---------------------------------------------------------------------------------------------- the import source
export type SrcStakeholder = {
  id: string
  name: string
  role: string
  stage: string
  side: string
  approving: boolean | null
  influence: number | null
  influenceReason: string
  /** Only the AeroLink case records interest and support; a team record does not. */
  interest?: number | null
  support?: number | null
  supportReason?: string
}
export type SrcConcern = { id: string; name?: string; text: string; stakeholders: string[] }
export type SrcExternal = { id: string; name: string; kind: string; crosses: string; direction: string }
export type SrcRel = { id: string; from: string; to: string; type: string; note: string }
export type SrcItem = { id: string; name: string }
export type Week2Part = { scenarios: SrcItem[]; capabilities: SrcItem[]; requirements: SrcItem[]; moes: SrcItem[]; mops: SrcItem[]; uncertainties: SrcItem[]; needsAdded: SrcItem[] }
export type ImportSource = {
  team: string
  /** Where the data came from, for the file header ("Week 1 model inputs, version 3"). */
  origin: string
  enterprise: { id: string; name: string; domain: string; problem: string; mission: string }
  soi: string
  inside: SrcItem[]
  context: SrcExternal[]
  stakeholders: SrcStakeholder[]
  concerns: SrcConcern[]
  relationships: SrcRel[]
  missionGoals: SrcItem[]
  needs: (SrcItem & { concerns: string[]; sources: string[] })[]
  /** Prefixes the team's charter assigns to an owner (to find kinds the mapping does not cover). */
  charterPrefixes: string[]
  week2: Week2Part | null
  /** How the Week 2 part is named in the file header (empty: not named). */
  week2Origin?: string
}

const str = (x: unknown) => (typeof x === 'string' ? x : x === undefined || x === null ? '' : String(x))
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const objs = (x: unknown): Record<string, unknown>[] => (Array.isArray(x) ? x.filter(isObj) : [])

/** A Week 1 Team Record (already normalized by Week 1's importer) as an import source. */
export function sourceFromTeam(t: TeamRecord, origin: string): ImportSource {
  return {
    team: t.team.trim(),
    origin,
    enterprise: { id: 'ENT-001', name: t.proposal.name.trim(), domain: t.proposal.domain.trim(), problem: t.proposal.problem.trim(), mission: t.proposal.purpose.trim() },
    soi: t.proposal.soi.trim(),
    inside: t.proposal.inside.filter((x) => x.id.trim()).map((x) => ({ id: x.id.trim(), name: x.name.trim() })),
    context: t.context.map((c) => ({ id: c.id, name: c.name.trim(), kind: c.kind, crosses: c.crosses.trim(), direction: c.direction })),
    stakeholders: t.stakeholders.map((s) => ({
      id: s.id,
      name: s.name.trim(),
      role: s.role,
      stage: s.stage,
      side: s.side,
      approving: s.approving === 'yes' ? true : s.approving === 'no' ? false : null,
      influence: /^[1-5]$/.test(s.influence.trim()) ? Number(s.influence.trim()) : null,
      influenceReason: s.reason.trim(),
    })),
    concerns: t.stakeholders.flatMap((s) => s.concerns.map((c) => ({ id: c.id, text: c.text.trim(), stakeholders: [s.id] }))),
    relationships: t.relationships.map((r) => ({ id: r.id, from: r.from, to: r.to, type: r.type, note: r.note.trim() })),
    missionGoals: [{ id: 'MGO-001', name: t.proposal.purpose.trim() }, ...t.proposal.goals.filter((g) => g.text.trim()).map((g) => ({ id: g.id, name: g.text.trim() }))].filter((x) => x.name),
    needs: t.needs.map((n) => ({ id: n.id, name: n.name.trim(), concerns: [...new Set(n.concerns.toUpperCase().match(/CON-\d{3}/g) ?? [])], sources: [...new Set(n.sources.toUpperCase().match(/STK-\d{3}/g) ?? [])] })),
    charterPrefixes: [...new Set(prefixLines(t.charter.prefixes).flatMap((l) => l.prefixes.map((p) => p.toUpperCase())))],
    week2: null,
  }
}

const items = (x: unknown, re: RegExp): SrcItem[] => objs(x).map((o) => ({ id: str(o.id).trim(), name: str(o.name).trim() || str(o.statement).trim() })).filter((o) => re.test(o.id))

/** The Week 2 model inputs (format "week2-model-inputs", version 1): the IDs it adds to the package. Tolerant of
 *  missing lists; refuses another format, a malformed list, malformed or duplicate IDs. Never throws. */
export function readWeek2(text: string): { week2: Week2Part; snapshot: Record<string, unknown> | null; team: string } | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON.' }
  }
  if (!isObj(d) || d.format !== 'week2-model-inputs') return { error: 'This is not a Week 2 model-inputs file (format “week2-model-inputs”).' }
  if (d.version !== 1) return { error: `This Week 2 file has version ${JSON.stringify(d.version)}; this tool reads version 1.` }
  for (const k of ['scenarios', 'capabilities', 'requirements', 'moes', 'mops', 'uncertainties', 'needsAdded'])
    if (d[k] !== undefined && (!Array.isArray(d[k]) || (d[k] as unknown[]).some((y) => !isObj(y)))) return { error: `“${k}” must be a list of objects.` }
  const w1 = isObj(d.week1) ? d.week1 : null
  if (w1 && isAeroLink(str(w1.enterprise))) return { error: 'This file is about AeroLink, the instructor’s worked example: import your team’s own record.' }
  const week2: Week2Part = {
    scenarios: items(d.scenarios, /^SCN-\d{3}$/),
    capabilities: items(d.capabilities, /^CAP-\d{3}$/),
    requirements: items(d.requirements, /^REQ-(STK|SYS)-\d{3}$/),
    moes: items(d.moes, /^MOE-\d{3}$/),
    mops: items(d.mops, /^MOP-\d{3}$/),
    uncertainties: items(d.uncertainties, /^[AU]-\d{3}$/),
    needsAdded: items(d.needsAdded, /^NEED-\d{3}$/),
  }
  const all = Object.values(week2).flat().map((x) => x.id)
  const dup = all.find((x, i) => all.indexOf(x) !== i)
  if (dup) return { error: `Duplicate ID ${dup} in the Week 2 file: each ID once.` }
  const listed = (k: string) => objs(d[k]).length
  const kept = (Object.keys(week2) as (keyof Week2Part)[]).reduce((a, k) => a + week2[k].length, 0)
  const total = ['scenarios', 'capabilities', 'requirements', 'moes', 'mops', 'uncertainties', 'needsAdded'].reduce((a, k) => a + listed(k), 0)
  if (kept < total) return { error: `${total - kept} item(s) in the Week 2 file have an ID that is not in the course form (SCN-001, CAP-001, REQ-STK-001, MOE-001, A-001 …).` }
  return { week2, snapshot: w1, team: str(d.team) }
}

export type ImportResult = { kind: 'week1'; source: ImportSource } | { kind: 'week2'; week2: Week2Part; team: string; snapshotOnly: ImportSource | null }

/** A Week 2 file's embedded Week 1 snapshot as a source: stakeholder IDs and names only (no concerns, context or
 *  relationships), so the tool asks for the Week 1 file too. */
function sourceFromSnapshot(s: Record<string, unknown>, team: string): ImportSource {
  return {
    team: str(s.team) || team,
    origin: 'the Week 1 snapshot inside the Week 2 model inputs',
    enterprise: { id: 'ENT-001', name: str(s.enterprise), domain: str(s.domain), problem: '', mission: str(s.mission) },
    soi: str(s.soi),
    inside: [],
    context: [],
    stakeholders: objs(s.stakeholders).map((x) => ({ id: str(x.id), name: str(x.name), role: '', stage: '', side: '', approving: null, influence: null, influenceReason: '' })),
    concerns: [],
    relationships: [],
    missionGoals: [{ id: 'MGO-001', name: str(s.mission) }, ...objs(s.goals).map((g) => ({ id: str(g.id), name: str(g.statement) }))].filter((x) => x.name),
    needs: objs(s.needs).map((n) => ({ id: str(n.id), name: str(n.name), concerns: [], sources: [] })),
    charterPrefixes: [],
    week2: null,
  }
}

/** Reads a Week 1 or Week 2 model-inputs file. Refuses other files, AeroLink records and malformed data with a message
 *  the student can act on; never throws. */
export function importFile(text: string): ImportResult | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON. Export the model inputs (.json) from the Week 1 or Week 2 lab tool, not the Markdown record.' }
  }
  if (isObj(d) && d.format === 'week1-model-inputs') {
    const t = importModelInputs(text)
    if ('error' in t) return t
    if ([t.proposal.name, t.proposal.domain, t.proposal.soi].some(isAeroLink)) return { error: 'This record is about AeroLink, the instructor’s worked example: import your team’s own record.' }
    return { kind: 'week1', source: sourceFromTeam(t, `Week 1 model inputs, version ${str(d.version)}`) }
  }
  if (isObj(d) && d.format === 'week2-model-inputs') {
    const r = readWeek2(text)
    if ('error' in r) return r
    return { kind: 'week2', week2: r.week2, team: r.team, snapshotOnly: r.snapshot ? sourceFromSnapshot(r.snapshot, r.team) : null }
  }
  return { error: 'This is not a Week 1 or Week 2 model-inputs file (format “week1-model-inputs” or “week2-model-inputs”).' }
}

// ---------------------------------------------------------------------------------------------- SysML text helpers
/** Typographic quotes, dashes, ellipses and arrows in their ASCII spelling (the course SysML files keep that style);
 *  other characters, such as accented letters or the degree sign, are kept: the checker reads UTF-8 (probed
 *  2026-10-19 with names and documentation containing them: PASS, no message). Control characters are dropped. */
const ASCII: [RegExp, string][] = [[/[\u2018\u2019]/g, "'"], [/[\u201C\u201D]/g, '"'], [/[\u2013\u2014]/g, '-'], [/\u2026/g, '...'], [/\u00A0/g, ' '], [/\u2264/g, '<='], [/\u2265/g, '>='], [/\u2192/g, '->']]
export const ascii = (s: string) => ASCII.reduce((t, [re, to]) => t.replace(re, to), s).split('').map((c) => (c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127 ? ' ' : c)).join('').replace(/\s+/g, ' ').trim()
/** An unrestricted name: single-quoted, with backslash and quote escaped (S06 p.50). */
export const quoted = (s: string) => `'${ascii(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
/** Text of a documentation comment: never closes the comment early. */
export const docText = (s: string) => ascii(s).replace(/\*\//g, '* /')
/** Ends a fragment with a full stop unless it already ends with punctuation. */
const sentence = (s: string) => (/[.!?)]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`)
/** A string literal for a metadata attribute value. */
const strLit = (s: string) => `"${ascii(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`

/** SysML v2 reserved keywords (S06 8.2.2.1.2): a generated basic name never equals one. */
export const RESERVED = new Set(
  'about abstract accept action actor after alias all allocate allocation analysis and as assert assign assume at attribute bind binding by calc case comment concern connect connection constant constraint crosses decide def default defined dependency derived do doc else end entry enum event exhibit exit expose false filter first flow for fork frame from hastype if implies import in include individual inout interface istype item join language library locale loop merge message meta metadata new nonunique not null objective occurrence of or ordered out package parallel part perform port private protected public redefines ref references render rendering rep require requirement return satisfy send snapshot specializes stakeholder standard state subject subsets succession terminate then timeslice to transition true until use variant variation verification verify via view viewpoint when while xor'.split(' '),
)
/** Latin letters with diacritics written without them (Å → A, é → e, ß → ss, æ → ae, ø → o, ł → l), so a basic name
 *  keeps "Ångström" readable as "angstrom" instead of dropping the letters. Other non-ASCII letters (東京) are left
 *  out of a basic name; nonAsciiLetters() tells the audit when that happens. */
const LIGATURES: Record<string, string> = { ß: 'ss', Æ: 'AE', æ: 'ae', Œ: 'OE', œ: 'oe', Ø: 'O', ø: 'o', Ł: 'L', ł: 'l', Đ: 'D', đ: 'd', Þ: 'Th', þ: 'th', Ð: 'D', ð: 'd' }
export const foldLatin = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ßÆæŒœØøŁłĐđÞþÐð]/g, (c) => LIGATURES[c])
    .normalize('NFC')
/** True when a name has letters outside ASCII: its basic name is then transliterated or loses letters. */
export const nonAsciiLetters = (s: string) => [...s.replace(/[^\p{L}]/gu, '')].some((c) => c.charCodeAt(0) > 127)
/** A basic name (S06 p.49) in lower camel case from free text, never a reserved word; `fallback` when nothing is left. */
export function basicName(text: string, fallback: string): string {
  const words = foldLatin(ascii(text)).replace(/[^A-Za-z0-9 ]+/g, ' ').split(' ').filter(Boolean)
  let n = words.map((w, i) => (i === 0 ? w.charAt(0).toLowerCase() + w.slice(1) : w.charAt(0).toUpperCase() + w.slice(1))).join('')
  if (!n) n = fallback
  if (/^[0-9]/.test(n)) n = `x${n}`
  if (RESERVED.has(n)) n = `${n}_`
  return n.slice(0, 60)
}
/** Distinct names, none equal to a name in `taken`: a repeat or a taken name gets the next free numeric suffix. */
const unique = (names: string[], taken: Iterable<string> = []) => {
  const used = new Set(taken)
  return names.map((n) => {
    let k = n
    for (let i = 2; used.has(k); i++) k = `${n}${i}`
    used.add(k)
    return k
  })
}

// ---------------------------------------------------------------------------------------------- name resolution plan
/** The names the generator chooses so that every reference in the file resolves to what it means, whatever the
 *  register calls things. SysML v2 resolves a name from the innermost namespace outward, so a member named like the
 *  target of a reference hides it (checker, 2026-10-19: a stakeholder named "Context" hid the Context package from
 *  every concern; an external system named "weather" made the usage `weather : 'weather'` refer to itself). */
export type NamePlan = {
  extTypes: string[]
  extUses: string[]
  insideTypes: string[]
  insideUses: string[]
  /** The context part usage (normally `context`). */
  contextName: string
  /** The referential usage of the system of interest inside the context part (normally `systemOfInterest`). */
  soiRefName: string
  /** The system-of-interest part usage in Physical (normally `soi`). */
  soiName: string
  /** How a concern names the enterprise, and how the context part names the system of interest. */
  entRef: string
  soiRef: string
  /** The name written for each stakeholder and each concern (the register's, or "<name> (<ID>)" where it would clash). */
  stkNames: Map<string, string>
  conNames: Map<string, string>
  /** Names a stakeholder parameter of a concern must not take (the subject's name and the inherited features). */
  paramTaken: string[]
  shadows: { id: string; text: string }[]
}

/** The features every concern usage inherits (ConcernCheck → RequirementCheck → RequirementConstraintCheck →
 *  ConstraintCheck → BooleanEvaluation → Evaluation → Performance → Occurrence → Anything, read from the 2026-08
 *  standard library). A stakeholder parameter with one of these names duplicates an inherited member (checker
 *  2026-10-19: a stakeholder named "Stakeholders" gave "Duplicate of inherited member name 'stakeholders' from
 *  RequirementCheck"), so the generator never uses one. */
export const CONCERN_INHERITED = new Set(
  'self that this subj actors stakeholders assumptions constraints subrequirements concerns result involvedObjects performers enclosedPerformances thisPerformance subperformances portionOfLife sameLifeOccurrences localClock suboccurrences superoccurrence withoutOccurrences predecessors successors immediatePredecessors immediateSuccessors timeEnclosedOccurrences spaceEnclosedOccurrences spaceTimeCoincidentOccurrences outsideOfOccurrences justOutsideOfOccurrences matingOccurrences innerSpaceDimension outerSpaceDimension portionOf timeSlices timeSliceOf snapshotOf startShot middleTimeSlice endShot spaceSlices spaceSliceOf spaceShots unionsOf intersectionsOf differencesOf spaceInterior spaceInteriorOf spaceBoundary spaceBoundaryOf innerSpaceOccurrences surroundedByOccurrences isClosed incomingTransfers isDispatch dispatchScope isRunToCompletion runToCompletionScope incomingTransferSort outgoingTransfers'.split(' '),
)

export function namePlan(src: ImportSource, rootName: string): NamePlan {
  const shadows: { id: string; text: string }[] = []
  const entName = src.enterprise.name
  const show = (n: string) => `“${ascii(n)}”`
  /** A register name that equals a name or short name another member of its namespace has (or that a reference from
   *  inside would find first) is written "<name> (<ID>)": the register's wording stays readable and every name and
   *  short name in the namespace stays distinct. Each such rename is reported. */
  const clashFree = (id: string, name: string, clash: Set<string>, where: string): string => {
    if (!name || !clash.has(ascii(name))) return name
    let out = `${ascii(name)} (${id})`
    for (let i = 2; clash.has(out); i++) out = `${ascii(name)} (${id}, ${i})`
    shadows.push({ id, text: `${id} is named ${show(name)}, which is also ${where}: the two would share one name, and a reference to that name could resolve to the wrong element. It is written ${show(out)} in the model; a name that is not an ID or another element's name avoids this.` })
    clash.add(out)
    return out
  }
  // Context package: the enterprise (short name and name) and the external-system definitions; inside the context part,
  // the usages carry the external-system IDs as short names, so a definition named like any of those IDs (its own
  // included) would be found from inside the part before the definition itself.
  const extClash = new Set([src.enterprise.id, ...(entName ? [ascii(entName)] : []), ...src.context.map((x) => x.id)])
  const extTypes = src.context.map((x) => (x.name ? clashFree(x.id, x.name, extClash, 'the enterprise’s name or ID, or an external-system ID') : `External system ${x.id}`))
  // Physical: 'System of interest' and the inside-element IDs (short names of the usages inside the soi part).
  const insideClash = new Set(['System of interest', ...src.inside.map((x) => x.id)])
  const insideTypes = src.inside.map((x) => (x.name ? clashFree(x.id, x.name, insideClash, 'the name of the System of interest definition or an inside-element ID') : `Element ${x.id}`))
  // Stakeholders package: every stakeholder, concern and relationship ID is a short name there; a stakeholder name may
  // equal its own ID (one element), never another's; a concern name must not equal a stakeholder's either.
  const pkgIds = [...src.stakeholders, ...src.concerns, ...src.relationships].map((x) => x.id)
  const stkNames = new Map(src.stakeholders.map((s) => [s.id, s.name ? clashFree(s.id, s.name, new Set(pkgIds.filter((i) => i !== s.id)), 'the ID of another element in the Stakeholders package') : s.name]))
  const stkNameSet = new Set([...stkNames.values()].filter(Boolean).map(ascii))
  const conNames = new Map(src.concerns.map((c) => [c.id, c.name ? clashFree(c.id, c.name, new Set([...pkgIds.filter((i) => i !== c.id), ...stkNameSet]), 'the ID or the name of another element in the Stakeholders package') : (c.name ?? '')]))
  // Concern parameters: never `enterprise` (the subject) or an inherited feature name.
  const paramTaken = ['enterprise', ...CONCERN_INHERITED]
  const owners = new Set(src.concerns.flatMap((c) => c.stakeholders))
  for (const s of src.stakeholders) {
    const base = basicName(s.name, `stk${s.id.replace(/\D/g, '')}`)
    if (owners.has(s.id) && CONCERN_INHERITED.has(base))
      shadows.push({ id: s.id, text: `${s.id} is named ${show(s.name)}: as a stakeholder parameter, ${base} would duplicate the feature ${base} that every concern inherits from the standard library, so the parameter gets a numeric suffix (${base}2).` })
  }
  // A name whose letters are not all ASCII: its usage or parameter name is transliterated, or loses letters.
  for (const x of [...src.context, ...src.inside, ...src.stakeholders.filter((s) => owners.has(s.id))])
    if (nonAsciiLetters(x.name))
      shadows.push({ id: x.id, text: `${x.id} is named ${show(x.name)}: a usage or parameter name allows only ASCII letters, so it is written ${basicName(x.name, 'x')} (accents dropped, other letters left out). The quoted name keeps the register’s spelling.` })
  // Context package members: the enterprise definition, the external-system definitions and the context usage.
  const contextTaken = new Set([...extTypes, ...(entName ? [entName] : [])])
  const [contextName] = unique(['context'], contextTaken)
  if (contextName !== 'context') {
    const who = src.context.find((x) => x.name === 'context')?.id ?? src.enterprise.id
    shadows.push({ id: who, text: `${who} is named ${show('context')}, the name the generator gives the context part: the context part is named ${contextName} instead, so the two names do not collide in the Context package.` })
  }
  // Inside the context part, a usage name must not equal a definition name the part refers to.
  const [soiRefName] = unique(['systemOfInterest'], extTypes)
  const extBase = src.context.map((x) => basicName(x.name, `ext${x.id.replace(/\D/g, '')}`))
  const extUses = unique(extBase, [...extTypes, soiRefName, contextName])
  src.context.forEach((x, i) => {
    if (extTypes.includes(extBase[i]))
      shadows.push({ id: x.id, text: `${x.id} is named ${show(x.name)}: as a usage name it would hide its own part definition inside the context part, so the generated usage is ${extUses[i]}. A name with a capital or a second word avoids this.` })
  })
  // Physical: the system-of-interest usage and the usages inside it.
  const [soiName] = unique(['soi'], [...insideTypes, 'System of interest'])
  if (soiName !== 'soi') {
    const who = src.inside.find((x) => x.name === 'soi')?.id ?? 'SOI'
    shadows.push({ id: who, text: `${who} is named ${show('soi')}, the name the generator gives the system-of-interest part: that part is named ${soiName} instead.` })
  }
  const insideBase = src.inside.map((x) => basicName(x.name, `prt${x.id.replace(/\D/g, '')}`))
  const insideUses = unique(insideBase, [...insideTypes, soiName])
  src.inside.forEach((x, i) => {
    if (insideTypes.includes(insideBase[i]))
      shadows.push({ id: x.id, text: `${x.id} is named ${show(x.name)}: as a usage name it would hide its own part definition inside the system-of-interest part, so the generated usage is ${insideUses[i]}.` })
  })
  // Package references: Context from the concerns (Stakeholders package), Physical from the context part.
  const root = quoted(rootName)
  const hidesContext = [...src.stakeholders.filter((s) => s.name === 'Context'), ...src.concerns.filter((c) => c.name === 'Context')]
  const entRef = `${hidesContext.length ? `${root}::` : ''}Context::'${src.enterprise.id}'`
  for (const h of hidesContext)
    shadows.push({ id: h.id, text: `${h.id} is named ${show('Context')}, the name of the Context package: inside the Stakeholders package it would hide that package, so every concern names the enterprise from the root package (${entRef}). The file resolves; a more specific name is clearer.` })
  const hidesPhysical = [...(entName === 'Physical' ? [src.enterprise.id] : []), ...src.context.filter((x) => x.name === 'Physical').map((x) => x.id)]
  const soiRef = `${hidesPhysical.length ? `${root}::` : ''}Physical::${soiName}`
  for (const id of hidesPhysical)
    shadows.push({ id, text: `${id} is named ${show('Physical')}, the name of the Physical package: inside the Context package it would hide that package, so the context part refers to the system of interest from the root package (${soiRef}). The file resolves; a more specific name is clearer.` })
  return { extTypes, extUses, insideTypes, insideUses, contextName, soiRefName, soiName, entRef, soiRef, stkNames, conNames, paramTaken, shadows }
}
/** The root package name the generator uses when none is given. */
export const defaultRootName = (src: ImportSource) => `${src.enterprise.name || 'Enterprise'} Model`

// ---------------------------------------------------------------------------------------------- findings and mapping
export type Finding = { cls: FindingClass; id: string; code: string; text: string }

/** Every ID in the source, by prefix. */
export function idsByPrefix(src: ImportSource): Map<string, string[]> {
  const all = [
    src.enterprise.name || src.enterprise.mission ? src.enterprise.id : '',
    ...src.inside.map((x) => x.id),
    ...src.context.map((x) => x.id),
    ...src.stakeholders.map((x) => x.id),
    ...src.concerns.map((x) => x.id),
    ...src.relationships.map((x) => x.id),
    ...src.missionGoals.map((x) => x.id),
    ...src.needs.map((x) => x.id),
    ...(src.week2 ? Object.values(src.week2).flat().map((x) => x.id) : []),
  ].filter(Boolean)
  const m = new Map<string, string[]>()
  for (const id of all) {
    const p = prefixOfId(id)
    m.set(p, [...new Set([...(m.get(p) ?? []), id])])
  }
  return m
}

/** Relationships that would not resolve (an end that is not a registered stakeholder): the one defect class. */
export const danglingRelationships = (src: ImportSource) => {
  const stk = new Set(src.stakeholders.map((s) => s.id))
  return src.relationships.filter((r) => !stk.has(r.from) || !stk.has(r.to))
}

/** The mechanical part of the import audit: defects, gaps, unmapped kinds and the items mapped for later weeks. */
export function auditFindings(src: ImportSource): Finding[] {
  const out: Finding[] = []
  const stkIds = new Set(src.stakeholders.map((s) => s.id))
  for (const r of danglingRelationships(src)) {
    const bad = [r.from, r.to].filter((x) => !stkIds.has(x))
    out.push({ cls: 'defect', id: r.id, code: 'rel-end', text: `${r.id} names ${bad.map((x) => x || '(nothing)').join(' and ')}, not a registered stakeholder: it is left out of the model. Correct the relationship in the Week 1 record and import again.` })
  }
  if (!src.enterprise.name) out.push({ cls: 'gap', id: src.enterprise.id, code: 'ent-name', text: 'The enterprise has no name: the part definition carries only its ID. Name it in the record.' })
  if (!src.soi) out.push({ cls: 'gap', id: 'SOI', code: 'soi', text: 'The system of interest is not stated: the system-of-interest part has no documentation.' })
  for (const x of src.context) {
    if (!x.name) out.push({ cls: 'gap', id: x.id, code: 'ext-name', text: `${x.id} has no name.` })
    if (!x.crosses) out.push({ cls: 'gap', id: x.id, code: 'ext-crosses', text: `${x.id} records nothing that crosses the boundary: Week 11 needs the exchange to define the interface.` })
  }
  for (const s of src.stakeholders) {
    if (!s.name) out.push({ cls: 'gap', id: s.id, code: 'stk-name', text: `${s.id} has no name: its part definition carries only the ID.` })
    if (!src.concerns.some((c) => c.stakeholders.includes(s.id))) out.push({ cls: 'gap', id: s.id, code: 'stk-no-concern', text: `${s.id} holds no concern: no concern in the model names it as a stakeholder. Add its concern, or record why it has none.` })
    if (s.influence === null || !s.influenceReason) out.push({ cls: 'gap', id: s.id, code: 'stk-unrated', text: `${s.id} has no ${s.influence === null ? 'influence rating' : 'reason for its rating'}: its assessment annotation is left out (an annotation must bind every value).` })
  }
  const dupNames = (xs: { id: string; name: string }[]) => xs.filter((x) => x.name && xs.some((y) => y.id !== x.id && y.name.trim().toLowerCase() === x.name.trim().toLowerCase()))
  for (const s of dupNames(src.stakeholders)) out.push({ cls: 'gap', id: s.id, code: 'stk-dup-name', text: `${s.id} has the same name as another stakeholder: the checker warns about duplicate names. Rename one, or merge them.` })
  for (const x of dupNames(src.context)) out.push({ cls: 'gap', id: x.id, code: 'ext-dup-name', text: `${x.id} has the same name as another external system: both are typed by one part definition. Check that they are one kind of system.` })
  for (const c of src.concerns) if (!c.text) out.push({ cls: 'gap', id: c.id, code: 'con-text', text: `${c.id} has no text: its documentation is empty, so fidelity cannot be checked.` })
  const rels = src.relationships.filter((r) => !danglingRelationships(src).includes(r))
  for (const r of rels) {
    if (!r.type) out.push({ cls: 'gap', id: r.id, code: 'rel-type', text: `${r.id} has no relationship type: it is modeled as a plain dependency without a keyword.` })
    if (r.from === r.to) out.push({ cls: 'gap', id: r.id, code: 'rel-self', text: `${r.id} relates ${r.from} to itself.` })
  }
  if (src.relationships.length && !rels.some((r) => r.type === 'conflicts-with')) out.push({ cls: 'gap', id: 'REL', code: 'no-conflict', text: 'No conflicts-with relationship is modeled: Week 1 required at least one recorded conflict.' })
  if (!src.concerns.length && src.stakeholders.length)
    out.push({
      cls: 'gap',
      id: 'CON',
      code: 'no-concerns',
      text: /snapshot/.test(src.origin)
        ? 'The imported file carries no concerns (a Week 2 file holds only stakeholder IDs and names): import the Week 1 model inputs to model the concerns.'
        : 'The Week 1 file lists stakeholders but no concerns: add each stakeholder’s concerns in the Week 1 lab tool, export again and import the new file.',
    })
  for (const sh of namePlan(src, defaultRootName(src)).shadows) out.push({ cls: 'gap', id: sh.id, code: 'name-shadow', text: sh.text })
  // kinds the course mapping does not cover (from the charter's prefix list)
  for (const p of src.charterPrefixes) if (!mappingOf(p)) out.push({ cls: 'unmapped', id: p, code: 'unmapped', text: `The charter assigns the prefix ${p}, which the course mapping does not cover: choose a package and a construct for it and record the reason.` })
  // mapped for a later week
  const byPrefix = idsByPrefix(src)
  for (const k of MAPPING_KINDS.filter((k) => k.modeledIn > 8)) {
    const ids = byPrefix.get(k.prefix) ?? []
    if (ids.length) out.push({ cls: 'info', id: k.prefix, code: 'later', text: `${ids.length} ${k.artifact.toLowerCase()} ID(s) (${compact(ids)}) mapped to ${k.pkg}; modeled in Week ${k.modeledIn}.` })
  }
  return out
}

/** "NEED-001 to NEED-004, NEED-007" from a list of IDs. */
export function compact(ids: string[]): string {
  const sorted = [...ids].sort((a, b) => (prefixOfId(a) === prefixOfId(b) ? Number(a.match(/\d+$/)?.[0]) - Number(b.match(/\d+$/)?.[0]) : a.localeCompare(b)))
  const out: string[] = []
  let i = 0
  while (i < sorted.length) {
    let j = i
    const n = (x: string) => Number(x.match(/\d+$/)?.[0])
    while (j + 1 < sorted.length && prefixOfId(sorted[j + 1]) === prefixOfId(sorted[i]) && n(sorted[j + 1]) === n(sorted[j]) + 1) j++
    out.push(j - i >= 2 ? `${sorted[i]} to ${sorted[j]}` : j > i ? `${sorted[i]}, ${sorted[j]}` : sorted[i])
    i = j + 1
  }
  return out.join(', ')
}

export type ManualRow = { prefix: string; count: string; reason: string }
export type MappingRow = MappingKind & { ids: string[]; count: number; status: 'modeled now' | 'mapped' | 'not in the imported files' | 'none in the package'; manual?: ManualRow }

/** The artifact-to-model mapping matrix: one row per course kind, with the IDs found in the imported files, or the
 *  team's own count for kinds that come from the Week 7 package by hand. */
/** A count typed by the team: "12", "12 items", "3 (SCN-001 to SCN-003)", or "0" / "none" / "zero" / "no". Gate sweep
 *  2026-10-19: was digits only, which left "12 items" or "none" uncounted although the lab asks only for the count. */
export function countOf(text: string): number | null {
  const t = text.trim()
  const lead = /^(\d+)(?!\s*[.,]\d)\b/.exec(t)
  if (lead) return Number(lead[1])
  // confirmation review N4: only a stated zero; "no idea" or "no clue" is not a count (was `no(?:ne)?(?: \w+)?`)
  if (/^(?:none|zero|nil|no(?:\s+(?:items?|entr(?:y|ies)|ids?|elements?))?)\.?$/i.test(t)) return 0
  return null
}
export function mappingMatrix(src: ImportSource, manual: ManualRow[] = []): MappingRow[] {
  const byPrefix = idsByPrefix(src)
  return MAPPING_KINDS.map((k) => {
    const ids = byPrefix.get(k.prefix) ?? []
    const m = manual.find((x) => x.prefix === k.prefix)
    const manualCount = m ? countOf(m.count) : null
    const count = ids.length || manualCount || 0
    const status: MappingRow['status'] = ids.length ? (k.modeledIn === 8 ? 'modeled now' : 'mapped') : manualCount !== null ? (manualCount > 0 ? 'mapped' : 'none in the package') : 'not in the imported files'
    return { ...k, ids, count, status, manual: m }
  })
}

// ---------------------------------------------------------------------------------------------- generation
export type GenerateOptions = {
  /** The model's purpose: who uses it, for which decisions (Session 1). Written in the root documentation. */
  purpose: string
  /** Assessment metadata on each rated stakeholder (default true; a three-person team may keep ratings in doc only). */
  assessment?: boolean
  /** Which relationships to model (default all; a three-person team may model the conflicts only). */
  relationships?: 'all' | 'conflicts'
  /** File header date (YYYY-MM-DD). */
  date?: string
  /** Extra header lines (the AeroLink case labels itself FICTIONAL). */
  header?: string[]
  /** Root package name (default "<enterprise> Model"). */
  packageName?: string
}

export type Generated = { text: string; included: Set<string>; excluded: string[]; qualified: Map<string, string> }

const T = (n: number) => '\t'.repeat(n)

/** The team's SysML v2 model v0.1 skeleton. Deterministic for a given source and options. */
export function generateSysml(src: ImportSource, opts: GenerateOptions): Generated {
  const L: string[] = []
  const included = new Set<string>()
  const qualified = new Map<string, string>()
  const byPrefix = idsByPrefix(src)
  const dangling = new Set(danglingRelationships(src).map((r) => r.id))
  const rels = src.relationships.filter((r) => !dangling.has(r.id) && (opts.relationships !== 'conflicts' || r.type === 'conflicts-with'))
  const relTypes = [...new Set(rels.map((r) => r.type).filter((t) => REL_KEYWORDS[t]))]
  const withAssessment = opts.assessment !== false
  const hasInterest = src.stakeholders.some((s) => s.interest !== undefined)
  const hasSupport = src.stakeholders.some((s) => s.support !== undefined)
  const rated = (s: SrcStakeholder) => s.influence !== null && !!s.influenceReason && (!hasInterest || (s.interest ?? null) !== null) && (!hasSupport || ((s.support ?? null) !== null && !!s.supportReason))
  const entName = src.enterprise.name || 'Enterprise'
  const rootName = opts.packageName ?? defaultRootName(src)
  const plan = namePlan(src, rootName)
  const purpose = opts.purpose.trim() || '[Write the model purpose here: who uses this model, and for which decisions.]'
  const entRef = plan.entRef

  L.push(`// ${ascii(entName)}: SysML v2 model v0.1 (Week 8 import of the Systems Thinking package).`)
  L.push(`// Generated by the Week 8 lab tool${opts.date ? ` on ${opts.date}` : ''} from ${ascii(src.origin)}${src.week2 && src.week2Origin ? ` and ${ascii(src.week2Origin)}` : ''}.`)
  for (const h of opts.header ?? []) L.push(`// ${ascii(h)}`)
  L.push('// Course conventions: every Phase I ID is a quoted short name <\'ID\'>; Context and Stakeholders are modeled now;')
  L.push('// every later package says which week fills it. Check this file with the course-designated checker: a PASS means it')
  L.push('// parsed, every name resolved and no validation rule fired. It does not show the model says what your register says.')
  if (rels.length) L.push('// Dependencies: `from` names the dependent element (client), `to` the element it depends on (supplier).')
  if (dangling.size) L.push(`// Left out (defects, fix in the Week 1 record): ${[...dangling].join(', ')}.`)
  L.push(`package ${quoted(rootName)} {`)
  L.push(`${T(1)}doc /* Purpose: ${docText(purpose)} */`)
  L.push(`${T(1)}private import ScalarValues::*;`)
  if (withAssessment) {
    L.push(`${T(1)}// Course convention: the Week 1 register ratings of a stakeholder, as metadata (SysML v2 textual-notation training deck, slides 108-109).`)
    L.push(`${T(1)}metadata def StakeholderAssessment {`)
    if (hasInterest) L.push(`${T(2)}attribute interest : Natural;`)
    L.push(`${T(2)}attribute influence : Natural;`)
    L.push(`${T(2)}attribute influenceReason : String;`)
    if (hasSupport) {
      L.push(`${T(2)}attribute support : Natural;`)
      L.push(`${T(2)}attribute supportReason : String;`)
    }
    L.push(`${T(1)}}`)
  }
  if (relTypes.length) L.push(`${T(1)}// Course convention: one keyword per Week 1 relationship type, restricted to dependencies (SysML v2 textual-notation training deck, slide 108); each keyword names the client's relation to the supplier.`)
  for (const t of relTypes) {
    const k = REL_KEYWORDS[t]
    L.push(`${T(1)}metadata def <${k.keyword}> ${k.def} {`)
    L.push(
      `${T(2)}doc /* ${
        k.direction === 'symmetric'
          ? `Tags a dependency between two stakeholders that ${k.reads.replace(/s with$/, ' with')} each other. The relationship is symmetric: from and to keep the register's order, and the direction carries no meaning.`
          : `Tags a dependency between two stakeholders: the client (from) ${k.reads} the supplier (to), so the client depends on the supplier.${k.direction === 'reversed' ? ` The Week 1 register states it the other way round: supplier ${k.verb} client.` : ''}`
      } */`,
    )
    L.push(`${T(2)}:> annotatedElement : SysML::Dependency;`)
    L.push(`${T(1)}}`)
  }

  // ---- Context
  // external systems with the same name share one part definition (two usages of one definition)
  const { extTypes, extUses } = plan
  L.push(`${T(1)}package Context {`)
  L.push(`${T(2)}doc /* The enterprise, the external systems and the operating context of the system of interest (Week 1). */`)
  const entDoc = [src.enterprise.domain && `Domain: ${sentence(src.enterprise.domain)}`, src.enterprise.problem && `Problem: ${sentence(src.enterprise.problem)}`, src.enterprise.mission && `Mission (MGO-001, modeled in Week 9): ${sentence(src.enterprise.mission)}`].filter(Boolean).join(' ')
  L.push(`${T(2)}part def <'${src.enterprise.id}'>${src.enterprise.name ? ` ${quoted(src.enterprise.name)}` : ''}${entDoc ? ' {' : ';'}`)
  if (entDoc) {
    L.push(`${T(3)}doc /* ${docText(entDoc)} */`)
    L.push(`${T(2)}}`)
  }
  included.add(src.enterprise.id)
  qualified.set(src.enterprise.id, entRef)
  ;[...new Set(extTypes)].forEach((t) => L.push(`${T(2)}part def ${quoted(t)};`))
  L.push(`${T(2)}part ${plan.contextName} {`)
  L.push(`${T(3)}doc /* The operating context: the system of interest and ${src.context.length} external system(s). */`)
  L.push(`${T(3)}ref part ${plan.soiRefName} :> ${plan.soiRef};`)
  src.context.forEach((x, i) => {
    const d = [x.name && `${x.name}.`, x.kind && `Kind: ${x.kind}.`, x.crosses && `Crosses the boundary: ${x.crosses}${x.direction ? ` (${x.direction === 'both' ? 'in and out' : x.direction})` : ''}.`].filter(Boolean).join(' ')
    L.push(`${T(3)}part <'${x.id}'> ${extUses[i]} : ${quoted(extTypes[i])}${d ? ` { doc /* ${docText(d)} */ }` : ';'}`)
    included.add(x.id)
    qualified.set(x.id, `Context::${plan.contextName}::'${x.id}'`)
  })
  L.push(`${T(2)}}`)
  L.push(`${T(1)}}`)

  // ---- Stakeholders
  const stkNames = new Map(src.stakeholders.map((s) => [s.id, s.name]))
  L.push(`${T(1)}package Stakeholders {`)
  L.push(`${T(2)}doc /* Stakeholders as part definitions (the types of stakeholder parameters); concerns with a subject and stakeholders; relationships as tagged dependencies (Week 1 register). */`)
  for (const s of src.stakeholders) {
    const facts = [s.role && `Role: ${s.role}.`, s.stage && `Main life-cycle stage: ${s.stage}.`, s.side && `Side: ${s.side}.`, s.approving !== null && `Approving authority: ${s.approving ? 'yes' : 'no'}.`, (!withAssessment || !rated(s)) && s.influence !== null && `Influence ${s.influence} (1-5)${s.influenceReason ? `: ${s.influenceReason}` : ''}.`]
      .filter(Boolean)
      .join(' ')
    const ann = withAssessment && rated(s)
    const head = `${T(2)}part def <'${s.id}'>${s.name ? ` ${quoted(plan.stkNames.get(s.id) ?? s.name)}` : ''}`
    if (!facts && !ann) L.push(`${head};`)
    else {
      L.push(`${head} {`)
      if (facts) L.push(`${T(3)}doc /* ${docText(facts)} */`)
      if (ann) {
        const vals = [hasInterest && `interest = ${s.interest};`, `influence = ${s.influence};`, `influenceReason = ${strLit(s.influenceReason)};`, hasSupport && `support = ${s.support};`, hasSupport && `supportReason = ${strLit(s.supportReason ?? '')};`].filter(Boolean)
        L.push(`${T(3)}@StakeholderAssessment { ${vals.join(' ')} }`)
      }
      L.push(`${T(2)}}`)
    }
    included.add(s.id)
    qualified.set(s.id, `Stakeholders::'${s.id}'`)
  }
  for (const c of src.concerns) {
    const owners = c.stakeholders.filter((x) => stkNames.has(x))
    L.push(`${T(2)}concern <'${c.id}'>${c.name ? ` ${quoted(plan.conNames.get(c.id) ?? c.name)}` : ''} {`)
    if (c.text) L.push(`${T(3)}doc /* ${docText(c.text)} */`)
    L.push(`${T(3)}subject enterprise : ${entRef};`)
    const params = unique(owners.map((o) => basicName(stkNames.get(o) ?? '', `stk${o.replace(/\D/g, '')}`)), plan.paramTaken)
    owners.forEach((o, i) => L.push(`${T(3)}stakeholder ${params[i]} : '${o}';`))
    L.push(`${T(2)}}`)
    included.add(c.id)
    qualified.set(c.id, `Stakeholders::'${c.id}'`)
  }
  for (const r of rels) {
    const k = REL_KEYWORDS[r.type]
    const { client, supplier } = dependencyEnds(r)
    const said = k ? (k.direction === 'reversed' ? `Register: ${r.from} ${k.verb} ${r.to}; modeled from the dependent: ${client} ${k.reads} ${supplier}.` : `${r.from} ${k.verb} ${r.to}.`) : ''
    const doc = [said, r.note && sentence(r.note)].filter(Boolean).join(' ')
    L.push(`${T(2)}${k ? `#${k.keyword} ` : ''}dependency <'${r.id}'> from '${client}' to '${supplier}'${doc ? ` {` : ';'}`)
    if (doc) {
      L.push(`${T(3)}doc /* ${docText(doc)} */`)
      L.push(`${T(2)}}`)
    }
    included.add(r.id)
    qualified.set(r.id, `Stakeholders::'${r.id}'`)
  }
  L.push(`${T(1)}}`)

  // ---- later packages and Physical (the system of interest and its inside elements are modeled now)
  const ids = (p: string) => byPrefix.get(p) ?? []
  const later = (prefixes: string[], fallback: string) => {
    const lines = prefixes.flatMap((p) => {
      const k = mappingOf(p)!
      const found = ids(p)
      return found.length ? [`${k.artifact} ${compact(found)} (Week ${k.modeledIn}: ${k.construct})`] : []
    })
    return lines.length ? `Mapped in Week 8, modeled later: ${lines.join('; ')}.` : fallback
  }
  for (const p of MODEL_PACKAGES.filter((x) => x.name !== 'Context' && x.name !== 'Stakeholders')) {
    if (p.name === 'Physical') {
      const { insideTypes, insideUses, soiName } = plan
      L.push(`${T(1)}package Physical {`)
      L.push(`${T(2)}doc /* The system of interest and the elements inside its boundary (Week 1). Components, ports and interfaces follow in Week 11. */`)
      L.push(`${T(2)}part def 'System of interest'${src.soi ? ` { doc /* ${docText(src.soi)} */ }` : ';'}`)
      ;[...new Set(insideTypes)].forEach((t) => L.push(`${T(2)}part def ${quoted(t)};`))
      if (src.inside.length) {
        L.push(`${T(2)}part ${soiName} : 'System of interest' {`)
        src.inside.forEach((x, i) => {
          L.push(`${T(3)}part <'${x.id}'> ${insideUses[i]} : ${quoted(insideTypes[i])};`)
          included.add(x.id)
          qualified.set(x.id, `Physical::${soiName}::'${x.id}'`)
        })
        L.push(`${T(2)}}`)
      } else L.push(`${T(2)}part ${soiName} : 'System of interest';`)
      L.push(`${T(1)}}`)
      continue
    }
    const fill: Record<string, [string[], string]> = {
      Needs: [['MGO', 'NEED', 'CAP'], 'Week 9 models the mission, goals and needs here; capabilities follow in Week 10.'],
      Requirements: [['REQ-STK', 'REQ-SYS'], 'Week 9 models the stakeholder and system requirements here.'],
      Behavior: [['SCN'], 'Week 10 models the scenarios as use cases here, with actions and states.'],
      Logical: [['FN', 'LOG'], 'Week 10 models the functions and logical elements here.'],
      Verification: [['VER'], 'Week 12 models the verification cases here.'],
      Analysis: [['TECH', 'ALT', 'CRIT', 'DEC'], 'Week 13 models the technologies, the trade study and its decision here.'],
      AROU: [['A', 'U', 'R', 'O'], 'Week 13 models the assumptions, risks, opportunities and unknowns here.'],
      Evolution: [['INC'], 'Week 14 models the roadmap increments here, in a form decided with the instructor.'],
    }
    const [prefixes, fallback] = fill[p.name]
    L.push(`${T(1)}package ${p.name} {`)
    L.push(`${T(2)}doc /* ${docText(later(prefixes, fallback))} */`)
    L.push(`${T(1)}}`)
  }
  L.push('}')
  return { text: L.join('\n') + '\n', included, excluded: [...dangling], qualified }
}

// ---------------------------------------------------------------------------------------------- audit summary
export type AuditSummary = { stakeholders: { record: number; model: number }; concerns: { record: number; model: number }; externals: { record: number; model: number }; concernsWithSubjectAndStakeholder: number; stakeholdersWithConcern: number; relationships: number; conflicts: number }

/** Completeness and structure (the two questions the tool answers mechanically), from the source and the generated file. */
export function auditSummary(src: ImportSource, g: Generated): AuditSummary {
  const inModel = (id: string) => g.included.has(id)
  const stkIds = new Set(src.stakeholders.map((s) => s.id))
  const relsIn = src.relationships.filter((r) => inModel(r.id))
  return {
    stakeholders: { record: src.stakeholders.length, model: src.stakeholders.filter((s) => inModel(s.id)).length },
    concerns: { record: src.concerns.length, model: src.concerns.filter((c) => inModel(c.id)).length },
    externals: { record: src.context.length, model: src.context.filter((x) => inModel(x.id)).length },
    concernsWithSubjectAndStakeholder: src.concerns.filter((c) => inModel(c.id) && c.stakeholders.some((s) => stkIds.has(s))).length,
    stakeholdersWithConcern: src.stakeholders.filter((s) => src.concerns.some((c) => c.stakeholders.includes(s.id))).length,
    relationships: relsIn.length,
    conflicts: relsIn.filter((r) => r.type === 'conflicts-with').length,
  }
}
