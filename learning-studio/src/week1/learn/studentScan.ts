// What no student-visible Week 1 text may contain (review M4A F1, F3, F7). One list for the unit test
// (learn/surfaces.test.tsx, instructor edition with the faculty boxes removed) and the student-build leak check
// (scripts/check-student-build.mjs §4c, every surface rendered through Vite in student mode).
//
// "goal(s)": the course term for MGO-002… is "objectives" (DECISION_LOG A25, FQ-2 a). A use of "goal" is allowed only
// inside a quotation (“…”) or in one of the attributed source passages listed below, each kept verbatim because it
// reports what a source says, not the course's MGO term. Any other "goal" fails, so a new one must be reworded or
// listed here with its reason.

export type ScanRule = { id: string; pattern: RegExp; why: string }

export const STUDENT_TEXT_RULES: ScanRule[] = [
  { id: 'register-code', pattern: /\bR\d{2,3}[a-z]?\b|\bS\d{2}\b/g, why: 'register (R) or source (S) code (LRN-14)' },
  { id: 'pending', pattern: /instructor to confirm|awaiting faculty|pending faculty|FICTIONAL, proposed|pending decision|faculty decision/gi, why: 'pending-decision wording' },
  { id: 'placeholder', pattern: /Section in preparation|Faculty view only|Faculty note/g, why: 'faculty placeholder or note' },
  { id: 'slide-pointer', pattern: /\((?:see )?(?:next )?slides? ?\d*(?:[–-]\d+)?\)|\bnext slide\b|\bsee slide \d/gi, why: 'lecture slide pointer' },
  { id: 'session-slide', pattern: /Session \d, slides? \d/g, why: 'lecture slide reference' },
  { id: 'rubric-code', pattern: /\bRB-\d/g, why: 'internal rubric code' },
  { id: 'stale-lesson', pattern: /Session \d lesson|\bin the lesson\b|\bthe lesson below\b|Session \d ended|which Session \d develops|plot of Session \d|taught in Session \d|debated in Session \d|\bthe session opened\b/gi, why: 'stale reference to the old lesson or the live session' },
  { id: 'option-letter', pattern: /\banswer is (?:therefore )?[A-E]\b|\boption [A-E]\b/g, why: 'quiz option letter from the lecture poll' },
  { id: 'dangling-below', pattern: /\bbrief below\b|\bunder conflicts below\b|\bthe audit below\b|\bcoverage matrix below\b/gi, why: 'pointer to text that is not below' },
]

/** Attributed source passages that keep the word "goal(s)" (each reports a source's own wording). */
export const GOAL_ALLOWED: { text: string; why: string }[] = [
  { text: 'mission, goals, objectives and measures of success', why: 'SEBoK Business or Mission Analysis output list (5.3 figure); the course term is explained in 5.3 (OBJECTIVES_NOTE)' },
  { text: 'mission, goals and objectives', why: 'SEBoK, quoted in the A25 objectives note itself (5.3)' },
  { text: 'the mission, goals and objectives with their measures', why: 'SEBoK Business or Mission Analysis outputs (5.3)' },
  { text: 'establish the goals, objectives and measures of success', why: 'SEBoK Business or Mission Analysis purpose (5.3)' },
  { text: 'business and operational goals', why: 'SEBoK definition of enterprise (3.5)' },
  { text: 'each with primary goals', why: 'SEBoK Life Cycle Stages: goals of a life-cycle stage, not the course MGO term (5.1)' },
  { text: 'their primary goals and decision gates', why: 'SEBoK Life Cycle Stages figure caption (5.1)' },
  { text: 'different goals and measures that conflict', why: 'SEBoK Business or Mission Analysis on conflicting perspectives (9.6)' },
  { text: 'conflicting, goals and measures', why: 'SEBoK Business or Mission Analysis on conflicting perspectives (9.6)' },
  { text: 'reflect the mission, goals and measures', why: 'SEBoK expectation for the integrated set of needs (9.3, 10.3)' },
  { text: 'tied to mission goals', why: 'SEBoK need-quality attribute, paraphrased with its source (9.4)' },
  { text: 'work toward a common goal', why: 'definition of a team, paraphrased with its source (11.1)' },
]

const QUOTED = /“[^”]*”/g

/** Every rule hit in a student text, plus every "goal(s)" outside quotations and the allowed source passages. */
export function scanStudentText(text: string): { rule: string; why: string; match: string; context: string }[] {
  const out: { rule: string; why: string; match: string; context: string }[] = []
  const ctx = (i: number, len: number) => text.slice(Math.max(0, i - 70), i + len + 50)
  for (const r of STUDENT_TEXT_RULES) for (const m of text.matchAll(r.pattern)) out.push({ rule: r.id, why: r.why, match: m[0], context: ctx(m.index!, m[0].length) })
  let rest = text.replace(QUOTED, (q) => ' '.repeat(q.length))
  for (const a of GOAL_ALLOWED) rest = rest.split(a.text).join(' '.repeat(a.text.length))
  for (const m of rest.matchAll(/\bgoals?\b/gi)) out.push({ rule: 'goal-term', why: 'course term is "objectives" (A25)', match: m[0], context: ctx(m.index!, m[0].length) })
  return out
}

/** Week 1 stages that M5 (Guided Practice) and M6 (My Project / Lab, Review & Submit) rebuild: their current text is
 *  scanned too (review N6), and the hits found on 2026-10-21 are a ceiling per rule, never an allowance for a new rule.
 *  They are known and deferred: the lab brief shows the grading rubric rows (RB-x.y) and register-coded references, the
 *  three-person-team minimum is pending faculty approval, the quiz explanations say "Taught in: Session N, slide K"
 *  (C27), and the lab brief still says "goals" for MGO-002…. Any rule not listed, or a count above its ceiling, fails. */
export const DEFERRED_STAGE_HITS: Record<string, Partial<Record<string, number>>> = {
  'practice and lab tool: Week 1 mission texts': { 'rubric-code': 9, 'stale-lesson': 1, 'goal-term': 4 },
  // --- m6 --- the Lab L1 brief moved to its own page; My Project / Lab (the canvas) and Review & Submit are rebuilt and
  // scanned strictly (no ceiling: src/project/canvas/canvasSurfaces.tsx)
  '/week/1/project/instructions': { 'register-code': 24, pending: 8, 'rubric-code': 21, 'goal-term': 17 },
  // --- end m6 ---
}

/** Hits that break the rules for a route: every hit on a Learn, Overview or homepage surface, and on a deferred stage
 *  any rule without a ceiling or above its ceiling. */
export function violations(route: string, text: string): string[] {
  const hits = scanStudentText(text)
  const ceiling = DEFERRED_STAGE_HITS[route]
  if (!ceiling) return hits.map((h) => `${route} [${h.rule}] …${h.context}…`)
  const counts = new Map<string, number>()
  for (const h of hits) counts.set(h.rule, (counts.get(h.rule) ?? 0) + 1)
  return [...counts].filter(([rule, n]) => n > (ceiling[rule] ?? 0)).map(([rule, n]) => `${route} [${rule}] ${n} hits, ceiling ${ceiling[rule] ?? 0}: …${hits.find((h) => h.rule === rule)!.context}…`)
}
