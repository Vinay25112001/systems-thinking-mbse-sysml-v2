// Mission schema (WORKBENCH_SPEC §3). A converted week exports a WorkbenchWeek from src/content/missions/weekNN.ts;
// the file is discovered by glob, so converting a week never edits a shared file.
// Mission text is cut from the week's reviewed content (src/content/weeks/weekNN.ts and the files it composes);
// nothing here may add a factual or SysML claim (AUTHORING_GUIDE §2, §7).
import type { Citation } from '../readings'
import type { EngineeringModel } from '../../model/engineering'
import type { QuizRecord } from '../../state/AppState'
import type { Rule } from '../../workbench/problems'

export type MissionKind = 'try' | 'worked' | 'guided' | 'own' | 'recall' | 'review'

/** A fact published by an activity through useMissionSignal; `at` is the publish time (ms since epoch). */
export type Signal = { value: unknown; at: number; /** earlier values, newest last (bounded) */ history?: { value: unknown; at: number }[] }
/** A student's recorded answer to a step input; `at` lets checks enforce order (e.g. prediction before the run). */
export type Answer = { value: string; at: number }

export type MissionCtx = {
  model: EngineeringModel
  signals: Record<string, Signal>
  /** This mission's recorded answers, by input key. */
  answers: Record<string, Answer>
  /** Week artefacts that are not engineering elements (see RuleCtx.artefacts). */
  artefacts: Record<string, unknown>
  boundary: Record<string, string>
  quiz: Record<string, QuizRecord>
}

export type CheckResult = { ok: boolean; detail?: string }
export type StepCheck = (ctx: MissionCtx) => CheckResult

/** Optional inline input on a step: a recorded answer the step's check can read (extension to the spec schema). */
export type StepInput = {
  key: string
  type: 'choice' | 'number' | 'text'
  label: string
  options?: { id: string; text: string }[]
  /** Once recorded the answer cannot change (predictions must be committed before the reveal). */
  lock?: boolean
  /** Shown after the answer is recorded (never before), keyed by option id or '*' for any answer. */
  feedback?: Record<string, string>
}

export type MissionStep = {
  id: string
  instruction: string
  hint?: string
  /** Centre view to open for this step. */
  view?: string
  /** Element to select when the step is opened. */
  focus?: string
  /** Absent = the student marks the step done (rubric-graded work). */
  check?: StepCheck
  /** Explanation revealed on request in worked missions. */
  worked?: string
  /** Lesson block id opened in the Reference drawer. */
  readMore: string
  cite?: Citation[]
  input?: StepInput
  /** For own missions: the step is assessed by the rubric named here even when its completeness check passes. */
  rubric?: string
}

export type Mission = {
  id: string
  week: number
  kind: MissionKind
  title: string
  goal: string
  minutes: number
  objectives: string[]
  /** The reviewed workload line (WeekContent.workload[].activity, matched by prefix) whose time this mission uses. */
  workloadLine: string
  steps: MissionStep[]
  debrief?: string
}

/** A week converted to the workbench. */
export type WorkbenchWeek = {
  week: number
  /** Centre views in tab order (ids registered in src/workbench/views.ts). */
  views: string[]
  missions: Mission[]
  /** Week-specific problem rules, added to the core rules. */
  rules: Rule[]
  /** Console line for a signal an activity published, or null to stay quiet. */
  describeSignal?: (key: string, value: unknown) => string | null
}
