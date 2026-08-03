import * as React from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryProvider } from './query-provider'
import { ThemeProvider } from './theme-provider'
import { AuthProvider } from './auth-provider'
import { CommandPaletteProvider } from '@/store/command-palette'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <TooltipProvider delayDuration={200}>
          <AuthProvider>
            <CommandPaletteProvider>{children}</CommandPaletteProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}