import { PARTS, WEEKS } from '../content/course'
import { Link } from '../lib/router'
import { Badge, Card, PageHeader, ReviewControls } from '../components/ui'
import { STATUS_LABEL, statusOfWeek } from '../state/weekStatus'

const CHECKPOINTS = [
  { week: 3, name: 'CP1 Problem Definition & ConOps' },
  { week: 6, name: 'CP2 Requirements Baseline (SRR-style review)' },
  { week: 8, name: 'CP3 Trade Study & Architecture Concept' },
  { week: 11, name: 'CP4 SysML v2 Model Baseline (PDR-style RID review)' },
  { week: 14, name: 'CP5 Final Integrated Model & Technical Review' },
]

export function Roadmap() {
  return (
    <div>
      <PageHeader
        title="Course roadmap — 14 weeks"
        subtitle="The approved provisional outline (Pathway B syllabus, revision 1). Part I builds a justified engineering baseline; Part II turns it into a SysML v2 model. The same AeroLink identifiers carry through every week."
      />
      <Card className="mb-6">
        <h2 className="font-semibold">Capstone checkpoints</h2>
        <ol className="mt-2 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-5">
          {CHECKPOINTS.map((c) => (
            <li key={c.name} className="rounded-md border border-slate-200 p-2 dark:border-slate-800">
              <span className="block text-xs text-slate-500 dark:text-slate-400">Week {c.week}</span>
              {c.name}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Structure: Systems Thinking and SE in Weeks 1–7; MBSE with SysML v2 in Weeks 8–14, opening with architecture viewpoints in Week 8 and
          tool-based modelling from Week 9, with read-only SysML micro-labs from Week 5 (DECISION_LOG A3, A7). “Complete draft” means every
          definition-of-done check passes, including independent content review; faculty review is separate.
        </p>
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
                <ReviewControls id={`week-${w.number}-outline`} label={`Week ${w.number} outline`} />
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
