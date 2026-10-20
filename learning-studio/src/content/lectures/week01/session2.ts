// Week 1, Session 2: Concerns, needs, the AeroLink worked example and the lab launch. 75-minute session: 69 minutes of
// planned content (48 min lecture on 18 slides, 22 min laboratory launch on 4 slides), the generated "References and
// credits" slide, and a 5-minute buffer (bufferMinutes). Faculty final review (DECISION_LOG A21): one need-priority
// vocabulary (MITRE's categories, R65 p.325, labBrief.ts NEED_PRIORITIES); the need form recommended, not required;
// claims re-checked against the source text (_source_cache/review/week01_final_review.md); the why of each method
// (methods.ts, slide s2-why-methods). Single source for the slide viewer, the reader, the .pptx, the
// faculty-notes Markdown and the student handout (docs/lectures/PIPELINE.md). Governing direction: DECISION_LOG A20
// (teach first, explain in depth, demonstrate, then assign).
//
// Review status: new-pending-review. Written 2026-10-19 and revised the same day after the independent review
// (_source_cache/review/week01_lecture_review.md; dispositions in docs/lectures/week01/REVIEW_DISPOSITIONS.md).
//
// Accuracy rules applied: every citation is a verified register entry at a page whose extracted text supports the claim
// beside it (checked in _source_cache/*.txt); quotations are short and marked; everything else is original explanation.
// Course conventions are labeled as such (the influence × support values, MITRE's priority categories applied to needs,
// the elicitation dot ratings, the six-check minimum gate, the adjudication protocol steps, team decision rules, the
// Week 2 timing of measures, the recommended need form, the "feeds" column of the methods slide). AeroLink is FICTIONAL; the case data live in ./aerolinkCase.ts and are never retyped here.
// Timing: each slide's spoken notes stay at or below 130 words per minute (./timing.test.ts).
import type { Block, Lecture, LessonBlock, LessonSection } from '../types'
import { formatReference, lectureCredits, lectureReferences } from '../references'
import { CONCERNS, CONFLICT, DELIBERATE_GAP, ELICITATION_PLAN, ENTERPRISE, EXTERNAL_SYSTEMS, MISSION_GOALS, NEEDS, NOISE_AGREEMENT, PRIORITY_DEFINITION, PRIORITY_LABEL, PROBLEM_STATEMENT, RELATIONSHIPS, RELATIONSHIP_VERB, ROLE_GROUP_LABEL, SECOND_TENSION, STAKEHOLDERS, SUPPORT_LABEL, SYSTEM_OF_INTEREST, CASE_FACTS, need, numberWord, priorityCounts, stakeholder, uncoveredStakeholders } from './aerolinkCase'
import { WEEK01_SESSION1 } from './session1'
import { LAB_MINIMUMS as MIN, LAB_MINIMUMS_THREE as MIN3, NEED_FORM, NEED_GATE_TEXT, NEED_PRIORITIES, PRT_MEANING, PRT_SHORT } from './labBrief'
import { WEEK1_METHODS, sayWhy } from './methods'

export const SESSION2_REVIEW = 'new-pending-review' as const

// ------------------------------------------------------------------------------------------------ counts quoted in prose
const N_STK = STAKEHOLDERS.length
const N_CON = CONCERNS.length
const N_NEED = NEEDS.length
const N_REL = RELATIONSHIPS.length
const PC = priorityCounts()
const TRACED = N_STK - uncoveredStakeholders().length
const W = numberWord

// ------------------------------------------------------------------------------------------------ lesson tables built from the case data
const yesNo = (b: boolean) => (b ? 'Yes' : 'No')

const registerTable: Block = {
  kind: 'table',
  caption: `AeroLink stakeholder register, part 1: classification (FICTIONAL). Role group, side and approving status marked † are proposed, instructor to confirm (the others follow the instructor key); the stage of main involvement is proposed for all ${W(N_STK)}. STK-015 is a class added to the register (proposed).`,
  header: ['ID', 'Stakeholder', 'Role group', 'Stage of main involvement', 'Int./Ext.', 'Approving authority', 'Concerns'],
  rows: STAKEHOLDERS.map((s) => [
    s.id,
    s.name,
    `${ROLE_GROUP_LABEL[s.roleGroup]}${s.classification === 'proposed' ? ' †' : ''}`,
    s.stage,
    s.side === 'internal' ? 'Internal' : 'External',
    `${yesNo(s.approving)}${s.approvingNote ? `: ${s.approvingNote.charAt(0).toLowerCase()}${s.approvingNote.slice(1)}` : ''}`,
    s.concerns.join(', '),
  ]),
}

const ratingsTable: Block = {
  kind: 'table',
  caption: 'AeroLink stakeholder register, part 2: ratings with reasons (FICTIONAL). Interest, influence and the influence reasons are from the instructor reference (STK-015’s are proposed); every support level is proposed, instructor to confirm (MITRE’s scale).',
  header: ['ID', 'Interest', 'Influence and reason', 'Support and reason'],
  rows: STAKEHOLDERS.map((s) => [`${s.id} ${s.name}`, String(s.interest), `${s.influence}: ${s.influenceReason}`, `${SUPPORT_LABEL[s.support]}: ${s.supportReason}`]),
}

const relationshipTable: Block = {
  kind: 'table',
  caption: `The ${W(N_REL)} recorded relationships (FICTIONAL; unchanged from the instructor reference). “A is affected by B” means B influences A.`,
  header: ['ID', 'Source', 'Relationship', 'Target', 'What it is about'],
  rows: RELATIONSHIPS.map((r) => [r.id, `${r.source} ${stakeholder(r.source).name}`, RELATIONSHIP_VERB[r.type], `${r.target} ${stakeholder(r.target).name}`, r.note]),
}

const sourceText = (n: (typeof NEEDS)[number]) => n.sources.map((s) => `${s.stakeholder}${s.concern ? ` (${s.concern})` : ''}${s.role === 'contributing' ? ', contributing' : ''}`).join('; ')

const needsTable: Block = {
  kind: 'table',
  caption: 'The AeroLink reference needs (FICTIONAL), each in the recommended form, naming the system of interest. Goal: the mission or goal the need serves. Provenance: corrected = a reference need, reworded into the recommended form (and, for NEED-002 and NEED-008, re-traced); proposed = a need added to the reference. Every priority is proposed, instructor to confirm.',
  header: ['ID', 'Name', 'Need statement', 'Condition', 'Rationale', 'Source stakeholder (concern)', 'Goal', 'Priority', 'Provenance'],
  rows: NEEDS.map((n) => [n.id, n.name, n.statement, n.condition, n.rationale, sourceText(n), n.mgo, PRIORITY_LABEL[n.priority], n.provenance]),
}

const coverageTable: Block = {
  kind: 'table',
  caption: 'Coverage audit, stakeholder by stakeholder (FICTIONAL).',
  header: ['Stakeholder', 'Approving', 'Needs traced (S = subject, c = contributing)', 'Audit finding'],
  rows: STAKEHOLDERS.map((s) => {
    const traced = NEEDS.flatMap((n) => n.sources.filter((x) => x.stakeholder === s.id).map((x) => `${n.id} ${x.role === 'subject' ? 'S' : 'c'}`))
    const finding = s.id === DELIBERATE_GAP.stakeholder ? 'Deliberate gap: no need; CON-015 recorded as a purchase-agreement matter, with its reason' : s.approving ? 'Approving authority covered' : traced.length ? 'Covered' : 'Gap'
    return [`${s.id} ${s.name}`, yesNo(s.approving), traced.join(', ') || '—', finding]
  }),
}

const priorityTable: Block = {
  kind: 'table',
  caption: 'MITRE’s priority categories (R65 p.325) with the course’s definitions (course convention).',
  header: ['Category', 'Course definition', 'AeroLink needs'],
  rows: NEED_PRIORITIES.map((p) => [PRIORITY_LABEL[p], PRIORITY_DEFINITION[p], NEEDS.filter((n) => n.priority === p).map((n) => n.id).join(', ') || 'none in the reference set']),
}

const elicitationTable: Block = {
  kind: 'table',
  caption: 'Instructor reasoning (course convention) for five AeroLink stakeholders.',
  header: ['Stakeholder', 'Techniques', 'Why these'],
  rows: ELICITATION_PLAN.map((e) => [`${e.stakeholder} ${stakeholder(e.stakeholder).name}`, e.techniques, e.why]),
}

const concernTable: Block = {
  kind: 'table',
  caption: `The ${W(N_CON)} AeroLink concerns (FICTIONAL; wording from the instructor reference, American spelling; CON-015 reworded and CON-017 added, both marked).`,
  header: ['ID', 'Held by', 'Concern'],
  rows: CONCERNS.map((c) => [c.id, `${c.stakeholder} ${stakeholder(c.stakeholder).name}`, `${c.name}: ${c.text}${c.provenance === 'proposed' ? ' (proposed)' : c.provenance === 'corrected' ? ' (reworded)' : ''}`]),
}

const contextTable: Block = {
  kind: 'table',
  caption: 'External systems of the AeroLink air-taxi service, each named as a system, and the stakeholder behind each (FICTIONAL).',
  header: ['ID', 'External system', 'What crosses the boundary', 'Stakeholder behind it'],
  rows: EXTERNAL_SYSTEMS.map((e) => [e.id, e.name, e.exchange, e.owner ? `${e.owner} ${stakeholder(e.owner).name}` : e.id === 'EXT-003' ? 'None: a natural system' : 'Its operator is not in the register (a discussion point)']),
}

const caseContext: LessonBlock[] = [
  { kind: 'para', text: `**The enterprise.** ${ENTERPRISE.name} (${ENTERPRISE.id}). ${ENTERPRISE.text}` },
  { kind: 'para', text: `**The system of interest.** ${SYSTEM_OF_INTEREST.name[0].toUpperCase()}${SYSTEM_OF_INTEREST.name.slice(1)} (${SYSTEM_OF_INTEREST.id}, proposed ID). ${SYSTEM_OF_INTEREST.text} (R92 p.327)` },
  { kind: 'para', text: `**Problem and mission.** ${PROBLEM_STATEMENT} Mission MGO-001: ${MISSION_GOALS[0].name.toLowerCase()}. Goals: ${MISSION_GOALS.filter((m) => m.level === 'goal').map((m) => `${m.id} ${m.name.toLowerCase()}`).join('; ')}.` },
  { kind: 'bullets', items: [{ text: 'Teaching data (FICTIONAL):', sub: CASE_FACTS }] },
]

const n3 = need('NEED-003')
const n10 = need('NEED-010')

// ------------------------------------------------------------------------------------------------ the lecture
export const WEEK1_SESSION2: Lecture = {
  week: 1,
  session: 2,
  title: 'Concerns, needs and the AeroLink case',
  subtitle: 'From what stakeholders care about to a well-formed, audited set of needs; then your team starts its own',
  bufferMinutes: 5,
  sections: [
    // ============================================================================================ concerns (9 min)
    {
      id: 's2-concerns',
      title: 'Concerns and the register',
      slides: [
        {
          id: 's2-warmup',
          title: 'Retrieval warm-up: who must we win over?',
          subtitle: 'Answer on a card; about 40 seconds per question',
          purpose: 'Spaced retrieval of Session 1 (what a stakeholder is, approving authorities, MITRE’s influence-and-support idea) before the answers are shown.',
          minutes: 2,
          layout: 'two-column',
          body: [
            {
              kind: 'bullets',
              items: ['**1.** Is the electric grid a stakeholder? If not, who is?', '**2.** Name an approving authority other than the FAA.', '**3.** Which stakeholders does MITRE’s map say must be moved, and in which direction?'],
            },
          ],
          aside: [{ kind: 'callout', tone: 'note', title: 'On your card', text: 'Write your answers before the next slide. Then compare with the person next to you.' }],
          sources: [R('R39a', '1631'), R('R11', '553'), R('R63', '236–237')],
          notes: {
            teach: [
              'Give about 40 seconds per question; students write on cards. Do not show the map yet: the next slide is the reveal.',
              'Collect three volunteers’ answers to question 1 and 2 aloud. Question 1: the grid is an external system; the stakeholder is the electric utility that runs it, because the glossary’s definitions name individuals, teams and organizations, not systems (R39a p.1631). Question 2: the city planning authority, which in the case approves vertiport sites, an approving authority in SEBoK’s sense (R11 p.553). If a student says the ANSP, accept it as arguable and recall Session 1’s debate.',
              'Read two answers to question 3 and leave them on the board; the reveal checks them.',
            ],
            why: 'Retrieval before the answers are visible consolidates Session 1 and exposes the two errors that most damage needs work: treating systems as stakeholders and forgetting approving authorities. Splitting question and reveal stops the screen from giving the answers away.',
            misconceptions: [{ claim: 'The electric grid is a stakeholder because AeroLink depends on it.', correction: 'Dependence makes the grid part of the context. The stakeholder is the organization behind it, the utility: the definitions name individuals, teams and organizations (R39a p.1631).' }],
            transition: 'Here is the map that answers question 3.',
            timing: '2 min: 40 s per question on cards, with two answers aloud.',
          },
        },
        {
          id: 's2-warmup-reveal',
          title: 'Reveal: the AeroLink register by influence and support',
          purpose: 'Check question 3 against the full register mapped on MITRE’s scale, and recap the three identification methods.',
          minutes: 1,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s2-influence-support',
            caption: `The ${N_STK} AeroLink register entries placed by influence (1–5, instructor reference) and level of support (MITRE’s scale; AeroLink values proposed). FICTIONAL.`,
            alt: 'A grid with influence 5 to 2 on the vertical axis and four support levels, awareness, understanding, buy-in and commitment, on the horizontal axis. A shaded zone covers influence 4 and 5 below commitment and is labeled high influence, not yet committed, move them right, with an arrow pointing right. In it: city planning authority (influence 5, awareness), FAA and ANSP (5, understanding), communities and insurers (4, awareness), electric utility (4, understanding), vertiport operators (4, buy-in). In the commitment column: investors (5) and the aircraft manufacturer (4). Lower rows: passengers and emergency responders (3, understanding), pilots and remote operators (3, buy-in), accessibility advocates and passengers with reduced mobility (2, awareness), maintenance technicians (2, buy-in). The FAA and the city planning authority have thick outlines marking approving authorities.',
          },
          body: [{ kind: 'bullets', items: ['Shaded: influence 4–5, not yet committed: move right', 'Thick outline: approving authority', 'Recap: sweep, context, role classes'] }],
          sources: [R('R63', '236–237')],
          notes: {
            teach: [
              'Reveal the map. Question 3: the high-influence stakeholders who are not yet committed, the shaded zone, must move toward commitment: “High influencers must be committed advocates” (R63 p.237). Both approving authorities are in the zone.',
              'Recap in one sentence: we found these stakeholders by the life-cycle sweep, the context and role classes; today we move from who they are to what they need.',
            ],
            why: 'The map previews the case data used all session and checks question 3 at a glance.',
            figure: 'Axes first: influence up, support right on MITRE’s scale. The shaded zone, then the two thick outlines inside it. The support values are proposed teaching values; the idea of the map is MITRE’s.',
            examples: ['Moving the FAA “right” never means lobbying a regulator: an approving authority’s support grows only with evidence that the operation stays within approved limits, which is why NEED-002 asks the service to demonstrate it.'],
            misconceptions: [{ claim: 'Low support means the stakeholder is an opponent to be overcome.', correction: 'On MITRE’s scale the low end is awareness, not opposition (R63 pp.236–237), and MITRE’s response is engagement and communication (R63 p.235). For regulators, the course adds, support grows only with evidence.' }],
            transition: `Each of these ${W(N_STK)} holds at least one concern. Before we write needs, we must say precisely what a concern is.`,
            timing: '1 min: 40 s reveal, 20 s recap.',
          },
        },
        {
          id: 's2-concerns-def',
          title: 'Concerns: what a stakeholder cares about, relative to the system',
          purpose: 'Define concern carefully, admit the source gap honestly, and teach the course’s specificity rule with a worked ladder.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s2-concern-ladder',
            caption: 'A specificity ladder for one stakeholder: each rung adds something a reviewer could check. The top rung is CON-012 from the AeroLink register (FICTIONAL).',
            alt: 'Three rising boxes. Bottom: “Communities: noise”, annotated generic, a reviewer can check nothing. Middle: “Noise near homes around vertiports”, annotated adds who and where, still no when or how often. Top, highlighted: CON-012, residents near vertiports are concerned about take-off and landing noise, how often it occurs and at what hours, annotated specific: who, what, where, how often, when. Above it a dashed box: still not a need; NEED-003 states what the communities need the service to do about it. A footnote gives the course rule: say what, for whom, and where or when it bites.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                'Stakeholders hold “concerns relative to a system” (ISO/IEC 26702, via SEBoK)',
                'SysML v2: “a specific topic that one or more stakeholders desire to be addressed”',
                '**Course rule:** say what, for whom, where or when it bites',
                'A concern is a worry, not yet a need',
              ],
            },
          ],
          sources: [R('R39a', '1631'), R('R04', '275'), R('R77', '115')],
          notes: {
            teach: [
              'Start from Session 1’s third definition of stakeholder: individuals, teams, organizations or classes “with interests in, or concerns relative to, a system” (R39a p.1631). The glossary uses the word but does not define it; nor does SEBoK’s View principle, which bases each view on a system aspect or concern (R04 p.275).',
              'Give the one formal definition in our collection, from the SysML v2 material used in Week 8 (R77 p.115). Stress the word specific.',
              'State the source gap: ISO/IEC/IEEE 42010, which defines concern for architecture description, is not in the collection, so our working meaning is a course convention consistent with R77.',
              'Teach the course rule and walk the ladder bottom to top. Close: a concern states the worry; it does not yet say what the stakeholder needs the system to do.',
            ],
            why: 'Concerns are the hinge between the register and the needs. A vague concern produces a vague need, and in Week 8 each concern becomes a model element.',
            figure: 'Read bottom to top. “Communities: noise” gives a reviewer nothing to check; the middle rung adds who and where; CON-012 adds how often and at what hours, which NEED-003 and later a measure will need. The dashed box is the next step, not part of the concern. The specificity rule is the course’s, not a quotation.',
            examples: ['Generic: “Insurers: risk.” Specific: CON-014, insurers are concerned that operational risk is measured and recorded so that premiums can be set on evidence.'],
            misconceptions: [
              { claim: 'A concern and a need are the same thing in different words.', correction: 'A concern is the topic the stakeholder wants addressed (R77 p.115); a need states what they need the system to do about it, with a condition (R11 p.555).' },
              { claim: 'SEBoK gives a formal definition of concern.', correction: 'It uses the word (R39a p.1631; R04 p.275); the definitions in our collection come from SysML v2, the one we use being the introduction’s (R77 p.115).' },
            ],
            transition: `With ${W(N_STK)} stakeholders and ${W(N_CON)} concerns, the register is an engineering instrument. Here it is with the relationships a flat list hides.`,
            timing: '3 min: 1 min definitions and source gap; 1.5 min ladder; 30 s concern versus need.',
          },
        },
        {
          id: 's2-register',
          title: 'The AeroLink register and its relationships',
          subtitle: `Worked example, part 1 (FICTIONAL): ${N_STK} stakeholders, 2 approving authorities, ${N_REL} relationships, 1 conflict`,
          purpose: `Show the complete stakeholder instrument: the ${N_STK}-row register (in the reader) and the ${N_REL} relationships, including the one recorded conflict that later drives the needs trade.`,
          minutes: 3,
          layout: 'figure',
          figure: {
            id: 'w1s2-relationship-map',
            caption: `The ${N_REL} recorded relationships among AeroLink stakeholders. REL-002, the only conflict, links the communities and the vertiport operators (FICTIONAL instructor reference).`,
            alt: 'A network of eleven stakeholder boxes. A thick dashed double-headed arrow between STK-004 Communities and STK-005 Vertiport operators is labeled REL-002 conflicts with: noise and siting vs throughput. Other arrows: from STK-004 Communities to STK-013 City planning authority, REL-007: 013 is affected by 004 (public consultation on siting); STK-010 Electric utility supplies STK-005 (REL-003, grid power); STK-006 Emergency responders coordinates with STK-005 (REL-005, incident response plans); STK-007 ANSP coordinates with STK-008 Pilots and remote operators (REL-006, flight clearances); STK-002 FAA regulates STK-011 Manufacturer (REL-001, aircraft certification); STK-003 Investors funds STK-011 (REL-004, fleet purchase); STK-012 Insurers partners with STK-003 (REL-008, risk transfer on financing). A note lists stakeholders with no recorded relationship: passengers, maintenance technicians, accessibility advocates, passengers with reduced mobility. Thick outlines mark the two approving authorities.',
          },
          body: [],
          sources: [R('R11', '553'), R('R63', '234')],
          notes: {
            teach: [
              'Open the reader’s register table (lesson section “The AeroLink case: context and register”) on a second screen; read two rows, STK-004 and STK-013, saying what each column is for.',
              'SEBoK’s register holds key information on how each stakeholder is involved with the system of interest (R11 p.553); MITRE adds the interests each group represents, its power, and whether it supports or inhibits the change (R63 p.234). The course register combines both, with a reason for every rating.',
              'Turn to the figure: name the relationship types, then dwell on REL-002.',
              'Close with SEBoK’s advice to re-evaluate the stakeholder community periodically (R11 p.553).',
            ],
            why: 'Students cannot write good needs from a thin register. A complete, reasoned register with relationships sets the standard for Part 4 of the Team Record and introduces the conflict the needs section must handle.',
            figure: 'Begin at STK-005, where three relationships meet. Then the conflict: the one symmetric, adversarial link. Then follow the arrow from the communities up to the city planning authority: it is affected by them through public consultation, so a community objection becomes an approval risk. Move right: FAA, manufacturer, investors and insurers form a chain about the fleet. Finish on the box of stakeholders with no relationship yet: an absence worth checking.',
            examples: ['Why REL-008 matters: insurance conditions attach to the investors’ financing, so an insurer with no loss history to price can slow fleet growth.'],
            misconceptions: [{ claim: 'A conflict between stakeholders is a problem to remove from the record.', correction: 'A conflict is information. It is recorded (REL-002) so that the needs it produces can be traded openly.' }],
            transition: 'Each concern now has to become a need. A need, though, is still not a requirement.',
            timing: '3 min: 1 min two register rows; 1.5 min relationship map; 30 s re-evaluation.',
          },
        },
      ],
    },
    // ============================================================================================ needs (25 min)
    {
      id: 's2-needs',
      title: 'Needs at graduate depth',
      slides: [
        {
          id: 's2-needs-vs-reqs',
          title: 'Needs versus requirements: two perspectives',
          subtitle: 'Needs: the stakeholder’s outside view. Requirements: the developer’s inside view.',
          purpose: 'Teach the central distinction of the week: the stakeholder’s black-box need versus the developer’s white-box requirement, linked by a transformation.',
          minutes: 3,
          layout: 'figure',
          figure: {
            id: 'w1s2-need-vs-requirement',
            caption: 'Needs are the stakeholder’s outside view of the system of interest; requirements are the developer’s inside view. SEBoK’s coffee-maker pair is paraphrased; NEED-010 is from the AeroLink case (FICTIONAL).',
            alt: `Two panels joined by arrows labeled transformation equals analysis. Left panel, stakeholder’s view, black box from outside, shows a black box labeled SoI and two needs: the user needs the coffee maker to stop heating water once the selected temperature is reached; and NEED-010, ${n10.statement.replace(/\.$/, '')}. Right panel, developer’s view, white box from inside, shows: the coffee maker shall stop the heating function once the selected brew temperature is reached; and a dashed box, Week 2: several requirements, each an engineering decision, transformed from NEED-010.`,
          },
          body: [],
          sources: [R('R11', '549'), R('R13', '558'), R('R39a', '1632'), R('R39l', '1652')],
          notes: {
            teach: [
              'State SEBoK’s distinction (R11 p.549): stakeholder needs represent the perspective of users, acquirers, customers and other stakeholders; they are transformed into system requirements, which communicate the developer’s perspective.',
              'Add the view language (R13 p.558): needs say what stakeholders need the system of interest to do, seen from outside as a black box; requirements say what the system must do, seen from inside. Walk the coffee-maker pair (paraphrased from R13 p.558).',
              'Give the glossary entries: stakeholder needs as SEBoK quotes them from ISO/IEC/IEEE 15288:2023, concentrating on system purpose and behavior in the operational environment (R39a p.1632, paraphrased); a system requirement transforms that user-oriented view into a technical view of a solution (R39l p.1652, paraphrased).',
              'Name the terminology trap: “stakeholder requirements” are a third thing, statements transformed from needs into more formal form (R39a p.1632). This course treats them, when a stakeholder imposes them, as one input to the needs (R11 p.551).',
              'Read NEED-010 and ask what its requirements might look like. Accept answers, write none: that is Week 2.',
            ],
            why: 'Every later week depends on this distinction. Students who merge needs and requirements lose the validation reference and write requirements that merely reword wishes.',
            figure: 'Left panel: a black box, because the stakeholder does not see inside; both statements say what the stakeholder needs the system to do, and both name the system. Right panel: a white box: what the system itself shall do. The arrows are labeled analysis, not rewording. Bottom row: NEED-010 and a dashed placeholder for Week 2.',
            examples: ['A stakeholder may hand you a requirement, for example a regulator’s written limit. SEBoK treats it as an additional input to the analysis from which the integrated set of needs is defined (R11 p.551); understanding the need behind it is still the engineer’s job (course emphasis).'],
            misconceptions: [
              { claim: 'A need is just a requirement written informally.', correction: 'They are different views by different parties (R11 p.549; R13 p.558).' },
              { claim: '“Stakeholder requirement” and “stakeholder need” mean the same thing.', correction: 'SEBoK separates them (R39a p.1632; R11 p.551).' },
            ],
            transition: 'A single need is not the end product. SEBoK’s product is an integrated set.',
            timing: '3 min: 1 min the distinction; 1 min figure; 1 min glossary, terminology trap and question.',
          },
        },
        {
          id: 's2-integrated-set',
          title: 'From individual needs to an integrated set',
          purpose: 'Show that “the needs” is an engineered set built from four streams of analysis, with four properties, defining scope and validation.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s2-integrated-set',
            caption: 'Four streams of analysis feed one integrated set of needs, which is transformed into requirements and later validates them. Original drawing after the process SEBoK describes.',
            alt: 'Four boxes on the left, stakeholder needs elicited and prioritized; drivers and constraints; risks (threats, hazards); life-cycle concepts analyzed and matured, converge by arrows on a central highlighted box, integrated set of needs, listing correct, consistent, complete, feasible, with the note defines the project scope. An arrow out to the upper right leads to a dashed box, transformed into design-input requirements (Week 2). An arrow from a lower-right box, validation reference for requirements, design and the realized system, points back to the set.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Inputs: needs, drivers and constraints, risks, life-cycle concepts', 'The set: **correct, consistent, complete, feasible**', 'It reflects the mission and goals, and defines scope', 'Requirements, design and system are validated against it'],
            },
          ],
          sources: [R('R11', '549–552, 554–555')],
          notes: {
            teach: [
              'SEBoK (R11 p.549): stakeholder needs combined with the results of analyzing risks, drivers, constraints and life-cycle concepts give the integrated set of needs. It is a series of analysis activities, not just elicitation (R11 p.550).',
              'Drivers and constraints are outside the project’s control (R11 p.554): for AeroLink, the noise agreement and the grid connection. Failing to address risks leaves the set incomplete (R11 p.554): the battery-fire risk gives NEED-006.',
              'The set is correct, consistent, complete and feasible; it reflects the mission, goals and measures (R11 p.554), defines the project scope, and is the reference for validating requirements, design and the realized system (R11 pp.551, 555).',
            ],
            why: 'Students see needs as a wish list collected in interviews. Four inputs and four properties turn needs work into analysis, and explain why the coverage audit tests the set.',
            figure: 'Left to right: the four analysis streams converge on the set. Two arrows leave it: transformation into requirements in Week 2, and the arrow coming back, because the same set validates requirements, design and system. This is an original drawing; SEBoK’s own figure on these pages is not reproduced.',
            examples: ['A life-cycle concept that exposed a need: writing the weather-disruption scenario (SCN-005) exposed NEED-011.'],
            misconceptions: [{ claim: 'Consistent means no stakeholder disagrees.', correction: 'Consistency is a property of the agreed set; disagreements are recorded and resolved by trade and agreement (slide 13).' }],
            transition: 'The set is transformed into requirements. The commonest mistake is to think that is a matter of changing words.',
            timing: '2 min: 40 s definition, 40 s drivers and risks, 40 s set properties and scope.',
          },
        },
        {
          id: 's2-transformation',
          title: 'The transformation is analysis, not rewording',
          purpose: 'Pre-empt the most damaging misconception, “requirement = need + shall”, and show that one need yields several requirements, each an engineering decision.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s2-one-need-many',
            caption: 'One need, several requirements: NEED-010 (FICTIONAL) fans out through analysis into illustrative requirement topics that Week 2 will decide.',
            alt: 'A highlighted box on the left, NEED-010, the utility needs the air-taxi service to keep each vertiport’s power within the agreed connection capacity, leads by an arrow to a box labeled analysis: functional, interface, performance. From it four arrows fan out to dashed boxes: REQ-? charging power limit; REQ-? charge scheduling; REQ-? load monitoring; REQ-? over-limit alarm and response. A note reads: each leaf is a design decision, not a reworded need; leaves are illustrative.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['More than “changing the subject of the need statement”', { text: 'Analysis tools:', sub: ['functional, interface, performance analysis', 'data-flow diagrams; a needs transformation matrix'] }, 'One need can yield several requirements', 'Every requirement is an engineering decision'],
            },
          ],
          sources: [R('R13', '557–559')],
          notes: {
            teach: [
              'Quote the phrase that matters (R13 p.558): generating a requirement is more than “changing the subject of the need statement”; it is an analysis of what the system must do.',
              'Name the tools (R13 p.558): functional, interface and performance analysis, data-flow diagrams and what SEBoK calls a “needs to transformation matrix”. Phase II builds the models that support them.',
              'One need can produce several requirements, each with measurable criteria (R13 p.559), and every requirement is an engineering decision about what the system must do (R13 p.557).',
              'Walk the fan-out and ask which leaf a different team might decide differently. (All of them.)',
            ],
            why: 'If students believe a requirement is a need with “shall” added, Week 2 produces untestable restatements and throws away the stakeholder’s intent.',
            figure: 'Left: NEED-010. Middle: analysis, the step students skip. Right: four dashed leaves, each a different kind of requirement. The dashes and “REQ-?” mean these are illustrative topics that Week 2 decides.',
            examples: ['Rewording, not analysis: “The vertiport shall stay within the connection capacity.” It moves the subject and adds “shall” but decides nothing about how the service controls its load.'],
            misconceptions: [{ claim: 'Requirement = need + “shall”.', correction: 'The transformation is analysis of what the system must do (R13 p.558).' }],
            transition: 'If requirements come from the needs, why keep the needs once the requirements exist? Because of verification and validation.',
            timing: '2 min: 40 s the phrase and tools; 40 s one-to-many; 40 s fan-out question.',
          },
        },
        {
          id: 's2-why-keep',
          title: 'Why keep the needs: verification, validation and cost',
          purpose: 'Motivate rigor with consequences: the integrated set is the validation reference, requirement validation needs it, and DoD names the cost of skimping.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s2-validation-v',
            caption: 'The needs are the reference at both ends: requirements are transformed from them, the system is verified against the requirements and validated against the needs.',
            alt: 'A V shape. The left arm descends from a highlighted box, integrated set of needs, to system requirements, to design, to realize at the bottom; the right arm rises through integration to system verification, against the requirements, and then to a highlighted box, system validation: right system? Dashed horizontal arrows pair the arms: needs with system validation, labeled validated against the needs; system requirements with system verification, labeled verified against the requirements; design with integration. A note between the arms says that the requirements themselves are checked too: verification, well formed?; validation, faithful to the needs?',
          },
          body: [
            {
              kind: 'bullets',
              items: ['System **verified** against requirements; **validated** against needs', 'Requirement verification: well formed?', 'Requirement validation: faithful to the needs?', 'DoD: skimping risks creep, rework, cost growth, slip'],
            },
          ],
          sources: [R('R11', '551, 555'), R('R23a', '634'), R('R13', '566'), R('R48a', '141')],
          notes: {
            teach: [
              'Repeat the anchor: the integrated set of needs is what the requirements, the design and the realized system are validated against (R11 pp.551, 555). Point at the V: verification confirms that specified requirements have been fulfilled (R23a p.634); validation then checks the system against the needs.',
              'Distinguish the two checks on the requirements themselves (R13 p.566): requirement verification asks whether they are well formed; requirement validation asks whether they are the right ones, faithful to the needs. Without the needs, the second question cannot be asked.',
              'DoD (R48a p.141): skimping on stakeholder requirements definition can lead to requirements creep, rework from misunderstood end-user needs, contract modifications, cost growth and schedule slip.',
            ],
            why: 'Graduate students accept rigor when they see the cost of its absence. This slide converts “write good needs” into a verification and validation obligation.',
            figure: 'Trace the left arm down, the right arm up. Stop at system verification: paired with system requirements. Then system validation: paired with the needs, across the top. The note between the arms is about checking the requirements themselves.',
            examples: [`AeroLink: if ${n3.id} were archived after Week 2, a requirement that bounded only the loudness of each event could pass requirement verification (well formed) and still fail validation, because the residents’ need also bounds the number of evening events.`],
            misconceptions: [{ claim: 'Verification and validation are two names for testing.', correction: 'Verification checks against the requirements; validation checks against the needs (R11 pp.551, 555; R13 p.566).' }],
            transition: 'If the needs carry that weight, each one must be well formed. What does that mean, and on whose authority?',
            timing: '2 min: 40 s the V, 50 s the requirement checks, 30 s DoD consequences.',
          },
        },
        {
          id: 's2-well-formed',
          title: 'What makes a need well formed',
          subtitle: 'Three sourced layers, plus the course’s minimum gate',
          purpose: 'Replace a course-only checklist with a sourced, layered set: SEBoK statement form (a recommended format, not the only valid one), MITRE’s six content attributes, SEBoK’s set test; then the course gate, and where measures fit.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s2-need-attributes',
            caption: 'Need quality in three layers: statement form and the set test from SEBoK, content attributes from MITRE. Highlighted chips are covered by the course’s six-check minimum gate.',
            alt: 'Three stacked panels. Top, set test (SEBoK): correct, consistent, complete, feasible. Middle, content attributes (MITRE): enterprise and operational context; complete, end to end; conditions or scenario; attributes and metrics; growth and extensibility; solution-independent. Bottom, statement form (SEBoK): stakeholder’s perspective; no shall; recommended, the format “need the system to”; ID, rationale, source. Six chips are highlighted with a bold outline and a dot: conditions or scenario, solution-independent, stakeholder’s perspective, no shall, the recommended format, and ID, rationale, source. A legend says these are covered by the course minimum gate: stated as a need, no design, attributed, traced, condition, rationale.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['**Form (SEBoK):** no “shall”; recommended: “The [stakeholders] need the [system] to …”', '**Content (MITRE):** six attributes, including metrics', '**Set test (SEBoK):** correct, consistent, complete, feasible', '**Course gate:** six minimum checks; another phrasing passes'],
            },
          ],
          sources: [R('R11', '551, 554–555'), R('R53', '295–297'), R('R23a', '635')],
          notes: {
            teach: [
              'Layer 1, statement form (R11 p.555): structured natural language from the stakeholders’ perspective; no “shall”. SEBoK recommends a format different from requirements, “such as” “The stakeholders need the system to …”, and its example table gives each need an ID, a name, a rationale and a source. The course recommends that form, because naming the system keeps the outside view and says what is validated. Another phrasing passes if it names the stakeholder and the outcome and is neither a requirement nor a solution.',
              'Layer 2, MITRE’s six attributes (R53 p.296), one AeroLink example each: enterprise context (NEED-005 in a three-year growth plan); complete, end to end (NEED-006 asks for warning and safe access); conditions or scenario (NEED-010, “when several arriving aircraft charge together”); attributes and metrics; growth (NEED-005); solution-independent (NEED-003 names no barrier or flight path).',
              'Be exact about metrics. MITRE says needs must be defined and quantified (R53 p.295), asks the engineer to consider quantifiable metrics, how much, how well, how often and how quickly, tied to mission goals, and warns that they are frequently missing (R53 pp.296–297); SEBoK expects the set to state performance and quality (R11 p.554). This course attaches the measures in Week 2: a sequencing convention.',
              'Layer 3, the set test (R11 p.551): correct, consistent, complete, feasible; SEBoK applies correctness, completeness and consistency to individual needs too (R11 p.554). The coverage audit on slide 17 is a completeness test.',
              `The course gate (course convention): ${NEED_GATE_TEXT}. A floor, not the definition of quality. ${sayWhy('statements')}`,
              'Singular versus end to end: a need is end to end when its parts form one outcome the stakeholder would not accept in part; it is compound, and should be split, when its parts could be agreed or traded separately (course guidance).',
            ],
            why: 'A single checklist presented as complete teaches students to satisfy a checker. Layering the sourced characteristics shows what quality means and makes the course gate visibly a minimum.',
            figure: 'Read bottom up: form is the floor, content the middle, the set test on top. The dotted chips are what the six checks cover; everything else, from metrics to the set test, separates a passing need from a good one.',
            examples: [
              'For contrast, SEBoK’s requirement characteristics (R23a p.635): necessity, implementation-free, unambiguous, consistent, complete, singular, feasible, traceable, verifiable. They govern Week 2.',
              'Compound, then split: the city planning authority’s zoning conformance and public-transport connection could be agreed separately, so the case records them as NEED-012 and NEED-016.',
              'Source gap: INCOSE’s Needs and Requirements Manual and Guide to Writing Requirements are cited by SEBoK but are not in our collection.',
            ],
            misconceptions: [
              { claim: 'If a need clears the six course checks, it is well formed.', correction: 'The six checks are a minimum; MITRE’s attributes (R53 p.296) and the set test (R11 p.551) go further.' },
              { claim: 'Needs are qualitative; numbers belong only in requirements.', correction: 'MITRE says needs must be quantified and to consider quantifiable metrics (R53 pp.295–296), and SEBoK expects “how well” in the set (R11 p.554). The course attaches measures in Week 2 as a sequencing choice.' },
              { claim: 'A need not written “The [stakeholders] need the [system] to …” is invalid.', correction: 'SEBoK gives that format as an example (“such as”, R11 p.555). The defects are “shall”, a solution as the thing needed, no stakeholder and no outcome; the course recommends the form and the lab tool accepts other phrasings with a note.' },
            ],
            transition: 'Let us read one need part by part, and face the hard case: when is a design word allowed in a need?',
            timing: '4 min: 45 s form and why it is recommended; 1 min MITRE attributes; 30 s metrics; 30 s set test; 45 s course gate and what it feeds; 30 s singular versus end to end.',
          },
        },
        {
          id: 's2-anatomy',
          title: 'Anatomy of a need, and the level problem',
          purpose: 'Practice reading a need part by part, then handle the hard case: whether a statement is solution-laden depends on the level of the system of interest.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s2-need-anatomy',
            caption: 'NEED-003 from the AeroLink case, labeled part by part, with what travels with it; below, the same noise topic at two levels of system of interest (FICTIONAL).',
            alt: `NEED-003 split into four labeled parts stacked vertically: who needs it, “Communities near vertiports”; need, not shall, “need the air-taxi service to”; what, no design, “keep take-off and landing noise exposure at nearby homes within the agreed limits on the loudness of each event and on the number of events in the evening and early morning”; condition, “at every vertiport, every operating day.” Below, four tags labeled travels with it: ID NEED-003; source STK-004 and CON-012; goal ${n3.mgo}; rationale, permit at risk. Under a divider, the level problem: at the service level, our system of interest, “noise exposure within the agreed limits” is a need; a dashed arrow leads to the rotor-blade level, later, where a blade-tip speed limit may be a legitimate derived constraint.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['Who · need the [system] to · what (no design) · condition', 'SEBoK’s own examples include feature-level needs', 'Solution-laden depends on the **level** of the system of interest', '**Course rule:** a design term stays only as a justified constraint'],
            },
          ],
          sources: [R('R11', '555'), R('R13', '558')],
          notes: {
            teach: [
              'Read NEED-003 aloud and label it with the class: who (communities near vertiports); “need the air-taxi service to”; what, with no design named (noise exposure within the agreed limits on the loudness of each event and the number of evening and early-morning events); the condition. Then the attachments: ID, source, goal MGO-003, rationale.',
              'The hard case: SEBoK’s own example table includes two temperature settings and four colors for a coffee maker (R11 p.555, Table 2). Resolve it with level: SEBoK requires requirements to suit the level of the system of interest in the architecture (R13 p.558), and the course applies the same logic to needs. Whether a statement is solution-laden depends on that level and on genuine constraints.',
              'Course rule (course convention): a design term may stay in a need only as a justified constraint, such as the noise limits the city agreement imposes. Otherwise ask why until it disappears.',
            ],
            why: 'Students need to read needs as structures. The level problem prevents a mechanical “no design words ever” rule, which SEBoK’s own examples would contradict.',
            figure: 'Top half: the four labeled parts, then the tags. Ask which part disappears first in a bad need (usually the condition). Bottom half: at the service level the noise topic is a need; at a rotor-blade element, much later, a blade-tip speed limit could be a derived constraint.',
            examples: ['A justified constraint: the agreement specifies 65 dBA at the pad edge for each event, so the number can appear in the rationale and in a Week 2 requirement, because the stakeholder imposed it.'],
            misconceptions: [{ claim: 'Any word that sounds technical makes a need solution-laden.', correction: 'It depends on the level of the system of interest and on genuine constraints: course reasoning from SEBoK’s level rule for requirements (R13 p.558) and its feature-level example needs (R11 p.555).' }],
            transition: 'Good needs depend on good elicitation. Which technique fits which stakeholder?',
            timing: '2 min: 1 min anatomy; 1 min the level problem and course rule.',
          },
        },
        {
          id: 's2-elicitation',
          title: 'Choosing elicitation techniques',
          subtitle: 'Choose by project size, type, complexity, schedule, interviewees and locations (MITRE)',
          purpose: 'Treat elicitation as a method choice with selection factors, using the techniques SEBoK and MITRE name; the AeroLink choices are in the reader.',
          minutes: 2,
          layout: 'figure',
          figure: {
            id: 'w1s2-elicitation-matrix',
            caption: 'Elicitation techniques named by SEBoK and MITRE, rated against five selection factors. The ratings are instructor judgment (course convention).',
            alt: 'A matrix with eight technique rows and five factor columns: reach (many people), depth, low cost, tacit knowledge, contested topics, plus a column naming the source. Ratings use filled, half-filled and empty circles. Structured brainstorming workshop: partial, weak, partial, weak, weak (SEBoK, MITRE). One-on-one interview: weak, strong, partial, partial, strong (SEBoK, MITRE). Questionnaire or survey: strong, weak, strong, weak, partial (SEBoK, MITRE). Focus group or workshop: partial, strong, partial, partial, partial (SEBoK, MITRE). Direct observation: weak, strong, weak, strong, weak (MITRE). Prototype or visual content: partial, strong, weak, strong, partial (SEBoK, MITRE). Documentation review: weak, partial, strong, weak, weak (SEBoK). Joint user–developer session: partial, strong, weak, partial, strong (MITRE). A legend notes the ratings are instructor judgment and that SEBoK also lists feedback from System Verification and System Validation.',
          },
          body: [],
          sources: [R('R11', '553'), R('R65', '324'), R('R63', '235–236')],
          notes: {
            teach: [
              'SEBoK recommends several techniques to suit diverse sources: structured brainstorming workshops, interviews and questionnaires, workshops or focus groups, visual content, documentation review, and feedback from verification and validation (R11 p.553). MITRE adds direct observation and prototyping, names the selection factors, and calls joint user–developer sessions frequently one of the most powerful techniques (R65 p.324).',
              'Walk one row and one column, and say twice that the dots are instructor judgment. Why the two workshop rows differ: a brainstorming workshop generates many ideas quickly but defers judgment, so it is poor for depth and contested topics; a focus group discusses experience in depth.',
              'Quick check: which technique best uncovers CON-010, turnaround pressure on maintenance? (Direct observation: pressure shows in the work.) Interview practice and the AeroLink choices are in the reader (R63 pp.235–236).',
              sayWhy('elicitation'),
            ],
            why: 'Students default to “we will interview them.” A selection matrix makes elicitation a justified engineering choice, which the Team Record asks for.',
            figure: 'Read one row (the interview: deep and candid, low reach) and one column (tacit knowledge: observation and prototypes). The last column names the source of each technique; the ratings are the instructor’s.',
            misconceptions: [{ claim: 'The dot ratings are from the literature.', correction: 'They are instructor judgment; the technique lists and selection factors are sourced (R11 p.553; R65 p.324).' }],
            transition: 'The technique gets you in the room. One question decides whether you hear the real need.',
            timing: '2 min: 30 s sources and factors; 45 s the matrix; 25 s quick check; 20 s why and what it feeds.',
          },
        },
        {
          id: 's2-real-need',
          title: 'What to ask, and how to find the real need',
          purpose: 'Give the content of elicitation (SEBoK’s topic list) and the “why” ladder that separates the stakeholder’s outcome from a proposed solution and from the constraints around it.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s2-why-ladder',
            caption: 'Asking why climbs from a stated solution to the residents’ outcome; the city agreement is a constraint beside the ladder, and the solution survives only as one option. AeroLink, FICTIONAL.',
            alt: 'A ladder of three boxes rising left to right. Bottom: stated, “Put up sound barriers around the pad”, a solution masquerading as a need. Middle: effect, late-evening and early-morning take-offs wake residents. Top, highlighted: outcome, rest and home life near the vertiport not disrupted by take-off and landing noise, above all at night. Arrows between rungs are labeled why. Above the top rung, a box: recorded as NEED-003, noise exposure at homes within the agreed limits. Beside it, a dashed box: constraint (driver), city agreement: 65 dBA per event; cap on evening and early-morning events. From the outcome an arrow leads to a dashed box, possible solutions (Week 3 onward): sound barriers, flight paths, operating hours, quieter procedures. A note says the barrier survives only as one option; the need stays solution-free.',
          },
          body: [{ kind: 'bullets', items: ['Ask about scenarios, off-nominal use, risks, priority', 'Ask **why** until the outcome appears', 'Constraints bound the need; they are not the need', '“Beware solutions masquerading as needs”'] }],
          sources: [R('R11', '553–554'), R('R65', '322'), R('R53', '296')],
          notes: {
            teach: [
              'SEBoK’s elicitation topics (R11 p.553) include use and misuse cases, quality, risks, the rationale for each need and its priority; providing rationale often reveals the real need, especially when it is expressed as an implementation.',
              'MITRE: determine the root cause and state the problem in an implementation-independent manner (R65 p.322); “beware solutions masquerading as needs” (R53 p.296).',
              'Walk the ladder: residents ask for sound barriers; why? Late and early take-offs wake them; why does that matter? Their outcome is rest and home life without disruptive noise, above all at night. The city agreement is a constraint, a driver outside the project’s control (R11 p.554); the need, NEED-003, is that outcome bounded by the agreement.',
            ],
            why: 'The why ladder is the most useful elicitation habit, and separating the outcome from the constraint keeps the time-of-day dimension the residents care about.',
            figure: 'Bottom rung: the stated solution. Middle: the effect. Top: the outcome, solution-free. Above it, how the set records it; beside it, the constraint. The arrow right leads to options for Week 3.',
            examples: ['A second ladder: a technician asks for “a tablet app showing battery health.” Why? Aircraft are released without a clear condition picture under time pressure. The need is NEED-007.'],
            misconceptions: [{ claim: 'The agreed limit is the residents’ need.', correction: 'The limit is a negotiated constraint (R11 p.554); asking why reveals the outcome it protects, including when the noise occurs.' }],
            transition: 'Ask enough people why, and their needs start to pull against each other. What then?',
            timing: '2 min: 30 s topics; 30 s root cause; 1 min the ladder.',
          },
        },
        {
          id: 's2-conflict',
          title: 'Conflicting needs and prioritization',
          purpose: 'Teach what to do when needs conflict: record both, prioritize with defined categories, and adjudicate by an agreed protocol, shown on AeroLink’s noise-versus-throughput conflict.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s2-adjudication',
            caption: 'AeroLink’s recorded conflict (REL-002) as a tension between needs that share one variable, and a four-step adjudication protocol (course convention after MITRE). FICTIONAL.',
            alt: 'At the top, two boxes at opposite ends of a dashed tension bar resting on a pivot: left, NEED-001 and NEED-004, more departures, sooner, priority critical; right, NEED-003, noise exposure: level and number of evening events, priority mandatory. Under the pivot: shared variable, take-offs and landings per pad in the evening and early-morning hours. Below, four boxes in sequence: 1 Record (all three needs and REL-002), 2 Analyze (Week 3 trade inside both limits), 3 Negotiate (city, residents, operators), 4 Escalate (sponsor decides and records why), the last highlighted. Footnotes: priority frames the trade; agreement ends it; protocol steps are the course’s application of MITRE’s advice.',
          },
          body: [{ kind: 'bullets', items: ['Conflicts are normal; **record both**, never delete one', 'Priorities: mandatory, critical, desirable, optional', 'Agree the adjudication protocol early; escalate to the sponsor', 'AeroLink: NEED-001/004 vs NEED-003 (REL-002)'] }],
          sources: [R('R10', '546'), R('R11', '551, 553'), R('R65', '325'), R('R48a', '142')],
          notes: {
            teach: [
              'Conflicts are normal (R10 p.546): business and user perspectives give goals that conflict and must be prioritized against the enterprise strategy. Record both sides: the set must end up consistent (R11 p.551), but by trade and agreement, not deletion.',
              'MITRE’s practice (R65 p.325, written for requirements, applied to needs as a course convention): stakeholders assign priorities, mandatory, critical, desirable or optional; the engineer defines each category and points out inappropriate priorities; prioritization ends when stakeholders agree; adjudicate early; escalate to the sponsor. These four are the only priority words in the course, lab tool included. DoD: negotiate to resolve discrepancies (R48a p.142).',
              `Apply it to AeroLink. Ask the class first: what single quantity do NEED-001, NEED-004 and NEED-003 all depend on? Take two answers. Then: ${CONFLICT.why}`,
              'The adjudication: NEED-003 is mandatory, because the agreement conditions the site permit; NEED-001 and NEED-004 are critical. Record; analyze in the Week 3 trade (spreading departures across hours and pads, paths, quieter procedures, all inside both limits); negotiate with the city planning authority, community consultation and the operators; escalate to the sponsor if unresolved.',
            ],
            why: 'Students either ignore conflicts or “solve” them by deleting one side. A protocol, with priority framing rather than deciding, prepares them for the Week 3 trade study.',
            figure: 'Top half: the tension and the shared variable, which is what makes this a real conflict: departures in the evening and early-morning hours serve the waits and count against the event cap. Bottom half: the protocol, escalation highlighted because teams forget to agree it in advance.',
            examples: [
              'Why the per-event level alone would not conflict with throughput: more departures do not make any single take-off louder. The conflict comes from the event count in the sensitive hours, which is why NEED-003 carries both dimensions.',
              'An inappropriate priority, in MITRE’s sense: marking NEED-017 (competitive fares) mandatory. Nothing imposes it.',
            ],
            misconceptions: [
              { claim: 'When two needs conflict, keep the higher-priority one and delete the other.', correction: 'Keep both (course rule); MITRE: prioritization ends when stakeholders reach agreement (R65 p.325); the set must end up consistent (R11 p.551).' },
              { claim: 'MITRE’s categories are MoSCoW.', correction: 'They are MITRE’s (R65 p.325); MoSCoW is not in our collection.' },
              { claim: 'Priority is high, medium or low.', correction: 'On the same page MITRE uses high, medium and low only for a different attribute, business value; priority uses mandatory, critical, desirable or optional (R65 p.325), and so do the case, the lab tool and its exports.' },
            ],
            transition: 'Before the worked example, consolidate by contrast: the errors teams make most often.',
            timing: '4 min: 45 s conflicts are normal; 1 min MITRE; 1 min class question and shared variable; 1.25 min the protocol on the figure.',
          },
        },
        {
          id: 's2-errors',
          title: 'Common errors and their corrections',
          purpose: 'Consolidate by contrast: high-frequency errors with source-based corrections, on one annotated register line (the full list of ten is in the reader).',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s2-weak-register',
            caption: 'One weak register line with three errors, and a start on the corrected version (illustrative, generic case).',
            alt: 'A panel shows a weak register line: Stakeholders: users, the company, the app. Three warning callouts point at it: the developing company with no role or concern; a system listed as a stakeholder: name the organization behind it; no approving authority: who must certify, qualify or approve it for use? Below, a rewritten start: riders (users); the agency that commissions the service (customer); the organization that runs the app platform (owner of an external system); the transport regulator (approving authority); riders who need accessible formats (a class).',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Only customers and users → sweep; find approving authorities', 'A system as stakeholder → list its owner', 'Need = informal requirement → keep the stakeholder view', 'Solution as need → ask why', 'Deleting one side of a conflict → record both'],
            },
          ],
          sources: [R('R11', '549, 551–553, 555'), R('R39a', '1631'), R('R13', '558'), R('R53', '296')],
          notes: {
            teach: [
              'Show the weak line and ask the class to find three errors before revealing the callouts (one minute).',
              'Then read the five errors on the right and give the source for each correction: SEBoK’s list and approving authorities (R11 pp.552–553); stakeholders are individuals, teams, organizations or classes (R39a p.1631); needs and requirements are different views (R11 p.549; R13 p.558); ask why (R11 p.553; R53 p.296); consistency by agreement (R11 p.551).',
            ],
            why: 'Errors paired with corrections are easier to retrieve than rules stated alone, and finding them on a real-looking line is practice, not recital.',
            figure: 'Read the weak line, then each callout, then the rewritten start: every party now has a role group, and the system has become the organization behind it.',
            misconceptions: [{ claim: 'These errors are matters of style.', correction: 'Each breaks a sourced rule; leaving out a stakeholder, for example, often results in missing needs and failed validation (R11 p.552).' }],
            transition: 'Now the whole method once, end to end, on AeroLink.',
            timing: '2 min: 1 min the class finds the errors; 1 min the five corrections.',
          },
        },
      ],
    },
    // ============================================================================================ worked example and why (14 min)
    {
      id: 's2-worked',
      title: 'The AeroLink worked example',
      slides: [
        {
          id: 's2-worked-steps',
          title: 'Worked example I: concern to need in six steps',
          subtitle: 'STK-010 Electric utility, CON-011 Peak grid load (FICTIONAL)',
          purpose: 'Model, with student contributions at every step, the procedure students follow in the lab, including the repair of a design-laden draft into a need in the recommended form.',
          minutes: 5,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s2-draft-to-need',
            caption: 'From the interview draft to NEED-010: what is wrong with the draft, and the need in the recommended form with what travels with it (FICTIONAL).',
            alt: `At the top, the interview draft: “There is a need for a smart grid controller that must cap charging.” Three warning labels point at it: no subject; a solution; “must”: requirement wording. An arrow labeled ask why, strip design, attribute, add condition leads to NEED-010 in the recommended form: “The electric utility needs the air-taxi service to keep the power drawn at each vertiport within the agreed connection capacity.” Condition: ${n10.condition.replace(/\.$/, '')}. Four tags: source STK-010 via CON-011; goal ${n10.mgo}; rationale, trips protection or penalty; priority mandatory (proposed). A note says the controller is set aside as an option for Weeks 2 and 3, not discarded.`,
          },
          body: [
            {
              kind: 'steps',
              items: [
                { label: 'Concern', text: 'CON-011 peak grid load' },
                { label: 'Ask why', text: 'trips protection or penalty tariffs' },
                { label: 'Strip design', text: 'drop the controller and “must”' },
                { label: 'Attribute', text: '“The electric utility needs the air-taxi service to …”' },
                { label: 'Condition', text: 'several aircraft charging together' },
                { label: 'Record', text: 'ID, trace, goal, priority' },
              ],
            },
            { kind: 'bullets', items: ['Check: form, MITRE attributes, six gates'] },
          ],
          sources: [R('R11', '553–555'), R('R53', '296')],
          notes: {
            teach: [
              'Say that the six-step method is the instructor’s procedure, built on SEBoK’s elicitation and need-writing guidance (R11 pp.553–555) and MITRE’s warning about solutions masquerading as needs (R53 p.296).',
              'Show the draft and ask: what is wrong with it? Take three answers before revealing the labels. Then work the six steps on the board, asking a student to propose each step before you confirm it; about thirty seconds per step, longer on steps 3 and 4.',
              'After step 6, ask the class to check the result against the three layers aloud. Then pose a variant: “What changes if the utility’s concern were outages, not peak load?” (A different concern gives a different need; the method is the same.)',
            ],
            why: 'A worked example before practice is the core of A20, and repairing a bad draft teaches more than showing a finished need. The draft is rejected for real defects (no stakeholder, a solution, requirement wording), never for its word order. Student contributions at each step make it a demonstration students can repeat in the lab an hour later.',
            figure: 'Top: the draft and its three faults. Middle: the four moves. Bottom: NEED-010 with the stakeholder, “needs the air-taxi service to”, the outcome and the condition, then the four tags. Point at the note: the controller is set aside, not thrown away.',
            workedSolution: [
              'Step 1, start from the concern: CON-011, “The electric utility is concerned about simultaneous high-power charging exceeding the agreed connection capacity at a vertiport.” Holder: STK-010.',
              'Step 2, ask why until the answer is an outcome the stakeholder cares about: exceeding the agreed connection trips the protection on the supply or incurs penalty tariffs. That becomes the rationale.',
              'Step 3, remove design and requirement wording. The interview draft, “There is a need for a smart grid controller that must cap charging”, names a solution, uses “must” and has no subject. Set it aside as an option.',
              'Step 4, attribute the need to the registered stakeholder in the recommended form (R11 p.555): “The electric utility needs the air-taxi service to …”. The stakeholder is the subject, and the system of interest is named.',
              `Step 5, state the outcome with no design, and the condition: “… keep the power drawn at each vertiport within the agreed connection capacity.” Condition: ${n10.condition.toLowerCase()}`,
              `Step 6, record: ID NEED-010; name “${n10.name}”; source STK-010 via CON-011; goal ${n10.mgo} (capacity grows only within what the grid allows); rationale; priority ${PRIORITY_LABEL[n10.priority].toLowerCase()} (proposed: the connection agreement binds the service).`,
              'Check against the layers. Form passes: the stakeholder’s perspective, the recommended format naming the system, no “shall”, ID, rationale and source. MITRE: a condition, solution-independent, in the context of a utility agreement; its metric, the agreed capacity in kW, is attached in Week 2. All six course gates pass. Result: NEED-010 exactly as it stands in the reference set.',
            ],
            examples: ['Practice item after class: run the six steps on CON-014 (insurers) and compare with NEED-014 in the reader.'],
            misconceptions: [{ claim: 'The controller in the draft is wrong and should be forgotten.', correction: 'It is a possible solution, set aside until Weeks 2 and 3 analyze how to meet NEED-010.' }],
            transition: 'Done once, the method gives the full reference set. Here it is.',
            timing: '5 min: 1 min the draft and its faults with the class; 3 min six steps with student contributions; 40 s the check; 20 s the variant.',
          },
        },
        {
          id: 's2-worked-needs',
          title: 'Worked example II: the AeroLink reference needs',
          subtitle: `${N_NEED} needs in the recommended form, each traced to a stakeholder, a concern and a goal; priorities proposed (FICTIONAL)`,
          purpose: 'Show the standard teams must meet: the full AeroLink set of needs with source, concern, goal and priority.',
          minutes: 3,
          layout: 'figure',
          figure: {
            id: 'w1s2-needs-catalog',
            caption: `The AeroLink reference needs: ${N_NEED} needs, each with its subject stakeholder, any contributing source, the concern it answers, the goal it serves and a proposed priority. Full statements, conditions and rationales are in the reader. FICTIONAL.`,
            alt: `A table of ${N_NEED} needs with columns ID, short name, subject, contributing source, concern, goal and priority. ${NEEDS.map((n) => `${n.id} ${n.name.toLowerCase()}: ${stakeholder(n.subject).name.toLowerCase()}${n.sources.filter((s) => s.role === 'contributing').map((s) => `, contributing ${stakeholder(s.stakeholder).name.toLowerCase()}`).join('')}, ${n.sources.map((s) => s.concern).join(' and ')}, ${n.mgo}, ${n.priority}`).join('. ')}. Shaded rows were added or had their source corrected; all priorities are proposed.`,
          },
          body: [],
          sources: [R('R11', '554–556'), R('R53', '295–296'), R('R65', '325')],
          notes: {
            teach: [
              'Read three rows in full from the reader table: NEED-003 (the residents, with its two dimensions), NEED-008 (the class of passengers with reduced mobility, with the advocates as a contributing source) and NEED-012 (the city planning authority). For each: statement, condition, rationale, source, goal, priority.',
              'Say how the set is built: every need is in the recommended form naming the air-taxi service (R11 p.555); every subject is a registered stakeholder or class answering its own concern; no need is compound; every need traces to the mission or a goal, as SEBoK expects of the set (R11 pp.554, 556); both approving authorities have needs.',
              `Priorities use MITRE’s categories (R65 p.325) with the course’s definitions: ${PC.mandatory} mandatory, ${PC.critical} critical, ${PC.desirable} desirable, none optional. A set with nothing tradable would be a warning sign.`,
              'Ask the class: which need has the weakest condition? (NEED-006, “at any hour of operation, at every vertiport”: broad, though adequate for a safety need.)',
            ],
            why: 'Students need a complete, credible standard before they write their own, and every choice in it is explainable from the layers just taught.',
            figure: `One row per need: subject, contributing source, concern, goal and priority. Every concern appears except C15, the deliberate gap on the next slide. Shaded rows: + for needs added to the reference, * where the subject or source was corrected. Read the goal column: every need serves the mission or a goal.`,
            examples: ['Why NEED-013 is critical, not mandatory (proposed): overload erodes safety margins, but no approving authority in the case imposes a specific workload limit.', 'Why NEED-016 is critical: the city weighs public-transport access in approving a site, but the case does not make it a hard condition.'],
            misconceptions: [{ claim: 'Every need should be mandatory to be safe.', correction: 'MITRE asks the engineer to point out inappropriate priorities (R65 p.325); a set with everything mandatory cannot be traded.' }],
            transition: 'A set is not finished when it is written. It has to be audited.',
            timing: '3 min: 1.5 min three rows in full; 1 min how the set is built and the priorities; 30 s the class question.',
          },
        },
        {
          id: 's2-worked-audit',
          title: 'Worked example III: auditing coverage and conflict',
          subtitle: 'One deliberate gap, STK-011: defensible only once its reason is recorded',
          purpose: 'Evaluate a set: coverage of stakeholders and concerns, approving authorities and conflicts, with students finding the second tension; teach that a gap must carry a recorded reason.',
          minutes: 4,
          layout: 'figure',
          figure: {
            id: 'w1s2-coverage-matrix',
            caption: `Coverage audit of the reference set: ${N_STK} stakeholders by ${N_NEED} needs. One gap is kept on purpose: STK-011, whose concern is a purchase-agreement matter. FICTIONAL.`,
            alt: `A matrix with the ${W(N_STK)} stakeholders as rows and NEED-001 to NEED-${String(N_NEED).padStart(3, '0')} as columns. Filled squares mark the subject of each need and outlined squares mark contributing sources. Passengers are the subject of 001, 011, 015 and 017 and contribute to 002; the city planning authority is the subject of 012 and 016; passengers with reduced mobility are the subject of 008, to which the accessibility advocates contribute; every other stakeholder has one need. The approving authorities are marked AA. The row for STK-011 Manufacturer (OEM) is empty, highlighted with a dashed outline and labeled gap (deliberate). A note reads: STK-011, no need; CON-015 (orders, delivery slots, payment milestones) is a purchase-agreement matter, recorded with its reason. A legend says ${TRACED} of ${N_STK} stakeholders are traced and both approving authorities are covered.`,
          },
          body: [],
          sources: [R('R11', '551–553'), R('R53', '297')],
          notes: {
            teach: [
              'Explain the instrument: one row per stakeholder, one column per need; filled for the subject, outlined for a contributing source.',
              `Run three checks aloud. Coverage: ${TRACED} of ${N_STK} stakeholders have a need. Approving authorities: both covered (R11 p.553). Concerns: all but CON-015.`,
              `The deliberate gap: ${DELIBERATE_GAP.why}`,
              `Invite the counter-argument and give the model answer: ${DELIBERATE_GAP.debate}`,
              'Now the conflict half. Ask pairs (one minute): besides REL-002, which two needs pull against each other? Expected answer: NEED-005 (capacity grows with demand) against NEED-010 (power within the fixed connection). Ask what the team should do: record it, and decide whether it needs a relationship entry between the investors and the utility.',
              'Why it matters: leaving out a relevant stakeholder often leads to missing needs and failed validation (R11 p.552); needs driven by a subset of stakeholders miss key capabilities (R53 p.297).',
            ],
            why: 'Evaluating a set is a higher-order skill than writing one need. Students who find the second tension themselves learn the audit as a method; the reasoned gap teaches the difference between a defect and a decision.',
            figure: 'Scan down the columns: every need has exactly one subject. Across the rows: the passengers have several needs, the city planning authority two, and one row is empty and dashed, STK-011. Read the note under the matrix. Ask what the matrix cannot show: whether each need is any good.',
            examples: ['A gap that would not be defensible: an approving authority with no need. No reason could justify it, because the authority can stop the system.'],
            misconceptions: [
              { claim: 'A complete audit means every stakeholder has a need.', correction: 'Coverage is a question, not a quota: each gap needs either a new need or a recorded reason.' },
              { claim: 'The coverage matrix proves the needs are good.', correction: 'It tests completeness of trace only; quality is judged against the layers (slide 9).' },
            ],
            transition: 'These IDs do not stay in Week 1. Before your team starts its own, one slide on why each method exists and what it feeds.',
            timing: '4 min: 30 s the instrument; 1 min three checks; 1 min the gap and the counter-argument; 1 min pairs find the second tension; 30 s why it matters.',
          },
        },
        {
          id: 's2-why-methods',
          title: 'Why each method, and what it feeds',
          subtitle: 'Seven methods this week; each one hands something to Week 2 or to the Week 8 model',
          purpose: 'Make the why of every Week 1 method explicit before the lab: what it protects against, and what Week 2 (ConOps, requirements) and Week 8 (the SysML v2 model import) read from it.',
          minutes: 2,
          layout: 'figure',
          figure: {
            id: 'w1s2-methods-why',
            caption: 'The seven Week 1 methods: why each is done (sourced in the notes) and what it feeds downstream (course design).',
            alt: `A table of seven rows and three columns, method, why we do it, and what it feeds in Week 2 and Week 8. ${WEEK1_METHODS.map((m) => `${m.method}: ${m.whyShort}; feeds ${m.feedsShort}`).join('. ')}. The last two rows, taught in Session 2, are shaded.`,
          },
          body: [],
          sources: [R('R11', '552–555'), R('R96', '986'), R('R63', '236–237')],
          notes: {
            teach: [
              'Read the table top to bottom, one sentence per row; students say the “feeds” column back for two rows of their choice.',
              'Close: the lab is not paperwork. Every part of the Team Record is read again in Week 2 or imported into the Week 8 model, so a vague register or an unstable ID costs the team twice.',
            ],
            why: 'Students follow a method more carefully when they know what it protects against and who reads its output next. This slide states that once for the whole week, in sentences the instructor can say aloud; each method’s own slide carries the same sentence in its notes.',
            figure: 'Left column: the method. Middle: why, each paraphrasing the source cited in the notes of the method’s slide (R11 pp.552–555; R96 p.986; R63 pp.236–237). Right, in accent: what it feeds, which is course design: Week 2 scenarios and requirements, and the Week 8 model inputs.',
            examples: WEEK1_METHODS.map((m) => m.say),
            misconceptions: [{ claim: 'Week 1 artifacts are graded once and then forgotten.', correction: 'Week 2 traces requirements to the NEED IDs and uses the register as scenario actors; Week 8 imports the identifiers as model elements (course design).' }],
            transition: 'Your team now starts its own: the lab brief.',
            timing: '2 min: 1.5 min the seven rows; 30 s students say back two.',
          },
        },
      ],
    },
    // ============================================================================================ lab launch (22 min)
    {
      id: 's2-lab',
      title: 'Laboratory launch',
      slides: [
        {
          id: 's2-lab-brief',
          title: 'Lab L1: what you deliver, and by when',
          subtitle: 'Due before Week 2 Session 1, on the LMS; your own enterprise, never AeroLink',
          purpose: 'Give unambiguous instructions for the Week 1 Team Record: parts, minimums and deadline.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s2-record-parts',
            caption: 'The Week 1 Team Record: five engineering outputs plus the AI-use statement, with their minimums (course convention).',
            alt: `Six boxes in two rows. 1 Charter: roles, tie-break, norms, ID owners. 2 Proposal: problem, mission and goals; system of interest, at least ${MIN.inside} elements inside its boundary (PRT, its parts). 3 Context: at least ${MIN.context} external systems, each exchange and direction. 4 Register: at least ${MIN.stakeholders} stakeholders with concerns; at least ${MIN.relationships} relationships, ${MIN.conflicts} conflict. 5 Needs, highlighted: at least ${MIN.needs} needs from at least ${MIN.needSources} stakeholders, each traced to the mission or a goal, at least 1 approving authority; coverage audit. 6 AI statement, dashed: every AI-suggested item tagged. An arrow leads to a panel: team-NN-week1-record.md plus team-NN-week1-model-inputs.json, one upload on the LMS, before Week 2 Session 1.`,
          },
          body: [{ kind: 'bullets', items: ['Part 2 states the **problem** and the **mission** in one sentence each', 'Needs well formed, each traced to the mission or a goal, with a MITRE priority', 'Feedback before Week 2 Session 2'] }],
          sources: [],
          notes: {
            teach: [
              'Read the six parts and their minimums; all minimums are course conventions from the rubric.',
              'Stress three points: the record is about the team’s own instructor-approved enterprise; Part 2 states the problem and the mission, and every need traces to the mission or a goal; Part 5 needs at least one approving authority and the coverage audit.',
              `Workload: about 2.5 hours per student out of class for the record (10 person-hours for a team of four), within the weekly budget. A PRT is ${PRT_MEANING}, not a partner organization. For three-person teams, announce the needs minimum the faculty has approved; the tool applies the proposed one, ${MIN3.needs} needs from ${MIN3.needSources} stakeholders, which still leaves about 3.1 hours each (flagged for faculty decision).`,
            ],
            why: 'Unambiguous minimums prevent the most common lab failure, careful work on the wrong scope.',
            figure: 'Read the six boxes in order; the highlighted one is the intellectual core. The dashed AI statement is required but is not one of the five engineering outputs. The panel names the two files and the deadline.',
            examples: ['A complete Part 5 entry: NEED ID, statement (recommended form), condition, rationale, goal, priority (mandatory, critical, desirable or optional), source STK and CON, and a self-check of the six minimum checks.'],
            misconceptions: [{ claim: 'We can use AeroLink as our enterprise and adapt the reference data.', correction: 'AeroLink, or a near copy, is not available to teams (course rule, Session 1).' }],
            transition: 'The first part, the charter, starts now.',
            timing: '2 min: 1.5 min the parts; 30 s questions.',
          },
        },
        {
          id: 's2-lab-charter',
          title: 'Team work: roles, a tie-break, a lead candidate',
          subtitle: '8 minutes, in teams; norms and ID owners finished by the end of day 1',
          purpose: 'Run lab step 1 in class with a scope that fits the time: lead roles, the tie-break rule and the lead candidate enterprise; communication norms and ID owners are completed out of class.',
          minutes: 8,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s2-charter-owners',
            caption: 'The charter maps lead roles to what each owns; decision rules and communication norms apply to the whole team (course convention).',
            alt: `Four role boxes: Requirements & Compliance owns STK, CON, NEED; Architecture owns ENT, PRT, EXT, and REL (suggested); AI & Data Management owns the model inputs (JSON) and the AI-use statement; Verification & Validation owns the self-check, coverage audit and final review. A bar beneath: decision rules with a tie-break and communication norms apply to the whole team. Notes: ENT enterprise, PRT ${PRT_SHORT}, EXT external system, REL relationship; in a three-person team, AI & Data Management merges with Architecture.`,
          },
          body: [{ kind: 'bullets', items: ['In class: four lead roles, each a different member', 'In class: decision rules **with a tie-break**', 'In class: your lead candidate enterprise', 'By end of day 1: norms and ID owners'] }],
          sources: [R('R96', '986')],
          notes: {
            teach: [
              'Set a visible 8-minute timer. Teams sit together. SEBoK says the team should have a charter (R96 p.986); the roles, decision rules and ID ownership are course conventions taught in Session 1.',
              'Circulate. At every table check the tie-break rule first: a team of four that splits two against two without one deadlocks. Then check that roles are assigned to different members.',
              'In the last three minutes each team picks its lead candidate enterprise from the members’ pre-work, against the Session 1 criteria, and fills in the pitch card for the next slide.',
            ],
            why: 'Charter disputes and decision-rule ties are best settled with the instructor in the room; limiting the in-class scope to what decides the pitch keeps the 8 minutes realistic.',
            figure: `Four role boxes with what each owns; the bar underneath is shared. Point at REL: Architecture usually takes it, because relationships sit between register and context. PRT is ${PRT_MEANING}: in Week 8 each PRT becomes a part of the system.`,
            examples: ['A workable decision rule (course convention): the artifact’s lead proposes; consensus within one working day; then majority; a tie goes to the instructor.'],
            misconceptions: [{ claim: 'Our team gets on well, so we do not need decision rules.', correction: 'Rules matter when the team disagrees under deadline pressure (course convention; SEBoK says the team should have a charter, R96 p.986).' }],
            transition: 'With roles, a tie-break and a lead candidate, each team now pitches its enterprise.',
            timing: '8 min: 5 min roles and tie-break with the instructor circulating; 3 min lead candidate and pitch card.',
          },
        },
        {
          id: 's2-lab-pitch',
          title: 'Instructor checkpoint: the enterprise pitch',
          subtitle: 'About 90 seconds per team; up to five teams in class, the rest decided within 48 h',
          purpose: 'Run lab step 2: each team pitches its enterprise, problem and mission, system of interest and boundary, names an approving authority and a non-customer stakeholder, and receives a decision.',
          minutes: 10,
          layout: 'figure-bullets',
          figure: {
            id: 'w1s2-pitch-card',
            caption: 'The pitch card: one-sentence statements, two named stakeholders and the instructor’s decision.',
            alt: 'A form titled enterprise pitch, about 90 seconds, with six fill-in lines: 1 enterprise (purpose, participants); 2 problem and mission (one sentence each); 3 system of interest (inside the enterprise); 4 boundary (inside and outside); 5 approving authority (who approves use); 6 non-customer, non-user stakeholder and their concern. Below, three check boxes: approved; with conditions; revise (reason). A note says the decision and its date go into Part 2 of the Team Record.',
          },
          body: [{ kind: 'bullets', items: ['Enterprise, problem and mission, SoI, boundary', 'One approving authority; one non-customer stakeholder', 'Decision: approve, with conditions, or revise', 'More than five teams: card on the LMS, decided in 48 h'] }],
          sources: [R('R11', '553')],
          notes: {
            teach: [
              'Call teams in order; the Architecture lead presents. About 90 seconds per pitch and 30 seconds per decision: five teams fit in ten minutes. Teams beyond five post the card on the LMS and are decided within 48 hours, in a fixed rotation so the same teams are not always last.',
              'Listen for the distinctions taught in Session 1: the enterprise is not the organization, and the system of interest is not the enterprise. Check that the problem and mission are one sentence each and that the mission names a purpose, not a product.',
              'Ask for the approving authority; if there is truly none, the enterprise may be too small (course heuristic; SEBoK requires approving authorities to be identified, R11 p.553). Ask for the non-customer stakeholder: it tests whether the team used more than one method.',
              'Decide aloud: approved; approved with conditions (state them); or revise (state the reason). The team records the decision and date in Part 2.',
            ],
            why: 'Every later week depends on an approved enterprise, and a face-to-face decision prevents a week of work on an enterprise that will be rejected.',
            figure: 'Lines 1 to 4 test the Session 1 system concepts and the mission; lines 5 and 6 test stakeholder identification. The decision boxes are the instructor’s.',
            examples: ['Approved with conditions: “A regional food bank network; problem: food reaches pantries unevenly; system of interest: its distribution service. Condition: name the county health department’s role for food-handling sites, or justify its absence.”', 'Revise: “Our app” as both enterprise and system of interest.'],
            misconceptions: [{ claim: 'The customer is the approving authority.', correction: 'It cannot be assumed (R11 p.553).' }],
            transition: 'Close with the plan for the next seven days.',
            timing: '10 min: about 2 min per team for five teams; more than five teams, the rest by LMS within 48 h.',
          },
        },
        {
          id: 's2-lab-close',
          title: 'Close: the next seven days',
          subtitle: 'Quiz Q1 and the applied exercise open today. Log your hours.',
          purpose: 'Give a work plan and accountability: the out-of-class sequence, the quiz and the applied exercise, and the time log.',
          minutes: 2,
          layout: 'figure',
          figure: {
            id: 'w1s2-seven-days',
            caption: 'A suggested seven-day plan for the Team Record, with the lead role for each task (course convention).',
            alt: 'A timeline of days 1 to 7 with six bars. Days 1 to 2: proposal with problem and mission, and context, Architecture. Days 2 to 3: stakeholder sweep, then merge, everyone with Requirements and Compliance merging. Days 3 to 4: register, concerns and relationships, Requirements and Compliance with Architecture. Days 4 to 5: needs, at least eight from at least five stakeholders including one authority, Requirements and Compliance with everyone writing two. Day 6: self-check, coverage audit and AI statement, Verification and Validation with AI and Data. Day 7: integration review, export and upload, Verification and Validation.',
          },
          body: [],
          sources: [],
          notes: {
            teach: [
              'Walk the plan once; it is a suggestion, and the charter decides. Each member runs one identification method independently before the merge on day 3, so the team can see which stakeholders only one method found.',
              'Assessment: Quiz Q1 (12 items, 15 minutes, individual) and the individual applied exercise (about 40 minutes, an unseen case) open after this session; both are due before Week 2 Session 1. Remind students to log their hours, which test the workload estimate.',
            ],
            why: 'A concrete plan with owners converts a long brief into daily actions and makes individual accountability visible.',
            figure: 'Read the bars left to right: each hand-over overlaps by a day. Day 6 is the audit day: the V&V lead runs the coverage audit exactly as on slide 17.',
            examples: ['If the sweep slips to day 4, cut the register review time, not the needs time.'],
            misconceptions: [{ claim: 'The audit can be done the night before the deadline.', correction: 'The audit often adds needs or relationships, which need time.' }],
            transition: 'End of Week 1. Week 2 opens with your scenarios and the first requirements.',
            timing: '2 min: 1.5 min plan and assessment; 30 s questions.',
          },
        },
        {
          id: 's2-references',
          title: 'References and credits',
          purpose: 'Give the full reference list of every source cited in the session, and the license and use statements those sources require (generated from the citations).',
          minutes: 0,
          layout: 'references',
          body: [],
          sources: [],
          notes: {
            teach: ['Leave this slide up while teams pack up; no commentary is needed. The list is generated from every citation in the session, and the credits include the attribution SEBoK requires for its text.'],
            why: 'Students should be able to find every source the session relied on, and SEBoK’s license requires the attribution statement wherever its text is used.',
            transition: 'End of the deck.',
            timing: '0 min: shown at the close.',
          },
        },
      ],
    },
  ],
  // ============================================================================================== student lesson
  studentLesson: [
    {
      id: 's2-l-concerns',
      title: 'Concerns: the hinge between stakeholders and needs',
      blocks: [
        { kind: 'para', text: `Session 1 ended with a register of ${W(N_STK)} AeroLink stakeholders, each found by at least one of three methods and each placed by interest and influence. A register of names, however complete, tells an engineer little about what to build. The step that connects *who* the stakeholders are to *what* the system must do for them runs through their **concerns**.` },
        { kind: 'para', text: 'The word comes from the third of the four definitions of stakeholder that the SEBoK glossary records, the one taken from ISO/IEC 26702: an individual, team or organization, or classes of them, “with interests in, or concerns relative to, a system” (R39a p.1631). The glossary uses the word but does not define it, and SEBoK’s View principle, which says a complex system needs several views each based on a system aspect or concern, does not define it either (R04 p.275). The definitions in this course’s collection come from the SysML v2 material you will use in Week 8; the specification models a concern as a kind of requirement, and the introduction states it plainly:' },
        { kind: 'definition', term: 'Concern (SysML v2)', text: '“A specific topic that one or more stakeholders desire to be addressed.”', source: R('R77', '115') },
        { kind: 'para', text: 'The definition in ISO/IEC/IEEE 42010, the architecture-description standard most engineers would cite, is not in our collection, so the working meaning used in this course is a **course convention** consistent with the SysML v2 definition. The operative word is *specific*. A concern should be written so that someone else could check it: say what the worry is, for whom, and where or when it bites. “Communities: noise” names a topic and gives a reviewer nothing to check. “Residents near vertiports are concerned about take-off and landing noise, how often it occurs and at what hours” (CON-012) says who, what, where, how often and when.' },
        { kind: 'figure', slide: 's2-concerns-def' },
        { kind: 'para', text: 'A concern is not yet a need. It states the worry; it does not say what the stakeholder needs the system to do about it, under what condition. One concern can lead to several needs, and a few concerns turn out not to be needs on the system of interest at all (the audit below finds one).' },
        { kind: 'heading', text: 'The register as an instrument' },
        { kind: 'para', text: 'SEBoK describes a stakeholder register as one approach to recording stakeholders, holding key information about each stakeholder and how they are involved with the system of interest, and recommends re-evaluating the stakeholder community periodically so that changes in stakeholders and their needs are managed (R11 p.553). MITRE’s stakeholder management adds the interests each group represents, the power it holds, and whether it supports or inhibits the change (R63 p.234). The course register combines the two: a role group, the life-cycle stage of main involvement, internal or external, whether it is an approving authority, its concerns, interest and influence each with a reason, and its level of support with a reason.' },
        { kind: 'para', text: 'Two maps help to read a register. The influence × interest plot of Session 1 is a **course convention**: the classic power–interest grid is not in our collection. MITRE’s map, which plots influence over a change against level of support (awareness, understanding, buy-in, commitment), is sourced, and carries MITRE’s conclusion that “high influencers must be committed advocates” (R63 pp.236–237). For an approving authority, moving it toward commitment never means lobbying: an authority’s support grows only with evidence.' },
        { kind: 'figure', slide: 's2-warmup-reveal' },
        { kind: 'para', text: `Finally, a register should record **relationships** between stakeholders, because a flat list hides dependencies and conflicts. AeroLink records ${W(N_REL)}, of seven kinds; the one conflict, REL-002 between the communities and the vertiport operators, drives the trade discussed under conflicts below.` },
      ],
      sources: [R('R39a', '1631'), R('R04', '275'), R('R77', '115'), R('R11', '553'), R('R63', '234, 236–237')],
    },
    {
      id: 's2-l-needs-reqs',
      title: 'Needs, requirements and the transformation between them',
      blocks: [
        { kind: 'para', text: 'The central distinction of the week is between a **need** and a **requirement**. SEBoK puts it in terms of perspective: stakeholder needs represent the perspective of users, acquirers, customers and other stakeholders, and they are transformed into system requirements, which communicate the developer’s perspective (R11 p.549). The System Requirements Definition article sharpens this into two views. A need expresses what the stakeholder needs the system of interest to do, seen from outside as a black box; a requirement expresses what the system must do, seen from inside as a white box, by the people who will design it (R13 p.558).' },
        { kind: 'figure', slide: 's2-needs-vs-reqs' },
        { kind: 'para', text: 'SEBoK’s coffee-maker example makes the difference concrete (R13 p.558). The user needs the machine to stop heating once the selected temperature is reached; the machine *shall* stop its heating function once the selected brew temperature is reached. The two sentences look alike, which is exactly the danger. The first belongs to the user and states an outcome; the second belongs to the developer and states an obligation on the system that someone will have to verify.' },
        { kind: 'para', text: 'Two glossary entries complete the picture. SEBoK quotes ISO/IEC/IEEE 15288:2023 to the effect that stakeholder needs gather the elicited needs, wants, desires, expectations and perceived constraints of identified stakeholders, and concentrate on system purpose and behavior in the context of the operational environment (R39a p.1632). A system requirement, in the 15288:2015 wording SEBoK records, transforms that user-oriented view into a technical view of a solution (R39l p.1652). A third term causes most of the confusion: *stakeholder requirements*, which 29148 describes as statements transformed from needs into a more formal form. SEBoK treats stakeholder requirements, when a stakeholder imposes them, as one input to the needs work rather than a substitute for it (R39a p.1632; R11 p.551).' },
        { kind: 'heading', text: 'The transformation is analysis' },
        { kind: 'para', text: 'The most damaging misconception at this point is that a requirement is a need with “shall” added. SEBoK is explicit that generating a requirement is more than “changing the subject of the need statement”: it is an analysis of what the system must do to achieve what is needed (R13 p.558). The tools it names are functional analysis, interface analysis, data-flow diagrams, performance analysis and what it calls a “needs to transformation matrix” (R13 p.558). A single need can yield several requirements, each with measurable criteria (R13 p.559), and every requirement represents an engineering decision about what the system must do or what quality it must have (R13 p.557).' },
        { kind: 'figure', slide: 's2-transformation' },
        { kind: 'para', text: `Take NEED-010: “${n10.statement}” Analysis might produce a limit on charging power, a scheduling function that staggers charges when several aircraft arrive together, monitoring of the vertiport’s load, and an alarm with a defined response when the load approaches the limit. A different team might choose differently, which is the point: each is a decision, and Week 2 makes those decisions. Requirements must also suit the level of the system of interest in the architecture and say *what* rather than *how* (R13 p.558), a theme that returns below in the hard case of design words in needs.` },
      ],
      sources: [R('R11', '549, 551'), R('R13', '557–559'), R('R39a', '1632'), R('R39l', '1652')],
    },
    {
      id: 's2-l-integrated-set',
      title: 'The integrated set of needs, and why it is kept',
      blocks: [
        { kind: 'para', text: 'The product of Stakeholder Needs Definition is not a list of statements but an **integrated set of needs**. SEBoK describes it as what results when stakeholder needs are combined with the results of analyzing risks, drivers, constraints and life-cycle concepts (R11 p.549), and stresses that the process is a series of analysis activities, not only elicitation (R11 p.550). Its activities run from identifying further stakeholders to baselining and managing the integrated set (R11 p.552).' },
        { kind: 'figure', slide: 's2-integrated-set' },
        { kind: 'para', text: `**Drivers and constraints** are things outside the project’s control that drive or constrain the solution space: design and production constraints, standards, human factors, regulations, the operating environment, existing systems, technology maturity, cost and schedule (R11 p.554). For AeroLink the noise agreement (${NOISE_AGREEMENT.perEvent.replace(' (Data Sheet)', '')}, plus a cap on evening and early-morning events) and each grid connection are such constraints. **Risks** are anything that could prevent delivery of a successful system or its intended use; SEBoK warns that failing to address them produces an incomplete set of needs and a system that will fail validation (R11 p.554). A battery fire on a pad is such a risk, and NEED-006 is its trace. **Life-cycle concepts**, matured with models, expose needs that no one stated: writing the weather-disruption scenario exposed NEED-011.` },
        { kind: 'para', text: 'Across the set, SEBoK expects needs that reflect the mission, goals and measures, and that state expected functionality, expected performance and quality (“how well”), the conditions of action, and compliance with standards and regulations (R11 p.554). The set as a whole must be **correct, consistent, complete and feasible** (R11 p.551). It defines the scope that the organization agrees to resource, and it is the reference against which the requirements, the design and the realized system are validated (R11 pp.551, 555).' },
        { kind: 'heading', text: 'Why the needs must survive' },
        { kind: 'para', text: 'Because the set is the validation reference, it cannot be archived once the requirements are written. The realized system is verified against the requirements (R23a p.634) and validated against the needs. SEBoK also separates two checks on the requirements themselves: *requirement verification* asks whether they are well formed against the organization’s rules; *requirement validation* asks whether they are the right requirements, faithful to the needs and other sources they came from (R13 p.566). The second question cannot be asked if the needs are gone. The DoD guidebook names the cost of skimping on this work: requirements creep, rework caused by misunderstood end-user needs, unexpected contract modifications, cost growth and schedule slip (R48a p.141).' },
        { kind: 'figure', slide: 's2-why-keep' },
      ],
      sources: [R('R11', '549–552, 554–555'), R('R23a', '634'), R('R13', '566'), R('R48a', '141')],
    },
    {
      id: 's2-l-well-formed',
      title: 'Well-formed needs: three layers of quality',
      blocks: [
        { kind: 'para', text: 'What makes a need well formed? This course answers from three sourced layers rather than from a single checklist, and keeps its own six checks as a minimum gate.' },
        { kind: 'para', text: '**Layer 1, statement form (SEBoK).** Needs are written in structured natural language from the perspective of what the stakeholders need the system of interest to do. They avoid “shall” or any other word that marks a requirement, and SEBoK recommends that need statements use a format different from requirements, “such as” “The stakeholders need the system to …” (R11 p.555); its example table gives each need an identifier, a name, the statement, a rationale and a source. This course **recommends** that form, with the stakeholder as subject and the system of interest named: “The electric utility needs the air-taxi service to keep the power drawn at each vertiport within the agreed connection capacity.” Naming the system keeps the stakeholder’s outside view and says which system the need is validated against. The form is a recommendation, not a gate: “Hospital dispatchers need blood units delivered within 30 minutes of a request” is valid, because it names a stakeholder and an outcome and is neither a requirement nor a solution; the lab tool accepts it with a note.' },
        { kind: 'para', text: '**Layer 2, content attributes (MITRE).** MITRE’s operational needs assessment lists six attributes a need statement should have (R53 p.296). (1) *Enterprise and operational context*: consider the need in the context of related enterprise capabilities. (2) *Complete, end-to-end need*: MITRE’s example contrasts “detect, identify, and defeat” with “detect” alone; AeroLink’s NEED-006 asks for early warning *and* safe access. (3) *Conditions or scenario* under which the need exists. (4) *Attributes and metrics*: quantifiable metrics for how much, how well, how often and how quickly, tied to mission goals. (5) *Growth and extensibility*. (6) *Independence of solution approach*: a need stated as a solution forecloses better approaches. MITRE adds two lessons: state needs unambiguously, since key attributes and metrics are frequently missing or ambiguous, and “beware solutions masquerading as needs” (R53 pp.296–297).' },
        { kind: 'para', text: '**Where measures fit.** Needs are not merely qualitative: MITRE says operational needs must be defined and quantified and asks the engineer to consider quantifiable metrics (R53 pp.295–296), and SEBoK expects the set to state the “how well” (R11 p.554). This course attaches the measures in Week 2, a sequencing convention, not a property of needs; a Week 1 need already names what will be measured.' },
        { kind: 'para', text: '**Layer 3, the set test (SEBoK).** The integrated set must be correct, consistent, complete and feasible (R11 p.551). These properties are tested primarily on the set, by audits such as the coverage matrix below, but SEBoK applies correctness, completeness and consistency to individual needs as well (R11 p.554).' },
        { kind: 'figure', slide: 's2-well-formed' },
        { kind: 'para', text: '**Singular or end to end?** SEBoK’s requirement characteristics, which govern Week 2, include singular (R23a p.635), and the same discipline helps needs. MITRE’s end-to-end attribute is not a license for compound statements. Course guidance: a need is end to end when its parts make one outcome the stakeholder would not accept in part (early warning of a fire without safe access is no response); it is compound, and should be split, when its parts could be agreed, traded or dropped separately. The city planning authority’s zoning conformance and its public-transport connection are therefore two needs, NEED-012 and NEED-016, and the passengers’ fare known in advance and fare competitive with the alternatives are NEED-015 and NEED-017.' },
        { kind: 'callout', tone: 'note', title: 'Course convention: the minimum gate', text: `Six checks every need in the Team Record must pass: ${NEED_GATE_TEXT}. The recommended form is “${NEED_FORM}”; another phrasing passes when it names the stakeholder and the outcome and is neither a requirement nor a solution. The checks are a floor, not the definition of quality.` },
        { kind: 'callout', tone: 'caution', title: 'Source gap', text: 'INCOSE’s characteristics of well-formed needs and requirements (in its Needs and Requirements Manual and Guide to Writing Requirements) are cited by SEBoK but are not in the course collection. This course therefore teaches from SEBoK and MITRE.' },
        { kind: 'heading', text: 'Reading a need, and the level problem' },
        { kind: 'para', text: `NEED-003 reads: “${n3.statement}” Its parts are the stakeholder (who), the verb *need* with the system of interest, what they need with no design named, and the condition (“${n3.condition.replace(/\.$/, '').toLowerCase()}”). The identifier, source (STK-004 via CON-012), goal (${n3.mgo}) and rationale travel with it.` },
        { kind: 'figure', slide: 's2-anatomy' },
        { kind: 'para', text: 'The hard case is the design word. SEBoK’s own example table includes needs for two temperature settings and four colors of coffee maker, which look like features (R11 p.555). They are legitimate at the level of a consumer product whose marketing stakeholder needs a color range. SEBoK’s rule that requirements suit the level of the system of interest in the architecture (R13 p.558), applied here to needs, explains why: whether a statement is solution-laden depends on the level you have chosen and on genuine constraints. The **course rule** is that a design term may stay in a need only when the team justifies it as a constraint, such as the noise limits the city agreement imposes; otherwise, ask why until the design term disappears.' },
      ],
      sources: [R('R11', '551, 554–555'), R('R53', '295–297'), R('R23a', '635'), R('R13', '558')],
    },
    {
      id: 's2-l-elicitation',
      title: 'Elicitation as a method choice',
      blocks: [
        { kind: 'para', text: 'Elicitation is the activity in which the project team engages stakeholders to understand their needs for every life-cycle stage. SEBoK recommends considering several techniques so as to suit a diverse set of sources: structured brainstorming workshops; interviews and questionnaires; workshops or focus groups; visual and descriptive content about the system of interest; technical, operational or strategy documentation review; and feedback from the System Verification and System Validation processes (R11 p.553). MITRE’s list overlaps and adds direct observation and prototyping, notes that passive observation is often time well spent, and calls joint sessions of users, developers, integrators and systems engineers frequently one of the most powerful techniques. MITRE also names the factors that should drive the choice: project size and type, complexity, schedule, the number of interviewees and their locations (R65 p.324).' },
        { kind: 'figure', slide: 's2-elicitation' },
        { kind: 'para', text: 'The selection matrix rates each technique against five factors. The ratings are the instructor’s judgment, a **course convention**, and you may argue with them; the technique lists and the selection factors are sourced. A brainstorming workshop defers judgment, so it is weak for depth and contested topics; a focus group discusses experience in depth. The useful habit is to ask, for each stakeholder, what you most need from them (reach across many people, depth from a few, access to tacit know-how, or candor on a contested topic) and to choose accordingly.' },
        elicitationTable,
        { kind: 'para', text: 'Interviews deserve technique of their own. MITRE’s stakeholder assessment recommends combining open-ended and Likert-scaled questions, asking follow-up questions that draw out specific examples and how the stakeholder formed an opinion, keeping detailed notes and analyzing them for themes (R63 pp.235–236). When the real end users cannot be reached, MITRE suggests a user surrogate with recent operational experience (R53 p.296).' },
        { kind: 'heading', text: 'What to ask, and the question that matters most' },
        { kind: 'para', text: 'SEBoK lists the topics to cover: feedback on the Business or Mission Analysis outputs; the life-cycle stages the stakeholder represents and their role; expected and off-nominal use cases, misuse cases and loss scenarios; desired capabilities and functions; interactions with external systems; quality and the “-ilities”; risks and hazards; the rationale for each need; and the criticality and relative priority of everything asked for. One sentence on that page is worth memorizing: providing rationale often reveals the real need, especially when the stakeholder expresses a need as an implementation (R11 p.553).' },
        { kind: 'figure', slide: 's2-real-need' },
        { kind: 'para', text: 'MITRE makes the same point from the engineer’s side: before collecting requirements, determine the root cause, separate real from perceived needs, and state the problem in an implementation-independent manner (R65 p.322). Users often express needs as solutions because of marketing, familiarity with a particular approach, or a preference driven by unstated or unrecognized aspects of the need, such as political or economic ones (R53 p.296). On AeroLink, residents who ask for sound barriers are telling you that late and early take-offs wake them; asking why once more reaches their outcome, rest and home life not disrupted by noise, above all at night. The city agreement is a constraint around that outcome (R11 p.554), not the outcome itself. The set records the outcome, bounded by the agreement, as NEED-003; the barrier survives only as one option for the Week 3 trade study.' },
      ],
      sources: [R('R11', '553–554'), R('R65', '322, 324'), R('R63', '235–236'), R('R53', '296')],
    },
    {
      id: 's2-l-conflict',
      title: 'Conflict, priority and adjudication',
      blocks: [
        { kind: 'para', text: 'Ask enough stakeholders why, and their needs will pull against each other. That is normal. SEBoK’s Business or Mission Analysis article observes that business and user perspectives can produce different goals and measures that conflict, price against profitability against market share, and that they must be prioritized against the enterprise strategy (R10 p.546).' },
        { kind: 'para', text: 'The first rule is to **record both sides**. The integrated set must end up consistent (R11 p.551), but consistency is reached by trade and agreement, not by quietly deleting the weaker need; deleting it drops a stakeholder’s need and recreates the failure SEBoK warns about when a relevant stakeholder is left out (R11 p.552). The second rule is that **priority is elicited**: SEBoK asks stakeholders for the criticality and relative priority of what they ask for, and observes that some needs are nice-to-haves they can live without under budget or schedule pressure (R11 p.553).' },
        { kind: 'para', text: 'MITRE’s requirements practice supplies the categories and the procedure (R65 p.325). Stakeholders assign priorities and will differ about what is mandatory, critical, desirable or optional; the engineer defines each category, points out inappropriate priorities and suggests changes; prioritization ends when the stakeholders reach agreement. MITRE also advises an adjudication protocol agreed early, and escalation of unresolved conflicts to the customer or sponsor. MITRE writes this for requirements; this course applies it to needs as a **course convention**, with the definitions below. MITRE’s “high, medium, or low” on that page is for business value, not priority; the course uses only the four categories. The DoD guidebook makes the same move for stakeholder requirements: negotiate modifications with stakeholders to resolve discrepancies (R48a p.142).' },
        priorityTable,
        { kind: 'heading', text: 'AeroLink: noise against throughput' },
        { kind: 'para', text: `AeroLink records one conflict, REL-002, between the communities (STK-004) and the vertiport operators (STK-005): noise and siting against throughput. In the needs it appears as ${CONFLICT.needsA.join(' and ')} against ${CONFLICT.needB}. The shared variable is ${CONFLICT.sharedVariable}. ${CONFLICT.why} ${CONFLICT.priorityReading}` },
        { kind: 'para', text: 'The conflict depends on how NEED-003 is written: a bound on the loudness of each event alone would not trade against departures; the bound on evening and early-morning events, from CON-012, does.' },
        { kind: 'figure', slide: 's2-conflict' },
        { kind: 'steps', items: CONFLICT.protocol.map((p) => ({ label: p.step, text: p.text })) },
        { kind: 'para', text: `The protocol steps are the course’s application of MITRE’s advice, not a MITRE procedure. A second tension is not yet recorded as a relationship: ${SECOND_TENSION.needs.join(' against ')}, ${SECOND_TENSION.text.charAt(0).toLowerCase()}${SECOND_TENSION.text.slice(1)} Every team records at least one conflict and the protocol it will use (course convention).` },
      ],
      sources: [R('R10', '546'), R('R11', '551–553'), R('R65', '325'), R('R48a', '142')],
    },
    {
      id: 's2-l-errors',
      title: 'Ten common errors, and their corrections',
      blocks: [
        {
          kind: 'table',
          header: ['Error', 'Correction', 'Basis'],
          rows: [
            ['Stakeholders are only customers and users', 'Sweep every life-cycle stage; identify approving authorities deliberately', 'R11 pp.552–553'],
            ['Everything in the context diagram is a stakeholder', 'Systems are not stakeholders; their owners or operators may be', 'R39a p.1631 (inferred from the definitions)'],
            ['A need is a requirement written informally', 'Needs are the stakeholder’s black-box view; requirements are transformed from them by analysis', 'R11 pp.549, 555; R13 p.558'],
            ['A solution masquerading as a need', 'Ask why until the outcome appears; record the solution as an option', 'R53 p.296; R11 p.553'],
            ['A need with no condition or scenario', 'State the conditions under which the need exists', 'R53 p.296; R11 p.554'],
            ['Needs driven by a subset of stakeholders', 'Take every key stakeholder’s needs into account; audit coverage', 'R53 p.297'],
            ['Deleting the weaker of two conflicting needs', 'Record both; resolve by trade and agreement', 'R11 p.551; R65 p.325'],
            ['A generic concern (“wants safety”)', 'Say what, for whom, and where or when it bites', 'Course rule'],
            ['A rating without a reason', 'Every rating carries a reason a reviewer can challenge', 'Course rule'],
            ['No approving authority in the register', 'Ask who must certify, qualify or approve the system for use', 'R11 p.553'],
          ],
        },
        { kind: 'figure', slide: 's2-errors' },
      ],
      sources: [R('R11', '549, 551–555'), R('R39a', '1631'), R('R13', '558'), R('R53', '296–297'), R('R65', '325')],
    },
    {
      id: 's2-l-case-register',
      title: 'The AeroLink case: context and register',
      blocks: [
        { kind: 'callout', tone: 'caution', title: 'FICTIONAL case', text: 'AeroLink Urban Mobility is fictional. Every number, rating and statement is a teaching value. Values marked proposed are instructor additions awaiting faculty confirmation.' },
        ...caseContext,
        { kind: 'para', text: 'The system of interest is distinct from the enterprise: it holds what AeroLink controls and, at the wider level SEBoK allows for a service, the operators’ pads and chargers and passenger demand (R92 p.327). The audit shows one concern that belongs to the enterprise’s agreements instead.' },
        contextTable,
        { kind: 'heading', text: 'The register' },
        registerTable,
        ratingsTable,
        { kind: 'para', text: 'The support levels use MITRE’s scale and are proposed values (R63 pp.236–237). Notice the zone they reveal: seven stakeholders with influence 4 or 5 are below commitment, including both approving authorities and the communities. Each concern listed in the register is given in full below.' },
        concernTable,
        { kind: 'heading', text: 'Relationships' },
        relationshipTable,
        { kind: 'figure', slide: 's2-register' },
      ],
      sources: [R('R11', '552–553'), R('R63', '234, 236–237'), R('R92', '327')],
    },
    {
      id: 's2-l-case-needs',
      title: 'The AeroLink case: from concern to need, and the reference set',
      blocks: [
        { kind: 'heading', text: 'Worked example: CON-011 to NEED-010 in six steps' },
        { kind: 'para', text: 'The procedure below is the instructor’s, built on SEBoK’s elicitation and need-writing guidance (R11 pp.553–555) and on MITRE’s warning about solutions masquerading as needs (R53 p.296). Use it in the lab.' },
        {
          kind: 'steps',
          items: [
            { label: 'Start from the concern', text: 'CON-011, held by STK-010: simultaneous high-power charging exceeding the agreed connection capacity at a vertiport.' },
            { label: 'Ask why', text: 'Until the answer is an outcome the stakeholder cares about: exceeding the agreed connection trips protection or incurs penalty tariffs. That becomes the rationale.' },
            { label: 'Strip design and requirement wording', text: 'The interview draft, “There is a need for a smart grid controller that must cap charging”, names a solution, uses “must” and has no subject. Set it aside as an option.' },
            { label: 'Attribute', text: 'Name the registered stakeholder, here in the recommended form (R11 p.555): “The electric utility needs the air-taxi service to …”.' },
            { label: 'State the need and its condition', text: `“… keep the power drawn at each vertiport within the agreed connection capacity.” Condition: ${n10.condition.toLowerCase()}` },
            { label: 'Record and check', text: `ID NEED-010, name, source STK-010 via CON-011, goal ${n10.mgo}, rationale, priority (mandatory, proposed); check the form, MITRE’s attributes and the six minimum checks.` },
          ],
        },
        { kind: 'figure', slide: 's2-worked-steps' },
        { kind: 'heading', text: 'The reference set' },
        { kind: 'para', text: `The AeroLink reference set has ${W(N_NEED)} needs, each in the recommended form with the stakeholder as subject and the system of interest named (R11 p.555), none compound, each traced to the mission or a goal (R11 pp.554, 556). The passengers contribute to the FAA’s NEED-002 through their safety concern; the accessibility advocates contribute to NEED-008, which belongs to the class “passengers with reduced mobility” (STK-015). Priorities (R65 p.325): ${PC.mandatory} mandatory, ${PC.critical} critical, ${PC.desirable} desirable, none optional.` },
        { kind: 'figure', slide: 's2-worked-needs' },
        needsTable,
      ],
      sources: [R('R11', '553–556'), R('R53', '295–296'), R('R65', '325')],
    },
    {
      id: 's2-l-case-audit',
      title: 'The AeroLink case: auditing the set',
      blocks: [
        { kind: 'para', text: 'A set of needs is not finished when it has been written; it has to be audited. The coverage audit asks three questions of the stakeholder-by-need matrix. Does every stakeholder have at least one need traced to it, as subject or contributing source? Does every approving authority? Does every concern have a need that answers it? Leaving out a relevant stakeholder often results in missing needs and a failure to pass system validation (R11 p.552), and needs driven by a subset of stakeholders miss key capability needs (R53 p.297); the audit is a test of the completeness SEBoK requires of the set (R11 p.551).' },
        { kind: 'figure', slide: 's2-worked-audit' },
        coverageTable,
        { kind: 'callout', tone: 'key', title: 'The deliberate gap', text: `${DELIBERATE_GAP.finding} ${DELIBERATE_GAP.why}` },
        { kind: 'para', text: `${DELIBERATE_GAP.debate} ${DELIBERATE_GAP.teaching}` },
        { kind: 'para', text: `The conflict half of the audit finds the recorded conflict (${CONFLICT.needsA.join(' and ')} against ${CONFLICT.needB}, REL-002) and one that is not yet recorded: ${SECOND_TENSION.needs.join(' against ')}. A complete audit records the second tension and decides whether it deserves a relationship entry between the investors and the utility.` },
        { kind: 'para', text: 'In the lab, run the same audit on your own set: for every stakeholder without a need, either add a need or record why its concern is not a need on the system of interest.' },
      ],
      sources: [R('R11', '551–553'), R('R53', '297')],
    },
    {
      id: 's2-l-why-methods',
      title: 'Why each method, and what it feeds',
      blocks: [
        { kind: 'para', text: 'Each method protects against a specific failure and hands something to Week 2 (scenarios, ConOps, requirements traced by NEED ID) or to the Week 8 model import.' },
        {
          kind: 'table',
          caption: 'The seven Week 1 methods. The “why” paraphrases the source given; the “feeds” column is course design (W2 = Week 2, W8 = the Week 8 model).',
          header: ['Method', 'Why we do it', 'What it feeds'],
          rows: WEEK1_METHODS.map((m) => [m.method, `${m.whyShort}${m.cite ? ` (${m.cite.reading} p.${m.cite.pages})` : ''}`, m.feedsShort]),
        },
        { kind: 'figure', slide: 's2-why-methods' },
      ],
      sources: [R('R11', '552–555'), R('R96', '986'), R('R63', '236–237')],
    },
    {
      id: 's2-l-bridge',
      title: 'Toward Week 2 and Week 8',
      blocks: [
        { kind: 'para', text: 'In Week 2 you write operational scenarios and a concept of operations. SEBoK’s glossary describes an operational concept as a verbal and graphic statement of an organization’s assumptions or intent regarding an operation or series of operations (R39g p.1579); MITRE describes a concept of operations as a user-oriented document that describes system characteristics from the user’s perspective (R52 p.298). Requirements are then transformed from your needs and traced to them by NEED ID (R13 pp.557–559). Expect scenarios to expose needs you missed: AeroLink’s NEED-011 was found by writing the weather-disruption scenario.' },
        { kind: 'para', text: 'In Week 8 the same identifiers become model elements. In SysML v2 a stakeholder is a person, organization or other entity with concerns to be addressed, and a concern is a specific topic that one or more stakeholders desire to be addressed; a requirement or a viewpoint can frame concerns (R77 pp.115–116). Each STK becomes a part definition used as a stakeholder, and each CON becomes a concern with its subject and stakeholders. If a team renumbers its stakeholders later, every trace from requirements and every model element breaks: the IDs are engineering data.' },
        {
          kind: 'figure',
          figure: {
            id: 'w1s2-trace-lanes',
            caption: 'One trace across three weeks: STK-010 → CON-011 → NEED-010 (Week 1), a requirement traced to NEED-010 and the charging scenario (Week 2), and a SysML v2 concern with its stakeholder (Week 8). The snippet is original and minimal.',
            alt: 'Three horizontal lanes. Week 1, stakeholders and needs: STK-010 Electric utility, arrow to CON-011 Peak grid load, arrow to a highlighted NEED-010 Charging load within the grid connection. Week 2, ConOps and requirements: SCN-003 Aircraft Charging and a dashed box REQ-? (to be written) traced to NEED-010, with an arrow from NEED-010 labeled transformed. Week 8, SysML v2 model: a code box reading part def ‘Electric utility’; concern ‘peak grid load’ { subject airTaxiService; stakeholder utility : ‘Electric utility’; }, with a dashed arrow from CON-011, and a note: the IDs recorded this week become model elements, STK to part def, CON to concern.',
          },
        },
      ],
      sources: [R('R39g', '1579'), R('R52', '298'), R('R13', '557–559'), R('R77', '115–116')],
    },
    {
      id: 's2-l-lab',
      title: 'Lab L1: the Week 1 Team Record',
      blocks: [
        { kind: 'para', text: 'The laboratory applies everything above to your team’s own instructor-approved enterprise, never to AeroLink. The Team Record has five engineering outputs and an AI-use statement; the brief below gives every minimum. Two are new this week: the proposal states the problem and the mission in one sentence each, and every need, preferably in the recommended form, traces to the mission or a goal.' },
        { kind: 'figure', slide: 's2-lab-brief' },
        { kind: 'figure', slide: 's2-lab-close' },
        { kind: 'para', text: 'Work in the order the plan shows. Each member runs one stakeholder identification method independently before the team merges the results, so that you can see which stakeholders only one method found. Write needs with the six-step method, check each against the three layers and the six minimum checks, trace each to your mission or a goal, give each a priority in MITRE’s categories (mandatory, critical, desirable or optional), and record at least one conflict with the protocol you will use. The V&V lead runs the coverage audit on day 6. Upload the Markdown record and the JSON model inputs before Week 2 Session 1, and log your hours.' },
      ],
      sources: [R('R96', '986')],
    },
  ],
}

// ------------------------------------------------------------------------------------------------ the week's references and credits
/** The closing reader section for the week: every register entry cited in either session (generated, merged per entry)
 *  and the license and use statements of the sources (src/content/lectures/references.ts). */
function referencesSection(lectures: Lecture[]): LessonSection {
  return {
    id: 's2-l-references',
    title: 'References and credits for Week 1',
    blocks: [
      { kind: 'para', text: 'Every source cited in Week 1, with the pages cited (generated from the citations).' },
      { kind: 'bullets', items: lectureReferences(lectures).map(formatReference) },
      { kind: 'heading', text: 'Credits and licenses' },
      { kind: 'bullets', items: lectureCredits(lectures) },
    ],
    sources: [],
  }
}
WEEK1_SESSION2.studentLesson.push(referencesSection([WEEK01_SESSION1, WEEK1_SESSION2]))

/** Shorthand for a citation. */
function R(reading: string, pages: string) {
  return { reading, pages }
}
