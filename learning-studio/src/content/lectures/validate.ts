// Lecture validator. Runs in the unit tests (every registered lecture must validate clean), in the export script
// (scripts/build-lectures.mjs refuses to write a deck for an invalid lecture) and in the viewer's instructor notes.
// Rules: docs/lectures/PIPELINE.md, "Validator rules".
import { isRegisteredFigure } from '../../components/figures/registry'
import { citationInRange, getReading, type Citation } from '../readings'
import { allSlides, lectureMinutes, slideBodyWords } from './text'
import { SESSION_MINUTES, SLIDE_WORD_BUDGET, type Block, type FigureRef, type Lecture, type Slide, type SlideLayout } from './types'

export type IssueCode =
  | 'duplicate-id'
  | 'bad-id'
  | 'unknown-figure'
  | 'figure-text-missing'
  | 'unknown-citation'
  | 'citation-out-of-range'
  | 'minutes-invalid'
  | 'minutes-over'
  | 'notes-empty'
  | 'notes-figure-missing'
  | 'notes-solution-missing'
  | 'word-budget'
  | 'layout-mismatch'
  | 'empty-field'
  | 'bullet-depth'
  | 'table-shape'
  | 'unknown-slide-ref'
  | 'slide-has-no-figure'
  | 'duplicate-session'

export type Issue = { code: IssueCode; where: string; message: string }

export type ValidateOptions = {
  isFigure?: (id: string) => boolean
  sessionMinutes?: number
  wordBudget?: number
}

const ID = /^[a-z0-9][a-z0-9-]*$/
const blank = (s: string | undefined) => !s || !s.trim()

/** Layout → the block kinds or parts the slide must carry. */
const NEEDS: Partial<Record<SlideLayout, { figure?: boolean; block?: Block['kind']; aside?: boolean }>> = {
  figure: { figure: true },
  'figure-bullets': { figure: true, block: 'bullets' },
  bullets: { block: 'bullets' },
  summary: { block: 'bullets' },
  table: { block: 'table' },
  definition: { block: 'definition' },
  equation: { block: 'equation' },
  'worked-example': { block: 'steps' },
  'two-column': { aside: true },
}

export function validateLecture(l: Lecture, opts: ValidateOptions = {}): Issue[] {
  const isFigure = opts.isFigure ?? isRegisteredFigure
  const budget = opts.wordBudget ?? SLIDE_WORD_BUDGET
  const maxMinutes = opts.sessionMinutes ?? SESSION_MINUTES
  const issues: Issue[] = []
  const add = (code: IssueCode, where: string, message: string) => issues.push({ code, where, message })

  const seen = new Map<string, string>()
  const claim = (id: string, where: string) => {
    if (!ID.test(id)) add('bad-id', where, `id "${id}" must be lower-case letters, digits and hyphens`)
    const prior = seen.get(id)
    if (prior) add('duplicate-id', where, `id "${id}" is already used by ${prior}`)
    else seen.set(id, where)
  }

  const cite = (c: Citation, where: string) => {
    try {
      getReading(c.reading)
    } catch {
      add('unknown-citation', where, `citation ${c.reading} is not in the verified reading register`)
      return
    }
    if (!citationInRange(c)) add('citation-out-of-range', where, `${c.reading} pages ${c.pages} lie outside the register's verified range`)
  }

  const figure = (f: FigureRef, where: string) => {
    if (!isFigure(f.id)) add('unknown-figure', where, `figure "${f.id}" is not in src/components/figures/registry.ts`)
    if (blank(f.caption) || blank(f.alt)) add('figure-text-missing', where, `figure "${f.id}" needs a caption and alt text`)
  }

  const block = (b: Block, where: string) => {
    if (b.kind === 'definition') {
      if (blank(b.term) || blank(b.text)) add('empty-field', where, 'definition needs a term and text')
      cite(b.source, `${where} definition`)
    }
    if (b.kind === 'bullets') {
      if (b.items.length === 0) add('empty-field', where, 'bullets block is empty')
      for (const it of b.items) {
        if (typeof it === 'string') continue
        // the type allows two levels; content loaded from elsewhere could still nest deeper
        if (!Array.isArray(it.sub) || it.sub.some((s) => typeof s !== 'string')) add('bullet-depth', where, `bullet "${it.text}" nests more than two levels`)
      }
    }
    if (b.kind === 'table') {
      if (b.header.length === 0 || b.rows.length === 0) add('table-shape', where, 'table needs a header and at least one row')
      b.rows.forEach((r, i) => r.length !== b.header.length && add('table-shape', where, `table row ${i + 1} has ${r.length} cells, header has ${b.header.length}`))
    }
    if (b.kind === 'equation' && (blank(b.display) || blank(b.speech))) add('empty-field', where, 'equation needs display text and a spoken form')
  }

  if (blank(l.title)) add('empty-field', 'lecture', 'lecture needs a title')
  if (l.sections.length === 0) add('empty-field', 'lecture', 'lecture has no sections')

  for (const sec of l.sections) {
    claim(sec.id, `section ${sec.id}`)
    if (blank(sec.title)) add('empty-field', `section ${sec.id}`, 'section needs a title')
    if (sec.slides.length === 0) add('empty-field', `section ${sec.id}`, 'section has no slides')
  }

  for (const s of allSlides(l)) {
    const at = `slide ${s.id}`
    claim(s.id, at)
    if (blank(s.title)) add('empty-field', at, 'slide needs a title')
    if (blank(s.purpose)) add('empty-field', at, 'slide needs an instructor-facing purpose')
    // the generated references slide is shown during the close and may take 0 minutes; every other slide needs time
    const minOk = s.layout === 'references' ? s.minutes >= 0 : s.minutes > 0
    if (!minOk || !Number.isFinite(s.minutes)) add('minutes-invalid', at, `minutes must be a positive number (got ${s.minutes})`)
    if (s.layout === 'references' && (s.body.length > 0 || s.aside?.length || s.figure)) add('layout-mismatch', at, 'a references slide is generated: it carries no body, aside or figure')
    slideNotes(s, at, add)
    const need = NEEDS[s.layout]
    if (need?.figure && !s.figure) add('layout-mismatch', at, `layout "${s.layout}" needs a figure`)
    if (need?.block && ![...s.body, ...(s.aside ?? [])].some((b) => b.kind === need.block)) add('layout-mismatch', at, `layout "${s.layout}" needs a ${need.block} block`)
    if (need?.aside && !s.aside?.length) add('layout-mismatch', at, 'layout "two-column" needs an aside (right column)')
    if (s.layout === 'title' && s.figure) add('layout-mismatch', at, 'title slides carry no figure')
    if (s.figure) figure(s.figure, at)
    s.body.forEach((b, i) => block(b, `${at} body[${i}]`))
    s.aside?.forEach((b, i) => block(b, `${at} aside[${i}]`))
    s.sources.forEach((c) => cite(c, at))
    const words = slideBodyWords(s)
    if (words > budget) add('word-budget', at, `slide body has ${words} words; the budget is ${budget} (move detail to the notes or the lesson)`)
  }

  const total = lectureMinutes(l)
  const buffer = l.bufferMinutes ?? 0
  if (!(buffer >= 0) || !Number.isFinite(buffer)) add('minutes-invalid', 'lecture', `bufferMinutes must be zero or more (got ${l.bufferMinutes})`)
  if (total + buffer > maxMinutes) add('minutes-over', 'lecture', `slides sum to ${total} minutes${buffer ? ` plus a ${buffer}-minute buffer` : ''}; a session is ${maxMinutes}`)

  const slides = new Map(allSlides(l).map((s) => [s.id, s]))
  for (const ls of l.studentLesson) {
    const at = `lesson ${ls.id}`
    claim(ls.id, at)
    if (blank(ls.title)) add('empty-field', at, 'lesson section needs a title')
    if (ls.blocks.length === 0) add('empty-field', at, 'lesson section has no blocks')
    ls.sources.forEach((c) => cite(c, at))
    ls.blocks.forEach((b, i) => {
      const where = `${at} block[${i}]`
      if (b.kind === 'para' || b.kind === 'heading') {
        if (blank(b.text)) add('empty-field', where, `${b.kind} is empty`)
      } else if (b.kind === 'slide-ref') {
        if (!slides.has(b.slide)) add('unknown-slide-ref', where, `slide "${b.slide}" does not exist in this lecture`)
      } else if (b.kind === 'figure') {
        if ('slide' in b) {
          const s = slides.get(b.slide)
          if (!s) add('unknown-slide-ref', where, `slide "${b.slide}" does not exist in this lecture`)
          else if (!s.figure) add('slide-has-no-figure', where, `slide "${b.slide}" has no figure to share`)
        } else figure(b.figure, where)
      } else block(b, where)
    })
  }
  return issues
}

function slideNotes(s: Slide, at: string, add: (c: IssueCode, w: string, m: string) => void) {
  const n = s.notes
  const teach = (n.teach ?? []).filter((t) => !blank(t))
  if (teach.length === 0 || blank(n.why) || blank(n.transition) || blank(n.timing)) add('notes-empty', at, 'faculty notes need teach, why, transition and timing')
  if (s.figure && blank(n.figure)) add('notes-figure-missing', at, 'a slide with a figure needs notes on how to explain the figure')
  if (s.layout === 'worked-example' && !(n.workedSolution ?? []).some((t) => !blank(t))) add('notes-solution-missing', at, 'a worked-example slide needs the full worked solution in the notes')
  n.misconceptions?.forEach((m) => (blank(m.claim) || blank(m.correction)) && add('notes-empty', at, 'each misconception needs a claim and a correction'))
}

/** Checks a set of lectures together: one lecture per week and session, and ids unique across a week (the week's
 *  reader joins both sessions' lessons on one page). */
export function validateLectures(all: Lecture[], opts: ValidateOptions = {}): Issue[] {
  const issues: Issue[] = []
  const keys = new Set<string>()
  const weekIds = new Map<number, Map<string, string>>()
  for (const l of all) {
    const key = `week ${l.week} session ${l.session}`
    for (const i of validateLecture(l, opts)) issues.push({ ...i, where: `${key}: ${i.where}` })
    if (keys.has(key)) issues.push({ code: 'duplicate-session', where: key, message: `two lectures claim ${key}` })
    keys.add(key)
    const ids = weekIds.get(l.week) ?? new Map<string, string>()
    weekIds.set(l.week, ids)
    const own = [...l.sections.map((s) => s.id), ...allSlides(l).map((s) => s.id), ...l.studentLesson.map((s) => s.id)]
    for (const id of new Set(own)) {
      const prior = ids.get(id)
      if (prior && prior !== key) issues.push({ code: 'duplicate-id', where: key, message: `id "${id}" is also used in ${prior}` })
      else ids.set(id, key)
    }
  }
  return issues
}
