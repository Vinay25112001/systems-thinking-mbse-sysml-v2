// The Week 7 lecture figure maps (figure id -> title and component), kept apart from the figure components so that
// LectureWeek7S1.tsx and LectureWeek7S2.tsx export components only (fast refresh; oxlint only-export-components).
// Read by registry.ts. Review status: new-pending-review.
import type { ComponentType } from 'react'
import { CoverageFigure, DispositionsFigure, ExecSkeletonFigure, PackageTabsFigure, ReviewFlowFigure, RolesFigure, ThreadFigure, TraceLadderFigure, WhereW7Figure } from './LectureWeek7S1'
import { ArgumentFigure, DefendFigure, DispositionFlowFigure, ExecBriefFigure, ReviewTimelineFigure, RidFormFigure } from './LectureWeek7S2'

export const WEEK7_S1_FIGURES: Record<string, { title: string; C: ComponentType<{ alt: string }> }> = {
  'w7s1-where': { title: 'Where Week 7 sits', C: WhereW7Figure },
  'w7s1-package-tabs': { title: 'The sections of the package', C: PackageTabsFigure },
  'w7s1-exec-skeleton': { title: 'The executive summary skeleton', C: ExecSkeletonFigure },
  'w7s1-trace-ladder': { title: 'The audit’s trace ladder', C: TraceLadderFigure },
  'w7s1-dispositions': { title: 'Three ways out of a finding', C: DispositionsFigure },
  'w7s1-thread': { title: 'One AeroLink thread, end to end', C: ThreadFigure },
  'w7s1-coverage': { title: 'AeroLink’s coverage and dispositions', C: CoverageFigure },
  'w7s1-review-flow': { title: 'Prepare, conduct, complete', C: ReviewFlowFigure },
  'w7s1-roles': { title: 'Review roles', C: RolesFigure },
}

export const WEEK7_S2_FIGURES: Record<string, { title: string; C: ComponentType<{ alt: string }> }> = {
  'w7s2-argument': { title: 'The structure of an engineering argument', C: ArgumentFigure },
  'w7s2-exec-brief': { title: 'One briefing, two depths', C: ExecBriefFigure },
  'w7s2-rid-form': { title: 'The RID form', C: RidFormFigure },
  'w7s2-disposition-flow': { title: 'Accept, defer or reject', C: DispositionFlowFigure },
  'w7s2-defend': { title: 'Four RIDs against the AeroLink package', C: DefendFigure },
  'w7s2-review-timeline': { title: 'The review block', C: ReviewTimelineFigure },
}
