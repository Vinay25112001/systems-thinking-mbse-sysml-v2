// The Week 3 lab tool in the DOM: importing the Week 2 JSON fixture shows its requirements and carries its unknown into
// the register; a risk that describes a past event fails the not-issue gate and a good one passes every gate; a TPM shows
// its computed worst case and margin; the trade results and sensitivity are computed; the JSON export is versioned; a
// teammate's file imports; wrong files are refused with a message. Uses the fictional food bank fixture, never AeroLink.
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RISK_GATES } from '../../content/lectures/week03/labBrief'
import { WEEK1_JSON } from '../week2/fixture'
import { WEEK2_JSON, week3Fixture } from './fixture'
import { modelInputs } from './record'
import Week3LabTool from './Week3LabTool'

const downloads: { name: string; text: string; type?: string }[] = []
vi.mock('../download', () => ({ downloadText: (name: string, text: string, type?: string) => (downloads.push({ name, text, type }), true) }))

beforeEach(() => {
  window.localStorage.clear()
  downloads.length = 0
})

const upload = (testId: string, text: string, name = 'file.json') => fireEvent.change(screen.getByTestId(testId), { target: { files: [new File([text], name, { type: 'application/json' })] } })
const gate = (scope: string, id: string) => within(screen.getByTestId(`w3-gates-${scope}`)).getAllByRole('listitem').find((li) => li.getAttribute('data-gate') === id)!
const set = (testId: string, value: string) => fireEvent.change(screen.getByTestId(testId), { target: { value } })

async function importWeek2() {
  upload('w3-import-week2', WEEK2_JSON, 'team-07-week2-model-inputs.json')
  await waitFor(() => expect(screen.getByTestId('w3-week2-summary')).toBeInTheDocument())
}

describe('Week 3 lab tool', () => {
  it('renders every Part with its hook and starts not ready', () => {
    render(<Week3LabTool />)
    for (const id of ['w3-tool', 'w3-import-week2', 'w3-part-readiness', 'w3-part-register', 'w3-part-tpm', 'w3-part-trade', 'w3-part-ai', 'w3-export-md', 'w3-export-json', 'w3-import-week3']) expect(screen.getByTestId(id)).toBeInTheDocument()
    expect(screen.getByTestId('w3-state')).toHaveTextContent(/^○ not ready/)
    expect(screen.getByTestId('w3-part-import-check')).toHaveTextContent('Still needed')
  })

  it('importing the Week 2 JSON shows the enterprise and requirements and carries the unknown into the register', async () => {
    render(<Week3LabTool />)
    await importWeek2()
    const s = screen.getByTestId('w3-week2-summary')
    expect(s).toHaveTextContent('Riverside Food Bank Network')
    expect(s).toHaveTextContent('10 requirements')
    expect(within(s).getByText('REQ-SYS-003')).toBeInTheDocument()
    expect(screen.getByTestId('w3-U-001')).toHaveTextContent('U-001 (Week 2)')
  })

  it('refuses a Week 1 file and a foreign file with a clear message', async () => {
    render(<Week3LabTool />)
    upload('w3-import-week2', WEEK1_JSON)
    await waitFor(() => expect(screen.getByTestId('w3-message')).toHaveTextContent(/Week 1 model-inputs file/))
    upload('w3-import-week2', '{"format":"something-else"}')
    await waitFor(() => expect(screen.getByTestId('w3-message')).toHaveTextContent(/not a Week 2 model-inputs file/))
    expect(screen.queryByTestId('w3-week2-summary')).toBeNull()
  })

  it('a risk describing a past event fails not-issue; a good risk passes every gate and shows its level', async () => {
    render(<Week3LabTool />)
    await importWeek2()
    fireEvent.click(screen.getByTestId('w3-add-risk'))
    const id = 'R-001'
    set(`w3-${id}-condition`, 'the alarm gateway account password is shared by three staff')
    set(`w3-${id}-if`, 'someone already changed the alarm limit yesterday')
    set(`w3-${id}-then`, 'a freezer failure goes unnoticed and the stored food spoils')
    expect(gate(id, 'not-issue')).toHaveAttribute('data-ok', 'false')
    expect(gate(id, 'not-issue')).toHaveTextContent('✗ fails')
    set(`w3-${id}-if`, 'an unauthorized person changes the alarm limit')
    set(`w3-${id}-l`, '2')
    set(`w3-${id}-c`, '4')
    set(`w3-${id}-lwhy`, 'Shared passwords leak through former staff.')
    set(`w3-${id}-cwhy`, 'The freezer alarm requirement would be defeated.')
    set(`w3-${id}-handling`, 'mitigate')
    set(`w3-${id}-owner`, 'RM')
    set(`w3-${id}-treatment`, 'Individual accounts with two-factor sign-in.')
    set(`w3-${id}-trigger`, 'Unlogged alarm-setting change')
    set(`w3-${id}-affects`, 'REQ-STK-004')
    set(`w3-${id}-category`, 'security')
    for (const g of RISK_GATES) expect(gate(id, g.id), g.id).toHaveAttribute('data-ok', 'true')
    expect(screen.getByTestId(`w3-${id}`)).toHaveTextContent('✓ counts')
    expect(screen.getByTestId(`w3-${id}`)).toHaveTextContent('Moderate')
    expect(screen.getByTestId(`w3-${id}-statement`)).toHaveTextContent(/^Condition: .+\. If .+, then .+\.$/)
  })

  it('a TPM shows the computed worst case and margin (threshold − worst case)', async () => {
    render(<Week3LabTool />)
    await importWeek2()
    fireEvent.click(screen.getByTestId('w3-add-tpm'))
    set('w3-TPM-001-sense', 'lower-is-better')
    set('w3-TPM-001-unit', 'min')
    set('w3-TPM-001-threshold', '110')
    set('w3-TPM-001-objective', '95')
    set('w3-TPM-001-cbe', '100')
    set('w3-TPM-001-contingency', '6')
    expect(screen.getByTestId('w3-TPM-001-margin')).toHaveTextContent('Worst case 106 min; margin 4 min.')
    set('w3-TPM-001-cbe', '108')
    expect(screen.getByTestId('w3-TPM-001-margin')).toHaveTextContent('margin -4 min (outside the threshold)')
  })

  it('a complete record is ready, shows totals and sensitivity, and exports Markdown and versioned JSON', () => {
    window.localStorage.setItem('sysml-studio:v1:w3.record', JSON.stringify(week3Fixture()))
    render(<Week3LabTool />)
    expect(screen.getByTestId('w3-state')).toHaveTextContent(/^✓ ready/)
    for (const id of ['w3-part-readiness', 'w3-part-register', 'w3-part-tpm', 'w3-part-trade', 'w3-part-ai']) expect(screen.getByTestId(`${id}-check`)).toHaveTextContent('✓')
    expect(screen.getByTestId('w3-total-ALT-004')).toHaveTextContent('0.670')
    expect(screen.getByTestId('w3-sensitivity')).toHaveTextContent(/above 0\.467: ALT-001 ranks first/)
    // changing a swing weight recomputes the totals
    set('w3-CRIT-002-points', '300')
    expect(screen.getByTestId('w3-total-ALT-004')).not.toHaveTextContent('0.670')
    fireEvent.click(screen.getByTestId('w3-export-json'))
    const j = JSON.parse(downloads.at(-1)!.text)
    expect(downloads.at(-1)!.name).toBe('team-07-week3-model-inputs.json')
    expect(j.format).toBe('week3-model-inputs')
    expect(j.version).toBe(1)
    expect(j.week2.enterprise).toBe('Riverside Food Bank Network')
    fireEvent.click(screen.getByTestId('w3-export-md'))
    expect(downloads.at(-1)!.name).toBe('team-07-week3-record.md')
    expect(downloads.at(-1)!.text).toContain('## 14. Trade study and decision record')
  })

  it('imports a teammate’s Week 3 JSON and refuses a Week 2 file there', async () => {
    render(<Week3LabTool />)
    upload('w3-import-week3', JSON.stringify(modelInputs(week3Fixture())))
    await waitFor(() => expect(screen.getByTestId('w3-state')).toHaveTextContent(/^✓ ready/))
    expect(screen.getByTestId('w3-R-006')).toBeInTheDocument()
    upload('w3-import-week3', WEEK2_JSON)
    await waitFor(() => expect(screen.getByTestId('w3-message')).toHaveTextContent(/Week 2 model-inputs file/))
  })

  it('every form control has a label', () => {
    window.localStorage.setItem('sysml-studio:v1:w3.record', JSON.stringify(week3Fixture()))
    const { container } = render(<Week3LabTool />)
    const controls = [...container.querySelectorAll('input, select, textarea')]
    expect(controls.length).toBeGreaterThan(100)
    for (const c of controls) expect(c.closest('label'), (c as HTMLInputElement).outerHTML.slice(0, 80)).not.toBeNull()
  })
})
