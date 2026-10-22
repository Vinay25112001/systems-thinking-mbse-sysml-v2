// Week 1 book-style flow, rebuilt 2026-10-18 for the whiteboard subject "Team Formation / Needs / Identifying
// Stakeholders" (COURSE_SCHEDULE.md; DECISION_LOG A16, A19; review _source_cache/review/week01_feedback_review.md
// F01–F17). Seven Learn sections, the opener, the summary, the practice plan, the Team Record and the model-inputs map.
// Explanations are REFERENCES into the Week 1 blocks (weeks/week01.ts, week1.ts; resolve.ts cuts them). Every item
// written for this flow carries `review: 'new-pending-review'` (search for that string). Each section first works the
// method on AeroLink, the instructor's worked example, then says how the team applies it to its own enterprise.
// Citations stay inside the Week 1 register (course.ts readings and extension); the SysML v2 seeds in MODEL_INPUTS cite
// Phase II slides that were read for this rebuild, and they are labeled as Phase II readings (review F07, F08).
import week01 from '../weeks/week01'
import week1Missions from '../missions/week01'
import { DATA_SHEET, OFFICIAL_ELEMENTS } from '../../model/airtaxi'
import type { Citation } from '../readings'
import { workloadTotal } from '../schema'
import { PENDING, type LearnSection, type NewText } from './types'

const n = (text: string): NewText => ({ text, review: PENDING })

// ------------------------------------------------------------------------------------------- the seven Learn sections
export const LEARN_SECTIONS: LearnSection[] = [
  {
    id: 'l1',
    code: 'L1',
    title: 'Forming your team',
    question: n('How does a team agree how it will work before the engineering starts?'),
    inShort: n('Each member leads one area of the work. The charter records who leads what, how the team decides and communicates, and who owns which kinds of element.'),
    teaser: n('The four lead roles, the team charter, decision rules, communication norms and owned ID prefixes.'),
    objectives: ['B1.1'],
    bloom: 'Apply',
    solo: 'multistructural',
    minutes: 8,
    maxWords: 580,
    body: [{ ref: { block: 'w1-team', para: 0 } }, { ref: { block: 'w1-team', para: 1 }, callout: 'What a team charter records' }, { ref: { block: 'w1-team', para: 2 } }],
    worked: {
      kind: 'steps',
      title: 'Worked example: the charter of a team that rehearses on AeroLink',
      intro: n('A fictional four-person team (initials JS, AK, RM and TL) writes its charter in the first lab. It is an example of the form, not a rule about who must own what.'),
      steps: [
        n('Lead roles. JS leads Requirements & Compliance, AK leads Architecture, RM leads AI & Data Management and TL leads Verification & Validation.'),
        n('Owned ID prefixes. JS owns STK, CON and NEED; AK owns ENT and EXT; RM and TL will own the information, AI and verification elements that later weeks add. TL also reviews every need against the six criteria before each submission.'),
        n('Decision rules. The area lead proposes; the team aims for consensus within one working day; if there is none by then, a majority vote decides, and a tie goes to the instructor at the next lab.'),
        n('Communication norms. One team channel; replies within one working day; a short stand-up after each lab; every decision recorded in the charter log with its date.'),
      ],
    },
    figures: [
      {
        id: 'team-charter',
        title: 'A charter maps roles to owned IDs',
        caption: n('Each lead role owns the kinds of element its area produces this week; the decision rules and communication norms apply to the whole team. Later weeks add prefixes (requirements, architecture, verification) to the same owners.'),
        alt: 'Four role cards in a row: Requirements & Compliance owns STK, CON and NEED; Architecture owns ENT and EXT; AI & Data Management and Verification & Validation own prefixes added in later weeks. Under the cards, a bar labeled decision rules and communication norms spans all four roles.',
        textEquivalent: 'Requirements & Compliance: STK (stakeholders), CON (concerns), NEED (needs). Architecture: ENT (system of interest), EXT (external systems and actors). AI & Data Management: prefixes added in later weeks (information items, AI capabilities). Verification & Validation: prefixes added in later weeks (verification activities), and the need-quality review before submission. Decision rules and communication norms: shared by the whole team.',
        review: PENDING,
      },
    ],
    keyTerms: {
      review: PENDING,
      items: [
        { term: 'Team charter', def: 'The team’s written agreement on lead roles, decision rules, communication norms and owned ID prefixes, made before the work starts.', source: 'course' },
        { term: 'Lead role', def: 'One member answerable for the completeness and consistency of one area: Requirements & Compliance, Architecture, AI & Data Management, or Verification & Validation (merged with Architecture in a three-person team).', source: 'course' },
        { term: 'Decision rule', def: 'How the team decides when members disagree, for example consensus by a deadline and then a vote.', source: 'course' },
        { term: 'Owned ID prefix', def: 'A kind of element (STK, NEED, …) for which one member is accountable: unique IDs, consistency, answers at reviews.', source: 'course' },
        { term: 'Stable ID', def: 'An element ID such as STK-004 that is never reused, even when the element is retired.', source: 'course' },
      ],
    },
    check: {
      id: 'c1',
      bloom: 'Apply',
      solo: 'unistructural',
      objective: 'B1.1',
      prompt: 'Two days before the proposal is due, a four-person team is split two against two between two enterprises, and nobody can say how the tie should be settled. Which part of a team charter was missing?',
      options: [
        { id: 'a', text: 'Decision rules: how the team decides when its members disagree.', correct: true, feedback: 'Yes. Decision rules say how a disagreement is settled, for example consensus by a deadline, then a vote, with a stated tie-break.' },
        { id: 'b', text: 'Communication norms: where the team talks and how fast it replies.', correct: false, feedback: 'No. The team is talking; what it lacks is an agreed way to decide once it has talked.' },
        { id: 'c', text: 'Owned ID prefixes: which member is accountable for which elements.', correct: false, feedback: 'No. Prefixes make one member accountable for a kind of element; they do not settle a choice the whole team must make.' },
        { id: 'd', text: 'A fifth lead role, so that a vote can never end in a tie.', correct: false, feedback: 'No. Roles assign areas of the work, not votes; the course has four lead roles, and a tie-break belongs in the decision rules.' },
      ],
      review: PENDING,
    },
    cite: [],
    convention: n('Course convention: the lead roles (from the course syllabus; three-person teams as the faculty decides), the charter and the stable ID scheme are set by this course, so this section cites no reading.'),
    readMore: [],
    goDeeper: ['w1-team'],
    apply: n('Agree your own charter now: initials for each lead role, each held by a different member (three roles in a three-person team), your decision rules, your communication norms and each member’s owned ID prefixes, with one owner for each of ENT, EXT, STK, CON and NEED. Record it in part 1 of the Team enterprise view (Practice, mission 5); its check tells you exactly what is still missing.'),
  },
  {
    id: 'l2',
    code: 'L2',
    title: 'System, system of interest and enterprise',
    question: n('What exactly is the system your team will engineer, and what is the enterprise around it?'),
    inShort: n('A system is a combination of interacting elements organized for a purpose. The system of interest is the one you choose to study. The enterprise is the wider network of people, organizations and resources that delivers the purpose.'),
    teaser: n('Cited definitions of system, system of interest and enterprise, and what makes a good team enterprise.'),
    objectives: ['B1.2', 'B1.3'],
    bloom: 'Understand',
    solo: 'multistructural',
    minutes: 7,
    maxWords: 660,
    body: [
      {
        text: 'SEBoK’s glossary attributes this definition to ISO/IEC/IEEE 15288:2015, noting that its wording is an expanded version of the standard’s, and calls it the recognized definition for systems engineers: it is meant for engineered systems, created for a purpose that gives value to one or more beneficiaries.',
        provenance: 'source-paraphrase',
        quote: { text: 'combination of interacting elements organized to achieve one or more stated purposes', cite: { reading: 'R38', pages: '1637', note: 'SEBoK glossary; attributed to ISO/IEC/IEEE 15288:2015, in an expanded wording' } },
        cite: [{ reading: 'R38', pages: '1637' }],
        review: PENDING,
        callout: 'Definition: system',
      },
      { ref: { block: 'w1-system', para: 0, sentences: [2, 2] } },
      { ref: { block: 'w1-system', para: 0, sentences: [4, 5] } },
      { ref: { block: 'w1-system', para: 1 }, callout: 'Definition: system of interest' },
      { ref: { block: 'w1-system', para: 2 }, callout: 'Definition: enterprise' },
      { ref: { block: 'w1-system', para: 3 } },
      {
        text: 'Your team’s enterprise can come from any domain the instructor approves, but it has to carry fourteen weeks of work: several interacting parts; people as well as technology; exchanges with systems outside its boundary; stakeholders whose needs differ; and enough substance for Phase II, where you will model its architecture, interfaces and behavior in SysML v2. A single product with no enterprise around it is too small, and a whole industry is too large to state a system of interest for. AeroLink is not available: it is the instructor’s worked example. Your proposal names the enterprise and, inside it, the system of interest your team will engineer.',
        provenance: 'instructor-authored',
        review: PENDING,
        callout: 'Choosing your team’s enterprise (course criteria)',
      },
    ],
    figures: [
      {
        id: 'enterprise-scope',
        title: 'Three scopes in the AeroLink example',
        caption: n('The system of interest is chosen for a question; the company is one organization; the enterprise in SEBoK’s sense is wider than both and takes in resources the company does not own.'),
        alt: 'Three nested regions. The innermost, labeled system of interest, is the AeroLink air-taxi service: fleet, vertiports and chargers, operations center, passenger demand. Beside it, a tag marks AeroLink Urban Mobility, the company, as one organization. The outer region, the AeroLink enterprise in SEBoK’s sense, adds independent vertiport operators, the electric utility’s grid connections, manufacturers’ delivery commitments and funding.',
        textEquivalent: 'System of interest (chosen for a question): the AeroLink air-taxi service, drawn at the wider system of interest: the fleet and operations center AeroLink controls, plus the vertiports and chargers and the passenger demand it needs but does not control. Company: AeroLink Urban Mobility, one organization inside the enterprise. Enterprise (SEBoK sense, wider than the company): adds the independent vertiport operators, the electric utility’s grid connections, the manufacturers’ delivery commitments and the funding.',
        review: PENDING,
      },
    ],
    keyTerms: {
      review: PENDING,
      items: [
        { term: 'System', def: '“Combination of interacting elements organized to achieve one or more stated purposes”: SEBoK attributes it to ISO/IEC/IEEE 15288:2015, noting that its wording is an expanded version of the standard’s, and calls it the recognized definition for systems engineers.', source: { reading: 'R38', pages: '1637' } },
        { term: 'System of interest', def: '“The system whose life cycle is under consideration” (ISO/IEC/IEEE 15288:2015, the common systems engineering definition); in systems science, “the system of interest to an observer”.', source: { reading: 'R39b', pages: '1652' } },
        { term: 'Enterprise', def: 'A purposeful combination (for example, a network) of interdependent resources (people, processes, organizations, supporting technologies, funding) that interact with each other and with their environment to achieve business and operational goals.', source: { reading: 'R07', pages: '815' } },
        { term: 'Enterprise versus organization', def: 'An enterprise includes the organizations that take part but also people, knowledge, processes, policies, facilities and other assets; it is not the same as an organization.', source: { reading: 'R07', pages: '815' } },
        { term: 'Enterprise proposal', def: 'The team’s case for its enterprise: name, domain, mission or purpose, system of interest and boundary, and why it suits a 14-week project; approved by the instructor in Week 1.', source: 'course' },
      ],
    },
    check: {
      id: 'c2',
      bloom: 'Understand',
      solo: 'relational',
      objective: 'B1.2',
      prompt: 'A team proposes “Riverside Transit Authority”, the city’s transit agency, as its enterprise. Which comment fits SEBoK’s definition of an enterprise?',
      options: [
        { id: 'a', text: 'The agency is one organization in it; an enterprise also includes partners, people and funding.', correct: true, feedback: 'Yes. SEBoK warns that an enterprise is not the same as an organization: it includes the organizations that take part, but also people, processes, facilities, funding and other assets. Naming the agency names only one organization in the enterprise.' },
        { id: 'b', text: 'Fine as it stands, because in SEBoK an enterprise and an organization mean exactly the same thing.', correct: false, feedback: 'No. SEBoK calls equating the two a frequent misuse of the term enterprise.' },
        { id: 'c', text: 'An enterprise must be a single company, so the team should name the bus maker instead.', correct: false, feedback: 'No. An enterprise can span several organizations, and some enterprises have no readily identifiable organization at all.' },
        { id: 'd', text: 'An enterprise is a product, so the team should name the buses the agency plans to run.', correct: false, feedback: 'No. The buses are products inside the enterprise; the enterprise is the purposeful combination of resources that delivers the service.' },
      ],
      cite: { reading: 'R07', pages: '815' },
      review: PENDING,
    },
    cite: [{ reading: 'R38', pages: '1637' }, { reading: 'R39b', pages: '1652' }, { reading: 'R07', pages: '815' }],
    readMore: [{ reading: 'R38', pages: '1637' }, { reading: 'R39b', pages: '1652' }, { reading: 'R07', pages: '815' }],
    goDeeper: ['w1-system'],
    apply: n('Draft your enterprise proposal: the enterprise’s name and domain, its mission or purpose in one sentence, the system of interest inside it in one sentence, and a paragraph on why it suits a 14-week project. Record it in part 2 of the Team enterprise view and bring it to the Session 2 checkpoint, where the instructor approves it or asks for a revision. Until the instructor decides, record it as “submitted for approval”.'),
  },
  {
    id: 'l3',
    code: 'L3',
    title: 'Boundary and context',
    question: n('Where does your system of interest stop, and what lies just outside it?'),
    inShort: n('The observer draws the boundary for a purpose. The context records the systems the system of interest works with directly and those that influence it, with what crosses the boundary.'),
    teaser: n('Systemic resolution, the system context, and three candidate boundaries for AeroLink.'),
    objectives: ['B1.2', 'B1.3'],
    bloom: 'Apply',
    solo: 'relational',
    minutes: 7,
    maxWords: 560,
    body: [
      { ref: { block: 'w1-soi', para: 0 } },
      { ref: { block: 'w1-soi', para: 1 } },
      { ref: { block: 'w1-soi', para: 2 }, callout: 'Boundaries are also ethical' },
    ],
    worked: { kind: 'bullets', title: 'Worked example: three candidate systems of interest for one AeroLink question', intro: { block: 'w1-worked', para: 0 }, block: 'w1-worked', bullets: [0, 1, 2, 3] },
    figures: [
      {
        id: 'open-system',
        title: 'AeroLink’s system of interest and its context',
        caption: n('The AeroLink air-taxi service, the system of interest drawn at the wider system of interest, and the six external systems of the instructor reference context (EXT-001 to EXT-006), each with what crosses the boundary. The drawing keeps the pre-revision reference labels; the Session 1 lecture uses the corrected case names, which name each as a system. Which organizations stand behind them is the subject of L4.'),
        alt: 'A rounded boundary labeled AeroLink air-taxi service contains passenger demand, the operations center, the fleet, and vertiports and chargers, joined by arrows. Six external systems sit outside it, each joined to the boundary by a labeled exchange; the weather arrow points one way, into the boundary.',
        textEquivalent: 'Inside the boundary, drawn at the wider system of interest: operations center and fleet (what AeroLink controls); vertiports and chargers and passenger demand (needed by the service but not controlled by AeroLink). Inside links: demand goes to the operations center, which dispatches the fleet, which uses the chargers. Outside, with the exchange that crosses the boundary, under their pre-revision reference labels: EXT-001 Air navigation service provider (airspace access); EXT-002 Electric utility grid (power); EXT-003 Weather (constrains operations; one way, inward); EXT-004 Aircraft manufacturer (aircraft, delivery lead time); EXT-005 Public transport network (passengers); EXT-006 Emergency services (incident response). The corrected case names them as systems: Controlled airspace (air traffic service), Electric grid, Aircraft and spares supply, Emergency response service.',
        review: PENDING,
      },
    ],
    keyTerms: {
      review: PENDING,
      items: [
        { term: 'Systemic resolution', def: 'Focusing complex relationships around a chosen boundary; an ongoing act of attention, not a one-off decision.', source: { reading: 'R02', pages: '264' } },
        { term: 'System context', def: 'The system of interest and its important relationships: the systems it works with directly and those that influence it.', source: { reading: 'R02', pages: '264' } },
        { term: 'Reductionism and holism', def: 'Focusing on a part versus keeping the whole in view; defining a context balances the two.', source: { reading: 'R02', pages: '264' } },
        { term: 'Boundary', def: 'The line the observer draws around the elements that belong together for a purpose; what crosses it is an exchange with the context.', source: 'course' },
        { term: 'External system or actor (EXT)', def: 'A system, person or organization outside the boundary that exchanges something with the system of interest or influences it, and that the team does not design.', source: 'course' },
      ],
    },
    check: {
      id: 'c3',
      bloom: 'Understand',
      solo: 'unistructural',
      objective: 'B1.2',
      prompt: 'SEBoK says that the choice of a boundary is also ethical and political. What reason does it give?',
      options: [
        { id: 'a', text: 'Participants’ relative power and responsibility are key factors in defining the boundary.', correct: true, feedback: 'Yes. Critical systems thinkers such as Churchman treat the relative power and responsibility of the participants in a system intervention as key factors in defining problem boundaries, which is why affected groups have a stake in where the boundary is drawn.' },
        { id: 'b', text: 'Regulators set the boundary of every engineered system by law, long before any design starts.', correct: false, feedback: 'No. The observer draws the boundary for a purpose; regulators are participants whose power matters, not the authors of every boundary.' },
        { id: 'c', text: 'A boundary, once drawn, can never be revisited without political approval from the sponsor.', correct: false, feedback: 'No. SEBoK calls boundary choice an ongoing act of attention, not a one-off decision.' },
        { id: 'd', text: 'The boundary sets the budget, and budgets are always decided by elected officials.', correct: false, feedback: 'No. The reason SEBoK gives is about the participants’ power and responsibility, not about budgets.' },
      ],
      cite: { reading: 'R02', pages: '264' },
      review: PENDING,
    },
    cite: [{ reading: 'R02', pages: '264' }, { reading: 'R50', pages: '46–47' }],
    readMore: [{ reading: 'R02', pages: '264' }],
    goDeeper: ['w1-soi', 'w1-worked'],
    apply: n('Draw your own boundary and context. List what is inside your system of interest (at least three elements, each of which gets a PRT ID), then at least six external systems or actors, each with what crosses the boundary (people, materials, energy, information, approvals) and in which direction. Record the inside elements in part 2 and the context in part 3 of the Team enterprise view.'),
  },
  {
    id: 'l4',
    code: 'L4',
    title: 'Identifying stakeholders',
    question: n('Whose needs must the system meet, and how do you find all of them?'),
    inShort: n('Stakeholders are the individuals, groups and organizations with an interest in the system. Find them from the context, from every life-cycle stage and from the question “who is affected, or could stop us?”, and find the approving authorities early.'),
    teaser: n('The cited definition of stakeholder, why stakeholders come first, where to look, and approving authorities.'),
    objectives: ['B1.4'],
    bloom: 'Apply',
    solo: 'relational',
    minutes: 9,
    maxWords: 880,
    body: [
      { ref: { block: 'w1-se', para: 0, sentences: [0, 0] } },
      {
        text: 'SEBoK’s glossary gives this ISO/IEC/IEEE 15288:2015 definition first. It also records an earlier ISO/IEC definition (an individual, team or organization, or classes of them, with interests in, or concerns relative to, a system) and Freeman’s management definition (any group or individual who can affect or is affected by the achievement of an organization’s objectives).',
        provenance: 'source-paraphrase',
        quote: { text: 'Individual or organization having a right, share, claim, or interest in a system or in its possession of characteristics that meet their needs and expectations', cite: { reading: 'R39a', pages: '1631', note: 'SEBoK glossary, definition (1), ISO/IEC/IEEE 15288:2015' } },
        cite: [{ reading: 'R39a', pages: '1631' }],
        review: PENDING,
        callout: 'Definition: stakeholder',
      },
      { ref: { block: 'w1-stakeholders', para: 0, sentences: [3, 5] } },
      { ref: { block: 'w1-stakeholders', para: 1 } },
      { ref: { block: 'w1-stakeholders', para: 2 } },
      { ref: { block: 'w1-stakeholders', para: 3 }, callout: 'Approving authorities' },
      { ref: { block: 'w1-stakeholders', para: 4 } },
    ],
    worked: { kind: 'bullets', title: 'Worked example: from AeroLink’s context to its stakeholders', intro: { block: 'w1-worked-stakeholders', para: 0 }, block: 'w1-worked-stakeholders', bullets: [0, 1, 2, 3] },
    figures: [
      {
        id: 'stakeholder-sources',
        title: 'Three sources feed one stakeholder register',
        caption: n('Each source finds stakeholders the others can miss: the context finds the organizations behind external systems, the life-cycle stages find people who never use the system, and the last question finds the affected and the opposed.'),
        alt: 'Three source boxes on the left, labeled context, life-cycle stages, and who is affected or could stop us, each with arrows into a register box on the right. Example stakeholders from the AeroLink case sit on each arrow: the air navigation service provider and the electric utility from the context; the FAA, the city planning authority and maintenance technicians from the life-cycle stages; communities near vertiports and accessibility advocates from the last question.',
        textEquivalent: 'From the context: air navigation service provider (STK-007), electric utility (STK-010), aircraft manufacturer (STK-011), emergency responders (STK-006); the weather is context but not a stakeholder. From the life-cycle stages: FAA (STK-002) and city planning authority (STK-013) at concept; passengers (STK-001), pilots and remote operators (STK-008) and vertiport operators (STK-005) in operation; maintenance technicians (STK-009); investors (STK-003) and insurers (STK-012). From “who is affected or could stop us?”: communities near vertiports (STK-004), accessibility advocates (STK-014). All fourteen go into the register.',
        review: PENDING,
      },
    ],
    keyTerms: {
      review: PENDING,
      items: [
        { term: 'Stakeholder', def: 'An individual or organization having a right, share, claim or interest in a system or in its possession of characteristics that meet their needs and expectations (ISO/IEC/IEEE 15288:2015).', source: { reading: 'R39a', pages: '1631' } },
        { term: 'Approving authority', def: 'A stakeholder responsible for formally certifying, qualifying and approving the system for use; there can be several, inside and outside the organization.', source: { reading: 'R11', pages: '553' } },
        { term: 'Internal and external stakeholders', def: 'Stakeholders can be inside or outside the organization that develops or runs the system.', source: { reading: 'R11', pages: '552' } },
        { term: 'Life-cycle stakeholders', def: 'Stakeholders found by walking each life-cycle stage, from concept to disposal.', source: { reading: 'R11', pages: '552' } },
        { term: 'Directly and indirectly impacted', def: 'MITRE asks systems engineers to identify both, not only the people the change affects directly.', source: { reading: 'R63', pages: '234' } },
      ],
    },
    check: {
      id: 'c4',
      bloom: 'Apply',
      solo: 'unistructural',
      objective: 'B1.4',
      prompt: 'An AeroLink team lists candidates for the new vertiport’s stakeholder register. Applying SEBoK’s definitions, which candidate is not a stakeholder?',
      options: [
        { id: 'a', text: 'The weather that grounds flights in storms', correct: true, feedback: 'Yes. The weather belongs to the context, but a stakeholder is an individual, group or organization with an interest; the weather has none.' },
        { id: 'b', text: 'The electric utility that powers the chargers', correct: false, feedback: 'No. The grid is a system in the context, but the utility that runs it is an organization with an interest in the vertiport: a stakeholder.' },
        { id: 'c', text: 'The residents who live next to the vertiport', correct: false, feedback: 'No. Residents are affected by the vertiport even if they never ride: having an interest, or being affected, is enough.' },
        { id: 'd', text: 'The technicians who maintain the aircraft', correct: false, feedback: 'No. Maintainers are on SEBoK’s list of stakeholders; they matter in the logistics and maintenance stage.' },
      ],
      cite: { reading: 'R39a', pages: '1631' },
      review: PENDING,
    },
    cite: [{ reading: 'R01', pages: '51' }, { reading: 'R39a', pages: '1631' }, { reading: 'R11', pages: '552–553' }, { reading: 'R63', pages: '234–235' }],
    readMore: [{ reading: 'R11', pages: '552–553' }, { reading: 'R63', pages: '234–235' }],
    goDeeper: ['w1-stakeholders', 'w1-worked-stakeholders'],
    apply: n('Brainstorm your team’s stakeholders from the same three sources: your context, every life-cycle stage, and who is affected or could stop you. Aim for more than eight, then keep at least eight in part 4 of the Team enterprise view, with at least one approving authority and at least one stakeholder who is not a customer or user.'),
  },
  {
    id: 'l5',
    code: 'L5',
    title: 'Classifying stakeholders and recording their concerns',
    question: n('What does a useful stakeholder register record about each stakeholder?'),
    inShort: n('Classify each stakeholder by role, life-cycle stage, internal or external, and approving authority; write a concern someone else could check; rate influence with a reason; and record conflicts between concerns.'),
    teaser: n('The stakeholder register, four classifications, specific concerns, influence with a reason, and conflicts.'),
    objectives: ['B1.4'],
    bloom: 'Apply',
    solo: 'relational',
    minutes: 9,
    maxWords: 840,
    body: [
      { ref: { block: 'w1-register', para: 0 } },
      { ref: { block: 'w1-register', para: 1 }, callout: 'Four classifications in the course register' },
      { ref: { block: 'w1-register', para: 2 } },
      { ref: { block: 'w1-register', para: 3 } },
    ],
    worked: { kind: 'table', title: 'Worked example: six rows of AeroLink’s stakeholder register', intro: { block: 'w1-worked-register', para: 0 }, block: 'w1-worked-register' },
    afterWorked: [{ ref: { block: 'w1-worked-register', para: 1 } }],
    figures: [
      {
        id: 'register-row',
        title: 'Anatomy of a register row',
        caption: n('One row of the AeroLink reference register, read across. The concern names what, for whom and where; the influence rating carries its reason so that a reviewer can challenge it.'),
        alt: 'A single table row split into labeled cells: ID STK-010; stakeholder, electric utility; role, supplier or owner of an enabling system; stage, operation; external; approving authority, no; concern CON-011, simultaneous high-power charging exceeding the agreed connection capacity at a vertiport; influence 4, because grid capacity can cap charging throughput. Brackets above the cells group them as who, classification, concern and influence.',
        textEquivalent: 'Who: STK-010, electric utility. Classification: supplier or owner of an enabling system; operation stage; external; not an approving authority. Concern: CON-011, simultaneous high-power charging exceeding the agreed connection capacity at a vertiport. Influence: 4, because grid capacity can cap charging throughput (FICTIONAL reference rating).',
        review: PENDING,
      },
    ],
    keyTerms: {
      review: PENDING,
      items: [
        { term: 'Stakeholder register', def: 'A record of key information about each stakeholder and how they are involved with the system of interest, re-evaluated periodically.', source: { reading: 'R11', pages: '553' } },
        { term: 'Concern', def: 'What a stakeholder is interested in or worried about relative to the system, written so that someone else could check it. The ISO/IEC stakeholder definition in SEBoK’s glossary speaks of “concerns relative to a system” but does not define the word; SysML v2’s definition of a concern comes in Week 8.', source: 'course' },
        { term: 'Influence and support', def: 'MITRE’s stakeholder maps show the relative influence of each group and its support for the change.', source: { reading: 'R63', pages: '236' } },
        { term: 'Generic concern', def: 'A concern that names only a general quality (“wants safety”, “noise”); the course rubric places it at the developing level (RB-1.3).', source: 'course' },
        { term: 'Conflict between concerns', def: 'Two stakeholders’ concerns that pull in opposite directions; recorded in the register and resolved later by a trade, not by deleting one.', source: 'course' },
      ],
    },
    check: {
      id: 'c5',
      bloom: 'Apply',
      solo: 'unistructural',
      objective: 'B1.4',
      prompt: 'Which register entry for AeroLink’s insurers records a concern that someone else could check?',
      options: [
        { id: 'a', text: 'Insurers: no record of how often flights exceed weather limits', correct: true, feedback: 'Yes. It says what (exceedances of weather limits), for whom (the insurers who price the risk) and what is missing (a record), so a reviewer can check it, and it already points toward a need.' },
        { id: 'b', text: 'Insurers: they are worried about safety and about costs', correct: false, feedback: 'No. Safety and cost are general qualities: this concern could belong to anyone and cannot be checked.' },
        { id: 'c', text: 'Insurers: they care about quality, safety and reliability', correct: false, feedback: 'No. A list of general qualities says nothing about what, for whom or where.' },
        { id: 'd', text: 'Insurers: they want a very good, safe and very efficient service', correct: false, feedback: 'No. “Good, safe, efficient” are generic; the course rubric places such concerns at the developing level (RB-1.3).' },
      ],
      review: PENDING,
    },
    cite: [{ reading: 'R11', pages: '552–553' }, { reading: 'R39a', pages: '1631' }, { reading: 'R63', pages: '234–236' }],
    readMore: [{ reading: 'R11', pages: '553' }, { reading: 'R63', pages: '236' }],
    goDeeper: ['w1-register', 'w1-worked-register'],
    apply: n('Classify each of your team’s stakeholders the same way, write one or more specific concerns for each (each concern gets its own CON ID), rate influence from 1 to 5 with a one-line reason, and record at least one conflict between two stakeholders’ concerns, in part 4 of the Team enterprise view. Its check catches only the most generic phrasings: it rejects a concern that names nothing but a general quality (“wants safety”), and one with no concrete detail (a number or time, a condition, a place, an affected group, or a consequence). It cannot tell whether the detail is true or the concern important; you and the instructor judge that.'),
  },
  {
    id: 'l6',
    code: 'L6',
    title: 'Stakeholder needs',
    question: n('What is a stakeholder need, and why is it not yet a requirement?'),
    inShort: n('A need states, from the stakeholder’s side, what they need the system to do. Requirements, written later, give the developer’s side, and the system is validated against the needs.'),
    teaser: n('The cited meaning of stakeholder needs, needs versus requirements, the integrated set, and elicitation.'),
    objectives: ['B1.5'],
    bloom: 'Understand',
    solo: 'relational',
    minutes: 8,
    maxWords: 620,
    body: [
      {
        text: 'SEBoK’s glossary takes this statement from ISO/IEC/IEEE 15288:2023 and adds that needs concentrate on the system’s purpose and behavior, and are described in the context of the operational environment and conditions.',
        provenance: 'source-paraphrase',
        quote: { text: 'Stakeholder needs include elicitation of needs, wants, desires, expectations and perceived constraints of identified stakeholders.', cite: { reading: 'R39a', pages: '1632', note: 'SEBoK glossary, “Stakeholder Needs and Requirements”, (1a)' } },
        cite: [{ reading: 'R39a', pages: '1632' }],
        review: PENDING,
        callout: 'Definition: stakeholder needs',
      },
      { ref: { block: 'w1-needs', para: 1 } },
      { ref: { block: 'w1-needs', para: 2 } },
      { ref: { block: 'w1-needs', para: 3 } },
    ],
    worked: {
      kind: 'steps',
      title: 'Worked example: from one AeroLink concern to a need, and what comes after',
      intro: n('Follow one stakeholder of the new vertiport from the register to a need. The values are the instructor reference (FICTIONAL).'),
      steps: [
        n('The register row. STK-004, communities near vertiports, has the concern CON-012: take-off and landing noise near homes, how often it occurs and at what hours.'),
        n('Elicitation. Asked what they need and why, the residents describe the outcome: noise kept within a limit the city agrees, at every pad and at every operating hour, because noise at night disturbs sleep. One of them asks for sound barriers; asking why turns that implementation back into the outcome.'),
        n('The need, from the stakeholder’s side. NEED-003: Communities near vertiports need the air-taxi service to keep take-off and landing noise exposure at nearby homes within the agreed limits on the loudness of each event and on the number of events in the evening and early morning. Condition: at every vertiport, every operating day. Source: STK-004, CON-012. The rationale is recorded with it.'),
        n('What comes after. In Week 2 your team transforms needs like this into requirements on the system, written from the developer’s side; the need stays as the reference the requirements, the design and the realized system are validated against.'),
      ],
    },
    figures: [
      {
        id: 'need-chain',
        title: 'From stakeholder to concern to need, and later to requirements',
        caption: n('This week stops at the need. The requirement is the developer’s statement written in Week 2, and validation later checks the system against the need.'),
        alt: 'A left-to-right chain of four boxes: stakeholder STK-004, communities near vertiports; concern CON-012, community noise; need NEED-003, written from the stakeholder’s side; and a dimmed fourth box, requirement, Week 2, written from the developer’s side. A curved arrow labeled validated against runs back from the requirement box to the need.',
        textEquivalent: 'Stakeholder STK-004 (communities near vertiports) → concern CON-012 (community noise) → need NEED-003 (stakeholder’s perspective) → requirement (Week 2, developer’s perspective). The requirements, the design and the realized system are validated against the need.',
        review: PENDING,
      },
    ],
    keyTerms: {
      review: PENDING,
      items: [
        { term: 'Stakeholder needs', def: 'The needs, wants, desires, expectations and perceived constraints of the identified stakeholders, concentrating on the system’s purpose and behavior (ISO/IEC/IEEE 15288:2023).', source: { reading: 'R39a', pages: '1632' } },
        { term: 'System requirement', def: 'Transformed from the needs; it communicates the developer’s perspective of the system of interest.', source: { reading: 'R11', pages: '549' } },
        { term: 'Integrated set of needs', def: 'Stakeholder needs combined with the analysis of risks, drivers, constraints and life-cycle concepts; correct, consistent, complete and feasible.', source: { reading: 'R11', pages: '551' } },
        { term: 'Elicitation', def: 'Engaging stakeholders to understand their needs: brainstorming, interviews, questionnaires, workshops, focus groups, documentation review.', source: { reading: 'R11', pages: '553' } },
        { term: 'Rationale', def: 'Why the stakeholder needs it; asking for it often reveals the real need behind an implementation.', source: { reading: 'R11', pages: '553' } },
      ],
    },
    check: {
      id: 'c6',
      bloom: 'Understand',
      solo: 'relational',
      objective: 'B1.5',
      prompt: 'In SEBoK’s terms, what separates a stakeholder need from a system requirement?',
      options: [
        { id: 'a', text: 'The perspective: a need is the stakeholder’s view, a requirement the developer’s', correct: true, feedback: 'Yes. Stakeholder needs give the perspective of users, acquirers, customers and other stakeholders; they are transformed into system requirements, which communicate the developer’s perspective.' },
        { id: 'b', text: 'Only the wording: a requirement is exactly the same statement, with “shall” added', correct: false, feedback: 'No. Requirements are transformed from needs into a different perspective; adding “shall” to a need does not make it a requirement.' },
        { id: 'c', text: 'Priority: needs are optional wishes, while requirements are mandatory duties', correct: false, feedback: 'No. Needs define the scope the system is validated against; they are not optional.' },
        { id: 'd', text: 'The source: needs come from customers only, requirements from all the others', correct: false, feedback: 'No. Needs come from every stakeholder, not only customers.' },
      ],
      cite: { reading: 'R11', pages: '549' },
      review: PENDING,
    },
    cite: [{ reading: 'R39a', pages: '1632' }, { reading: 'R11', pages: '549–553' }],
    readMore: [{ reading: 'R11', pages: '549–553' }],
    goDeeper: ['w1-needs'],
    apply: n('For each stakeholder in your team’s register, ask what they need the system to do, under what conditions, why, and how important it is to them. Keep the answer in the stakeholder’s terms for now, with its rationale, its priority, the stakeholder it came from and the concern it answers; L7 turns these drafts into well-formed statements.'),
  },
  {
    id: 'l7',
    code: 'L7',
    title: 'Writing well-formed need statements',
    question: n('How do you write a need so that it can be traced, checked and later turned into requirements?'),
    inShort: n('Attribute it to a stakeholder, keep out “shall” and any design, state the condition under which it holds, and record the rationale, the source and an ID.'),
    teaser: n('The need-statement form, the six minimum checks, conditions, rationale and traces, and four AeroLink rewrites.'),
    objectives: ['B1.5'],
    bloom: 'Apply',
    solo: 'relational',
    minutes: 9,
    maxWords: 920,
    body: [
      { ref: { block: 'w1-writing-needs', para: 0 } },
      { ref: { block: 'w1-writing-needs', para: 1 } },
      {
        text: 'MITRE’s operational needs assessment adds independence of solution approach: a need stated as a particular solution can rule out better ways of meeting it.',
        provenance: 'source-paraphrase',
        quote: { text: 'Beware solutions masquerading as needs.', cite: { reading: 'R53', pages: '296' } },
        cite: [{ reading: 'R53', pages: '296' }],
        review: PENDING,
        callout: 'Solution-free',
      },
      { ref: { block: 'w1-writing-needs', para: 2 } },
      { ref: { block: 'w1-writing-needs', para: 3 }, callout: 'The six checks of the course gate' },
    ],
    worked: { kind: 'bullets', title: 'Worked example: four AeroLink drafts rewritten as needs', intro: { block: 'w1-worked-needs', para: 0 }, block: 'w1-worked-needs', bullets: [0, 1, 2, 3] },
    afterWorked: [{ ref: { block: 'w1-worked-needs', para: 1 } }],
    figures: [
      {
        id: 'need-anatomy',
        title: 'Anatomy of a need statement',
        caption: n('NEED-003 from the AeroLink reference, labeled part by part. The statement carries the stakeholder, what they need and the condition; the ID, rationale and source travel with it.'),
        alt: 'The statement “Communities near vertiports need the air-taxi service to keep take-off and landing noise exposure within the agreed limits, at every pad, at all operating hours.” with brackets under its parts: who needs it; need the system to, not shall; what, with no design; condition. Under the statement, three tags: ID NEED-003; source STK-004 and CON-012; rationale.',
        textEquivalent: 'Who needs it: “Communities near vertiports”. The verb and the system: “need the air-taxi service to”, not “shall”. What, with no design named: “keep take-off and landing noise exposure within the agreed limits”. Condition: “at every pad, at all operating hours”. Carried with the statement: the ID NEED-003, the source STK-004 and CON-012, and the rationale.',
        review: PENDING,
      },
    ],
    keyTerms: {
      review: PENDING,
      items: [
        { term: 'Need statement', def: 'Structured natural language from the stakeholders’ perspective, without “shall”; for example “The stakeholders need the system to …”.', source: { reading: 'R11', pages: '555' } },
        { term: 'Independent of solution approach', def: 'A need stated as a particular solution can eliminate more effective approaches; describe a successful operation instead.', source: { reading: 'R53', pages: '296' } },
        { term: 'Conditions of action', def: 'Triggering events, system states and operating environments: under what operating conditions the need holds.', source: { reading: 'R11', pages: '554' } },
        { term: 'Source and trace', def: 'Each need records the stakeholder it came from, with a trace to the stakeholder register.', source: { reading: 'R11', pages: '553' } },
        { term: 'Need ID', def: 'A stable identifier such as NEED-003, never reused, owned by one team member.', source: 'course' },
      ],
    },
    check: {
      id: 'c7',
      bloom: 'Apply',
      solo: 'unistructural',
      objective: 'B1.5',
      prompt: 'A team writes: “The scheduling system shall give maintenance technicians aircraft condition data before each release.” What is the main problem with it as a need statement?',
      options: [
        { id: 'a', text: 'It is written as a requirement on the system, not as the technicians’ need', correct: true, feedback: 'Yes. “Shall” and the system as subject make it a requirement from the developer’s side. As a need: “Maintenance technicians need the air-taxi service to make the condition of each aircraft known before the aircraft is released for flight.”' },
        { id: 'b', text: 'Nothing: it names the technicians, so it is a stakeholder-attributed need', correct: false, feedback: 'No. Naming the technicians as recipients is not attributing the need to them; the subject is the system, and “shall” marks a requirement.' },
        { id: 'c', text: 'It only lacks an ID; numbering it NEED-011 would make it well formed', correct: false, feedback: 'No. An ID is needed, but it does not change requirement wording into a need.' },
        { id: 'd', text: 'It is too short; every need has to state a number for each of its quantities', correct: false, feedback: 'No. Numbers are not required in a need; the problem is that it is written as a requirement.' },
      ],
      cite: { reading: 'R11', pages: '555' },
      review: PENDING,
    },
    cite: [{ reading: 'R11', pages: '553–555' }, { reading: 'R53', pages: '296' }],
    readMore: [{ reading: 'R11', pages: '554–555' }, { reading: 'R53', pages: '296' }],
    goDeeper: ['w1-writing-needs', 'w1-worked-needs'],
    apply: n('Write at least eight needs for your enterprise, traced to at least five different stakeholders including an approving authority, each with its priority and the concern it answers. Enter them in part 5 of the Team enterprise view. What the tool checks: an outcome, no “shall”, no named solution, a registered stakeholder in need, a unique ID, and the record fields (sources, concerns, rationale, MITRE priority). Other phrasings pass with a note. What it only warns about: vague words such as “good” or “when possible”, requirement words, design words, and no condition word; rewrite the statement or justify the wording. What you judge: all six checks, which your team confirms for each need in its self-check. A need with an unjustified warning does not count, and a tool “pass” never makes a need good.'),
  },
]

export const learnSection = (id: string) => LEARN_SECTIONS.find((s) => s.id === id)

/** Mission readMore blocks → the Learn section that teaches them (design §4: Read more points to Learn first). */
export const BLOCK_TO_SECTION: Record<string, string> = {
  'w1-team': 'l1',
  'w1-system': 'l2',
  'w1-soi': 'l3',
  'w1-worked': 'l3',
  'w1-stakeholders': 'l4',
  'w1-worked-stakeholders': 'l4',
  'w1-register': 'l5',
  'w1-worked-register': 'l5',
  'w1-needs': 'l6',
  'w1-writing-needs': 'l7',
  'w1-worked-needs': 'l7',
}

// ------------------------------------------------------------------------------------------- opener (Overview stage)
/** Minutes for the Overview stage: what and why, Meet AeroLink, the question and prediction, the plan (≈ 600 words). */
export const OVERVIEW_MINUTES = 6

export const OPENER = {
  /** Faculty direction 2026-10-18: say plainly what the week teaches and why (Overview first). */
  intro: n('This week your team forms and chooses the enterprise it will engineer for the whole term, then does the first engineering work on it: it names the system of interest and draws its boundary, finds the stakeholders, and writes their initial needs.'),
  why: n('Why start here? Stakeholders are the primary source of needs, and the needs are what the finished system is validated against: SEBoK warns that leaving out a relevant stakeholder often results in missing needs and a failure to pass system validation (R11 p.552). Everything you record this week, with its ID, becomes the first part of your Week 7 Systems Thinking Engineering Package and, in Phase II, of your team’s SysML v2 model.'),
  how: n('Each Learn section first works its method on AeroLink, a worked example introduced below, and then tells your team how to apply it to its own enterprise. Practice rehearses each method on AeroLink in the workbench and ends with your team’s own enterprise.'),
  questionIntro: n('You have now met AeroLink. Before any explanation, predict an answer to this week’s question; the first Practice mission compares your prediction with the stakeholders you find.'),
  weekPath: {
    id: 'week-path',
    title: 'What your team builds this week',
    caption: n('The six parts of the Week 1 Team Record, in the order the lessons teach them: five engineering outputs plus the AI usage statement. Week 2 turns the needs into requirements; Week 8 imports the register and needs into your SysML v2 model.'),
    alt: 'Five boxes in a row joined by arrows: team charter; enterprise proposal; boundary and context; stakeholder register; initial needs. A bracket under all five is labeled Week 1 Team Record. Two dimmed boxes follow: Week 2 requirements and Week 8 SysML v2 model.',
    textEquivalent: 'Team charter (L1) → enterprise proposal (L2) → boundary and context (L3) → stakeholder register (L4, L5) → initial needs (L6, L7). Together: the Week 1 Team Record. Next: Week 2 requirements traced to the needs; Week 8 imports the stakeholders, concerns and needs into the team’s SysML v2 model.',
    review: PENDING,
  },
  assessedTeam: n('Week 1 Team Record (team, formative): six parts about your own enterprise: five engineering outputs (charter, proposal, context, stakeholder register, initial needs) plus the AI usage statement, exported from the Team enterprise view.'),
  assessedGraduate: n('Graduate needs review (individual): four of your team’s needs tested against the six minimum checks, with the revisions and one need you would challenge.'),
  /** Plain-words objectives (design §1); the objective text itself stays in course.ts. */
  canDo: [
    { id: 'B1.1', bloom: 'Apply', text: n('Agree a team charter: lead roles, decision rules, communication norms and owned ID prefixes.') },
    { id: 'B1.2', bloom: 'Understand', text: n('Explain system, system of interest, boundary, context and enterprise, and cite where each definition comes from.') },
    { id: 'B1.3', bloom: 'Apply', text: n('Propose your team’s enterprise and its system of interest, with a boundary and a context, for instructor approval.') },
    { id: 'B1.4', bloom: 'Apply', text: n('Identify and classify the stakeholders of a system of interest, with a specific concern for each.') },
    { id: 'B1.5', bloom: 'Apply', text: n('Write well-formed need statements traced to stakeholders, and say how a need differs from a requirement.') },
    { id: 'Graduate', bloom: 'Evaluate', text: n('Review your team’s needs against the six minimum checks and justify each revision.') },
  ],
  assessed: [
    n('Section checks in Learn: one question per section, ungraded, with feedback on every option.'),
    n('Readiness quiz Q1: ten questions, formative.'),
  ],
  review: PENDING,
}

// ------------------------------------------------------------------------------------------- summary and bridge
export const SUMMARY = {
  recap: [
    n('Team: a charter fixes lead roles, decision rules, communication norms and who owns which IDs, before the work starts.'),
    n('System: the system of interest is chosen for a purpose, its boundary is drawn by the observer, and the context records what lies just outside; the enterprise is wider than any one organization.'),
    n('Stakeholders and needs: find stakeholders from three sources, classify them and record specific concerns; write each need from the stakeholder’s side, solution-free, with its condition, rationale, source and ID.'),
  ],
  selfRating: n('Which of the five objectives can you now do? Your answers stay in this browser and only suggest which section to revisit.'),
  conceptMap: {
    id: 'concept-map',
    title: 'Week 1 concept map',
    caption: n('Each node links back to the section that teaches it.'),
    alt: 'A chain of concepts from forming the team, through enterprise, system of interest, boundary and context, stakeholders, the register and concerns, to needs and well-formed need statements.',
    textEquivalent: 'Team charter → enterprise and system of interest → boundary and context → stakeholders (three sources, approving authorities) → register: classification and concerns → stakeholder needs (not yet requirements) → well-formed need statements with ID, source and rationale.',
    review: PENDING,
  },
}

export const CONCEPT_CHAIN: { label: string; section: string }[] = [
  { label: 'Team charter', section: 'l1' },
  { label: 'Enterprise and system of interest', section: 'l2' },
  { label: 'Boundary and context', section: 'l3' },
  { label: 'Stakeholders', section: 'l4' },
  { label: 'Register and concerns', section: 'l5' },
  { label: 'Stakeholder needs', section: 'l6' },
  { label: 'Well-formed needs', section: 'l7' },
]

export const BRIDGE = {
  forwardQuestion: n('Your needs say what each stakeholder needs. What must the system do, and how well, to meet them? Week 2 starts from that question.'),
  continuity: n('Week 2 (ConOps and requirements) builds operational scenarios from your enterprise and writes requirements traced to the needs you recorded this week, using the same NEED IDs.'),
  spacing: n('Week 2 is being rebuilt from this template. Before its first session, answer checks C4 (who is a stakeholder) and C7 (need or requirement?) again from memory: spaced retrieval of the two ideas Week 2 builds on.'),
  review: PENDING,
}

// ------------------------------------------------------------------------------------------- workload (review F04)
/** Realistic workload, itemized PER STUDENT. Since the lecture-first restructuring (2026-10-19) the rows in
 *  weeks/week01.ts follow the new path and are computed in src/content/week1Path.ts (WORKLOAD); the Learn minutes are
 *  kept here only because the earlier self-study flow (src/flow, unregistered) still reads them. The AeroLink practice
 *  missions 1–4 are optional and not counted. */
const missionMinutes = (id: string) => week1Missions.missions.find((m) => m.id === id)!.minutes
export const WORKLOAD = (() => {
  const learnMinutes = LEARN_SECTIONS.reduce((a, s) => a + s.minutes, 0) + OVERVIEW_MINUTES + 3 // + Overview, summary 3
  const rehearsalMinutes = ['w1-m1-who', 'w1-m2-boundary', 'w1-m3-stakeholders', 'w1-m4-needs'].reduce((a, id) => a + missionMinutes(id), 0)
  const teamMinutes = missionMinutes('w1-m5-team')
  const quizMinutes = missionMinutes('w1-m6-recall')
  const total = workloadTotal(week01.workload)
  return { learnMinutes, rehearsalMinutes, teamMinutes, quizMinutes, total }
})()
export const WORKLOAD_BUDGET = 8
/** No trim is needed on the lecture-first path (the counted total is inside the budget); kept as an empty list. */
export const TRIM: { change: string; saves: number }[] = []
export const TRIMMED_TOTAL = Math.round((WORKLOAD.total - TRIM.reduce((a, t) => a + t.saves, 0)) * 100) / 100
export const WORKLOAD_NOTE = n(
  `Hours per student on the lecture-first path. Counted: the two class sessions, the detailed lesson, the readings, the candidate enterprise, your share of the Team Record (${WORKLOAD.teamMinutes} min out of class on top of the Session 2 lab launch), the quiz (${WORKLOAD.quizMinutes} min), the graduate needs review and the time log. Not counted: the optional AeroLink practice missions 1–4 (${WORKLOAD.rehearsalMinutes} min). Realistic week: ${WORKLOAD.total.toFixed(1)} h against the ${WORKLOAD_BUDGET} h budget${WORKLOAD.total <= WORKLOAD_BUDGET ? '' : `, ${(WORKLOAD.total - WORKLOAD_BUDGET).toFixed(1)} h over`}. Log your actual hours so the estimate can be tested.`,
)

/** Practice plan (design §4): order and prerequisite Learn sections per mission. */
export const PRACTICE_PREREQ: Record<string, { learn: string[]; note?: NewText }> = {
  'w1-m1-who': { learn: ['l4'], note: n('Your prediction from the Overview is already recorded here.') },
  'w1-m2-boundary': { learn: ['l3'] },
  'w1-m3-stakeholders': { learn: ['l4', 'l5'] },
  'w1-m4-needs': { learn: ['l6', 'l7'] },
  'w1-m5-team': { learn: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7'], note: n('Your team’s own enterprise: the Week 1 Team Record, checked part by part and exported for submission.') },
  'w1-m6-recall': { learn: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7'], note: n('The same quiz as on the Assessment page; answer it there or here.') },
}

// ------------------------------------------------------------------------------------------- AeroLink introduction
// AeroLink facts come from the case data in src/model/airtaxi.ts (DATA_SHEET, OFFICIAL_ELEMENTS); numbers are FICTIONAL
// and are read from DATA_SHEET, never retyped.
const sheet = (key: string) => DATA_SHEET.find((d) => d.key === key)!.value
const scenario = (i: number) => OFFICIAL_ELEMENTS.scenarios[i]
/** 25 km at 150 km/h = 10 min (FICTIONAL Data Sheet values). */
export const TRIP_MINUTES = Math.round((sheet('tripKm') / sheet('cruiseKmh')) * 60)

/** Overview, "Meet AeroLink": shown BEFORE the week's question and prediction (review F12). */
export const MEET_AEROLINK = {
  what: n(
    `AeroLink Urban Mobility is a FICTIONAL company that runs an electric air-taxi service in a city. Small electric aircraft that take off and land vertically carry passengers between vertiports, small airports built for these aircraft. In the course’s teaching data, ${sheet('fleet')} aircraft with ${sheet('seats')} passenger seats each serve a network of ${sheet('vertiports')} vertiports with ${sheet('chargersPerVertiport')} chargers each, ${sheet('opHours')} hours a day. Nothing about AeroLink describes a real operator, aircraft or regulation; every number is a teaching value.`,
  ),
  conopsIntro: n('Its concept of operations, in plain words: what happens, in order, when AeroLink is working.'),
  conops: [
    n(`A passenger asks for a ride (${scenario(0).id}, ${scenario(0).name}).`),
    n(`The operations center schedules the trip and dispatches an aircraft (${scenario(1).id}, ${scenario(1).name}).`),
    n(`The aircraft flies the passenger to another vertiport: a typical trip is ${sheet('tripKm')} km at a cruise speed of ${sheet('cruiseKmh')} km/h, about ${TRIP_MINUTES} minutes in the air.`),
    n(`Between trips the aircraft recharges at a vertiport, about ${sheet('chargeMin')} minutes to reach the charge it needs for its next dispatch (${scenario(2).id}, ${scenario(2).name}).`),
    n(`Maintenance and bad weather take aircraft out of the schedule from time to time (${scenario(3).id}, ${scenario(3).name}; ${scenario(4).id}, ${scenario(4).name}).`),
    n('AeroLink also depends on several systems it does not run; L3 draws them as its context.'),
  ],
  use: n('How the course uses AeroLink: it is the instructor’s worked example. Every lesson first works its method on AeroLink, and Practice rehearses the method on AeroLink in the workbench. Then your team applies the same method to its own enterprise, in any domain, which it proposes this week for the instructor’s approval. Your Team Record is always about your own enterprise, never about AeroLink.'),
  readFirst: n('This week’s question and every lesson refer to AeroLink by name, which is why it is introduced first.'),
  review: PENDING,
}

// ------------------------------------------------------------------------------------------- Practice orientation
/** Practice, "How the workbench works". Region numbers match the annotated drawing; on a narrow screen the regions are
 *  tabs, so each region also names its tab (review F14). */
export const ORIENTATION = {
  figure: {
    title: 'The workbench, region by region',
    caption: n('The numbers match the list beside the drawing. Your screen may show the regions at different sizes; on a narrow screen they become tabs, named in the list.'),
    alt: 'A sketch of the workbench: a Practice bar across the top; the mission brief on the left (1) with the six missions and the steps of the current one; the center view in the middle (2); the model browser at the top right (3); properties at the bottom right (4); and the problems panel under the center view (5).',
  },
  lede: n('The workbench is where you rehearse this week’s methods on AeroLink and then build your team’s Team Record. Read this once; you can reopen it at any time from the Practice bar above the workbench.'),
  regions: [
    { n: 1, name: 'Mission brief (left; tab “Mission” on a narrow screen)', text: n('The six missions and, for the mission you are on, its numbered steps. Each step says what to do, what to enter, and how you know it is done.') },
    { n: 2, name: 'Center view (middle; tab “View”)', text: n('The tool the current step needs: Boundary & context, Stakeholders, Needs, or Team enterprise. The step’s “Open” button switches to the right one.') },
    { n: 3, name: 'Model browser (right, top; tab “Model”)', text: n('Everything recorded so far: the system of interest, external systems, boundary candidates, stakeholders, needs and your team’s record. Select an item to see it in Properties.') },
    { n: 4, name: 'Properties (right, bottom; tab “Properties”)', text: n('The details of the selected item.') },
    { n: 5, name: 'Problems (bottom; tab “Problems”)', text: n('Automatic checks on your work: errors, warnings and notes. Select a problem to jump to the item it concerns. Changes & impact and the Console share this panel.') },
  ],
  mission: n('A mission is a short task made of numbered steps. Try first: predict, then find out. Guided: do it yourself with hints, on AeroLink. Own: your team’s own enterprise, with checks but no worked answers. Recall: the knowledge check.'),
  moving: n('Choose a mission in the Missions list at the top of the mission brief; each row shows a short title and how many of its steps are done. You can switch at any time, and your work is saved in this browser. When a mission is complete, a button takes you to the next one.'),
  finished: n('A step is done when its number turns into a green check; every step this week is checked by the computer, including the export of your Team Record. A mission is complete when all its steps are done. The Practice bar shows how many of the six missions are complete; when all six are, Practice is finished and the bar offers a button to Check & submit.'),
  review: PENDING,
}

export const PRACTICE_BAR = {
  complete: n('Practice complete: all six missions are done. Next, check your understanding and submit your team’s Week 1 Team Record.'),
  review: PENDING,
}

// ------------------------------------------------------------------------------------------- Week 1 Team Record
export type RecordPart = { id: string; heading: string; evidence: NewText; minimum: string; judged: string }
/** The Team Record is about the TEAM'S OWN enterprise (DECISION_LOG A16); the AeroLink missions in Practice are the
 *  rehearsal. Minimums are the Team enterprise view's completeness checks (src/workbench/week1/team.ts). */
export const TEAM_RECORD = {
  summary: n('One Team Record per team, about your own enterprise, never AeroLink: six parts, five engineering outputs plus the AI usage statement. Build it in the Team enterprise view, the lab tool on the Laboratory page: every part is checked as you go and the view exports the record. The AeroLink worked examples show each part done once first.'),
  parts: [
    { id: 'charter', heading: '1. Team charter', evidence: n('Initials for each lead role (three roles in a three-person team), the decision rules with a tie-break, the communication norms, and each member’s owned ID prefixes.'), minimum: 'Every role assigned to a different member; decision rules and norms of at least five words each; prefixes for every member, with one owner for each of ENT, PRT, EXT, STK, CON, NEED and REL', judged: 'Completeness check (not scored)' },
    { id: 'proposal', heading: '2. Enterprise proposal (ENT-001)', evidence: n('Name; domain; the problem statement in one sentence; the mission (MGO-001) in one sentence and its goals (MGO-002 …); the system of interest in one sentence; the elements inside its boundary, each with a PRT ID (a PRT is an element inside the boundary of the system of interest); why it suits a 14-week project; the instructor’s decision and its date.'), minimum: 'All fields; problem and mission one sentence each; goals optional, each with its MGO ID; at least 3 elements inside the boundary (PRT); a suitability paragraph of at least 40 words; the decision “approved” with a valid date that is not in the future, or “submitted for approval” (labeled; approval is required before the Week 2 submission)', judged: 'RB-1.1 (with part 3); approval is a completeness check' },
    { id: 'context', heading: '3. Context (EXT-001 …)', evidence: n('External systems and actors, each with what crosses the boundary and its direction (into the system, out of it, or both).'), minimum: 'At least 6 EXT items, each complete', judged: 'RB-1.1 boundary and context' },
    { id: 'register', heading: '4. Stakeholder register (STK-001 …, CON-001 …)', evidence: n('For each stakeholder: role, life-cycle stage, internal or external, approving authority, one or more specific concerns (each with its CON ID), and influence from 1 to 5 with a reason; relationships between stakeholders as REL rows (from, to, type, note), at least one of them a conflict.'), minimum: 'At least 8 stakeholders, each complete and with specific concerns only (a generic concern does not count); at least 3 role groups; at least 1 approving authority; at least 3 relationships (REL), at least 1 of them a conflict', judged: 'RB-1.2 identification and classification; RB-1.3 interests, concerns, influence' },
    { id: 'needs', heading: '5. Initial stakeholder needs (NEED-001 …)', evidence: n('For each need: ID, short name, statement (recommended form “The [stakeholders] need the [system] to …”), condition, rationale, priority (mandatory, critical, desirable or optional), the stakeholder or stakeholders it comes from, the concern or concerns it answers, the goal it serves (MGO-001 or a goal), the team’s self-check of the six minimum checks, and the justification for any warning kept.'), minimum: 'At least 8 needs that count (statement and subject checked, traced to its concern and to the mission or a goal, record fields complete, six checks confirmed, every warning rewritten or justified); at least 5 stakeholders covered, including an approving authority (three-person team: 6 needs from 4 stakeholders, pending faculty approval)', judged: 'RB-2.2 need statements; RB-2.5 traceability (NEED → STK only this week)' },
    { id: 'ai', heading: '6. AI usage statement', evidence: n('Tool, purpose, prompts, what you accepted or rejected and why; every AI-suggested stakeholder or need tagged AI-suggested-reviewed.'), minimum: 'At least 12 words in part 6 of the view; present even if no AI tool was used', judged: 'RB-12.1–12.3' },
  ] as RecordPart[],
  format: n('Export two files from the Team enterprise view: team-NN-week1-record.md (the six parts as headed Markdown, ready to read) and team-NN-week1-model-inputs.json (the same data with IDs and the SysML v2 element each item will seed). Both files state the record’s status. A team that prefers to write offline can download the blank template below and keep its headings, IDs and columns.'),
  where: n('One team member uploads both files to the “Week 1 Team Record” assignment in the course learning management system before the first session of Week 2. The proposal carries the instructor’s decision from the Session 2 checkpoint: “approved” with its date, or, if the instructor has not yet decided, “submitted for approval”. A record submitted for approval is labeled as such and is not shown as ready; the instructor’s approval is required before the Week 2 submission.'),
  grading: n('Formative: you receive feedback, and the record does not count toward the course grade this week. The completeness checks come first; the rubric rows below are then applied. The charter and the instructor’s decision are completeness checks only.'),
  rubricRows: [['RB-1', '1.1'], ['RB-1', '1.2'], ['RB-1', '1.3'], ['RB-2', '2.2'], ['RB-2', '2.5']] as [string, string][],
  rubricNote: n('The rows of the course rubric this record is judged against (levels 4 to 1). For your own enterprise, RB-1.2’s “all S04 classes” is read as the role groups that apply to your enterprise, including at least one approving authority and one stakeholder who is not a customer or user (pending faculty confirmation). RB-2.5 applies only to NEED → STK traces this week: AROU entries and CAP → NEED links are not yet in scope and are not judged.'),
  review: PENDING,
}

/** The graduate individual task (course.ts graduateTask), with its evidence, format and route. */
export const GRAD_REVIEW = {
  heading: 'Graduate needs review (individual)',
  what: n('Choose four of your team’s need statements. For each, test the six minimum checks of the course gate, write the revised statement, and give the reason for each change in one sentence. Then name one need you would challenge, and why. At most 250 words in total.'),
  format: n('A Markdown or PDF file named NN-surname-week1-needs-review, with a table of the four needs (before, criterion, after, reason) and the challenge paragraph.'),
  where: n('Upload it to the “Week 1 graduate needs review” assignment in the learning management system before the first session of Week 2; it also becomes review-notebook entry 1.'),
  grading: n('Always read, with formative feedback on RB-2.2 (need statements); filed as review-notebook entry 1 under RB-16.'),
  review: PENDING,
}

export function teamRecordTemplate(): string {
  return [
    '# Week 1 Team Record',
    '',
    'Team: ____  ·  Members (initials): ____  ·  Due: before the first session of Week 2',
    '',
    `> ${TEAM_RECORD.summary.text}`,
    '',
    '## 1. Team charter',
    '',
    '| Lead role | Member (initials) |',
    '|---|---|',
    '| Requirements & Compliance | |',
    '| Architecture | |',
    '| AI & Data Management (merged with Architecture in a 3-person team) | |',
    '| Verification & Validation | |',
    '',
    'Decision rules:',
    '',
    'Communication norms:',
    '',
    'Owned ID prefixes (per member, e.g. “JS: STK, CON, NEED”):',
    '',
    '## 2. Enterprise proposal (ENT-001)',
    '',
    'Name:  ·  Domain:',
    '',
    'Problem statement (one sentence):',
    '',
    'Mission, MGO-001 (one sentence, a purpose, not a product):',
    '',
    'Goals (one per line, MGO-002, MGO-003, …):',
    '',
    'System of interest (one sentence):',
    '',
    'Inside the boundary of the system of interest (one element per line, each with a PRT ID: PRT-001, PRT-002, …):',
    '',
    'Why it suits a 14-week project (one paragraph):',
    '',
    'Instructor decision and date (approved, with its date; or submitted for approval):',
    '',
    '## 3. Context',
    '',
    '| ID | External system or actor | Kind (system or actor) | What crosses the boundary | Direction (in / out / both) |',
    '|---|---|---|---|---|',
    ...[1, 2, 3, 4, 5, 6].map((i) => `| EXT-00${i} | | | | |`),
    '',
    '## 4. Stakeholder register',
    '',
    '| ID | Stakeholder | Role | Life-cycle stage | Internal or external | Approving authority | Concerns (one or more, each CON-nnn: …) | Influence 1–5 | Reason |',
    '|---|---|---|---|---|---|---|---|---|',
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((i) => `| STK-00${i} | | | | | | CON-00${i}: | | |`),
    '',
    '### Relationships (at least 3, at least 1 conflict)',
    '',
    '| ID | From (STK) | Type (regulates, funds, supplies, is affected by, partners with, coordinates with, conflicts with) | To (STK) | Note |',
    '|---|---|---|---|---|',
    ...[1, 2, 3].map((i) => `| REL-00${i} | | | | |`),
    '',
    '## 5. Initial stakeholder needs',
    '',
    'Need statements, preferably in the form “The [stakeholders] need the [system] to …”; priority is mandatory, critical, desirable or optional.',
    '',
    '| ID | Name | Need statement | Condition | Rationale | Priority | Source (STK) | Answers (CON) | Goal (MGO) | Six checks confirmed | Warnings kept, with justification |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((i) => `| NEED-00${i} | | | | | | | | | | |`),
    '',
    '## 6. AI usage statement',
    '',
    'Tool, purpose, prompts, what you accepted or rejected and why. Tag every AI-suggested stakeholder or need AI-suggested-reviewed.',
    '',
  ].join('\n')
}

// ------------------------------------------------------------------------------------------- model inputs (review F06–F08)
/** A SysML v2 element a Week 1 item later seeds. The cited slides are Phase II readings (Week 8 on), read and checked for
 *  this rebuild; they are labeled as such and are not Week 1 readings. The instructor-only specification is not cited. */
export type Seed = { element: string; note: string; cite?: Citation }
export type ModelInputRow = { id: string; item: string; captured: string; seeds: Seed[] }

export const MODEL_INPUTS = {
  lede: n('The Week 1 model inputs are the engineering data your SysML v2 model will need in Phase II, captured now with stable IDs and sources. They are not a separate assignment: the Team enterprise view exports them, as JSON, from the same entries as your Team Record. The table shows what each item later seeds in SysML v2; you will learn those elements from Week 8.'),
  phaseNote: n('Phase II reading (Week 8 on). Week 8 imports these items into the team’s model; Week 9 models the needs.'),
  rows: [
    { id: 'soi', item: 'Enterprise and system of interest (ENT-001)', captured: 'Name, problem statement, system-of-interest statement', seeds: [{ element: 'part def', note: 'the system of interest as a part definition', cite: { reading: 'R70', pages: '9' } }, { element: 'documentation (doc)', note: 'the purpose, as documentation owned by that definition', cite: { reading: 'R70', pages: '8' } }] },
    { id: 'mgo', item: 'Mission and goals (MGO)', captured: 'The mission MGO-001 and each goal MGO-002 …, with its statement', seeds: [{ element: 'documentation (doc)', note: 'the mission and goals as documentation the needs trace to (course working mapping; Week 3 develops them)', cite: { reading: 'R70', pages: '8' } }] },
    { id: 'inside', item: 'Inside the boundary of the system of interest (PRT)', captured: 'ID (PRT-nnn) and name of each element inside the boundary (a part of the system of interest)', seeds: [{ element: 'part (usage)', note: 'parts owned by the system’s part definition', cite: { reading: 'R70', pages: '9' } }] },
    { id: 'context', item: 'External systems and actors (EXT)', captured: 'ID, name, kind (system or actor)', seeds: [{ element: 'part (usage) in a context', note: 'external systems as part usages beside the system of interest in a context part (course working mapping)', cite: { reading: 'R70', pages: '9' } }, { element: 'actor', note: 'an external role in a use case: a parameter representing a role played by an entity external to the subject', cite: { reading: 'R76', pages: '100' } }] },
    { id: 'crosses', item: 'What crosses the boundary, and its direction', captured: 'Exchange and direction per EXT', seeds: [{ element: 'item def', note: 'what flows (people, materials, energy, information)', cite: { reading: 'R70', pages: '17' } }, { element: 'port def with in / out features', note: 'the direction of each flow', cite: { reading: 'R71', pages: '20' } }] },
    { id: 'stakeholders', item: 'Stakeholders (STK)', captured: 'ID, name, classification, level of interest with a reason (required); influence and support (optional)', seeds: [{ element: 'part def + stakeholder', note: 'a part definition for each stakeholder, used as the stakeholder parameter of a concern or requirement', cite: { reading: 'R77', pages: '115' } }] },
    { id: 'relationships', item: 'Relationships between stakeholders (REL)', captured: 'ID, from and to (STK IDs), type, note; at least one conflict', seeds: [{ element: 'connection or dependency', note: 'a relationship between two stakeholder parts (course working mapping, settled in Week 8)' }] },
    { id: 'concerns', item: 'Concerns (CON)', captured: 'One or more specific concerns per stakeholder, each with its own CON ID and its stakeholder', seeds: [{ element: 'concern', note: 'a concern with doc, subject and stakeholder: a specific topic one or more stakeholders desire to be addressed', cite: { reading: 'R77', pages: '115' } }] },
    { id: 'needs', item: 'Needs (NEED)', captured: 'ID, name, statement, condition, rationale, priority, source stakeholders, the concerns it answers, the goal it serves (MGO), the team’s self-check', seeds: [{ element: 'requirement def / requirement', note: 'short name <\'NEED-001\'>, the statement as doc, the system of interest as subject, the source as a stakeholder parameter (course working mapping: SysML v2 has no separate “need” element)', cite: { reading: 'R74', pages: '86–87' } }, { element: 'frame', note: 'a requirement may frame the concerns it addresses: the need’s CON links', cite: { reading: 'R77', pages: '116' } }] },
  ] as ModelInputRow[],
  review: PENDING,
}
