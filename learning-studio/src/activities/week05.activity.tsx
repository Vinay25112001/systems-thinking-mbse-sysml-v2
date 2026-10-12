// Week 5 interactive activities. Logic lives in ./week05/*.ts (pure, unit-tested); keys are prefixed w05-.
import { QualityAudit } from './week05/QualityAudit'
import { SysmlReading } from './week05/SysmlReading'
import { TpmTracker } from './week05/TpmTracker'
import { TraceExplorer } from './week05/TraceExplorer'

export const ACTIVITIES = {
  'w05-quality-audit': QualityAudit,
  'w05-trace-explorer': TraceExplorer,
  'w05-tpm-tracker': TpmTracker,
  'w05-sysml-reading': SysmlReading,
}
