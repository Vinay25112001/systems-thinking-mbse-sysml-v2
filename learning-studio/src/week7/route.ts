// Week 7 routes on the lecture-first path (DECISION_LOG A20, A21 decision 7, A24: the current lecture template), kept out
// of the lazy page chunk so App can route without loading it:
//   /week/7                      the week page (overview)
//   /week/7/lecture/:s[/:slide]  the slide viewer (src/lectures, routed by lectures/route.ts)
//   /week/7/lesson[/:section]    the detailed lesson (src/lectures, routed by lectures/route.ts)
//   /week/7/examples             worked examples: the instructor's AeroLink package and review
//   /week/7/lab                  Lab L7 instructions, with the presentation and review instructions
//   /week/7/lab/tool             the package tool: the team's six exports assembled, audited and reviewed
//   /week/7/assessment           the design-review rubric, the RID form, the graduate task and the package's readiness
// The earlier Week 7 page (draft sources for the rebuild) stays available for instructor review at /archive/week/7.
export type Week7Page = 'home' | 'examples' | 'lab' | 'lab-tool' | 'assessment'

export type Week7Route = { page: Week7Page } | { redirect: string }

export const WEEK7_PATHS: Record<Week7Page, string> = {
  home: '/week/7',
  examples: '/week/7/examples',
  lab: '/week/7/lab',
  'lab-tool': '/week/7/lab/tool',
  assessment: '/week/7/assessment',
}

export function week7Route(path: string): Week7Route | null {
  const p = path.replace(/\/+$/, '')
  const page = (Object.keys(WEEK7_PATHS) as Week7Page[]).find((k) => WEEK7_PATHS[k] === p)
  if (page) return { page }
  // the classic and overview aliases lead to the week page; the classic page itself is archived
  if (p === '/week/7/overview' || p === '/week/7/classic') return { redirect: WEEK7_PATHS.home }
  if (p === '/week/7/practice') return { redirect: WEEK7_PATHS.lab }
  if (p === '/week/7/check') return { redirect: WEEK7_PATHS.assessment }
  return null
}

/** The week sub-navigation, in path order. `match` decides the current item from the path. */
export const WEEK7_NAV: { id: string; label: string; short: string; to: string; match: (p: string) => boolean }[] = [
  { id: 'overview', label: 'Overview', short: 'Overview', to: WEEK7_PATHS.home, match: (p) => p === '/week/7' },
  { id: 'lecture', label: 'Lecture', short: 'Lecture', to: '/week/7/lecture/1', match: (p) => p.startsWith('/week/7/lecture') },
  { id: 'lesson', label: 'Lesson', short: 'Lesson', to: '/week/7/lesson', match: (p) => p.startsWith('/week/7/lesson') },
  { id: 'examples', label: 'Worked examples', short: 'Examples', to: WEEK7_PATHS.examples, match: (p) => p.startsWith('/week/7/examples') },
  { id: 'lab', label: 'Laboratory', short: 'Lab', to: WEEK7_PATHS.lab, match: (p) => p.startsWith('/week/7/lab') },
  { id: 'assessment', label: 'Assessment', short: 'Assessment', to: WEEK7_PATHS.assessment, match: (p) => p.startsWith('/week/7/assessment') },
]
