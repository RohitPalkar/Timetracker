import { Outlet } from 'react-router'
import { APP_NAME, DEFAULT_ORG } from '@/constants'
import { ThemeToggle } from '@/components/common/theme-toggle'

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(249,115,22,0.08),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.06),transparent_55%)]"
        aria-hidden="true"
      />
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <svg viewBox="0 0 24 24" className="size-7" fill="none" aria-hidden="true">
              <path d="M12 3 4.5 6.6v10.8L12 21l7.5-3.6V6.6L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M8.5 10h7M8.5 14h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{DEFAULT_ORG}</p>
        </div>

        <main className="rounded-3xl border border-border bg-surface p-6 shadow-lg sm:p-8">
          <Outlet />
        </main>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME} · {DEFAULT_ORG}
        </p>
      </div>
    </div>
  )
}