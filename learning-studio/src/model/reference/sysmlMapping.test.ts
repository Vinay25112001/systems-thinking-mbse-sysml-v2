// Checks that the instructor reference SysML v2 model (sysml/reference/aerolink_v0*.sysml) carries the reference
// baseline (src/model/reference/week*.ts): every requirement ID as a short name, a `satisfy` for every REQ-SYS, the
// verification cases, every course link of the baseline in the realisation recorded in sysml/reference/README.md,
// and the five demonstration digital threads hop by hop. Text-level checks only: whether the files are valid SysML is
// decided by the reference implementation (`npm run content:sysml -- sysml/reference`).
import { describe, expect, it } from 'vitest'
import { sysmlSource } from '../../lib/sysml'
import { kindOfId, threadsFrom, type Link } from '../engineering'
import { referenceUpTo } from '.'

const FILES = {
  v01: 'reference/aerolink_v01_skeleton.sysml',
  v02: 'reference/aerolink_v02_req_structure.sysml',
  v03: 'reference/aerolink_v03_behavior.sysml',
  v04: 'reference/aerolink_v04_full.sysml',
} as const
const src = (f: keyof typeof FILES): string => sysmlSource(FILES[f]) ?? ''

const m = referenceUpTo(14)
const idsOf = (k: string) => m.elements.filter((e) => e.kind === k).map((e) => e.id)
const kind = (id: string) => kindOfId(id) ?? ''
const rx = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** The five demonstration threads of docs/authoring/reference_model_notes.md section 2. */
const DEMO = [
  'STK-005>NEED-004>CAP-003>REQ-SYS-001>FN-006>LOG-002>PHY-003>INFO-003>VER-001>MOP-002>R-001',
  'STK-004>NEED-003>CAP-007>REQ-SYS-002>FN-005>LOG-001>PHY-001>INFO-002>VER-002>MOP-004>R-003',
  'STK-002>NEED-002>CAP-004>REQ-SYS-003>FN-003>LOG-001>PHY-001>INFO-002>VER-003>MOP-005>R-002',
  'STK-009>NEED-007>CAP-006>REQ-SYS-008>FN-008>LOG-003>PHY-005>INFO-003>VER-008>MOP-007>R-002',
  'STK-001>NEED-001>CAP-002>REQ-SYS-005>FN-002>LOG-005>PHY-004>INFO-001>VER-005>MOP-001>R-007',
].map((t) => t.split('>'))

/** Text of the element declared with short name <'id'>: declaration header up to its body, and the brace-matched body. */
function block(text: string, id: string): { header: string; body: string } | undefined {
  const at = text.indexOf(`<'${id}'>`)
  if (at < 0) return undefined
  const lineStart = text.lastIndexOf('\n', at) + 1
  const brace = text.indexOf('{', at)
  const semi = text.indexOf(';', at)
  if (brace < 0 || (semi >= 0 && semi < brace && !text.slice(at, semi).includes(' about'))) return { header: text.slice(lineStart, semi + 1), body: '' }
  let depth = 0
  for (let i = brace; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}' && --depth === 0) return { header: text.slice(lineStart, brace), body: text.slice(brace, i + 1) }
  }
  return undefined
}

const named = (tag: string, l: Link) =>
  new RegExp(`#${tag} dependency '${rx(`${l.source} ${l.type} ${l.target}`)}' from [\\w:']*'${rx(l.source)}' to [\\w:']*'${rx(l.target)}';`)

/** Why a baseline link is (or is not) realised in a model text; returns undefined when it is realised. */
function missingRealisation(text: string, l: Link): string | undefined {
  const { source: s, target: t, type } = l
  const ks = kind(s)
  const kt = kind(t)
  const ok = (cond: boolean, how: string) => (cond ? undefined : `${s} ${type} ${t}: ${how} not found`)
  const body = (id: string) => block(text, id)?.body ?? ''
  const reqLike = (k: string) => ['MGO', 'NEED', 'REQ'].includes(k)
  switch (type) {
    case 'derives-from':
      if ((ks === 'CON' || ks === 'NEED') && kt === 'STK')
        return ok(new RegExp(`stakeholder \\w+ : (Stakeholders::)?'${t}';`).test(body(s)), 'stakeholder declaration')
      if ((ks === 'NEED' || ks === 'MGO') && kt === 'CON') return ok(body(s).includes(`frame Stakeholders::'${t}';`), 'frame')
      if (reqLike(ks) && reqLike(kt))
        return ok(
          new RegExp(`#derivation connection '${rx(`${s} derives-from ${t}`)}' \\{\\s*end #original ::> \\w+::'${t}';\\s*end #derive ::> \\w+::'${s}';`).test(text),
          '#derivation connection',
        )
      return ok(named('derivesFrom', l).test(text), '#derivesFrom dependency')
    case 'refines':
      return ok(named('refinement', l).test(text), '#refinement dependency')
    case 'satisfies':
      return ok(
        new RegExp(`satisfy Requirements::'${t}' by [\\w:.']*'${s}';`).test(text) || named('satisfies', l).test(text),
        'satisfy (or #satisfies dependency)',
      )
    case 'allocated-to':
      return ok(new RegExp(`allocation '${rx(`${s} allocated-to ${t}`)}' allocate [\\w:.']*'${s}' to [\\w:.']*'${t}';`).test(text), 'allocation')
    case 'performs': {
      if (ks === 'LOG' || ks === 'AI') return ok(body(s).includes(`perform Logical::'${t}';`), 'perform in the performer')
      const extDef = new RegExp(`part <'${s}'> \\w+ : (\\w+)`).exec(text)?.[1]
      const actorType = ks === 'STK' ? `Stakeholders::'${s}'` : `Context::${extDef ?? '?'}`
      return ok(new RegExp(`actor \\w+ : ${rx(actorType)};`).test(body(t)), 'actor in the use case')
    }
    case 'verifies':
      return ok(body(s).includes(`verify Requirements::'${t}';`), 'verify in the verification objective')
    case 'flows-to': {
      const flow = new RegExp(`flow '[^']*\\b${rx(`${s} flows-to ${t}`)}\\b[^']*' of [\\w:']*'(INFO-\\d{3})' from ([^ ]+) to ([^;]+);`).exec(text)
      if (flow) {
        const [, info, from, to] = flow
        const ends = ks === 'INFO' ? info === s && to.includes(`'${t}'`) : info === t && from.includes(`'${s}'`)
        return ok(ends, 'item flow with matching item and ends')
      }
      return ok(named('flowsTo', l).test(text), 'item flow or #flowsTo dependency')
    }
    case 'measures':
      return ok(named('measures', l).test(text), '#measures dependency')
    case 'mitigates':
      return ok(named('mitigates', l).test(text), '#mitigates dependency')
    case 'affects':
      if (['A', 'R', 'O', 'U'].includes(ks))
        return ok(new RegExp(` about[\\s\\S]*'${t}'[,\\s]`).test(block(text, s)?.header ?? ''), 'AROU metadata about the target')
      return ok(named('affects', l).test(text), '#affects dependency')
  }
}

const reqIdMissing = (text: string) => idsOf('REQ').filter((r) => !text.includes(`<'${r}'>`))
const satisfyMissing = (text: string) =>
  idsOf('REQ').filter((r) => r.startsWith('REQ-SYS')).filter((r) => !new RegExp(`satisfy Requirements::'${r}' by `).test(text))

describe('reference SysML model files', () => {
  it('all four files are present under sysml/reference', () => {
    for (const f of Object.keys(FILES) as (keyof typeof FILES)[]) expect(src(f).length, FILES[f]).toBeGreaterThan(1000)
  })

  it('every REQ ID of the baseline is a short name in v0.2 and v0.4', () => {
    expect(idsOf('REQ')).toHaveLength(20)
    expect(reqIdMissing(src('v02'))).toEqual([])
    expect(reqIdMissing(src('v04'))).toEqual([])
  })

  it('every REQ-SYS has a satisfy in v0.2 and v0.4, and every satisfy is backed by a baseline satisfies link', () => {
    for (const f of ['v02', 'v04'] as const) {
      expect(satisfyMissing(src(f)), f).toEqual([])
      for (const [, req, by] of src(f).matchAll(/satisfy Requirements::'(REQ-[A-Z]+-\d{3})' by [\w:.']*'([A-Z]+-\d{3})';/g))
        expect(m.links.some((l) => l.type === 'satisfies' && l.source === by && l.target === req), `${by} satisfies ${req}`).toBe(true)
    }
  })

  it('v0.4 declares every baseline element exactly once as a short name, and no ID outside the baseline', () => {
    const text = src('v04')
    const declared = [...text.matchAll(/<'([A-Z]+(?:-[A-Z]+)?-\d{3})'>/g)].map((x) => x[1])
    const counts = new Map<string, number>()
    for (const d of declared) counts.set(d, (counts.get(d) ?? 0) + 1)
    expect([...counts].filter(([, n]) => n !== 1)).toEqual([])
    expect([...counts.keys()].sort()).toEqual(m.elements.map((e) => e.id).sort())
  })

  it('each version only adds: IDs declared in v0.n are declared again in v0.n+1', () => {
    const decl = (t: string) => new Set([...t.matchAll(/<'([A-Z]+(?:-[A-Z]+)?-\d{3})'>/g)].map((x) => x[1]))
    const [a, b, c, d] = (['v01', 'v02', 'v03', 'v04'] as const).map((f) => decl(src(f)))
    for (const [lo, hi] of [[a, b], [b, c], [c, d]]) expect([...lo].filter((x) => !hi.has(x))).toEqual([])
    expect(a.size).toBeGreaterThanOrEqual(6 + 1)
    expect([...a].filter((x) => x.startsWith('PHY-')).length).toBeGreaterThanOrEqual(6)
  })

  it('v0.4 has a verification case with objective, verify and verdict for every VER ID of the baseline', () => {
    const text = src('v04')
    expect(idsOf('VER')).toHaveLength(11)
    for (const v of idsOf('VER')) {
      const b = block(text, v)
      expect(b?.header, v).toMatch(/verification <'VER-\d{3}'>/)
      expect(b?.body, v).toMatch(/objective \{[\s\S]*verify Requirements::'REQ-[A-Z]+-\d{3}';/)
      expect(b?.body, v).toMatch(/return verdict : VerdictKind = /)
      expect(b?.body, v).toMatch(/@VerificationMethod \{ kind = VerificationMethodKind::(test|analyze|demo|inspect); \}/)
    }
  })

  it('v0.3 and v0.4 carry the SCN-002 action flow (decisions) and the operating states (>= 4 states, >= 5 transitions)', () => {
    for (const f of ['v03', 'v04'] as const) {
      const scn = block(src(f), 'SCN-002')?.body ?? ''
      expect(scn.match(/then decide \w+;/g)?.length ?? 0, f).toBeGreaterThanOrEqual(1)
      const states = /state def AircraftOperatingStates \{[\s\S]*?\n\t\t\}/.exec(src(f))?.[0] ?? ''
      expect(states.match(/^\t\t\tstate \w+/gm)?.length ?? 0, f).toBeGreaterThanOrEqual(4)
      expect(states.match(/^\t\t\ttransition \w+/gm)?.length ?? 0, f).toBeGreaterThanOrEqual(5)
      expect(src(f), f).toContain('exhibit Behavior::aircraftOperatingStates;')
    }
  })

  it('every one of the 381 baseline links is realised in v0.4', () => {
    expect(m.links).toHaveLength(381)
    expect(m.links.map((l) => missingRealisation(src('v04'), l)).filter(Boolean)).toEqual([])
  })

  it('earlier versions realise exactly the links whose ends exist at that level (the link check discriminates)', () => {
    const v04Only = ['VER', 'MOE', 'MOP', 'TPM', 'TECH', 'A', 'R', 'O', 'U', 'ALT', 'CRIT', 'DEC']
    const v02Up = ['REQ', 'LOG', 'FN', 'AI', 'IF', 'INFO', ...v04Only]
    const touches = (l: Link, ks: string[]) => ks.includes(kind(l.source)) || ks.includes(kind(l.target))
    const missing = (f: 'v01' | 'v02' | 'v03') => m.links.filter((l) => missingRealisation(src(f), l)).map((l) => l.id).sort()
    expect(missing('v02')).toEqual(m.links.filter((l) => touches(l, v04Only)).map((l) => l.id).sort())
    expect(missing('v03')).toEqual(missing('v02'))
    expect(missing('v01')).toEqual(m.links.filter((l) => touches(l, v02Up)).map((l) => l.id).sort())
  })

  it('the five demonstration threads are complete in the baseline and every hop is realised in v0.4', () => {
    const text = src('v04')
    const L = m.links
    const find = (pred: (l: Link) => boolean, what: string) => {
      const l = L.find(pred)
      expect(l, what).toBeDefined()
      return l as Link
    }
    for (const ids of DEMO) {
      const [stk, need, cap, req, fn, log, phy, info, ver, mop, risk] = ids
      expect(threadsFrom(m, stk).some((t) => t.complete && t.ids.join('>') === ids.join('>')), ids.join('>')).toBe(true)
      for (const id of [phy, log, fn]) expect(text, id).toContain(`<'${id}'>`)
      // REQ to CAP: directly, or through a chain of REQ derivations (as threadsFrom walks it).
      const chain: Link[] = []
      let cur = req
      for (let guard = 0; guard < 5 && !L.some((l) => l.source === cur && l.type === 'derives-from' && l.target === cap); guard++) {
        const up = find((l) => l.source === cur && l.type === 'derives-from' && kind(l.target) === 'REQ', `${cur} derives from a REQ`)
        chain.push(up)
        cur = up.target
      }
      chain.push(find((l) => l.source === cur && l.type === 'derives-from' && l.target === cap, `${cur} derives from ${cap}`))
      const inThread = new Set(ids.slice(0, 10))
      const hops: Link[] = [
        find((l) => l.source === need && l.type === 'derives-from' && l.target === stk, 'NEED-STK'),
        find((l) => l.source === cap && l.type === 'derives-from' && l.target === need, 'CAP-NEED'),
        ...chain,
        find((l) => l.source === req && l.type === 'allocated-to' && l.target === fn, 'REQ-FN'),
        find((l) => l.source === log && l.type === 'performs' && l.target === fn, 'LOG-FN'),
        find((l) => l.source === log && l.type === 'allocated-to' && l.target === phy, 'LOG-PHY'),
        find((l) => l.type === 'flows-to' && ((l.source === phy && l.target === info) || (l.source === info && l.target === phy)), 'PHY-INFO'),
        find((l) => l.source === ver && l.type === 'verifies' && l.target === req, 'VER-REQ'),
        find((l) => l.source === mop && l.type === 'measures' && (l.target === req || l.target === cap), 'MOP-REQ'),
        find(
          (l) => (l.type === 'affects' && l.source === risk && inThread.has(l.target)) || (l.type === 'mitigates' && l.target === risk && inThread.has(l.source)),
          'R-thread',
        ),
      ]
      for (const h of hops) expect(missingRealisation(text, h), ids.join('>')).toBeUndefined()
    }
  })

  it('the checks can fail: a removed ID, a removed satisfy and a removed dependency are each detected', () => {
    const text = src('v04')
    const noId = text.replace(`<'REQ-SYS-005'>`, `<'REQ-SYS-0X5'>`)
    expect(reqIdMissing(noId)).toEqual(['REQ-SYS-005'])
    const noSatisfy = text.replace(/\t\tsatisfy Requirements::'REQ-SYS-008' by [^\n]*\n/, '')
    expect(noSatisfy.length).toBeLessThan(text.length)
    expect(satisfyMissing(noSatisfy)).toEqual(['REQ-SYS-008'])
    const link = m.links.find((l) => l.source === 'MOP-002' && l.type === 'measures' && l.target === 'REQ-SYS-001') as Link
    expect(missingRealisation(text, link)).toBeUndefined()
    const noDep = text.replace(/[^\n]*'MOP-002 measures REQ-SYS-001'[^\n]*\n/, '')
    expect(missingRealisation(noDep, link)).toMatch(/not found/)
    const noVerify = text.replace(`verify Requirements::'REQ-SYS-001';`, '')
    const verLink = m.links.find((l) => l.source === 'VER-001' && l.type === 'verifies') as Link
    expect(missingRealisation(noVerify, verLink)).toMatch(/not found/)
  })
})
