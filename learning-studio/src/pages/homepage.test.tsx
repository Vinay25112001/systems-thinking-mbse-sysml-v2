// Course homepage (spec §a, HP-01…HP-04, AC-01, B2–B4), M4 part A.
import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { WEEKS } from '../content/course'
import { institutionLine } from '../content/courseSettings'
import { Providers } from '../state/Providers'
import Homepage from './Homepage'

beforeEach(() => window.localStorage.clear())

const home = () =>
  render(
    <Providers>
      <Homepage />
    </Providers>,
  )

describe('Homepage', () => {
  it('reads in the spec order and ends with the one primary action into Week 1', () => {
    home()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Systems Thinking and MBSE with SysML v2')
    const h2 = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(h2).toEqual(['What the course teaches', 'Two phases, one enterprise', 'AeroLink, the instructor’s example', 'Your team’s own enterprise', 'What you submit', 'How the site is organized', 'Week 1: Team formation, needs and stakeholders'])
    expect(screen.getByTestId('hp-start')).toHaveAttribute('href', '#/week/1')
    expect(screen.getByTestId('hp-aerolink')).toHaveTextContent('Instructor example · fictional')
  })

  it('shows the 14-week figure with a text equivalent listing every week (B3)', () => {
    home()
    const fig = screen.getByTestId('hp-weeks')
    for (const w of WEEKS) expect(fig).toHaveTextContent(`Week ${w.number}`)
    const te = within(fig).getByText('Show text description').closest('details')!
    expect(te.querySelectorAll('li')).toHaveLength(14)
  })

  it('has no internal codes, no stale lecture-first text, no grading weights and no unverified department (HP-01…HP-03)', () => {
    home()
    const t = screen.getByTestId('homepage').textContent!
    expect(t).not.toMatch(/\bR\d{2}[a-z]?\b|\bS\d{2}\b|lecture-first|Lecture slides|Week 1 is built this way|Department to be confirmed|%/)
    expect(screen.getByTestId('hp-institution')).toHaveTextContent(/^Wright State University$/)
    expect(institutionLine({ department_label: 'Department of X', department_label_verified: false })).toBe('Wright State University')
    expect(institutionLine({ department_label: 'Department of X', department_label_verified: true })).toBe('Wright State University · Department of X')
    expect(screen.getAllByText('course framing').length).toBeGreaterThan(0)
    expect(screen.getByRole('list', { name: 'Notes' })).toHaveTextContent('SEBoK v2.14 (2026), “Systems Engineering Overview”, PDF p. 52')
  })
})
