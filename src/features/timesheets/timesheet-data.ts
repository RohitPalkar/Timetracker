import type { TimesheetEntry, Timesheet } from '@/types/timesheet'

export const DEMO_TIMESHEET_ENTRIES: TimesheetEntry[] = [
  { id: 'tse-1', userId: 'user-sara', projectId: 'prj-core', date: new Date(Date.now() - 2 * 86_400_000).toISOString().slice(0,10), hours: 8, activity: 'Frontend sprint work', note: 'Board polish + review', isIdle: false },
  { id: 'tse-2', userId: 'user-sara', projectId: 'prj-core', date: new Date(Date.now() - 1 * 86_400_000).toISOString().slice(0,10), hours: 6.5, activity: 'Design system', isIdle: false },
  { id: 'tse-3', userId: 'user-arjun', projectId: 'prj-core', date: new Date(Date.now() - 1 * 86_400_000).toISOString().slice(0,10), hours: 8, activity: 'API integration', isIdle: false },
  { id: 'tse-4', userId: 'user-kiran', projectId: 'prj-utec', date: new Date().toISOString().slice(0,10), hours: 7, activity: 'EFA sprint', isIdle: false },
  { id: 'tse-5', userId: 'user-priya', projectId: 'prj-core', date: new Date().toISOString().slice(0,10), hours: 4, activity: 'QA', isIdle: false },
  { id: 'tse-6', userId: 'user-rohit', projectId: 'prj-portal', date: new Date(Date.now() - 3 * 86_400_000).toISOString().slice(0,10), hours: 8, activity: 'Delivery review', isIdle: false },
  { id: 'tse-7', userId: 'user-neha', projectId: 'prj-utec', date: new Date(Date.now() - 2 * 86_400_000).toISOString().slice(0,10), hours: 6, activity: 'Backend', isIdle: false },
]

export const DEMO_TIMESHEETS: Timesheet[] = [
  { id: 'ts-week-1', userId: 'user-sara', weekStart: new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0,10), weekEnd: new Date().toISOString().slice(0,10), status: 'draft', totalHours: 22.5, billableHours: 20, entries: DEMO_TIMESHEET_ENTRIES.filter((e) => e.userId === 'user-sara'), submittedAt: undefined },
  { id: 'ts-week-2', userId: 'user-arjun', weekStart: new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0,10), weekEnd: new Date().toISOString().slice(0,10), status: 'submitted', totalHours: 38, billableHours: 36, entries: DEMO_TIMESHEET_ENTRIES.filter((e) => e.userId === 'user-arjun'), submittedAt: new Date().toISOString() },
  { id: 'ts-week-3', userId: 'user-kiran', weekStart: new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0,10), weekEnd: new Date().toISOString().slice(0,10), status: 'approved', totalHours: 40, billableHours: 40, entries: [], approvedBy: 'user-rohit', approvedAt: new Date().toISOString() },
  { id: 'ts-week-4', userId: 'user-priya', weekStart: new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0,10), weekEnd: new Date().toISOString().slice(0,10), status: 'rejected', totalHours: 32, billableHours: 28, entries: [] },
]
