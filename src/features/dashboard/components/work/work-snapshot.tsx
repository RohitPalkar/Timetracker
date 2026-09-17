import { Layers, Bug, Users, FolderKanban, Rocket, Building2, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { MyWorkPayload, DashboardPayload } from '@/types/dashboard'
import type { DashboardContext } from '../../dashboard-context'
import { useNavigate } from 'react-router'

function Stat({ label, value, tone = 'neutral' }: { label: string; value: number | string; tone?: 'neutral' | 'success' | 'warning' | 'danger' }) {
  const toneCls = tone === 'success' ? 'bg-success-soft text-success-foreground' : tone === 'warning' ? 'bg-warning-soft text-warning-foreground' : tone === 'danger' ? 'bg-danger-soft text-danger-foreground' : 'bg-surface-subtle text-foreground'
  return (
    <div className={`rounded-xl px-3 py-2.5 text-center ${toneCls}`}>
      <p className="text-lg font-semibold tracking-tight">{value}</p>
      <p className="text-[11px] font-medium opacity-80">{label}</p>
    </div>
  )
}

export function WorkSnapshot({
  context,
  myWork,
  myTeam,
  management,
  qualityTrend,
  loading,
}: {
  context: DashboardContext
  myWork: MyWorkPayload | null
  myTeam: DashboardPayload['myTeam']
  management: DashboardPayload['management']
  qualityTrend: DashboardPayload['qualityTrend']
  loading?: boolean
}) {
  const navigate = useNavigate()

  if (loading) return <Skeleton className="h-[220px] rounded-2xl" />

  // Derive counts from deterministic mock payload
  const personalCounts = myWork
    ? {
        inProgress: myWork.stories.filter((s) => s.status === 'in_progress').length + myWork.bugs.filter((b) => b.status !== 'resolved').length,
        dueToday: 2,
        overdue: 1,
        blocked: 1,
      }
    : null

  const qualityOpen = qualityTrend?.[qualityTrend.length - 1]?.criticalOpen ?? 2

  // Scope-driven rendering — compact, not a table wall
  if (context.scope === 'personal') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Layers className="size-4" aria-hidden="true" /> My Work
            {myWork?.sprint && <Badge variant="info" className="ml-auto gap-1 text-[11px]"><Rocket className="size-3" />{myWork.sprint.name}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {myWork && personalCounts ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="In Progress" value={personalCounts.inProgress} tone="neutral" />
              <Stat label="Due Today" value={personalCounts.dueToday} tone="warning" />
              <Stat label="Overdue" value={personalCounts.overdue} tone="danger" />
              <Stat label="Blocked" value={personalCounts.blocked} tone="neutral" />
            </div>
          ) : (
            <p className="rounded-xl border border-dashed bg-surface/60 px-3 py-6 text-center text-sm text-muted-foreground">No active work. Assigned work will appear here.</p>
          )}

          {myWork && (myWork.stories.length > 0 || myWork.bugs.length > 0) && (
            <div className="grid gap-2">
              {myWork.stories.slice(0, 2).map((item) => (
                <button key={item.id} onClick={() => navigate(`/projects/${item.projectId}`)} className="flex items-center gap-2 rounded-xl border border-border bg-surface-subtle px-3 py-2 text-left hover:bg-surface">
                  <Badge variant="neutral" className="font-mono text-[11px]">{item.key}</Badge>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{item.title}</span>
                  <Badge variant={item.priority === 'high' ? 'danger' : 'neutral'} className="capitalize text-[11px]">{item.priority}</Badge>
                </button>
              ))}
              {myWork.bugs.slice(0, 1).map((item) => (
                <button key={item.id} onClick={() => navigate(`/projects/${item.projectId}`)} className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger-soft/20 px-3 py-2 text-left">
                  <Bug className="size-3.5 text-danger" />
                  <Badge variant="neutral" className="font-mono text-[11px]">{item.key}</Badge>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{item.title}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" className="h-7" onClick={() => navigate('/projects')}>View My Work</Button>
            <Button size="sm" variant="outline" className="h-7" onClick={() => navigate('/projects')}>Open Project Management</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (context.scope === 'team') {
    const team = myTeam
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm"><Users className="size-4" /> Team Work</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Active" value={team ? team.members.length * 6 : 24} />
            <Stat label="Due Today" value={team?.leave.pending ?? 2} tone="warning" />
            <Stat label="Blocked" value={2} tone="danger" />
            <Stat label="Ready for QA" value={3} tone="success" />
          </div>
          {team && (
            <div className="flex flex-wrap gap-1.5">
              {team.members.slice(0, 4).map((m) => (
                <Badge key={m.id} variant={m.status === 'present' ? 'success' : m.status === 'on_leave' ? 'warning' : 'neutral'} className="capitalize text-[11px]">{m.name} · {m.status.replace('_', ' ')}</Badge>
              ))}
            </div>
          )}
          <Button size="sm" className="h-7 w-fit" onClick={() => navigate('/teams')}>View Team Work</Button>
        </CardContent>
      </Card>
    )
  }

  if (context.scope === 'portfolio') {
    const portfolio = management?.portfolio ?? []
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm"><FolderKanban className="size-4" /> Delivery</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Active Work" value={86} />
            <Stat label="Overdue" value={7} tone="danger" />
            <Stat label="Blocked" value={4} tone="warning" />
          </div>
          <div className="grid gap-1.5">
            {portfolio.slice(0, 3).map((p) => (
              <button key={p.projectId} onClick={() => navigate(`/projects/${p.projectId}`)} className="flex items-center gap-2 rounded-xl border border-border bg-surface-subtle px-3 py-2 text-left">
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
                <Badge variant={p.health === 'healthy' ? 'success' : p.health === 'at_risk' ? 'warning' : p.health === 'critical' ? 'danger' : 'neutral'} className="capitalize text-[11px]">{p.health.replace('_', ' ')}</Badge>
                <span className="text-xs text-muted-foreground">{p.progress}%</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-7" onClick={() => navigate('/projects')}>Open Project Management</Button>
            {qualityOpen > 0 && <Badge variant="danger" className="self-center">{qualityOpen} critical quality issues</Badge>}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (context.scope === 'workforce') {
    const people = management?.peopleOverview
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm"><Building2 className="size-4" /> Workforce</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Employees" value={people?.total ?? 142} />
            <Stat label="Active Today" value={people?.active ?? 126} tone="success" />
            <Stat label="On Leave" value={9} tone="warning" />
            <Stat label="Exceptions" value={7} tone="danger" />
          </div>
          <Button size="sm" className="h-7 w-fit" onClick={() => navigate('/hrms')}>Open HRMS</Button>
        </CardContent>
      </Card>
    )
  }

  // organization / executive / super_admin
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm"><Eye className="size-4" /> Organization</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Employees" value={management?.peopleOverview?.total ?? 142} />
          <Stat label="Active Projects" value={management?.portfolio.length ?? 8} />
          <Stat label="Needing Attention" value={2} tone="warning" />
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="h-7" onClick={() => navigate('/reports')}>View Reports</Button>
          <Button size="sm" variant="outline" className="h-7" onClick={() => navigate('/projects')}>View Portfolio</Button>
        </div>
      </CardContent>
    </Card>
  )
}
