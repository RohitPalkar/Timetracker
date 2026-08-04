import { type LucideIcon, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface ProjectModulePlaceholderProps {
  icon: LucideIcon
  label: string
  description: string
  phase?: string
}

/** Placeholder card for modules that arrive in later phases. */
export function ProjectModulePlaceholder({ icon: Icon, label, description, phase = 'Phase 2' }: ProjectModulePlaceholderProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-dashed border-border-strong bg-surface/60 p-4 transition-colors hover:border-border-strong/70">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <Badge variant="outline" className="ml-auto gap-1 py-0.5 text-[10px]">
          <Sparkles className="size-3 text-brand-500" aria-hidden="true" />
          {phase}
        </Badge>
      </div>
      <p className="text-[13px] leading-5 text-muted-foreground">{description}</p>
    </div>
  )
}
