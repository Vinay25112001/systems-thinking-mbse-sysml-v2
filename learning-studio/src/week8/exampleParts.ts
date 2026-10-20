// The parts of the Week 8 worked-examples page (#/week/8/examples), kept apart from the page component (fast refresh).
// Each part shows the worked-example slides as the lecture presents them, then the lesson sections that work them in
// full (both from the single lecture source). A slide or section that does not exist is skipped by the page.
export const EXAMPLE_PARTS: { id: string; title: string; intro: string; slides: { session: 1 | 2; id: string }[]; lessons: { session: 1 | 2; id: string }[] }[] = [
  {
    id: 'network',
    title: '1. Definitions describe kinds; usages describe configurations',
    intro: 'The AeroLink vertiport network read token by token: specialization, subsetting and redefinition, and the baseline and recommended configurations as two sibling usages.',
    slides: [{ session: 1, id: 'w8s1-worked-network' }],
    lessons: [{ session: 1, id: 'w8s1-l-worked-network' }],
  },
  {
    id: 'matrix',
    title: '2. The artifact-to-model mapping matrix',
    intro: 'Every ID kind of the AeroLink Phase I package, with the package and construct it becomes and the week that models it, and the model skeleton that mirrors it.',
    slides: [{ session: 2, id: 'w8s2-matrix' }, { session: 2, id: 'w8s2-skeleton' }],
    lessons: [{ session: 2, id: 'w8s2-l-import-method' }, { session: 2, id: 'w8s2-l-skeleton' }],
  },
  {
    id: 'stakeholders',
    title: '3. The context, the stakeholders and the concerns',
    intro: 'The enterprise and its external systems as parts of a context, then every stakeholder, concern and relationship of the corrected Week 1 register as model elements.',
    slides: [{ session: 2, id: 'w8s2-worked-context' }, { session: 2, id: 'w8s2-worked-stakeholders' }],
    lessons: [{ session: 2, id: 'w8s2-l-aerolink-import' }],
  },
  {
    id: 'audit',
    title: '4. Auditing the import',
    intro: 'The four audit questions answered for AeroLink: what the tool answers mechanically, what the instructor had to judge, and the disposition of every gap.',
    slides: [{ session: 2, id: 'w8s2-worked-audit' }],
    lessons: [{ session: 2, id: 'w8s2-l-audit' }],
  },
]
