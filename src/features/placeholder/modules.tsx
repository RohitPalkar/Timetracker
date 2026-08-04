import { Bug, FolderKanban, Layers, ListTodo, Users as UsersIcon } from 'lucide-react'
import { PlaceholderPage } from '@/features/placeholder/placeholder-page'

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