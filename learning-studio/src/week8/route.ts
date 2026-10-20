// Week 8 routes on the lecture-first path (DECISION_LOG A20, A21: the Week 1 architecture is the template), kept out of
// the lazy page chunk so App can route without loading it:
//   /week/8                      the week page (overview)
//   /week/8/lecture/:s[/:slide]  the slide viewer (src/lectures, routed by lectures/route.ts)
//   /week/8/lesson[/:section]    the detailed lesson (src/lectures, routed by lectures/route.ts)
//   /week/8/examples             worked examples: the AeroLink import
//   /week/8/lab                  Lab L8 instructions
//   /week/8/lab/tool             the lab tool: import the Team Record, generate model v0.1
//   /week/8/lab/checker          install and run the course checker (student guide)
//   /week/8/assessment           readiness quiz Q8, the applied exercise and the submission readiness
// The earlier Week 8 page (provisional overview with its draft sources) stays available for instructor review at
// /archive/week/8; the earlier draft modules stay at /draft/:n.
export type Week8Page = 'home' | 'examples' | 'lab' | 'lab-tool' | 'checker' | 'assessment'

export type Week8Route = { page: Week8Page } | { redirect: string }

export const WEEK8_PATHS: Record<Week8Page, string> = {
  home: '/week/8',
  examples: '/week/8/examples',
  lab: '/week/8/lab',
  'lab-tool': '/week/8/lab/tool',
  checker: '/week/8/lab/checker',
  assessment: '/week/8/assessment',
}

export function week8Route(path: string): Week8Route | null {
  const p = path.replace(/\/+$/, '')
  const page = (Object.keys(WEEK8_PATHS) as Week8Page[]).find((k) => WEEK8_PATHS[k] === p)
  if (page) return { page }
  if (p === '/week/8/overview' || p === '/week/8/classic') return { redirect: WEEK8_PATHS.home }
  if (p === '/week/8/practice') return { redirect: WEEK8_PATHS.lab }
  if (p === '/week/8/check') return { redirect: WEEK8_PATHS.assessment }
  if (p === '/week/8/checker') return { redirect: WEEK8_PATHS.checker }
  return null
}

/** The week sub-navigation, in path order. `match` decides the current item from the path. */
export const WEEK8_NAV: { id: string; label: string; short: string; to: string; match: (p: string) => boolean }[] = [
  { id: 'overview', label: 'Overview', short: 'Overview', to: WEEK8_PATHS.home, match: (p) => p === '/week/8' },
  { id: 'lecture', label: 'Lecture', short: 'Lecture', to: '/week/8/lecture/1', match: (p) => p.startsWith('/week/8/lecture') },
  { id: 'lesson', label: 'Lesson', short: 'Lesson', to: '/week/8/lesson', match: (p) => p.startsWith('/week/8/lesson') },
  { id: 'examples', label: 'Worked examples', short: 'Examples', to: WEEK8_PATHS.examples, match: (p) => p.startsWith('/week/8/examples') },
  { id: 'lab', label: 'Laboratory', short: 'Lab', to: WEEK8_PATHS.lab, match: (p) => p.startsWith('/week/8/lab') },
  { id: 'assessment', label: 'Assessment', short: 'Assessment', to: WEEK8_PATHS.assessment, match: (p) => p.startsWith('/week/8/assessment') },
]
