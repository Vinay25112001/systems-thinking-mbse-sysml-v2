// Drift check between the instructor reference baseline (src/model/reference/week*.ts) and the reference SysML v2
// files (sysml/reference/aerolink_v0*.sysml). sysmlMapping.test.ts checks that every ID is declared and every course
// link is realised; this file checks the CONTENT of each declaration, so that a change to a name, a text or a
// recorded attribute in the baseline cannot silently leave the SysML model behind (the SysML files are hand-patched;
// no generator is kept). For every element, in every file that declares it (<'ID'>):
//   - the element's name and its text appear in the declaration (header, `doc` or body), whitespace-normalised and
//     in ASCII spelling; a name may instead be the declaration's usage or type name ("Flight Operations" -> FlightOperations);
//   - IF: the doc records "(<type>)" and "Carries: <carries>", and the `connect` joins the two ends of `ends`;
//   - INFO: the doc records producer, consumer, decision supported and (if any) the recorded relay;
//   - AI: @AIEnabledCapability records inputs, outputs, human oversight and failure mode verbatim;
//   - the free-text attributes in TEXT_KEYS (rationale, criterion, SCN flows, AROU treatment, …) appear in the declaration.
// Text-level checks only; validity is decided by the checker (`npm run content:sysml -- sysml/reference`).
import { describe, expect, it } from 'vitest'
import { sysmlSource } from '../../lib/sysml'
import type { Element } from '../engineering'
import { referenceUpTo } from '.'

const FILES = ['aerolink_v01_skeleton', 'aerolink_v02_req_structure', 'aerolink_v03_behavior', 'aerolink_v04_full'].map((f) => `reference/${f}.sysml`)
const m = referenceUpTo(14)
/** The SysML files are ASCII: typographic characters of the baseline are compared in their ASCII spelling. */
const ASCII: [RegExp, string][] = [[/[‘’]/g, "'"], [/[“”]/g, '"'], [/[–—]/g, '-'], [/↔/g, '<->'], [/≤/g, '<='], [/≥/g, '>='], [/×/g, 'x'], [/…/g, '...'], [/→/g, '->']]
const norm = (s: string) => ASCII.reduce((t, [re, to]) => t.replace(re, to), s).replace(/\s+/g, ' ').trim()
/** A name may also be realised as the usage or type name of the declaration ("Flight Operations" -> FlightOperations). */
const squash = (s: string) => norm(s).replace(/[^A-Za-z0-9]/g, '').toLowerCase()

/** Header line(s) and brace-matched body of the declaration with short name <'id'> (or the header up to ';'). */
function declaration(text: string, id: string): string | undefined {
  const at = text.indexOf(`<'${id}'>`)
  if (at < 0) return undefined
  const start = text.lastIndexOf('\n', at) + 1
  const brace = text.indexOf('{', at)
  const semi = text.indexOf(';', at)
  // AROU metadata: `metadata <'R-001'> '…' : CourseRisk about A, B { … }` — the header can contain no ';' before '{'.
  if (brace < 0 || (semi >= 0 && semi < brace)) return text.slice(start, semi + 1)
  let depth = 0
  for (let i = brace; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}' && --depth === 0) return text.slice(start, i + 1)
  }
  return undefined
}

const TEXT_KEYS = ['rationale', 'criterion', 'conditions', 'trigger', 'mainFlow', 'alternateFlows', 'endState', 'preconditions', 'actors', 'treatment', 'measure', 'horizon', 'validation', 'owner']

const str = (e: Element, k: string) => {
  const v = e.attributes?.[k]
  return typeof v === 'string' ? v : undefined
}

/** Every content drift of element `e` in declaration `d`; empty when the declaration carries the baseline content. */
export function drift(e: Element, d: string): string[] {
  const out: string[] = []
  const has = (s: string) => norm(d).includes(norm(s))
  const header = d.slice(0, d.indexOf('{') >= 0 ? d.indexOf('{') : d.length)
  if (!has(e.name) && !squash(header).includes(squash(e.name))) out.push(`name "${e.name}"`)
  if (e.text && !has(e.text)) out.push(`text "${e.text}"`)
  if (e.kind === 'IF') {
    const type = str(e, 'type') ?? ''
    if (!has(`(${type})`)) out.push(`type ${type}`)
    if (!has(`Carries: ${str(e, 'carries') ?? ''}.`)) out.push(`carries "${str(e, 'carries')}"`)
    const ends = (str(e, 'ends') ?? '').split('<->').map((s) => s.trim())
    const conn = /connect ([^\n{;]*?) to ([^\n{;]*?)\s*[{;]/.exec(d)
    const joined = conn ? [conn[1], conn[2]].map((x) => x.match(/'((?:PHY|EXT)-\d{3})'/)?.[1]) : []
    if (!conn || [...joined].sort().join() !== [...ends].sort().join()) out.push(`ends ${ends.join(' <-> ')} (connect joins ${joined.join(' <-> ') || 'nothing'})`)
  }
  if (e.kind === 'INFO') {
    for (const [k, label] of [['producer', 'Producer'], ['consumer', 'Consumer'], ['decisionSupported', 'Decision supported'], ['relay', 'Relay']] as const) {
      const v = str(e, k)
      if (v && !has(`${label}: ${v}.`)) out.push(`${k} "${v}"`)
    }
  }
  // Free-text attributes recorded in `doc`, metadata or AROU attributes (the keys the 2026-10-11 manual drift script compared).
  for (const k of TEXT_KEYS) {
    const v = str(e, k)
    if (v && !has(v)) out.push(`${k} "${v}"`)
  }
  if (e.kind === 'AI')
    for (const k of ['inputs', 'outputs', 'humanOversight', 'failureMode']) {
      const v = str(e, k)
      if (v && !has(`${k} = "${v}";`)) out.push(`${k} "${v}"`)
    }
  return out
}

describe('reference SysML files carry the baseline content (drift check)', () => {
  const texts = FILES.map((f) => [f, sysmlSource(f) ?? ''] as const)

  it('all four files are present', () => {
    for (const [f, t] of texts) expect(t.length, f).toBeGreaterThan(1000)
  })

  it('every declared element matches its baseline name, text and recorded attributes in every file that declares it', () => {
    const problems: string[] = []
    for (const [f, t] of texts)
      for (const e of m.elements) {
        const d = declaration(t, e.id)
        if (d === undefined) continue
        for (const p of drift(e, d)) problems.push(`${f.replace('reference/', '')} ${e.id}: ${p}`)
      }
    expect(problems).toEqual([])
  })

  it('v0.4 declares every baseline element (so the content check above covers all of them)', () => {
    const v04 = texts[3][1]
    expect(m.elements.filter((e) => declaration(v04, e.id) === undefined).map((e) => e.id)).toEqual([])
  })

  it('the drift check can fail: a changed text, interface end, carried item, relay or AI attribute is each detected (mutation)', () => {
    const v04 = texts[3][1]
    const el = (id: string) => m.elements.find((e) => e.id === id)!
    const d = (id: string, t = v04) => declaration(t, id)!
    expect(drift(el('DEC-002'), d('DEC-002'))).toEqual([])
    expect(drift({ ...el('DEC-002'), text: 'Host booking, scheduling and dispatch on one platform.' }, d('DEC-002'))).toHaveLength(1)
    expect(drift(el('IF-012'), d('IF-012').replace(`'PHY-005'.maintenanceDataOut`, `'PHY-003'.sessionDataOut`))).toEqual([expect.stringMatching(/^ends /)])
    expect(drift({ ...el('IF-002'), attributes: { ...el('IF-002').attributes, carries: 'INFO-002, INFO-003' } }, d('IF-002'))).toEqual([expect.stringMatching(/^carries /)])
    expect(drift({ ...el('IF-014'), attributes: { ...el('IF-014').attributes, type: 'organisational' } }, d('IF-014'))).toEqual(['type organisational'])
    expect(drift(el('INFO-003'), d('INFO-003').replace('Relay: ', 'Route: '))).toEqual([expect.stringMatching(/^relay /)])
    expect(drift({ ...el('AI-002'), attributes: { ...el('AI-002').attributes, failureMode: 'changed' } }, d('AI-002'))).toEqual(['failureMode "changed"'])
    // Free-text attributes: a requirement rationale and a scenario flow that no longer match are reported.
    expect(drift(el('REQ-SYS-008'), d('REQ-SYS-008'))).toEqual([])
    expect(drift({ ...el('REQ-SYS-008'), attributes: { ...el('REQ-SYS-008').attributes, rationale: 'changed rationale' } }, d('REQ-SYS-008'))).toEqual(['rationale "changed rationale"'])
    expect(drift({ ...el('SCN-004'), attributes: { ...el('SCN-004').attributes, trigger: 'changed trigger' } }, d('SCN-004'))).toEqual(['trigger "changed trigger"'])
  })
})
