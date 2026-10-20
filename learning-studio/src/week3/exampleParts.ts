// The parts of the Week 3 worked-examples page (#/week/3/examples), kept apart from the page component (fast refresh).
// Each part shows the worked-example slides as the lecture presents them, then the lesson sections that work them in
// full (both from the single lecture source).
export const EXAMPLE_PARTS: { id: string; title: string; intro: string; slides: { session: 1 | 2; id: string }[]; lessons: { session: 1 | 2; id: string }[] }[] = [
  {
    id: 'readiness',
    title: '1. The readiness assessment',
    intro: 'AeroLink’s three enabling technologies rated on the scale, each on a labeled assumption, the criticality judgment, the lowest critical TRL and what each number hides.',
    slides: [{ session: 1, id: 'w3s1-worked-trl' }],
    lessons: [{ session: 1, id: 'w3-lesson-readiness' }],
  },
  {
    id: 'risk',
    title: '2. Writing, rating and handling risks',
    intro: 'The ordinal-matrix trap worked with numbers, then a security risk with a safety consequence and an external risk handled by transfer, written, rated and handled in full.',
    slides: [{ session: 1, id: 'w3s1-matrix-limits' }, { session: 1, id: 'w3s1-worked-risk' }],
    lessons: [{ session: 1, id: 'w3-lesson-risk-rating' }, { session: 1, id: 'w3-lesson-security-resilience' }],
  },
  {
    id: 'tpm',
    title: '3. TPM margins, the planned profile and the chain',
    intro: 'Worst case and margin for the three TPMs, the correction to the reference margins, the planned profile, the event-cap decision, and one test result traveling through technology, risk, TPM and requirement.',
    slides: [{ session: 1, id: 'w3s1-worked-tpm' }, { session: 1, id: 'w3s1-chain' }],
    lessons: [{ session: 1, id: 'w3-lesson-tpm' }, { session: 1, id: 'w3-lesson-chain' }],
  },
  {
    id: 'trade',
    title: '4. The Year-2 capacity trade',
    intro: 'The frame and the capacities, the criteria with the screens (the capacity requirement, the walk-away points and security) and the resilience criterion, and the scores, values and totals of the alternatives that pass the screens, with one total worked by hand.',
    slides: [{ session: 2, id: 'w3s2-worked-frame' }, { session: 2, id: 'w3s2-worked-criteria' }, { session: 2, id: 'w3s2-worked-scores' }],
    lessons: [{ session: 2, id: 'w3-lesson-aerolink-trade' }],
  },
  {
    id: 'sensitivity',
    title: '5. Sensitivity, the pitfalls and the decision record',
    intro: 'Where the top rank reverses for each weight, the normalization trap worked with the case numbers, and the decision record with its conditions and what would change it.',
    slides: [{ session: 2, id: 'w3s2-worked-sensitivity' }, { session: 2, id: 'w3s2-weighted-sum-pitfalls' }, { session: 2, id: 'w3s2-worked-decision' }],
    lessons: [{ session: 2, id: 'w3-lesson-sensitivity' }, { session: 2, id: 'w3-lesson-pitfalls' }, { session: 2, id: 'w3-lesson-recommendation' }],
  },
]
