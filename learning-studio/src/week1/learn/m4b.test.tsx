// Week 1 textbook, Milestone M4 part B: the authored gap prose (authored.ts) and the interactive figures IF-6 (stakeholder
// ecosystem map) and IF-7 (progressive trace). Proves: every citation of the new prose resolves to a verified register
// entry inside its page range; every definition is a quotation; course conventions are labelled; AeroLink facts are read
// from the case modules (tables equal the data); no SysML semantics are claimed; the figures work by keyboard, announce
// their state politely, keep a text equivalent and follow the reduced-motion and "Show all" rules of spec §d.9.
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MISSION_GOALS, NEEDS, RELATIONSHIPS, STAKEHOLDERS } from '../../content/lectures/week01/aerolinkCase'
import { REL_TYPES } from '../../content/lectures/week01/labBrief'
import type { LessonBlock } from '../../content/lectures/types'
import { citationInRange, getReading } from '../../content/readings'
import * as NEW from './authored'
import { buildChapter, learnAsLecture } from './model'
import ProgressiveTrace, { TRACE_STEPS, stepStatus } from './ProgressiveTrace'
import StakeholderMap, { NODE_ORDER, relationshipsOf, statusText, unrelated } from './StakeholderMap'
import { splitCitations, studentText } from './studentText'
import { CHAPTERS, sectionById } from './textbook'
import { lectureReferences } from '../../content/lectures/references'
import { Providers } from '../../state/Providers'
import LearnReader from './LearnReader'

const ExtensionProbe = () => (
  <Providers>
    <LearnReader chapter="ch05" path="/week/1/learn/ch05" />
  </Providers>
)

const ALL: LessonBlock[] = Object.values(NEW).flatMap((v) => (Array.isArray(v) ? (v as LessonBlock[]) : []))
const texts = (b: LessonBlock): string[] => {
  switch (b.kind) {
    case 'para':
    case 'heading':
    case 'callout':
    case 'definition':
      return [b.text]
    case 'bullets':
      return b.items.map((i) => (typeof i === 'string' ? i : i.text))
    case 'table':
      return [...b.rows.flat(), b.caption ?? '', ...b.header]
    default:
      return []
  }
}
const prose = ALL.flatMap(texts).join('\n')

describe('Authored gap prose (M4b)', () => {
  it('every inline citation and every definition source resolves to a verified register entry, inside its page range', () => {
    const cites = [...ALL.flatMap(texts).flatMap((t) => splitCitations(t).flatMap((s) => ('cite' in s ? [s.cite] : []))), ...ALL.flatMap((b) => (b.kind === 'definition' ? [b.source] : []))]
    expect(cites.length).toBeGreaterThan(25)
    for (const c of cites) {
      const r = getReading(c.reading)
      expect(r.verified, c.reading).toBe(true)
      expect(citationInRange(c), `${c.reading} p.${c.pages}`).toBe(true)
    }
    // the five glossary entries added through the register pipeline for this prose are cited
    for (const id of ['R39y', 'R39z', 'R110', 'R111', 'R112', 'R113']) expect(cites.some((c) => c.reading === id), id).toBe(true)
  })

  it('every definition is a verbatim quotation (in “…”), never a paraphrase presented as a definition', () => {
    const defs = ALL.filter((b) => b.kind === 'definition')
    expect(defs.length).toBe(8)
    for (const d of defs) if (d.kind === 'definition') expect(d.text, d.term).toMatch(/^“[^”]+”/)
  })

  it('labels course conventions where no source defines the term, and says so', () => {
    for (const phrase of ['No source in the course collection defines *assumption*', 'No source in the collection separates the terms', 'None is defined in the course collection', 'No source in the collection defines a *problem statement*', 'criteria are a course convention with no source in the collection']) expect(prose).toContain(phrase)
  })

  it('claims no SysML semantics for the Week 1 relations', () => {
    expect(prose).toContain('they are not SysML relationships, they claim no SysML semantics')
    expect(prose).not.toMatch(/SysML (?:relationship|dependency|connection) (?:between|from)/i)
  })

  it('says “objectives” for MGO-002…: “goal” only inside quotations', () => {
    // as rendered: case data that still says “goal” (MODEL_INPUTS) passes through the student wording, as reused text does
    expect(studentText(prose).replace(/“[^”]*”/g, '')).not.toMatch(/goals?/i)
  })

  it('reads AeroLink facts from the case: the 5.4 table equals the needs grouped by objective, the 7.3 table covers the seven types', () => {
    const t = NEW.CH05_04.find((b) => b.kind === 'table')
    expect(t?.kind === 'table' && t.rows.map((r) => r[2])).toEqual(MISSION_GOALS.map((m) => NEEDS.filter((n) => n.mgo === m.id).map((n) => n.id).join(', ')))
    const rel = NEW.CH07_03.find((b) => b.kind === 'table')
    expect(rel?.kind === 'table' && rel.rows.length).toBe(REL_TYPES.length)
    expect(rel?.kind === 'table' && rel.rows.flatMap((r) => r[2].split(', ')).sort()).toEqual(RELATIONSHIPS.map((r) => r.id).sort())
  })

  it('the References back matter lists the readings the new prose cites', () => {
    const ids = lectureReferences([learnAsLecture()]).map((e) => e.reading.id)
    for (const id of ['R39y', 'R39z', 'R110', 'R111', 'R112', 'R50', 'R03']) expect(ids, id).toContain(id)
  })

  it('places IF-6 in 7.3 and IF-7 in 10.2, and moves the static trace-lanes figure to 10.5', () => {
    expect(sectionById('ch07-03')!.section.parts.some((p) => p.kind === 'interactive' && p.id === 'IF-6')).toBe(true)
    expect(sectionById('ch10-02')!.section.parts.some((p) => p.kind === 'interactive' && p.id === 'IF-7')).toBe(true)
    const ch10 = buildChapter(CHAPTERS[9])
    expect(ch10.sections.find((s) => s.section.id === 'ch10-05')!.blocks.some((b) => b.kind === 'figure' && b.figure.id === 'w1s2-trace-lanes')).toBe(true)
  })
})

describe('Review M4b dispositions', () => {
  it('F1: 3.1 quotes the SEBoK glossary definition of systems thinking and no longer says SEBoK has none', () => {
    const t = [...NEW.CH03_01, ...NEW.CH03_01_EXT, ...NEW.CH03_01_END].flatMap(texts).join(' ')
    expect(t).toContain('“A discipline for examining wholes, interrelationships, and patterns utilizing a specific set of tools and techniques”')
    expect(t).not.toMatch(/SEBoK gives no definition/)
    expect(t).toContain('it is often used where cause and effect')
  })

  it('F4, F5, F7, F8: interest as content, one-clause “is affected by”, no “needs become requirements”, “elaborates” not “refines”', () => {
    expect(prose).not.toMatch(/Interest is a magnitude/)
    expect(prose).toContain('**level of interest**')
    expect(prose).toContain('B’s decisions or actions influence A.')
    expect(prose).not.toMatch(/needs become stakeholder requirements/)
    expect(prose).not.toMatch(/\brefines\b/)
  })

  it('F6: the 10.5 stakeholder row states the A25 fields (level of interest required; influence and support optional)', () => {
    const t = NEW.CH10_05_EXT.find((b) => b.kind === 'table')
    const row = t?.kind === 'table' ? t.rows.find((r) => r[0].startsWith('Stakeholders')) : undefined
    expect(row?.[1]).toBe('ID, name, classification, level of interest with a reason (required); influence and support (optional)')
  })

  it('extension reading (faculty decision 2026-10-21; packages A–C) renders in a labelled box and is not counted in the required words', async () => {
    const { learnWords, learnWordsAll, learnWordsOptional } = await import('./words')
    expect(learnWordsOptional()).toBeGreaterThan(900)
    expect(learnWords() + learnWordsOptional()).toBe(learnWordsAll())
    const marked = CHAPTERS.flatMap((c) => c.sections.filter((s) => s.parts.some((p) => p.kind === 'reuse' && p.optional)).map((s) => s.id))
    expect(marked.sort()).toEqual(['ch02-04', 'ch03-01', 'ch04-03', 'ch05-03', 'ch10-05', 'ch11-04'])
    const ch5 = buildChapter(CHAPTERS[4]).sections.find((s) => s.section.id === 'ch05-03')!
    expect(ch5.blocks.filter((b) => b.optional).length).toBeGreaterThan(0)
    const { container } = render(<ExtensionProbe />)
    expect(container.querySelector('[data-testid="learn-extension"]')).toHaveTextContent('Extension reading (optional, not counted)')
  })
})

describe('IF-6 Stakeholder ecosystem map (LRN-21)', () => {
  it('shows all fifteen stakeholders, highlights the conflict by default, filters by type and announces politely', async () => {
    const user = userEvent.setup()
    render(<StakeholderMap number="7.1" />)
    const fig = screen.getByTestId('if6-ecosystem-map')
    expect(fig.querySelectorAll('.w1l-ifig-panel [data-node]')).toHaveLength(STAKEHOLDERS.length)
    expect(NODE_ORDER).toHaveLength(STAKEHOLDERS.length)
    const status = screen.getByTestId('if6-status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveTextContent(`Showing ${RELATIONSHIPS.length} of ${RELATIONSHIPS.length} relationships. Conflict highlighted: REL-002.`)
    expect(fig.querySelector('path[data-rel="REL-002"]')).toHaveClass('is-conflict')
    // seven type chips, native checkboxes
    const chips = within(fig).getAllByRole('checkbox')
    expect(chips).toHaveLength(7)
    await user.click(within(fig).getByLabelText('coordinates with'))
    expect(status).toHaveTextContent(`Showing ${RELATIONSHIPS.length - 2} of ${RELATIONSHIPS.length} relationships.`)
    expect(fig.querySelector('path[data-rel="REL-005"]')).toBeNull()
    await user.click(within(fig).getByLabelText('conflicts with'))
    expect(status).not.toHaveTextContent('Conflict highlighted')
  })

  it('moves between nodes with the arrow keys and selects with Enter; the side list gives concerns and relationships in words', async () => {
    const user = userEvent.setup()
    render(<StakeholderMap number="7.1" />)
    const fig = screen.getByTestId('if6-ecosystem-map')
    const first = fig.querySelector<SVGGElement>(`[data-node="${NODE_ORDER[0]}"]`)!
    expect(first).toHaveAttribute('tabindex', '0')
    first.focus()
    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(fig.querySelector(`[data-node="${NODE_ORDER[1]}"]`))
    await user.keyboard('{End}{Enter}')
    const last = NODE_ORDER[NODE_ORDER.length - 1]
    expect(fig.querySelector(`[data-node="${last}"]`)).toHaveAttribute('aria-pressed', 'true')
    const detail = screen.getByTestId('if6-detail')
    const s = STAKEHOLDERS.find((x) => x.id === last)!
    expect(detail).toHaveTextContent(`${s.id} ${s.name}`)
    for (const c of s.concerns) expect(detail).toHaveTextContent(c)
    expect(screen.getByTestId('if6-status')).toHaveTextContent(`Selected ${s.id}`)
    // the select is a second keyboard route, and a stakeholder without relationships says so
    const lonely = unrelated()[0]
    await user.selectOptions(screen.getByTestId('if6-select'), lonely.id)
    expect(screen.getByTestId('if6-detail')).toHaveTextContent('None recorded')
    expect(relationshipsOf('STK-005').length).toBe(3)
    // F5: “A is affected by B” draws its arrowhead at A (B influences A); the legend says so
    const affected = RELATIONSHIPS.find((r) => r.type === 'affected-by')!
    const path = fig.querySelector(`.w1l-ifig-panel path[data-rel="${affected.id}"]`)!
    expect(path.getAttribute('marker-start')).toMatch(/url/)
    expect(path.getAttribute('marker-end')).toBeNull()
    expect(screen.getByTestId('if6-legend')).toHaveTextContent('direction of influence')
  })

  it('has a text equivalent with every relationship and the stakeholders with none', () => {
    render(<StakeholderMap number="7.1" />)
    const te = screen.getByTestId('if6-text-equivalent')
    expect(within(te).getAllByRole('row')).toHaveLength(RELATIONSHIPS.length + 1)
    for (const s of unrelated()) expect(te).toHaveTextContent(s.name)
    expect(statusText([...REL_TYPES], null)).toMatch(/^Showing 8 of 8/)
  })
})

describe('IF-7 Progressive trace (LRN-22)', () => {
  it('opens on “Show all”, walks one step at a time from the enterprise, and never autoplays', async () => {
    const user = userEvent.setup()
    render(<ProgressiveTrace number="10.1" />)
    const status = screen.getByTestId('if7-status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveTextContent(`All ${TRACE_STEPS.length} steps shown.`)
    expect(screen.getByTestId('if7-step')).toBeDisabled()
    await user.click(screen.getByTestId('if7-restart'))
    expect(status).toHaveTextContent('Step 1 of 7. ENT-001 AeroLink Urban Mobility')
    await user.click(screen.getByTestId('if7-step'))
    expect(status).toHaveTextContent('ENT-001 states the mission MGO-001')
    await user.click(screen.getByTestId('if7-step'))
    expect(status).toHaveTextContent('MGO-004 elaborates MGO-001')
    await user.click(screen.getByTestId('if7-all'))
    expect(status).toHaveTextContent('not yet created')
  })

  it('reads the chain from NEED-010’s record and labels the future links “not yet created”', () => {
    const n10 = NEEDS.find((n) => n.id === 'NEED-010')!
    expect(TRACE_STEPS.join(' ')).toContain(`${n10.id} supports ${n10.mgo}`)
    expect(TRACE_STEPS.join(' ')).toContain('CON-011 motivates NEED-010')
    expect(TRACE_STEPS[6]).toMatch(/not yet created/)
    expect(TRACE_STEPS.join(' ')).toMatch(/course convention/)
    expect(TRACE_STEPS.join(' ')).not.toMatch(/SysML/)
    expect(stepStatus(7)).toMatch(/^All 7 steps shown/)
  })

  it('keeps the ordered-list text equivalent one click away', () => {
    render(<ProgressiveTrace number="10.1" />)
    const te = screen.getByTestId('if7-text-equivalent')
    expect(within(te).getAllByRole('listitem')).toHaveLength(TRACE_STEPS.length)
  })
})
