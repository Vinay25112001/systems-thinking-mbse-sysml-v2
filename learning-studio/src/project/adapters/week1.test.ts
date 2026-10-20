// Week 1 adapter: round trip (P1-T7), edits through the projection, stable IDs (P1-T4), legacy records.
import { describe, expect, it } from 'vitest'
import { checkAiStatement, checkCharterPart, checkContextPart, checkNeedsPart, checkProposal, checkRegister, nextId, normalizeTeam, partsComplete, teamModelInputs, importModelInputs, type TeamRecord } from '../../workbench/week1/team'
import { TEAM_FIXTURE } from '../../workbench/week1/teamFixture'
import { commitOps } from '../model/commit'
import { emptyProject } from '../model/create'
import { validateProject } from '../model/integrity'
import type { ProjectDoc } from '../model/types'
import { diffTeamRecord, fromTeamRecord, toTeamRecord } from './week1'

const TODAY = '2026-10-19'
const stripStamps = (r: TeamRecord) => ({ ...r, updatedAt: undefined, exportedMdAt: undefined, exportedJsonAt: undefined })
let n = 0
function edit(doc: ProjectDoc, patch: Partial<TeamRecord>): ProjectDoc {
  const after = normalizeTeam({ ...toTeamRecord(doc), ...patch })
  const ctx = { at: new Date(Date.UTC(2026, 9, 19, 12, 0, n++)).toISOString(), by: 'JS', change: `CHG-${String(n).padStart(6, '0')}` }
  const r = commitOps(doc, diffTeamRecord(doc, after, ctx), ctx, 'edit')
  if (!r.ok) throw new Error(r.error)
  return r.doc
}

describe('Week 1 adapter', () => {
  it('P1-T7: toTeamRecord(fromTeamRecord(fixture)) equals normalizeTeam(fixture), export stamps excluded', () => {
    const { doc, renumbered } = fromTeamRecord(TEAM_FIXTURE, { initials: 'JS' })
    expect(renumbered).toEqual([])
    expect(stripStamps(toTeamRecord(doc))).toEqual(stripStamps(normalizeTeam(TEAM_FIXTURE)))
    expect(validateProject(doc).filter((i) => i.severity === 'error')).toEqual([])
  })

  it('P1-T7: every part check gives the same result on the projected record', () => {
    const r = toTeamRecord(fromTeamRecord(TEAM_FIXTURE).doc)
    const f = normalizeTeam(TEAM_FIXTURE)
    expect(checkCharterPart(r.charter)).toEqual(checkCharterPart(f.charter))
    expect(checkProposal(r.proposal, TODAY)).toEqual(checkProposal(f.proposal, TODAY))
    expect(checkContextPart(r)).toEqual(checkContextPart(f))
    expect(checkRegister(r)).toEqual(checkRegister(f))
    expect(checkNeedsPart(r)).toEqual(checkNeedsPart(f))
    expect(checkAiStatement(r)).toEqual(checkAiStatement(f))
    expect(partsComplete(r, TODAY)).toBe(true)
  })

  it('stores traces as typed relationships: CON→STK, NEED→STK/CON/MGO, goal→mission, ENT contains PRT', () => {
    const { doc } = fromTeamRecord(TEAM_FIXTURE)
    const id = (uid: string) => doc.artifacts[uid].id
    const rels = Object.values(doc.relationships).filter((r) => !r.draft).map((r) => `${id(r.from)} ${r.type} ${id(r.to)}`)
    expect(rels).toContain('CON-001 derives-from STK-001')
    expect(rels).toContain('NEED-001 derives-from STK-001')
    expect(rels).toContain('NEED-001 derives-from CON-001')
    expect(rels.some((x) => /^NEED-001 derives-from MGO-00\d$/.test(x))).toBe(true)
    expect(rels).toContain('MGO-002 derives-from MGO-001')
    expect(rels).toContain('ENT-001 contains PRT-001')
    expect(Object.values(doc.relationships).filter((r) => r.category === 'stakeholder').length).toBe(TEAM_FIXTURE.relationships.length)
  })

  it('an edit in the tool becomes operations; a new row takes the next project ID', () => {
    let doc = emptyProject({ teamLabel: '07', initials: 'JS' })
    const r0 = toTeamRecord(doc)
    const id = nextId(r0, 'STK')
    expect(id).toBe('STK-001')
    doc = edit(doc, { stakeholders: [{ id, name: 'County health department', role: 'authority', stage: 'Operation', side: 'external', approving: 'yes', concerns: [{ id: 'CON-001', text: 'Inspections of cold storage happen every 90 days' }], influence: '4', reason: 'Can close a site' }], issued: { ...r0.issued, STK: 1, CON: 1 } })
    const r1 = toTeamRecord(doc)
    expect(r1.stakeholders[0].name).toBe('County health department')
    expect(r1.stakeholders[0].concerns[0].id).toBe('CON-001')
    doc = edit(doc, { stakeholders: [{ ...r1.stakeholders[0], name: 'County health dept.' }] })
    expect(toTeamRecord(doc).stakeholders[0].name).toBe('County health dept.')
  })

  it('P1-T4: a removed stakeholder is retired, its ID never reused; the next one is STK-00(n+1)', () => {
    let doc = fromTeamRecord(TEAM_FIXTURE).doc
    const r = toTeamRecord(doc)
    doc = edit(doc, { stakeholders: r.stakeholders.filter((s) => s.id !== 'STK-003') })
    const stk3 = Object.values(doc.artifacts).find((a) => a.id === 'STK-003')!
    expect(stk3.status).toBe('retired')
    const r2 = toTeamRecord(doc)
    expect(r2.stakeholders.some((s) => s.id === 'STK-003')).toBe(false)
    const next = nextId(r2, 'STK')
    expect(next).toBe(`STK-00${TEAM_FIXTURE.stakeholders.length + 1}`)
    // relationships to the retired stakeholder turn suspect, none is removed (I8, I13)
    const touching = Object.values(doc.relationships).filter((x) => x.from === stk3.uid || x.to === stk3.uid)
    expect(touching.length).toBeGreaterThan(0)
    expect(touching.every((x) => x.status !== 'active')).toBe(true)
  })

  it('reads week1-model-inputs v3 (and the legacy importer’s v1/v2 output) into a project', () => {
    const rec = importModelInputs(JSON.stringify(teamModelInputs(TEAM_FIXTURE)))
    if ('error' in rec) throw new Error(rec.error)
    const { doc } = fromTeamRecord(rec)
    expect(toTeamRecord(doc).needs.length).toBe(TEAM_FIXTURE.needs.length)
    const v1 = importModelInputs(JSON.stringify({ format: 'week1-model-inputs', version: 1, team: '07', enterprise: { name: 'Riverside Food Bank Network' }, stakeholders: [{ id: 'STK-001', name: 'Pantry managers' }], concerns: [{ id: 'CON-001', stakeholder: 'STK-001', text: 'Shelves run empty by Thursday each week' }], needs: [] }))
    if ('error' in v1) throw new Error(v1.error)
    expect(toTeamRecord(fromTeamRecord(v1).doc).stakeholders[0].concerns[0].text).toBe('Shelves run empty by Thursday each week')
    const v2 = importModelInputs(JSON.stringify({ format: 'week1-model-inputs', version: 2, team: '07', enterprise: { name: 'X' }, stakeholders: [{ id: 'STK-002', name: 'Drivers' }], concerns: [{ id: 'CON-004', stakeholders: ['STK-002'], text: 'Routes take longer than four hours' }] }))
    if ('error' in v2) throw new Error(v2.error)
    expect(toTeamRecord(fromTeamRecord(v2).doc).stakeholders[0].id).toBe('STK-002')
  })

  it('a stored record with duplicate or malformed IDs is renumbered, never dropped', () => {
    const bad = normalizeTeam({ ...TEAM_FIXTURE, context: [...TEAM_FIXTURE.context, { ...TEAM_FIXTURE.context[0] }, { ...TEAM_FIXTURE.context[1], id: '' }] })
    const { doc, renumbered } = fromTeamRecord(bad)
    expect(renumbered.length).toBe(2)
    expect(toTeamRecord(doc).context.length).toBe(TEAM_FIXTURE.context.length + 2)
  })

  it('a need source typed before the stakeholder exists is kept as an unresolved reference', () => {
    let doc = emptyProject()
    const r = toTeamRecord(doc)
    doc = edit(doc, { needs: [{ id: 'NEED-001', name: 'n', text: 't', conditions: '', rationale: '', sources: 'STK-009', concerns: '', goal: 'MGO-001', priority: '', selfCheck: {}, justification: '' }], issued: { ...r.issued, NEED: 1 } })
    const need = Object.values(doc.artifacts).find((a) => a.id === 'NEED-001')!
    expect(need.unresolvedRefs).toEqual(['STK-009'])
  })
})
