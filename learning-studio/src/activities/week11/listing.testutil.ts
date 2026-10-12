// Test helper (not bundled by any component): a deliberately small reader for the Week 11 listings, enough to compare
// the TypeScript encodings of the worked and seeded flows and state machines with the .sysml files, edge by edge and
// guard by guard (W11-F23). It understands only the shorthand forms those listings use.
import { DONE, START, type FlowModel, type NodeKind } from './flow'
import type { StateMachine } from './states'

/** The body lines of the block whose header line matches `header` (up to the closing brace at the same indent). */
export function blockLines(src: string, header: RegExp): string[] {
  const lines = src.split(/\r?\n/)
  const i = lines.findIndex((l) => header.test(l))
  if (i < 0) throw new Error(`no block ${header}`)
  const indent = lines[i].match(/^\s*/)![0]
  const out: string[] = []
  for (let j = i + 1; j < lines.length; j++) {
    if (lines[j] === `${indent}}` || lines[j].trimEnd() === `${indent}}`) break
    out.push(lines[j].trim())
  }
  return out
}

/** Reads a flow written with first/then/if/else shorthands (S10 sl.33–38; S06 p.135–136). */
export function parseFlow(body: string[]): FlowModel {
  const nodes: FlowModel['nodes'] = []
  const edges: FlowModel['edges'] = []
  let prev = ''
  const fnOf = (rest: string) => rest.match(/:>\s*Logical::'(FN-\d{3})'/)?.[1]
  const declare = (kind: NodeKind, id: string, rest: string) => {
    const fn = fnOf(rest)
    nodes.push({ id, kind, covers: [], ...(fn ? { fn } : {}) })
  }
  for (const l of body) {
    let m: RegExpMatchArray | null
    if (/^first start;/.test(l)) prev = START
    else if ((m = l.match(/^then (action|decide|merge) (\w+)(.*)$/))) {
      declare(m[1] as NodeKind, m[2], m[3])
      edges.push({ from: prev, to: m[2] })
      prev = m[2]
    } else if ((m = l.match(/^(action|decide|merge) (\w+)(.*)$/))) {
      declare(m[1] as NodeKind, m[2], m[3])
      prev = m[2]
    } else if ((m = l.match(/^then (\w+);$/))) edges.push({ from: prev, to: m[1] === 'done' ? DONE : m[1] })
    else if ((m = l.match(/^if (.+) then (\w+);$/))) edges.push({ from: prev, to: m[2], guard: m[1].trim() })
    else if ((m = l.match(/^else (\w+);$/))) edges.push({ from: prev, to: m[1], guard: 'else' })
  }
  return { nodes, edges }
}

/** Reads a state definition written with full or shorthand transitions (S10 sl.48–49). Transition names are ignored. */
export function parseMachine(body: string[]): StateMachine {
  const states: string[] = []
  const initial: string[] = []
  const transitions: StateMachine['transitions'] = []
  let prev = ''
  let k = 0
  for (const l of body) {
    let m: RegExpMatchArray | null
    if ((m = l.match(/^first start then (\w+);/))) initial.push(m[1])
    else if ((m = l.match(/^state (\w+)\b/))) {
      states.push(m[1])
      prev = m[1]
    } else if ((m = l.match(/^accept ((?:after|at|when) .+?|\w+)(?: if (.+?))? then (\w+);/))) transitions.push({ id: `t${k++}`, from: prev, trigger: m[1], to: m[3], ...(m[2] ? { guard: m[2] } : {}) })
    else if ((m = l.match(/^transition (\w+) first (\w+) accept (\w+)(?: if (.+?))? then (\w+);/))) transitions.push({ id: m[1], from: m[2], trigger: m[3], to: m[5], ...(m[4] ? { guard: m[4] } : {}) })
  }
  return { name: 'parsed', states, initial, transitions }
}

export const edgeSet = (f: FlowModel) => f.edges.map((e) => `${e.from} -> ${e.to}${e.guard ? ` [${e.guard}]` : ''}`).sort()
export const nodeSet = (f: FlowModel) => f.nodes.map((n) => `${n.id}:${n.kind}${n.fn ? `:${n.fn}` : ''}`).sort()
export const transitionSet = (m: StateMachine) => m.transitions.map((t) => `${t.from} -${t.trigger}${t.guard ? ` [${t.guard}]` : ''}-> ${t.to}`).sort()
