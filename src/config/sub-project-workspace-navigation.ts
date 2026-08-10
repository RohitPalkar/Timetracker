import {
  BarChart3,
  GitBranch,
  Layers,
  LayoutDashboard,
  ListOrdered,
  Rocket,
  Settings,
  SquareKanban,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { ProjectCapability } from './project-config'

/**
 * Sub Project Workspace navigation — LEVEL 3 in the navigation hierarchy.
 *
 * Scoped strictly to the selected Sub Project
 * (`/projects/:projectId/sub-projects/:subProjectId/*`) and NEVER shown in the
 * global sidebar. It only appears for projects with Sub Projects
 * (`hasSubProjects === true`); simple projects host the same delivery
 * artifacts directly in their Project Workspace nav instead.
 *
 * Items are capability-gated the same way as the Project Workspace nav.
 */

export type SubProjectWorkspaceNavId =
  | 'overview'
  | 'backlog'
  | 'epics'
  | 'sprints'
  | 'board'
  | 'releases'
  | 'team'
  | 'reports'
  | 'settings'

export interface SubProjectWorkspaceNavItem {
  id: SubProjectWorkspaceNavId
  label: string
  /** Relative child route — resolves under `/projects/:projectId/sub-projects/:subProjectId/`. */
  route: string
  icon: LucideIcon
  requiredCapability: ProjectCapability
  /** Copy shown by the placeholder page until the module ships. */
  placeholder: string
}

export const SUB_PROJECT_WORKSPACE_NAV: SubProjectWorkspaceNavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    route: 'overview',
    icon: LayoutDashboard,
    requiredCapability: 'projects.view',
    placeholder: 'Sub Project overview with health, progress, budget and the latest activity.',
  },
  {
    id: 'backlog',
    label: 'Backlog',
    route: 'backlog',
    icon: ListOrdered,
    requiredCapability: 'planning.view',
    placeholder: 'Prioritized backlog of epics, stories, tasks and bugs for this Sub Project.',
  },
  {
    id: 'epics',
    label: 'Epics',
    route: 'epics',
    icon: Layers,
    requiredCapability: 'planning.view',
    placeholder: 'Large bodies of work broken into stories across sprints in this Sub Project.',
  },
  {
    id: 'sprints',
    label: 'Sprints',
    route: 'sprints',
    icon: GitBranch,
    requiredCapability: 'planning.view',
    placeholder: 'Plan, start and close sprints for this Sub Project.',
  },
  {
    id: 'board',
    label: 'Board',
    route: 'board',
    icon: SquareKanban,
    requiredCapability: 'board.view',
    placeholder: 'Kanban board for this Sub Project across the active sprint.',
  },
  {
    id: 'releases',
    label: 'Releases',
    route: 'releases',
    icon: Rocket,
    requiredCapability: 'planning.view',
    placeholder: 'Release trains, versions and deployment plans for this Sub Project.',
  },
  {
    id: 'team',
    label: 'Team',
    route: 'team',
    icon: Users,
    requiredCapability: 'projects.teams.view',
    placeholder: 'Delivery teams and members assigned to this Sub Project.',
  },
  {
    id: 'reports',
    label: 'Reports',
    route: 'reports',
    icon: BarChart3,
    requiredCapability: 'reports.project.view',
    placeholder: 'Delivery, quality and cost reports for this Sub Project.',
  },
  {
    id: 'settings',
    label: 'Settings',
    route: 'settings',
    icon: Settings,
    requiredCapability: 'projects.settings',
    placeholder: 'Sub Project master data, access and workspace preferences.',
  },
]

/** Navigation items the given actor may see, filtered by capability. */
export function getVisibleSubProjectWorkspaceNav(
  can: (capability: ProjectCapability) => boolean,
): SubProjectWorkspaceNavItem[] {
  return SUB_PROJECT_WORKSPACE_NAV.filter((item) => can(item.requiredCapability))
}

/** Resolve the nav item for an absolute sub-project workspace path. */
export function findSubProjectWorkspaceNavItem(
  projectId: string,
  subProjectId: string,
  pathname: string,
  items: SubProjectWorkspaceNavItem[] = SUB_PROJECT_WORKSPACE_NAV,
): SubProjectWorkspaceNavItem | undefined {
  return items.find((item) => {
    const prefix = `/projects/${projectId}/sub-projects/${subProjectId}/${item.route}`
    return pathname === prefix || pathname.startsWith(`${prefix}/`)
  })
}
