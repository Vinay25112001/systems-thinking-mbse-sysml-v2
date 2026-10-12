// Bottom dock: Problems (rules engine; clicking a row selects the element and opens its view), Changes & impact
// (every model change with what it moved), Console (checker records, runs, exports).
import * as Tabs from '@radix-ui/react-tabs'
import { ChevronDown, ChevronUp, CircleCheck, History, ListChecks, Redo2, Terminal, Undo2 } from 'lucide-react'
import { useWorkbench, type DockTab } from '../context'
import { countBySeverity, SEVERITY_LABEL } from '../problems'
import { useSelection } from '../selection'
import { SeverityChip } from '../ui'
import { fmtTime } from '../format'

const shortId = (id: string) => id.replace(/^(boundary|var|loop):/, '')
const elementName = (id: string, label: string) => (label === id || label.startsWith(shortId(id)) ? label : `${shortId(id)} ${label}`)

function ProblemsTable() {
  const wb = useWorkbench()
  const { select, selectedId } = useSelection()
  if (!wb.problems.length)
    return (
      <div className="wb-empty ok">
        <CircleCheck size={16} aria-hidden />
        <p className="m-0">
          <strong>No problems.</strong> Every rule that applies this week passes. Rules run on every edit; anything that needs fixing appears here with a hint and a link to the element.
        </p>
      </div>
    )
  return (
    <table className="wb-table" data-testid="problems-table">
      <thead>
        <tr>
          <th scope="col" style={{ width: 92 }}>
            Severity
          </th>
          <th scope="col" style={{ width: 150 }}>
            Element
          </th>
          <th scope="col">Problem</th>
          <th scope="col">Hint</th>
        </tr>
      </thead>
      <tbody>
        {wb.problems.map((p, i) => {
          const go = () => p.elementId && select(p.elementId, { reveal: true, openView: true })
          return (
            <tr key={`${p.ruleId}-${p.elementId}-${i}`} className={`${p.elementId ? 'clickable' : ''} ${p.elementId && p.elementId === selectedId ? 'wb-row-selected' : ''}`} onClick={go}>
              <td>
                <SeverityChip s={p.severity} />
              </td>
              <td className="wb-mono">
                {p.elementId ? (
                  <button type="button" className="wb-link wb-mono" onClick={(e) => (e.stopPropagation(), go())} aria-label={`Select ${elementName(p.elementId, wb.labelOf(p.elementId))} (${SEVERITY_LABEL[p.severity]}: ${p.message})`}>
                    {shortId(p.elementId)}
                  </button>
                ) : (
                  '—'
                )}
              </td>
              <td>{p.message}</td>
              <td className="text-wb-muted">{p.hint}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function ChangesList() {
  const wb = useWorkbench()
  const { select } = useSelection()
  if (!wb.changes.length)
    return (
      <div className="wb-empty">
        <History size={16} aria-hidden />
        <p className="m-0">
          <strong>No changes yet in this session.</strong> Every edit to the model is listed here with what it moved: problems added or cleared, counts, and mission steps. <kbd className="wb-kbd">Ctrl+Z</kbd> undoes an edit.
        </p>
      </div>
    )
  return (
    <ol className="m-0 list-none p-0" data-testid="changes-list">
      {[...wb.changes].reverse().map((c) => {
        const i = c.impact
        return (
          <li key={c.id} className="border-b border-wb-line px-3 py-1.5 text-[12px]">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="wb-mono text-[11px] text-wb-muted">{fmtTime(c.at)}</span>
              <span className="font-medium">
                {c.ids.length
                  ? c.ids.map((id, k) => (
                      <span key={id}>
                        {k > 0 && ', '}
                        <button type="button" className="wb-link wb-mono" onClick={() => select(id, { reveal: true })}>
                          {id}
                        </button>
                      </span>
                    ))
                  : 'Derived state'}
              </span>
              <span className="text-wb-muted">{i.added.length ? 'added' : i.removed.length ? 'removed' : i.changed.length ? 'updated' : ''}</span>
              {c.op === 'undo' || c.op === 'redo' ? (
                <span className="wb-chip accent">
                  {c.op === 'undo' ? <Undo2 size={11} aria-hidden /> : <Redo2 size={11} aria-hidden />}
                  {c.op === 'undo' ? 'Undo' : 'Redo'} of change {c.of}
                </span>
              ) : (
                <span className="wb-mono text-[11px] text-wb-muted">#{c.id}</span>
              )}
            </div>
            <ul className="mt-0.5 mb-0 list-none space-y-0.5 p-0 pl-2">
              {i.problemsAdded.map((p, k) => (
                <li key={`a${k}`}>
                  <span className="text-wb-bad">+ problem</span> <SeverityChip s={p.severity} /> {p.message}
                </li>
              ))}
              {i.problemsCleared.map((p, k) => (
                <li key={`c${k}`}>
                  <span className="text-wb-ok">− cleared</span> {p.message}
                </li>
              ))}
              {i.metrics.map((m) => (
                <li key={m.label}>
                  <span className="text-wb-muted">{m.label}:</span> <span className="wb-mono wb-num">{m.before} → {m.after}</span>
                </li>
              ))}
              {i.stepsNowPassing.map((s) => (
                <li key={`p${s}`} className="text-wb-ok">
                  ✓ {s} now passes
                </li>
              ))}
              {i.stepsNowFailing.map((s) => (
                <li key={`f${s}`} className="text-wb-warn">
                  ✗ {s} no longer passes
                </li>
              ))}
            </ul>
          </li>
        )
      })}
    </ol>
  )
}

function ConsoleList() {
  const wb = useWorkbench()
  if (!wb.consoleLines.length)
    return (
      <div className="wb-empty">
        <Terminal size={16} aria-hidden />
        <p className="m-0">
          <strong>Nothing logged yet.</strong> Checker records, simulation runs and exports appear here.
        </p>
      </div>
    )
  return (
    <ol className="wb-mono m-0 list-none p-0 text-[11.5px]" data-testid="console" aria-live="polite">
      {wb.consoleLines.map((l) => (
        <li key={l.id} className="flex gap-3 border-b border-wb-line px-3 py-1">
          <span className="text-wb-muted">{fmtTime(l.at)}</span>
          <span className="w-14 text-wb-accent">{l.kind}</span>
          <span className="min-w-0 flex-1" style={{ fontFamily: 'var(--wb-body)' }}>
            {l.text}
          </span>
        </li>
      ))}
    </ol>
  )
}

/** `collapsed` / `onToggle` come from the layout (the dock folds to its tab strip); choosing a tab opens it. */
export function Dock({ collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  const wb = useWorkbench()
  const c = countBySeverity(wb.problems)
  return (
    <Tabs.Root value={wb.dockTab} onValueChange={(v) => wb.showDock(v as DockTab, { expand: true })} className="wb-pane" data-testid="dock" data-collapsed={collapsed || undefined}>
      <div className="wb-tabs">
      <Tabs.List className="flex min-w-0 flex-1" aria-label="Dock" onClick={() => collapsed && wb.showDock(wb.dockTab, { expand: true })}>
        <Tabs.Trigger value="problems" className="wb-tab">
          <ListChecks size={13} aria-hidden /> Problems
          <span className="wb-count">
            {c.error > 0 && <span className="text-wb-bad">{c.error}E </span>}
            {c.warning > 0 && <span className="text-wb-warn">{c.warning}W </span>}
            {c.info > 0 && <span>{c.info}i</span>}
            {wb.problems.length === 0 && '0'}
          </span>
        </Tabs.Trigger>
        <Tabs.Trigger value="changes" className="wb-tab">
          <History size={13} aria-hidden /> Changes &amp; impact <span className="wb-count">{wb.changes.length}</span>
        </Tabs.Trigger>
        <Tabs.Trigger value="console" className="wb-tab">
          <Terminal size={13} aria-hidden /> Console <span className="wb-count">{wb.consoleLines.length}</span>
        </Tabs.Trigger>
      </Tabs.List>
        {onToggle && (
          <button type="button" className="wb-btn ghost icon mr-1 self-center" aria-label={collapsed ? 'Expand the dock' : 'Collapse the dock'} aria-expanded={!collapsed} title={collapsed ? 'Expand the dock' : 'Collapse the dock'} onClick={onToggle}>
            {collapsed ? <ChevronUp size={14} aria-hidden /> : <ChevronDown size={14} aria-hidden />}
          </button>
        )}
      </div>
      <Tabs.Content value="problems" className="wb-scroll">
        <ProblemsTable />
      </Tabs.Content>
      <Tabs.Content value="changes" className="wb-scroll">
        <ChangesList />
      </Tabs.Content>
      <Tabs.Content value="console" className="wb-scroll">
        <ConsoleList />
      </Tabs.Content>
    </Tabs.Root>
  )
}
