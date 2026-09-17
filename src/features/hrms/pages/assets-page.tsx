import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDashboard } from '@/features/dashboard/dashboard-queries'
import { useAuth } from '@/store/auth'
import { personaForRole } from '@/config/dashboard-config'
import { useDashboardFilters } from '@/store/dashboard'

export function AssetsPage() {
  const { authUser } = useAuth()
  const persona = personaForRole(authUser?.roleId)
  const { filters } = useDashboardFilters()
  const query = useDashboard(persona, filters)
  const assets = query.data?.myHRMS.assets
  return (
    <PageLayout header={<PageHeader title="Assets" description="Allocated assets, status and return requirements." breadcrumb={[{ label: 'HRMS' }, { label: 'Assets' }]} />}>
      <Card><CardHeader><CardTitle className="text-sm">Allocated <Badge variant="neutral" className="ml-2">{assets?.allocated ?? 0}</Badge></CardTitle></CardHeader><CardContent className="grid gap-2">{assets?.items.map((a) => <div key={a.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2"><span className="text-sm font-medium text-foreground">{a.name} <span className="text-xs text-muted-foreground">• {a.type}</span></span><Badge variant={a.status === 'In Use' ? 'success' : 'neutral'} className="text-[11px]">{a.status}</Badge></div>)}</CardContent></Card>
    </PageLayout>
  )
}
