// Lab L9 instructions: one source for the page and WEEK9_LAB_INSTRUCTIONS.md; the rubric rows resolve in the register;
// the workload rows sum as stated and the lab row is the team's person-hours over four; a team of three carries the same
// load per person; the checker commands are the Week 8 guide's own, for model v0.2; no internal IDs (other than rubric
// row codes in the "judged by" column and the rubric note) in the prose; AeroLink only as the instructor's example. Each
// content check is shown able to fail.
import { describe, expect, it } from 'vitest'
import labMdFile from '../../../docs/lectures/week09/WEEK9_LAB_INSTRUCTIONS.md?raw'
import { LAB9_TEAM_HOURS } from '../lectures/week09/labBrief'
import { THREE_PERSON, WEEK9_BUDGET_HOURS, WORKLOAD_ROWS, WORKLOAD_TOTAL } from '../week9Path'
import {
  CHECKER_RUN, LAB_AT_A_GLANCE, LAB_INPUTS, LAB_METHOD, LAB_PARTS, LAB_PROCEDURE, LAB_PURPOSE, LAB_RUBRIC_ROWS, LAB_SUBMISSION, LAB_TITLE, LAB_TOOL, LAB_WORKLOAD, LAB_WORKLOAD_NOTE, labMarkdown, rubricRow,
} from './week09Lab'

const prose = () => [
  LAB_TITLE, LAB_PURPOSE.text, ...LAB_AT_A_GLANCE.flatMap((x) => [x.label, x.value]), ...LAB_INPUTS.map((x) => x.text.text),
  ...LAB_METHOD.flatMap((m) => [m.title, m.text.text]), ...LAB_PROCEDURE.flatMap((p) => [p.step, p.when, p.who, p.output, p.detail.text]),
  ...LAB_PARTS.flatMap((p) => [p.heading, p.evidence.text, p.minimum]), LAB_SUBMISSION.format.text, LAB_SUBMISSION.where.text, LAB_SUBMISSION.grading.text, LAB_SUBMISSION.aiUse,
  LAB_TOOL.text, ...LAB_WORKLOAD.map((w) => w.activity), LAB_WORKLOAD_NOTE.text,
]
const INTERNAL = /\bRB-\d|\bFD-\d|DECISION_LOG|§|\bA2[0-7]\b|\boutline\b|\bS\d{2}\b|\bW9\.\d|\bB9\.\d|\bnew-pending-review\b|\bR\d{2,3}[a-z]?\b/
const leaks = (texts: string[]) => texts.filter((t) => INTERNAL.test(t))
const aeroAsTeam = (texts: string[]) => texts.filter((t) => /aero\s*-?\s*link/i.test(t)).filter((t) => !/never AeroLink|AeroLink (?:files|Needs)|AeroLink is|worked example|instructor/i.test(t))

describe('Lab L9 instructions', () => {
  it('the page and WEEK9_LAB_INSTRUCTIONS.md come from one source (run `node scripts/build-lab-md.mjs 9` after changing week09Lab.ts or the Week 9 lectures)', () => {
    expect(labMdFile.replace(/\r\n/g, '\n')).toBe(labMarkdown())
  })
  it('every rubric row resolves in the register; a missing row throws', () => {
    for (const [rb, c] of LAB_RUBRIC_ROWS) expect(rubricRow(rb, c)[0]).toBe(c)
    expect(LAB_RUBRIC_ROWS.map(([, c]) => c)).toEqual(['8.1', '8.2', '8.4', '8.6', '9.1', '9.4', '12.1', '12.2', '12.3', '3.1', '3.2', '3.3', '3.4', '3.6'])
    expect(() => rubricRow('RB-8', '8.9')).toThrow()
  })
  it('workload: the rows sum to the total within the budget; the lab row is the team person-hours over four; a team of three carries the same load per person', () => {
    expect(Math.round(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0) * 10) / 10).toBe(WORKLOAD_TOTAL)
    expect(WORKLOAD_TOTAL).toBeLessThanOrEqual(WEEK9_BUDGET_HOURS)
    const lab = WORKLOAD_ROWS.find((r) => r.id === 'lab')!.hours
    expect(lab).toBe(Math.round((LAB9_TEAM_HOURS / 4) * 10) / 10)
    expect(Math.abs(THREE_PERSON.each - lab)).toBeLessThanOrEqual(0.1)
    expect(LAB_WORKLOAD.find((w) => w.activity.startsWith('Lab L9'))!.hours).toBe(lab)
  })
  it('the procedure runs from the in-class chain to the upload; nine method steps', () => {
    expect(LAB_PROCEDURE.map((p) => p.when)).toEqual([expect.stringMatching(/^In class, Session 2 \(\d+ min\)$/), 'Day 1', 'Days 1–2', 'Days 2–3', 'Days 2–4', 'Days 3–4', 'Day 5', 'Day 6', 'Day 7'])
    expect(LAB_METHOD).toHaveLength(9)
  })
  it('the checker commands are the Week 8 guide’s, for model v0.2, on every system', () => {
    expect(CHECKER_RUN.map((r) => r.os)).toEqual(['windows', 'macos', 'linux'])
    for (const r of CHECKER_RUN) expect(r.commands.join(' ')).toMatch(/check_sysml\.py models[\\/]team-07-model-v02\.sysml/)
  })
  it('the prose carries no internal IDs and names AeroLink only as the instructor’s example (and the check can fail)', () => {
    expect(leaks(prose())).toEqual([])
    expect(aeroAsTeam(prose())).toEqual([])
    expect(leaks(['see RB-8.1', 'objective W9.3', 'DECISION_LOG A21', 'R83 p.161'])).toHaveLength(4)
    expect(aeroAsTeam(['Model AeroLink in your lab.'])).toHaveLength(1)
  })
  it('the lab tool text states the checker boundary and the regeneration rule', () => {
    expect(LAB_TOOL.text).toMatch(/course acceptance checks/)
    expect(LAB_TOOL.text).toMatch(/does not show that a requirement is the right one/)
    expect(LAB_TOOL.text).toMatch(/can be imported again/)
  })
})

// Review N2: the student-visible exercise rubric accepts either classification when the reason matches the definition
// used, and does not give away the diagnosis before the attempt (the specific key is in the instructor's marking notes).
import { EXERCISE_RUBRIC } from '../week9Assessment'
import keyFile from '../../../sysml/instructor/week09/exercise_flood_warning_key.sysml?raw'
describe('Week 9 exercise rubric, diagnosis row', () => {
  const top = EXERCISE_RUBRIC.find((r) => r.criterion.startsWith('Diagnosis'))!.levels[0]
  it('names both classifications with their definitions and reveals neither defect', () => {
    expect(top).toMatch(/requirement verification when a characteristic of a good requirement is breached/)
    expect(top).toMatch(/requirement validation when the requirement does not carry the intent of its need/)
    expect(top).not.toMatch(/REQ-STK-003|REQ-SYS-003|SMS/)
  })
  it('the instructor key accepts either classification for REQ-STK-003 and states REQ-SYS-003 explicitly', () => {
    expect(keyFile).toMatch(/REQ-STK-003[\s\S]*Accept EITHER classification/)
    expect(keyFile).toMatch(/REQ-SYS-003[\s\S]*Expected classification: requirement\s*\/\/\s*verification/)
  })
})
