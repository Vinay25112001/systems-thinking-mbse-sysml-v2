// "How do I know I am finished?" (faculty feedback 2026-10-18, items 13 and 14): the Practice bar's overall progress and
// its "Practice complete → Check & submit" state, and the labeled mission list with per-mission completion.
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import week1 from '../../content/missions/week01'
import { WorkbenchContext, type Workbench } from '../context'
import { PracticeLinksContext } from '../learnLink'
import type { MissionEval } from '../missions'
import { MissionList } from './MissionBrief'
import { PracticeBar } from './PracticeBar'

/** Mission evaluations with the first `complete` missions finished and the rest at step 0. */
function evals(complete: number): MissionEval[] {
  return week1.missions.map((m, i) => {
    const done = i < complete ? m.steps.length : 0
    return { mission: m, steps: [], done, total: m.steps.length, complete: done === m.steps.length, current: done }
  })
}
const wb = (complete: number, setMissionId = vi.fn()) => ({ evals: evals(complete), missionId: week1.missions[0].id, setMissionId, setView: vi.fn() }) as unknown as Workbench

function renderWith(complete: number, onGuide = vi.fn(), setMissionId = vi.fn()) {
  return render(
    <WorkbenchContext.Provider value={wb(complete, setMissionId)}>
      <PracticeLinksContext.Provider value={{ onGuide, checkHref: '/week/1/check', completeText: 'Practice complete: all six missions are done.' }}>
        <PracticeBar />
        <MissionList />
      </PracticeLinksContext.Provider>
    </WorkbenchContext.Provider>,
  )
}

describe('Practice progress and completion', () => {
  it('shows missions complete out of six and reopens the orientation', () => {
    const onGuide = vi.fn()
    renderWith(2, onGuide)
    expect(screen.getByTestId('practice-progress')).toHaveTextContent('2 of 6 missions complete')
    expect(screen.getByRole('progressbar', { name: 'Missions complete: 2 of 6' })).toHaveAttribute('value', '2')
    expect(screen.queryByTestId('practice-complete')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'How the workbench works' }))
    expect(onGuide).toHaveBeenCalledOnce()
  })

  it('when every mission is complete it says so and links to Check & submit', () => {
    renderWith(6)
    const done = screen.getByTestId('practice-complete')
    expect(done).toHaveTextContent('Practice complete')
    expect(within(done).getByRole('link', { name: 'Go to Check & submit' })).toHaveAttribute('href', '#/week/1/check')
  })

  it('the state can fail: five of six is not complete', () => {
    renderWith(5)
    expect(screen.queryByTestId('practice-complete')).toBeNull()
    expect(screen.getByTestId('practice-bar')).not.toHaveClass('is-complete')
  })

  it('the mission list is labeled, names every mission with its progress, and switches missions', () => {
    const setMissionId = vi.fn()
    renderWith(1, vi.fn(), setMissionId)
    expect(screen.getByRole('heading', { name: /Missions · choose one/ })).toBeInTheDocument()
    expect(screen.getByTestId('missions-complete')).toHaveTextContent('1 of 6 complete')
    const list = screen.getByRole('list', { name: 'Week missions' })
    expect(within(list).getAllByRole('button')).toHaveLength(6)
    expect(within(list).getByText(week1.missions[2].short!)).toBeVisible()
    // review F13: every tile shows a distinct short title, so missions of the same kind can be told apart
    expect(new Set(week1.missions.map((m) => m.short)).size).toBe(week1.missions.length)
    expect(screen.getByTestId('mission-1')).toHaveAccessibleName(/complete$/)
    expect(screen.getByTestId('mission-2')).toHaveAccessibleName(/0 of \d steps done$/)
    fireEvent.click(screen.getByTestId('mission-3'))
    expect(setMissionId).toHaveBeenCalledWith(week1.missions[2].id)
  })
})

describe('Week 1 step statements (item 12)', () => {
  it('every step states its task, the input expected and what done looks like, flagged for review', () => {
    for (const m of week1.missions)
      for (const st of m.steps) {
        expect(st.brief, `${m.id}/${st.id}`).toBeDefined()
        for (const t of [st.brief!.task, st.brief!.input, st.brief!.done]) expect(t.length, `${m.id}/${st.id}`).toBeGreaterThan(10)
        expect(st.brief!.review).toBe('new-pending-review')
      }
  })
})
