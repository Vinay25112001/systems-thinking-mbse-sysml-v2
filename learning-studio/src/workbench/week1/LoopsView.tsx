// Week 1 Causal loops view: the explorer's causal-loop diagram (click a variable to select it) and the loop builder.
import { CausalLoopDiagram } from '../../components/CausalLoopDiagram'
import { useSelection } from '../selection'
import { Lead } from './Lead'
import { LoopBuilder } from './LoopBuilder'

export default function LoopsView() {
  const { selectedId, select } = useSelection()
  const varId = selectedId?.startsWith('var:') ? selectedId.slice(4) : undefined
  return (
    <div className="wb-view-body" data-testid="view-loops">
      <Lead>Causal-loop structure of the AeroLink model. Click a variable to inspect its links in Properties; build your own loops below.</Lead>
      <CausalLoopDiagram selectedId={varId} onSelectNode={(id) => select(`var:${id}`, { reveal: true })} height={520} collapseText />
      <LoopBuilder />
    </div>
  )
}
