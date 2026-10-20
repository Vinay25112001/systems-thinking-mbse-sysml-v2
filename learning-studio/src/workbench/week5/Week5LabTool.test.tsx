// The Week 5 lab tool in the DOM: every Part renders and the record starts not ready; importing the Week 4 JSON fixture
// shows its enterprise and seeds one responsibility card per physical element; a wrong file is refused with a message; a
// teammate's complete record is ready, the N² table is accessible and its degree sum is twice the interfaces; removing a
// relay fails the crossing-flow check; an interface that crosses a trust boundary without protection fails that gate; the
// exports are versioned. Uses the fictional food bank fixture, never AeroLink.
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WEEK3_JSON } from '../week4/fixture'
import { WEEK4_JSON, week5Fixture } from './fixture'
import { modelInputs, pairKey } from './record'
import Week5LabTool from './Week5LabTool'

const downloads: { name: string; text: string; type?: string }[] = []
vi.mock('../download', () => ({ downloadText: (name: string, text: string, type?: string) => (downloads.push({ name, text, type }), true) }))

beforeEach(() => {
  window.localStorage.clear()
  downloads.length = 0
})

const upload = (testId: string, text: string, name = 'file.json') => fireEvent.change(screen.getByTestId(testId), { target: { files: [new File([text], name, { type: 'application/json' })] } })
const gate = (scope: string, id: string) => within(screen.getByTestId(`w5-gates-${scope}`)).getAllByRole('listitem').find((li) => li.getAttribute('data-gate') === id)!
const set = (testId: string, value: string) => fireEvent.change(screen.getByTestId(testId), { target: { value } })

describe('Week 5 lab tool', () => {
  it('renders every Part and starts not ready', () => {
    render(<Week5LabTool />)
    for (const id of ['w5-tool', 'w5-import-week4', 'w5-import-week5', 'w5-part-breakdown', 'w5-part-interfaces', 'w5-part-requirements', 'w5-part-management', 'w5-part-ai', 'w5-n2', 'w5-add-interface', 'w5-add-component', 'w5-add-requirement', 'w5-add-change', 'w5-export-md', 'w5-export-json'])
      expect(screen.getByTestId(id)).toBeInTheDocument()
    expect(screen.getByTestId('w5-state')).toHaveTextContent(/^○ not ready/)
  })

  it('imports the Week 4 JSON, shows the enterprise and seeds a card per physical element; refuses a Week 3 file', async () => {
    render(<Week5LabTool />)
    upload('w5-import-week4', WEEK4_JSON, 'team-07-week4-model-inputs.json')
    await waitFor(() => expect(screen.getByTestId('w5-week4-summary')).toHaveTextContent('Riverside Food Bank Network'))
    for (const id of ['PHY-001', 'PHY-002', 'PHY-003', 'PHY-004', 'PHY-005']) expect(screen.getByTestId(`w5-card-${id}`)).toBeInTheDocument()
    upload('w5-import-week4', WEEK3_JSON)
    await waitFor(() => expect(screen.getByTestId('w5-message')).toHaveTextContent(/✗ This is a Week 3 model-inputs file/))
  })

  it('a teammate’s complete record is ready; the N² is an accessible table; removing the relay or the protection fails its check', async () => {
    render(<Week5LabTool />)
    upload('w5-import-week5', JSON.stringify(modelInputs(week5Fixture())), 'team-07-week5-model-inputs.json')
    await waitFor(() => expect(screen.getByTestId('w5-state')).toHaveTextContent(/^✓ ready/))
    const table = screen.getByTestId('w5-n2')
    expect(within(table).getByText(/Degree sum 20 = 2 × 10 interfaces/)).toBeInTheDocument()
    expect(within(table).getAllByRole('columnheader').length).toBeGreaterThan(5)
    expect(within(table).getAllByRole('rowheader').map((h) => h.textContent)).toContain('PHY-004 Scheduling and reporting software')
    expect(table.querySelector('[data-degree="PHY-004"]')).toHaveTextContent('6')
    set(`w5-relay-${pairKey('INFO-003', 'PHY-002', 'EXT-001')}`, '')
    await waitFor(() => expect(screen.getByTestId('w5-state')).toHaveTextContent(/not ready/))
    set(`w5-relay-${pairKey('INFO-003', 'PHY-002', 'EXT-001')}`, 'IF-002, IF-003')
    await waitFor(() => expect(screen.getByTestId('w5-state')).toHaveTextContent(/^✓ ready/))
    expect(gate('IF-007', 'protection')).toHaveAttribute('data-ok', 'true')
    set('w5-IF-007-protection', '')
    await waitFor(() => expect(gate('IF-007', 'protection')).toHaveAttribute('data-ok', 'false'))
    expect(gate('IF-007', 'protection')).toHaveTextContent('✗ fails')
  })

  it('exports the versioned JSON and the Markdown record', async () => {
    render(<Week5LabTool />)
    upload('w5-import-week5', JSON.stringify(modelInputs(week5Fixture())))
    await waitFor(() => expect(screen.getByTestId('w5-state')).toHaveTextContent(/^✓ ready/))
    fireEvent.click(screen.getByTestId('w5-export-json'))
    fireEvent.click(screen.getByTestId('w5-export-md'))
    const json = downloads.find((d) => d.name.endsWith('week5-model-inputs.json'))!
    expect(JSON.parse(json.text)).toMatchObject({ format: 'week5-model-inputs', version: 1, status: 'ready' })
    expect(downloads.find((d) => d.name.endsWith('week5-record.md'))!.text).toContain('### N² chart')
  })
})
