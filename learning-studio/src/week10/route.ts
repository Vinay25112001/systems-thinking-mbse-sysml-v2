// Week 10 routes on the lecture-first path (DECISION_LOG A20, A21, A24: the current approved template), kept out of the
// lazy page chunk so App can route without loading it:
//   /week/10                      the week page (overview)
//   /week/10/lecture/:s[/:slide]  the slide viewer (src/lectures, routed by lectures/route.ts)
//   /week/10/lesson[/:section]    the detailed lesson (src/lectures, routed by lectures/route.ts)
//   /week/10/examples             worked examples: the AeroLink logical architecture and behavior
//   /week/10/lab                  Lab L10 instructions
//   /week/10/lab/tool             the lab tool: Week 9 model + Week 2 and Week 4 exports -> model v0.3
//   /week/10/assessment           readiness quiz Q10, the applied exercise with its rubric, the submission readiness
// The checker is installed and run from the Week 8 guide (/week/8/lab/checker); /week/10/lab/checker redirects there.
// The earlier Week 10 page (the old-outline requirements and structure module with its draft sources) stays available
// for instructor review at /archive/week/10.
export type Week10Page = 'home' | 'examples' | 'lab' | 'lab-tool' | 'assessment'

export type Week10Route = { page: Week10Page } | { redirect: string }

export const WEEK10_PATHS: Record<Week10Page, string> = {
  home: '/week/10',
  examples: '/week/10/examples',
  lab: '/week/10/lab',
  'lab-tool': '/week/10/lab/tool',
  assessment: '/week/10/assessment',
}
export const CHECKER_GUIDE = '/week/8/lab/checker'

export function week10Route(path: string): Week10Route | null {
  const p = path.replace(/\/+$/, '')
  const page = (Object.keys(WEEK10_PATHS) as Week10Page[]).find((k) => WEEK10_PATHS[k] === p)
  if (page) return { page }
  if (p === '/week/10/overview' || p === '/week/10/classic') return { redirect: WEEK10_PATHS.home }
  if (p === '/week/10/practice') return { redirect: WEEK10_PATHS.lab }
  if (p === '/week/10/check') return { redirect: WEEK10_PATHS.assessment }
  if (p === '/week/10/lab/checker' || p === '/week/10/checker') return { redirect: CHECKER_GUIDE }
  return null
}

/** The week sub-navigation, in path order. `match` decides the current item from the path. */
export const WEEK10_NAV: { id: string; label: string; short: string; to: string; match: (p: string) => boolean }[] = [
  { id: 'overview', label: 'Overview', short: 'Overview', to: WEEK10_PATHS.home, match: (p) => p === '/week/10' },
  { id: 'lecture', label: 'Lecture', short: 'Lecture', to: '/week/10/lecture/1', match: (p) => p.startsWith('/week/10/lecture') },
  { id: 'lesson', label: 'Lesson', short: 'Lesson', to: '/week/10/lesson', match: (p) => p.startsWith('/week/10/lesson') },
  { id: 'examples', label: 'Worked examples', short: 'Examples', to: WEEK10_PATHS.examples, match: (p) => p.startsWith('/week/10/examples') },
  { id: 'lab', label: 'Laboratory', short: 'Lab', to: WEEK10_PATHS.lab, match: (p) => p.startsWith('/week/10/lab') },
  { id: 'assessment', label: 'Assessment', short: 'Assessment', to: WEEK10_PATHS.assessment, match: (p) => p.startsWith('/week/10/assessment') },
]
