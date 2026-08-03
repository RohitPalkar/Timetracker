import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-xl border px-4 py-3 text-sm [&>svg]:size-4 [&>svg]:shrink-0 [&>svg~*]:pl-3',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface text-foreground',
        info: 'border-info/25 bg-info-soft text-info-foreground [&>svg]:text-info',
        success: 'border-success/25 bg-success-soft text-success-foreground [&>svg]:text-success',
        warning: 'border-warning/30 bg-warning-soft text-warning-foreground [&>svg]:text-warning',
        danger: 'border-danger/25 bg-danger-soft text-danger-foreground [&>svg]:text-danger',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

const ICONS = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
}

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  onClose?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', onClose, children, ...props }, ref) => {
    const Icon = ICONS[variant ?? 'default']
    return (
      <div
        ref={ref}
        role={variant === 'danger' ? 'alert' : 'status'}
        className={cn(alertVariants({ variant }), 'flex items-start', className)}
        {...props}
      >
        <Icon className="mt-0.5" aria-hidden="true" />
        <div className="flex-1">{children}</div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss"
            className="rounded-md p-0.5 text-current opacity-60 transition-opacity hover:opacity-100"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    )
  },
)
Alert.displayName = 'Alert'

export { Alert, alertVariants }