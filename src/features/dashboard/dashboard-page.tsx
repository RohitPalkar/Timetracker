import * as React from 'react'
import { Bell } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ErrorState } from '@/components/feedback/error-state'
import { NotificationsDrawer } from '@/components/common/notifications-drawer'
import { useAuth } from '@/store/auth'
import { useDashboardFilters } from '@/store/dashboard'
import { personaForRole, getDashboardConfig, DASHBOARD_PERSONAS, DASHBOARD_WIDGETS } from '@/config/dashboard-config'
import { useDashboard } from './dashboard-queries'
import { DASHBOARD_WIDGET_COMPONENTS } from './components/widget-registry'
import { DashboardFilters } from './components/dashboard-filters'
import { DashboardSkeleton } from './components/dashboard-skeleton'
import type { DashboardPersona } from '@/types/dashboard'

const ALL_PERSONAS = Object.values(DASHBOARD_PERSONAS)

export function DashboardPage() {
  const { authUser } = useAuth()
  const [persona, setPersona] = React.useState<DashboardPersona>(() => personaForRole(authUser?.roleId))
  const { filters, reset } = useDashboardFilters()

  const config = getDashboardConfig(persona)
  const dashboardQuery = useDashboard(persona, filters)

  const [notificationsOpen, setNotificationsOpen] = React.useState(false)

  const handlePersonaChange = (value: string) => {
    setPersona(value as DashboardPersona)
    reset()
  }

  const coreWidgets = config.widgets.filter((id) => DASHBOARD_WIDGETS[id].section === 'core' && id !== 'kpi')
  const kpiWidgets = config.widgets.filter((id) => id === 'kpi')
  const additionalWidgets = config.widgets.filter((id) => DASHBOARD_WIDGETS[id].section === 'additional')
  const activityWidgets = config.widgets.filter((id) => DASHBOARD_WIDGETS[id].section === 'activity')

  const payload = dashboardQuery.data
  const loading = dashboardQuery.isLoading

  return (
    <PageLayout
      header={
        <PageHeader
          title={config.title}
          description={config.description}
          breadcrumb={[{ label: 'Dashboard' }]}
          actions={
            <>
              <Select value={persona} onValueChange={handlePersonaChange}>
                <SelectTrigger className="w-[170px]" aria-label="Dashboard persona">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_PERSONAS.map((personaConfig) => (
                    <SelectItem key={personaConfig.persona} value={personaConfig.persona}>
                      {personaConfig.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" aria-label="Notifications" onClick={() => setNotificationsOpen(true)}>
                <Bell className="size-4" aria-hidden="true" />
              </Button>
            </>
          }
        />
      }
      filters={<DashboardFilters config={config} />}
    >
      {dashboardQuery.isError ? (
        <ErrorState
          title="Could not load your dashboard"
          description={dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Something went wrong.'}
          onRetry={() => dashboardQuery.refetch()}
        />
      ) : !payload ? (
        <DashboardSkeleton />
      ) : (
        <div className="flex flex-col gap-6">
          {kpiWidgets.length > 0 && (
            <section aria-label="Key metrics">
              <KpiWidget data={payload} loading={loading} />
            </section>
          )}

          {coreWidgets.length > 0 && (
            <section aria-label="Core analytics" className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {coreWidgets.map((widgetId) => {
                const Widget = DASHBOARD_WIDGET_COMPONENTS[widgetId]
                return <Widget key={widgetId} data={payload} loading={loading} />
              })}
            </section>
          )}

          {additionalWidgets.length > 0 && (
            <section aria-label="Additional analytics" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {additionalWidgets.map((widgetId) => {
                const Widget = DASHBOARD_WIDGET_COMPONENTS[widgetId]
                const isFull = DASHBOARD_WIDGETS[widgetId].size === 'full'
                return (
                  <div key={widgetId} className={isFull ? 'md:col-span-2 xl:col-span-3' : undefined}>
                    <Widget data={payload} loading={loading} />
                  </div>
                )
              })}
            </section>
          )}

          {activityWidgets.length > 0 && (
            <section aria-label="Organization activity">
              <OrgActivity data={payload} loading={loading} />
            </section>
          )}
        </div>
      )}

      <NotificationsDrawer open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </PageLayout>
  )
}

const KpiWidget = DASHBOARD_WIDGET_COMPONENTS.kpi
const OrgActivity = DASHBOARD_WIDGET_COMPONENTS['org-activity']
