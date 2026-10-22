// Week 11 figures meet the projector type rule and stay inside their drawing. For every drawn figure a Week 11 slide
// shows, the figure is rendered to SVG markup, the box it occupies on the slide is derived from the slide's layout
// (figure-bullets, full-width figure, or full-width figure with a body below), and every <text> is checked: its font size
// is at least 1/56 of the slide width once placed (week7FigureKit.minLabelFor), and its estimated extent lies inside the
// viewBox. Every registered Week 11 drawn figure is used by a slide, every slide figure is registered, every listing
// figure names a listing that exists, and every drawn figure is labelled a course illustration. Session 2 and its figure
// map are read when they exist (they are written separately), so the checks cover whatever is registered. Each rule is
// shown able to fail on a deliberately wrong input. Review status: new-pending-review.
import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ifOf, shortName } from '../../content/lectures/week11/aerolinkCase'
import { LISTINGS } from '../../content/lectures/week11/listings'
import { WEEK11_SESSION1 } from '../../content/lectures/week11/session1'
import { allSlides } from '../../content/lectures/text'
import type { Lecture, Slide } from '../../content/lectures/types'
import { WEEK11_S1_FIGURES } from './lectureWeek11S1Figures'
import { BOX_IN, LABEL_IN, minLabelFor, textW, type FigureBox } from './week7FigureKit'
import { ELEMENT_IDS, T_11, W11, codeLines, crossingsOf, elementLinks, homesOf } from './week11FigureKit'

type Entry = { title: string; C: ComponentType<{ alt: string }> }
const S2_FIGS = Object.values(import.meta.glob<{ WEEK11_S2_FIGURES: Record<string, Entry> }>('./lectureWeek11S2Figures.ts', { eager: true }))[0]?.WEEK11_S2_FIGURES ?? {}
const S2 = Object.values(import.meta.glob<{ WEEK11_SESSION2: Lecture }>('../../content/lectures/week11/session2.ts', { eager: true }))[0]?.WEEK11_SESSION2
const AGG = Object.values(import.meta.glob<{ WEEK11_LISTING_FIGURES: Record<string, string> }>('./lectureWeek11Figures.ts', { eager: true }))[0]?.WEEK11_LISTING_FIGURES

const FIGS: Record<string, Entry> = { ...WEEK11_S1_FIGURES, ...S2_FIGS }
const lectures = [WEEK11_SESSION1, ...(S2 ? [S2] : [])]
const allFigureRefs = lectures.flatMap((l) => [
  ...allSlides(l).flatMap((s) => (s.figure ? [{ id: s.figure.id, caption: s.figure.caption, where: s.id }] : [])),
  ...l.studentLesson.flatMap((sec) => sec.blocks.flatMap((b) => (b.kind === 'figure' && 'figure' in b ? [{ id: b.figure.id, caption: b.figure.caption, where: sec.id }] : []))),
])
const isListing = (id: string) => id.includes('-listing-')
const slides = lectures.flatMap((l) => allSlides(l)).filter((s) => s.figure && !isListing(s.figure.id))
const boxOf = (s: Slide): FigureBox => (s.layout === 'figure-bullets' || s.layout === 'two-column' ? 'figure-bullets' : s.body.length ? 'figure-with-body' : 'figure')

type TextEl = { size: number; x: number; y: number; anchor: string; text: string }
function parse(svg: string): { w: number; h: number; texts: TextEl[] } {
  const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)!
  const texts: TextEl[] = []
  for (const m of svg.matchAll(/<text([^>]*)>([^<]*)<\/text>/g)) {
    const a = m[1]
    const num = (k: string) => Number((a.match(new RegExp(`\\s${k}="([\\d.-]+)"`)) ?? [])[1])
    texts.push({ size: num('font-size'), x: num('x'), y: num('y'), anchor: (a.match(/text-anchor="(\w+)"/) ?? [])[1] ?? 'start', text: m[2].replace(/&#x27;|&amp;|&quot;|&lt;|&gt;/g, 'x') })
  }
  return { w: Number(vb[1]), h: Number(vb[2]), texts }
}
const render = (id: string, alt = 'test') => renderToStaticMarkup(createElement(FIGS[id].C, { alt }))
/** Problems of one rendered figure in one box: labels below the minimum, labels outside the drawing. */
function problems(id: string, box: FigureBox, svg = render(id)): string[] {
  const { w, h, texts } = parse(svg)
  const min = minLabelFor(box, w, h)
  const out: string[] = []
  for (const t of texts) {
    if (!(t.size >= min)) out.push(`${id}: “${t.text}” at ${t.size} < ${min}`)
    const width = textW(t.text, t.size)
    const left = t.anchor === 'middle' ? t.x - width / 2 : t.anchor === 'end' ? t.x - width : t.x
    if (left < -2 || left + width > w + 2) out.push(`${id}: “${t.text}” runs outside the width (${Math.round(left)}..${Math.round(left + width)} of ${w})`)
    if (t.y - t.size / 2 < -2 || t.y + t.size / 2 > h + 2) out.push(`${id}: “${t.text}” runs outside the height (y ${t.y} of ${h})`)
  }
  return out
}

describe('Week 11 drawn figures: the projector type rule (1/56 of the slide width) and labels inside the drawing', () => {
  it('the rule is computed from the slide geometry: 13.333 in ÷ 56', () => {
    expect(LABEL_IN).toBeCloseTo(0.238, 3)
    expect(minLabelFor('figure-bullets', W11.w, W11.h)).toBe(T_11)
    expect(T_11).toBe(32)
    expect(BOX_IN.figure.w).toBeGreaterThan(BOX_IN['figure-bullets'].w)
  })
  it('every drawn slide figure is registered, and every registered drawn figure is shown on a slide (listings are drawn by the listing figure, exempt from the label rule as in Weeks 8 and 9)', () => {
    const used = new Set(slides.map((s) => s.figure!.id))
    expect([...used].filter((id) => !FIGS[id])).toEqual([])
    expect(Object.keys(FIGS).filter((id) => !used.has(id))).toEqual([])
    expect(Object.keys(WEEK11_S1_FIGURES).length).toBeGreaterThan(0)
  })
  for (const s of slides)
    it(`${s.figure!.id} on ${s.id} (${boxOf(s)}): every label large enough and inside the drawing`, () => {
      const svg = render(s.figure!.id, s.figure!.alt)
      expect(svg).toContain(`aria-label="`)
      // a figure with no parsed label would pass vacuously: every Week 11 drawn figure has labels
      expect(parse(svg).texts.length).toBeGreaterThan(0)
      expect(parse(svg).texts.every((t) => Number.isFinite(t.size) && Number.isFinite(t.x) && Number.isFinite(t.y))).toBe(true)
      expect(problems(s.figure!.id, boxOf(s), svg)).toEqual([])
    })
  it('negative direction: a small label and a label off the edge are both caught', () => {
    const bad = '<svg viewBox="0 0 900 520"><text x="10" y="20" font-size="20" text-anchor="start">tiny</text><text x="890" y="200" font-size="32" text-anchor="start">off the edge</text></svg>'
    const p = problems('w11s1-week-band', 'figure-bullets', bad)
    expect(p.some((x) => /tiny.*< 32/.test(x))).toBe(true)
    expect(p.some((x) => /off the edge.*outside the width/.test(x))).toBe(true)
  })
})

describe('Week 11 listing figures name listings that exist and are registered', () => {
  const listingRefs = allFigureRefs.filter((f) => isListing(f.id))
  it('every listing figure on a slide or in the lesson names a Week 11 listing', () => {
    expect(listingRefs.length).toBeGreaterThan(0)
    expect(listingRefs.filter((f) => !LISTINGS[f.id.replace(/^w11s\d-listing-/, '')]).map((f) => f.id)).toEqual([])
  })
  it('every listing figure used is in the listing-figure map, mapped to its own key (when the map is present)', () => {
    if (!AGG) return
    for (const f of listingRefs) expect(AGG[f.id], f.id).toBe(f.id.replace(/^w11s\d-listing-/, ''))
  })
  it('listing captions state the recorded result; drawn captions do not claim one', () => {
    for (const f of listingRefs) expect(f.caption, f.id).toMatch(/Checked: (PASS|FAIL)/)
    for (const s of slides) expect(s.figure!.caption, s.figure!.id).not.toMatch(/Checked:/)
  })
})

// Directive §3D: a teaching drawing is kept apart from the standard notation. Every Week 11 drawn figure (not a checked
// code listing, which is the textual notation itself) says so in its caption, on the slide, in the lesson and in the deck.
const ILLUSTRATION = 'Course illustration, not SysML v2 graphical notation.'
const unlabeled = (ss: Slide[]) => ss.filter((s) => !s.figure!.caption.includes(ILLUSTRATION)).map((s) => s.figure!.id)
describe('Week 11 drawn figures are labelled as course illustrations', () => {
  it('every drawn figure caption carries the label; listings do not need it', () => {
    expect(slides.length).toBeGreaterThanOrEqual(Object.keys(WEEK11_S1_FIGURES).length)
    expect(unlabeled(slides)).toEqual([])
  })
  it('negative direction: a caption without the label is caught', () => {
    expect(unlabeled([{ ...slides[0], figure: { ...slides[0].figure!, caption: 'A drawing.' } }])).toEqual([slides[0].figure!.id])
  })
})

describe('Week 11 figure data is computed from the case and the listings', () => {
  it('the elements figure draws exactly the interfaces between its elements, the ones its slide’s alt text names', () => {
    const links = elementLinks()
    const slide = allSlides(WEEK11_SESSION1).find((x) => x.id === 'w11s1-physical-arch')!
    for (const l of links) expect(slide.figure!.alt, l.id).toContain(`${l.id} between ${shortName(l.a)} and ${shortName(l.b)}`)
    expect(slide.figure!.alt.match(/IF-\d{3}/g)!.length).toBe(links.length)
    expect(ELEMENT_IDS.length).toBe(5)
  })
  it('the split-allocation figure reads the homes of Flight Operations from the allocations', () => {
    const h = homesOf('LOG-001')
    expect(h.homes.map((x) => x.phy).sort()).toEqual(['PHY-001', 'PHY-004'])
    expect(h.homes.flatMap((x) => x.fns).sort()).toEqual([...h.performs].sort())
  })
  it('the crossings table reads the charging interface from the model', () => {
    expect(crossingsOf('IF-005').map((c) => c.item)).toEqual(ifOf('IF-005').flows.map((f) => f.itemName))
  })
  it('code cards wrap long lines below the width a 32-unit label allows and drop no text', () => {
    const lines = codeLines('two-ports-card', 0, undefined, 44)
    expect(lines.every((l) => l.text.length <= 44)).toBe(true)
    expect(lines.map((l) => l.text).join(' ')).toContain('end port outlet : OxygenPort;')
  })
})
