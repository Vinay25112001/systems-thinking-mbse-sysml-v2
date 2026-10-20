// Practice stage: the AeroLink workbench with the Week 1 missions (WEEK1_LEARNING_DESIGN §4). Since the lecture-first
// restructuring (2026-10-19) this stage is unregistered and never locked; its EmbeddedWorkbench serves the Week 1 lab tool
// and the optional practice (src/week1/Workbench.tsx). The first visit shows "How the workbench works" (the orientation and the
// practice plan); then the workbench fills the stage, with a Practice bar that reopens the orientation and leads to
// Check & submit once every mission is complete (faculty feedback 2026-10-18, items 11 and 13).
//
// Blank-page fix (item 10): opening the workbench used to swap the plan for a lazily loaded chunk whose loading
// placeholder was an empty skeleton, and a failed chunk load unmounted the whole page, so the stage could look blank
// until a history navigation re-rendered it. Now (1) the workbench chunk is prefetched as soon as Practice is reachable,
// so it renders at once; (2) the placeholder says what is loading; (3) a load or render error shows a message with a
// retry instead of an empty page; and (4) opening it scrolls to the top so the workbench is in view.
import { ArrowRight, Lock } from 'lucide-react'
import { Component, lazy, Suspense, useEffect, useMemo, type ReactNode } from 'react'
import week1Missions from '../content/missions/week01'
import { BLOCK_TO_SECTION, LEARN_SECTIONS, ORIENTATION, PRACTICE_BAR, PRACTICE_PREREQ, learnSection } from '../content/learn/week01'
import { PRACTICE_LEDE } from '../content/learn/welcome'
import { FigureFrame } from '../components/figures/Frame'
import { WorkbenchRegionsFigure } from '../components/figures/SiteGuide'
import { Link } from '../lib/router'
import { KIND_LABEL } from '../workbench/missions'
import { LearnLinkContext, PracticeLinksContext, type PracticeLinks } from '../workbench/learnLink'
import { useFlow } from './state'
import { LEARN_TO_LESSON } from '../week1/route'

const loadShell = () => import('../workbench/WorkbenchShell')
/** A dropped connection gets two quiet retries before the error boundary shows its message. */
const loadShellWithRetry = async () => {
  for (let i = 0; ; i++) {
    try {
      return await loadShell()
    } catch (e) {
      if (i >= 2) throw e
      await new Promise((r) => setTimeout(r, 400 * (i + 1)))
    }
  }
}
const Shell = lazy(loadShellWithRetry)
/** Starts loading the workbench chunk (idempotent: the module loader caches the promise). */
const prefetchWorkbench = () => {
  loadShell().catch(() => undefined)
}

/** The earlier Learn-gating lock (retired from the path 2026-10-19: students are never blocked from the lab by unanswered
 *  checks). Kept for reference; nothing renders it. */
export function Locked() {
  const { state, readCount } = useFlow()
  const next = LEARN_SECTIONS.find((s) => !state.read[s.id])!
  return (
    <div className="lf-page">
      <div className="lf-card lf-lock" data-testid="practice-locked">
        <p className="lf-kicker">
          <Lock size={12} aria-hidden /> Practice is locked
        </p>
        <h1 className="lf-h1">Read the Learn sections first</h1>
        <p>
          Practice opens when all {LEARN_SECTIONS.length} sections are marked read ({readCount} so far). Each section ends with one check; answer it to mark the section read.
        </p>
        <ul className="lf-plain">
          {LEARN_SECTIONS.map((s) => (
            <li key={s.id} className="flex items-center gap-3 border-b border-wb-line py-2 text-[15px]">
              <span className={`lf-chip ${state.read[s.id] ? 'ok' : ''}`}>{state.read[s.id] ? 'read' : 'to do'}</span>
              <Link to={`/week/1/learn/${s.id}`}>
                {s.code} {s.title}
              </Link>
            </li>
          ))}
        </ul>
        <div className="lf-actions">
          <Link to={`/week/1/learn/${next.id}`} className="lf-btn primary">
            Continue with {next.code} {next.title} <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  )
}

const REGIONS_FIGURE = {
  id: 'workbench-regions',
  ...ORIENTATION.figure,
  textEquivalent: ORIENTATION.regions.map((r) => `${r.n}. ${r.name}: ${r.text.text}`).join(' '),
}

function Orientation({ started, onOpen }: { started: boolean; onOpen: () => void }) {
  useEffect(prefetchWorkbench, [])
  return (
    <div className="lf-page" data-testid="practice-plan">
      <p className="lf-kicker">Week 1 · Practice</p>
      <h1 className="lf-h1" data-testid="orientation">
        How the workbench works
      </h1>
      <p className="lf-lede">{ORIENTATION.lede.text}</p>
      {/* review F14: the button is reachable before the long orientation, on any screen */}
      <div className="lf-actions" style={{ marginTop: 0 }}>
        <button type="button" className="lf-btn primary" onClick={onOpen} data-testid="open-workbench-top">
          {started ? 'Back to the workbench' : 'Open the workbench'} <ArrowRight size={15} aria-hidden />
        </button>
        <span className="lf-muted text-[14px]">or read the guide below first.</span>
      </div>
      <div className="lf-grid2" style={{ alignItems: 'start' }}>
        <FigureFrame spec={REGIONS_FIGURE} wide={false}>
          {/* review F14: the sketch scales to the column instead of scrolling sideways; the numbered list names each region */}
          <div className="lf-fit">
            <WorkbenchRegionsFigure alt={REGIONS_FIGURE.alt} />
          </div>
        </FigureFrame>
        <section aria-labelledby="regions-h">
          <h2 id="regions-h" className="lf-h3" style={{ marginTop: 0 }}>
            The five regions
          </h2>
          <ol className="lf-regions">
            {ORIENTATION.regions.map((r) => (
              <li key={r.n}>
                <span className="lf-region-no" aria-hidden>
                  {r.n}
                </span>
                <span>
                  <strong>{r.name}.</strong> {r.text.text}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <div className="lf-grid2 lf-prose" style={{ marginTop: 18 }}>
        <section aria-labelledby="mission-h">
          <h2 id="mission-h" className="lf-h3">
            What a mission is
          </h2>
          <p>{ORIENTATION.mission.text}</p>
          <h2 className="lf-h3">Moving between missions</h2>
          <p>{ORIENTATION.moving.text}</p>
        </section>
        <section aria-labelledby="finished-h">
          <h2 id="finished-h" className="lf-h3">
            How you know you are finished
          </h2>
          <p>{ORIENTATION.finished.text}</p>
        </section>
      </div>

      <h2 className="lf-h2">This week’s missions</h2>
      <p className="lf-prose">{PRACTICE_LEDE.text}</p>
      <div className="lf-table-wrap lf-card" style={{ padding: 0 }}>
        <table className="lf-table lf-practice-plan">
          <caption className="sr-only">Practice plan: missions in order, with kind, time, objectives and the Learn sections they build on</caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Mission</th>
              <th scope="col">Kind</th>
              <th scope="col">Min</th>
              <th scope="col">Objectives</th>
              <th scope="col">Builds on</th>
            </tr>
          </thead>
          <tbody>
            {week1Missions.missions.map((m, i) => {
              const pre = PRACTICE_PREREQ[m.id]
              return (
                <tr key={m.id}>
                  <td data-label="#">{i + 1}</td>
                  <td data-label="Mission">
                    <strong>{m.title}</strong>
                    {pre?.note && <span className="lf-muted block text-[13.5px]">{pre.note.text}</span>}
                  </td>
                  <td data-label="Kind">{KIND_LABEL[m.kind]}</td>
                  <td data-label="Minutes" className="wb-mono">{m.minutes}</td>
                  <td data-label="Objectives" className="wb-mono text-[13px]">{m.objectives.join(', ')}</td>
                  <td data-label="Builds on" className="text-[13.5px]">{pre.learn.length === LEARN_SECTIONS.length ? 'all of Learn' : pre.learn.map((l) => learnSection(l)!.code).join(', ')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="lf-actions">
        <button type="button" className="lf-btn primary" onClick={onOpen} data-testid="open-workbench">
          {started ? 'Back to the workbench' : 'Open the workbench'} <ArrowRight size={15} aria-hidden />
        </button>
        <span className="lf-muted text-[14px]">Your work is saved in this browser. Undo with Ctrl+Z; press ? for shortcuts.</span>
      </div>
    </div>
  )
}

function WorkbenchLoading() {
  return (
    <div className="wb-skel" role="status" aria-label="Loading the workbench" data-testid="workbench-loading">
      <p className="lf-muted m-0 mb-2 text-[14px]">Loading the workbench…</p>
      <span style={{ width: '50%' }} />
      <span className="block" />
    </div>
  )
}

/** Catches a failed chunk load or a render error in the workbench, so the stage never goes blank. */
class WorkbenchBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null }
  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="lf-page">
        <div className="lf-card" role="alert" data-testid="workbench-error">
          <h1 className="lf-h2" style={{ marginTop: 0 }}>
            The workbench did not load
          </h1>
          <p>Your work is safe in this browser. This is usually a dropped connection or an updated version of the site.</p>
          <p className="lf-muted text-[13.5px]">{this.state.error}</p>
          <button
            type="button"
            className="lf-btn primary"
            onClick={() => window.location.reload()}
          >
            Reload and try again
          </button>
        </div>
      </div>
    )
  }
}

/** A mission step's "Read more" opens the lesson section that teaches it (the Learn sections are retired). */
export function lessonLink(block: string) {
  const s = learnSection(BLOCK_TO_SECTION[block] ?? '')
  return s ? { href: `/week/1/lesson/${LEARN_TO_LESSON[s.id]}`, label: s.title } : null
}

/** The Week 1 workbench, embedded in a page (lab tool, optional practice, or the earlier Practice stage): prefetched,
 *  with a loading message and an error boundary so the page never goes blank. */
export function EmbeddedWorkbench({ links }: { links: PracticeLinks }) {
  return (
    <LearnLinkContext.Provider value={lessonLink}>
      <PracticeLinksContext.Provider value={links}>
        <WorkbenchBoundary>
          <Suspense fallback={<WorkbenchLoading />}>
            <Shell week={1} embedded />
          </Suspense>
        </WorkbenchBoundary>
      </PracticeLinksContext.Provider>
    </LearnLinkContext.Provider>
  )
}
export { prefetchWorkbench }

/** The earlier Practice stage (unregistered since 2026-10-19). The Learn-gating lock is removed. */
export function Practice() {
  const { state, patch } = useFlow()
  const practiceLinks = useMemo<PracticeLinks>(() => ({ onGuide: () => patch('practiceGuide', true), checkHref: '/week/1/assessment', completeText: PRACTICE_BAR.complete.text }), [patch])
  const open = !!state.practiceStarted && !state.practiceGuide
  useEffect(() => {
    if (!open) return
    window.scrollTo?.(0, 0)
  }, [open])
  if (!open)
    return (
      <Orientation
        started={!!state.practiceStarted}
        onOpen={() => {
          patch('practiceStarted', true)
          patch('practiceGuide', false)
        }}
      />
    )
  return <EmbeddedWorkbench links={practiceLinks} />
}
