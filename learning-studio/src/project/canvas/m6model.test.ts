// M6 canonical model additions (A25, A26; directive §12, §14; spec §k.1): the conflicting-concerns relation and the
// Week 1 relation labels, the A25 stakeholder fields and gates, assumptions and unknowns, the approval rewrite fix, the
// forward-compatible migration of pre-M6 documents (a baseline export from before M6, IndexedDB), the week1-model-inputs
// v3 golden files (Week 2 / Week 8 importers), and the progress and review models.
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { describe, expect, it } from 'vitest'
import goldenFull from '../__golden__/model-inputs-full.v3.golden.json?raw'
import goldenPartial from '../__golden__/model-inputs-partial.v3.golden.json?raw'
import recordPre from '../__golden__/record-full.pre-m6.json?raw'
import baselineV1 from '../__golden__/project-baseline.v1.json?raw'
import { importModelInputs, normalizeTeam, stakeholderRowIssues, teamModelInputs, checkRegister, checkProposal, type TeamRecord } from '../../workbench/week1/team'
import { importWeek1 } from '../../workbench/week2/record'
import { importFile } from '../../workbench/week8/skeleton'
import { TEAM_FIXTURE } from '../../workbench/week1/teamFixture'
import { diffTeamRecord, fromTeamRecord, toTeamRecord } from '../adapters/week1'
import { makeArtifact, makeRelationship } from '../model/create'
import { impactOf } from '../model/impact'
import { validateProject } from '../model/integrity'
import { applyOps } from '../model/ops'
import { CHANGED_SINCE_APPROVAL, touchesMaterial } from '../model/approvalBinding'
import { screenMemberOps } from '../model/serverRules'
import { allowedPair, categoryFor } from '../model/vocabulary'
import { concernConflicts, hasRationale, week1KindOf, week1Relations } from '../model/week1Relations'
import type { ProjectDoc } from '../model/types'
import { IndexedDbAdapter } from '../store/indexedDb'
import { ProjectStore } from '../store/ProjectStore'
import { analyzeImport } from '../transfer/importProject'
import { buildExport, exportProjectText } from '../transfer/exportProject'
import { addConcernConflict, createAu, linkAffects, recordOps, setEnterpriseField } from './canvasModel'
import { approvalStatus, canvasProgress } from './progress'
import { FIELD_GUIDANCE, guidanceFor, objectiveText } from '../../week1/guidance/fieldGuidance'
import { reviewModel, validationReport } from '../../week1/review/report'
import { scanStudentText } from '../../week1/learn/studentScan'

const TODAY = '2026-10-21'
const stamp = (n = 1) => ({ at: `2026-10-21T10:00:${String(n).padStart(2, '0')}.000Z`, by: 'JS', change: `CHG-${String(800 + n).padStart(6, '0')}` })
const apply = (doc: ProjectDoc, ops: Parameters<typeof applyOps>[1], n = 1) => {
  const r = applyOps(doc, ops, stamp(n))
  if (!r.ok) throw new Error(r.error)
  return r.doc
}
const fixtureDoc = () => fromTeamRecord(TEAM_FIXTURE, { initials: 'JS', at: '2026-10-20T09:00:00.000Z' }).doc
const byId = (d: ProjectDoc, id: string) => Object.values(d.artifacts).find((a) => a.id === id)!

describe('§14 relations: conflicting concerns and the Week 1 labels', () => {
  it('CON conflicts-with CON is allowed only in the trace category (LNK); STK conflicts-with STK stays a REL row', () => {
    expect(allowedPair('CON', 'conflicts-with', 'CON', 'trace')).toBe(true)
    expect(allowedPair('CON', 'conflicts-with', 'CON')).toBe(false) // the primary (stakeholder) rule joins STK only
    expect(allowedPair('STK', 'conflicts-with', 'STK')).toBe(true)
    expect(allowedPair('CON', 'conflicts-with', 'STK', 'trace')).toBe(false)
    expect(categoryFor('CON', 'conflicts-with', 'CON')).toBe('trace')
    expect(categoryFor('STK', 'conflicts-with', 'STK')).toBe('stakeholder')
  })
  it('integrity: a self-link, a duplicate in either direction and a stakeholder-category CON link are refused', () => {
    const d = fixtureDoc()
    const [a, b] = [byId(d, 'CON-001'), byId(d, 'CON-007')]
    const d1 = apply(d, addConcernConflict(d, a.uid, b.uid, 'Early produce deliveries mean early van noise.', stamp(1)))
    expect(concernConflicts(d1)).toHaveLength(1)
    expect(applyOps(d1, addConcernConflict(d1, b.uid, a.uid, 'reverse', stamp(2)), stamp(2))).toMatchObject({ ok: false, error: expect.stringMatching(/already exists/) })
    expect(applyOps(d1, addConcernConflict(d1, a.uid, a.uid, 'self', stamp(3)), stamp(3))).toMatchObject({ ok: false, error: expect.stringMatching(/itself/) })
    const wrong = makeRelationship({ id: 'REL-099', category: 'stakeholder', type: 'conflicts-with', from: a.uid, to: b.uid, stamp: stamp(4) })
    expect(applyOps(d1, [{ op: 'create-relationship', relationship: wrong }], stamp(4))).toMatchObject({ ok: false, error: expect.stringMatching(/not an allowed relationship/) })
    expect(validateProject(d1).filter((i) => i.severity === 'error')).toEqual([])
  })
  it('a conflicting-concerns link never joins the REL rows or the v3 export, and has impact none', () => {
    const d = fixtureDoc()
    const [a, b] = [byId(d, 'CON-001'), byId(d, 'CON-007')]
    const d1 = apply(d, addConcernConflict(d, a.uid, b.uid, 'pulls against', stamp(1)))
    expect(toTeamRecord(d1).relationships).toEqual(toTeamRecord(d).relationships)
    expect(JSON.stringify(teamModelInputs(toTeamRecord(d1), TODAY))).toBe(JSON.stringify(teamModelInputs(toTeamRecord(d), TODAY)))
    expect(impactOf(d1, a.uid, { change: 'CHG-1', changedId: a.id, summary: 'edited' }).filter((f) => f.target === b.uid)).toEqual([])
  })
  it('every stored Week 1 link reads as its §14 relation with the student label', () => {
    const d = fixtureDoc()
    const rels = week1Relations(d)
    const kinds = new Map<string, number>()
    for (const r of rels) kinds.set(r.kind, (kinds.get(r.kind) ?? 0) + 1)
    expect(Object.fromEntries(kinds)).toEqual({ 'has-concern': 8, 'expresses-need': 8, 'motivates-need': 8, 'supports-objective': 8, 'refines-mission': 4, contains: 4, influences: 3 })
    const motivates = rels.find((r) => r.kind === 'motivates-need')!
    expect(motivates.sentence).toMatch(/^CON-\d{3} motivates NEED-\d{3}$/)
    const has = rels.find((r) => r.kind === 'has-concern')!
    expect(has.sentence).toMatch(/^STK-\d{3} has concern CON-\d{3}$/)
    expect(rels.find((r) => r.kind === 'influences')!.sentence).toMatch(/^STK-\d{3} (conflicts with|regulates|coordinates with) STK-\d{3}$/)
    expect(week1KindOf(d, Object.values(d.relationships)[0])).not.toBeNull()
    expect(hasRationale({ rationale: 'too short' })).toBe(false)
    expect(hasRationale({ rationale: 'Families arriving after work find no produce.' })).toBe(true)
  })
})

describe('A25: interest required with a reason, influence and support optional', () => {
  const s = { ...TEAM_FIXTURE.stakeholders[0] }
  it('the register gate', () => {
    expect(stakeholderRowIssues(s)).toEqual([])
    expect(stakeholderRowIssues({ ...s, interest: '' })).toContain('a level of interest from 1 to 5')
    expect(stakeholderRowIssues({ ...s, interestReason: 'n/a' })).toContain('a short reason for the level of interest')
    expect(stakeholderRowIssues({ ...s, influence: '', reason: '' })).toEqual([]) // influence is optional
    expect(stakeholderRowIssues({ ...s, influence: '9' })).toContain('an influence rating from 1 to 5, or leave it empty')
    expect(stakeholderRowIssues({ ...s, influence: '3', reason: '' })).toContain('a reason for the influence rating')
    expect(stakeholderRowIssues({ ...s, support: '5' })).toContain('a support level from 1 to 4, or leave it empty')
    expect(checkRegister(TEAM_FIXTURE).ok).toBe(true)
  })
  it('the canonical model stores them on the stakeholder; the projection round-trips; empty stays absent', () => {
    const d = fixtureDoc()
    expect(byId(d, 'STK-001').attributes).toMatchObject({ interest: '5', interestReason: 'fresh food for their children depends on it', support: '3' })
    expect(byId(d, 'STK-003').attributes.support ?? null).toBeNull()
    expect(toTeamRecord(d).stakeholders[0]).toMatchObject({ interest: '5', support: '3' })
  })
  it('the proposal: approval is an instructor action; the content check is separate and the decision message no longer asks students to record it', () => {
    const p = { ...TEAM_FIXTURE.proposal, decision: '' as const, decidedOn: '' }
    expect(checkProposal(p, TODAY).issues.join(' ')).toMatch(/Request instructor approval/)
    expect(checkProposal(p, TODAY).issues.join(' ')).not.toMatch(/Record the instructor/)
  })
})

describe('approval stays server-owned (A26)', () => {
  it('an unrelated edit never rewrites a stored server decision the record cannot hold (changed-since-approval)', () => {
    const d0 = fixtureDoc()
    const ent = byId(d0, 'ENT-001')
    const d = apply(d0, [{ op: 'update-artifact', uid: ent.uid, fields: [{ path: 'attributes.approval', before: ent.attributes.approval, after: { decision: CHANGED_SINCE_APPROVAL, decidedOn: '2026-10-19' } }] }])
    const ops = recordOps(d, (r) => ({ ...r, stakeholders: r.stakeholders.map((x, i) => (i === 0 ? { ...x, name: 'Families' } : x)) }), stamp(2))
    expect(ops.length).toBeGreaterThan(0)
    expect(JSON.stringify(ops)).not.toMatch(/approval/)
    expect(screenMemberOps(d, ops).ok).toBe(true)
  })
  it('editing a material field (description, mission, objective, boundary) is detected for the re-review warning; stakeholders are not', () => {
    const d = fixtureDoc()
    expect(touchesMaterial(d, setEnterpriseField(d, 'description', 'A network of food banks.', stamp(1)))).toBe(true)
    expect(touchesMaterial(d, recordOps(d, (r) => ({ ...r, proposal: { ...r.proposal, purpose: 'Feed every family weekly.' } }), stamp(2)))).toBe(true)
    expect(touchesMaterial(d, recordOps(d, (r) => ({ ...r, stakeholders: r.stakeholders.map((x, i) => (i === 0 ? { ...x, interest: '4' } : x)) }), stamp(3)))).toBe(false)
  })
  it('the approval the canvas shows: offline a decision is self-reported, never an instructor approval', () => {
    const d = fixtureDoc() // the fixture carries a legacy self-declared "approved"
    expect(approvalStatus(d, false).state).toBe('self-reported')
    expect(approvalStatus(d, true).state).toBe('approved')
  })
})

describe('assumptions and unknowns (A25 (4))', () => {
  it('A/U artifacts tagged milestone 1, with rationale, linkable with "affects", counted by progress as optional', () => {
    const d = fixtureDoc()
    expect(canvasProgress(d, { serverMode: false }).parts.find((p) => p.id === 'assumptions')!.state).toBe('optional')
    const c = createAu(d, 'A', { title: 'Volunteers keep their two-hour shifts.' }, stamp(1))
    const d1 = apply(d, c.ops)
    expect(c.id).toBe('A-001')
    const a = byId(d1, 'A-001')
    expect(a.milestones).toEqual([1])
    expect(canvasProgress(d1, { serverMode: false }).parts.find((p) => p.id === 'assumptions')!.issues.join(' ')).toMatch(/rationale/)
    const d2 = apply(d1, [{ op: 'update-artifact', uid: a.uid, fields: [{ path: 'rationale', before: '', after: 'The volunteer office confirmed the shift policy for this year.' }] }, ...linkAffects(d1, a.uid, byId(d1, 'NEED-004').uid, stamp(2))], 2)
    expect(canvasProgress(d2, { serverMode: false }).parts.find((p) => p.id === 'assumptions')!.state).toBe('meets')
    expect(Object.values(d2.relationships).some((r) => r.type === 'affects' && r.from === a.uid)).toBe(true)
    expect(createAu(d2, 'U', {}, stamp(3)).id).toBe('U-001')
  })
})

describe('progress (transparent criteria, real artifacts)', () => {
  it('the complete fixture meets every required part; a missing interest is a draft stakeholder with its reason', () => {
    const d = fixtureDoc()
    const p = canvasProgress(d, { serverMode: true })
    expect(p.headline).toEqual({ meets: 6, required: 7 }) // the enterprise description is new in M6 and not in the fixture
    expect(p.parts.find((x) => x.id === 'enterprise')!.issues).toEqual(['Describe the enterprise: who it is and what it offers, in one or two sentences.'])
    const d1 = apply(d, setEnterpriseField(d, 'description', 'The network: the county food bank, its partner pantries and its volunteer drivers.', stamp(1)))
    expect(canvasProgress(d1, { serverMode: true }).headline).toEqual({ meets: 7, required: 7 })
    const d2 = apply(d1, recordOps(d1, (r) => ({ ...r, stakeholders: r.stakeholders.map((x, i) => (i === 2 ? { ...x, interest: '' } : x)) }), stamp(2)), 2)
    const stk = canvasProgress(d2, { serverMode: true }).parts.find((x) => x.id === 'stakeholders')!
    expect(stk.state).toBe('in-progress')
    expect(stk.count).toMatchObject({ complete: 7, required: 8 })
    expect(stk.items.find((x) => x.id === 'STK-003')).toMatchObject({ state: 'draft', reasons: ['Add a level of interest from 1 to 5.'] })
  })
  it('a filled box is not progress: a stakeholder with every field typed but a generic concern does not count', () => {
    const d = fixtureDoc()
    const d1 = apply(d, recordOps(d, (r) => ({ ...r, stakeholders: r.stakeholders.map((x, i) => (i === 0 ? { ...x, concerns: [{ ...x.concerns[0], text: 'Safety' }] } : x)) }), stamp(1)))
    const p = canvasProgress(d1, { serverMode: false })
    expect(p.parts.find((x) => x.id === 'concerns')!.items.find((x) => x.id === 'CON-001')!.state).toBe('draft')
    expect(p.parts.find((x) => x.id === 'stakeholders')!.count!.complete).toBe(7)
  })
})

describe('field guidance (the eight items of §12.2)', () => {
  it('every field has a definition with a source or the course-convention label, what is expected, a format, an objective, a rule and a Learn link', () => {
    const keys = Object.keys(FIELD_GUIDANCE)
    expect(keys.length).toBeGreaterThanOrEqual(40)
    for (const k of keys) {
      const g = guidanceFor(k)!
      expect(g.label, k).toBeTruthy()
      expect(g.definition.text, k).toBeTruthy()
      expect(g.expected, k).toBeTruthy()
      expect(g.format, k).toBeTruthy()
      expect(objectiveText(g.objective), k).toBeTruthy()
      expect(g.rule, k).toBeTruthy()
      expect(g.learnLink, k).toMatch(/^ch\d\d-\d\d$/)
    }
    expect(guidanceFor('stk.interest')!.definition.source).toBe('course convention')
    expect(guidanceFor('con.text')!.aerolinkExample!.caseRef).toBe('CON-012')
  })
  it('no internal code, pending-decision wording or "goal" leaks into the student guidance text', () => {
    const text = Object.values(FIELD_GUIDANCE).map((g) => [g.label, g.definition.text, g.expected, g.aerolinkExample?.text ?? '', g.format, g.rule, g.distinguishFrom ?? '', ...g.laterUse.map((u) => u.text)].join(' ')).join('\n')
    expect(scanStudentText(text)).toEqual([])
  })
})

describe('migration of pre-M6 documents (forward-compatible, non-destructive)', () => {
  it('the baseline export written before M6 imports with a valid checksum, no integrity error and the same Week 1 record', async () => {
    const a = await analyzeImport(baselineV1, 'baseline.json')
    if (!a.ok) throw new Error(a.error)
    expect(a.checksum).toBe('ok')
    expect(a.version).toBe(1)
    expect(validateProject(a.incoming).filter((i) => i.severity === 'error')).toEqual([])
    const pre = normalizeTeam(JSON.parse(recordPre)) as TeamRecord
    const got = toTeamRecord(a.incoming)
    expect(got.stakeholders.map(({ interest: _i, interestReason: _r, support: _s, ...x }) => x)).toEqual(pre.stakeholders.map(({ interest: _i, interestReason: _r, support: _s, ...x }) => x))
    expect(got.needs).toEqual(pre.needs)
    // nothing to migrate: opening and re-saving a pre-M6 document issues no operation at all
    expect(diffTeamRecord(a.incoming, toTeamRecord(a.incoming), stamp(1))).toEqual([])
  })
  it('M6 edits on the baseline survive export → import (interest, conflict, A-001, description, team review state)', async () => {
    const a = await analyzeImport(baselineV1, 'baseline.json')
    if (!a.ok) throw new Error(a.error)
    let d = a.incoming
    d = apply(d, recordOps(d, (r) => ({ ...r, stakeholders: r.stakeholders.map((x) => ({ ...x, interest: '3', interestReason: 'they are affected every week' })) }), stamp(1)), 1)
    d = apply(d, addConcernConflict(d, byId(d, 'CON-001').uid, byId(d, 'CON-007').uid, 'Early deliveries mean early noise near homes.', stamp(2)), 2)
    d = apply(d, createAu(d, 'U', { title: 'Whether the city noise limit applies before 6 a.m.' }, stamp(3)).ops, 3)
    d = apply(d, setEnterpriseField(d, 'description', 'The county food bank network and its partners.', stamp(4)), 4)
    d = apply(d, [{ op: 'update-milestone', week: 1, fields: [{ path: 'teamReview', before: undefined, after: { state: 'ready-for-review', by: 'JS', at: stamp(5).at } as never }] }], 5)
    const text = await exportProjectText(d, { exportedBy: 'JS', changes: [] })
    const b = await analyzeImport(text, 'after.json')
    if (!b.ok) throw new Error(b.error)
    expect(b.checksum).toBe('ok')
    expect(toTeamRecord(b.incoming).stakeholders.every((s) => s.interest === '3')).toBe(true)
    expect(concernConflicts(b.incoming)).toHaveLength(1)
    expect(byId(b.incoming, 'U-001').milestones).toEqual([1])
    expect(byId(b.incoming, 'ENT-001').description).toMatch(/food bank network/)
    expect(b.incoming.milestones[0].teamReview).toMatchObject({ state: 'ready-for-review', by: 'JS' })
    expect(validateProject(b.incoming).filter((i) => i.severity === 'error')).toEqual([])
    expect((await buildExport(b.incoming, { exportedBy: 'JS' })).schemaVersion).toBe(1) // no format bump was needed
  })
  it('IndexedDB: a document stored before M6 opens in the M6 store, takes M6 edits and keeps them after a reload', async () => {
    const factory = new IDBFactory()
    const name = `m6-${Math.random()}`
    const a = await analyzeImport(baselineV1, 'baseline.json')
    if (!a.ok) throw new Error(a.error)
    const s1 = new ProjectStore(await IndexedDbAdapter.open(factory, name), { autosaveMs: 0, locks: false, channel: false })
    await s1.init()
    await s1.create({ doc: a.incoming })
    await s1.flush()
    s1.dispose()
    const s2 = new ProjectStore(await IndexedDbAdapter.open(factory, name), { autosaveMs: 0, locks: false, channel: false })
    await s2.init()
    expect(s2.getState().doc!.project.uid).toBe(a.incoming.project.uid)
    expect(s2.apply((doc, st) => createAu(doc, 'A', { title: 'Donations stay at the current level.', rationale: 'The last three years were stable.' }, st).ops).ok).toBe(true)
    expect(s2.apply((doc, st) => setEnterpriseField(doc, 'description', 'The county food bank network.', st)).ok).toBe(true)
    await s2.flush()
    s2.dispose()
    const s3 = new ProjectStore(await IndexedDbAdapter.open(factory, name), { autosaveMs: 0, locks: false, channel: false })
    await s3.init()
    const d = s3.getState().doc!
    expect(byId(d, 'A-001').rationale).toBe('The last three years were stable.')
    expect(byId(d, 'ENT-001').description).toBe('The county food bank network.')
    s3.dispose()
  })
})

describe('week1-model-inputs v3: byte-compatible golden files (Week 2 / Week 8 importers)', () => {
  const pre = normalizeTeam(JSON.parse(recordPre)) as TeamRecord
  it('a record without the A25 fields exports the same bytes as before M6 (partial record)', () => {
    const partial = { ...pre, aiStatement: '' }
    expect(JSON.stringify(teamModelInputs(partial, TODAY), null, 2) + '\n').toBe(goldenPartial.replace(/\r\n/g, '\n'))
  })
  it('the complete pre-M6 record: identical bytes except the status, which A25 changes on purpose (interest is now required)', () => {
    const now = JSON.parse(JSON.stringify(teamModelInputs(pre, TODAY)))
    const was = JSON.parse(goldenFull)
    expect(was.status).toBe('ready')
    expect(now.status).toBe('not-ready')
    expect(JSON.stringify({ ...now, status: 'ready' }, null, 2)).toBe(JSON.stringify(was, null, 2))
  })
  it('with the A25 fields recorded, they are appended to each stakeholder (nothing else moves) and the importers read the file', () => {
    const out = teamModelInputs(TEAM_FIXTURE, TODAY)
    const was = JSON.parse(goldenFull)
    expect(out.status).toBe('ready')
    expect(Object.keys(out)).toEqual(Object.keys(was))
    out.stakeholders.forEach((s, i) => {
      const base = Object.keys(was.stakeholders[i])
      expect(Object.keys(s).slice(0, base.length)).toEqual(base)
      expect(Object.keys(s).slice(base.length).every((k) => ['interest', 'interestReason', 'support'].includes(k))).toBe(true)
    })
    const text = JSON.stringify(out, null, 2)
    const back = importModelInputs(text)
    if ('error' in back) throw new Error(back.error)
    expect(back.stakeholders[0]).toMatchObject({ interest: '5', interestReason: 'fresh food for their children depends on it', support: '3' })
    expect('snapshot' in importWeek1(text)).toBe(true)
    expect(importFile(text)).toMatchObject({ kind: 'week1' })
    expect('snapshot' in importWeek1(goldenFull)).toBe(true)
  })
})

describe('Review & Submit model', () => {
  it('only an unusable snapshot blocks submission; everything else is listed with a severity; the report is advisory', () => {
    const d = fixtureDoc()
    const m = reviewModel(d, { serverMode: true, approvalRequested: false })
    expect(m.blocks).toEqual(['Send the enterprise proposal for instructor approval (it may still be pending when you submit).'])
    expect(m.issues.filter((i) => i.severity === 'blocks')).toHaveLength(1)
    expect(reviewModel(d, { serverMode: true, approvalRequested: true }).blocks).toEqual([])
    expect(reviewModel(d, { serverMode: false, approvalRequested: false }).blocks).toEqual([])
    const r = validationReport(m, stamp(1).at)
    expect(r.advisory).toMatch(/never substitute/)
    expect(r.traces).toHaveLength(8)
    expect(m.issues.every((i) => /^s\d:[A-Za-z0-9:._ -]+$/.test(i.key) && i.key.length <= 120)).toBe(true)
    expect(m.teamReview).toBe('draft')
  })
  it('an unnamed enterprise blocks', () => {
    const d = fixtureDoc()
    const d1 = apply(d, recordOps(d, (r) => ({ ...r, proposal: { ...r.proposal, name: '' } }), stamp(1)))
    expect(reviewModel(d1, { serverMode: false, approvalRequested: false }).blocks).toEqual(['Name your enterprise.'])
  })
})

describe('the A25 model-inputs fields reach the course minimums through the canonical record', () => {
  it('a register of eight with interest recorded through the canvas meets the course checks', () => {
    const d = fromTeamRecord({ ...TEAM_FIXTURE, stakeholders: TEAM_FIXTURE.stakeholders.map((s) => ({ ...s, interest: '', interestReason: '' })) }).doc
    expect(checkRegister(toTeamRecord(d)).ok).toBe(false)
    const d1 = apply(d, recordOps(d, (r) => ({ ...r, stakeholders: r.stakeholders.map((s) => ({ ...s, interest: '4', interestReason: 'affected weekly' })) }), stamp(1)))
    expect(checkRegister(toTeamRecord(d1)).ok).toBe(true)
    expect(makeArtifact).toBeTruthy()
  })
})
