// Lazy entry point for the Week 1 pages on the lecture-first path (route.ts). The slide viewer and the reader are
// routed separately (lectures/LectureApp) and carry the same week navigation.
import { useEffect } from 'react'
import '../lectures/lectures.css'
import Assessment from './Assessment'
import Examples from './Examples'
import Home from './Home'
import Lab from './Lab'
import type { Week1Page } from './route'
import Week1Workbench from './Workbench'
import { WeekShell } from './WeekShell'

const TITLES: Record<Exclude<Week1Page, 'practice' | 'lab-tool'>, string> = {
  home: 'Overview',
  examples: 'Worked examples',
  lab: 'Laboratory',
  assessment: 'Assessment and submission',
}

export default function Week1App({ page, path }: { page: Week1Page; path: string }) {
  useEffect(() => {
    window.scrollTo?.(0, 0)
  }, [page])
  if (page === 'lab-tool') return <Week1Workbench key="lab" kind="lab" path={path} />
  if (page === 'practice') return <Week1Workbench key="practice" kind="practice" path={path} />
  return (
    <WeekShell path={path} title={TITLES[page]}>
      {page === 'home' && <Home />}
      {page === 'examples' && <Examples />}
      {page === 'lab' && <Lab />}
      {page === 'assessment' && <Assessment />}
    </WeekShell>
  )
}
