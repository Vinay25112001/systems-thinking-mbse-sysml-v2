// The Week 10 lab tool in the DOM, both directions: the three fixture files import and the functions, logical
// elements, mapping table, audit and preview appear; a wrong file and an AeroLink file are refused with a message and no
// preview; choosing a step's function and an alternate's guard reaches the model; an empty disposition or a claimed fix
// shows the reason beside the field while a short plan does not; new function IDs are never reused after a removal; the
// exports use the team's file names. Uses the fictional food bank fixture, never AeroLink.
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AEROLINK_W9_MODEL } from '../../content/lectures/week09/aerolinkCase'
import { fixture9 } from '../week9/generated'
import { FIXTURE_WEEK2_JSON, FIXTURE_WEEK4_JSON } from './generated'
import Week10LabTool from './Week10LabTool'

const downloads: { name: string; text: string }[] = []
vi.mock('../download', () => ({ downloadText: (name: string, text: string) => (downloads.push({ name, text }), true) }))

beforeEach(() => {
  window.localStorage.clear()
  downloads.length = 0
})

const upload = (testId: string, text: string, name: string) => fireEvent.change(screen.getByTestId(testId), { target: { files: [new File([text], name, { type: 'text/plain' })] } })
async function importAll() {
  upload('w10-import-week9', fixture9().model.text, 'team-07-model-v02.sysml')
  await waitFor(() => expect(screen.getByTestId('w10-message')).toHaveTextContent('team-07-model-v02.sysml'))
  upload('w10-import-week4', FIXTURE_WEEK4_JSON, 'team-07-week4.json')
  await waitFor(() => expect(screen.getByTestId('w10-message')).toHaveTextContent('team-07-week4.json'))
  upload('w10-import-week2', FIXTURE_WEEK2_JSON, 'team-07-week2.json')
  await waitFor(() => expect(screen.getByTestId('w10-preview')).toBeInTheDocument())
}

describe('Week 10 lab tool', () => {
  it('starts with the three imports and a not-ready status, and no preview', () => {
    render(<Week10LabTool />)
    for (const id of ['w10-import-week9', 'w10-import-week4', 'w10-import-week2']) expect(screen.getByTestId(id)).toBeInTheDocument()
    expect(screen.getByTestId('w10-state')).toHaveTextContent('not ready')
    expect(screen.queryByTestId('w10-preview')).toBeNull()
  })

  it('the three fixture files: functions, logical elements, findings and the generated model', async () => {
    render(<Week10LabTool />)
    await importAll()
    expect(screen.getByTestId('w10-functions').querySelectorAll('[data-fn]')).toHaveLength(10)
    expect(within(screen.getByTestId('w10-logical')).getAllByRole('row').length).toBe(6)
    expect(screen.getByTestId('w10-findings')).toHaveTextContent(/is not linked to a logical element/)
    expect(screen.getByTestId('w10-preview')).toHaveTextContent("action <'FN-001'>")
    expect(screen.getByTestId('w10-ready-flow')).toHaveTextContent(/chooses the scenario with the most alternates/)
  })

  it('refuses a JSON file in the model field, an AeroLink model and a Week 4 file in the Week 2 field, with a message', async () => {
    render(<Week10LabTool />)
    upload('w10-import-week9', FIXTURE_WEEK4_JSON, 'week4.json')
    await waitFor(() => expect(screen.getByTestId('w10-message')).toHaveTextContent(/JSON file/))
    expect(screen.getByTestId('w10-message')).toHaveAttribute('role', 'alert')
    upload('w10-import-week9', AEROLINK_W9_MODEL.text, 'aerolink.sysml')
    await waitFor(() => expect(screen.getByTestId('w10-message')).toHaveTextContent(/AeroLink/))
    upload('w10-import-week2', FIXTURE_WEEK4_JSON, 'week4.json')
    await waitFor(() => expect(screen.getByTestId('w10-message')).toHaveTextContent(/import it in the Week 4 field/))
    expect(screen.queryByTestId('w10-preview')).toBeNull()
  })

  it('choosing a scenario, a step’s function and a guard reaches the mapping table and the model', async () => {
    render(<Week10LabTool />)
    await importAll()
    fireEvent.change(screen.getByTestId('w10-scenario'), { target: { value: 'SCN-002' } })
    expect(screen.getByTestId('w10-mapping')).toHaveTextContent('action (no function)')
    fireEvent.change(screen.getByTestId('w10-step-fn-1'), { target: { value: 'FN-005' } })
    fireEvent.change(screen.getByTestId('w10-step-name-1'), { target: { value: 'detect' } })
    fireEvent.change(screen.getByTestId('w10-alt-guard-A2'), { target: { value: 'powerCut' } })
    expect(screen.getByTestId('w10-mapping')).toHaveTextContent('action subsetting FN-005')
    expect(screen.getByTestId('w10-preview')).toHaveTextContent("then action detect :> Logical::'FN-005'")
    expect(screen.getByTestId('w10-preview')).toHaveTextContent('if powerCut then')
  })

  it('an empty disposition and a claimed fix show the reason beside the field; a short real one does not', async () => {
    render(<Week10LabTool />)
    await importAll()
    const field = screen.getByTestId('w10-disp-fn-no-items-FN-004')
    fireEvent.change(field, { target: { value: 'n/a' } })
    expect(field.parentElement).toHaveTextContent(/not a disposition/)
    fireEvent.change(field, { target: { value: 'Fixed' } })
    expect(field.parentElement).toHaveTextContent(/reads as a fix/)
    fireEvent.change(field, { target: { value: 'Open item: items in Week 11, JS' } })
    expect(field.parentElement).not.toHaveTextContent(/not a disposition|reads as a fix/)
  })

  it('new function IDs continue after the highest and are never reused after a removal', async () => {
    render(<Week10LabTool />)
    await importAll()
    expect(screen.getByTestId('w10-add-fn')).toHaveTextContent('FN-011')
    fireEvent.click(screen.getByTestId('w10-add-fn'))
    fireEvent.click(screen.getByRole('button', { name: 'Remove FN-011' }))
    expect(screen.getByTestId('w10-add-fn')).toHaveTextContent('FN-012')
  })

  it('the exports use the team’s file names and carry the model and the review', async () => {
    render(<Week10LabTool />)
    await importAll()
    fireEvent.click(screen.getByTestId('w10-export-sysml'))
    fireEvent.click(screen.getByTestId('w10-export-md'))
    expect(downloads.map((d) => d.name)).toEqual(['team-07-model-v03.sysml', 'team-07-behavior-review.md'])
    expect(downloads[0].text).toContain('part logicalArchitecture {')
    expect(downloads[1].text).toContain('## Behavior audit: findings and dispositions')
  })
})
