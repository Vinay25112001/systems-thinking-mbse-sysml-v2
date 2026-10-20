// The parts of the Week 2 worked-examples page (#/week/2/examples), kept apart from the page component (fast refresh).
// Each part shows the worked-example slides as the lecture presents them, then the lesson sections that work them in
// full (both from the single lecture source).
export const EXAMPLE_PARTS: { id: string; title: string; intro: string; slides: { session: 1 | 2; id: string }[]; lessons: { session: 1 | 2; id: string }[] }[] = [
  {
    id: 'conops',
    title: '1. The ConOps and the weather scenario',
    intro: 'The AeroLink ConOps as one picture and one environment table, then the off-nominal scenario SCN-005 written field by field, and the need, assumption and unknown that writing it exposed.',
    slides: [{ session: 1, id: 'w2s1-worked-scn005' }, { session: 1, id: 'w2s1-worked-discoveries' }],
    lessons: [{ session: 1, id: 'w2s1-l-aerolink-conops' }, { session: 1, id: 'w2s1-l-case-scn005' }],
  },
  {
    id: 'coverage',
    title: '2. Coverage and capabilities',
    intro: 'Do the five scenarios exercise the seventeen needs? The coverage matrix and its reasons, then the capability tree and the corrections the Week 1 review requires.',
    slides: [{ session: 1, id: 'w2s1-worked-coverage' }],
    lessons: [{ session: 1, id: 'w2s1-l-case-coverage' }, { session: 1, id: 'w2s1-l-case-capabilities' }],
  },
  {
    id: 'chains',
    title: '3. From need to system requirement',
    intro: 'Three chains: the turnaround budget, the wait and the grid connection with their rationale, and the corrected noise need reaching two stakeholder requirements.',
    slides: [{ session: 1, id: 'w2s1-one-chain' }, { session: 2, id: 'w2s2-worked-chains' }, { session: 2, id: 'w2s2-worked-noise' }],
    lessons: [{ session: 2, id: 'w2s2-l-case-chains' }, { session: 2, id: 'w2s2-l-case-noise' }],
  },
  {
    id: 'critique',
    title: '4. Critique and rewrite',
    intro: 'Six flawed drafts, the defect in each with its source, which defects a word-level check can find and which need a reviewer, and the rewrite.',
    slides: [{ session: 2, id: 'w2s2-worked-critique' }],
    lessons: [{ session: 2, id: 'w2s2-l-case-critique' }],
  },
  {
    id: 'audit',
    title: '5. The trace audit and the measures',
    intro: 'The audit of the reference baseline, with its one deliberate gap and the dispositions of the open items, then the measures and how they link objectives to requirements.',
    slides: [{ session: 2, id: 'w2s2-worked-audit' }, { session: 2, id: 'w2s2-worked-measures' }],
    lessons: [{ session: 2, id: 'w2s2-l-case-audit' }, { session: 2, id: 'w2s2-l-case-measures' }],
  },
]
