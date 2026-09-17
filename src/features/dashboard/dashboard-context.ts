/**
 * Dashboard context resolver — capability-driven, no persona selector.
 * Derives the effective dashboard scope from Feature 01 auth (roles/permissions)
 * rather than a manual persona store. Keeps persona helpers for backward compat
 * but they are NOT the source of truth.
 */
import type { PermissionKey, RoleKey } from '@/types/permission'
import type { DashboardPersona } from '@/types/dashboard'
import { personaForRole } from '@/config/dashboard-config'

export type DashboardScope =
  | 'personal' // employee
  | 'team' // team lead
  | 'portfolio' // manager / PM
  | 'workforce' // hr
  | 'organization' // executive / super_admin

export interface DashboardContext {
  scope: DashboardScope
  persona: DashboardPersona // derived for config reuse
  isSuperAdmin: boolean
  isExecutive: boolean
  isHR: boolean
  isManager: boolean
  isTeamLead: boolean
  /** Human label for header/context */
  label: string
}

/**
 * Resolve dashboard context from Feature 01 auth.
 * Priority: super_admin > executive > hr > manager/PM > team_lead > personal
 */
export function resolveDashboardContext(params: {
  roles: RoleKey[]
  permissions: PermissionKey[]
  legacyRoleId?: string
}): DashboardContext {
  const { roles, permissions, legacyRoleId } = params
  const isSuperAdmin = roles.includes('super_admin') || roles.includes('org_admin') || permissions.includes('admin.all')
  const isExecutive = roles.includes('executive')
  const isHR = roles.includes('hr_admin') || roles.includes('hr_manager') || roles.includes('hr') || permissions.includes('hr.view')
  const isManager = roles.includes('project_manager') || roles.includes('delivery_manager')
  const isTeamLead = roles.includes('team_lead')

  let scope: DashboardScope = 'personal'
  let label = 'My Dashboard'

  if (isSuperAdmin || isExecutive) {
    scope = 'organization'
    label = 'Organization'
  } else if (isHR) {
    scope = 'workforce'
    label = 'Workforce'
  } else if (isManager) {
    scope = 'portfolio'
    label = 'Delivery'
  } else if (isTeamLead) {
    scope = 'team'
    label = 'Team Work'
  } else {
    scope = 'personal'
    label = 'My Work'
  }

  // Derive persona for config-driven widget filtering while not using store
  const derivedPersona = personaForRole(legacyRoleId ?? (isSuperAdmin ? 'role-super_admin' : isManager ? 'role-project_manager' : isHR ? 'role-hr' : isTeamLead ? 'role-team_lead' : 'role-employee'))

  // Map scope to persona if mismatched (keep persona aligned)
  let persona: DashboardPersona = derivedPersona
  if (isSuperAdmin) persona = 'super_admin'
  else if (isHR) persona = 'hr_admin'
  else if (isManager) persona = 'project_manager'
  else if (isTeamLead) persona = 'qa'

  return {
    scope,
    persona,
    isSuperAdmin,
    isExecutive,
    isHR,
    isManager,
    isTeamLead,
    label,
  }
}
