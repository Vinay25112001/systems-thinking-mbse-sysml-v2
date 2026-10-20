// Lazy entry point for the Week 8 pages on the lecture-first path (route.ts). The slide viewer and the reader are routed
// separately (lectures/LectureApp) and carry the same week navigation. Template: src/week1/Week1App.tsx.
import { useEffect } from 'react'
import '../lectures/lectures.css'
import './week8.css'
import Week8LabTool from '../workbench/week8/Week8LabTool'
import Assessment from './Assessment'
import Checker from './Checker'
import Examples from './Examples'
import Home from './Home'
import Lab from './Lab'
import type { Week8Page } from './route'
import { Week8Shell } from './WeekShell'

const TITLES: Record<Week8Page, string> = {
  home: 'Overview',
  examples: 'Worked examples',
  lab: 'Laboratory',
  'lab-tool': 'Lab tool: import and model v0.1',
  checker: 'Install and run the course checker',
  assessment: 'Assessment and submission',
}

export default function Week8App({ page, path }: { page: Week8Page; path: string }) {
  useEffect(() => {
    window.scrollTo?.(0, 0)
  }, [page])
  return (
    <Week8Shell path={path} title={TITLES[page]}>
      {page === 'home' && <Home />}
      {page === 'examples' && <Examples />}
      {page === 'lab' && <Lab />}
      {page === 'lab-tool' && (
        <div className="wk-page is-tool" data-testid="lab-tool-frame">
          <p className="lf-kicker">Week 8 · Lab tool</p>
          <h1 className="lf-h1">Lab L8 tool: import your package, generate model v0.1</h1>
          <p className="lf-muted lf-column">Import your team’s Week 1 Team Record export (and the Week 2 export if you have it). The tool maps every ID to a model package, lists what the import found, and generates your SysML v2 skeleton to check with the course-designated checker. Saved in this browser only: export after every working session.</p>
          <Week8LabTool />
        </div>
      )}
      {page === 'checker' && <Checker />}
      {page === 'assessment' && <Assessment />}
    </Week8Shell>
  )
}
