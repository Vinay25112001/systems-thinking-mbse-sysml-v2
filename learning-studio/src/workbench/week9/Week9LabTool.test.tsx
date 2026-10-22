// The Week 9 lab tool in the DOM, both directions: the three fixture files import and the needs, requirements, trace
// matrix, audit and preview appear; a wrong file and an AeroLink file are refused with a message and no preview; a short
// valid entry (a feature name, a limit, an owner's initials, a short disposition) is accepted and changes the model,
// while an empty disposition or a claimed fix shows the reason beside the field; the exports use the team's file
// names; the readiness list names what is left. Uses the fictional food bank fixture, never AeroLink.
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AEROLINK_MODEL } from '../../content/lectures/week08/aerolinkCase'
import { fixtureModel } from '../week8/generated'
import { FIXTURE_WEEK1_JSON, FIXTURE_WEEK2_JSON } from './generated'
import Week9LabTool from './Week9LabTool'

const downloads: { name: string; text: string }[] = []
vi.mock('../download', () => ({ downloadText: (name: string, text: string) => (downloads.push({ name, text }), true) }))

beforeEach(() => {
  window.localStorage.clear()
  downloads.length = 0
})

const upload = (testId: string, text: string, name: string) => fireEvent.change(screen.getByTestId(testId), { target: { files: [new File([text], name, { type: 'text/plain' })] } })
async function importAll() {
  upload('w9-import-week8', fixtureModel().model.text, 'team-07-model-v01.sysml')
  await waitFor(() => expect(screen.getByTestId('w9-message')).toHaveTextContent('team-07-model-v01.sysml'))
  upload('w9-import-week1', FIXTURE_WEEK1_JSON, 'team-07-week1.json')
  await waitFor(() => expect(screen.getByTestId('w9-message')).toHaveTextContent('team-07-week1.json'))
  upload('w9-import-week2', FIXTURE_WEEK2_JSON, 'team-07-week2.json')
  await waitFor(() => expect(screen.getByTestId('w9-preview')).toBeInTheDocument())
}

describe('Week 9 lab tool', () => {
  it('starts with the three imports and a not-ready status, and no preview', () => {
    render(<Week9LabTool />)
    for (const id of ['w9-import-week8', 'w9-import-week1', 'w9-import-week2']) expect(screen.getByTestId(id)).toBeInTheDocument()
    expect(screen.getByTestId('w9-state')).toHaveTextContent('not ready')
    expect(screen.queryByTestId('w9-preview')).toBeNull()
  })

  it('the three fixture files: needs, requirements, trace matrix, audit and the generated model', async () => {
    render(<Week9LabTool />)
    await importAll()
    expect(within(screen.getByTestId('w9-needs')).getAllByRole('row').length).toBeGreaterThan(9)
    expect(screen.getByTestId('w9-reqs').querySelectorAll('[data-req]')).toHaveLength(10)
    expect(screen.getByTestId('w9-trace')).toHaveTextContent('REQ-STK-001')
    expect(screen.getByTestId('w9-findings')).toHaveTextContent(/no stakeholder requirement derived from it/)
    expect(screen.getByTestId('w9-preview')).toHaveTextContent("requirement <'NEED-001'>")
    expect(screen.getByTestId('w9-ready-subjects')).toHaveTextContent(/Choose the subject of REQ-SYS-001/)
  })

  it('refuses a JSON file in the model field, an AeroLink model and a Week 1 file in the Week 2 field, with a message', async () => {
    render(<Week9LabTool />)
    upload('w9-import-week8', FIXTURE_WEEK1_JSON, 'week1.json')
    await waitFor(() => expect(screen.getByTestId('w9-message')).toHaveTextContent(/JSON file/))
    expect(screen.getByTestId('w9-message')).toHaveAttribute('role', 'alert')
    upload('w9-import-week8', AEROLINK_MODEL.text, 'aerolink.sysml')
    await waitFor(() => expect(screen.getByTestId('w9-message')).toHaveTextContent(/AeroLink/))
    upload('w9-import-week2', FIXTURE_WEEK1_JSON, 'week1.json')
    await waitFor(() => expect(screen.getByTestId('w9-message')).toHaveTextContent(/Week 1 model-inputs file/))
    expect(screen.queryByTestId('w9-preview')).toBeNull()
  })

  it('short valid entries are accepted and reach the model; the formal line says what is still missing', async () => {
    render(<Week9LabTool />)
    await importAll()
    expect(screen.getByTestId('w9-formal-REQ-STK-001')).toHaveTextContent(/doc only: no measured feature named/)
    fireEvent.change(screen.getByTestId('w9-feature-REQ-STK-001'), { target: { value: 'wait' } })
    fireEvent.change(screen.getByTestId('w9-quantity-REQ-STK-001'), { target: { value: 'duration' } })
    fireEvent.change(screen.getByTestId('w9-value-REQ-STK-001'), { target: { value: '30' } })
    expect(screen.getByTestId('w9-formal-REQ-STK-001')).toHaveTextContent('require constraint { enterprise.wait <= 30 [s] }')
    expect(screen.getByTestId('w9-preview')).toHaveTextContent('attribute maxWait : DurationValue = 30 [s];')
    fireEvent.change(screen.getByTestId('w9-owner-REQ-STK-004'), { target: { value: 'RM' } })
    expect(screen.getByTestId('w9-preview')).toHaveTextContent('owner = "RM";')
  })

  it('an empty disposition and a claimed fix show the reason beside the field; a short real one does not', async () => {
    render(<Week9LabTool />)
    await importAll()
    const field = screen.getByTestId('w9-disp-need-no-stakeholder-NEED-009')
    fireEvent.change(field, { target: { value: 'n/a' } })
    expect(field.parentElement).toHaveTextContent(/not a disposition/)
    fireEvent.change(field, { target: { value: 'Fixed' } })
    expect(field.parentElement).toHaveTextContent(/reads as a fix/)
    fireEvent.change(field, { target: { value: 'Open item: add pantry coordinators, JS' } })
    expect(field.parentElement).not.toHaveTextContent(/not a disposition|reads as a fix/)
  })

  it('the exports use the team’s file names and carry the model and the trace matrix', async () => {
    render(<Week9LabTool />)
    await importAll()
    fireEvent.click(screen.getByTestId('w9-export-sysml'))
    fireEvent.click(screen.getByTestId('w9-export-md'))
    expect(downloads.map((d) => d.name)).toEqual(['team-07-model-v02.sysml', 'team-07-trace-matrix.md'])
    expect(downloads[0].text).toContain("requirement <'REQ-SYS-004'>")
    expect(downloads[1].text).toContain('## Needs to requirements')
  })

  it('AI findings get IDs that are never reused after a removal', async () => {
    render(<Week9LabTool />)
    await importAll()
    fireEvent.click(screen.getByTestId('w9-ai-add'))
    fireEvent.click(screen.getByTestId('w9-ai-add'))
    expect(screen.getByTestId('w9-ai').querySelectorAll('[data-ai]')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Remove AIF-002' }))
    expect(screen.getByTestId('w9-ai-add')).toHaveTextContent('AIF-003')
  })
})

describe('Week 9 lab tool: partly covered needs and the audit note (review N1)', () => {
  it('ticking a need makes it read partial and asks for the open item; the note is exported', async () => {
    render(<Week9LabTool />)
    await importAll()
    const row = screen.getByTestId('w9-trace').querySelector('tr[data-status="covered"]')!
    const need = row.querySelector('th')!.textContent!
    fireEvent.click(screen.getByTestId(`w9-partial-${need}`))
    expect(screen.getByTestId('w9-trace').querySelector(`tr[data-status="partial"] th`)).toHaveTextContent(need)
    expect(screen.getByTestId(`w9-partial-item-${need}`)).toHaveTextContent(/Say which part of the need/)
    fireEvent.change(screen.getByTestId(`w9-partial-missing-${need}`), { target: { value: 'Weekend deliveries' } })
    fireEvent.change(screen.getByTestId(`w9-partial-owner-${need}`), { target: { value: 'JS' } })
    fireEvent.change(screen.getByTestId(`w9-partial-week-${need}`), { target: { value: 'Week 10' } })
    expect(screen.getByTestId(`w9-partial-item-${need}`)).not.toHaveTextContent(/Say which|Name the owner|Give the week/)
    fireEvent.change(screen.getByTestId('w9-audit-note'), { target: { value: 'Assumption justified.' } })
    fireEvent.click(screen.getByTestId('w9-export-md'))
    expect(downloads[0].text).toContain(`| ${need} | Weekend deliveries | JS | Week 10 |`)
    expect(downloads[0].text).toContain('Assumption justified.')
  })
})
