import type { ReactNode } from 'react'
import { AppStateProvider } from './AppState'
import { WorkspaceProvider } from './Workspace'
import { ProjectProvider } from '../project/store/ProjectProvider'
import { ProjectLegacyMirror } from './ProjectLegacyMirror'

/** All application state providers, in dependency order. Tests of interactive activities render inside this. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppStateProvider>
      <WorkspaceProvider>
        {/* My Project (A22): the team's canonical project, in its own store (IndexedDB), separate from practice state */}
        <ProjectProvider>
          <ProjectLegacyMirror />
          {children}
        </ProjectProvider>
      </WorkspaceProvider>
    </AppStateProvider>
  )
}
