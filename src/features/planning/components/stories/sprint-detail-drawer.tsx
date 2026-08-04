import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Story } from '@/types/agile'

export interface SprintDetailDrawerProps {
  story: Story | null
  open: boolean
  onClose: () => void
}

export function SprintDetailDrawer({ story, open, onClose }: SprintDetailDrawerProps) {
  if (!open || !story) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <span className="font-mono text-[12px] text-muted-foreground">{story.key}</span>
            <h2 className="text-[15px] font-semibold text-foreground">{story.title}</h2>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 text-[13px]">
          <p className="text-muted-foreground">{story.description || 'No description.'}</p>
        </div>
      </div>
    </div>
  )
}
