import type { ReactNode } from 'react'
import { citationInRange, formatCitation, getReading, type Citation } from '../content/readings'
import { useApp, type ReviewStatus } from '../state/AppState'
import { useIsWorkbench } from './surface'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  // inside a workbench centre view: a flat token panel (borders over shadows, 4 px radius, 12 px padding)
  if (useIsWorkbench()) return <section className={`rounded border border-wb-line bg-wb-panel p-3 ${className}`}>{children}</section>
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {children}
    </section>
  )
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  if (useIsWorkbench())
    return (
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="wb-section-title">{title}</h2>
          {subtitle && <p className="mt-1 mb-0 max-w-[100ch] text-[12.5px] text-wb-muted">{subtitle}</p>}
        </div>
        {children}
      </header>
    )
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </header>
  )
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled,
  ariaLabel,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  type?: 'button' | 'submit'
  disabled?: boolean
  ariaLabel?: string
}) {
  const wb = useIsWorkbench()
  if (wb)
    return (
      <button type={type} onClick={onClick} disabled={disabled} aria-label={ariaLabel} className={`wb-btn ${variant === 'primary' ? 'primary' : variant === 'danger' ? 'danger' : variant === 'ghost' ? 'ghost' : ''}`}>
        {children}
      </button>
    )
  const styles = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-slate-400',
    secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
  }[variant]
  return (
    <button type={type} onClick={onClick} disabled={disabled} aria-label={ariaLabel} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed ${styles}`}>
      {children}
    </button>
  )
}

const WB_TONE = { slate: '', amber: 'warn', emerald: 'ok', rose: 'bad', sky: 'accent', violet: 'accent' } as const

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'amber' | 'emerald' | 'rose' | 'sky' | 'violet' }) {
  const wb = useIsWorkbench()
  if (wb) return <span className={`wb-chip ${WB_TONE[tone]}`}>{children}</span>
  const tones = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    amber: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200',
    emerald: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200',
    rose: 'bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200',
    sky: 'bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200',
    violet: 'bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-200',
  }[tone]
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${tones}`}>{children}</span>
}

/** Renders a verified citation. Throws (fails tests) if the reading is unknown or pages fall outside its verified range. */
export function CitationText({ c }: { c: Citation }) {
  const r = getReading(c.reading)
  const inRange = citationInRange(c)
  return (
    <span className="text-xs text-slate-600 dark:text-slate-400" data-reading={c.reading} data-in-range={inRange}>
      {formatCitation(c)}
      {c.note ? ` — ${c.note}` : ''}
      {!r.verified && r.declaredException && ' (verified, declared exception)'}
      {!inRange && <strong className="text-rose-600"> [pages outside verified range]</strong>}
    </span>
  )
}

export function Citations({ items }: { items: Citation[] }) {
  if (!items.length) return null
  return (
    <div className="mt-3 border-t border-slate-200 pt-2 dark:border-slate-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Sources</p>
      <ul className="mt-1 space-y-0.5">
        {items.map((c, i) => (
          <li key={i}>
            <CitationText c={c} />
          </li>
        ))}
      </ul>
    </div>
  )
}

const PROVENANCE_TONE: Record<string, 'sky' | 'violet' | 'amber' | 'slate' | 'emerald'> = {
  'source-paraphrase': 'sky',
  'instructor-authored': 'violet',
  mixed: 'sky',
  'official-S04': 'emerald',
  'teaching-content': 'violet',
  fictional: 'amber',
  student: 'slate',
  'AI-suggested-reviewed': 'amber',
}
const PROVENANCE_LABEL: Record<string, string> = {
  'source-paraphrase': 'Source-based (paraphrased)',
  'instructor-authored': 'Instructor-authored',
  mixed: 'Source-based + instructor application',
  'official-S04': 'Official lab sheet (S04)',
  'teaching-content': 'Teaching content',
  fictional: 'FICTIONAL data',
  student: 'Student work',
  'AI-suggested-reviewed': 'AI-suggested, reviewed',
}

export function ProvenanceBadge({ value }: { value: string }) {
  return <Badge tone={PROVENANCE_TONE[value] ?? 'slate'}>{PROVENANCE_LABEL[value] ?? value}</Badge>
}

const REVIEW_LABEL: Record<ReviewStatus, string> = {
  pending: 'Pending faculty review',
  approved: 'Approved by reviewer',
  'changes-requested': 'Changes requested',
}

export function ReviewBadge({ id }: { id: string }) {
  const { reviews } = useApp()
  const status: ReviewStatus = reviews[id]?.status ?? 'pending'
  return <Badge tone={status === 'approved' ? 'emerald' : status === 'changes-requested' ? 'rose' : 'amber'}>{REVIEW_LABEL[status]}</Badge>
}

/** Inline review controls, visible only in Instructor review mode. */
export function ReviewControls({ id, label }: { id: string; label: string }) {
  const { instructor, reviews, setReview } = useApp()
  if (!instructor) return null
  const rec = reviews[id]
  return (
    <div className="mt-3 rounded-md border border-dashed border-amber-400 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-950/30" data-testid={`review-${id}`}>
      <p className="font-medium text-amber-900 dark:text-amber-200">Instructor review — {label}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1">
          <span className="sr-only">Review status for {label}</span>
          <select
            className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
            value={rec?.status ?? 'pending'}
            onChange={(e) => setReview(id, { status: e.target.value as ReviewStatus, note: rec?.note ?? '' })}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approve</option>
            <option value="changes-requested">Request changes</option>
          </select>
        </label>
        <input
          aria-label={`Reviewer note for ${label}`}
          className="min-w-64 flex-1 rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
          placeholder="Reviewer note (stored in this browser only)"
          value={rec?.note ?? ''}
          onChange={(e) => setReview(id, { status: rec?.status ?? 'pending', note: e.target.value })}
        />
      </div>
    </div>
  )
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800" role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-2 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
