// The Week 10 AeroLink case, both directions: every function, logical element, item, capability, scenario step and
// alternate is read from the Week 2 and Week 4 cases (none retyped); model v0.3 keeps model v0.2 whole and adds only
// Week 10 regions; the IDs Week 10 issues continue after the highest the package holds; the Week 9 placeholders become
// the types of the logical parts of the same name; the open items Week 9 deferred to Week 10 are closed (the capability
// links and the FN-015 allocations); the counts the lecture states are computed from the generated model; every finding
// that needs a disposition has one. Each check is shown able to fail.
import { describe, expect, it } from 'vitest'
import { SCENARIOS, CAPABILITIES } from '../week02/aerolinkCase'
import { FUNCTIONS, INFORMATION, LOGICAL } from '../week04/aerolinkCase'
import { AEROLINK_W9_MODEL, W9_STK_DISPOSITIONS } from '../week09/aerolinkCase'
import { MARK_BEGIN, MARK_END, needsDisposition, stripGenerated } from '../../../workbench/week10/behavior'
import { AEROLINK_W10_MODEL, AEROLINK_W9, COUNTS, CROSS_CHECK, FLOW_NODES, ITEM_FLOWS, MACHINE, THREAD, TRANSITION_SOURCES, UNALLOCATED, W10_DISPOSITIONS, W10_NEW_ITEMS } from './aerolinkCase'

const G = AEROLINK_W10_MODEL
const num = (id: string) => Number(id.match(/\d+$/)![0])

describe('Week 10 AeroLink case: read, not retyped', () => {
  it('every Week 4 function is an action usage with its ID, name and statement', () => {
    for (const f of FUNCTIONS) {
      expect(G.text, f.id).toContain(`action <'${f.id}'> '${f.name}'`)
      expect(G.text, f.id).toContain(f.text.replace(/’/g, "'"))
    }
    expect(COUNTS.functions).toBe(FUNCTIONS.length)
  })
  it('every Week 2 capability is an action definition and every Week 4 information item an item definition', () => {
    for (const c of CAPABILITIES) expect(G.text, c.id).toContain(`action def <'${c.id}'> '${c.name}'`)
    for (const x of INFORMATION) expect(G.text, x.id).toContain(`item def <'${x.id}'> '${x.name}'`)
  })
  it('every logical element is a part usage with its LOG ID, performing exactly the functions Week 4 allocated to it', () => {
    for (const l of LOGICAL) {
      const m = G.logical.find((x) => x.id === l.id)!
      expect(m.performs.sort(), l.id).toEqual(FUNCTIONS.filter((f) => f.log === l.id).map((f) => f.id).sort())
      expect(G.text, l.id).toContain(`part <'${l.id}'> ${m.usage} : '${m.def}'`)
    }
  })
  it('the SCN-002 flow has one action per Week 2 step and one action per alternate, in ConOps order', () => {
    const s = SCENARIOS.find((x) => x.id === 'SCN-002')!
    const steps = FLOW_NODES.filter((n) => n.kind === 'step')
    expect(steps.map((n) => n.conops)).toEqual(s.steps.map((x) => `step ${x.n}: ${x.text}`))
    expect(FLOW_NODES.filter((n) => n.kind === 'alt').map((n) => n.conops.split(':')[0]).sort()).toEqual(s.alternates.map((a) => a.id).sort())
    expect(COUNTS.decisions).toBe(new Set(s.alternates.map((a) => a.fromStep)).size)
    expect(COUNTS.merges).toBe(new Set(s.alternates.flatMap((a) => (a.outcome === 'ends' ? [] : [a.outcome.rejoin]))).size)
  })
})

describe('model v0.3 keeps model v0.2 whole and keeps ID continuity', () => {
  it('removing the Week 10 regions and the version rename gives model v0.2 back exactly', () => {
    const back = stripGenerated(G.text).split("'AeroLink Model v0.3'").join("'AeroLink Model v0.2'")
    expect(back).toBe(AEROLINK_W9_MODEL.text.replace(/\n$/, '') + '\n')
    expect(G.text.split(MARK_BEGIN).length).toBe(G.text.split(MARK_END).length)
  })
  it('the information items Week 10 adds continue, in order, after the highest INFO ID in the package; no ID is reused', () => {
    const before = Math.max(...INFORMATION.map((x) => num(x.id)), AEROLINK_W9.maxInfo)
    const added = W10_NEW_ITEMS.filter((x) => x.id).map((x) => num(x.id))
    expect(added).toEqual(added.map((_, i) => before + 1 + i))
    const ids = G.items.map((x) => x.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(G.issued).toEqual(W10_NEW_ITEMS.filter((x) => x.id).map((x) => x.id))
  })
  it('the Week 9 placeholders in Logical become the definitions of the logical parts of the same name', () => {
    expect(COUNTS.placeholdersReused).toBe(AEROLINK_W9.logicalDefs.length)
    expect(G.findings.filter((f) => f.code === 'placeholder-unlinked')).toEqual([])
    expect(COUNTS.newLogicalDefs).toBe(LOGICAL.length - AEROLINK_W9.logicalDefs.length)
  })
  it('closes what Week 9 deferred to Week 10: every capability parent becomes a #derivedFrom dependency, and REQ-STK-018/019 are allocated to FN-015', () => {
    const waiting = [...AEROLINK_W9_MODEL.pendingCaps]
    for (const d of waiting) expect(G.capLinks, `${d.derived} → ${d.original}`).toContainEqual({ from: d.derived, cap: d.original })
    expect(COUNTS.reqCapLinks).toBe(waiting.length)
    for (const id of ['REQ-STK-018', 'REQ-STK-019']) {
      expect(W9_STK_DISPOSITIONS[id]).toMatch(/FN-015/)
      expect(G.allocations).toContainEqual({ req: id, fn: 'FN-015' })
    }
  })
})

describe('Week 10 AeroLink counts, tables and findings are computed', () => {
  it('the counts match the generated text', () => {
    expect(G.text.split('allocate Requirements::').length - 1).toBe(COUNTS.allocations)
    expect(G.text.split('#derivedFrom dependency').length - 1).toBe(COUNTS.capLinks)
    expect(G.text.split("perform Logical::'FN-").length - 1).toBe(COUNTS.performs)
    expect(G.text.split('\n').filter((l) => /^\t\t\tflow /.test(l)).length).toBe(COUNTS.itemFlows)
    expect(G.text.split("use case <'SCN-").length - 1).toBe(COUNTS.scenarios)
    expect(G.text.split('\n').filter((l) => /^\t\t\ttransition /.test(l)).length).toBe(COUNTS.transitions)
    expect(G.findings.filter((f) => f.cls === 'defect')).toEqual([])
  })
  it('the state definition meets the lab minimums, every state is reachable, and every transition has a ConOps source', () => {
    expect(COUNTS.states).toBeGreaterThanOrEqual(4)
    expect(COUNTS.transitions).toBeGreaterThanOrEqual(5)
    expect(COUNTS.guards).toBeGreaterThanOrEqual(1)
    expect(G.machine!.unreachable).toEqual([])
    for (const t of MACHINE.transitions) expect(TRANSITION_SOURCES[`${t.from}→${t.to}`], `${t.from}→${t.to}`).toBeTruthy()
    expect(Object.keys(TRANSITION_SOURCES)).toHaveLength(MACHINE.transitions.length)
  })
  it('every item flow joins a producing step to a later consuming step; the thread and the cross-check are read from the model', () => {
    const order = FLOW_NODES.filter((n) => n.kind === 'step').map((n) => n.name)
    for (const f of ITEM_FLOWS) expect(order.indexOf(f.from), f.text).toBeLessThan(order.indexOf(f.to))
    expect(THREAD.step).toBeTruthy()
    expect(THREAD.performer).toBe(FUNCTIONS.find((f) => f.id === THREAD.fn)!.log)
    expect(CROSS_CHECK.length).toBe(COUNTS.transitions)
  })
  it('every finding that needs a disposition has the instructor’s, and no disposition is left without a finding', () => {
    const need = G.findings.filter(needsDisposition)
    for (const f of need) expect(W10_DISPOSITIONS[f.id], `${f.code} ${f.id}`).toBeTruthy()
    expect(Object.keys(W10_DISPOSITIONS).sort()).toEqual([...new Set(need.map((f) => f.id))].sort())
    expect(UNALLOCATED.every((id) => /^REQ-SYS-/.test(id))).toBe(true)
  })
  it('negative direction: a dropped allocation, a reused ID and a broken region pair are detected', () => {
    expect(G.allocations.filter((a) => a.fn !== 'FN-015')).not.toContainEqual({ req: 'REQ-STK-018', fn: 'FN-015' })
    const ids = [...G.items.map((x) => x.id), 'INFO-011']
    expect(new Set(ids).size).toBeLessThan(ids.length)
    const broken = G.text.replace(MARK_END, '')
    expect(broken.split(MARK_BEGIN).length).not.toBe(broken.split(MARK_END).length)
  })
})
