import { useState } from 'react'
import { DEFAULT_PROVENANCE_OWNER, ProvenanceOwnerFields, ownerProblem, type ProvenanceOwner } from '../../components/ProvenanceOwnerFields'
import { Button } from '../../components/ui'
import { loadJSON } from '../../lib/storage'
import { sysmlSource } from '../../lib/sysml'
import { usePersistentState } from '../../lib/usePersistentState'
import {
  CATEGORIES, LEGACY_STORE, MODEL_RIDS, PRACTICE_STORE, PRACTICE_TARGET, REVIEW_STORE, SEVERITIES, TOOL_VISIBLE_RIDS, blankRid, checkRid, checkRidSet,
  practiceUnlock, ridMarkdown, ridOk, type Category, type Rid, type Severity,
} from './rids'

const FRAGMENT_FILE = 'week11/aerolink_review_fragment_team_k.sysml'
const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
const FIELDS: { key: 'location' | 'criterion' | 'discrepancy' | 'fix'; label: string; hint: string; area?: boolean }[] = [
  { key: 'location', label: 'Location', hint: "Element ID or qualified name, and line, e.g. Behavior::VertiportWeatherStates line 56" },
  { key: 'criterion', label: 'Violated criterion or source', hint: 'e.g. RB-8.5; S06 p.146; S10 slide 54; SCN-005 A2; C.2 rule 1' },
  { key: 'discrepancy', label: 'Discrepancy (what is there, what is wrong)', hint: 'One or two sentences naming the element, step or line', area: true },
  { key: 'fix', label: 'Proposed fix', hint: 'The change you propose, naming the construct and the elements', area: true },
]
type Mode = 'practice' | 'review'

export function RidWriter() {
  const [who, setWho] = usePersistentState<ProvenanceOwner>('w11-rid-owner', DEFAULT_PROVENANCE_OWNER)
  const [mode, setMode] = usePersistentState<Mode>('w11-rid-mode', 'practice')
  // Practice RIDs on Team K and the Week 12 review RIDs are separate lists with separate exports (W11-F22).
  const [practice, setPractice] = usePersistentState<Rid[]>(PRACTICE_STORE, () => loadJSON<Rid[]>(LEGACY_STORE, []))
  const [review, setReview] = usePersistentState<Rid[]>(REVIEW_STORE, [])
  const rids = mode === 'practice' ? practice : review
  const setRids = mode === 'practice' ? setPractice : setReview
  const [draft, setDraft] = useState<Rid>(blankRid('RID-T1-01'))
  const [editing, setEditing] = useState<number | null>(null)
  const [showKey, setShowKey] = useState(false)
  const checks = checkRid(draft)
  const msg = (field: keyof Rid) => checks.filter((c) => c.field === field)
  const ownerMsg = ownerProblem(who.owner)
  const canSave = ridOk(draft) && !ownerMsg
  const lines = (sysmlSource(FRAGMENT_FILE) ?? '').split(/\r?\n/)
  const set = checkRidSet(rids, mode === 'practice' ? PRACTICE_TARGET : 5)
  const unlock = practiceUnlock(practice)

  const save = () => {
    const rid: Rid = { ...draft, owner: who.owner.trim().toUpperCase(), provenance: who.provenance }
    setRids(editing === null ? [...rids, rid] : rids.map((r, i) => (i === editing ? rid : r)))
    const next = rids.length + (editing === null ? 2 : 1)
    setDraft(blankRid(draft.id.replace(/\d{2}$/, String(next).padStart(2, '0'))))
    setEditing(null)
  }
  const switchMode = (m: Mode) => {
    setMode(m)
    setEditing(null)
    setDraft(blankRid('RID-T1-01'))
  }

  return (
    <div className="space-y-4 text-sm" data-testid="w11-rid-writer">
      <p>
        Write review item discrepancies (RIDs): first {PRACTICE_TARGET} practice RIDs on Team K’s fragment below, then, in Week 12, the RIDs on the CP4 model you are assigned. The screens check the form of a RID against RB-17 (location, a criterion or source that exists, severity, a concrete fix). They cannot tell whether the defect is real — that is RB-17.1, and the instructor judges it.
      </p>
      <fieldset className="flex flex-wrap gap-4">
        <legend className="sr-only">Which RID list</legend>
        <label className="flex items-center gap-1.5"><input type="radio" name="w11-rid-mode" checked={mode === 'practice'} onChange={() => switchMode('practice')} />Practice on Team K (L11)</label>
        <label className="flex items-center gap-1.5"><input type="radio" name="w11-rid-mode" checked={mode === 'review'} onChange={() => switchMode('review')} />Week 12 review of my assigned team’s CP4 model</label>
      </fieldset>

      {mode === 'practice' && (
        <details className="rounded border border-slate-200 p-2 dark:border-slate-800">
          <summary className="cursor-pointer font-medium">Team K’s draft ({FRAGMENT_FILE}; accepted by the checker)</summary>
          <pre className="max-h-96 overflow-auto text-xs leading-relaxed" tabIndex={0} aria-label="Seeded review fragment with line numbers">
            {lines.map((l, i) => <div key={i}><span aria-hidden="true" className="mr-2 inline-block w-6 select-none text-right text-slate-600 dark:text-slate-400">{i + 1}</span>{l}</div>)}
          </pre>
        </details>
      )}

      <ProvenanceOwnerFields value={who} onChange={setWho} />

      <fieldset className="space-y-2 rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">{editing === null ? `New RID (${mode === 'practice' ? 'practice' : 'Week 12 review'})` : `Edit ${draft.id}`}</legend>
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col">RID ID<input className={`${input} w-32`} value={draft.id} onChange={(e) => setDraft({ ...draft, id: e.target.value })} /></label>
          <label className="flex flex-col">Category
            <select className={input} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}>
              <option value="">— choose —</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col">Severity (course scale)
            <select className={input} value={draft.severity} onChange={(e) => setDraft({ ...draft, severity: e.target.value as Severity })}>
              <option value="">— choose —</option>
              {SEVERITIES.map((s) => <option key={s.id} value={s.id} title={s.meaning}>{s.label}</option>)}
            </select>
          </label>
        </div>
        {FIELDS.map((f) => (
          <label key={f.key} className="flex flex-col">
            {f.label}
            {f.area
              ? <textarea className={input} rows={2} value={draft[f.key]} placeholder={f.hint} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />
              : <input className={input} value={draft[f.key]} placeholder={f.hint} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />}
          </label>
        ))}
        <ul className="space-y-0.5 text-xs" data-testid="w11-rid-screens" aria-live="polite">
          {(['id', 'location', 'criterion', 'category', 'severity', 'discrepancy', 'fix'] as const).flatMap((k) => msg(k).map((c, i) => (
            <li key={`${k}-${i}`}><span aria-hidden="true" className="mr-1 font-bold">{c.ok ? '✓' : '✗'}</span><span className="sr-only">{c.ok ? 'OK' : 'Problem'}: </span><strong>{k}</strong>: {c.message}</li>
          )))}
          {ownerMsg && <li><span aria-hidden="true" className="mr-1 font-bold">✗</span><span className="sr-only">Problem: </span><strong>writer</strong>: {ownerMsg}</li>}
        </ul>
        <div className="flex gap-2">
          <Button disabled={!canSave} onClick={save}>{editing === null ? 'Add RID' : 'Save changes'}</Button>
          {editing !== null && <Button variant="ghost" onClick={() => { setEditing(null); setDraft(blankRid()) }}>Cancel</Button>}
        </div>
      </fieldset>

      <section>
        <h4 className="font-medium">{mode === 'practice' ? 'My practice RIDs' : 'My Week 12 review RIDs'} ({rids.length})</h4>
        <ol className="ml-5 list-decimal space-y-1" data-testid="w11-rid-list">
          {rids.map((r, i) => (
            <li key={`${r.id}-${i}`}>
              <span aria-hidden="true" className="mr-1 font-bold">{ridOk(r) ? '✓' : '✗'}</span>
              <span className="sr-only">{ridOk(r) ? 'Passes the screens' : 'Has open screen messages'}: </span>
              <strong>{r.id}</strong> [{r.severity}, {r.category}] {r.location} — {r.discrepancy} <em>Fix:</em> {r.fix} <span className="text-xs">({r.owner}, {r.provenance})</span>
              <Button variant="ghost" ariaLabel={`Edit ${r.id}`} onClick={() => { setEditing(i); setDraft(r) }}>Edit</Button>
              <Button variant="ghost" ariaLabel={`Remove ${r.id}`} onClick={() => setRids(rids.filter((_, j) => j !== i))}>Remove</Button>
            </li>
          ))}
        </ol>
        <ul className="mt-2 space-y-0.5" data-testid="w11-rid-set">
          {set.map((c, i) => <li key={i}><span aria-hidden="true" className="mr-1 font-bold">{c.ok ? '✓' : '✗'}</span><span className="sr-only">{c.ok ? 'OK' : 'Problem'}: </span>{c.message}</li>)}
        </ul>
      </section>

      <details className="rounded border border-slate-200 p-2 dark:border-slate-800">
        <summary className="cursor-pointer font-medium">{mode === 'practice' ? 'Practice RID table (Markdown; not for submission)' : 'Week 12 RID table (Markdown) to submit'}</summary>
        <pre className="overflow-x-auto whitespace-pre-wrap text-xs" tabIndex={0} data-testid="w11-rid-markdown">{ridMarkdown(rids)}</pre>
      </details>

      {mode === 'practice' && (
        <div>
          <p className="text-xs" data-testid="w11-rid-unlock">{unlock.message}</p>
          <Button variant="secondary" disabled={!unlock.ok} onClick={() => setShowKey(true)}>Compare with the instructor’s RIDs</Button>
          {showKey && unlock.ok && (
            <ol className="mt-2 ml-5 list-decimal space-y-1 text-xs" data-testid="w11-rid-key">
              {MODEL_RIDS.map((r) => <li key={r.id}><strong>{r.id}</strong> [{r.severity}, {r.category}]{TOOL_VISIBLE_RIDS.includes(r.id) ? ' (the tools also show a symptom)' : ' (found only by reading)'} {r.location}. {r.criterion}. {r.discrepancy} <em>Fix:</em> {r.fix}</li>)}
            </ol>
          )}
        </div>
      )}
    </div>
  )
}
