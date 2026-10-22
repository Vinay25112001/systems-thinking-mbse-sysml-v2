// Guided Practice store isolation (M5; change-impact X8; data-compatibility checklist item 5): the practice has its own key,
// the earlier practice answers are copied forward without touching the shared keys, and a reset (one task or all) leaves
// the team record (`wb-artefacts['w1.team']`) and every other key byte-identical.
import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_PREFIX, saveJSON } from '../../lib/storage'
import { TEAM_KEY } from '../../workbench/week1/team'
import { TEAM_FIXTURE } from '../../workbench/week1/teamFixture'
import { emptyPractice, loadPractice, migrateLegacy, normalizePractice, PRACTICE_STORAGE_KEY, PROTECTED_KEYS, resetAllPractice, resetTask, savePractice } from './store'

const raw = () => Object.fromEntries(Object.keys(window.localStorage).filter((k) => k !== STORAGE_PREFIX + PRACTICE_STORAGE_KEY).map((k) => [k, window.localStorage.getItem(k)]))

const LEGACY = {
  'wb-artefacts': {
    [TEAM_KEY]: TEAM_FIXTURE,
    'w1.stakeholders': { identified: { k1: 'yes', k8: 'yes' }, identifiedCheckedAt: 5, identifiedAck: { k8: true }, classes: { 'STK-002': { role: 'authority', side: 'external', approving: 'yes' }, 'STK-004': { role: 'public' } }, classesCheckedAt: 6, row: { stk: 'STK-012', concern: 'Premiums after 22:00', influence: '4', reason: 'sets cover' }, rowRecordedAt: 7 },
    'w1.needs': { critique: { c1: { form: true } }, critiqueCheckedAt: 8, draft: { name: 'x', text: 'y', conditions: '', rationale: '', traces: [] }, needs: [] },
  },
  'mission-progress': { 'w1-m1-who': { answers: { prediction: { value: 'missing', at: 1 }, match: { value: 'partly', at: 2 } } }, 'w1-m2-boundary': { answers: { criterion: { value: 'model', at: 3 } } }, 'w1-m5-team': { answers: {} } },
  boundary: { b1: 'inside', b5: 'environment', other: 'inside' },
  'w1-team-before-project': { savedAt: 'x', record: TEAM_FIXTURE },
}

beforeEach(() => window.localStorage.clear())

describe('practice store: its own key, nothing else (X8)', () => {
  it('uses one key that is not a protected key', () => {
    expect(PRACTICE_STORAGE_KEY).toBe('w1.practice')
    expect(PROTECTED_KEYS).not.toContain(PRACTICE_STORAGE_KEY as never)
    expect(PROTECTED_KEYS).toContain('wb-artefacts')
  })

  it('migrates the earlier practice answers forward without changing any legacy key (byte-identical)', () => {
    for (const [k, v] of Object.entries(LEGACY)) saveJSON(k, v)
    const before = raw()
    const s = loadPractice(() => '2026-10-21T00:00:00.000Z')
    expect(raw()).toEqual(before)
    expect(s.migrated?.from).toEqual(["wb-artefacts['w1.stakeholders']", "wb-artefacts['w1.needs']", "mission-progress['w1-m1-who']", "mission-progress['w1-m2-boundary']", 'boundary (b1–b9)'])
    expect(s.tasks['gp-1'].prediction).toEqual({ value: 'missing', at: 1 })
    expect(s.tasks['gp-1'].identify.answers).toEqual({ k1: 'yes', k8: 'yes' })
    expect(s.tasks['gp-1'].identify.ack).toEqual({ k8: true })
    expect(s.tasks['gp-2'].criterion?.value).toBe('model')
    expect(s.tasks['gp-2'].boundary.answers).toEqual({ b1: 'inside', b5: 'environment' })
    expect(s.tasks['gp-3'].classes.answers).toEqual({ 'STK-002': 'authority|external|yes' })
    expect(s.tasks['gp-3'].fields['STK-004']).toEqual({ role: 'public' })
    expect(s.tasks['gp-3'].row.stk).toBe('STK-012')
    expect(s.tasks['gp-5'].critique).toEqual({ c1: { form: true } })
    // written once under its own key; a second load reads it and does not migrate again
    expect(window.localStorage.getItem(STORAGE_PREFIX + PRACTICE_STORAGE_KEY)).not.toBeNull()
    saveJSON('mission-progress', { 'w1-m1-who': { answers: { prediction: { value: 'enough', at: 9 } } } })
    expect(loadPractice().tasks['gp-1'].prediction?.value).toBe('missing')
  })

  it('migrates nothing when no practice answers were stored, and still writes no key', () => {
    saveJSON('wb-artefacts', { [TEAM_KEY]: TEAM_FIXTURE })
    const before = raw()
    expect(migrateLegacy({ artefacts: { [TEAM_KEY]: TEAM_FIXTURE } })).toBeNull()
    expect(loadPractice()).toEqual(emptyPractice())
    expect(raw()).toEqual(before)
    expect(window.localStorage.getItem(STORAGE_PREFIX + PRACTICE_STORAGE_KEY)).toBeNull()
  })

  it('checklist item 5: a task reset and a full reset leave w1.team and every other key byte-identical', () => {
    for (const [k, v] of Object.entries(LEGACY)) saveJSON(k, v)
    const team = window.localStorage.getItem(STORAGE_PREFIX + 'wb-artefacts')
    const before = raw()
    let s = loadPractice()
    s = { ...s, tasks: { ...s.tasks, 'gp-4': { ...s.tasks['gp-4'], generic: 'Insurers worry about night flights' } } }
    savePractice(s)
    s = resetTask(s, 'gp-1')
    savePractice(s)
    expect(s.tasks['gp-1'].prediction).toBeUndefined()
    expect(s.tasks['gp-4'].generic).toBe('Insurers worry about night flights')
    const all = resetAllPractice()
    expect(all.tasks).toEqual(emptyPractice().tasks)
    expect(raw()).toEqual(before)
    expect(window.localStorage.getItem(STORAGE_PREFIX + 'wb-artefacts')).toBe(team)
    // after "Reset all" the earlier answers do not come back
    expect(loadPractice().tasks['gp-1'].prediction).toBeUndefined()
  })

  it('reads a malformed stored value without throwing', () => {
    expect(normalizePractice('nonsense').tasks['gp-5'].needs).toEqual([])
    expect(normalizePractice({ tasks: { 'gp-4': { conflict: { concerns: 'x' } } } }).tasks['gp-4'].conflict.concerns).toEqual([])
  })
})
