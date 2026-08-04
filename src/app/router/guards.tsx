import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/store/auth'

/** Requires an authenticated session — otherwise redirects to /login. */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

/** Only reachable when signed out — authenticated users go to /dashboard. */
export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}