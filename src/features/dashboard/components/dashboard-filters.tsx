import { CalendarRange, FolderKanban, RotateCcw, Sprout, Users } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardFilters } from '@/store/dashboard'
import { useDashboardFilterOptions } from '../dashboard-queries'
import { DATE_RANGE_OPTIONS } from '@/config/dashboard-config'
import type { DashboardPersonaConfig } from '@/types/dashboard'

export function DashboardFilters({ config }: { config: DashboardPersonaConfig }) {
  const { filters, setProject, setTeam, setDateRange, setSprint, reset, isDefault } = useDashboardFilters()
  const optionsQuery = useDashboardFilterOptions()

  const projects = optionsQuery.data?.projects ?? []
  const teams = optionsQuery.data?.teams ?? []
  const sprints = optionsQuery.data?.sprints ?? []

  return (
    <div className="flex flex-wrap items-center gap-2">
      {config.filters.project && (
        <Select value={filters.projectId} onValueChange={setProject}>
          <SelectTrigger className="w-[220px]" aria-label="Project">
            <FolderKanban className="size-4 text-muted-foreground" aria-hidden="true" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{project.key}</span>
                  {project.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {config.filters.team && (
        <Select value={filters.teamId} onValueChange={setTeam}>
          <SelectTrigger className="w-[220px]" aria-label="Team">
            <Users className="size-4 text-muted-foreground" aria-hidden="true" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All teams</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                <span className="flex items-center gap-2">
                  {team.name}
                  <span className="text-[11px] text-muted-foreground">{team.memberCount}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {config.filters.dateRange && (
        <Select value={filters.dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[160px]" aria-label="Date range">
            <CalendarRange className="size-4 text-muted-foreground" aria-hidden="true" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {config.filters.sprint && (
        <Select value={filters.sprintId} onValueChange={setSprint}>
          <SelectTrigger className="w-[200px]" aria-label="Sprint">
            <Sprout className="size-4 text-muted-foreground" aria-hidden="true" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sprints</SelectItem>
            {sprints.map((sprint) => (
              <SelectItem key={sprint.id} value={sprint.id}>
                <span className="flex items-center gap-2">
                  {sprint.name}
                  <span className="text-[11px] capitalize text-muted-foreground">{sprint.status}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!isDefault && (
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw aria-hidden="true" />
          Reset
        </Button>
      )}

      {optionsQuery.isLoading && <Skeleton className="h-10 w-[220px] rounded-xl" />}
    </div>
  )
}
