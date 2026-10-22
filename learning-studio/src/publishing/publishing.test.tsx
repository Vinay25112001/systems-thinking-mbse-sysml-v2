// Content publishing, browser side (M3): the seed renders exactly like the code content (published v1 changes nothing
// a student sees), the Learn reader and homepage fall back to the bundled content without a server, fetch the latest
// publication when signed in, and show "Updated content available" instead of swapping text under a reader.
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import studentTextSource from '../week1/learn/studentText.ts?raw'
import overviewSource from '../week1/Overview.tsx?raw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HOMEPAGE } from '../content/homepage'
import Homepage from '../pages/Homepage'
import { Providers } from '../state/Providers'
import LearnReader from '../week1/learn/LearnReader'
import { buildChapter } from '../week1/learn/model'
import { getLearnOverlay } from '../week1/learn/published'
import { PROGRESS_KEY } from '../week1/learn/progress'
import { STORAGE_PREFIX } from '../lib/storage'
import { CHAPTERS } from '../week1/learn/textbook'
import { changedCount, resetContentSync, toLearnOverlay } from './client'
import { diffBodies, wordDiff } from './diff'
import { seedItems } from './seed'
import { COURSE_INTRO_ID, COURSE_SETTINGS_ID, type AnyBody, type SectionBody, type StudentPayload } from './types'
import { NUMBER_REFERENCED_SECTIONS } from './validate'

// ------------------------------------------------------------------------------------------- a fake course server
const server = vi.hoisted(() => ({ signedIn: false, release: 'REL-0001', week: null as unknown, course: null as unknown, calls: [] as string[] }))
vi.mock('../services/backend', async (orig) => {
  const fakeState = () => (server.signedIn ? { status: 'signed-in', session: { roles: ['student'], user: { id: 'u', displayName: 'S', initials: 'SS', login: 's' } } } : { status: 'offline', session: null })
  const real = await orig<typeof import('../services/backend')>()
  return {
    ...real,
    probeBackend: async () => fakeState(),
    getBackend: () => fakeState(),
    api: async (_m: string, path: string) => {
      server.calls.push(path)
      if (!server.signedIn) throw new real.ApiFailure({ status: 0, code: 'network', message: 'offline', data: {} })
      if (path === '/content/release') return { status: 200, data: { releaseId: server.release, publishedAt: '' }, etag: null }
      if (path === '/content/weeks/1') return { status: 200, data: server.week, etag: null }
      if (path === '/content/course') return { status: 200, data: server.course, etag: null }
      throw new real.ApiFailure({ status: 404, code: 'not-found', message: 'Not found.', data: {} })
    },
  }
})

const SEEDS = seedItems()
const payload = (scope: 'week1' | 'course', release: string, patch: (id: string, body: unknown) => unknown = (_i, b) => b): StudentPayload => ({
  releaseId: release,
  scope,
  withdrawn: [],
  items: Object.fromEntries(
    SEEDS.filter((s) => (scope === 'week1' ? s.kind === 'learn-section' : s.kind !== 'learn-section')).map((s) => {
      const body = patch(s.id, structuredClone(s.body))
      const changed = JSON.stringify(body) !== JSON.stringify(s.body)
      return [s.id, { revisionId: changed ? `${s.id}:${release}` : `${s.id}:r1`, seq: changed ? 2 : 1, publishedAt: changed ? '2026-10-21T13:00:00.000Z' : '2026-10-21T12:00:00.000Z', body: body as AnyBody }]
    }),
  ),
})
const editPara = (sectionId: string, text: string) => (id: string, body: unknown) => {
  if (id !== `w01.learn.${sectionId}`) return body
  const b = body as SectionBody
  const p = b.blocks.find((x) => x.kind === 'para')!
  return { ...b, blocks: b.blocks.map((x) => (x === p ? { ...p, text } : x)) }
}

beforeEach(() => {
  window.localStorage.clear()
  server.signedIn = false
  server.release = 'REL-0001'
  server.calls = []
  server.week = payload('week1', 'REL-0001')
  server.course = payload('course', 'REL-0001')
  resetContentSync()
})
afterEach(() => resetContentSync())

describe('seed = code content (published v1 is invisible to students)', () => {
  it('every chapter renders identically from the seed bodies and from the code parts', () => {
    const overlay = toLearnOverlay(payload('week1', 'REL-0001'))
    expect(Object.keys(overlay.sections)).toHaveLength(CHAPTERS.reduce((n, c) => n + c.sections.length, 0))
    for (const ch of CHAPTERS) expect(JSON.stringify(buildChapter(ch, overlay)), ch.id).toBe(JSON.stringify(buildChapter(ch, null)))
  })
  it('the list of sections referenced by number equals the literal ids in studentText.ts and Overview.tsx', () => {
    const src = [studentTextSource, overviewSource].join('\n')
    const ids = [...src.matchAll(/(?:sec|displayNumber)\('(ch\d\d-\d\d)'\)/g)].map((m) => m[1])
    expect([...new Set(ids)].sort()).toEqual([...NUMBER_REFERENCED_SECTIONS].sort())
  })
})

describe('diff', () => {
  it('word-level LCS marks only the changed words', () => {
    expect(wordDiff('the quick brown fox', 'the slow brown fox')).toEqual([{ op: 'eq', text: 'the ' }, { op: 'del', text: 'quick' }, { op: 'add', text: 'slow' }, { op: 'eq', text: ' brown fox' }])
  })
  it('block level: added, removed, changed and moved by stable id', () => {
    const b = { title: 't', blocks: [{ id: 'b001', kind: 'para', text: 'one' }, { id: 'b002', kind: 'para', text: 'two' }, { id: 'b003', kind: 'para', text: 'three' }] } as SectionBody
    const a = { ...b, blocks: [b.blocks[2], { ...b.blocks[0], text: 'one more' } as SectionBody['blocks'][number], { id: 'b004', kind: 'para', text: 'four' } as SectionBody['blocks'][number]] }
    const d = diffBodies('learn-section', b, a)
    expect(d.summary).toMatchObject({ added: 1, removed: 1, changed: 1 })
    expect(d.units.map((u) => `${u.id}:${u.change}`)).toContain('b002:removed')
  })
  it('counts changed items between payloads', () => {
    expect(changedCount(payload('week1', 'REL-0001'), payload('week1', 'REL-0001'))).toBe(0)
    expect(changedCount(payload('week1', 'REL-0001'), payload('week1', 'REL-0002', editPara('ch04-01', 'Changed.')))).toBe(1)
  })
})

const learn = () =>
  render(
    <Providers>
      <LearnReader chapter="ch04" section="ch04-01" path="/week/1/learn/ch04" />
    </Providers>,
  )
const firstParaText = (sectionId: string) => ((SEEDS.find((s) => s.id === `w01.learn.${sectionId}`)!.body as SectionBody).blocks.find((b) => b.kind === 'para') as { text: string }).text

describe('student consumption', () => {
  it('without a server (or signed out) the reader and the homepage show the bundled content; no overlay is set', async () => {
    learn()
    expect(await screen.findByTestId('learn-reader')).toBeInTheDocument()
    await waitFor(() => expect(server.calls).toEqual([]))
    expect(getLearnOverlay()).toBeNull()
    expect(screen.queryByTestId('content-update-apply-week1')).toBeNull()
  })
  it('signed in, Learn shows the latest publication; a newer one raises the banner and changes nothing until chosen', async () => {
    server.signedIn = true
    server.week = payload('week1', 'REL-0002', editPara('ch04-01', 'Published wording from the course server, release two.'))
    learn()
    expect(await screen.findByText(/Published wording from the course server, release two\./)).toBeInTheDocument()
    // the instructor publishes again; the student's text stays until they choose the update
    server.release = 'REL-0003'
    server.week = payload('week1', 'REL-0003', editPara('ch04-01', 'A newer wording in release three.'))
    await act(async () => {
      window.dispatchEvent(new Event('focus'))
    })
    const apply = await screen.findByTestId('content-update-apply-week1')
    expect(screen.getByTestId('content-update-week1')).toHaveTextContent(/Updated content available\. Week 1 was updated \(1 section\)/)
    expect(screen.getByText(/Published wording from the course server, release two\./)).toBeInTheDocument()
    expect(screen.queryByText(/A newer wording in release three\./)).toBeNull()
    await userEvent.click(apply)
    expect(await screen.findByText(/A newer wording in release three\./)).toBeInTheDocument()
    expect(screen.queryByTestId('content-update-apply-week1')).toBeNull()
    // progress keys are untouched: the section ids and the progress record are the code ones
    expect(document.getElementById('ch04-01')).not.toBeNull()
  })
  it('the "Updated since you read it" badge marks a section read before its newer publication', async () => {
    window.localStorage.setItem(`${STORAGE_PREFIX}${PROGRESS_KEY}`, JSON.stringify({ opened: {}, read: { 'ch04-01': Date.parse('2026-10-20T10:00:00Z'), 'ch04-02': Date.parse('2026-10-20T10:00:00Z') }, checked: {} }))
    server.signedIn = true
    server.week = payload('week1', 'REL-0002', editPara('ch04-01', 'Changed after the student read it.'))
    learn()
    await screen.findByText(/Changed after the student read it\./)
    expect(screen.getByTestId('updated-since-read-ch04-01')).toHaveTextContent('Updated since you read it')
    expect(screen.queryByTestId('updated-since-read-ch04-02')).toBeNull() // read, but not republished since
  })
  it('a withdrawn section leaves the student view and the numbering stays gap-free', async () => {
    server.signedIn = true
    const p = payload('week1', 'REL-0002')
    delete p.items['w01.learn.ch04-02']
    p.withdrawn = ['w01.learn.ch04-02']
    server.week = p
    learn()
    await waitFor(() => expect(getLearnOverlay()?.withdrawn.has('ch04-02')).toBe(true))
    await waitFor(() => expect(document.getElementById('ch04-02')).toBeNull())
    const nums = [...document.querySelectorAll('section.w1l-section .w1l-secno')].map((e) => e.textContent)
    expect(nums).toEqual(nums.map((_, i) => `4.${i + 1}`))
  })
  it('the homepage shows the published introduction and the verified department; bundled text offline', async () => {
    render(
      <Providers>
        <Homepage />
      </Providers>,
    )
    expect(await screen.findByTestId('hp-institution')).toHaveTextContent(/^Wright State University$/)
    expect(screen.getByText(HOMEPAGE.lede)).toBeInTheDocument()
  })
  it('signed in: published lede and department label (only when verified)', async () => {
    server.signedIn = true
    server.course = payload('course', 'REL-0002', (id, b) => (id === COURSE_INTRO_ID ? { ...(b as object), lede: 'A published lede from the store.' } : id === COURSE_SETTINGS_ID ? { department_label: 'Department of Example Studies', department_label_verified: true } : b))
    render(
      <Providers>
        <Homepage />
      </Providers>,
    )
    expect(await screen.findByText('A published lede from the store.')).toBeInTheDocument()
    expect(screen.getByTestId('hp-institution')).toHaveTextContent('Wright State University · Department of Example Studies')
  })
})
void firstParaText
