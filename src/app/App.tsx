import { RouterProvider } from 'react-router'
import { router } from '@/app/router/router'
import { AppProviders } from '@/app/providers/app-providers'
import { CommandPalette } from '@/components/common/command-palette'
import { Toaster } from '@/components/ui/sonner'

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
      <CommandPalette />
      <Toaster />
    </AppProviders>
  )
}