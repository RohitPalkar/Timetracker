import * as React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStoryMutations, usePlanningEpics } from '../../planning-queries'
import { usePlanning } from '@/store/planning'
import type { Story, StoryPriority } from '@/types/agile'
import { toast } from 'sonner'

export interface StoryFormProps {
  open: boolean
  onClose: () => void
  /** Pass a story to edit; null/undefined for create. */
  story?: Story | null
}

export function StoryForm({ open, onClose, story }: StoryFormProps) {
  const projectId = usePlanning((s) => s.projectId)
  const epicsQuery = usePlanningEpics(projectId)
  const mutations = useStoryMutations()

  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [priority, setPriority] = React.useState<StoryPriority>('medium')
  const [points, setPoints] = React.useState(0)
  const [epicId, setEpicId] = React.useState('')
  const [tags, setTags] = React.useState('')

  React.useEffect(() => {
    if (story) {
      setTitle(story.title)
      setDescription(story.description)
      setPriority(story.priority)
      setPoints(story.points)
      setEpicId(story.epicId ?? '')
      setTags(story.tags.join(', '))
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setPoints(0)
      setEpicId('')
      setTags('')
    }
  }, [story, open])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    const input = {
      projectId: projectId!,
      title: title.trim(),
      description: description.trim(),
      priority,
      points,
      epicId: epicId || undefined,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }

    if (story) {
      mutations.update.mutate(
        { id: story.id, input },
        { onSuccess: () => { toast.success('Story updated'); onClose() }, onError: () => toast.error('Failed to update story') },
      )
    } else {
      mutations.create.mutate(input, {
        onSuccess: () => { toast.success('Story created'); onClose() },
        onError: () => toast.error('Failed to create story'),
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-[15px] font-semibold text-foreground">
            {story ? 'Edit story' : 'New story'}
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Title */}
            <label className="block">
              <span className="text-[13px] font-medium text-foreground">Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-input bg-surface px-3 py-2 text-[13px] text-foreground outline-none focus-visible:outline-2 focus-visible:outline-ring"
                placeholder="What needs to be done?"
                autoFocus
              />
            </label>

            {/* Description */}
            <label className="block">
              <span className="text-[13px] font-medium text-foreground">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-xl border border-input bg-surface px-3 py-2 text-[13px] text-foreground outline-none focus-visible:outline-2 focus-visible:outline-ring"
                placeholder="Add more detail…"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* Priority */}
              <label className="block">
                <span className="text-[13px] font-medium text-foreground">Priority</span>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as StoryPriority)}
                  className="mt-1 block w-full rounded-xl border border-input bg-surface px-3 py-2 text-[13px] text-foreground outline-none"
                >
                  <option value="highest">Highest</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="lowest">Lowest</option>
                </select>
              </label>

              {/* Points */}
              <label className="block">
                <span className="text-[13px] font-medium text-foreground">Story points</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="mt-1 block w-full rounded-xl border border-input bg-surface px-3 py-2 text-[13px] text-foreground outline-none"
                />
              </label>
            </div>

            {/* Epic */}
            <label className="block">
              <span className="text-[13px] font-medium text-foreground">Epic</span>
              <select
                value={epicId}
                onChange={(e) => setEpicId(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-input bg-surface px-3 py-2 text-[13px] text-foreground outline-none"
              >
                <option value="">None</option>
                {(epicsQuery.data ?? []).map((epic) => (
                  <option key={epic.id} value={epic.id}>
                    {epic.key} — {epic.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Tags */}
            <label className="block">
              <span className="text-[13px] font-medium text-foreground">Tags</span>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-input bg-surface px-3 py-2 text-[13px] text-foreground outline-none"
                placeholder="Comma-separated tags"
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={mutations.create.isPending || mutations.update.isPending}>
              {story ? 'Save changes' : 'Create story'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
