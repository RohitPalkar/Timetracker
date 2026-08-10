/**
 * Shared in-memory store registry.
 * Repositories seed from `src/mocks/data` here so reads compose reliably
 * (e.g. dashboard aggregates across projects, stories, sprints, bugs).
 */
import type { Milestone, Organization, Project, ProjectActivity, ProjectMember, ProjectMemberRole, ProjectMembership, SubProject, Team, User } from '@/types'
import type { AppNotification } from '@/types/collaboration'
import type { Bug, Epic, Sprint, Story } from '@/types/agile'
import type { Release, TimeLog } from '@/types/planning'
import { createMockStore } from './mock-store'
import {
  DEMO_BUGS,
  DEMO_EPICS,
  DEMO_MILESTONES,
  DEMO_NOTIFICATIONS,
  DEMO_ORGANIZATION,
  DEMO_PROJECTS,
  DEMO_PROJECT_MEMBERSHIPS,
  DEMO_PROJECT_ACTIVITY,
  DEMO_PROJECT_TEAMS,
  DEMO_RELEASES,
  DEMO_SPRINTS,
  DEMO_STORIES,
  DEMO_SUB_PROJECTS,
  DEMO_TIME_LOGS,
  DEMO_USERS,
} from '@/mocks/data'

export const userStore = createMockStore<User>(DEMO_USERS)
export const projectStore = createMockStore<Project>(DEMO_PROJECTS)
export const subProjectStore = createMockStore<SubProject>(DEMO_SUB_PROJECTS)
export const teamStore = createMockStore<Team>(DEMO_PROJECT_TEAMS)
export const projectMembershipStore = createMockStore<ProjectMembership>(DEMO_PROJECT_MEMBERSHIPS)
export const epicStore = createMockStore<Epic>(DEMO_EPICS)
export const storyStore = createMockStore<Story>(DEMO_STORIES)
export const sprintStore = createMockStore<Sprint>(DEMO_SPRINTS)
export const bugStore = createMockStore<Bug>(DEMO_BUGS)
export const releaseStore = createMockStore<Release>(DEMO_RELEASES)
export const timeLogStore = createMockStore<TimeLog>(DEMO_TIME_LOGS)
export const milestoneStore = createMockStore<Milestone>(DEMO_MILESTONES)
export const projectActivityStore = createMockStore<ProjectActivity>(DEMO_PROJECT_ACTIVITY)
export const notificationStore = createMockStore<AppNotification>(DEMO_NOTIFICATIONS)

type StoredProjectMember = ProjectMember & { id: string }

/**
 * Project-level roster derived from the membership model.
 * Project-level memberships come first in the seed, so they win the role;
 * sub-project members are also included so the project workspace and team
 * directory reflect the full roster while sub-project access stays granular.
 */
function deriveProjectRoster(): Array<{ projectId: string; userId: string; role: ProjectMemberRole; capacity: number }> {
  const seen = new Set<string>()
  const rows: Array<{ projectId: string; userId: string; role: ProjectMemberRole; capacity: number }> = []
  for (const membership of DEMO_PROJECT_MEMBERSHIPS) {
    const key = `${membership.projectId}-${membership.userId}`
    if (seen.has(key)) continue
    seen.add(key)
    rows.push({ projectId: membership.projectId, userId: membership.userId, role: membership.role, capacity: membership.capacity })
  }
  return rows
}

const MEMBER_SEED: Array<{ projectId: string; userId: string; role: ProjectMemberRole; capacity: number }> = [
  { projectId: 'prj-core', userId: 'user-rohit', role: 'manager', capacity: 100 },
  { projectId: 'prj-core', userId: 'user-aditi', role: 'business_analyst', capacity: 40 },
  { projectId: 'prj-core', userId: 'user-arjun', role: 'lead', capacity: 100 },
  { projectId: 'prj-core', userId: 'user-priya', role: 'qa', capacity: 80 },
  { projectId: 'prj-core', userId: 'user-sara', role: 'designer', capacity: 60 },
  { projectId: 'prj-core', userId: 'user-ravi', role: 'developer', capacity: 70 },
  { projectId: 'prj-portal', userId: 'user-aditi', role: 'manager', capacity: 100 },
  { projectId: 'prj-portal', userId: 'user-vikram', role: 'business_analyst', capacity: 50 },
  { projectId: 'prj-portal', userId: 'user-arjun', role: 'lead', capacity: 90 },
  { projectId: 'prj-portal', userId: 'user-priya', role: 'qa', capacity: 70 },
  { projectId: 'prj-portal', userId: 'user-sara', role: 'designer', capacity: 40 },
  { projectId: 'prj-mobile', userId: 'user-ravi', role: 'manager', capacity: 100 },
  { projectId: 'prj-mobile', userId: 'user-priya', role: 'business_analyst', capacity: 50 },
  { projectId: 'prj-mobile', userId: 'user-arjun', role: 'lead', capacity: 90 },
  { projectId: 'prj-mobile', userId: 'user-sara', role: 'designer', capacity: 50 },
  { projectId: 'prj-data', userId: 'user-arjun', role: 'manager', capacity: 100 },
  { projectId: 'prj-data', userId: 'user-aditi', role: 'business_analyst', capacity: 40 },
  { projectId: 'prj-data', userId: 'user-priya', role: 'qa', capacity: 50 },
  { projectId: 'prj-data', userId: 'user-rohit', role: 'consultant', capacity: 30 },
  { projectId: 'prj-design', userId: 'user-sara', role: 'manager', capacity: 100 },
  { projectId: 'prj-design', userId: 'user-rohit', role: 'consultant', capacity: 30 },
  { projectId: 'prj-retail', userId: 'user-arjun', role: 'manager', capacity: 100 },
  { projectId: 'prj-retail', userId: 'user-vikram', role: 'business_analyst', capacity: 60 },
  { projectId: 'prj-retail', userId: 'user-ravi', role: 'lead', capacity: 90 },
  { projectId: 'prj-retail', userId: 'user-priya', role: 'qa', capacity: 80 },
  { projectId: 'prj-hr', userId: 'user-vikram', role: 'manager', capacity: 100 },
  { projectId: 'prj-hr', userId: 'user-priya', role: 'business_analyst', capacity: 40 },
  { projectId: 'prj-hr', userId: 'user-aditi', role: 'consultant', capacity: 40 },
  { projectId: 'prj-health', userId: 'user-rohit', role: 'manager', capacity: 100 },
  { projectId: 'prj-health', userId: 'user-vikram', role: 'business_analyst', capacity: 50 },
  { projectId: 'prj-health', userId: 'user-sara', role: 'designer', capacity: 40 },
  ...deriveProjectRoster(),
]

export const projectMemberStore = createMockStore<StoredProjectMember>(
  MEMBER_SEED.map((seed) => ({
    ...seed,
    id: `${seed.projectId}-${seed.userId}`,
    joinedAt: '2026-01-04T00:00:00.000Z',
  })),
)

export const organizationStore = createMockStore<Organization>([DEMO_ORGANIZATION])

/** Export shape of the stores object — lets future REST repos mirror it. */
export const stores = {
  users: userStore,
  projects: projectStore,
  subProjects: subProjectStore,
  teams: teamStore,
  projectMemberships: projectMembershipStore,
  epics: epicStore,
  stories: storyStore,
  sprints: sprintStore,
  bugs: bugStore,
  releases: releaseStore,
  timeLogs: timeLogStore,
  milestones: milestoneStore,
  projectActivity: projectActivityStore,
  notifications: notificationStore,
  projectMembers: projectMemberStore,
  organization: organizationStore,
}