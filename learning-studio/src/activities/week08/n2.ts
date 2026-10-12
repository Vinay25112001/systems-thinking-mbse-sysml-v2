// Week 8 N² (N-squared) matrices and the coupling metric (pure).
// Design aim: SEBoK Physical Architecture, R20c p.599 (a candidate architecture may aim at fewer physical interfaces)
// and p.603 (modularity: maximum consistency inside an element, minimum physical interfaces with the outside).
// Integration analogue: SEBoK System Integration, R22 p.630-631 — in integration, the coupling matrix is reorganised
// to group implemented elements into aggregates, minimising the interfaces to be verified between aggregates.
// INSTRUCTOR-DEFINED (course convention, not stated by the sources):
//   - the interface N² is symmetric (an IF joins two ends); each IF is counted once, in the upper triangle;
//   - the functional N² is directed: row = producing function, column = consuming function (outputs on rows);
//   - the functional flows FN_FLOWS below (a teaching set over the reference FN-001..014; FICTIONAL), or the
//     student's own FN -> FN flows read from the workspace (flowsFromModel);
//   - the coupling metric: E flows, X flows that cross a PHY boundary, κ = X / E, P = PHY pairs joined by a crossing
//     flow (each needs a direct interface or a recorded relay path, so P is an upper bound on the direct interfaces
//     needed, not a minimum), D_max = largest number of such partners of one PHY;
//   - the typed coverage rule in pairsWithoutInterface.
import type { EngineeringModel } from '../../model/engineering'
import type { ArchIf } from './architecture'

export type N2Edge = { id: string; a: string; b: string; type: string; label: string }
export type N2Matrix = {
  nodes: string[]
  /** cells[i][j] for i < j (upper triangle): the edges joining nodes[i] and nodes[j]. */
  cells: N2Edge[][][]
  edges: N2Edge[]
  byType: Record<string, number>
  degree: Record<string, number>
  isolated: string[]
  /** Number of node pairs joined by at least one edge. */
  pairs: number
}

const order = (ids: string[]) => {
  const rank = (id: string) => (id.startsWith('PHY') ? 0 : id.startsWith('EXT') ? 1 : 2)
  return [...new Set(ids)].sort((x, y) => rank(x) - rank(y) || x.localeCompare(y))
}

/** Symmetric interface N² over the ends of the given interfaces (plus any extra nodes, e.g. isolated PHY). */
export function interfaceN2(ifs: ArchIf[], extraNodes: string[] = []): N2Matrix {
  const edges: N2Edge[] = ifs.filter((i) => i.ends && i.ends[0] !== i.ends[1]).map((i) => ({ id: i.id, a: i.ends![0], b: i.ends![1], type: i.type || 'untyped', label: i.name }))
  const nodes = order([...extraNodes, ...edges.flatMap((e) => [e.a, e.b])])
  const idx = new Map(nodes.map((n, k) => [n, k]))
  const cells: N2Edge[][][] = nodes.map(() => nodes.map(() => []))
  const degree: Record<string, number> = Object.fromEntries(nodes.map((n) => [n, 0]))
  const byType: Record<string, number> = {}
  for (const e of edges) {
    const [i, j] = [idx.get(e.a)!, idx.get(e.b)!].sort((p, q) => p - q)
    cells[i][j].push(e)
    degree[e.a] += 1
    degree[e.b] += 1
    byType[e.type] = (byType[e.type] ?? 0) + 1
  }
  const pairs = cells.reduce((n, row) => n + row.filter((c) => c.length > 0).length, 0)
  return { nodes, cells, edges, byType, degree, isolated: nodes.filter((n) => degree[n] === 0), pairs }
}

// ------------------------------------------------------------------------------------------------
// Functional flows and allocation alternatives

export type FlowKind = 'information' | 'energy' | 'material'
export type FnFlow = { id: string; from: string; to: string; item: string; kind: FlowKind }

/** Instructor-defined teaching set of function-to-function flows over the reference functions (FICTIONAL). */
export const FN_FLOWS: FnFlow[] = [
  { id: 'F01', from: 'FN-001', to: 'FN-002', item: 'Confirmed ride request', kind: 'information' },
  { id: 'F02', from: 'FN-002', to: 'FN-001', item: 'Assignment and boarding time', kind: 'information' },
  { id: 'F03', from: 'FN-013', to: 'FN-002', item: 'Hourly demand forecast', kind: 'information' },
  { id: 'F04', from: 'FN-009', to: 'FN-002', item: 'Available aircraft list', kind: 'information' },
  { id: 'F05', from: 'FN-002', to: 'FN-003', item: 'Assigned trip', kind: 'information' },
  { id: 'F06', from: 'FN-003', to: 'FN-012', item: 'Route and departure time', kind: 'information' },
  { id: 'F07', from: 'FN-012', to: 'FN-011', item: 'Flight-intent acceptance', kind: 'information' },
  { id: 'F08', from: 'FN-003', to: 'FN-011', item: 'Flight plan with landing energy', kind: 'information' },
  { id: 'F09', from: 'FN-004', to: 'FN-011', item: 'Vertiport dispatch holds', kind: 'information' },
  { id: 'F10', from: 'FN-008', to: 'FN-011', item: 'Go / no-go status', kind: 'information' },
  { id: 'F11', from: 'FN-006', to: 'FN-011', item: 'Charge-complete status', kind: 'information' },
  { id: 'F12', from: 'FN-011', to: 'FN-005', item: 'Flight release', kind: 'information' },
  { id: 'F13', from: 'FN-014', to: 'FN-005', item: 'Boarded passengers', kind: 'material' },
  { id: 'F14', from: 'FN-005', to: 'FN-014', item: 'Arriving passengers', kind: 'material' },
  { id: 'F15', from: 'FN-006', to: 'FN-005', item: 'Battery energy', kind: 'energy' },
  { id: 'F16', from: 'FN-007', to: 'FN-006', item: 'Charging power share', kind: 'energy' },
  { id: 'F17', from: 'FN-005', to: 'FN-008', item: 'Health and fault reports', kind: 'information' },
  { id: 'F18', from: 'FN-008', to: 'FN-009', item: 'Aircraft availability status', kind: 'information' },
  { id: 'F19', from: 'FN-002', to: 'FN-011', item: 'Aircraft assignment', kind: 'information' },
]

export type Allocation = Record<string, string>

/** Alternative A: the reference FN -> PHY allocation (src/model/reference/week08.ts). */
export const ALLOCATION_A: Allocation = {
  'FN-001': 'PHY-007', 'FN-002': 'PHY-004', 'FN-003': 'PHY-004', 'FN-004': 'PHY-004', 'FN-005': 'PHY-001',
  'FN-006': 'PHY-003', 'FN-007': 'PHY-003', 'FN-008': 'PHY-005', 'FN-009': 'PHY-004', 'FN-010': 'PHY-008',
  'FN-011': 'PHY-004', 'FN-012': 'PHY-004', 'FN-013': 'PHY-004', 'FN-014': 'PHY-002',
}

/** Alternative B: distributed dispatch — matching and dispatch at the vertiports (an alternative DEC-002 considered). */
export const ALLOCATION_B: Allocation = { ...ALLOCATION_A, 'FN-002': 'PHY-002', 'FN-011': 'PHY-002' }

export type Coupling = {
  /** E: function-to-function flows with both ends allocated. */
  flows: number
  /** X: flows whose producer and consumer sit on different physical elements. */
  crossing: number
  internal: number
  /** κ = X / E (0 when E = 0). */
  kappa: number
  /** P: unordered PHY pairs joined by at least one crossing flow (each needs a direct interface or a recorded relay). */
  pairs: { a: string; b: string; flows: string[] }[]
  /** Interface partners of each PHY. */
  partners: Record<string, number>
  maxPartners: { phy: string[]; count: number }
  crossingFlows: FnFlow[]
  unallocated: string[]
}

export function coupling(flows: FnFlow[], alloc: Allocation): Coupling {
  const unallocated = [...new Set(flows.flatMap((f) => [f.from, f.to]))].filter((fn) => !alloc[fn]).sort()
  const counted = flows.filter((f) => alloc[f.from] && alloc[f.to])
  const crossingFlows = counted.filter((f) => alloc[f.from] !== alloc[f.to])
  const pairMap = new Map<string, { a: string; b: string; flows: string[] }>()
  for (const f of crossingFlows) {
    const [a, b] = [alloc[f.from], alloc[f.to]].sort()
    const k = `${a}|${b}`
    if (!pairMap.has(k)) pairMap.set(k, { a, b, flows: [] })
    pairMap.get(k)!.flows.push(f.id)
  }
  const pairs = [...pairMap.values()].sort((x, y) => x.a.localeCompare(y.a) || x.b.localeCompare(y.b))
  const partners: Record<string, number> = {}
  for (const phy of new Set(Object.values(alloc))) partners[phy] = 0
  for (const p of pairs) {
    partners[p.a] = (partners[p.a] ?? 0) + 1
    partners[p.b] = (partners[p.b] ?? 0) + 1
  }
  const count = Math.max(0, ...Object.values(partners))
  return {
    flows: counted.length,
    crossing: crossingFlows.length,
    internal: counted.length - crossingFlows.length,
    kappa: counted.length ? crossingFlows.length / counted.length : 0,
    pairs,
    partners,
    maxPartners: { phy: Object.keys(partners).filter((k) => partners[k] === count && count > 0).sort(), count },
    crossingFlows,
    unallocated,
  }
}

/** Directed PHY × PHY matrix induced by an allocation: cell [i][j] lists the flows from PHY i to PHY j (i ≠ j). */
export function inducedN2(flows: FnFlow[], alloc: Allocation): { phys: string[]; cells: string[][][] } {
  const phys = [...new Set(Object.values(alloc))].sort()
  const idx = new Map(phys.map((p, k) => [p, k]))
  const cells: string[][][] = phys.map(() => phys.map(() => []))
  for (const f of flows) {
    const a = alloc[f.from]
    const b = alloc[f.to]
    if (a && b && a !== b) cells[idx.get(a)!][idx.get(b)!].push(f.id)
  }
  return { phys, cells }
}

/** Directed functional N²: cell [i][j] lists the flows from function i to function j. */
export function functionalN2(flows: FnFlow[]): { fns: string[]; cells: string[][][] } {
  const fns = [...new Set(flows.flatMap((f) => [f.from, f.to]))].sort()
  const idx = new Map(fns.map((p, k) => [p, k]))
  const cells: string[][][] = fns.map(() => fns.map(() => []))
  for (const f of flows) cells[idx.get(f.from)!][idx.get(f.to)!].push(f.id)
  return { fns, cells }
}

// ------------------------------------------------------------------------------------------------
// Interface coverage of crossing flows (course typing rule, instructor-defined; review W8-F04)
//   An information flow is carried only by an INFORMATION interface; an energy or material flow only by a PHYSICAL
//   interface. An ORGANISATIONAL interface (an agreed procedure or responsibility) carries no flow by itself: it says
//   who does what, not how the data, energy or material get across. A flow with no matching interface needs one, or a
//   recorded relay path through other elements.

export const IF_TYPE_FOR: Record<FlowKind, 'information' | 'physical'> = { information: 'information', energy: 'physical', material: 'physical' }

export type InterfaceGap = {
  a: string
  b: string
  /** Crossing flows on this pair that no interface of the matching type carries. */
  flows: string[]
  /** Interfaces that do join the pair, with their type (e.g. "IF-009 organisational"); empty when none does. */
  present: string[]
}

const joins = (i: ArchIf, a: string, b: string) => !!i.ends && ((i.ends[0] === a && i.ends[1] === b) || (i.ends[0] === b && i.ends[1] === a))

/** Crossing PHY pairs with at least one flow that no interface of the matching type carries. */
export function pairsWithoutInterface(c: Coupling, ifs: ArchIf[]): InterfaceGap[] {
  const kindOf = new Map(c.crossingFlows.map((f) => [f.id, f.kind]))
  return c.pairs
    .map((p) => {
      const there = ifs.filter((i) => joins(i, p.a, p.b))
      const uncovered = p.flows.filter((id) => !there.some((i) => i.type === IF_TYPE_FOR[kindOf.get(id) ?? 'information']))
      return { a: p.a, b: p.b, flows: uncovered, present: there.map((i) => `${i.id} ${i.type || 'untyped'}`) }
    })
    .filter((g) => g.flows.length > 0)
}

// ------------------------------------------------------------------------------------------------
// The student's own flow set, read from the workspace (review W8-F03)
//   FN flows-to FN links recorded with the architecture editor; the link rationale holds "<kind>: <item> [owner ·
//   provenance]". An FN -> INFO -> FN chain is read as an information flow carrying that INFO.

const FLOW_RATIONALE = /^\s*(information|energy|material)\s*:\s*(.*?)\s*(\[[^\]]*\])?\s*$/i

export function parseFlowRationale(r: string | undefined): { kind: FlowKind; item: string } | null {
  const m = (r ?? '').match(FLOW_RATIONALE)
  return m ? { kind: m[1].toLowerCase() as FlowKind, item: m[2] } : null
}

export function flowsFromModel(m: EngineeringModel): FnFlow[] {
  const live = new Set(m.elements.filter((e) => e.status === 'active').map((e) => e.id))
  const kind = (id: string) => id.split('-')[0]
  const links = m.links.filter((l) => l.type === 'flows-to' && live.has(l.source) && live.has(l.target))
  const direct: FnFlow[] = links
    .filter((l) => kind(l.source) === 'FN' && kind(l.target) === 'FN' && l.source !== l.target)
    .map((l) => {
      const parsed = parseFlowRationale(l.rationale)
      return { id: l.id, from: l.source, to: l.target, item: parsed?.item || l.rationale || 'flow', kind: parsed?.kind ?? 'information' }
    })
  const name = (id: string) => m.elements.find((e) => e.id === id)?.name ?? id
  const viaInfo: FnFlow[] = links
    .filter((l) => kind(l.source) === 'FN' && kind(l.target) === 'INFO')
    .flatMap((p) =>
      links
        .filter((c) => c.source === p.target && kind(c.target) === 'FN' && c.target !== p.source)
        .map((c) => ({ id: `${p.target}:${p.source}>${c.target}`, from: p.source, to: c.target, item: `${p.target} ${name(p.target)}`, kind: 'information' as const })),
    )
  return [...direct, ...viaInfo]
}

/** FN -> PHY allocation of a model (first PHY per function), as alternative A of the student's own comparison. */
export function allocationFromModel(m: EngineeringModel): Allocation {
  const live = new Set(m.elements.filter((e) => e.status === 'active').map((e) => e.id))
  const a: Allocation = {}
  for (const l of m.links)
    if (l.type === 'allocated-to' && l.source.startsWith('FN-') && l.target.startsWith('PHY-') && live.has(l.source) && live.has(l.target) && !a[l.source]) a[l.source] = l.target
  return a
}

export const round3 = (x: number) => Math.round(x * 1000) / 1000
