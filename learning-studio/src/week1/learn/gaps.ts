// Faculty-facing gap list of the Week 1 textbook (spec §d.10, IA §6): where new prose is still needed and no verified
// text exists yet. Read by textbook.ts only in the instructor edition (the student edition folds the import away),
// so neither the placeholder nor these notes reach dist-student (scripts/check-student-build.mjs proves it).
import type { Gap } from './textbook'

export const GAP_LABEL = 'Section in preparation (pending verified source)'

// M4 part B (2026-10-21) filled all seventeen gaps (authored.ts; learning-studio/docs/week1/M4B_REPORT.md lists each with
// its words and sources). The mechanism stays for any section that needs new prose later.
export const GAPS_SOURCE: Record<string, Gap> = {}
