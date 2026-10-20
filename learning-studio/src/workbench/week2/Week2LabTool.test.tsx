// The Week 2 lab tool in the DOM: importing the Week 1 JSON fixture shows its needs; a requirement with two "shall"s
// fails the one-shall gate; a good requirement passes every gate; the JSON export is versioned; a teammate's file
// imports; a wrong file is refused with a message. Uses the fictional food bank fixture, never AeroLink.
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { REQ_HARD_GATES } from '../../content/lectures/week02/labBrief'
import { WEEK1_JSON, week2Fixture } from './fixture'
import { modelInputs } from './record'
import Week2LabTool from './Week2LabTool'

const downloads: { name: string; text: string; type?: string }[] = []
vi.mock('../download', () => ({ downloadText: (name: string, text: string, type?: string) => (downloads.push({ name, text, type }), true) }))

beforeEach(() => {
  window.localStorage.clear()
  downloads.length = 0
})

const upload = (testId: string, text: string, name = 'file.json') => fireEvent.change(screen.getByTestId(testId), { target: { files: [new File([text], name, { type: 'application/json' })] } })
const gate = (reqId: string, id: string) => within(screen.getByTestId(`w2-gates-${reqId}`)).getAllByRole('listitem').find((li) => li.getAttribute('data-gate') === id)!

async function importWeek1() {
  upload('w2-import-week1', WEEK1_JSON, 'team-07-week1-model-inputs.json')
  await waitFor(() => expect(screen.getByTestId('w2-week1-summary')).toBeInTheDocument())
}

describe('Week 2 lab tool', () => {
  it('renders every Part with its hook and starts not ready', () => {
    render(<Week2LabTool />)
    for (const id of ['w2-tool', 'w2-import-week1', 'w2-part-conops', 'w2-part-scenarios', 'w2-part-capabilities', 'w2-part-requirements', 'w2-part-audit', 'w2-export-md', 'w2-export-json', 'w2-import-week2']) expect(screen.getByTestId(id)).toBeInTheDocument()
    expect(screen.getByTestId('w2-state')).toHaveTextContent(/^○ not ready/)
    expect(screen.getByTestId('w2-part-conops-check')).toHaveTextContent('Still needed')
  })

  it('importing a valid Week 1 JSON shows its team, enterprise and needs', async () => {
    render(<Week2LabTool />)
    await importWeek1()
    const s = screen.getByTestId('w2-week1-summary')
    expect(s).toHaveTextContent('Riverside Food Bank Network')
    expect(s).toHaveTextContent('8 needs')
    expect(within(s).getByText('NEED-001')).toBeInTheDocument()
    expect(within(s).getByText('Produce until closing')).toBeInTheDocument()
  })

  it('refuses a wrong file with a clear message', async () => {
    render(<Week2LabTool />)
    upload('w2-import-week1', '{"format":"something-else"}')
    await waitFor(() => expect(screen.getByTestId('w2-message')).toHaveTextContent(/not a Week 1 model-inputs file/))
    expect(screen.queryByTestId('w2-week1-summary')).toBeNull()
  })

  it('a requirement with two “shall”s fails the one-shall gate; a good requirement passes every gate and counts', async () => {
    render(<Week2LabTool />)
    await importWeek1()
    fireEvent.click(screen.getByTestId('w2-add-stk'))
    const id = 'REQ-STK-001'
    fireEvent.change(screen.getByTestId(`w2-${id}-statement`), { target: { value: 'The delivery service shall be quick and shall be safe.' } })
    expect(gate(id, 'one-shall')).toHaveAttribute('data-ok', 'false')
    expect(gate(id, 'one-shall')).toHaveTextContent('✗ fails')
    // a good one
    fireEvent.change(screen.getByTestId(`w2-${id}-statement`), { target: { value: 'The network shall keep donated food at or below 5 °C from collection to delivery.' } })
    fireEvent.change(screen.getByTestId(`w2-${id}-type`), { target: { value: 'constraint' } })
    fireEvent.change(screen.getByTestId(`w2-${id}-method`), { target: { value: 'test' } })
    fireEvent.change(screen.getByTestId(`w2-${id}-criterion`), { target: { value: 'Logged temperature at or below 5 °C for every reading of every load' } })
    fireEvent.change(screen.getByTestId(`w2-${id}-rationale`), { target: { value: 'The county health department sets this limit in the food permit; an exceedance can suspend distribution.' } })
    fireEvent.change(screen.getByTestId(`w2-${id}-parents`), { target: { value: 'NEED-002' } })
    fireEvent.change(screen.getByTestId(`w2-${id}-owner`), { target: { value: 'JS' } })
    for (const g of REQ_HARD_GATES) expect(gate(id, g.id), g.id).toHaveAttribute('data-ok', 'true')
    expect(screen.getByTestId(`w2-${id}`)).toHaveTextContent('✓ counts')
    expect(screen.getByTestId('w2-req-counter')).toHaveTextContent(/Counting \(every hard gate passed\): 1 of 10/)
    // an absent parent fails the parent gate
    fireEvent.change(screen.getByTestId(`w2-${id}-parents`), { target: { value: 'NEED-099' } })
    expect(gate(id, 'parent')).toHaveAttribute('data-ok', 'false')
  })

  it('advisories are labeled advisory and do not stop a requirement counting', async () => {
    render(<Week2LabTool />)
    await importWeek1()
    fireEvent.click(screen.getByTestId('w2-add-stk'))
    const id = 'REQ-STK-001'
    fireEvent.change(screen.getByTestId(`w2-${id}-statement`), { target: { value: 'The network shall not release food that has been warmer than 5 °C from collection to delivery.' } })
    fireEvent.change(screen.getByTestId(`w2-${id}-type`), { target: { value: 'functional' } })
    fireEvent.change(screen.getByTestId(`w2-${id}-method`), { target: { value: 'test' } })
    fireEvent.change(screen.getByTestId(`w2-${id}-criterion`), { target: { value: 'No warm load released in every replayed week of logs' } })
    fireEvent.change(screen.getByTestId(`w2-${id}-rationale`), { target: { value: 'The county health department can suspend distribution after one unsafe load reaches a pantry.' } })
    fireEvent.change(screen.getByTestId(`w2-${id}-parents`), { target: { value: 'NEED-002' } })
    const adv = within(screen.getByTestId(`w2-gates-${id}`)).getAllByRole('listitem').find((li) => li.getAttribute('data-advisory') === 'negative')
    expect(adv).toHaveTextContent('! advisory')
    expect(screen.getByTestId(`w2-${id}`)).toHaveTextContent('✓ counts')
  })

  it('a complete record is ready; Markdown and versioned JSON export', () => {
    window.localStorage.setItem('sysml-studio:v1:w2.record', JSON.stringify(week2Fixture()))
    render(<Week2LabTool />)
    expect(screen.getByTestId('w2-state')).toHaveTextContent(/^✓ ready/)
    for (const id of ['w2-part-conops', 'w2-part-scenarios', 'w2-part-capabilities', 'w2-part-requirements', 'w2-part-audit']) expect(screen.getByTestId(`${id}-check`)).toHaveTextContent('✓')
    fireEvent.click(screen.getByTestId('w2-export-json'))
    const j = JSON.parse(downloads.at(-1)!.text)
    expect(downloads.at(-1)!.name).toBe('team-07-week2-model-inputs.json')
    expect(j.format).toBe('week2-model-inputs')
    expect(j.version).toBe(1)
    expect(j.week1.enterprise).toBe('Riverside Food Bank Network')
    fireEvent.click(screen.getByTestId('w2-export-md'))
    expect(downloads.at(-1)!.name).toBe('team-07-week2-record.md')
    expect(downloads.at(-1)!.text).toContain('## 10. Stakeholder and system requirements')
  })

  it('imports a teammate’s Week 2 JSON', async () => {
    render(<Week2LabTool />)
    upload('w2-import-week2', JSON.stringify(modelInputs(week2Fixture())))
    await waitFor(() => expect(screen.getByTestId('w2-state')).toHaveTextContent(/^✓ ready/))
    expect(screen.getByTestId('w2-REQ-SYS-004')).toBeInTheDocument()
    upload('w2-import-week2', WEEK1_JSON)
    await waitFor(() => expect(screen.getByTestId('w2-message')).toHaveTextContent(/Week 1 model-inputs file/))
  })

  it('every form control has a label', () => {
    window.localStorage.setItem('sysml-studio:v1:w2.record', JSON.stringify(week2Fixture()))
    const { container } = render(<Week2LabTool />)
    const controls = [...container.querySelectorAll('input, select, textarea')]
    expect(controls.length).toBeGreaterThan(100)
    for (const c of controls) expect(c.closest('label'), (c as HTMLInputElement).outerHTML.slice(0, 80)).not.toBeNull()
  })
})
