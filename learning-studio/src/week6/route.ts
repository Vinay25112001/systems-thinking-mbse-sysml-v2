// Week 6 routes on the lecture-first path (DECISION_LOG A20, A21: the Week 1 architecture is the template), kept out of
// the lazy page chunk so App can route without loading it:
//   /week/6                      the week page (overview)
//   /week/6/lecture/:s[/:slide]  the slide viewer (src/lectures, routed by lectures/route.ts)
//   /week/6/lesson[/:section]    the detailed lesson (src/lectures, routed by lectures/route.ts)
//   /week/6/examples             worked examples: the AeroLink roadmap, with the reference catalogue
//   /week/6/lab                  Lab L6 instructions
//   /week/6/lab/tool             the lab tool: the team’s Week 6 record, built on its Week 5 export
//   /week/6/assessment           readiness quiz Q6 and the Week 6 record's submission readiness
// The earlier Week 6 page (draft sources for the rebuild) stays available for instructor review at /archive/week/6.
export type Week6Page = 'home' | 'examples' | 'lab' | 'lab-tool' | 'assessment'

export type Week6Route = { page: Week6Page } | { redirect: string }

export const WEEK6_PATHS: Record<Week6Page, string> = {
  home: '/week/6',
  examples: '/week/6/examples',
  lab: '/week/6/lab',
  'lab-tool': '/week/6/lab/tool',
  assessment: '/week/6/assessment',
}

export function week6Route(path: string): Week6Route | null {
  const p = path.replace(/\/+$/, '')
  const page = (Object.keys(WEEK6_PATHS) as Week6Page[]).find((k) => WEEK6_PATHS[k] === p)
  if (page) return { page }
  // the classic and overview aliases lead to the week page; the classic page itself is archived
  if (p === '/week/6/overview' || p === '/week/6/classic') return { redirect: WEEK6_PATHS.home }
  if (p === '/week/6/practice') return { redirect: WEEK6_PATHS.lab }
  if (p === '/week/6/check') return { redirect: WEEK6_PATHS.assessment }
  return null
}

/** The week sub-navigation, in path order. `match` decides the current item from the path. */
export const WEEK6_NAV: { id: string; label: string; short: string; to: string; match: (p: string) => boolean }[] = [
  { id: 'overview', label: 'Overview', short: 'Overview', to: WEEK6_PATHS.home, match: (p) => p === '/week/6' },
  { id: 'lecture', label: 'Lecture', short: 'Lecture', to: '/week/6/lecture/1', match: (p) => p.startsWith('/week/6/lecture') },
  { id: 'lesson', label: 'Lesson', short: 'Lesson', to: '/week/6/lesson', match: (p) => p.startsWith('/week/6/lesson') },
  { id: 'examples', label: 'Worked examples', short: 'Examples', to: WEEK6_PATHS.examples, match: (p) => p.startsWith('/week/6/examples') },
  { id: 'lab', label: 'Laboratory', short: 'Lab', to: WEEK6_PATHS.lab, match: (p) => p.startsWith('/week/6/lab') },
  { id: 'assessment', label: 'Assessment', short: 'Assessment', to: WEEK6_PATHS.assessment, match: (p) => p.startsWith('/week/6/assessment') },
]
