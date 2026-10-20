// Week 1 Stakeholders view (missions 1 and 3): the AeroLink stakeholder exercise, stored as a workbench artefact. The
// Week 2 stakeholder ecosystem editor (src/pages/StakeholderEditorPage.tsx) is kept for later weeks and is not part of
// Week 1 any more.
import { useWorkbench } from '../context'
import { Lead } from './Lead'
import { StakeholderExercise } from './StakeholderExercise'
import { STK_KEY, stakeholderArtefact, type StakeholderExercise as Value } from './stakeholders'

export default function StakeholdersView() {
  const wb = useWorkbench()
  const value = stakeholderArtefact(wb.state.artefacts)
  return (
    <div className="wb-view-body" data-testid="view-stakeholders">
      <Lead>AeroLink’s new vertiport, next to a residential district: who has a stake in it, how each stakeholder is classified, and what a register row records (L4, L5). This is the rehearsal; your team’s own register is part 4 of the Team enterprise view.</Lead>
      <StakeholderExercise value={value} onChange={(v: Value) => wb.setArtefact<Value>(STK_KEY, () => v)} />
    </div>
  )
}
