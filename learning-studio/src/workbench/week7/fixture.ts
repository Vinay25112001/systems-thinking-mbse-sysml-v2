// A complete, realistic Week 7 package for a FICTIONAL student team: the Riverside Food Bank Network of the Week 1–6
// fixtures (read-only), assembled from its six exports. Used by the unit and component tests and the e2e spec; it must
// reach "review closed", and record.test.ts mutates it to prove each check can fail. It deliberately holds the short but
// valid answers the course calls complete: a one-word reason ("Duplicate"), initials as owners ("TL"), an R ID as the
// residual risk ("R-002"). Every finding the audit computes on these exports gets a disposition here; the carried ones keep
// the reason an earlier week recorded. Not imported by application code. Never AeroLink.
import { teamModelInputs } from '../week1/team'
import { TEAM_FIXTURE } from '../week1/teamFixture'
import { modelInputs as w2 } from '../week2/record'
import { week2Fixture } from '../week2/fixture'
import { modelInputs as w3 } from '../week3/record'
import { week3Fixture } from '../week3/fixture'
import { modelInputs as w4 } from '../week4/record'
import { week4Fixture } from '../week4/fixture'
import { modelInputs as w5 } from '../week5/record'
import { week5Fixture } from '../week5/fixture'
import { modelInputs as w6 } from '../week6/record'
import { week6Fixture } from '../week6/fixture'
import { EMPTY_RECORD, normalizePackage, packageOf, threadOf, type Disposition, type Week7Record } from './record'

/** The six exports, as the team downloaded them from the weekly lab tools. */
export const SOURCE_JSONS: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: JSON.stringify(teamModelInputs(TEAM_FIXTURE, '2026-10-19')),
  2: JSON.stringify(w2(week2Fixture())),
  3: JSON.stringify(w3(week3Fixture())),
  4: JSON.stringify(w4(week4Fixture())),
  5: JSON.stringify(w5(week5Fixture())),
  6: JSON.stringify(w6(week6Fixture())),
}

/** The team's dispositions per finding kind (Week 7 review M2, M3): every accepted finding has a rationale that cites its
 *  evidence (an ID or the week whose record holds it), never a bare completion claim; every deferred one has an owner and a
 *  Phase II week. The Riverside exports are OLD files whose Week 4 and 5 externals collide with Week 1's EXT IDs (the Week 4
 *  tool numbered externals from EXT-001 before the fix): the collisions import, are flagged and can only be deferred. */
const PLAN: Record<string, (id: string) => Disposition> = {
  collision: (id) => ({ disposition: 'defer', reason: `Week 4 numbered externals from EXT-001: ${id} is renumbered when the Week 8 model is built`, owner: 'TL', week: '8' }),
  'stale-disposition': (id) => ({ disposition: 'record', reason: `Kept as history: the Week 2 text is superseded, ${id} is now flowed down (see the Week 4 record)`, owner: '', week: '' }),
  'dropped-open-item': () => ({ disposition: 'defer', reason: 'Still open: the requirement is written with the Week 9 requirements model', owner: 'RM', week: '9' }),
  'childless-need': (id) => ({ disposition: 'record', reason: `${id} waits on the city agreement, recorded in the Week 2 record`, owner: '', week: '' }),
  'open-item': () => ({ disposition: 'defer', reason: 'Carried from the Week 6 baseline review', owner: 'TL', week: '10' }),
}
const DEFAULT = (id: string): Disposition => ({ disposition: 'record', reason: `Accepted for Phase I; evidence in the Week 6 record (${id})`, owner: '', week: '' })

export function week7Fixture(): Week7Record {
  const base: Week7Record = { ...EMPTY_RECORD, sources: { ...SOURCE_JSONS } }
  const pkg = packageOf(base)
  const dispositions: Record<string, Disposition> = {}
  for (const f of pkg.findings) dispositions[f.key] = (PLAN[f.kind] ?? DEFAULT)(f.ids[0] ?? f.key)
  const w6inc = pkg.by[6]!.increments.find((x) => !x.baseline)!
  const need = [...pkg.index.values()].filter((e) => e.prefix === 'NEED').map((e) => threadOf(pkg, e.id)).find((t) => t.reachesSys && t.reachesArch && t.reachesInterface)?.need ?? 'NEED-001'
  return normalizePackage({
    ...base,
    dispositions,
    summary: {
      recommendation: 'Approve the package as the Phase II baseline, with the deferred items carried as open items.',
      evidence: 'REQ-STK-004, PHY-001 and IF-006 trace the cold chain end to end.',
      conditions: 'The freezer alarm limit (U-001) is confirmed before the model is baselined.',
      residual: 'R-002',
      decisions: 'Approve the baseline; approve the text-gateway change.',
      next: w6inc.id,
    },
    lessons: 'Export every week again after a change upstream.\nKeep IDs stable from Week 1.',
    owners: { summary: 'TL', enterprise: 'MV', stakeholders: 'MV', requirements: 'RM', trade: 'AK', architecture: 'TL', interfaces: 'TL', roadmap: 'AK', audit: 'RM', lessons: 'MV', ai: 'RM' },
    decision: pkg.by[3]?.trade.recommended.trim() ? 'TRADE' : (pkg.by[4]?.decisions[0]?.id ?? ''),
    threadNeed: need,
    rids: [
      { id: 'RID-001', from: 'Team 03', location: 'REQ-STK-004', finding: 'The delivery window has no verification criterion in the package.', criterion: 'Every requirement names its verification method and criterion', severity: 'major', disposition: 'accept', response: 'Criterion added from the Week 2 record.', owner: 'RM' },
      { id: 'RID-002', from: 'Instructor', location: 'Evolution roadmap', finding: 'The far-term increment has no trigger a reviewer can observe.', criterion: 'An entry trigger a reviewer could observe', severity: 'minor', disposition: 'reject', response: `${w6inc.id} trigger is the board decision, an observable event.`, owner: '' },
    ],
    aiStatement: 'We used a chat assistant to draft the executive summary wording and checked every ID it cited against the package index; we rejected one invented requirement ID.',
    issued: { RID: 2 },
  })
}
