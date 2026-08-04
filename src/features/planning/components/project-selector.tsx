import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePlanning } from '@/store/planning'
import { usePlanningProjects } from '../planning-queries'

export interface ProjectSelectorProps {
  className?: string
}

/** Project scope selector for the Planning layout — drives every planning page. */
export function ProjectSelector({ className }: ProjectSelectorProps) {
  const projectId = usePlanning((state) => state.projectId)
  const setProjectId = usePlanning((state) => state.setProjectId)
  const projectsQuery = usePlanningProjects()

  const projects = projectsQuery.data ?? []

  return (
    <Select value={projectId ?? undefined} onValueChange={(value) => setProjectId(value === 'all' ? null : value)}>
      <SelectTrigger className={className} aria-label="Project" disabled={projectsQuery.isLoading && projects.length === 0}>
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All projects</SelectItem>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            <span className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-muted-foreground">{project.key}</span>
              <span className="truncate">{project.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}