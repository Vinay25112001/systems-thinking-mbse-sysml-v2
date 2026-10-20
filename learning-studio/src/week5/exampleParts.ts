// The parts of the Week 5 worked-examples page (#/week/5/examples), kept apart from the page component (fast refresh).
// Each part shows the worked-example slides as the lecture presents them, then the lesson sections that work them in full
// (both from the single lecture source). exampleParts.test.ts asserts every slide and lesson id resolves.
export const EXAMPLE_PARTS: { id: string; title: string; intro: string; slides: { session: 1 | 2; id: string }[]; lessons: { session: 1 | 2; id: string }[] }[] = [
  {
    id: 'breakdown',
    title: '1. The component breakdown and its responsibility cards',
    intro: 'AeroLink’s Week 4 physical elements as level 1, the level-2 components that help define their interfaces, and a responsibility card for each element: what it is responsible for, who owns it, and the functions the Week 4 allocation already places on it.',
    slides: [{ session: 1, id: 'w5s1-worked-breakdown' }, { session: 1, id: 'w5s1-cards' }],
    lessons: [{ session: 1, id: 'w5-lesson-aerolink-breakdown' }],
  },
  {
    id: 'n2',
    title: '2. The N² chart, built and read',
    intro: 'Every physical and external element on the diagonal, every interface in its cell, the degrees read for the hub and the empty rows, the crossing-flow check against the Week 4 information routes, and the answer to the driving question about the pad incident records.',
    slides: [{ session: 1, id: 'w5s1-worked-n2' }, { session: 1, id: 'w5s1-reading-n2' }, { session: 1, id: 'w5s1-crossing' }, { session: 1, id: 'w5s1-answer' }],
    lessons: [{ session: 1, id: 'w5-lesson-n2' }],
  },
  {
    id: 'definitions',
    title: '3. Interface definitions and interface requirements',
    intro: 'The interface definition table with every column, then interface requirements written by the three steps: the boundary, the interaction, and the requirement on it.',
    slides: [{ session: 1, id: 'w5s1-worked-definitions' }, { session: 1, id: 'w5s1-interface-reqs' }],
    lessons: [{ session: 1, id: 'w5-lesson-table' }, { session: 1, id: 'w5-lesson-requirements' }],
  },
  {
    id: 'management',
    title: '4. Managing an interface change',
    intro: 'One interface change request traced through the N²: the neighbors read from the row and column of the changed interface’s ends, the ones the change actually reaches, the owners whose agreement it needs and the decision with its decider.',
    slides: [{ session: 2, id: 'w5s2-change-control' }],
    lessons: [{ session: 2, id: 'w5-lesson-change' }],
  },
  {
    id: 'security',
    title: '5. Trust boundaries, protection and degraded modes',
    intro: 'Which interfaces cross a trust boundary and why, the protection each needs or the reason it needs none, and what each side does when the interface fails.',
    slides: [{ session: 2, id: 'w5s2-worked-security' }],
    lessons: [{ session: 2, id: 'w5-lesson-security' }, { session: 2, id: 'w5-lesson-degraded' }],
  },
  {
    id: 'audit',
    title: '6. The audit, integration aggregates and coupling',
    intro: 'The interface set audited for gaps, the elements grouped into integration aggregates that keep the interfaces between them few, and the coupling count that Week 4’s architecture decision deferred to this week.',
    slides: [{ session: 2, id: 'w5s2-audit' }, { session: 2, id: 'w5s2-integration' }, { session: 2, id: 'w5s2-coupling' }],
    lessons: [{ session: 2, id: 'w5-lesson-audit' }, { session: 2, id: 'w5-lesson-coupling' }],
  },
]
