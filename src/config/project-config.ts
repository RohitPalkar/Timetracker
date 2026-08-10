import type { DashboardPersona } from '@/types/dashboard'
import type { ProjectScope } from '@/types'

/**
 * Central Projects configuration — the single source of truth for what each
 * persona can see and do on the Projects List. Views consume capabilities and
 * scope from here; they never hardcode role checks. The eventual RBAC matrix
 * will replace this configuration with permission grants that map onto the
 * same capability vocabulary (reusing `PermissionKey` project terms).
 */

export type ProjectCapability =
  | 'projects.view'
  | 'projects.create'
  | 'projects.edit'
  | 'projects.archive'
  | 'projects.delete'
  | 'projects.subprojects.view'
  | 'projects.teams.view'
  | 'planning.view'
  | 'board.view'
  | 'reports.project.view'
  | 'documents.project.view'
  | 'projects.settings'

export type ProjectListColumnId =
  | 'project'
  | 'client'
  | 'manager'
  | 'team'
  | 'status'
  | 'budget'
  | 'progress'
  | 'startDate'
  | 'endDate'
  | 'updatedAt'
  | 'actions'

export type ProjectFilterId =
  | 'status'
  | 'manager'
  | 'client'
  | 'member'
  | 'dateFrom'
  | 'dateTo'

export interface ProjectPersonaConfig {
  persona: DashboardPersona
  label: string
  /** Scope-aware page description. */
  description: string
  scope: ProjectScope
  capabilities: ProjectCapability[]
  /** Filters available to the persona. */
  filters: Record<ProjectFilterId, boolean>
  /** Columns rendered for the persona, in order. */
  columns: ProjectListColumnId[]
}

export const PROJECT_PERSONAS: Record<DashboardPersona, ProjectPersonaConfig> = {
  super_admin: {
    persona: 'super_admin',
    label: 'Super Admin',
    description: 'Manage every delivery project across the organization and open its workspace.',
    scope: 'organization',
    capabilities: [
      'projects.view',
      'projects.create',
      'projects.edit',
      'projects.archive',
      'projects.delete',
      'projects.subprojects.view',
      'projects.teams.view',
      'planning.view',
      'board.view',
      'reports.project.view',
      'documents.project.view',
      'projects.settings',
    ],
    filters: { status: true, manager: true, client: true, member: true, dateFrom: true, dateTo: true },
    columns: ['project', 'client', 'manager', 'team', 'status', 'budget', 'progress', 'startDate', 'endDate', 'updatedAt', 'actions'],
  },
  project_manager: {
    persona: 'project_manager',
    label: 'Project Manager',
    description: 'Projects you manage — open a workspace to drive delivery.',
    scope: 'managed',
    capabilities: [
      'projects.view',
      'projects.create',
      'projects.edit',
      'projects.subprojects.view',
      'projects.teams.view',
      'planning.view',
      'board.view',
      'reports.project.view',
      'documents.project.view',
      'projects.settings',
    ],
    filters: { status: true, manager: false, client: true, member: true, dateFrom: true, dateTo: true },
    columns: ['project', 'manager', 'status', 'budget', 'progress', 'startDate', 'endDate', 'actions'],
  },
  business_analyst: {
    persona: 'business_analyst',
    label: 'Business Analyst',
    description: 'Projects assigned to you for requirements and delivery.',
    scope: 'assigned',
    capabilities: [
      'projects.view',
      'projects.subprojects.view',
      'planning.view',
      'board.view',
      'reports.project.view',
      'documents.project.view',
    ],
    filters: { status: true, manager: false, client: false, member: false, dateFrom: true, dateTo: true },
    columns: ['project', 'manager', 'status', 'startDate', 'endDate', 'actions'],
  },
  employee: {
    persona: 'employee',
    label: 'Employee',
    description: 'Projects you are working on.',
    scope: 'assigned',
    capabilities: ['projects.view', 'planning.view', 'board.view', 'documents.project.view'],
    filters: { status: true, manager: false, client: false, member: false, dateFrom: false, dateTo: false },
    columns: ['project', 'status', 'progress', 'startDate', 'endDate', 'actions'],
  },
  qa: {
    persona: 'qa',
    label: 'QA',
    description: 'Projects assigned to you for quality assurance.',
    scope: 'assigned',
    capabilities: [
      'projects.view',
      'planning.view',
      'board.view',
      'reports.project.view',
      'documents.project.view',
    ],
    filters: { status: true, manager: false, client: false, member: false, dateFrom: false, dateTo: false },
    columns: ['project', 'status', 'startDate', 'endDate', 'actions'],
  },
}

export function getProjectConfig(persona: DashboardPersona): ProjectPersonaConfig {
  return PROJECT_PERSONAS[persona]
}

export function hasProjectCapability(
  config: ProjectPersonaConfig,
  capability: ProjectCapability,
): boolean {
  return config.capabilities.includes(capability)
}

/**
 * Demo-phase actor resolution. The mock session only carries a role id, so each
 * persona is resolved to a representative mock user to make project scope
 * observable (managed/assigned memberships come from the seeded member graph).
 * This is a test mechanism — real auth will supply the actor id directly.
 */
export const DEMO_ACTOR_BY_PERSONA: Record<DashboardPersona, string> = {
  super_admin: 'user-ravi',
  project_manager: 'user-rohit',
  business_analyst: 'user-aditi',
  employee: 'user-sara',
  qa: 'user-priya',
}
