export type RoleKey =
  | 'super_admin'
  | 'org_admin'
  | 'project_manager'
  | 'delivery_manager'
  | 'team_lead'
  | 'employee'
  | 'hr'
  | 'finance'

export type PermissionKey =
  | 'dashboard.view'
  | 'workspace.view'
  | 'projects.view'
  | 'projects.create'
  | 'projects.edit'
  | 'projects.archive'
  | 'workspace.manage'
  | 'stories.view'
  | 'stories.create'
  | 'stories.edit'
  | 'stories.assign'
  | 'bugs.view'
  | 'bugs.create'
  | 'bugs.edit'
  | 'timesheets.view_own'
  | 'timesheets.view_all'
  | 'timesheets.submit'
  | 'timesheets.approve'
  | 'reports.view'
  | 'reports.export'
  | 'users.view'
  | 'users.manage'
  | 'roles.manage'
  | 'settings.view'
  | 'settings.manage'
  | 'admin.all'

export interface Permission {
  key: PermissionKey
  label: string
  module: string
  description?: string
}

export interface Role {
  id: string
  key: RoleKey
  name: string
  description: string
  permissions: PermissionKey[]
  isSystem?: boolean
}