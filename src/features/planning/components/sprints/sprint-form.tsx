import * as React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSprintMutations } from '../../planning-queries'
import { usePlanning } from '@/store/planning'
import { toast } from 'sonner'
import type { Sprint } from '@/types/agile'

export interface SprintFormProps {
  open: boolean
  onClose: () => void
  sprint?: Sprint | null
}

export function SprintForm({ open, onClose, sprint }: SprintFormProps) {
  const projectId = usePlanning((s) => s.projectId)
  const mutations = useSprintMutations()

  const [name, setName] = React.useState('')
  const [goal, setGoal] = React.useState('')
  const [startDate, setStartDate] = React.useState('')
  const [endDate, setEndDate] = React.useState('')
  const [capacityHours, setCapacityHours] = React.useState(120)

  React.useEffect(() => {
    if (sprint) {
      setName(sprint.name)
      setGoal(sprint.goal ?? '')
      setStartDate(sprint.startDate)
      setEndDate(sprint.endDate)
      setCapacityHours(sprint.capacityHours)
    } else {
      setName('')
      setGoal('')
      setStartDate('')
      setEndDate('')
      setCapacityHours(120)
    }
  }, [sprint, open])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !startDate || !endDate) {
      toast.error('Name, start date, and end date are required')
      return
    }
    const input = {
      projectId: projectId!,
      name: name.trim(),
      goal: goal.trim() || undefined,
      startDate,
      endDate,
      capacityHours,
    }

    if (sprint) {
      mutations.update.mutate(
        { id: sprint.id, input },
        { onSuccess: () => { toast.success('Sprint updated'); onClose() }, onError: () => toast.error('Failed to update sprint') },
      )
    } else {
      mutations.create.mutate(input, {
        onSuccess: () => { toast.success('Sprint created'); onClose() },
        onError: () => toast.error('Failed to create sprint'),
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-[15px] font-semibold text-foreground">
            {sprint ? 'Edit sprint' : 'New sprint'}
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto p-4">
          <div className="space-y-4">
            <label className="block">
              <span className="text-[13px] font-medium text-foreground">Sprint name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-input bg-surface px-3 py-2 text-[13px] text-foreground outline-none focus-visible:outline-2 focus-visible:outline-ring"
                placeholder="e.g. Sprint 14"
                autoFocus
              />
            </label>

            <label className="block">
              <span className="text-[13px] font-medium text-foreground">Goal</span>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-xl border border-input bg-surface px-3 py-2 text-[13px] text-foreground outline-none focus-visible:outline-2 focus-visible:outline-ring"
                placeholder="What will this sprint achieve?"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[13px] font-medium text-foreground">Start date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-input bg-surface px-3 py-2 text-[13px] text-foreground outline-none"
                />
              </label>
              <label className="block">
                <span className="text-[13px] font-medium text-foreground">End date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-input bg-surface px-3 py-2 text-[13px] text-foreground outline-none"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-[13px] font-medium text-foreground">Capacity (hours)</span>
              <input
                type="number"
                min={0}
                value={capacityHours}
                onChange={(e) => setCapacityHours(Number(e.target.value))}
                className="mt-1 block w-full rounded-xl border border-input bg-surface px-3 py-2 text-[13px] text-foreground outline-none"
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={mutations.create.isPending || mutations.update.isPending}>
              {sprint ? 'Save changes' : 'Create sprint'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
