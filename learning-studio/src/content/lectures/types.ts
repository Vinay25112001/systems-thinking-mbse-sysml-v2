// Single-source lecture model (DECISION_LOG A20; COURSE_PRODUCTION_PLAN.md "Single-source pipeline"). One Lecture
// object per 75-minute session feeds the web slide viewer, the single-column reader, the generated .pptx (faculty notes
// as speaker notes), the faculty-notes Markdown and the student handout. Authoring guide: docs/lectures/PIPELINE.md.
import type { Citation } from '../readings'

export type { Citation }

export type SlideLayout =
  | 'title'
  | 'bullets'
  | 'two-column'
  | 'figure'
  | 'figure-bullets'
  | 'table'
  | 'definition'
  | 'equation'
  | 'worked-example'
  | 'summary'
  /** The closing "References and credits" slide. Its content is GENERATED from every citation the lecture uses (the
   *  verified register) and the license credits of those sources (references.ts); the slide's body stays empty. */
  | 'references'

/** A bullet is a line of text, or a line with one level of sub-bullets (two levels at most, by type). Inline
 *  `**bold**` and `*emphasis*` are the only markup. */
export type Bullet = string | { text: string; sub: string[] }

export type Block =
  | { kind: 'bullets'; items: Bullet[] }
  /** A cited definition: `text` is the source's wording (or a faithful paraphrase marked as such in the notes). */
  | { kind: 'definition'; term: string; text: string; source: Citation }
  | { kind: 'table'; header: string[]; rows: string[][]; caption?: string }
  /** An equation as display text (Unicode: ×, ÷, ≤, λ, subscripts written as plain text) plus a spoken form for screen
   *  readers and the symbol list. Rendered without a math library (no KaTeX/MathJax dependency). */
  | { kind: 'equation'; display: string; speech: string; where?: { symbol: string; meaning: string }[] }
  | { kind: 'callout'; tone: 'note' | 'key' | 'caution'; title?: string; text: string }
  /** Numbered steps of a worked example (the full solution lives in the faculty notes). */
  | { kind: 'steps'; items: { label: string; text: string }[] }

/** A figure drawn by a React SVG component from src/components/figures/registry.ts. */
export type FigureRef = { id: string; caption: string; alt: string }

/** Faculty notes: everything another instructor needs to teach the slide. Exported as PowerPoint speaker notes. */
export type FacultyNotes = {
  /** What to say and do, in order. */
  teach: string[]
  /** Why this slide is here: what it buys the students. */
  why: string
  /** How to walk through the figure (required when the slide has one). */
  figure?: string
  /** The full worked solution (required on worked-example slides). */
  workedSolution?: string[]
  examples?: string[]
  misconceptions?: { claim: string; correction: string }[]
  /** The sentence that leads into the next slide. */
  transition: string
  /** How the slide's minutes are spent, e.g. "2 min explain, 1 min question". */
  timing: string
}

export type Slide = {
  id: string
  title: string
  subtitle?: string
  /** Instructor-facing: what this slide is for (never shown to students on the slide). */
  purpose: string
  minutes: number
  layout: SlideLayout
  body: Block[]
  /** Right-hand column of a two-column slide (also allowed beside a figure on figure-bullets). */
  aside?: Block[]
  figure?: FigureRef
  sources: Citation[]
  notes: FacultyNotes
}

export type LectureSection = { id: string; title: string; slides: Slide[] }

/** Long-form student lesson blocks. Text blocks use the same inline markup as bullets. */
export type LessonBlock =
  | { kind: 'para'; text: string }
  | { kind: 'heading'; text: string }
  | Block
  /** A figure: either the figure of a slide (`slide`, so caption and alt are shared) or its own reference. */
  | { kind: 'figure'; slide: string }
  | { kind: 'figure'; figure: FigureRef }
  /** "See slide N" pointer into the lecture. */
  | { kind: 'slide-ref'; slide: string; text?: string }

export type LessonSection = {
  id: string
  title: string
  blocks: LessonBlock[]
  sources: Citation[]
}

export type Lecture = {
  week: number
  session: 1 | 2
  title: string
  subtitle?: string
  /** Set on demonstration content that is not course material (shown as a banner everywhere it renders). */
  fixture?: boolean
  sections: LectureSection[]
  studentLesson: LessonSection[]
  /** Planned slack in minutes (transitions, questions, room logistics), recorded in the faculty notes. The slides plus
   *  the buffer must fit the session (validator rule `minutes-over`). */
  bufferMinutes?: number
}

export const SESSION_MINUTES = 75
export const SLIDE_WORD_BUDGET = 60
