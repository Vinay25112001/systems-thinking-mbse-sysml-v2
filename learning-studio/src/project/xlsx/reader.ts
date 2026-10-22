// The .xlsx reader of the stakeholder import (directive §13 steps 2–5; spec §j.1 X1–X3, §j.3). Pure: bytes in, sheets
// of cell TEXT out, so it runs in a Web Worker (parseInWorker.ts) and in the unit tests alike. Untrusted input:
//   - file ≤ 5 MB, ≤ 50 MB uncompressed (checked from the directory AND while inflating), ≤ 50 sheets;
//   - ≤ 2,000 rows read and ≤ 50 columns per sheet (more are reported, never silently dropped), ≤ 4,000 characters per cell;
//   - formulas are NEVER evaluated: the value the spreadsheet application stored is used and the cell is flagged
//     ("formula: check this value"); a formula without a stored value reads as empty and is flagged;
//   - macros (vbaProject.bin, macro-enabled content types) are refused; external links are ignored;
//   - a deadline (default 10 s) stops the work; any malformed part fails with a message and returns nothing.
import { readZipDirectory, readZipEntry, ZipError, type ZipEntry } from './zip'
import { scanXml, XmlError } from './xml'

export const XLSX_LIMITS = { maxFileBytes: 5 * 1024 * 1024, maxUncompressed: 50 * 1024 * 1024, maxSheets: 50, maxRows: 2000, maxCols: 50, maxCellChars: 4000, maxEntries: 2000, timeMs: 10_000 }
export type XlsxLimits = typeof XLSX_LIMITS

export type CellFlag = 'formula' | 'formula-no-value' | 'error' | 'truncated'
export type SheetData = {
  name: string
  hidden: boolean
  /** Row-major cell text; rows[0] is the first non-empty row as stored (the header row by convention). */
  rows: string[][]
  /** The spreadsheet row number of each entry of `rows` (1-based, as Excel shows it). */
  rowNumbers: number[]
  /** Flags per cell, keyed "rowIndex:colIndex" (indexes into `rows`). */
  flags: Record<string, CellFlag>
  /** Rows beyond the limit that were not read; columns beyond the limit. */
  rowsNotRead: number
  colsNotRead: number
}
export type WorkbookResult = { ok: true; sheets: SheetData[]; warnings: string[] } | { ok: false; error: string }

export class LimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LimitError'
  }
}

const dec = new TextDecoder('utf-8', { fatal: false })
const colIndex = (ref: string) => {
  const m = /^([A-Z]{1,3})\d+$/.exec(ref)
  if (!m) return -1
  let n = 0
  for (const ch of m[1]) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n - 1
}
const rowOf = (ref: string) => Number(/\d+$/.exec(ref)?.[0] ?? 0)
const resolve = (base: string, target: string) => {
  if (target.startsWith('/')) return target.slice(1)
  const parts = base.split('/').slice(0, -1)
  for (const seg of target.split('/')) {
    if (seg === '..') parts.pop()
    else if (seg && seg !== '.') parts.push(seg)
  }
  return parts.join('/')
}

/** Reads a workbook. Never throws: every failure is a message (nothing is returned in part). */
export function readWorkbook(bytes: Uint8Array, limits: XlsxLimits = XLSX_LIMITS, now: () => number = () => Date.now()): WorkbookResult {
  const deadline = now() + limits.timeMs
  const check = () => {
    if (now() > deadline) throw new LimitError(`Reading the workbook took longer than ${Math.round(limits.timeMs / 1000)} s and was stopped. Save a smaller copy with only the stakeholder sheet.`)
  }
  try {
    if (bytes.length > limits.maxFileBytes) return { ok: false, error: `The file is ${(bytes.length / 1048576).toFixed(1)} MB; at most ${limits.maxFileBytes / 1048576} MB is accepted.` }
    const entries = readZipDirectory(bytes, { maxEntries: limits.maxEntries, maxTotalUncompressed: limits.maxUncompressed })
    const byName = new Map<string, ZipEntry>(entries.map((e) => [e.name, e]))
    const budget = { left: limits.maxUncompressed }
    const text = (name: string) => {
      const e = byName.get(name)
      if (!e) return null
      check()
      return dec.decode(readZipEntry(bytes, e, budget))
    }
    const warnings: string[] = []
    if (byName.has('xl/vbaProject.bin')) return { ok: false, error: 'The workbook contains macros (.xlsm content). Save it as a plain Excel workbook (.xlsx) without macros and import that copy.' }
    const types = text('[Content_Types].xml')
    if (!types) return { ok: false, error: 'This file is not an Excel workbook (.xlsx): its content list is missing.' }
    if (/macroEnabled/i.test(types)) return { ok: false, error: 'The workbook is macro-enabled. Save it as a plain Excel workbook (.xlsx) and import that copy.' }
    const wb = text('xl/workbook.xml')
    if (!wb) return { ok: false, error: 'This file is not an Excel workbook (.xlsx): the workbook part is missing.' }
    // sheets and their relationship ids
    const sheetDefs: { name: string; rid: string; hidden: boolean }[] = []
    scanXml(wb, { open: (n, a) => n === 'sheet' && sheetDefs.push({ name: a.name ?? '', rid: a.id ?? '', hidden: a.state === 'hidden' || a.state === 'veryHidden' }) }, check)
    if (!sheetDefs.length) return { ok: false, error: 'The workbook has no sheets.' }
    if (sheetDefs.length > limits.maxSheets) return { ok: false, error: `The workbook has ${sheetDefs.length} sheets; at most ${limits.maxSheets} are accepted.` }
    const rels = new Map<string, string>()
    const relsXml = text('xl/_rels/workbook.xml.rels')
    if (relsXml) scanXml(relsXml, { open: (n, a) => n === 'Relationship' && a.TargetMode !== 'External' && a.Id && a.Target && rels.set(a.Id, resolve('xl/workbook.xml', a.Target)) }, check)
    if (entries.some((e) => e.name.startsWith('xl/externalLinks/'))) warnings.push('The workbook links to other files; those links are ignored (only the values stored in this file are read).')
    // shared strings (rich-text runs joined, phonetic runs left out)
    const shared: string[] = []
    const ssXml = text('xl/sharedStrings.xml')
    if (ssXml) {
      let cur: string[] | null = null
      let inT = false
      let skip = 0
      scanXml(ssXml, {
        open: (n, _a, self) => {
          if (n === 'si') cur = []
          else if (n === 'rPh' && !self) skip++
          else if (n === 't' && !self) inT = true
        },
        close: (n) => {
          if (n === 'si') {
            shared.push((cur ?? []).join(''))
            cur = null
          } else if (n === 'rPh') skip = Math.max(0, skip - 1)
          else if (n === 't') inT = false
        },
        text: (t) => {
          if (inT && !skip && cur) cur.push(t)
        },
      }, check)
    }
    const sheets: SheetData[] = []
    for (const def of sheetDefs) {
      const path = rels.get(def.rid)
      const xml = path ? text(path) : null
      if (xml === null) {
        warnings.push(`Sheet “${def.name}” could not be found in the package and was skipped.`)
        continue
      }
      sheets.push(readSheet(def.name, def.hidden, xml, shared, limits, check))
    }
    if (!sheets.length) return { ok: false, error: 'No sheet of the workbook could be read.' }
    return { ok: true, sheets, warnings }
  } catch (e) {
    if (e instanceof ZipError || e instanceof XmlError || e instanceof LimitError) return { ok: false, error: e.message }
    return { ok: false, error: `The workbook could not be read (${e instanceof Error ? e.message : String(e)}). Nothing was imported.` }
  }
}

function readSheet(name: string, hidden: boolean, xml: string, shared: string[], limits: XlsxLimits, check: () => void): SheetData {
  const rows: string[][] = []
  const rowNumbers: number[] = []
  const flags: Record<string, CellFlag> = {}
  let rowsNotRead = 0
  let colsNotRead = 0
  let row: string[] | null = null
  let rowNo = 0
  let cell: { ref: string; t: string; v: string | null; f: boolean; is: string[] } | null = null
  let inV = false
  let inF = false
  let inIsT = false
  let lastRowNo = 0
  let nextCol = 0
  let rowFlags: Record<number, CellFlag> = {}
  const flush = () => {
    if (!row) return
    const r: string[] = row
    if (r.some((x) => x !== '') || Object.keys(rowFlags).length) {
      if (rows.length < limits.maxRows) {
        for (const [col, f] of Object.entries(rowFlags)) flags[`${rows.length}:${col}`] = f
        rows.push(r)
        rowNumbers.push(rowNo)
      } else rowsNotRead++
    }
    row = null
    rowFlags = {}
  }
  scanXml(xml, {
    open: (n, a, self) => {
      if (n === 'row') {
        flush()
        rowNo = Number(a.r) || lastRowNo + 1
        lastRowNo = rowNo
        row = []
        nextCol = 0
        if (self) flush()
      } else if (n === 'c' && row) {
        cell = { ref: a.r ?? '', t: a.t ?? 'n', v: null, f: false, is: [] }
        if (self) endCell()
      } else if (n === 'v' && cell && !self) inV = true
      else if (n === 'f' && cell) {
        cell.f = true
        if (!self) inF = true
      } else if (n === 't' && cell && !self) inIsT = true
    },
    close: (n) => {
      if (n === 'v') inV = false
      else if (n === 'f') inF = false
      else if (n === 't') inIsT = false
      else if (n === 'c' && cell) endCell()
      else if (n === 'row') flush()
    },
    text: (t) => {
      if (!cell) return
      if (inV) cell.v = (cell.v ?? '') + t
      else if (inIsT && !inF) cell.is.push(t)
    },
  }, check)
  flush()

  function endCell() {
    const c = cell!
    cell = null
    if (!row) return
    const col = c.ref ? colIndex(c.ref) : nextCol
    nextCol = col + 1
    if (c.ref && rowOf(c.ref) && rowOf(c.ref) !== rowNo) return // a cell outside its row: ignored
    if (col < 0) return
    if (col >= limits.maxCols) {
      if (col - limits.maxCols + 1 > colsNotRead && (c.v || c.is.length)) colsNotRead = col - limits.maxCols + 1
      return
    }
    let value = ''
    let flag: CellFlag | null = null
    if (c.t === 's') value = shared[Number(c.v)] ?? ''
    else if (c.t === 'inlineStr') value = c.is.join('')
    else if (c.t === 'b') value = c.v === '1' ? 'TRUE' : c.v === '0' ? 'FALSE' : ''
    else if (c.t === 'e') {
      value = ''
      flag = 'error'
    } else value = c.v ?? ''
    if (c.f) flag = flag ?? (c.v === null || c.v === '' ? 'formula-no-value' : 'formula')
    value = value.replace(/\r\n?/g, '\n').trim()
    if (value.length > limits.maxCellChars) {
      value = value.slice(0, limits.maxCellChars)
      flag = flag ?? 'truncated'
    }
    while (row.length < col) row.push('')
    row[col] = value
    if (flag) rowFlags[col] = flag
  }
  // pad rows to the same width; drop columns that are empty in every row at the right edge
  const width = Math.max(0, ...rows.map((r) => r.length))
  for (const r of rows) while (r.length < width) r.push('')
  return { name, hidden, rows, rowNumbers, flags, rowsNotRead, colsNotRead }
}
