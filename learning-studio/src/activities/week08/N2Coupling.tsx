import { useMemo, useState } from 'react'
import { Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { referenceUpTo } from '../../model/reference'
import { useWorkspace } from '../../state/Workspace'
import { readArchitecture } from './architecture'
import { ALLOCATION_A, ALLOCATION_B, FN_FLOWS, allocationFromModel, coupling, flowsFromModel, inducedN2, interfaceN2, pairsWithoutInterface, round3, type Allocation } from './n2'

const input = 'rounded border border-slate-300 bg-white px-1 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-900'
const TYPE_LETTER: Record<string, string> = { physical: 'P', information: 'I', organisational: 'O' }
const REF_PHYS = ['PHY-001', 'PHY-002', 'PHY-003', 'PHY-004', 'PHY-005', 'PHY-006', 'PHY-007', 'PHY-008']

export function N2Coupling() {
  const { model } = useWorkspace()
  const [source, setSource] = useState<'reference' | 'mine'>('reference')
  const [refAlts, setRefAlts] = usePersistentState<{ A: Allocation; B: Allocation }>('w08-n2-alternatives', { A: ALLOCATION_A, B: ALLOCATION_B })
  const [myAlts, setMyAlts] = usePersistentState<{ A?: Allocation; B?: Allocation }>('w08-n2-alternatives-mine', {})
  const [prediction, setPrediction] = useState<'A' | 'B' | ''>('')
  const [computed, setComputed] = useState(false)
  const [show, setShow] = useState<'A' | 'B'>('A')

  const mine = source === 'mine'
  const arch = useMemo(() => readArchitecture(mine ? model : referenceUpTo(8)), [mine, model])
  // Part 2 works on the same source as Part 1: the reference teaching set, or the team's own FN, PHY, IF and flows.
  const flows = useMemo(() => (mine ? flowsFromModel(model) : FN_FLOWS), [mine, model])
  const wsAlloc = useMemo(() => allocationFromModel(model), [model])
  const alts = mine ? { A: myAlts.A ?? wsAlloc, B: myAlts.B ?? wsAlloc } : refAlts
  const fns = [...new Set([...flows.flatMap((f) => [f.from, f.to]), ...(mine ? arch.fns.map((f) => f.id) : [])])].sort()
  const physOptions = mine ? arch.phys.map((p) => p.id) : REF_PHYS
  const n2 = interfaceN2(arch.ifs, arch.phys.map((p) => p.id))
  const cA = coupling(flows, alts.A)
  const cB = coupling(flows, alts.B)
  const better = cA.kappa === cB.kappa ? null : cA.kappa < cB.kappa ? 'A' : 'B'
  const induced = inducedN2(flows, show === 'A' ? alts.A : alts.B)
  const gaps = pairsWithoutInterface(show === 'A' ? cA : cB, arch.ifs)
  const name = (id: string) => arch.phys.find((p) => p.id === id)?.name ?? arch.exts.find((p) => p.id === id)?.name ?? ''
  const fnName = (id: string) => arch.fns.find((f) => f.id === id)?.name ?? ''
  const setAll = (next: { A: Allocation; B: Allocation }) => {
    if (mine) setMyAlts(next)
    else setRefAlts(next)
    setComputed(false)
  }
  const setCell = (alt: 'A' | 'B', fn: string, phy: string) => setAll({ ...alts, [alt]: { ...alts[alt], [fn]: phy } })
  const switchSource = (s: 'reference' | 'mine') => {
    setSource(s)
    setComputed(false)
    setPrediction('')
  }

  return (
    <div className="space-y-4 text-sm" data-testid="w08-n2-coupling">
      <section className="space-y-2">
        <h4 className="font-semibold">Part 1 — Interface N² (typed interfaces, both ends)</h4>
        <fieldset className="flex flex-wrap gap-x-4">
          <legend className="sr-only">Source for both parts</legend>
          <label className="flex items-center gap-1.5">
            <input type="radio" name="w08-n2-src" checked={source === 'reference'} onChange={() => switchSource('reference')} /> Instructor reference (end of Week 8)
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" name="w08-n2-src" checked={source === 'mine'} onChange={() => switchSource('mine')} /> My workspace (my FN, PHY, IF and function flows)
          </label>
        </fieldset>
        <div className="overflow-x-auto">
          <table className="text-center text-xs" data-testid="w08-if-n2">
            <caption className="text-left font-medium">
              N² of interfaces: each IF appears once, above the diagonal (row = the element earlier in the order). Type letter: P physical, I information, O organisational.
            </caption>
            <thead>
              <tr>
                <th scope="col" className="px-1">Element</th>
                {n2.nodes.map((n) => (
                  <th key={n} scope="col" className="px-1">
                    {n}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {n2.nodes.map((r, i) => (
                <tr key={r} className="border-t border-slate-100 dark:border-slate-800">
                  <th scope="row" className="px-1 text-left font-normal">
                    {r} {name(r)}
                  </th>
                  {n2.nodes.map((c, j) => (
                    <td key={c} className={`px-1 ${i === j ? 'bg-slate-200 dark:bg-slate-700' : ''}`}>
                      {i === j ? '■' : i < j ? n2.cells[i][j].map((e) => `${e.id} (${TYPE_LETTER[e.type] ?? '?'})`).join(', ') : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p data-testid="w08-if-counts">
          {n2.edges.length} interfaces: {Object.entries(n2.byType).map(([t, k]) => `${k} ${t}`).join(', ') || 'none'}. Interfaces per element:{' '}
          {n2.nodes.map((n) => `${n} ${n2.degree[n]}`).join(', ')}. Elements with no interface: {n2.isolated.join(', ') || 'none'}.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold">Part 2 — Coupling of two allocation alternatives</h4>
        <p>
          {mine
            ? `Your workspace: ${flows.length} function-to-function flow${flows.length === 1 ? '' : 's'} (FN → FN flows recorded in the architecture editor, and FN → INFO → FN chains) over your own functions and physical elements. Alternative A starts as your recorded allocation; set B to your second candidate.`
            : `Instructor teaching set: ${FN_FLOWS.length} flows over 13 reference functions (FICTIONAL). A is the reference allocation, B distributed dispatch.`}{' '}
          Choose where each function sits in alternative A and B. A flow whose two functions sit on different physical elements crosses a boundary. Metric (course definition): κ = X / E, the share of the E flows that cross; P = physical-element pairs joined by a crossing flow, each needing a direct interface or a recorded relay (an upper bound on the direct interfaces needed); D<sub>max</sub> = most such partners of one element.
        </p>
        {mine && flows.length === 0 && (
          <p role="note" className="rounded border border-amber-400 p-2">
            ! Your workspace has no function-to-function flows yet. Record them with the architecture editor (“New function-to-function flow”), then return here. Without flows there is nothing to compute.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {mine ? (
            <>
              <Button variant="secondary" onClick={() => setAll({ A: wsAlloc, B: alts.B })}>
                Load my recorded FN → PHY allocation into A
              </Button>
              <Button variant="secondary" onClick={() => setAll({ A: alts.A, B: { ...alts.A } })}>
                Copy A into B (then change B)
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setAll({ A: ALLOCATION_A, B: ALLOCATION_B })}>
              Reset to reference (A) and distributed dispatch (B)
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="text-left text-xs">
            <caption className="text-left font-medium">Allocation alternatives</caption>
            <thead>
              <tr>
                <th scope="col" className="pr-2">Function</th>
                <th scope="col" className="pr-2">Alternative A</th>
                <th scope="col">Alternative B</th>
              </tr>
            </thead>
            <tbody>
              {fns.map((fn) => (
                <tr key={fn} className="border-t border-slate-100 dark:border-slate-800">
                  <th scope="row" className="pr-2 font-normal">
                    {fn} {fnName(fn)}
                  </th>
                  {(['A', 'B'] as const).map((alt) => (
                    <td key={alt} className="pr-2">
                      <select aria-label={`Alternative ${alt}: ${fn}`} className={input} value={alts[alt][fn] ?? ''} onChange={(e) => setCell(alt, fn, e.target.value)}>
                        <option value="">unallocated</option>
                        {physOptions.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <fieldset className="flex flex-wrap gap-x-4">
          <legend>Before computing: which alternative will have the lower coupling κ?</legend>
          {(['A', 'B'] as const).map((p) => (
            <label key={p} className="flex items-center gap-1.5">
              <input type="radio" name="w08-predict" checked={prediction === p} onChange={() => setPrediction(p)} /> Alternative {p}
            </label>
          ))}
        </fieldset>
        <Button onClick={() => setComputed(true)} disabled={flows.length === 0}>
          Compute coupling
        </Button>
        {computed && (
          <div className="space-y-2" data-testid="w08-coupling-result">
            <table className="text-left text-xs">
              <caption className="text-left font-medium">Coupling metrics</caption>
              <thead>
                <tr>
                  <th scope="col" className="pr-3">Metric</th>
                  <th scope="col" className="pr-3">A</th>
                  <th scope="col">B</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['E — flows counted', cA.flows, cB.flows],
                  ['X — flows crossing a boundary', cA.crossing, cB.crossing],
                  ['κ = X / E', round3(cA.kappa), round3(cB.kappa)],
                  ['P — element pairs joined by a crossing flow', cA.pairs.length, cB.pairs.length],
                  ['D_max — most interface partners', `${cA.maxPartners.count} (${cA.maxPartners.phy.join(', ') || '—'})`, `${cB.maxPartners.count} (${cB.maxPartners.phy.join(', ') || '—'})`],
                  ['Unallocated functions', cA.unallocated.join(', ') || 'none', cB.unallocated.join(', ') || 'none'],
                  ['Crossing flows', cA.crossingFlows.map((f) => f.id).join(', ') || 'none', cB.crossingFlows.map((f) => f.id).join(', ') || 'none'],
                ].map(([label, a, b]) => (
                  <tr key={String(label)} className="border-t border-slate-100 dark:border-slate-800">
                    <th scope="row" className="pr-3 font-normal">
                      {label}
                    </th>
                    <td className="pr-3">{a}</td>
                    <td>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p data-testid="w08-coupling-verdict">
              {better ? `Alternative ${better} has the lower coupling.` : 'Both alternatives have the same coupling.'}{' '}
              {prediction ? (prediction === better ? 'Your prediction was right.' : better ? 'Your prediction was not right — find the flows that cross in one alternative but not the other.' : '') : 'You did not record a prediction.'}{' '}
              The metric counts flows, not their importance: a single safety-critical crossing can matter more than several routine ones, so justify the choice in words as well.
            </p>
            <fieldset className="flex flex-wrap gap-x-4">
              <legend>Show the induced N² for</legend>
              {(['A', 'B'] as const).map((p) => (
                <label key={p} className="flex items-center gap-1.5">
                  <input type="radio" name="w08-show" checked={show === p} onChange={() => setShow(p)} /> Alternative {p}
                </label>
              ))}
            </fieldset>
            <div className="overflow-x-auto">
              <table className="text-center text-xs" data-testid="w08-induced-n2">
                <caption className="text-left font-medium">Induced N², alternative {show}: row = producing element, column = consuming element; cells list flow IDs</caption>
                <thead>
                  <tr>
                    <th scope="col" className="px-1">From \ to</th>
                    {induced.phys.map((p) => (
                      <th key={p} scope="col" className="px-1">
                        {p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {induced.phys.map((r, i) => (
                    <tr key={r} className="border-t border-slate-100 dark:border-slate-800">
                      <th scope="row" className="px-1 font-normal">
                        {r}
                      </th>
                      {induced.phys.map((c, j) => (
                        <td key={c} className={`px-1 ${i === j ? 'bg-slate-200 dark:bg-slate-700' : ''}`}>
                          {i === j ? '■' : induced.cells[i][j].join(', ')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p data-testid="w08-gaps">
              Crossing pairs, alternative {show}, with flows that no interface of the matching type carries in the {mine ? 'workspace' : 'reference'} interface list (course rule: information needs an information interface, energy and material a physical one; an organisational interface carries no flow):{' '}
              {gaps.length
                ? `${gaps.map((g) => `${g.a}–${g.b} (${g.flows.join(', ')}; ${g.present.length ? `only ${g.present.join(', ')}` : 'no interface'})`).join('; ')}. For each, declare an interface of the right type or record the relay path.`
                : 'none.'}
            </p>
            <details>
              <summary className="cursor-pointer">Flow list</summary>
              <ul className="list-disc pl-5 text-xs">
                {flows.map((f) => (
                  <li key={f.id}>
                    {f.id}: {f.from} → {f.to}, {f.item} ({f.kind})
                  </li>
                ))}
              </ul>
            </details>
          </div>
        )}
      </section>
    </div>
  )
}
