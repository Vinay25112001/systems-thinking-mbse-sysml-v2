// Week 1 routes on the lecture-first path (DECISION_LOG A20), kept out of the lazy page chunk so App can route without
// loading it. The primary path is Dashboard → Week → Lecture → Lesson → Worked examples → Laboratory → Assessment:
//   /week/1                      the week page (overview)
//   /week/1/lecture/:s[/:slide]  the slide viewer (src/lectures, routed by lectures/route.ts)
//   /week/1/lesson[/:section]    the detailed lesson (src/lectures, routed by lectures/route.ts)
//   /week/1/examples             worked examples: the AeroLink case
//   /week/1/examples/practice    optional "try it yourself": the AeroLink missions 1–4 in the workbench
//   /week/1/lab                  Lab L1 instructions
//   /week/1/lab/tool             the lab tool: the Team enterprise view in the workbench
//   /week/1/assessment           readiness quiz Q1 and Team Record submission readiness
// The self-study routes of the earlier flow redirect to their equivalents (REDIRECTS).
export type Week1Page = 'home' | 'examples' | 'practice' | 'lab' | 'lab-tool' | 'assessment'

export type Week1Route = { page: Week1Page } | { redirect: string }

export const WEEK1_PATHS: Record<Week1Page, string> = {
  home: '/week/1',
  examples: '/week/1/examples',
  practice: '/week/1/examples/practice',
  lab: '/week/1/lab',
  'lab-tool': '/week/1/lab/tool',
  assessment: '/week/1/assessment',
}

/** Earlier self-study routes and where each now leads. A Learn section opens the lesson section that teaches it. */
export const LEARN_TO_LESSON: Record<string, string> = {
  l1: 's1-lesson-teams',
  l2: 's1-lesson-soi',
  l3: 's1-lesson-boundary',
  l4: 's1-lesson-stakeholders',
  l5: 's1-lesson-classifying',
  l6: 's2-l-needs-reqs',
  l7: 's2-l-well-formed',
}

export function week1Route(path: string): Week1Route | null {
  const p = path.replace(/\/+$/, '')
  const page = (Object.keys(WEEK1_PATHS) as Week1Page[]).find((k) => WEEK1_PATHS[k] === p)
  if (page) return { page }
  if (p === '/week/1/overview' || p === '/week/1/classic') return { redirect: WEEK1_PATHS.home }
  if (p === '/week/1/practice') return { redirect: WEEK1_PATHS.lab }
  if (p === '/week/1/check') return { redirect: WEEK1_PATHS.assessment }
  const learn = p.match(/^\/week\/1\/learn(?:\/([a-z0-9-]+))?$/)
  if (learn) return { redirect: learn[1] && LEARN_TO_LESSON[learn[1]] ? `/week/1/lesson/${LEARN_TO_LESSON[learn[1]]}` : '/week/1/lesson' }
  return null
}

/** The week sub-navigation, in path order. `match` decides the current item from the path. */
export const WEEK1_NAV: { id: string; label: string; short: string; to: string; match: (p: string) => boolean }[] = [
  { id: 'overview', label: 'Overview', short: 'Overview', to: WEEK1_PATHS.home, match: (p) => p === '/week/1' },
  { id: 'lecture', label: 'Lecture', short: 'Lecture', to: '/week/1/lecture/1', match: (p) => p.startsWith('/week/1/lecture') },
  { id: 'lesson', label: 'Lesson', short: 'Lesson', to: '/week/1/lesson', match: (p) => p.startsWith('/week/1/lesson') },
  { id: 'examples', label: 'Worked examples', short: 'Examples', to: WEEK1_PATHS.examples, match: (p) => p.startsWith('/week/1/examples') },
  { id: 'lab', label: 'Laboratory', short: 'Lab', to: WEEK1_PATHS.lab, match: (p) => p.startsWith('/week/1/lab') },
  { id: 'assessment', label: 'Assessment', short: 'Assessment', to: WEEK1_PATHS.assessment, match: (p) => p.startsWith('/week/1/assessment') },
]
