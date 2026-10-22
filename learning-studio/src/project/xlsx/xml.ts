// A minimal, non-validating XML scanner for the SpreadsheetML subset the stakeholder import reads (workbook, its
// relationships, shared strings, worksheets). Written for untrusted input (SECURITY_ARCHITECTURE.md §8, spec §j.3):
//   - no DTD processing at all: a document with <!DOCTYPE or <!ENTITY is refused (no entity expansion, no external
//     entities, no "billion laughs");
//   - only the five predefined entities and numeric character references are decoded;
//   - linear in the input, no recursion, no regular expression with backtracking over the document;
//   - works in a Web Worker and in Node (no DOMParser).
// Element and attribute names are reported without a namespace prefix ("x:row" → "row").

export class XmlError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'XmlError'
  }
}

const ENT: Record<string, string> = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" }
export function decodeEntities(s: string): string {
  if (s.indexOf('&') < 0) return s
  return s.replace(/&(#x[0-9a-fA-F]{1,6}|#[0-9]{1,7}|[a-z]{2,4});/g, (m, e: string) => {
    if (e[0] === '#') {
      const cp = e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
      return cp > 0 && cp <= 0x10ffff && !(cp >= 0xd800 && cp <= 0xdfff) ? String.fromCodePoint(cp) : ''
    }
    return ENT[e] ?? m
  })
}
const local = (name: string) => {
  const i = name.indexOf(':')
  return i >= 0 ? name.slice(i + 1) : name
}

export type XmlHandlers = {
  open?: (name: string, attrs: Record<string, string>, selfClosing: boolean) => void
  close?: (name: string) => void
  text?: (text: string) => void
}

function parseAttrs(s: string): Record<string, string> {
  const out: Record<string, string> = {}
  let i = 0
  const n = s.length
  while (i < n) {
    while (i < n && /\s/.test(s[i])) i++
    let j = i
    while (j < n && s[j] !== '=' && !/\s/.test(s[j])) j++
    if (j >= n) break
    const name = s.slice(i, j)
    i = j
    while (i < n && /\s/.test(s[i])) i++
    if (s[i] !== '=') break
    i++
    while (i < n && /\s/.test(s[i])) i++
    const q = s[i]
    if (q !== '"' && q !== "'") throw new XmlError('An attribute value is not quoted.')
    const end = s.indexOf(q, i + 1)
    if (end < 0) throw new XmlError('An attribute value is not closed.')
    out[local(name)] = decodeEntities(s.slice(i + 1, end))
    i = end + 1
  }
  return out
}

/** Scans `xml`, calling the handlers in document order. Throws XmlError on a construct it refuses or cannot read.
 *  `check` is called every few thousand tags (the reader's deadline and limits). */
export function scanXml(xml: string, h: XmlHandlers, check?: () => void): void {
  let i = 0
  const n = xml.length
  let tags = 0
  while (i < n) {
    const lt = xml.indexOf('<', i)
    if (lt < 0) {
      if (h.text && i < n) h.text(decodeEntities(xml.slice(i)))
      break
    }
    if (lt > i && h.text) h.text(decodeEntities(xml.slice(i, lt)))
    if (++tags % 4096 === 0 && check) check()
    const c = xml[lt + 1]
    if (c === '?') {
      const e = xml.indexOf('?>', lt + 2)
      if (e < 0) throw new XmlError('A processing instruction is not closed.')
      i = e + 2
      continue
    }
    if (c === '!') {
      if (xml.startsWith('<!--', lt)) {
        const e = xml.indexOf('-->', lt + 4)
        if (e < 0) throw new XmlError('A comment is not closed.')
        i = e + 3
        continue
      }
      if (xml.startsWith('<![CDATA[', lt)) {
        const e = xml.indexOf(']]>', lt + 9)
        if (e < 0) throw new XmlError('A CDATA section is not closed.')
        if (h.text) h.text(xml.slice(lt + 9, e))
        i = e + 3
        continue
      }
      throw new XmlError('The file declares a document type or entities, which this import never processes.')
    }
    // the end of the tag: the first '>' outside a quoted attribute value. Only the quote character that opened a value
    // closes it, so an apostrophe inside a double-quoted value ("Bob's list", data-validation prompts) and a double
    // quote inside a single-quoted value are plain text (M6 review M-1). One pass, linear in the tag's length.
    let end = -1
    let q = ''
    for (let j = lt + 1; j < n; j++) {
      const ch = xml.charCodeAt(j)
      if (q) {
        if (ch === q.charCodeAt(0)) q = ''
      } else if (ch === 34 || ch === 39) q = ch === 34 ? '"' : "'"
      else if (ch === 62) {
        end = j
        break
      }
      if (j - lt > 1_000_000) throw new XmlError('A tag is too long.')
      if ((j & 0xffff) === 0 && check) check()
    }
    if (end < 0) throw new XmlError(q ? 'An attribute value is not closed.' : 'A tag is not closed.')
    let body = xml.slice(lt + 1, end)
    i = end + 1
    if (body[0] === '/') {
      if (h.close) h.close(local(body.slice(1).trim()))
      continue
    }
    const self = body.endsWith('/')
    if (self) body = body.slice(0, -1)
    const sp = body.search(/\s/)
    const name = local(sp < 0 ? body : body.slice(0, sp))
    if (!name) throw new XmlError('A tag has no name.')
    const attrs = sp < 0 ? {} : parseAttrs(body.slice(sp + 1))
    if (h.open) h.open(name, attrs, self)
    if (self && h.close) h.close(name)
  }
}
