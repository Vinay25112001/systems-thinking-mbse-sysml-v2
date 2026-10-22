// The parts of the Week 6 worked-examples page (#/week/6/examples), kept apart from the page component (fast refresh).
// Each part shows the worked-example slides as the lecture presents them, then the lesson sections that work them in full
// (both from the single lecture source). exampleParts.test.ts asserts every slide and lesson id resolves.
export const EXAMPLE_PARTS: { id: string; title: string; intro: string; slides: { session: 1 | 2; id: string }[]; lessons: { session: 1 | 2; id: string }[] }[] = [
  {
    id: 'gaps',
    title: '1. The baseline and the capability gaps over three horizons',
    intro: 'AeroLink’s horizons with their lengths, its as-is computed from the Week 3 trade rules and the committed Year-2 step that completes its baseline trajectory, and the gaps and excesses found by comparing the desired capability with that trajectory, each traced to the need or objective behind it.',
    slides: [{ session: 1, id: 'w6s1-gaps' }, { session: 2, id: 'w6s2-baseline' }],
    lessons: [{ session: 1, id: 'w6-lesson-gaps' }],
  },
  {
    id: 'technology',
    title: '2. The technology plan and the insertion rule',
    intro: 'Every technology from the Week 3 readiness assessment classified as available, in development or not yet existing, with its maturity basis and an insertion point or a reason; then each candidate read for maturity, insertability and operational timing.',
    slides: [{ session: 1, id: 'w6s1-technology-table' }, { session: 2, id: 'w6s2-insertion-rule' }],
    lessons: [{ session: 1, id: 'w6-lesson-technology' }],
  },
  {
    id: 'increments',
    title: '3. The increments, their triggers and the transition order',
    intro: 'The committed Year-2 step with its computed transition order, Increments 1 to 3 with their triggers, off-ramps and development approaches, and the assembled roadmap that answers the board’s question.',
    slides: [{ session: 2, id: 'w6s2-increment-1' }, { session: 2, id: 'w6s2-increments-2-3' }, { session: 2, id: 'w6s2-triggers-answer' }],
    lessons: [{ session: 2, id: 'w6-lesson-aerolink' }],
  },
  {
    id: 'security',
    title: '4. Security and resilience across the increments, and the known unknowns',
    intro: 'What each increment changes in security and resilience, the risks it creates (transition risks included), and the unknowns that gate each increment with their owners.',
    slides: [{ session: 2, id: 'w6s2-security-resilience' }, { session: 1, id: 'w6s1-known-unknowns' }],
    lessons: [{ session: 2, id: 'w6-lesson-security' }, { session: 1, id: 'w6-lesson-unknowns' }],
  },
  {
    id: 'impact',
    title: '5. The impact of the autonomy increment, and the Phase I baseline review',
    intro: 'The candidates found by following the record’s links one step from what Increment 3 changes, each judged reached or not reached with a reason; then the week-by-week baseline review that prepares Week 7.',
    slides: [{ session: 2, id: 'w6s2-impact' }, { session: 2, id: 'w6s2-baseline-review' }],
    lessons: [{ session: 2, id: 'w6-lesson-impact' }, { session: 2, id: 'w6-lesson-baseline' }],
  },
]
