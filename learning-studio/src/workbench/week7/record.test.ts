// Week 7 package record: the six exports load with their own importers and anything else is refused (AeroLink, wrong
// format, invalid JSON, a package in the source input, a text version); the audit finds what a mutated export breaks
// (stale, dangling, renamed, stale dispositions, unallocated once the interface is cleared) and only that; carried
// dispositions are pre-filled; dispositions survive a re-import; coverage is computed from the exports; every gate
// accepts a short valid answer and rejects an answer that says nothing; the states follow the entry and exit criteria; the
// package JSON round-trips through the teammate import; the Markdown carries the readiness report. Each rule is shown
// able to fail. Uses the fictional food bank fixture, never AeroLink.
import { describe, expect, it } from 'vitest'
import { SOURCE_JSONS, week7Fixture } from './fixture'
import {
  EMPTY_RECORD, EMPTY_SUMMARY, allChecks, assessFinding, assessPrep, assessRid, assessSummary, dispositionOf, idsIn, importPackage, loadSource, nextRid, normalizePackage, packageJson, packageMarkdown, packageOf, packageState, threadOf, withSource,
  type Rid, type Week7Record,
} from './record'

type Json = Record<string, unknown> & { [k: string]: any } // eslint-disable-line @typescript-eslint/no-explicit-any
const raw = (w: 1 | 2 | 3 | 4 | 5 | 6): Json => JSON.parse(SOURCE_JSONS[w])
const withWeek = (r: Week7Record, w: 1 | 2 | 3 | 4 | 5 | 6, d: Json): Week7Record => ({ ...r, sources: { ...r.sources, [w]: JSON.stringify(d) } })
const keys = (r: Week7Record) => packageOf(r).findings.map((f) => f.key)
const EMPTY = ['n/a', 'none', '?', '-', 'later', 'TBD']
const gate = (a: { gates: { id: string; ok: boolean }[] }, id: string) => a.gates.find((g) => g.id === id)?.ok

describe('Week 7 sources', () => {
  it('all six fixture exports load with their own importers, each judged ready by its week', () => {
    for (const w of [1, 2, 3, 4, 5, 6] as const) {
      const l = loadSource(SOURCE_JSONS[w])
      expect('error' in l ? l.error : l.week, `week ${w}`).toBe(w)
      if (!('error' in l)) expect(l.status).toBe('ready')
    }
    expect(allChecks(week7Fixture()).sources.ok).toBe(true)
  })
  it('refuses invalid JSON, no format, an unknown format, a package file, a text version and AeroLink, each with a message', () => {
    expect(loadSource('{oops')).toEqual({ error: expect.stringMatching(/not valid JSON/) })
    expect(loadSource('{}')).toEqual({ error: expect.stringMatching(/no “format”/) })
    expect(loadSource('{"format":"week9-model-inputs","version":1}')).toEqual({ error: expect.stringMatching(/Week 1–6 model-inputs/) })
    expect(loadSource(JSON.stringify(packageJson(week7Fixture())))).toEqual({ error: expect.stringMatching(/teammate’s Week 7 package/) })
    expect(loadSource(JSON.stringify({ ...raw(2), version: '1' }))).toEqual({ error: expect.stringMatching(/version as text/) })
    const aero = raw(1)
    aero.enterprise.name = 'AeroLink Urban Mobility'
    expect(loadSource(JSON.stringify(aero))).toEqual({ error: expect.stringMatching(/AeroLink/) })
    const aero6 = raw(6)
    aero6.week5.enterprise = 'AeroLink'
    expect(loadSource(JSON.stringify(aero6))).toEqual({ error: expect.stringMatching(/AeroLink/) })
  })
  it('a week added again replaces only that week; a missing week fails the all-weeks gate', () => {
    const x = withSource(EMPTY_RECORD, SOURCE_JSONS[3])
    expect('error' in x).toBe(false)
    if ('error' in x) return
    expect(Object.keys(x.record.sources)).toEqual(['3'])
    const r = { ...week7Fixture(), sources: { ...week7Fixture().sources, 4: undefined } }
    expect(allChecks(normalizePackage(r)).sources.issues.join(' ')).toMatch(/missing Week 4/)
    expect(packageState(normalizePackage(r))).toBe('not-ready')
  })
  it('two enterprises fail the one-enterprise gate and produce a finding', () => {
    const d = raw(6)
    d.week5.enterprise = 'Lakeside Pantry'
    const r = withWeek(week7Fixture(), 6, d)
    expect(keys(r)).toContain('enterprise')
    expect(allChecks(r).sources.ok).toBe(false)
  })
})

describe('Week 7 audit', () => {
  const fx = week7Fixture()
  const pkg = packageOf(fx)
  it('the fixture’s findings are the ones its exports hold, with carried and open-item pre-fills', () => {
    const k = keys(fx)
    // the old Week 4/5 exports number externals from EXT-001: a COLLISION per ID with Week 1's context EXT IDs, never a
    // rename (review M3); the Week 6 fixture's opportunity now continues after Week 3's O-001, so no O collision
    expect(k.filter((x) => x.startsWith('collision:'))).toEqual(['collision:EXT-001', 'collision:EXT-002', 'collision:EXT-003', 'collision:EXT-004', 'collision:EXT-005'])
    expect(k.some((x) => x.startsWith('renamed:'))).toBe(false)
    expect(k).toContain('stale-disposition:REQ-STK-001')
    // a Week 2 disposition that deferred the gap and was never carried is a dropped open item (review M1), pre-filled as a deferral
    expect(k.filter((x) => /^(childless-need|dropped-open-item):/.test(x))).toEqual(['dropped-open-item:NEED-003', 'childless-need:NEED-007', 'dropped-open-item:NEED-008'])
    const dn = pkg.findings.find((f) => f.key === 'dropped-open-item:NEED-003')!
    expect(dn.prefill).toMatchObject({ disposition: 'defer', carried: true })
    const cn = pkg.findings.find((f) => f.key === 'childless-need:NEED-007')!
    expect(cn.prefill).toMatchObject({ disposition: 'record', carried: true })
    expect(assessFinding(cn.prefill!).advisories.map((a) => a.id)).toContain('carried')
    // the carried Week 2 reason cites no evidence, so the team must restate it (it is not accepted as is)
    expect(assessFinding(cn.prefill!).counts).toBe(false)
    expect(dispositionOf(fx, cn).carried).toBe(false)
    // one open-item finding per item ID of the Week 6 review row (review m9)
    const oi = pkg.findings.find((f) => f.key === 'open-item:4:IF-008')!
    expect(oi.prefill).toMatchObject({ disposition: 'defer', owner: 'TL' })
    // the index keeps both definitions of a collided ID (review M3)
    expect(pkg.index.get('EXT-001')!.others!.map((o) => o.week)).toContain(4)
    expect(packageJson(fx).index.filter((e) => e.id === 'EXT-001').length).toBeGreaterThan(1)
  })
  it('coverage is computed from the exports (needs with a stakeholder requirement as a child)', () => {
    const w2 = raw(2)
    const needs = [...w2.week1.needs, ...w2.needsAdded].map((n: Json) => n.id)
    const covered = needs.filter((n: string) => w2.requirements.some((q: Json) => q.id.startsWith('REQ-STK-') && q.parents.includes(n)))
    const c = pkg.coverage.find((x) => x.id === 'need-req')!
    expect([c.covered, c.total]).toEqual([covered.length, needs.length])
    expect(c.uncovered).toEqual(['NEED-003', 'NEED-007', 'NEED-008'])
    expect(pkg.coverage.find((x) => x.id === 'sys-arch')!.pct).toBe(100)
  })
  it('a later export built from an older one is stale; an ID it carries that the owner dropped is dangling; a renamed ID is found', () => {
    const d = raw(3)
    d.week2.needs = d.week2.needs.filter((n: Json) => n.id !== 'NEED-001')
    expect(keys(withWeek(fx, 3, d))).toContain('stale:3:1:NEED')
    const e = raw(3)
    e.week2.needs.push({ id: 'NEED-099', name: 'Dropped need' })
    expect(keys(withWeek(fx, 3, e))).toContain('dangling:3:NEED')
    // the same element in an older wording (one name contains the other) is drift: 'renamed'
    const f = raw(2)
    f.week1.needs[0].name = `${f.week1.needs[0].name} (draft)`
    const found = packageOf(withWeek(fx, 2, f)).findings.find((x) => x.key === 'renamed:2:NEED')
    expect(found?.ids).toEqual([f.week1.needs[0].id])
    // a different element under the same ID is a collision, never a rename (review M3)
    const g = raw(2)
    g.week1.needs[0].name = 'Something else entirely'
    expect(keys(withWeek(fx, 2, g))).toContain(`collision:${g.week1.needs[0].id}`)
    expect(keys(withWeek(fx, 2, g))).not.toContain('renamed:2:NEED')
    expect(keys(fx).some((x) => /^(stale|dangling|renamed):/.test(x))).toBe(false)
  })
  it('a Week 2 disposition for a gap a later week closed is a stale disposition; one still open is carried instead', () => {
    const w2 = raw(2)
    expect(Object.keys(w2.dispositions)).toContain('REQ-STK-001')
    const sd = pkg.findings.find((x) => x.key === 'stale-disposition:REQ-STK-001')!
    expect(sd.prefill).toBeUndefined()
    expect(keys(fx)).not.toContain('childless-stk:REQ-STK-001')
  })
  it('a Week 5 requirement carried by an interface is allocated; clearing its interface makes it unallocated', () => {
    expect(keys(fx)).not.toContain('unallocated:REQ-SYS-007')
    const d = raw(5)
    d.requirements = d.requirements.map((q: Json) => (q.id === 'REQ-SYS-007' ? { ...q, interface: '' } : q))
    expect(keys(withWeek(fx, 5, d))).toContain('unallocated:REQ-SYS-007')
  })
  it('an open item and an increment serving an unknown ID are found', () => {
    const d = raw(6)
    d.increments[1].serves = [...d.increments[1].serves, 'CAP-099']
    expect(keys(withWeek(fx, 6, d))).toContain(`increment-unresolved:${d.increments[1].id}`)
  })
  it('dispositions survive a re-import (stable keys): the same export re-saved keeps the record review-closed', () => {
    const r = withWeek(fx, 6, raw(6))
    expect(r.sources[6]).not.toBe(undefined)
    expect(packageState(r)).toBe('review-closed')
    expect(keys(r)).toEqual(keys(fx))
  })
})

describe('Week 7 gates: short valid answers count, empty answers never do', () => {
  it('finding: a short rationale with its evidence counts; a defer needs an owner and a week; empty answers fail', () => {
    expect(assessFinding({ disposition: 'record', reason: 'Duplicate of REQ-STK-004', owner: '' }).counts).toBe(true)
    expect(assessFinding({ disposition: 'record', reason: 'Recorded in the Week 2 record', owner: '' }).counts).toBe(true)
    expect(assessFinding({ disposition: 'defer', reason: 'Open', owner: 'TL', week: '9' }).counts).toBe(true)
    for (const e of EMPTY) {
      expect(gate(assessFinding({ disposition: 'record', reason: e, owner: '' }), 'reason'), e).toBe(false)
      expect(gate(assessFinding({ disposition: 'defer', reason: 'Open', owner: e, week: '9' }), 'owner'), e).toBe(false)
    }
    expect(assessFinding({ disposition: '', reason: 'Duplicate of REQ-STK-004', owner: '' }).counts).toBe(false)
    expect(assessFinding({ disposition: 'defer', reason: 'Open', owner: '', week: '9' }).counts).toBe(false)
    expect(gate(assessFinding({ disposition: 'defer', reason: 'Open', owner: 'TL', week: '' }), 'week')).toBe(false)
    expect(gate(assessFinding({ disposition: 'defer', reason: 'Open', owner: 'TL', week: '6' }), 'week')).toBe(false)
    // an accepted finding needs evidence: an ID in the package or the week whose record holds it
    expect(gate(assessFinding({ disposition: 'record', reason: 'Duplicate', owner: '' }), 'evidence')).toBe(false)
    expect(gate(assessFinding({ disposition: 'record', reason: 'Duplicate of REQ-STK-999', owner: '' }, { has: (id) => id !== 'REQ-STK-999' }), 'evidence')).toBe(false)
  })
  it('finding: a bare completion claim is never a rationale (review M2), in either disposition', () => {
    for (const claim of ['Fixed', 'Fixed in Week 4', 'Withdrawn', 'Resolved', 'Done', 'Corrected', 'Closed', 'Addressed in Week 5'])
      for (const disposition of ['record', 'defer'] as const) expect(gate(assessFinding({ disposition, reason: claim, owner: 'TL', week: '9' }), 'reason'), `${disposition} ${claim}`).toBe(false)
    // review N2: deferral phrasing that names a Phase II week is a plan, not a claim
    for (const plan of ['To be closed in Week 10', 'Will be addressed in Week 9', 'Closes with the Week 8 model', 'Resolved once the Week 11 physical model is built'])
      expect(gate(assessFinding({ disposition: 'defer', reason: plan, owner: 'TL', week: '10' }), 'reason'), plan).toBe(true)
    // a true rationale that cites evidence passes
    expect(assessFinding({ disposition: 'record', reason: 'Kept as history: superseded by REQ-SYS-003 (Week 4 record)', owner: '' }).counts).toBe(true)
  })
  it('finding: a collision cannot be accepted, only deferred with an owner and a week (review M3)', () => {
    expect(gate(assessFinding({ disposition: 'record', reason: 'Same element, shortened name (Week 1 record)', owner: '' }, { kind: 'collision' }), 'disposition')).toBe(false)
    expect(assessFinding({ disposition: 'defer', reason: 'Renumber with the Week 8 model', owner: 'TL', week: '8' }, { kind: 'collision' }).counts).toBe(true)
  })
  it('finding advisories: a carried reason naming a past week, and an owner that is only a week', () => {
    expect(assessFinding({ disposition: 'defer', reason: 'Planned for Week 3', owner: 'TL', week: '9', carried: true }).advisories.map((a) => a.id)).toContain('past-week')
    expect(assessFinding({ disposition: 'defer', reason: 'Open', owner: 'Week 10', week: '10' }).advisories.map((a) => a.id)).toContain('week-owner')
  })
  it('summary: an existing ID, an R ID and an INC after the baseline are required; short text counts', () => {
    const fx = week7Fixture()
    const pkg = packageOf(fx)
    expect(assessSummary(fx.summary, pkg).counts).toBe(true)
    expect(gate(assessSummary({ ...fx.summary, residual: 'R-002' }, pkg), 'residual')).toBe(true)
    expect(gate(assessSummary({ ...fx.summary, residual: 'R-999' }, pkg), 'residual')).toBe(false)
    expect(gate(assessSummary({ ...fx.summary, evidence: 'it works' }, pkg), 'evidence')).toBe(false)
    const base = pkg.by[6]!.increments.find((x) => x.baseline)!.id
    expect(gate(assessSummary({ ...fx.summary, next: base }, pkg), 'next')).toBe(false)
    expect(gate(assessSummary({ ...fx.summary, decisions: 'Approve' }, pkg), 'decisions')).toBe(true)
    for (const e of EMPTY) for (const k of ['recommendation', 'conditions', 'decisions'] as const) expect(gate(assessSummary({ ...fx.summary, [k]: e }, pkg), k), `${k} ${e}`).toBe(false)
    expect(assessSummary(EMPTY_SUMMARY, pkg).counts).toBe(false)
  })
  it('review preparation: initials as owners count; an empty owner, no decision or a thread short of the architecture fails', () => {
    const fx = week7Fixture()
    const pkg = packageOf(fx)
    expect(assessPrep(fx, pkg).counts).toBe(true)
    for (const e of EMPTY) expect(gate(assessPrep({ ...fx, owners: { ...fx.owners, roadmap: e } }, pkg), 'owners'), e).toBe(false)
    expect(gate(assessPrep({ ...fx, decision: 'DEC-999' }, pkg), 'decision')).toBe(false)
    // NEED-003 is childless in the fixture: its thread stops before a system requirement
    expect(gate(assessPrep({ ...fx, threadNeed: 'NEED-003' }, pkg), 'thread')).toBe(false)
  })
  it('the thread follows the package’s links from the need to an interface', () => {
    const fx = week7Fixture()
    const t = threadOf(packageOf(fx), fx.threadNeed)
    expect(t.reachesSys && t.reachesArch && t.reachesInterface).toBe(true)
    expect(t.hops.map((h) => h.layer)).toEqual(['Need', 'Capability', 'Stakeholder requirement', 'System requirement', 'Architecture (functions and elements)', 'Interface', 'Roadmap (gaps and increments)'])
  })
  it('RID: a section title or an ID locates it; a reject needs evidence; accept and defer need an owner; empty answers fail', () => {
    const pkg = packageOf(week7Fixture())
    const ok: Rid = { id: 'RID-009', from: 'Team 2', location: 'REQ-STK-004', finding: 'No criterion.', criterion: 'Verification criterion', severity: 'major', disposition: 'accept', response: 'Added.', owner: 'TL' }
    expect(assessRid(ok, pkg).counts).toBe(true)
    expect(gate(assessRid({ ...ok, location: 'executive summary, paragraph 2' }, pkg), 'location')).toBe(true)
    expect(gate(assessRid({ ...ok, location: 'somewhere' }, pkg), 'location')).toBe(false)
    expect(gate(assessRid({ ...ok, disposition: 'reject', response: 'No' }, pkg), 'response')).toBe(false)
    expect(gate(assessRid({ ...ok, disposition: 'reject', response: 'R-002' }, pkg), 'response')).toBe(true)
    expect(assessRid({ ...ok, disposition: 'reject', response: 'Out of scope for Phase I' }, pkg).advisories.map((a) => a.id)).toEqual(['reject-no-id'])
    for (const e of EMPTY) {
      expect(gate(assessRid({ ...ok, finding: e }, pkg), 'finding'), e).toBe(false)
      expect(gate(assessRid({ ...ok, criterion: e }, pkg), 'criterion'), e).toBe(false)
      expect(gate(assessRid({ ...ok, response: e }, pkg), 'response'), e).toBe(false)
      expect(gate(assessRid({ ...ok, owner: e }, pkg), 'owner'), e).toBe(false)
    }
    expect(assessRid({ ...ok, disposition: 'reject', response: 'R-002', owner: '' }, pkg).counts).toBe(true)
  })
})

describe('Week 7 states and exports', () => {
  it('the fixture is review-closed; without RIDs it is ready for review; an undispositioned finding makes it not ready', () => {
    const fx = week7Fixture()
    expect(packageState(fx)).toBe('review-closed')
    expect(packageState({ ...fx, rids: [] })).toBe('ready-for-review')
    const open = packageOf(fx).findings.find((f) => !f.prefill)!
    expect(packageState({ ...fx, dispositions: { ...fx.dispositions, [open.key]: { disposition: 'record', reason: 'n/a', owner: '', week: '' } } })).toBe('not-ready')
    // the review's M2 probe: recording a still-found finding as "Withdrawn" no longer closes the package
    expect(packageState({ ...fx, dispositions: { ...fx.dispositions, 'stale-disposition:REQ-STK-001': { disposition: 'record', reason: 'Withdrawn', owner: '', week: '' } } })).toBe('not-ready')
    expect(packageState({ ...fx, aiStatement: 'Used AI.' })).toBe('not-ready')
    expect(packageState({ ...fx, lessons: 'none' })).toBe('not-ready')
  })
  it('the package JSON carries the sources verbatim and round-trips through the teammate import', () => {
    const fx = week7Fixture()
    const j = packageJson(fx)
    expect(j.format).toBe('week7-package')
    expect(j.version).toBe(1)
    expect(j.sources.week1).toEqual(raw(1))
    expect(j.findings.every((f) => f.disposition)).toBe(true)
    const back = importPackage(JSON.stringify(j))
    expect('error' in back).toBe(false)
    if ('error' in back) return
    expect(packageState(back)).toBe('review-closed')
    expect(keys(back)).toEqual(keys(fx))
    // the RID counter travels with the package: a deleted RID number is never reused after a share (review m8)
    const shrunk = { ...fx, rids: fx.rids.slice(0, 1) }
    const back2 = importPackage(JSON.stringify(packageJson(shrunk)))
    if ('error' in back2) throw new Error(back2.error)
    expect(nextRid(back2)).toBe(`RID-${String(fx.issued.RID + 1).padStart(3, '0')}`)
  })
  it('the teammate import refuses a weekly export, a wrong format or version, AeroLink and duplicate RIDs', () => {
    const j = packageJson(week7Fixture())
    expect(importPackage(SOURCE_JSONS[2])).toEqual({ error: expect.stringMatching(/Week 2 export/) })
    expect(importPackage(JSON.stringify({ ...j, version: '1' }))).toEqual({ error: expect.stringMatching(/version as text/) })
    expect(importPackage(JSON.stringify({ ...j, version: 2 }))).toEqual({ error: expect.stringMatching(/version 2/) })
    expect(importPackage(JSON.stringify({ ...j, enterprise: 'AeroLink Urban Mobility' }))).toEqual({ error: expect.stringMatching(/AeroLink/) })
    expect(importPackage(JSON.stringify({ ...j, rids: [j.rids[0], j.rids[0]] }))).toEqual({ error: expect.stringMatching(/Duplicate ID RID-001/) })
    expect(importPackage('[1]')).toEqual({ error: expect.stringMatching(/not a Week 7 package/) })
  })
  it('the Markdown carries the readiness report, the index, the coverage, every finding and the RIDs', () => {
    const fx = week7Fixture()
    const md = packageMarkdown(fx, '2026-11-02')
    expect(md).toMatch(/## Readiness report/)
    expect(md).toMatch(/status: \*\*review closed/)
    expect(md).toMatch(/## Package index/)
    for (const f of packageOf(fx).findings) expect(md).toContain(f.key)
    expect(md).toContain('RID-002')
    expect(packageMarkdown({ ...fx, rids: [] })).toMatch(/ready for review/)
  })
  it('normalize never throws, RID IDs are never reused, idsIn reads IDs case-insensitively', () => {
    for (const v of [null, 3, 'x', [], { sources: 5, rids: 'x', owners: [] }, { rids: [{ id: 'rid-004' }] }]) expect(() => normalizePackage(v)).not.toThrow()
    const r = normalizePackage({ rids: [{ id: 'RID-001' }], issued: { RID: 3 } })
    expect(nextRid(r)).toBe('RID-004')
    expect(nextRid({ ...r, rids: [] })).toBe('RID-004')
    expect(idsIn('req-stk-004 and R-002')).toEqual(['REQ-STK-004', 'R-002'])
  })
})
