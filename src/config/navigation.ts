import {
  Boxes,
  CalendarClock,
  ClipboardList,
  FolderKanban,
  Gauge,
  Layers,
  LayoutDashboard,
  ListChecks,
  Settings,
  SquareKanban,
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
    label: 'Workspace',
    items: [
      { label: 'Board', to: '/workspace/board', icon: SquareKanban },
      { label: 'Backlog', to: '/workspace/backlog', icon: ListChecks },
      { label: 'Sprints', to: '/workspace/sprints', icon: CalendarClock },
      { label: 'Epics', to: '/workspace/epics', icon: Layers },
      { label: 'Releases', to: '/workspace/releases', icon: Boxes },
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
