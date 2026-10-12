// Week 6 — 5×5 risk matrix and AROU register logic (pure).
// Sources: likelihood levels and probability bands from DoD Figure 4-9 (R46 p.126); the cell levels (Low / Moderate /
// High) follow the same figure, and MITRE's handling-option guideline uses the identical layout (R61 p.642, Figure 1:
// green = watch/assume, yellow and brown = avoid/control/transfer). Handling options: R46 p.126 (accepted and monitored,
// avoided, transferred, controlled), R17 p.484 (assumption, avoidance, control (mitigation), transfer) and R61 p.642
// (adds watch/monitor). Condition–if–then: R61 p.630–633; if–then and condition forms: R17 p.483, R46 p.125.
// The AeroLink consequence scale is a course adaptation of the Figure 4-9 performance/schedule columns, tailored as
// R46 p.125 asks; the register minimums (≥ 8 entries, ≥ 4 risks, ≥ 1 each of A/O/U) come from syllabus §11 (CP2).
import type { Element, EngineeringModel } from '../../model/engineering'

export const LIKELIHOOD: { level: number; label: string; band: string; lo: number; hi: number }[] = [
  { level: 1, label: 'Not likely', band: '> 1 % to ≤ 20 %', lo: 0.01, hi: 0.2 },
  { level: 2, label: 'Low likelihood', band: '> 20 % to ≤ 40 %', lo: 0.2, hi: 0.4 },
  { level: 3, label: 'Likely', band: '> 40 % to ≤ 60 %', lo: 0.4, hi: 0.6 },
  { level: 4, label: 'Highly likely', band: '> 60 % to ≤ 80 %', lo: 0.6, hi: 0.8 },
  { level: 5, label: 'Near certainty', band: '> 80 % to ≤ 99 %', lo: 0.8, hi: 0.99 },
]

/** Course consequence scale for AeroLink (adapted from R46 p.126 Figure 4-9; anchors are instructor-authored). */
export const CONSEQUENCE: { level: number; label: string; anchor: string }[] = [
  { level: 1, label: 'Minimal', anchor: 'No effect on meeting any requirement; design margins are still met.' },
  { level: 2, label: 'Minor', anchor: 'A TPM margin is reduced but stays within limits; tolerated with little effect on objectives.' },
  { level: 3, label: 'Moderate', anchor: 'A system requirement (REQ-SYS) is missed at times or needs a workaround; one aircraft or one pad out of service.' },
  { level: 4, label: 'Significant', anchor: 'A stakeholder requirement (REQ-STK) or a planned milestone is missed; network capacity or service level is impaired.' },
  { level: 5, label: 'Severe', anchor: 'Injury, loss of an aircraft or closure of a vertiport, or a key requirement cannot be met: the operation is in jeopardy.' },
]

export type CellLevel = 'Low' | 'Moderate' | 'High'

/** Rows are likelihood 5..1 (top to bottom), columns consequence 1..5 — exactly as drawn in R46 Figure 4-9 and R61 Figure 1. */
const LAYOUT: Record<number, CellLevel[]> = {
  5: ['Low', 'Moderate', 'High', 'High', 'High'],
  4: ['Low', 'Moderate', 'Moderate', 'High', 'High'],
  3: ['Low', 'Low', 'Moderate', 'Moderate', 'High'],
  2: ['Low', 'Low', 'Low', 'Moderate', 'Moderate'],
  1: ['Low', 'Low', 'Low', 'Low', 'Moderate'],
}

const inScale = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 5

export function cellLevel(likelihood: number, consequence: number): CellLevel {
  if (!inScale(likelihood) || !inScale(consequence)) throw new Error(`Rating out of the 1–5 scale: L${likelihood} C${consequence}`)
  return LAYOUT[likelihood][consequence - 1]
}

export const LEVEL_MARK: Record<CellLevel, string> = { Low: 'L', Moderate: 'M', High: 'H' }

export type Handling = 'accept' | 'watch' | 'avoid' | 'mitigate' | 'transfer'
export const HANDLING: { id: Handling; label: string; source: string }[] = [
  { id: 'accept', label: 'Accept / assume (and monitor)', source: 'R46 p.126; R61 p.642' },
  { id: 'watch', label: 'Watch / monitor', source: 'R61 p.642' },
  { id: 'avoid', label: 'Avoid', source: 'R46 p.126; R61 p.642' },
  { id: 'mitigate', label: 'Control (mitigate)', source: 'R17 p.484; R61 p.642' },
  { id: 'transfer', label: 'Transfer', source: 'R46 p.126; R61 p.642' },
]
export const handlingLabel = (h: string) => HANDLING.find((x) => x.id === h)?.label ?? h

/** MITRE's general guideline (R61 p.642 Figure 1) — "appropriate for many, but not all, projects". */
export function handlingAdvice(level: CellLevel): Handling[] {
  return level === 'Low' ? ['watch', 'accept'] : ['avoid', 'mitigate', 'transfer']
}

export type AROUKind = 'A' | 'R' | 'O' | 'U'
export const AROU_LABEL: Record<AROUKind, string> = { A: 'Assumption', R: 'Risk', O: 'Opportunity', U: 'Unknown' }

export type RegisterEntry = {
  kind: AROUKind
  name: string
  text: string
  owner: string
  /** Element the entry affects (REQ, TECH, CAP, SCN, TPM, …) — RB-5.5 linkage. */
  affects: string
  likelihood?: number
  consequence?: number
  handling?: Handling
  treatment?: string
  trigger?: string
  /** A: how and when it will be validated; U: how it will be resolved; O: the action to pursue it. */
  action?: string
  needBy?: string
}

const words = (s = '') => s.trim().split(/\s+/).filter(Boolean).length
/** Condition–if–then (R61 p.630–631): a stated condition, an "if" event and a "then" consequence, in that order. */
export const isConditionIfThen = (s: string) => /\bcondition\b[\s\S]*\bif\b[\s\S]*\bthen\b/i.test(s) || /\b(given|because|since)\b[\s\S]*\bif\b[\s\S]*\bthen\b/i.test(s)
/** R61 p.633: "Do not include the mitigation statement in the risk statement." */
const MITIGATION_IN_STATEMENT = /\b(we will|will be mitigated|mitigat(e|ion) (by|is)|to mitigate|the treatment is)\b/i

/** Splits a statement at its first "if" and the first "then" after it ('' parts when the form is absent). */
export function riskClauses(s: string): { condition: string; ifClause: string; thenClause: string } {
  const m = /^([\s\S]*?)\bif\b([\s\S]*?)\bthen\b([\s\S]*)$/i.exec(s)
  return m ? { condition: m[1], ifClause: m[2], thenClause: m[3] } : { condition: '', ifClause: '', thenClause: '' }
}

// The heuristics below were added after the Week 6 review (W6-F04). Each targets one realistic defect and is tested
// with a long, grammatical bad statement that passes every other check, plus the reference register (rule 4).
const TREATMENT_VERB = '(install|add|fit|use|buy|procure|provide|implement|deploy|fund|hire|train|test|monitor|inspect|maintain|apply|introduce)'
/** The uncertain event is the absence of a treatment ("if we do not install suppression"): a mitigation in disguise (R61 p.633). */
const MISSING_TREATMENT_AS_EVENT = new RegExp(
  `\\b(do not|does not|don[’']t|doesn[’']t|fail(s|ed)? to|neglects? to|never)\\s+(\\w+\\s+){0,2}?${TREATMENT_VERB}\\b|\\bwithout\\s+(\\w+ing)\\b|\\bunless\\s+(we|the team|aerolink)\\b`,
  'i',
)
/** Past-time or completed-event language in the if/then clauses: the event has happened — an issue (R61 p.637). The condition may legitimately state past facts. */
const PAST_TIME = /\b(last (week|month|year|night|time)|yesterday|ago|this morning|earlier this (week|month)|already)\b/i
const PAST_EVENT_IN_IF = /\b(was|did|happened|occurred|overheated|failed|tripped|broke|caught fire|exceeded)\b/i
const PAST_IN_THEN = /\b(was|has been|have been|had been)\b/i
/** An "if" that names no event that could be given a probability. */
const VAGUE_EVENT = /\b(anything|something|whatever|stuff|(things?|it) goes? wrong|(problems?|issues?) (arise|occur|happen)s?)\b/i
/** A consequence must name what is harmed: an element ID, a quantity, or a specific AeroLink asset, service or people. */
const CONCRETE_CONSEQUENCE =
  /\b([A-Z]{1,4}-(STK-|SYS-)?\d{3}|\d+(\.\d+)?)\b|\b(passengers?|riders?|people|injur\w*|aircraft|vertiports?|pads?|hubs?|chargers?|charging|batter(y|ies)|cells?|packs?|reserve|turnaround|capacity|flights?|trips?|operating hours|operations?|service|waits?|requirements?|milestones?|grid|utility|fleet|dispatch|noise|certification|regulator|revenue)\b/i

export const RISK_FORM_MESSAGES = {
  mitigationAsEvent: 'The “if” is the absence of a treatment (“if we do not install …”). That is a mitigation written into the statement (R61 p.633): state the uncertain event that the treatment would address, and put the treatment under treatment.',
  issue: 'The “if” or “then” describes something that has already happened — an issue (probability 1.00, R61 p.637), not a risk. Record it in the issue log; write any future consequence as a separate risk.',
  vagueEvent: 'The “if” names no specific event (“anything goes wrong”). State one uncertain event that can be given a probability (R61 p.630–631).',
  vagueConsequence: 'The “then” does not say what is harmed. Name the requirement, measure or element by ID, a quantity, or the AeroLink asset, service or people affected — not just “the project”.',
} as const

/** Content checks on a risk statement that already has the condition–if–then form. */
export function riskStatementProblems(s: string): string[] {
  const { ifClause, thenClause } = riskClauses(s)
  if (!ifClause && !thenClause) return []
  const out: string[] = []
  if (MISSING_TREATMENT_AS_EVENT.test(ifClause)) out.push(RISK_FORM_MESSAGES.mitigationAsEvent)
  if (PAST_TIME.test(ifClause) || PAST_TIME.test(thenClause) || PAST_EVENT_IN_IF.test(ifClause) || PAST_IN_THEN.test(thenClause)) out.push(RISK_FORM_MESSAGES.issue)
  if (VAGUE_EVENT.test(ifClause)) out.push(RISK_FORM_MESSAGES.vagueEvent)
  if (!CONCRETE_CONSEQUENCE.test(thenClause)) out.push(RISK_FORM_MESSAGES.vagueConsequence)
  return out
}

/** Reasons a register entry cannot be accepted (empty = acceptable). Warnings are advice only. */
export function checkEntry(e: RegisterEntry): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  if (!e.name.trim()) errors.push('Give the entry a short title.')
  if (words(e.text) < 8) errors.push('The statement is too short to be specific (at least eight words).')
  if (!e.owner.trim()) errors.push('Name an owner — a role with the knowledge, authority and resources to act (R61 p.645).')
  if (!e.affects.trim()) errors.push('Link the entry to the element it affects (REQ, TECH, CAP, SCN, TPM …) — RB-5.5.')
  if (e.kind === 'R') {
    if (!isConditionIfThen(e.text)) errors.push('Write the risk as condition–if–then: “Condition: … If …, then …” (R61 p.630–631).')
    else errors.push(...riskStatementProblems(e.text))
    if (MITIGATION_IN_STATEMENT.test(e.text)) errors.push('Keep the mitigation out of the risk statement (R61 p.633); put it under treatment.')
    if (!inScale(e.likelihood) || !inScale(e.consequence)) errors.push('Rate likelihood and consequence on the 1–5 scales.')
    if (!e.handling) errors.push('Choose a handling option after rating the risk.')
    if (words(e.treatment) < 5) errors.push('Describe the treatment: the actions, or for an accepted risk the reason and who approved it.')
    if (words(e.trigger) < 2) errors.push('Give a trigger or watch item that tells the owner the risk is changing (RB-5.4).')
    if (inScale(e.likelihood) && inScale(e.consequence) && e.handling) {
      const level = cellLevel(e.likelihood, e.consequence)
      if (!handlingAdvice(level).includes(e.handling))
        warnings.push(`${handlingLabel(e.handling)} on a ${level} risk departs from MITRE’s general guideline (R61 p.642), which suggests ${handlingAdvice(level).map(handlingLabel).join(', ')}. Justify the choice in the treatment.`)
    }
  } else {
    if (words(e.action) < 4) errors.push(e.kind === 'A' ? 'Say how and when the assumption will be validated.' : e.kind === 'U' ? 'Say how the unknown will be resolved.' : 'Say what action would capture the opportunity.')
    if (e.kind === 'U' && !e.needBy?.trim()) errors.push('Give a need-by date or event for resolving the unknown.')
    if (e.kind === 'O' && /\bif\b[\s\S]*\bthen\b/i.test(e.text) === false) warnings.push('An opportunity reads best as “If …, then [benefit]” (the dual of a risk, R17 p.484).')
  }
  return { errors, warnings }
}

/**
 * Issue log (W6-F10). An issue has already happened (probability 1.00, R61 p.637) and is managed now; DoD runs risk
 * and issue management as related but separate processes (R46 p.120). The shared workspace has no issue element kind,
 * so issues live in this activity's log (per browser) and are copied into CP2 section 7 ("issues listed separately").
 */
export type IssueEntry = { id: string; title: string; text: string; owner: string; affects: string; action: string; linkedRisk: string }

export function checkIssue(i: Omit<IssueEntry, 'id'>): string[] {
  const out: string[] = []
  if (!i.title.trim()) out.push('Give the issue a short title.')
  if (words(i.text) < 8) out.push('Describe what has happened, when and where (at least eight words).')
  if (!i.owner.trim()) out.push('Name the owner role who manages the issue now.')
  if (!i.affects.trim()) out.push('Link the issue to the element it affects (REQ, TECH, CAP …).')
  if (words(i.action) < 4) out.push('State the action being taken now (for example a root-cause analysis and a date).')
  if (i.linkedRisk.trim() && !/^R-\d{3}$/.test(i.linkedRisk.trim())) out.push('A linked future risk must be a register ID of the form R-nnn.')
  return out
}

export const nextIssueId = (log: IssueEntry[]) => `ISS-${String(log.length + 1).padStart(3, '0')}`

/** Plain-text issue list for CP2 section 7. */
export function issueLogText(log: IssueEntry[]): string {
  if (!log.length) return 'Issues (probability 1.00): none recorded.'
  return ['Issues (probability 1.00; managed now, listed separately from the risks):']
    .concat(log.map((i) => `${i.id} ${i.title} — ${i.text.trim()} Owner: ${i.owner.trim()}. Affects: ${i.affects}. Action: ${i.action.trim()}.${i.linkedRisk.trim() ? ` Future consequence tracked as ${i.linkedRisk.trim()}.` : ''}`))
    .join('\n')
}

/** Builds the workspace attributes for an accepted entry, matching the reference attribute names (week06.ts). */
export function attributesFor(e: RegisterEntry): Record<string, string | number> {
  const a: Record<string, string | number> = { owner: e.owner.trim() }
  if (e.kind === 'R') {
    Object.assign(a, { likelihood: e.likelihood!, consequence: e.consequence!, handling: e.handling!, treatment: (e.treatment ?? '').trim(), trigger: (e.trigger ?? '').trim() })
  } else if (e.kind === 'A') a.validation = (e.action ?? '').trim()
  else if (e.kind === 'U') Object.assign(a, { resolution: (e.action ?? '').trim(), needBy: (e.needBy ?? '').trim() })
  else a.action = (e.action ?? '').trim()
  return a
}

/** Reads a workspace element back into an editable entry. */
export function entryFrom(el: Element, affects: string): RegisterEntry {
  const at = el.attributes ?? {}
  const s = (k: string) => (at[k] === undefined ? '' : String(at[k]))
  const n = (k: string) => (typeof at[k] === 'number' ? (at[k] as number) : undefined)
  return {
    kind: el.kind as AROUKind,
    name: el.name,
    text: el.text ?? '',
    owner: s('owner'),
    affects,
    likelihood: n('likelihood'),
    consequence: n('consequence'),
    handling: (s('handling') || undefined) as Handling | undefined,
    treatment: s('treatment'),
    trigger: s('trigger'),
    action: s('validation') || s('resolution') || s('action'),
    needBy: s('needBy'),
  }
}

export type PlottedRisk = { id: string; name: string; likelihood: number; consequence: number; level: CellLevel; handling: string; owner: string }

/** Risks with valid ratings, ready to plot; highest level first, then consequence, then likelihood. */
export function plotRisks(elements: Element[]): PlottedRisk[] {
  const order: Record<CellLevel, number> = { High: 0, Moderate: 1, Low: 2 }
  return elements
    .filter((e) => e.kind === 'R' && e.status === 'active' && inScale(e.attributes?.likelihood) && inScale(e.attributes?.consequence))
    .map((e) => {
      const l = e.attributes!.likelihood as number
      const c = e.attributes!.consequence as number
      return { id: e.id, name: e.name, likelihood: l, consequence: c, level: cellLevel(l, c), handling: String(e.attributes?.handling ?? ''), owner: String(e.attributes?.owner ?? '') }
    })
    .sort((a, b) => order[a.level] - order[b.level] || b.consequence - a.consequence || b.likelihood - a.likelihood || a.id.localeCompare(b.id))
}

export type RegisterCheck = { id: string; label: string; ok: boolean; detail: string }

/** CP2 completeness of the AROU register (syllabus §11; RB-5.3–5.5). */
export function registerCompleteness(m: EngineeringModel): RegisterCheck[] {
  const live = m.elements.filter((e) => e.status === 'active' && ['A', 'R', 'O', 'U'].includes(e.kind))
  const count = (k: string) => live.filter((e) => e.kind === k).length
  const risks = live.filter((e) => e.kind === 'R')
  const linked = new Set(m.links.filter((l) => l.type === 'affects').map((l) => l.source))
  const attr = (e: Element, k: string) => String(e.attributes?.[k] ?? '').trim()
  const unowned = live.filter((e) => !attr(e, 'owner') && !e.owner).map((e) => e.id)
  const unrated = risks.filter((e) => !inScale(e.attributes?.likelihood) || !inScale(e.attributes?.consequence)).map((e) => e.id)
  const untreated = risks.filter((e) => !attr(e, 'handling') || words(attr(e, 'treatment')) < 3).map((e) => e.id)
  const malformed = risks.filter((e) => !isConditionIfThen(e.text ?? '') && !/\bif\b[\s\S]*\bthen\b/i.test(e.text ?? '')).map((e) => e.id)
  const unlinked = live.filter((e) => !linked.has(e.id)).map((e) => e.id)
  const list = (ids: string[]) => (ids.length ? `missing: ${ids.join(', ')}` : 'all')
  return [
    { id: 'entries', label: '≥ 8 AROU entries', ok: live.length >= 8, detail: `${live.length} entries` },
    { id: 'risks', label: '≥ 4 of them risks', ok: risks.length >= 4, detail: `${risks.length} risks` },
    { id: 'aou', label: '≥ 1 assumption, ≥ 1 opportunity, ≥ 1 unknown', ok: count('A') >= 1 && count('O') >= 1 && count('U') >= 1, detail: `A ${count('A')} · O ${count('O')} · U ${count('U')}` },
    { id: 'form', label: 'Every risk written if–then (condition–if–then preferred)', ok: malformed.length === 0, detail: list(malformed) },
    { id: 'rated', label: 'Every risk rated on the 5×5 scales', ok: unrated.length === 0, detail: list(unrated) },
    { id: 'treated', label: 'Every risk has a handling option and a treatment', ok: untreated.length === 0, detail: list(untreated) },
    { id: 'owned', label: 'Every entry has an owner', ok: unowned.length === 0, detail: list(unowned) },
    { id: 'linked', label: 'Every entry affects at least one element (RB-5.5)', ok: unlinked.length === 0, detail: list(unlinked) },
  ]
}
