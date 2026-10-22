// Week 1 Team enterprise capture (pure logic): the team's own Week 1 Team Record (charter, enterprise proposal, context,
// stakeholder register, initial needs, plus the AI usage statement) and its exports: a Markdown record for reading and a
// JSON file of model inputs for Phase II. The Team enterprise view (the lab tool) and the readiness panels use these checks;
// src/workbench/week1/team.test.ts tests each one in both directions (good input accepted, bad input rejected).
// Revised for the review of commit 0f3ebcb (_source_cache/review/week01_rebuild_review.md):
//   F01  needs: structural gates, advisory warnings, a per-need self-check of the six criteria (needQuality.ts);
//   F02  readiness: "ready" needs the instructor's approval with a valid past date and the AI usage statement; a record
//        whose proposal is only submitted for approval is labeled as such and never shown as ready;
//   F03  concerns: generic concerns and concerns with no concrete detail do not count;
//   F04  import: shapes validated with clear messages; duplicate IDs refused in the file and flagged in the record;
//   F05  charter and proposal edges (distinct leads, owned Week 1 prefixes, abbreviation-aware sentences, AeroLink);
//   F11  need priority, need → concern links, several concerns per stakeholder, IDs for the elements inside the boundary.
// Sign-off review 2026-10-19: the lecture is the authoritative source and the minimums, the need form, the six-check gate,
// the PRT meaning and the relationship types are read from src/content/lectures/week01/labBrief.ts (S2-18):
//   M1   needs in the taught form "The [stakeholders] need the [system] to …" (needQuality.ts), six checks incl. concern;
//   M2   PRT = an element inside the boundary of the system of interest (seeds a part usage in Week 8);
//   M3   Part 2 records the problem statement, the mission (MGO-001) and goals (MGO-002 …); every need traces to the
//        mission or a goal; model inputs JSON version 3 (versions 1 and 2 still load);
//   Mo1  Part 4 records relationships as REL rows (from, to, type, note): at least 3, at least 1 conflict;
//   Mo4  a three-person team uses the reduced needs minimum (6 needs from 4 stakeholders, pending faculty approval).
import { ownerProblem } from '../../components/ProvenanceOwnerFields'
import { ELEMENT_KINDS } from '../../model/engineering'
import { COURSE_ROLES, MERGED_ROLE } from './logic'
import { LAB_MINIMUMS, LAB_MINIMUMS_THREE, LEGACY_PRIORITY, NEED_PRIORITIES, NEED_PRIORITY_LABEL, REL_TYPES, REL_VERB, WEEK1_PREFIXES as BRIEF_PREFIXES, type NeedPriority, type RelType } from '../../content/lectures/week01/labBrief'
import { assessNeed, CRITERION_IDS, notCountingReasons, type CriterionId, type NeedAssessment, type SelfCheck } from './needQuality'
import { CONCERN_HELP, isSpecificConcern, ROLES, STAGES, roleLabel } from './stakeholders'
import { EMPTY_ANSWER } from '../emptyAnswer'

export const TEAM_KEY = 'w1.team'
export const MIN_INSIDE = LAB_MINIMUMS.inside
export const MIN_CONTEXT = LAB_MINIMUMS.context
export const MIN_STAKEHOLDERS = LAB_MINIMUMS.stakeholders
export const MIN_ROLE_GROUPS = LAB_MINIMUMS.roleGroups
export const MIN_RELATIONSHIPS = LAB_MINIMUMS.relationships
export const MIN_CONFLICTS = LAB_MINIMUMS.conflicts
export const MIN_NEEDS = LAB_MINIMUMS.needs
export const MIN_NEED_SOURCES = LAB_MINIMUMS.needSources
export const MIN_WHY_WORDS = 40
export const MIN_AI_WORDS = 12
/** A one-sentence statement (problem, mission, system of interest): at least a subject, a verb and an object. Gate sweep
 *  2026-10-19: was 8, which rejected valid short missions ("Feed every family weekly"); the lab asks for one sentence, not
 *  a length. The 40-word suitability paragraph (MIN_WHY_WORDS) is stated in the lab instructions and stays. */
export const MIN_STATEMENT_WORDS = 3
/** Answers that say nothing ("ok", "n/a", "none"): not a rule, a reason or a justification. */
export { EMPTY_ANSWER } // shared with Weeks 1, 2, 3 and 5 (src/workbench/emptyAnswer.ts)
const said = (s: string) => words(s) >= 1 && !EMPTY_ANSWER.test(s.trim())
/** The mission's fixed ID; goals take MGO-002 onward (the AeroLink case numbers them the same way). */
export const MISSION_ID = 'MGO-001'
/** The Week 1 prefixes every team must assign to an owner (the lecture's charter, labBrief.ts). */
export const WEEK1_PREFIXES = BRIEF_PREFIXES
/** Every prefix of the course's stable ID scheme (model/engineering.ts), plus PRT (parts inside the boundary) and REL. */
export const KNOWN_PREFIXES = new Set<string>([...ELEMENT_KINDS, 'PRT', 'REL'])
/** The needs minimums for this team: a three-person team uses the reduced minimum (pending faculty approval). */
export const needsMinimum = (c: Pick<Charter, 'threePersonTeam'>) => (c.threePersonTeam ? LAB_MINIMUMS_THREE : { needs: MIN_NEEDS, needSources: MIN_NEED_SOURCES })

export type Direction = '' | 'in' | 'out' | 'both'
export type ContextRow = { id: string; name: string; kind: '' | 'system' | 'actor'; crosses: string; direction: Direction }
export type ConcernRow = { id: string; text: string }
/** A25 (faculty, 2026-10-21): the level of interest (1–5) with a short reason is required; influence (1–5, with its
 *  reason) and support (MITRE's scale 1–4) are optional. The three new fields are optional in the type so that records
 *  and rows written before M6 still type-check; normalizeTeam always fills them. */
export type StakeholderRow = { id: string; name: string; role: string; stage: string; side: '' | 'internal' | 'external'; approving: '' | 'yes' | 'no'; concerns: ConcernRow[]; influence: string; reason: string; interest?: string; interestReason?: string; support?: string }
/** MITRE's support scale (R63 pp.236–237): 1 awareness, 2 understanding, 3 buy-in, 4 commitment. */
export const SUPPORT_LEVELS = ['1', '2', '3', '4'] as const
/** MITRE's priority categories (labBrief.ts NEED_PRIORITIES, R65 p.325), the lecture's vocabulary (A21 item 1). */
export type Priority = '' | NeedPriority
export type NeedRow = { id: string; name: string; text: string; conditions: string; rationale: string; sources: string; concerns: string; goal: string; priority: Priority; selfCheck: SelfCheck; justification: string }
export type InsideRow = { id: string; name: string }
export type GoalRow = { id: string; text: string }
export type RelRow = { id: string; from: string; to: string; type: RelType | ''; note: string }
export type Decision = '' | 'pending' | 'approved' | 'revise'
/** `purpose` holds the mission (MGO-001), kept under its first name so that stored records still load. */
export type Proposal = { name: string; domain: string; problem: string; purpose: string; goals: GoalRow[]; soi: string; inside: InsideRow[]; why: string; decision: Decision; decidedOn: string }
export type Charter = { threePersonTeam: boolean; roles: Record<string, string>; decisionRules: string; norms: string; prefixes: string }
export type Issued = { EXT: number; STK: number; CON: number; NEED: number; PRT: number; MGO: number; REL: number }
export type IdPrefix = keyof Issued
export type TeamRecord = {
  team: string
  proposal: Proposal
  charter: Charter
  context: ContextRow[]
  stakeholders: StakeholderRow[]
  /** Part 4: relationships between stakeholders (REL rows), at least one of them a conflict. */
  relationships: RelRow[]
  needs: NeedRow[]
  /** Part 6: tool, purpose, prompts, what was accepted or rejected and why (or that no AI tool was used). */
  aiStatement: string
  /** Highest number issued per prefix, so an ID is never reused after a row is deleted. */
  issued: Issued
  updatedAt?: number
  /** When each export was last made; the export step needs both after the last change. */
  exportedMdAt?: number
  exportedJsonAt?: number
}

export const DECISION_LABEL: Record<Decision, string> = { '': '(not recorded)', pending: 'submitted for approval (not yet approved)', approved: 'approved', revise: 'revise and resubmit' }
export const PRIORITIES: Priority[] = [...NEED_PRIORITIES]
export const PRIORITY_LABEL = NEED_PRIORITY_LABEL
/** A stored or imported priority: a MITRE category, or a pre-A21 high / medium / low mapped to one (LEGACY_PRIORITY). */
export const readPriority = (x: unknown): Priority => oneOf(x, NEED_PRIORITIES) || (typeof x === 'string' ? (LEGACY_PRIORITY[x.trim().toLowerCase()] ?? '') : '')
export const EMPTY_PROPOSAL: Proposal = { name: '', domain: '', problem: '', purpose: '', goals: [], soi: '', inside: [], why: '', decision: '', decidedOn: '' }
export const EMPTY_CHARTER: Charter = { threePersonTeam: false, roles: {}, decisionRules: '', norms: '', prefixes: '' }
export const EMPTY_ISSUED: Issued = { EXT: 0, STK: 0, CON: 0, NEED: 0, PRT: 0, MGO: 1, REL: 0 }
export const EMPTY_TEAM: TeamRecord = { team: '', proposal: EMPTY_PROPOSAL, charter: EMPTY_CHARTER, context: [], stakeholders: [], relationships: [], needs: [], aiStatement: '', issued: EMPTY_ISSUED }
export const EMPTY_NEED_ROW = (id: string): NeedRow => ({ id, name: '', text: '', conditions: '', rationale: '', sources: '', concerns: '', goal: '', priority: '', selfCheck: {}, justification: '' })
export const EMPTY_REL_ROW = (id: string): RelRow => ({ id, from: '', to: '', type: '', note: '' })
export const relVerb = (t: RelType | '') => (t ? REL_VERB[t] : '(type not chosen)')
const stkIdsIn = (s: string) => [...new Set(s.toUpperCase().match(/STK-\d{3}/g) ?? [])]
/** A free-text conflict of the first record shapes ("STK-007 … STK-004 …") as a REL row. */
export function conflictToRel(text: string, id = 'REL-001'): RelRow[] {
  if (!text.trim()) return []
  const [from = '', to = ''] = stkIdsIn(text)
  return [{ id, from, to, type: 'conflicts-with', note: text.trim() }]
}

export function teamArtefact(artefacts: Record<string, unknown>): TeamRecord {
  return normalizeTeam(artefacts[TEAM_KEY])
}

const pad = (n: number) => String(n).padStart(3, '0')
const num = (id: string) => Number(id.split('-')[1]) || 0
const str = (x: unknown) => (typeof x === 'string' ? x : x === undefined || x === null ? '' : String(x))
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const objs = (x: unknown): Record<string, unknown>[] => (Array.isArray(x) ? x.filter(isObj) : [])
const oneOf = <T extends string>(x: unknown, allowed: readonly T[]): T | '' => (allowed.includes(x as T) ? (x as T) : '')

/** Fills missing fields of a stored or imported record, and upgrades the first Week 1 record shape (one concern per
 *  stakeholder as text, the inside elements as lines) to the current one. Never throws. */
export function normalizeTeam(v: unknown): TeamRecord {
  const r = isObj(v) ? v : {}
  const p = isObj(r.proposal) ? r.proposal : {}
  const c = isObj(r.charter) ? r.charter : {}
  const insideRaw = p.inside
  const inside: InsideRow[] =
    typeof insideRaw === 'string'
      ? insideRaw.split('\n').map((x) => x.trim()).filter(Boolean).map((name, i) => ({ id: `PRT-${pad(i + 1)}`, name }))
      : objs(insideRaw).map((x) => ({ id: str(x.id), name: str(x.name) }))
  const stakeholders: StakeholderRow[] = objs(r.stakeholders).map((s) => ({
    id: str(s.id),
    name: str(s.name),
    role: str(s.role),
    stage: str(s.stage),
    side: oneOf(s.side, ['internal', 'external'] as const),
    approving: oneOf(s.approving, ['yes', 'no'] as const),
    concerns: Array.isArray(s.concerns) ? objs(s.concerns).map((k) => ({ id: str(k.id), text: str(k.text) })) : str(s.concern).trim() ? [{ id: str(s.id).replace('STK', 'CON'), text: str(s.concern) }] : [],
    influence: str(s.influence),
    reason: str(s.reason),
    interest: str(s.interest),
    interestReason: str(s.interestReason),
    support: str(s.support),
  }))
  const needs: NeedRow[] = objs(r.needs).map((n) => ({
    ...EMPTY_NEED_ROW(str(n.id)),
    name: str(n.name),
    text: str(n.text),
    conditions: str(n.conditions),
    rationale: str(n.rationale),
    sources: str(n.sources),
    concerns: str(n.concerns),
    goal: str(n.goal).trim().toUpperCase(),
    priority: readPriority(n.priority),
    selfCheck: isObj(n.selfCheck) ? Object.fromEntries(CRITERION_IDS.map((id) => [id, (n.selfCheck as Record<string, unknown>)[id] === true])) : {},
    justification: str(n.justification),
  }))
  const issuedIn = isObj(r.issued) ? r.issued : {}
  // relationships: REL rows; a record of the first shapes carries one free-text conflict, read as a conflict row
  const relationships: RelRow[] = Array.isArray(r.relationships)
    ? objs(r.relationships).map((x) => ({ id: str(x.id), from: str(x.from).trim().toUpperCase(), to: str(x.to).trim().toUpperCase(), type: oneOf(x.type, REL_TYPES), note: str(x.note) }))
    : conflictToRel(str(r.conflict))
  const rec: TeamRecord = {
    team: str(r.team),
    proposal: { ...EMPTY_PROPOSAL, name: str(p.name), domain: str(p.domain), problem: str(p.problem), purpose: str(p.purpose), goals: objs(p.goals).map((x) => ({ id: str(x.id), text: str(x.text) })), soi: str(p.soi), inside, why: str(p.why), decision: oneOf(p.decision, ['pending', 'approved', 'revise'] as const), decidedOn: str(p.decidedOn) },
    charter: { threePersonTeam: c.threePersonTeam === true, roles: Object.fromEntries(Object.entries(isObj(c.roles) ? c.roles : {}).map(([k, x]) => [k, str(x)])), decisionRules: str(c.decisionRules), norms: str(c.norms), prefixes: str(c.prefixes) },
    context: objs(r.context).map((x) => ({ id: str(x.id), name: str(x.name), kind: oneOf(x.kind, ['system', 'actor'] as const), crosses: str(x.crosses), direction: oneOf(x.direction, ['in', 'out', 'both'] as const) })),
    stakeholders,
    relationships,
    needs,
    aiStatement: str(r.aiStatement),
    issued: { ...EMPTY_ISSUED },
    updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : undefined,
    exportedMdAt: typeof r.exportedMdAt === 'number' ? r.exportedMdAt : undefined,
    exportedJsonAt: typeof r.exportedJsonAt === 'number' ? r.exportedJsonAt : undefined,
  }
  for (const k of Object.keys(EMPTY_ISSUED) as IdPrefix[]) rec.issued[k] = Math.max(Number(issuedIn[k]) || 0, ...idsOf(rec, k).map(num), EMPTY_ISSUED[k])
  return rec
}

/** Every ID of one prefix present in the record. */
export function idsOf(r: TeamRecord, prefix: IdPrefix): string[] {
  if (prefix === 'EXT') return r.context.map((x) => x.id)
  if (prefix === 'STK') return r.stakeholders.map((x) => x.id)
  if (prefix === 'CON') return r.stakeholders.flatMap((s) => s.concerns.map((x) => x.id))
  if (prefix === 'NEED') return r.needs.map((x) => x.id)
  if (prefix === 'MGO') return r.proposal.goals.map((x) => x.id)
  if (prefix === 'REL') return r.relationships.map((x) => x.id)
  return r.proposal.inside.map((x) => x.id)
}
/** The next ID for a prefix: one past the highest ever issued or present, so a deleted ID is never reused. */
export function nextId(r: TeamRecord, prefix: IdPrefix): string {
  return `${prefix}-${pad(Math.max(r.issued[prefix], 0, ...idsOf(r, prefix).map(num)) + 1)}`
}

export const words = (s: string) => s.split(/\s+/).filter(Boolean).length
export const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)
/** Sentences, ignoring the full stops of common abbreviations ("U.S.", "e.g.", "a.m.", "St.") and of initials. */
export function sentenceCount(s: string): number {
  const t = s
    .replace(/\b(?:[A-Za-z]\.){2,}/g, (m) => m.replace(/\./g, ''))
    .replace(/\b(?:e\.g|i\.e|etc|vs|approx|Dr|Mr|Mrs|Ms|St|Inc|Ltd|Co|No|Dept|Univ|Ave|Rd|Mt)\./gi, (m) => m.slice(0, -1))
    .replace(/\b[A-Z]\.(?=\s+[A-Z])/g, (m) => m.slice(0, -1))
  return t.split(/[.!?](?:\s|$)/).filter((x) => x.trim().length > 0).length
}
/** Source IDs written in a need's source field ("STK-001, STK-004"). */
export const sourcesOf = (n: Pick<NeedRow, 'sources'>) => [...new Set(n.sources.toUpperCase().match(/STK-\d{3}/g) ?? [])]
/** Concern IDs written in a need's concern field ("CON-001"). */
export const concernsOf = (n: Pick<NeedRow, 'concerns'>) => [...new Set(n.concerns.toUpperCase().match(/CON-\d{3}/g) ?? [])]
/** IDs that occur more than once. */
export const duplicates = (ids: string[]) => [...new Set(ids.filter((x, i) => x && ids.indexOf(x) !== i))]

/** Today as YYYY-MM-DD in local time. */
export const todayISO = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
/** A real calendar date written YYYY-MM-DD ("2099-99-99" and "2026-02-30" are not). */
export function isCalendarDate(s: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim())
  if (!m) return false
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3]
}

export type PartCheck = { ok: boolean; issues: string[]; detail: string }
const result = (issues: string[], okDetail: string): PartCheck => ({ ok: issues.length === 0, issues, detail: issues.length ? issues[0] + (issues.length > 1 ? ` (+${issues.length - 1} more)` : '') : okDetail })

/** AeroLink is the instructor's worked example and cannot be a team enterprise (DECISION_LOG A16). A purpose or a
 *  suitability case may mention it in contrast ("Unlike AeroLink, …"); the name, domain, system of interest and the
 *  elements inside the boundary may not. Near copies under another name are caught at the instructor's checkpoint. */
export const isAeroLink = (s: string) => /aero\s*-?\s*link/i.test(s)
export const proposalNamesAeroLink = (p: Proposal) => [p.name, p.domain, p.soi, ...p.inside.map((x) => x.name)].some(isAeroLink)

// ---------------------------------------------------------------------------------------------- part 1: charter
export type PrefixLine = { member: string; prefixes: string[] }
/** "JS: STK, CON, NEED" lines, read case-insensitively ("js: stk" is accepted). */
export function prefixLines(s: string): PrefixLine[] {
  return s
    .split(/[\n;]/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => /^([A-Za-z]{2,4})\s*:\s*(.*)$/.exec(x))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m) => ({ member: m[1].toUpperCase(), prefixes: [...new Set((m[2].toUpperCase().match(/[A-Z]+/g) ?? []))] }))
}

export function checkCharterPart(c: Charter): PartCheck {
  const roles = COURSE_ROLES.filter((r) => !(c.threePersonTeam && r === MERGED_ROLE))
  const unassigned = roles.filter((r) => ownerProblem(c.roles[r] ?? ''))
  const issues: string[] = []
  if (unassigned.length) issues.push(`Initials (2–4 letters) for ${unassigned.join(', ')}.`)
  const holders = roles.filter((r) => !ownerProblem(c.roles[r] ?? '')).map((r) => c.roles[r].trim().toUpperCase())
  const twice = duplicates(holders)
  if (twice.length) issues.push(`Each lead role needs a different member: ${twice.join(', ')} holds more than one. (In a three-person team, tick the box so that AI & Data Management merges with Architecture.)`)
  // gate sweep 2026-10-19: "Majority vote" and "Discord, daily" are complete answers; only an empty answer fails
  if (!said(c.decisionRules)) issues.push('Decision rules: say how the team decides when members disagree.')
  if (!said(c.norms)) issues.push('Communication norms: where the team talks, reply times, meetings.')
  const pl = prefixLines(c.prefixes)
  const members = new Set(holders)
  if (!pl.length) issues.push('Owned ID prefixes, one member per line: “JS: STK, CON, NEED”.')
  else {
    const named = new Set(pl.map((x) => x.member))
    const missing = [...members].filter((m) => !named.has(m))
    if (missing.length) issues.push(`Owned prefixes for every member: ${missing.join(', ')} has none.`)
    const strangers = [...named].filter((m) => !members.has(m))
    if (strangers.length && members.size) issues.push(`${strangers.join(', ')} holds no lead role: use the initials recorded for the roles.`)
    const unknown = [...new Set(pl.flatMap((x) => x.prefixes).filter((p) => !KNOWN_PREFIXES.has(p)))]
    if (unknown.length) issues.push(`${unknown.join(', ')} ${unknown.length > 1 ? 'are not prefixes' : 'is not a prefix'} of the course ID scheme (Week 1 uses ${WEEK1_PREFIXES.join(', ')}; later weeks add others).`)
    for (const p of WEEK1_PREFIXES) {
      const owners = pl.filter((x) => x.prefixes.includes(p)).map((x) => x.member)
      if (!owners.length) issues.push(`Nobody owns ${p}: every Week 1 prefix (${WEEK1_PREFIXES.join(', ')}) needs one owner.`)
      else if (owners.length > 1) issues.push(`${p} is owned by ${owners.join(' and ')}: one owner per prefix.`)
    }
  }
  return result(issues, 'Roles held by different members, decision rules, norms, and an owner for every Week 1 prefix.')
}

// ---------------------------------------------------------------------------------------------- part 2: proposal
/** Where the proposal stands with the instructor: approved (with a valid, not future, date), submitted for approval, or
 *  neither. Week 1 may be submitted while approval is pending, labeled; approval is required before the Week 2
 *  submission (default pending the faculty decision recorded in WEEK1_LEARNING_DESIGN.md §10). */
export type Approval = 'approved' | 'pending' | 'none'
export function approvalOf(p: Proposal, today = todayISO()): Approval {
  if (p.decision === 'approved' && isCalendarDate(p.decidedOn) && p.decidedOn.trim() <= today) return 'approved'
  if (p.decision === 'pending' && (!p.decidedOn.trim() || (isCalendarDate(p.decidedOn) && p.decidedOn.trim() <= today))) return 'pending'
  return 'none'
}

/** The proposal's content checks without the instructor's decision (M6: approval is an instructor action on the course
 *  server, so the canvas shows the content checks and the approval state separately). */
export function checkProposalContent(p: Proposal): PartCheck {
  const c = checkProposal({ ...p, decision: 'pending', decidedOn: '' })
  return result(c.issues, 'The proposal’s content meets the course checks: it can be sent for instructor approval.')
}

export function checkProposal(p: Proposal, today = todayISO()): PartCheck {
  const issues: string[] = []
  if (!p.name.trim()) issues.push('Name the enterprise.')
  if (proposalNamesAeroLink(p)) issues.push('AeroLink is the instructor’s worked example: propose your team’s own enterprise.')
  if (!p.domain.trim()) issues.push('State the domain (for example health care, logistics, energy, transport).')
  const oneSentence = (label: string, v: string) => {
    if (words(v) < MIN_STATEMENT_WORDS) issues.push(`${label}: one sentence (at least a subject, a verb and an object: ${MIN_STATEMENT_WORDS} words).`)
    else if (sentenceCount(v) > 1) issues.push(`${label}: a single sentence (it has more than one).`)
  }
  oneSentence('Problem statement', p.problem)
  oneSentence(`Mission (${MISSION_ID})`, p.purpose)
  for (const g of p.goals) if (words(g.text) < 1) issues.push(`${g.id || 'An objective'}: state the objective, or remove it.`) // A25: students see “objectives” (MGO-002…)
  const goalIds = p.goals.map((g) => g.id)
  const badGoal = goalIds.filter((id) => !/^MGO-\d{3}$/.test(id) || id === MISSION_ID)
  if (badGoal.length) issues.push(`Objective IDs run from MGO-002 (${MISSION_ID} is the mission): ${badGoal.map((x) => x || '(empty)').join(', ')}.`)
  const dupGoal = duplicates(goalIds)
  if (dupGoal.length) issues.push(`Duplicate objective ID ${dupGoal.join(', ')}: each ID once.`)
  oneSentence('System of interest', p.soi)
  const inside = p.inside.filter((x) => x.name.trim())
  if (inside.length < MIN_INSIDE) issues.push(`Inside the boundary of the system of interest: at least ${MIN_INSIDE} elements (PRT), ${inside.length} so far.`)
  const dupInside = duplicates(p.inside.map((x) => x.id))
  if (dupInside.length) issues.push(`Duplicate ID ${dupInside.join(', ')} inside the boundary: each ID once.`)
  if (words(p.why) < MIN_WHY_WORDS) issues.push(`Why it suits a 14-week project: at least ${MIN_WHY_WORDS} words (${words(p.why)} so far).`)
  const date = p.decidedOn.trim()
  if (!p.decision) issues.push('Request instructor approval of the proposal: the instructor’s decision (approved, or revise) is recorded on the course server.')
  else if (p.decision === 'revise') issues.push('The instructor asked for a revision: revise the proposal and send it for approval again.')
  else if (p.decision === 'approved' && !date) issues.push('Give the date of the instructor’s approval (YYYY-MM-DD).')
  if (date && !isCalendarDate(date)) issues.push(`“${date}” is not a date: write it as YYYY-MM-DD.`)
  else if (date && date > today) issues.push(`The date ${date} is in the future: record the date the decision was made.`)
  const a = approvalOf(p, today)
  return result(issues, a === 'approved' ? `Proposal complete and approved on ${date}.` : 'Proposal complete and submitted for approval: not yet approved. Approval is required before the Week 2 submission.')
}

// ---------------------------------------------------------------------------------------------- part 3: context
export function contextRowIssues(c: ContextRow): string[] {
  const out: string[] = []
  if (!c.name.trim()) out.push('a name')
  if (!c.kind) out.push('its kind (system or actor)')
  if (words(c.crosses) < 1) out.push('what crosses the boundary')
  if (!c.direction) out.push('the direction')
  return out
}
export function checkContextPart(r: TeamRecord): PartCheck {
  const issues: string[] = []
  const dupIds = duplicates(r.context.map((c) => c.id))
  const complete = r.context.filter((c) => contextRowIssues(c).length === 0 && !dupIds.includes(c.id))
  if (dupIds.length) issues.push(`Duplicate ID ${dupIds.join(', ')}: each ID once.`)
  for (const c of r.context) {
    const miss = contextRowIssues(c)
    if (miss.length) issues.push(`${c.id}: add ${miss.join(', ')}.`)
  }
  const names = r.context.map((c) => c.name.trim().toLowerCase()).filter(Boolean)
  const dup = names.filter((x, i) => names.indexOf(x) !== i)
  if (dup.length) issues.push(`Each external item once: “${dup[0]}” appears twice.`)
  if (r.proposal.name.trim() && names.includes(r.proposal.name.trim().toLowerCase())) issues.push('The system of interest itself is not part of its own context.')
  if (complete.length < MIN_CONTEXT) issues.unshift(`At least ${MIN_CONTEXT} complete external systems or actors (${complete.length} so far).`)
  return result(issues, `${complete.length} external systems and actors, each with what crosses and its direction.`)
}

// ---------------------------------------------------------------------------------------------- part 4: register
/** The reason a concern does not count, or '' when it does. */
export function concernIssue(c: ConcernRow, who: string): string {
  // gate sweep 2026-10-19: no word count; "Noise after 10 pm" is specific in four words. Specificity is the gate.
  if (words(c.text) < 1) return `${c.id}: write the concern`
  if (!isSpecificConcern(c.text, who)) return `${c.id}: a specific concern (this one names only a general quality or no concrete detail). ${CONCERN_HELP}`
  return ''
}
export function stakeholderRowIssues(s: StakeholderRow): string[] {
  const out: string[] = []
  if (!s.name.trim()) out.push('a name')
  if (!ROLES.some((r) => r.id === s.role)) out.push('a role')
  if (!(STAGES as readonly string[]).includes(s.stage)) out.push('a life-cycle stage')
  if (!s.side) out.push('internal or external')
  if (!s.approving) out.push('whether it is an approving authority')
  if (!s.concerns.length) out.push('at least one concern')
  for (const c of s.concerns) {
    const x = concernIssue(c, s.name)
    if (x) out.push(x)
  }
  // A25: the level of interest with a short reason is required; influence and support are optional, but a value that is
  // given must be on its scale, and an influence rating still needs its reason (a reviewer must be able to challenge it)
  if (!/^[1-5]$/.test((s.interest ?? '').trim())) out.push('a level of interest from 1 to 5')
  if (!said(s.interestReason ?? '')) out.push('a short reason for the level of interest')
  const infl = s.influence.trim()
  if (infl && !/^[1-5]$/.test(infl)) out.push('an influence rating from 1 to 5, or leave it empty')
  if (infl && !said(s.reason)) out.push('a reason for the influence rating')
  if (!infl && said(s.reason)) out.push('the influence rating the reason explains, or remove the reason')
  const sup = (s.support ?? '').trim()
  if (sup && !(SUPPORT_LEVELS as readonly string[]).includes(sup)) out.push('a support level from 1 to 4, or leave it empty')
  return out
}
export function checkRegister(r: TeamRecord): PartCheck {
  const issues: string[] = []
  const dupStk = duplicates(r.stakeholders.map((s) => s.id))
  const dupCon = duplicates(idsOf(r, 'CON'))
  if (dupStk.length) issues.push(`Duplicate ID ${dupStk.join(', ')}: each stakeholder ID once.`)
  if (dupCon.length) issues.push(`Duplicate concern ID ${dupCon.join(', ')}: each CON ID once.`)
  const complete = r.stakeholders.filter((s) => stakeholderRowIssues(s).length === 0 && !dupStk.includes(s.id))
  for (const s of r.stakeholders) {
    const miss = stakeholderRowIssues(s)
    if (miss.length) issues.push(`${s.id}: add ${miss.join('; ')}.`)
  }
  const names = r.stakeholders.map((s) => s.name.trim().toLowerCase()).filter(Boolean)
  const dup = names.filter((x, i) => names.indexOf(x) !== i)
  if (dup.length) issues.push(`Each stakeholder once: “${dup[0]}” appears twice.`)
  if (complete.length < MIN_STAKEHOLDERS) issues.unshift(`At least ${MIN_STAKEHOLDERS} complete stakeholders, each with a specific concern and a level of interest with a reason (${complete.length} so far).`)
  const roles = new Set(complete.map((s) => s.role))
  if (complete.length >= MIN_STAKEHOLDERS && roles.size < MIN_ROLE_GROUPS) issues.push(`At least ${MIN_ROLE_GROUPS} role groups (only ${[...roles].map(roleLabel).join(', ')}): a register of customers and users only scores at the bottom of RB-1.2.`)
  if (complete.length && !complete.some((s) => s.approving === 'yes')) issues.push('At least one approving authority: who certifies, qualifies or approves your system for use?')
  if (complete.length >= MIN_STAKEHOLDERS && !complete.some((s) => s.role !== 'user' && s.role !== 'customer')) issues.push('At least one stakeholder who is not a customer or user.')
  const rel = checkRelationships(r)
  issues.push(...rel.issues)
  const concerns = complete.reduce((a, s) => a + s.concerns.length, 0)
  return result(issues, `${complete.length} stakeholders with ${concerns} specific concerns, ${roles.size} role groups, an approving authority, and ${rel.complete} relationships including ${rel.conflicts} conflict${rel.conflicts > 1 ? 's' : ''}.`)
}

/** What a REL row still lacks ('' entries removed): both ends in the register and different, a type, a note. */
export function relRowIssues(x: RelRow, stakeholderIds: Set<string>): string[] {
  const out: string[] = []
  if (!/^STK-\d{3}$/.test(x.from)) out.push('the “from” stakeholder (STK ID)')
  else if (!stakeholderIds.has(x.from)) out.push(`a “from” stakeholder in the register (${x.from} is not)`)
  if (!/^STK-\d{3}$/.test(x.to)) out.push('the “to” stakeholder (STK ID)')
  else if (!stakeholderIds.has(x.to)) out.push(`a “to” stakeholder in the register (${x.to} is not)`)
  if (x.from && x.from === x.to) out.push('two different stakeholders')
  if (!x.type) out.push('the type of relationship')
  if (!said(x.note)) out.push(x.type === 'conflicts-with' ? 'what pulls against what' : 'a note on what the relationship is about')

  return out
}
/** Relationships (Mo1): at least MIN_RELATIONSHIPS complete REL rows, at least MIN_CONFLICTS of them conflicts. */
export function checkRelationships(r: TeamRecord): { issues: string[]; complete: number; conflicts: number } {
  const ids = new Set(r.stakeholders.map((s) => s.id))
  const issues: string[] = []
  const dup = duplicates(r.relationships.map((x) => x.id))
  if (dup.length) issues.push(`Duplicate relationship ID ${dup.join(', ')}: each REL ID once.`)
  for (const x of r.relationships) {
    const miss = relRowIssues(x, ids)
    if (miss.length) issues.push(`${x.id}: add ${miss.join('; ')}.`)
  }
  const complete = r.relationships.filter((x) => relRowIssues(x, ids).length === 0 && !dup.includes(x.id))
  const pairs = complete.map((x) => [x.from, x.to].sort().join('|') + x.type)
  if (pairs.some((p, i) => pairs.indexOf(p) !== i)) issues.push('Two relationships record the same pair and type: each relationship once.')
  const conflicts = complete.filter((x) => x.type === 'conflicts-with').length
  if (complete.length < MIN_RELATIONSHIPS) issues.unshift(`At least ${MIN_RELATIONSHIPS} relationships between stakeholders (REL rows: from, to, type, note), ${complete.length} so far.`)
  if (conflicts < MIN_CONFLICTS) issues.push(`At least ${MIN_CONFLICTS} relationship of type “conflicts with”: the conflict between two stakeholders’ concerns.`)
  return { issues, complete: complete.length, conflicts }
}

// ---------------------------------------------------------------------------------------------- part 5: needs
export type NeedStatus = { assessment: NeedAssessment; reasons: string[]; counts: boolean }
/** One need assessed against the team's register: the structural gates, the record fields (trace, rationale, priority,
 *  concern links), the self-check and the warnings (needQuality.ts). `counts` = it counts toward the minimum. */
export function needStatus(n: NeedRow, r: TeamRecord): NeedStatus {
  const assessment = assessNeed(
    { id: n.id, name: n.name, text: n.text, conditions: n.conditions, rationale: n.rationale, sources: sourcesOf(n) },
    { stakeholders: r.stakeholders.map((s) => ({ id: s.id, name: s.name })), soiNames: [r.proposal.name], systemNames: [r.proposal.name, r.proposal.soi], otherIds: r.needs.filter((x) => x !== n).map((x) => x.id) },
  )
  const team: string[] = []
  if (!n.priority) team.push('Record the priority the stakeholders agree: mandatory, critical, desirable or optional (MITRE’s categories, as defined in the lecture).')
  const cons = concernsOf(n)
  const holder = new Map(r.stakeholders.flatMap((s) => s.concerns.map((c) => [c.id, s.id] as const)))
  if (!cons.length) team.push('Name the concern or concerns the need answers (CON IDs from the register).')
  else {
    const unknown = cons.filter((c) => !holder.has(c))
    if (unknown.length) team.push(`${unknown.join(', ')} ${unknown.length > 1 ? 'are' : 'is'} not in the register.`)
    else {
      const src = sourcesOf(n)
      const foreign = cons.filter((c) => !src.includes(holder.get(c)!))
      if (foreign.length) team.push(`${foreign.map((c) => `${c} belongs to ${holder.get(c)}`).join('; ')}, which is not a source of this need: add that stakeholder as a source or choose its own concern.`)
    }
  }
  const goal = n.goal.trim().toUpperCase()
  const goals = [MISSION_ID, ...r.proposal.goals.map((g) => g.id)]
  if (!goal) team.push(`Trace the need to the mission (${MISSION_ID}) or one of your objectives: give its MGO ID.`)
  else if (!goals.includes(goal)) team.push(`${goal} is not the mission or an objective of your proposal (${goals.join(', ')}).`)
  const base = notCountingReasons(assessment, n.selfCheck, n.justification)
  // gates and record fields first, then the self-check and the warnings
  const firstLater = base.findIndex((x) => x.startsWith('Confirm each') || /warning/.test(x))
  const reasons = firstLater < 0 ? [...base, ...team] : [...base.slice(0, firstLater), ...team, ...base.slice(firstLater)]
  return { assessment, reasons, counts: reasons.length === 0 }
}

export function checkNeedsPart(r: TeamRecord): PartCheck {
  const issues: string[] = []
  const statuses = r.needs.map((n) => ({ n, s: needStatus(n, r) }))
  const counting = statuses.filter((x) => x.s.counts).map((x) => x.n)
  const { needs: MIN_N, needSources: MIN_SRC } = needsMinimum(r.charter)
  for (const { n, s } of statuses) if (!s.counts) issues.push(`${n.id}: ${s.reasons[0]}`)
  const texts = r.needs.map((n) => n.text.trim().toLowerCase()).filter(Boolean)
  if (texts.some((x, i) => texts.indexOf(x) !== i)) issues.push('Two needs have the same statement: each need once.')
  const three = r.charter.threePersonTeam ? ' (three-person team minimum, pending faculty approval)' : ''
  if (counting.length < MIN_N) issues.unshift(`At least ${MIN_N} needs that count${three} (${counting.length} so far): each is a valid need statement, attributed to a registered stakeholder, traced to its concern and to the mission or an objective, has its record fields, is confirmed against the six checks, and has every warning rewritten or justified.`)
  const covered = new Set(counting.flatMap(sourcesOf))
  if (counting.length >= MIN_N && covered.size < MIN_SRC) issues.push(`Trace the needs to at least ${MIN_SRC} different stakeholders${three} (${covered.size} so far).`)
  const authorities = r.stakeholders.filter((s) => s.approving === 'yes').map((s) => s.id)
  if (counting.length >= MIN_N && !authorities.some((a) => covered.has(a))) issues.push('At least one need from an approving authority.')
  return result(issues, `${counting.length} needs count, from ${covered.size} stakeholders: form, subject and traces checked by the tool, the six checks confirmed by your team, every warning rewritten or justified.`)
}

// ---------------------------------------------------------------------------------------------- part 6: AI statement
export function checkAiStatement(r: TeamRecord): PartCheck {
  const n = words(r.aiStatement)
  return result(n >= MIN_AI_WORDS ? [] : [`Write the AI usage statement (at least ${MIN_AI_WORDS} words, ${n} so far): tool, purpose, prompts, what you accepted or rejected and why; or say that no AI tool was used.`], 'AI usage statement recorded.')
}

// ---------------------------------------------------------------------------------------------- export and readiness
export function partsComplete(r: TeamRecord, today = todayISO()): boolean {
  return [checkCharterPart(r.charter), checkProposal(r.proposal, today), checkContextPart(r), checkRegister(r), checkNeedsPart(r), checkAiStatement(r)].every((c) => c.ok)
}
export function checkExported(r: TeamRecord, today = todayISO()): PartCheck {
  if (!partsComplete(r, today)) return result(['Complete the five parts and the AI usage statement first; the export step checks the finished record.'], '')
  const missing = [r.exportedMdAt ? '' : 'the Team Record (.md)', r.exportedJsonAt ? '' : 'the model inputs (.json)'].filter(Boolean)
  if (missing.length) return result([`Export ${missing.join(' and ')} with the buttons at the top of the view.`], '')
  const last = Math.min(r.exportedMdAt!, r.exportedJsonAt!)
  if (r.updatedAt && last < r.updatedAt) return result(['The record changed after the last export: export both files again so they match.'], '')
  const pending = approvalOf(r.proposal, today) !== 'approved'
  return result([], `Both files exported ${todayISO(new Date(last))}${pending ? ', labeled “submitted for approval”: the proposal is not yet approved' : ''}; one member uploads both to the “Week 1 Team Record” assignment on the LMS (Laboratory page, Submission).`)
}

/** Where the record stands for submission. "ready" requires every part, a current export AND the instructor's approval;
 *  a complete, exported record whose proposal is only submitted for approval is "pending-approval", never "ready". */
export type RecordState = 'not-ready' | 'pending-approval' | 'ready'
export function recordState(r: TeamRecord, today = todayISO()): RecordState {
  if (!checkExported(r, today).ok) return 'not-ready'
  return approvalOf(r.proposal, today) === 'approved' ? 'ready' : 'pending-approval'
}
/** The state of the content alone (no export step): what the exported files say about themselves. */
export function contentState(r: TeamRecord, today = todayISO()): RecordState {
  if (!partsComplete(r, today)) return 'not-ready'
  return approvalOf(r.proposal, today) === 'approved' ? 'ready' : 'pending-approval'
}
const STATE_LABEL: Record<RecordState, string> = { 'not-ready': 'not ready: parts still incomplete', 'pending-approval': 'SUBMITTED FOR APPROVAL: complete, but the proposal is not yet approved by the instructor', ready: 'complete and approved' }

const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n+/g, '; ').trim()
const DIRECTION: Record<string, string> = { in: 'into the system', out: 'out of the system', both: 'both ways', '': '' }

export function teamMarkdown(r: TeamRecord, today = todayISO()): string {
  const roles = COURSE_ROLES.map((role) => `| ${role} | ${r.charter.threePersonTeam && role === MERGED_ROLE ? 'merged with Architecture' : cell(r.charter.roles[role] ?? '')} |`)
  const p = r.proposal
  const decision = p.decision === 'approved' ? `approved, ${p.decidedOn}` : p.decision === 'pending' ? `SUBMITTED FOR APPROVAL, not yet approved${p.decidedOn ? ` (submitted ${p.decidedOn})` : ''}; approval is required before the Week 2 submission` : DECISION_LABEL[p.decision]
  const L = [
    `# Week 1 Team Record: ${cell(p.name) || '(enterprise not named)'}`,
    '',
    `Team: ${cell(r.team) || '____'} · Exported from the Team enterprise view, ${today}.`,
    '',
    `**Record status:** ${STATE_LABEL[contentState(r, today)]}.`,
    '',
    '## 1. Team charter',
    '',
    '| Lead role | Member (initials) |',
    '|---|---|',
    ...roles,
    '',
    `Decision rules: ${r.charter.decisionRules.trim()}`,
    '',
    `Communication norms: ${r.charter.norms.trim()}`,
    '',
    'Owned ID prefixes:',
    ...lines(r.charter.prefixes).map((x) => `- ${x}`),
    '',
    '## 2. Enterprise proposal (ENT-001)',
    '',
    `- Name: ${p.name.trim()}`,
    `- Domain: ${p.domain.trim()}`,
    `- Problem statement: ${p.problem.trim()}`,
    `- Mission (${MISSION_ID}): ${p.purpose.trim()}`,
    `- Objectives: ${p.goals.filter((g) => g.text.trim()).map((g) => `${g.id} ${g.text.trim()}`).join('; ') || '(none recorded; every need traces to the mission)'}`,
    `- System of interest: ${p.soi.trim()}`,
    `- Inside the boundary of the system of interest (PRT): ${p.inside.filter((x) => x.name.trim()).map((x) => `${x.id} ${x.name.trim()}`).join('; ')}`,
    `- Why it suits a 14-week project: ${p.why.trim()}`,
    `- Instructor decision: ${decision}`,
    '',
    '## 3. Context',
    '',
    '| ID | External system or actor | Kind | What crosses the boundary | Direction |',
    '|---|---|---|---|---|',
    ...r.context.map((c) => `| ${c.id} | ${cell(c.name)} | ${c.kind} | ${cell(c.crosses)} | ${DIRECTION[c.direction]} |`),
    '',
    '## 4. Stakeholder register',
    '',
    '| ID | Stakeholder | Role | Life-cycle stage | Internal or external | Approving authority | Concerns | Interest | Reason for interest | Influence | Reason | Support |',
    '|---|---|---|---|---|---|---|---|---|---|---|---|',
    ...r.stakeholders.map((s) => `| ${s.id} | ${cell(s.name)} | ${roleLabel(s.role)} | ${s.stage} | ${s.side} | ${s.approving} | ${s.concerns.map((c) => `${c.id}: ${cell(c.text)}`).join('; ')} | ${s.interest ?? ''} | ${cell(s.interestReason ?? '')} | ${s.influence} | ${cell(s.reason)} | ${s.support ?? ''} |`),
    '',
    '### Relationships',
    '',
    '| ID | From | Relationship | To | Note |',
    '|---|---|---|---|---|',
    ...r.relationships.map((x) => `| ${x.id} | ${x.from} | ${relVerb(x.type)} | ${x.to} | ${cell(x.note)} |`),
    '',
    '## 5. Initial stakeholder needs',
    '',
    '| ID | Name | Need statement | Condition | Rationale | Priority | Source (STK) | Answers (CON) | Objective (MGO) | Six checks confirmed | Warnings kept, with justification |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    ...r.needs.map((n) => {
      const s = needStatus(n, r)
      const kept = s.assessment.warnings.length ? `${s.assessment.warnings.map((w) => w.id).join(', ')}: ${cell(n.justification) || '(no justification)'}` : 'none'
      return `| ${n.id} | ${cell(n.name)} | ${cell(n.text)} | ${cell(n.conditions)} | ${cell(n.rationale)} | ${n.priority ? PRIORITY_LABEL[n.priority] : ''} | ${sourcesOf(n).join(', ')} | ${concernsOf(n).join(', ')} | ${n.goal} | ${CRITERION_IDS.every((id) => n.selfCheck[id]) ? 'yes' : 'no'} | ${kept} |`
    }),
    '',
    '## 6. AI usage statement',
    '',
    r.aiStatement.trim() || '_Not written yet: tool, purpose, prompts, what you accepted or rejected and why; tag AI-suggested stakeholders and needs AI-suggested-reviewed._',
    '',
  ]
  return L.join('\n')
}

const NEED_SEEDS = ['requirement def / requirement', 'doc', 'subject', 'stakeholder', 'frame']
const a25Fields = (s: StakeholderRow) => ({
  ...((s.interest ?? '').trim() ? { interest: Number(s.interest) || null } : {}),
  ...((s.interestReason ?? '').trim() ? { interestReason: (s.interestReason ?? '').trim() } : {}),
  ...((s.support ?? '').trim() ? { support: Number(s.support) || null } : {}),
})
export const MODEL_INPUTS_VERSION = 3
/** The model inputs (JSON, version 3: problem, mission and goals, need → goal, REL rows): every item with its ID, its
 *  source and the SysML v2 element it seeds. Versions 1 and 2 still import (importModelInputs). */
export function teamModelInputs(r: TeamRecord, today = todayISO()) {
  return {
    format: 'week1-model-inputs',
    version: MODEL_INPUTS_VERSION,
    team: r.team,
    status: contentState(r, today),
    enterprise: { id: 'ENT-001', name: r.proposal.name.trim(), domain: r.proposal.domain.trim(), problem: r.proposal.problem.trim(), purpose: r.proposal.purpose.trim(), suitability: r.proposal.why.trim(), seeds: ['part def', 'doc'] },
    missionGoals: [
      { id: MISSION_ID, level: 'mission', statement: r.proposal.purpose.trim(), seeds: ['requirement / doc'] },
      ...r.proposal.goals.filter((g) => g.text.trim()).map((g) => ({ id: g.id, level: 'goal', statement: g.text.trim(), seeds: ['requirement / doc'] })),
    ],
    systemOfInterest: { statement: r.proposal.soi.trim(), inside: r.proposal.inside.filter((x) => x.name.trim()).map((x) => ({ id: x.id, name: x.name.trim(), seeds: ['part (usage)'] })), seeds: ['part def', 'part (usage)'] },
    context: r.context.map((c) => ({ id: c.id, name: c.name.trim(), kind: c.kind, crosses: c.crosses.trim(), direction: c.direction, seeds: c.kind === 'actor' ? ['actor', 'item def', 'port def'] : ['part (usage) in a context', 'item def', 'port def'] })),
    // M6 (A25): interest, its reason and support are appended only when recorded, so a record without them exports the
    // same bytes as before (golden test src/project/__golden__) and importers that ignore unknown keys read both
    stakeholders: r.stakeholders.map((s) => ({ id: s.id, name: s.name.trim(), role: s.role, stage: s.stage, side: s.side, approvingAuthority: s.approving === 'yes', influence: Number(s.influence) || null, influenceReason: s.reason.trim(), concerns: s.concerns.map((c) => c.id), seeds: ['part def', 'stakeholder'], ...a25Fields(s) })),
    concerns: r.stakeholders.flatMap((s) => s.concerns.map((c) => ({ id: c.id, stakeholders: [s.id], text: c.text.trim(), seeds: ['concern'] }))),
    relationships: r.relationships.map((x) => ({ id: x.id, from: x.from, to: x.to, type: x.type, note: x.note.trim(), seeds: ['connection or dependency between stakeholder parts (course working mapping)'] })),
    needs: r.needs.map((n) => {
      const s = needStatus(n, r)
      return { id: n.id, name: n.name.trim(), statement: n.text.trim(), condition: n.conditions.trim(), rationale: n.rationale.trim(), priority: n.priority, sources: sourcesOf(n), concerns: concernsOf(n), goal: n.goal, selfCheck: CRITERION_IDS.filter((id) => n.selfCheck[id]), warnings: s.assessment.warnings.map((w) => w.id), justification: n.justification.trim(), counts: s.counts, seeds: NEED_SEEDS }
    }),
    charter: { threePersonTeam: r.charter.threePersonTeam, roles: r.charter.roles, decisionRules: r.charter.decisionRules.trim(), norms: r.charter.norms.trim(), prefixes: lines(r.charter.prefixes) },
    decision: { status: r.proposal.decision, date: r.proposal.decidedOn },
    aiStatement: r.aiStatement.trim(),
  }
}

// ---------------------------------------------------------------------------------------------- import
const kindOf = (x: unknown) => (x === null ? 'null' : Array.isArray(x) ? 'a list' : typeof x === 'object' ? 'an object' : typeof x === 'string' ? 'text' : typeof x)
const ID_RE: Record<IdPrefix, RegExp> = { EXT: /^EXT-\d{3}$/, STK: /^STK-\d{3}$/, CON: /^CON-\d{3}$/, NEED: /^NEED-\d{3}$/, PRT: /^PRT-\d{3}$/, MGO: /^MGO-\d{3}$/, REL: /^REL-\d{3}$/ }

/** Reads a model-inputs JSON file back into a Team Record (a teammate's export, version 1, 2 or 3). Every problem is
 *  returned as a message the student can act on; nothing is thrown. */
export function importModelInputs(text: string): TeamRecord | { error: string } {
  try {
    return importUnsafe(text)
  } catch (e) {
    return { error: `This file could not be read as Week 1 model inputs (${e instanceof Error ? e.message : String(e)}).` }
  }
}

function importUnsafe(text: string): TeamRecord | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON.' }
  }
  if (!isObj(d) || d.format !== 'week1-model-inputs' || ![1, 2, 3].includes(d.version as number)) return { error: 'This is not a Week 1 model-inputs file (format “week1-model-inputs”, version 1, 2 or 3).' }
  // shapes: every list must be a list of objects (or of text, where text is expected)
  const listOf = (path: string, x: unknown, of: 'object' | 'text' | 'either'): string | undefined => {
    if (x === undefined) return undefined
    if (!Array.isArray(x)) return `“${path}” must be a list; this file has ${kindOf(x)}.`
    const bad = x.findIndex((y) => (of === 'object' ? !isObj(y) : of === 'text' ? typeof y !== 'string' : !isObj(y) && typeof y !== 'string'))
    return bad >= 0 ? `“${path}” item ${bad + 1} is ${kindOf(x[bad])}, not ${of === 'object' ? 'an object' : of === 'text' ? 'text' : 'an object or text'}.` : undefined
  }
  const soi = isObj(d.systemOfInterest) ? d.systemOfInterest : {}
  const charter = isObj(d.charter) ? d.charter : {}
  const needsIn = Array.isArray(d.needs) ? d.needs : []
  const shapeErrors = [
    listOf('context', d.context, 'object'),
    listOf('stakeholders', d.stakeholders, 'object'),
    listOf('concerns', d.concerns, 'object'),
    listOf('needs', d.needs, 'object'),
    listOf('conflicts', d.conflicts, 'object'),
    listOf('relationships', d.relationships, 'object'),
    listOf('missionGoals', d.missionGoals, 'object'),
    listOf('systemOfInterest.inside', soi.inside, 'either'),
    listOf('charter.prefixes', charter.prefixes, 'text'),
    ...needsIn.flatMap((n, i) => (isObj(n) ? [listOf(`needs item ${i + 1} sources`, n.sources, 'text'), listOf(`needs item ${i + 1} concerns`, n.concerns, 'text')] : [])),
  ].filter(Boolean)
  if (shapeErrors.length) return { error: shapeErrors[0]! }

  const ent = isObj(d.enterprise) ? d.enterprise : {}
  const dec = isObj(d.decision) ? d.decision : {}
  const stakeholdersIn = objs(d.stakeholders)
  const concernsIn = objs(d.concerns)
  const stkIds = new Set(stakeholdersIn.map((x) => str(x.id)))
  // concerns attach to their (first) stakeholder; version 1 used `stakeholder`, version 2 `stakeholders`
  const concernOwner = (c: Record<string, unknown>) => (Array.isArray(c.stakeholders) ? str(c.stakeholders[0]) : str(c.stakeholder))
  const orphan = concernsIn.find((c) => !stkIds.has(concernOwner(c)))
  if (orphan) return { error: `${str(orphan.id) || 'A concern'} names ${concernOwner(orphan) || 'no stakeholder'}, which is not a stakeholder in the file.` }
  const insideIn = Array.isArray(soi.inside) ? soi.inside : []
  // version 3 carries the mission and goals; earlier versions only the mission (as the purpose)
  const mgo = objs(d.missionGoals)
  const mission = mgo.find((x) => x.level === 'mission')
  // version 3 carries REL rows; earlier versions one free-text conflict, read as a conflict row
  const relationships = Array.isArray(d.relationships) ? objs(d.relationships) : conflictToRel(str(objs(d.conflicts)[0]?.text))
  const rec = normalizeTeam({
    team: str(d.team),
    proposal: {
      name: str(ent.name),
      domain: str(ent.domain),
      problem: str(ent.problem),
      purpose: mission ? str(mission.statement) : str(ent.purpose),
      goals: mgo.filter((x) => x.level === 'goal').map((x) => ({ id: str(x.id), text: str(x.statement) })),
      why: str(ent.suitability),
      soi: str(soi.statement),
      inside: insideIn.map((x, i) => (typeof x === 'string' ? { id: `PRT-${pad(i + 1)}`, name: x } : { id: str((x as Record<string, unknown>).id), name: str((x as Record<string, unknown>).name) })),
      decision: str(dec.status),
      decidedOn: str(dec.date),
    },
    charter: { threePersonTeam: charter.threePersonTeam === true, roles: isObj(charter.roles) ? charter.roles : {}, decisionRules: str(charter.decisionRules), norms: str(charter.norms), prefixes: (Array.isArray(charter.prefixes) ? charter.prefixes : []).map(str).join('\n') },
    context: objs(d.context),
    stakeholders: stakeholdersIn.map((x) => ({
      id: str(x.id),
      name: str(x.name),
      role: str(x.role),
      stage: str(x.stage),
      side: str(x.side),
      approving: x.approvingAuthority === true ? 'yes' : x.approvingAuthority === false ? 'no' : '',
      concerns: concernsIn.filter((c) => concernOwner(c) === str(x.id)).map((c) => ({ id: str(c.id), text: str(c.text) })),
      influence: x.influence ? String(x.influence) : '',
      reason: str(x.influenceReason),
      interest: x.interest ? String(x.interest) : '',
      interestReason: str(x.interestReason),
      support: x.support ? String(x.support) : '',
    })),
    relationships,
    needs: objs(d.needs).map((x) => ({
      id: str(x.id),
      name: str(x.name),
      text: str(x.statement),
      conditions: str(x.condition),
      rationale: str(x.rationale),
      sources: (Array.isArray(x.sources) ? x.sources : []).map(str).join(', '),
      concerns: (Array.isArray(x.concerns) ? x.concerns : []).map(str).join(', '),
      goal: str(x.goal),
      priority: str(x.priority),
      selfCheck: Object.fromEntries((Array.isArray(x.selfCheck) ? x.selfCheck : []).map((id) => [str(id), true])) as Partial<Record<CriterionId, boolean>>,
      justification: str(x.justification),
    })),
    aiStatement: str(d.aiStatement),
  })
  // IDs: the right form for each prefix, and each ID once
  for (const p of Object.keys(ID_RE) as IdPrefix[]) {
    const ids = idsOf(rec, p)
    const bad = ids.filter((id) => !ID_RE[p].test(id))
    if (bad.length) return { error: `Unexpected ${p} IDs in the file: ${bad.slice(0, 3).map((x) => x || '(empty)').join(', ')}. IDs look like ${p}-001.` }
    const dup = duplicates(ids)
    if (dup.length) return { error: `Duplicate ID ${dup[0]} (${ids.filter((x) => x === dup[0]).length} times) in the file: each ID once. Fix the file, or ask the teammate who exported it to export again.` }
  }
  return rec
}
