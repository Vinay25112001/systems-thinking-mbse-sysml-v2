// Week 1 adapter (architecture §8, data model §11.1): the Team Record the Week 1 lab tool edits ⇄ the canonical project.
//   toTeamRecord(doc)            projection: the record the tool and every team.ts check expect;
//   diffTeamRecord(doc, after)   the tool's edit → canonical operations (IDs issued from the project counters);
//   fromTeamRecord(rec, opts)    a stored or imported record → a new project document (legacy import).
// team.ts stays the validation, Markdown and model-inputs logic; nothing here re-implements a check.
//
// Free-text trace fields (need sources, concerns, goal) are kept as typed (so a half-typed "STK-0" survives a reload)
// AND parsed into relationships (NEED derives-from STK / CON / MGO) with the Week 1 helpers sourcesOf and concernsOf;
// tokens that do not resolve are kept in unresolvedRefs, never dropped (architecture §7).
import { concernsOf, EMPTY_ISSUED, normalizeTeam, prefixLines, sourcesOf, type IdPrefix, type TeamRecord } from '../../workbench/week1/team'
import { ownerProblem } from '../../components/ProvenanceOwnerFields'
import { emptyProject, makeArtifact, makeRelationship, type NewProjectOptions } from '../model/create'
import { formatId, ID_RE, nextNumber, numOf } from '../model/ids'
import { applyOps, fieldDiff } from '../model/ops'
import type { Artifact, ArtifactType, AttrValue, Operation, ProjectDoc, Provenance, Stamp } from '../model/types'

const WEEK1_IDS: IdPrefix[] = ['EXT', 'STK', 'CON', 'NEED', 'PRT', 'MGO', 'REL']
const s = (v: AttrValue | undefined) => (typeof v === 'string' ? v : v === undefined || v === null ? '' : String(v))
const seqOf = (a: { attributes?: Record<string, AttrValue> }) => (typeof a.attributes?.seq === 'number' ? (a.attributes.seq as number) : 1e9)
const bySeq = <T extends { id: string; attributes?: Record<string, AttrValue> }>(xs: T[]) => [...xs].sort((a, b) => seqOf(a) - seqOf(b) || numOf(a.id) - numOf(b.id))

export const EXPORT_FORMATS = { md: 'week1-record-md', json: 'week1-model-inputs' } as const

/** The Week 1 artifacts that are AeroLink practice copies not yet adapted (integrity I14). */
const unadapted = (a: Artifact) => a.provenance.kind === 'copied-from-practice' && !a.provenance.adapted

// ------------------------------------------------------------------------------------------------ projection
export function toTeamRecord(doc: ProjectDoc, opts: { excludeUnadapted?: boolean } = {}): TeamRecord {
  const arts = Object.values(doc.artifacts).filter((a) => a.status === 'active' && !(opts.excludeUnadapted && unadapted(a)))
  const of = (t: ArtifactType) => bySeq(arts.filter((a) => a.type === t))
  const ent = of('ENT')[0]
  const mission = arts.find((a) => a.id === 'MGO-001')
  const approval = (ent?.attributes.approval ?? {}) as Record<string, AttrValue>
  const rels = Object.values(doc.relationships).filter((r) => r.status !== 'retired')
  const ownerOf = new Map(rels.filter((r) => r.type === 'derives-from').map((r) => [r.from, r.to]))
  const m1 = doc.milestones.find((m) => m.week === 1)
  const lastExport = (format: string) => {
    const at = (m1?.exports ?? []).filter((e) => e.files.some((f) => f.format === format)).map((e) => Date.parse(e.at)).filter(Number.isFinite)
    return at.length ? Math.max(...at) : undefined
  }
  const cons = of('CON')
  const rec = {
    team: doc.team.label,
    proposal: {
      name: ent?.title ?? '',
      domain: s(ent?.attributes.domain),
      problem: s(ent?.attributes.problem),
      purpose: mission?.description ?? '',
      goals: of('MGO').filter((g) => g.id !== 'MGO-001').map((g) => ({ id: g.id, text: g.description })),
      soi: s(ent?.attributes.soi),
      inside: of('PRT').map((p) => ({ id: p.id, name: p.title })),
      why: s(ent?.attributes.suitability),
      decision: s(approval.decision),
      decidedOn: s(approval.decidedOn),
    },
    charter: { threePersonTeam: doc.team.threePersonTeam, roles: { ...doc.team.roles }, decisionRules: doc.team.decisionRules, norms: doc.team.norms, prefixes: doc.team.prefixesText },
    context: of('EXT').map((x) => ({ id: x.id, name: x.title, kind: s(x.attributes.kind), crosses: s(x.attributes.crosses), direction: s(x.attributes.direction) })),
    stakeholders: of('STK').map((x) => ({
      id: x.id,
      name: x.title,
      role: s(x.attributes.role),
      stage: s(x.attributes.stage),
      side: s(x.attributes.side),
      approving: x.attributes.approving === true ? 'yes' : x.attributes.approving === false ? 'no' : '',
      concerns: cons.filter((c) => ownerOf.get(c.uid) === x.uid).map((c) => ({ id: c.id, text: c.description })),
      influence: s(x.attributes.influenceText),
      reason: s(x.attributes.influenceReason),
    })),
    relationships: bySeq(rels.filter((r) => r.category === 'stakeholder')).map((r) => ({ id: r.id, from: s(r.attributes?.fromText), to: s(r.attributes?.toText), type: r.type, note: r.note ?? '' })),
    needs: of('NEED').map((n) => ({
      id: n.id,
      name: n.title,
      text: n.description,
      conditions: s(n.attributes.conditions),
      rationale: n.rationale ?? '',
      sources: s(n.attributes.sourcesText),
      concerns: s(n.attributes.concernsText),
      goal: s(n.attributes.goalText),
      priority: s(n.attributes.priority),
      selfCheck: (n.attributes.selfCheck ?? {}) as Record<string, boolean>,
      justification: s(n.attributes.justification),
    })),
    aiStatement: m1?.aiStatement ?? '',
    issued: Object.fromEntries(WEEK1_IDS.map((p) => [p, Math.max(doc.issued[p] ?? 0, EMPTY_ISSUED[p])])),
    updatedAt: m1?.contentUpdatedAt ? Date.parse(m1.contentUpdatedAt) : undefined,
    exportedMdAt: lastExport(EXPORT_FORMATS.md),
    exportedJsonAt: lastExport(EXPORT_FORMATS.json),
  }
  return normalizeTeam(rec)
}

// ------------------------------------------------------------------------------------------------ edit → operations
const STK_RE = /^STK-\d{3,4}$/

/** The canonical operations that make the project hold `after` (the tool's edited record). Rows are matched by course
 *  ID; a removed row retires its artifact (the ID stays taken); new rows become artifacts with the IDs the tool issued
 *  from the projected counters (= the project's). */
export function diffTeamRecord(doc: ProjectDoc, afterIn: TeamRecord, stamp: Stamp, provenance: Provenance = { kind: 'own' }): Operation[] {
  const after = normalizeTeam(afterIn)
  const creates: Operation[] = []
  const updates: Operation[] = []
  const relCreates: Operation[] = []
  const retires: Operation[] = []
  const active = Object.values(doc.artifacts).filter((a) => a.status === 'active')
  const byId = new Map<string, Artifact>(active.map((a) => [a.id, a]))
  const anyById = new Map<string, Artifact>(Object.values(doc.artifacts).map((a) => [a.id, a]))
  const newUids = new Map<string, string>()
  const uidOf = (id: string) => byId.get(id)?.uid ?? newUids.get(id)
  const typeOfNew = new Map<string, ArtifactType>()
  let lnk = nextNumber(doc, 'LNK')
  const maxSeq: Record<string, number> = {}
  for (const a of active) maxSeq[a.type] = Math.max(maxSeq[a.type] ?? 0, typeof a.attributes.seq === 'number' ? (a.attributes.seq as number) : 0)
  for (const r of Object.values(doc.relationships)) if (r.category === 'stakeholder') maxSeq.REL = Math.max(maxSeq.REL ?? 0, typeof r.attributes?.seq === 'number' ? (r.attributes.seq as number) : 0)
  const nextSeq = (t: string) => (maxSeq[t] = (maxSeq[t] ?? 0) + 1)

  const create = (type: ArtifactType, id: string, fields: { title?: string; description?: string; rationale?: string; attributes?: Record<string, AttrValue> }) => {
    const a = makeArtifact({ id, type, ...fields, attributes: { ...(fields.attributes ?? {}), seq: nextSeq(type) }, stamp, provenance })
    creates.push({ op: 'create-artifact', artifact: a })
    newUids.set(id, a.uid)
    typeOfNew.set(id, type)
    return a.uid
  }
  const update = (a: Artifact, fields: Record<string, unknown>) => {
    const f = fieldDiff(a, fields)
    if (f.length) updates.push({ op: 'update-artifact', uid: a.uid, fields: f })
  }
  const link = (type: 'derives-from' | 'contains', from: string, to: string) => {
    relCreates.push({ op: 'create-relationship', relationship: makeRelationship({ id: formatId('LNK', lnk++), category: type === 'contains' ? 'structure' : 'trace', type, from, to, stamp, provenance }) })
  }
  const retire = (a: Artifact, why = 'Removed in the Week 1 lab tool') => retires.push({ op: 'retire-artifact', uid: a.uid, reason: why })

  // team and charter
  const roles = { ...after.charter.roles }
  const initials = [...new Set(Object.values(after.charter.roles).map((v) => v.trim().toUpperCase()).filter((v) => !ownerProblem(v)))]
  const ownership: Record<string, string> = {}
  for (const l of prefixLines(after.charter.prefixes)) for (const p of l.prefixes) if (!ownership[p]) ownership[p] = l.member
  const members = [...doc.team.members.map((m) => ({ ...m, active: initials.includes(m.initials) || (!initials.length && m.active) })), ...initials.filter((i) => !doc.team.members.some((m) => m.initials === i)).map((i) => ({ initials: i, active: true }))]
  const teamFields = fieldDiff(doc.team, { label: after.team, threePersonTeam: after.charter.threePersonTeam, roles, decisionRules: after.charter.decisionRules, norms: after.charter.norms, prefixesText: after.charter.prefixes, prefixOwnership: ownership, members })
  if (teamFields.length) {
    if (teamFields.some((f) => f.path !== 'label')) teamFields.push({ path: 'charterUpdatedAt', before: doc.team.charterUpdatedAt, after: stamp.at })
    updates.push({ op: 'update-team', fields: teamFields })
  }
  const labelChange = fieldDiff(doc.project, { 'course.teamLabel': after.team })
  if (labelChange.length) updates.push({ op: 'update-project', fields: labelChange })

  // enterprise, mission, approval (mirrored on Milestone 1)
  const p = after.proposal
  const approval = { decision: p.decision, decidedOn: p.decidedOn }
  const ent = active.find((a) => a.type === 'ENT')
  const entFields = { title: p.name, 'attributes.domain': p.domain, 'attributes.problem': p.problem, 'attributes.suitability': p.why, 'attributes.soi': p.soi, 'attributes.approval': approval }
  if (ent) update(ent, entFields)
  else if (!anyById.has('ENT-001')) create('ENT', 'ENT-001', { title: p.name, attributes: { domain: p.domain, problem: p.problem, suitability: p.why, soi: p.soi, approval } })
  const m1 = doc.milestones.find((m) => m.week === 1)
  if (m1) {
    const mf = fieldDiff(m1, { approval: p.decision ? approval : undefined, aiStatement: after.aiStatement })
    if (mf.length) updates.push({ op: 'update-milestone', week: 1, fields: mf })
  }
  const mission = byId.get('MGO-001')
  if (mission) update(mission, { description: p.purpose })
  else if (!anyById.has('MGO-001')) create('MGO', 'MGO-001', { title: 'Mission', description: p.purpose, attributes: { level: 'mission' } })

  // rows of artifacts, matched by course ID
  function rows<R extends { id: string }>(type: ArtifactType, list: R[], fields: (r: R) => { title?: string; description?: string; rationale?: string; attributes: Record<string, AttrValue> }, onCreate?: (uid: string, r: R) => void, keep?: (a: Artifact) => boolean) {
    const seen = new Set<string>()
    for (const r of list) {
      if (!ID_RE(type).test(r.id) || seen.has(r.id)) continue
      seen.add(r.id)
      const a = byId.get(r.id)
      const f = fields(r)
      if (a && a.type === type) update(a, { ...(f.title !== undefined ? { title: f.title } : {}), ...(f.description !== undefined ? { description: f.description } : {}), ...(f.rationale !== undefined ? { rationale: f.rationale } : {}), ...Object.fromEntries(Object.entries(f.attributes).map(([k, v]) => [`attributes.${k}`, v])) })
      else if (!anyById.has(r.id)) {
        const uid = create(type, r.id, f)
        if (onCreate) onCreate(uid, r)
      }
    }
    for (const a of active) if (a.type === type && !seen.has(a.id) && !(keep && keep(a))) retire(a)
  }
  rows('MGO', p.goals, (g) => ({ description: g.text, attributes: { level: 'goal' } }), (uid) => {
    const m = byId.get('MGO-001')?.uid ?? newUids.get('MGO-001')
    if (m) link('derives-from', uid, m)
  }, (a) => a.id === 'MGO-001')
  rows('PRT', p.inside, (x) => ({ title: x.name, attributes: {} }), (uid) => {
    const e = ent?.uid ?? newUids.get('ENT-001')
    if (e) link('contains', e, uid)
  })
  rows('EXT', after.context, (x) => ({ title: x.name, attributes: { kind: x.kind, crosses: x.crosses, direction: x.direction } }))
  rows('STK', after.stakeholders, (x) => ({ title: x.name, attributes: { role: x.role, stage: x.stage, side: x.side, approving: x.approving === 'yes' ? true : x.approving === 'no' ? false : null, influence: /^[1-5]$/.test(x.influence.trim()) ? Number(x.influence.trim()) : null, influenceText: x.influence, influenceReason: x.reason } }))
  const concernRows = after.stakeholders.flatMap((st) => st.concerns.map((c) => ({ ...c, owner: st.id })))
  rows('CON', concernRows, (c) => ({ description: c.text, attributes: {} }), (uid, c) => {
    const o = uidOf(c.owner)
    if (o) link('derives-from', uid, o)
  })
  rows('NEED', after.needs, (n) => ({ title: n.name, description: n.text, rationale: n.rationale, attributes: { conditions: n.conditions, priority: n.priority, selfCheck: n.selfCheck as Record<string, AttrValue>, justification: n.justification, sourcesText: n.sources, concernsText: n.concerns, goalText: n.goal, addedIn: 1 } }))

  // stakeholder relationships (REL rows): a draft until both ends resolve to registered stakeholders and the type is set
  const relsNow = Object.values(doc.relationships).filter((r) => r.category === 'stakeholder' && r.status !== 'retired')
  const seenRel = new Set<string>()
  const complete = new Set<string>()
  const relEnd = (t: string) => (STK_RE.test(t) && (anyById.get(t)?.type === 'STK' || typeOfNew.get(t) === 'STK') ? (anyById.get(t)?.uid ?? newUids.get(t) ?? '') : '')
  for (const x of after.relationships) {
    if (!ID_RE('REL').test(x.id) || seenRel.has(x.id)) continue
    seenRel.add(x.id)
    const from = relEnd(x.from)
    const to = relEnd(x.to)
    const key = `${from}|${to}|${x.type}`
    const done = !!(from && to && x.type && from !== to && !complete.has(key))
    if (done) complete.add(key)
    const existing = relsNow.find((r) => r.id === x.id)
    const want = { type: x.type, from, to, note: x.note, draft: !done, 'attributes.fromText': x.from, 'attributes.toText': x.to }
    if (existing) {
      const f = fieldDiff(existing, want)
      if (f.length) relCreates.push({ op: 'update-relationship', uid: existing.uid, fields: f })
    } else if (!Object.values(doc.relationships).some((r) => r.id === x.id)) {
      relCreates.push({ op: 'create-relationship', relationship: makeRelationship({ id: x.id, category: 'stakeholder', type: x.type, from, to, note: x.note, draft: !done, attributes: { fromText: x.from, toText: x.to, seq: nextSeq('REL') }, stamp, provenance }) })
    }
  }
  for (const r of relsNow) if (!seenRel.has(r.id)) retires.unshift({ op: 'retire-relationship', uid: r.uid, reason: 'Removed in the Week 1 lab tool' })

  // need traces: NEED derives-from STK / CON / MGO, from the typed fields
  for (const n of after.needs) {
    const needUid = uidOf(n.id)
    if (!needUid) continue
    const goal = n.goal.trim().toUpperCase()
    const tokens = [...sourcesOf(n), ...concernsOf(n), ...(/^MGO-\d{3,4}$/.test(goal) ? [goal] : [])]
    const wanted = new Set<string>()
    const unresolved: string[] = []
    for (const t of tokens) {
      const target = anyById.get(t) ?? (newUids.has(t) ? ({ uid: newUids.get(t)!, status: 'active' } as Artifact) : undefined)
      if (target) wanted.add(target.uid)
      if (!target || target.status !== 'active') unresolved.push(t)
    }
    const typed = goal && !/^MGO-\d{3,4}$/.test(goal) ? [goal] : []
    const existing = Object.values(doc.relationships).filter((r) => r.from === needUid && r.type === 'derives-from' && r.status !== 'retired')
    for (const r of existing) if (!wanted.has(r.to)) retires.unshift({ op: 'retire-relationship', uid: r.uid, reason: `Removed from ${n.id}’s sources, concerns or goal in the Week 1 lab tool` })
    for (const uid of wanted) {
      const target = Object.values(doc.artifacts).find((a) => a.uid === uid)
      if (existing.some((r) => r.to === uid) || (target && target.status !== 'active')) continue
      link('derives-from', needUid, uid)
    }
    const a = byId.get(n.id)
    const refs = [...unresolved, ...typed]
    if (a && JSON.stringify(a.unresolvedRefs) !== JSON.stringify(refs)) updates.push({ op: 'update-artifact', uid: a.uid, fields: [{ path: 'unresolvedRefs', before: a.unresolvedRefs, after: refs }] })
    else if (!a && refs.length) {
      const c = creates.find((o) => o.op === 'create-artifact' && o.artifact.id === n.id) as { artifact: Artifact } | undefined
      if (c) c.artifact.unresolvedRefs = refs
    }
  }
  return [...creates, ...updates, ...relCreates, ...retires]
}

// ------------------------------------------------------------------------------------------------ legacy record → project
/** Repairs IDs a stored record may carry that the project cannot hold (empty, malformed, duplicate, a goal numbered
 *  MGO-001): each gets the next free number, recorded so the plan can show it. */
export function normalizeRecordIds(recIn: TeamRecord): { rec: TeamRecord; renumbered: { from: string; to: string; prefix: string }[] } {
  const rec = normalizeTeam(recIn)
  const renumbered: { from: string; to: string; prefix: string }[] = []
  const used = new Map<string, Set<string>>()
  const next: Record<string, number> = { ...rec.issued }
  const fix = <T extends { id: string }>(prefix: IdPrefix, x: T): T => {
    const set = used.get(prefix) ?? new Set<string>()
    used.set(prefix, set)
    if (ID_RE(prefix).test(x.id) && !set.has(x.id) && !(prefix === 'MGO' && x.id === 'MGO-001')) {
      set.add(x.id)
      return x
    }
    next[prefix] = Math.max(next[prefix] ?? 0, ...[...set].map(numOf)) + 1
    const id = formatId(prefix, next[prefix])
    set.add(id)
    renumbered.push({ from: x.id, to: id, prefix })
    return { ...x, id }
  }
  const out: TeamRecord = {
    ...rec,
    proposal: { ...rec.proposal, goals: rec.proposal.goals.map((g) => fix('MGO', g)), inside: rec.proposal.inside.map((x) => fix('PRT', x)) },
    context: rec.context.map((x) => fix('EXT', x)),
    stakeholders: rec.stakeholders.map((x) => ({ ...fix('STK', x), concerns: x.concerns.map((c) => fix('CON', c)) })),
    relationships: rec.relationships.map((x) => fix('REL', x)),
    needs: rec.needs.map((x) => fix('NEED', x)),
  }
  return { rec: normalizeTeam(out), renumbered }
}

/** A new project document holding a Week 1 Team Record (from this browser or a week1-model-inputs file). */
export function fromTeamRecord(recIn: TeamRecord, opts: NewProjectOptions & { provenance?: Provenance } = {}): { doc: ProjectDoc; renumbered: { from: string; to: string; prefix: string }[] } {
  const { rec, renumbered } = normalizeRecordIds(recIn)
  const at = opts.at ?? new Date().toISOString()
  const base = emptyProject({ ...opts, teamLabel: opts.teamLabel ?? rec.team, at })
  const stamp: Stamp = { at, by: (opts.initials ?? '').toUpperCase(), change: 'CHG-000000' }
  const ops = diffTeamRecord(base, rec, stamp, opts.provenance)
  const res = applyOps(base, ops, { at, by: stamp.by, change: stamp.change })
  if (!res.ok) throw new Error(`The Week 1 record could not be converted: ${res.error}`)
  const doc = res.doc
  for (const p of WEEK1_IDS) doc.issued[p] = Math.max(doc.issued[p] ?? 0, rec.issued[p] ?? 0)
  // the record's own timestamps: what was last changed and exported stays true in the project
  const m1 = doc.milestones.find((m) => m.week === 1)!
  const iso = (n?: number) => (typeof n === 'number' && Number.isFinite(n) ? new Date(n).toISOString() : undefined)
  m1.contentUpdatedAt = iso(rec.updatedAt) ?? at
  const exp = (format: string, name: string, t?: number) => (t ? [{ at: iso(t)!, by: '', files: [{ name, format, version: format === EXPORT_FORMATS.json ? 3 : 1 }], rev: 0, snapshot: '', contentState: 'not-ready' as const }] : [])
  m1.exports = [...exp(EXPORT_FORMATS.md, 'week1-record.md', rec.exportedMdAt), ...exp(EXPORT_FORMATS.json, 'week1-model-inputs.json', rec.exportedJsonAt)]
  doc.rev = 0
  return { doc, renumbered }
}

/** True when a record holds anything worth keeping (a name or any row). */
export const recordHasContent = (r: TeamRecord) => !!(r.proposal.name.trim() || r.stakeholders.length || r.needs.length || r.context.length || r.proposal.goals.length || r.relationships.length || r.proposal.inside.length)
export const recordCounts = (r: TeamRecord) => ({ stakeholders: r.stakeholders.length, concerns: r.stakeholders.reduce((n, x) => n + x.concerns.length, 0), needs: r.needs.length, context: r.context.length, relationships: r.relationships.length, goals: r.proposal.goals.length, inside: r.proposal.inside.length })
