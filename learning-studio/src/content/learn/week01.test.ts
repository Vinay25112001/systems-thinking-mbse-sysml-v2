// Content tests for the book-style Week 1 flow (WEEK1_LEARNING_DESIGN §7.4).
import { describe, expect, it } from 'vitest'
import { WEEKS } from '../course'
import { WEEK1_QUIZ } from '../quizWeek1'
import { ALL_LOOPS, LOOP_NODES } from '../causalLoops'
import { citationInRange, getReading } from '../readings'
import { WORKLOAD_TARGET } from '../schema'
import week01 from '../weeks/week01'
import week1Missions from '../missions/week01'
import { DEFAULT_PARAMS, chargingCapacityOf, fleetCapacityOf, simulate } from '../../sim/aerolink'
import { WEEK1_BLOCK_BY_ID, bodyText, countWords, resolveBullet, resolveRef, sectionProse, sectionWords } from './resolve'
import { PENDING, type LearnSection } from './types'
import {
  BLOCK_TO_SECTION, BRIDGE, C5_LOOP, C6_CHARGE_CAP, C6_CROSSOVER, C6_FIRST_CHARGING_LIMITED, C6_WRONG_50, CONCEPT_CHAIN, CROSSOVER_6, F4_ALONE,
  F4_DELIVERED, F4_FLEET, F4_PER_AIRCRAFT_DAY, LEARN_SECTIONS, OPENER, PLATEAU, PRACTICE_PREREQ, SERVED_FROZEN, SUMMARY, WORKLOAD,
  WORKLOAD_NOTE, loopChain, negativesIn,
} from './week01'
import { WELCOME } from './welcome'

const W1 = WEEKS[0]
const objectiveIds = W1.objectives.map((o) => o.id)

describe('Week 1 Learn sections', () => {
  it('has seven sections in prerequisite order, L1–L7', () => {
    expect(LEARN_SECTIONS.map((s) => s.code)).toEqual(['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'])
    expect(new Set(LEARN_SECTIONS.map((s) => s.id)).size).toBe(7)
  })

  it('every reference resolves to reviewed text (no reviewed sentence is retyped)', () => {
    for (const s of LEARN_SECTIONS) {
      for (const b of s.body) expect(bodyText(b).length, s.id).toBeGreaterThan(20)
      for (const id of s.goDeeper) expect(WEEK1_BLOCK_BY_ID[id], `${s.id} goDeeper ${id}`).toBeDefined()
      const w = s.worked
      if (w?.kind === 'bullets') {
        resolveRef(w.intro)
        w.bullets.forEach((i) => resolveBullet(w.block, i))
      }
      if (w?.kind === 'faded') {
        resolveRef(w.setup)
        w.steps.forEach((st) => st.body.forEach(resolveRef))
      }
      if (w?.kind === 'loop') expect(ALL_LOOPS.some((l) => l.id === w.loop)).toBe(true)
    }
  })

  it('each section stays within its word budget and the lesson within 5,000 words', () => {
    let total = 0
    for (const s of LEARN_SECTIONS) {
      const n = sectionWords(s)
      expect(n, `${s.id}: ${n} words > ${s.maxWords}`).toBeLessThanOrEqual(s.maxWords)
      total += n
    }
    const extra = [...SUMMARY.recap.map((r) => r.text), ...WELCOME.flatMap((b) => b.paras.map((p) => p.text)), OPENER.priorKnowledge.text].reduce((a, t) => a + countWords(t), 0)
    expect(total + extra).toBeLessThanOrEqual(5000)
    // the workload line states ≈ 1 h of online instruction: at ≈ 180 words a minute the prose alone is well under it
    expect(total / 180).toBeLessThan(40)
    expect(total).toBeGreaterThan(2000)
    expect(total).toBeLessThan(3500)
  })

  it('the time plan is realistic: section minutes plus opener (5) and summary (3) are ≈ 1 h, the online line', () => {
    const minutes = LEARN_SECTIONS.reduce((a, s) => a + s.minutes, 0) + 5 + 3
    // the lesson row states ≈ 1.0 h as the realistic time (the reviewed budget, 0.3 h, is kept; see cautions)
    expect(Math.abs(minutes - 60)).toBeLessThanOrEqual(5)
    expect(WORKLOAD.learnMinutes).toBe(minutes)
  })

  it('section minutes are not below an independent floor: reading at 180 wpm + 1 min per figure + 1 min for the check + 2 min for a worked example (review W1F-F11)', () => {
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

  it('every citation is in the register and inside its verified range', () => {
    for (const s of LEARN_SECTIONS) {
      expect(s.cite.length, s.id).toBeGreaterThan(0)
      for (const c of [...s.cite, s.check.cite, ...s.readMore]) {
        getReading(c.reading)
        expect(citationInRange(c), `${s.id} ${c.reading} ${c.pages}`).toBe(true)
      }
    }
    for (const b of WELCOME) for (const p of b.paras) if (p.cite) expect(citationInRange(p.cite)).toBe(true)
  })

  it('every section has a "Read more" to exact pages inside a verified Week 1 reading (core or extension)', () => {
    const week = [...W1.readings, ...W1.extension, ...week01.references].map((r) => r.reading)
    for (const s of LEARN_SECTIONS) {
      expect(s.readMore.length, s.id).toBeGreaterThan(0)
      for (const c of s.readMore) {
        expect(c.pages, `${s.id} ${c.reading}`).toBeTruthy()
        expect(week, `${s.id} ${c.reading}`).toContain(c.reading)
      }
    }
  })

  it('aligns: every objective B1.1–B1.4 is taught by a section and assessed by a check or quiz item (design §1)', () => {
    for (const o of objectiveIds) {
      expect(LEARN_SECTIONS.some((s) => s.objectives.includes(o)), `${o} taught`).toBe(true)
      expect(WEEK1_QUIZ.some((q) => q.objective === o) || LEARN_SECTIONS.some((s) => s.check.objective === o), `${o} assessed`).toBe(true)
    }
  })

  it('the reviewed workload rows are unchanged (8.0 h); only the lesson row is relabelled, and the realistic total is stated', () => {
    const total = week01.workload.reduce((a, w) => a + w.hours, 0)
    expect(Math.abs(total - WORKLOAD_TARGET[1])).toBeLessThan(0.001)
    expect(week01.workload.map((w) => w.hours)).toEqual([2.5, 0.3, 1, 0.2, 2.5, 1.2, 0.3])
    expect(week01.workload.find((w) => w.activity.startsWith('Readings R01, R02, R04, R50'))!.hours).toBe(1)
    const lesson = week01.workload.find((w) => w.activity.startsWith('Online direct instruction'))!
    expect(lesson.activity).toContain('≈ 1.0 h')
    // review W1F-F11: the realistic total is itemised (Learn + missions m1–m2 on top of the memo row) and stated honestly
    expect(WORKLOAD.onTopMinutes).toBe(week1Missions.missions.filter((m) => ['w1-m1-try', 'w1-m2-worked'].includes(m.id)).reduce((a, m) => a + m.minutes, 0))
    expect(WORKLOAD.onTopMinutes).toBe(25)
    expect(WORKLOAD.inTeamRowMinutes).toBe(35)
    expect(WORKLOAD.realistic).toBe(Math.round((total - lesson.hours + WORKLOAD.learnMinutes / 60 + WORKLOAD.onTopMinutes / 60) * 10) / 10)
    expect(WORKLOAD.realistic).toBe(9.2)
    const caution = week01.instructorNotes.cautions.find((c) => c.startsWith('Workload'))!
    expect(caution).toContain(`≈ ${WORKLOAD.realistic} h`)
    expect(caution).toContain(`${WORKLOAD.learnMinutes} min`)
    expect(caution).not.toContain('8.7 h')
    expect(lesson.activity).toContain(`≈ ${WORKLOAD.realistic} h`)
    expect(WORKLOAD_NOTE.text).toContain(`about ${WORKLOAD.realistic} h`)
  })

  it('every new item is flagged for independent review', () => {
    for (const s of LEARN_SECTIONS) {
      for (const t of [s.question, s.inShort, s.teaser, s.keyTerms, s.check, ...s.figures, ...s.figures.map((f) => f.caption)]) expect(t.review, s.id).toBe(PENDING)
      for (const b of s.body) if (!('ref' in b)) expect(b.review).toBe(PENDING)
    }
    for (const s of LEARN_SECTIONS) for (const b of s.afterWorked ?? []) if (!('ref' in b)) expect(b.review).toBe(PENDING)
    for (const b of WELCOME) expect(b.review).toBe(PENDING)
    expect(WORKLOAD_NOTE.review).toBe(PENDING)
    expect(OPENER.review).toBe(PENDING)
    expect(BRIDGE.review).toBe(PENDING)
    expect(SUMMARY.conceptMap.review).toBe(PENDING)
    for (const r of SUMMARY.recap) expect(r.review).toBe(PENDING)
    expect(week01.workload.filter((x) => x.review === PENDING).map((x) => x.activity.slice(0, 25))).toEqual(['Online direct instruction'])
  })

  it('cross-links resolve: mission prerequisites, block → section map, concept map', () => {
    const ids = new Set(LEARN_SECTIONS.map((s) => s.id))
    for (const m of week1Missions.missions) expect(PRACTICE_PREREQ[m.id], m.id).toBeDefined()
    for (const p of Object.values(PRACTICE_PREREQ)) for (const l of p.learn) expect(ids.has(l)).toBe(true)
    for (const [b, s] of Object.entries(BLOCK_TO_SECTION)) {
      expect(WEEK1_BLOCK_BY_ID[b], b).toBeDefined()
      expect(ids.has(s)).toBe(true)
    }
    for (const c of CONCEPT_CHAIN) expect(ids.has(c.section)).toBe(true)
    // review W1F-F24: "elements interact" is taught in L1
    expect(CONCEPT_CHAIN.find((c) => c.label === 'Elements interact')!.section).toBe('l1')
  })
})

// ------------------------------------------------------------------------------------------- review W1F-F01: checks need understanding
/** Everything a student can see in a section above or beside its check: prose, callouts, worked example, figure
 *  captions, alt text and text equivalents (both reveal states), and key terms. */
function sectionText(s: LearnSection): string {
  return [
    ...sectionProse(s),
    ...s.figures.flatMap((f) => [f.alt, f.textEquivalent, ...(f.preReveal ? [f.preReveal.alt, f.preReveal.textEquivalent] : [])]),
    ...s.keyTerms.items.flatMap((t) => [t.term, t.def]),
  ].join(' ')
}
const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean)
/** Length of the longest run of consecutive words that `a` shares with `b`. */
function longestSharedRun(a: string, b: string): number {
  const x = norm(a)
  const y = norm(b)
  for (let n = 1; n <= x.length; n++) {
    const grams = new Set<string>()
    for (let i = 0; i + n <= y.length; i++) grams.add(y.slice(i, i + n).join(' '))
    let found = false
    for (let i = 0; i + n <= x.length; i++) if (grams.has(x.slice(i, i + n).join(' '))) found = true
    if (!found) return n - 1
  }
  return x.length
}

describe('section checks cannot be answered by matching text (review W1F-F01)', () => {
  it('no keyed option shares a run of 8 or more words with its own section text', () => {
    for (const s of LEARN_SECTIONS) {
      const key = s.check.options.find((o) => o.correct)!.text
      const run = longestSharedRun(key, sectionText(s))
      expect(run, `${s.check.id}: keyed option shares ${run} consecutive words with the section`).toBeLessThan(8)
    }
  })

  it('the overlap test can fail: the old C1 key (copied from w1-emergence ¶0) is caught', () => {
    const oldKey = 'It is defined both by the interactions among its elements inside the boundary and by its interactions with systems in its environment.'
    expect(longestSharedRun(oldKey, sectionText(LEARN_SECTIONS[0]))).toBeGreaterThanOrEqual(8)
  })

  it('no length cue: the keyed option is within 30 % of the mean distractor length, and not the longest by more than 15 %', () => {
    for (const s of LEARN_SECTIONS) {
      const key = s.check.options.find((o) => o.correct)!.text.length
      const others = s.check.options.filter((o) => !o.correct).map((o) => o.text.length)
      const mean = others.reduce((a, b) => a + b, 0) / others.length
      expect(key / mean, `${s.check.id}: keyed ${key} chars vs mean ${mean.toFixed(0)}`).toBeGreaterThanOrEqual(0.7)
      expect(key / mean, `${s.check.id}: keyed ${key} chars vs mean ${mean.toFixed(0)}`).toBeLessThanOrEqual(1.3)
      expect(key, `${s.check.id}: keyed option is much the longest`).toBeLessThanOrEqual(Math.max(...others) * 1.15)
    }
  })

  it('the length-cue test can fail: the old C7 options are caught', () => {
    const key = 'It emphasises holistic, concurrent work (understanding needs, exploring opportunities, requirements, synthesis, verification, validation, evolution) across the whole life cycle, from concept to disposal.'.length
    const mean = ['It reverses the order, testing first.', 'It limits SE to the design phase.', 'It is the same, but with more documentation.'].reduce((a, t) => a + t.length, 0) / 3
    expect(key / mean).toBeGreaterThan(1.3)
  })

  it('the old copy-able prompts are gone and every check presents a case', () => {
    const prompts = LEARN_SECTIONS.map((s) => s.check.prompt)
    expect(prompts.some((p) => /what makes AeroLink an open system/.test(p))).toBe(false)
    expect(prompts.some((p) => /owns average passenger waiting time/.test(p))).toBe(false)
    for (const s of LEARN_SECTIONS) expect(s.check.prompt.length, s.check.id).toBeGreaterThan(80)
  })

  it('Bloom labels are honest: L4 and its check are Understand; "View" moved out of the L3 key terms (W1F-F24)', () => {
    const l4 = LEARN_SECTIONS.find((s) => s.id === 'l4')!
    expect(l4.bloom).toBe('Understand')
    expect(l4.check.bloom).toBe('Understand')
    expect(LEARN_SECTIONS.find((s) => s.id === 'l3')!.keyTerms.items.some((t) => t.term === 'View')).toBe(false)
  })
})

describe('L5–L7 content fixes', () => {
  const l5 = LEARN_SECTIONS.find((s) => s.id === 'l5')!
  const l6 = LEARN_SECTIONS.find((s) => s.id === 'l6')!
  const l7 = LEARN_SECTIONS.find((s) => s.id === 'l7')!

  it('C5 (W1F-F02, sign-off N1): a loop the model does not contain, not named by type, keyed by the count of negative links', () => {
    expect(l5.check.prompt).toContain(C5_LOOP)
    expect(l5.check.prompt).not.toMatch(/\b[RB]\d\b|balancing|reinforcing/i)
    const negatives = (C5_LOOP.match(/\(−\)/g) ?? []).length
    // an even count, so the key is not quiz q1-4's "Balancing: one negative link"
    expect(negatives).toBe(2)
    const type = negatives % 2 ? 'Balancing' : 'Reinforcing'
    const key = l5.check.options.find((o) => o.correct)!
    expect(key.text.startsWith(type)).toBe(true)
    // no distractor gives the right classification, so the key is unambiguous
    for (const o of l5.check.options.filter((x) => !x.correct)) expect(o.text.startsWith(type)).toBe(false)
    // the loop is not in the model (no maintenance variable at all), and Figure 5 shows only R1 and B1
    expect(LOOP_NODES.some((x) => /maintenance|backlog|wear|available/i.test(x.label))).toBe(false)
    expect(ALL_LOOPS.some((l) => /maintenance|noise/i.test(l.name))).toBe(false)
    const fig = l5.figures[0]
    expect(fig.textEquivalent + fig.alt + fig.caption.text).not.toMatch(/B2|churn|noise|maintenance/i)
    expect(l5.check.solo).toBe('multistructural')
    expect(fig.textEquivalent).toContain(loopChain(ALL_LOOPS.find((l) => l.id === 'B1')!.path))
  })

  it('the counting rule is labelled a course convention, not attributed to a reading (W1F-F15)', () => {
    const rule = l5.body.find((b) => b.callout?.startsWith('The counting rule'))!
    expect(rule.callout).toContain('course convention')
    expect(bodyText(rule)).toContain('course convention')
  })

  it('L6 states that the model does not contain Growth and Underinvestment (W1F-F06), after the worked example (W1F-F27)', () => {
    const after = (l6.afterWorked ?? []).map(bodyText).join(' ')
    expect(after).toContain('It does not contain Growth and Underinvestment')
    expect(after).toContain('Limits to Growth')
    expect(l6.body.map(bodyText).join(' ')).not.toContain('Growth and Underinvestment')
  })

  it('L6 restores the mechanism (W1F-F07): demand binds first, the wait and attractiveness relations, adoption = churn', () => {
    const prose = sectionProse(l6).join(' ')
    expect(prose).toContain('demand binds')
    expect(prose).toContain('2 ÷ (1 − utilisation)')
    expect(prose).toContain('adoption equals churn')
    expect(prose).toMatch(/served trips/)
    expect(l6.question.text + l6.inShort.text).not.toMatch(/ridership/i)
  })

  it('the L6 faded step (W1F-F03): 14.4 is correct, 15 is only "close", and nothing shown before the answer gives 14.4 away', () => {
    const w = l6.worked!
    if (w.kind !== 'faded') throw new Error('L6 worked example must be faded')
    const step = w.steps.find((x) => x.kind === 'input')!
    if (step.kind !== 'input') throw new Error('no input step')
    expect(step.answer).toBeCloseTo(14.4, 10)
    expect(step.near?.value).toBe(15)
    const fig = l6.figures[0]
    expect(fig.preReveal).toBeDefined()
    for (const t of [fig.preReveal!.alt, fig.preReveal!.textEquivalent, fig.caption.text]) {
      expect(t).not.toContain('14.4')
      expect(t).not.toMatch(/15th|cross at/)
    }
    const before = w.steps.slice(0, w.steps.indexOf(step)).flatMap((x) => x.body.map(resolveRef)).join(' ') + resolveRef(w.setup)
    expect(before).not.toMatch(/14\.4|15 aircraft|15th/)
  })

  it('L7 gives SEBoK’s enterprise definition (W1F-F05) and bridges the two uses of "enterprise" (W1F-F09)', () => {
    const prose = sectionProse(l7).join(' ')
    expect(prose).toContain(resolveRef({ block: 'w1-lifecycle', para: 3, sentences: [1, 1] }))
    expect(prose).toContain('What, then, is an enterprise?')
    expect(prose).toContain('Note the two uses of the word')
    expect(LEARN_SECTIONS[0].figures[0].caption.text).toContain('SEBoK’s enterprise is wider')
  })

  it('Figure 7b and its key use MITRE’s third category as written on R50 p.48 (W1F-F08)', () => {
    const rings = l7.figures.find((f) => f.id === 'control-rings')!
    expect(rings.alt + rings.textEquivalent).toContain('neither control nor influence')
    expect(rings.alt + rings.textEquivalent).not.toContain('airspace authority')
    const key = l7.keyTerms.items.find((t) => t.term.startsWith('Control'))!
    expect(key.def).toContain('neither control nor influence')
    expect(key.def).toContain('environment')
  })

  it('Figure 7a limits mediation to development and evolution (W1F-F21); the bridge no longer promises a Week 2 re-ask (W1F-F10)', () => {
    const lc = l7.figures.find((f) => f.id === 'life-cycle-agents')!
    expect(lc.alt).toContain('mediate change')
    expect(lc.alt).not.toContain('change proposals and counter-proposals')
    expect(lc.textEquivalent).toContain('does not cover the system-definition phase')
    expect(BRIDGE.spacing.text).not.toMatch(/opener asks/)
    expect(BRIDGE.spacing.text).toContain('not yet built')
  })
})

describe('derived FICTIONAL numbers (design D5)', () => {
  it('C6: 12 chargers give 17,280 trips a month, crossover 28.8, so charging limits capacity from the 29th aircraft', () => {
    expect(C6_CHARGE_CAP).toBe(17280)
    expect(C6_CROSSOVER).toBeCloseTo(28.8, 10)
    expect(C6_FIRST_CHARGING_LIMITED).toBe(29)
    // the model agrees: with 12 chargers the 28th aircraft is still fleet-limited and the 29th is charging-limited
    const at = (fleet: number) => simulate({ ...DEFAULT_PARAMS, chargers: 12, initialFleet: fleet, expandFleet: false, months: 0 })[0]
    expect(at(28).limitingResource).toBe('fleet')
    expect(at(29).limitingResource).toBe('charging')
    expect(at(29).capacity).toBe(17280)
    const c6 = LEARN_SECTIONS.find((s) => s.id === 'l6')!.check
    expect(c6.options.find((o) => o.correct)!.text).toBe('The 29th.')
    expect(c6.options.find((o) => o.correct)!.feedback).toContain('17,280')
    expect(c6.options.find((o) => o.correct)!.feedback).toContain('28.8')
    // the distractor for the 6-charger answer is the 15th
    expect(CROSSOVER_6).toBeCloseTo(14.4, 10)
    expect(c6.options.some((o) => !o.correct && o.text === 'The 15th.')).toBe(true)
    // review W1F-F26: error-based distractors, the 28th (rounding 28.8 down) and the 30th (50 charges a day)
    expect(c6.options.some((o) => !o.correct && o.text === 'The 28th.')).toBe(true)
    expect(C6_WRONG_50).toBe(30)
    expect(c6.options.some((o) => !o.correct && o.text === 'The 30th.')).toBe(true)
  })

  it('Figure 6 (W1F-F04): served trips with the fleet held at each size never exceed capacity, and reach the plateau only from 15 aircraft', () => {
    const cap = (f: number) => Math.min(fleetCapacityOf(DEFAULT_PARAMS, f), chargingCapacityOf(DEFAULT_PARAMS, DEFAULT_PARAMS.chargers))
    expect(SERVED_FROZEN.map((p) => p.fleet)).toEqual(Array.from({ length: 31 }, (_, i) => 10 + i))
    for (const p of SERVED_FROZEN) expect(p.served, `${p.fleet} aircraft`).toBeLessThanOrEqual(cap(p.fleet))
    const at = (f: number) => Math.round(SERVED_FROZEN.find((p) => p.fleet === f)!.served)
    // the reviewer's frozen-fleet runs (week01_flow_review.md, W1F-F04)
    expect([10, 12, 13, 14, 15].map(at)).toEqual([5416, 6495, 7034, 7572, 7788])
    for (const p of SERVED_FROZEN.filter((x) => x.fleet >= 15)) expect(Math.round(p.served)).toBe(Math.round(PLATEAU))
    // mutation: the old constant plateau line sits above capacity at 10–12 aircraft
    expect(PLATEAU).toBeGreaterThan(cap(12))
  })


  it('F4a: 40 aircraft could fly 24,000 trips alone; the coupled system delivers ≈ 7,800 (≈ 6.5 per aircraft per day)', () => {
    expect(F4_FLEET).toBe(40)
    expect(F4_ALONE).toBe(24000)
    expect(Math.round(F4_DELIVERED)).toBe(7788)
    expect(F4_PER_AIRCRAFT_DAY.toFixed(1)).toBe('6.5')
  })

  it('C5: loop B2 has three negative links and is balancing, matching causalLoops.ts', () => {
    const path = ALL_LOOPS.find((l) => l.id === 'B2')!.path
    expect(negativesIn(path)).toBe(3)
    expect(ALL_LOOPS.find((l) => l.id === 'B2')!.kind).toBe('Balancing')
    expect(loopChain(path)).toBe('riders →(+) trip demand →(+) utilisation →(+) waiting time →(−) service attractiveness →(−) churn →(−) riders')
    // mutation: a loop with an even count must not be called balancing by the same helper
    expect(negativesIn(ALL_LOOPS.find((l) => l.id === 'R1')!.path)).toBe(0)
  })
})

// ------------------------------------------------------------------------------------------- sign-off N1: checks vs the readiness quiz
const STOP = new Set(['per', 'day', 'daily', 'each', 'the', 'of', 'on', 'a', 'an', 'and'])
/** The variables of the loop chain ("a → (+) b → …" or "a →(+) b …") in a text, each as its set of content words. */
function loopVariables(text: string): Set<string>[] {
  const segs = text.replace(/\([+−-]\)/g, ' ').split('→')
  if (segs.length < 2) return []
  segs[0] = segs[0].split(/[.:;?(]/).at(-1)!
  segs[segs.length - 1] = segs[segs.length - 1].split(/[.:;?,()]/)[0]
  return segs.map((v) => new Set(norm(v).filter((w) => !STOP.has(w) && w.length > 2))).filter((v) => v.size > 0 && v.size <= 5)
}
/** How many variables of the loop in `a` match (share a content word with) a variable of the loop in `b`. */
function sharedVariables(a: string, b: string): number {
  const vb = loopVariables(b)
  return loopVariables(a).filter((va) => vb.some((x) => [...va].some((w) => x.has(w)))).length
}
const quizTexts = WEEK1_QUIZ.map((q) => ({ id: q.id, texts: [q.prompt, ...q.options.map((o) => o.text)] }))
const OLD_C5_LOOP = 'daily flights →(+) noise complaints →(−) community acceptance →(+) permitted operating hours →(+) daily flights'
const ABSOLUTE = /\b(must|only|every|everything|nothing|always|never|all|any|alone|none)\b/i

describe('section checks do not pre-answer the readiness quiz (sign-off N1, AUTHORING_GUIDE §7.6)', () => {
  it('no check prompt or keyed option shares a run of 8 or more words with any Week 1 quiz prompt or option', () => {
    for (const s of LEARN_SECTIONS) {
      const key = s.check.options.find((o) => o.correct)!.text
      for (const q of quizTexts)
        for (const t of q.texts)
          for (const [what, c] of [['prompt', s.check.prompt], ['key', key]] as const) {
            const run = longestSharedRun(c, t)
            expect(run, `${s.check.id} ${what} shares ${run} words with ${q.id}`).toBeLessThan(8)
          }
    }
  })

  it('no check shares its loop with a quiz item or with the instructor-notes L1 example loop', () => {
    const notes = week01.instructorNotes.facilitation.join(' ')
    for (const s of LEARN_SECTIONS) {
      for (const q of WEEK1_QUIZ) expect(sharedVariables(s.check.prompt, q.prompt), `${s.check.id} vs ${q.id}`).toBeLessThanOrEqual(1)
      expect(sharedVariables(s.check.prompt, notes), `${s.check.id} vs instructor-notes loop`).toBeLessThanOrEqual(1)
    }
  })

  it('no check reuses a named explorer scenario that a quiz item uses', () => {
    const named = (t: string) => [...t.matchAll(/“([^”]+)”/g)].map((m) => m[1])
    for (const s of LEARN_SECTIONS)
      for (const name of named(s.check.prompt))
        for (const q of WEEK1_QUIZ) expect(q.prompt, `${s.check.id} “${name}” in ${q.id}`).not.toContain(name)
  })

  it('the loop test can fail: the old C5 noise loop is caught against quiz q1-4 and the instructor notes', () => {
    const q14 = WEEK1_QUIZ.find((q) => q.id === 'q1-4')!.prompt
    expect(sharedVariables(OLD_C5_LOOP, q14)).toBeGreaterThanOrEqual(3)
    expect(sharedVariables(OLD_C5_LOOP, week01.instructorNotes.facilitation.join(' '))).toBeGreaterThanOrEqual(3)
    // the new loop shares at most one word-level variable match ("hours") with q1-4
    expect(sharedVariables(C5_LOOP, q14)).toBeLessThanOrEqual(1)
  })
})

describe('no absolute-word cue (sign-off N2; Haladyna, Downing and Rodriguez 2002: avoid specific determiners)', () => {
  it('the keyed option is never the only option free of absolute words', () => {
    for (const s of LEARN_SECTIONS) {
      const key = s.check.options.find((o) => o.correct)!
      if (ABSOLUTE.test(key.text)) continue
      const plain = s.check.options.filter((o) => !o.correct && !ABSOLUTE.test(o.text))
      expect(plain.length, `${s.check.id}: every distractor carries an absolute word and the key does not`).toBeGreaterThan(0)
    }
  })

  it('C2 and C4 mix qualified and absolute wording across the distractors', () => {
    for (const id of ['c2', 'c4']) {
      const opts = LEARN_SECTIONS.find((s) => s.check.id === id)!.check.options.filter((o) => !o.correct)
      expect(opts.some((o) => !ABSOLUTE.test(o.text)), id).toBe(true)
      expect(opts.some((o) => ABSOLUTE.test(o.text)), id).toBe(true)
    }
  })

  it('the absolute-word test can fail: the old C4 options are caught', () => {
    const key = 'Punctuality comes from how the parts now interact, so it can fall while each part still passes.'
    const old = [
      'One of the parts must be failing its specification; the tests are simply missing it.',
      'The operations centre controls dispatch, so its rules alone must explain the drop.',
      'Adding parts can only make a whole better, so the punctuality data must be wrong.',
    ]
    expect(ABSOLUTE.test(key)).toBe(false)
    expect(old.every((t) => ABSOLUTE.test(t))).toBe(true)
  })
})
