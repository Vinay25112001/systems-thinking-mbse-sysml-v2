// M5 review dispositions (_source_cache/review/week1_m5_review.md): each finding has a test that fails without its fix.
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { WORKLOAD } from '../../content/week1Path'
import { STORAGE_PREFIX } from '../../lib/storage'
import { MemoryAdapter } from '../../project/store/memory'
import { ProjectProvider } from '../../project/store/ProjectProvider'
import { ProjectStore } from '../../project/store/ProjectStore'
import { AppStateProvider } from '../../state/AppState'
import { WorkspaceProvider } from '../../state/Workspace'
import { overviewTime } from '../Overview'
import GuidedPractice from './GuidedPractice'
import { emptyPractice, loadPractice, normalizePractice, PRACTICE_BACKUP_KEY, PRACTICE_STORAGE_KEY } from './store'
import { isEmptyEveryWord, saidSomething } from '../../workbench/emptyAnswer'
import * as T from './tasks'
import { sanitizePractice } from './validate'

let store: ProjectStore
const KEY = STORAGE_PREFIX + PRACTICE_STORAGE_KEY
const Wrap = ({ children }: { children: ReactNode }) => (
  <AppStateProvider>
    <WorkspaceProvider>
      <ProjectProvider store={store}>{children}</ProjectProvider>
    </WorkspaceProvider>
  </AppStateProvider>
)
const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 30)) })
async function show(task: string) {
  render(<Wrap><GuidedPractice task={task} path={`/week/1/practice/${task}`} /></Wrap>)
  await settle()
}
function answerAllAndCheck() {
  const card = screen.getByTestId(/practice-task-/)
  const groups = new Map<string, HTMLInputElement>()
  for (const r of within(card).queryAllByRole('radio') as HTMLInputElement[]) if (!groups.has(r.name) && !r.disabled) groups.set(r.name, r)
  groups.forEach((r) => fireEvent.click(r))
  for (const s of within(card).queryAllByRole('combobox') as HTMLSelectElement[]) if (s.options.length > 1) fireEvent.change(s, { target: { value: s.options[1].value } })
  const check = within(card).queryByTestId('gp-check') as HTMLButtonElement | null
  if (check && !check.disabled) fireEvent.click(check)
}

beforeEach(async () => {
  window.localStorage.clear()
  window.location.hash = '#/week/1/practice/gp-1'
  store = new ProjectStore(new MemoryAdapter(), { autosaveMs: 5, retryMs: 5, locks: false, channel: false })
  await store.init()
})
afterEach(() => {
  cleanup()
  store.dispose()
})

describe('M5-01 “read why” stays on the page', () => {
  it('moves focus to the explanation and keeps the hash route', async () => {
    await show('gp-4')
    answerAllAndCheck()
    const link = screen.getAllByRole('button', { name: 'read why' })[0]
    fireEvent.click(link)
    expect(window.location.hash).toBe('#/week/1/practice/gp-1')
    expect(document.activeElement?.id).toMatch(/^why-REL-/)
    expect(document.querySelectorAll('a[href^="#why"]').length).toBe(0)
  })
})

describe('M5-02 corrupt or unknown stored values', () => {
  const corrupt = () => ({ v: 1, tasks: { 'gp-1': { prediction: { value: 42 }, identify: { answers: { k1: 'maybe', zz: 'yes' }, ack: {} } }, 'gp-4': { conflict: { pair: 'STK-999|STK-005', concerns: ['CON-999', 'CON-006'], variable: 7 }, generic: 12, rels: { answers: { 'REL-003': 'loves' }, ack: {} } }, 'gp-5': { needs: [null, { id: 'PN-1', text: 'x', traces: ['STK-999'] }, { id: 'PN-1', text: 'y', traces: [] }], critique: { c9: { form: true } } }, 'gp-6': { gap: { stakeholder: 'STK-404', reason: ['x'] } } } })
  it('the validator drops unknown IDs and wrong types, names each drop, and repairs duplicate need IDs', () => {
    const { state, dropped } = sanitizePractice(normalizePractice(corrupt()))
    expect(state.tasks['gp-4'].conflict.concerns).toEqual(['', 'CON-006'])
    expect(state.tasks['gp-4'].conflict.pair).toBeUndefined()
    expect(state.tasks['gp-4'].generic).toBe('')
    expect(state.tasks['gp-1'].prediction).toBeUndefined()
    expect(state.tasks['gp-1'].identify.answers).toEqual({})
    expect(state.tasks['gp-5'].needs.map((n) => n.id)).toEqual(['PN-1', 'PN-2'])
    expect(state.tasks['gp-5'].needs[0].traces).toEqual([])
    expect(state.tasks['gp-6'].gap.stakeholder).toBeUndefined()
    expect(dropped.join(' | ')).toMatch(/CON-999/)
    expect(dropped.length).toBeGreaterThanOrEqual(7)
    // every task evaluates without throwing
    for (const t of T.TASKS) expect(() => T.stepStatus(state.tasks)[t.id]).not.toThrow()
  })
  it('the page renders with corrupt data, says what it left out, and both resets stay available', async () => {
    window.localStorage.setItem(KEY, JSON.stringify(corrupt()))
    await show('gp-4')
    expect(screen.getByTestId('guided-practice')).toBeInTheDocument()
    expect(screen.getByTestId('practice-dropped')).toHaveTextContent('could not be read')
    expect(screen.getByTestId('reset-all')).toBeEnabled()
    fireEvent.click(screen.getByTestId('step-conflict'))
    expect(screen.getByTestId('practice-task-gp-4')).toBeInTheDocument()
  })
  it('an unreadable stored value does not re-run the migration (M5-20)', () => {
    window.localStorage.setItem(STORAGE_PREFIX + 'mission-progress', JSON.stringify({ 'w1-m1-who': { answers: { prediction: { value: 'enough', at: 1 } } } }))
    window.localStorage.setItem(KEY, '{not json')
    expect(loadPractice().tasks['gp-1'].prediction).toBeUndefined()
  })
  it('N-3: unreadable practice JSON is backed up under its own key, cleared, and the page says so', async () => {
    window.localStorage.setItem(KEY, '{not json')
    await show('gp-1')
    expect(screen.getByTestId('practice-recovered')).toHaveTextContent('could not be read')
    expect(JSON.parse(window.localStorage.getItem(STORAGE_PREFIX + PRACTICE_BACKUP_KEY)!).raw).toBe('{not json')
    const now = JSON.parse(window.localStorage.getItem(KEY)!)
    expect(now.recovered).toBeUndefined()
    expect(now.tasks['gp-1']).toBeDefined()
  })
})

describe('M5 confirmation follow-ups', () => {
  it('(1) an answer whose every word is empty does not count; real short answers do (exchange, variable, interest reason)', () => {
    for (const bad of ['n/a todo', 'none none', 'tbd, later', 'N/A. TODO.']) {
      expect(isEmptyEveryWord(bad), bad).toBe(true)
      expect(saidSomething(bad), bad).toBe(false)
    }
    for (const good of ['Electricity', 'TLS', 'Fail safe', 'none apply here', 'flight frequency']) expect(saidSomething(good), good).toBe(true)
    const s2 = emptyPractice().tasks['gp-2']
    const ex = (text: string) => ({ ...s2, exchanges: Object.fromEntries(T.GP2_EXTERNALS.map((e) => [e.id, { text, direction: 'in' as const }])) })
    expect(T.gp2Exchanges(ex('n/a todo')).ok).toBe(false)
    expect(T.gp2Exchanges(ex('Electricity')).ok).toBe(true)
    const s4 = emptyPractice().tasks['gp-4']
    expect(T.gp4ConflictCheck({ ...s4, conflict: { pair: 'STK-004|STK-005', concerns: ['CON-012', 'CON-006'], variable: 'none none' } }).ok).toBe(false)
    const row = { stk: 'STK-012', concern: 'Insurers need loss data recorded after every night flight', interest: '3', interestReason: 'n/a todo', influence: '', reason: '' }
    expect(T.gp3RowCheck({ ...emptyPractice().tasks['gp-3'], row }).ok).toBe(false)
    expect(T.gp3RowCheck({ ...emptyPractice().tasks['gp-3'], row: { ...row, interestReason: 'Premiums' } }).ok).toBe(true)
  })
  it('(2) GP-2 step 3 stays locked and names no external system before step 1 is checked', async () => {
    await show('gp-2')
    fireEvent.click(screen.getByTestId('step-exchanges'))
    expect(screen.getByTestId('gp2-exchanges-locked')).toBeInTheDocument()
    expect(screen.getByTestId('practice-task-gp-2').textContent).not.toMatch(/Electric grid|Weather|Controlled airspace|EXT-00/)
    fireEvent.click(screen.getByTestId('step-boundary'))
    answerAllAndCheck()
    fireEvent.click(screen.getByTestId('step-exchanges'))
    expect(screen.queryByTestId('gp2-exchanges-locked')).toBeNull()
    expect(screen.getByTestId('practice-task-gp-2')).toHaveTextContent('Electric grid')
  })
})

describe('M5-03/04/05 no instructor reading before an attempt', () => {
  it('GP-1 step 3 is locked until the sort is checked, and names no stakeholder before', async () => {
    await show('gp-1')
    fireEvent.click(screen.getByLabelText('No: add other kinds of party'))
    fireEvent.click(screen.getByTestId('step-compare'))
    expect(screen.getByTestId('gp1-compare-locked')).toHaveTextContent('step 2 first')
    for (const r of within(screen.getByTestId('practice-task-gp-1')).getAllByRole('radio') as HTMLInputElement[]) expect(r.matches(':disabled')).toBe(true)
    expect(screen.getByTestId('practice-task-gp-1').textContent).not.toMatch(/FAA|planning authority|Residents/)
  })
  it('GP-2 step 2 does not give placements before step 1 is checked', async () => {
    await show('gp-2')
    fireEvent.click(screen.getByTestId('step-criterion'))
    expect(screen.getByTestId('gp2-criterion-locked')).toBeInTheDocument()
    expect(screen.getByTestId('practice-task-gp-2').textContent).not.toMatch(/demand is inside|grid is in the environment/)
  })
  it('GP-5: Check stays disabled until every draft is judged; “Acceptable as written” is a judgment', async () => {
    await show('gp-5')
    expect((screen.getByTestId('gp-check') as HTMLButtonElement).disabled).toBe(true)
    expect(screen.queryByTestId('fb-compared')).toBeNull()
    for (const d of T.GP5_DRAFTS) fireEvent.click(screen.getByTestId(`gp5-ok-${d.id}`))
    expect((screen.getByTestId('gp-check') as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(screen.getByTestId('gp-check'))
    // c6 is the acceptable draft: it agrees; the five flawed drafts differ
    expect(screen.getByTestId('fb-compared')).toHaveTextContent('1 agree · 5 differ')
  })
})

describe('M5-06 empty answers, not word counts', () => {
  const s2 = emptyPractice().tasks['gp-2']
  const ex = (text: string) => ({ ...s2, exchanges: Object.fromEntries(T.GP2_EXTERNALS.map((e) => [e.id, { text, direction: 'in' as const }])) })
  it('accepts a valid one-word exchange and rejects an empty answer, with a reason', () => {
    expect(T.gp2Exchanges(ex('Electricity')).ok).toBe(true)
    expect(T.gp2Exchanges(ex('Clearances')).ok).toBe(true)
    const r = T.gp2Exchanges(ex('n/a'))
    expect(r.ok).toBe(false)
    expect(r.issues[0]).toMatch(/“n\/a” or “todo” says nothing/)
    expect(T.gp2Exchanges(ex('todo')).ok).toBe(false)
  })
  it('a shared variable of two words passes; a run of empty words is not a reason', () => {
    const s4 = emptyPractice().tasks['gp-4']
    expect(T.gp4ConflictCheck({ ...s4, conflict: { pair: 'STK-004|STK-005', concerns: ['CON-012', 'CON-006'], variable: 'flight frequency' } }).ok).toBe(true)
    expect(T.gp4ConflictCheck({ ...s4, conflict: { pair: 'STK-004|STK-005', concerns: ['CON-012', 'CON-006'], variable: 'n/a' } }).ok).toBe(false)
    const s6 = emptyPractice().tasks['gp-6']
    expect(T.gp6GapCheck({ ...s6, gap: { stakeholder: 'STK-011', decision: 'record', reason: 'none none none none none none none none' } }).ok).toBe(false)
    expect(T.gp6GapCheck({ ...s6, gap: { stakeholder: 'STK-011', decision: 'record', reason: 'Contract obligation.' } }).ok).toBe(true)
  })
})

describe('M5-07 a second tab never overwrites silently', () => {
  it('after another tab writes, an edit here is refused, a notice offers to load the latest answers', async () => {
    await show('gp-4')
    fireEvent.click(screen.getByTestId('step-rewrite'))
    fireEvent.change(screen.getByLabelText('The insurers’ concern'), { target: { value: 'from tab A' } })
    // another tab writes a newer version
    const other = JSON.parse(window.localStorage.getItem(KEY)!)
    other.rev += 1
    other.tasks['gp-4'].generic = 'from tab B'
    window.localStorage.setItem(KEY, JSON.stringify(other))
    fireEvent.change(screen.getByLabelText('The insurers’ concern'), { target: { value: 'from tab A, again' } })
    expect(screen.getByTestId('practice-stale')).toHaveTextContent('changed in another tab')
    expect(JSON.parse(window.localStorage.getItem(KEY)!).tasks['gp-4'].generic).toBe('from tab B')
    fireEvent.click(screen.getByTestId('practice-reload'))
    expect((screen.getByLabelText('The insurers’ concern') as HTMLTextAreaElement).value).toBe('from tab B')
    fireEvent.change(screen.getByLabelText('The insurers’ concern'), { target: { value: 'tab A after reload' } })
    expect(JSON.parse(window.localStorage.getItem(KEY)!).tasks['gp-4'].generic).toBe('tab A after reload')
  })
})

describe('M5-08 reset dialog focus', () => {
  it('opens on Cancel and returns focus to the button that opened it', async () => {
    await show('gp-1')
    const trigger = screen.getByTestId('reset-task')
    trigger.focus()
    fireEvent.click(trigger)
    const dlg = await screen.findByTestId('gp-confirm')
    await settle()
    expect(document.activeElement).toBe(within(dlg).getByTestId('gp-confirm-cancel'))
    expect(dlg.getAttribute('aria-describedby')).toBeTruthy()
    fireEvent.click(within(dlg).getByTestId('gp-confirm-cancel'))
    await settle()
    expect(document.activeElement).toBe(screen.getByTestId('reset-task'))
  })
})

describe('M5-12, M5-15, M5-16, M5-17', () => {
  it('M5-12: a need ID is never reused after a revision', () => {
    const s = { ...emptyPractice(), tasks: { ...emptyPractice().tasks, 'gp-5': { ...emptyPractice().tasks['gp-5'], needs: [{ id: 'PN-1', at: 1, name: '', text: 'a', conditions: '', rationale: '', traces: [] }, { id: 'PN-1', at: 2, name: '', text: 'b', conditions: '', rationale: '', traces: [] }], pnSeq: 3 } } }
    const ids = sanitizePractice(s).state.tasks['gp-5'].needs.map((n) => n.id)
    expect(new Set(ids).size).toBe(2)
    expect(ids).toEqual(['PN-1', 'PN-4'])
  })
  it('M5-15: the stated practice time equals the computed one (optional, not in the 8.1 h)', () => {
    expect(WORKLOAD.practiceHours).toBe(Math.round((T.PRACTICE_MINUTES / 60) * 10) / 10)
    expect(Math.round(overviewTime().optional[0].hours * 10) / 10).toBe(WORKLOAD.practiceHours)
  })
  it('M5-16: the practice row needs interest with a reason; influence is optional', () => {
    const s3 = emptyPractice().tasks['gp-3']
    const row = { stk: 'STK-012', concern: 'Insurers need loss data recorded after every night flight', interest: '', interestReason: '', influence: '', reason: '' }
    expect(T.gp3RowCheck({ ...s3, row }).issues.join(' ')).toMatch(/interest/)
    expect(T.gp3RowCheck({ ...s3, row: { ...row, interest: '3' } }).issues.join(' ')).toMatch(/reason for the interest/)
    expect(T.gp3RowCheck({ ...s3, row: { ...row, interest: '3', interestReason: 'premiums' } }).ok).toBe(true)
  })
  it('M5-17: the exchange reading is about the checked exchanges; a changed direction must be checked again', () => {
    const s2 = emptyPractice().tasks['gp-2']
    const filled = { ...s2, exchanges: Object.fromEntries(T.GP2_EXTERNALS.map((e) => [e.id, { text: 'power', direction: 'out' as const }])) }
    const checked = T.gp2CheckExchanges(filled, 5)
    expect(T.gp2ExchangeOpen(checked).length).toBe(3)
    const acked = { ...checked, exchangesAck: { 'EXT-001': true, 'EXT-002': true, 'EXT-003': true } }
    expect(T.gp2Steps(acked).exchanges.complete).toBe(true)
    const changed = { ...acked, exchanges: { ...acked.exchanges, 'EXT-002': { text: 'power', direction: 'both' as const } } }
    expect(T.gp2ExchangesStale(changed)).toBe(true)
    expect(T.gp2Steps(changed).exchanges.complete).toBe(false)
    expect(T.gp2CheckExchanges(changed).exchangesAck['EXT-002']).toBeUndefined()
  })
})
