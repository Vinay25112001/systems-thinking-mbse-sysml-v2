// Week 9 routes on the lecture-first path (DECISION_LOG A20, A21, A24: the current approved template), kept out of the
// lazy page chunk so App can route without loading it:
//   /week/9                      the week page (overview)
//   /week/9/lecture/:s[/:slide]  the slide viewer (src/lectures, routed by lectures/route.ts)
//   /week/9/lesson[/:section]    the detailed lesson (src/lectures, routed by lectures/route.ts)
//   /week/9/examples             worked examples: the AeroLink needs and requirements
//   /week/9/lab                  Lab L9 instructions
//   /week/9/lab/tool             the lab tool: Week 8 model + Week 1 and Week 2 exports -> model v0.2
//   /week/9/assessment           readiness quiz Q9, the applied exercise with its rubric, the submission readiness
// The checker is installed and run from the Week 8 guide (/week/8/lab/checker); /week/9/lab/checker redirects there.
// The earlier Week 9 page (provisional overview with its draft sources) stays available for instructor review at
// /archive/week/9.
export type Week9Page = 'home' | 'examples' | 'lab' | 'lab-tool' | 'assessment'

export type Week9Route = { page: Week9Page } | { redirect: string }

export const WEEK9_PATHS: Record<Week9Page, string> = {
  home: '/week/9',
  examples: '/week/9/examples',
  lab: '/week/9/lab',
  'lab-tool': '/week/9/lab/tool',
  assessment: '/week/9/assessment',
}
export const CHECKER_GUIDE = '/week/8/lab/checker'

export function week9Route(path: string): Week9Route | null {
  const p = path.replace(/\/+$/, '')
  const page = (Object.keys(WEEK9_PATHS) as Week9Page[]).find((k) => WEEK9_PATHS[k] === p)
  if (page) return { page }
  if (p === '/week/9/overview' || p === '/week/9/classic') return { redirect: WEEK9_PATHS.home }
  if (p === '/week/9/practice') return { redirect: WEEK9_PATHS.lab }
  if (p === '/week/9/check') return { redirect: WEEK9_PATHS.assessment }
  if (p === '/week/9/lab/checker' || p === '/week/9/checker') return { redirect: CHECKER_GUIDE }
  return null
}

/** The week sub-navigation, in path order. `match` decides the current item from the path. */
export const WEEK9_NAV: { id: string; label: string; short: string; to: string; match: (p: string) => boolean }[] = [
  { id: 'overview', label: 'Overview', short: 'Overview', to: WEEK9_PATHS.home, match: (p) => p === '/week/9' },
  { id: 'lecture', label: 'Lecture', short: 'Lecture', to: '/week/9/lecture/1', match: (p) => p.startsWith('/week/9/lecture') },
  { id: 'lesson', label: 'Lesson', short: 'Lesson', to: '/week/9/lesson', match: (p) => p.startsWith('/week/9/lesson') },
  { id: 'examples', label: 'Worked examples', short: 'Examples', to: WEEK9_PATHS.examples, match: (p) => p.startsWith('/week/9/examples') },
  { id: 'lab', label: 'Laboratory', short: 'Lab', to: WEEK9_PATHS.lab, match: (p) => p.startsWith('/week/9/lab') },
  { id: 'assessment', label: 'Assessment', short: 'Assessment', to: WEEK9_PATHS.assessment, match: (p) => p.startsWith('/week/9/assessment') },
]
