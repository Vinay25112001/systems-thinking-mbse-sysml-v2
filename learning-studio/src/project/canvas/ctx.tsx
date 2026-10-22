// The canvas context: one canonical document, one write path (store.apply → change sets), the selection shared by the
// table, the map and the detail panel, the field that has focus (for the guidance panel), and the approval guard
// (A26: editing a material field of an approved proposal asks first and marks it "changes pending re-review").
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import type { TeamRecord } from '../../workbench/week1/team'
import { APPROVAL_MATERIAL_FIELDS } from '../model/approvalBinding'
import type { Operation, ProjectDoc, Stamp } from '../model/types'
import type { StoreState } from '../store/ProjectStore'
import { useProjectState, useProjectStore } from '../store/ProjectProvider'
import { api } from '../../services/backend'
import { recordOps } from './canvasModel'
import { guidanceFor } from '../../week1/guidance/fieldGuidance'
import { canvasProgress, type CanvasProgress, type PartId } from './progress'

export type Selection = { uid: string; kind: 'artifact' | 'relationship' } | null
type Ctx = {
  doc: ProjectDoc
  st: StoreState
  rec: TeamRecord
  progress: CanvasProgress
  readOnly: boolean
  serverMode: boolean
  part: PartId
  setPart: (p: PartId) => void
  selection: Selection
  select: (s: Selection) => void
  focusKey: string | null
  setFocusKey: (k: string | null) => void
  /** Last refusal or message for the canvas (shown in a live region). */
  message: string
  say: (m: string) => void
  /** Applies a record edit (Week 1 parts). Returns the refusal message or ''. */
  editRecord: (edit: Partial<TeamRecord> | ((r: TeamRecord) => TeamRecord), summary?: string) => string
  /** Applies canonical operations as one change set. Returns the refusal message or ''. */
  applyOps: (build: Operation[] | ((doc: ProjectDoc, stamp: Stamp) => Operation[]), summary?: string) => string
  /** Material fields of an approved proposal are locked until the student confirms (once per page). */
  materialLocked: boolean
  unlockMaterial: () => void
  /** The uid of a course ID in the LATEST document (right after an edit, before React re-renders). */
  latestUid: (id: string) => string
  /** Instructor feedback anchored to artifact IDs in the latest decided submission (course server; spec RS-30). */
  feedback: { artifactId: string; text: string; snapshotId: string }[]
  /** Narrow screens: the guidance bottom sheet, opened from a field's (i) button (review M-6). */
  sheetOpen: boolean
  openGuidance: (key: string, opener?: HTMLElement | null) => void
  closeGuidance: () => void
}
const CanvasCtx = createContext<Ctx | null>(null)

export function useCanvas(): Ctx {
  const c = useContext(CanvasCtx)
  if (!c) throw new Error('useCanvas outside CanvasProvider')
  return c
}

export function CanvasProvider({ part, setPart, children }: { part: PartId; setPart: (p: PartId) => void; children: ReactNode }) {
  const st = useProjectState()
  const store = useProjectStore()
  const doc = st.doc!
  const serverMode = st.storage === 'http'
  const progress = useMemo(() => canvasProgress(doc, { serverMode }), [doc, serverMode])
  const [selection, select] = useState<Selection>(null)
  const [focusKey, setFocusKey] = useState<string | null>(null)
  const [message, say] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const opener = useRef<HTMLElement | null>(null)
  const [feedback, setFeedback] = useState<Ctx['feedback']>([])
  const uid = doc.project.uid
  useEffect(() => {
    if (!serverMode) return
    let alive = true
    void api<{ submissions: { state: string; snapshotId: string; anchors: { artifactId: string; text: string }[] }[] }>('GET', `/projects/${encodeURIComponent(uid)}/submissions`)
      .then((r) => {
        const decided = r.data.submissions.filter((s) => s.state === 'approved' || s.state === 'returned').at(-1)
        if (alive) setFeedback(decided ? decided.anchors.map((a) => ({ ...a, snapshotId: decided.snapshotId })) : [])
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [serverMode, uid])
  const materialLocked = serverMode && progress.approval.state === 'approved' && !unlocked
  const outcome = useCallback((r: { ok: boolean; error?: string }) => {
    if (!r.ok) {
      say(r.error ?? 'The change was not saved.')
      return r.error ?? 'refused'
    }
    return ''
  }, [])
  const editRecord = useCallback<Ctx['editRecord']>((edit, summary) => {
    if (!store) return 'No project is open.'
    return outcome(store.apply((latest, stamp) => recordOps(latest, edit, stamp), { source: 'editor', ...(summary ? { summary } : {}) }) as { ok: boolean; error?: string })
  }, [store, outcome])
  const applyOps = useCallback<Ctx['applyOps']>((build, summary) => {
    if (!store) return 'No project is open.'
    return outcome(store.apply(build, { source: 'editor', noCoalesce: true, ...(summary ? { summary } : {}) }) as { ok: boolean; error?: string })
  }, [store, outcome])
  const value: Ctx = { doc, st, rec: progress.record, progress, readOnly: st.readOnly, serverMode, part, setPart, selection, select, focusKey, setFocusKey, message, say, editRecord, applyOps, materialLocked, unlockMaterial: () => setUnlocked(true), latestUid: (id: string) => Object.values(store?.getState().doc?.artifacts ?? {}).find((a) => a.id === id)?.uid ?? '', feedback,
    sheetOpen,
    openGuidance: (key: string, from?: HTMLElement | null) => {
      opener.current = from ?? null
      setFocusKey(key)
      // only where the panel is not beside the form (the sheet is hidden by CSS on wide screens anyway)
      if (typeof window === 'undefined' || !window.matchMedia || window.matchMedia('(max-width: 1199px)').matches) setSheetOpen(true)
    },
    closeGuidance: () => {
      setSheetOpen(false)
      opener.current?.focus()
    },
  }
  return <CanvasCtx.Provider value={value}>{children}</CanvasCtx.Provider>
}

/** Field keys whose content is material to the enterprise approval (A26; APPROVAL_MATERIAL_FIELDS is the source). */
const MATERIAL_KEYS = new Set(['ent.name', 'ent.description', 'ent.problem', 'ent.mission', 'ent.objective', 'prt.name', 'ext.name', 'ext.kind', 'ext.crosses', 'ext.direction'])
export const isMaterialKey = (k: string) => MATERIAL_KEYS.has(k) && Object.keys(APPROVAL_MATERIAL_FIELDS).length > 0

/** A text field that writes on pause (600 ms) and on blur, not on every keystroke, and follows the document when it is
 *  not being edited (a teammate's change appears). */
export function useDraft(value: string, commit: (v: string) => void, delay = 600) {
  const [draft, setDraft] = useState(value)
  const editing = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef(commit)
  latest.current = commit
  const pending = useRef<string | null>(null)
  useEffect(() => {
    if (!editing.current) setDraft(value)
  }, [value])
  // a field that unmounts with a pending write (the part changed by keyboard) still writes it
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
    if (pending.current !== null) latest.current(pending.current)
  }, [])
  const flush = useCallback(
    (v: string) => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = null
      pending.current = null
      if (v !== value) latest.current(v)
    },
    [value],
  )
  return {
    value: draft,
    onChange: (v: string) => {
      editing.current = true
      setDraft(v)
      pending.current = v
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => flush(v), delay)
    },
    onBlur: () => {
      editing.current = false
      flush(draft)
    },
  }
}

type FieldProps = {
  /** Guidance key (guidance.ts). */
  gk: string
  label: string
  value: string
  onCommit: (v: string) => void
  kind?: 'input' | 'textarea' | 'select'
  options?: { value: string; label: string }[]
  hint?: string
  testId?: string
  disabled?: boolean
  /** Hide the visible label (inside a table cell); the accessible name stays. */
  bare?: boolean
  rows?: number
  mono?: boolean
}

/** A labelled field with contextual guidance: focusing it shows the guidance (without moving focus); the short
 *  definition is linked by aria-describedby; the (i) button opens the guidance on small screens. */
export function Field({ gk, label, value, onCommit, kind = 'input', options, hint, testId, disabled, bare, rows, mono }: FieldProps) {
  const c = useCanvas()
  const id = useId()
  const g = guidanceFor(gk)
  const material = isMaterialKey(gk)
  const lock = c.readOnly || disabled || (material && c.materialLocked)
  const d = useDraft(value, onCommit)
  const describedBy = g ? `${id}-def` : undefined
  const common = {
    id,
    disabled: lock,
    'aria-describedby': describedBy,
    'data-testid': testId,
    onFocus: () => c.setFocusKey(gk),
  }
  const control =
    kind === 'select' ? (
      <select {...common} className="cv-select" value={value} onChange={(e) => onCommit(e.target.value)}>
        <option value="">Choose…</option>
        {(options ?? []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    ) : kind === 'textarea' ? (
      <textarea {...common} className="cv-textarea" rows={rows ?? 3} value={d.value} onChange={(e) => d.onChange(e.target.value)} onBlur={d.onBlur} />
    ) : (
      <input {...common} className={`cv-input${mono ? ' cv-id' : ''}`} value={d.value} onChange={(e) => d.onChange(e.target.value)} onBlur={d.onBlur} autoComplete="off" />
    )
  return (
    <div className="cv-field">
      {bare ? (
        <label htmlFor={id} className="cv-sr">
          {label}
        </label>
      ) : (
        <div className="cv-label">
          <label htmlFor={id}>{label}</label>
          {g && (
            <button type="button" className="cv-info-btn" aria-label={`Guidance for ${label}`} onClick={(e) => c.openGuidance(gk, e.currentTarget)}>
              i
            </button>
          )}
          {material && (
            <span className="cv-proposal-tag" title="Part of the enterprise proposal your instructor approves">
              proposal
            </span>
          )}
        </div>
      )}
      {bare && g ? (
        <span className="cv-bare">
          {control}
          {/* table cells: the (i) button exists on narrow screens only (the panel beside the table covers wide ones) */}
          <button type="button" className="cv-info-btn cv-info-narrow" aria-label={`Guidance for ${label}`} onClick={(e) => c.openGuidance(gk, e.currentTarget)}>
            i
          </button>
        </span>
      ) : (
        control
      )}
      {g && (
        <span id={`${id}-def`} className="cv-sr">
          {g.definition.text}
        </span>
      )}
      {hint && !bare && <span className="cv-hint">{hint}</span>}
    </div>
  )
}

export function StateChip({ state, children }: { state: string; children: ReactNode }) {
  return (
    <span className="cv-state" data-state={state}>
      {children}
    </span>
  )
}
