import { useState } from 'react'
import { DEFAULT_PROVENANCE_OWNER, ownerProblem, ProvenanceOwnerFields, type ProvenanceOwner } from '../../components/ProvenanceOwnerFields'
import { Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { useWorkspace, type Batch } from '../../state/Workspace'
import { TECHNOLOGIES, TRL_KEY, TRL_LEVELS, checkTrl, emptyTrl, ladderLevel, lowestCritical, trlName, type Answer, type TrlInput } from './trl'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
type Store = { items: Record<string, TrlInput>; recorded: Record<string, string> }
const initial = (): Store => ({ items: Object.fromEntries(TECHNOLOGIES.map((t) => [t.id, emptyTrl(t.id)])), recorded: {} })

export function TrlAssessor() {
  const { model, apply, updateElement, addLink } = useWorkspace()
  const [store, setStore] = usePersistentState<Store>('w06-trl', initial)
  const [active, setActive] = useState(TECHNOLOGIES[0].id)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [showKey, setShowKey] = useState(false)
  const [message, setMessage] = useState('')
  const [po, setPo] = useState<ProvenanceOwner>(DEFAULT_PROVENANCE_OWNER)
  const a = store.items[active] ?? emptyTrl(active)
  const tech = TECHNOLOGIES.find((t) => t.id === active)!
  const findings = checkTrl(a)
  const supported = ladderLevel(a.ladder)
  const all = TECHNOLOGIES.map((t) => store.items[t.id] ?? emptyTrl(t.id))
  const lowest = lowestCritical(all)

  const set = (patch: Partial<TrlInput>) => {
    setStore((s) => ({ ...s, items: { ...s.items, [active]: { ...(s.items[active] ?? emptyTrl(active)), ...patch } } }))
    setChecked((c) => ({ ...c, [active]: false }))
    setMessage('')
  }
  const setAnswer = (level: number, v: string) => set({ ladder: { ...a.ladder, [level]: (v || undefined) as Answer | undefined } })

  const record = () => {
    const ownerIssue = ownerProblem(po.owner)
    if (ownerIssue) return setMessage(`${ownerIssue} Every recorded element needs its owner (§7 rule 1).`)
    const owner = po.owner.trim().toUpperCase()
    const provenance = po.provenance
    if (findings.some((f) => f.severity === 'error')) {
      setChecked((c) => ({ ...c, [active]: true }))
      setMessage('Fix the errors before recording.')
      return
    }
    const attributes: Record<string, string | number | boolean> = {
      trl: a.claimed!,
      trlMeaning: trlName(a.claimed!),
      evidence: a.basis === 'evidence' ? a.evidence.trim() : `Assumption ${a.assumptionId.trim()}`,
      relevantEnvironment: a.relevantEnv.trim(),
      critical: a.critical,
    }
    if (a.maturityRisk.trim()) attributes.maturityRisk = a.maturityRisk.trim()
    const existingA = a.basis === 'assumption' ? model.elements.find((e) => e.id === a.assumptionId.trim() && e.kind === 'A') : undefined
    const recordedId = store.recorded[active]
    const risk = model.elements.find((e) => e.id === a.maturityRisk.trim() && e.kind === 'R')
    if (recordedId && model.elements.some((e) => e.id === recordedId)) {
      updateElement(recordedId, { attributes, owner, provenance })
      if (existingA) addLink(existingA.id, 'affects', recordedId, 'TRL rests on this assumption')
      if (risk) addLink(risk.id, 'affects', recordedId, 'Maturity risk')
      setMessage(`${recordedId} updated.`)
      return
    }
    const elements: NonNullable<Batch['elements']> = [{ key: 'tech', kind: 'TECH', name: tech.name, text: tech.text, attributes, owner, provenance }]
    const links: NonNullable<Batch['links']> = []
    if (a.basis === 'assumption') {
      if (existingA) links.push({ source: existingA.id, type: 'affects', target: 'tech', rationale: 'TRL rests on this assumption' })
      else {
        elements.push({ key: 'asm', kind: 'A', name: `${tech.name} maturity is TRL ${a.claimed}`, text: a.assumptionText.trim(), attributes: { trlAssumed: a.claimed! }, owner, provenance })
        links.push({ source: 'asm', type: 'affects', target: 'tech', rationale: 'TRL rests on this assumption' })
      }
    }
    if (risk) links.push({ source: risk.id, type: 'affects', target: 'tech', rationale: 'Maturity risk' })
    const res = apply({ elements, links })
    if (res.error) return setMessage(res.error)
    const techId = res.ids.tech
    setStore((s) => ({
      items: { ...s.items, [active]: { ...a, assumptionId: res.ids.asm ?? a.assumptionId } },
      recorded: { ...s.recorded, [active]: techId },
    }))
    setMessage(
      `${techId} recorded${res.ids.asm ? `; new assumption ${res.ids.asm} created (the workspace issues IDs — your register now uses ${res.ids.asm}; owner ${owner}; add its owner role and validation in the register)` : ''}${a.maturityRisk.trim() && !risk ? `; ${a.maturityRisk.trim()} is not in your workspace yet — record it in the register` : ''}.`,
    )
  }

  return (
    <div className="space-y-4 text-sm" data-testid="w06-trl-assessor">
      <div role="tablist" aria-label="Technology" className="flex flex-wrap gap-2">
        {TECHNOLOGIES.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={`rounded-md border px-3 py-1 text-sm ${active === t.id ? 'border-brand-600 font-semibold underline' : 'border-slate-300 dark:border-slate-700'}`}
          >
            {t.id} {t.name}
            {store.items[t.id]?.claimed ? ` · TRL ${store.items[t.id].claimed}` : ''}
          </button>
        ))}
      </div>
      <p>{tech.text}</p>

      <fieldset className="rounded border border-slate-200 p-3 dark:border-slate-800">
        <legend className="px-1 font-medium">Step 1 — walk the scale (SEBoK Table 1, R16 p.767)</legend>
        <p className="mb-2 text-xs text-slate-600 dark:text-slate-400">Answer from what is actually known about {tech.id} for AeroLink. “Unknown” is an honest answer; it stops the ladder just like “no”.</p>
        <table className="w-full text-left text-xs">
          <caption className="sr-only">TRL ladder questions</caption>
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-1 pr-2">TRL</th>
              <th className="py-1 pr-2">Definition</th>
              <th className="py-1">Your answer</th>
            </tr>
          </thead>
          <tbody>
            {TRL_LEVELS.map((l) => (
              <tr key={l.level} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-1 pr-2 font-medium">{l.level}{l.level <= supported ? ' ✓' : ''}</td>
                <td className="py-1 pr-2">{l.name}</td>
                <td className="py-1">
                  <select aria-label={`TRL ${l.level}: ${l.question}`} className={input} value={a.ladder[l.level] ?? ''} onChange={(e) => setAnswer(l.level, e.target.value)}>
                    <option value="">—</option>
                    <option value="yes">Yes, evidenced or assumed</option>
                    <option value="no">No</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1" data-testid="w06-trl-supported">Your answers support TRL {supported || 'none'}{supported ? ` — ${trlName(supported)}` : ''}.</p>
      </fieldset>

      <fieldset className="grid gap-2 rounded border border-slate-200 p-3 sm:grid-cols-2 dark:border-slate-800">
        <legend className="px-1 font-medium">Step 2 — assign and justify</legend>
        <label className="flex flex-col gap-1">
          Assigned TRL
          <select className={input} value={a.claimed ?? ''} onChange={(e) => set({ claimed: e.target.value ? Number(e.target.value) : undefined })}>
            <option value="">Choose…</option>
            {TRL_LEVELS.map((l) => (
              <option key={l.level} value={l.level}>
                TRL {l.level} — {l.name}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="flex flex-col gap-1">
          <legend>Basis</legend>
          <label className="flex items-center gap-2">
            <input type="radio" name={`basis-${active}`} checked={a.basis === 'evidence'} onChange={() => set({ basis: 'evidence' })} /> Cited evidence
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name={`basis-${active}`} checked={a.basis === 'assumption'} onChange={() => set({ basis: 'assumption' })} /> Labelled assumption
          </label>
        </fieldset>
        {a.basis === 'evidence' && (
          <label className="flex flex-col gap-1 sm:col-span-2">
            Evidence (document, test or demonstration; who, where, when)
            <textarea className={input} rows={2} value={a.evidence} onChange={(e) => set({ evidence: e.target.value })} />
          </label>
        )}
        {a.basis === 'assumption' && (
          <>
            <label className="flex flex-col gap-1">
              Assumption ID (A-nnn)
              <input className={input} value={a.assumptionId} onChange={(e) => set({ assumptionId: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              Assumption statement (what is assumed; how and when it will be confirmed)
              <textarea className={input} rows={2} value={a.assumptionText} onChange={(e) => set({ assumptionText: e.target.value })} />
            </label>
          </>
        )}
        <label className="flex flex-col gap-1 sm:col-span-2">
          What “relevant environment” means for this technology at AeroLink (R60 p.525)
          <input className={input} value={a.relevantEnv} onChange={(e) => set({ relevantEnv: e.target.value })} />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={a.critical} onChange={(e) => set({ critical: e.target.checked })} /> Critical to the CP2 baseline
        </label>
        <label className="flex flex-col gap-1">
          Maturity risk (R-nnn)
          <input className={input} value={a.maturityRisk} onChange={(e) => set({ maturityRisk: e.target.value })} />
        </label>
      </fieldset>

      <ProvenanceOwnerFields value={po} onChange={setPo} />
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setChecked((c) => ({ ...c, [active]: true }))}>Check this assessment</Button>
        <Button variant="secondary" onClick={record}>
          Record in workspace
        </Button>
        <Button variant="ghost" onClick={() => setShowKey((v) => !v)}>
          {showKey ? 'Hide' : 'Show'} the instructor key
        </Button>
        <span role="status" data-testid="w06-trl-message">
          {message}
        </span>
      </div>

      {checked[active] && (
        <div data-testid="w06-trl-findings">
          {findings.length === 0 ? (
            <p>No findings: the TRL follows from your answers and its basis is stated.</p>
          ) : (
            <ul className="list-disc space-y-1 pl-5">
              {findings.map((f) => (
                <li key={f.message}>
                  <strong>{f.severity === 'error' ? 'Error' : 'Check'}:</strong> {f.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showKey && (
        <div className="rounded border border-slate-200 p-3 dark:border-slate-800" data-testid="w06-trl-key">
          <p className="font-medium">Instructor key for {active} (FICTIONAL; rests on an assumption, as no supplier evidence exists in the course sources)</p>
          <p>
            TRL {TRL_KEY[active].trl} ({trlName(TRL_KEY[active].trl)}), basis {TRL_KEY[active].assumption}; {TRL_KEY[active].critical ? 'critical' : 'not critical'} to the baseline; maturity risk {TRL_KEY[active].maturityRisk || '— (TRL ≥ 6: none required)'}{TRL_KEY[active].relatedRisk ? `; related risk ${TRL_KEY[active].relatedRisk}` : ''}. {TRL_KEY[active].why}
          </p>
        </div>
      )}

      <p data-testid="w06-trl-lowest" className="rounded bg-slate-50 p-2 dark:bg-slate-800/60">
        {lowest
          ? `Lowest critical TRL: ${lowest.level} (${lowest.techs.join(', ')}). ${lowest.level < 6 ? 'Below TRL 6: the requirements that depend on it rest on immature technology — a maturity risk and a maturation plan are needed before the baseline can be called achievable (R60 p.526, p.530; R40 p.72).' : 'At or above TRL 6 for every critical technology.'}`
          : 'Assign TRLs and mark which technologies are critical to see the lowest critical TRL.'}
      </p>
    </div>
  )
}
