// Practice → My Project handoff panel (directive §8, mockup docs/ux/mockups/practice-handoff.html): the from/to strip
// (AeroLink → your enterprise), "Now apply this engineering method to your own enterprise", what to create, what it
// builds on, how it connects, how completion is determined and the evidence to submit; the primary action opens the
// editor. Optional: AeroLink rows as templates (faculty decision F4), only through TemplateCopy's review and warning.
import { ArrowRight, FolderOpen } from 'lucide-react'
import { useState } from 'react'
import { Link } from '../../lib/router'
import { projectTitle } from '../model/create'
import { useProjectState } from '../store/ProjectProvider'
import { COPY_FROM_PRACTICE_ENABLED } from './copyFromPractice'
import { TemplateCopy } from './TemplateCopy'
import { HANDOFFS } from './handoffs'
import '../pages/project.css'

export function Handoff({ week, where }: { week: number; where: 'examples' | 'practice' | 'lab' }) {
  const h = HANDOFFS[week]
  const st = useProjectState()
  const [msg, setMsg] = useState('')
  if (!h) return null
  const name = st.doc ? projectTitle(st.doc) : ''
  const compact = where === 'lab'
  return (
    <section className="pj-scope pj-handoff" aria-labelledby={`handoff-${week}-${where}`} data-testid="handoff-panel">
      <div className="pj-handoff-strip">
        <span className="from">
          You practised on
          <strong>AeroLink · instructor example</strong>
        </span>
        <hr />
        <span className="via pj-muted">same method</span>
        <hr />
        <span className="to">
          Now apply it to
          <strong>{name ? `${name} · your enterprise` : 'Your enterprise'}</strong>
        </span>
      </div>
      <div className="pj-handoff-body">
        <h2 id={`handoff-${week}-${where}`}>Now apply this engineering method to your own enterprise.</h2>
        <p className="pj-small" style={{ margin: 0, maxWidth: '80ch' }}>
          You practised {h.practised}. {h.howTo}
        </p>
        {!compact && (
          <div className="pj-handoff-cols">
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FolderOpen size={15} aria-hidden /> What you create
              </h3>
              <ul>{h.create.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
            <div>
              <h3>What it builds on and connects to</h3>
              <ul>
                {h.prior.map((x) => <li key={x}>{x}</li>)}
                {h.connects.map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
            <div>
              <h3>How you know it is done</h3>
              <ul>
                {h.done.map((x) => <li key={x}>{x}</li>)}
                <li>
                  <strong>Evidence:</strong> {h.evidence}
                </li>
              </ul>
            </div>
          </div>
        )}
        {compact && (
          <p className="pj-small" style={{ margin: '8px 0 0' }}>
            <strong>Done when:</strong> {h.done.join(' ')} <strong>Evidence:</strong> {h.evidence}
          </p>
        )}
      </div>
      <div className="pj-handoff-foot">
        <div className="pj-row">
          {st.doc ? (
            where !== 'lab' && (
              <Link to={h.editor.to} className="pj-btn primary" data-testid="handoff-open-editor">
                {h.editor.label} <ArrowRight size={15} aria-hidden />
              </Link>
            )
          ) : (
            <Link to="/project" className="pj-btn primary" data-testid="handoff-create">
              Create your project <ArrowRight size={15} aria-hidden />
            </Link>
          )}
          <Link to="/project" className="pj-btn" data-testid="handoff-open-project">
            <FolderOpen size={15} aria-hidden /> Open My Project
          </Link>
          {h.library.map((l) => (
            <Link key={l.to} to={l.to} className="pj-btn link">
              {l.label}
            </Link>
          ))}
        </div>
        {/* week1-m5: the one template path (spec §e.5): choose, review exactly what is created, warning, "I understand" */}
        {COPY_FROM_PRACTICE_ENABLED && st.doc && <TemplateCopy onDone={setMsg} />}
        {msg && <span className="sr-only" data-testid="copy-msg">{msg}</span>}
      </div>
    </section>
  )
}
