// Shared parts of the textbook's interactive figures IF-6 and IF-7 (the IF-1 pattern, BoundaryExplorer.tsx): the
// full-viewport Expand dialog (Esc closes, focus returns to the opener) and the readable drawing frame (FD-f: inline the
// drawing fits its panel; expanded it is never narrower than the width at which its smallest label renders at 13 px).
import { Maximize2 } from 'lucide-react'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { readableWidth } from './figureText'

export function useDialog() {
  const ref = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const open = () => {
    const d = ref.current
    if (d && typeof d.showModal === 'function') d.showModal()
    else d?.setAttribute('open', '')
  }
  const close = () => {
    ref.current?.close?.()
    ref.current?.removeAttribute('open')
    opener.current?.focus()
  }
  return { ref, opener, open, close }
}

export function ExpandButton({ d, testId, label }: { d: ReturnType<typeof useDialog>; testId: string; label: string }) {
  return (
    <div className="w1l-fig-actions">
      <button type="button" className="w1l-linkbtn" onClick={d.open} ref={d.opener} data-testid={testId}>
        <Maximize2 size={14} aria-hidden /> Expand<span className="sr-only"> {label}</span>
      </button>
    </div>
  )
}

export function FigureDialog({ d, title, children }: { d: ReturnType<typeof useDialog>; title: string; children: ReactNode }) {
  return (
    <dialog ref={d.ref} className="w1l-dialog w1l-dialog-ifig" aria-label={`${title}, expanded`} onCancel={(e) => (e.preventDefault(), d.close())}>
      <div className="w1l-dialog-head">
        <p>{title}</p>
        <button type="button" className="w1l-btn" onClick={d.close}>
          Close
        </button>
      </div>
      {children}
    </dialog>
  )
}

/** A drawing that fits its panel inline and keeps its readable width when expanded (`big`). */
export function ReadableArt({ big = false, children }: { big?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [minW, setMinW] = useState<number | null>(null)
  useLayoutEffect(() => {
    const svg = ref.current?.querySelector('svg')
    if (svg) setMinW(readableWidth(svg))
  }, [])
  return (
    <div ref={ref} className={`w1l-ifig-art${big ? ' is-readable is-big' : ''}`} style={big && minW ? ({ '--w1l-art-min': `${minW}px` } as React.CSSProperties) : undefined}>
      {children}
    </div>
  )
}

/** Greedy word wrap for SVG labels (at most `max` characters a line). */
export function wrap(text: string, max: number): string[] {
  const lines: string[] = []
  for (const w of text.split(/\s+/)) {
    const last = lines[lines.length - 1]
    if (last !== undefined && `${last} ${w}`.length <= max) lines[lines.length - 1] = `${last} ${w}`
    else lines.push(w)
  }
  return lines
}

/** True when the reader has asked for reduced motion (the figures then change state instantly). */
export const prefersReducedMotion = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
