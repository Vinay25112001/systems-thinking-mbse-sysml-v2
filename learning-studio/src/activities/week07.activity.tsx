// Week 7 interactive activities. Logic lives in ./week07/*.ts (pure, unit-tested); keys are prefixed w07-.
// The three components share one trade study (./week07/store.ts), so a change in one is seen by the others.
import { MonteCarloPanel } from './week07/MonteCarloPanel'
import { SwingWeightWalkthrough } from './week07/SwingWeightWalkthrough'
import { TradeStudySimulator } from './week07/TradeStudySimulator'

export const ACTIVITIES = {
  'w07-trade-simulator': TradeStudySimulator,
  'w07-monte-carlo': MonteCarloPanel,
  'w07-swing-elicitation': SwingWeightWalkthrough,
}
