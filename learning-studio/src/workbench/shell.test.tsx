// Workbench shell keyboard and selection behaviour (Testing Library, jsdom).
import { PREDICTION_OPTIONS } from '../content/missions/week01'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Providers } from '../state/Providers'
import { WorkbenchShell } from './WorkbenchShell'

beforeAll(() => {
  // jsdom lacks these browser APIs used by the panel library, React Flow and Recharts
  class RO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  const g = globalThis as unknown as Record<string, unknown>
  g.ResizeObserver ??= RO
  g.DOMMatrixReadOnly ??= class {
    m22 = 1
    constructor() {}
  }
  if (!window.matchMedia)
    window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as typeof window.matchMedia
  Element.prototype.scrollIntoView ??= function () {}
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 })
})
beforeEach(() => window.localStorage.clear())

const renderShell = () =>
  render(
    <Providers>
      <WorkbenchShell week={1} />
    </Providers>,
  )
const flush = () => act(() => new Promise((r) => requestAnimationFrame(() => r(null))))

describe('workbench shell', () => {
  it('names its regions and shows the week as the page heading', () => {
    renderShell()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^Week 1 — Team Formation \/ Needs \/ Identifying Stakeholders/)
    for (const name of ['Top bar', 'Workbench tools', 'Model browser', 'Center view', 'Properties', 'Mission brief', 'Dock: problems, changes and console', 'Status bar'])
      expect(screen.getAllByLabelText(name).length).toBeGreaterThan(0)
    expect(screen.getByRole('tree', { name: 'Model browser' })).toBeInTheDocument()
    expect(screen.getByRole('tablist', { name: 'Center views' })).toBeInTheDocument()
  })

  it('F6 and Shift+F6 cycle focus through the regions in order', async () => {
    renderShell()
    const order: string[] = []
    for (let i = 0; i < 9; i++) {
      fireEvent.keyDown(window, { key: 'F6' })
      order.push((document.activeElement as HTMLElement).closest('[data-wb-region]')!.getAttribute('data-wb-region')!)
    }
    expect(order).toEqual(['topbar', 'rail', 'brief', 'view', 'dock', 'browser', 'properties', 'status', 'topbar'])
    fireEvent.keyDown(window, { key: 'F6', shiftKey: true })
    expect(document.activeElement).toHaveAttribute('data-wb-region', 'status')
  })

  it('arrow keys move through the model tree, Right/Left expand and collapse, Enter selects', async () => {
    renderShell()
    const tree = screen.getByRole('tree', { name: 'Model browser' })
    const first = within(tree).getAllByRole('treeitem')[0]
    expect(first).toHaveAttribute('tabindex', '0')
    expect(first).toHaveTextContent(/^Team Record/)
    first.focus()
    // Team Record (expanded) → its first part
    fireEvent.keyDown(first, { key: 'ArrowRight' })
    await flush()
    expect(document.activeElement).toHaveAttribute('data-row', 'team:charter')
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' })
    expect(screen.getByTestId('tree-team:charter')).toHaveAttribute('aria-selected', 'true')
    expect(within(screen.getByTestId('properties')).getByText('Team Record, part 1 Team charter')).toBeInTheDocument()
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' })
    await flush()
    expect(document.activeElement).toBe(first)
    fireEvent.keyDown(first, { key: 'ArrowLeft' })
    await flush()
    expect(first).toHaveAttribute('aria-expanded', 'false')
    fireEvent.keyDown(first, { key: 'ArrowDown' })
    await flush()
    expect(document.activeElement).toHaveTextContent(/^AeroLink stakeholders/)
    fireEvent.keyDown(document.activeElement!, { key: 'End' })
    await flush()
    expect(document.activeElement).toBe(within(tree).getAllByRole('treeitem').at(-1))
    fireEvent.keyDown(document.activeElement!, { key: 'Home' })
    await flush()
    expect(document.activeElement).toBe(first)
  })

  it('? opens the shortcuts dialog and Esc closes it', async () => {
    const user = userEvent.setup()
    renderShell()
    await user.keyboard('?')
    expect(await screen.findByRole('dialog', { name: 'Keyboard shortcuts' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Keyboard shortcuts' })).toBeNull()
  })

  it('a problem row selects its element; a mission step records an answer and its check updates', async () => {
    // jsdom has no layout, so the panel library's document-level pointer handling claims every pointer-down at (0,0);
    // this test therefore drives the controls with fireEvent (the e2e suite covers real pointer input).
    renderShell()
    fireEvent.mouseDown(screen.getByRole('tab', { name: /Boundary & context/ }), { button: 0 })
    const ext = await screen.findByTestId('ext-form', {}, { timeout: 15000 }) // centre views load lazily
    fireEvent.change(within(ext).getByLabelText('External system or actor'), { target: { value: 'Electric utility' } })
    fireEvent.change(within(ext).getByLabelText('Owner (initials)'), { target: { value: 'JS' } })
    fireEvent.click(within(ext).getByRole('button', { name: /Add external system/ }))
    // a recorded external system without an exchange raises a Week 1 problem
    const problems = screen.getByTestId('problems-table')
    expect(problems).toHaveTextContent('EXT-001 has no labeled exchange')
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }))
    expect(screen.getByTestId('tree-EXT-001')).toHaveAttribute('aria-selected', 'false')
    fireEvent.click(within(problems).getByRole('button', { name: /Select EXT-001/ }))
    expect(screen.getByTestId('tree-EXT-001')).toHaveAttribute('aria-selected', 'true')
    const props = screen.getByTestId('properties')
    // fixing it in Properties clears the problem, and Changes & impact records what moved
    fireEvent.change(within(props).getByLabelText('Exchange with the SoI'), { target: { value: 'power' } })
    expect(within(screen.getByTestId('dock')).queryByText('EXT-001 has no labeled exchange')).toBeNull()
    fireEvent.mouseDown(screen.getByRole('tab', { name: /Changes & impact/ }), { button: 0 })
    expect(screen.getByTestId('changes-list')).toHaveTextContent('cleared')
    expect(screen.getByTestId('changes-list')).toHaveTextContent('EXT elements: 0 → 1')

    // the try-first prediction is recorded and then locked
    const brief = screen.getByTestId('mission-brief')
    fireEvent.click(within(brief).getByLabelText(PREDICTION_OPTIONS[2].text))
    fireEvent.click(within(brief).getByRole('button', { name: 'Record: Your prediction' }))
    const predict = screen.getByTestId('step-predict')
    expect(predict).toHaveAttribute('data-status', 'done')
    expect(screen.getByTestId('step-identify')).toHaveAttribute('data-status', 'current')
    fireEvent.click(within(predict).getByRole('button', { name: 'Details' }))
    expect(within(predict).getByText('Recorded and locked')).toBeInTheDocument()
    expect(within(screen.getByTestId('step-predict')).getByLabelText(PREDICTION_OPTIONS[0].text)).toBeDisabled()
  })

  it("the current step's view is the emphasised tab; the other views stay reachable in a quieter list", async () => {
    renderShell()
    const primary = screen.getByRole('tablist', { name: 'Center views' })
    expect(within(primary).getByRole('tab', { name: /Stakeholders/ })).toHaveTextContent(/current step/)
    const others = screen.getByRole('tablist', { name: 'Other views' })
    for (const t of ['Boundary & context', 'Needs', 'Team enterprise']) expect(within(others).getByRole('tab', { name: t })).toBeInTheDocument()
    // the causal-loop and dynamics views are no longer part of Week 1
    for (const t of ['Causal loops', 'Dynamics', 'L1 record']) expect(within(others).queryByRole('tab', { name: t })).toBeNull()
    expect(await screen.findByTestId('view-stakeholders', {}, { timeout: 15000 })).toBeInTheDocument()
  })

  it('Ctrl+Z undoes a model edit and Ctrl+Shift+Z redoes it; both are recorded in Changes & impact', async () => {
    renderShell()
    fireEvent.mouseDown(screen.getByRole('tab', { name: /Boundary & context/ }), { button: 0 })
    const ext = await screen.findByTestId('ext-form', {}, { timeout: 15000 })
    fireEvent.change(within(ext).getByLabelText('External system or actor'), { target: { value: 'Electric utility' } })
    fireEvent.change(within(ext).getByLabelText('Owner (initials)'), { target: { value: 'JS' } })
    fireEvent.click(within(ext).getByRole('button', { name: /Add external system/ }))
    expect(screen.getByTestId('tree-EXT-001')).toBeInTheDocument()
    expect(screen.getByTestId('undo')).toBeEnabled()
    expect(screen.getByTestId('redo')).toBeDisabled()
    // in a text field Ctrl+Z is left to the browser
    fireEvent.keyDown(within(ext).getByLabelText('External system or actor'), { key: 'z', ctrlKey: true })
    expect(screen.queryByTestId('tree-EXT-001')).toBeInTheDocument()
    fireEvent.keyDown(document.body, { key: 'z', ctrlKey: true })
    expect(screen.queryByTestId('tree-EXT-001')).toBeNull()
    expect(screen.getByTestId('redo')).toBeEnabled()
    fireEvent.mouseDown(screen.getByRole('tab', { name: /Changes & impact/ }), { button: 0 })
    expect(screen.getByTestId('changes-list')).toHaveTextContent(/Undo of change 1/)
    fireEvent.keyDown(document.body, { key: 'Z', ctrlKey: true, shiftKey: true })
    expect(screen.getByTestId('tree-EXT-001')).toBeInTheDocument()
    // the redone EXT brings its problem back, so the dock shows Problems again
    expect(screen.getByTestId('problems-table')).toHaveTextContent('EXT-001 has no labeled exchange')
    fireEvent.mouseDown(screen.getByRole('tab', { name: /Changes & impact/ }), { button: 0 })
    expect(screen.getByTestId('changes-list')).toHaveTextContent(/Redo of change 1/)
    // a new edit after an undo clears the redo history
    fireEvent.click(screen.getByTestId('undo'))
    expect(screen.queryByTestId('tree-EXT-001')).toBeNull()
    fireEvent.change(within(ext).getByLabelText('External system or actor'), { target: { value: 'Grid operator' } })
    fireEvent.click(within(ext).getByRole('button', { name: /Add external system/ }))
    expect(screen.getByTestId('tree-EXT-002')).toBeInTheDocument() // IDs are never reused
    expect(screen.getByTestId('redo')).toBeDisabled()
  })

  it('Properties folds to a one-line hint while nothing is selected', async () => {
    renderShell()
    const props = screen.getAllByLabelText('Properties')[0]
    expect(props).toHaveTextContent('Nothing selected')
    fireEvent.keyDown(screen.getByRole('tree', { name: 'Model browser' }).querySelector('[data-row="g-boundary"]')!, { key: 'ArrowRight' })
    await flush()
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' })
    expect(within(screen.getAllByLabelText('Properties')[0]).getByText('AeroLink aircraft fleet')).toBeInTheDocument()
  })
})
