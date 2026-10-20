// Week 4, Session 2 lecture figures (information management, data and information, producer → consumer → decision, the
// route rule, metadata, AI capabilities, the AeroLink information view, the dispatch answer, the audit, the evaluation and
// the lab launch). Original drawings; every number, name and identifier is imported from
// src/content/lectures/week04/aerolinkCase.ts and labBrief.ts; every other label is a phrase from the slide or lesson
// text. AeroLink is FICTIONAL. Canvas sizes and the 12 pt label rule: LectureWeek4Parts.tsx. Review: new-pending-review.
import type { ComponentType } from 'react'
import { AI_CAPABILITIES, COUNTS, DISPATCH_ANSWER, EVALUATION, FEEDS_FORWARD, FINDINGS, INFORMATION, fn, info, uncoveredRoutes } from '../../content/lectures/week04/aerolinkCase'
import { CONSISTENCY_CHECKS, LAB4_MINIMUMS as MIN, VIEW_KINDS, REQUIRED_VIEW_KINDS } from '../../content/lectures/week04/labBrief'
import { Arrow, Card, CheckBox, FB_W, Lines, MIN_FB, Shape, Svg, wrap, type Tone } from './LectureWeek4Parts'

const S = MIN_FB
const L = S + 2

export function ImRingFigure({ alt }: { alt: string }) {
  const verbs = ['generate', 'obtain', 'confirm', 'transform', 'retain', 'retrieve', 'disseminate', 'dispose']
  const cx = 450
  const cy = 260
  const r = 190
  return (
    <Svg w={FB_W} h={520} alt={alt}>
      {() => (
        <g>
          <circle cx={cx} cy={cy} r={r} fill="none" style={{ stroke: 'var(--wb-accent)', strokeWidth: 3 }} />
          <Lines x={cx} y={cy - 16} lines={['weather item']} size={L} weight={700} />
          <Lines x={cx} y={cy + 20} lines={['through its life cycle']} size={S} ink="muted" />
          {verbs.map((v, k) => {
            const a = (k / verbs.length) * 2 * Math.PI - Math.PI / 2
            const x = cx + r * Math.cos(a)
            const y = cy + r * Math.sin(a)
            const w = v.length * 13 + 28
            return (
              <g key={v}>
                <Shape x={x - w / 2} y={y - 20} w={w} h={40} tone={v === 'transform' ? 'soft' : 'box'} rx={20} />
                <Lines x={x} y={y} lines={[v]} size={S} weight={600} />
              </g>
            )
          })}
        </g>
      )}
    </Svg>
  )
}

export function DataInformationFigure({ alt }: { alt: string }) {
  const x = info('INFO-003')
  return (
    <Svg w={FB_W} h={480} alt={alt}>
      {(id) => (
        <g>
          <Card x={10} y={60} w={260} h={300} title="data" lines={wrap(x.data, 16)} size={S} />
          <Arrow d="M 275 210 L 315 210" id={id} />
          <Card x={320} y={60} w={290} h={300} title="information" lines={wrap(x.information, 18)} size={S} tone="soft" />
          <Arrow d="M 615 210 L 655 210" id={id} tone="accent" />
          <Card x={660} y={60} w={230} h={300} title="decision" lines={wrap(x.decision, 14)} size={S} tone="ok" />
          <Lines x={295} y={410} lines={['structure, context, analysis']} size={S} ink="muted" />
          <Lines x={720} y={410} lines={['use']} size={S} ink="muted" />
        </g>
      )}
    </Svg>
  )
}

export function PcdTemplateFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB_W} h={480} alt={alt}>
      {(id) => (
        <g>
          <Card x={10} y={60} w={240} h={110} lines={['producer']} size={L} weight={700} />
          <Arrow d="M 255 115 L 325 115" id={id} />
          <Card x={330} y={60} w={240} h={110} lines={['information', 'item']} size={L} weight={700} tone="soft" />
          <Arrow d="M 575 115 L 645 115" id={id} />
          <Card x={650} y={60} w={240} h={110} lines={['consumer']} size={L} weight={700} />
          <Arrow d="M 770 175 L 770 245" id={id} tone="accent" />
          <Shape x={560} y={250} w={330} h={120} tone="warn" strong />
          <Lines x={725} y={290} lines={['decision supported']} size={L} weight={700} />
          <Lines x={725} y={335} lines={['(and the ID it serves)']} size={S} ink="muted" />
          <Lines x={280} y={300} lines={['empty?', 'ask who needs it']} size={S} ink="warn" weight={700} />
        </g>
      )}
    </Svg>
  )
}

export function RouteRuleFigure({ alt }: { alt: string }) {
  const row = (y: number, label: string, ok: boolean, dashed: boolean) => (
    <g>
      <Card x={30} y={y} w={180} h={70} lines={['element A']} size={S} />
      <Card x={690} y={y} w={180} h={70} lines={['element B']} size={S} />
      {dashed ? (
        <>
          <line x1={212} y1={y + 30} x2={688} y2={y + 30} style={{ stroke: 'var(--wb-muted)', strokeWidth: 2 }} strokeDasharray="8 5" />
          <line x1={212} y1={y + 40} x2={688} y2={y + 40} style={{ stroke: 'var(--wb-muted)', strokeWidth: 2 }} strokeDasharray="8 5" />
        </>
      ) : (
        <line x1={212} y1={y + 35} x2={688} y2={y + 35} style={{ stroke: 'var(--wb-accent)', strokeWidth: 5 }} />
      )}
      <Lines x={450} y={y - 16} lines={[label]} size={S} weight={700} ink={ok ? 'accent' : 'bad'} />
      <Lines x={450} y={y + 92} lines={[ok ? 'flow carried ✓' : 'flow has nowhere to go ?']} size={S} ink={ok ? 'accent' : 'bad'} />
    </g>
  )
  return (
    <Svg w={FB_W} h={520} alt={alt}>
      {(id) => (
        <g>
          {row(40, 'agreement only', false, true)}
          {row(220, 'information interface', true, false)}
          <Card x={30} y={400} w={180} h={70} lines={['A']} size={S} />
          <Card x={360} y={400} w={180} h={70} lines={['relay']} size={S} tone="soft" />
          <Card x={690} y={400} w={180} h={70} lines={['B']} size={S} />
          <Arrow d="M 212 435 L 356 435" id={id} tone="accent" />
          <Arrow d="M 542 435 L 686 435" id={id} tone="accent" />
          <Lines x={450} y={500} lines={['a recorded relay: every hop an information interface']} size={S} ink="muted" />
        </g>
      )}
    </Svg>
  )
}

export function MetadataCardFigure({ alt }: { alt: string }) {
  const x = info('INFO-001')
  return (
    <Svg w={FB_W} h={440} alt={alt}>
      {() => (
        <g>
          <Shape x={60} y={40} w={780} h={360} tone="panel" strong />
          <Shape x={60} y={40} w={780} h={70} tone="soft" />
          <Lines x={450} y={75} lines={['owner · producer · status · provenance']} size={S} weight={600} />
          <Lines x={450} y={170} lines={[`${x.id} ${x.name}`]} size={L} weight={700} />
          <Lines x={450} y={230} lines={wrap(x.content, 44)} size={S} ink="muted" />
          <rect x={110} y={300} width={50} height={40} rx={6} style={{ fill: 'var(--wb-warn-soft)', stroke: 'var(--wb-warn)', strokeWidth: 2.4 }} />
          <path d="M 120 300 L 120 285 A 15 15 0 0 1 150 285 L 150 300" fill="none" style={{ stroke: 'var(--wb-warn)', strokeWidth: 3 }} />
          <Lines x={180} y={320} lines={wrap(x.sensitivity, 46)} size={S} anchor="start" ink="warn" weight={600} />
        </g>
      )}
    </Svg>
  )
}

export function AiLoopFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB_W} h={500} alt={alt}>
      {(id) => (
        <g>
          <Card x={10} y={120} w={190} h={90} lines={['input', 'information']} size={S} />
          <Arrow d="M 205 165 L 255 165" id={id} />
          <Card x={260} y={100} w={200} h={130} lines={['AI', 'capability']} size={L} weight={700} tone="soft" strong />
          <Arrow d="M 465 165 L 525 165" id={id} />
          <path d="M 610 95 L 690 165 L 610 235 L 530 165 Z" style={{ fill: 'var(--wb-warn-soft)', stroke: 'var(--wb-warn)', strokeWidth: 2.4 }} />
          <Lines x={610} y={165} lines={['human', 'decides']} size={S} weight={700} />
          <Arrow d="M 695 165 L 745 165" id={id} tone="accent" />
          <Card x={750} y={120} w={140} h={90} lines={['action']} size={S} />
          <Shape x={230} y={280} w={460} h={170} tone="bad" />
          <Lines x={460} y={310} lines={['failure modes']} size={S} weight={700} ink="bad" />
          <Lines x={460} y={375} lines={['missed prediction', 'false alarm', 'shift in the data']} size={S} />
          <Lines x={105} y={250} lines={['only as good', 'as the data']} size={S} ink="muted" />
        </g>
      )}
    </Svg>
  )
}

/** An item name cut at ' and ' when it is too long for its box (the full name is in the alt text and the lesson). */
const short = (name: string) => (name.length > 24 ? name.split(' and ')[0] : name)
export function InfoGraphFigure({ alt }: { alt: string }) {
  const producers = [...new Set(INFORMATION.flatMap((x) => x.producers))]
  const consumers = [...new Set(INFORMATION.flatMap((x) => x.consumers))]
  const span = (n: number) => (n > 1 ? 440 / (n - 1) : 0)
  const py = (k: number) => 32 + k * span(producers.length)
  const cy = (k: number) => 32 + k * span(consumers.length)
  const iy = (k: number) => 32 + k * span(INFORMATION.length)
  const gap = uncoveredRoutes()[0]
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          {INFORMATION.flatMap((x, k) => [
            ...x.producers.map((p) => {
              const missing = gap && x.id === gap.info && p === gap.from
              return <line key={`${x.id}p${p}`} x1={140} y1={py(producers.indexOf(p))} x2={300} y2={iy(k)} style={{ stroke: missing ? 'var(--wb-bad)' : 'var(--wb-muted)', strokeWidth: missing ? 3 : 1.6 }} strokeDasharray={missing ? '8 5' : undefined} />
            }),
            ...x.consumers.map((c) => <line key={`${x.id}c${c}`} x1={600} y1={iy(k)} x2={760} y2={cy(consumers.indexOf(c))} style={{ stroke: 'var(--wb-accent)', strokeWidth: 1.8 }} />),
          ])}
          {producers.map((p, k) => (
            <g key={p}>
              <Shape x={10} y={py(k) - 16} w={130} h={32} rx={6} />
              <Lines x={75} y={py(k)} lines={[p]} size={S} />
            </g>
          ))}
          {INFORMATION.map((x, k) => (
            <g key={x.id}>
              <Shape x={300} y={iy(k) - 21} w={300} h={42} tone="soft" rx={6} />
              <Lines x={450} y={iy(k)} lines={[short(x.name)]} size={S} weight={600} />
            </g>
          ))}
          {consumers.map((c, k) => (
            <g key={c}>
              <Shape x={760} y={cy(k) - 16} w={130} h={32} rx={6} />
              <Lines x={825} y={cy(k)} lines={[c]} size={S} />
            </g>
          ))}
          <Lines x={450} y={522} lines={[`${COUNTS.routesCovered} of ${COUNTS.routes} routes covered; dashed red: no interface`]} size={S} ink="muted" />
        </g>
      )}
    </Svg>
  )
}

/** The driving question answered (review M1): data that cross an interface, decisions made inside the operations center,
 *  and the release back to the aircraft. Left, the outside producers with the data each sends; right, the operations
 *  center panel holding the functions that turn data into the hold and the plan, all feeding the release decision. */
export function AnswerW4Figure({ alt }: { alt: string }) {
  const DA = DISPATCH_ANSWER
  const f = fn(DA.decision)
  const inside = DA.inputs.filter((x) => !x.crosses)
  const crossing = DA.inputs.filter((x) => x.crosses)
  // outside producers: first the data the inside functions are made from, then the inputs that cross straight to FN-011
  const outside = [
    ...inside.filter((x) => x.madeFrom).map((x) => ({ key: x.what, at: x.madeFrom!.at, what: x.madeFrom!.what, via: x.madeFrom!.via, target: x.fn })),
    ...crossing.map((x) => ({ key: x.what, at: x.at, what: x.what, via: x.crosses!.via, target: DA.decision })),
  ]
  // fixed rows (review Mo1/M1 layout): the release lane runs between the first two inside cards at y = 117
  const OUT_Y = [26, 134, 270, 384]
  const IN_Y = [26, 130, 222]
  const insideY = (fnId: string) => IN_Y[Math.max(0, inside.findIndex((x) => x.fn === fnId))]
  const dec = { x: 716, y: 270, w: 166, h: 100 }
  const toAircraft = outside.findIndex((o) => o.at === DA.output.to)
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {(id) => (
        <g>
          <Shape x={330} y={8} w={562} h={452} tone="panel" strong />
          <Lines x={611} y={440} lines={[`${DA.decidedAt} operations center`]} size={S} weight={700} ink="muted" />
          {inside.map((x) => (
            <Card key={x.fn} x={430} y={insideY(x.fn)} w={250} h={80} lines={[x.fn, x.what, ...(x.by ? [`by ${x.by.replace(/^(a|the) /, '')}`] : [])]} size={S} tone="soft" />
          ))}
          {inside.map((x) => (
            <Arrow key={`a${x.fn}`} d={`M 682 ${insideY(x.fn) + 40} L ${dec.x - 4} ${dec.y + 30}`} id={id} tone="accent" />
          ))}
          <Card x={dec.x} y={dec.y} w={dec.w} h={dec.h} title={f.id} lines={wrap(f.name, 12)} size={S} strong />
          {outside.map((o, k) => {
            const y = OUT_Y[k]
            const mid = y + 42
            const ty = o.target === DA.decision ? (mid < dec.y + dec.h ? mid : dec.y + 80) : insideY(o.target) + 40
            const tx = o.target === DA.decision ? dec.x - 4 : 426
            return (
              <g key={o.key}>
                <Card x={8} y={y} w={210} h={84} title={o.at} lines={wrap(o.what, 16)} size={S} />
                <Arrow d={`M 220 ${mid} L 330 ${mid} L ${tx} ${ty}`} id={id} tone="ink" />
                <Lines x={275} y={mid - 18} lines={[o.via]} size={S} weight={700} ink="accent" />
              </g>
            )
          })}
          {toAircraft >= 0 && <Arrow d={`M ${dec.x + 83} ${dec.y - 2} L ${dec.x + 83} 117 L 150 117 L 150 ${OUT_Y[toAircraft] - 4}`} id={id} tone="accent" width={3} />}
          {toAircraft >= 0 && <Lines x={275} y={103} lines={[DA.output.via]} size={S} weight={700} ink="accent" />}
          <Lines x={450} y={500} lines={[`release (${DA.output.info}) goes back to ${DA.output.to} over ${DA.output.via}`]} size={S} weight={700} ink="accent" />
        </g>
      )}
    </Svg>
  )
}

export function AiCardsFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          {AI_CAPABILITIES.map((a, k) => {
            const x = 10 + k * 450
            return (
              <g key={a.id}>
                <Shape x={x} y={10} w={430} h={520} tone="panel" strong />
                <Lines x={x + 215} y={40} lines={[`${a.id} ${a.name}`]} size={S} weight={700} />
                <Lines x={x + 20} y={84} lines={[`in: ${a.inputs.join(', ')} · host ${a.host}`]} size={S} anchor="start" ink="muted" />
                <Lines x={x + 20} y={130} lines={['oversight']} size={S} anchor="start" weight={700} ink="accent" />
                <Lines x={x + 20} y={200} lines={wrap(a.oversight, 30).slice(0, 4)} size={S} anchor="start" />
                <Lines x={x + 20} y={290} lines={['failure']} size={S} anchor="start" weight={700} ink="bad" />
                <Lines x={x + 20} y={400} lines={wrap(a.failure, 30).slice(0, 7)} size={S} anchor="start" />
              </g>
            )
          })}
        </g>
      )}
    </Svg>
  )
}

export function AuditFigure({ alt }: { alt: string }) {
  const short = ['natural system as producer', 'logical element → decision record', 'route with no interface']
  return (
    <Svg w={FB_W} h={500} alt={alt}>
      {(id) => (
        <g>
          {FINDINGS.slice(0, 3).map((f, k) => (
            <g key={f.id}>
              <Shape x={10} y={20 + k * 160} w={540} h={130} tone="bad" />
              <Lines x={30} y={55 + k * 160} lines={[`${f.id}: ${f.where}`]} size={L} weight={700} anchor="start" ink="bad" />
              <Lines x={30} y={105 + k * 160} lines={[short[k]]} size={S} anchor="start" />
              <Arrow d={`M 555 ${85 + k * 160} L 640 ${85 + k * 160}`} id={id} tone="accent" />
              <Card x={645} y={30 + k * 160} w={245} h={110} lines={wrap(['weather service EXT-007', 'physical elements', 'decided in Week 5'][k], 14)} size={S} tone="ok" />
            </g>
          ))}
        </g>
      )}
    </Svg>
  )
}

export function EvaluationFigure({ alt }: { alt: string }) {
  const tone: Record<string, Tone> = { meets: 'ok', margin: 'soft', open: 'warn' }
  const rowH = 54
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          <Lines x={20} y={20} lines={['item']} size={S} weight={700} anchor="start" />
          <Lines x={750} y={20} lines={['verdict']} size={S} weight={700} />
          {EVALUATION.map((r, k) => (
            <g key={r.id}>
              <Shape x={10} y={42 + k * rowH} w={880} h={rowH - 6} tone={k % 2 ? 'box' : 'panel'} rx={4} />
              <Lines x={20} y={42 + k * rowH + (rowH - 6) / 2} lines={[`${r.id} ${r.item.replace(/ \(.*\)$/, '')}`]} size={S} anchor="start" />
              <Shape x={680} y={46 + k * rowH} w={140} h={rowH - 14} tone={tone[r.verdict]} rx={18} />
              <Lines x={750} y={42 + k * rowH + (rowH - 6) / 2} lines={[r.verdict]} size={S} weight={700} />
            </g>
          ))}
        </g>
      )}
    </Svg>
  )
}

export function ConsistencyHubFigure({ alt }: { alt: string }) {
  const pos = [
    { x: 10, y: 20 },
    { x: 470, y: 20 },
    { x: 10, y: 360 },
    { x: 470, y: 360 },
  ]
  return (
    <Svg w={FB_W} h={520} alt={alt}>
      {() => (
        <g>
          {CONSISTENCY_CHECKS.map((c, k) => (
            <g key={c}>
              <line x1={450} y1={260} x2={pos[k].x + 210} y2={pos[k].y + 70} style={{ stroke: 'var(--wb-accent)', strokeWidth: 2 }} />
              <Card x={pos[k].x} y={pos[k].y} w={420} h={140} lines={wrap(c, 34)} size={S} />
            </g>
          ))}
          <Card x={330} y={225} w={240} h={70} lines={['one register of IDs']} size={S} weight={700} tone="soft" strong />
        </g>
      )}
    </Svg>
  )
}

export function FeedsForwardW4Figure({ alt }: { alt: string }) {
  const rowH = 70
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {(id) => (
        <g>
          <Card x={10} y={200} w={150} h={120} lines={['Week 4']} size={L} weight={700} tone="soft" strong />
          {FEEDS_FORWARD.map((f, k) => (
            <g key={f.week}>
              <Arrow d={`M 165 260 L 300 ${30 + k * rowH + 25}`} id={id} tone="muted" />
              <Shape x={305} y={8 + k * rowH} w={585} h={rowH - 10} rx={6} />
              <Lines x={320} y={8 + k * rowH + (rowH - 10) / 2} lines={[f.week]} size={S} weight={700} anchor="start" ink="accent" />
              <Lines x={450} y={8 + k * rowH + (rowH - 10) / 2} lines={[f.artifact.split(' and ')[0]]} size={S} anchor="start" />
            </g>
          ))}
        </g>
      )}
    </Svg>
  )
}

export function LabChecklistW4Figure({ alt }: { alt: string }) {
  const parts = [
    { t: 'Views', l: `${MIN.viewpoints} viewpoints, purpose and concerns` },
    { t: 'Functions', l: `${MIN.functions} functions, ${MIN.groups} first-level groups` },
    { t: 'Allocation', l: `${MIN.logical} logical, ${MIN.physical} physical, ${MIN.decisions} decision` },
    { t: 'Information', l: `${MIN.information} items, ${MIN.ai} AI card` },
  ]
  return (
    <Svg w={FB_W} h={500} alt={alt}>
      {() => (
        <g>
          {parts.map((p, k) => (
            <g key={p.t}>
              <Shape x={10} y={20 + k * 118} w={880} h={100} tone={k % 2 ? 'box' : 'panel'} />
              <CheckBox x={30} y={50 + k * 118} size={40} ticked={false} />
              <Lines x={95} y={70 + k * 118} lines={[p.t]} size={L} weight={700} anchor="start" />
              <Lines x={870} y={70 + k * 118} lines={[p.l]} size={S} anchor="end" />
            </g>
          ))}
        </g>
      )}
    </Svg>
  )
}

export function ViewTemplateFigure({ alt }: { alt: string }) {
  const kinds = REQUIRED_VIEW_KINDS.map((k) => VIEW_KINDS.find((v) => v.id === k)!.label)
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          <Lines x={20} y={30} lines={['view: purpose question · stakeholders and concerns']} size={S} weight={700} anchor="start" />
          {kinds.map((k, j) => (
            <g key={k}>
              <Shape x={10} y={55 + j * 46} w={880} h={40} tone={j % 2 ? 'box' : 'panel'} rx={4} />
              <Lines x={25} y={75 + j * 46} lines={[k]} size={S} anchor="start" weight={600} />
            </g>
          ))}
          <line x1={10} y1={300} x2={890} y2={300} className="f-divider" style={{ stroke: 'var(--wb-muted)', strokeWidth: 2 }} />
          <Lines x={20} y={325} lines={['scenario step → function (verb + object, input, output)']} size={S} weight={700} anchor="start" />
          {[0, 1, 2, 3].map((j) => (
            <g key={j}>
              <Shape x={10} y={350 + j * 46} w={300} h={40} rx={4} />
              <Lines x={25} y={370 + j * 46} lines={[`step ${j + 1}`]} size={S} anchor="start" ink="muted" />
              <Shape x={330} y={350 + j * 46} w={560} h={40} tone="soft" rx={4} />
            </g>
          ))}
        </g>
      )}
    </Svg>
  )
}

export function CheckCardW4Figure({ alt }: { alt: string }) {
  const items = ['every function an action: verb + object', 'every function with an input and an output', 'every step served, or a gap recorded']
  return (
    <Svg w={FB_W} h={420} alt={alt}>
      {() => (
        <g>
          <Shape x={20} y={20} w={860} h={380} tone="panel" strong />
          {items.map((t, k) => (
            <g key={t}>
              <CheckBox x={50} y={70 + k * 110} size={44} ticked={false} />
              <Lines x={120} y={92 + k * 110} lines={[t]} size={L} anchor="start" />
            </g>
          ))}
        </g>
      )}
    </Svg>
  )
}

export function SevenDaysW4Figure({ alt }: { alt: string }) {
  const days = [
    { d: '1–2', t: ['scenario', 'walks'] },
    { d: '2', t: ['trace and', 'decompose'] },
    { d: '3–4', t: ['allocation', 'criteria'] },
    { d: '4', t: ['decision', 'record'] },
    { d: '4–5', t: ['information', 'view'] },
    { d: '5–6', t: ['AI card,', 'checks'] },
    { d: '7', t: ['integrate,', 'upload'] },
  ]
  return (
    <Svg w={FB_W} h={420} alt={alt}>
      {() => (
        <g>
          <line x1={20} y1={120} x2={880} y2={120} className="f-axis" style={{ strokeWidth: 3 }} />
          {days.map((d, k) => (
            <g key={d.d + k}>
              <circle cx={60 + k * 128} cy={120} r={14} style={{ fill: 'var(--wb-accent)' }} />
              <Lines x={60 + k * 128} y={70} lines={[`day ${d.d}`]} size={S} weight={700} />
              <Lines x={60 + k * 128} y={200} lines={d.t} size={S} />
            </g>
          ))}
        </g>
      )}
    </Svg>
  )
}

export const WEEK4_S2_FIGURES: Record<string, { title: string; C: ComponentType<{ alt: string }> }> = {
  'w4s2-im-ring': { title: 'The information life cycle', C: ImRingFigure },
  'w4s2-data-information': { title: 'Data, information, decision', C: DataInformationFigure },
  'w4s2-pcd-template': { title: 'Producer, consumer, decision', C: PcdTemplateFigure },
  'w4s2-route-rule': { title: 'Flows need information interfaces', C: RouteRuleFigure },
  'w4s2-metadata-card': { title: 'Metadata and sensitivity', C: MetadataCardFigure },
  'w4s2-ai-loop': { title: 'An AI capability with a human in the loop', C: AiLoopFigure },
  'w4s2-info-graph': { title: 'The AeroLink information view', C: InfoGraphFigure },
  'w4s2-answer': { title: 'The driving question, answered', C: AnswerW4Figure },
  'w4s2-ai-cards': { title: 'Two AI capability cards', C: AiCardsFigure },
  'w4s2-audit': { title: 'Two reference defects and one new gap', C: AuditFigure },
  'w4s2-evaluation': { title: 'The architecture evaluated', C: EvaluationFigure },
  'w4s2-consistency-hub': { title: 'Four consistency checks', C: ConsistencyHubFigure },
  'w4s2-feeds-forward': { title: 'What Week 4 feeds', C: FeedsForwardW4Figure },
  'w4s2-lab-checklist': { title: 'Lab L4 at a glance', C: LabChecklistW4Figure },
  'w4s2-view-template': { title: 'The in-class template', C: ViewTemplateFigure },
  'w4s2-check-card': { title: 'The scenario-walk check card', C: CheckCardW4Figure },
  'w4s2-seven-days': { title: 'The next seven days', C: SevenDaysW4Figure },
}
