// Week 1 need-quality assessment (pure), rebuilt for review F01 of commit 0f3ebcb (2026-10-18), aligned with the
// lecture for the sign-off review (2026-10-19, M1), and revised for the faculty's final Week 1 review (DECISION_LOG A21,
// provisional decision 2: meaningful alternative need phrasing is accepted). A lexical screen cannot judge need quality
// in both directions, so the assessment is split four ways:
//   1. HARD GATES: real defects only. A statement is rejected when it is empty or not a sentence; when it names no
//      outcome or capability; when no stakeholder in the register is identifiable as the party in need (or the party in
//      need is the team's own enterprise or system of interest); when it is written as a requirement ("shall"); when
//      the thing it asks for IS a solution ("Passengers need a mobile app", "Riders need electric buses"); or when its ID
//      is not unique. A need that fails a gate cannot count, and a gate cannot be justified away.
//   2. ADVICE (never blocks, never needs a justification): a statement that passes the gates but is not in the
//      recommended form "The [stakeholders] need the [system] to …" (NEED_FORM) gets a note that recommends the form and
//      says why. SEBoK recommends a distinct need format "such as" that one (R11 p.555); it does not make it the only
//      valid form, so "Hospital dispatchers need blood units delivered within 30 minutes of a request", "<stakeholder>
//      needs …", passive and "so that" phrasings pass. (Before A21 the structure gate rejected them: M1, N1.)
//   3. ADVISORY WARNINGS: everything subjective. Vague terms ("good", "when possible"), other requirement words ("must",
//      "should"), design or solution words inside an otherwise outcome-stated need, no condition word, a subject that is
//      not one of the need's traced stakeholders. (A [system] that is not the team's system of interest is advice: it
//      may be an outcome, "need the power drawn at each vertiport to stay within …".)
//      A warning never rejects a statement; it asks the team to rewrite it or to justify keeping it ("a design term stays
//      only as a justified constraint", S2-10). An unjustified warning stops the need counting toward the minimum.
//   4. SELF-CHECK: the student confirms each of the six checks of the course gate (labBrief.ts NEED_GATE), per need
//      (SELF_CHECK below, same IDs and order). The tool says what it looked at for each; the judgment is the student's,
//      then the instructor's.
// Sources the criteria operationalize: R11 p.555 (no "shall"; the recommended format "The stakeholders need the system
// to …"; needs from the stakeholders' perspective), R11 p.553 (trace to the register; rationale), R11 p.554 (conditions
// of action), R53 p.296 (solution independence, "beware solutions masquerading as needs"; conditions).
// The lexicons below are instructor-authored and deliberately advisory: they are screens, not judges.
import type { Citation } from '../../content/readings'
import { NEED_FORM, NEED_GATE, type NeedGateId } from '../../content/lectures/week01/labBrief'

export type CriterionId = NeedGateId

/** The six checks of the course gate (S2-09), each with what the tool checks and what the student must judge (shown in
 *  the self-check). `gate` is the lecture's short label (labBrief.ts NEED_GATE); labBrief.test.ts compares them. */
export const SELF_CHECK: { id: CriterionId; gate: string; label: string; tool: string; cite: Citation }[] = [
  { id: 'form', gate: NEED_GATE[0].short, label: `Stated as a need, not a requirement: what the stakeholder needs, from their perspective, with no “shall”, “must” or other word that marks a requirement. Recommended form: “${NEED_FORM}”.`, tool: 'Checked: a sentence that names an outcome, with no “shall”. A statement in another form is accepted, with a note recommending the course form; the tool warns on other requirement words and cannot tell a need from a requirement in disguise.', cite: { reading: 'R11', pages: '555' } },
  { id: 'solution-free', gate: NEED_GATE[1].short, label: 'No design: it names no design, technology or implementation, or the team justifies a genuine constraint.', tool: 'Checked: the thing needed is not itself a solution (“need a mobile app”). The tool warns on a list of design words elsewhere in the statement; it cannot see a solution written in plain words.', cite: { reading: 'R53', pages: '296' } },
  { id: 'attributed', gate: NEED_GATE[2].short, label: 'Attributed to a registered stakeholder: the subject is a stakeholder (or a class of one) in your register.', tool: 'Checked: the party in need (the subject before “need(s)”, or, in another phrasing, a stakeholder named in the statement) is in the register and is not your system of interest.', cite: { reading: 'R11', pages: '553, 555' } },
  { id: 'traced', gate: NEED_GATE[3].short, label: 'Traced to its concern: the CON ID of the concern it answers, held by one of its source stakeholders (course convention, extending SEBoK’s trace to the stakeholder register).', tool: 'Checked: every source STK and concern CON exists in the register, and each concern belongs to a source stakeholder.', cite: { reading: 'R11', pages: '553' } },
  { id: 'condition', gate: NEED_GATE[4].short, label: 'A condition: when, where or under what operating conditions it holds.', tool: 'The tool warns when it finds no condition word; it cannot judge whether the condition is the right one.', cite: { reading: 'R11', pages: '554' } },
  { id: 'rationale', gate: NEED_GATE[5].short, label: 'A rationale: why the stakeholder needs it.', tool: 'Checked: a rationale is present; whether it is the real reason is yours to judge.', cite: { reading: 'R11', pages: '553' } },
]
export const CRITERION_IDS = SELF_CHECK.map((c) => c.id)

export type StakeholderRef = { id: string; name: string }
export type NeedContext = {
  /** The register the subject and the traces are checked against. */
  stakeholders: StakeholderRef[]
  /** Names of the team's own enterprise and system of interest (never the party in need). */
  soiNames: string[]
  /** Names the [system] in "need the [system] to" may use (the enterprise name, the system-of-interest statement); when
   *  given, a [system] sharing no word with them and not a generic system word raises the 'system' advice. */
  systemNames?: string[]
  /** IDs of the other needs in the same record (uniqueness gate). */
  otherIds?: string[]
}
export type NeedInput = { id?: string; name: string; text: string; conditions: string; rationale: string; sources: string[] }

/** structure: a sentence that names an outcome; subject: an identifiable registered stakeholder in need; requirement:
 *  not written as a requirement ("shall"); solution: the thing needed is not itself a solution; unique: the ID. */
export type Gate = { id: 'structure' | 'subject' | 'requirement' | 'solution' | 'unique'; ok: boolean; message: string }
export type Completeness = { id: 'name' | 'traced' | 'rationale'; ok: boolean; message: string }
export type WarningId = 'vague' | 'requirement' | 'solution' | 'condition' | 'subject-trace'
export type NeedWarning = { id: WarningId; message: string }
/** Advice never blocks and never needs a justification: 'form' = accepted, but not in the recommended form; 'system' =
 *  the phrase after "need(s) the" is not the team's system of interest (an outcome, or another party). */
export type NeedAdvice = { id: 'form' | 'system'; message: string }
export type NeedAssessment = {
  subject?: string
  system?: string
  object?: string
  subjectIds: string[]
  /** 'taught' = the recommended form "… need(s) the [system] to …"; 'other' = any other phrasing. */
  form: 'taught' | 'other'
  gates: Gate[]
  completeness: Completeness[]
  warnings: NeedWarning[]
  advice: NeedAdvice[]
}

const words = (s: string) => s.split(/\s+/).filter(Boolean).length

// ------------------------------------------------------------------------------------------- names and subjects
const NAME_STOP = new Set(['the', 'a', 'an', 'our', 'all', 'its', 'their', 'of', 'and', 'or', 'for', 'at', 'in', 'on', 'to', 'with'])
/** Simple singular form, so that "Passenger" and "Passengers" (and "Facilities"/"Facility") compare equal. */
const singular = (w: string) => (w.length > 4 && w.endsWith('ies') ? `${w.slice(0, -3)}y` : w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w)
/** Content words of a name or subject, lower-case and singular; possessives and punctuation removed. */
export function nameTokens(s: string): string[] {
  return (s.toLowerCase().replace(/['’]s\b/g, '').match(/[a-z0-9]+/g) ?? []).filter((w) => !NAME_STOP.has(w)).map(singular)
}
const subset = (a: string[], b: string[]) => a.length > 0 && a.every((x) => b.includes(x))
/** True when one name is the other, or one is a subgroup of the other ("Night-shift volunteer drivers" ⊇ "Volunteer drivers"). */
export const namesMatch = (subject: string, name: string) => {
  const s = nameTokens(subject)
  const n = nameTokens(name)
  return subset(s, n) || subset(n, s)
}

/** Generic names of a system of interest or one of its parts used as the party in need ("The system needs …"). */
const SOI_GENERIC = /^(?:the\s+|our\s+)?(?:system|service|app|application|platform|software|aircraft|fleet|network|enterprise|company|organi[sz]ation|operations? (?:centre|center|system)|scheduling (?:function|system)|booking (?:app|system)|dispatch(?:er| system)?)$/i

/** True when the subject is the team's own enterprise or system of interest (or a generic name for it). */
export function isSoiSubject(subject: string, soiNames: string[]): boolean {
  if (SOI_GENERIC.test(subject.trim())) return true
  const s = nameTokens(subject)
  return soiNames.some((n) => n.trim() && subset(s, nameTokens(n)))
}

// Words that carry no content in the object of a need ("X need y when" has no object).
const OBJECT_STOP = new Set(
  'the and for with that this those these from into onto than then there their them they its are was were been being can could will would should may might more less also very when whenever while once each every any all some such not '.split(' ').filter(Boolean),
)
/** Content words (three letters or more) of the object. */
const contentWords = (s: string) => (s.toLowerCase().match(/[a-z]{3,}/g) ?? []).filter((w) => !OBJECT_STOP.has(w))
/** Gate sweep 2026-10-19: was 2, which rejected "Drivers need routes before shifts" and "Families need the Pantry to feed
 *  them" (one content word is an outcome). An object with no content word still fails ("… need it when …"). */
export const MIN_OBJECT_WORDS = 1

/**
 * Splits "<subject> need(s) <object>". Every occurrence of "need"/"needs" is tried as the verb, so a subject that
 * contains the word ("Passengers with special needs need …") is still found; the first split whose subject is in the
 * register wins, otherwise the first split. A "need(s)" directly followed by another "need(s)" is not the verb.
 */
export function splitNeed(text: string, stakeholders: StakeholderRef[] = []): { subject: string; object: string } | undefined {
  const t = text.trim()
  const splits: { subject: string; object: string }[] = []
  for (const m of t.matchAll(/\bneeds?\b/gi)) {
    const subject = t.slice(0, m.index).trim().replace(/[,;:]$/, '')
    const object = t.slice(m.index! + m[0].length).trim()
    // "special needs need …": a "needs" followed straight by the verb is part of the subject
    if (subject && !/^needs?\b/i.test(object)) splits.push({ subject, object })
  }
  if (!splits.length) return undefined
  return splits.find((s) => stakeholders.some((k) => namesMatch(s.subject, k.name))) ?? splits[0]
}

/** The part after "need(s)" in the recommended form: "the [system] to [what]". The [system] may open with "the", "our", "its",
 *  "a" or "an" ("need a delivery service to …"), or be a proper name with no article ("need MedFly to …", sign-off
 *  confirmation N1): its first word is capitalised, or the whole phrase is one of the team's registered system names. A
 *  lower-case phrase with no article ("need fresh produce to …", the outcome form) is not a system phrase. The first
 *  " to " after the system phrase ends it, and the system phrase is at most eight words. */
export function splitTaught(rest: string, systemNames: string[] = []): { system: string; what: string } | undefined {
  const t = rest.trim()
  const det = /^(?:the|our|its|an?)\s+((?:\S+\s+){0,7}?\S+)\s+to\s+(.+)$/is.exec(t)
  if (det) return { system: det[1].trim(), what: det[2].trim() }
  const bare = /^((?:\S+\s+){0,7}?\S+)\s+to\s+(.+)$/s.exec(t)
  if (!bare || /^to\b/i.test(bare[1])) return undefined
  const system = bare[1].trim()
  const proper = /^[A-Z]/.test(system)
  const registered = systemNames.some((n) => {
    const a = nameTokens(n)
    const b = nameTokens(system)
    return a.length > 0 && a.length === b.length && a.every((w, i) => w === b[i])
  })
  return proper || registered ? { system, what: bare[2].trim() } : undefined
}
/** Generic words for a system of interest after "need the …" ("the system", "the service"). */
const SYSTEM_GENERIC = /^(?:system|service|system of interest|network|enterprise|operation|operations)$/i
/** True when the [system] of the taught form plausibly names the team's system of interest. */
export function namesSystem(system: string, systemNames: string[]): boolean {
  if (SYSTEM_GENERIC.test(system.trim())) return true
  const s = nameTokens(system)
  return systemNames.some((n) => nameTokens(n).some((w) => s.includes(w)))
}

// ------------------------------------------------------------------------------------------- advisory lexicons
/** Vague terms: they cannot be checked by anyone (instructor-authored). "quickly enough that …" is not vague. */
export const VAGUE = /\b(good|better|best|great|nice|adequate(?:ly)?|sufficient(?:ly)?|appropriate(?:ly)?|reasonabl[ey]|user[- ]friendly|easy|easily|seamless(?:ly)?|efficient(?:ly)?|effective(?:ly)?|optimal(?:ly)?|robust|flexible|state[- ]of[- ]the[- ]art|high[- ]quality|world[- ]class|convenient(?:ly)?|fast|quick(?:ly)?(?!\s+enough)|as (?:soon|quickly|fast|much|little|far|often|early) as (?:possible|practicable|feasible)|(?:when|whenever|if|where|wherever) possible|as (?:needed|required|appropriate)|etc\b|and\/or)/gi

/** Words that mark a requirement (R11 p.555). */
export const REQUIREMENT = /\b(shall|must|is required to|are required to|will be required to|should|has to|have to|will provide|will be provided)\b/gi

/** Design and implementation terms, each with a question back to the need (R53 p.296). Instructor-authored. */
export const SOLUTION_TERMS: { term: string; pattern: RegExp; ask: string }[] = [
  { term: 'app or software', pattern: /\b(mobile apps?|apps?|applications?|software|websites?|web ?sites?|portals?|online forms?)\b/i, ask: 'What must the stakeholder be able to do, and how quickly or reliably?' },
  { term: 'a system or tool as the object', pattern: /\b(?:an?|new|online|digital|automated|computeri[sz]ed|smart)\s+(?:[a-z-]+\s+){0,2}(?:systems?|platforms?|tools?|controllers?|devices?)\b/i, ask: 'Which outcome would that system deliver for the stakeholder?' },
  { term: 'user-interface detail', pattern: /\b(taps?|clicks?|buttons?|touch ?screens?|screens|dashboards?|menus?|kiosks?|QR codes?)\b/i, ask: 'Which decision or action does the interface serve?' },
  { term: 'notification channel', pattern: /\b(sms|text messages?|e-?mails?|push notifications?)\b/i, ask: 'What must the stakeholder know, and by when?' },
  { term: 'AI or algorithm', pattern: /\b(ai|artificial intelligence|machine learning|neural (?:net|network)s?|algorithms?|chatbots?|optimi[sz]ers?)\b/i, ask: 'What outcome should the decision achieve, whoever or whatever makes it?' },
  { term: 'data infrastructure', pattern: /\b(databases?|cloud|servers?|apis?|blockchain|spreadsheets?)\b/i, ask: 'What information is needed, by whom, and when?' },
  { term: 'sensing or identification equipment', pattern: /\b(sensors?|cameras?|radars?|lidar|gps|ads-b|transponders?|thermal imag(?:ing|ers?)|barcodes?|scanners?|rfid(?: tags?)?)\b/i, ask: 'What must be known or detected, and how early?' },
  { term: 'charging or energy hardware', pattern: /\b(chargers?|fast[- ]charg\w*|battery[- ]swap\w*|swap(?:ping)? stations?|fuel cells?|solar panels?|generators?|substations?)\b/i, ask: 'What availability or energy state is needed, and when?' },
  { term: 'robotic or mechanical equipment', pattern: /\b(robots?|robotic|conveyors?|elevators?|ramps?|forklifts?)\b/i, ask: 'What must the stakeholder be able to do unaided, and in what conditions?' },
  { term: 'noise-control hardware', pattern: /\b((?:noise|sound) (?:barriers?|walls?)|mufflers?|ducted fans?|quiet(?:er)? (?:rotors?|propellers?))\b/i, ask: 'What noise exposure is acceptable to whom, and at what hours?' },
  { term: 'vehicle or technology choice', pattern: /\b((?:electric|diesel|hybrid|hydrogen|battery[- ]electric|autonomous|driverless|self[- ]driving) (?:bus(?:es)?|vans?|trucks?|cars?|vehicles?|shuttles?|aircraft|drones?)|drones?|tilt-?rotors?|multicopters?|helicopters?|propellers?|rotors?)\b/i, ask: 'What trip, delivery, safety or noise outcome is the stakeholder after?' },
  { term: 'infrastructure choice', pattern: /\b(heli-?pads?|landing pads?|vertipads?|rooftop (?:pads?|landing)|hangars?)\b/i, ask: 'What must the stakeholder be able to do, where, and when?' },
  { term: 'operating restriction', pattern: /\b(curfews?|night[- ]flight bans?|flight bans?|flight caps?|quotas?)\b/i, ask: 'A restriction is one mitigation: what exposure or outcome is the stakeholder after?' },
  { term: 'asset expansion', pattern: /\b((?:bigger|larger|additional|extra|new|more) (?:fleets?|aircraft|vertiports?|pads?|chargers?|vans?|trucks?|buses|warehouses?)|fleet of \d+)\b/i, ask: 'More assets are one way to add capacity: what capacity is needed, and when?' },
  { term: 'implementation phrase', pattern: /\b(by (?:installing|using|adding|building|deploying|buying)|using an? |by means of)/i, ask: 'Remove the “how” and keep the “what” and “why”.' },
]

/**
 * Condition cues (R11 p.554: triggering events, system states, operating environments; R53 p.296). Broad on purpose:
 * a missing condition is only a warning, so a cue that over-accepts costs less than one that rejects "on weekends" or
 * "between 22:00 and 06:00". Instructor-authored.
 */
export const CONDITION =
  /\b(when|whenever|while|during|throughout|until|unless|if|before|after|once|within|between|regardless of|even (?:if|when)|including|in case of|under|per|each|every|any ?time|overnight|daily|weekly|monthly|quarterly|annually|always|at (?:all|any|peak|night|dawn|dusk|noon|midnight)|on (?:weekends?|weekdays?|holidays?|mondays?|tuesdays?|wednesdays?|thursdays?|fridays?|saturdays?|sundays?|arrival|departure|request|delivery)|in (?:winter|summer|spring|autumn|fall|rain|snow|ice|fog|heat|storms?|bad weather|winter storms?|adverse|all|any|degraded|an emergency|emergencies|the (?:morning|evening|afternoon|night|dark))|for (?:an?|one|two|three|four|five|six|eight|twelve|\d+) (?:minutes?|hours?|days?|weeks?|months?|years?|shifts?)|by (?:\d|noon|midnight|closing|the end)|\d{1,2}(?::\d{2})?\s?(?:a\.?m\.?|p\.?m\.?)|\d{1,2}:\d{2})/i

export const vagueTerms = (s: string) => [...new Set((s.match(VAGUE) ?? []).map((x) => x.toLowerCase()))]
export const requirementWords = (s: string) => [...new Set((s.match(REQUIREMENT) ?? []).map((x) => x.toLowerCase()))]
export function solutionTerms(s: string): { term: string; match: string; ask: string }[] {
  const out: { term: string; match: string; ask: string }[] = []
  for (const t of SOLUTION_TERMS) {
    const m = s.match(t.pattern)
    if (m) out.push({ term: t.term, match: m[0].trim(), ask: t.ask })
  }
  return out
}
export const hasCondition = (s: string) => CONDITION.test(s)

// ------------------------------------------------------------------------------------------- assessment
/** Where the outcome ends and the condition begins, for counting the outcome's words in a phrasing other than the
 *  recommended form ("Hospitals need MedFly within 30 minutes" names the system and a condition, but no outcome). */
const CONDITION_CUT = /\b(?:when|whenever|while|during|throughout|within|between|before|after|until|unless|if|at all times|at any (?:hour|time))\b/i
/** The head of what is asked for after "need(s)" (or "a need for"): up to the first linking word, at most five words. */
const headOf = (object: string) =>
  object
    .split(/\s+(?:to|that|which|who|so|for|with|when|whenever|while|within|during|at|on|in|by|before|after|until|from|of)\b|[,;:.]/i)[0]
    .split(/\s+/)
    .slice(0, 5)
    .join(' ')
const escapeRe = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
/** Removes each registered name from a text (case-insensitive), so that a stakeholder's own name ("Elevator inspectors")
 *  is never read as a design word. */
const withoutNames = (text: string, names: string[]) => names.filter((x) => x.trim()).reduce((t, x) => t.replace(new RegExp(escapeRe(x.trim()), 'gi'), ' '), text)

/** Gates, completeness, warnings and advice for one need. Only the gates and completeness are pass/fail. */
export function assessNeed(n: NeedInput, ctx: NeedContext): NeedAssessment {
  const register = new Set(ctx.stakeholders.map((s) => s.id))
  const text = n.text.trim()
  const systemNames = ctx.systemNames ?? []
  const split = splitNeed(text, ctx.stakeholders)
  // "There is a need for …", "It is a need …": the words before "need" are not a party in need
  const expletive = !!split && /^(?:there\s+(?:is|are)|it\s+is)\b/i.test(split.subject)
  const verb = split && !expletive ? split : undefined
  const taught = verb ? splitTaught(verb.object, systemNames) : undefined
  const gates: Gate[] = []

  // who is in need: the subject before "need(s)"; in any other phrasing (passive, "so that", "is needed by", "There is a
  // need for …"), a registered stakeholder named in the statement
  const soiSubject = !!verb && isSoiSubject(verb.subject, ctx.soiNames)
  let subjectIds: string[] = []
  if (verb) subjectIds = soiSubject ? [] : ctx.stakeholders.filter((s) => namesMatch(verb.subject, s.name)).map((s) => s.id)
  else {
    const toks = nameTokens(text)
    subjectIds = ctx.stakeholders.filter((s) => subset(nameTokens(s.name), toks)).map((s) => s.id)
  }
  const subjectNames = ctx.stakeholders.filter((s) => subjectIds.includes(s.id)).map((s) => s.name)

  // structure: a sentence that names an outcome or capability
  const outcomeWords = (() => {
    if (taught) return contentWords(taught.what)
    const base = verb ? verb.object : text
    const cut = base.split(CONDITION_CUT)[0]
    const exclude = new Set([...subjectNames, ...systemNames, ...ctx.soiNames].flatMap(nameTokens))
    return contentWords(cut).filter((w) => !/^need(?:s|ed)?$/.test(w) && !exclude.has(singular(w)))
  })()
  // gate sweep 2026-10-19: "Families need food" with the condition in the condition field is a full need (was 4 words)
  if (words(text) < 3) gates.push(
{ id: 'structure', ok: false, message: `Write a full sentence: who needs what, and under what condition. For example, in the recommended form, “${NEED_FORM}”.` })
  else if (outcomeWords.length < MIN_OBJECT_WORDS) gates.push({ id: 'structure', ok: false, message: taught ? 'Say what the system must do for them after “to”: the statement names no outcome.' : 'Say what outcome or capability the stakeholder needs: the statement names no outcome.' })
  else gates.push({ id: 'structure', ok: true, message: taught ? `States the outcome in the recommended form “<stakeholders> need the ${taught.system} to <what>”.` : 'States an outcome the stakeholder needs.' })

  // subject: an identifiable stakeholder in the register, not the system of interest
  if (soiSubject) gates.push({ id: 'subject', ok: false, message: `“${verb!.subject}” is your own enterprise or system of interest. Needs belong to stakeholders: “The stakeholders need the system to …” (R11 p.555).` })
  else if (verb && !subjectIds.length) gates.push({ id: 'subject', ok: false, message: `“${verb.subject}” is not a stakeholder in the register. Use the stakeholder’s name as recorded (or a subgroup of it), or add the stakeholder first.` })
  else if (!subjectIds.length) gates.push({ id: 'subject', ok: false, message: 'No stakeholder from your register is named: say who needs it, by the name in your register.' })
  else gates.push({ id: 'subject', ok: true, message: `Attributed to ${subjectIds.join(', ')}.` })

  // requirement: "shall" marks a requirement (R11 p.555); other requirement words are warnings below
  if (/\bshall\b/i.test(text)) gates.push({ id: 'requirement', ok: false, message: '“Shall” marks a requirement, the developer’s view (R11 p.555). State what the stakeholder needs instead; requirements are written from the needs in Week 2.' })
  else gates.push({ id: 'requirement', ok: true, message: 'Not written as a requirement (no “shall”).' })

  // solution: the thing asked for is itself a solution ("need a mobile app"): a solution masquerading as a need (R53 p.296)
  const hasSystemNames = systemNames.some((x) => x.trim())
  const asked = taught ? (hasSystemNames && !namesSystem(taught.system, systemNames) ? taught.system : '') : verb ? headOf(verb.object) : expletive ? headOf(split!.object.replace(/^(?:for|of)\s+/i, '')) : ''
  const askedSolution = asked ? solutionTerms(asked) : []
  if (askedSolution.length) gates.push({ id: 'solution', ok: false, message: `What is asked for, “${askedSolution[0].match}” (${askedSolution[0].term}), is a solution, not a need. ${askedSolution[0].ask} Keep the solution as an option for later weeks.` })
  else gates.push({ id: 'solution', ok: true, message: 'Asks for an outcome, not a named solution.' })

  // unique ID
  if (n.id !== undefined) {
    const dup = (ctx.otherIds ?? []).filter((x) => x === n.id).length > 0
    gates.push({ id: 'unique', ok: !!n.id && !dup, message: !n.id ? 'The need has no ID.' : dup ? `${n.id} is used by another need: each ID once.` : 'Unique ID.' })
  }

  const unknown = n.sources.filter((s) => !register.has(s))
  const completeness: Completeness[] = [
    { id: 'name', ok: !!n.name.trim(), message: n.name.trim() ? 'Named.' : 'Give the need a short name.' },
    {
      id: 'traced',
      ok: n.sources.length > 0 && unknown.length === 0,
      message: !n.sources.length ? 'Choose at least one stakeholder the need comes from.' : unknown.length ? `${unknown.join(', ')} ${unknown.length > 1 ? 'are' : 'is'} not in the register.` : `Traced to ${n.sources.join(', ')}.`,
    },
    // gate sweep 2026-10-19: "Legal requirement" is a rationale; only an empty one fails
    { id: 'rationale', ok: words(n.rationale) >= 1, message: words(n.rationale) >= 1 ? 'Rationale recorded.' : 'Record why the stakeholder needs it.' },
  ]

  // warnings run on the part after the subject (or on the statement without the stakeholders' names), so a stakeholder's
  // name ("Elevator inspectors", "Passengers using a wheelchair", "Patients in all hospital wings") is never read as a
  // design word
  const object = `${taught ? taught.what : verb ? verb.object : withoutNames(text, subjectNames)} ${n.conditions}`
  const warnings: NeedWarning[] = []
  const v = vagueTerms(object)
  if (v.length) warnings.push({ id: 'vague', message: `Vague: ${v.map((x) => `“${x}”`).join(', ')}. Nobody could check it; say what, how much or by when.` })
  const r = requirementWords(object).filter((x) => x !== 'shall')
  if (r.length) warnings.push({ id: 'requirement', message: `Requirement wording: ${r.map((x) => `“${x}”`).join(', ')}. Needs say what the stakeholder needs; requirements come in Week 2 (R11 p.555).` })
  const sol = askedSolution.length ? [] : solutionTerms(object)
  if (sol.length) warnings.push({ id: 'solution', message: `Possible design or solution: ${sol.map((s) => `“${s.match}” (${s.term}). ${s.ask}`).join(' ')} Rewrite it, or justify it as a genuine constraint.` })
  if (!hasCondition(`${text} ${n.conditions}`)) warnings.push({ id: 'condition', message: 'No condition word found: say when, where or under what conditions the need holds, in the statement or the condition field.' })
  if (subjectIds.length && n.sources.length && !subjectIds.some((id) => n.sources.includes(id))) warnings.push({ id: 'subject-trace', message: `The statement is about ${subjectIds.join(', ')} but traces to ${n.sources.join(', ')}: check that the subject is the stakeholder the need came from.` })

  // advice: accepted in another phrasing; recommend the course form and say why (never blocks, needs no justification)
  const advice: NeedAdvice[] = []
  const gatesOk = gates.every((g) => g.ok || g.id === 'unique')
  // "need the power drawn at each vertiport to stay within …" parses like "need the [system] to …" but states an outcome;
  // "need the city council to approve …" puts the duty on another party. Both pass; the note asks the team which it meant.
  if (taught && gatesOk && hasSystemNames && !namesSystem(taught.system, systemNames))
    advice.push({ id: 'system', message: `“${taught.system}” is not your system of interest. If you meant your system, name it after “need”, as in “${NEED_FORM}”; if “${taught.system}” is what the need is about, the statement reads as an outcome and is accepted. If another party must act, the need may belong to that party’s system, not yours.` })
  if (!taught && gatesOk)
    advice.push({
      id: 'form',
      message: `Accepted: it names the stakeholder and the outcome. Recommended form: “${NEED_FORM}”. Naming the system of interest keeps the stakeholder’s outside view and says which system the need will be validated against; SEBoK recommends a distinct need format such as this one (R11 p.555). Rewriting is optional and needs no justification.`,
    })
  return { subject: verb?.subject, system: taught?.system, object: taught?.what ?? verb?.object ?? text, subjectIds, form: taught ? 'taught' : 'other', gates, completeness, warnings, advice }
}

export type SelfCheck = Partial<Record<CriterionId, boolean>>
export const selfChecked = (s: SelfCheck | undefined) => CRITERION_IDS.every((id) => !!s?.[id])
/** Gate sweep 2026-10-19: was 5; "The regulator's own term" is a justification. Kept as an export; a justification now
 *  counts when it is written and is not an empty answer ("ok", "n/a"). */
export const MIN_JUSTIFICATION_WORDS = 1
const EMPTY_JUSTIFICATION = /^(?:ok(?:ay)?|fine|yes|no|n\/?a|none|nil|nothing|-+|\?+|tbd|see above)\.?$/i

/** Why a need does not count (empty when it counts): gates, completeness, the self-check, then unjustified warnings. */
export function notCountingReasons(a: NeedAssessment, selfCheck: SelfCheck | undefined, justification: string): string[] {
  const out = [...a.gates.filter((g) => !g.ok).map((g) => g.message), ...a.completeness.filter((c) => !c.ok).map((c) => c.message)]
  if (!selfChecked(selfCheck)) out.push('Confirm each of the six checks in the self-check.')
  if (a.warnings.length && (words(justification) < MIN_JUSTIFICATION_WORDS || EMPTY_JUSTIFICATION.test(justification.trim()))) out.push(`${a.warnings.length} warning${a.warnings.length > 1 ? 's' : ''}: rewrite the statement, or say in the justification field why it stays.`)

  return out
}
