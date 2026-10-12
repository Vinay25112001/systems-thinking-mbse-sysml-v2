// Week 9 activity 2 (B9.4, pure): map the team's Part I artefacts (workspace elements, by ID) to the nine L9 model
// packages, and write each course ID as a SysML short name. The package proposals follow the lab plan C.2 table and
// the instructor reference model (sysml/reference/README.md §2–3); the quoting rule is S06 p.49–50 (R80): a basic
// name starts with a letter or underscore and continues with letters, digits or underscores, and any other name is
// written as an unrestricted name in single quotes. This is a planning table. It is not a SysML model, and nothing
// here is checked by the SysML tool: the team's model file is validated only by the course-designated checker.
import { isWellFormedId, type Element, type ElementKind } from '../../model/engineering'

export const L9_PACKAGES = ['Context', 'Stakeholders', 'Needs', 'Requirements', 'Logical', 'Physical', 'Behavior', 'Verification', 'AROU'] as const
export type L9Package = (typeof L9_PACKAGES)[number]
export type PackageChoice = L9Package | 'Other'

export type KindMapping = {
  /** Proposed L9 package, or null when no L9 package holds this kind (the team must decide). */
  pkg: L9Package | null
  construct: string
  /** Where the course ID sits as a short name in the reference model (README §3.1). */
  idOn: 'definition' | 'usage'
  /**
   * How the reference model writes the declared name for this kind: 'identifier' = a basic name (PascalCase on a
   * definition, camelCase on a usage: part def AeroLinkEnterprise, part chargingSystems); 'descriptive' = the element's
   * descriptive name, quoted when it is not a basic name (part def 'Vertiport Operators', requirement 'Pads not …').
   */
  nameStyle: 'identifier' | 'descriptive'
  model: string
  note?: string
}

/** Proposal per element kind: C.2 "Re-used in SysML as" column, as realised by the reference model. */
export const KIND_MAPPING: Record<ElementKind, KindMapping> = {
  ENT: { pkg: 'Context', construct: 'part def (system of interest)', idOn: 'definition', nameStyle: 'identifier', model: 'v0.1' },
  EXT: { pkg: 'Context', construct: 'part usage in the context part', idOn: 'usage', nameStyle: 'identifier', model: 'v0.1' },
  STK: { pkg: 'Stakeholders', construct: 'part def, used in stakeholder declarations', idOn: 'definition', nameStyle: 'descriptive', model: 'v0.1' },
  CON: { pkg: 'Stakeholders', construct: 'concern', idOn: 'usage', nameStyle: 'descriptive', model: 'v0.1' },
  MGO: { pkg: 'Needs', construct: 'requirement (level and measure in doc)', idOn: 'usage', nameStyle: 'descriptive', model: 'v0.1' },
  NEED: { pkg: 'Needs', construct: 'requirement (stakeholder level)', idOn: 'usage', nameStyle: 'descriptive', model: 'v0.1' },
  CAP: { pkg: 'Needs', construct: 'action def (or part def: team decision, justified)', idOn: 'definition', nameStyle: 'descriptive', model: 'v0.1', note: 'C.2 leaves action def or part def to the team; the reference uses action def in Needs.' },
  SCN: { pkg: 'Behavior', construct: 'use case (action flow from L11)', idOn: 'usage', nameStyle: 'descriptive', model: 'v0.1' },
  REQ: { pkg: 'Requirements', construct: 'requirement usage with subject; short name = requirement ID', idOn: 'usage', nameStyle: 'descriptive', model: 'v0.2 (L10)' },
  FN: { pkg: 'Logical', construct: 'action usage', idOn: 'usage', nameStyle: 'descriptive', model: 'v0.2 (L10)' },
  LOG: { pkg: 'Logical', construct: 'part usage of the logical architecture', idOn: 'usage', nameStyle: 'identifier', model: 'v0.2 (L10)' },
  AI: { pkg: 'Logical', construct: 'part usage + metadata', idOn: 'usage', nameStyle: 'identifier', model: 'v0.2 (L10)' },
  PHY: { pkg: 'Physical', construct: 'part usage of a part def, in the system-of-interest part', idOn: 'usage', nameStyle: 'identifier', model: 'v0.1' },
  IF: { pkg: 'Physical', construct: 'interface usage connecting ports (external interfaces in Context)', idOn: 'usage', nameStyle: 'identifier', model: 'v0.2 (L10)', note: 'IFs with an external end belong in the Context part, as in the reference (IF-003, IF-006, IF-007, IF-011).' },
  INFO: { pkg: 'Physical', construct: 'item def carried by ports', idOn: 'definition', nameStyle: 'descriptive', model: 'v0.2 (L10)' },
  VER: { pkg: 'Verification', construct: 'verification case', idOn: 'usage', nameStyle: 'descriptive', model: 'v0.4 (L12)' },
  A: { pkg: 'AROU', construct: 'metadata annotation', idOn: 'usage', nameStyle: 'descriptive', model: 'v0.4 (L12)' },
  R: { pkg: 'AROU', construct: 'risk metadata annotation (RiskMetadata::Risk)', idOn: 'usage', nameStyle: 'descriptive', model: 'v0.4 (L12)' },
  O: { pkg: 'AROU', construct: 'metadata annotation', idOn: 'usage', nameStyle: 'descriptive', model: 'v0.4 (L12)' },
  U: { pkg: 'AROU', construct: 'metadata annotation', idOn: 'usage', nameStyle: 'descriptive', model: 'v0.4 (L12)' },
  MOE: { pkg: null, construct: 'attribute + #moe metadata, owned by the element it measures', idOn: 'usage', nameStyle: 'identifier', model: 'v0.4 (L12)', note: 'No L9 package: an MOE is an attribute of the enterprise in the reference, not a package member of its own.' },
  MOP: { pkg: null, construct: 'attribute + #mop metadata, owned by the definition it measures', idOn: 'usage', nameStyle: 'identifier', model: 'v0.4 (L12)', note: 'No L9 package: a MOP lives on the definition whose value it measures (e.g. MOP-002 on ChargingSystems).' },
  TPM: { pkg: null, construct: 'attribute with threshold, estimate and margin', idOn: 'usage', nameStyle: 'descriptive', model: 'v0.4 (L12)', note: 'No L9 package: the reference adds a Measures package.' },
  TECH: { pkg: null, construct: 'part def with a trl attribute', idOn: 'definition', nameStyle: 'descriptive', model: 'v0.4 (L12)', note: 'No L9 package: the reference adds an Analysis package.' },
  ALT: { pkg: null, construct: 'part usage with criterion scores', idOn: 'usage', nameStyle: 'identifier', model: 'v0.4 (L12)', note: 'No L9 package: the reference adds an Analysis package for the trade study.' },
  CRIT: { pkg: null, construct: 'calc def (value function)', idOn: 'definition', nameStyle: 'descriptive', model: 'v0.4 (L12)', note: 'No L9 package: the reference adds an Analysis package for the trade study.' },
  DEC: { pkg: null, construct: 'analysis (TradeStudy) with rationale', idOn: 'usage', nameStyle: 'descriptive', model: 'v0.4 (L12)', note: 'No L9 package: the reference adds an Analysis package for the trade study.' },
}

/**
 * Keywords of the textual notation that appear as keywords in the course's validated listings or in the
 * textual-notation examples of the readings (S10 sl.5–16; S06 p.59, p.75, p.165). A reserved word may not be used as
 * a basic name (S06 p.50). This is NOT the full reserved-word list of the language; quote a name if in doubt.
 */
export const COURSE_KEYWORDS = new Set([
  'about', 'abstract', 'action', 'actor', 'alias', 'allocate', 'allocation', 'analysis', 'and', 'assume', 'attribute', 'calc', 'case', 'comment',
  'concern', 'connect', 'connection', 'constraint', 'def', 'dependency', 'doc', 'end', 'enum', 'exhibit', 'false', 'flow', 'frame', 'from', 'import',
  'in', 'interface', 'item', 'metadata', 'not', 'objective', 'or', 'out', 'package', 'part', 'perform', 'port', 'private', 'protected', 'public',
  'redefines', 'ref', 'require', 'requirement', 'return', 'satisfy', 'specializes', 'stakeholder', 'state', 'subject', 'subsets', 'to', 'true', 'use',
  'variant', 'variation', 'verification', 'verify',
])

/** S06 p.49–50: a basic name starts with a letter or underscore, continues with letters, digits or underscores, and is not a reserved word. */
export function isBasicName(s: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(s) && !COURSE_KEYWORDS.has(s)
}

/** Writes any name in the textual notation: as is if basic, otherwise in single quotes with ' and \ escaped (S06 p.50). */
export function nameForm(s: string): string {
  return isBasicName(s) ? s : `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

/**
 * The declared name the reference convention proposes for an element: for 'identifier' kinds a basic name built from
 * the descriptive name (PascalCase on a definition, camelCase on a usage, e.g. 'Charging Systems' → chargingSystems);
 * for 'descriptive' kinds the descriptive name itself, quoted when it is not a basic name. A proposal, not a rule.
 */
export function declaredNameFor(name: string, m: Pick<KindMapping, 'idOn' | 'nameStyle'>): string {
  if (m.nameStyle === 'descriptive') return nameForm(name)
  const words = name.split(/[^A-Za-z0-9]+/).filter(Boolean)
  if (!words.length) return nameForm(name)
  const cap = (w: string) => w[0].toUpperCase() + w.slice(1)
  let id = words.map(cap).join('')
  if (m.idOn === 'usage') id = id[0].toLowerCase() + id.slice(1)
  if (/^\d/.test(id)) id = '_' + id
  return nameForm(id)
}

/** KerML escape sequences (KerML 8.2.2.3, to which S06 p.50 refers): \b \t \n \f \r \" \' \\. */
const VALID_ESCAPES: Record<string, string> = { b: '\b', t: '\t', n: '\n', f: '\f', r: '\r', '"': '"', "'": "'", '\\': '\\' }

/** The name an unrestricted name's body (without its quotes) denotes, and the first invalid escape character, if any. */
export function unescapeName(body: string): { value: string; badEscape?: string } {
  let bad: string | undefined
  const value = body.replace(/\\(.)/g, (_m, c: string) => {
    if (c in VALID_ESCAPES) return VALID_ESCAPES[c]
    bad ??= c
    return c
  })
  return bad === undefined ? { value } : { value, badEscape: bad }
}

/** The short-name declaration for a course ID, e.g. <'PHY-001'> (hyphenated IDs are not basic names). */
export function shortNameFor(id: string): string {
  return `<${nameForm(id)}>`
}

/**
 * Checks a short-name declaration the student typed for a course ID. Returns a problem, or null.
 * Deterministic rules only: S06 p.49–50 quoting, and that the short name is exactly the course ID (C.2 rule 3).
 */
export function shortNameProblem(id: string, typed: string): string | null {
  const t = typed.trim()
  if (!t) return 'Type the short name, e.g. ' + shortNameFor(id) + '.'
  if (!t.startsWith('<') || !t.endsWith('>')) return 'A short name is written between < and > before the name (S06 p.49).'
  // Whitespace between the brackets and the name is allowed by the notation (course probe: < 'PHY-003' > passes).
  const inner = t.slice(1, -1).trim()
  if (/^".*"$/.test(inner)) return 'Unrestricted names use single quotes, not double quotes (S06 p.50).'
  if (/^'.*'$/.test(inner)) {
    const body = inner.slice(1, -1)
    if (!body) return 'An unrestricted name has at least one character between the quotes (S06 p.49).'
    const { value, badEscape } = unescapeName(body)
    if (badEscape !== undefined) return `“\\${badEscape}” is not an escape sequence (only \\' \\" \\\\ \\b \\t \\n \\f \\r are), so the checker rejects this name. A course ID needs no escapes.`
    if (value !== id) return `The quoted name is “${value}”, not the course ID ${id}: the characters inside the quotes, including spaces, are the name.`
    return null
  }
  if (inner !== id) return `The short name must be the course ID ${id} exactly (C.2 rule 3).`
  if (!isBasicName(inner)) return `${id} is not a basic name (it contains “-” or starts with a digit), so it must be quoted: ${shortNameFor(id)} (S06 p.49–50).`
  return null
}

/** Splits a qualified name or feature chain into segments on :: and . that are outside single quotes. */
export function referenceSegments(ref: string): string[] {
  const out: string[] = []
  let cur = ''
  let quoted = false
  for (let i = 0; i < ref.length; i++) {
    const c = ref[i]
    if (c === '\\' && quoted) {
      cur += c + (ref[i + 1] ?? '')
      i += 1
      continue
    }
    if (c === "'") quoted = !quoted
    if (!quoted && c === ':' && ref[i + 1] === ':') {
      out.push(cur)
      cur = ''
      i += 1
      continue
    }
    if (!quoted && c === '.') {
      out.push(cur)
      cur = ''
      continue
    }
    cur += c
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

/**
 * Problems in a reference such as Physical::aeroLink.'PHY-003': every segment must be a basic name that is not a
 * (course-listed) reserved word, or a non-empty quoted name with valid escapes. Whether it resolves is the checker's job.
 */
export function referenceProblems(ref: string): string[] {
  const problems: string[] = []
  if ((ref.replace(/\\./g, '').match(/'/g) ?? []).length % 2 === 1) return ['Unbalanced single quote.']
  for (const seg of referenceSegments(ref)) {
    if (!seg) problems.push('Empty segment: check for a doubled “::” or “.”.')
    else if (/^'.*'$/.test(seg)) {
      const body = seg.slice(1, -1)
      if (!body) problems.push("'' is not a name: an unrestricted name has at least one character between the quotes (S06 p.49).")
      else {
        const { badEscape } = unescapeName(body)
        if (badEscape !== undefined) problems.push(`“\\${badEscape}” in ${seg} is not an escape sequence; the checker rejects it.`)
      }
    } else if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(seg)) problems.push(`“${seg}” is not a basic name: write it in single quotes, '${seg}' (S06 p.49–50).`)
    else if (COURSE_KEYWORDS.has(seg)) problems.push(`“${seg}” is a reserved word, so it cannot be a basic name: quote it, '${seg}' (S06 p.50).`)
  }
  return problems
}

export type MappingRow = {
  id: string
  kind: ElementKind
  name: string
  owner: string
  pkg: PackageChoice | null
  /** The package as written in the table (an added package carries its name). */
  pkgLabel: string
  construct: string
  shortName: string
  declaredName: string
  problems: string[]
}

/** A team's placement of one kind. `otherName` names the package when pkg is 'Other'. */
export type KindChoice = { pkg?: PackageChoice; reason?: string; otherName?: string }

/** How a placement is written in the table: the L9 package, or the named package the team adds. */
export function packageLabel(pkg: PackageChoice | null, c?: KindChoice): string {
  if (!pkg) return '(undecided)'
  if (pkg !== 'Other') return pkg
  const name = (c?.otherName ?? '').trim()
  return name ? `Other: ${name}` : 'Other (unnamed)'
}

/** One row per active element. `choices` lets the team move a kind to another package (with a recorded reason). */
export function buildMapping(elements: Element[], choices: Partial<Record<ElementKind, KindChoice>> = {}): MappingRow[] {
  return elements
    .filter((e) => e.status === 'active')
    .map((e) => {
      const m = KIND_MAPPING[e.kind]
      const c = choices[e.kind]
      const pkg: PackageChoice | null = c?.pkg ?? m.pkg
      const problems: string[] = []
      if (!isWellFormedId(e.id, e.kind)) problems.push(`${e.id} does not follow the ${e.kind} ID scheme (C.2); fix the ID before it becomes a short name.`)
      if (!pkg) problems.push(`No L9 package holds ${e.kind}: choose one and record why (${m.note ?? 'team decision'}).`)
      if (c?.pkg && c.pkg !== m.pkg && !(c.reason ?? '').trim()) problems.push(`Moved from ${m.pkg ?? 'no package'} to ${c.pkg}: record the reason.`)
      if (pkg === 'Other' && !(c?.otherName ?? '').trim()) problems.push('Name the package you add for this kind.')
      return { id: e.id, kind: e.kind, name: e.name, owner: e.owner ?? '', pkg, pkgLabel: packageLabel(pkg, c), construct: m.construct, shortName: shortNameFor(e.id), declaredName: declaredNameFor(e.name, m), problems }
    })
    .sort((a, b) => a.id.localeCompare(b.id))
}

export type MappingSummary = { elements: number; mapped: number; unmapped: ElementKind[]; byPackage: Record<string, number>; withProblems: number }

export function summarise(rows: MappingRow[]): MappingSummary {
  const byPackage: Record<string, number> = {}
  for (const r of rows) if (r.pkg) byPackage[r.pkgLabel] = (byPackage[r.pkgLabel] ?? 0) + 1
  const unmapped = [...new Set(rows.filter((r) => !r.pkg).map((r) => r.kind))]
  return { elements: rows.length, mapped: rows.filter((r) => r.pkg).length, unmapped, byPackage, withProblems: rows.filter((r) => r.problems.length > 0).length }
}

/** Markdown mapping table for the L9 deliverable. Labelled as a planning table, not a SysML model. */
export function mappingMarkdown(rows: MappingRow[], choices: Partial<Record<ElementKind, KindChoice>> = {}): string {
  const head = [
    '<!-- L9 artifact-to-package mapping table (planning table generated by the Week 9 mapper; this is NOT a SysML model and has not been checked by the SysML tool) -->',
    '| ID | Kind | Owner | Package | SysML construct | Short name | Declared name | Open problems |',
    '|---|---|---|---|---|---|---|---|',
  ]
  const body = rows.map((r) => `| ${r.id} | ${r.kind} | ${r.owner || '—'} | ${r.pkgLabel} | ${r.construct} | \`${r.shortName}\` | \`${r.declaredName}\` | ${r.problems.join(' ') || '—'} |`)
  const reasons = Object.entries(choices)
    .filter(([, c]) => c?.pkg && (c.reason ?? '').trim())
    .map(([k, c]) => `- ${k} → ${packageLabel(c!.pkg!, c)}: ${c!.reason!.trim()}`)
  return [...head, ...body, ...(reasons.length ? ['', 'Placement decisions that differ from the proposal:', ...reasons] : [])].join('\n')
}
