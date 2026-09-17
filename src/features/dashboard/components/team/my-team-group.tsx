import { Users, Clock, CalendarDays, BarChart3, FileCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { MyTeamPayload } from '@/types/dashboard'
import { useNavigate } from 'react-router'

export function MyTeamGroup({ data, loading }: { data: MyTeamPayload | null; loading?: boolean }) {
  const navigate = useNavigate()
  if (loading) return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
  if (!data) return null // hidden when no team-view capability — per spec §10 “do not display empty Team section when no capability”

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">My Team</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Users className="size-4" /> Team Members <Badge variant="neutral" className="ml-auto">{data.members.length}</Badge></CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            {data.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2">
                <span className="text-sm font-medium text-foreground">{m.name}</span>
                <Badge variant={m.status === 'present' ? 'success' : m.status === 'on_leave' ? 'warning' : 'neutral'} className="capitalize text-[11px]">{m.status.replace('_', ' ')}</Badge>
              </div>
            ))}
            <Button size="sm" variant="outline" className="h-7 w-fit" onClick={() => navigate('/teams')}>Open team</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Clock className="size-4" /> Team Attendance</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="rounded-xl bg-success-soft px-2 py-2"><p className="text-lg font-semibold text-success-foreground">{data.attendance.present}</p><p className="text-[11px] text-muted-foreground">Present</p></div>
              <div className="rounded-xl bg-warning-soft px-2 py-2"><p className="text-lg font-semibold text-warning-foreground">{data.attendance.onLeave}</p><p className="text-[11px] text-muted-foreground">On leave</p></div>
              <div className="rounded-xl bg-danger-soft px-2 py-2"><p className="text-lg font-semibold text-danger-foreground">{data.attendance.absent}</p><p className="text-[11px] text-muted-foreground">Absent</p></div>
              <div className="rounded-xl bg-info-soft px-2 py-2"><p className="text-lg font-semibold text-info-foreground">{data.attendance.late}</p><p className="text-[11px] text-muted-foreground">Late</p></div>
            </div>
            <p className="text-[11px] text-muted-foreground">Permission-scoped — no sensitive data beyond team-view capability.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><CalendarDays className="size-4" /> Team Leave <Badge variant="warning" className="ml-auto">{data.leave.pending} pending</Badge></CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            <p className="text-sm text-foreground">Pending {data.leave.pending} • Upcoming {data.leave.upcoming}</p>
            <Button size="sm" variant="outline" className="h-7 w-fit" onClick={() => navigate('/timesheets/approvals')}>Review leave</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><BarChart3 className="size-4" /> Team Workload</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            {data.workload.map((w) => (
              <div key={w.userId} className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2">
                <span className="text-sm text-foreground">{w.name}</span>
                <span className="text-xs text-muted-foreground">{w.completed}/{w.assigned} done</span>
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground">Workload ≠ performance score.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><FileCheck className="size-4" /> Team Timesheets</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            {data.timesheets.map((t) => (
              <div key={t.userId} className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2">
                <span className="text-sm text-foreground">{t.name}</span>
                <span className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{t.hours}h</span><Badge variant={t.status === 'submitted' ? 'info' : 'neutral'} className="text-[11px]">{t.status}</Badge></span>
              </div>
            ))}
            <Button size="sm" variant="outline" className="h-7 w-fit" onClick={() => navigate('/timesheets/team')}>Open Team Timesheets</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><FileCheck className="size-4" /> Team Approvals</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            {data.approvals.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2">
                <span className="text-sm text-foreground">{a.type} • {a.requester}</span>
                <span className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
            <Button size="sm" variant="outline" className="h-7 w-fit" onClick={() => navigate('/timesheets/approvals')}>View approvals</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
