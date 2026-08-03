import { Badge, type BadgeProps } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ProjectHealth, ProjectStatus, RagStatus } from '@/types'

/** Generic status → tone mapper. */
export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'surface'

const TONE_TO_VARIANT: Record<StatusTone, BadgeProps['variant']> = {
  neutral: 'neutral',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  brand: 'default',
  surface: 'surface',
}

export function StatusBadge({
  tone = 'neutral',
  dot = false,
  children,
  className,
}: {
  tone?: StatusTone
  dot?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <Badge variant={TONE_TO_VARIANT[tone]} dot={dot} className={className}>
      {children}
    </Badge>
  )
}

/* ------------------------------------------------------------------ */
/*  Domain-specific status mappings                                    */
/* ------------------------------------------------------------------ */

const PROJECT_HEALTH: Record<ProjectHealth, { tone: StatusTone; label: string }> = {
  healthy: { tone: 'success', label: 'Healthy' },
  on_track: { tone: 'info', label: 'On track' },
  at_risk: { tone: 'warning', label: 'At risk' },
  critical: { tone: 'danger', label: 'Critical' },
}

export function ProjectHealthBadge({ health, className }: { health: ProjectHealth; className?: string }) {
  const config = PROJECT_HEALTH[health]
  return (
    <StatusBadge tone={config.tone} dot className={className}>
      {config.label}
    </StatusBadge>
  )
}

const PROJECT_STATUS: Record<ProjectStatus, { tone: StatusTone; label: string }> = {
  active: { tone: 'success', label: 'Active' },
  planned: { tone: 'info', label: 'Planned' },
  completed: { tone: 'neutral', label: 'Completed' },
  archived: { tone: 'surface', label: 'Archived' },
  on_hold: { tone: 'warning', label: 'On hold' },
}

export function ProjectStatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const config = PROJECT_STATUS[status]
  return (
    <StatusBadge tone={config.tone} className={className}>
      {config.label}
    </StatusBadge>
  )
}

const RAG: Record<RagStatus, { tone: StatusTone; label: string }> = {
  green: { tone: 'success', label: 'Green' },
  amber: { tone: 'warning', label: 'Amber' },
  red: { tone: 'danger', label: 'Red' },
}

export function RagBadge({ status, className }: { status: RagStatus; className?: string }) {
  const config = RAG[status]
  return (
    <StatusBadge tone={config.tone} dot className={className}>
      {config.label}
    </StatusBadge>
  )
}

export function toneDot(tone: StatusTone): string {
  return cn({
    'bg-success': tone === 'success',
    'bg-warning': tone === 'warning',
    'bg-danger': tone === 'danger',
    'bg-info': tone === 'info',
    'bg-primary': tone === 'brand',
    'bg-muted-foreground': tone === 'neutral' || tone === 'surface',
  })
}