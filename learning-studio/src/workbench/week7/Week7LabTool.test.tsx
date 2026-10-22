// The Week 7 package tool in the DOM: every Part renders and the package starts not ready; the six exports added at once
// fill the sources table and the coverage table and list the findings; a wrong file and an AeroLink file are refused with
// a message; a teammate's complete package is review closed; writing "n/a" as a finding's reason fails that gate and the
// state; the thread is shown; a teammate import over existing work asks first; the exports are versioned. Uses the
// fictional food bank fixture, never AeroLink.
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SOURCE_JSONS, week7Fixture } from './fixture'
import { packageJson } from './record'
import Week7LabTool from './Week7LabTool'

const downloads: { name: string; text: string; type?: string }[] = []
vi.mock('../download', () => ({ downloadText: (name: string, text: string, type?: string) => (downloads.push({ name, text, type }), true) }))

beforeEach(() => {
  window.localStorage.clear()
  downloads.length = 0
})
const file = (text: string, name: string) => new File([text], name, { type: 'application/json' })
const upload = (testId: string, files: File[]) => fireEvent.change(screen.getByTestId(testId), { target: { files } })
const set = (testId: string, value: string) => fireEvent.change(screen.getByTestId(testId), { target: { value } })
const PACKAGE = JSON.stringify(packageJson(week7Fixture()))

describe('Week 7 package tool', () => {
  it('renders every Part, states the empty-answer rule and starts not ready', () => {
    render(<Week7LabTool />)
    for (const id of ['w7-tool', 'w7-import', 'w7-import-package', 'w7-part-sources', 'w7-part-audit', 'w7-part-summary', 'w7-part-prep', 'w7-part-rids', 'w7-part-ai', 'w7-sources-summary', 'w7-coverage', 'w7-findings', 'w7-decision', 'w7-thread-need', 'w7-rid-add', 'w7-export-md', 'w7-export-json'])
      expect(screen.getByTestId(id)).toBeInTheDocument()
    expect(screen.getByTestId('w7-state')).toHaveTextContent(/^○ not ready/)
    expect(screen.getByTestId('w7-empty-answer-rule')).toHaveTextContent(/“n\/a”/)
  })

  it('adds the six exports at once: sources, coverage and findings appear; a wrong file and AeroLink are refused', async () => {
    render(<Week7LabTool />)
    upload('w7-import', [1, 2, 3, 4, 5, 6].map((w) => file(SOURCE_JSONS[w as 1], `week${w}.json`)))
    await waitFor(() => expect(within(screen.getByTestId('w7-source-6')).getByText(/✓ loaded/)).toBeInTheDocument())
    expect(screen.getByTestId('w7-message')).toHaveTextContent(/Loaded Week 1, Week 2, Week 3, Week 4, Week 5, Week 6/)
    expect(screen.getByTestId('w7-coverage').querySelector('[data-layer="need-req"]')).toHaveTextContent(/6 of 9/)
    expect(screen.getByTestId('w7-findings').querySelector('[data-key="dropped-open-item:NEED-003"]')).not.toBeNull()
    upload('w7-import', [file('{"format":"week9-model-inputs","version":1}', 'x.json')])
    await waitFor(() => expect(screen.getByTestId('w7-message')).toHaveTextContent(/✗ x\.json: .*Week 1–6/))
    const aero = JSON.parse(SOURCE_JSONS[1])
    aero.enterprise.name = 'AeroLink'
    upload('w7-import', [file(JSON.stringify(aero), 'aero.json')])
    await waitFor(() => expect(screen.getByTestId('w7-message')).toHaveTextContent(/AeroLink/))
  })

  it('a teammate’s complete package is review closed; “n/a” as a reason fails the gate and the state; the thread is listed', async () => {
    render(<Week7LabTool />)
    upload('w7-import-package', [file(PACKAGE, 'team-07-week7-package.json')])
    await waitFor(() => expect(screen.getByTestId('w7-state')).toHaveTextContent(/^✓ review closed/))
    expect(screen.getByTestId('w7-thread')).toHaveTextContent(/System requirement: REQ-SYS-/)
    const first = screen.getByTestId('w7-finding-0')
    const reason = within(first).getByTestId('w7-finding-0-reason')
    const before = (reason as HTMLInputElement).value
    set('w7-finding-0-reason', 'n/a')
    await waitFor(() => expect(within(screen.getByTestId('w7-gates-finding-0')).getAllByRole('listitem').find((li) => li.getAttribute('data-gate') === 'reason')).toHaveAttribute('data-ok', 'false'))
    expect(screen.getByTestId('w7-state')).toHaveTextContent(/not ready/)
    set('w7-finding-0-reason', before || 'Duplicate')
    await waitFor(() => expect(screen.getByTestId('w7-state')).toHaveTextContent(/^✓ review closed/))
  })

  it('asks before a teammate’s package replaces existing work, and keeps the work on cancel', async () => {
    render(<Week7LabTool />)
    upload('w7-import', [file(SOURCE_JSONS[1], 'week1.json')])
    await waitFor(() => expect(within(screen.getByTestId('w7-source-1')).getByText(/✓ loaded/)).toBeInTheDocument())
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    upload('w7-import-package', [file(PACKAGE, 'p.json')])
    await waitFor(() => expect(screen.getByTestId('w7-message')).toHaveTextContent(/Import cancelled/))
    expect(confirm).toHaveBeenCalledWith(expect.stringMatching(/Replace the Week 7 package/))
    expect(within(screen.getByTestId('w7-source-2')).getByText(/✗ not loaded/)).toBeInTheDocument()
    confirm.mockRestore()
  })

  it('exports the Markdown package with its readiness report and the versioned JSON', async () => {
    render(<Week7LabTool />)
    upload('w7-import-package', [file(PACKAGE, 'p.json')])
    await waitFor(() => expect(screen.getByTestId('w7-state')).toHaveTextContent(/review closed/))
    fireEvent.click(screen.getByTestId('w7-export-md'))
    fireEvent.click(screen.getByTestId('w7-export-json'))
    expect(downloads[0].name).toBe('team-07-week7-package.md')
    expect(downloads[0].text).toMatch(/## Readiness report/)
    expect(downloads[1].name).toBe('team-07-week7-package.json')
    expect(JSON.parse(downloads[1].text)).toMatchObject({ format: 'week7-package', version: 1, state: 'review-closed' })
  })
})
