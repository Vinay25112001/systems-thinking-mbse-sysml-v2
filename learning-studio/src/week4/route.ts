// Week 4 routes on the lecture-first path (DECISION_LOG A20, A21: the Week 1 architecture is the template), kept out of
// the lazy page chunk so App can route without loading it:
//   /week/4                      the week page (overview)
//   /week/4/lecture/:s[/:slide]  the slide viewer (src/lectures, routed by lectures/route.ts)
//   /week/4/lesson[/:section]    the detailed lesson (src/lectures, routed by lectures/route.ts)
//   /week/4/examples             worked examples: the AeroLink case, with the reference catalogue
//   /week/4/lab                  Lab L4 instructions
//   /week/4/lab/tool             the lab tool: the team's Week 4 record, built on its Week 3 export
//   /week/4/assessment           readiness quiz Q4 and the Week 4 record's submission readiness
// The earlier Week 4 page (draft sources for the rebuild) stays available for instructor review at /archive/week/4.
export type Week4Page = 'home' | 'examples' | 'lab' | 'lab-tool' | 'assessment'

export type Week4Route = { page: Week4Page } | { redirect: string }

export const WEEK4_PATHS: Record<Week4Page, string> = {
  home: '/week/4',
  examples: '/week/4/examples',
  lab: '/week/4/lab',
  'lab-tool': '/week/4/lab/tool',
  assessment: '/week/4/assessment',
}

export function week4Route(path: string): Week4Route | null {
  const p = path.replace(/\/+$/, '')
  const page = (Object.keys(WEEK4_PATHS) as Week4Page[]).find((k) => WEEK4_PATHS[k] === p)
  if (page) return { page }
  // the classic and overview aliases lead to the week page; the classic page itself is archived
  if (p === '/week/4/overview' || p === '/week/4/classic') return { redirect: WEEK4_PATHS.home }
  if (p === '/week/4/practice') return { redirect: WEEK4_PATHS.lab }
  if (p === '/week/4/check') return { redirect: WEEK4_PATHS.assessment }
  return null
}

/** The week sub-navigation, in path order. `match` decides the current item from the path. */
export const WEEK4_NAV: { id: string; label: string; short: string; to: string; match: (p: string) => boolean }[] = [
  { id: 'overview', label: 'Overview', short: 'Overview', to: WEEK4_PATHS.home, match: (p) => p === '/week/4' },
  { id: 'lecture', label: 'Lecture', short: 'Lecture', to: '/week/4/lecture/1', match: (p) => p.startsWith('/week/4/lecture') },
  { id: 'lesson', label: 'Lesson', short: 'Lesson', to: '/week/4/lesson', match: (p) => p.startsWith('/week/4/lesson') },
  { id: 'examples', label: 'Worked examples', short: 'Examples', to: WEEK4_PATHS.examples, match: (p) => p.startsWith('/week/4/examples') },
  { id: 'lab', label: 'Laboratory', short: 'Lab', to: WEEK4_PATHS.lab, match: (p) => p.startsWith('/week/4/lab') },
  { id: 'assessment', label: 'Assessment', short: 'Assessment', to: WEEK4_PATHS.assessment, match: (p) => p.startsWith('/week/4/assessment') },
]
