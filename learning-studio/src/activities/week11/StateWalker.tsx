import { useState } from 'react'
import { Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { practiceRids, practiceUnlock } from './rids'
import { REFERENCE_MACHINE, TEAM_K_MACHINE, TRACES, analyseMachine, fire, guardNames, runTrace, triggersOf, type Env, type StateMachine, type Transition } from './states'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
type Which = 'reference' | 'teamK' | 'mine'

export function StateWalker() {
  const [which, setWhich] = usePersistentState<Which>('w11-walker-which', 'reference')
  const [mine, setMine] = usePersistentState<StateMachine>('w11-walker-mine', { ...REFERENCE_MACHINE, name: 'My copy of AircraftOperatingStates' })
  const machine = which === 'reference' ? REFERENCE_MACHINE : which === 'teamK' ? TEAM_K_MACHINE : mine
  const [current, setCurrent] = useState(machine.initial[0] ?? '')
  const [env, setEnv] = useState<Env>({})
  const [log, setLog] = useState<string[]>([])
  const [draft, setDraft] = useState<Transition>({ id: '', from: '', trigger: '', guard: '', to: '' })
  const [statesText, setStatesText] = useState(mine.states.join(', '))
  const unlock = practiceUnlock(practiceRids())
  const hideFindings = which === 'teamK' && !unlock.ok
  const findings = analyseMachine(machine)
  const state = machine.states.includes(current) ? current : machine.initial[0] ?? ''

  const choose = (w: Which) => {
    setWhich(w)
    const m = w === 'reference' ? REFERENCE_MACHINE : w === 'teamK' ? TEAM_K_MACHINE : mine
    setCurrent(m.initial[0] ?? '')
    setLog([])
  }
  const onFire = (trigger: string) => {
    const r = fire(machine, state, trigger, env)
    if (r.next !== null) {
      setCurrent(r.next)
      setLog([...log, `${state} —${trigger}${r.transition.guard ? ` [${r.transition.guard}]` : ''}→ ${r.next} (transition ${r.transition.id})`])
    } else setLog([...log, `${state}: ${trigger} not accepted. ${r.reason}`])
  }
  const outgoing = machine.transitions.filter((t) => t.from === state)

  return (
    <div className="space-y-4 text-sm" data-testid="w11-state-walker">
      <p>
        Teaching aid over a table of states and transitions; it does not read SysML. Fire events, set guard values, and watch which transitions are enabled. Then run the ConOps traces and the analysis, edit your own copy, and decide which gaps are real.
      </p>
      <fieldset className="flex flex-wrap gap-4">
        <legend className="sr-only">Machine</legend>
        {([['reference', 'Reference AircraftOperatingStates'], ['teamK', 'Team K VertiportWeatherStates (seeded)'], ['mine', 'My editable copy']] as const).map(([w, label]) => (
          <label key={w} className="flex items-center gap-1.5"><input type="radio" name="w11-walker-machine" checked={which === w} onChange={() => choose(w)} />{label}</label>
        ))}
      </fieldset>

      <section className="rounded border border-slate-200 p-2 dark:border-slate-800">
        <p data-testid="w11-walker-current">Current state: <strong className="font-mono">{state}</strong></p>
        {guardNames(machine).length > 0 && (
          <div className="mt-1 flex flex-wrap gap-3">
            {guardNames(machine).map((g) => (
              <label key={g} className="flex items-center gap-1.5"><input type="checkbox" checked={!!env[g]} onChange={(e) => setEnv({ ...env, [g]: e.target.checked })} /><span className="font-mono">{g}</span> is true</label>
            ))}
          </div>
        )}
        <p className="mt-2">Transitions out of {state}: {outgoing.length ? outgoing.map((t) => `${t.id} (accept ${t.trigger}${t.guard ? ` if ${t.guard}` : ''} then ${t.to})`).join('; ') : 'none'}.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {triggersOf(machine).map((tr) => <Button key={tr} variant="secondary" onClick={() => onFire(tr)}>Send {tr}</Button>)}
          <Button variant="ghost" onClick={() => { setCurrent(machine.initial[0] ?? ''); setLog([]) }}>Reset to the initial state</Button>
        </div>
        <ol className="mt-2 ml-5 list-decimal font-mono text-xs" data-testid="w11-walker-log" aria-live="polite">
          {log.map((l, i) => <li key={i}>{l}</li>)}
        </ol>
      </section>

      {which !== 'teamK' && (
        <section>
          <h4 className="font-medium">ConOps traces (course teaching traces)</h4>
          <ul className="space-y-1" data-testid="w11-walker-traces">
            {TRACES.map((t) => {
              const r = runTrace(machine, t)
              return (
                <li key={t.id}>
                  <span aria-hidden="true" className="mr-1 font-bold">{r.matches ? '✓' : '✗'}</span>
                  <span className="sr-only">{r.matches ? 'Matches the ConOps' : 'Does not match the ConOps'}: </span>
                  <strong>{t.id}</strong> {t.label} <span className="text-xs">({t.source})</span>: {r.visited.join(' → ')}
                  {r.matches ? ` — ends in ${t.expectEnd} as the ConOps implies.` : r.stoppedAt !== null ? ` — stops at event ${r.stoppedAt + 1}: ${r.reason} The ConOps implies ${t.expectEnd}. Is this a gap? Write a RID or record why not.` : ` — ends in ${r.end}, not ${t.expectEnd}.`}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {which === 'mine' && (
        <fieldset className="rounded border border-slate-200 p-2 dark:border-slate-800">
          <legend className="px-1 font-medium">Edit my copy</legend>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col">States (comma-separated)<input className={`${input} w-96 max-w-full`} value={statesText} onChange={(e) => setStatesText(e.target.value)} /></label>
            <Button variant="secondary" onClick={() => setMine({ ...mine, states: statesText.split(',').map((s) => s.trim()).filter(Boolean) })}>Apply states</Button>
            <label className="flex flex-col">Initial state
              <select className={input} value={mine.initial[0] ?? ''} onChange={(e) => setMine({ ...mine, initial: [e.target.value] })}>
                {mine.states.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          </div>
          <ul className="mt-2 space-y-1 font-mono text-xs">
            {mine.transitions.map((t, i) => (
              <li key={`${t.id}-${i}`} className="flex items-center gap-2">
                transition {t.id} first {t.from} accept {t.trigger}{t.guard ? ` if ${t.guard}` : ''} then {t.to};
                <Button variant="ghost" ariaLabel={`Remove transition ${t.id}`} onClick={() => setMine({ ...mine, transitions: mine.transitions.filter((_, j) => j !== i) })}>Remove</Button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            {(['id', 'from', 'trigger', 'guard', 'to'] as const).map((k) => (
              <label key={k} className="flex flex-col">{k === 'id' ? 'Transition name' : k === 'guard' ? 'Guard (optional)' : k[0].toUpperCase() + k.slice(1)}
                <input className={`${input} w-36`} value={draft[k] ?? ''} onChange={(e) => setDraft({ ...draft, [k]: e.target.value.trim() })} />
              </label>
            ))}
            <Button disabled={!draft.id || !draft.from || !draft.trigger || !draft.to} onClick={() => { setMine({ ...mine, transitions: [...mine.transitions, { id: draft.id, from: draft.from, trigger: draft.trigger, to: draft.to, ...(draft.guard ? { guard: draft.guard } : {}) }] }); setDraft({ id: '', from: '', trigger: '', guard: '', to: '' }) }}>Add transition</Button>
            <Button variant="ghost" onClick={() => { setMine({ ...REFERENCE_MACHINE, name: 'My copy of AircraftOperatingStates' }); setStatesText(REFERENCE_MACHINE.states.join(', ')) }}>Reset my copy to the reference</Button>
          </div>
        </fieldset>
      )}

      <section aria-live="polite">
        <h4 className="font-medium">Analysis of {machine.name}</h4>
        {hideFindings && <p className="text-xs" data-testid="w11-walker-locked">The analysis of Team K’s machine is hidden until you have written your own findings: {unlock.message} You can still fire events at it.</p>}
        <ul className="space-y-1" data-testid="w11-walker-findings">
          {(hideFindings ? [] : findings).map((f) => (
            <li key={f.id}>
              <span aria-hidden="true" className="mr-1 font-bold">{f.ok ? '✓' : f.level === 'error' ? '✗' : '!'}</span>
              <span className="sr-only">{f.ok ? 'Pass' : f.level === 'error' ? 'Error' : 'Advisory'}: </span>
              {f.message} <span className="text-xs text-slate-600 dark:text-slate-400">({f.source})</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
