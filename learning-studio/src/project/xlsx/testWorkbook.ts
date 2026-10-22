// Test helper (not imported by application code): builds a minimal, valid .xlsx package in memory with fflate, so the
// import tests and the demo sample need no binary fixture of unknown origin. Cells: a string (shared string), a number,
// or { f, v } for a formula with its stored value (v omitted = no stored value), or { e } for an error cell.
import { strToU8, zipSync, type Zippable } from 'fflate'

export type TestCell = string | number | null | { f: string; v?: string | number } | { e: string } | { inline: string }
export type TestSheet = { name: string; rows: TestCell[][]; hidden?: boolean }
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const colName = (i: number) => {
  let s = ''
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s
  return s
}

export function buildXlsx(sheets: TestSheet[], o: { macro?: boolean; extra?: Record<string, string>; contentTypesExtra?: string } = {}): Uint8Array {
  const shared: string[] = []
  const sIndex = (s: string) => {
    const i = shared.indexOf(s)
    if (i >= 0) return i
    shared.push(s)
    return shared.length - 1
  }
  const files: Zippable = {}
  sheets.forEach((sh, k) => {
    const rows = sh.rows
      .map((r, ri) => {
        const cells = r
          .map((c, ci) => {
            const ref = `${colName(ci)}${ri + 1}`
            if (c === null || c === '') return ''
            if (typeof c === 'number') return `<c r="${ref}"><v>${c}</v></c>`
            if (typeof c === 'string') return `<c r="${ref}" t="s"><v>${sIndex(c)}</v></c>`
            if ('e' in c) return `<c r="${ref}" t="e"><v>${esc(c.e)}</v></c>`
            if ('inline' in c) return `<c r="${ref}" t="inlineStr"><is><t>${esc(c.inline)}</t></is></c>`
            const t = typeof c.v === 'string' ? ' t="str"' : ''
            return `<c r="${ref}"${t}><f>${esc(c.f)}</f>${c.v === undefined ? '' : `<v>${esc(String(c.v))}</v>`}</c>`
          })
          .join('')
        return `<row r="${ri + 1}">${cells}</row>`
      })
      .join('')
    files[`xl/worksheets/sheet${k + 1}.xml`] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows}</sheetData></worksheet>`)
  })
  files['xl/workbook.xml'] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, k) => `<sheet name="${esc(s.name)}" sheetId="${k + 1}"${s.hidden ? ' state="hidden"' : ''} r:id="rId${k + 1}"/>`).join('')}</sheets></workbook>`)
  files['xl/_rels/workbook.xml.rels'] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, k) => `<Relationship Id="rId${k + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${k + 1}.xml"/>`).join('')}<Relationship Id="rIdS" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>`)
  files['xl/sharedStrings.xml'] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${shared.length}" uniqueCount="${shared.length}">${shared.map((s) => `<si><t xml:space="preserve">${esc(s)}</t></si>`).join('')}</sst>`)
  files['[Content_Types].xml'] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.${o.macro ? 'sheet.macroEnabled.main+xml' : 'sheet.main+xml'}"/>${o.contentTypesExtra ?? ''}</Types>`)
  files['_rels/.rels'] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`)
  if (o.macro) files['xl/vbaProject.bin'] = new Uint8Array([1, 2, 3])
  for (const [k, v] of Object.entries(o.extra ?? {})) files[k] = strToU8(v)
  return zipSync(files, { level: 6 })
}

/** The demo workbook (fictional data, no real people): a community tool-library network. Row 6 repeats a stakeholder
 *  with different spelling, row 7 has no name, one interest is a word, one value is a formula, one concern cell holds
 *  two concerns, and a plain "Reason" column next to both ratings is ambiguous on purpose. */
export const SAMPLE_SHEETS: TestSheet[] = [
  { name: 'Notes', rows: [['Prepared for the Week 1 lab'], ['All names are fictional.']] },
  {
    name: 'Stakeholders',
    rows: [
      ['Stakeholder', 'Category', 'Life-cycle stage', 'Internal/External', 'Approving authority', 'Concerns', 'Interest (1-5)', 'Influence', 'Reason', 'Notes'],
      ['Library members', 'User', 'Operation', 'External', 'No', 'Members find popular tools already booked on Saturday mornings.', 5, 2, 'They borrow tools every week', 'Largest group'],
      ['City permits office', 'Regulator', 'Concept', 'External', 'Yes', 'Storage of fuel-powered tools must meet the fire code at each branch.', 3, 5, 'Can refuse the branch permit', ''],
      ['Volunteer repair crew', 'Maintainer', 'Logistics and maintenance', 'Internal', 'No', 'Broken tools pile up when repairs wait more than two weeks; spare parts arrive late.', { f: '2+2', v: 4 }, 3, 'Repairs depend on them', ''],
      ['Hardware store partner', 'Supplier', 'Operation', 'External', 'No', 'Donated tools arrive without manuals or safety guards.\nPick-ups clash with the store’s delivery hours on Mondays.', 'high', 3, 'Donates most tools', ''],
      ['Library Members', 'User', 'Operation', 'External', 'No', 'Duplicate row typed by a second teammate.', 5, 2, 'Same group', ''],
      ['', 'Public', 'Operation', 'External', 'No', 'Neighbours complain about van noise before 7 a.m.', 2, 2, '', 'Name missing on purpose'],
    ],
  },
]
