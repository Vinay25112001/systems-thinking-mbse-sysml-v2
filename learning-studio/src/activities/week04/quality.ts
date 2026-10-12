// Week 4: requirement quality heuristics (pure logic, no React).
//
// Each check makes one quality characteristic from the readings operational, as a text heuristic, and cites it.
// These checks are HEURISTICS. They can flag likely defects and confirm that required attributes are there. They
// cannot judge whether a requirement is necessary, feasible, correct or consistent with the rest of the set. That
// judgement is requirement verification and validation by review (R13 p.566), which these checks support but do not
// replace. The vague-term list, the unit pattern and the parent-level rule are instructor-authored; the
// characteristics they stand for come from the cited pages.
import type { Citation } from '../../content/readings'
import { kindOfId, type ElementKind, type ElementProvenance } from '../../model/engineering'
import type { Batch } from '../../state/Workspace'

export type Level = 'STK' | 'SYS'
export type ReqType = 'functional' | 'performance' | 'interface' | 'constraint'
export type Method = 'inspection' | 'analysis' | 'demonstration' | 'test'

export const REQ_TYPES: { id: ReqType; label: string }[] = [
  { id: 'functional', label: 'Functional' },
  { id: 'performance', label: 'Performance' },
  { id: 'interface', label: 'Interface' },
  { id: 'constraint', label: 'Constraint' },
]
export const METHODS: { id: Method; label: string; definition: string }[] = [
  { id: 'inspection', label: 'Inspection', definition: 'Visual inspection of equipment and evaluation of drawings and design data, for physical characteristics and workmanship (DoD calls it “examination”, R49 p.149).' },
  { id: 'analysis', label: 'Analysis', definition: 'Recognised analytic techniques, including computer models, used to interpret or explain behaviour or performance (R49 p.149).' },
  { id: 'demonstration', label: 'Demonstration', definition: 'Operation of the system where visual observation is the primary means of verification; used when quantitative assurance is not required (R49 p.149).' },
  { id: 'test', label: 'Test', definition: 'An activity under fully controlled and traceable conditions that produces data used to evaluate quantitative characteristics (R49 p.150).' },
]

/** A requirement as the student drafts it in the quality lab. Parent and AROU entries are existing workspace IDs. */
export type Draft = {
  level: Level
  name: string
  text: string
  type?: ReqType
  method?: Method
  /** Verification success criterion (R13 p.559). Optional but advised. */
  criterion?: string
  rationale: string
  parents: string[]
  /** Existing U- or A- items that record the TBD/TBR. */
  arou: string[]
  /** The `tbd` attribute of each linked AROU item, when it records one (looked up from the model by the caller). */
  arouTbd?: Record<string, string | undefined>
  /** A new Unknown created together with the requirement when no existing item covers the TBD/TBR. */
  newUnknown?: NewUnknown
}

/** TBX management (R13 p.565): the work needed to close it, an owner, and (course rule, L4) a need-by date. */
export type NewUnknown = { name: string; text: string; owner: string; resolution?: string; needBy?: string }

export type CheckStatus = 'pass' | 'fail' | 'advisory' | 'na'
export type CheckId =
  | 'subject' | 'single-shall' | 'binding' | 'vague' | 'measurable' | 'range' | 'negative'
  | 'design-free' | 'tbx' | 'method' | 'method-fit' | 'criterion' | 'rationale' | 'parent' | 'parent-level'

export type CheckResult = {
  id: CheckId
  label: string
  /** The quality characteristic the heuristic operationalises, in the source's words. */
  characteristic: string
  cite: Citation[]
  status: CheckStatus
  message: string
}

// ---------------------------------------------------------------------------------------------
// Text helpers

/** Words and phrases that usually make a requirement ambiguous or unverifiable unless a measurable criterion is given.
 * Instructor-authored list; R54 p.329 (avoid vague, general statements), R55 p.370 (“maximize”, “minimize”, “easy to use”). */
export const VAGUE_TERMS = [
  'user-friendly', 'user friendly', 'easy to use', 'easy', 'easily', 'adequate', 'adequately', 'sufficient', 'sufficiently',
  'appropriate', 'as appropriate', 'reasonable', 'reasonably', 'quick', 'quickly', 'fast', 'rapid', 'rapidly', 'timely',
  'efficient', 'efficiently', 'robust', 'flexible', 'seamless', 'seamlessly', 'state-of-the-art', 'minimize', 'minimise',
  'maximize', 'maximise', 'optimize', 'optimise', 'as possible', 'as required', 'if practical', 'etc', 'and/or',
  'approximately', 'normal', 'normally', 'safe', 'safely', 'unsafe', 'quiet', 'quietly', 'reliable', 'acceptable',
  'good', 'better', 'best', 'significant', 'typical', 'typically', 'minimal', 'high', 'low',
  // added after the Week 4 review (W4-F01): superlatives and open-ended verbs that hide the compliance condition
  'highest', 'lowest', 'possible', 'as needed', 'support', 'supports', 'handle', 'handles', 'facilitate', 'facilitates',
]

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
const VAGUE_RE = new RegExp(`(?<![\\w-])(${[...VAGUE_TERMS].sort((a, b) => b.length - a.length).map(escape).join('|')})(?![\\w-])`, 'gi')

/** A number followed by a unit or a counted noun. Instructor-authored pattern. */
const NUM_UNIT = /\d+(?:[.,]\d+)?\s*(?:%|percent\b|min\b|minutes?\b|ms\b|s\b|sec\b|seconds?\b|h\b|hours?\b|days?\b|months?\b|dBA\b|dB\b|km\/h\b|km\b|m\b|kg\b|kWh\b|kW\b|V\b|°C|trips?\b|passengers?\b|seats?\b|aircraft\b|flights?\b|requests?\b|movements?\b|vertiports?\b|transactions?\b)/i
const BOUND = /\b(at least|at most|no more than|no less than|not (?:to )?exceed|within|up to|maximum|minimum|or more|or less|or fewer|between|greater than|less than|fewer than|more than|below|above|exceeds?|exceeding|under|or above|or below)\b|[≤≥<>]/i
export const TBX_RE = /\bTB[DR](?:-\d+)?\b/
/** A number with a unit of measurement (time, noise, speed, power, energy, voltage, temperature, percentage), not a
 * count of things. "4 passengers" counts; "within 20 min" measures. Instructor-authored. */
const MEASURE = /\d+(?:[.,]\d+)?\s*(?:%|percent\b|min\b|minutes?\b|ms\b|s\b|sec\b|seconds?\b|h\b|hours?\b|dBA\b|dB\b|km\/h\b|kWh\b|kW\b|V\b|°C)/i
/** Units whose compliance needs quantitative evidence (test or analysis), not observation (R49 p.149–150). A percentage
 * is left out: "100 % of demonstrated cases" counts observations; it is not a measured quantity. */
const QUANT_MEASURE = /\d+(?:[.,]\d+)?\s*(?:min\b|minutes?\b|ms\b|s\b|sec\b|seconds?\b|h\b|hours?\b|dBA\b|dB\b|km\/h\b|kWh\b|kW\b)/i
/** Clauses that describe the situation, not the performance ("… whose forecast within the next 30 min exceeds …"). */
const CONDITION_CLAUSE = /\b(?:when|whenever|if|whose|where|while|unless)\b[^,;]*/gi
/** Phrases that usually introduce a design solution. Instructor-authored; R54 p.330. */
const SOLUTION = /\b(using|by means of|by using|shall use|shall be (?:made|built) (?:of|from|with)|implemented (?:in|with|by|using)|via an?|equipped with|fitted with|brand[- ]?\w*|vendor[- ]?\w*)\b/i
/** Equipment named with a count or a rating ("two 350 kW DC fast chargers"): a design choice, not a result. */
const EQUIPMENT = /\b(?:(?:one|two|three|four|five|six|\d+)\s+(?:[\w-]+\s+){0,4}|\d+(?:[.,]\d+)?\s*(?:kW|kWh|V|A)\s+(?:[\w-]+\s+){0,3})(chargers?|batter(?:y|ies)|motors?|rotors?|propellers?|radars?|cameras?|sensors?|servers?|generators?|transformers?|sprinklers?)\b/i

export const countShall = (t: string) => (t.match(/\bshall\b/gi) ?? []).length
export const vagueTermsIn = (t: string) => [...new Set((t.match(VAGUE_RE) ?? []).map((m) => m.toLowerCase()))]
export const hasMeasurableValue = (t: string) => NUM_UNIT.test(t)
export const hasTbx = (t: string) => TBX_RE.test(t)
export const tbxToken = (t: string) => t.match(TBX_RE)?.[0]
/** Every distinct TBD/TBR token in a statement, in order. */
export const tbxTokens = (t: string) => [...new Set(t.match(new RegExp(TBX_RE.source, 'g')) ?? [])]
/** A value with a unit of measurement (not a mere count) that is stated as a bound ("within 20 min", "≤ 65 dBA"). */
export const hasBoundedMeasure = (t: string) => MEASURE.test(t) && BOUND.test(t)
/** Quantitative performance values in the statement, ignoring values inside condition clauses. */
export const performanceValue = (t: string) => t.replace(CONDITION_CLAUSE, ' ').match(QUANT_MEASURE)?.[0]

const STOP = new Set(['the', 'and', 'that', 'this', 'with', 'from', 'shall', 'each', 'every', 'within', 'into', 'than', 'have', 'their', 'there', 'which', 'when', 'will', 'would', 'should', 'must', 'been', 'being', 'they', 'them', 'such', 'only', 'also', 'more', 'less', 'least', 'most', 'what', 'where', 'while', 'for', 'are', 'not', 'its', 'any', 'all'])
const contentWords = (t: string) => t.toLowerCase().match(/[a-z][a-z-]{2,}/g)?.filter((w) => !STOP.has(w)) ?? []
const wordCount = (t: string) => t.trim().split(/\s+/).filter(Boolean).length

/** Fraction of the rationale's content words that also appear in the statement (1 = pure restatement). */
export function restatementRatio(statement: string, rationale: string): number {
  const r = [...new Set(contentWords(rationale))]
  if (!r.length) return 0
  const s = new Set(contentWords(statement))
  return r.filter((w) => s.has(w)).length / r.length
}

/** The words between the start of the clause and the first "shall" (the subject). */
export function subjectOf(t: string): string {
  const i = t.search(/\bshall\b/i)
  if (i < 0) return ''
  const before = t.slice(0, i)
  const clause = before.slice(before.lastIndexOf(',') + 1)
  return clause.trim()
}

/** Kind of a parent ID, including the requirement level for REQ IDs. */
export function parentClass(id: string): ElementKind | 'REQ-STK' | 'REQ-SYS' | undefined {
  if (id.startsWith('REQ-STK-')) return 'REQ-STK'
  if (id.startsWith('REQ-SYS-')) return 'REQ-SYS'
  return kindOfId(id)
}

// ---------------------------------------------------------------------------------------------
// The checks

const C = {
  r13: (pages: string): Citation => ({ reading: 'R13', pages }),
  r48: (pages: string): Citation => ({ reading: 'R48', pages }),
  r49: (pages: string): Citation => ({ reading: 'R49', pages }),
  r54: (pages: string): Citation => ({ reading: 'R54', pages }),
  r55: (pages: string): Citation => ({ reading: 'R55', pages }),
}

/** Runs every heuristic on a draft. The order is the order shown to the student. */
export function checkRequirement(d: Draft): CheckResult[] {
  const t = d.text.trim()
  const shalls = countShall(t)
  const vague = vagueTermsIn(t)
  const measurable = hasMeasurableValue(t)
  const tbx = hasTbx(t)
  const out: CheckResult[] = []
  const add = (r: CheckResult) => out.push(r)

  const subject = subjectOf(t)
  add({
    id: 'subject', label: 'Names the entity that is obliged', characteristic: 'Clear and concise; the requirement is an obligation for an entity',
    cite: [C.r13('558'), C.r48('144')],
    status: shalls === 0 ? 'na' : wordCount(subject) >= 2 ? 'pass' : 'fail',
    message: shalls === 0 ? 'No “shall”, so no subject can be found.' : wordCount(subject) >= 2 ? `Subject: “${subject}”.` : 'Put the obliged entity before “shall” (e.g. “The charging system shall …”).',
  })
  add({
    id: 'single-shall', label: 'Exactly one “shall”', characteristic: 'Singular; specific and singular (one atomic thought)',
    cite: [C.r48('144'), C.r54('329')],
    status: shalls === 1 ? 'pass' : 'fail',
    message: shalls === 1 ? 'One binding statement.' : shalls === 0 ? 'No “shall”: a binding requirement needs one (R54 p.330).' : `${shalls} “shall”s: split it into ${shalls} requirements, each with its own ID, rationale and method.`,
  })
  const modal = t.match(/\b(should|may|must|will)\b/i)?.[1]
  add({
    id: 'binding', label: 'No non-binding word in place of “shall”', characteristic: '“Shall” indicates a binding provision; “should”/“may” are non-binding and “will” declares purpose',
    cite: [C.r54('330'), C.r55('369')],
    status: modal ? 'advisory' : 'pass',
    message: modal ? `“${modal}” is not binding in a specification. Use it only if you intend a preference or a declaration of purpose, not an obligation.` : 'No competing modal verb.',
  })
  add({
    id: 'vague', label: 'No vague or unmeasurable terms', characteristic: 'Unambiguous; testable (vague, general statements are to be avoided)',
    cite: [C.r48('144'), C.r54('329'), C.r55('370')],
    // A vague word is only softened by a value that measures (a unit, stated as a bound) or by a TBD/TBR. A count of
    // things ("for 4 passengers") does not bound "safe" or "quiet" (W4-F01 a).
    status: vague.length === 0 ? 'pass' : hasBoundedMeasure(t) || tbx ? 'advisory' : 'fail',
    message: vague.length === 0 ? 'No term from the vague-term list.' : hasBoundedMeasure(t) || tbx
      ? `Contains ${vague.map((v) => `“${v}”`).join(', ')}. A bounded measurable value is present: make sure the value, not the word, defines compliance.`
      : `Contains ${vague.map((v) => `“${v}”`).join(', ')} with no bounded, measurable value (a count of things does not measure it). Two readers could disagree about compliance.`,
  })
  const needsNumber = d.type === 'performance'
  add({
    id: 'measurable', label: 'Measurable value with a unit (or a TBD/TBR)', characteristic: 'Measurable/quantifiable; performance requirements are quantifiable, testable and/or verifiable',
    cite: [C.r48('144'), C.r55('370')],
    status: measurable || tbx ? 'pass' : needsNumber ? 'fail' : 'advisory',
    message: measurable ? 'A value with a unit was found.' : tbx ? 'The value is a placeholder (TBD/TBR); see the TBX check.'
      : needsNumber ? 'A performance requirement says how well, how many or how fast: give the value and unit, or a TBD tied to an Unknown.'
      : 'No value with a unit. That can be right for a functional, interface or constraint requirement, but the condition for compliance must still be observable.',
  })
  add({
    id: 'range', label: 'Values are bounded, not single points', characteristic: 'Avoid one-point values; use ranges (minimum of, maximum of, within, …)',
    cite: [C.r55('370')],
    status: !measurable ? 'na' : BOUND.test(t) ? 'pass' : 'advisory',
    message: !measurable ? 'No value to bound.' : BOUND.test(t) ? 'The value is stated as a bound.' : 'The value reads as a single point. Say “within”, “at least”, “no more than” … so a test result is unambiguous.',
  })
  add({
    id: 'negative', label: 'Avoids “shall not”', characteristic: 'Avoid “shall not”: it is very difficult to prove a negative',
    cite: [C.r55('370')],
    status: /\bshall\s+not\b/i.test(t) ? 'advisory' : 'pass',
    message: /\bshall\s+not\b/i.test(t) ? 'Prohibitions are hard to verify. Prefer a positive obligation that can be observed (e.g. “shall place a dispatch hold when …”), or state the finite set of cases that the verification will cover.' : 'Stated positively.',
  })
  const sol = t.match(SOLUTION)?.[0] ?? t.match(EQUIPMENT)?.[0]
  add({
    id: 'design-free', label: 'States what, not how', characteristic: 'Design-free: a requirement reflects “what” the system shall accomplish, the design “how”',
    cite: [C.r54('330'), C.r13('558'), C.r55('371')],
    status: sol ? 'advisory' : 'pass',
    message: sol ? `“${sol}” often introduces a design solution. Keep it only if the solution is a genuine constraint (and say why in the rationale); otherwise state the result needed.` : 'No solution phrase from the heuristic list (a reviewer must still judge the level).',
  })
  // TBX (W4-F12): every token must be owned. An Unknown (U) may own a TBD or a TBR; an Assumption (A) only a TBR, where a
  // value is known but doubted (R13 p.565). If the linked item records which TBX it owns (`tbd` attribute), it must
  // be this one. A new Unknown needs an owner, the resolution work and a need-by date (L4 step 4).
  const tokens = tbxTokens(t)
  const nu = d.newUnknown
  const nuMissing = !nu ? ['name', 'description', 'owner', 'resolution work', 'need-by date'] : [
    ...(nu.name.trim() ? [] : ['name']),
    ...(wordCount(nu.text) >= 5 ? [] : ['description (at least five words)']),
    ...(nu.owner.trim() ? [] : ['owner']),
    ...(wordCount(nu.resolution ?? '') >= 3 ? [] : ['resolution work (at least three words)']),
    ...((nu.needBy ?? '').trim() ? [] : ['need-by date']),
  ]
  const nuOk = !!nu && nuMissing.length === 0
  const ownerOf = (token: string) => d.arou.filter((id) => {
    const k = kindOfId(id)
    if (k !== 'U' && !(k === 'A' && token.startsWith('TBR'))) return false
    const rec = d.arouTbd?.[id]
    return !rec || rec.split(/[,\s]+/).includes(token)
  })
  const unowned = tokens.filter((tok) => ownerOf(tok).length === 0)
  const misuse = d.arou.filter((id) => kindOfId(id) === 'A').length > 0 && tokens.every((tok) => tok.startsWith('TBD'))
  add({
    id: 'tbx', label: 'Every TBD/TBR is tied to the AROU item that owns it', characteristic: 'TBX management: identify each TBX, the work to close it and its owner',
    cite: [C.r13('565')],
    status: !tokens.length ? 'na' : unowned.length === 0 || (nuOk && d.arou.length === 0) ? 'pass' : 'fail',
    message: !tokens.length ? 'No TBD or TBR.'
      : unowned.length === 0 ? tokens.map((tok) => `${tok} is tracked by ${ownerOf(tok).join(', ')}`).join('; ') + '.'
      : nuOk && d.arou.length === 0 ? `${tokens.join(', ')} will be tracked by a new Unknown owned by ${nu!.owner.trim()}, needed by ${nu!.needBy!.trim()}.`
      : `${unowned.join(', ')} has no owning AROU item.${misuse ? ' An Assumption can own a TBR (a doubted value), not a TBD (an unknown value).' : ''} Link the Unknown whose TBX this is, or create a new Unknown${nu ? ` (missing: ${nuMissing.join(', ') || 'unlink the other items first'})` : ' with an owner, the resolution work and a need-by date'}.`,
  })
  add({
    id: 'method', label: 'Verification method stated', characteristic: 'Every requirement must have a verification method identified',
    cite: [C.r55('370'), C.r49('149–150')],
    status: d.method ? 'pass' : 'fail',
    message: d.method ? `Method: ${d.method}.` : 'Choose inspection, analysis, demonstration or test.',
  })
  // Method fit (W4-F01 b): the evidence a requirement needs follows from what it asks for, not from the type label. A
  // performance requirement, or any statement or criterion with a quantitative value outside a condition clause, needs
  // quantitative evidence — test or analysis (R49 p.149–150).
  const crit = (d.criterion ?? '').trim()
  const quantValue = performanceValue(t) ?? crit.match(QUANT_MEASURE)?.[0]
  const weak = d.method === 'demonstration' || d.method === 'inspection'
  const needsQuant = d.type === 'performance' || !!quantValue
  add({
    id: 'method-fit', label: 'Method fits the kind of evidence needed', characteristic: 'Demonstration is used when quantitative assurance is not required; test and analysis evaluate quantitative characteristics',
    cite: [C.r49('149–150')],
    status: !d.method || !d.type ? 'na' : needsQuant && weak ? 'fail' : 'pass',
    message: !d.method || !d.type ? 'Choose a type and a method first.' : needsQuant && weak
      ? `${d.type === 'performance' ? 'A performance requirement' : `The value “${quantValue}”`} needs quantitative evidence; ${d.method} is for cases where quantitative assurance is not required. Use test or analysis${d.type !== 'performance' ? ', or — if the value only describes a situation — move it into a condition (“when …”)' : ''}.`
      : 'The method can produce the evidence this requirement needs.',
  })
  // Criterion (W4-F01 c): L4 requires a measurable criterion or a TBD with an AROU entry for EVERY requirement.
  const critVague = vagueTermsIn(crit)
  const critMeasurable = NUM_UNIT.test(crit) || hasTbx(crit) || /<=|>=|[≤≥<>]|\b(every|each|all|zero|none|no more than|at least|within)\b/i.test(crit)
  add({
    id: 'criterion', label: 'Verification success criterion recorded and observable', characteristic: 'Defining system verification success criteria helps ensure the requirement is well-formed and verifiable',
    cite: [C.r13('559'), C.r13('566')],
    status: crit.length < 5 ? 'fail' : critVague.length && !hasBoundedMeasure(crit) && !hasTbx(crit) ? 'fail' : critMeasurable ? 'pass' : 'advisory',
    message: crit.length < 5
      ? 'Write the pass condition the verification will check (e.g. “pad arrival to dispatch-ready ≤ 25 min in every trial”). L4 requires one for every requirement, or a TBD tied to an AROU item.'
      : critVague.length && !hasBoundedMeasure(crit) && !hasTbx(crit) ? `The criterion is itself vague (${critVague.map((v) => `“${v}”`).join(', ')}): a verifier could not say pass or fail.`
      : critMeasurable ? 'Criterion recorded with a threshold, a TBX or a stated population.'
      : 'Say how many trials or cases, and the threshold each must meet; otherwise two verifiers may disagree (R55 p.370).',
  })
  const ratio = restatementRatio(t, d.rationale)
  const rw = wordCount(d.rationale)
  add({
    id: 'rationale', label: 'Rationale says why, not what', characteristic: 'Rationale communicates why the requirement is needed, its assumptions and the source of its numbers',
    cite: [C.r13('559')],
    status: rw < 6 ? 'fail' : ratio >= 0.7 ? 'fail' : 'pass',
    message: rw < 6 ? 'Give a rationale of at least one sentence: why is it needed, where does the number come from?' : ratio >= 0.7
      ? `${Math.round(ratio * 100)} % of the rationale’s words repeat the statement. Explain why the requirement exists and where its value comes from instead.`
      : 'The rationale adds information beyond the statement (a reviewer still judges whether it is true).',
  })
  add({
    id: 'parent', label: 'Traces to a parent', characteristic: 'Traceable to a source, such as a higher-level requirement or an operational need',
    cite: [C.r54('329'), C.r48('144'), C.r55('368')],
    status: d.parents.length ? 'pass' : 'fail',
    message: d.parents.length ? `Parent(s): ${d.parents.join(', ')}.` : 'Choose at least one NEED, CAP or higher requirement that motivates this requirement.',
  })
  const pl = parentLevelFinding(d.level, d.parents)
  add({
    id: 'parent-level', label: 'Parent is at the right level', characteristic: 'System requirements trace to the user (stakeholder) requirements they implement',
    cite: [C.r55('368'), C.r55('371'), C.r13('562')],
    status: pl.status, message: pl.message,
  })
  return out
}


/** Course convention for parent levels (instructor-authored; reflects the NEED → REQ-STK → REQ-SYS layering of L4). */
export function parentLevelFinding(level: Level, parents: string[]): { status: CheckStatus; message: string } {
  if (!parents.length) return { status: 'na', message: 'No parent yet.' }
  const classes = parents.map((p) => [p, parentClass(p)] as const)
  if (level === 'STK') {
    const inverted = classes.filter(([, c]) => c === 'REQ-SYS').map(([p]) => p)
    if (inverted.length) return { status: 'fail', message: `A stakeholder requirement cannot derive from a system requirement (${inverted.join(', ')}): the trace is upside down.` }
    const odd = classes.filter(([, c]) => !['NEED', 'CAP', 'MGO', 'REQ-STK', 'CON'].includes(c ?? '')).map(([p]) => p)
    if (odd.length) return { status: 'advisory', message: `${odd.join(', ')} is not a need, capability, objective or stakeholder requirement. Check that it really motivates this requirement.` }
    return { status: 'pass', message: 'Derived from needs, capabilities or objectives, as a stakeholder requirement should be.' }
  }
  const odd = classes.filter(([, c]) => !['REQ-STK', 'REQ-SYS', 'CAP'].includes(c ?? '')).map(([p]) => p)
  if (odd.length) return { status: 'advisory', message: `${odd.join(', ')} skips the stakeholder-requirement level. That is acceptable only if no REQ-STK carries the obligation; say so in the rationale.` }
  return { status: 'pass', message: 'Derived from a stakeholder requirement, a higher system requirement or a capability.' }
}

export type Summary = { pass: number; fail: number; advisory: number; na: number; recordable: boolean }
export function summarise(results: CheckResult[]): Summary {
  const n = (s: CheckStatus) => results.filter((r) => r.status === s).length
  return { pass: n('pass'), fail: n('fail'), advisory: n('advisory'), na: n('na'), recordable: n('fail') === 0 && !!results.length }
}

/**
 * Builds the atomic workspace batch: the REQ, its derives-from links, and the TBX Unknown (new or existing). Owner
 * initials and provenance come from the shared ProvenanceOwnerFields (lab plan C.2 rule 5; RB-12.3 AI tag).
 */
export function buildBatch(d: Draft, po: { owner: string; provenance: ElementProvenance } = { owner: '', provenance: 'team-derived' }): Batch {
  const tokens = tbxTokens(d.text)
  const tbd = tokens.join(', ')
  const owner = po.owner.trim().toUpperCase() || undefined
  const elements: NonNullable<Batch['elements']> = [
    {
      key: 'req', kind: 'REQ', reqLevel: d.level, name: d.name.trim() || d.text.trim().slice(0, 60), text: d.text.trim(), owner, provenance: po.provenance,
      attributes: {
        level: d.level === 'STK' ? 'stakeholder' : 'system',
        ...(d.type ? { type: d.type } : {}),
        ...(d.method ? { method: d.method } : {}),
        ...((d.criterion ?? '').trim() ? { criterion: d.criterion!.trim() } : {}),
        rationale: d.rationale.trim(),
        ...(tbd ? { tbd } : {}),
      },
    },
  ]
  const links: NonNullable<Batch['links']> = d.parents.map((p) => ({ source: 'req', type: 'derives-from' as const, target: p, rationale: 'Recorded in Lab L4' }))
  if (tbd) {
    for (const a of d.arou) links.push({ source: a, type: 'affects', target: 'req', rationale: tbd })
    if (d.newUnknown && !d.arou.length) {
      const nu = d.newUnknown
      elements.push({
        key: 'u', kind: 'U', name: nu.name.trim(), text: nu.text.trim(), owner, provenance: po.provenance,
        attributes: { owner: nu.owner.trim(), resolution: (nu.resolution ?? '').trim(), needBy: (nu.needBy ?? '').trim(), tbd },
      })
      links.push({ source: 'u', type: 'affects', target: 'req', rationale: tbd })
    }
  }
  return { elements, links }
}

export const EMPTY_DRAFT: Draft = { level: 'SYS', name: '', text: '', rationale: '', criterion: '', parents: [], arou: [] }
