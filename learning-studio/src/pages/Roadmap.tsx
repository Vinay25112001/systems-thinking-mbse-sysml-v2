import { FACULTY_DECISIONS, modelsLabel, PARTS, WEEKS } from '../content/course'
import { Link } from '../lib/router'
import { Badge, Card, PageHeader, ReviewControls } from '../components/ui'
import { STATUS_LABEL, statusOfWeek } from '../state/weekStatus'

/** The two team outputs that close each phase (COURSE_SCHEDULE.md). */
const OUTPUTS = WEEKS.filter((w) => w.due)

export function Roadmap() {
  return (
    <div>
      <PageHeader
        title="Course roadmap — 14 weeks"
        subtitle="The authoritative schedule set by faculty on 2026-10-18 (COURSE_SCHEDULE.md). Each team develops its own instructor-approved enterprise: Phase I builds its Systems Thinking Engineering Package; Phase II turns that package into a SysML v2 enterprise model. AeroLink is the instructor’s worked example in every week."
      />
      <Card className="mb-6">
        <h2 className="font-semibold">Team outputs</h2>
        <ol className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          {OUTPUTS.map((w) => (
            <li key={w.number} className="rounded-md border border-slate-200 p-2 dark:border-slate-800">
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                Week {w.number} · {PARTS[w.part].title}
              </span>
              {w.due}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Week 1 is the design template; Weeks 2–14 are provisional and are being rebuilt from it, re-using the earlier reviewed draft material. Every Phase II week
          names the Phase I artifact it models. “Complete draft” means every definition-of-done check passes, including independent content review; faculty review is
          separate.
        </p>
        <h3 className="mt-3 text-sm font-semibold">Open faculty decisions</h3>
        <ul className="mt-1 list-disc pl-5 text-xs text-slate-600 dark:text-slate-400" data-testid="faculty-decisions">
          {FACULTY_DECISIONS.map((d) => (
            <li key={d.topic}>
              <strong>{d.topic}.</strong> {d.detail}
            </li>
          ))}
        </ul>
      </Card>
      {(['ST', 'MBSE'] as const).map((p) => (
        <section key={p} className="mb-8" aria-labelledby={`part-${p}`}>
          <h2 id={`part-${p}`} className="text-lg font-semibold">
            {PARTS[p].title} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({PARTS[p].weeks})</span>
          </h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {WEEKS.filter((w) => w.part === p).map((w) => (
              <Card key={w.number}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">
                    <Link to={`/week/${w.number}`} className="hover:underline">
                      Week {w.number}: {w.title}
                    </Link>
                  </h3>
                  {(() => { const s = statusOfWeek(w.number); return <Badge tone={s === 'complete' ? 'emerald' : s === 'in-development' ? 'amber' : 'slate'}>{STATUS_LABEL[s]}</Badge> })()}
                </div>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 dark:text-slate-300">
                  {w.topics.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <dl className="mt-3 grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-xs">
                  <dt className="text-slate-500 dark:text-slate-400">Team output</dt>
                  <dd>{w.output}</dd>
                  {modelsLabel(w) && (
                    <>
                      <dt className="text-slate-500 dark:text-slate-400">Models</dt>
                      <dd>{modelsLabel(w)}</dd>
                    </>
                  )}
                  <dt className="text-slate-500 dark:text-slate-400">Lab</dt>
                  <dd>{w.lab}</dd>
                  {w.due && (
                    <>
                      <dt className="text-slate-500 dark:text-slate-400">Due</dt>
                      <dd className="font-medium">{w.due}</dd>
                    </>
                  )}
                  <dt className="text-slate-500 dark:text-slate-400">Assessment</dt>
                  <dd>{w.assessment}</dd>
                  <dt className="text-slate-500 dark:text-slate-400">Readings</dt>
                  <dd>
                    {w.readings.length} essential (verified), {w.extension.length} extension
                  </dd>
                </dl>
                <ReviewControls id={`week-${w.number}-schedule`} label={`Week ${w.number} outline (A19 schedule)`} />
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
