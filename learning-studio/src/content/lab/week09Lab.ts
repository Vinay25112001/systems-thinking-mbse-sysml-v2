// Lab L9, model v0.2: the full laboratory instructions, single source for the Week 9 Laboratory page and
// docs/lectures/week09/WEEK9_LAB_INSTRUCTIONS.md (labMarkdown(), written by `node scripts/build-lab-md.mjs 9`;
// week09Lab.test.ts fails when the file and this module differ). Mirrors src/content/lab/week08Lab.ts.
//
// Single sources: the mapping, the finding classes, outputs, minimums and person-hours come from
// src/content/lectures/week09/labBrief.ts (the module the lab tool, src/workbench/week9/*, checks against); the in-class
// minutes, readings, workload and deliverables from src/content/week9Path.ts; the rubric rows from the rubric register
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
import { DELIVERABLES, EXTENSION_READINGS, LAB_PERSON_HOURS, LAB_TEAM_HOURS, PROPOSED_OBJECTIVES, REQUIRED_READINGS_CITES, S2_LAB, THREE_PERSON, WORKLOAD_ROWS } from '../week9Path'
import { AI_CATEGORIES, LAB9_MINIMUMS as MIN, LAB9_OUTPUTS, W9_FINDING_CLASSES, W9_MAPPING } from '../lectures/week09/labBrief'
import { CHECKER_TITLE, OS_LABEL, STEPS, type OsKey } from './week08Checker'

const n = (text: string): NewText => ({ text, review: PENDING })
const W9 = WEEKS[8]

export const LAB_REVIEW = PENDING
export const LAB_TITLE = 'Lab L9: Model v0.2 of your enterprise: needs and requirements in the model'

// ------------------------------------------------------------------------------------------- taught in
/** “Session N, slide M ‘title’”, read from the registered lecture by slide id. */
export function taughtIn(session: 1 | 2, slideId: string, fallback: { slide: number; title: string }): string {
  const l = getLecture(9, session)
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
  'Model your team’s own needs and requirements, never AeroLink, in the SysML v2 model your team built in Week 8. Every Week 1 need becomes a requirement usage that names its stakeholders and frames the concerns it answers; every Week 2 requirement becomes a requirement usage with its ID, its statement, a subject and, where it can be written, a required constraint; every parent link becomes a derivation. Then audit the trace from needs to requirements, review the requirements with an AI tool and decide every finding yourself, and run the model through the course-designated checker until it reports no errors. Model v0.2 is what Weeks 10 to 13 connect functions, design elements, verification cases and analyses to.',
)

export const LAB_AT_A_GLANCE: { label: string; value: string }[] = [
  { label: 'Setting', value: 'Team (3 or 4 members); launched in class, completed out of class' },
  { label: 'In class', value: `Session 2, ${S2_LAB.total} min: the brief (${S2_LAB.brief} min), one chain from need to system requirement in the lab tool (${S2_LAB.chain} min, the instructor circulating), the instructor checkpoint (${S2_LAB.checkpoint} min) and the close (${S2_LAB.close} min)` },
  { label: 'Out of class', value: 'Seven days, by the procedure below' },
  { label: 'Due', value: `${modelDue.due}; one team member uploads the three files` },
  { label: 'Grading', value: 'Formative: written feedback against the rubric rows below, returned before Week 10, Session 2' },
]

/** Inputs: the team's Week 8 model and Phase I exports, the teaching material, the readings and the tools. */
export const LAB_INPUTS: { text: NewText; cites?: Citation[]; to?: string }[] = [
  { text: n('Your team’s Week 8 model v0.1 (.sysml), exported from the Week 8 lab tool, with its Needs and Requirements packages still present (empty, with their documentation).') },
  { text: n('Your Week 1 model-inputs file (.json): the mission, the objectives and the needs with their stakeholders, concerns, conditions and rationale.') },
  { text: n('Your Week 2 model-inputs file (.json): the stakeholder and system requirements with their criteria, types, methods, rationale, parents and TBDs, and the dispositions of your Week 2 trace audit.') },
  { text: n('The Session 1 and Session 2 lectures, the detailed lesson and the worked examples: the AeroLink Needs and Requirements packages, a TBD, “in still air”, a derivation chain, the trace matrix and the AI review demonstration.'), to: '/week/9/examples' },
  { text: n('The required readings for the week.'), cites: REQUIRED_READINGS_CITES },
  { text: n('Further reading: the library definitions the model uses.'), cites: EXTENSION_READINGS },
  { text: n('The lab tool, which reads your three files, lets you decide each requirement’s subject and constraint, writes model v0.2, computes the trace matrix and the trace audit, and keeps the AI review log.'), to: '/week/9/lab/tool' },
  { text: n('The course checker your team installed in Week 8, from the Week 8 install guide.'), to: '/week/8/lab/checker' },
]

/** Objectives this lab practices (course.ts IDs; W9.4–W9.6 are proposed, pending faculty approval). */
export const LAB_OBJECTIVES = [...W9.objectives.map((o) => ({ id: o.id, text: o.text, proposed: false })), ...PROPOSED_OBJECTIVES.map((o) => ({ id: o.id, text: o.text, proposed: true }))]

/** The engineering method (nine steps), with the lecture slides that teach each step. */
export const LAB_METHOD: { title: string; text: NewText; taught: string }[] = [
  { title: 'Needs', text: n('Each Week 1 need becomes a requirement usage in Needs: its ID as a quoted short name, its statement, condition and rationale as doc, the enterprise as subject, a stakeholder parameter typed by the Week 8 part definition of each stakeholder, and a frame for each concern it answers, and only those. Needs added in Week 2 have no stakeholders or concerns in the export: enter them in the tool, or record why none.'), taught: [t1('w9s1-frame', 13, 'Concerns and framing'), t1('w9s1-worked-needs', 14, 'AeroLink worked example I: the Needs package')].join('; ') },
  { title: 'Mission and objectives', text: n('The mission and each objective become requirement usages with the enterprise as subject; each need has a #serves dependency, from the need to the objective it serves.'), taught: t1('w9s1-dependency', 19, 'Dependencies, refinement and the direction rule') },
  { title: 'Stakeholder requirements', text: n('Each stakeholder requirement has the enterprise as subject. Name the measured feature of the enterprise, the comparison and the limit with its unit, from the Week 2 criterion; the tool adds the feature to the enterprise and writes the limit and the required constraint. A requirement left informal needs a disposition saying why.'), taught: [t1('w9s1-required-constraint', 10, 'Doc alone is not enough: the required constraint'), t2('w9s2-worked-stk', 5, 'Worked example III: anatomy of a stakeholder requirement')].join('; ') },
  { title: 'System requirements', text: n('Choose each system requirement’s subject first: the element its shall is about, an existing part definition of your model, or a named placeholder in Physical or Logical that Weeks 10 and 11 complete. Then the feature, comparison and limit. Mark two or more requirements of the same quantity and comparison as sharing a definition, or record why none share a form.'), taught: [t1('w9s1-subject', 8, 'The subject: what the requirement is about'), t1('w9s1-worked-latency', 16, 'Worked example II: three latency requirements, one definition')].join('; ') },
  { title: 'TBDs and TBRs', text: n('Keep the constraint of every requirement with a TBD or TBR. Leave a TBD limit empty: the tool records status tbd and the owner from your Week 2 register (enter the owner if none is linked). A TBR keeps its value and is recorded as tbc. Where a satisfier is known, consider binding the limit to its configured value by hand, as the worked example shows.'), taught: t2('w9s2-worked-tbd', 6, 'Worked example IV: a limit that is still to be decided') },
  { title: 'Assumptions', text: n('Write an assumption only when the condition bounds where the requirement applies and the required quantity depends on it; otherwise keep the condition in the feature’s name and the doc. Justify each assumption in one sentence in the trace-audit note.'), taught: [t1('w9s1-assume', 11, 'Assumptions: when a requirement applies'), t2('w9s2-worked-assume', 7, 'Worked example V: “in still air”: gate or reference condition?')].join('; ') },
  { title: 'Derivations and the trace audit', text: n('The tool writes one derivation for each parent link to a need or a requirement, the parent as the original end; links to capabilities wait for Week 10. Read the trace matrix and give every trace finding a disposition: an open item with an owner and a week, or no child needed with the reason. A disposition cannot claim a fix: correct the record, export it and import it again. Tick every need your Week 2 audit recorded as only partly covered and record its open item (the missing part, an owner, a week): the need then reads partial, not covered, in the matrix and the export.'), taught: [t1('w9s1-derivation', 18, 'Derivation: the library connection'), t2('w9s2-trace-matrix', 9, 'The trace matrix, read from the model')].join('; ') },
  { title: 'AI-assisted quality review', text: n(`Export the trace-matrix file, ask an AI tool for findings in four categories (${AI_CATEGORIES.join(', ')}), each tied to a requirement ID and a quoted phrase, and record every finding in the tool’s AI review log with your decision, the reason, and for an accepted one the change you made. At least ${MIN.aiFindings} findings (a team of three: ${MIN.aiFindingsThree}). Re-read every changed requirement against its need.`), taught: [t2('w9s2-ai-method', 14, 'The method: AI findings are candidates to disposition'), t2('w9s2-ai-demo', 15, 'Demonstrated on AeroLink: a seeded review set')].join('; ') },
  { title: 'Checker to zero errors', text: n('Run model v0.2 through the course-designated checker and correct it until the checker reports no errors; explain every warning in the log. A PASS shows the file parsed, every name resolved and no rule fired; it does not show that a requirement is the right one, that its subject is the right element, or that any design meets it.'), taught: [t1('w9s1-checker', 22, 'What the checker checks, and what it cannot'), t2('w9s2-common-errors', 10, 'Common errors in modeled requirements')].join('; ') },
]

/** The procedure, step by step: when, who (lead role) and the output. */
export const LAB_PROCEDURE: { step: string; when: string; who: string; output: string; detail: NewText }[] = [
  { step: 'One chain end to end', when: `In class, Session 2 (${S2_LAB.chain} min)`, who: 'Whole team', output: 'A started model', detail: n('Import the three files; model one need, the stakeholder requirement derived from it and one system requirement derived from that; preview and find both derivations.') },
  { step: 'Checkpoint fix', when: 'Day 1', who: 'Requirements & Compliance', output: 'The chain corrected', detail: n('Apply the instructor’s checkpoint note to the chain before modeling the rest.') },
  { step: 'Needs package', when: 'Days 1–2', who: 'Requirements & Compliance', output: 'Needs modeled', detail: n('Every need with its stakeholders and frames, checked against the Week 1 register line by line; needs added in Week 2 completed or dispositioned.') },
  { step: 'Stakeholder requirements', when: 'Days 2–3', who: 'Each member formalizes at least three', output: 'Requirements, part 1', detail: n('Feature, comparison and limit for every stakeholder requirement, or a disposition for one that stays informal.') },
  { step: 'System requirements', when: 'Days 2–4', who: 'Architecture (subjects); each member formalizes at least three', output: 'Requirements, part 2', detail: n('Subjects first, placeholders named; then feature, comparison and limit; one shared definition or its reason.') },
  { step: 'Derivations, groups, metadata and TBDs', when: 'Days 3–4', who: 'Verification & Validation', output: 'The trace in the model', detail: n('Read the derivations and the two groups in the preview; check every TBD has an owner; justify any assumption.') },
  { step: 'AI-assisted review', when: 'Day 5', who: 'AI & Data Management', output: 'AI review log', detail: n('Findings in four categories, each decided with a reason; accepted changes made in the record or the model.') },
  { step: 'Checker and trace audit', when: 'Day 6', who: 'Verification & Validation runs; owners fix', output: 'Checker log; dispositions', detail: n('Iterate to zero errors; explain every warning; a disposition for every trace finding.') },
  { step: 'AI usage statement and upload', when: 'Day 7', who: 'Verification & Validation', output: 'Submission', detail: n('Integration review; export the model and the trace matrix after the last change; upload the three files.') },
]

export const LAB_OUTPUT_FILES = LAB9_OUTPUTS.map((o) => ({ name: o.file, what: o.what }))

/** What model v0.2 and its trace matrix must contain, with the evidence, the minimum and how each is judged. */
export const LAB_PARTS: { heading: string; evidence: NewText; minimum: string; judged: string }[] = [
  { heading: 'Needs package', evidence: n('Every need as a requirement usage with the enterprise as subject, its stakeholders as parameters and a frame for each concern it answers; the mission and objectives; a #serves dependency from each need.'), minimum: 'Every Week 1 need present once, with at least one stakeholder and one frame, or a disposition', judged: 'RB-8.4; RB-9.1' },
  { heading: 'Requirements package', evidence: n('Every requirement with its ID as a quoted short name, its statement as doc, a subject, a required constraint where formalized, and its attributes, rationale and TBD status as metadata; two organizing groups.'), minimum: 'Every Week 2 requirement present once; every system requirement with an element subject and a required constraint or a recorded TBD with an owner', judged: 'RB-8.2; RB-8.4; RB-8.6' },
  { heading: 'Shared definition', evidence: n('One requirement definition used by requirements of the same form, each usage binding the measured feature and the limit.'), minimum: `At least ${MIN.sharedUsages} usages of one definition, or a one-line reason why no requirements share a form`, judged: 'RB-8.4' },
  { heading: 'Derivations and trace audit', evidence: n('A derivation for each parent link to a need or requirement; the trace matrix; a disposition for every trace finding; the Week 2 partly covered needs carried as open items (partial in the matrix); the trace-audit note.'), minimum: 'Every requirement with a parent relationship or a disposition; every finding dispositioned', judged: 'RB-9.1; RB-9.4' },
  { heading: 'AI review log', evidence: n('Each finding with its requirement, category, quoted phrase, decision, reason and change.'), minimum: `At least ${MIN.aiFindings} findings decided (team of three: ${MIN.aiFindingsThree})`, judged: 'RB-3.6; RB-12.2' },
  { heading: 'Checker log', evidence: n('The final run of model v0.2, with every warning explained.'), minimum: 'Zero errors in the final run', judged: 'RB-8.1; RB-12.3' },
  { heading: 'Requirement quality (sample)', evidence: n('The modeled requirements, read against the course conditions for well-formed, verifiable, rationale and parent trace.'), minimum: 'Judged on a sample of 10 requirements', judged: 'RB-3.1–3.4 (sample of 10)' },
  { heading: 'AI usage statement', evidence: n('Tool, purpose, prompts, what was accepted or rejected and why, with AI-suggested elements tagged.'), minimum: 'Present even if no AI tool was used', judged: 'RB-12.1–12.3' },
]

/** Rubric rows applied this week, read from the rubric register, never retyped. */
export const LAB_RUBRIC_ROWS: [string, string][] = [
  ['RB-8', '8.1'], ['RB-8', '8.2'], ['RB-8', '8.4'], ['RB-8', '8.6'],
  ['RB-9', '9.1'], ['RB-9', '9.4'],
  ['RB-12', '12.1'], ['RB-12', '12.2'], ['RB-12', '12.3'],
  ['RB-3', '3.1'], ['RB-3', '3.2'], ['RB-3', '3.3'], ['RB-3', '3.4'], ['RB-3', '3.6'],
]
export const LAB_RUBRIC_NOTE = n(
  'The rows of the course rubric this model is judged against. Grading is formative this week: written feedback on each row, returned before Week 10, Session 2; a faculty decision may make the Week 11 model the first graded model baseline. RB-8.4 is the core row: subject and ID, required constraint and derivation used correctly; a satisfy between requirements counts as misuse, and satisfy claims themselves are scored from Week 11. RB-8.6 applies to the Needs and Requirements packages. RB-9.1 applies to the upward trace (requirement to need or capability, need to stakeholder; a capability link waiting for Week 10 counts when it is recorded in the trace matrix). RB-9.4 applies to the trace audit and its dispositions. RB-3 is sample-based: the grader draws 10 modeled requirements and scores 3.1–3.4 on the share that meets each condition; RB-3.6 applies to the AI review log. RB-12.1–12.3 apply to the AI usage statement. The parse-error gate of RB-8 applies: more than two errors cap 8.2–8.6 at level 2, with a 24-hour repair window.',
)
/** Leveled rows (4 to 1) and the per-requirement condition rows of the sample-based audit (RB-3). */
export const isLeveled = (id: string) => id !== 'RB-3'
export const RUBRIC_LEVELS = ['4 Exemplary', '3 Proficient', '2 Developing', '1 Beginning']

export function rubricRow(id: string, criterion: string): string[] {
  const part = getRubric(id).parts.find((p) => p.type === 'table')
  const r = part && part.type === 'table' ? part.rows.find((x) => x[0] === criterion) : undefined
  if (!r) throw new Error(`${id} has no criterion ${criterion}`)
  return r
}

export const LAB_SUBMISSION = {
  format: n('Three files: team-NN-model-v02.sysml (model v0.2), team-NN-trace-matrix.md (the trace matrix, the requirements mapping table, the trace audit with dispositions, the partly covered needs, the trace-audit note and the AI review log, exported from the lab tool after the last change, with the AI usage statement added at its end), and team-NN-checker-log.txt (the final checker run).'),
  where: n(`One member uploads the three files to the ${modelDue.where} before Week 10, Session 1.`),
  grading: n('Formative: written feedback against the rubric rows above, returned before Week 10, Session 2.'),
  aiUse: 'AI tools may help draft documentation, review requirements or suggest SysML text; every AI-suggested element must pass the checker, be tagged AI-suggested-reviewed and be explained by its owner, and the AI usage statement says what the tool suggested and what you changed or rejected.',
}

export const LAB_TOOL = n(
  'The lab tool reads three files: your Week 8 model v0.1 (.sysml), your Week 1 model inputs and your Week 2 model inputs (.json). It refuses AeroLink files, files of another team and files whose packages are missing, each with the reason. For every requirement you choose the subject and enter the measured feature, the comparison, the limit and its unit; for every need you can correct its stakeholders and concerns. The tool writes model v0.2: it fills the Needs and Requirements packages, adds the measured features to the subjects and the placeholder subjects you name, and writes the derivations, groups and metadata. It computes the trace matrix and the trace audit, keeps the AI review log and shows a readiness list with the reason for every item still open. Only a real defect keeps an item out of the model (a reference to a stakeholder, concern or parent that is not in your files would not resolve). Its checks are course acceptance checks: whether the model is valid is decided by the course-designated checker, and a checker PASS does not show that a requirement is the right one. A model v0.2 exported from the tool can be imported again; the tool replaces what it generated, so keep hand edits in a separate file until the last export. Everything is saved in your browser only: export after every working session, and share the workspace file with teammates.',
)

/** Running the checker on model v0.2: the Week 8 guide's own commands for your model, with the file name changed. */
export const CHECKER_RUN_INTRO = n(`Your team installed the course checker in Week 8 (${CHECKER_TITLE.toLowerCase()}, on the Week 8 Laboratory page). Save the exported model in the checker’s models folder and run it the same way as model v0.1, naming your file. Run it after every change until it reports zero errors, and paste the final output into team-NN-checker-log.txt with a line explaining each warning.`)
const modelStep = STEPS.find((s) => s.id === 'model')!
export const CHECKER_RUN: { os: OsKey; label: string; commands: string[] }[] = (Object.keys(OS_LABEL) as OsKey[]).map((os) => ({ os, label: OS_LABEL[os], commands: (modelStep.commands?.[os] ?? []).map((c) => c.replace(/team-07-model-v01/g, 'team-07-model-v02')) }))

/** Workload: the lab's share of the week (rows of the week's workload table). */
const row = (id: string) => WORKLOAD_ROWS.find((r) => r.id === id)!
export const LAB_WORKLOAD: { activity: string; hours: number }[] = [
  { activity: `Lab launch in class (Session 2, ${S2_LAB.total} min; inside the class hours)`, hours: 0 },
  { activity: row('lab').activity, hours: row('lab').hours },
]
export const LAB_WORKLOAD_NOTE = n(
  `About ${LAB_TEAM_HOURS.toFixed(1)} person-hours of out-of-class work for a team of four (${LAB_PERSON_HOURS.map((t) => `${t.task} ${t.hours.toFixed(1)}`).join('; ')}), so about ${row('lab').hours.toFixed(1)} h each. A team of three works to a reduced scope (${THREE_PERSON.tasks.filter((t) => t.scope !== 'as for a team of four').map((t) => `${t.task}: ${t.scope}`).join('; ')}): about ${THREE_PERSON.teamHours.toFixed(1)} person-hours, about ${THREE_PERSON.each.toFixed(1)} h each. Workload proportional to team size is pending faculty confirmation. See the workload table on the week page.`,
)

// ------------------------------------------------------------------------------------------- Markdown
const cite = (c: Citation) => formatCitation(c)
const md = (s: string) => s.replace(/\|/g, '\\|')

/** The same instructions as the Laboratory page, as Markdown (docs/lectures/week09/WEEK9_LAB_INSTRUCTIONS.md). */
export function labMarkdown(): string {
  const L: string[] = []
  const table = (head: string[], rows: string[][]) => {
    L.push(`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`)
    for (const r of rows) L.push(`| ${r.map((c) => md(c).replace(/\n/g, ' ')).join(' | ')} |`)
    L.push('')
  }
  L.push(`# Week 9 ${LAB_TITLE}`, '')
  L.push('> Generated from `learning-studio/src/content/lab/week09Lab.ts` by `node scripts/build-lab-md.mjs 9`; the Laboratory page (`#/week/9/lab`) renders the same source. Do not edit this file by hand. Review status: new-pending-review.', '')
  L.push(`Week 9 — ${W9.title}. AeroLink is the instructor’s FICTIONAL worked example; this model is of your team’s own enterprise.`, '')
  L.push('## Purpose', '', LAB_PURPOSE.text, '')
  table(['', ''], LAB_AT_A_GLANCE.map((x) => [`**${x.label}**`, x.value]))
  L.push('## Inputs', '')
  for (const i of LAB_INPUTS) L.push(`- ${i.text.text}${i.cites ? ` ${i.cites.map(cite).join('; ')}.` : ''}`)
  L.push('', '## Objectives', '')
  for (const o of LAB_OBJECTIVES) L.push(`- **${o.id}** ${o.text}${o.proposed ? ' *(proposed, pending faculty approval)*' : ''}`)
  L.push('', '## Engineering method', '')
  LAB_METHOD.forEach((m, i) => L.push(`${i + 1}. **${m.title}.** ${m.text.text} *(Taught in: ${m.taught}.)*`))
  L.push('', '## The Week 9 mapping (course convention)', '')
  table(['Artifact', 'From', 'Becomes', 'Where'], W9_MAPPING.map((m) => [m.artifact, m.from, m.becomes, m.where]))
  L.push('## Procedure', '')
  table(['Step', 'When', 'Who (lead role)', 'Output', 'What to do'], LAB_PROCEDURE.map((p, i) => [`${i + 1}. ${p.step}`, p.when, p.who, p.output, p.detail.text]))
  L.push('## Expected outputs', '', 'Three files:', '')
  for (const f of LAB_OUTPUT_FILES) L.push(`- \`${f.name}\`: ${f.what}.`)
  L.push('', 'The minimum is the completeness check the lab tool and the instructor apply first.', '')
  table(['Part', 'Evidence required', 'Minimum (completeness check)', 'Judged by'], LAB_PARTS.map((p) => [p.heading, p.evidence.text, p.minimum, p.judged]))
  L.push('## Trace-audit finding classes (course convention)', '')
  table(['Class', 'Meaning'], W9_FINDING_CLASSES.map((c) => [c.label, c.meaning]))
  L.push('## Grading rubric rows', '', LAB_RUBRIC_NOTE.text, '')
  table(['Criterion', ...RUBRIC_LEVELS], LAB_RUBRIC_ROWS.filter(([rb]) => isLeveled(rb)).map(([rb, c]) => {
    const r = rubricRow(rb, c)
    return [`${rb}.${r[0].split('.')[1]} ${r[1]}`, ...r.slice(2, 6)]
  }))
  table(['Criterion (sample-based audit)', 'Condition checked'], LAB_RUBRIC_ROWS.filter(([rb]) => !isLeveled(rb)).map(([rb, c]) => {
    const r = rubricRow(rb, c)
    return [`${rb}.${r[0].split('.')[1]} ${r[1]}`, r[2]]
  }))
  L.push('## Submission', '')
  L.push(`- **Format.** ${LAB_SUBMISSION.format.text}`, `- **Where and when.** ${LAB_SUBMISSION.where.text}`, `- **How it is graded.** ${LAB_SUBMISSION.grading.text}`, `- **AI use.** ${LAB_SUBMISSION.aiUse}`, '')
  L.push('## The lab tool', '', LAB_TOOL.text, '')
  L.push('## Running the checker on model v0.2', '', CHECKER_RUN_INTRO.text, '')
  for (const r of CHECKER_RUN) L.push(`${r.label}:`, '', '```', ...r.commands, '```', '')
  L.push('## Workload', '')
  table(['Activity', 'Hours per student'], LAB_WORKLOAD.map((w) => [w.activity, w.hours ? w.hours.toFixed(1) : 'in class']))
  L.push(LAB_WORKLOAD_NOTE.text, '')
  return L.join('\n')
}
