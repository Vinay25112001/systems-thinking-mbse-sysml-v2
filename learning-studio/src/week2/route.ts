// Week 2 routes on the lecture-first path (DECISION_LOG A20, A21: the Week 1 architecture is the template), kept out of
// the lazy page chunk so App can route without loading it:
//   /week/2                      the week page (overview)
//   /week/2/lecture/:s[/:slide]  the slide viewer (src/lectures, routed by lectures/route.ts)
//   /week/2/lesson[/:section]    the detailed lesson (src/lectures, routed by lectures/route.ts)
//   /week/2/examples             worked examples: the AeroLink case, with the reference catalogue
//   /week/2/lab                  Lab L2 instructions
//   /week/2/lab/tool             the lab tool: the team's Week 2 record, built on its Week 1 export
//   /week/2/assessment           readiness quiz Q2 and the Week 2 record's submission readiness
// The earlier Week 2 page (draft sources for the rebuild) stays available for instructor review at /archive/week/2.
export type Week2Page = 'home' | 'examples' | 'lab' | 'lab-tool' | 'assessment'

export type Week2Route = { page: Week2Page } | { redirect: string }

export const WEEK2_PATHS: Record<Week2Page, string> = {
  home: '/week/2',
  examples: '/week/2/examples',
  lab: '/week/2/lab',
  'lab-tool': '/week/2/lab/tool',
  assessment: '/week/2/assessment',
}

export function week2Route(path: string): Week2Route | null {
  const p = path.replace(/\/+$/, '')
  const page = (Object.keys(WEEK2_PATHS) as Week2Page[]).find((k) => WEEK2_PATHS[k] === p)
  if (page) return { page }
  // the classic and overview aliases lead to the week page; the classic page itself is archived
  if (p === '/week/2/overview' || p === '/week/2/classic') return { redirect: WEEK2_PATHS.home }
  if (p === '/week/2/practice') return { redirect: WEEK2_PATHS.lab }
  if (p === '/week/2/check') return { redirect: WEEK2_PATHS.assessment }
  return null
}

/** The week sub-navigation, in path order. `match` decides the current item from the path. */
export const WEEK2_NAV: { id: string; label: string; short: string; to: string; match: (p: string) => boolean }[] = [
  { id: 'overview', label: 'Overview', short: 'Overview', to: WEEK2_PATHS.home, match: (p) => p === '/week/2' },
  { id: 'lecture', label: 'Lecture', short: 'Lecture', to: '/week/2/lecture/1', match: (p) => p.startsWith('/week/2/lecture') },
  { id: 'lesson', label: 'Lesson', short: 'Lesson', to: '/week/2/lesson', match: (p) => p.startsWith('/week/2/lesson') },
  { id: 'examples', label: 'Worked examples', short: 'Examples', to: WEEK2_PATHS.examples, match: (p) => p.startsWith('/week/2/examples') },
  { id: 'lab', label: 'Laboratory', short: 'Lab', to: WEEK2_PATHS.lab, match: (p) => p.startsWith('/week/2/lab') },
  { id: 'assessment', label: 'Assessment', short: 'Assessment', to: WEEK2_PATHS.assessment, match: (p) => p.startsWith('/week/2/assessment') },
]
