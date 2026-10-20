// Lab L2 instructions: one source for the page and WEEK2_LAB_INSTRUCTIONS.md; the rubric rows resolve in the register;
// the minimums are labBrief's; the workload rows sum as stated; the slide references resolve in the registered lecture;
// no AeroLink-as-team wording, no internal IDs in the prose, American spelling. Each content check is shown able to fail.
import { describe, expect, it } from 'vitest'
import labMdFile from '../../../docs/lectures/week02/WEEK2_LAB_INSTRUCTIONS.md?raw'
import { LAB2_MINIMUMS as MIN, LAB2_MINIMUMS_THREE as MIN3, REQ_HARD_GATES } from '../lectures/week02/labBrief'
import { LAB_PERSON_HOURS, LAB_TEAM_HOURS, S2_LAB, THREE_PERSON, WORKLOAD_ROWS } from '../week2Path'
import {
  LAB_AT_A_GLANCE, LAB_INPUTS, LAB_METHOD, LAB_OBJECTIVES, LAB_PARTS, LAB_PROCEDURE, LAB_PURPOSE, LAB_RUBRIC_NOTE, LAB_RUBRIC_ROWS, LAB_SUBMISSION, LAB_TITLE, LAB_TOOL, LAB_WORKLOAD, LAB_WORKLOAD_NOTE,
  labMarkdown, rubricRow, taughtIn,
} from './week02Lab'

/** Student-facing prose (everything but the rubric table and its note, and the "judged by" column, which name rows). */
const prose = () => [
  LAB_TITLE, LAB_PURPOSE.text, ...LAB_AT_A_GLANCE.flatMap((x) => [x.label, x.value]), ...LAB_INPUTS.map((x) => x.text.text),
  ...LAB_METHOD.flatMap((m) => [m.title, m.text.text]), ...LAB_PROCEDURE.flatMap((p) => [p.step, p.when, p.who, p.output, p.detail.text]),
  ...LAB_PARTS.flatMap((p) => [p.heading, p.evidence.text, p.minimum]), LAB_SUBMISSION.format.text, LAB_SUBMISSION.where.text, LAB_SUBMISSION.grading.text, LAB_SUBMISSION.aiUse,
  LAB_TOOL.text, ...LAB_WORKLOAD.map((w) => w.activity), LAB_WORKLOAD_NOTE.text,
]
const INTERNAL = /\bRB-\d|\bFD-\d|DECISION_LOG|§|\bA2[01]\b|\boutline\b|\bS\d{2}\b(?! p)|\bnew-pending-review\b/
const leaks = (texts: string[]) => texts.filter((t) => INTERNAL.test(t))
/** AeroLink may appear only as the instructor's example ("never to AeroLink", "the AeroLink … worked example"). */
const aeroAsTeam = (texts: string[]) => texts.filter((t) => /aero\s*-?\s*link/i.test(t)).filter((t) => !/never to AeroLink|AeroLink (?:weather scenario|capability tree|ConOps)|worked example|instructor/i.test(t))
const BRITISH = /\b(behaviour|modelling|modelled|organis(?:e|ed|ation)|centre|colour|analys(?:e|ed|ing)|utilis(?:e|ation)|realis(?:e|ed)|recognis(?:e|ed)|summaris(?:e|ed)|optimis(?:e|ed)|prioritis(?:e|ed)|minimis(?:e|ed)|maximis(?:e|ed)|favour|labelled|labelling|judgement|programme|defence|catalogue|practise|whilst|amongst|characteris(?:e|ed)|categoris(?:e|ed)|fulfil|travelling|cancelled|licence|learnt|enrol|grey|metres?)\b/i

describe('Lab L2 instructions', () => {
  it('the page and WEEK2_LAB_INSTRUCTIONS.md come from one source (run `npm run lab:md` after changing week02Lab.ts)', () => {
    expect(labMdFile.replace(/\r\n/g, '\n')).toBe(labMarkdown())
  })
  it('every rubric row resolves in the register', () => {
    for (const [rb, c] of LAB_RUBRIC_ROWS) expect(rubricRow(rb, c)[0]).toBe(c)
    expect(() => rubricRow('RB-3', '3.9')).toThrow()
    expect(LAB_RUBRIC_ROWS.map(([, c]) => c)).toEqual(['2.3', '2.4', '2.5', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '4.1', '4.2', '4.3', '12.1', '12.2', '12.3'])
    expect(LAB_RUBRIC_NOTE.text).toMatch(/at most 3 this week/)
    expect(LAB_RUBRIC_NOTE.text).toMatch(/draws 10 requirements/)
    expect(LAB_RUBRIC_NOTE.text).toMatch(/team’s own trace audit/)
    expect(LAB_RUBRIC_NOTE.text).toMatch(/MOEs and MOPs only/)
  })
  it('the minimums are labBrief’s, for a team of four and a team of three', () => {
    const md = labMarkdown()
    const parts = LAB_PARTS.map((p) => p.minimum).join(' ')
    expect(parts).toContain(`team of 4: ${MIN.scenarios} scenarios`)
    expect(parts).toContain(`team of 3: ${MIN3.scenarios} scenarios`)
    expect(parts).toContain(`team of 4: ${MIN.capabilities} capabilities`)
    expect(parts).toContain(`team of 3: ${MIN3.capabilities} capabilities`)
    expect(parts).toContain(`team of 4: ${MIN.requirements} requirements (${MIN.stakeholderRequirements} stakeholder, ${MIN.systemRequirements} system)`)
    expect(parts).toContain(`team of 3: ${MIN3.requirements} requirements (${MIN3.stakeholderRequirements} stakeholder, ${MIN3.systemRequirements} system)`)
    expect(parts).toContain(`team of 4: ${MIN.moes} MOEs and ${MIN.mops} MOPs`)
    expect(parts).toContain(`team of 3: ${MIN3.moes} MOEs and ${MIN3.mops} MOPs`)
    expect(parts).toContain(`at least ${MIN.types} types`)
    for (const g of REQ_HARD_GATES) expect(md).toContain(g.short)
  })
  it('the procedure has the ten steps with the in-class minutes from the slides', () => {
    expect(LAB_PROCEDURE).toHaveLength(10)
    expect(LAB_PROCEDURE[0].when).toContain(`${S2_LAB.plan} min`)
    expect(LAB_PROCEDURE[1].when).toContain(`${S2_LAB.clinic} min, up to ${S2_LAB.clinicTeams} teams`)
    expect(LAB_PROCEDURE.map((p) => p.when).slice(2)).toEqual(['Days 1–2', 'Days 1–3', 'Day 3', 'Days 3–4', 'Days 4–5', 'Day 6', 'Day 6', 'Day 7'])
    expect(LAB_PROCEDURE[3].who).toBe('Each scenario has one owner; Verification & Validation reviews')
    expect(LAB_METHOD).toHaveLength(8)
  })
  it('the workload rows sum as stated', () => {
    expect(Math.round(LAB_PERSON_HOURS.reduce((a, t) => a + t.hours, 0) * 10) / 10).toBe(LAB_TEAM_HOURS)
    const lab = WORKLOAD_ROWS.find((r) => r.id === 'lab')!
    expect(lab.hours).toBe(Math.round((LAB_TEAM_HOURS / 4) * 10) / 10)
    expect(LAB_WORKLOAD.map((w) => w.hours)).toEqual([0, WORKLOAD_ROWS.find((r) => r.id === 'candidate')!.hours, lab.hours])
    expect(LAB_WORKLOAD_NOTE.text).toContain(`About ${LAB_TEAM_HOURS.toFixed(1)} person-hours`)
    expect(LAB_WORKLOAD_NOTE.text).toContain(`about ${lab.hours.toFixed(1)} h each`)
    expect(LAB_WORKLOAD_NOTE.text).toContain(`about ${THREE_PERSON.teamHours.toFixed(1)} person-hours, about ${THREE_PERSON.each.toFixed(1)} h each`)
    for (const t of LAB_PERSON_HOURS) expect(LAB_WORKLOAD_NOTE.text).toContain(`${t.task} ${t.hours.toFixed(1)}`)
    // the share of a four-person team is realistic against the week's 8 h budget
    expect(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0)).toBeLessThanOrEqual(8.05)
  })
  it('“Taught in” references resolve to slides of the registered lecture (no fallback used)', () => {
    for (const m of LAB_METHOD) for (const ref of m.taught.split('; ')) expect(ref, m.title).toMatch(/^Session [12], slide \d+ ‘.+’$/)
    // the fallback is only for an unknown slide id, and it is detectable
    expect(taughtIn(1, 'w2s1-no-such-slide', { slide: 99, title: 'fallback title' })).toBe('Session 1, slide 99 ‘fallback title’')
    const live = LAB_METHOD.flatMap((m) => m.taught.split('; '))
    expect(live.some((x) => x.includes('fallback title'))).toBe(false)
    expect(live.some((x) => /slide 99/.test(x))).toBe(false)
  })
  it('objectives: W2.1, W2.3, W2.4, W2.5 from the course; W2.6 and W2.7 proposed', () => {
    expect(LAB_OBJECTIVES.map((o) => [o.id, o.proposed])).toEqual([['W2.1', false], ['W2.3', false], ['W2.4', false], ['W2.5', false], ['W2.6', true], ['W2.7', true]])
  })
  it('the inputs link the worked examples and the lab tool', () => {
    expect(LAB_INPUTS.map((i) => i.to).filter(Boolean)).toEqual(['/week/2/examples', '/week/2/lab/tool'])
  })
  it('no internal IDs in the student-facing prose (the check catches a planted one)', () => {
    expect(leaks(prose())).toEqual([])
    for (const planted of ['See RB-3.1.', 'FD-22 says', 'per DECISION_LOG', 'outline §5.4']) expect(leaks([planted])).toEqual([planted])
  })
  it('AeroLink is never the team’s enterprise (the check catches a planted one)', () => {
    expect(aeroAsTeam(prose())).toEqual([])
    expect(aeroAsTeam(['Write the AeroLink requirements for your team.'])).toHaveLength(1)
  })
  it('American spelling in the module text and the generated file (the check catches a British spelling)', () => {
    const all = [...prose(), labMarkdown().replace(/“[^”]*”/g, ' ')].join(' ')
    expect(all.match(BRITISH)).toBeNull()
    expect('the behaviour is modelled'.match(BRITISH)).not.toBeNull()
  })
})
