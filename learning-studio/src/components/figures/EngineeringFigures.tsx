// Figures for L6, L7, the summary and the course welcome. Chart values are computed from the dynamics model
// (FICTIONAL); life-cycle and ring labels come from the reviewed w1-lifecycle and w1-emergence text.
import { useId, useState } from 'react'
import { PARTS, WEEKS } from '../../content/course'
import { CONCEPT_CHAIN, learnSection } from '../../content/learn/week01'
import { CROSSOVER_6, FIGURE6_FLEETS, PLATEAU, SERVED_FROZEN, TRIPS_PER_AIRCRAFT_MONTH } from '../../content/learn/dynamicsNumbers'
import { Link } from '../../lib/router'
import { DEFAULT_PARAMS, chargingCapacityOf, fleetCapacityOf } from '../../sim/aerolink'
import { Box, Markers } from './Frame'

const fmt = (x: number) => Math.round(x).toLocaleString('en-US')

// ------------------------------------------------------------------------------------------- L6: capacity crossover
/** Every plotted value comes from the model: the two capacity lines from aerolink.ts, the served series from
 *  SERVED_FROZEN (month-60 runs with the fleet held at each size; review W1F-F04). The crossover is drawn only once the
 *  student has answered the worked step (`revealed`; review W1F-F03). */
export function CapacityCrossover({ alt, revealed = true }: { alt: string; revealed?: boolean }) {
  const [hover, setHover] = useState<number | null>(null)
  const P = DEFAULT_PARAMS
  const xs = FIGURE6_FLEETS
  const charge = chargingCapacityOf(P, P.chargers)
  const L = 70, R = 730, T = 24, B = 300
  const yMax = 25000
  const x0 = xs[0], x1 = xs.at(-1)!
  const sx = (f: number) => L + ((f - x0) / (x1 - x0)) * (R - L)
  const sy = (v: number) => B - (v / yMax) * (B - T)
  const path = (pts: [number, number][]) => pts.map(([f, v], i) => `${i ? 'L' : 'M'}${sx(f).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')
  const fleetPath = path(xs.map((f) => [f, fleetCapacityOf(P, f)]))
  const servedPath = path(SERVED_FROZEN.map((p) => [p.fleet, p.served]))
  const served = (f: number) => SERVED_FROZEN.find((p) => p.fleet === f)!.served
  const h = hover ?? null
  return (
    <svg viewBox="0 0 760 350" className="lf-svg" role="img" aria-label={alt} onMouseLeave={() => setHover(null)}>
      {[0, 5000, 10000, 15000, 20000, 25000].map((v) => (
        <g key={v}>
          <line x1={L} x2={R} y1={sy(v)} y2={sy(v)} className="f-grid" />
          <text x={L - 8} y={sy(v)} textAnchor="end" dominantBaseline="central" fontSize={11.5} className="f-muted">
            {fmt(v)}
          </text>
        </g>
      ))}
      {[10, 15, 20, 25, 30, 35, 40].map((f) => (
        <text key={f} x={sx(f)} y={B + 18} textAnchor="middle" fontSize={11.5} className="f-muted">
          {f}
        </text>
      ))}
      <text x={(L + R) / 2} y={B + 40} textAnchor="middle" fontSize={12} className="f-ink">
        Aircraft in the fleet
      </text>
      <text x={14} y={(T + B) / 2} textAnchor="middle" fontSize={12} className="f-ink" transform={`rotate(-90 14 ${(T + B) / 2})`}>
        Trips per month
      </text>
      <line x1={L} x2={R} y1={B} y2={B} className="f-axis" />
      {/* charging capacity */}
      <line x1={L} x2={R} y1={sy(charge)} y2={sy(charge)} className="f-line-s2" />
      <text x={R} y={sy(charge) - 8} textAnchor="end" fontSize={12.5} fontWeight={600} className="f-ink">
        Charging capacity, {P.chargers} chargers: {fmt(charge)}
      </text>
      {/* trips served at month 60, fleet held at each size */}
      <path d={servedPath} className="f-line-s3" data-testid="served-series" />
      <text x={R} y={sy(PLATEAU) + 18} textAnchor="end" fontSize={12.5} fontWeight={600} className="f-ink">
        Served at month 60: plateau ≈ {fmt(PLATEAU)} (churn loop)
      </text>
      {/* fleet capacity */}
      <path d={fleetPath} className="f-line-s1" />
      <text x={sx(31)} y={sy(fleetCapacityOf(P, 31)) - 10} textAnchor="end" fontSize={12.5} fontWeight={600} className="f-ink">
        Fleet capacity ({fmt(TRIPS_PER_AIRCRAFT_MONTH)} per aircraft)
      </text>
      {/* crossover: only after the worked step is answered */}
      {revealed && (
        <g data-testid="crossover-marker">
          <line x1={sx(CROSSOVER_6)} x2={sx(CROSSOVER_6)} y1={sy(charge)} y2={B} className="f-drop" />
          <circle cx={sx(CROSSOVER_6)} cy={sy(charge)} r={5} className="f-dot" />
          <text x={sx(CROSSOVER_6) + 8} y={sy(charge) + 46} fontSize={12.5} fontWeight={600} className="f-ink">
            crossover {CROSSOVER_6.toFixed(1)} aircraft
          </text>
          <text x={sx(CROSSOVER_6) + 8} y={sy(charge) + 62} fontSize={11.5} className="f-muted">
            from the {Math.ceil(CROSSOVER_6)}th aircraft, charging limits capacity
          </text>
        </g>
      )}
      {/* hover layer */}
      {xs.map((f) => (
        <rect key={f} x={sx(f) - 11} y={T} width={22} height={B - T} className="f-hit" onMouseEnter={() => setHover(f)} />
      ))}
      {h !== null && (
        <g pointerEvents="none">
          <line x1={sx(h)} x2={sx(h)} y1={T} y2={B} className="f-crosshair" />
          <circle cx={sx(h)} cy={sy(fleetCapacityOf(P, h))} r={4} className="f-dot-s1" />
          <circle cx={sx(h)} cy={sy(charge)} r={4} className="f-dot-s2" />
          <circle cx={sx(h)} cy={sy(served(h))} r={4} className="f-dot" />
          <g transform={`translate(${Math.min(sx(h) + 10, R - 220)}, ${T + 6})`}>
            <rect width={216} height={62} rx={4} className="f-tooltip" />
            <text x={10} y={18} fontSize={12} fontWeight={600} className="f-ink">
              {h} aircraft
            </text>
            <text x={10} y={36} fontSize={12} className="f-ink">
              Fleet {fmt(fleetCapacityOf(P, h))} · Charging {fmt(charge)}
            </text>
            <text x={10} y={53} fontSize={12} className="f-ink">
              Served at month 60 ≈ {fmt(served(h))}
            </text>
          </g>
        </g>
      )}
    </svg>
  )
}

// ------------------------------------------------------------------------------------------- L7: life cycle and agents
export function LifeCycleAgents({ alt }: { alt: string }) {
  const id = useId().replace(/:/g, '')
  const phases = [['System', 'definition'], ['Initial operational', 'capability development'], ['System evolution', 'and retirement']]
  const lanes = [['External bodies', '(users, owners,', 'external systems)'], ['Systems', 'engineers'], ['Developers']]
  const col = (i: number) => 170 + i * 196
  const row = (j: number) => 70 + j * 84
  return (
    <svg viewBox="0 0 760 330" className="lf-svg" role="img" aria-label={alt}>
      <Markers id={id} />
      {phases.map((p, i) => (
        <g key={i}>
          <text x={col(i) + 90} y={22} textAnchor="middle" fontSize={13} fontWeight={600} className="f-ink">
            {p[0]}
          </text>
          <text x={col(i) + 90} y={40} textAnchor="middle" fontSize={13} fontWeight={600} className="f-ink">
            {p[1]}
          </text>
        </g>
      ))}
      {lanes.map((l, j) => (
        <g key={j}>
          <rect x={4} y={row(j)} width={752} height={70} rx={6} className={j === 1 ? 'f-lane-se' : 'f-lane-row'} />
          {l.map((t, k) => (
            <text key={k} x={16} y={row(j) + (j === 1 ? 28 : 35) + (k - (l.length - 1) / 2) * 16} dominantBaseline="central" fontSize={12.5} fontWeight={k === 0 ? 600 : 400} className="f-ink">
              {t}
            </text>
          ))}
        </g>
      ))}
      {/* SEBoK's change example covers changes during development and evolution (R01 p.54), so no arrows in definition */}
      <text x={col(0) + 90} y={row(1) + 30} textAnchor="middle" dominantBaseline="central" fontSize={11.5} fontStyle="italic" className="f-muted">
        not in the change example
      </text>
      {phases.slice(1).map((_, k) => k + 1).map((i) => (
        <g key={i}>
          <line x1={col(i) + 90} x2={col(i) + 90} y1={row(0) + 50} y2={row(1) + 20} className="f-arrow accent" markerStart={`url(#${id}-accent)`} markerEnd={`url(#${id}-accent)`} />
          <line x1={col(i) + 90} x2={col(i) + 90} y1={row(1) + 50} y2={row(2) + 20} className="f-arrow accent" markerStart={`url(#${id}-accent)`} markerEnd={`url(#${id}-accent)`} />
          <text x={col(i) + 90} y={row(1) + 36} textAnchor="middle" dominantBaseline="central" fontSize={12} className="f-ink">
            mediate change
          </text>
        </g>
      ))}
      <text x={380} y={322} textAnchor="middle" fontSize={11.5} className="f-muted">
        Two-headed arrows: proposals and counter-proposals, so the dependencies are two-way.
      </text>
    </svg>
  )
}

export function ControlRings({ alt }: { alt: string }) {
  const cx = 230, cy = 200
  return (
    <svg viewBox="0 0 760 400" className="lf-svg" role="img" aria-label={alt}>
      <circle cx={cx} cy={cy} r={190} className="f-ring3" />
      <circle cx={cx} cy={cy} r={128} className="f-ring2" />
      <circle cx={cx} cy={cy} r={64} className="f-ring1" />
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize={13} fontWeight={600} className="f-ink">
        Controls
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={11.5} className="f-ink">
        dispatch
      </text>
      <text x={cx} y={cy - 92} textAnchor="middle" fontSize={13} fontWeight={600} className="f-ink">
        Influences
      </text>
      <text x={cx} y={cy + 100} textAnchor="middle" fontSize={11.5} className="f-muted" fontStyle="italic">
        you decide in your memo §5
      </text>
      <text x={cx} y={cy - 168} textAnchor="middle" fontSize={12.5} fontWeight={600} className="f-ink">
        Influences me; I neither
      </text>
      <text x={cx} y={cy - 152} textAnchor="middle" fontSize={12.5} fontWeight={600} className="f-ink">
        control nor influence it
      </text>
      <text x={cx} y={cy + 165} textAnchor="middle" fontSize={11.5} className="f-muted" fontStyle="italic">
        you decide in your memo §5
      </text>
      {/* key on the right */}
      <g transform="translate(450, 70)">
        {[
          ['Inner ring: what do I control?', 'dispatch (the operations center controls it)'],
          ['Middle ring: what do I influence?', 'left empty: your argument (memo §5)'],
          ['Outer ring: what influences me', 'that I neither control nor influence?', 'left empty: your argument (memo §5)'],
        ].map((r, i) => (
          <g key={i} transform={`translate(0, ${i * 82})`}>
            <text fontSize={13} fontWeight={600} className="f-ink">
              {r[0]}
            </text>
            {r.slice(1).map((t, k) => (
              <text key={k} y={20 + k * 17} fontSize={12.5} className="f-ink">
                {t}
              </text>
            ))}
          </g>
        ))}
        <text y={262} fontSize={11.5} className="f-muted">
          MITRE’s questions (R50 p.48), after “What is my
        </text>
        <text y={279} fontSize={11.5} className="f-muted">
          enterprise?”. Providers are mostly outside AeroLink’s
        </text>
        <text y={296} fontSize={11.5} className="f-muted">
          control (reviewed text); which ring is your call.
        </text>
      </g>
    </svg>
  )
}

// ------------------------------------------------------------------------------------------- summary: concept map
export function ConceptMap({ onOpen }: { onOpen?: (section: string) => void }) {
  return (
    <div className="lf-conceptmap">
      <ol className="lf-chain">
        {CONCEPT_CHAIN.map((c, i) => (
          <li key={i}>
            <Link to={`/week/1/learn/${c.section}`} onClick={onOpen ? () => onOpen(c.section) : undefined} className="lf-node" aria-label={`${c.label} (${learnSection(c.section)!.code}: ${learnSection(c.section)!.title})`}>
              <span className="lf-node-code">{learnSection(c.section)!.code}</span>
              {c.label}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ------------------------------------------------------------------------------------------- welcome: course timeline
// The authoritative schedule (COURSE_SCHEDULE.md, DECISION_LOG A19): Phase I and Phase II, the whiteboard subjects, and the
// two team outputs (Week 7 package, Week 14 model). Exam placement is an open faculty decision, so no exam is drawn.

export function CourseTimeline({ current = 1 }: { current?: number }) {
  return (
    <div className="lf-timeline" data-testid="course-timeline">
      {(['ST', 'MBSE'] as const).map((part) => (
        <section key={part} className="lf-tl-part" aria-label={PARTS[part].title}>
          <h4 className="lf-tl-title">
            {PARTS[part].title.replace(' — ', ': ')} <span className="lf-muted">· {PARTS[part].weeks.split(' (')[0]}</span>
          </h4>
          <ol className="lf-tl-weeks">
            {WEEKS.filter((w) => w.part === part).map((w) => {
              return (
                <li key={w.number} className={w.number === current ? 'is-current' : ''} aria-current={w.number === current ? 'step' : undefined}>
                  <span className="lf-tl-no">W{w.number}</span>
                  <span className="lf-tl-name">{w.title}</span>
                  <span className="lf-tl-marks">
                    {w.due && <span className="lf-chip" style={{ borderRadius: 6 }}>{w.due}</span>}
                    {w.number === current && <span className="lf-chip accent">You start here</span>}
                  </span>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}

/** A small Box re-export so figure modules share one look. */
export { Box }
