import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export interface TagProps {
  children: React.ReactNode
  onRemove?: () => void
  className?: string
}

export function Tag({ children, onRemove, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-surface-subtle px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border',
        className,
      )}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${typeof children === 'string' ? children : 'tag'}`}
          onClick={onRemove}
          className="rounded-full p-0.5 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  )
}

export function TagList({ tags, onRemove, className }: { tags: string[]; onRemove?: (tag: string) => void; className?: string }) {
  if (tags.length === 0) return null
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {tags.map((tag) => (
        <Tag key={tag} onRemove={onRemove ? () => onRemove(tag) : undefined}>
          {tag}
        </Tag>
      ))}
    </div>
  )
}