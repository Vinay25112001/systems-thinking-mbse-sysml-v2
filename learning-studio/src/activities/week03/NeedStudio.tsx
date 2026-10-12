import { useState } from 'react'
import { DEFAULT_PROVENANCE_OWNER, ownerProblem, ProvenanceOwnerFields, type ProvenanceOwner } from '../../components/ProvenanceOwnerFields'
import { Button, CitationText } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { useWorkspace } from '../../state/Workspace'
import { CRITERIA, CRITIQUE_ITEMS, FLAWS, checkNeed, diagnose, scoreCritique, type CritiqueAnswer, type NeedDraft } from './needs'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
const blank: NeedDraft = { name: '', text: '', conditions: '', rationale: '', traces: [] }
const flawLabel = (id: string) => FLAWS.find((f) => f.id === id)?.label ?? id

function Critique() {
  const [answers, setAnswers] = usePersistentState<Record<string, CritiqueAnswer | undefined>>('w03-critique', {})
  const [rewrites, setRewrites] = usePersistentState<Record<string, string>>('w03-critique-rewrites', {})
  const [checked, setChecked] = useState(false)
  const score = scoreCritique(answers)
  return (
    <section data-testid="w03-critique">
      <h4 className="font-semibold">Part A — diagnose six draft “needs”</h4>
      <p className="mt-1">Tick every flaw you see and write your own rewrite before you check: the reference rewrite is shown only afterwards. The key is computed by the same criteria the studio applies in Part B, so a disagreement is worth arguing in class: the screen is lexical and can be wrong.</p>
      <ol className="mt-2 space-y-3">
        {CRITIQUE_ITEMS.map((it, i) => {
          const row = score.rows[i]
          return (
            <li key={it.id} className="rounded border border-slate-200 p-2 dark:border-slate-800">
              <p className="italic">{i + 1}. “{it.before}”</p>
              <fieldset className="mt-1 flex flex-wrap gap-3">
                <legend className="sr-only">Flaws in statement {i + 1}</legend>
                {FLAWS.map((f) => (
                  <label key={f.id} className="inline-flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={!!answers[it.id]?.[f.id]}
                      onChange={(e) => {
                        setAnswers((p) => ({ ...p, [it.id]: { ...(p[it.id] ?? {}), [f.id]: e.target.checked } }))
                        setChecked(false)
                      }}
                      aria-label={`Statement ${i + 1}: ${f.label}`}
                    />
                    {f.label}
                  </label>
                ))}
              </fieldset>
              <label className="mt-1 flex flex-col gap-1 text-xs">
                Your rewrite of statement {i + 1} (before checking)
                <textarea
                  className={input}
                  rows={2}
                  value={rewrites[it.id] ?? ''}
                  onChange={(e) => {
                    setRewrites((p) => ({ ...p, [it.id]: e.target.value }))
                    setChecked(false)
                  }}
                />
              </label>
              {checked && (
                <div className="mt-1 text-xs" data-testid={`w03-critique-${it.id}`}>
                  <p>
                    <strong>{row.correct ? 'Agrees with the key.' : 'Differs from the key.'}</strong> Key: {row.key.length ? row.key.map(flawLabel).join(', ') : 'no flaw'}.
                    {row.missed.length > 0 && ` Missed: ${row.missed.map(flawLabel).join(', ')}.`}
                    {row.extra.length > 0 && ` Not flagged by the key: ${row.extra.map(flawLabel).join(', ')}.`}
                  </p>
                  {(rewrites[it.id] ?? '').trim() && (
                    <p className="mt-0.5">
                      Your rewrite screens as: {diagnose(rewrites[it.id]).length ? diagnose(rewrites[it.id]).map(flawLabel).join(', ') : 'no flaw found by the screen (a reviewer still reads it)'}.
                    </p>
                  )}
                  <p className="mt-0.5">Reference rewrite ({it.afterId}): “{it.after}”</p>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-400">{it.note}</p>
                </div>
              )}
            </li>
          )
        })}
      </ol>
      <div className="mt-2 flex items-center gap-3">
        <Button onClick={() => setChecked(true)}>Check my diagnosis</Button>
        {checked && <span role="status" data-testid="w03-critique-score">{score.correct} of {score.total} statements diagnosed exactly as the key.</span>}
      </div>
    </section>
  )
}

export function NeedStudio() {
  const { model, apply } = useWorkspace()
  const [d, setD] = usePersistentState<NeedDraft>('w03-need-draft', blank)
  const [po, setPo] = usePersistentState<ProvenanceOwner>('w03-need-po', DEFAULT_PROVENANCE_OWNER)
  const [attempted, setAttempted] = useState(false)
  const [message, setMessage] = useState('')
  const sources = model.elements.filter((e) => (e.kind === 'STK' || e.kind === 'CON') && e.status === 'active')
  const results = checkNeed(d)
  const ownerIssue = ownerProblem(po.owner)
  const allOk = results.every((r) => r.ok)
  const needs = model.elements.filter((e) => e.kind === 'NEED' && e.status === 'active')
  const tracedNeeds = needs.filter((n) => model.links.some((l) => l.source === n.id && l.type === 'derives-from' && /^(STK|CON)-/.test(l.target)))
  const toggle = (id: string) => setD({ ...d, traces: d.traces.includes(id) ? d.traces.filter((t) => t !== id) : [...d.traces, id] })

  const record = () => {
    setAttempted(true)
    if (!allOk) {
      setMessage('Not recorded: fix the criteria marked “Fix” first.')
      return
    }
    if (ownerIssue) {
      setMessage(`Not recorded: ${ownerIssue}`)
      return
    }
    const r = apply({
      elements: [{ key: 'need', kind: 'NEED', name: d.name.trim(), text: d.text.trim(), attributes: { conditions: d.conditions.trim(), rationale: d.rationale.trim() }, owner: po.owner.trim().toUpperCase(), provenance: po.provenance }],
      links: d.traces.map((t) => ({ source: 'need', type: 'derives-from' as const, target: t, rationale: 'Recorded in Lab L3' })),
    })
    if (r.error) {
      setMessage(`Not recorded: ${r.error}`)
      return
    }
    setMessage(`${r.ids.need} recorded with ${r.linkIds.length} derives-from link(s) (${d.traces.join(', ')}).`)
    setD(blank)
    setAttempted(false)
  }

  return (
    <div className="space-y-6 text-sm" data-testid="w03-need-studio">
      <Critique />
      <section>
        <h4 className="font-semibold">Part B — write and record need statements</h4>
        <p className="mt-1">
          Each need is checked against six criteria, each from a reading. Accepted needs are written to your AeroLink workspace as NEED items with derives-from links to the stakeholders and concerns you choose ({sources.length} available; record concerns in Week 2’s recorder first).
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            Short name
            <input className={input} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1">
            Conditions (when, where, under what operating conditions)
            <input className={input} value={d.conditions} onChange={(e) => setD({ ...d, conditions: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            Need statement
            <textarea className={input} rows={2} value={d.text} placeholder="<Stakeholder> need(s) … " onChange={(e) => setD({ ...d, text: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            Rationale (why)
            <textarea className={input} rows={2} value={d.rationale} onChange={(e) => setD({ ...d, rationale: e.target.value })} />
          </label>
        </div>
        <fieldset className="mt-2">
          <legend className="font-medium">Derives from (stakeholders and concerns)</legend>
          <div className="mt-1 grid max-h-48 gap-1 overflow-y-auto sm:grid-cols-2">
            {sources.map((s) => (
              <label key={s.id} className="inline-flex items-start gap-1">
                <input type="checkbox" checked={d.traces.includes(s.id)} onChange={() => toggle(s.id)} />
                <span>
                  {s.id} {s.name}
                </span>
              </label>
            ))}
            {sources.length === 0 && <p>No stakeholders found: add them in the stakeholder editor.</p>}
          </div>
        </fieldset>
        <ul className="mt-3 space-y-1" aria-label="Need criteria" data-testid="w03-need-criteria">
          {results.map((r) => {
            const c = CRITERIA.find((x) => x.id === r.id)!
            return (
              <li key={r.id}>
                <strong>{r.ok ? '✓ Pass' : '✗ Fix'}</strong> — {c.label}. <span>{r.message}</span> <CitationText c={c.cite} />
              </li>
            )
          })}
        </ul>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          Passing the six checks is necessary, not sufficient: L3 accepts a need that passes this screen and a team review, because a lexical screen cannot see a solution written in plain words.
        </p>
        <div className="mt-2">
          <ProvenanceOwnerFields value={po} onChange={setPo} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Button onClick={record}>Record need</Button>
          <span role="status" data-testid="w03-need-message">
            {message}
          </span>
        </div>
        {attempted && !allOk && <p role="alert" className="mt-1 text-rose-700 dark:text-rose-300">{results.filter((r) => !r.ok).length} criterion/criteria still to fix.</p>}
        <p className="mt-2" data-testid="w03-need-coverage">
          Workspace: {needs.length} NEED (L3 minimum 8), {tracedNeeds.length} traced to a stakeholder or concern.
        </p>
        {needs.length > 0 && (
          <table className="mt-2 w-full text-left text-xs">
            <caption className="text-left font-medium">Needs in your workspace</caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-1 pr-2">ID</th>
                <th className="py-1 pr-2">Statement</th>
                <th className="py-1 pr-2">Derives from</th>
                <th className="py-1">Owner / provenance</th>
              </tr>
            </thead>
            <tbody>
              {needs.map((n) => (
                <tr key={n.id} className="border-b border-slate-100 align-top dark:border-slate-800">
                  <td className="py-0.5 pr-2">{n.id}</td>
                  <td className="py-0.5 pr-2">{n.text}</td>
                  <td className="py-0.5 pr-2">{model.links.filter((l) => l.source === n.id && l.type === 'derives-from').map((l) => l.target).join(', ') || '—'}</td>
                  <td className="py-0.5">
                    {n.owner ?? '—'} / {n.provenance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
