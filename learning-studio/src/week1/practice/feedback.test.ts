// Guided Practice feedback logic (M5, spec §e.3 GP-20): compared items are counted, never scored; completion depends on
// attempting and reading, never on agreeing; structural checks speak of the course check, never of correctness.
import { describe, expect, it } from 'vitest'
import { compareStep, compareSummary, runCheck, SCORING_WORDS, setAck, setAnswer, structuralLine, taskState } from './feedback'
import { EMPTY_COMPARED, emptyPractice, type Compared } from './store'
import * as T from './tasks'

const items = [{ id: 'a', key: 'x' }, { id: 'b', key: 'y' }]

describe('compared reading (no score)', () => {
  it('needs every item answered and a check; feedback is about the checked answers', () => {
    let c: Compared = { ...EMPTY_COMPARED }
    expect(compareStep(items, c).touched).toBe(false)
    c = setAnswer(c, 'a', 'x')
    expect(compareStep(items, c)).toMatchObject({ touched: true, checked: false, complete: false })
    c = runCheck(setAnswer(c, 'b', 'z'), 10)
    const r = compareStep(items, c)
    expect(r).toMatchObject({ checked: true, agree: 1, differ: 1, open: 1, complete: false })
    // completion by acknowledging the difference, without agreeing
    expect(compareStep(items, setAck(c, 'b', true)).complete).toBe(true)
    // or by changing the answer and checking again
    const changed = setAnswer(c, 'b', 'y')
    expect(compareStep(items, changed)).toMatchObject({ stale: true, complete: false })
    expect(compareStep(items, runCheck(changed)).complete).toBe(true)
  })

  it('a changed answer clears its acknowledgement at the next check (a new difference is read again)', () => {
    let c = runCheck(setAnswer(setAnswer({ ...EMPTY_COMPARED }, 'a', 'x'), 'b', 'z'))
    c = setAck(c, 'b', true)
    c = runCheck(setAnswer(c, 'b', 'w'))
    expect(compareStep(items, c).open).toBe(1)
  })

  it('the summary counts agreement and difference, never a score, a percentage or "wrong"', () => {
    for (const r of [{ agree: 4, differ: 2, open: 2 }, { agree: 6, differ: 0, open: 0 }, { agree: 0, differ: 6, open: 0 }]) {
      const line = compareSummary(r)
      expect(line).toMatch(/agree · \d+ differ/)
      expect(line).not.toMatch(SCORING_WORDS)
    }
  })

  it('structural lines say "course check", never correct', () => {
    expect(structuralLine({ ok: true, issues: [] })).toBe('Passes the course check')
    expect(structuralLine({ ok: false, issues: ['name the variable.'] })).toBe('Does not pass yet: name the variable.')
  })

  it('task state words: Not started, In progress, Attempted', () => {
    expect(taskState([{ touched: false, complete: false }])).toBe('not-started')
    expect(taskState([{ touched: true, complete: false }, { touched: false, complete: false }])).toBe('in-progress')
    expect(taskState([{ touched: true, complete: true }])).toBe('attempted')
  })
})

describe('task content (spec §e.2)', () => {
  it('six tasks, 96 minutes, every judgment item has the instructor’s reasoning', () => {
    expect(T.TASKS.map((t) => t.code)).toEqual(['GP-1', 'GP-2', 'GP-3', 'GP-4', 'GP-5', 'GP-6'])
    expect(T.PRACTICE_MINUTES).toBe(96)
    for (const i of T.GP1_ITEMS) expect(T.gp1Candidate(i.id).why.length).toBeGreaterThan(20)
    for (const i of T.GP2_ITEMS) expect(T.gp2Item(i.id).why.length).toBeGreaterThan(20)
    for (const i of T.GP3_ITEMS) expect(T.gp3Row(i.id).why.length).toBeGreaterThan(20)
    for (const p of T.GP4_PAIRS) expect(p.why.length).toBeGreaterThan(20)
    for (const n of T.GP6_NEEDS) expect(n.why.length).toBeGreaterThan(20)
  })

  it('GP-4 key is the case: REL types, the REL-002 conflict on CON-012 vs CON-006 and its shared variable', () => {
    expect(T.GP4_PAIRS.map((p) => [p.id, p.type])).toEqual([['REL-003', 'supplies'], ['REL-001', 'regulates'], ['REL-007', 'affected-by'], ['REL-005', 'coordinates-with'], ['REL-008', 'partners-with']])
    expect(T.CONFLICT_CASE).toEqual({ pair: 'STK-004|STK-005', concerns: ['CON-012', 'CON-006'], variable: 'take-offs and landings per pad in the evening and early-morning hours' })
    const s = emptyPractice().tasks['gp-4']
    const ok = { ...s, conflict: { pair: 'STK-004|STK-005', concerns: ['CON-006', 'CON-012'], variable: 'evening take-offs per pad' } }
    expect(T.gp4ConflictCheck(ok).ok).toBe(true)
    expect(T.gp4ConflictAgrees(ok)).toBe(true)
    // a defensible different pair passes the structural check and is compared, not failed
    const other = { ...s, conflict: { pair: 'STK-010|STK-003', concerns: ['CON-011', 'CON-005'], variable: 'charging load at each vertiport' } }
    expect(T.gp4ConflictCheck(other).ok).toBe(true)
    expect(T.gp4ConflictAgrees(other)).toBe(false)
    expect(T.gp4ConflictCheck({ ...s, conflict: { pair: 'STK-004|STK-005', concerns: ['CON-001', 'CON-006'], variable: 'x y z' } }).ok).toBe(false)
  })

  it('GP-4 step 3: "Insurers: safety" does not pass; a specific rewrite does', () => {
    const s = emptyPractice().tasks['gp-4']
    expect(T.gp4GenericCheck({ ...s, generic: 'Insurers: safety' }).ok).toBe(false)
    expect(T.gp4GenericCheck({ ...s, generic: 'Insurers want incident and loss data recorded on every flight so that premiums can be set on evidence.' }).ok).toBe(true)
  })

  it('GP-6: the deliberate gap is the aircraft manufacturer; needs link to the case objectives', () => {
    expect(T.GAP_STAKEHOLDERS).toEqual(['STK-011'])
    expect(T.GP6_ITEMS.map((i) => i.key)).toEqual(['MGO-002', 'MGO-003', 'MGO-002', 'MGO-009', 'MGO-004', 'MGO-003'])
    expect(T.OBJECTIVE_OPTIONS.map((o) => o.label.split(' ')[0])).toEqual(['Mission', 'Objective', 'Objective', 'Objective', 'Objective'])
  })

  it('GP-2 step 3 needs a stated exchange and a direction for each external system (structural)', () => {
    const s = emptyPractice().tasks['gp-2']
    expect(T.gp2Exchanges(s).ok).toBe(false)
    const full = { ...s, exchanges: Object.fromEntries(T.GP2_EXTERNALS.map((e) => [e.id, { text: 'clearances and power', direction: e.direction }])) }
    expect(T.gp2Exchanges(full).ok).toBe(true)
  })

  it('completion never depends on agreement: every task can be attempted with every judgment differing', () => {
    const s = emptyPractice().tasks
    const all = (ids: { id: string }[], v: string) => ({ answers: Object.fromEntries(ids.map((i) => [i.id, v])), ack: Object.fromEntries(ids.map((i) => [i.id, true])) })
    const g1 = { ...s['gp-1'], prediction: { value: 'enough', at: 1 }, identify: runCheck(all(T.GP1_ITEMS, 'no')), match: { value: 'matched', at: 2 } }
    g1.identify.ack = Object.fromEntries(T.GP1_ITEMS.map((i) => [i.id, true]))
    expect(Object.values(T.gp1Steps(g1 as never)).every((x) => x.complete)).toBe(true)
    const g6 = { ...s['gp-6'], links: { ...runCheck(all(T.GP6_ITEMS, 'MGO-001')), ack: Object.fromEntries(T.GP6_ITEMS.map((i) => [i.id, true])) }, gap: { stakeholder: 'STK-001', decision: 'add' as const, reason: 'Passengers seem uncovered to me in this matrix reading.' }, gapCheckedAt: 3 }
    expect(Object.values(T.gp6Steps(g6)).every((x) => x.complete)).toBe(true)
  })

  it('plain() removes register citations and lesson pointers from reused checker text', () => {
    expect(T.plain('No “shall” (R11 p.555).')).toBe('No “shall”.')
    expect(T.plain('because R53 p.296 asks for the complete, end-to-end need.')).toBe('because a need states the complete, end-to-end need.')
    expect(T.plain('An approving authority (L5).')).toBe('An approving authority.')
  })
})
