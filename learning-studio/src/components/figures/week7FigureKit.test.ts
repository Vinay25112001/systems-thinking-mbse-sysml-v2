// Week 7 figures meet the projector type rule and stay inside their drawing. For every figure a Week 7 slide shows, the
// figure is rendered to SVG markup, the box it occupies on the slide is derived from the slide's layout (figure-bullets,
// full-width figure, or full-width figure with a body below), and every <text> is checked: its font size is at least
// 1/56 of the slide width once placed (week7FigureKit.minLabelFor), and its estimated extent lies inside the viewBox.
// Every registered Week 7 figure is used by a slide, and every slide figure is registered. Each rule is shown able to
// fail on a deliberately wrong input.
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { WEEK7_SESSION1 } from '../../content/lectures/week07/session1'
import { WEEK7_SESSION2 } from '../../content/lectures/week07/session2'
import { allSlides } from '../../content/lectures/text'
import type { Slide } from '../../content/lectures/types'
import { WEEK7_S1_FIGURES, WEEK7_S2_FIGURES } from './lectureWeek7Figures'
import { BOX_IN, LABEL_IN, minLabelFor, textW, type FigureBox } from './week7FigureKit'

const FIGS = { ...WEEK7_S1_FIGURES, ...WEEK7_S2_FIGURES }
const slides = [...allSlides(WEEK7_SESSION1), ...allSlides(WEEK7_SESSION2)].filter((s) => s.figure)
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

describe('Week 7 figures: the projector type rule (1/56 of the slide width) and labels inside the drawing', () => {
  it('the rule is computed from the slide geometry: 13.333 in ÷ 56', () => {
    expect(LABEL_IN).toBeCloseTo(0.238, 3)
    expect(minLabelFor('figure-bullets', 900, 520)).toBe(32)
    expect(minLabelFor('figure-with-body', 1200, 280)).toBe(25)
    expect(BOX_IN.figure.w).toBeGreaterThan(BOX_IN['figure-bullets'].w)
  })
  it('every Week 7 slide figure is registered, and every registered Week 7 figure is shown on a slide', () => {
    const used = new Set(slides.map((s) => s.figure!.id))
    expect([...used].filter((id) => !FIGS[id])).toEqual([])
    expect(Object.keys(FIGS).filter((id) => !used.has(id))).toEqual([])
  })
  for (const s of slides)
    it(`${s.figure!.id} on ${s.id} (${boxOf(s)}): every label large enough and inside the drawing`, () => {
      const svg = render(s.figure!.id, s.figure!.alt)
      expect(svg).toContain(`aria-label="`)
      // a figure with no parsed label would pass vacuously: every Week 7 figure has labels
      expect(parse(svg).texts.length).toBeGreaterThan(0)
      expect(parse(svg).texts.every((t) => Number.isFinite(t.size) && Number.isFinite(t.x) && Number.isFinite(t.y))).toBe(true)
      expect(problems(s.figure!.id, boxOf(s), svg)).toEqual([])
    })
  it('negative direction: a small label and a label off the edge are both caught', () => {
    const bad = '<svg viewBox="0 0 900 520"><text x="10" y="20" font-size="20" text-anchor="start">tiny</text><text x="890" y="200" font-size="32" text-anchor="start">off the edge</text></svg>'
    const p = problems('w7s1-where', 'figure-bullets', bad)
    expect(p.some((x) => /tiny.*< 32/.test(x))).toBe(true)
    expect(p.some((x) => /off the edge.*outside the width/.test(x))).toBe(true)
  })
})
