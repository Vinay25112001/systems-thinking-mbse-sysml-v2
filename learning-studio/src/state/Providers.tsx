import type { ReactNode } from 'react'
import { AppStateProvider } from './AppState'
import { WorkspaceProvider } from './Workspace'

/** All application state providers, in dependency order. Tests of interactive activities render inside this. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppStateProvider>
      <WorkspaceProvider>{children}</WorkspaceProvider>
    </AppStateProvider>
  )
}
