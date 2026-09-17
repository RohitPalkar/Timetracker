import { Link } from 'react-router'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AccessDeniedPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
        <Lock className="size-7" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">You don&apos;t have access to this area</h1>
        <p className="text-sm text-muted-foreground">
          Your current role and permissions don&apos;t allow you to view this page. You can return to the dashboard or
          continue working in the areas available to you.
        </p>
      </div>
      <Button asChild size="lg">
        <Link to="/dashboard">Go to Dashboard</Link>
      </Button>
      <p className="text-xs text-muted-foreground">If you believe this is an error, contact your administrator.</p>
    </div>
  )
}
