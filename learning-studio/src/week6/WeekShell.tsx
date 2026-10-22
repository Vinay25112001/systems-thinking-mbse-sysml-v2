// Page frame of every Week 6 page outside the lecture viewer and reader: the course top bar with the week
// sub-navigation, then the page. Mirrors src/week1/WeekShell.tsx (the template, read-only).
import { useEffect, type ReactNode } from 'react'
import { WEEKS } from '../content/course'
import { TopBar } from '../flow/Chrome'
import { Week6Nav } from './WeekNav'

export function Week6Shell({ path, title, children }: { path: string; title: string; children: ReactNode }) {
  useEffect(() => {
    document.title = `Week 6 · ${title} · SysML Learning Studio`
  }, [title])
  const w = WEEKS[5]
  return (
    <div className="lf-root" data-testid="week6-page">
      <a href="#lf-main" className="lf-skip" onClick={(e) => (e.preventDefault(), document.getElementById('lf-main')?.focus())}>
        Skip to content
      </a>
      <TopBar title={`Week ${w.number} — ${w.title}`}>
        <Week6Nav path={path} />
      </TopBar>
      <main id="lf-main" tabIndex={-1} className="lf-main">
        {children}
      </main>
    </div>
  )
}
