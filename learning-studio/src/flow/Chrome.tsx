// Top bar and stage bar of the book-style flow (and the course welcome, which has no stages).
import { Check, Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from '../lib/router'
import { useApp, type ThemePref } from '../state/AppState'
import { MyProjectLink } from '../project/nav/MyProjectLink'

import { STAGES, stagePath, type FlowStage as Stage } from './route'

function Settings() {
  const { theme, setTheme, instructor, setInstructor } = useApp()
  return (
    <div className="lf-tools">
      <label className="lf-toggle">
        <input type="checkbox" checked={instructor} onChange={(e) => setInstructor(e.target.checked)} />
        <span className={instructor ? 'font-semibold' : ''}>Instructor mode</span>
      </label>
      <label className="lf-toggle">
        <span className="lf-muted">Theme</span>
        <select aria-label="Color theme" className="lf-select" value={theme} onChange={(e) => setTheme(e.target.value as ThemePref)}>
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
    </div>
  )
}

/** `projectCurrent`: the page is part of My Project (the persistent My Project link is marked current). */
export function TopBar({ title, right, children, projectCurrent = false }: { title: string; right?: ReactNode; children?: ReactNode; projectCurrent?: boolean }) {
  const { instructor } = useApp()
  return (
    <header className="lf-top">
      <div className="lf-top-row">
        <Link to="/" className="lf-brand" aria-label="SysML Learning Studio — dashboard">
          SysML Learning Studio
        </Link>
        <span className="lf-weekname" title={title}>
          {title}
        </span>
        <MyProjectLink current={projectCurrent} />
        {right}
        <Settings />
      </div>
      {children}
      {instructor && (
        <div className="lf-instructor" role="status">
          Instructor mode: instructor material is visible, including the faculty notes in the slide viewer. Stored in this browser only.
        </div>
      )}
    </header>
  )
}

export function StageBar({ current, done, locked }: { current: Stage; done: Partial<Record<Stage, boolean>>; locked: Partial<Record<Stage, boolean>> }) {
  return (
    <nav className="lf-stages" aria-label="Week 1 stages">
      <ol>
        {STAGES.map((s, i) => (
          <li key={s.id}>
            <Link to={stagePath(s.id)} className={`lf-stage${done[s.id] ? ' is-done' : ''}`} aria-current={current === s.id ? 'step' : undefined} data-testid={`stage-${s.id}`}>
              <span className="lf-stage-no" aria-hidden>
                {done[s.id] ? <Check size={13} strokeWidth={3} /> : locked[s.id] ? <Lock size={11} /> : i + 1}
              </span>
              <span className="lf-stage-label">
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.short}</span>
                <span className="sr-only">{done[s.id] ? ' (done)' : locked[s.id] ? ' (locked until Learn is complete)' : ''}</span>
                <span className="lf-stage-sub">{s.sub}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}

