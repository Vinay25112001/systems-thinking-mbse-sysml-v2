// Week 8 lab tool, Week 1 → Week 8 continuity (M7): the student chooses where the Week 1 input comes from (the team's
// My Project, or a Week 1 model-inputs file as before) and sees which one is in use (project name, revision, time); and,
// when My Project is the source, confirms a package for each Week 1 ID. Each confirmation is stored in the project as a
// mapping record (upsert-mapping through the project store, so the course server's authorization and ID rules apply
// when signed in) with its provenance; IDs are never renumbered, and what changed in My Project since the mappings
// were made (added, removed, renamed or changed IDs) is shown, never silently dropped. The generated SysML text does
// not read these records: they are the team's mapping decisions, beside the skeleton.
import { useMemo, useState } from 'react'
import { mappingOf } from '../../content/lectures/week08/labBrief'
import { confirmMappingOps, mappingViews, WEEK8_PACKAGES, withdrawMappingOp, type MappingView, type ProjectRef, type Week1Entry } from '../../project/adapters/week8'
import { projectTitle } from '../../project/model/create'
import type { ProjectHandle } from '../../project/store/ProjectProvider'
import { showReadOnly } from '../../project/store/ProjectStore'
import { EditAccess } from '../../project/pages/EditAccess'
import { isEmptyAnswer } from '../emptyAnswer'

export const fmtTime = (iso: string) => {
  const t = Date.parse(iso)
  return Number.isFinite(t) ? new Date(t).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'not recorded'
}
export const storageLabel = (s: ProjectRef['storage']) => (s === 'http' ? 'saved on the course server' : s === 'indexeddb' ? 'saved in this browser' : 'not being saved by this browser')

type ChooserProps = {
  source: 'file' | 'project'
  projectRef: ProjectRef | null
  handle: ProjectHandle | null
  loading: boolean
  /** The Week 1 content of the open project differs from what was read (a mapping write alone does not count). */
  stale: boolean
  onProject: () => void
  onFile: () => void
}

/** The source choice and, for My Project, which project and revision is in use. */
export function SourceChooser({ source, projectRef, handle, loading, stale, onProject, onFile }: ChooserProps) {
  const doc = handle?.doc
  const other = !!(doc && projectRef && doc.project.uid !== projectRef.uid)
  const newer = !!(doc && projectRef && !other && stale)
  return (
    <div className="w8-source-wrap">
      <fieldset className="w8-source" data-testid="w8-source">
        <legend>Where your Week 1 work comes from</legend>
        <label className="w8-check">
          <input type="radio" name="w8-source" checked={source === 'project'} disabled={!doc && source !== 'project'} data-testid="w8-source-project" onChange={onProject} />
          <span>
            <strong>My Project</strong>: your team’s project{doc ? ` “${projectTitle(doc)}”` : ''}. Your Week 1 IDs are read as they are, and the package you confirm for each ID is saved in the project.
          </span>
        </label>
        <label className="w8-check">
          <input type="radio" name="w8-source" checked={source === 'file'} data-testid="w8-source-file" onChange={onFile} />
          <span>
            <strong>A Week 1 model-inputs file</strong> (.json) exported from the Week 1 lab tool.
          </span>
        </label>
        {!doc && (
          <p className="w8-help" data-testid="w8-project-none">
            {loading ? 'Looking for your team’s project…' : 'No team project is open in this browser. Create it in My Project, or sign in to the course server, to read it here; or import a file.'}
          </p>
        )}
      </fieldset>
      {source === 'project' && projectRef && (
        <div className="w8-project" data-testid="w8-project-info">
          <p className="w8-project-line">
            <strong>In use: My Project “{projectRef.title}”</strong>
            {projectRef.team ? `, team ${projectRef.team}` : ''}, revision <span data-testid="w8-project-rev">{projectRef.rev}</span>, {storageLabel(projectRef.storage)}.
          </p>
          <p className="w8-help">
            Read {fmtTime(projectRef.readAt)}; the project was last saved {fmtTime(projectRef.savedAt)}.
          </p>
          {newer && (
            <p className="w8-msg warn" role="status" data-testid="w8-project-changed">
              My Project has changed since you read it (revision {projectRef.rev} → {doc!.rev}). Read it again to use the new version.
            </p>
          )}
          {other && (
            <p className="w8-msg warn" role="status" data-testid="w8-project-other">
              A different project is open in My Project now (“{projectTitle(doc!)}”). Read it to use that one instead.
            </p>
          )}
          <div className="w8-row">
            <button type="button" className="lf-btn small" disabled={!doc} data-testid="w8-project-reread" onClick={onProject}>
              Read My Project again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const STATE_TEXT: Record<MappingView['state'], string> = {
  'not-mapped': '○ Not mapped yet',
  mapped: '✓ Mapped',
  changed: '! Changed since you mapped it: review',
  renamed: '! Renamed since you mapped it: review',
  removed: '✗ Removed from My Project: your mapping is kept',
  withdrawn: '– Mapping withdrawn (kept as a record)',
}

/** The package per Week 1 ID, saved in the project. */
export function IdMappings({ handle }: { handle: ProjectHandle }) {
  const { doc } = handle
  // read-only only once the writer lock is settled (never during the short wait while it is acquired); the reason
  // (another tab, a take-over, a server conflict) comes from the store and is shown by the shared EditAccess banner
  const readOnly = showReadOnly(handle.state)
  const { rows, drift, skipped, partial } = useMemo(() => mappingViews(doc), [doc])
  const [drafts, setDrafts] = useState<Record<string, { pkg: string; reason: string }>>({})
  // an outcome is shown as success only once the store confirms the save (directive §15): until then it is pending
  const [msg, setMsg] = useState<{ kind: 'error'; text: string } | { kind: 'pending'; text: string; at: string } | null>(null)
  const draftOf = (v: MappingView) => {
    const key = v.entry?.uid ?? v.mapping!.artifact
    const rule = v.entry ? mappingOf(v.entry.prefix) : undefined
    return drafts[key] ?? { pkg: v.mapping?.pkg || rule?.pkg || '', reason: v.mapping && v.mapping.rule === 'custom' ? v.mapping.statusReason : '' }
  }
  const setDraft = (uid: string, cur: { pkg: string; reason: string }, patch: Partial<{ pkg: string; reason: string }>) => setDrafts((d) => ({ ...d, [uid]: { ...cur, ...patch } }))
  const problem = (e: Week1Entry, c: { pkg: string; reason: string }): string | null => {
    const rule = mappingOf(e.prefix)
    const r = c.reason.trim()
    if (rule && c.pkg !== rule.pkg && isEmptyAnswer(r)) return `${e.id}: say why ${c.pkg} instead of ${rule.pkg}, the course working mapping (a few words are enough).`
    if (r && isEmptyAnswer(r)) return `${e.id}: “${r}” does not give a reason. Write one, or leave the reason blank to keep the course working mapping.`
    return null
  }
  const store = (items: { entry: Week1Entry; choice: { pkg: string; reason: string } }[], summary: string, done: string) => {
    const bad = items.map((x) => problem(x.entry, x.choice)).find(Boolean)
    if (bad) return setMsg({ kind: 'error', text: bad })
    const at = new Date().toISOString()
    const out = handle.apply((d, stamp) => confirmMappingOps(d, items, stamp), { source: 'editor', summary, noCoalesce: true })
    if (!out.ok) return setMsg({ kind: 'error', text: `Not saved: ${out.error}` })
    setDrafts((d) => {
      const n = { ...d }
      for (const x of items) delete n[x.entry.uid]
      return n
    })
    setMsg({ kind: 'pending', text: done, at })
  }
  const confirm = (v: MappingView) => {
    const e = v.entry!
    const c = draftOf(v)
    store([{ entry: e, choice: c }], `Week 8: ${e.id} mapped to package ${c.pkg}`, `${e.id}: package ${c.pkg} recorded in My Project.`)
  }
  const open = rows.filter((v) => v.entry && v.state === 'not-mapped')
  const confirmAll = () => {
    if (!open.length) return
    store(
      open.map((v) => ({ entry: v.entry!, choice: draftOf(v) })),
      `Week 8: ${open.length} IDs mapped`,
      `${open.length} ID${open.length > 1 ? 's' : ''}: proposed package recorded in My Project.`,
    )
  }
  const withdraw = (v: MappingView) => {
    const m = v.mapping!
    const at = new Date().toISOString()
    const out = handle.apply((_d, stamp) => [withdrawMappingOp(m, `Withdrawn by the team: ${m.source?.id ?? 'the Week 1 item'} was removed from My Project.`, stamp)], { source: 'editor', summary: `Week 8: mapping ${m.id} withdrawn`, noCoalesce: true })
    setMsg(out.ok ? { kind: 'pending', text: `Mapping ${m.id} withdrawn. The record stays in the project, with its ID.`, at } : { kind: 'error', text: `Not saved: ${out.error}` })
  }
  const save = handle.state.save
  const where = handle.state.storage === 'http' ? 'on the course server' : handle.state.storage === 'indexeddb' ? 'in this browser' : ''
  const saveText =
    save.kind === 'error' ? `Not saved: ${save.reason ?? 'the save failed'}` : save.kind === 'conflict' ? 'Not saved: a teammate changed the project at the same time. Open My Project to review.' : save.kind === 'saving' ? 'Saving…' : save.kind === 'pending' ? 'Unsaved changes' : !where ? 'Kept in this tab only (not saved)' : save.kind === 'saved' ? `Saved ${where} at ${fmtTime(save.at ?? '')}` : `Saved ${where}`
  const anyDrift = drift.added.length + drift.removed.length + drift.renamed.length + drift.changed.length > 0
  const mapped = rows.filter((v) => v.state === 'mapped').length
  const liveCount = rows.filter((v) => v.entry).length
  return (
    <>
      <p className="w8-help">
        Each Week 1 ID keeps its ID. The proposed package comes from the course working mapping; choose another one only with a reason. Confirming saves the mapping in My Project with who confirmed it and when, so it survives a reload and your teammates see it. {mapped} of {liveCount} IDs mapped.
      </p>
      <div className="w8-editaccess">
        <EditAccess st={handle.state} store={handle.store} />
      </div>
      {skipped.length > 0 && (
        <p className="w8-msg warn" role="status" data-testid="w8-skipped">
          Some saved mapping records could not be read and are not shown: {skipped.join('; ')}.
        </p>
      )}
      {partial.length > 0 && (
        <p className="w8-msg warn" role="status" data-testid="w8-partial">
          Some saved mapping records could be read only in part; they are shown with what could be read: {partial.join('; ')}. Confirming such an ID again saves a complete record.
        </p>
      )}
      {anyDrift && (
        <section className="w8-drift" aria-labelledby="w8-drift-h" data-testid="w8-drift">
          <h3 id="w8-drift-h">What changed in My Project since you made your mappings</h3>
          <ul>
            {drift.added.length > 0 && (
              <li data-testid="w8-drift-added">
                <strong>Added ({drift.added.length}):</strong> {drift.added.map((e) => e.id).join(', ')}. Not mapped yet.
              </li>
            )}
            {drift.removed.length > 0 && (
              <li data-testid="w8-drift-removed">
                <strong>Removed ({drift.removed.length}):</strong> {drift.removed.map((v) => `${v.mapping!.source?.id ?? '?'} (mapping ${v.mapping!.id} kept)`).join(', ')}.
              </li>
            )}
            {drift.renamed.length > 0 && (
              <li data-testid="w8-drift-renamed">
                <strong>Renamed ({drift.renamed.length}):</strong>{' '}
                {drift.renamed.map((v) => (v.mapping!.source!.id !== v.entry!.id ? `${v.mapping!.source!.id} is now ${v.entry!.id}` : `${v.entry!.id} “${v.mapping!.source!.title}” is now “${v.entry!.title}”`)).join('; ')}.
              </li>
            )}
            {drift.changed.length > 0 && (
              <li data-testid="w8-drift-changed">
                <strong>Changed ({drift.changed.length}):</strong> {drift.changed.map((v) => v.entry!.id).join(', ')}.
              </li>
            )}
          </ul>
          <p className="w8-help">No mapping has been removed. Review each one below: confirm it again, or withdraw it.</p>
        </section>
      )}
      <div className="w8-row">
        <span className={`w8-save ${save.kind === 'error' || save.kind === 'conflict' ? 'err' : ''}`} role="status" data-testid="w8-save" data-kind={save.kind}>
          {saveText}
        </span>
        <button type="button" className="lf-btn small" disabled={readOnly || !open.length} data-testid="w8-confirm-all" onClick={confirmAll}>
          Confirm the proposed package for every unmapped ID ({open.length})
        </button>
      </div>
      {msg && (() => {
        const refused = msg.kind === 'pending' && !!handle.state.refused && handle.state.refused.at >= msg.at
        const failed = msg.kind === 'error' || refused || save.kind === 'error' || save.kind === 'conflict'
        const confirmed = msg.kind === 'pending' && save.kind === 'saved' && (save.at ?? '') >= msg.at
        const state = failed ? 'failed' : confirmed ? 'saved' : !where ? 'unsaved' : 'pending'
        const text =
          msg.kind === 'error' ? msg.text
          : failed ? `${msg.text.replace(/\.$/, '')}: not saved. ${refused ? handle.state.refused!.reason : saveText}`
          : confirmed ? `${msg.text} Saved ${where}.`
          : !where ? `${msg.text} Kept in this tab only (not saved).`
          : `${msg.text} Saving…`
        return (
          <p className={`w8-msg ${state === 'saved' ? 'ok' : state === 'failed' ? 'err' : ''}`} role={state === 'failed' ? 'alert' : 'status'} data-testid="w8-ids-msg" data-state={state}>
            {state === 'saved' ? '✓ ' : state === 'failed' ? '✗ ' : ''}
            {text}
          </p>
        )
      })()}
      <div className="w8-scroll" tabIndex={0} role="region" aria-label="Package per Week 1 ID (scrolls sideways on small screens)">
        <table className="w8-table" data-testid="w8-ids">
          <caption className="sr-only">Package chosen for each Week 1 ID, saved in My Project</caption>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Name</th>
              <th scope="col">Course working mapping</th>
              <th scope="col">Your package</th>
              <th scope="col">Reason (needed only for another package)</th>
              <th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => {
              const e = v.entry
              const m = v.mapping
              const id = e?.id ?? m?.source?.id ?? '?'
              const rule = mappingOf(e?.prefix ?? (id.replace(/-\d+$/, '') || ''))
              const c = draftOf(v)
              return (
                <tr key={e?.uid ?? m!.uid} data-testid={`w8-id-${id}`} data-state={v.state}>
                  <th scope="row" className="w8-mono">
                    {id}
                  </th>
                  <td>{e ? e.title || '(not written yet)' : m?.source?.title || ''}</td>
                  <td>{rule ? `${rule.pkg} · ${rule.construct}` : 'No course rule'}</td>
                  <td>
                    {e ? (
                      <select className="w8-select" aria-label={`Package for ${id}`} value={c.pkg} disabled={readOnly} data-testid={`w8-pkg-${id}`} onChange={(x) => setDraft(e.uid, c, { pkg: x.target.value })}>
                        {WEEK8_PACKAGES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    ) : (
                      m?.pkg || '—'
                    )}
                  </td>
                  <td>{e ? <input className="w8-input" aria-label={`Reason for the package of ${id}`} value={c.reason} disabled={readOnly} data-testid={`w8-reason-${id}`} onChange={(x) => setDraft(e.uid, c, { reason: x.target.value })} /> : m?.statusReason || ''}</td>
                  <td data-testid={`w8-status-${id}`}>
                    {STATE_TEXT[v.state]}
                    {m && v.state !== 'not-mapped' && (
                      <span className="w8-sub">
                        {' '}
                        ({m.id}
                        {m.confirmedBy?.at ? `, ${fmtTime(m.confirmedBy.at)}` : ''}
                        {m.confirmedBy?.by ? ` by ${m.confirmedBy.by}` : ''})
                      </span>
                    )}
                    {v.state === 'renamed' && m?.source && <span className="w8-sub"> Was {m.source.id} “{m.source.title}”.</span>}
                  </td>
                  <td>
                    {e ? (
                      <button type="button" className="lf-btn small" disabled={readOnly} data-testid={`w8-confirm-${id}`} onClick={() => confirm(v)}>
                        {v.state === 'not-mapped' || v.state === 'withdrawn' ? 'Confirm' : v.state === 'mapped' ? 'Save change' : 'Confirm again'}
                      </button>
                    ) : v.state === 'removed' ? (
                      <button type="button" className="lf-btn small" disabled={readOnly} data-testid={`w8-withdraw-${id}`} onClick={() => withdraw(v)}>
                        Withdraw the mapping
                      </button>
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
