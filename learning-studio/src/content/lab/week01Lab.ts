// Lab L1, the Week 1 Team Record: the full laboratory instructions, single source for the Laboratory page
// (#/week/1/lab, src/week1/Lab.tsx) and docs/lectures/week01/WEEK1_LAB_INSTRUCTIONS.md (labMarkdown(), written by
// `npm run lab:md`; week01Lab.test.ts fails when the file and this module differ).
//
// Built on the lecture outline's "Laboratory outline" (docs/lectures/week01/WEEK1_LECTURE_OUTLINE.md §4), the Session 2
// lab launch slides, and the existing Team Record specification (TEAM_RECORD in src/content/learn/week01.ts), whose
// minimums are the checks the Team enterprise view applies (src/workbench/week1/team.ts). Sign-off review 2026-10-19:
// the lecture is the authoritative source. The in-class minutes come from the Session 2 slides (week1Path.ts S2_LAB,
// M4); the need form, the six checks, the PRT meaning and the minimums (REL ≥ 3 with a conflict, required as the
// lecture sets it: Mo1) from src/content/lectures/week01/labBrief.ts; problem, mission and goals are recorded (M3).
// Review status: new-pending-review. AeroLink is FICTIONAL; the record is always about the team's own enterprise.
import { WEEKS } from '../course'
import { formatCitation, type Citation } from '../readings'
import { getRubric } from '../rubrics'
import week01 from '../weeks/week01'
import { MODEL_INPUTS, TEAM_RECORD } from '../learn/week01'
import { PENDING, type NewText } from '../learn/types'
import { S2_LAB, TEAM_RECORD_PERSON_HOURS, TEAM_RECORD_TEAM_HOURS, THREE_PERSON, WORKLOAD, WORKLOAD_ROWS } from '../week1Path'
import { LAB_MINIMUMS as MIN, LAB_MINIMUMS_THREE as MIN3, NEED_FORM, NEED_GATE_TEXT, PRT_MEANING, WEEK1_PREFIXES } from '../lectures/week01/labBrief'

const n = (text: string): NewText => ({ text, review: PENDING })
const W1 = WEEKS[0]

export const LAB_REVIEW = PENDING
export const LAB_TITLE = 'Lab L1: the Week 1 Team Record'

export const LAB_PURPOSE = n(
  'Apply the Week 1 method to your team’s own enterprise, never to AeroLink: form the team, propose the enterprise and its system of interest for approval, draw its context, find and classify its stakeholders, and write and audit its first needs. The result, the Week 1 Team Record, is the first part of the Systems Thinking Engineering Package (Week 7), and its IDs become the keys of your SysML v2 model in Phase II.',
)

export const LAB_AT_A_GLANCE: { label: string; value: string }[] = [
  { label: 'Setting', value: 'Team (3 or 4 members); launched in class, completed out of class' },
  { label: 'In class', value: `Session 2, ${S2_LAB.total} min: the brief (${S2_LAB.brief} min), the charter (${S2_LAB.charter} min: roles, tie-break, lead candidate), the enterprise pitch (${S2_LAB.pitch} min, up to ${S2_LAB.pitchTeams} teams) and the close (${S2_LAB.close} min); norms and ID owners are finished by the end of day 1` },
  { label: 'Out of class', value: 'Seven days, by the procedure below' },
  { label: 'Due', value: `${week01.assignment.due}; one team member uploads both files` },
  { label: 'Grading', value: 'Formative: written feedback against the rubric rows below, returned before Week 2, Session 2' },
]

/** Inputs (outline §4.1). Readings outside the Week 1 register list are marked as further reading. */
export const LAB_INPUTS: { text: NewText; cites?: Citation[]; to?: string }[] = [
  { text: n('Your enterprise idea as approved, or submitted for approval, at the Session 2 checkpoint (the pitch).') },
  { text: n('The Session 1 and Session 2 lectures and the detailed lesson, above all the AeroLink worked example: the register, concern to need in six steps, the reference needs and the coverage audit.'), to: '/week/1/examples' },
  { text: n('The required readings for the week.'), cites: W1.readings },
  { text: n('Further reading that helps with the purpose statement and the need attributes (not required this week).'), cites: [{ reading: 'R10', pages: '543–546' }, { reading: 'R53', pages: '295–297' }] },
  { text: n('The lab tool: the Team enterprise view, which checks every part as you go, imports a teammate’s export and exports the record. A blank Markdown template is available for offline work.'), to: '/week/1/lab/tool' },
]

/** Objectives this lab practices (course.ts IDs; B1.7 is proposed, pending faculty approval). */
export const LAB_OBJECTIVES = [
  ...week01.lab.objectives.map((id) => {
    const o = W1.objectives.find((x) => x.id === id)!
    return { id, text: o.text, proposed: false }
  }),
  { id: 'B1.7', text: 'Evaluate a set of needs for coverage, conflict and priority (the coverage audit)', proposed: true },
]

/** The engineering method the team applies (outline §4.3), with the lecture slides that teach each step. */
export const LAB_METHOD: { title: string; text: NewText; taught: string }[] = [
  { title: 'Charter', text: n(`In class: assign the lead roles to different members, agree decision rules including a tie-break, and choose the team’s lead candidate enterprise. By the end of day 1: set communication norms and give each member owned ID prefixes, with one owner each for ${WEEK1_PREFIXES.join(', ')} (Architecture usually holds ENT, PRT, EXT and REL).`), taught: 'Session 1, team charter; Session 2, lab launch' },
  { title: 'Enterprise and system of interest', text: n(`Name the enterprise and its domain; state the problem statement in one sentence; state the mission (MGO-001) in one sentence, a purpose and not a product, and break it into goals (MGO-002 …); state the system of interest inside the enterprise in one sentence; list the elements inside the boundary of the system of interest, each with a PRT ID (a PRT is ${PRT_MEANING}; in Week 8 each becomes a part of your system); and argue why it suits a 14-week project.`), taught: 'Session 1, system concepts and Business or Mission Analysis' },
  { title: 'Context', text: n('Draw the boundary, then the immediate environment: each external system or actor, what crosses the boundary (people, materials, energy, information, approvals) and its direction.'), taught: 'Session 1, boundary and context' },
  { title: 'Stakeholder identification', text: n('Run all three methods: the life-cycle sweep, the context (who stands behind each external system) and the role classes. Check approving authorities explicitly; a register without one is incomplete.'), taught: 'Session 1, identifying stakeholders' },
  { title: 'Classification and concerns', text: n('For each stakeholder record the role, the life-cycle stage, internal or external, whether it is an approving authority, one or more specific concerns, and influence from 1 to 5 with a reason.'), taught: 'Session 1, classifying; Session 2, concerns' },
  { title: 'Relationships', text: n(`Record how stakeholders relate as REL rows (from, to, type, note): at least ${MIN.relationships}, including at least ${MIN.conflicts} conflict between two stakeholders’ concerns (“conflicts with”). Required, as the lecture sets it (faculty decision recorded; scoring under RB-1.4 is proposed).`), taught: 'Session 2, the register and conflict' },
  { title: 'Needs', text: n(`Write each need with the six-step method (start from the concern, ask why, strip design and requirement wording, attribute, state the condition, record and check), preferably in the recommended form “${NEED_FORM}”, which names your system of interest and keeps the stakeholder’s view. Another phrasing is accepted when it names the stakeholder and the outcome and is neither a requirement nor a solution. Check it against the layered characteristics and the six minimum checks (${NEED_GATE_TEXT}); trace it to the concern it answers and to the mission or a goal; give it a priority in MITRE’s categories (mandatory, critical, desirable or optional, as the lecture defines them).`), taught: 'Session 2, needs and the worked example' },
  { title: 'Coverage audit', text: n('Build the stakeholder-by-need matrix. For every stakeholder without a need, either add a need or record why its concern is not a need on the system of interest; check that every approving authority is covered and look for conflicts between needs.'), taught: 'Session 2, worked example III' },
]

/** The procedure, step by step (outline §4.4). */
export const LAB_PROCEDURE: { step: string; when: string; who: string; output: string; detail: NewText }[] = [
  { step: 'Charter', when: `In class, Session 2 (${S2_LAB.charter} min); finished by the end of day 1`, who: 'Whole team', output: 'Part 1', detail: n(`In class: the four lead roles, each a different member; decision rules with a tie-break; the lead candidate enterprise. The instructor checks the tie-break rule at every table. By the end of day 1: the communication norms and the owner of each ID prefix (${WEEK1_PREFIXES.join(', ')}), entered in part 1 of the lab tool.`) },
  { step: 'Enterprise pitch and decision', when: `In class, Session 2 (${S2_LAB.pitch} min, up to ${S2_LAB.pitchTeams} teams)`, who: 'Architecture lead presents', output: 'Part 2 decision and date', detail: n(`In about 90 seconds state the enterprise; the problem and the mission, one sentence each; the system of interest inside the enterprise; and its boundary. Name one approving authority and one stakeholder who is not a customer or user. Record the instructor’s decision and its date. With more than ${S2_LAB.pitchTeams} teams, the others post the pitch card on the LMS and are decided within 48 hours.`) },
  { step: 'Proposal write-up', when: 'Days 1–2', who: 'Architecture', output: 'Part 2', detail: n(`Problem statement and mission (MGO-001), one sentence each; goals (MGO-002 …); the system of interest; at least ${MIN.inside} elements inside its boundary (PRT); and a suitability paragraph of at least 40 words.`) },
  { step: 'Context', when: 'Days 1–2', who: 'Architecture', output: 'Part 3', detail: n('At least six external systems or actors (EXT), each with what crosses the boundary and its direction.') },
  { step: 'Stakeholder sweep', when: 'Days 2–3', who: 'Everyone; Requirements & Compliance merges', output: 'Candidate list', detail: n('Each member runs one identification method independently, then the team merges the lists and notes which stakeholders only one method found.') },
  { step: 'Register and relationships', when: 'Days 3–4', who: 'Requirements & Compliance (STK, CON); Architecture (relationships)', output: 'Part 4', detail: n(`At least ${MIN.stakeholders} stakeholders, classified, each with specific concerns and an influence rating with a reason, from at least ${MIN.roleGroups} role groups, with at least one approving authority; at least ${MIN.relationships} relationships (REL rows: from, to, type, note), at least ${MIN.conflicts} of them a conflict.`) },
  { step: 'Needs', when: 'Days 4–5', who: 'Requirements & Compliance drafts; each member writes at least two', output: 'Part 5', detail: n(`At least ${MIN.needs} needs from at least ${MIN.needSources} stakeholders (a three-person team: ${MIN3.needs} from ${MIN3.needSources}, pending faculty approval), including an approving authority; each stated as a need (recommended form: “${NEED_FORM}”), with condition, rationale, priority (mandatory, critical, desirable or optional), source stakeholders and concerns, the goal it serves (MGO), and the team’s self-check of the six minimum checks.`) },
  { step: 'Self-check and coverage audit', when: 'Day 6', who: 'Verification & Validation lead', output: 'Part 5 self-check, audit note', detail: n('Check every need against the layered characteristics; build the coverage matrix and record a reason for every stakeholder without a need.') },
  { step: 'AI usage statement', when: 'Day 6', who: 'AI & Data lead', output: 'Part 6', detail: n('Tool, purpose, prompts, what you accepted or rejected and why; tag every AI-suggested stakeholder or need AI-suggested-reviewed. The statement is required even if no AI tool was used.') },
  { step: 'Integration review, export and upload', when: 'Day 7', who: 'Verification & Validation lead', output: 'Submission', detail: n('Review the whole record for consistency, export the Markdown record and the JSON model inputs from the lab tool after the last change, and upload both files.') },
]

/** Expected outputs: the two files, and the six parts with the evidence and minimums the tool checks. */
export const LAB_OUTPUT_FILES = [
  { name: 'team-NN-week1-record.md', what: 'The six parts (five engineering outputs and the AI usage statement) as headed Markdown, ready to read' },
  { name: 'team-NN-week1-model-inputs.json', what: 'The same data with IDs and the SysML v2 element each item will seed (Phase II)' },
]
export const LAB_PARTS = TEAM_RECORD.parts

/** Rubric rows applied this week (outline §4.6), read from the rubric register, never retyped. */
export const LAB_RUBRIC_ROWS: [string, string][] = [...TEAM_RECORD.rubricRows, ['RB-12', '12.1'], ['RB-12', '12.2'], ['RB-12', '12.3']]
export const LAB_RUBRIC_NOTE = n(
  `${TEAM_RECORD.rubricNote.text} RB-12.1–12.3 apply to the AI usage statement. The relationships minimum (at least ${MIN.relationships}, at least ${MIN.conflicts} conflict) is a completeness check now, as the lecture sets it; scoring it under RB-1.4 (at most 3 this week) and RB-1.5 (stable IDs and figure text equivalents) are proposed for Week 1, pending faculty decision. The charter and the instructor’s decision are completeness checks, not scored.`,
)
export const RUBRIC_LEVELS = ['4 Exemplary', '3 Proficient', '2 Developing', '1 Beginning']

export function rubricRow(id: string, criterion: string): string[] {
  const part = getRubric(id).parts.find((p) => p.type === 'table')
  const r = part && part.type === 'table' ? part.rows.find((x) => x[0] === criterion) : undefined
  if (!r) throw new Error(`${id} has no criterion ${criterion}`)
  return r
}

export const LAB_SUBMISSION = { format: TEAM_RECORD.format, where: TEAM_RECORD.where, grading: TEAM_RECORD.grading, aiUse: week01.assignment.aiUse }

/** The tool notes: what the lab tool does, and how a team shares one record. */
export const LAB_TOOL = n(
  `The Team enterprise view is the lab tool. Each part shows its checks as you type, the same checks the instructor applies first: that each need is a sentence naming a registered stakeholder and an outcome, not a requirement (“shall”) or a named solution (a need in another phrasing than “${NEED_FORM}” is accepted, with a note recommending that form), the six minimum checks, the trace of every need to its concern and to the mission or a goal, and the relationship rows. One member can enter the record and export the model inputs; teammates import that JSON file to see and continue the same record. Everything is saved in your browser only, so export after every working session.`,
)
export const LAB_MODEL_INPUTS = MODEL_INPUTS

/** Workload: the lab's share of the week (the stated rows of the week's workload table). */
export const LAB_WORKLOAD: { activity: string; hours: number }[] = [
  { activity: `Lab launch in class (Session 2, ${S2_LAB.total} min; inside the class hours)`, hours: 0 },
  { activity: WORKLOAD_ROWS.candidate.activity, hours: WORKLOAD_ROWS.candidate.hours },
  { activity: WORKLOAD_ROWS.team.activity, hours: WORKLOAD_ROWS.team.hours },
]
export const LAB_WORKLOAD_NOTE = n(
  `About ${TEAM_RECORD_TEAM_HOURS.toFixed(1)} person-hours of out-of-class work for a team of four (${TEAM_RECORD_PERSON_HOURS.map((t) => `${t.task} ${t.hours.toFixed(1)}`).join('; ')}), so about ${WORKLOAD.teamHours.toFixed(1)} h each. A team of three, with the reduced needs minimum (${MIN3.needs} needs from ${MIN3.needSources} stakeholders, pending faculty approval), carries about ${THREE_PERSON.teamHours.toFixed(1)} person-hours, about ${THREE_PERSON.each.toFixed(1)} h each, so its week is about ${THREE_PERSON.week.toFixed(1)} h, ${THREE_PERSON.over.toFixed(1)} h over the 8 h budget (flagged for faculty decision). The whole week for a team of four is ${WORKLOAD.total.toFixed(1)} h per student; see the workload table on the week page.`,
)

// ------------------------------------------------------------------------------------------- Markdown
const cite = (c: Citation) => formatCitation(c)
const md = (s: string) => s.replace(/\|/g, '\\|')

/** The same instructions as the Laboratory page, as Markdown (docs/lectures/week01/WEEK1_LAB_INSTRUCTIONS.md). */
export function labMarkdown(): string {
  const L: string[] = []
  const table = (head: string[], rows: string[][]) => {
    L.push(`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`)
    for (const r of rows) L.push(`| ${r.map((c) => md(c).replace(/\n/g, ' ')).join(' | ')} |`)
    L.push('')
  }
  L.push(`# Week 1 ${LAB_TITLE}`, '')
  L.push('> Generated from `learning-studio/src/content/lab/week01Lab.ts` by `npm run lab:md`; the Laboratory page (`#/week/1/lab`) renders the same source. Do not edit this file by hand. Review status: new-pending-review.', '')
  L.push(`Week 1 — ${W1.title}. AeroLink is the instructor’s FICTIONAL worked example; this record is about your team’s own enterprise.`, '')
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
  L.push('', 'The record has six parts. The minimum is the completeness check the lab tool and the instructor apply first.', '')
  table(['Part', 'Evidence required', 'Minimum (completeness check)', 'Judged by'], LAB_PARTS.map((p) => [p.heading, p.evidence.text, p.minimum, p.judged]))
  L.push('## Grading rubric rows', '', LAB_RUBRIC_NOTE.text, '')
  table(['Criterion', ...RUBRIC_LEVELS], LAB_RUBRIC_ROWS.map(([rb, c]) => {
    const r = rubricRow(rb, c)
    return [`${rb}.${r[0].split('.')[1]} ${r[1]}`, ...r.slice(2, 6)]
  }))
  L.push('## Submission', '')
  L.push(`- **Format.** ${LAB_SUBMISSION.format.text}`, `- **Where and when.** ${LAB_SUBMISSION.where.text}`, `- **How it is graded.** ${LAB_SUBMISSION.grading.text}`, `- **AI use.** ${LAB_SUBMISSION.aiUse}`, '')
  L.push('## The lab tool', '', LAB_TOOL.text, '', LAB_MODEL_INPUTS.lede.text, '')
  table(['Week 1 item', 'Captured as', 'Seeds in SysML v2 (Phase II reading)'], LAB_MODEL_INPUTS.rows.map((r) => [r.item, r.captured, r.seeds.map((s) => `\`${s.element}\`: ${s.note}${s.cite ? ` (${s.cite.reading} p.${s.cite.pages})` : ''}`).join('; ')]))
  L.push('## Workload', '')
  table(['Activity', 'Hours per student'], LAB_WORKLOAD.map((w) => [w.activity, w.hours ? w.hours.toFixed(1) : 'in class']))
  L.push(LAB_WORKLOAD_NOTE.text, '')
  return L.join('\n')
}
