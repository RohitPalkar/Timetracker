import type { ProjectHealth, Risk } from '@/types'

/** Personas the dashboard is rendered for. Config-driven — never hardcoded in views. */
export type DashboardPersona = 'super_admin' | 'project_manager' | 'business_analyst' | 'employee' | 'qa'

/** What slice of data a persona's dashboard is scoped to. */
export type DashboardScope = 'organization' | 'managed_projects' | 'assigned_projects' | 'self' | 'qa_scope'

export type DashboardDateRange = '7d' | '30d' | '90d' | 'quarter' | 'year'

export interface DashboardFilters {
  /** 'all' or a project id */
  projectId: string
  /** 'all' or a team id */
  teamId: string
  dateRange: DashboardDateRange
  /** 'all' or a sprint id */
  sprintId: string
}

export type DashboardWidgetId =
  | 'kpi'
  | 'planned-vs-actual'
  | 'top-bug-owners'
  | 'budget-consumption'
  | 'hours-by-employee'
  | 'project-health'
  | 'sprint-trend'
  | 'timesheet-overview'
  | 'quality-trend'
  | 'org-activity'

export interface DashboardWidgetMeta {
  id: DashboardWidgetId
  title: string
  description?: string
  section: 'core' | 'additional' | 'activity'
  size: 'full' | 'half' | 'third'
}

export interface DashboardPersonaConfig {
  persona: DashboardPersona
  label: string
  title: string
  description: string
  scope: DashboardScope
  /** Which global filters this persona may use. */
  filters: {
    project: boolean
    team: boolean
    dateRange: boolean
    sprint: boolean
  }
  widgets: DashboardWidgetId[]
}

/* ------------------------------------------------------------------ */
/*  Analytics payload shapes                                           */
/* ------------------------------------------------------------------ */

export interface DashboardKpi {
  id: string
  label: string
  value: string | number
  trend?: number
  trendLabel?: string
  hint?: string
}

export interface PlannedVsActualPoint {
  label: string
  planned: number
  actual: number
}

export interface BugOwnerStat {
  userId: string
  name: string
  open: number
  critical: number
  resolved: number
  total: number
  trend?: number
}

export interface BudgetConsumption {
  projectId: string
  name: string
  key: string
  budget: number
  spent: number
  consumedPercent: number
  health: ProjectHealth
}

export interface EmployeeHours {
  userId: string
  name: string
  department: string
  hours: number
  billable: number
  utilization: number
}

export interface ProjectHealthSummary {
  label: string
  value: number
  tone: 'success' | 'info' | 'warning' | 'danger'
}

export interface SprintTrendPoint {
  label: string
  planned: number
  completed: number
  capacityHours: number
  hoursLogged: number
}

export interface TimesheetOverview {
  submitted: number
  approved: number
  pending: number
  rejected: number
  totalHours: number
  billableHours: number
  utilization: number
  completionRate: number
}

export interface QualityTrendPoint {
  label: string
  created: number
  resolved: number
  criticalOpen: number
}

export interface DashboardRisk {
  id: string
  projectId: string
  projectName: string
  title: string
  severity: Risk['severity']
  status: Risk['status']
  ownerName?: string
}

export interface DashboardAlert {
  id: string
  type: 'risk' | 'budget' | 'schedule' | 'quality' | 'capacity'
  severity: 'info' | 'warning' | 'critical'
  title: string
  body?: string
  createdAt: string
}

export interface DashboardActivityItem {
  id: string
  actorName: string
  action: string
  target: string
  projectName: string
  createdAt: string
}

export interface DashboardPayload {
  generatedAt: string
  kpis: DashboardKpi[]
  plannedVsActual: PlannedVsActualPoint[]
  bugOwners: BugOwnerStat[]
  budget: BudgetConsumption[]
  employeeHours: EmployeeHours[]
  projectHealth: ProjectHealthSummary[]
  sprintTrend: SprintTrendPoint[]
  timesheet: TimesheetOverview
  qualityTrend: QualityTrendPoint[]
  risks: DashboardRisk[]
  alerts: DashboardAlert[]
  activity: DashboardActivityItem[]
}

export interface DashboardFilterOptions {
  projects: Array<{ id: string; name: string; key: string }>
  teams: Array<{ id: string; name: string; memberCount: number }>
  sprints: Array<{ id: string; name: string; projectId: string; status: string }>
}
