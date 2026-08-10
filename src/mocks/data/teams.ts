import type { Team } from '@/types'
import { daysAgo } from './users'

/**
 * Delivery teams under the UTEC project, assigned to sub-projects.
 * Team names follow the conventional Dev A / Dev B / QA A / QA B scheme.
 */
export const DEMO_PROJECT_TEAMS: Team[] = [
  {
    id: 'team-utec-dev-a',
    projectId: 'prj-utec',
    name: 'Dev A',
    description: 'Frontend and mobile delivery for EFA.',
    type: 'development',
    memberIds: ['user-ravi', 'user-arjun', 'user-kiran'],
    subProjectIds: ['sprj-efa'],
    createdAt: daysAgo(80),
    updatedAt: daysAgo(3),
  },
  {
    id: 'team-utec-dev-b',
    projectId: 'prj-utec',
    name: 'Dev B',
    description: 'Ledger, reconciliation, and bank integrations for UTLITE.',
    type: 'development',
    memberIds: ['user-amit', 'user-dinesh', 'user-neha'],
    subProjectIds: ['sprj-utlite'],
    createdAt: daysAgo(45),
    updatedAt: daysAgo(2),
  },
  {
    id: 'team-utec-qa-a',
    projectId: 'prj-utec',
    name: 'QA A',
    description: 'Quality assurance for the EFA delivery team.',
    type: 'qa',
    memberIds: ['user-priya', 'user-lakshmi'],
    subProjectIds: ['sprj-efa'],
    createdAt: daysAgo(78),
    updatedAt: daysAgo(6),
  },
  {
    id: 'team-utec-qa-b',
    projectId: 'prj-utec',
    name: 'QA B',
    description: 'Quality assurance for the UTLITE delivery team.',
    type: 'qa',
    memberIds: ['user-lakshmi', 'user-sara'],
    subProjectIds: ['sprj-utlite'],
    createdAt: daysAgo(40),
    updatedAt: daysAgo(4),
  },
]
