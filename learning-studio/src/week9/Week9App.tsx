// Lazy entry point for the Week 9 pages on the lecture-first path (route.ts). The slide viewer and the reader are routed
// separately (lectures/LectureApp) and carry the same week navigation. Template: src/week8/Week8App.tsx.
import { useEffect } from 'react'
import '../lectures/lectures.css'
import '../week8/week8.css'
import './week9.css'
import Week9LabTool from '../workbench/week9/Week9LabTool'
import Assessment from './Assessment'
import Examples from './Examples'
import Home from './Home'
import Lab from './Lab'
import type { Week9Page } from './route'
import { Week9Shell } from './WeekShell'

const TITLES: Record<Week9Page, string> = {
  home: 'Overview',
  examples: 'Worked examples',
  lab: 'Laboratory',
  'lab-tool': 'Lab tool: model v0.2',
  assessment: 'Assessment and submission',
}

export default function Week9App({ page, path }: { page: Week9Page; path: string }) {
  useEffect(() => {
    window.scrollTo?.(0, 0)
  }, [page])
  return (
    <Week9Shell path={path} title={TITLES[page]}>
      {page === 'home' && <Home />}
      {page === 'examples' && <Examples />}
      {page === 'lab' && <Lab />}
      {page === 'lab-tool' && (
        <div className="wk-page is-tool" data-testid="lab-tool-frame">
          <p className="lf-kicker">Week 9 · Lab tool</p>
          <h1 className="lf-h1">Lab L9 tool: needs and requirements in your model</h1>
          <p className="lf-muted lf-column">Import your Week 8 model and your Week 1 and Week 2 exports. Decide each requirement’s subject and constraint; the tool writes model v0.2, the trace matrix and the trace audit for you to check with the course-designated checker. Saved in this browser only: export after every working session.</p>
          <Week9LabTool />
        </div>
      )}
      {page === 'assessment' && <Assessment />}
    </Week9Shell>
  )
}
