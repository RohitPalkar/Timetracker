import {
  BarChart3,
  Bug,
  CalendarClock,
  Folder,
  Layers,
  LayoutDashboard,
  ListChecks,
  Rocket,
  Settings2,
  SquareKanban,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface WorkspaceNavItem {
  label: string
  /** Route segment relative to the project base (e.g. /projects/:projectId). */
  to: string
  icon: LucideIcon
  /** Match only this exact path (no child prefixes). */
  end?: boolean
}

export interface WorkspaceNavGroup {
  label: string
  items: WorkspaceNavItem[]
  /** False: always rendered open. Default: collapsible. */
  collapsible?: boolean
}

/**
 * Project Workspace navigation — feeds the workspace sidebar inside the shell.
 * `to` values are project-relative; the WorkspaceLayout prefixes them with
 * `/projects/:projectId` when rendering links.
 */
export const WORKSPACE_NAV: WorkspaceNavGroup[] = [
  {
    label: 'Project',
    collapsible: false,
    items: [
      { label: 'Overview', to: 'overview', icon: LayoutDashboard, end: true },
      { label: 'Sub Projects', to: 'sub-projects', icon: Layers },
      { label: 'Teams', to: 'teams', icon: Users },
    ],
  },
  {
    label: 'Planning',
    items: [
      { label: 'Sprint Planning', to: 'sprints', icon: CalendarClock },
      { label: 'Board', to: 'board', icon: SquareKanban },
      { label: 'Backlog', to: 'backlog', icon: ListChecks },
      { label: 'Epics', to: 'epics', icon: Layers },
      { label: 'Releases', to: 'releases', icon: Rocket },
      { label: 'Stories', to: 'stories', icon: Target },
      { label: 'Bugs', to: 'bugs', icon: Bug },
    ],
  },
  {
    label: 'Deliverables',
    items: [
      { label: 'Reports', to: 'reports', icon: BarChart3 },
      { label: 'Files', to: 'files', icon: Folder },
      { label: 'Settings', to: 'settings', icon: Settings2 },
    ],
  },
]