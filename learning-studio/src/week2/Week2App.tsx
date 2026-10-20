// Lazy entry point for the Week 2 pages on the lecture-first path (route.ts). The slide viewer and the reader are routed
// separately (lectures/LectureApp) and carry the same week navigation. Template: src/week1/Week1App.tsx.
import { useEffect } from 'react'
import '../lectures/lectures.css'
import Week2LabTool from '../workbench/week2/Week2LabTool'
import Assessment from './Assessment'
import Examples from './Examples'
import Home from './Home'
import Lab from './Lab'
import type { Week2Page } from './route'
import { Week2Shell } from './WeekShell'

const TITLES: Record<Week2Page, string> = {
  home: 'Overview',
  examples: 'Worked examples',
  lab: 'Laboratory',
  'lab-tool': 'Lab tool: the Week 2 record',
  assessment: 'Assessment and submission',
}

export default function Week2App({ page, path }: { page: Week2Page; path: string }) {
  useEffect(() => {
    window.scrollTo?.(0, 0)
  }, [page])
  return (
    <Week2Shell path={path} title={TITLES[page]}>
      {page === 'home' && <Home />}
      {page === 'examples' && <Examples />}
      {page === 'lab' && <Lab />}
      {page === 'lab-tool' && (
        <div className="wk-page is-tool" data-testid="lab-tool-frame">
          <p className="lf-kicker">Week 2 · Lab tool</p>
          <h1 className="lf-h1">Lab L2 tool: your team’s Week 2 record</h1>
          <p className="lf-muted lf-column">Import your Week 1 record, then build Parts 7–11 for your own enterprise; each part is checked as you type. Saved in this browser only: export after every working session.</p>
          <Week2LabTool />
        </div>
      )}
      {page === 'assessment' && <Assessment />}
    </Week2Shell>
  )
}
