// Storage: one adapter contract suite over the memory adapter and IndexedDB (fake-indexeddb), and the project store's
// behaviour: creation (P1-T1), persistence across a reload (P1-T2), coalescing, undo, snapshots and restore, save
// failure (P1-T13), the rev check between tabs.
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { describe, expect, it } from 'vitest'
import { normalizeTeam } from '../../workbench/week1/team'
import { TEAM_FIXTURE } from '../../workbench/week1/teamFixture'
import { diffTeamRecord, fromTeamRecord, toTeamRecord } from '../adapters/week1'
import { emptyProject } from '../model/create'
import type { ChangeSet } from '../model/types'
import type { StorageAdapter } from './adapter'
import { IndexedDbAdapter } from './indexedDb'
import { MemoryAdapter } from './memory'
import { ProjectStore } from './ProjectStore'

const ADAPTERS: [string, () => Promise<StorageAdapter>][] = [
  ['memory', async () => new MemoryAdapter()],
  ['indexeddb', async () => IndexedDbAdapter.open(new IDBFactory(), `test-${Math.random()}`)],
]
const change = (id: string, rev: number): ChangeSet => ({ id, at: '2026-10-19T12:00:00.000Z', by: 'JS', source: 'editor', summary: 's', ops: [], rev })

describe.each(ADAPTERS)('storage adapter contract: %s', (_name, make) => {
  it('saves and reads a project with its change sets; a change set put again replaces the earlier version', async () => {
    const a = await make()
    const doc = emptyProject({ teamLabel: '07' })
    await a.saveProject(doc, [change('CHG-000001', 1)], undefined)
    await a.saveProject({ ...doc, rev: 1 }, [{ ...change('CHG-000001', 1), summary: 'merged' }, change('CHG-000002', 2)], 0)
    expect((await a.getProject(doc.project.uid))!.rev).toBe(1)
    const cs = await a.listChanges(doc.project.uid)
    expect(cs.map((c) => c.id)).toEqual(['CHG-000001', 'CHG-000002'])
    expect(cs[0].summary).toBe('merged')
    expect((await a.listProjects())[0].teamLabel).toBe('07')
  })
  it('refuses a write when another tab saved meanwhile (rev check inside the transaction)', async () => {
    const a = await make()
    const doc = emptyProject()
    await a.saveProject({ ...doc, rev: 3 }, [], undefined)
    await expect(a.saveProject({ ...doc, rev: 4 }, [], 2)).rejects.toMatchObject({ kind: 'conflict' })
  })
  it('stores, lists, reads and deletes snapshots and meta values', async () => {
    const a = await make()
    const doc = emptyProject()
    await a.putSnapshot(doc.project.uid, { id: 'SNP-001', at: 'x', kind: 'manual', label: 'Week 1 submitted', rev: 0, doc })
    expect((await a.listSnapshots(doc.project.uid)).map((s) => s.label)).toEqual(['Week 1 submitted'])
    expect((await a.getSnapshot(doc.project.uid, 'SNP-001'))!.doc.project.uid).toBe(doc.project.uid)
    await a.deleteSnapshot(doc.project.uid, 'SNP-001')
    expect(await a.listSnapshots(doc.project.uid)).toEqual([])
    await a.setMeta('editor', { initials: 'JS' })
    expect(await a.getMeta('editor')).toEqual({ initials: 'JS' })
  })
})

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms))
let clock = Date.UTC(2026, 9, 19, 12, 0, 0)
const now = () => new Date((clock += 1000))
async function storeOn(adapter: StorageAdapter) {
  const s = new ProjectStore(adapter, { autosaveMs: 5, retryMs: 5, now, locks: false, channel: false })
  await s.init()
  return s
}
function editTeam(s: ProjectStore, patch: Parameters<typeof normalizeTeam>[0]) {
  return s.apply((doc, stamp) => diffTeamRecord(doc, normalizeTeam({ ...toTeamRecord(doc), ...(patch as object) }), stamp))
}

describe('project store', () => {
  it('P1-T1/P1-T2: creates an empty project, saves an edit, and a new store on the same storage reads the same content and rev', async () => {
    for (const [, make] of ADAPTERS) {
      const adapter = await make()
      const s = await storeOn(adapter)
      await s.create({ teamLabel: '07', initials: 'js', enterpriseName: 'Riverside Food Bank Network' })
      expect(s.getState().editor).toBe('JS')
      const res = editTeam(s, { proposal: { ...toTeamRecord(s.getState().doc!).proposal, domain: 'Food security' } })
      expect(res.ok).toBe(true)
      await s.flush()
      expect(s.getState().save.kind).toBe('saved')
      const again = await storeOn(adapter)
      expect(again.getState().doc!.rev).toBe(s.getState().doc!.rev)
      expect(toTeamRecord(again.getState().doc!).proposal.domain).toBe('Food security')
      expect(again.getState().changes.at(-1)!.by).toBe('JS')
    }
  })

  it('P1-T1: creates a project from a stored Week 1 record', async () => {
    const s = await storeOn(new MemoryAdapter())
    await s.create({ doc: fromTeamRecord(TEAM_FIXTURE).doc })
    expect(toTeamRecord(s.getState().doc!).stakeholders.length).toBe(TEAM_FIXTURE.stakeholders.length)
  })

  it('coalesces keystrokes on one field into one change set; another field starts a new one', async () => {
    const s = await storeOn(new MemoryAdapter())
    await s.create({ initials: 'JS' })
    const p = () => toTeamRecord(s.getState().doc!).proposal
    for (const name of ['R', 'Ri', 'Riv', 'River']) editTeam(s, { proposal: { ...p(), name } })
    expect(s.getState().changes.length).toBe(1)
    const f = s.getState().changes[0].ops.flatMap((o) => ('fields' in o ? o.fields : []))
    expect(f.find((x) => x.path === 'title')).toMatchObject({ before: '', after: 'River' })
    editTeam(s, { proposal: { ...p(), domain: 'Food' } })
    expect(s.getState().changes.length).toBe(2)
  })

  it('undo applies the inverse operations as a new change set', async () => {
    const s = await storeOn(new MemoryAdapter())
    await s.create({ initials: 'JS' })
    const r = toTeamRecord(s.getState().doc!)
    editTeam(s, { context: [{ id: 'EXT-001', name: 'County roads', kind: 'system', crosses: 'trucks', direction: 'both' }], issued: { ...r.issued, EXT: 1 } })
    expect(toTeamRecord(s.getState().doc!).context.length).toBe(1)
    expect(s.undo().ok).toBe(true)
    expect(toTeamRecord(s.getState().doc!).context.length).toBe(0)
    expect(s.getState().changes.at(-1)!.summary).toMatch(/^Undo:/)
    // the undone row's ID stays taken
    expect(s.getState().doc!.issued.EXT).toBe(1)
  })

  it('P1-T9 (store part): restore writes a pre-restore snapshot and adds a revision, never deleting history', async () => {
    const s = await storeOn(new MemoryAdapter())
    await s.create({ initials: 'JS' })
    const p = () => toTeamRecord(s.getState().doc!).proposal
    editTeam(s, { proposal: { ...p(), name: 'First name' } })
    const v = await s.saveVersion('Week 1 draft')
    editTeam(s, { proposal: { ...p(), domain: 'Later' } })
    const before = s.getState().changes.length
    expect((await s.restore(v.id, 'went back to the draft')).ok).toBe(true)
    expect(toTeamRecord(s.getState().doc!).proposal.domain).toBe('')
    expect(s.getState().changes.length).toBe(before + 1)
    expect(s.getState().changes.at(-1)!.source).toBe('restore')
    expect(s.getState().snapshots.some((x) => x.kind === 'pre-restore')).toBe(true)
  })

  it('P1-T13: a failing disk shows "Not saved" after one retry and keeps the edit in memory', async () => {
    const adapter = new MemoryAdapter()
    const s = await storeOn(adapter)
    await s.create({ initials: 'JS' })
    adapter.failWrites = 'quota'
    editTeam(s, { proposal: { ...toTeamRecord(s.getState().doc!).proposal, name: 'Kept in memory' } })
    await s.flush()
    expect(s.getState().save).toMatchObject({ kind: 'error' })
    expect(s.getState().save.reason).toMatch(/full/)
    expect(toTeamRecord(s.getState().doc!).proposal.name).toBe('Kept in memory')
    adapter.failWrites = false
    editTeam(s, { proposal: { ...toTeamRecord(s.getState().doc!).proposal, domain: 'x' } })
    await s.flush()
    expect(s.getState().save.kind).toBe('saved')
  })

  it('a second writer with a stale rev is stopped and turned read-only (another tab saved first)', async () => {
    const adapter = new MemoryAdapter()
    const a = await storeOn(adapter)
    await a.create({ initials: 'JS' })
    const b = await storeOn(adapter)
    editTeam(a, { team: 'A' })
    await a.flush()
    editTeam(b, { team: 'B' })
    await b.flush()
    expect(b.getState().readOnly).toBe(true)
    expect(editTeam(b, { team: 'C' }).ok).toBe(false)
  })

  it('the first save of a day writes an automatic version', async () => {
    const s = await storeOn(new MemoryAdapter())
    await s.create({ initials: 'JS' })
    editTeam(s, { team: '07' })
    await s.flush()
    await tick(5)
    expect(s.getState().snapshots.filter((x) => x.kind === 'auto').length).toBe(1)
  })
})
