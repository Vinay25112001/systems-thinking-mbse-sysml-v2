// Practice stage: the AeroLink workbench with the Week 1 missions (WEEK1_LEARNING_DESIGN §4). Locked until every Learn
// section is read (instructor mode bypasses). The first visit shows the practice plan; then the workbench fills the stage.
import { ArrowRight, Lock } from 'lucide-react'
import { lazy, Suspense, useCallback } from 'react'
import week1Missions from '../content/missions/week01'
import { BLOCK_TO_SECTION, LEARN_SECTIONS, PRACTICE_PREREQ, learnSection } from '../content/learn/week01'
import { Link } from '../lib/router'
import { useApp } from '../state/AppState'
import { KIND_LABEL } from '../workbench/missions'
import { LearnLinkContext } from '../workbench/learnLink'
import { PRACTICE_LEDE } from '../content/learn/welcome'
import { useFlow } from './state'

const WorkbenchShell = lazy(() => import('../workbench/WorkbenchShell'))

function Locked() {
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

function Plan({ onStart }: { onStart: () => void }) {
  return (
    <div className="lf-page" data-testid="practice-plan">
      <p className="lf-kicker">Week 1 · Practice</p>
      <h1 className="lf-h1">Practice in the AeroLink workbench</h1>
      <p className="lf-lede">{PRACTICE_LEDE.text}</p>
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
                  <td>{i + 1}</td>
                  <td>
                    <strong>{m.title}</strong>
                    {pre?.note && <span className="lf-muted block text-[13.5px]">{pre.note.text}</span>}
                  </td>
                  <td>{KIND_LABEL[m.kind]}</td>
                  <td className="wb-mono">{m.minutes}</td>
                  <td className="wb-mono text-[13px]">{m.objectives.join(', ')}</td>
                  <td className="text-[13.5px]">{pre.learn.length === LEARN_SECTIONS.length ? 'all of Learn' : pre.learn.map((l) => learnSection(l)!.code).join(', ')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="lf-actions">
        <button type="button" className="lf-btn primary" onClick={onStart} data-testid="open-workbench">
          Open the workbench <ArrowRight size={15} aria-hidden />
        </button>
        <span className="lf-muted text-[14px]">Your work is saved in this browser. Undo with Ctrl+Z; press ? for shortcuts.</span>
      </div>
    </div>
  )
}

function WorkbenchSkeleton() {
  return (
    <div className="wb-skel" role="status" aria-label="Loading the workbench">
      <span style={{ width: '50%' }} />
      <span className="block" />
    </div>
  )
}

export function Practice() {
  const { allRead, state, patch } = useFlow()
  const { instructor } = useApp()
  const learnLink = useCallback((block: string) => {
    const s = learnSection(BLOCK_TO_SECTION[block] ?? '')
    return s ? { href: `/week/1/learn/${s.id}`, label: `${s.code} ${s.title}` } : null
  }, [])
  if (!allRead && !instructor) return <Locked />
  if (!state.practiceStarted) return <Plan onStart={() => patch('practiceStarted', true)} />
  return (
    <LearnLinkContext.Provider value={learnLink}>
      <Suspense fallback={<WorkbenchSkeleton />}>
        <WorkbenchShell week={1} embedded />
      </Suspense>
    </LearnLinkContext.Provider>
  )
}

