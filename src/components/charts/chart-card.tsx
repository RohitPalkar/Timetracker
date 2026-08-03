import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface ChartLegendItem {
  label: string
  color: string
  value?: string | number
}

export interface ChartCardProps {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  legend?: ChartLegendItem[]
  className?: string
  contentClassName?: string
  children: React.ReactNode
}

export function ChartCard({
  title,
  description,
  actions,
  legend,
  className,
  contentClassName,
  children,
}: ChartCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      {(title || description || actions || legend) && (
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">{actions}</div>
          {legend && legend.length > 0 && (
            <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
              {legend.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
                  {item.label}
                  {item.value !== undefined && (
                    <span className="font-medium text-foreground">{item.value}</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </CardHeader>
      )}
      <CardContent className={cn('min-w-0 flex-1', contentClassName)}>{children}</CardContent>
    </Card>
  )
}

export interface ChartTooltipPayloadEntry {
  name?: string | number
  value?: string | number
  color?: string
  payload?: Record<string, unknown>
  dataKey?: string | number
}

export interface ChartTooltipProps {
  active?: boolean
  label?: string | number
  payload?: ChartTooltipPayloadEntry[]
  formatter?: (value: string | number, name: string | number) => React.ReactNode
  labelFormatter?: (label: string | number) => React.ReactNode
}

export function ChartTooltip({ active, label, payload, formatter, labelFormatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-xl border border-border bg-surface p-3 shadow-lg">
      {label !== undefined && (
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        {payload.map((entry, index) => (
          <div key={`${entry.dataKey ?? index}`} className="flex items-center gap-2 text-[13px]">
            <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden="true" />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto pl-4 font-semibold text-foreground">
              {formatter ? formatter(entry.value ?? '', entry.name ?? '') : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Axis tick style shared across charts — keeps gridlines subtle. */
export const chartAxisProps = {
  tickLine: false,
  axisLine: false,
  tick: {
    fontSize: 11,
    fill: 'var(--color-muted-foreground)',
    fontFamily: 'inherit',
  },
} as const