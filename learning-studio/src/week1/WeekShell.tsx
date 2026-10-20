// Page frame of every Week 1 page outside the lecture viewer and reader: the course top bar (brand, week, instructor
// mode, theme) with the week sub-navigation, then the page. `app` gives the embedded workbench the full viewport.
import { useEffect, type ReactNode } from 'react'
import { WEEKS } from '../content/course'
import { TopBar } from '../flow/Chrome'
import { WeekNav } from './WeekNav'

export function WeekShell({ path, title, app = false, children }: { path: string; title: string; app?: boolean; children: ReactNode }) {
  useEffect(() => {
    document.title = `Week 1 · ${title} · SysML Learning Studio`
  }, [title])
  const w = WEEKS[0]
  return (
    <div className={`lf-root${app ? ' is-app' : ''}`} data-testid="week1-page">
      <a href="#lf-main" className="lf-skip" onClick={(e) => (e.preventDefault(), document.getElementById('lf-main')?.focus())}>
        Skip to content
      </a>
      <TopBar title={`Week ${w.number} — ${w.title}`}>
        <WeekNav path={path} />
      </TopBar>
      <main id="lf-main" tabIndex={-1} className={`lf-main${app ? ' is-workbench' : ''}`}>
        {children}
      </main>
    </div>
  )
}
