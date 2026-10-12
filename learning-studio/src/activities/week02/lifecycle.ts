// Week 2 — life-cycle stage and decision-gate explorer logic (pure).
// Stages and their primary goals: R06b p.384. Decision options at a gate: R06b p.385. Review types (schedule-, event-,
// evidence-based): R06c p.387 (Boehm and Lane, as tabulated in SEBoK). Concurrency of stages and the restart of concept
// for a mid-life upgrade: R06a p.380–381. The AeroLink situations and the answer key are INSTRUCTOR-AUTHORED; every
// AeroLink detail is FICTIONAL.
import type { Citation } from '../../content/readings'

export type StageId = 'concept' | 'development' | 'production' | 'utilization' | 'support' | 'retirement'
export const STAGES: { id: StageId; label: string; goal: string }[] = [
  { id: 'concept', label: 'Concept', goal: 'Identify stakeholders’ needs, explore concepts, propose viable solutions.' },
  { id: 'development', label: 'Development', goal: 'Refine system requirements, create the solution description, build the system, perform verification and validation.' },
  { id: 'production', label: 'Production', goal: 'Produce systems; inspect and test.' },
  { id: 'utilization', label: 'Utilization', goal: 'Operate the system to satisfy users’ needs.' },
  { id: 'support', label: 'Support', goal: 'Provide sustained system capability.' },
  { id: 'retirement', label: 'Retirement', goal: 'Store, archive or dispose of the system.' },
]
export const STAGE_CITE: Citation = { reading: 'R06b', pages: '384' }

export type Keyed<T extends string> = { id: string; text: string; answer: T; why: string; /** Other answers the key accepts, with the reason in `why`. */ alsoAccept?: T[] }

/** True when an answer matches the key's preferred answer or one it also accepts. */
export const isAccepted = <T extends string>(i: Keyed<T>, a: T | undefined) => a !== undefined && (a === i.answer || (i.alsoAccept ?? []).includes(a))

export const STAGE_ITEMS: Keyed<StageId>[] = [
  { id: 's1', text: 'Interview vertiport operators (STK-005) and community groups (STK-004) to find out what they need from the service', answer: 'concept', why: 'Identifying stakeholders’ needs is the first goal of the concept stage.' },
  { id: 's2', text: 'Compare three fleet-charging concepts and propose the one that is viable', answer: 'concept', why: 'Exploring concepts and proposing viable solutions are concept-stage goals; nothing is built yet.' },
  { id: 's3', text: 'Write the solution description for the operations-centre dispatch software and build it', answer: 'development', why: 'Creating the solution description and building the system belong to development.' },
  { id: 's4', text: 'Verify the aircraft–charger interface against its system requirements', answer: 'development', why: 'System verification and validation are listed as development-stage goals (production inspects and tests each produced unit).' },
  { id: 's5', text: 'Inspect and test each aircraft as it leaves final assembly', answer: 'production', why: 'Producing systems and inspecting and testing them is the production stage.' },
  { id: 's6', text: 'Fly scheduled passenger trips between the six vertiports', answer: 'utilization', why: 'Operating the system to satisfy users’ needs is utilization.' },
  { id: 's7', text: 'Replace battery packs and stock spare parts so the fleet stays available', answer: 'support', why: 'Sustaining system capability is the support stage — it runs in parallel with utilization.' },
  { id: 's8', text: 'Dispose of end-of-life battery packs and archive the records of a retired aircraft', answer: 'retirement', why: 'Store, archive or dispose is the retirement stage — which can begin when the first unit retires.' },
  { id: 's9', text: 'While the fleet is flying, explore concepts for a mid-life autonomy upgrade', answer: 'concept', why: 'A mid-life upgrade restarts the concept stage while utilization and support continue: a system of interest can be in several stages at once (R06a p.380–381).' },
]

export type DecisionId = 'begin' | 'continue' | 'restart' | 'pause' | 'terminate'
export const DECISIONS: { id: DecisionId; label: string }[] = [
  { id: 'begin', label: 'Begin another stage or stages' },
  { id: 'continue', label: 'Continue this stage' },
  { id: 'restart', label: 'Go to or restart another stage' },
  { id: 'pause', label: 'Pause activity' },
  { id: 'terminate', label: 'Terminate' },
]
export const DECISION_CITE: Citation = { reading: 'R06b', pages: '385' }

export const GATE_SCENARIOS: (Keyed<DecisionId> & { gate: string })[] = [
  {
    id: 'g1', gate: 'Concept → Development gate',
    text: 'Exit criterion: needs baselined for all 14 reference stakeholders and one viable concept selected. Status: needs are baselined for 12; the noise concern of Communities (STK-004) and the siting position of the City planning authority (STK-013) are unresolved, and the selected concept depends on two contested vertiport sites.',
    answer: 'continue',
    why: 'Looking backwards, an exit criterion is not met; looking forwards, the unresolved siting issue would undermine development. Continue the concept stage with a dated plan to close the two concerns. Beginning development now would build on an unstable concept.',
  },
  {
    id: 'g2', gate: 'Development → Production gate',
    text: 'Exit criteria: all system requirements verified, production-readiness assessment complete, open risks within the agreed threshold. Status: all three met and documented; assumptions and residual risks are recorded.',
    answer: 'begin',
    why: 'Entry and exit criteria are met and documented, so the gate can authorise the next stage. R06c p.387 also asks that assumptions and risks be documented because the proceed decision can carry great uncertainty.',
  },
  {
    id: 'g3', gate: 'Gate review during Utilization',
    text: 'The fleet is in service. The OEM (STK-011) announces that the battery cell used in every aircraft will be discontinued in four years (FICTIONAL). The fleet must keep flying while a replacement battery is developed.',
    answer: 'restart',
    alsoAccept: ['begin'],
    why: 'Preferred: go to (restart) the concept and development stages for a battery upgrade while utilization and support continue — R06a p.381 describes a mid-life upgrade in which the concept, development and production stages “were restarted”. “Begin another stage or stages” (begin a concept stage for the upgrade alongside utilization) is also accepted: R06b p.385 lists both options, and the difference is whether you see the upgrade as re-entering the original stages or as a new stage sequence.',
  },
  {
    id: 'g4', gate: 'Gate review during Development',
    text: 'Investors (STK-003) have frozen further spending for six months until a regulatory decision on the certification basis is published; nothing is technically wrong and the team expects to resume.',
    answer: 'pause',
    why: 'The work is sound but cannot proceed for an external reason expected to clear: pause activity, preserving the baseline, rather than continue spending or terminate.',
  },
  {
    id: 'g5', gate: 'Gate review during Concept',
    text: 'A second concept, a ground-based shuttle, is shown to meet every stakeholder need at a fraction of the cost and the investors withdraw from the air-taxi option permanently (FICTIONAL).',
    answer: 'terminate',
    why: 'When the business case is gone for good, terminating is a legitimate and valuable gate outcome — the gate exists to stop work as well as to start it.',
  },
]

export type ReviewTypeId = 'schedule' | 'event' | 'evidence'
export const REVIEW_TYPES: { id: ReviewTypeId; label: string; opportunity: string; risk: string }[] = [
  { id: 'schedule', label: 'Schedule-based', opportunity: 'Early and frequent feedback', risk: 'Insufficient information to meet the review objectives; failure to make progress' },
  { id: 'event', label: 'Event-based', opportunity: 'More complete information available', risk: 'Insufficient analysis; unresolved technical issues and risks' },
  { id: 'evidence', label: 'Evidence-based', opportunity: 'Higher chance of stakeholder commitment from a more complete risk understanding', risk: 'Late feedback on latent defects, with cost, schedule and technical impacts' },
]
export const REVIEW_CITE: Citation = { reading: 'R06c', pages: '387' }

export const REVIEW_ITEMS: Keyed<ReviewTypeId>[] = [
  { id: 'r1', text: 'A review held on the first Monday of every quarter, as written into the AeroLink–vertiport operator agreement', answer: 'schedule', why: 'Triggered by an explicit date in the agreement.' },
  { id: 'r2', text: 'A review held when the design artefacts listed in the agreement for the charging-interface design phase have been delivered', answer: 'event', why: 'Triggered by the end of a development phase and delivery of artefacts defined in the agreement.' },
  { id: 'r3', text: 'A review held once test evidence shows the battery thermal-runaway risk has been reduced to the agreed level', answer: 'evidence', why: 'Triggered by reaching a specific technical risk level, shown by supplied evidence.' },
]

export type ScoreResult = { correct: number; answered: number; total: number; wrong: string[] }

/** Scores answers against an instructor key. Unanswered items are neither correct nor wrong. */
export function scoreKeyed<T extends string>(items: Keyed<T>[], answers: Record<string, T | undefined>): ScoreResult {
  const answered = items.filter((i) => answers[i.id] !== undefined)
  const wrong = answered.filter((i) => !isAccepted(i, answers[i.id])).map((i) => i.id)
  return { correct: answered.length - wrong.length, answered: answered.length, total: items.length, wrong }
}
