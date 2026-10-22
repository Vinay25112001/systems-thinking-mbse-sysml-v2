// The Week 11 Session 1 drawn-figure map (figure id -> title and component), kept apart from the figure components so
// that LectureWeek11S1.tsx exports components only (fast refresh; oxlint only-export-components). Re-exported by
// lectureWeek11Figures.ts and read by registry.ts. Review status: new-pending-review.
import type { ComponentType } from 'react'
import { AllocMatrixFigure11, CheckerTableFigure11, ConjugateFigure, CrossingsTableFigure, DesignPropertyFigure, ElementsInterfacesFigure, ExitCardFigure11, ImportLanesFigure11, LayersFigure, MatchingFigure, PitfallCardFigure11, PortAnatomyFigure, PredictCardFigure11, SplitAllocationFigure, TwoPortsCardFigure, WeekBandFigure11 } from './LectureWeek11S1'

type Entry = { title: string; C: ComponentType<{ alt: string }> }

export const WEEK11_S1_FIGURES: Record<string, Entry> = {
  'w11s1-week-band': { title: 'Week 11 fills the Physical package', C: WeekBandFigure11 },
  'w11s1-two-ports-card': { title: 'Two ports to vote on', C: TwoPortsCardFigure },
  'w11s1-import-lanes': { title: 'What Week 11 imports', C: ImportLanesFigure11 },
  'w11s1-elements-interfaces': { title: 'Elements and the interfaces that bind them', C: ElementsInterfacesFigure },
  'w11s1-layers': { title: 'An element and its components', C: LayersFigure },
  'w11s1-split-allocation': { title: 'One logical element, two physical homes', C: SplitAllocationFigure },
  'w11s1-pitfall-card': { title: 'Physical-architecture pitfalls and practices', C: PitfallCardFigure11 },
  'w11s1-alloc-matrix': { title: 'Logical elements allocated to physical elements', C: AllocMatrixFigure11 },
  'w11s1-design-property': { title: 'A design property and its requirement', C: DesignPropertyFigure },
  'w11s1-port-anatomy': { title: 'A port definition and a port', C: PortAnatomyFigure },
  'w11s1-matching': { title: 'When two ports match', C: MatchingFigure },
  'w11s1-conjugate': { title: 'A port definition and its conjugate', C: ConjugateFigure },
  'w11s1-crossings-table': { title: 'What crosses the charging interface', C: CrossingsTableFigure },
  'w11s1-predict-card': { title: 'Predict the checker', C: PredictCardFigure11 },
  'w11s1-checker-table': { title: 'What the checker rejects and accepts', C: CheckerTableFigure11 },
  'w11s1-exit-card': { title: 'Exit card', C: ExitCardFigure11 },
}
