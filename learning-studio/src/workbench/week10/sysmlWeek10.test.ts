// Week 10 SysML files and the checker record, both directions:
//   - every generated file (GENERATED10_FILES) equals the file on disk: run `node scripts/build-week10-sysml.mjs` if not;
//   - the Week 10 checker report lists every .sysml under sysml/lectures/week10 and the instructor key with the file's
//     current SHA-256, PASS for every file not named invalid_*, FAIL for every invalid_* file (re-run
//     `python -I scripts/check_sysml.py sysml/lectures/week10 sysml/instructor/week10/exercise_bike_share_key.sysml
//      --report sysml/lectures/week10/week10-report.json` after any change, one checker run at a time);
//   - the generated AeroLink, fixture and collision models pass with no message at all; the stress model passes with
//     exactly the two duplicate-name warnings its Week 8 base was built to produce (inherited through Week 9);
//   - every lecture listing is an ordered, verbatim excerpt of its file (a documentation comment may be shortened with
//     "…") and states the status the checker recorded; every calibration row and predict item states its recorded result;
//   - no file a student receives (sysml/lectures/week10) carries an internal source code.
// A PASS recorded here means only that the file parsed, every name resolved and no rule fired.
import { describe, expect, it } from 'vitest'
import { CALIBRATION, LISTINGS, type Listing } from '../../content/lectures/week10/listings'
import { sha256Hex } from '../../lib/sysml'
import { GENERATED10_FILES } from './generated'
import { EXERCISE } from '../../content/week10Assessment'

type Diag = { severity: string; line: number | null; column: number | null; message: string }
type Entry = { file: string; sha256: string; status: 'PASS' | 'FAIL' | 'ERROR'; diagnostics: Diag[] }
const RAW = import.meta.glob<string>(['../../../sysml/lectures/week10/*.sysml', '../../../sysml/instructor/week10/exercise_bike_share_key.sysml'], { query: '?raw', import: 'default', eager: true })
const REPORTS = import.meta.glob<{ files: Entry[] }>('../../../sysml/lectures/week10/*-report.json', { import: 'default', eager: true })
const norm = (f: string) => f.split('\\').join('/').replace(/^.*?sysml\//, '')
const FILES: Record<string, string> = Object.fromEntries(Object.entries(RAW).map(([k, v]) => [norm(k), v]))
const read = (p: string): string => {
  const t = FILES[norm(p)]
  if (t === undefined) throw new Error(`sysml/${p} not found`)
  return t
}
const reports: Entry[] = Object.values(REPORTS).flatMap((r) => r.files)
const entry = (file: string) => reports.find((e) => norm(e.file) === norm(file))
const week10Files = Object.keys(FILES)

export function recordProblem(file: string, textSha: string, e: Entry | undefined): string | undefined {
  if (!e) return `${file}: not in the Week 10 checker report`
  if (e.sha256 !== textSha) return `${file}: changed since the checker run (re-run the checker)`
  const expected = (file.split('/').pop() ?? '').startsWith('invalid_') ? 'FAIL' : 'PASS'
  if (e.status !== expected) return `${file}: recorded ${e.status}, expected ${expected}`
  return undefined
}
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

describe('generated Week 10 files are current', () => {
  for (const f of GENERATED10_FILES())
    it(`${f.file} equals the generator output (run node scripts/build-week10-sysml.mjs if not)`, () => {
      expect(read(f.file).replace(/\r/g, '')).toBe(f.text)
    })
})

describe('the Week 10 checker report vouches for every file', () => {
  it('every .sysml under sysml/lectures/week10 and the instructor key is recorded with its current SHA-256 and the expected status', async () => {
    expect(week10Files.length).toBeGreaterThanOrEqual(17)
    const problems = await Promise.all(week10Files.map(async (f) => recordProblem(f, await sha256Hex(read(f)), entry(f))))
    expect(problems.filter(Boolean)).toEqual([])
  })
  it('the generated AeroLink, fixture and collision models pass with no message; the stress model only with its two inherited duplicate-name warnings', () => {
    for (const f of ['aerolink_logical_behavior_v03', 'labtool_team07_model_v03', 'labtool_collision_model_v03']) {
      const e = entry(`lectures/week10/${f}.sysml`)
      expect(e?.status, f).toBe('PASS')
      expect(e?.diagnostics, f).toEqual([])
    }
    const s = entry('lectures/week10/labtool_stress_model_v03.sysml')!
    expect(s.status).toBe('PASS')
    expect(s.diagnostics.map((d) => d.message)).toEqual(['Duplicate of other owned member name', 'Duplicate of other owned member name'])
  })
  it('negative direction: a changed file, a missing entry and a wrong status are each reported', async () => {
    const f = 'lectures/week10/driving_question_guard_gap.sysml'
    const e = entry(f)!
    const good = await sha256Hex(read(f))
    expect(recordProblem(f, good, e)).toBeUndefined()
    expect(recordProblem(f, await sha256Hex(read(f) + ' '), e)).toMatch(/changed since/)
    expect(recordProblem(f, good, undefined)).toMatch(/not in the Week 10 checker report/)
    expect(recordProblem(f, good, { ...e, status: 'FAIL' })).toMatch(/expected PASS/)
    expect(recordProblem('lectures/week10/invalid_x.sysml', 'abc', { ...e, sha256: 'abc', status: 'PASS' })).toMatch(/expected FAIL/)
  })
})

describe('recorded results stated on the slides are the recorded ones', () => {
  it('each calibration row states the result and the first diagnostic the checker recorded for its file', () => {
    for (const c of CALIBRATION) {
      const e = entry(c.file)!
      const warnings = e.diagnostics.filter((d) => d.severity === 'WARNING')
      const stated = e.status === 'FAIL' ? 'FAIL' : warnings.length ? 'PASS with warnings' : 'PASS'
      expect(c.result, c.file).toBe(stated)
      if (c.recorded === 'no message') expect(e.diagnostics, c.file).toEqual([])
      else expect(e.diagnostics[0].message, c.file).toBe(c.recorded)
    }
  })
  it('the predict items quote their recorded result (line and message)', () => {
    for (const id of ['predict-target', 'parallel-owned']) {
      const l = LISTINGS[id]()
      const e = entry(l.file)!
      expect(l.recorded, id).toContain(`line ${e.diagnostics[0].line}`)
      expect(l.recorded!.replace(/[‘’]/g, "'"), id).toContain(e.diagnostics[0].message)
    }
    for (const id of ['predict-two-initial', 'predict-unreachable', 'predict-parallel']) {
      expect(entry(LISTINGS[id]().file)!.diagnostics, id).toEqual([])
      expect(LISTINGS[id]().recorded).toBe('PASS, no message')
    }
  })
})

/** The course's internal source and reading codes (S06, S10, R80, R33a …). */
const INTERNAL_CODE = /\b(?:S\d{2}|R\d{2,3}[a-z]?)\b/
export const internalCodes = (text: string): string[] =>
  text
    .replace(/\r/g, '')
    .split('\n')
    .map((l, i) => (INTERNAL_CODE.test(l) ? `${i + 1}: ${l.trim()}` : ''))
    .filter(Boolean)

describe('no internal source code in a Week 10 file students receive', () => {
  const student = week10Files.filter((f) => f.startsWith('lectures/week10/'))
  it('covers every lecture file', () => expect(student.length).toBeGreaterThanOrEqual(16))
  for (const f of student) it(f, () => expect(internalCodes(read(f))).toEqual([]))
  it('negative direction: codes are detected, IDs and versions are not', () => {
    expect(internalCodes('// see S06 pp.49-50.')).toHaveLength(1)
    expect(internalCodes('// R83 p.165')).toHaveLength(1)
    expect(internalCodes("requirement <'REQ-SYS-001'> 'R2 unit'; // SysML v2.1 Beta 2, Release 2026-08")).toEqual([])
  })
})

describe('lecture listings are verbatim excerpts with the recorded status', () => {
  for (const id of Object.keys(LISTINGS))
    it(id, async () => {
      const l = LISTINGS[id]()
      const text = read(l.file)
      expect(excerptProblem(l, text)).toBeUndefined()
      const e = entry(l.file)
      expect(e, `${l.file} in the Week 10 checker report`).toBeDefined()
      expect(e!.sha256, `${l.file} unchanged since the checker run`).toBe(await sha256Hex(text))
      const warnings = e!.diagnostics.filter((d) => d.severity === 'WARNING').length
      const stated = e!.status === 'FAIL' ? 'FAIL' : warnings ? 'PASS with warnings' : 'PASS'
      expect(l.status).toBe(stated)
    })
  it('every callout points at a line of its listing', () => {
    for (const id of Object.keys(LISTINGS)) {
      const l = LISTINGS[id]()
      for (const m of l.marks ?? []) expect(l.lines[m.line - 1]?.trim(), `${id}: mark on line ${m.line}`).toBeTruthy()
    }
  })
  it('negative direction: a changed line or a reordered excerpt is detected', () => {
    const l = LISTINGS['guard-gap']()
    const text = read(l.file)
    expect(excerptProblem({ id: 'x', lines: l.lines.map((x) => x.replace('>= 8', '>= 9')) }, text)).toMatch(/not in the file/)
    expect(excerptProblem({ id: 'x', lines: [...l.lines].reverse().filter((x) => x.trim() && x.trim() !== '}') }, text)).toMatch(/not in the file/)
  })
})

describe('the applied exercise draft (task 5) is the checked file it claims to be', () => {
  it('every line of the draft is an ordered, verbatim excerpt of a file the checker accepted with no message', async () => {
    const f = 'lectures/week10/exercise_draft_return_ride.sysml'
    expect(excerptProblem({ id: 'exercise-draft', lines: EXERCISE.fragment }, read(f))).toBeUndefined()
    const e = entry(f)!
    expect(e.status).toBe('PASS')
    expect(e.diagnostics).toEqual([])
    expect(e.sha256).toBe(await sha256Hex(read(f)))
  })
})
