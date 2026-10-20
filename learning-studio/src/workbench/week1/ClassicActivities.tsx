// Classic-page versions of the Week 1 exercises (rebuilt 2026-10-18): the same components as the workbench views, with
// their state in browser storage instead of a workbench artefact.
import { usePersistentState } from '../../lib/usePersistentState'
import { NeedsExercise } from './NeedsExercise'
import { StakeholderExercise } from './StakeholderExercise'
import { EMPTY_NEEDS, EMPTY_STK, needsArtefact, stakeholderArtefact, type NeedsExercise as NeedsValue, type StakeholderExercise as StkValue } from './stakeholders'

export function StakeholderActivity() {
  const [v, setV] = usePersistentState<StkValue>('w1-classic-stakeholders', EMPTY_STK)
  return <StakeholderExercise value={stakeholderArtefact({ 'w1.stakeholders': v })} onChange={setV} />
}
export function NeedCheckActivity() {
  const [v, setV] = usePersistentState<NeedsValue>('w1-classic-needs', EMPTY_NEEDS)
  return <NeedsExercise value={needsArtefact({ 'w1.needs': v })} onChange={setV} />
}

