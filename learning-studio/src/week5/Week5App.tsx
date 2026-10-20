// Lazy entry point for the Week 5 pages on the lecture-first path (route.ts). The slide viewer and the reader are routed
// separately (lectures/LectureApp) and carry the same week navigation. Template: src/week4/Week4App.tsx.
import { useEffect } from 'react'
import '../lectures/lectures.css'
import Week5LabTool from '../workbench/week5/Week5LabTool'
import Assessment from './Assessment'
import Examples from './Examples'
import Home from './Home'
import Lab from './Lab'
import type { Week5Page } from './route'
import { Week5Shell } from './WeekShell'

const TITLES: Record<Week5Page, string> = {
  home: 'Overview',
  examples: 'Worked examples',
  lab: 'Laboratory',
  'lab-tool': 'Lab tool: the Week 5 record',
  assessment: 'Assessment and submission',
}

export default function Week5App({ page, path }: { page: Week5Page; path: string }) {
  useEffect(() => {
    window.scrollTo?.(0, 0)
  }, [page])
  return (
    <Week5Shell path={path} title={TITLES[page]}>
      {page === 'home' && <Home />}
      {page === 'examples' && <Examples />}
      {page === 'lab' && <Lab />}
      {page === 'lab-tool' && (
        <div className="wk-page is-tool" data-testid="lab-tool-frame">
          <p className="lf-kicker">Week 5 · Lab tool</p>
          <h1 className="lf-h1">Lab L5 tool: your team’s Week 5 record</h1>
          <p className="lf-muted lf-column">Import your Week 4 record, then build Parts 19–22 for your own enterprise; each part is checked as you type, and the N² chart, the degrees, the trust boundaries and the crossing-flow check are computed for you. Saved in this browser only: export after every working session.</p>
          <Week5LabTool />
        </div>
      )}
      {page === 'assessment' && <Assessment />}
    </Week5Shell>
  )
}
