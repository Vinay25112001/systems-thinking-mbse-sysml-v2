import { CausalLoopDiagram } from '../components/CausalLoopDiagram'
import { DynamicsExplorer } from '../components/DynamicsExplorer'
import { BoundaryExercise, PrinciplesExplorer } from '../components/Week1Exercises'

function AeroLinkDynamics() {
  return (
    <>
      <h3 className="mb-2 text-sm font-semibold">Causal-loop structure of the AeroLink model</h3>
      <CausalLoopDiagram />
      <h3 className="mb-2 mt-6 text-sm font-semibold">Dynamics explorer</h3>
      <DynamicsExplorer />
    </>
  )
}

export const ACTIVITIES = {
  'principles-explorer': PrinciplesExplorer,
  'aerolink-dynamics': AeroLinkDynamics,
  'boundary-exercise': BoundaryExercise,
}
