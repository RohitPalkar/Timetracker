import type { ReactNode } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryProvider } from './query-provider'

/**
 * Global providers that need the component tree.
 * State lives in Zustand stores (auth, command palette) and needs no provider.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
    </QueryProvider>
  )
}