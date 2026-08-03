import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Info, AlertTriangle, CheckCircle2, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const bannerVariants = cva('flex w-full items-center gap-3 px-4 py-2.5 text-sm', {
  variants: {
    variant: {
      info: 'bg-info-soft text-info-foreground',
      success: 'bg-success-soft text-success-foreground',
      warning: 'bg-warning-soft text-warning-foreground',
      danger: 'bg-danger-soft text-danger-foreground',
    },
  },
  defaultVariants: { variant: 'info' },
})

const ICONS = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: XCircle }

export interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  title?: string
  onClose?: () => void
}

const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  ({ className, variant = 'info', title, onClose, children, ...props }, ref) => {
    const Icon = ICONS[variant ?? 'info']
    return (
      <div
        ref={ref}
        role={variant === 'danger' ? 'alert' : 'status'}
        className={cn(bannerVariants({ variant }), className)}
        {...props}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          {title && <p className="text-[13px] font-semibold">{title}</p>}
          <div className="text-[13px] opacity-90">{children}</div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss banner"
            className="rounded-md p-1 opacity-60 transition-opacity hover:opacity-100"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    )
  },
)
Banner.displayName = 'Banner'

export { Banner, bannerVariants }