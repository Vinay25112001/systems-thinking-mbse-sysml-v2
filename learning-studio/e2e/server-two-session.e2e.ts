// Two genuine sessions on the course server (directive §6.5, §15, §19 C; PROJECT_DATA_SCHEMA.md §6). Separate browser
// contexts = separate cookie jars, so student A, student B and the instructor are truly separate sign-ins.
//   1. A signs in and creates the team project from a Week 1 file; B signs in and sees the SAME project (server).
//   2. A and B both open STK-001; A retires it and saves; B, still on the old version, retires it too →
//      "Conflict requires review", nothing overwritten; B keeps the edit as a version and loads the latest.
//   3. A requests approval; the instructor approves on the review page; A sees "Approved" after a reload.
//   4. Reload persistence for both students.
// Run: npx playwright test -c playwright.server.config.ts (takes no screenshots; output in test-results/server-e2e).
// `?poll=off` stops the 15-second polling so B's stale version is deterministic.
import { execFileSync } from 'node:child_process'
import { expect, test, type Browser, type Page } from '@playwright/test'

type Account = { login: string; password: string; role: string }
let accounts: Account[] = []

test.beforeAll(() => {
  const out = execFileSync(process.execPath, ['server/run.mjs', 'test-fixture', '--json'], { env: { ...process.env, SLS_MODE: 'test', SLS_DATA_DIR: process.env.SLS_E2E_DIR, SLS_SCRYPT_N: String(2 ** 14) }, encoding: 'utf8' })
  accounts = (JSON.parse(out.trim().split('\n').pop()!) as { accounts: Account[] }).accounts
  expect(accounts.map((a) => a.role)).toEqual(['instructor', 'student', 'student'])
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
const week1File = {
  format: 'week1-model-inputs',
  version: 1,
  team: '07',
  enterprise: { name: 'Two-Session Ferry Cooperative' },
  stakeholders: [
    { id: 'STK-001', name: 'Commuters' },
    { id: 'STK-002', name: 'Ferry operators' },
  ],
  concerns: [],
  needs: [],
}

test('two students share one server project: conflict surfaced, instructor approval seen, reload persists', async ({ browser }) => {
  const [inst, studentA, studentB] = accounts
  // 1. A creates the team project on the server
  const a = await signedIn(browser, studentA)
  await expect(a.getByTestId('project-create')).toBeVisible({ timeout: 60_000 })
  await expect(a.getByTestId('project-create')).toContainText('course server')
  await a.getByTestId('create-import').setInputFiles({ name: 'week1.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(week1File)) })
  await a.getByTestId('create-import-confirm').click()
  await expect(a.getByTestId('enterprise-name')).toHaveText('Two-Session Ferry Cooperative')
  await expect(a.getByTestId('server-banner')).toContainText('saved on the course server')
  await expect(a.getByTestId('save-status')).toContainText('Saved')
  await expect(a.getByTestId('account-indicator')).toContainText('Test Student A')

  const b = await signedIn(browser, studentB)
  await expect(b.getByTestId('enterprise-name')).toHaveText('Two-Session Ferry Cooperative')
  const [ca, cb] = [await a.context().cookies(), await b.context().cookies()]
  expect(ca.find((c) => c.name === 'sls_session')?.value).not.toBe(cb.find((c) => c.name === 'sls_session')?.value)
  expect(ca.find((c) => c.name === 'sls_session')?.httpOnly).toBe(true)

  // 2. both open STK-001 (same-document navigation: B keeps the version it loaded)
  await a.goto('/?poll=off#/project/artifact/STK-001')
  await b.goto('/?poll=off#/project/artifact/STK-001')
  await expect(b.getByTestId('artifact-page')).toContainText('Commuters')
  await b.getByTestId('retire').click()
  await b.getByTestId('action-rationale').fill('Duplicate of another stakeholder row')
  await a.getByTestId('retire').click()
  await a.getByTestId('action-rationale').fill('Merged into the ferry operators stakeholder')
  await a.getByTestId('action-confirm').click()
  await expect(a.getByTestId('artifact-page')).toContainText('Retired: Merged into the ferry operators stakeholder')
  await expect(a.getByTestId('save-status')).toContainText('Saved', { timeout: 15_000 })
  await b.getByTestId('action-confirm').click()
  await expect(b.getByTestId('save-status')).toContainText('Conflict requires review', { timeout: 15_000 })
  await expect(b.getByTestId('readonly-banner')).toContainText('saved a change to the same item')
  await b.getByTestId('take-over').click()
  await expect(b.getByTestId('readonly-banner')).toHaveCount(0)
  await expect(b.getByTestId('artifact-page')).toContainText('Retired: Merged into the ferry operators stakeholder')
  await b.goto('/?poll=off#/project/history')
  await expect(b.getByTestId('project-app')).toContainText('Unsaved edits from this tab')

  // 3. approval: A requests, the instructor approves, A sees it
  await a.goto('/?poll=off#/project')
  await a.getByTestId('request-approval').click()
  await expect(a.getByTestId('approval-status')).toHaveAttribute('data-state', 'pending')
  const i = await signedIn(browser, inst)
  const card = i.getByTestId('pending-approval').filter({ hasText: 'Two-Session Ferry Cooperative' })
  await expect(card).toBeVisible()
  await card.getByTestId('decide-comment').fill('Approved for Week 2.')
  await card.getByTestId('decide-submit').click()
  await expect(i.getByTestId('decided-approval').first()).toContainText('Approved')
  await a.reload()
  await expect(a.getByTestId('approval-status')).toHaveAttribute('data-state', 'approved', { timeout: 30_000 })
  await expect(a.getByTestId('approval-comment')).toContainText('Approved for Week 2.')

  // 4. reload persistence (both students, fresh page loads)
  await a.goto('/?poll=off#/project/artifact/STK-001')
  await a.reload()
  await expect(a.getByTestId('artifact-page')).toContainText('Retired: Merged into the ferry operators stakeholder', { timeout: 30_000 })
  await b.reload()
  await b.goto('/?poll=off#/project')
  await expect(b.getByTestId('enterprise-name')).toHaveText('Two-Session Ferry Cooperative', { timeout: 30_000 })
  await expect(b.getByTestId('approval-status')).toHaveAttribute('data-state', 'approved')
})
