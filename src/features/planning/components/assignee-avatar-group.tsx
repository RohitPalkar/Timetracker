import * as React from 'react'
import { AvatarStack, UserAvatar } from '@/components/common/user-avatar'
import { usePlanningUsers } from '../planning-queries'

export interface AssigneeAvatarGroupProps {
  userIds: string[]
  max?: number
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

/** Avatar stack for issue assignees, resolved from the user directory. */
export function AssigneeAvatarGroup({ userIds, max = 3, size = 'xs', className }: AssigneeAvatarGroupProps) {
  const usersQuery = usePlanningUsers()

  const people = React.useMemo(() => {
    const byId = new Map((usersQuery.data ?? []).map((user) => [user.id, user]))
    return userIds
      .map((id) => byId.get(id))
      .filter((user): user is NonNullable<typeof user> => Boolean(user))
      .map((user) => ({ id: user.id, name: user.name, avatarUrl: user.avatarUrl }))
  }, [userIds, usersQuery.data])

  if (people.length === 0) return null

  return <AvatarStack people={people} max={max} size={size} className={className} />
}

export function AssigneeAvatar({ userId, size = 'sm' }: { userId?: string; size?: 'xs' | 'sm' | 'md' }) {
  const usersQuery = usePlanningUsers()
  const user = React.useMemo(
    () => usersQuery.data?.find((candidate) => candidate.id === userId),
    [usersQuery.data, userId],
  )
  if (!user) return null
  return <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size={size} showTooltip />
}
