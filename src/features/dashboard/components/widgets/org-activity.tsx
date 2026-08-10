import { Activity, AlertTriangle, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/empty-state'
import { StatusBadge } from '@/components/common/status-badge'
import { formatRelative } from '@/lib/formats'
import { cn } from '@/lib/utils'
import type { DashboardActivityItem, DashboardAlert, DashboardRisk } from '@/types/dashboard'

export interface OrgActivityProps {
  risks: DashboardRisk[]
  alerts: DashboardAlert[]
  activity: DashboardActivityItem[]
  loading?: boolean
}

const SEVERITY_TONE = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
} as const

const ALERT_TONE = {
  critical: 'danger',
  warning: 'warning',
  info: 'info',
} as const

export function OrgActivityWidget({ risks, alerts, activity, loading }: OrgActivityProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <RiskCard risks={risks} loading={loading} />
      <AlertCard alerts={alerts} loading={loading} />
      <ActivityCard activity={activity} loading={loading} />
    </div>
  )
}

function RiskCard({ risks, loading }: { risks: DashboardRisk[]; loading?: boolean }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-warning" aria-hidden="true" />
          Risks
        </CardTitle>
        {!loading && <span className="text-xs text-muted-foreground">{risks.length} active</span>}
      </CardHeader>
      <CardContent className="min-w-0 flex-1">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : risks.length === 0 ? (
          <EmptyState title="No risks" description="Open risks will appear here." compact />
        ) : (
          <ul className="flex flex-col gap-3">
            {risks.map((risk) => (
              <li key={risk.id} className="rounded-xl border border-border bg-surface-muted/50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 text-[13px] font-medium leading-5 text-foreground">{risk.title}</p>
                  <StatusBadge tone={SEVERITY_TONE[risk.severity]} className="shrink-0">
                    {risk.severity}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {risk.projectName}
                  {risk.ownerName && ` · ${risk.ownerName}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function AlertCard({ alerts, loading }: { alerts: DashboardAlert[]; loading?: boolean }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-danger" aria-hidden="true" />
          Alerts
        </CardTitle>
        {!loading && <span className="text-xs text-muted-foreground">{alerts.length} today</span>}
      </CardHeader>
      <CardContent className="min-w-0 flex-1">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <EmptyState title="No alerts" description="System alerts will appear here." compact />
        ) : (
          <ul className="flex flex-col gap-3">
            {alerts.map((alert) => (
              <li key={alert.id} className="rounded-xl border border-border bg-surface-muted/50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 text-[13px] font-medium leading-5 text-foreground">{alert.title}</p>
                  <StatusBadge tone={ALERT_TONE[alert.severity]} className="shrink-0 capitalize">
                    {alert.type}
                  </StatusBadge>
                </div>
                {alert.body && <p className="mt-1 text-[11px] text-muted-foreground">{alert.body}</p>}
                <p className={cn('mt-1 text-[11px] text-muted-foreground', !alert.body && 'mt-2')}>{formatRelative(alert.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function ActivityCard({ activity, loading }: { activity: DashboardActivityItem[]; loading?: boolean }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-4 text-info" aria-hidden="true" />
          Recent activity
        </CardTitle>
        {!loading && <span className="text-xs text-muted-foreground">{activity.length} events</span>}
      </CardHeader>
      <CardContent className="min-w-0 flex-1">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <EmptyState title="No recent activity" description="Project activity will appear here." compact />
        ) : (
          <ul className="flex flex-col gap-3">
            {activity.map((item) => (
              <li key={item.id} className="flex flex-col gap-0.5">
                <p className="text-[13px] leading-5 text-foreground">
                  <span className="font-medium">{item.actorName}</span> {item.action}{' '}
                  <span className="font-medium">{item.target}</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {item.projectName} · {formatRelative(item.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
