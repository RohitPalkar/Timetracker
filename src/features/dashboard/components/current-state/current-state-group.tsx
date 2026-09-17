import * as React from 'react'
import { Clock3, Clock, Timer, CalendarDays, LogIn, LogOut, Play, Square, Pause, Building2, Home, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { MyHRMSPayload, MyTimesheetPayload } from '@/types/dashboard'
import { toast } from 'sonner'
import { useNavigate } from 'react-router'
import { useAuth } from '@/store/auth'

function fmt(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${String(m).padStart(2, '0')}m`
}

export function CurrentStateGroup({
  hrms,
  timesheet,
  loading,
}: {
  hrms: MyHRMSPayload | null
  timesheet: MyTimesheetPayload | null
  loading?: boolean
}) {
  const { can } = useAuth()
  const navigate = useNavigate()
  const [timerTick, setTimerTick] = React.useState(0)

  React.useEffect(() => {
    if (!timesheet?.timer) return
    const id = window.setInterval(() => setTimerTick((t) => t + 1), 60_000)
    return () => window.clearInterval(id)
  }, [timesheet?.timer])

  const canAttendance = can('attendance.view')
  const canTimesheet = can('timesheet.view' as never) || can('timesheets.view_own' as never) || can('timesheet.view' as never)

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!hrms && !timesheet) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">No current state available.</CardContent>
      </Card>
    )
  }

  // Local attendance state so Log in / Log off toggles without backend
  const [localAtt, setLocalAtt] = React.useState(hrms?.attendance ?? null)
  const [showLoginDialog, setShowLoginDialog] = React.useState(false)
  const [loginLocation, setLoginLocation] = React.useState<'office' | 'wfh' | 'client'>('office')

  React.useEffect(() => {
    if (hrms?.attendance) setLocalAtt(hrms.attendance)
  }, [hrms?.attendance])

  const att = localAtt ?? hrms?.attendance
  const present = att?.status === 'present'
  const checkedOut = att?.status === 'checked_out'
  const notCheckedIn = att?.status === 'not_checked_in'

  const todayLogged = timesheet?.today.loggedMinutes ?? 0
  const timer = timesheet?.timer
  const elapsed = timer ? timer.elapsedMinutes + timerTick : 0

  const handleLogin = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const locLabel = loginLocation === 'office' ? 'Office' : loginLocation === 'wfh' ? 'Work from home' : 'Client location'
    setLocalAtt((prev) => ({
      status: 'present',
      checkIn: now,
      checkOut: undefined,
      workingMinutes: prev?.workingMinutes ?? 0,
      exceptionLabel: locLabel,
    }))
    setShowLoginDialog(false)
    toast.success(`Logged in — ${locLabel}. POST /api/v1/attendance/log-in`)
  }

  const handleLogoff = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setLocalAtt((prev) => ({
      status: 'checked_out',
      checkIn: prev?.checkIn,
      checkOut: now,
      workingMinutes: prev?.workingMinutes,
      exceptionLabel: prev?.exceptionLabel,
    }))
    toast.success('Logged off — POST /api/v1/attendance/log-off')
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {/* Attendance */}
      {canAttendance && att && (
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock3 className="size-3.5" aria-hidden="true" /> Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-2">
            <Badge
              variant={present ? 'success' : checkedOut ? 'neutral' : notCheckedIn ? 'warning' : 'info'}
              className="w-fit capitalize text-[11px]"
              aria-label={`Attendance status ${att.status}`}
            >
              {att.status.replace(/_/g, ' ')}
            </Badge>
            {present && att.checkIn && <p className="text-lg font-semibold text-foreground">Logged in · {att.checkIn}{att.exceptionLabel ? ` · ${att.exceptionLabel}` : ''}</p>}
            {checkedOut && att.checkOut && <p className="text-lg font-semibold text-foreground">Logged off · {att.checkOut}</p>}
            {notCheckedIn && <p className="text-lg font-semibold text-foreground">Not logged in</p>}
            {att.status === 'on_leave' && <p className="text-sm text-muted-foreground">On leave</p>}
            {att.status === 'holiday' && <p className="text-sm text-muted-foreground">Holiday</p>}
            <div className="mt-auto flex">
              {!present ? (
                <Button size="sm" className="h-7 w-full" onClick={() => setShowLoginDialog(true)} aria-label="Log in" disabled={checkedOut}>
                  <LogIn className="size-3.5" /> Log in
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="h-7 w-full" onClick={handleLogoff} aria-label="Log off">
                  <LogOut className="size-3.5" /> Log off
                </Button>
              )}
            </div>

            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
              <DialogContent className="sm:max-w-[380px]">
                <DialogHeader>
                  <DialogTitle>Log in</DialogTitle>
                  <DialogDescription>Where are you working from today?</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-2">
                  {[
                    { id: 'office', label: 'Office', icon: Building2 },
                    { id: 'wfh', label: 'Work from home', icon: Home },
                    { id: 'client', label: 'Client location', icon: MapPin },
                  ].map((opt) => {
                    const Icon = opt.icon
                    const selected = loginLocation === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLoginLocation(opt.id as typeof loginLocation)}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${selected ? 'border-primary bg-primary-soft text-foreground' : 'border-border bg-surface hover:bg-muted'}`}
                        aria-pressed={selected}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        <span className="text-sm font-medium">{opt.label}</span>
                        {selected && <span className="ml-auto size-2 rounded-full bg-primary" aria-hidden="true" />}
                      </button>
                    )
                  })}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowLoginDialog(false)}>Cancel</Button>
                  <Button onClick={handleLogin}>Log in</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Working Time */}
      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Clock className="size-3.5" aria-hidden="true" /> Working Time
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-2">
          <p className="text-2xl font-semibold tracking-tight text-foreground">{att?.workingMinutes !== undefined ? fmt(att.workingMinutes) : '--'}</p>
          <p className="text-xs text-muted-foreground">Today</p>
          {att?.workingMinutes !== undefined && <Progress value={Math.min(100, (att.workingMinutes / 480) * 100)} className="h-1.5" aria-label={`Working time ${fmt(att.workingMinutes)} of 8h`} />}
          <p className="text-[11px] text-muted-foreground">Attendance ≠ Timesheet. Presence vs allocation.</p>
        </CardContent>
      </Card>

      {/* Current Timer */}
      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Timer className="size-3.5" aria-hidden="true" /> Current Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-2">
          {timer ? (
            <>
              <p className="truncate text-sm font-medium text-foreground">{timer.workItemKey} · {timer.activity}</p>
              <p className="text-xs text-muted-foreground truncate">{timer.projectName}{timer.subProjectName ? ` / ${timer.subProjectName}` : ''}</p>
              <p className="text-2xl font-semibold tracking-tight text-foreground" aria-live="polite">
                {fmt(elapsed)}
              </p>
              <div className="mt-auto flex gap-2">
                <Button size="sm" variant="outline" className="h-7 flex-1" onClick={() => toast.info('Pause timer — PATCH /api/v1/timers/:id/pause')} aria-label="Pause timer">
                  <Pause className="size-3.5" /> Pause
                </Button>
                <Button size="sm" className="h-7 flex-1" onClick={() => toast.success('Timer stopped — POST /api/v1/timers/:id/stop')} aria-label="Stop timer">
                  <Square className="size-3.5" /> Stop
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">No active timer</p>
              <p className="text-xs text-muted-foreground">Start a timer when you begin work.</p>
              <Button size="sm" className="mt-auto h-7 w-fit" onClick={() => toast.info('Start timer — POST /api/v1/timers')} aria-label="Start timer">
                <Play className="size-3.5" /> Start timer
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Today's Logged Time */}
      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Clock className="size-3.5" aria-hidden="true" /> Today&apos;s Logged
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-2">
          <p className="text-2xl font-semibold tracking-tight text-foreground">{fmt(todayLogged)}</p>
          <p className="text-xs text-muted-foreground">{timesheet?.entriesCount ?? 0} entries</p>
          {timesheet?.today.targetMinutes && (
            <Progress value={Math.min(100, (todayLogged / timesheet.today.targetMinutes) * 100)} className="h-1.5" aria-label={`Logged ${fmt(todayLogged)} of ${fmt(timesheet.today.targetMinutes)}`} />
          )}
          <Button size="sm" variant="outline" className="mt-auto h-7 w-fit" onClick={() => navigate('/timesheets/my')} aria-label="Open today log">
            View log
          </Button>
        </CardContent>
      </Card>

      {/* Timesheet */}
      {canTimesheet && timesheet && (
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" /> Timesheet
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-2">
            <p className="text-xs text-muted-foreground">This Week</p>
            <Badge variant={timesheet.status === 'approved' ? 'success' : timesheet.status === 'submitted' ? 'info' : 'warning'} className="w-fit capitalize">
              {timesheet.status}
            </Badge>
            <p className="text-sm font-medium text-foreground">{fmt(timesheet.week.totalMinutes)} · {timesheet.entriesCount} entries</p>
            <Button size="sm" className="mt-auto h-7 w-full" onClick={() => navigate('/timesheets/my')} aria-label="Open timesheet">
              Open timesheet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
