// Mission engine and the Week 1 step checks (rebuilt 2026-10-18). Every checked step has a passing context and at least
// one realistic failing context (wrong order, one item short, a generic concern, a stale export, AeroLink as the team's
// subject), so every check is shown to fail as well as to pass.
import { describe, expect, it } from 'vitest'
import week1 from '../content/missions/week01'
import type { Answer, Mission, MissionCtx, Signal } from '../content/missions/types'
import { WEEK1_QUIZ } from '../content/quizWeek1'
import { BOUNDARY_ITEMS } from '../content/week1'
import type { EngineeringModel } from '../model/engineering'
import { CRITIQUE_ITEMS } from '../activities/week03/needs'
import { EMPTY_PROGRESS, evaluateMission, evaluateStep, recordAnswer, visibleSteps } from './missions'
import { SIG_BOUNDARY } from './week1/logic'
import { CANDIDATES, CLASSIFY_ROWS, CRITIQUE_KEY, EMPTY_NEED, NEEDS_KEY, STK_KEY, type NeedsExercise, type StakeholderExercise } from './week1/stakeholders'
import { CRITERION_IDS } from './week1/needQuality'
import { TEAM_KEY, type TeamRecord } from './week1/team'
import { TEAM_FIXTURE } from './week1/teamFixture'

const sig = (value: unknown, at: number, history: { value: unknown; at: number }[] = []): Signal => ({ value, at, history })
const base = (p: Partial<MissionCtx> = {}): MissionCtx => ({ model: { elements: [], links: [] }, signals: {}, answers: {}, artefacts: {}, boundary: {}, quiz: {}, ...p })
const ans = (value: string, at = 100): Answer => ({ value, at })
const allBoundary = Object.fromEntries(BOUNDARY_ITEMS.map((b) => [b.id, b.answer]))
const identified = Object.fromEntries(CANDIDATES.map((c) => [c.id, c.stakeholder ? 'yes' : 'no'])) as StakeholderExercise['identified']
const classes = Object.fromEntries(CLASSIFY_ROWS.map((r) => [r.stk, r.key])) as StakeholderExercise['classes']
const goodRow = { stk: 'STK-012', concern: 'No record of how often flights exceed weather limits, so premiums rest on guesses.', influence: '4', reason: 'premiums constrain operations' }
const stk = (p: Partial<StakeholderExercise>) => ({ [STK_KEY]: { identified: {}, classes: {}, row: { stk: '', concern: '', influence: '', reason: '' }, ...p } })
const critique = Object.fromEntries(CRITIQUE_ITEMS.map((it) => [it.id, Object.fromEntries(CRITIQUE_KEY[it.id].map((f) => [f, true]))]))
const ALL = Object.fromEntries(CRITERION_IDS.map((id) => [id, true]))
const need = (stkId: string, text: string, id: string) => ({ ...EMPTY_NEED, name: 'n', text, rationale: 'the stakeholder told us why in a workshop', traces: [stkId], selfCheck: { ...ALL }, id, at: 1 })
/** The weather marked as a stakeholder: one answer that differs from the key. */
const oneWrong = { ...identified, k9: 'yes' as const }
const classesOneWrong = { ...classes, 'STK-010': { ...classes['STK-010'], approving: 'yes' as const } }
const N1 = need('STK-006', 'Emergency responders need the air-taxi service to give them early warning of a battery fire at a vertiport, at any hour of operation.', 'NEED-A01')
const N2 = need('STK-010', 'The electric utility needs the air-taxi service to keep the power drawn at each vertiport within the agreed connection capacity at all times.', 'NEED-A02')
const needs = (p: Partial<NeedsExercise>) => ({ [NEEDS_KEY]: { critique: {}, draft: EMPTY_NEED, needs: [], ...p } })
const team = (p: Partial<TeamRecord> = {}) => ({ [TEAM_KEY]: { ...TEAM_FIXTURE, ...p } })
const exported = { exportedMdAt: 20, exportedJsonAt: 21, updatedAt: 10 }

const mission = (id: string) => week1.missions.find((m) => m.id === id)!
const step = (m: Mission, id: string) => m.steps.find((s) => s.id === id)!

/** For every checked step: a context that passes and named contexts that must fail. */
const CASES: Record<string, { pass: MissionCtx; fail: Record<string, MissionCtx> }> = {
  'w1-m1-who/predict': { pass: base({ answers: { prediction: ans('missing') } }), fail: { 'no prediction': base() } },
  'w1-m1-who/identify': {
    pass: base({ answers: { prediction: ans('enough', 100) }, artefacts: stk({ identified, identifiedCheckedAt: 200 }) }),
    fail: {
      'no prediction yet': base({ artefacts: stk({ identified, identifiedCheckedAt: 200 }) }),
      'thirteen of fourteen marked': base({ answers: { prediction: ans('enough') }, artefacts: stk({ identified: Object.fromEntries(Object.entries(identified).slice(1)) as StakeholderExercise['identified'], identifiedCheckedAt: 200 }) }),
      'not checked': base({ answers: { prediction: ans('enough') }, artefacts: stk({ identified }) }),
      'a difference from the key not read (F14)': base({ answers: { prediction: ans('enough') }, artefacts: stk({ identified: oneWrong, identifiedCheckedAt: 200 }) }),
    },
  },
  'w1-m1-who/compare': {
    pass: base({ answers: { prediction: ans('enough', 100), match: ans('contradicted', 300) }, artefacts: stk({ identified, identifiedCheckedAt: 200 }) }),
    fail: {
      'not recorded': base({ answers: { prediction: ans('enough', 100) }, artefacts: stk({ identified, identifiedCheckedAt: 200 }) }),
      'before the prediction': base({ answers: { prediction: ans('enough', 300), match: ans('partly', 100) }, artefacts: stk({ identified, identifiedCheckedAt: 200 }) }),
      'identification not done': base({ answers: { prediction: ans('enough', 100), match: ans('partly', 300) } }),
    },
  },
  'w1-m2-boundary/classify': { pass: base({ boundary: allBoundary }), fail: { 'eight of nine': base({ boundary: { ...allBoundary, b9: '' } }) } },
  'w1-m2-boundary/check': {
    pass: base({ signals: { [SIG_BOUNDARY]: sig({ score: 7, answered: 9, total: 9 }, 1) } }),
    fail: { 'not checked': base(), 'checked before classifying all': base({ signals: { [SIG_BOUNDARY]: sig({ score: 5, answered: 6, total: 9 }, 1) } }) },
  },
  'w1-m2-boundary/criterion': { pass: base({ answers: { criterion: ans('model') } }), fail: { 'control criterion': base({ answers: { criterion: ans('control') } }) } },
  'w1-m3-stakeholders/classify': {
    pass: base({ artefacts: stk({ classes }) }),
    fail: { 'one row missing approving authority': base({ artefacts: stk({ classes: { ...classes, 'STK-010': { role: 'supplier', side: 'external' } } }) }) },
  },
  'w1-m3-stakeholders/check': {
    pass: base({ artefacts: stk({ classes, classesCheckedAt: 5 }) }),
    fail: {
      'classified but not checked': base({ artefacts: stk({ classes }) }),
      'checked with a row missing': base({ artefacts: stk({ classes: { ...classes, 'STK-002': {} }, classesCheckedAt: 5 }) }),
      'a difference from the key not read (F14)': base({ artefacts: stk({ classes: classesOneWrong, classesCheckedAt: 5 }) }),
    },
  },
  'w1-m3-stakeholders/row': {
    pass: base({ artefacts: stk({ row: goodRow, rowRecordedAt: 5 }) }),
    fail: {
      'not recorded': base({ artefacts: stk({ row: goodRow }) }),
      'generic concern': base({ artefacts: stk({ row: { ...goodRow, concern: 'Insurers care a lot about safety and cost.' }, rowRecordedAt: 5 }) }),
      'no reason for the rating': base({ artefacts: stk({ row: { ...goodRow, reason: '' }, rowRecordedAt: 5 }) }),
      'a stakeholder already classified': base({ artefacts: stk({ row: { ...goodRow, stk: 'STK-002' }, rowRecordedAt: 5 }) }),
    },
  },
  'w1-m4-needs/diagnose': {
    pass: base({ artefacts: needs({ critique, critiqueCheckedAt: 5 }) }),
    fail: { 'ticked but not checked': base({ artefacts: needs({ critique }) }), 'checked with nothing ticked': base({ artefacts: needs({ critiqueCheckedAt: 5 }) }) },
  },
  'w1-m4-needs/write': {
    pass: base({ artefacts: needs({ needs: [N1, N2] }) }),
    fail: {
      'one need': base({ artefacts: needs({ needs: [N1] }) }),
      'both from the same stakeholder': base({ artefacts: needs({ needs: [N1, { ...N2, traces: ['STK-006'] }] }) }),
      'one written as a requirement': base({ artefacts: needs({ needs: [N1, { ...N2, text: 'The vertiport shall stay within the agreed connection capacity at all times.' }] }) }),
      'one not confirmed against the six criteria': base({ artefacts: needs({ needs: [N1, { ...N2, selfCheck: {} }] }) }),
      // A21: the outcome form is a valid need and no longer fails (pre-A21 case M1 removed); a solution as the need does
      'one asking for a solution, not an outcome': base({ artefacts: needs({ needs: [N1, { ...N2, text: 'The electric utility needs a smart charging controller at every vertiport, at all times.' }] }) }),
      'one with an unjustified warning': base({ artefacts: needs({ needs: [N1, { ...N2, text: 'The electric utility needs the air-taxi service to give good coordination when possible.' }] }) }),
    },
  },
  'w1-m5-team/charter': { pass: base({ artefacts: team() }), fail: { 'a lead missing': base({ artefacts: team({ charter: { ...TEAM_FIXTURE.charter, roles: { ...TEAM_FIXTURE.charter.roles, Architecture: '' } } }) }) } },
  'w1-m5-team/proposal': {
    pass: base({ artefacts: team() }),
    fail: {
      'AeroLink as the team enterprise': base({ artefacts: team({ proposal: { ...TEAM_FIXTURE.proposal, name: 'AeroLink' } }) }),
      'no decision recorded': base({ artefacts: team({ proposal: { ...TEAM_FIXTURE.proposal, decision: '' } }) }),
      'approved on a nonsense date': base({ artefacts: team({ proposal: { ...TEAM_FIXTURE.proposal, decidedOn: '2099-99-99' } }) }),
      'the instructor asked for a revision': base({ artefacts: team({ proposal: { ...TEAM_FIXTURE.proposal, decision: 'revise' } }) }),
    },
  },
  'w1-m5-team/context': { pass: base({ artefacts: team() }), fail: { 'five EXT': base({ artefacts: team({ context: TEAM_FIXTURE.context.slice(0, 5) }) }) } },
  'w1-m5-team/register': {
    pass: base({ artefacts: team() }),
    fail: { 'seven stakeholders': base({ artefacts: team({ stakeholders: TEAM_FIXTURE.stakeholders.slice(0, 7) }) }), 'no conflict recorded': base({ artefacts: team({ relationships: TEAM_FIXTURE.relationships.filter((x) => x.type !== 'conflicts-with') }) }) },
  },
  'w1-m5-team/needs': {
    pass: base({ artefacts: team() }),
    fail: { 'seven needs': base({ artefacts: team({ needs: TEAM_FIXTURE.needs.slice(0, 7) }) }), 'a need traced outside the register': base({ artefacts: team({ needs: TEAM_FIXTURE.needs.map((n, i) => (i === 0 ? { ...n, sources: 'STK-020' } : n)) }) }) },
  },
  'w1-m5-team/ai': { pass: base({ artefacts: team() }), fail: { 'no AI usage statement': base({ artefacts: team({ aiStatement: '' }) }) } },
  'w1-m5-team/export': {
    pass: base({ artefacts: team(exported) }),
    fail: { 'never exported': base({ artefacts: team() }), 'only the Markdown': base({ artefacts: team({ exportedMdAt: 20, updatedAt: 10 }) }), 'edited after the export': base({ artefacts: team({ ...exported, updatedAt: 30 }) }) },
  },
  'w1-m6-recall/answer': {
    pass: base({ quiz: Object.fromEntries(WEEK1_QUIZ.map((q) => [q.id, { selected: 'a', correct: false, attempts: 1 }])) }),
    fail: { 'nine answered': base({ quiz: Object.fromEntries(WEEK1_QUIZ.slice(1).map((q) => [q.id, { selected: 'a', correct: true, attempts: 1 }])) }) },
  },
  'w1-m6-recall/review': {
    pass: base({ quiz: Object.fromEntries(WEEK1_QUIZ.map((q) => [q.id, { selected: 'b', correct: true, attempts: 2 }])) }),
    fail: { 'one still wrong': base({ quiz: Object.fromEntries(WEEK1_QUIZ.map((q, i) => [q.id, { selected: 'b', correct: i > 0, attempts: 1 }])) }) },
  },
}

describe('Week 1 mission checks: each passes on good work and fails on realistic bad work', () => {
  it('covers every checked step', () => {
    const checked = week1.missions.flatMap((m) => m.steps.filter((s) => s.check).map((s) => `${m.id}/${s.id}`))
    expect(Object.keys(CASES).sort()).toEqual(checked.sort())
  })
  for (const [key, c] of Object.entries(CASES)) {
    const [mid, sid] = key.split('/')
    const s = step(mission(mid), sid)
    it(`${key} passes`, () => expect(s.check!(c.pass), s.check!(c.pass).detail).toMatchObject({ ok: true }))
    for (const [name, ctx] of Object.entries(c.fail)) it(`${key} fails: ${name}`, () => expect(s.check!(ctx).ok).toBe(false))
  }
  it('no step can be marked done by hand: every Week 1 step has a check (review F15)', () => {
    for (const m of week1.missions) for (const st of m.steps) expect(st.check, `${m.id}/${st.id}`).toBeDefined()
  })
  it('F14: a difference from the key passes once it is read (acknowledged) or re-answered', () => {
    const identify = step(mission('w1-m1-who'), 'identify').check!
    const pred = { answers: { prediction: ans('enough') } }
    expect(identify(base({ ...pred, artefacts: stk({ identified: oneWrong, identifiedCheckedAt: 200, identifiedAck: { k9: true } }) })).ok).toBe(true)
    expect(identify(base({ ...pred, artefacts: stk({ identified, identifiedCheckedAt: 200, identifiedFirstScore: 13 }) })).detail).toMatch(new RegExp(`13 of ${CANDIDATES.length} agreed with the key at the first check`))
    const classify = step(mission('w1-m3-stakeholders'), 'check').check!
    expect(classify(base({ artefacts: stk({ classes: classesOneWrong, classesCheckedAt: 5, classesAck: { 'STK-010': true } }) })).ok).toBe(true)
  })
  it('the try-first comparison gives nothing away before the comparison is recorded', () => {
    const before = step(mission('w1-m1-who'), 'compare').check!(CASES['w1-m1-who/compare'].fail['not recorded']).detail!
    expect(before).not.toMatch(/FAA|planning|approv|residents/i)
  })
})

describe('mission engine', () => {
  const m: Mission = {
    id: 'm', week: 1, kind: 'guided', title: 't', goal: 'g', minutes: 1, objectives: ['B1.1'], workloadLine: 'x',
    steps: [
      { id: 'a', instruction: 'a', readMore: 'w1-soi', check: (c) => ({ ok: !!c.answers.x }) },
      { id: 'b', instruction: 'b', readMore: 'w1-soi', check: () => ({ ok: false }) },
      { id: 'c', instruction: 'c', readMore: 'w1-soi' },
    ],
  }
  const ctx = { model: { elements: [], links: [] } as EngineeringModel, signals: {}, artefacts: {}, boundary: {}, quiz: {} }
  it('marks the first unfinished step current and hides later guided steps', () => {
    const e = evaluateMission(m, ctx, { ...EMPTY_PROGRESS, answers: { x: ans('1') } })
    expect(e.steps.map((s) => s.status)).toEqual(['done', 'current', 'upcoming'])
    expect(visibleSteps(e).map((s) => s.step.id)).toEqual(['a', 'b'])
    expect(visibleSteps({ ...e, mission: { ...m, kind: 'worked' } }).length).toBe(3)
    expect(e.complete).toBe(false)
  })
  it('a step without a check is done only when the student marks it', () => {
    expect(evaluateStep(m.steps[2], { ...ctx, answers: {} }, EMPTY_PROGRESS).ok).toBe(false)
    expect(evaluateStep(m.steps[2], { ...ctx, answers: {} }, { ...EMPTY_PROGRESS, manual: { c: true } }).ok).toBe(true)
  })
  it('a check that throws counts as failing', () => {
    const r = evaluateStep({ id: 'z', instruction: '', readMore: '', check: () => { throw new Error('boom') } }, { ...ctx, answers: {} }, EMPTY_PROGRESS)
    expect(r).toMatchObject({ ok: false })
    expect(r.detail).toContain('boom')
  })
  it('a locked input keeps the first recorded answer (prediction before the reveal)', () => {
    const predict = step(mission('w1-m1-who'), 'predict')
    const p1 = recordAnswer(EMPTY_PROGRESS, predict, 'enough', 1)
    const p2 = recordAnswer(p1, predict, 'missing', 2)
    expect(p2.answers.prediction).toEqual({ value: 'enough', at: 1 })
    const crit = step(mission('w1-m2-boundary'), 'criterion')
    expect(recordAnswer(recordAnswer(EMPTY_PROGRESS, crit, 'control', 1), crit, 'model', 2).answers.criterion.value).toBe('model')
  })
  it('the whole Week 1 try-first and team missions complete from realistic work', () => {
    const e = evaluateMission(mission('w1-m1-who'), { ...ctx, artefacts: stk({ identified, identifiedCheckedAt: 200 }) }, { ...EMPTY_PROGRESS, answers: { prediction: ans('enough', 100), match: ans('contradicted', 300) } })
    expect(e.complete).toBe(true)
    expect(evaluateMission(mission('w1-m5-team'), { ...ctx, artefacts: team(exported) }, EMPTY_PROGRESS).complete).toBe(true)
  })
})
