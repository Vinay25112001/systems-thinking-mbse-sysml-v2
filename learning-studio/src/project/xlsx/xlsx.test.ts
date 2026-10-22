// Excel stakeholder import (directive §13; spec §j; M6): the reader as untrusted input (limits, malformed and hostile
// packages, formulas never run), the deterministic mapping (confidence, ambiguity, student correction), preview with
// duplicates and required-field validation, and the single-transaction commit with provenance and rollback.
import { describe, expect, it } from 'vitest'
import { strToU8, zipSync } from 'fflate'
import { fromTeamRecord, toTeamRecord } from '../adapters/week1'
import { applyOps } from '../model/ops'
import { emptyProject } from '../model/create'
import { MemoryAdapter } from '../store/memory'
import { ProjectStore } from '../store/ProjectStore'
import { TEAM_FIXTURE } from '../../workbench/week1/teamFixture'
import { stakeholderRowIssues } from '../../workbench/week1/team'
import { readWorkbook, XLSX_LIMITS } from './reader'
import { readZipDirectory } from './zip'
import { correctMapping, mappingSummary, normalizeHeader, normalizeValue, proposeMapping, suggestSheet } from './mapping'
import { buildPreview, importOps, nameSimilarity, rowStatus, summarize } from './importPlan'
import { buildXlsx, SAMPLE_SHEETS } from './testWorkbook'
import { activeProvider } from './ai'
import { scanXml } from './xml'

const stamp = { at: '2026-10-21T10:00:00.000Z', by: 'JS', change: 'CHG-000900' }
const sample = () => buildXlsx(SAMPLE_SHEETS)
const read = (b: Uint8Array) => {
  const r = readWorkbook(b)
  if (!r.ok) throw new Error(r.error)
  return r
}
const plan = (doc = emptyProject({ teamLabel: '07', initials: 'JS' })) => {
  const wb = read(sample())
  const sheet = wb.sheets[suggestSheet(wb.sheets)]
  let cols = proposeMapping(sheet.rows[0], sheet.rows.slice(1))
  const reason = cols.find((c) => c.header === 'Reason')!
  cols = correctMapping(cols, reason.index, 'interestReason')
  const existing = toTeamRecord(doc).stakeholders.map((s) => ({ id: s.id, name: s.name }))
  const rows = buildPreview(sheet, cols, existing, { splitConcerns: true })
  return { doc, wb, sheet, cols, rows }
}

describe('reader: untrusted .xlsx input', () => {
  it('lists every sheet with its rows, reads shared and inline strings, numbers and booleans', () => {
    const wb = read(buildXlsx([{ name: 'A', rows: [['h1', 'h2', 'h3'], [{ inline: 'x & y' }, 7, 'z']] }, { name: 'B', rows: [['only']], hidden: true }]))
    expect(wb.sheets.map((s) => [s.name, s.hidden, s.rows.length])).toEqual([['A', false, 2], ['B', true, 1]])
    expect(wb.sheets[0].rows[1]).toEqual(['x & y', '7', 'z'])
    expect(wb.sheets[0].rowNumbers).toEqual([1, 2])
  })
  it('formulas are never evaluated: the stored value is used and flagged; a formula without a stored value reads empty', () => {
    const wb = read(buildXlsx([{ name: 'S', rows: [['a', 'b'], [{ f: 'SUM(1,2)', v: 999 }, { f: 'NOW()' }]] }]))
    const s = wb.sheets[0]
    expect(s.rows[1]).toEqual(['999', '']) // 999 is what the file stored; SUM(1,2) would be 3
    expect(s.flags).toEqual({ '1:0': 'formula', '1:1': 'formula-no-value' })
  })
  it('error cells read as empty and are flagged; overlong cells are cut to 4,000 characters and flagged', () => {
    const wb = read(buildXlsx([{ name: 'S', rows: [['a', 'b'], [{ e: '#DIV/0!' }, 'x'.repeat(5000)]] }]))
    expect(wb.sheets[0].rows[1][0]).toBe('')
    expect(wb.sheets[0].rows[1][1]).toHaveLength(XLSX_LIMITS.maxCellChars)
    expect(wb.sheets[0].flags).toEqual({ '1:0': 'error', '1:1': 'truncated' })
  })
  it('oversized files, too many sheets, rows beyond the limit and columns beyond the limit', () => {
    const big = new Uint8Array(XLSX_LIMITS.maxFileBytes + 1)
    big.set([0x50, 0x4b, 0x03, 0x04])
    expect(readWorkbook(big)).toMatchObject({ ok: false, error: expect.stringMatching(/at most 5 MB/) })
    const many = buildXlsx(Array.from({ length: 51 }, (_, i) => ({ name: `S${i}`, rows: [['x']] })))
    expect(readWorkbook(many)).toMatchObject({ ok: false, error: expect.stringMatching(/51 sheets; at most 50/) })
    const rows = Array.from({ length: XLSX_LIMITS.maxRows + 5 }, (_, i) => [`r${i}`])
    const long = read(buildXlsx([{ name: 'S', rows }]))
    expect(long.sheets[0].rows).toHaveLength(XLSX_LIMITS.maxRows)
    expect(long.sheets[0].rowsNotRead).toBe(5)
    const wide = read(buildXlsx([{ name: 'S', rows: [Array.from({ length: 55 }, (_, i) => `c${i}`)] }]))
    expect(wide.sheets[0].rows[0]).toHaveLength(XLSX_LIMITS.maxCols)
    expect(wide.sheets[0].colsNotRead).toBe(5)
  })
  it('malformed packages fail with a message and return nothing: not a zip, a truncated zip, a damaged part, missing workbook', () => {
    expect(readWorkbook(strToU8('name,role\nA,user'))).toMatchObject({ ok: false, error: expect.stringMatching(/not an \.xlsx workbook/) })
    const ok = sample()
    expect(readWorkbook(ok.slice(0, Math.floor(ok.length / 2)))).toMatchObject({ ok: false })
    const noWb = zipSync({ '[Content_Types].xml': strToU8('<Types/>') })
    expect(readWorkbook(noWb)).toMatchObject({ ok: false, error: expect.stringMatching(/workbook part is missing/) })
    const badXml = buildXlsx([{ name: 'S', rows: [['a']] }], { extra: { 'xl/worksheets/sheet1.xml': '<worksheet><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c></row></sheetData' } })
    expect(readWorkbook(badXml)).toMatchObject({ ok: false, error: expect.stringMatching(/not closed/) })
  })
  it('refuses macros, document type declarations (no entity expansion) and encrypted packages', () => {
    expect(readWorkbook(buildXlsx([{ name: 'S', rows: [['a']] }], { macro: true }))).toMatchObject({ ok: false, error: expect.stringMatching(/macros/) })
    const xxe = buildXlsx([{ name: 'S', rows: [['a']] }], { extra: { 'xl/sharedStrings.xml': '<!DOCTYPE x [<!ENTITY e SYSTEM "file:///etc/passwd">]><sst><si><t>&e;</t></si></sst>' } })
    expect(readWorkbook(xxe)).toMatchObject({ ok: false, error: expect.stringMatching(/document type or entities/) })
    const enc = sample().slice()
    // set the "encrypted" flag of the first central-directory entry
    for (let i = 0; i < enc.length - 4; i++)
      if (enc[i] === 0x50 && enc[i + 1] === 0x4b && enc[i + 2] === 0x01 && enc[i + 3] === 0x02) {
        enc[i + 8] |= 1
        break
      }
    expect(readWorkbook(enc)).toMatchObject({ ok: false, error: expect.stringMatching(/password-protected/) })
  })
  it('ZIP bomb guard: declared sizes above 50 MB are refused before inflating; an entry that inflates past its declared size is stopped', () => {
    const lying = zipSync({ 'xl/workbook.xml': new Uint8Array(200_000) }, { level: 9 })
    // patch the declared uncompressed size of the entry (central directory) down to 10 bytes
    const b = lying.slice()
    for (let i = 0; i < b.length - 4; i++) if (b[i] === 0x50 && b[i + 1] === 0x4b && b[i + 2] === 0x01 && b[i + 3] === 0x02) { b[i + 24] = 10; b[i + 25] = 0; b[i + 26] = 0; b[i + 27] = 0 }
    const withTypes = readWorkbook(b)
    expect(withTypes.ok).toBe(false)
    expect(() => readZipDirectory(b, { maxEntries: 10, maxTotalUncompressed: 5 })).toThrow(/possible ZIP bomb/)
    // a real compressed part that inflates past the per-file budget
    const huge = buildXlsx([{ name: 'S', rows: [['a']] }], { extra: { 'xl/worksheets/sheet1.xml': `<worksheet><sheetData>${'<row/>'.repeat(2_000_000)}</sheetData></worksheet>` } })
    expect(readWorkbook(huge, { ...XLSX_LIMITS, maxUncompressed: 1024 * 1024 })).toMatchObject({ ok: false, error: expect.stringMatching(/ZIP bomb|expands/) })
  })
  it('stops at its deadline', () => {
    let t = 0
    const r = readWorkbook(sample(), { ...XLSX_LIMITS, timeMs: 1 }, () => (t += 5))
    expect(r).toMatchObject({ ok: false, error: expect.stringMatching(/longer than/) })
  })
  it('xml scanner: entities decoded, comments and CDATA handled, unquoted attributes refused', () => {
    const texts: string[] = []
    scanXml('<a x="1 &amp; 2"><!-- c --><b>&lt;t&gt;&#65;</b><![CDATA[<raw>]]></a>', { text: (t) => texts.push(t) })
    expect(texts.join('')).toBe('<t>A<raw>')
    expect(() => scanXml('<a x=1/>', {})).toThrow(/not quoted/)
  })
})

describe('M6 review fixes: quotes, local headers, formula-like text, merge IDs, the import’s own restore point', () => {
  it('M-1: an apostrophe inside a double-quoted attribute and a double quote inside a single-quoted one are text', () => {
    const wb = read(buildXlsx([{ name: "Bob's list", rows: [['Stakeholder'], ['A']] }, { name: `Members' "quoted" register`, rows: [['x']] }]))
    expect(wb.sheets.map((s) => s.name)).toEqual(["Bob's list", `Members' "quoted" register`])
    const dv = buildXlsx([{ name: 'S', rows: [['Stakeholder'], ['A']] }], { extra: { 'xl/worksheets/sheet1.xml': `<worksheet><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Stakeholder</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>A</t></is></c></row></sheetData><dataValidations count="1"><dataValidation type="list" prompt="Don't leave it empty > choose one" error='Say "yes" or "no"' sqref="B2"><formula1>"yes,no"</formula1></dataValidation></dataValidations></worksheet>` } })
    expect(read(dv).sheets[0].rows).toEqual([['Stakeholder'], ['A']])
    const attrs: Record<string, string>[] = []
    scanXml(`<a x="it's > here" y='say "hi" >'/><b z="1"/>`, { open: (_n, a) => attrs.push(a) })
    expect(attrs).toEqual([{ x: "it's > here", y: 'say "hi" >' }, { z: '1' }])
    expect(() => scanXml('<a x="never closed>', {})).toThrow(/not closed/)
  })
  it('M-1 fuzz: random tags with quotes, apostrophes and ">" either parse to the written attributes or fail with a message, in linear time', () => {
    let seed = 7
    const rnd = (n: number) => ((seed = (seed * 1103515245 + 12345) % 2147483648) % n)
    const pieces = ["'", '"', '>', 'a', ' ', '<', '&amp;']
    for (let k = 0; k < 300; k++) {
      const value = Array.from({ length: 1 + rnd(12) }, () => pieces[rnd(pieces.length)]).join('').replace(/</g, '&lt;')
      const q = value.includes('"') ? "'" : '"'
      const safe = value.replace(new RegExp(q, 'g'), '')
      const got: Record<string, string>[] = []
      scanXml(`<t v=${q}${safe}${q}/>`, { open: (_n, a) => got.push(a) })
      expect(got[0].v).toBe(safe.replace(/&amp;/g, '&').replace(/&lt;/g, '<'))
    }
    const t0 = Date.now()
    expect(() => scanXml(`<a x="${'>'.repeat(200_000)}`, {})).toThrow()
    expect(Date.now() - t0).toBeLessThan(500)
  })
  it('L-3: a local file header that names another part than the directory is refused', () => {
    const b = sample().slice()
    const enc = new TextEncoder()
    // rename the first local header's file name (same length) without touching the directory
    for (let i = 0; i < b.length - 4; i++)
      if (b[i] === 0x50 && b[i + 1] === 0x4b && b[i + 2] === 0x03 && b[i + 3] === 0x04) {
        const len = b[i + 26] | (b[i + 27] << 8)
        b.set(enc.encode('x'.repeat(len)), i + 30)
        break
      }
    expect(readWorkbook(b)).toMatchObject({ ok: false, error: expect.stringMatching(/does not match its directory entry/) })
  })
  it('L-4: text that looks like a formula is kept as text and flagged', () => {
    const wb = read(buildXlsx([{ name: 'S', rows: [['Stakeholder', 'Concerns', 'Interest'], ["=cmd|' /C calc'!A0", '+1 more noise', '3']] }]))
    const cols = proposeMapping(wb.sheets[0].rows[0], wb.sheets[0].rows.slice(1))
    const rows = buildPreview(wb.sheets[0], cols, [], { splitConcerns: false })
    expect(rows[0].values.name).toBe("=cmd|' /C calc'!A0")
    expect(rows[0].issues.filter((x) => x.kind === 'formula-text').map((x) => x.field)).toEqual(['name', 'concerns'])
    expect(rowStatus(rows[0])).toBe('formula')
  })
  it('L-8: a merge issues concern IDs only for the concerns it adds', () => {
    const doc = fromTeamRecord({ ...TEAM_FIXTURE, stakeholders: [{ ...TEAM_FIXTURE.stakeholders[0], name: 'Library members', concerns: [{ id: 'CON-001', text: 'Members find popular tools already booked on Saturday mornings.' }] }] }).doc
    const p = plan(doc)
    p.rows[0].choice = 'merge'
    p.rows[0].mergeInto = 'STK-001'
    for (const r of p.rows.slice(1)) r.choice = 'skip'
    const { ops, createdIds } = importOps(doc, p.rows, { file: 'f.xlsx', sha256: null, size: 1, sheet: 'Stakeholders', at: stamp.at, mapping: p.cols }, stamp)
    expect(createdIds).toEqual([])
    expect(applyOps(doc, ops, stamp).ok).toBe(true)
  })
  it('H-1 (browser storage): the import returns the restore point it wrote; undo uses exactly it, not an older pre-import or manual version', async () => {
    const store = new ProjectStore(new MemoryAdapter(), { startEmpty: true })
    await store.init()
    await store.create({ teamLabel: '07', initials: 'JS' })
    const { rows, cols, sheet } = plan(store.getState().doc!)
    const src = (st: { at: string }) => ({ file: 'f.xlsx', sha256: null, size: 1, sheet: sheet.name, at: st.at, mapping: cols, importId: crypto.randomUUID() })
    const first = await store.importMerge((doc, st) => importOps(doc, rows, src(st), st).ops, 'first import')
    await store.saveVersion('my manual version')
    const keep = Object.values(store.getState().doc!.artifacts).filter((a) => a.type === 'STK').length
    const second = await store.importMerge((doc, st) => importOps(doc, rows, src(st), st).ops, 'second import')
    expect(first.ok && second.ok).toBe(true)
    const ids = store.getState().snapshots.map((s) => s.id)
    expect(second.preImport).toBe(ids[ids.length - 1])
    expect(second.preImport).not.toBe(first.preImport)
    expect((await store.restore(second.preImport!, 'undo')).ok).toBe(true)
    expect(Object.values(store.getState().doc!.artifacts).filter((a) => a.type === 'STK' && a.status === 'active')).toHaveLength(keep)
    const created = Object.values(store.getState().doc!.artifacts).find((a) => a.type === 'STK')!
    expect((created.attributes.import as Record<string, unknown>).importId).toMatch(/^[0-9a-f-]{36}$/)
  })
})

describe('mapping: deterministic heuristics, confidence, ambiguity, student correction', () => {
  it('normalises headers and proposes the sample mapping with High confidence; a plain “Reason” next to both ratings is ambiguous', () => {
    expect(normalizeHeader(' Interest (1-5) ')).toBe('interest')
    expect(normalizeHeader('Concerns')).toBe('concern')
    const wb = read(sample())
    expect(suggestSheet(wb.sheets)).toBe(1)
    const s = wb.sheets[1]
    const cols = proposeMapping(s.rows[0], s.rows.slice(1))
    const by = Object.fromEntries(cols.map((c) => [c.header, c]))
    expect(by.Stakeholder).toMatchObject({ selected: 'name', confidence: 'high' })
    expect(by.Category).toMatchObject({ selected: 'role', confidence: 'high' })
    expect(by['Interest (1-5)']).toMatchObject({ selected: 'interest', confidence: 'high' })
    expect(by.Reason).toMatchObject({ selected: null, ambiguous: ['interestReason', 'influenceReason'] })
    expect(by.Reason.reason).toMatch(/Ambiguous: choose one/)
    expect(mappingSummary(cols)).toMatchObject({ missingRequired: [], missingCourse: ['interestReason'] })
  })
  it('“Reason” resolves deterministically when only one rating column exists; token overlap is Medium; value patterns are Low and never selected', () => {
    const c1 = proposeMapping(['Name', 'Interest', 'Reason'], [['A', '3', 'x']])
    expect(c1[2]).toMatchObject({ selected: 'interestReason', confidence: 'medium' })
    const c2 = proposeMapping(['Who is it', 'Main concern area'], [['A', 'b']])
    expect(c2[1]).toMatchObject({ selected: 'concerns', confidence: 'medium' })
    const c3 = proposeMapping(['Name', 'Col B'], [['A', '3'], ['B', '4']])
    expect(c3[1]).toMatchObject({ selected: null, confidence: 'none' })
    expect(c3[1].candidates[0]).toMatchObject({ confidence: 'low' })
  })
  it('two columns for one field: ambiguous, nothing selected; the student chooses and the choice is recorded and releases the other column', () => {
    let cols = proposeMapping(['Stakeholder', 'Name'], [['A', 'B']])
    expect(cols.map((c) => c.selected)).toEqual([null, null])
    expect(cols[0].reason).toMatch(/2 columns match/)
    cols = correctMapping(cols, 1, 'name')
    expect(cols[1]).toMatchObject({ selected: 'name', correctedByStudent: true })
    cols = correctMapping(cols, 0, 'name')
    expect(cols.map((c) => c.selected)).toEqual(['name', null])
  })
  it('partial mapping: required name missing is reported; unmapped columns will not be imported', () => {
    const cols = proposeMapping(['Category', 'Whatever'], [['user', 'x']])
    const sum = mappingSummary(cols)
    expect(sum.missingRequired).toEqual(['name'])
    expect(sum.unmapped.map((c) => c.header)).toEqual(['Whatever'])
  })
  it('values: synonyms normalise; an unrecognised value is flagged and left empty, never guessed', () => {
    expect(normalizeValue('role', 'Regulator')).toEqual({ value: 'authority', ok: true })
    expect(normalizeValue('stage', 'operations')).toEqual({ value: 'Operation', ok: true })
    expect(normalizeValue('interest', 'high')).toMatchObject({ value: '', ok: false })
    expect(normalizeValue('interest', '4.0')).toEqual({ value: '4', ok: true })
    expect(normalizeValue('support', 'buy-in')).toEqual({ value: '3', ok: true })
    expect(normalizeValue('approving', 'maybe')).toMatchObject({ ok: false })
  })
  it('the AI provider is defined and disabled; it returns nothing', async () => {
    const p = activeProvider()
    expect(p.enabled).toBe(false)
    expect(await p.suggest({ headers: ['a'], samples: [['b']] })).toEqual([])
  })
})

describe('preview, duplicates, validation and commit', () => {
  it('preview flags formulas, unrecognised values, missing names and course-required fields; splits multi-concern cells', () => {
    const { rows } = plan()
    expect(rows).toHaveLength(6)
    expect(rows.map(rowStatus)).toEqual(['ready', 'ready', 'formula', 'not-recognised', 'duplicate', 'missing-required'])
    expect(rows[2].values.interest).toBe('4')
    expect(rows[3].values.interest ?? '').toBe('') // 'high' is not a rating: flagged, left empty
    expect(rows[3].concerns).toHaveLength(2)
    expect(rows[5].choice).toBe('skip')
  })
  it('duplicates within the file and against the register (exact and ≥ 0.85 similar); exact duplicates are skipped by default', () => {
    const { rows } = plan()
    expect(rows[4].duplicate).toMatchObject({ kind: 'file', row: 2, exact: true })
    expect(rows[4].choice).toBe('skip')
    expect(nameSimilarity('County health department', 'County health dept')).toBeLessThan(0.85)
    const doc = fromTeamRecord({ ...TEAM_FIXTURE, stakeholders: [{ ...TEAM_FIXTURE.stakeholders[0], name: 'The library members' }] }).doc
    const p2 = plan(doc)
    expect(p2.rows[0].duplicate).toMatchObject({ kind: 'existing', id: 'STK-001', exact: true })
  })
  it('commit: one change set, IDs from the project counters, provenance on every artifact, interest never invented', () => {
    const { doc, rows, cols, sheet } = plan()
    const src = { file: 'stakeholders.xlsx', sha256: 'abc', size: 1234, sheet: sheet.name, at: '2026-10-21T10:00:00.000Z', mapping: cols }
    expect(summarize(rows)).toMatchObject({ created: 4, skipped: 2 })
    const { ops, createdIds } = importOps(doc, rows, src, stamp)
    const res = applyOps(doc, ops, stamp)
    if (!res.ok) throw new Error(res.error)
    expect(createdIds.filter((x) => x.startsWith('STK'))).toEqual(['STK-001', 'STK-002', 'STK-003', 'STK-004'])
    const stk = Object.values(res.doc.artifacts).filter((a) => a.type === 'STK')
    for (const a of stk) {
      expect(a.provenance).toMatchObject({ kind: 'imported', from: { format: 'xlsx', file: 'stakeholders.xlsx', sha256: 'abc' } })
      expect(a.attributes.import).toMatchObject({ file: 'stakeholders.xlsx', sheet: 'Stakeholders', at: src.at, mapping: { name: 'Stakeholder', interestReason: 'Reason (chosen by the student)' } })
    }
    const partner = stk.find((a) => a.title === 'Hardware store partner')!
    expect(partner.attributes.importRow).toBe('Stakeholders!row 5')
    expect(partner.attributes.interest ?? null).toBeNull() // "high" was not a rating: left empty, never invented
    const rec = toTeamRecord(res.doc)
    expect(stakeholderRowIssues(rec.stakeholders.find((s) => s.name === 'Hardware store partner')!).join(' ')).toMatch(/level of interest/)
    expect(rec.stakeholders.find((s) => s.name === 'Hardware store partner')!.concerns).toHaveLength(2)
    expect(rec.stakeholders.find((s) => s.name === 'Library members')).toMatchObject({ role: 'user', interest: '5', interestReason: 'They borrow tools every week' })
  })
  it('merge fills only empty fields of the existing stakeholder and records the contribution', () => {
    const doc = fromTeamRecord({ ...TEAM_FIXTURE, stakeholders: [{ ...TEAM_FIXTURE.stakeholders[0], name: 'Library members', interest: '', interestReason: '', role: 'customer' }] }).doc
    const p = plan(doc)
    p.rows[0].choice = 'merge'
    p.rows[0].mergeInto = 'STK-001'
    for (const r of p.rows.slice(1)) r.choice = 'skip'
    const { ops, mergedIds } = importOps(doc, p.rows, { file: 'f.xlsx', sha256: null, size: 1, sheet: 'Stakeholders', at: stamp.at, mapping: p.cols }, stamp)
    const res = applyOps(doc, ops, stamp)
    if (!res.ok) throw new Error(res.error)
    expect(mergedIds).toEqual(['STK-001'])
    const s = toTeamRecord(res.doc).stakeholders[0]
    expect(s.role).toBe('customer') // kept: never overwritten
    expect(s.interest).toBe('5') // was empty: filled
    expect(Object.values(res.doc.artifacts).find((a) => a.id === 'STK-001')!.attributes.importMerges).toHaveLength(1)
  })
  it('rollback: one refused operation refuses the whole import; the store keeps the project unchanged', async () => {
    const store = new ProjectStore(new MemoryAdapter(), { startEmpty: true })
    await store.init()
    await store.create({ teamLabel: '07', initials: 'JS' })
    const before = JSON.stringify(store.getState().doc!.artifacts)
    const { rows, cols, sheet } = plan(store.getState().doc!)
    const r = await store.importMerge((doc, st) => {
      const { ops } = importOps(doc, rows, { file: 'f.xlsx', sha256: null, size: 1, sheet: sheet.name, at: st.at, mapping: cols }, st)
      // a corrupt operation at the end (an artifact ID that is already used) must refuse everything before it
      const dup = ops.find((o) => o.op === 'create-artifact')!
      return [...ops, dup]
    }, 'Imported stakeholders')
    expect(r.ok).toBe(false)
    expect(JSON.stringify(store.getState().doc!.artifacts)).toBe(before)
    const ok = await store.importMerge((doc, st) => importOps(doc, rows, { file: 'f.xlsx', sha256: null, size: 1, sheet: sheet.name, at: st.at, mapping: cols }, st).ops, 'Imported stakeholders')
    expect(ok.ok).toBe(true)
    expect(store.getState().changes.at(-1)).toMatchObject({ source: 'import' })
    expect(store.getState().snapshots.some((s) => s.kind === 'pre-import')).toBe(true)
    expect(Object.values(store.getState().doc!.artifacts).filter((a) => a.type === 'STK')).toHaveLength(4)
    // "Undo this import": the pre-import restore point becomes the current content again, as a new revision
    const snap = store.getState().snapshots.filter((s) => s.kind === 'pre-import').sort((a, b) => b.at.localeCompare(a.at))[0]
    expect((await store.restore(snap.id, 'Undo the Excel import')).ok).toBe(true)
    expect(Object.values(store.getState().doc!.artifacts).filter((a) => a.type === 'STK' && a.status === 'active')).toHaveLength(0)
    expect(store.getState().changes.at(-1)).toMatchObject({ source: 'restore' })
    expect(store.getState().doc!.issued.STK).toBeGreaterThanOrEqual(4) // the imported IDs stay taken (never reused)
  })
})

describe('the committed demo workbook', () => {
  it('docs/week1/samples/m6-stakeholders-sample.xlsx is the generated sample (fictional data) and reads as expected', async () => {
    const fs = (await import(/* @vite-ignore */ `node:${'fs'}`)) as unknown as { readFileSync: (p: string) => Uint8Array }
    const file = new Uint8Array(fs.readFileSync('docs/week1/samples/m6-stakeholders-sample.xlsx'))
    const wb = read(file)
    expect(wb.sheets.map((s) => s.name)).toEqual(['Notes', 'Stakeholders'])
    expect(wb.sheets[1].rows).toEqual(read(sample()).sheets[1].rows)
  })
})
