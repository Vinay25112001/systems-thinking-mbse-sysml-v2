// Week 6 timing, pacing and student-facing hygiene (the Week 1 template's rules, DECISION_LOG A21). Each session plans
// 68–70 minutes of content and keeps a 5–7 minute buffer; spoken notes (teach, worked solution, figure walk) stay at or
// below 130 words per minute on every slide and at or above 40 on every lecture slide; every lecture slide names a
// misconception; the worked examples get their minimum minutes; exercises precede their reveals and the exercise figures
// say they are blank; the week's workload is within the 8.0 h budget for a team of four, and a team of three carries the
// same load per person (A21 item 4). Slide faces and the lesson carry no internal IDs and no stale week numbers. Each
// rule is also shown able to fail.
import { describe, expect, it } from 'vitest'
import { allSlides, blockText, lectureMinutes, wordCount } from '../text'
import type { Lecture, Slide } from '../types'
import { WEEK6_SESSION1 } from './session1'
import { WEEK6_SESSION2 } from './session2'
import { LAB_TEAM_HOURS, READING_RATE_PAGES_PER_HOUR, REQUIRED_PAGES, THREE_PERSON, WEEK6_BUDGET_HOURS, WORKLOAD_ROWS, WORKLOAD_TOTAL, lessonWords, LESSON_WPM } from '../../week6Path'
import { LAB6_PERSON_HOURS } from './labBrief'

const MAX_WPM = 130
const MIN_WPM = 40
const spokenWords = (s: Slide) => [...s.notes.teach, ...(s.notes.workedSolution ?? []), s.notes.figure ?? ''].reduce((n, t) => n + wordCount(t), 0)
const tooDense = (l: Lecture) => allSlides(l).filter((s) => s.minutes > 0 && spokenWords(s) / s.minutes > MAX_WPM).map((s) => s.id)
const LECTURES = [WEEK6_SESSION1, WEEK6_SESSION2]
const slide = (l: Lecture, id: string) => allSlides(l).find((x) => x.id === id)!
const isActivity = (s: Slide) => s.layout === 'references' || s.id.includes('-lab-') || s.id.includes('warmup') || s.id.endsWith('-exit')

/** Text a student sees: slide faces (titles, subtitles, bodies, asides, captions, alt text) and the whole lesson. */
export function studentText(l: Lecture): string[] {
  const out: string[] = []
  for (const s of allSlides(l)) {
    out.push(s.title, s.subtitle ?? '', ...[...s.body, ...(s.aside ?? [])].flatMap(blockText))
    if (s.figure) out.push(s.figure.caption, s.figure.alt)
  }
  for (const sec of l.studentLesson) {
    out.push(sec.title)
    for (const b of sec.blocks) {
      if (b.kind === 'para' || b.kind === 'heading') out.push(b.text)
      else if (b.kind === 'figure') out.push('figure' in b ? `${b.figure.caption} ${b.figure.alt}` : '')
      else if (b.kind !== 'slide-ref') out.push(...blockText(b))
    }
  }
  return out
}
const INTERNAL = /\b(RB-\d|FD-\d|DECISION_LOG|A2[012]\b|S\d{1,2} p\.|S0\d\b|S1[0-3]\b|W6\.\d|P6-\d|P5-\d|outline §|new-pending-review|TODO|_source_cache)/
/** Stale schedule references (A19): requirements baseline Week 2, trade study Week 3, interfaces Week 5, roadmap Week 6,
 *  the package Week 7, the physical model Week 11, verification cases Week 12, analysis Week 13. */
const STALE = /\b(trade study in Week [^3]|requirements baseline in Week [^2]|interfaces (in|are defined in) Week [^5]|roadmap in Week [^6]|Week (?!6\b)\d+ (evolution )?roadmap|Week (?!11\b)\d+ physical model|Week (?!12\b)\d+ verification cases|Week (?!7\b)\d+ (engineering )?package|Week 14 evolution)/i

describe('Week 6 pacing', () => {
  for (const l of LECTURES) {
    it(`session ${l.session}: 68–70 min of content, a 5–7 min buffer, 75 in all`, () => {
      expect(lectureMinutes(l)).toBeGreaterThanOrEqual(68)
      expect(lectureMinutes(l)).toBeLessThanOrEqual(70)
      expect(l.bufferMinutes).toBeGreaterThanOrEqual(5)
      expect(l.bufferMinutes).toBeLessThanOrEqual(7)
      expect(lectureMinutes(l) + (l.bufferMinutes ?? 0)).toBe(75)
    })
    it(`session ${l.session}: spoken notes at most ${MAX_WPM} words per minute on every slide`, () => {
      expect(tooDense(l)).toEqual([])
    })
    it(`session ${l.session}: every lecture slide has substantial notes (at least ${MIN_WPM} spoken words per planned minute)`, () => {
      expect(allSlides(l).filter((s) => !isActivity(s) && spokenWords(s) / s.minutes < MIN_WPM).map((s) => `${s.id} ${spokenWords(s)}/${s.minutes}`)).toEqual([])
    })
    it(`session ${l.session}: every lecture slide names at least one misconception`, () => {
      expect(allSlides(l).filter((s) => !isActivity(s) && !(s.notes.misconceptions ?? []).length).map((s) => s.id)).toEqual([])
    })
    it(`session ${l.session}: ends with the generated references-and-credits slide`, () => {
      const last = allSlides(l).at(-1)!
      expect(last.layout).toBe('references')
      expect(allSlides(l).filter((s) => s.layout === 'references')).toHaveLength(1)
    })
    it(`session ${l.session}: no internal IDs or stale week numbers on slide faces or in the lesson`, () => {
      for (const t of studentText(l)) {
        expect(t, t.slice(0, 80)).not.toMatch(INTERNAL)
        expect(t, t.slice(0, 80)).not.toMatch(STALE)
      }
    })
  }
  it('the worked examples get their minutes; Session 2 has 47 min of lecture and 22 min of lab launch', () => {
    expect(slide(WEEK6_SESSION1, 'w6s1-gaps').minutes).toBeGreaterThanOrEqual(4)
    expect(slide(WEEK6_SESSION1, 'w6s1-technology-table').minutes).toBeGreaterThanOrEqual(3)
    expect(slide(WEEK6_SESSION2, 'w6s2-increment-1').minutes).toBeGreaterThanOrEqual(4)
    expect(slide(WEEK6_SESSION2, 'w6s2-increments-2-3').minutes).toBeGreaterThanOrEqual(5)
    const lab = WEEK6_SESSION2.sections.find((s) => s.id === 'w6s2-lab')!.slides.reduce((n, s) => n + s.minutes, 0)
    expect(lab).toBe(22)
    expect(lectureMinutes(WEEK6_SESSION2) - lab).toBe(47)
  })
  it('answers are not shown before students supply them: exercises precede their reveals, and the exercise figures say they are blank', () => {
    const s1 = allSlides(WEEK6_SESSION1).map((s) => s.id)
    expect(s1.indexOf('w6s1-technology-exercise')).toBe(s1.indexOf('w6s1-technology-table') - 1)
    expect(slide(WEEK6_SESSION1, 'w6s1-technology-exercise').figure!.alt).toMatch(/blank in every row/i)
    expect(slide(WEEK6_SESSION1, 'w6s1-think-pair').figure!.alt).toMatch(/unplaced/i)
    expect(slide(WEEK6_SESSION1, 'w6s1-gaps').figure!.alt).toMatch(/difference between them is not labeled/i)
    // the board's question (Session 1) is answered in Session 2, never in Session 1
    for (const t of studentText(WEEK6_SESSION1)) expect(t).not.toMatch(/resilience first/i)
    expect(studentText(WEEK6_SESSION2).join(' ')).toMatch(/resilience first/i)
    // the worked example poses the next question before advancing: the order question is in the baseline slide's notes
    expect(slide(WEEK6_SESSION2, 'w6s2-baseline').notes.teach.join(' ')).toMatch(/Before you advance/)
    expect(slide(WEEK6_SESSION2, 'w6s2-triggers-answer').notes.transition).toMatch(/Before advancing/)
  })
  it('negative direction: a slide over the density limit, an internal ID and a stale week number are caught', () => {
    const l = structuredClone(WEEK6_SESSION1)
    allSlides(l).find((x) => x.id === 'w6s1-gaps')!.minutes = 1
    expect(tooDense(l)).toContain('w6s1-gaps')
    expect('see RB-15.4 for scoring').toMatch(INTERNAL)
    expect('objective W6.2').toMatch(INTERNAL)
    expect('register addition P6-1').toMatch(INTERNAL)
    expect('decided under A21').toMatch(INTERNAL)
    expect('S13 p.529').toMatch(INTERNAL)
    expect('the Week 7 evolution roadmap').toMatch(STALE)
    expect('before Week 14 evolution planning').toMatch(STALE)
    expect('the Week 13 engineering package').toMatch(STALE)
    expect('the Week 6 evolution roadmap').not.toMatch(STALE)
  })
})

describe('Week 6 workload (8.0 h budget, proportional to team size)', () => {
  it('the stated rows sum to the total, and the total is within 0.3 h of the budget and never over it', () => {
    const sum = Math.round(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0) * 10) / 10
    expect(sum).toBe(WORKLOAD_TOTAL)
    expect(WORKLOAD_TOTAL).toBeLessThanOrEqual(WEEK6_BUDGET_HOURS)
    expect(WORKLOAD_TOTAL).toBeGreaterThanOrEqual(WEEK6_BUDGET_HOURS - 0.3)
  })
  it('the UNROUNDED total is within the budget too (Week 6 confirmation N4: row rounding must not hide an overrun)', () => {
    const fixed = WORKLOAD_ROWS.filter((r) => !['readings', 'lesson', 'lab'].includes(r.id)).reduce((a, r) => a + r.hours, 0)
    const unrounded = fixed + REQUIRED_PAGES / READING_RATE_PAGES_PER_HOUR + lessonWords() / LESSON_WPM / 60 + LAB_TEAM_HOURS / 4
    expect(unrounded).toBeLessThanOrEqual(WEEK6_BUDGET_HOURS)
    // negative direction: the pre-fix values (lab 9.6 person-hours, 6,658 lesson words) overran
    expect(fixed + 17 / 15 + 6658 / 9000 + 9.6 / 4).toBeGreaterThan(WEEK6_BUDGET_HOURS)
  })
  it('the lesson row is computed from the lesson’s own word count, and the lesson is a real lesson', () => {
    const row = WORKLOAD_ROWS.find((r) => r.id === 'lesson')!
    expect(row.hours).toBe(Math.round((lessonWords() / LESSON_WPM / 60) * 10) / 10)
    expect(lessonWords()).toBeGreaterThan(4000)
  })
  it('a team of three carries the same out-of-class load per person as a team of four (within 0.1 h)', () => {
    const four = WORKLOAD_ROWS.find((r) => r.id === 'lab')!.hours
    expect(Math.abs(THREE_PERSON.each - four)).toBeLessThanOrEqual(0.1 + 1e-9)
  })
  it('every method step of the lab has an hours row (the Week 4 review lesson), the baseline review included', () => {
    for (const id of ['gaps', 'technology', 'increments', 'unknowns', 'impact', 'review', 'integration']) expect(LAB6_PERSON_HOURS.some((t) => t.id === id && t.hours > 0), id).toBe(true)
  })
  it('negative direction: a budget overrun is caught', () => {
    const over = [...WORKLOAD_ROWS, { id: 'extra', activity: 'extra', hours: 1 }]
    expect(Math.round(over.reduce((a, r) => a + r.hours, 0) * 10) / 10).toBeGreaterThan(WEEK6_BUDGET_HOURS)
  })
})
