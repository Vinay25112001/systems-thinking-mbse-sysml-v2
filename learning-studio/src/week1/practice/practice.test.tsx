// Guided Practice page (M5): layout and labels (GP-01), feedback kinds in the running page (GP-20), per-task reset with
// confirmation (GP-22), isolation from the project and the team record (GP-23, Demo B10, checklist item 5: the project
// document and `w1.team` are identical before and after a full practice run and a reset), the explicit template copy
// with review and adapt warning (GP-30, offline adapter here, the server's member screen below), and a strict scan of
// every practice string the page renders (no internal codes, no "goal", nothing pending).
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_PREFIX, saveJSON } from '../../lib/storage'
import { copyStakeholdersOps } from '../../project/practice/copyFromPractice'
import { MemoryAdapter } from '../../project/store/memory'
import { ProjectProvider } from '../../project/store/ProjectProvider'
import { ProjectStore } from '../../project/store/ProjectStore'
import { screenMemberOps, MEMBER_SOURCES } from '../../project/model/serverRules'
import { AppStateProvider } from '../../state/AppState'
import { ProjectLegacyMirror } from '../../state/ProjectLegacyMirror'
import { WorkspaceProvider } from '../../state/Workspace'
import { TEAM_KEY } from '../../workbench/week1/team'
import { TEAM_FIXTURE } from '../../workbench/week1/teamFixture'
import { scanStudentText } from '../learn/studentScan'
import { fromTeamRecord } from '../../project/adapters/week1'
import { SCORING_WORDS } from './feedback'
import GuidedPractice from './GuidedPractice'
import { PRACTICE_STORAGE_KEY } from './store'
import { TASKS } from './tasks'

let store: ProjectStore
async function makeStore(withProject: boolean) {
  store = new ProjectStore(new MemoryAdapter(), { autosaveMs: 5, retryMs: 5, locks: false, channel: false })
  await store.init()
  if (withProject) await store.create({ doc: fromTeamRecord(TEAM_FIXTURE).doc })
}
const Wrap = ({ children }: { children: ReactNode }) => (
  <AppStateProvider>
    <WorkspaceProvider>
      <ProjectProvider store={store}>
        <ProjectLegacyMirror />
        {children}
      </ProjectProvider>
    </WorkspaceProvider>
  </AppStateProvider>
)
const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 30)) })
const show = async (task: string) => {
  const r = render(<Wrap><GuidedPractice task={task} path={`/week/1/practice/${task}`} /></Wrap>)
  await settle()
  return r
}
const raw = (k: string) => window.localStorage.getItem(STORAGE_PREFIX + k)
const docHash = () => JSON.stringify(store.getState().doc)

beforeEach(() => window.localStorage.clear())
afterEach(() => {
  cleanup()
  store?.dispose()
})

/** Answers every radio group and select of the visible step with its first option, then presses Check. */
function answerAllAndCheck() {
  const card = screen.getByTestId(/practice-task-/)
  const groups = new Map<string, HTMLInputElement>()
  for (const r of within(card).queryAllByRole('radio') as HTMLInputElement[]) if (!groups.has(r.name) && !r.disabled) groups.set(r.name, r)
  groups.forEach((r) => fireEvent.click(r))
  for (const s of within(card).queryAllByRole('combobox') as HTMLSelectElement[]) if (s.options.length > 1) fireEvent.change(s, { target: { value: s.options[1].value } })
  const check = within(card).queryByTestId('gp-check')
  if (check && !(check as HTMLButtonElement).disabled) fireEvent.click(check)
}

describe('Guided Practice page (GP-01, GP-20)', () => {
  it('shows the plum fictional-case banner, six tasks with state words and minutes, and the Learn rail', async () => {
    await makeStore(false)
    await show('gp-4')
    expect(screen.getByTestId('practice-banner')).toHaveTextContent('Fictional teaching case')
    expect(screen.getByTestId('practice-banner')).toHaveTextContent('never written into your project')
    for (const t of TASKS) expect(screen.getByTestId(`task-${t.id}`)).toHaveTextContent(`${t.minutes} min`)
    expect(screen.getByTestId('task-gp-1')).toHaveTextContent('Not started')
    expect(screen.getByTestId('learn-links').querySelectorAll('a').length).toBeGreaterThan(0)
    for (const a of screen.getByTestId('learn-links').querySelectorAll('a')) expect(a.getAttribute('href')).toMatch(/^#\/week\/1\/learn\/ch\d\d#ch\d\d-\d\d$/)
    expect(document.body.textContent).not.toMatch(/Practice workbench/)
  })

  it('GP-4 step 1: compared with the instructor’s reading, counted, with reasoning and “I have read why”; no score', async () => {
    await makeStore(false)
    await show('gp-4')
    answerAllAndCheck()
    const fb = screen.getByTestId('fb-compared')
    expect(fb).toHaveTextContent(/Compared with the instructor’s reading: \d agree · \d differ/)
    expect(fb.textContent).not.toMatch(SCORING_WORDS)
    // the first relationship type in the list is "regulates": REL-001 agrees, the other four differ and are explained
    expect(fb).toHaveTextContent('The instructor’s reading: “supplies” (REL-003)')
    const boxes = within(fb).getAllByRole('checkbox')
    expect(boxes.length).toBe(4)
    expect(screen.getByTestId('task-gp-4')).toHaveTextContent('In progress')
    boxes.forEach((b) => fireEvent.click(b))
    expect(screen.getByTestId('fb-compared')).toHaveTextContent('every difference has been read')
    expect(screen.getByTestId('step-rels').querySelector('.is-attempted')).not.toBeNull()
  })

  it('GP-2 step 2 (criterion): a best-supported answer, every option explained after the choice', async () => {
    await makeStore(false)
    await show('gp-2')
    answerAllAndCheck()
    fireEvent.click(screen.getByTestId('step-criterion'))
    fireEvent.click(screen.getByLabelText(/Control: AeroLink controls/))
    const fb = screen.getByTestId('fb-reveal')
    expect(fb).toHaveTextContent('Best supported answer')
    expect(fb).toHaveTextContent('(your choice)')
    expect(fb.textContent).not.toMatch(/\bwrong\b|\bincorrect\b/i)
  })

  it('a structural check says “Passes the course check” / “Does not pass yet”, never correct', async () => {
    await makeStore(false)
    await show('gp-4')
    fireEvent.click(screen.getByTestId('step-rewrite'))
    fireEvent.change(screen.getByLabelText('The insurers’ concern'), { target: { value: 'safety' } })
    fireEvent.click(screen.getByTestId('gp-check'))
    expect(screen.getByTestId('fb-structural')).toHaveTextContent('Does not pass yet')
    fireEvent.change(screen.getByLabelText('The insurers’ concern'), { target: { value: 'Insurers want incident and loss data recorded on every flight so that premiums can be set on evidence.' } })
    expect(screen.getByTestId('fb-structural')).toHaveTextContent('Passes the course check')
    expect(screen.getByTestId('fb-structural')).toHaveTextContent('CON-014')
    expect(screen.getByTestId('fb-structural').textContent).not.toMatch(/\bcorrect\b/i)
  })
})

describe('reset and isolation (GP-22, GP-23, Demo B10, checklist item 5)', () => {
  it('a full practice run and both resets leave the project document and w1.team identical', async () => {
    saveJSON('wb-artefacts', { [TEAM_KEY]: TEAM_FIXTURE, other: 1 })
    saveJSON('w1-team-before-project', { record: TEAM_FIXTURE })
    await makeStore(true)
    await show('gp-1')
    await settle()
    const projectBefore = docHash()
    const revBefore = store.getState().doc!.rev
    const changesBefore = store.getState().changes.length
    const teamBefore = raw('wb-artefacts')
    const backupBefore = raw('w1-team-before-project')
    expect(projectBefore).not.toBe('null')
    // a full run: every step of every task answered and checked
    for (const t of TASKS) {
      fireEvent.click(screen.getByTestId(`task-${t.id}`))
      cleanup()
      await show(t.id)
      for (const s of t.steps) {
        fireEvent.click(screen.getByTestId(`step-${s.id}`))
        answerAllAndCheck()
      }
    }
    expect(raw(PRACTICE_STORAGE_KEY)).not.toBeNull()
    // per-task reset, with the confirmation dialog
    fireEvent.click(screen.getByTestId('reset-task'))
    const dlg = await screen.findByTestId('gp-confirm')
    expect(dlg).toHaveTextContent('Reset GP-6?')
    expect(dlg).toHaveTextContent('Your answers in this task are cleared. Your team project is not affected.')
    fireEvent.click(within(dlg).getByTestId('gp-confirm-yes'))
    expect(screen.getByTestId('practice-status')).toHaveTextContent('GP-6 reset. Your project was not changed.')
    // reset all
    fireEvent.click(screen.getByTestId('reset-all'))
    fireEvent.click(within(await screen.findByTestId('gp-confirm')).getByTestId('gp-confirm-yes'))
    expect(screen.getByTestId('practice-status')).toHaveTextContent('All practice reset. Your project was not changed.')
    await settle()
    expect(docHash()).toBe(projectBefore)
    expect(store.getState().doc!.rev).toBe(revBefore)
    expect(store.getState().changes.length).toBe(changesBefore)
    expect(raw('wb-artefacts')).toBe(teamBefore)
    expect(raw('w1-team-before-project')).toBe(backupBefore)
    for (const t of TASKS) expect(screen.getByTestId(`task-${t.id}`)).toHaveTextContent('Not started')
  })

  it('cancel keeps the answers', async () => {
    await makeStore(false)
    await show('gp-4')
    answerAllAndCheck()
    fireEvent.click(screen.getByTestId('reset-task'))
    fireEvent.click(within(await screen.findByTestId('gp-confirm')).getByTestId('gp-confirm-cancel'))
    expect(screen.getByTestId('fb-compared')).toBeInTheDocument()
  })
})

describe('explicit template copy (GP-30)', () => {
  it('requires a request, a review of exactly what is created, the adapt warning and “I understand”; flags the copies', async () => {
    await makeStore(true)
    await show('gp-3')
    fireEvent.click(screen.getByTestId('step-row'))
    const before = store.getState().doc!
    const nextStk = Object.values(before.artifacts).filter((a) => a.type === 'STK').length + 1
    fireEvent.click(screen.getByTestId('template-copy-open'))
    const dlg = await screen.findByTestId('template-dialog')
    expect(dlg).toHaveTextContent('These are the instructor’s AeroLink records. They are not about your enterprise.')
    expect(dlg).toHaveTextContent('Copying AeroLink content without adapting it is not acceptable work.')
    fireEvent.click(within(dlg).getByLabelText(/STK-004 Communities/))
    fireEvent.click(within(dlg).getByLabelText(/with its concern/))
    fireEvent.click(within(dlg).getByTestId('template-review'))
    const plan = within(dlg).getByTestId('template-plan')
    expect(plan.querySelectorAll('li').length).toBe(2)
    expect(plan).toHaveTextContent(`STK-${String(nextStk).padStart(3, '0')} stakeholder from AeroLink STK-004 Communities`)
    expect(plan).toHaveTextContent('concern from AeroLink CON-012 Community noise')
    expect(dlg).toHaveTextContent('Not copied: influence ratings and their reasons')
    expect(store.getState().doc).toBe(before)
    const confirm = within(dlg).getByTestId('template-confirm') as HTMLButtonElement
    expect(confirm.disabled).toBe(true)
    fireEvent.click(within(dlg).getByTestId('template-understood'))
    fireEvent.click(confirm)
    await settle()
    const after = store.getState().doc!
    const copied = Object.values(after.artifacts).filter((a) => a.provenance.kind === 'copied-from-practice')
    expect(copied.map((a) => a.type).sort()).toEqual(['CON', 'STK'])
    const stk = copied.find((a) => a.type === 'STK')!
    expect(stk.provenance).toMatchObject({ copiedFrom: { case: 'AeroLink', id: 'STK-004' }, adapted: false })
    expect(stk.attributes.influence).toBeUndefined()
    expect(stk.attributes.influenceReason).toBeUndefined()
    expect(store.getState().changes.at(-1)!.summary).toBe('Template copied from AeroLink (1 row)')
    expect(screen.getByTestId('template-msg')).toHaveTextContent('Template from AeroLink — adapt before use')
  })

  it('server adapter: the copy change set passes the member screen unchanged (source practice-copy is a member source)', () => {
    const doc = fromTeamRecord(TEAM_FIXTURE).doc
    const { ops } = copyStakeholdersOps(doc, ['STK-002', 'STK-004'], { at: '2026-10-21T00:00:00.000Z', by: 'JS', change: 'CHG-000900' }, { concernsOf: ['STK-004'], ratings: false })
    const r = screenMemberOps(doc, ops)
    expect(r.ok && r.ops.length).toBe(ops.length)
    expect(MEMBER_SOURCES).toContain('practice-copy')
  })

  it('with no project the template action is disabled and says to create the project first', async () => {
    await makeStore(false)
    await show('gp-5')
    fireEvent.click(screen.getByTestId('step-write'))
    expect((screen.getByTestId('template-copy-open') as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByTestId('template-copy')).toHaveTextContent('Create your project')
  })
})

describe('every practice string a student can see (GP-17, leak scan)', () => {
  it('no register codes, slide or session pointers, rubric codes, pending wording, or “goal” on any task, step or feedback', async () => {
    await makeStore(true)
    const texts: string[] = []
    for (const t of TASKS) {
      await show(t.id)
      for (const s of t.steps) {
        fireEvent.click(screen.getByTestId(`step-${s.id}`))
        answerAllAndCheck()
        texts.push(document.body.textContent ?? '')
        const attrs = [...document.body.querySelectorAll('[aria-label],[title],[alt]')].map((e) => [e.getAttribute('aria-label'), e.getAttribute('title'), e.getAttribute('alt')].filter(Boolean).join(' '))
        texts.push(attrs.join(' '))
      }
      cleanup()
    }
    const all = texts.join(' ')
    expect(all.length).toBeGreaterThan(20000)
    expect(all).toContain('Compared with the instructor’s reading')
    const hits = scanStudentText(all).map((h) => `[${h.rule}] …${h.context}…`)
    expect(hits).toEqual([])
  })
})
