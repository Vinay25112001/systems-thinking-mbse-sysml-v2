// The Week 10 Session 2 lecture figure map (figure id -> title and component), kept apart from the figure components so
// that LectureWeek10S2.tsx exports components only (fast refresh; oxlint only-export-components). Re-exported by
// lectureWeek10Figures.ts, read by registry.ts. Review status: new-pending-review.
import type { ComponentType } from 'react'
import { BridgeFigure10, ChecklistCardFigure, CrossCheckFigure, DeliverablesFigure10, EntryDoFigure, FourLinksFigure, FunctionModeFigure, LabMapFigure, MappingFigure, ParallelRegionsFigure, PredictCardsFigure10, SevenDaysFigure10, StateAnatomyFigure, TransitionPartsFigure, UseCaseMapFigure } from './LectureWeek10S2'

type Entry = { title: string; C: ComponentType<{ alt: string }> }

export const WEEK10_S2_FIGURES: Record<string, Entry> = {
  'w10s2-function-mode': { title: 'A function and its operational mode', C: FunctionModeFigure },
  'w10s2-state-anatomy': { title: 'The anatomy of a state definition', C: StateAnatomyFigure },
  'w10s2-transition-parts': { title: 'The five parts of a transition', C: TransitionPartsFigure },
  'w10s2-entry-do': { title: 'Entry and do actions', C: EntryDoFigure },
  'w10s2-parallel-regions': { title: 'A parallel state and the forbidden transition', C: ParallelRegionsFigure },
  'w10s2-four-links': { title: 'Four links from behavior to structure', C: FourLinksFigure },
  'w10s2-predict-cards': { title: 'Predict the checker on three state listings', C: PredictCardsFigure10 },
  'w10s2-usecase-map': { title: 'The five AeroLink scenarios as use cases', C: UseCaseMapFigure },
  'w10s2-cross-check': { title: 'Cross-checking the flow and the states', C: CrossCheckFigure },
  'w10s2-checklist-card': { title: 'The behavior review checklist', C: ChecklistCardFigure },
  'w10s2-mapping': { title: 'From the Phase I package to model v0.3', C: MappingFigure },
  'w10s2-bridge': { title: 'Where the logical architecture goes next', C: BridgeFigure10 },
  'w10s2-deliverables': { title: 'Lab L10 deliverables', C: DeliverablesFigure10 },
  'w10s2-lab-map': { title: 'In class: map one scenario', C: LabMapFigure },
  'w10s2-seven-days': { title: 'The next seven days', C: SevenDaysFigure10 },
}
