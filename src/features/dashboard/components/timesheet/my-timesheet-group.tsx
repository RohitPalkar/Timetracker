import { Clock, Timer, FilePlus, CheckCircle2, Play, Square } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import type { MyTimesheetPayload } from '@/types/dashboard'
import { toast } from 'sonner'
import { useNavigate } from 'react-router'

function fmt(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${m}m`
}

export function MyTimesheetGroup({ data, loading }: { data: MyTimesheetPayload; loading?: boolean }) {
  const navigate = useNavigate()
  if (loading) return <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>

  const todayPct = data.today.targetMinutes ? Math.min(100, (data.today.loggedMinutes / data.today.targetMinutes) * 100) : 0

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">My Timesheet</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Clock className="size-4" /> Today</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            <p className="text-2xl font-semibold">{fmt(data.today.loggedMinutes)}</p>
            {data.today.targetMinutes && <><Progress value={todayPct} className="h-2" /><p className="text-xs text-muted-foreground">Target {fmt(data.today.targetMinutes)} • {data.today.remainingMinutes !== undefined ? `${fmt(data.today.remainingMinutes)} remaining` : ''}</p></>}
            <Button size="sm" variant="outline" className="h-7 w-fit" onClick={() => navigate('/timesheets/my')}>Open My Timesheet</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><FilePlus className="size-4" /> Weekly</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            <p className="text-2xl font-semibold">{fmt(data.week.totalMinutes)}</p>
            <div className="flex gap-1">
              {data.week.daily.map((d) => (
                <div key={d.date} className="flex-1 rounded-lg bg-surface-subtle px-1 py-1 text-center">
                  <p className="text-[10px] text-muted-foreground">{new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}</p>
                  <p className="text-xs font-medium text-foreground">{Math.round(d.minutes / 60)}h</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{data.week.byProject.map((p) => `${p.projectName}: ${fmt(p.minutes)}`).join(' • ')}</p>
            <Button size="sm" variant="outline" className="h-7 w-fit" onClick={() => navigate('/timesheets/reports')}>View reports</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Timer className="size-4" /> Timer</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            {data.timer ? (
              <>
                <div className="rounded-xl border border-success/30 bg-success-soft/20 px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{data.timer.workItemKey} • {data.timer.activity}</p>
                  <p className="text-xs text-muted-foreground">{data.timer.projectName}{data.timer.subProjectName ? ` / ${data.timer.subProjectName}` : ''} • Started {new Date(data.timer.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {fmt(data.timer.elapsedMinutes)} elapsed</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-7" onClick={() => toast.success('Timer stopped — duration persisted. POST /api/v1/timers/:id/stop → time_entries')}><Square className="size-3.5" /> Stop</Button>
                  <Badge variant="success">{fmt(data.timer.elapsedMinutes)} running</Badge>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">No active timer.</p>
                <Button size="sm" className="h-7 w-fit" onClick={() => toast.info('Start Timer — validates project/work-item access. POST /api/v1/timers')}><Play className="size-3.5" /> Start Timer</Button>
              </>
            )}
            <Button size="sm" variant="outline" className="h-7 w-fit" onClick={() => toast.info('Log Time — opens time-entry form with project/sub-project/sprint/work-item/activity/duration.')}><Clock className="size-3.5" /> Log Time</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 pt-6">
          <Badge variant={data.status === 'approved' ? 'success' : data.status === 'submitted' ? 'info' : data.status === 'rejected' ? 'danger' : 'warning'} className="capitalize">{data.status}</Badge>
          <span className="text-sm text-muted-foreground">{data.entriesCount} entries this period</span>
          <span className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" className="h-7" onClick={() => navigate('/timesheets/my')}>View timesheet</Button>
            <Button size="sm" className="h-7" disabled={data.status !== 'draft'} onClick={() => toast.success('Timesheet submitted — approval workflow created. POST /api/v1/timesheets/:id/submit')}><CheckCircle2 className="size-3.5" /> Submit</Button>
          </span>
        </CardContent>
      </Card>
    </div>
  )
}
