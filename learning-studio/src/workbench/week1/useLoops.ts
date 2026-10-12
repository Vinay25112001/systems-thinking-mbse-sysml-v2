// The student's causal loops (Week 1 artefact store), read and updated through the workbench.
import { useWorkbench } from '../context'
import { EMPTY_LOOPS, LOOPS_KEY, loopsArtefact, type LoopsArtefact, type StudentLoop } from './logic'

export function useLoops() {
  const wb = useWorkbench()
  const art = loopsArtefact(wb.state.artefacts)
  const update = (f: (a: LoopsArtefact) => LoopsArtefact) => wb.setArtefact<LoopsArtefact>(LOOPS_KEY, (prev) => f(prev && Array.isArray(prev.loops) ? prev : EMPTY_LOOPS))
  const patch = (id: string, p: Partial<StudentLoop>) => update((a) => ({ ...a, loops: a.loops.map((l) => (l.id === id ? { ...l, ...p } : l)) }))
  return { loops: art.loops, issued: art.issued, update, patch }
}

export function newLoopId(issued: number) {
  return `LOOP-${String(issued + 1).padStart(3, '0')}`
}

