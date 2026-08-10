import {
  BarChart3,
  Boxes,
  FolderOpen,
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
 * Project Workspace navigation — LEVEL 2 in the navigation hierarchy.
 *
 * Application navigation (LEVEL 1) lives in `src/config/navigation.ts` and is
 * global. Project Workspace navigation is scoped strictly to the selected
 * project (`/projects/:projectId/*`) and must NEVER appear in the global
 * sidebar.
 *
 * Items are capability-gated AND structure-gated:
 *   - `flat`       → simple projects only (no Sub Projects). Backlog/Epics/
 *                    Sprints/Board/Releases live here.
 *   - `structured` → projects with Sub Projects. Delivery artifacts live inside
 *                    each Sub Project workspace instead.
 *   - `always`     → shown regardless of structure.
 */

export type ProjectWorkspaceNavId =
  | 'overview'
  | 'backlog'
  | 'epics'
  | 'sprints'
  | 'board'
  | 'releases'
  | 'sub-projects'
  | 'teams'
  | 'reports'
  | 'files'
  | 'settings'

export type ProjectWorkspaceStructure = 'flat' | 'structured'

/** Derive the nav structure mode from whether the project has Sub Projects. */
export function workspaceStructure(hasSubProjects: boolean): ProjectWorkspaceStructure {
  return hasSubProjects ? 'structured' : 'flat'
}

export interface ProjectWorkspaceNavItem {
  id: ProjectWorkspaceNavId
  label: string
  /** Relative child route — resolves under `/projects/:projectId/`. */
  route: string
  icon: LucideIcon
  requiredCapability: ProjectCapability
  /** Which project structures this item belongs to. */
  structure: ProjectWorkspaceStructure | 'always'
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
    structure: 'always',
    placeholder: 'Project overview with health, progress, budget and the latest activity.',
  },
  {
    id: 'backlog',
    label: 'Backlog',
    route: 'backlog',
    icon: ListOrdered,
    requiredCapability: 'planning.view',
    structure: 'flat',
    placeholder: 'Prioritized backlog of epics, stories, tasks and bugs for this project.',
  },
  {
    id: 'epics',
    label: 'Epics',
    route: 'epics',
    icon: Layers,
    requiredCapability: 'planning.view',
    structure: 'flat',
    placeholder: 'Large bodies of work broken into stories across sprints.',
  },
  {
    id: 'sprints',
    label: 'Sprints',
    route: 'sprints',
    icon: GitBranch,
    requiredCapability: 'planning.view',
    structure: 'flat',
    placeholder: 'Plan, start and close sprints for this project.',
  },
  {
    id: 'board',
    label: 'Board',
    route: 'board',
    icon: SquareKanban,
    requiredCapability: 'board.view',
    structure: 'flat',
    placeholder: 'Kanban board for epics, stories, tasks and bugs across the active sprint.',
  },
  {
    id: 'releases',
    label: 'Releases',
    route: 'releases',
    icon: Rocket,
    requiredCapability: 'planning.view',
    structure: 'flat',
    placeholder: 'Release trains, versions and deployment plans for this project.',
  },
  {
    id: 'sub-projects',
    label: 'Sub Projects',
    route: 'sub-projects',
    icon: Boxes,
    requiredCapability: 'projects.subprojects.view',
    structure: 'structured',
    placeholder: 'Break this project into Sub Projects — each with its own backlog, sprint, board and releases.',
  },
  {
    id: 'teams',
    label: 'Teams',
    route: 'teams',
    icon: Users,
    requiredCapability: 'projects.teams.view',
    structure: 'always',
    placeholder: 'Members and delivery teams working on this project.',
  },
  {
    id: 'reports',
    label: 'Reports',
    route: 'reports',
    icon: BarChart3,
    requiredCapability: 'reports.project.view',
    structure: 'always',
    placeholder: 'Delivery, quality and cost reports for this project.',
  },
  {
    id: 'files',
    label: 'Files',
    route: 'files',
    icon: FolderOpen,
    requiredCapability: 'documents.project.view',
    structure: 'always',
    placeholder: 'Project documents, uploads and shared files.',
  },
  {
    id: 'settings',
    label: 'Settings',
    route: 'settings',
    icon: Settings,
    requiredCapability: 'projects.settings',
    structure: 'always',
    placeholder: 'Project master data, access and workspace preferences.',
  },
]

/** Navigation items the given actor may see for a project structure, filtered by capability. */
export function getVisibleWorkspaceNav(
  can: (capability: ProjectCapability) => boolean,
  structure: ProjectWorkspaceStructure | 'always' = 'always',
): ProjectWorkspaceNavItem[] {
  return PROJECT_WORKSPACE_NAV.filter(
    (item) => can(item.requiredCapability) && (item.structure === 'always' || item.structure === structure),
  )
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
