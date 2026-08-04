import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { initials, cn } from '@/lib/utils'

const AVATAR_COLORS = [
  'bg-brand-100 text-brand-700',
  'bg-info-soft text-info-foreground',
  'bg-success-soft text-success-foreground',
  'bg-warning-soft text-warning-foreground',
  'bg-danger-soft text-danger-foreground',
]

export function colorForName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export interface UserAvatarProps {
  name: string
  avatarUrl?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showTooltip?: boolean
  className?: string
}

const SIZES = {
  xs: 'size-5 text-[9px]',
  sm: 'size-6 text-[10px]',
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm',
  xl: 'size-12 text-base',
}

export function UserAvatar({ name, avatarUrl, size = 'md', showTooltip, className }: UserAvatarProps) {
  const avatar = (
    <Avatar className={cn(SIZES[size], 'ring-2 ring-surface', className)}>
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={name} />
      ) : (
        <AvatarFallback className={cn('font-medium', colorForName(name))}>{initials(name)}</AvatarFallback>
      )}
    </Avatar>
  )

  if (!showTooltip) return avatar

  return (
    <Tooltip>
      <TooltipTrigger asChild>{avatar}</TooltipTrigger>
      <TooltipContent>{name}</TooltipContent>
    </Tooltip>
  )
}

export function AvatarStack({
  people,
  size = 'md',
  max = 4,
  className,
}: {
  people: Array<{ id: string; name: string; avatarUrl?: string }>
  size?: UserAvatarProps['size']
  max?: number
  className?: string
}) {
  const visible = people.slice(0, max)
  const overflow = people.length - visible.length
  return (
    <div className={cn('flex items-center -space-x-2', className)}>
      {visible.map((person) => (
        <UserAvatar key={person.id} name={person.name} avatarUrl={person.avatarUrl} size={size} showTooltip />
      ))}
      {overflow > 0 && (
        <Avatar className={cn(SIZES[size], 'ring-2 ring-surface bg-muted')}>
          <AvatarFallback className="bg-muted text-xs font-medium">+{overflow}</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}