import { Outlet } from 'react-router'
import { RequireProjectAccess } from '../components/require-project-access'
import { ProjectWorkspaceLayout } from '../components/project-workspace-layout'

/**
 * Project Workspace route element — `/projects/:projectId/*`.
 * Access is enforced before the shell renders (404 → NotFound, 403 →
 * Forbidden); the shell then provides the shared project context header,
 * workspace navigation and breadcrumb around the routed child screens.
 */
export function ProjectWorkspacePage() {
  return (
    <RequireProjectAccess>
      <ProjectWorkspaceLayout>
        <Outlet />
      </ProjectWorkspaceLayout>
    </RequireProjectAccess>
  )
}
