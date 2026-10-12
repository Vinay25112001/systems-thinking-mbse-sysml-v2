// Changes & impact: the diff of derived state before and after a change.
import { describe, expect, it } from 'vitest'
import type { EngineeringModel } from '../model/engineering'
import { diffSnapshots, elementSignatures, isEmptyImpact, modelMetrics, shouldCoalesce, summarise, type ChangeRecord, type Snapshot } from './changes'
import type { Problem } from './problems'

const p = (elementId: string, message: string, severity: Problem['severity'] = 'warning'): Problem => ({ ruleId: 'r', severity, elementId, message, hint: 'h' })
const snap = (s: Partial<Snapshot>): Snapshot => ({ entities: {}, problems: [], metrics: {}, steps: {}, stepLabels: {}, ...s })

describe('impact diff', () => {
  const before = snap({
    entities: { 'EXT-001': 'a', 'EXT-002': 'b', 'LOOP-001': 'x' },
    problems: [p('EXT-002', 'EXT-002 has no labelled exchange'), p('LOOP-001', 'LOOP-001 has no owner initials')],
    metrics: { 'EXT elements': 2, Links: 0 },
    steps: { 'm/a': false, 'm/b': true },
    stepLabels: { 'm/a': 'Mission 1 step 1', 'm/b': 'Mission 1 step 2' },
  })
  it('reports added, changed and removed elements, problems added and cleared, moved metrics and steps', () => {
    const after = snap({
      entities: { 'EXT-001': 'a', 'EXT-002': 'b2', 'EXT-003': 'c' },
      problems: [p('LOOP-001', 'LOOP-001 has no owner initials'), p('EXT-003', 'EXT-003 has no owner initials')],
      metrics: { 'EXT elements': 3, Links: 0 },
      steps: { 'm/a': true, 'm/b': false },
      stepLabels: before.stepLabels,
    })
    const i = diffSnapshots(before, after)
    expect(i.added).toEqual(['EXT-003'])
    expect(i.changed).toEqual(['EXT-002'])
    expect(i.removed).toEqual(['LOOP-001'])
    expect(i.problemsAdded.map((x) => x.elementId)).toEqual(['EXT-003'])
    expect(i.problemsCleared.map((x) => x.elementId)).toEqual(['EXT-002'])
    expect(i.metrics).toEqual([{ label: 'EXT elements', before: 2, after: 3 }])
    expect(i.stepsNowPassing).toEqual(['Mission 1 step 1'])
    expect(i.stepsNowFailing).toEqual(['Mission 1 step 2'])
    // affected = touched elements plus elements whose problems moved (they are highlighted briefly)
    expect(new Set(i.affected)).toEqual(new Set(['EXT-003', 'EXT-002']))
    expect(summarise(i)).toBe('Added EXT-003 · Updated EXT-002 · Removed LOOP-001')
  })
  it('an identical snapshot has no impact; a metric-only change does', () => {
    expect(isEmptyImpact(diffSnapshots(before, before))).toBe(true)
    expect(isEmptyImpact(diffSnapshots(before, { ...before, metrics: { ...before.metrics, Links: 1 } }))).toBe(false)
  })
  it('the same problem text on another element is a different problem', () => {
    const a = snap({ problems: [p('EXT-001', 'no owner')] })
    const b = snap({ problems: [p('EXT-002', 'no owner')] })
    const i = diffSnapshots(a, b)
    expect(i.problemsAdded).toHaveLength(1)
    expect(i.problemsCleared).toHaveLength(1)
  })
})

describe('coalescing and signatures', () => {
  const rec = (ids: string[], at: number): ChangeRecord => ({ id: 1, at, ids, summary: '', before: snap({}), impact: diffSnapshots(snap({}), snap({})) })
  it('typing into one element within the window is one change; another element or a pause is a new one', () => {
    expect(shouldCoalesce(rec(['EXT-001'], 1000), ['EXT-001'], 3000)).toBe(true)
    expect(shouldCoalesce(rec(['EXT-001'], 1000), ['EXT-002'], 3000)).toBe(false)
    expect(shouldCoalesce(rec(['EXT-001'], 1000), ['EXT-001'], 9000)).toBe(false)
    expect(shouldCoalesce(undefined, ['EXT-001'], 1)).toBe(false)
    // an undo or redo is always its own entry: typing right after it starts a new, separately undoable change
    expect(shouldCoalesce({ ...rec(['EXT-001'], 1000), op: 'undo' }, ['EXT-001'], 2000)).toBe(false)
    expect(shouldCoalesce({ ...rec(['EXT-001'], 1000), op: 'redo' }, ['EXT-001'], 2000)).toBe(false)
    expect(shouldCoalesce({ ...rec(['EXT-001'], 1000), op: 'edit' }, ['EXT-001'], 2000)).toBe(true)
    expect(shouldCoalesce(rec([], 1000), [], 1001)).toBe(false)
  })
  it('a creation is never merged with the edit that follows it', () => {
    const created = { ...rec(['EXT-001'], 1000), impact: { ...rec([], 0).impact, added: ['EXT-001'] } }
    expect(shouldCoalesce(created, ['EXT-001'], 2000)).toBe(false)
    const edit = rec(['EXT-001'], 1000)
    expect(shouldCoalesce(edit, ['EXT-001'], 2000, { ...edit.impact, removed: ['EXT-001'] })).toBe(false)
  })
  it('signatures change when an element field changes, and metrics count active elements by kind', () => {
    const m: EngineeringModel = { elements: [{ id: 'EXT-001', kind: 'EXT', name: 'Grid', provenance: 'team-derived', status: 'active' }, { id: 'EXT-002', kind: 'EXT', name: 'Old', provenance: 'team-derived', status: 'retired', retiredReason: 'dup' }], links: [] }
    const s1 = elementSignatures(m)
    const s2 = elementSignatures({ ...m, elements: [{ ...m.elements[0], owner: 'JS' }, m.elements[1]] })
    expect(s1['EXT-001']).not.toBe(s2['EXT-001'])
    expect(s1['EXT-002']).toBe(s2['EXT-002'])
    expect(modelMetrics(m)).toEqual({ 'EXT elements': 1, Links: 0 })
  })
})
