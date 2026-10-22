// Compare two revisions of an item (design §5): block level by stable id (added, removed, moved, changed) and word level
// inside changed blocks, with an in-house longest-common-subsequence diff (no new dependency). The course introduction
// and the settings are compared field by field, each field acting as a block.
import type { AnyBody, BodyBlock, CourseIntroBody, CourseSettingsBody, ItemKind, SectionBody } from './types'

export type Unit = { id: string; label: string; text: string; raw: string }
export type WordOp = { op: 'eq' | 'add' | 'del'; text: string }
export type UnitDiff = { id: string; label: string; change: 'same' | 'added' | 'removed' | 'changed' | 'moved'; before: string; after: string; words?: WordOp[] }
export type DiffSummary = { added: number; removed: number; changed: number; moved: number; wordDelta: number }

const BLOCK_LABEL: Record<string, string> = { para: 'Paragraph', heading: 'Heading', bullets: 'List', definition: 'Definition', table: 'Table', equation: 'Equation', callout: 'Callout', steps: 'Worked steps', figure: 'Figure', interactive: 'Interactive figure' }

export function blockText(b: BodyBlock): string {
  switch (b.kind) {
    case 'para':
    case 'heading':
      return b.text
    case 'callout':
      return [b.title, b.text].filter(Boolean).join(' — ')
    case 'bullets':
      return b.items.map((i) => (typeof i === 'string' ? `• ${i}` : [`• ${i.text}`, ...i.sub.map((s) => `  – ${s}`)].join('\n'))).join('\n')
    case 'definition':
      return `${b.term}: ${b.text}`
    case 'table':
      return [b.header.join(' | '), ...b.rows.map((r) => r.join(' | ')), b.caption ?? ''].join('\n')
    case 'equation':
      return b.display
    case 'steps':
      return b.items.map((s) => `${s.label} ${s.text}`).join('\n')
    case 'figure':
      return `${b.figure.id}: ${b.figure.caption}`
    case 'interactive':
      return b.ifig
  }
}

/** The comparable units of a body. */
export function units(kind: ItemKind, body: AnyBody): Unit[] {
  if (kind === 'learn-section') return (body as SectionBody).blocks.map((b) => ({ id: b.id, label: `${BLOCK_LABEL[b.kind] ?? b.kind} #${b.id}`, text: blockText(b), raw: JSON.stringify(b) }))
  if (kind === 'course-settings') {
    const s = body as CourseSettingsBody
    return [
      { id: 'department_label', label: 'Department label', text: s.department_label, raw: s.department_label },
      { id: 'department_label_verified', label: 'Verified by faculty', text: s.department_label_verified ? 'yes' : 'no', raw: String(s.department_label_verified) },
    ]
  }
  const c = body as CourseIntroBody
  const u = (id: string, label: string, text: string): Unit => ({ id, label, text, raw: text })
  return [
    u('title', 'Title', c.title),
    u('lede', 'Lede', c.lede),
    ...c.what.map((p, i) => u(`what.${i}`, `What the course teaches ¶${i + 1}`, p.text)),
    ...c.phases.map((p, i) => u(`phases.${i}`, `Two phases ¶${i + 1}`, p.text)),
    ...c.aerolink.map((t, i) => u(`aerolink.${i}`, `AeroLink sentence ${i + 1}`, t)),
    ...c.enterprise.map((t, i) => u(`enterprise.${i}`, `Enterprise sentence ${i + 1}`, t)),
    ...c.submit.map((s, i) => u(`submit.${i}`, `Submission ${i + 1}`, `${s.what}: ${s.detail}`)),
    u('submitNote', 'Submission note', c.submitNote),
    ...c.stages.map((s) => u(`stage.${s.id}`, `Stage ${s.label}`, s.line)),
    u('savedStatic', 'Static-edition note', c.savedStatic),
    u('start', 'Start button', c.start),
  ]
}

const tokens = (s: string) => s.match(/\s+|[^\s]+/g) ?? []
/** Word-level LCS diff; very long inputs fall back to a whole replacement to bound the cost. */
export function wordDiff(a: string, b: string): WordOp[] {
  const x = tokens(a)
  const y = tokens(b)
  if (x.length * y.length > 4_000_000) return [{ op: 'del', text: a }, { op: 'add', text: b }]
  const n = x.length
  const m = y.length
  const L: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1])
  const out: WordOp[] = []
  const push = (op: WordOp['op'], t: string) => {
    const last = out[out.length - 1]
    if (last && last.op === op) last.text += t
    else out.push({ op, text: t })
  }
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (x[i] === y[j]) {
      push('eq', x[i])
      i++
      j++
    } else if (L[i + 1][j] >= L[i][j + 1]) push('del', x[i++])
    else push('add', y[j++])
  }
  while (i < n) push('del', x[i++])
  while (j < m) push('add', y[j++])
  return out
}

/** Ids of `common` (in `a` order) that keep their relative order in `b`: the longest increasing run of positions. */
function stableIds(a: string[], b: string[]): Set<string> {
  const pos = new Map(b.map((id, i) => [id, i]))
  const seq = a.filter((id) => pos.has(id))
  const p = seq.map((id) => pos.get(id)!)
  const tails: number[] = []
  const prev: number[] = new Array(p.length).fill(-1)
  const idx: number[] = []
  for (let i = 0; i < p.length; i++) {
    let lo = 0
    let hi = tails.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (p[idx[mid]] < p[i]) lo = mid + 1
      else hi = mid
    }
    if (lo > 0) prev[i] = idx[lo - 1]
    idx[lo] = i
    tails[lo] = p[i]
  }
  const keep = new Set<string>()
  for (let k = idx[tails.length - 1] ?? -1; k >= 0; k = prev[k]) keep.add(seq[k])
  return keep
}

const words = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length

export function diffBodies(kind: ItemKind, before: AnyBody | null, after: AnyBody): { units: UnitDiff[]; summary: DiffSummary } {
  const A = before ? units(kind, before) : []
  const B = units(kind, after)
  const aMap = new Map(A.map((u) => [u.id, u]))
  const bMap = new Map(B.map((u) => [u.id, u]))
  const stable = stableIds(A.map((u) => u.id), B.map((u) => u.id))
  const out: UnitDiff[] = []
  for (const u of B) {
    const old = aMap.get(u.id)
    if (!old) out.push({ id: u.id, label: u.label, change: 'added', before: '', after: u.text, words: [{ op: 'add', text: u.text }] })
    else if (old.raw !== u.raw) out.push({ id: u.id, label: u.label, change: 'changed', before: old.text, after: u.text, words: wordDiff(old.text, u.text) })
    else out.push({ id: u.id, label: u.label, change: stable.has(u.id) ? 'same' : 'moved', before: old.text, after: u.text })
  }
  // removed units are listed where they stood in the earlier revision (after the unit that preceded them)
  A.forEach((u, i) => {
    if (bMap.has(u.id)) return
    const anchor = A.slice(0, i).reverse().find((x) => bMap.has(x.id))
    const at = anchor ? out.findIndex((d) => d.id === anchor.id) + 1 : 0
    out.splice(at, 0, { id: u.id, label: u.label, change: 'removed', before: u.text, after: '', words: [{ op: 'del', text: u.text }] })
  })
  const summary: DiffSummary = {
    added: out.filter((d) => d.change === 'added').length,
    removed: out.filter((d) => d.change === 'removed').length,
    changed: out.filter((d) => d.change === 'changed').length,
    moved: out.filter((d) => d.change === 'moved').length,
    wordDelta: B.reduce((s, u) => s + words(u.text), 0) - A.reduce((s, u) => s + words(u.text), 0),
  }
  return { units: out, summary }
}

export const summaryText = (s: DiffSummary) =>
  [s.changed && `${s.changed} changed`, s.added && `${s.added} added`, s.removed && `${s.removed} removed`, s.moved && `${s.moved} moved`].filter(Boolean).join(', ') || 'no change'
