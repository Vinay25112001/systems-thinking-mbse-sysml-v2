// American English for the course welcome and Week 1 (DECISION_LOG A18; faculty feedback 2026-10-18, item 8). Scans
// the welcome and Week 1 flow text and UI strings for common British spellings. Excluded: comments (not shown), text
// inside curly quotation marks “…” (verbatim source quotations are never respelled), and the shared Bloom value
// 'Analyse' (a course-wide type value, displayed as "Analyze" through bloomLabel).
import { describe, expect, it } from 'vitest'
import { bloomLabel } from './route'
import { WEEKS } from '../content/course'
import { LEARN_SECTIONS } from '../content/learn/week01'
import { sectionProse } from '../content/learn/resolve'
import week01 from '../content/weeks/week01'
import { WEEK1_QUIZ } from '../content/quizWeek1'
import week1Missions from '../content/missions/week01'
import { SCENARIOS } from '../sim/aerolink'
import { LOOP_LINKS, LOOP_NODES } from '../content/causalLoops'

const FILES = {
  ...import.meta.glob(['../content/learn/welcome.ts', '../content/learn/week01.ts', '../pages/Welcome.tsx'], { query: '?raw', import: 'default', eager: true }),
  // Week 1 rebuild (2026-10-18): the content modules, the Week 1 workbench views and their logic, and the new figures
  ...import.meta.glob(
    ['../content/weeks/week01.ts', '../content/quizWeek1.ts', '../content/missions/week01.ts', '../workbench/week1/{StakeholderExercise,NeedsExercise,TeamView,StakeholdersView,NeedsView}.tsx', '../workbench/week1/{stakeholders,team}.ts', '../components/figures/StakeholderFigures.tsx'],
    { query: '?raw', import: 'default', eager: true },
  ),
  ...import.meta.glob(['./*.ts', './*.tsx', '!./*.test.ts', '!./*.test.tsx'], { query: '?raw', import: 'default', eager: true }),
  // lecture-first path (2026-10-19): the Week 1 pages, their content and the lab instructions
  ...import.meta.glob(['../week1/*.ts', '../week1/*.tsx', '!../week1/*.test.ts', '!../week1/*.test.tsx', '../content/week1Path.ts', '../content/lab/week01Lab.ts', '../pages/Dashboard.tsx', '../../docs/lectures/week01/WEEK1_LAB_INSTRUCTIONS.md'], { query: '?raw', import: 'default', eager: true }),
} as Record<string, string>

/** Common British spellings (word stems are matched as whole words, case-insensitive). */
const BRITISH = [
  'behaviour', 'behaviours', 'behavioural', 'modelling', 'modelled', 'modeller', 'organise', 'organised', 'organises', 'organising',
  'organisation', 'organisations', 'organisational', 'centre', 'centres', 'colour', 'colours', 'coloured', 'analyse', 'analysed',
  'analysing', 'utilisation', 'utilise', 'utilised', 'realise', 'realised', 'realising', 'recognise', 'recognised', 'summarise',
  'summarised', 'emphasise', 'emphasised', 'emphasises', 'synthesise', 'synthesised', 'synthesising', 'generalise', 'generalised',
  'optimise', 'optimised', 'prioritise', 'minimise', 'maximise', 'favour', 'favourable', 'labelled', 'labelling', 'travelled',
  'judgement', 'programme', 'programmes', 'defence', 'catalogue', 'catalogues', 'practise', 'practised', 'practising', 'whilst',
  'amongst', 'formalise', 'formalised', 'characterise', 'characterised', 'categorise', 'standardise', 'visualise', 'specialise',
  'criticise', 'authorise', 'itemise', 'itemised', 'reorganise', 'rationalise', 'rationalises', 'rationalising', 'fulfil', 'travelling', 'cancelled', 'licence', 'learnt', 'enrol', 'enrolment', 'grey', 'aeroplane', 'metre', 'metres', 'litre', 'tonne',
]
const WORD = new RegExp(`\\b(${BRITISH.join('|')})\\b`, 'gi')

/** Removes what the reader never sees as course wording: comments, curly-quoted source text, the Bloom type value. */
function scannable(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1')
    .replace(/“[^”]*”/g, ' ')
    .replace(/'Analyse'/g, ' ')
}

function britishIn(src: string): string[] {
  return [...scannable(src).matchAll(WORD)].map((m) => m[0])
}

describe('American English in the welcome page and Week 1 (A18)', () => {
  it('scans the welcome page, both Learn content modules and every flow file', () => {
    const names = Object.keys(FILES)
    expect(names.some((n) => n.endsWith('learn/week01.ts'))).toBe(true)
    expect(names.some((n) => n.endsWith('learn/welcome.ts'))).toBe(true)
    expect(names.some((n) => n.endsWith('pages/Welcome.tsx'))).toBe(true)
    for (const f of ['Learn.tsx', 'Overview.tsx', 'Practice.tsx', 'CheckSubmit.tsx', 'Chrome.tsx']) expect(names.some((n) => n.endsWith(`/${f}`)), f).toBe(true)
    for (const f of ['Home.tsx', 'Examples.tsx', 'Lab.tsx', 'Assessment.tsx', 'week1Path.ts', 'week01Lab.ts', 'WEEK1_LAB_INSTRUCTIONS.md']) expect(names.some((n) => n.endsWith(`/${f}`)), f).toBe(true)
    expect(names.some((n) => n.endsWith('.test.ts'))).toBe(false)
  })

  it('no British spelling in their text or UI strings', () => {
    const found = Object.entries(FILES).flatMap(([name, src]) => britishIn(src).map((w) => `${name}: ${w}`))
    expect(found).toEqual([])
  })

  it('no British spelling in the Week 1 text the flow resolves at run time (reviewed blocks, quiz, missions, explorer labels)', () => {
    const texts = [
      ...LEARN_SECTIONS.flatMap((x) => [...sectionProse(x), ...x.keyTerms.items.flatMap((t) => [t.term, t.def]), x.check.prompt, ...x.check.options.flatMap((o) => [o.text, o.feedback]), ...x.figures.flatMap((f) => [f.alt, f.textEquivalent])]),
      ...week01.blocks.flatMap((b) => [b.title, ...b.paragraphs, ...(b.bullets ?? [])]),
      ...WEEK1_QUIZ.flatMap((q) => [q.prompt, ...q.options.flatMap((o) => [o.text, o.explanation])]),
      ...week1Missions.missions.flatMap((m) => [m.title, m.goal, m.debrief ?? '', ...m.steps.flatMap((st) => [st.instruction, st.hint ?? '', st.worked ?? '', st.brief?.task ?? '', st.brief?.input ?? '', st.brief?.done ?? ''])]),
      ...SCENARIOS.flatMap((x) => [x.name, x.setup, x.description]),
      ...LOOP_NODES.map((x) => x.label),
      ...LOOP_LINKS.map((x) => x.condition ?? ''),
    ]
    const found = texts.flatMap((t) => britishIn(`'${t}'`))
    expect(found).toEqual([])
  })

  it('the scan can fail: British words in strings are caught, quoted source text and comments are not', () => {
    expect(britishIn("const t = 'The operations centre models behaviour.'")).toEqual(['centre', 'behaviour'])
    expect(britishIn('label="Colour theme"')).toEqual(['Colour'])
    expect(britishIn('text: `utilisation is high`')).toEqual(['utilisation'])
    expect(britishIn('quote: “organisations that synthesise”')).toEqual([])
    expect(britishIn('// a comment about colour\nconst x = 1')).toEqual([])
    expect(britishIn("bloom: 'Analyse'")).toEqual([])
  })

  it('F09: the course.ts Week 1 objectives, topics and graduate task, and the quiz badges as displayed, are American English', () => {
    const w = WEEKS[0]
    const texts = [...w.objectives.map((o) => o.text), ...w.topics, w.graduateTask, w.output, w.lab, ...w.objectives.map((o) => bloomLabel(o.bloom)), ...WEEK1_QUIZ.map((q) => bloomLabel(q.bloom))]
    expect(texts.flatMap((t) => britishIn(`'${t}'`))).toEqual([])
    expect(w.objectives.map((o) => o.text).join(' ')).not.toMatch(/behaviour/i)
  })

  it('the Bloom value is displayed in American English', () => {
    expect(bloomLabel('Analyse')).toBe('Analyze')
    expect(bloomLabel('Apply')).toBe('Apply')
  })
})
