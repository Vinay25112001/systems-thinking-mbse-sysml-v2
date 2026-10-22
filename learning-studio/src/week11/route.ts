// Week 11 routes on the lecture-first path (DECISION_LOG A20, A21, A24: the current approved template), kept out of the
// lazy page chunk so App can route without loading it:
//   /week/11                      the week page (overview)
//   /week/11/lecture/:s[/:slide]  the slide viewer (src/lectures, routed by lectures/route.ts)
//   /week/11/lesson[/:section]    the detailed lesson (src/lectures, routed by lectures/route.ts)
//   /week/11/examples             worked examples: the AeroLink physical architecture and interfaces
//   /week/11/lab                  Lab L11 instructions
//   /week/11/lab/tool             the lab tool: Week 10 model + Week 5 export -> model v0.4
//   /week/11/assessment           readiness quiz Q11, the applied exercise with its rubric, the submission readiness
// The checker is installed and run from the Week 8 guide (/week/8/lab/checker); /week/11/lab/checker redirects there.
// The earlier Week 11 page (the old-outline behavior module with its draft sources) stays available
// for instructor review at /archive/week/11.
export type Week11Page = 'home' | 'examples' | 'lab' | 'lab-tool' | 'assessment'

export type Week11Route = { page: Week11Page } | { redirect: string }

export const WEEK11_PATHS: Record<Week11Page, string> = {
  home: '/week/11',
  examples: '/week/11/examples',
  lab: '/week/11/lab',
  'lab-tool': '/week/11/lab/tool',
  assessment: '/week/11/assessment',
}
export const CHECKER_GUIDE = '/week/8/lab/checker'

export function week11Route(path: string): Week11Route | null {
  const p = path.replace(/\/+$/, '')
  const page = (Object.keys(WEEK11_PATHS) as Week11Page[]).find((k) => WEEK11_PATHS[k] === p)
  if (page) return { page }
  if (p === '/week/11/overview' || p === '/week/11/classic') return { redirect: WEEK11_PATHS.home }
  if (p === '/week/11/practice') return { redirect: WEEK11_PATHS.lab }
  if (p === '/week/11/check') return { redirect: WEEK11_PATHS.assessment }
  if (p === '/week/11/lab/checker' || p === '/week/11/checker') return { redirect: CHECKER_GUIDE }
  return null
}

/** The week sub-navigation, in path order. `match` decides the current item from the path. */
export const WEEK11_NAV: { id: string; label: string; short: string; to: string; match: (p: string) => boolean }[] = [
  { id: 'overview', label: 'Overview', short: 'Overview', to: WEEK11_PATHS.home, match: (p) => p === '/week/11' },
  { id: 'lecture', label: 'Lecture', short: 'Lecture', to: '/week/11/lecture/1', match: (p) => p.startsWith('/week/11/lecture') },
  { id: 'lesson', label: 'Lesson', short: 'Lesson', to: '/week/11/lesson', match: (p) => p.startsWith('/week/11/lesson') },
  { id: 'examples', label: 'Worked examples', short: 'Examples', to: WEEK11_PATHS.examples, match: (p) => p.startsWith('/week/11/examples') },
  { id: 'lab', label: 'Laboratory', short: 'Lab', to: WEEK11_PATHS.lab, match: (p) => p.startsWith('/week/11/lab') },
  { id: 'assessment', label: 'Assessment', short: 'Assessment', to: WEEK11_PATHS.assessment, match: (p) => p.startsWith('/week/11/assessment') },
]
