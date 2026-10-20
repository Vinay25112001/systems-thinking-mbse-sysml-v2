// Canonical model: relationship validity generated from the vocabulary (P1-T5), referential integrity (P1-T6), ID rules
// (I1–I3), change impact (a need change flags its dependents, direction-aware; trace plan §5), projection onto the
// AeroLink model vocabulary (T-C10).
import { describe, expect, it } from 'vitest'
import { validateModel } from '../../model/engineering'
import { TEAM_FIXTURE } from '../../workbench/week1/teamFixture'
import { fromTeamRecord } from '../adapters/week1'
import { commitOps } from './commit'
import { emptyProject, makeArtifact, makeRelationship } from './create'
import { clearReviewOps } from './impact'
import { nextId } from './ids'
import { applyOps } from './ops'
import { toEngineeringModel } from './projection'
import { ARTIFACT_TYPES, type ArtifactType, type ProjectDoc, type RelationshipType } from './types'
import { allowedPair, RELATIONSHIP_TYPES, VOCABULARY } from './vocabulary'

const ctx = (n: number) => ({ at: `2026-10-19T12:00:${String(n).padStart(2, '0')}.000Z`, by: 'JS', change: `CHG-${String(n).padStart(6, '0')}` })
const stamp = ctx(1)
function withTypes(types: ArtifactType[]) {
  let doc = emptyProject()
  const uids: Record<string, string> = {}
  const ops = types.filter((t) => t !== 'ENT').map((t) => {
    const a = makeArtifact({ id: nextId({ ...doc, issued: { ...doc.issued, [t]: t === 'MGO' ? 1 : 0 } }, t), type: t, stamp })
    uids[t] = a.uid
    return { op: 'create-artifact' as const, artifact: a }
  })
  const r = applyOps(doc, ops, stamp)
  if (!r.ok) throw new Error(r.error)
  doc = r.doc
  uids.ENT = Object.values(doc.artifacts).find((a) => a.type === 'ENT')!.uid
  return { doc, uids }
}
const rel = (doc: ProjectDoc, type: RelationshipType, from: string, to: string, id?: string) =>
  makeRelationship({ id: id ?? nextId(doc, VOCABULARY[type].category === 'stakeholder' ? 'REL' : 'LNK'), category: VOCABULARY[type].category, type, from, to, stamp })

describe('relationship vocabulary (P1-T5)', () => {
  const { doc, uids } = withTypes([...ARTIFACT_TYPES].filter((t) => t !== 'CONOPS'))
  it('accepts every allowed pair and refuses every disallowed pair with its sentence message, generated from the table', () => {
    let accepted = 0
    let refused = 0
    for (const type of RELATIONSHIP_TYPES)
      for (const from of ARTIFACT_TYPES)
        for (const to of ARTIFACT_TYPES) {
          if (from === to || from === 'CONOPS' || to === 'CONOPS') continue
          const r = applyOps(doc, [{ op: 'create-relationship', relationship: rel(doc, type, uids[from], uids[to]) }], stamp)
          if (allowedPair(from, type, to)) {
            expect(r.ok, `${from} ${type} ${to}`).toBe(true)
            accepted++
          } else {
            expect(r.ok).toBe(false)
            if (!r.ok) expect(r.error).toContain(`${from} ${type} ${to} is not an allowed relationship`)
            refused++
          }
        }
    expect(accepted).toBeGreaterThan(300)
    expect(refused).toBeGreaterThan(10000)
  })
  it('CON satisfies REQ-SYS is refused in sentence form', () => {
    const r = applyOps(doc, [{ op: 'create-relationship', relationship: rel(doc, 'satisfies', uids.CON, uids['REQ-SYS']) }], stamp)
    expect(r).toMatchObject({ ok: false, error: 'CON satisfies REQ-SYS is not an allowed relationship. (I5)' })
  })
})

describe('referential integrity (P1-T6) and IDs', () => {
  const { doc, uids } = withTypes(['STK', 'CON', 'NEED'])
  it('refuses a relationship to a missing uid (I4), a self relationship (I6) and a duplicate (I7)', () => {
    expect(applyOps(doc, [{ op: 'create-relationship', relationship: rel(doc, 'derives-from', uids.NEED, 'no-such-uid') }], stamp).ok).toBe(false)
    expect(applyOps(doc, [{ op: 'create-relationship', relationship: rel(doc, 'refines', uids.NEED, uids.NEED) }], stamp).ok).toBe(false)
    const one = rel(doc, 'derives-from', uids.NEED, uids.STK)
    const r1 = applyOps(doc, [{ op: 'create-relationship', relationship: one }], stamp)
    if (!r1.ok) throw new Error(r1.error)
    const r2 = applyOps(r1.doc, [{ op: 'create-relationship', relationship: rel(r1.doc, 'derives-from', uids.NEED, uids.STK) }], stamp)
    expect(r2).toMatchObject({ ok: false })
  })
  it('retiring an artifact turns its relationships suspect and removes none (I8, I13)', () => {
    const r1 = applyOps(doc, [{ op: 'create-relationship', relationship: rel(doc, 'derives-from', uids.NEED, uids.STK) }, { op: 'create-relationship', relationship: rel({ ...doc, issued: { ...doc.issued, LNK: 1 } }, 'derives-from', uids.CON, uids.STK) }], stamp)
    if (!r1.ok) throw new Error(r1.error)
    const r2 = commitOps(r1.doc, [{ op: 'retire-artifact', uid: uids.STK, reason: 'merged with another stakeholder' }], ctx(2), 'retire')
    if (!r2.ok) throw new Error(r2.error)
    const rels = Object.values(r2.doc.relationships)
    expect(rels.length).toBe(2)
    expect(rels.every((r) => r.status === 'suspect')).toBe(true)
    expect(r2.doc.artifacts[uids.STK].status).toBe('retired')
  })
  it('refuses a reused ID (I3), a duplicate ID (I1) and a malformed ID (I2)', () => {
    const r = commitOps(doc, [{ op: 'retire-artifact', uid: uids.STK, reason: 'x' }], ctx(3), 'r')
    if (!r.ok) throw new Error(r.error)
    const again = makeArtifact({ id: 'STK-001', type: 'STK', stamp })
    expect(applyOps(r.doc, [{ op: 'create-artifact', artifact: again }], stamp).ok).toBe(false)
    expect(nextId(r.doc, 'STK')).toBe('STK-002')
    expect(applyOps(doc, [{ op: 'create-artifact', artifact: makeArtifact({ id: 'STK-1', type: 'STK', stamp }) }], stamp).ok).toBe(false)
    expect(applyOps(doc, [{ op: 'create-artifact', artifact: makeArtifact({ id: 'ENT-002', type: 'ENT', stamp }) }], stamp).ok).toBe(false)
  })
})

describe('change impact', () => {
  it('a need change flags the requirement derived from it and turns the link suspect; the parent stakeholder is not flagged', () => {
    const base = fromTeamRecord(TEAM_FIXTURE).doc
    const need = Object.values(base.artifacts).find((a) => a.id === 'NEED-001')!
    const stk = Object.values(base.artifacts).find((a) => a.id === 'STK-001')!
    const req = makeArtifact({ id: 'REQ-STK-001', type: 'REQ-STK', title: 'Delivery window', stamp, week: 2 })
    const link = makeRelationship({ id: nextId(base, 'LNK'), category: 'trace', type: 'derives-from', from: req.uid, to: need.uid, stamp })
    const seeded = applyOps(base, [{ op: 'create-artifact', artifact: req }, { op: 'create-relationship', relationship: link }], stamp)
    if (!seeded.ok) throw new Error(seeded.error)
    const r = commitOps(seeded.doc, [{ op: 'update-artifact', uid: need.uid, fields: [{ path: 'description', before: need.description, after: `${need.description} within two days` }] }], ctx(4), 'Edited NEED-001 text')
    if (!r.ok) throw new Error(r.error)
    expect(r.doc.artifacts[req.uid].review).toMatchObject({ state: 'needs-review' })
    const rv = r.doc.artifacts[req.uid].review
    if (rv.state === 'needs-review') expect(rv.causes[0]).toMatchObject({ changedId: 'NEED-001', path: [link.id] })
    expect(r.doc.relationships[link.uid].status).toBe('suspect')
    expect(r.doc.artifacts[stk.uid].review.state).toBe('none')
    // a person clears the flag with a rationale; the link returns to active
    const c = applyOps(r.doc, clearReviewOps(r.doc, req.uid, 'JS', 'still derives from the reworded need', ctx(5).at), ctx(5))
    if (!c.ok) throw new Error(c.error)
    expect(c.doc.artifacts[req.uid].review).toMatchObject({ state: 'reviewed', rationale: 'still derives from the reworded need' })
    expect(c.doc.relationships[link.uid].status).toBe('active')
  })
  it('a stakeholder rename flags its concerns and needs; filling in a blank field does not', () => {
    const base = fromTeamRecord(TEAM_FIXTURE).doc
    const stk = Object.values(base.artifacts).find((a) => a.id === 'STK-002')!
    const r = commitOps(base, [{ op: 'update-artifact', uid: stk.uid, fields: [{ path: 'title', before: stk.title, after: 'Renamed group' }] }], ctx(6), 'rename')
    if (!r.ok) throw new Error(r.error)
    const flagged = Object.values(r.doc.artifacts).filter((a) => a.review.state === 'needs-review').map((a) => a.id)
    expect(flagged).toEqual(expect.arrayContaining(['CON-002', 'NEED-002']))
    const empty = emptyProject()
    const ent = Object.values(empty.artifacts).find((a) => a.type === 'ENT')!
    const r2 = commitOps(empty, [{ op: 'update-artifact', uid: ent.uid, fields: [{ path: 'title', before: '', after: 'X' }] }], ctx(7), 'name')
    if (!r2.ok) throw new Error(r2.error)
    expect(Object.values(r2.doc.artifacts).filter((a) => a.review.state === 'needs-review')).toEqual([])
  })
})

describe('projection onto the AeroLink model vocabulary (T-C10)', () => {
  it('a projected Week 1 project passes validateModel with no errors', () => {
    const m = toEngineeringModel(fromTeamRecord(TEAM_FIXTURE).doc)
    expect(m.elements.length).toBeGreaterThan(20)
    expect(validateModel(m).filter((i) => i.severity === 'error')).toEqual([])
  })
})
