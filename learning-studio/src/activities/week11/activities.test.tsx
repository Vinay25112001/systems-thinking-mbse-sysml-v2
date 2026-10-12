import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_PREFIX } from '../../lib/storage'
import { Providers } from '../../state/Providers'
import { ACTIVITIES } from '../week11.activity'
import { FlowCoverage } from './FlowCoverage'
import { RidWriter } from './RidWriter'
import { MODEL_RIDS, PRACTICE_STORE, REVIEW_STORE } from './rids'
import { StateWalker } from './StateWalker'

beforeEach(() => window.localStorage.clear())
afterEach(() => cleanup())
const store = (key: string, value: unknown) => window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))

describe('Week 11 activities', { timeout: 30000 }, () => {
  it('registers three w11- keys', () => {
    expect(Object.keys(ACTIVITIES)).toEqual(['w11-flow-coverage', 'w11-state-walker', 'w11-rid-writer'])
  })

  it('flow coverage: an empty flow fails coverage; the worked SCN-002 flow passes', async () => {
    const user = userEvent.setup()
    render(<Providers><FlowCoverage /></Providers>)
    expect(screen.getByTestId('w11-flow-findings').textContent).toMatch(/Main-flow steps with no node: step 1/)
    await user.click(screen.getByRole('button', { name: 'Load the worked SCN-002 flow' }))
    expect(screen.getByTestId('w11-flow-findings').textContent).not.toMatch(/✗/)
    expect(screen.getByLabelText('planFlight realises M1')).toBeChecked()
  })

  it('W11-F12: loading Team K’s draft never overwrites the student’s own SCN-005 draft; clearing asks twice', async () => {
    const user = userEvent.setup()
    render(<Providers><FlowCoverage /></Providers>)
    await user.selectOptions(screen.getByLabelText('Scenario'), 'ref:SCN-005')
    await user.type(screen.getByLabelText('New node name'), 'myFlagStep')
    await user.click(screen.getByRole('button', { name: 'Add node' }))
    await user.click(screen.getByLabelText(/Team K’s draft/))
    expect(screen.getByTestId('w11-flow-nodes').textContent).toMatch(/declareHold/)
    expect(screen.getByTestId('w11-flow-nodes').textContent).not.toMatch(/myFlagStep/)
    await user.click(screen.getByLabelText('My draft'))
    expect(screen.getByTestId('w11-flow-nodes').textContent).toMatch(/myFlagStep/)
    await user.click(screen.getByRole('button', { name: 'Clear this flow' }))
    expect(screen.getByTestId('w11-flow-nodes').textContent).toMatch(/myFlagStep/) // not yet: a confirmation is shown
    await user.click(screen.getByRole('button', { name: 'Keep my draft' }))
    expect(screen.getByTestId('w11-flow-nodes').textContent).toMatch(/myFlagStep/)
  })

  it('W11-F14: Team K’s findings stay hidden until three distinct practice RIDs exist, then show the seeded defects', async () => {
    const user = userEvent.setup()
    const first = render(<Providers><FlowCoverage /></Providers>)
    await user.selectOptions(screen.getByLabelText('Scenario'), 'ref:SCN-005')
    await user.click(screen.getByLabelText(/Team K’s draft/))
    expect(screen.getByTestId('w11-flow-locked').textContent).toMatch(/0 of 3 distinct practice RIDs/)
    expect(screen.getByTestId('w11-flow-findings').textContent).toBe('')
    first.unmount()
    store(PRACTICE_STORE, MODEL_RIDS.slice(0, 3))
    render(<Providers><FlowCoverage /></Providers>)
    const text = screen.getByTestId('w11-flow-findings').textContent ?? ''
    expect(text).toMatch(/step 2 cannot follow step 1/)
    expect(text).toMatch(/A2 ends the scenario but leads on to notifyPassengers/)
  })

  it('state walker: the dispatch guard blocks DispatchRelease while a no-go fault is open; T4 is a gap; Team K analysis is gated', async () => {
    const user = userEvent.setup()
    render(<Providers><StateWalker /></Providers>)
    await user.click(screen.getByRole('button', { name: 'Send ChargerConnected' }))
    await user.click(screen.getByRole('button', { name: 'Send DispatchThresholdReached' }))
    await user.click(screen.getByLabelText(/noGoFaultOpen/))
    await user.click(screen.getByRole('button', { name: 'Send DispatchRelease' }))
    expect(screen.getByTestId('w11-walker-current').textContent).toMatch(/dispatchReady/)
    expect(screen.getByTestId('w11-walker-log').textContent).toMatch(/guard is false now/)
    expect(screen.getByTestId('w11-walker-traces').textContent).toMatch(/T4.*Does not match the ConOps.*|T4.*Is this a gap\?/)
    await user.click(screen.getByLabelText(/Team K VertiportWeatherStates/))
    expect(screen.getByTestId('w11-walker-locked')).toBeTruthy()
    expect(screen.getByTestId('w11-walker-findings').textContent).toBe('')
  })

  it('RID writer: blocks a vague RID and a missing writer, records owner and provenance on a good one', async () => {
    const user = userEvent.setup()
    render(<Providers><RidWriter /></Providers>)
    const good = MODEL_RIDS[3]
    await user.type(screen.getByLabelText('Location'), 'The weather state machine')
    await user.type(screen.getByLabelText('Violated criterion or source'), good.criterion)
    await user.selectOptions(screen.getByLabelText('Category'), good.category)
    await user.selectOptions(screen.getByLabelText('Severity (course scale)'), good.severity)
    await user.type(screen.getByLabelText(/Discrepancy/), good.discrepancy)
    await user.type(screen.getByLabelText('Proposed fix'), 'Update the state machine accordingly so that it matches the ConOps.')
    expect(screen.getByRole('button', { name: 'Add RID' })).toBeDisabled()
    expect(screen.getByTestId('w11-rid-screens').textContent).toMatch(/location: Name the element/)
    await user.clear(screen.getByLabelText('Location'))
    await user.type(screen.getByLabelText('Location'), good.location)
    await user.clear(screen.getByLabelText('Proposed fix'))
    await user.type(screen.getByLabelText('Proposed fix'), good.fix)
    expect(screen.getByRole('button', { name: 'Add RID' })).toBeDisabled() // no writer initials yet
    await user.type(screen.getByLabelText(/Owner/), 'jd')
    await user.selectOptions(screen.getByLabelText('Provenance'), 'AI-suggested-reviewed')
    await user.click(screen.getByRole('button', { name: 'Add RID' }))
    expect(screen.getByTestId('w11-rid-list').textContent).toMatch(/RID-T1-01.*\(JD, AI-suggested-reviewed\)/)
    expect(screen.getByTestId('w11-rid-set').textContent).toMatch(/1 RID\(s\): this set asks for at least 3/)
  })

  it('W11-F14: the key stays closed for one RID saved five times, opens for three distinct findings', async () => {
    const user = userEvent.setup()
    const one = MODEL_RIDS[0]
    store(PRACTICE_STORE, [0, 1, 2, 3, 4].map((i) => ({ ...one, id: `RID-IN-3${i}` })))
    const first = render(<Providers><RidWriter /></Providers>)
    expect(screen.getByRole('button', { name: 'Compare with the instructor’s RIDs' })).toBeDisabled()
    expect(screen.getByTestId('w11-rid-unlock').textContent).toMatch(/1 of 3/)
    first.unmount()
    store(PRACTICE_STORE, MODEL_RIDS.slice(0, 3))
    render(<Providers><RidWriter /></Providers>)
    await user.click(screen.getByRole('button', { name: 'Compare with the instructor’s RIDs' }))
    expect(screen.getByTestId('w11-rid-key').textContent).toMatch(/RID-IN-09.*found only by reading/)
  })

  it('W11-F22: the Week 12 review list and export are separate from the practice RIDs', async () => {
    const user = userEvent.setup()
    store(PRACTICE_STORE, MODEL_RIDS.slice(0, 3))
    store(REVIEW_STORE, [])
    render(<Providers><RidWriter /></Providers>)
    expect(screen.getByTestId('w11-rid-markdown').textContent).toMatch(/RID-IN-01/)
    await user.click(screen.getByLabelText(/Week 12 review/))
    expect(screen.getByTestId('w11-rid-markdown').textContent).not.toMatch(/RID-IN-01/)
    expect(screen.getByTestId('w11-rid-set').textContent).toMatch(/0 RID\(s\): this set asks for at least 5/)
  })
})
