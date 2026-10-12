// Figure registry for the Learn stage: content names a figure by id; this module renders it inside its frame.
import type { ReactNode } from 'react'
import type { FigureSpec } from '../../content/learn/types'
import { FigureFrame } from './Frame'
import { BoundaryLayers, ControlHierarchy, DownAndUp, JamFigure, LessThanSum, LoopPair, OpenSystemFigure } from './SystemFigures'
import { CapacityCrossover, ControlRings, LifeCycleAgents } from './EngineeringFigures'

const STATIC: Record<string, (alt: string, revealed: boolean) => ReactNode> = {
  jam: (alt) => <JamFigure alt={alt} />,
  'open-system': (alt) => <OpenSystemFigure alt={alt} />,
  'down-and-up': (alt) => <DownAndUp alt={alt} />,
  'less-than-sum': (alt) => <LessThanSum alt={alt} />,
  'loop-pair': (alt) => <LoopPair alt={alt} />,
  'capacity-crossover': (alt, revealed) => <CapacityCrossover alt={alt} revealed={revealed} />,
  'life-cycle-agents': (alt) => <LifeCycleAgents alt={alt} />,
  'control-rings': (alt) => <ControlRings alt={alt} />,
}

/** `revealed`: the section's worked input has been answered. Until then a figure with `preReveal` shows the answer-free
 *  alt text and text equivalent (review W1F-F03), and the drawing hides whatever would give the answer away. */
export function LearnFigure({ spec: full, number, revealed = true }: { spec: FigureSpec; number: string; revealed?: boolean }) {
  const spec = full.preReveal && !revealed ? { ...full, ...full.preReveal } : full
  if (spec.id === 'boundary-layers')
    return (
      <FigureFrame spec={spec} number={number} wide={false}>
        <BoundaryLayers alt={spec.alt} />
      </FigureFrame>
    )
  if (spec.id === 'control-hierarchy')
    return (
      <FigureFrame spec={spec} number={number} wide={false}>
        <ControlHierarchy alt={spec.alt} />
      </FigureFrame>
    )
  const render = STATIC[spec.id]
  if (!render) throw new Error(`No figure component for ${spec.id}`)
  return (
    <FigureFrame spec={spec} number={number}>
      {render(spec.alt, revealed)}
    </FigureFrame>
  )
}

export const FIGURE_IDS = new Set([...Object.keys(STATIC), 'boundary-layers', 'control-hierarchy'])
