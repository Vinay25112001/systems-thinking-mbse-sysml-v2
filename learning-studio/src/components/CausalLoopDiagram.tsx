import { Background, Controls, MarkerType, ReactFlow, type Edge, type Node } from '@xyflow/react'
import type { ReactNode } from 'react'
import { useApp } from '../state/AppState'
import { useIsWorkbench } from './surface'

import { ALL_LOOPS, LOOP_LINKS, LOOP_NODES } from '../content/causalLoops'

const label = (id: string) => LOOP_NODES.find((n) => n.id === id)?.label ?? id

/** Workbench layout: positions compressed so the whole diagram fits a centre view at a zoom where 15 px node text
 *  and 14 px polarity labels stay >= 11 px on screen (fit zoom ~0.78 in a 1440 px workbench); fitView never zooms out further than WB_MIN_ZOOM (pan instead). */
const WB_SX = 0.58
const WB_SY = 1
const WB_MIN_ZOOM = 0.7

/** Links and variables on the given loops (for `highlightLoops`). */
function loopMembers(ids: string[]): { links: Set<string>; nodes: Set<string> } {
  const links = new Set<string>()
  const nodes = new Set<string>()
  for (const l of ALL_LOOPS.filter((x) => ids.includes(x.id)))
    l.path.forEach((from, i) => {
      links.add(`${from}-${l.path[(i + 1) % l.path.length]}`)
      nodes.add(from)
    })
  return { links, nodes }
}

/** Optional workbench integration: clicking a variable selects it (`onSelectNode`); `selectedId` outlines it.
 *  `highlightLoops` (Learn stage) keeps the named loops at full strength and dims every other link and variable. */
export function CausalLoopDiagram({ selectedId, onSelectNode, height = 460, collapseText = false, highlightLoops }: { selectedId?: string; onSelectNode?: (id: string) => void; height?: number; collapseText?: boolean; highlightLoops?: string[] } = {}) {
  const hl = highlightLoops?.length ? loopMembers(highlightLoops) : null
  const { resolvedTheme } = useApp()
  const dark = resolvedTheme === 'dark'
  const wb = useIsWorkbench()
  // polarity colours: the classic palette, or the workbench tokens (contrast designed for both themes)
  const plus = wb ? 'var(--wb-accent)' : '#0f766e'
  const minus = wb ? 'var(--wb-bad)' : '#be123c'
  const nodes: Node[] = LOOP_NODES.map((n) => ({
    id: n.id,
    position: wb ? { x: n.x * WB_SX, y: n.y * WB_SY } : { x: n.x, y: n.y },
    data: { label: n.label },
    draggable: true,
    ...(hl && !hl.nodes.has(n.id) ? { className: 'cld-dim' } : {}),
    style: wb
      ? {
          fontSize: 14.5, lineHeight: 1.25, fontWeight: 500, padding: '5px 7px', width: 116, background: 'var(--wb-panel)', color: 'var(--wb-fg)', borderRadius: 4,
          border: selectedId === n.id ? '2px solid var(--wb-accent)' : '1px solid var(--wb-line-strong)', boxShadow: selectedId === n.id ? '0 0 0 3px var(--wb-accent-soft)' : 'none',
        }
      : {
          fontSize: 12, padding: 6, width: 150, background: dark ? '#0f172a' : '#ffffff', color: dark ? '#e2e8f0' : '#0f172a', borderRadius: 8,
          border: selectedId === n.id ? `2px solid ${dark ? '#4fb3d4' : '#0f6e8c'}` : `1px solid ${dark ? '#475569' : '#94a3b8'}`,
        },
  }))
  const edges: Edge[] = LOOP_LINKS.map((l) => {
    const c = l.polarity === '+' ? plus : minus
    const dim = !!hl && !hl.links.has(`${l.from}-${l.to}`)
    return {
      id: `${l.from}-${l.to}`,
      ...(dim ? { className: 'cld-dim' } : {}),
      source: l.from,
      target: l.to,
      label: `${l.polarity}${l.delay ? '  ‖ delay' : ''}${l.condition ? '  (conditional)' : ''}`,
      labelStyle: wb ? { fontWeight: 700, fontSize: 14, fill: c, fontFamily: 'var(--wb-mono)' } : { fontWeight: 800, fontSize: 16, fill: c },
      labelBgStyle: { fill: wb ? 'var(--wb-panel)' : dark ? '#0f172a' : '#ffffff', stroke: c, strokeWidth: 1 },
      labelBgPadding: [6, 2] as [number, number],
      labelBgBorderRadius: wb ? 3 : 6,
      // line pattern carries meaning too (not colour alone): dashed = delay, dotted = conditional link
      style: { stroke: c, strokeWidth: hl && !dim ? 3 : 2, strokeDasharray: l.delay ? '6 4' : l.condition ? '2 4' : undefined },
      markerEnd: { type: MarkerType.ArrowClosed, color: wb ? (l.polarity === '+' ? (dark ? '#4fb3d4' : '#0f6e8c') : dark ? '#f07a70' : '#b3261e') : c },
    }
  })
  const legend = (
    <>
    {hl && (
      <p className={wb ? 'mb-1 mt-0 text-[12.5px] font-semibold' : 'mb-1 text-xs font-semibold'} data-testid="cld-highlight">
        Highlighted: {ALL_LOOPS.filter((l) => highlightLoops!.includes(l.id)).map((l) => `${l.id} ${l.name} (${l.kind.toLowerCase()})`).join('; ')}. Other loops are dimmed.
      </p>
    )}
    <p className={wb ? 'mb-2 mt-0 max-w-[100ch] text-[12.5px] text-wb-muted' : 'mb-2 text-xs text-slate-600 dark:text-slate-400'}>
      Each arrow shows the local effect of a change in the cause with everything else held constant (+ same direction, − opposite direction). Dashed arrows have a delay; dotted arrows exist only under the stated policy or operating range. With waiting time held constant, the net effect of riders on adoption (R1 and B4 together) is positive only while riders are below half the potential market; through waiting (B1) more riders can reduce adoption earlier. Utilisation only gates aircraft orders; demand sets their size.
    </p>
    </>
  )
  return (
    <div>
      {legend}
      <div style={{ height }} className={wb ? 'wb-cld rounded border border-wb-line bg-wb-panel' : 'rounded-lg border border-slate-200 dark:border-slate-800'} role="group" aria-label="Causal-loop diagram (interactive). A full text equivalent follows.">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={wb ? { padding: 0.03, minZoom: WB_MIN_ZOOM } : { padding: 0.12 }}
          minZoom={wb ? 0.4 : undefined}
          nodesConnectable={false}
          elementsSelectable={false}
          onNodeClick={onSelectNode ? (_e, n) => onSelectNode(n.id) : undefined}
          colorMode={dark ? 'dark' : 'light'}
        >
          <Background color={wb ? 'var(--wb-line)' : undefined} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      {/* Text equivalent of the diagram (accessibility); the workbench shows it on demand */}
      <TextWrap collapse={collapseText}>
      <div className={wb ? 'mt-3 grid gap-4 text-[13px] md:grid-cols-2' : 'mt-3 grid gap-4 text-sm md:grid-cols-2'}>
        <div>
          <h4 className="font-semibold">Causal links (text equivalent)</h4>
          <ul className="mt-1 space-y-0.5">
            {LOOP_LINKS.map((l) => (
              <li key={`${l.from}-${l.to}`}>
                {label(l.from)} → {label(l.to)}: <strong>{l.polarity === '+' ? 'same direction (+)' : 'opposite direction (−)'}</strong>
                {l.delay ? ', with delay' : ''}
                {l.condition ? ` (${l.condition})` : ''}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Feedback loops (polarity computed from the links)</h4>
          <ul className="mt-1 space-y-1">
            {ALL_LOOPS.map((l) => (
              <li key={l.id} data-testid={`loop-${l.id}`}>
                <strong>{l.id} {l.kind}</strong> — {l.name}: {l.path.map(label).join(' → ')} → {label(l.path[0])}
                {l.condition ? ` (${l.condition})` : ''}
              </li>
            ))}
          </ul>
        </div>
      </div>
      </TextWrap>
    </div>
  )
}

function TextWrap({ collapse, children }: { collapse: boolean; children: ReactNode }) {
  const wb = useIsWorkbench()
  if (!collapse) return <>{children}</>
  return (
    <details className={wb ? 'wb-disclosure mt-2 text-[13px]' : 'mt-2 text-sm'}>
      <summary className="cursor-pointer font-medium">Text equivalent: every causal link and loop</summary>
      {children}
    </details>
  )
}
