// Week 10 activity 1 (B10.1, pure): requirement-to-SysML translator. The student maps one requirement from the
// workspace to the parts of a SysML v2 requirement usage: short name (= requirement ID, S06 p.165), declared name,
// doc text, subject, an optional parameter with its value, and the required constraint. The checks below are a
// TEACHING AID over the fields the student types. They are not a SysML parser and they do not validate SysML: the
// assembled text must still be run through the course-designated checker. Each check names its source; checks that
// rest on a course convention say so.
import type { Element } from '../../model/engineering'

export type Translation = {
  shortName: string
  declaredName: string
  docText: string
  subjectName: string
  subjectType: string
  paramName: string
  paramType: string
  /** e.g. "20 [min]", "0.90", "300"; empty for a TBD value that is deliberately left unbound. */
  paramValue: string
  constraint: string
}

export const EMPTY_TRANSLATION: Translation = { shortName: '', declaredName: '', docText: '', subjectName: '', subjectType: '', paramName: '', paramType: '', paramValue: '', constraint: '' }

/** ok: true = passes, false = fails, null = advisory (the tool cannot judge; a reviewer decides). */
export type TCheck = { id: string; label: string; ok: boolean | null; message: string; source: string }

const BASIC = /^[A-Za-z_][A-Za-z0-9_]*$/
const QUOTED = /^'(?:[^'\\]|\\.)*'$/
const norm = (s: string) => s.replace(/\s+/g, ' ').trim()
const unqualify = (t: string) => t.split('::').pop()!.replace(/^'|'$/g, '')

/**
 * Checks a short-name declaration for a requirement ID: written between < and >, quoted because a hyphenated ID is
 * not a basic name, and exactly the ID (S06 p.49–50, p.165; lab plan C.2 rule 3). Same rules as Week 9's mapper.
 */
export function shortNameProblem(id: string, typed: string): string | null {
  const t = typed.trim()
  if (!t) return `Write the short name, <'${id}'>.`
  if (!t.startsWith('<') || !t.endsWith('>')) return 'A short name is written between < and > before the name (S06 p.49).'
  const inner = t.slice(1, -1)
  if (/^".*"$/.test(inner)) return 'Unrestricted names use single quotes, not double quotes (S06 p.50).'
  if (/^'.*'$/.test(inner)) {
    const value = inner.slice(1, -1).replace(/\\(.)/g, '$1')
    return value === id ? null : `The quoted name is “${value}”, not the requirement ID ${id}: every character inside the quotes, including spaces, is part of the name.`
  }
  if (inner !== id) return `The short name must be the requirement ID ${id} exactly (C.2 rule 3).`
  if (!BASIC.test(inner)) return `${id} is not a basic name (it contains “-”), so it must be quoted: <'${id}'> (S06 p.49–50).`
  return null
}

/** Whether a declared name is written legally: a basic name, or an unrestricted name in single quotes (S06 p.49–50). */
export function declaredNameProblem(name: string): string | null {
  const n = name.trim()
  if (!n) return 'Write the declared name (the requirement’s title from your table).'
  if (BASIC.test(n) || QUOTED.test(n)) return null
  if (/^".*"$/.test(n)) return 'Unrestricted names use single quotes, not double quotes (S06 p.50).'
  return `“${n}” is not a basic name (it contains spaces or other characters), so it must be written in single quotes (S06 p.49–50).`
}

/**
 * Subject phrases of “The … shall” statements and the definitions a reviewer would accept as the subject’s type.
 * The phrases are those of the AeroLink reference requirements; the types are the reference model’s part defs
 * (sysml/reference/aerolink_v02_req_structure.sysml). Longest phrase wins. A statement whose subject phrase is not
 * listed is not judged.
 */
export const SUBJECT_PHRASES: { phrase: string; types: string[] }[] = [
  { phrase: 'vertiport fire detection system', types: ['PadFireDetectionSystem'] },
  { phrase: 'fire detection system', types: ['PadFireDetectionSystem'] },
  { phrase: 'maintenance management function', types: ['MaintenanceManagement'] },
  { phrase: 'flight planning function', types: ['FlightOperations'] },
  { phrase: 'scheduling function', types: ['Scheduling'] },
  { phrase: 'operations system', types: ['DecisionSupport', 'OperationsCenter'] },
  { phrase: 'charging system', types: ['ChargingSystems'] },
  { phrase: 'booking platform', types: ['PassengerBookingPlatform'] },
  { phrase: 'evtol aircraft', types: ['EVTOLAircraft'] },
  { phrase: 'aircraft', types: ['EVTOLAircraft'] },
  { phrase: 'aerolink service', types: ['AeroLinkEnterprise'] },
  { phrase: 'fleet', types: ['FleetManagement'] },
]

const ENTERPRISE_TYPES = ['AeroLinkEnterprise', 'ENT-001']

/** The grammatical subject of the first “… shall” in a statement, lower-cased and without the article. */
export function subjectPhrase(text: string): string | null {
  const m = /^\s*(?:the\s+)?(.+?)\s+shall\b/i.exec(text)
  return m ? m[1].toLowerCase() : null
}

export function expectedSubjectTypes(text: string): string[] | null {
  const p = subjectPhrase(text)
  if (!p) return null
  const hit = [...SUBJECT_PHRASES].sort((a, b) => b.phrase.length - a.phrase.length).find((s) => p.includes(s.phrase))
  return hit ? hit.types : null
}

type Quantity = { value: number; unit: string }
const UNIT_ALIASES: Record<string, string> = { dba: 'dB', db: 'dB', min: 'min', s: 's', h: 'h', km: 'km', m: 'm', kw: 'kW', '%': '%' }

/** Quantities written in a statement, e.g. “20 min”, “65 dBA”, “90 %”. */
export function quantitiesIn(text: string): Quantity[] {
  const out: Quantity[] = []
  const re = /(\d+(?:\.\d+)?)\s*(dBA|dB|min|kW|km|%|s|h|m)\b|(\d+(?:\.\d+)?)\s*(%)/gi
  for (const m of text.matchAll(re)) {
    const num = m[1] ?? m[3]
    const unit = m[2] ?? m[4]
    out.push({ value: parseFloat(num), unit: UNIT_ALIASES[unit.toLowerCase()] ?? unit })
  }
  return out
}

/** Parses a bound value as written in SysML: “20 [min]”, “0.90”, “300”. */
export function parseBoundValue(v: string): { value: number; unit: string | null } | null {
  const m = /^\s*(-?\d+(?:\.\d+)?)\s*(?:\[\s*([A-Za-z%/]+)\s*\])?\s*$/.exec(v)
  if (!m) return null
  const unit = m[2] ? (UNIT_ALIASES[m[2].toLowerCase()] ?? m[2]) : null
  return { value: parseFloat(m[1]), unit }
}

/** Kinds of quantity, with the factor that converts each unit to the kind's base unit (seconds, metres, …). */
const UNIT_KIND: Record<string, { kind: string; factor: number }> = {
  s: { kind: 'time', factor: 1 }, min: { kind: 'time', factor: 60 }, h: { kind: 'time', factor: 3600 },
  m: { kind: 'length', factor: 1 }, km: { kind: 'length', factor: 1000 },
  dB: { kind: 'sound level', factor: 1 }, kW: { kind: 'power', factor: 1 },
}
const inBase = (q: { value: number; unit: string | null }) => q.value * (q.unit ? (UNIT_KIND[q.unit]?.factor ?? 1) : 1)
const kindOf = (unit: string | null) => (unit ? (UNIT_KIND[unit]?.kind ?? unit) : null)
const close = (a: number, b: number) => Math.abs(a - b) < 1e-9

type ValueVerdict = { ok: boolean | null; message: string }

const SCALAR_NUMBER_TYPES = ['Real', 'Integer', 'Natural', 'Rational', 'Positive']

/**
 * Whether a bound value fits the parameter's declared type (sign-off review S10-N2): an ISQ quantity type (…Value, e.g.
 * DurationValue) needs a unit with the value, because only the kind of unit belongs to the type (S06 p.77); a plain
 * number type (Real, Integer, Natural) takes no unit. A percentage in the statement is written as a Real fraction
 * (course convention of the reference: 90 % is 0.90), so a plain 90 for “90 %” is flagged. null: nothing to say.
 */
export function valueAgainstType(text: string, type: string, v: string): ValueVerdict | null {
  const bv = parseBoundValue(v)
  const tn = unqualify(type.trim()).replace(/\[.*\]$/, '')
  if (!bv || !tn) return null
  if (/Value$/.test(tn) && !bv.unit) return { ok: false, message: `${tn} is a quantity type, so the value needs its unit, e.g. ${bv.value} [min] for a duration: a bare ${v} is not a ${tn}.` }
  if (SCALAR_NUMBER_TYPES.includes(tn) && bv.unit) return { ok: false, message: `${tn} is a plain number, but ${v} carries a unit. Declare the quantity type (e.g. DurationValue) or drop the unit.` }
  if (!bv.unit && bv.value >= 1 && quantitiesIn(text).some((q) => q.unit === '%' && q.value === bv.value)) return { ok: false, message: `The statement says ${bv.value} %, and the course writes percentages as Real fractions (the reference binds ${bv.value / 100}); ${v} would read as ${bv.value * 100} %.` }
  return null
}

/**
 * Compares a value written in the model (a bound parameter value or a literal limit in the constraint) with the values
 * the statement gives. Same kind and same magnitude passes (1200 [s] is 20 min); same kind but another magnitude
 * fails; a unit of another kind fails when the statement gives values of a known kind (review W10-F03: “20 [s]” for
 * “20 min” is wrong, not merely unexplained); a value the statement does not give is an advisory. null: not a value.
 */
export function valueAgainstStatement(text: string, v: string): ValueVerdict | null {
  const bv = parseBoundValue(v)
  if (!bv) return null
  const qs = quantitiesIn(text)
  if (bv.unit) {
    const known = qs.filter((q) => UNIT_KIND[q.unit])
    const sameKind = qs.filter((q) => kindOf(q.unit) === kindOf(bv.unit))
    if (sameKind.length > 0) {
      const ok = sameKind.some((q) => close(inBase(q), inBase(bv)))
      if (ok) return { ok, message: `${v} is the value the statement gives.` }
      const unitSlip = sameKind.some((q) => q.value === bv.value) ? ' The number is right but the unit is not.' : ''
      return { ok, message: `The statement says ${sameKind.map((q) => `${q.value} ${q.unit}`).join(', ')}, not ${v}. A value that disagrees with the text makes the model and the table contradict each other.${unitSlip}` }
    }
    if (known.length > 0) {
      const what = UNIT_KIND[bv.unit] ? `a ${UNIT_KIND[bv.unit].kind}` : `in a unit (${bv.unit}) the tool does not know`
      return { ok: false, message: `${v} is ${what}, but the statement’s values are ${known.map((q) => `${q.value} ${q.unit}`).join(', ')}. A value of another kind cannot be the statement’s limit.` }
    }
    return { ok: null, message: `The statement gives no value in ${bv.unit}; cite where ${v} comes from.` }
  }
  if (bv.value > 0 && bv.value < 1) {
    const pct = qs.filter((q) => q.unit === '%')
    if (pct.length === 0) return { ok: null, message: 'A fraction, but the statement gives no percentage; cite its source.' }
    const ok = pct.some((q) => close(q.value / 100, bv.value))
    return { ok, message: ok ? `${v} is the statement’s ${Math.round(bv.value * 100)} % as a fraction (the reference writes percentages as Real fractions).` : `The statement says ${pct.map((q) => `${q.value} %`).join(', ')}, which is not ${v} as a fraction.` }
  }
  const plain = (text.match(/\d+(?:\.\d+)?/g) ?? []).map(parseFloat)
  return plain.includes(bv.value) ? { ok: true, message: `${v} appears in the statement.` } : { ok: null, message: `${v} does not appear in the statement; say where it comes from (e.g. the Data Sheet).` }
}

const UPPER_WORDS = ['within', 'no more than', 'not more than', 'at most', 'at or below', 'not exceed', 'not to exceed', 'up to', 'no later than', 'less than', 'below']
const LOWER_WORDS = ['at least', 'no less than', 'not less than', 'at or above', 'no fewer than', 'more than', 'above']

/**
 * Whether the statement makes a value an upper or a lower limit, read from the limit words in the 30 characters just
 * before that value in the statement (“within 20 min”, “at least 90 %”); the nearest word wins. A “not” or “never” up
 * to two words before a limit word that does not itself carry the negation inverts it: “shall not take more than
 * 20 min” is an upper limit, “shall not be less than 90 %” a lower one (sign-off review S10-N1). null when the value
 * is not written in the statement or no limit word precedes it, and the direction check is then not made (review
 * W10-F03).
 */
export function limitDirection(text: string, v: string): 'upper' | 'lower' | null {
  const bv = parseBoundValue(v)
  if (!bv) return null
  const lower = text.toLowerCase()
  for (const m of lower.matchAll(/(\d+(?:\.\d+)?)\s*(dba|db|min|kw|km|%|s|h|m)?(?![a-z])/g)) {
    const num = parseFloat(m[1])
    const unit = m[2] ? (UNIT_ALIASES[m[2]] ?? m[2]) : null
    const matches = bv.unit
      ? !!unit && unit !== '%' && kindOf(unit) === kindOf(bv.unit) && close(inBase({ value: num, unit }), inBase(bv))
      : bv.value > 0 && bv.value < 1 ? unit === '%' && close(num / 100, bv.value) : unit === null && num === bv.value
    if (!matches) continue
    const before = lower.slice(Math.max(0, m.index - 30), m.index)
    // Nearest phrase wins; on a tie the longer phrase wins (“no less than” over “less than”).
    let best: { dir: 'upper' | 'lower'; end: number; start: number } | null = null
    for (const [dir, words] of [['upper', UPPER_WORDS], ['lower', LOWER_WORDS]] as const) {
      for (const w of words) {
        for (const hit of before.matchAll(new RegExp(`\\b${w}\\b`, 'g'))) {
          const end = hit.index + w.length
          if (!best || end > best.end || (end === best.end && hit.index < best.start)) best = { dir, end, start: hit.index }
        }
      }
    }
    if (best) {
      const phrase = before.slice(best.start, best.end)
      const preceding = lower.slice(0, m.index - before.length + best.start)
      const negated = !/^(?:not|no)\b/.test(phrase) && /\b(?:not|never)\b(?:\s+[a-z]+){0,2}\s*$/.test(preceding)
      return negated ? (best.dir === 'upper' ? 'lower' : 'upper') : best.dir
    }
  }
  return null
}

const COMPARISON = /(<=|>=|==|!=|<|>)/g

/** Splits a constraint expression into its two sides around a single comparison operator. */
export function splitComparison(expr: string): { left: string; op: string; right: string } | null {
  const ops = expr.match(COMPARISON) ?? []
  if (ops.length !== 1) return null
  const [left, right] = expr.split(ops[0]).map((s) => s.trim())
  return { left, op: ops[0], right }
}

/** Whether a side of the comparison is a feature of the subject, directly or through a chain (subject.a.b; sign-off review S10-N2). */
const featureOf = (side: string, subject: string) => new RegExp(`^${subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\.('[^']+'|[A-Za-z_][A-Za-z0-9_]*))+$`).test(side)
const LITERAL = /^-?\d+(?:\.\d+)?(?:\s*\[\s*[A-Za-z%/]+\s*\])?$/

/** All checks for one translation of one workspace requirement. */
export function checkTranslation(req: Pick<Element, 'id' | 'name' | 'text'>, t: Translation): TCheck[] {
  const text = req.text ?? ''
  const checks: TCheck[] = []

  const sn = shortNameProblem(req.id, t.shortName)
  checks.push({ id: 'short-name', label: 'Short name is the requirement ID', ok: sn === null, message: sn ?? `<'${req.id}'> is the requirement ID.`, source: 'S06 p.165; S06 p.49–50; lab plan C.2 rule 3' })

  const dn = declaredNameProblem(t.declaredName)
  checks.push({ id: 'declared-name', label: 'Declared name written legally', ok: dn === null, message: dn ?? 'Legal declared name.', source: 'S06 p.49–50' })

  const shalls = (t.docText.match(/\bshall\b/gi) ?? []).length
  const same = norm(t.docText).replace(/^\/\*|\*\/$/g, '').trim() === norm(text)
  checks.push({
    id: 'doc',
    label: 'doc carries the statement',
    ok: shalls === 1 && same ? true : shalls !== 1 ? false : null,
    message:
      shalls === 0 ? 'The doc text has no “shall”: the informal requirement text belongs in the doc comment.'
        : shalls > 1 ? 'The doc text has more than one “shall”: one requirement, one statement (Week 4).'
          : same ? 'The doc text is the workspace statement.'
            : 'The doc text differs from the statement in your workspace. Model and table must say the same thing; change one of them deliberately.',
    source: 'S10 sl.86; S06 p.165',
  })

  const subjOk = BASIC.test(t.subjectName.trim()) && t.subjectType.trim().length > 0
  checks.push({ id: 'subject', label: 'Subject declared', ok: subjOk, message: subjOk ? 'Subject declared with a name and a type.' : 'Declare the subject as name : Type (e.g. chargingSystem : ChargingSystems). A requirement is always about some subject.', source: 'S10 sl.87; S06 p.161–162' })

  const type = unqualify(t.subjectType.trim())
  const level = req.id.startsWith('REQ-STK') ? 'STK' : req.id.startsWith('REQ-SYS') ? 'SYS' : null
  if (level && type) {
    const isEnt = ENTERPRISE_TYPES.includes(type)
    const ok = level === 'STK' ? isEnt : !isEnt
    checks.push({
      id: 'subject-level',
      label: 'Subject matches the requirement level (course convention)',
      ok,
      message: ok
        ? level === 'STK' ? 'A stakeholder requirement is about the enterprise (the service as a whole).' : 'A system requirement is about a system element, not the enterprise.'
        : level === 'STK' ? 'Course convention: REQ-STK are about the service as a whole, so their subject is the enterprise (AeroLinkEnterprise).' : 'A system requirement whose subject is the whole enterprise cannot be satisfied by any one design element: choose the element the “shall” is about.',
      source: 'Course convention (reference model, sysml/reference/README.md §3.2)',
    })
  }

  const expected = expectedSubjectTypes(text)
  if (type) {
    if (expected === null) {
      checks.push({ id: 'subject-plausible', label: 'Subject is what the “shall” is about', ok: null, message: 'The tool does not recognise the subject of this statement, so it cannot judge. Name the element the “shall” is about and say why in your notes.', source: 'S06 p.161' })
    } else {
      const ok = expected.includes(type)
      checks.push({
        id: 'subject-plausible',
        label: 'Subject is what the “shall” is about',
        ok,
        message: ok ? `The statement is about “${subjectPhrase(text)}”, and ${type} is that element’s definition.` : `The statement is about “${subjectPhrase(text)}”, whose definition in the reference is ${expected.join(' or ')}, not ${type}. Only an entity that conforms to the subject’s definition can satisfy the requirement.`,
        source: 'S06 p.161',
      })
    }
  }

  const expr = t.constraint.trim().replace(/^\{|\}$/g, '').trim()
  const subj = t.subjectName.trim()
  const cmp = splitComparison(expr)
  let subjSideOf: 'left' | 'right' | null = null
  let otherSide = ''
  if (!expr) {
    checks.push({ id: 'constraint', label: 'A required constraint that can be evaluated', ok: false, message: 'Write the required constraint. A requirement with only a doc comment is a comment, not a constraint (RB-8.4 level 1).', source: 'S10 sl.86; S06 p.161' })
  } else if (cmp) {
    const subjSide = featureOf(cmp.left, subj) ? 'left' : featureOf(cmp.right, subj) ? 'right' : null
    const other = subjSide === 'left' ? cmp.right : cmp.left
    subjSideOf = subjSide
    otherSide = other
    const otherOk = other === t.paramName.trim() || LITERAL.test(other)
    const ok = subjSide !== null && otherOk
    checks.push({
      id: 'constraint',
      label: 'A required constraint that can be evaluated',
      ok,
      message: ok ? `Compares a feature of the subject (${subjSide === 'left' ? cmp.left : cmp.right}) with ${other === t.paramName.trim() ? 'the parameter' : 'a literal'}.`
        : subjSide === null ? `Neither side is a feature of the subject ${subj || '(none declared)'}. If the constraint does not read the subject, a satisfy that binds the subject asserts nothing about the satisfier.`
          : `“${other}” is neither the parameter you declared nor a number: the comparison has nothing measurable to compare against.`,
      source: 'S10 sl.86–87; S06 p.161',
    })
  } else if (featureOf(expr, subj)) {
    checks.push({ id: 'constraint', label: 'A required constraint that can be evaluated', ok: null, message: 'A Boolean feature of the subject used as the constraint (as the reference does for functional requirements). Say in the criterion how its truth is established.', source: 'S06 p.161; reference REQ-SYS-004' })
  } else {
    checks.push({ id: 'constraint', label: 'A required constraint that can be evaluated', ok: false, message: (expr.match(COMPARISON) ?? []).length > 1 ? 'Use one comparison per required constraint; split a compound requirement into two constraints or two requirements.' : 'No comparison and no Boolean feature of the subject: nothing can be evaluated true or false.', source: 'S10 sl.86; S06 p.165' })
  }

  if (t.paramName.trim()) {
    const v = t.paramValue.trim()
    if (!v) {
      const tbd = /\bTBD\b/i.test(text)
      checks.push({ id: 'value', label: 'Bound value agrees with the statement', ok: tbd ? null : false, message: tbd ? 'TBD: leave the parameter unbound, with a doc comment naming the TBD and its U item, and mark the requirement (e.g. @StatusInfo, as the reference does).' : 'The parameter has no value, and the statement has no TBD. Bind the value the statement gives.', source: 'Week 4 TBD convention; reference REQ-SYS-010' })
    } else {
      const vv = valueAgainstType(text, t.paramType, v) ?? valueAgainstStatement(text, v)
      checks.push(
        vv
          ? { id: 'value', label: 'Bound value agrees with the statement and its type', ok: vv.ok, message: vv.message, source: 'Lab plan L10; RB-8.4; S06 p.77 (units come with the value); course convention (percentages as fractions)' }
          : { id: 'value', label: 'Bound value agrees with the statement', ok: false, message: 'Write the value as a number with its unit in brackets, e.g. 20 [min], or a plain number for a count or fraction.', source: 'S06 p.77 (units come with the value)' },
      )
    }
  }

  // Review W10-F02: a literal limit written into the constraint is checked like a bound value, and against the
  // parameter if one is bound. Otherwise “<= 25 [min]” for a 20 min requirement would pass every check.
  const literal = cmp && subjSideOf && LITERAL.test(otherSide) ? otherSide : null
  if (literal) {
    const lv = parseBoundValue(literal)!
    const pv = t.paramName.trim() ? parseBoundValue(t.paramValue.trim()) : null
    const vv = valueAgainstStatement(text, literal)!
    if (pv && !(kindOf(pv.unit) === kindOf(lv.unit) && close(inBase(pv), inBase(lv)))) {
      checks.push({ id: 'limit-value', label: 'Literal limit in the constraint agrees with the statement', ok: false, message: `The constraint compares with ${literal}, but the parameter ${t.paramName.trim()} is bound to ${t.paramValue.trim()}: the constraint ignores the value you bound. Compare with the parameter.`, source: 'Lab plan L10; RB-8.4' })
    } else {
      checks.push({ id: 'limit-value', label: 'Literal limit in the constraint agrees with the statement', ok: vv.ok, message: vv.ok === true ? `${vv.message} A literal limit is legal; the course prefers a named, bound parameter that a satisfy or a verification case can refer to.` : vv.message, source: 'Lab plan L10; RB-8.4; S06 p.77 (units come with the value)' })
    }
  }

  // Review W10-F03: the comparison must point the way the statement does. The limit is the literal or the bound value
  // of the parameter; the statement's wording just before that value (“within”, “at least”) makes it an upper or a
  // lower limit. Not judged when the statement shows no direction for that value (TBD values, “every vertiport”).
  if (cmp && subjSideOf) {
    // A bound value that already failed (wrong number, unit or type) has no direction worth reporting.
    const valueFailed = checks.some((c) => c.id === 'value' && c.ok === false)
    const limitText = literal ?? (otherSide === t.paramName.trim() && !valueFailed ? t.paramValue.trim() : '')
    const dir = limitText ? limitDirection(text, limitText) : null
    if (dir) {
      const flip: Record<string, string> = { '<=': '>=', '>=': '<=', '<': '>', '>': '<', '==': '==', '!=': '!=' }
      const op = subjSideOf === 'left' ? cmp.op : flip[cmp.op] // normalised to “feature OP limit”
      const want = dir === 'upper' ? '<=' : '>='
      const strict = (dir === 'upper' && op === '<') || (dir === 'lower' && op === '>')
      const ok = op === want ? true : strict ? null : false
      const kind = dir === 'upper' ? 'an upper limit (“within”, “no more than”)' : 'a lower limit (“at least”)'
      checks.push({
        id: 'direction',
        label: 'The comparison points the way the statement does',
        ok,
        message: ok === true ? `The statement makes ${limitText} ${kind}, and the constraint reads “feature ${want} limit”.`
          : ok === null ? `The statement makes ${limitText} ${kind}, which includes the limit itself; ${op} excludes it. Use ${want} unless you mean the stricter reading, and say why.`
            : `The statement makes ${limitText} ${kind}, so the constraint must read “feature ${want} limit”. Yours reads “feature ${op} limit”, which ${op === '==' || op === '!=' ? 'is not a limit at all' : 'states the opposite requirement'}.`,
        source: 'Week 4 measurable criteria; S10 sl.86; S06 p.161',
      })
    }
  }
  return checks
}

export type TranslationSummary = { passed: number; failed: number; advisory: number }
export function summariseChecks(cs: TCheck[]): TranslationSummary {
  return { passed: cs.filter((c) => c.ok === true).length, failed: cs.filter((c) => c.ok === false).length, advisory: cs.filter((c) => c.ok === null).length }
}

/** Assembles the student’s fields as SysML text for copying. Not validated: the course-designated checker decides. */
export function assemble(t: Translation): string {
  const lines = [`requirement ${t.shortName.trim()} ${t.declaredName.trim()} {`]
  if (t.docText.trim()) lines.push(`\tdoc /* ${norm(t.docText).replace(/^\/\*|\*\/$/g, '').trim()} */`)
  if (t.subjectName.trim()) lines.push(`\tsubject ${t.subjectName.trim()} : ${t.subjectType.trim()};`)
  if (t.paramName.trim()) lines.push(`\tattribute ${t.paramName.trim()} : ${t.paramType.trim() || '<Type>'}${t.paramValue.trim() ? ` = ${t.paramValue.trim()}` : ''};`)
  if (t.constraint.trim()) lines.push(`\trequire constraint { ${t.constraint.trim().replace(/^\{|\}$/g, '').trim()} }`)
  lines.push('}')
  return lines.join('\n')
}
