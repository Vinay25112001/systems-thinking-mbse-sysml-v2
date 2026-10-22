// The Week 6 applied exercise fits its stated minutes, reading time included (review Mo4), inside the workload row; it is
// scored on the same scale as the graduate memo (four criteria × four levels, 16 points: the Week 4 N6 / Week 5 Mo3
// lesson); it assesses proposed objectives W6.4 and W6.6 (review Mo3); its brief exists with marking notes that agree with
// the descriptors (review n10, Mo1); and it uses a setting no quiz item uses. The workload row for the exercise matches.
import { describe, expect, it } from 'vitest'
import { LAB_LEVELS, RUBRIC_LEVELS } from '../content/lab/week06Lab'
import { WEEK6_QUIZ } from '../content/quizWeek6'
import { WORKLOAD_ROWS } from '../content/week6Path'
import { EXERCISE_LEVELS, EXERCISE_MINUTES, EXERCISE_READING_MINUTES, EXERCISE_TASK_MINUTES, EXERCISE_TASKS } from './assessmentParts'
import brief from '../../docs/lectures/week06/WEEK6_APPLIED_EXERCISE_BRIEF.md?raw'

describe('Week 6 applied exercise', () => {
  it('reading time plus four tasks fit the stated minutes, inside the 0.6 h workload row, and no task runs under a minute per element', () => {
    expect(EXERCISE_TASKS.length).toBe(4)
    expect(EXERCISE_READING_MINUTES).toBeGreaterThanOrEqual(5)
    expect(EXERCISE_MINUTES).toBe(EXERCISE_READING_MINUTES + EXERCISE_TASK_MINUTES)
    expect(EXERCISE_MINUTES).toBe(36)
    expect(WORKLOAD_ROWS.find((r) => r.id === 'exercise')!.hours * 60).toBeGreaterThanOrEqual(EXERCISE_MINUTES)
    // Task 2: one increment in full (9 elements) and a second with three: at least a minute per element
    expect(EXERCISE_TASKS[1].minutes).toBeGreaterThanOrEqual(12)
  })
  it('negative direction: the old timing (no reading time, 35 minutes of tasks) would not leave the reading time', () => {
    expect(35 + EXERCISE_READING_MINUTES).toBeGreaterThan(WORKLOAD_ROWS.find((r) => r.id === 'exercise')!.hours * 60)
  })
  it('the exercise and the graduate memo are both four criteria on four levels (16 points)', () => {
    expect(RUBRIC_LEVELS.length).toBe(4)
    expect(EXERCISE_LEVELS.length).toBe(4)
    expect(LAB_LEVELS.filter((x) => x.graduate).length).toBe(4)
    for (const x of [...EXERCISE_LEVELS, ...LAB_LEVELS]) expect(x.levels.length, x.criterion).toBe(4)
  })
  it('security and resilience are part of the exercise (A21 item 6)', () => {
    expect(EXERCISE_TASKS.map((t) => t.text).join(' ')).toMatch(/security and resilience change/)
  })
  it('proposed objectives W6.4 and W6.6 are assessed: the development approach with a reason, and a transition-only risk', () => {
    const task2 = EXERCISE_TASKS[1].text
    expect(task2).toMatch(/development approach with a one-line reason/)
    expect(task2).toMatch(/risk that exists only during its transition/)
    const inc = EXERCISE_LEVELS.find((x) => x.criterion === 'Increments')!.levels[0]
    expect(inc).toMatch(/justifies its development approach/)
    expect(inc).toMatch(/transition-only risk/)
    expect(brief).toMatch(/W6\.4/)
    expect(brief).toMatch(/W6\.6/)
  })
  it('the brief exists with the case data, the tasks and marking notes for every criterion, and agrees with the descriptors', () => {
    expect(brief).toMatch(/FICTIONAL/)
    expect(brief).toMatch(/## Marking notes/)
    for (const c of EXERCISE_LEVELS) expect(brief, c.criterion).toContain(c.criterion)
    // n10: one unit for LC-N2 (trips per bike), the TRL limit about the depot, vans and winter, the tariff rule
    expect(brief).toMatch(/same trip rate per bike/)
    expect(EXERCISE_LEVELS.find((x) => x.criterion === 'Insertion justified')!.levels[0]).toMatch(/depot, vans and winter/)
    expect(brief).toMatch(/depot, vans and\s+winter/)
    expect(EXERCISE_LEVELS.find((x) => x.criterion === 'Known unknowns')!.levels[2]).toMatch(/tariff gated to the battery-swap increment/)
    // Mo1 / confirmation N1: the docks do not bind, so dock headroom (200 or 600) is slack, never an excess, and an answer
    // that calls it one scores at most 2 (the lecture's charger rule, the task text and the level-2 descriptor agree)
    expect(brief).toMatch(/Lakeside has no capacity excess/)
    expect(brief).toMatch(/dock headroom \(200 or 600\) an excess scores \*\*at\s+most 2\*\*/)
    expect(brief).not.toMatch(/200 trips a day\*\* above the desired level/)
    expect(EXERCISE_TASKS[0].text).toMatch(/not spare room on a limit that does not bind/)
    expect(EXERCISE_LEVELS[0].levels[2]).toMatch(/slack on the dock limit called an excess/)
    expect(brief).toMatch(/Timing check\.[^\n]*5 \+ 7 \+ 13 \+ 5 \+ 6 = 36/)
  })
  it('no quiz item uses the exercise setting', () => {
    for (const q of WEEK6_QUIZ) expect(JSON.stringify(q), q.id).not.toMatch(/bike/i)
  })
})
