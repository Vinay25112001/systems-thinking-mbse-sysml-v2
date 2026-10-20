// Lab L8 instructions: one source for the page and WEEK8_LAB_INSTRUCTIONS.md; the rubric rows resolve in the register;
// the workload rows sum as stated and the lab row is the team's person-hours over four; a team of three carries the same
// load per person; no internal IDs (other than rubric row codes in the "judged by" column and the rubric note) in the
// prose; AeroLink only as the instructor's example. Each content check is shown able to fail.
import { describe, expect, it } from 'vitest'
import labMdFile from '../../../docs/lectures/week08/WEEK8_LAB_INSTRUCTIONS.md?raw'
import { LAB8_TEAM_HOURS } from '../lectures/week08/labBrief'
import { THREE_PERSON, WEEK8_BUDGET_HOURS, WORKLOAD_ROWS, WORKLOAD_TOTAL } from '../week8Path'
import {
  LAB_AT_A_GLANCE, LAB_INPUTS, LAB_METHOD, LAB_PARTS, LAB_PROCEDURE, LAB_PURPOSE, LAB_RUBRIC_ROWS, LAB_SUBMISSION, LAB_TITLE, LAB_TOOL, LAB_WORKLOAD, LAB_WORKLOAD_NOTE, labMarkdown, rubricRow,
} from './week08Lab'

const prose = () => [
  LAB_TITLE, LAB_PURPOSE.text, ...LAB_AT_A_GLANCE.flatMap((x) => [x.label, x.value]), ...LAB_INPUTS.map((x) => x.text.text),
  ...LAB_METHOD.flatMap((m) => [m.title, m.text.text]), ...LAB_PROCEDURE.flatMap((p) => [p.step, p.when, p.who, p.output, p.detail.text]),
  ...LAB_PARTS.flatMap((p) => [p.heading, p.evidence.text, p.minimum]), LAB_SUBMISSION.format.text, LAB_SUBMISSION.where.text, LAB_SUBMISSION.grading.text, LAB_SUBMISSION.aiUse,
  LAB_TOOL.text, ...LAB_WORKLOAD.map((w) => w.activity), LAB_WORKLOAD_NOTE.text,
]
const INTERNAL = /\bRB-\d|\bFD-\d|DECISION_LOG|§|\bA2[01]\b|\boutline\b|\bS\d{2}\b|\bW8\.\d|\bB8\.\d|\bnew-pending-review\b/
const leaks = (texts: string[]) => texts.filter((t) => INTERNAL.test(t))
const aeroAsTeam = (texts: string[]) => texts.filter((t) => /aero\s*-?\s*link/i.test(t)).filter((t) => !/never AeroLink|the AeroLink (?:mapping|import)|worked example|instructor/i.test(t))

describe('Lab L8 instructions', () => {
  it('the page and WEEK8_LAB_INSTRUCTIONS.md come from one source (run `node scripts/build-lab-md.mjs 8` after changing week08Lab.ts or the Week 8 lectures)', () => {
    expect(labMdFile.replace(/\r\n/g, '\n')).toBe(labMarkdown())
  })
  it('every rubric row resolves in the register; a missing row throws', () => {
    for (const [rb, c] of LAB_RUBRIC_ROWS) expect(rubricRow(rb, c)[0]).toBe(c)
    expect(LAB_RUBRIC_ROWS.map(([, c]) => c)).toEqual(['8.1', '8.2', '8.3', '8.6', '1.3', '1.4', '9.4', '12.1', '12.2', '12.3'])
    expect(() => rubricRow('RB-8', '8.9')).toThrow()
  })
  it('workload: the rows sum to the total within the budget; the lab row is the team person-hours over four; a team of three carries the same load per person', () => {
    expect(Math.round(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0) * 10) / 10).toBe(WORKLOAD_TOTAL)
    expect(WORKLOAD_TOTAL).toBeLessThanOrEqual(WEEK8_BUDGET_HOURS)
    const lab = WORKLOAD_ROWS.find((r) => r.id === 'lab')!.hours
    expect(lab).toBe(Math.round((LAB8_TEAM_HOURS / 4) * 10) / 10)
    expect(Math.abs(THREE_PERSON.each - lab)).toBeLessThanOrEqual(0.1)
    expect(LAB_WORKLOAD.find((w) => w.activity.startsWith('Lab L8'))!.hours).toBe(lab)
  })
  it('the procedure runs from the checker installation and the tool proof to the upload, with the in-class matrix draft', () => {
    expect(LAB_PROCEDURE.map((p) => p.when)).toEqual(['Between Session 1 and Session 2', 'Before Session 2; shown at the checkpoint', expect.stringMatching(/^In class, Session 2 \(\d+ min\)$/), 'Days 1–2', 'Day 3', 'Days 3–4', 'Day 5', 'Day 6', 'Day 6', 'Day 7'])
    expect(LAB_METHOD).toHaveLength(8)
  })
  it('the prose carries no internal IDs and names AeroLink only as the instructor’s example (and the check can fail)', () => {
    expect(leaks(prose())).toEqual([])
    expect(aeroAsTeam(prose())).toEqual([])
    expect(leaks(['see RB-8.1', 'objective W8.3', 'DECISION_LOG A21'])).toHaveLength(3)
    expect(aeroAsTeam(['Model AeroLink in your lab.'])).toHaveLength(1)
  })
  it('the lab tool text states the checker boundary', () => {
    expect(LAB_TOOL.text).toMatch(/course acceptance checks/)
    expect(LAB_TOOL.text).toMatch(/does not show that the model says what your register says/)
  })
})
