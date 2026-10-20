// The Week 5 lecture figure maps (figure id -> title and component), kept apart from the figure components so that
// LectureWeek5S1.tsx and LectureWeek5S2.tsx export components only (fast refresh; oxlint only-export-components).
// Read by registry.ts. Review status: new-pending-review.
import type { ComponentType } from 'react'
import {
  AnswerFigure, BreakdownWbsFigure, CardsFigure, CrossingFigure, DrivingQuestionW5Figure, ExternalHiddenFigure, InterfaceFigure, InterfaceReqsFigure, LayersFigure, LogicalPhysicalFigure, ModularityFigure, N2TeachingFigure, ReadingN2Figure, SystemElementFigure, TableFigure, TypingFigure, WhereW5Figure, WorkedBreakdownFigure, WorkedDefinitionsFigure, WorkedN2Figure,
} from './LectureWeek5S1'
import { AuditFigure, ChangeControlFigure, CouplingFigure, DegradedFigure, FeedsW5Figure, GovernanceFigure, IntegrationFigure, LabN2Figure, ProtectionFigure, StandardsFigure, TrustBoundariesFigure, WhyManageFigure, WorkedSecurityFigure } from './LectureWeek5S2'

export const WEEK5_S1_FIGURES: Record<string, { title: string; C: ComponentType<{ alt: string }> }> = {
  'w5s1-driving-question': { title: 'How do the pad incident records reach the evidence log?', C: DrivingQuestionW5Figure },
  'w5s1-where': { title: 'Where Week 5 sits', C: WhereW5Figure },
  'w5s1-system-element': { title: 'System element and component', C: SystemElementFigure },
  'w5s1-layers': { title: 'Layers, and five plus or minus two per level', C: LayersFigure },
  'w5s1-breakdown-wbs': { title: 'System breakdown and work breakdown', C: BreakdownWbsFigure },
  'w5s1-logical-physical': { title: 'Logical and physical elements, and components', C: LogicalPhysicalFigure },
  'w5s1-worked-breakdown': { title: 'AeroLink’s component breakdown', C: WorkedBreakdownFigure },
  'w5s1-cards': { title: 'A responsibility card', C: CardsFigure },
  'w5s1-interface': { title: 'What an interface is', C: InterfaceFigure },
  'w5s1-typing': { title: 'Physical, information and organizational interfaces', C: TypingFigure },
  'w5s1-external-hidden': { title: 'External and hidden external interfaces', C: ExternalHiddenFigure },
  'w5s1-n2': { title: 'How an N² chart is built', C: N2TeachingFigure },
  'w5s1-worked-n2': { title: 'AeroLink’s N² from the fourteen interfaces', C: WorkedN2Figure },
  'w5s1-reading-n2': { title: 'Reading the N²: the hub, the empty rows, the sum', C: ReadingN2Figure },
  'w5s1-crossing': { title: 'Functional flows across the physical boundary', C: CrossingFigure },
  'w5s1-answer': { title: 'A new interface, chosen with reasons', C: AnswerFigure },
  'w5s1-table': { title: 'The interface definition table', C: TableFigure },
  'w5s1-worked-definitions': { title: 'Two interface definitions', C: WorkedDefinitionsFigure },
  'w5s1-interface-reqs': { title: 'Interface requirements in three steps', C: InterfaceReqsFigure },
  'w5s1-modularity': { title: 'Modularity: fewer interfaces between modules', C: ModularityFigure },
}

export const WEEK5_S2_FIGURES: Record<string, { title: string; C: ComponentType<{ alt: string }> }> = {
  'w5s2-why-manage': { title: 'Interface management as a loop', C: WhyManageFigure },
  'w5s2-governance': { title: 'The interface control working group', C: GovernanceFigure },
  'w5s2-standards': { title: 'Standards and service-level agreements', C: StandardsFigure },
  'w5s2-change-control': { title: 'One interface change traced through the N²', C: ChangeControlFigure },
  'w5s2-trust-boundaries': { title: 'Four ways an interface crosses a trust boundary', C: TrustBoundariesFigure },
  'w5s2-protection': { title: 'Protection at the interface', C: ProtectionFigure },
  'w5s2-degraded': { title: 'Degraded modes at interfaces', C: DegradedFigure },
  'w5s2-worked-security': { title: 'Three AeroLink interfaces read for security and resilience', C: WorkedSecurityFigure },
  'w5s2-audit': { title: 'Four audit lenses', C: AuditFigure },
  'w5s2-integration': { title: 'Integration aggregates from the N²', C: IntegrationFigure },
  'w5s2-coupling': { title: 'The coupling count of two allocations', C: CouplingFigure },
  'w5s2-feeds': { title: 'Where Week 5 goes', C: FeedsW5Figure },
  'w5s2-lab-n2': { title: 'A blank N² template', C: LabN2Figure },
}
