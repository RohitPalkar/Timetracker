import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatRelative } from '@/lib/formats'
import { StoryStatusBadge } from '../story-status-badge'
import { PriorityBadge } from '../priority-badge'
import { StoryPointsBadge } from '../story-points-badge'
import { IssueTypeBadge } from '../issue-type-badge'
import { AssigneeAvatar } from '../assignee-avatar-group'
import { useStoryMutations } from '../../planning-queries'
import { usePlanningUsers, usePlanningEpics } from '../../planning-queries'
import { usePlanning } from '@/store/planning'
import type { Story } from '@/types/agile'
import { toast } from 'sonner'

export interface StoryDetailDrawerProps {
  story: Story | null
  open: boolean
  onClose: () => void
}

export function StoryDetailDrawer({ story, open, onClose }: StoryDetailDrawerProps) {
  const usersQuery = usePlanningUsers()
  const epicsQuery = usePlanningEpics(usePlanning.getState().projectId)
  const mutations = useStoryMutations()

  if (!open || !story) return null

  const assignee = usersQuery.data?.find((u) => u.id === story.assigneeId)
  const epic = epicsQuery.data?.find((e) => e.id === story.epicId)

  const handleStatusChange = (status: Story['status']) => {
    mutations.move.mutate(
      { id: story.id, status },
      {
        onSuccess: () => toast.success(`Story moved to ${status.replace('_', ' ')}`),
        onError: () => toast.error('Failed to update status'),
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-border bg-surface shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="font-mono text-[12px] font-medium text-muted-foreground">{story.key}</span>
              <IssueTypeBadge type={story.storyType} />
            </div>
            <h2 className="text-[15px] font-semibold text-foreground">{story.title}</h2>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Status row */}
          <div className="mb-4 flex flex-wrap gap-2">
            <StoryStatusBadge status={story.status} />
            <PriorityBadge priority={story.priority} />
            <StoryPointsBadge points={story.points} />
            {epic && <Badge variant="warning">{epic.name}</Badge>}
          </div>

          {/* Fields */}
          <div className="mb-6 grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <span className="text-muted-foreground">Assignee</span>
              <div className="mt-0.5 flex items-center gap-2">
                <AssigneeAvatar userId={story.assigneeId} size="xs" />
                <span className="text-foreground">{assignee?.name ?? '—'}</span>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Story type</span>
              <p className="mt-0.5 capitalize text-foreground">{story.storyType}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Created</span>
              <p className="mt-0.5 text-foreground">{formatDate(story.createdAt)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Updated</span>
              <p className="mt-0.5 text-foreground">{formatRelative(story.updatedAt)}</p>
            </div>
            {story.dueDate && (
              <div>
                <span className="text-muted-foreground">Due date</span>
                <p className="mt-0.5 text-foreground">{formatDate(story.dueDate)}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {story.description && (
            <div className="mb-6">
              <h3 className="mb-1 text-[13px] font-medium text-foreground">Description</h3>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{story.description}</p>
            </div>
          )}

          {/* Acceptance criteria */}
          {story.acceptanceCriteria.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-1 text-[13px] font-medium text-foreground">Acceptance criteria</h3>
              <ul className="list-inside list-disc text-[13px] text-muted-foreground">
                {story.acceptanceCriteria.map((criterion, i) => (
                  <li key={i}>{criterion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Subtasks */}
          {story.subtasks.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-1 text-[13px] font-medium text-foreground">
                Subtasks ({story.subtasks.filter((s) => s.done).length}/{story.subtasks.length})
              </h3>
              <ul className="space-y-1 text-[13px]">
                {story.subtasks.map((sub) => (
                  <li key={sub.id} className="flex items-center gap-2">
                    <span className={sub.done ? 'text-success' : 'text-muted-foreground'}>
                      {sub.done ? '✓' : '○'}
                    </span>
                    <span className={sub.done ? 'text-muted-foreground line-through' : 'text-foreground'}>
                      {sub.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {story.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-1 text-[13px] font-medium text-foreground">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {story.tags.map((tag) => (
                  <Badge key={tag} variant="neutral" className="text-[11px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer — status actions */}
        <div className="flex flex-wrap gap-2 border-t border-border p-4">
          {story.status !== 'todo' && (
            <Button variant="outline" size="sm" onClick={() => handleStatusChange('todo')}>
              Move to Todo
            </Button>
          )}
          {story.status !== 'in_progress' && (
            <Button variant="outline" size="sm" onClick={() => handleStatusChange('in_progress')}>
              Start
            </Button>
          )}
          {story.status !== 'in_review' && (
            <Button variant="outline" size="sm" onClick={() => handleStatusChange('in_review')}>
              Review
            </Button>
          )}
          {story.status !== 'done' && (
            <Button variant="outline" size="sm" onClick={() => handleStatusChange('done')}>
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
