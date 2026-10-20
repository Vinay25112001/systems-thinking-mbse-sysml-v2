// The create screen (roadmap §2.2), shown when no project exists in this browser: team label, the editor's initials
// (self-declared, 2–4 letters; faculty decision F7: initials only), an optional working name; create empty, create from
// the Week 1 Team Record found in this browser (counts shown first), or import a project or Week 1 file.
import { FolderPlus, Upload } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { ownerProblem } from '../../components/ProvenanceOwnerFields'
import { navigate } from '../../lib/router'
import { findLegacyTeamRecord } from '../adapters/legacy'
import { fromTeamRecord, recordCounts } from '../adapters/week1'
import { useProjectState, useProjectStore } from '../store/ProjectProvider'
import { analyzeImport, type Analysis } from '../transfer/importProject'
import { ProjectBanner } from './ui'

export function CreateProject() {
  const store = useProjectStore()
  const st = useProjectState()
  const uid = useId()
  const legacy = useMemo(() => findLegacyTeamRecord(), [])
  const [team, setTeam] = useState(legacy?.record.team ?? '')
  const [initials, setInitials] = useState(st.editor)
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<Extract<Analysis, { ok: true }> | null>(null)
  const initialsProblem = initials.trim() ? ownerProblem(initials) : null
  const ready = !!store && !initialsProblem && !busy
  const counts = legacy ? recordCounts(legacy.record) : null

  const createEmpty = async () => {
    if (!store) return
    setBusy(true)
    await store.create({ teamLabel: team, initials, enterpriseName: name })
    navigate('/project')
  }
  const createFromRecord = async () => {
    if (!store || !legacy) return
    setBusy(true)
    await store.setEditor(initials)
    const { doc } = fromTeamRecord(legacy.record, { teamLabel: team || legacy.record.team, initials, provenance: { kind: 'imported', from: { format: 'week1-team-record (this browser)', version: 'stored' }, at: new Date().toISOString() } })
    await store.create({ doc })
    navigate('/project')
  }
  const importFile = async (file?: File) => {
    if (!store || !file) return
    setBusy(true)
    const a = await analyzeImport(await file.text(), file.name)
    if (!a.ok) {
      setMsg(`Not imported: ${a.error}`)
      setBusy(false)
      return
    }
    setPending(a)
    setBusy(false)
  }
  const confirmImport = async () => {
    if (!store || !pending) return
    setBusy(true)
    await store.setEditor(initials)
    const a = pending
    const doc = a.kind === 'week1' && team.trim() ? { ...a.incoming, team: { ...a.incoming.team, label: a.incoming.team.label || team } } : a.incoming
    await store.create({ doc, changes: a.changes })
    setMsg('')
    navigate('/project')
  }

  return (
    <div className="pj-stack" data-testid="project-create" style={{ maxWidth: 860 }}>
      <div>
        <p className="pj-caption" style={{ margin: 0 }}>My Project</p>
        <h1 className="pj-h1">Start your team’s project</h1>
        <p className="pj-lede">My Project holds your team’s own enterprise from Week 1 to Week 14: the stakeholders, needs and everything after them, with stable IDs, history and the Week 8 transformation into a model. It starts empty: nothing from the AeroLink example is in it.</p>
      </div>
      <ProjectBanner name="">Your project is saved in this browser only. Export it after every working session; the export is the copy you keep and submit.</ProjectBanner>
      <section className="pj-card" aria-labelledby={`${uid}-h`}>
        <h2 id={`${uid}-h`} className="pj-h2">About your team</h2>
        <div className="pj-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <label className="pj-field" htmlFor={`${uid}-team`}>
            <span>Team label</span>
            <input id={`${uid}-team`} className="pj-input" value={team} placeholder="Team 07" onChange={(e) => setTeam(e.target.value)} data-testid="create-team" />
            <small>As used in your file names.</small>
          </label>
          <label className="pj-field" htmlFor={`${uid}-ini`}>
            <span>Your initials</span>
            <input id={`${uid}-ini`} className="pj-input" value={initials} maxLength={4} onChange={(e) => setInitials(e.target.value)} aria-invalid={!!initialsProblem} aria-describedby={`${uid}-ini-h`} data-testid="create-initials" />
            <small id={`${uid}-ini-h`}>{initialsProblem ?? '2–4 letters. Recorded with each change as “self-declared”; not a login. No full names are stored.'}</small>
          </label>
          <label className="pj-field" htmlFor={`${uid}-name`}>
            <span>Enterprise working name (optional)</span>
            <input id={`${uid}-name`} className="pj-input" value={name} onChange={(e) => setName(e.target.value)} data-testid="create-name" />
            <small>You can change it in the Week 1 lab tool, Part 2.</small>
          </label>
        </div>
        <div className="pj-row" style={{ marginTop: 16 }}>
          <button type="button" className="pj-btn primary" disabled={!ready} onClick={() => void createEmpty()} data-testid="create-empty">
            <FolderPlus size={16} aria-hidden /> Create an empty project
          </button>
          <label className="pj-btn" htmlFor={`${uid}-file`} aria-disabled={!ready}>
            <Upload size={16} aria-hidden /> Import a project or Week 1 file
            <input id={`${uid}-file`} type="file" accept=".json,application/json" className="sr-only" disabled={!ready} onChange={(e) => void importFile(e.target.files?.[0])} data-testid="create-import" />
          </label>
        </div>
        {pending && (
          <div className="pj-card flat" style={{ marginTop: 12 }} data-testid="create-import-report">
            <h3 className="pj-h3">Check before creating: {pending.file}</h3>
            <p className="pj-small">
              {pending.kind === 'week1' ? `Week 1 model inputs, version ${pending.version}` : `Project file, schema version ${pending.version}`}: {Object.values(pending.incoming.artifacts).length} artifacts, {Object.values(pending.incoming.relationships).length} relationships. {pending.checksum === 'ok' ? 'Checksum verified.' : pending.checksum === 'mismatch' ? 'The checksum does NOT match: the file changed after export.' : ''}
            </p>
            {pending.issues.length > 0 && (
              <ul className="pj-small">
                {pending.issues.slice(0, 8).map((i, k) => (
                  <li key={k}>
                    <strong>{i.severity === 'error' ? 'Left out' : 'Note'}:</strong> {i.message}
                  </li>
                ))}
              </ul>
            )}
            <div className="pj-row">
              <button type="button" className="pj-btn primary" disabled={busy} onClick={() => void confirmImport()} data-testid="create-import-confirm">
                Create the project from this file
              </button>
              <button type="button" className="pj-btn" onClick={() => setPending(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
        {msg && (
          <p className="pj-small" role="alert" style={{ color: 'var(--pj-bad)' }}>
            {msg}
          </p>
        )}
      </section>
      {legacy && counts && (
        <section className="pj-card" aria-labelledby={`${uid}-lh`} data-testid="create-from-record">
          <h2 id={`${uid}-lh`} className="pj-h2">We found your Week 1 Team Record in this browser</h2>
          <p className="pj-small">
            {legacy.record.proposal.name ? <strong>{legacy.record.proposal.name}</strong> : 'An unnamed enterprise'}: {counts.stakeholders} stakeholders, {counts.concerns} concerns, {counts.needs} needs, {counts.context} external systems, {counts.relationships} relationships, {counts.goals} goals, {counts.inside} elements inside the boundary.
          </p>
          <p className="pj-small pj-muted">Create your project from it? The record stays where it is; the project gets a copy with the same IDs.</p>
          <button type="button" className="pj-btn primary" disabled={!ready} onClick={() => void createFromRecord()} data-testid="create-from-record-btn">
            Create from the Week 1 Team Record
          </button>
        </section>
      )}
    </div>
  )
}
