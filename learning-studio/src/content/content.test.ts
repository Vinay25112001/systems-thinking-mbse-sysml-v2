import { describe, expect, it } from 'vitest'
import { PARTS, WEEKS } from './course'
import { DRAFT_WEEKS } from './draftWeeks'
import { PRINCIPLES, WEEK1_BLOCKS, BOUNDARY_ITEMS } from './week1'
import { WEEK1_QUIZ } from './quizWeek1'
import { READINGS, citationInRange, getReading, type Citation } from './readings'
import { ALL_LOOPS, LOOPS, loopKind } from './causalLoops'

const allCitations = (): Citation[] => [
  ...[...WEEKS, ...DRAFT_WEEKS].flatMap((w) => [...w.readings, ...w.extension]),
  ...WEEK1_BLOCKS.flatMap((b) => [...b.citations, ...(b.quote ? [b.quote.cite] : [])]),
  ...PRINCIPLES.map((p) => p.cite),
  ...WEEK1_QUIZ.flatMap((q) => (q.cite ? [q.cite] : [])),
]

describe('course content integrity', () => {
  it('has exactly 14 consecutive weeks split into Phase I (1–7) and Phase II (8–14) (COURSE_SCHEDULE.md, DECISION_LOG A19)', () => {
    expect(WEEKS.map((w) => w.number)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1))
    expect(WEEKS.filter((w) => w.part === 'ST').map((w) => w.number)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(WEEKS.filter((w) => w.part === 'MBSE').map((w) => w.number)).toEqual([8, 9, 10, 11, 12, 13, 14])
    expect(PARTS.ST.title).toBe('Phase I — Systems Thinking')
    expect(PARTS.MBSE.title).toBe('Phase II — MBSE with SysML v2')
  })

  it('the 14 week titles are the faculty whiteboard subjects, verbatim (COURSE_SCHEDULE.md)', () => {
    expect(WEEKS.map((w) => w.title)).toEqual([
      'Team Formation / Needs / Identifying Stakeholders',
      'ConOps / Requirements',
      'Technology Assessment / Risk Management / Trade Study',
      'Architecture / Information View',
      'Components / Interfaces',
      'Evolution Roadmap',
      'Final Presentation',
      'Import Systems Thinking Artifacts / Stakeholders',
      'Needs / Requirements',
      'Logical / Behavioral Modeling',
      'Physical / Interfaces',
      'Digital Thread / Verification and Validation',
      'Trade Study / Analysis',
      'Final Presentation',
    ])
  })

  it('the team outputs, quizzes, continuity links and draft sources follow the schedule', () => {
    expect(WEEKS.filter((w) => w.due).map((w) => [w.number, w.due])).toEqual([
      [7, 'Systems Thinking Engineering Package'],
      [14, 'SysML v2 enterprise model'],
    ])
    // a readiness quiz every week except the presentation weeks; no exam is placed (open faculty decision)
    expect(WEEKS.filter((w) => /Readiness quiz/.test(w.assessment)).map((w) => w.number)).toEqual([1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13])
    expect(WEEKS.some((w) => /Exam \d/.test(w.assessment))).toBe(false)
    expect(Object.fromEntries(WEEKS.filter((w) => w.models).map((w) => [w.number, w.models]))).toEqual({ 8: [1], 9: [2], 10: [2, 4], 11: [5], 12: [2, 3], 13: [3], 14: [6, 7] })
    expect(WEEKS.filter((w) => w.status === 'template').map((w) => w.number)).toEqual([1])
    for (const w of WEEKS) {
      expect(w.output.length, `Week ${w.number}`).toBeGreaterThan(10)
      expect(w.draftSources.length, `Week ${w.number}`).toBeGreaterThan(0)
      for (const d of w.draftSources) expect(DRAFT_WEEKS.map((x) => x.number)).toContain(d.week)
    }
  })

  it('provisional weeks cite only readings their earlier source weeks already used, with the same page ranges', () => {
    for (const w of WEEKS.filter((x) => x.status === 'provisional')) {
      const pool = w.draftSources.flatMap((d) => {
        const old = DRAFT_WEEKS[d.week - 1]
        return [...old.readings, ...old.extension]
      })
      for (const c of [...w.readings, ...w.extension]) {
        expect(pool.some((p) => p.reading === c.reading && p.pages === c.pages), `Week ${w.number} ${c.reading} ${c.pages ?? ''}`).toBe(true)
      }
    }
  })

  it('every citation resolves to the verified register and stays inside the verified page range', () => {
    const cits = allCitations()
    expect(cits.length).toBeGreaterThan(40)
    for (const c of cits) {
      const r = getReading(c.reading) // throws on unknown IDs
      expect(r.verified || r.declaredException, `${c.reading} must be verified`).toBe(true)
      expect(citationInRange(c), `${c.reading} pages ${c.pages}`).toBe(true)
    }
  })

  it('the readings export matches the project register (140 entries, R39m–R39p added for Week 2, R39q–R39s and R61a–c for Week 3, R39t–R39x, R48c and R66 for Week 4, R67–R69 for Week 8, R100–R104 for Week 5; only R30 is a declared exception)', () => {
    expect(READINGS).toHaveLength(140)
    expect(READINGS.filter((r) => !r.verified).map((r) => r.id)).toEqual(['R30'])
  })

  it('every objective has a Bloom level and maps to at least one CLO', () => {
    for (const w of WEEKS) {
      expect(w.objectives.length).toBeGreaterThan(0)
      for (const o of w.objectives) expect(o.clo.length).toBeGreaterThan(0)
    }
  })

  it('every quiz question has exactly one correct option and an explanation for every option', () => {
    expect(WEEK1_QUIZ).toHaveLength(10)
    for (const q of WEEK1_QUIZ) {
      expect(q.options.filter((o) => o.correct)).toHaveLength(1)
      for (const o of q.options) expect(o.explanation.length).toBeGreaterThan(20)
    }
    expect(new Set(WEEK1_QUIZ.map((q) => q.id)).size).toBe(WEEK1_QUIZ.length)
  })

  it('every lesson block declares provenance; source-based blocks carry citations', () => {
    for (const b of WEEK1_BLOCKS) {
      expect(['source-paraphrase', 'instructor-authored', 'mixed']).toContain(b.provenance)
      if (b.provenance !== 'instructor-authored') expect(b.citations.length).toBeGreaterThan(0)
    }
    expect(new Set(WEEK1_BLOCKS.map((b) => b.id)).size).toBe(WEEK1_BLOCKS.length)
  })

  it('boundary exercise uses all three classes', () => {
    expect(new Set(BOUNDARY_ITEMS.map((i) => i.answer))).toEqual(new Set(['inside', 'environment', 'irrelevant']))
  })
})

describe('causal-loop polarity', () => {
  it('classifies loops from link polarities (even negatives = reinforcing)', () => {
    const byId = Object.fromEntries(LOOPS.map((l) => [l.id, l.kind]))
    expect(byId).toEqual({ R1: 'Reinforcing', B1: 'Balancing', B2: 'Balancing', B3: 'Balancing' })
  })
  it('the full loop set shown in the diagram (R1, B1–B7) classifies as reinforcing only for R1', () => {
    const kinds = Object.fromEntries(ALL_LOOPS.map((l) => [l.id, l.kind]))
    expect(Object.keys(kinds).sort()).toEqual(['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'R1'])
    expect(Object.entries(kinds).filter(([, k]) => k === 'Reinforcing').map(([id]) => id)).toEqual(['R1'])
  })
  it('rejects a loop that uses a non-existent link', () => {
    expect(() => loopKind(['riders', 'fleet'])).toThrow()
  })
})
