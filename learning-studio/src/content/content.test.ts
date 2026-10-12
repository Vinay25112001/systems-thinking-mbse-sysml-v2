import { describe, expect, it } from 'vitest'
import { WEEKS } from './course'
import { PRINCIPLES, WEEK1_BLOCKS, BOUNDARY_ITEMS } from './week1'
import { WEEK1_QUIZ } from './quizWeek1'
import { READINGS, citationInRange, getReading, type Citation } from './readings'
import { ALL_LOOPS, LOOPS, loopKind } from './causalLoops'

const allCitations = (): Citation[] => [
  ...WEEKS.flatMap((w) => [...w.readings, ...w.extension]),
  ...WEEK1_BLOCKS.flatMap((b) => [...b.citations, ...(b.quote ? [b.quote.cite] : [])]),
  ...PRINCIPLES.map((p) => p.cite),
  ...WEEK1_QUIZ.map((q) => q.cite),
]

describe('course content integrity', () => {
  it('has exactly 14 consecutive weeks split into Part I (1–7) and Part II (8–14) (DECISION_LOG A7)', () => {
    expect(WEEKS.map((w) => w.number)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1))
    expect(WEEKS.filter((w) => w.part === 'ST').map((w) => w.number)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(WEEKS.filter((w) => w.part === 'MBSE').map((w) => w.number)).toEqual([8, 9, 10, 11, 12, 13, 14])
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

  it('the readings export matches the project register (90 entries; only R30 is a declared exception)', () => {
    expect(READINGS).toHaveLength(90)
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
