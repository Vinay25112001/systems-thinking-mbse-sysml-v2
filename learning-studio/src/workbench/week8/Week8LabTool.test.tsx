// The Week 8 lab tool in the DOM, both directions: a good Week 1 file shows the summary, the mapping and the generated
// model; a wrong file is refused with a message and no preview; a Week 2 file alone asks for the Week 1 file; the exports
// use the team's file names; the purpose appears in the model's root documentation; a teammate's workspace imports.
// Uses the fictional food bank fixture, never AeroLink.
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { teamModelInputs } from '../week1/team'
import { TEAM_FIXTURE } from '../week1/teamFixture'
import Week8LabTool from './Week8LabTool'
import { EMPTY_STATE, normalizeState, readiness, workspaceJson, importWorkspace, matrixMarkdown } from './state'
import { importFile } from './skeleton'

const downloads: { name: string; text: string; type?: string }[] = []
vi.mock('../download', () => ({ downloadText: (name: string, text: string, type?: string) => (downloads.push({ name, text, type }), true) }))

beforeEach(() => {
  window.localStorage.clear()
  downloads.length = 0
})

const WEEK1 = JSON.stringify(teamModelInputs(TEAM_FIXTURE, '2026-10-19'))
const WEEK2 = JSON.stringify({ format: 'week2-model-inputs', version: 1, team: '07', week1: { team: '07', enterprise: 'Riverside Food Bank Network', stakeholders: [{ id: 'STK-001', name: 'Families' }], needs: [] }, scenarios: [{ id: 'SCN-001', name: 'Weekly delivery' }], requirements: [{ id: 'REQ-STK-001', name: 'Produce' }] })
const upload = (testId: string, text: string, name = 'file.json') => fireEvent.change(screen.getByTestId(testId), { target: { files: [new File([text], name, { type: 'application/json' })] } })

async function importWeek1() {
  upload('w8-import-week1', WEEK1, 'team-07-week1-model-inputs.json')
  await waitFor(() => expect(screen.getByTestId('w8-summary')).toBeInTheDocument())
}

describe('Week 8 lab tool', () => {
  it('starts with the import and a not-ready status, and no preview', () => {
    render(<Week8LabTool />)
    expect(screen.getByTestId('w8-import-week1')).toBeInTheDocument()
    expect(screen.getByTestId('w8-import-week2')).toBeInTheDocument()
    expect(screen.getByTestId('w8-state')).toHaveTextContent('not ready')
    expect(screen.queryByTestId('w8-preview')).toBeNull()
  })

  it('a good Week 1 file: summary, mapping matrix and the generated model', async () => {
    render(<Week8LabTool />)
    await importWeek1()
    expect(screen.getByTestId('w8-summary')).toHaveTextContent('Riverside Food Bank Network')
    expect(screen.getByTestId('w8-summary')).toHaveTextContent('8 stakeholders, 8 concerns, 6 external systems, 3 relationships')
    const stk = within(screen.getByTestId('w8-mapping')).getAllByRole('row').find((r) => r.getAttribute('data-prefix') === 'STK')!
    expect(stk).toHaveAttribute('data-status', 'modeled now')
    expect(screen.getByTestId('w8-preview')).toHaveTextContent("package 'Riverside Food Bank Network Model'")
    expect(screen.getByTestId('w8-message')).toHaveTextContent('✓')
  })

  it('a wrong file is refused with a message and no preview; an AeroLink record too', async () => {
    render(<Week8LabTool />)
    upload('w8-import-week1', '{"format":"something-else"}')
    await waitFor(() => expect(screen.getByTestId('w8-message')).toHaveTextContent(/not a Week 1 or Week 2/))
    expect(screen.getByTestId('w8-message')).toHaveAttribute('role', 'alert')
    expect(screen.queryByTestId('w8-preview')).toBeNull()
    const aero = { ...TEAM_FIXTURE, proposal: { ...TEAM_FIXTURE.proposal, name: 'AeroLink Urban Mobility' } }
    upload('w8-import-week1', JSON.stringify(teamModelInputs(aero, '2026-10-19')))
    await waitFor(() => expect(screen.getByTestId('w8-message')).toHaveTextContent(/AeroLink/))
    expect(screen.queryByTestId('w8-preview')).toBeNull()
  })

  it('a Week 2 file alone: the snapshot is used and the findings ask for the Week 1 file', async () => {
    render(<Week8LabTool />)
    upload('w8-import-week2', WEEK2)
    await waitFor(() => expect(screen.getByTestId('w8-summary')).toBeInTheDocument())
    expect(screen.getByTestId('w8-message')).toHaveTextContent(/Import the Week 1 model inputs too/)
    expect(screen.getByTestId('w8-findings')).toHaveTextContent(/import the Week 1 model inputs to model the concerns/)
    expect(screen.getByTestId('w8-readiness')).toHaveTextContent(/Only a Week 2 file is imported/)
  })

  it('typing a purpose updates the root documentation of the preview', async () => {
    render(<Week8LabTool />)
    await importWeek1()
    expect(screen.getByTestId('w8-preview')).toHaveTextContent('[Write the model purpose here')
    fireEvent.change(screen.getByTestId('w8-purpose'), { target: { value: 'Used by the team to trace every delivery decision to a concern.' } })
    expect(screen.getByTestId('w8-preview')).toHaveTextContent('doc /* Purpose: Used by the team to trace every delivery decision to a concern. */')
  })

  it('the reduced scope removes the assessment metadata and the non-conflict relationships', async () => {
    render(<Week8LabTool />)
    await importWeek1()
    fireEvent.click(screen.getByTestId('w8-option-assessment'))
    fireEvent.change(screen.getByTestId('w8-option-relationships'), { target: { value: 'conflicts' } })
    expect(screen.getByTestId('w8-preview')).not.toHaveTextContent('@StakeholderAssessment')
    expect(screen.getByTestId('w8-preview')).not.toHaveTextContent("<'REL-002'>")
  })

  it('exports use the team’s file names: model, mapping matrix, workspace', async () => {
    render(<Week8LabTool />)
    await importWeek1()
    fireEvent.click(screen.getByTestId('w8-export-sysml'))
    fireEvent.click(screen.getByTestId('w8-export-md'))
    fireEvent.click(screen.getByTestId('w8-export-workspace'))
    expect(downloads.map((d) => d.name)).toEqual(['team-07-model-v01.sysml', 'team-07-mapping-matrix.md', 'team-07-week8-workspace.json'])
    expect(downloads[0].text).toMatch(/^\/\/ Riverside Food Bank Network: SysML v2 model v0.1/)
    expect(downloads[1].text).toContain('## Mapping matrix')
    expect(JSON.parse(downloads[2].text).format).toBe('week8-import')
  })

  it('a teammate’s workspace imports; a non-workspace file is refused', async () => {
    const r = importFile(WEEK1)
    if ('error' in r || r.kind !== 'week1') throw new Error('fixture')
    const ws = workspaceJson({ ...EMPTY_STATE, week1: r.source, week1Origin: r.source.origin, purpose: 'Shared purpose for the team model and its reviewers.' })
    render(<Week8LabTool />)
    upload('w8-import-workspace', '{"format":"week1-model-inputs"}')
    await waitFor(() => expect(screen.getByTestId('w8-message')).toHaveTextContent(/not a Week 8 workspace/))
    upload('w8-import-workspace', ws)
    await waitFor(() => expect(screen.getByTestId('w8-preview')).toHaveTextContent('Shared purpose for the team model'))
  })
})

describe('Week 8 tool state', () => {
  const full = () => {
    const r = importFile(WEEK1)
    if ('error' in r || r.kind !== 'week1') throw new Error('fixture')
    return { ...EMPTY_STATE, week1: r.source, week1Origin: r.source.origin }
  }
  it('normalizeState never throws and fills defaults', () => {
    for (const junk of [null, 42, 'x', [], { week1: 5, manual: 'x', dispositions: [1] }]) expect(() => normalizeState(junk)).not.toThrow()
    expect(normalizeState(null)).toEqual(EMPTY_STATE)
    expect(normalizeState(JSON.parse(JSON.stringify(full()))).week1?.stakeholders).toHaveLength(8)
  })
  it('readiness: becomes ready only when every item is met, and each item can fail', () => {
    const s = full()
    expect(readiness(EMPTY_STATE).ready).toBe(false)
    const notReady = readiness(s)
    expect(notReady.items.find((x) => x.id === 'week1')!.ok).toBe(true)
    expect(notReady.items.find((x) => x.id === 'purpose')!.ok).toBe(false)
    expect(notReady.items.find((x) => x.id === 'dispositions')!.ok).toBe(false)
    expect(notReady.items.find((x) => x.id === 'counts')!.ok).toBe(false)
    const manualPrefixes = ['VER', 'TPM', 'TECH', 'R', 'O', 'ALT', 'CRIT', 'DEC', 'FN', 'LOG', 'INFO', 'PHY', 'IF', 'INC', 'SCN', 'CAP', 'REQ-STK', 'REQ-SYS', 'MOE', 'MOP', 'A', 'U']
    const done = {
      ...s,
      purpose: 'Used by the team and its instructor to trace each delivery, storage and scheduling decision to the stakeholder concern it serves.',
      manual: manualPrefixes.map((p) => ({ prefix: p, count: '0', reason: '' })),
      dispositions: { 'unmapped:unmapped:AI': 'AI capabilities map to Logical parts, Week 10.' },
      updatedAt: 1,
      exportedSysmlAt: 2,
      exportedMdAt: 2,
    }
    const r = readiness(done)
    expect(r.items.filter((x) => !x.ok).map((x) => x.id)).toEqual([])
    expect(r.ready).toBe(true)
    expect(readiness({ ...done, exportedMdAt: 0 }).ready).toBe(false)
    expect(readiness({ ...done, relationships: 'conflicts' }).ready).toBe(true)
    expect(readiness({ ...done, week1: { ...done.week1!, relationships: done.week1!.relationships.filter((x) => x.type !== 'conflicts-with') } }).items.find((x) => x.id === 'relationships')!.ok).toBe(false)
  })
  it('the mapping-matrix Markdown carries the matrix, the four audit questions and the dispositions', () => {
    const md = matrixMarkdown({ ...full(), dispositions: { 'unmapped:unmapped:AI': 'Logical parts in Week 10.' } }, '2026-10-19')
    expect(md).toContain('| STK | Stakeholder | 1 | Stakeholders |')
    for (const h of ['### Completeness', '### Structure', '### Fidelity', '### Gaps']) expect(md).toContain(h)
    expect(md).toContain('8 of 8 stakeholders')
    expect(md).toContain('Disposition: Logical parts in Week 10.')
  })
  it('workspace import refuses another format, a wrong version and a missing state; never throws', () => {
    expect(importWorkspace('{x')).toEqual({ error: expect.stringMatching(/not valid JSON/) })
    expect(importWorkspace('{"format":"week8-import","version":2,"state":{}}')).toEqual({ error: expect.stringMatching(/version 2/) })
    expect(importWorkspace('{"format":"week8-import","version":1}')).toEqual({ error: expect.stringMatching(/state/) })
    expect('error' in importWorkspace(workspaceJson(full()))).toBe(false)
  })
})
