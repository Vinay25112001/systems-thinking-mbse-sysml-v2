// Centre-view registry (WORKBENCH_SPEC §3). A converted week lists its views by id in its missions module; the
// components live here, so content modules never import React. WEEK_UI holds each converted week's model-browser,
// properties and impact hooks.
import { Activity, ClipboardList, Compass, FileText, ListChecks, Repeat, ScanLine, Users } from 'lucide-react'
import { lazy } from 'react'
import type { ViewDef, WeekUi } from './context'

// Each view is its own chunk (React.lazy), so /week/1 loads the charting library only for Dynamics, React Flow only
// for Causal loops and Stakeholders, and so on; the shell shows a skeleton while a view loads.
const DynamicsView = lazy(() => import('./week1/DynamicsView'))
const LoopsView = lazy(() => import('./week1/LoopsView'))
const BoundaryView = lazy(() => import('./week1/BoundaryView'))
const PrinciplesView = lazy(() => import('./week1/PrinciplesView'))
const StakeholdersView = lazy(() => import('./week1/StakeholdersView'))
const L1RecordView = lazy(() => import('./week1/L1RecordView').then((m) => ({ default: m.L1RecordView })))
const NeedsView = lazy(() => import('./week1/NeedsView'))
const TeamView = lazy(() => import('./week1/TeamView'))
import { Week1Properties } from './week1/Properties'
import { week1Entities, week1HomeView, week1LabelOf, week1Metrics, week1Tree } from './week1/tree'

export const VIEW_REGISTRY: Record<string, ViewDef> = {
  dynamics: { id: 'dynamics', title: 'Dynamics', icon: Activity, component: DynamicsView },
  loops: { id: 'loops', title: 'Causal loops', icon: Repeat, component: LoopsView },
  boundary: { id: 'boundary', title: 'Boundary & context', icon: ScanLine, component: BoundaryView },
  l1: { id: 'l1', title: 'L1 record', icon: FileText, component: L1RecordView },
  principles: { id: 'principles', title: 'Principles', icon: Compass, component: PrinciplesView },
  stakeholders: { id: 'stakeholders', title: 'Stakeholders', icon: Users, component: StakeholdersView },
  needs: { id: 'needs', title: 'Needs', icon: ListChecks, component: NeedsView },
  team: { id: 'team', title: 'Team enterprise', icon: ClipboardList, component: TeamView },
}

export const VIEW_IDS = new Set(Object.keys(VIEW_REGISTRY))

export const WEEK_UI: Record<number, WeekUi> = {
  1: { tree: week1Tree, homeView: week1HomeView, Properties: Week1Properties, entities: week1Entities, metrics: week1Metrics, labelOf: week1LabelOf },
}

/** Where a classic-page activity lives in the workbench (the Reference drawer links each activity to its view). */
export const ACTIVITY_VIEW: Record<string, string> = {
  'aerolink-dynamics': 'dynamics',
  'boundary-exercise': 'boundary',
  'principles-explorer': 'principles',
}
