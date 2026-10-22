// Lab L11 instructions: one source for the page and WEEK11_LAB_INSTRUCTIONS.md; the rubric rows resolve in the
// register; the workload rows sum as stated and the lab row is the team's person-hours over four; a team of three
// carries more per person, within the budget; the checker commands are the Week 8 guide's own, for model v0.4; no internal IDs
// (other than rubric row codes in the "judged by" column and the rubric note) in the prose; AeroLink only as the
// instructor's example. Each content check is shown able to fail.
import { describe, expect, it } from 'vitest'
import { LAB11_TEAM_HOURS, LAB11_TEAM_HOURS_THREE, REVIEW_CHECKS } from '../lectures/week11/labBrief'
import { THREE_PERSON, WEEK11_BUDGET_HOURS, WORKLOAD_ROWS, WORKLOAD_TOTAL } from '../week11Path'
import {
  CHECKER_RUN, LAB_AT_A_GLANCE, LAB_INPUTS, LAB_METHOD, LAB_PARTS, LAB_PROCEDURE, LAB_PURPOSE, LAB_RUBRIC_ROWS, LAB_SUBMISSION, LAB_TITLE, LAB_TOOL, LAB_WORKLOAD, LAB_WORKLOAD_NOTE, labMarkdown, rubricRow,
} from './week11Lab'

const MD = import.meta.glob<string>('../../../docs/lectures/week11/WEEK11_LAB_INSTRUCTIONS.md', { query: '?raw', import: 'default', eager: true })
const prose = () => [
  LAB_TITLE, LAB_PURPOSE.text, ...LAB_AT_A_GLANCE.flatMap((x) => [x.label, x.value]), ...LAB_INPUTS.map((x) => x.text.text),
  ...LAB_METHOD.flatMap((m) => [m.title, m.text.text]), ...LAB_PROCEDURE.flatMap((p) => [p.step, p.when, p.who, p.output, p.detail.text]),
  ...LAB_PARTS.flatMap((p) => [p.heading, p.evidence.text, p.minimum]), LAB_SUBMISSION.format.text, LAB_SUBMISSION.where.text, LAB_SUBMISSION.grading.text, LAB_SUBMISSION.aiUse,
  LAB_TOOL.text, ...LAB_WORKLOAD.map((w) => w.activity), LAB_WORKLOAD_NOTE.text,
]
const INTERNAL = /\bRB-\d|\bFD-\d|DECISION_LOG|§|\bA2[0-7]\b|\boutline\b|\bS\d{2}\b|\bW11\.\d|\bB11\.\d|\bnew-pending-review\b|\bR\d{2,3}[a-z]?\b/
const leaks = (texts: string[]) => texts.filter((t) => INTERNAL.test(t))
const aeroAsTeam = (texts: string[]) => texts.filter((t) => /aero\s*-?\s*link/i.test(t)).filter((t) => !/never AeroLink|AeroLink (?:files|physical)|AeroLink is|worked example|instructor/i.test(t))

describe('Lab L11 instructions', () => {
  it('the page and WEEK11_LAB_INSTRUCTIONS.md come from one source (run `node scripts/build-lab-md.mjs 11` after changing week11Lab.ts or the Week 11 lectures)', () => {
    const file = Object.values(MD)[0]
    expect(file, 'docs/lectures/week11/WEEK11_LAB_INSTRUCTIONS.md exists').toBeDefined()
    expect(file.replace(/\r\n/g, '\n')).toBe(labMarkdown())
  })
  it('every rubric row resolves in the register; a missing row throws', () => {
    for (const [rb, c] of LAB_RUBRIC_ROWS) expect(rubricRow(rb, c)[0]).toBe(c)
    expect(LAB_RUBRIC_ROWS.map(([, c]) => c)).toEqual(['7.3', '7.5', '8.1', '8.2', '8.3', '8.4', '8.6', '12.1', '12.2', '12.3'])
    expect(() => rubricRow('RB-8', '8.9')).toThrow()
    expect(labMarkdown()).toMatch(/^# Week 11 Lab L11[\s\S]*## Grading rubric rows[\s\S]*RB-7\.3/)
  })
  it('workload: the rows sum to the total within the budget; the lab row is the team person-hours over four; a team of three stays within the budget', () => {
    expect(Math.round(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0) * 10) / 10).toBe(WORKLOAD_TOTAL)
    expect(WORKLOAD_TOTAL).toBeLessThanOrEqual(WEEK11_BUDGET_HOURS)
    const lab = WORKLOAD_ROWS.find((r) => r.id === 'lab')!.hours
    expect(lab).toBe(Math.round((LAB11_TEAM_HOURS / 4) * 10) / 10)
    expect(THREE_PERSON.total).toBeLessThanOrEqual(WEEK11_BUDGET_HOURS)
    expect(THREE_PERSON.each).toBe(Math.round((LAB11_TEAM_HOURS_THREE / 3) * 10) / 10)
    expect(LAB_WORKLOAD.find((w) => w.activity.startsWith('Lab L11'))!.hours).toBe(lab)
  })
  it('the procedure runs from the in-class mapping to the upload; eight method steps; the checklist count is stated', () => {
    expect(LAB_PROCEDURE.map((p) => p.when)).toEqual([expect.stringMatching(/^In class, Session 2 \(\d+ min\)$/), 'Day 1', 'Days 1–2', 'Days 2–3', 'Days 3–4', 'Day 4', 'Day 5', 'Day 6', 'Day 7'])
    expect(LAB_METHOD).toHaveLength(8)
    expect(LAB_METHOD.find((m) => m.title === 'Review, audit and checker')!.text.text).toContain(`${REVIEW_CHECKS.length} checks`)
  })
  it('the checker commands are the Week 8 guide’s, for model v0.4, on every system', () => {
    expect(CHECKER_RUN.map((r) => r.os)).toEqual(['windows', 'macos', 'linux'])
    for (const r of CHECKER_RUN) expect(r.commands.join(' ')).toMatch(/check_sysml\.py models[\\/]team-07-model-v04\.sysml/)
  })
  it('the prose carries no internal IDs and names AeroLink only as the instructor’s example (and the check can fail)', () => {
    expect(leaks(prose())).toEqual([])
    expect(aeroAsTeam(prose())).toEqual([])
    expect(leaks(['see RB-8.1', 'objective W11.3', 'DECISION_LOG A21', 'R72 sl.30'])).toHaveLength(4)
    expect(aeroAsTeam(['Model AeroLink in your lab.'])).toHaveLength(1)
  })
  it('the lab tool text states the checker boundary, the ID rule and the regeneration rule', () => {
    expect(LAB_TOOL.text).toMatch(/course acceptance checks/)
    expect(LAB_TOOL.text).toMatch(/never renumbers/)
    expect(LAB_TOOL.text).toMatch(/never reused/)
    expect(LAB_TOOL.text).toMatch(/can be imported again/)
  })
})
