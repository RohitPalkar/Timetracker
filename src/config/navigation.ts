/**
 * Global navigation — grouped compact sidebar (Feature 02 revamp).
 * Main / Settings separation, collapsible groups, permission-driven.
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

export const NAV_MODE_KEY = 'mytracker.nav.mode'

// ── Main navigation — spec §5 ──────────────────────────────────────────
// 7 collapsible sections collapsing into compact enterprise shell.
// Only routes that actually exist are listed; Monitoring is deferred placeholder disabled.

export const NAV_MAIN_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    collapsible: false,
    items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, end: true, permission: 'dashboard.view' }],
  },
  {
    id: 'work',
    label: 'Work',
    items: [
      {
        label: 'My Work',
        to: '/my-work',
        icon: ClipboardList,
        permission: 'my_work.view',
      },
      {
        label: 'Project Management',
        to: '/projects',
        icon: FolderKanban,
        permission: 'projects.view',
        children: [{ label: 'Projects', to: '/projects', icon: FolderKanban, end: true, permission: 'projects.view' }],
      },
      {
        label: 'Timesheets',
        to: '/timesheets',
        icon: ClipboardList,
        permission: 'timesheet.view',
        children: [
          { label: 'My Timesheet', to: '/timesheets/my', icon: ClipboardList, permission: 'timesheet.view' },
          { label: 'Team Timesheets', to: '/timesheets/team', icon: Users, permission: 'timesheets.view_all' },
          { label: 'Approvals', to: '/timesheets/approvals', icon: ClipboardCheck, permission: 'timesheet.approve' },
          { label: 'Calendar', to: '/timesheets/calendar', icon: CalendarDays, permission: 'timesheet.view' },
          { label: 'Reports', to: '/timesheets/reports', icon: BarChart3, permission: 'reports.view' },
        ],
      },
    ],
  },
  {
    id: 'people',
    label: 'People',
    items: [
      {
        label: 'HRMS',
        to: '/hrms',
        icon: HeartHandshake,
        permission: 'hr.view',
        children: [
          { label: 'HR Overview', to: '/hrms', icon: HeartHandshake, end: true, permission: 'hr.view' },
          { label: 'Attendance', to: '/hrms/attendance', icon: UserCheck, permission: 'attendance.view' },
          { label: 'Leave', to: '/hrms/leave', icon: CalendarDays, permission: 'leave.view' },
          { label: 'Holidays', to: '/hrms/holidays', icon: CalendarDays, permission: 'hr.view' },
          { label: 'HR Documents', to: '/hrms/documents', icon: FileText, permission: 'hr.view' },
          { label: 'Assets', to: '/hrms/assets', icon: Building2, permission: 'hr.view' },
          { label: 'HR Requests', to: '/hrms/requests', icon: ClipboardCheck, permission: 'hr.view' },
        ],
      },
    ],
  },
  {
    id: 'insights',
    label: 'Insights',
    items: [
      {
        label: 'Monitoring',
        to: '/monitoring',
        icon: Eye,
        permission: 'monitoring.view',
        children: [{ label: 'Monitoring', to: '/monitoring', icon: Eye, permission: 'monitoring.view', disabled: true }],
      },
      {
        label: 'Reports & Analytics',
        to: '/reports',
        icon: BarChart3,
        permission: 'reports.view',
      },
      {
        label: 'AI Workspace',
        to: '/ai/agents',
        icon: Bot,
        permission: 'ai.view',
        children: [
          { label: 'Agents', to: '/ai/agents', icon: Bot, permission: 'ai.view' },
          { label: 'Usage', to: '/ai/usage', icon: Zap, permission: 'ai.view' },
          { label: 'Prompt Library', to: '/ai/prompts', icon: Sparkles, permission: 'ai.view' },
          { label: 'Knowledge Base', to: '/ai/knowledge', icon: BookOpen, permission: 'ai.view' },
          { label: 'History', to: '/ai/history', icon: History, permission: 'ai.view' },
        ],
      },
    ],
  },
  {
    id: 'engagement',
    label: 'Engagement',
    items: [
      { label: 'Survey Management', to: '/survey', icon: ThumbsUp, permission: 'survey.view' },
      { label: 'Notifications', to: '/notifications', icon: Bell, permission: 'notifications.view' },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    items: [{ label: 'Documents', to: '/documents', icon: FileText, permission: 'documents.view' }],
  },
  {
    id: 'administration',
    label: 'Administration',
    collapsible: false,
    items: [{ label: 'Administration', to: '/admin', icon: Cog, permission: 'administration.view' }],
  },
]

// ── Settings navigation — spec §17 ─────────────────────────────────────
// Only existing routes enabled; others disabled placeholders preserving arch.

export const NAV_SETTINGS_GROUPS: NavGroup[] = [
  {
    id: 'account',
    label: 'Account',
    items: [
      { label: 'My Profile', to: '/settings/profile', icon: UserCog, permission: 'settings.view' },
      { label: 'Preferences', to: '/settings', icon: Settings, permission: 'settings.view' },
      { label: 'Notifications', to: '/notifications', icon: Bell, permission: 'notifications.view' },
    ],
  },
  {
    id: 'organization',
    label: 'Organization',
    items: [
      { label: 'Organization', to: '/settings', icon: Building2, permission: 'settings.view' },
      { label: 'Members', to: '/employees', icon: Users, permission: 'employee.view' },
      { label: 'Teams', to: '/teams', icon: Users, permission: 'teams.view' },
      { label: 'Roles & Permissions', to: '/roles', icon: Shield, permission: 'roles.manage' },
      { label: 'Permissions', to: '/permissions', icon: Lock, permission: 'roles.manage' },
    ],
  },
  {
    id: 'work-settings',
    label: 'Work',
    items: [
      { label: 'Workflows', to: '/settings', icon: Cog, permission: 'settings.view', disabled: true },
      { label: 'Time Policies', to: '/settings', icon: CalendarDays, permission: 'settings.manage', disabled: true },
      { label: 'Approval Rules', to: '/settings', icon: ClipboardCheck, permission: 'settings.manage', disabled: true },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    items: [
      { label: 'Security', to: '/settings', icon: Shield, permission: 'settings.view', disabled: true },
      { label: 'Sessions', to: '/settings', icon: History, permission: 'settings.view', disabled: true },
      { label: 'Audit Logs', to: '/admin', icon: FileText, permission: 'administration.view', disabled: true },
    ],
  },
]

// Back-compat flat export — legacy callers use MAIN groups
export const NAV_GROUPS: NavGroup[] = NAV_MAIN_GROUPS
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

export interface NavMeta {
  label: string
  icon: LucideIcon
}

export function getFilteredNavGroups(
  groups: NavGroup[],
  permissions: PermissionKey[],
  can: (p: PermissionKey | PermissionKey[]) => boolean,
): NavGroup[] {
  const isAdmin = permissions.includes('admin.all')
  if (isAdmin) return groups
  return groups
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => {
          // Filter children first
          const children = item.children?.filter((child) => {
            const req = child.permission
            if (!req) return true
            return can(req)
          })
          // If parent has children and all filtered out, hide parent unless parent itself permitted
          if (item.children && item.children.length > 0) {
            if (!children || children.length === 0) {
              // Check if parent alone is permitted — if not, hide entirely
              const parentReq = item.permission
              if (parentReq && !can(parentReq)) return null as unknown as typeof item
              // No children left but parent remains as leaf
              return { ...item, children: undefined }
            }
            return { ...item, children }
          }
          const req = item.permission
          if (!req) return item
          return can(req) ? item : (null as unknown as typeof item)
        })
        .filter(Boolean) as typeof group.items,
    }))
    .filter((group) => group.items.length > 0)
}

// Convenience wrapper for MAIN groups
export function getFilteredMainGroups(permissions: PermissionKey[], can: (p: PermissionKey | PermissionKey[]) => boolean) {
  return getFilteredNavGroups(NAV_MAIN_GROUPS, permissions, can)
}
export function getFilteredSettingsGroups(permissions: PermissionKey[], can: (p: PermissionKey | PermissionKey[]) => boolean) {
  return getFilteredNavGroups(NAV_SETTINGS_GROUPS, permissions, can)
}
