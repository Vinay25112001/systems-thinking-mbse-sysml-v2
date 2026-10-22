// Every Guided Practice screen a student can reach, rendered with its feedback showing (M5): each task and step, with a
// seeded practice in which every judgment item has been answered differently from the instructor's reading and checked,
// so every reasoning, "defensible" note, structural result and reveal is on screen. Used by practice/surfaces.test.tsx and
// by scripts/check-student-build.mjs (student mode, strict: no ceiling, every rule of learn/studentScan.ts, "goal"
// included). Not imported by the application.
import { renderInDom } from '../../lib/renderInDom'
import { PRACTICE_STORAGE_KEY, emptyPractice, type PracticeState } from './store'
import GuidedPractice from './GuidedPractice'
import { Handoff as ProjectHandoff } from '../../project/practice/Handoff'
import * as T from './tasks'

const all = (ids: { id: string }[], v: string) => Object.fromEntries(ids.map((i) => [i.id, v]))

/** A practice where every step is answered, checked and differs from the instructor's reading. */
export function seededPractice(): PracticeState {
  const s = emptyPractice()
  const t = s.tasks
  const checked = <V extends string>(answers: Record<string, V>) => ({ answers, checked: { ...answers }, checkedAt: 1, ack: {} })
  t['gp-1'] = { prediction: { value: 'enough', at: 1 }, identify: checked(all(T.GP1_ITEMS, 'no') as Record<string, 'yes' | 'no'>), match: { value: 'partly', at: 2 } }
  t['gp-2'] = { boundary: checked(all(T.GP2_ITEMS, 'irrelevant') as Record<string, 'irrelevant'>), criterion: { value: 'control', at: 1 }, exchanges: Object.fromEntries(T.GP2_EXTERNALS.map((e) => [e.id, { text: 'data and power', direction: 'out' as const }])), exchangesCheckedAt: 1, exchangesAck: {} }
  const fields = Object.fromEntries(T.GP3_ITEMS.map((i) => [i.id, { role: 'user' as const, side: 'internal' as const, approving: 'yes' as const }]))
  t['gp-3'] = { fields, classes: checked(all(T.GP3_ITEMS, 'user|internal|yes')), row: { stk: 'STK-012', concern: 'Insurers need loss data recorded after every night flight', interest: '3', interestReason: 'Premiums depend on it', influence: '4', reason: 'They set cover' }, rowCheckedAt: 1 }
  t['gp-4'] = { rels: checked(all(T.GP4_ITEMS, 'funds') as Record<string, 'funds'>), conflict: { pair: 'STK-010|STK-003', concerns: ['CON-011', 'CON-005'], variable: 'charging load at each vertiport' }, conflictCheckedAt: 1, generic: 'Insurers want incident data recorded on every flight so premiums rest on evidence.', genericCheckedAt: 1 }
  const crit = Object.fromEntries(T.GP5_DRAFTS.map((d, i) => [d.id, i === 0 ? { ok: true } : { requirement: true }]))
  t['gp-5'] = { critique: crit, critiqueChecked: crit, critiqueCheckedAt: 1, critiqueAck: {}, draft: { name: 'Quiet nights', text: 'AeroLink shall install barriers', conditions: '', rationale: '', traces: ['STK-004'], selfCheck: {}, justification: '' }, needs: [{ id: 'PN-1', at: 1, name: 'Grid', text: 'The electric utility needs the air-taxi service to keep charging within the connection capacity.', conditions: 'At all times.', rationale: 'Overload trips protection.', traces: ['STK-010'], selfCheck: {}, justification: '' }] }
  t['gp-6'] = { links: checked(all(T.GP6_ITEMS, 'MGO-001')), gap: { stakeholder: 'STK-001', decision: 'add', reason: 'Passengers look uncovered in my reading of this matrix today.' }, gapCheckedAt: 1 }
  return s
}

export type Surface = { route: string; html: string }

export async function practiceSurfaces(): Promise<Surface[]> {
  const out: Surface[] = []
  const prefix = 'sysml-studio:v1:'
  const seeds: [string, PracticeState | null][] = [['fresh', null], ['answered', seededPractice()]]
  for (const [label, seed] of seeds) {
    for (const task of T.TASKS) {
      for (const step of task.steps) {
        if (seed) window.localStorage.setItem(prefix + PRACTICE_STORAGE_KEY, JSON.stringify(seed))
        else window.localStorage.removeItem(prefix + PRACTICE_STORAGE_KEY)
        const path = `/week/1/practice/${task.id}`
        out.push({ route: `${path} · ${step.id} · ${label}`, html: await renderInDom(<GuidedPractice task={task.id} path={path} initialStep={step.id} />) })
      }
    }
  }
  window.localStorage.removeItem(prefix + PRACTICE_STORAGE_KEY)
  // the practice → project handoff panel shown on My Project / Lab (review M5-14: it said "goals")
  out.push({ route: '/week/1/project · practice handoff panel', html: await renderInDom(<ProjectHandoff week={1} where="examples" />) })
  return out
}
