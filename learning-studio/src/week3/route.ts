// Week 3 routes on the lecture-first path (DECISION_LOG A20, A21: the Week 1 architecture is the template), kept out of
// the lazy page chunk so App can route without loading it:
//   /week/3                      the week page (overview)
//   /week/3/lecture/:s[/:slide]  the slide viewer (src/lectures, routed by lectures/route.ts)
//   /week/3/lesson[/:section]    the detailed lesson (src/lectures, routed by lectures/route.ts)
//   /week/3/examples             worked examples: the AeroLink case, with the reference catalogue
//   /week/3/lab                  Lab L3 instructions
//   /week/3/lab/tool             the lab tool: the team's Week 3 record, built on its Week 2 export
//   /week/3/assessment           readiness quiz Q3 and the Week 3 record's submission readiness
// The earlier Week 3 page (draft sources for the rebuild) stays available for instructor review at /archive/week/3.
export type Week3Page = 'home' | 'examples' | 'lab' | 'lab-tool' | 'assessment'

export type Week3Route = { page: Week3Page } | { redirect: string }

export const WEEK3_PATHS: Record<Week3Page, string> = {
  home: '/week/3',
  examples: '/week/3/examples',
  lab: '/week/3/lab',
  'lab-tool': '/week/3/lab/tool',
  assessment: '/week/3/assessment',
}

export function week3Route(path: string): Week3Route | null {
  const p = path.replace(/\/+$/, '')
  const page = (Object.keys(WEEK3_PATHS) as Week3Page[]).find((k) => WEEK3_PATHS[k] === p)
  if (page) return { page }
  // the classic and overview aliases lead to the week page; the classic page itself is archived
  if (p === '/week/3/overview' || p === '/week/3/classic') return { redirect: WEEK3_PATHS.home }
  if (p === '/week/3/practice') return { redirect: WEEK3_PATHS.lab }
  if (p === '/week/3/check') return { redirect: WEEK3_PATHS.assessment }
  return null
}

/** The week sub-navigation, in path order. `match` decides the current item from the path. */
export const WEEK3_NAV: { id: string; label: string; short: string; to: string; match: (p: string) => boolean }[] = [
  { id: 'overview', label: 'Overview', short: 'Overview', to: WEEK3_PATHS.home, match: (p) => p === '/week/3' },
  { id: 'lecture', label: 'Lecture', short: 'Lecture', to: '/week/3/lecture/1', match: (p) => p.startsWith('/week/3/lecture') },
  { id: 'lesson', label: 'Lesson', short: 'Lesson', to: '/week/3/lesson', match: (p) => p.startsWith('/week/3/lesson') },
  { id: 'examples', label: 'Worked examples', short: 'Examples', to: WEEK3_PATHS.examples, match: (p) => p.startsWith('/week/3/examples') },
  { id: 'lab', label: 'Laboratory', short: 'Lab', to: WEEK3_PATHS.lab, match: (p) => p.startsWith('/week/3/lab') },
  { id: 'assessment', label: 'Assessment', short: 'Assessment', to: WEEK3_PATHS.assessment, match: (p) => p.startsWith('/week/3/assessment') },
]
