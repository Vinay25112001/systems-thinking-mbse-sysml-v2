import { useMemo, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DEFAULT_PARAMS, SCENARIOS, chargerMonths, excessAircraftMonths, simulate, type Regime, type SimParams } from '../sim/aerolink'
import { useApp } from '../state/AppState'
import { useMissionSignal, useSignalValue } from '../workbench/signals'
import { SIG_ARCHETYPE, SIG_RUN, summariseRun } from '../workbench/week1/logic'
import { Badge, Button } from './ui'
import { chartTokens, useIsWorkbench } from './surface'

function Slider({ label, value, min, max, step, onChange, unit }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit?: string }) {
  const id = `slider-${label.replace(/\W+/g, '-')}`
  const wb = useIsWorkbench()
  if (wb)
    return (
      <div className="wb-slider">
        <label htmlFor={id} className="flex items-baseline justify-between gap-2">
          <span className="wb-label m-0">{label}</span>
          <span className="wb-readout">
            {value}
            {unit ? ` ${unit}` : ''}
          </span>
        </label>
        <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="wb-range" />
      </div>
    )
  return (
    <div>
      <label htmlFor={id} className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="font-mono">
          {value}
          {unit ? ` ${unit}` : ''}
        </span>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-brand-500" />
    </div>
  )
}

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: string }) {
  const wb = useIsWorkbench()
  return (
    <label className={wb ? 'flex items-start gap-2 text-[12.5px] leading-snug' : 'flex items-center gap-2 text-sm'}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-brand-500" />
      {children}
    </label>
  )
}

/** "demand" is a convention set at riders' tolerance: near it, more capacity still raises ridership (review W1-R05). */
const REGIME_TEXT: Record<Regime, string> = {
  demand: 'demand (waits within tolerance)',
  fleet: 'fleet capacity (waits above tolerance)',
  charging: 'charging capacity (waits above tolerance)',
}

/** Archetype choices offered before the instructor's label is revealed (review W1-F21). Every choice is an archetype
 *  named in R05 pp.283–284; none is a descriptive giveaway (review W1-R01). */
const ARCHETYPE_CHOICES = [
  'Limits to Growth',
  'Balancing Process with Delay',
  'Growth and Underinvestment',
  'Fixes that Fail',
  'Drift to Low Performance',
  'Attractiveness Principle',
]

type Verdict = { verdict: 'match' | 'partial'; note: string }
/**
 * Feedback on a committed archetype, per scenario, checked against R05 p.283 definitions and the quiz keys (q1-5, q1-7,
 * q1-8). Limits to Growth is a match for TWO scenarios, with different limits: the charging limit (fixed chargers,
 * q1-7) and the market limit (R1 meets B4, q1-5). Choices not listed get "does not match".
 */
const ARCHETYPE_FEEDBACK: Record<string, Partial<Record<string, Verdict>>> = {
  underinvestment: {
    'Limits to Growth': { verdict: 'match', note: 'Growth meets a balancing process (waiting drives churn) as the charging limit is approached.' },
    'Balancing Process with Delay': { verdict: 'partial', note: 'The delivery delay, with orders that ignore aircraft already on order, explains why 40 aircraft were bought (19 with no delay, or with orders that count them), but the plateau persists after the supply line is empty (from month 22), so delay is not what holds throughput down.' },
    'Growth and Underinvestment': { verdict: 'partial', note: 'An arguable interpretation, not a structure the model contains: charger investment is a fixed policy switch, so stalled growth never feeds back into the charging decision.' },
    'Attractiveness Principle': { verdict: 'partial', note: 'An arguable interpretation of the ordering rule, which considers aircraft without charging; the model’s structure is Limits to Growth.' },
  },
  delay: {
    'Balancing Process with Delay': { verdict: 'match', note: 'Delay in the response to ordering makes the ordering rule over-correct: the fleet over-builds.' },
    'Limits to Growth': { verdict: 'partial', note: 'Riders do approach the market limit (about 91 % by month 60), but the behaviour this run isolates is the fleet over-build caused by the delivery delay.' },
  },
  balanced: {
    'Limits to Growth': { verdict: 'match', note: 'Word of mouth (R1) meets market saturation (B4): the limit is now the market, not capacity (compare quiz item q1-5).' },
    'Balancing Process with Delay': { verdict: 'partial', note: 'The 3-month delay still over-builds a little (about 14 surplus aircraft at month 60), but ridership is shaped by the market limit.' },
  },
}

function archetypeFeedback(scenarioId: string, choice: string): string {
  const v = ARCHETYPE_FEEDBACK[scenarioId]?.[choice]
  if (!v) return 'does not match the model structure; compare your reasoning with the label.'
  return v.verdict === 'match' ? `matches the model structure. ${v.note}` : `partly fits. ${v.note}`
}

const INTERPRETATION_NOTE =
  'Growth and Underinvestment and the Attractiveness Principle are interpretations you may argue in the memo, not structures this model contains: charger investment here is a fixed policy switch, so stalled growth never feeds back into the charging decision.'

/** Each series has its own dash pattern, so the charts do not rely on colour alone (review W1-F08). */
const DASH = { solid: undefined, dash: '8 4', dot: '2 3', dashDot: '10 4 2 4' }

type Series = { k: string; n: string; c: string; dash?: string }
const CHARTS: { title: string; lines: Series[] }[] = [
  { title: 'Riders', lines: [{ k: 'riders', n: 'Riders', c: '#2f6fd6' }] },
  {
    title: 'Trips per month and capacity',
    lines: [
      { k: 'demand', n: 'Trips demanded', c: '#64748b', dash: DASH.dot },
      { k: 'served', n: 'Trips served', c: '#0f9d8a' },
      { k: 'fleetCap', n: 'Fleet capacity', c: '#7c3aed', dash: DASH.dash },
      { k: 'chargeCap', n: 'Charging capacity', c: '#d97706', dash: DASH.dashDot },
    ],
  },
  {
    title: 'Fleet, aircraft on order and chargers',
    lines: [
      { k: 'fleet', n: 'Aircraft in fleet', c: '#7c3aed' },
      { k: 'onOrder', n: 'Aircraft on order', c: '#0369a1', dash: DASH.dot },
      { k: 'chargers', n: 'Chargers', c: '#d97706', dash: DASH.dashDot },
    ],
  },
  {
    title: 'Waiting time (min) and utilisation (%)',
    lines: [
      { k: 'wait', n: 'Wait (min)', c: '#be123c' },
      { k: 'util', n: 'Utilisation (%)', c: '#475569', dash: DASH.dash },
    ],
  },
]

/** Dark-theme series colours for the workbench: the same hues, lifted for >= 3:1 against the dark panel. */
const DARK_SERIES: Record<string, string> = { riders: '#6ea8fe', demand: '#9ba5b4', served: '#3fc9b4', fleetCap: '#b08cf5', chargeCap: '#f0a33c', fleet: '#b08cf5', onOrder: '#5fb6e6', chargers: '#f0a33c', wait: '#f07a70', util: '#aab4c3' }

const fmt = (n: number) => Math.round(n).toLocaleString('en-US')

export function DynamicsExplorer() {
  const { resolvedTheme } = useApp()
  const wb = useIsWorkbench()
  // committed archetypes restored from the persisted mission signal (workbench only; undefined on the classic page)
  const restored = useSignalValue<Record<string, string>>(SIG_ARCHETYPE)
  const [params, setParams] = useState<SimParams>({ ...DEFAULT_PARAMS, ...SCENARIOS[0].params })
  const [scenario, setScenario] = useState<string>(SCENARIOS[0].id)
  const [guess, setGuess] = useState<Record<string, string>>(() => ({ ...(restored ?? {}) }))
  const [revealed, setRevealed] = useState<Record<string, boolean>>(() => Object.fromEntries(Object.keys(restored ?? {}).map((k) => [k, true])))
  const [tableStep, setTableStep] = useState(6)
  const run = useMemo(() => simulate(params), [params])
  // Workbench missions read student-initiated runs and committed archetypes (no-op outside the workbench).
  const [runSeq, setRunSeq] = useState(0)
  const runSignal = useMemo(() => (runSeq ? summariseRun(scenario, params, run, runSeq) : undefined), [runSeq, scenario, params, run])
  useMissionSignal(SIG_RUN, runSignal)
  useMissionSignal(SIG_ARCHETYPE, Object.keys(revealed).length ? Object.fromEntries(Object.keys(revealed).map((k) => [k, guess[k]])) : undefined)
  const set = <K extends keyof SimParams>(k: K, v: SimParams[K]) => {
    setScenario('custom')
    setParams((p) => ({ ...p, [k]: v }))
    setRunSeq((n) => n + 1)
  }
  const end = run[run.length - 1]
  const current = SCENARIOS.find((s) => s.id === scenario)
  const data = run.map((p) => ({
    month: p.month,
    riders: Math.round(p.riders),
    served: Math.round(p.served),
    demand: Math.round(p.demand),
    fleetCap: Math.round(p.fleetCapacity),
    chargeCap: Math.round(p.chargingCapacity),
    fleet: p.fleet,
    onOrder: p.onOrder,
    chargers: p.chargers,
    wait: Math.round(p.waitMin * 10) / 10,
    util: Math.round(p.utilisation * 100),
  }))
  const tableRows = run.filter((p) => p.month % tableStep === 0 || p.month === end.month)
  const tok = chartTokens(resolvedTheme === 'dark')
  const axis = wb ? tok.axis : resolvedTheme === 'dark' ? '#94a3b8' : '#475569'
  const grid = wb ? tok.grid : resolvedTheme === 'dark' ? '#334155' : '#e2e8f0'
  // workbench styling: tokens, dense type, segmented scenarios; the classic page keeps its styling
  const box = wb ? 'rounded border border-wb-line bg-wb-panel' : 'rounded-lg border border-slate-200 dark:border-slate-800'
  const muted = wb ? 'text-wb-muted' : 'text-slate-600 dark:text-slate-400'
  const selectCls = wb ? 'wb-select mt-1' : 'mt-1 rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'

  return (
    <div className={wb ? 'space-y-3 text-[13px]' : 'space-y-4'} data-testid="dynamics-explorer">
      {wb ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="wb-label m-0" id="dyn-scenarios">
            Scenarios:
          </span>
          <div className="wb-seg" role="group" aria-labelledby="dyn-scenarios">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={scenario === s.id}
                onClick={() => {
                  setScenario(s.id)
                  setParams({ ...DEFAULT_PARAMS, ...s.params })
                  setRunSeq((n) => n + 1)
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
          <Badge tone="amber">FICTIONAL parameters</Badge>
        </div>
      ) : (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">Scenarios:</span>
        {SCENARIOS.map((s) => (
          <Button
            key={s.id}
            variant={scenario === s.id ? 'primary' : 'secondary'}
            onClick={() => {
              setScenario(s.id)
              setParams({ ...DEFAULT_PARAMS, ...s.params })
              setRunSeq((n) => n + 1)
            }}
          >
            {s.name}
          </Button>
        ))}
        <Badge tone="amber">FICTIONAL parameters</Badge>
      </div>
      )}
      {current && (
        <div className={`space-y-2 p-3 ${box} ${wb ? '' : 'text-sm'}`} data-testid="scenario-panel">
          <p>
            <strong>Policies:</strong> {current.setup}
          </p>
          {revealed[current.id] ? (
            <p data-testid="scenario-reveal">
              <span className="mr-1">
                Your answer: <em>{guess[current.id]}</em> — {archetypeFeedback(current.id, guess[current.id])}
              </span>
              Instructor’s label: <strong>{current.archetype}.</strong> {current.description}
              {current.id === 'underinvestment' && <span className={`mt-1 block text-xs ${muted}`}>{INTERPRETATION_NOTE}</span>}
            </p>
          ) : (
            <div className="flex flex-wrap items-end gap-2">
              <label className={wb ? 'text-[12px]' : 'text-xs'}>
                <span className="block">Which archetype does this run show? Commit before revealing.</span>
                <select
                  value={guess[current.id] ?? ''}
                  onChange={(e) => setGuess((g) => ({ ...g, [current.id]: e.target.value }))}
                  className={selectCls}
                >
                  <option value="">Choose…</option>
                  {ARCHETYPE_CHOICES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
              {wb ? (
                <button type="button" className="wb-btn" disabled={!guess[current.id]} onClick={() => setRevealed((r) => ({ ...r, [current.id]: true }))}>
                  Reveal the instructor’s label
                </button>
              ) : (
              <Button variant="secondary" disabled={!guess[current.id]} onClick={() => setRevealed((r) => ({ ...r, [current.id]: true }))}>
                Reveal the instructor’s label
              </Button>
              )}
            </div>
          )}
        </div>
      )}
      <div className={wb ? `grid gap-x-5 gap-y-3 p-3 sm:grid-cols-2 xl:grid-cols-3 ${box}` : 'grid gap-4 rounded-lg border border-slate-200 p-3 sm:grid-cols-2 lg:grid-cols-3 dark:border-slate-800'}>
        <Slider label="Procurement delay" unit="months" value={params.procurementDelayMonths} min={0} max={24} step={1} onChange={(v) => set('procurementDelayMonths', v)} />
        <Slider label="Initial chargers" value={params.chargers} min={2} max={24} step={1} onChange={(v) => set('chargers', v)} />
        <Slider label="Word-of-mouth rate" unit="/month" value={params.wordOfMouth} min={0.05} max={0.6} step={0.05} onChange={(v) => set('wordOfMouth', v)} />
        <Slider label="Target utilisation" value={params.targetUtilisation} min={0.5} max={0.95} step={0.05} onChange={(v) => set('targetUtilisation', v)} />
        <Slider label="Months simulated" unit="months" value={params.months} min={36} max={120} step={12} onChange={(v) => set('months', v)} />
        <div className="space-y-1">
          <Toggle checked={params.expandFleet} onChange={(v) => set('expandFleet', v)}>
            Management orders aircraft when utilisation is high
          </Toggle>
          <Toggle checked={params.investInCharging} onChange={(v) => set('investInCharging', v)}>
            Chargers scale with the fleet
          </Toggle>
          <Toggle checked={params.countSupplyLine} onChange={(v) => set('countSupplyLine', v)}>
            Orders count aircraft already on order (supply line)
          </Toggle>
        </div>
      </div>

      <div className={wb ? 'grid gap-3 xl:grid-cols-2' : 'grid gap-4 lg:grid-cols-2'}>
        {CHARTS.map((chart) => (
          <figure key={chart.title} className={wb ? `m-0 p-2 ${box}` : 'rounded-lg border border-slate-200 p-2 dark:border-slate-800'}>
            <figcaption className={wb ? 'px-1 text-[12px] font-semibold' : 'px-1 text-xs font-semibold'}>
              {chart.title}{' '}
              <span className={`font-normal ${muted}`}>({chart.lines.length > 1 ? 'series differ by line pattern; ' : ''}values in the data table below)</span>
            </figcaption>
            <div className={wb ? 'h-48' : 'h-56'}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={grid} strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke={axis} tick={{ fontSize: wb ? 11 : 10, fill: axis }} label={{ value: 'month', position: 'insideBottomRight', offset: -2, fontSize: wb ? 11 : 10, fill: axis }} />
                  <YAxis stroke={axis} tick={{ fontSize: wb ? 11 : 10, fill: axis }} width={52} />
                  <Tooltip contentStyle={wb ? { background: tok.tooltipBg, border: `1px solid ${tok.tooltipLine}`, color: tok.fg, fontSize: 12, borderRadius: 3 } : undefined} />
                  <Legend wrapperStyle={{ fontSize: wb ? 12 : 11 }} />
                  {chart.lines.map((l) => (
                    <Line key={l.k} type="monotone" dataKey={l.k} name={l.n} stroke={wb && resolvedTheme === 'dark' ? (DARK_SERIES[l.k] ?? l.c) : l.c} strokeDasharray={l.dash} legendType="plainline" dot={false} strokeWidth={2} isAnimationActive={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </figure>
        ))}
      </div>

      <div className={wb ? 'rounded border border-wb-line bg-wb-sunk p-3' : 'rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-800'} data-testid="sim-observations">
        <p className="font-semibold">Computed observations at month {end.month}</p>
        <ul className="mt-1 grid gap-1 sm:grid-cols-2">
          <li>
            Riders: {fmt(end.riders)} ({Math.round((100 * end.riders) / params.marketSize)}% of the potential market)
          </li>
          <li>
            Binding constraint: <strong>{REGIME_TEXT[end.bottleneck]}</strong>
          </li>
          <li>
            Trips served: {fmt(end.served)} of {fmt(end.capacity)} capacity ({Math.round(100 * end.utilisation)}% utilisation). Capacity is set by the {end.limitingResource === 'charging' ? 'chargers' : 'fleet'}: fleet {Math.round(100 * end.fleetUtilisation)}% used, chargers {Math.round(100 * end.chargingUtilisation)}% used.
          </li>
          <li>
            Average wait: {end.waitMin.toFixed(1)} min (riders’ tolerance {params.waitToleranceMin} min)
          </li>
          <li>
            Fleet {end.fleet} aircraft, {end.onOrder} on order. Surplus aircraft (adding no usable capacity): <strong>{end.excessAircraft.toFixed(1)}</strong> now; <strong>{end.committedExcess.toFixed(1)}</strong> including aircraft on order
          </li>
          <li>
            Idle aircraft so far: <strong>{fmt(excessAircraftMonths(run))}</strong> surplus aircraft-months (counts aircraft only)
          </li>
          <li>
            Charging investment so far: <strong>{fmt(chargerMonths(run))}</strong> charger-months ({end.chargers} chargers now). The model puts no price on aircraft or chargers.
          </li>
        </ul>
        <p className={`mt-2 text-xs ${muted}`}>
          Instructor-authored teaching model (src/sim/aerolink.ts). Every behaviour the lesson claims is asserted by an automated test against a counterfactual run (src/sim/aerolink.test.ts). Not a forecast of any real operation.
        </p>
      </div>

      <details className={wb ? `p-3 ${box}` : 'rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800'} data-testid="sim-table">
        <summary className="cursor-pointer font-semibold">Data table (text equivalent of the charts)</summary>
        <label className="mt-2 flex items-center gap-2 text-xs">
          Show
          <select value={tableStep} onChange={(e) => setTableStep(Number(e.target.value))} className={wb ? 'wb-select' : 'rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900'}>
            <option value={1}>every month</option>
            <option value={3}>every 3 months</option>
            <option value={6}>every 6 months</option>
            <option value={12}>every 12 months</option>
          </select>
        </label>
        <div className="mt-2 overflow-x-auto" tabIndex={0} role="region" aria-label="Simulation data table, scrollable">
          <table className={wb ? 'wb-mono w-full text-right text-[11.5px]' : 'w-full text-right text-xs'}>
            <caption className={`mb-1 text-left text-xs ${muted}`} style={wb ? { fontFamily: 'var(--wb-body)' } : undefined}>Simulated values by month for the current settings (FICTIONAL parameters)</caption>
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-700">
                {['Month', 'Riders', 'Trips demanded', 'Trips served', 'Fleet capacity', 'Charging capacity', 'Aircraft', 'On order', 'Chargers', 'Wait (min)', 'Utilisation', 'Binding constraint', 'Surplus aircraft'].map((h) => (
                  <th key={h} scope="col" className="px-1.5 py-1 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((p) => (
                <tr key={p.month} className="border-b border-slate-100 dark:border-slate-800">
                  <th scope="row" className="px-1.5 py-0.5 font-normal">
                    {p.month}
                  </th>
                  <td className="px-1.5 py-0.5">{fmt(p.riders)}</td>
                  <td className="px-1.5 py-0.5">{fmt(p.demand)}</td>
                  <td className="px-1.5 py-0.5">{fmt(p.served)}</td>
                  <td className="px-1.5 py-0.5">{fmt(p.fleetCapacity)}</td>
                  <td className="px-1.5 py-0.5">{fmt(p.chargingCapacity)}</td>
                  <td className="px-1.5 py-0.5">{p.fleet}</td>
                  <td className="px-1.5 py-0.5">{p.onOrder}</td>
                  <td className="px-1.5 py-0.5">{p.chargers}</td>
                  <td className="px-1.5 py-0.5">{p.waitMin.toFixed(1)}</td>
                  <td className="px-1.5 py-0.5">{Math.round(100 * p.utilisation)}%</td>
                  <td className="px-1.5 py-0.5">{p.bottleneck}</td>
                  <td className="px-1.5 py-0.5">{p.excessAircraft.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
