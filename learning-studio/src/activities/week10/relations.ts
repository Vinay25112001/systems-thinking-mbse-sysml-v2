// Week 10 activity 2 (B10.3, pure): which SysML v2 relationship expresses an engineering statement, and what it
// asserts. Every key and explanation is grounded in the cited source (S06 7.21.4 p.168; S10 sl.41, 91, 105-107) or,
// where the course has adopted a convention, in the instructor reference model (sysml/reference/README.md §3.3, §5),
// and says so. Cases use reference IDs; their statements are teaching statements, not reference records.

export type Relation = 'satisfy' | 'not-satisfy' | 'allocate' | 'perform' | 'dependency' | 'no-relationship'

export const RELATIONS: { id: Relation; label: string; hint: string }[] = [
  { id: 'satisfy', label: 'satisfy … by …', hint: 'Asserts that the requirement is satisfied when its subject is bound to the given feature.' },
  { id: 'not-satisfy', label: 'not satisfy … by …', hint: 'Asserts that the feature does not satisfy the requirement.' },
  { id: 'allocate', label: 'allocation … allocate … to …', hint: 'Assigns responsibility for realising the source to the target.' },
  { id: 'perform', label: 'perform (inside the performer)', hint: 'The owning part carries out the action.' },
  { id: 'dependency', label: 'dependency (or the course’s #derivation / tagged dependency)', hint: 'A model-level relationship without instance-level semantics.' },
  { id: 'no-relationship', label: 'No relationship yet: record evidence or a gap instead', hint: 'The statement is not a claim the model should assert now.' },
]

export type RelationCase = { id: string; statement: string; answer: Relation; explanation: string }

export const CASES: RelationCase[] = [
  {
    id: 'c1',
    statement: 'The design team claims that the Scheduling logical element (LOG-005) meets REQ-SYS-005’s 60 s assignment limit; its current latency estimate is 41 s (FICTIONAL).',
    answer: 'satisfy',
    explanation: 'A claim that a design element meets a requirement is a satisfy: it binds the requirement’s subject to LOG-005 and asserts that the requirement evaluates to true for it (S06 p.168; S10 sl.91). It is a claim in the model, not evidence; VER-005 will supply the evidence. LOG-005 is typed by Scheduling, the subject’s definition in the reference.',
  },
  {
    id: 'c2',
    statement: 'FN-004 Assess dispatch weather is to be realised by the operations centre (PHY-004).',
    answer: 'allocate',
    explanation: 'Assigning the responsibility for realising a function to a physical element is an allocation (S10 sl.106). It says who is responsible, not that a requirement is met.',
  },
  {
    id: 'c3',
    statement: 'The Scheduling logical element (LOG-005) carries out FN-011 Dispatch aircraft.',
    answer: 'perform',
    explanation: 'A part that carries out an action is written with perform inside the performer: perform identifies its owner as the performer of the action (S10 sl.41). The reference realises “LOG performs FN” this way (sysml/reference/README.md §3.3).',
  },
  {
    id: 'c4',
    statement: 'In a replayed peak-hour test, 99 % of 200 confirmed requests were assigned within 41 s (FICTIONAL test record).',
    answer: 'no-relationship',
    explanation: 'This is verification evidence, not a design claim, so it is not a satisfy, and none of the relationships offered here records it. In Week 12 it becomes the result of a verification case that verifies REQ-SYS-005, which then supports or refutes the satisfy you asserted. A satisfy does not carry evidence; it asserts truth (S06 p.168).',
  },
  {
    id: 'c5',
    statement: 'REQ-SYS-008 (2 min no-go flag) was written to make REQ-STK-006 (no dispatch with an open no-go fault) achievable.',
    answer: 'dependency',
    explanation: 'Derivation between requirements is a traceability relationship. SysML has no derive keyword; the reference realises the course’s derives-from with the library derivation connection (#derivation) or a tagged dependency (sysml/reference/README.md §3.3; lab plan C.2 rule 4). A dependency is a model-level relationship without instance-level semantics (S10 sl.105).',
  },
  {
    id: 'c6',
    statement: 'The trade study rejected a lower-power charging option; its certified test shows 31 min to the dispatch threshold (FICTIONAL), and the team wants the model to record explicitly that this option does not meet REQ-SYS-001.',
    answer: 'not-satisfy',
    explanation: 'A negated satisfy asserts that the modelled requirement is not satisfied by the given feature (S06 p.168). It is as strong a claim as satisfy, so it needs a basis (here a certified test of a rejected option); without one, record a gap instead.',
  },
  {
    id: 'c7',
    statement: 'The charge-session data link’s message format must be revised whenever the INFO-003 item definition changes.',
    answer: 'dependency',
    explanation: 'One element requires another for its complete specification, so a change to the supplier may necessitate a change to the client: that is a dependency (S10 sl.105). It is not an allocation (no responsibility is assigned) and not a satisfy (no requirement).',
  },
  {
    id: 'c8',
    statement: 'Responsibility for REQ-SYS-001 (20 min charge) is given to the function FN-006 Charge aircraft.',
    answer: 'allocate',
    explanation: 'An allocation can assign the responsibility for realising a requirement’s intent to a function (S10 sl.106); the reference does exactly this for every REQ-SYS. A function is not the subject of REQ-SYS-001 (a ChargingSystems), so satisfy would bind the subject to the wrong kind of thing.',
  },
  {
    id: 'c9',
    statement: 'The supplier’s preliminary estimate for the hub charger is 24 min against REQ-SYS-001’s 20 min; the estimate may still change, and the team has not decided between more charger power and renegotiating REQ-STK-005.',
    answer: 'no-relationship',
    explanation: 'satisfy would assert something the model’s own estimate contradicts; not satisfy would assert a conclusion the team has not reached. The honest record is a satisfy gap: no satisfy, an @Issue on the requirement with candidate, evidence, action and owner, and a row in the L10 gap table (course convention, worked example d).',
  },
  {
    id: 'c10',
    statement: 'IF-005 (aircraft ↔ charger power) contributes to meeting REQ-SYS-001, whose subject is the charging system.',
    answer: 'dependency',
    explanation: 'satisfy binds the requirement’s subject to the satisfier (S06 p.168). An interface is not a charging system, so the reference records the asserting satisfy on PHY-003 and records the interface’s contribution as a tagged #satisfies dependency (sysml/reference/README.md §5).',
  },
]

export type RelationScore = { answered: number; correct: number; perItem: Record<string, boolean | null> }

export function scoreRelations(answers: Record<string, Relation | undefined>, cases: RelationCase[] = CASES): RelationScore {
  const perItem: Record<string, boolean | null> = {}
  let answered = 0
  let correct = 0
  for (const c of cases) {
    const a = answers[c.id]
    if (!a) {
      perItem[c.id] = null
      continue
    }
    answered += 1
    perItem[c.id] = a === c.answer
    if (a === c.answer) correct += 1
  }
  return { answered, correct, perItem }
}
