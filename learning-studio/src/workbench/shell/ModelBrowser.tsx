// Model browser: the student's model as a tree grouped by element kind, with search, a kind filter and status dots
// from the problems engine. WAI-ARIA tree pattern: one tab stop (roving tabindex), arrow keys move, Right/Left
// expand/collapse, Home/End jump, Enter or Space selects. Selection is global.
import { Boxes, ChevronDown, ChevronRight, Search, SearchX } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { usePersistentState } from '../../lib/usePersistentState'
import { useWorkbench, type TreeGroup } from '../context'
import { useSelection } from '../selection'
import { PanelHeader } from '../ui'

type Row = { id: string; level: 1 | 2; group: TreeGroup; label: string; sub?: string }

const DEFAULT_COLLAPSED = ['g-vars', 'g-loops', 'g-stk']

/** True when an item's subtitle says it is not finished, so its dot is not green (review F15): "incomplete", "not
 *  recorded", "unclassified", or a count still short of its total ("3/14 marked"). */
function unfinished(sub: string | undefined): boolean {
  if (!sub) return false
  if (/^(incomplete|not recorded|not exported|unclassified|to do)\b/i.test(sub.trim())) return true
  const m = /^(\d+)\s*\/\s*(\d+)/.exec(sub.trim())
  return !!m && Number(m[1]) < Number(m[2])
}

/** `headerExtra`: controls the host adds to the panel header (the medium-width drawer's close button). */
export function ModelBrowser({ headerExtra }: { headerExtra?: ReactNode } = {}) {
  const wb = useWorkbench()
  const { selectedId, select, highlighted, revealTick } = useSelection()
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('all')
  const [collapsed, setCollapsed] = usePersistentState<string[]>(`wb-tree-collapsed-w${wb.week}`, DEFAULT_COLLAPSED)
  const [focusId, setFocusId] = useState<string | null>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const groups = useMemo(() => wb.ui.tree(wb.state), [wb.ui, wb.state])
  const q = query.trim().toLowerCase()
  const shown = useMemo(
    () =>
      groups
        .filter((g) => kind === 'all' || g.id === kind)
        .map((g) => ({ ...g, items: q ? g.items.filter((i) => `${i.id} ${i.label} ${i.sub ?? ''}`.toLowerCase().includes(q)) : g.items }))
        .filter((g) => !q || g.items.length > 0),
    [groups, kind, q],
  )
  const isOpen = (g: TreeGroup) => !!q || !collapsed.includes(g.id)
  const rows: Row[] = useMemo(
    () => shown.flatMap((g) => [{ id: g.id, level: 1 as const, group: g, label: g.label }, ...(isOpen(g) ? g.items.map((i) => ({ id: i.id, level: 2 as const, group: g, label: i.label, sub: i.sub })) : [])]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shown, collapsed, q],
  )
  const tabStop = rows.find((r) => r.id === focusId)?.id ?? rows.find((r) => r.id === selectedId)?.id ?? rows[0]?.id

  const toggle = (gid: string, open?: boolean) =>
    setCollapsed((c) => {
      const isCollapsed = c.includes(gid)
      const wantOpen = open ?? isCollapsed
      return wantOpen ? c.filter((x) => x !== gid) : isCollapsed ? c : [...c, gid]
    })

  const focusRow = (id: string) => {
    setFocusId(id)
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-row="${CSS.escape(id)}"]`)?.focus())
  }

  // reveal the selection when asked (problem click, view click): open its group and scroll it into view
  useEffect(() => {
    if (!revealTick || !selectedId) return
    const g = groups.find((x) => x.items.some((i) => i.id === selectedId))
    if (g && collapsed.includes(g.id)) setCollapsed((c) => c.filter((x) => x !== g.id))
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-row="${CSS.escape(selectedId)}"]`)?.scrollIntoView?.({ block: 'nearest' }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealTick])

  const onKey = (e: KeyboardEvent<HTMLElement>, r: Row) => {
    const i = rows.findIndex((x) => x.id === r.id)
    const go = (j: number) => rows[j] && focusRow(rows[j].id)
    switch (e.key) {
      case 'ArrowDown':
        go(Math.min(rows.length - 1, i + 1))
        break
      case 'ArrowUp':
        go(Math.max(0, i - 1))
        break
      case 'Home':
        go(0)
        break
      case 'End':
        go(rows.length - 1)
        break
      case 'ArrowRight':
        if (r.level === 1) {
          if (!isOpen(r.group)) toggle(r.group.id, true)
          else if (rows[i + 1]?.level === 2) go(i + 1)
        }
        break
      case 'ArrowLeft':
        if (r.level === 2) focusRow(r.group.id)
        else if (isOpen(r.group) && !q) toggle(r.group.id, false)
        break
      case 'Enter':
      case ' ':
        if (r.level === 1) toggle(r.group.id)
        else select(r.id)
        break
      default:
        return
    }
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className="wb-pane" data-testid="model-browser">
      <PanelHeader title="Model browser" id="wb-browser-h" icon={<Boxes size={13} aria-hidden />}>
        <span className="wb-count">{groups.reduce((a, g) => a + g.items.length, 0)}</span>
        {headerExtra}
      </PanelHeader>
      <div className="flex flex-none gap-1.5 border-b border-wb-line px-2 py-1.5">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search the model</span>
          <Search size={12} className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 text-wb-muted" aria-hidden />
          <input data-wb-search className="wb-input mono w-full pl-6" type="search" placeholder="Search  /" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label>
          <span className="sr-only">Filter by kind</span>
          <select className="wb-select mono max-w-28" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="all">All kinds</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="wb-scroll">
        {rows.length === 0 ? (
          <div className="wb-empty">
            <SearchX size={16} aria-hidden />
            <div>
              <p className="m-0">
                No element matches <strong>“{query}”</strong>
                {kind !== 'all' ? ' in this kind' : ''}.
              </p>
              <button type="button" className="wb-link mt-1" onClick={() => (setQuery(''), setKind('all'))}>
                Clear the search and filter
              </button>
            </div>
          </div>
        ) : (
          <ul className="wb-tree" role="tree" aria-labelledby="wb-browser-h" ref={listRef}>
            {shown.map((g) => {
              const open = isOpen(g)
              return (
                <li
                  key={g.id}
                  role="treeitem"
                  aria-level={1}
                  aria-expanded={open}
                  data-row={g.id}
                  tabIndex={tabStop === g.id ? 0 : -1}
                  onKeyDown={(e) => e.target === e.currentTarget && onKey(e, { id: g.id, level: 1, group: g, label: g.label })}
                  onFocus={(e) => e.target === e.currentTarget && setFocusId(g.id)}
                >
                  <div className="wb-tree-row group" onClick={() => (toggle(g.id), setFocusId(g.id))}>
                    {open ? <ChevronDown size={12} aria-hidden /> : <ChevronRight size={12} aria-hidden />}
                    <span className="wb-tree-label">{g.label}</span>
                    <span className="wb-count">{g.items.length}</span>
                  </div>
                  {open && (
                    <ul role="group">
                      {g.items.length === 0 && (
                        <li role="none" className="wb-tree-row item text-wb-muted" style={{ cursor: g.emptyView ? 'pointer' : 'default' }} onClick={() => g.emptyView && wb.setView(g.emptyView)} title={g.empty}>
                          <span className="wb-tree-label" style={{ fontFamily: 'var(--wb-body)' }}>
                            none yet{g.empty ? ` · ${g.empty}` : ''}
                          </span>
                        </li>
                      )}
                      {g.items.map((it) => {
                        const sev = wb.worst[it.id]
                        return (
                          <li
                            key={it.id}
                            role="treeitem"
                            aria-level={2}
                            aria-selected={selectedId === it.id}
                            data-row={it.id}
                            data-testid={`tree-${it.id}`}
                            className={highlighted.has(it.id) ? 'wb-impact' : undefined}
                            tabIndex={tabStop === it.id ? 0 : -1}
                            onKeyDown={(e) => onKey(e, { id: it.id, level: 2, group: g, label: it.label })}
                            onFocus={() => setFocusId(it.id)}
                          >
                            <div className="wb-tree-row item" onClick={() => (select(it.id), setFocusId(it.id))}>
                              <span className={`wb-dot ${sev ?? (unfinished(it.sub) ? '' : 'ok')}`} aria-hidden />
                              <span className="wb-tree-label">
                                {it.label}
                                {it.sub && <span className="sub">{it.sub}</span>}
                              </span>
                              {sev && <span className="sr-only">, has {sev === 'error' ? 'errors' : sev === 'warning' ? 'warnings' : 'notes'}</span>}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
