// Week 5 SysML reading micro-lab 1 (pure). Students classify marked elements of the validated listing
// sysml/week05/aerolink_fleet.sysml. Every target names the exact line and token, and a test checks that the token
// really occurs on that line, so the key cannot drift from the listing.
// Explanations paraphrase S10 sl.5-6, 9, 12, 15, 89, 167-168 (R70, R74, R79) and S06 7.6-7.7 p.63-64, 72-74, 77 (R80).
// Where a unit is classified (h, min: units accepted for use with the SI; km/h: defined from km and h), the evidence is
// the pilot library file SI.sysml (section "Units recognized in SI as specified in ISO 80000-1:2009"), not a slide.

export type ElementClass = 'definition' | 'part-usage' | 'attribute-usage' | 'type' | 'unit'

export const CLASSES: { id: ElementClass; label: string; hint: string }[] = [
  { id: 'definition', label: 'Definition', hint: 'Declared with a kind keyword followed by def (part def, attribute def): classifies a kind of thing.' },
  { id: 'part-usage', label: 'Part usage', hint: 'Declared with part (no def): a composite feature typed by a part definition, used in a context.' },
  { id: 'attribute-usage', label: 'Attribute usage', hint: 'Declared with attribute (no def): a referential feature holding data values.' },
  { id: 'type', label: 'Type (named after the colon)', hint: 'The definition, data type or quantity value type that a usage is defined by — the name after “:”.' },
  { id: 'unit', label: 'Unit (in square brackets)', hint: 'A specific measurement unit declared in the SysML SI library package, written in brackets after a number.' },
]

export type ReadingTarget = { id: string; line: number; token: string; answer: ElementClass; explanation: string }

export const LISTING_FILE = 'week05/aerolink_fleet.sysml'

export const TARGETS: ReadingTarget[] = [
  { id: 't1', line: 12, token: 'Battery', answer: 'definition', explanation: '“part def Battery” declares a part definition: a class of things that exist in space and time (S10 sl.9).' },
  { id: 't2', line: 13, token: 'usableEnergy', answer: 'attribute-usage', explanation: 'An attribute usage owned by the Battery definition, i.e. one of its features (S06 p.63). Attribute usages are always referential (S06 p.77).' },
  { id: 't3', line: 13, token: 'EnergyValue', answer: 'type', explanation: 'EnergyValue is the ISQ quantity value type of usableEnergy. Only the kind of quantity is fixed here; no unit is chosen (S06 p.77).' },
  { id: 't4', line: 18, token: 'Integer', answer: 'type', explanation: 'Integer is a primitive data type from the ScalarValues library, imported at line 9 (S06 p.77; S10 sl.9).' },
  { id: 't5', line: 20, token: 'battery', answer: 'part-usage', explanation: '“part battery : Battery” is a part usage: a composite feature of EVTOLAircraft defined by the part definition Battery (S10 sl.9). It has no multiplicity, is owned by a definition and neither subsets nor redefines anything, so it defaults to exactly one (S06 p.73).' },
  { id: 't6', line: 29, token: 'SoundPressureLevelValue', answer: 'type', explanation: 'An ISQ acoustics quantity value type. The doc comment on line 28 records that A-weighting is not captured by the unit.' },
  { id: 't7', line: 30, token: 'chargers', answer: 'part-usage', explanation: 'A part usage with multiplicity [1..*]: every vertiport has at least one charger (S06 p.64, p.73).' },
  { id: 't8', line: 33, token: 'AeroLinkNetwork', answer: 'definition', explanation: 'A part definition for the network as a whole. Definitions classify; they do not by themselves say how many vertiports AeroLink has.' },
  { id: 't9', line: 40, token: 'aerolink', answer: 'part-usage', explanation: '“part aerolink : AeroLinkNetwork” is a package-level part usage defined by AeroLinkNetwork (S10 sl.15; S06 p.64).' },
  { id: 't10', line: 41, token: 'operatingDay', answer: 'attribute-usage', explanation: 'An attribute usage that redefines the inherited operatingDay feature and binds it to a value (S10 sl.12, sl.89).' },
  { id: 't11', line: 41, token: 'h', answer: 'unit', explanation: 'h (hour) is a specific unit, given only with the value and never in the attribute definition (S06 p.77). It is not an SI base or derived unit: the SysML SI library package declares it among the units accepted for use with the SI (ISO 80000-1), defined as 60 min.' },
  { id: 't12', line: 44, token: 'km/h', answer: 'unit', explanation: 'A unit written in brackets after the number 150. The SI library package defines km/h by arithmetic on two other units (km ÷ h), as S10 sl.168 shows for derived units; it is not a coherent SI unit (that is m/s), because h is a unit accepted for use with the SI, not an SI unit.' },
  { id: 't13', line: 50, token: 'dB', answer: 'unit', explanation: 'The decibel. The source value is 65 dBA; the A-weighting must be recorded elsewhere (here, in the doc comment on Vertiport).' },
  { id: 't14', line: 51, token: 'chargers', answer: 'part-usage', explanation: 'A part usage that redefines the inherited chargers feature and narrows its multiplicity from [1..*] to [2] (S10 sl.12).' },
]

export type ReadingResult = { answered: number; correct: number; perTarget: Record<string, boolean | null> }

export function scoreReading(answers: Record<string, ElementClass | undefined>, targets: ReadingTarget[] = TARGETS): ReadingResult {
  const perTarget: Record<string, boolean | null> = {}
  let answered = 0
  let correct = 0
  for (const t of targets) {
    const a = answers[t.id]
    if (!a) {
      perTarget[t.id] = null
      continue
    }
    answered += 1
    perTarget[t.id] = a === t.answer
    if (a === t.answer) correct += 1
  }
  return { answered, correct, perTarget }
}

/** Splits one listing line into plain text and the target tokens that occur on it (first occurrence of each). */
export function segmentLine(text: string, lineTargets: ReadingTarget[]): { text: string; target?: ReadingTarget }[] {
  const found = lineTargets
    .map((t) => ({ t, at: findToken(text, t.token) }))
    .filter((x) => x.at >= 0)
    .sort((a, b) => a.at - b.at)
  const out: { text: string; target?: ReadingTarget }[] = []
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

/** Index of `token` in `text` as a whole word (identifier characters do not continue on either side), or -1. */
export function findToken(text: string, token: string): number {
  const isId = (c: string | undefined) => !!c && /[A-Za-z0-9_]/.test(c)
  let from = 0
  for (;;) {
    const i = text.indexOf(token, from)
    if (i < 0) return -1
    if (!isId(text[i - 1]) && !isId(text[i + token.length])) return i
    from = i + 1
  }
}
