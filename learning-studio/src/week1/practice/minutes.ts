// Guided Practice task minutes (spec §e.2), kept dependency-free so the stated workload (content/week1Path.ts) and the
// task list read the same numbers (review M5-15). Optional practice: never counted in the required 8.1 h (A26).
export const TASK_MINUTES = { 'gp-1': 11, 'gp-2': 18, 'gp-3': 22, 'gp-4': 15, 'gp-5': 18, 'gp-6': 12 } as const
export const PRACTICE_MINUTES_TOTAL = Object.values(TASK_MINUTES).reduce((a, m) => a + m, 0)
