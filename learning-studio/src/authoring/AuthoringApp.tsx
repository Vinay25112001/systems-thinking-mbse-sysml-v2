// Instructor content publishing (M3, limited scope per DECISION_LOG A24; spec §h, mockup docs/week1/spec/mockups/
// admin-publish.html). Routes:
//   #/authoring                 H1 content list (course introduction, course settings, Week 1 Learn sections)
//   #/authoring/item/:id        H2 editor · H3 validation · H5 compare · H6 publish plan · H7 history and restore
//   #/authoring/preview/:id     H4 preview as student
// Reachable from the "Content" link (instructors signed in to the course server) and "Edit this section" in Learn. The
// page itself is no authorization: every call is authorized on the server (instructor role; everyone else gets 404).
import { useCallback, useEffect, useState } from 'react'
import { TopBar } from '../flow/Chrome'
import { Link, matchRoute } from '../lib/router'
import type { ItemSummary, ReleaseInfo } from '../publishing/types'
import { ApiFailure, hasRole, probeBackend, useBackend } from '../services/backend'
import * as A from './api'
import { ContentTree } from './ContentTree'
import { ItemEditor } from './ItemEditor'
import Preview from './Preview'
import './authoring.css'

export const isAuthoringPath = (path: string) => path === '/authoring' || path.startsWith('/authoring/')

export default function AuthoringApp({ path }: { path: string }) {
  const b = useBackend()
  const [items, setItems] = useState<ItemSummary[] | null>(null)
  const [release, setRelease] = useState<ReleaseInfo | null>(null)
  const [releases, setReleases] = useState<A.Release[]>([])
  const [msg, setMsg] = useState('')
  const staff = b.status === 'signed-in' && hasRole(b.session, 'instructor')
  const item = matchRoute('/authoring/item/:id', path)?.id
  const preview = matchRoute('/authoring/preview/:id', path)?.id
  const load = useCallback(async () => {
    try {
      const r = await A.listItems()
      setItems(r.items)
      setRelease(r.release)
      setReleases(await A.releases())
    } catch (e) {
      setMsg(e instanceof ApiFailure ? e.error.message : 'The content list could not be loaded.')
    }
  }, [])
  useEffect(() => {
    document.title = 'Content publishing · SysML Learning Studio'
    void probeBackend()
  }, [])
  // keyed on the live backend state (a sign-in in the same document updates it; the first probe's answer may be stale)
  useEffect(() => {
    if (staff) void load()
  }, [staff, load])

  if (staff && preview) return <Preview id={preview} />
  return (
    <div className="au-root" data-testid="authoring-page">
      <TopBar title="Content publishing" />
      {!staff && b.status !== 'probing' && (
        <main className="au-page">
          <h1 className="au-h1">Content publishing</h1>
          <p>
            This page is for instructors signed in to the course server. <Link to="/signin">Sign in</Link>
          </p>
        </main>
      )}
      {staff && (
        <main className={`au-page${item ? ' has-editor' : ''}`}>
          {msg && <p role="alert">{msg}</p>}
          {!item && (
            <>
              <header className="au-list-head">
                <h1 className="au-h1">Content</h1>
                <p className="au-small au-muted">
                  Limited scope until Dec 1 (A24): the course introduction, the course settings and the Week 1 textbook sections. Current release{' '}
                  <span className="au-mono" data-testid="current-release">
                    {release?.releaseId ?? '…'}
                  </span>
                  . Publishing writes only the content store: student projects, progress and submissions are separate.
                </p>
              </header>
              {items && <ContentTree items={items} />}
              <section className="au-card au-releases" aria-labelledby="au-rel-h">
                <h2 id="au-rel-h" className="au-h2">
                  Releases
                </h2>
                <ol className="au-history">
                  {releases.slice(0, 20).map((r) => (
                    <li key={r.id}>
                      <p className="au-small">
                        <strong className="au-mono">{r.id}</strong> · {new Date(r.publishedAt).toLocaleString()} · {r.publishedBy} · {r.items.length} item{r.items.length === 1 ? '' : 's'}
                        {r.items.some((x) => x.action === 'archive') ? ' (withdrawal)' : ''}
                      </p>
                      <p className="au-small au-note">“{r.note}”</p>
                    </li>
                  ))}
                </ol>
              </section>
            </>
          )}
          {item && (
            <div className="au-layout">
              <div className="au-left">{items ? <ContentTree items={items} current={item} compact /> : null}</div>
              <ItemEditor key={item} id={item} onChanged={() => void load()} />
            </div>
          )}
        </main>
      )}
    </div>
  )
}
