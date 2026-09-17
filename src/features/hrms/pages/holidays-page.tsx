import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDashboard } from '@/features/dashboard/dashboard-queries'
import { useAuth } from '@/store/auth'
import { personaForRole } from '@/config/dashboard-config'
import { useDashboardFilters } from '@/store/dashboard'

export function HolidaysPage() {
  const { authUser } = useAuth()
  const persona = personaForRole(authUser?.roleId)
  const { filters } = useDashboardFilters()
  const query = useDashboard(persona, filters)
  const holidays = query.data?.myHRMS.holidays ?? []
  return (
    <PageLayout header={<PageHeader title="Holidays" description="Upcoming holidays based on employee's applicable holiday calendar (location-aware)." breadcrumb={[{ label: 'HRMS' }, { label: 'Holidays' }]} />}>
      <Card><CardHeader><CardTitle className="text-sm">Upcoming</CardTitle></CardHeader><CardContent className="grid gap-2">{holidays.map((h) => <div key={h.date} className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2"><span className="text-sm font-medium text-foreground">{h.name}</span><span className="text-xs text-muted-foreground">{h.date} <Badge variant="neutral" className="ml-2 text-[11px]">{h.calendar}</Badge></span></div>)}{holidays.length === 0 && <p className="text-sm text-muted-foreground">No upcoming holidays.</p>}</CardContent></Card>
    </PageLayout>
  )
}
