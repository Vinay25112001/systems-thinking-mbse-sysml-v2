// Curriculum export: renders the course content modules (the same data the app shows) as Markdown documents,
// in a student edition and an instructor edition. Run with `npm run export:curriculum` (scripts/export-curriculum.mjs).
// Nothing here is re-typed: objectives, readings, rubrics and week modules are the app's own sources.
// The schedule is the authoritative one (COURSE_SCHEDULE.md, DECISION_LOG A19): weekNN.md follows it, and Weeks 2–14 are
// provisional outlines while they are rebuilt. The earlier reviewed draft modules are exported separately as
// draft-weekNN.md, under their earlier-outline numbers and titles, clearly labeled as archive material.
import { FACULTY_DECISIONS, modelsLabel, PARTS, WEEKS, type WeekOutline } from '../content/course'
import { DRAFT_WEEKS } from '../content/draftWeeks'
import { formatCitation, type Citation } from '../content/readings'
import { getRubric, RATING_SCALE } from '../content/rubrics'
import { lessonWordCount, weekChecks, workloadTotal, type LessonBlock, type WeekContent } from '../content/schema'
import { CURRENT_CONTENT, REBUILT_IN_PLACE, draftContent } from '../content/weeks'
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

function objectives(w: WeekOutline): string {
  return table(['ID', 'Objective', 'Bloom', 'CLO'], w.objectives.map((o) => [o.id, o.text, o.bloom === 'Analyse' ? 'Analyze' : o.bloom, o.clo.join(', ')]))
}

function quiz(c: WeekContent, edition: Edition): string {
  const out: string[] = []
  c.quiz.forEach((q, i) => {
    out.push(`**Q${i + 1}** (${q.bloom}; ${q.objective}) ${q.prompt}`, '')
    for (const o of q.options) out.push(`- ${o.id}) ${o.text}${edition === 'instructor' && o.correct ? ' **← correct**' : ''}`)
    out.push('')
    if (edition === 'instructor') {
      for (const o of q.options) out.push(`  - *${o.id}:* ${o.explanation}`)
      out.push(`  - *Source:* ${q.cite ? cite(q.cite) : `course convention (${q.courseSource ?? 'unstated'})`}`, '')
    }
  })
  return out.join('\n')
}

const readingsSection = (w: WeekOutline): string[] => [
  '## Readings',
  '',
  '**Essential**',
  '',
  ...w.readings.map((r) => `- ${cite(r)}`),
  '',
  '**Extension (expected of graduate students)**',
  '',
  ...(w.extension.length ? w.extension.map((r) => `- ${cite(r)}`) : ['- None assigned yet.']),
  '',
]

const pad = (n: number) => String(n).padStart(2, '0')

export function renderWeek(n: number, edition: Edition): string {
  const w = WEEKS.find((x) => x.number === n)!
  const c = CURRENT_CONTENT[n]
  const status = w.status === 'template' ? 'Design template week; draft pending faculty review' : 'Provisional: this week is being rebuilt from the Week 1 template'
  const out: string[] = [`# Week ${n} — ${w.title}`, '', `*${PARTS[w.part].title}. ${status}. All AeroLink figures are fictional teaching values.*`, '']
  out.push(`**Team output:** ${w.output}`, '')
  if (w.due) out.push(`**Due this week:** ${w.due}`, '')
  const models = modelsLabel(w)
  if (models) out.push(`**Continuity:** this week models the Phase I artifacts of ${models}.`, '')
  out.push(`## Learning objectives${c ? '' : ' (provisional)'}`, '', objectives(w), '')
  out.push(...readingsSection(w))
  if (!c) {
    out.push(
      '## Status',
      '',
      'Provisional outline: this week is being rebuilt from the Week 1 template (COURSE_SCHEDULE.md, DECISION_LOG A19).',
      '',
      `- Topics: ${w.topics.join('; ')}`,
      `- Lab / practice: ${w.lab}`,
      `- Assessment: ${w.assessment}`,
      `- Graduate task: ${w.graduateTask}`,
      '',
    )
    out.push('## Earlier reviewed draft material', '', ...w.draftSources.map((d) => `- [Old Week ${d.week}: ${DRAFT_WEEKS[d.week - 1].title}](draft-week${pad(d.week)}.md) (${d.scope})`), '')
    return out.join('\n')
  }
  return out.join('\n') + '\n' + renderModule(n, w, c, edition, 'live')
}

/** An earlier reviewed draft module (archive), under its earlier-outline number and title. */
export function renderDraft(n: number, edition: Edition): string {
  const w = DRAFT_WEEKS[n - 1]
  const c = draftContent(n)
  const users = WEEKS.filter((x) => x.draftSources.some((d) => d.week === n))
  const out: string[] = [
    `# Earlier draft, old Week ${n} — ${w.title}`,
    '',
    `*ARCHIVE: earlier reviewed draft material written for the superseded provisional outline. It is not a current week; it is kept unchanged for re-use when the new weeks are rebuilt. Re-used by: ${users.map((u) => `Week ${u.number} (${u.title})`).join('; ') || 'none'}.*`,
    '',
  ]
  if (REBUILT_IN_PLACE.has(n)) {
    // rebuild review F07: the earlier objective IDs (B1.1–B1.4) meant other things, so they are prefixed "old-"; the earlier
    // lab and graduate task (an explorer and a memo) are not repeated, because they are no longer assigned
    out.push('## Learning objectives (earlier outline, superseded)', '', objectives({ ...w, objectives: w.objectives.map((o) => ({ ...o, id: `old-${o.id}` })) }), '')
    out.push('## Status', '', `This earlier module was rebuilt in place as the current Week ${n} (2026-10-18). Its reviewed text is in the repository history, and its reusable blocks are kept in the Week ${n} content. The earlier lab and graduate task are no longer assigned.`, '')
    return out.join('\n')
  }
  out.push('## Learning objectives (earlier outline)', '', objectives(w), '')
  out.push(...readingsSection(w))
  if (!c) {
    out.push('## Status', '', 'This earlier week had an outline but no written module.', '', `- Lab: ${w.lab}`, `- Assessment: ${w.assessment}`, `- Graduate task: ${w.graduateTask}`, '')
    return out.join('\n')
  }
  return out.join('\n') + '\n' + renderModule(n, w, c, edition, 'draft')
}

function renderModule(n: number, w: WeekOutline, c: WeekContent, edition: Edition, kind: 'live' | 'draft'): string {
  const out: string[] = []
  out.push('## Driving question', '', c.drivingQuestion, '', '## Lesson', '')
  for (const b of c.blocks) {
    out.push(block(b, edition))
    for (const a of c.activities.filter((x) => x.inBlock === b.id)) {
      out.push(`> **Interactive activity — ${a.title}** (in the Learning Studio, ${kind === 'draft' ? `earlier draft, old Week ${n}` : `Week ${n}`}). ${a.purpose}`, '>', ...a.instructions.map((s, i) => `> ${i + 1}. ${s}`), '')
    }
  }
  const l = c.lab
  out.push(`## Laboratory ${l.id} — ${l.title}`, '', `${l.setting === 'team' ? 'Team' : 'Individual'} lab, ${l.durationMinutes} min in class; objectives ${l.objectives.join(', ')}.`, '')
  out.push('**Inputs:** ' + l.inputs.join('; ') + '.', '', '**Steps**', '', ...l.steps.map((s, i) => `${i + 1}. **${s.title}.** ${s.detail}`), '')
  out.push(table(['ID prefix', 'Artifact', 'Minimum'], l.artefacts.map((a) => [a.idPrefix, a.description, a.minimum])), '', `**Continuity:** ${l.continuity}`, '')
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
  out.push('## Estimated workload', '', table(['Activity', 'Hours'], [...c.workload.map((x) => [x.optional ? `${x.activity} (optional, not counted)` : x.activity, String(x.hours)]), ['**Total**', String(workloadTotal(c.workload))]]), '')
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
    'Integrated 14-week graduate course, Wright State University (proposal). Schedule: COURSE_SCHEDULE.md (faculty direction of 2026-10-18; DECISION_LOG A19). Each team develops and models its own instructor-approved enterprise; AeroLink Urban Mobility (fictional) is the instructor’s worked example. Generated from the Learning Studio content modules; draft pending faculty review.',
    '',
  ]
  for (const p of ['ST', 'MBSE'] as const) {
    out.push(`## ${PARTS[p].title} (${PARTS[p].weeks})`, '', PARTS[p].summary, '')
    const rows = WEEKS.filter((w) => w.part === p).map((w) => [String(w.number), `[${w.title}](week${pad(w.number)}.md)`, w.output, w.lab, w.due ?? '', w.assessment, CURRENT_CONTENT[w.number] ? 'authored' : 'provisional: being rebuilt'])
    out.push(table(['Week', 'Subject', 'Team output', 'Lab / practice', 'Due', 'Assessment', 'Module'], rows), '')
  }
  out.push('## Open faculty decisions', '', ...FACULTY_DECISIONS.map((d) => `- **${d.topic}.** ${d.detail}`), '')
  const archived = DRAFT_WEEKS.filter((w) => edition === 'instructor' || !REBUILT_IN_PLACE.has(w.number))
  out.push('## Earlier reviewed draft material (archive)', '', 'Written for the superseded provisional outline and kept unchanged for re-use.', '', ...archived.map((w) => `- [Old Week ${w.number}: ${w.title}](draft-week${pad(w.number)}.md)`), '')
  return out.join('\n')
}

/** All export files for one edition, keyed by relative path. */
export function exportEdition(edition: Edition): Record<string, string> {
  const files: Record<string, string> = { 'README.md': renderIndex(edition) }
  for (const w of WEEKS) files[`week${pad(w.number)}.md`] = renderWeek(w.number, edition)
  // rebuild review F07: the student edition leaves out an earlier week that was rebuilt in place (old Week 1)
  for (const w of DRAFT_WEEKS) if (edition === 'instructor' || !REBUILT_IN_PLACE.has(w.number)) files[`draft-week${pad(w.number)}.md`] = renderDraft(w.number, edition)
  return files
}
