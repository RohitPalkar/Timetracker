import * as React from 'react'
import { Plus, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/feedback/empty-state'
import { ProjectMemberCard } from './project-member-card'
import { PROJECT_ROLE_OPTIONS } from '../member-options'
import type { ProjectMemberRecord } from '@/services'
import type { ProjectMemberRole, User } from '@/types'

export interface TeamMembersProps {
  members: ProjectMemberRecord[]
  users: User[]
  canManage?: boolean
  onAdd: (input: { userId: string; role: ProjectMemberRole; capacity: number }) => void
  onRemove: (userId: string) => void
  onRoleChange: (userId: string, role: ProjectMemberRole) => void
}

/** Team management panel — add / remove / re-role members. Reusable across tabs. */
export function TeamMembers({ members, users, canManage = true, onAdd, onRemove, onRoleChange }: TeamMembersProps) {
  const [adding, setAdding] = React.useState(false)
  const [userId, setUserId] = React.useState('')
  const [role, setRole] = React.useState<ProjectMemberRole>('developer')
  const [capacity, setCapacity] = React.useState(80)

  const available = users.filter((user) => !members.some((member) => member.userId === user.id))

  const reset = () => {
    setAdding(false)
    setUserId('')
    setRole('developer')
    setCapacity(80)
  }

  const handleAdd = () => {
    if (!userId) return
    onAdd({ userId, role, capacity })
    reset()
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold">
          Team <span className="font-normal text-muted-foreground">({members.length})</span>
        </CardTitle>
        {canManage && (
          <Button variant="outline" size="sm" onClick={() => setAdding((current) => !current)}>
            {adding ? 'Cancel' : (
              <>
                <Plus aria-hidden="true" /> Add member
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2 pt-1">
        {adding && (
          <div className="flex flex-col gap-2 rounded-xl border border-brand/20 bg-brand-soft/40 p-3 sm:flex-row sm:items-center">
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger className="flex-1" aria-label="Select member">
                <SelectValue placeholder="Choose a person…" />
              </SelectTrigger>
              <SelectContent>
                {available.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={role} onValueChange={(value) => setRole(value as ProjectMemberRole)}>
              <SelectTrigger className="w-full sm:w-44" aria-label="Select role">
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
            <Button type="button" onClick={handleAdd} disabled={!userId}>
              <UserPlus aria-hidden="true" /> Add
            </Button>
          </div>
        )}

        {members.length === 0 ? (
          <EmptyState
            compact
            icon={UserPlus}
            title="No team members"
            description="Add people to start assigning work."
          />
        ) : (
          members.map((member) => (
            <ProjectMemberCard
              key={member.userId}
              member={member}
              canManage={canManage}
              fixed={member.role === 'manager' || member.role === 'business_analyst'}
              onRoleChange={(nextRole) => onRoleChange(member.userId, nextRole)}
              onRemove={() => onRemove(member.userId)}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}