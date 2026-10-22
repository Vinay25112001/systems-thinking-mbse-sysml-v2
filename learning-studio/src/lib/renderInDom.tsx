// Renders a page into a DOM (jsdom in tests and in scripts/check-student-build.mjs) inside all application providers and
// returns its markup once it stops changing (lazy chunks resolve after the first commit). For pages that read the
// project store, which cannot render on a server (useSyncExternalStore without a server snapshot). Not used by the app.
import { act, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from '../state/Providers'

export async function renderInDom(node: ReactNode): Promise<string> {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  const el = document.createElement('div')
  document.body.appendChild(el)
  const root = createRoot(el)
  await act(async () => {
    root.render(<Providers>{node}</Providers>)
  })
  let last = ''
  for (let i = 0, stable = 0; i < 60 && stable < 3; i++) {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100))
    })
    stable = el.innerHTML === last ? stable + 1 : 0
    last = el.innerHTML
  }
  const html = el.innerHTML
  await act(async () => root.unmount())
  el.remove()
  return html
}
