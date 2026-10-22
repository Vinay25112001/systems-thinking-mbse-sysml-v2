// The parts of the Week 11 worked-examples page (#/week/11/examples), kept apart from the page component (fast refresh).
// Each part shows the worked-example slides as the lecture presents them, then the lesson sections that work them in
// full (both from the single lecture source). A slide or section that does not exist is skipped by the page.
export const EXAMPLE_PARTS: { id: string; title: string; intro: string; slides: { session: 1 | 2; id: string }[]; lessons: { session: 1 | 2; id: string }[] }[] = [
  {
    id: 'allocation',
    title: '1. The physical architecture and its allocation',
    intro: 'The Week 4 physical elements and the Week 5 components as parts, the functions each performs, and the logical elements allocated to their physical homes with nested allocations, read as a matrix.',
    slides: [
      { session: 1, id: 'w11s1-parts-physical' },
      { session: 1, id: 'w11s1-worked-allocation' },
    ],
    lessons: [{ session: 1, id: 'w11s1-l-structure' }],
  },
  {
    id: 'ports',
    title: '2. The ports of the charging interface',
    intro: 'One Week 5 interface end to end: what crosses it as items with directions, the port definition from the first end, and the conjugate at the other end.',
    slides: [{ session: 1, id: 'w11s1-worked-ports' }],
    lessons: [{ session: 1, id: 'w11s1-l-worked' }],
  },
  {
    id: 'interfaces',
    title: '3. The interface set',
    intro: 'Every Week 5 interface as a model element: interfaces with ports and flows, connections for agreements, and the hub most of them meet at.',
    slides: [
      { session: 2, id: 'w11s2-interface-def' },
      { session: 2, id: 'w11s2-worked-interfaces' },
    ],
    lessons: [{ session: 2, id: 'w11s2-l-interfaces' }],
  },
  {
    id: 'requirements',
    title: '4. Interface requirements and satisfy claims',
    intro: 'The interface requirements allocated to their interfaces and functions, closing the open items earlier weeks deferred, and two satisfy claims resting on the Week 3 estimates.',
    slides: [
      { session: 2, id: 'w11s2-req-allocation' },
      { session: 2, id: 'w11s2-satisfy' },
    ],
    lessons: [
      { session: 2, id: 'w11s2-l-requirements' },
      { session: 2, id: 'w11s2-l-satisfy' },
    ],
  },
]
