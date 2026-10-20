import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { Link, matchRoute, useRoute } from './lib/router'
import { useApp, type ThemePref } from './state/AppState'
import { WEEKS } from './content/course'
import { hasWorkbench } from './content/missions'
import { week1Route } from './week1/route'
import { week2Route } from './week2/route'
// --- week03 ---
import { week3Route } from './week3/route'
// --- end week03 ---
// --- week04 ---
import { week4Route } from './week4/route'
import { week5Route } from './week5/route'
// --- end week04 ---
// --- week08 ---
import { week8Route } from './week8/route'
// --- end week08 ---
import { lectureRoute } from './lectures/route'
// --- my project (A22) ---
import { projectRoute } from './project/route'
import { MyProjectLink } from './project/nav/MyProjectLink'
// --- end my project ---

// Every route is its own chunk (React.lazy): /week/1 loads the workbench shell and only the Week 1 view it shows,
// not the classic pages, the activity registry of all 14 weeks or the SysML sources.
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Roadmap = lazy(() => import('./pages/Roadmap').then((m) => ({ default: m.Roadmap })))
const WeekPage = lazy(() => import('./pages/WeekPage').then((m) => ({ default: m.WeekPage })))
const DraftWeekPage = lazy(() => import('./pages/WeekPage').then((m) => ({ default: m.DraftWeekPage })))
const StakeholderEditorPage = lazy(() => import('./pages/StakeholderEditorPage').then((m) => ({ default: m.StakeholderEditorPage })))
const CaseStudy = lazy(() => import('./pages/CaseStudy').then((m) => ({ default: m.CaseStudy })))
const ProgressPage = lazy(() => import('./pages/ProgressPage').then((m) => ({ default: m.ProgressPage })))
const InstructorReview = lazy(() => import('./pages/InstructorReview').then((m) => ({ default: m.InstructorReview })))
const SourcesPage = lazy(() => import('./pages/SourcesPage').then((m) => ({ default: m.SourcesPage })))
const ToolchainPage = lazy(() => import('./pages/ToolchainPage').then((m) => ({ default: m.ToolchainPage })))
const ModelWorkspacePage = lazy(() => import('./pages/ModelWorkspacePage').then((m) => ({ default: m.ModelWorkspacePage })))
const WorkbenchShell = lazy(() => import('./workbench/WorkbenchShell'))
// The Week 1 pages (lecture-first path, DECISION_LOG A20) and the course welcome own the full viewport (no classic
// sidebar). The earlier self-study flow (src/flow/WeekFlow) is kept but no longer routed; its routes redirect.
const Week1App = lazy(() => import('./week1/Week1App'))
// Week 2 on the same lecture-first template (DECISION_LOG A21).
const Week2App = lazy(() => import('./week2/Week2App'))
// --- week03 ---
// Week 3 on the same lecture-first template (DECISION_LOG A21).
const Week3App = lazy(() => import('./week3/Week3App'))
// --- end week03 ---
// --- week04 ---
// Week 4 on the same lecture-first template (DECISION_LOG A21).
const Week4App = lazy(() => import('./week4/Week4App'))
// --- end week04 ---
// --- week05 ---
// Week 5 on the same lecture-first template (DECISION_LOG A21).
const Week5App = lazy(() => import('./week5/Week5App'))
// --- end week05 ---
// Week 8 on the same lecture-first template (DECISION_LOG A21; Phase II opener).
const Week8App = lazy(() => import('./week8/Week8App'))
const Welcome = lazy(() => import('./pages/Welcome'))
// Lecture viewer, handout, reader and figure canvas (single-source lecture pipeline, DECISION_LOG A20).
const LectureApp = lazy(() => import('./lectures/LectureApp'))
// My Project: the team's own enterprise workspace (DECISION_LOG A22, UPDATED_IMPLEMENTATION_ROADMAP.md P1), own shell.
const ProjectApp = lazy(() => import('./project/pages/ProjectApp'))

/** Shown while a route's chunk loads: the shape of a page, not a spinner (no motion under reduced motion). */
function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-3 motion-reduce:animate-none" role="status" aria-label="Loading the page">
      <div className="h-7 w-2/5 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 w-3/5 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-40 rounded-lg border border-slate-200 dark:border-slate-800" />
    </div>
  )
}

/** The workbench's loading frame: top bar, rail and three columns in the workbench tokens. */
function WorkbenchSkeleton() {
  return (
    <div className="wb-root" role="status" aria-label="Loading the workbench">
      <div className="wb-topbar">
        <span className="wb-brand">Practice workbench</span>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="wb-rail" />
        <div className="w-[28%] border-r border-wb-line bg-wb-sunk">
          <div className="wb-skel">
            <span style={{ width: '70%' }} />
            <span style={{ width: '45%' }} />
            <span className="block" />
          </div>
        </div>
        <div className="flex-1">
          <div className="wb-skel">
            <span style={{ width: '50%' }} />
            <span className="block" />
          </div>
        </div>
      </div>
    </div>
  )
}

const NAV: { to: string; label: string; section?: string }[] = [
  { to: '/welcome', label: 'Start here: course welcome' },
  { to: '/', label: 'Dashboard' },
  { to: '/project', label: 'My Project' },
  { to: '/roadmap', label: 'Course roadmap' },
  ...WEEKS.map((w) => ({ to: `/week/${w.number}`, label: `Week ${w.number}: ${w.title}`, section: w.part === 'ST' ? 'Phase I — Systems Thinking' : 'Phase II — MBSE with SysML v2' })),
  { to: '/workspace/model', label: 'AeroLink engineering model', section: 'AeroLink worked example (instructor’s case)' },
  { to: '/workspace/stakeholders', label: 'Stakeholder ecosystem editor', section: 'AeroLink worked example (instructor’s case)' },
  { to: '/workspace/aerolink', label: 'Case brief and data sheet', section: 'AeroLink worked example (instructor’s case)' },
  { to: '/sysml', label: 'SysML v2 toolchain', section: 'Course' },
  { to: '/progress', label: 'My progress', section: 'Course' },
  { to: '/sources', label: 'Verified sources', section: 'Course' },
  { to: '/instructor', label: 'Instructor review', section: 'Course' },
]

function route(path: string): ReactNode {
  if (path === '/') return <Dashboard />
  if (path === '/roadmap') return <Roadmap />
  const w = matchRoute('/week/:n', path)
  if (w) return <WeekPage n={parseInt(w.n, 10)} />
  // the classic page stays available for converted weeks during the transition (WORKBENCH_SPEC §1.4); Week 1's
  // /classic redirects to the lecture-first week page (week1/route.ts)
  const classic = matchRoute('/week/:n/classic', path)
  if (classic) return <WeekPage n={parseInt(classic.n, 10)} />
  // the earlier Week 1 module page, kept for instructor block review only (not on the student path)
  if (path === '/archive/week/1') return <ArchivedWeek1 />
  // the earlier Week 2 page (rebuild outline and its draft sources), kept for instructor review only
  if (path === '/archive/week/2') return <ArchivedWeek2 />
  // the earlier Week 8 page (provisional overview and its draft sources), kept for instructor review only
  if (path === '/archive/week/8') return <ArchivedWeek8 />
  // --- week03 ---
  // the earlier Week 3 page (provisional overview and its draft sources), kept for instructor review only
  if (path === '/archive/week/3') return <ArchivedWeek3 />
  // --- end week03 ---
  // --- week04 ---
  // the earlier Week 4 page (provisional overview and its draft sources), kept for instructor review only
  if (path === '/archive/week/4') return <ArchivedWeek4 />
  // --- end week04 ---
  // --- week05 ---
  // the earlier Week 5 page (provisional overview and its draft sources), kept for instructor review only
  if (path === '/archive/week/5') return <ArchivedWeek5 />
  // --- end week05 ---
  // earlier reviewed draft modules, by their earlier-outline week number (archive; DECISION_LOG A19)
  const draft = matchRoute('/draft/:n', path)
  if (draft) return <DraftWeekPage n={parseInt(draft.n, 10)} />
  if (path === '/workspace/stakeholders') return <StakeholderEditorPage />
  if (path === '/workspace/model') return <ModelWorkspacePage />
  if (path === '/workspace/aerolink') return <CaseStudy />
  if (path === '/progress') return <ProgressPage />
  if (path === '/sources') return <SourcesPage />
  const src = matchRoute('/sources/:id', path) ?? matchRoute('/sources/:id/:pages', path)
  if (src) return <SourcesPage focus={{ id: src.id, pages: src.pages }} />
  if (path === '/instructor') return <InstructorReview />
  if (path === '/sysml') return <ToolchainPage />
  return (
    <div>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2">
        No page exists at <code>{path}</code>. <Link to="/" className="text-brand-600 underline">Return to the dashboard</Link>.
      </p>
    </div>
  )
}

/** The earlier Week 1 module page (self-study era), kept so the instructor can still review its content blocks. */
function ArchivedWeek1() {
  return (
    <div>
      <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100" role="note" data-testid="archive-banner">
        Archive for instructor review: the earlier Week 1 module page. Students follow the lecture-first week page instead.{' '}
        <Link to="/week/1" className="underline">
          Go to Week 1
        </Link>
      </p>
      <WeekPage n={1} />
    </div>
  )
}

/** The earlier Week 2 page (rebuild outline with links to the earlier draft modules it re-uses), kept for instructor
 *  review; students follow the lecture-first Week 2 page. */
/** The earlier Week 8 page (provisional overview with links to the earlier draft modules it re-uses), kept for
 *  instructor review; students follow the lecture-first Week 8 page. */
function ArchivedWeek8() {
  return (
    <div>
      <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100" role="note" data-testid="archive-banner">
        Archive for instructor review: the earlier Week 8 page and its draft sources. Students follow the lecture-first week page instead.{' '}
        <Link to="/week/8" className="underline">
          Go to Week 8
        </Link>
      </p>
      <WeekPage n={8} />
    </div>
  )
}

// --- week03 ---
/** The earlier Week 3 page (provisional overview with links to the earlier draft modules it re-uses), kept for
 *  instructor review; students follow the lecture-first Week 3 page. */
function ArchivedWeek3() {
  return (
    <div>
      <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100" role="note" data-testid="archive-banner">
        Archive for instructor review: the earlier Week 3 page and its draft sources. Students follow the lecture-first week page instead.{' '}
        <Link to="/week/3" className="underline">
          Go to Week 3
        </Link>
      </p>
      <WeekPage n={3} />
    </div>
  )
}
// --- end week03 ---

// --- week04 ---
/** The earlier Week 4 page (provisional overview with links to the earlier draft modules it re-uses), kept for
 *  instructor review; students follow the lecture-first Week 4 page. */
function ArchivedWeek4() {
  return (
    <div>
      <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100" role="note" data-testid="archive-banner">
        Archive for instructor review: the earlier Week 4 page and its draft sources. Students follow the lecture-first week page instead.{' '}
        <Link to="/week/4" className="underline">
          Go to Week 4
        </Link>
      </p>
      <WeekPage n={4} />
    </div>
  )
}
// --- end week04 ---

// --- week05 ---
/** The earlier Week 5 page (provisional overview with links to the earlier draft modules it re-uses), kept for
 *  instructor review; students follow the lecture-first Week 5 page. */
function ArchivedWeek5() {
  return (
    <div>
      <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100" role="note" data-testid="archive-banner">
        Archive for instructor review: the earlier Week 5 page and its draft sources. Students follow the lecture-first week page instead.{' '}
        <Link to="/week/5" className="underline">
          Go to Week 5
        </Link>
      </p>
      <WeekPage n={5} />
    </div>
  )
}
// --- end week05 ---

function ArchivedWeek2() {
  return (
    <div>
      <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100" role="note" data-testid="archive-banner">
        Archive for instructor review: the earlier Week 2 page and its draft sources. Students follow the lecture-first week page instead.{' '}
        <Link to="/week/2" className="underline">
          Go to Week 2
        </Link>
      </p>
      <WeekPage n={2} />
    </div>
  )
}

/** Replaces an earlier route with its new equivalent without adding a history entry. */
function Redirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(`#${to}`)
  }, [to])
  return null
}

function ThemeToggle() {
  const { theme, setTheme } = useApp()
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-600 dark:text-slate-400">Theme</span>
      <select
        aria-label="Color theme"
        value={theme}
        onChange={(e) => setTheme(e.target.value as ThemePref)}
        className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  )
}

function InstructorToggle() {
  const { instructor, setInstructor } = useApp()
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={instructor} onChange={(e) => setInstructor(e.target.checked)} className="h-4 w-4 accent-amber-500" />
      <span className={instructor ? 'font-semibold text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400'}>
        Instructor review mode
      </span>
    </label>
  )
}

/** A converted week opens in the workbench, which owns the full viewport (no classic sidebar). Week 1 opens in its
 *  lecture-first week page instead, whose lab tool and optional practice embed the workbench. */
function workbenchWeekOf(path: string): number | null {
  if (week1Route(path) || week2Route(path) || week3Route(path) || week4Route(path) || week5Route(path) || week8Route(path)) return null
  const w = matchRoute('/week/:n', path)
  const n = w ? parseInt(w.n, 10) : NaN
  return Number.isFinite(n) && hasWorkbench(n) ? n : null
}

export default function App() {
  const path = useRoute()
  const { instructor } = useApp()
  const [navOpen, setNavOpen] = useState(false)
  useEffect(() => {
    window.scrollTo?.(0, 0)
    if (week1Route(path) || week2Route(path) || week3Route(path) || week4Route(path) || week5Route(path) || week8Route(path) || lectureRoute(path) || projectRoute(path) || path === '/welcome') return // those pages set their own titles
    const classic = path.endsWith('/classic') ? path.slice(0, -'/classic'.length) : null
    const draft = matchRoute('/draft/:n', path)
    const page = draft ? `Earlier draft, old Week ${draft.n} (archive)` : path === '/archive/week/1' ? 'Week 1 module page (archive)' : path === '/archive/week/2' ? 'Earlier Week 2 page (archive)' : path === '/archive/week/8' ? 'Earlier Week 8 page (archive)' : path === '/archive/week/3' ? 'Earlier Week 3 page (archive)' : path === '/archive/week/4' ? 'Earlier Week 4 page (archive)' : path === '/archive/week/5' ? 'Earlier Week 5 page (archive)' : NAV.find((n) => n.to === (classic ?? path))?.label
    document.title = page ? `${page}${classic ? ' (classic page)' : workbenchWeekOf(path) ? ' · Workbench' : ''} · SysML Learning Studio` : 'SysML Learning Studio'
  }, [path])

  const lecture = lectureRoute(path)
  if (lecture)
    return (
      <Suspense fallback={<PageSkeleton />}>
        <LectureApp route={lecture} />
      </Suspense>
    )
  // --- my project (A22) ---
  const pr = projectRoute(path)
  if (pr)
    return (
      <Suspense fallback={<PageSkeleton />}>
        <ProjectApp route={pr} />
      </Suspense>
    )
  // --- end my project ---
  const w1 = week1Route(path)
  if (w1 && 'redirect' in w1) return <Redirect to={w1.redirect} />
  if (w1)
    return (
      <Suspense fallback={w1.page === 'lab-tool' || w1.page === 'practice' ? <WorkbenchSkeleton /> : <PageSkeleton />}>
        <Week1App page={w1.page} path={path} />
      </Suspense>
    )
  const w2 = week2Route(path)
  if (w2 && 'redirect' in w2) return <Redirect to={w2.redirect} />
  if (w2)
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Week2App page={w2.page} path={path} />
      </Suspense>
    )
  // --- week03 ---
  const w3 = week3Route(path)
  if (w3 && 'redirect' in w3) return <Redirect to={w3.redirect} />
  if (w3)
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Week3App page={w3.page} path={path} />
      </Suspense>
    )
  // --- end week03 ---
  // --- week04 ---
  const w4 = week4Route(path)
  if (w4 && 'redirect' in w4) return <Redirect to={w4.redirect} />
  if (w4)
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Week4App page={w4.page} path={path} />
      </Suspense>
    )
  // --- end week04 ---
  // --- week05 ---
  const w5 = week5Route(path)
  if (w5 && 'redirect' in w5) return <Redirect to={w5.redirect} />
  if (w5)
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Week5App page={w5.page} path={path} />
      </Suspense>
    )
  // --- end week05 ---
  // --- week08 ---
  const w8 = week8Route(path)
  if (w8 && 'redirect' in w8) return <Redirect to={w8.redirect} />
  if (w8)
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Week8App page={w8.page} path={path} />
      </Suspense>
    )
  // --- end week08 ---
  if (path === '/welcome')
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Welcome />
      </Suspense>
    )

  const wbWeek = workbenchWeekOf(path)
  if (wbWeek !== null)
    return (
      <Suspense fallback={<WorkbenchSkeleton />}>
        <WorkbenchShell key={wbWeek} week={wbWeek} />
      </Suspense>
    )

  // section headers computed up front (no mutation during render)
  const headers = NAV.map((n, i) => (n.section && n.section !== NAV.slice(0, i).reverse().find((m) => m.section)?.section ? n.section : null))
  return (
    <div className="flex min-h-full flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <button className="rounded p-1 lg:hidden" aria-label="Toggle navigation" aria-expanded={navOpen} onClick={() => setNavOpen((v) => !v)}>
              ☰
            </button>
            <Link to="/" className="leading-tight">
              <span className="block text-sm font-semibold">Systems Thinking &amp; MBSE with SysML v2</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">Learning Studio · local prototype</span>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <InstructorToggle />
            <ThemeToggle />
          </div>
        </div>
        {instructor && (
          <div className="border-t border-amber-300 bg-amber-50 px-4 py-1.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200" role="status">
            Instructor review mode: provenance, review controls and the instructor example are visible. Reviews are stored in this browser only.
          </div>
        )}
      </header>
      <div className="flex flex-1">
        <nav aria-label="Main" className={`${navOpen ? 'block' : 'hidden'} w-64 shrink-0 border-r border-slate-200 bg-white px-3 py-4 dark:border-slate-800 dark:bg-slate-900 lg:block`}>
          <ul className="space-y-0.5 text-sm">
            {NAV.map((n, i) => {
              const header = headers[i]
              const active = path === n.to || path === `${n.to}/classic`
              return (
                <li key={n.to}>
                  {header && <p className="mb-1 mt-4 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{header}</p>}
                  {n.to === '/project' ? (
                    <span className="my-1 block px-1" onClick={() => setNavOpen(false)}>
                      <MyProjectLink current={active} />
                    </span>
                  ) : (
                  <Link
                    to={n.to}
                    onClick={() => setNavOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`block rounded-md px-2 py-1.5 ${active ? 'bg-brand-50 font-medium text-brand-700 dark:bg-slate-800 dark:text-brand-100' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                  >
                    {n.label}
                  </Link>
                  )}
                </li>
              )
            })}
          </ul>
          <p className="mt-6 px-2 text-xs text-slate-500 dark:text-slate-400">
            Prototype for faculty review. Lesson content is pending review; numbers about AeroLink are fictional.
          </p>
        </nav>
        <main id="main" className="min-w-0 flex-1 px-4 py-6 lg:px-8">
          <Suspense fallback={<PageSkeleton />}>{route(path)}</Suspense>
        </main>
      </div>
    </div>
  )
}
