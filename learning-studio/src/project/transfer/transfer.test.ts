// Export and import: round trip with stable IDs and relationships (P1-T8, T-C11), checksum mismatch reported, the plan
// classes and no silent overwrite (P1-T9), legacy Week 1 files (P1-T1), the readable report.
import { describe, expect, it } from 'vitest'
import { normalizeTeam, teamModelInputs } from '../../workbench/week1/team'
import { TEAM_FIXTURE } from '../../workbench/week1/teamFixture'
import { diffTeamRecord, fromTeamRecord, toTeamRecord } from '../adapters/week1'
import { commitOps } from '../model/commit'
import { emptyProject } from '../model/create'
import { MemoryAdapter } from '../store/memory'
import { ProjectStore } from '../store/ProjectStore'
import { buildExport, exportProjectText } from './exportProject'
import { analyzeImport, buildPlan, planComplete, planToOps, type Choice } from './importProject'
import { projectReport } from './report'
import type { ProjectDoc } from '../model/types'

const strip = (t: string) => {
  const j = JSON.parse(t)
  delete j.exportedAt
  delete j.integrity
  return j
}
const ok = async (text: string, file = 'f.json') => {
  const a = await analyzeImport(text, file)
  if (!a.ok) throw new Error(a.error)
  return a
}
let n = 0
const edit = (doc: ProjectDoc, patch: object) => {
  const ctx = { at: new Date(Date.UTC(2026, 9, 20, 9, 0, n++)).toISOString(), by: 'AB', change: `CHG-${String(500 + n).padStart(6, '0')}` }
  const r = commitOps(doc, diffTeamRecord(doc, normalizeTeam({ ...toTeamRecord(doc), ...patch }), ctx), ctx, 'edit')
  if (!r.ok) throw new Error(r.error)
  return r.doc
}

describe('project export and import', () => {
  it('P1-T8 / T-C11: export → import as a separate project (fresh browser) → export again gives the same file apart from exportedAt and integrity', async () => {
    const doc = fromTeamRecord(TEAM_FIXTURE, { initials: 'JS' }).doc
    const first = await exportProjectText(doc, { exportedBy: 'JS', changes: [] })
    const a = await ok(first)
    expect(a.checksum).toBe('ok')
    const fresh = new ProjectStore(new MemoryAdapter(), { locks: false, channel: false })
    await fresh.init()
    const sep = await fresh.importSeparate(a.incoming, a.changes)
    const second = await exportProjectText(sep, { exportedBy: 'JS', changes: a.changes })
    expect(strip(second)).toEqual(strip(first))
    // every ID and uid survives
    const ids = (t: string) => JSON.parse(t).artifacts.map((x: { id: string; uid: string }) => `${x.id}:${x.uid}`)
    expect(ids(second)).toEqual(ids(first))
  })

  it('reports a checksum mismatch after a hand edit, never ignores it', async () => {
    const text = await exportProjectText(fromTeamRecord(TEAM_FIXTURE).doc, { exportedBy: '' })
    const edited = text.replace('Riverside Food Bank Network', 'Riverside Food Bank Netwerk')
    const a = await ok(edited)
    expect(a.checksum).toBe('mismatch')
    expect(a.issues[0].message).toMatch(/checksum does not match/)
  })

  it('refuses a newer schema, an unknown format and broken JSON with a message', async () => {
    const f = await buildExport(emptyProject(), { exportedBy: '' })
    expect(await analyzeImport(JSON.stringify({ ...f, schemaVersion: 2 }))).toMatchObject({ ok: false, error: expect.stringMatching(/Update the app/) })
    expect(await analyzeImport('{"format":"something"}')).toMatchObject({ ok: false })
    expect(await analyzeImport('not json')).toMatchObject({ ok: false, error: 'This file is not valid JSON.' })
  })

  it('P1-T9: the plan classifies identical, changed, conflict, ID collision and new; conflicts need a choice', async () => {
    const base = fromTeamRecord(TEAM_FIXTURE).doc
    const teammate = edit(base, { stakeholders: toTeamRecord(base).stakeholders.map((s) => (s.id === 'STK-001' ? { ...s, name: 'Pantry coordinators' } : s)) })
    const file = await ok(await exportProjectText(teammate, { exportedBy: 'AB' }))
    const mine = edit(base, { stakeholders: toTeamRecord(base).stakeholders.map((s) => (s.id === 'STK-001' ? { ...s, name: 'Pantry volunteers' } : s)) })
    const plan = buildPlan(mine, file)
    const stk1 = plan.items.find((i) => i.id === 'STK-001')!
    expect(stk1.cls).toBe('conflict')
    expect(stk1.default).toBeNull()
    expect(planComplete(plan, {})).toBe(false)
    expect(plan.counts.identical).toBeGreaterThan(20)
    // theirs → my item takes the file's name; mine untouched otherwise; no item is deleted
    const choices: Record<string, Choice> = { [stk1.key]: 'theirs' }
    for (const i of plan.items) if (i.default === null && !choices[i.key]) choices[i.key] = 'mine'
    const { ops } = planToOps(mine, file, plan, choices, { at: '2026-10-20T10:00:00.000Z', by: 'JS', change: 'CHG-000900' })
    const r = commitOps(mine, ops, { at: '2026-10-20T10:00:00.000Z', by: 'JS', change: 'CHG-000900' }, 'merge')
    if (!r.ok) throw new Error(r.error)
    expect(toTeamRecord(r.doc).stakeholders.find((s) => s.id === 'STK-001')!.name).toBe('Pantry coordinators')
    expect(Object.keys(r.doc.artifacts).length).toBe(Object.keys(mine.artifacts).length)
  })

  it('ID collision: a different item under a taken ID is kept and renumbered, with its former ID recorded', async () => {
    const mine = edit(emptyProject(), { context: [{ id: 'EXT-001', name: 'County roads', kind: 'system', crosses: 'trucks', direction: 'both' }], issued: { ...toTeamRecord(emptyProject()).issued, EXT: 1 } })
    const other = edit(emptyProject(), { context: [{ id: 'EXT-001', name: 'Weather service', kind: 'system', crosses: 'forecasts', direction: 'in' }], issued: { ...toTeamRecord(emptyProject()).issued, EXT: 1 } })
    const file = await ok(await exportProjectText(other, { exportedBy: '' }))
    const plan = buildPlan(mine, file)
    const ext = plan.items.find((i) => i.id === 'EXT-001')!
    expect(ext.cls).toBe('id-collision')
    const choices: Record<string, Choice> = {}
    for (const i of plan.items) if (i.default === null) choices[i.key] = 'mine'
    const { ops, lines } = planToOps(mine, file, plan, choices, { at: 'x', by: '', change: 'CHG-000901' })
    const r = commitOps(mine, ops, { at: '2026-10-20T10:00:00.000Z', by: '', change: 'CHG-000901' }, 'merge')
    if (!r.ok) throw new Error(r.error)
    const ctx = toTeamRecord(r.doc).context
    expect(ctx.map((c) => `${c.id} ${c.name}`)).toEqual(['EXT-001 County roads', 'EXT-002 Weather service'])
    expect(Object.values(r.doc.artifacts).find((a) => a.id === 'EXT-002')!.formerIds).toEqual(['EXT-001'])
    expect(lines.join(' ')).toMatch(/EXT-001 .* became EXT-002/)
  })

  it('P1-T9: replace needs a pre-import snapshot and restoring it returns the previous state', async () => {
    const s = new ProjectStore(new MemoryAdapter(), { locks: false, channel: false, autosaveMs: 1 })
    await s.init()
    await s.create({ doc: fromTeamRecord(TEAM_FIXTURE).doc })
    const before = toTeamRecord(s.getState().doc!)
    const file = await ok(await exportProjectText(emptyProject({ teamLabel: '99' }), { exportedBy: '' }))
    await s.importReplace(file.incoming, 'Replaced with f.json', 'test replace')
    expect(toTeamRecord(s.getState().doc!).stakeholders.length).toBe(0)
    const pre = s.getState().snapshots.find((x) => x.kind === 'pre-import')!
    expect(pre).toBeTruthy()
    await s.restore(pre.id, 'undo the replace')
    expect(toTeamRecord(s.getState().doc!).stakeholders).toEqual(before.stakeholders)
    // counters never went down: no ID can be reused after the replace
    expect(s.getState().doc!.issued.STK).toBeGreaterThanOrEqual(TEAM_FIXTURE.stakeholders.length)
  })

  it('P1-T1: a week1-model-inputs v3 file imports through the plan (matched by course ID into a blank project)', async () => {
    const a = await ok(JSON.stringify(teamModelInputs(TEAM_FIXTURE)), 'team-07-week1-model-inputs.json')
    expect(a.kind).toBe('week1')
    const blank = emptyProject({ teamLabel: '07' })
    const plan = buildPlan(blank, a)
    expect(plan.items.find((i) => i.id === 'ENT-001')!.cls).toBe('changed-theirs')
    expect(planComplete(plan, {})).toBe(true)
    const { ops } = planToOps(blank, a, plan, {}, { at: '2026-10-20T10:00:00.000Z', by: '', change: 'CHG-000001' })
    const r = commitOps(blank, ops, { at: '2026-10-20T10:00:00.000Z', by: '', change: 'CHG-000001' }, 'import')
    if (!r.ok) throw new Error(r.error)
    const rec = toTeamRecord(r.doc)
    expect(rec.proposal.name).toBe(TEAM_FIXTURE.proposal.name)
    expect(rec.needs.length).toBe(TEAM_FIXTURE.needs.length)
    expect(Object.values(r.doc.artifacts).find((x) => x.id === 'STK-001')!.provenance.kind).toBe('imported')
  })

  it('writes a readable Markdown report with the overview, artifacts and relationships', () => {
    const md = projectReport(fromTeamRecord(TEAM_FIXTURE).doc)
    expect(md).toContain('# Project report: Riverside Food Bank Network')
    expect(md).toContain('### Stakeholders')
    expect(md).toContain('NEED-001 derives from STK-001')
    expect(md).toContain('self-declared')
  })
})
