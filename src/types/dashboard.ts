import type { ProjectHealth, Risk } from '@/types'

/** Personas the dashboard is rendered for. Config-driven — never hardcoded in views. */
export type DashboardPersona =
  | 'super_admin'
  | 'project_manager'
  | 'business_analyst'
  | 'employee'
  | 'qa'
  | 'hr_admin'
  | 'finance'
  | 'department_head'

/** What slice of data a persona's dashboard is scoped to. */
export type DashboardScope = 'organization' | 'managed_projects' | 'assigned_projects' | 'self' | 'qa_scope' | 'hr_scope' | 'finance_scope'

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
  // New workforce + operations groups (spec §4)
  | 'action-center'
  | 'my-hrms'
  | 'my-timesheet'
  | 'my-work'
  | 'my-team'
  | 'management-ops'

export interface DashboardWidgetMeta {
  id: DashboardWidgetId
  title: string
  description?: string
  section: 'core' | 'additional' | 'activity' | 'attention' | 'hrms' | 'timesheet' | 'work' | 'team' | 'management'
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

/* ------------------------------------------------------------------ */
/*  Workforce / HRMS + Work + Team payloads (spec §7-15)             */
/* ------------------------------------------------------------------ */

export type AttendanceStatus = 'not_checked_in' | 'present' | 'checked_out' | 'absent' | 'on_leave' | 'holiday' | 'exception'

export interface MyAttendance {
  status: AttendanceStatus
  checkIn?: string
  checkOut?: string
  workingMinutes?: number
  exceptionLabel?: string
}

export interface LeaveBalance {
  type: string
  balance: number
  pending: number
  unit: 'days'
}

export interface LeaveRequestSummary {
  id: string
  type: string
  from: string
  to: string
  days: number
  status: 'pending' | 'approved' | 'rejected'
}

export interface MyLeave {
  balances: LeaveBalance[]
  pending: LeaveRequestSummary[]
  upcoming: LeaveRequestSummary[]
  history: LeaveRequestSummary[]
}

export interface HolidayItem {
  date: string
  name: string
  calendar: string
}

export interface MyDocumentsSummary {
  requiringAttention: number
  expiringSoon: number
  recent: Array<{ id: string; name: string; updatedAt: string }>
}

export interface MyAssetsSummary {
  allocated: number
  items: Array<{ id: string; name: string; type: string; status: string }>
}

export interface MyHRRequestsSummary {
  pending: number
  approved: number
  rejected: number
  items: Array<{ id: string; title: string; status: string; createdAt: string }>
}

export interface MyHRMSPayload {
  attendance: MyAttendance
  leave: MyLeave
  holidays: HolidayItem[]
  documents: MyDocumentsSummary
  assets: MyAssetsSummary
  hrRequests: MyHRRequestsSummary
}

export interface MyTimesheetToday {
  loggedMinutes: number
  targetMinutes?: number
  remainingMinutes?: number
}

export interface MyTimesheetWeek {
  totalMinutes: number
  daily: Array<{ date: string; minutes: number }>
  byProject: Array<{ projectId: string; projectName: string; minutes: number }>
}

export interface ActiveTimer {
  id: string
  projectId: string
  projectName: string
  subProjectId?: string
  subProjectName?: string
  workItemId: string
  workItemKey: string
  activity: string
  startedAt: string
  elapsedMinutes: number
}

export interface MyTimesheetPayload {
  today: MyTimesheetToday
  week: MyTimesheetWeek
  timer: ActiveTimer | null
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'missing'
  entriesCount: number
}

export interface MyWorkItem {
  id: string
  key: string
  title: string
  projectId: string
  projectName: string
  subProjectId?: string
  subProjectName?: string
  sprintId?: string
  sprintName?: string
  status: string
  priority: string
  type: 'story' | 'bug' | 'task'
}

export interface MyWorkPayload {
  stories: MyWorkItem[]
  bugs: MyWorkItem[]
  tasks: MyWorkItem[]
  sprint?: { id: string; name: string; projectName: string; startDate: string; endDate: string; assigned: number; completed: number; remaining: number }
}

export interface TeamMemberSummary {
  id: string
  name: string
  status: AttendanceStatus
  workload: number
}

export interface MyTeamPayload {
  members: TeamMemberSummary[]
  attendance: { present: number; absent: number; onLeave: number; late: number }
  leave: { pending: number; upcoming: number }
  workload: Array<{ userId: string; name: string; assigned: number; completed: number }>
  timesheets: Array<{ userId: string; name: string; hours: number; status: string }>
  approvals: Array<{ id: string; type: string; requester: string; createdAt: string }>
}

export interface ActionCenterItem {
  id: string
  type: 'attendance' | 'timesheet' | 'approval' | 'bug' | 'story' | 'leave' | 'document' | 'onboarding'
  title: string
  description: string
  ctaLabel: string
  href: string
  priority: 'high' | 'medium' | 'low'
  count?: number
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
  // New groups
  actionCenter: ActionCenterItem[]
  myHRMS: MyHRMSPayload
  myTimesheet: MyTimesheetPayload
  myWork: MyWorkPayload
  myTeam: MyTeamPayload | null
  management: {
    portfolio: Array<{ projectId: string; name: string; status: string; progress: number; health: string }>
    sprintHealth: Array<{ sprintId: string; name: string; projectName: string; planned: number; completed: number; remaining: number }>
    peopleOverview?: { total: number; active: number; newJoiners: number; exits: number }
  } | null
}

export interface DashboardFilterOptions {
  projects: Array<{ id: string; name: string; key: string }>
  teams: Array<{ id: string; name: string; memberCount: number }>
  sprints: Array<{ id: string; name: string; projectId: string; status: string }>
}
