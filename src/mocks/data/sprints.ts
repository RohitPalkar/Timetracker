import type { Sprint } from '@/types/agile'
import { daysAgo, daysFromNow } from './users'

const sprintWindow = (startDaysAgo: number, lengthDays: number) => {
  const start = daysAgo(startDaysAgo)
  const end = daysFromNow(lengthDays - startDaysAgo)
  return { startDate: start, endDate: end }
}

export const DEMO_SPRINTS: Sprint[] = [
  {
    id: 'spr-14',
    projectId: 'prj-core',
    name: 'Sprint 14 · Core',
    goal: 'Ship the roles & permissions matrix and close the board empty-state backlog.',
    status: 'active',
    ...sprintWindow(2, 14),
    capacityHours: 320,
    hoursLogged: 214,
    velocity: 38,
    confidence: 0.72,
  },
  {
    id: 'spr-13',
    projectId: 'prj-core',
    name: 'Sprint 13 · Core',
    goal: 'Migrate story editor to Tiptap and wire notifications.',
    status: 'completed',
    ...sprintWindow(16, 14),
    capacityHours: 310,
    hoursLogged: 296,
    velocity: 42,
    confidence: 0.8,
  },
  {
    id: 'spr-12',
    projectId: 'prj-core',
    name: 'Sprint 12 · Core',
    goal: 'Data table v1 and form system rollout.',
    status: 'completed',
    ...sprintWindow(30, 14),
    capacityHours: 300,
    hoursLogged: 288,
    velocity: 36,
    confidence: 0.75,
  },
  {
    id: 'spr-portal-6',
    projectId: 'prj-portal',
    name: 'Sprint 6 · Portal',
    goal: 'Billing flow parity with legacy system.',
    status: 'active',
    ...sprintWindow(3, 14),
    capacityHours: 260,
    hoursLogged: 158,
    velocity: 24,
    confidence: 0.6,
  },
  {
    id: 'spr-portal-5',
    projectId: 'prj-portal',
    name: 'Sprint 5 · Portal',
    goal: 'Ticket detail and attachments.',
    status: 'completed',
    ...sprintWindow(17, 14),
    capacityHours: 250,
    hoursLogged: 241,
    velocity: 28,
    confidence: 0.68,
  },
]