// Install and run the course checker (#/week/8/lab/checker): the student-facing guide, rendered from the single source
// src/content/lab/week08Checker.ts (the Lab L8 instructions carry the same section). Download buttons give the course
// script, the launcher and the two tool-proof files from their own sources, so the copies never drift.
import { useState } from 'react'
import { ArrowRight, Download } from 'lucide-react'
import { CHECKER_TITLE, CHECKER_WHAT, CHECKER_WHO, DOWNLOADS, FALLBACK, LAYOUT, OS_LABEL, PREREQUISITES, PROOF_OUTPUT, READ_OUTPUT, STEPS, TESTED_NOTE, TROUBLESHOOTING, type OsKey } from '../content/lab/week08Checker'
import { downloadText } from '../workbench/download'
import { Link } from '../lib/router'
import { WEEK8_PATHS } from './route'

const guessOs = (): OsKey => {
  const p = typeof navigator === 'undefined' ? '' : `${navigator.platform} ${navigator.userAgent}`
  return /Mac/i.test(p) ? 'macos' : /Linux|X11/i.test(p) && !/Android/i.test(p) ? 'linux' : 'windows'
}

export default function Checker() {
  const [os, setOs] = useState<OsKey>(guessOs)
  return (
    <div className="wk-page" data-testid="week8-checker">
      <p className="lf-kicker">Week 8 · Laboratory · Course toolchain</p>
      <h1 className="lf-h1">{CHECKER_TITLE}</h1>
      <p className="lf-lede lf-column">{CHECKER_WHO.text}</p>
      <p className="lf-prose lf-column">{CHECKER_WHAT.text}</p>

      <section className="wk-section" aria-labelledby="ck-pre-h" data-testid="checker-prerequisites">
        <h2 id="ck-pre-h" className="lf-h2">
          Prerequisites
        </h2>
        <ul className="lf-list lf-column">
          {PREREQUISITES.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <h3 className="lf-h3">Folder layout</h3>
        <div className="wk-code" tabIndex={0} role="region" aria-label="Folder layout of the checker kit">
          <pre>{LAYOUT.join('\n')}</pre>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="ck-steps-h" data-testid="checker-steps">
        <h2 id="ck-steps-h" className="lf-h2">
          Steps
        </h2>
        <div className="lf-actions" role="group" aria-label="Operating system">
          {(Object.keys(OS_LABEL) as OsKey[]).map((k) => (
            <button key={k} type="button" className={`lf-btn small${os === k ? ' primary' : ''}`} aria-pressed={os === k} onClick={() => setOs(k)} data-testid={`checker-os-${k}`}>
              {OS_LABEL[k]}
            </button>
          ))}
        </div>
        <ol className="wk-steps lf-column">
          {STEPS.map((s) => (
            <li key={s.id} data-testid={`checker-step-${s.id}`}>
              <strong>{s.title}.</strong> {s.text.text}
              {s.id === 'scripts' && (
                <ul className="lf-plain mt-2" data-testid="checker-downloads">
                  {DOWNLOADS.map((d) => (
                    <li key={d.name} className="mt-1">
                      <button type="button" className="lf-btn small" onClick={() => downloadText(d.name, d.text(), 'text/plain')} data-testid={`checker-download-${d.name}`}>
                        <Download size={14} aria-hidden /> {d.name}
                      </button>{' '}
                      <span className="lf-muted">
                        save in <code>{d.saveIn}</code>: {d.what}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {s.commands && (
                <div className="wk-code mt-2" tabIndex={0} role="region" aria-label={`${s.title}: commands for ${OS_LABEL[os]}`}>
                  <pre>{s.commands[os].join('\n')}</pre>
                </div>
              )}
              {s.note && <p className="lf-muted mt-1">{s.note.text}</p>}
            </li>
          ))}
        </ol>
      </section>

      <section className="wk-section" aria-labelledby="ck-out-h" data-testid="checker-output">
        <h2 id="ck-out-h" className="lf-h2">
          Expected output of the tool proof
        </h2>
        <p className="lf-prose lf-column">The output the course checker recorded for the two tool-proof files. Your paths and the library load time will differ; the PASS and FAIL lines and the diagnostic must not.</p>
        <div className="wk-code" tabIndex={0} role="region" aria-label="Recorded checker output for the tool proof">
          <pre>{PROOF_OUTPUT.join('\n')}</pre>
        </div>
        <h3 className="lf-h3">Reading the output</h3>
        <dl className="lf-terms lf-wide">
          {READ_OUTPUT.map((r) => (
            <div key={r.part} className="contents">
              <dt>{r.part}</dt>
              <dd>{r.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="wk-section" aria-labelledby="ck-trouble-h" data-testid="checker-troubleshooting">
        <h2 id="ck-trouble-h" className="lf-h2">
          Troubleshooting
        </h2>
        <div className="lf-table-wrap lf-wide">
          <table className="lf-table">
            <thead>
              <tr>
                <th scope="col">Symptom</th>
                <th scope="col">What to do</th>
              </tr>
            </thead>
            <tbody>
              {TROUBLESHOOTING.map((t) => (
                <tr key={t.symptom}>
                  <td>{t.symptom}</td>
                  <td>{t.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="lf-prose lf-column">
          <strong>Fallback.</strong> {FALLBACK.text}
        </p>
        <p className="lf-muted lf-column">{TESTED_NOTE.text}</p>
      </section>

      <div className="lf-actions" style={{ marginTop: 28 }}>
        <Link to={WEEK8_PATHS.lab} className="lf-btn primary" data-testid="checker-back-to-lab">
          Lab L8 instructions <ArrowRight size={15} aria-hidden />
        </Link>
        <Link to={WEEK8_PATHS['lab-tool']} className="lf-btn">
          Open the lab tool
        </Link>
      </div>
    </div>
  )
}
