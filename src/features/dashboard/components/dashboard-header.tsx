import * as React from 'react'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function DashboardHeader({
  firstName,
  orgName,
}: {
  firstName: string
  orgName?: string
}) {
  const now = React.useMemo(() => new Date(), [])
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        {greeting()}, <span className="font-medium text-foreground">{firstName}</span>
        <span className="mx-2 text-border">·</span>
        {formatDate(now)}
        {orgName ? (
          <>
            <span className="mx-2 text-border">·</span>
            <span className="inline-flex items-center rounded-full bg-surface-subtle px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {orgName}
            </span>
          </>
        ) : null}
      </p>
    </div>
  )
}
