// The Week 6 lab tool in the DOM: every Part renders and the record starts not ready; importing the Week 5 JSON fixture
// shows its enterprise and seeds the baseline increment; the optional Week 3 file offers its technologies under their own
// IDs; a wrong file is refused with a message; a teammate's complete record is ready, the roadmap grid is an accessible
// table; emptying an increment's trigger or writing "n/a" fails that gate and the record; the empty-answer rule is shown;
// a teammate import over existing work asks first; the exports are versioned. Uses the fictional food bank fixture, never
// AeroLink.
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WEEK3_JSON, WEEK5_JSON, week6Fixture } from './fixture'
import { modelInputs } from './record'
import Week6LabTool from './Week6LabTool'

const downloads: { name: string; text: string; type?: string }[] = []
vi.mock('../download', () => ({ downloadText: (name: string, text: string, type?: string) => (downloads.push({ name, text, type }), true) }))

beforeEach(() => {
  window.localStorage.clear()
  downloads.length = 0
})

const upload = (testId: string, text: string, name = 'file.json') => fireEvent.change(screen.getByTestId(testId), { target: { files: [new File([text], name, { type: 'application/json' })] } })
const gate = (scope: string, id: string) => within(screen.getByTestId(`w6-gates-${scope}`)).getAllByRole('listitem').find((li) => li.getAttribute('data-gate') === id)!
const set = (testId: string, value: string) => fireEvent.change(screen.getByTestId(testId), { target: { value } })
const FIXTURE_JSON = JSON.stringify(modelInputs(week6Fixture()))

describe('Week 6 lab tool', () => {
  it('renders every Part, states the empty-answer rule and starts not ready', () => {
    render(<Week6LabTool />)
    for (const id of ['w6-tool', 'w6-import-week5', 'w6-import-week3', 'w6-import-week6', 'w6-part-import', 'w6-part-gaps', 'w6-part-technology', 'w6-part-increments', 'w6-part-unknowns', 'w6-part-review', 'w6-part-ai', 'w6-roadmap', 'w6-add-gap', 'w6-add-technology', 'w6-add-increment', 'w6-add-unknown', 'w6-add-risk', 'w6-export-md', 'w6-export-json'])
      expect(screen.getByTestId(id)).toBeInTheDocument()
    expect(screen.getByTestId('w6-state')).toHaveTextContent(/^○ not ready/)
    expect(screen.getByTestId('w6-empty-answer-rule')).toHaveTextContent(/“n\/a”/)
  })

  it('imports the Week 5 JSON, shows the enterprise and seeds the baseline; the Week 3 file offers its technologies; a Week 3 file in the Week 5 field is refused', async () => {
    render(<Week6LabTool />)
    upload('w6-import-week5', WEEK5_JSON, 'team-07-week5-model-inputs.json')
    await waitFor(() => expect(screen.getByTestId('w6-week5-summary')).toHaveTextContent('Riverside Food Bank Network'))
    expect(screen.getByTestId('w6-baseline-content')).toBeInTheDocument()
    upload('w6-import-week3', WEEK3_JSON, 'team-07-week3-model-inputs.json')
    await waitFor(() => expect(screen.getByTestId('w6-week3-technologies')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('w6-add-TECH-001'))
    await waitFor(() => expect(screen.getByTestId('w6-TECH-001-name')).not.toHaveValue(''))
    upload('w6-import-week5', WEEK3_JSON)
    await waitFor(() => expect(screen.getByTestId('w6-message')).toHaveTextContent(/✗ This is a Week 3 model-inputs file/))
  })

  it('a teammate’s complete record is ready; the roadmap grid is a table; an empty or “n/a” trigger fails its gate', async () => {
    render(<Week6LabTool />)
    upload('w6-import-week6', FIXTURE_JSON, 'team-07-week6-model-inputs.json')
    await waitFor(() => expect(screen.getByTestId('w6-state')).toHaveTextContent(/^✓ ready/))
    const table = screen.getByTestId('w6-roadmap')
    expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Baseline (as is)', 'Near term (18 months)', 'Mid term (years 2 to 4)', 'Far term (years 5 to 8)'])
    expect(table.querySelector('[data-horizon="mid"]')).toHaveTextContent(/INC-003 Cold plates.*inserts TECH-003.*dashed/)
    expect(gate('INC-002', 'trigger')).toHaveAttribute('data-ok', 'true')
    set('w6-INC-002-trigger', 'n/a')
    await waitFor(() => expect(gate('INC-002', 'trigger')).toHaveAttribute('data-ok', 'false'))
    expect(gate('INC-002', 'trigger')).toHaveTextContent(/✗ fails.*says nothing/)
    expect(screen.getByTestId('w6-state')).toHaveTextContent(/not ready/)
    set('w6-INC-002-trigger', 'Approved')
    await waitFor(() => expect(screen.getByTestId('w6-state')).toHaveTextContent(/^✓ ready/))
  })

  it('asks before a teammate’s file replaces work, and keeps the record when declined', async () => {
    render(<Week6LabTool />)
    upload('w6-import-week5', WEEK5_JSON)
    await waitFor(() => expect(screen.getByTestId('w6-week5-summary')).toBeInTheDocument())
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    upload('w6-import-week6', FIXTURE_JSON)
    await waitFor(() => expect(screen.getByTestId('w6-message')).toHaveTextContent(/Import cancelled/))
    expect(confirm).toHaveBeenCalled()
    expect(screen.getByTestId('w6-state')).toHaveTextContent(/not ready/)
    confirm.mockRestore()
  })

  it('exports the versioned JSON and the Markdown record with the roadmap grid', async () => {
    render(<Week6LabTool />)
    upload('w6-import-week6', FIXTURE_JSON)
    await waitFor(() => expect(screen.getByTestId('w6-state')).toHaveTextContent(/^✓ ready/))
    fireEvent.click(screen.getByTestId('w6-export-json'))
    fireEvent.click(screen.getByTestId('w6-export-md'))
    const json = downloads.find((d) => d.name.endsWith('week6-model-inputs.json'))!
    expect(JSON.parse(json.text)).toMatchObject({ format: 'week6-model-inputs', version: 1, status: 'ready' })
    expect(downloads.find((d) => d.name.endsWith('week6-record.md'))!.text).toContain('### Roadmap grid')
  })
})
