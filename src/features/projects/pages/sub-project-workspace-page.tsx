import { Outlet } from 'react-router'
import { RequireSubProjectAccess } from '../components/require-sub-project-access'
import { SubProjectWorkspaceLayout } from '../components/sub-project-workspace-layout'

/**
 * Sub Project Workspace route element —
 * `/projects/:projectId/sub-projects/:subProjectId/*`.
 * Access is enforced before the shell renders (404 → NotFound, 403 →
 * Forbidden); the shell then provides the shared sub-project context header,
 * workspace navigation and breadcrumb around the routed child screens.
 */
export function SubProjectWorkspacePage() {
  return (
    <RequireSubProjectAccess>
      <SubProjectWorkspaceLayout>
        <Outlet />
      </SubProjectWorkspaceLayout>
    </RequireSubProjectAccess>
  )
}
