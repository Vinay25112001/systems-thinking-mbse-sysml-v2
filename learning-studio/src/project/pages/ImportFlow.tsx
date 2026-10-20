// The import flow (data model §10.3), used by Export and import and by the Week 1 lab tool's import button: the
// validation report (errors with paths, warnings, checksum), the plan table (new / identical / changed / conflict / ID
// collision / broken) with a choice per conflict, then Open as separate project, Merge, or Replace (type the project
// title to confirm). A pre-import snapshot is written before a merge or a replace. Nothing is written before the student
// confirms one of the three.
import { useEffect, useMemo, useState } from 'react'
import { projectTitle } from '../model/create'
import { useProjectState, useProjectStore } from '../store/ProjectProvider'
import { analyzeImport, buildPlan, CHOICE_LABEL, CLASS_LABEL, planComplete, planToOps, type Analysis, type Choice, type PlanClass } from '../transfer/importProject'
import { Chip } from './ui'

const TONE: Record<PlanClass, 'ok' | 'warn' | 'bad' | 'neutral' | 'project'> = { new: 'project', identical: 'neutral', 'changed-theirs': 'warn', 'changed-mine': 'neutral', conflict: 'bad', 'id-collision': 'warn', broken: 'bad' }

export function ImportFlow({ text, file, onDone, onCancel }: { text: string; file: string; onDone: (msg: string) => void; onCancel: () => void }) {
  const st = useProjectState()
  const store = useProjectStore()!
  const doc = st.doc!
  const [a, setA] = useState<Analysis | null>(null)
  const [choices, setChoices] = useState<Record<string, Choice>>({})
  const [mode, setMode] = useState<'' | 'replace'>('')
  const [typed, setTyped] = useState('')
  const [why, setWhy] = useState('')
  const [busy, setBusy] = useState(false)
  const [showAll, setShowAll] = useState(false)
  useEffect(() => {
    let alive = true
    void analyzeImport(text, file).then((x) => alive && setA(x))
    return () => {
      alive = false
    }
  }, [text, file])
  const plan = useMemo(() => (a && a.ok ? buildPlan(doc, a) : null), [a, doc])
  if (!a) return <p role="status">Checking {file}…</p>
  if (!a.ok)
    return (
      <div className="pj-stack" data-testid="import-refused">
        <div className="pj-banner status-bad" role="alert">
          <span>
            <strong>Not imported.</strong> {a.error}
          </span>
        </div>
        <button type="button" className="pj-btn" onClick={onCancel}>
          Close
        </button>
      </div>
    )
  const title = projectTitle(doc)
  const complete = plan ? planComplete(plan, choices) : false
  const changing = plan ? plan.items.filter((i) => i.cls !== 'identical') : []
  const shown = showAll ? plan!.items : changing
  const merge = async () => {
    if (!plan) return
    setBusy(true)
    const stamp = { at: new Date().toISOString(), by: st.editor, change: '' }
    const { ops, lines } = planToOps(doc, a, plan, choices, stamp)
    if (!ops.length) {
      onDone('Nothing to merge: the file holds nothing your project lacks.')
      return
    }
    const r = await store.importMerge((d, stamp) => planToOps(d, a, plan, choices, stamp).ops, `Merged ${file} (${a.format} ${a.version})`, lines.slice(0, 12).join(' '))
    setBusy(false)
    onDone(r.ok ? `Merged ${file}: ${lines.length} change${lines.length === 1 ? '' : 's'}. The state before the merge is saved as a pre-import version in History.` : `Not merged: ${r.error}`)
  }
  const replace = async () => {
    setBusy(true)
    const r = await store.importReplace(a.incoming, `Replaced the project with ${file}`, why.trim() || 'Replaced with an imported file')
    setBusy(false)
    onDone(r.ok ? `Replaced your project with ${file}. The previous state is saved as a pre-import version in History and can be restored.` : `Not replaced: ${r.error}`)
  }
  const separate = async () => {
    setBusy(true)
    const d = await store.importSeparate(a.incoming, a.changes)
    setBusy(false)
    onDone(`Opened ${file} as a separate project (${projectTitle(d)}). Your current project is unchanged; switch between projects under Export and import.`)
  }
  return (
    <div className="pj-stack" data-testid="import-flow">
      <section aria-labelledby="imp-v">
        <h3 id="imp-v" className="pj-h3">1. Validation report: {file}</h3>
        <p className="pj-small" style={{ margin: 0 }}>
          {a.kind === 'week1' ? `Week 1 model inputs, version ${a.version}` : `Project file, schema version ${a.version}`} · {Object.keys(a.incoming.artifacts).length} artifacts · {Object.keys(a.incoming.relationships).length} relationships · checksum:{' '}
          {a.checksum === 'ok' ? <Chip tone="ok">verified</Chip> : a.checksum === 'mismatch' ? <Chip tone="bad">does not match</Chip> : a.checksum === 'not-applicable' ? <span>none (legacy format)</span> : <Chip tone="warn">{a.checksum}</Chip>}
        </p>
        {a.issues.length > 0 && (
          <ul className="pj-small" data-testid="import-issues">
            {a.issues.slice(0, 12).map((i, k) => (
              <li key={k}>
                <strong>{i.severity === 'error' ? 'Error' : 'Warning'}</strong> <span className="pj-mono">{i.path}</span>: {i.message}
              </li>
            ))}
            {a.issues.length > 12 && <li>and {a.issues.length - 12} more</li>}
          </ul>
        )}
      </section>
      {plan && (
        <section aria-labelledby="imp-p">
          <h3 id="imp-p" className="pj-h3">2. Plan against your project “{title}”</h3>
          <p className="pj-row pj-small" style={{ margin: '0 0 8px' }} data-testid="plan-counts">
            {(Object.keys(plan.counts) as PlanClass[]).filter((c) => plan.counts[c]).map((c) => (
              <Chip key={c} tone={TONE[c]}>
                {CLASS_LABEL[c]}: {plan.counts[c]}
              </Chip>
            ))}
          </p>
          {plan.notes.map((n) => (
            <p key={n} className="pj-caption" style={{ margin: '0 0 4px' }}>{n}</p>
          ))}
          <div className="pj-table-wrap" style={{ maxHeight: 360, overflowY: 'auto', border: '1px solid var(--pj-line)', borderRadius: 8 }}>
            <table className="pj-table" data-testid="plan-table">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Class</th>
                  <th scope="col">What happens</th>
                  <th scope="col">Your choice (merge)</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((i) => (
                  <tr key={i.key} data-testid={`plan-${i.id}`}>
                    <td>
                      <span className="pj-mono">{i.id}</span> <span className="pj-small">{i.title}</span>
                    </td>
                    <td><Chip tone={TONE[i.cls]}>{CLASS_LABEL[i.cls]}</Chip></td>
                    <td className="pj-small">{i.detail}</td>
                    <td>
                      {i.choices.length > 1 ? (
                        <select className="pj-select" aria-label={`Choice for ${i.id}`} value={choices[i.key] ?? i.default ?? ''} onChange={(e) => setChoices((c) => ({ ...c, [i.key]: e.target.value as Choice }))}>
                          {i.default === null && !choices[i.key] && <option value="">Choose…</option>}
                          {i.choices.map((c) => (
                            <option key={c} value={c}>{CHOICE_LABEL[c]}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="pj-caption">{CHOICE_LABEL[i.choices[0]]}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!shown.length && (
                  <tr>
                    <td colSpan={4} className="pj-small">Every item in the file is identical to yours.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button type="button" className="pj-btn link pj-small" onClick={() => setShowAll((x) => !x)}>
            {showAll ? 'Show only items that change' : `Show identical items too (${plan.counts.identical})`}
          </button>
        </section>
      )}
      <section aria-labelledby="imp-m">
        <h3 id="imp-m" className="pj-h3">3. Choose what to do</h3>
        <div className="pj-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="pj-card flat">
            <h4 className="pj-h3">Open as a separate project</h4>
            <p className="pj-small">Stored next to yours; changes nothing in your current project. Good for comparing a teammate’s file first.</p>
            <button type="button" className="pj-btn" disabled={busy} onClick={() => void separate()} data-testid="import-separate">
              Open as separate project
            </button>
          </div>
          <div className="pj-card flat">
            <h4 className="pj-h3">Merge into my project</h4>
            <p className="pj-small">Applies the plan with your choices. Nothing is deleted. A version is saved first.</p>
            <button type="button" className="pj-btn primary" disabled={busy || !complete || st.readOnly} onClick={() => void merge()} data-testid="import-merge">
              Merge
            </button>
            {!complete && <p className="pj-caption">Choose for every conflict first.</p>}
          </div>
          <div className="pj-card flat">
            <h4 className="pj-h3">Replace my project</h4>
            <p className="pj-small">Your project’s content becomes the file’s. A version is saved first and can be restored from History.</p>
            {mode === 'replace' ? (
              <div className="pj-stack">
                <label className="pj-field">
                  <span>Type the project title to confirm: “{title}”</span>
                  <input className="pj-input" value={typed} onChange={(e) => setTyped(e.target.value)} data-testid="replace-title" />
                </label>
                <label className="pj-field">
                  <span>Rationale (optional)</span>
                  <input className="pj-input" value={why} onChange={(e) => setWhy(e.target.value)} />
                </label>
                <button type="button" className="pj-btn danger" disabled={busy || typed.trim() !== title.trim() || st.readOnly} onClick={() => void replace()} data-testid="replace-confirm">
                  Replace my project
                </button>
              </div>
            ) : (
              <button type="button" className="pj-btn danger" onClick={() => setMode('replace')} data-testid="import-replace">
                Replace…
              </button>
            )}
          </div>
        </div>
        <div className="pj-row" style={{ marginTop: 12 }}>
          <button type="button" className="pj-btn" onClick={onCancel} data-testid="import-cancel">
            Cancel (nothing is imported)
          </button>
        </div>
      </section>
    </div>
  )
}
