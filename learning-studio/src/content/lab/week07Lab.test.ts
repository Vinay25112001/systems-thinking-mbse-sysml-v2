// Lab L7 instructions: one source for the page and WEEK7_LAB_INSTRUCTIONS.md; every HARD GATE rests on a sentence a
// STUDENT can read (the phrase it names is on the face of the named slide; faculty notes do not count, because the student
// build strips them); the register rubric rows resolve, with internal source codes removed for students; the presentation
// rubric has a descriptor at every level for every criterion, team and individual, and is labeled proposed; the workload
// rows sum as stated; every slide reference resolves; every reading is in the verified register and inside its range; the
// prose carries no internal IDs, never treats AeroLink as the team's project, names no stale week and is American English;
// no "fixed" disposition is offered. Each content check is shown able to fail.
import { describe, expect, it } from 'vitest'
import labMdFile from '../../../docs/lectures/week07/WEEK7_LAB_INSTRUCTIONS.md?raw'
import { DISPOSITIONS, FINDING_GATES, LAB7_PERSON_HOURS, LAB7_TEAM_HOURS, PART_RULES, PREP_GATES, RID_GATES, SOURCE_GATES, SUMMARY_GATES, type Taught } from '../lectures/week07/labBrief'
import { getLecture } from '../lectures'
import { allSlides, blockText } from '../lectures/text'
import type { Slide } from '../lectures/types'
import { citationInRange, getReading } from '../readings'
import {
  GATE_TABLE, IN_CLASS, LAB7_EACH, LAB7_EXTENSION_READINGS, LAB7_REQUIRED_READINGS, LAB_AT_A_GLANCE, LAB_INPUTS, LAB_METHOD, LAB_OBJECTIVES, LAB_PARTS, LAB_PROCEDURE, LAB_PURPOSE, LAB_RUBRIC_NOTE, LAB_RUBRIC_ROWS, LAB_SUBMISSION, LAB_TITLE, LAB_TOOL,
  LAB_WORKLOAD, LAB_WORKLOAD_NOTE, PRESENTATION_INSTRUCTIONS, PRESENTATION_RUBRIC, REVIEW_INSTRUCTIONS, RID_FORM_FIELDS, RUBRIC_LEVELS, labMarkdown, ridFormMarkdown, rubricRow, studentRubricText, taughtIn,
} from './week07Lab'

const prose = () => [
  LAB_TITLE, LAB_PURPOSE.text, ...LAB_AT_A_GLANCE.flatMap((x) => [x.label, x.value]), ...LAB_INPUTS.map((x) => x.text.text),
  ...LAB_METHOD.flatMap((m) => [m.title, m.text.text]), ...LAB_PROCEDURE.flatMap((p) => [p.step, p.when, p.who, p.output, p.detail.text]),
  ...LAB_PARTS.flatMap((p) => [p.heading, p.evidence.text, p.minimum]), LAB_SUBMISSION.format.text, LAB_SUBMISSION.where.text, LAB_SUBMISSION.grading.text, LAB_SUBMISSION.aiUse, LAB_SUBMISSION.graduate.text,
  LAB_TOOL.text, ...LAB_WORKLOAD.map((w) => w.activity), LAB_WORKLOAD_NOTE.text, ...PRESENTATION_RUBRIC.flatMap((l) => [l.criterion, ...l.levels]), ...GATE_TABLE.flatMap((g) => [g.checks, g.basis]),
  ...PRESENTATION_INSTRUCTIONS.flatMap((x) => [x.title, x.text.text]), ...REVIEW_INSTRUCTIONS.flatMap((x) => [x.title, x.text.text]), ...RID_FORM_FIELDS.flatMap((f) => [f.field, f.holds]), ridFormMarkdown(),
]
const INTERNAL = /\bRB-\d|\bFD-\d|DECISION_LOG|§|\bA2[0-6]\b|\boutline\b|\bS\d{2}\b|\bnew-pending-review\b|\bW7\.\d|\bP7-\d/
const leaks = (texts: string[]) => texts.filter((t) => INTERNAL.test(t))
const aeroAsTeam = (texts: string[]) => texts.filter((t) => /aero\s*-?\s*link/i.test(t)).filter((t) => !/never on AeroLink|AeroLink package|worked example/i.test(t))
const STALE = /Week 7[^.;]{0,40}(SysML v2 model\b(?! v0)|roadmap\b)|Week 6[^.;]{0,30}(package|Final Presentation)|Week (?!8\b)\d+[^.;]{0,10}imports the (closed )?package/i
const BRITISH = /\b(behaviour|modelling|modelled|organis(?:e|ed|ation|ational)|centre|colour|analys(?:e|ed|ing)|utilis(?:e|ation)|realis(?:e|ed)|recognis(?:e|ed)|summaris(?:e|ed)|optimis(?:e|ed)|prioritis(?:e|ed)|minimis(?:e|ed)|favour|labelled|labelling|judgement|programme|defence|catalogue|practise|whilst|amongst|fulfil|travelling|cancelled|licence|learnt|grey|metres?|neighbours?)\b/i

const faceText = (s: Slide) => [s.title, s.subtitle ?? '', ...[...s.body, ...(s.aside ?? [])].flatMap(blockText), s.figure?.caption ?? '', s.figure?.alt ?? ''].join(' ‖ ')
const slideOf = (x: Taught) => allSlides(getLecture(7, x.session)!).find((s) => s.id === x.slide)
const visible = (x: Taught) => {
  const s = slideOf(x)
  return !!s && faceText(s).includes(x.phrase)
}
const ALL_GATES = [...SOURCE_GATES, ...FINDING_GATES, ...SUMMARY_GATES, ...PREP_GATES, ...RID_GATES]

describe('Lab L7 instructions', () => {
  it('the page and WEEK7_LAB_INSTRUCTIONS.md come from one source (run `node scripts/build-lab-md.mjs 7` after changing week07Lab.ts)', () => {
    expect(labMdFile.replace(/\r\n/g, '\n')).toBe(labMarkdown())
    expect(labMarkdown()).toContain('Generated from `learning-studio/src/content/lab/week07Lab.ts`')
  })
  it('every hard gate rests on a phrase printed on the face of the slide it names (notes do not count)', () => {
    const missing = ALL_GATES.filter((g) => !visible(g.taught)).map((g) => `${g.id}: “${g.taught.phrase}” on ${g.taught.slide}`)
    const rules = PART_RULES.filter((r) => r.kind === 'gate').filter((r) => !('taught' in r) || !visible(r.taught as Taught)).map((r) => r.id)
    expect(missing).toEqual([])
    expect(rules).toEqual([])
  })
  it('negative direction: a phrase that is only in the faculty notes is not visible, and a wrong slide id is caught', () => {
    const s = allSlides(getLecture(7, 1)!).find((x) => x.id === 'w7s1-audit-metrics')!
    const onlyInNotes = s.notes.teach[1].slice(0, 40)
    expect(faceText(s).includes(onlyInNotes)).toBe(false)
    expect(visible({ session: 1, slide: 'w7s1-audit-metrics', phrase: onlyInNotes })).toBe(false)
    expect(visible({ session: 1, slide: 'w7s1-no-such-slide', phrase: 'Coverage' })).toBe(false)
  })
  it('every gate-table row names where a student reads it, by slide number and title; advisories say they never block', () => {
    for (const g of GATE_TABLE.filter((x) => x.kind === 'gate')) expect(g.taught, g.id).toMatch(/^Session [12], slide \d+ ‘.+’: “/)
    for (const g of GATE_TABLE.filter((x) => x.kind === 'advisory')) expect(g.taught, g.id).toBe('advisory: never blocks')
    expect(GATE_TABLE.filter((g) => g.kind === 'gate').length).toBeGreaterThanOrEqual(20)
  })
  it('no “fixed” disposition is offered: a fix is a corrected week imported again (no untestable completion claim)', () => {
    expect(DISPOSITIONS.map((d) => d.id)).toEqual(['record', 'defer'])
    expect(LAB_TOOL.text).toMatch(/a rationale that only claims “fixed”, “resolved” or “withdrawn” is refused/)
    expect(LAB_TOOL.text).toMatch(/a collision can only be deferred/)
  })
  it('every register rubric row resolves, with internal codes removed for students', () => {
    for (const [rb, c] of LAB_RUBRIC_ROWS) expect(rubricRow(rb, c)[0]).toBe(c)
    for (const [rb, c] of LAB_RUBRIC_ROWS) for (const cell of rubricRow(rb, c).slice(0, 6)) expect(cell, `${rb} ${c}`).not.toMatch(/\[S\d|\[REC|\*\*|\(B\/A2\)|\bS1[0-3] p/)
    expect(studentRubricText('**Individual Q&A** (20)')).toBe('Individual Q&A (20)')
    expect(studentRubricText('from the model (B/A2)')).toBe('from the model')
    expect(() => rubricRow('RB-11', '11.9')).toThrow()
    expect(LAB_RUBRIC_NOTE.text).toMatch(/proposed, pending faculty approval/)
  })
  it('the presentation rubric has a descriptor at every level for every criterion: six team, two individual, four graduate', () => {
    expect(RUBRIC_LEVELS).toHaveLength(4)
    expect(PRESENTATION_RUBRIC.filter((x) => x.scope === 'team')).toHaveLength(6)
    expect(PRESENTATION_RUBRIC.filter((x) => x.scope === 'individual')).toHaveLength(2)
    expect(PRESENTATION_RUBRIC.filter((x) => x.scope === 'graduate')).toHaveLength(4)
    for (const x of PRESENTATION_RUBRIC) {
      expect(x.levels).toHaveLength(4)
      for (const l of x.levels) expect(l.split(/\s+/).length, `${x.id}: ${l}`).toBeGreaterThanOrEqual(2)
      expect(new Set(x.levels).size, x.id).toBe(4)
    }
  })
  it('the RID form asks for a location, a criterion, a severity and a fix', () => {
    const fields = RID_FORM_FIELDS.map((f) => f.field).join(' ')
    for (const f of ['Where', 'Criterion or source', 'Severity', 'Proposed fix']) expect(fields).toContain(f)
    expect(ridFormMarkdown()).toMatch(/## RID-1/)
  })
  it('the workload adds up', () => {
    expect(Math.round(LAB7_PERSON_HOURS.reduce((a, x) => a + x.hours, 0) * 10) / 10).toBe(LAB7_TEAM_HOURS)
    expect(LAB7_EACH).toBe(Math.round((LAB7_TEAM_HOURS / 4) * 10) / 10)
    expect(IN_CLASS.studio).toBe(13)
    expect(IN_CLASS.review).toBe(44)
  })
  it('every slide reference in the method resolves to a registered slide', () => {
    for (const m of LAB_METHOD) {
      expect(m.taught, m.title).toMatch(/Session [12], slide \d+ ‘/)
      expect(m.taught, m.title).not.toMatch(/slide w7s/)
    }
    expect(taughtIn(1, 'w7s1-no-such-slide')).toMatch(/slide w7s1-no-such-slide/)
  })
  it('every reading is in the verified register and inside its range; the required readings are 10 pages', () => {
    let pages = 0
    for (const c of [...LAB7_REQUIRED_READINGS, ...LAB7_EXTENSION_READINGS]) {
      expect(getReading(c.reading).verified, c.reading).toBe(true)
      expect(citationInRange(c), `${c.reading} ${c.pages}`).toBe(true)
    }
    for (const c of LAB7_REQUIRED_READINGS) {
      const [a, b] = c.pages!.split('–').map(Number)
      pages += b ? b - a + 1 : 1
    }
    expect(pages).toBe(10)
  })
  it('objectives are W7.1–W7.5, the last two marked proposed', () => {
    expect(LAB_OBJECTIVES.map((o) => o.id)).toEqual(['W7.1', 'W7.2', 'W7.3', 'W7.4', 'W7.5'])
    expect(LAB_OBJECTIVES.filter((o) => o.proposed).map((o) => o.id)).toEqual(['W7.4', 'W7.5'])
  })
  it('the prose carries no internal IDs, never treats AeroLink as the team’s project, names no stale week, and is American English', () => {
    expect(leaks(prose())).toEqual([])
    expect(aeroAsTeam(prose())).toEqual([])
    expect(prose().filter((t) => STALE.test(t))).toEqual([])
    expect(prose().filter((t) => BRITISH.test(t))).toEqual([])
  })
  it('negative direction: an internal ID, AeroLink as the team, a stale week and a British spelling are each caught', () => {
    expect(leaks(['see RB-11.2'])).toHaveLength(1)
    expect(leaks(['objective W7.2'])).toHaveLength(1)
    expect(aeroAsTeam(['Assemble your package around AeroLink'])).toHaveLength(1)
    expect(STALE.test('Week 6 imports the package')).toBe(true)
    expect(BRITISH.test('the programme of change')).toBe(true)
  })
})
