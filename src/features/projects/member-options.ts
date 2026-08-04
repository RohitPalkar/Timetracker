import type { ProjectMemberRole } from '@/types'

export const PROJECT_ROLE_OPTIONS: Array<{ value: ProjectMemberRole; label: string }> = [
  { value: 'owner', label: 'Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'lead', label: 'Tech lead' },
  { value: 'developer', label: 'Developer' },
  { value: 'qa', label: 'QA' },
  { value: 'designer', label: 'Designer' },
  { value: 'business_analyst', label: 'Business analyst' },
  { value: 'consultant', label: 'Consultant' },
]

export const roleLabel = (role: ProjectMemberRole): string =>
  PROJECT_ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role

/** Roles that cannot be removed via the team panel (ownership semantics). */
export const FIXED_ROLES: ProjectMemberRole[] = ['manager', 'business_analyst']
