// Student rendering of reused lesson text in the Week 1 textbook (spec §d.7 LRN-14, §d.2 LRN-07). Nothing here edits
// the source: the reviewed lesson keeps its inline register codes ("(R11 p.552)") for the slides, the handout and the
// Weeks 2–8 readers. In Learn, each code becomes a numbered footnote whose note text is built from the register
// (source title, article title, page), so no register (R) or source (S) code is ever shown; the register id survives
// only in the link target #/sources/R11/552. LRN-07: provenance "proposed" reads as "teaching assumption".
// The shared formatCitation (Weeks 2–8) is not changed (Reuse map C17).
import { getReading, type Citation } from '../../content/readings'
import { displayNumber } from './textbook'

/** "SEBoK v2.14 (2026), “Stakeholder Needs Definition”, PDF p. 553" — never an R- or S-code. */
export function studentCitation(c: Citation): string {
  const r = getReading(c.reading)
  const range = c.pages ?? (r.firstPage === r.lastPage ? `${r.firstPage}` : `${r.firstPage}–${r.lastPage}`)
  const multi = /[–,-]/.test(range)
  const unit = r.unit === 'slide' ? (multi ? 'slides' : 'slide') : multi ? 'PDF pp.' : 'PDF p.'
  return `${r.sourceTitle}, “${r.title}”, ${unit} ${range}${c.note ? ` (${c.note})` : ''}`
}

export const sourcesHref = (c: Citation) => `/sources/${encodeURIComponent(c.reading)}${c.pages ? `/${encodeURIComponent(c.pages)}` : ''}`

/** A register citation as written inline in the lesson: "R11 p.552", "R39a p.1632", "R11 pp.549, 551", "R63 pp.236–237". */
const CITE = /\bR(\d{2,3}[a-z]?) (pp?\.) ?(\d+(?:[–-]\d+)?(?:, ?\d+(?:[–-]\d+)?)*)/g

export type Seg = { text: string } | { cite: Citation }

function citesIn(s: string): { cites: Citation[]; rest: string } {
  const cites: Citation[] = []
  const rest = s.replace(CITE, (_m, id: string, _u: string, pages: string) => {
    cites.push({ reading: `R${id}`, pages: pages.replace(/, /g, ', ') })
    return '\u0000'
  })
  return { cites, rest }
}

/** Cleans what remains of a parenthesis or a cell once its citations are taken out. */
const tidy = (s: string) =>
  s
    .replace(/\u0000/g, '')
    .replace(/\s*;\s*(?=;|$)/g, '')
    .replace(/^[\s,;:]+|[\s,;:]+$/g, '')
    .replace(/\s*,\s*,/g, ',')
    .replace(/\s{2,}/g, ' ')

/** Splits text into plain runs and footnote citations. A parenthesis holding only citations disappears (its notes
 *  follow the preceding word); a parenthesis with other words keeps them, e.g. "(paraphrased)", "(after Brooks)". */
export function splitCitations(text: string): Seg[] {
  const out: Seg[] = []
  const push = (t: string) => {
    if (!t) return
    const last = out[out.length - 1]
    if (last && 'text' in last) last.text += t
    else out.push({ text: t })
  }
  let i = 0
  const paren = /\(([^()]*)\)/g
  let m: RegExpExecArray | null
  const plain = (t: string) => {
    // citations outside parentheses (table cells, "see R11 p.553")
    let j = 0
    for (const c of t.matchAll(new RegExp(CITE.source, 'g'))) {
      push(t.slice(j, c.index))
      out.push({ cite: { reading: `R${c[1]}`, pages: c[3] } })
      j = c.index! + c[0].length
    }
    push(t.slice(j))
  }
  while ((m = paren.exec(text))) {
    const inner = m[1]
    if (!new RegExp(CITE.source).test(inner)) continue
    const { cites, rest } = citesIn(inner)
    const left = tidy(rest)
    const pre = text.slice(i, m.index)
    plain(left ? pre : pre.replace(/\s+$/, ''))
    if (left) push(`(${left})`)
    for (const c of cites) out.push({ cite: c })
    i = m.index + m[0].length
  }
  plain(text.slice(i))
  // a cell or sentence left as stray separators between notes ("; ") reads as nothing
  return out.map((s) => ('text' in s ? { text: s.text.replace(/^\s*;\s*$/, ' ').replace(/\s+([.,;:])/g, '$1') } : s)).filter((s) => !('text' in s) || s.text !== '')
}

/** LRN-07: the case's internal provenance ("proposed, instructor to confirm") reads as "teaching assumption". */
const PROVENANCE: [RegExp, string][] = [
  [/Values marked proposed are instructor additions awaiting faculty confirmation\./g, 'Values marked as teaching assumptions are instructor additions.'],
  [/\(FICTIONAL, proposed\)/g, '(fictional)'],
  [/ are proposed, instructor to confirm/g, ' are teaching assumptions'],
  [/ is proposed, instructor to confirm/g, ' is a teaching assumption'],
  [/,? ?proposed, instructor to confirm/g, ', a teaching assumption'],
  [/ is proposed for /g, ' is a teaching assumption for '],
  [/ are proposed values/g, ' are teaching-assumption values'],
  [/’s are proposed\)/g, '’s are teaching assumptions)'],
  [/proposed clock times/g, 'teaching-assumption clock times'],
  [/proposed ID/g, 'teaching-assumption ID'],
  [/AeroLink values proposed/g, 'AeroLink values are teaching assumptions'],
  [/ and a proposed priority/g, ' and a priority (a teaching assumption)'],
  [/all priorities are proposed/g, 'all priorities are teaching assumptions'],
  [/Priorities proposed\./g, 'Priorities are teaching assumptions.'],
  [/\(proposed\)/g, '(teaching assumption)'],
  [/, proposed\)/g, ', teaching assumption)'],
  [/proposed = a need added/g, 'teaching assumption = a need added'],
  [/^proposed$/g, 'teaching assumption'],
  [/status is open \(instructor to confirm\)/g, 'status is open: the instructor decides'],
  [/ \(instructor to confirm\)/g, ' (the instructor’s reading)'],
]
export function studentProvenance(s: string): string {
  return PROVENANCE.reduce((t, [re, to]) => t.replace(re, to), s)
}

/** Quiz explanations name the lecture slide that taught the item; in Learn the link to the section replaces it (C27). */
export function stripSlideRefs(s: string): string {
  return s
    .replace(/\s*\((?:Session \d, slide \d+)(?:;[^)]*)?\)/g, '')
    .replace(/\s*\(Session \d, slides? [^)]*\)/g, '')
}

/** Section number as the current edition shows it ("10.4"), for cross-references written into student wording. */
const sec = (id: string) => displayNumber(id)

/** Student wording of reused Week 1 text in Learn, the Overview and the rail (review M4A F1, F3). Render-time only: the
 *  reviewed source keeps its wording for the slides, the faculty notes and the handout.
 *  - Terms (DECISION_LOG A25, FQ-2 option a): the course's MGO-002… are "objectives" for students. Only course uses are
 *    mapped; a quoted or attributed source that says "goals" (SEBoK's "mission, goals and objectives") is kept verbatim and
 *    the course term is explained next to it (OBJECTIVES_NOTE, 5.3).
 *  - Lecture pointers: "(slide 9)", "(next slide)", rubric codes "(RB-1.3)" and "Session N, slide K" are removed.
 *  - Stale cross-references to the old lesson and the live session point to the Learn section that now holds the text.
 *  The test in learn/surfaces.test.tsx scans every student surface for what this list must remove. */
const WORDING: [RegExp, string | ((...m: string[]) => string)][] = [
  // --- terms (F1)
  [/\bthe mission or a goal\b/g, 'the mission or an objective'],
  [/\bmission or goal\b/g, 'mission or objective'],
  [/\bGoal: (?=the mission)/g, 'Objective: '],
  [/\bGoals: (?=MGO-)/g, 'Objectives: '],
  [/\b([Gg])oal(:?) (\(?MGO-)/g, (_m, g, colon, rest) => `${g === 'G' ? 'O' : 'o'}bjective${colon} ${rest}`],
  [/^Goal$/, 'Objective'],
  [/^Goal \(MGO\)$/, 'Objective (MGO)'],
  [/\bthe goal it serves\b/g, 'the objective it serves'],
  [/\bconcern, goal and priority\b/g, 'concern, objective and priority'],
  [/\b([Pp])roblem, mission,? (and )?goals\b(?!,? (and )?objectives)/g, (_m, p, and) => `${p}roblem, mission${and ? ' and' : ','} objectives`],
  [/\b([Mm])ission and goals\b(?!,? (and )?objectives)/g, (_m, m) => `${m}ission and objectives`],
  [/\b([Mm])ission and its goals\b/g, (_m, m) => `${m}ission and its objectives`],
  // --- lecture pointers and internal codes (F3)
  [/\s*\((?:see )?(?:next slide|slides? \d+(?:[–-]\d+)?(?:, ?\d+)*)\)/g, ''],
  [/\s*\((?:Session \d, slides? [^)]*)\)/g, ''],
  [/\s*\(RB-\d+(?:\.\d+)?\)/g, ''],
  // --- stale references to the old lesson and the live session (F3); section numbers follow the edition (F6)
  [/ in the Session 2 lesson gives both/g, () => ` in section ${sec('ch10-04')} gives both`],
  [/concerns(\*?), which Session 2 develops/g, 'concerns$1, which chapter 7 develops'],
  [/^The session opened with a proposal to write /, 'Consider a proposal to write '],
  [/ The answer is therefore C: add other kinds of party/g, ' The remedy is therefore to add other kinds of party'],
  [/ The full table is in the lesson\./g, ''],
  [/^Session 1 ended with a register of /, 'Chapter 6 ended with a register of '],
  [/The influence × interest plot of Session 1 is /g, () => `The influence × interest plot of section ${sec('ch06-05')} is `],
  [/ drives the trade discussed under conflicts below\./g, () => ` drives the trade discussed in section ${sec('ch09-06')}.`],
  [/, taught in Session 2, are shaded/g, ', taught in chapters 8 and 9, are shaded'],
  [/^Shaded: taught in Session 2\./, 'Shaded: taught in chapters 8 and 9.'],
  [/; the brief below gives every minimum\./g, '; the My Project / Lab page gives every minimum.'],
  [/ \(debated in Session 1\)/g, () => ` (see section ${sec('ch06-04')})`],
  [/\(the audit below finds one\)/g, () => `(the audit in section ${sec('ch10-03')} finds one)`],
  [/ such as the coverage matrix below/g, () => ` such as the coverage matrix in section ${sec('ch10-03')}`],
  [/a theme that returns below in /g, () => `a theme that returns in section ${sec('ch09-05')}, in `],
  // 6.5 keeps only the last sentence of its source paragraph, so "the two" lost its referent and the list repeats 6.5's
  // first paragraph: only its new item is kept (review N4; NOT_PLACED records the cut)
  [/^The course register combines the two: [^.]*, and its level of support with a reason\./, 'The course register also records each stakeholder’s level of support, with a reason.'],
  // the 10.4 figure note means the deck's speaker notes; in Learn the sources are the footnotes (review N7)
  [/ is sourced in the notes;/g, ' is sourced in the footnotes;'],
  // 10.1 is cut from its paragraph, so its "therefore" has nothing to follow (F8)
  [/ are therefore keys that later model elements point back to/g, ' are keys that later model elements point back to'],
]
/** A quotation (“…”), kept verbatim by construction: the rules run only on the text between quotations (review N3). */
const QUOTATION = /“[^”]*”/g
export function studentWording(s: string): string {
  const quotes = s.match(QUOTATION) ?? []
  const outside = s.split(QUOTATION).map((seg, i) => WORDING.reduce((t, [re, to]) => (i > 0 && re.source.startsWith('^') ? t : t.replace(re, to as never)), seg))
  return outside.reduce((acc, seg, i) => acc + seg + (quotes[i] ?? ''), '')
}
/** Everything a student reads from reused text: provenance (LRN-07), then wording (A25, F3). */
export const studentText = (s: string) => studentWording(studentProvenance(s))

/** Figure labels drawn inside a shared SVG (FigureWording context): the student wording, with one label that must
 *  wrap to stay inside its box ("Mandatory (proposed)" becomes two lines). */
export function figureWording(s: string): string {
  return studentText(s.replace(/^(\w+) \(proposed\)$/, '$1\n(proposed)'))
    .replace(/^G(\d+)$/, 'O$1') // the short form in the "Objective" column (review N5)
    .replace(/\bG3 = MGO-003\b/, 'O3 = MGO-003')
}
