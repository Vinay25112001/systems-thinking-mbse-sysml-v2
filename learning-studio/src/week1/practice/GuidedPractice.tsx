// Guided Practice page (M5; spec §e.1 GP-01, mockup docs/week1/spec/mockups/guided-practice.html). Route
// #/week/1/practice[/:task]. Layout: the plum "Fictional teaching case" banner; left, the task list GP-1…GP-6 with state
// words and minutes and "Reset all practice…"; centre, the task with its steps, one instruction, the working surface,
// "Check my answer" and the feedback; right, "Learn this", "AeroLink facts used here", "Why it matters for your project".
// State: src/week1/practice/store.ts (its own browser key; never the team record or the project). The dense workbench
// (second toolbar, status bar, model browser, 11–12 px text) is not used here (audit F2, F7, F8).
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, CircleDot, FolderOpen, RotateCcw, Target } from 'lucide-react'
import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, navigate } from '../../lib/router'
import { TemplateCopy } from '../../project/practice/TemplateCopy'
import { learnPath, WEEK1_PATHS } from '../route'
import { displayNumber, sectionById, visibleInEdition } from '../learn/textbook'
import { WeekShell } from '../WeekShell'
import { STATE_WORD, stepState, taskState, type StepState } from './feedback'
import { STORAGE_PREFIX } from '../../lib/storage'
import { loadPractice, PRACTICE_STORAGE_KEY, resetAllPractice, resetTask, savePracticeGuarded, storedRev, type PracticeState, type PracticeTasks, type TaskId } from './store'
import { sanitizePractice } from './validate'
import { gp1Steps, gp2Steps, gp3Steps, gp4Steps, gp5Steps, gp6Steps, PRACTICE_MINUTES, taskById, TASKS } from './tasks'
import { GP1View, GP2View, GP3View, GP4View, GP5View, GP6View } from './TaskViews'
import { ConfirmDialog } from './ui'
import './practice.css'

export const practicePath = (task?: string) => `${WEEK1_PATHS.practice}${task ? `/${task}` : ''}`

const STATE_ICON: Record<StepState, React.ReactNode> = {
  'not-started': <Circle size={14} aria-hidden />,
  'in-progress': <CircleDot size={14} aria-hidden />,
  attempted: <CheckCircle2 size={14} aria-hidden />,
}

/** The Learn sections a task links to, as this edition shows them (hidden sections dropped). */
export function learnLinks(ids: string[]) {
  return ids
    .map((id) => sectionById(id))
    .filter((x): x is NonNullable<typeof x> => !!x && visibleInEdition(x.section))
    .map((x) => ({ id: x.section.id, href: learnPath(x.chapter.id, x.section.id), label: `${displayNumber(x.section.id)} ${x.section.title}` }))
}

export function Banner() {
  return (
    <div className="gp-banner" role="note" data-testid="practice-banner">
      <Target size={18} aria-hidden />
      <span>
        <strong>Instructor example · AeroLink Urban Mobility.</strong> <span className="gp-badge">Fictional teaching case</span> Practice stays here and is never written into your project. AeroLink and its numbers are fictional teaching assumptions; the regulator it names, the FAA, is real, and its role is simplified.
      </span>
    </div>
  )
}

export function Handoff() {
  return (
    <section className="gp-handoff" aria-labelledby="gp-handoff-h" data-testid="practice-handoff">
      <h3 id="gp-handoff-h">Now apply this to your own enterprise</h3>
      <p>You practised the boundary, stakeholders, concerns and conflicts, needs and their objectives on AeroLink. My Project / Lab applies the same methods to your team’s enterprise, starting from a blank register.</p>
      <div className="gp-actions">
        <Link to={WEEK1_PATHS.project} className="gp-btn project" data-testid="handoff-start">
          <FolderOpen size={16} aria-hidden /> Start in My Project with a blank register
        </Link>
      </div>
      <TemplateCopy />
    </section>
  )
}

type StepMap = Record<string, { touched: boolean; complete: boolean }>
const STEP_FNS: Record<TaskId, (t: PracticeTasks) => StepMap> = {
  'gp-1': (t) => gp1Steps(t['gp-1']),
  'gp-2': (t) => gp2Steps(t['gp-2']),
  'gp-3': (t) => gp3Steps(t['gp-3']),
  'gp-4': (t) => gp4Steps(t['gp-4']),
  'gp-5': (t) => gp5Steps(t['gp-5']),
  'gp-6': (t) => gp6Steps(t['gp-6']),
}
/** Step states per task; a task whose state cannot be evaluated shows as not started and is marked broken (M5-02). */
function safeSteps(tasks: PracticeTasks): { steps: Record<TaskId, StepMap>; broken: TaskId[] } {
  const steps = {} as Record<TaskId, StepMap>
  const broken: TaskId[] = []
  for (const t of TASKS) {
    try {
      steps[t.id] = STEP_FNS[t.id](tasks)
    } catch {
      broken.push(t.id)
      steps[t.id] = Object.fromEntries(t.steps.map((x) => [x.id, { touched: false, complete: false }]))
    }
  }
  return { steps, broken }
}
function readPractice(): { state: PracticeState; dropped: string[] } {
  return sanitizePractice(loadPractice())
}

/** Catches a render error in one task (review M5-02): the page, the task list and both resets stay usable. */
class TaskBoundary extends Component<{ children: ReactNode; onReset: () => void; code: string }, { error: string | null }> {
  state = { error: null as string | null }
  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="gp-fb gp-fb-structural is-fail" role="alert" data-testid="task-error">
        <p className="gp-fb-title">This task could not be shown from your saved answers.</p>
        <p>Your project is not affected. Reset this task to start it again; the other tasks keep their answers.</p>
        <button type="button" className="gp-btn" onClick={this.props.onReset} data-testid="task-error-reset">
          Reset {this.props.code}
        </button>
      </div>
    )
  }
}

/** The whole page's last resort: if Guided Practice itself cannot render, "Reset all practice" is still offered. */
class PracticeBoundary extends Component<{ children: ReactNode }, { error: boolean; n: number }> {
  state = { error: false, n: 0 }
  static getDerivedStateFromError() {
    return { error: true }
  }
  render() {
    if (!this.state.error) return <Fragmentish key={this.state.n}>{this.props.children}</Fragmentish>
    return (
      <div className="gp" role="alert" data-testid="practice-error">
        <p>Guided Practice could not be shown from the answers saved in this browser. Your project is not affected.</p>
        <button type="button" className="gp-btn" data-testid="practice-error-reset" onClick={() => { resetAllPractice(); this.setState((s) => ({ error: false, n: s.n + 1 })) }}>
          Reset all practice
        </button>
      </div>
    )
  }
}
const Fragmentish = ({ children }: { children: ReactNode }) => <>{children}</>
function Unreadable(): ReactNode {
  throw new Error('unreadable task state')
}

export default function GuidedPractice(props: { task?: string; path: string; initialStep?: string }) {
  return (
    <PracticeBoundary>
      <GuidedPracticePage {...props} />
    </PracticeBoundary>
  )
}

function GuidedPracticePage({ task, path, initialStep }: { task?: string; path: string; initialStep?: string }) {
  const [first] = useState(readPractice)
  const [state, setState] = useState<PracticeState>(first.state)
  const [dropped, setDropped] = useState<string[]>(first.dropped)
  const [recovered, setRecovered] = useState(first.state.recovered ?? null)
  const stateRef = useRef(state)
  const readRev = useRef(storedRev())
  const lastWritten = useRef<string | null>(null)
  const [stale, setStale] = useState(false)
  const [status, setStatus] = useState('')
  const [confirm, setConfirm] = useState<'task' | 'all' | null>(null)
  const [resets, setResets] = useState(0)
  const opener = useRef<HTMLElement | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const current = taskById(task ?? '') ?? TASKS[0]
  const { steps, broken } = useMemo(() => safeSteps(state.tasks), [state.tasks])

  // review M5-07: another tab wrote the practice: never overwrite it silently; offer to load the latest answers
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_PREFIX + PRACTICE_STORAGE_KEY && e.key !== null) return
      if (storedRev() !== readRev.current) setStale(true)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  const commit = useCallback((next: PracticeState) => {
    const r = savePracticeGuarded(next, readRev.current)
    if (r === 'stale') {
      setStale(true)
      return false
    }
    if (r === 'saved') readRev.current += 1
    const withRev = { ...next, rev: readRev.current }
    stateRef.current = withRev
    lastWritten.current = JSON.stringify(withRev)
    setState(withRev)
    return true
  }, [])
  const reloadLatest = () => {
    const fresh = readPractice()
    readRev.current = storedRev()
    stateRef.current = fresh.state
    setState(fresh.state)
    setDropped(fresh.dropped)
    setStale(false)
    setStatus('The latest saved answers are loaded.')
  }
  const firstOpen = (id: TaskId) => Math.max(0, TASKS.find((t) => t.id === id)!.steps.findIndex((s) => !steps[id][s.id].complete))
  const [stepIdx, setStepIdx] = useState(() => (initialStep ? Math.max(0, current.steps.findIndex((x) => x.id === initialStep)) : firstOpen(current.id)))
  const [shownTask, setShownTask] = useState(current.id)
  useEffect(() => {
    if (shownTask === current.id) return
    setShownTask(current.id)
    setStepIdx(firstOpen(current.id))
    setStatus('')
    window.scrollTo?.(0, 0)
    // the first open step of the task just opened
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id])

  const update = useCallback(<K extends TaskId>(id: K, f: (s: PracticeTasks[K]) => PracticeTasks[K]) => {
    const prev = stateRef.current
    commit({ ...prev, tasks: { ...prev.tasks, [id]: f(prev.tasks[id]) } })
  }, [commit])
  // step changes are announced by moving focus to the step heading (not on first render; review M5-18)
  const goStep = (i: number) => {
    setStepIdx(i)
    requestAnimationFrame(() => heading.current?.focus())
  }
  const askReset = (kind: 'task' | 'all') => {
    opener.current = document.activeElement as HTMLElement | null
    setConfirm(kind)
  }
  const up = <K extends TaskId>(id: K) => (f: (s: PracticeTasks[K]) => PracticeTasks[K]) => update(id, f)

  const doReset = () => {
    if (confirm === 'task') {
      if (commit(resetTask(stateRef.current, current.id))) {
        setStepIdx(0)
        setStatus(`${current.code} reset. Your project was not changed.`)
      }
    } else if (confirm === 'all') {
      const fresh = resetAllPractice()
      readRev.current = fresh.rev ?? storedRev()
      stateRef.current = fresh
      setState(fresh)
      setDropped([])
      setStale(false)
      setStepIdx(0)
      setStatus('All practice reset. Your project was not changed.')
    }
    setResets((n) => n + 1)
    setConfirm(null)
  }

  const step = current.steps[Math.min(stepIdx, current.steps.length - 1)]
  const taskIdx = TASKS.indexOf(current)
  const next = TASKS[taskIdx + 1]
  const template = <TemplateCopy />
  const view = (() => {
    switch (current.id) {
      case 'gp-1': return <GP1View s={state.tasks['gp-1']} up={up('gp-1')} step={step.id} />
      case 'gp-2': return <GP2View s={state.tasks['gp-2']} up={up('gp-2')} step={step.id} />
      case 'gp-3': return <GP3View s={state.tasks['gp-3']} up={up('gp-3')} step={step.id} template={step.id === 'row' ? template : null} />
      case 'gp-4': return <GP4View s={state.tasks['gp-4']} up={up('gp-4')} step={step.id} />
      case 'gp-5': return <GP5View s={state.tasks['gp-5']} up={up('gp-5')} step={step.id} template={step.id === 'write' ? template : null} />
      case 'gp-6': return <GP6View s={state.tasks['gp-6']} up={up('gp-6')} step={step.id} handoff={step.id === 'gap' ? <Handoff /> : null} />
    }
  })()
  const tState = (id: TaskId) => taskState(Object.values(steps[id]))
  const links = learnLinks(current.learn)

  return (
    <WeekShell path={path} title="Guided Practice" compact crumbs={[{ label: 'Week 1', to: '/week/1' }, { label: 'Guided Practice', to: WEEK1_PATHS.practice }, { label: `${current.code} ${current.title}` }]}>
      <div className="gp" data-testid="guided-practice">
        <Banner />
        <p className="sr-only" role="status" aria-live="polite" data-testid="practice-status">{status}</p>
        {status && <p className="gp-status" data-testid="practice-status-visible">{status}</p>}
        {stale && (
          <div className="gp-notice" role="alert" data-testid="practice-stale">
            <p>Your practice answers were changed in another tab or window. To avoid overwriting them, edits here are paused.</p>
            <button type="button" className="gp-btn course" onClick={reloadLatest} data-testid="practice-reload">Load the latest answers</button>
          </div>
        )}
        {recovered && (
          <div className="gp-notice" role="status" data-testid="practice-recovered">
            <p>Your saved practice answers could not be read, so Guided Practice starts again. A copy of what was saved is kept in this browser (key “{recovered.backupKey}”) in case your instructor needs it. Your project is not affected.</p>
            <button type="button" className="gp-btn small" onClick={() => setRecovered(null)}>Dismiss</button>
          </div>
        )}
        {dropped.length > 0 && (
          <div className="gp-notice" role="status" data-testid="practice-dropped">
            <p>Some saved practice answers could not be read and were left out ({dropped.length}): {dropped.slice(0, 4).join('; ')}{dropped.length > 4 ? '; …' : ''}. Answer those items again. Your project is not affected.</p>
            <button type="button" className="gp-btn small" onClick={() => setDropped([])}>Dismiss</button>
          </div>
        )}
        <div className="gp-grid">
          <nav className="gp-tasks" aria-label="Guided Practice tasks">
            <div className="gp-tasks-head">
              <h2>Week 1 tasks</h2>
              <span className="gp-muted">≈ {PRACTICE_MINUTES} min, optional</span>
            </div>
            <ol>
              {TASKS.map((t) => {
                const ts = tState(t.id)
                const on = t.id === current.id
                return (
                  <li key={t.id}>
                    <Link to={practicePath(t.id)} className={`gp-task${on ? ' is-current' : ''}`} aria-current={on ? 'page' : undefined} data-testid={`task-${t.id}`}>
                      <span className="gp-task-title">{t.code} {t.title}</span>
                      <span className="gp-task-min">{t.minutes} min</span>
                      <span className={`gp-task-state is-${ts}`}>{STATE_ICON[ts]} {on && ts !== 'attempted' ? `Step ${Math.min(stepIdx, t.steps.length - 1) + 1} of ${t.steps.length} · ` : ''}{STATE_WORD[ts]}</span>
                    </Link>
                  </li>
                )
              })}
            </ol>
            <div className="gp-tasks-foot">
              <button type="button" className="gp-btn" onClick={() => askReset('all')} data-testid="reset-all">
                <RotateCcw size={15} aria-hidden /> Reset all practice…
              </button>
              <p className="gp-muted">Resetting clears practice answers only. Your team project is not affected.</p>
            </div>
          </nav>

          <article className="gp-card" aria-labelledby="gp-task-h" data-testid={`practice-task-${current.id}`}>
            <header className="gp-card-head">
              <div>
                <p className="gp-kicker">{current.code} · Step {current.steps.indexOf(step) + 1} of {current.steps.length}</p>
                <h1 id="gp-task-h">{current.title}</h1>
              </div>
              <button type="button" className="gp-btn" onClick={() => askReset('task')} data-testid="reset-task">
                <RotateCcw size={15} aria-hidden /> Reset this task
              </button>
            </header>
            <ol className="gp-steps" aria-label="Steps of this task">
              {current.steps.map((s, i) => {
                const st = stepState(steps[current.id][s.id].touched, steps[current.id][s.id].complete)
                return (
                  <li key={s.id}>
                    <button type="button" className={`gp-step${s.id === step.id ? ' is-current' : ''}`} aria-current={s.id === step.id ? 'step' : undefined} onClick={() => goStep(i)} data-testid={`step-${s.id}`}>
                      <span className={`gp-task-state is-${st}`}>{STATE_ICON[st]}</span> {i + 1}. {s.title} <span className="sr-only">({STATE_WORD[st]})</span>
                    </button>
                  </li>
                )
              })}
            </ol>
            <div className="gp-body">
              <h2 className="gp-h2" ref={heading} tabIndex={-1}>{step.title}</h2>
              {broken.includes(current.id) ? (
                <TaskBoundary key="broken" code={current.code} onReset={() => askReset('task')}>
                  <Unreadable />
                </TaskBoundary>
              ) : (
                <TaskBoundary key={`${current.id}-${step.id}-${resets}`} code={current.code} onReset={() => askReset('task')}>
                  {view}
                </TaskBoundary>
              )}
            </div>
            <footer className="gp-card-foot">
              {stepIdx > 0 && (
                <button type="button" className="gp-btn" onClick={() => goStep(stepIdx - 1)}>
                  <ArrowLeft size={15} aria-hidden /> Previous step
                </button>
              )}
              <span className="gp-sp" />
              {stepIdx < current.steps.length - 1 ? (
                <button type="button" className="gp-btn course" onClick={() => goStep(stepIdx + 1)} data-testid="next-step">
                  Next: step {stepIdx + 2}, {current.steps[stepIdx + 1].title.toLowerCase()} <ArrowRight size={15} aria-hidden />
                </button>
              ) : next ? (
                <button type="button" className="gp-btn course" onClick={() => navigate(practicePath(next.id))} data-testid="next-task">
                  Next task: {next.code} {next.title} <ArrowRight size={15} aria-hidden />
                </button>
              ) : (
                <Link to={WEEK1_PATHS.project} className="gp-btn project" data-testid="next-project">
                  Apply this to your enterprise in My Project <ArrowRight size={15} aria-hidden />
                </Link>
              )}
            </footer>
          </article>

          <aside className="gp-rail" aria-label="About this task">
            <section className="gp-rail-card">
              <h2>Learn this</h2>
              <p>{current.learnLine}{links.length ? ':' : '.'}</p>
              {links.length > 0 && (
                <ul data-testid="learn-links">
                  {links.map((l) => <li key={l.id}><Link to={l.href}>{l.label}</Link></li>)}
                </ul>
              )}
            </section>
            <section className="gp-rail-card is-example">
              <h2>AeroLink facts used here</h2>
              <p>{current.facts}</p>
            </section>
            <section className="gp-rail-card">
              <h2>Why it matters for your project</h2>
              <p>{current.matters}</p>
            </section>
            {(current.id === 'gp-3' || current.id === 'gp-5' || current.id === 'gp-6') && (
              <section className="gp-rail-card">
                <h2>Use AeroLink as a template?</h2>
                <p>Possible only on request, after a review of exactly what would be copied and a warning to adapt it. Copied rows never count until rewritten for your enterprise.</p>
              </section>
            )}
          </aside>
        </div>
        <ConfirmDialog
          open={confirm !== null}
          onOpenChange={(o) => !o && setConfirm(null)}
          title={confirm === 'all' ? 'Reset all practice?' : `Reset ${current.code}?`}
          body={<p>{confirm === 'all' ? 'Your answers in every Guided Practice task are cleared.' : 'Your answers in this task are cleared.'} Your team project is not affected.</p>}
          confirm={confirm === 'all' ? 'Reset all practice' : 'Reset task'}
          onConfirm={doReset}
          returnFocus={() => opener.current}
        />
      </div>
    </WeekShell>
  )
}
