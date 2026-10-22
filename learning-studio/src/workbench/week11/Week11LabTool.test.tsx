// The Week 11 lab tool in the DOM, both directions: the two fixture files import and the parts, placements, interfaces,
// requirements, audit and preview appear; a wrong file and an AeroLink file are refused with a message and no preview;
// setting a crossing's direction reaches the model; an empty disposition or a claimed fix shows the reason beside the
// field while a short plan does not; new item IDs are never reused after a removal; the exports use the team's file
// names; the wide editors stay inside the page at 400 px (checked in e2e). Uses the fictional food bank fixture.
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AEROLINK_W10_MODEL } from '../../content/lectures/week10/aerolinkCase'
import { fixture10, FIXTURE_WEEK4_JSON } from '../week10/generated'
import { FIXTURE_WEEK5_JSON } from './generated'
import Week11LabTool from './Week11LabTool'

const downloads: { name: string; text: string }[] = []
vi.mock('../download', () => ({ downloadText: (name: string, text: string) => (downloads.push({ name, text }), true) }))

beforeEach(() => {
  window.localStorage.clear()
  downloads.length = 0
})

const upload = (testId: string, text: string, name: string) => fireEvent.change(screen.getByTestId(testId), { target: { files: [new File([text], name, { type: 'text/plain' })] } })
async function importAll() {
  upload('w11-import-week10', fixture10().model.text, 'team-07-model-v03.sysml')
  await waitFor(() => expect(screen.getByTestId('w11-message')).toHaveTextContent('team-07-model-v03.sysml'))
  upload('w11-import-week5', FIXTURE_WEEK5_JSON, 'team-07-week5.json')
  await waitFor(() => expect(screen.getByTestId('w11-preview')).toBeInTheDocument())
}

describe('Week 11 lab tool', () => {
  it('starts with the two imports and a not-ready status, and no preview', () => {
    render(<Week11LabTool />)
    for (const id of ['w11-import-week10', 'w11-import-week5']) expect(screen.getByTestId(id)).toBeInTheDocument()
    expect(screen.getByTestId('w11-state')).toHaveTextContent('not ready')
    expect(screen.queryByTestId('w11-preview')).toBeNull()
  })

  it('the two fixture files: parts, interfaces, requirements, findings and the generated model', async () => {
    render(<Week11LabTool />)
    await importAll()
    expect(within(screen.getByTestId('w11-parts')).getAllByRole('row').length).toBe(6)
    expect(screen.getByTestId('w11-interfaces').querySelectorAll('[data-if]')).toHaveLength(10)
    expect(screen.getByTestId('w11-reqs').querySelectorAll('[data-req]')).toHaveLength(3)
    expect(screen.getByTestId('w11-findings')).toHaveTextContent(/is not linked to a physical element/)
    expect(screen.getByTestId('w11-preview')).toHaveTextContent("part <'PHY-001'>")
    expect(screen.getByTestId('w11-ready-directions')).toHaveTextContent(/Confirm the crossings/)
  })

  it('refuses a JSON file in the model field, an AeroLink model and a Week 4 file in the Week 5 field, with a message', async () => {
    render(<Week11LabTool />)
    upload('w11-import-week10', FIXTURE_WEEK5_JSON, 'week5.json')
    await waitFor(() => expect(screen.getByTestId('w11-message')).toHaveTextContent(/JSON file/))
    expect(screen.getByTestId('w11-message')).toHaveAttribute('role', 'alert')
    upload('w11-import-week10', AEROLINK_W10_MODEL.text, 'aerolink.sysml')
    await waitFor(() => expect(screen.getByTestId('w11-message')).toHaveTextContent(/AeroLink/))
    upload('w11-import-week5', FIXTURE_WEEK4_JSON, 'week4.json')
    await waitFor(() => expect(screen.getByTestId('w11-message')).toHaveTextContent(/Week 4 model-inputs file/))
    expect(screen.queryByTestId('w11-preview')).toBeNull()
  })

  it('setting a crossing’s direction makes the rows the team’s and reaches the model', async () => {
    render(<Week11LabTool />)
    await importAll()
    fireEvent.click(screen.getByTestId('w11-flow-confirm-IF-003'))
    fireEvent.change(screen.getByTestId('w11-flow-dir-IF-003-0'), { target: { value: 'BtoA' } })
    expect(screen.getByTestId('w11-preview').textContent).toMatch(/flow countyFundersReportingPortal\.deliveryRecords to schedulingAndReportingSoftware\.deliveryRecords;/)
    fireEvent.change(screen.getByTestId('w11-flow-item-IF-001-0'), { target: { value: 'nothing like this' } })
    expect(screen.getByTestId('w11-findings')).toHaveTextContent(/“nothing like this” crosses it/)
  })

  it('an empty disposition and a claimed fix show the reason beside the field; a short real one does not', async () => {
    render(<Week11LabTool />)
    await importAll()
    const field = screen.getByTestId('w11-disp-placeholder-unlinked-Donation intake desk')
    fireEvent.change(field, { target: { value: 'n/a' } })
    expect(field.parentElement).toHaveTextContent(/not a disposition/)
    fireEvent.change(field, { target: { value: 'Fixed' } })
    expect(field.parentElement).toHaveTextContent(/reads as a fix/)
    fireEvent.change(field, { target: { value: 'Intake desk stays a Week 8 part' } })
    expect(field.parentElement).not.toHaveTextContent(/reads as a fix|not a disposition/)
  })

  it('a new information item takes the next ID, and removing it does not free the ID', async () => {
    render(<Week11LabTool />)
    await importAll()
    const btn = screen.getByTestId('w11-add-item-information')
    const first = btn.textContent!.match(/INFO-\d{3}/)![0]
    fireEvent.click(btn)
    fireEvent.click(screen.getByRole('button', { name: `Remove ${first}` }))
    expect(screen.getByTestId('w11-add-item-information').textContent).not.toContain(first)
  })

  it('a satisfy claim on a part of another type is left out with the reason shown in the audit', async () => {
    render(<Week11LabTool />)
    await importAll()
    fireEvent.click(screen.getByTestId('w11-add-claim'))
    fireEvent.change(screen.getByTestId('w11-claim-req-0'), { target: { value: 'REQ-SYS-003' } })
    fireEvent.change(screen.getByTestId('w11-claim-by-0'), { target: { value: 'PHY-001' } })
    expect(screen.getByTestId('w11-findings')).toHaveTextContent(/is left out: the subject of REQ-SYS-003/)
  })

  it('requirement allocation rows keep their data while a requirement ID is typed, and a repeated requirement shows a message', async () => {
    render(<Week11LabTool />)
    await importAll()
    fireEvent.click(screen.getByTestId('w11-add-reqpart'))
    fireEvent.click(screen.getByTestId('w11-add-reqpart'))
    fireEvent.change(screen.getByTestId('w11-reqpart-els-0'), { target: { value: 'PHY-002' } })
    fireEvent.change(screen.getByTestId('w11-reqpart-els-1'), { target: { value: 'PHY-005' } })
    for (const i of [0, 1]) fireEvent.change(screen.getByTestId(`w11-reqpart-req-${i}`), { target: { value: 'REQ-STK-001' } })
    expect(screen.getByTestId('w11-reqpart-els-0')).toHaveValue('PHY-002')
    expect(screen.getByTestId('w11-reqpart-els-1')).toHaveValue('PHY-005')
    expect(screen.getByTestId('w11-reqpart-dup-1')).toHaveTextContent(/also in allocation 1/)
    expect(screen.queryByTestId('w11-reqpart-dup-0')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Remove allocation 1' }))
    fireEvent.click(screen.getByTestId('w11-add-reqpart'))
    expect(screen.getByTestId('w11-reqpart-els-0')).toHaveValue('PHY-005')
    expect(screen.getByTestId('w11-reqpart-els-1')).toHaveValue('')
  })

  it('the exports use the team’s file names', async () => {
    render(<Week11LabTool />)
    await importAll()
    fireEvent.click(screen.getByTestId('w11-export-sysml'))
    fireEvent.click(screen.getByTestId('w11-export-md'))
    expect(downloads.map((d) => d.name)).toEqual(['team-07-model-v04.sysml', 'team-07-interface-review.md'])
    expect(downloads[0].text).toContain("part <'PHY-005'>")
  })
})
