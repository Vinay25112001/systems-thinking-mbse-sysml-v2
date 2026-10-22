// The Week 10 Session 1 drawn-figure map (figure id -> title and component), kept apart from the figure components so
// that LectureWeek10S1.tsx exports components only (fast refresh; oxlint only-export-components). Re-exported by
// lectureWeek10Figures.ts and read by registry.ts. Review status: new-pending-review.
import type { ComponentType } from 'react'
import { AllocMatrixFigure, CheckerTableFigure10, DecideMergeFigure, ExitCardFigure10, FunctionChainFigure, GapCardFigure, GuardNumberLineFigure, ImportLanesFigure10, PitfallCardFigure, PredictCardFigure10, ThenShorthandFigure, ThreeLinksFigure, ThreePanelsFigure, TwoViewsFigure, WeekBandFigure10 } from './LectureWeek10S1'

type Entry = { title: string; C: ComponentType<{ alt: string }> }

export const WEEK10_S1_FIGURES: Record<string, Entry> = {
  'w10s1-week-band': { title: 'Week 10 fills the Logical and Behavior packages', C: WeekBandFigure10 },
  'w10s1-gap-card': { title: 'A dispatch decision to vote on', C: GapCardFigure },
  'w10s1-import-lanes': { title: 'What Week 10 imports', C: ImportLanesFigure10 },
  'w10s1-two-views': { title: 'The logical and the physical view', C: TwoViewsFigure },
  'w10s1-three-panels': { title: 'Three views of a logical architecture', C: ThreePanelsFigure },
  'w10s1-function-chain': { title: 'Functions and the items they pass', C: FunctionChainFigure },
  'w10s1-pitfall-card': { title: 'Pitfalls and proven practices', C: PitfallCardFigure },
  'w10s1-alloc-matrix': { title: 'Requirements allocated to functions', C: AllocMatrixFigure },
  'w10s1-three-links': { title: 'Flow, succession and succession flow', C: ThreeLinksFigure },
  'w10s1-then-shorthand': { title: 'The then shorthand', C: ThenShorthandFigure },
  'w10s1-decide-merge': { title: 'A decision and a merge', C: DecideMergeFigure },
  'w10s1-guard-number-line': { title: 'Guards: a gap and an overlap', C: GuardNumberLineFigure },
  'w10s1-predict-card': { title: 'Predict the checker', C: PredictCardFigure10 },
  'w10s1-checker-table': { title: 'What the checker rejects and accepts', C: CheckerTableFigure10 },
  'w10s1-exit-card': { title: 'Exit card', C: ExitCardFigure10 },
}
