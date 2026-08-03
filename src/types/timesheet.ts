export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected'
export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export interface TimesheetEntry {
  id: string
  userId: string
  projectId: string
  date: string
  hours: number
  activity: string
  note?: string
  isIdle: boolean
}

export interface Timesheet {
  id: string
  userId: string
  weekStart: string
  weekEnd: string
  status: TimesheetStatus
  totalHours: number
  billableHours: number
  entries: TimesheetEntry[]
  submittedAt?: string
  approvedBy?: string
  approvedAt?: string
}

export interface LeaveRequest {
  id: string
  userId: string
  type: 'leave' | 'work_from_home' | 'comp_off'
  startDate: string
  endDate: string
  reason: string
  status: LeaveStatus
  approverId?: string
  createdAt: string
}

export interface TimeLog {
  id: string
  userId: string
  storyId?: string
  projectId: string
  date: string
  hours: number
  note?: string
}