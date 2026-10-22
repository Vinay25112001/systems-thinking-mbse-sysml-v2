// Week 9 SysML v2 listings: every listing a slide or the lesson shows is an excerpt of a file under sysml/ that the
// course-designated checker has validated (sysml/lectures/week09/week09-report.json). sysmlWeek09.test.ts checks that
// each listing below is an ordered, verbatim excerpt of its file (a long documentation comment may be shortened with
// "…") and that the status stated here is the status the checker recorded for the whole file. Listings are drawn as
// figures (src/components/figures/LectureWeek9Code.tsx), so the same text reaches the slide viewer, the reader and the
// .pptx; the figure's alt text carries the listing text.
//
// A checker PASS means the file parsed, every name resolved and no validation rule fired. It never shows that a
// requirement is the right one or that a design meets it (see the warm-up and the predict-the-checker listings).
// Review status: new-pending-review.
import { sysmlSource } from '../../../lib/sysml'
import { AEROLINK_W9_MODEL_FILE } from './aerolinkCase'

export type Mark = { line: number; label: string }
export type Listing = {
  id: string
  /** The validated file the excerpt comes from (path under sysml/). */
  file: string
  /** The status the checker recorded for the whole file. */
  status: 'PASS' | 'PASS with warnings' | 'FAIL'
  /** What the checker said, as recorded (predict items and the calibration table). */
  recorded?: string
  lines: string[]
  /** Callouts drawn beside a line (1-based line of `lines`). */
  marks?: Mark[]
  /** The credit line drawn under the listing, exactly as students read it. */
  credit?: string
}

const src = (file: string): string => {
  const t = sysmlSource(file)
  if (t === undefined) throw new Error(`listing source missing: sysml/${file}`)
  return t.replace(/\r/g, '')
}
// A documentation line shortened to about `max` characters, keeping its first words and closing with "… */".
function shortDoc(line: string, max: number): string {
  if (!max || line.length <= max || !line.includes('doc /*') || !line.includes('*/')) return line
  const head = line.slice(0, line.indexOf('doc /*') + 7)
  const body = line.slice(head.length, line.lastIndexOf('*/')).trim()
  const tail = line.slice(line.lastIndexOf('*/') + 2)
  const room = Math.max(12, max - head.length - 6 - tail.length)
  let cut = body.slice(0, room)
  if (cut.length < body.length) cut = cut.slice(0, cut.lastIndexOf(' ') > 8 ? cut.lastIndexOf(' ') : cut.length)
  return `${head}${cut} … */${tail}`
}
/** Removes the common leading tabs, widens tabs to four spaces and shortens long documentation lines. */
function tidy(block: string, maxDoc: number): string[] {
  const lines = block.split('\n')
  const lead = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^\t*/)![0].length))
  return lines.map((l) => shortDoc(l.slice(lead).replace(/\t/g, '    '), maxDoc))
}
/** The block that starts on the line containing `start` and ends at its matching closing brace (or its semicolon). */
function block(file: string, start: string): string {
  const t = src(file)
  const at = t.indexOf(start)
  if (at < 0) throw new Error(`no "${start}" in ${file}`)
  const s = t.lastIndexOf('\n', at) + 1
  const brace = t.indexOf('{', at)
  const semi = t.indexOf(';', at)
  if (brace < 0 || (semi >= 0 && semi < brace)) return t.slice(s, semi + 1)
  let depth = 0
  for (let i = brace; i < t.length; i++) {
    if (t[i] === '{') depth++
    else if (t[i] === '}' && --depth === 0) return t.slice(s, i + 1)
  }
  throw new Error(`unbalanced block at "${start}" in ${file}`)
}
const blocks = (file: string, starts: string[], maxDoc = 76) => starts.flatMap((s, i) => [...(i ? [''] : []), ...tidy(block(file, s), maxDoc)])
const drop = (lines: string[], re: RegExp) => lines.filter((l) => !re.test(l))
const W9 = (f: string) => `lectures/week09/${f}`
const AERO = AEROLINK_W9_MODEL_FILE
const DECK = 'Pattern of the requirement examples in the SysML v2 specification (7.21) and textual-notation training deck (slides 86-89)'

export const LISTINGS: Record<string, () => Listing> = {
  // ---------------------------------------------------------------- Session 1
  anatomy: () => ({
    id: 'anatomy',
    file: W9('requirement_anatomy.sysml'),
    status: 'PASS',
    credit: `${DECK}; course listing.`,
    lines: blocks(W9('requirement_anatomy.sysml'), ["requirement def <'R-1'>", "requirement <'R-1.1'>"]),
    marks: [
      { line: 1, label: 'short name (ID), then name' },
      { line: 2, label: 'doc: the informal text' },
      { line: 3, label: 'subject: what it is about' },
      { line: 5, label: 'required constraint' },
      { line: 10, label: 'a usage binds the limit' },
    ],
  }),
  'team-a-b': () => ({
    id: 'team-a-b',
    file: W9('driving_question_two_teams.sysml'),
    status: 'PASS',
    lines: blocks(W9('driving_question_two_teams.sysml'), ['package TeamA', 'package TeamB']),
    marks: [
      { line: 12, label: 'Team B: subject' },
      { line: 13, label: 'the limit, with its unit' },
      { line: 14, label: 'what the model can evaluate' },
    ],
  }),
  'need-004': () => ({
    id: 'need-004',
    file: AERO,
    status: 'PASS',
    lines: blocks(AERO, ["requirement <'NEED-004'>"], 70),
    marks: [
      { line: 3, label: 'subject: the enterprise (course convention)' },
      { line: 4, label: 'the stakeholder, a Week 8 part def' },
      { line: 5, label: 'the Week 8 concern it answers' },
    ],
  }),
  latency: () => ({
    id: 'latency',
    file: AERO,
    status: 'PASS',
    lines: drop(blocks(AERO, ['requirement def DurationUpperLimit', "requirement <'REQ-SYS-005'>"], 70), /^\s*@/),
    marks: [
      { line: 1, label: 'the shared form: one definition' },
      { line: 8, label: 'a usage of it' },
      { line: 10, label: 'its own subject' },
      { line: 11, label: 'bind the measured feature' },
      { line: 12, label: 'bind the limit' },
    ],
  }),
  metadata: () => ({
    id: 'metadata',
    file: AERO,
    status: 'PASS',
    lines: blocks(AERO, ["requirement <'REQ-STK-003'>"], 70),
    marks: [
      { line: 6, label: 'type, method, criterion' },
      { line: 7, label: 'why, not what' },
      { line: 8, label: 'a TBD with its owner' },
    ],
  }),
  derivation: () => ({
    id: 'derivation',
    file: AERO,
    status: 'PASS',
    lines: blocks(AERO, ["#derivation connection 'REQ-SYS-001 derives from REQ-STK-005'"]),
    marks: [
      { line: 2, label: 'the parent' },
      { line: 3, label: 'the child' },
    ],
  }),
  // ---------------------------------------------------------------- Session 2
  warmup: () => ({
    id: 'warmup',
    file: W9('warmup_book_return_kiosk.sysml'),
    status: 'PASS',
    lines: blocks(W9('warmup_book_return_kiosk.sysml'), ["requirement <'K-1'>", "requirement <'K-2'>", "requirement <'K-3'>"]),
  }),
  'worked-stk': () => ({
    id: 'worked-stk',
    file: AERO,
    status: 'PASS',
    lines: blocks(AERO, ["requirement <'REQ-STK-001'>"], 70),
    marks: [
      { line: 2, label: 'the Week 2 statement, word for word' },
      { line: 3, label: 'subject: the enterprise' },
      { line: 4, label: 'the limit from the criterion' },
      { line: 5, label: 'the measured feature of the subject' },
      { line: 6, label: 'type, method, criterion' },
      { line: 7, label: 'the Week 2 rationale' },
    ],
  }),
  tbd: () => ({
    id: 'tbd',
    file: W9('tbd_unbound_vs_bound.sysml'),
    status: 'PASS',
    lines: drop(blocks(W9('tbd_unbound_vs_bound.sysml'), ['package Unbound', 'package Bound']), /^\s*(doc \/\*|\*)/),
    marks: [
      { line: 4, label: 'no value: “some limit exists”' },
      { line: 13, label: 'bound: “the configured limit”' },
    ],
  }),
  'still-air': () => ({
    id: 'still-air',
    file: W9('assume_still_air_two_readings.sysml'),
    status: 'PASS',
    lines: drop(blocks(W9('assume_still_air_two_readings.sysml'), ['package GateReading', 'package ReferenceReading']), /^\s*(doc \/\*|\*)/),
    marks: [
      { line: 4, label: 'the weather, an actor' },
      { line: 6, label: 'gate: if still air …' },
      { line: 7, label: '… then within 16 min' },
      { line: 15, label: 'the condition stays with the quantity' },
    ],
  }),
  chain: () => ({
    id: 'chain',
    file: AERO,
    status: 'PASS',
    lines: blocks(AERO, ["#derivation connection 'REQ-STK-005 derives from NEED-004'", "#derivation connection 'REQ-SYS-001 derives from REQ-STK-005'"]),
  }),
  'predict-unquoted': () => ({
    id: 'predict-unquoted',
    file: W9('invalid_predict_unquoted_id.sysml'),
    status: 'FAIL',
    recorded: 'FAIL: line 3, “mismatched input ‘-’ expecting ‘>’”',
    lines: blocks(W9('invalid_predict_unquoted_id.sysml'), ['requirement <REQ-SYS-001>'], 60),
  }),
  'predict-reversed': () => ({
    id: 'predict-reversed',
    file: W9('predict_derivation_reversed.sysml'),
    status: 'PASS',
    recorded: 'PASS, no message',
    lines: blocks(W9('predict_derivation_reversed.sysml'), ["#derivation connection 'swapped ends'"]),
  }),
  'predict-satisfy': () => ({
    id: 'predict-satisfy',
    file: W9('predict_satisfy_between_requirements.sysml'),
    status: 'PASS with warnings',
    recorded: 'PASS with one warning: “Bound features should have conforming types”',
    lines: [src(W9('predict_satisfy_between_requirements.sysml')).split('\n').find((l) => l.trim().startsWith('satisfy'))!.trim()],
  }),
}

export const listing = (id: string): Listing => {
  const f = LISTINGS[id]
  if (!f) throw new Error(`unknown listing ${id}`)
  return f()
}
/** The listing as one line of text (for alt text): lines joined with " / ". */
export const listingText = (id: string) =>
  listing(id)
    .lines.map((l) => l.trim())
    .filter(Boolean)
    .join(' / ')

/** The calibration table of Session 1 (what the checker rejects and what it accepts silently), each row a checked file
 *  and the diagnostic the checker recorded for it (week09-report.json; sysmlWeek09.test.ts checks every row). */
export const CALIBRATION: { file: string; label: string; what: string; result: 'FAIL' | 'PASS' | 'PASS with warnings'; recorded: string }[] = [
  { file: W9('invalid_two_definitions.sysml'), label: 'two definitions', what: 'A requirement usage typed by two requirement definitions', result: 'FAIL', recorded: 'A requirement must be typed by one requirement definition.' },
  { file: W9('invalid_subject_not_first.sysml'), label: 'subject not first', what: 'An actor declared before the subject', result: 'FAIL', recorded: 'Subject must be first parameter.' },
  { file: W9('invalid_predict_unquoted_id.sysml'), label: 'unquoted ID', what: 'A hyphenated ID written without quotes', result: 'FAIL', recorded: 'mismatched input \'-\' expecting \'>\'' },
  { file: W9('warmup_book_return_kiosk.sysml'), label: 'doc only, wrong subject', what: 'A requirement with a doc comment and nothing else; a constraint over the wrong subject', result: 'PASS', recorded: 'no message' },
  { file: W9('predict_derivation_reversed.sysml'), label: 'swapped derivation', what: 'A derivation with its parent and child swapped', result: 'PASS', recorded: 'no message' },
  { file: W9('predict_satisfy_between_requirements.sysml'), label: 'satisfy: a warning', what: 'A satisfy written between two requirements', result: 'PASS with warnings', recorded: 'Bound features should have conforming types' },
]
