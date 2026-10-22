// Week 10 lab tool state, both directions: a complete fixture state is ready to submit, and each readiness item fails on
// its own, with the reason the student reads (missing file, another team's file, a defect, a function without a
// performer, a scenario without a decision or item flow, too few states, an unreachable state, no exhibitor, an empty
// or "fixed" disposition, an incomplete checklist, multi-word empty notes, no AI statement, a stale export). New
// function and item IDs are never reused, across a removal and a workspace round trip; a stored state is normalized
// without throwing; the review file carries its tables. Uses the fictional food bank fixture, never AeroLink.
import { describe, expect, it } from 'vitest'
import { REVIEW_CHECKS } from '../../content/lectures/week10/labBrief'
import { fixture9 } from '../week9/generated'
import { FIXTURE10_CHOICES, FIXTURE_WEEK2_JSON, FIXTURE_WEEK4_JSON } from './generated'
import { archFromWeek4, findingKey, needsDisposition, opsFromWeek2, readWeek2For10, readWeek4For10 } from './behavior'
import { EMPTY_STATE, derive, importWorkspace, nextFnId, nextInfoId, normalizeState, readiness, reviewMarkdown, reviewProblem, withNewFn, withNewItem, workspaceJson, type W10State } from './state'

function fixtureState(): W10State {
  const a = readWeek4For10(FIXTURE_WEEK4_JSON)
  const b = readWeek2For10(FIXTURE_WEEK2_JSON)
  if ('error' in a || 'error' in b) throw new Error('fixture must import')
  const s: W10State = {
    ...EMPTY_STATE,
    w9: { text: fixture9().model.text, origin: 'team-07-model-v02.sysml' },
    w4: { ...archFromWeek4(a.record), origin: 'team-07 Week 4' },
    w2: { ...opsFromWeek2(b.record), origin: 'team-07 Week 2' },
    choices: FIXTURE10_CHOICES,
    issued: { FN: 11, INFO: 6 },
    aiStatement: 'We asked an AI tool to list scenario steps without a function; we kept one finding (FN-011) and rejected two.',
  }
  for (const f of derive(s)!.findings.filter(needsDisposition)) s.dispositions[findingKey(f)] = `Open item: JS settles ${f.id} in Week 11`
  s.review = Object.fromEntries(REVIEW_CHECKS.map((c) => [c.id, { result: 'meets' as const, note: 'Checked against the ConOps' }]))
  s.updatedAt = 1
  s.exportedSysmlAt = 2
  s.exportedMdAt = 2
  return s
}
const item = (s: W10State, id: string) => readiness(s).items.find((i) => i.id === id)!

describe('Week 10 readiness', () => {
  it('the complete fixture state is ready to submit', () => {
    const r = readiness(fixtureState())
    expect(r.items.filter((i) => !i.ok).map((i) => `${i.id}: ${i.detail}`)).toEqual([])
    expect(r.ready).toBe(true)
  })
  it('nothing imported: three files to import, each with what to do', () => {
    const r = readiness(EMPTY_STATE)
    expect(r.ready).toBe(false)
    expect(r.items.map((i) => i.id)).toEqual(['week9', 'week4', 'week2', 'match'])
    expect(item(EMPTY_STATE, 'week9').detail).toMatch(/model v0\.2 file \(\.sysml\)/)
  })
  it('another team’s Week 2 file, or another enterprise, is reported as a mismatch', () => {
    const s = fixtureState()
    s.w2 = { ...s.w2!, team: '12' }
    expect(item(s, 'match')).toMatchObject({ ok: false, detail: expect.stringMatching(/team 07 and the Week 2 file from team 12/) })
    const t = fixtureState()
    t.w2 = { ...t.w2!, enterprise: 'Hilltop Clinic' }
    expect(item(t, 'match').ok).toBe(false)
  })
  it('a defect and a function without a performer each fail with the ID named', () => {
    const s = fixtureState()
    s.choices = { ...s.choices, fn: { ...s.choices.fn, 'FN-001': { ...s.choices.fn['FN-001'], inputs: 'INFO-099' } } }
    expect(item(s, 'defects')).toMatchObject({ ok: false, detail: expect.stringMatching(/FN-001/) })
    const t = fixtureState()
    t.w4 = { ...t.w4!, functions: t.w4!.functions.map((f) => (f.id === 'FN-002' ? { ...f, log: '' } : f)) }
    expect(item(t, 'performers')).toMatchObject({ ok: false, detail: expect.stringMatching(/FN-002/) })
  })
  it('no scenario, or a scenario without an alternate, leaves the flow item open', () => {
    const s = fixtureState()
    s.choices = { ...s.choices, scenario: '' }
    expect(item(s, 'flow')).toMatchObject({ ok: false, detail: expect.stringMatching(/chooses the scenario with the most alternates/) })
    const t = fixtureState()
    t.w2 = { ...t.w2!, scenarios: t.w2!.scenarios.map((x) => (x.id === 'SCN-002' ? { ...x, alternates: [] } : x)) }
    expect(item(t, 'flow')).toMatchObject({ ok: false, detail: expect.stringMatching(/no decision/) })
  })
  it('too few states, an unreachable state and no exhibitor each fail', () => {
    const m = FIXTURE10_CHOICES.machine
    const s = fixtureState()
    s.choices = { ...s.choices, machine: { ...m, transitions: m.transitions.slice(0, 3) } }
    expect(item(s, 'states').ok).toBe(false)
    const t = fixtureState()
    t.choices = { ...t.choices, machine: { ...m, states: [...m.states, { name: 'defrosting', entry: '', do: '', doc: '' }] } }
    expect(item(t, 'reachable')).toMatchObject({ ok: false, detail: expect.stringMatching(/defrosting/) })
    const u = fixtureState()
    u.choices = { ...u.choices, machine: { ...m, exhibitor: '' } }
    expect(item(u, 'exhibited').ok).toBe(false)
  })
  it('an empty disposition and a claimed fix both leave the dispositions item open; a short plan closes it', () => {
    const s = fixtureState()
    const f = derive(s)!.findings.find((x) => x.code === 'fn-no-items')!
    for (const bad of ['n/a', 'none none', 'Fixed in the Week 4 record']) {
      s.dispositions[findingKey(f)] = bad
      expect(item(s, 'dispositions').ok, bad).toBe(false)
    }
    s.dispositions[findingKey(f)] = 'Kept: a planning function'
    expect(item(s, 'dispositions').ok).toBe(true)
  })
  it('the review checklist needs a result and a real note; multi-word empties are refused and a short note is accepted', () => {
    const s = fixtureState()
    s.review = { ...s.review, steps: { result: '', note: 'checked' } }
    expect(item(s, 'review').ok).toBe(false)
    for (const v of ['none none', 'n/a todo', 'tbd, later', 'n/a']) expect(reviewProblem({ result: 'meets', note: v }), v).toMatch(/not a check/)
    for (const v of ['none none', 'tbd, later']) expect(reviewProblem({ result: 'finding', note: v }), v).toMatch(/not a finding/)
    for (const v of ['checked', 'Step 3 missing', 'OK by AK on day 6']) expect(reviewProblem({ result: 'meets', note: v }), v).toBeNull()
    s.review = { ...s.review, steps: { result: 'meets', note: 'checked' } }
    expect(item(s, 'review').ok).toBe(true)
  })
  it('an empty or empty-word AI statement fails; a sentence passes', () => {
    const s = fixtureState()
    for (const v of ['', 'none', 'n/a n/a']) {
      s.aiStatement = v
      expect(item(s, 'ai').ok, v).toBe(false)
    }
    s.aiStatement = 'No AI tool was used.'
    expect(item(s, 'ai').ok).toBe(true)
  })
  it('a change after the last export leaves the exports item open', () => {
    const s = fixtureState()
    s.updatedAt = 3
    expect(item(s, 'exports').ok).toBe(false)
  })
})

describe('Week 10 state files and IDs', () => {
  it('new function and item IDs continue after the highest and are never reused, after a removal or a workspace round trip', () => {
    const s = fixtureState()
    expect(nextFnId(s)).toBe('FN-012')
    expect(nextInfoId(s)).toBe('INFO-007')
    const added = withNewItem(withNewFn(s), 'information')
    expect(added.choices.newFns.at(-1)!.id).toBe('FN-012')
    expect(added.choices.newItems.at(-1)!.id).toBe('INFO-007')
    const removed = { ...added, choices: { ...added.choices, newFns: added.choices.newFns.slice(0, -1), newItems: added.choices.newItems.slice(0, -1) } }
    expect(nextFnId(removed)).toBe('FN-013')
    expect(nextInfoId(removed)).toBe('INFO-008')
    const back = importWorkspace(workspaceJson(removed))
    if ('error' in back) throw new Error(back.error)
    expect(nextFnId(back)).toBe('FN-013')
    expect(withNewItem(s, 'energy').choices.newItems.at(-1)).toEqual({ id: '', name: '', kind: 'energy' })
    expect(normalizeState({ choices: { newFns: [{ id: 'FN-040', name: 'x' }] } }).issued.FN).toBe(40)
  })
  it('a stored state is normalized without throwing; a wrong workspace file is refused with a reason', () => {
    expect(() => normalizeState('garbage')).not.toThrow()
    expect(() => normalizeState({ w4: { functions: 'x' }, w2: { scenarios: [{ id: 'SCN-001', steps: 'bad' }] }, choices: { machine: 5 } })).not.toThrow()
    expect(normalizeState({ review: { steps: { result: 'maybe', note: 3 }, bogus: {} } }).review).toEqual({ steps: { result: '', note: '3' } })
    expect(normalizeState({ choices: { newItems: [{ id: 'X-1', name: 'a', kind: 'gas' }] } }).choices.newItems).toEqual([{ id: '', name: 'a', kind: 'information' }])
    expect(importWorkspace('{"format":"week9-requirements","version":1}')).toEqual({ error: expect.stringMatching(/not a Week 10 workspace/) })
    expect(importWorkspace('{"format":"week10-behavior","version":2,"state":{}}')).toEqual({ error: expect.stringMatching(/version 2/) })
    expect(importWorkspace('not json')).toEqual({ error: expect.stringMatching(/not valid JSON/) })
  })
  it('the review file carries the mapping, functions, allocation, transitions, cross-check, audit, checklist and statement', () => {
    const md = reviewMarkdown(fixtureState(), '2026-10-22')
    expect(md).toContain('# team-07: logical architecture and behavior review (Week 10)')
    for (const h of ['## Scenario mapping table', '## Functions', '## Allocation matrix', '## State transition table', '### Cross-check', '## Behavior audit', '## Review checklist', '## AI usage statement', '## The course mapping used']) expect(md).toContain(h)
    expect(md).toContain('| step 3: Acknowledges the alarm and travels to the warehouse. | acknowledgeAndTravel | action (no function) |')
    expect(md).toContain('| alarmRaisedToStockInBackup | alarmRaised | StaffArrived | backupFreezerAvailable | stockInBackup |')
    expect(md).toMatch(/Course acceptance checks only/)
    expect(reviewMarkdown(EMPTY_STATE)).toMatch(/Not ready/)
  })
})
