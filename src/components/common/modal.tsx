import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface ModalProps extends Omit<React.ComponentProps<typeof DialogContent>, 'title'> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  footer?: React.ReactNode
  primaryLabel?: string
  secondaryLabel?: string
  onPrimary?: () => void
  onSecondary?: () => void
  primaryVariant?: 'default' | 'destructive'
  primaryLoading?: boolean
  primaryDisabled?: boolean
  hideFooter?: boolean
  contentClassName?: string
}

/**
 * Standard modal for create / edit / success / error flows.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  footer,
  primaryLabel = 'Save',
  secondaryLabel = 'Cancel',
  onPrimary,
  onSecondary,
  primaryVariant = 'default',
  primaryLoading = false,
  primaryDisabled = false,
  hideFooter = false,
  contentClassName,
  children,
  ...contentProps
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClassName} {...contentProps}>
        <DialogHeader>
          {icon && <div className="mb-1">{icon}</div>}
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {!hideFooter && (
          <DialogFooter>
            {footer ?? (
              <>
                <Button variant="outline" onClick={onSecondary ?? (() => onOpenChange(false))} disabled={primaryLoading}>
                  {secondaryLabel}
                </Button>
                <Button
                  variant={primaryVariant}
                  onClick={onPrimary}
                  loading={primaryLoading}
                  disabled={primaryDisabled}
                >
                  {primaryLabel}
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}