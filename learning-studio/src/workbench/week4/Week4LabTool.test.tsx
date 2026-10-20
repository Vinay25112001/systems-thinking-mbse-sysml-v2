// The Week 4 lab tool in the DOM: importing the Week 3 JSON fixture shows its enterprise and seeds the required viewpoints;
// a function named after a physical element fails the name gate and a good one passes; an allocation to an element its
// logical element does not reach fails the consistency gate; the JSON export is versioned; a teammate's file imports; wrong
// files are refused with a message. Uses the fictional food bank fixture, never AeroLink.
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WEEK2_JSON } from '../week3/fixture'
import { WEEK3_JSON, week4Fixture } from './fixture'
import { modelInputs } from './record'
import Week4LabTool from './Week4LabTool'

const downloads: { name: string; text: string; type?: string }[] = []
vi.mock('../download', () => ({ downloadText: (name: string, text: string, type?: string) => (downloads.push({ name, text, type }), true) }))

beforeEach(() => {
  window.localStorage.clear()
  downloads.length = 0
})

const upload = (testId: string, text: string, name = 'file.json') => fireEvent.change(screen.getByTestId(testId), { target: { files: [new File([text], name, { type: 'application/json' })] } })
const gate = (scope: string, id: string) => within(screen.getByTestId(`w4-gates-${scope}`)).getAllByRole('listitem').find((li) => li.getAttribute('data-gate') === id)!
const set = (testId: string, value: string) => fireEvent.change(screen.getByTestId(testId), { target: { value } })

describe('Week 4 lab tool', () => {
  it('renders every Part and starts not ready', () => {
    render(<Week4LabTool />)
    for (const id of ['w4-tool', 'w4-import-week3', 'w4-part-views', 'w4-part-functions', 'w4-part-allocation', 'w4-part-information', 'w4-part-ai', 'w4-consistency', 'w4-export-md', 'w4-export-json', 'w4-import-week4']) expect(screen.getByTestId(id)).toBeInTheDocument()
    expect(screen.getByTestId('w4-state')).toHaveTextContent(/^○ not ready/)
  })

  it('imports the Week 3 JSON, shows the enterprise and seeds the five required viewpoints', async () => {
    render(<Week4LabTool />)
    upload('w4-import-week3', WEEK3_JSON, 'team-07-week3-model-inputs.json')
    await waitFor(() => expect(screen.getByTestId('w4-week3-summary')).toHaveTextContent('Riverside Food Bank Network'))
    for (const id of ['VP-001', 'VP-002', 'VP-003', 'VP-004', 'VP-005']) expect(screen.getByTestId(`w4-${id}`)).toBeInTheDocument()
  })

  it('refuses a Week 2 file and a foreign file with a clear message', async () => {
    render(<Week4LabTool />)
    upload('w4-import-week3', WEEK2_JSON)
    await waitFor(() => expect(screen.getByTestId('w4-message')).toHaveTextContent(/Week 2 model-inputs file/))
    upload('w4-import-week3', '{"format":"something-else"}')
    await waitFor(() => expect(screen.getByTestId('w4-message')).toHaveTextContent('✗'))
    expect(screen.queryByTestId('w4-week3-summary')).toBeNull()
  })

  it('a teammate’s complete record is ready; renaming a function after an element fails the name gate, and a bad allocation fails consistency', async () => {
    render(<Week4LabTool />)
    upload('w4-import-week4', JSON.stringify(modelInputs(week4Fixture())), 'team-07-week4-model-inputs.json')
    await waitFor(() => expect(screen.getByTestId('w4-state')).toHaveTextContent(/^✓ ready/))
    expect(gate('FN-001', 'name')).toHaveAttribute('data-ok', 'true')
    set('w4-FN-001-name', 'Refrigerated vans')
    await waitFor(() => expect(gate('FN-001', 'name')).toHaveAttribute('data-ok', 'false'))
    set('w4-FN-001-name', 'Plan delivery route')
    set('w4-FN-001-phy', 'PHY-002')
    await waitFor(() => expect(gate('alloc-FN-001', 'consistent')).toHaveAttribute('data-ok', 'false'))
    expect(screen.getByTestId('w4-state')).toHaveTextContent(/not ready/)
  })

  it('exports the versioned JSON and the Markdown record', async () => {
    render(<Week4LabTool />)
    upload('w4-import-week4', JSON.stringify(modelInputs(week4Fixture())))
    await waitFor(() => expect(screen.getByTestId('w4-state')).toHaveTextContent(/^✓ ready/))
    fireEvent.click(screen.getByTestId('w4-export-json'))
    fireEvent.click(screen.getByTestId('w4-export-md'))
    const json = downloads.find((d) => d.name.endsWith('week4-model-inputs.json'))!
    expect(JSON.parse(json.text)).toMatchObject({ format: 'week4-model-inputs', version: 1, status: 'ready' })
    expect(downloads.find((d) => d.name.endsWith('week4-record.md'))!.text).toContain('## Consistency checks')
  })
})
