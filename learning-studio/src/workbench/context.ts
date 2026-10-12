// The workbench context: everything the shell regions share. Kept apart from the provider so views and regions can
// import the hook without an import cycle through the view registry.
import { createContext, useContext, type ComponentType } from 'react'
import type { MissionCtx, Signal, WorkbenchWeek } from '../content/missions/types'
import type { EngineeringModel } from '../model/engineering'
import type { ChangeRecord } from './changes'
import type { MissionEval, MissionProgress, ProgressStore } from './missions'
import type { Problem, Severity } from './problems'

export type TreeItem = { id: string; label: string; sub?: string; kind: string }
/** `empty`: what to do when the group has no items yet; `emptyView`: the centre view where that happens. */
export type TreeGroup = { id: string; label: string; items: TreeItem[]; empty?: string; emptyView?: string }

export type WeekState = {
  model: EngineeringModel
  artefacts: Record<string, unknown>
  boundary: Record<string, string>
  signals: Record<string, Signal>
}

/** The UI half of a converted week (the data half is src/content/missions/weekNN.ts). */
export type WeekUi = {
  tree: (s: WeekState) => TreeGroup[]
  /** Centre view that shows an element best (opened when a problem is selected). */
  homeView: (id: string) => string | undefined
  /** Week-specific properties form; return null for ids the shell's generic form handles. */
  Properties?: ComponentType<{ id: string }>
  /** Week-specific entity signatures and metrics for the impact diff. */
  entities?: (s: WeekState) => Record<string, string>
  metrics?: (s: WeekState) => Record<string, number>
  /** Label shown for an element id in problems and impact lists. */
  labelOf?: (id: string, s: WeekState) => string | undefined
}

export type ViewDef = { id: string; title: string; icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>; component: ComponentType }

export type ConsoleLine = { id: number; at: number; kind: 'run' | 'check' | 'export' | 'mission' | 'info'; text: string }
export type DockTab = 'problems' | 'changes' | 'console'
export type AssessTab = 'recall' | 'lab' | 'assignment' | 'workload' | 'instructor'

export type Workbench = {
  week: number
  def: WorkbenchWeek
  ui: WeekUi
  state: WeekState
  problems: Problem[]
  worst: Record<string, Severity>
  setArtefact: <T>(key: string, update: (prev: T | undefined) => T) => void
  evals: MissionEval[]
  ctx: Omit<MissionCtx, 'answers'>
  progress: ProgressStore
  updateProgress: (missionId: string, f: (p: MissionProgress) => MissionProgress) => void
  missionId: string
  setMissionId: (id: string) => void
  view: string
  setView: (id: string) => void
  dockTab: DockTab
  /** Switches the dock tab; `{ expand: true }` also opens the dock if it is collapsed. */
  showDock: (tab: DockTab, opts?: { expand?: boolean }) => void
  /** Incremented whenever a caller asks the dock to open (the layout expands it). */
  dockTick: number
  /** Undo / redo over the Changes & impact log (workspace edits only). The label names the change. */
  undo: () => void
  redo: () => void
  undoLabel: string | null
  redoLabel: string | null
  changes: ChangeRecord[]
  consoleLines: ConsoleLine[]
  log: (kind: ConsoleLine['kind'], text: string) => void
  reference: { open: boolean; block?: string; tick: number }
  openReference: (block?: string) => void
  closeReference: () => void
  assessments: { open: boolean; tab: AssessTab }
  openAssessments: (tab?: AssessTab) => void
  closeAssessments: () => void
  storageOk: boolean
  labelOf: (id: string) => string
}

export const WorkbenchContext = createContext<Workbench | null>(null)

export function useWorkbench(): Workbench {
  const v = useContext(WorkbenchContext)
  if (!v) throw new Error('useWorkbench must be used inside WorkbenchProvider')
  return v
}

export function useOptionalWorkbench(): Workbench | null {
  return useContext(WorkbenchContext)
}
