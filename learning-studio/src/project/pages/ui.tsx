// Shared pieces of the My Project screens: ownership banners (triple-coded: label, icon, accent), the save status,
// status chips (icon + word, never colour alone), the empty state and the five Week 8 mapping-status marks.
import { AlertTriangle, Check, CircleDashed, FolderOpen, Info, Square, Target, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { MappingStatus } from '../model/types'
import { MAPPING_STATUS_LABEL } from '../model/types'
import type { SaveState, StoreState } from '../store/ProjectStore'
import './project.css'

export function ProjectBanner({ name, children, action, testId }: { name: string; children?: ReactNode; action?: ReactNode; testId?: string }) {
  return (
    <div className="pj-scope">
      <div className="pj-banner project" role="note" data-testid={testId ?? 'project-banner'}>
        <FolderOpen size={20} aria-hidden />
        <span>
          <strong>Your enterprise{name ? ` · ${name}` : ''}.</strong> {children}
        </span>
        {action && <span className="pj-banner-act">{action}</span>}
      </div>
    </div>
  )
}
/** The AeroLink / practice banner: plum, hatched, labelled "Instructor example". */
export function ExampleBanner({ children, action, testId }: { children?: ReactNode; action?: ReactNode; testId?: string }) {
  return (
    <div className="pj-scope">
      <div className="pj-banner example" role="note" data-testid={testId ?? 'example-banner'}>
        <Target size={20} aria-hidden />
        <span>
          <strong>Practice: AeroLink (instructor example, fictional).</strong> {children ?? 'Practice work stays here and is never written into your project.'}
        </span>
        {action && <span className="pj-banner-act">{action}</span>}
      </div>
    </div>
  )
}

const time = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')
export function SaveStatus({ save, storage, onExport }: { save: SaveState; storage: StoreState['storage']; onExport?: () => void }) {
  const title = storage === 'http' ? 'Your team’s project is saved on the course server. Saved appears only after the server confirmed the change.' : 'Your project is saved in this browser only. The export is the copy you keep and submit.'
  if (save.kind === 'error')
    return (
      <span className="pj-save error" role="status" data-testid="save-status" title={title}>
        <X size={14} aria-hidden /> {storage === 'http' ? 'Save failed' : 'Not saved'}: {save.reason}
        {onExport && (
          <button type="button" className="pj-btn small danger" onClick={onExport}>
            Export now
          </button>
        )}
      </span>
    )
  if (save.kind === 'conflict')
    return (
      <span className="pj-save error" role="status" data-testid="save-status" title={save.reason}>
        <AlertTriangle size={14} aria-hidden /> Conflict requires review
      </span>
    )
  if (save.kind === 'saving' || save.kind === 'pending')
    return (
      <span className="pj-save" role="status" data-testid="save-status" title={title}>
        <span className="pj-dot" aria-hidden /> {save.kind === 'saving' ? 'Saving…' : storage === 'memory' ? 'Kept in this tab only (not saved)' : 'Unsaved changes'}
      </span>
    )
  return (
    <span className={`pj-save ${save.kind === 'saved' ? 'saved' : ''}`} role="status" data-testid="save-status" title={title}>
      <span className="pj-dot" aria-hidden /> {storage === 'memory' ? 'Kept in this tab only (not saved)' : save.kind === 'saved' ? `Saved ${time(save.at)}` : 'Saved'}
    </span>
  )
}

export type ChipTone = 'ok' | 'warn' | 'bad' | 'neutral' | 'draft' | 'project' | 'example' | 'mbse'
const ICON: Record<ChipTone, ReactNode> = { ok: <Check size={12} aria-hidden />, warn: <AlertTriangle size={12} aria-hidden />, bad: <X size={12} aria-hidden />, neutral: <Info size={12} aria-hidden />, draft: null, project: <FolderOpen size={12} aria-hidden />, example: <Target size={12} aria-hidden />, mbse: null }
export function Chip({ tone, children, title }: { tone: ChipTone; children: ReactNode; title?: string }) {
  return (
    <span className={`pj-chip ${tone}`} title={title}>
      {ICON[tone]}
      {children}
    </span>
  )
}

export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="pj-empty" data-testid="empty-state">
      <h3 className="pj-h3">{title}</h3>
      <div className="pj-small pj-muted">{children}</div>
      {action && <div className="pj-row" style={{ marginTop: 10 }}>{action}</div>}
    </div>
  )
}

/** Each mapping status has its own shape, colour and word (proposal §7). */
export function MapStatus({ status, short = false }: { status: MappingStatus; short?: boolean }) {
  const icon =
    status === 'not-mapped' ? <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
    : status === 'mapping-proposed' ? <CircleDashed size={14} aria-hidden />
    : status === 'mapped' ? <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><circle cx="7" cy="7" r="6.5" fill="currentColor" /><path d="M4 7.2l2 2 4-4.4" fill="none" stroke="var(--pj-panel)" strokeWidth="1.8" /></svg>
    : status === 'needs-review' ? <AlertTriangle size={14} aria-hidden />
    : <span style={{ position: 'relative', display: 'inline-grid', placeItems: 'center' }}><Square size={14} aria-hidden fill="currentColor" /><X size={10} aria-hidden style={{ position: 'absolute', color: 'var(--pj-panel)' }} /></span>
  const label = short && status === 'mapping-proposed' ? 'Proposed' : short && status === 'invalid-or-incomplete' ? 'Incomplete' : MAPPING_STATUS_LABEL[status]
  return (
    <span className={`pj-mstat ${status}`} data-status={status}>
      {icon}
      {label}
    </span>
  )
}

export const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '')
