import { ProjectModulePlaceholder } from '../components/project-module-placeholder'
import { LayoutDashboard } from 'lucide-react'
import { useProjectWorkspace } from '../components/project-workspace-context'

/**
 * Default workspace screen — routed at `/projects/:projectId/overview`.
 * Content (health, progress, budget, activity) ships in the Overview phase;
 * only the entry point and placeholder are established here.
 */
export function ProjectWorkspaceOverviewPage() {
  const { project } = useProjectWorkspace()
  return (
    <ProjectModulePlaceholder
      icon={LayoutDashboard}
      label="Project overview"
      description={`Overview of "${project.name}" with health, progress, budget and the latest activity will be available here.`}
      phase="Next phase"
    />
  )
}
