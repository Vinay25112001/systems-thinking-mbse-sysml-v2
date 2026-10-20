// Lab L4, the Week 4 Team Record: the full laboratory instructions, single source for the Week 4 Laboratory page and
// docs/lectures/week04/WEEK4_LAB_INSTRUCTIONS.md (labMarkdown(), written by `npm run lab:md`; week04Lab.test.ts fails
// when the file and this module differ). Mirrors src/content/lab/week03Lab.ts.
//
// Single sources: the minimums, the view kinds, the allocation criteria, the hard gates and advisories, the consistency
// checks and the person-hours come from src/content/lectures/week04/labBrief.ts (the same module the lab tool,
// src/workbench/week4/record.ts, checks against); the in-class minutes are read from the Session 2 slides; the rubric rows
// from the rubric register (getRubric). "Taught in" references are computed from the registered lectures by slide id.
// Review status: new-pending-review. AeroLink is FICTIONAL and is the instructor's worked example; the record is always
// about the team's own enterprise.
import { WEEKS } from '../course'
import { formatCitation, type Citation } from '../readings'
import { getRubric } from '../rubrics'
import { getLecture } from '../lectures'
import { allSlides } from '../lectures/text'
import { PENDING, type NewText } from '../learn/types'
import {
  AI_GATES, ALLOCATION_CRITERIA, ALLOCATION_GATES, CONSISTENCY_CHECKS, DECISION_GATES, FUNCTION_ADVISORIES, FUNCTION_GATES, INFO_ADVISORIES, INFO_GATES, LAB4_MINIMUMS as MIN, LAB4_MINIMUMS_THREE as MIN3,
  LAB4_PERSON_HOURS, LAB4_TEAM_HOURS, REQUIRED_VIEW_KINDS, VIEWPOINT_ADVISORIES, VIEWPOINT_GATES, WEEK4_PARTS, viewKindLabel,
} from '../lectures/week04/labBrief'

const n = (text: string): NewText => ({ text, review: PENDING })
const W4 = WEEKS[3]
const round1 = (x: number) => Math.round(x * 10) / 10

export const LAB_REVIEW = PENDING
export const LAB_TITLE = 'Lab L4: the architecture description and information view of your enterprise'

// ------------------------------------------------------------------------------------------- taught in
/** “Session N, slide M ‘title’”, read from the registered lecture by slide id; the fallback is used only while the
 *  lecture is not registered or the slide id is missing. */
export function taughtIn(session: 1 | 2, slideId: string, fallback: { slide: number; title: string }): string {
  const l = getLecture(4, session)
  if (l) {
    const slides = allSlides(l)
    const i = slides.findIndex((s) => s.id === slideId)
    if (i >= 0) return `Session ${session}, slide ${i + 1} ‘${slides[i].title}’`
  }
  return `Session ${session}, slide ${fallback.slide} ‘${fallback.title}’`
}
const t1 = (id: string, slide: number, title: string) => taughtIn(1, id, { slide, title })
const t2 = (id: string, slide: number, title: string) => taughtIn(2, id, { slide, title })

// ------------------------------------------------------------------------------------------- in-class minutes, readings
const labSection = getLecture(4, 2)?.sections.find((s) => s.id === 'w4s2-lab')
const labMin = (id: string, fallback: number) => labSection?.slides.find((s) => s.id === id)?.minutes ?? fallback
/** The in-class lab minutes, read from the Session 2 slides. */
export const S2_LAB = {
  total: labSection ? labSection.slides.reduce((a, s) => a + s.minutes, 0) : 22,
  brief: labMin('w4s2-lab-brief', 3),
  views: labMin('w4s2-lab-views', 10),
  check: labMin('w4s2-lab-check', 7),
  close: labMin('w4s2-lab-close', 2),
  checkTeams: 4,
}

/** Essential readings for the week, narrowed to the pages the lecture teaches from (16 pages). */
export const LAB4_REQUIRED_READINGS: Citation[] = [
  { reading: 'R19', pages: '569–571' },
  { reading: 'R19', pages: '573' },
  { reading: 'R62', pages: '341–345' },
  { reading: 'R20b', pages: '587' },
  { reading: 'R20b', pages: '594' },
  { reading: 'R20c', pages: '598–599' },
  { reading: 'R21', pages: '510–512' },
]
/** Further reading (not required; the basis of the graduate task). */
export const LAB4_EXTENSION_READINGS: Citation[] = [
  { reading: 'R20a', pages: '580–582' },
  { reading: 'R48c', pages: '144–146' },
  { reading: 'R66', pages: '111–113' },
  { reading: 'R31', pages: '1370–1371' },
  { reading: 'R56', pages: '384–388' },
  { reading: 'R39t', pages: '1445' },
  { reading: 'R39w', pages: '1678' },
]
export const LAB4_DUE = 'Before Week 5, Session 1'
export const LAB4_WHERE = 'LMS assignment “Week 4 Team Record”'

// ------------------------------------------------------------------------------------------- workload
/** A three-person team at the reduced minimums (A21 provisional decision 4, pending confirmation). */
export const LAB4_THREE_PERSON = (() => {
  const ratio = { functions: MIN3.functions / MIN.functions, information: MIN3.information / MIN.information, fixed: 1 }
  const teamHours = round1(LAB4_PERSON_HOURS.reduce((a, t) => a + t.hours * ratio[t.scales], 0))
  return { teamHours, each: round1(teamHours / 3) }
})()
export const LAB4_EACH = round1(LAB4_TEAM_HOURS / 4)

// ------------------------------------------------------------------------------------------- the lab at a glance
const views = REQUIRED_VIEW_KINDS.map((k) => viewKindLabel(k).toLowerCase())
export const LAB_PURPOSE = n(
  `Apply the Week 4 method to your team’s own enterprise, never to AeroLink: choose the viewpoints your stakeholders’ concerns need (at least the ${views.join(', ')} views), derive the functions by walking your scenarios and tracing your capabilities, allocate every function to a logical and a physical element with a stated criterion, record one architecture decision, and build the information view that traces each item from its producer to the decision it supports, with an AI capability card. The result extends your Week 3 Team Record with Parts 15–18; Week 5 turns the physical view and the information routes into components and interfaces, and in Phase II the functions, elements and information items become model elements (Weeks 10–12).`,
)

export const LAB_AT_A_GLANCE: { label: string; value: string }[] = [
  { label: 'Setting', value: 'Team (3 or 4 members); launched in class, completed out of class' },
  { label: 'In class', value: `Session 2, ${S2_LAB.total} min: the brief (${S2_LAB.brief} min), team work on the view purposes and the first scenario walk (${S2_LAB.views} min), the instructor check of the walks (${S2_LAB.check} min, up to ${S2_LAB.checkTeams} teams; the others post their walk on the LMS and are answered within 48 hours) and the close (${S2_LAB.close} min)` },
  { label: 'Out of class', value: 'Seven days, by the procedure below' },
  { label: 'Due', value: `${LAB4_DUE}; one team member uploads both files` },
  { label: 'Grading', value: 'Formative: written feedback against the rubric rows below, returned before Week 5, Session 2' },
]

export const LAB_INPUTS: { text: NewText; cites?: Citation[]; to?: string }[] = [
  { text: n('Your Week 3 Team Record as returned with feedback, and its model-inputs file: it carries your Week 2 needs, scenarios, capabilities and requirements, and your Week 3 risks, TPMs and trade decision. Correct it first where the feedback asks.') },
  { text: n('Your Week 1 stakeholder and concern register, for the viewpoints, and the list of daily decisions each member brought to Session 2, for the information view.') },
  { text: n('The Session 1 and Session 2 lectures, the detailed lesson and the worked examples: the AeroLink view set, the scenario walks, the function and allocation tables, the decision record, the information view with its route check and audit, and the evaluation.'), to: '/week/4/examples' },
  { text: n('The required readings for the week.'), cites: LAB4_REQUIRED_READINGS },
  { text: n('Further reading on the functional view, the DoD process, data management, AI oversight and design assessment (not required; the basis of the graduate task).'), cites: LAB4_EXTENSION_READINGS },
  { text: n('The lab tool, which imports your Week 3 record, checks every part as you go, computes the four consistency checks, shares the record between teammates and exports it.'), to: '/week/4/lab/tool' },
]

export const PROPOSED_OBJECTIVES: { id: string; text: string }[] = [
  { id: 'W4.4', text: 'Distinguish data from information and an architecture from its description, citing the source of each distinction' },
  { id: 'W4.5', text: 'Record an architecture decision with the alternatives considered and the rationale, and test it against the needs and risks it touches' },
  { id: 'W4.6', text: 'Specify an AI-enabled capability with its inputs, outputs, human oversight and failure modes, and place it in the information view' },
]
export const LAB_OBJECTIVES = [
  ...['W4.1', 'W4.2', 'W4.3'].map((id) => ({ id, text: W4.objectives.find((x) => x.id === id)!.text, proposed: false })),
  ...PROPOSED_OBJECTIVES.map((o) => ({ id: o.id, text: o.text, proposed: true })),
]

const gatesOf = (g: readonly { short: string }[]) => g.map((x) => x.short).join('; ')
const criteria = ALLOCATION_CRITERIA.map((c) => c.label.toLowerCase()).join('; ')

/** The engineering method (eight steps), with the lecture slides that teach each step. */
export const LAB_METHOD: { title: string; text: NewText; taught: string }[] = [
  {
    title: 'The view set',
    text: n(`Write one viewpoint for each required kind (${views.join(', ')}) and add any view a concern needs. For each: the purpose as the question the view answers, the stakeholders and their concern (in words or as its Week 1 concern ID), the needs, capabilities or requirements it serves where you can name them, and its conventions (the form of the view and the element types it shows). Each entry holds both the viewpoint, the rule, and the view it produces for your one system. Check that every concern in your Week 1 register is answered by at least one view, and that each concern you assign is one the view really answers. Hard gates: ${gatesOf(VIEWPOINT_GATES)}. Advisory: ${gatesOf(VIEWPOINT_ADVISORIES)}.`),
    taught: [t1('w4s1-architecture', 4, 'What an architecture is'), t1('w4s1-vocabulary', 6, 'Framework, model, view, viewpoint'), t1('w4s1-choosing-views', 7, 'Choosing views'), t1('w4s1-aerolink-views', 8, 'AeroLink’s view set')].join('; '),
  },
  {
    title: 'Functions from scenarios',
    text: n('Walk each Week 2 scenario step by step and ask which transformation each step needs. Name each function as an action, verb and object, never as an element, and give it at least one input and one output, each an information, energy or material flow. A step no function serves is a new function or a recorded gap; a step where a person decides still belongs to a function: write the person in.'),
    taught: [t1('w4s1-function', 9, 'What a function is'), t1('w4s1-functional-view', 10, 'What a functional view must contain'), t1('w4s1-worked-walk', 12, 'Worked example I')].join('; '),
  },
  {
    title: 'Trace and decomposition',
    text: n(`Trace every function to the capabilities it serves and give any capability without a function a disposition (for example a constraint met by a design property). Group the functions under at least ${MIN.groups} first-level functions beneath your mission function; three levels at most, and stop where a solution is known or imaginable. Hard gates for every function: ${gatesOf(FUNCTION_GATES)}. Advisories: ${gatesOf(FUNCTION_ADVISORIES)}.`),
    taught: [t1('w4s1-decomposition', 11, 'Decomposition'), t1('w4s1-capabilities', 13, 'Functions from capabilities')].join('; '),
  },
  {
    title: 'Logical and physical elements, allocation',
    text: n(`Define technology-independent logical elements, then the physical elements that implement them in the configuration your Week 3 decision chose (people, procedures and facilities count). Allocate every function to a logical element and to a physical element that logical element reaches, and write one sentence naming the criterion and the ID it rests on. The criteria: ${criteria}. Allocate every system requirement to a function or a physical element. Hard gates: ${gatesOf(ALLOCATION_GATES)}.`),
    taught: [t1('w4s1-logical-physical', 14, 'Logical and physical'), t1('w4s1-criteria', 15, 'Allocation needs a reason'), t1('w4s1-pitfalls', 16, 'Two allocation pitfalls'), t1('w4s1-worked-allocation', 17, 'Worked example II')].join('; '),
  },
  {
    title: 'The architecture decision',
    text: n(`Record at least ${MIN.decisions} architecture decision: the question, at least three alternatives considered, the choice, the rationale, and the needs, requirements and risks it touches, with any derived requirement it creates. Hard gates: ${gatesOf(DECISION_GATES)}.`),
    taught: [t1('w4s1-decision', 18, 'Recording an architecture decision'), t1('w4s1-process-frame', 20, 'The process frame')].join('; '),
  },
  {
    title: 'The information view',
    text: n(`For each information item state the raw data and the information made from them, the producer, the consumer, the decision it supports and the function, requirement or decision record that decision belongs to, how it travels between producer and consumer, and its sensitivity. The consumer is the party that makes the decision: an element of yours, an external system (an alarm to the emergency services, a report to a funder’s portal) or an AI capability; an AI capability can also be a producer, and its card then says who reviews its output. Keep data, decisions and deciders apart: data cross between elements; a decision is made by someone from them. If no decision can be named, it is not information yet. Check that every flow between two of your elements, from your function inputs and outputs, travels in an item. Hard gates: ${gatesOf(INFO_GATES)}. Advisories: ${gatesOf(INFO_ADVISORIES)}.`),
    taught: [t2('w4s2-data-information', 3, 'Data versus information'), t2('w4s2-producer-consumer', 4, 'Producer, consumer, decision'), t2('w4s2-flows-check', 5, 'Information flows check the physical view'), t2('w4s2-worked-info', 8, 'Worked example I')].join('; '),
  },
  {
    title: 'AI capability card',
    text: n(`Write at least ${MIN.ai} AI capability card: the host element, the function it supports, its input information items, its outputs, the human oversight (who decides and what the AI may not do), and its failure modes and their effects, with a note on data quality. Hard gates: ${gatesOf(AI_GATES)}.`),
    taught: [t2('w4s2-ai', 7, 'AI capabilities in the information view'), t2('w4s2-worked-ai', 10, 'Worked example II')].join('; '),
  },
  {
    title: 'Consistency and evaluation',
    text: n(`Run the four consistency checks: ${CONSISTENCY_CHECKS.join('; ')}. Then evaluate: for each riskiest requirement and TPM, name the element that carries it and the evidence that it can be met, and list what is still open for Week 5.`),
    taught: [t2('w4s2-audit', 11, 'Auditing the view'), t2('w4s2-evaluation-matrix', 12, 'Evaluating the architecture'), t2('w4s2-consistency', 13, 'Keeping the views consistent')].join('; '),
  },
]

export const LAB_PROCEDURE: { step: string; when: string; who: string; output: string; detail: NewText }[] = [
  { step: 'View purposes and the first scenario walk', when: `In class, Session 2 (${S2_LAB.views} min)`, who: 'Whole team; Architecture lead records', output: 'Part 15 draft, first functions', detail: n('One purpose question per required view with its stakeholders and concerns; one Week 2 scenario walked into functions, verb and object, with an input and an output each.') },
  { step: 'Instructor check of the walk', when: `In class, Session 2 (${S2_LAB.check} min, up to ${S2_LAB.checkTeams} teams)`, who: 'Architecture lead presents', output: 'Feedback', detail: n('Show one scenario and its functions; the instructor checks that every function is an action, has an input and an output, and that every step is served or a gap recorded. Teams not seen post the walk on the LMS and are answered within 48 hours.') },
  { step: 'Remaining scenario walks', when: 'Days 1–2', who: 'Each member walks one scenario', output: 'Part 16 (functions)', detail: n(`At least ${MIN.functions} functions (a three-person team: ${MIN3.functions}) that pass every hard gate.`) },
  { step: 'Capability trace and decomposition', when: 'Day 2', who: 'Requirements & Compliance', output: 'Part 16 (trace, tree)', detail: n(`Every capability traced or given a disposition; at least ${MIN.groups} first-level functions.`) },
  { step: 'Logical and physical elements; allocation', when: 'Days 3–4', who: 'Architecture', output: 'Part 17 (allocation)', detail: n(`At least ${MIN.logical} logical and ${MIN.physical} physical elements (a three-person team: ${MIN3.logical} and ${MIN3.physical}); every function allocated with a criterion; every system requirement allocated.`) },
  { step: 'Architecture decision', when: 'Day 4', who: 'Architecture with the whole team', output: 'Part 17 (decision)', detail: n('Three alternatives, the rationale, the needs and risks it touches, derived requirements.') },
  { step: 'Information view', when: 'Days 4–5', who: 'AI & Data Management', output: 'Part 18 (items)', detail: n(`At least ${MIN.information} information items (a three-person team: ${MIN3.information}) with producer, consumer, decision and route.`) },
  { step: 'AI capability card', when: 'Day 5', who: 'AI & Data Management', output: 'Part 18 (AI)', detail: n('Inputs, outputs, human oversight, failure modes, data quality.') },
  { step: 'Consistency checks and AI usage statement', when: 'Day 6', who: 'Verification & Validation; AI & Data Management (statement)', output: 'Checks, Part 6 updated', detail: n('Run the four checks in the tool, read every advisory, list the open items for Week 5; the AI usage statement, with every AI-suggested function or item tagged AI-suggested-reviewed. The statement is required even if no AI tool was used.') },
  { step: 'Integration, export and upload', when: 'Day 7', who: 'Verification & Validation', output: 'Submission', detail: n('Review the record for consistency, export the Markdown record and the JSON model inputs from the lab tool after the last change, and upload both files.') },
]

export const LAB_OUTPUT_FILES = [
  { name: 'team-NN-week4-record.md', what: 'Parts 15–18 and the updated Part 6 as headed Markdown, ready to read, with the computed consistency checks' },
  { name: 'team-NN-week4-model-inputs.json', what: 'The same data with IDs, links, the check results and the SysML v2 element each item will seed (Phase II)' },
]

const both = (four: string, three: string) => `team of 4: ${four}; team of 3: ${three}`
const part = (id: (typeof WEEK4_PARTS)[number]['id']) => {
  const p = WEEK4_PARTS.find((x) => x.id === id)!
  return `${p.n}. ${p.title}`
}
export const LAB_PARTS: { heading: string; evidence: NewText; minimum: string; judged: string }[] = [
  { heading: '6. AI usage statement (updated)', evidence: n('Tool, purpose, prompts, what was accepted or rejected and why, with AI-suggested functions and items tagged.'), minimum: 'At least 12 words; present even if no AI tool was used', judged: 'RB-12.1–12.3' },
  { heading: part('views'), evidence: n('Each viewpoint with its kind, purpose question, stakeholders and concerns, the items it serves and its conventions; concern coverage.'), minimum: `${MIN.viewpoints} viewpoints covering the ${views.join(', ')} kinds; only viewpoints that pass every hard gate count`, judged: 'RB-7.1' },
  { heading: part('functions'), evidence: n('The mission function, first-level functions and leaf functions, each with inputs and outputs, capabilities, scenarios (or the planning reason) and allocated requirements.'), minimum: both(`${MIN.functions} functions under ${MIN.groups} first-level functions`, `${MIN3.functions} functions under ${MIN3.groups} first-level functions`) + '; only functions that pass every hard gate count', judged: 'RB-7.2' },
  { heading: part('allocation'), evidence: n('Logical and physical elements; every function allocated with a criterion and its sentence; every system requirement allocated; the decision record.'), minimum: both(`${MIN.logical} logical and ${MIN.physical} physical elements`, `${MIN3.logical} logical and ${MIN3.physical} physical elements`) + `; every counted function allocated; ${MIN.decisions} decision record`, judged: 'RB-7.3 (allocation part), RB-7.4' },
  { heading: part('information'), evidence: n('Information items with data and information, producer, consumer, decision and its reference, route and sensitivity; AI capability cards.'), minimum: both(`${MIN.information} items`, `${MIN3.information} items`) + `; ${MIN.ai} AI capability card; only entries that pass every hard gate count`, judged: 'RB-7.5, RB-7.6' },
]

export const LAB_RUBRIC_ROWS: [string, string][] = [
  ['RB-7', '7.1'], ['RB-7', '7.2'], ['RB-7', '7.3'], ['RB-7', '7.4'], ['RB-7', '7.5'], ['RB-7', '7.6'],
  ['RB-12', '12.1'], ['RB-12', '12.2'], ['RB-12', '12.3'],
]
export const LAB_RUBRIC_NOTE = n(
  'The rows of the course rubric this record is judged against, quoted from the register. RB-7.1 asks for the operational, functional and physical views (and enterprise): the course minimum adds the information view. RB-7.3 is applied to its allocation part only this week (complete function-to-physical allocation with criteria); the N² chart and typed interfaces are judged in Week 5, so the row is scored out of 3 this week (pending faculty confirmation). RB-12.3 applies to the AI-suggested functions and items; its SysML part applies from Week 8.',
)
export const RUBRIC_LEVELS = ['4 Exemplary', '3 Proficient', '2 Developing', '1 Beginning']

export function rubricRow(id: string, criterion: string): string[] {
  const p = getRubric(id).parts.find((x) => x.type === 'table')
  const r = p && p.type === 'table' ? p.rows.find((x) => x[0] === criterion) : undefined
  if (!r) throw new Error(`${id} has no criterion ${criterion}`)
  return r
}

export const LAB_SUBMISSION = {
  format: n('Export two files from the lab tool after the last change: team-NN-week4-record.md (Parts 15–18 and the updated Part 6 as headed Markdown) and team-NN-week4-model-inputs.json (the same data with IDs, links, check results and the SysML v2 element each item will seed). Both state the record’s status.'),
  where: n(`One member uploads both files to the ${LAB4_WHERE} before Week 5, Session 1.`),
  grading: n('Formative: written feedback against the rubric rows above, returned before Week 5, Session 2.'),
  aiUse: 'AI tools may help brainstorm functions and check names and consistency; tag each AI-suggested function or information item AI-suggested-reviewed and say in the AI usage statement what the tool suggested and what you changed or rejected. The team owns every allocation and every decision.',
  graduate: n('Graduate students also build a concern × view matrix for the team’s enterprise (every Week 1 concern against every view, each mark checked for plausibility), name any concern no view answers and propose the view that would, and evaluate the team’s architecture decision against one aim from SEBoK’s list of what a candidate physical architecture may aim at (for example fewer physical interfaces, or resilience), stating what evidence would reverse it (individual, about 40 minutes, replacing the applied exercise; level descriptors on the Assessment page).'),
}

export const LAB_TOOL = n(
  'The lab tool imports your team’s Week 3 model-inputs file and adds Parts 15–18. It carries your needs, capabilities, scenarios, requirements, risks and TPMs so that every link can be checked, shows the view kinds and the allocation criteria as you write, and computes the four consistency checks. Each viewpoint, function, allocation, decision, information item and AI card lists its hard gates, each marked pass or fails, and its advisories, labeled advisory, which never stop an entry counting; only entries that pass every hard gate count toward the minimums. One member can enter the record and export the JSON file; teammates import it to continue the same record. Everything is saved in your browser only, so export after every working session.',
)

export const LAB_WORKLOAD: { activity: string; hours: number }[] = [
  { activity: `Lab launch in class (Session 2, ${S2_LAB.total} min; inside the class hours)`, hours: 0 },
  { activity: `Lab L4 out of class: your share of about ${LAB4_TEAM_HOURS.toFixed(1)} person-hours (team of four)`, hours: LAB4_EACH },
]
export const LAB_WORKLOAD_NOTE = n(
  `About ${LAB4_TEAM_HOURS.toFixed(1)} person-hours of out-of-class work for a team of four (${LAB4_PERSON_HOURS.map((t) => `${t.task} ${t.hours.toFixed(1)}`).join('; ')}), so about ${LAB4_EACH.toFixed(1)} h each. A team of three works to the reduced minimums (${MIN3.functions} functions, ${MIN3.logical} logical and ${MIN3.physical} physical elements, ${MIN3.information} information items): about ${LAB4_THREE_PERSON.teamHours.toFixed(1)} person-hours, about ${LAB4_THREE_PERSON.each.toFixed(1)} h each. Workload proportional to team size is pending faculty confirmation. See the workload table on the week page.`,
)

// ------------------------------------------------------------------------------------------- Markdown
const cite = (c: Citation) => formatCitation(c)
const md = (s: string) => s.replace(/\|/g, '\\|')

/** The same instructions as the Laboratory page, as Markdown (docs/lectures/week04/WEEK4_LAB_INSTRUCTIONS.md). */
export function labMarkdown(): string {
  const L: string[] = []
  const table = (head: string[], rows: string[][]) => {
    L.push(`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`)
    for (const r of rows) L.push(`| ${r.map((c) => md(c).replace(/\n/g, ' ')).join(' | ')} |`)
    L.push('')
  }
  L.push(`# Week 4 ${LAB_TITLE}`, '')
  L.push('> Generated from `learning-studio/src/content/lab/week04Lab.ts` by `npm run lab:md`; the Laboratory page (`#/week/4/lab`) renders the same source. Do not edit this file by hand. Review status: new-pending-review.', '')
  L.push(`Week 4 — ${W4.title}. AeroLink is the instructor’s FICTIONAL worked example; this record is about your team’s own enterprise.`, '')
  L.push('## Purpose', '', LAB_PURPOSE.text, '')
  table(['', ''], LAB_AT_A_GLANCE.map((x) => [`**${x.label}**`, x.value]))
  L.push('## Inputs', '')
  for (const i of LAB_INPUTS) L.push(`- ${i.text.text}${i.cites ? ` ${i.cites.map(cite).join('; ')}.` : ''}`)
  L.push('', '## Objectives', '')
  for (const o of LAB_OBJECTIVES) L.push(`- **${o.id}** ${o.text}${o.proposed ? ' *(proposed, pending faculty approval)*' : ''}`)
  L.push('', '## Engineering method', '')
  LAB_METHOD.forEach((m, i) => L.push(`${i + 1}. **${m.title}.** ${m.text.text} *(Taught in: ${m.taught}.)*`))
  L.push('', '## Procedure', '')
  table(['Step', 'When', 'Who (lead role)', 'Output', 'What to do'], LAB_PROCEDURE.map((p, i) => [`${i + 1}. ${p.step}`, p.when, p.who, p.output, p.detail.text]))
  L.push('## Expected outputs', '', 'Two files, exported from the lab tool after the last change:', '')
  for (const f of LAB_OUTPUT_FILES) L.push(`- \`${f.name}\`: ${f.what}.`)
  L.push('', 'The Week 4 work adds four parts to the Team Record and updates one. The minimum is the completeness check the lab tool and the instructor apply first.', '')
  table(['Part', 'Evidence required', 'Minimum (completeness check)', 'Judged by'], LAB_PARTS.map((p) => [p.heading, p.evidence.text, p.minimum, p.judged]))
  L.push('## Grading rubric rows', '', LAB_RUBRIC_NOTE.text, '')
  const label = (rb: string, r: string[]) => `${rb}.${r[0].split('.')[1]} ${r[1]}`
  table(['Criterion', ...RUBRIC_LEVELS], LAB_RUBRIC_ROWS.map(([rb, c]) => {
    const r = rubricRow(rb, c)
    return [label(rb, r), ...r.slice(2, 6)]
  }))
  L.push('## Submission', '')
  L.push(`- **Format.** ${LAB_SUBMISSION.format.text}`, `- **Where and when.** ${LAB_SUBMISSION.where.text}`, `- **How it is graded.** ${LAB_SUBMISSION.grading.text}`, `- **AI use.** ${LAB_SUBMISSION.aiUse}`, `- **Graduate task.** ${LAB_SUBMISSION.graduate.text}`, '')
  L.push('## The lab tool', '', LAB_TOOL.text, '')
  L.push('## Workload', '')
  table(['Activity', 'Hours per student'], LAB_WORKLOAD.map((w) => [w.activity, w.hours ? w.hours.toFixed(1) : 'in class']))
  L.push(LAB_WORKLOAD_NOTE.text, '')
  return L.join('\n')
}
