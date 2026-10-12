// Week 10 interactive activities. Logic lives in ./week10/*.ts (pure, unit-tested); keys are prefixed w10-.
import { PredictChecker10 } from './week10/PredictChecker10'
import { RelationClassifier } from './week10/RelationClassifier'
import { ReqTranslator } from './week10/ReqTranslator'

export const ACTIVITIES = {
  'w10-req-translator': ReqTranslator,
  'w10-relation-classifier': RelationClassifier,
  'w10-predict-checker': PredictChecker10,
}
