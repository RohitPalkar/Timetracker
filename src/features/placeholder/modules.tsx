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
  History,
  Lock,
  Settings,
  Shield,
  Sparkles,
  ThumbsUp,
  UserCog,
  Users as UsersIcon,
  Zap,
} from 'lucide-react'
import { PlaceholderPage } from '@/features/placeholder/placeholder-page'

// ─── User & Organization ────────────────────────────────────
export function EmployeesPage() {
  return (
    <PlaceholderPage
      title="Employees"
      description="Manage employee profiles, status, and org assignments."
      icon={UsersIcon}
    />
  )
}

export function TeamsPage() {
  return (
    <PlaceholderPage
      title="Teams"
      description="Create and manage teams across the organization."
      icon={UsersIcon}
    />
  )
}

export function DepartmentsPage() {
  return (
    <PlaceholderPage
      title="Departments"
      description="Organize teams and employees into departments."
      icon={Building2}
    />
  )
}

export function RolesPage() {
  return (
    <PlaceholderPage
      title="Roles"
      description="Define roles and responsibility scopes."
      icon={Shield}
    />
  )
}

export function PermissionsPage() {
  return (
    <PlaceholderPage
      title="Permissions"
      description="Configure role-based access control policies."
      icon={Lock}
    />
  )
}

// ─── Timesheet Management ───────────────────────────────────
export function MyTimesheetPage() {
  return (
    <PlaceholderPage
      title="My Timesheet"
      description="Log and view your weekly time entries."
      icon={ClipboardList}
    />
  )
}

export function TeamTimesheetsPage() {
  return (
    <PlaceholderPage
      title="Team Timesheets"
      description="Review time entries for your team members."
      icon={UsersIcon}
    />
  )
}

export function TimesheetApprovalsPage() {
  return (
    <PlaceholderPage
      title="Approvals"
      description="Review and approve pending timesheet submissions."
      icon={ClipboardCheck}
    />
  )
}

export function TimesheetCalendarPage() {
  return (
    <PlaceholderPage
      title="Calendar"
      description="Visualize time logs on a calendar view."
      icon={CalendarDays}
    />
  )
}

export function TimesheetReportsPage() {
  return (
    <PlaceholderPage
      title="Timesheet Reports"
      description="Summaries, utilisation, and billable hours."
      icon={BarChart3}
    />
  )
}

// ─── AI Workspace ───────────────────────────────────────────
export function AIAgentsPage() {
  return (
    <PlaceholderPage
      title="Agents"
      description="Configure and manage AI agents for your workspace."
      icon={Bot}
    />
  )
}

export function AIUsagePage() {
  return (
    <PlaceholderPage
      title="Usage"
      description="Track AI token consumption and cost."
      icon={Zap}
    />
  )
}

export function AIPromptsPage() {
  return (
    <PlaceholderPage
      title="Prompt Library"
      description="Saved and shared prompt templates."
      icon={Sparkles}
    />
  )
}

export function AIKnowledgePage() {
  return (
    <PlaceholderPage
      title="Knowledge Base"
      description="Documents and context for AI retrieval."
      icon={BookOpen}
    />
  )
}

export function AIHistoryPage() {
  return (
    <PlaceholderPage
      title="History"
      description="Past AI interactions and audit trail."
      icon={History}
    />
  )
}

// ─── Workspace ──────────────────────────────────────────────
export function ReportsPage() {
  return (
    <PlaceholderPage
      title="Reports & Analytics"
      description="Sprint, budget, and delivery analytics."
      icon={BarChart3}
    />
  )
}

export function SurveyPage() {
  return (
    <PlaceholderPage
      title="Survey Management"
      description="Create and manage team surveys and feedback."
      icon={ThumbsUp}
    />
  )
}

export function DocumentsPage() {
  return (
    <PlaceholderPage
      title="Documents"
      description="Centralized document storage and management."
      icon={FileText}
    />
  )
}

export function NotificationsPage() {
  return (
    <PlaceholderPage
      title="Notifications"
      description="Notification preferences and activity feed."
      icon={Bell}
    />
  )
}

// ─── System ─────────────────────────────────────────────────
export function AdministrationPage() {
  return (
    <PlaceholderPage
      title="Administration"
      description="Global system administration and configuration."
      icon={Cog}
    />
  )
}

export function SettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Workspace preferences, integrations, and billing."
      icon={Settings}
    />
  )
}

export function ProfileSettingsPage() {
  return (
    <PlaceholderPage
      title="Profile"
      description="Your account details and preferences."
      icon={UserCog}
      breadcrumb={[{ label: 'Settings' }, { label: 'Profile' }]}
    />
  )
}
