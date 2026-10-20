// Lab L4 instructions: one source for the page and WEEK4_LAB_INSTRUCTIONS.md; the rubric rows resolve in the register;
// the minimums are labBrief's (team of four and team of three); every gate is stated; the workload rows sum as stated and a
// team of three carries the same load per person; the slide references resolve in the registered lecture; every reading
// cited is in the verified register and inside its range; no AeroLink-as-team wording, no internal IDs in the prose,
// American spelling. Each content check is shown able to fail.
import { describe, expect, it } from 'vitest'
import labMdFile from '../../../docs/lectures/week04/WEEK4_LAB_INSTRUCTIONS.md?raw'
import { AI_GATES, ALLOCATION_GATES, DECISION_GATES, FUNCTION_GATES, INFO_GATES, LAB4_MINIMUMS as MIN, LAB4_MINIMUMS_THREE as MIN3, LAB4_PERSON_HOURS, LAB4_TEAM_HOURS, VIEWPOINT_GATES } from '../lectures/week04/labBrief'
import { getLecture } from '../lectures'
import { citationInRange, getReading } from '../readings'
import {
  LAB4_EACH, LAB4_EXTENSION_READINGS, LAB4_REQUIRED_READINGS, LAB4_THREE_PERSON, LAB_AT_A_GLANCE, LAB_INPUTS, LAB_METHOD, LAB_OBJECTIVES, LAB_PARTS, LAB_PROCEDURE, LAB_PURPOSE, LAB_RUBRIC_NOTE, LAB_RUBRIC_ROWS,
  LAB_SUBMISSION, LAB_TITLE, LAB_TOOL, LAB_WORKLOAD, LAB_WORKLOAD_NOTE, S2_LAB, labMarkdown, rubricRow, taughtIn,
} from './week04Lab'

const prose = () => [
  LAB_TITLE, LAB_PURPOSE.text, ...LAB_AT_A_GLANCE.flatMap((x) => [x.label, x.value]), ...LAB_INPUTS.map((x) => x.text.text),
  ...LAB_METHOD.flatMap((m) => [m.title, m.text.text]), ...LAB_PROCEDURE.flatMap((p) => [p.step, p.when, p.who, p.output, p.detail.text]),
  ...LAB_PARTS.flatMap((p) => [p.heading, p.evidence.text, p.minimum]), LAB_SUBMISSION.format.text, LAB_SUBMISSION.where.text, LAB_SUBMISSION.grading.text, LAB_SUBMISSION.aiUse, LAB_SUBMISSION.graduate.text,
  LAB_TOOL.text, ...LAB_WORKLOAD.map((w) => w.activity), LAB_WORKLOAD_NOTE.text,
]
const INTERNAL = /\bRB-\d|\bFD-\d|DECISION_LOG|§|\bA2[01]\b|\boutline\b|\bS\d{2}\b(?! p)|\bnew-pending-review\b|\bW4\.\d|\bP4-\d/
const leaks = (texts: string[]) => texts.filter((t) => INTERNAL.test(t))
const aeroAsTeam = (texts: string[]) => texts.filter((t) => /aero\s*-?link/i.test(t)).filter((t) => !/never to AeroLink|worked example|instructor|AeroLink view set/i.test(t))
const BRITISH = /\b(behaviour|modelling|modelled|organis(?:e|ed|ation|ational)|centre|colour|analys(?:e|ed|ing)|utilis(?:e|ation)|realis(?:e|ed)|recognis(?:e|ed)|summaris(?:e|ed)|optimis(?:e|ed)|prioritis(?:e|ed)|favour|labelled|labelling|judgement|programme|defence|catalogue|practise|whilst|amongst|fulfil|travelling|cancelled|licence|learnt|grey|metres?)\b/i
const mdWithoutRubric = () => labMarkdown().replace(/## Grading rubric rows[\s\S]*?## Submission/, '## Submission')

describe('Lab L4 instructions', () => {
  it('the page and WEEK4_LAB_INSTRUCTIONS.md come from one source (run `npm run lab:md` after changing week04Lab.ts)', () => {
    expect(labMdFile.replace(/\r\n/g, '\n')).toBe(labMarkdown())
  })
  it('every rubric row resolves in the register', () => {
    for (const [rb, c] of LAB_RUBRIC_ROWS) expect(rubricRow(rb, c)[0]).toBe(c)
    expect(() => rubricRow('RB-7', '7.9')).toThrow()
    expect(LAB_RUBRIC_ROWS.map(([, c]) => c)).toEqual(['7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '12.1', '12.2', '12.3'])
    expect(LAB_RUBRIC_NOTE.text).toMatch(/allocation part only/)
  })
  it('the minimums are labBrief’s, for a team of four and a team of three, and every gate is stated', () => {
    const md = labMarkdown()
    const parts = LAB_PARTS.map((p) => p.minimum).join(' ')
    expect(parts).toContain(`team of 4: ${MIN.functions} functions`)
    expect(parts).toContain(`team of 3: ${MIN3.functions} functions`)
    expect(parts).toContain(`team of 4: ${MIN.logical} logical and ${MIN.physical} physical elements`)
    expect(parts).toContain(`team of 3: ${MIN3.logical} logical and ${MIN3.physical} physical elements`)
    expect(parts).toContain(`team of 4: ${MIN.information} items`)
    expect(parts).toContain(`team of 3: ${MIN3.information} items`)
    for (const g of [...VIEWPOINT_GATES, ...FUNCTION_GATES, ...ALLOCATION_GATES, ...DECISION_GATES, ...INFO_GATES, ...AI_GATES]) expect(md).toContain(g.short)
  })
  it('the procedure has the ten steps with the in-class minutes from the slides', () => {
    expect(LAB_PROCEDURE).toHaveLength(10)
    expect(LAB_PROCEDURE[0].when).toContain(`${S2_LAB.views} min`)
    expect(LAB_PROCEDURE[1].when).toContain(`${S2_LAB.check} min, up to ${S2_LAB.checkTeams} teams`)
    expect(LAB_METHOD).toHaveLength(8)
    const lab = getLecture(4, 2)?.sections.find((s) => s.id === 'w4s2-lab')
    expect(lab).toBeDefined()
    expect(S2_LAB.total).toBe(lab!.slides.reduce((a, s) => a + s.minutes, 0))
  })
  it('the workload rows sum as stated; a team of three carries the same load per person (within 0.1 h)', () => {
    expect(Math.round(LAB4_PERSON_HOURS.reduce((a, t) => a + t.hours, 0) * 10) / 10).toBe(LAB4_TEAM_HOURS)
    expect(LAB4_EACH).toBe(Math.round((LAB4_TEAM_HOURS / 4) * 10) / 10)
    expect(Math.abs(LAB4_THREE_PERSON.each - LAB4_EACH)).toBeLessThanOrEqual(0.1 + 1e-9)
    expect(LAB_WORKLOAD.map((w) => w.hours)).toEqual([0, LAB4_EACH])
    for (const t of LAB4_PERSON_HOURS) expect(LAB_WORKLOAD_NOTE.text).toContain(`${t.task} ${t.hours.toFixed(1)}`)
  })
  it('every reading cited is in the verified register and inside its verified range; the essential set is 16 pages', () => {
    for (const c of [...LAB4_REQUIRED_READINGS, ...LAB4_EXTENSION_READINGS]) {
      expect(getReading(c.reading).verified, c.reading).toBe(true)
      expect(citationInRange(c), `${c.reading} ${c.pages}`).toBe(true)
    }
    const pages = LAB4_REQUIRED_READINGS.reduce((a, c) => {
      const [x, y] = (c.pages ?? '').split('–').map(Number)
      return a + (y ? y - x + 1 : 1)
    }, 0)
    expect(pages).toBe(16)
  })
  it('“Taught in” references resolve to slides of the registered lecture (no fallback used)', () => {
    for (const m of LAB_METHOD) for (const ref of m.taught.split('; ')) expect(ref, m.title).toMatch(/^Session [12], slide \d+ ‘.+’$/)
    expect(taughtIn(1, 'w4s1-no-such-slide', { slide: 99, title: 'fallback title' })).toBe('Session 1, slide 99 ‘fallback title’')
    const all = [1, 2].flatMap((s) => getLecture(4, s)!.sections.flatMap((x) => x.slides.map((y) => y.title)))
    for (const m of LAB_METHOD) for (const ref of m.taught.split('; ')) expect(all, ref).toContain(ref.replace(/^Session \d, slide \d+ ‘/, '').replace(/’$/, ''))
  })
  it('objectives: W4.1–W4.3 from the course; W4.4–W4.6 proposed', () => {
    expect(LAB_OBJECTIVES.map((o) => [o.id, o.proposed])).toEqual([['W4.1', false], ['W4.2', false], ['W4.3', false], ['W4.4', true], ['W4.5', true], ['W4.6', true]])
  })
  it('the inputs link the worked examples and the lab tool', () => {
    expect(LAB_INPUTS.map((i) => i.to).filter(Boolean)).toEqual(['/week/4/examples', '/week/4/lab/tool'])
  })
  it('no internal IDs in the student-facing prose (the check catches a planted one)', () => {
    expect(leaks(prose())).toEqual([])
    for (const planted of ['See RB-7.1.', 'per DECISION_LOG', 'outline §5.4', 'objective W4.2', 'register P4-1']) expect(leaks([planted])).toEqual([planted])
  })
  it('AeroLink is never the team’s enterprise (the check catches a planted one)', () => {
    expect(aeroAsTeam(prose())).toEqual([])
    expect(aeroAsTeam(['Write the AeroLink functions for your team.'])).toHaveLength(1)
  })
  it('American spelling in the module text and the generated file outside the quoted rubric', () => {
    const all = [...prose(), mdWithoutRubric().replace(/“[^”]*”/g, ' ')].join(' ')
    expect(all.match(BRITISH)).toBeNull()
    expect('the behaviour is modelled'.match(BRITISH)).not.toBeNull()
  })
})
