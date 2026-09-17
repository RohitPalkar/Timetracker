import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { useDashboard } from '@/features/dashboard/dashboard-queries'
import { useAuth } from '@/store/auth'
import { personaForRole } from '@/config/dashboard-config'
import { useDashboardFilters } from '@/store/dashboard'
import { MyHRMSGroup } from '@/features/dashboard/components/hrms/my-hrms-group'
import { ErrorState } from '@/components/feedback/error-state'
import { Skeleton } from '@/components/ui/skeleton'

export function HRMSOverviewPage() {
  const { authUser } = useAuth()
  const persona = personaForRole(authUser?.roleId)
  const { filters } = useDashboardFilters()
  const query = useDashboard(persona, filters)

  if (query.isError) return <PageLayout header={<PageHeader title="HR Overview" breadcrumb={[{ label: 'HRMS' }, { label: 'Overview' }]} />}><ErrorState title="Could not load HRMS" description={query.error instanceof Error ? query.error.message : 'Something went wrong.'} onRetry={() => query.refetch()} /></PageLayout>
  if (!query.data) return <PageLayout header={<PageHeader title="HR Overview" breadcrumb={[{ label: 'HRMS' }]} />}><div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-40" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div></PageLayout>

  return (
    <PageLayout header={<PageHeader title="HR Overview" description="My HRMS — attendance, leave, holidays, documents, assets and requests. Presence vs time distinction is enforced." breadcrumb={[{ label: 'HRMS' }, { label: 'Overview' }]} />}>
      <MyHRMSGroup data={query.data.myHRMS} />
    </PageLayout>
  )
}
