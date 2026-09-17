import * as React from 'react'
import { Bell, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/feedback/error-state'
import { NotificationsDrawer } from '@/components/common/notifications-drawer'
import { useAuth } from '@/store/auth'
import { useDashboardFilters } from '@/store/dashboard'
import { personaForRole, getDashboardConfig } from '@/config/dashboard-config'
import { useDashboard } from './dashboard-queries'
import { DashboardFilters } from './components/dashboard-filters'
import { DashboardSkeleton } from './components/dashboard-skeleton'
import { MyTimesheetGroup } from './components/timesheet/my-timesheet-group'
import { MyWorkGroup } from './components/work/my-work-group'

export function DashboardPage() {
  const { authUser } = useAuth()
  const persona = personaForRole(authUser?.roleId)
  const { filters } = useDashboardFilters()
  const config = getDashboardConfig(persona)
  const dashboardQuery = useDashboard(persona, filters)
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)

  const payload = dashboardQuery.data
  const loading = dashboardQuery.isLoading
  const isError = dashboardQuery.isError
  const error = dashboardQuery.error as Error | null

  return (
    <PageLayout
      header={
        <PageHeader
          title={config.title}
          description={config.description}
          breadcrumb={[{ label: 'Dashboard' }]}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => dashboardQuery.refetch()} disabled={loading} aria-label="Refresh dashboard">
                <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                Refresh
              </Button>
              <Button variant="outline" size="icon" aria-label="Notifications" onClick={() => setNotificationsOpen(true)}>
                <Bell className="size-4" aria-hidden="true" />
              </Button>
            </div>
          }
        />
      }
      filters={<DashboardFilters config={config} />}
    >
      {isError ? (
        <ErrorState title="Unable to load dashboard" description={error instanceof Error ? error.message : 'Something went wrong.'} onRetry={() => dashboardQuery.refetch()} />
      ) : !payload ? (
        <DashboardSkeleton />
      ) : (
        <div className="flex flex-col gap-6">
          {/* My Timesheet — login/logout & time info (kept on dashboard) */}
          <section aria-label="My Timesheet">
            <MyTimesheetGroup data={payload.myTimesheet} loading={loading} />
          </section>

          {/* My Work — stories, bugs, tasks, sprint (kept on dashboard) */}
          <section aria-label="My Work">
            <MyWorkGroup data={payload.myWork} loading={loading} />
          </section>

          <p className="text-center text-[11px] text-muted-foreground">
            HRMS moved to <span className="font-medium">HRMS</span> tab in navbar • Team & Management moved to Reports/HRMS • Generated at {new Date(payload.generatedAt).toLocaleString()}
          </p>
        </div>
      )}

      <NotificationsDrawer open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </PageLayout>
  )
}
