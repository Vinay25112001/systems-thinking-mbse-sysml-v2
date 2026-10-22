import type { ReactNode } from 'react'
import { modelsLabel, PARTS, weekByNumber, WEEKS, type Week, type WeekOutline } from '../content/course'
import { DRAFT_WEEKS, draftWeekByNumber } from '../content/draftWeeks'
import type { ActivitySpec, LessonBlock, WeekContent } from '../content/schema'
import { workloadTotal } from '../content/schema'
import { draftContent, REBUILT_IN_PLACE, weekContent } from '../content/weeks'
import { getRubric, RATING_SCALE } from '../content/rubrics'
import { labReviewId } from '../content/reviewIds'
import { ACTIVITY_REGISTRY } from '../activities/registry'
import { Link } from '../lib/router'
import { hasLecture } from '../content/lectures'
import { LectureEntry } from '../lectures/LectureEntry'
import { useApp } from '../state/AppState'
import { fraction, weekProgress } from '../state/progress'
import { checksForDraft, checksForWeek, STATUS_LABEL, statusOfWeek } from '../state/weekStatus'
import { Badge, Button, Card, Citations, CitationText, PageHeader, ProgressBar, ProvenanceBadge, ReviewBadge, ReviewControls } from '../components/ui'
import { Quiz } from '../components/Quiz'
import { SysmlListingView } from '../components/SysmlListing'
import { AssessmentBanks } from '../components/AssessmentBanks'

const KIND_LABEL: Record<LessonBlock['kind'], string> = {
  outcomes: 'Outcomes',
  intuition: 'Intuition',
  concept: 'Formal concept',
  'worked-example': 'Worked example',
  advanced: 'Advanced analysis',
  application: 'Industry & aerospace application',
  lab: 'Laboratory',
  deliverable: 'Deliverable',
}

const partTitle = (w: WeekOutline) => PARTS[w.part].title
/** Bloom levels are stored with the register's spelling; shown in American English. */
const bloomLabel = (b: string) => (b === 'Analyse' ? 'Analyze' : b)

function WeekNav({ n }: { n: number }) {
  return (
    <nav aria-label="Week navigation" className="mt-8 flex justify-between text-sm">
      {n > 1 ? <Link to={`/week/${n - 1}`} className="text-brand-600 underline dark:text-brand-100">← Week {n - 1}</Link> : <span />}
      {n < WEEKS.length ? <Link to={`/week/${n + 1}`} className="text-brand-600 underline dark:text-brand-100">Week {n + 1} →</Link> : <span />}
    </nav>
  )
}

function StatusBadge({ n }: { n: number }) {
  const s = statusOfWeek(n)
  return <Badge tone={s === 'complete' ? 'emerald' : s === 'in-development' ? 'amber' : 'slate'}>{STATUS_LABEL[s]}</Badge>
}

export function Objectives({ w }: { w: WeekOutline }) {
  return (
    <ul className="space-y-1 text-sm">
      {w.objectives.map((o) => (
        <li key={o.id} className="flex flex-wrap items-baseline gap-2">
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{o.id}</span>
          <span>{o.text}</span>
          <Badge>{bloomLabel(o.bloom)}</Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400">{o.clo.join(', ')}</span>
        </li>
      ))}
    </ul>
  )
}

export function Readings({ w }: { w: WeekOutline }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h3 className="text-sm font-semibold">Essential (verified start pages)</h3>
        <ul className="mt-1 space-y-1">
          {w.readings.map((c, i) => (
            <li key={i}>
              <CitationText c={c} />
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold">Extension (expected of graduate students)</h3>
        <ul className="mt-1 space-y-1">
          {w.extension.map((c, i) => (
            <li key={i}>
              <CitationText c={c} />
            </li>
          ))}
          {w.extension.length === 0 && <li className="text-sm text-slate-500 dark:text-slate-400">None assigned yet.</li>}
        </ul>
      </div>
    </div>
  )
}

/** An earlier-outline week that never had a module (old Week 14): its outline, shown in the draft archive. */
function OutlineWeek({ w }: { w: WeekOutline }) {
  return (
    <div className="space-y-4">
      <PageHeader title={draftTitle(w)} subtitle="Earlier provisional outline (superseded)">
        <Badge>Outline only</Badge>
      </PageHeader>
      <DraftBanner w={w} />
      <Card className="border-slate-300 bg-slate-100 dark:bg-slate-900">
        <p className="text-sm">
          This earlier week had an outline but no written module. Its objectives come from the weekly instructional plan and every reading is a verified reference.
        </p>
      </Card>
      <Card>
        <h2 className="font-semibold">Learning objectives</h2>
        <div className="mt-2">
          <Objectives w={w} />
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold">Topics</h2>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {w.topics.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Card>
      <Card>
        <h2 className="font-semibold">Readings</h2>
        <div className="mt-2">
          <Readings w={w} />
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold">Lab, deliverables and assessment</h2>
        <dl className="mt-2 grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-slate-500 dark:text-slate-400">Lab</dt>
          <dd>{w.lab}</dd>
          {w.due && (
            <>
              <dt className="text-slate-500 dark:text-slate-400">Due</dt>
              <dd>{w.due}</dd>
            </>
          )}
          <dt className="text-slate-500 dark:text-slate-400">Assessment</dt>
          <dd>{w.assessment}</dd>
          <dt className="text-slate-500 dark:text-slate-400">Graduate task</dt>
          <dd>{w.graduateTask}</dd>
        </dl>
        <ReviewControls id={`week-${w.number}-outline`} label={`Earlier outline, old Week ${w.number}`} />
      </Card>
      <DraftNav n={w.number} />
    </div>
  )
}

// ------------------------------------------------------------------------------------------- earlier draft archive
// The reviewed draft modules were written for the earlier outline (draftWeeks.ts). They are preserved unedited and served
// under #/draft/<oldWeek> with this banner, so none of them appears under a current week title (DECISION_LOG A19).

const draftTitle = (w: WeekOutline) => `Earlier draft, old Week ${w.number}: ${w.title}`

/** Current weeks that re-use an earlier week's material (COURSE_SCHEDULE.md reuse table). */
const reusedBy = (oldWeek: number) => WEEKS.filter((w) => w.draftSources.some((d) => d.week === oldWeek))

function DraftBanner({ w }: { w: WeekOutline }) {
  const users = reusedBy(w.number)
  return (
    <Card className="border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30">
      <div role="note" data-testid="draft-banner" className="text-sm text-amber-950 dark:text-amber-100">
        <p className="font-semibold">Archive: earlier reviewed draft material, not a current week.</p>
        <p className="mt-1">
          This page was written as Week {w.number} of the earlier provisional outline. The authoritative schedule (COURSE_SCHEDULE.md, faculty direction of
          2026-10-18) has replaced that outline. The material is kept unchanged so it can be re-used when the new weeks are rebuilt; it is not assigned work.
        </p>
        {users.length > 0 && (
          <p className="mt-1">
            Re-used by:{' '}
            {users.map((u, i) => (
              <span key={u.number}>
                {i > 0 && '; '}
                <Link to={`/week/${u.number}`} className="underline">
                  Week {u.number}: {u.title}
                </Link>{' '}
                ({u.draftSources.filter((d) => d.week === w.number).map((d) => d.scope).join('; ')})
              </span>
            ))}
            .
          </p>
        )}
      </div>
    </Card>
  )
}

function DraftNav({ n }: { n: number }) {
  return (
    <nav aria-label="Draft archive navigation" className="mt-8 flex justify-between text-sm">
      {n > 1 ? <Link to={`/draft/${n - 1}`} className="text-brand-600 underline dark:text-brand-100">← Earlier draft, old Week {n - 1}</Link> : <span />}
      {n < DRAFT_WEEKS.length ? <Link to={`/draft/${n + 1}`} className="text-brand-600 underline dark:text-brand-100">Earlier draft, old Week {n + 1} →</Link> : <span />}
    </nav>
  )
}

// ------------------------------------------------------------------------------------------- weeks being rebuilt
/** A current week that is being rebuilt from the Week 1 template: its new outline and links to the earlier draft material. */
function RebuildWeek({ w }: { w: Week }) {
  const models = modelsLabel(w)
  return (
    <div className="space-y-4">
      <PageHeader title={`Week ${w.number}: ${w.title}`} subtitle={partTitle(w)}>
        <Badge tone="amber">Provisional: being rebuilt</Badge>
      </PageHeader>
      <Card className="border-slate-300 bg-slate-100 dark:bg-slate-900">
        <p className="text-sm" data-testid="rebuild-notice">
          This week is being rebuilt from the Week 1 template, following the authoritative course schedule (COURSE_SCHEDULE.md, faculty direction of 2026-10-18).
          Below is its new outline. The objectives are provisional drafts; every reading is a verified reference re-used from the earlier weeks listed at the end.
        </p>
      </Card>
      <Card>
        <h2 className="font-semibold">Team output</h2>
        <p className="mt-1 text-sm" data-testid="team-output">
          {w.output}
        </p>
        {w.due && (
          <p className="mt-2 text-sm">
            <strong>Due this week:</strong> {w.due}
          </p>
        )}
        {models && (
          <p className="mt-2 text-sm" data-testid="continuity">
            <strong>Continuity:</strong> this week models the Phase I artifacts of {models}:{' '}
            {w.models!.map((m, i) => (
              <span key={m}>
                {i > 0 && '; '}
                <Link to={`/week/${m}`} className="text-brand-600 underline dark:text-brand-100">
                  Week {m}: {weekByNumber(m)!.title}
                </Link>
              </span>
            ))}
            .
          </p>
        )}
      </Card>
      <Card>
        <h2 className="font-semibold">Learning objectives (provisional)</h2>
        <div className="mt-2">
          <Objectives w={w} />
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold">Topics</h2>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {w.topics.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Card>
      <Card>
        <h2 className="font-semibold">Readings</h2>
        <div className="mt-2">
          <Readings w={w} />
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold">Lab and assessment</h2>
        <dl className="mt-2 grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-slate-500 dark:text-slate-400">Lab / practice</dt>
          <dd>{w.lab}</dd>
          <dt className="text-slate-500 dark:text-slate-400">Assessment</dt>
          <dd>{w.assessment}</dd>
          <dt className="text-slate-500 dark:text-slate-400">Graduate task</dt>
          <dd>{w.graduateTask}</dd>
        </dl>
        <ReviewControls id={`week-${w.number}-schedule`} label={`Week ${w.number} outline (A19 schedule)`} />
      </Card>
      <Card>
        <h2 className="font-semibold">Earlier reviewed draft material</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Written for the earlier outline and independently reviewed; it will be re-used when this week is rebuilt. Each link opens the labeled archive.</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm" data-testid="draft-links">
          {w.draftSources.map((d) => (
            <li key={`${d.week}-${d.scope}`}>
              <Link to={`/draft/${d.week}`} className="text-brand-600 underline dark:text-brand-100">
                Old Week {d.week}: {draftWeekByNumber(d.week)!.title}
              </Link>{' '}
              <span className="text-slate-600 dark:text-slate-400">({d.scope})</span>
            </li>
          ))}
        </ul>
      </Card>
      <WeekNav n={w.number} />
    </div>
  )
}

export function Block({ b, children }: { b: LessonBlock; children?: ReactNode }) {
  const { completed, toggleCompleted, instructor } = useApp()
  const done = !!completed[b.id]
  return (
    <Card>
      <article aria-labelledby={`h-${b.id}`} data-testid={`block-${b.id}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge tone="sky">{KIND_LABEL[b.kind]}</Badge>
            <h2 id={`h-${b.id}`} className="text-lg font-semibold">
              {b.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {instructor && <ProvenanceBadge value={b.provenance} />}
            {instructor && <ReviewBadge id={b.id} />}
            <Button variant={done ? 'secondary' : 'ghost'} onClick={() => toggleCompleted(b.id)} ariaLabel={`${done ? 'Mark not complete' : 'Mark complete'}: ${b.title}`}>
              {done ? '✓ Completed' : 'Mark complete'}
            </Button>
          </div>
        </div>
        <div className="mt-3 space-y-3 leading-relaxed">
          {b.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {b.bullets && (
            <ul className="list-disc space-y-1 pl-5">
              {b.bullets.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          )}
          {b.table && <DataTable caption={b.table.caption} header={b.table.header} rows={b.table.rows} />}
          {b.sysml?.map((l) => <SysmlListingView key={l.file} listing={l} />)}
          {b.quote && (
            <blockquote className="border-l-4 border-brand-500 pl-3 text-sm italic">
              “{b.quote.text}”
              <footer className="not-italic">
                <CitationText c={b.quote.cite} />
              </footer>
            </blockquote>
          )}
        </div>
        {children && <div className="mt-4">{children}</div>}
        <Citations items={b.citations} />
        <ReviewControls id={b.id} label={b.title} />
      </article>
    </Card>
  )
}

export function DataTable({ caption, header, rows }: { caption: string; header: string[]; rows: string[][] }) {
  // a wide table scrolls inside its own frame, which must be keyboard-focusable (axe scrollable-region-focusable)
  return (
    <div className="overflow-x-auto" tabIndex={0} role="group" aria-label={caption}>
      <table className="w-full text-left text-sm">
        <caption className="mb-1 text-left text-xs font-medium text-slate-600 dark:text-slate-400">{caption}</caption>
        <thead>
          <tr className="border-b border-slate-300 dark:border-slate-700">
            {header.map((h) => (
              <th key={h} scope="col" className="px-2 py-1 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-slate-100 align-top dark:border-slate-800">
              {r.map((c, j) => (
                <td key={j} className="px-2 py-1">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Activity({ a }: { a: ActivitySpec }) {
  const C = ACTIVITY_REGISTRY[a.component]
  return (
    <section aria-labelledby={`act-${a.id}`} className="mt-2 rounded-lg border border-sky-200 bg-sky-50/40 p-3 dark:border-sky-900 dark:bg-sky-950/20" data-testid={`activity-${a.id}`}>
      <h3 id={`act-${a.id}`} className="font-semibold">
        Interactive activity: {a.title}
      </h3>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{a.purpose}</p>
      <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-sm">
        {a.instructions.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <div className="mt-3">{C ? <C /> : <p role="alert" className="text-sm text-rose-700">Activity component “{a.component}” is not registered.</p>}</div>
    </section>
  )
}

export function LabPanel({ c }: { c: WeekContent }) {
  const l = c.lab
  return (
    <Card>
      <section aria-labelledby="lab-h" data-testid="lab-panel">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="violet">Air Taxi Enterprise lab</Badge>
          <h2 id="lab-h" className="text-lg font-semibold">
            {l.id} — {l.title}
          </h2>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {l.setting === 'team' ? 'Team lab' : 'Individual lab'} · {l.durationMinutes} min in class · objectives {l.objectives.join(', ')}
        </p>
        <h3 className="mt-3 text-sm font-semibold">Inputs</h3>
        <ul className="list-disc pl-5 text-sm">
          {l.inputs.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <h3 className="mt-3 text-sm font-semibold">Steps</h3>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {l.steps.map((s) => (
            <li key={s.title}>
              <strong>{s.title}.</strong> {s.detail}
            </li>
          ))}
        </ol>
        <div className="mt-3">
          <DataTable caption="Artefacts produced (stable IDs carry through the course)" header={['ID prefix', 'Artefact', 'Minimum']} rows={l.artefacts.map((a) => [a.idPrefix, a.description, a.minimum])} />
        </div>
        <p className="mt-3 text-sm">
          <strong>Continuity:</strong> {l.continuity}
        </p>
        {l.tools.length > 0 && (
          <p className="mt-2 flex flex-wrap gap-3 text-sm">
            {l.tools.map((t) => (
              <Link key={t.to} to={t.to} className="text-brand-600 underline dark:text-brand-100">
                {t.label}
              </Link>
            ))}
          </p>
        )}
        <ReviewControls id={labReviewId(c)} label={`${l.id} lab`} />
      </section>
    </Card>
  )
}

function RubricView({ id }: { id: string }) {
  const r = getRubric(id)
  return (
    <details className="rounded border border-slate-200 p-2 dark:border-slate-800">
      <summary className="cursor-pointer text-sm font-medium">
        {r.id} {r.title}
      </summary>
      <div className="mt-2 space-y-2 text-sm">
        {r.parts.map((p, i) => (p.type === 'text' ? <p key={i}>{p.text}</p> : <DataTable key={i} caption={`${r.id} criteria`} header={p.header} rows={p.rows} />))}
      </div>
    </details>
  )
}

export function AssignmentPanel({ c }: { c: WeekContent }) {
  const a = c.assignment
  return (
    <Card>
      <section aria-labelledby="asg-h" data-testid="assignment-panel">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="amber">Assignment</Badge>
          <h2 id="asg-h" className="text-lg font-semibold">
            {a.title}
          </h2>
        </div>
        <dl className="mt-2 grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-slate-500 dark:text-slate-400">Mode</dt>
          <dd>{a.mode === 'team' ? 'Team' : 'Individual'}</dd>
          <dt className="text-slate-500 dark:text-slate-400">Due</dt>
          <dd>{a.due}</dd>
          <dt className="text-slate-500 dark:text-slate-400">Weight</dt>
          <dd>{a.weight}</dd>
          <dt className="text-slate-500 dark:text-slate-400">Objectives</dt>
          <dd>{a.objectives.join(', ')}</dd>
        </dl>
        <h3 className="mt-3 text-sm font-semibold">Instructions</h3>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {a.instructions.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <h3 className="mt-3 text-sm font-semibold">Deliverable template</h3>
        <DataTable caption="Complete every heading" header={['Heading', 'Guidance']} rows={a.template.map((t) => [t.heading, t.guidance])} />
        <p className="mt-3 text-sm">
          <strong>AI use:</strong> {a.aiUse}
        </p>
        <h3 className="mt-3 text-sm font-semibold">Grading rubric</h3>
        <p className="text-sm">{a.rubricScope}</p>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Scale: {RATING_SCALE.map((s) => `${s.level} ${s.name}`).join(' · ')}. Level 3 is the attainment threshold.
        </p>
        <div className="mt-2 space-y-2">
          {a.rubrics.map((id) => (
            <RubricView key={id} id={id} />
          ))}
        </div>
        <ReviewControls id={`w${c.week}-assignment`} label={a.title} />
      </section>
    </Card>
  )
}

export function WorkloadPanel({ c }: { c: WeekContent }) {
  const total = workloadTotal(c.workload)
  return (
    <Card>
      <h2 className="text-lg font-semibold">Estimated student workload</h2>
      <div className="mt-2">
        <DataTable caption={`Total ≈ ${total} h this week (estimate; validated by the Weeks 1–4 time-log pilot, FD-22)`} header={['Activity', 'Hours']} rows={c.workload.map((w) => [w.optional ? `${w.activity} (optional, not counted)` : w.activity, String(w.hours)])} />
      </div>
      {c.references.length > 0 && (
        <>
          <h3 className="mt-3 text-sm font-semibold">Further references</h3>
          <ul className="space-y-1">
            {c.references.map((r, i) => (
              <li key={i}>
                <CitationText c={r} />
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  )
}

export function InstructorPanel({ c, draft = false }: { c: WeekContent; draft?: boolean }) {
  const n = c.instructorNotes
  const checks = (draft ? checksForDraft(c.week) : checksForWeek(c.week)) ?? []
  return (
    <Card className="border-amber-300 dark:border-amber-800">
      <section aria-labelledby="inotes-h" data-testid="instructor-notes">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="amber">Instructor only</Badge>
          <h2 id="inotes-h" className="text-lg font-semibold">
            Teaching notes
          </h2>
        </div>
        {n.sessions.map((s) => (
          <div key={s.title} className="mt-3">
            <DataTable caption={`${s.title} (${s.minutes} min)`} header={['Segment', 'Min', 'Notes']} rows={s.segments.map((g) => [g.label, String(g.minutes), g.notes])} />
          </div>
        ))}
        <h3 className="mt-3 text-sm font-semibold">Misconceptions to target</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {n.misconceptions.map((m) => (
            <li key={m.claim}>
              <strong>{m.claim}</strong> {m.correction} {m.cite && <CitationText c={m.cite} />}
            </li>
          ))}
        </ul>
        <h3 className="mt-3 text-sm font-semibold">Facilitation</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {n.facilitation.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <h3 className="mt-3 text-sm font-semibold">Answer key and model answers</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {n.answerKey.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        {n.cautions.length > 0 && (
          <>
            <h3 className="mt-3 text-sm font-semibold">Cautions</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {n.cautions.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </>
        )}
        <AssessmentBanks week={c.week} />
        <h3 className="mt-4 text-sm font-semibold">Definition-of-done checks</h3>
        <ul className="mt-1 space-y-0.5 text-sm" data-testid="dod-checks">
          {checks.map((k) => (
            <li key={k.id}>
              <span aria-hidden="true">{k.ok ? '✓' : '✗'}</span> <span className="sr-only">{k.ok ? 'Pass' : 'Fail'}:</span> {k.label}
              {k.detail ? <span className="text-xs text-slate-500 dark:text-slate-400"> — {k.detail}</span> : null}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          Content review: {c.review.status}
          {c.review.reviewer ? ` by ${c.review.reviewer}` : ''}
          {c.review.date ? ` on ${c.review.date}` : ''}
          {c.review.report ? ` (report: ${c.review.report})` : ''}. Faculty review is recorded with the review controls on each section.
        </p>
      </section>
    </Card>
  )
}

function AuthoredWeek({ w, c, draft = false }: { w: WeekOutline; c: WeekContent; draft?: boolean }) {
  const { completed, quiz, boundary, instructor } = useApp()
  const p = weekProgress(w.number, completed, quiz, boundary)
  const actsByBlock = (id: string) => c.activities.filter((a) => a.inBlock === id)
  return (
    <div className="space-y-5">
      {draft ? (
        <>
          <PageHeader title={draftTitle(w)} subtitle="Earlier reviewed draft material (archive)">
            <Badge tone="amber">Archive</Badge>
          </PageHeader>
          <DraftBanner w={w} />
        </>
      ) : (
        <PageHeader title={`Week ${w.number} — ${w.title}`} subtitle={`${partTitle(w)} · draft pending faculty review`}>
          <div className="flex w-72 flex-col items-end gap-2">
            <StatusBadge n={w.number} />
            <ProgressBar value={fraction(p)} label={`Week ${w.number}: ${p.done}/${p.total} activities`} />
          </div>
        </PageHeader>
      )}
      <Card className="border-brand-500/40 bg-brand-50 dark:bg-slate-900">
        <h2 className="font-semibold">Driving question</h2>
        <p className="mt-1">{c.drivingQuestion}</p>
      </Card>
      {c.blocks.map((b) => (
          <Block key={b.id} b={b}>
            {b.kind === 'outcomes' && (
              <>
                <h3 className="text-sm font-semibold">Objectives</h3>
                <div className="mt-1">
                  <Objectives w={w} />
                </div>
                <h3 className="mt-3 text-sm font-semibold">Readings</h3>
                <div className="mt-1">
                  <Readings w={w} />
                </div>
              </>
            )}
            {actsByBlock(b.id).map((a) => (
              <Activity key={a.id} a={a} />
            ))}
          </Block>
        ))}
      <LabPanel c={c} />
      <Card>
        <h2 className="text-lg font-semibold">Knowledge check</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Formative. Every option has an explanation; each question cites its source.</p>
        <div className="mt-3">
          <Quiz questions={c.quiz} bloomText={c.week === 1 ? bloomLabel : undefined} />
        </div>
      </Card>
      <AssignmentPanel c={c} />
      <WorkloadPanel c={c} />
      {instructor && <InstructorPanel c={c} draft={draft} />}
      {draft ? <DraftNav n={w.number} /> : <WeekNav n={w.number} />}
    </div>
  )
}

export function WeekPage({ n }: { n: number }) {
  const w = weekByNumber(n)
  if (!w) {
    return (
      <p>
        There is no Week {n}. <Link to="/roadmap" className="underline">Open the roadmap</Link>.
      </p>
    )
  }
  const c = weekContent(n)
  const page = c ? <AuthoredWeek w={w} c={c} /> : <RebuildWeek w={w} />
  if (!hasLecture(n)) return page
  // lecture-first entry point (DECISION_LOG A20), above the unchanged week page
  return (
    <>
      <div className="mb-4">
        <LectureEntry week={n} />
      </div>
      {page}
    </>
  )
}

/** #/draft/<oldWeek>: an earlier reviewed draft module (or, for old Week 14, its outline), with the archive banner. */
export function DraftWeekPage({ n }: { n: number }) {
  const w = draftWeekByNumber(n)
  if (!w) {
    return (
      <p>
        There is no earlier draft Week {n}. <Link to="/roadmap" className="underline">Open the roadmap</Link>.
      </p>
    )
  }
  if (REBUILT_IN_PLACE.has(n)) return <RebuiltInPlace w={w} />
  const c = draftContent(n)
  return c ? <AuthoredWeek w={w} c={c} draft /> : <OutlineWeek w={w} />
}

/** An earlier week that was rebuilt in place as a current week (old Week 1 → Week 1). Its earlier objectives reused the
 *  IDs B1.1–B1.4 with other meanings and its earlier graduate task (an explorer and a memo) no longer exists, so the
 *  archive page shows neither (rebuild review F07); the earlier text stays in the repository history. */
function RebuiltInPlace({ w }: { w: WeekOutline }) {
  return (
    <div className="space-y-4">
      <PageHeader title={draftTitle(w)} subtitle="Earlier provisional outline (superseded)">
        <Badge>Rebuilt in place</Badge>
      </PageHeader>
      <DraftBanner w={w} />
      <Card className="border-slate-300 bg-slate-100 dark:bg-slate-900">
        <p className="text-sm" data-testid="rebuilt-in-place">
          This earlier week was rebuilt in place as the current Week {w.number}. Its reusable reviewed text now appears in{' '}
          <Link to={`/week/${w.number}`} className="underline">
            Week {w.number}
          </Link>
          ; the earlier objectives, lab and graduate task are no longer assigned, and the earlier version is kept in the repository history.
        </p>
      </Card>
      <DraftNav n={w.number} />
    </div>
  )
}
