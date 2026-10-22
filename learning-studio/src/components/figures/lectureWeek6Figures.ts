// The Week 6 lecture figure maps (figure id -> title and component), kept apart from the figure components so that
// LectureWeek6S1.tsx and LectureWeek6S2.tsx export components only (fast refresh; oxlint only-export-components).
// Read by registry.ts. Review status: new-pending-review.
import type { ComponentType } from 'react'
import {
  ApproachesFigure, AsIsToBeFigure, BackwardPlanFigure, DrivingQuestionW6Figure, GapChartFigure, HorizonBoardFigure, OffRampFigure, PlanColumnsFigure, PlanningLoopFigure, PortfolioFigure, TechExerciseFigure, TechTableFigure, TrajectoryFigure,
  TrlLadderFigure, TwoApproachesFigure, UnknownsRecordFigure, WhereW6Figure,
} from './LectureWeek6S1'
import {
  BaselineW6Figure, ForwardW6Figure, FullRoadmapFigure, ImpactTreeFigure, Increment1Figure, Increments23Figure, LabWorksheetW6Figure, RoadmapGridFigure, RunningServiceFigure, SevenDaysW6Figure, SrEvolutionFigure, ThreeCirclesFigure,
  TransitionBarFigure, VeeEntryFigure,
} from './LectureWeek6S2'

export const WEEK6_S1_FIGURES: Record<string, { title: string; C: ComponentType<{ alt: string }> }> = {
  'w6s1-driving-question': { title: 'After the Year-2 decision, which branch next?', C: DrivingQuestionW6Figure },
  'w6s1-where': { title: 'Where Week 6 sits', C: WhereW6Figure },
  'w6s1-trajectory': { title: 'Baseline and desired capability trajectories', C: TrajectoryFigure },
  'w6s1-gap-chart': { title: 'Desired and baseline capability over three horizons', C: GapChartFigure },
  'w6s1-portfolio': { title: 'From a gap to a portfolio of changes', C: PortfolioFigure },
  'w6s1-as-is-to-be': { title: 'As is, to be, and the path between them', C: AsIsToBeFigure },
  'w6s1-approaches': { title: 'Development approaches and the enterprise roadmap', C: ApproachesFigure },
  'w6s1-two-approaches': { title: 'Two ways to define increments', C: TwoApproachesFigure },
  'w6s1-off-ramp': { title: 'An off-ramp to mature technology', C: OffRampFigure },
  'w6s1-planning-loop': { title: 'What drives and informs a technology plan', C: PlanningLoopFigure },
  'w6s1-plan-columns': { title: 'The columns of a technology plan', C: PlanColumnsFigure },
  'w6s1-backward-plan': { title: 'Planning backward from the end state', C: BackwardPlanFigure },
  'w6s1-trl-ladder': { title: 'What a TRL rates, and what it does not', C: TrlLadderFigure },
  'w6s1-technology-exercise': { title: 'AeroLink’s technology candidates, to classify', C: TechExerciseFigure },
  'w6s1-technology-table': { title: 'AeroLink’s technology plan', C: TechTableFigure },
  'w6s1-unknowns-record': { title: 'The known-unknowns record', C: UnknownsRecordFigure },
  'w6s1-horizon-board': { title: 'Six changes to place on the horizons', C: HorizonBoardFigure },
}

export const WEEK6_S2_FIGURES: Record<string, { title: string; C: ComponentType<{ alt: string }> }> = {
  'w6s2-transition-bar': { title: 'Transition as a process', C: TransitionBarFigure },
  'w6s2-three-circles': { title: 'When to insert a technology', C: ThreeCirclesFigure },
  'w6s2-running-service': { title: 'Changing a service while it runs', C: RunningServiceFigure },
  'w6s2-vee-entry': { title: 'Where a modification enters the Vee', C: VeeEntryFigure },
  'w6s2-sr-evolution': { title: 'Security and resilience across increments', C: SrEvolutionFigure },
  'w6s2-roadmap-grid': { title: 'The roadmap grid', C: RoadmapGridFigure },
  'w6s2-baseline': { title: 'AeroLink’s baseline trajectory', C: BaselineW6Figure },
  'w6s2-increment-1': { title: 'The committed Year-2 step and its transition order', C: Increment1Figure },
  'w6s2-increments-2-3': { title: 'Increments 1 to 3', C: Increments23Figure },
  'w6s2-full-roadmap': { title: 'AeroLink’s roadmap', C: FullRoadmapFigure },
  'w6s2-impact-tree': { title: 'The impact of Increment 3, by week', C: ImpactTreeFigure },
  'w6s2-forward': { title: 'From the roadmap to Weeks 7, 13 and 14', C: ForwardW6Figure },
  'w6s2-lab-worksheet': { title: 'The in-class worksheet', C: LabWorksheetW6Figure },
  'w6s2-seven-days': { title: 'The next seven days', C: SevenDaysW6Figure },
}
