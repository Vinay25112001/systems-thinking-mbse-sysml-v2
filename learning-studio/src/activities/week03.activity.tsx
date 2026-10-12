// Week 3 interactive activities. Logic lives in ./week03/*.ts (pure, unit-tested); keys are prefixed w03-.
import { CapabilityBuilder } from './week03/CapabilityBuilder'
import { MgoRecorder } from './week03/MgoRecorder'
import { NeedStudio } from './week03/NeedStudio'
import { ScenarioBuilder } from './week03/ScenarioBuilder'

export const ACTIVITIES = {
  'w03-mgo-recorder': MgoRecorder,
  'w03-need-studio': NeedStudio,
  'w03-capability-tree': CapabilityBuilder,
  'w03-scenario-builder': ScenarioBuilder,
}
