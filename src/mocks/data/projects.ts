import type { Milestone, Project, ProjectActivity, ProjectMemberRole } from '@/types'
import { daysAgo, daysFromNow } from './users'

/**
 * Projects span software, mobile, enterprise products and internal tooling.
 * Every project carries a manager, BA, developers, QA, budget, dates and progress.
 */

export const DEMO_PROJECTS: Project[] = [
  {
    id: 'prj-core',
    key: 'CORE',
    name: 'MyTracker Core Platform',
    type: 'platform',
    description:
      'The internal enterprise work management platform — stories, sprints, and delivery tracking for every delivery team at Acme Digital.',
    status: 'active',
    health: 'on_track',
    progress: 62,
    ownerId: 'user-rohit',
    businessAnalystId: 'user-aditi',
    client: 'Internal',
    startDate: daysAgo(120),
    endDate: daysFromNow(90),
    budget: 1200000,
    spent: 748000,
    tags: ['platform', 'react', 'internal'],
    updatedAt: daysAgo(0),
  },
  {
    id: 'prj-portal',
    key: 'PORTAL',
    name: 'Acme Customer Portal',
    type: 'client_delivery',
    description:
      'Self-service customer portal with billing, ticket management, and knowledge base for Orbit Retail customers.',
    status: 'active',
    health: 'at_risk',
    progress: 41,
    ownerId: 'user-aditi',
    businessAnalystId: 'user-vikram',
    client: 'Orbit Retail',
    startDate: daysAgo(80),
    endDate: daysFromNow(140),
    budget: 940000,
    spent: 612000,
    tags: ['nextjs', 'customer', 'billing'],
    updatedAt: daysAgo(1),
  },
  {
    id: 'prj-mobile',
    key: 'MOBILE',
    name: 'Mobile Banking App',
    type: 'product',
    description:
      'Native mobile banking with biometric login, instant transfers, and spend insights for Nova Bank customers.',
    status: 'on_hold',
    health: 'critical',
    progress: 28,
    ownerId: 'user-ravi',
    businessAnalystId: 'user-priya',
    client: 'Nova Bank',
    startDate: daysAgo(200),
    endDate: daysFromNow(210),
    budget: 2100000,
    spent: 890000,
    tags: ['react-native', 'fintech'],
    updatedAt: daysAgo(4),
  },
  {
    id: 'prj-data',
    key: 'DATA',
    name: 'Analytics Platform',
    type: 'data',
    description: 'Internal BI and reporting layer powering board and executive dashboards across the company.',
    status: 'active',
    health: 'healthy',
    progress: 84,
    ownerId: 'user-arjun',
    businessAnalystId: 'user-aditi',
    client: 'Internal',
    startDate: daysAgo(200),
    endDate: daysFromNow(30),
    budget: 760000,
    spent: 610000,
    tags: ['data', 'reporting'],
    updatedAt: daysAgo(2),
  },
  {
    id: 'prj-design',
    key: 'DSGN',
    name: 'Design System V2',
    type: 'design',
    description: 'Next-generation component library and token architecture for all client-facing products.',
    status: 'planned',
    health: 'healthy',
    progress: 0,
    ownerId: 'user-sara',
    businessAnalystId: 'user-sara',
    client: 'Internal',
    startDate: daysFromNow(14),
    endDate: daysFromNow(120),
    budget: 210000,
    spent: 0,
    tags: ['design', 'tokens'],
    updatedAt: daysAgo(6),
  },
  {
    id: 'prj-retail',
    key: 'OMNI',
    name: 'Omnichannel Retail Suite',
    type: 'client_delivery',
    description: 'Unified order, inventory, and fulfillment platform for the retail enterprise segment.',
    status: 'active',
    health: 'on_track',
    progress: 55,
    ownerId: 'user-arjun',
    businessAnalystId: 'user-vikram',
    client: 'Lumina Stores',
    startDate: daysAgo(150),
    endDate: daysFromNow(110),
    budget: 1650000,
    spent: 912000,
    tags: ['enterprise', 'retail', 'orders'],
    updatedAt: daysAgo(1),
  },
  {
    id: 'prj-hr',
    key: 'PEOPLE',
    name: 'People Ops Suite',
    type: 'internal',
    description: 'Internal HRIS for onboarding, leave, and performance workflows at Acme Digital.',
    status: 'completed',
    health: 'healthy',
    progress: 100,
    ownerId: 'user-vikram',
    businessAnalystId: 'user-priya',
    client: 'Internal',
    startDate: daysAgo(340),
    endDate: daysAgo(20),
    budget: 450000,
    spent: 428000,
    tags: ['internal', 'hr'],
    updatedAt: daysAgo(12),
  },
  {
    id: 'prj-health',
    key: 'HEALTH',
    name: 'CareConnect Patient Portal',
    type: 'product',
    description: 'Enterprise patient engagement platform for appointment booking, records, and messaging.',
    status: 'on_hold',
    health: 'at_risk',
    progress: 17,
    ownerId: 'user-rohit',
    businessAnalystId: 'user-vikram',
    client: 'MedBridge Health',
    startDate: daysAgo(60),
    endDate: daysFromNow(240),
    budget: 1280000,
    spent: 310000,
    tags: ['healthcare', 'enterprise'],
    updatedAt: daysAgo(9),
  },
]

const MILESTONE_SEED: Array<{
  projectId: string
  title: string
  startDaysAgo: number
  status: Milestone['status']
}> = [
  { projectId: 'prj-core', title: 'Kickoff & discovery', startDaysAgo: 120, status: 'completed' },
  { projectId: 'prj-core', title: 'Auth & workspace foundation', startDaysAgo: 96, status: 'completed' },
  { projectId: 'prj-core', title: 'Project module GA', startDaysAgo: 45, status: 'in_progress' },
  { projectId: 'prj-core', title: 'Stories & sprints beta', startDaysAgo: -25, status: 'planned' },
  { projectId: 'prj-core', title: 'Timesheets & reports', startDaysAgo: -60, status: 'planned' },
  { projectId: 'prj-portal', title: 'Billing flows parity', startDaysAgo: 80, status: 'completed' },
  { projectId: 'prj-portal', title: 'Ticket center rollout', startDaysAgo: 30, status: 'in_progress' },
  { projectId: 'prj-portal', title: 'Knowledge base', startDaysAgo: -45, status: 'planned' },
  { projectId: 'prj-mobile', title: 'Onboarding & biometrics', startDaysAgo: 200, status: 'completed' },
  { projectId: 'prj-mobile', title: 'Transfer engine', startDaysAgo: 90, status: 'in_progress' },
  { projectId: 'prj-mobile', title: 'Spend insights', startDaysAgo: -30, status: 'planned' },
  { projectId: 'prj-data', title: 'Warehouse v1', startDaysAgo: 200, status: 'completed' },
  { projectId: 'prj-data', title: 'Board dashboards', startDaysAgo: 60, status: 'completed' },
  { projectId: 'prj-data', title: 'Executive reporting', startDaysAgo: -10, status: 'in_progress' },
  { projectId: 'prj-design', title: 'Token architecture', startDaysAgo: -14, status: 'planned' },
  { projectId: 'prj-design', title: 'Component library beta', startDaysAgo: -60, status: 'planned' },
  { projectId: 'prj-retail', title: 'Order management', startDaysAgo: 150, status: 'completed' },
  { projectId: 'prj-retail', title: 'Inventory sync', startDaysAgo: 60, status: 'in_progress' },
  { projectId: 'prj-retail', title: 'Fulfillment gateway', startDaysAgo: -35, status: 'planned' },
  { projectId: 'prj-hr', title: 'Onboarding workflows', startDaysAgo: 340, status: 'completed' },
  { projectId: 'prj-hr', title: 'Leave management', startDaysAgo: 220, status: 'completed' },
  { projectId: 'prj-hr', title: 'Performance reviews', startDaysAgo: 90, status: 'completed' },
  { projectId: 'prj-health', title: 'Discovery & compliance', startDaysAgo: 60, status: 'completed' },
  { projectId: 'prj-health', title: 'Appointment booking', startDaysAgo: -10, status: 'planned' },
  { projectId: 'prj-health', title: 'Records integration', startDaysAgo: -70, status: 'planned' },
]

export const DEMO_MILESTONES: Milestone[] = MILESTONE_SEED.map((milestone) => ({
  id: `${milestone.projectId}-ms-${milestone.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
  projectId: milestone.projectId,
  title: milestone.title,
  date: daysAgo(milestone.startDaysAgo),
  status: milestone.status,
}))

const ACTIVITY_SEED: Array<{ type: ProjectActivity['type']; action: string; target?: string }> = [
  { type: 'member', action: 'joined the project' },
  { type: 'milestone', action: 'marked milestone as completed' },
  { type: 'status', action: 'moved project to' },
  { type: 'budget', action: 'updated the budget to' },
  { type: 'settings', action: 'updated project details' },
  { type: 'comment', action: 'commented on' },
]

export const DEMO_PROJECT_ACTIVITY: ProjectActivity[] = DEMO_PROJECTS.flatMap((project, projectIndex) => {
  const count = 4 + ((projectIndex + 1) % 3)
  return Array.from({ length: count }, (_, index) => {
    const config = ACTIVITY_SEED[(projectIndex + index) % ACTIVITY_SEED.length]
    return {
      id: `${project.id}-act-${index + 1}`,
      projectId: project.id,
      type: config.type,
      actorId: project.ownerId,
      action: config.action,
      target: config.type === 'status' ? project.status : config.type === 'budget' ? `$${project.budget.toLocaleString()}` : project.name,
      createdAt: daysAgo(index * 2 + 1 + projectIndex),
    }
  })
})

export const projectMemberKey = (projectId: string, userId: string): string => `${projectId}-${userId}`

/** Ordered roles used by selects and role dropdowns. */
export const DEMO_MEMBER_ROLES: ProjectMemberRole[] = [
  'manager',
  'lead',
  'developer',
  'qa',
  'designer',
  'business_analyst',
  'consultant',
]
