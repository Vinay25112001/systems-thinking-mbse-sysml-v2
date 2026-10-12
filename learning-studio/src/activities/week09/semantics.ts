// Week 9 activity 1 (B9.2, pure): classify marked tokens of the validated listing sysml/week09/aerolink_def_usage.sysml
// as definitions, usages, or the target of a typing, specialization, subsetting or redefinition, then judge what
// the listing guarantees (holds in everything the listing describes). Every target names its line and token, and a test checks that the token occurs there and that
// the keyword or symbol in front of it matches the key, so the key cannot drift from the listing.
// Explanations paraphrase S10 sl.9-12, 15-16 (R70), S06 p.63-65, 72-73 (R80) and, for the assertions, KerML p.61-62 (R87).
import { findToken } from '../week05/reading'

export type Role = 'definition' | 'usage' | 'typed-by' | 'general' | 'subsetted' | 'redefined'

export const ROLES: { id: Role; label: string; hint: string }[] = [
  { id: 'definition', label: 'Definition (declared)', hint: 'The name being declared after a kind keyword and def (part def, attribute def): it classifies a kind of thing.' },
  { id: 'usage', label: 'Usage (declared)', hint: 'The name being declared after a kind keyword without def (part, attribute): a feature, used in a context.' },
  { id: 'typed-by', label: 'Definition the usage is defined by (after “:”)', hint: 'Feature typing: the usage is defined by this definition and inherits its features.' },
  { id: 'general', label: 'General definition (specialization, “:>” after a definition)', hint: 'Subclassification: the declared definition specializes this one and inherits its features.' },
  { id: 'subsetted', label: 'Subsetted feature (“subsets”, or “:>” after a usage)', hint: 'Subsetting: the values of the declared usage are a subset of the values of this feature.' },
  { id: 'redefined', label: 'Redefined feature (“redefines” or “:>>”)', hint: 'Redefinition: the declared usage replaces this inherited feature in its context.' },
]

export type Target = { id: string; line: number; token: string; answer: Role; explanation: string }

export const SEMANTICS_FILE = 'week09/aerolink_def_usage.sysml'

export const TARGETS: Target[] = [
  { id: 's1', line: 11, token: 'Charger', answer: 'definition', explanation: 'An abstract part definition. Every charger must be an instance of some concrete specialization, here HighPowerCharger or StandardCharger (S10 sl.10; S06 p.72).' },
  { id: 's2', line: 14, token: 'Charger', answer: 'general', explanation: 'On a definition, “:>” is the specializes keyword: HighPowerCharger is a subclassification of Charger and inherits ratedPower (S10 sl.10; S06 p.72).' },
  { id: 's3', line: 15, token: 'ratedPower', answer: 'redefined', explanation: 'The specialized definition redefines the inherited ratedPower and binds it to 350 kW for every HighPowerCharger, as S10 sl.13 binds currentColor in TrafficLightGo.' },
  { id: 's4', line: 23, token: 'chargers', answer: 'usage', explanation: 'A part usage owned by Vertiport, multiplicity 1..*: every vertiport has at least one charger (S06 p.64, p.73).' },
  { id: 's5', line: 23, token: 'Charger', answer: 'typed-by', explanation: 'Feature typing: chargers is defined by the abstract Charger, so each value is some kind of charger (S06 p.72: definitions follow “defined by” or “:”).' },
  { id: 's6', line: 25, token: 'Vertiport', answer: 'general', explanation: 'HubVertiport specializes Vertiport and inherits pads and chargers (S10 sl.10; S06 p.64).' },
  { id: 's7', line: 26, token: 'turnaroundChargers', answer: 'usage', explanation: 'A new part usage added by the specialization, defined by HighPowerCharger with multiplicity 2 (S10 sl.10: a specialization can define additional features).' },
  { id: 's8', line: 26, token: 'chargers', answer: 'subsetted', explanation: 'turnaroundChargers subsets the inherited chargers: on every hub, the two turnaround chargers are among its chargers. It is an additional feature, not a replacement (S10 sl.11; S06 p.65).' },
  { id: 's9', line: 29, token: 'chargers', answer: 'redefined', explanation: 'SpokeVertiport redefines the inherited chargers to restrict their definition to StandardCharger: on a spoke this feature replaces the inherited one (S10 sl.12; S06 p.65, the DieselFuel example).' },
  { id: 's10', line: 29, token: 'StandardCharger', answer: 'typed-by', explanation: 'The redefining usage is defined by StandardCharger, a specialization of the redefined feature’s Charger, so the type is narrowed (S10 sl.12).' },
  { id: 's11', line: 34, token: 'HubVertiport', answer: 'typed-by', explanation: 'hubs is defined by HubVertiport; together with “subsets sites” the hubs are a subset of the sites restricted to hub vertiports (KerML p.61: a subsetting feature can restrict type and multiplicity).' },
  { id: 's12', line: 35, token: 'sites', answer: 'subsetted', explanation: 'spokes subsets sites: every spoke of a network is also one of its sites (S10 sl.11).' },
  { id: 's13', line: 38, token: 'vertiportNetwork', answer: 'usage', explanation: 'A package-level part usage: a generic feature defined by VertiportNetwork that can be specialized in specific contexts (S06 p.64). It is not an instance.' },
  { id: 's14', line: 40, token: 'vertiportNetwork', answer: 'subsetted', explanation: 'On a usage, “:>” is subsetting: baselineNetwork subsets vertiportNetwork and inherits its structure, as smallVehicle :> vehicle does on S10 sl.16 (S06 p.65: reusing a usage by subsetting it).' },
  { id: 's15', line: 49, token: 'hubs', answer: 'redefined', explanation: 'alt004Network redefines the inherited hubs to constrain its multiplicity to 4 (S10 sl.12, sl.15). The baseline’s hubs[3] is untouched: the two configurations are siblings.' },
]

export type Truth = 'true' | 'false'

export type Assertion = { id: string; text: string; answer: Truth; explanation: string }

/** What the listing does and does not guarantee. FICTIONAL configuration values. */
export const ASSERTIONS: Assertion[] = [
  { id: 'a1', text: 'On every HubVertiport, each of the two turnaround chargers is also one of that hub’s chargers.', answer: 'true', explanation: 'Subsetting: the values of the subsetting feature are also values of the subsetted feature on each instance separately (KerML p.61; S10 sl.11).' },
  { id: 'a2', text: 'baselineNetwork is one particular vertiport network, i.e. an instance of VertiportNetwork.', answer: 'false', explanation: 'baselineNetwork is a usage, a feature whose values are VertiportNetwork instances in a context; the listing does not identify any instance (S06 p.63–64). Usage ≠ instance.' },
  { id: 'a3', text: 'Declaring alt004Network with hubs[4] changes the number of hubs of baselineNetwork.', answer: 'false', explanation: 'Both subset the generic vertiportNetwork and redefine hubs separately. A redefinition replaces the feature only in the context of the redefining usage (S06 p.65: the original part remains unchanged).' },
  { id: 'a4', text: 'Every charger at a spoke vertiport is a StandardCharger.', answer: 'true', explanation: 'SpokeVertiport redefines chargers with the type StandardCharger; the redefining feature replaces the inherited one and restricts its definition (S06 p.65).' },
  { id: 'a5', text: 'By the definition VertiportNetwork (lines 32–36) alone, every site of a network is one of its hubs or one of its spokes.', answer: 'false', explanation: 'hubs and spokes each subset sites (S10 sl.11), which says every hub and every spoke is a site, not the converse. A network with six sites, one hub and no spokes satisfies lines 32–36 (spokes is 0..*). In baselineNetwork and alt004Network the counts do cover the sites, but only because no site can be both a hub and a spoke — something the listing entails through the charger ratings rather than states (see the commentary; KerML p.61).' },
  { id: 'a6', text: 'Every HighPowerCharger has a rated power of 350 kW, whichever vertiport it is installed at.', answer: 'true', explanation: 'The binding is a redefinition in the definition HighPowerCharger, so every usage defined by it inherits the bound value (S10 sl.13; S06 p.64).' },
]

export type Score = { answered: number; correct: number; perItem: Record<string, boolean | null> }

export function scoreAnswers<T extends string>(answers: Record<string, T | undefined>, key: { id: string; answer: T }[]): Score {
  const perItem: Record<string, boolean | null> = {}
  let answered = 0
  let correct = 0
  for (const k of key) {
    const a = answers[k.id]
    if (!a) {
      perItem[k.id] = null
      continue
    }
    answered += 1
    perItem[k.id] = a === k.answer
    if (a === k.answer) correct += 1
  }
  return { answered, correct, perItem }
}

/** The text in front of a target token on its line, used by the tests to check the key against the listing. */
export function before(line: string, token: string): string {
  const at = findToken(line, token)
  return at < 0 ? '' : line.slice(0, at)
}

/**
 * The role a token's position implies, read from the keyword or symbol in front of it. This is the rule the key
 * follows; it is a reading aid for this listing, not a parser.
 */
export function roleFromContext(line: string, token: string): Role | null {
  const pre = before(line, token)
  if (findToken(line, token) < 0) return null
  if (/\bdef\s+$/.test(pre)) return 'definition'
  if (/(redefines|:>>)\s*$/.test(pre)) return 'redefined'
  if (/(subsets)\s*$/.test(pre)) return 'subsetted'
  if (/:>\s*$/.test(pre)) return /\bdef\b/.test(pre) ? 'general' : 'subsetted'
  if (/:\s*$/.test(pre)) return 'typed-by'
  if (/\b(part|attribute|item|port|action)\s+$/.test(pre)) return 'usage'
  return null
}

/** Splits one listing line into plain text and the target tokens on it (first whole-word occurrence of each). */
export function segmentLine(text: string, lineTargets: Target[]): { text: string; target?: Target }[] {
  const found = lineTargets
    .map((t) => ({ t, at: findToken(text, t.token) }))
    .filter((x) => x.at >= 0)
    .sort((a, b) => a.at - b.at)
  const out: { text: string; target?: Target }[] = []
  let pos = 0
  for (const { t, at } of found) {
    if (at < pos) continue
    if (at > pos) out.push({ text: text.slice(pos, at) })
    out.push({ text: t.token, target: t })
    pos = at + t.token.length
  }
  if (pos < text.length) out.push({ text: text.slice(pos) })
  return out
}
