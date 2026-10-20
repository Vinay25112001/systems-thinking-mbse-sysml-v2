// Assessments panel: recall quiz (the reviewed Week quiz items), lab, assignment with rubric, workload, and the
// instructor notes (instructor mode only). Existing components, unchanged.
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { X } from 'lucide-react'
import { Quiz } from '../../components/Quiz'
import { bloomLabel } from '../../flow/route'
import { weekContent } from '../../content/weeks'
import { AssignmentPanel, InstructorPanel, LabPanel, WorkloadPanel } from '../../pages/WeekPage'
import { useApp } from '../../state/AppState'
import { useWorkbench, type AssessTab } from '../context'

export function AssessmentsPanel() {
  const wb = useWorkbench()
  const { instructor } = useApp()
  const c = weekContent(wb.week)
  if (!c) return null
  const tab = wb.assessments.tab === 'instructor' && !instructor ? 'recall' : wb.assessments.tab
  return (
    <Dialog.Root open={wb.assessments.open} onOpenChange={(o) => (o ? wb.openAssessments() : wb.closeAssessments())}>
      <Dialog.Portal>
        <Dialog.Overlay className="wb-overlay" />
        <Dialog.Content className="wb-drawer wide" aria-describedby={undefined} data-testid="assessments-panel">
          <div className="wb-ph" style={{ height: 40 }}>
            <Dialog.Title asChild>
              <h2>Assessments · Week {wb.week}</h2>
            </Dialog.Title>
            <span className="wb-sp" />
            <Dialog.Close className="wb-btn ghost icon" aria-label="Close assessments">
              <X size={14} aria-hidden />
            </Dialog.Close>
          </div>
          <Tabs.Root value={tab} onValueChange={(v) => wb.openAssessments(v as AssessTab)} className="flex min-h-0 flex-1 flex-col">
            <Tabs.List className="wb-tabs" aria-label="Assessment sections">
              <Tabs.Trigger className="wb-tab" value="recall">
                Recall (knowledge check)
              </Tabs.Trigger>
              <Tabs.Trigger className="wb-tab" value="lab">
                Lab {c.lab.id}
              </Tabs.Trigger>
              <Tabs.Trigger className="wb-tab" value="assignment">
                Assignment &amp; rubric
              </Tabs.Trigger>
              <Tabs.Trigger className="wb-tab" value="workload">
                Workload
              </Tabs.Trigger>
              {instructor && (
                <Tabs.Trigger className="wb-tab" value="instructor">
                  Instructor notes
                </Tabs.Trigger>
              )}
            </Tabs.List>
            <div className="wb-scroll bg-wb-bg p-4 text-[14px]">
              <Tabs.Content value="recall">
                <p className="mb-3 text-wb-muted">Formative. Every option has an explanation; each question cites its source. Recommended after the week's missions.</p>
                <Quiz questions={c.quiz} bloomText={c.week === 1 ? bloomLabel : undefined} />
              </Tabs.Content>
              <Tabs.Content value="lab">
                <LabPanel c={c} />
              </Tabs.Content>
              <Tabs.Content value="assignment">
                <AssignmentPanel c={c} />
              </Tabs.Content>
              <Tabs.Content value="workload">
                <WorkloadPanel c={c} />
              </Tabs.Content>
              {instructor && (
                <Tabs.Content value="instructor">
                  <InstructorPanel c={c} />
                </Tabs.Content>
              )}
            </div>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default AssessmentsPanel
