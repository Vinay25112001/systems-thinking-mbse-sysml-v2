// Week 4: flawed AeroLink requirements for the critique-and-rewrite worked example and the quality lab.
// Each flaw is tied to a cited quality characteristic. `heuristics` lists the checks of quality.ts that the
// automatic heuristics raise (as fail or advisory) on the flawed text; `reviewOnly` names findings that only a human
// reviewer can make. The test suite asserts both, so the claim "the heuristics catch X but not Y" stays true.
// Flawed texts are instructor-authored teaching material; rewrites are the reference requirements (FICTIONAL values).
import type { Citation } from '../../content/readings'
import type { CheckId, Draft, Method, ReqType } from './quality'

export type FlawedRequirement = {
  id: string
  flawed: string
  type: ReqType
  method?: Method
  findings: { flaw: string; characteristic: string; cite: Citation }[]
  heuristics: CheckId[]
  reviewOnly?: string
  rewriteId: string
  rewrite: string
}

export const FLAWED: FlawedRequirement[] = [
  {
    id: 'F1',
    flawed: 'The aircraft shall be quiet and shall be safe to operate near homes.',
    type: 'performance',
    findings: [
      { flaw: 'Two “shall”s: two obligations that will be verified, allocated and changed separately.', characteristic: 'Singular', cite: { reading: 'R48', pages: '144' } },
      { flaw: '“Quiet” and “safe” have no measurable criterion; residents, the OEM and the regulator would each read them differently.', characteristic: 'Unambiguous; measurable/quantifiable', cite: { reading: 'R54', pages: '329' } },
    ],
    heuristics: ['single-shall', 'vague', 'measurable'],
    reviewOnly: '“Safe” is not one requirement but many: it has to be decomposed into specific hazards (battery fire, energy reserve, weather) that become their own requirements.',
    rewriteId: 'REQ-SYS-002',
    rewrite: 'The eVTOL aircraft shall produce no more than 65 dBA LAmax at the pad edge during take-off and landing on the published vertiport procedures.',
  },
  {
    id: 'F2',
    flawed: 'The booking app should respond quickly to ride requests.',
    type: 'performance',
    method: 'demonstration',
    findings: [
      { flaw: '“Should” is not binding in a specification.', characteristic: 'Uses “shall” for binding provisions', cite: { reading: 'R54', pages: '330' } },
      { flaw: '“Quickly” cannot be tested: no value, no unit, no starting event.', characteristic: 'Testable (vague statements avoided)', cite: { reading: 'R54', pages: '329' } },
      { flaw: 'Demonstration cannot give the quantitative assurance a response-time requirement needs.', characteristic: 'Verification method appropriate', cite: { reading: 'R49', pages: '149' } },
    ],
    heuristics: ['single-shall', 'binding', 'vague', 'measurable', 'method-fit'],
    reviewOnly: '“The booking app” names one implementation. The obligation belongs to the scheduling function, whatever software or people perform it.',
    rewriteId: 'REQ-SYS-005',
    rewrite: 'The scheduling function shall assign a dispatch-ready aircraft to at least 99 % of confirmed ride requests within 60 s of confirmation.',
  },
  {
    id: 'F3',
    flawed: 'The charging system shall charge each aircraft using two 350 kW DC fast chargers per hub pad.',
    type: 'performance',
    method: 'inspection',
    findings: [
      { flaw: 'States how (charger type, rating and count), not what (the charge time the turnaround needs). It removes the designer’s white space and fixes a cost.', characteristic: 'Design-free', cite: { reading: 'R54', pages: '330' } },
      { flaw: 'Inspection would confirm the chargers exist, not that the turnaround is met.', characteristic: 'Verifiable', cite: { reading: 'R48', pages: '144' } },
    ],
    heuristics: ['design-free', 'method-fit'],
    reviewOnly: 'The heuristics accept “350 kW” as a measurable value, and they flag the design only through word patterns (“using”, a count or rating in front of “chargers”). A variant such as “shall have enough charging hardware at each hub for a 350 kW draw” passes them; only a reviewer sees that the number constrains the design rather than the performance the stakeholder needs.',
    rewriteId: 'REQ-SYS-001',
    rewrite: 'The charging system shall charge an aircraft from any landing state of charge at or above the 20 % reserve to the dispatch threshold within 20 min.',
  },
  {
    id: 'F4',
    flawed: 'The fleet shall maximize availability.',
    type: 'performance',
    method: 'analysis',
    findings: [
      { flaw: '“Maximize” forces an engineer to judge when the design is good enough, and invites a contractual argument.', characteristic: 'Avoid “maximize”/“minimize”', cite: { reading: 'R55', pages: '370' } },
      { flaw: 'No threshold or measurement period, so no verification can pass or fail.', characteristic: 'Measurable/quantifiable', cite: { reading: 'R48', pages: '144' } },
    ],
    heuristics: ['vague', 'measurable'],
    rewriteId: 'REQ-SYS-006',
    rewrite: 'The fleet shall achieve an availability of at least 90 % of scheduled aircraft-hours in each calendar month.',
  },
  {
    id: 'F5',
    flawed: 'The operations system shall not dispatch flights in unsafe weather.',
    type: 'functional',
    method: 'demonstration',
    findings: [
      { flaw: 'A prohibition is very difficult to prove.', characteristic: 'Avoid “shall not”', cite: { reading: 'R55', pages: '370' } },
      { flaw: '“Unsafe weather” hides an unknown: the aircraft weather limits are not yet published.', characteristic: 'Unambiguous; TBX management', cite: { reading: 'R13', pages: '565' } },
    ],
    heuristics: ['negative', 'vague'],
    reviewOnly: 'Seeing that the real problem is a missing value (TBD-01, tracked by U-001) rather than a wording slip takes engineering knowledge of the case.',
    rewriteId: 'REQ-SYS-004',
    rewrite: 'The operations system shall place a dispatch hold on any vertiport whose forecast wind or gust within the next 30 min exceeds the aircraft limit (TBD-01).',
  },
  {
    id: 'F6',
    flawed: 'The vertiport fire detection system shall send a battery-fire alarm to the emergency services dispatch centre in 30 s.',
    type: 'interface',
    method: 'test',
    findings: [
      { flaw: '“In 30 s” is a single point: is 29 s a failure? It also omits the event the time is measured from.', characteristic: 'Avoid one-point values; unambiguous', cite: { reading: 'R55', pages: '370' } },
    ],
    heuristics: ['range'],
    reviewOnly: 'The missing start event (“of detection”) cannot be found by any word-level check; a reviewer has to ask “30 s from what?”.',
    rewriteId: 'REQ-SYS-009',
    rewrite: 'The vertiport fire detection system shall transmit a battery-fire alarm to the emergency services dispatch centre within 30 s of detection.',
  },
]

/** A quality-lab draft that loads a flawed requirement (no rationale or parent yet, so those checks also fail). */
export function draftFromFlawed(f: FlawedRequirement): Draft {
  return { level: 'SYS', name: `Critique ${f.id}`, text: f.flawed, type: f.type, method: f.method, criterion: '', rationale: '', parents: [], arou: [] }
}
