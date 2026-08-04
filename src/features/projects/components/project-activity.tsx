import { DollarSign, Flag, MessageSquare, RefreshCw, Settings2, UserPlus, type LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { colorForName } from '@/components/common/user-avatar'
import { initials } from '@/lib/utils'
import { formatRelative } from '@/lib/formats'
import type { ProjectActivity, ProjectActivityType } from '@/types'

const ACTIVITY_ICON: Record<ProjectActivityType, LucideIcon> = {
  member: UserPlus,
  milestone: Flag,
  status: RefreshCw,
  budget: DollarSign,
  settings: Settings2,
  comment: MessageSquare,
}

export interface ProjectActivityProps {
  activity: ProjectActivity[]
  /** Resolves actor id → user name (and avatar initials). */
  actorName: (userId?: string) => string
  limit?: number
  className?: string
}

/** Recent activity feed for a project. */
export function ProjectActivity({ activity, actorName, limit }: ProjectActivityProps) {
  const items = limit ? activity.slice(0, limit) : activity

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-[13px] text-muted-foreground">No activity yet.</div>
    )
  }

  return (
    <ol className="space-y-4">
      {items.map((item) => {
        const Icon = ACTIVITY_ICON[item.type]
        const name = actorName(item.actorId)
        return (
          <li key={item.id} className="flex items-start gap-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Icon className="size-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 text-[13px] leading-5 text-foreground">
              <span className="flex items-center gap-2">
                <Avatar className="size-5 shrink-0">
                  <AvatarFallback className={colorForName(name)}>{initials(name)}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 truncate">
                  <span className="font-medium">{name}</span> {item.action}{' '}
                  {item.target && <span className="text-muted-foreground">{item.target}</span>}
                </span>
              </span>
              <p className="mt-1 text-xs text-muted-foreground">{formatRelative(item.createdAt)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** Activity wrapped in a card for the Overview tab. */
export function ProjectActivityCard({ activity, actorName, limit, className }: ProjectActivityProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        <ProjectActivity activity={activity} actorName={actorName} limit={limit} />
      </CardContent>
    </Card>
  )
}
