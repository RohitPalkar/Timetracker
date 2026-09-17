import { ArrowRight, AlertTriangle, Clock, FileText, Bug, Users, CalendarCheck } from 'lucide-react'
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

export function ActionCenter({ items, loading }: { items: ActionCenterItem[]; loading?: boolean }) {
  const navigate = useNavigate()
  if (loading) return <Card><CardHeader><Skeleton className="h-5 w-40" /></CardHeader><CardContent className="grid gap-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</CardContent></Card>
  if (items.length === 0) return <Card><CardHeader><CardTitle className="text-sm">Attention & Actions</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">No actions require your attention.</CardContent></Card>

  return (
    <Card className="border-warning/30 bg-warning-soft/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="size-4 text-warning-foreground" />
          Attention & Actions
          <Badge variant="warning" className="ml-auto">{items.length} to review</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {items.map((item) => {
          const Icon = ICON[item.type] ?? FileText
          return (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-surface-subtle text-muted-foreground"><Icon className="size-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{item.title}</p>
                <p className="truncate text-[11px] text-muted-foreground">{item.description}</p>
              </div>
              <Badge variant={TONE[item.priority]} className="hidden sm:inline-flex capitalize">{item.priority}</Badge>
              <Button size="sm" variant="outline" className="h-7 shrink-0" onClick={() => navigate(item.href)}>
                {item.ctaLabel} <ArrowRight className="size-3.5" />
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
