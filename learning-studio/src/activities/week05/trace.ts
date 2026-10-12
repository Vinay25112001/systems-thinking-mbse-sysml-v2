// Week 5 traceability logic (pure). Bidirectional trace over an EngineeringModel: backward (child REQ → parent
// NEED/CAP/REQ) and forward (parent → child REQ), with orphans and childless parents (DoD SE Guidebook §4.1.4,
// R45 p.118). Two childless-parent checks of equal standing are reported: (1) R45's own case, a high-level
// requirement not addressed by lower-level requirements or system element designs (operationalised here as a
// REQ-STK with no child REQ and no satisfying design element); (2) the course's extension of the same idea to NEED and
// CAP elements with no child requirement (engineering.ts `orphansAndChildless`, which also supplies the orphans).
import { kindOfId, orphansAndChildless, requirementCoverage, type Element, type EngineeringModel, type Link } from '../../model/engineering'

const PARENT_LINKS: Link['type'][] = ['derives-from', 'refines']

export type TraceRow = {
  id: string
  name: string
  level: 'stakeholder' | 'system'
  /** Backward trace: what this requirement derives from or refines. */
  parents: string[]
  /** Forward trace: lower-level requirements that derive from or refine this one. */
  children: string[]
  satisfiedBy: string[]
  verifiedBy: string[]
  measuredBy: string[]
}

export type TraceSummary = {
  requirements: number
  withParent: number
  /** Share of active requirements with at least one parent, 0..1 (0 when there are no requirements). */
  parentCoverage: number
  orphans: string[]
  /** Check 2 (course extension): NEED and CAP elements with no child requirement (engineering.ts rule). */
  childlessNeedsCaps: string[]
  /** Check 1 (R45 p.118): REQ-STK with neither a child REQ nor a satisfying design element. */
  childlessStakeholderReqs: string[]
  /** Parents (NEED/CAP) considered in the childless check. */
  parentsChecked: number
}

function liveLinks(m: EngineeringModel): Link[] {
  const live = new Set(m.elements.filter((e) => e.status === 'active').map((e) => e.id))
  return m.links.filter((l) => live.has(l.source) && live.has(l.target))
}

export function traceRows(m: EngineeringModel): TraceRow[] {
  const links = liveLinks(m)
  return m.elements
    .filter((e) => e.kind === 'REQ' && e.status === 'active')
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((r) => ({
      id: r.id,
      name: r.name,
      level: r.id.startsWith('REQ-STK') ? 'stakeholder' : 'system',
      parents: links.filter((l) => l.source === r.id && PARENT_LINKS.includes(l.type)).map((l) => l.target).sort(),
      children: links.filter((l) => l.target === r.id && PARENT_LINKS.includes(l.type) && kindOfId(l.source) === 'REQ').map((l) => l.source).sort(),
      satisfiedBy: links.filter((l) => l.target === r.id && l.type === 'satisfies').map((l) => l.source).sort(),
      verifiedBy: links.filter((l) => l.target === r.id && l.type === 'verifies').map((l) => l.source).sort(),
      measuredBy: links.filter((l) => l.target === r.id && l.type === 'measures').map((l) => l.source).sort(),
    }))
}

/** Forward trace from a NEED/CAP/REQ: the requirements that derive from or refine it, directly. */
export function childrenOf(m: EngineeringModel, parent: string): string[] {
  return liveLinks(m)
    .filter((l) => l.target === parent && PARENT_LINKS.includes(l.type) && kindOfId(l.source) === 'REQ')
    .map((l) => l.source)
    .sort()
}

export function traceSummary(m: EngineeringModel): TraceSummary {
  const cov = requirementCoverage(m)
  const { orphans, childless } = orphansAndChildless(m)
  const rows = traceRows(m)
  const withParent = cov.filter((c) => c.hasParent).length
  return {
    requirements: cov.length,
    withParent,
    parentCoverage: cov.length ? withParent / cov.length : 0,
    orphans: [...orphans].sort(),
    childlessNeedsCaps: [...childless].sort(),
    childlessStakeholderReqs: rows.filter((r) => r.level === 'stakeholder' && r.children.length === 0 && r.satisfiedBy.length === 0).map((r) => r.id),
    parentsChecked: m.elements.filter((e) => (e.kind === 'NEED' || e.kind === 'CAP') && e.status === 'active').length,
  }
}

export type PredictionFeedback = { correct: string[]; missed: string[]; wrong: string[]; exact: boolean }

/** Compare a student's predicted set (e.g. of orphans) with the computed set. */
export function comparePrediction(predicted: string[], actual: string[]): PredictionFeedback {
  const p = new Set(predicted)
  const a = new Set(actual)
  const correct = [...p].filter((x) => a.has(x)).sort()
  const missed = [...a].filter((x) => !p.has(x)).sort()
  const wrong = [...p].filter((x) => !a.has(x)).sort()
  return { correct, missed, wrong, exact: missed.length === 0 && wrong.length === 0 }
}

// ------------------------------------------------------------------------------------------------
// Peer-team audit sample (FICTIONAL "Team Kestrel" L4 extract, deliberately defective) for worked examples (a), (b)
// and the trace explorer. The NEED/CAP elements are the instructor reference's (week03.ts), with the same IDs, names
// and meanings. Kestrel's own requirements differ from the reference, so they carry their own 9xx IDs
// (REQ-STK-901.., REQ-SYS-901..), which never collide with reference IDs (AUTHORING_GUIDE §7 rule 8).

const el = (id: string, name: string, text?: string): Element => ({ id, kind: kindOfId(id)!, name, text, provenance: 'instructor-fictional', status: 'active' })
let n = 0
const ln = (source: string, target: string): Link => ({ id: `LNK-W5P-${String(++n).padStart(3, '0')}`, source, type: 'derives-from', target })

export const PEER_SAMPLE: EngineeringModel = {
  elements: [
    el('NEED-001', 'Short, predictable wait to board'),
    el('NEED-002', 'Assurance of flight within safety limits'),
    el('NEED-003', 'Noise kept within the local agreement'),
    el('NEED-004', 'Pads not limited by turnaround'),
    el('CAP-001', 'On-demand passenger transport'),
    el('CAP-002', 'Ride booking and dispatch'),
    el('CAP-003', 'Fleet charging management'),
    el('CAP-004', 'Flight operations within safety limits'),
    el('CAP-007', 'Noise-managed vertiport operations'),
    el('REQ-STK-901', 'Passenger wait', 'The AeroLink service shall board at least 90 % of passengers in each calendar month within 15 min of their ride confirmation.'),
    el('REQ-STK-902', 'Pad-edge noise', 'The AeroLink service shall keep every take-off and landing at or below 65 dBA LAmax at the pad edge of each vertiport.'),
    el('REQ-STK-903', 'Hub turnaround', 'The AeroLink service will turn aircraft around quickly at hubs, and the charging system shall charge aircraft in 20 min.'),
    el('REQ-SYS-901', 'Charge time', 'The charging system shall charge an aircraft from the 20 % reserve to the dispatch threshold within 20 min.'),
    el('REQ-SYS-902', 'Aircraft noise', 'The eVTOL aircraft shall produce no more than 65 dBA LAmax at the pad edge during take-off and landing on the published procedures.'),
    el('REQ-SYS-903', 'Booking app', 'The booking app shall be user-friendly and should load quickly.'),
    el('REQ-SYS-904', 'Assignment time', 'The scheduling function shall assign a dispatch-ready aircraft to at least 99 % of confirmed ride requests within 60 s of confirmation.'),
    el('REQ-SYS-905', 'Airframe', 'The aircraft shall have a carbon-fibre airframe.'),
  ],
  links: [
    ln('REQ-STK-901', 'NEED-001'), ln('REQ-STK-901', 'CAP-001'),
    ln('REQ-STK-902', 'NEED-003'), ln('REQ-STK-902', 'CAP-007'),
    ln('REQ-STK-903', 'NEED-004'), ln('REQ-STK-903', 'CAP-003'),
    ln('REQ-SYS-901', 'REQ-STK-903'),
    ln('REQ-SYS-902', 'REQ-STK-902'),
    ln('REQ-SYS-904', 'REQ-STK-901'),
  ],
}
