// Definition-of-done tests for every authored week module (src/content/weeks/weekNN.ts).
// Structural checks must always pass; "complete" additionally requires an independent review (schema.ts).
// Modules are numbered by the earlier outline (draftWeeks.ts) and are checked against the objectives they were written for;
// under the A19 schedule only Week 1 is live, and since its rebuild (2026-10-18) its module is written for the course.ts
// Week 1 objectives, not for the archived draft outline (asserted below).
import { describe, expect, it } from 'vitest'
import { WEEKS } from '../course'
import { draftWeekByNumber } from '../draftWeeks'
import { citationInRange, getReading, type Citation } from '../readings'
import { RUBRIC_IDS } from '../rubrics'
import { weekChecks, type WeekContent } from '../schema'
import { ACTIVITY_KEYS } from '../../activities/registry'
import { sysmlSource } from '../../lib/sysml'
import { WEEK_CONTENT } from '.'

const authored = Object.values(WEEK_CONTENT).sort((a, b) => a.week - b.week)

function citationsOf(c: WeekContent): Citation[] {
  return [
    ...c.blocks.flatMap((b) => [...b.citations, ...(b.quote ? [b.quote.cite] : [])]),
    ...c.quiz.flatMap((q) => (q.cite ? [q.cite] : [])),
    ...c.instructorNotes.misconceptions.flatMap((m) => (m.cite ? [m.cite] : [])),
    ...c.references,
  ]
}

describe('week modules', () => {
  it('Week 1 is authored', () => {
    expect(WEEK_CONTENT[1]).toBeDefined()
  })

  it('the rebuilt Week 1 module is written for the course.ts Week 1 objectives, which differ from the archived draft ones', () => {
    expect(WEEKS[0].objectives.map((o) => o.id)).toEqual(['B1.1', 'B1.2', 'B1.3', 'B1.4', 'B1.5'])
    expect(WEEKS[0].objectives).not.toEqual(draftWeekByNumber(1)!.objectives)
    const used = new Set([...WEEK_CONTENT[1].quiz.map((q) => q.objective), ...WEEK_CONTENT[1].lab.objectives, ...WEEK_CONTENT[1].assignment.objectives])
    for (const o of WEEKS[0].objectives) expect(used.has(o.id), o.id).toBe(true)
  })

  it('block, quiz and activity IDs are unique across the whole course', () => {
    for (const ids of [
      authored.flatMap((c) => c.blocks.map((b) => b.id)),
      authored.flatMap((c) => c.quiz.map((q) => q.id)),
      authored.flatMap((c) => c.activities.map((a) => a.id)),
    ]) {
      expect(ids.length).toBe(new Set(ids).size)
    }
  })

  for (const c of authored) {
    describe(`Week ${c.week}`, () => {
      const w = c.week === 1 ? WEEKS[0] : draftWeekByNumber(c.week)!
      const objectiveIds = w.objectives.map((o) => o.id)

      it('passes every structural definition-of-done check', () => {
        // Week 1's workload now equals the syllabus estimate (8.0 h, lecture-first path; sign-off Mo4), so its workload
        // check runs like every other week's (the FD-29 exemption is removed)
        const failed = weekChecks(c, objectiveIds, RUBRIC_IDS, ACTIVITY_KEYS).filter((k) => !k.ok && k.id !== 'review')
        expect(failed.map((k) => `${k.id}: ${k.label}${k.detail ? ` (${k.detail})` : ''}`)).toEqual([])
      })

      it('cites only verified readings, inside their verified page ranges', () => {
        for (const cit of citationsOf(c)) {
          const r = getReading(cit.reading)
          expect(r.verified || r.declaredException, `${cit.reading}`).toBe(true)
          expect(citationInRange(cit), `${cit.reading} pages ${cit.pages}`).toBe(true)
        }
      })

      it('references only objectives of this week', () => {
        const used = [...c.quiz.map((q) => q.objective), ...c.lab.objectives, ...c.assignment.objectives, ...c.activities.flatMap((a) => a.objectives)]
        for (const o of used) expect(objectiveIds, o).toContain(o)
      })

      it('every SysML listing file exists and its intent matches the invalid_ naming rule', () => {
        for (const l of c.blocks.flatMap((b) => b.sysml ?? [])) {
          expect(sysmlSource(l.file), l.file).toBeDefined()
          expect(l.intent === 'intentionally-invalid', l.file).toBe((l.file.split('/').pop() ?? '').startsWith('invalid_'))
        }
      })

      it('a week marked independently reviewed passes every check, including review', () => {
        if (c.review.status === 'independently-reviewed') {
          const failed = weekChecks(c, objectiveIds, RUBRIC_IDS, ACTIVITY_KEYS).filter((k) => !k.ok)
          expect(failed.map((k) => k.id)).toEqual([])
        }
      })

      it('a week marked independently reviewed names its reviewer, date and report', () => {
        if (c.review.status === 'independently-reviewed') {
          expect(c.review.reviewer).toBeTruthy()
          expect(c.review.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
          expect(c.review.report).toBeTruthy()
        }
      })
    })
  }

  it('no module states the retired charger convention (DECISION_LOG W8 as revised: pad work + charge, two pads per charger)', () => {
    const retired = [/boarding stand/i, /off the charger/i, /positioning off it/i]
    for (const c of authored) {
      const text = JSON.stringify(c)
      for (const r of retired) expect(r.test(text), `Week ${c.week} matches ${r}`).toBe(false)
    }
  })

  it('every authored week belongs to the 14-week outline', () => {
    for (const c of authored) expect(WEEKS.map((w) => w.number)).toContain(c.week)
  })
})
