// Week 1 → Week 8 continuity (M7): the Week 8 lab tool reading My Project.
//   golden    the same Week 1 data gives a byte-identical skeleton via a file import and via the project, and the
//             file-import skeleton itself is unchanged (pinned to a golden file);
//   mappings  the package per Week 1 ID is stored in the project with its provenance, keeps its MAP ID across
//             re-confirmations and re-reads, and a later change, rename, removal or addition is reported, never dropped;
//   isolation an AeroLink practice copy that was not adapted never enters the Week 8 source or the mapping list.
import { describe, expect, it } from 'vitest'
import GOLDEN from '../__golden__/week8-skeleton-fixture.golden.sysml?raw'
import { teamModelInputs } from '../../workbench/week1/team'
import { TEAM_FIXTURE } from '../../workbench/week1/teamFixture'
import { generateSysml, importFile, type ImportSource } from '../../workbench/week8/skeleton'
import { derive, EMPTY_STATE } from '../../workbench/week8/state'
import { commitOps } from '../model/commit'
import type { Operation, ProjectDoc, Stamp } from '../model/types'
import { copyStakeholdersOps } from '../practice/copyFromPractice'
import { fromTeamRecord, toTeamRecord } from './week1'
import { analyzeImport } from '../transfer/importProject'
import { projectReport } from '../transfer/report'
import { cleanMapping } from '../model/mappingShape'
import { exportProjectText } from '../transfer/exportProject'
import { buildPreview, confirmMappingOps, mappedReason, mappingViews, projectRefOf, WEEK8_PACKAGES, WEEK8_PROJECT_ORIGIN, week1Entries, week8MappingOf, week8SourceFromProject, withdrawMappingOp } from './week8'

const PURPOSE = 'Plan pantry deliveries and decide where to add cold storage for the county.'
const OPTION_SETS = [
  { purpose: PURPOSE, date: '2026-10-19' },
  { purpose: PURPOSE, date: '2026-10-19', assessment: false },
  { purpose: '', date: '2026-10-19', relationships: 'conflicts' as const },
]
let n = 0
const stamp = (): Stamp => ({ at: new Date(Date.UTC(2026, 10, 2, 12, 0, n)).toISOString(), by: 'JS', change: `CHG-${String(100 + ++n).padStart(6, '0')}` })
function commit(doc: ProjectDoc, build: (d: ProjectDoc, s: Stamp) => Operation[]): ProjectDoc {
  const s = stamp()
  const r = commitOps(doc, build(doc, s), s, 'test')
  if (!r.ok) throw new Error(r.error)
  return { ...r.doc, rev: r.doc.rev + 1 }
}
const fileSource = (doc: ProjectDoc): ImportSource => {
  const r = importFile(JSON.stringify(teamModelInputs(toTeamRecord(doc, { excludeUnadapted: true }), '2026-10-19')))
  if ('error' in r || r.kind !== 'week1') throw new Error('import failed')
  return r.source
}
/** The file a student actually exports from the Week 1 lab tool for a record (independent of the project projection:
 *  M7 review M7-6). */
const studentFile = (rec: typeof TEAM_FIXTURE): ImportSource => {
  const r = importFile(JSON.stringify(teamModelInputs(rec, '2026-10-19')))
  if ('error' in r || r.kind !== 'week1') throw new Error('import failed')
  return r.source
}
const byId = (doc: ProjectDoc, id: string) => Object.values(doc.artifacts).find((a) => a.id === id)!
const entry = (doc: ProjectDoc, id: string) => week1Entries(doc).find((e) => e.id === id)!

describe('golden: the same Week 1 data gives the same skeleton via a file and via My Project', () => {
  const doc = fromTeamRecord(TEAM_FIXTURE).doc

  it('the project source is the source of the file the student exports for the same record, field by field (origin included)', () => {
    expect(week8SourceFromProject(doc)).toEqual(studentFile(TEAM_FIXTURE))
    expect(week8SourceFromProject(doc)).toEqual(fileSource(doc))
    expect(week8SourceFromProject(doc).origin).toBe(WEEK8_PROJECT_ORIGIN)
  })

  it('byte-identical SysML text for every option set, and through the tool state (derive)', () => {
    for (const o of OPTION_SETS) expect(generateSysml(week8SourceFromProject(doc), o).text).toBe(generateSysml(studentFile(TEAM_FIXTURE), o).text)
    const file = studentFile(TEAM_FIXTURE)
    const viaFile = derive({ ...EMPTY_STATE, week1: file, week1Origin: file.origin, purpose: PURPOSE }, '2026-10-19')!
    const viaProject = derive({ ...EMPTY_STATE, source: 'project', projectRef: projectRefOf(doc, 'indexeddb', '2026-11-02T12:00:00.000Z'), week1: week8SourceFromProject(doc), week1Origin: 'My Project', purpose: PURPOSE }, '2026-10-19')!
    expect(viaProject.model.text).toBe(viaFile.model.text)
    expect(viaProject.matrix).toEqual(viaFile.matrix)
    expect(viaProject.findings).toEqual(viaFile.findings)
  })

  it('the file-import skeleton is unchanged, and the project read gives exactly the pinned golden file', () => {
    const norm = (t: string) => t.replace(/\r\n/g, '\n')
    expect(norm(generateSysml(studentFile(TEAM_FIXTURE), OPTION_SETS[0]).text)).toBe(norm(GOLDEN))
    expect(norm(generateSysml(week8SourceFromProject(doc), OPTION_SETS[0]).text)).toBe(norm(GOLDEN))
  })

  it('a partly written project gives the same text both ways too', () => {
    const half = commit(doc, (d) => [{ op: 'retire-artifact', uid: byId(d, 'NEED-002').uid, reason: 'Merged' }, { op: 'update-artifact', uid: byId(d, 'STK-003').uid, fields: [{ path: 'title', before: byId(d, 'STK-003').title, after: '' }] }])
    // the file side is the student's own record with the same edits, built without the project
    const rec = { ...TEAM_FIXTURE, needs: TEAM_FIXTURE.needs.filter((x) => x.id !== 'NEED-002'), stakeholders: TEAM_FIXTURE.stakeholders.map((x) => (x.id === 'STK-003' ? { ...x, name: '' } : x)) }
    for (const o of OPTION_SETS) expect(generateSysml(week8SourceFromProject(half), o).text).toBe(generateSysml(studentFile(rec), o).text)
  })
})

describe('the package per Week 1 ID is stored in the project', () => {
  const base = fromTeamRecord(TEAM_FIXTURE).doc

  it('confirming stores a MAP record with provenance; a re-confirmation keeps the uid and ID; a new item takes the next number', () => {
    let doc = commit(base, (d, s) => confirmMappingOps(d, [{ entry: entry(d, 'STK-001'), choice: { pkg: 'Stakeholders', reason: '' } }], s))
    const m1 = week8MappingOf(doc, byId(doc, 'STK-001').uid)!
    expect(m1).toMatchObject({ id: 'MAP-001', status: 'mapped', rule: 'STK', pkg: 'Stakeholders', week: 8, source: { id: 'STK-001', title: byId(doc, 'STK-001').title } })
    expect(m1.confirmedBy).toMatchObject({ by: 'JS' })
    expect(m1.sourceRevision).toBe(byId(doc, 'STK-001').revision)
    expect(doc.issued.MAP).toBe(1)
    // a custom package with a short reason (accepted), then a second item
    doc = commit(doc, (d, s) => confirmMappingOps(d, [{ entry: entry(d, 'STK-001'), choice: { pkg: 'Context', reason: 'Regulator' } }, { entry: entry(d, 'CON-001'), choice: { pkg: 'Stakeholders', reason: '' } }], s))
    const again = week8MappingOf(doc, byId(doc, 'STK-001').uid)!
    expect([again.uid, again.id]).toEqual([m1.uid, 'MAP-001'])
    expect(again).toMatchObject({ rule: 'custom', pkg: 'Context', statusReason: 'Regulator' })
    expect(week8MappingOf(doc, byId(doc, 'CON-001').uid)!.id).toBe('MAP-002')
    // a re-read (export and reimport of the document) keeps every record and ID
    const reread = JSON.parse(JSON.stringify(doc)) as ProjectDoc
    expect(mappingViews(reread).rows.filter((v) => v.state === 'mapped').map((v) => v.mapping!.id)).toEqual(['MAP-001', 'MAP-002'])
  })

  it('a mapping never takes a MAP number issued before, even after a withdrawn one', () => {
    let doc = commit(base, (d, s) => confirmMappingOps(d, [{ entry: entry(d, 'STK-002'), choice: { pkg: 'Stakeholders', reason: '' } }], s))
    doc = commit(doc, (d, s) => [withdrawMappingOp(week8MappingOf(d, byId(d, 'STK-002').uid)!, 'Not needed', s)])
    doc = commit(doc, (d, s) => confirmMappingOps(d, [{ entry: entry(d, 'STK-003'), choice: { pkg: 'Stakeholders', reason: '' } }], s))
    expect(week8MappingOf(doc, byId(doc, 'STK-003').uid)!.id).toBe('MAP-002')
    expect(Object.keys(doc.mappings)).toHaveLength(2)
  })

  it('reports what changed since the mappings: renamed, changed, removed (mapping kept), added', () => {
    let doc = commit(base, (d, s) => confirmMappingOps(d, ['STK-001', 'STK-002', 'CON-001', 'NEED-001'].map((id) => ({ entry: entry(d, id), choice: { pkg: '', reason: '' } })), s))
    expect(mappingViews(doc).drift).toEqual({ added: [], removed: [], renamed: [], changed: [] })
    const stk1 = byId(doc, 'STK-001')
    const stk2 = byId(doc, 'STK-002')
    doc = commit(doc, (d) => [
      { op: 'update-artifact', uid: stk1.uid, fields: [{ path: 'title', before: stk1.title, after: 'Renamed stakeholder' }] },
      { op: 'update-artifact', uid: stk2.uid, fields: [{ path: 'attributes.stage', before: d.artifacts[stk2.uid].attributes.stage, after: 'Retirement' }] },
      { op: 'retire-artifact', uid: byId(d, 'NEED-001').uid, reason: 'Merged into NEED-002' },
    ])
    const { rows, drift } = mappingViews(doc)
    expect(drift.renamed.map((v) => v.entry!.id)).toEqual(['STK-001'])
    expect(drift.renamed[0].mapping!.source!.title).toBe(stk1.title)
    expect(drift.changed.map((v) => v.entry!.id)).toEqual(['STK-002'])
    expect(drift.removed.map((v) => v.mapping!.source!.id)).toEqual(['NEED-001'])
    expect(rows.find((v) => v.state === 'removed')!.mapping!.id).toBe('MAP-004')
    expect(Object.keys(doc.mappings)).toHaveLength(4) // nothing dropped
    // the Week 8 preview reflects it: Mapped only where unchanged, Needs review where changed
    const p = buildPreview(doc, '2026-10-19')
    const row = (id: string) => p.groups.flatMap((g) => g.rows).find((r) => r.id === id)!
    expect(row('CON-001').status).toBe('mapped')
    expect(row('STK-001').status).toBe('needs-review')
    expect(row('STK-002').status).toBe('needs-review')
    // an item created after the mappings is "added"
    const before = Object.keys(doc.artifacts).length
    doc = commit(doc, (d, s) => {
      const r = copyStakeholdersOps(d, ['STK-002'], s)
      return r.ops
    })
    expect(Object.keys(doc.artifacts).length).toBeGreaterThan(before)
    // (a practice copy that is not adapted is never offered for mapping)
    expect(mappingViews(doc).drift.added).toEqual([])
  })

  it('confirming again clears the review; withdrawing a removed item keeps its record', () => {
    let doc = commit(base, (d, s) => confirmMappingOps(d, ['STK-001', 'NEED-001'].map((id) => ({ entry: entry(d, id), choice: { pkg: '', reason: '' } })), s))
    const stk1 = byId(doc, 'STK-001')
    doc = commit(doc, (d) => [{ op: 'update-artifact', uid: stk1.uid, fields: [{ path: 'title', before: stk1.title, after: 'New name' }] }, { op: 'retire-artifact', uid: byId(d, 'NEED-001').uid, reason: 'Gone' }])
    doc = commit(doc, (d, s) => confirmMappingOps(d, [{ entry: entry(d, 'STK-001'), choice: { pkg: 'Stakeholders', reason: '' } }], s))
    expect(mappingViews(doc).rows.find((v) => v.entry?.id === 'STK-001')!.state).toBe('mapped')
    const removed = mappingViews(doc).drift.removed[0]
    doc = commit(doc, (_d, s) => [withdrawMappingOp(removed.mapping!, 'Removed from My Project', s)])
    const v = mappingViews(doc)
    expect(v.drift.removed).toEqual([])
    expect(v.rows.find((x) => x.mapping?.id === 'MAP-002')!.state).toBe('withdrawn')
    expect(doc.mappings[removed.mapping!.uid]).toMatchObject({ id: 'MAP-002', status: 'not-mapped' })
  })

  it('an item added after the first mapping is listed as added', () => {
    let doc = commit(base, (d, s) => confirmMappingOps(d, [{ entry: entry(d, 'STK-001'), choice: { pkg: '', reason: '' } }], s))
    const s = stamp()
    const stk = { ...byId(doc, 'STK-001'), uid: 'new-stakeholder-uid', id: 'STK-099', title: 'Late stakeholder', created: s, revised: s, revision: 1 }
    doc = commit(doc, () => [{ op: 'create-artifact', artifact: stk }])
    expect(mappingViews(doc).drift.added.map((e) => e.id)).toEqual(['STK-099'])
  })
})

describe('isolation: AeroLink practice copies stay out of Week 8', () => {
  it('an unadapted practice copy is neither in the source nor offered for mapping', () => {
    const base = fromTeamRecord(TEAM_FIXTURE).doc
    const s = stamp()
    const { ops, created } = copyStakeholdersOps(base, ['STK-002'], s)
    const r = commitOps(base, ops, s, 'copy')
    if (!r.ok) throw new Error(r.error)
    const src = week8SourceFromProject(r.doc)
    for (const id of created) {
      expect(src.stakeholders.map((x) => x.id)).not.toContain(id)
      expect(week1Entries(r.doc).map((e) => e.id)).not.toContain(id)
    }
    expect(src).toEqual(week8SourceFromProject(base))
  })
})

describe('review fixes', () => {
  const base = fromTeamRecord(TEAM_FIXTURE).doc
  const rowOf = (doc: ProjectDoc, id: string) => buildPreview(doc, '2026-10-19').groups.flatMap((g) => g.rows).find((r) => r.id === id)!

  it('malformed mapping records never crash the preview or the mapping list: read defensively, skipped or flagged', () => {
    const stk = byId(base, 'STK-001')
    const con = byId(base, 'CON-001')
    const raw = (over: Record<string, unknown>) => ({ uid: `u-${Math.random().toString(36).slice(2, 8)}`, id: 'MAP-001', artifact: stk.uid, elements: [], rule: 'STK', status: 'mapped', statusReason: '', findings: [], sourceRevision: 1, week: 8, ...over })
    const bad = {
      noTitle: raw({ id: 'MAP-001', source: { id: 'STK-001' } }),
      textSource: raw({ id: 'MAP-002', artifact: con.uid, source: 'x' }),
      numberTitle: raw({ id: 'MAP-003', artifact: byId(base, 'NEED-001').uid, source: { id: 'NEED-001', title: 5 }, statusReason: { not: 'text' }, confirmedBy: 'JS' }),
      noId: { uid: 'u-noid', source: { id: 'STK-002', title: 'x' } },
      notObject: 'garbage',
    }
    const doc = { ...base, mappings: bad as unknown as ProjectDoc['mappings'] }
    expect(() => mappingViews(doc)).not.toThrow()
    expect(() => buildPreview(doc, '2026-10-19')).not.toThrow()
    const v = mappingViews(doc)
    expect(v.rows.find((r) => r.entry?.id === 'STK-001')!.mapping!.source!.title).toBe('') // usable, its title unreadable → shown as renamed, never crashed
    expect(v.rows.find((r) => r.entry?.id === 'CON-001')!.mapping).toBeUndefined() // source not an object: not a Week 8 record
    expect(typeof v.rows.find((r) => r.entry?.id === 'NEED-001')!.mapping!.statusReason).toBe('string')
    expect(v.skipped.join(' ')).toMatch(/without a usable ID was left out/)
    expect(v.partial.join(' ')).toMatch(/MAP-003: who confirmed it could not be read/) // shown, read in part
    expect(buildPreview(doc, '2026-10-19').skipped.length).toBeGreaterThan(0)
  })

  it('Import Project reads mapping records field by field and reports what it left out', async () => {
    const stk = byId(base, 'STK-001')
    const file = JSON.parse(await exportProjectText(base, { exportedBy: 'JS' }))
    file.mappings = [
      { uid: 'm-ok', id: 'MAP-004', artifact: stk.uid, elements: [], rule: 'STK', status: 'mapped', statusReason: '', findings: [], sourceRevision: 1, week: 8, pkg: 'Stakeholders', source: { id: 'STK-001', title: stk.title, projectRev: 3 }, confirmedBy: { at: '2026-11-02T12:00:00.000Z', by: 'JS', change: 'CHG-000009' } },
      { uid: 'm-bad', id: 'MAP-005', artifact: stk.uid, status: 'mapped', source: { id: 'STK-001', title: 7 } },
      { uid: 'm-noid', id: 'not a map id', source: { id: 'STK-001' } },
    ]
    delete file.checksum
    const a = await analyzeImport(JSON.stringify(file), 'p.json')
    if (!a.ok) throw new Error(a.error)
    expect(a.incoming.mappings['m-ok']).toMatchObject({ id: 'MAP-004', pkg: 'Stakeholders', source: { id: 'STK-001', projectRev: 3 } })
    expect(a.incoming.mappings['m-bad'].source).toEqual({ id: 'STK-001', title: '', projectRev: 0 })
    expect(a.incoming.mappings['m-noid']).toBeUndefined()
    expect(a.incoming.issued.MAP).toBe(5) // never reused
    expect(a.issues.filter((i) => /Week 8 mapping/.test(i.message)).length).toBeGreaterThanOrEqual(2)
    expect(() => mappingViews(a.incoming)).not.toThrow()
  })

  it('a package the team chose instead of the course one is shown as the team’s choice, not as the course working mapping', () => {
    const doc = commit(base, (d, s) => confirmMappingOps(d, [{ entry: entry(d, 'CON-001'), choice: { pkg: 'Needs', reason: 'Read as a need' } }, { entry: entry(d, 'NEED-001'), choice: { pkg: '', reason: '' } }], s))
    const custom = week8MappingOf(doc, byId(doc, 'CON-001').uid)!
    expect(mappedReason(custom, 'CON')).toBe('Mapped by your team in the Week 8 lab tool (MAP-001): package Needs, chosen by your team instead of the course working mapping (Stakeholders). Reason: Read as a need.')
    expect(mappedReason(custom, 'CON')).not.toMatch(/, the course working mapping\./)
    expect(mappedReason(week8MappingOf(doc, byId(doc, 'NEED-001').uid)!, 'NEED')).toMatch(/package Needs, the course working mapping\.$/)
    const doc2 = commit(doc, (d, s) => confirmMappingOps(d, [{ entry: entry(d, 'STK-001'), choice: { pkg: 'Context', reason: 'Regulator' } }], s))
    const row = rowOf(doc2, 'STK-001')
    expect(row.status).toBe('mapped')
    expect(row.reason).toMatch(/package Context, chosen by your team instead of the course working mapping \(Stakeholders\)\. Reason: Regulator\./)
  })

  it('an audit gap stays “Invalid or incomplete” after the team confirms the mapping (a confirmation never hides a gap)', () => {
    const half = commit(base, (d) => [{ op: 'update-artifact', uid: byId(d, 'STK-003').uid, fields: [{ path: 'title', before: byId(d, 'STK-003').title, after: '' }] }])
    expect(rowOf(half, 'STK-003').status).toBe('invalid-or-incomplete')
    const doc = commit(half, (d, s) => confirmMappingOps(d, [{ entry: entry(d, 'STK-003'), choice: { pkg: '', reason: '' } }, { entry: entry(d, 'STK-001'), choice: { pkg: '', reason: '' } }], s))
    expect(mappingViews(doc).rows.find((r) => r.entry?.id === 'STK-003')!.state).toBe('mapped')
    expect(rowOf(doc, 'STK-003').status).toBe('invalid-or-incomplete')
    expect(rowOf(doc, 'STK-001').status).toBe('mapped') // the same confirmation does give Mapped where there is no gap
  })

  it('the package list holds packages only', () => {
    expect(WEEK8_PACKAGES).toContain('Stakeholders')
    expect(WEEK8_PACKAGES).not.toContain('owned by what it measures')
    expect(WEEK8_PACKAGES.every((p) => /^[A-Z][A-Za-z]*$/.test(p))).toBe(true)
  })
})

describe('confirmation fixes', () => {
  const base = fromTeamRecord(TEAM_FIXTURE).doc
  const stk = byId(base, 'STK-001')
  const rec = (over: Record<string, unknown>) => ({ uid: 'm-x', id: 'MAP-001', artifact: stk.uid, elements: [], rule: 'custom', status: 'mapped', statusReason: '', findings: [], sourceRevision: 1, week: 8, source: { id: 'STK-001', title: stk.title, projectRev: 1 }, ...over })

  it('a package name that is not a package is dropped and reported, on import too, so it is never written back', async () => {
    const r = cleanMapping(rec({ pkg: 'owned by what it measures' }))
    expect(r.mapping).not.toHaveProperty('pkg')
    expect(r.problems.join(' ')).toMatch(/“owned by what it measures” is not a package of the course working mapping and was left out/)
    expect(cleanMapping(rec({ pkg: 'Context' })).mapping!.pkg).toBe('Context')
    const file = JSON.parse(await exportProjectText(base, { exportedBy: 'JS' }))
    file.mappings = [rec({ uid: 'm-pkg', id: 'MAP-002', pkg: 'owned by what it measures' })]
    delete file.checksum
    const a = await analyzeImport(JSON.stringify(file), 'p.json')
    if (!a.ok) throw new Error(a.error)
    expect(a.incoming.mappings['m-pkg']).not.toHaveProperty('pkg')
    expect(a.issues.some((i) => /not a package of the course working mapping/.test(i.message))).toBe(true)
    // withdrawing that record now sends a valid record
    expect(withdrawMappingOp(a.incoming.mappings['m-pkg'], 'x', stamp())).not.toHaveProperty('mapping.pkg')
  })

  it('a dropped record with a well-formed MAP ID still raises the counter, so its number is never issued again', async () => {
    const file = JSON.parse(await exportProjectText(base, { exportedBy: 'JS' }))
    file.mappings = [{ id: 'MAP-007', source: { id: 'STK-001' } } /* no uid: left out */, rec({ uid: 'm-ok', id: 'MAP-002' })]
    delete file.issued.MAP
    delete file.checksum
    const a = await analyzeImport(JSON.stringify(file), 'p.json')
    if (!a.ok) throw new Error(a.error)
    expect(Object.keys(a.incoming.mappings)).toEqual(['m-ok'])
    expect(a.incoming.issued.MAP).toBe(7)
    const ops = confirmMappingOps(a.incoming, [{ entry: entry(a.incoming, 'CON-001'), choice: { pkg: '', reason: '' } }], stamp())
    expect((ops[0] as Extract<Operation, { op: 'upsert-mapping' }>).mapping.id).toBe('MAP-008')
  })

  it('records that are not shown and records shown in part are reported separately', () => {
    const doc = { ...base, mappings: { a: rec({ uid: 'a', id: 'MAP-001', confirmedBy: 'JS' }), b: rec({ uid: 'b', id: 'MAP-002', artifact: byId(base, 'CON-001').uid, source: 'junk' }), c: { uid: 'c', source: { id: 'X' } } } as unknown as ProjectDoc['mappings'] }
    const v = mappingViews(doc)
    expect(v.partial).toEqual(['MAP-001: who confirmed it could not be read and was left out'])
    expect(v.skipped).toEqual(['MAP-002: the Week 1 item it was made for could not be read', 'a mapping record without a usable ID was left out'])
    expect(v.rows.find((r) => r.entry?.id === 'STK-001')!.mapping!.id).toBe('MAP-001') // the partly read one IS shown
  })

  it('the Engineering Report heading tells confirmed from unconfirmed mappings', () => {
    const none = projectReport(base)
    expect(none).toContain('## Week 8 mapping preview')
    expect(none).not.toContain('(not yet confirmed)')
    expect(none).toContain('No mapping is confirmed yet')
    const doc = commit(base, (d, s) => confirmMappingOps(d, [{ entry: entry(d, 'STK-001'), choice: { pkg: '', reason: '' } }], s))
    expect(projectReport(doc)).toMatch(/Mapped: confirmed by the team in the Week 8 lab tool \(1\)\. Every other status is a proposal or a gap, not yet confirmed\./)
  })
})
