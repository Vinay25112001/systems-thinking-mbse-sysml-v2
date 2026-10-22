// The Week 11 AeroLink case, both directions: every physical element, component, interface, crossing and interface
// requirement is read from the Week 4 and Week 5 cases (none retyped); model v0.4 keeps model v0.3 whole and adds only
// Week 11 regions; the items Week 11 issues continue after the highest information-item ID; the Week 9 placeholders in
// Physical are specialized; the open items Weeks 9 and 10 deferred are closed or re-dated truthfully; the satisfy claims
// rest on the Week 3 estimates; the counts the lecture states are computed; every finding that needs a disposition has
// one and nothing is left out. Each check is shown able to fail where a mutation makes sense.
import { describe, expect, it } from 'vitest'
import { TPMS } from '../week03/aerolinkCase'
import { FUNCTIONS, INFORMATION, LOGICAL, PHYSICAL } from '../week04/aerolinkCase'
import { COMPONENTS, INTERFACES, INTERFACE_REQUIREMENTS, flowsOf } from '../week05/aerolinkCase'
import { AEROLINK_W10_MODEL, W10_DISPOSITIONS } from '../week10/aerolinkCase'
import { MARK_BEGIN, MARK_END, needsDisposition, stripGenerated } from '../../../workbench/week11/physical'
import { AEROLINK_W10, AEROLINK_W11_MODEL, COUNTS, DESIGN_VALUES, DISPOSABLE_FINDINGS, FIRST_NEW_INFO, FLOWS, FLOW_ITEM_MAP, OPEN_ITEMS, PLACEHOLDER_LINKS, REQ_FUNCTIONS, SATISFY, W11_DISPOSITIONS, W11_NEW_ITEMS, W4_ALLOCATION_DIFFS } from './aerolinkCase'

const G = AEROLINK_W11_MODEL
const num = (id: string) => Number(id.match(/\d+$/)![0])

describe('Week 11 AeroLink case: read, not retyped', () => {
  it('every Week 4 physical element and Week 5 component is a part usage with its ID', () => {
    for (const p of PHYSICAL) expect(G.text, p.id).toContain(`part <'${p.id}'>`)
    for (const c of COMPONENTS) expect(G.text, c.id).toContain(`part <'${c.id}'>`)
    expect(COUNTS.physical).toBe(PHYSICAL.length)
    expect(COUNTS.components).toBe(COMPONENTS.length)
  })
  it('every function is performed by the physical element Week 4 placed it on', () => {
    for (const f of FUNCTIONS) expect(G.parts.find((p) => p.id === f.phy)!.performs, f.id).toContain(f.id)
  })
  it('every Week 5 interface is modeled once, with the Week 5 ends, and each crossing as Week 5 computes it', () => {
    expect(G.interfaces.map((x) => x.id)).toEqual(INTERFACES.map((x) => x.id))
    for (const x of INTERFACES) {
      const m = G.interfaces.find((y) => y.id === x.id)!
      expect([m.endA, m.endB], x.id).toEqual(x.ends)
      if (x.kind === 'organizational') expect(m.flows, x.id).toEqual([])
      else expect(m.flows.map((f) => [f.from, f.to]), x.id).toEqual(flowsOf(x).map((f) => [f.from, f.to]))
    }
  })
  it('every physical crossing of the Week 5 case is mapped to an item that exists', () => {
    for (const x of INTERFACES) for (const f of x.flows) expect(FLOW_ITEM_MAP[f.item], f.item).toBeDefined()
    const names = [...AEROLINK_W10.items.map((i) => i.name), ...W11_NEW_ITEMS.map((i) => i.name)]
    for (const v of Object.values(FLOW_ITEM_MAP)) expect(/^INFO-\d{3}$/.test(v) ? W11_NEW_ITEMS.some((i) => i.id === v) || AEROLINK_W10.items.some((i) => i.id === v) : names.includes(v), v).toBe(true)
    expect(Object.keys(FLOWS).length).toBe(INTERFACES.filter((x) => x.kind !== 'organizational').length)
  })
  it('the interface requirements are the Week 5 ones, each allocated to its interface', () => {
    for (const q of INTERFACE_REQUIREMENTS) expect(G.reqAllocations).toContainEqual({ req: q.id, to: q.interface })
    expect(G.addedReqs).toEqual([])
  })
})

describe('model v0.4 keeps model v0.3 whole and keeps ID continuity', () => {
  it('removing the Week 11 regions and the version rename gives model v0.3 back exactly', () => {
    const back = stripGenerated(G.text).split("'AeroLink Model v0.4'").join("'AeroLink Model v0.3'")
    expect(back).toBe(stripGenerated(AEROLINK_W10_MODEL.text).replace(/\n$/, '') + '\n')
    expect(G.text.split(MARK_BEGIN).length).toBe(G.text.split(MARK_END).length)
  })
  it('the information items Week 11 adds continue, in order, after the highest INFO ID in the package and model v0.3; no ID is reused', () => {
    const before = Math.max(...INFORMATION.map((x) => num(x.id)), AEROLINK_W10.maxInfo)
    expect(num(FIRST_NEW_INFO)).toBe(before + 1)
    const added = W11_NEW_ITEMS.filter((x) => x.id).map((x) => num(x.id))
    expect(added).toEqual(added.map((_, i) => before + 1 + i))
    expect(G.issued).toEqual(W11_NEW_ITEMS.filter((x) => x.id).map((x) => x.id))
    for (const id of G.issued) expect(AEROLINK_W10_MODEL.text, id).not.toContain(`'${id}'`)
  })
  it('the Week 9 placeholders in Physical are each specialized by the physical element they stand for', () => {
    for (const [ph, phy] of Object.entries(PLACEHOLDER_LINKS)) expect(G.parts.find((p) => p.id === phy)!.specializes, ph).toContain(ph)
    expect(G.findings.some((f) => f.code === 'placeholder-unlinked')).toBe(false)
  })
})

describe('the open items deferred to Week 11', () => {
  it('each interface requirement Week 10 deferred is allocated to the function its disposition named, and to its interface', () => {
    for (const [req, fn] of Object.entries(REQ_FUNCTIONS)) {
      expect(W10_DISPOSITIONS[req], req).toContain(fn)
      expect(G.reqAllocations, req).toContainEqual({ req, to: fn })
    }
  })
  it('REQ-STK-020 is allocated to physical elements; REQ-STK-021 stays open, not allocated, with its reason', () => {
    expect(G.reqAllocations.filter((a) => a.req === 'REQ-STK-020').length).toBeGreaterThan(0)
    expect(G.reqAllocations.some((a) => a.req === 'REQ-STK-021')).toBe(false)
    expect(OPEN_ITEMS.find((o) => o.item === 'REQ-STK-021')).toMatchObject({ status: 'open' })
    expect(OPEN_ITEMS.filter((o) => o.status === 'closed').map((o) => o.item).sort()).toEqual([...Object.keys(REQ_FUNCTIONS), 'REQ-STK-020'].sort())
  })
})

describe('satisfy claims, counts and dispositions', () => {
  it('each design value is the current best estimate of the measure that tracks the requirement', () => {
    for (const c of SATISFY) {
      const t = TPMS.find((x) => x.measures === c.req)!
      expect(c.value.startsWith(`${t.cbe} `), c.req).toBe(true)
      expect(G.satisfied.find((s) => s.req === c.req)!.value).toBe(c.value)
    }
    expect(DESIGN_VALUES.map((d) => d.req)).toEqual(SATISFY.map((c) => c.req))
    expect(G.findings.filter((f) => f.code.startsWith('satisfy'))).toEqual([])
  })
  it('the counts are computed from the generated model', () => {
    expect(COUNTS.interfaces).toBe(INTERFACES.length)
    expect(COUNTS.physicalIfs + COUNTS.informationIfs + COUNTS.organizationalIfs).toBe(COUNTS.interfaces)
    expect(COUNTS.ports).toBe(2 * COUNTS.portDefs)
    expect(COUNTS.flows).toBe(G.interfaces.reduce((n, x) => n + x.flows.length, 0))
    expect(COUNTS.nestedAllocations).toBe(FUNCTIONS.length)
  })
  it('nothing is left out, and every finding that needs a disposition has one', () => {
    expect(G.findings.filter((f) => f.cls === 'defect')).toEqual([])
    expect(DISPOSABLE_FINDINGS.length).toBeGreaterThan(0)
    for (const f of G.findings.filter(needsDisposition)) expect(W11_DISPOSITIONS[f.id], f.id).toBeDefined()
  })
  it('the comparison with the Week 4 allocation table is computed: an element listed for a physical element that performs none of its functions', () => {
    for (const d of W4_ALLOCATION_DIFFS) {
      const l = LOGICAL.find((x) => x.id === d.log)!
      for (const p of d.onlyW4) expect(FUNCTIONS.filter((f) => f.log === l.id && f.phy === p)).toEqual([])
    }
  })
})
