// Text helpers shared by the validator, the web views and the export script (scripts/build-lectures.mjs), so all of
// them read the same inline markup and count words the same way.
import type { Block, Bullet, Lecture, Slide } from './types'

export type Run = { text: string; bold?: boolean; em?: boolean }

/** Splits `**bold**` and `*emphasis*` into runs. Anything else is literal text. */
export function parseInline(s: string): Run[] {
  const runs: Run[] = []
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g
  let last = 0
  for (let m = re.exec(s); m; m = re.exec(s)) {
    if (m.index > last) runs.push({ text: s.slice(last, m.index) })
    runs.push(m[1] !== undefined ? { text: m[1], bold: true } : { text: m[2], em: true })
    last = m.index + m[0].length
  }
  if (last < s.length) runs.push({ text: s.slice(last) })
  return runs
}

export const plain = (s: string) => parseInline(s).map((r) => r.text).join('')

export const wordCount = (s: string) => plain(s).split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length

const bulletText = (b: Bullet): string[] => (typeof b === 'string' ? [b] : [b.text, ...b.sub])

/** Every string a block puts on the slide face. */
export function blockText(b: Block): string[] {
  switch (b.kind) {
    case 'bullets':
      return b.items.flatMap(bulletText)
    case 'definition':
      return [b.term, b.text]
    case 'table':
      return [...b.header, ...b.rows.flat(), ...(b.caption ? [b.caption] : [])]
    case 'equation':
      return [b.display, ...(b.where ?? []).flatMap((w) => [w.symbol, w.meaning])]
    case 'callout':
      return [...(b.title ? [b.title] : []), b.text]
    case 'steps':
      return b.items.flatMap((i) => [i.label, i.text])
  }
}

/** Words on the slide body (body and aside; not the title, footer, caption or notes). */
export const slideBodyWords = (s: Slide) => [...s.body, ...(s.aside ?? [])].flatMap(blockText).reduce((n, t) => n + wordCount(t), 0)

export const allSlides = (l: Lecture): Slide[] => l.sections.flatMap((s) => s.slides)

export const lectureMinutes = (l: Lecture) => allSlides(l).reduce((n, s) => n + s.minutes, 0)

export const pad2 = (n: number) => String(n).padStart(2, '0')

/** Export file stem: week01-session1. */
export const lectureStem = (l: Pick<Lecture, 'week' | 'session'>) => `week${pad2(l.week)}-session${l.session}`
