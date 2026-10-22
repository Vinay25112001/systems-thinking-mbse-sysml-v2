// The Week 8 lab tool reading My Project (M7), in the DOM: the student chooses the source and sees which project and
// revision is in use; the generated model is the same as from the file; the package per Week 1 ID is saved in the
// project (empty answers refused, short answers accepted) and survives a reload; a change in My Project is reported
// with the mapping kept; going back to a file clears what came from the project. Fictional food bank fixture only.
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fromTeamRecord } from '../../project/adapters/week1'
import { projectTitle } from '../../project/model/create'
import { week8MappingOf } from '../../project/adapters/week8'
import { MemoryAdapter } from '../../project/store/memory'
import { ProjectProvider } from '../../project/store/ProjectProvider'
import { ProjectStore } from '../../project/store/ProjectStore'
import { teamModelInputs } from '../week1/team'
import { TEAM_FIXTURE } from '../week1/teamFixture'
import Week8LabTool from './Week8LabTool'

vi.mock('../download', () => ({ downloadText: () => true }))

let adapter: MemoryAdapter
let store: ProjectStore
async function openStore() {
  store = new ProjectStore(adapter, { autosaveMs: 0, locks: false, channel: false })
  await store.init()
}
beforeEach(async () => {
  window.localStorage.clear()
  adapter = new MemoryAdapter()
  store = new ProjectStore(adapter, { startEmpty: true, autosaveMs: 0 })
  await store.init()
  await store.create({ doc: fromTeamRecord(TEAM_FIXTURE, { initials: 'JS' }).doc })
  await store.flush()
})
const tool = () =>
  render(
    <ProjectProvider store={store}>
      <Week8LabTool />
    </ProjectProvider>,
  )
const doc = () => store.getState().doc!
const byId = (id: string) => Object.values(doc().artifacts).find((a) => a.id === id)!

describe('Week 8 lab tool: My Project as the Week 1 source', () => {
  it('file stays the default; choosing My Project shows the project, revision and time, and generates the same model as the file', async () => {
    const { unmount } = tool()
    expect(screen.getByTestId('w8-source-file')).toBeChecked()
    expect(screen.getByTestId('w8-import-week1')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('w8-source-project'))
    await waitFor(() => expect(screen.getByTestId('w8-project-info')).toBeInTheDocument())
    expect(screen.getByTestId('w8-source-project')).toBeChecked()
    expect(screen.queryByTestId('w8-import-week1')).toBeNull() // one Week 1 source at a time
    expect(screen.getByTestId('w8-project-info')).toHaveTextContent(`In use: My Project “${projectTitle(doc())}”`)
    expect(screen.getByTestId('w8-project-rev')).toHaveTextContent(String(doc().rev))
    expect(screen.getByTestId('w8-project-info')).toHaveTextContent('not being saved by this browser') // a memory store in this test
    expect(screen.getByTestId('w8-summary-source')).toHaveTextContent(`revision ${doc().rev}`)
    const fromProject = screen.getByTestId('w8-preview').textContent
    unmount()
    // the same data imported as a file gives the same text
    window.localStorage.clear()
    tool()
    fireEvent.change(screen.getByTestId('w8-import-week1'), { target: { files: [new File([JSON.stringify(teamModelInputs(TEAM_FIXTURE, '2026-10-19'))], 'w1.json', { type: 'application/json' })] } })
    await waitFor(() => expect(screen.getByTestId('w8-preview')).toBeInTheDocument())
    const fromFile = screen.getByTestId('w8-preview').textContent!
    const strip = (t: string) => t.replace(/ on \d{4}-\d{2}-\d{2}/, '')
    expect(strip(fromProject!)).toBe(strip(fromFile))
  })

  it('a package per ID is saved in My Project with provenance, refuses an empty reason, accepts a short one, and survives a reload', async () => {
    const { unmount } = tool()
    fireEvent.click(screen.getByTestId('w8-source-project'))
    await waitFor(() => expect(screen.getByTestId('w8-ids')).toBeInTheDocument())
    const row = () => screen.getByTestId('w8-id-STK-001')
    expect(row()).toHaveAttribute('data-state', 'not-mapped')
    // another package with an empty answer is refused
    fireEvent.change(screen.getByTestId('w8-pkg-STK-001'), { target: { value: 'Context' } })
    fireEvent.change(screen.getByTestId('w8-reason-STK-001'), { target: { value: 'n/a' } })
    fireEvent.click(screen.getByTestId('w8-confirm-STK-001'))
    expect(screen.getByTestId('w8-ids-msg')).toHaveAttribute('role', 'alert')
    expect(week8MappingOf(doc(), byId('STK-001').uid)).toBeUndefined()
    // a short real reason is accepted
    fireEvent.change(screen.getByTestId('w8-reason-STK-001'), { target: { value: 'Regulator' } })
    fireEvent.click(screen.getByTestId('w8-confirm-STK-001'))
    await waitFor(() => expect(row()).toHaveAttribute('data-state', 'mapped'))
    expect(screen.getByTestId('w8-status-STK-001')).toHaveTextContent('MAP-001')
    const m = week8MappingOf(doc(), byId('STK-001').uid)!
    expect(m).toMatchObject({ id: 'MAP-001', pkg: 'Context', rule: 'custom', statusReason: 'Regulator', source: { id: 'STK-001' } })
    expect(m.confirmedBy?.at).toBeTruthy()
    // confirm every other proposed mapping at once
    fireEvent.click(screen.getByTestId('w8-confirm-all'))
    await waitFor(() => expect(screen.getByTestId('w8-id-CON-001')).toHaveAttribute('data-state', 'mapped'))
    await act(() => store.flush())
    const ids = Object.values(doc().mappings).map((x) => x.id)
    unmount()
    store.dispose()
    // reload: a new store on the same storage, a new tool from the saved browser state
    await openStore()
    tool()
    await waitFor(() => expect(screen.getByTestId('w8-ids')).toBeInTheDocument())
    expect(screen.getByTestId('w8-source-project')).toBeChecked()
    expect(screen.getByTestId('w8-id-STK-001')).toHaveAttribute('data-state', 'mapped')
    expect(screen.getByTestId('w8-pkg-STK-001')).toHaveValue('Context')
    expect(screen.queryByTestId('w8-project-changed')).toBeNull() // a reload is not a change; nor are the mapping writes
    expect(Object.values(doc().mappings).map((x) => x.id)).toEqual(ids) // stable, never renumbered
  })

  it('a change in My Project after the mappings is reported, the mapping kept, and the read revision flagged', async () => {
    tool()
    fireEvent.click(screen.getByTestId('w8-source-project'))
    await waitFor(() => expect(screen.getByTestId('w8-ids')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('w8-confirm-all'))
    await waitFor(() => expect(screen.getByTestId('w8-id-NEED-001')).toHaveAttribute('data-state', 'mapped'))
    const stk = byId('STK-001')
    act(() => {
      store.apply([{ op: 'update-artifact', uid: stk.uid, fields: [{ path: 'title', before: stk.title, after: 'County food safety office' }] }])
      store.apply((d) => [{ op: 'retire-artifact', uid: Object.values(d.artifacts).find((a) => a.id === 'NEED-001')!.uid, reason: 'Merged' }])
    })
    await waitFor(() => expect(screen.getByTestId('w8-drift')).toBeInTheDocument())
    expect(screen.getByTestId('w8-drift-renamed')).toHaveTextContent('is now “County food safety office”')
    expect(screen.getByTestId('w8-drift-removed')).toHaveTextContent('NEED-001')
    expect(screen.getByTestId('w8-id-NEED-001')).toHaveAttribute('data-state', 'removed')
    expect(screen.getByTestId('w8-project-changed')).toHaveTextContent('has changed since you read it')
    // withdraw keeps the record; confirming again clears the rename
    fireEvent.click(screen.getByTestId('w8-withdraw-NEED-001'))
    await waitFor(() => expect(screen.getByTestId('w8-id-NEED-001')).toHaveAttribute('data-state', 'withdrawn'))
    fireEvent.click(screen.getByTestId('w8-confirm-STK-001'))
    await waitFor(() => expect(screen.getByTestId('w8-id-STK-001')).toHaveAttribute('data-state', 'mapped'))
    expect(screen.queryByTestId('w8-drift')).toBeNull()
    fireEvent.click(screen.getByTestId('w8-project-reread'))
    await waitFor(() => expect(screen.queryByTestId('w8-project-changed')).toBeNull())
  })

  it('going back to a file clears what came from the project; without a project the choice is explained', async () => {
    tool()
    fireEvent.click(screen.getByTestId('w8-source-project'))
    await waitFor(() => expect(screen.getByTestId('w8-preview')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('w8-source-file'))
    await waitFor(() => expect(screen.queryByTestId('w8-preview')).toBeNull())
    expect(screen.getByTestId('w8-import-week1')).toBeInTheDocument()
    expect(within(screen.getByTestId('w8-readiness')).getByText(/Week 1 model inputs imported/)).toBeInTheDocument()
  })

  it('with no project the My Project option is disabled with a reason', async () => {
    const empty = new ProjectStore(new MemoryAdapter(), { startEmpty: true })
    await empty.init()
    render(
      <ProjectProvider store={empty}>
        <Week8LabTool />
      </ProjectProvider>,
    )
    expect(screen.getByTestId('w8-source-project')).toBeDisabled()
    expect(screen.getByTestId('w8-project-none')).toHaveTextContent('No team project is open')
  })
})

describe('review fixes: truthful save outcome, read-only notice, damaged saved state, unreadable records', () => {
  /** A store whose adapter reports browser storage (so a confirmed save is "Saved in this browser"). */
  async function browserStore(failWrites: false | 'write' = false) {
    const ad = new MemoryAdapter({ failWrites: false })
    Object.defineProperty(ad, 'kind', { value: 'indexeddb' })
    const s = new ProjectStore(ad, { startEmpty: true, autosaveMs: 0, locks: false, channel: false, retryMs: 50 })
    await s.init()
    await s.create({ doc: fromTeamRecord(TEAM_FIXTURE, { initials: 'JS' }).doc })
    await s.flush()
    ad.failWrites = failWrites
    return s
  }
  const renderWith = (s: ProjectStore) =>
    render(
      <ProjectProvider store={s}>
        <Week8LabTool />
      </ProjectProvider>,
    )

  it('a confirmation is shown as pending until the store confirms the save, then ✓ saved', async () => {
    store = await browserStore()
    renderWith(store)
    fireEvent.click(screen.getByTestId('w8-source-project'))
    await waitFor(() => expect(screen.getByTestId('w8-ids')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('w8-confirm-STK-001'))
    const msg = () => screen.getByTestId('w8-ids-msg')
    expect(msg()).toHaveAttribute('data-state', 'pending')
    expect(msg()).not.toHaveTextContent('✓')
    expect(msg()).toHaveTextContent('Saving…')
    await waitFor(() => expect(msg()).toHaveAttribute('data-state', 'saved'))
    expect(msg()).toHaveTextContent('✓ STK-001: package Stakeholders recorded in My Project. Saved in this browser.')
  })

  it('a save that fails is shown as failed, never as success', async () => {
    store = await browserStore('write')
    renderWith(store)
    fireEvent.click(screen.getByTestId('w8-source-project'))
    await waitFor(() => expect(screen.getByTestId('w8-ids')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('w8-confirm-STK-001'))
    await waitFor(() => expect(screen.getByTestId('w8-ids-msg')).toHaveAttribute('data-state', 'failed'))
    expect(screen.getByTestId('w8-ids-msg')).toHaveAttribute('role', 'alert')
    expect(screen.getByTestId('w8-ids-msg')).toHaveTextContent('not saved')
    expect(screen.getByTestId('w8-ids-msg')).not.toHaveTextContent('✓')
  })

  it('no read-only notice while the writer lock is being acquired; the store’s own reason once it is read-only', async () => {
    tool()
    fireEvent.click(screen.getByTestId('w8-source-project'))
    await waitFor(() => expect(screen.getByTestId('w8-ids')).toBeInTheDocument())
    const set = (p: object) => act(() => (store as unknown as { set: (x: object) => void }).set(p))
    set({ readOnly: true, lock: 'acquiring' })
    expect(screen.queryByTestId('readonly-banner')).toBeNull()
    expect(screen.getByTestId('w8-confirm-STK-001')).toBeEnabled()
    set({ readOnly: true, lock: 'other-tab', readOnlyReason: 'Another tab is editing this project.' })
    expect(screen.getByTestId('readonly-banner')).toHaveTextContent('Another tab is editing this project.')
    expect(screen.getByTestId('w8-confirm-STK-001')).toBeDisabled()
    set({ readOnly: true, lock: 'held', readOnlyReason: 'A teammate saved first.', save: { kind: 'conflict', reason: 'A teammate saved first.' } })
    expect(screen.getByTestId('readonly-banner')).toHaveTextContent('Conflict requires review.')
  })

  it('damaged saved state (a project source without its project) falls back to the file import with a notice', () => {
    window.localStorage.setItem('sysml-studio:v1:w8.import', JSON.stringify({ source: 'project', projectRef: 'junk', week1: { team: '07', enterprise: { name: 'Leftover' } }, week1Origin: 'My Project' }))
    tool()
    expect(screen.getByTestId('w8-source-file')).toBeChecked()
    expect(screen.getByTestId('w8-import-week1')).toBeInTheDocument()
    expect(screen.getByTestId('w8-message')).toHaveTextContent('back on the file import')
    expect(screen.queryByTestId('w8-summary')).toBeNull()
  })

  it('an unreadable mapping record in the project is reported in plain words, never a crash', async () => {
    const d = store.getState().doc!
    const stk = Object.values(d.artifacts).find((a) => a.id === 'STK-001')!
    await store.importReplace({ ...d, mappings: { bad: { uid: 'bad', id: 'MAP-001', artifact: stk.uid, status: 'mapped', source: { id: 'STK-001', title: 5 }, confirmedBy: 'JS' } as never, junk: { uid: 'junk', id: 'MAP-002', artifact: stk.uid, source: 'x' } as never } }, 'test', 'test')
    tool()
    fireEvent.click(screen.getByTestId('w8-source-project'))
    await waitFor(() => expect(screen.getByTestId('w8-ids')).toBeInTheDocument())
    expect(screen.getByTestId('w8-skipped')).toHaveTextContent('could not be read and are not shown: MAP-002')
    expect(screen.getByTestId('w8-skipped')).not.toHaveTextContent('MAP-001')
    expect(screen.getByTestId('w8-partial')).toHaveTextContent('read only in part; they are shown with what could be read: MAP-001')
    expect(screen.getByTestId('w8-id-STK-001')).toBeInTheDocument()
  })
})
