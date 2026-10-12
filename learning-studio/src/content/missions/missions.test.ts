// Content checks for every converted week (WORKBENCH_SPEC §3): objectives exist in course.ts, every readMore resolves
// to a lesson block, every view is registered, mission minutes stay inside the reviewed workload line they draw from,
// and the week's reviewed workload total is unchanged.
import { describe, expect, it } from 'vitest'
import { weekByNumber } from '../course'
import { WORKLOAD_TARGET } from '../schema'
import { WEEK_CONTENT } from '../weeks'
import { VIEW_IDS } from '../../workbench/views'
import { WORKBENCH_WEEKS } from '.'

const ORDER = ['try', 'worked', 'guided', 'own', 'recall', 'review']

describe('converted weeks', () => {
  it('Week 1 is converted', () => expect(WORKBENCH_WEEKS[1]).toBeDefined())

  for (const wk of Object.values(WORKBENCH_WEEKS)) {
    describe(`Week ${wk.week} missions`, () => {
      const course = weekByNumber(wk.week)!
      const content = WEEK_CONTENT[wk.week]
      const blockIds = new Set(content.blocks.map((b) => b.id))
      const objectiveIds = new Set(course.objectives.map((o) => o.id))

      it('every mission objective exists in course.ts for this week', () => {
        for (const m of wk.missions) {
          expect(m.objectives.length, m.id).toBeGreaterThan(0)
          for (const o of m.objectives) expect(objectiveIds.has(o), `${m.id}: ${o}`).toBe(true)
        }
      })

      it('every mission objective of the week is practised by at least one mission', () => {
        const practised = new Set(wk.missions.flatMap((m) => m.objectives))
        expect([...objectiveIds].filter((o) => !practised.has(o))).toEqual([])
      })

      it('every step links readMore to a lesson block of this week', () => {
        for (const m of wk.missions) for (const s of m.steps) expect(blockIds.has(s.readMore), `${m.id}/${s.id} → ${s.readMore}`).toBe(true)
      })

      it('every view is registered, and every step view is one of the week’s tabs', () => {
        for (const v of wk.views) expect(VIEW_IDS.has(v), v).toBe(true)
        for (const m of wk.missions) for (const s of m.steps) if (s.view) expect(wk.views, `${m.id}/${s.id}`).toContain(s.view)
      })

      it('ids are unique and every mission belongs to this week', () => {
        const ids = wk.missions.map((m) => m.id)
        expect(new Set(ids).size).toBe(ids.length)
        for (const m of wk.missions) {
          expect(m.week).toBe(wk.week)
          const steps = m.steps.map((s) => s.id)
          expect(new Set(steps).size, m.id).toBe(steps.length)
          const keys = m.steps.flatMap((s) => (s.input ? [s.input.key] : []))
          expect(new Set(keys).size, m.id).toBe(keys.length)
        }
      })

      it('missions follow the mission loop order (try → worked → guided → own → recall)', () => {
        const idx = wk.missions.map((m) => ORDER.indexOf(m.kind))
        expect(idx).toEqual([...idx].sort((a, b) => a - b))
        expect(wk.missions[0].kind).toBe('try')
      })

      it('mission minutes fit inside the reviewed workload line each draws from', () => {
        const byLine = new Map<string, number>()
        for (const m of wk.missions) {
          const line = content.workload.filter((w) => w.activity.startsWith(m.workloadLine))
          expect(line.length, `${m.id}: workload line "${m.workloadLine}"`).toBe(1)
          byLine.set(line[0].activity, (byLine.get(line[0].activity) ?? 0) + m.minutes)
        }
        for (const [activity, minutes] of byLine) {
          const hours = content.workload.find((w) => w.activity === activity)!.hours
          expect(minutes, `${activity}: ${minutes} min of missions vs ${hours} h reviewed`).toBeLessThanOrEqual(hours * 60)
        }
      })

      it('the reviewed workload total is unchanged by the conversion', () => {
        const total = content.workload.reduce((a, w) => a + w.hours, 0)
        expect(Math.abs(total - WORKLOAD_TARGET[wk.week])).toBeLessThan(0.01)
        expect(wk.missions.reduce((a, m) => a + m.minutes, 0)).toBeLessThanOrEqual(total * 60)
      })

      it('every mission has a goal, and a worked mission explains every step', () => {
        for (const m of wk.missions) {
          expect(m.goal.length, m.id).toBeGreaterThan(20)
          if (m.kind === 'worked') for (const s of m.steps) expect(s.worked?.length ?? 0, `${m.id}/${s.id}`).toBeGreaterThan(20)
          for (const s of m.steps) expect(s.instruction.length, `${m.id}/${s.id}`).toBeGreaterThan(10)
        }
      })

      it('the recall mission is the week’s reviewed quiz, not new items', () => {
        const recall = wk.missions.filter((m) => m.kind === 'recall')
        expect(recall.length).toBe(1)
        expect(content.quiz.length).toBeGreaterThanOrEqual(10)
      })
    })
  }
})
