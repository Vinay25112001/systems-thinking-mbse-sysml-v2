// Learn stage: one section at a time (WEEK1_LEARNING_DESIGN §5). Template: question, in short, explanation (reviewed
// text by reference), figure(s), worked example, key terms, check (must be answered to mark the section read),
// sources and "Go deeper" (the full reviewed blocks).
import { ArrowLeft, ArrowRight, Check as CheckIcon, Users } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { ALL_LOOPS, LOOP_LINKS, LOOP_NODES } from '../content/causalLoops'
import { WEEKS } from '../content/course'
import { bodyText, blockOf, resolveBullet, resolveRef } from '../content/learn/resolve'
import type { LearnSection, Worked } from '../content/learn/types'
import { LEARN_SECTIONS, SUMMARY } from '../content/learn/week01'
import { formatCitation } from '../content/readings'
import { LearnFigure } from '../components/figures'
import { ConceptMap } from '../components/figures/EngineeringFigures'
import { FigureFrame } from '../components/figures/Frame'
import { Link, navigate } from '../lib/router'
import { useApp } from '../state/AppState'
import { Cite } from './Cite'
import { bloomLabel } from './route'
import { useFlow } from './state'

const LEARN_PAGES = [...LEARN_SECTIONS.map((s) => s.id), 'summary']

// ------------------------------------------------------------------------------------------- section list
const isWide = () => {
  try {
    return window.matchMedia('(min-width: 1024px)').matches
  } catch {
    return true
  }
}

function SectionList({ current }: { current: string }) {
  const { state, readCount } = useFlow()
  // the list is always shown beside the text on wide screens; on narrow screens it folds above the text
  const [open, setOpen] = useState(isWide)
  useEffect(() => {
    const on = () => isWide() && setOpen(true)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  const items = (
    <>
      <ol className="lf-toc-list">
        {LEARN_SECTIONS.map((s) => (
          <li key={s.id}>
            <Link to={`/week/1/learn/${s.id}`} aria-current={current === s.id ? 'page' : undefined} data-testid={`toc-${s.id}`}>
              <span className={`lf-toc-mark${state.read[s.id] ? ' done' : ''}`} aria-hidden>
                {state.read[s.id] ? <CheckIcon size={12} strokeWidth={3} /> : s.code.slice(1)}
              </span>
              <span>
                {s.title}
                <span className="sr-only">{state.read[s.id] ? ' (read)' : ' (not read yet)'}</span>
              </span>
            </Link>
          </li>
        ))}
        <li>
          <Link to="/week/1/learn/summary" aria-current={current === 'summary' ? 'page' : undefined} data-testid="toc-summary">
            <span className="lf-toc-mark" aria-hidden>
              Σ
            </span>
            <span>Summary and concept map</span>
          </Link>
        </li>
      </ol>
      <p className="lf-toc-progress" data-testid="learn-progress">
        {readCount} of {LEARN_SECTIONS.length} sections read
      </p>
      <div className="lf-bar" aria-hidden>
        <span style={{ width: `${(readCount / LEARN_SECTIONS.length) * 100}%` }} />
      </div>
    </>
  )
  return (
    <nav className="lf-toc-wrap" aria-label="Learn sections">
      <details className="lf-toc" open={open} onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
        <summary>
          Sections · {readCount} of {LEARN_SECTIONS.length} read
        </summary>
        {items}
      </details>
    </nav>
  )
}

// ------------------------------------------------------------------------------------------- the check
/** Options are authored with the keyed answer first; the display order is rotated per section (fixed, so a reload or a
 *  retry shows the same order) so the position of the right answer carries no signal. */
function displayOrder(s: LearnSection) {
  const r = (LEARN_SECTIONS.findIndex((x) => x.id === s.id) * 3 + 1) % s.check.options.length
  return s.check.options.map((_, i) => s.check.options[(i + r) % s.check.options.length])
}

/** Review W1F-F13: after a first wrong answer only the chosen option's feedback is shown and the student may try again;
 *  the keyed option and its feedback are revealed after a correct answer or a second wrong one. Objective status uses
 *  the first attempt (state.tsx), so a retry never upgrades it. */
export function SectionCheckView({ s }: { s: LearnSection }) {
  const { state, answerCheck, retryCheck } = useFlow()
  const stored = state.checks[s.id]
  const rec = stored && !stored.retrying ? stored : undefined
  const [choice, setChoice] = useState('')
  const name = useId()
  const selected = rec?.selected ?? choice
  const chosen = s.check.options.find((o) => o.id === rec?.selected)
  const revealKey = !!rec && (rec.correct || rec.attempts >= 2)
  return (
    <fieldset className="lf-check" data-testid={`check-${s.check.id}`}>
      <legend>Check {s.check.id.toUpperCase()} · ungraded</legend>
      <p className="lf-check-prompt" id={`${name}-p`}>
        {s.check.prompt}
      </p>
      <div role="radiogroup" aria-labelledby={`${name}-p`}>
        {displayOrder(s).map((o) => {
          const right = revealKey && o.correct
          const wrong = !!rec && o.id === rec.selected && !o.correct
          return (
            <label key={o.id} className={`lf-option${right ? ' is-right' : ''}${wrong ? ' is-wrong' : ''}`}>
              <input type="radio" name={name} value={o.id} checked={selected === o.id} disabled={!!rec} onChange={() => setChoice(o.id)} />
              <span>
                {o.text}
                {rec && (o.id === rec.selected || (revealKey && o.correct)) && <span className="lf-feedback">{o.feedback}</span>}
              </span>
            </label>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {!rec ? (
          <button
            type="button"
            className="lf-btn primary"
            disabled={!choice}
            onClick={() => {
              const o = s.check.options.find((x) => x.id === choice)!
              answerCheck(s.id, o.id, o.correct)
            }}
          >
            Check my answer
          </button>
        ) : (
          <>
            <span role="status" className={`lf-verdict ${chosen?.correct ? 'ok' : 'bad'}`}>
              {chosen?.correct ? 'Correct.' : revealKey ? 'Not quite: the answer and its reasoning are now shown above.' : 'Not quite: read the feedback on your choice, then try once more.'}
            </span>
            {!chosen?.correct && !revealKey && (
              <button
                type="button"
                className="lf-btn small"
                onClick={() => {
                  retryCheck(s.id)
                  setChoice('')
                }}
              >
                Try again
              </button>
            )}
          </>
        )}
      </div>
      <p className="m-0 mt-2">{s.check.cite ? <Cite c={s.check.cite} /> : <span className="lf-term-src course">Course convention</span>}</p>
    </fieldset>
  )
}

// ------------------------------------------------------------------------------------------- worked examples
const nodeLabel = (id: string) => LOOP_NODES.find((n) => n.id === id)!.label

function LoopStepThrough({ loopId, intro }: { loopId: string; intro: string }) {
  const loop = ALL_LOOPS.find((l) => l.id === loopId)!
  const links = loop.path.map((from, i) => {
    const to = loop.path[(i + 1) % loop.path.length]
    return { from, to, polarity: LOOP_LINKS.find((l) => l.from === from && l.to === to)!.polarity }
  })
  const [k, setK] = useState(0)
  const shown = links.slice(0, k)
  const negatives = shown.filter((l) => l.polarity === '−').length
  return (
    <div>
      <p>{intro}</p>
      <ol className="lf-steps" aria-live="polite">
        {shown.map((l, i) => (
          <li key={i}>
            <p className="lf-link-step">
              {nodeLabel(l.from)} →({l.polarity}) {nodeLabel(l.to)}
            </p>
            <p className="lf-muted text-[14px]">
              {l.polarity === '+' ? 'Same direction.' : 'Opposite direction.'} Negative links so far: {shown.slice(0, i + 1).filter((x) => x.polarity === '−').length}.
            </p>
          </li>
        ))}
      </ol>
      {k < links.length ? (
        <button type="button" className="lf-btn small" onClick={() => setK(k + 1)}>
          {k === 0 ? 'Show the first link' : `Next link (${k} of ${links.length})`}
        </button>
      ) : (
        <p className="lf-figure-note" data-testid="loop-verdict">
          <strong>
            {negatives} negative link{negatives === 1 ? '' : 's'}: {negatives % 2 ? 'odd' : 'even'}, so {loop.id} is {loop.kind.toLowerCase()}.
          </strong>
        </p>
      )}
    </div>
  )
}

function FadedInput({ sectionId, step }: { sectionId: string; step: Extract<Extract<Worked, { kind: 'faded' }>['steps'][number], { kind: 'input' }> }) {
  const { state, patch } = useFlow()
  const saved = state.worked[sectionId]
  const [draft, setDraft] = useState(saved ?? '')
  const id = useId()
  const v = saved === undefined ? NaN : Number(saved.replace(/[,\s]/g, ''))
  // the capacities are equal at the fractional crossover; the first whole aircraft is "close" (review W1F-F03)
  const ok = Math.abs(v - step.answer) <= step.tolerance
  const near = !ok && step.near !== undefined && v === step.near.value
  return (
    <div>
      <label htmlFor={id} className="block">
        {step.prompt}
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input id={id} className="lf-input" inputMode="decimal" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && draft.trim() && patch('worked', { ...state.worked, [sectionId]: draft.trim() })} />
        <button type="button" className="lf-btn small" disabled={!draft.trim()} onClick={() => patch('worked', { ...state.worked, [sectionId]: draft.trim() })}>
          Check
        </button>
        {saved !== undefined && (
          <span role="status" className={`lf-verdict ${ok ? 'ok' : 'bad'}`}>
            {ok ? 'Correct.' : near ? step.near!.feedback : `${saved} is not right yet; the worked line is below.`}
          </span>
        )}
      </div>
      {saved !== undefined && (
        <div className="mt-2">
          {step.body.map((b, i) => (
            <p key={i}>{resolveRef(b)}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function WorkedView({ s }: { s: LearnSection }) {
  const w = s.worked
  if (!w) return null
  return (
    <section className="lf-worked" aria-labelledby={`${s.id}-worked`}>
      <h2 id={`${s.id}-worked`} className="lf-h3">
        {w.title}
      </h2>
      {w.kind === 'bullets' && <BulletStepThrough intro={resolveRef(w.intro)} items={w.bullets.map((i) => resolveBullet(w.block, i))} />}
      {w.kind === 'loop' && <LoopStepThrough loopId={w.loop} intro={w.intro.text} />}
      {w.kind === 'steps' && <BulletStepThrough intro={w.intro.text} items={w.steps.map((x) => x.text)} />}
      {w.kind === 'table' && <TableWorked intro={resolveRef(w.intro)} block={w.block} />}
      {w.kind === 'faded' && (
        <div className="lf-prose">
          <p>{resolveRef(w.setup)}</p>
          <ol className="lf-steps">
            {w.steps.map((st, i) => (
              <li key={i}>
                <h4>{st.title}</h4>
                {st.kind === 'shown' ? st.body.map((b, j) => <p key={j}>{resolveRef(b)}</p>) : <FadedInput sectionId={s.id} step={st} />}
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}

/** A worked example that is a reviewed block's table (e.g. register rows), shown in full after its introduction. */
function TableWorked({ intro, block }: { intro: string; block: string }) {
  const t = blockOf(block).table
  if (!t) return null
  return (
    <div className="lf-prose">
      <p>{intro}</p>
      <div className="lf-table-wrap" tabIndex={0} role="group" aria-label={t.caption}>
        <table className="lf-table" data-testid={`worked-table-${block}`}>
          <caption className="lf-figcaption" style={{ captionSide: 'bottom', textAlign: 'left' }}>
            {t.caption}
          </caption>
          <thead>
            <tr>
              {t.header.map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (j === 0 ? <th key={j} scope="row" className="text-left wb-mono text-[12.5px]">{c}</th> : <td key={j}>{c}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BulletStepThrough({ intro, items }: { intro: string; items: string[] }) {
  const [k, setK] = useState(1)
  return (
    <div className="lf-prose">
      <p>{intro}</p>
      <ol className="lf-steps" aria-live="polite">
        {items.slice(0, k).map((t, i) => (
          <li key={i}>
            <p>{t}</p>
          </li>
        ))}
      </ol>
      {k < items.length && (
        <button type="button" className="lf-btn small" onClick={() => setK(k + 1)}>
          Next step ({k} of {items.length})
        </button>
      )}
    </div>
  )
}

// ------------------------------------------------------------------------------------------- one section
/** A body paragraph; new text that paraphrases or quotes a reading shows its source inline (faculty item 6). */
function BodyPara({ b }: { b: LearnSection['body'][number] }) {
  const cites = 'cite' in b ? (b.cite ?? []) : []
  return (
    <p>
      {bodyText(b)}
      {cites.map((c, j) => (
        <span key={j}>
          {' '}
          <Cite c={c} />
        </span>
      ))}
    </p>
  )
}

function BodyView({ items }: { items: LearnSection['body'] }) {
  return (
    <>
      {items.map((b, i) =>
        b.callout ? (
          <aside key={i} className="lf-callout" aria-label={b.callout}>
            <h3>{b.callout}</h3>
            {'quote' in b && b.quote && (
              <blockquote className="lf-quote" data-testid="definition-quote">
                “{b.quote.text}” <Cite c={b.quote.cite} />
              </blockquote>
            )}
            <BodyPara b={b} />
          </aside>
        ) : (
          <BodyPara key={i} b={b} />
        ),
      )}
    </>
  )
}


function GoDeeper({ ids }: { ids: string[] }) {
  return (
    <details className="lf-deeper">
      <summary>Go deeper: the full reviewed text ({ids.length} block{ids.length > 1 ? 's' : ''})</summary>
      {ids.map((id) => {
        const b = blockOf(id)
        return (
          <div key={id} className="lf-block">
            <h3 className="lf-h3" style={{ marginTop: 6 }}>
              {b.title}
            </h3>
            {b.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {b.bullets && (
              <ul className="lf-list">
                {b.bullets.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            )}
            {b.quote && (
              <blockquote className="lf-quote">
                “{b.quote.text}” <Cite c={b.quote.cite} />
              </blockquote>
            )}
            {b.table && (
              <div className="lf-table-wrap">
                <table className="lf-table">
                  <caption className="lf-figcaption" style={{ captionSide: 'bottom', textAlign: 'left' }}>
                    {b.table.caption}
                  </caption>
                  <thead>
                    <tr>
                      {b.table.header.map((h) => (
                        <th key={h} scope="col">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.table.rows.map((r, i) => (
                      <tr key={i}>
                        {r.map((c, j) => (
                          <td key={j}>{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="m-0">
              {b.citations.map((c, i) => (
                <span key={i} className="mr-3 inline-block">
                  <Cite c={c} />
                </span>
              ))}
            </p>
          </div>
        )
      })}
    </details>
  )
}

function SectionView({ s, index }: { s: LearnSection; index: number }) {
  const { state, markRead } = useFlow()
  const answered = !!state.checks[s.id]
  const read = !!state.read[s.id]
  const next = LEARN_PAGES[index + 1]
  const prev = index > 0 ? LEARN_PAGES[index - 1] : null
  const nextTitle = next === 'summary' ? 'Summary and concept map' : LEARN_SECTIONS[index + 1]?.title
  return (
    <article className="lf-article" aria-labelledby={`${s.id}-h`} data-testid={`section-${s.id}`}>
      <p className="lf-kicker">
        Learn · {s.code} of L{LEARN_SECTIONS.length} · {s.minutes} min · {s.objectives.join(', ')} · {bloomLabel(s.bloom)}
      </p>
      <h1 id={`${s.id}-h`} className="lf-h1" tabIndex={-1}>
        {s.title}
      </h1>
      <p className="lf-question">{s.question.text}</p>
      <div className="lf-inshort">
        <strong>In short</strong>
        {s.inShort.text}
      </div>
      <div className="lf-prose">
        <BodyView items={s.body} />
      </div>
      {s.figures.map((f, i) => (
        <LearnFigure key={f.id} spec={f} number={`${s.code.slice(1)}${s.figures.length > 1 ? String.fromCharCode(97 + i) : ''}`} revealed={state.worked[s.id] !== undefined} />
      ))}
      <WorkedView s={s} />
      {s.afterWorked && s.afterWorked.length > 0 && (
        <div className="lf-prose">
          <BodyView items={s.afterWorked} />
        </div>
      )}
      {s.apply && (
        <aside className="lf-callout lf-apply" aria-labelledby={`${s.id}-apply`} data-testid={`apply-${s.id}`}>
          <h2 id={`${s.id}-apply`} className="lf-h3" style={{ marginTop: 0 }}>
            <Users size={16} aria-hidden className="mr-1 inline" /> Now apply it to your team’s enterprise
          </h2>
          <p className="m-0">{s.apply.text}</p>
        </aside>
      )}
      <section aria-labelledby={`${s.id}-terms`}>
        <h2 id={`${s.id}-terms`} className="lf-h3">
          Key terms
        </h2>
        <dl className="lf-terms">
          {s.keyTerms.items.map((t) => (
            <div key={t.term} className="contents">
              <dt>{t.term}</dt>
              <dd>
                {t.def}
                {t.source === 'course' ? (
                  <span className="lf-term-src course">Course working definition</span>
                ) : (
                  <span className="lf-term-src">
                    Source: <Cite c={t.source} />
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <SectionCheckView s={s} />
      {s.readMore.length > 0 && (
        <div className="lf-readmore" data-testid={`read-more-${s.id}`}>
          <strong>Read more</strong>
          <ul>
            {s.readMore.map((c, i) => (
              <li key={i}>
                <Link to={`/sources/${c.reading}${c.pages ? `/${encodeURIComponent(c.pages)}` : ''}`}>{formatCitation(c)}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="lf-sources">
        <strong>Sources</strong>
        {s.cite.length > 0 ? (
          <ul>
            {s.cite.map((c, i) => (
              <li key={i}>
                <Cite c={c} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0" data-testid={`convention-${s.id}`}>{s.convention?.text}</p>
        )}
      </div>
      {s.goDeeper.length > 0 && <GoDeeper ids={s.goDeeper} />}
      <div className="lf-pager">
        {prev ? (
          <Link to={`/week/1/learn/${prev}`} className="lf-btn">
            <ArrowLeft size={15} aria-hidden /> Previous
          </Link>
        ) : (
          <Link to="/week/1" className="lf-btn">
            <ArrowLeft size={15} aria-hidden /> Overview
          </Link>
        )}
        <span className="flex flex-wrap items-center gap-2">
          {read ? (
            <span className="lf-chip ok">
              <CheckIcon size={12} aria-hidden /> Read
            </span>
          ) : (
            <span className="lf-muted text-[14px]" id={`${s.id}-why`}>
              {answered ? '' : 'Answer the check to mark this section read.'}
            </span>
          )}
          <button
            type="button"
            className="lf-btn primary"
            disabled={!answered}
            aria-describedby={answered ? undefined : `${s.id}-why`}
            data-testid="mark-read"
            onClick={() => {
              if (!read) markRead(s.id)
              navigate(`/week/1/learn/${next}`)
            }}
          >
            {read ? 'Next' : 'Mark as read and continue'}: {nextTitle} <ArrowRight size={15} aria-hidden />
          </button>
        </span>
      </div>
    </article>
  )
}

// ------------------------------------------------------------------------------------------- summary
function SummaryView() {
  const { state, patch, allRead, readCount } = useFlow()
  const { instructor } = useApp()
  const objectives = WEEKS[0].objectives
  const revisit = objectives.filter((o) => !state.selfRating[o.id]).flatMap((o) => LEARN_SECTIONS.filter((s) => s.objectives[0] === o.id || s.check.objective === o.id).slice(0, 1).map((s) => ({ o, s })))
  return (
    <article aria-labelledby="summary-h" data-testid="section-summary">
      <p className="lf-kicker">Learn · Summary</p>
      <h1 id="summary-h" className="lf-h1" tabIndex={-1}>
        Summary and concept map
      </h1>
      <div className="lf-prose">
        {SUMMARY.recap.map((r, i) => (
          <p key={i}>{r.text}</p>
        ))}
      </div>
      <FigureFrame spec={SUMMARY.conceptMap} number="8" wide={false}>
        <ConceptMap />
      </FigureFrame>
      <section aria-labelledby="self-h" className="lf-card lf-wide">
        <h2 id="self-h" className="lf-h3" style={{ marginTop: 0 }}>
          Self-rating
        </h2>
        <p className="text-[15px]">{SUMMARY.selfRating.text}</p>
        <ul className="lf-plain">
          {objectives.map((o) => (
            <li key={o.id} className="py-1">
              <label className="lf-toggle text-[15px]">
                <input type="checkbox" checked={!!state.selfRating[o.id]} onChange={(e) => patch('selfRating', { ...state.selfRating, [o.id]: e.target.checked })} />
                <span>
                  <span className="wb-mono text-[12.5px]">{o.id}</span> {o.text}
                </span>
              </label>
            </li>
          ))}
        </ul>
        {revisit.length > 0 && Object.keys(state.selfRating).length > 0 && (
          <p className="lf-figure-note">
            Revisit:{' '}
            {revisit.map(({ o, s }, i) => (
              <span key={o.id}>
                {i > 0 && '; '}
                <Link to={`/week/1/learn/${s.id}`}>
                  {s.code} {s.title}
                </Link>{' '}
                ({o.id})
              </span>
            ))}
          </p>
        )}
      </section>
      <div className="lf-pager">
        <Link to={`/week/1/learn/${LEARN_SECTIONS.at(-1)!.id}`} className="lf-btn">
          <ArrowLeft size={15} aria-hidden /> Previous
        </Link>
        <span className="flex flex-wrap items-center gap-2">
          {!allRead && !instructor && <span className="lf-muted text-[14px]">{readCount} of {LEARN_SECTIONS.length} sections read: Practice opens when all are read.</span>}
          <Link to="/week/1/practice" className="lf-btn primary">
            Next: Practice in the workbench <ArrowRight size={15} aria-hidden />
          </Link>
        </span>
      </div>
    </article>
  )
}

// ------------------------------------------------------------------------------------------- the stage
export function Learn({ section }: { section?: string }) {
  const { state } = useFlow()
  const fallback = LEARN_SECTIONS.find((s) => !state.read[s.id])?.id ?? 'summary'
  const id = section && LEARN_PAGES.includes(section) ? section : fallback
  const index = LEARN_PAGES.indexOf(id)
  const s = LEARN_SECTIONS.find((x) => x.id === id)
  const main = useRef<HTMLDivElement>(null)
  // a new section starts at its top, with focus on its heading (keyboard and screen-reader users land in the content);
  // the first render keeps focus where the browser put it
  const prevId = useRef(id)
  useEffect(() => {
    if (prevId.current === id) return
    prevId.current = id
    window.scrollTo?.(0, 0)
    main.current?.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true })
  }, [id])
  return (
    <div className="lf-learn">
      <SectionList current={id} />
      <div ref={main} className="min-w-0">
        {s ? <SectionView key={s.id} s={s} index={index} /> : <SummaryView />}
      </div>
    </div>
  )
}
