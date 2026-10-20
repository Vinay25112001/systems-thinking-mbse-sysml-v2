// Composes the workbench state: problems (rules engine), missions (engine + persisted progress), signals, week
// artefacts, selection, changes & impact and the console. All persistence goes through usePersistentState (guarded
// localStorage), so the workbench works, without saving, when storage is unavailable.
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Signal, WorkbenchWeek } from '../content/missions/types'
import { usePersistentState } from '../lib/usePersistentState'
import { saveJSON } from '../lib/storage'
import { useApp } from '../state/AppState'
import { useWorkspace } from '../state/Workspace'
import { diffSnapshots, elementSignatures, isEmptyImpact, modelMetrics, shouldCoalesce, summarise, type ChangeRecord, type Snapshot } from './changes'
import { WorkbenchContext, type AssessTab, type ConsoleLine, type DockTab, type WeekState, type WeekUi, type Workbench } from './context'
import { EMPTY_PROGRESS, evaluateMission, progressOf, type MissionProgress, type ProgressStore } from './missions'
import { CORE_RULES, runRules, worstByElement } from './problems'
import { SelectionContext, type Selection } from './selection'
import { SignalPublishContext, SignalReadContext } from './signals'
import type { EngineeringModel } from '../model/engineering'
import type { MapState } from '../state/AppState'
import { useProjectState } from '../project/store/ProjectProvider'
import { toTeamRecord } from '../project/adapters/week1'
import { TEAM_KEY } from './week1/team'

const HISTORY = 30
const HIGHLIGHT_MS = 1600
type UiState = { view?: string; mission?: string; dock?: DockTab }
/** Everything a student edits in the workbench: what undo / redo restores. */
type Doc = { model: EngineeringModel; artefacts: Record<string, unknown>; boundary: Record<string, string>; map: Pick<MapState, 'stakeholders' | 'relationships'> }
type HistoryEntry = { id: number; summary: string; doc: Doc }
const UNDO_DEPTH = 50

export function WorkbenchProvider({ def, ui, children }: { def: WorkbenchWeek; ui: WeekUi; children: ReactNode }) {
  const week = def.week
  const app = useApp()
  const { model, replaceAll } = useWorkspace()
  const [artefacts, setArtefacts] = usePersistentState<Record<string, unknown>>('wb-artefacts', {})
  const [signals, setSignals] = usePersistentState<Record<string, Signal>>('mission-signals', {})
  const [progress, setProgress] = usePersistentState<ProgressStore>('mission-progress', {})
  const [uiState, setUiState] = usePersistentState<Record<number, UiState>>('wb-ui', {})
  const [consoleLines, setConsole] = useState<ConsoleLine[]>([])
  const [changes, setChanges] = useState<ChangeRecord[]>([])
  const [dockTick, setDockTick] = useState(0)
  const [hist, setHist] = useState<{ undo: string | null; redo: string | null }>({ undo: null, redo: null })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [highlighted, setHighlighted] = useState<ReadonlySet<string>>(new Set())
  const [revealTick, setRevealTick] = useState(0)
  const [reference, setReference] = useState<{ open: boolean; block?: string; tick: number }>({ open: false, tick: 0 })
  const [assessments, setAssessments] = useState<{ open: boolean; tab: AssessTab }>({ open: false, tab: 'recall' })
  const [storageOk] = useState(() => saveJSON('wb-probe', 1))
  const lineId = useRef(0)

  const mine = uiState[week] ?? {}
  const view = mine.view && def.views.includes(mine.view) ? mine.view : def.views[0]
  const missionId = mine.mission && def.missions.some((m) => m.id === mine.mission) ? mine.mission : def.missions[0].id
  const dockTab: DockTab = mine.dock ?? 'problems'
  const patchUi = useCallback((p: UiState) => setUiState((s) => ({ ...s, [week]: { ...(s[week] ?? {}), ...p } })), [setUiState, week])

  const log = useCallback((kind: ConsoleLine['kind'], text: string) => {
    lineId.current += 1
    const line = { id: lineId.current, at: Date.now(), kind, text }
    setConsole((c) => [...c.slice(-199), line])
  }, [])

  const describe = def.describeSignal
  const lastPublish = useRef<{ key: string; at: number } | null>(null)
  const signalsRef = useRef(signals)
  useEffect(() => {
    signalsRef.current = signals
  }, [signals])
  const publish = useCallback(
    (key: string, value: unknown) => {
      // re-publishing the persisted value (an activity restoring its state after a reload) is not a new fact
      if (signalsRef.current[key] && JSON.stringify(signalsRef.current[key].value) === JSON.stringify(value)) return
      const now = Date.now()
      // a burst (dragging a slider) is one run: replace the latest value instead of growing the history and console
      const burst = lastPublish.current?.key === key && now - lastPublish.current.at < 600
      lastPublish.current = { key, at: now }
      setSignals((s) => {
        const prev = s[key]
        const history = prev && !burst ? [...(prev.history ?? []), { value: prev.value, at: prev.at }].slice(-HISTORY) : (prev?.history ?? [])
        return { ...s, [key]: { value, at: now, history } }
      })
      const text = describe?.(key, value)
      if (!text) return
      const kind = key.includes('check') ? 'check' : 'run'
      if (burst) setConsole((c) => (c.length ? [...c.slice(0, -1), { ...c[c.length - 1], at: now, text }] : c))
      else log(kind, text)
    },
    [setSignals, describe, log],
  )

  const setArtefact = useCallback(
    <T,>(key: string, update: (prev: T | undefined) => T) => setArtefacts((a) => ({ ...a, [key]: update(a[key] as T | undefined) })),
    [setArtefacts],
  )

  // My Project (A22, P1): when a project exists, the Week 1 Team Record every reader in the workbench sees (missions,
  // problems, tree, properties) is the project's projection; the stored artefact is kept in sync (ProjectLegacyMirror
  // writes the same value) so this provider never writes back an older copy. Undo/redo here no longer covers the record:
  // its snapshot below leaves it out, and the project's own undo handles it.
  const projectState = useProjectState()
  const projectedTeam = useMemo(() => (week === 1 && projectState.doc ? toTeamRecord(projectState.doc) : null), [week, projectState.doc])
  const rawArtefacts = artefacts
  useEffect(() => {
    if (projectedTeam && JSON.stringify(rawArtefacts[TEAM_KEY]) !== JSON.stringify(projectedTeam)) setArtefacts((a) => ({ ...a, [TEAM_KEY]: projectedTeam }))
  }, [projectedTeam, rawArtefacts, setArtefacts])
  const viewArtefacts = useMemo(() => (projectedTeam ? { ...rawArtefacts, [TEAM_KEY]: projectedTeam } : rawArtefacts), [projectedTeam, rawArtefacts])
  const state: WeekState = useMemo(() => ({ model, artefacts: viewArtefacts, boundary: app.boundary, signals }), [model, viewArtefacts, app.boundary, signals])

  const rules = useMemo(() => [...CORE_RULES, ...def.rules], [def.rules])
  const problems = useMemo(
    () => runRules(rules, model, { week, artefacts: viewArtefacts, boundary: app.boundary, stakeholders: app.map.stakeholders, relationships: app.map.relationships }),
    [rules, model, week, viewArtefacts, app.boundary, app.map.stakeholders, app.map.relationships],
  )
  const worst = useMemo(() => worstByElement(problems), [problems])

  const ctx = useMemo(() => ({ model, signals, artefacts: viewArtefacts, boundary: app.boundary, quiz: app.quiz }), [model, signals, viewArtefacts, app.boundary, app.quiz])
  const evals = useMemo(() => def.missions.map((m) => evaluateMission(m, ctx, progressOf(progress, m.id))), [def.missions, ctx, progress])

  const updateProgress = useCallback(
    (id: string, f: (p: MissionProgress) => MissionProgress) => setProgress((s) => ({ ...s, [id]: f(s[id] ? { ...EMPTY_PROGRESS, ...s[id] } : EMPTY_PROGRESS) })),
    [setProgress],
  )

  // record completion once, and say so in the console
  useEffect(() => {
    for (const e of evals) {
      if (e.complete && !progress[e.mission.id]?.completedAt) {
        updateProgress(e.mission.id, (p) => ({ ...p, completedAt: Date.now() }))
        log('mission', `Mission complete: ${e.mission.title}`)
      }
    }
  }, [evals, progress, updateProgress, log])

  // ---------------------------------------------------------------- changes & impact
  const labelOf = useCallback((id: string) => ui.labelOf?.(id, state) ?? model.elements.find((e) => e.id === id)?.name ?? id, [ui, state, model])
  const snapshot: Snapshot = useMemo(() => {
    const steps: Record<string, boolean> = {}
    const stepLabels: Record<string, string> = {}
    evals.forEach((e, mi) =>
      e.steps.forEach((s) => {
        const k = `${e.mission.id}/${s.step.id}`
        steps[k] = s.ok
        // a single mission (the Week 1 lab tool shows the Team Record alone, sign-off Mo3) is named, not numbered
        stepLabels[k] = evals.length === 1 ? `${e.mission.short ?? e.mission.title}, part ${s.index + 1}` : `Mission ${mi + 1} step ${s.index + 1}`
      }),
    )
    return {
      entities: { ...elementSignatures(model), ...(ui.entities?.(projectedTeam ? { ...state, artefacts: Object.fromEntries(Object.entries(state.artefacts).filter(([k]) => k !== TEAM_KEY)) } : state) ?? {}) },
      problems,
      metrics: { ...modelMetrics(model), ...(ui.metrics?.(state) ?? {}) },
      steps,
      stepLabels,
    }
  }, [model, ui, state, problems, evals, projectedTeam])

  // ---------------------------------------------------------------- undo / redo over the change log
  const doc: Doc = useMemo(
    () => ({ model, artefacts, boundary: app.boundary, map: { stakeholders: app.map.stakeholders, relationships: app.map.relationships } }),
    [model, artefacts, app.boundary, app.map.stakeholders, app.map.relationships],
  )
  const prevSnap = useRef<Snapshot | null>(null)
  const prevDoc = useRef<Doc | null>(null)
  const changesRef = useRef<ChangeRecord[]>([])
  const undoStack = useRef<HistoryEntry[]>([])
  const redoStack = useRef<HistoryEntry[]>([])
  const pendingOp = useRef<{ op: 'undo' | 'redo'; of: number } | null>(null)
  const changeId = useRef(0)
  const syncHist = useCallback(() => {
    const u = undoStack.current[undoStack.current.length - 1]
    const r = redoStack.current[redoStack.current.length - 1]
    setHist({ undo: u?.summary ?? null, redo: r?.summary ?? null })
  }, [])
  const commitChanges = useCallback((next: ChangeRecord[]) => {
    changesRef.current = next
    setChanges(next)
  }, [])

  useEffect(() => {
    const before = prevSnap.current
    const beforeDoc = prevDoc.current
    prevSnap.current = snapshot
    prevDoc.current = doc
    const op = pendingOp.current
    pendingOp.current = null
    if (!before || !beforeDoc) return
    const impact = diffSnapshots(before, snapshot)
    if (isEmptyImpact(impact)) return
    const ids = [...impact.added, ...impact.changed, ...impact.removed]
    const now = Date.now()
    const list = changesRef.current
    const last = list[list.length - 1]
    if (op) {
      changeId.current += 1
      commitChanges([...list.slice(-99), { id: changeId.current, at: now, ids, summary: `${op.op === 'undo' ? 'Undo' : 'Redo'} of change ${op.of}: ${summarise(impact)}`, before, impact, op: op.op, of: op.of }])
    } else if (shouldCoalesce(last, ids, now, impact)) {
      const merged = diffSnapshots(last.before, snapshot)
      commitChanges([...list.slice(0, -1), { ...last, at: now, impact: merged, summary: summarise(merged) }])
      const top = undoStack.current[undoStack.current.length - 1]
      if (top?.id === last.id) top.summary = summarise(merged)
    } else {
      changeId.current += 1
      const rec: ChangeRecord = { id: changeId.current, at: now, ids, summary: summarise(impact), before, impact, op: 'edit' }
      commitChanges([...list.slice(-99), rec])
      // only edits to the model or the week's artefacts are undoable; derived changes (mission steps) are not
      if (ids.length) {
        undoStack.current = [...undoStack.current.slice(-(UNDO_DEPTH - 1)), { id: rec.id, summary: rec.summary, doc: beforeDoc }]
        redoStack.current = []
        syncHist()
      }
    }
    if (impact.affected.length) setHighlighted(new Set(impact.affected))
  }, [snapshot, doc, commitChanges, syncHist])

  const applyDoc = useCallback(
    (d: Doc) => {
      replaceAll(d.model)
      setArtefacts(d.artefacts)
      app.replaceBoundary(d.boundary)
      app.restoreMap(d.map)
    },
    [replaceAll, setArtefacts, app],
  )
  const undo = useCallback(() => {
    const top = undoStack.current.pop()
    if (!top || !prevDoc.current) return
    redoStack.current.push({ id: top.id, summary: top.summary, doc: prevDoc.current })
    pendingOp.current = { op: 'undo', of: top.id }
    applyDoc(top.doc)
    syncHist()
    log('info', `Undo: ${top.summary}`)
  }, [applyDoc, syncHist, log])
  const redo = useCallback(() => {
    const top = redoStack.current.pop()
    if (!top || !prevDoc.current) return
    undoStack.current.push({ id: top.id, summary: top.summary, doc: prevDoc.current })
    pendingOp.current = { op: 'redo', of: top.id }
    applyDoc(top.doc)
    syncHist()
    log('info', `Redo: ${top.summary}`)
  }, [applyDoc, syncHist, log])

  useEffect(() => {
    if (!highlighted.size) return
    const t = setTimeout(() => setHighlighted(new Set()), HIGHLIGHT_MS)
    return () => clearTimeout(t)
  }, [highlighted])

  const setView = useCallback((v: string) => patchUi({ view: v }), [patchUi])
  const select = useCallback<Selection['select']>(
    (id, opts) => {
      setSelectedId(id)
      if (opts?.reveal) setRevealTick((t) => t + 1)
      if (id && opts?.openView) {
        const home = ui.homeView(id)
        if (home && def.views.includes(home)) patchUi({ view: home })
      }
    },
    [ui, def.views, patchUi],
  )
  const selection = useMemo<Selection>(() => ({ selectedId, select, hovered, setHovered, highlighted, revealTick }), [selectedId, select, hovered, highlighted, revealTick])

  const value = useMemo<Workbench>(
    () => ({
      week, def, ui, state, problems, worst, setArtefact, evals, ctx, progress, updateProgress,
      missionId, setMissionId: (id: string) => patchUi({ mission: id }),
      view, setView,
      dockTab,
      showDock: (t: DockTab, opts?: { expand?: boolean }) => {
        patchUi({ dock: t })
        if (opts?.expand) setDockTick((n) => n + 1)
      },
      dockTick, undo, redo, undoLabel: hist.undo, redoLabel: hist.redo,
      changes, consoleLines, log,
      reference, openReference: (block?: string) => setReference((r) => ({ open: true, block, tick: r.tick + 1 })), closeReference: () => setReference((r) => ({ ...r, open: false })),
      assessments, openAssessments: (tab?: AssessTab) => setAssessments((a) => ({ open: true, tab: tab ?? a.tab })), closeAssessments: () => setAssessments((a) => ({ ...a, open: false })),
      storageOk, labelOf,
    }),
    [week, def, ui, state, problems, worst, setArtefact, evals, ctx, progress, updateProgress, missionId, patchUi, view, setView, dockTab, dockTick, undo, redo, hist, changes, consoleLines, log, reference, assessments, storageOk, labelOf],
  )

  return (
    <WorkbenchContext.Provider value={value}>
      <SelectionContext.Provider value={selection}>
        <SignalPublishContext.Provider value={publish}>
          <SignalReadContext.Provider value={signals}>{children}</SignalReadContext.Provider>
        </SignalPublishContext.Provider>
      </SelectionContext.Provider>
    </WorkbenchContext.Provider>
  )
}
