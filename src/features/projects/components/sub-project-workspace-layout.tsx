import * as React from 'react'
import { useLocation } from 'react-router'
import { Breadcrumb } from '@/components/navigation/breadcrumb'
import { SubProjectWorkspaceHeader } from './sub-project-workspace-header'
import { SubProjectWorkspaceNav } from './sub-project-workspace-nav'
import { useSubProjectWorkspace } from './sub-project-workspace-context'
import { findSubProjectWorkspaceNavItem, getVisibleSubProjectWorkspaceNav } from '@/config/sub-project-workspace-navigation'

/**
 * Sub Project Workspace shell (LEVEL 3 navigation). Provides the shared
 * sub-project context header, workspace navigation and breadcrumb around the
 * routed child screens. Sits inside the project workspace shell — never
 * duplicates the global sidebar.
 */
export function SubProjectWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { projectId, projectName, subProject, can } = useSubProjectWorkspace()
  const { pathname } = useLocation()

  const items = getVisibleSubProjectWorkspaceNav(can)
  const activeItem = findSubProjectWorkspaceNavItem(projectId, subProject.id, pathname, items)

  return (
    <div className="flex w-full flex-col gap-5">
      <Breadcrumb
        items={[
          { label: 'Projects', to: '/projects' },
          { label: projectName, to: `/projects/${projectId}/overview` },
          { label: subProject.name, to: `/projects/${projectId}/sub-projects/${subProject.id}/overview` },
          ...(activeItem ? [{ label: activeItem.label }] : []),
        ]}
      />

      <SubProjectWorkspaceHeader />

      <SubProjectWorkspaceNav />

      <div className="min-h-[420px]">{children}</div>
    </div>
  )
}
