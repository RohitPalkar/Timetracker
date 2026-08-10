import type { AppNotification } from '@/types/collaboration'
import type {
  BugOwnerStat,
  DashboardAlert,
  DashboardRisk,
  EmployeeHours,
  PlannedVsActualPoint,
  QualityTrendPoint,
  SprintTrendPoint,
  TimesheetOverview,
} from '@/types/dashboard'
import { daysAgo, daysFromNow } from './users'

/** Deterministic pseudo-random generator so analytics series are stable across renders. */
function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648
    return state / 2147483648
  }
}

export const DEMO_TEAMS: Array<{ id: string; name: string; department: string; memberIds: string[] }> = [
  { id: 'team-platform', name: 'Platform', department: 'Engineering', memberIds: ['user-ravi', 'user-rohit', 'user-aditi'] },
  { id: 'team-delivery', name: 'Delivery Core', department: 'Delivery', memberIds: ['user-rohit', 'user-aditi', 'user-arjun'] },
  { id: 'team-qa', name: 'Quality Guild', department: 'Quality', memberIds: ['user-priya', 'user-arjun'] },
  { id: 'team-design', name: 'Design Studio', department: 'Design', memberIds: ['user-sara'] },
  { id: 'team-people', name: 'People Ops', department: 'People', memberIds: ['user-vikram'] },
  { id: 'team-finance', name: 'Finance', department: 'Finance', memberIds: ['user-vikram'] },
]

/** Weekly planned vs actual points, per project key. Scaled by project progress. */
export const DEMO_PLANS_BY_PROJECT: Record<string, PlannedVsActualPoint[]> = (() => {
  const labels = ['W-7', 'W-6', 'W-5', 'W-4', 'W-3', 'W-2', 'W-1', 'W']
  const basePlanned = [22, 26, 30, 34, 38, 42, 46, 50]
  const projects: Array<{ key: string; progress: number }> = [
    { key: 'CORE', progress: 62 },
    { key: 'PORTAL', progress: 41 },
    { key: 'MOBILE', progress: 28 },
    { key: 'DATA', progress: 84 },
    { key: 'OMNI', progress: 55 },
    { key: 'PEOPLE', progress: 100 },
    { key: 'HEALTH', progress: 17 },
  ]
  return Object.fromEntries(
    projects.map((project) => {
      const random = seeded(project.key.length * 97 + project.progress)
      const series = basePlanned.map((planned, index) => {
        const completion = Math.min(1, ((index + 1) / basePlanned.length) * (project.progress / 100) * 1.6)
        const actual = Math.round(planned * completion * (0.82 + random() * 0.28))
        return { label: labels[index], planned, actual: Math.min(planned, actual) }
      })
      return [project.key, series]
    }),
  )
})()

export const DEMO_AGGREGATE_PLANS: PlannedVsActualPoint[] = (() => {
  const keys = Object.keys(DEMO_PLANS_BY_PROJECT)
  const labels = DEMO_PLANS_BY_PROJECT[keys[0]].map((point) => point.label)
  return labels.map((label, index) => {
    const planned = keys.reduce((sum, key) => sum + (DEMO_PLANS_BY_PROJECT[key][index]?.planned ?? 0), 0)
    const actual = keys.reduce((sum, key) => sum + (DEMO_PLANS_BY_PROJECT[key][index]?.actual ?? 0), 0)
    return { label, planned, actual }
  })
})()

export const DEMO_BUG_OWNER_STATS: BugOwnerStat[] = [
  { userId: 'user-rohit', name: 'Rohit Verma', open: 6, critical: 2, resolved: 14, total: 20, trend: -12 },
  { userId: 'user-arjun', name: 'Arjun Mehta', open: 4, critical: 1, resolved: 17, total: 21, trend: 8 },
  { userId: 'user-aditi', name: 'Aditi Sharma', open: 5, critical: 0, resolved: 11, total: 16, trend: -5 },
  { userId: 'user-priya', name: 'Priya Nair', open: 3, critical: 1, resolved: 19, total: 22, trend: -20 },
  { userId: 'user-ravi', name: 'Ravi Sharma', open: 2, critical: 0, resolved: 12, total: 14, trend: 4 },
  { userId: 'user-sara', name: 'Sara Khan', open: 1, critical: 0, resolved: 8, total: 9, trend: 0 },
]

export const DEMO_EMPLOYEE_HOURS: EmployeeHours[] = [
  { userId: 'user-rohit', name: 'Rohit Verma', department: 'Delivery', hours: 142, billable: 128, utilization: 91 },
  { userId: 'user-arjun', name: 'Arjun Mehta', department: 'Engineering', hours: 136, billable: 131, utilization: 88 },
  { userId: 'user-aditi', name: 'Aditi Sharma', department: 'Delivery', hours: 118, billable: 102, utilization: 76 },
  { userId: 'user-ravi', name: 'Ravi Sharma', department: 'Engineering', hours: 126, billable: 119, utilization: 82 },
  { userId: 'user-priya', name: 'Priya Nair', department: 'Quality', hours: 108, billable: 96, utilization: 69 },
  { userId: 'user-sara', name: 'Sara Khan', department: 'Design', hours: 94, billable: 84, utilization: 74 },
  { userId: 'user-vikram', name: 'Vikram Singh', department: 'People', hours: 62, billable: 22, utilization: 42 },
]

export const DEMO_SPRINT_TREND: SprintTrendPoint[] = [
  { label: 'Sprint 12', planned: 36, completed: 36, capacityHours: 300, hoursLogged: 288 },
  { label: 'Sprint 13', planned: 42, completed: 42, capacityHours: 310, hoursLogged: 296 },
  { label: 'Sprint 14', planned: 44, completed: 38, capacityHours: 320, hoursLogged: 214 },
  { label: 'Sprint 15', planned: 46, completed: 40, capacityHours: 330, hoursLogged: 158 },
]

export const DEMO_TIMESHEET_OVERVIEW: TimesheetOverview = {
  submitted: 34,
  approved: 27,
  pending: 7,
  rejected: 2,
  totalHours: 786,
  billableHours: 682,
  utilization: 82,
  completionRate: 91,
}

export const DEMO_QUALITY_TREND: QualityTrendPoint[] = [
  { label: 'W-7', created: 12, resolved: 10, criticalOpen: 4 },
  { label: 'W-6', created: 15, resolved: 13, criticalOpen: 5 },
  { label: 'W-5', created: 11, resolved: 12, criticalOpen: 3 },
  { label: 'W-4', created: 18, resolved: 15, criticalOpen: 6 },
  { label: 'W-3', created: 14, resolved: 16, criticalOpen: 4 },
  { label: 'W-2', created: 16, resolved: 14, criticalOpen: 5 },
  { label: 'W-1', created: 13, resolved: 15, criticalOpen: 3 },
  { label: 'W', created: 9, resolved: 11, criticalOpen: 2 },
]

export const DEMO_RISKS: DashboardRisk[] = [
  {
    id: 'risk-1',
    projectId: 'prj-portal',
    projectName: 'Acme Customer Portal',
    title: 'Billing API dependency slips a week',
    severity: 'high',
    status: 'monitoring',
    ownerName: 'Aditi Sharma',
  },
  {
    id: 'risk-2',
    projectId: 'prj-mobile',
    projectName: 'Mobile Banking App',
    title: 'Device matrix coverage below target',
    severity: 'critical',
    status: 'open',
    ownerName: 'Priya Nair',
  },
  {
    id: 'risk-3',
    projectId: 'prj-core',
    projectName: 'MyTracker Core Platform',
    title: 'Capacity under-load on Platform team',
    severity: 'medium',
    status: 'monitoring',
    ownerName: 'Rohit Verma',
  },
  {
    id: 'risk-4',
    projectId: 'prj-health',
    projectName: 'CareConnect Patient Portal',
    title: 'Compliance review may extend discovery',
    severity: 'high',
    status: 'open',
    ownerName: 'Vikram Singh',
  },
  {
    id: 'risk-5',
    projectId: 'prj-data',
    projectName: 'Analytics Platform',
    title: 'Warehouse upgrade introduces downtime',
    severity: 'low',
    status: 'mitigated',
    ownerName: 'Arjun Mehta',
  },
]

export const DEMO_ALERTS: DashboardAlert[] = [
  {
    id: 'alert-1',
    type: 'budget',
    severity: 'critical',
    title: 'Portal budget at 65% consumption',
    body: 'Projected overrun by month-end at current burn.',
    createdAt: daysAgo(0.2),
  },
  {
    id: 'alert-2',
    type: 'quality',
    severity: 'warning',
    title: 'Mobile critical bug backlog rising',
    body: '3 critical bugs open across two releases.',
    createdAt: daysAgo(0.6),
  },
  {
    id: 'alert-3',
    type: 'schedule',
    severity: 'warning',
    title: 'Sprint 14 scope confidence below 75%',
    body: '8 points remain uncommitted in the active sprint.',
    createdAt: daysAgo(1.1),
  },
  {
    id: 'alert-4',
    type: 'capacity',
    severity: 'info',
    title: 'Timesheets pending approval',
    body: '7 submissions waiting across 3 teams.',
    createdAt: daysAgo(1.8),
  },
]

export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'ntf-1',
    type: 'mention',
    title: 'Aditi mentioned you',
    body: 'in CORE-104 "Empty state for board columns"',
    read: false,
    createdAt: daysAgo(0.08),
    actionPath: '/planning/board',
    actorId: 'user-aditi',
  },
  {
    id: 'ntf-2',
    type: 'assignment',
    title: 'Assigned CORE-099',
    body: 'Rohit, "Project health scoring" is now assigned to you.',
    read: false,
    createdAt: daysAgo(0.2),
    actionPath: '/planning/backlog',
    actorId: 'user-ravi',
  },
  {
    id: 'ntf-3',
    type: 'approval',
    title: 'Timesheet awaiting approval',
    body: 'Vikram submitted W30 · 40 hours · PORTAL',
    read: false,
    createdAt: daysAgo(1.1),
    actionPath: '/timesheets',
    actorId: 'user-vikram',
  },
  {
    id: 'ntf-4',
    type: 'system',
    title: 'Sprint 14 started',
    body: 'Sprint 14 · Core is now active with 28 points in scope.',
    read: true,
    createdAt: daysAgo(2),
    actionPath: '/planning/sprints',
  },
  {
    id: 'ntf-5',
    type: 'comment',
    title: 'New comment on CORE-102',
    body: 'Arjun: "Sizing looks good, export pipe handles 10k rows."',
    read: true,
    createdAt: daysAgo(3),
    actionPath: '/planning/backlog',
    actorId: 'user-arjun',
  },
]

export const DEMO_VELOCITY = [
  { week: 'W1', completed: 28, planned: 34 },
  { week: 'W2', completed: 32, planned: 30 },
  { week: 'W3', completed: 26, planned: 32 },
  { week: 'W4', completed: 38, planned: 36 },
  { week: 'W5', completed: 42, planned: 38 },
  { week: 'W6', completed: 36, planned: 40 },
  { week: 'W7', completed: 44, planned: 42 },
  { week: 'W8', completed: 40, planned: 44 },
]

export const DEMO_HEALTH = [
  { label: 'On track', value: 62, tone: 'bg-success' },
  { label: 'At risk', value: 26, tone: 'bg-warning' },
  { label: 'Delayed', value: 12, tone: 'bg-danger' },
]

export const DEMO_PROJECT_LIFECYCLE = [
  { month: 'Feb', projects: 3, health: 68 },
  { month: 'Mar', projects: 4, health: 71 },
  { month: 'Apr', projects: 4, health: 64 },
  { month: 'May', projects: 5, health: 74 },
  { month: 'Jun', projects: 5, health: 70 },
  { month: 'Jul', projects: 5, health: 78 },
  { month: 'Aug', projects: 5, health: 76 },
]

export const DEMO_NEXT_RELEASE = {
  name: 'Release 2.4.0',
  date: daysFromNow(6),
  scope: 5,
}