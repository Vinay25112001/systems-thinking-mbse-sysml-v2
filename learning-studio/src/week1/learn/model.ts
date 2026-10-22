// Builds the render model of one textbook chapter: resolved blocks with every inline register code turned into a
// numbered footnote (LRN-14), provenance in student words (LRN-07), figures numbered per chapter by figure id (LRN-13).
// Pure data, so the reader and the tests read the same model.
import { allSlides } from '../../content/lectures/text'
import type { FigureRef, Lecture, LessonBlock } from '../../content/lectures/types'
import type { Citation } from '../../content/readings'
import { CHAPTERS, LESSONS, displayNumber, partBlocks, visibleInEdition, type Chapter, type InteractiveId, type Section } from './textbook'
import { splitCitations, studentText } from './studentText'
import { getLearnOverlay, type LearnOverlay } from './published' // publishing (M3)

export type RSeg = { t: string } | { n: number }
export type Rich = RSeg[]
export type RBlock = (
  | { kind: 'para'; rich: Rich }
  | { kind: 'heading'; text: string }
  | { kind: 'bullets'; items: { rich: Rich; sub: Rich[] }[] }
  | { kind: 'definition'; term: string; rich: Rich; note: number }
  | { kind: 'table'; header: string[]; rows: Rich[][]; caption?: Rich }
  | { kind: 'equation'; display: string; speech: string; where?: { symbol: string; meaning: string }[] }
  | { kind: 'callout'; tone: 'note' | 'key' | 'caution'; title?: string; rich: Rich }
  | { kind: 'steps'; items: { label: string; rich: Rich }[] }
  | { kind: 'figure'; figure: FigureRef; number: string }
  | { kind: 'interactive'; id: InteractiveId; number: string }
) & {
  /** Extension reading: shown in a labelled box, not counted in the required reading time. */
  optional?: boolean
}

export type Note = { n: number; cite: Citation; section: string }
export type SectionModel = { section: Section; number: string; blocks: RBlock[]; notes: Note[]; definitions: { term: string; text: string; note: number }[] }
export type ChapterModel = { chapter: Chapter; sections: SectionModel[]; notes: Note[] }

// --- publishing ---
/** `overlay` (M3): the latest published section bodies (src/week1/learn/published.ts); a section without one renders
 *  the bundled code parts. Default: the global published overlay, null offline and in the static student build. */
export function buildChapter(chapter: Chapter, overlay: LearnOverlay | null = getLearnOverlay()): ChapterModel {
  // --- end publishing ---
  const notes: Note[] = []
  let fig = 0
  const sections: SectionModel[] = []
  for (const section of chapter.sections.filter(visibleInEdition)) {
    const own: Note[] = []
    const note = (cite: Citation) => {
      const n: Note = { n: notes.length + 1, cite, section: section.id }
      notes.push(n)
      own.push(n)
      return n.n
    }
    const rich = (s: string): Rich => splitCitations(studentText(s)).map((x) => ('cite' in x ? { n: note(x.cite) } : { t: x.text }))
    const blocks: RBlock[] = []
    const definitions: SectionModel['definitions'] = []
    // --- publishing ---
    const published = overlay?.sections[section.id]
    if (published)
      for (const b of published.blocks) {
        if (b.kind === 'interactive') {
          blocks.push({ kind: 'interactive', id: b.ifig, number: `${chapter.no}.${++fig}` })
          continue
        }
        const out = toRBlock(b as LessonBlock, rich, note, [], () => `${chapter.no}.${++fig}`)
        if (!out) continue
        if (b.optional) out.optional = true
        blocks.push(out)
        if (out.kind === 'definition') definitions.push({ term: out.term, text: out.rich.map((x) => ('t' in x ? x.t : '')).join(''), note: out.note })
        if (b.cites && out.kind === 'para') for (const c of b.cites) out.rich.push({ n: note(c) })
      }
    for (const p of published ? [] : section.parts) {
      // --- end publishing ---
      if (p.kind === 'interactive') {
        blocks.push({ kind: 'interactive', id: p.id, number: `${chapter.no}.${++fig}` })
        continue
      }
      const lecture = p.kind === 'lesson' ? LESSONS[p.lesson].lecture : null
      const resolved = partBlocks(p)
      resolved.forEach((b: LessonBlock, k) => {
        const out = toRBlock(b, rich, note, lecture ? allSlides(lecture) : [], () => `${chapter.no}.${++fig}`)
        if (out) {
          if (p.kind === 'reuse' && p.optional) out.optional = true
          blocks.push(out)
          if (out.kind === 'definition') definitions.push({ term: out.term, text: out.rich.map((x) => ('t' in x ? x.t : '')).join(''), note: out.note })
        }
        // footnotes attached to a reused block (week1.ts citations) follow its last paragraph
        if (p.kind === 'reuse' && p.cites && k === resolved.length - 1 && out && out.kind === 'para') for (const c of p.cites) out.rich.push({ n: note(c) })
      })
    }
    sections.push({ section, number: displayNumber(section.id), blocks, notes: own, definitions })
  }
  return { chapter, sections, notes }
}

function toRBlock(b: LessonBlock, rich: (s: string) => Rich, note: (c: Citation) => number, slides: { id: string; figure?: FigureRef }[], figNo: () => string): RBlock | null {
  switch (b.kind) {
    case 'para':
      return { kind: 'para', rich: rich(b.text) }
    case 'heading':
      return { kind: 'heading', text: studentText(b.text) }
    case 'bullets':
      return { kind: 'bullets', items: b.items.map((i) => (typeof i === 'string' ? { rich: rich(i), sub: [] } : { rich: rich(i.text), sub: i.sub.map(rich) })) }
    case 'definition':
      return { kind: 'definition', term: b.term, rich: rich(b.text), note: note(b.source) }
    case 'table':
      return { kind: 'table', header: b.header.map(studentText), rows: b.rows.map((r) => r.map((c) => seeNote(rich(c)))), caption: b.caption ? rich(b.caption) : undefined }
    case 'equation':
      return { kind: 'equation', display: b.display, speech: b.speech, where: b.where }
    case 'callout':
      return { kind: 'callout', tone: b.tone, title: b.title ? studentText(b.title) : undefined, rich: rich(b.text) }
    case 'steps':
      return { kind: 'steps', items: b.items.map((s) => ({ label: studentText(s.label), rich: rich(s.text) })) }
    case 'figure': {
      const f = 'slide' in b ? slides.find((s) => s.id === b.slide)?.figure : b.figure
      if (!f) return null
      return { kind: 'figure', figure: { ...f, caption: studentText(f.caption), alt: studentText(f.alt) }, number: figNo() }
    }
    case 'slide-ref':
      // "See slide N" pointers belong to the lecture, not the textbook
      return null
  }
}

/** A table cell left with only footnotes once its codes became notes (the Basis column of 9.8) reads "See note n" (F11). */
const seeNote = (cell: Rich): Rich => (cell.length > 0 && cell.every((x) => 'n' in x || !x.t.trim()) ? [{ t: cell.filter((x) => 'n' in x).length > 1 ? 'See notes' : 'See note' }, ...cell.filter((x) => 'n' in x)] : cell)

export const CHAPTER_MODELS = (): ChapterModel[] => CHAPTERS.map((c) => buildChapter(c)) // publishing (M3): not map(buildChapter), whose index would be taken as the overlay

/** Every student-visible string of a rich run (tests and word counts). */
export const richText = (r: Rich) => r.map((x) => ('t' in x ? x.t : '')).join('')
export function blockText(b: RBlock): string {
  switch (b.kind) {
    case 'para':
    case 'callout':
      return richText(b.rich) + (b.kind === 'callout' && b.title ? ` ${b.title}` : '')
    case 'heading':
      return b.text
    case 'bullets':
      return b.items.map((i) => [richText(i.rich), ...i.sub.map(richText)].join(' ')).join(' ')
    case 'definition':
      return `${b.term} ${richText(b.rich)}`
    case 'table':
      return [b.header.join(' '), ...b.rows.map((r) => r.map(richText).join(' ')), b.caption ? richText(b.caption) : ''].join(' ')
    case 'equation':
      return b.display
    case 'steps':
      return b.items.map((s) => `${s.label} ${richText(s.rich)}`).join(' ')
    case 'figure':
      return `${b.figure.caption} ${b.figure.alt}`
    case 'interactive':
      return ''
  }
}

/** Every citation the textbook renders as a note, wrapped as a lecture-shaped source so that the References back matter
 *  (lectureReferences) lists the readings that Learn's own prose cites (M4b) as well as the lessons' (no hand-kept list). */
export function learnAsLecture(): Lecture {
  const sources = CHAPTER_MODELS().flatMap((m) => m.notes.map((n) => n.cite))
  return { week: 1, session: 2, title: 'Week 1 textbook', sections: [], studentLesson: [{ id: 'w01.learn', title: 'Week 1 textbook', blocks: [], sources }] }
}
