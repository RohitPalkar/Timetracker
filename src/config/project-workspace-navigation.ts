import {
  BarChart3,
  Boxes,
  FolderOpen,
  GitBranch,
  LayoutDashboard,
  Settings,
  SquareKanban,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { ProjectCapability } from './project-config'

/**
 * Project Workspace navigation — LEVEL 2 in the navigation hierarchy.
 *
 * Application navigation (LEVEL 1) lives in `src/config/navigation.ts` and is
 * global. Project Workspace navigation is scoped strictly to the selected
 * project (`/projects/:projectId/*`) and must NEVER appear in the global
 * sidebar. Items are capability-gated: a persona only sees items whose
 * `requiredCapability` exists in `PROJECT_PERSONAS[persona].capabilities`.
 */

export type ProjectWorkspaceNavId =
  | 'overview'
  | 'sub-projects'
  | 'teams'
  | 'sprint-planning'
  | 'board'
  | 'reports'
  | 'files'
  | 'settings'

export interface ProjectWorkspaceNavItem {
  id: ProjectWorkspaceNavId
  label: string
  /** Relative child route — resolves under `/projects/:projectId/`. */
  route: string
  icon: LucideIcon
  requiredCapability: ProjectCapability
  /** Copy shown by the placeholder page until the module ships. */
  placeholder: string
}

export const PROJECT_WORKSPACE_NAV: ProjectWorkspaceNavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    route: 'overview',
    icon: LayoutDashboard,
    requiredCapability: 'projects.view',
    placeholder: 'Project overview with health, progress, budget and the latest activity.',
  },
  {
    id: 'sub-projects',
    label: 'Sub Projects',
    route: 'sub-projects',
    icon: Boxes,
    requiredCapability: 'projects.subprojects.view',
    placeholder: 'Break this project into Sub Projects — each with its own backlog, sprint, board and releases.',
  },
  {
    id: 'teams',
    label: 'Teams',
    route: 'teams',
    icon: Users,
    requiredCapability: 'projects.teams.view',
    placeholder: 'Members and delivery teams working on this project.',
  },
  {
    id: 'sprint-planning',
    label: 'Sprint Planning',
    route: 'sprint-planning',
    icon: GitBranch,
    requiredCapability: 'planning.view',
    placeholder: 'Plan, start and close sprints for the active Sub Projects.',
  },
  {
    id: 'board',
    label: 'Board',
    route: 'board',
    icon: SquareKanban,
    requiredCapability: 'board.view',
    placeholder: 'Kanban board for epics, stories, tasks and bugs across the active sprint.',
  },
  {
    id: 'reports',
    label: 'Reports',
    route: 'reports',
    icon: BarChart3,
    requiredCapability: 'reports.project.view',
    placeholder: 'Delivery, quality and cost reports for this project.',
  },
  {
    id: 'files',
    label: 'Files',
    route: 'files',
    icon: FolderOpen,
    requiredCapability: 'documents.project.view',
    placeholder: 'Project documents, uploads and shared files.',
  },
  {
    id: 'settings',
    label: 'Settings',
    route: 'settings',
    icon: Settings,
    requiredCapability: 'projects.settings',
    placeholder: 'Project master data, access and workspace preferences.',
  },
]

/** Navigation items the given actor may see, filtered by capability. */
export function getVisibleWorkspaceNav(can: (capability: ProjectCapability) => boolean): ProjectWorkspaceNavItem[] {
  return PROJECT_WORKSPACE_NAV.filter((item) => can(item.requiredCapability))
}

/** Resolve the nav item for an absolute workspace path (e.g. `/projects/prj-x/board`). */
export function findWorkspaceNavItem(
  projectId: string,
  pathname: string,
  items: ProjectWorkspaceNavItem[] = PROJECT_WORKSPACE_NAV,
): ProjectWorkspaceNavItem | undefined {
  return items.find((item) => {
    const prefix = `/projects/${projectId}/${item.route}`
    return pathname === prefix || pathname.startsWith(`${prefix}/`)
  })
}
