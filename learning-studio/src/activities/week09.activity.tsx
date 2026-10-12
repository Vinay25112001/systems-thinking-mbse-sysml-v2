// Week 9 interactive activities. Logic lives in ./week09/*.ts (pure, unit-tested); keys are prefixed w09-.
import { PackageMapper } from './week09/PackageMapper'
import { PredictChecker } from './week09/PredictChecker'
import { SemanticsClassifier } from './week09/SemanticsClassifier'

export const ACTIVITIES = {
  'w09-semantics-classifier': SemanticsClassifier,
  'w09-package-mapper': PackageMapper,
  'w09-predict-checker': PredictChecker,
}
