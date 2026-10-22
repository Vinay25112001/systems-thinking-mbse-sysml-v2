// Learn, the Week 1 digital textbook (spec §d, M4 part A): one chapter per route inside the Week 1 shell, a three-track
// reading grid (chapter navigation 240 px · main column 680 px of 18 px text · reference rail 300 px; drawers on tablet and
// phone), sticky chapter navigation with read state, footnote citations built from the register (never R- or S-codes),
// figures with text descriptions and an expand dialog, knowledge checks after the instruction (optional, not graded),
// common errors and "used later" at each chapter end, and stable content ids (w01.learn.chNN-nn).
// Scoped to Week 1: its own stylesheet (studio.css, .w1l-*) and components, so the shared lesson reader and
// lectures.css that serve Weeks 2–6 and 8 are untouched (X6).
import { BookOpen, Check, ChevronLeft, ChevronRight, Circle, ListTree, Maximize2, NotebookTabs, X } from 'lucide-react'
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { FigureWording } from '../../components/figures/figureWording'
import { FIGURE_REGISTRY } from '../../components/figures/registry'
import { allSlides } from '../../content/lectures/text'
import { lectureCredits, lectureReferences } from '../../content/lectures/references'
import { WEEK01_SESSION1 } from '../../content/lectures/week01/session1'
import { WEEK1_SESSION2 } from '../../content/lectures/week01/session2'
import type { FigureRef } from '../../content/lectures/types'
import { SUMMARY } from '../../content/learn/week01'
import { parseInline } from '../../content/lectures/text'
import { IS_STUDENT_EDITION } from '../../lib/edition'
import { Link } from '../../lib/router'
import { learnPath } from '../route'
import { WeekShell } from '../WeekShell'
import BoundaryExplorer from './BoundaryExplorer'
import ProgressiveTrace from './ProgressiveTrace'
import './figures.css'
import StakeholderMap from './StakeholderMap'
import { knowledgeCheck } from './checks'
import { COMMON_ERRORS } from './commonErrors.generated'
import { buildChapter, learnAsLecture, type ChapterModel, type Note, type RBlock, type Rich, type SectionModel } from './model'
import { readableWidth } from './figureText'
import { useLearnProgress, type LearnProgress } from './progress'
import { GLANCE, TERMS, termByName, usedLater, type Term } from './rail'
import { figureWording, splitCitations, studentCitation, studentText, sourcesHref } from './studentText'
import { BACK_MATTER, CHAPTERS, GAPS, GAP_LABEL, LESSONS, allSections, chapterById, contentId, partBlocks, visibleInEdition } from './textbook'
import { LEGACY_TO_SECTION } from '../route'
// --- publishing --- (M3: latest published content, update banner, instructor edit link)
import { useLearnOverlay } from './usePublished'
import { ContentUpdateBanner } from '../../publishing/usePublishedContent'
import { EditContentLink } from '../../authoring/EditLink'
// --- end publishing ---

// ------------------------------------------------------------------------------------------------ inline text
function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((r, i) => (r.bold ? <strong key={i}>{r.text}</strong> : r.em ? <em key={i}>{r.text}</em> : <Fragment key={i}>{r.text}</Fragment>))}
    </>
  )
}

function RichText({ rich, ch }: { rich: Rich; ch: string }) {
  return (
    <>
      {rich.map((s, i) =>
        't' in s ? (
          <Inline key={i} text={s.t} />
        ) : (
          <sup key={i} className="w1l-fn" id={`${ch}-fnref${s.n}`}>
            <Link to={learnPath(ch, `${ch}-fn${s.n}`)} aria-label={`Note ${s.n}`}>
              {s.n}
            </Link>
          </sup>
        ),
      )}
    </>
  )
}

/** Plain text with inline register codes (glossary, check sources): codes become a trailing source line. */
function CitedPlain({ text }: { text: string }) {
  const segs = splitCitations(studentText(text))
  return (
    <>
      {segs.map((s, i) => ('text' in s ? <Inline key={i} text={s.text} /> : null))}
      {segs.filter((s) => 'cite' in s).map((s, i) => ('cite' in s ? <SourceLine key={`c${i}`} c={s.cite} /> : null))}
    </>
  )
}

function SourceLine({ c }: { c: Note['cite'] }) {
  return (
    <span className="w1l-source">
      {' '}
      <Link to={sourcesHref(c)}>{studentCitation(c)}</Link>
    </span>
  )
}

// ------------------------------------------------------------------------------------------------ dialog (expand)
function useExpand() {
  const ref = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const open = () => {
    const d = ref.current
    if (d && typeof d.showModal === 'function') d.showModal()
    else d?.setAttribute('open', '')
  }
  const close = () => {
    ref.current?.close?.()
    ref.current?.removeAttribute('open')
    opener.current?.focus()
  }
  return { ref, opener, open, close }
}

function ExpandDialog({ x, label, children }: { x: ReturnType<typeof useExpand>; label: string; children: ReactNode }) {
  return (
    <dialog ref={x.ref} className="w1l-dialog" aria-label={label} onCancel={(e) => (e.preventDefault(), x.close())}>
      <div className="w1l-dialog-head">
        <p>{label}</p>
        <button type="button" className="w1l-btn" onClick={x.close}>
          Close
        </button>
      </div>
      {children}
    </dialog>
  )
}

// ------------------------------------------------------------------------------------------------ figures and tables
function useReadableArt() {
  const ref = useRef<HTMLDivElement>(null)
  const [minW, setMinW] = useState<number | null>(null)
  const [small, setSmall] = useState(false)
  useLayoutEffect(() => {
    const el = ref.current
    const svg = el?.querySelector('svg')
    if (!el || !svg) return
    const w = readableWidth(svg)
    setMinW(w)
    const fit = () => setSmall(!!w && el.clientWidth > 0 && w > el.clientWidth + 1)
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return { ref, style: minW ? ({ '--w1l-art-min': `${minW}px` } as React.CSSProperties) : undefined, small }
}

/** FD-f (Expand-first figures, integrator decision 2026-10-21, following the M1 spec §d.6): inline, a figure fits the
 *  column (no sideways scroll); where its smallest label falls below 13 px at that width, a note says so and the visible
 *  "Expand" opens a full-viewport view in which the drawing is never narrower than its readable width (labels ≥ 13 px;
 *  a phone scrolls inside that view). The text description stays one click away. */
function FigureArt({ entry, figure, number, big = false }: { entry: (typeof FIGURE_REGISTRY)[string]; figure: FigureRef; number: string; big?: boolean }) {
  const r = useReadableArt()
  return (
    <>
      <div ref={r.ref} style={big ? r.style : undefined} className={`w1l-figure-art${big ? ' is-readable is-big' : ''}`} tabIndex={0} role="group" aria-label={`Figure ${number} drawing`}>
        {/* labels inside the shared drawing in the student wording (objectives, teaching assumption; F1, F10) */}
        <FigureWording.Provider value={figureWording}>{entry.render(figure.alt)}</FigureWording.Provider>
      </div>
      {!big && r.small && (
        <p className="w1l-fig-scrollhint" data-testid="figure-expand-hint">
          Some labels are small at this width: use Expand to read the figure at full size, or open the text description.
        </p>
      )}
    </>
  )
}

function FigureFrame({ figure, number }: { figure: FigureRef; number: string }) {
  const x = useExpand()
  const entry = FIGURE_REGISTRY[figure.id]
  const art = entry ? <FigureArt entry={entry} figure={figure} number={number} /> : <p className="w1l-missing">Figure “{figure.id}” is not registered.</p>
  return (
    <figure className="w1l-figure" data-testid={`learn-figure-${figure.id}`} data-figure-id={`fig.${figure.id}`}>
      {art}
      <figcaption>
        <span className="w1l-fig-no">Figure {number}</span> <Inline text={figure.caption} />
      </figcaption>
      <div className="w1l-fig-actions">
        <button type="button" className="w1l-linkbtn" ref={x.opener} onClick={x.open}>
          <Maximize2 size={14} aria-hidden /> Expand<span className="sr-only"> figure {number}</span>
        </button>
      </div>
      <details className="w1l-textequiv">
        <summary>Show text description</summary>
        <p data-testid={`text-equivalent-${figure.id}`}>{figure.alt}</p>
      </details>
      <ExpandDialog x={x} label={`Figure ${number}, expanded`}>
        {entry && <FigureArt entry={entry} figure={figure} number={number} big />}
        <p className="w1l-dialog-cap">
          <Inline text={figure.caption} />
        </p>
      </ExpandDialog>
    </figure>
  )
}

function TableView({ b, ch }: { b: Extract<RBlock, { kind: 'table' }>; ch: string }) {
  const x = useExpand()
  const wide = b.header.length >= 5
  const table = (
    <table className="w1l-table">
      {b.caption && (
        <caption>
          <RichText rich={b.caption} ch={ch} />
        </caption>
      )}
      <thead>
        <tr>
          {b.header.map((h, i) => (
            <th key={i} scope="col">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {b.rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) =>
              j === 0 ? (
                <th key={j} scope="row">
                  <RichText rich={c} ch={ch} />
                </th>
              ) : (
                <td key={j}>
                  <RichText rich={c} ch={ch} />
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
  return (
    <div className="w1l-tableblock">
      <div className={`w1l-tablewrap${wide ? ' is-wide' : ''}`} tabIndex={0} role="region" aria-label={`Table: ${b.header.join(', ')}`}>
        {table}
      </div>
      {wide && (
        <>
          <div className="w1l-fig-actions">
            <button type="button" className="w1l-linkbtn" ref={x.opener} onClick={x.open}>
              <Maximize2 size={14} aria-hidden /> Expand table
            </button>
          </div>
          <ExpandDialog x={x} label="Table, expanded">
            <div className="w1l-tablewrap is-dialog">{table}</div>
          </ExpandDialog>
        </>
      )}
    </div>
  )
}

const CALLOUT_LABEL = { note: 'Note', key: 'Key point', caution: 'Caution' } as const

function BlockView({ b, ch }: { b: RBlock; ch: string }) {
  switch (b.kind) {
    case 'para':
      return (
        <p>
          <RichText rich={b.rich} ch={ch} />
        </p>
      )
    case 'heading':
      return <h3 className="w1l-h3">{b.text}</h3>
    case 'bullets':
      return (
        <ul className="w1l-list">
          {b.items.map((it, i) => (
            <li key={i}>
              <RichText rich={it.rich} ch={ch} />
              {it.sub.length > 0 && (
                <ul>
                  {it.sub.map((s, j) => (
                    <li key={j}>
                      <RichText rich={s} ch={ch} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )
    case 'definition':
      return (
        <div className="w1l-definition">
          <p className="w1l-def-term">{b.term}</p>
          <p>
            <RichText rich={[...b.rich, { n: b.note }]} ch={ch} />
          </p>
        </div>
      )
    case 'table':
      return <TableView b={b} ch={ch} />
    case 'equation':
      return (
        <div className="w1l-equation">
          <p role="math" aria-label={b.speech}>
            {b.display}
          </p>
          {b.where && (
            <dl>
              {b.where.map((w, i) => (
                <div key={i}>
                  <dt>{w.symbol}</dt>
                  <dd>{w.meaning}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )
    case 'callout':
      return (
        <div className={`w1l-callout is-${b.tone}`}>
          <p className="w1l-callout-title">{b.title ?? CALLOUT_LABEL[b.tone]}</p>
          <p>
            <RichText rich={b.rich} ch={ch} />
          </p>
        </div>
      )
    case 'steps':
      return (
        <ol className="w1l-steps">
          {b.items.map((s, i) => (
            <li key={i}>
              <strong>{s.label}.</strong> <RichText rich={s.rich} ch={ch} />
            </li>
          ))}
        </ol>
      )
    case 'figure':
      return <FigureFrame figure={b.figure} number={b.number} />
    case 'interactive':
      return b.id === 'IF-6' ? <StakeholderMap number={b.number} /> : b.id === 'IF-7' ? <ProgressiveTrace number={b.number} /> : <BoundaryExplorer number={b.number} />
  }
}

// ------------------------------------------------------------------------------------------------ knowledge check
function KnowledgeCheck({ id, progress, answer, sectionNo }: { id: string; progress: LearnProgress; answer: (id: string, choice: string, correct: boolean) => void; sectionNo: string }) {
  const c = knowledgeCheck(id)
  const rec = progress.checked[id]
  const [choice, setChoice] = useState(rec?.choice ?? '')
  const [shown, setShown] = useState(!!rec)
  const chosen = c.options.find((o) => o.id === choice)
  return (
    <details className="w1l-check" data-testid={`learn-check-${id}`} data-check-id={`w01.check.${id}`}>
      <summary>Check your understanding (optional, not graded)</summary>
      <fieldset>
        <legend>{c.prompt}</legend>
        {c.options.map((o) => (
          <label key={o.id} className={`w1l-option${shown && o.id === choice ? (o.correct ? ' is-right' : ' is-wrong') : ''}`}>
            <input type="radio" name={`chk-${id}`} value={o.id} checked={choice === o.id} onChange={() => (setChoice(o.id), setShown(false))} />
            <span>{o.text}</span>
          </label>
        ))}
      </fieldset>
      <div className="w1l-check-foot">
        <button type="button" className="w1l-btn" disabled={!choice} onClick={() => (setShown(true), chosen && answer(id, choice, chosen.correct))}>
          Check my answer
        </button>
        {!choice && <span className="w1l-muted">Choose an option first.</span>}
      </div>
      <div role="status" className="w1l-check-feedback">
        {shown && chosen && (
          <p>
            <strong>{chosen.correct ? 'Correct.' : 'Not quite.'}</strong> {chosen.feedback.replace(/^(Correct\.|Yes\.|No\.)\s*/, '')}
            {!chosen.correct && (
              <>
                {' '}
                Read section {sectionNo} again, then try another option.
              </>
            )}
          </p>
        )}
      </div>
      {c.cite && (
        <p className="w1l-check-src">
          Source: <SourceLine c={c.cite} />
        </p>
      )}
    </details>
  )
}

// ------------------------------------------------------------------------------------------------ navigation and rail
function ChapterNav({ model, current, progress, open, onClose }: { model: ChapterModel | null; current: string; progress: LearnProgress; open: boolean; onClose: () => void }) {
  const ch = model?.chapter
  const visible = model ? model.sections : []
  const readHere = visible.filter((s) => progress.read[s.section.id]).length
  return (
    <aside className={`w1l-nav${open ? ' is-open' : ''}`} aria-label="Textbook contents" data-testid="learn-nav">
      <div className="w1l-drawer-head">
        <p>Contents</p>
        <button type="button" className="w1l-btn" onClick={onClose}>
          <X size={14} aria-hidden /> Close
        </button>
      </div>
      <p className="w1l-nav-title">Week 1 textbook</p>
      {ch && (
        <>
          <p className="w1l-nav-meta" data-testid="learn-chapter-of">
            Chapter {ch.no} of 11 · {readHere} of {visible.length} sections read in this chapter
          </p>
          <div className="w1l-bar" aria-hidden>
            <span style={{ width: `${visible.length ? (100 * readHere) / visible.length : 0}%` }} />
          </div>
        </>
      )}
      <nav aria-label="Week 1 chapters">
        <ol className="w1l-chapters">
          {CHAPTERS.map((c) => {
            const here = c.id === ch?.id
            const secs = c.sections.filter(visibleInEdition)
            const allRead = secs.length > 0 && secs.every((s) => progress.read[s.id])
            return (
              <li key={c.id} className={here ? 'is-current' : undefined}>
                <Link to={learnPath(c.id)} aria-current={here && !current ? 'page' : undefined} onClick={onClose}>
                  <span className="w1l-chno">{c.no}</span>
                  <span>
                    {c.title}
                    {allRead && (
                      <span className="w1l-readmark">
                        <Check size={12} aria-hidden /> <span className="sr-only">(all sections read)</span>
                      </span>
                    )}
                  </span>
                </Link>
                {here && model && (
                  <ol className="w1l-sections">
                    {model.sections.map((s) => {
                      const read = !!progress.read[s.section.id]
                      return (
                        <li key={s.section.id}>
                          <Link to={learnPath(c.id, s.section.id)} aria-current={s.section.id === current ? 'location' : undefined} onClick={onClose}>
                            <span className="w1l-readicon" aria-hidden>
                              {read ? <Check size={12} strokeWidth={3} /> : <Circle size={10} />}
                            </span>
                            <span>
                              {s.number} {s.section.title}
                              <span className="sr-only">{read ? ' (read)' : ' (not read yet)'}</span>
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </li>
            )
          })}
          <li className={model ? undefined : 'is-current'}>
            <span className="w1l-chno" aria-hidden>
              ·
            </span>
            <span className="w1l-backmatter">
              {BACK_MATTER.map((b, i) => (
                <Fragment key={b.id}>
                  {i > 0 && ' · '}
                  <Link to={learnPath(b.id)} onClick={onClose}>
                    {b.title}
                  </Link>
                </Fragment>
              ))}
            </span>
          </li>
        </ol>
      </nav>
      <p className="w1l-nav-note">Your reading progress is saved in this browser only.</p>
    </aside>
  )
}

function TermCard({ t }: { t: Term }) {
  return (
    <div className="w1l-term">
      <p className="w1l-term-name">{t.term}</p>
      <p>{t.def}</p>
      <p className="w1l-term-src">{t.source === 'course' ? <span className="w1l-chip">course convention</span> : <Link to={sourcesHref(t.source)}>{studentCitation(t.source)}</Link>}</p>
    </div>
  )
}

function ReferenceRail({ model, sec, open, onClose }: { model: ChapterModel; sec: SectionModel | undefined; open: boolean; onClose: () => void }) {
  const ch = model.chapter
  const terms = (sec?.section.terms ?? []).map(termByName).filter((t): t is Term => !!t)
  const later = usedLater(ch.later)
  return (
    <aside className={`w1l-rail${open ? ' is-open' : ''}`} aria-label="Reference" data-testid="learn-rail" tabIndex={0}>
      <div className="w1l-drawer-head">
        <p>Reference</p>
        <button type="button" className="w1l-btn" onClick={onClose}>
          <X size={14} aria-hidden /> Close
        </button>
      </div>
      {(terms.length > 0 || (sec?.definitions.length ?? 0) > 0) && (
        <section className="w1l-card" aria-labelledby="rail-defs">
          <h2 id="rail-defs" className="w1l-card-h">
            Definitions here
          </h2>
          {sec?.definitions.map((d) => (
            <div key={d.term} className="w1l-term">
              <p className="w1l-term-name">{d.term}</p>
              <p>{d.text}</p>
              <p className="w1l-term-src">See note {d.note}.</p>
            </div>
          ))}
          {terms.map((t) => (
            <TermCard key={t.term} t={t} />
          ))}
        </section>
      )}
      <section className="w1l-card is-example" aria-labelledby="rail-aerolink" data-testid="rail-aerolink">
        <h2 id="rail-aerolink" className="w1l-card-h">
          AeroLink at a glance
        </h2>
        <p className="w1l-badge">
          <BookOpen size={12} aria-hidden /> Fictional teaching case
        </p>
        {ch.glance.map((k) => (
          <div key={k} className="w1l-glance">
            <p className="w1l-term-name">{GLANCE[k].title}</p>
            <ul>
              {GLANCE[k].lines.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      {later.length > 0 && (
        <section className="w1l-card" aria-labelledby="rail-later">
          <h2 id="rail-later" className="w1l-card-h">
            Used later
          </h2>
          <ul>
            {later.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </section>
      )}
      {sec && sec.notes.length > 0 && (
        <section className="w1l-card" aria-labelledby="rail-notes">
          <h2 id="rail-notes" className="w1l-card-h">
            Notes, section {sec.number}
          </h2>
          <ol className="w1l-sidenotes">
            {sec.notes.map((n) => (
              <li key={n.n} value={n.n}>
                <Link to={sourcesHref(n.cite)}>{studentCitation(n.cite)}</Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </aside>
  )
}

// ------------------------------------------------------------------------------------------------ the reader
function useInView(ids: string[], onChange: (id: string) => void) {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || ids.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (top) onChange(top.target.id)
      },
      { rootMargin: '-120px 0px -55% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [ids, onChange])
}

export default function LearnReader({ chapter, section, path }: { chapter?: string; section?: string; path: string }) {
  const id = chapter ?? 'ch01'
  const ch = chapterById(id)
  const overlay = useLearnOverlay() // publishing (M3)
  const model = useMemo(() => (ch ? buildChapter(ch, overlay) : null), [ch, overlay])
  const { progress, open, markRead, answer } = useLearnProgress()
  const [inView, setInView] = useState<string>(section ?? model?.sections[0]?.section.id ?? '')
  const [drawer, setDrawer] = useState<'nav' | 'rail' | null>(null)
  const ids = useMemo(() => model?.sections.map((s) => s.section.id) ?? [], [model])
  useInView(ids, setInView)
  useEffect(() => {
    if (inView && model?.sections.some((s) => s.section.id === inView)) open(inView)
  }, [inView, model, open])
  // a section in the URL fragment: scroll to it after App's own scroll-to-top (rAF runs after the parent effects)
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (!section) return window.scrollTo?.(0, 0)
      const el = document.getElementById(section)
      el?.scrollIntoView?.({ block: 'start' })
      if (el && /^ch\d\d-\d\d$/.test(section)) setInView(section)
    })
    return () => cancelAnimationFrame(raf)
  }, [id, section])
  useEffect(() => {
    if (!drawer) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawer])

  const back = BACK_MATTER.find((b) => b.id === id)
  const title = ch ? `Learn · Chapter ${ch.no}` : back ? `Learn · ${back.title}` : 'Learn'
  const crumbs = [{ label: 'Week 1', to: '/week/1' }, { label: 'Learn', to: learnPath() }, { label: ch ? `Ch. ${ch.no} ${ch.title}` : (back?.title ?? 'Learn') }]
  const sec = model?.sections.find((s) => s.section.id === inView) ?? model?.sections[0]
  const idx = CHAPTERS.findIndex((c) => c.id === id)
  const prev = idx > 0 ? CHAPTERS[idx - 1] : null
  const next = idx >= 0 && idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null
  const chapterRead = model ? model.sections.filter((s) => progress.read[s.section.id]).length : 0
  const lastSec = progress.last ? allSections().find((x) => x.section.id === progress.last) : undefined
  const resume = !chapter && lastSec && lastSec.chapter.id !== 'ch01' ? lastSec : undefined

  return (
    <WeekShell path={path} title={title} compact crumbs={crumbs}>
      <div className="w1l" data-testid="learn-reader">
        <div className="w1l-readbar" aria-hidden>
          <span style={{ width: `${model && model.sections.length ? (100 * chapterRead) / model.sections.length : 0}%` }} />
        </div>
        <div className="w1l-toolbar">
          <button type="button" className="w1l-btn" onClick={() => setDrawer('nav')} aria-expanded={drawer === 'nav'}>
            <ListTree size={15} aria-hidden /> Contents
          </button>
          <p className="w1l-toolbar-title">{ch ? `Chapter ${ch.no} of 11` : back?.title}</p>
          {model && (
            <button type="button" className="w1l-btn" onClick={() => setDrawer('rail')} aria-expanded={drawer === 'rail'}>
              <NotebookTabs size={15} aria-hidden /> Reference
            </button>
          )}
        </div>
        {drawer && <div className="w1l-scrim" onClick={() => setDrawer(null)} aria-hidden />}
        <div className={`w1l-grid${model ? '' : ' is-back'}`}>
          <ChapterNav model={model} current={inView} progress={progress} open={drawer === 'nav'} onClose={() => setDrawer(null)} />
          <article className="w1l-main" aria-labelledby="w1l-title">
            <ContentUpdateBanner scope="week1" /> {/* publishing (M3) */}
            {resume && (
              <p className="w1l-resume" data-testid="learn-resume">
                Resume where you left off: <Link to={learnPath(resume.chapter.id, resume.section.id)}>{resume.section.title}</Link>
              </p>
            )}
            {model ? <ChapterBody model={model} progress={progress} markRead={markRead} answer={answer} /> : back ? <BackMatterBody id={back.id} /> : <p>Unknown chapter.</p>}
            <nav className="w1l-pager" aria-label="Chapters">
              {prev ? (
                <Link to={learnPath(prev.id)} className="w1l-btn">
                  <ChevronLeft size={15} aria-hidden /> Chapter {prev.no}: {prev.title}
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link to={learnPath(next.id)} className="w1l-btn primary" data-testid="learn-next">
                  Chapter {next.no}: {next.title} <ChevronRight size={15} aria-hidden />
                </Link>
              ) : model ? (
                <Link to={learnPath('refs')} className="w1l-btn primary">
                  References and credits <ChevronRight size={15} aria-hidden />
                </Link>
              ) : (
                <Link to="/week/1/practice" className="w1l-btn primary">
                  Next: Guided Practice <ChevronRight size={15} aria-hidden />
                </Link>
              )}
            </nav>
          </article>
          {model && <ReferenceRail model={model} sec={sec} open={drawer === 'rail'} onClose={() => setDrawer(null)} />}
        </div>
      </div>
    </WeekShell>
  )
}

/** Consecutive extension blocks form one labelled box (faculty decision 2026-10-21: some reading optional, not counted). */
function groupBlocks(blocks: RBlock[]): { optional: boolean; blocks: RBlock[] }[] {
  const out: { optional: boolean; blocks: RBlock[] }[] = []
  for (const b of blocks) {
    const last = out[out.length - 1]
    if (last && last.optional === !!b.optional) last.blocks.push(b)
    else out.push({ optional: !!b.optional, blocks: [b] })
  }
  return out
}

function ChapterBody({ model, progress, markRead, answer }: { model: ChapterModel; progress: LearnProgress; markRead: (id: string, read: boolean) => void; answer: (id: string, choice: string, correct: boolean) => void }) {
  const ch = model.chapter
  const errors = COMMON_ERRORS[ch.id] ?? []
  const later = usedLater(ch.later)
  const overlay = useLearnOverlay() // publishing (M3): "Updated since you read it" (FD-C4 default: badge only)
  return (
    <div data-content-id={`w01.learn.${ch.id}`}>
      <p className="w1l-kicker">Chapter {ch.no} of 11</p>
      <h1 id="w1l-title" className="w1l-h1">
        {ch.title}
      </h1>
      {model.sections.map((s) => {
        const read = !!progress.read[s.section.id]
        const gap = GAPS[s.section.id]
        return (
          <section key={s.section.id} id={s.section.id} data-content-id={contentId(s.section.id)} className="w1l-section" aria-labelledby={`${s.section.id}-h`} tabIndex={-1}>
            <h2 id={`${s.section.id}-h`} className="w1l-h2">
              <span className="w1l-secno">{s.number}</span> {s.section.title}
              {/* --- publishing --- */}
              {read && overlay?.meta[s.section.id] && overlay.meta[s.section.id].seq > 1 && Date.parse(overlay.meta[s.section.id].publishedAt) > progress.read[s.section.id] && (
                <span className="pub-updated" data-testid={`updated-since-read-${s.section.id}`}>
                  Updated since you read it
                </span>
              )}
              {/* --- end publishing --- */}
            </h2>
            <EditContentLink itemId={contentId(s.section.id)} /> {/* publishing (M3): instructor only (NAV-20) */}
            {groupBlocks(s.blocks).map((g, i) =>
              g.optional ? (
                <aside key={i} className="w1l-extension" aria-label="Extension reading (optional, not counted)" data-testid="learn-extension">
                  <p className="w1l-extension-title">Extension reading (optional, not counted)</p>
                  {g.blocks.map((b, k) => (
                    <BlockView key={k} b={b} ch={ch.id} />
                  ))}
                </aside>
              ) : (
                g.blocks.map((b, k) => <BlockView key={`${i}-${k}`} b={b} ch={ch.id} />)
              ),
            )}
            {!IS_STUDENT_EDITION && gap && (
              <div className="w1l-gap" role="note" data-testid={`gap-${s.section.id}`}>
                <p className="w1l-gap-title">{GAP_LABEL}</p>
                <p>
                  Faculty view only (not in the student edition). Gap {gap.id}, about {gap.words} words: {gap.need}
                </p>
              </div>
            )}
            {s.section.link && (
              <p className="w1l-seclink" data-testid={`learn-link-${s.section.id}`}>
                <Link to={s.section.link.to} className="w1l-btn">
                  {s.section.link.label} <ChevronRight size={15} aria-hidden />
                </Link>
              </p>
            )}
            {s.section.check && <KnowledgeCheck id={s.section.check} progress={progress} answer={answer} sectionNo={s.number} />}
            {s.notes.length > 0 && (
              <ol className="w1l-notes" aria-label={`Notes for section ${s.number}`}>
                {s.notes.map((n) => (
                  <li key={n.n} id={`${ch.id}-fn${n.n}`} value={n.n}>
                    <Link to={sourcesHref(n.cite)}>{studentCitation(n.cite)}</Link>{' '}
                    <Link to={learnPath(ch.id, `${ch.id}-fnref${n.n}`)} aria-label={`Back to the text of note ${n.n}`} className="w1l-backlink">
                      ↩
                    </Link>
                  </li>
                ))}
              </ol>
            )}
            <div className="w1l-secfoot">
              <button type="button" className={`w1l-btn${read ? '' : ' primary'}`} aria-pressed={read} onClick={() => markRead(s.section.id, !read)} data-testid={`mark-read-${s.section.id}`}>
                {read ? <Check size={14} aria-hidden /> : null} {read ? `Section ${s.number} read` : `Mark section ${s.number} read`}
              </button>
            </div>
          </section>
        )
      })}
      {errors.length > 0 && (
        <section className="w1l-errors" aria-labelledby="w1l-errors-h" data-testid="learn-common-errors">
          <h2 id="w1l-errors-h" className="w1l-card-h">
            Common errors
          </h2>
          <ul>
            {errors.map((e) => (
              <li key={e.claim}>
                <strong>“{e.claim}”</strong> <CitedPlain text={e.correction} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {later.length > 0 && (
        <p className="w1l-usedlater" data-testid="learn-used-later">
          <strong>Used later.</strong> {later.join(' ')}
        </p>
      )}
    </div>
  )
}

// ------------------------------------------------------------------------------------------------ back matter
function BackMatterBody({ id }: { id: 'refs' | 'glossary' | 'summary' }) {
  if (id === 'refs') {
    // the lessons' citations plus those of the textbook's own prose (M4b), merged per reading
    const lectures = [WEEK01_SESSION1, WEEK1_SESSION2, learnAsLecture()]
    return (
      <div data-content-id="w01.learn.refs">
        <h1 id="w1l-title" className="w1l-h1">
          References and credits
        </h1>
        <p>Every source cited in Week 1, with the pages cited.</p>
        <ul className="w1l-list w1l-refs">
          {lectureReferences(lectures).map((e) => (
            <li key={e.reading.id}>
              <Link to={`/sources/${e.reading.id}`}>{studentCitation({ reading: e.reading.id, pages: e.pages })}</Link>
            </li>
          ))}
        </ul>
        <h2 className="w1l-h2">Credits and licenses</h2>
        <ul className="w1l-list">
          {lectureCredits(lectures).map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
    )
  }
  if (id === 'glossary') {
    const terms = [...new Map(TERMS.map((t) => [t.term, t])).values()].sort((a, b) => a.term.localeCompare(b.term))
    return (
      <div data-content-id="w01.learn.glossary">
        <h1 id="w1l-title" className="w1l-h1">
          Glossary
        </h1>
        <p>Each term with its definition and source; “course convention” marks a term this course defines where no source in the collection does.</p>
        <div className="w1l-glossary">
          {terms.map((t) => (
            <TermCard key={t.term} t={t} />
          ))}
        </div>
      </div>
    )
  }
  const cls = LESSONS['s1-lesson-classifying']
  const review = partBlocks({ kind: 'lesson', lesson: cls.section.id, from: 9, to: 10 })
  return (
    <div data-content-id="w01.learn.summary">
      <h1 id="w1l-title" className="w1l-h1">
        Week 1 in one page
      </h1>
      <ul className="w1l-list">
        {SUMMARY.recap.map((r, i) => (
          <li key={i}>{studentText(r.text)}</li>
        ))}
      </ul>
      <h2 className="w1l-h2">Questions to review</h2>
      {review.map((b, i) =>
        b.kind === 'bullets' ? (
          <ul key={i} className="w1l-list">
            {b.items.map((it, j) => (
              <li key={j}>
                <Inline text={studentText(typeof it === 'string' ? it : it.text)} />
              </li>
            ))}
          </ul>
        ) : b.kind === 'callout' ? (
          <div key={i} className="w1l-callout is-note">
            <p className="w1l-callout-title">{b.title ? studentText(b.title) : null}</p>
            <p>
              <CitedPlain text={b.text} />
            </p>
          </div>
        ) : null,
      )}
    </div>
  )
}

/** /week/1/lecture/:s/:n for a student: the Learn section whose text the slide's figure illustrates. */
export function LearnFromSlide({ session, slide }: { session: number; slide?: number }) {
  const target = useMemo(() => slideTarget(session, slide), [session, slide])
  useEffect(() => {
    window.location.replace(`#${target}`)
  }, [target])
  return null
}

export function slideTarget(session: number, slide?: number): string {
  const lecture = session === 1 ? WEEK01_SESSION1 : session === 2 ? WEEK1_SESSION2 : null
  if (!lecture || !slide) return learnPath()
  const s = allSlides(lecture)[slide - 1]
  if (!s) return learnPath()
  for (const { chapter, section } of allSections())
    for (const p of section.parts)
      if (p.kind === 'lesson' && LESSONS[p.lesson].lecture === lecture && partBlocks(p).some((b) => b.kind === 'figure' && 'slide' in b && b.slide === s.id)) return learnPath(chapter.id, section.id)
  // no figure of that slide in Learn (review M4A F15): the lesson section that points at the slide (figure or slide
  // pointer), or failing that at the nearest slide of the same lecture section, and the Learn section that opens with it
  const lessonOf = (slideId: string) => lecture.studentLesson.find((ls) => ls.blocks.some((b) => (b.kind === 'figure' || b.kind === 'slide-ref') && 'slide' in b && b.slide === slideId))?.id
  const group = lecture.sections.find((x) => x.slides.some((y) => y.id === s.id))?.slides ?? []
  const at = group.findIndex((y) => y.id === s.id)
  const order = [...group.slice(0, at + 1).reverse(), ...group.slice(at + 1)]
  for (const y of order) {
    const target = LEGACY_TO_SECTION[lessonOf(y.id) ?? '']
    const hit = target ? allSections().find((x) => x.section.id === target) : undefined
    if (hit) return learnPath(hit.chapter.id, hit.section.id)
  }
  return learnPath()
}
