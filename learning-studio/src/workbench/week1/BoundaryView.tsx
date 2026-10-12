// Week 1 Boundary & context view: the boundary classification exercise and the context recorder (SoI, EXT).
import { BoundaryExercise } from '../../components/Week1Exercises'
import week01 from '../../content/weeks/week01'
import { ContextRecorder } from './ContextRecorder'
import { Lead } from './Lead'

export default function BoundaryView() {
  return (
    <div className="wb-view-body" data-testid="view-boundary">
      <Lead>{week01.activities.find((a) => a.id === 'w1-act-boundary')!.purpose}</Lead>
      <section aria-labelledby="boundary-ex-h" className="rounded border border-wb-line bg-wb-panel">
        <div className="wb-ph">
          <h2 id="boundary-ex-h">Boundary classification</h2>
        </div>
        <div className="p-3">
          <BoundaryExercise />
        </div>
      </section>
      <ContextRecorder />
    </div>
  )
}
