// Week 1 Needs view (mission 4): diagnose draft needs and write AeroLink needs against the six criteria, stored as a
// workbench artefact.
import { useWorkbench } from '../context'
import { Lead } from './Lead'
import { NeedsExercise } from './NeedsExercise'
import { NEEDS_KEY, needsArtefact, type NeedsExercise as Value } from './stakeholders'

export default function NeedsView() {
  const wb = useWorkbench()
  const value = needsArtefact(wb.state.artefacts)
  return (
    <div className="wb-view-body" data-testid="view-needs">
      <Lead>Well-formed needs for AeroLink’s new vertiport (L6, L7): attributed to a stakeholder, no “shall”, no design, a condition, a rationale and a source. This is the rehearsal; your team’s own needs are part 5 of the Team enterprise view.</Lead>
      <NeedsExercise value={value} onChange={(v: Value) => wb.setArtefact<Value>(NEEDS_KEY, () => v)} />
    </div>
  )
}
