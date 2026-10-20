// Week 8 SysML files and the checker record, both directions:
//   - every generated file (GENERATED_FILES) equals the file on disk: run `node scripts/build-week08-sysml.mjs` if not;
//   - the Week 8 checker report lists every .sysml under sysml/lectures/week08 and sysml/instructor/week08 with the
//     file's current SHA-256, PASS for every file not named invalid_*, FAIL for every invalid_* file (re-run
//     `python -I scripts/check_sysml.py sysml/lectures/week08 sysml/instructor/week08 <reused week09 files>
//      --report sysml/lectures/week08/week08-report.json` after any change, one checker run at a time);
//   - every lecture listing is a verbatim excerpt of its file (documentation text may be elided as "… */") and states
//     the status the checker recorded for that file;
//   - a listing shown beside recorded checker output (the applied exercise, task 5(b); the tool-proof fail figure) is
//     numbered with the file's own lines, and every line:column of the recorded output lands on the token it names,
//     on the defect line the instructor key names;
//   - no file a student receives (sysml/lectures/week08, the checker-page downloads) carries an internal source code.
// A PASS recorded here means only that the file parsed, every name resolved and no rule fired.
import { describe, expect, it } from 'vitest'
import { LISTINGS, type Listing } from '../../content/lectures/week08/listings'
import { sha256Hex } from '../../lib/sysml'
import { GENERATED_FILES } from './generated'
import { DOWNLOADS } from '../../content/lab/week08Checker'

type Diag = { severity: string; line: number | null; column: number | null }
type Entry = { file: string; sha256: string; status: 'PASS' | 'FAIL' | 'ERROR'; diagnostics: Diag[] }
// The files as Vite reads them (raw, byte-for-byte text), including the instructor keys the app bundle excludes.
const RAW = import.meta.glob<string>(['../../../sysml/lectures/week08/*.sysml', '../../../sysml/instructor/week08/*.sysml', '../../../sysml/week09/*.sysml', '../../../sysml/reference/*.sysml'], { query: '?raw', import: 'default', eager: true })
const REPORTS = import.meta.glob<{ files: Entry[] }>('../../../sysml/lectures/week08/*-report.json', { import: 'default', eager: true })
const norm = (f: string) => f.split('\\').join('/').replace(/^.*?sysml\//, '')
const FILES: Record<string, string> = Object.fromEntries(Object.entries(RAW).map(([k, v]) => [norm(k), v]))
const read = (p: string): string => {
  const t = FILES[norm(p)]
  if (t === undefined) throw new Error(`sysml/${p} not found`)
  return t
}
const reports: Entry[] = Object.values(REPORTS).flatMap((r) => r.files)
const entry = (file: string) => reports.find((e) => norm(e.file) === norm(file))
const week8Files = Object.keys(FILES).filter((f) => f.startsWith('lectures/week08/') || f.startsWith('instructor/week08/'))

/** Why a recorded entry does not vouch for a file's current text, or undefined when it does. */
export function recordProblem(file: string, textSha: string, e: Entry | undefined): string | undefined {
  if (!e) return `${file}: not in the Week 8 checker report`
  if (e.sha256 !== textSha) return `${file}: changed since the checker run (re-run the checker)`
  const expected = (file.split('/').pop() ?? '').startsWith('invalid_') ? 'FAIL' : 'PASS'
  if (e.status !== expected) return `${file}: recorded ${e.status}, expected ${expected}`
  return undefined
}

/** Why a listing is not an ordered, verbatim excerpt of `fileText`, or undefined when it is. */
export function excerptProblem(l: Pick<Listing, 'id' | 'lines'>, fileText: string): string | undefined {
  const fileLines = fileText.replace(/\r/g, '').split('\n').map((x) => x.trim())
  let at = 0
  for (const raw of l.lines) {
    const line = raw.trim()
    if (!line) continue
    const re = new RegExp(`^${line.split('…').map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`)
    const i = fileLines.findIndex((f, k) => k >= at && re.test(f))
    if (i < 0) return `${l.id}: “${line}” is not in the file (after line ${at})`
    at = i + 1
  }
  return undefined
}

describe('generated Week 8 files are current', () => {
  for (const f of GENERATED_FILES())
    it(`${f.file} equals the generator output (run node scripts/build-week08-sysml.mjs if not)`, () => {
      expect(read(f.file).replace(/\r/g, '')).toBe(f.text)
    })
})

describe('the Week 8 checker report vouches for every file', () => {
  it('every .sysml under sysml/lectures/week08 and sysml/instructor/week08 is recorded with its current SHA-256 and the expected status', async () => {
    expect(week8Files.length).toBeGreaterThanOrEqual(10)
    const problems = await Promise.all(week8Files.map(async (f) => recordProblem(f, await sha256Hex(read(f)), entry(f))))
    expect(problems.filter(Boolean)).toEqual([])
  })
  it('the generated name-collision probe passes with no message at all (every collision was renamed, none left to warn about)', () => {
    const e = entry('lectures/week08/labtool_collision_model_v01.sysml')
    expect(e?.status).toBe('PASS')
    expect(e?.diagnostics).toEqual([])
  })
  it('negative direction: a changed file, a missing entry and a wrong status are each reported', async () => {
    const f = 'lectures/week08/tool_proof_pass.sysml'
    const e = entry(f)!
    const good = await sha256Hex(read(f))
    expect(recordProblem(f, good, e)).toBeUndefined()
    expect(recordProblem(f, await sha256Hex(read(f) + ' '), e)).toMatch(/changed since/)
    expect(recordProblem(f, good, undefined)).toMatch(/not in the Week 8 checker report/)
    expect(recordProblem(f, good, { ...e, status: 'FAIL' })).toMatch(/expected PASS/)
    expect(recordProblem('lectures/week08/invalid_x.sysml', 'abc', { ...e, sha256: 'abc', status: 'PASS' })).toMatch(/expected FAIL/)
  })
})

type Cited = { file: string; columnsOnPage: boolean; tokens: Record<string, string>; defects: Record<number, RegExp> }
/** The token each recorded diagnostic points at (file line:column, a tab counting as one column), and the defect line
 *  each defect's own diagnostics name. Written from the files by hand, so a re-numbered display or a stale report fails
 *  here rather than in a student's reading. */
const CITED: Record<string, Cited> = {
  'exercise-seeded': {
    file: 'lectures/week08/invalid_exercise_microgrid_seeded.sysml',
    columnsOnPage: true,
    tokens: { '5:2': 'import', '5:21': '::', '8:15': '-002>', '8:21': "'Student residents'", '18:1': '}', '11:24': 'Boolean', '11:3': 'attribute islanded', '16:27': "'STK-002'", '16:3': 'stakeholder residents' },
    defects: { 5: /^\timport ScalarValues::\*;$/, 8: /<STK-002>/ },
  },
  'tool-proof-fail': {
    file: 'lectures/week08/invalid_tool_proof_unquoted_id.sysml',
    columnsOnPage: false,
    tokens: { '9:12': '-001>', '9:18': 'roadNetwork' },
    defects: { 9: /<EXT-001>/ },
  },
}

/** Why a numbered listing does not show each recorded diagnostic where the checker put it, or undefined. */
export function citationProblem(l: Pick<Listing, 'id' | 'lines' | 'firstLine'>, diags: Diag[], fileText: string, c: Cited): string | undefined {
  const first = l.firstLine
  if (first === undefined) return `${l.id}: not numbered with the file's lines`
  const file = fileText.replace(/\r/g, '').split('\n')
  const at = diags.filter((d) => d.line !== null).map((d) => `${d.line}:${d.column}`)
  const missing = Object.keys(c.tokens).filter((k) => !at.includes(k))
  if (missing.length) return `${l.id}: expected diagnostics not in the report: ${missing.join(', ')}`
  for (const d of diags) {
    if (d.line === null || d.column === null) continue
    const key = `${d.line}:${d.column}`
    const shown = l.lines[d.line - first]
    if (shown === undefined) return `${l.id}: ${key} is not on a displayed line`
    const fileLine = file[d.line - 1] ?? ''
    if (shown.trim() !== fileLine.trim()) return `${l.id}: displayed line ${d.line} is not line ${d.line} of the file`
    if (c.columnsOnPage && shown !== fileLine) return `${l.id}: displayed line ${d.line} does not keep the file's columns`
    const token = c.tokens[key]
    if (token === undefined) return `${l.id}: ${key} has no expected token (a new diagnostic?)`
    if (!fileLine.slice(d.column - 1).startsWith(token)) return `${l.id}: ${key} does not point at “${token}”`
  }
  for (const [line, re] of Object.entries(c.defects)) if (!re.test(l.lines[Number(line) - first] ?? '')) return `${l.id}: displayed line ${line} is not the defect line`
  return undefined
}

describe('recorded checker output lines up with the listing shown beside it', () => {
  for (const [id, c] of Object.entries(CITED))
    it(id, () => {
      const l = LISTINGS[id]()
      expect(l.file).toBe(c.file)
      expect(citationProblem(l, entry(c.file)!.diagnostics, read(c.file), c)).toBeUndefined()
    })
  it('the instructor key cites exactly the recorded line:column pairs of the seeded file', () => {
    const key = read('instructor/week08/exercise_microgrid_key.sysml').replace(/\r/g, '')
    const comments = key
      .split('\n')
      .filter((x) => x.startsWith('//'))
      .join('\n')
    const cited = new Set([...comments.matchAll(/\b\d+:\d+\b/g)].map((m) => m[0]))
    const recorded = new Set(entry(CITED['exercise-seeded'].file)!.diagnostics.map((d) => `${d.line}:${d.column}`))
    expect([...cited].sort()).toEqual([...recorded].sort())
  })
  it('negative direction: the old display (header stripped, tabs widened, unnumbered) and a moved diagnostic are detected', () => {
    const c = CITED['exercise-seeded']
    const text = read(c.file)
    const raw = text.replace(/\r/g, '').split('\n')
    const diags = entry(c.file)!.diagnostics
    expect(citationProblem({ id: 'x', lines: raw, firstLine: 1 }, diags, text, c)).toBeUndefined()
    expect(citationProblem({ id: 'x', lines: raw.filter((x) => !x.trim().startsWith('//')), firstLine: 1 }, diags, text, c)).toMatch(/not line|not on a displayed line/)
    expect(citationProblem({ id: 'x', lines: raw.map((x) => x.replace(/\t/g, '    ')), firstLine: 1 }, diags, text, c)).toMatch(/columns/)
    expect(citationProblem({ id: 'x', lines: raw }, diags, text, c)).toMatch(/not numbered/)
    expect(citationProblem({ id: 'x', lines: raw, firstLine: 1 }, diags.map((d) => (d.line === 5 && d.column === 2 ? { ...d, column: 9 } : d)), text, c)).toMatch(/not in the report/)
    expect(citationProblem({ id: 'x', lines: raw, firstLine: 1 }, [...diags, { severity: 'ERROR', line: 12, column: 3 }], text, c)).toMatch(/no expected token/)
  })
})

/** The course's internal source and reading codes (S06, S10, R80, R33a …): they mean nothing to a student, so a file a
 *  student can download or that ships in the student bundle must name its source in words. */
const INTERNAL_CODE = /\b(?:S\d{2}|R\d{2}[a-z]?)\b/
export const internalCodes = (text: string): string[] =>
  text
    .replace(/\r/g, '')
    .split('\n')
    .map((l, i) => (INTERNAL_CODE.test(l) ? `${i + 1}: ${l.trim()}` : ''))
    .filter(Boolean)

describe('no internal source code in a Week 8 file students receive', () => {
  // everything under sysml/lectures/week08 ships in the student bundle (src/lib/sysml.ts excludes only sysml/instructor);
  // the .sysml downloads of the checker page are listed separately so a new download outside that folder is covered too
  const student = [...week8Files.filter((f) => f.startsWith('lectures/week08/')).map((f) => ({ name: f, text: read(f) })), ...DOWNLOADS.filter((d) => d.name.endsWith('.sysml')).map((d) => ({ name: `download ${d.name}`, text: d.text() }))]
  it('covers the lecture files and both tool-proof downloads', () => {
    expect(student.length).toBeGreaterThanOrEqual(12)
    expect(student.filter((s) => s.name.startsWith('download ')).map((s) => s.name)).toEqual(['download tool_proof_pass.sysml', 'download invalid_tool_proof_unquoted_id.sysml'])
  })
  for (const s of student) it(s.name, () => expect(internalCodes(s.text)).toEqual([]))
  it('negative direction: the codes the review found are detected, IDs and versions are not', () => {
    expect(internalCodes("// a quoted short name <'EXT-001'> (S06 pp.49-50).")).toHaveLength(1)
    expect(internalCodes('// CC BY 4.0 (S10).\n// R33a slide 4')).toHaveLength(2)
    expect(internalCodes("part def <'REL-001'> 'R2 unit'; // SysML v2.1 Beta 2, Release 2026-08, STK-010")).toEqual([])
  })
})

describe('lecture listings are verbatim excerpts with the recorded status', () => {
  for (const id of Object.keys(LISTINGS))
    it(id, async () => {
      const l = LISTINGS[id]()
      const text = read(l.file)
      expect(excerptProblem(l, text)).toBeUndefined()
      const e = entry(l.file)
      expect(e, `${l.file} in a Week 8 checker report`).toBeDefined()
      expect(e!.sha256, `${l.file} unchanged since the checker run`).toBe(await sha256Hex(text))
      const warnings = e!.diagnostics.filter((d) => d.severity === 'WARNING').length
      const stated = e!.status === 'FAIL' ? 'FAIL' : warnings ? 'PASS with warnings' : 'PASS'
      expect(l.status).toBe(stated)
    })
  it('negative direction: a changed line or a reordered excerpt is detected', () => {
    const l = LISTINGS['warmup']()
    const text = read(l.file)
    expect(excerptProblem({ id: 'x', lines: l.lines.map((x) => x.replace('[4]', '[5]')) }, text)).toMatch(/not in the file/)
    expect(excerptProblem({ id: 'x', lines: [...l.lines].reverse().filter((x) => x.trim() && x.trim() !== '}') }, text)).toMatch(/not in the file/)
  })
})
