// Week 1 Dynamics view: the AeroLink dynamics explorer, unchanged apart from its optional signal hooks.
import { DynamicsExplorer } from '../../components/DynamicsExplorer'
import week01 from '../../content/weeks/week01'
import { Lead } from './Lead'

export default function DynamicsView() {
  return (
    <div className="wb-view-body" data-testid="view-dynamics">
      <Lead>{week01.activities.find((a) => a.id === 'w1-act-dynamics')!.purpose}</Lead>
      <DynamicsExplorer />
    </div>
  )
}
