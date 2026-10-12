// Week 8 information-flow tracer (pure). For each information item (INFO): producers (X flows-to INFO), consumers
// (INFO flows-to Y), and the decision it supports (attributes.decisionSupported, or INFO flows-to DEC).
// Rules: L8 acceptance "every INFO names the decision it supports"; RB-7.5 "producers, consumers, flows; data vs
// information distinguished; the decision each item supports". Data vs information follows SEBoK Information
// Management (R21 p.512): data are raw unstructured values; information is structured data in context that has been
// analysed and interpreted. The decision-wording check is a screening heuristic (instructor-authored).
import type { EngineeringModel } from '../../model/engineering'
import type { ArchIf } from './architecture'

export type InfoTrace = {
  id: string
  name: string
  producers: string[]
  consumers: string[]
  decision: string
  decisionIds: string[]
  problems: string[]
  advisories: string[]
}

// A choice frame: "whether …", "which <noun> to …", "when to …", "how much/many/long/often/far …", or a decision verb.
// Bare "which", "when", "if" and "order" are NOT enough ("awareness of which aircraft are flying", "stored if needed";
// review W8-F05).
const CHOICE = /\b(whether|which(\s+[\w-]+){1,3}\s+to|when\s+to|how\s+(much|many|long|often|far)|select|choose|release|withhold|assign|place|lift|accept|reject|approve|defer|withdraw|restrict|divert|cancel|go\s*\/\s*no-go)\b/i
const IDS = /\b(?:REQ-(?:STK|SYS)|DEC|MOE|MOP|O|R|A|U)-\d{3}\b/g

/** A decision statement must name a choice someone makes (whether / which / when / release or withhold …). */
export function decisionProblem(text: string, decLinks = 0): string | null {
  const t = text.trim()
  if (!t && decLinks === 0) return 'No decision named.'
  if (!t) return null
  if (t.split(/\s+/).length < 4) return 'The decision is too short to say what is decided.'
  if (!CHOICE.test(t)) return 'The text describes a use (monitoring, reporting, awareness) but names no choice that the information changes.'
  return null
}

const pre = (id: string) => id.split('-')[0]

export function traceInformation(m: EngineeringModel, ifs: ArchIf[] = []): InfoTrace[] {
  const live = new Set(m.elements.filter((e) => e.status === 'active').map((e) => e.id))
  const links = m.links.filter((l) => l.type === 'flows-to' && live.has(l.source) && live.has(l.target))
  // Course typing rule (review W8-F04): information is carried only by an INFORMATION interface. An organisational or
  // physical interface between the same ends is reported, but it does not carry the item.
  const joining = (a: string, b: string) => ifs.filter((i) => i.ends && ((i.ends[0] === a && i.ends[1] === b) || (i.ends[0] === b && i.ends[1] === a)))
  return m.elements
    .filter((e) => e.kind === 'INFO' && e.status === 'active')
    .map((e) => {
      const producers = links.filter((l) => l.target === e.id).map((l) => l.source)
      const allOut = links.filter((l) => l.source === e.id).map((l) => l.target)
      const decLinks = allOut.filter((t) => pre(t) === 'DEC')
      const consumers = allOut
      const decision = String(e.attributes?.decisionSupported ?? '')
      const decisionIds = [...new Set([...(decision.match(IDS) ?? []), ...decLinks])]
      const problems: string[] = []
      const advisories: string[] = []
      if (!producers.length) problems.push(e.attributes?.producer ? 'Producer named in text only, not linked.' : 'No producer.')
      if (!consumers.length) problems.push(e.attributes?.consumer ? 'Consumer named in text only, not linked.' : 'No consumer.')
      const d = decisionProblem(decision, decLinks.length)
      if (d) problems.push(d)
      if (!d && decisionIds.length === 0) advisories.push('The decision cites no REQ, DEC or measure ID, so it cannot be traced.')
      const physical = (x: string) => ['PHY', 'EXT'].includes(pre(x))
      for (const p of producers.filter(physical))
        for (const c of consumers.filter(physical)) {
          const there = joining(p, c)
          if (there.some((i) => i.type === 'information')) continue
          advisories.push(
            there.length
              ? `${p} → ${c}: only ${there.map((i) => `${i.id} (${i.type || 'untyped'})`).join(', ')} joins these ends; information needs an information interface or a recorded relay path.`
              : `${p} → ${c}: no declared interface joins these ends; declare an information interface or record the relay path.`,
          )
        }
      return { id: e.id, name: e.name, producers, consumers, decision, decisionIds, problems, advisories }
    })
}

// ------------------------------------------------------------------------------------------------
// Practice set: a peer team's information view with seeded defects (FICTIONAL; INFO-1nn IDs so it never collides with
// the reference INFO-001..005).
const el = (id: string, name: string, attributes: Record<string, string> = {}) => ({ id, kind: id.split('-')[0] as 'INFO', name, attributes, provenance: 'instructor-fictional' as const, status: 'active' as const })
const phy = (id: string, name: string) => ({ id, kind: 'PHY' as const, name, provenance: 'instructor-reference' as const, status: 'active' as const })
let k = 0
const fl = (source: string, target: string) => ({ id: `LNK-P8-${String(++k).padStart(3, '0')}`, source, type: 'flows-to' as const, target })

export const PEER_INFO_SAMPLE: EngineeringModel = {
  elements: [
    phy('PHY-001', 'eVTOL Aircraft'), phy('PHY-002', 'Vertiports'), phy('PHY-003', 'Charging Systems'), phy('PHY-004', 'Operations Center'), phy('PHY-005', 'Maintenance Facility'), phy('PHY-007', 'Passenger booking platform'),
    { id: 'EXT-003', kind: 'EXT', name: 'Weather', provenance: 'instructor-reference', status: 'active' },
    el('INFO-101', 'Charger telemetry', { decisionSupported: 'Used for monitoring and reporting across the operations centre' }),
    el('INFO-102', 'Passenger feedback', { decisionSupported: 'Whether to change the boarding-gate layout at the hub vertiports' }),
    el('INFO-103', 'Wind observations', { decisionSupported: 'Place or lift a dispatch hold at a vertiport (REQ-SYS-004)' }),
    el('INFO-104', 'Battery cycle counts', {}),
    el('INFO-105', 'Grid tariff schedule', { decisionSupported: 'When to schedule overnight charging at the spoke vertiports (O-002)' }),
  ],
  links: [
    fl('PHY-003', 'INFO-101'), fl('INFO-101', 'PHY-004'),
    fl('PHY-007', 'INFO-102'),
    fl('EXT-003', 'INFO-103'), fl('INFO-103', 'PHY-004'),
    fl('PHY-001', 'INFO-104'), fl('INFO-104', 'PHY-005'),
    fl('INFO-105', 'PHY-003'),
  ],
}

/** Items of the peer sample that fail at least one required rule (the answer key for the prediction exercise). */
export const PEER_FAILING = ['INFO-101', 'INFO-102', 'INFO-104', 'INFO-105']

export type PredictionResult = { hits: string[]; missed: string[]; falseAlarms: string[] }
export function scorePrediction(predicted: string[], actual: string[]): PredictionResult {
  return {
    hits: predicted.filter((p) => actual.includes(p)).sort(),
    missed: actual.filter((a) => !predicted.includes(a)).sort(),
    falseAlarms: predicted.filter((p) => !actual.includes(p)).sort(),
  }
}

// ------------------------------------------------------------------------------------------------
// Data or information? (R21 p.512). FICTIONAL AeroLink examples.
export type DiItem = { id: string; text: string; answer: 'data' | 'information'; why: string }
export const DATA_OR_INFORMATION: DiItem[] = [
  { id: 'd1', text: 'Cell temperatures of pack 7 sampled once per second during the last charge session.', answer: 'data', why: 'Raw recorded values with no interpretation yet: data in R21’s synthesised definition.' },
  { id: 'd2', text: 'Pack 7 is predicted to reach its capacity-fade limit in about 40 cycles; schedule its withdrawal at the next maintenance slot.', answer: 'information', why: 'The samples have been analysed and interpreted in context, and the result is addressed to a decision maker.' },
  { id: 'd3', text: 'Wind speed 11.2 m/s, gust 16.8 m/s, timestamp 07:41, station HUB-2.', answer: 'data', why: 'An observation record whose values have not been compared with anything: data under R21’s synthesised definition (p.512). It becomes information when compared with the aircraft limit for that vertiport. (GEIA-STD-927B, quoted on R21 p.511, would already call a labelled record “organised”; that is why the course names the definition it follows.)' },
  { id: 'd4', text: 'Gusts at hub 2 will exceed the aircraft limit within 30 min; a dispatch hold is recommended.', answer: 'information', why: 'Forecast data compared with a limit and interpreted for the dispatch-hold decision (REQ-SYS-004).' },
  { id: 'd5', text: 'Raw export of Tuesday’s booking-server log: 1,184 lines such as “07:41:12;V1;V3;2;ok”.', answer: 'data', why: 'Unparsed values with no analysis or context: data in R21’s synthesised definition (p.512).' },
  { id: 'd6', text: 'Tuesday demand at the airport hub peaked at 1.4 times the plan between 07:00 and 09:00, so the wait objective was missed for that hour.', answer: 'information', why: 'The records have been aggregated, compared with the plan and interpreted against an objective.' },
]
