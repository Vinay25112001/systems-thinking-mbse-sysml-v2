// Excel stakeholder import (directive §13, all fifteen steps; spec §j.1 screens X1–X6). The file is read in this browser
// (a Web Worker), never uploaded; only the records the student approves become one `import` change set, after a
// restore point. Nothing is imported silently, nothing is overwritten silently, missing data is flagged, never invented.
import * as Dialog from '@radix-ui/react-dialog'
import { useMemo, useState } from 'react'
import { useProjectState, useProjectStore } from '../store/ProjectProvider'
import { CONFIDENCE_LABEL, correctMapping, FIELD_LABEL, IMPORT_FIELDS, mappingSummary, proposeMapping, suggestSheet, type ColumnMapping, type ImportField } from '../xlsx/mapping'
import { buildPreview, importOps, ROW_STATUS_LABEL, rowStatus, summarize, type PreviewRow } from '../xlsx/importPlan'
import { fileSha256, parseWorkbookFile } from '../xlsx/parseInWorker'
import { XLSX_LIMITS, type SheetData } from '../xlsx/reader'
import { activeProvider } from '../xlsx/ai'
import { api, ApiFailure } from '../../services/backend'
import { newUid } from '../model/ids'
import { StateChip, useCanvas } from './ctx'

type Step = 'file' | 'sheet' | 'map' | 'preview' | 'confirm' | 'result'
const STEPS: { id: Step; label: string }[] = [
  { id: 'file', label: 'Choose file' },
  { id: 'sheet', label: 'Choose sheet' },
  { id: 'map', label: 'Map columns' },
  { id: 'preview', label: 'Preview and check' },
  { id: 'confirm', label: 'Confirm' },
  { id: 'result', label: 'Result' },
]
const CONF_TONE: Record<string, string> = { high: 'meets', medium: 'draft', low: 'template', none: 'not-started' }
const STATUS_TONE: Record<string, string> = { ready: 'meets', incomplete: 'draft', formula: 'draft', 'not-recognised': 'draft', duplicate: 'template', 'missing-required': 'missing' }

export function ExcelImport({ onClose }: { onClose: () => void }) {
  const c = useCanvas()
  const st = useProjectState()
  const store = useProjectStore()
  const [step, setStep] = useState<Step>('file')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [file, setFile] = useState<{ name: string; size: number; sha: string | null } | null>(null)
  const [sheets, setSheets] = useState<SheetData[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [sheetIx, setSheetIx] = useState(0)
  const [cols, setCols] = useState<ColumnMapping[]>([])
  const [split, setSplit] = useState(true)
  const [rows, setRows] = useState<PreviewRow[]>([])
  const [ack, setAck] = useState(false)
  const [result, setResult] = useState<{ created: string[]; merged: string[]; importId: string; preImport: string | null; rev: number; msg: string } | null>(null)
  const sheet = sheets[sheetIx]
  const summary = useMemo(() => mappingSummary(cols), [cols])
  const existing = useMemo(() => c.rec.stakeholders.map((s) => ({ id: s.id, name: s.name })), [c.rec])

  const choose = async (f: File | undefined) => {
    setError('')
    if (!f) return
    const lower = f.name.toLowerCase()
    if (lower.endsWith('.xlsm')) return setError('Macro-enabled workbooks (.xlsm) are not accepted. Save a copy as an Excel workbook (.xlsx) without macros.')
    if (lower.endsWith('.xls')) return setError('This is the old Excel format (.xls). Open it in Excel or LibreOffice and save it as an Excel workbook (.xlsx).')
    if (lower.endsWith('.csv')) return setError('This is a CSV file. Open it in a spreadsheet application and save it as an Excel workbook (.xlsx).')
    if (!lower.endsWith('.xlsx')) return setError('Choose an Excel workbook (.xlsx).')
    if (f.size > XLSX_LIMITS.maxFileBytes) return setError(`The file is ${(f.size / 1048576).toFixed(1)} MB; at most ${XLSX_LIMITS.maxFileBytes / 1048576} MB is accepted.`)
    setBusy(true)
    try {
      const [res, sha] = await Promise.all([parseWorkbookFile(f), fileSha256(f)])
      if (!res.ok) return setError(`${res.error} Nothing was imported.`)
      setFile({ name: f.name, size: f.size, sha })
      setSheets(res.sheets)
      setWarnings(res.warnings)
      setSheetIx(suggestSheet(res.sheets))
      setStep('sheet')
    } finally {
      setBusy(false)
    }
  }
  const toMapping = () => {
    if (!sheet || sheet.rows.length < 2) return setError('That sheet has no data rows under a header row.')
    setError('')
    setCols(proposeMapping(sheet.rows[0], sheet.rows.slice(1)))
    setStep('map')
  }
  const toPreview = () => {
    setRows(buildPreview(sheet, cols, existing, { splitConcerns: split }))
    setStep('preview')
  }
  const setRow = (i: number, p: Partial<PreviewRow>) => setRows((rs) => rs.map((r, k) => (k === i ? { ...r, ...p } : r)))
  const commit = async () => {
    if (!store || !file || !sheet) return
    setBusy(true)
    setError('')
    let created: string[] = []
    let merged: string[] = []
    const at = new Date().toISOString()
    const sum = summarize(rows)
    const importId = globalThis.crypto?.randomUUID?.() ?? newUid()
    const src = { file: file.name, sha256: file.sha, size: file.size, sheet: sheet.name, at, mapping: cols, importId }
    const mappingText = cols.filter((x) => x.selected).map((x) => `${FIELD_LABEL[x.selected!]} ← “${x.header}”${x.correctedByStudent ? ' (chosen by the student)' : ''}`).join('; ')
    const r = await store.importMerge(
      (doc, stamp) => {
        const out = importOps(doc, rows, src, stamp)
        created = out.createdIds
        merged = out.mergedIds
        return out.ops
      },
      `Imported ${sum.created} stakeholder${sum.created === 1 ? '' : 's'} from ${file.name} (${sheet.name})`,
      `Excel import approved by the team member. File ${file.name}${file.sha ? ` (SHA-256 ${file.sha.slice(0, 12)}…)` : ''}, sheet “${sheet.name}”. Mapping: ${mappingText}. ${sum.created} new, ${sum.merged} merged, ${sum.skipped} skipped, ${sum.warnings} warnings.`,
    )
    setBusy(false)
    if (!r.ok) return setError(`Nothing was imported: ${r.error}`)
    // the restore point is the one THIS import wrote: in this browser the store returns its id; on the course server
    // the server wrote it and binds it to the import's id (never "the newest pre-import version": M6 review H-1)
    if (st.storage === 'http') await store.flush()
    setResult({ created, merged, importId, preImport: r.preImport ?? null, rev: store.getState().doc?.rev ?? 0, msg: '' })
    setStep('result')
  }
  /** The id of the version saved just before this import, or the reason it cannot be found (nothing is restored). */
  const restorePoint = async (): Promise<{ id: string } | { why: string }> => {
    if (!result) return { why: 'No import to undo.' }
    const gone = 'The version saved before this import is no longer stored, so nothing was restored. Open History to choose a version yourself.'
    if (st.storage !== 'http') {
      // the version this import wrote, verified by kind before restoring (confirmation N-1)
      const s = (store?.getState().snapshots ?? []).find((x) => x.id === result.preImport)
      return result.preImport && s?.kind === 'pre-import' ? { id: result.preImport } : { why: gone }
    }
    const uid = st.doc!.project.uid
    try {
      const rec = await api<{ import: { preImportSnapshot: string; chgId: string } }>('GET', `/projects/${encodeURIComponent(uid)}/imports/${encodeURIComponent(result.importId)}`)
      // the binding is checked here too: the version must still be the server's own "Before import CHG-…" version
      const list = await api<{ snapshots: { id: string; kind: string; label: string }[] }>('GET', `/projects/${encodeURIComponent(uid)}/snapshots`)
      const s = list.data.snapshots.find((x) => x.id === rec.data.import.preImportSnapshot)
      if (!s || s.kind !== 'pre-import' || s.label !== `Before import ${rec.data.import.chgId}`) return { why: gone }
      return { id: s.id }
    } catch (e) {
      if (e instanceof ApiFailure && e.error.status === 410) return { why: gone }
      return { why: e instanceof ApiFailure && e.error.status === 404 ? 'The course server has no restore point for this import (the import may not be saved yet), so nothing was restored. Open History to choose a version yourself.' : 'The restore point could not be looked up on the course server; nothing was restored. Try again.' }
    }
  }
  const undo = async () => {
    if (!store || !result) return
    setBusy(true)
    const p = await restorePoint()
    if ('why' in p) {
      setBusy(false)
      return setResult({ ...result, msg: p.why })
    }
    // a whole-content restore also removes later edits (a teammate's too): say so first (M6 review L-7)
    const moved = (store.getState().doc?.rev ?? 0) - result.rev
    if (moved > 0 && typeof window !== 'undefined' && !window.confirm(`The project changed ${moved} time${moved > 1 ? 's' : ''} since this import (perhaps by a teammate). Undoing the import also removes those later changes; they stay in History. Undo anyway?`)) {
      setBusy(false)
      return
    }
    const r = await store.restore(p.id, `Undo the Excel import of ${file?.name ?? 'a workbook'}`)
    setBusy(false)
    setResult({ ...result, msg: r.ok ? `The import was undone: the project is back to the version saved just before it (${p.id}), as a new revision (the history keeps both).` : `Not undone: ${r.error}` })
  }
  const live = rows.filter((r) => r.choice !== 'skip' && (r.values.name ?? '').trim())
  const counts = summarize(rows)

  return (
    <Dialog.Root open onOpenChange={(o) => !o && !busy && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="pj-overlay" />
        <Dialog.Content className="pj-dialog pj-scope cv-root" style={{ maxWidth: 1100, width: 'calc(100vw - 32px)', maxHeight: 'calc(100vh - 32px)', overflow: 'auto' }} data-testid="excel-import" aria-describedby="cv-xl-desc">
          <Dialog.Title asChild>
            <h2 style={{ marginTop: 0 }}>Import stakeholders from Excel</h2>
          </Dialog.Title>
          <p id="cv-xl-desc" className="pj-small pj-muted" style={{ marginTop: 0 }}>
            The workbook is read in this browser only. You review the mapping and every record before anything is added; one restore point is made first.
          </p>
          <ol className="cv-toolbar" style={{ listStyle: 'none', padding: 0 }} aria-label="Import steps">
            {STEPS.map((s, i) => (
              <li key={s.id} aria-current={step === s.id ? 'step' : undefined} className="pj-small" style={{ fontWeight: step === s.id ? 700 : 400, color: step === s.id ? 'var(--pj-project-strong)' : 'var(--pj-muted)' }}>
                {i + 1}. {s.label}
              </li>
            ))}
          </ol>
          {error && (
            <p className="cv-warnbox" role="alert" data-testid="import-error">
              {error}
            </p>
          )}

          {step === 'file' && (
            <div data-testid="xl-step-file">
              <div className="cv-infobox">
                <strong>Preparing your spreadsheet.</strong> One row per stakeholder, the headers in the first row, one column per field (for example Stakeholder, Role group, Life-cycle stage, Internal/External, Approving authority, Concerns, Interest, Reason for interest, Influence, Support). AI-assisted research is allowed; you remain responsible for every value. Accepted: .xlsx up to 5 MB.
              </div>
              <label className="pj-btn primary" htmlFor="cv-xl-file" style={{ display: 'inline-flex' }}>
                {busy ? 'Reading…' : 'Choose file'}
              </label>
              <input id="cv-xl-file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="cv-sr" onChange={(e) => {
                  const f = e.target.files?.[0]
                  e.target.value = ''
                  void choose(f)
                }} data-testid="xl-file" disabled={busy} />
              <p className="pj-small pj-muted">{activeProvider().label}. No AI service is used; the workbook is read in this browser, and only the records you approve are saved to your project.</p>
            </div>
          )}

          {step === 'sheet' && (
            <fieldset data-testid="xl-step-sheet" style={{ border: 0, padding: 0 }}>
              <legend className="pj-small" style={{ fontWeight: 600 }}>
                {file?.name}: choose the sheet that holds the stakeholders
              </legend>
              {warnings.map((w) => (
                <p key={w} className="cv-note">
                  {w}
                </p>
              ))}
              {sheets.map((s, i) => (
                <label key={s.name} className="cv-infobox" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="radio" name="cv-xl-sheet" checked={sheetIx === i} onChange={() => setSheetIx(i)} data-testid={`xl-sheet-${i}`} />
                  <span>
                    <strong>{s.name}</strong>
                    {i === suggestSheet(sheets) && <StateChip state="meets">Suggested</StateChip>}
                    {s.hidden && <span className="pj-muted"> (hidden sheet)</span>}
                    <span className="pj-small" style={{ display: 'block' }}>
                      {Math.max(0, s.rows.length - 1)} data rows, {s.rows[0]?.length ?? 0} columns{s.rowsNotRead ? `, ${s.rowsNotRead} rows beyond the ${XLSX_LIMITS.maxRows}-row limit not read` : ''}{s.colsNotRead ? `, ${s.colsNotRead} columns beyond the limit not read` : ''}. Headers: {(s.rows[0] ?? []).slice(0, 3).map((h) => `“${h}”`).join(', ') || '(none)'}
                    </span>
                  </span>
                </label>
              ))}
              <div className="cv-toolbar">
                <button type="button" className="pj-btn" onClick={() => setStep('file')}>
                  Back
                </button>
                <button type="button" className="pj-btn primary" onClick={toMapping} data-testid="xl-to-map">
                  Next: map the columns
                </button>
              </div>
            </fieldset>
          )}

          {step === 'map' && sheet && (
            <div data-testid="xl-step-map">
              {summary.missingRequired.length > 0 && <p className="cv-warnbox" data-testid="xl-missing-required">Required and not mapped: {summary.missingRequired.map((f) => FIELD_LABEL[f]).join(', ')}. Map a column to it to continue.</p>}
              {summary.missingCourse.length > 0 && <p className="cv-warnbox" data-testid="xl-missing-course">Required by the course and not mapped: {summary.missingCourse.map((f) => FIELD_LABEL[f]).join(', ')}. You can import without it; every row is then flagged in the register until you add it.</p>}
              {summary.ambiguous.length > 0 && <p className="cv-warnbox" data-testid="xl-ambiguous">{summary.ambiguous.length} column{summary.ambiguous.length > 1 ? 's are' : ' is'} ambiguous: choose the field for each.</p>}
              {summary.missingRecommended.length > 0 && <p className="cv-note">Recommended and not mapped: {summary.missingRecommended.map((f) => FIELD_LABEL[f]).join(', ')}.</p>}
              <div className="cv-tablewrap">
                <table className="cv-table cv-cards" data-testid="xl-mapping">
                  <thead>
                    <tr>
                      <th scope="col">Spreadsheet column</th>
                      <th scope="col">Sample values</th>
                      <th scope="col">Field</th>
                      <th scope="col">Confidence</th>
                      <th scope="col">Why</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cols.map((col) => (
                      <tr key={col.index} data-testid={`xl-col-${col.index}`}>
                        <th scope="row">{col.header || <span className="pj-muted">(no header)</span>}</th>
                        <td data-label="Samples" className="pj-small">{col.samples.join(' · ') || '—'}</td>
                        <td data-label="Field">
                          <label className="cv-sr" htmlFor={`cv-xl-f-${col.index}`}>Field for column {col.header}</label>
                          <select id={`cv-xl-f-${col.index}`} className="cv-select" value={col.selected ?? ''} onChange={(e) => setCols(correctMapping(cols, col.index, (e.target.value || null) as ImportField | null))} data-testid={`xl-field-${col.index}`}>
                            <option value="">Do not import</option>
                            {IMPORT_FIELDS.map((f) => (
                              <option key={f} value={f}>
                                {FIELD_LABEL[f]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td data-label="Confidence">
                          {col.ambiguous.length ? <StateChip state="missing">Ambiguous</StateChip> : <StateChip state={CONF_TONE[col.confidence]}>{col.correctedByStudent ? 'Your choice' : CONFIDENCE_LABEL[col.confidence]}</StateChip>}
                        </td>
                        <td data-label="Why" className="pj-small">{col.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {summary.unmapped.length > 0 && <p className="cv-note">Will not be imported: {summary.unmapped.map((x) => `“${x.header || '(no header)'}”`).join(', ')}.</p>}
              <label className="pj-small" style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
                <input type="checkbox" checked={split} onChange={(e) => setSplit(e.target.checked)} /> Split a concern cell into separate concerns at line breaks and semicolons
              </label>
              <div className="cv-toolbar">
                <button type="button" className="pj-btn" onClick={() => setStep('sheet')}>
                  Back
                </button>
                <button type="button" className="pj-btn primary" disabled={summary.missingRequired.length > 0 || summary.ambiguous.length > 0} onClick={toPreview} data-testid="xl-to-preview">
                  Next: preview the records
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div data-testid="xl-step-preview">
              <p className="pj-small">New IDs are not issued yet (“New 1…{counts.created}”); they are issued from your project’s counters when you confirm.</p>
              <div className="cv-tablewrap">
                <table className="cv-table cv-cards" data-testid="xl-preview">
                  <thead>
                    <tr>
                      <th scope="col">Row</th>
                      <th scope="col">Status</th>
                      <th scope="col">Stakeholder</th>
                      <th scope="col">Values</th>
                      <th scope="col">Concerns</th>
                      <th scope="col">Checks</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => {
                      const s = rowStatus(r)
                      const canImport = !!(r.values.name ?? '').trim()
                      return (
                        <tr key={r.rowNumber} data-testid={`xl-row-${r.rowNumber}`} data-status={s}>
                          <td className="cv-id" data-label="Row">{r.rowNumber}</td>
                          <td data-label="Status"><StateChip state={STATUS_TONE[s]}>{ROW_STATUS_LABEL[s]}</StateChip></td>
                          <td data-label="Stakeholder">{r.values.name || <span className="pj-muted">(no name)</span>}</td>
                          <td data-label="Values" className="pj-small">
                            {(['role', 'stage', 'side', 'approving', 'interest', 'interestReason', 'influence', 'influenceReason', 'support'] as ImportField[]).filter((f) => r.values[f]).map((f) => `${FIELD_LABEL[f]}: ${r.values[f]}`).join(' · ') || '—'}
                          </td>
                          <td data-label="Concerns" className="pj-small">{r.concerns.length ? r.concerns.map((x, k) => <span key={k} style={{ display: 'block' }}>• {x}</span>) : '—'}</td>
                          <td data-label="Checks" className="pj-small">
                            {r.duplicate && <span style={{ display: 'block' }} data-testid={`xl-dup-${r.rowNumber}`}>{r.duplicate.exact ? 'Duplicate' : 'Possible duplicate'} of {r.duplicate.kind === 'existing' ? `${r.duplicate.id} “${r.duplicate.name}”` : `row ${r.duplicate.row} “${r.duplicate.name}”`}</span>}
                            {r.issues.map((x, k) => <span key={k} style={{ display: 'block' }}>{x.message}</span>)}
                          </td>
                          <td data-label="Action">
                            <label className="cv-sr" htmlFor={`cv-xl-c-${i}`}>Action for row {r.rowNumber}</label>
                            <select id={`cv-xl-c-${i}`} className="cv-select" value={r.choice === 'merge' ? `merge:${r.mergeInto}` : r.choice} disabled={!canImport} onChange={(e) => {
                                const v = e.target.value
                                if (v.startsWith('merge:')) setRow(i, { choice: 'merge', mergeInto: v.slice(6) })
                                else setRow(i, { choice: v as PreviewRow['choice'], mergeInto: undefined })
                              }} data-testid={`xl-choice-${r.rowNumber}`}>
                              <option value="new">Import as new</option>
                              <option value="skip">Skip</option>
                              {r.duplicate?.kind === 'existing' && <option value={`merge:${r.duplicate.id}`}>Merge into {r.duplicate.id} (fills empty fields only)</option>}
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="cv-toolbar" style={{ marginTop: 8 }}>
                <button type="button" className="pj-btn" onClick={() => setStep('map')}>
                  Back
                </button>
                <button type="button" className="pj-btn primary" disabled={!live.length} onClick={() => setStep('confirm')} data-testid="xl-to-confirm">
                  Next: confirm
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div data-testid="xl-step-confirm">
              <ul className="pj-small">
                <li>
                  <strong>{counts.created}</strong> new stakeholder{counts.created === 1 ? '' : 's'} with <strong>{counts.concerns}</strong> concern{counts.concerns === 1 ? '' : 's'}
                </li>
                <li>{counts.merged} merged into existing stakeholders (empty fields only)</li>
                <li>{counts.skipped} skipped</li>
                <li>{counts.warnings} warnings travel with the records (missing interest, unrecognised values, formulas)</li>
              </ul>
              <p className="pj-small">These records will be added to your team’s project. A restore point is made first, and the import can be undone.</p>
              <label className="pj-small" style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
                <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} data-testid="xl-ack" /> I have reviewed these records and take responsibility for them
              </label>
              <div className="cv-toolbar">
                <button type="button" className="pj-btn" onClick={() => setStep('preview')} disabled={busy}>
                  Back
                </button>
                <button type="button" className="pj-btn primary" disabled={!ack || busy || st.readOnly} onClick={() => void commit()} data-testid="xl-commit">
                  {busy ? 'Importing…' : `Import ${counts.created + counts.merged} stakeholder${counts.created + counts.merged === 1 ? '' : 's'}`}
                </button>
              </div>
            </div>
          )}

          {step === 'result' && result && (
            <div data-testid="xl-step-result" role="status">
              <p>
                Imported in one change: {result.created.filter((x) => x.startsWith('STK')).length} stakeholders and {result.created.filter((x) => x.startsWith('CON')).length} concerns{result.merged.length ? `; merged into ${result.merged.join(', ')}` : ''}. Each record keeps its provenance (file, sheet, row, time, mapping).
              </p>
              <p className="pj-small" data-testid="xl-created">
                Created: <span className="cv-id">{result.created.join(', ') || 'none'}</span>
              </p>
              {result.msg && (
                <p className="cv-infobox" role="status" data-testid="xl-undo-msg">
                  {result.msg}
                </p>
              )}
              <div className="cv-toolbar">
                <button type="button" className="pj-btn" disabled={busy || /undone:/.test(result.msg)} onClick={() => void undo()} data-testid="xl-undo">
                  Undo this import
                </button>
                <button type="button" className="pj-btn primary" onClick={onClose} data-testid="xl-done">
                  Done
                </button>
              </div>
            </div>
          )}
          {step !== 'result' && (
            <Dialog.Close asChild>
              <button type="button" className="pj-btn small" style={{ position: 'absolute', top: 12, right: 12 }} disabled={busy} aria-label="Cancel the import">
                Cancel
              </button>
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
