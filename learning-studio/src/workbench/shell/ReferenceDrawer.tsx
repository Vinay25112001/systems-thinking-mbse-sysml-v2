// Reference drawer: the full reviewed lesson, rendered with the classic page's block renderers (citations, provenance
// and review controls intact), searchable, opened from the rail or from a mission step's "Read more" link, which
// scrolls to the right block. Non-modal, so a student can read beside the model; Esc closes it.
import * as Dialog from '@radix-ui/react-dialog'
import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { weekByNumber } from '../../content/course'
import type { LessonBlock } from '../../content/schema'
import { weekContent } from '../../content/weeks'
import { Block, Objectives, Readings } from '../../pages/WeekPage'
import { useWorkbench } from '../context'
import { ACTIVITY_VIEW, VIEW_REGISTRY } from '../views'

const blockText = (b: LessonBlock) => [b.title, ...b.paragraphs, ...(b.bullets ?? []), ...(b.table ? b.table.rows.flat() : []), b.quote?.text ?? ''].join(' ').toLowerCase()

export function ReferenceDrawer() {
  const wb = useWorkbench()
  const c = weekContent(wb.week)
  const w = weekByNumber(wb.week)
  const [query, setQuery] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)
  const q = query.trim().toLowerCase()
  const blocks = useMemo(() => (c ? c.blocks.filter((b) => !q || blockText(b).includes(q)) : []), [c, q])

  // a new "Read more" clears the search so the target block is shown (state adjusted during render, not in an effect)
  const [seenTick, setSeenTick] = useState(wb.reference.tick)
  if (seenTick !== wb.reference.tick) {
    setSeenTick(wb.reference.tick)
    if (wb.reference.block) setQuery('')
  }
  useEffect(() => {
    if (!wb.reference.open || !wb.reference.block) return
    const t = setTimeout(() => {
      const el = bodyRef.current?.querySelector<HTMLElement>(`#ref-${CSS.escape(wb.reference.block!)}`)
      el?.scrollIntoView?.({ block: 'start' })
      el?.focus({ preventScroll: true })
    }, 60)
    return () => clearTimeout(t)
  }, [wb.reference.open, wb.reference.block, wb.reference.tick])

  if (!c || !w) return null
  return (
    <Dialog.Root open={wb.reference.open} onOpenChange={(o) => (o ? wb.openReference() : wb.closeReference())} modal={false}>
      <Dialog.Portal>
        <Dialog.Content className="wb-drawer" onInteractOutside={(e) => e.preventDefault()} aria-describedby={undefined} data-testid="reference-drawer">
          <div className="wb-ph" style={{ height: 40 }}>
            <Dialog.Title asChild>
              <h2>Reference · Week {w.number} lesson</h2>
            </Dialog.Title>
            <span className="wb-sp" />
            <Dialog.Close className="wb-btn ghost icon" aria-label="Close the reference drawer">
              <X size={14} aria-hidden />
            </Dialog.Close>
          </div>
          <div className="flex flex-none items-center gap-2 border-b border-wb-line px-3 py-2">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search the lesson</span>
              <Search size={13} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-wb-muted" aria-hidden />
              <input className="wb-input w-full pl-7" type="search" placeholder="Search the lesson" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <span className="wb-count" role="status">
              {q ? `${blocks.length} of ${c.blocks.length} sections` : `${c.blocks.length} sections`}
            </span>
          </div>
          <nav aria-label="Lesson sections" className="flex flex-none gap-1 overflow-x-auto border-b border-wb-line px-3 py-1.5">
            {blocks.map((b) => (
              <button
                key={b.id}
                type="button"
                className="wb-btn ghost text-[11px]"
                title={b.title}
                onClick={() => bodyRef.current?.querySelector<HTMLElement>(`#ref-${CSS.escape(b.id)}`)?.scrollIntoView?.({ block: 'start' })}
              >
                <span className="block max-w-[26ch] truncate">{b.title.replace(/^(Worked example|Advanced analysis|Intuition): /, '')}</span>
              </button>
            ))}
          </nav>
          <div className="wb-scroll wb-reading space-y-4 px-4 py-4" ref={bodyRef} tabIndex={0} aria-label="Lesson text">
            {!q && (
              <section className="rounded border border-wb-line p-3">
                <h3 className="wb-section-title">Driving question</h3>
                <p className="mt-1 mb-0">{c.drivingQuestion}</p>
              </section>
            )}
            {blocks.length === 0 && <p className="text-wb-muted">No section mentions “{query}”.</p>}
            {blocks.map((b) => {
              const acts = c.activities.filter((a) => a.inBlock === b.id)
              return (
                <div key={b.id} id={`ref-${b.id}`} className="scroll-mt-2 rounded-xl" tabIndex={-1}>
                  <Block b={b}>
                    {b.kind === 'outcomes' && (
                      <>
                        <h3 className="text-sm font-semibold">Objectives</h3>
                        <Objectives w={w} />
                        <h3 className="mt-3 text-sm font-semibold">Readings</h3>
                        <Readings w={w} />
                      </>
                    )}
                    {acts.map((a) => {
                      const v = ACTIVITY_VIEW[a.component]
                      return (
                        <p key={a.id} className="wb-note accent m-0 text-[13px]">
                          Interactive activity: <strong>{a.title}</strong>.{' '}
                          {v && wb.def.views.includes(v) ? (
                            <button type="button" className="wb-link" onClick={() => (wb.setView(v), wb.closeReference())}>
                              Open the {VIEW_REGISTRY[v].title} view
                            </button>
                          ) : null}
                        </p>
                      )
                    })}
                  </Block>
                </div>
              )
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ReferenceDrawer
