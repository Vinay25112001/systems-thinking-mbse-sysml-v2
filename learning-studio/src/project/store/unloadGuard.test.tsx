// The unload guard (M2 review M4): with edits that storage has not confirmed (a failed save here), closing or reloading
// the page asks first; with everything saved it does not.
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryAdapter } from './memory'
import { ProjectProvider } from './ProjectProvider'
import { ProjectStore } from './ProjectStore'

const unload = () => {
  const e = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(e)
  return e.defaultPrevented
}

describe('beforeunload guard', () => {
  it('warns while a failed save leaves edits unsaved, and not when everything is saved', async () => {
    const adapter = new MemoryAdapter()
    const store = new ProjectStore(adapter, { startEmpty: true, autosaveMs: 1, retryMs: 1 })
    await store.create({ teamLabel: '07', enterpriseName: 'Guarded Enterprise' })
    render(
      <ProjectProvider store={store}>
        <span />
      </ProjectProvider>,
    )
    await new Promise((r) => setTimeout(r, 0))
    expect(store.hasUnsaved()).toBe(false)
    expect(unload()).toBe(false)
    adapter.failWrites = 'write'
    const ent = Object.values(store.getState().doc!.artifacts).find((a) => a.type === 'ENT')!
    expect(store.apply([{ op: 'update-artifact', uid: ent.uid, fields: [{ path: 'title', before: ent.title, after: 'Renamed' }] }]).ok).toBe(true)
    await store.flush()
    expect(store.getState().save.kind).toBe('error')
    expect(store.hasUnsaved()).toBe(true)
    expect(unload()).toBe(true)
    adapter.failWrites = false
    await store.flush()
    expect(store.getState().save.kind).toBe('saved')
    expect(unload()).toBe(false)
    store.dispose()
  })
})
