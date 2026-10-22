// The Week 1 lab tool's link to My Project: the banner above the Team enterprise view (project mode: linked, save status,
// undo, open My Project; legacy mode: "Not linked to a project" with the create action) and the import dialog that
// replaces the audited silent overwrite of TeamView.importJson (architecture §1.1 finding 3):
//   - project mode: the file goes through the project import pipeline (validation report, plan, explicit choice);
//   - legacy mode: an empty record imports at once (nothing to overwrite); a record with content is replaced only after a
//     confirmation that shows both, and the previous record is kept (Undo / Ctrl+Z restores it).
import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, type ReactNode } from 'react'
import { Link } from '../../lib/router'
import { useProjectState, useProjectStore } from '../store/ProjectProvider'
import { showReadOnly } from '../store/ProjectStore'
import { projectTitle } from '../model/create'
import { EditAccess } from '../pages/EditAccess'
import { ImportFlow } from '../pages/ImportFlow'
import { ProjectBanner, SaveStatus } from '../pages/ui'
import { recordCounts } from './week1'
import type { TeamRecord } from '../../workbench/week1/team'
import '../pages/project.css'

const isTextField = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))

export function TeamProjectBanner({ mode }: { mode: 'project' | 'legacy' }) {
  const st = useProjectState()
  const store = useProjectStore()
  // Ctrl+Z outside a text field undoes the last project change set (the workbench Doc no longer holds the record)
  useEffect(() => {
    if (mode !== 'project' || !store) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === 'z' || e.key === 'Z') && !isTextField(e.target) && !document.querySelector('[role="dialog"][aria-modal="true"]')) {
        e.preventDefault()
        e.stopImmediatePropagation()
        store.undo()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [mode, store])
  if (mode === 'legacy')
    return (
      <div className="pj-scope" data-testid="team-legacy-banner">
        <div className="pj-banner status-info" role="note">
          <span>
            <strong>Not linked to a project.</strong> Create your project to keep this work with the rest of the course: My Project keeps every change, its history and the IDs your later weeks build on.
          </span>
          <span className="pj-banner-act">
            <Link to="/project" className="pj-btn small primary" data-testid="team-create-project">
              Create my project from this record
            </Link>
          </span>
        </div>
      </div>
    )
  const doc = st.doc!
  const last = st.changes[st.changes.length - 1]
  const unadapted = Object.values(doc.artifacts).filter((a) => a.status === 'active' && a.provenance.kind === 'copied-from-practice' && !a.provenance.adapted).map((a) => a.id)
  return (
    <div data-testid="team-project-banner">
      <ProjectBanner
        name={projectTitle(doc)}
        action={
          <>
            <SaveStatus save={st.save} storage={st.storage} />
            {last && (
              <button type="button" className="pj-btn small" onClick={() => store?.undo()} title={`Undo: ${last.summary}`} disabled={st.readOnly} data-testid="team-undo">
                Undo last change
              </button>
            )}
            <Link to="/project" className="pj-btn small primary">
              Open My Project
            </Link>
          </>
        }
      >
        Linked to My Project: every edit here is saved to your project with its history{st.storage === 'memory' ? ' (this browser is not saving: export before you close the tab)' : ''}.
        {unadapted.length > 0 && <> {unadapted.join(', ')} {unadapted.length > 1 ? 'were' : 'was'} copied from the AeroLink practice and {unadapted.length > 1 ? 'do' : 'does'} not count in My Project until adapted.</>}
      </ProjectBanner>
      {(showReadOnly(st) || st.refused) && (
        <div className="pj-scope pj-stack" style={{ marginTop: 8 }}>
          <EditAccess st={st} store={store} />
        </div>
      )}
    </div>
  )
}

export type PendingImport = { file: string; text: string; record?: TeamRecord }

function Frame({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="pj-overlay" />
        <Dialog.Content className="pj-dialog pj-scope" data-testid="team-import-dialog" aria-describedby={undefined}>
          <Dialog.Title asChild>
            <h2>{title}</h2>
          </Dialog.Title>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/** The import dialog of the Week 1 lab tool. */
export function TeamImportDialog({ pending, mode, current, onClose, onLegacyConfirm }: { pending: PendingImport; mode: 'project' | 'legacy'; current: TeamRecord; onClose: (msg?: string) => void; onLegacyConfirm: (r: TeamRecord) => void }) {
  if (mode === 'project')
    return (
      <Frame title={`Import ${pending.file} into your project`} onClose={() => onClose()}>
        <ImportFlow text={pending.text} file={pending.file} onCancel={() => onClose('Not imported: cancelled.')} onDone={(m) => onClose(m)} />
      </Frame>
    )
  const a = recordCounts(current)
  const b = recordCounts(pending.record!)
  return (
    <Frame title="Replace the Team Record in this browser?" onClose={() => onClose('Not imported: cancelled.')}>
      <p className="pj-small">The record in this browser already has content. Importing replaces it with the file’s record. The current record is kept as a backup and Undo (Ctrl+Z) brings it back.</p>
      <table className="pj-table" style={{ maxWidth: 560 }}>
        <thead>
          <tr>
            <th scope="col" />
            <th scope="col">In this browser</th>
            <th scope="col">In {pending.file}</th>
          </tr>
        </thead>
        <tbody>
          <tr><th scope="row">Enterprise</th><td>{current.proposal.name || '—'}</td><td>{pending.record!.proposal.name || '—'}</td></tr>
          <tr><th scope="row">Stakeholders</th><td>{a.stakeholders}</td><td>{b.stakeholders}</td></tr>
          <tr><th scope="row">Needs</th><td>{a.needs}</td><td>{b.needs}</td></tr>
          <tr><th scope="row">External systems</th><td>{a.context}</td><td>{b.context}</td></tr>
        </tbody>
      </table>
      <p className="pj-caption">Better: create your project (My Project), which plans a merge item by item instead of replacing.</p>
      <div className="pj-row" style={{ marginTop: 12 }}>
        <button type="button" className="pj-btn danger" onClick={() => onLegacyConfirm(pending.record!)} data-testid="legacy-replace-confirm">
          Replace the record
        </button>
        <button type="button" className="pj-btn" onClick={() => onClose('Not imported: cancelled.')}>
          Cancel
        </button>
      </div>
    </Frame>
  )
}
