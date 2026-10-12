// Week 2 — SoS classifier logic (pure). Classification rule and SoS types are paraphrased from the verified readings:
//   R08 p.832–833: Maier's definition of an SoS rests on TWO properties — operational and managerial independence of the
//                  components; complexity and geographic distribution are "not the appropriate taxonomic classifiers".
//   R09 p.866:     Maier's five characteristics ("not criteria"); operational and managerial independence are the two
//                  principal distinguishing characteristics — a system without both is not an SoS.
//   R09 p.868–869: the four SoS types (directed, acknowledged, collaborative, virtual). R08 p.833 credits the four kinds
//                  to Dahmann, Lane and Rebovich (2008); R09 p.868 cites Maier (1998), Dahmann and Baldwin (2008) and
//                  ISO 21839 for the taxonomy. The types are not Maier's alone.
// Operational independence is tested in BOTH directions (R08 p.832: "the component systems must be able to usefully
// operate independently"): every constituent, AeroLink included, must be useful on its own. Where a case passes only
// because of a stated FICTIONAL premise, the case description says so.
// The governance decision rule that maps answers to a type and the case descriptions are INSTRUCTOR-AUTHORED.
// The cases are FICTIONAL; no case is a claim about a real organisation.
import type { Citation } from '../../content/readings'

export type CharacteristicId = 'operational' | 'managerial' | 'geographic' | 'emergent' | 'evolutionary'
export type Rating = 'yes' | 'partly' | 'no'
export type Verdict = 'sos' | 'not-sos' | 'borderline'
export type SosType = 'directed' | 'acknowledged' | 'collaborative' | 'virtual'

export const CHARACTERISTICS: { id: CharacteristicId; label: string; question: string; principal: boolean; cite: Citation }[] = [
  { id: 'operational', label: 'Operational independence', question: 'If the whole were taken apart, could each component system still usefully operate and fulfil purposes on its own?', principal: true, cite: { reading: 'R08', pages: '832' } },
  { id: 'managerial', label: 'Managerial independence', question: 'Are the component systems separately acquired and do they actually operate independently, keeping an existence outside the whole?', principal: true, cite: { reading: 'R08', pages: '832–833' } },
  { id: 'geographic', label: 'Geographic distribution', question: 'Are the component systems spread out geographically?', principal: false, cite: { reading: 'R09', pages: '866' } },
  { id: 'emergent', label: 'Emergent behaviour', question: 'Does the whole show behaviour or capability that no component provides on its own?', principal: false, cite: { reading: 'R09', pages: '866' } },
  { id: 'evolutionary', label: 'Evolutionary development', question: 'Does the whole evolve as components are added, changed or removed over time, rather than being designed once?', principal: false, cite: { reading: 'R09', pages: '866' } },
]

export type Ratings = Partial<Record<CharacteristicId, Rating>>
export type Governance = { agreedPurpose?: boolean; designatedManager?: boolean; subordinated?: boolean }

export const SOS_TYPE_LABEL: Record<SosType, string> = {
  directed: 'Directed',
  acknowledged: 'Acknowledged',
  collaborative: 'Collaborative',
  virtual: 'Virtual',
}

export const SOS_TYPE_DEFINITION: Record<SosType, string> = {
  directed: 'Created and managed for specific purposes; constituents can operate independently but their normal operational mode is subordinated to the central managed purpose.',
  acknowledged: 'Recognised objectives, a designated manager and resources for the SoS, while constituents keep their own ownership, objectives, funding and development; changes rest on cooperative agreements.',
  collaborative: 'Constituents interact more or less voluntarily to fulfil agreed central purposes; the central players collectively decide how to provide or deny service.',
  virtual: 'No central management authority and no centrally agreed purpose; large-scale behaviour emerges and is maintained by relatively invisible mechanisms.',
}

/**
 * Maier's test (R08 p.832–833; R09 p.866): an SoS needs BOTH principal characteristics. The other three characteristics
 * never decide the verdict. A 'partly' on a principal characteristic (with no 'no') is borderline: argue it explicitly
 * (see verdictFollows — borderline may be argued down to "not an SoS").
 */
export function maierVerdict(r: Ratings): Verdict | undefined {
  const o = r.operational
  const m = r.managerial
  if (!o || !m) return undefined
  if (o === 'no' || m === 'no') return 'not-sos'
  if (o === 'yes' && m === 'yes') return 'sos'
  return 'borderline'
}

/**
 * Instructor-authored decision rule over the R09 p.868–869 definitions: no centrally agreed purpose → virtual;
 * constituents' normal operation subordinated to the SoS purpose → directed; a designated SoS manager with resources →
 * acknowledged; otherwise (agreed purpose, voluntary participation) → collaborative.
 */
export function sosType(g: Governance): SosType | undefined {
  if (g.agreedPurpose === undefined) return undefined
  if (!g.agreedPurpose) return 'virtual'
  if (g.subordinated === undefined || g.designatedManager === undefined) return undefined
  if (g.subordinated) return 'directed'
  if (g.designatedManager) return 'acknowledged'
  return 'collaborative'
}

export type SosCase = {
  id: string
  name: string
  description: string
  key: Record<CharacteristicId, Rating>
  why: Record<CharacteristicId, string>
  verdict: Verdict
  /** Other verdicts the key accepts when argued (e.g. 'not-sos' for a case keyed 'borderline'). */
  alsoAccept?: Verdict[]
  governance?: Required<Governance>
  type?: SosType
  verdictWhy: string
}

export const SOS_CASES: SosCase[] = [
  {
    id: 'aerolink-owned',
    name: 'Boundary A: AeroLink’s own operation (narrower than Week 1’s ENT-001)',
    description:
      'Only what AeroLink itself acquires, owns, funds and manages: the fleet of 12 aircraft, the operations centre, the maintenance facility and the booking app (FICTIONAL Data Sheet values). This boundary is deliberately NARROWER than Week 1’s ENT-001, which also contains the vertiports and chargers that partners own: here the question is “who acquires and manages each component?”, not “what determines passenger waiting time?”. The vertiports, the grid and the airspace are outside this boundary.',
    key: { operational: 'partly', managerial: 'no', geographic: 'yes', emergent: 'yes', evolutionary: 'partly' },
    why: {
      operational: 'An aircraft could in principle fly a useful trip alone, but the booking app and dispatch software are useless without the fleet. Some components could operate independently; many could not.',
      managerial: 'Every component is acquired and managed by AeroLink and has no operational existence outside AeroLink. This alone rules out an SoS under Maier’s definition.',
      geographic: 'Aircraft and crews operate across six vertiports in the city — distributed, but geographic distribution is not a taxonomic classifier (R08 p.833).',
      emergent: 'Network throughput and passenger waiting time emerge from fleet × chargers × demand (Week 1). Emergence is common in SoS but does not make something an SoS.',
      evolutionary: 'The fleet grows in increments, but under one owner’s plan rather than by independent evolution of separately managed components.',
    },
    verdict: 'not-sos',
    verdictWhy:
      'A system and an enterprise — not an SoS. R08 p.833 is direct: a key purpose of an enterprise is to establish operational dependence between the systems it owns and operates, so most enterprises do not meet the criteria of operational and managerial independence.',
  },
  {
    id: 'ent-001',
    name: 'Week 1’s ENT-001: the AeroLink service enterprise as bounded in L1',
    description:
      'The Week 1 boundary, unchanged: fleet, vertiports and chargers, operations centre and passenger demand, bounded for the question of passenger waiting time. The vertiports and their chargers are owned and run by independent vertiport operators (STK-005) under an agreement with AeroLink; every other component is AeroLink’s (FICTIONAL). The grid, the airspace system and emergency services are outside (EXT-001, EXT-002, EXT-006).',
    key: { operational: 'partly', managerial: 'partly', geographic: 'yes', emergent: 'yes', evolutionary: 'partly' },
    why: {
      operational: 'The partner vertiports could usefully host other operators without AeroLink, but AeroLink’s dispatch and booking components have no use without the fleet, and passenger demand is not a system that “operates” on its own. Some components pass the test; others do not.',
      managerial: 'One kind of component — the vertiports — is separately owned and managed and keeps an existence outside AeroLink; everything else is acquired and managed by AeroLink. Managerial independence holds for one partner, not for the components in general.',
      geographic: 'Six vertiports across the city — not a taxonomic classifier.',
      emergent: 'Waiting time and throughput emerge from fleet, chargers and demand together (Week 1).',
      evolutionary: 'Vertiport operators upgrade on their own plans, but the fleet and operations centre evolve under AeroLink’s plan: partly.',
    },
    verdict: 'borderline',
    alsoAccept: ['not-sos'],
    verdictWhy:
      'Borderline under Maier’s rule, and best argued as an enterprise rather than an SoS: one independently owned partner sits inside a boundary whose purpose is to create operational dependence (R08 p.833). “Not an SoS” is equally acceptable when the memo argues why the one partner’s independence does not make the whole an SoS. The lesson: the same name (AeroLink) gives different verdicts for boundary A and ENT-001, so state the boundary first.',
  },
  {
    id: 'regional-uam',
    name: 'Boundary B: the regional urban-air-mobility service (AeroLink + partners)',
    description:
      'The capability “safe on-demand air trips across the region” needs AeroLink’s operation (fleet, operations centre, maintenance base), vertiports owned by independent operators (STK-005), the air navigation service provider’s airspace system (STK-007), the electric utility’s grid (STK-010) and emergency response services (STK-006). FICTIONAL premises that the classification depends on: the partner vertiports also host helicopter and medical-transport flights by other operators, and AeroLink holds its own operating approval and a base pad at its maintenance facility, from which it flies charter and medical-cargo work that uses no partner vertiport. The parties have signed a memorandum agreeing the common purpose and coordinate in a joint working group with no budget and no authority over any member.',
    key: { operational: 'yes', managerial: 'yes', geographic: 'yes', emergent: 'yes', evolutionary: 'yes' },
    why: {
      operational: 'Both directions hold, given the stated premises. The partners are useful without AeroLink: the grid serves the city, the airspace system serves every airspace user, emergency services serve everyone and the vertiports host other operators. AeroLink is useful without the partner vertiports: from its own base pad it flies charter and medical-cargo work. (Disassembly removes the SoS integration, not the ordinary public services any operator buys, such as air-traffic services and grid power.) Without the base-pad premise AeroLink’s operation would have no useful purpose apart from the vertiports, the honest rating would be “partly”, and the case would become borderline.',
      managerial: 'Each constituent is separately owned, funded and managed and keeps operating whatever the others do.',
      geographic: 'Constituents are spread across the region — consistent with an SoS, but not what makes it one.',
      emergent: 'The door-to-door trip capability exists only when all constituents interact; none can provide it alone (the ISO 21839 SoS definition quoted in R09 p.866).',
      evolutionary: 'The utility, the airspace provider and the vertiport operators change on their own cycles; the SoS evolves as they do.',
    },
    verdict: 'sos',
    governance: { agreedPurpose: true, designatedManager: false, subordinated: false },
    type: 'collaborative',
    verdictWhy:
      'An SoS, because both principal characteristics hold for every constituent, AeroLink included (the base-pad premise carries AeroLink’s half of operational independence). With an agreed purpose but no designated manager or SoS resources, it is collaborative. R09 p.869 notes that types combine and change over time: in your memo, say which governance change would move it to another type.',
  },
  {
    id: 'metro-line',
    name: 'Comparison A: a single-operator metro line (generic, FICTIONAL)',
    description:
      'Trains, signalling, power supply, stations and a control centre, all procured, owned and operated by one transit operator to run one line along a 20 km corridor.',
    key: { operational: 'no', managerial: 'no', geographic: 'yes', emergent: 'yes', evolutionary: 'partly' },
    why: {
      operational: 'The signalling system or the control centre has no useful purpose apart from the line; the trains cannot run without them.',
      managerial: 'One operator acquires and manages everything; no component keeps an independent operational existence.',
      geographic: 'Spread along the corridor — yet still a conventional system.',
      emergent: 'Line capacity and headway emerge from trains, signalling and stations together — an ordinary system property.',
      evolutionary: 'Upgrades happen, but under a single owner’s configuration control.',
    },
    verdict: 'not-sos',
    verdictWhy: 'A large, distributed, complex system — but not an SoS. It is the counter-example to “every big system is an SoS”.',
  },
  {
    id: 'multimodal-ecosystem',
    name: 'Comparison B: an open multimodal travel ecosystem (generic, FICTIONAL)',
    description:
      'An independent bus company, a bike-share firm, two ride-hail firms and two general-purpose map and navigation apps. The apps give walking and driving directions on their own and also consume each operator’s published timetable and availability data (FICTIONAL premise). Nobody manages the whole and the parties have agreed no common purpose; each pursues its own business.',
    key: { operational: 'yes', managerial: 'yes', geographic: 'yes', emergent: 'yes', evolutionary: 'yes' },
    why: {
      operational: 'Every operator runs a useful service on its own, and the map apps are useful for walking and driving directions without any operator’s data. If the apps were journey planners with no use beyond the operators’ timetables, they would fail the test and the honest rating would be “partly”.',
      managerial: 'Each is separately owned and managed and operates independently.',
      geographic: 'City-wide distribution — consistent with, not decisive for, SoS.',
      emergent: 'Door-to-door multimodal journeys emerge from apps combining independent services.',
      evolutionary: 'Operators and apps enter, change and leave independently.',
    },
    verdict: 'sos',
    governance: { agreedPurpose: false, designatedManager: false, subordinated: false },
    type: 'virtual',
    verdictWhy: 'An SoS with no central authority and no centrally agreed purpose: virtual. The large-scale behaviour is held together only by relatively invisible mechanisms such as shared data formats.',
  },
]

export type CaseAnswer = { ratings: Ratings; verdict?: Verdict; governance: Governance; type?: SosType }

export type CaseFeedback = {
  ratingMatches: number
  ratingsAnswered: number
  /** The verdict implied by the student's own ratings (Maier's rule). */
  impliedVerdict?: Verdict
  /** The student's stated verdict follows from the student's own ratings. */
  consistent?: boolean
  /** Consistent only if argued: a 'partly' on a principal characteristic, concluded as not an SoS (R09 p.866). */
  needsArgument: boolean
  verdictMatchesKey?: boolean
  impliedType?: SosType
  typeConsistent?: boolean
  typeMatchesKey?: boolean
  /** Non-principal characteristics the student rated 'yes' while calling the case an SoS with a principal 'no' — the classic error. */
  decidedByNonPrincipal: boolean
}

/**
 * Does the stated verdict follow from the implied one? A 'partly' rating (implied 'borderline') supports either
 * 'borderline' or 'not-sos': R09 p.866 says a system that does not exhibit both characteristics is not an SoS, so a
 * partial characteristic can be argued down to "not an SoS" — but the argument must be made explicitly.
 */
export function verdictFollows(stated: Verdict, implied: Verdict): boolean {
  return stated === implied || (implied === 'borderline' && stated === 'not-sos')
}

export function evaluateCase(c: SosCase, a: CaseAnswer): CaseFeedback {
  const ids = CHARACTERISTICS.map((x) => x.id)
  const answered = ids.filter((id) => a.ratings[id])
  const impliedVerdict = maierVerdict(a.ratings)
  const impliedType = sosType(a.governance)
  const nonPrincipalYes = CHARACTERISTICS.filter((x) => !x.principal && a.ratings[x.id] === 'yes').length
  return {
    ratingMatches: answered.filter((id) => a.ratings[id] === c.key[id]).length,
    ratingsAnswered: answered.length,
    impliedVerdict,
    consistent: a.verdict && impliedVerdict ? verdictFollows(a.verdict, impliedVerdict) : undefined,
    needsArgument: a.verdict === 'not-sos' && impliedVerdict === 'borderline',
    verdictMatchesKey: a.verdict ? a.verdict === c.verdict || (c.alsoAccept ?? []).includes(a.verdict) : undefined,
    impliedType,
    typeConsistent: a.type && impliedType ? a.type === impliedType : undefined,
    typeMatchesKey: a.type && c.type ? a.type === c.type : undefined,
    decidedByNonPrincipal: a.verdict === 'sos' && impliedVerdict === 'not-sos' && nonPrincipalYes > 0,
  }
}
