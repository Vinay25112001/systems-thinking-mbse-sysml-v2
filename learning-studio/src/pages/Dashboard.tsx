import { PARTS, WEEKS } from '../content/course'
import { Link } from '../lib/router'
import { validateStakeholderMap } from '../model/stakeholderValidation'
import { useApp } from '../state/AppState'
import { fraction, weekProgress } from '../state/progress'
import { STATUS_LABEL, statusOfWeek } from '../state/weekStatus'
import { WEEK_CONTENT } from '../content/weeks'
import { Badge, Card, PageHeader, ProgressBar } from '../components/ui'
import { usePersistentState } from '../lib/usePersistentState'
import { loadJSON } from '../lib/storage'

/** "Start here": the course welcome, shown until the viewer dismisses it (WEEK1_LEARNING_DESIGN §3). */
function StartHere() {
  const [dismissed, setDismissed] = usePersistentState<boolean>('welcome-dismissed', false)
  if (dismissed) return null
  const seen = loadJSON<boolean>('welcome-seen', false)
  return (
    <Card className="border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3" data-testid="start-here">
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Start here</h2>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            {seen ? 'You have read the course welcome. Week 1 opens with its Overview: the question, your prediction and the plan for the week.' : 'New to the course? Read the five-minute course welcome first: what systems thinking and MBSE are, the AeroLink case, the 14-week map and how a week works.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/welcome" className={`rounded-md px-3 py-1.5 text-sm font-medium ${seen ? 'border border-slate-300 hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800' : 'bg-brand-600 text-white hover:bg-brand-700'}`}>
            Course welcome
          </Link>
          <Link to="/week/1" className={`rounded-md px-3 py-1.5 text-sm font-medium ${seen ? 'bg-brand-600 text-white hover:bg-brand-700' : 'border border-slate-300 hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800'}`}>
            Week 1 Overview
          </Link>
          <button type="button" onClick={() => setDismissed(true)} className="rounded-md px-2 py-1.5 text-sm text-slate-700 underline dark:text-slate-300">
            Dismiss
          </button>
        </div>
      </div>
    </Card>
  )
}

export function Dashboard() {
  const { completed, quiz, boundary, map, reviews } = useApp()
  const w1 = weekProgress(1, completed, quiz, boundary)
  const all = WEEKS.map((w) => weekProgress(w.number, completed, quiz, boundary))
  const overall = { done: all.reduce((a, p) => a + p.done, 0), total: all.reduce((a, p) => a + p.total, 0) }
  const checks = validateStakeholderMap(map.stakeholders, map.relationships)
  const passed = checks.filter((c) => c.passed).length
  const reviewed = Object.values(reviews).filter((r) => r.status !== 'pending').length
  const authored = Object.keys(WEEK_CONTENT).length
  const complete = WEEKS.filter((w) => statusOfWeek(w.number) === 'complete').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Systems Thinking and MBSE with SysML v2"
        subtitle="An integrated 14-week graduate course built around one continuous engineering case: AeroLink Urban Mobility, a fictional urban air-taxi enterprise. You will move from an ambiguous enterprise problem to a traceable SysML v2 model and defend your decisions in a technical review."
      />

      <StartHere />

      <Card className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
        <h2 className="font-semibold text-amber-900 dark:text-amber-200">Prototype status — read before you start</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900 dark:text-amber-100">
          <li>The 14-week outline is approved for building this app; lesson content, grading and technical accuracy are pending faculty review.</li>
          <li>{authored} of 14 weeks have an authored module; {complete} meet every definition-of-done check, including independent content review. Weeks without a module show their approved outline only.</li>
          <li>All AeroLink numbers are FICTIONAL teaching parameters. A SysML listing is marked validated only if the reference implementation accepted exactly the text shown.</li>
          <li>Your progress is stored only in this browser.</li>
        </ul>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="font-semibold">Continue</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Week 1 — Systems, systems thinking and the engineered enterprise</p>
          <div className="mt-3">
            <ProgressBar value={fraction(w1)} label="Week 1 progress" />
          </div>
          <Link to="/week/1" className="mt-4 inline-block rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700">
            Open Week 1
          </Link>
        </Card>
        <Card>
          <h2 className="font-semibold">Stakeholder ecosystem map</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {map.stakeholders.length} stakeholders · {map.relationships.length} relationships
          </p>
          <p className="mt-2 text-sm">
            Acceptance checks passed: <strong>{passed} / {checks.length}</strong>
          </p>
          <Link to="/workspace/stakeholders" className="mt-4 inline-block rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
            Open the editor
          </Link>
        </Card>
        <Card>
          <h2 className="font-semibold">Course progress</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Measured only on activities that exist today.</p>
          <div className="mt-3 space-y-2">
            <ProgressBar value={fraction(overall)} label={`Authored content (${overall.done}/${overall.total} activities)`} />
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Reviewer decisions recorded in this browser: {reviewed}</p>
          <Link to="/progress" className="mt-3 inline-block text-sm text-brand-600 underline dark:text-brand-100">
            Details
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(['ST', 'MBSE'] as const).map((p) => (
          <Card key={p}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">{PARTS[p].title}</h2>
              <Badge>{PARTS[p].weeks}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{PARTS[p].summary}</p>
            <ol className="mt-3 space-y-1 text-sm">
              {WEEKS.filter((w) => w.part === p).map((w) => (
                <li key={w.number} className="flex items-center justify-between gap-2">
                  <Link to={`/week/${w.number}`} className="hover:underline">
                    Week {w.number}: {w.title}
                  </Link>
                  {(() => { const s = statusOfWeek(w.number); return <Badge tone={s === 'complete' ? 'emerald' : s === 'in-development' ? 'amber' : 'slate'}>{STATUS_LABEL[s]}</Badge> })()}
                </li>
              ))}
            </ol>
          </Card>
        ))}
      </div>
    </div>
  )
}
