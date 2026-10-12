// Mission engine and the Week 1 step checks. Every checked step has a passing context and at least one realistic
// failing context (mutation evidence that the check can fail: wrong order, wrong number, wrong polarity, too few items).
import { describe, expect, it } from 'vitest'
import week1 from '../content/missions/week01'
import type { Answer, Mission, MissionCtx, Signal } from '../content/missions/types'
import { WEEK1_QUIZ } from '../content/quizWeek1'
import { BOUNDARY_ITEMS } from '../content/week1'
import type { Element, EngineeringModel } from '../model/engineering'
import { DEFAULT_PARAMS, SCENARIOS, simulate } from '../sim/aerolink'
import { EMPTY_PROGRESS, evaluateMission, evaluateStep, recordAnswer, visibleSteps } from './missions'
import { L1_KEY, LOOPS_KEY, SIG_ARCHETYPE, SIG_BOUNDARY, SIG_RUN, summariseRun, type L1Record, type StudentLoop } from './week1/logic'

const el = (id: string, kind: Element['kind'], extra: Partial<Element> = {}): Element => ({ id, kind, name: id, provenance: 'team-derived', owner: 'JS', status: 'active', ...extra })
const run = (scenario: string, seq = 1) => {
  const s = SCENARIOS.find((x) => x.id === scenario)
  const p = { ...DEFAULT_PARAMS, ...(s?.params ?? {}) }
  return summariseRun(scenario, p, simulate(p), seq)
}
const sig = (value: unknown, at: number, history: { value: unknown; at: number }[] = []): Signal => ({ value, at, history })
const base = (p: Partial<MissionCtx> = {}): MissionCtx => ({ model: { elements: [], links: [] }, signals: {}, answers: {}, artefacts: {}, boundary: {}, quiz: {}, ...p })
const ans = (value: string, at = 100): Answer => ({ value, at })
const R: StudentLoop = { id: 'LOOP-001', name: 'Word of mouth', vars: [{ ref: 'riders', label: 'Riders' }, { ref: 'adoption', label: '' }], polarities: ['+', '+'], declared: 'Reinforcing', owner: 'JS', provenance: 'team-derived' }
const B: StudentLoop = { id: 'LOOP-002', name: 'Noise pushback', vars: [{ label: 'Flights' }, { label: 'Noise complaints' }, { label: 'Permitted operating hours' }], polarities: ['+', '+', '−'], declared: 'Balancing', owner: 'AB', provenance: 'team-derived' }
const loops = (...l: StudentLoop[]) => ({ [LOOPS_KEY]: { loops: l, issued: l.length } })
const allBoundary = Object.fromEntries(BOUNDARY_ITEMS.map((b) => [b.id, b.answer]))
const sixExt = [1, 2, 3, 4, 5, 6].map((i) => el(`EXT-00${i}`, 'EXT', { attributes: { exchange: 'power' } }))
const goodEnt = el('ENT-001', 'ENT', { text: 'The AeroLink service enterprise: fleet, vertiports and chargers, operations centre and demand.', attributes: { rejectedBoundary: 'The aircraft alone, because waiting time is not a property of an aircraft.' } })
const explanation =
  'Served trips level off below the charging ceiling because the fleet grows while the chargers stay fixed. As utilisation approaches one the wait climbs past tolerance, attractiveness falls and churn rises (B2), while waiting also deters adoption (B1). Word of mouth (R1) keeps recruiting riders, so the plateau sits where adoption balances churn. No single element sets it: it is the coupling of fleet, chargers, waits and riders.'
const l1 = (p: Partial<L1Record>): Record<string, unknown> => ({ [L1_KEY]: { behaviour: '', explanation: '', threePersonTeam: false, roles: {}, decisionRules: '', norms: '', prefixes: '', ...p } })
const charter: Partial<L1Record> = {
  roles: { 'Requirements & Compliance': 'JS', Architecture: 'AB', 'AI & Data Management': 'CD', 'Verification & Validation': 'EF' },
  decisionRules: 'Consensus first; the role owner decides after one round of discussion.',
  norms: 'Daily check-in on the team channel; replies within 24 hours.',
  prefixes: 'JS: REQ, NEED; AB: LOG, PHY; CD: AI, INFO; EF: VER',
}

const mission = (id: string) => week1.missions.find((m) => m.id === id)!
const step = (m: Mission, id: string) => m.steps.find((s) => s.id === id)!

/** For every checked step: a context that passes and named contexts that must fail. */
const CASES: Record<string, { pass: MissionCtx; fail: Record<string, MissionCtx> }> = {
  'w1-m1-try/predict': { pass: base({ answers: { prediction: ans('partly') } }), fail: { 'no prediction': base() } },
  'w1-m1-try/run': {
    pass: base({ answers: { prediction: ans('partly', 100) }, signals: { [SIG_RUN]: sig(run('underinvestment'), 200) } }),
    fail: {
      'run before the prediction': base({ answers: { prediction: ans('partly', 300) }, signals: { [SIG_RUN]: sig(run('underinvestment'), 200) } }),
      'another scenario': base({ answers: { prediction: ans('partly', 100) }, signals: { [SIG_RUN]: sig(run('delay'), 200) } }),
      'no prediction': base({ signals: { [SIG_RUN]: sig(run('underinvestment'), 200) } }),
    },
  },
  'w1-m1-try/compare': {
    pass: base({ answers: { prediction: ans('partly', 100), match: ans('partly', 300) }, signals: { [SIG_RUN]: sig(run('underinvestment'), 200) } }),
    fail: { 'not recorded': base({ answers: { prediction: ans('partly', 100) }, signals: { [SIG_RUN]: sig(run('underinvestment'), 200) } }), 'before the prediction': base({ answers: { prediction: ans('partly', 300), match: ans('partly', 100) } }) },
  },
  'w1-m1-try/archetype': { pass: base({ signals: { [SIG_ARCHETYPE]: sig({ underinvestment: 'Limits to Growth' }, 1) } }), fail: { 'other scenario only': base({ signals: { [SIG_ARCHETYPE]: sig({ delay: 'Limits to Growth' }, 1) } }) } },
  'w1-m2-worked/setup': {
    pass: base({ signals: { [SIG_RUN]: sig(run('delay', 2), 2, [{ value: run('underinvestment'), at: 1 }]) } }),
    fail: { 'never ran the scenario': base({ signals: { [SIG_RUN]: sig(run('delay'), 2) } }) },
  },
  'w1-m2-worked/fleet-capacity': { pass: base({ answers: { fleetCap: ans('7,200') } }), fail: { 'used 6 chargers': base({ answers: { fleetCap: ans('8640') } }), blank: base() } },
  'w1-m2-worked/charging-capacity': { pass: base({ answers: { chargeCap: ans('8640') } }), fail: { 'used 12 chargers': base({ answers: { chargeCap: ans('17280') } }) } },
  'w1-m2-worked/crossover': { pass: base({ answers: { crossover: ans('14.4') } }), fail: { 'off by one': base({ answers: { crossover: ans('14') } }), text: base({ answers: { crossover: ans('fifteen') } }) } },
  'w1-m2-worked/plateau': { pass: base({ answers: { plateau: ans('7788') } }), fail: { 'the ceiling, not the plateau': base({ answers: { plateau: ans('8640') } }) } },
  'w1-m2-worked/lesson': { pass: base({ answers: { sequence: ans('dfc') } }), fail: { 'wrong order': base({ answers: { sequence: ans('fdc') } }) } },
  'w1-m3-boundary/classify': { pass: base({ boundary: allBoundary }), fail: { 'eight of nine': base({ boundary: { ...allBoundary, b9: '' } }) } },
  'w1-m3-boundary/check': {
    pass: base({ signals: { [SIG_BOUNDARY]: sig({ score: 7, answered: 9, total: 9 }, 1) } }),
    fail: { 'not checked': base(), 'checked before classifying all': base({ signals: { [SIG_BOUNDARY]: sig({ score: 5, answered: 6, total: 9 }, 1) } }) },
  },
  'w1-m3-boundary/criterion': { pass: base({ answers: { criterion: ans('model') } }), fail: { 'control criterion': base({ answers: { criterion: ans('control') } }) } },
  'w1-m4-loops/count': { pass: base({ answers: { b2neg: ans('3') } }), fail: { 'counted two': base({ answers: { b2neg: ans('2') } }) } },
  'w1-m4-loops/reinforcing': {
    pass: base({ artefacts: loops(R) }),
    fail: { 'declared reinforcing with one negative link': base({ artefacts: loops({ ...R, polarities: ['+', '−'] }) }), 'no owner': base({ artefacts: loops({ ...R, owner: '' }) }) },
  },
  'w1-m4-loops/balancing': {
    pass: base({ artefacts: loops(B) }),
    fail: { 'declared balancing with two negative links': base({ artefacts: loops({ ...B, polarities: ['−', '+', '−'] }) }), 'missing polarity': base({ artefacts: loops({ ...B, polarities: ['+', '', '−'] }) }) },
  },
  'w1-m4-loops/beyond': {
    pass: base({ artefacts: loops(R, B) }),
    fail: { 'copies of the explorer only': base({ artefacts: loops(R) }), 'own loop unsound': base({ artefacts: loops(R, { ...B, declared: 'Reinforcing' }) }) },
  },
  'w1-m5-l1/soi': {
    pass: base({ model: { elements: [goodEnt], links: [] } }),
    fail: {
      'no rejected boundary': base({ model: { elements: [{ ...goodEnt, attributes: {} }], links: [] } }),
      'two sentences': base({ model: { elements: [{ ...goodEnt, text: 'The service enterprise is the SoI. It includes fleet, chargers and demand for the question.' }], links: [] } }),
      'no owner': base({ model: { elements: [{ ...goodEnt, owner: '' }], links: [] } }),
    },
  },
  'w1-m5-l1/context': {
    pass: base({ model: { elements: sixExt, links: [] } }),
    fail: { 'five EXT': base({ model: { elements: sixExt.slice(0, 5), links: [] } }), 'one without an exchange': base({ model: { elements: [...sixExt.slice(0, 5), el('EXT-006', 'EXT')], links: [] } }) },
  },
  'w1-m5-l1/loops': { pass: base({ artefacts: loops(R, B) }), fail: { 'only reinforcing': base({ artefacts: loops(R) }) } },
  'w1-m5-l1/emergent': {
    pass: base({ artefacts: { ...loops(R, B), ...l1({ behaviour: 'plateau', explanation }) }, signals: { [SIG_RUN]: sig(run('underinvestment'), 1) } }),
    fail: {
      'not reproduced': base({ artefacts: { ...loops(R, B), ...l1({ behaviour: 'plateau', explanation }) }, signals: { [SIG_RUN]: sig(run('balanced'), 1) } }),
      'wrong scenario for over-build': base({ artefacts: l1({ behaviour: 'overbuild', explanation }), signals: { [SIG_RUN]: sig(run('underinvestment'), 1) } }),
      'single-element explanation': base({ artefacts: l1({ behaviour: 'plateau', explanation: explanation.replace(/\((B2|B1|R1)\)/g, '') }), signals: { [SIG_RUN]: sig(run('underinvestment'), 1) } }),
      'too short': base({ artefacts: l1({ behaviour: 'plateau', explanation: 'R1 meets B2.' }), signals: { [SIG_RUN]: sig(run('underinvestment'), 1) } }),
    },
  },
  'w1-m5-l1/charter': {
    pass: base({ artefacts: l1(charter) }),
    fail: { 'role unassigned': base({ artefacts: l1({ ...charter, roles: { ...charter.roles, Architecture: '' } }) }), 'no prefixes': base({ artefacts: l1({ ...charter, prefixes: '' }) }) },
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
  it('the try-first comparison shows the prediction next to the run values', () => {
    const d = step(mission('w1-m1-try'), 'compare').check!(CASES['w1-m1-try/compare'].pass).detail!
    expect(d).toContain('Only up to a point')
    expect(d).toContain('12 → 40')
    expect(d).toContain('7,788')
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
    const predict = step(mission('w1-m1-try'), 'predict')
    const p1 = recordAnswer(EMPTY_PROGRESS, predict, 'yes', 1)
    const p2 = recordAnswer(p1, predict, 'partly', 2)
    expect(p2.answers.prediction).toEqual({ value: 'yes', at: 1 })
    const crit = step(mission('w1-m3-boundary'), 'criterion')
    expect(recordAnswer(recordAnswer(EMPTY_PROGRESS, crit, 'control', 1), crit, 'model', 2).answers.criterion.value).toBe('model')
  })
  it('the whole Week 1 try-first mission completes from a realistic sequence', () => {
    const e = evaluateMission(mission('w1-m1-try'), { ...ctx, signals: { [SIG_RUN]: sig(run('underinvestment'), 200), [SIG_ARCHETYPE]: sig({ underinvestment: 'Limits to Growth' }, 250) } }, { ...EMPTY_PROGRESS, answers: { prediction: ans('yes', 100), match: ans('contradicted', 300) } })
    expect(e.complete).toBe(true)
  })
})
