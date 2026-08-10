import type {
  DashboardDateRange,
  DashboardPersona,
  DashboardPersonaConfig,
  DashboardWidgetId,
  DashboardWidgetMeta,
} from '@/types/dashboard'

/**
 * Central dashboard configuration — the single source of truth for what each
 * persona sees. Views read from here; they never hardcode role checks.
 */
export const DASHBOARD_WIDGETS: Record<DashboardWidgetId, DashboardWidgetMeta> = {
  kpi: { id: 'kpi', title: 'Organization overview', section: 'core', size: 'full' },
  'planned-vs-actual': { id: 'planned-vs-actual', title: 'Planned vs Actual Progress', description: 'Committed points vs points delivered per window', section: 'core', size: 'half' },
  'top-bug-owners': { id: 'top-bug-owners', title: 'Top Bug Owners', description: 'Open, critical and resolved bugs by assignee', section: 'core', size: 'half' },
  'budget-consumption': { id: 'budget-consumption', title: 'Budget vs Consumed', description: 'Budget utilization per project', section: 'core', size: 'half' },
  'hours-by-employee': { id: 'hours-by-employee', title: 'Hours by Employee', description: 'Logged vs billable hours this period', section: 'core', size: 'half' },
  'project-health': { id: 'project-health', title: 'Project Health', description: 'Distribution of project health statuses', section: 'additional', size: 'third' },
  'sprint-trend': { id: 'sprint-trend', title: 'Sprint / Delivery Trend', description: 'Planned vs completed points across sprints', section: 'additional', size: 'third' },
  'timesheet-overview': { id: 'timesheet-overview', title: 'Timesheet Overview', description: 'Submission health and utilization', section: 'additional', size: 'third' },
  'quality-trend': { id: 'quality-trend', title: 'Quality / Bug Trend', description: 'Bugs created, resolved and critical backlog', section: 'additional', size: 'full' },
  'org-activity': { id: 'org-activity', title: 'Organization Activity', description: 'Risks, alerts and recent activity', section: 'activity', size: 'full' },
}

export const DASHBOARD_PERSONAS: Record<DashboardPersona, DashboardPersonaConfig> = {
  super_admin: {
    persona: 'super_admin',
    label: 'Super Admin',
    title: 'Organization Dashboard',
    description: 'Company-wide delivery, quality and cost health.',
    scope: 'organization',
    filters: { project: true, team: true, dateRange: true, sprint: true },
    widgets: [
      'kpi',
      'planned-vs-actual',
      'top-bug-owners',
      'budget-consumption',
      'hours-by-employee',
      'project-health',
      'sprint-trend',
      'timesheet-overview',
      'quality-trend',
      'org-activity',
    ],
  },
  project_manager: {
    persona: 'project_manager',
    label: 'Project Manager',
    title: 'Delivery Dashboard',
    description: 'Progress and health across the projects you manage.',
    scope: 'managed_projects',
    filters: { project: true, team: false, dateRange: true, sprint: true },
    widgets: ['kpi', 'planned-vs-actual', 'budget-consumption', 'project-health', 'sprint-trend', 'timesheet-overview', 'org-activity'],
  },
  business_analyst: {
    persona: 'business_analyst',
    label: 'Business Analyst',
    title: 'Requirements Dashboard',
    description: 'Backlog health, scope and requirements delivery.',
    scope: 'assigned_projects',
    filters: { project: true, team: false, dateRange: true, sprint: true },
    widgets: ['kpi', 'planned-vs-actual', 'quality-trend', 'project-health', 'org-activity'],
  },
  employee: {
    persona: 'employee',
    label: 'Employee',
    title: 'My Dashboard',
    description: 'Your work, hours and capacity at a glance.',
    scope: 'self',
    filters: { project: false, team: false, dateRange: true, sprint: true },
    widgets: ['kpi', 'planned-vs-actual', 'hours-by-employee', 'timesheet-overview', 'org-activity'],
  },
  qa: {
    persona: 'qa',
    label: 'QA',
    title: 'Quality Dashboard',
    description: 'Bugs, verification queues and quality signals.',
    scope: 'qa_scope',
    filters: { project: true, team: false, dateRange: true, sprint: true },
    widgets: ['kpi', 'top-bug-owners', 'quality-trend', 'project-health', 'org-activity'],
  },
}

/** Role → persona mapping. Defaults to employee when a role has no dashboard persona. */
const PERSONA_BY_ROLE: Record<string, DashboardPersona> = {
  'role-org_admin': 'super_admin',
  'role-delivery_manager': 'project_manager',
  'role-delivery': 'project_manager',
  'role-project_manager': 'project_manager',
  'role-business_analyst': 'business_analyst',
  'role-team_lead': 'qa',
  'role-employee': 'employee',
}

export function personaForRole(roleId?: string): DashboardPersona {
  if (!roleId) return 'super_admin'
  return PERSONA_BY_ROLE[roleId] ?? 'employee'
}

export function getDashboardConfig(persona: DashboardPersona): DashboardPersonaConfig {
  return DASHBOARD_PERSONAS[persona]
}

export const DEFAULT_DATE_RANGE: DashboardDateRange = '90d'

export const DATE_RANGE_OPTIONS: Array<{ value: DashboardDateRange; label: string }> = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'quarter', label: 'This quarter' },
  { value: 'year', label: 'Year to date' },
]
