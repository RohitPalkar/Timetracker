import { useNavigate } from 'react-router'
import { Building2, Check, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/store/auth'
import { APP_NAME } from '@/constants'

/**
 * Multi-organization foundation (§10).
 * If the authenticated user has exactly one active org, this page is never
 * shown — session-page auto-selects it. With 2+ orgs we render this picker.
 * Selection establishes the active organization context via AuthService.
 */
export function OrganizationSelectPage() {
  const navigate = useNavigate()
  const { organizations, activeOrganization, setActiveOrganization, membership, user } = useAuth()

  const handleSelect = (orgId: string) => {
    const ok = setActiveOrganization(orgId)
    if (ok) {
      navigate('/dashboard', { replace: true })
    }
  }

  // Single-org shortcut — shouldn't happen because session-page would have
  // auto-navigated, but handle defensively.
  if (organizations.length === 1) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-muted-foreground">You have access to one organization.</p>
        <Button onClick={() => navigate('/dashboard', { replace: true })}>Continue to {activeOrganization?.name}</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Choose your organization</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {user?.name ? `${user.name}, select` : 'Select'} the workspace you want to continue in.
        </p>
      </div>

      <div className="flex flex-col gap-3" role="list">
        {organizations.map((org) => {
          const isActive = activeOrganization?.id === org.id
          return (
            <button
              key={org.id}
              type="button"
              role="listitem"
              onClick={() => handleSelect(org.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-4 text-left shadow-xs transition-colors hover:border-primary/40 hover:bg-primary-soft/30 focus-visible:outline-2 focus-visible:outline-ring"
              aria-label={`Select organization ${org.name}`}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Building2 className="size-5" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold text-foreground">{org.name}</span>
                <span className="text-xs text-muted-foreground">
                  {isActive && membership ? membership.roles.join(', ').replace(/_/g, ' ') : org.domain ?? 'Workspace'}
                </span>
              </span>
              {isActive ? (
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-4" aria-hidden="true" />
                </span>
              ) : (
                <span className="text-xs font-medium text-primary">Select →</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-center">
        <p className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          You can switch organizations anytime from your profile.
        </p>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Signed in as {user?.email} · {APP_NAME}
      </p>
    </div>
  )
}
