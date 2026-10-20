// Week 8 SysML v2 listings: every listing a slide or the lesson shows is an excerpt of a file under sysml/ that the
// course-designated checker has validated (sysml/lectures/week08/week08-report.json; sysmlWeek08.test.ts checks each
// listing below is a verbatim excerpt of its file and that the file's recorded status is the one stated here). Listings
// are drawn as figures (src/components/figures/LectureWeek8S1.tsx, S2.tsx: CodeListing), so the same text reaches the
// slide viewer, the reader and the .pptx; the figure's alt text carries the listing text.
//
// A checker PASS means the file parsed, every name resolved and no validation rule fired. It never shows the listing
// means what the model intends (see the "predict the checker" listings).
// Review status: new-pending-review.
import { sysmlSource } from '../../../lib/sysml'
import { AEROLINK_MODEL_FILE, declarationOf, tidy } from './aerolinkCase'

export type Mark = { line: number; label: string }
export type Listing = {
  id: string
  /** The validated file the excerpt comes from (path under sysml/). */
  file: string
  /** The status the checker recorded for the whole file. */
  status: 'PASS' | 'PASS with warnings' | 'FAIL'
  /** What the checker said, as recorded (for the predict items and the tool proof). */
  recorded?: string
  lines: string[]
  /** When set, `lines` are consecutive lines of the file and lines[0] is file line `firstLine`: the listing is drawn
   *  with the file's own line numbers, so a checker line:column always names the line it names in the file. */
  firstLine?: number
  /** Callouts drawn beside a line (1-based line of `lines`). */
  marks?: Mark[]
  /** The credit line drawn under a quoted or adapted listing, exactly as students read it (no internal source code). */
  credit?: string
}

const src = (file: string): string => {
  const t = sysmlSource(file)
  if (t === undefined) throw new Error(`listing source missing: sysml/${file}`)
  return t.replace(/\r/g, '')
}
/** Lines `from`..`to` (1-based, inclusive) of a file, de-indented. */
const range = (file: string, from: number, to: number) => trimEnd(tidy(src(file).split('\n').slice(from - 1, to).join('\n'), 72))
/** The 1-based line of the first line of a file that starts with `start` (after indentation). */
const lineOf = (file: string, start: string): number => {
  const i = src(file).split('\n').findIndex((l) => l.trim().startsWith(start))
  if (i < 0) throw new Error(`no "${start}" in ${file}`)
  return i + 1
}
/** Drops trailing blank lines. */
function trimEnd(lines: string[]): string[] {
  const out = [...lines]
  while (out.length && !out[out.length - 1].trim()) out.pop()
  return out
}
/** The block that starts at the first line containing `start` and ends at its matching closing brace. */
function block(file: string, start: string): string[] {
  const t = src(file)
  const at = t.indexOf(start)
  if (at < 0) throw new Error(`no "${start}" in ${file}`)
  const s = t.lastIndexOf('\n', at) + 1
  const brace = t.indexOf('{', at)
  const semi = t.indexOf(';', at)
  if (brace < 0 || (semi >= 0 && semi < brace)) return tidy(t.slice(s, semi + 1))
  let depth = 0
  for (let i = brace; i < t.length; i++) {
    if (t[i] === '{') depth++
    else if (t[i] === '}' && --depth === 0) return tidy(t.slice(s, i + 1))
  }
  throw new Error(`unbalanced block at "${start}" in ${file}`)
}
/** Drops note lines and trailing blank lines. */
const withoutComments = (lines: string[]) => trimEnd(lines.filter((l) => !l.trim().startsWith('//')))
const DECK = 'the SysML v2 textual-notation training deck (Release 2026-08, CC BY 4.0)'
const W8 = (f: string) => `lectures/week08/${f}`
const W9 = (f: string) => `week09/${f}`

export const LISTINGS: Record<string, () => Listing> = {
  // ---------------------------------------------------------------- Session 1
  'vehicle-def': () => ({
    id: 'vehicle-def',
    file: W8('deck_quotes_textual_notation.sysml'),
    status: 'PASS',
    credit: `Quoted from ${DECK}, slide 9.`,
    lines: block(W8('deck_quotes_textual_notation.sysml'), 'package Slide9').slice(1, -1).map((l) => l.replace(/^ {4}/, '')),
    marks: [
      { line: 2, label: 'attribute usage (always referential)' },
      { line: 3, label: 'part usage: composite' },
      { line: 4, label: 'ref part: referential' },
      { line: 6, label: 'attribute definition: data only' },
    ],
  }),
  'aircraft-usage': () => ({
    id: 'aircraft-usage',
    file: W9('aerolink_l9_skeleton.sysml'),
    status: 'PASS',
    lines: range(W9('aerolink_l9_skeleton.sysml'), 101, 109),
    marks: [
      { line: 1, label: 'usage of the enterprise definition' },
      { line: 3, label: 'redefines an inherited attribute; value with its unit' },
      { line: 5, label: 'short name · name · definition · multiplicity 12' },
    ],
  }),
  'aircraft-def': () => ({
    id: 'aircraft-def',
    file: W9('aerolink_l9_skeleton.sysml'),
    status: 'PASS',
    lines: block(W9('aerolink_l9_skeleton.sysml'), 'part def EVTOLAircraft'),
    marks: [{ line: 3, label: 'quantity kind only: SpeedValue; the unit comes with a value' }],
  }),
  'charger-specialization': () => ({
    id: 'charger-specialization',
    file: W9('aerolink_def_usage.sysml'),
    status: 'PASS',
    lines: range(W9('aerolink_def_usage.sysml'), 11, 19),
    marks: [
      { line: 1, label: 'abstract: every charger is one of the specializations' },
      { line: 4, label: ':> after a definition = specializes' },
      { line: 5, label: 'redefines the inherited rating, binds a value' },
    ],
  }),
  'vertiport-subsetting': () => ({
    id: 'vertiport-subsetting',
    file: W9('aerolink_def_usage.sysml'),
    status: 'PASS',
    lines: range(W9('aerolink_def_usage.sysml'), 21, 30),
    marks: [
      { line: 3, label: 'chargers: one or more' },
      { line: 6, label: 'subsets: two of the chargers are turnaround chargers' },
      { line: 9, label: 'redefines: at a spoke, every charger is standard' },
    ],
  }),
  'engine-redefinition': () => ({
    id: 'engine-redefinition',
    file: W8('deck_quotes_textual_notation.sysml'),
    status: 'PASS',
    credit: `Quoted from ${DECK}, slide 12.`,
    lines: block(W8('deck_quotes_textual_notation.sysml'), 'package Slide12').slice(1, -1).map((l) => l.replace(/^ {4}/, '')),
    marks: [
      { line: 5, label: 'redefines eng, new name and type' },
      { line: 8, label: ':>> is redefines' },
      { line: 14, label: 'same name kept: multiplicity 4' },
    ],
  }),
  'network-configurations': () => ({
    id: 'network-configurations',
    file: W9('aerolink_def_usage.sysml'),
    status: 'PASS',
    lines: range(W9('aerolink_def_usage.sysml'), 32, 51),
    marks: [
      { line: 3, label: 'hubs and spokes are among the sites' },
      { line: 7, label: 'a package-level usage' },
      { line: 9, label: 'baseline: subsets the usage, redefines counts' },
      { line: 15, label: 'ALT-004: a sibling configuration' },
    ],
  }),
  'predict-block': () => ({
    id: 'predict-block',
    file: W9('invalid_pc5_block_keyword.sysml'),
    status: 'FAIL',
    recorded: 'FAIL: line 4, “no viable alternative at input ‘EVTOLAircraft’” (a syntax error: block is not a SysML v2 keyword).',
    lines: withoutComments(tidy(src(W9('invalid_pc5_block_keyword.sysml')))),
  }),
  'predict-duplicate': () => ({
    id: 'predict-duplicate',
    file: W9('predict_pc2_duplicate_short_name.sysml'),
    status: 'PASS with warnings',
    recorded: 'PASS with two warnings, lines 6 and 7: “Duplicate of other owned member name”.',
    lines: withoutComments(tidy(src(W9('predict_pc2_duplicate_short_name.sysml')))),
  }),
  'predict-attribute-part': () => ({
    id: 'predict-attribute-part',
    file: W9('predict_pc6_attribute_def_with_part.sysml'),
    status: 'PASS',
    recorded: 'PASS, no message, although an attribute definition may not have composite features.',
    lines: withoutComments(tidy(src(W9('predict_pc6_attribute_def_with_part.sysml')))),
  }),
  // ---------------------------------------------------------------- Session 2
  warmup: () => ({
    id: 'warmup',
    file: W8('warmup_library_rooms.sysml'),
    status: 'PASS',
    lines: withoutComments(tidy(src(W8('warmup_library_rooms.sysml')))),
  }),
  'root-imports': () => ({
    id: 'root-imports',
    file: 'reference/aerolink_v01_skeleton.sysml',
    status: 'PASS',
    lines: ((at) => range('reference/aerolink_v01_skeleton.sysml', at, at + 4))(lineOf('reference/aerolink_v01_skeleton.sysml', "package 'AeroLink Reference Model' {")).map((l, i) => (i === 1 ? '    doc /* … */' : l)),
    marks: [
      { line: 1, label: 'a name with spaces is quoted' },
      { line: 3, label: 'visibility shown on every import; private at the root' },
    ],
  }),
  'comments-doc': () => ({
    id: 'comments-doc',
    file: W8('deck_quotes_textual_notation.sysml'),
    status: 'PASS',
    credit: `Quoted from ${DECK}, slides 7–8.`,
    lines: [...block(W8('deck_quotes_textual_notation.sysml'), "package 'Comment Example'").slice(1, -1), '', ...block(W8('deck_quotes_textual_notation.sysml'), "package 'Documentation Example'").slice(4, 8)].map((l) => l.replace(/^ {4}/, '')),
    marks: [
      { line: 1, label: 'comment: part of the model' },
      { line: 12, label: 'note: text only, not in the model' },
      { line: 17, label: 'doc: owned by the element it documents' },
    ],
  }),
  'stakeholder-decl': () => ({
    id: 'stakeholder-decl',
    file: AEROLINK_MODEL_FILE,
    status: 'PASS',
    lines: tidy(declarationOf(src(AEROLINK_MODEL_FILE), 'STK-005'), 96),
    marks: [{ line: 1, label: 'keyword · short name (the ID) · name' }],
  }),
  'concern-adapted': () => ({
    id: 'concern-adapted',
    file: W8('stakeholders_concerns_adapted.sysml'),
    status: 'PASS',
    credit: `Adapted from ${DECK}, slide 115, with one spelling of the stakeholder name.`,
    lines: withoutComments(tidy(src(W8('stakeholders_concerns_adapted.sysml')))),
    marks: [
      { line: 7, label: 'subject first' },
      { line: 8, label: 'stakeholder parameter typed by a part definition' },
    ],
  }),
  'need-frames': () => ({
    id: 'need-frames',
    file: 'reference/aerolink_v01_skeleton.sysml',
    status: 'PASS',
    lines: tidy(declarationOf(src('reference/aerolink_v01_skeleton.sysml'), 'NEED-004'), 70),
    marks: [{ line: 5, label: 'frame: the Week 1 concern becomes a required constraint (Week 9)' }],
  }),
  'context-worked': () => {
    const t = src(AEROLINK_MODEL_FILE)
    const ctx = block(AEROLINK_MODEL_FILE, 'part context {')
    return {
      id: 'context-worked',
      file: AEROLINK_MODEL_FILE,
      status: 'PASS',
      lines: [...tidy(declarationOf(t, 'ENT-001'), 60), ...ctx.map((l) => (l.includes('doc /*') && l.length > 104 ? `${l.slice(0, l.indexOf('{ doc'))}{ doc /* … */ }` : l))],
      marks: [
        { line: 1, label: 'the enterprise: a part definition' },
        { line: 6, label: 'the system of interest, referenced' },
        { line: 8, label: 'each external system: a part usage with its ID' },
      ],
    }
  },
  'stakeholder-worked': () => {
    const t = src(AEROLINK_MODEL_FILE)
    return {
      id: 'stakeholder-worked',
      file: AEROLINK_MODEL_FILE,
      status: 'PASS',
      lines: [...tidy(declarationOf(t, 'STK-005'), 90), ...tidy(declarationOf(t, 'CON-006'), 90), ...tidy(declarationOf(t, 'REL-002'), 90)],
      marks: [
        { line: 3, label: 'register ratings as metadata (course convention)' },
        { line: 7, label: 'subject first, then the stakeholder' },
        { line: 10, label: 'relationship: a tagged dependency' },
      ],
    }
  },
  'tool-proof-pass': () => ({
    id: 'tool-proof-pass',
    file: W8('tool_proof_pass.sysml'),
    status: 'PASS',
    recorded: 'PASS, no message.',
    lines: withoutComments(tidy(src(W8('tool_proof_pass.sysml')))),
  }),
  // ---------------------------------------------------------------- assessment (applied exercise, task 5)
  'exercise-seeded': () => ({
    id: 'exercise-seeded',
    file: W8('invalid_exercise_microgrid_seeded.sysml'),
    status: 'FAIL',
    recorded: 'FAIL by design: three seeded defects; the checker reports two of them, with cascade errors.',
    // the whole file exactly as the checker read it (header comment and tabs kept), numbered from line 1, so every
    // line:column of the recorded output points at the same character on the page (a tab is one column)
    firstLine: 1,
    lines: trimEnd(src(W8('invalid_exercise_microgrid_seeded.sysml')).split('\n')),
  }),
  'exercise-fixed12': () => ({
    id: 'exercise-fixed12',
    file: W8('exercise_microgrid_defects12_fixed.sysml'),
    status: 'PASS',
    recorded: 'PASS, no message: defects 1 and 2 fixed, defect 3 left in.',
    lines: withoutComments(tidy(src(W8('exercise_microgrid_defects12_fixed.sysml')))),
  }),
  'tool-proof-fail': () => ({
    id: 'tool-proof-fail',
    file: W8('invalid_tool_proof_unquoted_id.sysml'),
    status: 'FAIL',
    recorded: 'FAIL: line 9, column 12, “mismatched input ‘-’ expecting ‘>’”.',
    // the file from its package line (line 4) to the end, numbered as in the file: the checker's 9:12 is figure line 9
    firstLine: lineOf(W8('invalid_tool_proof_unquoted_id.sysml'), 'package '),
    lines: range(W8('invalid_tool_proof_unquoted_id.sysml'), lineOf(W8('invalid_tool_proof_unquoted_id.sysml'), 'package '), Infinity),
  }),
}

export const listing = (id: string): Listing => {
  const f = LISTINGS[id]
  if (!f) throw new Error(`unknown listing ${id}`)
  return f()
}
/** The listing as plain text, for a figure's alt text. */
export const listingText = (id: string): string => listing(id).lines.join('\n')
