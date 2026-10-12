// Week 6 interactive activities. Logic lives in ./week06/*.ts (pure, unit-tested); keys are prefixed w06-.
import { MicroLab2 } from './week06/MicroLab2'
import { RiskQuantifier } from './week06/RiskQuantifier'
import { RiskRegister } from './week06/RiskRegister'
import { SrrChecklist } from './week06/SrrChecklist'
import { TrlAssessor } from './week06/TrlAssessor'

export const ACTIVITIES = {
  'w06-trl-assessor': TrlAssessor,
  'w06-risk-register': RiskRegister,
  'w06-risk-quantifier': RiskQuantifier,
  'w06-srr-checklist': SrrChecklist,
  'w06-sysml-microlab2': MicroLab2,
}
