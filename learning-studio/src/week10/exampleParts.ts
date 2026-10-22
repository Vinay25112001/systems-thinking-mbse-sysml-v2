// The parts of the Week 10 worked-examples page (#/week/10/examples), kept apart from the page component (fast refresh).
// Each part shows the worked-example slides as the lecture presents them, then the lesson sections that work them in
// full (both from the single lecture source). A slide or section that does not exist is skipped by the page.
export const EXAMPLE_PARTS: { id: string; title: string; intro: string; slides: { session: 1 | 2; id: string }[]; lessons: { session: 1 | 2; id: string }[] }[] = [
  {
    id: 'logical',
    title: '1. The logical architecture',
    intro: 'The Week 4 logical elements as part usages that perform the functions allocated to them, the Week 9 placeholders reused as their definitions, and the requirements allocated to the functions.',
    slides: [
      { session: 1, id: 'w10s1-worked-logical' },
      { session: 1, id: 'w10s1-req-allocation' },
    ],
    lessons: [{ session: 1, id: 'w10s1-l-structure' }],
  },
  {
    id: 'flow',
    title: '2. A ConOps scenario as an action flow',
    intro: 'The Passenger Transport Mission from the Week 2 ConOps, step by step: each step an action that subsets its function, a decision after each step with alternates, a merge where an alternate rejoins, and the item flows between steps.',
    slides: [{ session: 1, id: 'w10s1-worked-scn002' }],
    lessons: [{ session: 1, id: 'w10s1-l-worked' }],
  },
  {
    id: 'states',
    title: '3. The aircraft’s operating states',
    intro: 'A state definition with an initial state, triggered and guarded transitions and the functions performed in each state, exhibited by a part.',
    slides: [
      { session: 2, id: 'w10s2-worked-states' },
      { session: 2, id: 'w10s2-exhibit' },
    ],
    lessons: [{ session: 2, id: 'w10s2-l-worked-states' }],
  },
  {
    id: 'usecases',
    title: '4. Five scenarios as use cases',
    intro: 'Every Week 2 scenario as a use case: the enterprise as subject, an actor for each modeled stakeholder or external system, and the success end state as the objective.',
    slides: [{ session: 2, id: 'w10s2-worked-usecases' }],
    lessons: [{ session: 2, id: 'w10s2-l-usecases' }],
  },
]
