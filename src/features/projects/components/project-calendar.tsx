import * as React from 'react'
import { CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MonthCalendar, type MonthCalendarEvent } from '@/components/common/month-calendar'
import type { Milestone, Project } from '@/types'

export interface ProjectCalendarProps {
  project: Project
  milestones: Milestone[]
}

const MILESTONE_TONE: Record<Milestone['status'], MonthCalendarEvent['tone']> = {
  completed: 'success',
  in_progress: 'primary',
  planned: 'neutral',
}

/** Project calendar — milestones and project dates on a month grid. */
export function ProjectCalendar({ project, milestones }: ProjectCalendarProps) {
  const events = React.useMemo<MonthCalendarEvent[]>(() => {
    const list: MonthCalendarEvent[] = [
      { date: project.startDate, label: 'Project starts', tone: 'primary' },
      { date: project.endDate, label: 'Project ends', tone: 'danger' },
      ...milestones.map((milestone) => ({
        date: milestone.date,
        label: milestone.title,
        tone: MILESTONE_TONE[milestone.status],
      })),
    ]
    return list.sort((a, b) => a.date.localeCompare(b.date))
  }, [project, milestones])

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold">Calendar</CardTitle>
        <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <CalendarDays className="size-4" aria-hidden="true" />
          {milestones.length + 2} dates
        </span>
      </CardHeader>
      <CardContent className="pt-1">
        <MonthCalendar events={events} />
      </CardContent>
    </Card>
  )
}
