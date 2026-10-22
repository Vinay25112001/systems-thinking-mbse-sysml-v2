// The Week 1 canvas in a DOM (M6; spec §f): one canonical model behind the table, the map and the detail panel; field
// guidance on focus with the eight items; progress from real artifacts; offline approval stated honestly and no
// self-declared approval control anywhere; conflicting concerns and assumptions written through the store; Review &
// Submit states and notes. Server-mode flows run end to end in e2e/project-canvas.e2e.ts.
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { TEAM_FIXTURE } from '../../workbench/week1/teamFixture'
import { fromTeamRecord } from '../adapters/week1'
import { emptyProject } from '../model/create'
import type { ProjectDoc } from '../model/types'
import { MemoryAdapter } from '../store/memory'
import { ProjectProvider } from '../store/ProjectProvider'
import { ProjectStore } from '../store/ProjectStore'
import { Week1Canvas } from './Canvas'
import ReviewSubmit from '../../week1/review/ReviewSubmit'
import { AppStateProvider } from '../../state/AppState'

let store: ProjectStore
async function withDoc(doc: ProjectDoc) {
  store = new ProjectStore(new MemoryAdapter(), { startEmpty: true, autosaveMs: 0 })
  await store.init()
  await store.create({ doc })
  return store
}
const canvas = (part?: string) =>
  render(
    <ProjectProvider store={store}>
      <Week1Canvas part={part} />
    </ProjectProvider>,
  )
const doc = () => store.getState().doc!
const byId = (id: string) => Object.values(doc().artifacts).find((a) => a.id === id)!
const blurType = async (el: HTMLElement, value: string) => {
  fireEvent.focus(el)
  fireEvent.change(el, { target: { value } })
  await act(async () => {
    fireEvent.blur(el)
  })
}

beforeEach(() => window.localStorage.clear())

describe('entry states', () => {
  it('without a project the canvas offers to create it (no AeroLink text in the empty state)', async () => {
    store = new ProjectStore(new MemoryAdapter(), { startEmpty: true })
    await store.init()
    canvas()
    expect(await screen.findByTestId('canvas-create')).toHaveTextContent('Create it once per team')
    expect(screen.getByTestId('canvas-create').querySelector('p')).not.toHaveTextContent(/AeroLink/)
  })
})

describe('the canvas', () => {
  it('overview: banner, part navigator with states, transparent headline, honest offline approval, lab drawer', async () => {
    await withDoc(fromTeamRecord(TEAM_FIXTURE, { initials: 'JS' }).doc)
    canvas()
    expect(await screen.findByTestId('canvas-banner')).toHaveTextContent('Your enterprise')
    expect(screen.getByTestId('canvas-banner')).toHaveTextContent('Riverside Food Bank Network')
    expect(screen.getByTestId('canvas-headline')).toHaveTextContent('6 of 7 required parts meet the course checks')
    for (const id of ['overview', 'team', 'enterprise', 'boundary', 'stakeholders', 'concerns', 'relationships', 'needs', 'assumptions', 'week8']) expect(screen.getByTestId(`nav-${id}`)).toBeInTheDocument()
    expect(screen.getByTestId('overview-approval')).toHaveTextContent('Instructor approval happens on the course server')
    expect(screen.getByTestId('lab-drawer')).toBeInTheDocument()
    expect(screen.getByTestId('overview-future')).toHaveTextContent('Next: Week 2')
  })

  it('enterprise: no self-declared approval control; offline says approval needs the course server; a legacy flag is read-only', async () => {
    await withDoc(fromTeamRecord(TEAM_FIXTURE, { initials: 'JS' }).doc)
    canvas('enterprise')
    expect(await screen.findByTestId('approval-offline')).toHaveTextContent('Instructor approval happens on the course server')
    expect(screen.getByTestId('approval-legacy')).toHaveTextContent('not an approval')
    expect(screen.queryByRole('combobox', { name: /decision/i })).toBeNull()
    expect(screen.queryByText(/submitted for approval \(not yet approved\)/)).toBeNull()
    expect(screen.queryByTestId('request-approval')).toBeNull()
  })

  it('field guidance appears on focus with the eight items, without moving focus; validation follows the selected item', async () => {
    await withDoc(fromTeamRecord(TEAM_FIXTURE, { initials: 'JS' }).doc)
    canvas('stakeholders')
    const input = await screen.findByTestId('stk-STK-002-interest')
    act(() => input.focus())
    const g = await screen.findByTestId('field-guidance')
    expect(document.activeElement).toBe(input)
    expect(within(g).getByTestId('guidance-label')).toHaveTextContent('Level of interest')
    for (const t of ['Definition', 'What is expected', 'AeroLink example', 'Format', 'Objective', 'Later use', 'Validation']) expect(g).toHaveTextContent(t)
    expect(within(g).getByTestId('guidance-example')).toHaveTextContent('Fictional instructor example')
    expect(g).toHaveTextContent('B1.4')
    expect(g).toHaveTextContent('course convention')
    expect(input).toHaveAttribute('aria-describedby')
  })

  it('M6 review M-6: no live region repeats all eight items; a short announcement; a table cell opens the guidance sheet on narrow screens and gets focus back', async () => {
    await withDoc(fromTeamRecord(TEAM_FIXTURE, { initials: 'JS' }).doc)
    canvas('stakeholders')
    const input = await screen.findByTestId('stk-STK-002-support')
    act(() => input.focus())
    expect(screen.getByTestId('field-guidance')).not.toHaveAttribute('aria-live')
    expect(screen.getByTestId('guidance-announce')).toHaveTextContent('Guidance available for Support (optional).')
    // jsdom has no matchMedia: treated as a narrow screen, where the (i) button of a table cell opens the bottom sheet
    const info = screen.getByRole('button', { name: 'Guidance for STK-002 level of interest' })
    fireEvent.click(info)
    const sheet = await screen.findByTestId('guidance-sheet')
    expect(within(sheet).getByTestId('guidance-label')).toHaveTextContent('Level of interest')
    expect(document.activeElement).toBe(within(sheet).getByRole('heading', { name: 'Field guidance' }))
    fireEvent.click(within(sheet).getByTestId('guidance-sheet-close'))
    expect(screen.queryByTestId('guidance-sheet')).toBeNull()
    expect(document.activeElement).toBe(info)
  })

  it('M6 review M-5: the conflicting-concerns guidance shows a concern-to-concern example', async () => {
    await withDoc(fromTeamRecord(TEAM_FIXTURE, { initials: 'JS' }).doc)
    canvas('concerns')
    act(() => screen.getByTestId('conflict-from').focus())
    const ex = await screen.findByTestId('guidance-example')
    expect(ex).toHaveTextContent('CON-012')
    expect(ex).toHaveTextContent('conflicts with CON-006')
    expect(ex).not.toHaveTextContent('REL-002')
  })

  it('one model: a table edit is stored on the stakeholder; the map selects the same record in the detail panel; progress follows', async () => {
    await withDoc(fromTeamRecord(TEAM_FIXTURE, { initials: 'JS' }).doc)
    canvas('stakeholders')
    const sel = (await screen.findByTestId('stk-STK-003-interest')) as HTMLSelectElement
    await act(async () => {
      fireEvent.change(sel, { target: { value: '' } })
    })
    expect(byId('STK-003').attributes.interest ?? null).toBeNull()
    expect(screen.getByTestId('part-count-stakeholders')).toHaveTextContent('7 of 8 complete')
    await act(async () => {
      fireEvent.change(screen.getByTestId('stk-STK-003-interest'), { target: { value: '4' } })
    })
    expect(byId('STK-003').attributes.interest).toBe('4')
    expect(screen.getByTestId('part-count-stakeholders')).toHaveTextContent('8 of 8 complete')
    fireEvent.click(screen.getByTestId('view-map'))
    fireEvent.click(await screen.findByTestId('map-node-STK-004'))
    const det = await screen.findByTestId('detail-artifact')
    expect(det).toHaveTextContent('STK-004')
    expect(det).toHaveTextContent('Volunteer drivers')
    expect(within(det).getByTestId('detail-links')).toHaveTextContent('STK-004 has concern CON-004')
    fireEvent.keyDown(screen.getByTestId('map-edge-REL-001'), { key: 'Enter' })
    expect(await screen.findByTestId('detail-relationship')).toHaveTextContent('REL-001')
    fireEvent.click(screen.getByTestId('view-coverage'))
    expect(screen.getByTestId('coverage-matrix')).toHaveTextContent('STK-008')
  })

  it('conflicting concerns: recorded with a rationale as one relation, visible in the concerns and the all-relations views', async () => {
    await withDoc(fromTeamRecord(TEAM_FIXTURE, { initials: 'JS' }).doc)
    const v = canvas('concerns')
    fireEvent.change(await screen.findByTestId('conflict-from'), { target: { value: 'CON-004' } })
    fireEvent.change(screen.getByTestId('conflict-to'), { target: { value: 'CON-007' } })
    fireEvent.change(screen.getByTestId('conflict-why'), { target: { value: 'Early starts for drivers mean van noise before 6 a.m.' } })
    await act(async () => {
      fireEvent.click(screen.getByTestId('add-conflict'))
    })
    const rel = Object.values(doc().relationships).find((r) => r.type === 'conflicts-with' && r.category === 'trace')!
    expect(rel).toMatchObject({ rationale: 'Early starts for drivers mean van noise before 6 a.m.' })
    expect(screen.getByTestId(`conflict-${rel.id}`)).toHaveTextContent('CON-004 conflicts with CON-007')
    v.unmount()
    canvas('relationships')
    fireEvent.click(await screen.findByTestId('view-all'))
    expect(screen.getByTestId('week1-relations')).toHaveTextContent('conflicting concerns')
    expect(screen.getByTestId('week1-relations')).toHaveTextContent('CON-004 conflicts with CON-007')
    expect(screen.getByTestId('week1-relations')).toHaveTextContent('concern motivates need')
  })

  it('relationships: "Add relationship: from · type · to" creates a REL row with the next ID', async () => {
    await withDoc(fromTeamRecord(TEAM_FIXTURE, { initials: 'JS' }).doc)
    canvas('relationships')
    fireEvent.change(await screen.findByTestId('new-rel-from'), { target: { value: 'STK-006' } })
    fireEvent.change(screen.getByTestId('new-rel-type'), { target: { value: 'funds' } })
    fireEvent.change(screen.getByTestId('new-rel-to'), { target: { value: 'STK-005' } })
    await act(async () => {
      fireEvent.click(screen.getByTestId('add-relationship'))
    })
    const r = Object.values(doc().relationships).find((x) => x.id === 'REL-004')!
    expect(r).toMatchObject({ category: 'stakeholder', type: 'funds' })
    expect(r.draft ?? false).toBe(false)
  })

  it('assumptions and unknowns: optional; added with an ID, a statement and a rationale', async () => {
    await withDoc(fromTeamRecord(TEAM_FIXTURE, { initials: 'JS' }).doc)
    canvas('assumptions')
    expect(await screen.findByTestId('part-assumptions')).toHaveTextContent('None recorded. That is allowed in Week 1.')
    await act(async () => {
      fireEvent.click(screen.getByTestId('add-assumption'))
    })
    await blurType(await screen.findByTestId('au-A-001-title'), 'The warehouse lease runs for three more years.')
    await blurType(screen.getByTestId('au-A-001-rationale'), 'The lease was signed in 2025 for five years.')
    await waitFor(() => expect(byId('A-001')).toMatchObject({ title: 'The warehouse lease runs for three more years.', rationale: 'The lease was signed in 2025 for five years.', milestones: [1] }))
  })

  it('enterprise description and a new project: the empty project shows missing items, not progress', async () => {
    await withDoc(emptyProject({ teamLabel: '07', initials: 'JS' }))
    canvas('enterprise')
    await blurType(await screen.findByTestId('ent-description'), 'A cooperative of neighbourhood tool libraries.')
    await waitFor(() => expect(byId('ENT-001').description).toBe('A cooperative of neighbourhood tool libraries.'))
    expect(screen.getByTestId('part-head-enterprise')).toHaveTextContent('In progress')
  })
})

describe('Review & Submit (offline edition)', () => {
  it('shows the five sections with the advisory statement, the DRAFT state, marks ready for review and keeps team notes', async () => {
    await withDoc(fromTeamRecord(TEAM_FIXTURE, { initials: 'JS' }).doc)
    render(
      <AppStateProvider>
        <ProjectProvider store={store}>
          <ReviewSubmit />
        </ProjectProvider>
      </AppStateProvider>,
    )
    expect(await screen.findByTestId('package-state')).toHaveTextContent('DRAFT')
    for (const n of [1, 2, 3, 4, 5]) expect(screen.getByTestId(`review-s${n}`)).toBeInTheDocument()
    expect(screen.getByTestId('review-s1')).toHaveTextContent('never substitute for your instructor’s assessment')
    expect(screen.getByTestId('submit-offline')).toHaveTextContent('Submission happens on the course server')
    await act(async () => {
      fireEvent.click(screen.getByTestId('mark-ready'))
    })
    expect(screen.getByTestId('package-state')).toHaveTextContent('READY FOR REVIEW')
    expect(doc().milestones[0].teamReview).toMatchObject({ state: 'ready-for-review' })
    const note = within(screen.getByTestId('review-issues')).getAllByRole('textbox')[0]
    await blurType(note, 'We add the description next session.')
    await waitFor(() => expect(Object.values(doc().milestones[0].notes)).toContain('We add the description next session.'))
  })
})
