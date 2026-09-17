import * as React from 'react'
import { BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { DEMO_TIMESHEET_ENTRIES, DEMO_TIMESHEETS } from '../timesheet-data'
import { userStore, projectStore } from '@/services/stores'

export function TimesheetReportsPage() {
  const users = userStore.all()
  const projects = projectStore.all()
  const total = DEMO_TIMESHEET_ENTRIES.reduce((a,b)=>a+b.hours,0)
  const billable = DEMO_TIMESHEET_ENTRIES.filter((e)=>!e.isIdle).reduce((a,b)=>a+b.hours,0)
  const byProject = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const e of DEMO_TIMESHEET_ENTRIES) map.set(e.projectId, (map.get(e.projectId) ?? 0) + e.hours)
    return [...map.entries()].map(([id, hours]) => ({ id, hours, name: projects.find((p)=>p.id===id)?.name ?? id }))
  }, [projects])

  const byUser = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const e of DEMO_TIMESHEET_ENTRIES) map.set(e.userId, (map.get(e.userId) ?? 0) + e.hours)
    return [...map.entries()].map(([id, hours]) => ({ id, hours, name: users.find((u)=>u.id===id)?.name ?? id }))
  }, [users])

  return (
    <PageLayout header={<PageHeader title="Timesheet Reports" description="Summaries, utilization and billable hours. Reports are derived from timesheets, entries and project allocations." breadcrumb={[{ label: 'Timesheets' }, { label: 'Reports' }]} />}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Total hours</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{total}h</p><p className="text-xs text-muted-foreground">{DEMO_TIMESHEET_ENTRIES.length} entries • {DEMO_TIMESHEETS.length} timesheets</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Billable</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{billable}h</p><Progress value={total ? (billable/total)*100 : 0} className="mt-2 h-2" /><p className="mt-1 text-xs text-muted-foreground">{total ? Math.round((billable/total)*100) : 0}% billable</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Approval rate</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{DEMO_TIMESHEETS.filter((t)=>t.status==='approved').length}/{DEMO_TIMESHEETS.length}</p><p className="text-xs text-muted-foreground">approved timesheets</p></CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><BarChart3 className="size-4" /> Hours by project</CardTitle></CardHeader><CardContent className="grid gap-2">{byProject.map((row) => <div key={row.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2"><span className="text-sm font-medium text-foreground">{row.name}</span><span className="text-sm text-muted-foreground">{row.hours}h</span></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Hours by employee</CardTitle></CardHeader><CardContent className="grid gap-2">{byUser.map((row) => <div key={row.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2"><span className="text-sm font-medium text-foreground">{row.name}</span><span className="text-sm text-muted-foreground">{row.hours}h</span></div>)}</CardContent></Card>
      </div>
    </PageLayout>
  )
}
