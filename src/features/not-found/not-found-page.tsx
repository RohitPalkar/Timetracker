import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/constants'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-2xl font-bold text-primary">
        404
      </span>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Page not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has moved.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild>
          <Link to="/dashboard">Go to dashboard</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/">{APP_NAME} home</Link>
        </Button>
      </div>
    </div>
  )
}