import { UserAvatar } from '@/components/common/user-avatar'
import { cn } from '@/lib/utils'

export interface UserChipProps {
  name: string
  avatarUrl?: string
  designation?: string
  size?: 'sm' | 'md'
  className?: string
}

export function UserChip({ name, avatarUrl, designation, size = 'md', className }: UserChipProps) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2', className)}>
      <UserAvatar name={name} avatarUrl={avatarUrl} size={size === 'sm' ? 'sm' : 'md'} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[13px] font-medium text-foreground">{name}</span>
        {designation && <span className="truncate text-xs text-muted-foreground">{designation}</span>}
      </span>
    </span>
  )
}