// Lab L11, model v0.4: the full laboratory instructions, single source for the Week 11 Laboratory page and
// docs/lectures/week11/WEEK11_LAB_INSTRUCTIONS.md (labMarkdown(), written by `node scripts/build-lab-md.mjs 11`;
// week11Lab.test.ts fails when the file and this module differ). Mirrors src/content/lab/week10Lab.ts.
//
// Single sources: the mapping, the finding classes, the review checklist, outputs, minimums and person-hours come from
// src/content/lectures/week11/labBrief.ts (the module the lab tool, src/workbench/week11/*, checks against); the in-class
// minutes, readings, workload and deliverables from src/content/week11Path.ts; the rubric rows from the rubric register
// (getRubric); the checker installation from the Week 8 guide (reused, not copied: src/content/lab/week08Checker.ts).
// "Taught in" references are computed from the registered lectures by slide id.
// Review status: new-pending-review. AeroLink is FICTIONAL and is the instructor's worked example; the model is always
// of the team's own enterprise.
import { WEEKS } from '../course'
import { formatCitation, type Citation } from '../readings'
import { getRubric } from '../rubrics'
import { getLecture } from '../lectures'
import { allSlides } from '../lectures/text'
import { PENDING, type NewText } from '../learn/types'
import { DELIVERABLES, EXTENSION_READINGS, LAB_TEAM_HOURS, PROPOSED_OBJECTIVES, REQUIRED_READINGS_CITES, S2_LAB, THREE_PERSON, WORKLOAD_ROWS } from '../week11Path'
import { LAB11_MINIMUMS as MIN, LAB11_OUTPUTS, LAB11_PERSON_HOURS, LAB11_PERSON_HOURS_THREE, REVIEW_CHECKS, W11_FINDING_CLASSES, W11_MAPPING } from '../lectures/week11/labBrief'
import { CHECKER_TITLE, OS_LABEL, STEPS, type OsKey } from './week08Checker'

const n = (text: string): NewText => ({ text, review: PENDING })
const W11 = WEEKS[10]

export const LAB_REVIEW = PENDING
export const LAB_TITLE = 'Lab L11: Model v0.4 of your enterprise: physical architecture and interfaces in the model'

// ------------------------------------------------------------------------------------------- taught in
/** “Session N, slide M ‘title’”, read from the registered lecture by slide id. */
export function taughtIn(session: 1 | 2, slideId: string, fallback: { slide: number; title: string }): string {
  const l = getLecture(11, session)
  if (l) {
    const slides = allSlides(l)
    const i = slides.findIndex((s) => s.id === slideId)
    if (i >= 0) return `Session ${session}, slide ${i + 1} ‘${slides[i].title}’`
  }
  return `Session ${session}, slide ${fallback.slide} ‘${fallback.title}’`
}
const t1 = (id: string, slide: number, title: string) => taughtIn(1, id, { slide, title })
const t2 = (id: string, slide: number, title: string) => taughtIn(2, id, { slide, title })

// ------------------------------------------------------------------------------------------- the lab at a glance
const modelDue = DELIVERABLES.find((d) => d.id === 'model')!
export const LAB_PURPOSE = n(
  'Model your team’s own physical architecture and interfaces, never AeroLink, in the SysML v2 model your team extended in Week 10. Every Week 4 physical element and Week 5 component becomes a part; every function is performed by the physical element that runs it; every logical element is allocated to the physical elements that realize it, function by function; every Week 5 interface becomes ports, an interface definition with the flows of what crosses, and an interface usage, or a connection for an organizational interface; every interface requirement is allocated to its interface and to the function that realizes it; and your first satisfy claims state, with their basis, which design element meets which requirement. Then review the model against your Week 5 record with the course checklist, give every finding a disposition, and run the model through the course-designated checker until it reports no errors. Model v0.4 is what Week 12 verifies.',
)

export const LAB_AT_A_GLANCE: { label: string; value: string }[] = [
  { label: 'Setting', value: 'Team (3 or 4 members); launched in class, completed out of class' },
  { label: 'In class', value: `Session 2, ${S2_LAB.total} min: the brief (${S2_LAB.brief} min), the crossings of your interfaces set in the lab tool (${S2_LAB.map} min, the instructor circulating), the instructor checkpoint (${S2_LAB.checkpoint} min) and the close (${S2_LAB.close} min)` },
  { label: 'Out of class', value: 'Seven days, by the procedure below' },
  { label: 'Due', value: `${modelDue.due}; one team member uploads the three files` },
  { label: 'Grading', value: 'Formative: written feedback against the rubric rows below, returned before Week 12, Session 2' },
]

/** Inputs: the team's Week 10 model and Phase I export, the teaching material, the readings and the tools. */
export const LAB_INPUTS: { text: NewText; cites?: Citation[]; to?: string }[] = [
  { text: n('Your team’s Week 10 model v0.3 (.sysml), exported from the Week 10 lab tool, with its logical architecture and its Physical package present. If you change your Week 10 work, export v0.3 again from the Week 10 tool and import it here; never import model v0.4 into the Week 10 tool.') },
  { text: n('Your Week 5 model-inputs file (.json): the components, externals, interfaces with their ends and crossings, interface requirements, and the Week 4 physical elements, function placements and information items it carries.') },
  { text: n('The Session 1 and Session 2 lectures, the detailed lesson and the worked examples: the AeroLink physical architecture and allocation, the ports of the charging interface, the interface set, the interface requirements and the satisfy claims.'), to: '/week/11/examples' },
  { text: n('The required readings for the week.'), cites: REQUIRED_READINGS_CITES },
  { text: n('Further reading: the rest of the physical architecture, the specification clauses behind the constructs, and the definition of an interface requirement.'), cites: EXTENSION_READINGS },
  { text: n('The lab tool, which reads your two files, lets you link part definitions, place functions, set what crosses each interface, choose the functions of each interface requirement and write the satisfy claims, writes model v0.4, computes the audit and keeps the review checklist.'), to: '/week/11/lab/tool' },
  { text: n('The course checker your team installed in Week 8, from the Week 8 install guide.'), to: '/week/8/lab/checker' },
]

/** Objectives this lab practices (course.ts IDs; the proposed ones are pending faculty approval). */
export const LAB_OBJECTIVES = [...W11.objectives.map((o) => ({ id: o.id, text: o.text, proposed: false })), ...PROPOSED_OBJECTIVES.map((o) => ({ id: o.id, text: o.text, proposed: true }))]

/** The engineering method (eight steps), with the lecture slides that teach each step. */
export const LAB_METHOD: { title: string; text: NewText; taught: string }[] = [
  { title: 'Physical elements and components', text: n('Each Week 4 physical element becomes a part usage with its ID inside physicalArchitecture, and each Week 5 component a part usage nested in its element. A part definition already in Physical with the same name is reused; link every other Week 8 or Week 9 part definition to the element it stands for, so the element’s definition specializes it and the requirements whose subject it is still conform, or record why it stays separate.'), taught: [t1('w11s1-layers', 5, 'Layers: elements and their components'), t1('w11s1-parts-physical', 8, 'Physical elements and components as parts')].join('; ') },
  { title: 'Functions on physical elements', text: n('Each function is performed by the physical element Week 4 placed it on (course convention: at level 1; a component’s Week 5 functions are written into its documentation). Choose the physical element for every function your team added in Week 10. An element that performs nothing needs a disposition: a medium or an enabling element is a valid reason.'), taught: t1('w11s1-perform-physical', 9, 'Functions performed by physical parts') },
  { title: 'Logical-to-physical allocation', text: n('The tool allocates each logical part to every physical part that performs one of its functions, with one nested allocation per function, so the allocation cannot contradict the placements. Compare the allocation matrix with your Week 4 allocation table and record any difference as a finding.'), taught: [t1('w11s1-allocate-l2p', 10, 'The logical-to-physical allocation, with nested allocations'), t1('w11s1-worked-allocation', 11, 'AeroLink worked example I: the allocation matrix')].join('; ') },
  { title: 'Ports and what crosses', text: n('For every physical and information interface, set each crossing: the item (an information ID, or the name of an item in your model or added here) and its direction, from end A or to end A. Add an item where none exists: an information item takes the next free ID; energy, material and mechanical-load items are named. The tool writes one port definition per interface from end A’s point of view and types end B by its conjugate; where it cannot read a direction from your record it assumes end A to end B and asks you to decide.'), taught: [t1('w11s1-conjugation', 15, 'Conjugation: one port definition, both ends'), t1('w11s1-worked-ports', 18, 'AeroLink worked example II: the charging interface’s ports')].join('; ') },
  { title: 'Interfaces and connections', text: n('The tool writes an interface definition with a flow per crossing and an interface usage with the IF ID for each physical or information interface, and a connection for each organizational interface; an external end gets its port on a reference part that subsets the external in the context, and an external your Week 4 or Week 5 record added is added to the context first. A crossing that names no item is left out until you name its item.'), taught: [t2('w11s2-interface-def', 4, 'Interface definitions and interface usages'), t2('w11s2-organizational', 7, 'Information, physical and organizational interfaces in the model')].join('; ') },
  { title: 'Interface requirements', text: n('Each Week 5 interface requirement is allocated to its interface usage and to the function at one end that realizes it: confirm or change the functions the tool suggests. An interface requirement your Week 9 model does not have is written into Requirements, derived from its Week 5 parents, with the interface definition as its subject. Allocate any requirement an open item of Weeks 9 or 10 assigned to the physical architecture, or re-date it with its reason and owner.'), taught: [t2('w11s2-interface-req', 10, 'Interface requirements in the model'), t2('w11s2-req-allocation', 11, 'Allocating interface requirements: the open items close')].join('; ') },
  { title: 'Satisfy claims', text: n(`Write at least ${MIN.satisfy} satisfy claims (a team of three: ${MIN.satisfyThree}): a requirement, the physical element or interface whose type conforms to its subject, the design value of the attribute it constrains where you have one, and the basis (an analysis, an estimate, a supplier figure). The tool leaves out a claim whose element does not conform and does not count a claim without a basis.`), taught: t2('w11s2-satisfy', 12, 'Satisfy claims: the design asserts it meets a requirement') },
  { title: 'Review, audit and checker', text: n(`Read the model against the ${REVIEW_CHECKS.length} checks of the course checklist; record for each whether the model meets it, with how you checked, or the finding and what you will do. Give every finding a disposition: an open item with an owner and a week, or why no change is needed; a disposition cannot claim a fix. Run model v0.4 through the course-designated checker until it reports no errors, and explain every warning in the log. A PASS does not show that connected ports match, that a flow runs the right way or that a satisfy claim is true.`), taught: [t1('w11s1-checker', 22, 'What the checker checks about ports, and what it cannot'), t2('w11s2-checklist', 16, 'The interface review checklist')].join('; ') },
]

/** The procedure, step by step: when, who (lead role) and the output. */
export const LAB_PROCEDURE: { step: string; when: string; who: string; output: string; detail: NewText }[] = [
  { step: 'Set the crossings', when: `In class, Session 2 (${S2_LAB.map} min)`, who: 'Whole team', output: 'A started model', detail: n('Import the two files; link the part definitions; place the functions added in Week 10; set the item and direction of every crossing; preview the ports and flows.') },
  { step: 'Checkpoint fix', when: 'Day 1', who: 'Architecture', output: 'The crossings corrected', detail: n('Apply the instructor’s checkpoint note before modeling the rest.') },
  { step: 'Parts and placements', when: 'Days 1–2', who: 'Architecture', output: 'Physical package, part 1', detail: n('Every element and component present; every part definition linked or dispositioned; every function placed; the allocation matrix compared with Week 4.') },
  { step: 'What crosses, directions', when: 'Days 2–3', who: 'Architecture', output: 'Physical package, part 2', detail: n('Every crossing an item with a confirmed direction; new items added; every interface checked against the Week 5 table.') },
  { step: 'Interface requirements', when: 'Days 3–4', who: 'Requirements & Compliance', output: 'Requirements allocated', detail: n('Every interface requirement allocated to its interface and a function; the open items of Weeks 9 and 10 allocated or re-dated.') },
  { step: 'Satisfy claims', when: 'Day 4', who: 'Verification & Validation', output: 'Claims with their basis', detail: n('Each claim on a conforming element, with its design value and basis.') },
  { step: 'Checker runs', when: 'Day 5', who: 'AI & Data Management runs; owners fix', output: 'Checker log', detail: n('Iterate to zero errors; explain every warning.') },
  { step: 'Review and audit', when: 'Day 6', who: 'Verification & Validation', output: 'Review checklist; dispositions', detail: n('Every check recorded with a note; every finding dispositioned.') },
  { step: 'AI usage statement and upload', when: 'Day 7', who: 'Verification & Validation', output: 'Submission', detail: n('Integration review; export the model and the interface review after the last change; upload the three files.') },
]

export const LAB_OUTPUT_FILES = LAB11_OUTPUTS.map((o) => ({ name: o.file, what: o.what }))

/** What model v0.4 and its interface review must contain, with the evidence, the minimum and how each is judged. */
export const LAB_PARTS: { heading: string; evidence: NewText; minimum: string; judged: string }[] = [
  { heading: 'Physical elements and components', evidence: n('One part usage per physical element inside physicalArchitecture with its ID, components nested, part definitions reused or specialized; the parts table.'), minimum: 'Every Week 4 physical element and Week 5 component present once; every Week 8 or 9 part definition linked or dispositioned', judged: 'RB-8.3; RB-8.6' },
  { heading: 'Placements and allocation', evidence: n('Every function performed by one physical element; every logical element allocated to its physical homes with nested allocations; the allocation matrix.'), minimum: 'Every function placed, or dispositioned; every logical element allocated, or dispositioned', judged: 'RB-7.3; RB-8.3' },
  { heading: 'Ports, interfaces and flows', evidence: n('For every physical and information interface: a port definition, end A and end B (conjugate) ports, an interface definition with a flow per crossing, an interface usage with the IF ID; a connection for every organizational interface; the interface table.'), minimum: `Every Week 5 interface present once; every crossing an item with a confirmed direction; at least ${MIN.interfacesWithFlow} interface with a flow`, judged: 'RB-7.3; RB-7.5; RB-8.3' },
  { heading: 'Interface requirements', evidence: n('Every interface requirement in the model, derived from its parent, allocated to its interface and to a function.'), minimum: 'Every interface requirement allocated, or dispositioned', judged: 'RB-8.4' },
  { heading: 'Satisfy claims', evidence: n('Each claim on an element whose type conforms to the requirement’s subject, with its design value where one exists and its basis.'), minimum: `At least ${MIN.satisfy} claims (team of three: ${MIN.satisfyThree}), each with a basis`, judged: 'RB-8.4' },
  { heading: 'Review and audit', evidence: n('The review checklist with a result and a note for every check; a disposition for every finding that needs one.'), minimum: `All ${REVIEW_CHECKS.length} checks recorded; every finding dispositioned`, judged: 'RB-8.3; RB-8.6' },
  { heading: 'Checker log', evidence: n('The final run of model v0.4, with every warning explained.'), minimum: 'Zero errors in the final run', judged: 'RB-8.1; RB-12.3' },
  { heading: 'AI usage statement', evidence: n('Tool, purpose, prompts, what was accepted or rejected and why, with AI-suggested elements tagged.'), minimum: 'Present even if no AI tool was used', judged: 'RB-12.1–12.3' },
]

/** Rubric rows applied this week, read from the rubric register, never retyped. */
export const LAB_RUBRIC_ROWS: [string, string][] = [
  ['RB-7', '7.3'], ['RB-7', '7.5'],
  ['RB-8', '8.1'], ['RB-8', '8.2'], ['RB-8', '8.3'], ['RB-8', '8.4'], ['RB-8', '8.6'],
  ['RB-12', '12.1'], ['RB-12', '12.2'], ['RB-12', '12.3'],
]
export const LAB_RUBRIC_NOTE = n(
  'The rows of the course rubric this model is judged against. Grading is formative this week: written feedback on each row, returned before Week 12, Session 2; a faculty decision may make this model a graded baseline. RB-8.3 is the core row this week: definitions and usages, specialization of the Week 9 placeholders, ports and interfaces typed. RB-7.3 and RB-7.5 apply to the allocation and the interfaces and to the information that crosses them. RB-8.4 applies to the interface requirements and to the satisfy claims, which must relate appropriate design elements. RB-8.6 applies to the minimums above. RB-12.1–12.3 apply to the AI usage statement. The parse-error gate of RB-8 applies: more than two errors cap 8.2–8.6 at level 2, with a 24-hour repair window.',
)
export const RUBRIC_LEVELS = ['4 Exemplary', '3 Proficient', '2 Developing', '1 Beginning']

export function rubricRow(id: string, criterion: string): string[] {
  const part = getRubric(id).parts.find((p) => p.type === 'table')
  const r = part && part.type === 'table' ? part.rows.find((x) => x[0] === criterion) : undefined
  if (!r) throw new Error(`${id} has no criterion ${criterion}`)
  return r
}

export const LAB_SUBMISSION = {
  format: n('Three files: team-NN-model-v04.sysml (model v0.4), team-NN-interface-review.md (the parts table, the allocation matrix, the interface table, the requirement allocations, the satisfy claims, the audit with dispositions, the review checklist and the AI usage statement, exported from the lab tool after the last change), and team-NN-checker-log.txt (the final checker run).'),
  where: n(`One member uploads the three files to the ${modelDue.where} before Week 12, Session 1.`),
  grading: n('Formative: written feedback against the rubric rows above, returned before Week 12, Session 2.'),
  aiUse: 'AI tools may help draft documentation, review the interfaces or suggest SysML text; every AI-suggested element must pass the checker, be tagged AI-suggested-reviewed and be explained by its owner, and the AI usage statement says what the tool suggested and what you changed or rejected.',
}

export const LAB_TOOL = n(
  'The lab tool reads two files: your Week 10 model v0.3 (.sysml) and your Week 5 model inputs (.json). It refuses AeroLink files, files of another team, a Week 9 model that has no logical architecture, a Week 4 file in the Week 5 field and files whose packages are missing, each with the reason. You link the part definitions Weeks 8 and 9 put into Physical, place the functions Week 4 did not place, set the item and direction of every crossing, add items with IDs that continue after the highest your files have used and are never reused, choose the functions of each interface requirement, allocate open requirements to physical elements and write the satisfy claims. The tool writes model v0.4: it fills the Physical package (parts, components, performs, port and interface definitions with their flows, interfaces and connections, the logical-to-physical allocation, the requirement allocations, the satisfy claims), adds the interface requirements your model lacks to Requirements and the externals your record added to the context. It never renumbers: an ID in your Week 5 file that names a different element in your model is reported and left out until you correct the Week 5 record. It computes the audit, keeps the review checklist and shows a readiness list with the reason for every item still open. Its checks are course acceptance checks: whether the model is valid is decided by the course-designated checker. A model v0.4 exported from the tool can be imported again; the tool replaces what it generated, so keep hand edits in a separate file until the last export. Everything is saved in your browser only: export after every working session, and share the workspace file with teammates.',
)

/** Running the checker on model v0.4: the Week 8 guide's own commands for your model, with the file name changed. */
export const CHECKER_RUN_INTRO = n(`Your team installed the course checker in Week 8 (${CHECKER_TITLE.toLowerCase()}, on the Week 8 Laboratory page). Save the exported model in the checker’s models folder and run it the same way as before, naming your file team-NN-model-v04.sysml. Run it after every change until it reports zero errors, and paste the final output into team-NN-checker-log.txt with a line explaining each warning.`)
const modelStep = STEPS.find((s) => s.id === 'model')!
export const CHECKER_RUN: { os: OsKey; label: string; commands: string[] }[] = (Object.keys(OS_LABEL) as OsKey[]).map((os) => ({ os, label: OS_LABEL[os], commands: (modelStep.commands?.[os] ?? []).map((c) => c.replace(/team-07-model-v01/g, 'team-07-model-v04')) }))

/** Workload: the lab's share of the week (rows of the week's workload table). */
const row = (id: string) => WORKLOAD_ROWS.find((r) => r.id === id)!
export const LAB_WORKLOAD: { activity: string; hours: number }[] = [
  { activity: `Lab launch in class (Session 2, ${S2_LAB.total} min; inside the class hours)`, hours: 0 },
  { activity: row('lab').activity, hours: row('lab').hours },
]
export const LAB_WORKLOAD_NOTE = n(
  `About ${LAB_TEAM_HOURS.toFixed(1)} person-hours of out-of-class work for a team of four (${LAB11_PERSON_HOURS.map((t) => `${t.task} ${t.hours.toFixed(1)}`).join('; ')}), so about ${row('lab').hours.toFixed(1)} h each. A team of three reduces two tasks (${LAB11_PERSON_HOURS_THREE.filter((t) => t.scope !== 'as for a team of four').map((t) => `${t.task}: ${t.scope}`).join('; ')}) and does the rest as a team of four does: about ${THREE_PERSON.teamHours.toFixed(1)} person-hours, about ${THREE_PERSON.each.toFixed(1)} h each, a week of ${THREE_PERSON.total.toFixed(1)} h, within the 8.0 h budget. Workload proportional to team size is pending faculty confirmation. See the workload table on the week page.`,
)

// ------------------------------------------------------------------------------------------- Markdown
const cite = (c: Citation) => formatCitation(c)
const md = (s: string) => s.replace(/\|/g, '\\|')

/** The same instructions as the Laboratory page, as Markdown (docs/lectures/week11/WEEK11_LAB_INSTRUCTIONS.md). */
export function labMarkdown(): string {
  const L: string[] = []
  const table = (head: string[], rows: string[][]) => {
    L.push(`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`)
    for (const r of rows) L.push(`| ${r.map((c) => md(c).replace(/\n/g, ' ')).join(' | ')} |`)
    L.push('')
  }
  L.push(`# Week 11 ${LAB_TITLE}`, '')
  L.push('> Generated from `learning-studio/src/content/lab/week11Lab.ts` by `node scripts/build-lab-md.mjs 11`; the Laboratory page (`#/week/11/lab`) renders the same source. Do not edit this file by hand. Review status: new-pending-review.', '')
  L.push(`Week 11 — ${W11.title}. AeroLink is the instructor’s FICTIONAL worked example; this model is of your team’s own enterprise.`, '')
  L.push('## Purpose', '', LAB_PURPOSE.text, '')
  table(['', ''], LAB_AT_A_GLANCE.map((x) => [`**${x.label}**`, x.value]))
  L.push('## Inputs', '')
  for (const i of LAB_INPUTS) L.push(`- ${i.text.text}${i.cites ? ` ${i.cites.map(cite).join('; ')}.` : ''}`)
  L.push('', '## Objectives', '')
  for (const o of LAB_OBJECTIVES) L.push(`- **${o.id}** ${o.text}${o.proposed ? ' *(proposed, pending faculty approval)*' : ''}`)
  L.push('', '## Engineering method', '')
  LAB_METHOD.forEach((m, i) => L.push(`${i + 1}. **${m.title}.** ${m.text.text} *(Taught in: ${m.taught}.)*`))
  L.push('', '## The Week 11 mapping (course convention)', '')
  table(['Artifact', 'From', 'Becomes', 'Where'], W11_MAPPING.map((m) => [m.artifact, m.from, m.becomes, m.where]))
  L.push('## Procedure', '')
  table(['Step', 'When', 'Who (lead role)', 'Output', 'What to do'], LAB_PROCEDURE.map((p, i) => [`${i + 1}. ${p.step}`, p.when, p.who, p.output, p.detail.text]))
  L.push('## Expected outputs', '', 'Three files:', '')
  for (const f of LAB_OUTPUT_FILES) L.push(`- \`${f.name}\`: ${f.what}.`)
  L.push('', 'The minimum is the completeness check the lab tool and the instructor apply first.', '')
  table(['Part', 'Evidence required', 'Minimum (completeness check)', 'Judged by'], LAB_PARTS.map((p) => [p.heading, p.evidence.text, p.minimum, p.judged]))
  L.push('## The interface review checklist (course convention)', '')
  table(['Check', 'What the tool shows'], REVIEW_CHECKS.map((c) => [c.text, c.tool]))
  L.push('## Audit finding classes (course convention)', '')
  table(['Class', 'Meaning'], W11_FINDING_CLASSES.map((c) => [c.label, c.meaning]))
  L.push('## Grading rubric rows', '', LAB_RUBRIC_NOTE.text, '')
  table(['Criterion', ...RUBRIC_LEVELS], LAB_RUBRIC_ROWS.map(([rb, c]) => {
    const r = rubricRow(rb, c)
    return [`${rb}.${r[0].split('.')[1]} ${r[1]}`, ...r.slice(2, 6)]
  }))
  L.push('## Submission', '')
  L.push(`- **Format.** ${LAB_SUBMISSION.format.text}`, `- **Where and when.** ${LAB_SUBMISSION.where.text}`, `- **How it is graded.** ${LAB_SUBMISSION.grading.text}`, `- **AI use.** ${LAB_SUBMISSION.aiUse}`, '')
  L.push('## The lab tool', '', LAB_TOOL.text, '')
  L.push('## Running the checker on model v0.4', '', CHECKER_RUN_INTRO.text, '')
  for (const r of CHECKER_RUN) L.push(`${r.label}:`, '', '```', ...r.commands, '```', '')
  L.push('## Workload', '')
  table(['Activity', 'Hours per student'], LAB_WORKLOAD.map((w) => [w.activity, w.hours ? w.hours.toFixed(1) : 'in class']))
  L.push(LAB_WORKLOAD_NOTE.text, '')
  return L.join('\n')
}
