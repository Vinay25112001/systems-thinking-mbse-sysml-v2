// Export and import (roadmap §2.2): the whole project (sysml-studio-project v1, documented in
// CANONICAL_ENGINEERING_DATA_MODEL.md §10.1 at the repository root), the readable report, the Week 1 files in their unchanged formats; import with the
// validation report and plan; and the project switcher (several projects can live in one browser).
import { Download, FileText, Upload } from 'lucide-react'
import { useId, useState } from 'react'
import { findLegacyTeamRecord } from '../adapters/legacy'
import { MODEL_INPUTS_VERSION, teamModelInputs } from '../../workbench/week1/team'
import { projectTitle } from '../model/create'
import { useProjectState, useProjectStore } from '../store/ProjectProvider'
import { exportProject, exportReport, exportWeek1Files } from './actions'
import { ImportFlow } from './ImportFlow'
import { Chip, fmtDate } from './ui'

export function Transfer() {
  const st = useProjectState()
  const store = useProjectStore()!
  const uid = useId()
  const [msg, setMsg] = useState('')
  const [incoming, setIncoming] = useState<{ text: string; file: string } | null>(null)
  const legacy = findLegacyTeamRecord({ preferBackup: true })
  const onFile = async (f?: File) => {
    if (!f) return
    setIncoming({ text: await f.text(), file: f.name })
    setMsg('')
  }
  return (
    <div className="pj-stack" data-testid="project-transfer">
      <div>
        <h1 className="pj-h1">Export and import</h1>
        <p className="pj-lede">The export is the copy of your project you keep, hand in and move between computers: this browser is only the working copy. Imports are always checked and planned first; nothing is overwritten or deleted without your choice.</p>
      </div>
      {msg && (
        <p className="pj-small" role="status" data-testid="transfer-msg">
          {msg}
        </p>
      )}
      <div className="pj-grid two">
        <section className="pj-card" aria-labelledby={`${uid}-e`}>
          <h2 id={`${uid}-e`} className="pj-h2">Export</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} className="pj-stack">
            <li>
              <button type="button" className="pj-btn primary" onClick={() => void exportProject(store).then(setMsg)} data-testid="export-project">
                <Download size={14} aria-hidden /> Export project (.json)
              </button>
              <p className="pj-caption" style={{ margin: '4px 0 0' }}>Everything: artifacts with IDs and uids, relationships, milestones, history, with a checksum. Format “sysml-studio-project”, version 1.</p>
            </li>
            <li>
              <button type="button" className="pj-btn" onClick={() => void exportReport(store).then(setMsg)} data-testid="export-report">
                <FileText size={14} aria-hidden /> Export readable report (.md)
              </button>
              <p className="pj-caption" style={{ margin: '4px 0 0' }}>Overview, milestones, artifacts with their relationships, review flags, Week 8 preview, recent changes.</p>
            </li>
            <li>
              <button type="button" className="pj-btn" onClick={() => void exportWeek1Files(store).then(setMsg)} data-testid="export-week1">
                <Download size={14} aria-hidden /> Export the Week 1 files (.md and model inputs .json, version {MODEL_INPUTS_VERSION})
              </button>
              <p className="pj-caption" style={{ margin: '4px 0 0' }}>The files the LMS assignment and the Week 8 lab tool expect, unchanged formats.</p>
            </li>
          </ul>
        </section>
        <section className="pj-card" aria-labelledby={`${uid}-i`}>
          <h2 id={`${uid}-i`} className="pj-h2">Import</h2>
          <p className="pj-small" style={{ marginTop: 0 }}>A project export (yours or a teammate’s) or a Week 1 model-inputs file (versions 1–3).</p>
          <label className="pj-btn" htmlFor={`${uid}-f`}>
            <Upload size={14} aria-hidden /> Choose a file…
            <input id={`${uid}-f`} type="file" accept=".json,application/json" className="sr-only" onChange={(e) => void onFile(e.target.files?.[0])} data-testid="import-file" />
          </label>
          {legacy && (
            <div style={{ marginTop: 12 }}>
              <p className="pj-small" style={{ margin: '0 0 6px' }}>
                {legacy.from === 'backup' ? 'The Week 1 record this browser held before your project existed' : 'A Week 1 record is stored in this browser'}: {legacy.record.proposal.name || 'unnamed'}, {legacy.record.stakeholders.length} stakeholders, {legacy.record.needs.length} needs.
              </p>
              <button type="button" className="pj-btn small" onClick={() => setIncoming({ text: JSON.stringify(teamModelInputs(legacy.record)), file: 'Week 1 record stored in this browser' })} data-testid="import-legacy">
                Plan an import of it
              </button>
            </div>
          )}
        </section>
      </div>
      {incoming && (
        <section className="pj-card" aria-label="Import plan">
          <ImportFlow text={incoming.text} file={incoming.file} onCancel={() => setIncoming(null)} onDone={(m) => (setIncoming(null), setMsg(m))} />
        </section>
      )}
      <section className="pj-card" aria-labelledby={`${uid}-s`}>
        <h2 id={`${uid}-s`} className="pj-h2">Projects in this browser ({st.projects.length})</h2>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {[...st.projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((p) => {
            const active = p.uid === st.doc?.project.uid
            return (
              <li key={p.uid} className="pj-row" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--pj-line)' }} data-testid="project-row">
                <span>
                  <strong>{active && st.doc ? projectTitle(st.doc) : p.title || (p.teamLabel ? `Team ${p.teamLabel} project` : 'Untitled project')}</strong> <span className="pj-caption">· Team {p.teamLabel || '—'} · rev {p.rev} · {fmtDate(p.updatedAt)}</span>
                </span>
                {active ? (
                  <Chip tone="project">Open now</Chip>
                ) : (
                  <button type="button" className="pj-btn small" onClick={() => void store.switchProject(p.uid).then(() => setMsg('Switched project.'))}>
                    Open this project
                  </button>
                )}
              </li>
            )
          })}
        </ul>
        <p className="pj-caption">No sharing or syncing happens between browsers: teammates exchange exports and merge them here (faculty decision F10: local storage only this term).</p>
      </section>
    </div>
  )
}
