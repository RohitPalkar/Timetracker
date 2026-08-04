import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePlanning } from '@/store/planning'
import { usePlanningSprints } from '../planning-queries'

export interface SprintSelectorProps {
  className?: string
}

/** Sprint scope selector for the Planning layout. Disabled without a selected project. */
export function SprintSelector({ className }: SprintSelectorProps) {
  const projectId = usePlanning((state) => state.projectId)
  const sprintId = usePlanning((state) => state.sprintId)
  const setSprintId = usePlanning((state) => state.setSprintId)
  const sprintsQuery = usePlanningSprints(projectId)

  const sprints = sprintsQuery.data ?? []

  return (
    <Select
      value={sprintId ?? undefined}
      onValueChange={(value) => setSprintId(value === 'all' ? null : value)}
      disabled={!projectId}
    >
      <SelectTrigger className={className} aria-label="Sprint" disabled={!projectId}>
        <SelectValue placeholder={projectId ? 'Select sprint' : 'Select a project first'} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All sprints</SelectItem>
        {sprints.map((sprint) => (
          <SelectItem key={sprint.id} value={sprint.id}>
            <span className="flex items-center gap-2">
              <span className="truncate">{sprint.name}</span>
              <span className="text-[11px] capitalize text-muted-foreground">{sprint.status}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}