// Week 4: requirement level and type classifier (pure logic).
//
// Levels follow the course's L4 layering: a NEED is the stakeholder's black-box statement of what they need (no
// "shall"); a stakeholder requirement (REQ-STK) is a binding obligation on the AeroLink service as a whole; a system
// requirement (REQ-SYS) is an obligation on an element of it (aircraft, charging system, a function). R13 p.558
// separates needs from requirements; R48 p.141–142 separates stakeholder requirements from the system requirements that
// requirements analysis derives and allocates. The four types are those of the R55 p.368 checklist (a function, the
// performance a function must provide, a constraint on the design, or a reference to an interface definition), which
// RB-3.5 uses; the SEBoK category (R13 p.560, Table 1) is given as a second, complementary scheme. Keys are the
// instructor reference (src/model/reference/week04.ts); "defensible" alternatives are accepted with an explanation.
import { referenceUpTo } from '../../model/reference'
import type { ReqType } from './quality'

const REF = referenceUpTo(4)
/** Statement text of a reference element, so the classifier never drifts from the baseline. */
export const refText = (id: string): string => REF.elements.find((e) => e.id === id)?.text ?? ''

export type ItemLevel = 'need' | 'stakeholder' | 'system'
export type ItemType = ReqType | 'none'
export type SebokCategory = 'Function/Performance' | 'Fit/Operational' | 'Form' | 'Quality' | 'Compliance' | '—'

export const LEVELS: { id: ItemLevel; label: string }[] = [
  { id: 'need', label: 'Need (stakeholder view, no “shall”)' },
  { id: 'stakeholder', label: 'Stakeholder requirement (REQ-STK)' },
  { id: 'system', label: 'System requirement (REQ-SYS)' },
]
export const TYPES: { id: ItemType; label: string }[] = [
  { id: 'functional', label: 'Functional' },
  { id: 'performance', label: 'Performance' },
  { id: 'interface', label: 'Interface' },
  { id: 'constraint', label: 'Constraint' },
  { id: 'none', label: 'Not typed (a need)' },
]

export type ClassItem = {
  id: string
  text: string
  level: ItemLevel
  type: ItemType
  /** Other types a reasoned answer may give; accepted as "defensible". */
  alsoDefensible?: ItemType[]
  sebok: SebokCategory
  why: string
}

export const ITEMS: ClassItem[] = [
  {
    id: 'NEED-004', text: refText('NEED-004'),
    level: 'need', type: 'none', sebok: '—',
    why: 'A need: the operators’ black-box expectation in their own words, with no “shall” and no value. It is the input that REQ-STK-005 transforms into a binding, measurable obligation (R13 p.558).',
  },
  {
    id: 'REQ-STK-005', text: refText('REQ-STK-005'),
    level: 'stakeholder', type: 'performance', sebok: 'Function/Performance',
    why: 'Stakeholder level: the subject is the whole service and the obligation answers NEED-004 directly. Performance: it states how fast a function (turnaround) must be done.',
  },
  {
    id: 'REQ-SYS-001', text: refText('REQ-SYS-001'),
    level: 'system', type: 'performance', sebok: 'Function/Performance',
    why: 'System level: the subject is one element (the charging system), and its 20 min is this element’s share of the 25 min turnaround budget of REQ-STK-005 (budgeting, R13 p.562). Performance: how fast.',
  },
  {
    id: 'REQ-STK-002', text: refText('REQ-STK-002'),
    level: 'stakeholder', type: 'constraint', alsoDefensible: ['performance'], sebok: 'Fit/Operational',
    why: 'For the service the 65 dBA limit is imposed from outside (the local agreement with the city), so it bounds every solution: a constraint. Calling it performance is defensible if you argue it as “how quietly”, but the source of the value is an agreement, not a design target.',
  },
  {
    id: 'REQ-SYS-002', text: refText('REQ-SYS-002'),
    level: 'system', type: 'performance', alsoDefensible: ['constraint'], sebok: 'Function/Performance',
    why: 'The same number, allocated: the aircraft is the noise source, so the community constraint becomes a performance requirement on the aircraft. The type of a requirement can change as it is allocated down a level.',
  },
  {
    id: 'REQ-STK-009', text: refText('REQ-STK-009'),
    level: 'stakeholder', type: 'interface', alsoDefensible: ['functional'], sebok: 'Fit/Operational',
    why: 'Interface: the obligation is an interaction across the boundary with an external system (the ANSP). SEBoK calls an interface requirement a specific form of functional requirement (R13 p.563), so “functional” is defensible; the interface label keeps external interactions visible (R54 p.331).',
  },
  {
    id: 'REQ-SYS-009', text: refText('REQ-SYS-009'),
    level: 'system', type: 'interface', alsoDefensible: ['performance'], sebok: 'Fit/Operational',
    why: 'Interface: it crosses the boundary to an external party (the emergency services dispatch centre). It also has a timing value, so “performance” is defensible; what matters more is that the 30 s is half of the 60 s budget of REQ-STK-008.',
  },
  {
    id: 'REQ-SYS-004', text: refText('REQ-SYS-004'),
    level: 'system', type: 'functional', sebok: 'Function/Performance',
    why: 'Functional: it says what the element must do (place a hold) under a condition. The limit is TBD-01, tracked by U-001; a TBD does not change the type.',
  },
  {
    id: 'REQ-STK-006', text: refText('REQ-STK-006'),
    level: 'stakeholder', type: 'functional', sebok: 'Function/Performance',
    why: 'Functional and binary: there is no “how well”, only whether the check happens before every dispatch. A requirement does not need a number to be verifiable; it needs an observable pass condition.',
  },
  {
    id: 'REQ-SYS-010', text: refText('REQ-SYS-010'),
    level: 'system', type: 'constraint', alsoDefensible: ['functional'], sebok: 'Fit/Operational',
    why: 'Constraint: it bounds the design by a limit set outside AeroLink (the utility’s connection agreement). “Functional” is defensible because limiting power is something the charging system does. SEBoK puts power in Fit/Operational (R13 p.560).',
  },
  {
    id: 'REQ-SYS-006', text: refText('REQ-SYS-006'),
    level: 'system', type: 'performance', sebok: 'Quality',
    why: 'Performance in the course scheme (a measured level that a function must reach). In SEBoK’s categories availability is an “-ility”, so Quality: the two schemes answer different questions and both are useful.',
  },
  {
    id: 'NEED-001', text: refText('NEED-001'),
    level: 'need', type: 'none', sebok: '—',
    why: 'A need: “short and predictable” is acceptable in a need, which records the stakeholder’s expectation. Making it measurable (90 % within 15 min) is exactly the engineering step that produces REQ-STK-001.',
  },
]

export type Answer = { level?: ItemLevel; type?: ItemType }
export type ItemVerdict = 'correct' | 'defensible' | 'incorrect' | 'unanswered'
export type ItemFeedback = { id: string; levelOk: boolean | null; type: ItemVerdict; overall: ItemVerdict }

export function gradeItem(item: ClassItem, a: Answer | undefined): ItemFeedback {
  if (!a || !a.level || !a.type) return { id: item.id, levelOk: a?.level ? a.level === item.level : null, type: 'unanswered', overall: 'unanswered' }
  const levelOk = a.level === item.level
  const type: ItemVerdict = a.type === item.type ? 'correct' : item.alsoDefensible?.includes(a.type) ? 'defensible' : 'incorrect'
  const overall: ItemVerdict = !levelOk || type === 'incorrect' ? 'incorrect' : type
  return { id: item.id, levelOk, type, overall }
}

export type Score = { answered: number; correct: number; defensible: number; incorrect: number; levelCorrect: number }
export function scoreAll(answers: Record<string, Answer>, items: ClassItem[] = ITEMS): Score {
  const f = items.map((i) => gradeItem(i, answers[i.id]))
  return {
    answered: f.filter((x) => x.overall !== 'unanswered').length,
    correct: f.filter((x) => x.overall === 'correct').length,
    defensible: f.filter((x) => x.overall === 'defensible').length,
    incorrect: f.filter((x) => x.overall === 'incorrect').length,
    levelCorrect: f.filter((x) => x.levelOk === true).length,
  }
}
