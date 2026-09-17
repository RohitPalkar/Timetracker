/**
 * Dashboard repository — read model composed from the shared mock stores.
 * `getDashboard` returns the entire dashboard payload in a single request;
 * the aggregate honors the global filters (project, team, date range, sprint).
 */
import type { DashboardPayload, DashboardFilters, DashboardFilterOptions } from '@/types/dashboard'
import type { Project } from '@/types'
import {
  projectStore,
  sprintStore,
  bugStore,
  userStore,
  projectMemberStore,
  timeLogStore,
} from './stores'
import {
  DEMO_AGGREGATE_PLANS,
  DEMO_ALERTS,
  DEMO_BUG_OWNER_STATS,
  DEMO_EMPLOYEE_HOURS,
  DEMO_PLANS_BY_PROJECT,
  DEMO_QUALITY_TREND,
  DEMO_RISKS,
  DEMO_SPRINT_TREND,
  DEMO_TEAMS,
  DEMO_TIMESHEET_OVERVIEW,
} from '@/mocks/data'
import { mockDelay } from './http'

const DAY_MS = 86_400_000

const RANGE_COUNT: Record<DashboardFilters['dateRange'], number> = {
  '7d': 7,
  '30d': 4,
  '90d': 12,
  quarter: 13,
  year: 12,
}

const RANGE_LABELS: Record<DashboardFilters['dateRange'], string> = {
  '7d': 'd',
  '30d': 'w',
  '90d': 'w',
  quarter: 'w',
  year: 'm',
}

export const dashboardService = {
  /** Dropdown options backing the global filters bar. */
  async getFilterOptions(): Promise<DashboardFilterOptions> {
    await mockDelay(250)
    const projects = projectStore
      .all()
      .map((project) => ({ id: project.id, name: project.name, key: project.key }))
    const teams = DEMO_TEAMS.map((team) => ({
      id: team.id,
      name: `${team.department} · ${team.name}`,
      memberCount: team.memberIds.length,
    }))
    const sprints = sprintStore.all().map((sprint) => ({ id: sprint.id, name: sprint.name, projectId: sprint.projectId, status: sprint.status }))
    return { projects, teams, sprints }
  },

  /** Entire dashboard payload for the active scope + filters. */
  async getDashboard(filters: DashboardFilters): Promise<DashboardPayload> {
    await mockDelay(450)

    const projects = projectStore.all()
    const scopedProjects = filterProjects(projects, filters)

    const plannedVsActual = buildPlannedVsActual(filters, scopedProjects)
    const bugOwners = scopedBugOwners(filters)
    const employeeHours = scopedEmployeeHours(filters)
    const sprintTrend = scopedSprintTrend(filters)
    const qualityTrend = sliceSeries(DEMO_QUALITY_TREND, filters.dateRange)

    const utilization = avg(
      projectMemberStore
        .all()
        .map((member) => member.capacity)
        .filter((capacity) => capacity > 0),
    )

    const hoursLogged = timeLogStore
      .all()
      .filter((log) => withinRange(log.date, filters.dateRange))
      .reduce((sum, log) => sum + log.hours, 0)

    return {
      generatedAt: new Date().toISOString(),
      kpis: buildKpis(projects, scopedProjects),
      plannedVsActual,
      bugOwners,
      budget: buildBudget(scopedProjects),
      employeeHours,
      projectHealth: buildProjectHealth(scopedProjects),
      sprintTrend,
      timesheet: {
        ...DEMO_TIMESHEET_OVERVIEW,
        utilization,
        totalHours: hoursLogged || DEMO_TIMESHEET_OVERVIEW.totalHours,
      },
      qualityTrend,
      risks: scopedRisks(filters),
      alerts: DEMO_ALERTS,
      activity: buildActivity(),
      actionCenter: buildActionCenter(scopedProjects, filters),
      myHRMS: buildMyHRMS(),
      myTimesheet: buildMyTimesheet(filters),
      myWork: buildMyWork(),
      myTeam: buildMyTeam(filters),
      management: buildManagement(scopedProjects),
    }
  },
}

/* ------------------------------------------------------------------ */
/*  Aggregation helpers                                                */
/* ------------------------------------------------------------------ */

function filterProjects(projects: Project[], filters: DashboardFilters): Project[] {
  if (filters.projectId === 'all') return projects
  return projects.filter((project) => project.id === filters.projectId)
}

function buildKpis(projects: Project[], scopedProjects: Project[]) {
  const activeCount = scopedProjects.filter((project) => project.status === 'active').length
  const atRiskCount = scopedProjects.filter((project) => ['at_risk', 'critical'].includes(project.health)).length
  const totalEmployees = userStore.all().filter((user) => user.status === 'active').length
  const activeTeams = DEMO_TEAMS.filter((team) => team.memberIds.some((id) => userStore.get(id)?.status === 'active')).length
  const utilization = avg(
    userStore
      .all()
      .filter((user) => user.status === 'active')
      .map((user) => user.utilization),
  )

  return [
    { id: 'projects', label: 'Total projects', value: projects.length, hint: `${activeCount} active` },
    { id: 'active', label: 'Active projects', value: activeCount, trend: 12, trendLabel: 'vs last quarter' },
    { id: 'employees', label: 'Employees', value: totalEmployees, hint: `${atRiskCount} projects at risk` },
    { id: 'teams', label: 'Active teams', value: activeTeams, hint: 'across 5 departments' },
    { id: 'utilization', label: 'Avg utilization', value: `${utilization}%`, trend: 3, trendLabel: 'vs last month' },
  ]
}

function buildBudget(projects: Project[]) {
  return projects.map((project) => {
    const consumedPercent = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0
    return {
      projectId: project.id,
      name: project.name,
      key: project.key,
      budget: project.budget,
      spent: project.spent,
      consumedPercent: Math.min(consumedPercent, 100),
      health: project.health,
    }
  })
}

function buildProjectHealth(projects: Project[]) {
  const countFor = (health: Project['health']) => projects.filter((project) => project.health === health).length
  const total = Math.max(projects.length, 1)
  return [
    { label: 'Healthy', value: Math.round((countFor('healthy') / total) * 100), tone: 'success' as const },
    { label: 'On track', value: Math.round((countFor('on_track') / total) * 100), tone: 'info' as const },
    { label: 'At risk', value: Math.round((countFor('at_risk') / total) * 100), tone: 'warning' as const },
    { label: 'Critical', value: Math.round((countFor('critical') / total) * 100), tone: 'danger' as const },
  ]
}

/** Planned vs actual — uses per-project series when a project is pinned. */
function buildPlannedVsActual(filters: DashboardFilters, scopedProjects: Project[]): DashboardPayload['plannedVsActual'] {
  if (filters.projectId !== 'all') {
    const project = scopedProjects[0]
    const key = project?.key ?? 'CORE'
    return DEMO_PLANS_BY_PROJECT[key] ?? sliceSeries(DEMO_AGGREGATE_PLANS, filters.dateRange)
  }
  return sliceSeries(DEMO_AGGREGATE_PLANS, filters.dateRange)
}

function scopedBugOwners(filters: DashboardFilters): DashboardPayload['bugOwners'] {
  if (filters.teamId === 'all') return DEMO_BUG_OWNER_STATS
  const team = DEMO_TEAMS.find((team) => team.id === filters.teamId)
  if (!team) return DEMO_BUG_OWNER_STATS
  return DEMO_BUG_OWNER_STATS.filter((owner) => team.memberIds.includes(owner.userId))
}

function scopedEmployeeHours(filters: DashboardFilters): DashboardPayload['employeeHours'] {
  if (filters.teamId === 'all') return DEMO_EMPLOYEE_HOURS
  const team = DEMO_TEAMS.find((team) => team.id === filters.teamId)
  if (!team) return DEMO_EMPLOYEE_HOURS
  return DEMO_EMPLOYEE_HOURS.filter((entry) => team.memberIds.includes(entry.userId))
}

function scopedSprintTrend(filters: DashboardFilters): DashboardPayload['sprintTrend'] {
  if (filters.sprintId === 'all') return DEMO_SPRINT_TREND
  const sprint = sprintStore.get(filters.sprintId)
  if (!sprint) return DEMO_SPRINT_TREND
  return [
    {
      label: sprint.name,
      planned: sprint.velocity,
      completed: sprint.status === 'completed' ? sprint.velocity : Math.round(sprint.velocity * 0.8),
      capacityHours: sprint.capacityHours,
      hoursLogged: sprint.hoursLogged,
    },
  ]
}

function scopedRisks(filters: DashboardFilters): DashboardPayload['risks'] {
  if (filters.projectId === 'all') return DEMO_RISKS
  return DEMO_RISKS.filter((risk) => risk.projectId === filters.projectId)
}

function buildActivity(): DashboardPayload['activity'] {
  return bugStore
    .all()
    .map((bug) => {
      const project = projectStore.get(bug.projectId)
      return {
        id: `act-${bug.id}`,
        actorName: userStore.get(bug.assigneeId ?? bug.reporterId)?.name ?? 'System',
        action: 'updated',
        target: bug.key,
        projectName: project?.name ?? 'Unknown project',
        createdAt: bug.updatedAt,
      }
    })
    .concat(
      timeLogStore.all().map((log) => {
        const project = projectStore.all().find((project) =>
          log.entityType === 'story' ? bugStore.get(log.entityId)?.projectId === project.id : false,
        )
        return {
          id: `act-${log.id}`,
          actorName: userStore.get(log.userId)?.name ?? 'System',
          action: 'logged',
          target: `${log.hours}h on ${log.description ?? 'work'}`,
          projectName: project?.name ?? 'Timesheet',
          createdAt: log.updatedAt,
        }
      }),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)
}

/* ------------------------------------------------------------------ */
/*  Date-range helpers                                                 */
/* ------------------------------------------------------------------ */

function withinRange(date: string, range: DashboardFilters['dateRange']): boolean {
  const cutoff = rangeCutoffMs(range)
  return new Date(date).getTime() >= cutoff
}

function rangeCutoffMs(range: DashboardFilters['dateRange']): number {
  switch (range) {
    case '7d':
      return Date.now() - 7 * DAY_MS
    case '30d':
      return Date.now() - 30 * DAY_MS
    case '90d':
      return Date.now() - 90 * DAY_MS
    case 'quarter':
      return Date.now() - 90 * DAY_MS
    case 'year':
      return Date.now() - 365 * DAY_MS
  }
}

/** Resize a weekly series to the selected range window. */
function sliceSeries<T extends { label: string }>(series: T[], range: DashboardFilters['dateRange']): T[] {
  const count = RANGE_COUNT[range]
  if (count >= series.length) return series
  const start = Math.max(0, series.length - count)
  return series.slice(start).map((point, index) => ({
    ...point,
    label: `${index + 1}${RANGE_LABELS[range]}`,
  }))
}

function avg(values: number[]): number {
  if (values.length === 0) return 0
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function buildMyHRMS(): import('@/types/dashboard').MyHRMSPayload {
  const today = new Date()
  const isHoliday = today.getDay() === 0
  return {
    attendance: {
      status: isHoliday ? 'holiday' : 'present',
      checkIn: isHoliday ? undefined : '09:32',
      checkOut: undefined,
      workingMinutes: isHoliday ? undefined : 272,
      exceptionLabel: undefined,
    },
    leave: {
      balances: [
        { type: 'Casual', balance: 7, pending: 1, unit: 'days' },
        { type: 'Sick', balance: 5, pending: 0, unit: 'days' },
        { type: 'Earned', balance: 12, pending: 0, unit: 'days' },
        { type: 'WFH', balance: 3, pending: 1, unit: 'days' },
      ],
      pending: [{ id: 'lr-1', type: 'Casual', from: new Date(Date.now() + 2 * DAY_MS).toISOString().slice(0, 10), to: new Date(Date.now() + 3 * DAY_MS).toISOString().slice(0, 10), days: 2, status: 'pending' }],
      upcoming: [{ id: 'lr-2', type: 'Earned', from: new Date(Date.now() + 10 * DAY_MS).toISOString().slice(0, 10), to: new Date(Date.now() + 12 * DAY_MS).toISOString().slice(0, 10), days: 3, status: 'approved' }],
      history: [{ id: 'lr-3', type: 'Sick', from: new Date(Date.now() - 20 * DAY_MS).toISOString().slice(0, 10), to: new Date(Date.now() - 19 * DAY_MS).toISOString().slice(0, 10), days: 1, status: 'approved' }],
    },
    holidays: [
      { date: new Date(Date.now() + 5 * DAY_MS).toISOString().slice(0, 10), name: 'Dussehra', calendar: 'India - Maharashtra' },
      { date: new Date(Date.now() + 18 * DAY_MS).toISOString().slice(0, 10), name: 'Diwali', calendar: 'India - Maharashtra' },
      { date: new Date(Date.now() + 42 * DAY_MS).toISOString().slice(0, 10), name: 'Christmas', calendar: 'India - Karnataka' },
    ],
    documents: {
      requiringAttention: 2,
      expiringSoon: 1,
      recent: [
        { id: 'doc-hr-1', name: 'Employment Contract', updatedAt: new Date(Date.now() - 2 * DAY_MS).toISOString() },
        { id: 'doc-hr-2', name: 'Salary Slip - Aug', updatedAt: new Date(Date.now() - 10 * DAY_MS).toISOString() },
      ],
    },
    assets: {
      allocated: 3,
      items: [
        { id: 'as-1', name: 'MacBook Pro 14"', type: 'Laptop', status: 'In Use' },
        { id: 'as-2', name: 'Access Card', type: 'Card', status: 'Active' },
        { id: 'as-3', name: 'Monitor', type: 'Monitor', status: 'Allocated' },
      ],
    },
    hrRequests: {
      pending: 1,
      approved: 4,
      rejected: 0,
      items: [{ id: 'hrq-1', title: 'Address update', status: 'pending', createdAt: new Date(Date.now() - 1 * DAY_MS).toISOString() }],
    },
  }
}

function buildMyTimesheet(filters: DashboardFilters): import('@/types/dashboard').MyTimesheetPayload {
  const daily = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(Date.now() - (6 - i) * DAY_MS).toISOString().slice(0, 10)
    const minutes = [0, 480, 450, 510, 420, 480, 60][i] ?? 0
    return { date, minutes }
  })
  const totalMinutes = daily.reduce((a, b) => a + b.minutes, 0)
  const todayMinutes = daily[daily.length - 1]?.minutes ?? 0
  return {
    today: { loggedMinutes: todayMinutes, targetMinutes: 480, remainingMinutes: Math.max(0, 480 - todayMinutes) },
    week: {
      totalMinutes,
      daily,
      byProject: [
        { projectId: 'prj-core', projectName: 'Core Platform', minutes: 960 },
        { projectId: 'prj-utec', projectName: 'UTEC', minutes: 720 },
      ],
    },
    timer:
      filters.sprintId !== 'all'
        ? null
        : {
            id: 'timer-1',
            projectId: 'prj-utec',
            projectName: 'UTEC',
            subProjectId: 'sprj-efa',
            subProjectName: 'EFA',
            workItemId: 'st-101',
            workItemKey: 'EFA-142',
            activity: 'Development',
            startedAt: new Date(Date.now() - 37 * 60_000).toISOString(),
            elapsedMinutes: 37,
          },
    status: totalMinutes < 120 ? 'missing' : 'draft',
    entriesCount: 12,
  }
}

function buildMyWork(): import('@/types/dashboard').MyWorkPayload {
  const stories = [
    { id: 'st-101', key: 'EFA-142', title: 'Implement timesheet approval workflow', projectId: 'prj-utec', projectName: 'UTEC', subProjectId: 'sprj-efa', subProjectName: 'EFA', sprintId: 'spr-efa-16', sprintName: 'Sprint 16', status: 'in_progress', priority: 'high', type: 'story' as const },
    { id: 'st-102', key: 'EFA-143', title: 'Holiday calendar per location', projectId: 'prj-utec', projectName: 'UTEC', subProjectId: 'sprj-efa', subProjectName: 'EFA', sprintId: 'spr-efa-16', sprintName: 'Sprint 16', status: 'todo', priority: 'medium', type: 'story' as const },
  ]
  const bugs = [
    { id: 'bug-11', key: 'EFA-142-B01', title: 'Timer drift on mobile Safari', projectId: 'prj-utec', projectName: 'UTEC', subProjectId: 'sprj-efa', subProjectName: 'EFA', status: 'open', priority: 'critical', type: 'bug' as const },
  ]
  const tasks = [
    { id: 'task-1', key: 'EFA-142-T1', title: 'Write QA handoff notes', projectId: 'prj-utec', projectName: 'UTEC', subProjectId: 'sprj-efa', subProjectName: 'EFA', sprintId: 'spr-efa-16', sprintName: 'Sprint 16', status: 'todo', priority: 'medium', type: 'task' as const },
  ]
  return {
    stories,
    bugs,
    tasks,
    sprint: { id: 'spr-efa-16', name: 'Sprint 16', projectName: 'UTEC / EFA', startDate: new Date(Date.now() - 3 * DAY_MS).toISOString(), endDate: new Date(Date.now() + 11 * DAY_MS).toISOString(), assigned: 8, completed: 3, remaining: 5 },
  }
}

function buildMyTeam(_filters: DashboardFilters): import('@/types/dashboard').MyTeamPayload {
  return {
    members: [
      { id: 'user-kiran', name: 'Kiran Joshi', status: 'present', workload: 6 },
      { id: 'user-neha', name: 'Neha Gupta', status: 'present', workload: 4 },
      { id: 'user-lakshmi', name: 'Lakshmi Iyer', status: 'on_leave', workload: 0 },
      { id: 'user-amit', name: 'Amit Verma', status: 'present', workload: 7 },
    ],
    attendance: { present: 3, absent: 0, onLeave: 1, late: 1 },
    leave: { pending: 2, upcoming: 1 },
    workload: [
      { userId: 'user-kiran', name: 'Kiran Joshi', assigned: 6, completed: 2 },
      { userId: 'user-neha', name: 'Neha Gupta', assigned: 4, completed: 3 },
      { userId: 'user-amit', name: 'Amit Verma', assigned: 7, completed: 1 },
    ],
    timesheets: [
      { userId: 'user-kiran', name: 'Kiran Joshi', hours: 38, status: 'submitted' },
      { userId: 'user-neha', name: 'Neha Gupta', hours: 36, status: 'draft' },
    ],
    approvals: [
      { id: 'ap-1', type: 'Leave', requester: 'Kiran Joshi', createdAt: new Date(Date.now() - 2 * 60_60_000).toISOString() },
      { id: 'ap-2', type: 'Timesheet', requester: 'Neha Gupta', createdAt: new Date(Date.now() - 5 * 60_60_000).toISOString() },
    ],
  }
}

function buildManagement(scopedProjects: Project[]): import('@/types/dashboard').DashboardPayload['management'] {
  return {
    portfolio: scopedProjects.slice(0, 5).map((p) => ({ projectId: p.id, name: p.name, status: p.status, progress: p.progress, health: p.health })),
    sprintHealth: [
      { sprintId: 'spr-efa-16', name: 'Sprint 16', projectName: 'UTEC / EFA', planned: 42, completed: 18, remaining: 24 },
      { sprintId: 'spr-utlite-9', name: 'Sprint 9', projectName: 'UTEC / UTLITE', planned: 34, completed: 28, remaining: 6 },
    ],
    peopleOverview: { total: 13, active: 11, newJoiners: 2, exits: 0 },
  }
}

function buildActionCenter(scopedProjects: Project[], _filters: DashboardFilters): import('@/types/dashboard').ActionCenterItem[] {
  const items: import('@/types/dashboard').ActionCenterItem[] = [
    { id: 'ac-1', type: 'attendance', title: 'Check-in required', description: 'You are marked present since 09:32 — working 4h 32m', ctaLabel: 'View attendance', href: '/dashboard', priority: 'medium' },
    { id: 'ac-2', type: 'timesheet', title: 'Timesheet missing', description: 'Weekly timesheet draft — 12 entries • 38.5h', ctaLabel: 'Open My Timesheet', href: '/timesheets/my', priority: 'high' },
    { id: 'ac-3', type: 'approval', title: '2 approvals pending', description: 'Leave + Timesheet require your review', ctaLabel: 'View approvals', href: '/timesheets/approvals', priority: 'high', count: 2 },
    { id: 'ac-4', type: 'bug', title: 'EFA-142-B01 assigned to you', description: 'Critical • Open • UTEC / EFA', ctaLabel: 'Open bug', href: '/projects/prj-utec', priority: 'high' },
    { id: 'ac-5', type: 'story', title: '2 stories in progress', description: 'EFA-142, EFA-143 — Sprint 16', ctaLabel: 'Open My Work', href: '/projects/prj-utec', priority: 'medium' },
    { id: 'ac-6', type: 'document', title: '2 documents need attention', description: 'Employment Contract • Salary Slip', ctaLabel: 'Open Documents', href: '/documents', priority: 'low' },
  ]
  if (scopedProjects.some((p) => p.health === 'at_risk')) {
    items.push({ id: 'ac-7', type: 'approval', title: 'Project at risk', description: scopedProjects.find((p) => p.health === 'at_risk')?.name ?? 'Project', ctaLabel: 'View project', href: '/projects', priority: 'high' })
  }
  return items.slice(0, 6)
}
