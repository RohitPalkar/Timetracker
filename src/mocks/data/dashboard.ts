import type { AppNotification } from '@/types/collaboration'
import { daysAgo, daysFromNow } from './users'

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