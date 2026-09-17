import { Clock3, CalendarDays, FileText, HardDrive, Inbox, LogIn, LogOut, Plane } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import type { MyHRMSPayload } from '@/types/dashboard'
import { toast } from 'sonner'
import { useNavigate } from 'react-router'

export function MyHRMSGroup({ data, loading }: { data: MyHRMSPayload; loading?: boolean }) {
  const navigate = useNavigate()
  if (loading) return <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-36" /><Skeleton className="h-36" /><Skeleton className="h-36" /></div>

  const att = data.attendance
  const present = att.status === 'present'

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">My HRMS</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Attendance */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Clock3 className="size-4" /> My Attendance</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={present ? 'success' : att.status === 'holiday' ? 'info' : att.status === 'on_leave' ? 'warning' : 'neutral'} className="capitalize">{att.status.replace('_', ' ')}</Badge>
              {att.checkIn && <span className="text-xs text-muted-foreground">In {att.checkIn}</span>}
              {att.checkOut && <span className="text-xs text-muted-foreground">Out {att.checkOut}</span>}
            </div>
            {att.workingMinutes !== undefined && (
              <div>
                <p className="text-2xl font-semibold">{Math.floor(att.workingMinutes / 60)}h {att.workingMinutes % 60}m</p>
                <Progress value={Math.min(100, (att.workingMinutes / 480) * 100)} className="mt-1 h-2" />
                <p className="mt-1 text-xs text-muted-foreground">Target 8h • {480 - att.workingMinutes > 0 ? `${480 - att.workingMinutes} min remaining` : 'Target met'}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" className="h-7" disabled={present} onClick={() => toast.success('Checked in — attendance record created (mock). POST /api/v1/attendance/check-in')}><LogIn className="size-3.5" /> Check In</Button>
              <Button size="sm" variant="outline" className="h-7" disabled={!present} onClick={() => toast.success('Checked out — duration calculated. POST /api/v1/attendance/check-out')}><LogOut className="size-3.5" /> Check Out</Button>
            </div>
            <p className="text-[11px] text-muted-foreground">Attendance ≠ Timesheet. Attendance answers “Was present?”; timesheets answer “What work?”</p>
          </CardContent>
        </Card>

        {/* Leave */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Plane className="size-4" /> My Leave</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              {data.leave.balances.slice(0, 4).map((b) => (
                <div key={b.type} className="rounded-xl border border-border bg-surface-subtle px-2.5 py-2">
                  <p className="text-xs font-medium text-foreground">{b.type}</p>
                  <p className="text-sm font-semibold">{b.balance}d <span className="text-xs font-normal text-muted-foreground">• {b.pending} pending</span></p>
                </div>
              ))}
            </div>
            {data.leave.pending.length > 0 && <p className="text-xs text-warning-foreground bg-warning-soft rounded-lg px-2 py-1">{data.leave.pending.length} pending • {data.leave.pending[0].type} {data.leave.pending[0].from} → {data.leave.pending[0].to}</p>}
            <Button size="sm" variant="outline" className="h-7 w-fit" onClick={() => navigate('/timesheets/my')}><CalendarDays className="size-3.5" /> Apply Leave</Button>
          </CardContent>
        </Card>

        {/* Holidays */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><CalendarDays className="size-4" /> My Holidays</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            {data.holidays.slice(0, 3).map((h) => (
              <div key={h.date} className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2">
                <span className="text-sm font-medium text-foreground">{h.name}</span>
                <span className="text-xs text-muted-foreground">{h.date} • {h.calendar}</span>
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground">Based on applicable holiday calendar (location-aware).</p>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><FileText className="size-4" /> My Documents</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex gap-2">
              <Badge variant="warning">{data.documents.requiringAttention} attention</Badge>
              <Badge variant="neutral">{data.documents.expiringSoon} expiring</Badge>
            </div>
            {data.documents.recent.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2">
                <span className="truncate text-sm text-foreground">{d.name}</span>
                <span className="text-xs text-muted-foreground">{new Date(d.updatedAt).toLocaleDateString()}</span>
              </div>
            ))}
            <Button size="sm" variant="outline" className="h-7 w-fit" onClick={() => navigate('/documents')}>Open Documents</Button>
          </CardContent>
        </Card>

        {/* Assets */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><HardDrive className="size-4" /> My Assets</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            <p className="text-2xl font-semibold">{data.assets.allocated} allocated</p>
            {data.assets.items.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2">
                <span className="text-sm font-medium text-foreground">{a.name}</span>
                <Badge variant={a.status === 'In Use' ? 'success' : 'neutral'} className="text-[11px]">{a.status}</Badge>
              </div>
            ))}
            <Button size="sm" variant="outline" className="h-7 w-fit" onClick={() => navigate('/documents')}>View assets</Button>
          </CardContent>
        </Card>

        {/* HR Requests */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Inbox className="size-4" /> My HR Requests</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex gap-2 text-xs">
              <Badge variant="warning">{data.hrRequests.pending} pending</Badge>
              <Badge variant="success">{data.hrRequests.approved} approved</Badge>
              <Badge variant="neutral">{data.hrRequests.rejected} rejected</Badge>
            </div>
            {data.hrRequests.items.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2">
                <span className="text-sm text-foreground">{r.title}</span>
                <Badge variant="info" className="capitalize text-[11px]">{r.status}</Badge>
              </div>
            ))}
            <Button size="sm" variant="outline" className="h-7 w-fit" onClick={() => toast.info('HR Requests → canonical HR module (mock).')}>Open requests</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
