// The parts of the Week 9 worked-examples page (#/week/9/examples), kept apart from the page component (fast refresh).
// Each part shows the worked-example slides as the lecture presents them, then the lesson sections that work them in
// full (both from the single lecture source). A slide or section that does not exist is skipped by the page.
export const EXAMPLE_PARTS: { id: string; title: string; intro: string; slides: { session: 1 | 2; id: string }[]; lessons: { session: 1 | 2; id: string }[] }[] = [
  {
    id: 'needs',
    title: '1. The Needs package',
    intro: 'A need as a requirement usage: the enterprise as subject, the stakeholder from the Week 8 model as a parameter, and a frame for each concern it answers.',
    slides: [{ session: 1, id: 'w9s1-worked-needs' }],
    lessons: [{ session: 1, id: 'w9s1-l-needs' }],
  },
  {
    id: 'shared',
    title: '2. One definition, three requirements',
    intro: 'Three system requirements that share a form, written as usages of one requirement definition, each binding its own measured feature and limit.',
    slides: [{ session: 1, id: 'w9s1-worked-latency' }],
    lessons: [{ session: 1, id: 'w9s1-l-groups-forms' }],
  },
  {
    id: 'decisions',
    title: '3. Four decisions on AeroLink requirements',
    intro: 'A stakeholder requirement in full, a limit still to be decided, “in still air” as a gate or a reference condition, and a derivation chain from a need to a system requirement.',
    slides: [
      { session: 2, id: 'w9s2-worked-stk' },
      { session: 2, id: 'w9s2-worked-tbd' },
      { session: 2, id: 'w9s2-worked-assume' },
      { session: 2, id: 'w9s2-worked-chain' },
    ],
    lessons: [{ session: 2, id: 'w9s2-l-worked' }],
  },
  {
    id: 'trace',
    title: '4. The trace matrix and its audit',
    intro: 'The needs-to-requirements matrix read from the model’s derivations, the open items it cannot show, and the dispositions.',
    slides: [{ session: 2, id: 'w9s2-trace-matrix' }],
    lessons: [{ session: 2, id: 'w9s2-l-trace' }],
  },
]
