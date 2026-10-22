// The parts of the Week 7 worked-examples page (#/week/7/examples), kept apart from the page component (fast refresh).
// Each part shows the worked-example slides as the lecture presents them, then the lesson sections that work them in full
// (both from the single lecture source). exampleParts.test.ts asserts every slide and lesson id resolves.
export const EXAMPLE_PARTS: { id: string; title: string; intro: string; slides: { session: 1 | 2; id: string }[]; lessons: { session: 1 | 2; id: string }[] }[] = [
  {
    id: 'package',
    title: '1. The package and its executive summary',
    intro: 'What the instructor’s package contains, section by section, and the executive summary that opens it: the recommendation, its evidence by ID, its conditions, the residual risk, the decisions the board must make and the next increment.',
    slides: [{ session: 1, id: 'w7s1-package-contents' }, { session: 1, id: 'w7s1-exec-summary' }],
    lessons: [{ session: 1, id: 'w7-lesson-package' }],
  },
  {
    id: 'audit',
    title: '2. One thread, and the package audit',
    intro: 'One AeroLink thread followed through the package by its own links only, from a need to the decision whose condition names its unknown; then the coverage of each trace layer and every finding with its disposition, including the instructor’s own Week 2 dispositions that later weeks made false, and the answer to the board’s question.',
    slides: [{ session: 1, id: 'w7s1-thread-example' }, { session: 1, id: 'w7s1-findings-example' }, { session: 1, id: 'w7s1-readiness' }],
    lessons: [{ session: 1, id: 'w7-lesson-aerolink' }],
  },
  {
    id: 'defend',
    title: '3. Defending the Year-2 decision',
    intro: 'The decision AeroLink defends in its review, as a six-link argument: the claim, the evidence, the criteria, the conditions, the residual risk and what would change it.',
    slides: [{ session: 2, id: 'w7s2-argument' }, { session: 2, id: 'w7s2-trade' }],
    lessons: [{ session: 2, id: 'w7-lesson-defend' }],
  },
  {
    id: 'rids',
    title: '4. Four review findings and their dispositions',
    intro: 'The findings a peer team and the chair raised against the AeroLink package, one of which the audit could not see, each answered with accept, defer or reject and its evidence.',
    slides: [{ session: 2, id: 'w7s2-defend-example' }],
    lessons: [{ session: 2, id: 'w7-lesson-rids' }],
  },
]
