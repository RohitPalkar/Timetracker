/**
 * Global navigation — 13 domains of MyTracker (spec §1, §23).
 * Single source of truth. Driven by effective capabilities, not hardcoded
 * persona checks. Sidebar consumes this via getFilteredNavGroups().
 */
import {
  BarChart3,
  Bell,
  Bot,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Cog,
  Eye,
  FileText,
  FolderKanban,
  HeartHandshake,
  History,
  LayoutDashboard,
  Lock,
  Settings,
  Shield,
  Sparkles,
  ThumbsUp,
  UserCog,
  UserCheck,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { NavGroup } from '@/components/navigation/sidebar-nav'
import type { PermissionKey } from '@/types/permission'

/** The 13 global domains — spec §1. */
export const GLOBAL_NAV_ORDER = [
  'Dashboard',
  'My Work',
  'Project Management',
  'Timesheets',
  'HRMS',
  'Monitoring',
  'Reports & Analytics',
  'AI Workspace',
  'Survey Management',
  'Notifications',
  'Documents',
  'Administration',
  'Settings',
] as const

/**
 * Full nav — each item may declare required permissions.
 * When `permission` is absent, the item is visible to any authenticated user.
 * The helper `getFilteredNavGroups` removes items the caller cannot access.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    collapsible: false,
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, end: true, permission: 'dashboard.view' },
    ],
  },
  {
    label: 'My Work',
    items: [
      // My Work reuses the dashboard's "My Work" widget; dedicated page is deferred to Feature 03+.
      { label: 'My Work', to: '/dashboard', icon: ClipboardList, permission: 'my_work.view' },
    ],
  },
  {
    label: 'Project Management',
    items: [{ label: 'Projects', to: '/projects', icon: FolderKanban, end: true, permission: 'projects.view' }],
  },
  {
    label: 'Timesheets',
    items: [
      { label: 'My Timesheet', to: '/timesheets/my', icon: ClipboardList, permission: 'timesheet.view' },
      { label: 'Team Timesheets', to: '/timesheets/team', icon: Users, permission: 'timesheets.view_all' },
      { label: 'Approvals', to: '/timesheets/approvals', icon: ClipboardCheck, permission: 'timesheet.approve' },
      { label: 'Calendar', to: '/timesheets/calendar', icon: CalendarDays, permission: 'timesheet.view' },
      { label: 'Reports', to: '/timesheets/reports', icon: BarChart3, permission: 'reports.view' },
    ],
  },
  {
    label: 'HRMS',
    items: [
      { label: 'HR Overview', to: '/hrms', icon: HeartHandshake, end: true, permission: 'hr.view' },
      { label: 'Attendance', to: '/hrms/attendance', icon: UserCheck, permission: 'attendance.view' },
      { label: 'Leave', to: '/hrms/leave', icon: CalendarDays, permission: 'leave.view' },
      { label: 'Holidays', to: '/hrms/holidays', icon: CalendarDays, permission: 'hr.view' },
      { label: 'HR Documents', to: '/hrms/documents', icon: FileText, permission: 'hr.view' },
      { label: 'Assets', to: '/hrms/assets', icon: Building2, permission: 'hr.view' },
      { label: 'HR Requests', to: '/hrms/requests', icon: ClipboardCheck, permission: 'hr.view' },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      // Deferred — placeholder that still honours permission gating
      { label: 'Monitoring', to: '/dashboard', icon: Eye, permission: 'monitoring.view' },
    ],
  },
  {
    label: 'Reports & Analytics',
    items: [{ label: 'Reports & Analytics', to: '/reports', icon: BarChart3, permission: 'reports.view' }],
  },
  {
    label: 'AI Workspace',
    items: [
      { label: 'Agents', to: '/ai/agents', icon: Bot, permission: 'ai.view' },
      { label: 'Usage', to: '/ai/usage', icon: Zap, permission: 'ai.view' },
      { label: 'Prompt Library', to: '/ai/prompts', icon: Sparkles, permission: 'ai.view' },
      { label: 'Knowledge Base', to: '/ai/knowledge', icon: BookOpen, permission: 'ai.view' },
      { label: 'History', to: '/ai/history', icon: History, permission: 'ai.view' },
    ],
  },
  {
    label: 'Survey Management',
    items: [{ label: 'Survey', to: '/survey', icon: ThumbsUp, permission: 'survey.view' }],
  },
  {
    label: 'Notifications',
    items: [{ label: 'Notifications', to: '/notifications', icon: Bell, permission: 'notifications.view' }],
  },
  {
    label: 'Documents',
    items: [{ label: 'Documents', to: '/documents', icon: FileText, permission: 'documents.view' }],
  },
  {
    label: 'User & Organization',
    items: [
      { label: 'Employees', to: '/employees', icon: Users, permission: 'employee.view' },
      { label: 'Teams', to: '/teams', icon: Users, permission: 'teams.view' },
      { label: 'Departments', to: '/departments', icon: Building2, permission: 'users.view' },
      { label: 'Roles', to: '/roles', icon: Shield, permission: 'roles.manage' },
      { label: 'Permissions', to: '/permissions', icon: Lock, permission: 'roles.manage' },
    ],
  },
  {
    label: 'Administration',
    collapsible: false,
    items: [{ label: 'Administration', to: '/admin', icon: Cog, permission: 'administration.view' }],
  },
  {
    label: 'Settings',
    collapsible: false,
    items: [
      { label: 'Settings', to: '/settings', icon: Settings, permission: 'settings.view' },
      { label: 'Profile', to: '/settings/profile', icon: UserCog, permission: 'settings.view' },
    ],
  },
]

// Legacy export for direct sidebar consumption (unfiltered). Prefer getFilteredNavGroups.
export interface NavMeta {
  label: string
  icon: LucideIcon
}

/** Filter groups/items by effective capabilities. Admin.all always passes. */
export function getFilteredNavGroups(
  permissions: PermissionKey[],
  can: (p: PermissionKey | PermissionKey[]) => boolean,
): NavGroup[] {
  const isAdmin = permissions.includes('admin.all')
  if (isAdmin) return NAV_GROUPS
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      const required = (item as { permission?: PermissionKey | PermissionKey[] }).permission
      if (!required) return true
      return can(required)
    }),
  })).filter((group) => group.items.length > 0)
}
