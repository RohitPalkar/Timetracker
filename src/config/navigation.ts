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

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    collapsible: false,
    items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Project Management',
    items: [{ label: 'Projects', to: '/projects', icon: FolderKanban, end: true }],
  },
  {
    label: 'User & Organization',
    items: [
      { label: 'Employees', to: '/employees', icon: Users },
      { label: 'Teams', to: '/teams', icon: Users },
      { label: 'Departments', to: '/departments', icon: Building2 },
      { label: 'Roles', to: '/roles', icon: Shield },
      { label: 'Permissions', to: '/permissions', icon: Lock },
    ],
  },
  {
    label: 'HRMS',
    items: [
      { label: 'HR Overview', to: '/hrms', icon: HeartHandshake, end: true },
      { label: 'Attendance', to: '/hrms/attendance', icon: UserCheck },
      { label: 'Leave', to: '/hrms/leave', icon: CalendarDays },
      { label: 'Holidays', to: '/hrms/holidays', icon: CalendarDays },
      { label: 'HR Documents', to: '/hrms/documents', icon: FileText },
      { label: 'Assets', to: '/hrms/assets', icon: Building2 },
      { label: 'HR Requests', to: '/hrms/requests', icon: ClipboardCheck },
    ],
  },
  {
    label: 'Timesheet Management',
    items: [
      { label: 'My Timesheet', to: '/timesheets/my', icon: ClipboardList },
      { label: 'Team Timesheets', to: '/timesheets/team', icon: Users },
      { label: 'Approvals', to: '/timesheets/approvals', icon: ClipboardCheck },
      { label: 'Calendar', to: '/timesheets/calendar', icon: CalendarDays },
      { label: 'Reports', to: '/timesheets/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'AI Workspace',
    items: [
      { label: 'Agents', to: '/ai/agents', icon: Bot },
      { label: 'Usage', to: '/ai/usage', icon: Zap },
      { label: 'Prompt Library', to: '/ai/prompts', icon: Sparkles },
      { label: 'Knowledge Base', to: '/ai/knowledge', icon: BookOpen },
      { label: 'History', to: '/ai/history', icon: History },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { label: 'Reports & Analytics', to: '/reports', icon: BarChart3 },
      { label: 'Survey', to: '/survey', icon: ThumbsUp },
      { label: 'Documents', to: '/documents', icon: FileText },
      { label: 'Notifications', to: '/notifications', icon: Bell },
    ],
  },
  {
    label: 'System',
    collapsible: false,
    items: [
      { label: 'Administration', to: '/admin', icon: Cog },
      { label: 'Settings', to: '/settings', icon: Settings },
      { label: 'Profile', to: '/settings/profile', icon: UserCog },
    ],
  },
]

export interface NavMeta {
  label: string
  icon: LucideIcon
}
