// The parts of the Week 4 worked-examples page (#/week/4/examples), kept apart from the page component (fast refresh).
// Each part shows the worked-example slides as the lecture presents them, then the lesson sections that work them in full
// (both from the single lecture source).
export const EXAMPLE_PARTS: { id: string; title: string; intro: string; slides: { session: 1 | 2; id: string }[]; lessons: { session: 1 | 2; id: string }[] }[] = [
  {
    id: 'views',
    title: '1. The view set, chosen from concerns',
    intro: 'AeroLink’s six viewpoints, each with its purpose written as a question, and the concern coverage computed from the Week 1 register.',
    slides: [{ session: 1, id: 'w4s1-aerolink-views' }],
    lessons: [{ session: 1, id: 'w4-lesson-choosing-views' }],
  },
  {
    id: 'functions',
    title: '2. Functions found by walking scenarios',
    intro: 'Two scenarios walked step by step, the functions they expose, the capability coverage check and the function table with inputs and outputs.',
    slides: [{ session: 1, id: 'w4s1-worked-walk' }, { session: 1, id: 'w4s1-capabilities' }],
    lessons: [{ session: 1, id: 'w4-lesson-walk' }],
  },
  {
    id: 'allocation',
    title: '3. Allocation with reasons, and the decision record',
    intro: 'Function to logical to physical element for every function, each with its criterion and sentence, in the configuration the Week 3 decision chose; then the platform decision tested against a need and two risks.',
    slides: [{ session: 1, id: 'w4s1-worked-allocation' }, { session: 1, id: 'w4s1-decision' }],
    lessons: [{ session: 1, id: 'w4-lesson-allocation' }],
  },
  {
    id: 'information',
    title: '4. The information view, its answer and its audit',
    intro: 'The information items from producer to decision, the flow check that every function flow between two elements travels in an item, the route check against the interfaces, the answer to the driving question, the AI capability cards, and the audit: two defects in the reference and one gap in a new item.',
    slides: [{ session: 2, id: 'w4s2-worked-info' }, { session: 2, id: 'w4s2-answer' }, { session: 2, id: 'w4s2-audit' }],
    lessons: [{ session: 2, id: 'w4-lesson-aerolink-info' }, { session: 2, id: 'w4-lesson-ai' }],
  },
  {
    id: 'evaluation',
    title: '5. Evaluating the architecture',
    intro: 'Requirements, TPMs and risks traced to the elements that carry them, with the computed evidence and the rows still open.',
    slides: [{ session: 2, id: 'w4s2-evaluation-matrix' }],
    lessons: [{ session: 2, id: 'w4-lesson-evaluation' }],
  },
]
