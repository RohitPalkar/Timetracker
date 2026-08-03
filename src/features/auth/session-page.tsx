import * as React from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useAuth, SESSION_LOAD_MS } from '@/app/providers/auth-provider'
import { Skeleton } from '@/components/ui/skeleton'
import { APP_NAME } from '@/constants'

export function SessionPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [elapsed, setElapsed] = React.useState(0)

  React.useEffect(() => {
    const timer = window.setInterval(() => setElapsed((current) => current + 100), 100)
    return () => window.clearInterval(timer)
  }, [])

  React.useEffect(() => {
    if (isAuthenticated && elapsed >= SESSION_LOAD_MS) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, elapsed, navigate])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="relative flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <svg viewBox="0 0 24 24" className="size-7 animate-pulse" fill="none" aria-hidden="true">
            <path d="M12 3 4.5 6.6v10.8L12 21l7.5-3.6V6.6L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M8.5 10h7M8.5 14h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Setting things up</h2>
        <p className="text-sm text-muted-foreground">
          Signing you into {APP_NAME} — one moment…
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-2.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
    </div>
  )
}