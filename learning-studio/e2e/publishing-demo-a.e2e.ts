// Acceptance demonstration A (directive §19 A, all ten steps; §7 "test with two genuinely separate sessions") against
// the real course server: the instructor and the student are separate browser contexts (separate cookie jars).
//   1 the instructor signs in · 2 opens the Week 1 textbook editor · 3 edits a section · 4 saves a draft ·
//   5 the student still sees the old published version · 6 the instructor previews and publishes ·
//   7 the student is notified (and a refresh also shows it) · 8 the student sees the update ·
//   9 the student's artifacts are unchanged (hash of the team project and its versions) ·
//   10 the instructor views the history and restores an earlier version; the student sees the restored text.
// Run: npx playwright test -c playwright.server.config.ts publishing-demo-a (no screenshots; output under test-results).
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { expect, test, type Browser, type Page } from '@playwright/test'

type Account = { login: string; password: string; role: string }
let accounts: Account[] = []
const MARK = 'Demo A sentence: the boundary follows from the question you ask.'

test.beforeAll(() => {
  const out = execFileSync(process.execPath, ['server/run.mjs', 'test-fixture', '--json'], { env: { ...process.env, SLS_MODE: 'test', SLS_DATA_DIR: process.env.SLS_E2E_DIR, SLS_SCRYPT_N: String(2 ** 14) }, encoding: 'utf8' })
  accounts = (JSON.parse(out.trim().split('\n').pop()!) as { accounts: Account[] }).accounts
})

async function signedIn(browser: Browser, a: Account): Promise<Page> {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto('/?poll=off#/signin')
  await expect(page.getByTestId('signin-form')).toBeVisible({ timeout: 60_000 })
  await page.getByTestId('signin-login').fill(a.login)
  await page.getByTestId('signin-password').fill(a.password)
  await page.getByTestId('signin-submit').click()
  await page.waitForURL(a.role === 'instructor' ? /#\/review$/ : /#\/project$/)
  return page
}
/** A fingerprint of everything the team stored: the project document and version, and the list of saved versions. */
async function projectFingerprint(p: Page): Promise<string> {
  const session = await (await p.request.get('/api/v1/auth/session')).json()
  const id = session.team.projectId as string
  expect(id).toBeTruthy()
  const proj = await (await p.request.get(`/api/v1/projects/${id}`)).json()
  const snaps = await (await p.request.get(`/api/v1/projects/${id}/snapshots`)).json()
  return createHash('sha256').update(JSON.stringify({ doc: proj.doc, version: proj.version, snaps })).digest('hex')
}
const focus = (p: Page) => p.evaluate(() => window.dispatchEvent(new Event('focus')))
const section = (p: Page) => p.locator('section#ch04-01')

test('Demo A: edit, draft, preview, publish, notify, artifacts intact, history and restore', async ({ browser }) => {
  test.setTimeout(240_000)
  const [inst, studentA] = accounts

  // the student has team work on the server before anything is published
  const stu = await signedIn(browser, studentA)
  await expect(stu.getByTestId('project-create')).toBeVisible({ timeout: 60_000 })
  const week1File = { format: 'week1-model-inputs', version: 1, team: '07', enterprise: { name: 'Demo A Harbor Cooperative' }, stakeholders: [{ id: 'STK-001', name: 'Commuters' }], concerns: [], needs: [] }
  await stu.getByTestId('create-import').setInputFiles({ name: 'week1.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(week1File)) })
  await stu.getByTestId('create-import-confirm').click()
  await expect(stu.getByTestId('enterprise-name')).toHaveText('Demo A Harbor Cooperative')
  await expect(stu.getByTestId('save-status')).toContainText('Saved')
  const before = await projectFingerprint(stu)
  // the student reads Learn 4.1 (published v1, from the course server)
  await stu.goto('/?poll=off#/week/1/learn/ch04')
  await expect(section(stu)).toBeVisible({ timeout: 60_000 })
  await expect(section(stu)).not.toContainText(MARK)

  // 1–2. the instructor signs in and opens the Week 1 textbook editor (Content → Week 1 Learn → 4.1)
  const ins = await signedIn(browser, inst)
  await ins.goto('/?poll=off#/authoring')
  await expect(ins.getByTestId('content-tree')).toBeVisible({ timeout: 60_000 })
  await expect(ins.getByTestId('current-release')).toHaveText('REL-0001')
  await ins.getByTestId('tree-w01.learn.ch04-01').getByRole('link').click()
  await expect(ins.getByTestId('item-editor')).toBeVisible()
  await expect(ins.getByTestId('draft-banner')).toContainText('Published r1')
  // 3. edit a paragraph (append a sentence; quoted source wording is kept, definitions are read-only)
  const para = ins.getByTestId('item-editor').locator('textarea').first()
  const original = await para.inputValue()
  await para.fill(`${original} ${MARK}`)
  await expect(ins.getByTestId('save-state')).toHaveText('Unsaved changes')
  await expect(ins.getByTestId('validation-status')).toHaveText('No errors')
  // 4. save the draft
  await ins.getByTestId('save-draft').click()
  await expect(ins.getByTestId('save-state')).toContainText('Draft saved')
  await expect(ins.getByTestId('draft-banner')).toContainText('Draft r2')
  await expect(ins.getByTestId('draft-banner')).toContainText('based on published r1')

  // 5. the student still sees the old published version (also after a reload and a release check)
  await focus(stu)
  await stu.reload()
  await expect(section(stu)).toBeVisible({ timeout: 60_000 })
  await expect(section(stu)).not.toContainText(MARK)
  await expect(stu.getByTestId('content-update-apply-week1')).toHaveCount(0)

  // 6. the instructor previews as a student, then publishes through the plan and a change note
  await ins.getByTestId('preview-as-student').click()
  await expect(ins.getByTestId('preview-bar')).toContainText('Preview of draft r2 · not visible to students')
  await expect(ins.locator('section#ch04-01')).toContainText(MARK)
  await expect(ins.locator('section#ch04-01 .w1l-secno')).toHaveText('4.1')
  await ins.getByTestId('preview-bar').getByRole('link', { name: /Back to the editor/ }).click()
  await expect(ins.getByTestId('item-editor')).toBeVisible()
  await ins.getByTestId('review-publish').click()
  await expect(ins.getByTestId('publish-plan')).toContainText('r1 → r2')
  await expect(ins.getByTestId('plan-changes')).toContainText('1 changed')
  await expect(ins.getByTestId('publish-plan')).toContainText('None affected')
  await expect(ins.getByTestId('publish-dialog-confirm')).toBeDisabled() // a change note is required
  await ins.getByTestId('change-note').fill('Demo A: state the boundary question explicitly.')
  await ins.getByTestId('publish-dialog-confirm').click()
  await expect(ins.getByTestId('editor-message')).toContainText('Published r2 to students (REL-0002)')

  // 7–8. the student is notified (no text swapped under the reader), chooses the update and sees it
  await expect(section(stu)).not.toContainText(MARK)
  await focus(stu)
  await expect(stu.getByTestId('content-update-week1')).toContainText('Updated content available. Week 1 was updated (1 section).', { timeout: 15_000 })
  await expect(section(stu)).not.toContainText(MARK)
  await stu.getByTestId('content-update-apply-week1').click()
  await expect(section(stu)).toContainText(MARK)
  // a refresh shows it as well
  await stu.reload()
  await expect(section(stu)).toContainText(MARK, { timeout: 60_000 })

  // 9. the student's artifacts are unchanged
  expect(await projectFingerprint(stu)).toBe(before)
  await stu.goto('/?poll=off#/project')
  await expect(stu.getByTestId('enterprise-name')).toHaveText('Demo A Harbor Cooperative')

  // 10. the instructor views the history and restores r1 (a new draft r3), then publishes it
  await ins.getByTestId('tab-history').click()
  await expect(ins.getByTestId('history-r2')).toContainText('Published r2')
  await expect(ins.getByTestId('history-r2')).toContainText('Demo A: state the boundary question explicitly.')
  await expect(ins.getByTestId('history-r1')).toContainText('Superseded r1')
  await ins.getByTestId('restore-r1').click()
  await ins.getByTestId('confirm-restore-confirm').click()
  await expect(ins.getByTestId('draft-banner')).toContainText('Draft r3 · restored from r1')
  await expect(ins.getByTestId('item-editor').locator('textarea').first()).toHaveValue(original)
  await ins.getByTestId('tab-compare').click()
  await expect(ins.getByTestId('diff-summary')).toContainText('1 changed')
  await ins.getByTestId('review-publish').click()
  await expect(ins.getByTestId('publish-plan')).toContainText('(restores r1)')
  await ins.getByTestId('change-note').fill('Demo A: restore the reviewed wording (r1).')
  await ins.getByTestId('publish-dialog-confirm').click()
  await expect(ins.getByTestId('editor-message')).toContainText('Published r3 to students (REL-0003)')
  await ins.getByTestId('tab-history').click()
  await expect(ins.getByTestId('history-r3')).toContainText('restored from r1')

  // the student sees the restored version: back on Learn (same document) the notice appears; then a reload shows it too
  await stu.goto('/?poll=off#/week/1/learn/ch04')
  await expect(section(stu)).toBeVisible({ timeout: 60_000 })
  await focus(stu)
  await stu.getByTestId('content-update-apply-week1').click({ timeout: 15_000 })
  await expect(section(stu)).not.toContainText(MARK)
  await stu.reload()
  await expect(section(stu)).toBeVisible({ timeout: 60_000 })
  await expect(section(stu)).not.toContainText(MARK)
  expect(await projectFingerprint(stu)).toBe(before)

  // drafts are never reachable by the student (server-side 404), whatever the UI shows
  expect((await stu.request.get('/api/v1/authoring/items')).status()).toBe(404)
  expect((await stu.request.get('/api/v1/authoring/items/w01.learn.ch04-01')).status()).toBe(404)
})
