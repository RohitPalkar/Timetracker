import * as React from 'react'
import { RefreshCw, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/feedback/error-state'
import { NotificationsDrawer } from '@/components/common/notifications-drawer'
import { useAuth } from '@/store/auth'
import { useDashboardFilters } from '@/store/dashboard'
import { useDashboard } from './dashboard-queries'
import { DashboardSkeleton } from './components/dashboard-skeleton'
import { DashboardHeader } from './components/dashboard-header'
import { CurrentStateGroup } from './components/current-state/current-state-group'
import { WorkSnapshot } from './components/work/work-snapshot'
import { AttentionGroup } from './components/attention/attention-group'
import { ContextSnapshot } from './components/context/context-snapshot'
import { resolveDashboardContext } from './dashboard-context'

function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] ?? full
}

/**
 * Dashboard — glanceable control surface (§1-4).
 * 4 zones max: Current State → Work → Attention → Context.
 * Capability-driven via Feature 01 auth, no persona selector.
 */
export function DashboardPage() {
  const { user, authUser, roles, permissions, activeOrganization } = useAuth()
  const { filters } = useDashboardFilters()
  const dashboardQuery = useDashboard(filters)
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)

  const context = React.useMemo(
    () => resolveDashboardContext({ roles, permissions, legacyRoleId: authUser?.roleId }),
    [roles, permissions, authUser?.roleId],
  )

  const payload = dashboardQuery.data
  const loading = dashboardQuery.isLoading
  const isError = dashboardQuery.isError
  const error = dashboardQuery.error as Error | null

  // Refresh after actions: simple refetch
  const handleRefresh = () => {
    void dashboardQuery.refetch()
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Header — §5 compact */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <DashboardHeader firstName={firstName(user?.name ?? authUser?.name ?? 'there')} orgName={activeOrganization?.name} />
        <div className="flex items-center gap-2 self-start">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} aria-label="Refresh dashboard" className="h-8">
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </Button>
          <Button variant="outline" size="icon" aria-label="Notifications" onClick={() => setNotificationsOpen(true)} className="size-8">
            <Bell className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* States — §25-28 */}
      {isError ? (
        <ErrorState
          title="We couldn't load your dashboard."
          description={error instanceof Error ? error.message : 'Something went wrong.'}
          onRetry={handleRefresh}
        />
      ) : !payload && loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="flex flex-col gap-4">
          {/* Zone 1 — Current State §6 compact, 16px gap */}
          <section aria-label="Current State">
            <CurrentStateGroup hrms={payload?.myHRMS ?? null} timesheet={payload?.myTimesheet ?? null} loading={loading} />
          </section>

          {/* Mobile priority: Attention before Work (§29). Use order utilities. */}
          <div className="flex flex-col gap-4">
            {/* Zone 3 — Attention (priority 2 on mobile) */}
            <section aria-label="Attention" className="order-2 sm:order-2">
              <AttentionGroup items={payload?.actionCenter ?? []} loading={loading} />
            </section>

            {/* Zone 2 — Work (priority 3 on mobile) */}
            <section aria-label="Work" className="order-3 sm:order-1">
              <WorkSnapshot
                context={context}
                myWork={payload?.myWork ?? null}
                myTeam={payload?.myTeam ?? null}
                management={payload?.management ?? null}
                qualityTrend={payload?.qualityTrend ?? []}
                loading={loading}
              />
            </section>

            {/* Zone 4 — Context Snapshot */}
            <section aria-label="Context Snapshot" className="order-4">
              <ContextSnapshot context={context} payload={payload ?? null} loading={loading} />
            </section>
          </div>

          {/* Partial failure hint — if one domain fails but payload exists, other zones remain usable */}
          {payload && (
            <p className="text-center text-[11px] text-muted-foreground">
              Generated at {new Date(payload.generatedAt).toLocaleString()} · Scope: {context.label} · {activeOrganization?.name}
            </p>
          )}
        </div>
      )}

      <NotificationsDrawer open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </div>
  )
}
