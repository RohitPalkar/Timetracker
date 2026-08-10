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
