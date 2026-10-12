// Problems engine: every rule has a failing and a passing fixture, and the instructor reference passes every rule
// that applies in its week (AUTHORING_GUIDE §7.4: reference examples must pass our own checks).
import { describe, expect, it } from 'vitest'
import week1 from '../content/missions/week01'
import { INSTRUCTOR_EXAMPLE, SEED_STAKEHOLDERS, type Relationship } from '../model/airtaxi'
import type { Element, EngineeringModel } from '../model/engineering'
import { referenceUpTo } from '../model/reference'
import { CORE_RULES, countBySeverity, problemKey, runRules, worstByElement, type Rule, type RuleCtx } from './problems'
import { LOOPS_KEY, type StudentLoop } from './week1/logic'

const el = (id: string, kind: Element['kind'], extra: Partial<Element> = {}): Element => ({ id, kind, name: id, provenance: 'team-derived', owner: 'JS', status: 'active', ...extra })
const EMPTY: EngineeringModel = { elements: [], links: [] }
const ctx = (p: Partial<RuleCtx> = {}): RuleCtx => ({ week: 1, artefacts: {}, boundary: {}, stakeholders: SEED_STAKEHOLDERS.map((s) => ({ ...s })), relationships: [], ...p })
const loop = (p: Partial<StudentLoop>): StudentLoop => ({
  id: 'LOOP-001',
  name: 'Word of mouth',
  vars: [{ ref: 'riders', label: 'Riders' }, { ref: 'adoption', label: 'Word-of-mouth adoption' }],
  polarities: ['+', '+'],
  declared: 'Reinforcing',
  owner: 'JS',
  provenance: 'team-derived',
  ...p,
})
const withLoops = (...loops: StudentLoop[]) => ctx({ artefacts: { [LOOPS_KEY]: { loops, issued: loops.length } } })

const ALL: Rule[] = [...CORE_RULES, ...week1.rules]
const rule = (id: string) => ALL.find((r) => r.id === id)!
const run = (id: string, m: EngineeringModel, c: RuleCtx) => rule(id).check(m, c)

type Fixture = { fail: [EngineeringModel, RuleCtx]; pass: [EngineeringModel, RuleCtx]; expectElement?: string }
const FIXTURES: Record<string, Fixture> = {
  'model-integrity': {
    fail: [{ elements: [el('EXT-001', 'EXT'), el('EXT-001', 'EXT')], links: [] }, ctx()],
    pass: [{ elements: [el('EXT-001', 'EXT'), el('EXT-002', 'EXT')], links: [] }, ctx()],
    expectElement: 'EXT-001',
  },
  'stakeholder-integrity': {
    fail: [EMPTY, ctx({ relationships: [{ id: 'REL-001', source: 'STK-001', target: 'STK-999', type: 'coordinates-with', note: '' } as Relationship] })],
    pass: [EMPTY, ctx({ relationships: [{ id: 'REL-001', source: 'STK-001', target: 'STK-002', type: 'coordinates-with', note: '' } as Relationship] })],
  },
  'stakeholder-map': {
    fail: [EMPTY, ctx({ week: 2, stakeholders: SEED_STAKEHOLDERS.slice(0, 3) })],
    pass: [EMPTY, ctx({ week: 2, stakeholders: INSTRUCTOR_EXAMPLE.stakeholders, relationships: INSTRUCTOR_EXAMPLE.relationships })],
  },
  'owner-initials': {
    fail: [{ elements: [el('EXT-001', 'EXT', { owner: '' })], links: [] }, ctx()],
    pass: [{ elements: [el('EXT-001', 'EXT', { owner: 'JS' }), el('EXT-002', 'EXT', { owner: undefined, provenance: 'instructor-reference' })], links: [] }, ctx()],
    expectElement: 'EXT-001',
  },
  'w1-loop-structure': {
    fail: [EMPTY, withLoops(loop({ polarities: ['+', ''] }))],
    pass: [EMPTY, withLoops(loop({}))],
    expectElement: 'LOOP-001',
  },
  'w1-loop-type': {
    // a realistic error: one negative link (balancing) declared reinforcing
    fail: [EMPTY, withLoops(loop({ vars: [{ ref: 'riders', label: 'Riders' }, { ref: 'potential', label: '' }, { ref: 'adoption', label: '' }], polarities: ['−', '+', '+'], declared: 'Reinforcing' }))],
    pass: [EMPTY, withLoops(loop({ vars: [{ ref: 'riders', label: 'Riders' }, { ref: 'potential', label: '' }, { ref: 'adoption', label: '' }], polarities: ['−', '+', '+'], declared: 'Balancing' }))],
    expectElement: 'LOOP-001',
  },
  'w1-loop-undeclared': {
    fail: [EMPTY, withLoops(loop({ declared: '' }))],
    pass: [EMPTY, withLoops(loop({}))],
  },
  'w1-loop-explorer': {
    fail: [EMPTY, withLoops(loop({ polarities: ['−', '−'] }))], // riders → adoption is + in the explorer
    pass: [EMPTY, withLoops(loop({}))],
  },
  'w1-loop-new-link': {
    fail: [EMPTY, withLoops(loop({ vars: [{ ref: 'riders', label: '' }, { ref: 'fleet', label: '' }], polarities: ['+', '+'] }))],
    pass: [EMPTY, withLoops(loop({}))],
  },
  'w1-loop-owner': {
    fail: [EMPTY, withLoops(loop({ owner: 'J' }))],
    pass: [EMPTY, withLoops(loop({ owner: 'JS' }))],
  },
  'w1-ent-boundary': {
    fail: [{ elements: [el('ENT-001', 'ENT', { text: '  ' })], links: [] }, ctx()],
    pass: [{ elements: [el('ENT-001', 'ENT', { text: 'The AeroLink service enterprise, bounded for waiting time.' })], links: [] }, ctx()],
    expectElement: 'ENT-001',
  },
  'w1-ext-exchange': {
    fail: [{ elements: [el('EXT-001', 'EXT', { attributes: {} })], links: [] }, ctx()],
    pass: [{ elements: [el('EXT-001', 'EXT', { attributes: { exchange: 'power' } }), el('EXT-002', 'EXT', { text: 'Supplies power to vertiport chargers.' })], links: [] }, ctx()],
    expectElement: 'EXT-001',
  },
  'w1-boundary-open': {
    fail: [EMPTY, ctx({ boundary: { b1: 'inside' } })],
    pass: [EMPTY, ctx({ boundary: { b1: 'inside', b2: 'inside', b3: 'inside', b4: 'inside', b5: 'environment', b6: 'environment', b7: 'environment', b8: 'irrelevant', b9: 'environment' } })],
  },
}

describe('problems engine: every rule has a failing and a passing fixture', () => {
  it('covers every core and Week 1 rule', () => {
    expect(Object.keys(FIXTURES).sort()).toEqual(ALL.map((r) => r.id).sort())
  })
  for (const [id, f] of Object.entries(FIXTURES)) {
    it(`${id}: fails on the bad fixture, passes on the good one`, () => {
      const bad = run(id, ...f.fail)
      expect(bad.length, `${id} should report a problem`).toBeGreaterThan(0)
      for (const p of bad) {
        expect(p.ruleId).toBe(id)
        expect(p.hint.length).toBeGreaterThan(10)
      }
      if (f.expectElement) expect(bad[0].elementId).toBe(f.expectElement)
      expect(run(id, ...f.pass)).toEqual([])
    })
  }
})

describe('runRules', () => {
  it('applies a rule only from its first week', () => {
    const stk = ctx({ stakeholders: SEED_STAKEHOLDERS.slice(0, 3) })
    expect(runRules(ALL, EMPTY, stk).some((p) => p.ruleId === 'stakeholder-map')).toBe(false)
    expect(runRules(ALL, EMPTY, { ...stk, week: 2 }).some((p) => p.ruleId === 'stakeholder-map')).toBe(true)
  })
  it('sorts errors first and reports the worst severity per element', () => {
    const m: EngineeringModel = { elements: [el('EXT-001', 'EXT', { owner: '', attributes: {} }), el('EXT-001', 'EXT')], links: [] }
    const ps = runRules(ALL, m, ctx())
    expect(ps[0].severity).toBe('error')
    expect(worstByElement(ps)['EXT-001']).toBe('error')
    const c = countBySeverity(ps)
    expect(c.error + c.warning + c.info).toBe(ps.length)
    expect(new Set(ps.map(problemKey)).size).toBeGreaterThan(1)
  })
  it('the instructor reference baseline for Week 1 raises no problem', () => {
    expect(runRules(ALL, referenceUpTo(1), ctx())).toEqual([])
  })
  it('a full, correct Week 1 student model raises no problem', () => {
    const m: EngineeringModel = {
      elements: [el('ENT-001', 'ENT', { text: 'AeroLink service enterprise.' }), ...[1, 2, 3, 4, 5, 6].map((i) => el(`EXT-00${i}`, 'EXT', { attributes: { exchange: 'data' } }))],
      links: [],
    }
    const c = withLoops(
      loop({}),
      loop({ id: 'LOOP-002', vars: [{ ref: 'riders', label: '' }, { ref: 'demand', label: '' }, { ref: 'util', label: '' }, { ref: 'wait', label: '' }, { ref: 'attract', label: '' }, { ref: 'churn', label: '' }], polarities: ['+', '+', '+', '−', '−', '−'], declared: 'Balancing' }),
    )
    expect(runRules(ALL, m, c)).toEqual([])
  })
})
