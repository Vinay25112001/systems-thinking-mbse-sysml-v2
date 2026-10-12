// Learn-stage schema (docs/redesign/WEEK1_LEARNING_DESIGN.md §7.1). Reviewed text is never copied: a body item either
// references a reviewed lesson block by id, paragraph and (optionally) a sentence range, or it is NEW instructor-authored
// text that carries `review: 'new-pending-review'` so an independent reviewer can find every new item by searching
// for that string. Content modules never import React.
import type { Bloom } from '../course'
import type { Citation } from '../readings'

/** Marks every item written for the book-style flow that has not yet passed independent review. */
export type NewReview = 'new-pending-review'
export const PENDING: NewReview = 'new-pending-review'

/** A cut of a reviewed paragraph: `sentences` is [first, last] inclusive (0-based), omitted = the whole paragraph. */
export type BlockRef = { block: string; para: number; sentences?: [number, number] }

export type BodyItem =
  | { ref: BlockRef; callout?: string }
  | { text: string; provenance: 'instructor-authored'; review: NewReview; callout?: string }

export type NewText = { text: string; review: NewReview }

/** Figure ids are rendered by src/components/figures (registry in figures/index.tsx). */
export type FigureSpec = {
  id: string
  title: string
  caption: NewText
  alt: string
  textEquivalent: string
  review: NewReview
  /** Alt text and text equivalent shown until the section's worked input is answered (the full ones give the answer away). */
  preReveal?: { alt: string; textEquivalent: string }
}

export type CheckOption = { id: string; text: string; correct: boolean; feedback: string }
/** One retrieval check per section (ungraded; any answer marks the section ready to be read). */
export type SectionCheck = {
  id: string
  bloom: Bloom
  solo: string
  objective: string
  prompt: string
  options: CheckOption[]
  cite: Citation
  review: NewReview
}

export type WorkedStep =
  | { kind: 'shown'; title: string; body: BlockRef[] }
  /** The student enters a number; `answer` and `tolerance` decide the feedback, `body` is revealed after. */
  | { kind: 'input'; title: string; prompt: string; answer: number; tolerance: number; body: BlockRef[]; near?: { value: number; feedback: string } }

export type Worked =
  | { kind: 'bullets'; title: string; intro: BlockRef; block: string; bullets: number[] }
  | { kind: 'loop'; title: string; loop: string; intro: NewText }
  | { kind: 'faded'; title: string; setup: BlockRef; steps: WorkedStep[] }

export type KeyTerm = { term: string; def: string }

export type LearnSection = {
  id: string
  /** Short label for the section list ("L1"). */
  code: string
  title: string
  question: NewText
  /** One-sentence summary shown first ("In short"). */
  inShort: NewText
  objectives: string[]
  bloom: Bloom
  solo: string
  minutes: number
  maxWords: number
  body: BodyItem[]
  figures: FigureSpec[]
  worked?: Worked
  /** Explanation placed after the worked example (Merrill: demonstrate, then generalise). */
  afterWorked?: BodyItem[]
  keyTerms: { items: KeyTerm[]; review: NewReview }
  check: SectionCheck
  cite: Citation[]
  /** "Read more": the exact reading pages that deepen this section (core or extension readings, verified ranges). */
  readMore: Citation[]
  /** Reviewed block ids shown in full under "Go deeper". */
  goDeeper: string[]
  /** One-line teaser for the opener's "What you will learn". */
  teaser: NewText
}
