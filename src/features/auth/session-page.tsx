import * as React from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useAuth, SESSION_LOAD_MS } from '@/store/auth'
import { Skeleton } from '@/components/ui/skeleton'
import { APP_NAME } from '@/constants'

/**
 * Session bootstrap — runs after OTP verification.
 * Restores/validates the session, resolves organization context and
 * capabilities before entering the app shell (spec §6, §17).
 */
export function SessionPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, initialized, organizations, activeOrganization } = useAuth()
  const [elapsed, setElapsed] = React.useState(0)

  React.useEffect(() => {
    const timer = window.setInterval(() => setElapsed((c) => c + 100), 100)
    return () => window.clearInterval(timer)
  }, [])

  React.useEffect(() => {
    if (!isAuthenticated) return
    if (elapsed < SESSION_LOAD_MS) return

    // Multi-org decision (§10): auto-select if exactly one, otherwise prompt
    if (organizations.length === 0) {
      // No membership — show forbidden/empty state by staying here with message
      return
    }
    if (organizations.length > 1 && !activeOrganization) {
      navigate('/select-organization', { replace: true })
      return
    }
    if (organizations.length > 1 && activeOrganization) {
      // Defender: if active org not in list, force selector
      const valid = organizations.some((o) => o.id === activeOrganization.id)
      if (!valid) {
        navigate('/select-organization', { replace: true })
        return
      }
    }
    navigate('/dashboard', { replace: true })
  }, [isAuthenticated, elapsed, organizations, activeOrganization, navigate])

  // While auth is still initializing, show loading. If unauthenticated, bounce.
  if (!isLoading && !isAuthenticated) return <Navigate to="/login" replace />

  if (isAuthenticated && organizations.length === 0 && elapsed >= SESSION_LOAD_MS) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-lg font-semibold text-foreground">No workspace available</h2>
        <p className="text-sm text-muted-foreground">
          Your account has no active organization membership. Please contact your administrator.
        </p>
      </div>
    )
  }

  // Authenticated but waiting for org resolution — keep loading state
  if (isLoading || !initialized) {
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
          <p className="text-sm text-muted-foreground">Signing you into {APP_NAME} — one moment…</p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2.5">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Resolving your organization and permissions…
        </p>
      </div>
    )
  }

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
        <p className="text-sm text-muted-foreground">Signing you into {APP_NAME} — one moment…</p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-2.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
    </div>
  )
}
