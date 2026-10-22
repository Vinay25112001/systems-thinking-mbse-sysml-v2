// Sanitisation and validation of content bodies (design §8.2, §8.3; SECURITY_ARCHITECTURE.md §7), limited scope.
// ONE module for the instructor editor (live feedback) and the course server (authoritative: draft save normalises,
// "mark ready" and publish refuse on errors). Never throws on hostile input; reports problems with a location.
//
// Limited-scope rules (M3, recorded in docs/server/M3_PUBLISHING_REPORT.md):
//   - Learn sections: the text of paragraph, heading, bullet and callout blocks is editable; paragraphs may be added,
//     deleted (unless they carry attached footnotes) and any block may be moved. Definitions, tables, equations, worked
//     steps, figures and interactive figures are READ-ONLY: they must stay identical to the seed revision r1, so a quoted
//     definition can never be detached from its verified source. The section title is read-only (it is the navigation
//     label used across Week 1).
//   - Course introduction: the text fields are editable; the structure (number of paragraphs, the quoted definition and
//     its citation, the stage labels) is read-only.
//   - Text: plain text with the two-token inline subset (**bold**, *emphasis*); no HTML, no URLs with a scheme other than
//     https; control characters refused; NFC.
//   - Citations written inline ("R11 p.552") must name a register entry and stay inside its verified page range; every
//     quotation (“…”) of the seed text must survive verbatim.
//   - The student wording layer is applied before the leak rules run (studentScan.ts: no register codes, no slide
//     pointers, no pending-decision wording, no faculty placeholders, "objectives" not "goals"), exactly as students
//     will read it.
import { citationInRange, getReading } from '../content/readings'
import { scanStudentText } from '../week1/learn/studentScan'
import { splitCitations, studentText } from '../week1/learn/studentText'
import { CHAPTERS } from '../week1/learn/textbook'
import { blockId, blockNo, MAX_BLOCK_NO } from './seed'
import type { AnyBody, BodyBlock, CourseIntroBody, CourseSettingsBody, ItemKind, Issue, SectionBody, Validation } from './types'

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/
const HTML = /<\s*\/?\s*[A-Za-z!?]|&#|javascript:|data:text|vbscript:/i
const URL_SCHEME = /\b(?!https:)[a-z][a-z0-9+.-]{1,15}:\/\//i
const INLINE_CODE = /\bR\d{2,3}[a-z]? pp?\. ?\d/
export const CAPS = { para: 4000, short: 300, field: 2000, title: 200, department: 120 }

type Out = { errors: Issue[]; warnings: Issue[] }
const err = (o: Out, rule: string, where: string, message: string) => o.errors.push({ severity: 'error', rule, where, message })
const warn = (o: Out, rule: string, where: string, message: string) => o.warnings.push({ severity: 'warning', rule, where, message })
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const QUOTE = /“[^”]*”/g
// M3 review L3: invisible format characters (zero-width, bidi controls, BOM, soft hyphen) would hide an internal code
// from the leak rules ("R\u200B11") or make text read differently in review; letters of another script next to digits
// ("\u042011" with a Cyrillic letter) imitate a code. Both are refused outside quotations, and every scan runs on NFKC text with
// format characters stripped.
const FORMAT = /[\p{Cf}\u00AD]/gu
const CONFUSABLE = /[\u0370-\u03FF\u0400-\u04FF]\d/u
/** The form every internal-code and leak check reads. */
export const scanForm = (t: string) => t.normalize('NFKC').replace(FORMAT, '')
const outsideQuotes = (t: string) => t.replace(QUOTE, ' ')

/** NFC, single line, trimmed; null when not a string. */
function clean(x: unknown): string | null {
  if (typeof x !== 'string') return null
  return x.normalize('NFC').replace(/\r\n?|\n/g, ' ').replace(/[ \t]{2,}/g, ' ').trim()
}

/** Shape and safety checks of one editable string (no meaning checks). */
function checkText(o: Out, where: string, raw: unknown, cap: number, opts: { required?: boolean } = {}): string {
  const v = clean(raw)
  if (v === null) {
    err(o, 'shape', where, 'Expected text.')
    return ''
  }
  if (typeof raw === 'string' && CONTROL.test(raw.replace(/\r|\n|\t/g, ''))) err(o, 'control-chars', where, 'Remove the control characters.')
  if (opts.required !== false && !v) err(o, 'empty', where, 'This text is empty. Write it, or delete the paragraph.')
  if (v.length > cap) err(o, 'too-long', where, `Shorten this text to at most ${cap} characters (now ${v.length}).`)
  if (HTML.test(v)) err(o, 'markup', where, 'HTML and script are not allowed. Use plain text with **bold** or *emphasis* only.')
  if (URL_SCHEME.test(v)) err(o, 'markup', where, 'Only https links are allowed.')
  const bare = outsideQuotes(v)
  if (new RegExp(FORMAT.source, 'u').test(bare)) err(o, 'invisible-chars', where, 'Remove the invisible formatting characters (zero-width, direction or soft-hyphen characters).')
  if (CONFUSABLE.test(scanForm(bare))) err(o, 'confusable', where, 'A Greek or Cyrillic letter stands next to a digit; use Latin letters (it can imitate an internal code).')
  const bold = v.split('**').length - 1
  if (bold % 2) warn(o, 'markup', where, 'A **bold** marker is not closed; it will show as two asterisks.')
  if ((v.replace(/\*\*/g, '').split('*').length - 1) % 2) warn(o, 'markup', where, 'An *emphasis* marker is not closed; check the asterisks.')
  return v
}

/** Meaning checks of student text in Learn: citations against the register, then the leak rules on the student wording. */
function checkStudentText(o: Out, where: string, raw: string, reference?: string) {
  const text = scanForm(raw)
  const segs = splitCitations(studentText(text))
  for (const s of segs) {
    if (!('cite' in s)) continue
    try {
      getReading(s.cite.reading)
      if (!citationInRange(s.cite)) err(o, 'citation-range', where, `${s.cite.reading} p.${s.cite.pages}: the page is outside the verified range of that reading.`)
    } catch {
      err(o, 'citation-unknown', where, `${s.cite.reading} is not an entry of the verified reading register. Cite a register entry.`)
    }
  }
  const rendered = segs.map((s) => ('text' in s ? s.text : ' ')).join('')
  for (const h of scanStudentText(rendered)) err(o, `leak:${h.rule}`, where, `Students must not see this (${h.why}): “${h.match}”.`)
  if (reference !== undefined) {
    // quotation and citation comparisons read the text as written (NFKC would change “…” inside quotations)
    for (const q of reference.match(QUOTE) ?? []) if (!raw.includes(q)) err(o, 'quotation-changed', where, `A quotation of the source must stay verbatim: ${q}`)
    const refQuotes = new Set(reference.match(QUOTE) ?? [])
    for (const q of raw.match(QUOTE) ?? []) if (!refQuotes.has(q)) warn(o, 'quotation-new', where, `New quotation ${q}: make sure it is the source’s exact wording and is cited.`)
    const cites = (t: string) => new Set(splitCitations(t).flatMap((s) => ('cite' in s ? [`${s.cite.reading} p.${s.cite.pages ?? ''}`] : [])))
    const now = cites(raw)
    // M3 review M1: a paragraph that keeps a verbatim source quotation must keep the seed's citations (attribution)
    const quoted = (reference.match(QUOTE) ?? []).length > 0
    for (const c of cites(reference))
      if (!now.has(c)) {
        if (quoted) err(o, 'attribution-removed', where, `This paragraph quotes a source; its citation ${c} must stay (directive §5: never alter attributions).`)
        else warn(o, 'citation-removed', where, `The citation ${c} is no longer in this text; check the claim still has its source.`)
      }
  } else if (QUOTE.test(raw)) warn(o, 'quotation-new', where, 'New quotation: make sure it is the source’s exact wording and is cited.')
  QUOTE.lastIndex = 0
}

// ------------------------------------------------------------------------------------------- Learn sections
const NEW_ID = /^new-[A-Za-z0-9]{1,12}$/
const BLOCK_ID = /^b\d{3,5}$/

/** Normalises an untrusted section body against the seed revision r1 and validates it. New paragraphs (`new-…` ids)
 *  get the next free block ids above `maxBlockNo` (the highest number ever used by the item). */
/** `known` (server): block ids of the item's open draft and published revision. A non-seed `bNNN` is accepted only when
 *  known; otherwise it is repaired to the next free id (never a reissued or out-of-range id, M3 review L2). */
export function validateSection(raw: unknown, seed: SectionBody, maxBlockNo: number, known?: ReadonlySet<string>): { body: SectionBody; validation: Validation } {
  const o: Out = { errors: [], warnings: [] }
  const body: SectionBody = { title: seed.title, blocks: [] }
  if (!isObj(raw) || !Array.isArray(raw.blocks)) {
    err(o, 'shape', 'section', 'The section body must have a list of blocks.')
    return { body: structuredClone(seed), validation: o }
  }
  if (raw.title !== undefined && raw.title !== seed.title) err(o, 'read-only', 'title', 'The section title is read-only in this version of the editor.')
  if (raw.blocks.length > 400) err(o, 'shape', 'section', 'Too many blocks.')
  const ref = new Map(seed.blocks.map((b) => [b.id, b]))
  const seen = new Set<string>()
  let next = Math.max(maxBlockNo, ...seed.blocks.map((b) => blockNo(b.id)))
  for (const [i, x] of raw.blocks.slice(0, 400).entries()) {
    const where = `block ${i + 1}`
    if (!isObj(x) || typeof x.id !== 'string' || typeof x.kind !== 'string') {
      err(o, 'shape', where, 'Each block needs an id and a kind.')
      continue
    }
    if (seen.has(x.id)) {
      err(o, 'shape', where, `Block ${x.id} appears twice.`)
      continue
    }
    seen.add(x.id)
    const r = ref.get(x.id)
    if (NEW_ID.test(x.id) || (BLOCK_ID.test(x.id) && !r)) {
      // an added paragraph (new now, or added by an earlier revision)
      if (x.kind !== 'para') {
        err(o, 'read-only', where, 'Only paragraphs can be added in this version of the editor.')
        continue
      }
      let id = x.id
      if (!NEW_ID.test(x.id) && known && !known.has(x.id)) {
        warn(o, 'block-id-repaired', where, `Block id ${x.id} was never used by this section's current versions; it is stored under a new id.`)
        id = 'new-repair'
      }
      if (NEW_ID.test(id)) {
        if (next >= MAX_BLOCK_NO) {
          err(o, 'shape', where, 'This section has used every block number; no paragraph can be added.')
          continue
        }
        id = blockId(++next)
      }
      if (id !== x.id) seen.add(id) // a generated id is above every number the item used, so it cannot collide
      const text = checkText(o, `${id} (paragraph)`, x.text, CAPS.para)
      checkStudentText(o, `${id} (paragraph)`, text)
      body.blocks.push({ id, kind: 'para', text })
      continue
    }
    if (!r) {
      err(o, 'shape', where, `Unknown block id ${String(x.id).slice(0, 20)}.`)
      continue
    }
    const at = `${r.id} (${r.kind})`
    if (x.kind !== r.kind) {
      err(o, 'read-only', at, 'A block cannot change its kind.')
      continue
    }
    const keepMeta = (b: BodyBlock): BodyBlock => ({ ...b, ...(r.optional ? { optional: true as const } : {}), ...(r.cites ? { cites: structuredClone(r.cites) } : {}) })
    if ((x.optional ?? undefined) !== (r.optional ?? undefined) || !same(x.cites ?? null, r.cites ?? null)) err(o, 'read-only', at, 'Footnotes attached to a block and the extension-reading mark are read-only.')
    switch (r.kind) {
      case 'para': {
        const text = checkText(o, at, x.text, CAPS.para)
        checkStudentText(o, at, text, r.text)
        body.blocks.push(keepMeta({ id: r.id, kind: 'para', text }))
        break
      }
      case 'heading': {
        const text = checkText(o, at, x.text, CAPS.short)
        checkStudentText(o, at, text, r.text)
        body.blocks.push(keepMeta({ id: r.id, kind: 'heading', text }))
        break
      }
      case 'callout': {
        if (x.tone !== r.tone) err(o, 'read-only', at, 'The callout tone is read-only.')
        const title = r.title === undefined ? undefined : checkText(o, `${at} title`, x.title, CAPS.short)
        if (r.title === undefined && x.title !== undefined) err(o, 'read-only', at, 'This callout has no title.')
        const text = checkText(o, at, x.text, CAPS.para)
        if (title !== undefined) checkStudentText(o, `${at} title`, title, r.title)
        checkStudentText(o, at, text, r.text)
        body.blocks.push(keepMeta({ id: r.id, kind: 'callout', tone: r.tone, ...(title !== undefined ? { title } : {}), text }))
        break
      }
      case 'bullets': {
        const items = Array.isArray(x.items) ? x.items : []
        if (items.length !== r.items.length) err(o, 'read-only', at, 'The number of bullet items is fixed in this version of the editor.')
        const out = r.items.map((ri, k) => {
          const xi = items[k]
          if (typeof ri === 'string') {
            const t = checkText(o, `${at} item ${k + 1}`, typeof xi === 'string' ? xi : isObj(xi) ? xi.text : xi, CAPS.field)
            checkStudentText(o, `${at} item ${k + 1}`, t, ri)
            return t
          }
          const xo = isObj(xi) ? xi : {}
          const t = checkText(o, `${at} item ${k + 1}`, xo.text, CAPS.field)
          checkStudentText(o, `${at} item ${k + 1}`, t, ri.text)
          const xs = Array.isArray(xo.sub) ? xo.sub : []
          if (xs.length !== ri.sub.length) err(o, 'read-only', `${at} item ${k + 1}`, 'The number of sub-items is fixed.')
          const sub = ri.sub.map((rs, j) => {
            const s = checkText(o, `${at} item ${k + 1}.${j + 1}`, xs[j], CAPS.field)
            checkStudentText(o, `${at} item ${k + 1}.${j + 1}`, s, rs)
            return s
          })
          return { text: t, sub }
        })
        body.blocks.push(keepMeta({ id: r.id, kind: 'bullets', items: out }))
        break
      }
      default: {
        // read-only kinds: the stored block is always the seed block, whatever the client sent
        const { id: _id, ...xr } = x
        const { id: _rid, ...rr } = r
        void _id
        void _rid
        if (!same(canonical(xr), canonical(rr))) err(o, 'read-only', at, `${READ_ONLY_LABEL[r.kind] ?? 'This block'} is read-only in this version of the editor${r.kind === 'definition' ? ': a quoted definition stays tied to its verified source' : ''}.`)
        body.blocks.push(structuredClone(r))
      }
    }
  }
  for (const r of seed.blocks) {
    if (seen.has(r.id)) continue
    if (r.kind !== 'para') err(o, 'read-only', `${r.id} (${r.kind})`, `${READ_ONLY_LABEL[r.kind] ?? 'This block'} cannot be deleted in this version of the editor.`)
    else if (r.cites) err(o, 'read-only', `${r.id} (para)`, 'This paragraph carries source footnotes and cannot be deleted.')
  }
  if (!body.blocks.length) err(o, 'empty', 'section', 'A section needs at least one block.')
  return { body, validation: o }
}
const READ_ONLY_LABEL: Record<string, string> = { definition: 'A definition', table: 'A table', equation: 'An equation', steps: 'A worked example', figure: 'A figure', interactive: 'An interactive figure' }
function canonical(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(canonical)
  if (isObj(v)) return Object.fromEntries(Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => [k, canonical(v[k])]))
  return v
}

// ------------------------------------------------------------------------------------------- course introduction
const introParas = (o: Out, where: string, raw: unknown, seed: CourseIntroBody['what']) => {
  const xs = Array.isArray(raw) ? raw : []
  if (xs.length !== seed.length) err(o, 'read-only', where, 'The number of paragraphs is fixed in this version of the editor.')
  return seed.map((p, i) => {
    const x = xs[i]
    const at = `${where} ¶${i + 1}`
    const text = checkText(o, at, isObj(x) ? x.text : undefined, CAPS.field)
    homeText(o, at, text)
    if (isObj(x) && (!same(x.label ?? null, p.label ?? null) || !same(x.cite ?? null, p.cite ?? null) || !same(x.quote ?? null, p.quote ?? null))) err(o, 'read-only', at, 'The label, the citation and the quoted definition are read-only.')
    return { ...structuredClone(p), text }
  })
}
const strings = (o: Out, where: string, raw: unknown, seed: string[]) => {
  const xs = Array.isArray(raw) ? raw : []
  if (xs.length !== seed.length) err(o, 'read-only', where, 'The number of sentences is fixed in this version of the editor.')
  return seed.map((_, i) => {
    const t = checkText(o, `${where} ${i + 1}`, xs[i], CAPS.field)
    homeText(o, `${where} ${i + 1}`, t)
    return t
  })
}
/** Homepage text has no footnote machinery for inline codes: a register code is refused, then the leak rules apply. */
function homeText(o: Out, where: string, raw: string) {
  const text = scanForm(raw)
  if (INLINE_CODE.test(text)) err(o, 'citation-inline', where, 'Inline citations are not available on the homepage; its footnotes are fixed.')
  for (const h of scanStudentText(text)) err(o, `leak:${h.rule}`, where, `Students must not see this (${h.why}): “${h.match}”.`)
}

export function validateCourseIntro(raw: unknown, seed: CourseIntroBody): { body: CourseIntroBody; validation: Validation } {
  const o: Out = { errors: [], warnings: [] }
  if (!isObj(raw)) {
    err(o, 'shape', 'intro', 'The course introduction must be an object.')
    return { body: structuredClone(seed), validation: o }
  }
  const one = (k: 'title' | 'lede' | 'submitNote' | 'savedStatic' | 'start', label: string, cap = CAPS.field) => {
    const t = checkText(o, label, raw[k], cap)
    homeText(o, label, t)
    return t
  }
  const submitRaw = Array.isArray(raw.submit) ? raw.submit : []
  if (submitRaw.length !== seed.submit.length) err(o, 'read-only', 'What you submit', 'The number of submissions is fixed in this version of the editor.')
  const stagesRaw = Array.isArray(raw.stages) ? raw.stages : []
  if (stagesRaw.length !== seed.stages.length) err(o, 'read-only', 'How the site is organized', 'The stages are fixed.')
  const body: CourseIntroBody = {
    title: one('title', 'Title', CAPS.title),
    lede: one('lede', 'Lede'),
    what: introParas(o, 'What the course teaches', raw.what, seed.what),
    phases: introParas(o, 'Two phases', raw.phases, seed.phases),
    aerolink: strings(o, 'AeroLink sentence', raw.aerolink, seed.aerolink),
    enterprise: strings(o, 'Enterprise sentence', raw.enterprise, seed.enterprise),
    submit: seed.submit.map((s, i) => {
      const x = isObj(submitRaw[i]) ? (submitRaw[i] as Record<string, unknown>) : {}
      const what = checkText(o, `Submission ${i + 1} name`, x.what, CAPS.short)
      const detail = checkText(o, `Submission ${i + 1} detail`, x.detail, CAPS.field)
      homeText(o, `Submission ${i + 1}`, `${what} ${detail}`)
      void s
      return { what, detail }
    }),
    submitNote: one('submitNote', 'Submission note'),
    stages: seed.stages.map((s, i) => {
      const x = isObj(stagesRaw[i]) ? (stagesRaw[i] as Record<string, unknown>) : {}
      if ((x.id !== undefined && x.id !== s.id) || (x.label !== undefined && x.label !== s.label) || (x.identity !== undefined && x.identity !== s.identity)) err(o, 'read-only', `Stage ${s.label}`, 'Stage names are read-only (they are the Week 1 navigation).')
      const line = checkText(o, `Stage ${s.label}`, x.line, CAPS.field)
      homeText(o, `Stage ${s.label}`, line)
      return { ...s, line }
    }),
    savedStatic: one('savedStatic', 'Static-edition note'),
    start: one('start', 'Start button', CAPS.short),
  }
  return { body, validation: o }
}

const DEPARTMENT = /^[\p{L}\p{N} &,.'’()\-–]*$/u
export function validateCourseSettings(raw: unknown): { body: CourseSettingsBody; validation: Validation } {
  const o: Out = { errors: [], warnings: [] }
  const x = isObj(raw) ? raw : {}
  const label = checkText(o, 'Department label', x.department_label ?? '', CAPS.department, { required: false })
  if (!DEPARTMENT.test(label)) err(o, 'department-chars', 'Department label', 'Use letters, digits, spaces and simple punctuation only.')
  const verified = x.department_label_verified === true
  if (typeof x.department_label_verified !== 'boolean') err(o, 'shape', 'Verified', 'State whether faculty verified the department name.')
  if (verified && !label) err(o, 'department-empty', 'Department label', 'A verified department label cannot be empty.')
  if (label && !verified) warn(o, 'department-unverified', 'Department label', 'Students see the university name alone until faculty mark the department name as verified (DECISION_LOG A24).')
  for (const h of scanStudentText(scanForm(label))) err(o, `leak:${h.rule}`, 'Department label', `Students must not see this (${h.why}).`)
  return { body: { department_label: label, department_label_verified: verified }, validation: o }
}

/** Dispatch by kind. `seed` is the item's r1 body; `maxBlockNo` the highest block number the item ever used. */
export function validateBody(kind: ItemKind, raw: unknown, seed: AnyBody, maxBlockNo = 0, known?: ReadonlySet<string>): { body: AnyBody; validation: Validation } {
  if (kind === 'learn-section') return validateSection(raw, seed as SectionBody, maxBlockNo, known)
  if (kind === 'course-intro') return validateCourseIntro(raw, seed as CourseIntroBody)
  return validateCourseSettings(raw)
}

// ------------------------------------------------------------------------------------------- numbering and withdrawal
/** Sections whose number other student text writes out ("in section 10.4"; studentText.ts `sec(…)`, Overview.tsx
 *  `displayNumber(…)`). Withdrawing one would leave a dangling reference, so archive refuses them. A test keeps this
 *  list equal to the literal ids in those two files. */
export const NUMBER_REFERENCED_SECTIONS = ['ch06-04', 'ch06-05', 'ch09-05', 'ch09-06', 'ch10-03', 'ch10-04', 'ch10-05']

/** Gap-free numbering check (spec F6) for a set of withdrawn sections: every chapter keeps at least one section, and no
 *  withdrawn section is referenced by number from other student text. */
export function withdrawalIssues(withdrawn: ReadonlySet<string>): Issue[] {
  const out: Issue[] = []
  for (const ch of CHAPTERS) {
    const visible = ch.sections.filter((s) => !withdrawn.has(s.id))
    if (!visible.length) out.push({ severity: 'error', rule: 'numbering', where: `chapter ${ch.no}`, message: `Chapter ${ch.no} would have no section left.` })
  }
  for (const id of withdrawn) if (NUMBER_REFERENCED_SECTIONS.includes(id)) out.push({ severity: 'error', rule: 'numbering', where: id, message: `Other student text refers to this section by its number; it cannot be withdrawn without leaving a dangling reference.` })
  return out
}
