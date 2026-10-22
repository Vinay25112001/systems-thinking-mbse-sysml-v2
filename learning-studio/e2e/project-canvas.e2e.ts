// M6 acceptance demonstrations C and D (directive §19) in a running app against the real course server (SLS_MODE=test,
// throwaway accounts, temporary data directory; playwright.server.config.ts). Separate browser contexts = separate
// sign-ins (student A, student B, the instructor).
//   Demo C: create the team project → propose the enterprise → the instructor approves in a second context → record the
//           mission, objectives, stakeholders, concerns and needs → contextual guidance → relationships (table + map) →
//           progress → reload persists (and the teammate sees it) → Review & Submit: submit, instructor returns with
//           anchored feedback, the team sees it.
//   Demo D: import the sample workbook → sheets and columns detected → mapping review → ambiguity flagged → corrected →
//           confirm → stakeholders appear with IDs and provenance → Export Project → a fresh browser imports the file and
//           recovers the project.
// Named *.e2e.ts (like server-two-session.e2e.ts) so the default Playwright config, which has no course server, never
// runs it. Screenshots go to the audit folder outside the repository (no tracked screenshot is written).
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Browser, type Page } from '@playwright/test'

type Account = { login: string; password: string; role: string }
const SHOTS = process.env.SLS_M6_SHOTS ?? 'C:/Users/w451vxs/Documents/Course_Work/SysML-audit-screenshots-2026-10-21/m6'
mkdirSync(SHOTS, { recursive: true })
const shot = (p: Page, name: string) => p.screenshot({ path: join(SHOTS, `${name}.png`), fullPage: false })
const SAMPLE = 'docs/week1/samples/m6-stakeholders-sample.xlsx'

function fixture(): Account[] {
  const out = execFileSync(process.execPath, ['server/run.mjs', 'test-fixture', '--json'], { env: { ...process.env, SLS_MODE: 'test', SLS_DATA_DIR: process.env.SLS_E2E_DIR, SLS_SCRYPT_N: String(2 ** 14) }, encoding: 'utf8' })
  return (JSON.parse(out.trim().split('\n').pop()!) as { accounts: Account[] }).accounts
}
async function signedIn(browser: Browser, a: Account, viewport = { width: 1440, height: 900 }): Promise<Page> {
  const ctx = await browser.newContext({ viewport, acceptDownloads: true })
  const page = await ctx.newPage()
  page.on('dialog', (d) => void d.accept())
  await page.goto('/?poll=off#/signin')
  await expect(page.getByTestId('signin-form')).toBeVisible({ timeout: 60_000 })
  await page.getByTestId('signin-login').fill(a.login)
  await page.getByTestId('signin-password').fill(a.password)
  // the sign-in page sets the hash and reloads the page: the next `load` event is that reload (a hash change fires none)
  const reloaded = page.waitForEvent('load')
  await page.getByTestId('signin-submit').click()
  await reloaded
  await page.waitForURL(a.role === 'instructor' ? /#\/review$/ : /#\/project$/)
  // the sign-in page reloads itself after setting the hash; wait for the reloaded, signed-in page before navigating on
  await expect(page.getByTestId('account-indicator')).toBeVisible({ timeout: 60_000 })
  return page
}
/** A full navigation (a new document, so the project store is chosen afresh for the signed-in account). */
const open = (p: Page, hash: string) => p.goto(`/?poll=off&nav=${Date.now()}#${hash}`)
/** Types into a canvas field and leaves it (the canvas writes on pause and on blur). */
async function put(p: Page, testId: string, value: string) {
  const f = p.getByTestId(testId)
  await f.fill(value)
  await f.press('Tab')
}
async function part(p: Page, id: string) {
  await p.getByTestId(`nav-${id}`).click()
  await expect(p.getByTestId(`part-${id}`)).toBeVisible()
}
async function saved(p: Page) {
  await expect(p.getByTestId('save-status').first()).toContainText('Saved', { timeout: 20_000 })
}
const WHY = 'The network has many interacting parts: docking stations, bikes, a repair depot, a mobile app and the riders, people as well as technology. It exchanges with the city streets office, the power utility and the transit agency, its stakeholders want different things, and there is enough substance to model in Phase II.'

test('Demo C: team project, instructor approval, Week 1 records, guidance, relationships, progress, reload, submission', async ({ browser }) => {
  const [inst, studentA, studentB] = fixture()
  const a = await signedIn(browser, studentA)
  // 1–2. the team creates its project and proposes the enterprise
  await open(a, '/week/1/project')
  await expect(a.getByTestId('canvas-create')).toBeVisible({ timeout: 60_000 })
  await a.getByTestId('create-name').fill('Harbour Bike Share Cooperative')
  await a.getByTestId('create-empty').click()
  await expect(a.getByTestId('week1-canvas')).toBeVisible({ timeout: 30_000 })
  await expect(a.getByTestId('canvas-banner')).toContainText('Harbour Bike Share Cooperative')
  await expect(a.getByTestId('canvas-banner')).toContainText('saved on the course server')
  await shot(a, 'c01-canvas-overview-empty-1440')
  await part(a, 'enterprise')
  await expect(a.getByTestId('approval-state')).toHaveAttribute('data-state', 'none')
  await expect(a.getByTestId('request-approval')).toBeDisabled()
  await put(a, 'ent-description', 'A cooperative of the city, two bike shops and a riders’ association that runs shared bikes in the harbour district.')
  await put(a, 'ent-domain', 'Urban transport')
  await put(a, 'ent-problem', 'Short trips across the harbour district take too long by bus and parking is scarce.')
  await put(a, 'ent-mission', 'Give residents and visitors a quick, reliable bike for short trips in the harbour district.')
  // 7. contextual help: focus brings the guidance without moving focus
  await a.getByTestId('ent-problem').focus()
  const g = a.getByTestId('field-guidance')
  await expect(g.getByTestId('guidance-label')).toHaveText('Problem statement')
  await expect(g.getByTestId('guidance-example')).toContainText('Fictional instructor example')
  await expect(a.getByTestId('ent-problem')).toBeFocused()
  await shot(a, 'c02-field-guidance-1440')
  await a.getByTestId('add-objective').click()
  await put(a, 'objective-MGO-002', 'Keep a bike available within a five-minute walk at peak hours')
  await put(a, 'ent-soi', 'The bike-share service with its stations, bikes, app and repair depot.')
  await put(a, 'ent-why', WHY)
  await part(a, 'boundary')
  for (const [i, n] of ['Docking stations', 'Bike fleet', 'Rider app'].entries()) {
    await a.getByTestId('add-prt').click()
    await put(a, `prt-PRT-00${i + 1}`, n)
  }
  await part(a, 'enterprise')
  await saved(a)
  await expect(a.getByTestId('request-approval')).toBeEnabled({ timeout: 15_000 })
  await a.getByTestId('request-approval').click()
  await expect(a.getByTestId('approval-state')).toHaveAttribute('data-state', 'pending', { timeout: 15_000 })
  // 3–4. the instructor reviews the frozen proposal and approves it (second context)
  const i = await signedIn(browser, inst)
  const card = i.getByTestId('pending-approval').filter({ hasText: 'Harbour Bike Share Cooperative' })
  await expect(card).toBeVisible({ timeout: 30_000 })
  await expect(card).toContainText('A cooperative of the city')
  await expect(card).toContainText('MGO-002')
  await card.getByTestId('decide-comment').fill('Approved. Keep the depot inside the boundary.')
  await card.getByTestId('decide-submit').click()
  await expect(i.getByTestId('decided-approval').filter({ hasText: 'Harbour Bike Share Cooperative' })).toContainText('Approved')
  // 5. the student opens My Project and sees the decision
  await a.reload()
  await part(a, 'enterprise')
  await expect(a.getByTestId('approval-state')).toHaveAttribute('data-state', 'approved', { timeout: 30_000 })
  await expect(a.getByTestId('approval-comment')).toContainText('Keep the depot inside the boundary')
  await expect(a.getByTestId('material-guard')).toContainText('changes pending re-review')
  await expect(a.getByTestId('ent-mission')).toBeDisabled()
  // 6. stakeholders, concerns, needs
  await part(a, 'stakeholders')
  const stks = [
    ['Commuters', 'user', '5', 'Their daily trips depend on it'],
    ['City streets office', 'authority', '4', 'Approves every station site'],
  ]
  for (const [k, [name, role, interest, why]] of stks.entries()) {
    const id = `STK-00${k + 1}`
    await a.getByTestId('add-stakeholder').click()
    await put(a, `stk-${id}-name`, name)
    await a.getByTestId(`stk-${id}-role`).selectOption(role)
    await a.getByTestId(`stk-${id}-interest`).selectOption(interest)
    await put(a, `stk-${id}-interestReason`, why)
  }
  await part(a, 'concerns')
  await a.getByTestId('concern-holder').selectOption('STK-001')
  await a.getByTestId('add-concern').click()
  await put(a, 'con-CON-001-text', 'Commuters find no free bike at the ferry terminal between 7 and 9 a.m.')
  await a.getByTestId('concern-holder').selectOption('STK-002')
  await a.getByTestId('add-concern').click()
  await put(a, 'con-CON-002-text', 'Stations must not block the pavement at the ferry terminal for wheelchair users.')
  await a.getByTestId('conflict-from').selectOption('CON-001')
  await a.getByTestId('conflict-to').selectOption('CON-002')
  await a.getByTestId('conflict-why').fill('More docks at the terminal mean less free pavement.')
  await a.getByTestId('add-conflict').click()
  await expect(a.getByTestId('concern-conflicts')).toContainText('CON-001 conflicts with CON-002')
  await part(a, 'needs')
  await a.getByTestId('add-need').click()
  await put(a, 'need-NEED-001-name', 'Bikes at the terminal at peak')
  await put(a, 'need-NEED-001-text', 'Commuters need the bike-share service to have a free bike at the ferry terminal during the morning peak.')
  await put(a, 'need-NEED-001-rationale', 'Without a bike at 8 a.m. commuters take the car instead.')
  await put(a, 'need-NEED-001-sources', 'STK-001')
  await put(a, 'need-NEED-001-concerns', 'CON-001')
  await a.getByTestId('need-NEED-001-goal').selectOption('MGO-002')
  await a.getByTestId('need-NEED-001-priority').selectOption('critical')
  // 8. relationships: table, then the same record in the map and the detail panel
  await part(a, 'relationships')
  await a.getByTestId('new-rel-from').selectOption('STK-002')
  await a.getByTestId('new-rel-type').selectOption('regulates')
  await a.getByTestId('new-rel-to').selectOption('STK-001')
  await a.getByTestId('add-relationship').click()
  await put(a, 'rel-REL-001-note', 'Station permits and street use')
  await a.getByTestId('view-map').click()
  await a.getByTestId('map-edge-REL-001').click()
  await expect(a.getByTestId('detail-relationship')).toContainText('STK-002 regulates STK-001')
  await shot(a, 'c03-relationship-map-1440')
  await a.getByTestId('view-all').click()
  await expect(a.getByTestId('week1-relations')).toContainText('concern motivates need')
  await expect(a.getByTestId('week1-relations')).toContainText('conflicting concerns')
  // 9. progress from real artifacts
  await part(a, 'overview')
  await expect(a.getByTestId('canvas-headline')).toContainText('required parts meet the course checks')
  await expect(a.getByTestId('overview-parts')).toContainText('Stakeholders')
  await shot(a, 'c04-progress-1440')
  await saved(a)
  // 10. reload: the work persists, and the teammate sees the same project
  await a.reload()
  await part(a, 'stakeholders')
  await expect(a.getByTestId('stk-STK-002-name')).toHaveValue('City streets office', { timeout: 30_000 })
  await expect(a.getByTestId('stk-STK-001-interest')).toHaveValue('5')
  const b = await signedIn(browser, studentB)
  await open(b, '/week/1/project/needs')
  await expect(b.getByTestId('need-row-NEED-001')).toContainText('Bikes at the terminal at peak', { timeout: 30_000 })
  // Review & Submit: ready for review, submit (immutable snapshot), the instructor returns it with anchored feedback
  await open(a, '/week/1/review')
  await expect(a.getByTestId('package-state')).toHaveAttribute('data-state', 'draft', { timeout: 30_000 })
  await a.getByTestId('mark-ready').click()
  await expect(a.getByTestId('package-state')).toHaveAttribute('data-state', 'ready-for-review')
  await saved(a)
  await a.getByTestId('submit-open').click()
  await a.getByTestId('submit-ack').check()
  await a.getByTestId('submit-confirm-btn').click()
  await expect(a.getByTestId('package-state')).toHaveAttribute('data-state', 'submitted', { timeout: 15_000 })
  await expect(a.getByTestId('submission-latest')).toContainText('SNP-')
  await i.reload()
  const sub = i.getByTestId('pending-submission').filter({ hasText: 'Harbour Bike Share Cooperative' })
  await expect(sub).toBeVisible({ timeout: 30_000 })
  await sub.getByTestId('open-snapshot').click()
  await expect(sub.getByTestId('submission-snapshot')).toContainText('NEED-001')
  await sub.getByTestId('sub-return').check()
  await sub.getByTestId('sub-comment').fill('Add needs for the city streets office.')
  await sub.getByTestId('sub-add-anchor').click()
  await sub.getByTestId('sub-anchor-id-0').fill('CON-002')
  await sub.getByTestId('sub-anchor-text-0').fill('No need answers this concern yet.')
  await sub.getByTestId('sub-submit').click()
  await expect(i.getByTestId('decided-submission').filter({ hasText: 'Harbour Bike Share Cooperative' })).toContainText('Returned for revision')
  await a.reload()
  await expect(a.getByTestId('package-state')).toHaveAttribute('data-state', 'returned', { timeout: 30_000 })
  await expect(a.getByTestId('submission-feedback')).toContainText('Add needs for the city streets office')
  await expect(a.getByTestId('submission-anchors')).toContainText('Instructor feedback on CON-002')
  await shot(a, 'c05-review-returned-1440')
  // the anchored feedback also shows on the artifact in My Project
  await open(a, '/week/1/project/concerns')
  await a.getByTestId('con-row-CON-002').click()
  await expect(a.getByTestId('detail-feedback')).toContainText('No need answers this concern yet.', { timeout: 30_000 })
  // accessibility: no serious or critical axe violation on the canvas (WCAG 2.2 AA rules)
  for (const view of ['/week/1/project', '/week/1/project/stakeholders', '/week/1/project/needs', '/week/1/review']) {
    await open(a, view)
    await expect(a.getByTestId(view.endsWith('review') ? 'week1-review' : 'week1-canvas')).toBeVisible({ timeout: 30_000 })
    const r = await new AxeBuilder({ page: a }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).include(view.endsWith('review') ? '[data-testid="week1-review"]' : '[data-testid="week1-canvas"]').analyze()
    const bad = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${view} ${v.id}: ${v.nodes.length} node(s) ${v.nodes[0]?.target.join(' ')}`)
    expect(bad).toEqual([])
  }
  // mobile: the canvas stacks, the part navigator becomes a select
  const m = await signedIn(browser, studentB, { width: 390, height: 844 })
  await open(m, '/week/1/project/stakeholders')
  await expect(m.getByTestId('part-stakeholders')).toBeVisible({ timeout: 30_000 })
  await shot(m, 'c06-canvas-stakeholders-390')
})

test('Demo D: Excel stakeholder import with mapping review, provenance, export and reimport', async ({ browser }) => {
  const [, student] = fixture()
  const a = await signedIn(browser, student)
  await open(a, '/week/1/project')
  await expect(a.getByTestId('canvas-create')).toBeVisible({ timeout: 60_000 })
  await a.getByTestId('create-name').fill('Tool Library Cooperative')
  await a.getByTestId('create-empty').click()
  await expect(a.getByTestId('week1-canvas')).toBeVisible({ timeout: 30_000 })
  await expect(a.getByTestId('canvas-banner')).toContainText('saved on the course server')
  await part(a, 'stakeholders')
  // 1. upload; 2. sheets and columns detected
  await a.getByTestId('import-excel').click()
  await a.getByTestId('xl-file').setInputFiles(SAMPLE)
  await expect(a.getByTestId('xl-step-sheet')).toContainText('Stakeholders', { timeout: 20_000 })
  await expect(a.getByTestId('xl-step-sheet')).toContainText('Suggested')
  await expect(a.getByTestId('xl-sheet-1')).toBeChecked()
  await a.getByTestId('xl-to-map').click()
  // 3. review the mappings; 4. ambiguities flagged
  const map = a.getByTestId('xl-mapping')
  await expect(map).toContainText('High')
  await expect(a.getByTestId('xl-ambiguous')).toContainText('ambiguous')
  await expect(a.getByTestId('xl-col-8')).toContainText('Ambiguous')
  await expect(a.getByTestId('xl-to-preview')).toBeDisabled()
  await shot(a, 'd01-mapping-ambiguity-1440')
  // 5. correct them
  await a.getByTestId('xl-field-8').selectOption('interestReason')
  await expect(a.getByTestId('xl-ambiguous')).toHaveCount(0)
  await expect(a.getByTestId('xl-col-8')).toContainText('Your choice')
  await a.getByTestId('xl-to-preview').click()
  await expect(a.getByTestId('xl-row-6')).toHaveAttribute('data-status', 'duplicate')
  await expect(a.getByTestId('xl-row-7')).toHaveAttribute('data-status', 'missing-required')
  await expect(a.getByTestId('xl-row-4')).toHaveAttribute('data-status', 'formula')
  await expect(a.getByTestId('xl-row-5')).toHaveAttribute('data-status', 'not-recognised')
  await shot(a, 'd02-preview-1440')
  // 6. confirm
  await a.getByTestId('xl-to-confirm').click()
  await expect(a.getByTestId('xl-commit')).toBeDisabled()
  await a.getByTestId('xl-ack').check()
  await a.getByTestId('xl-commit').click()
  // 7–8. the stakeholders appear in the canonical project with IDs and provenance
  await expect(a.getByTestId('xl-created')).toContainText('STK-001, STK-002, STK-003, STK-004', { timeout: 20_000 })
  await a.getByTestId('xl-done').click()
  await expect(a.getByTestId('stk-STK-001-name')).toHaveValue('Library members')
  await expect(a.getByTestId('stk-STK-004-interest')).toHaveValue('') // "high" was flagged and left empty, never guessed
  await a.getByTestId('stk-row-STK-002').click()
  const prov = a.getByTestId('detail-provenance')
  await expect(prov).toContainText('m6-stakeholders-sample.xlsx')
  await expect(prov).toContainText('sheet “Stakeholders”, row 3')
  await expect(prov).toContainText('interestReason ← Reason (chosen by the student)')
  await shot(a, 'd03-provenance-1440')
  await saved(a)
  // H-1 (M6 review): a second import, then "Undo this import" restores exactly the version the server saved before it
  await a.getByTestId('import-excel').click()
  await a.getByTestId('xl-file').setInputFiles(SAMPLE)
  await a.getByTestId('xl-to-map').click()
  await a.getByTestId('xl-field-8').selectOption('interestReason')
  await a.getByTestId('xl-to-preview').click()
  for (const row of [3, 4, 5]) await a.getByTestId(`xl-choice-${row}`).selectOption('skip')
  await a.getByTestId('xl-choice-2').selectOption('new') // a deliberate second "Library members"
  await a.getByTestId('xl-to-confirm').click()
  await a.getByTestId('xl-ack').check()
  await a.getByTestId('xl-commit').click()
  await expect(a.getByTestId('xl-created')).toContainText('STK-005', { timeout: 20_000 })
  await a.getByTestId('xl-undo').click()
  await expect(a.getByTestId('xl-undo-msg')).toContainText('back to the version saved just before it (SNP-', { timeout: 20_000 })
  await a.getByTestId('xl-done').click()
  await expect(a.getByTestId('stk-row-STK-005')).toHaveCount(0)
  await expect(a.getByTestId('stk-STK-004-name')).toHaveValue('Hardware store partner')
  await saved(a)
  // 9. Export Project, then a fresh browser imports the file and recovers the project
  const [dl] = await Promise.all([a.waitForEvent('download'), a.getByTestId('canvas-export').click()])
  const file = join(SHOTS, '..', `m6-demo-d-export-${Date.now()}.json`)
  await dl.saveAs(file)
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const f = await ctx.newPage()
  await f.goto('/?poll=off#/week/1/project')
  await expect(f.getByTestId('canvas-create')).toBeVisible({ timeout: 60_000 })
  await f.getByTestId('create-import').setInputFiles(file)
  await f.getByTestId('create-import-confirm').click()
  await expect(f.getByTestId('week1-canvas')).toBeVisible({ timeout: 30_000 })
  await expect(f.getByTestId('canvas-banner')).toContainText('Tool Library Cooperative')
  await f.getByTestId('nav-stakeholders').click()
  await expect(f.getByTestId('stk-STK-003-name')).toHaveValue('Volunteer repair crew')
  await f.getByTestId('stk-row-STK-003').click()
  await expect(f.getByTestId('detail-provenance')).toContainText('row 4')
})
