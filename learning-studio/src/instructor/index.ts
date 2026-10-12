// Instructor-only assessment material (exam banks and keys). In the student edition (VITE_EDITION=student,
// `npm run build:student`) the conditional below is a compile-time constant, so the glob and every exam module are
// removed from the bundle entirely; scripts/check-student-build.mjs verifies that no exam text reaches dist-student/.
import type { ExamBank } from './types'

export type { ExamBank } from './types'

export const IS_STUDENT_EDITION = import.meta.env.VITE_EDITION === 'student'

const modules: Record<string, () => Promise<{ default: ExamBank }>> = IS_STUDENT_EDITION ? {} : import.meta.glob<{ default: ExamBank }>('./exams/*.ts')

export async function loadExamBanks(): Promise<ExamBank[]> {
  const banks = await Promise.all(Object.values(modules).map((load) => load().then((m) => m.default)))
  return banks.sort((a, b) => a.week - b.week)
}
