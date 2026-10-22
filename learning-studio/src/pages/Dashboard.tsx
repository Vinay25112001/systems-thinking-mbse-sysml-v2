import { FACULTY_DECISIONS, PARTS, WEEKS } from '../content/course'
import { deckShipped } from '../lectures/decks'
import { Link } from '../lib/router'
import { validateStakeholderMap } from '../model/stakeholderValidation'
import { useApp } from '../state/AppState'
import { fraction, weekProgress } from '../state/progress'
import { STATUS_LABEL, statusOfWeek } from '../state/weekStatus'
import { CURRENT_CONTENT } from '../content/weeks'
import { Badge, Card, PageHeader, ProgressBar } from '../components/ui'
import { usePersistentState } from '../lib/usePersistentState'
import { loadJSON } from '../lib/storage'
import { hasLecture, lecturesOfWeek } from '../content/lectures'
import { lectureStem } from '../content/lectures/text'
import { lessonPath, pptxHref, viewerPath } from '../lectures/route'
import { WEEK1_PATHS } from '../week1/route'
import { WEEK2_PATHS } from '../week2/route'
// --- week03 ---
import { WEEK3_PATHS } from '../week3/route'
// --- end week03 ---
// --- week04 ---
import { WEEK4_PATHS } from '../week4/route'
import { WEEK5_PATHS } from '../week5/route'
// --- end week04 ---
// --- week06 ---
import { WEEK6_PATHS } from '../week6/route'
// --- end week06 ---
// --- week07 ---
import { WEEK7_PATHS } from '../week7/route'
// --- end week07 ---
import { WEEK8_PATHS } from '../week8/route'
// --- week09 ---
import { WEEK9_PATHS } from '../week9/route'
// --- end week09 ---
// --- week10 ---
import { WEEK10_PATHS } from '../week10/route'
// --- end week10 ---
// --- week11 ---
import { WEEK11_PATHS } from '../week11/route'
// --- end week11 ---

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
            {seen ? 'You have read the course welcome. Week 1 opens with its week page: the lecture slides, the detailed lesson, the worked examples, the laboratory and the assessment, in that order.' : 'New to the course? Read the five-minute course welcome first: what systems thinking and MBSE are, the AeroLink case, the 14-week map and how a week works.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/welcome" className={`rounded-md px-3 py-1.5 text-sm font-medium ${seen ? 'border border-slate-300 hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800' : 'bg-brand-600 text-white hover:bg-brand-700'}`}>
            Course welcome
          </Link>
          <Link to="/week/1" className={`rounded-md px-3 py-1.5 text-sm font-medium ${seen ? 'bg-brand-600 text-white hover:bg-brand-700' : 'border border-slate-300 hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800'}`}>
            Week 1
          </Link>
          <button type="button" onClick={() => setDismissed(true)} className="rounded-md px-2 py-1.5 text-sm text-slate-700 underline dark:text-slate-300">
            Dismiss
          </button>
        </div>
      </div>
    </Card>
  )
}

/** The lecture-first path of the current week (DECISION_LOG A20): the order a student works through Week 1. */
function Week1PathCard() {
  const lectures = lecturesOfWeek(1)
  const btn = 'rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
  const steps: { label: string; detail: string; to: string }[] = [
    { label: 'Week page', detail: 'objectives, schedule, readings, deliverables, workload', to: WEEK1_PATHS.home },
    ...lectures.map((l) => ({ label: `Lecture, Session ${l.session}`, detail: `${l.title} (slides)`, to: viewerPath(1, l.session) })),
    { label: 'Detailed lesson', detail: 'the full explanation behind the slides', to: lessonPath(1) },
    { label: 'Worked examples', detail: 'the AeroLink case, step by step', to: WEEK1_PATHS.examples },
    { label: 'Engineering laboratory', detail: 'Lab L1, your team’s own Team Record', to: WEEK1_PATHS.lab },
    { label: 'Assessment and submission', detail: 'readiness quiz Q1 and record readiness', to: WEEK1_PATHS.assessment },
  ]
  return (
    <Card>
      <div data-testid="week1-path-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">This week: Week 1 — {WEEKS[0].title}</h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">A lecture-first week: the instructor teaches in two 75-minute sessions, then your team applies the method in the laboratory. Work through it in this order.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {lectures.filter((l) => deckShipped(lectureStem(l))).map((l) => (
              <a key={l.session} href={pptxHref(lectureStem(l))} download className={btn}>
                Download Session {l.session} .pptx
              </a>
            ))}
          </div>
        </div>
        <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.to} className="flex gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-100" aria-hidden>
                {i + 1}
              </span>
              <span>
                <Link to={s.to} className="font-medium text-brand-700 underline dark:text-brand-100">
                  {s.label}
                </Link>
                <span className="text-slate-600 dark:text-slate-400"> · {s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  )
}

/** Week 2 on the same lecture-first template (DECISION_LOG A21): available, pending faculty review. */
function Week2PathCard() {
  const lectures = lecturesOfWeek(2)
  const btn = 'rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
  const steps: { label: string; detail: string; to: string }[] = [
    { label: 'Week page', detail: 'objectives, schedule, readings, deliverables, workload', to: WEEK2_PATHS.home },
    ...lectures.map((l) => ({ label: `Lecture, Session ${l.session}`, detail: `${l.subtitle?.replace(/^Session \d: /, '') ?? l.title} (slides)`, to: viewerPath(2, l.session) })),
    { label: 'Detailed lesson', detail: 'the full explanation behind the slides', to: lessonPath(2) },
    { label: 'Worked examples', detail: 'the AeroLink ConOps, scenarios and requirements, step by step', to: WEEK2_PATHS.examples },
    { label: 'Engineering laboratory', detail: 'Lab L2, extending your team’s Week 1 record', to: WEEK2_PATHS.lab },
    { label: 'Assessment and submission', detail: 'readiness quiz Q2 and record readiness', to: WEEK2_PATHS.assessment },
  ]
  return (
    <Card>
      <div data-testid="week2-path-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">
              Week 2 — {WEEKS[1].title} <Badge tone="emerald">Available</Badge>
            </h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">On the same lecture-first template as Week 1, pending faculty review. Your team extends its Week 1 Team Record with a ConOps, scenarios, capabilities, requirements and measures.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {lectures.filter((l) => deckShipped(lectureStem(l))).map((l) => (
              <a key={l.session} href={pptxHref(lectureStem(l))} download className={btn}>
                Download Week 2 Session {l.session} .pptx
              </a>
            ))}
          </div>
        </div>
        <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.to} className="flex gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-100" aria-hidden>
                {i + 1}
              </span>
              <span>
                <Link to={s.to} className="font-medium text-brand-700 underline dark:text-brand-100">
                  {s.label}
                </Link>
                <span className="text-slate-600 dark:text-slate-400"> · {s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  )
}

// --- week03 ---
/** Week 3 on the same lecture-first template (DECISION_LOG A21): available, pending faculty review. The earlier Week 3
 *  page stays in the archive (/archive/week/3). */
function Week3PathCard() {
  const lectures = lecturesOfWeek(3)
  const btn = 'rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
  const steps: { label: string; detail: string; to: string }[] = [
    { label: 'Week page', detail: 'objectives, schedule, readings, deliverables, workload', to: WEEK3_PATHS.home },
    ...lectures.map((l) => ({ label: `Lecture, Session ${l.session}`, detail: `${l.subtitle?.replace(/^Session \d: /, '') ?? l.title} (slides)`, to: viewerPath(3, l.session) })),
    { label: 'Detailed lesson', detail: 'the full explanation behind the slides', to: lessonPath(3) },
    { label: 'Worked examples', detail: 'the AeroLink readiness, register, TPMs and trade study, step by step', to: WEEK3_PATHS.examples },
    { label: 'Engineering laboratory', detail: 'Lab L3, extending your team’s Week 2 record', to: WEEK3_PATHS.lab },
    { label: 'Assessment and submission', detail: 'readiness quiz Q3 and record readiness', to: WEEK3_PATHS.assessment },
  ]
  return (
    <Card>
      <div data-testid="week3-path-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">
              Week 3 — {WEEKS[2].title} <Badge tone="emerald">Available (pending review)</Badge>
            </h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">On the same lecture-first template, pending faculty review. Your team adds a technology readiness assessment, a risk register with security and resilience risks, technical performance measures and a trade study with a justified decision.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {lectures.filter((l) => deckShipped(lectureStem(l))).map((l) => (
              <a key={l.session} href={pptxHref(lectureStem(l))} download className={btn}>
                Download Week 3 Session {l.session} .pptx
              </a>
            ))}
          </div>
        </div>
        <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.to} className="flex gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-100" aria-hidden>
                {i + 1}
              </span>
              <span>
                <Link to={s.to} className="font-medium text-brand-700 underline dark:text-brand-100">
                  {s.label}
                </Link>
                <span className="text-slate-600 dark:text-slate-400"> · {s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  )
}
// --- end week03 ---

// --- week04 ---
/** Week 4 on the same lecture-first template (DECISION_LOG A21): available, pending faculty review. The earlier Week 4
 *  page stays in the archive (/archive/week/4). */
function Week4PathCard() {
  const lectures = lecturesOfWeek(4)
  const btn = 'rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
  const steps: { label: string; detail: string; to: string }[] = [
    { label: 'Week page', detail: 'objectives, schedule, readings, deliverables, workload', to: WEEK4_PATHS.home },
    ...lectures.map((l) => ({ label: `Lecture, Session ${l.session}`, detail: `${l.subtitle?.replace(/^Session \d: /, '') ?? l.title} (slides)`, to: viewerPath(4, l.session) })),
    { label: 'Detailed lesson', detail: 'the full explanation behind the slides', to: lessonPath(4) },
    { label: 'Worked examples', detail: 'the AeroLink views, functions, allocation and information view, step by step', to: WEEK4_PATHS.examples },
    { label: 'Engineering laboratory', detail: 'Lab L4, extending your team’s Week 3 record', to: WEEK4_PATHS.lab },
    { label: 'Assessment and submission', detail: 'readiness quiz Q4 and record readiness', to: WEEK4_PATHS.assessment },
  ]
  return (
    <Card>
      <div data-testid="week4-path-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">
              Week 4 — {WEEKS[3].title} <Badge tone="emerald">Available (pending review)</Badge>
            </h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">On the same lecture-first template, pending faculty review. Your team adds its architecture description: viewpoints chosen from concerns, functions found by walking its scenarios, an allocation with stated reasons, an architecture decision and an information view traced to decisions.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {lectures.filter((l) => deckShipped(lectureStem(l))).map((l) => (
              <a key={l.session} href={pptxHref(lectureStem(l))} download className={btn}>
                Download Week 4 Session {l.session} .pptx
              </a>
            ))}
          </div>
        </div>
        <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.to} className="flex gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-100" aria-hidden>
                {i + 1}
              </span>
              <span>
                <Link to={s.to} className="font-medium text-brand-700 underline dark:text-brand-100">
                  {s.label}
                </Link>
                <span className="text-slate-600 dark:text-slate-400"> · {s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  )
}
// --- end week04 ---
// --- week05 ---
/** Week 5 on the same lecture-first template (DECISION_LOG A21): available, pending faculty review. The earlier Week 5
 *  page stays in the archive (/archive/week/5). */
function Week5PathCard() {
  const lectures = lecturesOfWeek(5)
  const btn = 'rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
  const steps: { label: string; detail: string; to: string }[] = [
    { label: 'Week page', detail: 'objectives, schedule, readings, deliverables, workload', to: WEEK5_PATHS.home },
    ...lectures.map((l) => ({ label: `Lecture, Session ${l.session}`, detail: `${l.subtitle?.replace(/^Session \d: /, '') ?? l.title} (slides)`, to: viewerPath(5, l.session) })),
    { label: 'Detailed lesson', detail: 'the full explanation behind the slides', to: lessonPath(5) },
    { label: 'Worked examples', detail: 'the AeroLink breakdown, N², interface definitions, security reading and audit, step by step', to: WEEK5_PATHS.examples },
    { label: 'Engineering laboratory', detail: 'Lab L5, extending your team’s Week 4 record', to: WEEK5_PATHS.lab },
    { label: 'Assessment and submission', detail: 'readiness quiz Q5 and record readiness', to: WEEK5_PATHS.assessment },
  ]
  return (
    <Card>
      <div data-testid="week5-path-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">
              Week 5 — {WEEKS[4].title} <Badge tone="emerald">Available (pending review)</Badge>
            </h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">On the same lecture-first template, pending faculty review. Your team breaks its architecture into components and defines every interface: an N² chart checked against its functional flows, an interface table with owners, protection and degraded modes, interface requirements and one change traced through the chart.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {lectures.filter((l) => deckShipped(lectureStem(l))).map((l) => (
              <a key={l.session} href={pptxHref(lectureStem(l))} download className={btn}>
                Download Week 5 Session {l.session} .pptx
              </a>
            ))}
          </div>
        </div>
        <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.to} className="flex gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-100" aria-hidden>
                {i + 1}
              </span>
              <span>
                <Link to={s.to} className="font-medium text-brand-700 underline dark:text-brand-100">
                  {s.label}
                </Link>
                <span className="text-slate-600 dark:text-slate-400"> · {s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  )
}
// --- end week05 ---

// --- week06 ---
/** Week 6 on the same lecture-first template (DECISION_LOG A21, A24): available, pending faculty review. The earlier Week 6
 *  page stays in the archive (/archive/week/6). */
function Week6PathCard() {
  const lectures = lecturesOfWeek(6)
  const btn = 'rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
  const steps: { label: string; detail: string; to: string }[] = [
    { label: 'Week page', detail: 'objectives, schedule, readings, deliverables, workload', to: WEEK6_PATHS.home },
    ...lectures.map((l) => ({ label: `Lecture, Session ${l.session}`, detail: `${l.subtitle?.replace(/^Session \d: /, '') ?? l.title} (slides)`, to: viewerPath(6, l.session) })),
    { label: 'Detailed lesson', detail: 'the full explanation behind the slides', to: lessonPath(6) },
    { label: 'Worked examples', detail: 'the AeroLink gaps, technology plan, increments, security and resilience, impact and baseline review, step by step', to: WEEK6_PATHS.examples },
    { label: 'Engineering laboratory', detail: 'Lab L6, extending your team’s Week 5 record', to: WEEK6_PATHS.lab },
    { label: 'Assessment and submission', detail: 'readiness quiz Q6 and record readiness', to: WEEK6_PATHS.assessment },
  ]
  return (
    <Card>
      <div data-testid="week6-path-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">
              Week 6 — {WEEKS[5].title} <Badge tone="emerald">Available (pending review)</Badge>
            </h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">On the same lecture-first template, pending faculty review. Your team plans how its enterprise evolves: capability gaps over three horizons, a technology plan with insertion points, increments with observable triggers, off-ramps and transitions that keep the service running, the security and resilience change of each, the known unknowns, and the Phase I baseline review for Week 7.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {lectures.filter((l) => deckShipped(lectureStem(l))).map((l) => (
              <a key={l.session} href={pptxHref(lectureStem(l))} download className={btn}>
                Download Week 6 Session {l.session} .pptx
              </a>
            ))}
          </div>
        </div>
        <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.to} className="flex gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-100" aria-hidden>
                {i + 1}
              </span>
              <span>
                <Link to={s.to} className="font-medium text-brand-700 underline dark:text-brand-100">
                  {s.label}
                </Link>
                <span className="text-slate-600 dark:text-slate-400"> · {s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  )
}
// --- end week06 ---

// --- week07 ---
/** Week 7, the Phase I review week, on the same lecture-first template (DECISION_LOG A21 decision 7, A24): available,
 *  pending faculty review. The earlier Week 7 page stays in the archive (/archive/week/7). */
function Week7PathCard() {
  const lectures = lecturesOfWeek(7)
  const btn = 'rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
  const steps: { label: string; detail: string; to: string }[] = [
    { label: 'Week page', detail: 'objectives, schedule, readings, deliverables, workload', to: WEEK7_PATHS.home },
    ...lectures.map((l) => ({ label: `Lecture, Session ${l.session}`, detail: `${l.subtitle?.replace(/^Session \d: /, '') ?? l.title} (slides)`, to: viewerPath(7, l.session) })),
    { label: 'Detailed lesson', detail: 'the full explanation behind the slides', to: lessonPath(7) },
    { label: 'Worked examples', detail: 'the AeroLink package, its audit and its review findings, step by step', to: WEEK7_PATHS.examples },
    { label: 'Engineering laboratory', detail: 'Lab L7, your Systems Thinking Engineering Package and the design review', to: WEEK7_PATHS.lab },
    { label: 'Assessment and submission', detail: 'the design-review rubric, the RID form and package readiness', to: WEEK7_PATHS.assessment },
  ]
  return (
    <Card>
      <div data-testid="week7-path-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">
              Week 7 — {WEEKS[6].title} <Badge tone="emerald">Available (pending review)</Badge>
            </h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">The end of Phase I, on the same lecture-first template, pending faculty review. Your team assembles its six weekly exports into one Systems Thinking Engineering Package, audits it for consistency and traceability, dispositions every gap, and presents and defends it in the Phase I design review.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {lectures.filter((l) => deckShipped(lectureStem(l))).map((l) => (
              <a key={l.session} href={pptxHref(lectureStem(l))} download className={btn}>
                Download Week 7 Session {l.session} .pptx
              </a>
            ))}
          </div>
        </div>
        <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.to} className="flex gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-100" aria-hidden>
                {i + 1}
              </span>
              <span>
                <Link to={s.to} className="font-medium text-brand-700 underline dark:text-brand-100">
                  {s.label}
                </Link>
                <span className="text-slate-600 dark:text-slate-400"> · {s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  )
}
// --- end week07 ---

// --- week08 ---
/** Week 8, the Phase II opener, on the same lecture-first template (DECISION_LOG A21): available, pending faculty
 *  review. The earlier Week 8 page stays in the archive (/archive/week/8). */
function Week8PathCard() {
  const lectures = lecturesOfWeek(8)
  const btn = 'rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
  const steps: { label: string; detail: string; to: string }[] = [
    { label: 'Week page', detail: 'objectives, schedule, readings, deliverables, workload', to: WEEK8_PATHS.home },
    ...lectures.map((l) => ({ label: `Lecture, Session ${l.session}`, detail: `${l.subtitle?.replace(/^Session \d: /, '') ?? l.title} (slides)`, to: viewerPath(8, l.session) })),
    { label: 'Detailed lesson', detail: 'the full explanation behind the slides', to: lessonPath(8) },
    { label: 'Worked examples', detail: 'the AeroLink import, step by step', to: WEEK8_PATHS.examples },
    { label: 'Engineering laboratory', detail: 'Lab L8, model v0.1 of your team’s enterprise', to: WEEK8_PATHS.lab },
    { label: 'Assessment and submission', detail: 'readiness quiz Q8 and the applied exercise', to: WEEK8_PATHS.assessment },
  ]
  return (
    <Card>
      <div data-testid="week8-path-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">
              Week 8 — {WEEKS[7].title} <Badge tone="emerald">Available</Badge>
            </h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">Phase II begins, on the same lecture-first template, pending faculty review: an introduction to MBSE and the SysML v2 language, then your team imports its Systems Thinking package into a SysML v2 model and models its stakeholders and concerns.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {lectures.filter((l) => deckShipped(lectureStem(l))).map((l) => (
              <a key={l.session} href={pptxHref(lectureStem(l))} download className={btn}>
                Download Week 8 Session {l.session} .pptx
              </a>
            ))}
          </div>
        </div>
        <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.to} className="flex gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-100" aria-hidden>
                {i + 1}
              </span>
              <span>
                <Link to={s.to} className="font-medium text-brand-700 underline dark:text-brand-100">
                  {s.label}
                </Link>
                <span className="text-slate-600 dark:text-slate-400"> · {s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  )
}
// --- end week08 ---

// --- week09 ---
/** Week 9 on the same lecture-first template (DECISION_LOG A21, A24): available, pending faculty review. The earlier
 *  Week 9 page stays in the archive (/archive/week/9). */
function Week9PathCard() {
  const lectures = lecturesOfWeek(9)
  const btn = 'rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
  const steps: { label: string; detail: string; to: string }[] = [
    { label: 'Week page', detail: 'objectives, schedule, readings, deliverables, workload', to: WEEK9_PATHS.home },
    ...lectures.map((l) => ({ label: `Lecture, Session ${l.session}`, detail: `${l.subtitle?.replace(/^Session \d: /, '') ?? l.title} (slides)`, to: viewerPath(9, l.session) })),
    { label: 'Detailed lesson', detail: 'the full explanation behind the slides', to: lessonPath(9) },
    { label: 'Worked examples', detail: 'AeroLink’s needs and requirements, step by step', to: WEEK9_PATHS.examples },
    { label: 'Engineering laboratory', detail: 'Lab L9, model v0.2 of your team’s enterprise', to: WEEK9_PATHS.lab },
    { label: 'Assessment and submission', detail: 'readiness quiz Q9 and the applied exercise', to: WEEK9_PATHS.assessment },
  ]
  return (
    <Card>
      <div data-testid="week9-path-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">
              Week 9 — {WEEKS[8].title} <Badge tone="emerald">Available</Badge>
            </h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">On the same lecture-first template, pending faculty review: requirements as SysML v2 model elements, then your team models its Week 1 needs and Week 2 requirements in the model it built in Week 8, with a trace from needs to requirements.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {lectures.filter((l) => deckShipped(lectureStem(l))).map((l) => (
              <a key={l.session} href={pptxHref(lectureStem(l))} download className={btn}>
                Download Week 9 Session {l.session} .pptx
              </a>
            ))}
          </div>
        </div>
        <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.to} className="flex gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-100" aria-hidden>
                {i + 1}
              </span>
              <span>
                <Link to={s.to} className="font-medium text-brand-700 underline dark:text-brand-100">
                  {s.label}
                </Link>
                <span className="text-slate-600 dark:text-slate-400"> · {s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  )
}
// --- end week09 ---

// --- week10 ---
/** Week 10 on the same lecture-first template (DECISION_LOG A21, A24): available, pending faculty review. The earlier
 *  Week 10 page stays in the archive (/archive/week/10). */
function Week10PathCard() {
  const lectures = lecturesOfWeek(10)
  const btn = 'rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
  const steps: { label: string; detail: string; to: string }[] = [
    { label: 'Week page', detail: 'objectives, schedule, readings, deliverables, workload', to: WEEK10_PATHS.home },
    ...lectures.map((l) => ({ label: `Lecture, Session ${l.session}`, detail: `${l.subtitle?.replace(/^Session \d: /, '') ?? l.title} (slides)`, to: viewerPath(10, l.session) })),
    { label: 'Detailed lesson', detail: 'the full explanation behind the slides', to: lessonPath(10) },
    { label: 'Worked examples', detail: 'AeroLink’s logical architecture and behavior, step by step', to: WEEK10_PATHS.examples },
    { label: 'Engineering laboratory', detail: 'Lab L10, model v0.3 of your team’s enterprise', to: WEEK10_PATHS.lab },
    { label: 'Assessment and submission', detail: 'readiness quiz Q10 and the applied exercise', to: WEEK10_PATHS.assessment },
  ]
  return (
    <Card>
      <div data-testid="week10-path-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">
              Week 10 — {WEEKS[9].title} <Badge tone="emerald">Available</Badge>
            </h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">On the same lecture-first template, pending faculty review: the logical architecture and behavior in SysML v2, then your team models its Week 4 functions and logical elements and its Week 2 scenarios in model v0.3.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {lectures.filter((l) => deckShipped(lectureStem(l))).map((l) => (
              <a key={l.session} href={pptxHref(lectureStem(l))} download className={btn}>
                Download Week 10 Session {l.session} .pptx
              </a>
            ))}
          </div>
        </div>
        <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.to} className="flex gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-100" aria-hidden>
                {i + 1}
              </span>
              <span>
                <Link to={s.to} className="font-medium text-brand-700 underline dark:text-brand-100">
                  {s.label}
                </Link>
                <span className="text-slate-600 dark:text-slate-400"> · {s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  )
}
// --- end week10 ---

// --- week11 ---
/** Week 11 on the same lecture-first template (DECISION_LOG A21, A24): available, pending faculty review. The earlier
 *  Week 11 page stays in the archive (/archive/week/11). */
function Week11PathCard() {
  const lectures = lecturesOfWeek(11)
  const btn = 'rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
  const steps: { label: string; detail: string; to: string }[] = [
    { label: 'Week page', detail: 'objectives, schedule, readings, deliverables, workload', to: WEEK11_PATHS.home },
    ...lectures.map((l) => ({ label: `Lecture, Session ${l.session}`, detail: `${l.subtitle?.replace(/^Session \d: /, '') ?? l.title} (slides)`, to: viewerPath(11, l.session) })),
    { label: 'Detailed lesson', detail: 'the full explanation behind the slides', to: lessonPath(11) },
    { label: 'Worked examples', detail: 'AeroLink’s physical architecture and interfaces, step by step', to: WEEK11_PATHS.examples },
    { label: 'Engineering laboratory', detail: 'Lab L11, model v0.4 of your team’s enterprise', to: WEEK11_PATHS.lab },
    { label: 'Assessment and submission', detail: 'readiness quiz Q11 and the applied exercise', to: WEEK11_PATHS.assessment },
  ]
  return (
    <Card>
      <div data-testid="week11-path-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">
              Week 11 — {WEEKS[10].title} <Badge tone="emerald">Available</Badge>
            </h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">On the same lecture-first template, pending faculty review: the physical architecture and interfaces in SysML v2, then your team models its Week 4 physical elements and its Week 5 components and interfaces in model v0.4.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {lectures.filter((l) => deckShipped(lectureStem(l))).map((l) => (
              <a key={l.session} href={pptxHref(lectureStem(l))} download className={btn}>
                Download Week 11 Session {l.session} .pptx
              </a>
            ))}
          </div>
        </div>
        <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.to} className="flex gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-100" aria-hidden>
                {i + 1}
              </span>
              <span>
                <Link to={s.to} className="font-medium text-brand-700 underline dark:text-brand-100">
                  {s.label}
                </Link>
                <span className="text-slate-600 dark:text-slate-400"> · {s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  )
}
// --- end week11 ---


export function Dashboard() {
  const { completed, quiz, boundary, map, reviews } = useApp()
  const w1 = weekProgress(1, completed, quiz, boundary)
  const all = WEEKS.map((w) => weekProgress(w.number, completed, quiz, boundary))
  const overall = { done: all.reduce((a, p) => a + p.done, 0), total: all.reduce((a, p) => a + p.total, 0) }
  const checks = validateStakeholderMap(map.stakeholders, map.relationships)
  const passed = checks.filter((c) => c.passed).length
  const reviewed = Object.values(reviews).filter((r) => r.status !== 'pending').length
  const authored = Object.keys(CURRENT_CONTENT).length
  const complete = WEEKS.filter((w) => statusOfWeek(w.number) === 'complete').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Systems Thinking and MBSE with SysML v2"
        subtitle="An integrated 14-week graduate course. Your team develops its own instructor-approved enterprise: in Phase I (Weeks 1–7) you build its Systems Thinking Engineering Package, and in Phase II (Weeks 8–14) you turn that package into a coherent SysML v2 enterprise model. AeroLink Urban Mobility, a fictional urban air-taxi enterprise, is the instructor’s worked example throughout."
      />

      <StartHere />

      <Week1PathCard />

      <Week2PathCard />

      <Week3PathCard />
      <Week4PathCard />
      <Week5PathCard />
      {/* --- week06 --- */}
      <Week6PathCard />
      {/* --- end week06 --- */}
      {/* --- week07 --- */}
      <Week7PathCard />
      {/* --- end week07 --- */}

      <Week8PathCard />
      {/* --- week09 --- */}
      <Week9PathCard />
      {/* --- end week09 --- */}
      {/* --- week10 --- */}
      <Week10PathCard />
      {/* --- end week10 --- */}
      {/* --- week11 --- */}
      <Week11PathCard />
      {/* --- end week11 --- */}

      <Card className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
        <h2 className="font-semibold text-amber-900 dark:text-amber-200">Prototype status — read before you start</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900 dark:text-amber-100">
          <li>The 14-week schedule follows the faculty whiteboard schedule of 2026-10-18 (COURSE_SCHEDULE.md). Lesson content, grading and technical accuracy are pending faculty review.</li>
          <li>Week 1 is the design template; {authored} of 14 weeks have a live module and {complete} meet every definition-of-done check, including independent content review. Week 2, Week 3, Week 4, Week 5, Week 6, Week 7 (the Phase I review), Week 8 (the Phase II opener) and Week 9 are now available on the same template, pending faculty review; the other weeks are provisional and being rebuilt from it, each showing its new outline and the earlier reviewed draft material it will re-use.</li>
          <li>Open faculty decisions: {FACULTY_DECISIONS.map((d) => d.topic).join('; ')}.</li>
          <li>All AeroLink numbers are FICTIONAL teaching parameters. A SysML listing is marked validated only if the reference implementation accepted exactly the text shown.</li>
          <li>Your progress is stored only in this browser.</li>
        </ul>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="font-semibold">Continue</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Week 1 — {WEEKS[0].title}</p>
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
            <p className="mt-2 text-sm">
              <strong>Team output:</strong> {WEEKS.find((w) => w.number === (p === 'ST' ? 7 : 14))!.due} (Week {p === 'ST' ? 7 : 14})
            </p>
            <ol className="mt-3 space-y-1 text-sm">
              {WEEKS.filter((w) => w.part === p).map((w) => (
                <li key={w.number} className="flex items-center justify-between gap-2">
                  <Link to={`/week/${w.number}`} className="hover:underline">
                    Week {w.number}: {w.title}
                  </Link>
                  {(() => {
                    const s = statusOfWeek(w.number)
                    // a week rebuilt on the lecture-first template is available even before its definition-of-done review
                    if (s === 'outline' && hasLecture(w.number)) return <Badge tone="emerald">Available (pending review)</Badge>
                    return <Badge tone={s === 'complete' ? 'emerald' : s === 'in-development' ? 'amber' : 'slate'}>{STATUS_LABEL[s]}</Badge>
                  })()}
                </li>
              ))}
            </ol>
          </Card>
        ))}
      </div>
    </div>
  )
}
