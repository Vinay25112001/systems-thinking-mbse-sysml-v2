import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { Link, matchRoute, useRoute } from './lib/router'
import { useApp, type ThemePref } from './state/AppState'
import { WEEKS } from './content/course'
import { hasWorkbench } from './content/missions'
import { flowRoute } from './flow/route'

// Every route is its own chunk (React.lazy): /week/1 loads the workbench shell and only the Week 1 view it shows,
// not the classic pages, the activity registry of all 14 weeks or the SysML sources.
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Roadmap = lazy(() => import('./pages/Roadmap').then((m) => ({ default: m.Roadmap })))
const WeekPage = lazy(() => import('./pages/WeekPage').then((m) => ({ default: m.WeekPage })))
const StakeholderEditorPage = lazy(() => import('./pages/StakeholderEditorPage').then((m) => ({ default: m.StakeholderEditorPage })))
const CaseStudy = lazy(() => import('./pages/CaseStudy').then((m) => ({ default: m.CaseStudy })))
const ProgressPage = lazy(() => import('./pages/ProgressPage').then((m) => ({ default: m.ProgressPage })))
const InstructorReview = lazy(() => import('./pages/InstructorReview').then((m) => ({ default: m.InstructorReview })))
const SourcesPage = lazy(() => import('./pages/SourcesPage').then((m) => ({ default: m.SourcesPage })))
const ToolchainPage = lazy(() => import('./pages/ToolchainPage').then((m) => ({ default: m.ToolchainPage })))
const ModelWorkspacePage = lazy(() => import('./pages/ModelWorkspacePage').then((m) => ({ default: m.ModelWorkspacePage })))
const WorkbenchShell = lazy(() => import('./workbench/WorkbenchShell'))
// The book-style Week 1 flow and the course welcome own the full viewport (reading layout, no classic sidebar).
const WeekFlow = lazy(() => import('./flow/WeekFlow'))
const Welcome = lazy(() => import('./pages/Welcome'))

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
        <span className="wb-brand">AeroLink Workbench</span>
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
  { to: '/roadmap', label: 'Course roadmap' },
  ...WEEKS.map((w) => ({ to: `/week/${w.number}`, label: `Week ${w.number}: ${w.title}`, section: w.part === 'ST' ? 'Part I — Systems Thinking' : 'Part II — MBSE with SysML v2' })),
  { to: '/workspace/model', label: 'AeroLink engineering model', section: 'Air Taxi workspace' },
  { to: '/workspace/stakeholders', label: 'Stakeholder ecosystem editor', section: 'Air Taxi workspace' },
  { to: '/workspace/aerolink', label: 'Case brief and data sheet', section: 'Air Taxi workspace' },
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
  // the classic page stays available for converted weeks during the transition (WORKBENCH_SPEC §1.4)
  const classic = matchRoute('/week/:n/classic', path)
  if (classic) return <WeekPage n={parseInt(classic.n, 10)} />
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

function ThemeToggle() {
  const { theme, setTheme } = useApp()
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-600 dark:text-slate-400">Theme</span>
      <select
        aria-label="Colour theme"
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

/** A converted week opens in the workbench, which owns the full viewport (no classic sidebar). Week 1 opens in the
 *  book-style flow instead, whose Practice stage embeds the workbench. */
function workbenchWeekOf(path: string): number | null {
  if (flowRoute(path)) return null
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
    if (flowRoute(path) || path === '/welcome') return // those pages set their own titles
    const classic = path.endsWith('/classic') ? path.slice(0, -'/classic'.length) : null
    const page = NAV.find((n) => n.to === (classic ?? path))?.label
    document.title = page ? `${page}${classic ? ' (classic page)' : workbenchWeekOf(path) ? ' · Workbench' : ''} · SysML Learning Studio` : 'SysML Learning Studio'
  }, [path])

  const flow = flowRoute(path)
  if (flow)
    return (
      <Suspense fallback={<WorkbenchSkeleton />}>
        <WeekFlow stage={flow.stage} section={flow.section} />
      </Suspense>
    )
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
              <span className="block text-xs text-slate-500 dark:text-slate-400">Air Taxi Enterprise Learning Studio · local prototype</span>
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
                  <Link
                    to={n.to}
                    onClick={() => setNavOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`block rounded-md px-2 py-1.5 ${active ? 'bg-brand-50 font-medium text-brand-700 dark:bg-slate-800 dark:text-brand-100' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                  >
                    {n.label}
                  </Link>
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
