// The material content an enterprise approval is bound to (M2 review H1): one field list, canonical content, a field
// diff for the instructor, and the browser's early "this changes your approved proposal" test.
import { describe, expect, it } from 'vitest'
import { APPROVAL_MATERIAL_FIELDS, canonicalMaterial, materialContent, materialDiff, touchesMaterial } from './approvalBinding'
import { emptyProject, makeArtifact } from './create'
import type { ProjectDoc } from './types'

const S = { at: '2026-10-21T12:00:00.000Z', by: 'AA', change: 'CHG-000001' }
const base = (): ProjectDoc => {
  const d = emptyProject({ enterpriseName: 'Harbor Shuttle' })
  for (const a of [makeArtifact({ id: 'STK-001', type: 'STK', title: 'Riders', stamp: S }), makeArtifact({ id: 'PRT-001', type: 'PRT', title: 'Boats', stamp: S })]) d.artifacts[a.uid] = a
  return d
}
const ent = (d: ProjectDoc) => Object.values(d.artifacts).find((a) => a.type === 'ENT')!
const byId = (d: ProjectDoc, id: string) => Object.values(d.artifacts).find((a) => a.id === id)!

describe('approval material content', () => {
  it('contains only the listed types and fields, in a stable order', () => {
    const c = materialContent(base())
    expect(c.every((x) => x.type in APPROVAL_MATERIAL_FIELDS)).toBe(true)
    expect(c.find((x) => x.id === 'STK-001')).toBeUndefined()
    expect(c.find((x) => x.id === 'ENT-001')!.fields).toEqual({ title: 'Harbor Shuttle', description: '', 'attributes.problem': '' })
    expect(canonicalMaterial(base())).toBe(canonicalMaterial(base()))
  })
  it('is unchanged by non-material edits and changed by material ones (including a retirement)', () => {
    const d = base()
    const before = canonicalMaterial(d)
    byId(d, 'STK-001').title = 'Commuters'
    ent(d).attributes.domain = 'Transit'
    expect(canonicalMaterial(d)).toBe(before)
    byId(d, 'PRT-001').status = 'retired'
    expect(canonicalMaterial(d)).not.toBe(before)
  })
  it('the diff names each changed, added and removed field', () => {
    const a = base()
    const b = structuredClone(a)
    ent(b).title = 'Harbor Shuttle and Freight'
    byId(b, 'PRT-001').status = 'retired'
    const m = makeArtifact({ id: 'MGO-002', type: 'MGO', description: 'Halve the wait', stamp: S })
    b.artifacts[m.uid] = m
    const rows = materialDiff(materialContent(a), materialContent(b))
    expect(rows).toContainEqual({ id: 'ENT-001', type: 'ENT', field: 'title', approved: 'Harbor Shuttle', current: 'Harbor Shuttle and Freight', change: 'changed' })
    expect(rows).toContainEqual({ id: 'PRT-001', type: 'PRT', field: 'title', approved: 'Boats', current: '', change: 'removed' })
    expect(rows).toContainEqual({ id: 'MGO-002', type: 'MGO', field: 'description', approved: '', current: 'Halve the wait', change: 'added' })
  })
  it('touchesMaterial: material field edits, creations and retirements yes; other fields and types, or an unchanged value, no', () => {
    const d = base()
    const e = ent(d)
    expect(touchesMaterial(d, [{ op: 'update-artifact', uid: e.uid, fields: [{ path: 'title', before: e.title, after: 'X' }] }])).toBe(true)
    expect(touchesMaterial(d, [{ op: 'update-artifact', uid: e.uid, fields: [{ path: 'title', before: e.title, after: e.title }] }])).toBe(false)
    expect(touchesMaterial(d, [{ op: 'update-artifact', uid: e.uid, fields: [{ path: 'attributes.domain', before: '', after: 'X' }] }])).toBe(false)
    expect(touchesMaterial(d, [{ op: 'update-artifact', uid: byId(d, 'STK-001').uid, fields: [{ path: 'title', before: 'Riders', after: 'X' }] }])).toBe(false)
    expect(touchesMaterial(d, [{ op: 'retire-artifact', uid: byId(d, 'PRT-001').uid, reason: 'x' }])).toBe(true)
    expect(touchesMaterial(d, [{ op: 'create-artifact', artifact: makeArtifact({ id: 'EXT-001', type: 'EXT', title: 'Coast guard', stamp: S }) }])).toBe(true)
  })
})
