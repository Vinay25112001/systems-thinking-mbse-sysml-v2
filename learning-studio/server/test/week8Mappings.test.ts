// M7: the Week 8 lab tool's package-per-ID records are ordinary project writes (upsert-mapping) through the existing
// authorize() choke point: a member's write is stored with its provenance (pkg, source); another team gets 404 (the
// project's existence is not revealed) and the instructor gets 403 (instructors read, never write team content); the
// new fields are allow-listed and malformed values are refused; IDs are never renumbered.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { confirmMappingOps, week1Entries } from '../../src/project/adapters/week8'
import { makeArtifact } from '../../src/project/model/create'
import type { Operation, ProjectDoc } from '../../src/project/model/types'
import { cid, Client, createTeamProject, startTest, type T } from './helpers'

let t: T
let a: Client
let pid: string
let doc: ProjectDoc
let version: number
const S = { at: '2026-11-02T12:00:00.000Z', by: 'AA', change: 'CHG-000001' }
const body = (ops: Operation[]) => ({ baseVersion: version, changes: [{ clientChangeId: cid(), source: 'editor', summary: 'Week 8 mapping', ops }] })
async function accept(c: Client, ops: Operation[]) {
  const r = await c.post(`/api/v1/projects/${pid}/changes`, body(ops))
  expect(r.status, JSON.stringify(r.body)).toBe(200)
  doc = r.body.doc
  version = r.body.version
  return r
}

beforeEach(async () => {
  t = await startTest()
  a = await t.signedIn(await t.user('student', 'Team 1', { initials: 'AA' }))
  const r = await createTeamProject(a, await t.team('Team 1'))
  pid = r.body.doc.project.uid
  doc = r.body.doc
  version = r.body.version
  await accept(a, [{ op: 'create-artifact', artifact: makeArtifact({ id: 'STK-001', type: 'STK', title: 'Harbour master', stamp: S }) }])
})
afterEach(async () => t.close())

const confirmOps = (d: ProjectDoc, id: string, pkg = 'Stakeholders', reason = '') => confirmMappingOps(d, [{ entry: week1Entries(d).find((e) => e.id === id)!, choice: { pkg, reason } }], S)

describe('M7: Week 8 mappings on the course server', () => {
  it('a member stores a mapping with its provenance; a re-confirmation keeps the ID; a teammate reads the same record', async () => {
    await accept(a, confirmOps(doc, 'STK-001'))
    const m = Object.values(doc.mappings)[0]
    expect(m).toMatchObject({ id: 'MAP-001', status: 'mapped', pkg: 'Stakeholders', rule: 'STK', source: { id: 'STK-001', title: 'Harbour master' } })
    expect(m.confirmedBy).toMatchObject({ by: 'AA' })
    await accept(a, confirmOps(doc, 'STK-001', 'Context', 'Port authority'))
    const again = Object.values(doc.mappings)
    expect(again).toHaveLength(1)
    expect(again[0]).toMatchObject({ uid: m.uid, id: 'MAP-001', pkg: 'Context', rule: 'custom', statusReason: 'Port authority' })
    const b = await t.signedIn(await t.user('student', 'Team 1'))
    const read = (await b.get(`/api/v1/projects/${pid}`)).body.doc as ProjectDoc
    expect(Object.values(read.mappings)[0]).toMatchObject({ id: 'MAP-001', pkg: 'Context', source: { id: 'STK-001' } })
  })

  it('the server stamps who confirmed, when and which change itself, and the revision read; forged values are overwritten', async () => {
    const stored = version
    const revBefore = doc.rev
    const ops = confirmOps(doc, 'STK-001') as Extract<Operation, { op: 'upsert-mapping' }>[]
    const forged = ops.map((o) => ({ ...o, mapping: { ...o.mapping, confirmedBy: { at: '1999-01-01T00:00:00.000Z', by: 'ZZ', change: 'CHG-999999' }, source: { ...o.mapping.source!, projectRev: 4242 } } }))
    const r = await accept(a, forged)
    const m = Object.values(doc.mappings)[0]
    expect(m.confirmedBy).toEqual({ at: '2026-10-21T12:00:00.000Z', by: 'AA', change: r.body.changes[0].id })
    expect(r.body.changes[0].id).not.toBe('CHG-999999')
    expect(m.source!.projectRev).toBe(revBefore)
    expect(version).toBe(stored + 1)
    // the recorded history carries the server's stamp too
    const log = (await a.get(`/api/v1/projects/${pid}/changes`)).body.changes
    expect(JSON.stringify(log.at(-1).ops)).not.toMatch(/ZZ|CHG-999999|1999-01-01|4242/)
  })

  it('another team gets 404 and the instructor 403, reading or writing; nothing is stored', async () => {
    const ops = confirmOps(doc, 'STK-001')
    const other = await t.signedIn(await t.user('student', 'Team 2'))
    expect((await other.post(`/api/v1/projects/${pid}/changes`, body(ops))).status).toBe(404)
    expect((await other.get(`/api/v1/projects/${pid}`)).status).toBe(404)
    const inst = await t.signedIn(await t.user('instructor'))
    expect((await inst.post(`/api/v1/projects/${pid}/changes`, body(ops))).status).toBe(403)
    const stored = (await a.get(`/api/v1/projects/${pid}`)).body
    expect(stored.version).toBe(version)
    expect(stored.doc.mappings).toEqual({})
  })

  it('the new fields are allow-listed: a malformed source or package is refused, unknown fields are dropped', async () => {
    const [op] = confirmOps(doc, 'STK-001') as Extract<Operation, { op: 'upsert-mapping' }>[]
    const send = (mapping: Record<string, unknown>) => a.post(`/api/v1/projects/${pid}/changes`, body([{ op: 'upsert-mapping', mapping } as never]))
    expect((await send({ ...op.mapping, source: 'STK-001' })).status).toBe(400)
    expect((await send({ ...op.mapping, source: { id: '', title: 'x', projectRev: 1 } })).status).toBe(400)
    expect((await send({ ...op.mapping, pkg: 'x'.repeat(201) })).status).toBe(400)
    expect((await send({ ...op.mapping, pkg: 'owned by what it measures' })).status).toBe(400) // not a package
    const r = await send({ ...op.mapping, injected: 'nope' })
    expect(r.status).toBe(200)
    expect(Object.values(r.body.doc.mappings as ProjectDoc['mappings'])[0]).not.toHaveProperty('injected')
  })
})
