/**
 * Shared in-memory store registry.
 * Repositories seed from `src/mocks/data` here so reads compose reliably
 * (e.g. dashboard aggregates across projects, stories, sprints, bugs).
 */
import type { Organization, Project, ProjectMember, ProjectMemberRole, User } from '@/types'
import type { AppNotification } from '@/types/collaboration'
import type { Milestone } from '@/types'
import type { Bug, Sprint, Story } from '@/types/agile'
import type { ProjectActivity } from '@/types'
import { createMockStore } from './mock-store'
import {
  DEMO_BUGS,
  DEMO_MILESTONES,
  DEMO_NOTIFICATIONS,
  DEMO_ORGANIZATION,
  DEMO_PROJECTS,
  DEMO_PROJECT_ACTIVITY,
  DEMO_SPRINTS,
  DEMO_STORIES,
  DEMO_USERS,
} from '@/mocks/data'

export const userStore = createMockStore<User>(DEMO_USERS)
export const projectStore = createMockStore<Project>(DEMO_PROJECTS)
export const storyStore = createMockStore<Story>(DEMO_STORIES)
export const sprintStore = createMockStore<Sprint>(DEMO_SPRINTS)
export const bugStore = createMockStore<Bug>(DEMO_BUGS)
export const milestoneStore = createMockStore<Milestone>(DEMO_MILESTONES)
export const projectActivityStore = createMockStore<ProjectActivity>(DEMO_PROJECT_ACTIVITY)
export const notificationStore = createMockStore<AppNotification>(DEMO_NOTIFICATIONS)

type StoredProjectMember = ProjectMember & { id: string }

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
  stories: storyStore,
  sprints: sprintStore,
  bugs: bugStore,
  milestones: milestoneStore,
  projectActivity: projectActivityStore,
  notifications: notificationStore,
  projectMembers: projectMemberStore,
  organization: organizationStore,
}