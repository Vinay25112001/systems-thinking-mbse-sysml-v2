// Week 4, Session 1 lecture figures (architecture and its description, viewpoints from concerns, functions and
// decomposition, allocation, the decision record and the enterprise view). Original drawings: none redraws a SEBoK, MITRE
// or DoD figure; the description-model figure is our own drawing of the relationship MITRE states (R62 p.342). Every
// number, name and identifier is imported from src/content/lectures/week04/aerolinkCase.ts and labBrief.ts; every other
// label is a phrase from the slide or lesson text. AeroLink is FICTIONAL; a figure adds no claim of its own.
// Canvas sizes and the 12 pt label rule: LectureWeek4Parts.tsx. Review status: new-pending-review.
import type { ComponentType } from 'react'
import { CAPABILITIES } from '../../content/lectures/week02/aerolinkCase'
import {
  AGREEMENTS, ARCH_DECISION, CONFIGURATION, COUNTS, FUNCTIONS, GROUPS, MISSION_FUNCTION, PHYSICAL, SCENARIO_WALKS, VIEWPOINTS, fn, functionsOfCapability, functionsOfGroup, logical, physical, scenario,
} from '../../content/lectures/week04/aerolinkCase'
import { ALLOCATION_CRITERIA } from '../../content/lectures/week04/labBrief'
import { Arrow, Card, CheckBox, Chip, Craft, FB_W, FW_H, FW_W, Lines, MIN_FB, MIN_FW, Shape, Svg, wrap } from './LectureWeek4Parts'

const S = MIN_FB // 22: smallest label on figure-bullets canvases
const SW = MIN_FW // 20: smallest label on full-width canvases
const L = S + 2

// ------------------------------------------------------------------------------------------------ framing
export function DrivingQuestionW4Figure({ alt }: { alt: string }) {
  const items = [
    { y: 90, label: 'fault status', from: 'hangar' },
    { y: 230, label: 'charge state', from: 'charger' },
    { y: 370, label: 'forecast', from: 'weather source' },
  ]
  return (
    <Svg w={FB_W} h={500} alt={alt}>
      {(id) => (
        <g>
          <Shape x={20} y={360} w={240} h={90} tone="env" />
          <Craft x={140} y={380} s={1.6} />
          <Lines x={140} y={430} lines={['aircraft on the pad']} size={S} ink="muted" />
          {items.map((it) => (
            <g key={it.label}>
              <Card x={290} y={it.y - 40} w={260} h={80} title={`${it.label} ?`} lines={[`from the ${it.from}`]} size={S} tone="soft" />
              <Arrow d={`M 555 ${it.y} L 650 ${250}`} id={id} tone="accent" />
            </g>
          ))}
          <Shape x={655} y={150} w={225} h={200} tone="panel" strong />
          <Lines x={767} y={200} lines={['operations', 'center console']} size={S} weight={700} />
          <Shape x={705} y={270} w={125} h={50} tone="warn" rx={25} />
          <Lines x={767} y={295} lines={['release?']} size={S} weight={700} />
        </g>
      )}
    </Svg>
  )
}

export function WhereW4Figure({ alt }: { alt: string }) {
  const weeks = [
    { x: 20, t: 'Week 1', l: ['needs,', 'concerns'] },
    { x: 190, t: 'Week 2', l: ['scenarios,', 'requirements'] },
    { x: 360, t: 'Week 3', l: ['decision,', 'risks, TPMs'] },
  ]
  const outs = [
    { y: 300, t: 'Week 5 interfaces' },
    { y: 360, t: 'Week 6 roadmap' },
    { y: 420, t: 'Week 10 logical model' },
    { y: 480, t: 'Week 11 physical model' },
  ]
  return (
    <Svg w={FB_W} h={530} alt={alt}>
      {(id) => (
        <g>
          {weeks.map((w) => (
            <Card key={w.t} x={w.x} y={40} w={160} h={130} title={w.t} lines={w.l} size={S} />
          ))}
          <Card x={560} y={30} w={320} h={150} title="Week 4" lines={['architecture and', 'information view']} size={L} tone="soft" strong />
          <Arrow d="M 520 105 L 555 105" id={id} />
          {outs.map((o) => (
            <g key={o.t}>
              <Arrow d={`M 720 185 L 720 ${o.y - 8} L 600 ${o.y - 8}`} id={id} tone="accent" />
              <Lines x={590} y={o.y - 8} lines={[o.t]} size={S} anchor="end" />
            </g>
          ))}
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ description
export function IcebergFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB_W} h={520} alt={alt}>
      {() => (
        <g>
          <path d="M 330 160 L 450 40 L 570 160 Z" className="f-shape" />
          <line x1={20} y1={170} x2={880} y2={170} style={{ stroke: 'var(--wb-accent)', strokeWidth: 3 }} strokeDasharray="10 6" />
          <path d="M 250 175 L 650 175 L 760 330 L 600 500 L 300 500 L 140 330 Z" className="f-env" />
          <Lines x={450} y={110} lines={['description']} size={S} weight={700} />
          <Lines x={700} y={70} lines={['views, tables,', 'diagrams']} size={S} ink="muted" />
          <Lines x={860} y={145} lines={['waterline']} size={S} anchor="end" ink="accent" />
          <Lines x={450} y={230} lines={['architecture']} size={L} weight={700} />
          <Lines x={450} y={350} lines={['concepts · elements', 'relationships', 'principles of design', 'and evolution']} size={S} />
        </g>
      )}
    </Svg>
  )
}

export function DescriptionModelFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {(id) => (
        <g>
          <Card x={20} y={20} w={200} h={70} lines={['system']} size={S} weight={700} />
          <Card x={20} y={150} w={200} h={70} lines={['architecture']} size={S} weight={700} />
          <Card x={20} y={280} w={200} h={70} lines={['description']} size={S} weight={700} tone="soft" />
          <Card x={20} y={420} w={95} h={60} lines={['views']} size={S} />
          <Card x={125} y={420} w={95} h={60} lines={['models']} size={S} />
          <Card x={250} y={280} w={200} h={70} lines={['framework']} size={S} weight={700} />
          <Arrow d="M 120 92 L 120 146" id={id} />
          <Lines x={130} y={120} lines={['has']} size={S} anchor="start" ink="muted" />
          <Arrow d="M 120 222 L 120 276" id={id} />
          <Lines x={130} y={250} lines={['communicated by']} size={S} anchor="start" ink="muted" />
          <Arrow d="M 68 352 L 68 416" id={id} />
          <Arrow d="M 172 352 L 172 416" id={id} />
          <Arrow d="M 248 315 L 224 315" id={id} tone="accent" />
          <Lines x={350} y={380} lines={['sets requirements', 'for the description']} size={S} ink="accent" />
          <Shape x={490} y={20} w={390} h={500} tone="panel" />
          <Lines x={685} y={50} lines={['documents drift']} size={S} weight={700} />
          {[0, 1, 2].map((k) => (
            <g key={k}>
              <Shape x={515 + k * 120} y={80} w={100} h={120} tone={k === 2 ? 'bad' : 'box'} />
              <Lines x={565 + k * 120} y={140} lines={[['circle', 'square', 'old'][k]]} size={S} ink={k === 2 ? 'bad' : 'muted'} />
            </g>
          ))}
          <Lines x={685} y={230} lines={['one element, three drawings']} size={S} ink="muted" />
          <Card x={600} y={290} w={170} h={70} lines={['one model']} size={S} weight={700} tone="soft" />
          {[0, 1, 2].map((k) => (
            <g key={k}>
              <Arrow d={`M 685 362 L ${560 + k * 125} 432`} id={id} tone="accent" />
              <Card x={510 + k * 125} y={436} w={100} h={60} lines={['view']} size={S} />
            </g>
          ))}
        </g>
      )}
    </Svg>
  )
}

export function ConcernChainFigure({ alt }: { alt: string }) {
  const steps = [
    { t: 'stakeholder', e: ['communities'] },
    { t: 'concern', e: ['community', 'noise'] },
    { t: 'viewpoint', e: ['physical', 'viewpoint'] },
    { t: 'view', e: ['vertiport and', 'aircraft view'] },
    { t: 'elements', e: ['pads,', 'aircraft'] },
  ]
  return (
    <Svg w={FB_W} h={420} alt={alt}>
      {(id) => (
        <g>
          {steps.map((s, k) => (
            <g key={s.t}>
              <Card x={10 + k * 180} y={40} w={160} h={90} lines={[s.t]} size={S} weight={700} tone={k === 2 ? 'soft' : 'box'} />
              {k < 4 && <Arrow d={`M ${172 + k * 180} 85 L ${188 + k * 180} 85`} id={id} />}
              <Lines x={90 + k * 180} y={210} lines={s.e} size={S} ink="accent" />
            </g>
          ))}
          <Lines x={450} y={300} lines={['the viewpoint is the rule;', 'the view is what the rule produces']} size={S} ink="muted" />
        </g>
      )}
    </Svg>
  )
}

export function AerolinkViewsFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          {VIEWPOINTS.map((v, k) => {
            const x = 15 + (k % 3) * 295
            const y = 15 + Math.floor(k / 3) * 220
            return <Card key={v.id} x={x} y={y} w={280} h={205} title={v.name.replace(' viewpoint', '')} lines={[...wrap(v.concerns.join(' '), 16)]} size={S} tone={v.kind === 'information' ? 'soft' : 'box'} />
          })}
          <Shape x={15} y={470} w={870} h={56} tone="ok" />
          <Lines x={450} y={498} lines={[`${COUNTS.concernsCovered} of ${COUNTS.concerns} concerns answered`]} size={L} weight={700} />
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ functions
export function FunctionBoxFigure({ alt }: { alt: string }) {
  const f = fn('FN-006')
  return (
    <Svg w={FB_W} h={460} alt={alt}>
      {(id) => (
        <g>
          <Card x={330} y={150} w={240} h={140} title={f.id} lines={wrap(f.name, 14)} size={L} tone="soft" strong />
          {f.inputs.map((x, k) => (
            <g key={x.item}>
              <Arrow d={`M 20 ${185 + k * 70} L 325 ${185 + k * 70}`} id={id} />
              <Lines x={20} y={k === 0 ? 105 : 345} lines={[...wrap(x.item, 22), `(${x.kind})`]} size={S} anchor="start" />
            </g>
          ))}
          {f.outputs.map((x, k) => (
            <g key={x.item}>
              <Arrow d={`M 575 ${185 + k * 70} L 880 ${185 + k * 70}`} id={id} tone="accent" />
              <Lines x={880} y={k === 0 ? 105 : 345} lines={[...wrap(x.item, 20), `(${x.kind})`]} size={S} anchor="end" />
            </g>
          ))}
          <Lines x={450} y={435} lines={['inputs → transformation → outputs']} size={S} ink="muted" />
        </g>
      )}
    </Svg>
  )
}

export function FunctionalChecklistFigure({ alt }: { alt: string }) {
  const rows: { t: string; a: string; ok: boolean }[] = [
    { t: 'capabilities', a: 'capability → function table', ok: true },
    { t: 'inputs and outputs', a: 'on every function', ok: true },
    { t: 'transformation steps', a: 'scenario walks', ok: true },
    { t: 'sub-function grouping', a: `${COUNTS.groups} first-level functions`, ok: true },
    { t: 'variations per mode', a: 'open: no modes yet', ok: false },
    { t: 'interfaces for the flows', a: 'routes checked; Week 5', ok: true },
  ]
  return (
    <Svg w={FB_W} h={520} alt={alt}>
      {() => (
        <g>
          {rows.map((r, k) => (
            <g key={r.t}>
              <Shape x={20} y={15 + k * 83} w={860} h={72} tone={r.ok ? 'box' : 'warn'} />
              <CheckBox x={40} y={33 + k * 83} size={36} ticked={r.ok} />
              <Lines x={95} y={51 + k * 83} lines={[r.t]} size={S} weight={700} anchor="start" />
              <Lines x={860} y={51 + k * 83} lines={[r.a]} size={S} anchor="end" ink={r.ok ? 'muted' : 'warn'} />
            </g>
          ))}
        </g>
      )}
    </Svg>
  )
}

export function DecompositionTreeFigure({ alt }: { alt: string }) {
  const w = 124
  return (
    <Svg w={FB_W} h={520} alt={alt}>
      {(id) => (
        <g>
          <Card x={100} y={8} w={700} h={108} title="F0" lines={wrap(MISSION_FUNCTION.name, 48)} size={S} tone="soft" />
          {GROUPS.map((g, k) => {
            const x = 8 + k * (w + 4)
            return (
              <g key={g.id}>
                <Arrow d={`M 450 118 L ${x + w / 2} 150`} id={id} tone="muted" />
                <Card x={x} y={152} w={w} h={150} title={g.id} lines={wrap(g.name, 9)} size={S} />
                <Lines x={x + w / 2} y={330} lines={[`${functionsOfGroup(g.id).length} ${functionsOfGroup(g.id).length === 1 ? 'leaf' : 'leaves'}`]} size={S} ink="accent" weight={700} />
              </g>
            )
          })}
          <Shape x={300} y={380} w={300} h={70} tone="bad" />
          <Lines x={450} y={415} lines={['press confirm button']} size={S} strike />
          <Lines x={450} y={480} lines={['a fourth level: too deep']} size={S} ink="bad" weight={700} />
        </g>
      )}
    </Svg>
  )
}

/** A small person glyph: a step where a human decides (a human operation inside the function). */
function Person({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden>
      <circle cx={x} cy={y - 7} r={5.5} style={{ fill: 'var(--wb-accent)' }} />
      <path d={`M ${x - 8} ${y + 11} Q ${x} ${y - 5} ${x + 8} ${y + 11} Z`} style={{ fill: 'var(--wb-accent)' }} />
    </g>
  )
}
/** Slide 12 worksheet (review Mo1): the step text of each scenario with an EMPTY function box, so the class supplies the
 *  functions; the answers are in the worked solution and the lesson, never on the slide face. */
export function ScenarioWalkFigure({ alt }: { alt: string }) {
  const col = (walkIdx: number, x0: number) => {
    const w = SCENARIO_WALKS[walkIdx]
    const steps = w.steps.filter((s, j, all) => all.findIndex((y) => y.step === s.step) === j)
    return steps.map((s, k) => {
      const y = 64 + k * 39
      return (
        <g key={`${w.scenario}-${s.step}`}>
          <Lines x={x0} y={y} lines={[s.step]} size={SW} anchor="start" ink="muted" weight={700} />
          <Lines x={x0 + 40} y={y} lines={[s.short]} size={SW} anchor="start" />
          {s.human && <Person x={x0 + 336} y={y} />}
          <Shape x={x0 + 352} y={y - 15} w={126} h={30} tone="dash" rx={5} />
        </g>
      )
    })
  }
  return (
    <Svg w={FW_W} h={FW_H} alt={alt}>
      {() => (
        <g>
          {[0, 1].map((k) => (
            <g key={k}>
              <Lines x={10 + k * 500} y={16} lines={[`${SCENARIO_WALKS[k].scenario} ${scenario(SCENARIO_WALKS[k].scenario).name}`]} size={SW} weight={700} anchor="start" />
              <Lines x={10 + k * 500 + 415} y={40} lines={['function?']} size={SW} ink="muted" />
              {col(k, 10 + k * 500)}
            </g>
          ))}
        </g>
      )}
    </Svg>
  )
}

export function CapabilityMapFigure({ alt }: { alt: string }) {
  const caps = CAPABILITIES
  const cy = (k: number) => 20 + k * 31
  const fy = (k: number) => 20 + k * 27.5
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          {caps.flatMap((c, a) =>
            functionsOfCapability(c.id).map((f) => {
              const b = FUNCTIONS.findIndex((x) => x.id === f)
              return <line key={`${c.id}-${f}`} x1={150} y1={cy(a)} x2={700} y2={fy(b)} style={{ stroke: 'var(--wb-accent)', strokeWidth: 1.6, opacity: 0.7 }} />
            }),
          )}
          {caps.map((c, a) => (
            <g key={c.id}>
              <Shape x={20} y={cy(a) - 13} w={130} h={26} tone={functionsOfCapability(c.id).length ? 'box' : 'warn'} rx={5} />
              <Lines x={85} y={cy(a)} lines={[c.id]} size={S} />
            </g>
          ))}
          {caps.map((c, a) => (!functionsOfCapability(c.id).length ? <Lines key={`t${c.id}`} x={160} y={cy(a)} lines={['constraint: no function']} size={S} anchor="start" ink="warn" /> : null))}
          {FUNCTIONS.map((f, b) => (
            <g key={f.id}>
              <Shape x={700} y={fy(b) - 13} w={180} h={26} tone={f.provenance === 'proposed' ? 'soft' : 'box'} rx={5} />
              <Lines x={790} y={fy(b)} lines={[f.id]} size={S} />
            </g>
          ))}
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ allocation
export function ThreePlanesFigure({ alt }: { alt: string }) {
  const f = fn('FN-006')
  const planes = [
    { y: 30, t: 'functional', e: `${f.id} ${f.name}` },
    { y: 200, t: 'logical', e: `${f.log} ${logical(f.log).name}` },
    { y: 370, t: 'physical', e: `${f.phy} ${physical(f.phy).name}` },
  ]
  return (
    <Svg w={FB_W} h={520} alt={alt}>
      {(id) => (
        <g>
          {planes.map((p, k) => (
            <g key={p.t}>
              <path d={`M 80 ${p.y + 120} L 180 ${p.y} L 860 ${p.y} L 760 ${p.y + 120} Z`} className="f-env" />
              <Lines x={60} y={p.y + 60} lines={[p.t]} size={S} weight={700} anchor="start" />
              <Card x={330} y={p.y + 30} w={320} h={60} lines={[p.e]} size={S} tone={k === 0 ? 'soft' : 'box'} />
              {k < 2 && <Arrow d={`M 490 ${p.y + 92} L 490 ${p.y + 196}`} id={id} tone="accent" />}
            </g>
          ))}
          <Lines x={860} y={280} lines={[`${f.requirements[0]}`, 'allocated']} size={S} anchor="end" ink="accent" />
        </g>
      )}
    </Svg>
  )
}

export function CriteriaCardsFigure({ alt }: { alt: string }) {
  const f = fn('FN-006')
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {(id) => (
        <g>
          {ALLOCATION_CRITERIA.map((c, k) => {
            const x = 10 + (k % 4) * 222
            const y = 10 + Math.floor(k / 4) * 160
            return <Card key={c.id} x={x} y={y} w={210} h={148} lines={wrap(c.label.replace(/ \(.*\)/, ''), 14)} size={S} tone={c.id === f.criterion ? 'soft' : 'box'} strong={c.id === f.criterion} />
          })}
          <Card x={30} y={380} w={260} h={80} lines={[f.id, f.name]} size={S} />
          <Arrow d="M 295 420 L 600 420" id={id} tone="accent" width={3} />
          <Card x={605} y={380} w={265} h={80} lines={[f.phy, physical(f.phy).name]} size={S} />
          <Lines x={448} y={490} lines={['same type of flow: energy and handshake']} size={S} ink="accent" />
        </g>
      )}
    </Svg>
  )
}

export function PitfallsFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB_W} h={520} alt={alt}>
      {(id) => (
        <g>
          <Card x={20} y={20} w={250} h={70} lines={['requirement']} size={S} />
          <Card x={20} y={220} w={250} h={70} lines={['product']} size={S} tone="bad" />
          <Arrow d="M 145 92 L 145 216" id={id} tone="warn" width={3} />
          <Lines x={145} y={340} lines={['no logical', 'architecture']} size={S} ink="bad" weight={700} />
          <Card x={320} y={20} w={250} h={70} lines={['high-level function']} size={S} />
          <Card x={320} y={220} w={250} h={70} lines={['software module']} size={S} tone="bad" />
          <Arrow d="M 445 92 L 445 216" id={id} tone="warn" width={3} />
          <Lines x={445} y={340} lines={['straight onto', 'technology']} size={S} ink="bad" weight={700} />
          {['function', 'logical', 'physical', 'technology'].map((t, k) => (
            <Card key={t} x={640 + (k % 2) * 110} y={20 + k * 95} w={130} h={64} lines={[t]} size={S} tone={k === 1 ? 'soft' : 'ok'} />
          ))}
          <Arrow d="M 705 86 L 760 113" id={id} tone="accent" />
          <Arrow d="M 815 181 L 760 208" id={id} tone="accent" />
          <Arrow d="M 705 276 L 760 303" id={id} tone="accent" />
          <Lines x={760} y={440} lines={['alternate logical', 'and physical levels']} size={S} weight={700} ink="accent" />
        </g>
      )}
    </Svg>
  )
}

const SHORT_CRITERION: Record<string, string[]> = {
  transformation: ['same', 'transformation'], efficiency: ['similar', 'efficiency'], flow: ['same type', 'of flow'], control: ['central or', 'distributed', 'control'],
  frequency: ['close', 'frequency'], dependability: ['dependability'], environment: ['environment', 'resistance'], enterprise: ['enterprise', 'constraint'],
}
export function AllocationSwimlaneFigure({ alt }: { alt: string }) {
  const ids = ['FN-006', 'FN-008', 'FN-002', 'FN-015']
  const col = [{ x: 5, w: 240 }, { x: 268, w: 215 }, { x: 506, w: 250 }]
  const cx = 778
  const rowH = 66
  return (
    <Svg w={FW_W} h={FW_H} alt={alt}>
      {(id) => (
        <g>
          {['function', 'logical', 'physical', 'criterion'].map((t, k) => (
            <Lines key={t} x={k < 3 ? col[k].x : cx} y={13} lines={[t]} size={SW} weight={700} anchor="start" />
          ))}
          {/* review Mo1: the physical lane header carries the Week 3 configuration the caption and alt text describe */}
          <Lines x={col[2].x} y={37} lines={[`${CONFIGURATION.aircraft} aircraft · ${CONFIGURATION.hubs} hubs · ${CONFIGURATION.turnaroundChargers} turnaround chargers`]} size={SW} anchor="start" ink="accent" weight={600} />
          {ids.map((fid, r) => {
            const f = fn(fid)
            const y = 54 + r * (rowH + 5)
            const cells = [
              [f.id, f.name],
              [f.log, logical(f.log).name],
              [f.phy, physical(f.phy).name],
            ]
            return (
              <g key={fid}>
                {cells.map((c, k) => (
                  <g key={k}>
                    <Shape x={col[k].x} y={y} w={col[k].w} h={rowH} tone={k === 0 ? 'soft' : 'box'} rx={6} />
                    <Lines x={col[k].x + 9} y={y + rowH / 2} lines={[c[0], ...wrap(c[1], k === 1 ? 17 : 20).slice(0, 2)]} size={SW} anchor="start" lh={1.06} />
                    {k < 2 && <Arrow d={`M ${col[k].x + col[k].w + 2} ${y + rowH / 2} L ${col[k + 1].x - 3} ${y + rowH / 2}`} id={id} tone={k === 1 ? 'accent' : 'ink'} />}
                  </g>
                ))}
                <Lines x={cx} y={y + rowH / 2} lines={SHORT_CRITERION[f.criterion]} size={SW} anchor="start" ink="accent" weight={600} />
              </g>
            )
          })}
        </g>
      )}
    </Svg>
  )
}

export function DecisionCardFigure({ alt }: { alt: string }) {
  const d = ARCH_DECISION
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          <Shape x={10} y={10} w={880} h={520} tone="panel" strong />
          <Lines x={30} y={40} lines={[`${d.id}: where do scheduling and dispatch run?`]} size={L} weight={700} anchor="start" />
          {d.alternatives.map((a, k) => (
            <g key={a}>
              <CheckBox x={40} y={78 + k * 50} size={32} ticked={a === d.chosen} />
              <Lines x={90} y={94 + k * 50} lines={[a]} size={S} anchor="start" weight={a === d.chosen ? 700 : 500} />
            </g>
          ))}
          <Shape x={30} y={240} w={840} h={80} tone="soft" />
          <Lines x={450} y={280} lines={['one network-wide assignment;', 'standby removes the single point of failure']} size={S} />
          {d.tests.map((t, k) => (
            <g key={t.id}>
              <Lines x={40} y={355 + k * 58} lines={[t.id]} size={S} weight={700} anchor="start" />
              <Lines x={190} y={355 + k * 58} lines={[t.verdict.startsWith('condition') ? 'condition: booking kept separate from dispatch' : t.verdict.split(' and ')[0]]} size={S} anchor="start" ink={t.id === 'R-009' ? 'warn' : 'accent'} />
            </g>
          ))}
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ enterprise
/** A name cut to whole words of at most `max` characters (the element ID beside it identifies it fully). */
const short = (name: string, max = 22) => {
  const head = name.split(' and ')[0]
  if (head.length <= max) return head
  return head.split(' ').reduce((acc, w) => (acc && `${acc} ${w}`.length > max ? acc : acc ? `${acc} ${w}` : w), '')
}
/** A labeled agreement: two parallel dashed lines (an organizational agreement carries no flow). */
function Agreement({ x1, y1, x2, y2, label, lx, ly, anchor = 'middle' }: { x1: number; y1: number; x2: number; y2: number; label: string; lx: number; ly: number; anchor?: 'start' | 'middle' | 'end' }) {
  const vertical = x1 === x2
  const o = 4
  const st = { stroke: 'var(--wb-muted)', strokeWidth: 2.2 }
  return (
    <g>
      <line x1={vertical ? x1 - o : x1} y1={vertical ? y1 : y1 - o} x2={vertical ? x2 - o : x2} y2={vertical ? y2 : y2 - o} style={st} strokeDasharray="7 4" />
      <line x1={vertical ? x1 + o : x1} y1={vertical ? y1 : y1 + o} x2={vertical ? x2 + o : x2} y2={vertical ? y2 : y2 + o} style={st} strokeDasharray="7 4" />
      <Lines x={lx} y={ly} lines={[label]} size={S} weight={700} ink="accent" anchor={anchor} />
    </g>
  )
}
/** Review Mo1: every agreement the alt text lists is drawn with its two parties. */
export function EnterpriseOwnersFigure({ alt }: { alt: string }) {
  const own = (o: string) => PHYSICAL.filter((p) => p.owner === o)
  const ag = (id: string) => AGREEMENTS.find((a) => a.id === id)!.id
  const aero = own('AeroLink')
  const yOf = (id: string) => 52 + aero.findIndex((p) => p.id === id) * 66
  const y4 = yOf('PHY-004') + 29
  const y5 = yOf('PHY-005') + 29
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          <Shape x={10} y={8} w={420} h={384} tone="soft" />
          <Lines x={170} y={30} lines={['AeroLink']} size={L} weight={700} />
          {aero.map((p) => (
            <Card key={p.id} x={24} y={yOf(p.id)} w={320} h={58} lines={[p.id, short(p.name)]} size={S} />
          ))}
          <path d={`M 346 ${y4} L 358 ${y4} L 358 ${y5} L 346 ${y5}`} fill="none" style={{ stroke: 'var(--wb-muted)', strokeWidth: 2.2 }} strokeDasharray="7 4" />
          <Lines x={364} y={(y4 + y5) / 2} lines={[ag('AG-2')]} size={S} weight={700} ink="accent" anchor="start" />
          <Shape x={520} y={8} w={370} h={250} tone="env" />
          <Lines x={705} y={30} lines={['vertiport operators']} size={L} weight={700} />
          {own('Vertiport operators').map((p, k) => (
            <Card key={p.id} x={534} y={52 + k * 66} w={342} h={58} lines={[p.id, short(p.name)]} size={S} />
          ))}
          <Agreement x1={432} y1={130} x2={518} y2={130} label={ag('AG-1')} lx={475} ly={104} />
          <Card x={540} y={440} w={330} h={64} lines={['electric utility']} size={S} />
          <Agreement x1={705} y1={260} x2={705} y2={438} label={ag('AG-3')} lx={717} ly={350} anchor="start" />
          <Card x={20} y={460} w={200} h={64} lines={['aircraft', 'manufacturer']} size={S} />
          <Card x={240} y={460} w={180} h={64} lines={['insurers']} size={S} />
          <Agreement x1={120} y1={394} x2={120} y2={458} label={ag('AG-4')} lx={132} ly={426} anchor="start" />
          <Agreement x1={330} y1={394} x2={330} y2={458} label={ag('AG-5')} lx={342} ly={426} anchor="start" />
        </g>
      )}
    </Svg>
  )
}

export function ProcessFrameFigure({ alt }: { alt: string }) {
  const steps = ['stakeholder requirements', 'requirements analysis', 'architecture design', 'allocated baseline']
  return (
    <Svg w={FB_W} h={480} alt={alt}>
      {(id) => (
        <g>
          {steps.map((s, k) => (
            <g key={s}>
              <Card x={10 + k * 225} y={120} w={200} h={110} lines={wrap(s, 13)} size={S} tone={k === 2 ? 'soft' : 'box'} strong={k === 2} />
              {k < 3 && <Arrow d={`M ${212 + k * 225} 175 L ${232 + k * 225} 175`} id={id} />}
            </g>
          ))}
          <Arrow d="M 560 116 Q 450 20 330 116" id={id} tone="accent" />
          <Lines x={450} y={40} lines={['derived requirements']} size={S} ink="accent" weight={700} />
          <Chip cx={560} cy={300} text="functional architecture → functional baseline" size={S} />
          <Chip cx={560} cy={370} text="physical architecture → allocated baseline" size={S} />
        </g>
      )}
    </Svg>
  )
}

export const WEEK4_S1_FIGURES: Record<string, { title: string; C: ComponentType<{ alt: string }> }> = {
  'w4s1-driving-question': { title: 'Who decides that an aircraft may fly?', C: DrivingQuestionW4Figure },
  'w4s1-where': { title: 'Where Week 4 sits', C: WhereW4Figure },
  'w4s1-iceberg': { title: 'Architecture and its description', C: IcebergFigure },
  'w4s1-description-model': { title: 'How a description is organized', C: DescriptionModelFigure },
  'w4s1-concern-chain': { title: 'From stakeholder to view', C: ConcernChainFigure },
  'w4s1-aerolink-views': { title: 'AeroLink’s view set', C: AerolinkViewsFigure },
  'w4s1-function-box': { title: 'A function with its inputs and outputs', C: FunctionBoxFigure },
  'w4s1-functional-checklist': { title: 'What a functional view must contain', C: FunctionalChecklistFigure },
  'w4s1-decomposition-tree': { title: 'AeroLink’s functional decomposition', C: DecompositionTreeFigure },
  'w4s1-scenario-walk': { title: 'Walking two scenarios to find functions', C: ScenarioWalkFigure },
  'w4s1-capability-map': { title: 'Capabilities to functions', C: CapabilityMapFigure },
  'w4s1-three-planes': { title: 'Functional, logical and physical planes', C: ThreePlanesFigure },
  'w4s1-criteria-cards': { title: 'SEBoK’s allocation criteria', C: CriteriaCardsFigure },
  'w4s1-pitfalls': { title: 'Two allocation pitfalls', C: PitfallsFigure },
  'w4s1-allocation-swimlane': { title: 'Function to logical to physical, with the reason', C: AllocationSwimlaneFigure },
  'w4s1-decision-card': { title: 'An architecture decision record', C: DecisionCardFigure },
  'w4s1-enterprise-owners': { title: 'The enterprise view: owners and agreements', C: EnterpriseOwnersFigure },
  'w4s1-process-frame': { title: 'The DoD Architecture Design process', C: ProcessFrameFigure },
}
