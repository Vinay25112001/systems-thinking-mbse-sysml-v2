// Lazy entry point for the Week 11 pages on the lecture-first path (route.ts). The slide viewer and the reader are routed
// separately (lectures/LectureApp) and carry the same week navigation. Template: src/week10/Week10App.tsx.
import { useEffect } from 'react'
import '../lectures/lectures.css'
import '../week8/week8.css'
import './week11.css'
import Week11LabTool from '../workbench/week11/Week11LabTool'
import Assessment from './Assessment'
import Examples from './Examples'
import Home from './Home'
import Lab from './Lab'
import type { Week11Page } from './route'
import { Week11Shell } from './WeekShell'

const TITLES: Record<Week11Page, string> = {
  home: 'Overview',
  examples: 'Worked examples',
  lab: 'Laboratory',
  'lab-tool': 'Lab tool: model v0.4',
  assessment: 'Assessment and submission',
}

export default function Week11App({ page, path }: { page: Week11Page; path: string }) {
  useEffect(() => {
    window.scrollTo?.(0, 0)
  }, [page])
  return (
    <Week11Shell path={path} title={TITLES[page]}>
      {page === 'home' && <Home />}
      {page === 'examples' && <Examples />}
      {page === 'lab' && <Lab />}
      {page === 'lab-tool' && (
        <div className="wk-page is-tool" data-testid="lab-tool-frame">
          <p className="lf-kicker">Week 11 · Lab tool</p>
          <h1 className="lf-h1">Lab L11 tool: physical architecture and interfaces in your model</h1>
          <p className="lf-muted lf-column">Import your Week 10 model and your Week 5 export. Link the part definitions, place new functions, set what crosses each interface, allocate the interface requirements and write your satisfy claims; the tool writes model v0.4 and the interface review for you to check with the course-designated checker. Saved in this browser only: export after every working session.</p>
          <Week11LabTool />
        </div>
      )}
      {page === 'assessment' && <Assessment />}
    </Week11Shell>
  )
}
