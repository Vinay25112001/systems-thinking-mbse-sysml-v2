// Week 2 interactive activities. Logic lives in ./week02/*.ts (pure, unit-tested); keys are prefixed w02-.
import { ConcernArouRecorder } from './week02/ConcernArouRecorder'
import { ConflictMatrix } from './week02/ConflictMatrix'
import { LifecycleExplorer } from './week02/LifecycleExplorer'
import { SosClassifier } from './week02/SosClassifier'

export const ACTIVITIES = {
  'w02-sos-classifier': SosClassifier,
  'w02-lifecycle-gates': LifecycleExplorer,
  'w02-conflict-matrix': ConflictMatrix,
  'w02-concern-arou': ConcernArouRecorder,
}
