// The parts of the worked-examples page (#/week/1/examples), kept apart from the page component (fast refresh).
/** The parts of the page: which worked-example slides and which lesson section each presents. */
export const EXAMPLE_PARTS: { id: string; title: string; intro: string; slides: string[]; lesson: string }[] = [
  { id: 'case', title: '1. The case: enterprise, context and register', intro: 'Every worked example starts from the same data: the enterprise, the system of interest inside it, its context, and the register of fifteen stakeholders with their concerns and relationships.', slides: [], lesson: 's2-l-case-register' },
  { id: 'needs', title: '2. Concern to need in six steps, and the reference set', intro: 'Worked examples I and II: one concern taken to a well-formed need, step by step, then the full corrected set of reference needs that your team’s needs are measured against.', slides: ['s2-worked-steps', 's2-worked-needs'], lesson: 's2-l-case-needs' },
  { id: 'audit', title: '3. Auditing the set for coverage and conflict', intro: 'Worked example III: the stakeholder-by-need audit, the one deliberate gap and why it is defensible, and the conflict between throughput and noise.', slides: ['s2-worked-audit'], lesson: 's2-l-case-audit' },
]
