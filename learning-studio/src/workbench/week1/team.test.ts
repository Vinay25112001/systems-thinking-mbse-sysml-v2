// The Team enterprise checks and exports, tested in both directions: the complete fixture passes every check, and each
// realistic mistake is rejected with a message that names the problem. Revised for the review of commit 0f3ebcb
// (_source_cache/review/week01_rebuild_review.md): F01 needs, F02 readiness, F03 concerns, F04 import, F05 charter and
// proposal edges, F11 export data. Sign-off review 2026-10-19: M1 need form, M2 PRT, M3 problem/mission/goals and the
// need → goal trace, Mo1 REL rows, Mo4 three-person minimum, JSON version 3 with versions 1–2 still loading. The
// need-quality examples themselves are in needQuality.test.ts.
import { describe, expect, it } from 'vitest'
import { TEAM_FIXTURE } from './teamFixture'
import {
  approvalOf, checkAiStatement, checkRelationships, MODEL_INPUTS_VERSION, checkCharterPart, checkContextPart, checkExported, checkNeedsPart, checkProposal, checkRegister, contentState, importModelInputs, isCalendarDate, needStatus, nextId,
  normalizeTeam, partsComplete, recordState, sentenceCount, teamMarkdown, teamModelInputs, EMPTY_NEED_ROW, type NeedRow, type TeamRecord,
} from './team'
import { assessAeroLinkNeed, CANDIDATES, CRITIQUE_KEY, draftBlockers, isGenericConcernW1, isSpecificConcern, REFERENCE_REGISTER, registerRowIssues, scoreCritiqueW1, W1_CRITIQUE } from './stakeholders'
import { diagnose } from '../../activities/week03/needs'
import { STAKEHOLDERS } from '../../content/lectures/week01/aerolinkCase'
import { CRITERION_IDS } from './needQuality'

const F = TEAM_FIXTURE
const TODAY = '2026-10-18'
const withF = (p: Partial<TeamRecord>): TeamRecord => ({ ...F, ...p })
const needAt = (i: number, p: Partial<NeedRow>) => withF({ needs: F.needs.map((n, j) => (j === i ? { ...n, ...p } : n)) })
const ALL = Object.fromEntries(CRITERION_IDS.map((id) => [id, true]))

describe('Team Record checks accept good input', () => {
  it('the complete fixture passes every part', () => {
    for (const c of [checkCharterPart(F.charter), checkProposal(F.proposal, TODAY), checkContextPart(F), checkRegister(F), checkNeedsPart(F), checkAiStatement(F)]) expect(c.issues).toEqual([])
    expect(partsComplete(F, TODAY)).toBe(true)
  })
  it('a three-person team needs no AI & Data Management lead', () => {
    const roles = { ...F.charter.roles, 'AI & Data Management': '' }
    expect(checkCharterPart({ ...F.charter, threePersonTeam: true, roles, prefixes: 'JS: STK, CON, NEED\nAK: ENT, PRT, EXT, REL, INFO\nTL: VER' }).issues).toEqual([])
  })
  it('F05: prefixes are read case-insensitively', () => {
    expect(checkCharterPart({ ...F.charter, prefixes: 'js: stk, con, need\nak: ent, prt, ext, rel\nrm: info, ai\ntl: ver' }).issues).toEqual([])
  })
  it('F05: a system of interest with abbreviations is one sentence', () => {
    expect(sentenceCount('The U.S. Gulf Coast network of food banks, e.g. pantries and depots, run by Dr. Lee from 9 a.m. daily.')).toBe(1)
    expect(checkProposal({ ...F.proposal, soi: 'The U.S. county network that moves donated food, e.g. produce and meat, to partner pantries.' }, TODAY).issues).toEqual([])
  })
  it('F05: a purpose may contrast the team’s enterprise with AeroLink', () => {
    expect(checkProposal({ ...F.proposal, purpose: 'Unlike AeroLink, we move donated food from donors to partner pantries across the county every week.' }, TODAY).issues).toEqual([])
  })
  it('F02: a proposal submitted for approval passes part 2, labeled, with or without a past date', () => {
    for (const decidedOn of ['', '2026-10-15']) {
      const c = checkProposal({ ...F.proposal, decision: 'pending', decidedOn }, TODAY)
      expect(c.issues, decidedOn).toEqual([])
      expect(c.detail).toMatch(/submitted for approval: not yet approved/)
    }
  })
})

describe('Team Record checks reject bad input', () => {
  it('charter: a missing lead, thin rules, a member without prefixes', () => {
    expect(checkCharterPart({ ...F.charter, roles: { ...F.charter.roles, Architecture: '' } }).issues[0]).toMatch(/Architecture/)
    expect(checkCharterPart({ ...F.charter, decisionRules: '' }).ok).toBe(false)
    expect(checkCharterPart({ ...F.charter, decisionRules: 'n/a' }).ok).toBe(false)
    // gate sweep 2026-10-19: a short rule is a rule
    expect(checkCharterPart({ ...F.charter, decisionRules: 'Majority vote', norms: 'Discord daily' }).ok).toBe(true)
    expect(checkCharterPart({ ...F.charter, prefixes: 'JS: STK, CON, NEED\nAK: ENT, PRT, EXT, REL\nRM: INFO, AI' }).issues.join(' ')).toMatch(/TL has none/)
    expect(checkCharterPart({ ...F.charter, prefixes: 'we will sort this out later' }).ok).toBe(false)
  })
  it('F05: one person holding every role, nonsense prefixes, unowned or doubly owned Week 1 prefixes', () => {
    const one = { 'Requirements & Compliance': 'JS', Architecture: 'JS', 'AI & Data Management': 'JS', 'Verification & Validation': 'JS' }
    expect(checkCharterPart({ ...F.charter, roles: one, prefixes: 'JS: XX' }).issues.join(' ')).toMatch(/different member/)
    expect(checkCharterPart({ ...F.charter, prefixes: 'JS: STK, CON, NEED, ZZ\nAK: ENT, PRT, EXT, REL\nRM: INFO\nTL: VER' }).issues.join(' ')).toMatch(/ZZ is not a prefix/)
    expect(checkCharterPart({ ...F.charter, prefixes: 'JS: STK, CON\nAK: ENT, PRT, EXT, REL\nRM: INFO\nTL: VER' }).issues.join(' ')).toMatch(/Nobody owns NEED/)
    expect(checkCharterPart({ ...F.charter, prefixes: 'JS: STK, CON, NEED\nAK: ENT, PRT, EXT, REL, STK\nRM: INFO\nTL: VER' }).issues.join(' ')).toMatch(/STK is owned by JS and AK/)
    // the lecture's charter: PRT and REL are Week 1 prefixes too (Architecture usually holds them)
    expect(checkCharterPart({ ...F.charter, prefixes: 'JS: STK, CON, NEED\nAK: ENT, EXT\nRM: INFO\nTL: VER' }).issues.join(' ')).toMatch(/Nobody owns PRT.*Nobody owns REL/)
  })
  it('proposal: AeroLink in the name, domain, system of interest or inside elements; two sentences; too few inside elements; a thin case', () => {
    expect(checkProposal({ ...F.proposal, name: 'AeroLink Vertiport Network' }, TODAY).issues.join(' ')).toMatch(/AeroLink is the instructor’s worked example/)
    expect(checkProposal({ ...F.proposal, domain: 'AeroLink-style air taxis' }, TODAY).ok).toBe(false)
    expect(checkProposal({ ...F.proposal, soi: 'Aero-Link air taxi service for the city and its riders.' }, TODAY).ok).toBe(false)
    expect(checkProposal({ ...F.proposal, inside: [...F.proposal.inside, { id: 'PRT-005', name: 'AeroLink fleet' }] }, TODAY).ok).toBe(false)
    expect(checkProposal({ ...F.proposal, soi: 'The service moves food. It also stores food for the county pantries.' }, TODAY).issues.join(' ')).toMatch(/single sentence/)
    expect(checkProposal({ ...F.proposal, inside: F.proposal.inside.slice(0, 2) }, TODAY).issues.join(' ')).toMatch(/at least 3 elements \(PRT\)/)
    expect(checkProposal({ ...F.proposal, why: 'It is interesting and has many parts.' }, TODAY).issues.join(' ')).toMatch(/at least 40 words/)
  })
  it('F02: no decision, “revise”, an approval with no date, a non-date, an impossible date, a future date', () => {
    expect(checkProposal({ ...F.proposal, decision: '' }, TODAY).ok).toBe(false)
    expect(checkProposal({ ...F.proposal, decision: 'revise', decidedOn: '2026-10-15' }, TODAY).issues.join(' ')).toMatch(/asked for a revision/)
    expect(checkProposal({ ...F.proposal, decision: 'approved', decidedOn: '' }, TODAY).issues.join(' ')).toMatch(/date of the instructor’s approval/)
    expect(checkProposal({ ...F.proposal, decision: 'approved', decidedOn: 'last week' }, TODAY).issues.join(' ')).toMatch(/YYYY-MM-DD/)
    expect(checkProposal({ ...F.proposal, decision: 'approved', decidedOn: '2099-99-99' }, TODAY).issues.join(' ')).toMatch(/not a date/)
    expect(checkProposal({ ...F.proposal, decision: 'approved', decidedOn: '2026-02-30' }, TODAY).ok).toBe(false)
    expect(checkProposal({ ...F.proposal, decision: 'approved', decidedOn: '2026-10-19' }, TODAY).issues.join(' ')).toMatch(/in the future/)
    expect(isCalendarDate('2026-10-16')).toBe(true)
  })
  it('context: five items, an item without a direction, a duplicate name, a duplicate ID, the system itself', () => {
    expect(checkContextPart(withF({ context: F.context.slice(0, 5) })).issues[0]).toMatch(/At least 6/)
    expect(checkContextPart(withF({ context: F.context.map((c, i) => (i === 0 ? { ...c, direction: '' } : c)) })).ok).toBe(false)
    expect(checkContextPart(withF({ context: [...F.context, { ...F.context[0], id: 'EXT-007' }] })).issues.join(' ')).toMatch(/appears twice/)
    expect(checkContextPart(withF({ context: [...F.context.slice(0, 5), { ...F.context[5], id: 'EXT-001' }] })).issues.join(' ')).toMatch(/Duplicate ID EXT-001/)
    expect(checkContextPart(withF({ context: [...F.context, { id: 'EXT-007', name: F.proposal.name, kind: 'system', crosses: 'food', direction: 'out' }] })).issues.join(' ')).toMatch(/not part of its own context/)
  })
  it('register: seven stakeholders, no approving authority, customers and users only, no conflict, an unknown ID, a bad rating, no reason', () => {
    expect(checkRegister(withF({ stakeholders: F.stakeholders.slice(0, 7) })).issues[0]).toMatch(/At least 8/)
    expect(checkRegister(withF({ stakeholders: F.stakeholders.map((s) => ({ ...s, approving: 'no' as const })) })).issues.join(' ')).toMatch(/approving authority/)
    expect(checkRegister(withF({ stakeholders: F.stakeholders.map((s, i) => ({ ...s, role: i % 2 ? 'user' : 'customer', approving: i === 0 ? ('yes' as const) : ('no' as const) })) })).issues.join(' ')).toMatch(/role groups/)
    expect(checkRegister(withF({ relationships: [] })).issues.join(' ')).toMatch(/At least 3 relationships.*conflicts with/)
    expect(checkRegister(withF({ relationships: F.relationships.map((x, i) => (i === 0 ? { ...x, to: 'STK-099' } : x)) })).issues.join(' ')).toMatch(/STK-099 is not/)
    expect(checkRegister(withF({ stakeholders: F.stakeholders.map((s, i) => (i === 1 ? { ...s, influence: '7' } : s)) })).ok).toBe(false)
    expect(checkRegister(withF({ stakeholders: F.stakeholders.map((s, i) => (i === 1 ? { ...s, reason: '' } : s)) })).ok).toBe(false)
  })
  it('F04: duplicate stakeholder IDs and duplicate concern IDs in the register', () => {
    expect(checkRegister(withF({ stakeholders: F.stakeholders.map((s) => ({ ...s, id: 'STK-001' })) })).issues.join(' ')).toMatch(/Duplicate ID STK-001/)
    expect(checkRegister(withF({ stakeholders: F.stakeholders.map((s, i) => (i === 1 ? { ...s, concerns: [{ ...s.concerns[0], id: 'CON-001' }] } : s)) })).issues.join(' ')).toMatch(/Duplicate concern ID CON-001/)
  })
})

describe('M3: problem statement, mission (MGO-001) and goals in Part 2; every need traces to the mission or a goal', () => {
  it('good: the fixture’s problem, mission and four goals pass; goals are optional (a need may trace to the mission)', () => {
    expect(checkProposal(F.proposal, TODAY).issues).toEqual([])
    expect(checkProposal({ ...F.proposal, goals: [] }, TODAY).issues).toEqual([])
    expect(checkNeedsPart(needAt(0, { goal: 'MGO-001' })).issues).toEqual([])
    expect(checkNeedsPart(needAt(0, { goal: 'mgo-002' })).issues).toEqual([])
  })
  it('bad: no problem statement, a two-sentence mission, a thin goal, goal IDs that clash with the mission or repeat', () => {
    expect(checkProposal({ ...F.proposal, problem: '' }, TODAY).issues.join(' ')).toMatch(/Problem statement: one sentence/)
    expect(checkProposal({ ...F.proposal, purpose: 'We move food to pantries every week. We also store it safely.' }, TODAY).issues.join(' ')).toMatch(/Mission \(MGO-001\): a single sentence/)
    expect(checkProposal({ ...F.proposal, goals: [{ id: 'MGO-002', text: '' }] }, TODAY).issues.join(' ')).toMatch(/MGO-002: state the objective/)
    // gate sweep 2026-10-19: a three-word goal and a short one-sentence mission are accepted; two words are not a sentence
    expect(checkProposal({ ...F.proposal, goals: [{ id: 'MGO-002', text: 'Cut food waste' }] }, TODAY).issues).toEqual([])
    expect(checkProposal({ ...F.proposal, purpose: 'Feed every family weekly.' }, TODAY).issues).toEqual([])
    expect(checkProposal({ ...F.proposal, purpose: 'Feed families.' }, TODAY).issues.join(' ')).toMatch(/Mission \(MGO-001\): one sentence/)
    expect(checkProposal({ ...F.proposal, goals: [{ id: 'MGO-001', text: 'Keep pantries stocked every week' }] }, TODAY).issues.join(' ')).toMatch(/run from MGO-002/)
    expect(checkProposal({ ...F.proposal, goals: [...F.proposal.goals, { ...F.proposal.goals[0] }] }, TODAY).issues.join(' ')).toMatch(/Duplicate objective ID MGO-002/)
  })
  it('bad: a need with no goal, or a goal that is not in Part 2, does not count', () => {
    expect(needStatus({ ...F.needs[0], goal: '' }, F).reasons.join(' ')).toMatch(/Trace the need to the mission \(MGO-001\)/)
    expect(needStatus({ ...F.needs[0], goal: 'MGO-009' }, F).reasons.join(' ')).toMatch(/MGO-009 is not the mission or an objective/)
    expect(checkNeedsPart(withF({ proposal: { ...F.proposal, goals: [] } })).ok).toBe(false)
  })
})

describe('Mo1: relationships are REL rows (from, to, type, note): at least 3, at least 1 conflict', () => {
  it('good: the fixture’s three rows with one conflict', () => {
    expect(checkRelationships(F)).toEqual({ issues: [], complete: 3, conflicts: 1 })
  })
  it('bad: two rows, no conflict, an unknown or repeated stakeholder, no type, no note, a duplicate ID or pair', () => {
    expect(checkRelationships(withF({ relationships: F.relationships.slice(0, 2) })).issues[0]).toMatch(/At least 3 relationships/)
    expect(checkRelationships(withF({ relationships: F.relationships.map((x) => ({ ...x, type: 'coordinates-with' as const })) })).issues.join(' ')).toMatch(/conflicts with/)
    const at0 = (p: Partial<TeamRecord['relationships'][number]>) => withF({ relationships: F.relationships.map((x, i) => (i === 0 ? { ...x, ...p } : x)) })
    expect(checkRelationships(at0({ from: 'STK-042' })).issues.join(' ')).toMatch(/STK-042 is not/)
    expect(checkRelationships(at0({ to: 'STK-007' })).issues.join(' ')).toMatch(/two different stakeholders/)
    expect(checkRelationships(at0({ type: '' })).issues.join(' ')).toMatch(/type of relationship/)
    expect(checkRelationships(at0({ note: '' })).issues.join(' ')).toMatch(/what pulls against what/)
    // gate sweep 2026-10-19: a short note is a note
    expect(checkRelationships(at0({ note: 'Noise vs. schedule' })).issues).toEqual([])
    expect(checkRelationships(withF({ relationships: [...F.relationships, { ...F.relationships[1] }] })).issues.join(' ')).toMatch(/Duplicate relationship ID REL-002/)
    expect(checkRelationships(withF({ relationships: [...F.relationships, { ...F.relationships[1], id: 'REL-004' }] })).issues.join(' ')).toMatch(/same pair and type/)
  })
  it('a stored record of the first shapes, with one free-text conflict, loads it as a conflict row', () => {
    const { relationships: _drop, ...rest } = F
    void _drop
    const old = normalizeTeam({ ...rest, conflict: 'STK-007 neighbors want no loading before 6 a.m., while STK-004 drivers need early starts.' })
    expect(old.relationships).toEqual([{ id: 'REL-001', from: 'STK-007', to: 'STK-004', type: 'conflicts-with', note: 'STK-007 neighbors want no loading before 6 a.m., while STK-004 drivers need early starts.' }])
  })
})

describe('Mo4: a three-person team uses the reduced needs minimum (6 needs from 4 stakeholders, pending faculty approval)', () => {
  const three = (needs: NeedRow[]) => withF({ charter: { ...F.charter, threePersonTeam: true }, needs })
  it('six counting needs from four stakeholders complete part 5 for a three-person team, not for a team of four', () => {
    const six = [F.needs[0], F.needs[1], F.needs[2], F.needs[3], F.needs[4], F.needs[5]]
    expect(checkNeedsPart(three(six)).issues).toEqual([])
    expect(checkNeedsPart(withF({ needs: six })).issues[0]).toMatch(/At least 8 needs/)
  })
  it('five needs, or six from three stakeholders, do not', () => {
    expect(checkNeedsPart(three(F.needs.slice(0, 5))).issues[0]).toMatch(/At least 6 needs that count \(three-person team minimum/)
    const fromThree = [0, 1, 2, 3, 4, 5].map((i) => ({ ...F.needs[i % 3], id: `NEED-00${i + 1}`, text: `${F.needs[i % 3].text.replace(/\.$/, '')} in case ${i + 1}.` }))
    expect(checkNeedsPart(three(fromThree)).issues.join(' ')).toMatch(/at least 4 different stakeholders/)
  })
})

describe('F03: the concern check matches what L5 promises', () => {
  const GENERIC = [
    'They are concerned about overall safety and costs.',
    'Residents are unhappy about noise and safety.',
    'Insurers want a safe and reliable service in general.',
    'Investors worry about financial performance and returns.',
    'They care a great deal about safety and cost.',
    'Safety and cost matter most to them.',
    'Insurers care a lot about risk, safety and cost.',
  ]
  it('generic concerns, and concerns with no concrete detail, are rejected', () => {
    for (const g of GENERIC) expect(isSpecificConcern(g), g).toBe(false)
    expect(isGenericConcernW1('Insurers want a really good, safe service.', 'Insurers')).toBe(true)
  })
  it('a register of eight generic concerns does not pass part 4', () => {
    const r = withF({ stakeholders: F.stakeholders.map((s, i) => ({ ...s, concerns: [{ ...s.concerns[0], text: GENERIC[i % GENERIC.length] }] })) })
    expect(checkRegister(r).ok).toBe(false)
    expect(checkRegister(r).issues[0]).toMatch(/At least 8 complete stakeholders, each with a specific concern and a level of interest with a reason \(0 so far\)/)
  })
  it('specific concerns are accepted: the fixture, the AeroLink reference rows and a new example', () => {
    for (const s of F.stakeholders) for (const c of s.concerns) expect(isSpecificConcern(c.text, s.name), c.text).toBe(true)
    for (const t of [
      'aircraft and operations stay within approved safety limits at all times, including in adverse weather',
      'take-off and landing noise near homes, how often it occurs and at what hours',
      'charging and turnaround, not demand, limit how many flights a pad can handle',
      'workload, duty time and how far they can trust automated decision aids',
      'schedule pressure leads to aircraft being released without a clear condition picture',
      'simultaneous high-power charging exceeding the agreed connection capacity at a vertiport',
      'Residents within sight of the pad are woken by departures before 7 a.m.',
      'No record of how often flights exceed weather limits, so premiums rest on guesses.',
    ])
      expect(isSpecificConcern(t), t).toBe(true)
  })
  it('a register row in mission 3 needs a listed stakeholder, a specific concern, a 1–5 rating and a reason', () => {
    const good = { stk: 'STK-012', concern: 'No record of how often flights exceed weather limits, so premiums rest on guesses.', influence: '4', reason: 'premiums constrain operations' }
    expect(registerRowIssues(good)).toEqual([])
    expect(registerRowIssues({ ...good, stk: 'STK-002' })).toHaveLength(1)
    expect(registerRowIssues({ ...good, concern: 'They want safety.' })[0]).toMatch(/generic/)
    expect(registerRowIssues({ ...good, concern: '' })[0]).toMatch(/Write the concern/)
    // gate sweep 2026-10-19: a specific concern in four words counts; specificity, not length, is the gate
    expect(registerRowIssues({ ...good, concern: 'Claims after 10 pm' })).toEqual([])
    expect(registerRowIssues({ ...good, concern: 'Insurers care a lot about risk, safety and cost.' }).join(' ')).toMatch(/generic/)
    expect(registerRowIssues({ ...good, concern: 'Insurers worry about financial performance and returns.' }).join(' ')).toMatch(/generic/)
    expect(registerRowIssues({ ...good, influence: '6' })).toHaveLength(1)
    expect(registerRowIssues({ ...good, reason: '' })).toHaveLength(1)
    expect(registerRowIssues({ ...good, reason: 'Sets premiums' })).toEqual([])

  })
})

describe('F01: needs count only when the gates pass, the record fields are complete, the six checks are confirmed and every warning is handled', () => {
  it('eight copies of “Stakeholder n need the network to give good service when possible” do not complete part 5', () => {
    const r = withF({ needs: F.stakeholders.map((s, i) => ({ ...EMPTY_NEED_ROW(`NEED-00${i + 1}`), name: 'n', text: `${s.name} need the network to give good service when possible.`, rationale: 'they told us so in the workshop', sources: s.id, concerns: s.concerns[0].id, goal: 'MGO-001', priority: 'critical', selfCheck: { ...ALL } })) })
    const c = checkNeedsPart(r)
    expect(c.ok).toBe(false)
    expect(c.issues[0]).toMatch(/At least 8 needs that count \(0 so far\)/)
    expect(c.issues.join(' ')).toMatch(/warning/)
  })
  it('the team’s own enterprise as the subject, a subject outside the register, a missing verb, the outcome form', () => {
    expect(needStatus({ ...F.needs[3], text: 'Riverside Food Bank Network needs the service to find more volunteers at every shift.' }, F).counts).toBe(false)
    expect(needStatus({ ...F.needs[0], text: 'Shoppers need the network to keep fresh produce until closing time.' }, F).reasons[0]).toMatch(/not a stakeholder in the register/)
    // A21: the outcome form is a valid need: it passes the gates, with advice only (pre-A21 it was rejected, M1)
    const outcome = needStatus({ ...F.needs[0], text: 'Families using partner pantries need fresh produce available on the shelves until closing time.' }, F)
    expect(outcome.assessment.gates.filter((g) => !g.ok && g.id !== 'unique')).toEqual([])
    expect(outcome.assessment.advice.map((a) => a.id)).toEqual(['form'])
    expect(outcome.reasons.join(' ')).not.toMatch(/recommended form|need form/)
    // a solution as the thing needed is a real defect
    expect(needStatus({ ...F.needs[0], text: 'Families using partner pantries need a mobile app before closing time.' }, F).assessment.gates.find((g) => g.id === 'solution')!.ok).toBe(false)
    expect(checkNeedsPart(needAt(0, { text: 'The pantry shall keep fresh produce until closing time.' })).ok).toBe(false)
  })
  it('a solution is a warning: it counts only once justified as a constraint', () => {
    const solution = { text: 'Warehouse staff need the network to give them temperature sensors with a mobile app, at any hour.' }
    expect(checkNeedsPart(needAt(4, solution)).issues.join(' ')).toMatch(/NEED-005/)
    expect(checkNeedsPart(needAt(4, { ...solution, justification: 'the health department permit requires logged sensor readings' })).ok).toBe(true)
  })
  it('F11: priority and concern links are required; a concern must exist and belong to a source stakeholder', () => {
    expect(needStatus({ ...F.needs[0], priority: '' }, F).reasons.join(' ')).toMatch(/priority/)
    expect(needStatus({ ...F.needs[0], concerns: '' }, F).reasons.join(' ')).toMatch(/concern/)
    expect(needStatus({ ...F.needs[0], concerns: 'CON-099' }, F).reasons.join(' ')).toMatch(/CON-099 is not in the register/)
    expect(needStatus({ ...F.needs[0], concerns: 'CON-002' }, F).reasons.join(' ')).toMatch(/CON-002 belongs to STK-002/)
  })
  it('the self-check is required, and editing what was confirmed must be confirmed again (an empty self-check does not count)', () => {
    expect(needStatus({ ...F.needs[0], selfCheck: {} }, F).reasons.join(' ')).toMatch(/self-check/)
    expect(needStatus({ ...F.needs[0], selfCheck: { ...ALL, rationale: false } }, F).counts).toBe(false)
  })
  it('untraced, unknown source, too few stakeholders, no approving authority, duplicate need IDs', () => {
    expect(checkNeedsPart(withF({ needs: F.needs.slice(0, 7) })).issues[0]).toMatch(/At least 8/)
    expect(checkNeedsPart(needAt(2, { sources: 'STK-042' })).issues.join(' ')).toMatch(/not in the register/)
    expect(checkNeedsPart(needAt(2, { sources: '' })).ok).toBe(false)
    expect(checkNeedsPart(needAt(1, { id: 'NEED-001' })).issues.join(' ')).toMatch(/used by another need/)
  })
})

describe('F02: readiness has three states and needs the AI usage statement', () => {
  const exported = { exportedMdAt: 20, exportedJsonAt: 21, updatedAt: 10 }
  it('ready = complete, exported, approved with a valid past date', () => {
    expect(recordState(withF(exported), TODAY)).toBe('ready')
    expect(approvalOf(F.proposal, TODAY)).toBe('approved')
  })
  it('a proposal submitted for approval is labeled, never ready', () => {
    const pending = withF({ ...exported, proposal: { ...F.proposal, decision: 'pending', decidedOn: '' } })
    expect(recordState(pending, TODAY)).toBe('pending-approval')
    expect(checkExported(pending, TODAY).detail).toMatch(/submitted for approval/)
    expect(teamMarkdown(pending, TODAY)).toMatch(/SUBMITTED FOR APPROVAL/)
    expect(teamModelInputs(pending, TODAY).status).toBe('pending-approval')
  })
  it('an approval dated in the future or with a nonsense date is not approval', () => {
    expect(recordState(withF({ ...exported, proposal: { ...F.proposal, decidedOn: '2099-12-31' } }), TODAY)).toBe('not-ready')
    expect(approvalOf({ ...F.proposal, decidedOn: '2099-99-99' }, TODAY)).toBe('none')
  })
  it('no AI usage statement: not complete, not exportable, not ready', () => {
    const noAi = withF({ ...exported, aiStatement: 'none' })
    expect(checkAiStatement(noAi).ok).toBe(false)
    expect(partsComplete(noAi, TODAY)).toBe(false)
    expect(recordState(noAi, TODAY)).toBe('not-ready')
  })
  it('the export step needs both files after the last change', () => {
    expect(checkExported(withF({ exportedMdAt: 10 }), TODAY).ok).toBe(false)
    expect(checkExported(withF(exported), TODAY).ok).toBe(true)
    expect(checkExported(withF({ ...exported, updatedAt: 30 }), TODAY).issues[0]).toMatch(/changed after the last export/)
    expect(checkExported(withF({ needs: F.needs.slice(0, 3), ...exported }), TODAY).ok).toBe(false)
  })
})

describe('F11: the exports carry priority, concern links, several concerns per stakeholder and IDs inside the boundary', () => {
  const two = withF({ stakeholders: F.stakeholders.map((s, i) => (i === 0 ? { ...s, concerns: [...s.concerns, { id: 'CON-009', text: 'Families with no car cannot reach the pantry on weekday evenings after 6 p.m.' }] } : s)) })
  it('the Markdown carries every part, every ID, the status and the AI statement', () => {
    const md = teamMarkdown(two, TODAY)
    for (const h of ['## 1. Team charter', '## 2. Enterprise proposal (ENT-001)', '## 3. Context', '## 4. Stakeholder register', '### Relationships', '## 5. Initial stakeholder needs', '## 6. AI usage statement']) expect(md).toContain(h)
    for (const id of [...F.context, ...F.stakeholders, ...F.needs, ...F.proposal.inside, ...F.proposal.goals, ...F.relationships].map((x) => x.id)) expect(md).toContain(id)
    expect(md).toContain(`- Problem statement: ${F.proposal.problem}`)
    expect(md).toContain(`- Mission (MGO-001): ${F.proposal.purpose}`)
    expect(md).toContain('| REL-001 | STK-007 | conflicts with | STK-004 |')
    expect(md).toContain('| Objective (MGO) |')
    expect(md).toContain('CON-009: Families with no car')
    expect(md).toContain(F.aiStatement)
    expect(md).toMatch(/Record status:\*\* complete and approved/)
  })
  it('the JSON names the SysML v2 seed of every item and carries the new fields', () => {
    const j = teamModelInputs(two, TODAY)
    expect(j.version).toBe(3)
    expect(MODEL_INPUTS_VERSION).toBe(3)
    expect(j.needs.every((n) => n.seeds.includes('requirement def / requirement') && n.priority && n.concerns.length && n.selfCheck.length === 6 && /^MGO-\d{3}$/.test(n.goal))).toBe(true)
    expect(j.enterprise.problem).toBe(F.proposal.problem)
    expect(j.missionGoals.map((m) => `${m.id} ${m.level}`)).toEqual(['MGO-001 mission', 'MGO-002 goal', 'MGO-003 goal', 'MGO-004 goal', 'MGO-005 goal'])
    expect(j.relationships.map((x) => `${x.id} ${x.from} ${x.type} ${x.to}`)).toEqual(['REL-001 STK-007 conflicts-with STK-004', 'REL-002 STK-002 regulates STK-005', 'REL-003 STK-004 coordinates-with STK-005'])
    expect(j.stakeholders[0].concerns).toEqual(['CON-001', 'CON-009'])
    expect(j.concerns.filter((c) => c.stakeholders[0] === 'STK-001').map((c) => c.id)).toEqual(['CON-001', 'CON-009'])
    expect(j.systemOfInterest.inside.map((x) => x.id)).toEqual(['PRT-001', 'PRT-002', 'PRT-003', 'PRT-004'])
    expect(j.context.find((c) => c.kind === 'actor')!.seeds).toContain('actor')
    expect(j.aiStatement).toBe(F.aiStatement)
  })
})

describe('F04: import validates the file and refuses duplicates, with messages a student can act on', () => {
  const base = () => JSON.parse(JSON.stringify(teamModelInputs(F, TODAY)))
  it('a teammate’s JSON imports back to an equal record', () => {
    const back = importModelInputs(JSON.stringify(base()))
    expect('error' in back).toBe(false)
    const r = back as TeamRecord
    expect(partsComplete(r, TODAY)).toBe(true)
    expect(r.stakeholders.map((s) => s.concerns)).toEqual(F.stakeholders.map((s) => s.concerns))
    expect(r.needs.map((n) => n.priority)).toEqual(F.needs.map((n) => n.priority))
    expect(nextId(r, 'STK')).toBe('STK-009')
    expect(nextId(r, 'CON')).toBe('CON-009')
    expect(nextId(r, 'PRT')).toBe('PRT-005')
    expect(nextId(r, 'MGO')).toBe('MGO-006')
    expect(nextId(r, 'REL')).toBe('REL-004')
    expect(r.proposal.problem).toBe(F.proposal.problem)
    expect(r.proposal.goals).toEqual(F.proposal.goals)
    expect(r.relationships).toEqual(F.relationships)
    expect(r.needs.map((n) => n.goal)).toEqual(F.needs.map((n) => n.goal))
  })
  it('a version 2 file (purpose, one free-text conflict, no goals) still loads: the conflict becomes REL-001', () => {
    const v2 = base()
    v2.version = 2
    delete v2.missionGoals
    delete v2.relationships
    delete v2.enterprise.problem
    v2.conflicts = [{ stakeholders: ['STK-007', 'STK-004'], text: 'STK-007 neighbors want no early loading; STK-004 drivers need early starts.' }]
    for (const n of v2.needs) delete n.goal
    const back = importModelInputs(JSON.stringify(v2)) as TeamRecord
    expect('error' in back).toBe(false)
    expect(back.proposal.purpose).toBe(F.proposal.purpose)
    expect(back.proposal.goals).toEqual([])
    expect(back.relationships).toEqual([{ id: 'REL-001', from: 'STK-007', to: 'STK-004', type: 'conflicts-with', note: 'STK-007 neighbors want no early loading; STK-004 drivers need early starts.' }])
    // the new fields are missing, so the record is honest about what is left to do
    expect(checkProposal(back.proposal, TODAY).issues.join(' ')).toMatch(/Problem statement/)
    expect(checkNeedsPart(back).ok).toBe(false)
  })
  it('the first record shape (one concern as text, inside elements as lines) still loads', () => {
    const old = normalizeTeam({ ...F, proposal: { ...F.proposal, inside: 'Warehouse\nVans\nOffice' }, stakeholders: F.stakeholders.map(({ concerns, ...s }) => ({ ...s, concern: concerns[0].text })) })
    expect(old.proposal.inside.map((x) => x.id)).toEqual(['PRT-001', 'PRT-002', 'PRT-003'])
    expect(old.stakeholders[3].concerns).toEqual([{ id: 'CON-004', text: F.stakeholders[3].concerns[0].text }])
  })
  it('wrong shapes are refused with a clear message instead of throwing', () => {
    const cases: [string, (d: Record<string, unknown>) => void, RegExp][] = [
      ['context as an object', (d) => (d.context = {}), /“context” must be a list; this file has an object/],
      ['inside as text', (d) => ((d.systemOfInterest as Record<string, unknown>).inside = 'Warehouse'), /“systemOfInterest.inside” must be a list; this file has text/],
      ['sources as text', (d) => (((d.needs as Record<string, unknown>[])[0]).sources = 'STK-001'), /needs item 1 sources” must be a list/],
      ['a null stakeholder', (d) => (d.stakeholders = [null]), /“stakeholders” item 1 is null, not an object/],
      ['a concern of a missing stakeholder', (d) => (((d.concerns as Record<string, unknown>[])[0]).stakeholders = ['STK-099']), /CON-001 names STK-099/],
    ]
    for (const [name, mutate, msg] of cases) {
      const d = base()
      mutate(d)
      const res = importModelInputs(JSON.stringify(d))
      expect(res, name).toMatchObject({ error: expect.stringMatching(msg) })
    }
  })
  it('duplicate IDs in the file are refused', () => {
    const d = base()
    d.stakeholders = d.stakeholders.map((s: Record<string, unknown>) => ({ ...s, id: 'STK-001' }))
    d.concerns = d.concerns.map((c: Record<string, unknown>) => ({ ...c, stakeholders: ['STK-001'] }))
    expect(importModelInputs(JSON.stringify(d))).toMatchObject({ error: expect.stringMatching(/Duplicate ID STK-001 \(8 times\)/) })
  })
  it('bad files are refused', () => {
    expect(importModelInputs('{ not json')).toMatchObject({ error: expect.stringMatching(/not valid JSON/) })
    expect(importModelInputs(JSON.stringify({ format: 'something-else' }))).toMatchObject({ error: expect.stringMatching(/not a Week 1 model-inputs file/) })
    expect(importModelInputs(JSON.stringify({ ...base(), needs: [{ id: 'N1' }] }))).toMatchObject({ error: expect.stringMatching(/Unexpected NEED IDs/) })
    expect(importModelInputs(JSON.stringify({ ...base(), relationships: [{ id: 'R1', from: 'STK-001', to: 'STK-002', type: 'funds', note: 'a b c' }] }))).toMatchObject({ error: expect.stringMatching(/Unexpected REL IDs/) })
    expect(importModelInputs(JSON.stringify({ ...base(), relationships: {} }))).toMatchObject({ error: expect.stringMatching(/“relationships” must be a list/) })
    expect(importModelInputs(JSON.stringify({ ...base(), version: 4 }))).toMatchObject({ error: expect.stringMatching(/version 1, 2 or 3/) })
    expect(importModelInputs('null')).toMatchObject({ error: expect.any(String) })
  })
  it('IDs are never reused after a row is deleted', () => {
    const r = withF({ stakeholders: F.stakeholders.slice(0, 7), issued: { ...F.issued, STK: 8 } })
    expect(nextId(r, 'STK')).toBe('STK-009')
  })
  it('the content state of a complete approved record is “ready”', () => {
    expect(contentState(F, TODAY)).toBe('ready')
  })
})

describe('the AeroLink exercise uses the same assessment', () => {
  // sign-off review 2026-10-19 (M1, Mo5): the practice reads the corrected case register (aerolinkCase.ts, 15 STK) and
  // requires the taught form "The [stakeholders] need the [system] to …"
  it('an AeroLink need must be in the taught form, trace to a case stakeholder, be confirmed, and name a case stakeholder as its subject', () => {
    const d = { name: 'n', text: 'Emergency responders need the air-taxi service to give them early warning of a battery fire at a vertiport, at any hour of operation.', conditions: '', rationale: 'responders must reach a fire quickly and safely', traces: ['STK-006'], selfCheck: { ...ALL }, justification: '' }
    expect(draftBlockers(d)).toEqual([])
    expect(draftBlockers({ ...d, traces: ['STK-099'] }).join(' ')).toMatch(/STK-099 is not in the register/)
    expect(draftBlockers({ ...d, traces: [] }).length).toBeGreaterThan(0)
    expect(draftBlockers({ ...d, selfCheck: {} }).join(' ')).toMatch(/self-check/)
    expect(assessAeroLinkNeed({ ...d, text: 'AeroLink needs the air-taxi service to add chargers at every vertiport.' }).gates.find((g) => g.id === 'subject')!.ok).toBe(false)
    // A21: the outcome form passes every gate, with advice recommending the taught form
    const outcome = assessAeroLinkNeed({ ...d, text: 'Emergency responders need early warning of a battery fire at a vertiport, at any hour of operation.' })
    expect(outcome.gates.filter((g) => !g.ok)).toEqual([])
    expect(outcome.advice.map((a) => a.id)).toEqual(['form'])
    expect(draftBlockers({ ...d, text: 'Emergency responders need early warning of a battery fire at a vertiport, at any hour of operation.' })).toEqual([])
    // a [system] that is not the air-taxi service gets advice (A21: it may be an outcome or another party)
    expect(assessAeroLinkNeed({ ...d, text: 'Emergency responders need the fire brigade to give them early warning of a battery fire at a vertiport, at any hour of operation.' }).advice.map((x) => x.id)).toEqual(['system'])
  })
  it('the authored critique key agrees with the Week 3 screen on the six Week 1 drafts, and scores the key as correct', () => {
    for (const it of W1_CRITIQUE) expect(CRITIQUE_KEY[it.id].filter((f) => f !== 'form').sort(), it.id).toEqual([...diagnose(it.before)].sort())
    // A21: “not a valid need” is keyed exactly where a hard gate of the Week 1 need check rejects the draft
    for (const it of W1_CRITIQUE) expect(CRITIQUE_KEY[it.id].includes('form'), it.id).toBe(assessAeroLinkNeed({ name: 'n', text: it.before, conditions: '', rationale: 'r r r r r', traces: [] }).gates.some((g) => !g.ok))
    // the notes are the Week 1 ones, written for the case need shown, not the Week 3 rewrite
    for (const it of W1_CRITIQUE) expect(it.note, it.id).not.toMatch(/the rewrite adds|leaves its condition implicit/)
    const answers = Object.fromEntries(W1_CRITIQUE.map((it) => [it.id, Object.fromEntries(CRITIQUE_KEY[it.id].map((f) => [f, true]))]))
    expect(scoreCritiqueW1(answers).correct).toBe(W1_CRITIQUE.length)
    // every reference rewrite is a case need in the taught form, and the acceptable draft is in the taught form too
    for (const it of W1_CRITIQUE) expect(it.after, it.id).toMatch(/ needs? the air-taxi service to /)
    expect(W1_CRITIQUE.find((x) => x.id === 'c6')!.before).toMatch(/ need the air-taxi service to /)
  })
  it('every case stakeholder name works as the subject of a need, and the register is the case register', () => {
    expect(REFERENCE_REGISTER.map((s) => s.id)).toEqual(STAKEHOLDERS.map((s) => s.id))
    expect(REFERENCE_REGISTER).toHaveLength(15)
    for (const s of REFERENCE_REGISTER) {
      const a = assessAeroLinkNeed({ name: 'n', text: `${s.name.split(/[/(]/)[0].trim()} need the air-taxi service to reply to every request within one day.`, conditions: '', rationale: 'they told us so in the interview', traces: [s.id] })
      expect(a.gates.find((g) => g.id === 'subject')!.ok, s.name).toBe(true)
      expect(a.gates.find((g) => g.id === 'structure')!.ok, s.name).toBe(true)
    }
  })
  it('the candidate list covers the case register exactly, plus three non-stakeholders named as in the case context', () => {
    expect(CANDIDATES.filter((c) => c.stakeholder).map((c) => c.stk).sort()).toEqual(STAKEHOLDERS.map((s) => s.id).sort())
    expect(CANDIDATES.filter((c) => !c.stakeholder).map((c) => c.name)).toEqual(['Electric grid', 'Weather', 'Aircraft cabin color scheme'])
    for (const c of CANDIDATES.filter((x) => x.stakeholder)) expect(c.name).toBe(STAKEHOLDERS.find((s) => s.id === c.stk)!.name)
  })
})

