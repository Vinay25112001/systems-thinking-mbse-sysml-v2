import { describe, expect, it } from 'vitest'
import { sysmlSource } from '../../lib/sysml'
import { findToken } from '../week05/reading'
import { CLASSES2, LISTING2_FILE, TARGETS2, UNIT_EDITS, scoreAnswers, segmentLine2 } from './microlab'

const lines = (sysmlSource(LISTING2_FILE) ?? '').split(/\r?\n/)

describe('SysML micro-lab 2 (B6.5)', () => {
  it('the listing exists and every target token occurs as a whole word on its stated line', () => {
    expect(lines.length).toBeGreaterThan(50)
    for (const t of TARGETS2) expect(findToken(lines[t.line - 1] ?? '', t.token), `${t.id} ${t.token} @${t.line}`).toBeGreaterThanOrEqual(0)
  })

  it('the key matches the listing text: definitions use def, usages do not, specialization follows :>', () => {
    for (const t of TARGETS2) {
      const line = lines[t.line - 1]
      if (t.answer === 'definition') expect(line, t.id).toMatch(/\bdef\b/)
      if (t.answer === 'part-usage') expect(line, t.id).toMatch(/^\s*part\s(?!def)/)
      if (t.answer === 'attribute-usage') expect(line, t.id).toMatch(/^\s*attribute\s(?!def)/)
      if (t.answer === 'general') expect(line.slice(0, findToken(line, t.token)), t.id).toMatch(/:>\s*$/)
      if (t.answer === 'unit') expect(line, t.id).toMatch(/\[[^\]]*\]/)
    }
  })

  it('uses every class at least once and every class has a hint', () => {
    for (const c of CLASSES2) {
      expect(TARGETS2.some((t) => t.answer === c.id), c.id).toBe(true)
      expect(c.hint.length).toBeGreaterThan(20)
    }
  })

  it('segments a line with two targets in reading order (HighPowerCharger before Charger)', () => {
    const t = TARGETS2.filter((x) => x.line === 23)
    const segs = segmentLine2(lines[22], t).filter((s) => s.target)
    expect(segs.map((s) => s.target!.id)).toEqual(['m6', 'm7'])
  })

  it('scores answers; mutation: one wrong class or verdict lowers the score', () => {
    const allRight = Object.fromEntries(TARGETS2.map((t) => [t.id, t.answer]))
    expect(scoreAnswers(allRight, TARGETS2)).toMatchObject({ answered: 14, correct: 14 })
    expect(scoreAnswers({ ...allRight, m7: 'definition' as const }, TARGETS2).correct).toBe(13)
    const verdicts = Object.fromEntries(UNIT_EDITS.map((u) => [u.id, u.answer]))
    expect(scoreAnswers(verdicts, UNIT_EDITS).correct).toBe(UNIT_EDITS.length)
    expect(scoreAnswers({ ...verdicts, u2: 'ok' as const }, UNIT_EDITS).perItem.u2).toBe(false)
  })

  it('unit edits target attributes that exist in the listing, and the wrong-kind cases are really mismatched', () => {
    for (const u of UNIT_EDITS) {
      const attr = /redefines (\w+)/.exec(u.binding)![1]
      expect(lines.some((l) => new RegExp(`attribute ${attr}\\s*:`).test(l)), attr).toBe(true)
    }
    const kinds = UNIT_EDITS.map((u) => u.answer)
    expect(kinds).toContain('wrong-kind')
    expect(kinds).toContain('not-a-quantity')
    // 160 kWh = 576 MJ (1 kWh = 3.6 MJ)
    expect(160 * 3.6).toBeCloseTo(576, 10)
  })
})
