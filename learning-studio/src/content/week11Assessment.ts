// Week 11 individual applied exercise (Assessment page), kept separate from the lecture (DECISION_LOG A20): an unseen,
// FICTIONAL case (a rural water-kiosk network) that no slide, worked example or quiz item uses; five tasks; and the
// rubric, five criteria with four level descriptors each (20 points). The instructor key is
// sysml/instructor/week11/exercise_water_kiosk_key.sysml (checked by the course checker; never bundled for students).
// The draft for task 4 is sysml/lectures/week11/exercise_draft_water_kiosk.sysml (checked; sysmlWeek11.test.ts checks
// the fragment is a verbatim excerpt of it). The rubric descriptors name the criteria, never the defects of the draft.
// Review status: new-pending-review.
import { EXERCISE_MINUTES } from './lectures/week11/labBrief'

export const EXERCISE = {
  minutes: EXERCISE_MINUTES,
  title: 'Applied exercise: a rural water-kiosk network (FICTIONAL)',
  brief:
    'A district runs a network of water kiosks. A solar pump station (a solar array and a submersible pump) lifts treated water into a storage tank; a kiosk dispenser sells water from the tank and records every sale; an operations app receives the daily sales; customers pay through a mobile money service outside the network. The district’s Week 4 and Week 5 records give the table below. You may run the course checker, but a PASS earns no points by itself: the exercise is graded on meaning.',
  scenario: {
    name: 'Physical elements and interfaces of the kiosk network',
    actors: 'Elements: PHY-001 Solar pump station (CMP-001 Solar array, CMP-002 Submersible pump), PHY-002 Storage tank, PHY-003 Kiosk dispenser, PHY-004 Operations app; external: EXT-001 Mobile money service',
    trigger: 'Logical element LOG-001 Water supply performs FN-001 Pump water, which Week 4 placed on PHY-001.',
    steps: [
      'IF-001, physical: PHY-001 → PHY-002, water.',
      'IF-002, information: PHY-003 → PHY-004, the daily sales records.',
      'IF-003, information: PHY-003 ↔ EXT-001, payment requests out and payment confirmations back.',
      'IF-004, organizational: PHY-004 and PHY-001, the pump supplier’s maintenance agreement.',
    ],
    alternates: ['REQ-SYS-001: the storage tank shall hold at least 5000 L of treated water.', 'REQ-SYS-002 (interface requirement on IF-002): the kiosk shall send each day’s sales records to the operations app within 1 h of closing.'],
    success: 'The tank supplier’s data sheet gives 6000 L of usable volume.',
  },
  /** The draft for task 4: written with constructs the course checker accepts, and defective in meaning. */
  fragment: [
    'port def PaymentPort {',
    '    out item paymentRequest : PaymentRequest;',
    '    in item paymentConfirmation : PaymentConfirmation;',
    '}',
    'port def SalesPort {',
    '    out item salesRecords : SalesRecords;',
    '}',
    'interface def PaymentLink {',
    '    end port kioskSide : PaymentPort;',
    '    end port moneySide : PaymentPort;',
    '}',
    'interface def SalesLink {',
    '    end port kioskSide : SalesPort;',
    '    end port appSide : ~SalesPort;',
    '    flow appSide.salesRecords to kioskSide.salesRecords;',
    '}',
    'part def KioskDispenser {',
    '    port toMobileMoney : PaymentPort;',
    '    port toApp : SalesPort;',
    '}',
    'part def MobileMoneyService {',
    '    port toKiosk : PaymentPort;',
    '}',
    'part def OperationsApp {',
    '    port fromKiosk : ~SalesPort;',
    '}',
  ],
  tasks: [
    'Model the four physical elements and the two components as part usages inside one part physicalArchitecture, each with its ID as a short name and the components nested in their element; each part definition may be a one-line declaration.',
    'Model IF-001: one port definition with the directed item that crosses it, the port at each end (one end conjugate), an interface definition with the flow, and the interface usage with its ID.',
    'Allocate LOG-001 to the physical element that performs FN-001, with the nested allocation of the function; say in one sentence what the allocation asserts and what it does not.',
    'The draft above passes the checker. Report two defects of meaning in it: for each, its location, the rule of ports or flows it breaks, and an actionable fix.',
    'Write the satisfy claim for REQ-SYS-001 with its design value and basis, and allocate REQ-SYS-002 to its interface and to a function. Graduate students: also argue whether a satisfy claim for REQ-SYS-002 can be defended from this model today, and name the evidence it would need.',
  ],
}

/** The exercise rubric: five criteria, four level descriptors each (4 = exemplary … 1 = beginning), 4 points each. */
export const EXERCISE_RUBRIC: { criterion: string; levels: [string, string, string, string] }[] = [
  {
    criterion: 'Parts and components (task 1)',
    levels: [
      'Each element and component has a part definition and a usage with its ID; the components are nested in their element; the usages sit in one physicalArchitecture part.',
      'All elements and components present; one ID missing or one component placed beside its element.',
      'Usages without definitions, or components modeled as separate top-level elements.',
      'Definitions only, or the elements listed as text.',
    ],
  },
  {
    criterion: 'Ports, interface and flow (task 2)',
    levels: [
      'One port definition with a directed item; one end typed by its conjugate so the out item meets an in item; the interface definition’s ends are ports and its flow runs from the out end to the in end; the usage connects the two ports with dot notation and carries the ID.',
      'The interface is right with one slip: the ID missing, or the flow written in the usage instead of the definition.',
      'A port, an end or the flow is wrong in meaning, or the interface connects the parts instead of their ports.',
      'No port definition, or the interface drawn as a plain dependency.',
    ],
  },
  {
    criterion: 'Allocation (task 3)',
    levels: [
      'The logical part is allocated to the physical part that performs the function, refined by the nested allocation of the function; the sentence says the allocation assigns responsibility and does not show that the design meets a requirement.',
      'The allocation is right; the nested allocation or the sentence is missing.',
      'The function allocated to the wrong element, or the allocation written as a dependency.',
      'No allocation.',
    ],
  },
  {
    criterion: 'Findings on the draft (task 4)',
    levels: [
      'Two real defects of meaning, each with its location, the rule of ports or flows it breaks, with its source, and a fix that removes it.',
      'Two findings, one complete; or two complete findings of which one is not a defect.',
      'One complete finding, or findings without fixes.',
      'No finding, or the answer treats the checker’s PASS as proof that the draft is right.',
    ],
  },
  {
    criterion: 'Satisfy and interface requirement (task 5)',
    levels: [
      'The claim binds the element whose type is the requirement’s subject, redefines the constrained attribute with the design value and states its basis; the interface requirement is allocated to the interface usage and to the function at one end that realizes it. Graduate: the argument separates the assertion from the evidence and names a verification that would supply it.',
      'Claim and allocations present; the basis or one allocation missing (graduate: the argument names no evidence).',
      'The claim binds an element of another type, or the requirement is allocated to an unrelated element.',
      'No claim, or a claim with no element.',
    ],
  },
]
export const EXERCISE_POINTS = EXERCISE_RUBRIC.length * 4
