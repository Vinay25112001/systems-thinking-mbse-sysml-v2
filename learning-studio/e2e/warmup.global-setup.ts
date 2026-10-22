import { chromium, type FullConfig } from '@playwright/test'

// Global setup for the default suite (playwright.config.ts). The suite starts its own dev server (port 5176), so the
// first tests no longer meet a server another session had already warmed: every route chunk is transformed on first
// request, and several workers asking at once kept pages on "Loading the page" past the 5 s expect timeout. Visiting
// each lazily loaded route once, before any test runs, transforms the module graph (and lets the dependency optimizer
// settle) so the tests measure the app, not a cold compiler. It asserts nothing about the app.
const ROUTES = [
  '/', '/dashboard', '/roadmap', '/sources', '/progress', '/project', '/archive/week/1', '/archive/week/3',
  ...Array.from({ length: 9 }, (_, i) => `/week/${i + 1}`),
  '/week/1/learn', '/week/1/practice', '/week/1/project', '/week/2/lecture/1', '/week/3/lecture/1', '/week/2/lesson', '/week/2/lab',
]

export default async function warmup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL
  if (!baseURL) return
  const browser = await chromium.launch({ channel: 'chrome' })
  try {
    const page = await browser.newPage()
    for (const r of ROUTES) {
      await page.goto(`${baseURL}/#${r}`)
      // the route skeleton (App.tsx) carries role=status "Loading the page" until the chunk has loaded
      await page.waitForFunction(() => !document.querySelector('[aria-label="Loading the page"]'), undefined, { timeout: 120_000 }).catch(() => {})
      await page.waitForLoadState('networkidle', { timeout: 60_000 }).catch(() => {})
    }
  } finally {
    await browser.close()
  }
}
