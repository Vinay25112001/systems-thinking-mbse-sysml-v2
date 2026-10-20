// Lecture pipeline: every registered lecture validates clean, and every validator rule is proved able to fail (a
// mutated copy of the fixture must raise exactly the rule's issue code), so a clean run is not a vacuous pass.
import { describe, expect, it } from 'vitest'
import { FIGURE_REGISTRY, isRegisteredFigure } from '../../components/figures/registry'
import { DEMO_LECTURE } from './fixture/demo'
import { getLecture, LECTURES, lecturesOfWeek, weekLesson } from './index'
import { lessonMarkdown, notesMarkdown } from './markdown'
import { formatReference, lectureCredits, lectureReferences } from './references'
import { allSlides, lectureMinutes, lectureStem, parseInline, slideBodyWords, wordCount } from './text'
import type { Lecture, Slide } from './types'
import { validateLecture, validateLectures, type IssueCode } from './validate'
import { WEEK01_SESSION1, WEEK1_S1_REVIEW } from './week01/session1'

const clone = (): Lecture => structuredClone(DEMO_LECTURE)
const slide = (l: Lecture, id: string): Slide => allSlides(l).find((s) => s.id === id)!
const codes = (l: Lecture) => validateLecture(l).map((i) => i.code)

function expectOnly(l: Lecture, code: IssueCode) {
  const c = codes(l)
  expect(c, JSON.stringify(validateLecture(l), null, 1)).toContain(code)
  expect(new Set(c)).toEqual(new Set([code]))
}

describe('registered lectures (positive direction)', () => {
  it('every registered lecture validates with no issues', () => {
    expect(validateLectures(LECTURES)).toEqual([])
  })
  it('the fixture is marked as a fixture, has 4–5 slides and fits a 75-minute session', () => {
    expect(DEMO_LECTURE.fixture).toBe(true)
    expect(allSlides(DEMO_LECTURE).length).toBeGreaterThanOrEqual(4)
    expect(allSlides(DEMO_LECTURE).length).toBeLessThanOrEqual(5)
    expect(lectureMinutes(DEMO_LECTURE)).toBeLessThanOrEqual(75)
  })
  it('every slide stays inside the word budget and has non-empty notes', () => {
    for (const s of allSlides(DEMO_LECTURE)) {
      expect(slideBodyWords(s), s.id).toBeLessThanOrEqual(60)
      expect(s.notes.teach.length, s.id).toBeGreaterThan(0)
    }
  })
  it('lookups by week and session', () => {
    expect(LECTURES).not.toContain(DEMO_LECTURE)
    expect(getLecture(1, 1)).toBe(WEEK01_SESSION1)
    expect(lecturesOfWeek(1)[0]).toBe(WEEK01_SESSION1)
    const s1Lesson = WEEK01_SESSION1.studentLesson.map((s) => s.id)
    expect(weekLesson(1).map((x) => x.section.id).slice(0, s1Lesson.length)).toEqual(s1Lesson)
    expect(lectureStem(DEMO_LECTURE)).toBe('week01-session1')
  })
  it('Week 1 Session 1 is course content: 25 slides (24 + references), 69 minutes plus a 6-minute buffer, pending review', () => {
    expect(WEEK01_SESSION1.fixture).toBeUndefined()
    expect(allSlides(WEEK01_SESSION1).length).toBe(25)
    expect(lectureMinutes(WEEK01_SESSION1)).toBe(69)
    expect(WEEK01_SESSION1.bufferMinutes).toBe(6)
    expect(WEEK1_S1_REVIEW).toBe('new-pending-review')
    for (const s of allSlides(WEEK01_SESSION1)) if (s.figure) expect(isRegisteredFigure(s.figure.id), s.id).toBe(true)
  })
  it('every figure the fixture uses is registered and renders a function', () => {
    for (const s of allSlides(DEMO_LECTURE)) if (s.figure) expect(isRegisteredFigure(s.figure.id)).toBe(true)
    for (const [id, f] of Object.entries(FIGURE_REGISTRY)) expect(typeof f.render, id).toBe('function')
    expect(isRegisteredFigure('toString')).toBe(false)
  })
})

describe('validator rules (negative direction: each rule can fail)', () => {
  it('a references slide that carries its own body, and a non-references slide with zero minutes', () => {
    const l = clone()
    const s = l.sections[0].slides[0]
    l.sections[2].slides.push({ ...structuredClone(s), id: 'fx-refs', layout: 'references', minutes: 0, body: [{ kind: 'bullets', items: ['hand-typed reference'] }], figure: undefined, aside: undefined })
    expectOnly(l, 'layout-mismatch')
    const z = clone()
    z.sections[2].slides.push({ ...structuredClone(s), id: 'fx-refs', layout: 'references', minutes: 0, body: [], figure: undefined, aside: undefined })
    expect(codes(z)).toEqual([])
    z.sections[2].slides[z.sections[2].slides.length - 1].layout = 'bullets'
    expect(codes(z)).toContain('minutes-invalid')
  })
  it('slides plus the buffer may not exceed the session', () => {
    const l = clone()
    l.bufferMinutes = 75 - lectureMinutes(l) + 1
    expectOnly(l, 'minutes-over')
    l.bufferMinutes = 75 - lectureMinutes(l)
    expect(codes(l)).toEqual([])
  })
  it('duplicate slide id, and a section id that collides with a slide id', () => {
    const l = clone()
    l.sections[2].slides[0].id = 'fx-title'
    expectOnly(l, 'duplicate-id')
    const s = clone()
    s.sections[2].id = 'fx-title'
    expectOnly(s, 'duplicate-id')
  })
  it('a lesson section id that collides with a slide id', () => {
    const l = clone()
    l.studentLesson[0].id = 'fx-title'
    expectOnly(l, 'duplicate-id')
  })
  it('malformed id', () => {
    const l = clone()
    l.sections[0].id = 'Opening Section'
    expectOnly(l, 'bad-id')
  })
  it('unregistered figure id on a slide and in a lesson', () => {
    const l = clone()
    slide(l, 'fx-context-figure').figure!.id = 'no-such-figure'
    expectOnly(l, 'unknown-figure')
    const m = clone()
    m.studentLesson[1].blocks[1] = { kind: 'figure', figure: { id: 'missing', caption: 'c', alt: 'a' } }
    expectOnly(m, 'unknown-figure')
  })
  it('figure without alt text', () => {
    const l = clone()
    slide(l, 'fx-context-figure').figure!.alt = ' '
    expectOnly(l, 'figure-text-missing')
  })
  it('citation not in the verified register (slide source, definition source, lesson source)', () => {
    const l = clone()
    slide(l, 'fx-title').sources = [{ reading: 'R999' }]
    expectOnly(l, 'unknown-citation')
    const d = clone()
    const def = slide(d, 'fx-system-definition').body[0]
    if (def.kind === 'definition') def.source = { reading: 'NOPE', pages: '1' }
    expectOnly(d, 'unknown-citation')
    const s = clone()
    s.studentLesson[2].sources = [{ reading: 'X1' }]
    expectOnly(s, 'unknown-citation')
  })
  it('cited pages outside the register range', () => {
    const l = clone()
    slide(l, 'fx-context-figure').sources = [{ reading: 'R02', pages: '263' }]
    expectOnly(l, 'citation-out-of-range')
    const m = clone()
    slide(m, 'fx-register-table').sources = [{ reading: 'R39a', pages: '1631–1640' }]
    expectOnly(m, 'citation-out-of-range')
  })
  it('a session over 75 minutes', () => {
    const l = clone()
    slide(l, 'fx-charger-throughput').minutes = 48
    expect(lectureMinutes(l)).toBe(76)
    expectOnly(l, 'minutes-over')
    slide(l, 'fx-charger-throughput').minutes = 47
    expect(codes(l)).toEqual([])
  })
  it('zero or negative minutes', () => {
    const l = clone()
    slide(l, 'fx-title').minutes = 0
    expectOnly(l, 'minutes-invalid')
  })
  it('empty faculty notes (teach, why, transition, timing)', () => {
    for (const field of ['why', 'transition', 'timing'] as const) {
      const l = clone()
      slide(l, 'fx-register-table').notes[field] = ''
      expectOnly(l, 'notes-empty')
    }
    const t = clone()
    slide(t, 'fx-register-table').notes.teach = ['  ']
    expectOnly(t, 'notes-empty')
  })
  it('a figure slide without figure notes; a worked example without a solution', () => {
    const l = clone()
    delete slide(l, 'fx-context-figure').notes.figure
    expectOnly(l, 'notes-figure-missing')
    const w = clone()
    slide(w, 'fx-charger-throughput').notes.workedSolution = []
    expectOnly(w, 'notes-solution-missing')
  })
  it('a slide body over the 60-word budget (and exactly 60 passes)', () => {
    const l = clone()
    const s = slide(l, 'fx-system-definition')
    const used = slideBodyWords(s)
    s.body.push({ kind: 'bullets', items: [Array.from({ length: 60 - used }, (_, i) => `w${i}`).join(' ')] })
    expect(slideBodyWords(s)).toBe(60)
    expect(codes(l)).toEqual([])
    ;(s.body[2] as { kind: 'bullets'; items: string[] }).items.push('one')
    expectOnly(l, 'word-budget')
  })
  it('layout without its required part', () => {
    const l = clone()
    delete slide(l, 'fx-context-figure').figure
    delete slide(l, 'fx-context-figure').notes.figure
    l.studentLesson[1].blocks.splice(1, 1)
    expectOnly(l, 'layout-mismatch')
    const t = clone()
    slide(t, 'fx-register-table').body = [{ kind: 'bullets', items: ['a'] }]
    expectOnly(t, 'layout-mismatch')
    const c = clone()
    slide(c, 'fx-title').layout = 'two-column'
    expectOnly(c, 'layout-mismatch')
  })
  it('table rows that do not match the header', () => {
    const l = clone()
    const t = slide(l, 'fx-register-table').body[0]
    if (t.kind === 'table') t.rows[0].pop()
    expectOnly(l, 'table-shape')
  })
  it('bullets nested beyond two levels (content loaded from outside the type system)', () => {
    const l = clone()
    const b = slide(l, 'fx-context-figure').body[0]
    if (b.kind === 'bullets') (b.items[2] as unknown as { sub: unknown[] }).sub.push({ text: 'third level', sub: [] })
    expect(codes(l)).toContain('bullet-depth')
  })
  it('lesson references to a missing slide, or to a slide without a figure', () => {
    const l = clone()
    l.studentLesson[0].blocks[3] = { kind: 'slide-ref', slide: 'no-slide' }
    expectOnly(l, 'unknown-slide-ref')
    const f = clone()
    f.studentLesson[1].blocks[1] = { kind: 'figure', slide: 'fx-register-table' }
    expectOnly(f, 'slide-has-no-figure')
  })
  it('missing purpose or title', () => {
    const l = clone()
    slide(l, 'fx-title').purpose = ''
    expectOnly(l, 'empty-field')
  })
  it('two lectures for one session, and an id reused across a week', () => {
    expect(validateLectures([DEMO_LECTURE, DEMO_LECTURE]).map((i) => i.code)).toContain('duplicate-session')
    const s2 = clone()
    s2.session = 2
    expect(validateLectures([DEMO_LECTURE, s2]).filter((i) => i.code === 'duplicate-id').length).toBeGreaterThan(0)
  })
})

describe('text helpers and Markdown exports', () => {
  it('inline markup and word counts', () => {
    expect(parseInline('a **b** *c* d')).toEqual([{ text: 'a ' }, { text: 'b', bold: true }, { text: ' ' }, { text: 'c', em: true }, { text: ' d' }])
    expect(wordCount('N = T ÷ b — 960 **min**')).toBe(5)
  })
  it('the faculty notes carry every slide, its purpose, timing and transition, and the fixture banner', () => {
    const md = notesMarkdown(DEMO_LECTURE)
    expect(md).toContain('FIXTURE — not course content')
    allSlides(DEMO_LECTURE).forEach((s, i) => {
      expect(md).toContain(`### Slide ${i + 1}. ${s.title}`)
      expect(md).toContain(s.purpose)
      expect(md).toContain(s.notes.transition)
    })
    expect(md).toContain('**Worked solution**')
    expect(md).toContain('R38 · SEBoK')
    expect(md).toContain('## Timing plan')
    expect(md).toContain('## References and credits')
  })
  it('the generated reference list covers every citation, merges pages per entry, and carries the SEBoK attribution', () => {
    const refs = lectureReferences([WEEK01_SESSION1])
    const ids = refs.map((e) => e.reading.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const s of allSlides(WEEK01_SESSION1)) for (const c of s.sources) expect(ids, `${s.id} ${c.reading}`).toContain(c.reading)
    expect(refs.find((e) => e.reading.id === 'R11')!.pages).toMatch(/549/)
    expect(formatReference(refs[0])).toMatch(/^R\d+[a-z]? · /)
    const credits = lectureCredits([WEEK01_SESSION1]).join(' ')
    expect(credits).toContain('This material is used under a Creative Commons Attribution-NonCommercial ShareAlike 3.0 Unported License from The Trustees of the Stevens Institute of Technology.')
    expect(credits).toContain('MITRE')
  })
  it('the handout embeds figure images when the export passes a figure path', () => {
    const md = lessonMarkdown(1, [DEMO_LECTURE], (id) => `.figure-cache/${id}.png`)
    expect(md).toMatch(/!\[[^\]]*\]\(\.figure-cache\/[a-z0-9-]+\.png\)/)
  })
  it('the student handout carries every lesson section, the shared figure caption and formatted citations', () => {
    const md = lessonMarkdown(1, [DEMO_LECTURE])
    for (const s of DEMO_LECTURE.studentLesson) expect(md).toContain(`## ${s.title}`)
    expect(md).toContain(slide(DEMO_LECTURE, 'fx-context-figure').figure!.caption)
    expect(md).toContain('R02 · SEBoK')
    expect(md).not.toContain('undefined')
  })
})
