// Week 1 AeroLink stakeholder and needs exercises (pure logic), rebuilt 2026-10-18 for "Team Formation / Needs /
// Identifying Stakeholders". The keys follow the definitions taught in L4 and L5 (SEBoK glossary R39a p.1631: a
// stakeholder is an individual or organization, or a group or class of them, with an interest; R11 p.552–553: roles,
// internal/external, approving authorities) and, since the sign-off review of 2026-10-19 (Mo5), the CORRECTED case
// module src/content/lectures/week01/aerolinkCase.ts (STK-001..015, renamed external systems, needs in the taught form
// "The [stakeholders] need the [system] to …", FICTIONAL), the single source the lecture also reads. The concern screen reuses the reviewed Week 2 generic-concern heuristic and, since review F03 of
// commit 0f3ebcb, also asks for one concrete detail (concernDetails). The needs exercise uses the Week 1 need-quality
// assessment (needQuality.ts: structural gates, advisory warnings, a self-check of the six criteria; review F01). Both
// are screens, and the views say what they check and what the student and the instructor judge.
import { ENTERPRISE, EXTERNAL_SYSTEMS, NEEDS, STAKEHOLDERS, SYSTEM_OF_INTEREST, need as caseNeed, numberWord, stakeholder as caseStakeholder } from '../../content/lectures/week01/aerolinkCase'
import { isGenericConcern } from '../../activities/week02/register'
import { CRITIQUE_ITEMS, FLAWS, type Flaw } from '../../activities/week03/needs'
import { assessNeed, notCountingReasons, type NeedAssessment, type SelfCheck } from './needQuality'

// ---------------------------------------------------------------------------------------------- artefact
export const STK_KEY = 'w1.stakeholders'
export const NEEDS_KEY = 'w1.needs'

/** Course role groups (a course grouping of SEBoK's list, R11 p.552; L5). */
export const ROLES = [
  { id: 'user', label: 'User or operator' },
  { id: 'customer', label: 'Customer, acquirer or funder' },
  { id: 'authority', label: 'Approving or regulatory authority' },
  { id: 'supplier', label: 'Supplier or owner of an enabling or external system' },
  { id: 'maintainer', label: 'Maintainer or support' },
  { id: 'public', label: 'Affected public' },
] as const
export type RoleId = (typeof ROLES)[number]['id']
export const roleLabel = (id: string) => ROLES.find((r) => r.id === id)?.label ?? id

/** SEBoK's life-cycle stages for stakeholder identification (R11 p.552, Table 1). */
export const STAGES = ['Concept', 'Development', 'Production, integration, verification and validation', 'Logistics and maintenance', 'Operation', 'Disposal'] as const

// ---------------------------------------------------------------------------------------------- part 1: identify
export type Candidate = { id: string; name: string; stakeholder: boolean; why: string; stk?: string }
/** Why each registered stakeholder is one (instructor key, L4 rules); the names come from the case register. */
const CANDIDATE_WHY: [string, string, string][] = [
  ['k1', 'STK-001', 'Users of the service: the most obvious stakeholders, but not the only ones.'],
  ['k2', 'STK-002', 'An approving authority: it approves the aircraft and the operation.'],
  ['k3', 'STK-003', 'Funders: they have a financial share in the outcome.'],
  ['k4', 'STK-004', 'Affected public: residents never need to ride to be affected by noise and siting.'],
  ['k5', 'STK-005', 'Owners of the pads and chargers the service depends on.'],
  ['k6', 'STK-006', 'They must be able to respond to an incident at the vertiport.'],
  ['k7', 'STK-010', 'The organization that runs the grid: its connection capacity limits charging.'],
  ['k10', 'STK-011', 'A supplier: deliveries and certification progress shape the fleet.'],
  ['k11', 'STK-009', 'Maintainers, found by walking the logistics and maintenance stage.'],
  ['k13', 'STK-013', 'It grants or blocks vertiport sites: an approving authority for the site.'],
  ['k14', 'STK-007', 'The organization that runs controlled airspace: its capacity limits schedule density.'],
  ['k15', 'STK-008', 'Operators of every flight, found by walking the operation stage.'],
  ['k16', 'STK-012', 'A supplier of insurance: premiums and coverage conditions constrain operations.'],
  ['k17', 'STK-014', 'A group with an interest: they speak for passengers who need step-free access.'],
  ['k18', 'STK-015', 'A class of users with needs of their own: SEBoK counts a class of individuals as a stakeholder.'],
]
const caseCandidate = ([id, stk, why]: [string, string, string]): Candidate => ({ id, name: caseStakeholder(stk).name, stakeholder: true, why, stk })
const ext = (id: string) => EXTERNAL_SYSTEMS.find((e) => e.id === id)!
/** The candidates for the new vertiport's register: every stakeholder of the case register (aerolinkCase.ts, fifteen)
 *  and three that are not (L4 rules): two systems of the context and a design attribute. */
export const CANDIDATES: Candidate[] = [
  ...CANDIDATE_WHY.slice(0, 7).map(caseCandidate),
  { id: 'k8', name: ext('EXT-002').name, stakeholder: false, why: 'Not a stakeholder: the grid is a system in the context (EXT-002). The utility that runs it is the stakeholder.' },
  { id: 'k9', name: ext('EXT-003').name, stakeholder: false, why: 'Not a stakeholder: a natural system in the context (EXT-003), with no interest of its own.' },
  ...CANDIDATE_WHY.slice(7, 9).map(caseCandidate),
  { id: 'k12', name: 'Aircraft cabin color scheme', stakeholder: false, why: 'Not a stakeholder: a design attribute, not an individual or organization.' },
  ...CANDIDATE_WHY.slice(9).map(caseCandidate),
]
export const CANDIDATE_COUNT_WORD = numberWord(CANDIDATES.length)

// ---------------------------------------------------------------------------------------------- part 2: classify
export type Side = 'internal' | 'external'
export type Classification = { role?: RoleId; side?: Side; approving?: 'yes' | 'no' }
export type ClassifyRow = { stk: string; name: string; key: Required<Classification>; why: string }
const ref = (id: string) => caseStakeholder(id)
/** Six reference stakeholders with a single defensible classification each (instructor key, from the L5 worked example). */
export const CLASSIFY_ROWS: ClassifyRow[] = [
  { stk: 'STK-002', name: ref('STK-002').name, key: { role: 'authority', side: 'external', approving: 'yes' }, why: 'The FAA certifies and approves the aircraft and the operation; it sits outside AeroLink Urban Mobility.' },
  { stk: 'STK-004', name: 'Communities near vertiports', key: { role: 'public', side: 'external', approving: 'no' }, why: 'Affected by noise and siting; they can oppose a site through planning but do not approve the system for use.' },
  { stk: 'STK-005', name: ref('STK-005').name, key: { role: 'supplier', side: 'external', approving: 'no' }, why: 'Independent operators who own the pads and chargers: owners of an enabling system, outside the company.' },
  { stk: 'STK-008', name: 'AeroLink’s pilots and remote operators', key: { role: 'user', side: 'internal', approving: 'no' }, why: 'They operate every flight and work for AeroLink: internal operators.' },
  { stk: 'STK-009', name: 'AeroLink’s maintenance technicians', key: { role: 'maintainer', side: 'internal', approving: 'no' }, why: 'They keep the aircraft airworthy and work for AeroLink: internal maintainers.' },
  { stk: 'STK-010', name: ref('STK-010').name, key: { role: 'supplier', side: 'external', approving: 'no' }, why: 'It supplies grid power, an enabling system, from outside the company.' },
]

// ---------------------------------------------------------------------------------------------- part 3: one register row
/** Stakeholders not used in part 2, for the student's own register row. */
export const ROW_CHOICES = ['STK-006', 'STK-012', 'STK-013', 'STK-014'].map((id) => ({ id, name: ref(id).name }))
export type RegisterRow = { stk: string; concern: string; influence: string; reason: string }

const words = (s: string) => s.split(/\s+/).filter(Boolean).length

/** Week 1 concern screen: the reviewed Week 2 heuristic (isGenericConcern), after removing intensifiers it does not know
 *  ("a great deal", "a lot", "really"), which otherwise let "they care a great deal about noise" pass as specific. */
const INTENSIFIERS = /\b(a (great|good) deal|a lot( of)?|lots of|really|extremely|quite|highly|so much|deeply|strongly|mainly|mostly|generally|overall|in general)\b/gi
/** Vague words that carry no specific content either ("safety and cost matter most to them"). */
const VAGUE = /\b(matters?|most|more|important|priority|priorities|key|top|main|major|big|issues?|things?|everything|stuff|risks?|risky|unhappy|happy|upset|financial|returns?|general)\b/gi
/** `who`: the stakeholder's name, whose words carry no content in its own concern ("Insurers want a good, safe service").
 *  The name is split into letters-only words, so no regular-expression character can reach the pattern. */
export function isGenericConcernW1(text: string, who = ''): boolean {
  let t = text.replace(INTENSIFIERS, ' ').replace(VAGUE, ' ')
  for (const w of who.split(/[^A-Za-z]+/).filter((x) => x.length >= 3)) t = t.replace(new RegExp(String.raw`\b${w}s?\b`, 'gi'), ' ')
  return isGenericConcern(t)
}

/**
 * The concrete details L5 asks a concern to carry ("say what, for whom, and where or when it bites"), found by cue words
 * (instructor-authored, review F03). One is enough: a number or time, a condition, a place, an affected group or a
 * consequence. The screen cannot tell whether the detail is true or important; the instructor judges that.
 */
const DETAIL_CUES: { kind: string; pattern: RegExp }[] = [
  { kind: 'a number or time', pattern: /\d|\b(one|two|three|four|five|six|seven|eight|nine|ten|twelve|twice|half|dozen|minutes?|hours?|days?|weeks?|months?|years?|quarters?|nights?|mornings?|evenings?|afternoons?|weekends?|weekdays?|shifts?|seasons?|winter|summer|spring|autumn|monday|tuesday|wednesday|thursday|friday|saturday|sunday|noon|midnight|overnight|daily|weekly|monthly|annual(ly)?|a\.m\.|p\.m\.)\b/i },
  { kind: 'a condition', pattern: /\b(when|whenever|while|during|before|after|until|unless|if|each|every|per|once)\b/i },
  { kind: 'a place', pattern: /\b(at|near|on|inside|outside|within|along|across|around|beside|next to|in)\s+(?:the |a |an |their |its |each |every |all |any )?(?!general\b|particular\b|addition\b|least\b|most\b|whole\b|short\b|fact\b|terms\b|total\b|time\b|practice\b|theory\b)[a-z][a-z-]+/i },
  { kind: 'an affected group', pattern: /\bfor\s+(?:the |their |its )?(?!example\b|instance\b|all\b|everyone\b|everybody\b|us\b|them\b|people\b|users?\b|customers?\b|stakeholders?\b|it\b)[a-z][a-z-]+/i },
  { kind: 'a consequence', pattern: /\b(so|because|leads? to|causes?|results? in|means|without|exceed\w*|refus\w*|block\w*|delay\w*|spoil\w*|lose|loses|lost|miss\w*|drop out|woken|wake\w*|how often|how many|how far|how long|how much)\b/i },
]
export function concernDetails(text: string): string[] {
  return DETAIL_CUES.filter((c) => c.pattern.test(text)).map((c) => c.kind)
}
/** A concern counts as specific when it is not generic AND it carries at least one concrete detail. */
export const isSpecificConcern = (text: string, who = '') => !isGenericConcernW1(text, who) && concernDetails(text).length > 0
export const CONCERN_HELP = 'Say what, for whom, and where or when it bites: add at least one concrete detail (a number or time, a condition, a place, an affected group, or a consequence).'

/** The reasons a register row is not acceptable; an empty list means it can be recorded. */
export function registerRowIssues(r: RegisterRow, allowed: string[] = ROW_CHOICES.map((c) => c.id)): string[] {
  const out: string[] = []
  if (!allowed.includes(r.stk)) out.push('Choose a stakeholder from the list.')
  const concern = r.concern.trim()
  // gate sweep 2026-10-19: no word count ("Noise after 10 pm" is specific in four words); specificity is the gate
  if (words(concern) < 1) out.push('Write the concern.')
  else if (!isSpecificConcern(concern, ROW_CHOICES.find((c) => c.id === r.stk)?.name)) out.push(`The concern is generic: it names only a general quality (safety, cost, noise…) or no concrete detail. ${CONCERN_HELP}`)
  const v = r.influence.trim()
  if (!/^[1-5]$/.test(v)) out.push('Rate influence as a whole number from 1 to 5.')
  if (words(r.reason) < 1) out.push('Give the reason for the rating, so that a reviewer can challenge it.')

  return out
}

export type StakeholderExercise = {
  identified: Record<string, 'yes' | 'no'>
  /** When "Check" was last pressed with every candidate answered (the key is shown only after that). */
  identifiedCheckedAt?: number
  classes: Record<string, Classification>
  classesCheckedAt?: number
  row: RegisterRow
  rowRecordedAt?: number
  /** Review F14: after the check, every row that still differs from the key is either re-answered or its explanation is
   *  acknowledged, so the step is not complete while a mismatch has been ignored. */
  identifiedAck?: Record<string, boolean>
  classesAck?: Record<string, boolean>
  /** The score at the first check (the formative record; later corrections do not overwrite it). */
  identifiedFirstScore?: number
  classesFirstScore?: number
}
export const EMPTY_STK: StakeholderExercise = { identified: {}, classes: {}, row: { stk: '', concern: '', influence: '', reason: '' } }

export function stakeholderArtefact(artefacts: Record<string, unknown>): StakeholderExercise {
  const v = artefacts[STK_KEY] as Partial<StakeholderExercise> | undefined
  return {
    ...EMPTY_STK,
    ...(v ?? {}),
    identified: { ...(v?.identified ?? {}) },
    classes: { ...(v?.classes ?? {}) },
    row: { ...EMPTY_STK.row, ...(v?.row ?? {}) },
    identifiedAck: { ...(v?.identifiedAck ?? {}) },
    classesAck: { ...(v?.classesAck ?? {}) },
  }
}

export const identifiedCount = (e: StakeholderExercise) => CANDIDATES.filter((c) => e.identified[c.id]).length
export const identifyScore = (e: StakeholderExercise) => CANDIDATES.filter((c) => e.identified[c.id] === (c.stakeholder ? 'yes' : 'no')).length
export const classifiedCount = (e: StakeholderExercise) => CLASSIFY_ROWS.filter((r) => { const c = e.classes[r.stk]; return !!(c?.role && c.side && c.approving) }).length
export const classifyScore = (e: Pick<StakeholderExercise, 'classes'>) =>
  CLASSIFY_ROWS.reduce((a, r) => { const c = e.classes[r.stk] ?? {}; return a + (c.role === r.key.role ? 1 : 0) + (c.side === r.key.side ? 1 : 0) + (c.approving === r.key.approving ? 1 : 0) }, 0)
export const CLASSIFY_FIELDS = CLASSIFY_ROWS.length * 3

export type CheckOut = { ok: boolean; detail: string }

/** Candidates whose current answer differs from the key and whose explanation has not been acknowledged. */
export const identifyOpen = (e: StakeholderExercise) => CANDIDATES.filter((c) => e.identified[c.id] !== (c.stakeholder ? 'yes' : 'no') && !e.identifiedAck?.[c.id]).map((c) => c.id)
const rowAgrees = (e: StakeholderExercise, r: ClassifyRow) => { const c = e.classes[r.stk] ?? {}; return c.role === r.key.role && c.side === r.key.side && c.approving === r.key.approving }
/** Classification rows that differ from the key and whose explanation has not been acknowledged. */
export const classifyOpen = (e: StakeholderExercise) => CLASSIFY_ROWS.filter((r) => !rowAgrees(e, r) && !e.classesAck?.[r.stk]).map((r) => r.stk)

export function checkIdentified(e: StakeholderExercise): CheckOut {
  const n = identifiedCount(e)
  if (n < CANDIDATES.length) return { ok: false, detail: `${n} of ${CANDIDATES.length} candidates marked.` }
  if (!e.identifiedCheckedAt) return { ok: false, detail: 'All marked. Press “Check” under the list.' }
  const open = identifyOpen(e)
  const first = e.identifiedFirstScore ?? identifyScore(e)
  if (open.length) return { ok: false, detail: `Checked: ${first} of ${CANDIDATES.length} agreed with the key. For each of the ${open.length} that differ, read the explanation and tick “I have read why”, or change your answer.` }
  return { ok: true, detail: `Checked: ${first} of ${CANDIDATES.length} agreed with the key at the first check; every difference has been read.` }
}

export function checkClassified(e: StakeholderExercise): CheckOut {
  const n = classifiedCount(e)
  if (n < CLASSIFY_ROWS.length) return { ok: false, detail: `${n} of ${CLASSIFY_ROWS.length} stakeholders fully classified (role, internal or external, approving authority).` }
  if (!e.classesCheckedAt) return { ok: false, detail: 'All classified. Press “Check classification”.' }
  const open = classifyOpen(e)
  const first = e.classesFirstScore ?? classifyScore(e)
  if (open.length) return { ok: false, detail: `Checked: ${first} of ${CLASSIFY_FIELDS} choices agreed with the key. For each of the ${open.length} rows that differ, read the explanation and tick “I have read why”, or change your answer.` }
  return { ok: true, detail: `Checked: ${first} of ${CLASSIFY_FIELDS} choices agreed with the key at the first check; every difference has been read.` }
}

export function checkRegisterRow(e: StakeholderExercise): CheckOut {
  if (!e.rowRecordedAt) {
    const issues = registerRowIssues(e.row)
    return { ok: false, detail: issues.length ? `Not recorded yet: ${issues[0]}` : 'Ready: press “Record the row”.' }
  }
  const issues = registerRowIssues(e.row)
  return issues.length ? { ok: false, detail: issues[0] } : { ok: true, detail: `Row recorded for ${e.row.stk}.` }
}

// ---------------------------------------------------------------------------------------------- needs exercise
export const REFERENCE_STK_IDS = STAKEHOLDERS.map((s) => s.id)
/** The AeroLink case register (aerolinkCase.ts, fifteen stakeholders) as the need assessment sees it, and AeroLink's own
 *  names (never the party in need). */
export const REFERENCE_REGISTER = STAKEHOLDERS.map((s) => ({ id: s.id, name: s.name }))
export const AEROLINK_SOI_NAMES = [ENTERPRISE.name, 'AeroLink air-taxi service', 'AeroLink']
/** What the [system] of "need the [system] to" may be called in the AeroLink practice (the case's system of interest). */
export const AEROLINK_SYSTEM_NAMES = [SYSTEM_OF_INTEREST.name, SYSTEM_OF_INTEREST.short, ENTERPRISE.name]

/** An AeroLink need draft in mission 4: the statement fields, the stakeholder it comes from, the self-check and the
 *  justification for any warning that stays. */
export type NeedDraft = { name: string; text: string; conditions: string; rationale: string; traces: string[]; selfCheck?: SelfCheck; justification?: string }
export type NeedsExercise = {
  critique: Record<string, W1CritiqueAnswer>
  critiqueCheckedAt?: number
  draft: NeedDraft
  needs: (NeedDraft & { id: string; at: number })[]
}
export const EMPTY_NEED: NeedDraft = { name: '', text: '', conditions: '', rationale: '', traces: [], selfCheck: {}, justification: '' }
export const EMPTY_NEEDS: NeedsExercise = { critique: {}, draft: EMPTY_NEED, needs: [] }

export function needsArtefact(artefacts: Record<string, unknown>): NeedsExercise {
  const v = artefacts[NEEDS_KEY] as Partial<NeedsExercise> | undefined
  return { ...EMPTY_NEEDS, ...(v ?? {}), critique: { ...(v?.critique ?? {}) }, draft: { ...EMPTY_NEED, ...(v?.draft ?? {}) }, needs: Array.isArray(v?.needs) ? v!.needs : [] }
}

/** The need assessment of an AeroLink draft against the reference register (needQuality.ts). */
export const assessAeroLinkNeed = (d: NeedDraft): NeedAssessment => assessNeed({ name: d.name, text: d.text, conditions: d.conditions, rationale: d.rationale, sources: d.traces }, { stakeholders: REFERENCE_REGISTER, soiNames: AEROLINK_SOI_NAMES, systemNames: AEROLINK_SYSTEM_NAMES })
/** Why an AeroLink draft cannot be recorded yet (empty when it can). */
export const draftBlockers = (d: NeedDraft) => notCountingReasons(assessAeroLinkNeed(d), d.selfCheck, d.justification ?? '')
export const needPasses = (d: NeedDraft) => draftBlockers(d).length === 0

/** The flaws a mission-4 draft is read against: the Week 3 four, plus "not a valid need" (id 'form', kept for stored
 *  answers): the draft has a real defect the Week 1 need check rejects (no identifiable stakeholder, a requirement, a
 *  solution as the thing needed, no outcome). Faculty final review (A21): a draft is never keyed for its sentence
 *  pattern alone. */
export type W1Flaw = Flaw | 'form'
export const W1_FLAWS: { id: W1Flaw; label: string }[] = [{ id: 'form', label: 'Not a valid need (rejected, not just phrased differently)' }, ...FLAWS]
export type W1CritiqueAnswer = Partial<Record<W1Flaw, boolean>>

/** Week 1 notes on each draft (sign-off confirmation N7): written for the case need now shown as the reference rewrite,
 *  with its own condition, not for the Week 3 rewrite. */
const W1_NOTES: Record<string, string> = {
  c1: 'Not a valid need: AeroLink, the system, is the subject, and “shall” makes it a requirement. The app and the tap count are one design for one part of the trip; the concern behind it (CON-001) is the wait and its predictability, which NEED-001 states with its own condition.',
  c2: 'Not a valid need: the thing asked for is the barriers, a solution, not an outcome. Barriers are one mitigation among several (approach paths, operating hours, siting). “Around each vertiport” says where the barriers would go, not when or under what conditions the need holds, so the key also marks no condition. NEED-003 states the agreed limits, and its condition names the noise-sensitive hours.',
  c3: 'Not a valid need: the thing asked for is a radar, a solution. The regulator needs assurance about limits; on-board radar is one of several ways to provide it (forecast service, ground stations, procedures). “During flight” is a condition, so the key does not mark no condition.',
  c4: 'Not a valid need: the thing asked for is the robots, a solution. Swapping is a solution class to be compared in the Week 7 trade study, and the 10-minute figure is a candidate requirement value, not part of the need. NEED-004 states the outcome, pads not limited by turnaround, with its own condition: at every vertiport during peak hours.',
  c5: 'Not a valid need: no stakeholder is named, and besides that there is requirement wording (“must”) and a solution (an AI dispatcher, which Week 8 may propose as an AI capability). “When demand peaks” is a condition. NEED-001 gives the passengers’ need behind the request.',
  c6: 'Already acceptable: in the recommended need form, attributed, free of design, with a condition (at any hour of operation). It is included so that the exercise tests discrimination, not just suspicion. The case need NEED-006 goes further and adds safe access, because R53 p.296 asks for the complete, end-to-end need.',
}

/** The mission-4 drafts with their Week 1 reference rewrites: the case need each draft maps to (aerolinkCase.ts NEEDS,
 *  in the taught form), not the Week 3 wording. Draft c6, the acceptable one, is given in the taught form here, so that
 *  "acceptable" never contradicts the form taught in Session 2; the case's NEED-006 adds safe access (end-to-end). */
export const W1_CRITIQUE = CRITIQUE_ITEMS.map((it) => {
  const n = NEEDS.find((x) => x.id === it.afterId) ? caseNeed(it.afterId) : undefined
  return {
    ...it,
    before: it.id === 'c6' ? 'Emergency responders need the air-taxi service to give them early warning of a battery fire at a vertiport, at any hour of operation.' : it.before,
    after: n ? n.statement : it.after,
    afterCondition: n ? n.condition : '',
    note: W1_NOTES[it.id] ?? it.note,
  }
})

/**
 * The instructor's reading of each mission-4 draft against the five flaws (review F01: the key is authored, not computed
 * by the screen, so a screen error cannot become the key). The four Week 3 flaws agree with the Week 3 screen; "form" (not
 * a valid need) agrees with the hard gates of the Week 1 need check (team.test.ts). c6 is the deliberately acceptable draft.
 */
export const CRITIQUE_KEY: Record<string, W1Flaw[]> = {
  c1: ['form', 'requirement', 'solution', 'unattributed', 'no-condition'],
  c2: ['form', 'solution', 'no-condition'],
  c3: ['form', 'solution'],
  c4: ['form', 'solution', 'no-condition'],
  c5: ['form', 'requirement', 'solution', 'unattributed'],
  c6: [],
}
/** Compare a student's flaw ticks with the authored key. */
export function scoreCritiqueW1(answers: Record<string, W1CritiqueAnswer | undefined>) {
  const rows = W1_CRITIQUE.map((it) => {
    const key = new Set<W1Flaw>(CRITIQUE_KEY[it.id] ?? [])
    const a = answers[it.id] ?? {}
    const missed = W1_FLAWS.filter((f) => key.has(f.id) && !a[f.id]).map((f) => f.id)
    const extra = W1_FLAWS.filter((f) => !key.has(f.id) && a[f.id]).map((f) => f.id)
    return { id: it.id, key: [...key], missed, extra, correct: missed.length === 0 && extra.length === 0 }
  })
  return { rows, correct: rows.filter((r) => r.correct).length, total: rows.length }
}

/** Flaw ticks across all drafts (a draft that is already acceptable is answered by ticking nothing). */
export const critiqueTicks = (e: NeedsExercise) => W1_CRITIQUE.reduce((a, it) => a + Object.values(e.critique[it.id] ?? {}).filter(Boolean).length, 0)
export function checkCritique(e: NeedsExercise): CheckOut {
  if (!e.critiqueCheckedAt || critiqueTicks(e) === 0) return { ok: false, detail: `Tick the flaws you see in each of the ${W1_CRITIQUE.length} drafts (none, if a draft is already acceptable), then press “Check”.` }
  const s = scoreCritiqueW1(e.critique)
  return { ok: true, detail: `Checked: ${s.correct} of ${s.total} agree with the key; read the reference rewrite for any that differ.` }
}

/** Mission 4: two recorded AeroLink needs that pass the gates and the self-check (warnings rewritten or justified), from
 *  two different stakeholders. */
export function checkTwoNeeds(e: NeedsExercise): CheckOut {
  const ok = e.needs.filter((x) => needPasses(x))
  const stakeholders = new Set(ok.flatMap((x) => x.traces))
  if (ok.length >= 2 && stakeholders.size >= 2) return { ok: true, detail: `${ok.length} needs recorded and confirmed against the six checks, from ${stakeholders.size} stakeholders.` }
  if (ok.length >= 2) return { ok: false, detail: 'Both needs trace to the same stakeholder: write one for a different stakeholder.' }
  return { ok: false, detail: `${ok.length} of 2 needs recorded and confirmed against the six checks.` }
}
