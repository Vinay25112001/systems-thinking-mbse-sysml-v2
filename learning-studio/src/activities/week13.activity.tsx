// Week 13 interactive activities. Logic lives in ./week13/*.ts (pure, unit-tested); keys are prefixed w13-.
import { ConsistencyReview } from './week13/ConsistencyReview'
import { ImpactExplorer } from './week13/ImpactExplorer'
import { MarginWhatIf } from './week13/MarginWhatIf'

export const ACTIVITIES = {
  'w13-impact-explorer': ImpactExplorer,
  'w13-margin-whatif': MarginWhatIf,
  'w13-consistency-review': ConsistencyReview,
}
