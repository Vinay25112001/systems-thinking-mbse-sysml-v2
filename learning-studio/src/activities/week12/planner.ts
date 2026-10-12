// Week 12 activity 3 (B12.1, B12.2; pure): verification planner.
// A VER item records method, objective, subject, level, environment, success criterion and verdict logic, and verifies
// one requirement (lab plan L12; RB-10.2, 10.3). The checks below are HEURISTICS with a cited basis. They catch common,
// realistic planning defects - an untestable or circular criterion, a limit that differs from the requirement, a
// method that cannot produce the evidence the criterion needs - but they cannot judge whether a plan is good; the
// instructor and the review do. The verdict vocabulary (pass / fail / inconclusive / error) is SysML's VerdictKind
// (S10 sl.96; S06 p.173); "error = the procedure was not executed as planned" is the course's reading of S06's "an error
// occurred during the performance of the verification".
import type { Element, EngineeringModel } from '../../model/engineering'

export type Method = 'test' | 'analysis' | 'inspection' | 'demonstration'
export const METHODS: { id: Method; label: string; sysml: string }[] = [
  { id: 'test', label: 'Test', sysml: 'VerificationMethodKind::test' },
  { id: 'analysis', label: 'Analysis', sysml: 'VerificationMethodKind::analyze' },
  { id: 'inspection', label: 'Inspection', sysml: 'VerificationMethodKind::inspect' },
  { id: 'demonstration', label: 'Demonstration', sysml: 'VerificationMethodKind::demo' },
]
export const LEVELS = ['system', 'subsystem', 'component'] as const

export type VerPlan = {
  target: string
  method: Method | ''
  objective: string
  subject: string
  level: (typeof LEVELS)[number] | ''
  environment: string
  successCriterion: string
  pass: string
  fail: string
  inconclusive: string
}

export const blankPlan = (target = ''): VerPlan => ({ target, method: '', objective: '', subject: '', level: '', environment: '', successCriterion: '', pass: '', fail: '', inconclusive: '' })

export type PlanCheck = { field: keyof VerPlan; severity: 'error' | 'warning' | 'ok'; message: string }

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length
const DESIGN_ID = /\b(?:PHY|LOG|FN|IF|AI|INFO|ENT|EXT)-\d{3}\b/
// Judgement words: no observation can fail them, whatever numbers surround them ("performed well").
const JUDGEMENT = /\b(?:adequate(?:ly)?|sufficient(?:ly)?|acceptabl[ey]|reasonabl[ey]|user[- ]friendly|satisfactor(?:y|ily)|good|optimal|seamless(?:ly)?|easy|easily|as (?:required|needed|specified|appropriate|expected))\b|(?<!\bas )\bwell\b(?! as\b)/i
// Hedge words: harmless when the criterion also states a number and a comparison ("correctly placed for all 20"),
// untestable when they are the only criterion ("charges quickly").
const HEDGE = /\b(?:quick(?:ly)?|fast|robust(?:ly)?|reliabl[ey]|minimal|normal operation|properly|correctly|successfully|accurately|appropriate(?:ly)?)\b/i
const CIRCULAR = /\b(?:meets?|satisf(?:y|ies|ied)|complies with|compliant with|fulfil(?:l)?s?|conforms? to)\b[^.]*\b(?:requirement|REQ-(?:STK|SYS)-\d{3})\b|\b(?:requirements?|REQ-(?:STK|SYS)-\d{3})\b[^.]*\b(?:is|are|was|were) (?:met|satisfied|fulfilled|achieved)\b/i
const COMPARATOR = /<=|>=|≤|≥|<|>|=|\bat (?:most|least)\b|\bwithin\b|\bno (?:more|less|fewer) than\b|\bnot? exceed|\bbelow\b|\babove\b|\b\d+ of \d+\b|\bevery\b|\ball\b|\bnone\b|\bzero\b/i
// A stated limit besides a unit quantity: a count compared with a number ("6 of 6", "none of 20", "at least 99").
const LIMIT = /\b\d+\s+of\s+\d+\b|\bnone of\b|\bzero\b|[<>≤≥]=?\s*\d|\bat (?:most|least)\s+\d|\bno (?:more|less|fewer) than\s+\d/i
const TBD = /\bTBD-\d{2}\b/
const QTY = /(\d+(?:\.\d+)?)\s*(min|s|h|dBA|dB|kW|%|km|kt)(?![A-Za-z])/g
const MEASURED_UNITS = new Set(['min', 's', 'h', 'dBA', 'dB', 'kW', 'km', 'kt'])
const LONG_HORIZON = /\bcalendar month\b|\beach month\b|\bper month\b|\bper year\b|\bevery flight plan\b|\bplan every flight\b/i
// A comparator directly followed by a unit quantity. The direction says whether the number is an upper bound (max)
// or a lower bound (min). "within the next 30 min" is not a bound: words stand between the comparator and the number.
const BOUND = /(<=|>=|≤|≥|<|>|\bwithin\b|\bat most\b|\bat least\b|\bno more than\b|\bno less than\b|\bnot exceed(?:ing)?\b|\bexceeds?\b|\bexceeding\b|\bbelow\b|\babove\b|\bunder\b|\bover\b|\bmore than\b|\bless than\b|\bup to\b)\s*(\d+(?:\.\d+)?)\s*(min|s|h|dBA|dB|kW|%|km|kt)(?![A-Za-z])/gi
const MAX_WORDS = new Set(['<=', '<', '≤', 'within', 'at most', 'no more than', 'not exceed', 'not exceeding', 'below', 'under', 'less than', 'up to'])

export type Bound = { dir: 'max' | 'min'; value: number; unit: string }
export function bounds(text: string): Bound[] {
  return [...text.matchAll(BOUND)].map((m) => ({ dir: MAX_WORDS.has(m[1].toLowerCase()) ? 'max' : 'min', value: parseFloat(m[2]), unit: m[3] === 'dB' ? 'dBA' : m[3] }))
}

export function quantities(text: string): { value: number; unit: string }[] {
  return [...text.matchAll(QTY)].map((m) => ({ value: parseFloat(m[1]), unit: m[2] === 'dB' ? 'dBA' : m[2] }))
}

/** What the planner knows about the model around the requirement: the elements that satisfy it. */
export type PlanContext = { satisfiers?: string[] }

/** Checks of one plan against the requirement it verifies. `req` is undefined when the target is not an active REQ. */
export function checkPlan(p: VerPlan, req: Element | undefined, ctx: PlanContext = {}): PlanCheck[] {
  const c: PlanCheck[] = []
  const add = (field: keyof VerPlan, severity: PlanCheck['severity'], message: string) => c.push({ field, severity, message })
  const rtext = `${req?.text ?? ''} ${String(req?.attributes?.criterion ?? '')}`
  const rmethod = String(req?.attributes?.method ?? '')
  const tbd = String(req?.attributes?.tbd ?? '') || (TBD.exec(rtext)?.[0] ?? '')
  const tbdItem = String(req?.attributes?.tbdItem ?? '')

  add('target', req ? 'ok' : 'error', req ? `Verifies ${req.id}.` : 'Choose an active requirement: a VER verifies a requirement (course link VER verifies REQ; in SysML, verify inside the objective, S10 sl.96).')

  // Method
  if (!p.method) add('method', 'error', 'Choose a method: inspection, analysis, demonstration or test (SysML VerificationMethodKind: inspect, analyze, demo, test; S06 p.176).')
  else {
    add('method', 'ok', `Method ${p.method}.`)
    if (req && rmethod && rmethod !== p.method) add('method', 'warning', `The requirement records ${rmethod} as its verification method (Week 4). Align them, or record why the method changed: the program decides how each requirement is verified, and the verification matrix is part of the baseline (R49 p.149).`)
  }
  const crit = p.successCriterion
  const critQty = quantities(crit)
  const measured = critQty.filter((q) => MEASURED_UNITS.has(q.unit))
  if (p.method === 'inspection' && (measured.length > 0 || req?.attributes?.type === 'performance'))
    add('method', 'error', 'Inspection checks properties determined by observation, with no stimuli (R23a p.639); examination covers physical characteristics, marking and workmanship (R49 p.149). A time, noise or power level under operating conditions needs a test (or an analysis).')
  if (p.method === 'demonstration' && measured.length > 0)
    add('method', 'warning', `The criterion states a measured quantity (${measured.map((q) => `${q.value} ${q.unit}`).join(', ')}). DoD uses demonstration when quantitative assurance is not required (R49 p.149), and SEBoK’s demonstration uses no or minimal instrumentation, but SEBoK adds that it may suit requirements stated in statistical terms, such as a mean time to repair (R23a p.639). Say which case this is; if the value must be measured with instruments, choose test or analysis of recorded data.`)
  if (p.method === 'test' && LONG_HORIZON.test(rtext))
    add('method', 'warning', 'The requirement covers every case or a long period (each month, every flight plan). A test samples a few cases; analysis is used where testing to realistic conditions cannot be achieved or is not cost-effective (R23a p.639). Justify the test, or combine it with analysis.')

  // Objective, subject, level, environment
  add('objective', words(p.objective) >= 6 ? 'ok' : 'error', words(p.objective) >= 6 ? 'Objective stated.' : 'State the objective as what the activity must show, in a sentence (S06 p.173: the objective is to verify that the subject satisfies the requirement).')
  add('subject', DESIGN_ID.test(p.subject) ? 'ok' : 'error', DESIGN_ID.test(p.subject) ? 'Subject names the element under verification.' : 'Name the element under verification by its ID (PHY, LOG, FN, IF, AI, INFO, or ENT for an enterprise-level requirement), e.g. "PHY-003 with PHY-001 (IF-005)". A verification action identifies the element it is performed on (R23a p.635).')
  const sats = ctx.satisfiers ?? []
  const enterpriseOk = !!req?.id.startsWith('REQ-STK') && /\bENT-\d{3}\b/.test(p.subject)
  if (DESIGN_ID.test(p.subject) && sats.length > 0 && !enterpriseOk && !sats.some((id) => new RegExp(`\\b${id}\\b`).test(p.subject)))
    add('subject', 'warning', `None of the elements that satisfy ${req?.id} (${sats.join(', ')}) is named in the subject. The case’s subject is bound to the requirement’s subject (S10 sl.96), and the checker will not notice a wrong one: name the satisfier you are verifying, or say why the subject differs.`)
  add('level', p.level ? 'ok' : 'error', p.level ? `Level: ${p.level}.` : 'Choose the level (system, subsystem, component): elements are verified at each level of integration (R49 p.150).')
  add('environment', words(p.environment) >= 3 ? 'ok' : 'error', words(p.environment) >= 3 ? 'Environment stated.' : 'State where and under which conditions it runs; verification should stress the element under realistic conditions representative of intended use (R49 p.150).')

  // Success criterion: testable, not circular, same limit as the requirement
  const reqBounds = bounds(rtext)
  const reqDir = (unit: string) => {
    const ds = new Set(reqBounds.filter((b) => b.unit === unit).map((b) => b.dir))
    return ds.size === 1 ? [...ds][0] : undefined
  }
  const rq = quantities(rtext)
  if (words(crit) < 4) add('successCriterion', 'error', 'State the expected result that decides pass: the quantity, the comparison and the limit (R23a p.635: the reference defines the expected result).')
  else {
    const problems: string[] = []
    const hasNumber = /\d/.test(crit)
    const hasComparison = COMPARATOR.test(crit)
    if (JUDGEMENT.test(crit)) problems.push(`“${crit.match(JUDGEMENT)![0]}” is a judgement, not a result: no observation can fail it`)
    else if (HEDGE.test(crit) && !(hasNumber && hasComparison)) problems.push(`“${crit.match(HEDGE)![0]}” is not measurable on its own: say which number, compared how, decides it`)
    if (CIRCULAR.test(crit) && measured.length === 0 && !LIMIT.test(crit)) problems.push('it restates that the requirement is met instead of saying which result counts as meeting it')
    if (!hasNumber && !(tbd && crit.includes(tbd)) && !/configured limit/i.test(crit)) problems.push('it has no number: give the limit, the sample size or the count')
    if (!hasComparison) problems.push('it has no comparison (<=, at least, within, n of n, every …)')
    add('successCriterion', problems.length ? 'error' : 'ok', problems.length ? `Untestable criterion: ${problems.join('; ')}.` : 'Criterion is measurable.')
    // The limit: every bound in the requirement's direction must carry the requirement's value. Without a
    // comparator, fall back to "some quantity in that unit equals the requirement's value".
    const critBounds = bounds(crit)
    for (const unit of new Set(critQty.map((q) => q.unit))) {
      const reqVals = rq.filter((q) => q.unit === unit).map((q) => q.value)
      if (!reqVals.length) continue
      const dir = reqDir(unit)
      const sameDir = critBounds.filter((b) => b.unit === unit && (!dir || b.dir === dir))
      const vals = sameDir.length ? sameDir.map((b) => b.value) : critQty.filter((q) => q.unit === unit).map((q) => q.value)
      const off = sameDir.length ? vals.filter((v) => !reqVals.includes(v)) : vals.some((v) => reqVals.includes(v)) ? [] : vals
      if (off.length)
        add('successCriterion', 'error', `The criterion’s limit (${off.join(', ')} ${unit}) is not the requirement’s (${[...new Set(reqVals)].join(', ')} ${unit}). Verification checks the specified requirement (R23a p.634); a different limit, or an allowance on top of it, verifies a different requirement.`)
    }
  }

  // Verdict logic
  for (const k of ['pass', 'fail', 'inconclusive'] as const)
    add(k, words(p[k]) >= 3 ? 'ok' : 'error', words(p[k]) >= 3 ? `${k} condition stated.` : `State the ${k} condition. A verification case returns pass, fail, inconclusive or error (S10 sl.96; S06 p.173); RB-10.3 asks for the verdict logic.`)
  if (JUDGEMENT.test(p.pass)) add('pass', 'error', `The pass condition uses “${p.pass.match(JUDGEMENT)![0]}”, a judgement: state the result that decides it.`)
  // Pass and fail must be complementary on the requirement's own limit: pass on the requirement's side of it, fail on
  // the other side, with nothing left undecided in between.
  for (const [k, want] of [['pass', 'same'], ['fail', 'opposite']] as const) {
    for (const b of bounds(p[k])) {
      const dir = reqDir(b.unit)
      const reqVals = rq.filter((q) => q.unit === b.unit).map((q) => q.value)
      if (!dir || !reqVals.length) continue
      const expected = want === 'same' ? dir : dir === 'max' ? 'min' : 'max'
      if (b.dir !== expected)
        add(k, 'error', `The ${k} condition compares the wrong way (${b.dir === 'max' ? 'at most' : 'at least'} ${b.value} ${b.unit}), but ${req?.id} sets ${dir === 'max' ? 'an upper' : 'a lower'} limit. PassIf checks the requirement for the measured values (S10 sl.97), so ${k} must lie on the ${want === 'same' ? 'requirement’s' : 'other'} side of its limit.`)
      else if (!reqVals.includes(b.value))
        add(k, 'error', `The ${k} threshold (${b.value} ${b.unit}) is not the requirement’s limit (${[...new Set(reqVals)].join(', ')} ${b.unit}). Pass and fail must meet at that limit; otherwise results between the two thresholds get no verdict, or the requirement is loosened.`)
    }
  }
  const key = (b: Bound) => `${b.dir}:${b.value}:${b.unit}`
  const failKeys = new Set(bounds(p.fail).map(key))
  const sameAsFail = words(p.inconclusive) >= 3 && (p.inconclusive.trim().toLowerCase() === p.fail.trim().toLowerCase() || bounds(p.inconclusive).some((b) => failKeys.has(key(b))))
  if (sameAsFail)
    add('inconclusive', 'error', 'Inconclusive means no determination could be made (S06 p.173); it must not be the same condition as fail. A measured value beyond the limit is a determination: that is fail.')
  if (tbd && words(p.inconclusive) >= 3 && !p.inconclusive.includes(tbd) && !(tbdItem && p.inconclusive.includes(tbdItem)))
    add('inconclusive', 'error', `${req?.id} still carries ${tbd}${tbdItem ? ` (${tbdItem})` : ''}: until it closes no verdict can be reached against the approved value. Say so in the inconclusive condition (compare the reference VER-004).`)
  return c
}

/** The active elements that satisfy a requirement (workspace satisfies links). */
export const satisfiersOf = (m: EngineeringModel, reqId: string) => {
  const live = new Set(m.elements.filter((e) => e.status === 'active').map((e) => e.id))
  return m.links.filter((l) => l.type === 'satisfies' && l.target === reqId && live.has(l.source)).map((l) => l.source)
}

export const planErrors = (p: VerPlan, req: Element | undefined, ctx: PlanContext = {}) => checkPlan(p, req, ctx).filter((x) => x.severity === 'error')

const ERROR_TEXT = 'the procedure or instrumentation was not executed as planned (repeat the run)'
export const verdictLogic = (p: VerPlan) => `pass: ${p.pass.trim()}; fail: ${p.fail.trim()}; inconclusive: ${p.inconclusive.trim()}; error: ${ERROR_TEXT}.`

/** Read a reference VER element back into a plan (inverse of the reference `verdict()` helper). */
export function planFromElement(v: Element): VerPlan {
  const a = v.attributes ?? {}
  const logic = String(a.verdictLogic ?? '')
  const part = (k: string) => (logic.match(new RegExp(`${k}: (.*?)(?:; (?:pass|fail|inconclusive|error):|\\.$|$)`))?.[1] ?? '').trim()
  return {
    target: String(a.verifies ?? ''),
    method: (String(a.method ?? '') as Method) || '',
    objective: String(a.objective ?? v.text ?? ''),
    subject: String(a.subject ?? ''),
    level: (String(a.level ?? '') as VerPlan['level']) || '',
    environment: String(a.environment ?? ''),
    successCriterion: String(a.successCriterion ?? ''),
    pass: part('pass'),
    fail: part('fail'),
    inconclusive: part('inconclusive'),
  }
}

/** The workspace batch for one plan: a VER element (owner, provenance) and its verifies link. */
export function planBatch(p: VerPlan, name: string, who: { owner: string; provenance: Element['provenance'] }) {
  return {
    elements: [{
      key: 'ver', kind: 'VER' as const, name: name.trim(), text: p.objective.trim(), owner: who.owner.trim().toUpperCase(), provenance: who.provenance,
      attributes: { method: p.method, objective: p.objective.trim(), subject: p.subject.trim(), level: p.level, environment: p.environment.trim(), successCriterion: p.successCriterion.trim(), verdictLogic: verdictLogic(p), verifies: p.target },
    }],
    links: [{ source: 'ver', type: 'verifies' as const, target: p.target }],
  }
}

export const activeRequirements = (m: EngineeringModel) => m.elements.filter((e) => e.kind === 'REQ' && e.status === 'active')
