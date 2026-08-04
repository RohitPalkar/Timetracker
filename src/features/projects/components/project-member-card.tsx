import { UserMinus } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { colorForName } from '@/components/common/user-avatar'
import { initials } from '@/lib/utils'
import type { ProjectMemberRecord } from '@/services'
import type { ProjectMemberRole, UserStatus } from '@/types'
import { PROJECT_ROLE_OPTIONS, roleLabel } from '../member-options'

const USER_STATUS_TONE: Record<UserStatus, 'success' | 'info' | 'neutral'> = {
  active: 'success',
  invited: 'info',
  suspended: 'neutral',
}

export interface ProjectMemberCardProps {
  member: ProjectMemberRecord
  /** Hides role editing and removal (read-only view). */
  canManage?: boolean
  fixed?: boolean
  onRoleChange?: (role: ProjectMemberRole) => void
  onRemove?: () => void
}

/** One team member row: avatar, name, role, allocation, status. */
export function ProjectMemberCard({ member, canManage = true, fixed = false, onRoleChange, onRemove }: ProjectMemberCardProps) {
  const user = member.user
  const statusTone = USER_STATUS_TONE[user.status]

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
      <Avatar className="size-9 shrink-0">
        <AvatarFallback className={colorForName(user.name)}>{initials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
          <Badge variant={statusTone} className="hidden sm:inline-flex">
            {user.status}
          </Badge>
        </div>
        <p className="truncate text-[13px] text-muted-foreground">
          {user.designation} · {roleLabel(member.role)}
        </p>
      </div>

      <div className="hidden w-28 shrink-0 md:block" aria-label="Allocation">
        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Allocation</span>
          <span className="font-medium text-foreground">{member.capacity}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-primary/70"
            style={{ width: `${Math.min(100, member.capacity)}%` }}
          />
        </div>
      </div>

      {canManage && !fixed && onRoleChange && (
        <Select value={member.role} onValueChange={(role) => onRoleChange(role as ProjectMemberRole)}>
          <SelectTrigger className="w-36 shrink-0" aria-label={`Role for ${user.name}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROJECT_ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {canManage && !fixed && onRemove && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${user.name}`}
              onClick={onRemove}
              className="shrink-0 text-muted-foreground hover:text-danger"
            >
              <UserMinus aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove from project</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
