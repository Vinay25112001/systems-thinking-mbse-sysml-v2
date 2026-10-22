// Reading the ZIP container of an .xlsx file as untrusted input (spec §j.3, XLS-02). The central directory is parsed
// here (not trusted blindly): encrypted entries, ZIP64 and compression methods other than stored / deflate are refused,
// the declared sizes are checked against the limits before anything is inflated, and every entry is inflated with
// fflate (MIT) in a streaming inflater that stops as soon as the output passes the entry's declared size or the
// total budget, so a ZIP bomb that lies about its sizes cannot exhaust memory.
import { Inflate } from 'fflate'

export class ZipError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ZipError'
  }
}

export type ZipEntry = { name: string; method: number; compressedSize: number; size: number; offset: number; flags: number }
export type ZipLimits = { maxEntries: number; maxTotalUncompressed: number }

const u16 = (b: Uint8Array, o: number) => b[o] | (b[o + 1] << 8)
const u32 = (b: Uint8Array, o: number) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0
const utf8 = new TextDecoder('utf-8', { fatal: false })

/** The entries of a ZIP archive, from its central directory. Throws ZipError for anything it will not read. */
export function readZipDirectory(b: Uint8Array, limits: ZipLimits): ZipEntry[] {
  if (b.length < 22 || u32(b, 0) !== 0x04034b50) throw new ZipError('This file is not an .xlsx workbook (it is not a ZIP package).')
  // end of central directory: the last 22 bytes, or earlier if the archive has a comment (at most 65,535 bytes)
  let eocd = -1
  for (let i = b.length - 22; i >= Math.max(0, b.length - 22 - 65535); i--) {
    if (u32(b, i) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new ZipError('The workbook package is damaged: its directory is missing.')
  const count = u16(b, eocd + 10)
  const cdSize = u32(b, eocd + 12)
  const cdOffset = u32(b, eocd + 16)
  if (count === 0xffff || cdSize === 0xffffffff || cdOffset === 0xffffffff) throw new ZipError('The workbook uses the ZIP64 format, which is only needed for very large files and is not accepted here.')
  if (count > limits.maxEntries) throw new ZipError(`The workbook package has ${count} parts; at most ${limits.maxEntries} are accepted.`)
  if (cdOffset + cdSize > eocd) throw new ZipError('The workbook package is damaged: its directory points outside the file.')
  const out: ZipEntry[] = []
  let p = cdOffset
  let declared = 0
  for (let k = 0; k < count; k++) {
    if (p + 46 > b.length || u32(b, p) !== 0x02014b50) throw new ZipError('The workbook package is damaged: a directory entry is unreadable.')
    const flags = u16(b, p + 8)
    const method = u16(b, p + 10)
    const compressedSize = u32(b, p + 20)
    const size = u32(b, p + 24)
    const nameLen = u16(b, p + 28)
    const extraLen = u16(b, p + 30)
    const commentLen = u16(b, p + 32)
    const offset = u32(b, p + 42)
    const name = utf8.decode(b.subarray(p + 46, p + 46 + nameLen))
    p += 46 + nameLen + extraLen + commentLen
    if (flags & 1) throw new ZipError('The workbook is password-protected (encrypted); save an unprotected copy to import it.')
    if (compressedSize === 0xffffffff || size === 0xffffffff || offset === 0xffffffff) throw new ZipError('The workbook uses the ZIP64 format, which is not accepted here.')
    if (method !== 0 && method !== 8) throw new ZipError(`A part of the workbook uses a compression method (${method}) this import does not read.`)
    if (name.includes('..') || name.startsWith('/')) throw new ZipError('The workbook package contains a part with an unsafe name.')
    declared += size
    if (declared > limits.maxTotalUncompressed) throw new ZipError(`The workbook expands to more than ${Math.round(limits.maxTotalUncompressed / 1048576)} MB; it is refused (possible ZIP bomb).`)
    out.push({ name, method, compressedSize, size, offset, flags })
  }
  return out
}

/** Inflates one entry, stopping at its declared size and at the remaining budget. */
export function readZipEntry(b: Uint8Array, e: ZipEntry, budget: { left: number }): Uint8Array {
  const o = e.offset
  if (o + 30 > b.length || u32(b, o) !== 0x04034b50) throw new ZipError(`The workbook package is damaged: part ${e.name} is unreadable.`)
  // the local header must name the same part as the directory, unencrypted (M6 review L-3: no parser differential
  // between what a spreadsheet application shows and what is imported)
  const localName = utf8.decode(b.subarray(o + 30, o + 30 + u16(b, o + 26)))
  if (localName !== e.name || u16(b, o + 6) & 1) throw new ZipError(`The workbook package is damaged: part ${e.name} does not match its directory entry.`)
  const start = o + 30 + u16(b, o + 26) + u16(b, o + 28)
  const end = start + e.compressedSize
  if (end > b.length) throw new ZipError(`The workbook package is damaged: part ${e.name} is cut short.`)
  const data = b.subarray(start, end)
  const cap = Math.min(e.size, budget.left)
  if (e.method === 0) {
    if (data.length > cap) throw new ZipError('The workbook expands beyond the accepted size; it is refused.')
    budget.left -= data.length
    return data
  }
  const chunks: Uint8Array[] = []
  let total = 0
  const inf = new Inflate()
  inf.ondata = (chunk: Uint8Array) => {
    total += chunk.length
    if (total > cap) throw new ZipError('The workbook expands beyond what its directory declares; it is refused (possible ZIP bomb).')
    chunks.push(chunk)
  }
  try {
    const STEP = 65536
    for (let i = 0; i < data.length; i += STEP) inf.push(data.subarray(i, Math.min(data.length, i + STEP)), i + STEP >= data.length)
    if (!data.length) inf.push(new Uint8Array(0), true)
  } catch (err) {
    if (err instanceof ZipError) throw err
    throw new ZipError(`The workbook package is damaged: part ${e.name} could not be decompressed.`)
  }
  budget.left -= total
  const out = new Uint8Array(total)
  let k = 0
  for (const c of chunks) {
    out.set(c, k)
    k += c.length
  }
  return out
}
