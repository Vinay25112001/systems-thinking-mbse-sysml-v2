// Markdown exports from the lecture source: the faculty-notes document (weekNN-sessionS-notes.md) and the student
// handout (weekNN-lesson.md). Written by scripts/build-lectures.mjs; unit-tested in lectures.test.ts.
import { formatCitation, type Citation } from '../readings'
import { formatReference, lectureCredits, lectureReferences } from './references'
import { allSlides, lectureMinutes, pad2 } from './text'
import type { Block, Bullet, Lecture, LessonBlock, Slide } from './types'

const cites = (cs: Citation[]) => cs.map((c) => `- ${formatCitation(c)}`).join('\n')

const bullets = (items: Bullet[]) => items.map((b) => (typeof b === 'string' ? `- ${b}` : [`- ${b.text}`, ...b.sub.map((s) => `  - ${s}`)].join('\n'))).join('\n')

const cell = (s: string) => s.replace(/\|/g, '\\|')

export function blockMarkdown(b: Block): string {
  switch (b.kind) {
    case 'bullets':
      return bullets(b.items)
    case 'definition':
      return `> **${b.term}.** ${b.text}\n> — ${formatCitation(b.source)}`
    case 'table':
      return [`| ${b.header.map(cell).join(' | ')} |`, `| ${b.header.map(() => '---').join(' | ')} |`, ...b.rows.map((r) => `| ${r.map(cell).join(' | ')} |`), ...(b.caption ? ['', `*${b.caption}*`] : [])].join('\n')
    case 'equation':
      return [`\`\`\`\n${b.display}\n\`\`\``, ...(b.where?.length ? ['', 'where ' + b.where.map((w) => `${w.symbol} = ${w.meaning}`).join('; ')] : [])].join('\n')
    case 'callout':
      return `> **${b.title ?? { note: 'Note', key: 'Key point', caution: 'Caution' }[b.tone]}:** ${b.text}`
    case 'steps':
      return b.items.map((s, i) => `${i + 1}. **${s.label}:** ${s.text}`).join('\n')
  }
}

function slideNotes(s: Slide, no: number): string {
  const n = s.notes
  const out = [`### Slide ${no}. ${s.title}`, '', `*${s.minutes} min · layout ${s.layout}* — **Purpose:** ${s.purpose}`, '', '**Teach**', '', ...n.teach.map((t, i) => `${i + 1}. ${t}`), '', `**Why:** ${n.why}`]
  if (s.figure) out.push('', `**Figure (${s.figure.id}):** ${s.figure.caption}`, '', `**Explaining the figure:** ${n.figure ?? ''}`)
  if (n.workedSolution?.length) out.push('', '**Worked solution**', '', ...n.workedSolution.map((t, i) => `${i + 1}. ${t}`))
  if (n.examples?.length) out.push('', '**Examples**', '', ...n.examples.map((t) => `- ${t}`))
  if (n.misconceptions?.length) out.push('', '**Misconceptions**', '', ...n.misconceptions.map((m) => `- *“${m.claim}”* — ${m.correction}`))
  out.push('', `**Transition:** ${n.transition}`, '', `**Timing:** ${n.timing}`)
  if (s.sources.length) out.push('', '**Sources**', '', cites(s.sources))
  return out.join('\n')
}

/** The timing plan: one row per slide with its minutes and the running clock, then the planned buffer. */
export function timingTable(l: Lecture): string {
  let clock = 0
  const rows = allSlides(l).map((s, i) => {
    clock += s.minutes
    return `| ${i + 1} | ${cell(s.title)} | ${s.minutes} | ${clock} |`
  })
  const buffer = l.bufferMinutes ?? 0
  return ['| # | Slide | Min | Clock |', '| --- | --- | --- | --- |', ...rows, `| | **Planned content** | **${lectureMinutes(l)}** | |`, `| | **Buffer** (transitions, questions, logistics) | **${buffer}** | ${lectureMinutes(l) + buffer} |`].join('\n')
}

/** The generated reference list and credits (the same list as the closing slide). */
export function referencesMarkdown(lectures: Lecture[], pagesFrom: Lecture[] = lectures): string {
  return ['**References** (every citation used, merged per register entry)', '', ...lectureReferences(lectures, pagesFrom).map((e) => `- ${formatReference(e)}`), '', '**Credits and licenses**', '', ...lectureCredits(lectures).map((t) => `- ${t}`)].join('\n')
}

/** `week`: the week's lectures, so the references list one page range per reading across both decks (m6). */
export function notesMarkdown(l: Lecture, week: Lecture[] = [l]): string {
  const buffer = l.bufferMinutes ?? 0
  const head = [
    `# Week ${l.week}, Session ${l.session}: ${l.title} — faculty notes`,
    '',
    ...(l.fixture ? ['> **FIXTURE — not course content.** This document demonstrates the lecture pipeline.', ''] : []),
    `Instructor content. ${allSlides(l).length} slides, ${lectureMinutes(l)} minutes of planned content${buffer ? ` and a ${buffer}-minute buffer` : ''}, of 75 minutes. Generated from \`src/content/lectures\`; do not edit by hand.`,
    '',
    '## Timing plan',
    '',
    timingTable(l),
  ]
  let no = 0
  const body = l.sections.map((sec) => [`## ${sec.title}`, '', ...sec.slides.map((s) => slideNotes(s, ++no)).join('\n\n').split('\n')].join('\n'))
  return [...head, '', ...body.join('\n\n').split('\n'), '', '## References and credits', '', referencesMarkdown([l], week), ''].join('\n')
}

/** `figurePath(id)` gives the image path for a figure (the export embeds the PNGs it rendered); without it, the
 *  handout gives the caption and the text alternative only. */
function lessonBlock(b: LessonBlock, l: Lecture, figurePath?: (id: string) => string): string {
  if (b.kind === 'para') return b.text
  if (b.kind === 'heading') return `### ${b.text}`
  if (b.kind === 'slide-ref') {
    const i = allSlides(l).findIndex((s) => s.id === b.slide)
    return `*${b.text ?? 'See'}: Session ${l.session}, slide ${i + 1} (“${allSlides(l)[i]?.title ?? b.slide}”).*`
  }
  if (b.kind === 'figure') {
    const f = 'slide' in b ? allSlides(l).find((s) => s.id === b.slide)?.figure : b.figure
    if (!f) return ''
    const img = figurePath ? `![${f.caption.replace(/[[\]]/g, '')}](${figurePath(f.id)})\n\n` : ''
    return `${img}**Figure: ${f.caption}**\n\n*Figure ${f.id}. Text alternative:* ${f.alt}`
  }
  return blockMarkdown(b)
}

/** The week's student handout: every session's lesson sections, with sources. */
export function lessonMarkdown(week: number, lectures: Lecture[], figurePath?: (id: string) => string): string {
  const out = [`# Week ${week} — student lesson`, '']
  if (lectures.some((l) => l.fixture)) out.push('> **FIXTURE — not course content.** This handout demonstrates the lecture pipeline.', '')
  out.push(`Generated from \`src/content/lectures\` (week ${pad2(week)}); the same source draws the slides.`, '', '## Contents', '')
  for (const l of lectures) for (const s of l.studentLesson) out.push(`- ${s.title}`)
  for (const l of lectures)
    for (const s of l.studentLesson) {
      out.push('', `## ${s.title}`, '', ...s.blocks.map((b) => lessonBlock(b, l, figurePath)).join('\n\n').split('\n'))
      if (s.sources.length) out.push('', '**Sources**', '', cites(s.sources))
    }
  out.push('')
  return out.join('\n')
}
