// The AeroLink Workbench shell (WORKBENCH_SPEC §2; Practice stage of the week flow). The mission brief is the primary
// guide and runs down the LEFT; the centre shows the view the current mission step needs (other views stay one click
// away, quieter); the dock (Problems, Changes & impact, Console) folds to its tab strip under the centre view and opens
// when something needs attention; the model browser and properties share the right column. Panels resize
// (react-resizable-panels) and remember the viewer's sizes. Keyboard: F6 / Shift+F6 cycle regions, `?` shows
// shortcuts, `/` searches the model, Ctrl+Z / Ctrl+Shift+Z undo and redo model edits, Esc closes drawers.
// Breakpoints: >= 1280 px full layout; 1024–1279 the model browser and properties open as an overlay drawer from the
// rail; < 1024 one region at a time with a panel switcher.
import * as Tabs from '@radix-ui/react-tabs'
import { IS_STUDENT_EDITION } from '../lib/edition' // week1-m4a
import * as Tooltip from '@radix-ui/react-tooltip'
import { BookOpen, Boxes, ChevronDown, ChevronUp, ClipboardCheck, Download, Gauge, Map as MapIcon, Play, Redo2, Settings2, SlidersHorizontal, Target, Undo2, X } from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Group, Panel, Separator, useDefaultLayout, usePanelRef, type LayoutStorage, type PanelImperativeHandle } from 'react-resizable-panels'
import { SurfaceContext } from '../components/surface'
import { WEEKS, weekByNumber } from '../content/course'
import { hasWorkbench, workbenchWeek } from '../content/missions'
import { Link, navigate } from '../lib/router'
import { STORAGE_PREFIX } from '../lib/storage'
import { useApp, type ThemePref } from '../state/AppState'
import { useWorkspace } from '../state/Workspace'
import { useWorkbench, type Workbench } from './context'
import { countBySeverity, problemKey } from './problems'
import { ShortcutsDialog } from './shell/Dialogs'
import { Dock } from './shell/Dock'
import { downloadText } from './download'
import { MissionBrief } from './shell/MissionBrief'
import { ModelBrowser } from './shell/ModelBrowser'
import { PropertiesPanel } from './shell/PropertiesPanel'
import { StatusBar } from './shell/StatusBar'
import { useSelection } from './selection'
import { PanelHeader, Tip } from './ui'
import { VIEW_REGISTRY, WEEK_UI } from './views'
import { WorkbenchProvider } from './WorkbenchProvider'
import { cycleRegion } from './regions'
import { PracticeBar } from './shell/PracticeBar'
import { usePracticeLinks } from './learnLink'

// Drawers and dialogs that read every week's content load on first open (code split; WORKBENCH_SPEC §7.17).
const ReferenceDrawer = lazy(() => import('./shell/ReferenceDrawer'))
const AssessmentsPanel = lazy(() => import('./shell/AssessmentsPanel'))
const CourseMapDialog = lazy(() => import('./shell/CourseMapDialog'))

/** Panel layouts persist through the app's guarded storage (works, without saving, when storage is blocked). */
const layoutStorage: LayoutStorage = {
  getItem: (k) => {
    try {
      return window.localStorage.getItem(STORAGE_PREFIX + 'layout:' + k)
    } catch {
      return null
    }
  },
  setItem: (k, v) => {
    try {
      window.localStorage.setItem(STORAGE_PREFIX + 'layout:' + k, v)
    } catch {
      /* storage unavailable */
    }
  },
}

/** Only sizes the viewer chose are remembered; auto-expanding the dock or folding Properties is never saved. */
const useLayout = (id: string, panelIds?: string[]) => useDefaultLayout({ id, storage: layoutStorage, panelIds, onlySaveAfterUserInteractions: true })

/** The dock's tab strip (32 px + its border) and the compact height it opens to. */
const DOCK_COLLAPSED_PX = 33
const DOCK_OPEN_PX = 150
const DOCK_PEEK_MS = 5000
const HEADER_PX = 33

type Breakpoint = 'wide' | 'medium' | 'narrow'
function useBreakpoint(): Breakpoint {
  const get = (): Breakpoint => {
    const w = typeof window === 'undefined' ? 1440 : window.innerWidth
    return w >= 1280 ? 'wide' : w >= 1024 ? 'medium' : 'narrow'
  }
  const [bp, setBp] = useState<Breakpoint>(get)
  useEffect(() => {
    const on = () => setBp(get())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return bp
}

const focusRegion = (r: string) => requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-wb-region="${r}"]`)?.focus())

/** Text fields keep the browser's own undo; everywhere else Ctrl+Z undoes the last model edit. */
function isTextField(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null
  if (!el) return false
  if (el.isContentEditable || el.tagName === 'TEXTAREA') return true
  return el.tagName === 'INPUT' && !['checkbox', 'radio', 'range', 'button', 'submit', 'reset', 'file', 'color'].includes((el as HTMLInputElement).type)
}

function Region({ name, label, children, className = '' }: { name: string; label: string; children: ReactNode; className?: string }) {
  return (
    <section className={`wb-region h-full min-h-0 min-w-0 ${className}`} data-wb-region={name} data-wb-always-visible="true" tabIndex={-1} aria-label={label}>
      {children}
    </section>
  )
}

// ------------------------------------------------------------------------------------------------ top bar

/** Theme, instructor mode and the shortcut list: a disclosure (it holds form controls, so it is not a menu). */
function SettingsMenu({ onShortcuts }: { onShortcuts: () => void }) {
  const { theme, setTheme, instructor, setInstructor } = useApp()
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      if (wrap.current?.contains(document.activeElement)) button.current?.focus()
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  return (
    <div className="relative" ref={wrap}>
      <Tip label="Settings: theme, instructor mode, shortcuts">
        <button ref={button} type="button" className="wb-btn ghost" aria-expanded={open} aria-controls="wb-settings" onClick={() => setOpen((o) => !o)}>
          <Settings2 size={14} aria-hidden /> Settings
        </button>
      </Tip>
      {open && (
        <div
          id="wb-settings"
          className="wb-popover"
          role="group"
          aria-label="Settings"
        >
          <label className="row">
            <span>Color theme</span>
            <select aria-label="Color theme" className="wb-select" value={theme} onChange={(e) => setTheme(e.target.value as ThemePref)}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          {/* week1-m4a: no instructor checkbox in the student edition (NAV-02, X14) */}
          {!IS_STUDENT_EDITION && (
            <label className="row cursor-pointer">
              <span className={instructor ? 'font-semibold text-wb-warn' : ''}>Instructor review mode</span>
              <input type="checkbox" checked={instructor} onChange={(e) => setInstructor(e.target.checked)} />
            </label>
          )}
          <hr />
          <button
            type="button"
            className="row w-full cursor-pointer border-0 bg-transparent text-left text-wb-fg"
            onClick={() => {
              setOpen(false)
              onShortcuts()
            }}
          >
            <span>Keyboard shortcuts</span>
            <kbd className="wb-kbd">?</kbd>
          </button>
        </div>
      )}
    </div>
  )
}

function TopBar({ onShortcuts, embedded = false }: { onShortcuts: () => void; embedded?: boolean }) {
  const wb = useWorkbench()
  const { instructor } = useApp()
  const { model } = useWorkspace()
  const w = weekByNumber(wb.week)!
  const mission = wb.evals.find((e) => e.mission.id === wb.missionId)?.mission
  const brand = usePracticeLinks()?.brand
  const weekTitle = `Week ${w.number} — ${w.title}`
  const runChecks = () => {
    const c = countBySeverity(wb.problems)
    const passing = wb.evals.reduce((a, e) => a + e.done, 0)
    const total = wb.evals.reduce((a, e) => a + e.total, 0)
    wb.log('check', `Checks run: ${c.error} errors, ${c.warning} warnings, ${c.info} notes; mission steps passing ${passing}/${total}`)
    wb.showDock('problems', { expand: true })
    focusRegion('dock')
  }
  const exportAll = () => {
    // practice only: the team's Week 1 record (w1.team) is not part of the practice export; it is exported from My Project
    // or the lab tool (architecture §6.6, change C9)
    const practiceArtefacts = Object.fromEntries(Object.entries(wb.state.artefacts).filter(([k]) => k !== 'w1.team' && k !== 'w1.team.previous'))
    const data = { exported: new Date().toISOString(), week: wb.week, note: 'Practice workbench export. All AeroLink values are FICTIONAL.', model, artefacts: practiceArtefacts, missionProgress: wb.progress }
    const ok = downloadText(`aerolink-week${wb.week}-workbench.json`, JSON.stringify(data, null, 2), 'application/json')
    wb.log('export', ok ? `Exported the Week ${wb.week} workbench state (model, artefacts, mission progress)` : 'Export failed: downloads are blocked in this browser')
  }
  return (
    <header className="wb-topbar wb-region" data-wb-region="topbar" data-wb-always-visible="true" tabIndex={-1} aria-label="Top bar">
      {embedded ? (
        <span className="wb-brand">{brand ?? 'Practice workbench'}</span>
      ) : (
        <Link to="/" className="wb-brand no-underline" style={{ color: 'inherit' }} aria-label="Practice workbench — dashboard">
          Practice workbench
        </Link>
      )}
      <Tip label={mission ? `${weekTitle} ▸ ${mission.title}` : weekTitle}>
        <span className="wb-crumb min-w-0 flex-1" data-testid="breadcrumb">
          <span className="wb-hide-medium flex-none">{mission?.kind === 'own' ? 'Studio · your team’s enterprise' : 'AeroLink worked example'}</span>
          <span className="sep wb-hide-medium" aria-hidden>
            ▸
          </span>
          <h1 title={weekTitle}>{weekTitle}</h1>
          {mission && (
            <>
              <span className="sep wb-hide-medium" aria-hidden>
                ▸
              </span>
              <span className="mission wb-hide-medium" title={mission.title}>
                {mission.title}
              </span>
            </>
          )}
        </span>
      </Tip>
      <div className="wb-btn-group" role="group" aria-label="Edit">
        <Tip label={wb.undoLabel ? `Undo: ${wb.undoLabel} (Ctrl+Z)` : 'Nothing to undo'}>
          <button type="button" className="wb-btn ghost icon" aria-label={wb.undoLabel ? `Undo: ${wb.undoLabel}` : 'Undo'} disabled={!wb.undoLabel} onClick={wb.undo} data-testid="undo">
            <Undo2 size={14} aria-hidden />
          </button>
        </Tip>
        <Tip label={wb.redoLabel ? `Redo: ${wb.redoLabel} (Ctrl+Shift+Z)` : 'Nothing to redo'}>
          <button type="button" className="wb-btn ghost icon" aria-label={wb.redoLabel ? `Redo: ${wb.redoLabel}` : 'Redo'} disabled={!wb.redoLabel} onClick={wb.redo} data-testid="redo">
            <Redo2 size={14} aria-hidden />
          </button>
        </Tip>
      </div>
      <div className="wb-btn-group" role="group" aria-label="Checks and export">
        <button type="button" className="wb-btn primary" onClick={runChecks}>
          <Play size={12} aria-hidden /> Run checks
        </button>
        {!brand && (
          <button type="button" className="wb-btn" onClick={exportAll} aria-label="Export">
            <Download size={12} aria-hidden /> <span className="wb-hide-medium">Export</span>
          </button>
        )}
      </div>
      {embedded ? (
        <div className="wb-btn-group">
          {!IS_STUDENT_EDITION && instructor && <span className="wb-chip warn">Instructor mode</span>}
          <button type="button" className="wb-btn ghost" onClick={onShortcuts}>
            Shortcuts <kbd className="wb-kbd">?</kbd>
          </button>
        </div>
      ) : (
      <div className="wb-btn-group">
        <label className="flex items-center">
          <span className="sr-only">Switch week</span>
          <select className="wb-select mono" value={wb.week} onChange={(e) => navigate(`/week/${e.target.value}`)} aria-label="Switch week">
            {WEEKS.map((x) => (
              <option key={x.number} value={x.number}>
                Week {x.number}
                {hasWorkbench(x.number) ? ' · workbench' : ''}
              </option>
            ))}
          </select>
        </label>
        <Link to={`/week/${wb.week}/classic`} className="wb-link whitespace-nowrap">
          Classic page
        </Link>
        {!IS_STUDENT_EDITION && instructor && <span className="wb-chip warn">Instructor mode</span>}
        <SettingsMenu onShortcuts={onShortcuts} />
      </div>
      )}
    </header>
  )
}

function RailButton({ label, icon, onClick, pressed }: { label: string; icon: ReactNode; onClick: () => void; pressed?: boolean }) {
  return (
    <Tip label={label} side="right">
      <button type="button" className="wb-rail-btn" aria-label={label} aria-pressed={pressed} onClick={onClick} data-rail={label}>
        {icon}
      </button>
    </Tip>
  )
}

function Rail({ bp, drawerOpen, toggleDrawer, onCourseMap }: { bp: Breakpoint; drawerOpen: boolean; toggleDrawer: () => void; onCourseMap: () => void }) {
  const wb = useWorkbench()
  return (
    <nav className="wb-rail wb-region" data-wb-region="rail" data-wb-always-visible="true" tabIndex={-1} aria-label="Workbench tools">
      <RailButton label="Missions" icon={<Target size={18} aria-hidden />} onClick={() => focusRegion('brief')} />
      <RailButton
        label={bp === 'medium' ? (drawerOpen ? 'Hide model browser' : 'Show model browser') : 'Model browser'}
        icon={<Boxes size={18} aria-hidden />}
        pressed={bp === 'medium' ? drawerOpen : undefined}
        onClick={() => (bp === 'medium' ? toggleDrawer() : focusRegion('browser'))}
      />
      <RailButton label="Reference (lesson)" icon={<BookOpen size={18} aria-hidden />} pressed={wb.reference.open} onClick={() => (wb.reference.open ? wb.closeReference() : wb.openReference())} />
      <RailButton label="Assessments" icon={<ClipboardCheck size={18} aria-hidden />} onClick={() => wb.openAssessments()} />
      <RailButton label="Progress" icon={<Gauge size={18} aria-hidden />} onClick={() => navigate('/progress')} />
      <RailButton label="Course map" icon={<MapIcon size={18} aria-hidden />} onClick={onCourseMap} />
    </nav>
  )
}

// ------------------------------------------------------------------------------------------------ centre views

function ViewSkeleton() {
  return (
    <div className="wb-skel" role="status" aria-label="Loading the view">
      <span style={{ width: '62%' }} />
      <span style={{ width: '38%' }} />
      <span className="block" />
      <span style={{ width: '54%' }} />
    </div>
  )
}

/** The view the active mission's current step needs (undefined when the mission is complete or the step has none). */
function stepViewOf(wb: Workbench): string | undefined {
  const e = wb.evals.find((x) => x.mission.id === wb.missionId) ?? wb.evals[0]
  const v = e.steps[e.current]?.step.view
  return v && wb.def.views.includes(v) ? v : undefined
}

function CentreViews() {
  const wb = useWorkbench()
  const stepView = stepViewOf(wb)
  // views stay mounted once visited, so an activity keeps its state while the student switches tabs
  const [visited, setVisited] = useState<string[]>([wb.view])
  if (!visited.includes(wb.view)) setVisited([...visited, wb.view])

  // follow the mission: when the current step moves on to one that needs another view, open it
  const e = wb.evals.find((x) => x.mission.id === wb.missionId) ?? wb.evals[0]
  const stepKey = `${e.mission.id}:${e.current}`
  const lastStep = useRef(stepKey)
  useEffect(() => {
    if (lastStep.current === stepKey) return
    lastStep.current = stepKey
    if (stepView && stepView !== wb.view) wb.setView(stepView)
  }, [stepKey, stepView, wb])

  const primary = [...new Set([stepView, wb.view].filter((v): v is string => !!v))]
  const others = wb.def.views.filter((v) => !primary.includes(v))
  return (
    <Tabs.Root value={wb.view} onValueChange={wb.setView} className="wb-pane" data-testid="centre">
      <div className="wb-tabs">
        <Tabs.List className="flex min-w-0" aria-label="Center views">
          {primary.map((id) => {
            const v = VIEW_REGISTRY[id]
            const Icon = v.icon
            return (
              <Tabs.Trigger key={id} value={id} className="wb-tab">
                <Icon size={13} aria-hidden /> {v.title}
                {id === stepView && (
                  <span className="wb-tab-badge">
                    <span className="sr-only">, needed for the </span>current step
                  </span>
                )}
              </Tabs.Trigger>
            )
          })}
        </Tabs.List>
        <span className="wb-tabs-sep" aria-hidden />
        {others.length > 0 && (
          <>
            <span className="wb-tabs-label" aria-hidden>
              Other views
            </span>
            <Tabs.List className="flex flex-none" aria-label="Other views">
              {others.map((id) => {
                const v = VIEW_REGISTRY[id]
                const Icon = v.icon
                return (
                  <Tip key={id} label={v.title}>
                    <Tabs.Trigger value={id} className="wb-tab secondary" aria-label={v.title}>
                      <Icon size={15} aria-hidden />
                    </Tabs.Trigger>
                  </Tip>
                )
              })}
            </Tabs.List>
          </>
        )}
      </div>
      <div className="wb-canvas min-h-0 flex-1">
        <SurfaceContext.Provider value="workbench">
          {wb.def.views
            .filter((id) => visited.includes(id) || id === wb.view)
            .map((id) => {
              const C = VIEW_REGISTRY[id].component
              return (
                <Tabs.Content key={id} value={id} forceMount className="relative h-full overflow-auto data-[state=inactive]:hidden">
                  <Suspense fallback={<ViewSkeleton />}>
                    <C />
                  </Suspense>
                </Tabs.Content>
              )
            })}
        </SurfaceContext.Provider>
      </div>
    </Tabs.Root>
  )
}

function Sep({ label }: { label: string }) {
  return <Separator className="wb-sep" aria-label={label} />
}

// ------------------------------------------------------------------------------------------------ dock controller

/**
 * The dock folds to its tab strip by default and opens to a compact height when something needs attention: a new
 * problem opens it on Problems (and it stays open); a new model edit, while the dock is folded, opens it on Changes &
 * impact for a few seconds and folds it again unless the viewer touched it. Sizes the viewer drags are remembered;
 * these automatic moves are not. Growth is animated only without reduced motion.
 */
function useDockController(dock: RefObject<PanelImperativeHandle | null>, group: RefObject<HTMLDivElement | null>, hasSavedLayout: boolean) {
  const wb = useWorkbench()
  const wbRef = useRef(wb)
  useEffect(() => {
    wbRef.current = wb
  })
  const [collapsed, setCollapsed] = useState(!hasSavedLayout)
  const touched = useRef(false)
  const peek = useRef<ReturnType<typeof setTimeout> | null>(null)

  const animate = () => {
    const g = group.current
    if (!g) return
    g.classList.add('wb-animate-panels')
    setTimeout(() => g.classList.remove('wb-animate-panels'), 220)
  }
  const open = useCallback(() => {
    const p = dock.current
    if (!p) return
    animate()
    if (p.isCollapsed()) p.expand()
    if (p.getSize().inPixels < DOCK_OPEN_PX - 2) p.resize(DOCK_OPEN_PX)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const fold = useCallback(() => {
    animate()
    dock.current?.collapse()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const cancelPeek = () => {
    if (peek.current) clearTimeout(peek.current)
    peek.current = null
  }

  // folded on a first visit (no size the viewer chose)
  useEffect(() => {
    if (!hasSavedLayout) dock.current?.collapse()
    return cancelPeek
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // explicit requests: Run checks, the status bar, choosing a dock tab
  const seenTick = useRef(wb.dockTick)
  useEffect(() => {
    if (wb.dockTick === seenTick.current) return
    seenTick.current = wb.dockTick
    cancelPeek()
    open()
  }, [wb.dockTick, open])

  // a new problem: open on Problems
  const keys = wb.problems.map(problemKey).join('|')
  const prevKeys = useRef(new Set(wb.problems.map(problemKey)))
  useEffect(() => {
    const now = new Set(keys ? keys.split('|') : [])
    const fresh = [...now].some((k) => !prevKeys.current.has(k))
    prevKeys.current = now
    if (!fresh) return
    cancelPeek()
    wbRef.current.showDock('problems')
    open()
  }, [keys, open])

  // a new model edit while folded: peek on Changes & impact
  const last = wb.changes[wb.changes.length - 1]
  const lastId = last?.id ?? 0
  const seenChange = useRef(lastId)
  useEffect(() => {
    if (lastId === seenChange.current) return
    seenChange.current = lastId
    const p = dock.current
    if (!last?.ids.length || !p || !p.isCollapsed()) return
    const back = wbRef.current.dockTab
    touched.current = false
    wbRef.current.showDock('changes')
    open()
    cancelPeek()
    peek.current = setTimeout(() => {
      peek.current = null
      if (touched.current) return
      fold()
      wbRef.current.showDock(back)
    }, DOCK_PEEK_MS)
  }, [lastId, last, open, fold, dock])

  return {
    collapsed,
    onResize: (px: number) => setCollapsed(px <= DOCK_COLLAPSED_PX + 2),
    toggle: () => {
      cancelPeek()
      if (dock.current?.isCollapsed()) open()
      else fold()
    },
    onInteract: () => {
      touched.current = true
    },
  }
}

/** Centre view over the dock (shared by the wide and medium layouts). */
function CentreColumn() {
  const dock = usePanelRef()
  const group = useRef<HTMLDivElement>(null)
  const layout = useLayout('wb2-centre')
  const ctl = useDockController(dock, group, !!layout.defaultLayout)
  return (
    <Group orientation="vertical" id="wb2-centre" elementRef={group} defaultLayout={layout.defaultLayout} onLayoutChanged={layout.onLayoutChanged}>
      <Panel id="wbp-view" minSize="30%">
        <Region name="view" label="Center view">
          <CentreViews />
        </Region>
      </Panel>
      <Sep label="Resize dock" />
      <Panel id="wbp-dock" panelRef={dock} defaultSize={DOCK_OPEN_PX} minSize={96} collapsible collapsedSize={DOCK_COLLAPSED_PX} onResize={(s) => ctl.onResize(s.inPixels)}>
        <div className="h-full" onPointerDown={ctl.onInteract} onFocusCapture={ctl.onInteract}>
          <Region name="dock" label="Dock: problems, changes and console">
            <Dock collapsed={ctl.collapsed} onToggle={ctl.toggle} />
          </Region>
        </div>
      </Panel>
    </Group>
  )
}

// ------------------------------------------------------------------------------------------------ brief, side column

function BriefPane() {
  const wb = useWorkbench()
  const done = wb.evals.filter((x) => x.complete).length
  const partsLabel = usePracticeLinks()?.partsLabel
  const parts = wb.evals.length === 1 ? partsLabel : undefined
  const partsDone = wb.evals[0]?.done ?? 0
  const partsTotal = wb.evals[0]?.total ?? 0
  return (
    <Region name="brief" label="Mission brief">
      <div className="wb-pane bg-wb-sunk">
        <PanelHeader title={parts ? parts : 'Mission brief'} icon={<Target size={13} aria-hidden />}>
          <span className="wb-count">{parts ? `${partsDone}/${partsTotal} steps` : `${done}/${wb.evals.length} missions`}</span>
        </PanelHeader>
        <div className="wb-scroll">
          <MissionBrief />
        </div>
      </div>
    </Region>
  )
}

/** Properties: folded to a one-line hint while nothing is selected; opens when an element is selected. */
function PropertiesHeader({ collapsed, onToggle }: { collapsed: boolean; onToggle?: () => void }) {
  const { selectedId } = useSelection()
  const wb = useWorkbench()
  return (
    <PanelHeader title="Properties" icon={<SlidersHorizontal size={13} aria-hidden />}>
      {selectedId ? (
        <span className="wb-ph-hint wb-mono">{wb.labelOf(selectedId) === selectedId ? selectedId : `${selectedId.replace(/^(boundary|var|loop):/, '')} · ${wb.labelOf(selectedId)}`}</span>
      ) : (
        <span className="wb-ph-hint">Nothing selected: choose an element in the model browser, a view or Problems</span>
      )}
      <span className="wb-sp" />
      {onToggle && (
        <button type="button" className="wb-btn ghost icon" aria-label={collapsed ? 'Expand properties' : 'Collapse properties'} aria-expanded={!collapsed} onClick={onToggle}>
          {collapsed ? <ChevronUp size={13} aria-hidden /> : <ChevronDown size={13} aria-hidden />}
        </button>
      )}
    </PanelHeader>
  )
}

function SideColumn() {
  const props = usePanelRef()
  const { selectedId } = useSelection()
  const [collapsed, setCollapsed] = useState(!selectedId)
  // follow the selection during render as well: the panel library reports sizes only after layout, which may never
  // come (jsdom, a hidden tab), and the content must not stay hidden once something is selected
  const [prevSelected, setPrevSelected] = useState(selectedId)
  if (prevSelected !== selectedId) {
    setPrevSelected(selectedId)
    setCollapsed(!selectedId)
  }
  const layout = useLayout('wb2-side')
  useEffect(() => {
    const p = props.current
    if (!p) return
    if (selectedId && p.isCollapsed()) p.expand()
    else if (!selectedId && !p.isCollapsed()) p.collapse()
  }, [selectedId, props])
  return (
    <Group orientation="vertical" id="wb2-side" defaultLayout={layout.defaultLayout} onLayoutChanged={layout.onLayoutChanged}>
      <Panel id="wbp-browser" minSize="25%">
        <Region name="browser" label="Model browser">
          <ModelBrowser />
        </Region>
      </Panel>
      <Sep label="Resize model browser and properties" />
      <Panel id="wbp-props" panelRef={props} defaultSize="48%" minSize="20%" collapsible collapsedSize={HEADER_PX} onResize={(s) => setCollapsed(s.inPixels <= HEADER_PX + 2)}>
        <Region name="properties" label="Properties">
          <div className="wb-pane">
            <PropertiesHeader collapsed={collapsed} onToggle={() => (props.current?.isCollapsed() ? props.current.expand() : props.current?.collapse())} />
            <div className="wb-scroll" hidden={collapsed}>
              <PropertiesPanel />
            </div>
          </div>
        </Region>
      </Panel>
    </Group>
  )
}

// ------------------------------------------------------------------------------------------------ layouts

function WideLayout() {
  const main = useLayout('wb2-main')
  return (
    <Group orientation="horizontal" id="wb2-main" className="min-w-0 flex-1" defaultLayout={main.defaultLayout} onLayoutChanged={main.onLayoutChanged}>
      <Panel id="wbp-brief" defaultSize="28%" minSize={300} maxSize="42%">
        <BriefPane />
      </Panel>
      <Sep label="Resize mission brief" />
      <Panel id="wbp-centre" minSize="34%">
        <CentreColumn />
      </Panel>
      <Sep label="Resize model browser column" />
      <Panel id="wbp-side" defaultSize="21%" minSize={230} maxSize="34%">
        <SideColumn />
      </Panel>
    </Group>
  )
}

/** 1024–1279 px: brief and centre side by side; the model browser and properties open over the centre from the rail. */
function MediumLayout({ drawerOpen, closeDrawer }: { drawerOpen: boolean; closeDrawer: () => void }) {
  const main = useLayout('wb2-main-medium')
  const { selectedId } = useSelection()
  const drawer = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!drawerOpen) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (!drawer.current?.contains(t) && !t.closest('[data-rail]') && !t.closest('[role="dialog"]')) closeDrawer()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [drawerOpen, closeDrawer])
  return (
    <>
      <Group orientation="horizontal" id="wb2-main-medium" className="min-w-0 flex-1" defaultLayout={main.defaultLayout} onLayoutChanged={main.onLayoutChanged}>
        <Panel id="wbp-brief" defaultSize="40%" minSize={300} maxSize="50%">
          <BriefPane />
        </Panel>
        <Sep label="Resize mission brief" />
        <Panel id="wbp-centre" minSize="40%">
          <CentreColumn />
        </Panel>
      </Group>
      {drawerOpen && (
        <aside className="wb-browser-drawer" ref={drawer} aria-label="Model browser and properties" data-testid="browser-drawer">
          <div className="flex min-h-0 flex-1 flex-col">
            <Region name="browser" label="Model browser">
              <ModelBrowser
                headerExtra={
                  <button type="button" className="wb-btn ghost icon" aria-label="Close the model browser" onClick={closeDrawer}>
                    <X size={14} aria-hidden />
                  </button>
                }
              />
            </Region>
          </div>
          <div className={`flex min-h-0 flex-col border-t border-wb-line ${selectedId ? 'max-h-[55%] flex-1' : 'flex-none'}`}>
            <Region name="properties" label="Properties">
              <div className="wb-pane">
                <PropertiesHeader collapsed={!selectedId} />
                {selectedId && (
                  <div className="wb-scroll">
                    <PropertiesPanel />
                  </div>
                )}
              </div>
            </Region>
          </div>
        </aside>
      )}
    </>
  )
}

const NARROW_TABS = [
  { id: 'brief', label: 'Mission' },
  { id: 'view', label: 'View' },
  { id: 'browser', label: 'Model' },
  { id: 'properties', label: 'Properties' },
  { id: 'dock', label: 'Problems' },
] as const

function NarrowLayout() {
  const [tab, setTab] = useState<(typeof NARROW_TABS)[number]['id']>('brief')
  return (
    <Tabs.Root value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex min-w-0 flex-1 flex-col">
      <Tabs.List className="wb-tabs" aria-label="Workbench panels">
        {NARROW_TABS.map((t) => (
          <Tabs.Trigger key={t.id} value={t.id} className="wb-tab">
            {t.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <div className="min-h-0 flex-1">
        <Tabs.Content value="brief" className="h-full">
          <Region name="brief" label="Mission brief">
            <div className="wb-pane bg-wb-sunk">
              <div className="wb-scroll">
                <MissionBrief />
              </div>
            </div>
          </Region>
        </Tabs.Content>
        <Tabs.Content value="view" className="h-full">
          <Region name="view" label="Center view">
            <CentreViews />
          </Region>
        </Tabs.Content>
        <Tabs.Content value="browser" className="h-full">
          <Region name="browser" label="Model browser">
            <ModelBrowser />
          </Region>
        </Tabs.Content>
        <Tabs.Content value="properties" className="h-full">
          <Region name="properties" label="Properties">
            <div className="wb-pane">
              <div className="wb-scroll">
                <PropertiesPanel />
              </div>
            </div>
          </Region>
        </Tabs.Content>
        <Tabs.Content value="dock" className="h-full">
          <Region name="dock" label="Dock: problems, changes and console">
            <Dock />
          </Region>
        </Tabs.Content>
      </div>
    </Tabs.Root>
  )
}

function DrawerSkeleton() {
  return (
    <div className="wb-drawer" role="status" aria-label="Loading">
      <div className="wb-ph" style={{ height: 40 }} />
      <ViewSkeleton />
    </div>
  )
}

function ShellBody({ embedded = false }: { embedded?: boolean }) {
  const wb = useWorkbench()
  const { instructor } = useApp()
  const { selectedId, revealTick } = useSelection()
  const bp = useBreakpoint()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [shortcuts, setShortcuts] = useState(false)
  const [courseMap, setCourseMap] = useState(false)
  // lazy drawers mount on first use and then stay mounted (their state survives closing)
  const [mounted, setMounted] = useState({ reference: false, assessments: false, courseMap: false })
  if (wb.reference.open && !mounted.reference) setMounted((m) => ({ ...m, reference: true }))
  if (wb.assessments.open && !mounted.assessments) setMounted((m) => ({ ...m, assessments: true }))
  if (courseMap && !mounted.courseMap) setMounted((m) => ({ ...m, courseMap: true }))

  // medium layout: revealing an element (a problem, a mission step) opens the drawer that shows it
  const [seenReveal, setSeenReveal] = useState(revealTick)
  if (revealTick !== seenReveal) {
    setSeenReveal(revealTick)
    if (bp === 'medium' && selectedId) setDrawerOpen(true)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      const typing = !!t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))
      const mod = e.ctrlKey || e.metaKey
      if (e.key === 'F6') {
        e.preventDefault()
        cycleRegion(document, e.shiftKey)
      } else if (mod && !e.altKey && (e.key === 'z' || e.key === 'Z' || e.key === 'y' || e.key === 'Y') && !isTextField(t) && !document.querySelector('[role="dialog"][aria-modal="true"]')) {
        e.preventDefault()
        if (e.key.toLowerCase() === 'y' || e.shiftKey) wb.redo()
        else wb.undo()
      } else if (e.key === '?' && !typing && !mod && !e.altKey) {
        e.preventDefault()
        setShortcuts(true)
      } else if (e.key === '/' && !typing && !mod) {
        const s = document.querySelector<HTMLInputElement>('[data-wb-search]')
        if (s) {
          e.preventDefault()
          s.focus()
        }
      } else if (e.key === 'Escape' && !document.querySelector('[role="dialog"][aria-modal="true"]')) {
        if (drawerOpen) {
          setDrawerOpen(false)
          document.querySelector<HTMLElement>('[data-rail="Hide model browser"],[data-rail="Show model browser"]')?.focus()
        } else if (wb.reference.open) wb.closeReference()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [wb, drawerOpen])

  return (
    <div className={`wb-root${embedded ? ' wb-embedded' : ''}`} data-testid="workbench">
      <a href="#wb-main-region" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-wb-panel focus:px-3 focus:py-2" onClick={(e) => (e.preventDefault(), focusRegion('view'))}>
        Skip to the center view
      </a>
      <TopBar onShortcuts={() => setShortcuts(true)} embedded={embedded} />
      {embedded && <PracticeBar />}
      {!IS_STUDENT_EDITION && instructor && !embedded && (
        <div className="flex-none border-b border-wb-line bg-wb-warn-soft px-3 py-1 text-[12px] text-wb-warn" role="status">
          Instructor review mode: provenance, review controls and instructor notes (Assessments) are visible. Reviews are stored in this browser only.
        </div>
      )}
      <div className="relative flex min-h-0 flex-1" id="wb-main-region">
        <Rail bp={bp} drawerOpen={drawerOpen} toggleDrawer={() => setDrawerOpen((o) => !o)} onCourseMap={() => setCourseMap(true)} />
        {bp === 'narrow' ? <NarrowLayout /> : bp === 'medium' ? <MediumLayout drawerOpen={drawerOpen} closeDrawer={() => setDrawerOpen(false)} /> : <WideLayout />}
      </div>
      <StatusBar />
      {mounted.reference && (
        <Suspense fallback={<DrawerSkeleton />}>
          <ReferenceDrawer />
        </Suspense>
      )}
      {mounted.assessments && (
        <Suspense fallback={<DrawerSkeleton />}>
          <AssessmentsPanel />
        </Suspense>
      )}
      {mounted.courseMap && (
        <Suspense fallback={null}>
          <CourseMapDialog open={courseMap} onOpenChange={setCourseMap} current={wb.week} />
        </Suspense>
      )}
      <ShortcutsDialog open={shortcuts} onOpenChange={setShortcuts} />
    </div>
  )
}

/** `embedded`: the shell is the Practice stage of a book-style week; the flow's own top bar carries the brand, theme,
 *  instructor mode and week navigation, so the shell drops them and fills its parent instead of the viewport. */
export function WorkbenchShell({ week, embedded = false }: { week: number; embedded?: boolean }) {
  const all = workbenchWeek(week)
  const ui0 = WEEK_UI[week]
  // the lecture-first path shows only the missions its page is for (sign-off Mo3: the lab tool shows the Team Record)
  const links = usePracticeLinks()
  const only = links?.missions
  const def0 = useMemo(() => {
    if (!all || !only) return all
    const missions = all.missions.filter((m) => only.includes(m.id))
    return missions.length ? { ...all, missions } : all
  }, [all, only])
  // week1-m5 (audit M2): the lab tool hides the AeroLink rehearsal views, tree groups and rules
  const views = links?.views
  const hideRules = links?.hideRules
  const hideGroups = links?.hideTreeGroups
  const def = useMemo(() => {
    if (!def0) return def0
    const v = views ? def0.views.filter((x) => views.includes(x)) : def0.views
    return { ...def0, views: v.length ? v : def0.views, rules: hideRules ? def0.rules.filter((r) => !hideRules.includes(r.id)) : def0.rules }
  }, [def0, views, hideRules])
  const ui = useMemo(() => (ui0 && hideGroups ? { ...ui0, tree: (s: Parameters<typeof ui0.tree>[0]) => ui0.tree(s).filter((g) => !hideGroups.includes(g.id)) } : ui0), [ui0, hideGroups])
  const ok = useMemo(() => !!def && !!ui, [def, ui])
  if (!ok) return <p>Week {week} is not converted to the workbench.</p>
  return (
    <Tooltip.Provider delayDuration={350}>
      <WorkbenchProvider def={def!} ui={ui!}>
        <ShellBody embedded={embedded} />
      </WorkbenchProvider>
    </Tooltip.Provider>
  )
}

export default WorkbenchShell
