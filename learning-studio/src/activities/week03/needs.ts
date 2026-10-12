// Week 3 — need-statement studio logic (pure). Every criterion names the source it operationalises:
//   R11 p.555  need statements do not use "shall" (or another word that marks a requirement); suggested form
//              "The stakeholders need the system to …"
//   R11 p.553  elicited needs are recorded with trace to the stakeholder register; rationale ("why") is captured
//              for each need, and rationale often reveals the real need when it was expressed as an implementation
//   R11 p.554  the integrated set of needs states the conditions of action (triggering events, system states,
//              operating environments: "under what operating conditions")
//   R53 p.296  needs should be independent of solution approach and state the conditions/scenario under which
//              the need exists; "beware solutions masquerading as needs"
// The design-term lexicon, the condition cues and the system-of-interest subject list are an instructor-authored
// operationalisation of those sources: a lexical screen can miss a solution written in plain words and can flag a
// legitimate word in an unusual context. The studio says so; L3 acceptance is the screen AND a team review, and the
// instructor key in the lab resolves disputed cases.
import type { Citation } from '../../content/readings'

export type CriterionId = 'not-requirement' | 'solution-free' | 'attributed' | 'traced' | 'condition' | 'rationale'

export const CRITERIA: { id: CriterionId; label: string; cite: Citation }[] = [
  { id: 'not-requirement', label: 'Written as a need, not a requirement (no “shall”, “must”, “is required to”)', cite: { reading: 'R11', pages: '555' } },
  { id: 'solution-free', label: 'Solution-free: names no design, technology or implementation', cite: { reading: 'R53', pages: '296' } },
  { id: 'attributed', label: 'Stakeholder-attributed: “<who> need(s) …”', cite: { reading: 'R11', pages: '555' } },
  { id: 'traced', label: 'Traced to at least one stakeholder (STK) or concern (CON)', cite: { reading: 'R11', pages: '553' } },
  { id: 'condition', label: 'Condition stated: when, where or under what operating conditions the need exists', cite: { reading: 'R53', pages: '296' } },
  { id: 'rationale', label: 'Rationale recorded: why the stakeholder needs it (at least five words)', cite: { reading: 'R11', pages: '553' } },
]

/** Words that turn a need into a requirement (R11 p.555). */
const REQUIREMENT_WORDS = /\b(shall|must|is required to|are required to|will be required to)\b/i

/**
 * Design and implementation terms. Each carries a prompt back to the underlying need (R53 p.296: articulate
 * needs as a successful operation, not a proposed solution). Instructor-authored lexicon.
 */
export const SOLUTION_TERMS: { term: string; pattern: RegExp; ask: string }[] = [
  { term: 'app / software', pattern: /\b(mobile app|apps?|software|website|web ?site|portal)\b/i, ask: 'What must the stakeholder be able to do, and how quickly or reliably?' },
  { term: 'user-interface detail', pattern: /\b(taps?|clicks?|buttons?|screens?|touch ?screens?|dashboards?|displays?|menus?|kiosks?|QR codes?)\b/i, ask: 'Which decision or action does the interface serve?' },
  { term: 'notification channel', pattern: /\b(sms|text messages?|e-?mails?|push notifications?)\b/i, ask: 'What must the stakeholder know, and by when?' },
  { term: 'AI / algorithm', pattern: /\b(ai|artificial intelligence|machine learning|neural (net|network)s?|algorithms?|chatbots?|optimi[sz]ers?)\b/i, ask: 'What outcome should the decision achieve, whoever or whatever makes it?' },
  { term: 'data infrastructure', pattern: /\b(databases?|cloud|servers?|apis?|blockchain)\b/i, ask: 'What information is needed, by whom, and when?' },
  { term: 'sensor or surveillance equipment', pattern: /\b(sensors?|cameras?|radars?|lidar|gps|ads-b|transponders?|thermal imag(ing|ers?))\b/i, ask: 'What must be known or detected, and how early?' },
  { term: 'charging or energy hardware', pattern: /\b(chargers?|fast[- ]charg\w*|battery[- ]swap\w*|swap(ping)? stations?|fuel cells?|hydrogen|solar panels?|generators?|substations?)\b/i, ask: 'What availability or energy state is needed, and when?' },
  { term: 'robotic or mechanical equipment', pattern: /\b(robots?|robotic|conveyors?|elevators?|ramps?|lifts)\b/i, ask: 'What must the stakeholder be able to do unaided, and in what conditions?' },
  { term: 'noise-control hardware', pattern: /\b((noise|sound) (barriers?|walls?)|mufflers?|ducted fans?|quiet(er)? (rotors?|propellers?))\b/i, ask: 'What noise exposure is acceptable to whom, and at what hours?' },
  { term: 'vehicle design choice', pattern: /\b(tilt-?rotors?|multicopters?|helicopters?|wings?|propellers?|rotors?)\b/i, ask: 'What trip, safety or noise outcome is the stakeholder after?' },
  { term: 'vertiport infrastructure', pattern: /\b(heli-?pads?|landing pads?|vertipads?|rooftop (pads?|landing)|hangars?)\b/i, ask: 'What must the stakeholder be able to do, where, and when?' },
  { term: 'operating restriction', pattern: /\b(curfews?|night[- ]flight bans?|flight bans?|flight caps?|quotas?)\b/i, ask: 'A restriction is one mitigation: what exposure or outcome is the stakeholder after?' },
  { term: 'autonomy choice', pattern: /\b(autonomous|pilotless|uncrewed|unmanned|self-flying|driverless|remotely piloted)\b/i, ask: 'What trip, cost or safety outcome is wanted, whoever flies the aircraft?' },
  { term: 'asset expansion', pattern: /\b((bigger|larger|additional|extra|new|more) (fleets?|aircraft|vertiports?|pads?|chargers?)|fleet of \d+|\d+ (more |new |additional )?(aircraft|vertiports?|pads?|chargers?))\b/i, ask: 'More assets are one way to add capacity: what capacity is needed, and when?' },
  { term: 'implementation phrase', pattern: /\b(by (installing|using|adding|building|deploying|buying)|using an? |by means of)\b/i, ask: 'Remove the “how” and keep the “what” and “why”.' },
]

/**
 * The system of interest, or one of its parts, named as the party that "needs" something ("The system needs to …",
 * "AeroLink needs a curfew …"). SEBoK's form is "The stakeholders need the system to …" (R11 p.555): the needing party
 * is a stakeholder, never the SoI. Instructor-authored list.
 */
const SOI_SUBJECT = /^(?:the\s+|our\s+)?(?:aerolink(?:['’]s)?(?:\s+\w+)?|system|service|app|application|platform|software|aircraft|fleet|network|operations? (?:centre|center|system)|scheduling (?:function|system)|charging system|booking (?:app|system)|dispatch(?:er| system)?)$/i

/**
 * Cues that an operating condition is stated (R11 p.554 "triggering events, system states, operating environments";
 * R53 p.296). Bare "before", "after" and "if" are deliberately NOT cues: "board after confirming a ride" names the start
 * of the need, not the conditions under which it holds. Instructor-authored.
 */
const CONDITION_CUES = /\b(when|whenever|while|during|throughout|until|unless|regardless of|even (if|when)|including when|in (adverse|bad|poor|all|any|degraded)\b|at (all|every|each|any|peak|night)\b|under (adverse|degraded|all|any|normal|peak|emergency)\b|within (each|every|any|the agreed))/i

const words = (s: string) => s.split(/\s+/).filter(Boolean).length

export type NeedDraft = { name: string; text: string; conditions: string; rationale: string; traces: string[] }
export type CriterionResult = { id: CriterionId; ok: boolean; message: string }

export function requirementWords(text: string): string[] {
  const m = text.match(new RegExp(REQUIREMENT_WORDS.source, 'gi'))
  return m ? [...new Set(m.map((x) => x.toLowerCase()))] : []
}

export function solutionTerms(text: string): { term: string; match: string; ask: string }[] {
  const found: { term: string; match: string; ask: string }[] = []
  for (const t of SOLUTION_TERMS) {
    const m = text.match(t.pattern)
    if (m) found.push({ term: t.term, match: m[0].trim(), ask: t.ask })
  }
  return found
}

/** The stakeholder phrase before "need(s)", or undefined if the statement is not attributed ("There is a need for …"). */
export function attributedSubject(text: string): string | undefined {
  const m = text.trim().match(/^(.+?)\s+needs?\b/i)
  if (!m) return undefined
  const subject = m[1].trim()
  if (/^(there\s+(is|are)|it\s+is)\b/i.test(subject)) return undefined
  if (/\b(shall|must)\b/i.test(subject)) return undefined
  if (SOI_SUBJECT.test(subject)) return undefined
  return subject
}

/** True if the subject before "need(s)" is the system of interest or a part of it, not a stakeholder. */
export function soiSubject(text: string): boolean {
  const m = text.trim().match(/^(.+?)\s+needs?\b/i)
  return !!m && SOI_SUBJECT.test(m[1].trim())
}

export const hasConditionCue = (text: string) => CONDITION_CUES.test(text)

/** Evaluate one need draft against every criterion. `traces` are the STK/CON IDs the need derives from. */
export function checkNeed(d: NeedDraft): CriterionResult[] {
  const all = `${d.text} ${d.conditions}`
  const req = requirementWords(all)
  const sol = solutionTerms(all)
  const subject = attributedSubject(d.text)
  const traced = d.traces.filter((t) => /^(STK|CON)-\d{3}$/.test(t))
  // A condition counts only if a condition cue appears, in the statement or in the conditions field: three arbitrary
  // words ("not really applicable") are not a condition.
  const condition = hasConditionCue(d.text) || hasConditionCue(d.conditions)
  return [
    { id: 'not-requirement', ok: req.length === 0, message: req.length ? `Contains ${req.map((w) => `“${w}”`).join(', ')}: that is requirement wording. Needs use “need(s)” (R11 p.555). (“Must” shows intent to oblige, so it stays out of needs; in Week 4 you will see it is not a binding provision either, so requirements use “shall”.)` : 'No requirement wording.' },
    {
      id: 'solution-free',
      ok: sol.length === 0,
      message: sol.length ? sol.map((s) => `“${s.match}” (${s.term}) — ${s.ask}`).join(' ') : 'No design or implementation terms detected (the screen is lexical: check for solutions written in plain words too).',
    },
    {
      id: 'attributed',
      ok: !!subject,
      message: subject
        ? `Attributed to “${subject}” — check that this is the stakeholder you traced it to.`
        : soiSubject(d.text)
          ? 'The system of interest (or a part of it) is named as the party in need. Needs belong to stakeholders: “The stakeholders need the system to …” (R11 p.555).'
          : 'Say who needs it: “<stakeholder> need(s) …”. “There is a need for …” and “X shall …” are not attributed.',
    },
    { id: 'traced', ok: traced.length > 0, message: traced.length ? `Derives from ${traced.join(', ')}.` : 'Choose at least one stakeholder or concern the need derives from.' },
    { id: 'condition', ok: condition, message: condition ? 'An operating condition is stated.' : 'State when, where or under what conditions the need exists (e.g. “throughout operating hours”, “including when weather changes”, “at peak hours”), in the statement or the conditions field. “Before”, “after” or three arbitrary words are not enough.' },
    { id: 'rationale', ok: words(d.rationale) >= 5 && !!d.name.trim(), message: !d.name.trim() ? 'Give the need a short name.' : words(d.rationale) >= 5 ? 'Rationale recorded.' : 'Record why the stakeholder needs this (at least five words); rationale often exposes a solution posing as a need.' },
  ]
}

export const needAcceptable = (d: NeedDraft) => checkNeed(d).every((r) => r.ok)

// ------------------------------------------------------------------------------------------------
// Part A — diagnose solution-laden "needs" (Session 1 practice: diagnose six, write a rewrite before seeing the key)

export type Flaw = 'requirement' | 'solution' | 'unattributed' | 'no-condition'
export const FLAWS: { id: Flaw; label: string }[] = [
  { id: 'requirement', label: 'Written as a requirement' },
  { id: 'solution', label: 'Names a solution' },
  { id: 'unattributed', label: 'No stakeholder' },
  { id: 'no-condition', label: 'No condition' },
]

/** The flaws the checks find in a one-line statement (conditions inline). */
export function diagnose(text: string): Flaw[] {
  const out: Flaw[] = []
  if (requirementWords(text).length) out.push('requirement')
  if (solutionTerms(text).length) out.push('solution')
  if (!attributedSubject(text)) out.push('unattributed')
  if (!hasConditionCue(text)) out.push('no-condition')
  return out
}

export type CritiqueItem = { id: string; before: string; after: string; afterId: string; note: string }

/** Instructor-authored "before" statements; each "after" is the reference need it should become. */
export const CRITIQUE_ITEMS: CritiqueItem[] = [
  {
    id: 'c1',
    before: 'AeroLink shall provide a mobile app that books a ride in three taps.',
    after: 'Passengers need to board within a short and predictable time after confirming a ride, throughout operating hours.',
    afterId: 'NEED-001',
    note: 'The app and the tap count are one design for one part of the trip. The concern behind it (CON-001) is the wait and its predictability.',
  },
  {
    id: 'c2',
    before: 'Communities need sound barriers around each vertiport.',
    after: 'Communities near vertiports need take-off and landing noise kept within the limit agreed with the city, at every pad, at all operating hours.',
    afterId: 'NEED-003',
    note: 'Barriers are one mitigation among several (approach paths, curfews, siting). Stating the agreed limit and the hours keeps those options open.',
  },
  {
    id: 'c3',
    before: 'The FAA needs a weather radar on every aircraft during flight.',
    after: 'The FAA needs assurance that every flight is conducted within the approved airworthiness, energy and weather limits, including when weather changes during the day.',
    afterId: 'NEED-002',
    note: 'The regulator needs assurance about limits; on-board radar is one of several ways to provide it (forecast service, ground stations, procedures).',
  },
  {
    id: 'c4',
    before: 'Vertiport operators need battery-swapping robots so turnaround takes under 10 minutes.',
    after: 'Vertiport operators need arriving aircraft to be ready to depart again quickly enough that pad turnaround does not become the throughput limit, at peak hours.',
    afterId: 'NEED-004',
    note: 'Swapping is a solution class to be compared in the Week 7 trade study, not a need. The 10-minute figure is a candidate requirement value, not part of the need. The reference NEED-004 leaves its condition implicit; “at peak hours” makes it explicit.',
  },
  {
    id: 'c5',
    before: 'There is a need for an AI dispatcher that must assign aircraft when demand peaks.',
    after: 'Passengers need to board within a short and predictable time after confirming a ride, throughout operating hours.',
    afterId: 'NEED-001',
    note: 'Three flaws at once: no stakeholder, requirement wording, and a solution (AI dispatch, which Week 8 may propose as an AI capability).',
  },
  {
    id: 'c6',
    before: 'Emergency responders need early warning of a battery fire at a vertiport, at any hour of operation.',
    after: 'Emergency responders need early warning of, and safe access to, a battery fire at a vertiport, at any hour of operation.',
    afterId: 'NEED-006',
    note: 'Already acceptable — included so that the exercise tests discrimination, not just suspicion. The rewrite adds safe access, because R53 p.296 asks for the complete, end-to-end need; the reference NEED-006 leaves the condition implicit.',
  },
]

export type CritiqueAnswer = Partial<Record<Flaw, boolean>>

/** Compare a student's flaw ticks with the computed diagnosis. */
export function scoreCritique(answers: Record<string, CritiqueAnswer | undefined>) {
  const rows = CRITIQUE_ITEMS.map((it) => {
    const key = new Set(diagnose(it.before))
    const a = answers[it.id] ?? {}
    const missed = FLAWS.filter((f) => key.has(f.id) && !a[f.id]).map((f) => f.id)
    const extra = FLAWS.filter((f) => !key.has(f.id) && a[f.id]).map((f) => f.id)
    return { id: it.id, key: [...key], missed, extra, correct: missed.length === 0 && extra.length === 0 }
  })
  return { rows, correct: rows.filter((r) => r.correct).length, total: rows.length }
}
