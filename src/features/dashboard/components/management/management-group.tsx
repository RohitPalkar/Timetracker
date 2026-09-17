import { FolderKanban, Rocket, Users, Banknote } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardPayload } from '@/types/dashboard'
import { useNavigate } from 'react-router'

export function ManagementGroup({ data, loading }: { data: DashboardPayload['management']; loading?: boolean }) {
  const navigate = useNavigate()
  if (loading) return <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-40" /><Skeleton className="h-40" /></div>
  if (!data) return null

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">Management & Operations</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><FolderKanban className="size-4" /> Project Portfolio <Badge variant="neutral" className="ml-auto">{data.portfolio.length}</Badge></CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            {data.portfolio.map((p) => (
              <button key={p.projectId} onClick={() => navigate(`/projects/${p.projectId}/overview`)} className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2 text-left hover:bg-surface">
                <span className="min-w-0"><p className="truncate text-sm font-medium text-foreground">{p.name}</p><p className="text-xs text-muted-foreground">{p.status} • {p.progress}%</p></span>
                <Badge variant={p.health === 'healthy' ? 'success' : p.health === 'at_risk' ? 'warning' : p.health === 'critical' ? 'danger' : 'info'} className="capitalize text-[11px]">{p.health}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Rocket className="size-4" /> Sprint Health</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            {data.sprintHealth.map((s) => {
              const total = s.planned
              const pct = total ? Math.round((s.completed / total) * 100) : 0
              return (
                <div key={s.sprintId} className="rounded-xl border border-border bg-surface-subtle px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{s.name} • {s.projectName}</p>
                  <p className="text-xs text-muted-foreground">{s.completed}/{s.planned} • {s.remaining} remaining</p>
                  <Progress value={pct} className="mt-1 h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Users className="size-4" /> People Overview</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            {data.peopleOverview ? (
              <>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl bg-surface-subtle px-2 py-3"><p className="text-xl font-semibold">{data.peopleOverview.total}</p><p className="text-xs text-muted-foreground">Total</p></div>
                  <div className="rounded-xl bg-success-soft px-2 py-3"><p className="text-xl font-semibold text-success-foreground">{data.peopleOverview.active}</p><p className="text-xs text-muted-foreground">Active</p></div>
                  <div className="rounded-xl bg-info-soft px-2 py-3"><p className="text-lg font-semibold text-info-foreground">{data.peopleOverview.newJoiners}</p><p className="text-xs text-muted-foreground">New joiners</p></div>
                  <div className="rounded-xl bg-warning-soft px-2 py-3"><p className="text-lg font-semibold text-warning-foreground">{data.peopleOverview.exits}</p><p className="text-xs text-muted-foreground">Exits</p></div>
                </div>
                <p className="text-[11px] text-muted-foreground">HR operations — onboarding, documents, workforce reporting (permission-scoped).</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No people data in current scope.</p>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Banknote className="size-4" /> Payroll Operations <Badge variant="outline" className="ml-auto text-[11px]">Payroll is separate bounded domain</Badge></CardTitle></CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Payroll processing status, attendance inputs, compensation changes and approvals belong to the Payroll domain, not the dashboard aggregation. Dashboard surfaces status only.</span>
            <Badge variant="neutral">API: /api/v1/payroll/*</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
