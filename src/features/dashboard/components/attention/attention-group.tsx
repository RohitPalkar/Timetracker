import { AlertTriangle, ArrowRight, Bug, CalendarCheck, Clock, FileText, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { ActionCenterItem } from '@/types/dashboard'
import { useNavigate } from 'react-router'

const ICON: Record<ActionCenterItem['type'], React.ComponentType<{ className?: string }>> = {
  attendance: CalendarCheck,
  timesheet: Clock,
  approval: AlertTriangle,
  bug: Bug,
  story: FileText,
  leave: CalendarCheck,
  document: FileText,
  onboarding: Users,
}

const TONE: Record<ActionCenterItem['priority'], 'danger' | 'warning' | 'neutral'> = {
  high: 'danger',
  medium: 'warning',
  low: 'neutral',
}

export function AttentionGroup({ items, loading }: { items: ActionCenterItem[]; loading?: boolean }) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
        <CardContent className="grid gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[64px] w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle className="size-4 text-success-foreground" /> My Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="rounded-xl border border-dashed bg-surface/60 px-4 py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up. No actions require your attention.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-warning/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="size-4 text-warning-foreground" aria-hidden="true" />
          Attention — My Actions
          <Badge variant="warning" className="ml-auto">{items.length} to review</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">What requires action or intervention? Each item drills into its module.</p>
      </CardHeader>
      <CardContent className="grid gap-2">
        {items.map((item) => {
          const Icon = ICON[item.type] ?? FileText
          return (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-muted-foreground" aria-hidden="true">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Badge variant={TONE[item.priority]} className="hidden capitalize sm:inline-flex">
                {item.priority}
              </Badge>
              <Button size="sm" variant="outline" className="h-7 shrink-0" onClick={() => navigate(item.href)} aria-label={`${item.ctaLabel} for ${item.title}`}>
                {item.ctaLabel} <ArrowRight className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
