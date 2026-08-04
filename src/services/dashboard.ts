/**
 * Dashboard repository — read model composed from the shared mock stores.
 * Returns the exact shape the dashboard page queries.
 */
import type { Story } from '@/types/agile'
import { projectStore, sprintStore, storyStore, bugStore, userStore, projectMemberStore } from './stores'
import { DEMO_HEALTH, DEMO_NEXT_RELEASE, DEMO_VELOCITY } from '@/mocks/data'
import { mockDelay } from './http'

export interface DashboardMetric {
  title: string
  value: string
  trend?: number
  trendLabel?: string
  hint?: string
}

export interface DashboardOverview {
  metrics: DashboardMetric[]
  velocity: Array<{ week: string; completed: number; planned: number }>
  health: Array<{ label: string; value: number; tone: string }>
  nextRelease: { name: string; date: string; scope: number }
  projects: { total: number; active: number; atRisk: number }
  team: { members: number; capacity: number }
  recentStories: Story[]
}

const DAY_MS = 86_400_000

export const dashboardService = {
  async overview(): Promise<DashboardOverview> {
    await mockDelay(450)

    const allStories = storyStore.all()
    const allBugs = bugStore.all()
    const allSprints = sprintStore.all()
    const members = projectMemberStore.all()

    const activeStoryCount = allStories.filter((story) => story.status !== 'done').length
    const openBugCount = allBugs.filter((bug) => !['verified', 'closed'].includes(bug.status)).length

    const weekAgo = Date.now() - 7 * DAY_MS
    const completedThisWeek = allStories.filter(
      (story) => story.status === 'done' && new Date(story.updatedAt).getTime() > weekAgo,
    ).length

    const activeSprint = allSprints.find((sprint) => sprint.status === 'active')
    const sprintProgress =
      activeSprint && activeSprint.capacityHours > 0
        ? Math.round((activeSprint.hoursLogged / activeSprint.capacityHours) * 100)
        : 0

    const projects = projectStore.all()
    const activeProjects = projects.filter((project) => project.status === 'active').length
    const atRisk = projects.filter((project) => ['at_risk', 'critical'].includes(project.health)).length

    const capacity =
      members.length > 0
        ? Math.round(members.reduce((sum, member) => sum + member.capacity, 0) / members.length)
        : 0

    const recentStories = [...allStories]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)

    return {
      metrics: [
        { title: 'Active stories', value: String(activeStoryCount), trend: 12, trendLabel: 'vs last week' },
        { title: 'Open bugs', value: String(openBugCount), trend: -8, trendLabel: 'vs last week' },
        { title: 'Completed this week', value: String(completedThisWeek), trend: 5, trendLabel: 'vs last week' },
        { title: 'Sprint in progress', value: `${sprintProgress}%`, hint: activeSprint?.name ?? 'No active sprint' },
      ],
      velocity: DEMO_VELOCITY,
      health: DEMO_HEALTH,
      nextRelease: DEMO_NEXT_RELEASE,
      projects: { total: projects.length, active: activeProjects, atRisk },
      team: { members: userStore.all().length, capacity },
      recentStories,
    }
  },
}