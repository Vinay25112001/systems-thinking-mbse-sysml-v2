// Lazy entry point for the Week 10 pages on the lecture-first path (route.ts). The slide viewer and the reader are routed
// separately (lectures/LectureApp) and carry the same week navigation. Template: src/week9/Week9App.tsx.
import { useEffect } from 'react'
import '../lectures/lectures.css'
import '../week8/week8.css'
import './week10.css'
import Week10LabTool from '../workbench/week10/Week10LabTool'
import Assessment from './Assessment'
import Examples from './Examples'
import Home from './Home'
import Lab from './Lab'
import type { Week10Page } from './route'
import { Week10Shell } from './WeekShell'

const TITLES: Record<Week10Page, string> = {
  home: 'Overview',
  examples: 'Worked examples',
  lab: 'Laboratory',
  'lab-tool': 'Lab tool: model v0.3',
  assessment: 'Assessment and submission',
}

export default function Week10App({ page, path }: { page: Week10Page; path: string }) {
  useEffect(() => {
    window.scrollTo?.(0, 0)
  }, [page])
  return (
    <Week10Shell path={path} title={TITLES[page]}>
      {page === 'home' && <Home />}
      {page === 'examples' && <Examples />}
      {page === 'lab' && <Lab />}
      {page === 'lab-tool' && (
        <div className="wk-page is-tool" data-testid="lab-tool-frame">
          <p className="lf-kicker">Week 10 · Lab tool</p>
          <h1 className="lf-h1">Lab L10 tool: logical architecture and behavior in your model</h1>
          <p className="lf-muted lf-column">Import your Week 9 model and your Week 2 and Week 4 exports. Decide each function’s items, map one scenario step by step and define one set of operating states; the tool writes model v0.3 and the behavior review for you to check with the course-designated checker. Saved in this browser only: export after every working session.</p>
          <Week10LabTool />
        </div>
      )}
      {page === 'assessment' && <Assessment />}
    </Week10Shell>
  )
}
