// Lazy entry point for the Week 7 pages on the lecture-first path (route.ts). The slide viewer and the reader are routed
// separately (lectures/LectureApp) and carry the same week navigation. Template: src/week6/Week6App.tsx.
import { useEffect } from 'react'
import '../lectures/lectures.css'
import Week7LabTool from '../workbench/week7/Week7LabTool'
import Assessment from './Assessment'
import Examples from './Examples'
import Home from './Home'
import Lab from './Lab'
import type { Week7Page } from './route'
import { Week7Shell } from './WeekShell'

const TITLES: Record<Week7Page, string> = {
  home: 'Overview',
  examples: 'Worked examples',
  lab: 'Laboratory',
  'lab-tool': 'Package tool: the Systems Thinking Engineering Package',
  assessment: 'Assessment and submission',
}

export default function Week7App({ page, path }: { page: Week7Page; path: string }) {
  useEffect(() => {
    window.scrollTo?.(0, 0)
  }, [page])
  return (
    <Week7Shell path={path} title={TITLES[page]}>
      {page === 'home' && <Home />}
      {page === 'examples' && <Examples />}
      {page === 'lab' && <Lab />}
      {page === 'lab-tool' && (
        <div className="wk-page is-tool" data-testid="lab-tool-frame">
          <p className="lf-kicker">Week 7 · Package tool</p>
          <p className="lf-muted lf-column">Load your six weekly exports; the tool builds the package, computes the coverage and every finding, and checks your dispositions, the executive summary, the review preparation and, after Session 2, the review findings you received. Saved in this browser only: export after every working session.</p>
          <Week7LabTool />
        </div>
      )}
      {page === 'assessment' && <Assessment />}
    </Week7Shell>
  )
}
