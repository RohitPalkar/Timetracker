import { useParams } from 'react-router'
import { type LucideIcon, FolderKanban, GitBranch, BarChart3, FolderOpen, Settings2, Users, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { EmptyState } from '@/components/feedback/empty-state'
import { Badge } from '@/components/ui/badge'

export interface WorkspaceSectionProps {
  title: string
  description: string
  icon: LucideIcon
}

/** Generic placeholder for workspace sections not yet built (Overview, Teams, Reports, Files, Settings). */
export function WorkspaceSectionPlaceholder({ title, description, icon }: WorkspaceSectionProps) {
  return (
    <PageLayout
      header={<PageHeader title={title} description={description} breadcrumb={[{ label: title }]} />}
    >
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border-strong bg-surface/60 p-10">
        <EmptyState
          icon={icon}
          title={`${title} is coming soon`}
          description={`The ${title.toLowerCase()} workspace section will be built in a later phase. Routing, layout, and navigation are already wired up.`}
        />
        <Badge variant="outline" className="gap-1.5 py-1.5">
          <Sparkles className="size-3.5 text-brand-500" aria-hidden="true" />
          Phase 2
        </Badge>
      </div>
    </PageLayout>
  )
}

const SECTION_DATA: Record<string, { title: string; description: string; icon: LucideIcon }> = {
  overview: {
    title: 'Overview',
    description: 'Project health, summary, recent activity, and key metrics.',
    icon: FolderKanban,
  },
  'sub-projects': {
    title: 'Sub Projects',
    description: 'Break down the project into smaller scoped child projects.',
    icon: GitBranch,
  },
  teams: {
    title: 'Teams',
    description: 'Composition, roles, and capacity for the project team.',
    icon: Users,
  },
  reports: {
    title: 'Reports',
    description: 'Project-level analytics, burndown, and delivery insights.',
    icon: BarChart3,
  },
  files: {
    title: 'Files',
    description: 'Project document storage and attachments.',
    icon: FolderOpen,
  },
  settings: {
    title: 'Settings',
    description: 'Project configuration, details, and preferences.',
    icon: Settings2,
  },
}

/**
 * Renders a workspace section placeholder based on the :section route param
 * (overview, sub-projects, teams, reports, files, settings).
 */
export function WorkspaceSectionPage() {
  const { section } = useParams()
  const data = SECTION_DATA[section ?? ''] ?? SECTION_DATA.overview
  return <WorkspaceSectionPlaceholder {...data} />
}