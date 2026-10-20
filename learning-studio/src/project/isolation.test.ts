// Practice vs project isolation (P1-T10, P1-T11), the src/project import boundary (architecture §4), and Week 1 data in
// the Week 8 preview (P1-T12 unit part, T-C1, T-C2).
import { describe, expect, it } from 'vitest'
import { STAKEHOLDERS } from '../content/lectures/week01/aerolinkCase'
import { REFERENCE_STK_IDS } from '../workbench/week1/stakeholders'
import { isAeroLink, needsMinimum } from '../workbench/week1/team'
import { TEAM_FIXTURE } from '../workbench/week1/teamFixture'
import { generateSysml, sourceFromTeam } from '../workbench/week8/skeleton'
import { fromTeamRecord, toTeamRecord } from './adapters/week1'
import { week1Milestone } from './adapters/week1Status'
import { buildPreview, sourceFromProject } from './adapters/week8'
import { commitOps } from './model/commit'
import { emptyProject } from './model/create'
import { copyStakeholdersOps, markAdaptedOps } from './practice/copyFromPractice'
import { exportProjectText } from './transfer/exportProject'

const SOURCES = import.meta.glob(['./**/*.ts', './**/*.tsx', '!./**/*.test.ts', '!./**/*.test.tsx'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>

describe('src/project import boundary', () => {
  it('nothing under src/project imports practice or AeroLink state, except copyFromPractice.ts', () => {
    const forbidden = [/lib\/storage['"]/, /state\/AppState['"]/, /state\/Workspace['"]/, /model\/reference\//, /aerolinkCase['"]/]
    const offenders: string[] = []
    expect(Object.keys(SOURCES).length).toBeGreaterThan(20)
    for (const [f, text] of Object.entries(SOURCES)) {
      const rel = f.replace(/^\.\//, '')
      if (rel === 'practice/copyFromPractice.ts') continue
      const imports = [...text.matchAll(/^import[^'"]*['"]([^'"]+)['"]/gm)].map((m) => m[1])
      for (const i of imports) if (forbidden.some((re) => re.test(`${i}'`))) offenders.push(`${rel} → ${i}`)
    }
    expect(offenders).toEqual([])
  })
})

describe('practice vs project isolation', () => {
  it('a new project contains no AeroLink names or reference IDs', async () => {
    const text = await exportProjectText(emptyProject({ teamLabel: '07', initials: 'JS' }), { exportedBy: 'JS' })
    expect(isAeroLink(text)).toBe(false)
    for (const s of STAKEHOLDERS) expect(text).not.toContain(s.name)
    const j = JSON.parse(text)
    expect(j.artifacts.filter((a: { type: string }) => a.type === 'STK')).toEqual([])
    expect(REFERENCE_STK_IDS.length).toBeGreaterThan(0)
  })

  it('P1-T11: copied practice stakeholders get new IDs and provenance, and count only after they are adapted', () => {
    const base = fromTeamRecord(TEAM_FIXTURE).doc
    const stamp = { at: '2026-10-20T10:00:00.000Z', by: 'JS', change: 'CHG-000050' }
    const { ops, created } = copyStakeholdersOps(base, ['STK-002', 'STK-006'], stamp)
    expect(created[0]).toBe(`STK-00${TEAM_FIXTURE.stakeholders.length + 1}`)
    const r = commitOps(base, ops, stamp, 'copy')
    if (!r.ok) throw new Error(r.error)
    const copied = Object.values(r.doc.artifacts).filter((a) => a.provenance.kind === 'copied-from-practice')
    expect(copied.length).toBe(created.length)
    const stk = copied.find((a) => a.type === 'STK')!
    expect(stk.provenance).toMatchObject({ copiedFrom: { case: 'AeroLink', id: 'STK-002' }, adapted: false })
    // not counted: the milestone's record leaves them out; the lab tool still shows them
    expect(week1Milestone(r.doc).record.stakeholders.length).toBe(TEAM_FIXTURE.stakeholders.length)
    expect(toTeamRecord(r.doc).stakeholders.length).toBe(TEAM_FIXTURE.stakeholders.length + 2)
    expect(week1Milestone(r.doc).unadapted).toBe(created.length)
    const r2 = commitOps(r.doc, markAdaptedOps(stk), { ...stamp, change: 'CHG-000051' }, 'adapted')
    if (!r2.ok) throw new Error(r2.error)
    expect(week1Milestone(r2.doc).record.stakeholders.length).toBe(TEAM_FIXTURE.stakeholders.length + 1)
    expect(needsMinimum(TEAM_FIXTURE.charter).needs).toBe(8)
  })
})

describe('Week 1 data in the Week 8 preview', () => {
  it('T-C1/T-C2: sourceFromProject equals sourceFromTeam on the record and generates the same SysML text', () => {
    const doc = fromTeamRecord(TEAM_FIXTURE).doc
    const a = sourceFromProject(doc)
    const b = sourceFromTeam(TEAM_FIXTURE, a.origin)
    expect(a).toEqual(b)
    const opts = { purpose: 'Plan pantry deliveries and decide where to add cold storage for the county.', date: '2026-10-19' }
    expect(generateSysml(a, opts).text).toBe(generateSysml(b, opts).text)
  })
  it('P1-T12: stakeholders and needs appear with a proposed or blocking status, never Mapped', () => {
    const p = buildPreview(fromTeamRecord(TEAM_FIXTURE).doc, '2026-10-19')
    const stk = p.groups.find((g) => g.kind.prefix === 'STK')!
    expect(stk.rows.map((r) => r.id)).toContain('STK-001')
    expect(p.text).toContain("<'STK-001'>")
    expect(p.counts.mapped).toBe(0)
    expect(p.groups.find((g) => g.kind.prefix === 'NEED')!.rows.every((r) => r.status === 'mapping-proposed')).toBe(true)
  })
})
