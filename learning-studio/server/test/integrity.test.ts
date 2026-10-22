// The server enforces integrity on the stored state itself (M2 review M1, M2, L1, L2): derived operations are computed on
// the server, before values come from the stored document, the result is re-validated, mapping/model-element payloads are
// normalised, and the team label and course block are server-owned.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { makeArtifact, makeRelationship } from '../../src/project/model/create'
import { invertOps } from '../../src/project/model/ops'
import type { Operation, ProjectDoc } from '../../src/project/model/types'
import { cid, Client, createTeamProject, startTest, type T } from './helpers'

let t: T
let a: Client
let pid: string
let doc: ProjectDoc
let version: number
const S = { at: '2026-10-21T12:00:00.000Z', by: 'AA', change: 'CHG-000001' }
const ent = (d: ProjectDoc) => Object.values(d.artifacts).find((x) => x.type === 'ENT')!
const send = (ops: Operation[], extra: Record<string, unknown> = {}) => a.post(`/api/v1/projects/${pid}/changes`, { baseVersion: version, changes: [{ clientChangeId: cid(), source: 'editor', summary: 'Edit', ops, ...extra }] })
async function accept(ops: Operation[]) {
  const r = await send(ops)
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
})
afterEach(async () => t.close())

/** STK-001, STK-002 and REL-001 "regulates" between them (the reviewer's probe). */
async function twoStakeholders() {
  const s1 = makeArtifact({ id: 'STK-001', type: 'STK', title: 'Port authority', stamp: S })
  const s2 = makeArtifact({ id: 'STK-002', type: 'STK', title: 'Ferry operator', stamp: S })
  const rel = makeRelationship({ id: 'REL-001', category: 'stakeholder', type: 'regulates', from: s1.uid, to: s2.uid, stamp: S })
  await accept([{ op: 'create-artifact', artifact: s1 }, { op: 'create-artifact', artifact: s2 }, { op: 'create-relationship', relationship: rel }])
  return { s1, s2, rel }
}

describe('M1: the server derives the side effects and re-validates the result', () => {
  it('regression (reviewer probe): retire STK-001 WITHOUT the derived operation → the server turns REL-001 suspect itself and records it', async () => {
    const { s1, rel } = await twoStakeholders()
    expect(doc.relationships[rel.uid].status).toBe('active')
    const r = await accept([{ op: 'retire-artifact', uid: s1.uid, reason: 'Merged into STK-002' }])
    expect(r.body.doc.relationships[rel.uid].status).toBe('suspect')
    // the derived operation is in the authenticated history, so the change log, diff and undo see it
    const recorded = r.body.changes[0].ops as Operation[]
    expect(recorded.some((o) => o.op === 'update-relationship' && o.uid === rel.uid)).toBe(true)
    const log = (await a.get(`/api/v1/projects/${pid}/changes`)).body.changes
    expect(log.at(-1).ops.some((o: Operation) => o.op === 'update-relationship' && o.uid === rel.uid)).toBe(true)
  })
  it('a browser that derived the operation itself is not recorded twice', async () => {
    const { s1, rel } = await twoStakeholders()
    const r = await accept([{ op: 'retire-artifact', uid: s1.uid, reason: 'Merged' }, { op: 'update-relationship', uid: rel.uid, fields: [{ path: 'status', before: 'active', after: 'suspect' }] }])
    const recorded = (r.body.changes[0].ops as Operation[]).filter((o) => o.op === 'update-relationship' && o.uid === rel.uid)
    expect(recorded).toHaveLength(1)
  })
  it('refuses (422, with the problem) a write that leaves a new integrity problem: re-activating a relationship to a retired artifact', async () => {
    const { s1, rel } = await twoStakeholders()
    await accept([{ op: 'retire-artifact', uid: s1.uid, reason: 'Gone' }])
    const before = version
    const r = await send([{ op: 'update-relationship', uid: rel.uid, fields: [{ path: 'status', before: 'suspect', after: 'active' }] }])
    expect(r.status).toBe(422)
    expect(r.body.code).toBe('integrity')
    expect(r.body.message).toMatch(/inconsistent: REL-001 .* should be suspect/)
    expect(r.body.issues[0].code).toBe('I8')
    const stored = (await a.get(`/api/v1/projects/${pid}`)).body
    expect(stored.version).toBe(before)
    expect(stored.doc.relationships[rel.uid].status).toBe('suspect')
  })
})

describe('M2: before values are recomputed from the stored document', () => {
  it('a forged before on update-project is replaced by the stored value (and undo restores the real one)', async () => {
    const real = doc.project.title
    const r = await accept([{ op: 'update-project', fields: [{ path: 'title', before: 'FORGED BEFORE', after: 'New title' }] }])
    const f = (r.body.changes[0].ops[0] as Extract<Operation, { op: 'update-project' }>).fields[0]
    expect(f.before).not.toBe('FORGED BEFORE')
    expect(f.before ?? '').toBe(real ?? '')
    const log = (await a.get(`/api/v1/projects/${pid}/changes`)).body.changes
    expect(JSON.stringify(log)).not.toContain('FORGED BEFORE')
    const undo = invertOps(doc, log.at(-1).ops, 'Undo')
    expect((undo[0] as Extract<Operation, { op: 'update-project' }>).fields[0].after ?? '').toBe(real ?? '')
  })
  it('forged before values on update-artifact, set-review and a second edit of the same field are all replaced', async () => {
    const e = ent(doc)
    const r = await accept([
      { op: 'update-artifact', uid: e.uid, fields: [{ path: 'attributes.problem', before: 'FORGED-1', after: 'first' }] },
      { op: 'update-artifact', uid: e.uid, fields: [{ path: 'attributes.problem', before: 'FORGED-2', after: 'second' }] },
      { op: 'set-review', uid: e.uid, kind: 'artifact', before: { state: 'reviewed', at: 'x', by: 'FORGED-3', rationale: 'x', clearedCauses: [] }, after: { state: 'none' } },
    ])
    const ops = r.body.changes[0].ops as Operation[]
    expect(JSON.stringify(ops)).not.toMatch(/FORGED/)
    expect((ops[0] as Extract<Operation, { op: 'update-artifact' }>).fields[0].before ?? '').toBe(String(e.attributes.problem ?? ''))
    expect((ops[1] as Extract<Operation, { op: 'update-artifact' }>).fields[0].before).toBe('first') // sees the earlier op
    expect((ops[2] as Extract<Operation, { op: 'set-review' }>).before).toEqual(e.review)
  })
})

describe('L1: mapping and model-element payloads are normalised', () => {
  const mapping = (over: Record<string, unknown> = {}) => ({ uid: 'a1b2c3d4-0000-4000-8000-000000000001', id: 'MAP-001', artifact: ent(doc).uid, elements: [], rule: '', status: 'not-mapped', statusReason: '', findings: [], sourceRevision: 1, week: 3, ...over })
  it('refuses __proto__ / constructor uids and inflated or malformed IDs; drops unknown fields', async () => {
    expect((await send([{ op: 'upsert-mapping', mapping: mapping({ uid: 'constructor' }) } as never])).status).toBe(400)
    expect((await send([{ op: 'upsert-mapping', mapping: mapping({ uid: '_proto_' }) } as never])).status).toBe(400)
    expect((await send([{ op: 'upsert-mapping', mapping: mapping({ id: 'MAP-999999999' }) } as never])).status).toBe(400)
    expect((await send([{ op: 'upsert-model-element', element: { uid: 'el-1', id: 'MEL-001', package: 'P', construct: 'part def', name: 'X', conformance: 'teaching-diagram', html: '<img onerror=alert(1)>', nested: { deep: 1 } } } as never])).status).toBe(200)
    const stored = (await a.get(`/api/v1/projects/${pid}`)).body.doc
    expect(stored.modelElements['el-1']).toEqual({ uid: 'el-1', id: 'MEL-001', package: 'P', construct: 'part def', name: 'X', conformance: 'teaching-diagram' })
    expect(stored.issued.MEL).toBe(1)
  })
  it('a new mapping takes a fresh ID (I1/I3); an existing one keeps its ID', async () => {
    version = (await a.get(`/api/v1/projects/${pid}`)).body.version
    await accept([{ op: 'upsert-mapping', mapping: mapping() } as never])
    expect((await send([{ op: 'upsert-mapping', mapping: mapping({ uid: 'other-uid', id: 'MAP-001' }) } as never])).status).toBe(422) // reused ID
    expect((await send([{ op: 'upsert-mapping', mapping: mapping({ id: 'MAP-007' }) } as never])).status).toBe(422) // renumber by edit
    await accept([{ op: 'upsert-mapping', mapping: mapping({ status: 'mapped', statusReason: 'checked' }) } as never])
    expect(doc.mappings[mapping().uid as string].status).toBe('mapped')
  })
})

describe('L2: the team label and course block are server-owned', () => {
  it('member edits to team.label and project.course.* are dropped; the server label stays', async () => {
    const r = await accept([
      { op: 'update-team', fields: [{ path: 'label', before: 'Team 1', after: 'Team 99 (spoof)' }, { path: 'norms', before: '', after: 'Reply within a day' }] },
      { op: 'update-project', fields: [{ path: 'course.teamLabel', before: 'Team 1', after: 'Team 99 (spoof)' }] },
    ])
    expect(r.body.doc.team.label).toBe('Team 1')
    expect(r.body.doc.project.course.teamLabel).toBe('Team 1')
    expect(r.body.doc.team.norms).toBe('Reply within a day')
    expect(JSON.stringify(r.body.changes)).not.toContain('Team 99')
  })
})
