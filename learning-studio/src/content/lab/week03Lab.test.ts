// Lab L3 instructions: one source for the page and WEEK3_LAB_INSTRUCTIONS.md; the rubric rows resolve in the register;
// the minimums are labBrief's (team of four and team of three); security and resilience are explicit; the workload rows
// sum as stated and a team of three carries the same load per person; the slide references resolve in the registered
// lecture; every reading cited is in the verified register and inside its range; no AeroLink-as-team wording, no internal
// IDs in the prose, American spelling. Each content check is shown able to fail.
import { describe, expect, it } from 'vitest'
import labMdFile from '../../../docs/lectures/week03/WEEK3_LAB_INSTRUCTIONS.md?raw'
import { LAB3_MINIMUMS as MIN, LAB3_MINIMUMS_THREE as MIN3, LAB3_PERSON_HOURS, LAB3_TEAM_HOURS, RISK_GATES, TECH_GATES, TPM_GATES, TRADE_GATES } from '../lectures/week03/labBrief'
import { getLecture } from '../lectures'
import { citationInRange, getReading } from '../readings'
import {
  LAB3_EACH, LAB3_EXTENSION_READINGS, LAB3_REQUIRED_READINGS, LAB3_THREE_PERSON, LAB_AT_A_GLANCE, LAB_INPUTS, LAB_METHOD, LAB_OBJECTIVES, LAB_PARTS, LAB_PROCEDURE, LAB_PURPOSE, LAB_RUBRIC_NOTE, LAB_RUBRIC_ROWS,
  LAB_SUBMISSION, LAB_TITLE, LAB_TOOL, LAB_WORKLOAD, LAB_WORKLOAD_NOTE, S2_LAB, labMarkdown, rubricRow, taughtIn,
} from './week03Lab'

/** Student-facing prose (everything but the rubric table and its note, and the "judged by" column, which name rows). */
const prose = () => [
  LAB_TITLE, LAB_PURPOSE.text, ...LAB_AT_A_GLANCE.flatMap((x) => [x.label, x.value]), ...LAB_INPUTS.map((x) => x.text.text),
  ...LAB_METHOD.flatMap((m) => [m.title, m.text.text]), ...LAB_PROCEDURE.flatMap((p) => [p.step, p.when, p.who, p.output, p.detail.text]),
  ...LAB_PARTS.flatMap((p) => [p.heading, p.evidence.text, p.minimum]), LAB_SUBMISSION.format.text, LAB_SUBMISSION.where.text, LAB_SUBMISSION.grading.text, LAB_SUBMISSION.aiUse, LAB_SUBMISSION.graduate.text,
  LAB_TOOL.text, ...LAB_WORKLOAD.map((w) => w.activity), LAB_WORKLOAD_NOTE.text,
]
const INTERNAL = /\bRB-\d|\bFD-\d|DECISION_LOG|§|\bA2[01]\b|\boutline\b|\bS\d{2}\b(?! p)|\bnew-pending-review\b|\bW3\.\d|\bP3-\d/
const leaks = (texts: string[]) => texts.filter((t) => INTERNAL.test(t))
/** AeroLink may appear only as the instructor's example ("never to AeroLink", "worked example"). */
const aeroAsTeam = (texts: string[]) => texts.filter((t) => /aero\s*-?\s*link/i.test(t)).filter((t) => !/never to AeroLink|worked example|instructor/i.test(t))
const BRITISH = /\b(behaviour|modelling|modelled|organis(?:e|ed|ation)|centre|colour|analys(?:e|ed|ing)|utilis(?:e|ation)|realis(?:e|ed)|recognis(?:e|ed)|summaris(?:e|ed)|optimis(?:e|ed)|prioritis(?:e|ed)|minimis(?:e|ed)|maximis(?:e|ed)|normalis(?:e|ed)|favour|labelled|labelling|judgement|programme|defence|catalogue|practise|whilst|amongst|characteris(?:e|ed)|categoris(?:e|ed)|fulfil|travelling|cancelled|licence|learnt|enrol|grey|metres?)\b/i
/** The generated file without the rubric table, which quotes the register verbatim (its spelling is the register's). */
const mdWithoutRubric = () => labMarkdown().replace(/## Grading rubric rows[\s\S]*?## Submission/, '## Submission')

describe('Lab L3 instructions', () => {
  it('the page and WEEK3_LAB_INSTRUCTIONS.md come from one source (run `npm run lab:md` after changing week03Lab.ts)', () => {
    expect(labMdFile.replace(/\r\n/g, '\n')).toBe(labMarkdown())
  })
  it('every rubric row resolves in the register', () => {
    for (const [rb, c] of LAB_RUBRIC_ROWS) expect(rubricRow(rb, c)[0]).toBe(c)
    expect(() => rubricRow('RB-5', '5.9')).toThrow()
    expect(LAB_RUBRIC_ROWS.map(([, c]) => c)).toEqual(['4.1', '4.2', '4.3', '5.1', '5.2', '5.3', '5.4', '5.5', '6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '12.1', '12.2', '12.3'])
    expect(LAB_RUBRIC_NOTE.text).toMatch(/apply to the TPMs this week/)
    expect(LAB_RUBRIC_NOTE.text).toMatch(/specific to your own enterprise/)
  })
  it('the minimums are labBrief’s, for a team of four and a team of three, and every gate is stated', () => {
    const md = labMarkdown()
    const parts = LAB_PARTS.map((p) => p.minimum).join(' ')
    expect(parts).toContain(`team of 4: ${MIN.technologies} technologies`)
    expect(parts).toContain(`team of 3: ${MIN3.technologies} technologies`)
    expect(parts).toContain(`team of 4: ${MIN.risks} risks`)
    expect(parts).toContain(`team of 3: ${MIN3.risks} risks`)
    expect(parts).toContain(`team of 4: ${MIN.tpms} TPMs`)
    expect(parts).toContain(`team of 3: ${MIN3.tpms} TPM`)
    expect(parts).toContain(`team of 4: ${MIN.alternatives} alternatives and ${MIN.criteria} criteria`)
    expect(parts).toContain(`team of 3: ${MIN3.alternatives} alternatives and ${MIN3.criteria} criteria`)
    for (const g of [...TECH_GATES, ...RISK_GATES, ...TPM_GATES, ...TRADE_GATES]) expect(md).toContain(g.short)
  })
  it('security and resilience are explicit: minimums, the screen and the resilience criterion', () => {
    expect(LAB_PARTS.find((p) => p.heading.startsWith('13.'))!.minimum).toMatch(/1 security and 1 resilience risk among those that count/)
    const method = LAB_METHOD.map((m) => m.text.text).join(' ')
    expect(method).toMatch(/security as a must-meet screen/)
    expect(method).toMatch(/resilience as a criterion/)
    expect(method).toMatch(/avoid \(.+\), withstand \(.+\), recover \(.+\)/)
  })
  it('the procedure has the ten steps with the in-class minutes from the slides', () => {
    expect(LAB_PROCEDURE).toHaveLength(10)
    expect(LAB_PROCEDURE[0].when).toContain(`${S2_LAB.plan} min`)
    expect(LAB_PROCEDURE[1].when).toContain(`${S2_LAB.checkpoint} min, up to ${S2_LAB.checkpointTeams} teams`)
    expect(LAB_PROCEDURE.map((p) => p.when).slice(2)).toEqual(['Days 1–2', 'Days 2–3', 'Day 3', 'Days 3–4', 'Day 4', 'Day 5', 'Day 6', 'Day 7'])
    expect(LAB_METHOD).toHaveLength(8)
    // the minutes are read from the registered Session 2 lab section
    const lab = getLecture(3, 2)?.sections.find((s) => s.id === 'w3s2-lab')
    if (lab) expect(S2_LAB.total).toBe(lab.slides.reduce((a, s) => a + s.minutes, 0))
  })
  it('the workload rows sum as stated; a team of three carries the same load per person (within 0.1 h)', () => {
    expect(Math.round(LAB3_PERSON_HOURS.reduce((a, t) => a + t.hours, 0) * 10) / 10).toBe(LAB3_TEAM_HOURS)
    expect(LAB3_EACH).toBe(Math.round((LAB3_TEAM_HOURS / 4) * 10) / 10)
    expect(Math.abs(LAB3_THREE_PERSON.each - LAB3_EACH)).toBeLessThanOrEqual(0.1)
    expect(LAB_WORKLOAD.map((w) => w.hours)).toEqual([0, LAB3_EACH])
    expect(LAB_WORKLOAD_NOTE.text).toContain(`About ${LAB3_TEAM_HOURS.toFixed(1)} person-hours`)
    expect(LAB_WORKLOAD_NOTE.text).toContain(`about ${LAB3_THREE_PERSON.teamHours.toFixed(1)} person-hours, about ${LAB3_THREE_PERSON.each.toFixed(1)} h each`)
    for (const t of LAB3_PERSON_HOURS) expect(LAB_WORKLOAD_NOTE.text).toContain(`${t.task} ${t.hours.toFixed(1)}`)
  })
  it('every reading cited is in the verified register and inside its verified range; the essential set is 12 pages', () => {
    for (const c of [...LAB3_REQUIRED_READINGS, ...LAB3_EXTENSION_READINGS]) {
      expect(getReading(c.reading).verified || getReading(c.reading).declaredException, c.reading).toBe(true)
      expect(citationInRange(c), `${c.reading} ${c.pages}`).toBe(true)
    }
    const pages = LAB3_REQUIRED_READINGS.reduce((a, c) => {
      const [x, y] = (c.pages ?? '').split('–').map(Number)
      return a + (y ? y - x + 1 : 1)
    }, 0)
    expect(pages).toBe(12)
  })
  it('“Taught in” references resolve to slides of the registered lecture (no fallback used)', () => {
    for (const m of LAB_METHOD) for (const ref of m.taught.split('; ')) expect(ref, m.title).toMatch(/^Session [12], slide \d+ ‘.+’$/)
    expect(taughtIn(1, 'w3s1-no-such-slide', { slide: 99, title: 'fallback title' })).toBe('Session 1, slide 99 ‘fallback title’')
    const live = LAB_METHOD.flatMap((m) => m.taught.split('; '))
    expect(live.some((x) => x.includes('fallback title'))).toBe(false)
    // every slide id the method names exists in the registered lecture (fails if a slide is renamed)
    const ids = ['w3s1-tra-purpose', 'w3s1-trl-scale', 'w3s1-maturity-practice', 'w3s1-evidence-rule', 'w3s1-worked-trl', 'w3s1-risk-process', 'w3s1-risk-statement', 'w3s1-rating', 'w3s1-matrix-limits', 'w3s1-security-resilience', 'w3s1-handling', 'w3s1-worked-risk', 'w3s1-monitoring-pitfalls', 'w3s1-five-kinds', 'w3s1-register-linked', 'w3s1-tpm-hierarchy', 'w3s1-tpm-margin', 'w3s1-worked-tpm', 'w3s1-chain']
    const ids2 = ['w3s2-decision-management', 'w3s2-framing', 'w3s2-worked-frame', 'w3s2-worked-criteria', 'w3s2-value-functions', 'w3s2-swing-weights', 'w3s2-additive-model', 'w3s2-worked-scores', 'w3s2-worked-sensitivity', 'w3s2-weighted-sum-pitfalls', 'w3s2-worked-decision']
    for (const [session, list] of [[1, ids], [2, ids2]] as const) {
      const l = getLecture(3, session)
      expect(l, `Week 3 session ${session} registered`).toBeDefined()
      const all = l!.sections.flatMap((s) => s.slides.map((x) => x.id))
      for (const id of list) expect(all, id).toContain(id)
    }
  })
  it('objectives: W3.1–W3.4 from the course; W3.5 and W3.6 proposed', () => {
    expect(LAB_OBJECTIVES.map((o) => [o.id, o.proposed])).toEqual([['W3.1', false], ['W3.2', false], ['W3.3', false], ['W3.4', false], ['W3.5', true], ['W3.6', true]])
  })
  it('the inputs link the worked examples and the lab tool', () => {
    expect(LAB_INPUTS.map((i) => i.to).filter(Boolean)).toEqual(['/week/3/examples', '/week/3/lab/tool'])
  })
  it('no internal IDs in the student-facing prose (the check catches a planted one)', () => {
    expect(leaks(prose())).toEqual([])
    for (const planted of ['See RB-5.1.', 'FD-22 says', 'per DECISION_LOG', 'outline §5.4', 'objective W3.2', 'register P3-1']) expect(leaks([planted])).toEqual([planted])
  })
  it('AeroLink is never the team’s enterprise (the check catches a planted one)', () => {
    expect(aeroAsTeam(prose())).toEqual([])
    expect(aeroAsTeam(['Write the AeroLink risks for your team.'])).toHaveLength(1)
  })
  it('American spelling in the module text and the generated file outside the quoted rubric (the check catches a British spelling)', () => {
    const all = [...prose(), mdWithoutRubric().replace(/“[^”]*”/g, ' ')].join(' ')
    expect(all.match(BRITISH)).toBeNull()
    expect('the behaviour is modelled'.match(BRITISH)).not.toBeNull()
  })
})
