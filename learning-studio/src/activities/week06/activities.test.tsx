import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Providers } from '../../state/Providers'
import { ACTIVITIES } from '../week06.activity'
import { MicroLab2 } from './MicroLab2'
import { RiskQuantifier } from './RiskQuantifier'
import { RiskRegister } from './RiskRegister'
import { SrrChecklist } from './SrrChecklist'
import { TrlAssessor } from './TrlAssessor'

beforeEach(() => window.localStorage.clear())
afterEach(() => cleanup())

type User = ReturnType<typeof userEvent.setup>
/** Click into a field and paste (typing long statements character by character is slow under jsdom). */
async function fill(user: User, el: HTMLElement, text: string) {
  await user.click(el)
  await user.paste(text)
}

describe('Week 6 activities', () => {
  it('registers five w06- keys', () => {
    expect(Object.keys(ACTIVITIES)).toHaveLength(5)
    expect(Object.keys(ACTIVITIES).every((k) => k.startsWith('w06-'))).toBe(true)
  })

  it('TRL assessor flags a claim above the ladder and shows the lowest critical TRL', async () => {
    const user = userEvent.setup()
    render(<Providers><TrlAssessor /></Providers>)
    for (const n of [1, 2, 3, 4]) await user.selectOptions(screen.getByLabelText(new RegExp(`^TRL ${n}:`)), 'yes')
    expect(screen.getByTestId('w06-trl-supported')).toHaveTextContent('support TRL 4')
    await user.selectOptions(screen.getByLabelText('Assigned TRL'), '6')
    await user.click(screen.getByRole('button', { name: 'Check this assessment' }))
    expect(screen.getByTestId('w06-trl-findings')).toHaveTextContent('support only TRL 4')
    expect(screen.getByTestId('w06-trl-findings')).toHaveTextContent('basis')
    expect(screen.getByTestId('w06-trl-lowest')).toHaveTextContent('Lowest critical TRL: 6 (TECH-001)')
  }, 30_000)

  it('TRL assessor records a TECH and its new assumption in the workspace', async () => {
    const user = userEvent.setup()
    render(<Providers><TrlAssessor /><RiskRegister /></Providers>)
    for (const n of [1, 2, 3, 4, 5, 6]) await user.selectOptions(screen.getByLabelText(new RegExp(`^TRL ${n}:`)), 'yes')
    await user.selectOptions(screen.getByLabelText('Assigned TRL'), '6')
    await user.click(screen.getByLabelText('Labelled assumption'))
    await user.type(screen.getByLabelText('Assumption ID (A-nnn)'), 'A-003')
    await fill(user, screen.getByLabelText(/^Assumption statement/), 'The charger supplier demonstrated a prototype at an operating vertiport; confirm with the test report before the charger order.')
    await fill(user, screen.getByLabelText(/^What “relevant environment” means/), 'an operating vertiport with a representative grid connection')
    // §7 rule 1: no owner initials, no recording
    await user.click(screen.getByRole('button', { name: 'Record in workspace' }))
    expect(screen.getByTestId('w06-trl-message')).toHaveTextContent('owner’s initials')
    const fields = within(screen.getByTestId('w06-trl-assessor')).getByTestId('provenance-owner')
    await user.type(within(fields).getByLabelText('Owner (initials)'), 'jd')
    await user.selectOptions(within(fields).getByLabelText('Provenance'), 'AI-suggested-reviewed')
    await user.click(screen.getByRole('button', { name: 'Record in workspace' }))
    expect(screen.getByTestId('w06-trl-message')).toHaveTextContent('TECH-001 recorded; new assumption A-001 created')
    expect(screen.getByTestId('w06-trl-message')).toHaveTextContent('owner JD')
    expect(screen.getByTestId('w06-other-entries')).toHaveTextContent('A-001 (Assumption)')
  }, 30_000)

  it('risk register rejects a bare worry, then records, plots and counts a well-formed risk', async () => {
    const user = userEvent.setup()
    render(<Providers><RiskRegister /></Providers>)
    await user.selectOptions(screen.getByLabelText('Affects element'), 'STK-005')
    await fill(user, screen.getByLabelText('Title'), 'Charger fire')
    await user.type(screen.getByLabelText(/^Owner \(role/), 'Vertiport Safety Manager')
    await fill(user, screen.getByLabelText(/^Risk statement/), 'Batteries might catch fire on the pad which would be bad.')
    await user.click(screen.getByRole('button', { name: 'Record entry' }))
    expect(screen.getByRole('alert')).toHaveTextContent('condition–if–then')
    await user.clear(screen.getByLabelText(/^Risk statement/))
    await fill(user, screen.getByLabelText(/^Risk statement/), 'Condition: packs are charged at high power on hub pads. If a cell enters thermal runaway, then fire can spread and close the pad.')
    await user.selectOptions(screen.getByLabelText('Likelihood'), '2')
    await user.selectOptions(screen.getByLabelText('Consequence'), '5')
    expect(screen.getByTestId('w06-cell-level')).toHaveTextContent('Cell level: Moderate')
    await user.selectOptions(screen.getByLabelText('Handling option'), 'mitigate')
    await fill(user, screen.getByLabelText('Trigger / watch item'), 'Cell over-temperature alarm')
    await fill(user, screen.getByLabelText(/^Treatment/), 'Temperature monitoring stops charging; pad fire detection alerts responders.')
    await user.click(screen.getByRole('button', { name: 'Record entry' }))
    expect(screen.getByRole('alert')).toHaveTextContent('owner’s initials')
    await user.type(within(screen.getByTestId('w06-risk-register')).getAllByLabelText('Owner (initials)')[0], 'AB')
    await user.click(screen.getByRole('button', { name: 'Record entry' }))
    expect(screen.getByTestId('w06-register-message')).toHaveTextContent('R-001 recorded and linked (affects STK-005)')
    const cell = screen.getByLabelText('Likelihood 2, consequence 5: Moderate; R-001')
    expect(within(cell).getByRole('button', { name: 'R-001' })).toBeInTheDocument()
    expect(screen.getByTestId('w06-risk-table')).toHaveTextContent('Vertiport Safety Manager')
    expect(screen.getByTestId('w06-completeness')).toHaveTextContent('Fail — ≥ 8 AROU entries (1 entries)')
  }, 30_000)

  it('risk register shows the reference register read-only and complete', async () => {
    const user = userEvent.setup()
    render(<Providers><RiskRegister /></Providers>)
    await user.click(screen.getByLabelText('Instructor reference register (read-only)'))
    expect(screen.getByTestId('w06-completeness')).not.toHaveTextContent('Fail')
    expect(screen.getByLabelText(/^Likelihood 2, consequence 5: Moderate; R-003, R-008$/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Record entry' })).toBeNull()
  }, 30_000)

  it('quantifier shows the R-008 model below the lowest band and disagreeing with L2', () => {
    render(<Providers><RiskQuantifier /></Providers>)
    expect(screen.getByTestId('w06-quant-compare')).toHaveTextContent('below the lowest band')
    expect(screen.getByTestId('w06-quant-compare')).toHaveTextContent('L2 overstates it')
    expect(screen.getByTestId('w06-tree')).toHaveTextContent('172,800 exposures')
  })

  it('SRR checklist demands actionable findings before recommending', async () => {
    const user = userEvent.setup()
    render(<Providers><SrrChecklist /></Providers>)
    await user.selectOptions(screen.getByLabelText('Rating for S4'), 'partly')
    await fill(user, screen.getByLabelText('Finding for S4'), 'Maturity looks weak.')
    expect(screen.getByTestId('w06-srr-issues-S4')).toHaveTextContent('ID')
    expect(screen.getByTestId('w06-srr-recommendation')).toHaveTextContent('Review incomplete')
  }, 30_000)

  it('risk register rejects the reviewer’s embedded-mitigation probe with the targeted message', async () => {
    const user = userEvent.setup()
    render(<Providers><RiskRegister /></Providers>)
    await fill(user, screen.getByLabelText(/^Risk statement/), 'Condition: hub pads are crowded. If we do not install pad fire suppression, then a fire will spread on the pad.')
    await user.click(screen.getByRole('button', { name: 'Record entry' }))
    expect(screen.getByRole('alert')).toHaveTextContent('absence of a treatment')
  }, 30_000)

  it('issue log records an issue apart from the risks', async () => {
    const user = userEvent.setup()
    render(<Providers><RiskRegister /></Providers>)
    const log = screen.getByTestId('w06-issue-log')
    await fill(user, within(log).getByLabelText('Issue title'), 'Hub 2 charger trips')
    await user.selectOptions(within(log).getByLabelText('Issue affects element'), 'STK-005')
    await fill(user, within(log).getByLabelText(/^What has happened/), 'The hub 2 charger tripped three times during trial operations this week.')
    await fill(user, within(log).getByLabelText('Issue owner (role)'), 'Vertiport Infrastructure Manager')
    await fill(user, within(log).getByLabelText('Action now'), 'Root-cause analysis with the supplier by Friday')
    await user.click(within(log).getByRole('button', { name: 'Record issue' }))
    expect((screen.getByTestId('w06-issue-text') as HTMLTextAreaElement).value).toContain('ISS-001 Hub 2 charger trips')
    expect(screen.getByTestId('w06-risk-table')).not.toHaveTextContent('Hub 2 charger trips')
  }, 30_000)

  it('SRR checklist flags an opinion finding even when it has an ID and an action verb', async () => {
    const user = userEvent.setup()
    render(<Providers><SrrChecklist /></Providers>)
    await user.selectOptions(screen.getByLabelText('Rating for S4'), 'partly')
    await fill(user, screen.getByLabelText('Finding for S4'), 'TECH-002 is rated low; we would rate it differently in our own opinion overall.')
    expect(screen.getByTestId('w06-srr-issues-S4')).toHaveTextContent('preference or opinion')
  }, 30_000)

  it('micro-lab 2 shows the validated listing, scores a classification and explains a unit verdict', async () => {
    const user = userEvent.setup()
    render(<Providers><MicroLab2 /></Providers>)
    await user.click(screen.getByRole('button', { name: /^Element 7: Charger on line 23/ }))
    await user.click(screen.getByLabelText('General definition (after :>)'))
    await user.selectOptions(screen.getByLabelText('Verdict for attribute redefines ratedPower = 160 [kW * h];'), 'ok')
    await user.click(screen.getByRole('button', { name: 'Check my answers' }))
    expect(screen.getByTestId('w06-microlab2-item-feedback')).toHaveTextContent('Correct.')
    expect(screen.getByTestId('w06-unit-feedback-u2')).toHaveTextContent('Not quite')
    expect(screen.getByTestId('w06-microlab2-score')).toHaveTextContent('Elements: 1 of 14 correct. Units: 0 of 6 correct.')
  }, 30_000)
})
