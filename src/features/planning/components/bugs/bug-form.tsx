import * as React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBugMutations } from '../../planning-queries'
import { usePlanning } from '@/store/planning'
import { toast } from 'sonner'
import type { Bug } from '@/types/agile'

export interface BugFormProps {
  open: boolean
  onClose: () => void
  bug?: Bug | null
}

const SEVERITY_OPTIONS: Array<{ value: Bug['severity']; label: string }> = [
  { value: 'blocker', label: 'Blocker' },
  { value: 'critical', label: 'Critical' },
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
  { value: 'trivial', label: 'Trivial' },
]

export function BugForm({ open, onClose, bug }: BugFormProps) {
  const projectId = usePlanning((s) => s.projectId)
  const mutations = useBugMutations()

  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [severity, setSeverity] = React.useState<Bug['severity']>('major')

  React.useEffect(() => {
    if (bug) {
      setTitle(bug.title)
      setDescription(bug.description)
      setSeverity(bug.severity)
    } else {
      setTitle('')
      setDescription('')
      setSeverity('major')
    }
  }, [bug, open])

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
      severity,
      reporterId: 'user-rohit',
    }

    if (bug) {
      mutations.update.mutate(
        { id: bug.id, input },
        { onSuccess: () => { toast.success('Bug updated'); onClose() }, onError: () => toast.error('Failed to update bug') },
      )
    } else {
      mutations.create.mutate(input, {
        onSuccess: () => { toast.success('Bug created'); onClose() },
        onError: () => toast.error('Failed to create bug'),
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-[15px] font-semibold text-foreground">
            {bug ? 'Edit bug' : 'Report a bug'}
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto p-4">
          <div className="space-y-4">
            <label className="block">
              <span className="text-[13px] font-medium text-foreground">Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-input bg-surface px-3 py-2 text-[13px] text-foreground outline-none focus-visible:outline-2 focus-visible:outline-ring"
                placeholder="What's the bug?"
                autoFocus
              />
            </label>

            <label className="block">
              <span className="text-[13px] font-medium text-foreground">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-xl border border-input bg-surface px-3 py-2 text-[13px] text-foreground outline-none focus-visible:outline-2 focus-visible:outline-ring"
                placeholder="Steps to reproduce, expected vs actual…"
              />
            </label>

            <label className="block">
              <span className="text-[13px] font-medium text-foreground">Severity</span>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Bug['severity'])}
                className="mt-1 block w-full rounded-xl border border-input bg-surface px-3 py-2 text-[13px] text-foreground outline-none"
              >
                {SEVERITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={mutations.create.isPending || mutations.update.isPending}>
              {bug ? 'Save changes' : 'Report bug'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
