// Lazy entry point for the Week 6 pages on the lecture-first path (route.ts). The slide viewer and the reader are routed
// separately (lectures/LectureApp) and carry the same week navigation. Template: src/week5/Week5App.tsx.
import { useEffect } from 'react'
import '../lectures/lectures.css'
import Week6LabTool from '../workbench/week6/Week6LabTool'
import Assessment from './Assessment'
import Examples from './Examples'
import Home from './Home'
import Lab from './Lab'
import type { Week6Page } from './route'
import { Week6Shell } from './WeekShell'

const TITLES: Record<Week6Page, string> = {
  home: 'Overview',
  examples: 'Worked examples',
  lab: 'Laboratory',
  'lab-tool': 'Lab tool: the Week 6 record',
  assessment: 'Assessment and submission',
}

export default function Week6App({ page, path }: { page: Week6Page; path: string }) {
  useEffect(() => {
    window.scrollTo?.(0, 0)
  }, [page])
  return (
    <Week6Shell path={path} title={TITLES[page]}>
      {page === 'home' && <Home />}
      {page === 'examples' && <Examples />}
      {page === 'lab' && <Lab />}
      {page === 'lab-tool' && (
        <div className="wk-page is-tool" data-testid="lab-tool-frame">
          <p className="lf-kicker">Week 6 · Lab tool</p>
          <h1 className="lf-h1">Lab L6 tool: your team’s Week 6 record</h1>
          <p className="lf-muted lf-column">Import your Week 5 record (and, if you can, your Week 3 record), then build Parts 23–27 for your own enterprise; each part is checked as you type, and the roadmap grid, the candidates an increment’s links reach and the baseline-review rows are computed for you. Saved in this browser only: export after every working session.</p>
          <Week6LabTool />
        </div>
      )}
      {page === 'assessment' && <Assessment />}
    </Week6Shell>
  )
}
