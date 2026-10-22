// The Week 9 lecture figure maps (figure id -> title and component, and listing figure id -> listing key), kept apart
// from the figure components so that LectureWeek9S1.tsx and LectureWeek9S2.tsx export components only (fast refresh;
// oxlint only-export-components). Read by registry.ts. Review status: new-pending-review.
import type { ComponentType } from 'react'
import { CheckerTableFigure, DeclarationFigure, DefUsagesFigure, ExitCardFigure9, FrameFigure9, GroupsFigure, ImportLanesFigure, LadderFigure, NeedToReqFigure, ParamSlotsFigure, SatisfyPreviewFigure, SubjectFigure, TableVsModelFigure, ThreadFigure, TruthTableFigure, TwoCardsFigure, WeekBandFigure9 } from './LectureWeek9S1'
import { AiFunnelFigure, BridgeFigure9, ChainFigure, DeliverablesFigure9, LabChainFigure, PredictCardsFigure9, SevenDaysFigure9, ToolStepsFigure9, TraceFragmentFigure, TwoQuestionsFigure } from './LectureWeek9S2'

type Entry = { title: string; C: ComponentType<{ alt: string }> }

export const WEEK9_S1_FIGURES: Record<string, Entry> = {
  'w9s1-week-band': { title: 'Week 9 fills the Needs and Requirements packages', C: WeekBandFigure9 },
  'w9s1-two-cards': { title: 'One requirement, two models', C: TwoCardsFigure },
  'w9s1-import-lanes': { title: 'What Week 9 imports', C: ImportLanesFigure },
  'w9s1-need-to-req': { title: 'From need to requirement', C: NeedToReqFigure },
  'w9s1-table-vs-model': { title: 'A table row and a model element', C: TableVsModelFigure },
  'w9s1-def-usages': { title: 'One definition, three usages', C: DefUsagesFigure },
  'w9s1-subject': { title: 'The subject and what conforms to it', C: SubjectFigure },
  'w9s1-declaration': { title: 'A requirement declaration in four parts', C: DeclarationFigure },
  'w9s1-truth-table': { title: 'Assume and require as an implication', C: TruthTableFigure },
  'w9s1-param-slots': { title: 'Subject, actor and stakeholder parameters', C: ParamSlotsFigure },
  'w9s1-frame': { title: 'A need frames the concern it answers', C: FrameFigure9 },
  'w9s1-groups': { title: 'Two kinds of requirement group', C: GroupsFigure },
  'w9s1-ladder': { title: 'Relationships by what they claim', C: LadderFigure },
  'w9s1-thread': { title: 'The course trace pattern on AeroLink', C: ThreadFigure },
  'w9s1-satisfy-preview': { title: 'Derivation, satisfy and verify', C: SatisfyPreviewFigure },
  'w9s1-checker-table': { title: 'What the checker rejects and accepts', C: CheckerTableFigure },
  'w9s1-exit-card': { title: 'Exit card', C: ExitCardFigure9 },
}
export const WEEK9_S2_FIGURES: Record<string, Entry> = {
  'w9s2-two-questions': { title: 'Requirement verification and validation', C: TwoQuestionsFigure },
  'w9s2-chain': { title: 'A derivation chain and its rationale', C: ChainFigure },
  'w9s2-trace-fragment': { title: 'A fragment of the AeroLink trace matrix', C: TraceFragmentFigure },
  'w9s2-predict-cards': { title: 'Predict the checker', C: PredictCardsFigure9 },
  'w9s2-ai-funnel': { title: 'AI findings as candidates', C: AiFunnelFigure },
  'w9s2-tool-steps': { title: 'The Week 9 lab tool in four steps', C: ToolStepsFigure9 },
  'w9s2-bridge': { title: 'Where requirements go next', C: BridgeFigure9 },
  'w9s2-deliverables': { title: 'Lab L9 deliverables', C: DeliverablesFigure9 },
  'w9s2-lab-chain': { title: 'In class: one chain end to end', C: LabChainFigure },
  'w9s2-seven-days': { title: 'The next seven days', C: SevenDaysFigure9 },
}
/** The listing figures of both sessions: figure id → listing key (src/content/lectures/week09/listings.ts). */
export const WEEK9_LISTING_FIGURES: Record<string, string> = {
  'w9s1-listing-anatomy': 'anatomy',
  'w9s1-listing-team-a-b': 'team-a-b',
  'w9s1-listing-need-004': 'need-004',
  'w9s1-listing-latency': 'latency',
  'w9s1-listing-metadata': 'metadata',
  'w9s1-listing-derivation': 'derivation',
  'w9s2-listing-warmup': 'warmup',
  'w9s2-listing-worked-stk': 'worked-stk',
  'w9s2-listing-tbd': 'tbd',
  'w9s2-listing-still-air': 'still-air',
}
