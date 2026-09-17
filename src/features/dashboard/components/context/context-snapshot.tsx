import { Clock, Users, FolderKanban, TrendingUp, CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardPayload } from '@/types/dashboard'
import type { DashboardContext } from '../../dashboard-context'

function MiniMetric({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-subtle px-3 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function ContextSnapshot({
  context,
  payload,
  loading,
}: {
  context: DashboardContext
  payload: DashboardPayload | null
  loading?: boolean
}) {
  if (loading) return <Skeleton className="h-[140px] rounded-2xl" />
  if (!payload) return null

  // Common derived weekly time from myTimesheet
  const weekly = payload.myTimesheet?.week.totalMinutes ?? 0
  const weeklyHours = `${Math.floor(weekly / 60)}h ${weekly % 60}m`

  if (context.scope === 'personal') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm"><Clock className="size-4" /> Context — Weekly Time</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <MiniMetric label="Weekly Time" value={weeklyHours} hint="of 40h target" />
          <MiniMetric label="Quality" value={`${payload.qualityTrend[0]?.criticalOpen ?? 0} critical open`} hint="Last value" />
        </CardContent>
      </Card>
    )
  }

  if (context.scope === 'team') {
    const team = payload.myTeam
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm"><Users className="size-4" /> Context — Team Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-3">
          <MiniMetric label="Team Attendance" value={`${team?.attendance.present ?? 14} / ${team ? team.members.length : 16} checked in`} />
          <MiniMetric label="Weekly Time" value={weeklyHours} />
          <MiniMetric label="Leave Pending" value={team?.leave.pending ?? 2} />
        </CardContent>
      </Card>
    )
  }

  if (context.scope === 'portfolio') {
    const total = payload.kpis.find((k) => k.id === 'projects')?.value ?? payload.kpis.length
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm"><FolderKanban className="size-4" /> Context — Delivery</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-3">
          <MiniMetric label="Active Projects" value={String(total)} />
          <MiniMetric label="Sprint Health" value="82% on track" hint="Planned vs completed" />
          <MiniMetric label="Open Bugs" value={payload.bugOwners.reduce((a, b) => a + b.open, 0)} hint={`${payload.bugOwners.reduce((a, b) => a + b.critical, 0)} critical`} />
        </CardContent>
      </Card>
    )
  }

  if (context.scope === 'workforce') {
    const people = payload.management?.peopleOverview
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm"><CalendarDays className="size-4" /> Context — Workforce</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-3">
          <MiniMetric label="Active Today" value={`${people?.active ?? 126} / ${people?.total ?? 142}`} />
          <MiniMetric label="On Leave" value={9 as unknown as string} hint="Today" />
          <MiniMetric label="Exceptions" value={7 as unknown as string} />
        </CardContent>
      </Card>
    )
  }

  // organization
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="size-4" /> Context — Portfolio</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-3">
        <MiniMetric label="Active Projects" value={payload.management?.portfolio.length ?? 8} />
        <MiniMetric label="Projects Needing Attention" value={2} />
        <MiniMetric label="Employees" value={payload.management?.peopleOverview?.total ?? 142} />
      </CardContent>
    </Card>
  )
}
