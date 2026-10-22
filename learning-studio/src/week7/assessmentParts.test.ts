// The Week 7 assessment: no readiness quiz (a review week; the reason is stated to students), the exam placement named as an
// open faculty decision, a rubric with team and individual criteria and a descriptor at every level, a RID form that asks
// for a location, a criterion, a severity and a fix, and a graduate memo that fits its workload row.
import { describe, expect, it } from 'vitest'
import { RID_FORM_FIELDS, ridFormMarkdown } from '../content/lab/week07Lab'
import { GRADUATE_TASK_HOURS, WORKLOAD_ROWS } from '../content/week7Path'
import { EXAM_NOTE, GRADUATE_CRITERIA, INDIVIDUAL_CRITERIA, NO_QUIZ_NOTE, TEAM_CRITERIA } from './assessmentParts'

describe('Week 7 assessment', () => {
  it('there is no readiness quiz, and the page says why', () => {
    expect(NO_QUIZ_NOTE).toMatch(/No readiness quiz this week/)
    expect(NO_QUIZ_NOTE).toMatch(/review/)
    expect(WORKLOAD_ROWS.some((r) => /quiz/i.test(r.activity))).toBe(false)
    // no Week 7 quiz module exists to be routed by mistake
    const mods = import.meta.glob('../content/quizWeek7*.ts')
    expect(Object.keys(mods)).toEqual([])
  })
  it('the exam placement is named as an open faculty decision, not resolved', () => {
    expect(EXAM_NOTE).toMatch(/open faculty decision/)
  })
  it('team, individual and graduate criteria each have four distinct level descriptors', () => {
    expect(TEAM_CRITERIA.length).toBe(6)
    expect(INDIVIDUAL_CRITERIA.length).toBe(2)
    expect(GRADUATE_CRITERIA.length).toBe(4)
    for (const c of [...TEAM_CRITERIA, ...INDIVIDUAL_CRITERIA, ...GRADUATE_CRITERIA]) expect(new Set(c.levels).size, c.id).toBe(4)
    expect(INDIVIDUAL_CRITERIA.map((c) => c.criterion)).toEqual(['Answers on own elements', 'Peer review findings (RIDs)'])
  })
  it('the RID form asks for a location, a criterion, a severity and a fix, and downloads as Markdown', () => {
    for (const f of ['Where', 'Criterion or source', 'Severity', 'Proposed fix']) expect(RID_FORM_FIELDS.some((x) => x.field === f), f).toBe(true)
    expect(ridFormMarkdown()).toMatch(/^# Week 7 peer review/)
  })
  it('the graduate memo is about 40 minutes, inside its 0.7 h allowance', () => {
    expect(GRADUATE_TASK_HOURS * 60).toBeGreaterThanOrEqual(40)
  })
})
