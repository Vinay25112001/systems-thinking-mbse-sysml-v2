// The Week 8 lecture figure maps (figure id -> title and component), kept apart from the figure components so that
// LectureWeek8S1.tsx and LectureWeek8S2.tsx export components only (fast refresh; oxlint only-export-components).
// Read by registry.ts. Review status: new-pending-review.
import type { ComponentType } from 'react'
import { AllPartsFigure, BalanceFigure, ChairFigure, CheckerRunFigure, DefUsageChargerFigure, DocsVsModelFigure, ExitTicketFigure, FourLayersFigure, ModelViewsFigure, NinePlacesFigure, OwnershipTreeFigure, PredictCardsFigure, SymbolTreeFigure, SyntaxSemanticsFigure, ThreeModelsFigure, TwoLanesFigure, TwoNotationsFigure, WeekBandFigure } from './LectureWeek8S1'
import { AuditChecklistFigure, BridgeFigure, DecidesColumnsFigure, DeliverablesFigure, LabToolStepsFigure, MappingArrowsFigure, PackageSkeletonFigure, PackageTreeFigure, SevenDaysFigure, ToolchainFlowFigure } from './LectureWeek8S2'

export const WEEK8_S1_FIGURES: Record<string, { title: string; C: ComponentType<{ alt: string }> }> = {
  'w8s1-week-band': { title: 'From the Week 7 package to model v0.1', C: WeekBandFigure },
  'w8s1-nine-places': { title: 'One number, nine places', C: NinePlacesFigure },
  'w8s1-two-lanes': { title: 'Phase I documents, Phase II model', C: TwoLanesFigure },
  'w8s1-three-models': { title: 'Three selective models of one aircraft', C: ThreeModelsFigure },
  'w8s1-syntax-semantics': { title: 'Syntax, semantics and what a tool checks', C: SyntaxSemanticsFigure },
  'w8s1-docs-vs-model': { title: 'Documents kept in step versus one model', C: DocsVsModelFigure },
  'w8s1-balance': { title: 'What MBSE buys, and what it costs', C: BalanceFigure },
  'w8s1-chair': { title: 'Model quality is not design quality', C: ChairFigure },
  'w8s1-model-views': { title: 'One model, several views', C: ModelViewsFigure },
  'w8s1-two-notations': { title: 'Graphical and textual notation', C: TwoNotationsFigure },
  'w8s1-four-layers': { title: 'The four-layer language architecture', C: FourLayersFigure },
  'w8s1-ownership-tree': { title: 'Elements, relationships, ownership', C: OwnershipTreeFigure },
  'w8s1-all-parts': { title: 'Everything with structure and behavior is a part', C: AllPartsFigure },
  'w8s1-def-usage-charger': { title: 'Definition, usages and instances', C: DefUsageChargerFigure },
  'w8s1-symbol-tree': { title: 'One symbol, two meanings', C: SymbolTreeFigure },
  'w8s1-predict-cards': { title: 'Predict the checker', C: PredictCardsFigure },
  'w8s1-checker-run': { title: 'Running the course checker', C: CheckerRunFigure },
  'w8s1-exit-ticket': { title: 'Exit ticket and tool proof', C: ExitTicketFigure },
}
export const WEEK8_S2_FIGURES: Record<string, { title: string; C: ComponentType<{ alt: string }> }> = {
  'w8s2-package-tree': { title: 'Packages and qualified names', C: PackageTreeFigure },
  'w8s2-toolchain-flow': { title: 'The course toolchain', C: ToolchainFlowFigure },
  'w8s2-decides-columns': { title: 'What the checker decides, and what you decide', C: DecidesColumnsFigure },
  'w8s2-mapping-arrows': { title: 'The import is a mapping, not a copy', C: MappingArrowsFigure },
  'w8s2-package-skeleton': { title: 'The model v0.1 package skeleton', C: PackageSkeletonFigure },
  'w8s2-audit-checklist': { title: 'Auditing the AeroLink import', C: AuditChecklistFigure },
  'w8s2-bridge': { title: 'Where the concerns go next', C: BridgeFigure },
  'w8s2-deliverables': { title: 'Lab L8 deliverables', C: DeliverablesFigure },
  'w8s2-lab-tool-steps': { title: 'The lab tool in four steps', C: LabToolStepsFigure },
  'w8s2-seven-days': { title: 'The next seven days', C: SevenDaysFigure },
}
