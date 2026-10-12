// The shared shape of a complete course week. Every week (1–14) is authored in src/content/weeks/weekNN.ts
// against these types, and `weekCompleteness` (below) is the mechanical part of the definition of done:
// a week is only shown as complete when every required section is present, internally consistent, and the
// week has passed an independent content review. Faculty review is recorded separately (DECISION_LOG A4).
import type { Bloom } from './course'
import type { Citation } from './readings'

export type ContentProvenance = 'source-paraphrase' | 'instructor-authored' | 'mixed'
export type BlockKind = 'outcomes' | 'intuition' | 'concept' | 'worked-example' | 'advanced' | 'application' | 'lab' | 'deliverable'

/** A SysML v2 textual-notation listing. `validated` may only be set by scripts/check_sysml.py results (see sysml/). */
export type SysmlListing = {
  /** File under learning-studio/sysml/ that holds exactly this text, so the reference tool can check it. */
  file: string
  caption: string
  /** What the listing is: a conformant model fragment, or a deliberately broken one used for teaching. */
  intent: 'conformant' | 'intentionally-invalid'
}

export type LessonBlock = {
  id: string
  kind: BlockKind
  title: string
  paragraphs: string[]
  bullets?: string[]
  /** Optional data table (e.g. a worked calculation). */
  table?: { caption: string; header: string[]; rows: string[][] }
  sysml?: SysmlListing[]
  citations: Citation[]
  provenance: ContentProvenance
  quote?: { text: string; cite: Citation }
}

export type QuizOption = { id: string; text: string; correct: boolean; explanation: string }
export type QuizQuestion = { id: string; bloom: Bloom; objective: string; prompt: string; options: QuizOption[]; cite: Citation }

/** An interactive learning activity rendered by a registered component (src/activities/registry.tsx). */
export type ActivitySpec = {
  id: string
  title: string
  /** Registry key of the interactive component. */
  component: string
  purpose: string
  instructions: string[]
  objectives: string[]
  /** ID of the lesson block the activity is shown inside. */
  inBlock: string
}

export type LabSpec = {
  id: string // L1 .. L14 / CP labs
  title: string
  setting: 'team' | 'individual'
  durationMinutes: number
  objectives: string[]
  inputs: string[]
  steps: { title: string; detail: string }[]
  /** Air Taxi artefacts produced, using the stable ID scheme (lab plan C.2). */
  artefacts: { idPrefix: string; description: string; minimum: string }[]
  /** How this lab's outputs feed later weeks (case continuity). */
  continuity: string
  /** Links to app tools students use in the lab. */
  tools: { label: string; to: string }[]
}

export type AssignmentSpec = {
  id: string
  title: string
  mode: 'individual' | 'team'
  due: string
  /** How the item counts toward the grade (from the syllabus §12), or "formative". */
  weight: string
  instructions: string[]
  /** Deliverable template: the headings students must complete, each with guidance. */
  template: { heading: string; guidance: string }[]
  /** Rubric IDs from ASSESSMENT_RUBRICS.md (rendered from rubrics.generated.json). */
  rubrics: string[]
  /** Which criteria apply this week, when only part of a rubric is used (e.g. "RB-1.1–1.3"). */
  rubricScope: string
  aiUse: string
  objectives: string[]
}

export type InstructorNotes = {
  /** Session plans; each session's segments must sum to its length. */
  sessions: { title: string; minutes: number; segments: { label: string; minutes: number; notes: string }[] }[]
  misconceptions: { claim: string; correction: string; cite?: Citation }[]
  facilitation: string[]
  /** Answer key / model-answer notes for the lab and assignment (not shown in student mode). */
  answerKey: string[]
  /** Errata or source cautions (e.g. a source example known to be wrong). */
  cautions: string[]
}

/** `review: 'new-pending-review'` marks a line changed for the book-style flow and not yet independently reviewed. */
export type WorkloadItem = { activity: string; hours: number; review?: 'new-pending-review' }

export type ContentReview = {
  status: 'draft' | 'self-checked' | 'independently-reviewed'
  /** Who performed the independent review and where the report lives (e.g. _source_cache/review/week02.md). */
  reviewer?: string
  date?: string
  report?: string
  /** Findings still open after the review. A week with open issues is not complete. */
  openIssues: string[]
}

export type WeekContent = {
  week: number
  drivingQuestion: string
  blocks: LessonBlock[]
  activities: ActivitySpec[]
  lab: LabSpec
  assignment: AssignmentSpec
  quiz: QuizQuestion[]
  instructorNotes: InstructorNotes
  workload: WorkloadItem[]
  /** Additional references beyond the week's readings (all from the verified register). */
  references: Citation[]
  review: ContentReview
}

// ---------------------------------------------------------------------------------------------
// Definition of done (mechanical part)

/** Syllabus §14 weekly workload estimates (hours). A week's itemised workload must sum to this. */
export const WORKLOAD_TARGET: Record<number, number> = {
  1: 8, 2: 8.5, 3: 10, 4: 9, 5: 9, 6: 11, 7: 9, 8: 10.5, 9: 9, 10: 9.5, 11: 10.5, 12: 10, 13: 9, 14: 11,
}

export const MIN_LESSON_WORDS = 1800
export const MIN_QUIZ = 10

export type Check = { id: string; label: string; ok: boolean; detail?: string }

const words = (s: string) => s.split(/\s+/).filter(Boolean).length

export function lessonWordCount(c: WeekContent): number {
  return c.blocks.reduce(
    (n, b) =>
      n +
      b.paragraphs.reduce((a, p) => a + words(p), 0) +
      (b.bullets ?? []).reduce((a, p) => a + words(p), 0) +
      (b.table ? b.table.rows.flat().reduce((a, p) => a + words(p), 0) : 0),
    0,
  )
}

/**
 * Structural checks a week must pass before it can be called complete.
 * `objectiveIds` are the week's objective IDs from course.ts; `rubricIds` and `activityKeys` are the known sets.
 */
export function weekChecks(c: WeekContent, objectiveIds: string[], rubricIds: Set<string>, activityKeys: Set<string>): Check[] {
  const kinds = (k: BlockKind) => c.blocks.filter((b) => b.kind === k).length
  const quizObjectives = new Set(c.quiz.map((q) => q.objective))
  const practiced = new Set([...c.lab.objectives, ...c.assignment.objectives, ...c.activities.flatMap((a) => a.objectives)])
  const blooms = new Set(c.quiz.map((q) => q.bloom))
  const workload = c.workload.reduce((a, w) => a + w.hours, 0)
  const target = WORKLOAD_TARGET[c.week]
  const blockIds = new Set(c.blocks.map((b) => b.id))
  const sessionErrors = c.instructorNotes.sessions.filter((s) => s.segments.reduce((a, g) => a + g.minutes, 0) !== s.minutes)
  const unsourced = c.blocks.filter((b) => b.provenance !== 'instructor-authored' && b.citations.length === 0)
  const lw = lessonWordCount(c)

  return [
    { id: 'structure', label: 'Lesson structure (outcomes, intuition, ≥ 2 concepts, worked example, advanced analysis, application)', ok: kinds('outcomes') >= 1 && kinds('intuition') >= 1 && kinds('concept') >= 2 && kinds('worked-example') >= 1 && kinds('advanced') >= 1 && kinds('application') >= 1 },
    { id: 'depth', label: `Instructional explanation ≥ ${MIN_LESSON_WORDS} words`, ok: lw >= MIN_LESSON_WORDS, detail: `${lw} words` },
    { id: 'citations', label: 'Every source-based block carries a citation', ok: unsourced.length === 0, detail: unsourced.map((b) => b.id).join(', ') },
    { id: 'activity', label: 'At least one registered interactive activity', ok: c.activities.length > 0 && c.activities.every((a) => activityKeys.has(a.component) && blockIds.has(a.inBlock)), detail: c.activities.filter((a) => !activityKeys.has(a.component)).map((a) => a.component).join(', ') },
    { id: 'lab', label: 'Air Taxi lab with ≥ 4 steps, artefacts and continuity', ok: c.lab.steps.length >= 4 && c.lab.artefacts.length > 0 && c.lab.continuity.length > 40 },
    { id: 'assignment', label: 'Assignment with ≥ 3-section template and a known rubric', ok: c.assignment.template.length >= 3 && c.assignment.rubrics.length > 0 && c.assignment.rubrics.every((r) => rubricIds.has(r)), detail: c.assignment.rubrics.filter((r) => !rubricIds.has(r)).join(', ') },
    { id: 'quiz', label: `Knowledge check ≥ ${MIN_QUIZ} questions, one correct option each, every option explained`, ok: c.quiz.length >= MIN_QUIZ && c.quiz.every((q) => q.options.filter((o) => o.correct).length === 1 && q.options.every((o) => o.explanation.length > 20)) },
    { id: 'quiz-coverage', label: 'Every objective is assessed by the knowledge check', ok: objectiveIds.every((o) => quizObjectives.has(o)), detail: objectiveIds.filter((o) => !quizObjectives.has(o)).join(', ') },
    { id: 'quiz-bloom', label: 'Knowledge check spans ≥ 2 Bloom levels', ok: blooms.size >= 2 },
    { id: 'practice-coverage', label: 'Every objective is practised in the activity, lab or assignment', ok: objectiveIds.every((o) => practiced.has(o)), detail: objectiveIds.filter((o) => !practiced.has(o)).join(', ') },
    { id: 'notes', label: 'Instructor notes: session plans that add up, ≥ 2 misconceptions, answer key', ok: c.instructorNotes.sessions.length >= 2 && sessionErrors.length === 0 && c.instructorNotes.misconceptions.length >= 2 && c.instructorNotes.answerKey.length > 0, detail: sessionErrors.map((s) => s.title).join(', ') },
    { id: 'workload', label: `Itemised workload equals the syllabus estimate (${target} h)`, ok: Math.abs(workload - target) < 0.01, detail: `${workload} h` },
    { id: 'review', label: 'Independent content review passed with no open issues', ok: c.review.status === 'independently-reviewed' && c.review.openIssues.length === 0, detail: c.review.status },
  ]
}

export type WeekStatus = 'complete' | 'in-development' | 'outline'

export function weekStatus(checks: Check[] | null): WeekStatus {
  if (!checks) return 'outline'
  return checks.every((c) => c.ok) ? 'complete' : 'in-development'
}
