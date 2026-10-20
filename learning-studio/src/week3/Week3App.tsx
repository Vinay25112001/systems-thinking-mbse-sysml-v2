// Lazy entry point for the Week 3 pages on the lecture-first path (route.ts). The slide viewer and the reader are routed
// separately (lectures/LectureApp) and carry the same week navigation. Template: src/week2/Week2App.tsx.
import { useEffect } from 'react'
import '../lectures/lectures.css'
import Week3LabTool from '../workbench/week3/Week3LabTool'
import Assessment from './Assessment'
import Examples from './Examples'
import Home from './Home'
import Lab from './Lab'
import type { Week3Page } from './route'
import { Week3Shell } from './WeekShell'

const TITLES: Record<Week3Page, string> = {
  home: 'Overview',
  examples: 'Worked examples',
  lab: 'Laboratory',
  'lab-tool': 'Lab tool: the Week 3 record',
  assessment: 'Assessment and submission',
}

export default function Week3App({ page, path }: { page: Week3Page; path: string }) {
  useEffect(() => {
    window.scrollTo?.(0, 0)
  }, [page])
  return (
    <Week3Shell path={path} title={TITLES[page]}>
      {page === 'home' && <Home />}
      {page === 'examples' && <Examples />}
      {page === 'lab' && <Lab />}
      {page === 'lab-tool' && (
        <div className="wk-page is-tool" data-testid="lab-tool-frame">
          <p className="lf-kicker">Week 3 · Lab tool</p>
          <h1 className="lf-h1">Lab L3 tool: your team’s Week 3 record</h1>
          <p className="lf-muted lf-column">Import your Week 2 record, then build Parts 11–14 for your own enterprise; each part is checked as you type and the arithmetic is done for you. Saved in this browser only: export after every working session.</p>
          <Week3LabTool />
        </div>
      )}
      {page === 'assessment' && <Assessment />}
    </Week3Shell>
  )
}
