// Every student-visible Week 1 surface rendered to static markup (review M4A F7): each Learn chapter and its back matter,
// the Week 1 Overview and the homepage, plus the strings that only appear after an interaction (knowledge-check feedback).
// Used by learn/surfaces.test.tsx (instructor edition, the faculty gap boxes removed) and by
// scripts/check-student-build.mjs, which loads this module through Vite in student mode, so the scan reads exactly what the
// student build renders. Not imported by the application.
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import week1Missions from '../../content/missions/week01'
import { renderInDom } from '../../lib/renderInDom'
import Homepage from '../../pages/Homepage'
import { AppStateProvider } from '../../state/AppState'
import { WorkspaceProvider } from '../../state/Workspace'
import Lab from '../Lab'
import Overview from '../Overview'
import { WeekShell } from '../WeekShell'
import { knowledgeCheck } from './checks'
import LearnReader from './LearnReader'
import { BACK_MATTER, CHAPTERS } from './textbook'

export type Surface = { route: string; html: string }

// The project store (src/project) uses useSyncExternalStore without a server snapshot and is not read by these pages.
const page = (node: ReactNode) =>
  renderToStaticMarkup(
    <AppStateProvider>
      <WorkspaceProvider>{node}</WorkspaceProvider>
    </AppStateProvider>,
  )

export function studentSurfaces(): Surface[] {
  const out: Surface[] = []
  out.push({ route: '/', html: page(<Homepage />) })
  out.push({ route: '/week/1', html: page(<WeekShell path="/week/1" title="Overview"><Overview /></WeekShell>) })
  for (const c of [...CHAPTERS.map((x) => x.id), ...BACK_MATTER.map((b) => b.id)]) {
    const path = `/week/1/learn/${c}`
    out.push({ route: path, html: page(<LearnReader chapter={c} path={path} />) })
  }
  // the workbench views do not lay out in a DOM without a viewport (resizable panels), so the Guided Practice and lab
  // tool texts are also scanned as data: every string of the Week 1 mission set (briefs, hints, debriefs, rubric labels)
  const strings: string[] = []
  const walk = (v: unknown): void => {
    if (typeof v === 'string') strings.push(v)
    else if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => k !== 'review' && !k.endsWith('Review') && walk(x))
  }
  walk(week1Missions)
  out.push({ route: 'practice and lab tool: Week 1 mission texts', html: strings.map((t) => `<p>${t}</p>`).join('') })
  // knowledge-check feedback is rendered only after "Check my answer"
  const checks = CHAPTERS.flatMap((c) => c.sections.filter((s) => s.check).map((s) => s.check!))
  out.push({ route: 'learn: knowledge-check feedback', html: checks.map((id) => knowledgeCheck(id).options.map((o) => `<p>${o.feedback}</p>`).join('')).join('') })
  return out
}

/** The other Week 1 reading stages (review N6): My Project / Lab and Review & Submit. They read the project store, which
 *  cannot render on a server, so they are rendered in a DOM (jsdom in the test and in the leak check). The Guided
 *  Practice and lab-tool workbench needs a laid-out viewport (resizable panels) and does not render in jsdom, so its
 *  texts are scanned as data (the Week 1 mission texts surface above). */
export async function studentWorkbenchSurfaces(): Promise<Surface[]> {
  // --- m6 --- the Lab L1 brief has its own page; the My Project canvas (every part) and Review & Submit are rendered
  // with a complete fictional project by src/project/canvas/canvasSurfaces.tsx and scanned without a ceiling
  const pages: [string, ReactNode][] = [
    [
      '/week/1/project/instructions',
      <WeekShell path="/week/1/project/instructions" title="Lab instructions">
        <Lab />
      </WeekShell>,
    ],
  ]
  const out: Surface[] = []
  for (const [route, node] of pages) out.push({ route, html: await renderInDom(node) })
  const { canvasSurfaces } = await import('../../project/canvas/canvasSurfaces')
  out.push(...(await canvasSurfaces()))
  // --- end m6 ---
  return out
}

/** The visible text of rendered markup, plus every alt, aria-label and title attribute (read aloud or shown on hover;
 *  review N6): faculty-only gap boxes (instructor edition), tags and entities removed. */
export function visibleText(html: string): string {
  const attrs = [...html.matchAll(/\s(?:alt|aria-label|title)="([^"]*)"/g)].map((m) => m[1]).join(' ‖ ')
  return (html + ' <span>' + attrs + '</span>')
    .replace(/<div class="w1l-gap"[^>]*>(?:<p[^>]*>[\s\S]*?<\/p>)*<\/div>/g, ' ')
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, ' ')
}
