import {
  Boxes,
  Bug,
  CalendarClock,
  ClipboardList,
  FolderKanban,
  Gauge,
  Layers,
  LayoutDashboard,
  ListChecks,
  Settings,
  SquareKanban,
  Target,
  Ticket,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { NavGroup } from '@/components/navigation/sidebar-nav'

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    collapsible: false,
    items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Planning',
    items: [
      { label: 'Backlog', to: '/planning/backlog', icon: ListChecks },
      { label: 'Board', to: '/planning/board', icon: SquareKanban },
      { label: 'Sprints', to: '/planning/sprints', icon: CalendarClock },
      { label: 'Stories', to: '/planning/stories', icon: Target },
      { label: 'Bugs', to: '/planning/bugs', icon: Bug },
      { label: 'Epics', to: '/planning/epics', icon: Layers },
      { label: 'Releases', to: '/planning/releases', icon: Boxes },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Projects', to: '/projects', icon: FolderKanban },
      { label: 'People', to: '/people', icon: Users },
      { label: 'Timesheets', to: '/timesheets', icon: ClipboardList },
      { label: 'Reports', to: '/reports', icon: Gauge },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Users', to: '/administration/users', icon: Users },
      { label: 'Roles & Permissions', to: '/administration/roles', icon: ShieldUser, end: true },
      { label: 'Designations', to: '/administration/designations', icon: Ticket },
    ],
  },
  {
    label: 'System',
    collapsible: false,
    items: [{ label: 'Settings', to: '/settings', icon: Settings, end: true }],
  },
]

import { ShieldUser } from 'lucide-react'

export interface NavMeta {
  label: string
  icon: LucideIcon
}
