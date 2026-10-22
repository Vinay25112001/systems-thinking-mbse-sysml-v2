// Week 11 lab tool state, both directions: normalization never throws and drops junk; a complete fixture state is ready
// and each readiness item can fail on its own; new information-item IDs are issued once and never reused after a removal;
// the interface review carries every section; the workspace round-trips and a wrong file is refused; a mismatch between
// the two files is reported. Fictional food bank fixture, never AeroLink.
import { describe, expect, it } from 'vitest'
import { REVIEW_CHECKS } from '../../content/lectures/week11/labBrief'
import { fixture10 } from '../week10/generated'
import { FIXTURE11_CHOICES, FIXTURE_WEEK5_JSON, physOf } from './generated'
import { findingKey, needsDisposition } from './physical'
import { EMPTY_STATE, derive, flowsOf, importWorkspace, mismatch, nextItemId, normalizeState, readiness, reviewFileName, reviewMarkdown, sysmlFileName, withNewItem, workspaceJson, type W11State } from './state'

function complete(): W11State {
  const base: W11State = { ...EMPTY_STATE, w10: { text: fixture10().model.text, origin: 'team-07-model-v03.sysml' }, w5: { ...physOf(FIXTURE_WEEK5_JSON), origin: 'team-07-week5.json' }, choices: FIXTURE11_CHOICES }
  const d = derive(base)!
  const dispositions = Object.fromEntries(d.findings.filter(needsDisposition).map((f) => [findingKey(f), 'Open item: Week 12, owner AK']))
  const review = Object.fromEntries(REVIEW_CHECKS.map((c) => [c.id, { result: 'meets' as const, note: 'checked by AK' }]))
  return { ...base, dispositions, review, aiStatement: 'No AI tool was used this week.', updatedAt: 1, exportedSysmlAt: 2, exportedMdAt: 2 }
}

describe('Week 11 state', () => {
  it('normalization never throws and keeps only known fields', () => {
    for (const junk of [null, 42, 'x', [], { choices: 'x', review: { bogus: { result: 'meets', note: 'a' } }, issued: { INFO: -3 } }]) {
      const s = normalizeState(junk)
      expect(s.choices.newItems).toEqual([])
      expect(s.review).toEqual({})
      expect(s.issued.INFO).toBeGreaterThanOrEqual(0)
    }
    const s = normalizeState({ choices: { newItems: [{ id: 'INFO-031', name: 'x', kind: 'nonsense' }], flows: { 'IF-001': [{ item: 'a', dir: 'sideways' }] } } })
    expect(s.choices.newItems[0].kind).toBe('information')
    expect(s.choices.flows['IF-001'][0].dir).toBe('AtoB')
    expect(s.issued.INFO).toBe(31)
    // requirement allocation rows: an array keeps stable row numbers; a stored record of the earlier form becomes rows
    expect(normalizeState({ choices: { reqParts: { 'REQ-STK-001': 'PHY-002', 'REQ-STK-002': 'PHY-005' } } }).choices.reqParts).toEqual([{ row: 1, req: 'REQ-STK-001', els: 'PHY-002' }, { row: 2, req: 'REQ-STK-002', els: 'PHY-005' }])
    expect(normalizeState({ choices: { reqParts: [{ req: 'REQ-STK-001', els: 'PHY-002' }, { req: 'REQ-STK-001', els: 'PHY-005' }] } }).choices.reqParts).toHaveLength(2)
  })
  it('a complete fixture state is ready to submit', () => {
    const r = readiness(complete())
    expect(r.items.filter((x) => !x.ok)).toEqual([])
    expect(r.ready).toBe(true)
  })
  it('each readiness item fails on its own: a missing disposition, an assumed direction, a claim without basis, the review, the AI statement, a stale export', () => {
    const s = complete()
    const firstKey = Object.keys(s.dispositions)[0]
    const fail = (t: W11State, id: string) => expect(readiness(t).items.find((x) => x.id === id)!.ok, id).toBe(false)
    fail({ ...s, dispositions: { ...s.dispositions, [firstKey]: 'n/a' } }, 'dispositions')
    const noRows = { ...s.choices.flows }
    delete noRows['IF-003']
    fail({ ...s, choices: { ...s.choices, flows: noRows } }, 'directions')
    fail({ ...s, choices: { ...s.choices, satisfy: [{ ...s.choices.satisfy[0], basis: 'none' }, s.choices.satisfy[1]] } }, 'satisfy')
    fail({ ...s, review: { ...s.review, flows: { result: 'meets', note: 'none none' } } }, 'review')
    fail({ ...s, aiStatement: 'n/a' }, 'ai')
    fail({ ...s, updatedAt: 5 }, 'exports')
    const reqFns = { ...s.choices.reqFns }
    delete reqFns['REQ-SYS-005']
    expect(readiness({ ...s, choices: { ...s.choices, reqFns } }).ready).toBe(false)
  })
  it('a new information item takes the next ID once; removing it does not free the ID', () => {
    const s = complete()
    const id = nextItemId(s)
    const a = withNewItem(s, 'information')
    expect(a.choices.newItems.at(-1)!.id).toBe(id)
    const removed = { ...a, choices: { ...a.choices, newItems: a.choices.newItems.slice(0, -1) } }
    expect(nextItemId(removed)).not.toBe(id)
    expect(withNewItem(s, 'load').choices.newItems.at(-1)).toEqual({ id: '', name: '', kind: 'load' })
  })
  it('the crossings shown are the team’s rows once set, else the computed ones', () => {
    const s = complete()
    expect(flowsOf(s, 'IF-005')).toMatchObject({ set: true })
    expect(flowsOf({ ...s, choices: { ...s.choices, flows: {} } }, 'IF-001')).toMatchObject({ set: false, rows: [{ item: 'INFO-001', dir: 'AtoB' }] })
  })
  it('the interface review carries every section and the file names follow the team', () => {
    const md = reviewMarkdown(complete(), '2026-10-22')
    for (const h of ['## Physical elements', '## Allocation matrix', '## Interfaces', '## Requirement allocations written this week', '## Satisfy claims', '## Audit: findings and dispositions', '## Review checklist', '## AI usage statement', '## The course mapping used']) expect(md).toContain(h)
    expect(md).toContain('REQ-SYS-003 | PHY-002 | cargoTemperature')
    expect(sysmlFileName(complete())).toBe('team-07-model-v04.sysml')
    expect(reviewFileName(complete())).toBe('team-07-interface-review.md')
    expect(reviewMarkdown(EMPTY_STATE)).toMatch(/Not ready/)
  })
  it('the workspace round-trips; another file is refused with a reason', () => {
    const s = complete()
    const back = importWorkspace(workspaceJson(s))
    expect('error' in back).toBe(false)
    expect((back as W11State).choices.satisfy).toEqual(s.choices.satisfy)
    expect(importWorkspace('{"format":"week10-behavior","version":1}')).toMatchObject({ error: expect.stringMatching(/not a Week 11 workspace/) })
    expect(importWorkspace('nope')).toMatchObject({ error: expect.stringMatching(/not valid JSON/) })
  })
  it('a Week 5 file of another enterprise is reported as a mismatch', () => {
    const s = complete()
    expect(mismatch(s)).toBeNull()
    expect(mismatch({ ...s, w5: { ...s.w5!, enterprise: 'Another Network' } })).toMatch(/import your own team’s files/)
  })
})
