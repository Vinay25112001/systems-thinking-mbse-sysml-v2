// Lab L6 instructions: one source for the page and WEEK6_LAB_INSTRUCTIONS.md; every HARD GATE rests on a sentence a
// STUDENT can read (the phrase it names is on the face of the named slide: body, aside, caption or alt text; faculty notes
// do not count, because the student build strips them); the rubric rows resolve in the register, with the register's
// internal source codes removed for students; the proposed rows are labeled proposed; the minimums are labBrief's; the
// workload rows sum as stated and a team of three carries the same load per person; every slide reference resolves;
// every reading cited is in the verified register and inside its range (16 required pages); no AeroLink-as-team wording,
// no internal IDs in the prose, no stale week numbers, American spelling. Each content check is shown able to fail.
import { describe, expect, it } from 'vitest'
import labMdFile from '../../../docs/lectures/week06/WEEK6_LAB_INSTRUCTIONS.md?raw'
import {
  AROU_GATES, BASELINE_GATES, GAP_GATES, IMPACT_GATES, INCREMENT_GATES, LAB6_MINIMUMS as MIN, LAB6_MINIMUMS_THREE as MIN3, LAB6_PERSON_HOURS, LAB6_TEAM_HOURS, PART_RULES, REVIEW_GATES, TECH_GATES, UNKNOWN_GATES, type Taught,
} from '../lectures/week06/labBrief'
import { getLecture } from '../lectures'
import { allSlides, blockText } from '../lectures/text'
import type { Slide } from '../lectures/types'
import { citationInRange, getReading } from '../readings'
import {
  GATE_TABLE, LAB6_EACH, LAB6_EXTENSION_READINGS, LAB6_REQUIRED_READINGS, LAB6_THREE_PERSON, LAB_AT_A_GLANCE, LAB_INPUTS, LAB_LEVELS, LAB_METHOD, LAB_OBJECTIVES, LAB_PARTS, LAB_PROCEDURE, LAB_PURPOSE, LAB_RUBRIC_NOTE, LAB_RUBRIC_ROWS,
  LAB_SUBMISSION, LAB_TITLE, LAB_TOOL, LAB_WORKLOAD, LAB_WORKLOAD_NOTE, PROPOSED_RUBRIC, S2_LAB, labMarkdown, rubricRow, studentRubricText, taughtIn,
} from './week06Lab'

/** Student-facing prose (everything but the rubric table and its note, and the "judged by" column, which name rows). */
const prose = () => [
  LAB_TITLE, LAB_PURPOSE.text, ...LAB_AT_A_GLANCE.flatMap((x) => [x.label, x.value]), ...LAB_INPUTS.map((x) => x.text.text),
  ...LAB_METHOD.flatMap((m) => [m.title, m.text.text]), ...LAB_PROCEDURE.flatMap((p) => [p.step, p.when, p.who, p.output, p.detail.text]),
  ...LAB_PARTS.flatMap((p) => [p.heading, p.evidence.text, p.minimum]), LAB_SUBMISSION.format.text, LAB_SUBMISSION.where.text, LAB_SUBMISSION.grading.text, LAB_SUBMISSION.aiUse, LAB_SUBMISSION.graduate.text,
  LAB_TOOL.text, ...LAB_WORKLOAD.map((w) => w.activity), LAB_WORKLOAD_NOTE.text, ...LAB_LEVELS.flatMap((l) => [l.criterion, ...l.levels]), ...GATE_TABLE.flatMap((g) => [g.checks, g.basis]),
]
const INTERNAL = /\bRB-\d|\bFD-\d|DECISION_LOG|§|\bA2[012]\b|\boutline\b|\bS\d{2}\b|\bnew-pending-review\b|\bW6\.\d|\bP6-\d/
const leaks = (texts: string[]) => texts.filter((t) => INTERNAL.test(t))
const aeroAsTeam = (texts: string[]) => texts.filter((t) => /aero\s*-?\s*link/i.test(t)).filter((t) => !/never to AeroLink|worked example|AeroLink gaps/i.test(t))
const STALE = /Week 6[^.;]{0,40}(Final Presentation|SysML)|Week 7[^.;]{0,40}(SysML v2 model)|Week 1[01][^.;]{0,30}(Final Presentation|roadmap)|Week 14 evolution/i
const BRITISH = /\b(behaviour|modelling|modelled|organis(?:e|ed|ation|ational)|centre|colour|analys(?:e|ed|ing)|utilis(?:e|ation)|realis(?:e|ed)|recognis(?:e|ed)|summaris(?:e|ed)|optimis(?:e|ed)|prioritis(?:e|ed)|minimis(?:e|ed)|favour|labelled|labelling|judgement|programme|defence|catalogue|practise|whilst|amongst|fulfil|travelling|cancelled|licence|learnt|grey|metres?|neighbours?)\b/i

/** The text a student sees on a slide face: title, subtitle, body, aside, figure caption and alt text (never the notes). */
const faceText = (s: Slide) => [s.title, s.subtitle ?? '', ...[...s.body, ...(s.aside ?? [])].flatMap(blockText), s.figure?.caption ?? '', s.figure?.alt ?? ''].join(' ‖ ')
const slideOf = (x: Taught) => allSlides(getLecture(6, x.session)!).find((s) => s.id === x.slide)
/** A gate's basis is student-visible when its phrase is on the face of the named slide. */
const visible = (x: Taught) => {
  const s = slideOf(x)
  return !!s && faceText(s).includes(x.phrase)
}
const ALL_GATES = [...GAP_GATES, ...TECH_GATES, ...BASELINE_GATES, ...INCREMENT_GATES, ...UNKNOWN_GATES, ...AROU_GATES, ...IMPACT_GATES, ...REVIEW_GATES]

describe('Lab L6 instructions', () => {
  it('the page and WEEK6_LAB_INSTRUCTIONS.md come from one source (run `node scripts/build-lab-md.mjs 6` after changing week06Lab.ts)', () => {
    expect(labMdFile.replace(/\r\n/g, '\n')).toBe(labMarkdown())
    expect(labMarkdown()).toContain('Generated from `learning-studio/src/content/lab/week06Lab.ts`')
  })
  it('every hard gate rests on a phrase printed on the face of the slide it names (notes do not count)', () => {
    const missing = ALL_GATES.filter((g) => !visible(g.taught)).map((g) => `${g.id}: “${g.taught.phrase}” on ${g.taught.slide}`)
    const rules = PART_RULES.filter((r) => r.kind === 'gate').filter((r) => !('taught' in r) || !visible(r.taught as Taught)).map((r) => r.id)
    expect(missing).toEqual([])
    expect(rules).toEqual([])
  })
  it('negative direction: a phrase that is only in the faculty notes is not visible, and a wrong slide id is caught', () => {
    const s = allSlides(getLecture(6, 2)!).find((x) => x.id === 'w6s2-anatomy')!
    const onlyInNotes = s.notes.teach[0].slice(0, 40)
    expect(faceText(s).includes(onlyInNotes)).toBe(false)
    expect(visible({ session: 2, slide: 'w6s2-anatomy', phrase: onlyInNotes })).toBe(false)
    expect(visible({ session: 2, slide: 'w6s2-no-such-slide', phrase: 'Horizons' })).toBe(false)
  })
  it('every gate-table row names where a student reads it, by slide number and title; advisories say they never block', () => {
    for (const g of GATE_TABLE.filter((x) => x.kind === 'gate')) expect(g.taught, g.id).toMatch(/^Session [12], slide \d+ ‘.+’: “/)
    for (const g of GATE_TABLE.filter((x) => x.kind === 'advisory')) expect(g.taught, g.id).toBe('advisory: never blocks')
    expect(GATE_TABLE.filter((g) => g.kind === 'gate').length).toBeGreaterThan(30)
  })
  it('every rubric row resolves in the register; register source codes are removed for students; proposed rows are labeled', () => {
    for (const [rb, c] of LAB_RUBRIC_ROWS) expect(rubricRow(rb, c)[0]).toBe(c)
    for (const [rb, c] of LAB_RUBRIC_ROWS) for (const cell of rubricRow(rb, c)) expect(cell, `${rb} ${c}`).not.toMatch(/\[S\d|\bS1[0-3] p|A2\/B/)
    expect(studentRubricText('Near/mid/long states [S03 D15]')).toBe('Near/mid/long states')
    expect(studentRubricText('techniques applied (S11 p.1204–1210)')).toBe('techniques applied (SEBoK p.1204–1210)')
    expect(() => rubricRow('RB-15', '15.5')).toThrow()
    for (const p of PROPOSED_RUBRIC) expect(p.id).toMatch(/\(proposed\)$/)
    expect(LAB_RUBRIC_NOTE.text).toMatch(/proposed, pending faculty approval/)
  })
  it('the minimums are labBrief’s, for a team of four and a team of three', () => {
    const parts = LAB_PARTS.map((p) => p.minimum).join(' ')
    expect(parts).toContain(`team of 4: ${MIN.gaps} entries`)
    expect(parts).toContain(`team of 3: ${MIN3.gaps} entries`)
    expect(parts).toContain(`team of 4: ${MIN.technologies} technologies`)
    expect(parts).toContain(`team of 3: ${MIN3.technologies} technologies`)
    expect(parts).toContain(`team of 4: ${MIN.increments} increments`)
    expect(parts).toContain(`team of 3: ${MIN3.increments} increments`)
    expect(parts).toContain(`team of 4: ${MIN.unknowns} unknowns`)
    expect(parts).toContain(`team of 3: ${MIN3.unknowns} unknowns`)
  })
  it('the workload adds up, and a team of three carries the same load per person (within 0.1 h)', () => {
    expect(Math.round(LAB6_PERSON_HOURS.reduce((a, x) => a + x.hours, 0) * 10) / 10).toBe(LAB6_TEAM_HOURS)
    expect(LAB6_EACH).toBe(Math.round((LAB6_TEAM_HOURS / 4) * 10) / 10)
    expect(Math.abs(LAB6_THREE_PERSON.each - LAB6_EACH)).toBeLessThanOrEqual(0.1 + 1e-9)
    expect(S2_LAB.total).toBe(22)
  })
  it('every slide reference in the method resolves to a registered slide (no unresolved id form)', () => {
    for (const m of LAB_METHOD) {
      expect(m.taught, m.title).toMatch(/Session [12], slide \d+ ‘/)
      expect(m.taught, m.title).not.toMatch(/slide w6s/)
    }
    expect(taughtIn(1, 'w6s1-no-such-slide')).toMatch(/slide w6s1-no-such-slide/)
  })
  it('every reading is in the verified register and inside its range; the required readings are 17 pages (R107 p.447 added, review n5)', () => {
    let pages = 0
    for (const c of [...LAB6_REQUIRED_READINGS, ...LAB6_EXTENSION_READINGS]) {
      expect(getReading(c.reading).verified, c.reading).toBe(true)
      expect(citationInRange(c), `${c.reading} ${c.pages}`).toBe(true)
    }
    for (const c of LAB6_REQUIRED_READINGS) {
      const [a, b] = c.pages!.split('–').map(Number)
      pages += b ? b - a + 1 : 1
    }
    expect(pages).toBe(17)
  })
  it('objectives are W6.1–W6.6, the last three marked proposed', () => {
    expect(LAB_OBJECTIVES.map((o) => o.id)).toEqual(['W6.1', 'W6.2', 'W6.3', 'W6.4', 'W6.5', 'W6.6'])
    expect(LAB_OBJECTIVES.filter((o) => o.proposed).map((o) => o.id)).toEqual(['W6.4', 'W6.5', 'W6.6'])
  })
  it('the prose carries no internal IDs, never treats AeroLink as the team’s project, names no stale week, and is American English', () => {
    expect(leaks(prose())).toEqual([])
    expect(aeroAsTeam(prose())).toEqual([])
    expect(prose().filter((t) => STALE.test(t))).toEqual([])
    expect(prose().filter((t) => BRITISH.test(t))).toEqual([])
  })
  it('negative direction: an internal ID, AeroLink as the team, a stale week and a British spelling are each caught', () => {
    expect(leaks(['see RB-15.4'])).toHaveLength(1)
    expect(leaks(['objective W6.2'])).toHaveLength(1)
    expect(aeroAsTeam(['Build the AeroLink roadmap'])).toHaveLength(1)
    expect(STALE.test('before Week 14 evolution planning')).toBe(true)
    expect(BRITISH.test('the programme of change')).toBe(true)
  })
})
