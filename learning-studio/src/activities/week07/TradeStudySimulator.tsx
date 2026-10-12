import { useState } from 'react'
import { DEFAULT_PROVENANCE_OWNER, ownerProblem, ProvenanceOwnerFields, type ProvenanceOwner } from '../../components/ProvenanceOwnerFields'
import { Button, CitationText } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { useWorkspace } from '../../state/Workspace'
import { LineDiagram, Tornado } from './charts'
import { studyFromModel } from './reference'
import { checkDecision, decisionAttributes, planSave, remapScores, renameStudy, type DecisionDraft } from './save'
import { referenceState, useW07 } from './store'
import { checkForSave, checkStudy, isHigherBetter, normaliseWeights, rank, sensitivity, tornado, valueTable, valuesAtWeight, type Alternative, type Criterion } from './trade'

const input = 'w-full rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-900'
const numInput = `${input} w-20`
const th = 'px-1.5 py-1 text-left font-semibold'
const td = 'px-1.5 py-1 align-top'
const f3 = (x: number) => (Number.isFinite(x) ? x.toFixed(3) : '—')
const num = (s: string) => (s.trim() === '' ? NaN : Number(s))

let localCounter = 0
const localId = (p: string, taken: string[]) => {
  let id = ''
  do id = `new-${p}${++localCounter}`
  while (taken.includes(id))
  return id
}

export function TradeStudySimulator() {
  const [st, set] = useW07()
  const { model, apply, updateElement } = useWorkspace()
  const { study } = st
  const weights = normaliseWeights(study.criteria)
  const issues = checkStudy(study)
  const blocking = issues.some((i) => i.level === 'error')
  const rows = blocking ? [] : valueTable(study, weights)
  const ranked = rank(rows)
  const nameOf = Object.fromEntries([...study.criteria, ...study.alternatives].map((x) => [x.id, x.name]))
  const [selRaw, setSel] = usePersistentState<string>('w07-sens-criterion', 'CRIT-002')
  const sel = study.criteria.some((c) => c.id === selRaw) ? selRaw : (study.criteria[0]?.id ?? '')
  const sens = !blocking && sel ? sensitivity(study, sel, weights) : null
  const [delta, setDelta] = usePersistentState<number>('w07-tornado-delta', 0.1)
  const bars = !blocking && study.criteria.length ? tornado(study, delta, weights) : []
  const [guess, setGuess] = useState('')
  const [guessFb, setGuessFb] = useState('')
  const [msg, setMsg] = useState<{ text: string; tone: 'ok' | 'err' } | null>(null)
  const [dec, setDec] = usePersistentState<DecisionDraft>('w07-decision-draft', { recommended: '', conditions: '', residualRisk: '', wouldChangeIf: '' })
  const [decFb, setDecFb] = useState<{ errors: string[]; warnings: string[]; done?: string } | null>(null)
  const [po, setPo] = useState<ProvenanceOwner>(DEFAULT_PROVENANCE_OWNER)
  const moeIds = model.elements.filter((e) => e.kind === 'MOE' && e.status === 'active').map((e) => e.id)
  const ownerOk = () => {
    const p = ownerProblem(po.owner)
    return p ? `${p} The owner is the team member accountable for the trade-study elements.` : null
  }
  const recorded = () => ({ owner: po.owner.trim().toUpperCase(), provenance: po.provenance })

  const setStudy = (f: (s: typeof study) => typeof study) => set((x) => ({ ...x, study: f(x.study) }))
  const updCrit = (id: string, patch: Partial<Criterion>) => setStudy((s) => ({ ...s, criteria: s.criteria.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))
  const updAlt = (id: string, patch: Partial<Alternative>) => setStudy((s) => ({ ...s, alternatives: s.alternatives.map((a) => (a.id === id ? { ...a, ...patch } : a)) }))
  const setScore = (a: string, c: string, v: number) => setStudy((s) => ({ ...s, alternatives: s.alternatives.map((x) => (x.id === a ? { ...x, scores: { ...x.scores, [c]: v } } : x)) }))
  const ids = [...study.criteria, ...study.alternatives].map((x) => x.id)
  const addCrit = () => setStudy((s) => ({ ...s, criteria: [...s.criteria, { id: localId('C', ids), name: 'New criterion', unit: '', worst: 0, best: 1, swingPoints: 50 }] }))
  const addAlt = () => setStudy((s) => ({ ...s, alternatives: [...s.alternatives, { id: localId('A', ids), name: 'New alternative', scores: {} }] }))
  const removeCrit = (id: string) => set((x) => ({ ...x, study: { ...x.study, criteria: x.study.criteria.filter((c) => c.id !== id) }, shared: x.shared.filter((s) => s !== id) }))
  const removeAlt = (id: string) => set((x) => ({ ...x, study: { ...x.study, alternatives: x.study.alternatives.filter((a) => a.id !== id) } }))

  const loadReference = () => {
    set(referenceState())
    setMsg({ text: 'Loaded the instructor reference trade study (ALT-001..004, CRIT-001..004, FICTIONAL values).', tone: 'ok' })
  }
  const loadWorkspace = () => {
    const r = studyFromModel(model)
    if (r.study.criteria.length === 0 || r.study.alternatives.length === 0) {
      setMsg({ text: `Your workspace has no usable trade study: ${r.issues.join(' ')} Create CRIT and ALT elements in Lab L7 (or save this study to the workspace).`, tone: 'err' })
      return
    }
    set((x) => ({ ...x, study: r.study, source: 'Your AeroLink workspace' }))
    setMsg({ text: `Loaded ${r.study.criteria.length} CRIT and ${r.study.alternatives.length} ALT from your workspace.${r.issues.length ? ` Check: ${r.issues.join('; ')}` : ''}`, tone: r.issues.length ? 'err' : 'ok' })
  }
  const saveWorkspace = () => {
    const blockers = [...checkForSave(study, moeIds), ...(ownerOk() ? [ownerOk()!] : [])]
    if (blockers.length) {
      setMsg({ text: `Not saved (L7 acceptance): ${blockers.join(' ')}`, tone: 'err' })
      return
    }
    const plan = planSave(study, model, recorded())
    for (const u of plan.updates) updateElement(u.id, u.patch)
    const res = apply({ elements: plan.creates, links: plan.links })
    if (res.error) {
      setMsg({ text: `Not saved: ${res.error}`, tone: 'err' })
      return
    }
    for (const a of study.alternatives) updateElement(res.ids[a.id] ?? a.id, { attributes: { ...remapScores(a.scores, res.ids), baseline: !!a.baseline } })
    set((x) => ({ ...x, study: renameStudy(x.study, res.ids), unc: Object.fromEntries(Object.entries(x.unc).map(([k, v]) => [res.ids[k] ?? k, Object.fromEntries(Object.entries(v).map(([c, d]) => [res.ids[c] ?? c, d]))])), shared: x.shared.map((c) => res.ids[c] ?? c), source: 'Your AeroLink workspace' }))
    const created = Object.values(res.ids)
    setMsg({ text: `Saved to your workspace: ${plan.updates.length} updated, ${created.length} created${created.length ? ` (${created.join(', ')})` : ''}, ${res.linkIds.length} trace link(s).${plan.warnings.length ? ` Warnings: ${plan.warnings.join(' ')}` : ''}`, tone: plan.warnings.length ? 'err' : 'ok' })
  }
  const allSaved = study.alternatives.every((a) => model.elements.some((e) => e.id === a.id && e.kind === 'ALT'))
  const recordDecision = () => {
    const fb = checkDecision(study, dec)
    const o = ownerOk()
    if (o) fb.errors.push(o)
    if (fb.errors.length) return setDecFb(fb)
    const res = apply({
      elements: [{ key: 'dec', kind: 'DEC', name: `Decision: ${nameOf[dec.recommended] ?? dec.recommended}`, text: `Recommend ${dec.recommended}. ${dec.conditions}`, attributes: decisionAttributes(study, dec), ...recorded() }],
      links: [{ source: 'dec', type: 'affects', target: dec.recommended, rationale: 'Selected alternative (L7)' }],
    })
    setDecFb({ ...fb, done: res.error ? `Not recorded: ${res.error}` : `${res.ids.dec} recorded in your workspace and linked (affects ${dec.recommended}).` })
  }
  const checkGuess = () => {
    const g = num(guess)
    if (!sens || !Number.isFinite(g)) return setGuessFb('Enter a weight between 0 and 1.')
    const r = [sens.up, sens.down].filter((x): x is NonNullable<typeof x> => !!x)
    if (r.length === 0) return setGuessFb(`No reversal exists for ${sel} anywhere in [0, 1]: the top alternative never changes. Did your algebra give a crossing outside [0, 1], or one between two alternatives that are not first?`)
    const near = r.reduce((a, b) => (Math.abs(b.at - g) < Math.abs(a.at - g) ? b : a))
    const err = Math.abs(near.at - g)
    setGuessFb(
      err <= 0.005
        ? `✓ Correct to within 0.005: the top rank changes at ${f3(near.at)} (${near.from} → ${near.to}).`
        : `✗ Not yet: your ${f3(g)} is ${f3(err)} from the nearest reversal. Check S_a = (V_a − w_k v_ak) / (1 − w_k) for the two alternatives that are first and second at the reversal, not at the base weights.`,
    )
  }

  const gridW = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
  const sensPoints = sens ? [...new Set([...gridW, sens.base, ...(sens.up ? [sens.up.at] : []), ...(sens.down ? [sens.down.at] : [])])].sort((a, b) => a - b) : []

  return (
    <div className="space-y-5 text-sm" data-testid="w07-trade-simulator">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={loadReference}>Load reference trade study</Button>
        <Button variant="secondary" onClick={loadWorkspace}>
          Load ALT/CRIT from my workspace
        </Button>
        <Button variant="secondary" onClick={saveWorkspace} disabled={blocking}>
          Save this study to my workspace
        </Button>
        <span className="text-xs text-slate-600 dark:text-slate-400">Source: {st.source}</span>
      </div>
      <div>
        <ProvenanceOwnerFields value={po} onChange={setPo} />
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Recorded on every CRIT and ALT this save creates or changes, and on the DEC; unchanged elements keep their owner and tag. To tag AI-suggested items: first save the team-derived study, then edit only the AI-suggested alternatives or criteria, choose “AI-suggested, reviewed” and save again — only the items you changed take the tag (assignment AI rule; RB-12.3). Saving requires exactly one baseline and an MOE trace on every criterion (L7).</p>
      </div>
      {msg && (
        <p role="status" data-testid="w07-sim-message" className={msg.tone === 'err' ? 'text-amber-800 dark:text-amber-300' : 'text-emerald-800 dark:text-emerald-300'}>
          {msg.tone === 'err' ? '⚠ ' : '✓ '}
          {msg.text}
        </p>
      )}

      <section>
        <h4 className="font-semibold">1. Frame the decision</h4>
        <label className="mt-1 flex flex-col gap-1 text-xs">
          Decision statement (what is being decided, for whom, at which life-cycle point)
          <textarea className={input} rows={2} value={study.decision} onChange={(e) => setStudy((s) => ({ ...s, decision: e.target.value }))} />
        </label>
      </section>

      <section>
        <h4 className="font-semibold">2. Criteria, value functions and swing weights</h4>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Walk-away point = value 0, stretch goal = value 1; the direction (higher or lower is better) follows from which is larger. Weights are the swing points normalised to sum to one. <CitationText c={{ reading: 'R18', pages: '465–466' }} />
        </p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[860px] text-xs">
            <caption className="sr-only">Criteria editor</caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                {['ID', 'Name', 'Unit', 'Walk-away (v=0)', 'Stretch (v=1)', 'Shape', 'Mid level (v=0.5)', 'Swing points', 'Weight', 'MOE', ''].map((h) => (
                  <th key={h} scope="col" className={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {study.criteria.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800">
                  <th scope="row" className={`${td} font-mono font-normal`}>{c.id}</th>
                  <td className={td}><input aria-label={`${c.id} name`} className={input} value={c.name} onChange={(e) => updCrit(c.id, { name: e.target.value })} /></td>
                  <td className={td}><input aria-label={`${c.id} unit`} className={numInput} value={c.unit} onChange={(e) => updCrit(c.id, { unit: e.target.value })} /></td>
                  <td className={td}><input aria-label={`${c.id} walk-away point`} type="number" className={numInput} value={Number.isFinite(c.worst) ? c.worst : ''} onChange={(e) => updCrit(c.id, { worst: num(e.target.value) })} /></td>
                  <td className={td}>
                    <input aria-label={`${c.id} stretch goal`} type="number" className={numInput} value={Number.isFinite(c.best) ? c.best : ''} onChange={(e) => updCrit(c.id, { best: num(e.target.value) })} />
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">{isHigherBetter(c) ? '↑ higher is better' : '↓ lower is better'}</span>
                  </td>
                  <td className={td}>
                    <select aria-label={`${c.id} value function shape`} className={input} value={c.shape ?? 'linear'} onChange={(e) => updCrit(c.id, { shape: e.target.value as Criterion['shape'] })}>
                      <option value="linear">linear</option>
                      <option value="piecewise">piecewise (mid anchor)</option>
                    </select>
                  </td>
                  <td className={td}>
                    <input aria-label={`${c.id} mid-value level`} type="number" className={numInput} disabled={c.shape !== 'piecewise'} value={c.mid ?? ''} onChange={(e) => updCrit(c.id, { mid: e.target.value === '' ? undefined : num(e.target.value) })} />
                  </td>
                  <td className={td}><input aria-label={`${c.id} swing points`} type="number" className={numInput} value={Number.isFinite(c.swingPoints) ? c.swingPoints : ''} onChange={(e) => updCrit(c.id, { swingPoints: num(e.target.value) })} /></td>
                  <td className={`${td} font-mono`} data-testid={`w07-weight-${c.id}`}>{f3(weights[c.id])}</td>
                  <td className={td}><input aria-label={`${c.id} traced MOE`} className={numInput} value={c.moe ?? ''} placeholder="MOE-00x" onChange={(e) => updCrit(c.id, { moe: e.target.value || undefined })} /></td>
                  <td className={td}>
                    <Button variant="ghost" ariaLabel={`Remove ${c.id}`} onClick={() => removeCrit(c.id)}>✕</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button variant="secondary" onClick={addCrit}>Add criterion</Button>
      </section>

      <section>
        <h4 className="font-semibold">3. Alternatives and raw scores (measure units, not value)</h4>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[720px] text-xs">
            <caption className="sr-only">Alternatives and raw scores</caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th scope="col" className={th}>ID</th>
                <th scope="col" className={th}>Name</th>
                <th scope="col" className={th}>Baseline</th>
                {study.criteria.map((c) => (
                  <th key={c.id} scope="col" className={th}>
                    {c.id} ({c.unit || '—'})
                  </th>
                ))}
                <th scope="col" className={th}><span className="sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody>
              {study.alternatives.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800">
                  <th scope="row" className={`${td} font-mono font-normal`}>{a.id}</th>
                  <td className={td}><input aria-label={`${a.id} name`} className={input} value={a.name} onChange={(e) => updAlt(a.id, { name: e.target.value })} /></td>
                  <td className={td}>
                    <input
                      type="radio"
                      name="w07-baseline"
                      aria-label={`${a.id} is the baseline / status quo`}
                      checked={!!a.baseline}
                      onChange={() => setStudy((s) => ({ ...s, alternatives: s.alternatives.map((x) => ({ ...x, baseline: x.id === a.id })) }))}
                    />
                  </td>
                  {study.criteria.map((c) => (
                    <td key={c.id} className={td}>
                      <input aria-label={`${a.id} score on ${c.id}`} type="number" className={numInput} value={Number.isFinite(a.scores[c.id]) ? a.scores[c.id] : ''} onChange={(e) => setScore(a.id, c.id, num(e.target.value))} />
                    </td>
                  ))}
                  <td className={td}>
                    <Button variant="ghost" ariaLabel={`Remove ${a.id}`} onClick={() => removeAlt(a.id)}>✕</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button variant="secondary" onClick={addAlt}>Add alternative</Button>
      </section>

      {issues.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-5 text-xs" data-testid="w07-issues" aria-label="Trade study checks">
          {issues.map((i) => (
            <li key={i.text} className={i.level === 'error' ? 'text-rose-800 dark:text-rose-300' : 'text-amber-800 dark:text-amber-300'}>
              {i.level === 'error' ? 'Error: ' : 'Check: '}
              {i.text}
            </li>
          ))}
        </ul>
      )}

      {!blocking && (
        <section aria-live="polite">
          <h4 className="font-semibold">4. Value table and additive value v(a) = Σ wᵢ vᵢ(xᵢ)</h4>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[720px] text-xs" data-testid="w07-value-table">
              <caption className="text-left text-xs text-slate-600 dark:text-slate-400">Each cell: single-attribute value vᵢ, then the weighted contribution wᵢ·vᵢ. The ideal alternative scores the stretch goal on every criterion (R18 p.468).</caption>
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th scope="col" className={th}>Rank</th>
                  <th scope="col" className={th}>Alternative</th>
                  {study.criteria.map((c) => (
                    <th key={c.id} scope="col" className={th}>
                      {c.id} (w {f3(weights[c.id])})
                    </th>
                  ))}
                  <th scope="col" className={th}>Total value</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((r) => {
                  const row = rows.find((x) => x.id === r.id)!
                  return (
                    <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className={td}>{r.rank}</td>
                      <th scope="row" className={`${td} font-normal`}>
                        {r.id} {nameOf[r.id]}
                      </th>
                      {study.criteria.map((c) => (
                        <td key={c.id} className={`${td} font-mono`}>
                          {f3(row.values[c.id])} → {f3(row.contributions[c.id])}
                        </td>
                      ))}
                      <td className={`${td} font-mono font-semibold`} data-testid={`w07-total-${r.id}`}>{f3(r.total)}</td>
                    </tr>
                  )
                })}
                <tr className="text-slate-500 dark:text-slate-400">
                  <td className={td}>—</td>
                  <th scope="row" className={`${td} font-normal italic`}>Ideal (stretch goal on every criterion)</th>
                  {study.criteria.map((c) => (
                    <td key={c.id} className={`${td} font-mono`}>1.000 → {f3(weights[c.id])}</td>
                  ))}
                  <td className={`${td} font-mono`}>1.000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-1 text-xs">
            {ranked.length > 1 && `${ranked[0].id} leads ${ranked[1].id} by ${f3(ranked[0].total - ranked[1].total)}. Its largest gap to the ideal is on ${[...study.criteria].sort((a, b) => weights[b.id] * (1 - rows.find((x) => x.id === ranked[0].id)!.values[b.id]) - weights[a.id] * (1 - rows.find((x) => x.id === ranked[0].id)!.values[a.id]))[0]?.id} — the place to look for a better alternative (value-focused thinking, R18 p.472).`}
          </p>
        </section>
      )}

      {sens && (
        <section>
          <h4 className="font-semibold">5. One-way weight sensitivity and rank reversal</h4>
          <div className="mt-1 flex flex-wrap items-end gap-3 text-xs">
            <label className="flex flex-col gap-1">
              Vary the weight of
              <select className={input} value={sel} onChange={(e) => { setSel(e.target.value); setGuessFb('') }}>
                {study.criteria.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} {c.name} (base {f3(weights[c.id])})
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Your hand-calculated reversal weight
              <input className={numInput} inputMode="decimal" value={guess} onChange={(e) => setGuess(e.target.value)} />
            </label>
            <Button variant="secondary" onClick={checkGuess}>Check my reversal point</Button>
          </div>
          {guessFb && <p role="status" className="mt-1 text-xs" data-testid="w07-guess-feedback">{guessFb}</p>}
          <p className="mt-2" data-testid="w07-reversal-summary">
            {sens.up ? `Raising ${sel} from ${f3(sens.base)} to above ${f3(sens.up.at)} (+${f3(sens.up.at - sens.base)}) makes ${sens.up.to} rank first.` : `Raising ${sel} to 1 never changes the top rank.`}{' '}
            {sens.down ? `Lowering it below ${f3(sens.down.at)} (−${f3(sens.base - sens.down.at)}) makes ${sens.down.to} rank first.` : `Lowering it to 0 never changes the top rank.`}
          </p>
          <div className="mt-2">
            <LineDiagram s={sens} names={nameOf} label={`Line diagram: total value of each alternative as the weight of ${sel} varies from 0 to 1. The table below gives the same data.`} />
          </div>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-xs" data-testid="w07-sens-table">
              <caption className="text-left text-xs text-slate-600 dark:text-slate-400">Table equivalent of the line diagram (other weights rescaled in proportion). Lines: V(w) = intercept + slope × w.</caption>
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th scope="col" className={th}>Weight of {sel}</th>
                  {sens.lines.map((l) => (
                    <th key={l.id} scope="col" className={th}>
                      {l.id} ({f3(l.intercept)} {l.slope >= 0 ? '+' : '−'} {f3(Math.abs(l.slope))}w)
                    </th>
                  ))}
                  <th scope="col" className={th}>First</th>
                </tr>
              </thead>
              <tbody>
                {sensPoints.map((w) => {
                  const v = valuesAtWeight(sens, w)
                  const top = rank(sens.lines.map((l) => ({ id: l.id, total: v[l.id] })))[0].id
                  const mark = w === sens.base ? ' (base)' : sens.up && w === sens.up.at ? ' (reversal ↑)' : sens.down && w === sens.down.at ? ' (reversal ↓)' : ''
                  return (
                    <tr key={w} className="border-b border-slate-100 dark:border-slate-800">
                      <th scope="row" className={`${td} font-mono font-normal`}>{f3(w)}{mark}</th>
                      {sens.lines.map((l) => (
                        <td key={l.id} className={`${td} font-mono`}>{f3(v[l.id])}</td>
                      ))}
                      <td className={td}>{top}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Line diagrams for swing-weight sensitivity: <CitationText c={{ reading: 'R18', pages: '472' }} />. The proportional rescaling of the other weights is the course convention, not a rule stated in R18.
          </p>
        </section>
      )}

      {bars.length > 0 && (
        <section>
          <h4 className="font-semibold">6. Tornado: which weight judgement matters most?</h4>
          <label className="mt-1 flex items-center gap-2 text-xs">
            Vary each weight by ±
            <input aria-label="Tornado weight range" type="number" step={0.05} min={0.01} max={0.5} className={numInput} value={delta} onChange={(e) => setDelta(Math.min(0.5, Math.max(0.01, num(e.target.value) || 0.1)))} />
          </label>
          <Tornado bars={bars} winner={ranked[0].id} label={`Tornado diagram of ${ranked[0].id}'s margin over the best other alternative as each weight varies by ±${delta}. The table below gives the same data.`} />
          <table className="mt-2 w-full text-xs" data-testid="w07-tornado-table">
            <caption className="text-left text-xs text-slate-600 dark:text-slate-400">Margin of {ranked[0].id} over the best other alternative (negative = it is no longer first)</caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                {['Criterion', 'Weight range', 'Margin at low', 'Margin at high', 'Swing', 'Decision flips?'].map((h) => (
                  <th key={h} scope="col" className={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bars.map((b) => (
                <tr key={b.criterion} className="border-b border-slate-100 dark:border-slate-800">
                  <th scope="row" className={`${td} font-normal`}>{b.criterion}</th>
                  <td className={`${td} font-mono`}>{f3(b.low)}–{f3(b.high)}</td>
                  <td className={`${td} font-mono`}>{f3(b.marginLow)}</td>
                  <td className={`${td} font-mono`}>{f3(b.marginHigh)}</td>
                  <td className={`${td} font-mono`}>{f3(b.swing)}</td>
                  <td className={td}>{b.flips ? '✗ yes' : '✓ no'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {!blocking && (
        <section>
          <h4 className="font-semibold">7. Record the decision (DEC) in your workspace</h4>
          {!allSaved && <p className="text-xs text-amber-800 dark:text-amber-300">⚠ Save the study to your workspace first, so that the DEC can link to a workspace ALT.</p>}
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs">
              Recommended alternative
              <select className={input} value={dec.recommended} onChange={(e) => setDec({ ...dec, recommended: e.target.value })}>
                <option value="">Choose…</option>
                {study.alternatives.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} {a.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              Conditions under which it holds
              <textarea className={input} rows={2} value={dec.conditions} onChange={(e) => setDec({ ...dec, conditions: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              Residual risk
              <textarea className={input} rows={2} value={dec.residualRisk} onChange={(e) => setDec({ ...dec, residualRisk: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              What would change it (use the reversal points)
              <textarea className={input} rows={2} value={dec.wouldChangeIf} onChange={(e) => setDec({ ...dec, wouldChangeIf: e.target.value })} />
            </label>
          </div>
          <Button onClick={recordDecision} disabled={!allSaved}>Record DEC</Button>
          {decFb && (
            <div role="status" className="mt-1 text-xs" data-testid="w07-dec-feedback">
              {decFb.errors.map((e) => <p key={e} className="text-rose-800 dark:text-rose-300">Error: {e}</p>)}
              {decFb.warnings.map((e) => <p key={e} className="text-amber-800 dark:text-amber-300">Check: {e}</p>)}
              {decFb.done && <p>{decFb.done}</p>}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
