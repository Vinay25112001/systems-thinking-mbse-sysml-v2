#!/usr/bin/env node
// npm run lectures:pptx — builds every registered lecture from the single TypeScript source (src/content/lectures):
//   exports/lectures/weekNN-sessionS.pptx       16:9 deck, course master, faculty notes as speaker notes,
//                                                native tables, figures as PNG
//   exports/lectures/weekNN-sessionS-notes.md   faculty-notes document
//   exports/lectures/weekNN-lesson.md           student handout (both sessions of the week)
//   public/lectures/weekNN-sessionS.pptx        copy served by the web app's "Download .pptx" links
// Figures: the script starts its own Vite dev server (in this process, port 5197, never the 5173 dev server), loads
// the lecture source through Vite's SSR loader, validates it (an invalid lecture stops the build), renders each
// figure at #/figure/:id on a 1600×900 light canvas with Playwright (local Chrome), caches the PNGs in
// exports/lectures/.figure-cache/, and closes the browser and the server on every exit path.
// Options: --week N (only that week), --port P.
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import JSZip from 'jszip'
import PptxGenJS from 'pptxgenjs'
import { createServer } from 'vite'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = path.resolve(APP, '..')
const OUT = path.join(REPO, 'exports', 'lectures')
const CACHE = path.join(OUT, '.figure-cache')
const PUBLIC = path.join(APP, 'public', 'lectures')
const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > 0 ? process.argv[i + 1] : undefined
}
const PORT = parseInt(arg('port') ?? '5197', 10)
const ONLY_WEEK = arg('week') ? parseInt(arg('week'), 10) : undefined

// ------------------------------------------------------------------------------------------- design tokens (light)
const C = { accent: '0F6E8C', accentSoft: 'E1EFF4', fg: '18202D', muted: '566071', line: 'D3D9E1', sunk: 'ECEFF3', warn: '8A5200', warnSoft: 'FBEFD9', white: 'FFFFFF' }
const FONT = 'Calibri'
const HEAD = 'Calibri'
const COURSE = 'Systems Thinking and MBSE with SysML v2'
const W = 13.333 // LAYOUT_WIDE, inches
const H = 7.5
const MX = 0.6 // side margin
const CONTENT_TOP = 1.4
const FOOT_TOP = 6.95 // footer bar
const META_BOTTOM = 6.85 // caption + sources end here

// ------------------------------------------------------------------------------------------- lifecycle
let server
let browser
async function shutdown() {
  try {
    await browser?.close()
  } catch {
    /* already closed */
  }
  browser = undefined
  try {
    await server?.close()
  } catch {
    /* already closed */
  }
  server = undefined
}
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => shutdown().finally(() => process.exit(130)))

// ------------------------------------------------------------------------------------------- text helpers
let T // src/content/lectures/text.ts, loaded through Vite
let R // src/content/readings.ts
let REFS // src/content/lectures/references.ts (the generated reference list and credits)
let WEEK_LECTURES = (week) => [] // src/content/lectures/index.ts lecturesOfWeek, set once the modules load

const runs = (s, base = {}) => T.parseInline(s).map((r) => ({ text: r.text, options: { ...base, bold: r.bold || base.bold, italic: r.em || base.italic } }))

/** Paragraphs (arrays of runs) → one pptxgenjs run array; a paragraph ends with breakLine on its last run. */
const joinParas = (paras) => paras.flatMap((p, i) => p.map((r, j) => (j === p.length - 1 && i < paras.length - 1 ? { ...r, options: { ...r.options, breakLine: true } } : r)))

/** Rough wrapped-height estimate (inches) for text of `pt` points in a box `w` inches wide. */
function textHeight(strings, pt, w, gap = 0.06) {
  const perLine = Math.max(8, Math.floor((w * 72) / (pt * 0.5)))
  const lines = strings.reduce((n, s) => n + Math.max(1, Math.ceil(T.plain(s).length / perLine)), 0)
  return lines * ((pt * 1.22) / 72) + strings.length * gap + 0.12
}

const shortCite = (c) => {
  const r = R.getReading(c.reading)
  return `${r.id} ${r.unit === 'slide' ? 'sl.' : 'p.'}${c.pages ?? (r.firstPage === r.lastPage ? r.firstPage : `${r.firstPage}–${r.lastPage}`)}`
}

// ------------------------------------------------------------------------------------------- blocks → shapes
/** Draws one block at (x, y) in width w; returns the height used. */
function drawBlock(slide, b, x, y, w, scale = 1) {
  const pt = (n) => Math.round(n * scale)
  switch (b.kind) {
    case 'bullets': {
      const paras = []
      for (const it of b.items) {
        const top = runs(typeof it === 'string' ? it : it.text, { fontSize: pt(20), color: C.fg })
        top[0].options = { ...top[0].options, bullet: { code: '25A0', indent: 18 }, paraSpaceBefore: 6 }
        paras.push(top)
        if (typeof it !== 'string')
          for (const sub of it.sub) {
            const rr = runs(sub, { fontSize: pt(17), color: C.fg })
            rr[0].options = { ...rr[0].options, bullet: { code: '2013', indent: 18 }, indentLevel: 1, paraSpaceBefore: 2 }
            paras.push(rr)
          }
      }
      const strings = b.items.flatMap((it) => (typeof it === 'string' ? [it] : [it.text, ...it.sub]))
      const h = textHeight(strings, pt(20), w - 0.4, 0.09)
      slide.addText(joinParas(paras), { x, y, w, h, fontFace: FONT, valign: 'top', margin: 2 })
      return h
    }
    case 'definition': {
      const h = textHeight([b.text], pt(22), w - 0.5) + 0.75
      slide.addShape('rect', { x, y, w, h, fill: { color: C.accentSoft }, line: { color: C.accentSoft } })
      slide.addShape('rect', { x, y, w: 0.08, h, fill: { color: C.accent }, line: { color: C.accent } })
      slide.addText(
        joinParas([
          [{ text: b.term.toUpperCase(), options: { bold: true, fontSize: pt(13), color: C.fg, charSpacing: 1 } }],
          runs(b.text, { fontSize: pt(22), color: C.fg }),
          [{ text: R.formatCitation(b.source), options: { fontSize: pt(11), color: C.accent, paraSpaceBefore: 6 } }],
        ]),
        { x: x + 0.25, y, w: w - 0.4, h, fontFace: FONT, valign: 'middle', margin: 4 },
      )
      return h
    }
    case 'table': {
      const rowH = 0.4 * scale
      const rows = [
        b.header.map((t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.accent } } })),
        ...b.rows.map((r) => r.map((t, j) => ({ text: T.plain(t), options: { bold: j === 0, color: C.fg, fill: { color: C.white } } }))),
      ]
      // row height ≈ cell padding + wrapped lines of the tallest cell
      const lineH = (pt(16) * 1.2) / 72
      const lines = b.rows.map((r) => Math.max(1, ...r.map((t) => Math.ceil(T.plain(t).length / Math.max(10, ((w / r.length) * 72) / (pt(16) * 0.52))))))
      const h = rowH + lines.reduce((a, n) => a + 0.16 + n * lineH, 0)
      slide.addTable(rows, { x, y, w, fontFace: FONT, fontSize: pt(16), border: { type: 'solid', pt: 0.75, color: C.line }, valign: 'middle', margin: 0.06, autoPage: false })
      let used = h
      if (b.caption) {
        slide.addText(b.caption, { x, y: y + h + 0.05, w, h: 0.3, fontFace: FONT, fontSize: pt(11), italic: true, color: C.muted, margin: 0 })
        used += 0.38
      }
      return used
    }
    case 'equation': {
      const where = (b.where ?? []).map((v) => `${v.symbol} = ${v.meaning}`).join('     ')
      const h = 0.85 + (where ? 0.38 : 0)
      slide.addShape('rect', { x, y, w, h, fill: { color: C.sunk }, line: { color: C.line, width: 0.75 } })
      slide.addText(b.display, { x, y: y + 0.08, w, h: 0.7, fontFace: 'Cambria Math', fontSize: pt(26), color: C.fg, align: 'center', valign: 'middle', altText: b.speech })
      if (where) slide.addText(where, { x, y: y + 0.76, w, h: 0.34, fontFace: FONT, fontSize: pt(13), color: C.muted, italic: true, align: 'center', margin: 0 })
      return h
    }
    case 'callout': {
      const label = b.title ?? { note: 'Note', key: 'Key point', caution: 'Caution' }[b.tone]
      const fill = b.tone === 'caution' ? C.warnSoft : b.tone === 'key' ? C.accentSoft : C.sunk
      const edge = b.tone === 'caution' ? C.warn : b.tone === 'key' ? C.accent : C.line
      const h = textHeight([b.text], pt(17), w - 0.4) + 0.4
      slide.addShape('roundRect', { x, y, w, h, rectRadius: 0.06, fill: { color: fill }, line: { color: edge, width: 1 } })
      slide.addText(joinParas([[{ text: label.toUpperCase(), options: { bold: true, fontSize: pt(12), color: C.fg, charSpacing: 1 } }], runs(b.text, { fontSize: pt(17), color: C.fg })]), { x: x + 0.15, y, w: w - 0.3, h, fontFace: FONT, valign: 'middle', margin: 3 })
      return h
    }
    case 'steps': {
      const paras = b.items.map((st) => [{ text: `${st.label}: `, options: { bold: true, fontSize: pt(19), color: C.fg, bullet: { type: 'number' }, paraSpaceBefore: 6 } }, ...runs(st.text, { fontSize: pt(19), color: C.fg })])
      const h = textHeight(b.items.map((st) => `${st.label}: ${st.text}`), pt(19), w - 0.5, 0.09)
      slide.addText(joinParas(paras), { x, y, w, h, fontFace: FONT, valign: 'top', margin: 2 })
      return h
    }
  }
  return 0
}

/** The type scale a column needs to fit its box (1 = full size, never below 0.72). */
function columnScale(blocks, w, maxH) {
  const probe = { addText() {}, addShape() {}, addTable() {} }
  const h = blocks.reduce((n, b) => n + drawBlock(probe, b, 0, 0, w, 1) + 0.18, 0)
  return h > maxH ? Math.max(0.72, maxH / h) : 1
}

function drawColumn(slide, blocks, x, y, w, maxH, forced) {
  // shrink type once if the column would overflow its box (or use the scale shared with the other column)
  const scale = forced ?? columnScale(blocks, w, maxH)
  let cy = y
  for (const b of blocks) cy += drawBlock(slide, b, x, cy, w, scale) + 0.18
  return cy - y
}

function drawFigure(slide, fig, png, x, y, w, h) {
  const ratio = png.width / png.height
  let fw = w
  let fh = w / ratio
  if (fh > h) {
    fh = h
    fw = h * ratio
  }
  slide.addImage({ path: png.file, x: x + (w - fw) / 2, y: y + (h - fh) / 2, w: fw, h: fh, altText: fig.alt })
}

/** The generated "References and credits" slide: every register entry the lecture cites (two columns) and the license
 *  or use statement of each source, from src/content/lectures/references.ts. */
function drawReferences(slide, lecture, top, bottom) {
  // one page range per reading across the week's decks (sign-off m6)
  const refs = REFS.lectureReferences([lecture], WEEK_LECTURES(lecture.week)).map((e) => REFS.formatReference(e))
  const credits = REFS.lectureCredits([lecture])
  const listW = (W - 2 * MX) * 0.64
  const colW = (listW - 0.3) / 2
  const half = Math.ceil(refs.length / 2)
  const h = bottom - top
  // type size: the longer column must fit the box
  let pt = 12
  while (pt > 8 && Math.max(textHeight(refs.slice(0, half), pt, colW, 0.02), textHeight(refs.slice(half), pt, colW, 0.02)) > h) pt -= 0.5
  ;[refs.slice(0, half), refs.slice(half)].forEach((col, k) =>
    slide.addText(
      col.map((t, i) => ({ text: t, options: { fontSize: pt, color: C.fg, breakLine: i < col.length - 1, paraSpaceAfter: 2 } })),
      { x: MX + k * (colW + 0.3), y: top, w: colW, h, fontFace: FONT, valign: 'top', margin: 2 },
    ),
  )
  const cx = MX + listW + 0.3
  const cw = W - MX - cx
  slide.addShape('rect', { x: cx, y: top, w: 0.06, h, fill: { color: C.accent }, line: { color: C.accent } })
  let cpt = 12
  while (cpt > 8 && textHeight(['Credits and licenses', ...credits], cpt, cw - 0.2, 0.06) > h) cpt -= 0.5
  slide.addText(
    [{ text: 'CREDITS AND LICENSES', options: { bold: true, fontSize: cpt, color: C.fg, charSpacing: 1, breakLine: true } }, ...credits.map((t, i) => ({ text: t, options: { fontSize: cpt, color: C.fg, bullet: { code: '25A0', indent: 12 }, paraSpaceBefore: 4, breakLine: i < credits.length - 1 } }))],
    { x: cx + 0.15, y: top, w: cw - 0.15, h, fontFace: FONT, valign: 'top', margin: 2 },
  )
}

// ------------------------------------------------------------------------------------------- notes text
function notesText(s, no, lecture) {
  const n = s.notes
  const L = [`SLIDE ${no}: ${s.title}`, `Purpose: ${s.purpose}`, `Time: ${s.minutes} min (${n.timing})`, '', 'TEACH']
  n.teach.forEach((t, i) => L.push(`${i + 1}. ${T.plain(t)}`))
  L.push('', `WHY: ${T.plain(n.why)}`)
  if (s.figure && n.figure) L.push('', `EXPLAINING THE FIGURE: ${T.plain(n.figure)}`)
  if (n.workedSolution?.length) {
    L.push('', 'WORKED SOLUTION')
    n.workedSolution.forEach((t, i) => L.push(`${i + 1}. ${T.plain(t)}`))
  }
  if (n.examples?.length) {
    L.push('', 'EXAMPLES')
    n.examples.forEach((t) => L.push(`- ${T.plain(t)}`))
  }
  if (n.misconceptions?.length) {
    L.push('', 'MISCONCEPTIONS')
    n.misconceptions.forEach((m) => L.push(`- "${m.claim}" -> ${m.correction}`))
  }
  L.push('', `TRANSITION: ${T.plain(n.transition)}`)
  if (s.sources.length) L.push('', 'SOURCES', ...s.sources.map((c) => `- ${R.formatCitation(c)}`))
  if (lecture.fixture) L.push('', 'FIXTURE — not course content.')
  return L.join('\n')
}

/** pptxgenjs writes speaker notes as one run with raw line feeds, which PowerPoint shows as a single paragraph.
 *  Rewrite each notes body into real paragraphs (headings in capitals set bold). */
async function notesToParagraphs(buf) {
  const zip = await JSZip.loadAsync(buf)
  for (const name of Object.keys(zip.files).filter((n) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(n))) {
    const xml = await zip.file(name).async('string')
    const fixed = xml.replace(/<a:p><a:r><a:rPr ([^>]*?)\/><a:t>([^<]*\n[^<]*)<\/a:t><\/a:r>(?:<a:endParaRPr[^>]*\/>)?<\/a:p>/, (_m, rpr, text) =>
      text
        .split(/\r?\n/)
        .map((line) => {
          if (!line.trim()) return `<a:p><a:endParaRPr ${rpr}/></a:p>`
          const head = line.match(/^([A-Z][A-Z ]+[A-Z])(:?)(.*)$/)
          if (head && (head[2] || !head[3])) return `<a:p><a:r><a:rPr ${rpr} b="1"/><a:t>${head[1]}${head[2]}</a:t></a:r>${head[3] ? `<a:r><a:rPr ${rpr}/><a:t>${head[3]}</a:t></a:r>` : ''}</a:p>`
          return `<a:p><a:r><a:rPr ${rpr}/><a:t>${line}</a:t></a:r></a:p>`
        })
        .join(''),
    )
    if (fixed === xml && /<a:t>[^<]*\n/.test(xml)) throw new Error(`could not split the speaker notes in ${name}`)
    zip.file(name, fixed)
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
}

// ------------------------------------------------------------------------------------------- deck
function buildDeck(lecture, pngs) {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'
  pptx.author = 'SysML Learning Studio (generated)'
  pptx.company = 'Wright State University'
  pptx.title = `Week ${lecture.week}, Session ${lecture.session}: ${lecture.title}`
  pptx.subject = COURSE
  const weekLine = `Week ${lecture.week} · Session ${lecture.session}`
  const footer = [
    { line: { x: MX, y: FOOT_TOP, w: W - 2 * MX, h: 0, line: { color: C.line, width: 0.75 } } },
    { text: { text: COURSE, options: { x: MX, y: FOOT_TOP + 0.05, w: 6, h: 0.35, fontFace: FONT, fontSize: 11, color: C.muted, margin: 0 } } },
    { text: { text: weekLine, options: { x: W / 2 - 1.5, y: FOOT_TOP + 0.05, w: 3, h: 0.35, fontFace: FONT, fontSize: 11, color: C.muted, align: 'center', margin: 0 } } },
  ]
  const slideNumber = { x: W - MX - 1, y: FOOT_TOP + 0.05, w: 1, h: 0.35, fontFace: FONT, fontSize: 11, color: C.fg, bold: true, align: 'right' }
  pptx.defineSlideMaster({
    title: 'LECTURE',
    background: { color: C.white },
    objects: [{ rect: { x: 0, y: 0, w: W, h: 0.12, fill: { color: C.accent } } }, { line: { x: MX, y: 1.2, w: W - 2 * MX, h: 0, line: { color: C.accent, width: 2.5 } } }, ...footer],
    slideNumber,
  })
  pptx.defineSlideMaster({
    title: 'LECTURE_TITLE',
    background: { color: C.white },
    objects: [{ rect: { x: 0, y: 0, w: 0.35, h: H, fill: { color: C.accent } } }, ...footer],
    slideNumber,
  })

  const slides = T.allSlides(lecture)
  slides.forEach((s, i) => {
    const isTitle = s.layout === 'title'
    const slide = pptx.addSlide({ masterName: isTitle ? 'LECTURE_TITLE' : 'LECTURE' })
    if (lecture.fixture)
      slide.addText('FIXTURE — not course content', { x: W - MX - 3.2, y: 0.2, w: 3.2, h: 0.3, fontFace: FONT, fontSize: 10, bold: true, color: C.fg, fill: { color: C.warnSoft }, align: 'center', margin: 2 })

    // caption and sources line above the footer; sources in short form ("R11 p.552"): the full entries are on the
    // generated "References and credits" slide and in the speaker notes
    const meta = []
    if (s.figure) meta.push({ text: 'Figure. ', options: { bold: true, color: C.fg } }, { text: s.figure.caption, options: { color: C.muted, breakLine: s.sources.length > 0 } })
    if (s.sources.length) meta.push({ text: 'Sources: ', options: { bold: true, color: C.fg } }, { text: s.sources.map(shortCite).join('; '), options: { color: C.muted } })
    const metaH = meta.length ? textHeight([...(s.figure ? [`Figure. ${s.figure.caption}`] : []), ...(s.sources.length ? [`Sources: ${s.sources.map(shortCite).join('; ')}`] : [])], 10.5, W - 2 * MX, 0) : 0
    const metaTop = META_BOTTOM - metaH
    if (meta.length) slide.addText(meta, { x: MX, y: metaTop, w: W - 2 * MX, h: metaH, fontFace: FONT, fontSize: 10.5, valign: 'bottom', margin: 0 })
    const contentBottom = (meta.length ? metaTop : META_BOTTOM) - 0.15

    if (s.layout === 'references') {
      slide.addText(s.title, { x: MX, y: 0.32, w: W - 2 * MX, h: 0.8, fontFace: HEAD, fontSize: 30, bold: true, color: C.fg, valign: 'bottom', margin: 0 })
      drawReferences(slide, lecture, CONTENT_TOP, contentBottom)
    } else if (isTitle) {
      slide.addText(weekLine.toUpperCase(), { x: 1.1, y: 1.35, w: 10, h: 0.4, fontFace: FONT, fontSize: 16, bold: true, color: C.accent, charSpacing: 2, margin: 0 })
      // a two-line title at 44 pt needs about 1.5 in (Week 1 final review: the 1.3 in box overflowed into the subtitle)
      slide.addText(s.title, { x: 1.1, y: 1.8, w: 11, h: 1.6, fontFace: HEAD, fontSize: 44, bold: true, color: C.fg, valign: 'top', margin: 0 })
      if (s.subtitle) slide.addText(s.subtitle, { x: 1.1, y: 3.5, w: 11, h: 0.6, fontFace: FONT, fontSize: 22, color: C.muted, margin: 0 })
      drawColumn(slide, s.body, 1.1, 4.3, 8.5, contentBottom - 4.3)
    } else {
      slide.addText(s.title, { x: MX, y: 0.32, w: W - 2 * MX - (lecture.fixture ? 3.3 : 0), h: 0.8, fontFace: HEAD, fontSize: 30, bold: true, color: C.fg, valign: 'bottom', margin: 0 })
      if (s.subtitle) slide.addText(s.subtitle, { x: MX, y: 1.24, w: W - 2 * MX, h: 0.35, fontFace: FONT, fontSize: 16, color: C.muted, margin: 0 })
      const top = CONTENT_TOP + (s.subtitle ? 0.3 : 0)
      const boxH = contentBottom - top
      const fullW = W - 2 * MX
      const split = s.layout === 'figure-bullets' || s.layout === 'two-column' || (s.aside?.length && s.layout !== 'figure')
      const png = s.figure ? pngs.get(s.figure.id) : undefined
      if (split) {
        const lw = fullW * 0.575
        const rw = fullW - lw - 0.4
        const right = s.figure ? [...s.body, ...(s.aside ?? [])] : (s.aside ?? [])
        // two text columns share one type scale, so two tables side by side use one font size
        const shared = s.figure ? undefined : Math.min(columnScale(s.body, lw, boxH), columnScale(right, rw, boxH))
        if (s.figure) drawFigure(slide, s.figure, png, MX, top, lw, boxH)
        else drawColumn(slide, s.body, MX, top, lw, boxH, shared)
        drawColumn(slide, right, MX + lw + 0.4, top, rw, boxH, shared)
      } else if (s.figure) {
        const bodyH = s.body.length ? Math.min(boxH * 0.35, drawColumn({ addText() {}, addShape() {}, addTable() {} }, s.body, MX, 0, fullW, boxH)) : 0
        drawFigure(slide, s.figure, png, MX, top, fullW, boxH - bodyH - (bodyH ? 0.15 : 0))
        if (bodyH) drawColumn(slide, s.body, MX, top + boxH - bodyH, fullW, bodyH)
      } else {
        drawColumn(slide, s.body, MX, top, fullW, boxH)
      }
    }
    slide.addNotes(notesText(s, i + 1, lecture))
  })
  return pptx
}

// ------------------------------------------------------------------------------------------- figures
async function renderFigures(ids) {
  mkdirSync(CACHE, { recursive: true })
  browser = await chromium.launch({ channel: 'chrome' })
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, colorScheme: 'light', deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const out = new Map()
  for (const id of ids) {
    await page.goto(`http://127.0.0.1:${PORT}/#/figure/${id}`)
    await page.locator('[data-testid="figure-canvas"][data-ready="true"]').waitFor({ timeout: 30_000 })
    await page.evaluate(() => document.fonts.ready)
    // clip to the drawing itself: an SVG scaled with preserveAspectRatio "meet" sits centered in its element box
    const clip = await page.evaluate(() => {
      const art = document.querySelector('.lec-canvas .lec-figure-art')
      const el = art?.firstElementChild
      if (!el) return null
      const svg = el.tagName.toLowerCase() === 'svg' ? el : null
      const r = el.getBoundingClientRect()
      let box = { x: r.x, y: r.y, width: r.width, height: r.height }
      if (svg && svg.viewBox.baseVal && svg.viewBox.baseVal.width > 0) {
        const vb = svg.viewBox.baseVal
        const k = Math.min(r.width / vb.width, r.height / vb.height)
        const w = vb.width * k
        const h = vb.height * k
        box = { x: r.x + (r.width - w) / 2, y: r.y + (r.height - h) / 2, width: w, height: h }
      }
      const pad = 12
      const x = Math.max(0, box.x - pad)
      const y = Math.max(0, box.y - pad)
      return { x, y, width: Math.min(1600 - x, box.width + 2 * pad), height: Math.min(900 - y, box.height + 2 * pad) }
    })
    if (!clip) throw new Error(`figure ${id} rendered nothing at #/figure/${id}`)
    const file = path.join(CACHE, `${id}.png`)
    await page.screenshot({ path: file, clip: { x: Math.floor(clip.x), y: Math.floor(clip.y), width: Math.ceil(clip.width), height: Math.ceil(clip.height) } })
    out.set(id, { file, width: Math.ceil(clip.width), height: Math.ceil(clip.height) })
    console.log(`  figure ${id}: ${Math.ceil(clip.width)}×${Math.ceil(clip.height)} px`)
  }
  await browser.close()
  browser = undefined
  return out
}

// ------------------------------------------------------------------------------------------- main
async function main() {
  server = await createServer({ root: APP, configFile: path.join(APP, 'vite.config.ts'), logLevel: 'warn', server: { host: '127.0.0.1', port: PORT, strictPort: true, hmr: false } })
  await server.listen()
  console.log(`vite dev server (own) on http://127.0.0.1:${PORT}`)
  const L = await server.ssrLoadModule('/src/content/lectures/index.ts')
  const V = await server.ssrLoadModule('/src/content/lectures/validate.ts')
  const M = await server.ssrLoadModule('/src/content/lectures/markdown.ts')
  T = await server.ssrLoadModule('/src/content/lectures/text.ts')
  R = await server.ssrLoadModule('/src/content/readings.ts')
  REFS = await server.ssrLoadModule('/src/content/lectures/references.ts')
  WEEK_LECTURES = (week) => L.lecturesOfWeek(week)

  const lectures = L.LECTURES.filter((l) => ONLY_WEEK === undefined || l.week === ONLY_WEEK)
  if (lectures.length === 0) throw new Error('no lectures to build')
  // --week N validates that week only, so one week's export is not blocked by another week still in progress
  const issues = V.validateLectures(ONLY_WEEK === undefined ? L.LECTURES : lectures)
  if (issues.length) {
    for (const i of issues) console.error(`  [${i.code}] ${i.where}: ${i.message}`)
    throw new Error(`${issues.length} validation issue(s): fix the lecture source before exporting`)
  }

  const ids = new Set()
  for (const l of lectures) {
    for (const s of T.allSlides(l)) if (s.figure) ids.add(s.figure.id)
    for (const ls of l.studentLesson) for (const b of ls.blocks) if (b.kind === 'figure' && 'figure' in b) ids.add(b.figure.id)
  }
  console.log(`rendering ${ids.size} figure(s) at 1600×900 (light)`)
  const pngs = await renderFigures([...ids])

  mkdirSync(OUT, { recursive: true })
  mkdirSync(PUBLIC, { recursive: true })
  const weeks = new Set()
  for (const l of lectures) {
    const stem = T.lectureStem(l)
    const file = path.join(OUT, `${stem}.pptx`)
    const raw = await buildDeck(l, pngs).write({ outputType: 'nodebuffer' })
    writeFileSync(file, await notesToParagraphs(raw))
    copyFileSync(file, path.join(PUBLIC, `${stem}.pptx`))
    writeFileSync(path.join(OUT, `${stem}-notes.md`), M.notesMarkdown(l, L.lecturesOfWeek(l.week)), 'utf8')
    console.log(`  wrote ${path.relative(REPO, file)} (${T.allSlides(l).length} slides) and ${stem}-notes.md`)
    weeks.add(l.week)
  }
  for (const w of weeks) {
    const file = path.join(OUT, `week${T.pad2(w)}-lesson.md`)
    // the handout embeds the figure PNGs rendered above (exports/lectures/.figure-cache/<id>.png, relative to the file)
    writeFileSync(file, M.lessonMarkdown(w, L.lecturesOfWeek(w), (id) => `.figure-cache/${id}.png`), 'utf8')
    console.log(`  wrote ${path.relative(REPO, file)}`)
  }
}

let code = 0
try {
  await main()
} catch (e) {
  console.error(`lectures:pptx failed: ${e instanceof Error ? e.message : e}`)
  code = 1
} finally {
  await shutdown()
  console.log('server and browser closed')
}
process.exit(code)
