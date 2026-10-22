// Every page that can render a lecture-deck download link, rendered in a DOM (FD-g link integrity): the
// dashboard, the week pages of Weeks 2–11, the lecture entry card of every week with lectures, and the slide viewer
// of every lecture. scripts/check-student-build.mjs loads this through Vite in student mode and requires every .pptx href
// to resolve to a file shipped in dist-student/. Not imported by the application.
import type { ReactNode } from 'react'
import { renderInDom } from '../lib/renderInDom'
import { LECTURES } from '../content/lectures'
import { Dashboard } from '../pages/Dashboard'
import Week2Home from '../week2/Home'
import Week3Home from '../week3/Home'
import Week4Home from '../week4/Home'
import Week5Home from '../week5/Home'
import Week6Home from '../week6/Home'
import Week7Home from '../week7/Home' // week07
import Week8Home from '../week8/Home'
import Week9Home from '../week9/Home' // week09
import Week10Home from '../week10/Home' // week10
import Week11Home from '../week11/Home' // week11
import { LectureEntry } from './LectureEntry'
import LectureViewer from './LectureViewer'

/** The rendered pages (in a DOM: the dashboard reads the project store) and every deck href each one carries. */
export async function deckLinkPages(): Promise<{ page: string; hrefs: string[] }[]> {
  const pages: [string, ReactNode][] = [
    ['dashboard', <Dashboard />],
    ['week 2 page', <Week2Home />],
    ['week 3 page', <Week3Home />],
    ['week 4 page', <Week4Home />],
    ['week 5 page', <Week5Home />],
    ['week 6 page', <Week6Home />],
    ['week 7 page', <Week7Home />], // week07
    ['week 8 page', <Week8Home />],
    ['week 9 page', <Week9Home />], // week09
    ['week 10 page', <Week10Home />], // week10
    ['week 11 page', <Week11Home />], // week11
    ...[...new Set(LECTURES.map((l) => l.week))].map((w): [string, ReactNode] => [`week ${w} lecture entry`, <LectureEntry week={w} />]),
    ...LECTURES.map((l): [string, ReactNode] => [`week ${l.week} session ${l.session} slide viewer`, <LectureViewer lecture={l} />]),
  ]
  const out: { page: string; hrefs: string[] }[] = []
  for (const [name, node] of pages) out.push({ page: name, hrefs: [...(await renderInDom(node)).matchAll(/href="([^"]*\.pptx)"/g)].map((m) => m[1]) })
  return out
}
