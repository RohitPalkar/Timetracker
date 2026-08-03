import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DrawerProps extends Omit<React.ComponentProps<typeof SheetContent>, 'side' | 'size' | 'title'> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: React.ReactNode
  description?: React.ReactNode
  /** right (default) | large | bottom */
  variant?: 'right' | 'large' | 'bottom'
  footer?: React.ReactNode
  primaryLabel?: string
  secondaryLabel?: string
  onPrimary?: () => void
  onSecondary?: () => void
  primaryLoading?: boolean
  primaryDisabled?: boolean
  hideHeader?: boolean
  bodyClassName?: string
}

const VARIANT_MAP: Record<NonNullable<DrawerProps['variant']>, { side: 'right' | 'bottom'; size: 'md' | 'xl' | 'full' }> = {
  right: { side: 'right', size: 'md' },
  large: { side: 'right', size: 'xl' },
  bottom: { side: 'bottom', size: 'full' },
}

/**
 * Right / Large / Bottom drawer with a standard header and action footer.
 * Used later for Story, Bug, User, Project and Sprint editors.
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  variant = 'right',
  footer,
  primaryLabel = 'Save changes',
  secondaryLabel = 'Cancel',
  onPrimary,
  onSecondary,
  primaryLoading = false,
  primaryDisabled = false,
  hideHeader = false,
  bodyClassName,
  children,
  className,
  ...contentProps
}: DrawerProps) {
  const config = VARIANT_MAP[variant]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={config.side}
        size={config.size}
        className={cn('flex flex-col gap-0 p-0', variant === 'bottom' && 'max-h-[75vh] rounded-t-2xl', className)}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
        }}
        {...contentProps}
      >
        {!hideHeader && (
          <SheetHeader className="shrink-0 pr-12">
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        )}
        <div className={cn('flex-1 overflow-y-auto p-6', bodyClassName)}>{children}</div>
        {footer !== null && (
          <SheetFooter className="shrink-0">
            {footer ?? (
              <>
                <Button variant="outline" onClick={onSecondary} disabled={primaryLoading}>
                  {secondaryLabel}
                </Button>
                <Button onClick={onPrimary} loading={primaryLoading} disabled={primaryDisabled}>
                  {primaryLabel}
                </Button>
              </>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}