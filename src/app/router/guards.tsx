import * as React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuthStore } from '@/store/auth'
import { Skeleton } from '@/components/ui/skeleton'
import type { PermissionKey } from '@/types/permission'

/** Full-page loading shown while auth is resolving (prevents content flash). */
function AuthLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  )
}

/** Requires an authenticated session — otherwise redirects to /login. */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const initialized = useAuthStore((s) => s.initialized)
  const location = useLocation()

  // While the session is being restored, don't flash login
  if (isLoading || !initialized) return <AuthLoading />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

/** Only reachable when signed out — authenticated users go to /dashboard. */
export function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const initialized = useAuthStore((s) => s.initialized)

  if (isLoading || !initialized) return <AuthLoading />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

/** Requires specific permissions — renders Outlet or Access Denied. */
export function RequirePermission({
  permissions,
  requireAll = false,
  fallback,
}: {
  permissions: PermissionKey[]
  requireAll?: boolean
  fallback?: React.ReactNode
}) {
  const can = useAuthStore((s) => s.can)
  const hasAll = useAuthStore((s) => s.hasAllPermissions)
  const isLoading = useAuthStore((s) => s.isLoading)
  const initialized = useAuthStore((s) => s.initialized)

  if (isLoading || !initialized) return <AuthLoading />

  const allowed = requireAll ? hasAll(permissions) : can(permissions[0] as PermissionKey) || permissions.some((p) => can(p))
  if (!allowed) {
    return fallback ? <>{fallback}</> : <Navigate to="/403" replace />
  }
  return <Outlet />
}

/** Auth bootstrap — runs once on app mount to rehydrate session safely. */
export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize)
  const initialized = useAuthStore((s) => s.initialized)
  React.useEffect(() => {
    if (!initialized) {
      void initialize()
    }
  }, [initialize, initialized])
  return <>{children}</>
}
