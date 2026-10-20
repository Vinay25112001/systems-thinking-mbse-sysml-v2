// Illustrated mini-figures for the welcome page's "How to use this site" (one per stage of a week) and the annotated
// drawing of the workbench regions on Practice's "How the workbench works" page (faculty feedback 2026-10-18, items 3
// and 11). Drawn with the shared figure classes, so both themes are designed once; each has a text equivalent in the
// surrounding prose.
import type { ReactNode } from 'react'

/** A small schematic of one stage of a week. `label` is the accessible name. */
export type StageFigureId = 'overview' | 'lecture' | 'learn' | 'examples' | 'practice' | 'check'
export function StageMiniFigure({ id, label }: { id: StageFigureId; label: string }) {
  return (
    <svg viewBox="0 0 200 120" className="lf-svg lf-mini" role="img" aria-label={label} data-testid={`mini-${id}`}>
      <rect x={2} y={2} width={196} height={116} rx={8} className="f-panel" />
      {id === 'overview' && (
        <g>
          <rect x={14} y={14} width={120} height={8} rx={3} className="f-mini-strong" />
          <rect x={14} y={28} width={172} height={5} rx={2} className="f-mini-line" />
          <rect x={14} y={38} width={150} height={5} rx={2} className="f-mini-line" />
          <g className="f-soft">
            <rect x={14} y={52} width={172} height={54} rx={6} className="f-shape" />
          </g>
          <text x={24} y={66} fontSize={10} fontWeight={600} className="f-ink">
            Your prediction
          </text>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <circle cx={30} cy={78 + i * 10} r={3.4} className={i === 1 ? 'f-mini-dot-on' : 'f-mini-dot'} />
              <rect x={40} y={75.5 + i * 10} width={100 - i * 18} height={5} rx={2} className="f-mini-line" />
            </g>
          ))}
        </g>
      )}
      {id === 'lecture' && (
        <g>
          <rect x={22} y={14} width={156} height={88} rx={4} className="f-shape" />
          <rect x={22} y={14} width={156} height={16} rx={4} className="f-mini-strong" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <circle cx={34} cy={44 + i * 13} r={2.6} className="f-mini-dot-on" />
              <rect x={42} y={41.5 + i * 13} width={56 - i * 8} height={5} rx={2} className="f-mini-line" />
            </g>
          ))}
          <g className="f-soft">
            <rect x={110} y={38} width={58} height={44} rx={4} className="f-shape" />
          </g>
          <path d="M116 74 L132 58 L146 66 L162 48" className="f-arrow accent" />
          <rect x={22} y={92} width={156} height={10} rx={2} className="f-mini-side" />
          <text x={100} y={114} textAnchor="middle" fontSize={9} className="f-ink">
            ← slide 3 of 28 →
          </text>
        </g>
      )}
      {id === 'examples' && (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={14} y={14 + i * 14} width={172} height={11} rx={2} className={i === 0 ? 'f-mini-strong' : 'f-mini-side'} />
              {i > 0 && <rect x={20} y={17 + i * 14} width={30} height={5} rx={2} className="f-mini-line" />}
              {i > 0 && <rect x={58} y={17 + i * 14} width={100 - i * 12} height={5} rx={2} className="f-mini-line" />}
            </g>
          ))}
          {[0, 1, 2].map((i) => (
            <g key={`s${i}`}>
              <circle cx={22} cy={78 + i * 13} r={5} className="f-mini-badge" />
              <text x={22} y={78 + i * 13} textAnchor="middle" dominantBaseline="central" fontSize={7} fontWeight={700} className="f-mini-badge-text">
                {i + 1}
              </text>
              <rect x={32} y={75.5 + i * 13} width={120 - i * 22} height={5} rx={2} className="f-mini-line" />
            </g>
          ))}
        </g>
      )}
      {id === 'learn' && (
        <g>
          <rect x={14} y={14} width={34} height={92} rx={4} className="f-mini-side" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={19} y={22 + i * 12} width={24} height={5} rx={2} className={i === 0 ? 'f-mini-accent' : 'f-mini-line'} />
          ))}
          <rect x={58} y={14} width={90} height={8} rx={3} className="f-mini-strong" />
          <rect x={58} y={28} width={128} height={5} rx={2} className="f-mini-line" />
          <rect x={58} y={38} width={116} height={5} rx={2} className="f-mini-line" />
          <rect x={58} y={50} width={128} height={30} rx={4} className="f-shape" />
          <path d="M66 74 L84 60 L100 68 L120 56 L178 56" className="f-arrow accent" />
          <rect x={58} y={88} width={128} height={18} rx={4} className="f-mini-check" />
          <text x={66} y={100} fontSize={9.5} fontWeight={600} className="f-ink">
            Check ✓
          </text>
        </g>
      )}
      {id === 'practice' && (
        <g>
          <rect x={10} y={12} width={50} height={96} rx={4} className="f-mini-side" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <circle cx={19} cy={26 + i * 16} r={4} className={i === 0 ? 'f-mini-dot-on' : 'f-mini-dot'} />
              <rect x={27} y={23.5 + i * 16} width={27} height={5} rx={2} className="f-mini-line" />
            </g>
          ))}
          <rect x={66} y={12} width={82} height={70} rx={4} className="f-shape" />
          <path d="M74 70 C 90 40, 110 30, 140 28" className="f-arrow accent" />
          <rect x={66} y={88} width={82} height={20} rx={4} className="f-mini-side" />
          <rect x={154} y={12} width={36} height={96} rx={4} className="f-mini-side" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={159} y={20 + i * 11} width={26} height={5} rx={2} className="f-mini-line" />
          ))}
        </g>
      )}
      {id === 'check' && (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={14} y={16 + i * 22} width={14} height={14} rx={3} className="f-shape" />
              {i < 2 && <path d={`M17 ${23 + i * 22} l3 3 l6 -7`} className="f-arrow accent" />}
              <rect x={36} y={20 + i * 22} width={110 - i * 20} height={6} rx={2} className="f-mini-line" />
            </g>
          ))}
          <g className="f-soft">
            <rect x={124} y={82} width={62} height={26} rx={6} className="f-shape" />
          </g>
          <path d="M155 102 L155 89 M149 94 L155 88 L161 94" className="f-arrow accent" />
          <text x={14} y={100} fontSize={9.5} fontWeight={600} className="f-ink">
            Template · rubric
          </text>
        </g>
      )}
    </svg>
  )
}

/** The workbench layout with numbered callouts for its five regions (Practice orientation). */
export function WorkbenchRegionsFigure({ alt }: { alt: string }) {
  const badge = (n: number, x: number, y: number) => (
    <g key={n}>
      <circle cx={x} cy={y} r={13} className="f-mini-badge" />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={700} className="f-mini-badge-text">
        {n}
      </text>
    </g>
  )
  return (
    <>
    <WorkbenchRegionsNarrow alt={alt} badge={badge} />
    <svg viewBox="0 0 760 380" className="lf-svg lf-regions-wide" role="img" aria-label={alt} data-testid="workbench-regions">
      <rect x={4} y={4} width={752} height={372} rx={10} className="f-panel" />
      {/* top bar */}
      <rect x={16} y={14} width={728} height={28} rx={5} className="f-mini-side" />
      <text x={28} y={28} dominantBaseline="central" fontSize={12} className="f-muted">
        Practice bar: missions complete · How the workbench works · Check & submit
      </text>
      {/* brief */}
      <g className="f-soft">
        <rect x={16} y={52} width={210} height={312} rx={6} className="f-shape" />
      </g>
      <text x={30} y={74} fontSize={13} fontWeight={600} className="f-ink">
        Mission brief
      </text>
      {['1. Try first', '2. Guided', '3. Guided', '4. Guided', '5. Own', '6. Recall'].map((t, i) => (
        <g key={t}>
          <rect x={30} y={86 + i * 22} width={182} height={18} rx={3} className="f-shape" />
          <text x={38} y={95 + i * 22} dominantBaseline="central" fontSize={11} className="f-ink">
            {t}
          </text>
        </g>
      ))}
      <text x={30} y={238} fontSize={11.5} fontWeight={600} className="f-ink">
        Steps
      </text>
      {['Task', 'You enter', 'Done when'].map((t, i) => (
        <g key={t}>
          <circle cx={38} cy={256 + i * 26} r={6} className={i === 0 ? 'f-mini-dot-on' : 'f-mini-dot'} />
          <text x={50} y={256 + i * 26} dominantBaseline="central" fontSize={11} className="f-ink">
            {t}
          </text>
        </g>
      ))}
      {/* centre */}
      <rect x={236} y={52} width={316} height={232} rx={6} className="f-shape" />
      <text x={250} y={74} fontSize={13} fontWeight={600} className="f-ink">
        Center view: the tool for the current step
      </text>
      <path d="M262 260 C 320 160, 380 120, 530 110" className="f-arrow accent" />
      {/* dock */}
      <rect x={236} y={294} width={316} height={70} rx={6} className="f-mini-side" />
      <text x={250} y={316} fontSize={12.5} fontWeight={600} className="f-ink">
        Problems · Changes & impact · Console
      </text>
      {/* browser + properties */}
      <rect x={562} y={52} width={182} height={180} rx={6} className="f-shape" />
      <text x={576} y={74} fontSize={13} fontWeight={600} className="f-ink">
        Model browser
      </text>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={576} y={90 + i * 18} width={140 - (i % 2) * 30} height={8} rx={3} className="f-mini-line" />
      ))}
      <rect x={562} y={242} width={182} height={122} rx={6} className="f-shape" />
      <text x={576} y={264} fontSize={13} fontWeight={600} className="f-ink">
        Properties
      </text>
      {badge(1, 210, 66)}
      {badge(2, 536, 66)}
      {badge(3, 728, 66)}
      {badge(4, 728, 256)}
      {badge(5, 536, 308)}
    </svg>
    </>
  )
}

/** The same five regions stacked as they appear on a narrow screen (one region at a time, chosen by tab), drawn at a
 *  size whose labels stay readable at 400 px (review F15: the wide drawing's labels shrank to about 5 px). */
function WorkbenchRegionsNarrow({ alt, badge }: { alt: string; badge: (n: number, x: number, y: number) => ReactNode }) {
  const rows: [number, string, string, number, number][] = [
    [1, 'Mission brief', 'missions and the steps of one', 100, 64],
    [2, 'Center view', 'the tool the current step needs', 174, 74],
    [3, 'Model browser', 'everything recorded so far', 258, 56],
    [4, 'Properties', 'details of the selected item', 324, 56],
    [5, 'Problems', 'automatic checks; select one to jump', 390, 56],
  ]
  return (
    <svg viewBox="0 0 360 460" className="lf-svg lf-regions-narrow" role="img" aria-label={alt} data-testid="workbench-regions-narrow">
      <rect x={4} y={4} width={352} height={452} rx={10} className="f-panel" />
      <rect x={16} y={14} width={328} height={32} rx={5} className="f-mini-side" />
      <text x={28} y={30} dominantBaseline="central" fontSize={14} className="f-muted">
        Practice bar · Check & submit
      </text>
      <rect x={16} y={56} width={328} height={32} rx={5} className="f-mini-side" />
      <text x={28} y={72} dominantBaseline="central" fontSize={13.5} className="f-ink">
        Tabs: Mission · View · Model · Properties · Problems
      </text>
      {rows.map(([n, title, sub, y, h]) => (
        <g key={n}>
          <rect x={16} y={y} width={328} height={h} rx={6} className="f-shape" />
          <text x={56} y={y + 22} fontSize={15} fontWeight={600} className="f-ink">
            {title}
          </text>
          <text x={56} y={y + 42} fontSize={13.5} className="f-muted">
            {sub}
          </text>
          {badge(n, 34, y + 22)}
        </g>
      ))}
    </svg>
  )
}
