// Week 6 SysML micro-lab 2 (B6.5, pure). Two tasks on the validated listing sysml/week06/aerolink_charging.sysml:
// (1) classify marked elements, now including specialization, subsetting and non-quantity types; (2) judge whether a
// proposed value binding uses a unit of the right kind. Every target names its exact line and token, and a test checks
// that the token occurs on that line, so the key cannot drift from the listing.
// Explanations paraphrase S10 sl.9-12, 15-16, 167-168 (R70, R79) and S06 7.6-7.7 p.63-64, 76-77 (R80).
// findToken is reused from the Week 5 micro-lab 1 logic.
import { findToken } from '../week05/reading'

export type ElementClass2 = 'definition' | 'general' | 'part-usage' | 'attribute-usage' | 'quantity-type' | 'other-type' | 'unit'

export const CLASSES2: { id: ElementClass2; label: string; hint: string }[] = [
  { id: 'definition', label: 'Definition', hint: 'Declared with a kind keyword followed by def (part def, attribute def): classifies a kind of thing.' },
  { id: 'general', label: 'General definition (after :>)', hint: 'The definition that a specialized definition specializes; its features are inherited.' },
  { id: 'part-usage', label: 'Part usage', hint: 'Declared with part (no def): a composite feature defined by a part definition, in a context.' },
  { id: 'attribute-usage', label: 'Attribute usage', hint: 'Declared with attribute (no def): a referential feature holding data values.' },
  { id: 'quantity-type', label: 'Quantity value type (ISQ)', hint: 'A type after “:” that fixes the kind of quantity (power, energy, duration); a unit is given only with a value.' },
  { id: 'other-type', label: 'Other type (no unit)', hint: 'A type after “:” that is not a quantity: a primitive data type (Natural, String, Real) or an attribute definition.' },
  { id: 'unit', label: 'Unit (in square brackets)', hint: 'A unit from the SI library, written in brackets after a number; may be an expression of units.' },
]

export type ReadingTarget2 = { id: string; line: number; token: string; answer: ElementClass2; explanation: string }

export const LISTING2_FILE = 'week06/aerolink_charging.sysml'

export const TARGETS2: ReadingTarget2[] = [
  { id: 'm1', line: 12, token: 'ReadinessAssessment', answer: 'definition', explanation: 'An attribute definition: it defines attributive data with two features. Attribute definitions may not have composite features (S10 sl.9).' },
  { id: 'm2', line: 14, token: 'trl', answer: 'attribute-usage', explanation: 'An attribute usage owned by ReadinessAssessment. Attribute usages are always referential (S06 p.77).' },
  { id: 'm3', line: 14, token: 'Natural', answer: 'other-type', explanation: 'A primitive data type from ScalarValues. A TRL is an ordinal level, so it is not typed by a quantity value type and takes no unit (S06 p.77: attribute usages can be typed by primitive data types).' },
  { id: 'm4', line: 18, token: 'Charger', answer: 'definition', explanation: 'An abstract part definition: every charger must be a member of some specialization, here HighPowerCharger or StandardCharger (S10 sl.10).' },
  { id: 'm5', line: 19, token: 'PowerValue', answer: 'quantity-type', explanation: 'An ISQ quantity value type. It fixes the kind of quantity (power); the unit appears only with a value, so kW and W are both acceptable later (S06 p.77).' },
  { id: 'm6', line: 23, token: 'HighPowerCharger', answer: 'definition', explanation: 'A specialized part definition with the short name TECH-001. It inherits ratedPower and chargeTimeToDispatch from Charger and adds readiness (S10 sl.10; S06 p.64).' },
  { id: 'm7', line: 23, token: 'Charger', answer: 'general', explanation: '“:>” after a definition name is specialization (the specializes keyword). Charger is the general definition whose features HighPowerCharger inherits (S10 sl.10).' },
  { id: 'm8', line: 24, token: 'readiness', answer: 'attribute-usage', explanation: 'An attribute usage typed by the attribute definition ReadinessAssessment: a structured value, not a part (S10 sl.9).' },
  { id: 'm9', line: 37, token: 'chargers', answer: 'part-usage', explanation: 'A part usage with multiplicity [1..*], defined by the abstract Charger: a hub has at least one charger of some kind (S06 p.64).' },
  { id: 'm10', line: 41, token: 'hub1', answer: 'part-usage', explanation: 'A package-level part usage defined by HubVertiport. It inherits connectionLimit and chargers from its definition (S06 p.64; S10 sl.15).' },
  { id: 'm11', line: 45, token: 'turnaroundChargers', answer: 'part-usage', explanation: 'A part usage typed by the specialized HighPowerCharger, with multiplicity 2, that subsets the inherited chargers: its values are a subset of hub1’s chargers (S10 sl.11).' },
  { id: 'm12', line: 46, token: 'kW', answer: 'unit', explanation: 'kilowatt, a prefixed SI power unit. It agrees with the PowerValue type of ratedPower.' },
  { id: 'm13', line: 49, token: 'trl', answer: 'attribute-usage', explanation: 'A redefinition of the inherited trl, bound to 6 with no unit, inside the redefined readiness value (S10 sl.12).' },
  { id: 'm14', line: 56, token: 'h', answer: 'unit', explanation: 'hour, part of the unit expression kW * h (kilowatt hour). A derived unit can be written as an arithmetic expression of units (S10 sl.168); kW × h is an energy, matching EnergyValue.' },
]

export type Verdict = 'ok' | 'wrong-kind' | 'not-a-quantity'

export const VERDICTS: { id: Verdict; label: string }[] = [
  { id: 'ok', label: 'Unit matches the kind of quantity' },
  { id: 'wrong-kind', label: 'Unit of a different kind of quantity' },
  { id: 'not-a-quantity', label: 'The attribute is not a quantity: no unit belongs here' },
]

export type UnitEdit = { id: string; binding: string; answer: Verdict; explanation: string }

/** Proposed edits to the usages in the listing. Values are FICTIONAL. */
export const UNIT_EDITS: UnitEdit[] = [
  { id: 'u1', binding: 'attribute redefines chargeTimeToDispatch = 1200 [s];', answer: 'ok', explanation: 'Seconds are a duration unit, and 1200 s equals the 20 min in the listing. The type fixes only the kind of quantity, so either unit is correct (S06 p.77).' },
  { id: 'u2', binding: 'attribute redefines ratedPower = 160 [kW * h];', answer: 'wrong-kind', explanation: 'kW × h is an energy, but ratedPower is a PowerValue. The 2026-08 pilot implementation accepted this line with no diagnostic in the course’s check, so passing the tool does not prove the units are right.' },
  { id: 'u3', binding: 'attribute redefines usableEnergy = 576 [MJ];', answer: 'ok', explanation: 'MJ (megajoule) is an energy unit, and 160 kWh = 160 × 3.6 MJ = 576 MJ: the same value in another unit of the same kind.' },
  { id: 'u4', binding: 'attribute redefines trl = 6 [h];', answer: 'not-a-quantity', explanation: 'trl is typed by Natural, an ordinal level with no unit. A unit here would treat a readiness level as a measured quantity.' },
  { id: 'u5', binding: 'attribute redefines maxChargePower = 400 [kW];', answer: 'ok', explanation: 'kW is a power unit, matching PowerValue. Note what the binding cannot say: whether 400 kW is achievable is a TRL question (TECH-002), not a typing question.' },
  { id: 'u6', binding: 'attribute redefines chargeTimeToDispatch = 20 [kW];', answer: 'wrong-kind', explanation: 'kW is a power unit; chargeTimeToDispatch is a DurationValue. The number is right and the unit is wrong, which is exactly what a reader must catch.' },
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

/** Splits one listing line into plain text and the target tokens on it (first whole-word occurrence of each). */
export function segmentLine2(text: string, lineTargets: ReadingTarget2[]): { text: string; target?: ReadingTarget2 }[] {
  const found = lineTargets
    .map((t) => ({ t, at: findToken(text, t.token) }))
    .filter((x) => x.at >= 0)
    .sort((a, b) => a.at - b.at)
  const out: { text: string; target?: ReadingTarget2 }[] = []
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
