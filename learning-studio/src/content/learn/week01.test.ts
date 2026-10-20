// Content tests for the rebuilt Week 1 (Team Formation / Needs / Identifying Stakeholders, 2026-10-18). They guard the
// recurring defects named in the rebuild brief: key-letter bias and length cues, items not answerable from the lesson,
// checks overlapping quiz items, citations outside the week's register, workload that only sums, AeroLink as the team
// subject, and tools that disagree with the lesson (the worked examples must pass or fail the same checks the tools run).
import { describe, expect, it } from 'vitest'
import { WEEKS } from '../course'
import { WEEK1_QUIZ } from '../quizWeek1'
import { getLecture } from '../lectures'
import { allSlides, blockText } from '../lectures/text'
import { citationInRange, getReading, type Citation } from '../readings'
import { WORKLOAD_TARGET, workloadTotal } from '../schema'
import { LESSON_WPM, WORKLOAD as PATH_WORKLOAD, WORKLOAD_ROWS, WORKLOAD_SUMMARY } from '../week1Path'
import week01 from '../weeks/week01'
import week1Missions from '../missions/week01'
import { isSpecificConcern, REFERENCE_REGISTER, AEROLINK_SOI_NAMES, AEROLINK_SYSTEM_NAMES } from '../../workbench/week1/stakeholders'
import { assessNeed } from '../../workbench/week1/needQuality'
import { WEEK1_BLOCK_BY_ID, bodyText, resolveBullet, resolveRef, sectionProse, sectionWords } from './resolve'
import { PENDING } from './types'
import {
  BLOCK_TO_SECTION, BRIDGE, CONCEPT_CHAIN, GRAD_REVIEW, LEARN_SECTIONS, MEET_AEROLINK, MODEL_INPUTS, OPENER, ORIENTATION, OVERVIEW_MINUTES, PRACTICE_BAR,
  PRACTICE_PREREQ, SUMMARY, TEAM_RECORD, TRIM, TRIMMED_TOTAL, WORKLOAD, WORKLOAD_BUDGET, WORKLOAD_NOTE, teamRecordTemplate,
} from './week01'

/** The AeroLink need assessment (needQuality.ts) of one statement against the reference register. */
const assessRef = (text: string, sources: string[]) => assessNeed({ name: 'ref', text, conditions: '', rationale: 'the reference rationale is recorded', sources }, { stakeholders: REFERENCE_REGISTER, soiNames: AEROLINK_SOI_NAMES, systemNames: AEROLINK_SYSTEM_NAMES })

const W1 = WEEKS[0]
const objectiveIds = W1.objectives.map((o) => o.id)
const pages = (p?: string): [number, number] | null => {
  if (!p) return null
  const nums = p.split(/[,–-]/).map((x) => Number(x.trim())).filter((x) => !Number.isNaN(x))
  return [Math.min(...nums), Math.max(...nums)]
}
/** The Week 1 register: course.ts readings and extension, each with its page range (or the whole verified reading). */
const REGISTER = [...W1.readings, ...W1.extension]
function inWeekRegister(c: Citation): boolean {
  const entries = REGISTER.filter((r) => r.reading === c.reading)
  if (!entries.length || !citationInRange(c)) return false
  const cp = pages(c.pages)
  if (entries.some((e) => !e.pages)) return true
  if (!cp) return false
  // every cited page must be covered by some register entry for that reading (entries may split a range)
  for (let n = cp[0]; n <= cp[1]; n++) if (!entries.some((e) => { const ep = pages(e.pages)!; return n >= ep[0] && n <= ep[1] })) return false
  return true
}
const words = (s: string) => s.toLowerCase().replace(/[“”"’'(),.;:!?]/g, ' ').split(/\s+/).filter(Boolean)
/** True when a and b share a run of at least n consecutive words. */
function sharesRun(a: string, b: string, n = 8): boolean {
  const A = words(a)
  const B = ` ${words(b).join(' ')} `
  for (let i = 0; i + n <= A.length; i++) if (B.includes(` ${A.slice(i, i + n).join(' ')} `)) return true
  return false
}
const keyOf = <T extends { correct: boolean }>(opts: T[]) => opts.find((o) => o.correct)!
/** The Learn view's fixed per-section rotation of check options (Learn.tsx displayOrder). */
const displayed = (index: number, n: number) => (i: number) => (i + ((index * 3 + 1) % n)) % n

describe('Week 1 Learn sections: structure and sources', () => {
  it('has seven sections in prerequisite order, team first, needs last', () => {
    expect(LEARN_SECTIONS.map((s) => s.code)).toEqual(['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'])
    expect(LEARN_SECTIONS.map((s) => s.title)).toEqual(['Forming your team', 'System, system of interest and enterprise', 'Boundary and context', 'Identifying stakeholders', 'Classifying stakeholders and recording their concerns', 'Stakeholder needs', 'Writing well-formed need statements'])
  })

  it('every reference resolves to the Week 1 blocks, and every block a section cuts from is in the week', () => {
    for (const s of LEARN_SECTIONS) {
      for (const b of [...s.body, ...(s.afterWorked ?? [])]) expect(bodyText(b).length, s.id).toBeGreaterThan(20)
      for (const id of s.goDeeper) expect(WEEK1_BLOCK_BY_ID[id], `${s.id} goDeeper ${id}`).toBeDefined()
      const w = s.worked
      if (w?.kind === 'bullets') {
        resolveRef(w.intro)
        w.bullets.forEach((i) => resolveBullet(w.block, i))
      }
      if (w?.kind === 'table') expect(WEEK1_BLOCK_BY_ID[w.block].table?.rows.length).toBeGreaterThan(2)
    }
  })

  it('each section first works the method on AeroLink, then says how the team applies it to its own enterprise', () => {
    for (const s of LEARN_SECTIONS) {
      expect(s.worked || s.body.some((b) => /AeroLink/.test(bodyText(b))), `${s.id} has an AeroLink example`).toBeTruthy()
      expect(s.apply?.text, s.id).toMatch(/your (team|enterprise|own)/i)
      expect(s.apply?.text, s.id).toMatch(/Team enterprise view|L7 turns/)
    }
  })

  it('each section stays within its word budget, and the lesson is a realistic size', () => {
    let total = 0
    for (const s of LEARN_SECTIONS) {
      const n = sectionWords(s)
      expect(n, `${s.id}: ${n} words > ${s.maxWords}`).toBeLessThanOrEqual(s.maxWords)
      total += n
    }
    expect(total).toBeGreaterThan(2500)
    expect(total).toBeLessThan(5000)
  })

  it('section minutes are not below an independent floor: 180 wpm + 1 min per figure + 1 for the check + 2 for a worked example', () => {
    for (const s of LEARN_SECTIONS) {
      const floor = sectionWords(s) / 180 + s.figures.length + 1 + (s.worked ? 2 : 0)
      expect(s.minutes, `${s.id}: ${s.minutes} min < floor ${floor.toFixed(1)}`).toBeGreaterThanOrEqual(floor)
    }
  })

  it('every section has a figure with alt text and a text equivalent, and exactly one check with feedback on every option', () => {
    for (const s of LEARN_SECTIONS) {
      expect(s.figures.length, s.id).toBeGreaterThan(0)
      for (const f of s.figures) {
        expect(f.alt.length, `${s.id}/${f.id}`).toBeGreaterThan(40)
        expect(f.textEquivalent.length, `${s.id}/${f.id}`).toBeGreaterThan(40)
      }
      expect(s.check.options.filter((o) => o.correct)).toHaveLength(1)
      for (const o of s.check.options) expect(o.feedback.length, `${s.check.id}/${o.id}`).toBeGreaterThan(20)
      expect(objectiveIds).toContain(s.check.objective)
    }
  })

  it('every citation is in the verified register AND in the Week 1 register (readings and extension, page ranges included)', () => {
    const all: [string, Citation][] = []
    for (const s of LEARN_SECTIONS) {
      expect(s.cite.length > 0 || !!s.convention, `${s.id} cites a source or is labeled a course convention`).toBe(true)
      for (const c of [...s.cite, ...s.readMore]) all.push([s.id, c])
      if (s.check.cite) all.push([s.check.id, s.check.cite])
      for (const t of s.keyTerms.items) if (t.source !== 'course') all.push([`${s.id} ${t.term}`, t.source])
      for (const b of s.body) if ('text' in b) for (const c of [...(b.cite ?? []), ...(b.quote ? [b.quote.cite] : [])]) all.push([s.id, c])
    }
    for (const q of WEEK1_QUIZ) {
      // every item names its source: a register citation, or the course convention it tests (rebuild review F09)
      expect(!!q.cite || !!q.courseSource, `${q.id} names a source`).toBe(true)
      if (q.cite) all.push([q.id, q.cite])
    }
    for (const b of week01.blocks) for (const c of [...b.citations, ...(b.quote ? [b.quote.cite] : [])]) all.push([b.id, c])
    for (const m of week01.instructorNotes.misconceptions) if (m.cite) all.push(['misconception', m.cite])
    for (const r of week01.references) all.push(['references', r])
    for (const [where, c] of all) {
      getReading(c.reading)
      expect(inWeekRegister(c), `${where}: ${c.reading} ${c.pages ?? ''} is outside the Week 1 register`).toBe(true)
    }
  })

  it('the SysML v2 seeds cite only Phase II slides (not the instructor-only specification), inside their verified ranges, labeled as Phase II readings (F07, F08)', () => {
    const seeds = MODEL_INPUTS.rows.flatMap((r) => r.seeds)
    for (const s of seeds) {
      if (!s.cite) continue
      expect(['R70', 'R71', 'R74', 'R76', 'R77'], s.element).toContain(s.cite.reading)
      expect(getReading(s.cite.reading).level).toBe('E')
      expect(citationInRange(s.cite), `${s.element} ${s.cite.reading} ${s.cite.pages}`).toBe(true)
    }
    expect(MODEL_INPUTS.phaseNote.text).toMatch(/Phase II reading/)
    const elements = seeds.map((s) => s.element).join(' ')
    for (const e of ['part def', 'actor', 'stakeholder', 'concern', 'requirement', 'doc', 'item def', 'port def']) expect(elements, e).toContain(e)
    // sign-off M3 and Mo1: the mission and goals (MGO) and the relationships (REL) are model inputs too
    expect(MODEL_INPUTS.rows.map((r) => r.id)).toEqual(['soi', 'mgo', 'inside', 'context', 'crosses', 'stakeholders', 'relationships', 'concerns', 'needs'])
    expect(MODEL_INPUTS.rows.find((r) => r.id === 'inside')!.item).toMatch(/Inside the boundary of the system of interest \(PRT\)/)
    expect(JSON.stringify(MODEL_INPUTS)).not.toMatch(/R8\d|leverage|loop/i)
  })

  it('F05: the system definition is attributed with SEBoK’s own caveat (an expanded version of the standard’s wording)', () => {
    const l2 = LEARN_SECTIONS[1]
    const prose = sectionProse(l2).join(' ')
    expect(prose).toContain('expanded version of the standard’s')
    expect(l2.keyTerms.items.find((t) => t.term === 'System')!.def).toContain('expanded version')
    const q = l2.body.find((b) => 'quote' in b && b.quote)!
    expect('quote' in q && q.quote!.cite.note).toMatch(/expanded wording/)
    expect(JSON.stringify(LEARN_SECTIONS)).not.toContain('as given in SEBoK’s glossary')
  })
})

describe('Week 1 checks and quiz: answerable, no cues, no overlap', () => {
  const items = [
    ...LEARN_SECTIONS.map((s) => ({ id: s.check.id, prompt: s.check.prompt, options: s.check.options.map((o) => ({ text: o.text, correct: o.correct })) })),
    ...WEEK1_QUIZ.map((q) => ({ id: q.id, prompt: q.prompt, options: q.options.map((o) => ({ text: o.text, correct: o.correct })) })),
  ]

  it('F10: no key is the longest or the shortest option (ties included) in any Learn section check', () => {
    for (const it of items.filter((x) => !x.id.startsWith('w1q-'))) {
      const k = keyOf(it.options).text.length
      const others = it.options.filter((o) => !o.correct).map((o) => o.text.length)
      expect(k, `${it.id}: key is the longest`).toBeLessThan(Math.max(...others))
      expect(k, `${it.id}: key is the shortest`).toBeGreaterThan(Math.min(...others))
    }
  })

  it('sign-off Mo2: the quiz key’s length rank varies with no usable pattern (each rank 1–4 two or three times; no ties with the key)', () => {
    const ranks = WEEK1_QUIZ.map((q) => {
      const k = keyOf(q.options).text.length
      const others = q.options.filter((o) => !o.correct).map((o) => o.text.length)
      expect(others, `${q.id}: a distractor has the key’s length, so its rank is undefined`).not.toContain(k)
      return 1 + others.filter((x) => x > k).length
    })
    const count = [1, 2, 3, 4].map((r) => ranks.filter((x) => x === r).length)
    for (const [i, n] of count.entries()) {
      expect(n, `rank ${i + 1} (1 = longest) occurs ${n} times: ${ranks.join(', ')}`).toBeGreaterThanOrEqual(2)
      expect(n, `rank ${i + 1} occurs ${n} times, so “pick that rank” scores ${n * 10} %`).toBeLessThanOrEqual(3)
    }
    // no run: the same rank never keys three items in a row
    for (let i = 2; i < ranks.length; i++) expect(ranks[i] === ranks[i - 1] && ranks[i] === ranks[i - 2], `ranks ${ranks.join(', ')}`).toBe(false)
  })

  it('F10: quiz keys are spread across a–d (no letter more than three times, every letter at least twice)', () => {
    const count: Record<string, number> = {}
    for (const q of WEEK1_QUIZ) count[keyOf(q.options).id] = (count[keyOf(q.options).id] ?? 0) + 1
    expect(Object.keys(count).sort()).toEqual(['a', 'b', 'c', 'd'])
    for (const n of Object.values(count)) {
      expect(n).toBeGreaterThanOrEqual(2)
      expect(n).toBeLessThanOrEqual(3)
    }
  })

  it('section checks, as displayed, put the key in at least three different positions', () => {
    const positions = LEARN_SECTIONS.map((s, i) => {
      const k = s.check.options.findIndex((o) => o.correct)
      const rot = displayed(i, s.check.options.length)
      return s.check.options.map((_, j) => rot(j)).indexOf(k)
    })
    expect(new Set(positions).size).toBeGreaterThanOrEqual(3)
  })

  it('F11: no check shares a run of 8 words with any quiz prompt or option, and none tests the same case', () => {
    const quizText = WEEK1_QUIZ.flatMap((q) => [q.prompt, ...q.options.map((o) => o.text)])
    for (const s of LEARN_SECTIONS) for (const t of [s.check.prompt, ...s.check.options.map((o) => o.text)]) for (const q of quizText) expect(sharesRun(t, q), `${s.check.id} ↔ “${q.slice(0, 50)}”`).toBe(false)
    // distinct cases: the check about enterprise vs organization has no quiz twin, nor the weather/stakeholder check
    expect(WEEK1_QUIZ.some((q) => /organization/.test(q.prompt) && /enterprise/.test(q.prompt))).toBe(false)
    expect(WEEK1_QUIZ.some((q) => /weather/i.test(q.prompt + q.options.map((o) => o.text).join(' ')))).toBe(false)
  })

  it('no keyed check option is copied from its own section (8 consecutive words): the student has to apply the idea', () => {
    for (const s of LEARN_SECTIONS) {
      const prose = [...sectionProse(s), ...s.keyTerms.items.map((t) => t.def), ...s.figures.flatMap((f) => [f.alt, f.textEquivalent])].join(' ')
      expect(sharesRun(keyOf(s.check.options).text, prose), s.check.id).toBe(false)
    }
  })

  it('sign-off Mo2: every quiz item is taught in the lecture: its slide and lesson section exist, its deciding idea is in that lesson section, and any “Session N, slide M” it quotes is that slide', () => {
    // the deciding phrase of each item, as the detailed lesson states it (the retired Learn sections L1–L7 are not used)
    const DECIDING: Record<string, string> = {
      'w1q-1': 'owned identifier prefixes',
      'w1q-2': 'small enough to analyze',
      'w1q-3': 'life cycle is under consideration',
      'w1q-4': 'depends on but does not control',
      'w1q-5': 'A suitable enterprise, by course convention',
      'w1q-6': 'It cannot be assumed that the customer is the only one',
      'w1q-7': 'a thorough source for stakeholder identification',
      'w1q-8': 'supporters, skeptics and rivals',
      'w1q-9': 'providing rationale often reveals the real need',
      'w1q-10': 'The stakeholders need the system to',
    }
    expect(Object.keys(DECIDING).sort()).toEqual(WEEK1_QUIZ.map((q) => q.id).sort())
    for (const q of WEEK1_QUIZ) {
      expect(q.lecture, `${q.id} names where it is taught`).toBeDefined()
      const t = q.lecture!
      const lecture = getLecture(t.week, t.session)!
      expect(lecture, `${q.id}: week ${t.week} session ${t.session}`).toBeDefined()
      const slides = allSlides(lecture)
      const idx = slides.findIndex((s) => s.id === t.slide)
      expect(idx, `${q.id}: slide ${t.slide}`).toBeGreaterThanOrEqual(0)
      const sec = lecture.studentLesson.find((s) => s.id === t.section)
      expect(sec, `${q.id}: lesson section ${t.section}`).toBeDefined()
      const text = sec!.blocks.flatMap((b) => (b.kind === 'para' || b.kind === 'heading' ? [b.text] : b.kind === 'figure' || b.kind === 'slide-ref' ? [] : blockText(b))).join(' ')
      expect(text, `${q.id}: “${DECIDING[q.id]}” in ${t.section}`).toContain(DECIDING[q.id])
      for (const m of [q.courseSource ?? '', ...q.options.map((o) => o.explanation)].join(' ').matchAll(/Session (\d), slide (\d+)/g))
        if (Number(m[1]) === t.session) expect(Number(m[2]), `${q.id} quotes ${m[0]}; ${t.slide} is slide ${idx + 1}`).toBe(idx + 1)
    }
    // no item or source still points at the retired Learn sections
    expect(JSON.stringify(WEEK1_QUIZ)).not.toMatch(/\bL[1-7]\b|Learn text/)
  })

  it('sign-off M1 / A21: w1q-10’s key passes the tool’s gates with no warning; each distractor fails for its stated, real defect', () => {
    const q = WEEK1_QUIZ.find((x) => x.id === 'w1q-10')!
    const ctx = { stakeholders: [{ id: 'STK-001', name: 'Night-shift nurses' }], soiNames: ['ward medication service'], systemNames: ['the ward’s medication service'] }
    const check = (text: string) => assessNeed({ name: 'q', text, conditions: '', rationale: 'nurses told us why in an interview', sources: ['STK-001'] }, ctx)
    const key = check(keyOf(q.options).text)
    expect(key.gates.filter((g) => !g.ok).map((g) => g.message)).toEqual([])
    expect(key.warnings.map((w) => w.message)).toEqual([])
    const by = (id: string) => check(q.options.find((o) => o.id === id)!.text)
    expect(by('a').warnings.map((w) => w.id)).toContain('solution')
    expect(by('b').gates.some((g) => !g.ok)).toBe(true)
    expect(by('d').warnings.map((w) => w.id)).toContain('vague')
  })

  it('the quiz covers every objective, spans Bloom levels, and every option is explained', () => {
    expect(WEEK1_QUIZ).toHaveLength(10)
    for (const o of objectiveIds) expect(WEEK1_QUIZ.some((q) => q.objective === o), o).toBe(true)
    expect(new Set(WEEK1_QUIZ.map((q) => q.bloom)).size).toBeGreaterThanOrEqual(3)
    for (const q of WEEK1_QUIZ) for (const o of q.options) expect(o.explanation.length, `${q.id}/${o.id}`).toBeGreaterThan(20)
    expect(new Set(WEEK1_QUIZ.map((q) => q.id)).size).toBe(10)
  })

  it('the checks agree with the tools: C5’s key passes the concern screen and its distractors fail it; C7’s draft fails the requirement (“shall”) gate', () => {
    const c5 = LEARN_SECTIONS[4].check
    for (const o of c5.options) expect(isSpecificConcern(o.text.split(': ')[1]), `${o.id}: ${o.text}`).toBe(o.correct)
    const draft = LEARN_SECTIONS[6].check.prompt.match(/“([^”]+)”/)![1]
    const a = assessRef(draft, ['STK-009'])
    // A21: rejected for its real defect, requirement wording (the “shall” gate), not for its sentence pattern
    expect(a.gates.find((g) => g.id === 'requirement')!.ok).toBe(false)
  })

  it('F09: the convention items are labeled as such; the “shall” misconception cites p.555; “Concern” is a course working definition', () => {
    expect(WEEK1_QUIZ.find((q) => q.id === 'w1q-1')!.courseSource).toMatch(/^Session 1, slide 16 .*course convention/)
    expect(WEEK1_QUIZ.find((q) => q.id === 'w1q-5')!.courseSource).toMatch(/^Session 1, slide 3 .*course criteria/)
    expect(LEARN_SECTIONS[4].check.cite).toBeUndefined()
    expect(LEARN_SECTIONS[4].keyTerms.items.find((t) => t.term === 'Concern')!.source).toBe('course')
    expect(week01.instructorNotes.misconceptions.find((m) => /requirement written informally/.test(m.claim))!.cite!.pages).toContain('555')
    expect(JSON.stringify(MODEL_INPUTS)).not.toMatch(/use case or requirement/)
  })

  it('L5 and L7 say exactly what the tool checks and what the student judges', () => {
    expect(LEARN_SECTIONS[4].apply!.text).toMatch(/catches only the most generic phrasings/)
    expect(LEARN_SECTIONS[4].apply!.text).toMatch(/cannot tell whether the detail is true/)
    const l7 = LEARN_SECTIONS[6].apply!.text
    for (const p of ['What the tool checks', 'What it only warns about', 'What you judge', 'self-check', 'never makes a need good']) expect(l7, p).toContain(p)
  })
})

describe('Week 1 worked examples agree with the checks students run', () => {
  const bullets = WEEK1_BLOCK_BY_ID['w1-worked-needs'].bullets!
  it('every reference rewrite passes the gates with no warning, and every bad draft fails a gate or raises a warning', () => {
    for (const b of bullets) {
      const draft = b.match(/Draft: “([^”]+)”/)![1]
      const after = b.match(/NEED-\d{3}: (.+?)\. Source:/)![1] + '.'
      const traces = [...new Set(b.split('Source:')[1].match(/STK-\d{3}/g)!)]
      const good = assessRef(after, traces)
      expect([...good.gates.filter((g) => !g.ok), ...good.completeness.filter((c) => !c.ok)].map((x) => x.message), after).toEqual([])
      expect(good.warnings.map((w) => w.message), after).toEqual([])
      const bad = assessRef(draft, traces)
      expect(bad.gates.some((g) => !g.ok) || bad.warnings.length > 0, draft).toBe(true)
    }
  })

  it('the register rows carry specific concerns (the concern screen accepts every one)', () => {
    for (const row of WEEK1_BLOCK_BY_ID['w1-worked-register'].table!.rows) expect(isSpecificConcern(row[6].split(': ')[1]), row[0]).toBe(true)
  })

  it('F07, F12: the worked boundary example no longer points to the explorer, and names the air-taxi service as the system of interest', () => {
    const w = WEEK1_BLOCK_BY_ID['w1-worked']
    expect(w.bullets!.join(' ')).not.toMatch(/explorer/)
    expect(w.bullets![2]).toMatch(/^SoI = the AeroLink air-taxi service/)
    expect(JSON.stringify(week01.blocks)).not.toMatch(/AeroLink service enterprise/)
    expect(JSON.stringify(LEARN_SECTIONS)).not.toMatch(/service enterprise/)
  })
})

describe('Week 1 flow text: flags, cross-links, workload, team subject', () => {
  it('every new item is flagged for independent review', () => {
    for (const s of LEARN_SECTIONS) for (const t of [s.question, s.inShort, s.teaser, s.keyTerms, s.check, s.apply!, ...s.figures, ...s.figures.map((f) => f.caption)]) expect(t.review, s.id).toBe(PENDING)
    for (const t of [OPENER, OPENER.intro, OPENER.why, OPENER.weekPath, SUMMARY.conceptMap, BRIDGE, MEET_AEROLINK, ORIENTATION, PRACTICE_BAR, TEAM_RECORD, MODEL_INPUTS, GRAD_REVIEW, WORKLOAD_NOTE]) expect(t.review).toBe(PENDING)
    for (const q of WEEK1_QUIZ) expect(q.review, q.id).toBe(PENDING)
    for (const b of week01.blocks.filter((x) => !['w1-se', 'w1-soi'].includes(x.id))) expect(b.review, b.id).toBe(PENDING)
    for (const x of [week01.lab, week01.assignment, week01.instructorNotes, ...week01.workload]) expect(x.review).toBe(PENDING)
    for (const m of week1Missions.missions) for (const st of m.steps) expect(st.brief?.review, `${m.id}/${st.id}`).toBe(PENDING)
  })

  it('cross-links resolve: mission prerequisites, block → section map, concept map, mission readMore', () => {
    expect(Object.keys(PRACTICE_PREREQ).sort()).toEqual(week1Missions.missions.map((m) => m.id).sort())
    for (const v of Object.values(PRACTICE_PREREQ)) for (const l of v.learn) expect(LEARN_SECTIONS.some((s) => s.id === l)).toBe(true)
    for (const [b, s] of Object.entries(BLOCK_TO_SECTION)) {
      expect(WEEK1_BLOCK_BY_ID[b], b).toBeDefined()
      expect(LEARN_SECTIONS.some((x) => x.id === s)).toBe(true)
    }
    for (const c of CONCEPT_CHAIN) expect(LEARN_SECTIONS.some((s) => s.id === c.section)).toBe(true)
    for (const m of week1Missions.missions) for (const st of m.steps) if (!['w1-outcomes', 'w1-deliverable'].includes(st.readMore)) expect(BLOCK_TO_SECTION[st.readMore], `${m.id}/${st.id} → ${st.readMore}`).toBeDefined()
  })

  it('F10 (lecture-first path, 2026-10-19): every counted row matches its computation, the optional practice is shown but not counted, and the total is stated honestly against the 8 h budget', () => {
    const R = WORKLOAD_ROWS
    const W = PATH_WORKLOAD
    const total = workloadTotal(week01.workload)
    expect(total).toBe(W.total)
    expect(Math.abs(total - WORKLOAD.total)).toBeLessThan(0.001)
    expect(WORKLOAD_BUDGET).toBe(WORKLOAD_TARGET[1])
    // the counted rows are exactly the new path: class, lesson, readings, candidate enterprise, Team Record, quiz,
    // graduate review, time log; the only optional row is the AeroLink practice
    expect(week01.workload.filter((w) => !w.optional).length).toBe(8)
    expect(week01.workload.filter((w) => w.optional).map((w) => w.activity)).toEqual([R.practice.activity])
    // row matching: each stated row equals the value computed from the path
    expect(R.class.hours).toBe(W.classHours)
    expect(Math.abs(R.lesson.hours - W.lessonWords / LESSON_WPM / 60), `lesson: ${W.lessonWords} words`).toBeLessThanOrEqual(0.1)
    // the stated word count may lag the lecture source by a few minutes of reading (Session 2 is still being authored)
    const stated = Number(R.lesson.activity.match(/about ([\d,]+) words/)![1].replace(/,/g, ''))
    expect(Math.abs(stated - W.lessonWords), `stated ${stated}, counted ${W.lessonWords}`).toBeLessThanOrEqual(600)
    expect(R.readings.hours).toBe(W.readingHours)
    expect(W.readingPages).toBe(9)
    expect(R.team.hours).toBe(W.teamHours)
    expect(R.quiz.hours).toBe(W.quizHours)
    expect(R.practice.hours).toBe(W.practiceHours)
    expect(R.candidate.hours).toBeGreaterThanOrEqual(0.3)
    for (const w of week01.workload.filter((x) => !/In-class|Graduate/.test(x.activity))) expect(w.activity, w.activity).toMatch(/per student/)
    // every mission draws on exactly one row: missions 1–4 on the optional row, 5 on the Team Record, 6 on the quiz
    const counted = week1Missions.missions.reduce((a, m) => a + m.minutes, 0)
    expect(counted).toBe(WORKLOAD.rehearsalMinutes + WORKLOAD.teamMinutes + WORKLOAD.quizMinutes)
    // honest: the summary states the total against the budget, and the optional practice as not counted
    expect(total).toBeLessThanOrEqual(WORKLOAD_TARGET[1])
    expect(WORKLOAD_SUMMARY.text).toContain(`Total ${total.toFixed(1)} h against the ${W.budget} h budget, ${(W.budget - total).toFixed(1)} h under`)
    expect(WORKLOAD_SUMMARY.text).toMatch(/optional and not counted/)
    expect(WORKLOAD_NOTE.text).toContain(`${total.toFixed(1)} h against the ${WORKLOAD_BUDGET} h budget`)
    expect(WORKLOAD_NOTE.text).toMatch(/^Hours per student/)
    expect(TRIM).toEqual([])
    expect(TRIMMED_TOTAL).toBe(total)
    expect(WORKLOAD.learnMinutes).toBe(LEARN_SECTIONS.reduce((a, s) => a + s.minutes, 0) + OVERVIEW_MINUTES + 3)
  })

  it('F01–F03: AeroLink is never the team subject: lab, assignment, rubric scope and the own mission are about the team’s enterprise', () => {
    const team = week1Missions.missions.find((m) => m.kind === 'own')!
    const texts = [
      ...week01.lab.steps.flatMap((s) => [s.title, s.detail]), ...week01.lab.inputs, week01.lab.continuity,
      ...week01.assignment.instructions, ...week01.assignment.template.map((t) => t.guidance), week01.assignment.rubricScope, week01.assignment.title,
      ...team.steps.flatMap((s) => [s.instruction, s.brief!.task, s.brief!.input]), WEEK1_BLOCK_BY_ID['w1-lab'].paragraphs.join(' '),
    ]
    for (const t of texts) expect(t, t).not.toMatch(/for AeroLink|AeroLink dynamics|explorer|causal loop|leverage|memo|Data Sheet|case brief/i)
    expect(team.goal).toMatch(/not AeroLink/)
    expect(WEEK1_BLOCK_BY_ID['w1-lab'].paragraphs[0]).toMatch(/not AeroLink/)
    expect(TEAM_RECORD.summary.text).toMatch(/never AeroLink/)
  })

  it('the Team Record names every required part with its evidence, minimum, judging row, format and route; the template carries them all', () => {
    expect(TEAM_RECORD.parts.map((p) => p.id)).toEqual(['charter', 'proposal', 'context', 'register', 'needs', 'ai'])
    expect(TEAM_RECORD.parts.find((p) => p.id === 'register')!.minimum).toMatch(/At least 8 stakeholders/)
    expect(TEAM_RECORD.parts.find((p) => p.id === 'needs')!.minimum).toMatch(/At least 8 needs that count/)
    expect(TEAM_RECORD.parts.find((p) => p.id === 'proposal')!.minimum).toMatch(/submitted for approval/)
    expect(TEAM_RECORD.summary.text).toMatch(/six parts, five engineering outputs plus the AI usage statement/)
    expect(OPENER.assessedTeam.text).toMatch(/plus the AI usage statement/)
    expect(OPENER.weekPath.caption.text).toMatch(/plus the AI usage statement/)
    expect(TEAM_RECORD.rubricNote.text).toMatch(/AROU entries and CAP → NEED links are not yet in scope/)
    expect(TEAM_RECORD.where.text).toMatch(/learning management system/)
    expect(TEAM_RECORD.format.text).toMatch(/\.md/)
    expect(TEAM_RECORD.format.text).toMatch(/\.json/)
    expect(TEAM_RECORD.rubricRows.map((r) => r.join('.'))).toEqual(['RB-1.1.1', 'RB-1.1.2', 'RB-1.1.3', 'RB-2.2.2', 'RB-2.2.5'])
    const t = teamRecordTemplate()
    for (const h of ['## 1. Team charter', '## 2. Enterprise proposal', '## 3. Context', '## 4. Stakeholder register', '## 5. Initial stakeholder needs', '## 6. AI usage statement']) expect(t).toContain(h)
    expect(t).toContain('| STK-008 |')
    expect(t).toContain('| NEED-008 |')
  })

  it('F12, F17: AeroLink is introduced in the Overview text before the question refers to it; no “memo section 5”', () => {
    expect(MEET_AEROLINK.readFirst.text).toMatch(/introduced first/)
    expect(JSON.stringify(LEARN_SECTIONS)).not.toMatch(/memo section 5/)
    expect(OPENER.intro.text).not.toMatch(/by the end of the week/i)
    expect(OPENER.how.text).toMatch(/a worked example introduced below/)
    // F06: the Overview does not list AeroLink’s external organizations right above the prediction
    expect(MEET_AEROLINK.conops.map((c) => c.text).join(' ')).not.toMatch(/air navigation service provider|emergency services/)
  })
})
