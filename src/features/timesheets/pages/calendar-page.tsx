import * as React from 'react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { Card, CardContent } from '@/components/ui/card'
import { MonthCalendar } from '@/components/common/month-calendar'
import { DEMO_TIMESHEET_ENTRIES } from '../timesheet-data'
import { projectStore } from '@/services/stores'

export function TimesheetCalendarPage() {
  const projects = projectStore.all()

  const events = React.useMemo(() => DEMO_TIMESHEET_ENTRIES.map((e) => ({
    date: e.date,
    label: `${e.activity} • ${e.hours}h • ${projects.find((p) => p.id === e.projectId)?.name ?? e.projectId}`,
    tone: e.isIdle ? 'neutral' as const : 'primary' as const,
  })), [projects])

  const entriesByDate = React.useMemo(() => {
    const map = new Map<string, typeof DEMO_TIMESHEET_ENTRIES>()
    for (const e of DEMO_TIMESHEET_ENTRIES) {
      const arr = map.get(e.date) ?? []
      arr.push(e)
      map.set(e.date, arr)
    }
    return map
  }, [])

  return (
    <PageLayout header={<PageHeader title="Calendar" description="Visualize time logs on a calendar. Days with entries show dots; hover for details." breadcrumb={[{ label: 'Timesheets' }, { label: 'Calendar' }]} />}>
      <Card>
        <CardContent className="pt-6">
          <MonthCalendar events={events} />
          <div className="mt-4 grid gap-2">
            {[...entriesByDate.entries()].slice(0, 6).map(([date, entries]) => (
              <div key={date} className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2 text-sm">
                <span className="font-medium text-foreground">{date}</span>
                <span className="text-muted-foreground">{entries.length} entries • {entries.reduce((a,b)=>a+b.hours,0)}h • {projects.find((p)=>p.id===entries[0].projectId)?.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
