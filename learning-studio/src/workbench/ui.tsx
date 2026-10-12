// Workbench primitives: panel header, status chip, icon button with tooltip. Status is always chip + colour + text,
// never colour alone (WORKBENCH_SPEC §4).
import * as Tooltip from '@radix-ui/react-tooltip'
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { SEVERITY_LABEL, type Severity } from './problems'

export function PanelHeader({ title, id, icon, children }: { title: string; id?: string; icon?: ReactNode; children?: ReactNode }) {
  return (
    <div className="wb-ph">
      {icon}
      <h2 id={id}>{title}</h2>
      <span className="wb-sp" />
      {children}
    </div>
  )
}

export function SeverityIcon({ s, size = 13 }: { s: Severity | 'ok'; size?: number }) {
  if (s === 'error') return <CircleAlert size={size} aria-hidden />
  if (s === 'warning') return <TriangleAlert size={size} aria-hidden />
  if (s === 'info') return <Info size={size} aria-hidden />
  return <CircleCheck size={size} aria-hidden />
}

export function SeverityChip({ s, children }: { s: Severity; children?: ReactNode }) {
  return (
    <span className={`wb-chip ${s}`}>
      <SeverityIcon s={s} size={11} />
      {children ?? SEVERITY_LABEL[s]}
    </span>
  )
}

export function StateChip({ ok, children, tone }: { ok: boolean; children: ReactNode; tone?: 'warn' | 'info' }) {
  return (
    <span className={`wb-chip ${ok ? 'ok' : (tone ?? 'warn')}`}>
      {ok ? <CircleCheck size={11} aria-hidden /> : <Info size={11} aria-hidden />}
      {children}
    </span>
  )
}

export function Tip({ label, children, side = 'bottom' }: { label: string; children: ReactNode; side?: 'top' | 'right' | 'bottom' | 'left' }) {
  return (
    <Tooltip.Root delayDuration={350}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side={side} sideOffset={6} className="wb-tooltip">
          {label}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export function IconButton({ label, onClick, children, pressed, className = '', disabled }: { label: string; onClick: () => void; children: ReactNode; pressed?: boolean; className?: string; disabled?: boolean }) {
  return (
    <Tip label={label}>
      <button type="button" className={`wb-btn ghost icon ${className}`} aria-label={label} aria-pressed={pressed} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    </Tip>
  )
}

