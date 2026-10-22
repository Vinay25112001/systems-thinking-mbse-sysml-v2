// The browser's content sync (src/publishing/client.ts + src/services/backend.ts, the code the SPA runs) end to end
// against the real course server: a signed-in student gets the published overlay; an instructor publishes through the
// API; the student's check finds the new release and holds it as `pending` (no text swapped) until applyPending; a
// signed-out browser keeps the bundled content.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { applyPending, checkForUpdates, getContentState, resetContentSync, startContentSync } from '../../src/publishing/client'
import { seedItems } from '../../src/publishing/seed'
import type { BodyBlock, SectionBody } from '../../src/publishing/types'
import { refreshSession, signIn } from '../../src/services/backend'
import { buildChapter, richText } from '../../src/week1/learn/model'
import { getLearnOverlay } from '../../src/week1/learn/published'
import { chapterById } from '../../src/week1/learn/textbook'
import { ORIGIN, startTest, type Client, type T } from './helpers'

let t: T
let inst: Client
const realFetch: typeof fetch = globalThis.fetch.bind(globalThis)
const SEC = seedItems().find((s) => s.id === 'w01.learn.ch04-01')!
const PARA = (SEC.body as SectionBody).blocks.find((b) => b.kind === 'para' && !b.cites)!.id
const NEW = 'A boundary answers a question; this sentence was published from the course server.'
const until = async (f: () => boolean) => {
  for (let i = 0; i < 200 && !f(); i++) await new Promise((r) => setTimeout(r, 10))
  expect(f()).toBe(true)
}
const chapterText = () => buildChapter(chapterById('ch04')!).sections.flatMap((s) => s.blocks.map((b) => ('rich' in b ? richText(b.rich) : ''))).join(' ')

beforeEach(async () => {
  t = await startTest()
  inst = await t.signedIn(await t.user('instructor'))
  let cookie = ''
  globalThis.fetch = (async (input: string | URL | Request, init: RequestInit = {}) => {
    if (!(typeof input === 'string' && input.startsWith('/'))) return realFetch(input, init)
    const r = await realFetch(t.base + input, { ...init, headers: { ...(init.headers as Record<string, string>), Origin: ORIGIN, ...(cookie ? { Cookie: cookie } : {}) } })
    for (const c of r.headers.getSetCookie()) cookie = c.split(';')[0]
    return r
  }) as typeof fetch
  resetContentSync()
})
afterEach(async () => {
  resetContentSync()
  globalThis.fetch = realFetch
  await t.close()
})

describe('content sync against the course server', () => {
  it('signed out: nothing is fetched beyond the session probe and the bundled content stays', async () => {
    await refreshSession()
    startContentSync('week1')
    await new Promise((r) => setTimeout(r, 100))
    expect(getContentState('week1').status).toBe('bundled')
    expect(getLearnOverlay()).toBeNull()
  })
  it('signed in: published overlay, then pending on a new release, applied only on request', async () => {
    const s = await t.user('student', 'Team 1')
    await signIn(s.login, s.password)
    await refreshSession() // the SPA reloads after a sign-in; the probe is re-run the same way
    startContentSync('week1')
    await until(() => getContentState('week1').status === 'live')
    expect(getContentState('week1').releaseId).toBe('REL-0001')
    expect(Object.keys(getLearnOverlay()!.sections)).toContain('ch04-01')
    expect(chapterText()).not.toContain(NEW)
    // the instructor publishes
    const body = { ...(SEC.body as SectionBody), blocks: (SEC.body as SectionBody).blocks.map((b) => (b.id === PARA && b.kind === 'para' ? ({ ...b, text: `${b.text} ${NEW}` } as BodyBlock) : b)) }
    expect((await inst.post(`/api/v1/authoring/items/${encodeURIComponent(SEC.id)}/draft`, { body, version: null })).status).toBe(200)
    const plan = (await inst.post('/api/v1/authoring/publish-plan', { items: [SEC.id] })).body
    expect((await inst.post('/api/v1/authoring/releases', { planToken: plan.planToken, note: 'Publish for the client test.' })).status).toBe(201)
    // the student's check holds the release as pending: no text swapped under the reader
    await checkForUpdates()
    expect(getContentState('week1').pending?.changed).toBe(1)
    expect(getContentState('week1').releaseId).toBe('REL-0001')
    expect(chapterText()).not.toContain(NEW)
    applyPending('week1')
    expect(getContentState('week1').releaseId).toBe('REL-0002')
    expect(chapterText()).toContain(NEW)
    expect(getLearnOverlay()!.meta['ch04-01'].seq).toBe(2)
  })
})
