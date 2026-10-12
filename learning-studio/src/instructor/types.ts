/** An instructor-only assessment bank (exam items with keys). Never imported by student-facing code directly. */
export type ExamBank = {
  id: string
  /** Course week in which the exam is sat. */
  week: number
  title: string
  overview: string
  /** One entry per item: prompt, points, objectives and key. */
  items: string[]
  /** How items map to objectives. */
  mapping: string
}
