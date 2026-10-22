// Page frame of every Week 1 student page (M4 part A): the one student chrome (StudentChrome) with the Week 1 stage bar.
// Reading pages (Overview, Review & Submit) get the expanded app rail; work pages (Learn, Guided Practice, the lab tool)
// get the compact rail (NAV-06). `app` gives an embedded workbench the full remaining viewport.
import type { ReactNode } from 'react'
import { StudentChrome, type Crumb } from './chrome/StudentChrome'
import { WeekNav } from './WeekNav'

export function WeekShell({ path, title, app = false, compact = false, crumbs, children }: { path: string; title: string; app?: boolean; compact?: boolean; crumbs?: Crumb[]; children: ReactNode }) {
  return (
    <div data-testid="week1-page" className="contents">
      <StudentChrome current="course" title={`Week 1 · ${title}`} compact={compact || app} app={app} crumbs={crumbs ?? [{ label: 'Week 1', to: '/week/1' }, { label: title }]} stageBar={<WeekNav path={path} />}>
        {children}
      </StudentChrome>
    </div>
  )
}
