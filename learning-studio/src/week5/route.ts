// Week 5 routes on the lecture-first path (DECISION_LOG A20, A21: the Week 1 architecture is the template), kept out of
// the lazy page chunk so App can route without loading it:
//   /week/5                      the week page (overview)
//   /week/5/lecture/:s[/:slide]  the slide viewer (src/lectures, routed by lectures/route.ts)
//   /week/5/lesson[/:section]    the detailed lesson (src/lectures, routed by lectures/route.ts)
//   /week/5/examples             worked examples: the AeroLink case, with the reference catalogue
//   /week/5/lab                  Lab L5 instructions
//   /week/5/lab/tool             the lab tool: the team's Week 5 record, built on its Week 4 export
//   /week/5/assessment           readiness quiz Q5 and the Week 5 record's submission readiness
// The earlier Week 5 page (draft sources for the rebuild) stays available for instructor review at /archive/week/5.
export type Week5Page = 'home' | 'examples' | 'lab' | 'lab-tool' | 'assessment'

export type Week5Route = { page: Week5Page } | { redirect: string }

export const WEEK5_PATHS: Record<Week5Page, string> = {
  home: '/week/5',
  examples: '/week/5/examples',
  lab: '/week/5/lab',
  'lab-tool': '/week/5/lab/tool',
  assessment: '/week/5/assessment',
}

export function week5Route(path: string): Week5Route | null {
  const p = path.replace(/\/+$/, '')
  const page = (Object.keys(WEEK5_PATHS) as Week5Page[]).find((k) => WEEK5_PATHS[k] === p)
  if (page) return { page }
  // the classic and overview aliases lead to the week page; the classic page itself is archived
  if (p === '/week/5/overview' || p === '/week/5/classic') return { redirect: WEEK5_PATHS.home }
  if (p === '/week/5/practice') return { redirect: WEEK5_PATHS.lab }
  if (p === '/week/5/check') return { redirect: WEEK5_PATHS.assessment }
  return null
}

/** The week sub-navigation, in path order. `match` decides the current item from the path. */
export const WEEK5_NAV: { id: string; label: string; short: string; to: string; match: (p: string) => boolean }[] = [
  { id: 'overview', label: 'Overview', short: 'Overview', to: WEEK5_PATHS.home, match: (p) => p === '/week/5' },
  { id: 'lecture', label: 'Lecture', short: 'Lecture', to: '/week/5/lecture/1', match: (p) => p.startsWith('/week/5/lecture') },
  { id: 'lesson', label: 'Lesson', short: 'Lesson', to: '/week/5/lesson', match: (p) => p.startsWith('/week/5/lesson') },
  { id: 'examples', label: 'Worked examples', short: 'Examples', to: WEEK5_PATHS.examples, match: (p) => p.startsWith('/week/5/examples') },
  { id: 'lab', label: 'Laboratory', short: 'Lab', to: WEEK5_PATHS.lab, match: (p) => p.startsWith('/week/5/lab') },
  { id: 'assessment', label: 'Assessment', short: 'Assessment', to: WEEK5_PATHS.assessment, match: (p) => p.startsWith('/week/5/assessment') },
]
