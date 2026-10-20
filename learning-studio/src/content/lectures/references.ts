// References and credits, GENERATED from the lecture source: every citation a lecture uses (slide sources, definition
// sources, lesson sources and definitions) merged per register entry, and the license or use statement of every source
// those citations come from. One function feeds the closing "References and credits" slide in the viewer
// (src/lectures/SlideFace.tsx) and in the .pptx (scripts/build-lectures.mjs), the faculty-notes Markdown and the week's
// reader section, so the list cannot drift from the citations. Statements below are quoted from each source's own
// front matter in _source_cache (SEBoK PDF p.31 "Bkcase Wiki:Copyright"; S10 p.1; MITRE SEG p.4; DoD Guidebook p.1).
import { getReading, type Citation, type Reading } from '../readings'
import { allSlides } from './text'
import type { Block, Lecture } from './types'

/** License or use statement per source (register source ID). Quoted where the source prescribes the wording. */
export const SOURCE_CREDITS: Record<string, string> = {
  S11: 'SEBoK v2.14: “This material is used under a Creative Commons Attribution-NonCommercial ShareAlike 3.0 Unported License from The Trustees of the Stevens Institute of Technology.” (SEBoK, “Bkcase Wiki:Copyright”, PDF p.31). Quotations are short and cited; no SEBoK figure or table is reproduced.',
  S10: 'Introduction to the SysML v2 Language, Textual Notation (Release 2026-08): Copyright © 2019–2026 Model Driven Solutions, Inc. Licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0).',
  S13: 'The MITRE Systems Engineering Guide: © 2014 by The MITRE Corporation. All rights reserved. Approved for public release; distribution unlimited (Case Numbers 10-4072 and 12-1089). Quoted briefly with attribution.',
  S12: 'OUSD(R&E) Systems Engineering Guidebook: Distribution Statement A. Approved for public release. Distribution is unlimited.',
}

/** Credits that hold for every course lecture. */
export const COURSE_CREDITS = [
  'Figures are original drawings for this course; none redraws a figure from the sources.',
  'AeroLink Urban Mobility is a fictional teaching case: every number, name and statement about it is a teaching value.',
]

export type ReferenceEntry = { reading: Reading; pages: string }

/** Every citation in a lecture (slides and lesson). */
export function lectureCitations(l: Lecture): Citation[] {
  const fromBlocks = (bs: { kind: string }[]) => bs.flatMap((b) => (b.kind === 'definition' ? [(b as Extract<Block, { kind: 'definition' }>).source] : []))
  return [
    ...allSlides(l).flatMap((s) => [...s.sources, ...fromBlocks(s.body), ...fromBlocks(s.aside ?? [])]),
    ...l.studentLesson.flatMap((ls) => [...ls.sources, ...fromBlocks(ls.blocks)]),
  ]
}

const idOrder = (id: string) => {
  const m = id.match(/^R(\d+)([a-z]?)$/)
  return m ? parseInt(m[1], 10) * 100 + (m[2] ? m[2].charCodeAt(0) - 96 : 0) : 99999
}
const firstNum = (s: string) => parseInt(s, 10) || 0

/** One entry per register reading cited in `lectures`, its cited pages merged ("p.549, 551–555"), in register order.
 *  `pagesFrom` (default: the same lectures) widens the page ranges: a deck's credits slide passes the whole week, so a
 *  reading cited in both sessions shows one range in both decks (sign-off review m6). */
export function lectureReferences(lectures: Lecture[], pagesFrom: Lecture[] = lectures): ReferenceEntry[] {
  const cited = new Set(lectures.flatMap((l) => lectureCitations(l).map((c) => getReading(c.reading).id)))
  const pages = new Map<string, Set<string>>()
  for (const l of [...new Set([...lectures, ...pagesFrom])])
    for (const c of lectureCitations(l)) {
      const r = getReading(c.reading)
      const set = pages.get(r.id) ?? new Set<string>()
      const parts = (c.pages ?? (r.firstPage === r.lastPage ? `${r.firstPage}` : `${r.firstPage}–${r.lastPage}`)).split(',').map((p) => p.trim().replace(/-/g, '–'))
      for (const p of parts) if (p) set.add(p)
      pages.set(r.id, set)
    }
  return [...pages.entries()]
    .filter(([id]) => cited.has(id))
    .sort(([a], [b]) => idOrder(a) - idOrder(b))
    .map(([id, set]) => {
      // union of the cited pages: overlapping or adjacent ranges merge ("549–552" + "551–555" → "549–555")
      const ranges = [...set]
        .map((p) => {
          const [a, b] = p.split('–').map(firstNum)
          return { a, b: Math.max(a, b || a) }
        })
        .sort((x, y) => x.a - y.a || x.b - y.b)
      const merged: { a: number; b: number }[] = []
      for (const r of ranges) {
        const last = merged.at(-1)
        if (last && r.a <= last.b + 1) last.b = Math.max(last.b, r.b)
        else merged.push({ ...r })
      }
      return { reading: getReading(id), pages: merged.map((r) => (r.a === r.b ? `${r.a}` : `${r.a}–${r.b}`)).join(', ') }
    })
}

/** "R11 · SEBoK v2.14 (2026), “Stakeholder Needs Definition”, p.549, 551–555". */
export const formatReference = (e: ReferenceEntry) => `${e.reading.id} · ${e.reading.sourceTitle}, “${e.reading.title}”, ${e.reading.unit === 'slide' ? 'sl.' : 'p.'}${e.pages}`

/** License and use statements for the sources the lectures cite, then the course credits. */
export function lectureCredits(lectures: Lecture[]): string[] {
  const sources = [...new Set(lectureReferences(lectures).map((e) => e.reading.source))].sort()
  return [...sources.map((s) => SOURCE_CREDITS[s]).filter((t): t is string => !!t), ...COURSE_CREDITS]
}
