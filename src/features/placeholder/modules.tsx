import { FolderKanban, Bug, Megaphone, ListTodo, Layers, Users as UsersIcon } from 'lucide-react'
import { PlaceholderPage } from '@/features/placeholder/placeholder-page'

export function ProjectsPage() {
  return (
    <PlaceholderPage
      title="Projects"
      description="Create, manage, and health-score delivery projects."
      icon={FolderKanban}
    />
  )
}

export function PeoplePage() {
  return (
    <PlaceholderPage
      title="People"
      description="Directory, availability, and capacity across the organization."
      icon={UsersIcon}
    />
  )
}

export function TimesheetsPage() {
  return (
    <PlaceholderPage
      title="Timesheets"
      description="Weekly timesheets, approvals, and summaries."
      icon={ListTodo}
    />
  )
}

export function ReportsPage() {
  return (
    <PlaceholderPage
      title="Reports"
      description="Sprint, budget, and delivery analytics."
      icon={Bug}
    />
  )
}

export function WorkspaceBoardPage() {
  return (
    <PlaceholderPage
      title="Board"
      description="Kanban board for the active sprint."
      icon={Layers}
      breadcrumb={[{ label: 'Workspace' }, { label: 'Board' }]}
    />
  )
}

export function WorkspaceBacklogPage() {
  return (
    <PlaceholderPage
      title="Backlog"
      description="Prioritize and refine the product backlog."
      icon={ListTodo}
      breadcrumb={[{ label: 'Workspace' }, { label: 'Backlog' }]}
    />
  )
}

export function WorkspaceSprintsPage() {
  return (
    <PlaceholderPage
      title="Sprints"
      description="Plan, start, and close sprints."
      icon={Layers}
      breadcrumb={[{ label: 'Workspace' }, { label: 'Sprints' }]}
    />
  )
}

export function WorkspaceEpicsPage() {
  return (
    <PlaceholderPage
      title="Epics"
      description="Group stories into large bodies of work."
      icon={FolderKanban}
      breadcrumb={[{ label: 'Workspace' }, { label: 'Epics' }]}
    />
  )
}

export function WorkspaceReleasesPage() {
  return (
    <PlaceholderPage
      title="Releases"
      description="Plan releases and version tags."
      icon={Megaphone}
      breadcrumb={[{ label: 'Workspace' }, { label: 'Releases' }]}
    />
  )
}

export function AdminUsersPage() {
  return (
    <PlaceholderPage
      title="Users"
      description="Manage user accounts and access."
      icon={UsersIcon}
      breadcrumb={[{ label: 'Administration' }, { label: 'Users' }]}
    />
  )
}

export function AdminRolesPage() {
  return (
    <PlaceholderPage
      title="Roles & Permissions"
      description="Define roles and permission policies."
      icon={Bug}
      breadcrumb={[{ label: 'Administration' }, { label: 'Roles' }]}
    />
  )
}

export function AdminDesignationsPage() {
  return (
    <PlaceholderPage
      title="Designations"
      description="Manage job designations and reporting lines."
      icon={FolderKanban}
      breadcrumb={[{ label: 'Administration' }, { label: 'Designations' }]}
    />
  )
}

export function SettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Workspace preferences, integrations, and billing."
      icon={Layers}
    />
  )
}

export function ProfileSettingsPage() {
  return (
    <PlaceholderPage
      title="Profile"
      description="Your account details and preferences."
      icon={UsersIcon}
      breadcrumb={[{ label: 'Settings' }, { label: 'Profile' }]}
    />
  )
}