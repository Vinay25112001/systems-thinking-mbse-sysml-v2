// The Week 1 textbook (spec §d, M4 part A): chapter order and titles (LRN-01), every reused lesson block placed exactly
// once or excluded with a reason (no teaching text lost, no duplication of the old Examples page, LRN-06), legacy ids
// resolving (§d.1), no register (R) or source (S) codes rendered (LRN-14), provenance in student words (LRN-07),
// figures with text equivalents (LRN-13), knowledge checks placed after the instruction (LRN-03), common errors quoted
// verbatim from the faculty notes (LRN-04), and the IF-1 boundary explorer (keyboard, live region, text equivalent).
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WEEK01_SESSION1 } from '../../content/lectures/week01/session1'
import { WEEK1_SESSION2 } from '../../content/lectures/week01/session2'
import { WEEK1_QUIZ } from '../../content/quizWeek1'
import { LEARN_SECTIONS } from '../../content/learn/week01'
import { Providers } from '../../state/Providers'
import { EXAMPLE_PARTS } from '../exampleParts'
import { LEGACY_TO_SECTION, resolveLearnAlias, week1Route } from '../route'
import BoundaryExplorer, { BOUNDARIES, crossing, statusText } from './BoundaryExplorer'
import { LEARN_CHECK_IDS } from './checks'
import { COMMON_ERRORS } from './commonErrors.generated'
import LearnReader, { slideTarget } from './LearnReader'
import { blockText, buildChapter, CHAPTER_MODELS, richText } from './model'
import { PROGRESS_KEY } from './progress'
import { STORAGE_PREFIX } from '../../lib/storage'
import { splitCitations, studentCitation, studentProvenance } from './studentText'
import { CHAPTERS, GAPS, LESSONS, NOT_PLACED, sectionById, type Part } from './textbook'

beforeEach(() => window.localStorage.clear())

const IA_TITLES = [
  'Week 1 in context, and the AeroLink case',
  'Engineered systems',
  'Systems thinking and the enterprise',
  'Boundaries, context and operational environments',
  'From mission to stakeholders to needs',
  'Identifying and classifying stakeholders',
  'Concerns, interests and relationships',
  'Eliciting needs',
  'Needs, requirements and proposed solutions',
  'Traceability foundations and the road to Week 8',
  'Forming the team and choosing the enterprise',
]
const R_OR_S_CODE = /\bR\d{2,3}[a-z]?\b|\bS\d{2}\b/

const reader = (chapter?: string, section?: string) =>
  render(
    <Providers>
      <LearnReader chapter={chapter} section={section} path={`/week/1/learn${chapter ? `/${chapter}` : ''}`} />
    </Providers>,
  )

describe('Chapter structure (LRN-01, §d.1)', () => {
  it('has the eleven IA chapters in order, 58 sections with ids w01.learn.chNN-nn, and 5.3 says “objectives” (A25)', () => {
    expect(CHAPTERS.map((c) => c.title)).toEqual(IA_TITLES)
    expect(CHAPTERS.map((c) => c.id)).toEqual(IA_TITLES.map((_, i) => `ch${String(i + 1).padStart(2, '0')}`))
    const ids = CHAPTERS.flatMap((c) => c.sections.map((s) => s.id))
    expect(ids).toHaveLength(58)
    expect(new Set(ids).size).toBe(58)
    // ids are stable; review M4b F3 shows ch04-04 (four layers) before ch04-03 (the operational environment)
    const SWAPPED: Record<string, string[]> = { ch04: ['ch04-01', 'ch04-02', 'ch04-04', 'ch04-03', 'ch04-05'] }
    for (const c of CHAPTERS) expect(c.sections.map((s) => s.id), c.id).toEqual(SWAPPED[c.id] ?? c.sections.map((_, i) => `${c.id}-${String(i + 1).padStart(2, '0')}`))
    expect(sectionById('ch05-03')!.section.title).toMatch(/objectives/)
    expect(CHAPTERS.flatMap((c) => c.sections.map((s) => s.title)).join(' ')).not.toMatch(/\bgoals\b/)
  })

  it('places every block of the Week 1 student lesson exactly once, or lists why not (no text lost or duplicated)', () => {
    const placed = new Map<string, number>()
    const sentenceCuts = new Map<string, [number, number][]>()
    for (const c of CHAPTERS)
      for (const s of c.sections)
        for (const p of s.parts as Part[]) {
          if (p.kind !== 'lesson') continue
          for (let i = p.from; i <= (p.to ?? p.from); i++) {
            const key = `${p.lesson}:${i}`
            if (p.sentences) sentenceCuts.set(key, [...(sentenceCuts.get(key) ?? []), p.sentences])
            else placed.set(key, (placed.get(key) ?? 0) + 1)
          }
        }
    // a block excluded whole, or excluded in part by sentence (its kept sentences are placed as cuts)
    const excluded = new Set(NOT_PLACED.filter((x) => !x.sentences).map((x) => `${x.lesson}:${x.block}`))
    for (const x of NOT_PLACED.filter((y) => y.sentences)) sentenceCuts.set(`${x.lesson}:${x.block}`, [...(sentenceCuts.get(`${x.lesson}:${x.block}`) ?? []), x.sentences!])
    for (const l of [WEEK01_SESSION1, WEEK1_SESSION2])
      for (const sec of l.studentLesson)
        sec.blocks.forEach((_, i) => {
          const key = `${sec.id}:${i}`
          const n = (placed.get(key) ?? 0) + (sentenceCuts.has(key) ? 1 : 0) + (excluded.has(key) ? 1 : 0)
          expect(n, key).toBe(1)
        })
    // sentence cuts cover each cut paragraph completely, without overlap
    for (const [key, cuts] of sentenceCuts) {
      const [lesson, b] = key.split(':')
      const block = LESSONS[lesson].section.blocks[+b]
      const total = block.kind === 'para' ? block.text.split(/(?<=[.!?])\s+(?=[A-Z“"(])/).length : 0
      const covered = cuts.flatMap(([a, z]) => Array.from({ length: z - a + 1 }, (_, k) => a + k)).sort((x, y) => x - y)
      expect(covered, key).toEqual(Array.from({ length: total }, (_, k) => k))
    }
    // the stated reasons are true (review F12): a "heading" entry is a heading block, a back-matter entry is rendered by
    // the back matter (Week 1 in one page renders blocks 9 and 10 of the classifying section), a sentence exclusion is a
    // paragraph whose dropped sentences repeat placed text
    for (const x of NOT_PLACED) {
      const b = LESSONS[x.lesson].section.blocks[x.block]
      if (/^heading/.test(x.reason)) expect(b.kind, `${x.lesson}:${x.block}`).toBe('heading')
      if (/back matter \(Week 1 in one page\)/.test(x.reason) && b.kind !== 'heading') expect([9, 10], `${x.lesson}:${x.block}`).toContain(x.block)
      if (x.sentences) expect(b.kind).toBe('para')
    }
  })

  it('the three worked examples of the retired Examples page exist once, inside Learn (LRN-06)', () => {
    const where = (lesson: string) => CHAPTERS.flatMap((c) => c.sections.filter((s) => s.parts.some((p) => p.kind === 'lesson' && p.lesson === lesson)).map((s) => s.id))
    expect(EXAMPLE_PARTS.map((p) => where(p.lesson))).toEqual([['ch06-07', 'ch07-03', 'ch07-04'], ['ch09-07'], ['ch10-03']])
    expect(week1Route('/week/1/examples')).toEqual({ redirect: '/week/1/learn/ch06#ch06-07' })
  })

  it('every legacy id resolves: lesson sections, self-study sections, quiz lecture links, chapter and section aliases', () => {
    for (const l of [WEEK01_SESSION1, WEEK1_SESSION2]) for (const s of l.studentLesson) expect(resolveLearnAlias(s.id), s.id).toMatch(/^\/week\/1\/learn\/(ch\d\d#ch\d\d-\d\d|refs)$/)
    for (const [legacy, target] of Object.entries(LEGACY_TO_SECTION)) {
      if (target === 'refs') continue
      const sec = sectionById(target)!
      expect(sec.section.legacy ?? [], legacy).toContain(legacy)
    }
    for (const q of WEEK1_QUIZ) expect(resolveLearnAlias(q.lecture!.section), q.id).not.toBeNull()
    for (const s of LEARN_SECTIONS) expect(resolveLearnAlias(s.id), s.id).not.toBeNull()
    expect(resolveLearnAlias('w01.learn.ch06-03')).toBe('/week/1/learn/ch06#ch06-03')
    expect(resolveLearnAlias('w1-glossary')).toBe('/week/1/learn/glossary')
  })

  it('a student following an old slide link lands on the Learn section that holds that slide’s figure', () => {
    const slides = WEEK01_SESSION1.sections.flatMap((s) => s.slides)
    const i = slides.findIndex((s) => s.id === 's1-three-scopes')
    expect(slideTarget(1, i + 1)).toBe('/week/1/learn/ch04#ch04-01')
    expect(slideTarget(1)).toBe('/week/1/learn')
    // a slide without a figure in Learn lands on the section of its lesson, not on the Learn root (review F15)
    expect(slideTarget(1, 5)).toMatch(/^\/week\/1\/learn\/ch\d\d#ch\d\d-\d\d$/)
  })
})

describe('Footnote citations and student wording (LRN-14, LRN-07)', () => {
  it('turns inline register codes into notes with source, title and page', () => {
    const segs = splitCitations('SEBoK calls it a system (R38 p.1637), as before (R39c p.1493, paraphrased).')
    expect(segs.map((s) => ('text' in s ? s.text : `[${s.cite.reading}]`)).join('')).toBe('SEBoK calls it a system[R38], as before (paraphrased)[R39c].')
    expect(studentCitation({ reading: 'R11', pages: '553' })).toBe('SEBoK v2.14 (2026), “Stakeholder Needs Definition”, PDF p. 553')
    expect(studentCitation({ reading: 'R11', pages: '549–555' })).toMatch(/PDF pp\. 549–555$/)
  })

  it('no chapter renders an R-code or S-code, “instructor to confirm”, “awaiting faculty” or “(FICTIONAL, proposed)”', () => {
    for (const m of CHAPTER_MODELS()) {
      const text = m.sections.flatMap((s) => [s.section.title, ...s.blocks.map(blockText)]).join(' ')
      expect(text, m.chapter.id).not.toMatch(R_OR_S_CODE)
      expect(text, m.chapter.id).not.toMatch(/instructor to confirm|awaiting faculty|pending faculty|FICTIONAL, proposed/i)
      for (const n of m.notes) expect(studentCitation(n.cite)).not.toMatch(R_OR_S_CODE)
    }
    expect(studentProvenance('X (FICTIONAL, proposed).')).toBe('X (fictional).')
    // F10: figure alt text and the remaining caption forms are in student wording too
    for (const m of CHAPTER_MODELS())
      for (const s of m.sections)
        for (const b of s.blocks) if (b.kind === 'figure') expect(`${b.figure.caption} ${b.figure.alt}`, b.figure.id).not.toMatch(/values proposed|a proposed priority|priorities are proposed|Priorities proposed|\(proposed\)/)
  })

  it('a table cell left with only footnotes reads "See note n", never blank (review F11: the Basis column of 9.8)', () => {
    const t = buildChapter(CHAPTERS[8]).sections.find((s) => s.section.id === 'ch09-08')!
    expect(t.section.title).toBe('Error and correction table')
    const tables = t.blocks.filter((b) => b.kind === 'table')
    expect(tables.length).toBeGreaterThan(0)
    for (const b of tables) if (b.kind === 'table') for (const r of b.rows) for (const c of r) expect(richText(c).trim(), JSON.stringify(r)).not.toBe('')
  })

  it('renders chapter 6 with notes and no register codes in the visible text', () => {
    reader('ch06')
    const main = screen.getByTestId('learn-reader').querySelector('article')!
    expect(main.textContent).not.toMatch(R_OR_S_CODE)
    expect(main.querySelectorAll('sup.w1l-fn').length).toBeGreaterThan(10)
    // the register id survives only in a link target
    expect(main.querySelector('a[href^="#/sources/R"]')).not.toBeNull()
  })
})

describe('Reader layout, navigation and progress (LRN-10, LRN-11, LRN-12, LRN-15)', () => {
  it('shows chapter n of 11, nests sections only under the current chapter, and has the reference rail with the fictional badge', () => {
    reader('ch04', 'ch04-02')
    const nav = screen.getByRole('navigation', { name: 'Week 1 chapters' })
    expect(screen.getByTestId('learn-chapter-of')).toHaveTextContent('Chapter 4 of 11')
    expect(within(nav).getAllByRole('list')).toHaveLength(2) // chapters + the current chapter's sections
    expect(within(nav).getByRole('link', { name: /4\.2 Boundary, environment, context/ })).toHaveAttribute('aria-current', 'location')
    const rail = screen.getByTestId('learn-rail')
    expect(within(rail).getByText('Fictional teaching case')).toBeInTheDocument()
    expect(within(rail).getByText('Used later')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Boundaries, context and operational environments')
    expect(document.getElementById('ch04-01')).toHaveAttribute('data-content-id', 'w01.learn.ch04-01')
    expect(screen.getByTestId('learn-common-errors')).toHaveTextContent('The biggest boundary is the safest')
    expect(screen.getByTestId('learn-used-later')).toBeInTheDocument()
  })

  it('“Mark section read” records progress in this browser and the navigation says so in words', async () => {
    const user = userEvent.setup()
    reader('ch02')
    await user.click(screen.getByTestId('mark-read-ch02-02'))
    expect(JSON.parse(localStorage.getItem(STORAGE_PREFIX + PROGRESS_KEY)!).read['ch02-02']).toBeGreaterThan(0)
    expect(within(screen.getByRole('navigation', { name: 'Week 1 chapters' })).getByRole('link', { name: /2\.2 What systems engineering is for.*\(read\)/ })).toBeInTheDocument()
    expect(screen.getByText('Your reading progress is saved in this browser only.')).toBeInTheDocument()
  })

  it('back matter: references without register codes, the glossary with sources or the course-convention label', () => {
    const { unmount } = reader('refs')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('References and credits')
    expect(screen.getByTestId('learn-reader').querySelector('article')!.textContent).not.toMatch(R_OR_S_CODE)
    unmount()
    reader('glossary')
    expect(screen.getAllByText('course convention').length).toBeGreaterThan(0)
    expect(screen.getByText('Stakeholder register')).toBeInTheDocument()
  })
})

describe('Figures (LRN-13)', () => {
  it('every Learn figure has a number, a caption and a text equivalent, and resolves by figure id', () => {
    for (const m of CHAPTER_MODELS())
      for (const s of m.sections)
        for (const b of s.blocks)
          if (b.kind === 'figure') {
            expect(b.figure.alt.length, b.figure.id).toBeGreaterThan(40)
            expect(b.number).toMatch(new RegExp(`^${m.chapter.no}\\.\\d+$`))
          }
    reader('ch02')
    const fig = screen.getByTestId('learn-figure-w1s1-soi-enabling')
    expect(within(fig).getByText('Show text description')).toBeInTheDocument()
    expect(within(fig).getByRole('button', { name: /Expand/ })).toBeInTheDocument()
  })
})

describe('Knowledge checks (LRN-03)', () => {
  it('places 12 reviewed checks, at most two per chapter, each after the instruction it tests', () => {
    const placed = CHAPTERS.flatMap((c) => c.sections.filter((s) => s.check).map((s) => ({ ch: c.id, id: s.check! })))
    expect(placed.map((p) => p.id).sort()).toEqual([...LEARN_CHECK_IDS].sort())
    for (const c of CHAPTERS) expect(placed.filter((p) => p.ch === c.id).length, c.id).toBeLessThanOrEqual(2)
    // a check sits after its section's instruction: the section has placed text and the check renders after it
    for (const c of CHAPTERS) for (const s of c.sections.filter((x) => x.check)) expect(s.parts.length, s.id).toBeGreaterThan(0)
  })

  it('renders collapsed, labelled optional and not graded, after the section text, and gives feedback without slide numbers', async () => {
    const user = userEvent.setup()
    reader('ch06')
    const box = screen.getByTestId('learn-check-c4')
    expect(box).not.toHaveAttribute('open')
    expect(box).toHaveTextContent('Check your understanding (optional, not graded)')
    const section = document.getElementById('ch06-01')!
    const children = [...section.children]
    expect(children.indexOf(box)).toBeGreaterThan(children.findIndex((x) => x.tagName === 'P'))
    await user.click(within(box).getByText(/Check your understanding/))
    const c4 = LEARN_SECTIONS.find((s) => s.check.id === 'c4')!.check
    await user.click(within(box).getByLabelText(c4.options.find((o) => o.correct)!.text))
    await user.click(within(box).getByRole('button', { name: 'Check my answer' }))
    expect(within(box).getByRole('status')).toHaveTextContent('Correct.')
    expect(within(box).getByLabelText(c4.options.find((o) => o.correct)!.text).closest('label')).toHaveClass('is-right')
    const quizBox = screen.getByTestId('learn-check-w1q-6')
    expect(quizBox.textContent).not.toMatch(/slide \d/i)
  })
})

describe('Knowledge-check feedback (review F9)', () => {
  it('a wrong answer marks only the chosen option wrong: the correct option is not revealed before the student finds it', async () => {
    const user = userEvent.setup()
    reader('ch06')
    const box = screen.getByTestId('learn-check-c4')
    await user.click(within(box).getByText(/Check your understanding/))
    const c4 = LEARN_SECTIONS.find((s) => s.check.id === 'c4')!.check
    const wrong = c4.options.find((o) => !o.correct)!
    const right = c4.options.find((o) => o.correct)!
    await user.click(within(box).getByLabelText(wrong.text))
    await user.click(within(box).getByRole('button', { name: 'Check my answer' }))
    expect(within(box).getByRole('status')).toHaveTextContent(/Not quite\..*Read section 6\.1 again, then try another option\./)
    expect(within(box).getByLabelText(wrong.text).closest('label')).toHaveClass('is-wrong')
    expect(within(box).getByLabelText(right.text).closest('label')).not.toHaveClass('is-right')
    expect(box.querySelectorAll('.is-right')).toHaveLength(0)
    // the visual state follows the text: choosing again clears the mark, and finding the answer turns it green
    await user.click(within(box).getByLabelText(right.text))
    expect(box.querySelectorAll('.is-wrong, .is-right')).toHaveLength(0)
    await user.click(within(box).getByRole('button', { name: 'Check my answer' }))
    expect(within(box).getByLabelText(right.text).closest('label')).toHaveClass('is-right')
    expect(within(box).getByRole('status')).toHaveTextContent('Correct.')
  })
})

describe('Student numbering (review F6, FD-b default: renumber)', () => {
  it('numbers the visible sections 1, 2, 3 … in the student edition, keeping the content ids', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_EDITION', 'student')
    try {
      const book = await import('./textbook')
      const model = await import('./model')
      // M4b filled every gap, so no section is hidden and the student numbers equal the canonical ones
      expect(book.CHAPTERS.flatMap((c) => c.sections.filter((s) => s.parts.length === 0).map((s) => s.id))).toEqual([])
      for (const c of book.CHAPTERS) {
        const m = model.buildChapter(c)
        expect(m.sections.map((s) => s.number), c.id).toEqual(m.sections.map((_, i) => `${c.no}.${i + 1}`))
        for (const s of m.sections) expect(s.section.id).toMatch(new RegExp(`^${c.id}-\\d\\d$`))
      }
      expect(book.displayNumber('ch03-02')).toBe('3.2')
      expect(book.displayNumber('ch04-04')).toBe('4.3') // shown before the operational environment (review M4b F3)
      expect(book.displayNumber('ch04-03')).toBe('4.4')
      expect(book.displayNumber('ch10-04')).toBe('10.4')
    } finally {
      vi.unstubAllEnvs()
      vi.resetModules()
    }
  })

  it('the instructor edition keeps the canonical numbers, so faculty see where each gap sits', () => {
    expect(buildChapter(CHAPTERS[2]).sections.map((s) => s.number)).toEqual(['3.1', '3.2', '3.3', '3.4', '3.5'])
  })
})

describe('Common errors (LRN-04)', () => {
  it('quotes the faculty misconceptions verbatim, every chapter has its box', () => {
    const notes = [WEEK01_SESSION1, WEEK1_SESSION2].flatMap((l) => l.sections.flatMap((s) => s.slides.flatMap((x) => x.notes.misconceptions ?? [])))
    for (const c of CHAPTERS) {
      expect(COMMON_ERRORS[c.id]?.length, c.id).toBeGreaterThan(0)
      for (const e of COMMON_ERRORS[c.id]) expect(notes.some((n) => n.claim === e.claim && n.correction === e.correction), e.claim).toBe(true)
    }
  })
})

describe('Faculty gaps (§d.10) after M4 part B', () => {
  it('every IA gap section now carries authored prose, and no faculty placeholder renders', () => {
    expect(Object.keys(GAPS)).toEqual([])
    const filled = ['ch01-02', 'ch01-03', 'ch01-04', 'ch01-05', 'ch02-04', 'ch03-01', 'ch04-03', 'ch04-05', 'ch05-03', 'ch05-04', 'ch07-02', 'ch07-03', 'ch08-04', 'ch10-01', 'ch10-02', 'ch10-05', 'ch11-04']
    for (const id of filled) expect(sectionById(id)!.section.parts.some((p) => p.kind === 'reuse' && p.origin.startsWith('authored.ts')), id).toBe(true)
    reader('ch03')
    expect(screen.queryByTestId('gap-ch03-01')).toBeNull()
    expect(document.getElementById('ch03-01')).toHaveTextContent('There is no single agreed definition of systems thinking')
  })
})

describe('IF-1 Boundary explorer (LRN-20)', () => {
  it('switches boundaries by keyboard, announces the state politely, and has a text equivalent', async () => {
    const user = userEvent.setup()
    render(<BoundaryExplorer number="4.1" />)
    const status = screen.getByTestId('if1-status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    // opens on the narrowest boundary, so the reader explores toward the one that answers (review F13)
    expect(status).toHaveTextContent('Boundary: aircraft. 3 links cross it. Can it answer the question? No.')
    const radios = screen.getAllByRole('radio', { name: 'Aircraft' })
    radios[0].focus()
    await user.keyboard('{ArrowRight}')
    expect(status).toHaveTextContent('Boundary: flight operations. 4 links cross it.')
    await user.keyboard('{ArrowRight}')
    expect(status).toHaveTextContent('Boundary: air-taxi service. 3 links cross it. Can it answer the question? Yes.')
    // the phone variant: the same state as a stacked list in body text (review F4)
    expect(screen.getAllByTestId('if1-stacked')[0]).toHaveTextContent('Links crossing it:')
    const te = screen.getByTestId('if1-text-equivalent')
    expect(within(te).getAllByRole('row')).toHaveLength(4)
    for (const b of BOUNDARIES) expect(te).toHaveTextContent(b.why)
    expect(BOUNDARIES.map((b) => crossing(b).length)).toEqual([3, 4, 3])
    expect(statusText(BOUNDARIES[0])).toMatch(/No\.$/)
  })

  it('quotes section 4.1’s sentences for the “why” column, never retyped', () => {
    const p = LESSONS['s1-lesson-boundary'].section.blocks[0]
    for (const b of BOUNDARIES) expect(p.kind === 'para' && p.text.includes(b.why), b.id).toBe(true)
    const ch4 = buildChapter(CHAPTERS[3])
    expect(ch4.sections[0].blocks.findIndex((b) => b.kind === 'interactive')).toBe(1)
    const first = ch4.sections[0].blocks[0]
    expect(first.kind === 'para' ? richText(first.rich) : '').toMatch(/^A system of interest is chosen/)
  })
})
