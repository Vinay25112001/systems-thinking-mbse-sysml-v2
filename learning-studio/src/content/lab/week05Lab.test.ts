// Lab L5 instructions: one source for the page and WEEK5_LAB_INSTRUCTIONS.md; the rubric rows resolve in the register
// (the proposed rows are labeled proposed and are not register rows); the minimums are labBrief's (team of four and team of
// three); every gate and advisory is stated with its basis in the gate-justification table; the workload rows sum as
// stated and a team of three carries the same load per person; every slide reference resolves once the lecture is
// registered; every reading cited is in the verified register and inside its range (12 required pages); no AeroLink-as-team
// wording, no internal IDs in the prose, no stale week numbers, American spelling. Each content check is shown able to fail.
import { describe, expect, it } from 'vitest'
import labMdFile from '../../../docs/lectures/week05/WEEK5_LAB_INSTRUCTIONS.md?raw'
import {
  CARD_GATES, CHANGE_GATES, COMPONENT_GATES, INTERFACE_ADVISORIES, INTERFACE_GATES, LAB5_MINIMUMS as MIN, LAB5_MINIMUMS_THREE as MIN3, LAB5_PERSON_HOURS, LAB5_TEAM_HOURS, PART_RULES, REQUIREMENT_GATES, TABLE_COLUMNS,
} from '../lectures/week05/labBrief'
import { getLecture } from '../lectures'
import { allSlides } from '../lectures/text'
import { citationInRange, getReading } from '../readings'
import { RUBRICS } from '../rubrics'
import {
  GATE_TABLE, LAB5_EACH, LAB5_EXTENSION_READINGS, LAB5_REQUIRED_READINGS, LAB5_THREE_PERSON, LAB_AT_A_GLANCE, LAB_INPUTS, LAB_LEVELS, LAB_METHOD, LAB_OBJECTIVES, LAB_PARTS, LAB_PROCEDURE, LAB_PURPOSE, LAB_RUBRIC_CONDITION_ROWS,
  LAB_RUBRIC_NOTE, LAB_RUBRIC_ROWS, LAB_SUBMISSION, LAB_TITLE, LAB_TOOL, LAB_WORKLOAD, LAB_WORKLOAD_NOTE, PROPOSED_RUBRIC, S2_LAB, TAUGHT_SLIDES, labMarkdown, rubricRow, taughtIn,
} from './week05Lab'

/** Student-facing prose (everything but the rubric table and its note, and the "judged by" column, which name rows). */
const prose = () => [
  LAB_TITLE, LAB_PURPOSE.text, ...LAB_AT_A_GLANCE.flatMap((x) => [x.label, x.value]), ...LAB_INPUTS.map((x) => x.text.text),
  ...LAB_METHOD.flatMap((m) => [m.title, m.text.text]), ...LAB_PROCEDURE.flatMap((p) => [p.step, p.when, p.who, p.output, p.detail.text]),
  ...LAB_PARTS.flatMap((p) => [p.heading, p.evidence.text, p.minimum]), LAB_SUBMISSION.format.text, LAB_SUBMISSION.where.text, LAB_SUBMISSION.grading.text, LAB_SUBMISSION.aiUse, LAB_SUBMISSION.graduate.text,
  LAB_TOOL.text, ...LAB_WORKLOAD.map((w) => w.activity), LAB_WORKLOAD_NOTE.text, ...LAB_LEVELS.flatMap((l) => [l.criterion, ...l.levels]), ...GATE_TABLE.flatMap((g) => [g.checks, g.basis]),
]
const INTERNAL = /\bRB-\d|\bFD-\d|DECISION_LOG|§|\bA2[01]\b|\boutline\b|\bS\d{2}\b|\bnew-pending-review\b|\bW5\.\d|\bP5-\d/
const leaks = (texts: string[]) => texts.filter((t) => INTERNAL.test(t))
const aeroAsTeam = (texts: string[]) => texts.filter((t) => /aero\s*-?\s*link/i.test(t)).filter((t) => !/never to AeroLink|worked example|instructor|AeroLink breakdown/i.test(t))
/** The A19 schedule: a week number named next to the wrong subject is stale. */
const STALE = /Week 6[^.;]{0,40}(Final Presentation|SysML)|Week 7[^.;]{0,40}(roadmap|SysML)|Week 1[01][^.;]{0,30}(Final Presentation|roadmap)|Week 12[^.;]{0,30}(roadmap|Physical)/i
const BRITISH = /\b(behaviour|modelling|modelled|organis(?:e|ed|ation|ational)|centre|colour|analys(?:e|ed|ing)|utilis(?:e|ation)|realis(?:e|ed)|recognis(?:e|ed)|summaris(?:e|ed)|optimis(?:e|ed)|prioritis(?:e|ed)|minimis(?:e|ed)|favour|labelled|labelling|judgement|programme|defence|catalogue|practise|whilst|amongst|fulfil|travelling|cancelled|licence|learnt|grey|metres?|neighbours?)\b/i
const mdWithoutRubric = () => labMarkdown().replace(/## Grading rubric rows[\s\S]*?### Level descriptors/, '### Level descriptors')

describe('Lab L5 instructions', () => {
  it('the page and WEEK5_LAB_INSTRUCTIONS.md come from one source (run `npm run lab:md` after changing week05Lab.ts)', () => {
    expect(labMdFile.replace(/\r\n/g, '\n')).toBe(labMarkdown())
    expect(labMarkdown()).toContain('Generated from `learning-studio/src/content/lab/week05Lab.ts` by `npm run lab:md`')
  })
  it('every rubric row resolves in the register; the proposed rows are labeled proposed and are not register rows', () => {
    for (const [rb, c] of [...LAB_RUBRIC_ROWS, ...LAB_RUBRIC_CONDITION_ROWS]) expect(rubricRow(rb, c)[0]).toBe(c)
    expect(() => rubricRow('RB-7', '7.7')).toThrow()
    expect(LAB_RUBRIC_ROWS.map(([rb, c]) => `${rb}:${c}`)).toEqual(['RB-7:7.3', 'RB-7:7.5', 'RB-12:12.1', 'RB-12:12.2', 'RB-12:12.3'])
    expect(LAB_RUBRIC_CONDITION_ROWS).toEqual([['RB-3', '3.2']])
    const rb7 = RUBRICS.find((r) => r.id === 'RB-7')!.parts.find((p) => p.type === 'table')!
    for (const p of PROPOSED_RUBRIC) {
      expect(p.id).toMatch(/\(proposed\)$/)
      expect(rb7.type === 'table' && rb7.rows.some((r) => `RB-7.${r[0].split('.')[1]}` === p.id.split(' ')[0])).toBe(false)
    }
    expect(LAB_RUBRIC_NOTE.text).toMatch(/proposed, pending faculty approval/)
  })
  it('the minimums are labBrief’s, for a team of four and a team of three', () => {
    const parts = LAB_PARTS.map((p) => p.minimum).join(' ')
    expect(parts).toContain(`team of 4: ${MIN.components} components`)
    expect(parts).toContain(`team of 3: ${MIN3.components} components`)
    expect(parts).toContain(`team of 4: ${MIN.interfaces} interfaces`)
    expect(parts).toContain(`team of 3: ${MIN3.interfaces} interfaces`)
    expect(parts).toContain(`team of 4: ${MIN.requirements} requirements`)
    expect(parts).toContain(`team of 3: ${MIN3.requirements} requirements`)
    expect(parts).toContain(`${MIN.riskLinks} interfaces linked to risks`)
  })
  it('every gate, advisory and part rule is stated, and the gate table carries each with its basis', () => {
    const md = labMarkdown()
    const all = [...COMPONENT_GATES, ...CARD_GATES, ...INTERFACE_GATES, ...INTERFACE_ADVISORIES, ...REQUIREMENT_GATES, ...CHANGE_GATES, ...PART_RULES]
    for (const g of all) {
      expect(md).toContain(g.short)
      expect(GATE_TABLE.some((x) => x.id === g.id && x.checks === g.short && x.basis === g.basis)).toBe(true)
    }
    expect(GATE_TABLE).toHaveLength(all.length)
    expect(GATE_TABLE.filter((g) => g.kind === 'advisory').map((g) => g.id)).toEqual([...INTERFACE_ADVISORIES.map((a) => a.id), 'span', 'kinds', 'single-child'])
    for (const g of GATE_TABLE.filter((x) => x.kind === 'advisory')) expect(g.basis).toMatch(/^Advisory/)
    for (const c of TABLE_COLUMNS) expect(md).toContain(c)
  })
  it('the procedure has the ten steps with the in-class minutes from the slides; each member owns two interface rows', () => {
    expect(LAB_PROCEDURE).toHaveLength(10)
    expect(LAB_PROCEDURE[0].when).toContain(`${S2_LAB.n2} min`)
    expect(LAB_PROCEDURE[1].when).toContain(`${S2_LAB.check} min, up to ${S2_LAB.checkTeams} teams`)
    expect(LAB_PROCEDURE.map((p) => p.when).slice(2)).toEqual(['Days 1–2', 'Days 2–3', 'Days 3–4', 'Day 4', 'Day 5', 'Day 5', 'Day 6', 'Day 7'])
    expect(LAB_PROCEDURE.map((p) => p.detail.text).join(' ')).toMatch(/each member owns at least two/)
    for (const role of ['Architecture', 'AI & Data Management', 'Requirements & Compliance', 'Verification & Validation']) expect(LAB_PROCEDURE.some((p) => p.who.includes(role)), role).toBe(true)
    const lab = getLecture(5, 2)?.sections.find((s) => s.id === 'w5s2-lab')
    if (lab) expect(S2_LAB.total).toBe(lab.slides.reduce((a, s) => a + s.minutes, 0))
    expect(LAB_METHOD).toHaveLength(9)
  })
  it('the workload rows sum as stated; a team of three carries the same load per person (within 0.1 h)', () => {
    expect(Math.round(LAB5_PERSON_HOURS.reduce((a, t) => a + t.hours, 0) * 10) / 10).toBe(LAB5_TEAM_HOURS)
    expect(LAB5_EACH).toBe(Math.round((LAB5_TEAM_HOURS / 4) * 10) / 10)
    expect(Math.abs(LAB5_THREE_PERSON.each - LAB5_EACH)).toBeLessThanOrEqual(0.1 + 1e-9)
    expect(LAB_WORKLOAD.map((w) => w.hours)).toEqual([0, LAB5_EACH])
    for (const t of LAB5_PERSON_HOURS) expect(LAB_WORKLOAD_NOTE.text).toContain(`${t.task} ${t.hours.toFixed(1)}`)
  })
  it('every reading cited is in the verified register and inside its verified range; the essential set is 12 pages', () => {
    for (const c of [...LAB5_REQUIRED_READINGS, ...LAB5_EXTENSION_READINGS]) {
      expect(getReading(c.reading).verified, c.reading).toBe(true)
      expect(citationInRange(c), `${c.reading} ${c.pages}`).toBe(true)
    }
    const pages = LAB5_REQUIRED_READINGS.reduce((a, c) => {
      const [x, y] = (c.pages ?? '').split('–').map(Number)
      return a + (y ? y - x + 1 : 1)
    }, 0)
    expect(pages).toBe(12)
  })
  it('“Taught in”: every cited slide id resolves once its session is registered; the fallback is used only before', () => {
    for (const s of [1, 2] as const) {
      const l = getLecture(5, s)
      if (!l) continue
      const ids = allSlides(l).map((x) => x.id)
      for (const id of Object.keys(TAUGHT_SLIDES[s])) expect(ids, id).toContain(id)
    }
    for (const m of LAB_METHOD) for (const ref of m.taught.split(/; (?=Session )/)) expect(ref, m.title).toMatch(/^Session [12], slide \d+ ‘.+’$/)
    expect(taughtIn(1, 'w5s1-no-such-slide', { slide: 99, title: 'fallback title' })).toBe('Session 1, slide 99 ‘fallback title’')
  })
  it('objectives: W5.1–W5.3 from the course; W5.4–W5.5 proposed', () => {
    expect(LAB_OBJECTIVES.map((o) => [o.id, o.proposed])).toEqual([['W5.1', false], ['W5.2', false], ['W5.3', false], ['W5.4', true], ['W5.5', true]])
  })
  it('the inputs link the worked examples and the lab tool', () => {
    expect(LAB_INPUTS.map((i) => i.to).filter(Boolean)).toEqual(['/week/5/examples', '/week/5/lab/tool'])
  })
  it('level descriptors: four levels for every lab criterion and the graduate criteria; the graduate task states the metric', () => {
    for (const l of LAB_LEVELS) expect(l.levels.every((x) => x.length > 3)).toBe(true)
    expect(LAB_LEVELS.filter((l) => l.graduate).length).toBeGreaterThanOrEqual(2)
    expect(LAB_SUBMISSION.graduate.text).toMatch(/κ = X \/ E/)
    for (const w of ['criticality', 'aggregation', 'concentration', 'crossings without a matching interface', 'a flow set written for one alternative']) expect(LAB_SUBMISSION.graduate.text).toContain(w)
  })
  it('no internal IDs in the student-facing prose (the check catches a planted one)', () => {
    expect(leaks(prose())).toEqual([])
    for (const planted of ['See RB-7.3.', 'per DECISION_LOG', 'outline §5.5', 'objective W5.2', 'S12 p.139', 'A21 decision']) expect(leaks([planted])).toEqual([planted])
  })
  it('no stale week numbers (the check catches a planted one)', () => {
    expect(prose().filter((t) => STALE.test(t))).toEqual([])
    expect(STALE.test('Week 6 is the Final Presentation')).toBe(true)
  })
  it('AeroLink is never the team’s enterprise (the check catches a planted one)', () => {
    expect(aeroAsTeam(prose())).toEqual([])
    expect(aeroAsTeam(['Write the AeroLink interfaces for your team.'])).toHaveLength(1)
  })
  it('American spelling in the module text and the generated file outside the quoted rubric', () => {
    const all = [...prose(), mdWithoutRubric().replace(/“[^”]*”/g, ' ')].join(' ')
    expect(all.match(BRITISH)).toBeNull()
    expect('the behaviour is modelled'.match(BRITISH)).not.toBeNull()
  })
})
