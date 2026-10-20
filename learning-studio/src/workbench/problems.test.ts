// Problems engine: every rule has a failing and a passing fixture, and the instructor reference passes every rule
// that applies in its week (AUTHORING_GUIDE §7.4: reference examples must pass our own checks).
import { describe, expect, it } from 'vitest'
import week1 from '../content/missions/week01'
import { INSTRUCTOR_EXAMPLE, SEED_STAKEHOLDERS, type Relationship } from '../model/airtaxi'
import type { Element, EngineeringModel } from '../model/engineering'
import { referenceUpTo } from '../model/reference'
import { CORE_RULES, countBySeverity, problemKey, runRules, worstByElement, type Rule, type RuleCtx } from './problems'
import { EMPTY_NEED_ROW, EMPTY_TEAM, TEAM_KEY, type StakeholderRow, type TeamRecord } from './week1/team'

const el = (id: string, kind: Element['kind'], extra: Partial<Element> = {}): Element => ({ id, kind, name: id, provenance: 'team-derived', owner: 'JS', status: 'active', ...extra })
const EMPTY: EngineeringModel = { elements: [], links: [] }
const ctx = (p: Partial<RuleCtx> = {}): RuleCtx => ({ week: 1, artefacts: {}, boundary: {}, stakeholders: SEED_STAKEHOLDERS.map((s) => ({ ...s })), relationships: [], ...p })
const stk = (id: string, p: Partial<StakeholderRow> = {}): StakeholderRow => ({ id, name: `Stakeholder ${id}`, role: 'public', stage: 'Operation', side: 'external', approving: 'no', concerns: [{ id: id.replace('STK', 'CON'), text: 'Residents beside the depot are woken by engines before 6 a.m.' }], influence: '3', reason: 'can object through planning', ...p })
const withTeam = (p: Partial<TeamRecord>) => ctx({ artefacts: { [TEAM_KEY]: { ...EMPTY_TEAM, ...p } } })

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
  'w1-team-aerolink': {
    fail: [EMPTY, withTeam({ proposal: { ...EMPTY_TEAM.proposal, name: 'AeroLink vertiport network' } })],
    pass: [EMPTY, withTeam({ proposal: { ...EMPTY_TEAM.proposal, name: 'Riverside food bank network' } })],
    expectElement: 'team:proposal',
  },
  'w1-team-concern': {
    fail: [EMPTY, withTeam({ stakeholders: [stk('STK-001', { concerns: [{ id: 'CON-001', text: 'They care a great deal about noise and safety' }] })] })],
    pass: [EMPTY, withTeam({ stakeholders: [stk('STK-001')] })],
    expectElement: 'team:STK-001',
  },
  'w1-team-trace': {
    fail: [EMPTY, withTeam({ stakeholders: [stk('STK-001')], needs: [{ ...EMPTY_NEED_ROW('NEED-001'), name: 'n', text: 'Residents need quiet nights at all operating hours.', conditions: '', rationale: 'sleep matters to the residents here', sources: 'STK-009' }] })],
    pass: [EMPTY, withTeam({ stakeholders: [stk('STK-001')], needs: [{ ...EMPTY_NEED_ROW('NEED-001'), name: 'n', text: 'Residents need quiet nights at all operating hours.', conditions: '', rationale: 'sleep matters to the residents here', sources: 'STK-001' }] })],
    expectElement: 'team:NEED-001',
  },
  'w1-team-authority': {
    fail: [EMPTY, withTeam({ stakeholders: [stk('STK-001'), stk('STK-002'), stk('STK-003')] })],
    pass: [EMPTY, withTeam({ stakeholders: [stk('STK-001'), stk('STK-002', { approving: 'yes', role: 'authority' }), stk('STK-003')] })],
    expectElement: 'team:register',
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
  it('a full, correct Week 1 student model and team record raise no problem', () => {
    const m: EngineeringModel = {
      elements: [el('ENT-001', 'ENT', { text: 'AeroLink service enterprise.' }), ...[1, 2, 3, 4, 5, 6].map((i) => el(`EXT-00${i}`, 'EXT', { attributes: { exchange: 'data' } }))],
      links: [],
    }
    const c = withTeam({
      proposal: { ...EMPTY_TEAM.proposal, name: 'Riverside food bank network' },
      stakeholders: [stk('STK-001'), stk('STK-002', { approving: 'yes', role: 'authority' }), stk('STK-003')],
      needs: [{ ...EMPTY_NEED_ROW('NEED-001'), name: 'n', text: 'Residents need quiet nights at all operating hours.', conditions: '', rationale: 'sleep matters to the residents here', sources: 'STK-001' }],
    })
    expect(runRules(ALL, m, c)).toEqual([])
  })
})
