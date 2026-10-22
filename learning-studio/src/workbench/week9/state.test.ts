// Week 9 lab tool state, both directions: a complete fixture state is ready to submit, and each readiness item fails on
// its own, with the reason the student reads (missing file, another team's file, a system requirement without a
// subject, a doc-only system requirement, a TBD without an owner, an empty or "fixed" disposition, no shared
// definition and no reason, too few AI findings, a stale export). AI finding IDs are never reused, across a deletion and
// a workspace round trip; a stored state is normalized without throwing; the trace-matrix file carries the matrix, the
// grid, the mapping table and the course-acceptance statement. Uses the fictional food bank fixture, never AeroLink.
import { describe, expect, it } from 'vitest'
import { fixtureModel } from '../week8/generated'
import { FIXTURE_CHOICES, FIXTURE_WEEK1_JSON, FIXTURE_WEEK2_JSON } from './generated'
import { EMPTY_CHOICE, findingKey, needsDisposition, phase1FromWeek1, phase1FromWeek2, readWeek1, readWeek2For9 } from './requirements'
import { EMPTY_STATE, aiProblem, derive, importWorkspace, matrixMarkdown, nextAiId, normalizeState, readiness, workspaceJson, type AiFinding, type W9State } from './state'

function fixtureState(): W9State {
  const w1 = readWeek1(FIXTURE_WEEK1_JSON)
  const w2 = readWeek2For9(FIXTURE_WEEK2_JSON)
  if ('error' in w1 || 'error' in w2) throw new Error('fixture must import')
  const p2 = phase1FromWeek2(w2.record)
  const s: W9State = {
    ...EMPTY_STATE,
    w8: { text: fixtureModel().model.text, origin: 'team-07-model-v01.sysml' },
    w1: { ...phase1FromWeek1(w1.record), origin: 'team-07 Week 1' },
    w2: { team: p2.team, enterprise: p2.enterprise, requirements: p2.requirements, needsAdded: p2.needsAdded, dispositions: p2.dispositions, origin: 'team-07 Week 2' },
    choices: FIXTURE_CHOICES,
    auditNote: 'The one-driver shift assumption reflects the pantry’s current staffing.',
  }
  const d = derive(s)!
  // dispositions for every finding that needs one and has none carried from Week 2
  for (const f of d.findings.filter(needsDisposition)) if (!s.w2!.dispositions[f.id] || f.cls !== 'trace') s.dispositions[findingKey(f)] = `Open item: JS settles ${f.id} in Week 10`
  s.ai = Array.from({ length: 8 }, (_, i): AiFinding => ({ id: `AIF-${String(i + 1).padStart(3, '0')}`, requirement: 'REQ-STK-001', category: 'ambiguity', quote: 'until closing', decision: i % 2 ? 'reject' : 'accept', reason: 'Closing time is defined by each pantry', change: i % 2 ? '' : 'Doc reworded' }))
  s.aiIssued = 8
  s.updatedAt = 1
  s.exportedSysmlAt = 2
  s.exportedMdAt = 2
  return s
}
const item = (s: W9State, id: string) => readiness(s).items.find((i) => i.id === id)!

describe('Week 9 readiness', () => {
  it('the complete fixture state is ready to submit', () => {
    const r = readiness(fixtureState())
    expect(r.items.filter((i) => !i.ok).map((i) => `${i.id}: ${i.detail}`)).toEqual([])
    expect(r.ready).toBe(true)
  })
  it('nothing imported: three files to import, each with what to do', () => {
    const r = readiness(EMPTY_STATE)
    expect(r.ready).toBe(false)
    expect(r.items.map((i) => i.id)).toEqual(['week8', 'week1', 'week2', 'match'])
    expect(item(EMPTY_STATE, 'week8').detail).toMatch(/model v0.1 file \(\.sysml\)/)
  })
  it('another team’s Week 2 file is reported as a mismatch', () => {
    const s = fixtureState()
    s.w2 = { ...s.w2!, team: '12' }
    expect(item(s, 'match')).toMatchObject({ ok: false, detail: expect.stringMatching(/team 07 and the Week 2 file from team 12/) })
  })
  it('a system requirement without a subject, and one without a constraint, each fail with the IDs named', () => {
    const s = fixtureState()
    s.choices = { ...s.choices, 'REQ-SYS-004': { ...EMPTY_CHOICE } }
    expect(item(s, 'subjects')).toMatchObject({ ok: false, detail: expect.stringMatching(/REQ-SYS-004/) })
    expect(item(s, 'constraints')).toMatchObject({ ok: false, detail: expect.stringMatching(/Formalize REQ-SYS-004/) })
  })
  it('an empty disposition and a claimed fix both leave the dispositions item open', () => {
    const s = fixtureState()
    const f = derive(s)!.findings.find((x) => x.code === 'childless-need')!
    s.dispositions[findingKey(f)] = 'n/a'
    expect(item(s, 'dispositions').ok).toBe(false)
    s.dispositions[findingKey(f)] = 'Fixed in the Week 2 record'
    expect(item(s, 'dispositions').ok).toBe(false)
    s.dispositions[findingKey(f)] = 'Open item: Week 10 (JS)'
    expect(item(s, 'dispositions').ok).toBe(true)
  })
  it('no shared definition and no reason fails; a one-line reason passes', () => {
    const s = fixtureState()
    s.choices = { ...s.choices, 'REQ-SYS-001': { ...s.choices['REQ-SYS-001'], form: 'direct' } }
    const f = derive(s)!.findings.find((x) => x.code === 'shared-single')!
    s.dispositions[findingKey(f)] = 'Only one duration requirement on a function'
    expect(item(s, 'shared').ok).toBe(false)
    s.sharedReason = 'No two requirements share a quantity and comparison'
    expect(item(s, 'shared').ok).toBe(true)
  })
  it('too few complete AI findings fails, and each incomplete one says what is missing', () => {
    const s = fixtureState()
    s.ai[0] = { ...s.ai[0], reason: 'none' }
    expect(item(s, 'ai')).toMatchObject({ ok: false, detail: '7 of 8 complete.' })
    expect(aiProblem(s.ai[0])).toMatch(/reason/)
    expect(aiProblem({ ...s.ai[0], reason: 'ok', category: 'style' })).toMatch(/four categories/)
    expect(aiProblem({ ...s.ai[0], reason: 'Clear enough', decision: 'accept', change: '' })).toMatch(/what you changed/)
    expect(aiProblem({ ...s.ai[1], reason: 'Pantries agree', decision: 'reject' })).toBeNull()
    // multi-token empty answers are not a reason, a quote or a change (shared saidSomething)
    for (const v of ['none none', 'n/a todo', 'tbd, later']) {
      expect(aiProblem({ ...s.ai[1], reason: v, decision: 'reject' }), v).toMatch(/reason/)
      expect(aiProblem({ ...s.ai[1], quote: v, reason: 'Pantries agree', decision: 'reject' }), v).toMatch(/Quote/)
      expect(aiProblem({ ...s.ai[1], reason: 'Pantries agree', decision: 'accept', change: v }), v).toMatch(/what you changed/)
    }
  })
  it('a TBD without an owner is listed; the owner typed in the tool closes it', () => {
    const s = fixtureState()
    s.w2 = { ...s.w2!, requirements: s.w2!.requirements.map((q) => (q.id === 'REQ-STK-004' ? { ...q, tbdOwner: '' } : q)) }
    expect(item(s, 'owners')).toMatchObject({ ok: false, detail: expect.stringMatching(/REQ-STK-004/) })
    s.choices = { ...s.choices, 'REQ-STK-004': { ...s.choices['REQ-STK-004'], owner: 'RM' } }
    expect(item(s, 'owners').ok).toBe(true)
  })
  it('a change after the last export leaves the exports item open', () => {
    const s = fixtureState()
    s.updatedAt = 3
    expect(item(s, 'exports').ok).toBe(false)
  })
})

describe('Week 9 state files', () => {
  it('AI finding IDs are never reused, after a deletion or a workspace round trip', () => {
    const s = fixtureState()
    s.ai = s.ai.slice(0, 7)
    expect(nextAiId(s)).toBe('AIF-009')
    const back = importWorkspace(workspaceJson(s))
    if ('error' in back) throw new Error(back.error)
    expect(nextAiId(back)).toBe('AIF-009')
    expect(nextAiId(normalizeState({ ai: [{ id: 'AIF-012', requirement: 'x' }] }))).toBe('AIF-013')
  })
  it('a stored state is normalized without throwing; a wrong workspace file is refused with a reason', () => {
    expect(() => normalizeState('garbage')).not.toThrow()
    expect(normalizeState({ choices: { 'REQ-SYS-001': { subject: 'wrong', op: '!=' } } }).choices['REQ-SYS-001']).toMatchObject({ subject: '', op: '<=' })
    expect(importWorkspace('{"format":"week8-import","version":1}')).toEqual({ error: expect.stringMatching(/not a Week 9 workspace/) })
    expect(importWorkspace('{"format":"week9-requirements","version":2,"state":{}}')).toEqual({ error: expect.stringMatching(/version 2/) })
  })
  it('the trace-matrix file carries the matrix, the grid, the mapping table, the audit and the course-acceptance statement', () => {
    const md = matrixMarkdown(fixtureState(), '2026-10-21')
    expect(md).toContain('# team-07: needs-to-requirements trace matrix and trace audit (Week 9)')
    expect(md).toContain('| NEED-001 | Produce until closing |')
    expect(md).toContain('### Grid (needs × stakeholder requirements; X = derivation in the model)')
    expect(md).toContain('| REQ-SYS-003 | system | Delivery vans and volunteer drivers |')
    expect(md).toContain('## AI review log')
    expect(md).toMatch(/Course acceptance checks only/)
    expect(matrixMarkdown(EMPTY_STATE)).toMatch(/Not ready/)
  })
})

// Review N1: a need the Week 2 audit recorded as only partly covered is carried as an open item and reads "partial",
// never "covered", in the tool and the exported matrix; the trace-audit note is exported under its own heading.
describe('Week 9 partly covered needs and the trace-audit note', () => {
  const covered = () => derive(fixtureState())!.rows.find((r) => r.status === 'covered')!.need
  it('a marked need reads partial in the matrix file, with its open item; an unmarked one stays covered', () => {
    const s = fixtureState()
    const need = covered()
    s.partials = { [need]: { missing: 'Weekend deliveries', owner: 'JS', week: 'Week 10' } }
    s.auditNote = 'The still-roads assumption bounds REQ-SYS-002 because winter routes differ.'
    expect(derive(s)!.rows.find((r) => r.need === need)!.status).toBe('partial')
    const md = matrixMarkdown(s, '2026-10-22')
    const row = md.split('\n').find((l) => l.startsWith(`| ${need} |`))!
    expect(row).toMatch(/\| partial \|$/)
    expect(row).not.toMatch(/\| covered \|$/)
    expect(md).toContain(`| ${need} | Weekend deliveries | JS | Week 10 |`)
    expect(md).toContain('### Trace-audit note\n\nThe still-roads assumption')
    expect(item(s, 'partials').ok).toBe(true)
    expect(matrixMarkdown(fixtureState(), '2026-10-22').split('\n').find((l) => l.startsWith(`| ${need} |`))).toMatch(/\| covered \|$/)
  })
  it('an incomplete open item (empty, or a multi-word empty answer) keeps the readiness item open with the reason', () => {
    const s = fixtureState()
    const need = covered()
    s.partials = { [need]: { missing: 'Weekend deliveries', owner: 'n/a n/a', week: '' } }
    expect(item(s, 'partials')).toMatchObject({ ok: false, detail: expect.stringContaining(need) })
    expect(readiness(s).ready).toBe(false)
  })
  it('an assumption needs a trace-audit note that says something; without assumptions the note is not required', () => {
    const s = fixtureState()
    const assumed = Object.entries(s.choices).filter(([, c]) => c.assume.trim()).map(([k]) => k)
    expect(assumed.length).toBeGreaterThan(0)
    for (const note of ['', 'n/a', 'none todo']) {
      s.auditNote = note
      expect(item(s, 'note')).toMatchObject({ ok: false, detail: expect.stringContaining(assumed[0]) })
      expect(item(s, 'note').detail).toMatch(/justify each assumption in one sentence/)
      expect(readiness(s).ready).toBe(false)
    }
    s.auditNote = 'Staffing is one driver.'
    expect(item(s, 'note').ok).toBe(true)
    expect(readiness(s).ready).toBe(true)
    const t = fixtureState()
    t.auditNote = ''
    t.choices = Object.fromEntries(Object.entries(t.choices).map(([k, c]) => [k, { ...c, assume: '' }]))
    expect(item(t, 'note')).toMatchObject({ ok: true, detail: expect.stringMatching(/optional/) })
    expect(readiness(t).ready).toBe(true)
  })
  it('partials and the note survive normalization; junk keys are dropped', () => {
    const s = normalizeState({ partials: { 'NEED-004': { missing: 'x', owner: 'y', week: 'z' }, junk: {} }, auditNote: 'note' })
    expect(s.partials).toEqual({ 'NEED-004': { missing: 'x', owner: 'y', week: 'z' } })
    expect(s.auditNote).toBe('note')
  })
})
