// One shared empty-answer check for every lab tool (Week 5 confirmation review 2026-10-19, N1 and N5). The gate sweep
// (docs/lectures/GATE_SWEEP_2026-10-19.md) accepts short answers ("TLS", "Approved", "Fail safe") but keeps answers that
// say nothing rejected. Before this module, Weeks 1, 2 and 3 each held their own copy (Week 1's lacked "later" and
// "todo") and Week 5 had none, so "none" counted as an interface's protection. Weeks 1, 2 and 3 re-export EMPTY_ANSWER
// from here under their old names, so their public APIs are unchanged.

/** An answer that says nothing ("ok", "n/a", "none", "-", "?", "later"): not a rule, a reason, a protection, a decision
 *  or a disposition. Used only where "none" is never a valid answer (not for preconditions or standards, where "None" or
 *  "None apply" is a complete answer). */
export const EMPTY_ANSWER = /^(?:ok(?:ay)?|fine|yes|no|n\/?a|none|nil|nothing|-+|\?+|tbd|todo|later|see above)\.?$/i

/** True when the text is blank or an empty answer. */
export const isEmptyAnswer = (s: string): boolean => {
  const t = s.trim()
  return !t || EMPTY_ANSWER.test(t)
}

/** True when the text is written and is not an empty answer. */
export const said = (s: string): boolean => !isEmptyAnswer(s)

/** True when every word of the text is an empty answer ("n/a todo", "none none", "tbd, later"): blank counts too.
 *  Compatible with isEmptyAnswer (a one-word empty answer is empty here as well); a real short answer ("TLS",
 *  "Electricity", "Fail safe") has at least one word that is not an empty answer, so it still counts (M5 confirmation). */
export const isEmptyEveryWord = (s: string): boolean => s.trim().split(/[\s,;]+/).filter(Boolean).every((w) => EMPTY_ANSWER.test(w.replace(/[.!:]+$/, '')))

/** Written, and at least one word says something. */
export const saidSomething = (s: string): boolean => said(s) && !isEmptyEveryWord(s)
