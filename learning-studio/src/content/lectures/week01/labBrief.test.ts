// Sign-off review 2026-10-19 (§6 item 2): one consistency test that compares the lecture's lab brief (S2-18), its course
// need gate (S2-09), its PRT meaning and its in-class lab timing with the lab tool's constants and SELF_CHECK, the lab
// instructions and the model-inputs map. The lecture is the authoritative source; labBrief.ts carries its values.
import { describe, expect, it } from 'vitest'
import { blockText, allSlides } from '../text'
import { lectureReferences } from '../references'
import { WEEK01_SESSION1 } from './session1'
import { WEEK1_SESSION2 } from './session2'
import { NEEDS, PRIORITY_DEFINITION, PRIORITY_LABEL, RELATIONSHIP_VERB } from './aerolinkCase'
import { WEEK1_METHODS } from './methods'
import { readPriority, PRIORITIES, PRIORITY_LABEL as TOOL_PRIORITY_LABEL, importModelInputs, normalizeTeam, teamMarkdown, teamModelInputs } from '../../../workbench/week1/team'
import { TEAM_FIXTURE } from '../../../workbench/week1/teamFixture'
import { WEEK1_QUIZ } from '../../quizWeek1'
import { LEGACY_PRIORITY, NEED_PRIORITIES, NEED_PRIORITY_DEFINITION, NEED_PRIORITY_LABEL } from './labBrief'
import { LAB_MINIMUMS, LAB_MINIMUMS_THREE, NEED_FORM, NEED_GATE, NEED_GATE_TEXT, PRT_MEANING, REL_TYPES, REL_VERB, WEEK1_PREFIXES } from './labBrief'
import { SELF_CHECK } from '../../../workbench/week1/needQuality'
import * as TEAM from '../../../workbench/week1/team'
import { LAB_AT_A_GLANCE, LAB_METHOD, LAB_PROCEDURE, LAB_WORKLOAD, LAB_WORKLOAD_NOTE, labMarkdown } from '../../lab/week01Lab'
import { MODEL_INPUTS, TEAM_RECORD } from '../../learn/week01'
import { S2_LAB, TEAM_RECORD_TEAM_HOURS, THREE_PERSON, WORKLOAD } from '../../week1Path'

const slide = (id: string) => allSlides(WEEK1_SESSION2).find((s) => s.id === id)!
const slideText = (id: string) => {
  const s = slide(id)
  return [s.title, s.subtitle ?? '', s.figure?.alt ?? '', ...s.body.flatMap(blockText), ...(s.notes.teach ?? []), s.notes.figure ?? '', ...(s.notes.examples ?? [])].join(' ')
}
const lessonText = (lectureSections: typeof WEEK1_SESSION2.studentLesson) => lectureSections.flatMap((s) => s.blocks.flatMap((b) => ('text' in b && typeof b.text === 'string' ? [b.text] : blockText(b as never)))).join(' ')

describe('the course need gate: lecture S2-09 = labBrief = the tool’s self-check', () => {
  it('the lecture states the gate exactly as labBrief does, on the slide notes and in the lesson', () => {
    expect(NEED_GATE_TEXT).toBe('stated as a need, not a requirement; no design; attributed to a registered stakeholder; traced to its concern; a condition; a rationale')
    expect(slideText('s2-well-formed')).toContain(NEED_GATE_TEXT)
    expect(lessonText(WEEK1_SESSION2.studentLesson)).toContain(NEED_GATE_TEXT)
    expect(slideText('s2-well-formed')).toContain('“The [stakeholders] need the [system] to …”')
    expect(NEED_FORM).toBe('The [stakeholders] need the [system] to …')
  })
  it('SELF_CHECK has the gate’s six checks, in the lecture’s order, with the lecture’s labels', () => {
    expect(SELF_CHECK.map((c) => c.id)).toEqual(NEED_GATE.map((g) => g.id))
    expect(SELF_CHECK.map((c) => c.gate).join('; ')).toBe(NEED_GATE_TEXT)
    expect(SELF_CHECK[0].label).toContain(NEED_FORM)
    expect(SELF_CHECK.find((c) => c.id === 'traced')!.label).toMatch(/^Traced to its concern/)
  })
})

describe('the lab brief minimums: lecture S2-18 = labBrief = the tool = the lab instructions', () => {
  const brief = slideText('s2-lab-brief')
  it('the S2-18 figure states every minimum from labBrief', () => {
    for (const t of [`at least ${LAB_MINIMUMS.inside} elements inside its boundary (PRT`, `at least ${LAB_MINIMUMS.context} external systems`, `at least ${LAB_MINIMUMS.stakeholders} stakeholders`, `at least ${LAB_MINIMUMS.relationships} relationships, ${LAB_MINIMUMS.conflicts} conflict`, `at least ${LAB_MINIMUMS.needs} needs from at least ${LAB_MINIMUMS.needSources} stakeholders`, 'problem, mission and goals', 'each traced to the mission or a goal'])
      expect(brief, t).toContain(t)
  })
  it('the tool’s constants are the brief’s', () => {
    expect([TEAM.MIN_INSIDE, TEAM.MIN_CONTEXT, TEAM.MIN_STAKEHOLDERS, TEAM.MIN_ROLE_GROUPS, TEAM.MIN_RELATIONSHIPS, TEAM.MIN_CONFLICTS, TEAM.MIN_NEEDS, TEAM.MIN_NEED_SOURCES]).toEqual([
      LAB_MINIMUMS.inside, LAB_MINIMUMS.context, LAB_MINIMUMS.stakeholders, LAB_MINIMUMS.roleGroups, LAB_MINIMUMS.relationships, LAB_MINIMUMS.conflicts, LAB_MINIMUMS.needs, LAB_MINIMUMS.needSources,
    ])
    expect(TEAM.needsMinimum({ threePersonTeam: true })).toEqual(LAB_MINIMUMS_THREE)
    expect([...TEAM.WEEK1_PREFIXES]).toEqual([...WEEK1_PREFIXES])
  })
  it('the lecture’s charter assigns every Week 1 prefix the tool requires an owner for', () => {
    const charter = slideText('s2-lab-charter')
    for (const p of WEEK1_PREFIXES) expect(charter, p).toContain(p)
  })
  it('the lab instructions and the Team Record parts state the same minimums, the need form and the gate', () => {
    const md = labMarkdown()
    expect(md).toContain(NEED_FORM)
    expect(md).toContain(NEED_GATE_TEXT)
    expect(md).toContain(`at least ${LAB_MINIMUMS.relationships} relationships`)
    expect(LAB_METHOD.find((m) => m.title === 'Relationships')!.text.text).toMatch(/Required, as the lecture sets it/)
    expect(md).not.toMatch(/proposed for Week 1 \(RB-1\.4, pending/)
    const parts = TEAM_RECORD.parts.map((p) => `${p.evidence.text} ${p.minimum}`).join(' ')
    for (const t of ['problem statement', 'MGO-001', 'PRT ID', 'REL', 'The [stakeholders] need the [system] to', 'goal it serves', 'six minimum checks']) expect(parts, t).toContain(t)
  })
  it('relationship types: labBrief = the AeroLink case', () => {
    expect([...REL_TYPES].sort()).toEqual(Object.keys(RELATIONSHIP_VERB).sort())
    expect(REL_VERB).toEqual(RELATIONSHIP_VERB)
  })
})

describe('PRT has one meaning: parts inside the boundary of the system of interest (M2)', () => {
  it('the lecture, the lab, the tool and the model-inputs map agree; no “partner organization” reading survives', () => {
    const s1Charter = allSlides(WEEK01_SESSION1).find((s) => s.id === 's1-team-charter')!
    const lectureText = [JSON.stringify(s1Charter), lessonText(WEEK01_SESSION1.studentLesson), slideText('s2-lab-brief'), slideText('s2-lab-charter')].join(' ')
    expect(lectureText).not.toMatch(/PRT[^.]{0,40}partner organi[sz]ation/)
    expect(lectureText).toMatch(/PRT \(the elements inside the boundary of the system of interest/)
    expect(slideText('s2-lab-charter')).toContain(PRT_MEANING)
    expect(labMarkdown()).toContain(`a PRT is ${PRT_MEANING}`)
    expect(MODEL_INPUTS.rows.find((r) => r.id === 'inside')!.seeds[0].element).toBe('part (usage)')
  })
})

describe('in-class lab timing: the lab reads the Session 2 slide minutes (M4)', () => {
  it('22 min: brief 2, charter 8, pitch 10 for up to five teams, close 2', () => {
    expect(S2_LAB).toEqual({ total: 22, brief: 2, charter: 8, pitch: 10, close: 2, pitchTeams: 5 })
    expect(allSlides(WEEK1_SESSION2).filter((s) => s.id.startsWith('s2-lab-')).reduce((a, s) => a + s.minutes, 0)).toBe(S2_LAB.total)
    const glance = LAB_AT_A_GLANCE.find((x) => x.label === 'In class')!.value
    expect(glance).toContain(`Session 2, ${S2_LAB.total} min`)
    expect(glance).toContain(`charter (${S2_LAB.charter} min`)
    expect(glance).toContain(`pitch (${S2_LAB.pitch} min, up to ${S2_LAB.pitchTeams} teams)`)
    expect(glance).toMatch(/norms and ID owners are finished by the end of day 1/)
    expect(LAB_PROCEDURE[0].when).toBe(`In class, Session 2 (${S2_LAB.charter} min); finished by the end of day 1`)
    expect(LAB_PROCEDURE[1].when).toBe(`In class, Session 2 (${S2_LAB.pitch} min, up to ${S2_LAB.pitchTeams} teams)`)
    expect(LAB_WORKLOAD[0].activity).toContain(`${S2_LAB.total} min`)
    expect(labMarkdown()).not.toMatch(/28 min|\(10 min\)|\(12 min\)/)
    // the lecture's own slide says the same
    expect(slide('s2-lab-charter').subtitle).toMatch(/8 minutes, in teams; norms and ID owners finished by the end of day 1/)
  })
})

describe('one workload story (Mo4): lecture notes = lab = week page', () => {
  it('the Team Record share is the same 2.5 h everywhere; the three-person case is stated honestly and flagged', () => {
    expect(TEAM_RECORD_TEAM_HOURS / 4).toBe(WORKLOAD.teamHours)
    expect(slideText('s2-lab-brief')).toContain(`about ${WORKLOAD.teamHours.toFixed(1)} hours per student`)
    expect(slideText('s2-lab-brief')).toContain(`about ${THREE_PERSON.each.toFixed(1)} hours each`)
    expect(LAB_WORKLOAD_NOTE.text).toContain(`about ${WORKLOAD.teamHours.toFixed(1)} h each`)
    expect(LAB_WORKLOAD_NOTE.text).toContain(`about ${THREE_PERSON.each.toFixed(1)} h each, so its week is about ${THREE_PERSON.week.toFixed(1)} h`)
    expect(THREE_PERSON.week).toBeGreaterThan(WORKLOAD.budget) // honest: over budget, hence flagged
    expect(LAB_WORKLOAD_NOTE.text).toMatch(/flagged for faculty decision/)
  })
})

describe('references: one page range per reading across both decks (m6)', () => {
  it('a reading cited in both sessions shows the same range on both credits slides', () => {
    const week = [WEEK01_SESSION1, WEEK1_SESSION2]
    const s1 = lectureReferences([WEEK01_SESSION1], week)
    const s2 = lectureReferences([WEEK1_SESSION2], week)
    expect(s1.find((e) => e.reading.id === 'R53')!.pages).toBe(s2.find((e) => e.reading.id === 'R53')!.pages)
    for (const e of s1) {
      const o = s2.find((x) => x.reading.id === e.reading.id)
      if (o) expect(o.pages, e.reading.id).toBe(e.pages)
    }
    // each deck still lists only what it cites
    expect(s1.length).toBe(lectureReferences([WEEK01_SESSION1]).length)
    expect(s2.length).toBe(lectureReferences([WEEK1_SESSION2]).length)
  })
})

// Faculty final review (DECISION_LOG A21 item 1): one need-priority vocabulary, MITRE's categories (R65 p.325: "mandatory,
// critical, desirable, or optional"), everywhere: lecture, lesson, case data, lab tool, exports, lab instructions, quiz,
// fixture. Old exports with high / medium / low still load, mapped. Each check is also shown able to fail.
describe('need priority: one vocabulary across lecture, case, tool, exports, lab and quiz (A21 item 1)', () => {
  const OLD = /\b(high|medium|low)\b/i
  it('labBrief holds the four MITRE categories; the case and the tool read them from there', () => {
    expect([...NEED_PRIORITIES]).toEqual(['mandatory', 'critical', 'desirable', 'optional'])
    expect(PRIORITY_LABEL).toBe(NEED_PRIORITY_LABEL)
    expect(PRIORITY_DEFINITION).toBe(NEED_PRIORITY_DEFINITION)
    expect(PRIORITIES).toEqual([...NEED_PRIORITIES])
    expect(TOOL_PRIORITY_LABEL).toBe(NEED_PRIORITY_LABEL)
    for (const n of NEEDS) expect(NEED_PRIORITIES, n.id).toContain(n.priority)
  })
  it('the lecture slide, the priority table and the lesson name the four categories and cite R65 p.325', () => {
    const conflict = slideText('s2-conflict')
    for (const p of NEED_PRIORITIES) expect(conflict, p).toContain(p)
    expect(allSlides(WEEK1_SESSION2).find((s) => s.id === 's2-conflict')!.sources.some((c) => c.reading === 'R65' && c.pages === '325')).toBe(true)
    const lesson = lessonText(WEEK1_SESSION2.studentLesson)
    for (const p of NEED_PRIORITIES) expect(lesson, p).toContain(NEED_PRIORITY_LABEL[p])
    // no priority is expressed as high / medium / low in the lecture, except the misconception that names it to correct it
    expect(JSON.stringify(WEEK1_SESSION2).replace('Priority is high, medium or low.', '(the misconception slot)')).not.toMatch(/priorit(y|ies)[^.]{0,40}\b(high|medium|low)\b(?![^.]{0,60}business value)/i)
  })
  it('the tool’s fixture, Markdown and JSON exports carry MITRE categories only', () => {
    for (const n of TEAM_FIXTURE.needs) expect(NEED_PRIORITIES, n.id).toContain(n.priority)
    const json = teamModelInputs(TEAM_FIXTURE)
    for (const n of json.needs) expect(NEED_PRIORITIES, n.id).toContain(n.priority)
    const md = teamMarkdown(TEAM_FIXTURE)
    const rows = md.split('\n').filter((l) => /^\| NEED-\d{3} /.test(l))
    expect(rows.length).toBe(TEAM_FIXTURE.needs.length)
    for (const r of rows) expect(r.split(' | ')[5], r).toMatch(/^(Mandatory|Critical|Desirable|Optional)$/)
  })
  it('old exports and stored records with high / medium / low still load, mapped; mandatory is never inferred', () => {
    expect(LEGACY_PRIORITY).toEqual({ high: 'critical', medium: 'desirable', low: 'optional' })
    expect(['high', 'medium', 'low', 'High', 'mandatory', 'nonsense', undefined].map(readPriority)).toEqual(['critical', 'desirable', 'optional', 'critical', 'mandatory', '', ''])
    const old = teamModelInputs(TEAM_FIXTURE)
    const legacy = { ...old, version: 3, needs: old.needs.map((n, i) => ({ ...n, priority: ['high', 'medium', 'low'][i % 3] })) }
    const r = importModelInputs(JSON.stringify(legacy))
    expect('error' in r).toBe(false)
    if (!('error' in r)) expect(r.needs.map((n) => n.priority)).toEqual(old.needs.map((_, i) => ['critical', 'desirable', 'optional'][i % 3]))
    expect(normalizeTeam({ needs: [{ id: 'NEED-001', priority: 'low' }] }).needs[0].priority).toBe('optional')
  })
  it('the lab instructions and the Team Record name the categories, never high / medium / low', () => {
    const md = labMarkdown()
    for (const p of NEED_PRIORITIES) expect(md, p).toContain(p)
    expect(md).not.toMatch(/priority[^.]{0,30}\b(high|medium|low)\b/i)
    const parts = TEAM_RECORD.parts.map((p) => `${p.evidence.text} ${p.minimum}`).join(' ')
    expect(parts).toMatch(/mandatory, critical, desirable or optional/)
  })
  it('no quiz item uses another priority scale', () => {
    for (const q of WEEK1_QUIZ) expect(`${q.prompt} ${q.options.map((o) => `${o.text} ${o.explanation}`).join(' ')}`, q.id).not.toMatch(/priorit[^.]{0,40}\b(high|medium|low)\b/i)
  })
  it('negative direction: a high / medium / low priority would be caught', () => {
    expect(NEED_PRIORITIES as readonly string[]).not.toContain('high')
    expect('Priority: High'.match(OLD)).not.toBeNull()
    const tampered = teamModelInputs({ ...TEAM_FIXTURE, needs: TEAM_FIXTURE.needs.map((n) => ({ ...n, priority: 'high' as never })) })
    expect(tampered.needs.every((n) => (NEED_PRIORITIES as readonly string[]).includes(n.priority))).toBe(false)
  })
})

// Faculty final review (A21 item 2): the form is recommended, and valid alternatives are taught as accepted.
describe('the need form is taught as recommended, not required (A21 item 2)', () => {
  it('the slide, the notes and the lesson say “recommended” and that another phrasing passes', () => {
    const t = slideText('s2-well-formed')
    expect(t).toMatch(/recommended/)
    expect(t).toMatch(/another phrasing passes/i)
    expect(t).toMatch(/such as/)
    const lesson = lessonText(WEEK1_SESSION2.studentLesson)
    expect(lesson).toMatch(/The form is a recommendation, not a gate/)
    expect(lesson).toMatch(/Hospital dispatchers need blood units delivered within 30 minutes of a request/)
    expect(labMarkdown()).toMatch(/Another phrasing is accepted/)
  })
  it('no Week 1 student text says a valid alternative form is rejected', () => {
    const all = [JSON.stringify(WEEK01_SESSION1), JSON.stringify(WEEK1_SESSION2), labMarkdown(), JSON.stringify(TEAM_RECORD), JSON.stringify(WEEK1_QUIZ)].join(' ')
    expect(all).not.toMatch(/outcome form[^.]{0,40}(is )?rejected|not the need form|not in the need form|in SEBoK’s form/i)
  })
})

// Faculty final review (A21 item 4): the why of each method, on a slide, in the notes of the method's slide, and in the lesson.
describe('why each method, and what it feeds (A21 item 4)', () => {
  it('seven methods; the summary slide shows them; each method’s slide says the same sentence; the lesson has the table', () => {
    expect(WEEK1_METHODS.map((m) => m.id)).toEqual(['proposal', 'mission', 'charter', 'identification', 'classification', 'elicitation', 'statements'])
    const why = allSlides(WEEK1_SESSION2).find((s) => s.id === 's2-why-methods')!
    expect(why.figure!.id).toBe('w1s2-methods-why')
    const all = [...allSlides(WEEK01_SESSION1), ...allSlides(WEEK1_SESSION2)]
    for (const m of WEEK1_METHODS) {
      const s = all.find((x) => x.id === m.slide)!
      expect(s, m.id).toBeDefined()
      expect(s.notes.teach.join(' '), m.id).toContain(m.say)
      expect(m.say, m.id).toMatch(/Week 2|Week 8/)
    }
    const lesson = WEEK1_SESSION2.studentLesson.find((x) => x.id === 's2-l-why-methods')!
    const table = lesson.blocks.find((b) => b.kind === 'table')!
    expect(table.kind === 'table' && table.rows.length).toBe(WEEK1_METHODS.length)
  })
})
