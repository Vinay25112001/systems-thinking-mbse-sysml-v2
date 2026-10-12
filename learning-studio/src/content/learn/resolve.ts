// Resolves Learn-stage references into the reviewed Week 1 text (src/content/week1.ts and src/content/weeks/week01.ts).
// The text is cut, never retyped, so a reviewed sentence cannot drift when it appears in the book-style flow.
import type { LessonBlock } from '../schema'
import week01 from '../weeks/week01'
import type { BlockRef, BodyItem, LearnSection, Worked } from './types'

export const WEEK1_BLOCK_BY_ID: Record<string, LessonBlock> = Object.fromEntries(week01.blocks.map((b) => [b.id, b]))

/** Splits reviewed prose into sentences (a full stop inside a number such as 14.4 does not end a sentence). */
export const sentences = (p: string) => p.split(/(?<=[.!?])\s+(?=[A-Z“"(])/).map((x) => x.trim())

export function blockOf(id: string): LessonBlock {
  const b = WEEK1_BLOCK_BY_ID[id]
  if (!b) throw new Error(`Unknown Week 1 block ${id}`)
  return b
}

export function resolveRef(r: BlockRef): string {
  const p = blockOf(r.block).paragraphs[r.para]
  if (p === undefined) throw new Error(`${r.block} has no paragraph ${r.para}`)
  if (!r.sentences) return p
  const s = sentences(p)
  const [a, z] = r.sentences
  if (a < 0 || z >= s.length || a > z) throw new Error(`${r.block} ¶${r.para} has no sentences ${a}–${z} (it has ${s.length})`)
  return s.slice(a, z + 1).join(' ')
}

export function resolveBullet(block: string, i: number): string {
  const b = blockOf(block).bullets?.[i]
  if (b === undefined) throw new Error(`${block} has no bullet ${i}`)
  return b
}

export const bodyText = (b: BodyItem) => ('ref' in b ? resolveRef(b.ref) : b.text)

const words = (s: string) => s.split(/\s+/).filter(Boolean).length

function workedText(w: Worked | undefined): string[] {
  if (!w) return []
  if (w.kind === 'bullets') return [resolveRef(w.intro), ...w.bullets.map((i) => resolveBullet(w.block, i))]
  if (w.kind === 'loop') return [w.intro.text]
  return [resolveRef(w.setup), ...w.steps.flatMap((s) => [...(s.kind === 'input' ? [s.prompt] : []), ...s.body.map(resolveRef)])]
}

/** Student-facing prose of a section (design §2: figure labels, key terms and check options are not counted). */
export function sectionProse(s: LearnSection): string[] {
  const body = [...s.body, ...(s.afterWorked ?? [])]
  return [s.question.text, s.inShort.text, ...body.map(bodyText), ...body.flatMap((b) => (b.callout ? [b.callout] : [])), ...workedText(s.worked), ...s.figures.map((f) => f.caption.text)]
}

export const sectionWords = (s: LearnSection) => sectionProse(s).reduce((n, p) => n + words(p), 0)
export const countWords = words
