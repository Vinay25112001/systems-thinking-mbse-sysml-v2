// The Week 11 Session 2 drawn-figure map (figure id -> title and component), kept apart from the figure components so
// that LectureWeek11S2.tsx exports components only (fast refresh; oxlint only-export-components). Re-exported by
// lectureWeek11Figures.ts, read by registry.ts. Review status: new-pending-review.
import type { ComponentType } from 'react'
import { BridgeFigure11, CheckerTableFigure11b, ChecklistCardFigure11, CommonErrorsFigure, ConnectionMediumFigure, DeliverablesFigure11, FlowEstablishedFigure, InterfaceSetFigure, LabMapFigure11, MappingFigure11, PredictCardFigure11b, SevenDaysFigure11, ThreeMeaningsFigure } from './LectureWeek11S2'

type Entry = { title: string; C: ComponentType<{ alt: string }> }

export const WEEK11_S2_FIGURES: Record<string, Entry> = {
  'w11s2-three-meanings': { title: 'Flow, reversed flow and binding', C: ThreeMeaningsFigure },
  'w11s2-connection-medium': { title: 'A logical connection and a medium', C: ConnectionMediumFigure },
  'w11s2-flow-established': { title: 'Flows established by an interface', C: FlowEstablishedFigure },
  'w11s2-interface-set': { title: 'The AeroLink interfaces by kind', C: InterfaceSetFigure },
  'w11s2-predict-card': { title: 'Predict the checker on a satisfy claim', C: PredictCardFigure11b },
  'w11s2-checker-table': { title: 'The week’s checker calibration', C: CheckerTableFigure11b },
  'w11s2-common-errors': { title: 'Common errors in interface models', C: CommonErrorsFigure },
  'w11s2-checklist-card': { title: 'The interface review checklist', C: ChecklistCardFigure11 },
  'w11s2-mapping': { title: 'From the Phase I package to model v0.4', C: MappingFigure11 },
  'w11s2-bridge': { title: 'Where the physical architecture goes next', C: BridgeFigure11 },
  'w11s2-deliverables': { title: 'Lab L11 deliverables', C: DeliverablesFigure11 },
  'w11s2-lab-map': { title: 'In class: what crosses your interfaces', C: LabMapFigure11 },
  'w11s2-seven-days': { title: 'The next seven days', C: SevenDaysFigure11 },
}
