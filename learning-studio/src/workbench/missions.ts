// Mission engine (WORKBENCH_SPEC §3): step evaluation and completion, pure; persistence is the caller's
// (usePersistentState('mission-progress', …) in WorkbenchProvider).
import type { Answer, Mission, MissionCtx, MissionStep } from '../content/missions/types'

export type MissionProgress = {
  answers: Record<string, Answer>
  /** Steps without a check, marked done by the student (rubric-graded work). */
  manual: Record<string, boolean>
  /** Worked explanations the student revealed. */
  revealed: Record<string, boolean>
  hints: Record<string, boolean>
  completedAt?: number
}
export type ProgressStore = Record<string, MissionProgress>

export const EMPTY_PROGRESS: MissionProgress = { answers: {}, manual: {}, revealed: {}, hints: {} }

export type StepStatus = 'done' | 'current' | 'upcoming'
export type StepEval = { step: MissionStep; ok: boolean; detail?: string; manual: boolean; status: StepStatus; index: number }
export type MissionEval = { mission: Mission; steps: StepEval[]; done: number; total: number; complete: boolean; current: number }

export function progressOf(store: ProgressStore, id: string): MissionProgress {
  const p = store[id]
  return p ? { ...EMPTY_PROGRESS, ...p } : EMPTY_PROGRESS
}

/** Evaluates a step. A check that throws counts as failing (a content bug must never mark a step done). */
export function evaluateStep(step: MissionStep, ctx: MissionCtx, prog: MissionProgress): { ok: boolean; detail?: string; manual: boolean } {
  if (!step.check) return { ok: !!prog.manual[step.id], manual: true, detail: prog.manual[step.id] ? 'Marked done.' : 'Mark done when finished (assessed by rubric).' }
  try {
    const r = step.check(ctx)
    return { ok: !!r.ok, detail: r.detail, manual: false }
  } catch (e) {
    return { ok: false, manual: false, detail: `Check could not run: ${(e as Error).message}` }
  }
}

/** Evaluates every step; the current step is the first that is not done. */
export function evaluateMission(m: Mission, ctx: Omit<MissionCtx, 'answers'>, prog: MissionProgress): MissionEval {
  const full: MissionCtx = { ...ctx, answers: prog.answers }
  const raw = m.steps.map((s) => evaluateStep(s, full, prog))
  const current = raw.findIndex((r) => !r.ok)
  const steps: StepEval[] = raw.map((r, i) => ({ step: m.steps[i], ...r, index: i, status: r.ok ? 'done' : i === current ? 'current' : 'upcoming' }))
  const done = raw.filter((r) => r.ok).length
  return { mission: m, steps, done, total: m.steps.length, complete: done === m.steps.length, current: current === -1 ? m.steps.length : current }
}

/** Guided missions show fewer steps: the finished ones and the current one; later steps stay hidden. */
export function visibleSteps(e: MissionEval): StepEval[] {
  if (e.mission.kind !== 'guided') return e.steps
  return e.steps.filter((s) => s.index <= e.current)
}

/** Records an answer. Locked inputs keep the first recorded answer (predict before the reveal). */
export function recordAnswer(prog: MissionProgress, step: MissionStep, value: string, now = Date.now()): MissionProgress {
  if (!step.input) return prog
  const prev = prog.answers[step.input.key]
  if (step.input.lock && prev) return prog
  return { ...prog, answers: { ...prog.answers, [step.input.key]: { value, at: now } } }
}

export const KIND_LABEL: Record<Mission['kind'], string> = {
  try: 'Try first',
  worked: 'Worked',
  guided: 'Guided',
  own: 'Own',
  recall: 'Recall',
  review: 'Program review',
}
