// Edit access, shown wherever the project can be edited (the My Project shell and the Week 1 lab tool): the read-only
// banner with "Take over editing", and the notice for an edit this tab refused. P0 save defect: an edit is never dropped
// silently, and a tab that is read-only always offers the way out.
import { useState } from 'react'
import { showReadOnly, type ProjectStore, type StoreState } from '../store/ProjectStore'

export function EditAccess({ st, store }: { st: StoreState; store: ProjectStore | null }) {
  const [busy, setBusy] = useState(false)
  if (!st.doc) return null
  const conflict = st.save.kind === 'conflict'
  const take = () => {
    if (!store) return
    setBusy(true)
    void store.takeOver().finally(() => setBusy(false))
  }
  return (
    <>
      {showReadOnly(st) && (
        <div className="pj-banner status-info" role="alert" data-testid="readonly-banner">
          <span>
            <strong>{conflict ? 'Conflict requires review.' : 'Read-only in this tab.'}</strong> {st.readOnlyReason}
            {conflict && st.storage === 'http' ? ' Nothing was overwritten. Your edits that were not saved are kept as a version in History (copy from it what you need); then the team’s latest saved project is shown.' : conflict ? ' Taking over keeps the edits this tab could not save as a version in History, then shows the saved project.' : ' Edits here are not saved until you take over editing.'}
          </span>
          <span className="pj-banner-act">
            <button type="button" className="pj-btn small" disabled={busy || !store} onClick={take} data-testid="take-over">
              {conflict && st.storage === 'http' ? 'Keep my edits as a version and load the latest' : 'Take over editing'}
            </button>
          </span>
        </div>
      )}
      {/* m6 (confirmation N-2): a save the course server keeps refusing never blocks the tab until a reload: the edits
          it could not save are kept as a version in History and the saved project is loaded */}
      {st.save.kind === 'error' && !st.save.signin && st.storage === 'http' && (
        <div className="pj-banner status-bad" role="alert" data-testid="save-failed-recover">
          <span>
            <strong>Your latest changes could not be saved on the course server.</strong> {st.save.reason} You can keep them as a version in History and continue with the saved project.
          </span>
          <span className="pj-banner-act">
            <button type="button" className="pj-btn small" disabled={busy || !store} onClick={take} data-testid="save-failed-keep">
              Keep my edits as a version and load the saved project
            </button>
          </span>
        </div>
      )}
      {st.refused && (
        <div className="pj-banner status-bad" role="alert" data-testid="edit-refused">
          <span>
            <strong>Your last edit was not saved.</strong> {st.refused.reason}
          </span>
          <span className="pj-banner-act">
            <button type="button" className="pj-btn small" onClick={() => store?.dismissRefused()}>
              Dismiss
            </button>
          </span>
        </div>
      )}
    </>
  )
}
