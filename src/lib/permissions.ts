import type { PermissionKey, RoleKey } from '@/types/permission'

/**
 * Permission checks are role-agnostic by design.
 * UI components receive the caller's permission set and check keys —
 * never hardcoded role names. Prefer `can('timesheet.approve')` over
 * `role === 'manager'`.
 */

export function hasPermission(
  userPermissions: PermissionKey[],
  permission: PermissionKey | PermissionKey[],
): boolean {
  if (userPermissions.includes('admin.all')) return true
  const list = Array.isArray(permission) ? permission : [permission]
  return list.some((key) => userPermissions.includes(key))
}

export function hasAllPermissions(
  userPermissions: PermissionKey[],
  required: PermissionKey[],
): boolean {
  if (userPermissions.includes('admin.all')) return true
  return required.every((key) => userPermissions.includes(key))
}

export function hasAnyPermission(
  userPermissions: PermissionKey[],
  required: PermissionKey[],
): boolean {
  return hasPermission(userPermissions, required)
}

export function hasRole(userRoles: RoleKey[], role: RoleKey | RoleKey[]): boolean {
  const list = Array.isArray(role) ? role : [role]
  return list.some((r) => userRoles.includes(r))
}

export function hasAnyRole(userRoles: RoleKey[], roles: RoleKey[]): boolean {
  return hasRole(userRoles, roles)
}

export function missingPermissions(
  userPermissions: PermissionKey[],
  required: PermissionKey[],
): PermissionKey[] {
  if (userPermissions.includes('admin.all')) return []
  return required.filter((key) => !userPermissions.includes(key))
}

export const NO_PERMISSIONS: PermissionKey[] = []
export const NO_ROLES: RoleKey[] = []
