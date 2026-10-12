// Week 12 interactive activities. Logic lives in ./week12/*.ts (pure, unit-tested); keys are prefixed w12-.
import { RidDispositionLog } from './week12/RidDispositionLog'
import { ThreadExplorer } from './week12/ThreadExplorer'
import { TraceAudit } from './week12/TraceAudit'
import { VerPlanner } from './week12/VerPlanner'

export const ACTIVITIES = {
  'w12-thread-explorer': ThreadExplorer,
  'w12-trace-audit': TraceAudit,
  'w12-ver-planner': VerPlanner,
  'w12-rid-dispositions': RidDispositionLog,
}
