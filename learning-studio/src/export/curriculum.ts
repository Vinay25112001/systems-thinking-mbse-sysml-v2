// Curriculum export: renders the course content modules (the same data the app shows) as Markdown documents,
// in a student edition and an instructor edition. Run with `npm run export:curriculum` (scripts/export-curriculum.mjs).
// Nothing here is re-typed: objectives, readings, rubrics and week modules are the app's own sources.
import { PARTS, WEEKS, type Week } from '../content/course'
import { formatCitation, type Citation } from '../content/readings'
import { getRubric, RATING_SCALE } from '../content/rubrics'
import { lessonWordCount, weekChecks, type LessonBlock, type WeekContent } from '../content/schema'
import { WEEK_CONTENT } from '../content/weeks'
import { RUBRIC_IDS } from '../content/rubrics'
import { reportEntry, sysmlSource } from '../lib/sysml'

export type Edition = 'student' | 'instructor'

const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ')
const cite = (c: Citation) => formatCitation(c) + (c.note ? ` (${c.note})` : '')

function table(header: string[], rows: string[][]): string {
  return [`| ${header.map(esc).join(' | ')} |`, `|${header.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.map(esc).join(' | ')} |`)].join('\n')
}

function sysmlStatus(file: string, intent: string): string {
  const e = reportEntry(file)
  if (!e) return 'not yet validated by the reference implementation'
  if (intent === 'conformant') return e.status === 'PASS' ? 'accepted by the OMG SysML v2 Pilot Implementation 2026-08 (see validation report for the exact text hash)' : 'REJECTED by the reference implementation'
  return e.status === 'FAIL' ? 'intentionally invalid; rejected by the reference implementation, as expected' : 'expected to be invalid but ACCEPTED — check'
}

function block(b: LessonBlock, edition: Edition): string {
  const out: string[] = [`### ${b.title}`, '']
  if (edition === 'instructor') out.push(`*Section type: ${b.kind}; provenance: ${b.provenance}.*`, '')
  for (const p of b.paragraphs) out.push(p, '')
  if (b.bullets) out.push(...b.bullets.map((x) => `- ${x}`), '')
  if (b.table) out.push(`*${b.table.caption}*`, '', table(b.table.header, b.table.rows), '')
  for (const l of b.sysml ?? []) {
    out.push(`*Listing \`${l.file}\` — ${l.caption} (${sysmlStatus(l.file, l.intent)}).*`, '', '```sysml', (sysmlSource(l.file) ?? '(missing listing)').trimEnd(), '```', '')
  }
  if (b.quote) out.push(`> “${b.quote.text}” — ${cite(b.quote.cite)}`, '')
  if (b.citations.length) out.push(`Sources: ${b.citations.map(cite).join('; ')}.`, '')
  return out.join('\n')
}

function objectives(w: Week): string {
  return table(['ID', 'Objective', 'Bloom', 'CLO'], w.objectives.map((o) => [o.id, o.text, o.bloom, o.clo.join(', ')]))
}

function quiz(c: WeekContent, edition: Edition): string {
  const out: string[] = []
  c.quiz.forEach((q, i) => {
    out.push(`**Q${i + 1}** (${q.bloom}; ${q.objective}) ${q.prompt}`, '')
    for (const o of q.options) out.push(`- ${o.id}) ${o.text}${edition === 'instructor' && o.correct ? ' **← correct**' : ''}`)
    out.push('')
    if (edition === 'instructor') {
      for (const o of q.options) out.push(`  - *${o.id}:* ${o.explanation}`)
      out.push(`  - *Source:* ${cite(q.cite)}`, '')
    }
  })
  return out.join('\n')
}

export function renderWeek(n: number, edition: Edition): string {
  const w = WEEKS.find((x) => x.number === n)!
  const c = WEEK_CONTENT[n]
  const out: string[] = [`# Week ${n} — ${w.title}`, '', `*${PARTS[w.part].title}. Draft pending faculty review. All AeroLink figures are fictional teaching values.*`, '']
  out.push('## Learning objectives', '', objectives(w), '')
  out.push('## Readings', '', '**Essential**', '', ...w.readings.map((r) => `- ${cite(r)}`), '', '**Extension (expected of graduate students)**', '', ...w.extension.map((r) => `- ${cite(r)}`), '')
  if (!c) {
    out.push('## Status', '', 'Outline only: the full module for this week has not been written yet.', '', `- Lab: ${w.lab}`, `- Assessment: ${w.assessment}`, `- Graduate task: ${w.graduateTask}`, '')
    return out.join('\n')
  }
  out.push('## Driving question', '', c.drivingQuestion, '', '## Lesson', '')
  for (const b of c.blocks) {
    out.push(block(b, edition))
    for (const a of c.activities.filter((x) => x.inBlock === b.id)) {
      out.push(`> **Interactive activity — ${a.title}** (in the Learning Studio, Week ${n}). ${a.purpose}`, '>', ...a.instructions.map((s, i) => `> ${i + 1}. ${s}`), '')
    }
  }
  const l = c.lab
  out.push(`## Laboratory ${l.id} — ${l.title}`, '', `${l.setting === 'team' ? 'Team' : 'Individual'} lab, ${l.durationMinutes} min in class; objectives ${l.objectives.join(', ')}.`, '')
  out.push('**Inputs:** ' + l.inputs.join('; ') + '.', '', '**Steps**', '', ...l.steps.map((s, i) => `${i + 1}. **${s.title}.** ${s.detail}`), '')
  out.push(table(['ID prefix', 'Artefact', 'Minimum'], l.artefacts.map((a) => [a.idPrefix, a.description, a.minimum])), '', `**Continuity:** ${l.continuity}`, '')
  out.push('## Knowledge check', '', quiz(c, edition))
  const a = c.assignment
  out.push(`## Assignment — ${a.title}`, '', `${a.mode === 'team' ? 'Team' : 'Individual'}; due ${a.due}; ${a.weight}. Objectives ${a.objectives.join(', ')}.`, '', ...a.instructions.map((s, i) => `${i + 1}. ${s}`), '')
  out.push('**Deliverable template**', '', table(['Heading', 'Guidance'], a.template.map((t) => [t.heading, t.guidance])), '', `**AI use:** ${a.aiUse}`, '')
  out.push('**Grading**', '', a.rubricScope, '', `Scale: ${RATING_SCALE.map((s) => `${s.level} ${s.name}`).join(' · ')}; level 3 is the attainment threshold.`, '')
  for (const id of a.rubrics) {
    const r = getRubric(id)
    out.push(`#### ${r.id} ${r.title}`, '')
    for (const p of r.parts) out.push(p.type === 'text' ? p.text : table(p.header, p.rows), '')
  }
  out.push('## Estimated workload', '', table(['Activity', 'Hours'], [...c.workload.map((x) => [x.activity, String(x.hours)]), ['**Total**', String(c.workload.reduce((s, x) => s + x.hours, 0))]]), '')
  if (c.references.length) out.push('## Further references', '', ...c.references.map((r) => `- ${cite(r)}`), '')
  if (edition === 'instructor') {
    const nts = c.instructorNotes
    out.push('## Instructor notes', '')
    for (const s of nts.sessions) out.push(`**${s.title} (${s.minutes} min)**`, '', table(['Segment', 'Min', 'Notes'], s.segments.map((g) => [g.label, String(g.minutes), g.notes])), '')
    out.push('**Misconceptions**', '', ...nts.misconceptions.map((m) => `- *${m.claim}* ${m.correction}${m.cite ? ` (${cite(m.cite)})` : ''}`), '')
    out.push('**Facilitation**', '', ...nts.facilitation.map((x) => `- ${x}`), '', '**Answer key and model answers**', '', ...nts.answerKey.map((x) => `- ${x}`), '')
    if (nts.cautions.length) out.push('**Cautions**', '', ...nts.cautions.map((x) => `- ${x}`), '')
    const checks = weekChecks(c, w.objectives.map((o) => o.id), RUBRIC_IDS, new Set(c.activities.map((x) => x.component)))
    out.push('**Definition-of-done record** (activity registration is checked in the app and test suite)', '', table(['Check', 'Result'], checks.map((k) => [k.label, `${k.ok ? 'pass' : 'FAIL'}${k.detail ? ` (${k.detail})` : ''}`])), '')
    out.push(`Lesson length: ${lessonWordCount(c)} words. Content review: ${c.review.status}${c.review.reviewer ? `, ${c.review.reviewer}, ${c.review.date}, ${c.review.report}` : ''}.`, '')
  }
  return out.join('\n')
}

export function renderIndex(edition: Edition): string {
  const out = [
    `# Systems Thinking and Model-Based Systems Engineering with SysML v2 — ${edition === 'instructor' ? 'Instructor' : 'Student'} edition`,
    '',
    'Integrated 14-week graduate course, Wright State University (proposal). Continuous case: AeroLink Urban Mobility (fictional). Generated from the Learning Studio content modules; draft pending faculty review.',
    '',
  ]
  for (const p of ['ST', 'MBSE'] as const) {
    out.push(`## ${PARTS[p].title} (${PARTS[p].weeks})`, '', PARTS[p].summary, '')
    out.push(table(['Week', 'Title', 'Lab', 'Due', 'Assessment', 'Module'], WEEKS.filter((w) => w.part === p).map((w) => [String(w.number), `[${w.title}](week${String(w.number).padStart(2, '0')}.md)`, w.lab, w.due ?? '', w.assessment, WEEK_CONTENT[w.number] ? 'authored' : 'outline only'])), '')
  }
  return out.join('\n')
}

/** All export files for one edition, keyed by relative path. */
export function exportEdition(edition: Edition): Record<string, string> {
  const files: Record<string, string> = { 'README.md': renderIndex(edition) }
  for (const w of WEEKS) files[`week${String(w.number).padStart(2, '0')}.md`] = renderWeek(w.number, edition)
  return files
}
