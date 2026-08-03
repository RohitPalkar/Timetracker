import { type LucideIcon, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { EmptyState } from '@/components/feedback/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { BreadcrumbItem } from '@/components/navigation/breadcrumb'
import { toast } from 'sonner'

export interface PlaceholderPageProps {
  title: string
  description: string
  icon?: LucideIcon
  breadcrumb?: BreadcrumbItem[]
  phase?: string
}

export function PlaceholderPage({
  title,
  description,
  icon: Icon = Sparkles,
  breadcrumb,
  phase = 'Phase 2',
}: PlaceholderPageProps) {
  const crumb: BreadcrumbItem[] = breadcrumb ?? [{ label: title }]
  return (
    <PageLayout
      header={
        <PageHeader
          title={title}
          description={description}
          breadcrumb={crumb}
          actions={
            <Button onClick={() => toast.info(`This module arrives in ${phase} — the foundation is ready.`)}>
              <Sparkles className="size-4" aria-hidden="true" />
              Request feature
            </Button>
          }
        />
      }
    >
      <div className="flex min-h-[480px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border-strong bg-surface/60 p-10">
        <EmptyState
          icon={Icon}
          title={`${title} is coming soon`}
          description={`The ${title.toLowerCase()} module ships in ${phase}. The routing, layout, and design system for it are already wired up.`}
        />
        <Badge variant="outline" className="gap-1.5 py-1.5">
          <Sparkles className="size-3.5 text-brand-500" aria-hidden="true" />
          Planned for {phase}
        </Badge>
      </div>
    </PageLayout>
  )
}