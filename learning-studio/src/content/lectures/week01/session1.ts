// Week 1, Session 1 lecture: Team Formation / Needs / Identifying Stakeholders — systems, life cycle, teams and
// stakeholders. 75-minute session: 69 minutes of planned content on 24 slides plus the generated "References and
// credits" slide, and a 6-minute buffer (bufferMinutes). Single source for the slide viewer, the faculty notes, the .pptx
// and the student lesson (docs/lectures/PIPELINE.md). Governing direction: DECISION_LOG A20 ("teach first, explain in
// depth, demonstrate, then assign").
//
// Faculty final review (DECISION_LOG A21, 2026-10-19): claims re-checked against the source text, the why of each method
// stated in the notes (methods.ts sayWhy), wording fixed where the source says less
// (_source_cache/review/week01_final_review.md).
//
// Review status: new-pending-review (search for that string). Written 2026-10-19 and revised the same day after the
// independent review (_source_cache/review/week01_lecture_review.md; dispositions in
// docs/lectures/week01/REVIEW_DISPOSITIONS.md). The lecture model has no status field, so the status is recorded here,
// in WEEK1_S1_REVIEW below, and in the title slide's faculty notes.
//
// Accuracy rules followed:
//   - Every citation is a verified register entry (readings.generated.json) at a page whose extracted text
//     (_source_cache/*.txt) supports the claim beside it. Definitions are quoted verbatim and briefly, with the page;
//     everything else is original explanation, paraphrased loosely, or quoted with quotation marks.
//   - Course conventions are labeled as such (course role groups, decision rules, ID ownership, the influence × interest
//     grid, the suitability criteria for a team enterprise, the method-coverage counting rules).
//   - AeroLink Urban Mobility is FICTIONAL, the instructor's worked example. Case values come from
//     src/content/lectures/week01/aerolinkCase.ts (the single source shared with Session 2 and the figures).
//   - Timing: each slide's spoken notes (teach, worked solution, figure walk) stay at or below 130 words per minute,
//     pauses included (src/content/lectures/week01/timing.test.ts).
import { EXTERNAL_SYSTEMS, MISSION_GOALS, ORIGINAL_LIST, PROBLEM_STATEMENT, STAKEHOLDERS, methodCoverage, numberWord, stakeholder } from './aerolinkCase'
import type { Block, Lecture } from '../types'
import { sayWhy } from './methods'

export const WEEK1_S1_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })

// ------------------------------------------------------------------------------------------------ figures from the case data
const COV = methodCoverage()
const N_STK = STAKEHOLDERS.length
const count = (k: 'm1' | 'm2' | 'm3') => COV.filter((r) => r[k]).length
const SINGLE = COV.filter((r) => [r.m1, r.m2, r.m3].filter(Boolean).length === 1).map((r) => r.stakeholder)
const nameOf = (id: string) => stakeholder(id).name
const dot = (b: boolean) => (b ? '●' : '–')

/** The method-coverage table (lesson; the slide shows the grouped figure). Built from the case data. */
const coverageTable: Block = {
  kind: 'table',
  caption: 'M1 life-cycle sweep · M2 from the context · M3 by role class · ★ on the original list · ● found (instructor’s analysis, FICTIONAL case).',
  header: ['Stakeholder', 'M1', 'M2', 'M3'],
  rows: COV.map((r) => [`${r.stakeholder} ${nameOf(r.stakeholder)}${ORIGINAL_LIST.includes(r.stakeholder) ? ' ★' : ''}`, dot(r.m1), dot(r.m2), dot(r.m3)]),
}

const definitionsTable: Block = {
  kind: 'table',
  caption: 'Three definitions of system, as the SEBoK glossary records them (R38 p.1637).',
  header: ['Origin', 'Definition (SEBoK glossary)', 'Scope'],
  rows: [
    ['Systems science (von Bertalanffy)', '“A set of elements in interaction.”', 'all systems'],
    ['ISO/IEC/IEEE 15288:2015, as expanded by SEBoK', '“combination of interacting elements organized to achieve one or more stated purposes”', 'engineered systems'],
    ['INCOSE Fellows (2019)', '“parts or elements that together exhibit behavior or meaning that the individual constituents do not”', 'emergence view'],
  ],
}

const contextTypesTable: Block = {
  kind: 'table',
  caption: 'SEBoK’s four types of engineered system context (R92 p.326), read for AeroLink (instructor’s reading).',
  header: ['Context type (SEBoK)', 'AeroLink reading'],
  rows: [
    ['Product system', 'the eVTOL aircraft'],
    ['Service system', 'the air-taxi service: our system of interest'],
    ['Enterprise system', 'the AeroLink enterprise'],
    ['System of systems', 'urban mobility together with public transport'],
  ],
}

const extName = (id: string) => EXTERNAL_SYSTEMS.find((e) => e.id === id)!.short

export const WEEK01_SESSION1: Lecture = {
  week: 1,
  session: 1,
  title: 'Team Formation / Needs / Identifying Stakeholders',
  subtitle: 'Session 1: Systems, life cycle, teams and stakeholders',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ A. framing (9 min)
    {
      id: 's1-framing',
      title: 'Course framing and the reference case',
      slides: [
        {
          id: 's1-title',
          title: 'Team Formation / Needs / Identifying Stakeholders',
          subtitle: 'Session 1: Systems, life cycle, teams and stakeholders',
          purpose: 'Orient students: the scheduled subject, the shape of the two sessions, and what they produce this week.',
          minutes: 1,
          layout: 'title',
          body: [
            {
              kind: 'bullets',
              items: [
                'Today: what the system is, when in its life we work, who does the work, and whose needs count',
                'Session 2: concerns, needs, the AeroLink worked example, laboratory launch',
                'Week 1 Team Record: five engineering outputs plus an AI-use statement',
              ],
            },
          ],
          sources: [],
          notes: {
            teach: [
              'Read the subject line as it appears in the course schedule. State the promise: by the end of today you can define your system and its boundary, place stakeholder work in the life cycle and in ISO/IEC/IEEE 15288, organize a team, and identify stakeholders by three methods.',
              'Name the Team Record: charter, enterprise proposal, context, stakeholder register and initial needs, plus an AI-use statement, for each team’s own enterprise. It is due before Week 2, Session 1.',
            ],
            why: 'Orientation lowers cognitive load: students who know where the session is going can file each idea as it arrives, and naming the outputs tells them which ideas they must use within a week.',
            examples: [
              'Instructor preparation (not for students): this deck is pending faculty review. Decide three open items before class: the control and influence placement (slide 10), the ANSP classification (slide 21) and the method-coverage counting rules (slide 23).',
              'Timing plan: 69 minutes of content and a 6-minute buffer. If the session runs long, shorten the context walk on slide 9 or the classification slide 22, never the sweep (slide 19) or the method comparison (slide 23).',
            ],
            misconceptions: [
              {
                claim: 'Week 1 is administrative: form a team and get started.',
                correction: 'Week 1 creates engineering data. The stakeholder, concern and need identifiers recorded this week are imported into the SysML v2 model in Weeks 8 and 9, so an error made now propagates.',
              },
            ],
            transition: 'Before any definitions, a question about AeroLink. We answer it at the end of the session.',
            timing: '1 min: 30 s subject and promise, 30 s the Team Record.',
          },
        },
        {
          id: 's1-driving-question',
          title: 'The driving question: is this list enough?',
          purpose: 'Create a need to know before any explanation, and surface the prior conception that stakeholders are customers and users.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s1-vertiport-scene',
            caption: 'A new AeroLink vertiport beside a residential district, and the three parties the project team proposes to consult (FICTIONAL).',
            alt: 'A side view of a street. On the left, four houses labeled homes. In the middle, a new vertiport with an air taxi descending onto its pad. On the right, a power line on two poles running to the vertiport, and a building labeled city hall. A dashed arc above is labeled controlled airspace. Dashed circles with question marks float above the homes, the airspace, the power line and city hall. A panel at the bottom reads: proposed list: passengers, investors, aircraft manufacturer.',
          },
          body: [
            { kind: 'callout', tone: 'note', title: 'Scenario (FICTIONAL)', text: 'The team will write the needs from three stakeholders only: **passengers, investors and the aircraft manufacturer**.' },
            { kind: 'bullets', items: ['**A** · Enough', '**B** · Add more users or customers', '**C** · Add other kinds of party', '**D** · Cannot tell yet'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Read the scenario aloud while students look at the scene. Allow 30 seconds of silent thought, then take a show of hands for A to D. Write the distribution on the board without comment.',
              'Ask two volunteers with different answers for one reason each. Do not resolve the disagreement; say that the answer comes on slide 23, when everyone has three methods for checking any list, including their own team’s.',
            ],
            why: 'A prediction made before instruction creates a need to know and exposes prior conceptions; most students equate stakeholders with customers and users. The withheld answer gives the session an arc that closes on slide 23.',
            figure: 'Point at the scene only once: homes, a power line, city hall and the airspace are things, not stakeholders. The question marks invite students to ask who stands behind each thing; do not name anyone yet.',
            examples: [
              'Typical reasoning for B: “we need more user types: commuters, tourists, business travelers.” It stays inside the customer frame and is the most common wrong answer.',
              'An enterprise analogue, described generically: a hospital plans a rooftop helicopter pad and consults only clinicians, the hospital board and the helicopter operator. The neighbors, the aviation regulator and the city planning office are missing, and any one of them can stop the project. Slide 19 reuses this case.',
            ],
            misconceptions: [
              {
                claim: 'Stakeholders are the people who use, buy or build the system.',
                correction: 'Using, buying or building is sufficient but not necessary. Having an interest in the system, or being affected by it, is enough (slide 17).',
              },
            ],
            transition: 'To answer the question we need to know what the system is. First, how this week fits the course, and why the data must be exact.',
            timing: '3 min: 30 s read, 30 s think, 1 min vote, 1 min two reasons.',
          },
        },
        {
          id: 's1-course-architecture',
          title: 'One enterprise, two representations; AeroLink is the worked case',
          purpose: 'Show why Week 1 data must be precise (Phase II models it), separate the worked example from the team project, and state the suitability criteria for a team enterprise.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s1-two-phases',
            caption: 'The course in two phases. Week 1 stakeholders, concerns and needs flow into the Phase II model in Weeks 8 and 9.',
            alt: 'Two lanes of four boxes. The top lane, Phase I, Weeks 1 to 7, runs from Week 1 (stakeholders, concerns, needs) through Week 2 (ConOps, requirements) and Weeks 3 to 6 to Week 7 (the Systems Thinking Package). The bottom lane, Phase II, Weeks 8 to 14, runs from Week 8 (stakeholders and concerns modeled) through Week 9 (needs and requirements) and Weeks 10 to 13 to Week 14 (a coherent SysML v2 model). Arrows go down from Week 1 to Week 8 labeled STK, CON; from Week 1 to Week 9 labeled NEED; from Week 2 to Week 9 labeled REQ; and from Week 7 to Week 14, labeled the package is the model’s source.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                'Phase I documents your enterprise; Phase II models it in SysML v2',
                'STK, CON and NEED identifiers are **engineering data**',
                'Each method is shown on AeroLink, then applied to **your own approved enterprise**',
                { text: 'Suitable (course convention):', sub: ['people and technology, interacting', 'exchanges across its boundary; differing stakeholders'] },
              ],
            },
          ],
          sources: [],
          notes: {
            teach: [
              'Walk the two lanes: seven weeks of document-based systems thinking that end in the Systems Thinking Engineering Package, then seven weeks that rebuild that same package as a SysML v2 model. Week 8 imports this week’s stakeholders and concerns; Week 9 models the needs with the Week 2 requirements.',
              'Draw the consequence: an identifier that changes meaning between weeks breaks every trace that uses it. Treat STK, CON and NEED identifiers as keys in a database.',
              'State the course rule: AeroLink is the instructor’s worked example; each team develops its own enterprise, approved in Session 2. AeroLink or a near copy is not allowed.',
              'Give the criteria and their reasons: interacting people and technology, because stakeholder and team work need a socio-technical system; exchanges across the boundary, because context analysis needs them; differing stakeholders, because needs conflict; and enough substance for the Phase II model.',
              sayWhy('proposal'),
            ],
            why: 'Students take care over data they know will be reused, and teams that choose a poor enterprise lose weeks. Giving the criteria before the methods lets students judge their candidates while they learn.',
            figure: 'Read the top lane left to right, then the bottom lane. Trace the accent arrows: STK and CON go to Week 8, NEED goes to Week 9; the plain arrow carries requirements from Week 2. The phase structure and the pairings are course design, not a claim from the literature.',
            examples: [
              'Suitable (illustrations, not prescriptions): a regional food bank network; a hospital emergency department; a campus shuttle service. Too small: a smartphone app with no service around it. Too large: “commercial aviation.”',
              'Not allowed: an on-demand electric air-taxi service, or a close variant such as an air-ambulance network built from the same parts as AeroLink.',
            ],
            misconceptions: [
              {
                claim: 'Phase II starts over in a modeling tool.',
                correction: 'Phase II models the team’s own Phase I package; the course schedule names the Phase I artifact each Phase II week models.',
              },
            ],
            transition: 'Here is the worked example you will see all semester.',
            timing: '3 min: 1 min the two lanes and identifiers, 45 s the course rule, 1 min the criteria, 15 s why and what it feeds.',
          },
        },
        {
          id: 's1-meet-aerolink',
          title: 'Meet AeroLink (FICTIONAL)',
          purpose: 'Give the worked case enough substance to reason about: the Data Sheet values and the five operational scenarios.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s1-aerolink-network',
            caption: 'AeroLink Urban Mobility: six vertiports in one metropolitan region, with the course Data Sheet values (all FICTIONAL).',
            alt: 'Six circles labeled V1 to V6, each marked 2 chargers, joined by thin lines to every other circle. The line from V1 to V2 is highlighted and labeled typical trip: 25 km at 150 km/h, about 10 min. A panel lists 12 aircraft × 4 seats, 16 h operating day, 20 min charge to dispatch. A dashed box near V5 reads homes near the new site. A note says all values are fictional (course Data Sheet).',
          },
          body: [
            {
              kind: 'bullets',
              items: ['SCN-001 Passenger Ride Request', 'SCN-002 Passenger Transport Mission', 'SCN-003 Aircraft Charging', 'SCN-004 Maintenance Event', 'SCN-005 Weather Disruption'],
            },
          ],
          sources: [],
          notes: {
            teach: [
              'Introduce AeroLink Urban Mobility: a fictional company that runs electric vertical-take-off-and-landing (eVTOL) air taxis between six vertiports in one region. Every number is a teaching value from the course Data Sheet.',
              'Do one mental check aloud: 25 km at 150 km/h takes 25 ÷ 150 = 1/6 h, about 10 minutes of flight.',
              'Name the five operational scenarios; they return in Week 2 as the backbone of the ConOps.',
            ],
            why: 'Students cannot reason about stakeholders of a system they cannot picture. A map, five numbers and five scenarios make the case concrete without burying the session in data.',
            figure: 'Point at the six vertiports and the any-to-any lines: the service is on demand between any pair. Read the highlighted trip and the panel. The dashed box marks the new site of the driving question.',
            examples: [
              'Two further Data Sheet values used later: a 20 % energy reserve policy and a 65 dBA pad-edge noise limit for each take-off or landing, agreed with the city (both FICTIONAL).',
              'Real aerospace analogue, described generically: urban air mobility concepts propose short electric flights between purpose-built landing sites; the regulatory and community questions they raise are the ones this course studies. No real program’s data is used.',
            ],
            misconceptions: [
              {
                claim: 'The Data Sheet values are realistic estimates we should defend.',
                correction: 'They are fixed teaching values chosen for arithmetic and discussion. Defend reasoning, not numbers.',
              },
            ],
            transition: 'Before we can ask whose needs matter, we must agree what system we mean: the stakeholders follow from the system and its boundary.',
            timing: '2 min: 1 min the map and the check, 1 min the scenarios.',
          },
        },
      ],
    },
    // ============================================================================================ B. system concepts (18 min)
    {
      id: 's1-system-concepts',
      title: 'System concepts at graduate depth',
      slides: [
        {
          id: 's1-se-purpose',
          title: 'What systems engineering is for, and what we mean by “system”',
          purpose: 'Anchor the week in the purpose of systems engineering (successful systems satisfy the needs of all their stakeholders) and adopt the engineering definition of system deliberately.',
          minutes: 3,
          layout: 'definition',
          body: [
            { kind: 'definition', term: 'Systems engineering', text: '“A transdisciplinary approach and means to enable the realization of successful systems.”', source: R('R01', '51') },
            { kind: 'callout', tone: 'key', text: '“Successful systems must satisfy the needs of their customers, users **and other stakeholders**.”' },
            { kind: 'definition', term: 'System (course working definition)', text: '“combination of interacting elements organized to achieve one or more stated purposes”', source: R('R38', '1637') },
          ],
          sources: [R('R01', '51'), R('R38', '1637'), R('R91', '130')],
          notes: {
            teach: [
              'Read the SEBoK definition of systems engineering and the sentence after it (R01 p.51). Underline “and other stakeholders”: the definition of success reaches beyond customers and users.',
              'Give the course working definition of system: ISO/IEC/IEEE 15288:2015, in the expanded form the SEBoK glossary records (R38 p.1637). SEBoK calls it the recognized definition for systems engineers and restricts it to engineered systems created with a purpose that provides value to beneficiaries. Purpose implies beneficiaries, and beneficiaries are stakeholders: that is the hook for the week.',
              'Add one fact: the definition admits people, information, techniques, facilities and services as elements (R38 p.1637). A service such as AeroLink is a system, and its pilots and procedures are elements of it.',
              'Point to the reading: the glossary’s other two definitions (systems science; the INCOSE Fellows’ emergence view) are compared in the lesson.',
              'One sentence on principles: SEBoK reports 15 principles developed by the SEPAT, which it describes as first steps toward consensus (R91 p.130). Principle 1 ties SE to stakeholder needs and context; principle 7 to needs that change over the life cycle.',
            ],
            why: 'Students need a reason to spend a week on stakeholders before any design. If success is defined by stakeholder needs, missing a stakeholder means failing by definition; and the purpose built into the working definition makes stakeholder analysis part of defining the system.',
            examples: [
              'A river basin is a system in the systems-science sense but not an engineered system: it has no stated purpose. A flood-control scheme on that river is an engineered system, and the river becomes part of its environment.',
              'AeroLink: a technically excellent aircraft that the community blocks from landing near homes is not a successful system in SEBoK’s sense.',
            ],
            misconceptions: [
              {
                claim: 'Systems engineering is about technical integration; stakeholders are a management topic.',
                correction: 'SEBoK defines successful systems by stakeholder needs (R01 p.51), and its first principle makes SE specific to stakeholder needs and context (R91 p.130).',
              },
              {
                claim: 'A system is a physical product.',
                correction: 'The working definition admits people, information, techniques, facilities and services as elements (R38 p.1637).',
              },
            ],
            transition: 'Within such a system, which part is ours? SEBoK’s name for it is the system of interest, and around it are enabling systems.',
            timing: '3 min: 1 min SE and success, 1.5 min the working definition, 30 s principles.',
          },
        },
        {
          id: 's1-soi-enabling',
          title: 'System of interest and enabling systems',
          purpose: 'Introduce the distinction most students miss: the system of interest versus the enabling systems that support it across the life cycle.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s1-soi-enabling',
            caption: 'The AeroLink air-taxi service (system of interest) with its operational elements, four enabling systems and three external systems.',
            alt: 'A dashed boundary labeled System of interest, AeroLink air-taxi service, contains four linked operational elements: eVTOL aircraft, pads and chargers, operations center and communications. On the left, four enabling systems are joined to the boundary by dotted lines: maintenance facility (serves support), training system (serves utilization), charger test rig (serves production and V&V) and project team (serves concept and development). On the right, three external systems are joined by solid arrows: electric grid (EXT-002, power), controlled airspace (EXT-001, access) and weather (EXT-003, constrains), whose arrow points one way, inward. A note inside the boundary says SEBoK allows a system of interest to include enabling systems.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                '**System of interest:** “the system whose life cycle is under consideration”',
                '**Enabling system:** complements the SoI across its life-cycle stages; need not contribute directly to its function in operation',
                'AeroLink: maintenance, training, test rig, project team',
                'Every enabling system has owners: **stakeholders**',
              ],
            },
          ],
          sources: [R('R39b', '1652'), R('R39c', '1493')],
          notes: {
            teach: [
              'Give the glossary definitions of system of interest (R39b p.1652): the ISO/IEC/IEEE 15288:2015 one on the slide, and von Bertalanffy’s “the system of interest to an observer.” Add SEBoK’s note: a system of interest may include both operational and enabling systems, so the boundary is a decision.',
              'Define enabling system, paraphrasing the glossary (R39c p.1493): it complements the system of interest during its life-cycle stages but need not contribute directly to its function in operation. SEBoK’s examples: maintenance and support, test, installation or training systems, and project teams.',
              'Apply it with the figure: operational elements inside; enabling systems on the left; external systems on the right.',
              'Land the point: each enabling system has owners and operators, and they are stakeholders. The sweep on slide 19 finds them.',
            ],
            why: 'Students who list only the operational system miss whole stakeholder groups: trainers, maintainers, testers. The enabling-system concept gives a systematic reason to look for them.',
            figure: 'Start inside the dashed boundary: four operational elements that work together in use. Move left: four enabling systems on dotted lines, each labeled with the stage it serves. Move right: three external systems named as systems, exchanging with the service in operation; weather acts one way only. Close on the italic note: including an enabling system inside the boundary is a modeling choice the team must state.',
            examples: [
              'Aerospace, described generically: a launch vehicle’s system of interest is the vehicle and its flight software; the launch pad, test stands and propellant-loading equipment are enabling systems with their own owners.',
              'Enterprise, described generically: for a hospital’s new patient-record system, the data-migration tooling and the training program are enabling systems; the clinical educators who run the training are stakeholders.',
            ],
            misconceptions: [
              {
                claim: 'An external system is the same as an enabling system.',
                correction: 'Enabling systems support a life-cycle stage of the system of interest (R39c p.1493); external systems exchange material, energy or information with it, typically in operation (slide 9).',
              },
            ],
            transition: 'The system of interest sits inside something larger: the enterprise. Each team proposes an enterprise, so this concept must be exact.',
            timing: '3 min: 1 min definitions, 1.5 min figure, 30 s the stakeholder consequence.',
          },
        },
        {
          id: 's1-enterprise',
          title: 'An enterprise is not an organization',
          purpose: 'Make the enterprise concept exact, because each team proposes an enterprise and the system of interest inside it.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s1-enterprise-nesting',
            caption: 'The AeroLink company is one organization in the AeroLink enterprise; the system of interest spans organizations; the extended enterprise lies outside.',
            alt: 'An outer region labeled extended enterprise contains, on the right, passengers (downstream consumers), insurers (upstream supplier of insurance), public transport and emergency response (sidestream partners) and the FAA, city and ANSP (key stakeholders). Inside it, a region labeled AeroLink enterprise, one shared mission, holds AeroLink Urban Mobility (the company, one organization), four partner organizations (vertiport operators, electric utility, aircraft manufacturer, investors) and other resources (funding, processes, policies). A boundary inside the enterprise, the system of interest, air-taxi service, contains fleet, operations center, and booking and dispatch, and a dashed box, pads and chargers, owned by the vertiport operators, not by AeroLink. A dotted arrow from the vertiport operators to the pads shows that the system of interest spans more than one organization.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                '**Enterprise:** “one or more organizations sharing a definite mission, goals, and objectives to offer an output such as a product or service”',
                'Not an organization: it also holds people, knowledge, processes and assets',
                '**Extended:** upstream suppliers, downstream consumers, sidestream partners',
                'Propose the enterprise, then the SoI inside it',
              ],
            },
          ],
          sources: [R('R39d', '1497'), R('R07', '815–816')],
          notes: {
            teach: [
              'Give the definition SEBoK prefers (R39d p.1497, after ISO 15704). SEBoK prefers it because it focuses on purpose rather than structure.',
              'Stress the warning (R07 p.815): treating an enterprise as an organization is “a frequent misuse.” An enterprise includes people, knowledge and assets such as processes, policies and facilities; some enterprises contain no readily identifiable organization.',
              'Introduce the extended enterprise (R07 p.816): upstream suppliers, downstream consumers and end-user organizations, and perhaps “sidestream” partners and key stakeholders.',
              'State the proposal rule: name the enterprise (its mission and participants), then the system of interest inside it. They are different things with different identifiers.',
            ],
            why: 'The most common error in team proposals is to name a company and call it the system. Organization, enterprise and system of interest give teams three separate questions to answer.',
            figure: 'Read from the outside in. The extended enterprise interacts without sharing the mission: passengers, the insurers who supply insurance, public transport and emergency response, and the authorities. The AeroLink enterprise holds the company, four partners and other resources, all sharing one mission; the company is one box among several. Then the system of interest: what AeroLink controls, plus the dashed pads and chargers owned by the operators. The placements are the instructor’s, consistent with the case data.',
            examples: [
              'Aerospace, described generically: a commercial aircraft program is an enterprise of an airframer, engine makers, system suppliers and certification authorities; no single organization chart contains it.',
              'Enterprise, described generically: a regional food bank network is an enterprise of independent pantries, donors, volunteers and logistics partners sharing one mission with no common owner.',
            ],
            misconceptions: [
              {
                claim: 'The enterprise is the company.',
                correction: 'SEBoK calls that “a frequent misuse” (R07 p.815). The company is one organization in the enterprise.',
              },
              {
                claim: 'The enterprise and the system of interest are the same thing at different sizes.',
                correction: 'The enterprise is defined by a shared mission; the system of interest is chosen for a question (next slide). They carry different identifiers (ENT-001, SOI-001).',
              },
            ],
            transition: 'If the system of interest is chosen, what decides the choice? A question.',
            timing: '3 min: 1 min definitions, 1 min organization versus enterprise, 1 min figure and proposal rule.',
          },
        },
        {
          id: 's1-three-scopes',
          title: 'AeroLink: three scopes, one question',
          purpose: 'Demonstrate that the system of interest is chosen for a question, by testing three candidate boundaries against one question with student input.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s1-three-scopes',
            caption: 'Three candidate systems of interest for one question. Only scope (c) contains the waiting time and the queue that causes it.',
            alt: 'Three nested boundaries. The smallest, (a) Aircraft, contains the eVTOL aircraft. The middle one, (b) Flight operations, adds pilots and dispatch and flights flown. The largest, (c) Air-taxi service, adds passenger demand, the charger and pad queue, and waiting time, the quantity the question asks about. Arrows form a loop inside (c) only: passenger demand loads the queue, the queue delays passengers and so sets waiting time, and waiting time shapes demand. Flights flown in (b) also feed the queue. A note says that waiting time and its cause lie outside (b).',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                'Question: *Will adding aircraft reduce average passenger waiting time?*',
                '(a) Aircraft: cannot answer; waiting lies outside',
                '(b) Flight operations: optimistic if chargers are the limit',
                '(c) Air-taxi service: holds the demand–queue–waiting loop',
                'The SoI is chosen **for a question**',
              ],
            },
          ],
          sources: [R('R02', '264'), R('R50', '46–47')],
          notes: {
            teach: [
              'Pose the question and give 30 seconds in pairs: which boundary would you draw to answer it? Take two answers.',
              'Test (a): waiting time is not a property of an aircraft, so this boundary cannot answer the question. Test (b): it can count flights, but if charger and pad turnaround is the real limit, it predicts that more aircraft always help; the cause of waiting lies outside it.',
              'Test (c), the air-taxi service with passenger demand inside: large enough to contain the feedback between demand, capacity and waiting, small enough to analyze. This is SOI-001, which slide 9 places at the wider system of interest.',
              'Apply the synthesis check (R50 pp.46–47): identify the whole the candidate is part of, then its role there. Close with SEBoK: observers identify systems of interest relevant to their needs, each a system whole (R02 p.264).',
            ],
            why: 'This is the first worked demonstration of the week: students see a boundary rejected for a stated reason, which is what the rubric rewards in their proposals.',
            figure: 'Trace the boundaries from the inside out. Point at the waiting-time box: inside (c), outside (b). Trace the loop: demand loads the queue, the queue delays passengers, waiting shapes demand. Flights flown in (b) feed the queue, but the queue is outside (b).',
            examples: [
              'MITRE’s synthesis example (R50 p.47): to understand an unmanned aerial vehicle synthetically, identify the larger system it belongs to, describe it, then identify the vehicle’s role in it. The same move takes AeroLink from (a) to (c).',
              'Enterprise, described generically: “Will a second triage nurse cut emergency-department waits?” cannot be answered with a boundary around triage alone if beds upstairs are the real limit.',
            ],
            misconceptions: [
              {
                claim: 'The biggest boundary is the safest.',
                correction: 'A boundary around the city’s whole transport system cannot be analyzed and hides what the team can change. Choose the smallest scope that contains the causes of the behavior asked about.',
              },
            ],
            transition: 'We have used boundary, environment and context informally. SEBoK gives a precise structure.',
            timing: '3 min: 1 min pairs and answers, 1.5 min the three tests, 30 s synthesis check.',
          },
        },
        {
          id: 's1-context-structure',
          title: 'Boundary and context: the structure, applied to AeroLink',
          subtitle: 'Boundary rule: “what can be changed and what must remain fixed” · Think–pair–share (1 min): is the grid in the WSoI?',
          purpose: 'Teach the boundary as an observer’s distinction and SEBoK’s four-layer context (narrower and wider system of interest, immediate and wider environment), with the rule for drawing the boundary.',
          minutes: 4,
          layout: 'figure',
          figure: {
            id: 'w1s1-context-layers',
            caption: 'Four layers of a system context (after Flood and Carson, via SEBoK) with AeroLink’s six external systems; the stakeholder behind each is recorded separately.',
            alt: 'Four nested regions. Innermost, the narrower system of interest, what AeroLink controls: fleet, operations center, booking and dispatch, scoped by authority or control. Around it, the wider system of interest, SOI-001, the air-taxi service, adds the vertiport operators’ pads and chargers and passenger demand. Around that, the immediate environment of external systems, each joined to the wider system of interest by a labeled arrow and naming the stakeholder behind it: controlled airspace, EXT-001, behind it STK-007 ANSP, access and clearances; electric grid, EXT-002, behind it STK-010 utility, power; weather, EXT-003, none, a natural system, constrains, an arrow pointing inward only; aircraft and spares supply, EXT-004, behind it STK-011 manufacturer, aircraft and spares; public transport network, EXT-005, operator not in register, passengers; emergency response service, EXT-006, behind it STK-006 responders, incident response. The outermost region, the wider environment, has no direct interaction but may influence decisions; it lists regional economy, public opinion and national aviation policy.',
          },
          body: [],
          sources: [R('R39i', '1639'), R('R92', '326–327')],
          notes: {
            teach: [
              'Boundary (R39i p.1639, after Checkland): “a distinction made by an observer” between a system and its environment. It is drawn, not found.',
              'Walk SEBoK’s open-system context, after Flood and Carson (R92 p.326). Narrower system of interest: the system of direct concern, scoped by authority or control. Wider system of interest: all the elements needed to understand behavior, including some the observer does not control. Immediate environment: systems that exchange material, energy or information with it. Wider environment: no direct interaction, but may influence decisions.',
              'Read the boundary rule (R92 p.327): it depends on “what can be changed and what must remain fixed.” SEBoK adds that the system of interest always includes the narrower one but may include the wider one, as for a service. AeroLink’s SOI-001 is drawn at the wider system of interest: it needs the operators’ pads and the passenger demand it does not control.',
              'Run the think–pair–share in the subtitle: is the electric grid in the wider system of interest or the immediate environment? Accept either answer if it is argued from what can be changed.',
            ],
            why: 'The narrower and wider system of interest resolve the commonest team argument, “we don’t control the vertiports, so are they in or out?” The rule turns taste into an argument.',
            figure: 'Work from the center out: what AeroLink controls; then the dashed wider system of interest and what it adds. Walk the six external systems clockwise: each is named as a system, and the stakeholder behind it is written underneath. Stop at weather: one-way, and no one behind it.',
            examples: [
              'Model answer for the think–pair–share, not the only one: the grid is in the immediate environment, because AeroLink cannot change it; what crosses is power under an agreed connection capacity. A team arguing for the wider system of interest must show AeroLink can negotiate the connection terms, which makes the connection, not the grid, the inside element.',
              'Enterprise, described generically: for a hospital emergency department, the narrower system is the department; the wider system adds the inpatient bed-management process it depends on but does not run.',
              'The lesson gives the full vocabulary (environment, context, systemic resolution) with its figure.',
            ],
            misconceptions: [
              {
                claim: 'If we do not control something, it is outside the system of interest.',
                correction: 'The wider system of interest contains elements the observer has no authority over but needs in order to understand behavior (R92 p.326).',
              },
              {
                claim: 'An external system and the organization that runs it are the same thing.',
                correction: 'The system is context; its owner is a stakeholder. The figure names both, separately.',
              },
            ],
            transition: 'The rule “what can be changed” already hints that boundaries are not neutral. Who draws them, and for whom?',
            timing: '4 min: 30 s boundary, 1.5 min the layers, 1 min AeroLink walk-through, 1 min think–pair–share.',
          },
        },
        {
          id: 's1-boundary-decision',
          title: 'A boundary is a decision: purpose, control and power',
          purpose: 'Show that boundaries are never neutral, which motivates systematic stakeholder analysis.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s1-control-influence',
            caption: 'What AeroLink controls, what it influences, and what influences it beyond its influence: one defensible reading (instructor to confirm).',
            alt: 'Three nested regions. Inner, we control: AeroLink fleet, dispatch and schedule, operations center. Middle, we influence: vertiport operators, the electric utility, and passenger demand through fares and service. Outer, influences us, beyond our influence: weather, national aviation policy and ANSP airspace rules. A note says this is the instructor’s reading and others are defensible. On the right, MITRE’s questions: 1, what is my enterprise; 2, which elements do I control; 3, which do I influence; 4, which influence me though I neither control nor influence them. A boxed note says too tight a boundary hides the owners of your constraints.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Several SoIs fit one situation; purpose picks one', 'Critical systems thinkers: **power and responsibility** shape boundaries', 'MITRE: what do I control? influence? what influences me?', 'Too tight a boundary hides the owners of your constraints'],
            },
          ],
          sources: [R('R02', '264'), R('R50', '48')],
          notes: {
            teach: [
              'SEBoK (R02 p.264): observers allocate boundaries that reflect their own needs and experience, so several systems of interest fit one situation. It reports that Churchman and other critical systems thinkers treat the relative power and responsibility of participants as key factors in defining problem boundaries.',
              'Read MITRE’s four questions (R50 p.48) and walk the figure as one defensible reading, the instructor’s.',
              'Make the consequence explicit: a boundary drawn too tightly hides the parties who own your constraints; for AeroLink, the vertiport operators and the utility.',
            ],
            why: 'Students treat boundary drawing as a technical act. Showing that purpose and power shape it explains why a systematic stakeholder search is needed.',
            figure: 'Inner region first, then the middle: AeroLink can negotiate with operators and the utility and shape demand through fares, but cannot command them. Outer region: weather, policy and airspace rules act on AeroLink. Match MITRE’s questions to the regions.',
            examples: [
              'Enterprise, described generically: an airport expansion planned around airlines and passengers, with the boundary at the fence, misses the residents under the new approach path, who then use planning law to stop it.',
            ],
            misconceptions: [
              {
                claim: 'A boundary is an objective fact about the system.',
                correction: 'SEBoK defines it as a distinction made by an observer (R39i p.1639) and notes that the observer’s needs shape it (R02 p.264).',
              },
            ],
            transition: 'We now know what system. Next: when in its life we do this work, and under which formal process.',
            timing: '2 min: 1 min sources, 1 min figure and consequence.',
          },
        },
      ],
    },
    // ============================================================================================ C. life cycle (8 min)
    {
      id: 's1-life-cycle',
      title: 'Life cycle and the 15288 process frame',
      slides: [
        {
          id: 's1-life-cycle-stages',
          title: 'The life cycle and its stages',
          subtitle: 'Life cycle: “the evolution of a system … from conception through retirement” (15288:2015, via SEBoK)',
          purpose: 'Locate stakeholder-needs work in time, and reconcile the two stage vocabularies students will meet.',
          minutes: 2,
          layout: 'figure',
          figure: {
            id: 'w1s1-life-cycle',
            caption: 'Six life-cycle stages with their primary goals and decision gates (SEBoK), aligned with the stage names of SEBoK’s stakeholder table.',
            alt: 'Six stage boxes in a row with diamond decision gates between them. Concept (highlighted, labeled Week 1 works here): identify stakeholders’ needs, explore concepts, propose viable solutions. Development: refine requirements, create the solution description, build, verify and validate. Production: produce systems, inspect and test. Utilization: operate the system to satisfy users’ needs. Support: provide sustained system capability. Retirement: store, archive or dispose of the system. A second row, labeled stage names in SEBoK’s stakeholder table, aligns Concept, Development, Production integration and V&V, Operation, Logistics and maintenance, and Disposal under the six stages. A closing line reads: a register built from the operation stage alone misses most stakeholders.',
          },
          body: [],
          sources: [R('R39f', '1550'), R('R06b', '384'), R('R11', '552')],
          notes: {
            teach: [
              'Read the life-cycle definition (R39f p.1550; the same wording in R06b p.384). A stage relates to the state of the system’s description or realization; movement between stages passes a decision point with entry and exit criteria (R06b p.384).',
              'Dwell on Concept: “Identify stakeholders’ needs. Explore concepts. Propose viable solutions.” That is where Week 1 works. Add that stages may iterate and overlap, and a system of interest can be in several stages at once (R06b p.384).',
              'Show the second row: SEBoK’s stakeholder table uses other names (R11 p.552, Table 1). Map them, and say that the sweep on slide 19 uses Table 1’s names.',
            ],
            why: 'Students need the time axis to see why stakeholder identification is broader than “who uses it.”',
            figure: 'Read Concept’s goals, then move right, touching each diamond as a gate. Drop to the second row and read the three names that differ: operation, logistics and maintenance, disposal. The alignment of the rows is the instructor’s mapping of two SEBoK vocabularies.',
            examples: [
              'AeroLink: when a new vertiport is planned, the existing ones are in utilization while the new one is in concept, with different stakeholders active at each.',
            ],
            misconceptions: [
              {
                claim: 'The life cycle is a waterfall: each stage finishes before the next begins.',
                correction: 'SEBoK says some models permit iteration and concurrency, and a system of interest can be in several stages at once (R06b p.384).',
              },
            ],
            transition: 'Stages describe when. The process standard describes what is done: ISO/IEC/IEEE 15288.',
            timing: '2 min: 1 min definition, stages and Concept; 1 min the mapping.',
          },
        },
        {
          id: 's1-15288-processes',
          title: 'Where Week 1 sits in ISO/IEC/IEEE 15288',
          purpose: 'Give students the formal process map, and an honest view of the terminology for the Week 1 process.',
          minutes: 3,
          layout: 'figure',
          figure: {
            id: 'w1s1-process-strip',
            caption: 'The fourteen 15288:2015 technical processes as SEBoK lists them. Week 1 is the first two (SEBoK’s Concept Definition); Week 2 starts the third.',
            alt: 'Fourteen numbered process boxes in two rows of seven. Row one: 1 Business or Mission Analysis and 2 Stakeholder Needs and Requirements Definition, both highlighted and tagged Week 1; 3 System Requirements Definition, tagged Week 2; 4 Architecture Definition; 5 Design Definition; 6 System Analysis; 7 Implementation. Row two: 8 Integration, 9 Verification, 10 Transition, 11 Validation, 12 Operations, 13 Maintenance, 14 Disposal. A bracket above processes 1 and 2 reads SEBoK: Concept Definition. Below, a row headed one process, three names gives: SEBoK article, Stakeholder Needs Definition; 15288:2015 via SEBoK, Stakeholder Needs and Requirements Definition; DoD SE Guidebook, Stakeholder Requirements Definition. A note says the processes iterate and overlap rather than run in strict order.',
          },
          body: [],
          sources: [R('R98', '1001–1002'), R('R94', '540'), R('R11', '549, 551'), R('R48a', '141')],
          notes: {
            teach: [
              'Name the fourteen technical processes as SEBoK lists them (R98 pp.1001–1002). Week 1 is processes 1 and 2; Week 2 begins process 3.',
              'SEBoK groups the first two as Concept Definition, in which decision makers and key stakeholders describe what a solution should accomplish and why (R94 p.540): “Both why and what need to be answered before consideration is given to how.”',
              'Read the bottom row honestly. The SEBoK article says Stakeholder Needs Definition and notes the process is frequently called “Stakeholder Needs and Requirements” (R11 pp.549, 551); the 15288:2015 list says Stakeholder Needs and Requirements Definition (R98 p.1001); DoD names a Stakeholder Requirements Definition process (R48a p.141).',
              'State the source gap: the 2023 edition of 15288 is not in the course collection; SEBoK quotes only fragments of it (R39a p.1632). When names differ, cite the source you used.',
            ],
            why: 'Graduate students will meet all three names. Knowing they refer to closely related processes, and that SEBoK deliberately separates needs from requirements, prepares Session 2.',
            figure: 'Read the bracket, then the two highlighted boxes and the third. Sweep the rest quickly, naming Verification and Validation as the places today’s needs come back. Then the bottom row: one process, three names.',
            examples: [
              'Why the naming matters (R11 p.551): guides often treat expectations, needs and requirements as the same, which causes confusion; SEBoK focuses on an integrated set of needs and treats stakeholder requirements as one input.',
            ],
            misconceptions: [
              {
                claim: '15288 tells us exactly what to do in Week 1.',
                correction: 'We use the standard only as SEBoK presents it; its process outcomes are not in the collection and the 2023 wording appears only in SEBoK’s fragments. SEBoK’s articles supply the method.',
              },
            ],
            transition: 'The first process, Business or Mission Analysis, hands the second its starting point. What does it hand over?',
            timing: '3 min: 1 min the strip, 1 min Concept Definition, 1 min the three names.',
          },
        },
        {
          id: 's1-bma-feeds-snd',
          title: 'Business or Mission Analysis feeds Stakeholder Needs Definition',
          purpose: 'Show that needs have an anchor: the problem or opportunity, the mission and goals, and an initial ranked list of major stakeholders.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s1-bma-snd',
            caption: 'Business or Mission Analysis hands its outputs to Stakeholder Needs Definition; the two are performed iteratively.',
            alt: 'A box labeled Business or Mission Analysis lists: problem, threat or opportunity; mission, goals, objectives and measures of success; major stakeholders, ranked; preliminary life-cycle concepts; candidate solution classes. An arrow labeled inputs leads to a larger box, Stakeholder Needs Definition, listing: identify more stakeholders across every life-cycle stage; elicit, consolidate, prioritize; identify drivers and constraints; identify risks; mature the life-cycle concepts; and, in bold, identify and baseline the integrated set of needs. A dashed arrow labeled performed iteratively returns from the second box to the first. Below, a panel quotes the FICTIONAL AeroLink mission MGO-001.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                '**BMA:** the problem or opportunity; mission, goals, objectives, measures',
                'Initial stakeholder identification, **ranked**, starts here',
                'Business and user goals may **conflict**',
                'Every need traces to the mission or a goal',
              ],
            },
          ],
          sources: [R('R10', '543–546'), R('R11', '549–552, 554')],
          notes: {
            teach: [
              'Give BMA’s purpose (R10 p.543): to understand a mission or market problem, threat or opportunity, and to establish the goals, objectives and measures of success of a potential solution class.',
              'Walk the outputs (R10 p.544) and stress the hand-off: initial stakeholder identification happens in BMA, recorded in a register with a ranking, and is expanded in Stakeholder Needs Definition (R10 p.545; R11 p.552).',
              'Introduce conflict (R10 p.546): business and user perspectives can yield conflicting goals, prioritized against the enterprise strategy. Session 2 returns to it.',
              'Show AeroLink’s anchor (FICTIONAL): the problem statement and the mission MGO-001, with four goals. SEBoK expects the integrated set of needs to reflect the mission, goals and measures (R11 p.554), so every AeroLink need traces to one of them, and each team writes a problem statement and a mission in its proposal.',
              sayWhy('mission'),
            ],
            why: 'Needs written without a stated problem and mission drift toward wish lists. Showing what BMA hands over tells students their register and needs must trace back to a purpose.',
            figure: 'Read the BMA box, then follow the accent arrow: these outputs are the inputs of Stakeholder Needs Definition. Read its six activities, ending on the bold one. Trace the dashed arrow back: the two iterate (R10 p.543; R11 p.549). Close on the AeroLink panel.',
            examples: [
              `AeroLink problem statement (proposed, FICTIONAL): ${PROBLEM_STATEMENT}`,
              `AeroLink goals (FICTIONAL): ${MISSION_GOALS.filter((m) => m.level === 'goal').map((m) => `${m.id} ${m.name.toLowerCase()}`).join('; ')}.`,
              'SEBoK’s worked example (R10 pp.545–546): a coffee-maker opportunity statement leads to a mission, consumer goals and business goals, which can conflict.',
            ],
            misconceptions: [
              {
                claim: 'Stakeholder identification starts after the mission is fixed and never revisits it.',
                correction: 'BMA and Stakeholder Needs Definition are often performed iteratively (R10 p.543; R11 p.549); new stakeholders can change the problem statement.',
              },
            ],
            transition: 'Processes are performed by people. Before your team performs this one, it has to become a team.',
            timing: '3 min: 1 min purpose and outputs, 45 s hand-off and conflict, 1 min AeroLink problem, mission and goals, 15 s why and what it feeds.',
          },
        },
      ],
    },
    // ============================================================================================ D. teams (7 min)
    {
      id: 's1-teams',
      title: 'Teams in systems engineering',
      slides: [
        {
          id: 's1-team-ipt',
          title: 'What makes a team, and what an IPT is',
          purpose: 'Ground team formation in SE practice: the definition of a team and the integrated product team; the program-level structure is in the lesson.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s1-ipt-structure',
            caption: 'An illustrative AeroLink program: an SEIT over three IPTs aligned to the system breakdown, with an analysis and integration team working across them.',
            alt: 'At the top, a box labeled SE and integration team (SEIT), program level, oversees the IPTs. Lines lead down to three boxes: IPT aircraft, IPT vertiports and IPT operations, each one SBS element and multidisciplinary. Dotted double arrows join each IPT to a bar below them: AIT, safety and reliability specialists, working across every element at this level. Below, a callout reads: your team = one IPT, for one enterprise; DoD: a smaller program may run as a single IPT.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                '**Team:** complementary skills, interdependent, collectively accountable, a common goal',
                '**IPT:** “a multidisciplinary group of representatives who are collectively responsible for delivering a defined product or process”',
                '**Your team is one IPT**',
              ],
            },
          ],
          sources: [R('R39k', '1662'), R('R99', '52'), R('R96', '987–988')],
          notes: {
            teach: [
              'Team, in my words after the SEBoK glossary (R39k p.1662): people whose skills complement each other, who depend on one another, share responsibility for managing themselves, answer for their joint result and work toward a common goal. More than a collection of people.',
              'Read the DoD definition of an integrated product team on the slide (R99 p.52). DoD adds that a smaller program may be organized as a single IPT.',
              'One sentence on the figure: in a product-centered organization, an IPT owns each element of the system breakdown, a top-level SE and integration team oversees them, and analysis and integration teams of specialists work across a level (R96 pp.987–988). Each course team is the simplest case: one IPT.',
            ],
            why: 'Team structure is an engineering decision with a literature behind it, and the IPT idea explains why every discipline must be at the table from Week 1.',
            figure: 'Point at the SEIT, then the three IPTs, each owning one element (illustrative). Point at the AIT bar beneath them: specialists who serve every IPT. End on the callout.',
            examples: [
              'Aerospace, described generically: a large aircraft program runs IPTs for wing, fuselage, propulsion integration and avionics, with integration and specialty teams for weight and safety across them.',
              'DoD best practice (R99 p.52): establish a cyber IPT or working group early so that cyber engineering is part of every SE process.',
            ],
            misconceptions: [
              {
                claim: 'An IPT is a team of systems engineers.',
                correction: 'An IPT is multidisciplinary (R99 p.52).',
              },
            ],
            transition: 'Inside one IPT, how should four people divide the work, and how many conversations does that create?',
            timing: '2 min: 1 min definitions, 1 min figure.',
          },
        },
        {
          id: 's1-team-roles-paths',
          title: 'Organizing your team: roles and communication paths',
          purpose: 'Justify the course’s four lead roles from the literature, and quantify why a small team can run flat, with the heuristic’s limits.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s1-comm-paths',
            caption: 'Communication paths in a fully connected team: N = 4 gives 6 paths; N = 10 gives 45.',
            alt: 'Two complete graphs. On the left, four nodes with all six connecting lines, labeled N = 4, 4 × 3 ÷ 2 = 6 paths, the preferred team size. On the right, ten nodes with all forty-five connecting lines, labeled N = 10, 10 × 9 ÷ 2 = 45 paths. A note below gives SEBoK’s examples: 5 members, 10 paths; 7, 21; 9, 36; above 10, organize hierarchically.',
          },
          body: [
            {
              kind: 'equation',
              display: 'P = N(N − 1) ÷ 2',
              speech: 'P equals N times N minus one, divided by two',
              where: [
                { symbol: 'N', meaning: 'team members' },
                { symbol: 'P', meaning: 'communication paths' },
              ],
            },
            {
              kind: 'bullets',
              items: ['N = 4 → 6 paths; N = 10 → 45; above 10, a hierarchy', 'A rule of thumb, not a law of team size', 'Course roles: Requirements & Compliance, Architecture, AI & Data, V&V'],
            },
          ],
          sources: [R('R96', '986, 988–989')],
          notes: {
            teach: [
              'Organizing options (R96 p.986): by job specialization, each member in a different role coordinated by a lead, or by subsystem. The course uses specialization with four lead roles, a course convention from the syllabus; in a three-person team, AI & Data Management merges with Architecture (instructor’s rule).',
              'Communication paths (R96 p.988, after Brooks): among N engineers there are N(N − 1)/2 paths. SEBoK says a team of more than 10 (45 paths) should be organized hierarchically. Work the number with the class.',
              'Add the caution: SEBoK invokes the “well-known” 7 ± 2 rule; it comes from research on short-term memory span, not from studies of team size, so treat it as a rule of thumb (instructor’s caution; that research is not in the collection).',
            ],
            why: 'Assigned roles prevent the two common failures of student teams: everyone doing everything, and one person doing everything. The path count gives a quantitative reason for the team size.',
            figure: 'Count the left graph aloud: four people, six lines. Let the right graph’s density make the point: ten people, forty-five lines. Read SEBoK’s examples at the bottom.',
            workedSolution: [
              'Formula (R96 p.988): P = N(N − 1) ÷ 2: each of N members can talk to N − 1 others, and each path is shared by two people.',
              'Team of 4 (preferred): 4 × 3 ÷ 2 = 6. Team of 3 (minimum): 3 × 2 ÷ 2 = 3. Team of 10: 10 × 9 ÷ 2 = 45, SEBoK’s threshold for a hierarchy.',
              'Check SEBoK’s examples: N = 5 gives 10, 7 gives 21, 9 gives 36; doubling a team from 5 to 10 multiplies paths by 4.5. A course team of 3–4 can coordinate without a hierarchy.',
            ],
            examples: [
              'SEBoK’s staffing example (R96 p.989): a new initiative needs four roles but the budget supports two; the architect becomes the lead and the requirements engineer also takes integration and test. Course teams of three face the same compromise.',
            ],
            misconceptions: [
              {
                claim: 'Adding people speeds the work in proportion.',
                correction: 'Paths grow roughly with the square of team size (R96 p.988); beyond about ten people, coordination needs structure.',
              },
            ],
            transition: 'Roles say who does what. A charter says how the team decides and behaves.',
            timing: '3 min: 1 min roles, 1.5 min the worked number, 30 s the caution.',
          },
        },
        {
          id: 's1-team-charter',
          title: 'The charter: norms, decision rules and how teams develop',
          purpose: 'Make the charter a professional instrument, grounded in team-dynamics sources, and label the course conventions.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s1-charter-tuckman',
            caption: 'The course charter template (four fields) beside Tuckman’s stages of group development, which groups may revisit.',
            alt: 'On the left, a form titled Team charter, course template, with four fields: lead roles (R&C, Architecture, AI & Data, V&V); decision rules (propose, consensus, vote, tie-break); communication norms (channels, response times, meetings); owned ID prefixes (R&C: STK, CON, NEED; Architecture: ENT, PRT, EXT, REL). On the right, a vertical sequence titled How groups develop (Tuckman): forming, storming, norming, performing, and a dashed box adjourning, added later. A curved arrow from norming back to storming is labeled groups may cycle back.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                '“The team should have a charter.”',
                '**Norms:** formal and informal rules for members’ actions',
                'Forming, storming, norming, performing: a description, not a schedule',
                'Decision rules and ID ownership: **course convention**',
              ],
            },
          ],
          sources: [R('R96', '986, 989–990'), R('R97', '995')],
          notes: {
            teach: [
              'Quote SEBoK (R96 p.986): “The team should have a charter.” Norms are the rules that govern members’ actions and can be formal or informal (R97 p.995); the charter makes the important ones explicit.',
              'Tuckman (R96 p.989; R97 p.995): forming, storming, norming, performing, with adjourning added later. SEBoK notes that while Tuckman’s model is sequential, others (Forsyth) have observed that groups may “recursively and iteratively” progress through the stages (R97 p.995): read it as a description, not a timetable.',
              'Charter contents, a course convention: lead roles; decision rules with a tie-break; communication norms; owned ID prefixes (Requirements & Compliance owns STK, CON and NEED; Architecture owns ENT, PRT for the parts inside the system-of-interest boundary, and EXT). The collection prescribes no decision rule.',
              sayWhy('charter'),
            ],
            why: 'Most team failures in project courses are failures of decision-making and ownership. A charter with a tie-break rule removes the commonest deadlock before it happens.',
            figure: 'Read the four fields with one example entry each, then Tuckman’s stages. Trace the curved arrow back to storming: when roles or deadlines change, groups revisit earlier stages.',
            examples: [
              'SEBoK’s indicators of a cohesive team (R96 p.990, after Fairley) include a “clear understanding of systems engineering roles and responsibilities” and “shared ownership of systems engineering work products.” Its “teamicide” list (after DeMarco and Lister) includes physical separation and fragmented time.',
              'A workable decision rule (course convention): the lead proposes; consensus within one working day; then majority vote; a tie goes to the instructor.',
            ],
            misconceptions: [
              {
                claim: 'Conflict means the team is failing.',
                correction: 'Storming is an expected stage (R96 p.989); the charter channels it.',
              },
            ],
            transition: 'Your team’s first engineering act is to identify stakeholders. So: who counts as one, and how do we find them all?',
            timing: '2 min: 50 s charter, norms and Tuckman; 50 s course conventions; 20 s why and what it feeds.',
          },
        },
      ],
    },
    // ============================================================================================ E. stakeholders (24 min)
    {
      id: 's1-stakeholders',
      title: 'Identifying and classifying stakeholders',
      slides: [
        {
          id: 's1-stakeholder-definitions',
          title: 'Who counts as a stakeholder',
          purpose: 'Show how the four recorded definitions differ in scope, and draw the consequences for who counts.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s1-stakeholder-scope',
            caption: 'Four definitions of stakeholder as the SEBoK glossary records them, and a quick test on AeroLink candidates (FICTIONAL).',
            alt: 'On the left, four stacked cards. 15288:2015: individual or organization with a right, share, claim, or interest. 29148 draft, 2010: as above, with example roles: trainers, maintainers, disposers, regulators. 26702:2007, highlighted: individual, team, organization or classes, with interests in, or concerns relative to. Freeman, 1984: any group or individual who can affect or is affected by the organization’s objectives. On the right, a test with five candidates: weather, not a stakeholder, a natural system; electric grid, not a stakeholder, a system: list its owner; electric utility, stakeholder, an organization; residents near the vertiport, stakeholder, affected, never ride; passengers with reduced mobility, stakeholder, a class of stakeholders.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['A person, team, organization **or a class** of them', 'An interest, or being affected, is enough', 'Systems are context; their owners may be stakeholders'],
            },
          ],
          sources: [R('R39a', '1631')],
          notes: {
            teach: [
              'Read the four definitions as the SEBoK glossary records them (R39a p.1631), pointing at each card: 15288:2015, “right, share, claim, or interest”; the 2010 draft of 29148, the same wording with example roles that include trainers, maintainers, disposers and regulatory bodies; 26702:2007, “an individual, team, or organization (or classes thereof) with interests in, or concerns relative to, a system”; and Freeman (1984), any group or individual who can affect or is affected by an organization’s objectives.',
              'Draw the consequences. First, a stakeholder is a person, team or organization, or a class of them. Second, an interest or being affected is enough. Third, 26702 introduces concerns, Session 2’s subject, and admits classes: AeroLink registers “passengers with reduced mobility” as a class of its own.',
              'Run the test on the right with the class, one candidate at a time.',
            ],
            why: 'Students start with an implicit definition, users and buyers. Four explicit definitions show the scope is wider and give a rule for rejecting non-stakeholders such as the weather.',
            figure: 'Left: the four cards, the highlighted one being the definition that adds classes and concerns. Right: the test. Ask before revealing each answer; the dashed cards are the rejected candidates, and the grid is rejected only because its owner, the utility, is the stakeholder.',
            examples: [
              'Aerospace, described generically: for a new runway, the noise-affected neighbors meet Freeman’s definition (they are affected) and 15288’s (they have an interest), though they never use the runway.',
              'Enterprise, described generically: for a hospital scheduling system, the accreditation body is a stakeholder under the 29148 draft’s “regulatory bodies” although it never logs in.',
            ],
            misconceptions: [
              {
                claim: 'Everything in the context diagram is a stakeholder.',
                correction: 'Systems are not stakeholders; individuals, teams, organizations and classes of them are (R39a p.1631). An external system may have an owner who is.',
              },
            ],
            transition: 'Why does SEBoK insist on finding all of them, and early?',
            timing: '3 min: 1.5 min the definitions, 1 min consequences, 30 s the test.',
          },
        },
        {
          id: 's1-why-stakeholders-first',
          title: 'Why stakeholders come first, and who gets forgotten',
          purpose: 'Establish the stakes: a missing stakeholder means missing needs and a failed validation.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s1-missing-stakeholder',
            caption: 'SEBoK’s chain from a missing stakeholder to a failed validation, read on AeroLink (FICTIONAL), and the groups most often forgotten.',
            alt: 'Four boxes joined by arrows: stakeholder left out; their needs never elicited; requirements miss them; system fails validation. Under each, an AeroLink example: communities near the new vertiport; evening and early-morning noise; no bound on evening events; site permit at risk after it is built. A panel below, who gets forgotten: unwilling stakeholders, affected but not beneficiaries (residents); unstated but necessary needs such as access, language and disability (passengers with reduced mobility); the ones a subset of stakeholders never mentions (MITRE).',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Stakeholders: “the primary source of needs and requirements”', 'One left out: missing needs, **failed validation**', 'Find the beneficiaries **and** the “unwilling”'],
            },
          ],
          sources: [R('R11', '552'), R('R98', '1001'), R('R53', '297')],
          notes: {
            teach: [
              'SEBoK (R11 p.552): stakeholders are “the primary source of needs and requirements”; all relevant stakeholders must be identified from the beginning, and leaving one out often results in missing needs and a failure to pass system validation.',
              'SEBoK’s inclusive-engineering guidance (R98 p.1001): Business or Mission Analysis should identify both the obvious beneficiaries and those potentially affected, which SEBoK calls “unwilling” stakeholders; needs work should capture unstated but necessary needs such as access, language and disability.',
              'MITRE (R53 p.297): needs driven by a subset of the key stakeholders miss key capability needs.',
            ],
            why: 'This slide turns a principle into a risk statement students can repeat: missing a stakeholder is not a courtesy failure but a validation failure.',
            figure: 'Read the chain left to right, then the AeroLink line underneath it. Finish on the panel: these three groups are the ones teams forget.',
            examples: [
              'Aerospace, described generically: a cabin redesign optimized with airlines and passengers but without maintenance technicians produces panels that are slow to remove; turnaround times grow.',
            ],
            misconceptions: [
              {
                claim: 'Stakeholders who oppose the project should be left out of the register.',
                correction: 'Unwilling stakeholders must be identified precisely because they are affected (R98 p.1001).',
              },
            ],
            transition: 'How do we find them all? SEBoK’s thorough source is the life cycle.',
            timing: '2 min: 1 min three sources, 1 min figure.',
          },
        },
        {
          id: 's1-lifecycle-sweep',
          title: 'Method 1: the life-cycle sweep',
          purpose: 'Teach and practice the method SEBoK calls a thorough source: walk every life-cycle stage with SEBoK’s Table 1 as the prompt list, first on the helicopter-pad analogue, then on AeroLink.',
          minutes: 6,
          layout: 'figure',
          figure: {
            id: 'w1s1-lifecycle-sweep',
            caption: 'The life-cycle sweep on AeroLink: which Table 1 stage prompts surface each register stakeholder, and each one’s stage of main involvement (FICTIONAL).',
            alt: 'A matrix with one row per register stakeholder, STK-001 to STK-015, plus a dashed candidate row, battery recycler, and six columns for SEBoK Table 1 stages: Concept, Development, Production and V&V, Operation, Logistics and maintenance, Disposal. Dots mark the stages whose prompts surface each stakeholder; an outline marks its stage of main involvement. A last column gives the first prompt that surfaces it. Concept prompts surface thirteen of the fifteen: end users for passengers and passengers with reduced mobility; regulators and approving authorities for the FAA; sponsor and paying customer for investors; public for communities; owners of enabling systems for vertiport operators; owners of external systems for emergency responders, the ANSP and the electric utility; operators for pilots; suppliers for the aircraft manufacturer; approving authorities for the city planning authority. Maintenance technicians are surfaced at logistics and maintenance by service technicians. Insurers and accessibility advocates are not prompted by any stage and are found by role class. The battery recycler is a candidate surfaced at disposal by waste management. A line at the bottom says owners of external systems, approving authorities and the public are all Concept prompts.',
          },
          body: [],
          sources: [R('R11', '552')],
          notes: {
            teach: [
              'Give SEBoK’s rationale (R11 p.552): a system of interest has many stakeholders over its life cycle, so the life-cycle concepts are “a thorough source for stakeholder identification.” Table 1 lists example stakeholders for each stage.',
              'Practice first, on the helicopter-pad analogue from slide 2. Pairs take two minutes: read Table 1’s Concept and Disposal rows aloud and name one party each row surfaces for the hospital’s pad. Collect three answers (typical: the aviation regulator and the city planning office as approving authorities; the neighbors as “public”; the fuel supplier as an owner of an external system; a waste contractor at disposal).',
              'Then reveal AeroLink. Read the figure column by column. Most dots sit under Concept: Table 1’s Concept prompts include sponsors, end users, operators, suppliers, regulators, the public, owners of enabling and external systems and approving authorities. That is why the communities, the utility and the ANSP surface at Concept, where siting and agreements happen, even though their main involvement differs.',
              'Explain the outlines: the register records each stakeholder’s stage of main involvement, a different question from which prompt finds it. The communities’ main involvement is Concept, because siting a vertiport is a Concept activity.',
              'Read the bottom rows: the insurers and the accessibility advocates are not prompted by any stage; the next methods find them. Ask whether the battery recycler, surfaced by “waste management” at Disposal, belongs in the register.',
              sayWhy('identification'),
            ],
            why: 'The sweep is the method SEBoK itself recommends, and practicing it on a second case before seeing the answer is what turns a table into a habit. Separating “which prompt finds them” from “when they are mainly involved” prevents the operation-centered picture of stakeholders.',
            figure: 'Walk the header left to right as time. Then go row by row for four rows only (passengers, communities, technicians, insurers) and let students read the rest: a dot means that stage’s prompt surfaces the stakeholder; an outline marks the stage of main involvement. Point out that thirteen of fifteen rows have a dot under Concept, and that the technicians are found only at Logistics and maintenance. The prompts are Table 1’s (R11 p.552); which prompt matches which stakeholder is the instructor’s reading.',
            examples: [
              'Aerospace, described generically: for a commuter aircraft, the sweep finds the certification authority at concept, test pilots in development, line mechanics and spare-parts providers in support, and parts recyclers at retirement.',
              'Enterprise, described generically: for a hospital records system, the sweep finds the data-migration team (development), the trainers (support) and the archivists who must retrieve records after retirement (disposal).',
            ],
            misconceptions: [
              {
                claim: 'The sweep starts where the system operates.',
                correction: 'Table 1’s Concept row already names the public, owners of external systems and approving authorities (R11 p.552); most stakeholders surface before operation.',
              },
              {
                claim: 'Stakeholders who appear only at disposal can be identified later.',
                correction: 'SEBoK says all relevant stakeholders must be identified from the beginning (R11 p.552); disposal constraints such as battery recycling shape choices made at concept.',
              },
            ],
            transition: 'The sweep looks along the time axis. Two further methods look across the context and through roles.',
            timing: '6 min: 1 min rationale; 2 min pairs sweep the helicopter-pad case, 45 s three answers; 1.5 min the AeroLink reveal; 30 s the gaps; 15 s why and what it feeds.',
          },
        },
        {
          id: 's1-context-and-roles',
          title: 'Methods 2 and 3: from the context; by role class',
          purpose: 'Two further methods that catch what the sweep misses: the organizations behind external systems, and stakeholder role classes.',
          minutes: 4,
          layout: 'figure',
          figure: {
            id: 'w1s1-context-roles',
            caption: 'Method 2 asks who runs each external system; Method 3 checks the register against MITRE’s role classes and DoD’s list (AeroLink, FICTIONAL).',
            alt: 'Two halves. Left, Method 2: for each external system, who runs it? Six rows: EXT-001 controlled airspace → ANSP; EXT-002 electric grid → electric utility; EXT-003 weather → none, a natural system; EXT-004 aircraft and spares supply → aircraft manufacturer; EXT-005 public transport network → its operator, not registered?; EXT-006 emergency response service → emergency responders. A line reads: the system is context; the organization behind it is the stakeholder. Right, Method 3: which role classes does the list cover? Rows: primary stakeholders (requirement providers): passengers, passengers with reduced mobility; certification authority (DoD list): FAA; executive sponsor (funding): investors; indirectly affected: communities, insurers, accessibility advocates; indirectly affected (interfacing business): vertiport operators; directly impacted employees: pilots and remote operators, maintenance technicians; decision makers: city planning authority. A line reads: snowballing (course name for MITRE’s advice): ask interviewees for further names.',
          },
          body: [],
          sources: [R('R92', '326'), R('R11', '552'), R('R65', '322'), R('R63', '235'), R('R99', '51–52')],
          notes: {
            teach: [
              'Method 2, from the context (an instructor method built on the immediate environment, R92 p.326, and Table 1’s “owners of external systems,” R11 p.552): for every external system, ask which organization runs it. That organization is a stakeholder; a natural system has none.',
              'Walk the left half. Four systems have owners in the register; weather has none; the public transport network has an operator who is not registered. Ask: should it be? It carries passengers onward when flights stop (SCN-005).',
              'Method 3, role classes. MITRE’s roles (R65 p.322): the executive sponsor; primary stakeholders who provide requirements; stakeholders affected indirectly; subject matter experts; those kept in the loop. For a change, MITRE adds decision makers, sponsors, directly impacted employees and the “customers” of the change (R63 p.235).',
              'DoD’s partial list (R99 pp.51–52) adds end users, certification authorities, maintainers, trainers, and “enabled or enabling systems in the SoS.” Reconcile that item with slide 17: read it as shorthand for the programs and organizations that own and operate those systems; the system itself stays context.',
              'Snowballing, the course’s name for MITRE’s advice (R63 p.235): ask interviewees for further names and organizations, and seek out supporters, skeptics and rivals.',
              'Walk the right half: “indirectly affected” is what finds the insurers and the accessibility advocates, the two the sweep does not prompt.',
            ],
            why: 'Each method has blind spots. The context method is mechanical and complete for external systems; role classes catch parties with no interface and no life-cycle role.',
            figure: 'Left half top to bottom: system, arrow, organization. Stress the wording: the airspace is a system; the ANSP is the stakeholder behind it. Right half: read each role class and its matches, generated from the register. Classes with no AeroLink match (subject matter experts, those kept in the loop) are worth asking about.',
            examples: [
              'Aerospace, described generically: for an airport’s new baggage system, the context method finds the airlines and the security agency behind the interfaces; MITRE’s “kept in the loop” class finds the legal and insurance advisers; snowballing finds the baggage handlers’ union.',
            ],
            misconceptions: [
              {
                claim: 'The context diagram gives the full stakeholder list.',
                correction: 'It gives only the organizations behind external systems. Affected parties with no interface, such as communities, insurers and advocates, need the other methods.',
              },
            ],
            transition: 'One role class deserves its own slide, because it can stop the system outright: approving authorities.',
            timing: '4 min: 1.5 min Method 2, 2 min Method 3 and the DoD reconciliation, 30 s snowballing.',
          },
        },
        {
          id: 's1-approving-authorities',
          title: 'Approving authorities',
          purpose: 'Teach the non-obvious stakeholder class that can stop the system, and model an honest open classification (the ANSP).',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s1-approval-gates',
            caption: 'Approving authorities as gates on the way to operational use. The ANSP’s status is open (instructor to confirm).',
            alt: 'A box labeled AeroLink air-taxi service on the left and a box labeled operational use on the right, joined by an arrow that passes through three vertical gates. The first gate, FAA, aircraft and operation, is solid, labeled STK-002 approves. The second, city planning, vertiport sites, is solid, labeled STK-013 approves. The third, ANSP, airspace access: approval?, is dashed, labeled STK-007 to confirm. A note says approving authorities certify, qualify and approve the system for use, and the customer is not the only one.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['They formally **certify, qualify and approve** the system for use', 'Not only the customer; inside or outside the organization', 'AeroLink: FAA (STK-002), city planning (STK-013); ANSP: *to confirm*'],
            },
          ],
          sources: [R('R11', '553')],
          notes: {
            teach: [
              'SEBoK (R11 p.553) calls determining the approving authorities “a key part of stakeholder identification.” In short: they are the parties who must formally sign the system off for use by its intended users. Do not assume the customer is the only one; there can be approving authorities both inside and outside the organization, especially for highly regulated systems.',
              'Apply to AeroLink (FICTIONAL roles, no real regulatory facts): the FAA approves the aircraft and the operation; the city planning authority approves vertiport sites.',
              'Open the debate: the ANSP controls airspace access but does not certify the system. Approving authority or constraint holder? The case classifies it as an authority that does not approve (proposed). Take two arguments, then state the instructor’s decision.',
            ],
            why: 'A register without its approving authorities is the most consequential gap a team can have: the system may be built and then not allowed to operate.',
            figure: 'Follow the arrow and stop at each gate: two solid gates must be passed; the dashed gate is the open question. The gates are a metaphor for formal approvals, not a claim about real regulatory sequence.',
            examples: [
              'Enterprise, described generically: a hospital’s new device needs approval from internal clinical-engineering and infection-control committees as well as external clearance; the committees are approving authorities inside the organization.',
            ],
            misconceptions: [
              {
                claim: 'The customer who signs the contract is the only approving authority.',
                correction: 'SEBoK says this cannot be assumed (R11 p.553).',
              },
            ],
            transition: 'Once found, stakeholders must be classified: a list is not yet an analytic instrument.',
            timing: '2 min: 1 min source and AeroLink, 1 min ANSP debate.',
          },
        },
        {
          id: 's1-classifying',
          title: 'Classifying stakeholders: what the register records',
          purpose: 'Turn a list into an analytic instrument: the register fields, MITRE’s influence-and-support map, and the course-convention influence × interest grid.',
          minutes: 3,
          layout: 'figure',
          figure: {
            id: 'w1s1-influence-maps',
            caption: `Left: MITRE’s idea of mapping influence against support (schematic). Right: the course-convention interest × influence grid with AeroLink’s ${N_STK} register entries.`,
            alt: 'Two panels. The left panel, MITRE: influence over change by level of support, has influence (low, medium, high) on the vertical axis and level of support (awareness, understanding, buy-in, commitment) on the horizontal axis. A high-influence group at understanding has an arrow to a dashed ring at commitment, labeled move toward commitment; a medium-influence group at awareness has an arrow to buy-in; a low-influence group sits at buy-in. A legend marks current and required positions of schematic groups. The right panel, course convention: interest by influence for AeroLink, plots stakeholder numbers on a 1 to 5 grid with dashed lines at 3.5: 2, 3 and 7 at interest 4, influence 5; 13 at 3, 5; 4 and 11 at 4, 4; 5 at 5, 4; 10 and 12 at 3, 4; 1 and 8 at 5, 3; 6 at 3, 3; 9 at 4, 2; 14 at 3, 2; 15 at 5, 2.',
          },
          body: [{ kind: 'bullets', items: ['Every rating carries a **reason**. MITRE: “High influencers must be committed advocates.”'] }],
          sources: [R('R11', '553'), R('R10', '545'), R('R63', '234, 236–237')],
          notes: {
            teach: [
              'SEBoK (R11 p.553): record stakeholders in a register with key information on how each is involved with the system of interest, and re-evaluate it periodically. BMA adds a ranking (R10 p.545).',
              'Course register fields (course convention): a role group (one of six), the life-cycle stage of main involvement, internal or external, approving authority yes or no, concerns, and interest and influence from 1 to 5, each with a reason.',
              'MITRE (R63 pp.236–237): stakeholder maps display each group’s influence and support; high-influence stakeholders must be moved toward commitment, because “high influencers must be committed advocates.”',
              'Be explicit: the classic power/interest grid is not in the collection, so the plot on the right is a course convention. Read two points: the FAA, investors and ANSP (2, 3, 7) are high on both axes; the technicians (9) have high interest and low influence, which is why their concern needs an advocate.',
              sayWhy('classification'),
            ],
            why: 'Classification lets a team decide whom to engage first and how. Requiring a reason for every rating is the course’s defense against arbitrary numbers.',
            figure: 'Left panel: the axes, then the arrows; MITRE’s point is the gap between current and required support, which matters most for high-influence groups. The groups are schematic. Right panel: the 1–5 scales and the dashed lines at 3.5 (course convention); numbers are STK identifiers.',
            examples: [
              'AeroLink reasons (FICTIONAL): STK-013 city planning, influence 5, because it grants or blocks sites; STK-015 passengers with reduced mobility, influence 2, because individually they have little leverage, which accessibility expectations and their advocates amplify.',
            ],
            misconceptions: [
              {
                claim: 'A stakeholder with low influence can be dropped.',
                correction: 'Influence measures leverage, not legitimacy; SEBoK requires all relevant stakeholders to be identified and included (R11 p.552).',
              },
              {
                claim: 'The power/interest grid is a standard SE tool from the readings.',
                correction: 'It is not in the collection; MITRE’s sourced map is influence against support (R63 pp.236–237).',
              },
            ],
            transition: 'We now have three methods and a way to record what they find. Back to the driving question.',
            timing: '3 min: 1 min register fields, 45 s MITRE map, 45 s the grid, 30 s why and what it feeds.',
          },
        },
        {
          id: 's1-answer',
          title: 'Answering the driving question',
          subtitle: 'Answer C: add other kinds of party',
          purpose: 'Close the loop opened on slide 2 and consolidate the three methods by comparing what each finds, with student input.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s1-method-venn',
            caption: `Which identification method finds which AeroLink stakeholder, by the instructor’s counting rules (FICTIONAL). The full table is in the lesson.`,
            alt: `Three count tiles: M1 sweep, ${count('m1')} of ${N_STK}; M2 context, ${count('m2')} of ${N_STK}; M3 role class, ${count('m3')} of ${N_STK}. Below, regions: sweep and role class (eight): passengers, FAA, investors, communities, pilots and remote operators, maintenance technicians, city planning authority, passengers with reduced mobility; sweep and context (four): emergency responders, ANSP, electric utility, aircraft manufacturer; all three methods (one): vertiport operators; role class only (two), highlighted: insurers, accessibility advocates. A note: sweep only, context only, context and role class: none. Stars mark the original three-party list: passengers, investors, aircraft manufacturer.`,
          },
          body: [
            {
              kind: 'bullets',
              items: [
                `Three methods find ${N_STK}, against the original 3`,
                'Missed: both approving authorities, the affected public, operators, owners of external systems',
                `Found by one method only: ${SINGLE.map((id) => nameOf(id).toLowerCase()).join(' and ')}`,
              ],
            },
          ],
          sources: [R('R11', '552'), R('R65', '322'), R('R63', '235')],
          notes: {
            teach: [
              `Return to the vote on slide 2 and reveal the answer: C, add other kinds of party. The three methods together find ${N_STK} register entries against the original 3.`,
              'Before showing the figure, ask: which method do you expect to find the most, and which stakeholders only one method finds? Take two predictions.',
              `State the counting rules so students can check them (instructor’s analysis): M1 if a Table 1 prompt surfaces the stakeholder (R11 p.552); M2 if it owns an external system or an element of the wider system of interest; M3 if it clearly matches a MITRE role or group (R65 p.322; R63 p.235) or the DoD list. On those rules the sweep finds ${count('m1')}, the context ${count('m2')} and role classes ${count('m3')}.`,
              `Draw the findings: the sweep finds the most, consistent with SEBoK’s description of the life-cycle concepts as “a thorough source for stakeholder identification”; the ${numberWord(SINGLE.length)} found by one method only are the ones a team is most likely to miss; agreement across methods raises confidence.`,
              'Name what the original list missed, by kind: both approving authorities; the affected public; the operators and maintainers; the owners of enabling and external systems; the insurers.',
            ],
            why: 'Closing the opening question consolidates the session and shows the value of using more than one method. Explicit counting rules model the habit of making an analysis checkable.',
            figure: 'Read the three tiles, then the regions, ending on the highlighted one: found by role class only. Point at the stars: two of the three original stakeholders sit in the largest region, which is why a list that looks reasonable can still miss whole kinds of party.',
            examples: [
              'Students run the same comparison on their own enterprise in the lab: any stakeholder found by one method only deserves a second look, and a register with no approving authority is a defect.',
              'Enterprise, described generically: in the helicopter-pad analogue, the sweep finds the aviation regulator and the maintenance contractor, the context finds the air-ambulance operator and the fire service, and only the “who is affected?” question finds the neighbors’ association.',
            ],
            misconceptions: [
              {
                claim: 'One good method is enough if applied carefully.',
                correction: 'Each method has blind spots: here the sweep misses the insurers and advocates, the context misses everyone without an interface.',
              },
              {
                claim: 'More stakeholders is always better.',
                correction: 'The goal is all relevant stakeholders (R11 p.552), each with a reason for being in the register.',
              },
            ],
            transition: 'Before you leave: one minute of retrieval, the team roster, and what to bring to Session 2.',
            timing: '4 min: 30 s reveal, 1 min predictions, 1.5 min rules and figure, 1 min what was missed.',
          },
        },
      ],
    },
    // ============================================================================================ F. exit (3 min)
    {
      id: 's1-exit',
      title: 'Exit',
      slides: [
        {
          id: 's1-exit-ticket',
          title: 'Exit: retrieval, roster, preparation',
          purpose: 'Retrieval practice on the session’s central method, then the hand-off to Session 2.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s1-exit-prep',
            caption: 'The one-minute paper now, the preparation before Session 2, and what happens in Session 2.',
            alt: 'Four numbered steps in a column. 1, now, one minute: one-minute paper, a stakeholder of your enterprise found by one method only, and which. 2, before Session 2: bring one candidate enterprise, name, purpose, first guess at its system of interest. 3, before Session 2: read SEBoK, Stakeholder Needs Definition, R11 pages 549 to 555, about 20 minutes in all. 4, Session 2: sit with your team; charter, pitch and lead candidate in the laboratory launch.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['**One-minute paper:** a stakeholder of your *own* candidate enterprise found by only one of your methods, and which method', 'Team roster: sit with your team in Session 2'],
            },
          ],
          sources: [R('R11', '549–555')],
          notes: {
            teach: [
              'Run the one-minute paper on cards or the LMS form. Students apply at least two methods in their heads to their candidate enterprise and name a stakeholder only one of them finds. Collect the cards; open Session 2 with two good answers and one common error.',
              'Announce the team roster and the rule for forming teams this term (instructor-assigned or self-selected, as the faculty decides).',
              'Give the preparation: one candidate enterprise per member (name, purpose, first guess at the system of interest) and SEBoK’s Stakeholder Needs Definition article (R11 pp.549–555), about 20 minutes.',
            ],
            why: 'Retrieval at the end of a session strengthens memory of the central method more than a summary would, and the question forces students to compare methods rather than recite one.',
            figure: 'Read the four steps top to bottom; the first is now.',
            examples: [
              'A good answer for a campus shuttle service: “the company that recycles the shuttle batteries: only the sweep finds it, through Table 1’s ‘waste management’ at disposal.” Another: “the campus disability-services office: only the role-class question ‘who is indirectly affected?’ finds it.”',
              'A common weak answer: “the riders.” Every method finds them; the prompt asks for a single-method stakeholder.',
              'A tempting wrong answer: “the trainers who certify new drivers, found only by the sweep.” DoD’s role list names trainers, so the role-class method finds them too.',
            ],
            misconceptions: [
              {
                claim: 'The candidate enterprise must be final by Session 2.',
                correction: 'It is a candidate. The team chooses its lead candidate in Session 2, and the instructor approves it, with conditions if needed.',
              },
            ],
            transition: 'End of Session 1. Session 2 opens with a retrieval warm-up on today’s methods.',
            timing: '3 min: 1 min one-minute paper, 1 min roster, 1 min preparation.',
          },
        },
        {
          id: 's1-references',
          title: 'References and credits',
          purpose: 'Give the full reference list of every source cited in the session, and the license and use statements those sources require (generated from the citations).',
          minutes: 0,
          layout: 'references',
          body: [],
          sources: [],
          notes: {
            teach: ['Leave this slide up while students write the one-minute paper; no commentary is needed. The list is generated from every citation in the session, and the credits include the attribution SEBoK requires for its text.'],
            why: 'Students should be able to find every source the session relied on, and SEBoK’s license requires the attribution statement wherever its text is used.',
            transition: 'End of the deck.',
            timing: '0 min: shown during the exit activity.',
          },
        },
      ],
    },
  ],

  // ============================================================================================== student lesson
  studentLesson: [
    {
      id: 's1-lesson-why',
      title: 'Why Week 1 matters',
      blocks: [
        {
          kind: 'para',
          text: 'Week 1 carries the scheduled subject *Team Formation / Needs / Identifying Stakeholders*. It looks like a starting week, but it produces engineering data the rest of the course depends on. By the end of the week each team has a **Week 1 Team Record** for its own enterprise: five engineering outputs (a team charter; an instructor-approved enterprise proposal with a problem statement, a mission and the system of interest inside the enterprise; a context; a stakeholder register with relationships; and an initial set of stakeholder needs) plus a statement of how AI tools were used.',
        },
        { kind: 'figure', figure: { id: 'week-path', caption: 'The path of Week 1: the engineering outputs of the Week 1 Team Record, which later feed Week 2 and the Week 8 model. The record also carries an AI-use statement.', alt: 'Five boxes in a row joined by arrows: team charter, enterprise proposal, boundary and context, stakeholder register, initial needs. A bracket underneath reads Week 1 Team Record (your own enterprise). Two dashed boxes to the right read Week 2 and Week 8, labeled requirements and SysML v2 model.' } },
        {
          kind: 'para',
          text: 'The course has two phases. In Phase I (Weeks 1–7) each team builds a document-based Systems Thinking Engineering Package. In Phase II (Weeks 8–14) the same team rebuilds that package as a SysML v2 model. Week 8 models the stakeholders and concerns recorded this week, and Week 9 models needs and requirements. The identifiers you assign now (STK for stakeholders, CON for concerns, NEED for needs) are therefore keys that later model elements point back to. An identifier that changes meaning between weeks breaks every trace that uses it.',
        },
        { kind: 'figure', slide: 's1-course-architecture' },
        {
          kind: 'para',
          text: 'Every method in the course is first demonstrated on **AeroLink Urban Mobility**, a fictional company that runs electric vertical-take-off-and-landing air taxis between six vertiports in one metropolitan region. Every number about it (12 aircraft of 4 seats, 2 chargers per vertiport, a 16-hour operating day, a typical 25 km trip at 150 km/h, a 20-minute charge to the dispatch threshold) is a teaching value. Your team then applies each method to its own enterprise, which the instructor approves in Session 2. A suitable enterprise, by course convention, has several interacting parts, people as well as technology, exchanges across its boundary, stakeholders whose needs differ, and enough substance to be modeled in Phase II. AeroLink, or a near copy of it, is not available to teams.',
        },
        { kind: 'figure', slide: 's1-meet-aerolink' },
        {
          kind: 'para',
          text: 'Each method this week protects against a specific failure and hands something to Week 2 or to the Week 8 model; the table “Why each method, and what it feeds” in the Session 2 lesson gives both for every method, with its source.',
        },
      ],
      sources: [],
    },
    {
      id: 's1-lesson-system',
      title: 'What a system is, and why purpose matters',
      blocks: [
        {
          kind: 'para',
          text: 'The *Guide to the Systems Engineering Body of Knowledge* (SEBoK) opens its overview with a definition of the discipline and of success. Systems engineering is “a transdisciplinary approach and means to enable the realization of successful systems,” and “successful systems must satisfy the needs of their customers, users and other stakeholders” (R01 p.51). The phrase *and other stakeholders* is the reason this week exists: if success is defined by the needs of all stakeholders, a stakeholder who is never identified is a guaranteed source of failure.',
        },
        {
          kind: 'para',
          text: 'SEBoK also reports fifteen principles developed by INCOSE’s SEPAT, peer reviewed by several professional societies and described by SEBoK as first steps toward consensus (R91 p.130). Three frame Week 1. Principle 1 says that systems engineering in application is specific to stakeholder needs, the solution space and the context throughout the life cycle. Principle 2 says it takes a holistic view that includes the system elements, the enabling systems and the system environment. Principle 7 says it addresses stakeholder needs that change over the life cycle.',
        },
        { kind: 'heading', text: 'Three definitions of “system”' },
        {
          kind: 'para',
          text: 'The SEBoK glossary records three definitions of *system* (R38 p.1637), and they are not interchangeable. The first, from systems science (von Bertalanffy), applies to natural, social and technical systems alike. The second, from ISO/IEC/IEEE 15288:2015 in a form SEBoK describes as expanded, is the one SEBoK calls the recognized definition for systems engineers; it is restricted to engineered systems created with a purpose that provides value to one or more beneficiaries. The third, from the INCOSE Fellows (2019), stresses emergence: behavior or meaning that the parts do not have alone.',
        },
        definitionsTable,
        {
          kind: 'para',
          text: 'This course adopts the second definition deliberately. It builds *purpose* into what a system is, and purpose implies beneficiaries, who are stakeholders. It also admits people, information, techniques, facilities and services as elements alongside hardware and software (R38 p.1637). A service such as the AeroLink air-taxi service is therefore a system in the full sense, and its pilots and procedures are elements of it, not merely users of it.',
        },
        { kind: 'heading', text: 'An engineered system lives in a context' },
        {
          kind: 'para',
          text: 'SEBoK then narrows from a system to an *engineered system*: “a technical or socio-technical system which is the subject of an SE life cycle,” designed or adapted to interact with an anticipated operational environment to achieve intended purposes under constraints (R01 p.51). An engineered system is never studied alone: SEBoK calls it “the single most important principle of the systems approach” that the approach is applied to an engineered system context and not just to a single system, and it recognizes four context types (R92 p.326). A key difference between the types is how and when the boundary of the system of interest is drawn. For this course, the system of interest is the air-taxi service, a service system, studied inside the AeroLink enterprise.',
        },
        contextTypesTable,
      ],
      sources: [R('R01', '51'), R('R91', '130'), R('R38', '1637'), R('R92', '326')],
    },
    {
      id: 's1-lesson-soi',
      title: 'System of interest, enabling systems and the enterprise',
      blocks: [
        {
          kind: 'para',
          text: 'The *system of interest* has two glossary definitions (R39b p.1652). The systems-engineering one is “the system whose life cycle is under consideration”; the systems-science one is “the system of interest to an observer.” SEBoK adds that a system of interest may include both operational and enabling systems. An *enabling system* complements the system of interest during its life-cycle stages but does not necessarily contribute directly to its function in operation (R39c p.1493, paraphrased). SEBoK’s examples are maintenance and support systems, test, installation and training systems, and even project teams and information resources.',
        },
        { kind: 'figure', slide: 's1-soi-enabling' },
        {
          kind: 'para',
          text: 'The distinction matters for stakeholders because every enabling system has owners and operators. A team that lists only the operational system (for AeroLink, the aircraft, the pads and chargers, the operations center and the communications) will miss the people who run the maintenance facility, the training system and the test rig that commissions new chargers. Whether a given enabling system lies inside the boundary is a modeling decision the team must state.',
        },
        { kind: 'heading', text: 'The enterprise is not the organization' },
        {
          kind: 'para',
          text: 'Each team proposes an *enterprise*, so the term must be exact. SEBoK’s preferred definition is “one or more organizations sharing a definite mission, goals, and objectives to offer an output such as a product or service” (R39d p.1497); it is preferred because it focuses on purpose rather than structure. The Enterprise Systems Engineering knowledge area describes an enterprise as a purposeful combination of interdependent resources (people, processes, organizations, supporting technologies and funding) that interact with each other and with their environment to achieve business and operational goals (R07 p.815). It warns that treating an enterprise as an organization is “a frequent misuse”: an enterprise also includes people, knowledge and other assets, and some enterprises contain no readily identifiable organization at all (R07 p.815). Beyond the enterprise lies the *extended enterprise*: upstream suppliers, downstream consumers and end-user organizations, and perhaps “sidestream” partners and key stakeholders (R07 p.816).',
        },
        { kind: 'figure', slide: 's1-enterprise' },
        {
          kind: 'para',
          text: 'For AeroLink, the company AeroLink Urban Mobility is one organization inside the AeroLink enterprise (ENT-001), alongside its partners: the independent vertiport operators, the electric utility, the aircraft manufacturer and the investors. The insurers, who supply insurance without sharing the mission, sit in the extended enterprise. The system of interest, the AeroLink air-taxi service (SOI-001), spans more than one organization, because the pads and chargers it uses belong to the vertiport operators. Your proposal therefore answers two questions in order: what is the enterprise (its mission and its participants), and which system of interest inside it will the team study? The two get different identifiers.',
        },
      ],
      sources: [R('R39b', '1652'), R('R39c', '1493'), R('R39d', '1497'), R('R07', '815–816')],
    },
    {
      id: 's1-lesson-boundary',
      title: 'Boundary, environment and context',
      blocks: [
        {
          kind: 'para',
          text: 'A system of interest is chosen *for a question*. Consider “Will adding aircraft reduce average passenger waiting time?” and three candidate boundaries for AeroLink. A boundary around the aircraft cannot answer it, because waiting time is not a property of an aircraft. A boundary around flight operations can count flights, but if charger and pad turnaround is the real limit it will predict that more aircraft always help: the cause of waiting lies outside it. A boundary around the air-taxi service (fleet, operations center, booking and dispatch, the vertiport pads and chargers, and passenger demand) contains the feedback between demand, the charging queue and waiting time, and is still small enough to analyze. SEBoK puts the general point this way: observers allocate boundaries that reflect their own needs, so several systems of interest can be identified in one situation, and each must include a set of elements that represents a system whole (R02 p.264).',
        },
        { kind: 'figure', slide: 's1-three-scopes' },
        { kind: 'heading', text: 'The vocabulary' },
        {
          kind: 'para',
          text: 'A *system boundary* is “a distinction made by an observer which marks the difference between an entity he takes to be a system and its environment” (R39i p.1639, after Checkland). It is drawn, not found. SEBoK’s boundary principle adds what a good boundary does: it concentrates interactions inside the system while allowing exchange with external systems (R04 p.274). The *environment* has two definitions (R39e p.1501): anything affecting, or affected by, a subject system through interactions with it; and, for engineered systems, the surroundings in which the system of interest is utilized and supported, or developed, produced or retired. SEBoK notes that the second definition distinguishes the different environments that exist during the life of a system. A *system context* describes the system relationships and environment “resolved around a selected system-of-interest,” and the context diagram is its most common expression (R39j p.1641). Finally, SEBoK calls the act of focusing complex relationships on a chosen boundary *systemic resolution*, and adds that systems thinking requires an ongoing process of attention and adaptation to ensure that boundaries, dependencies and relationships are appropriately identified (R02 p.264).',
        },
        {
          kind: 'figure',
          figure: {
            id: 'w1s1-boundary-anatomy',
            caption: 'Anatomy of a boundary: dense interactions inside, sparse exchanges across it, and different environments across the life cycle.',
            alt: 'A dashed ellipse, the boundary, encloses five densely linked elements. A label says the boundary is a distinction an observer makes. Three boxes outside, each an external system, are joined to elements inside by arrows that cross the boundary, labeled exchanges cross it; one arrow points inward only. The ellipse sits in a shaded region labeled operational environment, which sits in a fainter outer region labeled other environments: development, production, retirement. A caption under the ellipse reads interactions concentrated inside.',
          },
        },
        {
          kind: 'para',
          text: 'AeroLink’s environments differ by stage: airspace, weather and grid in operation; factories in production; battery recycling in retirement. Each brings different stakeholders.',
        },
        { kind: 'heading', text: 'Four layers of a context' },
        {
          kind: 'para',
          text: 'SEBoK structures a context in four layers, after Flood and Carson (R92 p.326). The *narrower system of interest* is the system of direct concern, scoped by authority or control. The *wider system of interest* contains all the elements needed to understand the system’s behavior, including some the observer has no authority over. The *immediate environment* holds the engineered, natural and social systems that exchange material, energy or information directly with the wider system of interest. The *wider environment* has no direct interaction but may influence decisions during the life cycle. The boundary depends on “what can be changed and what must remain fixed”, and the system of interest always includes the narrower system of interest but may also include the wider one, as when considering a service or an enterprise (R92 p.327).',
        },
        { kind: 'figure', slide: 's1-context-structure' },
        {
          kind: 'para',
          text: `For AeroLink, the narrower system of interest is what AeroLink controls: the fleet, the operations center, and booking and dispatch. The wider system of interest adds the independent vertiport operators’ pads and chargers and the passenger demand the service depends on but does not control. AeroLink’s system of interest, SOI-001, is drawn at this wider level, which SEBoK permits for a service. The immediate environment holds six external systems, each named as a system: ${EXTERNAL_SYSTEMS.map((e) => `${e.short.toLowerCase()} (${e.id})`).join(', ')}. The organization behind each is recorded separately, as a stakeholder (Method 2 below). The regional economy, public opinion and national aviation policy form the wider environment.`,
        },
        {
          kind: 'para',
          text: 'Boundaries are never neutral. SEBoK reports that Churchman and other critical systems thinkers treat the relative power and responsibility of the participants as key factors in defining problem boundaries (R02 p.264). MITRE turns this into four questions for the engineer: What is my enterprise? Which elements of it do I control? Which do I influence? Which elements of my environment influence me although I neither control nor influence them (R50 p.48)? A boundary drawn too tightly hides the people who own your constraints; for AeroLink, the vertiport operators and the utility.',
        },
        { kind: 'figure', slide: 's1-boundary-decision' },
      ],
      sources: [R('R02', '264'), R('R50', '46–48'), R('R39i', '1639'), R('R04', '274'), R('R39e', '1501'), R('R39j', '1641'), R('R92', '326–327')],
    },
    {
      id: 's1-lesson-lifecycle',
      title: 'Life cycle and the ISO/IEC/IEEE 15288 process frame',
      blocks: [
        {
          kind: 'para',
          text: 'A *life cycle* is “the evolution of a system, product, service, project or other human-made entity from conception through retirement” (R39f p.1550). SEBoK’s Life Cycle Stages article names six typical stages, each with primary goals (R06b p.384): Concept (identify stakeholders’ needs, explore concepts, propose viable solutions); Development; Production; Utilization; Support; and Retirement. Movement between stages passes a decision point with entry and exit criteria. Two clarifications prevent a common misreading: some life-cycle models permit iteration and concurrency of stages, and a system of interest can be in several stages at the same time (R06b p.384).',
        },
        { kind: 'figure', slide: 's1-life-cycle-stages' },
        {
          kind: 'para',
          text: 'SEBoK’s stakeholder table uses a second vocabulary (R11 p.552): concept; development; production, integration, verification and validation; logistics and maintenance; operation; and disposal. In the instructor’s mapping, production corresponds to production, integration and V&V; utilization to operation; support to logistics and maintenance; and retirement to disposal. Week 1 works in the Concept stage, but its stakeholder search must look across all of them.',
        },
        { kind: 'heading', text: 'The process frame' },
        {
          kind: 'para',
          text: 'ISO/IEC/IEEE 15288:2015 defines fourteen technical processes, which SEBoK lists in its inclusive-engineering table (R98 pp.1001–1002): Business or Mission Analysis; Stakeholder Needs and Requirements Definition; System Requirements Definition; Architecture Definition; Design Definition; System Analysis; Implementation; Integration; Verification; Transition; Validation; Operations; Maintenance; and Disposal. Week 1 covers the first two, and Week 2 begins the third. SEBoK groups the first two as *Concept Definition*, in which decision makers and key stakeholders describe what a solution should accomplish and why it is needed: “Both why and what need to be answered before consideration is given to how” (R94 p.540).',
        },
        { kind: 'figure', slide: 's1-15288-processes' },
        {
          kind: 'para',
          text: 'The second process carries different names in the sources. The SEBoK article calls it Stakeholder Needs Definition and notes that it is frequently called the “Stakeholder Needs and Requirements” process (R11 pp.549, 551). The 15288:2015 list, as SEBoK reproduces it, says Stakeholder Needs and Requirements Definition (R98 p.1001). The DoD Systems Engineering Guidebook describes a Stakeholder Requirements Definition process, one of its eight technical processes, that translates stakeholder capability needs into technical requirements (R48a p.141). SEBoK deliberately focuses on an integrated set of stakeholder *needs* to avoid the confusion that arises when expectations, needs and requirements are treated as the same (R11 p.551). The 2023 edition of 15288 is not in the course collection (SEBoK quotes only fragments of it, R39a p.1632), so its exact process naming is not verified here.',
        },
        { kind: 'heading', text: 'What Business or Mission Analysis hands over' },
        {
          kind: 'para',
          text: 'Business or Mission Analysis (BMA) is the first Concept Definition process. Its purpose is to understand a mission or market problem, threat or opportunity, and to establish the goals, objectives and measures of success of a potential solution class (R10 p.543). Its outputs include the major stakeholders, the problem or opportunity statement, the mission, goals and objectives with their measures, the preliminary life-cycle concepts and the preferred solution classes (R10 p.544). Initial stakeholder identification happens here, recorded in a stakeholder register with a ranking, and the list is expanded during Stakeholder Needs Definition (R10 p.545). BMA also warns that business and user perspectives can produce different, even conflicting, goals and measures that must be prioritized against the enterprise strategy (R10 p.546). The two processes are often performed iteratively (R11 p.549).',
        },
        { kind: 'figure', slide: 's1-bma-feeds-snd' },
        {
          kind: 'para',
          text: `Stakeholder Needs Definition then takes these inputs and performs six activities (R11 p.552), ending with the integrated set of needs, which SEBoK expects to reflect the mission, goals and measures (R11 p.554). AeroLink’s anchor is a fictional problem statement and the mission MGO-001 (${MISSION_GOALS[0].name.toLowerCase()}); every AeroLink need traces to the mission or a goal, and your proposal states your own problem and mission in one sentence each.`,
        },
      ],
      sources: [R('R39f', '1550'), R('R06b', '384'), R('R11', '549–552, 554'), R('R98', '1001–1002'), R('R94', '540'), R('R48a', '141'), R('R10', '543–546')],
    },
    {
      id: 's1-lesson-teams',
      title: 'Systems engineering teams',
      blocks: [
        {
          kind: 'para',
          text: 'Processes are performed by people, and SEBoK treats the team as a subject in its own right. Its glossary describes a *team* as a group whose members bring complementary skills, depend on each other, share responsibility for managing themselves, answer for their collective performance and work toward a common goal (R39k p.1662, paraphrased). A systems engineering team is “a group of individuals who cooperatively perform a collection of SE tasks based on a shared vision and a common set of engineering objectives” (R97 p.994).',
        },
        { kind: 'definition', term: 'Integrated product team (DoD)', text: '“a multidisciplinary group of representatives who are collectively responsible for delivering a defined product or process”', source: R('R99', '52') },
        {
          kind: 'para',
          text: 'DoD adds that an effective SE organization is typically structured as one or more integrated product teams (IPTs), and that a smaller program may be organized as a single IPT (R99 p.52). In product systems engineering, an IPT is cross-functional and typically includes representatives of all the relevant stakeholders (R95 p.761). In product-centered organizations, an IPT is assigned to each element of the system breakdown structure; a top-level team, commonly called the systems engineering and integration team (SEIT), oversees them; and analysis and integration teams (AITs) of specialists such as safety and reliability engineers work across every element at a given level (R96 pp.987–988). Each course team is the simplest case: one IPT for one enterprise.',
        },
        { kind: 'figure', slide: 's1-team-ipt' },
        { kind: 'heading', text: 'Roles and communication' },
        {
          kind: 'para',
          text: 'SEBoK describes two ways to organize an SE team: by job specialization, with each member in a different role (requirements, architecture, integration, verification and validation) coordinated by a lead; or by subsystem, with each member covering all functions for one part (R96 p.986). The course uses the specialization pattern with four lead roles, a course convention taken from the course syllabus: Requirements & Compliance, Architecture, AI & Data Management, and Verification & Validation. In a three-person team, AI & Data Management merges with Architecture (instructor’s rule, not in the syllabus).',
        },
        { kind: 'equation', display: 'P = N(N − 1) ÷ 2', speech: 'P equals N times N minus one, divided by two', where: [{ symbol: 'N', meaning: 'number of team members' }, { symbol: 'P', meaning: 'communication paths among them' }] },
        {
          kind: 'para',
          text: 'Team size has a quantitative consequence. Among N engineers there are N(N − 1)/2 communication paths, the number of links in a fully connected graph (R96 p.988, after Brooks). A team of four has 4 × 3 ÷ 2 = 6 paths; SEBoK’s examples give 10 paths for 5 people, 21 for 7 and 36 for 9, and it recommends that a team of more than 10 (45 paths) be organized hierarchically. A course team of three or four has three to six paths and can work without a hierarchy. One caution: SEBoK grounds this advice in the “well-known 7 ± 2 rule”, which comes from research on short-term memory span rather than on team size; treat it as a rule of thumb, not a law (instructor’s caution). SEBoK’s final staffing step is to ask stakeholders “What are we missing?” (R96 p.989).',
        },
        { kind: 'figure', slide: 's1-team-roles-paths' },
        { kind: 'heading', text: 'The charter' },
        {
          kind: 'para',
          text: 'SEBoK states simply that “the team should have a charter” (R96 p.986). Group structure shows itself in roles and *norms*, the formal and informal rules that govern the actions of group members (R97 p.995). Tuckman described groups as forming, storming, norming and performing, with adjourning added later; SEBoK notes that although the model is sequential, others (Forsyth) have observed that groups may “recursively and iteratively” progress through the stages (R97 p.995), so read the stages as a description of what tends to happen, not a timetable. Among SEBoK’s indicators of a cohesive team are a “clear understanding of systems engineering roles and responsibilities” and “shared ownership of systems engineering work products” (R96 p.990, after Fairley).',
        },
        { kind: 'figure', slide: 's1-team-charter' },
        {
          kind: 'para',
          text: 'The course charter has four fields: lead roles, decision rules, communication norms and owned identifier prefixes. The collection prescribes no particular decision rule, so the example rule (the lead proposes; consensus within one working day; then a majority vote; a tie goes to the instructor) and the prefix ownership are course conventions: Requirements & Compliance owns STK, CON and NEED; Architecture owns ENT (the enterprise), PRT (the elements inside the boundary of the system of interest, each of which becomes a part of the system in Week 8) and EXT (external systems), and in Session 2 usually takes REL (relationships). A charter with a tie-break rule removes the most common deadlock in a four-person team before it happens.',
        },
      ],
      sources: [R('R39k', '1662'), R('R97', '994–995'), R('R99', '52'), R('R95', '761'), R('R96', '986–990')],
    },
    {
      id: 's1-lesson-stakeholders',
      title: 'Who counts as a stakeholder, and how to find them all',
      blocks: [
        {
          kind: 'para',
          text: 'The SEBoK glossary records four definitions of *stakeholder* (R39a p.1631). ISO/IEC/IEEE 15288:2015 speaks of an individual or organization “having a right, share, claim, or interest in a system or in its possession of characteristics that meet their needs and expectations.” A 2010 draft of ISO/IEC 29148 uses the same words and lists examples that include trainers, maintainers, disposers and regulatory bodies. ISO/IEC 26702:2007 widens the subject to “an individual, team, or organization (or classes thereof) with interests in, or concerns relative to, a system.” Freeman’s management definition (1984) covers any group or individual who can affect or is affected by the achievement of an organization’s objectives.',
        },
        { kind: 'figure', slide: 's1-stakeholder-definitions' },
        {
          kind: 'para',
          text: 'Three consequences follow. A stakeholder is a person, a team or an organization, or a class of them; AeroLink registers “passengers with reduced mobility” as a class with needs of its own. The weather and the electric grid are parts of the context, although the utility that runs the grid is a stakeholder. Having an interest, or being affected, is enough; one need not use, buy or build the system. And the 26702 definition introduces *concerns*, which Session 2 develops.',
        },
        {
          kind: 'para',
          text: 'Why find them all, and early? Stakeholders are “the primary source of needs and requirements,” and leaving out a relevant stakeholder often results in missing needs and a failure to pass system validation (R11 p.552). SEBoK’s inclusive-engineering guidance asks that Business or Mission Analysis identify both the obvious, beneficial stakeholders and the potentially affected “unwilling” ones, and that needs work capture unstated but necessary needs such as access, language and disability (R98 p.1001). MITRE observes that needs driven by a subset of the key stakeholders miss key capability needs (R53 p.297).',
        },
        { kind: 'figure', slide: 's1-why-stakeholders-first' },
        { kind: 'heading', text: 'Method 1: the life-cycle sweep' },
        {
          kind: 'para',
          text: 'Because a system of interest has many stakeholders over its life, SEBoK calls the life-cycle concepts “a thorough source for stakeholder identification” and gives a table of example stakeholders for each stage (R11 p.552). Walk every stage and ask who is involved, affected or responsible there. Read Table 1 carefully: its Concept row already lists sponsors, end users, operators, suppliers, regulators, the public, owners of enabling and external systems, and approving authorities, so most stakeholders surface at Concept, not at Operation.',
        },
        { kind: 'figure', slide: 's1-lifecycle-sweep' },
        {
          kind: 'para',
          text: `On AeroLink the sweep surfaces ${numberWord(count('m1'))} of the ${numberWord(N_STK)} register entries; all but the maintenance technicians surface at Concept, the communities through “public” because siting a vertiport is a Concept activity. The register separately records each stakeholder’s *stage of main involvement*: the communities’ is Concept, the passengers’ is Operation, the technicians’ is Logistics and maintenance. At disposal it raises a candidate not in the register, a battery recycler. The insurers and the accessibility advocates are not prompted by any stage.`,
        },
        { kind: 'heading', text: 'Method 2: from the context' },
        {
          kind: 'para',
          text: `For every external system in the immediate environment, ask which organization runs it. The air navigation service provider stands behind the ${extName('EXT-001').toLowerCase()}, the electric utility behind the ${extName('EXT-002').toLowerCase()}, the aircraft manufacturer behind the ${extName('EXT-004').toLowerCase()}, and the emergency responders behind the ${extName('EXT-006').toLowerCase()}. The weather has no owner, because it is a natural system. The public transport network has an operator who is not in the register; since that network carries passengers onward when flights are suspended, a team should ask whether it belongs there.`,
        },
        { kind: 'heading', text: 'Method 3: by role class' },
        {
          kind: 'para',
          text: 'MITRE lists stakeholder roles that cut across interfaces and stages: the executive sponsor; primary stakeholders who provide functional and performance requirements; stakeholders affected indirectly, such as interfacing businesses; subject matter experts; and those who must be kept in the loop (R65 p.322). For an organizational change it names decision makers, change sponsors and agents, directly impacted employees and contractors, and the “customers” of the change agents (R63 p.235). The DoD partial list adds end users, certification and accreditation authorities, maintainers and logisticians, trainers, and “enabled or enabling systems in the SoS” (R99 pp.51–52). That last item looks like a list of systems; read it as shorthand for the programs and organizations that own and operate those systems, because under the definitions above the system itself is context and its owner is the stakeholder (instructor’s reading). MITRE also recommends what this course calls *snowballing*: start from the sponsor’s list, ask interviewees for further names, and seek out supporters, skeptics and rivals (R63 p.235). On AeroLink, the role class “indirectly affected” is what finds the insurers and the accessibility advocates.',
        },
        { kind: 'figure', slide: 's1-context-and-roles' },
        { kind: 'heading', text: 'Approving authorities' },
        {
          kind: 'para',
          text: 'One role class can stop a system outright. SEBoK calls determining the approving authorities “a key part of stakeholder identification” (R11 p.553). They are the parties who must formally sign the system off before its intended users may use it. It cannot be assumed that the customer is the only one: there can be approving authorities both inside and outside the organization, especially for highly regulated systems. For AeroLink (fictional roles, no real regulatory facts), the FAA approves the aircraft and the operation, and the city planning authority approves vertiport sites. The air navigation service provider controls airspace access but does not certify the system; whether it counts as an approving authority is an open classification, to be decided by the instructor.',
        },
        { kind: 'figure', slide: 's1-approving-authorities' },
      ],
      sources: [R('R39a', '1631'), R('R11', '552–553'), R('R98', '1001'), R('R53', '297'), R('R65', '322'), R('R63', '235'), R('R99', '51–52')],
    },
    {
      id: 's1-lesson-classifying',
      title: 'Classifying stakeholders and checking the list',
      blocks: [
        {
          kind: 'para',
          text: 'A list becomes an analytic instrument when it is classified. SEBoK recommends a stakeholder register that records key information about each stakeholder and how they are involved with the system of interest, re-evaluated periodically (R11 p.553); Business or Mission Analysis adds a ranking (R10 p.545). The course register (course convention) records for each stakeholder: a role group (user or operator; customer, acquirer or funder; approving or regulatory authority; supplier or owner of an enabling or external system; maintainer or support; affected public), the life-cycle stage of main involvement, whether the stakeholder is internal or external, whether it is an approving authority, its concerns, and an interest and an influence rating from 1 to 5, each with a reason.',
        },
        {
          kind: 'para',
          text: 'MITRE defines stakeholder management as identifying stakeholder groups, the interests they represent, the power they possess, and whether they support or inhibit the change (R63 p.234). It recommends stakeholder maps that display each group’s influence over the change against its level of support, and concludes that actions must move high-influence stakeholders toward commitment: “high influencers must be committed advocates” (R63 pp.236–237). The familiar power/interest grid is not in the course collection; the interest × influence plot used in this course is a course convention, and every rating on it must carry a reason that a reviewer can challenge.',
        },
        { kind: 'figure', slide: 's1-classifying' },
        { kind: 'heading', text: 'Answering the driving question' },
        {
          kind: 'para',
          text: `The session opened with a proposal to write AeroLink’s needs from three stakeholders: passengers, investors and the aircraft manufacturer. The three methods together find ${numberWord(N_STK)}. The original list missed both approving authorities, the affected public (communities and accessibility advocates), the operators and maintainers, the owners of enabling and external systems, and the insurers. The answer is therefore C: add other kinds of party, not more users or customers.`,
        },
        {
          kind: 'para',
          text: `Which method finds which stakeholder can be made checkable with explicit rules. Count a stakeholder as found by the sweep if a Table 1 prompt surfaces it; by the context if it owns an external system or an element of the wider system of interest; and by role class if it clearly matches one of MITRE’s roles or groups or the DoD list. On those rules the sweep finds ${numberWord(count('m1'))} of ${numberWord(N_STK)}, the context ${numberWord(count('m2'))}, and role classes ${numberWord(count('m3'))}. ${SINGLE.map((id) => `The ${nameOf(id).toLowerCase()}`).join(' and ')} are found by one method only, and they are the ones a team is most likely to miss. Agreement across methods raises confidence; a stakeholder found by a single method deserves a second look.`,
        },
        coverageTable,
        { kind: 'figure', slide: 's1-answer' },
        { kind: 'heading', text: 'Check your understanding' },
        {
          kind: 'bullets',
          items: [
            'Which of SEBoK’s three definitions of *system* builds purpose into the concept, and why does that matter for stakeholder analysis?',
            'Give one enabling system for your own candidate enterprise and the stakeholder who owns it.',
            'State the rule SEBoK gives for choosing the boundary of the system of interest, and apply it to one external system of your enterprise. Name the system and, separately, the organization behind it.',
            'Which two 15288 technical processes does Week 1 cover, and what does the first hand to the second?',
            'Why can a team of four run without a hierarchy? Show the number, and say why the 7 ± 2 rule is only a rule of thumb.',
            'Apply two identification methods to your enterprise. Name one stakeholder found by only one of them, and which one; then name one that a list of customers and users would miss.',
          ],
        },
        {
          kind: 'callout',
          tone: 'note',
          title: 'Readings',
          text: 'Before Session 2: SEBoK, Stakeholder Needs Definition (R11 pp.549–555). Further: Business or Mission Analysis (R10 pp.543–546); MITRE, Stakeholder Assessment and Management (R63 pp.234–237); Engineered System Context (R92 pp.326–327); Team Capability (R96 pp.986–990).',
        },
      ],
      sources: [R('R11', '549–555'), R('R10', '543–546'), R('R63', '234–237'), R('R65', '322'), R('R92', '326–327'), R('R96', '986–990')],
    },
  ],
}
