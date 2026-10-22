// The instructor review list, both directions: every item ID is unique (the synthetic lab item of Weeks 9-13 used to
// share its ID, w<N>-lab, with the lesson block of kind lab, and so its recorded decision); the lesson blocks keep their
// IDs, so decisions recorded for them still match; weeks without a colliding block keep the old lab item ID; the page
// renders every row with no duplicate-key warning. (Week 11 review m1.)
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { WEEK_CONTENT } from '../content/weeks'
import { AppStateProvider } from '../state/AppState'
import { saveJSON } from '../lib/storage'
import { labReviewId } from '../content/reviewIds'
import { InstructorReview, reviewableItems } from './InstructorReview'
import { LabPanel } from './WeekPage'

describe('instructor review items', () => {
  const items = reviewableItems()
  it('every item ID is unique', () => {
    const ids = items.map((i) => i.id)
    expect(ids.filter((id, k) => ids.indexOf(id) !== k)).toEqual([])
  })
  it('lesson blocks keep their IDs; the lab item moves only where a block already holds w<N>-lab', () => {
    const colliding = Object.values(WEEK_CONTENT).filter((c) => c.blocks.some((b) => b.id === `w${c.week}-lab`))
    expect(colliding.map((c) => c.week).sort((a, b) => a - b)).toEqual(expect.arrayContaining([9, 10, 11, 12, 13]))
    for (const c of colliding) {
      expect(items.find((i) => i.id === `w${c.week}-lab`)!.area, `week ${c.week}`).toMatch(/lesson$/)
      expect(items.find((i) => i.id === `w${c.week}-lab-summary`)!.area, `week ${c.week}`).toMatch(/lab$/)
    }
    for (const c of Object.values(WEEK_CONTENT).filter((x) => !colliding.includes(x))) {
      expect(items.find((i) => i.id === `w${c.week}-lab`)!.area, `week ${c.week}`).toMatch(/lab$/)
      expect(items.some((i) => i.id === `w${c.week}-lab-summary`)).toBe(false)
    }
  })
  it('the page renders every row without a duplicate-key warning', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <AppStateProvider>
        <InstructorReview />
      </AppStateProvider>,
    )
    expect(screen.getAllByRole('row').length).toBe(reviewableItems().length + 1)
    expect(err.mock.calls.map((c) => String(c[0])).filter((m) => /same key/.test(m))).toEqual([])
    err.mockRestore()
  })
  it('the week page records the lab decision under the same ID as the review list (Week 11 confirmation C1)', () => {
    saveJSON('instructor', true)
    for (const c of Object.values(WEEK_CONTENT)) {
      const id = labReviewId(c)
      expect(items.some((i) => i.id === id && /lab$/.test(i.area)), `week ${c.week}`).toBe(true)
      const { unmount } = render(
        <AppStateProvider>
          <LabPanel c={c} />
        </AppStateProvider>,
      )
      expect(screen.getByTestId(`review-${id}`), `week ${c.week}`).toBeTruthy()
      unmount()
    }
    localStorage.clear()
  })
})
