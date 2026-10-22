// The Week 6 applied exercise (#/week/6/assessment), kept apart from the page component (fast refresh): the reading time,
// its tasks with their minutes and its four-level descriptors. The case brief with marking notes is
// docs/lectures/week06/WEEK6_APPLIED_EXERCISE_BRIEF.md; assessmentParts.test.ts checks the minutes and the scale.
//
// Review fixes (2026-10-21): Mo4, the brief is unseen, so reading time is budgeted, and Task 2 is rebalanced (one increment
// in full, a second with only its content, trigger and off-ramp) so that the whole exercise stays inside the 0.6 h
// workload row; Mo3, Task 2 assesses proposed objectives W6.4 (the development approach, with a reason) and W6.6 (a risk
// that exists only during the transition); n10, the descriptors match the brief and the marking notes.
/** Minutes to read the unseen brief before the tasks start. */
export const EXERCISE_READING_MINUTES = 5
/** The applied exercise's tasks with their minutes (reading time plus tasks sum to the minutes stated). */
export const EXERCISE_TASKS: { text: string; minutes: number }[] = [
  { text: 'State the bike-share’s baseline in three lines with the limit that binds it, and two capability gaps (or one gap and one excess), each with both levels, a horizon and the need it comes from. An excess is the baseline above the desired level, not spare room on a limit that does not bind.', minutes: 7 },
  { text: 'Plan one increment after the baseline in full: its content, the gap it serves, an entry trigger a reviewer could observe, its dependency, its development approach with a one-line reason, its transition approach, one risk that exists only during its transition, its security and resilience change, and an off-ramp if it inserts a technology that is not yet mature. Then name a second increment with only its content, its trigger and, where needed, its off-ramp.', minutes: 13 },
  { text: 'Record one known unknown in full, with its impact, the information needed, the mitigation while it stays open, its owner and the increment it gates; then name a second unknown and the increment it gates.', minutes: 5 },
  { text: 'Justify the insertion point of the battery-swap technology against maturity, the ability to insert it, and whether it is operationally appropriate then; say what a TRL could not tell you here.', minutes: 6 },
]
export const EXERCISE_TASK_MINUTES = EXERCISE_TASKS.reduce((a, t) => a + t.minutes, 0)
export const EXERCISE_MINUTES = EXERCISE_READING_MINUTES + EXERCISE_TASK_MINUTES

/** The applied exercise's criteria with their four-level descriptors (4 Exemplary … 1 Beginning). */
export const EXERCISE_LEVELS: { criterion: string; levels: [string, string, string, string] }[] = [
  { criterion: 'Baseline and gaps', levels: ['An honest baseline with the binding limit computed from the brief; two entries traced to a stated need, each with both levels and a horizon whose choice is explained; an excess, if claimed, is the baseline above the desired level, never slack on the dock limit', 'Complete, with one level or one trace missing', 'Gaps stated as features to add, or with no horizon, or slack on the dock limit called an excess', 'No baseline, or gaps that restate the case'] },
  { criterion: 'Increments', levels: ['The full increment serves a named gap, starts at an observable trigger, names its dependency, justifies its development approach, keeps the bikes available through a transition whose transition-only risk is named, states its security and resilience change, and has an off-ramp where it inserts the immature swap technology; the second increment has a content, a trigger and any off-ramp it needs', 'All elements present; one trigger is a date, or the approach has no reason, or the transition risk would outlast the transition', 'Dated features with no triggers, or no off-ramp for the immature technology', 'A list of changes'] },
  { criterion: 'Known unknowns', levels: ['The full unknown has impact, information needed, mitigation, owner and the increment it gates; the tariff unknown, if chosen, gates the charging-dock increment', 'One element missing in the full unknown', 'An unknown listed without owner or gated increment, or the tariff gated to the battery-swap increment', 'None'] },
  { criterion: 'Insertion justified', levels: ['Maturity, insertability and timing each argued from the brief; states that a TRL rates the swap technology, not its fit with Lakeside’s depot, vans and winter', 'Two of the three argued; the TRL limit named', 'The TRL alone used as the justification', 'No justification'] },
]
