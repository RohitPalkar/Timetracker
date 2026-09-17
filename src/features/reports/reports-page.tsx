import { BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useDashboard } from '@/features/dashboard/dashboard-queries'
import { useAuth } from '@/store/auth'
import { personaForRole } from '@/config/dashboard-config'
import { useDashboardFilters } from '@/store/dashboard'
import { projectStore, sprintStore } from '@/services/stores'

export function ReportsPage() {
  const { authUser } = useAuth()
  const persona = personaForRole(authUser?.roleId)
  const { filters } = useDashboardFilters()
  const dashboardQuery = useDashboard(persona, filters)
  const payload = dashboardQuery.data
  const projects = projectStore.all()
  const sprints = sprintStore.all()

  return (
    <PageLayout header={<PageHeader title="Reports & Analytics" description="Sprint, budget and delivery analytics. Aggregates are derived from transactional data; expensive rollups may use materialized views." breadcrumb={[{ label: 'Reports & Analytics' }]} />}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="size-4" /> Projects</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{projects.length}</p><p className="text-xs text-muted-foreground">{projects.filter((p)=>p.status==='active').length} active • {projects.filter((p)=>p.health==='at_risk' || p.health==='critical').length} at risk</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Sprints</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{sprints.length}</p><p className="text-xs text-muted-foreground">{sprints.filter((s)=>s.status==='active').length} active • {sprints.filter((s)=>s.status==='completed').length} completed</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Utilization</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{payload ? Math.round(Number(payload.kpis.find((k)=>k.id==='utilization')?.value ?? 0)) : '—'}%</p><Progress value={Number(payload?.kpis.find((k)=>k.id==='utilization')?.value ?? 0)} className="mt-2 h-2" /></CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-sm">Project health</CardTitle></CardHeader><CardContent className="grid gap-2">{projects.slice(0,5).map((p) => <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2"><span className="text-sm font-medium text-foreground">{p.name}</span><Badge variant={p.health==='healthy'?'success':p.health==='at_risk'?'warning':p.health==='critical'?'danger':'info'}>{p.health}</Badge></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Budget consumption</CardTitle></CardHeader><CardContent className="grid gap-3">{projects.slice(0,4).map((p) => { const pct = p.budget ? Math.round((p.spent/p.budget)*100) : 0; return <div key={p.id}><div className="flex justify-between text-xs"><span className="font-medium text-foreground">{p.key}</span><span className="text-muted-foreground">{pct}%</span></div><Progress value={pct} className="mt-1 h-2" /></div> })}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Source of truth</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">Transactions remain source of truth. For large datasets, use DB views / materialized views / report caches as described in the architecture doc. Dashboard widgets and this page share the same aggregation service.</CardContent>
      </Card>
    </PageLayout>
  )
}
